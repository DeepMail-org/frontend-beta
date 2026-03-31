"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { GeoPoint } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";

interface ThreatGlobeProps {
	geoPoints: GeoPoint[];
	size?: number;
}

export default function ThreatGlobe({
	geoPoints,
	size = 400,
}: ThreatGlobeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [hoveredPoint, setHoveredPoint] = useState<GeoPoint | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

	const pointsRef = useRef<Record<string, THREE.Mesh>>({});
	const globeGroupRef = useRef<THREE.Group>(null);

	useEffect(() => {
		if (!canvasRef.current || !containerRef.current) return;

		const width = size;
		const height = size;

		// --- Scene Setup ---
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			45,
			width / height,
			0.1,
			1000,
		);
		camera.position.z = 450;

		const renderer = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const globeGroup = new THREE.Group();
		scene.add(globeGroup);
		globeGroupRef.current = globeGroup;

		// --- Globe Sphere ---
		const globeRadius = 150;

		// Core sphere (dark translucent)
		const sphereGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
		const sphereMaterial = new THREE.MeshPhongMaterial({
			color: 0x0a0e19,
			transparent: true,
			opacity: 0.8,
			shininess: 50,
		});
		const mainSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		globeGroup.add(mainSphere);

		// Grid wireframe
		const gridGeometry = new THREE.SphereGeometry(globeRadius + 1, 32, 32);
		const gridMaterial = new THREE.MeshBasicMaterial({
			color: 0xc49aff,
			wireframe: true,
			transparent: true,
			opacity: 0.05,
		});
		const gridSphere = new THREE.Mesh(gridGeometry, gridMaterial);
		globeGroup.add(gridSphere);

		// Atmosphere Glow (using a slightly larger sphere)
		const glowGeometry = new THREE.SphereGeometry(
			globeRadius * 1.02,
			64,
			64,
		);
		const glowMaterial = new THREE.ShaderMaterial({
			transparent: true,
			uniforms: {
				glowColor: { value: new THREE.Color(0xbd93f9) },
				viewVector: { value: camera.position },
			},
			vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * vec3(0.0, 0.0, 1.0) );
          intensity = pow( 0.6 - dot(vNormal, vNormel), 2.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
			fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, intensity * 0.3 );
        }
      `,
			side: THREE.BackSide,
		});
		const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
		globeGroup.add(glowMesh);

		// --- Lights ---
		const ambientLight = new THREE.AmbientLight(0x404040, 2);
		scene.add(ambientLight);

		const pointLight = new THREE.PointLight(0xc49aff, 5, 500);
		pointLight.position.set(200, 200, 200);
		scene.add(pointLight);

		// --- Animation Loop ---
		let frameId: number;
		const animate = () => {
			frameId = requestAnimationFrame(animate);

			// Gentle auto-rotation
			if (globeGroup) {
				globeGroup.rotation.y += 0.002;
			}

			renderer.render(scene, camera);

			// Update Tooltip Position if a point is hovered
			if (hoveredPoint && pointsRef.current[hoveredPoint.id]) {
				const mesh = pointsRef.current[hoveredPoint.id];
				const vector = new THREE.Vector3();
				mesh.getWorldPosition(vector);
				vector.project(camera);

				const x = (vector.x * 0.5 + 0.5) * width;
				const y = (-vector.y * 0.5 + 0.5) * height;
				setTooltipPos({ x, y });
			}
		};
		animate();

		// --- Raycasting for Interactivity ---
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		const onPointerMove = (event: PointerEvent) => {
			const rect = canvasRef.current!.getBoundingClientRect();
			mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);
			const intersects = raycaster.intersectObjects(
				Object.values(pointsRef.current),
			);

			if (intersects.length > 0) {
				const object = intersects[0].object as THREE.Mesh;
				const point = geoPoints.find(
					(p) => p.id === object.userData.id,
				);
				if (point) {
					setHoveredPoint(point);
					document.body.style.cursor = "pointer";
				}
			} else {
				setHoveredPoint(null);
				document.body.style.cursor = "default";
			}
		};

		canvasRef.current.addEventListener("pointermove", onPointerMove);

		return () => {
			cancelAnimationFrame(frameId);
			if (canvasRef.current) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				canvasRef.current.removeEventListener(
					"pointermove",
					onPointerMove,
				);
			}
			renderer.dispose();
			scene.clear();
		};
	}, [size, geoPoints, hoveredPoint]);

	// Handle Updates to GeoPoints (3D Markers)
	useEffect(() => {
		if (!globeGroupRef.current) return;

		const globeRadius = 150;
		const currentPointIds = new Set(geoPoints.map((p) => p.id));

		// Remove old points
		Object.keys(pointsRef.current).forEach((id) => {
			if (!currentPointIds.has(id)) {
				globeGroupRef.current?.remove(pointsRef.current[id]);
				delete pointsRef.current[id];
			}
		});

		// Add new points
		geoPoints.forEach((point) => {
			if (!pointsRef.current[point.id]) {
				const phi = (90 - point.lat) * (Math.PI / 180);
				const theta = (point.lon + 180) * (Math.PI / 180);

				const x = -(
					(globeRadius + 20) *
					Math.sin(phi) *
					Math.cos(theta)
				);
				const z = (globeRadius + 8) * Math.sin(phi) * Math.sin(theta);
				const y = (globeRadius + 8) * Math.cos(phi);

				const riskColors: Record<string, number> = {
					Critical: 0xff6e84,
					Suspicious: 0xffb86c,
					Safe: 0x50fa7b,
				};
				const normalizedRisk =
					point.risk.charAt(0).toUpperCase() +
					point.risk.slice(1).toLowerCase();
				const color = riskColors[normalizedRisk] || 0xbd93f9;

				const dotGeo = new THREE.SphereGeometry(10, 16, 16);
				const dotMat = new THREE.MeshPhongMaterial({
					color,
					emissive: color,
					emissiveIntensity: 10,
				});
				const mesh = new THREE.Mesh(dotGeo, dotMat);
				mesh.position.set(x, y, z);
				mesh.userData = { id: point.id };

				// Add a glow ring around the dot
				const ringGeo = new THREE.RingGeometry(5, 7, 32);
				const ringMat = new THREE.MeshBasicMaterial({
					color,
					transparent: true,
					opacity: 0.4,
					side: THREE.DoubleSide,
				});
				const ring = new THREE.Mesh(ringGeo, ringMat);
				ring.lookAt(new THREE.Vector3(0, 0, 0));
				mesh.add(ring);

				globeGroupRef.current?.add(mesh);
				pointsRef.current[point.id] = mesh;

				// Smooth reveal and pulse animation
				mesh.scale.set(0, 0, 0);
				gsap.to(mesh.scale, {
					x: 1,
					y: 1,
					z: 1,
					duration: 1,
					ease: "elastic.out(1, 0.3)",
				});

				// Infinite pulse
				gsap.to(mesh.scale, {
					x: 1.3,
					y: 1.3,
					z: 1.3,
					duration: 0.8,
					repeat: -1,
					yoyo: true,
					ease: "sine.inOut",
				});
			}
		});
	}, [geoPoints]);

	return (
		<div
			ref={containerRef}
			className="relative flex items-center justify-center"
			style={{ height: size + 50 }}
		>
			{/* Floating Header */}
			<div className="absolute top-0 left-0 z-20 pointer-events-none">
				<p className="text-[10px] uppercase tracking-widest text-outline font-bold flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
					Neural Link: Established
				</p>
			</div>

			<canvas
				ref={canvasRef}
				className="cursor-grab active:cursor-grabbing outline-hidden"
			/>

			{/* Modern Tooltip using Motion */}
			<AnimatePresence>
				{hoveredPoint && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 10 }}
						className="absolute z-50 pointer-events-none"
						style={{
							left: tooltipPos.x,
							top: tooltipPos.y - 40,
							transform: "translate(-50%, -100%)",
						}}
					>
						<div className="bg-surface-container-highest/90 border border-outline-variant/30 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl min-w-[160px]">
							<div className="flex items-center justify-between mb-2">
								<span
									className={`text-[9px] font-bold uppercase tracking-wider ${
										hoveredPoint.risk.toLowerCase() ===
										"critical"
											? "text-error"
											: hoveredPoint.risk.toLowerCase() ===
														"suspicious" ||
												  hoveredPoint.risk.toLowerCase() ===
														"high"
												? "text-dracula-orange"
												: "text-tertiary"
									}`}
								>
									{hoveredPoint.risk}
								</span>
								<span className="text-[9px] text-outline px-1.5 py-0.5 bg-surface-container rounded-sm">
									{hoveredPoint.country}
								</span>
							</div>
							<p className="text-sm font-bold text-on-surface mb-1 font-mono">
								{hoveredPoint.value}
							</p>
							<div className="h-0.5 w-full bg-outline-variant/10 rounded-full overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: "100%" }}
									className="h-full bg-primary"
								/>
							</div>
						</div>
						{/* Tooltip Arrow */}
						<div className="w-3 h-3 bg-surface-container-highest/90 border-r border-b border-outline-variant/30 absolute left-1/2 -translate-x-1/2 -bottom-1.5 rotate-45" />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Decorative Overlays */}
			<div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-40">
				<div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
			</div>

			{geoPoints.length === 0 && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<p className="text-primary/20 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">
						Establishing Satellite Uplink...
					</p>
				</div>
			)}
		</div>
	);
}

"use client";
import React, { useEffect, useRef } from "react";
import { LiquidButton } from "./ui/liquid-glass-button";
import { LandingNavbar } from "./LandingNavbar";

export function LandingHero({ onUploadClick }: { onUploadClick: () => void }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// Custom video loop and fade with requestAnimationFrame
		const vid = videoRef.current;
		if (!vid) return;

		let animFrameId: number;

		vid.volume = 0; // Ensure muted

		const checkTime = () => {
			if (!vid) return;

			const duration = Number.isNaN(vid.duration) ? 10 : vid.duration;
			const cur = vid.currentTime;

			// Fade In
			if (cur < 0.5) {
				vid.style.opacity = String(Math.min(1, cur / 0.5));
			}
			// Fade Out in the last 0.5 seconds
			else if (cur > duration - 0.5 && duration > 0) {
				vid.style.opacity = String(Math.max(0, (duration - cur) / 0.5));
			}
			// Fully visible
			else {
				vid.style.opacity = "1";
			}

			// Loop logic
			if (cur >= duration - 0.05 && duration > 0) {
				vid.pause();
				setTimeout(() => {
					if (vid) {
						vid.currentTime = 0;
						vid.play()
							.then(() => {
								animFrameId = requestAnimationFrame(checkTime);
							})
							.catch((e) =>
								console.log("Autoplay prevented:", e),
							);
					}
				}, 100);
				return; // Stop current loop, will restart inside setTimeout
			}

			animFrameId = requestAnimationFrame(checkTime);
		};

		const tryPlay = () => {
			vid.play()
				.then(() => {
					// ensure it only runs once per play call
					cancelAnimationFrame(animFrameId);
					animFrameId = requestAnimationFrame(checkTime);
				})
				.catch((e) => {
					console.log("Autoplay prevented by browser:", e);
					cancelAnimationFrame(animFrameId);
					animFrameId = requestAnimationFrame(checkTime);
				});
		};

		if (vid.readyState >= 1) {
			tryPlay();
		} else {
			vid.addEventListener("loadedmetadata", tryPlay);
		}

		return () => {
			cancelAnimationFrame(animFrameId);
			vid.removeEventListener("loadedmetadata", tryPlay);
		};
	}, []);

	const logos = [
		{ name: "Vortex", letter: "V" },
		{ name: "Nimbus", letter: "N" },
		{ name: "Prysma", letter: "P" },
		{ name: "Cirrus", letter: "C" },
		{ name: "Kynder", letter: "K" },
		{ name: "Halcyn", letter: "H" },
	];

	return (
		<section className="relative min-h-screen flex flex-col pt-32 pb-10 overflow-hidden bg-[hsl(260,87%,3%)]">
			{/* Static Dark Background Layer underneath video */}
			<div className="absolute inset-0 z-0 bg-[hsl(260,87%,3%)]" />

			{/* Blurred overlay shape */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-[#05060A] blur-[82px] pointer-events-none z-0" />

			{/* Background Video with mix-blend-screen to remove black pixels and tint with background shape */}
			<video
				ref={videoRef}
				autoPlay
				className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 mix-blend-screen"
				src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
				playsInline
				muted
				crossOrigin="anonymous"
			/>

			{/* Center Content */}
			<div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 w-full max-w-5xl mx-auto mt-10">
				<h1 className="font-display font-normal text-[clamp(80px,18vw,220px)] leading-[1.02] tracking-[-0.024em] mb-2 flex">
					<span className="text-(--foreground)">DeepM</span>
					<span
						className="bg-clip-text text-transparent"
						style={{
							backgroundImage:
								"linear-gradient(to left, #6366f1, #a855f7, #fcd34d)",
						}}
					>
						ai
					</span>
					<span className="text-(--foreground)">l</span>
				</h1>

				<p className="text-[18px] text-[#D1D5DB] font-body opacity-80 leading-8 max-w-md mt-[9px]">
					The most powerful AI ever deployed
					<br />
					in email threat intelligence
				</p>

				<div className="mt-[25px] flex items-center justify-center">
					<ButtonWithIcon onConsultClick={onUploadClick} />
				</div>
			</div>
		</section>
	);
}

function ButtonWithIcon({ onConsultClick }: { onConsultClick: () => void }) {
	return (
		<button
			onClick={onConsultClick}
			className="relative text-[15px] font-medium rounded-full h-14 p-1 ps-8 pe-16 group transition-all duration-500 hover:ps-16 hover:pe-8 w-fit overflow-hidden cursor-pointer liquid-glass text-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
		>
			<span className="relative z-10 transition-all duration-500 group-hover:tracking-wider">
				Schedule a Consult
			</span>
			<div className="absolute right-1 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-52px)] group-hover:rotate-45">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="7" y1="17" x2="17" y2="7"></line>
					<polyline points="7 7 17 7 17 17"></polyline>
				</svg>
			</div>
		</button>
	);
}

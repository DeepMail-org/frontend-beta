"use client";

import { useEffect, useState, useRef } from "react";
import ThreatGraph, {
	ThreatGraphHandle,
} from "@/components/dashboard/ThreatGraph";
import GraphSidebar from "@/components/graph/GraphSidebar";
import { useThreatGraph } from "@/hooks/useThreatGraph";
import { getDashboard, getResults } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export default function InvestigationPage() {
	const {
		graphData,
		addEmailAnalysis,
		selectedNode,
		setSelectedNodeId,
		toggleNodeCollapse,
	} = useThreatGraph();

	const graphRef = useRef<ThreatGraphHandle>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	useEffect(() => {
		async function loadInitialData() {
			try {
				const dashboard = await getDashboard();
				// For each recent analysis, fetch full details to build the graph
				// In a real app, we might just fetch the IOCs or use a dedicated endpoint
				const detailPromises = dashboard.recent_analyses
					.slice(0, 10)
					.map((a) => getResults(a.id));
				const reports = await Promise.all(detailPromises);
				reports.forEach((report) => addEmailAnalysis(report));
			} catch (error) {
				console.error("Failed to load graph data", error);
			} finally {
				setIsLoading(false);
			}
		}
		loadInitialData();
	}, [addEmailAnalysis]);

	return (
		<main className="fixed inset-0 bg-[#06080f] overflow-hidden flex flex-col font-body">
			{/* HUD Header */}
			<header className="h-20 border-b border-white/5 flex items-center justify-between px-8 z-30 bg-[#06080f]/80 backdrop-blur-md">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all transform hover:-translate-x-1"
					>
						<span className="material-symbols-outlined text-sm">
							arrow_back
						</span>
					</Link>
					<div className="h-8 w-px bg-white/10" />
					<div>
						<h1 className="text-sm font-black tracking-[0.3em] uppercase text-white/90">
							Nexus{" "}
							<span className="text-primary italic">
								Workspace
							</span>
						</h1>
						<p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
							Investigative Threat Intelligence Graph
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
						<div className="w-2 h-2 rounded-full bg-dracula-green animate-pulse" />
						<span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
							Live Uplink Active
						</span>
					</div>
					<button className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all shadow-lg shadow-primary/10">
						<span className="material-symbols-outlined text-sm">
							filter_list
						</span>
					</button>
				</div>
			</header>

			{/* Main Canvas Area */}
			<div className="flex-1 relative">
				{isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
						<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
						<p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 animate-pulse">
							Initializing Neural Map...
						</p>
					</div>
				) : (
					<ThreatGraph
						ref={graphRef}
						graphData={graphData}
						width={dimensions.width}
						height={dimensions.height - 80}
						onNodeClick={(node) =>
							setSelectedNodeId(node?.id || null)
						}
					/>
				)}

				{/* Floating Controls */}
				<div className="absolute left-10 bottom-10 z-50 flex flex-col gap-4">
					<div className="bg-[#12141c] border border-white/10 p-2.5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-2 backdrop-blur-3xl">
						<button
							onClick={() => graphRef.current?.zoomIn()}
							className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/90 hover:bg-primary hover:text-on-primary transition-all bg-white/5 border border-white/5 group"
							title="Zoom In"
						>
							<span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
								add
							</span>
						</button>
						<div className="h-px bg-white/5 mx-2" />
						<button
							onClick={() => graphRef.current?.zoomOut()}
							className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/90 hover:bg-primary hover:text-on-primary transition-all bg-white/5 border border-white/5 group"
							title="Zoom Out"
						>
							<span className="material-symbols-outlined text-lg group-hover:scale-90 transition-transform">
								remove
							</span>
						</button>
					</div>
					<button
						onClick={() => graphRef.current?.center()}
						className="w-12 h-12 rounded-[22px] bg-primary text-on-primary flex items-center justify-center shadow-[0_10px_30px_rgba(0,184,212,0.3)] transform hover:scale-105 active:scale-95 transition-all border border-white/10 group"
						title="Center View"
					>
						<span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
							my_location
						</span>
					</button>
				</div>

				{/* Legend (Bottom Right) */}
				<div className="absolute right-8 bottom-8 z-20 flex gap-6 px-6 py-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 pointer-events-none">
					{[
						{ label: "Email", color: "#bd93f9" },
						{ label: "IP", color: "#8be9fd" },
						{ label: "Domain", color: "#50fa7b" },
						{ label: "URL", color: "#ffb86c" },
						{ label: "File", color: "#ff5555" },
					].map((item) => (
						<div
							key={item.label}
							className="flex items-center gap-2"
						>
							<div
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
								{item.label}
							</span>
						</div>
					))}
				</div>

				{/* Selection Sidebar */}
				<AnimatePresence>
					{selectedNode && (
						<GraphSidebar
							node={selectedNode}
							onClose={() => setSelectedNodeId(null)}
							onExpand={(id) => toggleNodeCollapse(id)}
						/>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}

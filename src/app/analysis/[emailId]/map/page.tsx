"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getResults } from "@/lib/api";
import type { EmailAnalysisReport, GeoMapPoint, HopTimelinePoint } from "@/lib/types";
import WorldMap from "@/components/map/WorldMap";
import IpSidebar from "@/components/map/IpSidebar";
import HopTimeline from "@/components/map/HopTimeline";

export default function MapPage() {
	const params = useParams();
	const emailId = params.emailId as string;

	const [report, setReport] = useState<EmailAnalysisReport | null>(null);
	const [points, setPoints] = useState<GeoMapPoint[]>([]);
	const [hops, setHops] = useState<HopTimelinePoint[]>([]);
	const [selected, setSelected] = useState<GeoMapPoint | null>(null);
	const [activeHop, setActiveHop] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		setSelected(null);
		setActiveHop(0);

		try {
			const data = await getResults(emailId);
			setReport(data);
			setPoints(data.geo_points ?? []);
			setHops(data.hop_timeline ?? []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load map data.");
			setReport(null);
			setPoints([]);
			setHops([]);
		} finally {
			setLoading(false);
		}
	}, [emailId]);

	useEffect(() => {
		void load();
	}, [load]);

	const riskCounts = useMemo(() => {
		return points.reduce(
			(acc, point) => {
				acc[point.risk] += 1;
				return acc;
			},
			{ critical: 0, high: 0, medium: 0, low: 0 },
		);
	}, [points]);

	const unresolvedCount = Math.max((report?.iocs.filter((ioc) => ioc.ioc_type === "ip").length ?? 0) - points.length, 0);
	const hasCandidates = points.length > 0;

	if (loading) {
		return (
			<div className="p-12 text-center text-outline animate-pulse font-bold tracking-widest uppercase">
				Initializing geolocation map...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 lg:p-12 max-w-4xl mx-auto">
				<div className="glass-panel rounded-xl p-8 text-center space-y-4">
					<span className="material-symbols-outlined text-4xl text-error">error</span>
					<h2 className="text-xl font-bold text-on-surface">Map loading failed</h2>
					<p className="text-sm text-on-surface-variant">{error}</p>
					<button
						onClick={() => void load()}
						className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-widest"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 lg:p-10 space-y-6 max-w-[1600px] mx-auto">
			<div className="flex items-center gap-2 text-xs text-on-surface-variant">
				<Link href="/" className="hover:text-primary transition-colors">
					Dashboard
				</Link>
				<span className="material-symbols-outlined text-xs">chevron_right</span>
				<Link href={`/analysis/${emailId}`} className="hover:text-primary transition-colors">
					Analysis
				</Link>
				<span className="material-symbols-outlined text-xs">chevron_right</span>
				<span className="text-on-surface font-bold">GeoIP Map</span>
			</div>

			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h2 className="text-3xl font-bold text-on-surface tracking-tight font-headline">
						Global <span className="text-primary">IP Geolocation</span>
					</h2>
					<p className="text-sm text-on-surface-variant mt-1">
						Real coordinates resolved from IOC IPs and received header hops.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{[
						{ key: "critical", label: "Critical", color: "#ff5555", count: riskCounts.critical },
						{ key: "high", label: "High", color: "#bd93f9", count: riskCounts.high },
						{ key: "medium", label: "Medium", color: "#ffb86c", count: riskCounts.medium },
						{ key: "low", label: "Low", color: "#50fa7b", count: riskCounts.low },
					].map((chip) => (
						<span
							key={chip.key}
							className="text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider flex items-center gap-2"
							style={{
								color: chip.color,
								borderColor: `${chip.color}50`,
								backgroundColor: `${chip.color}14`,
							}}
						>
							<span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chip.color }} />
							{chip.count} {chip.label}
						</span>
					))}
				</div>
			</div>

			{!hasCandidates ? (
				<div className="glass-panel rounded-xl p-10 text-center">
					<span className="material-symbols-outlined text-4xl text-outline/70">travel_explore</span>
					<h3 className="mt-3 text-lg font-bold text-on-surface">No IP addresses found</h3>
					<p className="mt-2 text-sm text-on-surface-variant">
						This report has no public IP indicators in IOC data or received headers.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-12 gap-6">
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						className="col-span-12 xl:col-span-8"
					>
						<div className="glass-panel rounded-xl p-3 md:p-4 space-y-3">
							<HopTimeline
								hops={hops}
								activeHop={activeHop}
								onChange={setActiveHop}
							/>
							<div className="h-[420px] md:h-[560px] lg:h-[640px]">
								<WorldMap
									points={points}
									selectedId={selected?.id ?? null}
									onSelect={(point) => setSelected(point)}
									hopPath={hops}
									activeHop={activeHop}
								/>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: 0.1 }}
						className="col-span-12 xl:col-span-4"
					>
						<IpSidebar
							emailId={emailId}
							selected={selected}
							totalPoints={points.length}
							unresolvedCount={unresolvedCount}
						/>
					</motion.div>
				</div>
			)}
		</div>
	);
}

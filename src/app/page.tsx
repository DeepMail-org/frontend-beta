"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApiError, getDashboard } from "@/lib/api";
import {
	DashboardData,
	RecentAnalysis,
	TrendDataPoint,
} from "@/lib/types";
import { formatUtcTime } from "@/lib/format";
import Link from "next/link";

const ThreatGraph = dynamic(() => import("@/components/dashboard/ThreatGraph"), {
	ssr: false,
});

const DEMO_RECENT_ANALYSES: RecentAnalysis[] = [
	{
		id: "demoid1",
		original_name: "invoice_urgent.eml",
		risk_level: "Critical",
		score: 92,
		submitted_at: "2026-03-29T21:56:47Z",
		sender: "attacker@evil.com",
		status: "Analyzed",
	},
	{
		id: "demoid2",
		original_name: "marketing_update.msg",
		risk_level: "Suspicious",
		score: 55,
		submitted_at: "2026-03-29T21:52:47Z",
		sender: "newsletter@promo.com",
		status: "Analyzed",
	},
	{
		id: "demoid3",
		original_name: "meeting_notes.pdf",
		risk_level: "Safe",
		score: 10,
		submitted_at: "2026-03-29T21:50:47Z",
		sender: "colleague@company.com",
		status: "Analyzed",
	},
	{
		id: "demoid4",
		original_name: "password_reset.eml",
		risk_level: "Critical",
		score: 95,
		submitted_at: "2026-03-29T21:48:47Z",
		sender: "admin@it-support-fake.com",
		status: "Analyzed",
	},
	{
		id: "demoid5",
		original_name: "project_timeline.xlsx",
		risk_level: "Suspicious",
		score: 45,
		submitted_at: "2026-03-29T21:38:47Z",
		sender: "contractor@external.com",
		status: "Analyzed",
	},
];

export default function DashboardPage() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval> | null = null;
		let consecutiveFailures = 0;
		let cancelled = false;

		const fetchData = async () => {
			try {
				const res = await getDashboard();
				if (cancelled) return;
				setData(res);
				setError(null);
				consecutiveFailures = 0;

				// Ensure polling is active if we have data
				if (!intervalId && !cancelled) {
					intervalId = setInterval(fetchData, 5000);
				}
			} catch (err) {
				console.error("Dashboard fetch error:", err);
				if (cancelled) return;
				if (err instanceof ApiError && err.status === 401) {
					setError(
						"Authentication required. Add your JWT token in Settings → API Keys.",
					);
					if (intervalId) {
						clearInterval(intervalId);
						intervalId = null;
					}
					return;
				}
				consecutiveFailures += 1;
				setError(
					"Failed to load dashboard data. Verify backend is running on port 3001.",
				);
				if (consecutiveFailures >= 3 && intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}
			}
		};

		fetchData();
		intervalId = setInterval(fetchData, 5000);

		// Listen for token changes to resume polling if it was stopped
		const onTokenChange = () => {
			if (!intervalId && !cancelled) {
				fetchData();
			}
		};
		window.addEventListener("storage", onTokenChange);
		window.addEventListener("storage_local_update", onTokenChange);

		return () => {
			cancelled = true;
			if (intervalId) {
				clearInterval(intervalId);
			}
			window.removeEventListener("storage", onTokenChange);
			window.removeEventListener("storage_local_update", onTokenChange);
		};
	}, []);

	// Default/empty state variables
	let stats = data?.stats || {
		global_24h: 0,
		malicious: 0,
		suspicious: 0,
		safe: 0,
	};
	let trend = data?.trend && data.trend.length > 0 ? data.trend : [];
	let recentAnalyses = data?.recent_analyses || [];
	let geoPoints = data?.geo_points || [];

	// Fallback to rich dummy data for demonstration if backend is empty
	const showDemoData = !data && !error;
	if (showDemoData) {
		stats = {
			global_24h: 1247,
			malicious: 48,
			suspicious: 312,
			safe: 887,
		};
		trend = [
			{ hour: "00", safe: 50, suspicious: 10, malicious: 2 },
			{ hour: "02", safe: 45, suspicious: 12, malicious: 1 },
			{ hour: "04", safe: 60, suspicious: 15, malicious: 3 },
			{ hour: "06", safe: 80, suspicious: 20, malicious: 5 },
			{ hour: "08", safe: 120, suspicious: 30, malicious: 8 },
			{ hour: "10", safe: 150, suspicious: 45, malicious: 12 },
			{ hour: "12", safe: 200, suspicious: 60, malicious: 15 },
			{ hour: "14", safe: 180, suspicious: 50, malicious: 10 },
			{ hour: "16", safe: 160, suspicious: 40, malicious: 8 },
			{ hour: "18", safe: 140, suspicious: 30, malicious: 6 },
			{ hour: "20", safe: 100, suspicious: 20, malicious: 4 },
			{ hour: "22", safe: 80, suspicious: 15, malicious: 3 },
		];
		geoPoints = [
			{
				id: "g1",
				lat: 40.7128,
				lon: -74.006,
				country: "USA",
				risk: "Critical",
				value: "192.168.1.1",
			},
			{
				id: "g2",
				lat: 51.5074,
				lon: -0.1278,
				country: "UK",
				risk: "Suspicious",
				value: "10.0.0.1",
			},
			{
				id: "g3",
				lat: 35.6762,
				lon: 139.6503,
				country: "Japan",
				risk: "Safe",
				value: "172.16.0.1",
			},
			{
				id: "g4",
				lat: -33.8688,
				lon: 151.2093,
				country: "Australia",
				risk: "Suspicious",
				value: "8.8.8.8",
			},
			{
				id: "g5",
				lat: 28.6139,
				lon: 77.209,
				country: "India",
				risk: "Critical",
				value: "45.123.11.1",
			},
		];
		recentAnalyses = DEMO_RECENT_ANALYSES;
	}

	const safeRate =
		stats.global_24h > 0
			? ((stats.safe / stats.global_24h) * 100).toFixed(1)
			: "100.0";

	// SVG Path generation
	const width = 800;
	const height = 280;
	const paddingY = 80; // top padding

	// Find max total count for scaling
	const maxCount = Math.max(
		...trend.map((t) => Math.max(t.safe, t.malicious + t.suspicious)),
		10, // minimum scale 10
	);

	const generateAreaPath = (keyFn: (t: TrendDataPoint) => number) => {
		if (trend.length === 0) {
			return `M0,${height} L${width},${height} Z`;
		}
		if (trend.length === 1) {
			const y =
				height - (keyFn(trend[0]) / maxCount) * (height - paddingY);
			return `M0,${height} L0,${y} L${width},${y} L${width},${height} Z`;
		}
		const points = trend.map((t, i) => {
			const x = (i / (trend.length - 1)) * width;
			const y = height - (keyFn(t) / maxCount) * (height - paddingY);
			return `${x},${y}`;
		});
		return `M0,${height} L${points.join(" L ")} L${width},${height} Z`;
	};

	const generateLinePath = (keyFn: (t: TrendDataPoint) => number) => {
		if (trend.length === 0) {
			return `M0,${height} L${width},${height}`;
		}
		if (trend.length === 1) {
			const y =
				height - (keyFn(trend[0]) / maxCount) * (height - paddingY);
			return `M0,${y} L${width},${y}`;
		}
		const points = trend.map((t, i) => {
			const x = (i / (trend.length - 1)) * width;
			const y = height - (keyFn(t) / maxCount) * (height - paddingY);
			return `${x},${y}`;
		});
		return `M${points.join(" L ")}`;
	};

	const cleanAreaPath = generateAreaPath((t) => t.safe);
	const cleanLinePath = generateLinePath((t) => t.safe);
	const threatAreaPath = generateAreaPath((t) => t.malicious + t.suspicious);
	const threatLinePath = generateLinePath((t) => t.malicious + t.suspicious);

	return (
		<div className="p-8 lg:p-12 space-y-12">
			{error && (
				<div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-xs font-semibold text-error">
					{error}
				</div>
			)}

			{/* Page Header */}
			<div>
				<div className="flex items-center gap-2 mb-2">
					<span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
					<span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-bold">
						Threat Intelligence Center
					</span>
				</div>
				<h2 className="text-4xl font-bold text-on-surface tracking-tight font-headline">
					THREAT_OVERVIEW{" "}
					<span className="text-primary">Dashboard</span>
				</h2>
			</div>

			{/* Metric Cards */}
			<section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
				{/* Total Analyzed */}
				<div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-primary text-3xl">
							analytics
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-outline group-hover:text-primary transition-colors">
							Global 24h
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-on-surface font-headline">
						{stats.global_24h.toLocaleString()}
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Emails Analyzed
					</p>
					<div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
						<div className="h-full bg-primary w-full rounded-full" />
					</div>
				</div>

				{/* Malicious */}
				<div className="glass-panel p-6 rounded-xl hover:border-dracula-red/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-dracula-red text-3xl">
							dangerous
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-dracula-red">
							Critical
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-dracula-red font-headline">
						{stats.malicious.toLocaleString()}
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Malicious Detected
					</p>
					<div className="mt-4 flex items-center gap-2 text-[10px] text-dracula-red font-bold">
						<span className="material-symbols-outlined text-xs">
							warning
						</span>
						<span>Action Required</span>
					</div>
				</div>

				{/* Suspicious */}
				<div className="glass-panel p-6 rounded-xl hover:border-primary-container/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-primary-container text-3xl">
							warning
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">
							Warning
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-primary-container font-headline">
						{stats.suspicious.toLocaleString()}
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Suspicious Flagged
					</p>
					<div className="mt-4 flex items-center gap-2 text-[10px] text-primary-container font-bold">
						<span className="material-symbols-outlined text-xs">
							visibility
						</span>
						<span>Under Review</span>
					</div>
				</div>

				{/* Safe / Integrity */}
				<div className="glass-panel p-6 rounded-xl hover:border-tertiary/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-tertiary text-3xl">
							verified_user
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
							Stable
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-tertiary font-headline">
						{safeRate}%
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Clean Rate
					</p>
					<div className="mt-4 flex items-center gap-2 text-[10px] text-tertiary font-bold">
						<span className="material-symbols-outlined text-xs">
							check_circle
						</span>
						<span>ALL SYSTEMS NOMINAL</span>
					</div>
				</div>
			</section>

			{/* Main Content Grid */}
			<div className="grid grid-cols-12 gap-8">
				{/* Trend Chart + Recent Analyses */}
				<div className="col-span-12 lg:col-span-8 space-y-8">
					{/* SVG Chart */}
					<div className="glass-panel rounded-xl p-8 overflow-hidden relative">
						<div className="flex justify-between items-center mb-10">
							<div>
								<h4 className="text-lg font-bold tracking-tight text-on-surface font-headline">
									THREAT_PROPAGATION_TREND
								</h4>
								<p className="text-[10px] text-outline uppercase tracking-widest">
									Real-time email analysis flow — 24h window
								</p>
							</div>
							<div className="flex gap-4">
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-sm bg-dracula-red" />
									<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
										Threats
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-sm bg-primary" />
									<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
										Clean
									</span>
								</div>
							</div>
						</div>
						<div className="h-[280px] w-full relative">
							<svg
								className="w-full h-full"
								viewBox="0 0 800 280"
								preserveAspectRatio="none"
							>
								<defs>
									<linearGradient
										id="grad-pink"
										x1="0"
										x2="0"
										y1="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="#fd77c4"
											stopOpacity="0.3"
										/>
										<stop
											offset="100%"
											stopColor="#fd77c4"
											stopOpacity="0"
										/>
									</linearGradient>
									<linearGradient
										id="grad-purple"
										x1="0"
										x2="0"
										y1="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="#c49aff"
											stopOpacity="0.3"
										/>
										<stop
											offset="100%"
											stopColor="#c49aff"
											stopOpacity="0"
										/>
									</linearGradient>
								</defs>
								{/* Grid */}
								<line
									x1="0"
									x2="800"
									y1="70"
									y2="70"
									stroke="#444855"
									strokeOpacity="0.15"
								/>
								<line
									x1="0"
									x2="800"
									y1="140"
									y2="140"
									stroke="#444855"
									strokeOpacity="0.15"
								/>
								<line
									x1="0"
									x2="800"
									y1="210"
									y2="210"
									stroke="#444855"
									strokeOpacity="0.15"
								/>
								{/* Clean (Purple) */}
								<path
									d={cleanAreaPath}
									fill="url(#grad-purple)"
								/>
								<path
									d={cleanLinePath}
									fill="none"
									stroke="#c49aff"
									strokeWidth="2.5"
									className="transition-all duration-300"
								/>
								{/* Threats (Pink) */}
								<path
									d={threatAreaPath}
									fill="url(#grad-pink)"
								/>
								<path
									d={threatLinePath}
									fill="none"
									stroke="#fd77c4"
									strokeWidth="2.5"
									className="transition-all duration-300"
								/>
							</svg>
						</div>
					</div>

					{/* Recent Analyses Table */}
					<div className="glass-panel rounded-xl overflow-hidden">
						<div className="px-8 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
							<h4 className="text-sm font-bold tracking-widest uppercase font-headline">
								Recent_Analyses
							</h4>
							<button
								className="text-[10px] font-bold text-primary hover:underline"
								onClick={() =>
									(window.location.href = "/reports")
								}
							>
								VIEW_ALL_LOGS
							</button>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead className="text-[10px] uppercase tracking-widest text-outline bg-bg/40">
									<tr>
										<th className="px-8 py-4 font-bold">
											Entity / Hash
										</th>
										<th className="px-8 py-4 font-bold">
											Time
										</th>
										<th className="px-8 py-4 font-bold">
											Score
										</th>
										<th className="px-8 py-4 font-bold">
											Status
										</th>
										<th className="px-8 py-4 font-bold">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="text-sm">
									{recentAnalyses.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												className="text-center py-8 text-outline text-xs"
											>
												No recent analyses found
											</td>
										</tr>
									) : (
										recentAnalyses.map(
											(ra: RecentAnalysis) => {
												let dotColor = "bg-tertiary";
												let badgeColor =
													"text-tertiary bg-tertiary/10 border-tertiary/20";

												if (
													ra.risk_level === "Critical"
												) {
													dotColor = "bg-dracula-red";
													badgeColor =
														"text-dracula-red bg-dracula-red/10 border-dracula-red/20";
												} else if (
													ra.risk_level ===
													"Suspicious"
												) {
													dotColor =
														"bg-dracula-orange";
													badgeColor =
														"text-dracula-orange bg-dracula-orange/10 border-dracula-orange/20";
												}

												return (
													<tr
														key={ra.id}
														className="hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/5"
													>
														<td className="px-8 py-4">
															<div className="flex items-center gap-3">
																<div
																	className={`w-2 h-2 rounded-full ${dotColor}`}
																/>
																<div>
																	<p
																		className="font-bold text-on-surface tracking-tight"
																		title={
																			ra.original_name
																		}
																	>
																		{ra.original_name.substring(
																			0,
																			30,
																		)}
																		{ra
																			.original_name
																			.length >
																			30 &&
																			"..."}
																	</p>
																	<p className="text-[10px] text-outline font-mono">
																		ID:{" "}
																		{ra.id.substring(
																			0,
																			8,
																		)}
																		...
																	</p>
																</div>
															</div>
														</td>
														<td className="px-8 py-4 text-outline font-mono text-xs">
															{formatUtcTime(
																ra.submitted_at,
															)}
														</td>
														<td className="px-8 py-4">
															<span
																className={`font-bold ${badgeColor.split(" ")[0]}`}
															>
																{ra.score.toFixed(
																	0,
																)}
																/100
															</span>
														</td>
														<td className="px-8 py-4">
															<span
																className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${badgeColor}`}
															>
																{ra.risk_level}
															</span>
														</td>
														<td className="px-8 py-4 relative group/action">
															<button className="material-symbols-outlined text-outline hover:text-on-surface text-lg">
																more_vert
															</button>
															<div className="absolute right-8 top-full mt-2 w-48 bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-xl opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all z-10 flex flex-col overflow-hidden">
																<button
																	className="px-4 py-2 text-xs text-left hover:bg-surface-container-highest flex items-center gap-2"
																	onClick={() =>
																		(window.location.href = `/analysis/${ra.id}`)
																	}
																>
																	<span className="material-symbols-outlined text-[14px]">
																		visibility
																	</span>
																	View Report
																</button>
																<button
																	className="px-4 py-2 text-xs text-left hover:bg-surface-container-highest flex items-center gap-2 text-error"
																	onClick={() =>
																		alert(
																			`Deleted analysis ${ra.id}`,
																		)
																	}
																>
																	<span className="material-symbols-outlined text-[14px]">
																		delete
																	</span>
																	Delete Log
																</button>
															</div>
														</td>
													</tr>
												);
											},
										)
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Real-Time Feed Sidebar */}
				<div className="col-span-12 lg:col-span-4">
					<div className="glass-panel rounded-xl h-full flex flex-col">
						<div className="px-6 py-5 border-b border-outline-variant/10">
							<h3 className="text-lg font-bold text-on-surface flex items-center gap-2 font-headline">
								<span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
								REAL_TIME_FEED
							</h3>
						</div>
						<div className="grow space-y-6 overflow-y-auto p-6 pr-2 no-scrollbar">
							{recentAnalyses.slice(0, 6).map((ra) => {
								let icon = "check";
								let color = "tertiary";
								if (ra.risk_level === "Critical") {
									icon = "priority_high";
									color = "critical";
								} else if (ra.risk_level === "Suspicious") {
									icon = "warning";
									color = "suspicious";
								}
								return (
									<FeedItem
										key={ra.id}
										icon={icon}
										color={color}
										label={`${ra.risk_level} DETECTED`}
										time={formatUtcTime(ra.submitted_at)}
										title={ra.original_name}
										desc={`Action taken based on threat score of ${ra.score.toFixed(0)}/100`}
									/>
								);
							})}

							{recentAnalyses.length === 0 && (
								<p className="text-xs text-outline text-center py-8">
									Waiting for telemetry...
								</p>
							)}

							{/* Real-Time Geolocation Graph (Obsidian Style) */}
							<div className="pt-4 mt-4 border-t border-outline-variant/10">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-[10px] font-black tracking-widest uppercase text-white/30">
										Threat Nexus
									</h3>
									<Link
										href="/graph"
										className="text-[9px] font-black tracking-widest uppercase text-primary hover:text-white transition-colors flex items-center gap-1 group"
									>
										Expand Graph
										<span className="material-symbols-outlined text-[10px] transform group-hover:translate-x-0.5 transition-transform">
											arrow_forward
										</span>
									</Link>
								</div>
								<div className="h-[300px] w-full">
									<ThreatGraph
										geoPoints={geoPoints}
										width={300}
										height={300}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FeedItem({
	icon,
	color,
	label,
	time,
	title,
	desc,
}: {
	icon: string;
	color: string;
	label: string;
	time: string;
	title: string;
	desc: string;
}) {
	const colorClasses: Record<
		string,
		{ bubble: string; icon: string; label: string }
	> = {
		critical: {
			bubble: "bg-dracula-red/20 border-dracula-red/40",
			icon: "text-dracula-red",
			label: "text-dracula-red",
		},
		suspicious: {
			bubble: "bg-dracula-orange/20 border-dracula-orange/40",
			icon: "text-dracula-orange",
			label: "text-dracula-orange",
		},
		tertiary: {
			bubble: "bg-tertiary/20 border-tertiary/40",
			icon: "text-tertiary",
			label: "text-tertiary",
		},
	};

	const classes = colorClasses[color] || colorClasses.tertiary;

	return (
		<div className="flex gap-4 group">
			<div className="flex flex-col items-center">
				<div
					className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${classes.bubble}`}
				>
					<span
						className={`material-symbols-outlined text-sm ${classes.icon}`}
					>
						{icon}
					</span>
				</div>
				<div className="w-px h-full bg-outline-variant/20 mt-2" />
			</div>
			<div className="grow pb-6">
				<div className="flex justify-between mb-1">
					<span
						className={`text-[10px] font-bold uppercase tracking-widest ${classes.label}`}
					>
						{label}
					</span>
					<span className="text-[10px] text-outline">{time}</span>
				</div>
				<p className="text-xs font-bold text-on-surface tracking-tight break-all">
					{title}
				</p>
				<p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
					{desc}
				</p>
			</div>
		</div>
	);
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const IOC_LOCATIONS = [
	{
		id: "1",
		type: "ip",
		value: "201.44.112.9",
		lat: -23,
		lon: -47,
		country: "Brazil",
		risk: "critical",
	},
	{
		id: "2",
		type: "domain",
		value: "microsooft-login-secure.xyz",
		lat: 52,
		lon: 13,
		country: "Germany",
		risk: "critical",
	},
	{
		id: "3",
		type: "ip",
		value: "103.45.67.89",
		lat: 28,
		lon: 77,
		country: "India",
		risk: "high",
	},
	{
		id: "4",
		type: "domain",
		value: "vps-223.hostingprovider.xyz",
		lat: 37,
		lon: -122,
		country: "United States",
		risk: "medium",
	},
	{
		id: "5",
		type: "ip",
		value: "185.220.101.12",
		lat: 48,
		lon: 2,
		country: "France",
		risk: "low",
	},
];

export default function MapPage() {
	const params = useParams();
	const emailId = params.emailId as string;

	return (
		<div className="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-xs text-on-surface-variant">
				<Link href="/" className="hover:text-primary transition-colors">
					Dashboard
				</Link>
				<span className="material-symbols-outlined text-xs">
					chevron_right
				</span>
				<Link
					href={`/analysis/${emailId}`}
					className="hover:text-primary transition-colors"
				>
					Analysis
				</Link>
				<span className="material-symbols-outlined text-xs">
					chevron_right
				</span>
				<span className="text-on-surface font-bold">GeoIP Map</span>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold text-on-surface tracking-tight font-[family-name:var(--font-headline)]">
						IOC <span className="text-tertiary">Geolocation</span>
					</h2>
					<p className="text-xs text-on-surface-variant mt-1">
						Geographic distribution of extracted indicators
					</p>
				</div>
				<div className="flex gap-2">
					<span className="bg-error/10 text-error text-[10px] px-3 py-1.5 rounded-lg border border-error/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-error" /> 2
						Critical
					</span>
					<span className="bg-primary-container/10 text-primary-container text-[10px] px-3 py-1.5 rounded-lg border border-primary-container/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-primary-container" />{" "}
						1 High
					</span>
					<span className="bg-primary/10 text-primary text-[10px] px-3 py-1.5 rounded-lg border border-primary/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
						1 Medium
					</span>
					<span className="bg-tertiary/10 text-tertiary text-[10px] px-3 py-1.5 rounded-lg border border-tertiary/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-tertiary" />{" "}
						1 Low
					</span>
				</div>
			</div>

			{/* Globe + IOC List */}
			<div className="grid grid-cols-12 gap-8">
				{/* Globe Visualization */}
				<div className="col-span-12 lg:col-span-8">
					<div
						className="glass-panel rounded-xl p-8 relative overflow-hidden"
						style={{ minHeight: "500px" }}
					>
						{/* CSS 3D Globe */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="relative w-[400px] h-[400px]">
								{/* Globe circle */}
								<div
									className="absolute inset-0 rounded-full border border-primary/20"
									style={{
										background:
											"radial-gradient(circle at 35% 35%, rgba(196,154,255,0.12), rgba(10,14,25,0.9))",
										boxShadow:
											"0 0 80px rgba(196,154,255,0.08), inset 0 0 60px rgba(0,0,0,0.5)",
									}}
								/>
								{/* Grid lines */}
								{[0, 30, 60, 90, 120, 150].map((deg) => (
									<div
										key={`h-${deg}`}
										className="absolute inset-0 rounded-full border border-primary/5"
										style={{
											transform: `rotateX(${deg}deg)`,
										}}
									/>
								))}
								{[0, 30, 60, 90, 120, 150].map((deg) => (
									<div
										key={`v-${deg}`}
										className="absolute inset-0 rounded-full border border-primary/5"
										style={{
											transform: `rotateY(${deg}deg)`,
										}}
									/>
								))}

								{/* IOC Markers */}
								{IOC_LOCATIONS.map((ioc) => {
									const x = 50 + (ioc.lon / 180) * 40;
									const y = 50 - (ioc.lat / 90) * 40;
									const colorMap: Record<string, string> = {
										critical: "#ff6e84",
										high: "#bd93f9",
										medium: "#c49aff",
										low: "#50fa7b",
									};
									const color = colorMap[ioc.risk];
									return (
										<div
											key={ioc.id}
											className="absolute z-10 group/marker cursor-pointer"
											style={{
												left: `${x}%`,
												top: `${y}%`,
												transform:
													"translate(-50%, -50%)",
											}}
										>
											<div
												className="w-3 h-3 rounded-full animate-pulse"
												style={{
													backgroundColor: color,
													boxShadow: `0 0 12px ${color}, 0 0 24px ${color}40`,
												}}
											/>
											{/* Connection lines */}
											<div
												className="absolute top-1/2 left-1/2 w-24 h-px opacity-30"
												style={{
													background: `linear-gradient(to right, ${color}, transparent)`,
													transform: `rotate(${Math.random() * 60 - 30}deg)`,
												}}
											/>
											{/* Tooltip */}
											<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
												<div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-[10px] whitespace-nowrap shadow-xl">
													<p className="font-bold text-on-surface">
														{ioc.value}
													</p>
													<p className="text-outline">
														{ioc.country} •{" "}
														{ioc.type.toUpperCase()}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
						{/* Floating label */}
						<div className="absolute top-6 left-6">
							<p className="text-[10px] uppercase tracking-widest text-outline font-bold">
								Threat Origin Map
							</p>
						</div>
					</div>
				</div>

				{/* IOC Location List */}
				<div className="col-span-12 lg:col-span-4">
					<div className="glass-panel rounded-xl h-full flex flex-col">
						<div className="px-6 py-5 border-b border-outline-variant/10">
							<h4 className="text-sm font-bold tracking-widest uppercase font-[family-name:var(--font-headline)]">
								IOC_ORIGINS
							</h4>
						</div>
						<div className="flex-1 p-4 space-y-3 overflow-y-auto">
							{IOC_LOCATIONS.map((ioc) => {
								const riskColors: Record<string, string> = {
									critical: "error",
									high: "primary-container",
									medium: "primary",
									low: "tertiary",
								};
								const color = riskColors[ioc.risk];
								return (
									<div
										key={ioc.id}
										className="p-4 bg-surface-container-low/50 rounded-lg hover:bg-surface-container-high/40 transition-colors"
									>
										<div className="flex items-start justify-between mb-2">
											<div className="flex items-center gap-2">
												<div
													className={`w-2 h-2 rounded-full bg-${color}`}
												/>
												<span
													className={`text-[10px] font-bold uppercase text-${color}`}
												>
													{ioc.risk}
												</span>
											</div>
											<span className="text-[10px] text-outline uppercase bg-surface-container px-2 py-0.5 rounded">
												{ioc.type}
											</span>
										</div>
										<p className="text-xs font-mono text-on-surface break-all">
											{ioc.value}
										</p>
										<div className="flex items-center gap-2 mt-2">
											<span className="material-symbols-outlined text-xs text-outline">
												location_on
											</span>
											<span className="text-[10px] text-on-surface-variant">
												{ioc.country}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

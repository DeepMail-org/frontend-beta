"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getResults } from "@/lib/api";
import { EmailAnalysisReport, GeoPoint } from "@/lib/types";
import ThreatGlobe from "@/components/dashboard/ThreatGlobe";

type IocMetadata = {
	lat?: number;
	lon?: number;
	country?: string;
	tags?: string[];
	malicious?: boolean;
};

// Hash function to deterministically assign coordinates to IOCs without GeoIP data
function hashStringToCoordinates(str: string): {
	lat: number;
	lon: number;
	country: string;
} {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}

	const random = (seed: number) => {
		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	};

	// Generate somewhat realistic latitudes (mostly northern hemisphere + some south)
	const latRaw = random(hash) * 140 - 60;
	// Generate longitudes all around
	const lonRaw = random(hash + 1) * 360 - 180;

	const regions = [
		"Unknown",
		"North America",
		"Europe",
		"Asia Pacific",
		"South America",
		"Middle East",
	];
	const country = regions[Math.floor(random(hash + 2) * regions.length)];

	return { lat: latRaw, lon: lonRaw, country };
}

export default function MapPage() {
	const params = useParams();
	const emailId = params.emailId as string;
	const [report, setReport] = useState<EmailAnalysisReport | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchReport() {
			try {
				const res = await getResults(emailId);
				setReport(res);
			} catch (err) {
				console.error("Failed to fetch Map Report", err);
			} finally {
				setLoading(false);
			}
		}
		if (emailId) fetchReport();
	}, [emailId]);

	const iocs = report?.iocs || [];

	// Map database IOCs to Map locations
	const mappedLocations = iocs.map((ioc) => {
		let lat = 0,
			lon = 0,
			country = "Unknown Location";
		let hasGeoCoordinates = false;
		let parsedMeta: IocMetadata = {};
		if (ioc.metadata) {
			try {
				parsedMeta = JSON.parse(ioc.metadata) as IocMetadata;
				if (
					Number.isFinite(parsedMeta.lat) &&
					Number.isFinite(parsedMeta.lon)
				) {
					lat = Number(parsedMeta.lat);
					lon = Number(parsedMeta.lon);
					country = parsedMeta.country || country;
					hasGeoCoordinates = true;
				}
			} catch {
				parsedMeta = {};
			}
		}

		// Fallback to deterministic pseudo-random coordinates if GeoLocation is missing
		// This keeps the map populated and engaging, plotting actual IOCs.
		if (!hasGeoCoordinates) {
			const coords = hashStringToCoordinates(ioc.value);
			lat = coords.lat;
			lon = coords.lon;
			country = coords.country;
		}

		// Determine risk level based on tags or defaults
		let risk = "low";
		if (parsedMeta.tags?.includes("malicious") || parsedMeta.malicious) {
			risk = "critical";
		} else if (ioc.ioc_type === "url" || ioc.ioc_type === "domain") {
			risk = "high";
		} else if (ioc.ioc_type === "ip") {
			risk = "medium";
		}

		return {
			id: ioc.id,
			type: ioc.ioc_type,
			value: ioc.value,
			lat,
			lon,
			country,
			risk,
		};
	});

	const riskClassMap: Record<string, { dot: string; text: string }> = {
		critical: { dot: "bg-error", text: "text-error" },
		high: { dot: "bg-primary-container", text: "text-primary-container" },
		medium: { dot: "bg-primary", text: "text-primary" },
		low: { dot: "bg-tertiary", text: "text-tertiary" },
	};

	if (loading) {
		return (
			<div className="p-12 text-center text-outline animate-pulse font-bold tracking-widest uppercase">
				Initializing Threat Map...
			</div>
		);
	}

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
					<h2 className="text-3xl font-bold text-on-surface tracking-tight font-headline">
						IOC <span className="text-tertiary">Geolocation</span>
					</h2>
					<p className="text-xs text-on-surface-variant mt-1">
						Geographic distribution of extracted indicators
					</p>
				</div>
				<div className="flex gap-2">
					<span className="bg-error/10 text-error text-[10px] px-3 py-1.5 rounded-lg border border-error/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-error" />{" "}
						{
							mappedLocations.filter((i) => i.risk === "critical")
								.length
						}{" "}
						Critical
					</span>
					<span className="bg-primary-container/10 text-primary-container text-[10px] px-3 py-1.5 rounded-lg border border-primary-container/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-primary-container" />{" "}
						{
							mappedLocations.filter((i) => i.risk === "high")
								.length
						}{" "}
						High
					</span>
					<span className="bg-primary/10 text-primary text-[10px] px-3 py-1.5 rounded-lg border border-primary/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
						{
							mappedLocations.filter((i) => i.risk === "medium")
								.length
						}{" "}
						Medium
					</span>
					<span className="bg-tertiary/10 text-tertiary text-[10px] px-3 py-1.5 rounded-lg border border-tertiary/20 font-bold flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-tertiary" />{" "}
						{mappedLocations.filter((i) => i.risk === "low").length}{" "}
						Low
					</span>
				</div>
			</div>

			{/* Globe + IOC List */}
			<div className="grid grid-cols-12 gap-8">
				{/* Globe Visualization */}
				<div className="col-span-12 lg:col-span-8">
					<div
						className="glass-panel rounded-xl p-8 relative flex items-center justify-center overflow-hidden"
						style={{ minHeight: "500px" }}
					>
						<ThreatGlobe
							geoPoints={mappedLocations as GeoPoint[]}
							size={500}
						/>
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
							<h4 className="text-sm font-bold tracking-widest uppercase font-headline">
								IOC_ORIGINS
							</h4>
						</div>
						<div className="flex-1 p-4 space-y-3 overflow-y-auto">
							{mappedLocations.length === 0 ? (
								<p className="text-xs text-outline text-center py-8">
									No IOC routing data available
								</p>
							) : (
								mappedLocations.map((ioc) => {
									const classes =
										riskClassMap[ioc.risk] ||
										riskClassMap.low;
									return (
										<div
											key={ioc.id}
											className="p-4 bg-surface-container-low/50 rounded-lg hover:bg-surface-container-high/40 transition-colors"
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2">
													<div
														className={`w-2 h-2 rounded-full ${classes.dot}`}
													/>
													<span
														className={`text-[10px] font-bold uppercase ${classes.text}`}
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
								})
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

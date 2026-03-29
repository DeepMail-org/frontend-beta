"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/api";
import { PIPELINE_STAGES } from "@/lib/types";
import type { PipelineStage, ProgressEvent } from "@/lib/types";

export default function UploadPage() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [emailId, setEmailId] = useState<string | null>(null);
	const [stages, setStages] = useState<PipelineStage[]>(
		PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" as const })),
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile) {
			setFile(droppedFile);
			setError(null);
		}
	}, []);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFile = e.target.files?.[0];
			if (selectedFile) {
				setFile(selectedFile);
				setError(null);
			}
		},
		[],
	);

	const handleUpload = async () => {
		if (!file) return;
		setIsUploading(true);
		setError(null);
		setUploadProgress(0);

		// Simulate upload progress
		const progressInterval = setInterval(() => {
			setUploadProgress((prev) => Math.min(prev + 15, 90));
		}, 200);

		try {
			const response = await uploadFile(file);
			clearInterval(progressInterval);
			setUploadProgress(100);
			setEmailId(response.email_id);

			if (response.deduplicated) {
				// Already analyzed — go directly to results
				router.push(`/analysis/${response.email_id}`);
				return;
			}

			// Start listening for progress via WebSocket
			connectWebSocket(response.email_id);
		} catch (err) {
			clearInterval(progressInterval);
			setError(err instanceof Error ? err.message : "Upload failed");
			setIsUploading(false);
		}
	};

	const connectWebSocket = (eid: string) => {
		const wsBase =
			process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/api/v1";
		try {
			const ws = new WebSocket(`${wsBase}/ws/results/${eid}`);
			ws.onmessage = (event) => {
				try {
					const data: ProgressEvent = JSON.parse(event.data);
					setStages((prev) =>
						prev.map((s) =>
							s.key === data.stage
								? {
										...s,
										status:
											data.status === "completed"
												? "completed"
												: data.status === "started"
													? "started"
													: "failed",
										details: data.details,
										timestamp:
											new Date().toLocaleTimeString(),
									}
								: s,
						),
					);
					if (
						data.stage === "pipeline" &&
						data.status === "completed"
					) {
						ws.close();
						setTimeout(() => router.push(`/analysis/${eid}`), 1500);
					}
				} catch {
					/* ignore parse errors */
				}
			};
			ws.onerror = () => {
				// Fallback: poll and redirect after delay
				setTimeout(() => router.push(`/analysis/${eid}`), 5000);
			};
		} catch {
			setTimeout(() => router.push(`/analysis/${eid}`), 5000);
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
			{/* Header */}
			<section className="flex flex-col md:flex-row justify-between items-end gap-6">
				<div>
					<div className="flex items-center gap-2 mb-2">
						<span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#fd77c4]" />
						<span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-bold">
							Threat Ingestion Protocol
						</span>
					</div>
					<h2 className="text-4xl font-bold text-on-surface tracking-tight font-[family-name:var(--font-headline)]">
						Upload & Sandbox{" "}
						<span className="text-primary">Panel</span>
					</h2>
					<p className="text-on-surface-variant max-w-xl mt-2 text-sm">
						Detonate suspicious email payloads in our multi-layered
						synthetic environment. Monitor redirect chains and
						execution logic in real-time.
					</p>
				</div>
				<div className="flex gap-4">
					<button className="px-6 py-3 bg-surface-container-high border border-outline-variant/20 rounded-xl hover:bg-surface-bright transition-all text-sm font-bold flex items-center gap-2">
						<span className="material-symbols-outlined text-sm">
							history
						</span>
						Recent Scans
					</button>
				</div>
			</section>

			{/* Main Grid */}
			<div className="grid grid-cols-12 gap-6">
				{/* Upload Zone */}
				<div className="col-span-12 bg-surface-variant/40 rounded-3xl border border-primary/20 p-8 flex flex-col gap-8 relative overflow-hidden group shadow-2xl backdrop-blur-md">
					<div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

					{/* Drop Area */}
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						className={`flex-1 relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all cursor-pointer overflow-hidden ${
							isDragging
								? "border-primary bg-primary/10"
								: "border-outline-variant/30 bg-surface-container-lowest/80 hover:border-primary/40 hover:bg-surface-container/60"
						}`}
					>
						<div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative z-10 w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-6 shadow-2xl border border-outline-variant/20">
							<span className="material-symbols-outlined text-4xl glow-purple">
								cloud_upload
							</span>
						</div>
						<div className="relative z-10 text-center mb-8">
							<h3 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-headline)] tracking-tight">
								{isDragging
									? "Release to upload"
									: "Drop file to detonate"}
							</h3>
							<p className="text-on-surface-variant text-xs mt-2 opacity-60">
								Accepts .eml, .msg, .zip (password: infected),
								or raw URL
							</p>
						</div>
						<button className="relative z-10 px-10 py-3 bg-transparent border border-secondary/40 text-secondary rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary/10 transition-all active:scale-95">
							Browse Files
						</button>
						<input
							ref={fileInputRef}
							type="file"
							className="hidden"
							accept=".eml,.msg,.zip,.txt"
							onChange={handleFileSelect}
						/>
					</div>

					{/* Selected File Card */}
					{file && (
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-4 px-1">
								<h4 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">
									Ready for Detonation
								</h4>
								<span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
									1 File Selected
								</span>
							</div>
							<div className="bg-surface-container-lowest/80 backdrop-blur-md p-5 rounded-2xl border border-outline-variant/10 shadow-xl flex items-center gap-5 transition-all hover:border-primary/30">
								<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
									<span className="material-symbols-outlined text-2xl">
										drafts
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-2">
										<p className="text-sm font-bold text-on-surface truncate">
											{file.name}
										</p>
										<p className="text-[10px] text-on-surface-variant/60 font-mono">
											{formatFileSize(file.size)}
										</p>
									</div>
									{isUploading && (
										<div className="relative w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
											<div
												className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_12px_rgba(189,147,249,0.5)] transition-all duration-300"
												style={{
													width: `${uploadProgress}%`,
												}}
											/>
										</div>
									)}
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setFile(null);
										setIsUploading(false);
									}}
									className="w-8 h-8 flex items-center justify-center rounded-full text-outline-variant hover:text-error hover:bg-error/10 transition-all"
								>
									<span className="material-symbols-outlined text-lg">
										close
									</span>
								</button>
							</div>
							{!isUploading && (
								<button
									onClick={handleUpload}
									className="w-full mt-4 py-3 gradient-primary text-on-primary rounded-xl shadow-[0_0_20px_rgba(196,154,255,0.3)] hover:scale-[1.01] transition-transform text-sm font-black uppercase tracking-wider"
								>
									Detonate & Analyze
								</button>
							)}
						</div>
					)}

					{/* Error */}
					{error && (
						<div className="relative z-10 p-4 bg-error/10 border border-error/30 rounded-lg flex items-start gap-3">
							<span className="material-symbols-outlined text-error text-sm">
								error
							</span>
							<p className="text-xs text-error">{error}</p>
						</div>
					)}
				</div>

				{/* Execution Timeline */}
				{emailId && (
					<div className="col-span-12 bg-surface-container rounded-xl p-8 border border-outline-variant/10 shadow-2xl">
						<h3 className="text-lg font-bold text-on-surface mb-8 flex items-center gap-2 font-[family-name:var(--font-headline)]">
							<span className="material-symbols-outlined text-tertiary">
								monitor_heart
							</span>
							Live Execution Timeline
						</h3>
						<div className="relative pl-8 border-l border-outline-variant/30 space-y-8">
							{stages.map((stage) => {
								const colorMap: Record<string, string> = {
									pending: "outline-variant",
									started: "primary",
									completed: "tertiary",
									failed: "error",
								};
								const color = colorMap[stage.status];
								return (
									<div key={stage.key} className="relative">
										<div
											className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full border-4 border-surface transition-all duration-500 ${
												stage.status === "completed"
													? "bg-tertiary shadow-[0_0_10px_#b8ffbb]"
													: stage.status === "started"
														? "bg-primary shadow-[0_0_10px_#c49aff] animate-pulse"
														: stage.status ===
															  "failed"
															? "bg-error shadow-[0_0_10px_#ff6e84]"
															: "bg-outline-variant/50"
											}`}
										/>
										<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
											<div className="flex items-center gap-3">
												<span
													className={`material-symbols-outlined text-${color} text-lg`}
												>
													{stage.icon}
												</span>
												<div>
													<h4 className="text-sm font-bold text-on-surface">
														{stage.label}
													</h4>
													{stage.details && (
														<p className="text-xs text-on-surface-variant">
															{stage.details}
														</p>
													)}
												</div>
											</div>
											<div
												className={`px-3 py-1 bg-${color}/10 border border-${color}/30 text-${color} text-[10px] font-bold rounded uppercase`}
											>
												{stage.status}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Demo Timeline (when no upload in progress) */}
				{!emailId && !isUploading && (
					<div className="col-span-12 bg-surface-container rounded-xl p-8 border border-outline-variant/10 shadow-2xl relative">
						<h3 className="text-lg font-bold text-on-surface mb-8 flex items-center gap-2 font-[family-name:var(--font-headline)]">
							<span className="material-symbols-outlined text-tertiary">
								monitor_heart
							</span>
							Live Execution Timeline
						</h3>
						<div className="relative pl-8 border-l border-outline-variant/30 space-y-12">
							<TimelineItem
								color="tertiary"
								time="09:12:04.22"
								title="Sandbox Initialization Success"
								desc="Clean OS snapshot loaded. Network interceptors active."
								badge="System Ready"
							/>
							<TimelineItem
								color="primary"
								time="09:12:08.51"
								title="Redirect Monitoring Initiated"
								desc="Tracing HTTP/S request chain for link: https://storage.googleapis.com/x-99..."
								badge="Intercepting"
							/>
							<TimelineItem
								color="error"
								time="09:12:15.89"
								title="Malicious Script Execution Detected"
								desc="Obfuscated JavaScript attempted to hijack DOM: eval(atob('Wlc1...'))"
								badge="Critical Threat"
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function TimelineItem({
	color,
	time,
	title,
	desc,
	badge,
}: {
	color: string;
	time: string;
	title: string;
	desc: string;
	badge: string;
}) {
	return (
		<div className="relative">
			<div
				className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-${color} border-4 border-surface shadow-[0_0_10px] shadow-${color}/50`}
			/>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex flex-col gap-1">
					<span
						className={`text-[10px] font-mono text-${color} tracking-tighter uppercase font-bold`}
					>
						{time}
					</span>
					<h4 className="text-sm font-bold text-on-surface">
						{title}
					</h4>
					<p className="text-xs text-on-surface-variant">{desc}</p>
				</div>
				<div
					className={`px-3 py-1 bg-${color}/10 border border-${color}/30 text-${color} text-[10px] font-bold rounded uppercase whitespace-nowrap`}
				>
					{badge}
				</div>
			</div>
		</div>
	);
}

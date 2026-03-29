"use client";

export default function DashboardPage() {
	return (
		<div className="p-8 lg:p-12 space-y-12">
			{/* Page Header */}
			<div>
				<div className="flex items-center gap-2 mb-2">
					<span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#fd77c4]" />
					<span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-bold">
						Threat Intelligence Center
					</span>
				</div>
				<h2 className="text-4xl font-bold text-on-surface tracking-tight font-[family-name:var(--font-headline)]">
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
					<h3 className="text-4xl font-bold tracking-tighter text-on-surface font-[family-name:var(--font-headline)]">
						1,247
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Emails Analyzed
					</p>
					<div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
						<div className="h-full bg-primary w-[85%] rounded-full" />
					</div>
				</div>

				{/* Malicious */}
				<div className="glass-panel p-6 rounded-xl hover:border-secondary/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-secondary text-3xl glow-pink">
							dangerous
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
							Critical
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-secondary font-[family-name:var(--font-headline)]">
						48
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Malicious Detected
					</p>
					<div className="mt-4 flex items-center gap-2 text-[10px] text-secondary font-bold">
						<span className="material-symbols-outlined text-xs">
							trending_up
						</span>
						<span>+12% FROM PEAK</span>
					</div>
				</div>

				{/* Suspicious */}
				<div className="glass-panel p-6 rounded-xl hover:border-primary-container/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-primary-container text-3xl glow-purple">
							warning
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">
							Warning
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-primary-container font-[family-name:var(--font-headline)]">
						312
					</h3>
					<p className="text-xs text-on-surface-variant mt-1">
						Suspicious Flagged
					</p>
					<div className="mt-4 flex items-center gap-2 text-[10px] text-primary-container font-bold">
						<span className="material-symbols-outlined text-xs">
							trending_down
						</span>
						<span>-4% AUTO-BLOCKED</span>
					</div>
				</div>

				{/* Safe / Integrity */}
				<div className="glass-panel p-6 rounded-xl hover:border-tertiary/30 transition-all group">
					<div className="flex justify-between items-start mb-4">
						<span className="material-symbols-outlined text-tertiary text-3xl glow-green">
							verified_user
						</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
							Stable
						</span>
					</div>
					<h3 className="text-4xl font-bold tracking-tighter text-tertiary font-[family-name:var(--font-headline)]">
						96.1%
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
								<h4 className="text-lg font-bold tracking-tight text-on-surface font-[family-name:var(--font-headline)]">
									THREAT_PROPAGATION_TREND
								</h4>
								<p className="text-[10px] text-outline uppercase tracking-widest">
									Real-time email analysis flow — 24h window
								</p>
							</div>
							<div className="flex gap-4">
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-sm bg-secondary" />
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
									d="M0,200 Q100,230 200,170 T400,120 T600,200 T800,140 L800,280 L0,280 Z"
									fill="url(#grad-purple)"
								/>
								<path
									d="M0,200 Q100,230 200,170 T400,120 T600,200 T800,140"
									fill="none"
									stroke="#c49aff"
									strokeWidth="2.5"
									className="glow-purple"
								/>
								{/* Threats (Pink) */}
								<path
									d="M0,240 Q100,150 200,210 T400,80 T600,130 T800,50 L800,280 L0,280 Z"
									fill="url(#grad-pink)"
								/>
								<path
									d="M0,240 Q100,150 200,210 T400,80 T600,130 T800,50"
									fill="none"
									stroke="#fd77c4"
									strokeWidth="2.5"
									className="glow-pink"
								/>
							</svg>
						</div>
					</div>

					{/* Recent Analyses Table */}
					<div className="glass-panel rounded-xl overflow-hidden">
						<div className="px-8 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
							<h4 className="text-sm font-bold tracking-widest uppercase font-[family-name:var(--font-headline)]">
								Recent_Analyses
							</h4>
							<button className="text-[10px] font-bold text-primary hover:underline">
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
											Origin
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
									<tr className="hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/5">
										<td className="px-8 py-4">
											<div className="flex items-center gap-3">
												<div className="w-2 h-2 rounded-full bg-secondary" />
												<div>
													<p className="font-bold text-on-surface tracking-tight">
														phish_invoice_2024.eml
													</p>
													<p className="text-[10px] text-outline font-mono">
														SHA-256: 4f1a...e2d9
													</p>
												</div>
											</div>
										</td>
										<td className="px-8 py-4 text-outline font-mono text-xs">
											192.168.1.104
										</td>
										<td className="px-8 py-4">
											<span className="text-secondary font-bold">
												92/100
											</span>
										</td>
										<td className="px-8 py-4">
											<span className="bg-secondary/10 text-secondary text-[10px] px-2 py-1 rounded border border-secondary/20 font-bold uppercase">
												MALICIOUS
											</span>
										</td>
										<td className="px-8 py-4">
											<button className="material-symbols-outlined text-outline hover:text-on-surface text-lg">
												more_vert
											</button>
										</td>
									</tr>
									<tr className="bg-surface-container-low/20 hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/5">
										<td className="px-8 py-4">
											<div className="flex items-center gap-3">
												<div className="w-2 h-2 rounded-full bg-primary-container" />
												<div>
													<p className="font-bold text-on-surface tracking-tight">
														suspicious_link.msg
													</p>
													<p className="text-[10px] text-outline font-mono">
														SHA-256: 8b2c...3a09
													</p>
												</div>
											</div>
										</td>
										<td className="px-8 py-4 text-outline font-mono text-xs">
											10.0.0.12
										</td>
										<td className="px-8 py-4">
											<span className="text-primary-container font-bold">
												45/100
											</span>
										</td>
										<td className="px-8 py-4">
											<span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-1 rounded border border-primary-container/20 font-bold uppercase">
												SUSPICIOUS
											</span>
										</td>
										<td className="px-8 py-4">
											<button className="material-symbols-outlined text-outline hover:text-on-surface text-lg">
												more_vert
											</button>
										</td>
									</tr>
									<tr className="hover:bg-surface-container-high/40 transition-colors">
										<td className="px-8 py-4">
											<div className="flex items-center gap-3">
												<div className="w-2 h-2 rounded-full bg-tertiary" />
												<div>
													<p className="font-bold text-on-surface tracking-tight">
														quarterly_report.eml
													</p>
													<p className="text-[10px] text-outline font-mono">
														SHA-256: c7d1...f820
													</p>
												</div>
											</div>
										</td>
										<td className="px-8 py-4 text-outline font-mono text-xs">
											Trusted CDN
										</td>
										<td className="px-8 py-4">
											<span className="text-tertiary font-bold">
												03/100
											</span>
										</td>
										<td className="px-8 py-4">
											<span className="bg-tertiary/10 text-tertiary text-[10px] px-2 py-1 rounded border border-tertiary/20 font-bold uppercase">
												SECURE
											</span>
										</td>
										<td className="px-8 py-4">
											<button className="material-symbols-outlined text-outline hover:text-on-surface text-lg">
												more_vert
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Real-Time Feed Sidebar */}
				<div className="col-span-12 lg:col-span-4">
					<div className="glass-panel rounded-xl h-full flex flex-col">
						<div className="px-6 py-5 border-b border-outline-variant/10">
							<h4 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 font-[family-name:var(--font-headline)]">
								<span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
								REAL_TIME_FEED
							</h4>
						</div>
						<div className="flex-grow p-6 space-y-6 overflow-y-auto max-h-[700px] no-scrollbar">
							{/* Feed: Critical */}
							<FeedItem
								icon="priority_high"
								color="secondary"
								label="Phishing Detected"
								time="JUST NOW"
								title="Credential harvester blocked from invoice_urgent.eml"
								desc="Source IP: 201.44.112.9. Redirects to fake Microsoft login page."
							/>
							{/* Feed: Info */}
							<FeedItem
								icon="shield"
								color="primary"
								label="Analysis Complete"
								time="2M AGO"
								title="Email scan completed: report_q4.eml"
								desc="Threat score: 12/100. All headers verified. No IOCs found."
							/>
							{/* Feed: Success */}
							<FeedItem
								icon="check"
								color="tertiary"
								label="System Health"
								time="12M AGO"
								title="Pipeline integrity: 100%"
								desc="All 8 analysis stages reporting nominal. Redis queue depth: 0."
							/>
							{/* Feed: Warning */}
							<FeedItem
								icon="schedule"
								color="primary-container"
								label="Sandbox Queue"
								time="15M AGO"
								title="3 URL detonations pending"
								desc="Sandbox worker processing. ETA: ~45 seconds per URL."
							/>

							{/* Network Graph Mini */}
							<div className="pt-4 mt-4 border-t border-outline-variant/10">
								<div className="bg-surface-container-lowest rounded-xl p-4 relative overflow-hidden">
									<div className="flex items-center justify-between mb-4">
										<p className="text-[9px] font-bold uppercase tracking-widest text-outline">
											IOC Graph
										</p>
										<span className="material-symbols-outlined text-xs text-outline">
											hub
										</span>
									</div>
									<div className="flex justify-around items-center h-24 relative">
										<div className="w-3 h-3 rounded-full bg-secondary glow-pink z-10" />
										<div className="w-2 h-2 rounded-full bg-primary/40 z-10" />
										<div className="w-4 h-4 rounded-full bg-tertiary glow-green z-10" />
										<div className="w-2 h-2 rounded-full bg-primary-container z-10" />
										<div className="absolute inset-0 flex items-center">
											<div className="w-full h-px bg-gradient-to-r from-secondary/20 via-primary/20 to-tertiary/20" />
										</div>
									</div>
									<button className="w-full mt-2 py-2 text-[10px] font-bold text-on-surface-variant bg-surface-container-high rounded border border-outline-variant/10 hover:bg-surface-container-highest transition-colors uppercase tracking-widest">
										Explore Node Map
									</button>
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
	return (
		<div className="flex gap-4 group">
			<div className="flex flex-col items-center">
				<div
					className={`w-8 h-8 rounded-full bg-${color}/20 flex items-center justify-center border border-${color}/40`}
				>
					<span
						className={`material-symbols-outlined text-sm text-${color}`}
					>
						{icon}
					</span>
				</div>
				<div className="w-px h-full bg-outline-variant/20 mt-2" />
			</div>
			<div className="flex-grow pb-6">
				<div className="flex justify-between mb-1">
					<span
						className={`text-[10px] font-bold text-${color} uppercase tracking-widest`}
					>
						{label}
					</span>
					<span className="text-[10px] text-outline">{time}</span>
				</div>
				<p className="text-xs font-bold text-on-surface tracking-tight">
					{title}
				</p>
				<p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
					{desc}
				</p>
			</div>
		</div>
	);
}

"use client";

export default function TopBar() {
	return (
		<header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(196,154,255,0.08)] flex justify-between items-center w-full px-8 py-4">
			<div className="flex items-center gap-8">
				{/* Brand */}
				<span className="text-2xl font-bold tracking-tighter text-primary glow-purple font-[family-name:var(--font-headline)] uppercase">
					DeepMail
				</span>
				{/* Search */}
				<div className="relative w-96">
					<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
						search
					</span>
					<input
						type="text"
						placeholder="Search hash, URL, or sender..."
						className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline/50"
					/>
				</div>
			</div>
			<div className="flex items-center gap-4">
				{/* System Status */}
				<div className="bg-surface-container-lowest px-4 py-1.5 rounded-full flex items-center gap-2 border border-outline-variant/10">
					<span className="w-2 h-2 rounded-full bg-tertiary glow-green animate-pulse" />
					<span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
						System Live
					</span>
				</div>
				{/* Notifications */}
				<button className="text-on-surface-variant hover:text-secondary transition-colors duration-300 active:scale-95 relative">
					<span className="material-symbols-outlined">
						notifications
					</span>
					<span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full" />
				</button>
				{/* Profile */}
				<button className="text-on-surface-variant hover:text-secondary transition-colors duration-300 active:scale-95">
					<span className="material-symbols-outlined">
						account_circle
					</span>
				</button>
			</div>
		</header>
	);
}

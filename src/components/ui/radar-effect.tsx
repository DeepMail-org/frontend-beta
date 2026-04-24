"use client";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import React from "react";

export const Circle = ({ className, children, idx, ...rest }: any) => {
	return (
		<motion.div
			{...rest}
			initial={{ opacity: 5 }}
			animate={{ opacity: 5 }}
			transition={{ delay: idx * 0.1, duration: 0.2 }}
			className={twMerge(
				"absolute inset-0 left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-(--border)",
				className,
			)}
		/>
	);
};

export const Radar = ({ className }: { className?: string }) => {
	const circles = new Array(8).fill(1);
	return (
		<div
			className={twMerge(
				"relative flex h-20 w-20 items-center justify-center rounded-full",
				className,
			)}
		>
			<style>{`
        @keyframes radar-spin {
          from { transform: rotate(20deg); }
          to   { transform: rotate(380deg); }
        }
        .animate-radar-spin {
          animation: radar-spin 5s linear infinite;
        }
      `}</style>
			{/* Rotating sweep line */}
			<div
				style={{ transformOrigin: "right center" }}
				className="animate-radar-spin absolute right-1/2 top-1/2 z-40 flex h-[6px] w-[300px] items-end justify-center overflow-hidden bg-transparent"
			>
				<div className="relative z-40 h-[3px] w-full bg-linear-to-r from-transparent via-white via-60% to-transparent drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
			</div>
			{/* Concentric circles */}
			{circles.map((_, idx) => (
				<Circle
					style={{
						height: `${(idx + 1) * 5}rem`,
						width: `${(idx + 1) * 5}rem`,
						border: `2px solid rgba(255, 255, 255, ${Math.max(0.1, 1.2 - (idx + 1) * 0.15)})`,
					}}
					key={`circle-${idx}`}
					idx={idx}
				/>
			))}
		</div>
	);
};

export const IconContainer = ({
	icon,
	text,
	delay,
}: {
	icon?: React.ReactNode;
	text?: string;
	delay?: number;
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 5, scale: 1 }}
			transition={{ duration: 0.2, delay: delay ?? 0 }}
			className="relative z-50 flex flex-col items-center justify-center space-y-2"
		>
			<div className="flex h-14 w-14 items-center justify-center rounded-[16px] glass border border-white/20 shadow-[0_4px_16px_rgba(255,255,255,0.1)]">
				{icon || (
					<svg
						className="h-8 w-8 text-(--muted)"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
							clipRule="evenodd"
						/>
					</svg>
				)}
			</div>
			<div className="hidden rounded-md px-3 py-1.5 md:block mt-3 bg-black/40 backdrop-blur-sm border border-white/10">
				<div className="text-center font-display text-[15px] font-bold text-white tracking-wide">
					{text || "Web Development"}
				</div>
			</div>
		</motion.div>
	);
};

"use client";
import React, { useState, useEffect, useRef } from "react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingHero } from "@/components/LandingHero";
import { LandingFeatures } from "@/components/LandingFeatures";
import { LandingHowItWorks } from "@/components/LandingHowItWorks";
import { LandingStats } from "@/components/LandingStats";
import { LandingPricing } from "@/components/LandingPricing";
import { LandingCTA } from "@/components/LandingCTAFooter";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { UploadModal, ContactModal } from "@/components/LandingModals";
import { useToast, ToastContainer } from "@/components/LandingModals";

// Simple fade-in wrapper component
function FadeIn({ children }: { children: React.ReactNode }) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					// Once visible, we can optionally stop observing
					if (ref.current) observer.unobserve(ref.current);
				}
			},
			{ threshold: 0.1 },
		);

		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			{children}
		</div>
	);
}

export default function DeepMailLandingPage() {
	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const { toasts, addToast, removeToast } = useToast();

	return (
		<div className="min-h-screen bg-(--background) selection:bg-white/20">
			<LandingNavbar onUploadClick={() => setUploadModalOpen(true)} />

			<main>
				<LandingHero onUploadClick={() => setUploadModalOpen(true)} />

				<FadeIn>
					<LandingFeatures />
				</FadeIn>

				<FadeIn>
					<LandingHowItWorks />
				</FadeIn>

				<FadeIn>
					<LandingStats />
				</FadeIn>

				<FadeIn>
					<LandingPricing
						onUploadClick={() => setUploadModalOpen(true)}
						onContactClick={() => setContactModalOpen(true)}
						onToast={addToast}
					/>
				</FadeIn>

				<FadeIn>
					<LandingCTA
						onUploadClick={() => setUploadModalOpen(true)}
					/>
				</FadeIn>
			</main>

			<CinematicFooter />

			{uploadModalOpen && (
				<UploadModal
					isOpen={true}
					onClose={() => setUploadModalOpen(false)}
					onToast={addToast}
				/>
			)}

			{contactModalOpen && (
				<ContactModal
					isOpen={true}
					onClose={() => setContactModalOpen(false)}
					onToast={addToast}
				/>
			)}

			<ToastContainer toasts={toasts} removeToast={removeToast} />
		</div>
	);
}

import type { Metadata } from "next";
import { Space_Grotesk, Inter, Geist } from "next/font/google";
import "@/globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import StatusFooter from "@/components/layout/StatusFooter";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
	variable: "--font-headline",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
	variable: "--font-body",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DeepMail SOC — Threat Intelligence Dashboard",
	description:
		"Email threat analysis platform with sandbox detonation, IOC extraction, and real-time scoring.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn("dark", "font-sans", geist.variable)}
			suppressHydrationWarning
		>
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
			>
				<Sidebar />
				<main className="ml-64 flex flex-col min-h-screen">
					<TopBar />
					<div className="flex-1">{children}</div>
					<StatusFooter />
				</main>
			</body>
		</html>
	);
}

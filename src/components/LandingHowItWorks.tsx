import { OrbitingCircles } from "./ui/orbiting-circles";
import { IconContainer } from "./ui/radar-effect";
import { FileText, Search, Target, Globe, Paperclip, Zap } from "lucide-react";

export function LandingHowItWorks() {
	return (
		<section className="relative flex flex-col items-center justify-center py-32 lg:py-48 w-full overflow-hidden min-h-[800px] bg-transparent">
			<div className="absolute z-21 pointer-events-none top-0 flex w-full flex-col items-center justify-start mt-20 md:mt-24 font-display">
				<h2 className="font-semibold text-4xl md:text-6xl tracking-tight text-white text-center px-4 drop-shadow-md">
					Real-Time Threat Pipeline
				</h2>
			</div>

			<div className="relative z-10 w-full max-w-5xl mx-auto px-6 h-[500px] md:h-[650px] flex items-center justify-center pointer-events-none mt-20 md:mt-32">
				{/* Inner Orbit */}
				<OrbitingCircles radius={100} duration={20} delay={0}>
					<IconContainer
						icon={<FileText className="h-8 w-8 text-white" />}
						text="PARSE"
					/>
				</OrbitingCircles>
				<OrbitingCircles radius={100} duration={20} delay={10}>
					<IconContainer
						icon={<Target className="h-8 w-8 text-white" />}
						text="HEADERS"
					/>
				</OrbitingCircles>

				{/* Middle Orbit */}
				<OrbitingCircles radius={190} duration={30} delay={5} reverse>
					<IconContainer
						icon={<Search className="h-8 w-8 text-white" />}
						text="IOC EXT"
					/>
				</OrbitingCircles>
				<OrbitingCircles radius={190} duration={30} delay={20} reverse>
					<IconContainer
						icon={<Globe className="h-8 w-8 text-white" />}
						text="URL REG"
					/>
				</OrbitingCircles>

				{/* Outer Orbit */}
				<OrbitingCircles radius={280} duration={45} delay={15}>
					<IconContainer
						icon={<Paperclip className="h-8 w-8 text-white" />}
						text="FILES"
					/>
				</OrbitingCircles>
				<OrbitingCircles radius={280} duration={45} delay={37.5}>
					<IconContainer
						icon={<Zap className="h-8 w-8 text-white" />}
						text="SCORING"
					/>
				</OrbitingCircles>
			</div>

			<div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-(--background) via-(--background)/80 to-transparent z-10 pointer-events-none" />
			<div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-(--background) via-(--background)/80 to-transparent z-10 pointer-events-none" />
		</section>
	);
}

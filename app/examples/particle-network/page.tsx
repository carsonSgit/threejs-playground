"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ParticleNetwork from "@/components/particle-network";

export default function ParticleNetworkPage() {
	useEffect(() => {
		document.body.style.margin = "0";
		document.body.style.overflow = "hidden";
		document.body.style.background = "#000";
		document.body.style.color = "#fff";

		return () => {
			document.body.style.margin = "";
			document.body.style.overflow = "";
			document.body.style.background = "";
			document.body.style.color = "";
		};
	}, []);

	return (
		<>
			<Link
				href="/"
				className="fixed top-6 left-6 z-[1000] flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono hover:bg-white/10 hover:border-white/20 transition-all text-white group"
			>
				<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
				<span>back_to_examples</span>
			</Link>

			<div className="fixed bottom-6 left-6 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 p-5 max-w-[280px] font-mono">
				<div className="flex items-center gap-2 mb-2">
					<div className="h-1.5 w-1.5 bg-fuchsia-400 animate-pulse rounded-full" />
					<strong className="text-xs uppercase tracking-widest text-fuchsia-400">
						particle_network
					</strong>
				</div>
				<p className="text-[10px] text-white/70 leading-relaxed mb-4">
					dynamic particle system using buffergeometry drawrange. particles
					connect when within proximity, creating an organic network effect.
				</p>
				<div className="flex items-center gap-3 text-[9px] text-white/40 uppercase tracking-tighter border-t border-white/5 pt-3">
					<span>drag_to_rotate</span>
					<span className="opacity-30">|</span>
					<span>scroll_to_zoom</span>
				</div>
			</div>

			<ParticleNetwork />
		</>
	);
}

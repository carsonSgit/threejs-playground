"use client";

import Link from "next/link";
import { useEffect } from "react";
import StrangeAttractors from "@/components/strange-attractors";

export default function StrangeAttractorsPage() {
	useEffect(() => {
		// Set body styles for this page
		document.body.style.margin = "0";
		document.body.style.overflow = "hidden";
		document.body.style.background = "#000";
		document.body.style.color = "#fff";

		// Cleanup when leaving the page
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
				className="fixed top-5 left-5 z-[1000] bg-black/70 px-5 py-2.5 rounded-md no-underline text-white text-sm transition-all hover:bg-black/90 backdrop-blur-sm border border-white/10"
			>
				← Back to Examples
			</Link>

			<div className="fixed bottom-5 right-5 z-[1000] bg-black/70 px-4 py-3.5 rounded-md text-xs max-w-[280px] backdrop-blur-sm border border-white/10">
				<strong className="text-white">Strange Attractors</strong>
				<br />
				<span className="text-white/70">
					Three chaotic dynamical systems visualized as flowing particle
					streams: the Lorenz, Rössler, and Aizawa attractors.
				</span>
				<br />
				<br />
				<em className="text-white/50">Drag to rotate • Scroll to zoom • Auto-rotating</em>
			</div>

			<StrangeAttractors />
		</>
	);
}


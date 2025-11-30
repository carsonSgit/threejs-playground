"use client";

import { useEffect } from "react";
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
			<div className="fixed bottom-5 right-5 z-[1000] bg-black/70 px-4 py-3.5 rounded-md text-xs max-w-[250px]">
				<strong>Particle Network</strong>
				<br />
				Dynamic particle system using BufferGeometry drawRange. Particles
				connect when within proximity, creating an organic network effect.
				<br />
				<br />
				<em>Drag to rotate • Scroll to zoom</em>
			</div>

			<ParticleNetwork />
		</>
	);
}

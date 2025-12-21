"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);

	const handleMouseMove = (e: React.MouseEvent<HTMLElement>, cardId: string) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
		setHoveredCard(cardId);
	};
	return (
		<>
			<section id="examples" className="bg-background py-24">
				<div className="container">
					<div className="mb-16 space-y-4">
						<div className="flex items-center gap-4 mb-8">
							<h2 className="text-3xl md:text-4xl font-bold font-mono tracking-tight">
								examples
							</h2>
						</div>
						<p className="text-sm md:text-base text-muted-foreground max-w-2xl font-mono leading-relaxed border-l-2 border-border pl-4">
							interactive webgl experiments and visual effects built with
							three.js.
							<br />
							click any card to explore the code and demo.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
						<Link
							href="/examples/ascii-earth"
							className="group border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200 h-full flex flex-col"
							onMouseMove={(e) => handleMouseMove(e, "ascii-earth")}
							onMouseLeave={() => setHoveredCard(null)}
						>
							<div className="h-48 relative overflow-hidden border-b border-border">
								{/* Vibrant gradient background - Earth/Space theme */}
								<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 via-blue-600/50 to-indigo-700/60"></div>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
								
								{/* ASCII text overlay with glow */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-6xl font-bold text-cyan-300/40 font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
										.:#%
									</div>
								</div>
								
								{/* Animated gradient orb with subtle cursor tracking */}
								<div 
									className="absolute w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-500"
									style={{
										left: hoveredCard === "ascii-earth" ? `${mousePosition.x - 64}px` : "50%",
										top: hoveredCard === "ascii-earth" ? `${mousePosition.y - 64}px` : "50%",
										transform: hoveredCard === "ascii-earth" ? "translate(0, 0)" : "translate(-50%, -50%)",
										transition: "all 0.3s ease-out",
									}}
								></div>
								
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-[10px] border border-white/20 font-mono tracking-wider z-10">
									[WEBGL]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/60 z-10">
									001/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3 flex-1 flex flex-col">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold font-mono tracking-tight group-hover:text-white transition-colors">
										ascii_earth
									</h3>
									<span className="text-xs text-muted-foreground font-mono">
										▸
									</span>
								</div>

								<p className="text-xs text-muted-foreground leading-relaxed font-mono">
									rotating earth rendered with ascii characters using
									asciieffect. features interactive orbit controls and real-time
									texture processing.
								</p>

								<div className="flex flex-wrap gap-2 pt-2">
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										ascii
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										effects
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										textures
									</span>
								</div>

								<div className="pt-2 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors font-mono">
									<span>view_example</span>
									<span className="ml-2 group-hover:translate-x-1 transition-transform">
										→
									</span>
								</div>
							</div>
						</Link>

						<Link
							href="/examples/boiling-star"
							className="group border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200 h-full flex flex-col"
							onMouseMove={(e) => handleMouseMove(e, "boiling-star")}
							onMouseLeave={() => setHoveredCard(null)}
						>
							<div className="h-48 relative overflow-hidden border-b border-border">
								{/* Vibrant gradient background - Star/Heat theme */}
								<div className="absolute inset-0 bg-gradient-to-br from-orange-500/50 via-red-600/60 to-yellow-500/40"></div>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
								
								{/* Star icon with glow */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-6xl font-bold text-orange-300/50 font-mono drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]">
										☀
									</div>
								</div>
								
								{/* Animated heat waves with subtle cursor tracking */}
								<div 
									className="absolute w-40 h-40 bg-orange-500/30 rounded-full blur-3xl group-hover:bg-orange-400/40 group-hover:w-44 group-hover:h-44 transition-all duration-500"
									style={{
										left: hoveredCard === "boiling-star" ? `${mousePosition.x - 80}px` : "50%",
										top: hoveredCard === "boiling-star" ? `${mousePosition.y - 80}px` : "50%",
										transform: hoveredCard === "boiling-star" ? "translate(0, 0)" : "translate(-50%, -50%)",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div 
									className="absolute w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"
									style={{
										left: hoveredCard === "boiling-star" ? `${mousePosition.x - 48}px` : "50%",
										top: hoveredCard === "boiling-star" ? `${mousePosition.y - 48}px` : "50%",
										transform: hoveredCard === "boiling-star" ? "translate(0, 0)" : "translate(-50%, -50%)",
										transition: "all 0.3s ease-out",
									}}
								></div>
								
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-[10px] border border-white/20 font-mono tracking-wider z-10">
									[SHADERS]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/60 z-10">
									002/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3 flex-1 flex flex-col">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold font-mono tracking-tight group-hover:text-white transition-colors">
										boiling_star
									</h3>
									<span className="text-xs text-muted-foreground font-mono">
										▸
									</span>
								</div>

								<p className="text-xs text-muted-foreground leading-relaxed font-mono">
									procedural star simulation with multi-layered simplex noise,
									dynamic surface warping, corona layer, and bloom
									post-processing.
								</p>

								<div className="flex flex-wrap gap-2 pt-2">
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										shaders
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										noise
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										bloom
									</span>
								</div>

								<div className="pt-2 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors font-mono">
									<span>view_example</span>
									<span className="ml-2 group-hover:translate-x-1 transition-transform">
										→
									</span>
								</div>
							</div>
						</Link>

						<Link
							href="/examples/particle-network"
							className="group border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200 h-full flex flex-col"
							onMouseMove={(e) => handleMouseMove(e, "particle-network")}
							onMouseLeave={() => setHoveredCard(null)}
						>
							<div className="h-48 relative overflow-hidden border-b border-border">
								{/* Vibrant gradient background - Network/Tech theme */}
								<div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-fuchsia-600/60 to-pink-500/50"></div>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
								
								{/* Particle nodes with glow */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-6xl font-bold text-purple-300/40 font-mono drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]">
										⬡⬢⬡
									</div>
								</div>
								
								{/* Animated network glow with subtle cursor tracking */}
								<div 
									className="absolute w-20 h-20 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-all duration-500"
									style={{
										left: hoveredCard === "particle-network" ? `${mousePosition.x * 0.3}px` : "25%",
										top: hoveredCard === "particle-network" ? `${mousePosition.y * 0.3}px` : "25%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div 
									className="absolute w-16 h-16 bg-fuchsia-400/20 rounded-full blur-2xl group-hover:bg-fuchsia-400/30 transition-all duration-500"
									style={{
										right: hoveredCard === "particle-network" ? `${(100 - mousePosition.x / 4)}%` : "25%",
										bottom: hoveredCard === "particle-network" ? `${(100 - mousePosition.y / 4)}%` : "25%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div 
									className="absolute w-12 h-12 bg-pink-400/20 rounded-full blur-xl"
									style={{
										right: hoveredCard === "particle-network" ? `${(100 - mousePosition.x / 3)}%` : "33%",
										bottom: hoveredCard === "particle-network" ? `${(100 - mousePosition.y / 3)}%` : "25%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-[10px] border border-white/20 font-mono tracking-wider z-10">
									[PARTICLES]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/60 z-10">
									003/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3 flex-1 flex flex-col">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold font-mono tracking-tight group-hover:text-white transition-colors">
										particle_network
									</h3>
									<span className="text-xs text-muted-foreground font-mono">
										▸
									</span>
								</div>

								<p className="text-xs text-muted-foreground leading-relaxed font-mono">
									dynamic particle system using buffergeometry drawrange.
									particles connect within proximity, creating organic network
									visualizations.
								</p>

								<div className="flex flex-wrap gap-2 pt-2">
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										particles
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										drawrange
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										dynamic
									</span>
								</div>

								<div className="pt-2 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors font-mono">
									<span>view_example</span>
									<span className="ml-2 group-hover:translate-x-1 transition-transform">
										→
									</span>
								</div>
							</div>
						</Link>

						<Link
							href="/examples/blob"
							className="group border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200 h-full flex flex-col"
							onMouseMove={(e) => handleMouseMove(e, "blob")}
							onMouseLeave={() => setHoveredCard(null)}
						>
							<div className="h-48 relative overflow-hidden border-b border-border">
								{/* Vibrant gradient background - Chrome/Metallic theme */}
								<div className="absolute inset-0 bg-gradient-to-br from-slate-400/40 via-gray-500/50 to-zinc-600/60"></div>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
								
								{/* Metallic blob shapes */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-6xl font-bold text-slate-300/40 font-mono drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]">
										○◉○
									</div>
								</div>
								
								{/* Chrome/metallic glow effects with subtle cursor tracking */}
								<div 
									className="absolute w-28 h-28 bg-slate-300/15 rounded-full blur-3xl group-hover:bg-slate-200/20 transition-all duration-500"
									style={{
										left: hoveredCard === "blob" ? `${mousePosition.x * 0.4}px` : "33%",
										top: hoveredCard === "blob" ? `${mousePosition.y * 0.4}px` : "33%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div 
									className="absolute w-24 h-24 bg-gray-400/15 rounded-full blur-2xl group-hover:bg-gray-300/20 transition-all duration-500"
									style={{
										right: hoveredCard === "blob" ? `${(100 - mousePosition.x / 4)}%` : "33%",
										bottom: hoveredCard === "blob" ? `${(100 - mousePosition.y / 4)}%` : "33%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div 
									className="absolute w-20 h-20 bg-white/10 rounded-full blur-xl"
									style={{
										left: hoveredCard === "blob" ? `${mousePosition.x - 40}px` : "50%",
										top: hoveredCard === "blob" ? `${mousePosition.y - 40}px` : "50%",
										transform: hoveredCard === "blob" ? "translate(0, 0)" : "translate(-50%, -50%)",
										transition: "all 0.3s ease-out",
									}}
								></div>
								
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-[10px] border border-white/20 font-mono tracking-wider z-10">
									[SHADERS]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/60 z-10">
									004/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3 flex-1 flex flex-col">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold font-mono tracking-tight group-hover:text-white transition-colors">
										blob
									</h3>
									<span className="text-xs text-muted-foreground font-mono">
										▸
									</span>
								</div>

								<p className="text-xs text-muted-foreground leading-relaxed font-mono">
									organic chrome blobs with simplex noise deformation. features
									liquid metal shaders, dynamic surface warping, and subtle bloom
									post-processing.
								</p>

								<div className="flex flex-wrap gap-2 pt-2">
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										shaders
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										noise
									</span>
									<span className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono">
										chrome
									</span>
								</div>

								<div className="pt-2 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors font-mono">
									<span>view_example</span>
									<span className="ml-2 group-hover:translate-x-1 transition-transform">
										→
									</span>
								</div>
							</div>
						</Link>

						<div className="border border-dashed border-border/50 bg-black/20 overflow-hidden flex items-center justify-center h-full">
							<div className="text-center p-8 space-y-3">
								<div className="text-4xl text-muted font-mono">+</div>
								<p className="text-xs text-muted-foreground font-mono">
									more_examples
									<br />
									coming_soon
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<footer className="bg-background border-t border-border py-12">
				<div className="container">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
						<div className="text-xs text-muted-foreground font-mono">
							<p className="mb-1">
								{/* built_with ❤ using three.js + typescript + next.js */}
							</p>
							<p className="text-[10px] text-white/30">v0.0.1 | 2025</p>
						</div>

						<div className="flex flex-col gap-2 text-xs font-mono">
							<a
								href="https://threejs.org"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
							>
								<span className="text-white/20">├─</span> three.js_docs →
							</a>
							<a
								href="https://github.com/carsonSgit/threejs-playground"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
							>
								<span className="text-white/20">└─</span> github_repo →
							</a>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t border-border/50">
						<div className="text-[10px] text-muted-foreground font-mono space-y-1">
							<p className="text-white/40">$ commands:</p>
							<p className="pl-4">
								{">"} pnpm dev ──────── start development server
							</p>
							<p className="pl-4">
								{">"} pnpm build ────── build for production
							</p>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}

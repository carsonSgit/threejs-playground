"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);

	const handleMouseMove = (
		e: React.MouseEvent<HTMLElement>,
		cardId: string,
	) => {
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
								{/* ASCII Grid Pattern Background */}
								<div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-blue-800/50 to-indigo-900/70"></div>

								{/* Grid pattern overlay */}
								<div
									className="absolute inset-0 opacity-20"
									style={{
										backgroundImage: `
											linear-gradient(cyan 1px, transparent 1px),
											linear-gradient(90deg, cyan 1px, transparent 1px)
										`,
										backgroundSize: "20px 20px",
									}}
								></div>

								{/* Scattered ASCII characters pattern */}
								<div className="absolute inset-0 font-mono text-cyan-400/30 text-xs">
									<div className="absolute top-4 left-6">.</div>
									<div className="absolute top-8 right-12">:</div>
									<div className="absolute top-16 left-20">#</div>
									<div className="absolute top-12 right-8">%</div>
									<div className="absolute bottom-16 left-12">@</div>
									<div className="absolute bottom-8 right-16">*</div>
									<div className="absolute top-24 left-32">.</div>
									<div className="absolute bottom-24 right-24">:</div>
									<div className="absolute top-32 right-32">#</div>
									<div className="absolute bottom-32 left-24">%</div>
								</div>

								{/* Central globe-like pattern */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="relative w-24 h-24">
										<div className="absolute inset-0 rounded-full border-2 border-cyan-400/40"></div>
										<div className="absolute inset-2 rounded-full border border-cyan-300/30"></div>
										<div
											className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
											style={{
												background:
													"radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
											}}
										></div>
									</div>
								</div>

								{/* Animated gradient orb with subtle cursor tracking */}
								<div
									className="absolute w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-500"
									style={{
										left:
											hoveredCard === "ascii-earth"
												? `${mousePosition.x - 64}px`
												: "50%",
										top:
											hoveredCard === "ascii-earth"
												? `${mousePosition.y - 64}px`
												: "50%",
										transform:
											hoveredCard === "ascii-earth"
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
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
								{/* Radial Star Burst Pattern */}
								<div
									className="absolute inset-0"
									style={{
										background:
											"radial-gradient(circle at center, rgba(234,88,12,0.6) 0%, rgba(185,28,28,0.5) 50%, rgba(0,0,0,1) 100%)",
									}}
								></div>

								{/* Concentric circles pattern */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="relative w-full h-full">
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-orange-400/30"></div>
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-orange-300/40"></div>
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-yellow-400/50"></div>
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-yellow-400/40"></div>
									</div>
								</div>

								{/* Heat wave lines */}
								<div className="absolute inset-0">
									<div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>
									<div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
									<div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent"></div>
								</div>

								{/* Star rays */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="relative w-40 h-40">
										<div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-orange-300/50 to-transparent"></div>
										<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"></div>
										<div className="absolute top-0 left-0 w-full h-full">
											<div
												className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-yellow-300/40 to-transparent"
												style={{ transform: "rotate(45deg)" }}
											></div>
											<div
												className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-yellow-300/40 to-transparent"
												style={{ transform: "rotate(-45deg)" }}
											></div>
										</div>
									</div>
								</div>

								{/* Animated heat waves with subtle cursor tracking */}
								<div
									className="absolute w-40 h-40 bg-orange-500/30 rounded-full blur-3xl group-hover:bg-orange-400/40 group-hover:w-44 group-hover:h-44 transition-all duration-500"
									style={{
										left:
											hoveredCard === "boiling-star"
												? `${mousePosition.x - 80}px`
												: "50%",
										top:
											hoveredCard === "boiling-star"
												? `${mousePosition.y - 80}px`
												: "50%",
										transform:
											hoveredCard === "boiling-star"
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div
									className="absolute w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"
									style={{
										left:
											hoveredCard === "boiling-star"
												? `${mousePosition.x - 48}px`
												: "50%",
										top:
											hoveredCard === "boiling-star"
												? `${mousePosition.y - 48}px`
												: "50%",
										transform:
											hoveredCard === "boiling-star"
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
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
								{/* Network Pattern Background */}
								<div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-fuchsia-900/60 to-pink-900/70"></div>

								{/* Network nodes */}
								<div className="absolute inset-0">
									{/* Node positions */}
									<div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-purple-400/60"></div>
									<div className="absolute top-16 right-16 w-2 h-2 rounded-full bg-fuchsia-400/60"></div>
									<div className="absolute top-24 left-1/4 w-2 h-2 rounded-full bg-pink-400/60"></div>
									<div className="absolute top-32 right-1/3 w-2 h-2 rounded-full bg-purple-300/60"></div>
									<div className="absolute bottom-16 left-16 w-2 h-2 rounded-full bg-fuchsia-300/60"></div>
									<div className="absolute bottom-24 right-12 w-2 h-2 rounded-full bg-pink-300/60"></div>
									<div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-purple-400/60"></div>
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-fuchsia-400/80"></div>

									{/* Connection lines */}
									<svg
										className="absolute inset-0 w-full h-full opacity-30"
										role="img"
										aria-label="Particle network connection lines"
									>
										<title>Particle network connection lines</title>
										<line
											x1="48"
											y1="32"
											x2="192"
											y2="64"
											stroke="rgba(192,132,252,0.4)"
											strokeWidth="1"
										/>
										<line
											x1="192"
											y1="64"
											x2="128"
											y2="96"
											stroke="rgba(232,121,249,0.4)"
											strokeWidth="1"
										/>
										<line
											x1="128"
											y1="96"
											x2="64"
											y2="128"
											stroke="rgba(244,114,182,0.4)"
											strokeWidth="1"
										/>
										<line
											x1="64"
											y1="128"
											x2="192"
											y2="160"
											stroke="rgba(192,132,252,0.4)"
											strokeWidth="1"
										/>
										<line
											x1="192"
											y1="160"
											x2="128"
											y2="192"
											stroke="rgba(232,121,249,0.4)"
											strokeWidth="1"
										/>
										<line
											x1="128"
											y1="96"
											x2="192"
											y2="128"
											stroke="rgba(244,114,182,0.4)"
											strokeWidth="1"
										/>
										<line
											x1="128"
											y1="96"
											x2="64"
											y2="160"
											stroke="rgba(192,132,252,0.4)"
											strokeWidth="1"
										/>
									</svg>
								</div>

								{/* Central network hub */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="relative">
										<div className="w-16 h-16 rounded-full border-2 border-purple-400/40"></div>
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-fuchsia-400/30"></div>
									</div>
								</div>

								{/* Animated network glow with subtle cursor tracking */}
								<div
									className="absolute w-20 h-20 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-all duration-500"
									style={{
										left:
											hoveredCard === "particle-network"
												? `${mousePosition.x * 0.3}px`
												: "25%",
										top:
											hoveredCard === "particle-network"
												? `${mousePosition.y * 0.3}px`
												: "25%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div
									className="absolute w-16 h-16 bg-fuchsia-400/20 rounded-full blur-2xl group-hover:bg-fuchsia-400/30 transition-all duration-500"
									style={{
										right:
											hoveredCard === "particle-network"
												? `${100 - mousePosition.x / 4}%`
												: "25%",
										bottom:
											hoveredCard === "particle-network"
												? `${100 - mousePosition.y / 4}%`
												: "25%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div
									className="absolute w-12 h-12 bg-pink-400/20 rounded-full blur-xl"
									style={{
										right:
											hoveredCard === "particle-network"
												? `${100 - mousePosition.x / 3}%`
												: "33%",
										bottom:
											hoveredCard === "particle-network"
												? `${100 - mousePosition.y / 3}%`
												: "25%",
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
								{/* Metallic Chrome Pattern Background */}
								<div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-gray-700/70 to-zinc-900/90"></div>

								{/* Organic blob shapes */}
								<div className="absolute inset-0">
									{/* Main central blob */}
									<div
										className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-sm"
										style={{
											background:
												"radial-gradient(circle, rgba(203,213,225,0.3) 0%, rgba(148,163,184,0.2) 50%, transparent 100%)",
										}}
									></div>

									{/* Secondary blobs */}
									<div
										className="absolute top-12 left-16 w-20 h-24 rounded-full blur-sm"
										style={{
											borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
											background:
												"radial-gradient(circle, rgba(209,213,219,0.25) 0%, rgba(156,163,175,0.15) 50%, transparent 100%)",
										}}
									></div>
									<div
										className="absolute bottom-16 right-20 w-18 h-22 rounded-full blur-sm"
										style={{
											borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
											background:
												"radial-gradient(circle, rgba(212,212,216,0.25) 0%, rgba(161,161,170,0.15) 50%, transparent 100%)",
										}}
									></div>
									<div
										className="absolute top-20 right-12 w-14 h-18 rounded-full blur-sm"
										style={{
											borderRadius: "40% 60%",
											background:
												"radial-gradient(circle, rgba(226,232,240,0.2) 0%, rgba(203,213,225,0.1) 50%, transparent 100%)",
										}}
									></div>
								</div>

								{/* Metallic highlights/reflections */}
								<div className="absolute inset-0">
									<div className="absolute top-8 left-1/4 w-24 h-32 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full blur-md"></div>
									<div className="absolute bottom-12 right-1/4 w-20 h-28 bg-gradient-to-tl from-white/8 via-transparent to-transparent rounded-full blur-md"></div>
								</div>

								{/* Subtle noise texture */}
								<div
									className="absolute inset-0 opacity-[0.03]"
									style={{
										backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
									}}
								></div>

								{/* Chrome/metallic glow effects with subtle cursor tracking */}
								<div
									className="absolute w-28 h-28 bg-slate-300/15 rounded-full blur-3xl group-hover:bg-slate-200/20 transition-all duration-500"
									style={{
										left:
											hoveredCard === "blob"
												? `${mousePosition.x * 0.4}px`
												: "33%",
										top:
											hoveredCard === "blob"
												? `${mousePosition.y * 0.4}px`
												: "33%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div
									className="absolute w-24 h-24 bg-gray-400/15 rounded-full blur-2xl group-hover:bg-gray-300/20 transition-all duration-500"
									style={{
										right:
											hoveredCard === "blob"
												? `${100 - mousePosition.x / 4}%`
												: "33%",
										bottom:
											hoveredCard === "blob"
												? `${100 - mousePosition.y / 4}%`
												: "33%",
										transition: "all 0.3s ease-out",
									}}
								></div>
								<div
									className="absolute w-20 h-20 bg-white/10 rounded-full blur-xl"
									style={{
										left:
											hoveredCard === "blob"
												? `${mousePosition.x - 40}px`
												: "50%",
										top:
											hoveredCard === "blob"
												? `${mousePosition.y - 40}px`
												: "50%",
										transform:
											hoveredCard === "blob"
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
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
									liquid metal shaders, dynamic surface warping, and subtle
									bloom post-processing.
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

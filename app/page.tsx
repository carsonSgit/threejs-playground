"use client";

import { ExampleCard } from "@/components/example-card";

export default function Home() {
	return (
		<>
			<section id="examples" className="bg-background py-24 px-6 md:px-12">
				<div className="container mx-auto">
					<div className="mb-16 space-y-4">
						<div className="flex items-center gap-4 mb-8">
							<h2 className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-foreground">
								examples
							</h2>
						</div>
						<p className="text-sm md:text-base text-muted-foreground max-w-2xl font-mono leading-relaxed border-l-2 border-primary/50 pl-4">
							interactive webgl experiments and visual effects built with
							three.js.
							<br />
							click any card to explore the code and demo.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
						<ExampleCard
							id="ascii-earth"
							href="/examples/ascii-earth"
							title="ascii_earth"
							description="rotating earth rendered with ascii characters using asciieffect. features interactive orbit controls and real-time texture processing."
							tags={["ascii", "effects", "textures"]}
							type="[WEBGL]"
							number="001/DEMO"
						>
							{(mousePosition, isHovered) => (
								<>
									<div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-blue-800/50 to-indigo-900/70"></div>

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

									<div
										className="absolute w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-500"
										style={{
											left: isHovered ? `${mousePosition.x - 64}px` : "50%",
											top: isHovered ? `${mousePosition.y - 64}px` : "50%",
											transform: isHovered
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
											transition: "all 0.3s ease-out",
										}}
									></div>
								</>
							)}
						</ExampleCard>

						<ExampleCard
							id="boiling-star"
							href="/examples/boiling-star"
							title="boiling_star"
							description="procedural star simulation with multi-layered simplex noise, dynamic surface warping, corona layer, and bloom post-processing."
							tags={["shaders", "noise", "bloom"]}
							type="[SHADERS]"
							number="002/DEMO"
						>
							{(mousePosition, isHovered) => (
								<>
									<div
										className="absolute inset-0"
										style={{
											background:
												"radial-gradient(circle at center, rgba(234,88,12,0.6) 0%, rgba(185,28,28,0.5) 50%, rgba(0,0,0,1) 100%)",
										}}
									></div>

									<div className="absolute inset-0 flex items-center justify-center">
										<div className="relative w-full h-full">
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-orange-400/30"></div>
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-orange-300/40"></div>
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-yellow-400/50"></div>
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-yellow-400/40"></div>
										</div>
									</div>

									<div className="absolute inset-0">
										<div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>
										<div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
										<div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent"></div>
									</div>

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

									<div
										className="absolute w-40 h-40 bg-orange-500/30 rounded-full blur-3xl group-hover:bg-orange-400/40 group-hover:w-44 group-hover:h-44 transition-all duration-500"
										style={{
											left: isHovered ? `${mousePosition.x - 80}px` : "50%",
											top: isHovered ? `${mousePosition.y - 80}px` : "50%",
											transform: isHovered
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
											transition: "all 0.3s ease-out",
										}}
									></div>
									<div
										className="absolute w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"
										style={{
											left: isHovered ? `${mousePosition.x - 48}px` : "50%",
											top: isHovered ? `${mousePosition.y - 48}px` : "50%",
											transform: isHovered
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
											transition: "all 0.3s ease-out",
										}}
									></div>
								</>
							)}
						</ExampleCard>

						<ExampleCard
							id="particle-network"
							href="/examples/particle-network"
							title="particle_network"
							description="dynamic particle system using buffergeometry drawrange. particles connect within proximity, creating organic network visualizations."
							tags={["particles", "drawrange", "dynamic"]}
							type="[PARTICLES]"
							number="003/DEMO"
						>
							{(mousePosition, isHovered) => (
								<>
									<div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-fuchsia-900/60 to-pink-900/70"></div>

									<div className="absolute inset-0">
										<div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-purple-400/60"></div>
										<div className="absolute top-16 right-16 w-2 h-2 rounded-full bg-fuchsia-400/60"></div>
										<div className="absolute top-24 left-1/4 w-2 h-2 rounded-full bg-pink-400/60"></div>
										<div className="absolute top-32 right-1/3 w-2 h-2 rounded-full bg-purple-300/60"></div>
										<div className="absolute bottom-16 left-16 w-2 h-2 rounded-full bg-fuchsia-300/60"></div>
										<div className="absolute bottom-24 right-12 w-2 h-2 rounded-full bg-pink-300/60"></div>
										<div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-purple-400/60"></div>
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-fuchsia-400/80"></div>

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

									<div className="absolute inset-0 flex items-center justify-center">
										<div className="relative">
											<div className="w-16 h-16 rounded-full border-2 border-purple-400/40"></div>
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-fuchsia-400/30"></div>
										</div>
									</div>

									<div
										className="absolute w-20 h-20 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-all duration-500"
										style={{
											left: isHovered ? `${mousePosition.x * 0.3}px` : "25%",
											top: isHovered ? `${mousePosition.y * 0.3}px` : "25%",
											transition: "all 0.3s ease-out",
										}}
									></div>
									<div
										className="absolute w-16 h-16 bg-fuchsia-400/20 rounded-full blur-2xl group-hover:bg-fuchsia-400/30 transition-all duration-500"
										style={{
											right: isHovered
												? `${100 - mousePosition.x / 4}%`
												: "25%",
											bottom: isHovered
												? `${100 - mousePosition.y / 4}%`
												: "25%",
											transition: "all 0.3s ease-out",
										}}
									></div>
									<div
										className="absolute w-12 h-12 bg-pink-400/20 rounded-full blur-xl"
										style={{
											right: isHovered
												? `${100 - mousePosition.x / 3}%`
												: "33%",
											bottom: isHovered
												? `${100 - mousePosition.y / 3}%`
												: "25%",
											transition: "all 0.3s ease-out",
										}}
									></div>
								</>
							)}
						</ExampleCard>

						<ExampleCard
							id="blob"
							href="/examples/blob"
							title="blob"
							description="organic chrome blobs with simplex noise deformation. features liquid metal shaders, dynamic surface warping, and subtle bloom post-processing."
							tags={["shaders", "noise", "chrome"]}
							type="[SHADERS]"
							number="004/DEMO"
						>
							{(mousePosition, isHovered) => (
								<>
									<div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-gray-700/70 to-zinc-900/90"></div>

									<div className="absolute inset-0">
										<div
											className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-sm"
											style={{
												background:
													"radial-gradient(circle, rgba(203,213,225,0.3) 0%, rgba(148,163,184,0.2) 50%, transparent 100%)",
											}}
										></div>

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

									<div className="absolute inset-0">
										<div className="absolute top-8 left-1/4 w-24 h-32 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full blur-md"></div>
										<div className="absolute bottom-12 right-1/4 w-20 h-28 bg-gradient-to-tl from-white/8 via-transparent to-transparent rounded-full blur-md"></div>
									</div>

									<div
										className="absolute inset-0 opacity-[0.03]"
										style={{
											backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
										}}
									></div>

									<div
										className="absolute w-28 h-28 bg-slate-300/15 rounded-full blur-3xl group-hover:bg-slate-200/20 transition-all duration-500"
										style={{
											left: isHovered ? `${mousePosition.x * 0.4}px` : "33%",
											top: isHovered ? `${mousePosition.y * 0.4}px` : "33%",
											transition: "all 0.3s ease-out",
										}}
									></div>
									<div
										className="absolute w-24 h-24 bg-gray-400/15 rounded-full blur-2xl group-hover:bg-gray-300/20 transition-all duration-500"
										style={{
											right: isHovered
												? `${100 - mousePosition.x / 4}%`
												: "33%",
											bottom: isHovered
												? `${100 - mousePosition.y / 4}%`
												: "33%",
											transition: "all 0.3s ease-out",
										}}
									></div>
									<div
										className="absolute w-20 h-20 bg-white/10 rounded-full blur-xl"
										style={{
											left: isHovered ? `${mousePosition.x - 40}px` : "50%",
											top: isHovered ? `${mousePosition.y - 40}px` : "50%",
											transform: isHovered
												? "translate(0, 0)"
												: "translate(-50%, -50%)",
											transition: "all 0.3s ease-out",
										}}
									></div>
								</>
							)}
						</ExampleCard>

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
							<p className="mb-1"></p>
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

import Link from "next/link";

export default function Home() {
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

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Link
							href="/examples/ascii-earth"
							className="group block border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200"
						>
							<div className="aspect-video bg-black relative overflow-hidden border-b border-border">
								<div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/20 font-mono">
									.:#%
								</div>
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 text-[10px] border border-white/20 font-mono tracking-wider">
									[WEBGL]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/40">
									001/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3">
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
							className="group block border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200"
						>
							<div className="aspect-video bg-black relative overflow-hidden border-b border-border">
								<div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-orange-400/30 font-mono">
									☀
								</div>
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 text-[10px] border border-white/20 font-mono tracking-wider">
									[SHADERS]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/40">
									002/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3">
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
							className="group block border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200"
						>
							<div className="aspect-video bg-black relative overflow-hidden border-b border-border">
								<div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/20 font-mono">
									⬡⬢⬡
								</div>
								<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 text-[10px] border border-white/20 font-mono tracking-wider">
									[PARTICLES]
								</div>
								<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/40">
									003/DEMO
								</div>
							</div>

							<div className="p-5 space-y-3">
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

						<div className="border border-dashed border-border/50 bg-black/20 overflow-hidden flex items-center justify-center aspect-square">
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

"use client";

import { useUser } from "@clerk/nextjs";
import { Dialog } from "@base-ui/react/dialog";
import { Tooltip } from "@base-ui/react/tooltip";
import {
	Code2,
	Pencil,
	Play,
	Plus,
	Save,
	TerminalSquare,
	Trash2,
	Box,
	Sparkles,
	Droplets,
	LayoutGrid,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme for syntax highlighting
import type { CodeSample } from "@/app/api/code-samples/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TEMPLATES = [
	{
		id: "tpl_basic",
		title: "Basic Cube",
		icon: (
			<Box className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
		),
		description:
			"A minimal rotating cube setup. Perfect for understanding the Three.js camera, scene, and render loop fundamentals.",
		code: `import * as THREE from "three";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x06b6d4,
    wireframe: true 
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});`,
	},
	{
		id: "tpl_particles",
		title: "Particle Field",
		icon: (
			<Sparkles className="w-10 h-10 text-fuchsia-400 group-hover:scale-110 transition-transform" />
		),
		description:
			"A high-performance particle system using BufferGeometry and PointsMaterial to render thousands of stars.",
		code: `import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Particle Setup
const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for(let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    color: 0xe879f9,
    size: 0.05,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);
camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
    renderer.render(scene, camera);
}
animate();`,
	},
	{
		id: "tpl_shader",
		title: "Liquid Shader",
		icon: (
			<Droplets className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
		),
		description:
			"A custom GLSL ShaderMaterial that generates a morphing, liquid-like surface using time uniforms.",
		code: `import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Shader Material
const uniforms = {
    u_time: { value: 0.0 }
};

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: \`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    \`,
    fragmentShader: \`
        uniform float u_time;
        varying vec2 vUv;
        void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float d = length(p);
            vec3 col = vec3(0.1, 0.4, 0.8) + vec3(0.2, 0.5, 0.9) * sin(d * 10.0 - u_time * 2.0);
            gl_FragColor = vec4(col, 1.0);
        }
    \`
});

const geometry = new THREE.PlaneGeometry(5, 5);
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);
camera.position.z = 3;

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}
animate();`,
	},
];

export default function CodeSandboxPage() {
	const { user } = useUser();
	const [samples, setSamples] = useState<CodeSample[]>([]);
	const [selectedSample, setSelectedSample] = useState<CodeSample | null>(null);
	const [loading, setLoading] = useState(true);
	const [code, setCode] = useState("");
	const [iframeKey, setIframeKey] = useState(0);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [isCompiling, setIsCompiling] = useState(false);

	// App Modes
	const [viewMode, setViewMode] = useState<"gallery" | "editor">("gallery");
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);

	const lastSelectedSampleIdRef = useRef<string | null>(null);
	const isFetchingRef = useRef(false);
	const selectedSampleRef = useRef<CodeSample | null>(null);

	useEffect(() => {
		selectedSampleRef.current = selectedSample;
	}, [selectedSample]);

	const fetchSamples = useCallback(async (preserveSelection = true) => {
		if (isFetchingRef.current) return;

		try {
			isFetchingRef.current = true;
			const response = await fetch("/api/code-samples");
			const data = await response.json();
			const fetchedSamples = data.samples || [];

			setSamples(fetchedSamples);

			const currentSelected = selectedSampleRef.current;

			if (fetchedSamples.length > 0) {
				if (preserveSelection && currentSelected) {
					const stillExists = fetchedSamples.find(
						(s: CodeSample) => s.id === currentSelected.id,
					);
					if (!stillExists) {
						setSelectedSample(fetchedSamples[0]);
					}
				}
			}
		} catch (error) {
			console.error("Failed to fetch samples:", error);
		} finally {
			isFetchingRef.current = false;
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSamples(false);

		const handleSampleSaved = () => {
			setTimeout(() => fetchSamples(true), 500);
		};

		window.addEventListener("code-sample-saved", handleSampleSaved);

		return () => {
			window.removeEventListener("code-sample-saved", handleSampleSaved);
		};
	}, [fetchSamples]);

	useEffect(() => {
		if (
			selectedSample &&
			lastSelectedSampleIdRef.current !== selectedSample.id
		) {
			setCode(selectedSample.code);
			lastSelectedSampleIdRef.current = selectedSample.id;
			setIsCompiling(true);
			setTimeout(() => setIsCompiling(false), 300);
			setViewMode("editor");
		} else if (!selectedSample) {
			setCode("");
			lastSelectedSampleIdRef.current = null;
			// If no sample is selected, show the gallery
			setViewMode("gallery");
		}
	}, [selectedSample]);

	const startEditing = (sample: CodeSample) => {
		setEditingId(sample.id);
		setEditTitle(sample.title);
	};

	const handleRename = async () => {
		if (!editingId) return;

		const currentEditingId = editingId;
		const currentEditTitle = editTitle.trim();

		setEditingId(null);

		if (!currentEditTitle) return;

		const sample = samples.find((s) => s.id === currentEditingId);
		if (!sample || sample.title === currentEditTitle) return;

		const updatedSample = { ...sample, title: currentEditTitle };
		setSamples(
			samples.map((s) => (s.id === currentEditingId ? updatedSample : s)),
		);
		if (selectedSample?.id === currentEditingId) {
			setSelectedSample(updatedSample);
		}

		try {
			await fetch("/api/code-samples", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...sample,
					title: currentEditTitle,
					sampleId: sample.id,
				}),
			});
		} catch (error) {
			console.error("Failed to rename sample:", error);
			setSamples(samples.map((s) => (s.id === currentEditingId ? sample : s)));
			if (selectedSample?.id === currentEditingId) {
				setSelectedSample(sample);
			}
		}
	};

	const executeDelete = async () => {
		if (!itemToDelete) return;
		const sampleId = itemToDelete;
		setItemToDelete(null);

		try {
			await fetch(`/api/code-samples?id=${sampleId}`, {
				method: "DELETE",
			});
			setSamples(samples.filter((s) => s.id !== sampleId));
			if (selectedSample?.id === sampleId) {
				const remaining = samples.filter((s) => s.id !== sampleId);
				if (remaining.length > 0) {
					setSelectedSample(remaining[0]);
				} else {
					setSelectedSample(null);
					setViewMode("gallery");
				}
			}
		} catch (error) {
			console.error("Failed to delete sample:", error);
		}
	};

	const handleRun = () => {
		setIsCompiling(true);
		setIframeKey((prev) => prev + 1);
		setTimeout(() => setIsCompiling(false), 500);
	};

	const handleSave = async () => {
		if (!selectedSample) return;

		const originalCode = selectedSample.code;
		setSamples(
			samples.map((s) => (s.id === selectedSample.id ? { ...s, code } : s)),
		);
		setSelectedSample({ ...selectedSample, code });

		try {
			await fetch("/api/code-samples", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...selectedSample,
					code,
					sampleId: selectedSample.id,
				}),
			});
			lastSelectedSampleIdRef.current = selectedSample.id;
		} catch (error) {
			console.error("Failed to save:", error);
			setSamples(
				samples.map((s) =>
					s.id === selectedSample.id ? { ...s, code: originalCode } : s,
				),
			);
			setSelectedSample({ ...selectedSample, code: originalCode });
			setCode(originalCode);
		}
	};

	const handleNewFromTemplate = async (templateCode: string, title: string) => {
		const newSample: CodeSample = {
			id: `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`,
			title: `${title}_${Math.floor(Math.random() * 1000)}`,
			code: templateCode,
			language: "typescript",
			concept: "",
			explanation: "",
			createdAt: new Date().toISOString(),
			userId: user?.id || "anonymous",
		};

		setSamples([...samples, newSample]);
		setSelectedSample(newSample);
		setViewMode("editor");

		try {
			await fetch("/api/code-samples", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newSample),
			});
		} catch (error) {
			console.error("Failed to create new sample:", error);
		}
	};

	const generateSandboxHTML = (codeContent: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/"
        }
    }
    </script>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background: #000; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="module">
${codeContent}
    </script>
</body>
</html>`;

	if (loading) {
		return (
			<div className="h-screen w-full bg-background flex flex-col items-center justify-center space-y-4">
				<div className="w-16 h-16 relative">
					<div className="absolute inset-0 border-t-2 border-primary/50 rounded-full animate-spin"></div>
					<div className="absolute inset-2 border-r-2 border-primary/30 rounded-full animate-spin-reverse"></div>
				</div>
				<div className="text-muted-foreground font-mono text-xs animate-pulse">
					initializing_workspace...
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-background flex flex-col overflow-hidden text-foreground">
			<Dialog.Root
				open={!!itemToDelete}
				onOpenChange={(open) => !open && setItemToDelete(null)}
			>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] transition-opacity" />
					<Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 shadow-2xl p-6 max-w-sm w-full font-mono outline-none z-[9999]">
						<h2 className="text-sm font-bold text-red-400 mb-2 tracking-widest uppercase">
							Delete_Sketch?
						</h2>
						<p className="text-xs text-muted-foreground mb-6 leading-relaxed">
							This action is permanent and cannot be undone. Are you absolutely
							sure?
						</p>
						<div className="flex justify-end gap-3">
							<Dialog.Close
								render={
									<Button variant="ghost" size="sm" className="font-mono text-xs" />
								}
							>
								[Cancel]
							</Dialog.Close>
							<Button
								variant="outline"
								size="sm"
								className="font-mono text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
								onClick={executeDelete}
							>
								[Confirm_Delete]
							</Button>
						</div>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>

			<header className="h-14 border-b border-border bg-black/40 flex items-center px-4 shrink-0 backdrop-blur-md z-10">
				<div className="flex items-center gap-3 w-full">
					<TerminalSquare className="h-5 w-5 text-primary/70 shrink-0" />
					<div className="flex-1 min-w-0 flex items-center gap-4">
						<div>
							<h1 className="text-sm font-bold font-mono tracking-tight text-primary/90 truncate">
								~/sandbox
							</h1>
							<p className="text-[10px] text-muted-foreground font-mono truncate hidden sm:block">
								webgl_experimentation_environment
							</p>
						</div>
					</div>
					<div className="shrink-0">
						{viewMode === "editor" && (
							<Button
								variant="ghost"
								size="sm"
								className="text-xs font-mono text-muted-foreground hover:text-foreground"
								onClick={() => {
									setSelectedSample(null);
									setViewMode("gallery");
								}}
							>
								<LayoutGrid className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">template_gallery</span>
							</Button>
						)}
					</div>
				</div>
			</header>

			<div className="flex flex-1 overflow-hidden min-h-0 flex-col lg:flex-row">
				<aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-black/20 flex flex-col overflow-hidden shrink-0 h-[30vh] lg:h-auto">
					<div className="p-3 border-b border-border/50 flex justify-between items-center bg-black/40">
						<span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
							explorer
						</span>
						<Tooltip.Root delay={200}>
							<Tooltip.Trigger
								render={
									<Button
										onClick={() => setViewMode("gallery")}
										variant="ghost"
										size="icon"
										className="h-6 w-6 hover:bg-primary/20 hover:text-primary transition-colors focus:outline-none"
									>
										<Plus className="h-4 w-4" />
									</Button>
								}
							/>
							<Tooltip.Portal>
								<Tooltip.Positioner sideOffset={4}>
									<Tooltip.Popup className="bg-black/90 border border-white/10 text-white text-[10px] font-mono px-2 py-1 shadow-xl z-[9999]">
										New Sketch from Template
										<Tooltip.Arrow className="fill-black/90" />
									</Tooltip.Popup>
								</Tooltip.Positioner>
							</Tooltip.Portal>
						</Tooltip.Root>
					</div>
					<div className="flex-1 overflow-y-auto custom-scrollbar p-2">
						{samples.length === 0 ? (
							<div className="text-xs text-muted-foreground font-mono py-8 px-4 text-center opacity-50 border border-dashed border-border/50 m-2">
								directory_empty
							</div>
						) : (
							<div className="space-y-0.5">
								{samples.map((sample) => (
									<div
										key={sample.id}
										role="button"
										tabIndex={0}
										className={`group relative flex items-center justify-between px-3 py-2 text-xs font-mono rounded-sm transition-all cursor-pointer ${
											selectedSample?.id === sample.id && viewMode === "editor"
												? "bg-primary/10 text-primary border border-primary/20"
												: "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
										}`}
										onClick={() => {
											setSelectedSample(sample);
											setViewMode("editor");
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setSelectedSample(sample);
												setViewMode("editor");
											}
										}}
									>
										{editingId === sample.id ? (
											<Input
												value={editTitle}
												onChange={(e) => setEditTitle(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleRename();
													if (e.key === "Escape") setEditingId(null);
												}}
												onClick={(e) => e.stopPropagation()}
												className="h-6 text-xs font-mono py-0 px-1 bg-black/50 border border-primary/50 rounded-none focus-visible:ring-0 focus-visible:border-primary w-full"
												autoFocus
												onBlur={handleRename}
											/>
										) : (
											<div className="flex items-center gap-2 overflow-hidden w-full">
												<Code2 className="h-3 w-3 shrink-0 opacity-50" />
												<span className="truncate">{sample.title}</span>
											</div>
										)}

										<div
											className={`absolute right-2 flex gap-1 bg-background/90 backdrop-blur-sm px-1 py-0.5 rounded shadow-sm transition-opacity ${
												selectedSample?.id === sample.id && viewMode === "editor"
													? "opacity-100"
													: "opacity-0 lg:group-hover:opacity-100"
											} ${editingId === sample.id ? "hidden" : ""}`}
										>
											<button
												type="button"
												className="p-1 hover:text-primary transition-colors focus:outline-none"
												onClick={(e) => {
													e.stopPropagation();
													startEditing(sample);
												}}
											>
												<Pencil className="h-3 w-3" />
											</button>
											<button
												type="button"
												className="p-1 hover:text-red-400 transition-colors focus:outline-none"
												onClick={(e) => {
													e.stopPropagation();
													setItemToDelete(sample.id);
												}}
											>
												<Trash2 className="h-3 w-3" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</aside>

				{viewMode === "gallery" ? (
					<div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#0a0a0a]">
						<div className="max-w-4xl mx-auto">
							<div className="mb-10">
								<h2 className="text-2xl font-bold font-mono tracking-tight mb-2">
									Template Gallery
								</h2>
								<p className="text-sm text-muted-foreground font-mono border-l-2 border-primary/50 pl-3">
									Select a starting point for your next WebGL experiment.
									<br />
									Each template comes pre-configured with a scene, camera, and
									render loop.
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{TEMPLATES.map((tpl) => (
									<button
										key={tpl.id}
										onClick={() => handleNewFromTemplate(tpl.code, tpl.title)}
										className="group text-left p-6 bg-black/40 border border-border hover:border-primary/50 hover:bg-white/5 transition-all duration-300 flex flex-col h-full focus:outline-none focus:ring-1 focus:ring-primary"
									>
										<div className="mb-6 flex justify-center py-8 bg-black/60 rounded-sm border border-white/5">
											{tpl.icon}
										</div>
										<h3 className="text-sm font-bold font-mono text-primary/90 mb-3 group-hover:text-primary">
											{tpl.title}
										</h3>
										<p className="text-xs text-muted-foreground font-mono leading-relaxed flex-1">
											{tpl.description}
										</p>
										<div className="mt-6 text-[10px] text-primary/50 font-mono tracking-widest uppercase group-hover:text-primary/80 transition-colors flex items-center gap-2">
											<span>Initialize</span>
											<span className="group-hover:translate-x-1 transition-transform">
												→
											</span>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-w-0 bg-[#0d1117] relative h-[40vh] lg:h-auto">
							<div className="h-10 bg-black/40 border-b border-border flex items-center justify-between px-2 sm:px-4 shrink-0 overflow-x-auto [scrollbar-width:none]">
								<div className="flex items-center gap-2 shrink-0">
									<div className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-wider hidden sm:block">
										{selectedSample?.language || "ts"}
									</div>
									<span className="text-xs font-mono text-muted-foreground truncate max-w-[120px] sm:max-w-none">
										{selectedSample?.title}
									</span>
								</div>
								<div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
									<Button
										onClick={handleSave}
										variant="ghost"
										size="sm"
										className="h-7 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-white/5"
										disabled={!selectedSample || code === selectedSample.code}
									>
										<Save className="h-3 w-3 sm:mr-1.5" />
										<span className="hidden sm:inline">[Save]</span>
									</Button>

									<Button
										onClick={handleRun}
										variant="outline"
										size="sm"
										className="h-7 text-[10px] sm:text-xs font-mono uppercase tracking-wider border-primary/30 text-primary hover:bg-primary hover:text-black transition-all"
									>
										<Play className="h-3 w-3 sm:mr-1.5" />
										<span className="hidden sm:inline">[Run_Code]</span>
										<span className="sm:hidden">Run</span>
									</Button>
								</div>
							</div>

							<div className="flex-1 relative overflow-hidden group">
								<div className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>

								<div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-black/20 border-r border-border/50 text-right pr-2 pt-4 select-none pointer-events-none text-muted-foreground/30 font-mono text-[11px] sm:text-[13px] leading-relaxed hidden md:block">
									{Array.from({
										length: Math.max(30, code.split("\n").length),
									}).map((_, i) => (
										<div key={i}>{i + 1}</div>
									))}
								</div>

								<div className="absolute inset-0 w-full h-full md:pl-12 overflow-y-auto custom-scrollbar bg-transparent">
									<Editor
										value={code}
										onValueChange={(code) => setCode(code)}
										highlight={(code) =>
											Prism.highlight(
												code,
												Prism.languages.typescript,
												"typescript",
											)
										}
										padding={16}
										style={{
											fontFamily: '"JetBrains Mono", monospace',
											fontSize: "13px",
											lineHeight: "1.6",
											backgroundColor: "transparent",
											minHeight: "100%",
										}}
										textareaClassName="focus:outline-none"
										className="w-full text-[#e2e8f0]"
									/>
								</div>
							</div>
						</div>

						<div className="w-full lg:w-[40%] xl:w-[45%] flex-1 lg:flex-none relative bg-black shrink-0 overflow-hidden group h-[50vh] lg:h-auto">
							<div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-3 pointer-events-none">
								<span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
									{"> output_canvas"}
								</span>
							</div>

							<iframe
								key={iframeKey}
								srcDoc={generateSandboxHTML(code)}
								className={`w-full h-full border-0 bg-black transition-opacity duration-300 ${isCompiling ? "opacity-30" : "opacity-100"}`}
								sandbox="allow-scripts allow-same-origin"
								title="Code Preview"
							/>
							<div
								className={`absolute inset-0 bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${
									isCompiling
										? "opacity-100 visible scale-100"
										: "opacity-0 invisible scale-105"
								}`}
							>
								<div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/50 border-t-primary rounded-full animate-spin mb-4" />
								<span className="text-primary font-mono text-[10px] sm:text-xs tracking-widest uppercase animate-pulse">
									compiling...
								</span>
							</div>
						</div>
					</>
				)}
			</div>

			<style
				dangerouslySetInnerHTML={{
					__html: `
				.custom-scrollbar::-webkit-scrollbar {
					width: 8px;
					height: 8px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(0,0,0,0.2);
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(255,255,255,0.1);
					border-radius: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(255,255,255,0.2);
				}
				
				/* Prism JS Overrides to match our dark theme */
				code[class*="language-"], pre[class*="language-"] {
					text-shadow: none !important;
					color: #e2e8f0 !important;
				}
				.token.comment, .token.prolog, .token.doctype, .token.cdata {
					color: #64748b !important;
					font-style: italic;
				}
				.token.punctuation {
					color: #94a3b8 !important;
				}
				.token.namespace {
					opacity: .7;
				}
				.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted {
					color: #f472b6 !important; /* Fuchsia */
				}
				.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted {
					color: #2dd4bf !important; /* Cyan */
				}
				.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
					color: #e2e8f0 !important;
				}
				.token.atrule, .token.attr-value, .token.keyword {
					color: #38bdf8 !important; /* Teal */
				}
				.token.function, .token.class-name {
					color: #fbbf24 !important; /* Light blue/yellow */
				}
				.token.regex, .token.important, .token.variable {
					color: #fb923c !important; /* Orange */
				}
			`,
				}}
			/>
		</div>
	);
}

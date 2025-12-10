"use client";

import { useUser } from "@clerk/nextjs";
import { Code2, Play, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CodeSample } from "@/app/api/code-samples/route";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CodeSandboxPage() {
	const { user } = useUser();
	const [samples, setSamples] = useState<CodeSample[]>([]);
	const [selectedSample, setSelectedSample] = useState<CodeSample | null>(null);
	const [loading, setLoading] = useState(true);
	const [code, setCode] = useState("");
	const [iframeKey, setIframeKey] = useState(0);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const lastSelectedSampleIdRef = useRef<string | null>(null);
	const isFetchingRef = useRef(false);

	const fetchSamples = useCallback(
		async (preserveSelection = true) => {
			if (isFetchingRef.current) return;

			try {
				isFetchingRef.current = true;
				const response = await fetch("/api/code-samples");
				const data = await response.json();
				const fetchedSamples = data.samples || [];

				setSamples(fetchedSamples);

				if (fetchedSamples.length > 0) {
					if (!selectedSample) {
						setSelectedSample(fetchedSamples[0]);
					} else if (preserveSelection && selectedSample) {
						const stillExists = fetchedSamples.find(
							(s: CodeSample) => s.id === selectedSample.id,
						);
						if (!stillExists) {
							setSelectedSample(fetchedSamples[0]);
						}
					}
				} else {
					setSelectedSample(null);
				}
			} catch (error) {
				console.error("Failed to fetch samples:", error);
			} finally {
				isFetchingRef.current = false;
				setLoading(false);
			}
		},
		[selectedSample],
	);

	useEffect(() => {
		fetchSamples(false); // Initial load - don't preserve selection

		// Listen for code sample saved events
		const handleSampleSaved = () => {
			setTimeout(() => fetchSamples(true), 500); // Small delay to ensure API has processed
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
		} else if (!selectedSample) {
			setCode("");
			lastSelectedSampleIdRef.current = null;
		}
	}, [selectedSample]);

	useEffect(() => {
		// Auto-resize textarea when code changes
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, []);

	const handleDelete = async (sampleId: string) => {
		try {
			await fetch(`/api/code-samples?id=${sampleId}`, {
				method: "DELETE",
			});
			setSamples(samples.filter((s) => s.id !== sampleId));
			if (selectedSample?.id === sampleId) {
				const remaining = samples.filter((s) => s.id !== sampleId);
				setSelectedSample(remaining.length > 0 ? remaining[0] : null);
			}
		} catch (error) {
			console.error("Failed to delete sample:", error);
		}
	};

	const handleRun = () => {
		setIframeKey((prev) => prev + 1);
	};

	const handleSave = async () => {
		if (!selectedSample) return;

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
			setSamples(
				samples.map((s) => (s.id === selectedSample.id ? { ...s, code } : s)),
			);
			setSelectedSample({ ...selectedSample, code });
			lastSelectedSampleIdRef.current = selectedSample.id; // Update ref to prevent overwrite
		} catch (error) {
			console.error("Failed to save:", error);
		}
	};

	const defaultCode = `import * as THREE from "three";

// Your Three.js code here
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});`;

	const handleNewSample = async (e?: React.MouseEvent) => {
		e?.preventDefault();
		e?.stopPropagation();

		const newSample: CodeSample = {
			id: `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`,
			title: "New Code Sample",
			code: defaultCode,
			language: "typescript",
			concept: "",
			explanation: "",
			createdAt: new Date().toISOString(),
			userId: user?.id || "anonymous",
		};

		setSamples([...samples, newSample]);
		setSelectedSample(newSample);

		try {
			await fetch("/api/code-samples", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newSample),
			});
		} catch (error) {
			console.error("Failed to create new sample:", error);
			setSamples(samples);
			if (selectedSample) {
				setSelectedSample(selectedSample);
			}
		}
	};

	const generateSandboxHTML = (codeContent: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Sandbox</title>
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
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-muted-foreground font-mono">loading...</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-background flex flex-col overflow-hidden">
			{/* Header */}
			<header>
				<div className="mx-4 py-4">
					<div className="flex items-center justify-between w-full">
						<div className="flex-shrink-0">
							<h1 className="text-2xl font-bold font-mono tracking-tight">
								code_sandbox
							</h1>
							<p className="text-xs text-muted-foreground font-mono mt-1">
								run and modify your code samples
							</p>
						</div>
						<div className="flex items-center gap-2 flex-shrink-0 ml-auto">
							<Button
								onClick={(e) => handleNewSample(e)}
								type="button"
								variant="outline"
								size="sm"
								className="font-mono text-xs"
							>
								<Plus className="h-3 w-3 mr-2" />
								new
							</Button>
							<Button
								onClick={handleRun}
								variant="outline"
								size="sm"
								className="font-mono text-xs"
								disabled={!selectedSample}
							>
								<Play className="h-3 w-3 mr-2" />
								run
							</Button>
							<Button
								onClick={handleSave}
								variant="outline"
								size="sm"
								className="font-mono text-xs"
								disabled={!selectedSample}
							>
								save
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="flex flex-1 overflow-hidden min-h-0">
				{/* Sidebar - Code Samples List */}
				<aside className="w-64 bg-black/10 overflow-y-auto">
					<div className="p-4">
						<h2 className="text-sm font-semibold font-mono mb-3">
							samples ({samples.length})
						</h2>
						{samples.length === 0 ? (
							<div className="text-xs text-muted-foreground font-mono py-8 text-center">
								no samples yet.
								<br />
								<br />
								ask the assistant to create one!
							</div>
						) : (
							<div className="space-y-2">
								{samples.map((sample) => (
									<div
										key={sample.id}
										role="button"
										tabIndex={0}
										className={`w-full p-3 border border-border rounded cursor-pointer transition-all text-left ${
											selectedSample?.id === sample.id
												? "bg-sidebar-accent border-foreground/40"
												: "bg-black/40 hover:bg-black/60"
										}`}
										onClick={() => setSelectedSample(sample)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setSelectedSample(sample);
											}
										}}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0">
												<h3 className="text-xs font-semibold font-mono truncate">
													{sample.title}
												</h3>
												<p className="text-[10px] text-muted-foreground font-mono mt-1 truncate">
													{sample.concept}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 shrink-0"
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(sample.id);
												}}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</aside>

				{/* Main Content */}
				<div className="flex-1 flex flex-col">
					{selectedSample ? (
						<>
							{/* Code Editor */}
							<div className="flex-1 flex flex-col border-b border-border min-h-0">
								<div className="bg-black/40 px-4 py-2 border-b border-border shrink-0">
									<div className="flex items-center gap-2">
										<Code2 className="h-3 w-3 text-muted-foreground" />
										<span className="text-xs font-mono text-muted-foreground">
											{selectedSample.language}
										</span>
									</div>
								</div>
								<ScrollArea className="flex-1 min-h-0">
									<div className="p-4 bg-black/40">
										<textarea
											ref={textareaRef}
											value={code}
											onChange={(e) => {
												setCode(e.target.value);
												// Auto-resize textarea
												const target = e.target;
												target.style.height = "auto";
												target.style.height = `${target.scrollHeight}px`;
											}}
											className="w-full font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-0 bg-transparent border-0 p-0 block [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
											style={{
												overflow: "hidden",
												overflowY: "hidden",
												overflowX: "hidden",
											}}
											placeholder="// Your code here..."
											spellCheck={false}
											rows={1}
										/>
									</div>
								</ScrollArea>
							</div>

							{/* Preview */}
							<div className="flex-1 relative bg-black min-h-0">
								<iframe
									key={iframeKey}
									srcDoc={generateSandboxHTML(code)}
									className="w-full h-full border-0"
									sandbox="allow-scripts allow-same-origin"
									title="Code Preview"
								/>
							</div>
						</>
					) : (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-sm text-muted-foreground font-mono">
									no sample selected
								</p>
								<p className="text-xs text-muted-foreground font-mono mt-2">
									select a sample from the sidebar or ask the assistant to
									create one
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

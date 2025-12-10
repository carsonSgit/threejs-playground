"use client";

/** Inspired by @fernandojsg on GitHub
 *
 * https://threejs.org/examples/webgl_buffergeometry_drawrange.html
 *
 * Very cool use of buffergeometry drawrange to create a particle network effect!
 */

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useSidebar } from "@/components/ui/sidebar";

interface EffectSettings {
	showDots: boolean;
	showLines: boolean;
	minDistance: number;
	limitConnections: boolean;
	maxConnections: number;
	particleCount: number;
}

interface ParticleData {
	velocity: THREE.Vector3;
	numConnections: number;
}

export default function ParticleNetwork() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [settings, setSettings] = useState<EffectSettings>({
		showDots: true,
		showLines: true,
		minDistance: 150,
		limitConnections: false,
		maxConnections: 20,
		particleCount: 500,
	});

	// Refs to store Three.js objects for settings updates
	const pointCloudRef = useRef<THREE.Points | null>(null);
	const linesMeshRef = useRef<THREE.LineSegments | null>(null);
	const particlesGeomRef = useRef<THREE.BufferGeometry | null>(null);
	const settingsRef = useRef(settings);
	const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

	// Get sidebar state - sidebar context should always be available via SidebarWrapper
	const { state: sidebarState, toggleSidebar } = useSidebar();

	useEffect(() => {
		setPortalTarget(document.getElementById("sidebar-controls"));
	}, []);

	useEffect(() => {
		settingsRef.current = settings;
		if (pointCloudRef.current) {
			pointCloudRef.current.visible = settings.showDots;
		}
		if (linesMeshRef.current) {
			linesMeshRef.current.visible = settings.showLines;
		}
		if (particlesGeomRef.current) {
			particlesGeomRef.current.setDrawRange(0, settings.particleCount);
		}
	}, [settings]);

	useEffect(() => {
		if (!containerRef.current) return;

		const maxParticleCount = 1000;
		const r = 800;
		const rHalf = r / 2;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);

		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			1,
			4000,
		);
		camera.position.z = 1750;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.minDistance = 1000;
		controls.maxDistance = 3000;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const group = new THREE.Group();
		scene.add(group);

		const helper = new THREE.BoxHelper(
			new THREE.Mesh(new THREE.BoxGeometry(r, r, r)),
		);
		(helper.material as THREE.LineBasicMaterial).color.setHex(0x333333);
		(helper.material as THREE.LineBasicMaterial).blending =
			THREE.AdditiveBlending;
		(helper.material as THREE.LineBasicMaterial).transparent = true;
		group.add(helper);

		const segments = maxParticleCount * maxParticleCount;
		const positions = new Float32Array(segments * 3);
		const colors = new Float32Array(segments * 3);

		const pMaterial = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 4,
			blending: THREE.AdditiveBlending,
			transparent: true,
			sizeAttenuation: false,
		});

		const particles = new THREE.BufferGeometry();
		const particlePositions = new Float32Array(maxParticleCount * 3);
		const particlesData: ParticleData[] = [];

		for (let i = 0; i < maxParticleCount; i++) {
			const x = Math.random() * r - rHalf;
			const y = Math.random() * r - rHalf;
			const z = Math.random() * r - rHalf;

			particlePositions[i * 3] = x;
			particlePositions[i * 3 + 1] = y;
			particlePositions[i * 3 + 2] = z;

			particlesData.push({
				velocity: new THREE.Vector3(
					-1 + Math.random() * 2,
					-1 + Math.random() * 2,
					-1 + Math.random() * 2,
				),
				numConnections: 0,
			});
		}

		particles.setDrawRange(0, settingsRef.current.particleCount);
		particles.setAttribute(
			"position",
			new THREE.BufferAttribute(particlePositions, 3).setUsage(
				THREE.DynamicDrawUsage,
			),
		);

		particlesGeomRef.current = particles;

		const pointCloud = new THREE.Points(particles, pMaterial);
		pointCloudRef.current = pointCloud;
		group.add(pointCloud);

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
		);
		geometry.setAttribute(
			"color",
			new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage),
		);
		geometry.computeBoundingSphere();
		geometry.setDrawRange(0, 0);

		const material = new THREE.LineBasicMaterial({
			vertexColors: true,
			blending: THREE.AdditiveBlending,
			transparent: true,
		});

		const linesMesh = new THREE.LineSegments(geometry, material);
		linesMeshRef.current = linesMesh;
		group.add(linesMesh);

		function animate() {
			const currentSettings = settingsRef.current;
			let vertexpos = 0;
			let colorpos = 0;
			let numConnected = 0;

			for (let i = 0; i < currentSettings.particleCount; i++) {
				particlesData[i].numConnections = 0;
			}

			for (let i = 0; i < currentSettings.particleCount; i++) {
				const particleData = particlesData[i];

				particlePositions[i * 3] += particleData.velocity.x;
				particlePositions[i * 3 + 1] += particleData.velocity.y;
				particlePositions[i * 3 + 2] += particleData.velocity.z;

				if (
					particlePositions[i * 3 + 1] < -rHalf ||
					particlePositions[i * 3 + 1] > rHalf
				) {
					particleData.velocity.y = -particleData.velocity.y;
				}
				if (
					particlePositions[i * 3] < -rHalf ||
					particlePositions[i * 3] > rHalf
				) {
					particleData.velocity.x = -particleData.velocity.x;
				}
				if (
					particlePositions[i * 3 + 2] < -rHalf ||
					particlePositions[i * 3 + 2] > rHalf
				) {
					particleData.velocity.z = -particleData.velocity.z;
				}
				if (
					currentSettings.limitConnections &&
					particleData.numConnections >= currentSettings.maxConnections
				) {
					continue;
				}

				for (let j = i + 1; j < currentSettings.particleCount; j++) {
					const particleDataB = particlesData[j];

					if (
						currentSettings.limitConnections &&
						particleDataB.numConnections >= currentSettings.maxConnections
					) {
						continue;
					}

					const dx = particlePositions[i * 3] - particlePositions[j * 3];
					const dy =
						particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
					const dz =
						particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
					const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

					if (dist < currentSettings.minDistance) {
						particleData.numConnections++;
						particleDataB.numConnections++;

						const alpha = 1.0 - dist / currentSettings.minDistance;

						positions[vertexpos++] = particlePositions[i * 3];
						positions[vertexpos++] = particlePositions[i * 3 + 1];
						positions[vertexpos++] = particlePositions[i * 3 + 2];

						positions[vertexpos++] = particlePositions[j * 3];
						positions[vertexpos++] = particlePositions[j * 3 + 1];
						positions[vertexpos++] = particlePositions[j * 3 + 2];

						colors[colorpos++] = alpha;
						colors[colorpos++] = alpha;
						colors[colorpos++] = alpha;

						colors[colorpos++] = alpha;
						colors[colorpos++] = alpha;
						colors[colorpos++] = alpha;

						numConnected++;
					}
				}
			}

			linesMesh.geometry.setDrawRange(0, numConnected * 2);
			linesMesh.geometry.attributes.position.needsUpdate = true;
			linesMesh.geometry.attributes.color.needsUpdate = true;

			pointCloud.geometry.attributes.position.needsUpdate = true;

			const time = Date.now() * 0.001;
			group.rotation.y = time * 0.1;

			controls.update();
			renderer.render(scene, camera);
		}

		renderer.setAnimationLoop(animate);

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		containerRef.current.style.position = "relative";
		containerRef.current.style.left = "-150px";
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();
			particles.dispose();
			geometry.dispose();
			pMaterial.dispose();
			material.dispose();
			renderer.dispose();

			pointCloudRef.current = null;
			linesMeshRef.current = null;
			particlesGeomRef.current = null;

			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, []);

	return (
		<>
			<div ref={containerRef} className="w-full h-full" />
			{portalTarget &&
				createPortal(
					sidebarState === "collapsed" ? (
						<div className="flex items-center justify-center h-full">
							<button
								onClick={toggleSidebar}
								className="flex items-center justify-center w-8 h-8 rounded hover:bg-sidebar-accent transition-colors text-sidebar-foreground hover:text-sidebar-accent-foreground"
								aria-label="Open Settings"
							>
								<Settings className="h-4 w-4" />
							</button>
						</div>
					) : (
						<div className="p-4 space-y-4 text-xs">
							<h3 className="font-semibold mb-3 text-sidebar-foreground">
								Network Controls
							</h3>
							<div className="space-y-4">
								<label className="flex items-center justify-between cursor-pointer">
									<span className="text-sidebar-foreground/80">Show Dots</span>
									<input
										type="checkbox"
										checked={settings.showDots}
										onChange={(e) =>
											setSettings((s) => ({ ...s, showDots: e.target.checked }))
										}
										className="w-4 h-4 accent-sidebar-accent-foreground cursor-pointer"
									/>
								</label>

								<label className="flex items-center justify-between cursor-pointer">
									<span className="text-sidebar-foreground/80">Show Lines</span>
									<input
										type="checkbox"
										checked={settings.showLines}
										onChange={(e) =>
											setSettings((s) => ({
												...s,
												showLines: e.target.checked,
											}))
										}
										className="w-4 h-4 accent-sidebar-accent-foreground cursor-pointer"
									/>
								</label>

								<div className="space-y-2">
									<div className="flex justify-between text-sidebar-foreground/80">
										<span>Distance</span>
										<span>{settings.minDistance}</span>
									</div>
									<input
										type="range"
										min="10"
										max="300"
										value={settings.minDistance}
										onChange={(e) =>
											setSettings((s) => ({
												...s,
												minDistance: Number(e.target.value),
											}))
										}
										className="w-full h-1 bg-sidebar-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-sidebar-foreground [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-sidebar-accent-foreground"
									/>
								</div>

								<label className="flex items-center justify-between cursor-pointer">
									<span className="text-sidebar-foreground/80">
										Limit Connections
									</span>
									<input
										type="checkbox"
										checked={settings.limitConnections}
										onChange={(e) =>
											setSettings((s) => ({
												...s,
												limitConnections: e.target.checked,
											}))
										}
										className="w-4 h-4 accent-sidebar-accent-foreground cursor-pointer"
									/>
								</label>

								<div className="space-y-2">
									<div className="flex justify-between text-sidebar-foreground/80">
										<span>Max Conn.</span>
										<span>{settings.maxConnections}</span>
									</div>
									<input
										type="range"
										min="0"
										max="30"
										step="1"
										value={settings.maxConnections}
										onChange={(e) =>
											setSettings((s) => ({
												...s,
												maxConnections: Number(e.target.value),
											}))
										}
										disabled={!settings.limitConnections}
										className="w-full h-1 bg-sidebar-border rounded-full appearance-none cursor-pointer disabled:opacity-30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-sidebar-foreground [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-sidebar-accent-foreground"
									/>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between text-sidebar-foreground/80">
										<span>Particles</span>
										<span>{settings.particleCount}</span>
									</div>
									<input
										type="range"
										min="0"
										max="1000"
										step="1"
										value={settings.particleCount}
										onChange={(e) =>
											setSettings((s) => ({
												...s,
												particleCount: Number(e.target.value),
											}))
										}
										className="w-full h-1 bg-sidebar-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-sidebar-foreground [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-sidebar-accent-foreground"
									/>
								</div>
							</div>
						</div>
					),
					portalTarget,
				)}
		</>
	);
}

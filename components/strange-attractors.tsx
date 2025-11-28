"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// Attractor parameters
const LORENZ = {
	sigma: 10,
	rho: 28,
	beta: 8 / 3,
	scale: 0.05,
	dt: 0.005,
};

const ROSSLER = {
	a: 0.2,
	b: 0.2,
	c: 5.7,
	scale: 0.15,
	dt: 0.015,
};

const AIZAWA = {
	a: 0.95,
	b: 0.7,
	c: 0.6,
	d: 3.5,
	e: 0.25,
	f: 0.1,
	scale: 1.2,
	dt: 0.01,
};

// Compute Lorenz attractor step
function lorenzStep(
	x: number,
	y: number,
	z: number,
	dt: number,
): [number, number, number] {
	const dx = LORENZ.sigma * (y - x) * dt;
	const dy = (x * (LORENZ.rho - z) - y) * dt;
	const dz = (x * y - LORENZ.beta * z) * dt;
	return [x + dx, y + dy, z + dz];
}

// Compute Rössler attractor step
function rosslerStep(
	x: number,
	y: number,
	z: number,
	dt: number,
): [number, number, number] {
	const dx = (-y - z) * dt;
	const dy = (x + ROSSLER.a * y) * dt;
	const dz = (ROSSLER.b + z * (x - ROSSLER.c)) * dt;
	return [x + dx, y + dy, z + dz];
}

// Compute Aizawa attractor step
function aizawaStep(
	x: number,
	y: number,
	z: number,
	dt: number,
): [number, number, number] {
	const dx = ((z - AIZAWA.b) * x - AIZAWA.d * y) * dt;
	const dy = (AIZAWA.d * x + (z - AIZAWA.b) * y) * dt;
	const dz =
		(AIZAWA.c +
			AIZAWA.a * z -
			(z * z * z) / 3 -
			(x * x + y * y) * (1 + AIZAWA.e * z) +
			AIZAWA.f * z * x * x * x) *
		dt;
	return [x + dx, y + dy, z + dz];
}

// Vertex shader for attractor particles
const attractorVertexShader = `
uniform float uTime;
uniform float uSize;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

attribute float aAge;
attribute float aSpeed;

varying vec3 vColor;
varying float vAlpha;

void main() {
    // Color based on position and age for beautiful gradients
    float colorMix = sin(aAge * 6.28318 + uTime * 0.5) * 0.5 + 0.5;
    float colorMix2 = cos(aAge * 3.14159 + uTime * 0.3) * 0.5 + 0.5;
    
    vec3 color1 = mix(uColorA, uColorB, colorMix);
    vColor = mix(color1, uColorC, colorMix2);
    
    // Pulsing glow based on speed
    float pulse = sin(uTime * 2.0 + aAge * 10.0) * 0.3 + 0.7;
    vColor *= (0.8 + aSpeed * 0.4) * pulse;
    
    // Alpha based on age (fade in/out at ends)
    float fadeIn = smoothstep(0.0, 0.05, aAge);
    float fadeOut = smoothstep(1.0, 0.9, aAge);
    vAlpha = fadeIn * fadeOut * (0.6 + 0.4 * pulse);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (200.0 / -mvPosition.z) * (0.5 + aSpeed * 0.5);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const attractorFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
    // Soft circular particle with glow
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Soft falloff with bright core
    float alpha = smoothstep(0.5, 0.0, dist);
    float core = smoothstep(0.3, 0.0, dist) * 0.5;
    
    vec3 color = vColor * (1.0 + core);
    
    gl_FragColor = vec4(color, alpha * vAlpha);
}
`;

// Trail line shader for connecting particles
const trailVertexShader = `
uniform float uTime;
attribute float aLineAge;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vColor = aColor;
    
    // Fade based on age
    float fadeIn = smoothstep(0.0, 0.1, aLineAge);
    float fadeOut = smoothstep(1.0, 0.7, aLineAge);
    vAlpha = fadeIn * fadeOut * 0.3;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const trailFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
    gl_FragColor = vec4(vColor, vAlpha);
}
`;

// Mathematical formulas background shader
const formulaVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const formulaFragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uOpacity;

varying vec2 vUv;

// Pseudo-random function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Smooth noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

void main() {
    vec2 uv = vUv;
    
    // Create flowing mathematical grid patterns
    float time = uTime * 0.1;
    
    // Warped grid lines
    vec2 warpedUv = uv + vec2(
        fbm(uv * 3.0 + time),
        fbm(uv * 3.0 + time + 100.0)
    ) * 0.1;
    
    // Grid pattern
    float gridX = smoothstep(0.48, 0.5, abs(fract(warpedUv.x * 20.0) - 0.5));
    float gridY = smoothstep(0.48, 0.5, abs(fract(warpedUv.y * 20.0) - 0.5));
    float grid = max(gridX, gridY) * 0.15;
    
    // Flowing energy lines
    float flow1 = fbm(uv * 5.0 + vec2(time, 0.0));
    float flow2 = fbm(uv * 7.0 - vec2(0.0, time * 1.3));
    
    // Subtle mathematical symbols effect (just abstract patterns)
    float symbols = smoothstep(0.6, 0.65, fbm(uv * 15.0 + time * 0.5)) * 0.2;
    
    // Combine effects
    float pattern = grid + symbols;
    pattern += (flow1 + flow2) * 0.05;
    
    // Color gradient
    vec3 color1 = vec3(0.1, 0.05, 0.15); // Deep purple
    vec3 color2 = vec3(0.02, 0.08, 0.12); // Dark teal
    vec3 bgColor = mix(color1, color2, uv.y + fbm(uv * 2.0 + time) * 0.3);
    
    // Add pattern glow
    vec3 glowColor = vec3(0.3, 0.4, 0.8) * pattern;
    
    vec3 finalColor = bgColor + glowColor;
    
    gl_FragColor = vec4(finalColor, uOpacity);
}
`;

interface AttractorSystem {
	positions: Float32Array;
	ages: Float32Array;
	speeds: Float32Array;
	currentPoints: { x: number; y: number; z: number }[];
	geometry: THREE.BufferGeometry;
	material: THREE.ShaderMaterial;
	points: THREE.Points;
	trailGeometry: THREE.BufferGeometry;
	trailMaterial: THREE.ShaderMaterial;
	trailLines: THREE.LineSegments;
	step: (x: number, y: number, z: number, dt: number) => [number, number, number];
	scale: number;
	dt: number;
	offset: THREE.Vector3;
}

export default function StrangeAttractors() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// Scene setup
		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 0, 12);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 1);
		containerRef.current.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.minDistance = 5;
		controls.maxDistance = 30;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.3;

		// Background with mathematical grid
		const bgGeometry = new THREE.PlaneGeometry(100, 100);
		const bgMaterial = new THREE.ShaderMaterial({
			vertexShader: formulaVertexShader,
			fragmentShader: formulaFragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: {
					value: new THREE.Vector2(window.innerWidth, window.innerHeight),
				},
				uOpacity: { value: 1.0 },
			},
			transparent: true,
			depthWrite: false,
		});
		const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
		bgMesh.position.z = -30;
		scene.add(bgMesh);

		// Create attractor systems
		const particleCount = 8000;
		const attractors: AttractorSystem[] = [];

		// Color palettes for each attractor
		const colorPalettes = [
			// Lorenz - Electric blue to cyan to white
			{
				a: new THREE.Color(0x00d4ff),
				b: new THREE.Color(0x7b2ff7),
				c: new THREE.Color(0xffffff),
			},
			// Rössler - Hot magenta to orange to gold
			{
				a: new THREE.Color(0xff0080),
				b: new THREE.Color(0xff6b35),
				c: new THREE.Color(0xffd700),
			},
			// Aizawa - Emerald to teal to white
			{
				a: new THREE.Color(0x00ff88),
				b: new THREE.Color(0x00b4d8),
				c: new THREE.Color(0xe0ffff),
			},
		];

		// Attractor configurations
		const attractorConfigs = [
			{
				step: lorenzStep,
				scale: LORENZ.scale,
				dt: LORENZ.dt,
				offset: new THREE.Vector3(-5, 0, 0),
				init: () => ({
					x: Math.random() * 0.1,
					y: Math.random() * 0.1,
					z: Math.random() * 0.1 + 25,
				}),
			},
			{
				step: rosslerStep,
				scale: ROSSLER.scale,
				dt: ROSSLER.dt,
				offset: new THREE.Vector3(5, 0, 0),
				init: () => ({
					x: Math.random() * 0.1 + 0.1,
					y: Math.random() * 0.1,
					z: Math.random() * 0.1,
				}),
			},
			{
				step: aizawaStep,
				scale: AIZAWA.scale,
				dt: AIZAWA.dt,
				offset: new THREE.Vector3(0, 4, 0),
				init: () => ({
					x: Math.random() * 0.1 + 0.1,
					y: Math.random() * 0.1,
					z: Math.random() * 0.1,
				}),
			},
		];

		// Create each attractor system
		for (let a = 0; a < 3; a++) {
			const config = attractorConfigs[a];
			const colors = colorPalettes[a];

			const positions = new Float32Array(particleCount * 3);
			const ages = new Float32Array(particleCount);
			const speeds = new Float32Array(particleCount);
			const currentPoints: { x: number; y: number; z: number }[] = [];

			// Initialize particles
			for (let i = 0; i < particleCount; i++) {
				const point = config.init();
				currentPoints.push(point);

				const idx = i * 3;
				positions[idx] = point.x * config.scale + config.offset.x;
				positions[idx + 1] = point.y * config.scale + config.offset.y;
				positions[idx + 2] = point.z * config.scale + config.offset.z;

				ages[i] = Math.random();
				speeds[i] = 0.5 + Math.random() * 0.5;
			}

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			geometry.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
			geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

			const material = new THREE.ShaderMaterial({
				vertexShader: attractorVertexShader,
				fragmentShader: attractorFragmentShader,
				uniforms: {
					uTime: { value: 0 },
					uSize: { value: 2.5 },
					uColorA: { value: colors.a },
					uColorB: { value: colors.b },
					uColorC: { value: colors.c },
				},
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
			});

			const points = new THREE.Points(geometry, material);
			scene.add(points);

			// Trail lines (connecting nearby particles)
			const trailPositions = new Float32Array(particleCount * 6); // 2 vertices per line
			const trailAges = new Float32Array(particleCount * 2);
			const trailColors = new Float32Array(particleCount * 6);

			const trailGeometry = new THREE.BufferGeometry();
			trailGeometry.setAttribute(
				"position",
				new THREE.BufferAttribute(trailPositions, 3),
			);
			trailGeometry.setAttribute(
				"aLineAge",
				new THREE.BufferAttribute(trailAges, 1),
			);
			trailGeometry.setAttribute(
				"aColor",
				new THREE.BufferAttribute(trailColors, 3),
			);

			const trailMaterial = new THREE.ShaderMaterial({
				vertexShader: trailVertexShader,
				fragmentShader: trailFragmentShader,
				uniforms: {
					uTime: { value: 0 },
				},
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
			});

			const trailLines = new THREE.LineSegments(trailGeometry, trailMaterial);
			scene.add(trailLines);

			attractors.push({
				positions,
				ages,
				speeds,
				currentPoints,
				geometry,
				material,
				points,
				trailGeometry,
				trailMaterial,
				trailLines,
				step: config.step,
				scale: config.scale,
				dt: config.dt,
				offset: config.offset,
			});
		}

		// Post-processing
		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			1.5, // strength
			0.4, // radius
			0.1, // threshold
		);
		composer.addPass(bloomPass);

		// Animation loop
		let time = 0;
		let animationId: number;

		function animate() {
			animationId = requestAnimationFrame(animate);
			time += 0.016;

			// Update background
			bgMaterial.uniforms.uTime.value = time;

			// Update each attractor
			for (const attractor of attractors) {
				attractor.material.uniforms.uTime.value = time;
				attractor.trailMaterial.uniforms.uTime.value = time;

				const positions = attractor.geometry.attributes.position
					.array as Float32Array;
				const ages = attractor.geometry.attributes.aAge.array as Float32Array;
				const speeds = attractor.geometry.attributes.aSpeed
					.array as Float32Array;
				const trailPositions = attractor.trailGeometry.attributes.position
					.array as Float32Array;
				const trailAges = attractor.trailGeometry.attributes.aLineAge
					.array as Float32Array;
				const trailColors = attractor.trailGeometry.attributes.aColor
					.array as Float32Array;

				for (let i = 0; i < particleCount; i++) {
					const point = attractor.currentPoints[i];
					const speed = speeds[i];

					// Step the attractor equation multiple times for smoother trails
					const steps = Math.ceil(speed * 3);
					for (let s = 0; s < steps; s++) {
						const [nx, ny, nz] = attractor.step(
							point.x,
							point.y,
							point.z,
							attractor.dt * speed,
						);
						point.x = nx;
						point.y = ny;
						point.z = nz;
					}

					// Update age
					ages[i] += 0.001 * speed;
					if (ages[i] > 1) {
						ages[i] = 0;
						// Reset to random starting point near attractor
						point.x = (Math.random() - 0.5) * 1;
						point.y = (Math.random() - 0.5) * 1;
						point.z = Math.random() * 5 + 20;
					}

					const idx = i * 3;
					const prevX = positions[idx];
					const prevY = positions[idx + 1];
					const prevZ = positions[idx + 2];

					positions[idx] = point.x * attractor.scale + attractor.offset.x;
					positions[idx + 1] = point.y * attractor.scale + attractor.offset.y;
					positions[idx + 2] = point.z * attractor.scale + attractor.offset.z;

					// Update trail lines (connect previous to current position)
					const trailIdx = i * 6;
					trailPositions[trailIdx] = prevX;
					trailPositions[trailIdx + 1] = prevY;
					trailPositions[trailIdx + 2] = prevZ;
					trailPositions[trailIdx + 3] = positions[idx];
					trailPositions[trailIdx + 4] = positions[idx + 1];
					trailPositions[trailIdx + 5] = positions[idx + 2];

					const trailAgeIdx = i * 2;
					trailAges[trailAgeIdx] = ages[i];
					trailAges[trailAgeIdx + 1] = ages[i];

					// Trail colors match particle colors
					const colorMix = Math.sin(ages[i] * 6.28318 + time * 0.5) * 0.5 + 0.5;
					const r = 0.5 + colorMix * 0.5;
					const g = 0.3 + (1 - colorMix) * 0.4;
					const b = 0.8;
					trailColors[trailIdx] = r;
					trailColors[trailIdx + 1] = g;
					trailColors[trailIdx + 2] = b;
					trailColors[trailIdx + 3] = r;
					trailColors[trailIdx + 4] = g;
					trailColors[trailIdx + 5] = b;
				}

				attractor.geometry.attributes.position.needsUpdate = true;
				attractor.geometry.attributes.aAge.needsUpdate = true;
				attractor.trailGeometry.attributes.position.needsUpdate = true;
				attractor.trailGeometry.attributes.aLineAge.needsUpdate = true;
				attractor.trailGeometry.attributes.aColor.needsUpdate = true;
			}

			controls.update();
			composer.render();
		}

		animate();

		// Handle resize
		const handleResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;

			camera.aspect = w / h;
			camera.updateProjectionMatrix();

			renderer.setSize(w, h);
			composer.setSize(w, h);

			bgMaterial.uniforms.uResolution.value.set(w, h);
		};

		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => {
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(animationId);
			controls.dispose();

			for (const attractor of attractors) {
				attractor.geometry.dispose();
				attractor.material.dispose();
				attractor.trailGeometry.dispose();
				attractor.trailMaterial.dispose();
			}

			bgGeometry.dispose();
			bgMaterial.dispose();
			renderer.dispose();

			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, []);

	return (
		<div ref={containerRef} className="w-full h-full">
			{/* Mathematical formulas overlay */}
			<div className="fixed top-24 left-6 z-10 pointer-events-none select-none font-mono text-xs space-y-6 opacity-60">
				<div className="space-y-1 text-cyan-300">
					<div className="text-[10px] uppercase tracking-widest text-cyan-500 mb-2">
						Lorenz Attractor
					</div>
					<div>dx/dt = σ(y - x)</div>
					<div>dy/dt = x(ρ - z) - y</div>
					<div>dz/dt = xy - βz</div>
					<div className="text-cyan-500/50 text-[10px] mt-1">
						σ=10, ρ=28, β=8/3
					</div>
				</div>

				<div className="space-y-1 text-pink-300">
					<div className="text-[10px] uppercase tracking-widest text-pink-500 mb-2">
						Rössler Attractor
					</div>
					<div>dx/dt = -y - z</div>
					<div>dy/dt = x + ay</div>
					<div>dz/dt = b + z(x - c)</div>
					<div className="text-pink-500/50 text-[10px] mt-1">
						a=0.2, b=0.2, c=5.7
					</div>
				</div>

				<div className="space-y-1 text-emerald-300">
					<div className="text-[10px] uppercase tracking-widest text-emerald-500 mb-2">
						Aizawa Attractor
					</div>
					<div>dx/dt = (z-b)x - dy</div>
					<div>dy/dt = dx + (z-b)y</div>
					<div>dz/dt = c + az - z³/3</div>
					<div className="text-emerald-500/50 text-[10px] mt-1">
						a=0.95, b=0.7, c=0.6
					</div>
				</div>
			</div>

			{/* Legend */}
			<div className="fixed bottom-24 left-6 z-10 pointer-events-none select-none font-mono text-[10px] space-y-2 opacity-50">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
					<span className="text-cyan-300">Lorenz System</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400" />
					<span className="text-pink-300">Rössler System</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
					<span className="text-emerald-300">Aizawa System</span>
				</div>
			</div>
		</div>
	);
}


"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// Simplex noise for smooth organic motion
const simplexNoise3D = `
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// Chrome sphere vertex shader with organic deformation
const chromeVertexShader = `
${simplexNoise3D}

uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseStrength;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vReflect;

void main() {
  // Create organic pulsating deformation - smoother, fewer lumps, slower and gentler
  float noise1 = snoise(position * uNoiseScale + uTime * 0.2);
  float noise2 = snoise(position * uNoiseScale * 1.5 - uTime * 0.15);
  float noise3 = snoise(position * uNoiseScale * 0.4 + uTime * 0.1);
  
  // Favor smoother, lower frequency noise (reduce high frequency bumps)
  // Use mostly the smoothest noise, minimal high-frequency detail
  float displacement = (noise1 * 0.8 + noise2 * 0.1 + noise3 * 0.1) * uNoiseStrength;
  
  vec3 newPosition = position + normal * displacement;
  
  // Recalculate normal with noise derivative approximation
  float eps = 0.01;
  float n1 = snoise((position + vec3(eps, 0.0, 0.0)) * uNoiseScale + uTime * 0.2);
  float n2 = snoise((position + vec3(0.0, eps, 0.0)) * uNoiseScale + uTime * 0.2);
  float n3 = snoise((position + vec3(0.0, 0.0, eps)) * uNoiseScale + uTime * 0.2);
  
  vec3 gradient = vec3(n1 - noise1, n2 - noise1, n3 - noise1) / eps;
  vec3 deformedNormal = normalize(normal - gradient * uNoiseStrength * 0.5);
  
  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec3 worldNormal = normalize((modelMatrix * vec4(deformedNormal, 0.0)).xyz);
  vNormal = worldNormal;
  
  vec3 I = normalize(worldPosition.xyz - cameraPosition);
  vReflect = reflect(I, worldNormal);
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Water-like fluid fragment shader with proper reflectivity
const chromeFragmentShader = `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vReflect;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  vec3 reflectDir = normalize(vReflect);
  
  // Lighting setup - directional lighting for depth
  vec3 light1Dir = normalize(vec3(0.3, 1.0, 0.2));
  vec3 light2Dir = normalize(vec3(-0.2, 0.7, 0.4));
  
  // Reduced ambient lighting for darker appearance
  float ambient = 0.08;
  
  // Diffuse lighting - gives shape and depth with stronger contrast
  float NdotL1 = max(dot(normal, light1Dir), 0.0);
  float NdotL2 = max(dot(normal, light2Dir), 0.0);
  
  // Stronger diffuse contribution for more contrast
  float diffuse1 = NdotL1 * 0.7;
  float diffuse2 = NdotL2 * 0.3;
  
  // Shadows are darker - use power curve to increase contrast
  float totalDiffuse = ambient + pow(diffuse1 + diffuse2, 0.9);
  
  // Liquid metal fresnel - smoother, more uniform
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 1.5);
  fresnel = mix(0.65, 0.95, fresnel); // More uniform reflectivity
  
  // Dynamic environment reflection for liquid metallic metal
  // Sky reflection (top) - bright with variation
  float skyReflection = smoothstep(-0.2, 1.0, reflectDir.y);
  vec3 skyColor = vec3(0.92, 0.94, 0.97);
  
  // Ground reflection (bottom) - darker with more contrast
  float groundReflection = smoothstep(0.3, -1.0, reflectDir.y);
  vec3 groundColor = vec3(0.60, 0.63, 0.67);
  
  // Side reflections - varied metallic tones
  float sideReflection = abs(reflectDir.x) * 0.9;
  vec3 sideColor = vec3(0.82, 0.85, 0.88);
  
  // Horizon blending - more dynamic
  float horizon = 1.0 - smoothstep(0.0, 0.2, abs(reflectDir.y));
  vec3 horizonColor = vec3(0.75, 0.78, 0.82);
  
  // Combine environment reflections with more variation
  vec3 envReflection = skyColor * skyReflection;
  envReflection += groundColor * groundReflection * 0.8;
  envReflection += sideColor * sideReflection * 0.6;
  envReflection = mix(envReflection, horizonColor, horizon * 0.3);
  
  // Add dynamic studio light reflections (sharp rectangular highlights)
  vec2 light1Pos = vec2(0.3, 0.7);
  vec2 light2Pos = vec2(-0.2, 0.6);
  vec2 light3Pos = vec2(0.4, 0.5);
  vec2 light4Pos = vec2(-0.3, 0.4);
  
  vec2 refXY = normalize(reflectDir.xz);
  float light1 = smoothstep(0.12, 0.02, distance(refXY, light1Pos));
  float light2 = smoothstep(0.12, 0.02, distance(refXY, light2Pos));
  float light3 = smoothstep(0.10, 0.02, distance(refXY, light3Pos));
  float light4 = smoothstep(0.10, 0.02, distance(refXY, light4Pos));
  
  envReflection += vec3(1.0) * light1 * 1.2;
  envReflection += vec3(0.97, 0.98, 1.0) * light2 * 0.9;
  envReflection += vec3(0.95, 0.97, 1.0) * light3 * 0.7;
  envReflection += vec3(0.93, 0.95, 0.98) * light4 * 0.6;
  
  // Add color variation based on reflection direction
  float colorVariation = sin(reflectDir.x * 3.0) * 0.5 + 0.5;
  vec3 coolTint = vec3(0.85, 0.88, 0.92);
  vec3 warmTint = vec3(0.78, 0.80, 0.83);
  envReflection = mix(envReflection, mix(coolTint, warmTint, colorVariation), 0.3);
  
  // Dynamic liquid metal base color - varies across surface
  vec3 metalBaseColor1 = vec3(0.68, 0.70, 0.73);
  vec3 metalBaseColor2 = vec3(0.64, 0.66, 0.69);
  vec3 metalBaseColor3 = vec3(0.70, 0.72, 0.75);
  
  // Vary base color based on position and normal
  float colorMix1 = dot(normal, vec3(0.7, 0.3, 0.5)) * 0.5 + 0.5;
  float colorMix2 = dot(normal, vec3(-0.5, 0.6, 0.3)) * 0.5 + 0.5;
  vec3 metalBaseColor = mix(metalBaseColor1, metalBaseColor2, colorMix1);
  metalBaseColor = mix(metalBaseColor, metalBaseColor3, colorMix2 * 0.5);
  
  // Dynamic base color contribution with more variation
  vec3 litMetalColor = metalBaseColor * (0.2 + totalDiffuse * 0.4);
  
  // More dynamic depth effect with stronger contrast
  float depth = 1.0 - dot(normal, vec3(0.0, 1.0, 0.0)) * 0.5;
  vec3 depthColor = mix(litMetalColor, vec3(0.35, 0.37, 0.40), depth * 0.8);
  
  // Add curvature-based color variation
  float curvature = length(fwidth(normal));
  vec3 curvatureColor = mix(vec3(0.72, 0.74, 0.77), vec3(0.58, 0.60, 0.63), curvature * 2.0);
  depthColor = mix(depthColor, curvatureColor, 0.3);
  
  // Mix reflection and base color with more dynamic blending
  vec3 finalColor = mix(depthColor, envReflection, fresnel * 0.85);
  
  // Extremely sharp specular highlights - chrome mirror-like
  vec3 halfDir1 = normalize(light1Dir + viewDir);
  vec3 halfDir2 = normalize(light2Dir + viewDir);
  
  float spec1 = pow(max(dot(normal, halfDir1), 0.0), 2048.0);
  float spec2 = pow(max(dot(normal, halfDir2), 0.0), 1024.0);
  
  // Very bright metallic highlights - chrome-like
  finalColor += vec3(1.0) * spec1 * 4.0;
  finalColor += vec3(0.98, 0.99, 1.0) * spec2 * 2.5;
  
  // Additional highlights for extra metallic shine
  float spec3 = pow(max(dot(normal, normalize(vec3(0.0, 1.0, 0.0) + viewDir)), 0.0), 512.0);
  finalColor += vec3(0.95, 0.97, 1.0) * spec3 * 1.5;
  
  // Extra sharp highlight for mirror finish
  float spec4 = pow(max(dot(normal, normalize(vec3(0.2, 0.9, 0.1) + viewDir)), 0.0), 4096.0);
  finalColor += vec3(1.0) * spec4 * 3.5;
  
  // Additional studio light speculars
  vec3 light3Dir = normalize(vec3(0.4, 0.8, 0.3));
  vec3 light4Dir = normalize(vec3(-0.3, 0.7, 0.5));
  vec3 halfDir3 = normalize(light3Dir + viewDir);
  vec3 halfDir4 = normalize(light4Dir + viewDir);
  float spec5 = pow(max(dot(normal, halfDir3), 0.0), 1024.0);
  float spec6 = pow(max(dot(normal, halfDir4), 0.0), 512.0);
  finalColor += vec3(0.97, 0.98, 1.0) * spec5 * 1.8;
  finalColor += vec3(0.95, 0.96, 0.98) * spec6 * 1.2;
  
  // Dynamic color variation based on viewing angle - liquid metal effect
  float colorShift = pow(1.0 - max(dot(viewDir, normal), 0.0), 1.8);
  vec3 shiftColor1 = vec3(0.75, 0.78, 0.82);
  vec3 shiftColor2 = vec3(0.65, 0.67, 0.70);
  vec3 shiftColor = mix(shiftColor1, shiftColor2, dot(normal, vec3(0.3, 0.7, 0.2)) * 0.5 + 0.5);
  finalColor = mix(finalColor, shiftColor, colorShift * 0.4);
  
  // Add position-based color variation for liquid metal flow
  float posVariation = sin(vWorldPosition.x * 0.5 + vWorldPosition.y * 0.7 + vWorldPosition.z * 0.3) * 0.5 + 0.5;
  vec3 flowColor1 = vec3(0.72, 0.74, 0.77);
  vec3 flowColor2 = vec3(0.62, 0.64, 0.67);
  vec3 flowColor = mix(flowColor1, flowColor2, posVariation);
  finalColor = mix(finalColor, flowColor, 0.2);
  
  // Stronger ambient occlusion for depth - much darker in concave areas
  float ao = 0.4 + 0.6 * max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
  // Increase shadow contrast for darker look
  ao = pow(ao, 1.4);
  finalColor *= ao;
  
  // Subtle rim lighting - less pronounced edges
  float rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
  vec3 rimColor = vec3(0.75, 0.77, 0.80);
  finalColor = mix(finalColor, rimColor, rim * 0.25);
  
  // Dynamic metallic contrast - varies across surface
  float contrastVariation = dot(normal, vec3(0.4, 0.6, 0.3)) * 0.3 + 0.7;
  finalColor = pow(finalColor, vec3(0.85 + contrastVariation * 0.1));
  
  // Strong metallic sheen layers with variation
  float metallicSheen1 = pow(max(dot(normal, normalize(viewDir + vec3(0.0, 1.0, 0.0))), 0.0), 64.0);
  float metallicSheen2 = pow(max(dot(normal, normalize(viewDir + vec3(0.3, 0.9, 0.1))), 0.0), 128.0);
  float metallicSheen3 = pow(max(dot(normal, normalize(viewDir + vec3(-0.2, 0.8, 0.2))), 0.0), 256.0);
  
  vec3 sheenColor1 = vec3(0.95, 0.97, 1.0);
  vec3 sheenColor2 = vec3(0.92, 0.94, 0.97);
  vec3 sheenColor3 = vec3(0.88, 0.90, 0.93);
  
  finalColor += sheenColor1 * metallicSheen1 * 1.5;
  finalColor += sheenColor2 * metallicSheen2 * 1.0;
  finalColor += sheenColor3 * metallicSheen3 * 0.7;
  
  // Dynamic brightness boost - varies across surface
  float brightnessVariation = dot(normal, vec3(0.5, 0.7, 0.4)) * 0.2 + 0.8;
  finalColor = mix(finalColor, finalColor * 1.2, brightnessVariation * 0.4);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface SphereConfig {
	position: THREE.Vector3;
	basePosition: THREE.Vector3;
	scale: number;
	rotationSpeed: THREE.Vector3;
	orbitRadius: number;
	orbitSpeed: number;
	orbitPhase: number;
	noiseScale: number;
	noiseStrength: number;
}

export default function Blob() {
	const containerRef = useRef<HTMLDivElement>(null);
	const initializedRef = useRef(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [_loadProgress, setLoadProgress] = useState(0);

	useEffect(() => {
		if (!containerRef.current || initializedRef.current) return;
		// Prevent double initialization if container already has content
		if (containerRef.current.children.length > 0) return;

		initializedRef.current = true;

		let cleanup: (() => void) | null = null;
		let rafId: number | null = null;

		// Use requestAnimationFrame to ensure DOM is ready and container has dimensions
		rafId = requestAnimationFrame(() => {
			if (!containerRef.current) return;
			// Double-check container is still empty (in case of race condition)
			if (containerRef.current.children.length > 0) {
				initializedRef.current = false;
				return;
			}

			// Scene setup
			const scene = new THREE.Scene();
			scene.background = new THREE.Color(0xffffff);

			const camera = new THREE.PerspectiveCamera(
				45,
				window.innerWidth / window.innerHeight,
				0.1,
				1000,
			);
			camera.position.set(0, 0, 12);

			const renderer = new THREE.WebGLRenderer({
				antialias: true,
				powerPreference: "high-performance",
			});
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.0;
			containerRef.current.appendChild(renderer.domElement);

			// Create chrome spheres
			const spheres: {
				mesh: THREE.Mesh;
				config: SphereConfig;
				material: THREE.ShaderMaterial;
			}[] = [];
			const sphereGeometry = new THREE.SphereGeometry(1, 128, 128);

			// Sphere configurations - large chrome liquid metal blobs
			const sphereConfigs: Partial<SphereConfig>[] = [
				// Main large sphere (center-right)
				{
					position: new THREE.Vector3(1.5, 0.3, 0),
					scale: 2.8,
					noiseScale: 0.8,
					noiseStrength: 0.18,
				},
				// Second large sphere (left)
				{
					position: new THREE.Vector3(-2.0, -0.5, -1),
					scale: 2.2,
					noiseScale: 1.0,
					noiseStrength: 0.15,
				},
				// Medium spheres
				{
					position: new THREE.Vector3(-0.5, 2.0, -0.5),
					scale: 1.5,
					noiseScale: 1.2,
					noiseStrength: 0.13,
				},
				{
					position: new THREE.Vector3(3.5, -1.5, -0.8),
					scale: 1.3,
					noiseScale: 1.3,
					noiseStrength: 0.11,
				},
				{
					position: new THREE.Vector3(-3.5, 1.2, -1.2),
					scale: 1.1,
					noiseScale: 1.4,
					noiseStrength: 0.09,
				},
				// Smaller accent spheres
				{
					position: new THREE.Vector3(0.8, -2.2, 0.3),
					scale: 0.9,
					noiseScale: 1.5,
					noiseStrength: 0.07,
				},
				{
					position: new THREE.Vector3(-1.8, -2.0, 0.5),
					scale: 0.7,
					noiseScale: 1.6,
					noiseStrength: 0.06,
				},
				{
					position: new THREE.Vector3(4.0, 1.5, -1.5),
					scale: 0.6,
					noiseScale: 1.8,
					noiseStrength: 0.06,
				},
				// Tiny spheres
				{
					position: new THREE.Vector3(-4.2, -0.8, -0.5),
					scale: 0.5,
					noiseScale: 2.0,
					noiseStrength: 0.04,
				},
				{
					position: new THREE.Vector3(2.5, 2.5, -1.0),
					scale: 0.45,
					noiseScale: 2.0,
					noiseStrength: 0.04,
				},
			];

			sphereConfigs.forEach((config, _index) => {
				const material = new THREE.ShaderMaterial({
					vertexShader: chromeVertexShader,
					fragmentShader: chromeFragmentShader,
					uniforms: {
						uTime: { value: 0 },
						uNoiseScale: { value: config.noiseScale || 1.0 },
						uNoiseStrength: { value: config.noiseStrength || 0.15 },
					},
					transparent: false,
					depthWrite: true,
					depthTest: true,
				});

				const mesh = new THREE.Mesh(sphereGeometry, material);
				const pos = config.position || new THREE.Vector3(0, 0, 0);
				const scale = config.scale || 1;

				mesh.position.copy(pos);
				mesh.scale.setScalar(scale); // Start at full scale for immediate visibility

				const fullConfig: SphereConfig = {
					position: pos.clone(),
					basePosition: pos.clone(),
					scale: scale,
					rotationSpeed: new THREE.Vector3(
						(Math.random() - 0.5) * 0.003,
						(Math.random() - 0.5) * 0.003,
						(Math.random() - 0.5) * 0.003,
					),
					orbitRadius: 0.08 + Math.random() * 0.12,
					orbitSpeed: 0.2 + Math.random() * 0.2,
					orbitPhase: Math.random() * Math.PI * 2,
					noiseScale: config.noiseScale || 1.0,
					noiseStrength: config.noiseStrength || 0.15,
				};

				spheres.push({ mesh, config: fullConfig, material });
				scene.add(mesh);
			});

			// Post-processing
			const composer = new EffectComposer(renderer);
			composer.addPass(new RenderPass(scene, camera));

			const bloomPass = new UnrealBloomPass(
				new THREE.Vector2(window.innerWidth, window.innerHeight),
				0.1, // Very subtle bloom
				0.5, // Radius
				0.98, // High threshold
			);
			composer.addPass(bloomPass);

			// Animation
			let time = 0;
			let introProgress = 1; // Start fully visible
			const introDuration = 0.5;

			// Initial render to ensure scene is visible immediately
			composer.render();

			// Mouse interaction
			const mouse = new THREE.Vector2(0, 0);
			const targetMouse = new THREE.Vector2(0, 0);

			const handleMouseMove = (event: MouseEvent) => {
				targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
				targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			};
			window.addEventListener("mousemove", handleMouseMove);

			// Loading simulation
			let loadingTime = 0;
			const loadingDuration = 0.8;

			function animate() {
				time += 0.016;

				// Loading simulation
				if (loadingTime < loadingDuration) {
					loadingTime += 0.016;
					const progress = Math.min(loadingTime / loadingDuration, 1);
					setLoadProgress(Math.floor(progress * 100));
					if (progress >= 1) {
						setIsLoaded(true);
					}
				}

				// Intro animation - start immediately
				if (introProgress < 1) {
					introProgress = Math.min(time / introDuration, 1);
				}

				// Smooth mouse following
				mouse.x += (targetMouse.x - mouse.x) * 0.03;
				mouse.y += (targetMouse.y - mouse.y) * 0.03;

				// Update spheres
				spheres.forEach((sphere, index) => {
					const { mesh, config, material } = sphere;

					// Update shader time
					material.uniforms.uTime.value = time;

					// Intro animation - spheres emerge and scale up
					const staggerDelay = index * 0.06;
					const sphereIntro = Math.max(
						0,
						Math.min(1, (introProgress - staggerDelay) / (1 - staggerDelay)),
					);
					const sphereEase = easeOutBack(sphereIntro);

					mesh.scale.setScalar(config.scale * sphereEase);

					// Gentle floating motion
					const floatX =
						Math.sin(time * config.orbitSpeed + config.orbitPhase) *
						config.orbitRadius;
					const floatY =
						Math.cos(time * config.orbitSpeed * 0.8 + config.orbitPhase) *
						config.orbitRadius;
					const floatZ =
						Math.sin(time * config.orbitSpeed * 0.6 + config.orbitPhase + 1.0) *
						config.orbitRadius *
						0.5;

					mesh.position.x = config.basePosition.x + floatX;
					mesh.position.y = config.basePosition.y + floatY;
					mesh.position.z = config.basePosition.z + floatZ;

					// Mouse parallax effect
					const parallaxStrength = 0.15 * (1 - index * 0.08);
					mesh.position.x += mouse.x * parallaxStrength;
					mesh.position.y += mouse.y * parallaxStrength;

					// Gentle rotation
					mesh.rotation.x += config.rotationSpeed.x;
					mesh.rotation.y += config.rotationSpeed.y;
					mesh.rotation.z += config.rotationSpeed.z;
				});

				// Subtle camera movement based on mouse
				camera.position.x = mouse.x * 0.4;
				camera.position.y = mouse.y * 0.4;
				camera.lookAt(0, 0, 0);

				composer.render();
			}

			renderer.setAnimationLoop(animate);

			// Resize handler
			const handleResize = () => {
				const w = window.innerWidth;
				const h = window.innerHeight;

				camera.aspect = w / h;
				camera.updateProjectionMatrix();

				renderer.setSize(w, h);
				composer.setSize(w, h);
			};
			window.addEventListener("resize", handleResize);

			// Store cleanup function
			cleanup = () => {
				window.removeEventListener("resize", handleResize);
				window.removeEventListener("mousemove", handleMouseMove);
				renderer.setAnimationLoop(null);

				sphereGeometry.dispose();
				spheres.forEach((s) => {
					s.material.dispose();
				});

				renderer.dispose();
				composer.dispose();

				if (containerRef.current) {
					containerRef.current.innerHTML = "";
				}
			};
		});

		// Return cleanup from useEffect
		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			if (cleanup) {
				cleanup();
			}
			initializedRef.current = false;
		};
	}, []);

	return (
		<div className="relative w-full h-full min-h-screen">
			{/* WebGL Canvas */}
			<div ref={containerRef} className="absolute inset-0 w-full h-full" />

			{/* Text overlay */}
			<div
				className={`absolute inset-0 flex items-end justify-start pointer-events-none transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
				style={{ transitionDelay: "0.3s", padding: "2rem" }}
			>
				<h1
					className="text-6xl sm:text-5xl md:text-6xl lg:text-9xl font-bold uppercase"
					style={{
						fontFamily:
							"'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
						color: "#1e1e1e",
						letterSpacing: "-0.04em",
					}}
				>
					MOLECULAR
					<br />
					ENGINEERING INC.
				</h1>
			</div>
		</div>
	);
}

// Easing function for smooth overshoot
function easeOutBack(t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

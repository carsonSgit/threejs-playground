"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// 4D Simplex noise GLSL implementation with derivatives
// Based on Ashima Arts and David Li's implementations, very cool work!
const simplexNoise4D = `
#define F4 0.309016994374947451

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;
  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
  return p;
}

float simplexNoise(vec4 v) {
  const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);
  
  vec4 i  = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v - i + dot(i, C.xxxx);
  
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0-1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0-2.0, 0.0, 1.0);
  
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;
  
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(
             i.w + vec4(i1.w, i2.w, i3.w, 1.0))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);
  
  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));
  
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  
  return 49.0 * (dot(m0*m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
               + dot(m1*m1, vec2(dot(p3, x3), dot(p4, x4))));
}

vec4 simplexNoiseDerivatives(vec4 v) {
  const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);
  
  vec4 i  = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v - i + dot(i, C.xxxx);
  
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0-1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0-2.0, 0.0, 1.0);
  
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;
  
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(
             i.w + vec4(i1.w, i2.w, i3.w, 1.0))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);
  
  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));
  
  vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2));
  vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));
  
  vec3 m0 = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.5 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
  
  vec3 temp0 = -6.0 * m0 * m0 * values0;
  vec2 temp1 = -6.0 * m1 * m1 * values1;
  
  vec3 mmm0 = m0 * m0 * m0;
  vec2 mmm1 = m1 * m1 * m1;
  
  float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;
  float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;
  float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;
  float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;
  
  return vec4(dx, dy, dz, dw) * 49.0;
}
`;

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vWorldPos;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
${simplexNoise4D}

uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uCoreColor;

varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vWorldPos;

void main() {
    // Use 4D noise for smoother time evolution
    vec4 noisePos = vec4(vWorldPos, uTime * 0.1);
    
    // Curl noise for turbulent flow (using derivatives)
    vec4 derivatives = simplexNoiseDerivatives(noisePos * 1.2);
    vec3 curl = vec3(derivatives.y - derivatives.z, derivatives.z - derivatives.x, derivatives.x - derivatives.y);
    
    // Large scale convection cells with 4D noise
    float noise1 = simplexNoise(noisePos * 0.8);
    
    // Medium scale turbulence
    float noise2 = simplexNoise(vec4(vWorldPos * 2.5, uTime * 0.15));
    
    // Fine granulation detail (solar granules)
    float noise3 = simplexNoise(vec4(vWorldPos * 6.0, uTime * 0.25));
    
    // Violent eruption zones (darker sunspots and brighter flare regions)
    float eruption = simplexNoise(vec4(vWorldPos * 1.5 + curl * 0.3, uTime * 0.08));
    
    // Combine noise layers for complex turbulence
    float combinedNoise = noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.2 + eruption * 0.1;
    
    // Use curl to warp surface normals more dramatically
    vec3 warpedNormal = normalize(vNormal + curl * 0.4 + vec3(combinedNoise) * 0.2);
    
    // Distance from center for radial effects
    float distFromCenter = length(vPos);
    
    // Create violent intensity variation (boiling effect)
    float intensity = 0.6 + 0.7 * combinedNoise;
    intensity *= (1.0 - distFromCenter * 0.08);
    
    // Sunspot darkening (localized dark regions)
    float sunspotMask = smoothstep(0.3, 0.5, eruption);
    intensity *= mix(0.3, 1.0, sunspotMask);
    
    // Mix between core color (hotter) and base color with more extreme variation
    vec3 color = mix(uBaseColor, uCoreColor, smoothstep(-0.4, 0.6, combinedNoise + eruption * 0.5));
    
    // Add extreme bright flare regions
    float flareIntensity = smoothstep(0.6, 0.8, noise2 + noise3 * 0.5);
    color = mix(color, uCoreColor * 1.5, flareIntensity * 0.3);
    
    color *= intensity;
    
    // Enhanced rim lighting with curl-based variation
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
    color += fresnel * uCoreColor * (0.3 + 0.2 * abs(curl.x));
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// Corona shader (outer glow layer)
const coronaVertexShader = `
varying vec3 vNormal;
varying vec3 vPos;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coronaFragmentShader = `
${simplexNoise4D}

uniform float uTime;
uniform vec3 uCoronaColor;

varying vec3 vNormal;
varying vec3 vPos;

void main() {
    // 4D animated noise for wispy corona tendrils
    vec4 noisePos = vec4(vPos * 3.0, uTime * 0.12);
    float noise = simplexNoise(noisePos);
    
    // Secondary layer for detailed structure
    float noise2 = simplexNoise(vec4(vPos * 7.0, uTime * 0.18));
    
    // Curl derivatives for plasma-like swirls
    vec4 derivatives = simplexNoiseDerivatives(noisePos * 0.8);
    vec3 curl = vec3(derivatives.y - derivatives.z, derivatives.z - derivatives.x, derivatives.x - derivatives.y);
    float curlMagnitude = length(curl);
    
    // Fresnel for edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.5);
    
    // Create tendril-like structures in corona
    float tendrils = smoothstep(0.2, 0.8, noise + curlMagnitude * 0.5);
    
    // Pulsating intensity with more chaos
    float pulse = 0.5 + 0.5 * sin(uTime * 0.5 + curlMagnitude * 3.0);
    float alpha = fresnel * (0.35 + 0.3 * tendrils + 0.15 * noise2) * (0.7 + 0.3 * pulse);
    
    vec3 color = uCoronaColor * (1.0 + 0.5 * noise + 0.3 * curlMagnitude);
    
    gl_FragColor = vec4(color, alpha);
}
`;

// Particle-based solar flares - flowing streams
const particleFlareVertexShader = `
${simplexNoise4D}

uniform float uTime;
uniform float uStarRadius;

attribute float aLifePhase; // 0 to 1, particle's position in its lifecycle
attribute vec3 aSourcePos; // Starting position on star surface
attribute vec3 aDirection; // Initial direction
attribute float aSpeed; // Particle speed multiplier
attribute float aFlareGroup; // Which flare stream this belongs to

varying vec3 vColor;
varying float vAlpha;

void main() {
    // Animate flare emergence with noise
    float groupOffset = aFlareGroup;
    float flareActivity = simplexNoise(vec4(groupOffset, 0.0, 0.0, uTime * 0.05));
    float isActive = smoothstep(-0.3, 0.3, flareActivity);
    
    // Calculate particle's traveled distance
    float travelDist = aLifePhase * 2.0 * aSpeed * isActive;
    
    // Apply curl noise to particle path for chaotic streams
    vec4 noisePos = vec4(aSourcePos + aDirection * travelDist * 0.5, uTime * 0.12);
    vec4 derivatives = simplexNoiseDerivatives(noisePos * 1.5);
    vec3 curl = vec3(derivatives.y - derivatives.z, derivatives.z - derivatives.x, derivatives.x - derivatives.y);
    
    // Particle flows outward with curl influence
    vec3 pos = aSourcePos + aDirection * travelDist + curl * 0.5 * aLifePhase;
    
    // Color based on temperature (hotter at base, cooler as it travels)
    float temp = 1.0 - aLifePhase * 0.6;
    vColor = mix(vec3(1.0, 0.5, 0.1), vec3(1.0, 0.95, 0.8), temp);
    vColor *= (1.5 + 0.5 * flareActivity);
    
    // Fade in and out
    float fadeIn = smoothstep(0.0, 0.1, aLifePhase);
    float fadeOut = smoothstep(1.0, 0.7, aLifePhase);
    vAlpha = fadeIn * fadeOut * isActive;
    
    // Point size varies with distance and activity
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (20.0 / -mvPosition.z) * (1.0 + 0.5 * flareActivity) * (1.0 - aLifePhase * 0.5);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFlareFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
    // Circular particle shape (soft dot)
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Soft circular falloff
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
    
    // Bright emissive core
    vec3 color = vColor * (1.5 + 0.5 * (1.0 - dist * 2.0));
    
    gl_FragColor = vec4(color, alpha);
}
`;

export default function BoilingStar() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 0, 6);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: "high-performance",
			stencil: false,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		containerRef.current.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.minDistance = 3;
		controls.maxDistance = 15;

		const starGeometry = new THREE.SphereGeometry(2, 64, 64);
		const starMaterial = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uBaseColor: { value: new THREE.Color(1.0, 0.3, 0.05) },
				uCoreColor: { value: new THREE.Color(1.0, 0.95, 0.7) },
			},
		});

		const star = new THREE.Mesh(starGeometry, starMaterial);
		scene.add(star);

		const coronaGeometry = new THREE.SphereGeometry(2.15, 48, 48);
		const coronaMaterial = new THREE.ShaderMaterial({
			vertexShader: coronaVertexShader,
			fragmentShader: coronaFragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uCoronaColor: { value: new THREE.Color(1.0, 0.25, 0.1) },
			},
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.BackSide,
		});

		const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
		scene.add(corona);

		const numFlareStreams = 30;
		const particlesPerStream = 20;
		const totalParticles = numFlareStreams * particlesPerStream;

		const flareGeometry = new THREE.BufferGeometry();
		const positions = new Float32Array(totalParticles * 3);
		const lifePhases = new Float32Array(totalParticles);
		const sourcePosArray = new Float32Array(totalParticles * 3);
		const directions = new Float32Array(totalParticles * 3);
		const speeds = new Float32Array(totalParticles);
		const flareGroups = new Float32Array(totalParticles);

		let idx = 0;
		for (let stream = 0; stream < numFlareStreams; stream++) {
			const phi = Math.acos(2 * Math.random() - 1);
			const theta = Math.random() * Math.PI * 2;
			const radius = 1.0;

			const sourceX = radius * Math.sin(phi) * Math.cos(theta);
			const sourceY = radius * Math.sin(phi) * Math.sin(theta);
			const sourceZ = radius * Math.cos(phi);

			const dirLen = Math.sqrt(
				sourceX * sourceX + sourceY * sourceY + sourceZ * sourceZ,
			);
			const dirX = sourceX / dirLen;
			const dirY = sourceY / dirLen;
			const dirZ = sourceZ / dirLen;

			for (let p = 0; p < particlesPerStream; p++) {
				const i = idx * 3;

				positions[i] = sourceX;
				positions[i + 1] = sourceY;
				positions[i + 2] = sourceZ;

				lifePhases[idx] = p / particlesPerStream;

				sourcePosArray[i] = sourceX;
				sourcePosArray[i + 1] = sourceY;
				sourcePosArray[i + 2] = sourceZ;

				const spread = 0.3;
				directions[i] = dirX + (Math.random() - 1) * spread;
				directions[i + 1] = dirY + (Math.random() - 0.1) * spread;
				directions[i + 2] = dirZ + (Math.random() - 0.1) * spread;

				speeds[idx] = 0.8 + Math.random() * 0.4;

				flareGroups[idx] = stream;

				idx++;
			}
		}

		flareGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, 3),
		);
		flareGeometry.setAttribute(
			"aLifePhase",
			new THREE.BufferAttribute(lifePhases, 1),
		);
		flareGeometry.setAttribute(
			"aSourcePos",
			new THREE.BufferAttribute(sourcePosArray, 3),
		);
		flareGeometry.setAttribute(
			"aDirection",
			new THREE.BufferAttribute(directions, 3),
		);
		flareGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
		flareGeometry.setAttribute(
			"aFlareGroup",
			new THREE.BufferAttribute(flareGroups, 1),
		);

		const flareMaterial = new THREE.ShaderMaterial({
			vertexShader: particleFlareVertexShader,
			fragmentShader: particleFlareFragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uStarRadius: { value: 2.0 },
			},
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});

		const flareParticles = new THREE.Points(flareGeometry, flareMaterial);
		flareParticles.frustumCulled = false;
		scene.add(flareParticles);

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));

		const bloomResolution = new THREE.Vector2(
			window.innerWidth * 0.8,
			window.innerHeight * 0.8,
		);
		const bloomPass = new UnrealBloomPass(
			bloomResolution,
			2.2, // strength for dramatic flares
			0.5, // radius
			0.05, // lower for more glow
		);
		composer.addPass(bloomPass);

		let time = 0;
		function animate() {
			time += 0.016; // 60fps delta

			starMaterial.uniforms.uTime.value = time;
			coronaMaterial.uniforms.uTime.value = time;
			flareMaterial.uniforms.uTime.value = time;

			star.rotation.y += 0.001;
			corona.rotation.y -= 0.0008;
			corona.rotation.x += 0.0005;

			controls.update();
			composer.render();
		}

		renderer.setAnimationLoop(animate);

		const handleResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;

			camera.aspect = w / h;
			camera.updateProjectionMatrix();

			renderer.setSize(w, h);
			composer.setSize(w, h);

			bloomPass.resolution.set(w * 0.8, h * 0.8);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();
			starGeometry.dispose();
			starMaterial.dispose();
			coronaGeometry.dispose();
			coronaMaterial.dispose();
			flareGeometry.dispose();
			flareMaterial.dispose();
			renderer.dispose();

			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, []);

	return <div ref={containerRef} className="w-full h-full" />;
}

# Boiling Star Documentation

## Component Overview
- `BoilingStar` is a client-side Three.js experience that layers custom shaders, volumetric corona effects, GPU particles, and post-processing bloom.
- The component lives inside a React `useEffect` hook, instantiating the scene when the container div mounts.
- A detailed star surface shader uses 4D simplex noise plus derivatives to mimic turbulent plasma convection.
- A separate corona shader renders on a slightly larger back-side sphere to create wispy atmospheric glow.
- Particle-based solar flares launch from random surface points using instanced attributes for life phase, direction, and group.
- `EffectComposer` with `UnrealBloomPass` amplifies highlights, producing cinematic energy bursts.
- OrbitControls allow viewers to orbit between distances 3 and 15 units while damping keeps motion fluid.
- Renderer preferences (`powerPreference: "high-performance"`, `stencil: false`) prioritize speed and reduce context load.
- All GPU resources, listeners, and controls are disposed on teardown to prevent memory leaks between page navigations.
- The visual target is a hyperactive star with erupting streams, coronal motion, and glow reminiscent of solar telescopy.

## Scene Construction Sequence
- The effect guard ensures `containerRef.current` exists before building Three.js objects.
- A `THREE.Scene` with black background hosts the star mesh, corona sphere, and particle system.
- The `THREE.PerspectiveCamera` uses fov 60°, near 0.1, far 1000, and starts at z=6 facing the origin.
- The WebGL renderer enables antialiasing, clamps pixel ratio to `min(devicePixelRatio, 2)`, and appends its canvas to the container.
- OrbitControls attach to the renderer canvas with damping 0.05 plus min/max distance bounds for comfortable navigation.
- The star geometry uses radius 2 and a high-res 64x64 tessellation for smooth deformation by the shader normals.
- A `THREE.ShaderMaterial` binds custom vertex and fragment shaders plus uniforms for time and color gradients.
- The corona geometry is a slightly larger sphere (2.15 radius, 48 segments) rendered with a transparent additive shader on the back side.
- Particle buffers allocate arrays for positions, life phases, source positions, directions, speeds, and group IDs.
- Attribute buffers are attached to a `THREE.BufferGeometry`, then consumed by a custom GLSL vertex shader for flares.
- A `THREE.ShaderMaterial` renders the particles as `THREE.Points` using additive blending and disabled depth write for glow.
- An `EffectComposer` wraps the renderer, adds a `RenderPass`, and layers an `UnrealBloomPass` tuned for dramatic flares.
- Resize listeners update camera aspect, renderer size, composer size, and bloom resolution while reusing the same scene objects.
## Star Surface Shader Mechanics
- The vertex shader outputs normals, local positions, and world positions for use in the fragment shader.
- The fragment shader embeds 4D simplex noise plus derivative functions inspired by Ashima Arts implementations.
- Noise inputs combine world position with time to create evolving convection cells.
- Multiple noise layers run at different scales (0.8, 2.5, 6.0) to capture large, medium, and fine turbulence.
- Curl noise, derived from simplex derivatives, warps normals and drives swirling plasma motion.
- Another noise sample labeled `eruption` exaggerates darker sunspot regions and brighter flare regions.
- Intensity is modulated by distance from sphere center, adding radial falloff typical of star gradients.
- Colors blend between `uBaseColor` (cooler orange) and `uCoreColor` (bright yellow-white) based on noise outputs.
- Fresnel term accentuates the rim, raising brightness near glancing angles for a fiery edge glow.
- The shader writes final color multiplied by intensity, delivering high contrast detail for bloom to amplify later.

## Corona Shader Mechanics
- Renders on a slightly larger sphere using back-face culling so the glow wraps around the star silhouette.
- Uses the same 4D simplex utility to animate tendril-like patterns with varied frequencies (3.0 and 7.0 multipliers).
- Curl derivatives add plasma-like swirling, and the magnitude influences alpha for dynamic opacity.
- A Fresnel power of 3.5 ensures the corona is strongest near the silhouette, simulating scattering.
- Tendril masks via `smoothstep(0.2, 0.8, noise + curlMagnitude * 0.5)` create filament structures.
- Pulsation uses a sine wave `sin(uTime * 0.5 + curlMagnitude * 3.0)` to animate breathing intensity.
- Alpha multiplies fresnel, tendrils, and pulse components to produce layered transparency.
- Color uniform `uCoronaColor` is scaled by noise and curl magnitude, giving brighter edges when activity is high.
- The material uses `THREE.AdditiveBlending` and `transparent: true`, stacking seamlessly atop the star mesh.
- Side is set to `THREE.BackSide` so only the outward facing corona contributes, preventing z-fighting with the surface.
## Particle Flare System
- Thirty flare streams spawn with twenty particles each, totaling six hundred animated sprites.
- Each stream picks a random spherical coordinate on the star surface, ensuring global coverage.
- Attributes include `aLifePhase`, `aSourcePos`, `aDirection`, `aSpeed`, and `aFlareGroup` for shader logic.
- Directions start as normalized surface normals with random spread to diversify trajectories.
- Speeds vary between 0.8 and 1.2 units, controlling outward travel distance per life phase.
- The shader samples simplex noise per flare group to determine whether that stream is currently active.
- Curl noise perturbs particle paths, simulating chaotic plasma arcs that twist as they leave the surface.
- Colors lerp between hot orange and pale yellow depending on life phase, emulating cooling as they travel outward.
- Vertex shader computes point size based on camera depth and flare activity so near particles render larger.
- Fragment shader draws soft circular dots with smoothstep falloff, multiplied by varying alpha for gentle fade.
- Depth write is disabled and additive blending is used, letting flares accumulate brightness without occluding each other.
- `frustumCulled` is set to false to keep all particles rendered even if bounding boxes are inaccurate.
## Post-Processing And Rendering Flow
- The render loop increments a `time` variable by ~0.016 each tick (60 FPS assumption) and feeds it to all shader uniforms.
- Star rotates slowly on Y while the corona counter-rotates, creating parallax between surface and glow.
- OrbitControls update per frame to apply damping before the composer renders the scene.
- `EffectComposer` first runs a `RenderPass` to render the scene normally into an offscreen buffer.
- `UnrealBloomPass` receives a resolution vector scaled to 80% of the window for performance while still crisp.
- Bloom parameters (strength 2.2, radius 0.5, threshold 0.05) favor aggressive halation of bright flares.
- Using the composer ensures the star, corona, and particles share consistent bloom without additional shader code.
- Renderer animation loop is set via `renderer.setAnimationLoop`, ensuring requestAnimationFrame sync and VR readiness.
- Resize handler updates both renderer and composer sizes plus bloom resolution to maintain consistent glow kernels.
- The pipeline keeps color space default (linear) because shader colors are already tuned for high energy visuals.
## Math And Procedural Techniques
- 4D simplex noise maps `(x, y, z, t)` to scalar turbulence values with low directional artifacts compared to Perlin noise.
- Derivatives of simplex noise supply gradient vectors, enabling curl computation via `curl = (dY - dZ, dZ - dX, dX - dY)`.
- Curl noise generates divergence-free velocity fields that mimic fluid motion on the star surface.
- Multiple noise octaves blend with weights (0.4, 0.3, 0.2, 0.1) to achieve fractal detail across scales.
- Radial intensity uses `length(vPos)` to darken deeper interior regions and brighten the surface.
- Sunspot mask uses `smoothstep(0.3, 0.5, eruption)` to attenuate intensity where eruption noise dips.
- Fresnel effect is calculated as `pow(1 - abs(dot(normal, viewDir)), power)` to highlight edges.
- Corona alpha uses a sine pulse combined with curl magnitude to approximate magnetic loops snapping into visibility.
- Particle life phase drives linear interpolation of temperature colors, roughly modeling blackbody cooling curves.
- Point size formula `(20 / -mvPosition.z)` simulates perspective scaling for sprites in clip space.
## Capabilities And Configuration Options
- Adjust star radius or geometry resolution to trade polygon detail for performance on low-end GPUs.
- Modify shader uniforms `uBaseColor` and `uCoreColor` to represent different stellar classes (red giants, blue stars).
- Add uniforms for rotation speed, noise frequency, or flare counts to expose customization in UI.
- Swap the bloom pass for other post-processing stacks such as film grain, chromatic aberration, or vignette.
- Enable tone mapping or color management to integrate with physically based rendering pipelines.
- Increase `numFlareStreams` or `particlesPerStream` for denser eruptions, mindful of buffer allocations.
- Introduce GPU-driven instancing for flares by generating attributes in shaders via textures for thousands of particles.
- Animate camera paths or auto-rotation to create guided cinematic fly-throughs.
- Integrate dat.GUI or Leva panels to tweak thresholds in real time during creative exploration.
- Export frames via `renderer.domElement.toDataURL()` when capturing promotional stills.
## Practical Use Cases
- Sci-fi landing pages needing a visceral hero animation of unstable stars or reactors.
- Observatory dashboards visualizing solar weather forecasts with stylized plasma motion.
- Music visualizers syncing flare activity and bloom strength to audio beats.
- Museum exhibits explaining stellar convection, coronal mass ejections, or magnetic fields.
- Game backgrounds or loading screens depicting star forges, warp cores, or magical suns.
- Streaming overlays for astronomy channels that want a dynamic star as ambient filler.
- Motion graphics references when designing shader-based VFX for cinematics.
- Educational AR/VR prototypes showing learners how noise-based shaders mimic natural phenomena.
- Audio-reactive installations mapping beats to flare emission for immersive stages.
- Brand activations portraying energy, innovation, or volatility via animated plasma.
## Performance Considerations
- Shader complexity is high; keep resolution moderate on integrated GPUs to prevent frame drops.
- Bloom strength 2.2 can cause HDR clipping; adjust threshold or set `renderer.toneMapping` if banding appears.
- Particle count scales linearly with CPU buffer updates; consider GPU compute or transform feedback for thousands of flares.
- OrbitControls damping adds a little CPU work but improves perceived smoothness; disable if CPU budget is tight.
- Renderer pixel ratio is capped at 2 to avoid exponential fragment costs on Retina displays.
- Corona shader runs on a 48x48 sphere, so increasing segments beyond necessity may not add visible detail.
- The simplex noise implementation is pure GLSL; reusing functions via includes could reduce shader size if bundlers support it.
- Avoid enabling shadows or extra lights—they are unnecessary since shading is procedural.
- Use Chrome's WebGL Profiler to measure GPU time if bloom or particles begin to bottleneck.
- When embedding multiple BoilingStar instances, share renderer and composer objects to conserve contexts.
## Testing Tips
- Run `/examples/boiling-star` while the dev server is live to evaluate visual fidelity and performance.
- Toggle Chrome's reduced motion setting to confirm damping still behaves without auto-rotation.
- Use the Performance panel to capture GPU/CPU traces, focusing on shader compile times and composer passes.
- Resize the window and inspect bloom resolution updates to ensure glow kernels stay proportional.
- Switch to mobile emulation to verify controls handle touch events gracefully.
- Inject WebGL context loss via DevTools to confirm cleanup and remount logic recreate shaders successfully.
- Profile memory usage to ensure disposing resources truly frees buffers after navigation.
- Temporarily disable bloom to isolate shader artifacts and confirm the base render is stable.
- Adjust number of flare streams in code and verify that attribute buffer allocations remain correct.
- Test on multiple GPUs (integrated vs discrete) to validate consistent coloration and brightness.
## Troubleshooting Checklist
- Black screen: ensure WebGL context initializes; check console for shader compile errors from syntax typos.
- Star visible but no corona: confirm the corona material uses `side: THREE.BackSide` and additive blending.
- Missing flares: verify the particle shader attributes match buffer names and that `frustumCulled` is disabled.
- Bloom overwhelming scene: reduce strength or raise threshold; also ensure color values stay within 0-1 range.
- Camera stuck: confirm OrbitControls are bound to the renderer DOM element and not blocked by overlays.
- Performance tanking: lower particle counts, reduce bloom resolution, or cut simplex noise octaves.
- Shader warnings: ensure GLSL chunks are compatible with WebGL1; derivatives rely on supported extensions but inline math avoids `dFdx`.
- Resize artifacts: check that both composer and bloom resolution update alongside renderer size.
- Memory leaks: confirm cleanup disposes geometries, materials, buffer attributes, and removes listeners.
- Jagged corona edges: increase sphere segment count or add gentle blur in post-processing.
## Implementation Checklist
- Confirm the container div fills the viewport; the star expects widescreen real estate for maximum impact.
- Import `OrbitControls`, `EffectComposer`, `RenderPass`, and `UnrealBloomPass` from the `three/addons` hierarchy as shown.
- Ensure the GLSL strings remain synchronized between vertex and fragment shaders when editing noise utilities.
- Validate attribute arrays lengths: totalParticles * component count must align with buffer attribute sizes.
- Clamp device pixel ratio to 2 or lower for predictable performance across displays.
- Update cleanup routine whenever new geometries, materials, or passes are added.
- Use TypeScript definitions for custom attributes if integrating into stricter build pipelines.
- Consider splitting shader code into separate `.glsl` files if your tooling supports it for maintainability.
- Unit test flare attribute generation logic by verifying streams cover the unit sphere evenly.
- Document uniform purposes (colors, time multipliers) so designers can request targeted tweaks.
## Reference Links
- Simplex noise GLSL background: https://github.com/ashima/webgl-noise
- Curl noise explanation: https://thebookofshaders.com/11/
- Additive blending guide: https://threejs.org/examples/?q=bloom#webgl_postprocessing_unreal_bloom
- Post-processing with EffectComposer: https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
- Points rendering reference: https://threejs.org/docs/#api/en/objects/Points
- OrbitControls settings: https://threejs.org/docs/#examples/en/controls/OrbitControls

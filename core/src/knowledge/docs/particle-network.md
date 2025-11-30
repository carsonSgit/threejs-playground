# Particle Network Documentation

## Component Overview
- `ParticleNetwork` renders a cubic swarm of points and dynamically drawn connections reminiscent of network graphs.
- The component is client-only and uses React state to expose UI controls for visibility, distance, limits, and particle count.
- Points drift within a bounding cube while line segments connect close neighbors with intensity-based alpha.
- A GUI panel anchored to the viewport lets users toggle dots and lines, adjust thresholds, and cap connections.
- OrbitControls allow zooming between 1000 and 3000 units, providing sweeping cinematic camera motion.
- The scene background is pure black, reinforcing the glowing, holographic aesthetic.
- Implementation is inspired by Three.js buffer geometry draw-range demos, emphasizing efficient attribute updates.
- Buffer geometries store particle positions, velocities, and connection colors for fast in-place mutation each frame.
- Cleanup disposes of all materials, geometries, and event listeners to avoid GPU leaks.
- The component demonstrates how to pair data-oriented GPU structures with React-based UI in Next.js apps.

## Scene Construction Sequence
- An effect guard checks `containerRef.current` before instantiating WebGL objects.
- Constants define `maxParticleCount = 1000`, cube size `r = 800`, and half size `rHalf = 400` for boundary calculations.
- `THREE.Scene` with a black background hosts a `THREE.Group` containing helper, points, and lines.
- `THREE.PerspectiveCamera` uses fov 45°, near 1, far 4000, positioned at z=1750 facing the cube center.
- `THREE.WebGLRenderer` enables antialiasing, clamps pixel ratio to min(devicePixelRatio, 2), and fills the viewport.
- OrbitControls attach to the renderer canvas with damping 0.05 and radial limits 1000-3000 units.
- A wireframe cube helper (BoxHelper) visualizes the boundary, colored dark gray with additive blending for subtlety.
- Particle positions are seeded randomly within the cube and stored in a Float32Array of length `maxParticleCount * 3`.
- Each particle has a velocity vector with components in [-1, 1], stored in a parallel `particlesData` array.
- A BufferGeometry named `particles` is created with the positions attribute flagged as `THREE.DynamicDrawUsage` for frequent updates.
- A PointsMaterial defines white additive sprites of constant size, producing crisp dots unaffected by distance.
- Another BufferGeometry holds line segment positions (length `segments * 3`) and per-vertex colors for alpha control.
- A LineBasicMaterial with vertex colors and additive blending renders the connection network.
## Interactive Settings Panel
- React `useState` stores `EffectSettings` including `showDots`, `showLines`, `minDistance`, `limitConnections`, `maxConnections`, and `particleCount`.
- A fixed overlay panel uses Tailwind classes to present toggles and sliders on top of the scene.
- Checkbox handlers toggle visibility of point clouds and line meshes by mutating `visible` properties on refs.
- Range inputs adjust numeric values; `minDistance` slider spans 10-300 units for connection thresholds.
- `limitConnections` toggle toggles capping per-particle link counts using `maxConnections` slider (0-30) when enabled.
- Particle count slider ranges 0-1000 and updates the BufferGeometry draw range so fewer particles participate in loops.
- Settings changes update a ref (`settingsRef`) to avoid stale closures inside the animation loop.
- The panel uses `accent-white` checkboxes for consistent styling and improved hit targets.
- Because UI overlays are plain DOM, they do not interfere with OrbitControls as long as pointer events are scoped correctly.
- Controls help demonstrate how real-time graphics can remain configurable through standard React inputs.
## Animation Loop Mechanics
- Renderer uses `setAnimationLoop(animate)` so the loop aligns with display refresh rates.
- Each iteration resets counters for vertex positions, colors, and number of connected segments.
- Particle positions update by adding velocity vectors; collisions with cube boundaries invert the respective velocity component.
- Connection counts per particle reset to zero to enforce `maxConnections` constraints each frame.
- Nested loops inspect each particle pair up to current `particleCount`, computing Euclidean distance via dx/dy/dz.
- If distance is below `minDistance`, the code increments connection counters (if not exceeding limits) and writes two vertices per line segment.
- Alpha is computed as `1 - dist / minDistance` and stored identically in color buffer triples to create intensity fade.
- After the pair loops, BufferGeometry draw range is set to `numConnected * 2`, reflecting total vertices to render.
- Flags `needsUpdate = true` on positions and color attributes inform Three.js to upload mutated buffers to the GPU.
- Group rotation `group.rotation.y = time * 0.1` spins the entire structure, adding visual dynamism independent of camera controls.
## Math And Algorithms
- Particle motion integrates constant velocity: `p = p + v * dt`, with dt implicit as 1 per frame.
- Boundary collisions flip the sign of the velocity component, effectively reflecting vectors against cube faces.
- Distance calculations use standard Euclidean norm `sqrt(dx^2 + dy^2 + dz^2)` between particle pairs.
- Connection alpha scales linearly with normalized distance, producing smooth fades as points approach threshold.
- Limiting connections approximates degree constraints in graph theory, preventing hub particles from dominating.
- Draw range updates rely on GPU buffer offsets; writing positions sequentially ensures contiguous memory for GL_LINES.
- Additive blending in materials simulates light accumulation where connections overlap, similar to energy-based renderings.
- Rotation of the group with `time * 0.1` effectively multiplies the model matrix by a yaw rotation per frame.
- `THREE.DynamicDrawUsage` hints to WebGL that attributes will change frequently, optimizing buffer updates.
- Sliders in the UI effectively adjust algorithm parameters, offering intuitive control over graph density and complexity.
## Capabilities And Extensions
- Toggle dots or lines independently to showcase either particle motion or connection topology.
- Increase `particleCount` up to 1000 for dense meshes; reduce for lightweight backgrounds.
- Enable `limitConnections` to simulate limited-degree graphs or cluster-limited communication.
- Adjust `minDistance` to morph between sparse constellations and fully meshed webs.
- Replace the BoxHelper with other bounding geometry (sphere, torus) for different spatial envelopes.
- Swap PointsMaterial for sprite textures or shader materials to create glowing or animated particles.
- Introduce color gradients per particle based on velocity magnitude or cluster membership.
- Integrate audio data to modulate minDistance or particle speeds, yielding sound-reactive networks.
- Use GPU-based frustum culling or spatial hashing to scale pairwise checks for >1000 particles.
- Export particle positions to external analytics or tie them to live data sources such as IoT device lists.
## Practical Use Cases
- Tech landing pages visualizing abstract networks, blockchains, or neural nets.
- Data infrastructure dashboards showing live service connectivity in an ambient way.
- Conference stage visuals representing community links or communication density.
- Music visualizers that pulse connection distances with beats.
- Security centers depicting threat connectivity graphs in real time.
- Scientific exhibits explaining graph theory, clustering, or particle simulations.
- Onboarding flows for SaaS tools that emphasize collaboration networks.
- Idle screens for chat or messaging apps that nod to message routing.
- Educational demos showing how bounding volumes and collisions work in 3D.
- AR/VR prototypes where floating nodes map to physical spaces or IoT sensors.
## Implementation Checklist
- Confirm the container div spans the viewport and sits below the control panel in z-index.
- Import `OrbitControls` from `three/addons/controls/OrbitControls.js` as shown in the component.
- Initialize `pointCloudRef`, `linesMeshRef`, and `particlesGeomRef` to manage visibility and draw range updates.
- Set buffer attributes to `THREE.DynamicDrawUsage` so frequent writes remain efficient.
- Keep `settingsRef` synchronized in a `useEffect` so the animation loop reads latest values.
- Remember to clear the container DOM and dispose geometries/materials inside cleanup.
- Use `requestAnimationFrame` via `renderer.setAnimationLoop` for proper timing; avoid manual recursion to maintain XR support.
- Validate slider inputs for min/max to prevent invalid states (e.g., zero particles with limit connections on).
- Document UI interactions for QA so they know expected ranges and effects on visuals.
- Consider memoizing slider handlers to prevent unnecessary React re-renders if panel grows more complex.
## Performance Considerations
- Pairwise distance checks scale O(n^2); limiting `particleCount` is essential for smooth performance.
- Decreasing `minDistance` reduces the number of links, lowering memory churn in the positions buffer.
- `limitConnections` drastically cuts iterations by skipping neighbor checks once a particle reaches its cap.
- Using additive blending keeps draw order simple but can over-brighten scenes if too many lines overlap.
- OrbitControls damping is cheap but can be disabled if CPU headroom is extremely tight.
- Resize events only update camera matrices and renderer size, avoiding reallocation of large buffers.
- PointsMaterial without size attenuation ensures constant pixel size, aiding readability but ignoring perspective.
- Consider using a spatial grid or k-d tree if you plan to exceed ~1500 particles; pure brute force may stutter.
- Profiling with Chrome DevTools reveals whether geometry uploads or JS loops dominate frame time.
- Use `stats.js` or custom FPS overlays during tuning to track how UI adjustments influence performance.
## Testing Tips
- Visit `/examples/particle-network` during development to verify slider interactions react instantly.
- Toggle each checkbox to confirm the refs update visibility without recreating meshes.
- Drag sliders rapidly to ensure no race conditions or dropped frames occur due to React state updates.
- Monitor memory usage while sliding particle count from 0 to 1000 to catch leaks in draw range handling.
- Resize the browser and rotate the camera to verify helper cube remains aligned with the point cloud.
- Enable `limitConnections` and set `maxConnections` to small values to test degree constraint logic.
- Use DevTools' performance recorder to inspect how much time the nested loop consumes under different particle counts.
- Simulate low-end devices with CPU throttling to gauge acceptable slider defaults for production.
- Inspect WebGL buffer attributes via Three.js inspector tools to confirm they mark `needsUpdate` correctly.
- Run Lighthouse or axe audits to ensure the overlay controls meet accessibility expectations.
## Troubleshooting Checklist
- No particles: ensure the container div is mounted and `particleCount` slider is not at zero.
- Frozen motion: confirm `renderer.setAnimationLoop` is still active and not cleared prematurely.
- Jagged or missing lines: verify the line geometry attributes are flagged with `needsUpdate` each frame.
- Incorrect colors: remember the color buffer stores alpha replicated in RGB channels for simplicity; adjust material if full color coding is needed.
- Camera stuck: check that UI overlay does not hog pointer events; add `pointer-events: none` if necessary.
- Performance spikes: reduce particle count or enable connection limits; consider lowering minDistance.
- Helper cube invisible: ensure `BoxHelper` material uses additive blending with adequate opacity.
- Memory leak warnings: confirm cleanup disposes geos/materials and clears renderer animation loop.
- Unexpected gaps: double-check velocity inversion logic so particles reflect properly off boundaries.
- Slider glitches: verify React state updates use functional setState to avoid stale closures when referencing `settings`.
## Reference Links
- BufferGeometry draw range example: https://threejs.org/examples/?q=buffer#webgl_buffergeometry_drawrange
- OrbitControls documentation: https://threejs.org/docs/#examples/en/controls/OrbitControls
- Additive blending concepts: https://threejs.org/docs/#api/en/constants/CustomBlendingEquations
- Graph visualization inspiration: https://ncase.me/crowds/ (conceptual reference)
- Spatial hashing overview for optimization: https://www.redblobgames.com/grids/line-drawing.html
- React + Three best practices: https://threejs.org/manual/#en/react
## Data Flow And Lifecycle
- `useEffect` houses all Three.js initialization, ensuring it only runs client-side.
- Refs capture pointers to point cloud, lines mesh, and geometry for cross-cutting updates.
- `settingsRef` mirrors React state so the animation loop always reads the newest values without triggering rerenders.
- Event listeners for window resize update camera aspect and renderer size, keeping perspective correct.
- Cleanup clears the animation loop, disposes geometries/materials, and nulls refs to aid garbage collection.
- Removing the renderer DOM node prevents duplicate canvases if the component remounts quickly.
- Buffer attributes persist across frames; only their contents change, so uploads remain incremental.
- UI interactions modify React state, which in turn triggers the `useEffect` watcher to update draw ranges and visibility flags.
- Because there is no React state inside the loop, the render function never re-runs unnecessarily.
- Deterministic initialization ensures the particle field looks identical each mount unless randomness is reseeded.
## Future Enhancement Ideas
- Replace brute-force distance checks with a uniform grid or octree to scale beyond 2k particles.
- Introduce GPU compute via WebGL2 transform feedback or WebGPU for physics updates.
- Add cluster detection and color coding to highlight emerging communities.
- Drive particle velocities from live telemetry (e.g., server metrics) to reflect actual network activity.
- Add depth of field post-processing to emphasize certain depth slices.
- Export snapshots of particle positions and connections as JSON for offline analysis.
- Support VR controllers via WebXR to let users physically walk through the network cube.
- Allow users to save and restore slider presets for specific looks.
- Overlay labels on select particles to represent named services or devices.
- Combine with audio input so bass expands the cube while treble increases connection counts.

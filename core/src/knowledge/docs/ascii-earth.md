# ASCII Earth Documentation

## Component Overview
- `AsciiEarth` is a client-side React component that boots a Three.js scene as soon as the container div mounts.
- It renders a textured Earth sphere through WebGL and projects the frame into glyphs with `AsciiEffect` for a terminal aesthetic.
- The underlying WebGL canvas stays hidden, while the ASCII `<div>` is visible, so users only perceive the stylized output.
- An Earth day-map texture stored in `/assets/textures/earth_daymap.jpg` supplies photographic land and ocean coloration.
- The camera uses a 50° perspective with near/far planes at 0.1 and 1000 units, positioned at `z = 3` toward the origin.
- Animation relies on `renderer.setAnimationLoop`, keeping rotation smooth even on high refresh displays.
- A quick texture darkening pass halves the RGB channels, boosting ASCII contrast without editing the original JPEG.
- Everything sits inside a single React effect, ensuring WebGL objects are only created on the client and only once per mount.
- Cleanup tears down geometries, materials, textures, and DOM children to prevent GPU leaks during navigation.
- The look merges retro mainframe vibes with modern GPU rendering so it fits neon dashboards and sci-fi hero sections.

## Scene Construction Sequence
- The effect guard verifies `containerRef.current` before creating any WebGL objects, avoiding SSR pitfalls.
- A `THREE.Scene` instance stores the Earth mesh and any future actors that should appear in ASCII form.
- `THREE.PerspectiveCamera` is initialized with the current window aspect ratio for pixel-perfect ASCII sampling.
- A `THREE.WebGLRenderer` is spawned, sized to the viewport, and pixel ratio is clamped to the device value for crisp glyphs.
- Immediately after creation, `renderer.domElement.style.display = "none"` hides the raw canvas while keeping the GL context alive.
- `AsciiEffect` wraps the renderer and exposes a DOM element filled with characters from the string `" .=+*#%"`.
- Both the renderer canvas and ASCII DOM node are appended to the container to maintain rendering order and input routing.
- `OrbitControls` target the ASCII DOM node, so pointer events over the glyphs still manipulate the camera.
- `TextureLoader` fetches the day-map; its color space is switched to `THREE.SRGBColorSpace` so gamma math stays accurate.
- A temporary 2D canvas darkens the texture on upload by manipulating pixel data and reassigning the canvas as the texture image.
- The Earth mesh uses `SphereGeometry(1, 64, 64)` with `MeshBasicMaterial` to keep shading purely texture-driven.
- The mesh is added to the scene origin, ready for orbit interactions and ASCII sampling.
- A resize handler recomputes camera aspect, projection matrix, renderer size, and ASCII effect size with every window change.
## Rendering And ASCII Conversion Flow
- The animation loop increments both `earth.rotation.y` and `earth.rotation.x`, yielding a slow wobble reminiscent of orbital footage.
- `controls.update()` applies damping (0.05) so drag motions ease out gradually for a cinematic feel.
- Instead of calling `renderer.render`, the loop invokes `effect.render(scene, camera)`, forcing all frames through the ASCII converter.
- `AsciiEffect` renders the scene off-screen, measures luminance per pixel block, and maps each bucket to a glyph from its ramp.
- The glyph sequence is ordered from lightest to darkest, allowing brightness to translate into coverage percentage per cell.
- Invert mode flips colors so characters glow on a dark backdrop, matching CRT consoles.
- Because the ASCII output is standard DOM, CSS can restyle fonts, colors, or blending without touching GPU resources.
- The hidden WebGL canvas still drives GPU work, so performance remains similar while CPU time increases for glyph sampling.
- Pixel ratios taken from the device guarantee the ASCII sampler gets enough resolution even on Retina displays.
- The loop runs until cleanup calls `renderer.setAnimationLoop(null)`, ensuring no stray RAF callbacks linger.

## Interaction And Controls
- `OrbitControls` provide intuitive drag-to-orbit behavior, rotating the camera around the globe center.
- Mouse wheel zoom shifts the camera radius, letting viewers dive toward continents without clipping through the mesh.
- Damping factor 0.05 simulates friction by exponentially decaying angular velocity once the user releases the mouse.
- The same control class automatically supports touch gestures because it listens to pointer events on the ASCII DOM node.
- Keyboard support can be enabled via `controls.listenToKeyEvents` when accessibility or kiosks demand arrow-key orbiting.
- Scroll limits can be tuned through `controls.minDistance` and `controls.maxDistance` to prevent zooming inside the glyph grid.
- Because the overlay is text, tooltips or buttons can sit on top without z-fighting with the WebGL canvas.
- The controls dispose cleanly during teardown, freeing native listeners to avoid stacking duplicates on navigation.
- Setting `controls.enableZoom = false` converts the experience into a fixed-distance spin suitable for background loops.
- The visible cursor against the dark ASCII background keeps interaction obvious even without on-screen UI hints.
## Capabilities And Tunable Parameters
- Swap the glyph string to include characters like `@`, `$`, or `_` to alter tonal resolution and readability.
- Adjust `renderer.setPixelRatio` downward for chunkier ASCII cells or upward for finer detail (with CPU cost).
- Increase or decrease `SphereGeometry` segment counts to balance polygon detail against load times.
- Modify rotation speeds to create anything from meditative spins to frenetic data-visualization loops.
- Replace the texture path with Mars, Moon, or brand imagery to repurpose the component beyond Earth.
- Wrap the ASCII DOM in CSS filters (blur, drop shadow) for stylized UI integrations.
- Add overlays such as latitude lines or orbit paths by inserting extra meshes before the ASCII conversion stage.
- Feed dynamic textures (live weather maps, API driven tiles) to turn the globe into a data display.
- Provide React controls that toggle between ASCII and standard WebGL modes for comparison demos.
- Use clipping planes or custom shaders to reveal cross sections of the globe while retaining ASCII shading.
## Math, Algorithms, And Graphics Concepts
- `SphereGeometry` parameterizes the mesh using spherical coordinates: `x=r sin(phi) cos(theta)`, `y=r sin(phi) sin(theta)`, `z=r cos(phi)`.
- Perspective projection uses `tan(fov/2)` to derive near-plane height, preserving the intended angular size.
- Damping implements exponential decay where `velocity *= 1 - factor`, mimicking physical friction.
- Texture darkening multiplies each RGB channel by 0.5, equivalent to scaling the color vector by a scalar matrix.
- ASCII luminance sampling weights channels via Rec.709 coefficients to approximate human perception.
- Glyph mapping quantizes continuous brightness into discrete bins whose indices map to characters.
- Camera orbits are effectively spherical-to-Cartesian transformations applied to the camera position vector.
- Resize handling recomputes projection matrices so the ASCII output never stretches vertically.
- `MeshBasicMaterial` bypasses lighting equations, turning fragment color into the raw texel—ideal for ASCII conversions.
- The rotation increments integrate angular velocity over time, approximating `theta += omega * dt`.
## Data Flow And Lifecycle
- `useEffect` ensures initialization only executes on the client and only after the container ref exists.
- The texture loader triggers immediately; once decoding finishes, the darkening canvas mutates the bitmap before GPU upload.
- `AsciiEffect` DOM node is appended once and later removed during cleanup so multiple mounts do not stack overlays.
- The animation loop keeps a reference to the mesh and controls; cleanup nulls the loop to stop requestAnimationFrame.
- Geometries, materials, and textures are disposed explicitly, freeing GPU buffers during route changes.
- Window resize listeners are attached to `window` and removed to prevent duplicate callbacks when React remounts in StrictMode.
- Clearing `containerRef.current.innerHTML` guarantees the DOM tree resets even if the component remounts quickly.
- Refs store renderer, effect, and control instances, avoiding re-instantiation on re-render.
- Because no React state updates occur inside the loop, renders stay deterministic and free from React feedback loops.
- The component returns `null` cleanup function results gracefully if unmounted before the texture finishes loading.
## Performance Considerations
- ASCII conversion is CPU bound; lowering glyph resolution or viewport size directly improves frame rate on weaker machines.
- Clamping pixel ratio helps avoid processing 4K worth of glyphs on Retina laptops where each character multiply counts.
- Texture preprocessing happens once, so runtime cost is dominated by ASCII sampling instead of GPU shading.
- With `MeshBasicMaterial`, the shader path stays cheap—no lights, shadows, or normal calculations are required.
- OrbitControls math is minimal compared to ASCII work, but damping adds better perceived fluidity for a tiny CPU cost.
- Hidden renderer canvas means the browser only paints the ASCII DOM, preventing double compositing.
- Developers can instrument the effect by measuring `performance.now()` deltas before and after `effect.render`.
- Mobile browsers may throttle background tabs; cleanup ensures loops stop so the page sleeps peacefully when hidden.
- If memory pressure warnings appear, share a single renderer/effect via context instead of instantiating per mount.
- Use monospace fonts with minimal ligature support to prevent expensive reflow during glyph churn.
## Practical Use Cases
- Terminal-themed dashboards that want a living map beside textual telemetry.
- Cyberpunk marketing pages looking for an eye-catching yet lightweight hero animation.
- Game or movie companion sites needing an in-world console readout of Earth.
- Educational exhibits demonstrating the bridge between raster graphics and ASCII art.
- Command-center mockups where the ASCII globe highlights geofenced alerts.
- Twitch overlays and streaming scenes that need a stylized rotating planet with transparent background options.
- Storytelling microsites that reveal locations by syncing text callouts with ASCII rotation.
- Chat or IRC-inspired apps that want ambient ASCII art to echo user activity.
- Security operations centers visualizing attack origins with ASCII glyph intensity.
- Art installations exploring the nostalgia of teletype graphics fused with real-time data.
## Extension Ideas
- Blend between day and night textures using a custom shader that computes the sun vector.
- Add an atmosphere sphere with additive blending to simulate glow before ASCII conversion.
- Spawn particle satellites or arcs representing orbits that also inherit ASCII styling.
- Stream live satellite or weather tiles for truly real-time ASCII globes.
- Provide UI toggles to swap glyph ramps, invert mode, rotation speed, or zoom locks.
- Export ASCII snapshots by reading `effect.domElement.innerText` and piping it into downloads.
- Combine `AsciiEffect` with `EffectComposer` to insert bloom or film grain passes before glyph sampling.
- Hook audio analyzers to rotation or glyph density for sound-reactive ASCII art.
- Replace OrbitControls with device orientation on phones to create a handheld ASCII globe.
- Package the component as a reusable hook/module so other apps can import it without copying code.
## Troubleshooting Checklist
- Blank viewport: confirm the container div stretches full screen and the component only runs `useEffect` on the client.
- Checkerboard texture: indicates a load failure; check the JPG path and server logs.
- Lag spikes: reduce pixel ratio or shorten the glyph string to shrink CPU cost.
- Camera stuck: ensure no CSS overlay intercepts pointer events on the ASCII DOM node.
- Distorted aspect: resize handler must update both the renderer and the ASCII effect with identical dimensions.
- Memory leak warnings: verify cleanup disposes of geometry/material/texture and removes event listeners.
- Duplicate renderers: React StrictMode may double mount; guard with a ref flag if necessary.
- Garbled glyphs: enforce a monospace font such as `Courier New` and disable ligatures to keep columns aligned.
- Texture too bright or dark: tweak the canvas multiplier (currently 0.5) or adjust gamma before upload.
- Z-fighting UI: wrap overlays with higher z-index and `pointer-events: none` if they should not consume input.
## Reference Links
- AsciiEffect docs: https://threejs.org/docs/index.html#examples/en/effects/AsciiEffect
- OrbitControls docs: https://threejs.org/docs/#examples/en/controls/OrbitControls
- Blue Marble imagery: https://visibleearth.nasa.gov/collection/1484/blue-marble
- ASCII art overview: https://www.aesthetic-computing.com/ascii-rendering
- Projection math refresher: https://www.songho.ca/opengl/gl_projectionmatrix.html
- Three.js + React best practices: https://threejs.org/manual/#en/react
## Implementation Checklist
- Ensure the parent layout sets `body` and `html` to `height: 100%` so the container div can expand.
- Import the component dynamically with `{ ssr: false }` if using Next.js pages that pre-render on the server.
- Confirm `/public/assets/textures/earth_daymap.jpg` ships with the deployment artifact.
- Include a monospace font declaration in global CSS to guarantee uniform glyph dimensions.
- Verify the app shell does not apply `overflow: hidden` on `body` unless intended, as it can mask scroll zoom feedback.
- Wrap the component in an error boundary to capture WebGL context loss events gracefully.
- When composing with other canvases, remember this component manipulates `window` resize listeners; coordinate with other listeners to avoid thrash.
- Consider providing fallback text for browsers without WebGL support, detected via `THREE.WEBGL.isWebGLAvailable()`.
- Document the cleanup expectations so future maintainers know to dispose of Three.js artifacts explicitly.
- Profile with DevTools Performance panel when adjusting glyph density to verify CPU headroom remains.
## Testing Tips
- Use `pnpm dev` with the `/examples/ascii-earth` route to confirm the doc instructions match behavior.
- Resize the browser repeatedly to ensure the ASCII grid tracks width and height without misalignment.
- Toggle device emulation in DevTools to validate touch orbiting and performance on mobile breakpoints.
- Use the Performance panel to capture flame charts and identify whether ASCII conversion or controls dominate CPU time.
- Throttle network speed to `Slow 3G` to observe texture loading fallback and ensure the darkening step waits for decode.
- Capture screenshots at multiple zoom levels to verify glyph density remains comfortable and legible.
- Run Lighthouse accessibility audits to confirm sufficient contrast between glyphs and background.
- Simulate WebGL context loss via DevTools (`lose-context`) to verify cleanup and remount flows behave.
- Ensure server logs include the texture asset during build to catch missing files before deployment.
- Document GPU and CPU budgets after profiling so future changes have targets to stay within.

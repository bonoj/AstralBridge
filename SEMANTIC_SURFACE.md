# AstralBridge Semantic Surface

This surface records truths present in the current executable source at the start of the AstralBridge expedition.

It is descriptive, not a design mandate. Much of this machinery is inherited and may disappear if the expedition does not need it.

## Build and release boundary

Authored browser source lives under `src/`.

`tools/build.mjs` bundles `src/main.js` with esbuild, inlines stylesheet and JavaScript into `src/shell.html`, embeds `GITHUB_SHA` as `globalThis.__CRUCIBLE_BUILD__`, and writes a self-contained executable to `dist/index.html`.

The repository-root `index.html` is a promoted release artifact. It is not authored source.

The repository has working immutable candidate builds, a published `/preview/` candidate surface, exact-byte promotion, and GitHub Pages deployment. `CLONE_AND_DEPLOY.md` describes that machinery.

## ECS

`src/core/ecs.js` implements a small in-memory ECS.

Entity identity is an incrementing integer. Living IDs are held in a `Set`. Components are named `Map` stores from entity ID to unconstrained values.

`world.add` requires a living entity. `world.remove` removes one component value. `world.destroy` removes the entity and its values from every component store.

`world.query(...components)` returns living entities present in every supplied store and begins from the smallest supplied store. A query with no components returns all living entities.

Current component stores are created in `src/main.js`. There is no general scheduler, component schema, inheritance hierarchy, event bus, serialization layer, or entity class.

## Frame and systems

The animation frame in `src/main.js` currently runs:

`physics → meteors.update → orbit.applyAll → lights.syncAll → renderSync → cameras.render`

Systems are ordinary functions/modules invoked explicitly. There is no general system registry.

The current physics pass handles entities carrying `Transform + Body + Gravity`, with optional `Support` terrain/apparatus settling. Its body collision vocabulary is spherical.

## ECS and Three.js

`Transform` is plain component data containing Three.js vectors/eulers.

For entities with both `Transform` and `RenderObject`, `render-sync.js` copies ECS transform state into the referenced Three.js object each frame.

Not every visible object is an ECS entity. Terrain chunks, the octagonal apparatus, optional water, and meteor trails are owned directly by their runtime code. Cameras and lights are ECS entities with realized Three.js objects stored in view components.

## Terrain and inherited world

`terrain-system.js` owns a dense `60 × 44 × 60` `Float32Array` scalar field spanning a fixed 3D volume.

Positive values are material and negative values are empty space. The current seed function produces an initially flat surface. Polygonization uses tetrahedra and is clipped to a material octagon.

Local impacts edit field samples in bounded regions and rebuild affected chunks and support data. Reset restores the captured initial field.

A separate support grid caches ground heights for ordinary body settling. The terrain system also owns tests for the material octagon, apparatus footprint, apparatus-wall collision, and segment intersection.

The current scene contains the terrain, octagonal apparatus, one orbiting perspective camera, three lights, fog, optional static water, and debug-triggered meteors.

Water has no simulation behavior.

Meteors are ECS entities while falling. Their trajectories are time-parametric. Terrain impact can edit the density field and impart impulses to ECS bodies carrying velocity.

None of this world machinery is required by AstralBridge merely because it was inherited.

## Camera, light, and rendering

Camera state is represented by ECS components. Orbit input mutates `OrbitBehavior`; the orbit system writes camera `Transform`.

The camera system realizes perspective or orthographic Three.js cameras, synchronizes projection and pose, selects an active camera, and renders through it.

The light system realizes hemisphere, ambient, or directional Three.js lights and synchronizes their current values.

The Three.js runtime owns the scene, WebGL renderer, resize observation, tone mapping, shadow configuration, rendering, and WebGL/shader diagnostics.

## Debug and inspection

Legacy inherited names remain in the current code.

`globalThis.crucible` exposes `spawnMatter`, `meteor`, `groundHeight`, and `inspect`.

`globalThis.crucibleDebug` exposes ECS, terrain, renderer, system, selected-entity, and water inspection.

Visible debug controls expose FPS, embedded build identity, meteor controls, water visibility, terrain resynthesis, and refresh.

Runtime errors, unhandled promise rejections, shader errors, WebGL context loss, and a startup watchdog feed the visible diagnostics surface.

These names and controls describe current code. They do not define AstralBridge's intended interface.

## Current absence

At this starting point there is no AstralBridge-specific outward/return crossing implemented in authored source.

There is no external-model transport abstraction, provider API integration, durable crossing ledger, identity system, memory system, agent loop, or orchestration layer.

The expedition begins from that absence.

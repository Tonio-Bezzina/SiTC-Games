# Create and Verify the Mycology Asset Library

Treat `mycology/MYCOLOGY_ASSETS.md` as the authoritative inventory and `mycology/MYCOLOGY_GAME.md` as the gameplay/safety authority. This is an execution prompt: create, organise, inspect, repair, document, and verify every required production asset. Do not stop at proposing prompts.

## Required workflow

1. Read both authorities completely and inventory every stable asset ID.
2. Create the exact directory tree `assets/shared`, `assets/mission-1` through `assets/mission-8`, `assets/completion`, `assets/contact-sheets`, and `assets/sources`.
3. Lock the visual direction before generation: friendly semi-realistic 3D educational illustration, soft cool upper-left light, rounded clean materials, navy contact shadows, no text/logos/watermarks, and the verified SiTC palette for interface-adjacent elements.
4. Use original generated raster artwork for the six designated PNG backgrounds and the three Dr Mira state images. Use earlier approved outputs as references so character identity, wardrobe, proportions, camera, and lighting remain consistent. Generate one asset/variant per call; do not substitute placeholders.
5. Create simple diagrams, icons, callouts, arrows, scientific geometry, and registered families as repository-native SVG. Keep all UI and player-facing text in HTML/CSS.
6. Never use third-party artwork, copied clinical forms, real patient data, hospital logos, brand marks, or external image URLs.
7. Keep every registered state family on identical canvases with the anchors defined in the manifest. Do not create separate “correct-looking” and “wrong-looking” art when correctness comes from live data or reasoning.
8. Preserve editable SVG sources and store generation notes/prompts, not proprietary or external source art, in `assets/sources/`.
9. Inspect every PNG at full resolution and render every SVG. Inspect registered families side by side. Repair malformed equipment, unintended text, transparency halos, inconsistent anchors, weak small-size readability, misleading fungal structures/colours, extra parts, continuity breaks, or answer bias.
10. Build `assets/asset-manifest.json` with measured dimensions, bytes, SHA-256, opacity/transparency, use, alt text, continuity, scientific notes, and source classification for every production asset.
11. Build `assets/README.md` describing visual direction, inventory, reuse, composition, generation prompts, scientific boundaries, and verification commands/results.
12. Create the three labelled contact sheets required by the manifest. Labels must name each file and dimensions; never modify production files to add labels.
13. Run automated checks for file existence, naming, dimensions, transparency, SVG parsing/viewBox, registration, hashes, manifest/filesystem parity, external references, forbidden scripts/text, runtime inventory, and contact-sheet presence.
14. Correct every automated or visual defect and rerun checks until clean.

## Generation constraints

Use the built-in image-generation tool for raster artwork. For each call, state the asset role, exact canvas intent, composition, locked style, lighting, safe overlay areas, transparent/opaque requirement, continuity reference, and the constraints “no text, no labels, no logo, no watermark.” Move each approved output into its exact manifest path. Never leave a referenced asset only in a generated-images cache.

Dr Mira is a fictional adult laboratory scientist with a warm, reassuring expression, teal lab coat, navy trousers, practical closed shoes, tied-back dark curly hair, clear safety glasses, and blue disposable gloves. She is never shown handling open clinical material. All three poses must retain the same face, clothing, proportions, camera, and foot anchor.

Backgrounds must be empty educational laboratory environments with large uncluttered overlay zones. Do not bake instruments into positions that conflict with live SVG/HTML interactions. The completion background may include subtle abstract mushroom/hypha motifs but no readable text.

Scientific SVGs must implement the distinctions in `MYCOLOGY_ASSETS.md` without implying diagnostic certainty. Fluorescence structures are stylised, branching, septate, and sparse. *Aspergillus* morphology is a simplified clue set. The MIC plate is geometry only; live CSS applies states and HTML supplies meaning.

## Gate

The asset phase passes only when every required item exists or is explicitly marked reused/code-rendered/optional, real metadata matches the filesystem, contact sheets exist and have been visually inspected, automated checks pass, all known visual/scientific defects are corrected, and the README records the evidence. Commit the completed library with exactly:

`Create and verify the Mycology game assets`

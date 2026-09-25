# Mycology Game Assets

This library implements `../MYCOLOGY_ASSETS.md` for The Mycology Journey. It combines eighteen original generated PNG illustrations with twenty deterministic repository-native SVGs. Interface copy, case data, labels, choices, focus, feedback, and correctness remain live HTML/CSS.

## Visual direction and continuity

The raster art uses a friendly semi-realistic 3D educational style with soft cool upper-left lighting, clean rounded materials, and the SiTC navy, cyan, teal, white, and gold palette. Dr Mira’s neutral, pointing, and success sprites share the same identity, clothing, 1024-square canvas, scale, and `(512,930)` foot anchor. Mission 2 patients share 1024-square registered canvases and a `(512,960)` foot anchor; specimen choices share 640-square canvases and a `(320,570)` base anchor. Mission backgrounds retain wide empty overlay areas.

The continuing specimen is represented by reusable SVG rather than baked case data. The Mission 4 plate continues into Mission 5; microscopy, culture, identification, and MIC visuals become Mission 8 clue cards. Scientific colours are confined to laboratory artwork.

## Inventory

- `shared/`: three Dr Mira sprites, shell background, game/focus/success/orientation/reduced-motion graphics.
- `mission-1/`: laboratory-safety vignette strip.
- `mission-2/`: five separate fictional patient illustrations and five separate specimen-object illustrations.
- `mission-3/`: reception background, blank dermatology envelope, blank request form.
- `mission-4/`: skin flake, slide, SDCC fungal plate, processing background, stylised fluorescence field.
- `mission-5/`: incubator states and registered culture choices.
- `mission-6/`: four colony references, four simplified microscopic references, identification-key arrows.
- `mission-7/`: 96-well geometry with live state applied by CSS.
- `mission-8/`: empty detective board and eight journey icons.
- `completion/`: completion background and badge.
- `contact-sheets/`: labelled shared/background, Mission 2 patient/specimen, mission, and state-family review sheets.
- `sources/`: generation notes only; no third-party source art.

`asset-manifest.json` contains measured dimensions, byte counts, SHA-256 hashes, source classification, alt recommendations, missions, and registration metadata for every production PNG/SVG.

## Scientific and safety boundaries

The fluorescence field is a sparse stylised teaching image of branching septate structures, not a diagnostic micrograph. The *Aspergillus* set makes only the simplified source-document distinctions and must be accompanied by the educational disclaimer. Culture art contains no clinical identifiers or correctness labels. The MIC plate contains no drug, dose, breakpoint, or interpretation. No asset provides a culture recipe, handling procedure, collection technique, or treatment recommendation.

## Verification

Run from the repository root with the bundled Node runtime and package path:

`node mycology/tools/check_assets.cjs`

The checker enforces manifest/filesystem parity, stable lowercase naming, unique IDs, real dimensions/bytes/hashes, PNG alpha expectations, SVG viewBox/title presence, no scripts/external URLs, registered Dr Mira/Mission 2 canvases and anchors, and contact-sheet presence.

Visual review on 20 and 25 September 2026 inspected all eighteen PNGs at full resolution and all SVGs through labelled contact sheets. The registered state families were compared side by side for identity, scale, canvas, colour, morphology, and answer bias. No accidental text, logos, real identifiers, malformed equipment, open-culture handling, or uncorrected scientific continuity defects remain.

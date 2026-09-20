# Mission 4 Process the Dermatology Sample

## Purpose and entry

Mission 4 contrasts direct microscopy with culture. It requires Missions 1–3 and the accepted fictional skin scraping. Input is an envelope containing six visual skin-flake tokens. Output is a microscopy clue (`fungal elements seen`) and an inoculated simulated SDCC fungal plate.

Instruction: **Let’s use the skin scraping sample for fluorescent microscopy and culture.** Transfer prompt: **Place three pieces on the microscope slide and three pieces on the SDCC fungal agar plate.** The player may drag or select/place each piece. The mission cannot advance until the counts are exactly 3/3. Success: **Good work. Three pieces are ready for microscopy and three are ready for culture.** Invalid finish: **Keep the sample balanced: three pieces for each laboratory method.**

Microscope prompt: **Place the prepared slide on the microscope, adjust the focus, then explore the field to find bright fungal structures.** Focus is a labelled range control plus keyboard arrow keys. Pan is drag/touch or arrow buttons. The target region contains stylised bright branching septate structures and spores.

Success: **You found them! The bright structures are fungal elements. Fluorescence makes it easier for us to find them.** Incorrect region: **Look carefully through the microscope and try finding a different area.** Hint: **Look for bright branching, tube-like hyphae with cross-walls and small spore shapes.** Learning: **Microscopy can examine a clinical specimen directly for fungal structures. This is a laboratory simulation, not an activity to perform yourself.** Completion: **Microscopy clue saved. The culture plate is now in the simulated incubator.**

## Boundaries, state, and assets

Do not show reagent preparation, quantities, culture conditions, handling technique, or a real diagnostic image. Persist destination of each of six tokens, focus value, field offset, found flag, clue, and mission flag. Resume reconstructs all positions without duplicate tokens.

Required: shared guide/help/success assets; `assets/mission-4/processing-bench-background.png`, `skin-scraping-piece.svg`, `microscope-slide.svg`, `sdcc-plate.svg`, `fluorescence-field.svg`; and `assets/shared/reduced-motion-process.svg`.

All draggable tokens are buttons with position/status names. Counts are announced politely. Reduced motion uses immediate placement and a static before/after panel. Portrait stacks destinations and provides explicit **Place on slide** / **Place on culture** buttons.

## Verification gate

Test all allocation corrections, exact 3/3 gate, drag/tap/keyboard placement, focus/pan target and wrong region, refresh during allocation and microscopy, no procedural additions, reduced-motion equivalent, responsive layouts, and Mission 5 input continuity. No hub award.

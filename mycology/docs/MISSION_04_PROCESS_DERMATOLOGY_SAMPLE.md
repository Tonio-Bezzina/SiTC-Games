# Mission 4 Process the Dermatology Sample

## Purpose and entry

Mission 4 contrasts direct microscopy with culture. It requires Missions 1–3 and the accepted fictional skin scraping. Input is an envelope containing six visual skin-flake tokens. Output is a microscopy clue (`fungal elements seen`) and an inoculated simulated SDCC fungal plate.

Instruction: **Let’s use the skin scraping sample for fluorescent microscopy and culture.** Transfer prompt: **Drag each skin-scraping piece onto an empty slide or empty culture medium. Each target can hold only one piece.** The scene contains six independent one-capacity targets: three empty microscope slides and three empty culture media. Empty targets carry the visible cue **EMPTY — DROP SAMPLE HERE**. The player may drag or select/place each piece. Attempting to use an occupied target keeps the piece selected and directs the player to an empty target. The mission cannot advance until all six targets contain exactly one piece. Success: **Good work. Every slide and culture medium holds exactly one sample.**

Microscope prompt: **Compare all five views. Choose the sharpest one, then tap the area where you would look for fungal clues.** Five registered fluorescence views show the same field at different focus levels; only View 3 is in focus. Choosing an out-of-focus view prompts another comparison. Choosing View 3 opens three tappable areas on the focused image. Only the bright branching area completes the observation.

Success: **You found them! The bright structures are fungal elements. Fluorescence makes it easier for us to find them.** Incorrect region: **Look carefully through the microscope and try finding a different area.** Hint: **Look for bright branching, tube-like hyphae with cross-walls and small spore shapes.** Learning: **Microscopy can examine a clinical specimen directly for fungal structures. This is a laboratory simulation, not an activity to perform yourself.** Completion: **Microscopy clue saved. The culture plate is now in the simulated incubator.**

## Boundaries, state, and assets

Do not show reagent preparation, quantities, culture conditions, handling technique, or a real diagnostic image. Persist the unique target of each of six tokens, selected token, selected focus view, found flag, clue, and mission flag. Resume reconstructs all positions without duplicate tokens or double-occupied targets.

Required: shared guide/help/success assets; `assets/mission-4/processing-bench-background.png`, `skin-scraping-piece.svg`, `microscope-slide.svg`, `sdcc-plate.svg`, five `microscopy-view-*.svg` assets; and `assets/shared/reduced-motion-process.svg`.

All draggable tokens and destinations are semantic buttons with position/status names. Counts and occupied-target errors are announced. Tap/select and keyboard placement are complete alternatives to dragging. Reduced motion uses immediate placement. Portrait stacks target groups while preserving the individual empty-target buttons.

## Verification gate

Test all six unique targets, occupied-target rejection, exact one-per-target gate, drag/tap/keyboard placement, all five focus choices, correct-view-only hotspots, wrong region, refresh during allocation and microscopy, no procedural additions, reduced-motion equivalent, responsive layouts, and Mission 5 input continuity. No hub award.

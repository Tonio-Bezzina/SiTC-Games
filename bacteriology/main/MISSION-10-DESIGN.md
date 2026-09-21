# Mission 10 — The Final Mystery

## Purpose

Mission 10 is the climax of the Bacteriology Journey. The player uses MALDI-TOF to identify the cultured organism to species level only after specimen collection, culture, Gram staining and microscopy have been completed.

Scientific outcome: **Streptococcus pyogenes**.

The interaction follows the bacteriologist-provided sequence: pick one colony, place it on a MALDI target, cover it with matrix, load the target into the MALDI-TOF instrument, and compare the resulting bacterial protein pattern.

## Scene and interaction line

The scene uses the established laboratory background, foreground bench, large instruction cards, pulsing yellow active targets, teal selected states and Dr Mira feedback used elsewhere in the game.

### Opening state

- Show the original incubated blood agar culture on the left side of the bench.
- Show a sterile 1 µL loop beside the culture.
- Show the MALDI target plate in the centre.
- Show an empty pipette and matrix solution bottle beside the target plate.
- Show a large MALDI-TOF instrument on the right with its loading port open.
- Introductory copy: “We have found the bacteria, but we still need to find out exactly what they are. Let’s identify our mystery bacterium!”

### Step 1 — Select the loop

- Instruction: “Select the sterile 1 µL loop.”
- The loop pulses with a yellow outline.
- Selecting it changes the outline to teal and advances the mission.
- Other equipment is visible but inactive.

### Step 2 — Pick one colony

- Instruction: “Choose one isolated colony from the culture plate.”
- An isolated colony target pulses on the culture plate.
- Selecting it changes the loop image to the reused loop-with-colony asset.
- Feedback: “One isolated colony is on the loop.”

### Step 3 — Spot the MALDI target plate

- Instruction: “Place the bacteria onto the highlighted spot on the MALDI target plate.”
- The selected spot pulses.
- The player may drag the loaded loop to the spot or select the loop and then the spot.
- The target plate changes from its empty state to its bacteria-spotted state.
- Feedback: “The bacterial colony is on the target spot.”

### Step 4 — Select the pipette

- Instruction: “Select the pipette with a clean tip.”
- The empty pipette pulses.
- Selecting it gives it a teal outline and advances the mission.

### Step 5 — Draw up matrix solution

- Instruction: “Draw matrix solution into the pipette.”
- The matrix bottle pulses.
- The player may drag the selected pipette to the bottle or select the bottle.
- The pipette changes to the matrix-loaded state.
- Feedback: “The pipette now contains matrix solution.”

### Step 6 — Add matrix to the bacteria spot

- Instruction: “Place one drop of matrix over the bacteria spot.”
- The same target spot pulses.
- The player may drag the loaded pipette to the spot or select the pipette and then the spot.
- The target plate changes to its bacteria-plus-matrix state.
- Feedback explains that matrix helps the MALDI-TOF analyse bacterial proteins.

### Step 7 — Load the target plate

- Instruction: “Load the prepared target plate into the MALDI-TOF.”
- The target plate becomes selectable and the instrument loading port pulses.
- The player may drag the target plate to the instrument or select the plate and then the instrument.
- The target plate animates towards the loading port and disappears into the instrument.
- The instrument changes to its active state.

### Step 8 — Start analysis

- Instruction: “Start the MALDI-TOF analysis.”
- The instrument start control pulses.
- On activation, the analysis runs automatically through:
  1. “Analysing sample…”
  2. “Comparing bacterial protein pattern…”
  3. “Identification complete”
- Animated scan bars and instrument lights provide the motion; no additional image assets are needed.
- A “Skip analysis animation” button remains available.

### Result

- Present a clear result panel:
  - “IDENTIFICATION COMPLETE”
  - “Bacterial identification: MATCH FOUND”
  - “Streptococcus pyogenes”
- Learning point: MALDI-TOF identifies bacteria by comparing a protein pattern with reference patterns. The microscopy result suggested streptococci, but MALDI-TOF supplies the species-level identification.
- The final action proceeds to the existing journey-completion screen.

## Asset inventory

### Reused assets

| Asset | Source | Use |
| --- | --- | --- |
| `laboratory-interior-background.png` | `assets/mission-2/` | Laboratory backdrop |
| `incubated-blood-agar-plate.png` | `assets/mission-7/` | Culture plate base |
| `selectable-colony-overlay.png` | `assets/mission-7/` | Visible isolated colonies and colony target alignment |
| `sterile-loop-1ul.png` | `assets/mission-7/` | Empty loop |
| `loop-with-colony.png` | `assets/mission-7/` | Loop after colony selection |

### New Mission 10 assets

All new files are transparent PNG cutouts on a 1254 × 1254 canvas. Related states must remain aligned so CSS can swap them without a visual jump.

| Filename | Required content | Alignment group |
| --- | --- | --- |
| `matrix-solution-bottle.png` | Small clear laboratory reagent bottle with amber matrix solution, blue cap, no readable branding | matrix-bottle |
| `pipette-empty.png` | White-and-blue adjustable micropipette with a clean clear tip | pipette |
| `pipette-with-matrix.png` | Same pipette, angle and scale; pale amber matrix visible in the tip | pipette |
| `maldi-target-plate-empty.png` | Brushed stainless-steel MALDI target plate with a regular array of circular wells | target-plate |
| `maldi-target-plate-bacteria.png` | Same target plate; one central well has a small cream bacterial spot | target-plate |
| `maldi-target-plate-matrix.png` | Same target plate; the same well has a small translucent amber matrix-covered spot | target-plate |
| `maldi-tof-open.png` | Large white, charcoal and blue benchtop MALDI-TOF instrument with open target-loading port | maldi-instrument |
| `maldi-tof-active.png` | Same instrument, framing and port geometry; port closed and blue/cyan status lights active | maldi-instrument |

## Asset constraints

- Match the polished, lightly stylised laboratory realism of Missions 7–9.
- Use the existing white, charcoal, blue and cyan equipment palette.
- Keep clean silhouettes, realistic materials and soft studio shadows.
- Do not include logos, trademarks, watermarks or embedded instructional text.
- Transparent pixels must surround each cutout.
- Do not create any additional raster assets during implementation. Visual guidance, active spots, arrows, progress lights and analysis animations must use HTML/CSS.

## Implementation constraints

- Build Mission 10 only after every new asset above exists in `assets/mission-10/`.
- Use only the reused assets and the eight new assets listed here.
- Support both click/tap sequencing and drag-and-drop for the three transfer actions.
- Preserve keyboard focus styles, clear labels, minimum touch-target sizing and live feedback.
- Keep the scene usable in the existing landscape breakpoints.
- If an asset or protocol problem blocks faithful implementation, record it in `MISSION-10-ISSUES.md` instead of creating an unplanned asset.

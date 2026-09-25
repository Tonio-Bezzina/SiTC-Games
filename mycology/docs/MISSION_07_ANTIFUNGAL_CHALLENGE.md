# Mission 7 The Antifungal Challenge

## Purpose and entry

Mission 7 teaches **MIC — Minimum Inhibitory Concentration** as an observed endpoint. It requires Missions 1–6 and the simulated *A. fumigatus* clue. Input is a prepared fictional isolate and a simplified plate result. Output is an MIC clue without clinical interpretation.

Instruction: **We have identified our fungus. But which concentration first stops visible growth? Let’s investigate!** Safety line: **This is a simplified, supervised laboratory simulation. It does not show how to prepare or perform the test.**

The workflow is a non-interactive overview: select the already-prepared fictional suspension card, activate the simulated plate, skip/wait through a short result transition, then read one highlighted row of increasing arbitrary display units. Wells 1–4 are pink with visible growth; wells 5–8 are blue with no visible growth. A growth-control well remains pink. The player must select well 5.

Read prompt: **Start at the lowest concentration and move upward. Select the first blue well with no visible growth after the pink growth wells.** Correct: **Excellent! You found the MIC — the Minimum Inhibitory Concentration.** Incorrect: **Look from the lower concentrations upwards. Find the first concentration where visible growth is inhibited.** Hint: **Pink means visible growth in this simulation. Blue means no visible growth. Find the first blue well in order.** Learning: **Antifungal susceptibility testing investigates how a fungus responds to antifungal agents. MIC means Minimum Inhibitory Concentration. The result is not a treatment recommendation.** Saving the correct clue opens the complete read-only journey summary automatically.

## State, assets, and boundaries

Persist workflow step, transition skipped/viewed, attempts, selected well, MIC clue, and mission flag. Required: shared assets, `assets/mission-7/mic-plate.svg`, and `assets/shared/reduced-motion-process.svg`. Live HTML provides row positions, symbols, arbitrary units, and descriptions.

Never name an antifungal, concentration unit, dose, breakpoint, susceptible/resistant category, protocol, volume, or treatment. Colour is reinforced by **growth**/**no visible growth** text and patterned symbols. Each well is a 48 px button with row/position/status in its accessible name. Reduced motion jumps to the result.

## Verification gate

Test workflow order, transition skip, well 5 gate, every wrong well, hint, pink/blue plus text/symbol reinforcement, refresh at each step, keyboard/touch, reduced motion, no clinical interpretation, persistence, automatic summary transition, and automatic idempotent hub award.

# Mission 4 — Cut Very Thin Sections

## Mission purpose

This standalone specification defines **Mission 4 of 7** in **The Histology Journey**. The scientific term is **Microtomy**. The player learns that a microtome cuts very thin sections from an FFPE wax block.

## Entry and required output

Input: the completed FFPE wax block from the accepted patient's skin specimen.

Output: one clearly visible very thin tissue section or short ribbon ready for slide preparation.

## Player-facing copy

- Title: **Cut Very Thin Sections**
- Question: **“We need a very thin slice of our tissue. Which machine should we use?”**
- Options:
  - **Microtome**
  - **Staining Machine**
- Correct choice: **Microtome**
- Correct feedback: **“That's right! A microtome cuts very thin sections of tissue.”**
- Incorrect feedback: **“Not yet! We need to cut the tissue before we can stain it. Try again.”**
- Scientific term: **Microtomy**
- Completion action: **NEXT**

## What the player sees

Show the labelled FFPE wax block with two large, clearly labelled equipment choices: a microtome and a staining machine. The equipment should be visually distinct and accurate enough to support recognition, but kept friendly and uncluttered.

After the correct choice, transition to a protected close-up of the microtome. The cutting edge remains within the machine housing; do not turn the mission into a blade-handling simulation.

## Interaction flow

1. Present the question and the two equipment choices.
2. Selecting **Staining Machine** shows the exact incorrect feedback and keeps both choices available.
3. Selecting **Microtome** locks the choice and shows the exact correct feedback.
4. Pause on the protected microtome close-up until the player presses **NEXT**.
5. Show the wax block safely loaded into the microtome holder and pause until **NEXT**.
6. Show one very thin tissue section or ribbon emerging and pause until **NEXT**.
7. Pause on a clear before/after comparison: **FFPE wax block** and **Very thin tissue section**. Leave it on screen until the player presses the final **NEXT**.

No extra hand positioning, blade adjustment, numerical thickness, or trimming steps are required unless separately approved.

## Player-controlled sequence and safety presentation

- Keep the blade inaccessible and visually guarded.
- Use a side or three-quarter view that makes the block-to-section relationship clear.
- The output section must be visible against a contrasting background.
- Do not use graphic tissue cutting imagery.
- Reduced motion uses an immediate labelled state change or two static panels.
- Never advance a scientific stage automatically; **NEXT** is the only way to continue.
- No audio is required; all state changes must be visible and described in text.

## State model

```text
question → microtome_selected → block_loaded
  → section_cut → section_revealed → complete
```

Persist the selected option, exact player-controlled stage, whether the block is loaded, whether the section has been cut, and mission completion. After interruption, restore the same stage without automatically advancing.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` and error red `#B51F3C` with text/icons.

The FFPE block uses pale cream paraffin with embedded pink tissue. The thin section should be a delicate translucent cream-pink ribbon with enough outline contrast to remain visible. Include rounded panels, a scientist guide strip, and **Mission 4 of 7** in the game bar.

## Accessibility

- Use real buttons for both equipment choices.
- Provide 44-by-44-pixel minimum targets and visible keyboard focus.
- Announce feedback and the section reveal through `aria-live`.
- Provide text labels for each animation state.
- Do not require timing or fine motor input.
- Reduced motion conveys the same sequence without movement.

## Completion criteria and checks

- Only the microtome is correct.
- The wrong choice preserves the mission and shows the exact retry message.
- The wax block visibly enters the microtome before the section appears.
- The completed state contains one recognisable very thin section or ribbon.
- **NEXT** advances each explanatory stage only when activated by the player and remains available on the final section reveal.


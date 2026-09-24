# Mission 2 — Prepare the Tissue

## Mission purpose

This standalone specification defines **Mission 2 of 7** in **The Histology Journey**. The scientific term is **Specimen Preparation / Grossing**. The player learns that a large skin specimen must be sampled and placed in a histology cassette before processing.

## Entry state

The accepted skin specimen from reception is present on a cutting board. The scene also contains a virtual scalpel and an open, empty histology cassette. Patient information may appear as a compact read-only case label, but it must not change during this mission.

## Player-facing copy

- Title: **Prepare the Tissue**
- Question: **“The skin sample is too big. What should we do next?”**
- Options:
  - **Cut a small piece and put it in a cassette**
  - **Put the whole sample straight into the staining machine**
  - **Put the whole sample under the microscope**
- Correct choice: **Cut a small piece and put it in a cassette**
- After cutting: **“Great! Now drag your tissue into the cassette.”**
- Success: **“Perfect! The tissue is safely inside its cassette.”**
- Scientific term: **Specimen Preparation / Grossing**
- Completion action: **NEXT**

## What the player sees

Use a clean histology grossing bench viewed from a clear, slightly elevated angle. Show:

- one cutting board or grossing surface;
- the accepted skin specimen, initially whole;
- a child-safe virtual representation of a scalpel;
- an open histology cassette with **HIST-931222** printed directly on its built-in writing panel;
- three large answer controls;
- the scientist guide strip;
- **Mission 2 of 7** in the game bar.

The activity is educational and diagrammatic. Avoid blood, injury imagery, or graphic realism. The skin sample should look like a small neutral-pink tissue specimen.

## Interaction flow

1. Present the question and all three answer options.
2. Selecting either whole-sample distractor shows: **“Not yet. The sample is too large. Choose the step that prepares a small piece for processing.”** Keep the choices available and do not reset the mission.
3. Selecting the correct option locks the answer and activates the cutting interaction.
4. The player selects the scalpel and makes one simple swipe along a clearly marked cut guide.
5. Keyboard/tap alternative: focus or select the scalpel, then activate a **Cut along the guide** control.
6. Replace the whole-tissue state with a main specimen and one separate small tissue piece. Do not require precision cutting.
7. Show: **“Great! Now drag your tissue into the cassette.”**
8. The player moves the small piece—not the remaining large specimen—into the open cassette using drag, tap/select-then-target, or keyboard controls.
9. Snap the tissue safely into the cassette, show the cassette closed or ready to close, and display: **“Perfect! The tissue is safely inside its cassette.”**
10. Enable **NEXT**.

## Interaction rules

- Do not make the player perform a realistic surgical action or a precise cut.
- The cut gesture succeeds when it crosses the broad guide corridor in the intended direction.
- A missed swipe gives a gentle visual cue and does not count as a wrong scientific answer.
- After a successful cut, disable further cutting.
- Only the small cut piece is transferable to the cassette.
- The cassette identifier **HIST-931222** is part of every cassette image state, follows the cassette surface and perspective, and is never added as a floating HTML or paper-label overlay.
- The cassette drop zone must be larger than its visible opening.
- If the piece is dropped elsewhere, return it to its last safe position without changing mission state.

## State model

Suggested states:

```text
question → correct_choice → cutting_ready → tissue_cut
  → transfer_ready → tissue_in_cassette → complete
```

Persist the selected answer, whether the cut is complete, tissue-piece position, whether the tissue is inside the cassette, and mission completion. On resume, restore the closest safe state without asking the player to repeat a completed physical interaction.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` and error red `#B51F3C` only with text/icons.

Use rounded panels, bold child-friendly sans-serif type, high contrast, and a welcoming laboratory style. Keep the scientific tissue pinks and cassette colour inside the scene. The active cut guide may use a gold dashed line plus an arrow and text, never colour alone.

## Accessibility

- Support mouse, touch, keyboard, and tap/select interactions.
- Use 44-by-44-pixel minimum interactive targets.
- Give the cutting board, scalpel, tissue piece, cassette, and drop zone useful accessible names.
- Provide a visible focus indicator and `aria-live` feedback.
- Do not require fine motor precision or a particular swipe speed.
- Prevent page scrolling during the cut or drag gesture.
- Reduced-motion mode uses immediate before/after tissue states.
- **NEXT** remains disabled until the tissue is inside the cassette.

## Completion criteria and checks

- The correct choice is the small-piece-and-cassette option.
- Both distractors provide retry feedback without resetting the mission.
- The simple cut works without precision and has a keyboard equivalent.
- The small tissue piece can be placed in the cassette by three input methods.
- The success message appears only after the tissue reaches the cassette.
- The output state is one cassette containing the accepted patient's tissue.


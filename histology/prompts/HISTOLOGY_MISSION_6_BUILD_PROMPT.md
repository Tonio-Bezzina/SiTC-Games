# Histology Mission 6 Build Prompt

Build, integrate, test, and commit **Mission 6 of The Histology Journey: Add Colour to the Tissue**. This prompt is complete for Mission 6. Do not implement Mission 7 except for a safe transition placeholder.

## Required outcome

Extend the verified Missions 1–5 game with **Mission 6 of 7**. Begin with the same patient's unstained microscope slide, let the player place it in the staining machine, explain the staining sequence, and end with stained slides ready for the H&E recognition task.

Implement the working transfer and sequence using supplied assets. Preserve continuity and saved state, test all input and motion modes, and commit only after every gate passes.

## Repository and prerequisite

Repository: `C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote: `https://github.com/Tonio-Bezzina/SiTC-Games.git`

Inspect status, fetch `origin`, and verify Missions 1–5 before editing. Stay on the sequential full-game branch when invoked by the master prompt. If run independently, create `codex/histology-mission-6` from the latest verified Mission 5 branch. Preserve unrelated work and never force-push.

## Authoritative sources

Read completely:

- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_06_ADD_COLOUR.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
- Existing Missions 1–5 implementation, documentation, saved-state migrations, and tests.

Copy the specification unchanged to `histology/docs/MISSION_06_ADD_COLOUR.md`. It controls exact wording, sequence, science, state, accessibility, and acceptance criteria.

## Required Mission 6 assets

Copy and use under `histology/assets/mission-6/`:

- `slide-carrier-empty.png`
- `slide-carrier-loaded.png`
- `stain-colour-streams.png`
- `stained-slides-output-tray.png`
- `staining-lab-background.png`
- `staining-machine-active.png`
- `staining-machine-empty.png`
- `staining-machine-slide-loaded.png`
- `staining-process-diagram.svg`

Reuse the Mission 5 unstained slide and existing shared shell/guide/progress/success/orientation assets. Use the supplied machine states in order. Do not add alternative machines, chemical choices, programs, timings, or unsupported laboratory detail.

## Mission behavior

1. Enter with the same patient's Mission 5 unstained slide.
2. Show **Mission 6 of 7**, **Add Colour to the Tissue**, and **Histological Staining**.
3. Display both exact instruction lines and one clearly labelled **Staining Machine** with an obvious, generous loading area.
4. Support drag, tap/select-then-target, and keyboard placement of the slide. A missed drop returns it to its safe position and is not a scientific error.
5. Start automatically only after valid placement; lock the slide into the supplied loaded state.
6. Show the active machine, carrier, colour-stream, or process-diagram states in a brief sequence that communicates staining without flashing.
7. Display visible **WHOOSH…** during the process, then visible **DING!** when it ends. No information may depend on sound.
8. Reveal the stained-slide output tray and the exact scientist explanation, followed by **“Your stained slides are ready!”**
9. Enable **NEXT: Can you find the H&E slide?** only after staining is complete.

## State, motion, and integration

- Safely extend the versioned save with slide position, machine loaded/started state, staining step, ready state, completion, and safe screen.
- On interruption, restore either the unstained slide safely on the bench or the completed stained-slide state; never duplicate or lose it.
- Do not replay the sequence on every resume after completion.
- Reduced motion must preserve the same teaching content through static labelled states: unstained → machine → stained slides ready.
- Preserve patient/case/tissue continuity and earlier mission review paths.
- Until Mission 7 exists, the NEXT action opens an honest Mission 6-complete panel naming **Find the H&E Slide** as coming next. Replace only that transition when Mission 7 is built.
- Do not award full Histology completion.

## Accessibility and layout

- Give slide, machine, loading zone, carrier, and fallback controls accessible names.
- Use 44×44 minimum targets, semantic buttons, visible focus, `aria-live` status, and visible process words.
- Prevent page scrolling during drag and never rely on sound, color, or motion alone.
- Verify mouse, touch/tap, keyboard, reduced motion, desktop, tablet landscape, short-phone landscape, and narrow portrait/orientation handling.

## Mandatory verification gate

Do not move to Mission 7 until:

- Missions 1–5 regression tests and browser smoke paths pass.
- The staining machine is the only destination and starts only after valid placement.
- Drag, tap/select, and keyboard placement all work and persist identically.
- Missed drops preserve the safe starting state.
- **WHOOSH…** precedes **DING!** and both are visible/announced.
- Both final scientist messages appear after completion.
- Reduced-motion and interrupted/resumed paths preserve the full sequence.
- NEXT remains disabled until stained slides are ready.
- No console errors, asset 404s, keyboard traps, hidden focus, or layout blockers occur.

Add focused state-machine and persistence tests, run all existing tests, syntax checks, and `git diff --check`, and review the full diff.

## Commit and reporting

Commit after the gate passes:

`Build Histology Mission 6 staining sequence`

If independent, push `codex/histology-mission-6`. Under the master prompt, remain on its branch and record this verified checkpoint before proceeding.

Report branch, commit hash, files, input-path testing, motion behavior, persistence, layouts, and any Mission 7 placeholder.

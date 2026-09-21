# Histology Mission 3 Build Prompt

Build, integrate, test, and commit **Mission 3 of The Histology Journey: Make a Wax Block**. This prompt is complete for Mission 3. Do not implement Mission 4 or later missions.

## Required outcome

Extend the verified Mission 1–2 game with a playable **Mission 3 of 7**. Begin with the same patient's loaded histology cassette, teach the correct processing and embedding equipment, and end with one clearly labelled FFPE wax block containing that tissue.

Implement the real interaction and explanatory sequence, not a mock-up. Use the supplied state artwork, preserve continuity, test reduced motion and interrupted/resumed states, and commit only after every gate below passes.

## Canonical repository and continuity

Repository: `C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote: `https://github.com/Tonio-Bezzina/SiTC-Games.git`

Before editing, inspect status, fetch `origin`, and confirm Missions 1 and 2 are fully implemented and verified. Under `HISTOLOGY_SEQUENTIAL_BUILD_PROMPT.md`, remain on its full-game branch. If run independently, create `codex/histology-mission-3` from the latest verified Mission 2 branch. Preserve unrelated work and never force-push.

## Authoritative sources

Read completely:

- Mission specification: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_03_MAKE_WAX_BLOCK.md`
- Base game: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`
- Asset guide: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
- Asset manifest: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
- Current Missions 1–2 implementation, documentation, state migrations, and tests.

Copy the mission specification unchanged to `histology/docs/MISSION_03_MAKE_WAX_BLOCK.md`. It is authoritative for wording, science, states, accessibility, and acceptance behavior.

## Required Mission 3 assets

Copy and use these reviewed assets under `histology/assets/mission-3/`:

- `embedding-centre-idle.png`
- `embedding-mould-empty.png`
- `embedding-mould-tissue.png`
- `embedding-mould-wax-filled.png`
- `ffpe-block-complete.png`
- `microtome-choice-idle.png`
- `processing-lab-background.png`
- `processing-path-diagram.svg`
- `staining-machine-choice-idle.png`
- `tissue-processor-active.png`
- `tissue-processor-idle.png`

Reuse existing shared shell, guide, progress, hint, success, and orientation assets. Use state artwork in the intended order and do not replace it with improvised drawings or unrelated images.

## Mission behavior

1. Enter with the Mission 2 loaded cassette and unchanged patient/case identity.
2. Show **Mission 3 of 7**, **Make a Wax Block**, and **Tissue Processing & Paraffin Embedding**.
3. Present the exact question and three labelled equipment choices.
4. Microtome and Staining Machine use the exact retry feedback and preserve all options.
5. **Processor & Embedding Centre** is the only correct answer and uses the exact correct feedback.
6. After selection, show the specified explanatory sequence one stage at a time: cassette enters the processor, preparation is indicated, tissue enters an embedding mould, wax fills the mould, wax sets, and one FFPE block is revealed. Never advance on a timer; require the player to press **NEXT** after reading each stage.
7. Use the supplied processing path and equipment-state assets so every scientific transformation has a clear labelled visual state.
8. Do not introduce chemical recipes, temperatures, durations, or unsupported procedural detail.
9. Reveal **WAX BLOCK**, **FFPE Block – Formalin-Fixed Paraffin-Embedded Tissue**, and **“Look! We've made a wax block!”**
10. Pause on the final FFPE block with **NEXT** available. The game must not leave this reveal until the player presses **NEXT**.

## State, motion, and integration

- Extend the versioned save schema without breaking earlier saves.
- Persist the choice, exact player-controlled step, reduced-motion path, block creation, completion, and current screen.
- An interrupted sequence must restore the same stage without automatically advancing; never duplicate or lose tissue.
- Reduced motion must show the full teaching sequence as static labelled states: cassette → process/embed → FFPE block.
- Require an explicit **NEXT** activation to advance each explanatory stage.
- Keep earlier missions reviewable and their tests passing.
- Until Mission 4 exists, route **NEXT** to an honest Mission 3-complete panel naming **Cut Very Thin Sections** as the future mission. Replace only that placeholder when Mission 4 is built.
- Do not award full Histology completion.

## Accessibility and layout

- Equipment options are real buttons with visible labels and accessible names.
- Use at least 44×44 targets, visible focus, `aria-live` status, and text alternatives for each visual step.
- Do not rely on movement, sound, or color alone.
- Avoid flashing and keep the sequence brief and skippable only through reduced-motion presentation, not by omitting content.
- Verify desktop, tablet landscape, short-phone landscape, and narrow portrait/orientation handling.

## Mandatory verification gate

Do not move to Mission 4 until:

- Missions 1–2 regression checks pass.
- Only Processor & Embedding Centre is correct.
- Both wrong machines show the exact retry text and do not advance.
- The visual sequence begins with one cassette and ends with one FFPE block.
- Every intermediate state has visible explanatory text and an accessible announcement.
- FFPE is expanded exactly as specified.
- **NEXT** advances processing to embedding, embedding to the FFPE reveal, and the reveal to Mission 3 completion only when the player activates it.
- Refresh restores the exact stage before selection, during the sequence, and after reveal.
- Reduced motion communicates the same scientific sequence.
- Keyboard navigation, focus, layouts, console, and all asset requests pass.

Add automated state-machine/persistence tests where practical. Run all existing tests, syntax checks, and `git diff --check`, then review the full diff.

## Commit and reporting

Commit after the gate passes with:

`Build Histology Mission 3 wax block sequence`

If independent, push `codex/histology-mission-3`. Under the master prompt, stay on its branch, record this checkpoint commit and verification, and only then continue.

Report branch, commit hash, files, tests, browser/layout coverage, reduced-motion verification, and any future Mission 4 placeholder.

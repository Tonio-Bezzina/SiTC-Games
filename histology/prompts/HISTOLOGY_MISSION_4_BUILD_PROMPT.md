# Histology Mission 4 Build Prompt

Build, integrate, test, and commit **Mission 4 of The Histology Journey: Cut Very Thin Sections**. This prompt is complete for Mission 4. Do not implement Mission 5 or later missions.

## Required outcome

Extend the verified Missions 1–3 game with **Mission 4 of 7**. Begin with the same patient's FFPE wax block, teach that a microtome is used for microtomy, and finish with one visible very thin tissue section or short ribbon ready for slide preparation.

Build the working mission, integrate the reviewed assets, preserve state and scientific continuity, verify it in the browser, and commit only when every mission gate passes.

## Repository and prerequisite

Repository: `C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote: `https://github.com/Tonio-Bezzina/SiTC-Games.git`

Inspect status, fetch `origin`, and verify Missions 1–3 before editing. Under `HISTOLOGY_SEQUENTIAL_BUILD_PROMPT.md`, remain on the active complete-game branch. If run independently, create `codex/histology-mission-4` from the latest verified Mission 3 branch. Preserve unrelated work and never force-push.

## Authoritative sources

Read completely:

- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_04_CUT_THIN_SECTIONS.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
- Existing Missions 1–3 implementation, documentation, saved-state migrations, and tests.

Copy the mission file unchanged to `histology/docs/MISSION_04_CUT_THIN_SECTIONS.md`. The mission file controls exact wording, scientific sequence, state, accessibility, and acceptance checks.

## Required Mission 4 assets

Copy and use under `histology/assets/mission-4/`:

- `microtome-block-loaded.png`
- `microtome-empty.png`
- `microtome-section-emerging.png`
- `microtomy-before-after.svg`
- `microtomy-lab-background.png`
- `staining-machine-m4-choice.png`
- `thin-section-ribbon.png`
- `thin-section-single.png`

Reuse the existing FFPE block output from Mission 3 and only the shared shell/guide/progress/success/orientation assets actually needed. Do not create a blade-handling simulation or substitute supplied equipment artwork.

## Mission behavior

1. Enter with the exact Mission 3 FFPE block and unchanged patient/case identity.
2. Show **Mission 4 of 7**, **Cut Very Thin Sections**, and **Microtomy**.
3. Ask the exact supplied question and show equally clear **Microtome** and **Staining Machine** choices.
4. Staining Machine must show the exact retry feedback and leave both choices available.
5. Microtome must lock as the correct answer and show the exact correct feedback.
6. Show the block entering the protected microtome holder before any section appears.
7. Use the supplied loaded/emerging states to explain the block-to-section relationship, then reveal one thin section or short ribbon against a contrasting surface.
8. Pause on the supplied or equivalent live-labelled before/after comparison: **FFPE wax block** and **Very thin tissue section**.
9. Keep the blade visually guarded and inaccessible. Do not add trimming, blade adjustment, hand positioning, numerical thickness, graphic cutting, timing, or fine-motor tasks.
10. Enable **NEXT** only after the section is clearly visible and announced.

## State, motion, and integration

- Migrate the versioned save safely and persist the selected option, block-loaded state, section-cut state, reveal, completion, and current screen.
- If interrupted, restore either the safely loaded block or finished section; never duplicate or lose the case tissue.
- Reduced motion uses immediate, labelled loaded and section-revealed states or static before/after panels.
- Earlier missions remain reviewable and all regression tests must pass.
- Until Mission 5 exists, **NEXT** opens an honest Mission 4-complete panel naming **Put the Section on a Glass Slide** as the future mission. Replace only that transition when Mission 5 is built.
- Do not mark the whole journey complete.

## Accessibility and layout

- Use semantic equipment buttons, 44×44 minimum targets, visible focus, live feedback, and text labels for each animation state.
- Do not require timing, precision, sound, or movement to understand or complete the mission.
- Alt text must describe the machine/block/section state without adding unsupported science.
- Verify desktop landscape, tablet landscape, short-phone landscape, narrow portrait handling, keyboard-only navigation, and reduced motion.

## Mandatory verification gate

Do not move to Mission 5 until:

- Missions 1–3 tests and browser smoke paths still pass.
- Only Microtome is correct and the wrong choice uses exact feedback.
- The wax block visibly enters the holder before the section appears.
- The cutting edge remains protected.
- The final ribbon/section is recognizable and labelled.
- The before/after comparison is available in normal and reduced-motion presentations.
- **NEXT** is disabled before reveal and enabled only after completion.
- Refresh restores safe question, loaded, or finished states.
- No console error, broken asset, inaccessible control, focus failure, or responsive overflow blocks completion.

Add focused state/persistence tests, run the full suite, syntax checks, and `git diff --check`, and review the full diff.

## Commit and reporting

Commit only after the gate passes:

`Build Histology Mission 4 microtomy sequence`

If independent, push `codex/histology-mission-4`. Under the master prompt, stay on its branch and record this verified checkpoint before continuing.

Report branch, commit hash, changed files, tests, browser/layout checks, reduced-motion behavior, and any Mission 5 placeholder.

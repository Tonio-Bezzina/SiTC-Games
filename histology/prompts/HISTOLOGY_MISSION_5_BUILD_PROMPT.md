# Histology Mission 5 Build Prompt

Build, integrate, test, and commit **Mission 5 of The Histology Journey: Put the Section on a Glass Slide**. This prompt is complete for Mission 5. Do not implement Mission 6 or later missions.

## Required outcome

Extend the verified Missions 1–4 game with **Mission 5 of 7**. Begin with the accepted patient's very thin tissue section, teach that it belongs on a glass microscope slide, and finish with one intact **UNSTAINED SLIDE** that continues to Mission 6.

Implement and verify the working mission with supplied artwork. Preserve the case tissue and identity, and do not commit until every gate in this prompt passes.

## Repository and prerequisite

Repository: `C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote: `https://github.com/Tonio-Bezzina/SiTC-Games.git`

Inspect status, fetch `origin`, and verify Missions 1–4 before editing. Stay on the master full-game branch when invoked sequentially. If run independently, create `codex/histology-mission-5` from the latest verified Mission 4 branch. Preserve unrelated work and never force-push.

## Authoritative sources

Read completely:

- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_05_PUT_SECTION_ON_SLIDE.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
- Existing Missions 1–4 implementation, documentation, state migrations, and tests.

Copy the mission specification unchanged to `histology/docs/MISSION_05_PUT_SECTION_ON_SLIDE.md`. Use it as the authority for wording, science, state, accessibility, and checks.

## Required Mission 5 assets

Copy and use under `histology/assets/mission-5/`:

- `cassette-m5-distractor.png`
- `laboratory-bin.png`
- `microscope-slide-blank.png`
- `microscope-slide-unstained.png`
- `section-to-slide-diagram.svg`
- `slide-prep-bench-background.png`

Reuse the actual thin-section output from Mission 4 and the existing shared shell/guide/progress/success/orientation assets. Use supplied objects with live HTML answer labels; do not add a water-bath activity or substitute artwork.

## Mission behavior

1. Enter with the same patient's thin section/ribbon from Mission 4.
2. Show **Mission 5 of 7**, **Put the Section on a Glass Slide**, and **Slide Preparation**.
3. Present the exact question with three equally clear, visibly labelled choices: glass slide, cassette, and bin.
4. Cassette and bin both show the exact retry feedback and leave the section and all choices intact.
5. Glass microscope slide is the only correct choice and shows the exact correct feedback.
6. Transfer the section to the slide viewing area through a short explained animation or a player-assisted interaction.
7. If interactive, support drag, tap/select-then-target, and keyboard transfer with a generous drop zone and automatic centering. A missed drop returns safely and is not a scientific error.
8. Reveal the supplied unstained slide, the heading **UNSTAINED SLIDE**, and both exact scientist lines explaining that the tissue is hard to see and needs colour.
9. Keep the pale section perceptible with a subtle outline and live label; do not rely on transparency alone.
10. Enable **NEXT** only after the intact section is on the slide and the reveal has completed.

## State and integration

- Safely migrate the versioned save and persist the selected answer, section/transfer position, slide state, reveal, completion, and safe screen.
- Interrupted transfers restore either the section at its safe starting position or the completed unstained slide.
- Preserve patient/case continuity and one tissue lineage from reception to slide.
- Earlier missions remain reviewable and tested.
- Until Mission 6 exists, **NEXT** opens an honest Mission 5-complete panel naming **Add Colour to the Tissue** as the future mission. Replace only that transition when Mission 6 is built.
- Do not award full Histology completion.

## Accessibility and responsive behavior

- Use live text and semantic choices with visible labels and accessible names.
- Use at least 44×44 targets, visible focus, `aria-live` feedback, and a clear accessible name for the tissue and slide drop area.
- Support mouse, touch, keyboard, and tap/select transfer where interactive.
- Prevent scrolling during dragging and provide reduced-motion direct before/after states.
- Verify desktop, tablet landscape, short-phone landscape, narrow portrait/orientation handling, and keyboard-only completion.

## Mandatory verification gate

Do not move to Mission 6 until:

- Missions 1–4 regression tests and smoke paths pass.
- Only the glass slide is correct.
- Both distractors use exact feedback and never discard or move the tissue.
- The section finishes centered within the slide viewing area.
- All enabled transfer methods reach the same persisted output.
- **UNSTAINED SLIDE** and both scientist lines appear in the required order.
- **NEXT** remains disabled until the reveal.
- Refresh safely restores question, transfer, and complete states.
- Normal/reduced-motion paths, keyboard focus, required layouts, console, and asset requests all pass.

Add focused state and persistence tests, run the full test suite, syntax checks, and `git diff --check`, and review the complete diff.

## Commit and reporting

Commit only after the gate passes:

`Build Histology Mission 5 slide preparation`

If independent, push `codex/histology-mission-5`. Under the master prompt, stay on its branch, record this verified checkpoint, and only then continue.

Report branch, commit hash, files, verification, layouts, input paths, persistence, and any Mission 6 placeholder.

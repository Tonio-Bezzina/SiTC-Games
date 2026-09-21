# Histology Mission 7 Build Prompt

Build, integrate, test, and commit **Mission 7 of The Histology Journey: Find the H&E Slide**, including the completed-journey screen and final SiTC Games hub completion integration. This prompt is complete for Mission 7.

## Required outcome

Extend the verified Missions 1–6 game with **Mission 7 of 7**. Present three equally prominent stained slides, let the player identify H&E by blue-purple nuclei and pink tissue, then show the complete Histology journey and safely award the Histology hub case only after the whole seven-mission journey is finished.

Build the working mission and completion experience using the supplied Mission 7 and completion assets. Verify the full game from a new case through final hub return. Commit only after every gate passes.

## Repository and prerequisite

Repository: `C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote: `https://github.com/Tonio-Bezzina/SiTC-Games.git`

Inspect status, fetch `origin`, and verify Missions 1–6 before editing. Stay on the master full-game branch when invoked sequentially. If run independently, create `codex/histology-mission-7` from the latest verified Mission 6 branch. Preserve unrelated work and never force-push.

## Authoritative sources

Read completely:

- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_07_FIND_HE_SLIDE.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
- `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
- Existing Missions 1–6 implementation, documentation, persistence, tests, and hub progress conventions.

Copy the specification unchanged to `histology/docs/MISSION_07_FIND_HE_SLIDE.md`. It controls exact wording, slide behavior, hint, feedback, final journey, accessibility, and completion checks.

## Required Mission 7 assets

Copy and use under `histology/assets/mission-7/`:

- `he-hint-nuclei-callout.svg`
- `he-hint-pink-tissue-callout.svg`
- `he-slide-finished.png`
- `slide-a-green-yellow.png`
- `slide-b-he-purple-pink.png`
- `slide-c-blue-violet.png`

Copy and use the final completion assets under `histology/assets/completion/`:

- `completion-badge.svg`
- `completion-lab-background.png`
- `compound-microscope.png`
- `he-slide-beside-microscope.png`
- `journey-cassette-icon.svg`
- `journey-he-icon.svg`
- `journey-microtome-icon.svg`
- `journey-processor-icon.svg`
- `journey-slide-icon.svg`
- `journey-specimen-icon.svg`
- `journey-stain-icon.svg`
- `journey-wax-block-icon.svg`

Reuse `shared/journey-down-arrow.svg`, the scientist success state, and only the other existing shared assets needed. Do not alter the scientific stain colors or give the correct slide unique visual prominence before selection.

## Mission behavior

1. Enter with the stained-slide output from Mission 6 and unchanged patient/case identity.
2. Show **Mission 7 of 7**, **Find the H&E Slide**, and **Haematoxylin & Eosin (H&E) Staining**.
3. Show all three supplied slide images with equal card size, prominence, framing, detail, and visible labels:
   - Slide A – Green + Yellow
   - Slide B – Purple + Pink
   - Slide C – Blue + Violet
4. Keep each label attached to its image through responsive reflow. Use semantic choice controls with descriptive alt text that does not reveal correctness.
5. Keep an always-visible clue guide that tells the player to look for both blue-purple nuclei and lots of pink surrounding tissue. Provide an optional, repeatable, non-submitting **Show hint on slides** control at every level. When opened, announce the exact hint, visibly highlight Slide B, point to representative nuclei and pink tissue with the supplied callouts, and label it **“Matches both H&E colour clues”** without writing “correct.”
6. Slide A and Slide C each use their own exact retry feedback, preserve all choices, and automatically open the stronger visual hint.
7. Only Slide B is correct. Show **“YES! You found the H&E slide!”**, mark it with text/icon and success color, and lock the answer.
8. Enable **FINISH** only after Slide B is selected.

## Final journey and hub completion

FINISH must open the full mission-complete screen specified in the mission file. Reproduce the exact headings, scientist message, final message, closing heading, and every journey step in the supplied order. Use the supplied completion background, microscope, H&E slide, badge, journey icons, and arrows with live HTML text.

- **PLAY AGAIN** must confirm if necessary, create a new Histology case, reset the seven-mission journey state, and return to Mission 1 difficulty selection.
- Final **FINISH** must record `histology/main` using the hub's existing `completedCases` storage shape, then return to the SiTC Games hub.
- Award hub completion exactly once and only after all seven mission-completion flags are true.
- A Mission 7 answer alone must not award the case if earlier mission state is missing or corrupt.
- Preserve the completed state across refresh so FINISH remains available and safe.
- Verify the hub shows Histology completed and updates aggregate progress without changing other laboratory records.

## State and accessibility

- Safely migrate the versioned state and persist hint state, selected slide, feedback, Mission 7 completion, final-screen state, and hub-award status.
- Labels and feedback must make the task usable without color perception alone.
- Use 44×44 minimum targets, visible focus, `aria-live` announcements, semantic controls, and reduced-motion static callouts.
- No score, timer, penalty, attempt count, audio requirement, or flashing is allowed.
- Verify desktop, tablet landscape, short-phone landscape, narrow portrait/orientation handling, and keyboard-only completion.

## Mandatory verification gate

Do not declare the game complete until:

- All Missions 1–6 regression tests and browser smoke paths pass.
- Slide B is the only correct answer and contains the required blue-purple nuclei/pink tissue appearance.
- A and C each show their exact distinct retry feedback.
- The always-visible clue is clear, and the stronger visual hint never submits, never penalizes, works repeatedly with accessible callouts, and opens automatically after a wrong answer.
- FINISH is disabled until the correct slide is selected.
- The full completion screen exactly reproduces the supplied journey and messages.
- Refresh works before selection, after wrong answers, after correct selection, and on the final screen.
- PLAY AGAIN creates a new case and returns to Mission 1.
- Final FINISH writes only `histology/main`, preserves other hub progress, returns to the hub, and awards completion only once.
- Full new-case gameplay from Mission 1 through Mission 7 succeeds with mouse/touch and keyboard-compatible paths.
- Reduced motion, all required viewports, focus, console, and asset requests pass.

Add automated tests for slide selection, completion gating, save migration, replay, and hub award idempotency. Run the complete suite, syntax checks, and `git diff --check`, and review the complete diff.

## Commit and reporting

Commit after the full gate passes:

`Build Histology Mission 7 and complete the journey`

If independent, push `codex/histology-mission-7`. Under the master prompt, remain on its branch; this is the final mission checkpoint before full-game integration verification and push.

Report branch, commit hash, files, full-journey checks, hub completion behavior, input/accessibility/layout coverage, and remote result.

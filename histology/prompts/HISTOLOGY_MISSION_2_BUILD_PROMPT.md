# Histology Mission 2 Build Prompt

Build, integrate, test, and commit **Mission 2 of The Histology Journey: Prepare the Tissue**. This prompt is complete for Mission 2. Do not implement Mission 3 or later missions.

## Required outcome

Extend the existing Histology game with a polished, playable **Mission 2 of 7** that begins with the accepted skin specimen from Mission 1 and ends with the same patient's small tissue piece secured in a labelled histology cassette.

Do not stop at a plan or mock-up. Implement the working interaction, use the supplied artwork, verify every input path and saved state in a browser, and commit the completed mission. Mission 2 is not complete until every gate in this prompt passes.

## Canonical repository and continuity

Implementation repository:

`C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote:

`https://github.com/Tonio-Bezzina/SiTC-Games.git`

Before editing:

1. Inspect Git status and preserve unrelated work.
2. Fetch `origin`.
3. Confirm Mission 1 is fully implemented and its state passes the Mission 1 tests.
4. When invoked by `HISTOLOGY_SEQUENTIAL_BUILD_PROMPT.md`, remain on its active full-game branch.
5. When run independently, create `codex/histology-mission-2` from the latest verified Mission 1 branch, preferably `origin/codex/histology-mission-1`.
6. Never force-push, reset unrelated work, or regenerate the Mission 1 patient.

## Authoritative sources

Read these files completely before editing:

1. Mission specification:
   `C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_02_PREPARE_TISSUE.md`
2. Game-wide continuity, palette, shell, accessibility, and persistence:
   `C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`
3. Asset composition guidance:
   `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
4. Asset metadata:
   `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
5. Existing Mission 1 implementation and tests in the canonical repository.

Copy the mission specification unchanged to:

`histology/docs/MISSION_02_PREPARE_TISSUE.md`

The Mission 2 specification controls all wording, scientific behavior, interaction states, feedback, accessibility, persistence, and acceptance checks. If sources conflict, use this prompt, then the Mission 2 specification, then the base-game specification, then repository conventions.

## Required Mission 2 assets

Copy these reviewed files from the source asset library into the matching repository-relative paths under `histology/assets/mission-2/`:

- `cut-guide.svg`
- `cutting-board-clean.png`
- `grossing-bench-background.png`
- `histology-cassette-closed-loaded.png`
- `histology-cassette-open-empty.png`
- `histology-cassette-open-loaded.png`
- `skin-tissue-cut-main.png`
- `skin-tissue-small-piece.png`
- `skin-tissue-whole.png`
- `virtual-scalpel.png`

Every cassette state must have **HIST-931222** printed directly on the cassette's built-in writing panel as part of the raster artwork. Match the panel perspective and lighting. Do not implement this identifier as HTML text, a floating label, a paper label, or any other overlay.

Reuse only the shared Histology assets needed by the existing shell, scientist guide strip, hint/focus feedback, progress display, success state, and orientation handling. Do not duplicate assets already present. Do not substitute emoji, CSS drawings, or newly generated artwork for supplied assets.

## Mission behavior

Implement the exact Mission 2 sequence from the specification:

1. Enter from the accepted Mission 1 skin specimen and keep the saved patient, ID no., date of birth, accession, and case identity unchanged.
2. Show **Mission 2 of 7**, **Prepare the Tissue**, and **Specimen Preparation / Grossing**.
3. Present all three specified answers to **“The skin sample is too big. What should we do next?”**
4. Both whole-sample distractors must show the exact retry message without resetting the mission.
5. The correct choice activates a child-safe cutting interaction with the visible cut guide.
6. Support a broad swipe, plus a tap/keyboard **Cut along the guide** equivalent. Do not require precision, speed, realistic blade handling, or repeated cutting.
7. Replace the whole tissue with the supplied main-piece and small-piece states after a successful cut.
8. Require only the small piece to move into the open cassette.
9. Support drag, tap/select-then-target, and keyboard transfer. Use a generous drop zone; a missed drop returns to the last safe position and is not a wrong scientific answer.
10. Show the open-loaded and closed-loaded cassette states at the correct stages.
11. Display the exact success message and enable **NEXT** only after the small piece is safely in the cassette.

## State and integration requirements

- Extend the versioned Histology save state without breaking valid Mission 1 saves.
- Persist the selected answer, cut readiness, completed cut, tissue position, cassette state, Mission 2 completion, and current safe screen.
- Refresh and Continue must restore the closest completed safe state without repeating a finished gesture.
- Preserve the same accepted specimen and patient across Missions 1 and 2.
- Keep Mission 1 reviewable and do not weaken its tests.
- Until Mission 3 exists, **NEXT** must open an honest Mission 2-complete panel that says the next mission is **Make a Wax Block** and is coming in a future release.
- When Mission 3 is present, replace only that placeholder transition with the real Mission 3 entry.
- Do not mark Histology complete in the hub.

## Accessibility and responsive requirements

- Use live HTML for all copy and controls.
- Use semantic buttons, 44×44 CSS-pixel minimum targets, visible focus, and `aria-live` feedback.
- Give the tissue, scalpel, cutting surface, cut guide, cassette, and drop zone useful accessible names.
- Prevent page scrolling during cutting and dragging.
- Do not rely on color alone; pair the gold cut guide with an arrow and text.
- Reduced motion must replace gestures/animation with immediate, labelled before-and-after states while preserving the required decisions.
- Preserve state when portrait play is blocked and restored.
- Check desktop landscape, tablet landscape, short-phone landscape, and narrow portrait behavior.

## Mandatory verification gate

Do not declare Mission 2 complete or move to Mission 3 until all checks pass:

- Existing Mission 1 automated and browser checks still pass.
- Both distractors show the exact retry feedback and preserve state.
- The correct answer alone unlocks cutting.
- Broad mouse/touch swipe succeeds without precision.
- Tap and keyboard cutting equivalents succeed.
- Missed swipes and drops do not count as scientific errors or reset progress.
- Only the small tissue piece can enter the cassette.
- Drag, tap/select, and keyboard transfer paths all reach the same saved result.
- Refresh works at question, cut, transfer, and complete states.
- **NEXT** is disabled until the tissue is in the cassette.
- No console error or asset 404 occurs.
- Keyboard-only navigation, focus visibility, reduced motion, and all required layouts work.

Add focused automated tests for pure state transitions and persistence migration where practical. Run syntax checks and `git diff --check`, then review the complete diff.

## Commit and reporting

Commit only after the verification gate passes, using:

`Build Histology Mission 2 tissue preparation`

When run independently, push `codex/histology-mission-2` with upstream tracking. When run under the sequential master prompt, do not switch branches; create the Mission 2 checkpoint commit and allow the master prompt to continue only after recording the commit hash and successful verification.

Report the branch, commit hash, files changed, tests performed, browser/layout checks, and any deliberately deferred transition to Mission 3.

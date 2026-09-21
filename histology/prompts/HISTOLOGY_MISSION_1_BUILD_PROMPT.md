# Histology Mission 1 Build Prompt

Build, integrate, test, commit, and push **Mission 1 of The Histology Journey** into the SiTC Games hub.

## Outcome

Create a complete, polished, playable first release containing:

1. an opening difficulty-selection scene;
2. Mission 1: **Check the Patient Details**;
3. a safe end-of-mission panel that records Mission 1 as complete and explains that Mission 2 will follow;
4. integration into the existing SiTC Games hub;
5. a verified Mission 1 checkpoint commit and, when run independently, a pushed remote branch.

Do not stop after making a plan or mockup. Implement the working game, integrate the supplied assets, verify it in the browser, and commit the changes. Push the Mission 1 branch when this prompt is run independently; when invoked by the sequential master prompt, remain on its active full-game branch and let that prompt perform the final push.

## Canonical repository and Git workflow

Use this local clone as the implementation repository:

`C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Its remote is:

`https://github.com/Tonio-Bezzina/SiTC-Games.git`

Before editing:

1. Inspect the repository status and preserve unrelated work.
2. Fetch `origin` and update from `origin/main` with a safe fast-forward workflow.
3. When run independently, create and work on branch **`codex/histology-mission-1`** from the latest `origin/main`.
4. When invoked by `HISTOLOGY_SEQUENTIAL_BUILD_PROMPT.md`, remain on its active **`codex/histology-complete-game`** branch and treat the Mission 1 commit as the first checkpoint.
5. Do not force-push, rewrite history, reset unrelated work, or commit files outside this task.

When finished:

1. Review the complete diff.
2. Commit the implementation with the message: **`Build Histology Mission 1 and add it to the SiTC hub`**.
3. When run independently, push the branch with upstream tracking:

   `git push -u origin codex/histology-mission-1`

4. Under the sequential master prompt, do not switch or push yet; record the Mission 1 commit hash and verification, then allow the master prompt to proceed to Mission 2.
5. Report the branch name, commit hash, remote URL when pushed, files changed, and verification performed.

If authentication or remote access prevents the push, keep the local commit intact and report the exact blocker and command that remains to be run. Do not claim the push succeeded unless the remote confirms it.

## Authoritative source hierarchy

Read each source completely before implementation.

### 1. Mission behaviour and wording

`C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions\MISSION_01_CHECK_PATIENT_DETAILS.md`

This is the primary source for Mission 1 content, copy, state, interactions, feedback, accessibility, persistence, and acceptance requirements.

Copy this file unchanged into the implementation repository at:

`histology/docs/MISSION_01_CHECK_PATIENT_DETAILS.md`

### 2. Required patient-selection rules

Mission 1 explicitly depends on:

- `C:\Users\User\.codex\.chatgpt-projects\g-p-6a9b1ed709048191bd77a1663d5f308c\patient-selection-scene.md`
- `C:\Users\User\.codex\.chatgpt-projects\g-p-6a9b1ed709048191bd77a1663d5f308c\patient-identity-generation.md`

Use these for patient identity generation, level-specific incorrect candidates, comparison behaviour, field-level mismatch feedback, transfer to the rack, and persistence. Treat the project-mirror copies as read-only.

### 3. Game shell and difficulty wording

`C:\Users\User\Documents\ChatGPT\SiTC games\histology\HISTOLOGY_GAME.md`

Use only its game-wide requirements needed for the shell, palette, difficulty selection, responsive layout, accessibility, reduced motion, and Mission 1 continuity. Do not implement Missions 2–7 in this task.

### 4. Runtime artwork

- Asset guidance: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\README.md`
- Asset metadata: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\asset-manifest.json`
- Shared assets: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\shared\`
- Mission 1 assets: `C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets\mission-1\`

Copy only the assets required by the opening scene, Mission 1, accessible feedback, responsive orientation handling, and the end-of-mission panel into the implementation repository. Do not reference the workspace using absolute paths from the game.

### 5. Repository integration conventions

Inspect the existing hub and games only for technical placement, relative linking, static GitHub Pages behaviour, shared progress shape, responsive conventions, and accessible control patterns. Do not replace Mission 1 wording or behaviour with content inferred from another laboratory game.

If sources conflict, use this priority order: this prompt, the Mission 1 specification, the two patient-selection source files within their domains, the base-game specification, then existing repository conventions.

## Required implementation structure

Create a static, dependency-free game under:

```text
histology/
  index.html
  styles.css
  logic.js
  game.js
  docs/
    MISSION_01_CHECK_PATIENT_DETAILS.md
  assets/
    shared/
    mission-1/
```

Additional small test files are allowed under `histology/tests/`. Do not add a framework or build step unless the repository already requires it. The game must run directly on GitHub Pages and through a basic local HTTP server.

Use relative URLs so the deployed route works at:

`/SiTC-Games/histology/`

Do not link runtime code to `C:\` paths.

## Opening scene — choose difficulty

The first visible game scene must be a dedicated, accessible difficulty-selection screen—not an automatically opened modal over Mission 1.

Show:

- laboratory name: **Histology**;
- game title: **The Histology Journey**;
- short introduction explaining that the player will follow a skin sample through the laboratory;
- the scientist guide artwork;
- three large difficulty cards:
  - **Junior** — More guidance
  - **Explorer** — Some guidance
  - **Challenge** — Fewer clues
- reassurance that the player can retry and use guidance;
- a visible link back to **All laboratories**.

Do not show age ranges. Do not add scoring, stars, timers, rankings, accuracy, attempts, lives, audio controls, or competitive wording.

The selected difficulty must control Mission 1's incorrect candidate:

- **Junior:** different name, valid different date of birth, and valid ID no. derived from that birthday;
- **Explorer:** same name and birthday, but a clearly different valid ID no. with the same birth-year suffix;
- **Challenge:** same name and birthday, but one subtle valid ID difference outside the birth-year digits.

When a player chooses a level, create or restore the case according to the persistence rules, then enter Mission 1. The level must remain visible in the game bar and be changeable through an accessible control. A level change may rebuild only the unfinished incorrect candidate and difficulty-specific guidance; it must not silently change the reference patient's identity.

## Mission 1 requirements

Implement the complete interaction specified in `MISSION_01_CHECK_PATIENT_DETAILS.md`.

At minimum, the scene must contain:

- **Mission 1 of 7** and **Check the Patient Details**;
- scientific term **Specimen Reception & Identification**;
- the exact question: **“Do the patient details on the sample match the form?”**;
- one reference request display;
- two complete sample stations shown side by side;
- one sealed labelled skin-specimen container and one paper request in each station;
- the scientist guide strip;
- the receiving/scanning rack;
- a disabled **NEXT** action until all completion conditions are satisfied.

Every reference display and paper request must show:

- patient name;
- **ID no.**;
- date of birth in `DD/MM/YYYY` format.

Each specimen-container label must show only the patient name value and ID value. Do not show field labels or date of birth on the container label.

The reference may also show **Specimen: Skin** and **Requested investigation: Histology**.

Use live HTML for every identifier, field label, message, and control. Do not bake dynamic data or player-facing copy into images.

## Identity generation

Implement identity generation as pure, testable functions in `logic.js`.

- Date format: `DD/MM/YYYY`.
- Player-facing identifier label: **ID no.** everywhere.
- ID format: 4–7 digits followed by uppercase `H` or `L`.
- Validate format with `^\d{4,7}[HL]$`.
- The last two digits of the numeric part must equal the last two digits of that person's birth year.
- Generate the birthday first, then derive the ID.
- Keep the ID as a string.
- Make every ID unique within a case.
- Do not parse a `DD/MM/YYYY` display string with the JavaScript `Date` constructor.
- Save one `missionStartedAt` date for the case.
- Keep the reference patient fixed across refresh, Continue, retry, and level changes.

Export or otherwise expose the pure functions so they can be verified without manipulating the UI.

## Sample inspection and submission

- Randomise whether the correct set is left or right once when the case is created.
- Never reshuffle the candidates during that case.
- Both candidates must use the exact same container, lid, paper, tray, and presentation artwork.
- A candidate's container name and ID must agree with its paper request; date of birth remains on the paper request only.
- Only **Select this sample** submits an answer.
- Opening, closing, comparing, tapping, or missing a drag is not an incorrect scientific attempt.
- Only one candidate may be expanded at a time.
- Set `aria-expanded` correctly.
- When a candidate opens, move focus to **Select this sample**.
- Provide **Compare other sample** and return focus predictably when closing.

On an incorrect selection:

- keep the selected station expanded;
- calculate mismatch fields from stored data;
- highlight every conflicting field on each surface where it appears using colour plus text/icon; date-of-birth mismatches belong on the reference and paper request only;
- show the exact field-specific feedback from the Mission 1 specification;
- keep identities and candidate order unchanged;
- allow immediate comparison and retry.

On a correct selection:

- show **“Matched! This sample belongs to [patient name].”**;
- lock the accepted set;
- label the other set **“Rejected set — remains at reception.”**;
- require transfer of the accepted container to the receiving/scanning rack;
- support drag, tap/select-then-target, and keyboard transfer;
- preserve the original label when scanning;
- never allow the rejected specimen into the rack.

Enable **NEXT** only after the full Mission 1 completion criteria are satisfied.

## Mission 1 ending

Because this release contains only Mission 1, **NEXT** must open a polished chapter-complete panel rather than a broken Mission 2 screen.

Show:

- **Mission 1 complete**;
- confirmation that the correct skin specimen was identified and received;
- **Next: Prepare the Tissue**;
- a short, honest message that the next mission will be added in a future release;
- buttons for **Review Mission**, **Choose Another Level**, **Start a New Case**, and **Return to Game Hub**.

Store Mission 1 completion in Histology's own saved state so a later Mission 2 implementation can continue the same patient and specimen.

Do **not** write `histology/main` into the hub's `completedCases` record yet. Mission 1 is only the first chapter of a seven-mission journey and must not award full Histology completion or a Histology Master state.

## Asset integration

Use the supplied artwork rather than substitutes, emoji, CSS drawings, or newly generated images when an appropriate supplied asset exists.

Mission 1 should use, as applicable:

- `reception-background.png`
- `request-monitor-frame.png`
- `paper-request-blank.png`
- `skin-specimen-container-closed.png`
- `skin-specimen-sample.png`
- `specimen-container-label-blank.svg`
- `sample-station-tray.png`
- `receiving-scanning-rack-empty.png`
- `receiving-scanning-rack-accepted.png`
- `barcode-scan-light.svg`
- `rejected-set-marker.svg`
- `field-mismatch-marker.svg`

Use the relevant supplied shared assets for the scientist, game identity, success/retry/hint states, level screen, focus guidance, and rotation handling.

Compose separate layers in HTML/CSS where the asset README requires it. Keep live HTML fields aligned over blank form and label regions. Provide meaningful `alt` text for informative images and empty `alt` text for purely decorative layers.

Do not copy all 88 assets into the game. Copy only what this release uses.

## Visual design

Use the SiTC palette:

- Navy `#073C63`
- Blue `#087FC1`
- Cyan `#21C9DC`
- Gold `#FFC83D`
- Ink `#153344`
- Muted ink `#4B6675`
- Soft cyan `#DFF9FC`
- White `#FFFFFF`
- Success green `#08784F`
- Error red `#B51F3C`

Use rounded panels, bold child-friendly sans-serif text, large controls, high contrast, and the same navy/blue/cyan/white/gold balance as the other SiTC games. Scientific pinks belong inside the specimen artwork, not across the whole interface.

## Responsive and accessible behaviour

- Support mouse, touchscreen, tap/select, and keyboard-only completion.
- Use minimum 44 × 44 CSS-pixel interactive targets.
- Provide visible keyboard focus.
- Use semantic buttons and dialogs/panels.
- Announce feedback through `aria-live` or alert semantics.
- Do not rely on colour alone.
- Prevent accidental page scrolling while dragging.
- Keep all identifiers legible at desktop, tablet-landscape, and short-phone-landscape sizes.
- Do not let overlays cover identifiers needed for comparison.
- Honour `prefers-reduced-motion` with static outlines/arrows and immediate state changes.
- If portrait play must be blocked on small devices, freeze the case and restore the exact state after rotation.
- Do not use flashing effects.
- Do not require sound and do not show a mute control.

## Persistence

Use a versioned Histology-specific local-storage key. Persist at least:

- schema version;
- `missionStartedAt`;
- selected level;
- reference patient identity and request data;
- both candidates and their fixed order;
- expanded candidate;
- mismatch fields;
- accepted candidate;
- rack-transfer state;
- one-time clue state;
- Mission 1 completion;
- current safe screen/step.

On corrupt or incompatible saved data, recover safely to difficulty selection without throwing an uncaught error. **Start a New Case** may intentionally clear Histology's case state after confirmation; ordinary retry and refresh must not regenerate it.

## Hub integration

The existing `hub.js` already contains a Histology entry with `href: "histology/"` and `available: false`.

Update that existing entry rather than creating a duplicate:

- keep `id: "histology"`;
- set `available: true`;
- keep the relative `href: "histology/"`;
- update the visible case/game name to **The Histology Journey** or **Check the Patient Details** where appropriate;
- make the description accurately state that Mission 1 is available;
- preserve the existing hub data structure and progress system.

The game must provide a working relative link back to `../`.

Do not mark the entire Histology case complete after Mission 1 and do not alter other laboratory cards or progress.

## Verification

Perform and document all of the following before committing:

### Logic checks

- Generate many Junior, Explorer, and Challenge cases.
- Every ID matches `^\d{4,7}[HL]$`.
- Every ID's final two numeric digits match that person's birth-year suffix.
- Name and ID match across reference, container label, and paper request; date of birth matches between reference and paper request.
- Incorrect container and paper agree with each other.
- Each level differs only in its intended mismatch fields.
- Correct and incorrect IDs are unique.

### Browser checks

- The first visible scene is difficulty selection.
- Each difficulty starts a valid case.
- The correct sample appears on both left and right across new cases.
- Inspecting and comparing does not submit an answer.
- An incorrect selection stays open and highlights exact fields on every surface where they appear.
- Retry preserves identities and candidate order.
- Correct selection enables only the accepted container for transfer.
- Drag, tap/select, and keyboard transfer all complete the mission.
- The rejected set cannot enter the rack.
- **NEXT** remains disabled until the container reaches the rack.
- The chapter-complete panel does not claim the whole Histology journey is complete.
- Refresh/Continue restores the same safe state.
- Level change preserves the reference patient.
- Reduced motion works.
- The hub link opens Histology and the back link returns to the hub.
- No asset request returns 404.
- No console error occurs.

### Layout checks

Test at least:

- desktop landscape;
- tablet landscape;
- short-phone landscape;
- narrow portrait/rotation handling;
- keyboard-only navigation with visible focus.

## Scope boundaries

- Build only the difficulty scene, Mission 1, and its honest chapter-complete panel.
- Do not implement Mission 2 or later missions.
- Do not generate new artwork when supplied assets cover the need.
- Do not modify the source specification files in the workspace.
- Do not add a score, timer, ranking, attempts, lives, audio, narration, or unsupported scientific content.
- Do not silently weaken identifier rules, retry behaviour, accessibility, or persistence to simplify implementation.

If a non-blocking question remains, record it in `histology/docs/Histology_Mission_1_Queries.md` and continue with the requirements that are clear. Ask the user only if a decision would materially change the scientific result, repository target, or public deployment.

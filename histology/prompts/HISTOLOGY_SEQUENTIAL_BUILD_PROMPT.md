# Complete Histology Journey — Sequential Build Prompt

Build, integrate, verify, commit, and push the complete seven-mission **The Histology Journey** game into the SiTC Games hub. You must execute the mission prompts below in order. **Do not begin a later mission until the previous mission is fully built, verified, and committed.**

This is an implementation task, not a planning task. Continue until all seven missions, final completion, hub integration, commits, and remote push are genuinely complete, unless a concrete external blocker prevents progress.

## Canonical locations

Implementation repository:

`C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`

Remote:

`https://github.com/Tonio-Bezzina/SiTC-Games.git`

Source prompt directory:

`C:\Users\User\Documents\ChatGPT\SiTC games\histology`

Mission source directory:

`C:\Users\User\Documents\ChatGPT\SiTC games\histology\missions`

Asset source directory:

`C:\Users\User\Documents\ChatGPT\SiTC games\histology\assets`

## Git workflow

1. Inspect repository status and preserve unrelated work.
2. Fetch `origin/main` and `origin/codex/histology-mission-1` explicitly.
3. Create or reuse branch **`codex/histology-complete-game`**.
4. Prefer the verified `codex/histology-mission-1` commit as the starting point when available; otherwise start from current `origin/main` and build Mission 1 from its prompt.
5. Never force-push, rewrite history, reset unrelated changes, or commit unrelated files.
6. Create a checkpoint commit after every mission using the exact commit message in that mission's prompt.
7. After all seven mission gates and the full-game gate pass, push with upstream tracking:

   `git push -u origin codex/histology-complete-game`

If remote access fails, retain all local commits and report the exact blocker and remaining push command. Never claim a push or test succeeded without evidence.

## Mandatory prompt order

Read each prompt completely immediately before implementing its mission:

1. `HISTOLOGY_MISSION_1_BUILD_PROMPT.md`
2. `HISTOLOGY_MISSION_2_BUILD_PROMPT.md`
3. `HISTOLOGY_MISSION_3_BUILD_PROMPT.md`
4. `HISTOLOGY_MISSION_4_BUILD_PROMPT.md`
5. `HISTOLOGY_MISSION_5_BUILD_PROMPT.md`
6. `HISTOLOGY_MISSION_6_BUILD_PROMPT.md`
7. `HISTOLOGY_MISSION_7_BUILD_PROMPT.md`

Every mission prompt incorporates its authoritative mission MD file and exact reviewed asset list. Follow the source hierarchy, copy each mission specification unchanged into `histology/docs/`, and integrate only the required mission/shared assets.

## Hard sequential gate

For mission `N`, use this exact loop:

1. Read the complete Mission `N` build prompt, authoritative mission specification, asset README, manifest entries, existing implementation, tests, and relevant continuity state.
2. Confirm every earlier mission remains complete and its checkpoint commit exists.
3. Implement only Mission `N` and any compatibility/state migration needed for earlier saves.
4. Add or update automated tests for Mission `N` logic, state transitions, persistence, completion gating, and regression risk.
5. Run the complete automated suite, not only the new tests.
6. Serve the static game locally and execute Mission `N` in a real browser from its prior mission output.
7. Verify normal and incorrect paths, refresh/Continue, mouse/touch-equivalent controls, keyboard-only completion, reduced motion, desktop landscape, tablet landscape, short-phone landscape, narrow portrait handling, console output, and asset requests.
8. Re-run smoke checks for every earlier mission.
9. Review the diff, run syntax checks and `git diff --check`, and resolve all failures.
10. Create the exact Mission `N` checkpoint commit.
11. Record the commit hash and verification evidence.

Only after all eleven steps pass may you read and begin Mission `N+1`. A partially working interaction, unverified layout, missing input path, failing regression, placeholder where the current mission requires real behavior, console error, asset 404, or uncommitted mission is a failed gate. Fix it before continuing.

Do not skip a gate because a later mission might hide or replace the problem. Do not batch several incomplete missions into one commit. Do not merely inspect a pre-existing Mission 1: run its full gate and repair it if necessary before advancing.

## Continuity rules across all missions

- One `missionStartedAt`, reference patient, accession, accepted specimen, and tissue lineage must continue through the entire game.
- Each mission consumes the saved output of the previous mission and produces exactly the input required by the next.
- Use a versioned, migration-safe Histology local-storage schema.
- Refresh must restore the nearest safe state without regenerating identity, shuffling fixed choices, duplicating tissue, replaying completed physical actions, or losing completion.
- Level changes must preserve the reference identity and rebuild only allowed unfinished difficulty-dependent state.
- Keep completed missions reviewable without allowing review to corrupt forward progress.
- Do not award `histology/main` until Mission 7's final journey requirements are satisfied.
- PLAY AGAIN may deliberately create a new case after confirmation; ordinary retry, refresh, or Continue must not.

## Asset and UI rules

- Use the assets listed in each mission prompt from the reviewed source library.
- Reuse existing files; do not duplicate shared assets or copy all source assets blindly.
- Preserve intended layered composition and overlay live HTML identifiers/copy on blank art where required.
- Use relative runtime URLs compatible with `/SiTC-Games/histology/` on GitHub Pages.
- Use the SiTC palette and existing Histology shell consistently across missions.
- Do not add scores, stars, timers, rankings, attempts, lives, competitive language, mandatory sound, unsupported clinical detail, or new artwork when supplied artwork exists.
- Maintain semantic controls, 44×44 minimum targets, visible focus, live announcements, non-color cues, reduced motion, and no flashing.

## Full-game final gate

After the Mission 7 checkpoint, perform a clean end-to-end audit before pushing:

1. Start a brand-new case at each difficulty and verify level-specific Mission 1 identities.
2. Complete Missions 1 through 7 without developer shortcuts.
3. Confirm every mission's exact correct/incorrect wording and completion gating.
4. Confirm each mission receives the previous mission's saved output and the same patient/case.
5. Refresh at representative states in every mission and resume safely.
6. Complete a full keyboard-only path and verify touch/tap alternatives for gesture interactions.
7. Verify reduced-motion equivalents for every animated mission.
8. Test desktop landscape, tablet landscape, short-phone landscape, and portrait rotation handling.
9. Confirm all asset requests return successfully and the console has no errors.
10. Confirm the first scene is difficulty selection, the game link opens from the SiTC hub, and all back/finish links return correctly.
11. Confirm the hub remains incomplete through Missions 1–6, then awards only `histology/main` after final Mission 7 completion, without changing other lab progress.
12. Confirm PLAY AGAIN produces a new patient/case and a clean Mission 1 state.
13. Run the complete automated suite, syntax checks, static link/asset checks, and `git diff --check`.
14. Review the entire branch diff against `origin/main` for scope, scientific continuity, accessibility, and accidental files.

Fix every issue before pushing. The final game must run directly on GitHub Pages and a basic local HTTP server without a build step.

## Final commit, push, and report

If the Mission 7 checkpoint already contains all final fixes, do not create an empty commit. If the full-game audit required changes, commit them as:

`Complete and verify the full Histology Journey`

Push `codex/histology-complete-game`, verify the remote branch resolves to the local HEAD, and report:

- branch name and remote URL;
- every mission checkpoint commit hash and final audit commit if present;
- files and asset groups added or changed;
- automated tests and their results;
- browser paths, input methods, layouts, reduced-motion and persistence checks;
- hub completion verification;
- any remaining blocker, without claiming completion if a required gate failed.

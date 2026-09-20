# Build The Mycology Journey Sequentially

Repository: `C:\Users\User\Documents\ChatGPT\SiTC games\work\SiTC-Games-publish-m1-oneclick`  
Remote: `https://github.com/Tonio-Bezzina/SiTC-Games.git`  
Branch: `codex/mycology-complete-game`  
Source: `mycology/source/The Mycology Journey Game.docx`  
Base authority: `mycology/MYCOLOGY_GAME.md`  
Assets: `mycology/assets/asset-manifest.json`  
Mission specs: `mycology/missions/`

Build prompts, in mandatory order:

1. `MYCOLOGY_MISSION_1_BUILD_PROMPT.md`
2. `MYCOLOGY_MISSION_2_BUILD_PROMPT.md`
3. `MYCOLOGY_MISSION_3_BUILD_PROMPT.md`
4. `MYCOLOGY_MISSION_4_BUILD_PROMPT.md`
5. `MYCOLOGY_MISSION_5_BUILD_PROMPT.md`
6. `MYCOLOGY_MISSION_6_BUILD_PROMPT.md`
7. `MYCOLOGY_MISSION_7_BUILD_PROMPT.md`
8. `MYCOLOGY_MISSION_8_BUILD_PROMPT.md`

Never read or implement Mission N+1 until Mission N is fully built, tested in a real browser, regression-tested, diff-reviewed, and committed with its prompt’s exact checkpoint message. Reuse the existing branch based on verified `origin/main`. Preserve unrelated changes; never force-push, reset unrelated work, or rewrite history.

For every mission: read its complete prompt/spec immediately before coding; confirm prior checkpoints; implement only that mission plus safe compatibility migration; copy the unchanged mission spec to `mycology/docs/`; integrate only reviewed assets; add focused state-machine/validation/persistence/gate tests; run all automated and syntax checks; serve via basic HTTP; test correct/incorrect/hint/retry/refresh/Continue; test keyboard-only, mouse, and touch/tap alternatives; test reduced motion, desktop landscape, tablet landscape, short-phone landscape, and portrait; inspect focus/live announcements, console, and asset requests; smoke all prior missions; run `git diff --check`; fix everything; then commit.

Use schema-versioned `sitcMycologyJourneyV1`. Every later state requires all predecessor flags and required clues; otherwise recover to the earliest incomplete mission. Review is read-only. Replay creates a new fictional case after confirmation and clears only the Mycology journey save. Difficulty changes guidance only, never science or completion.

The first scene is difficulty selection. Static relative URLs must work from `/SiTC-Games/mycology/`. The hub uses `sitcGameProgressV2`; only the validated final Mission 8 action may idempotently add `mycology/main`, and it must preserve other laboratories.

After Mission 8, run a fresh full game at every difficulty; verify all exact copy, every wrong/hint/retry, continuous case lineage, representative refreshes, full keyboard completion, pointer/touch equivalents, all motion/layout/accessibility checks, clean console/assets, hub navigation and award timing/idempotency, review, and replay. Run all tests, link/asset checks, and `git diff --check`, then inspect the full diff against `origin/main` for scope, science, accessibility, continuity, and accidental files. If fixes are required, commit `Complete and verify the full Mycology game`; do not create an empty commit.

Push with upstream tracking and verify remote HEAD equals local HEAD. Never claim a gate passed without evidence.

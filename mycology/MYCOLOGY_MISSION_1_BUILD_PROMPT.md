# Build Mycology Mission 1 The Basics

Work only in the SiTC Games implementation repository on `codex/mycology-complete-game`. Read `MYCOLOGY_GAME.md`, `missions/MISSION_01_THE_BASICS.md`, `MYCOLOGY_ASSETS.md`, and `assets/asset-manifest.json` completely immediately before implementation. The mission specification is authoritative for copy, science, interaction, state, accessibility, and its gate.

Implement the static game shell, first-scene difficulty selection, schema-versioned `sitcMycologyJourneyV1` save/migration/recovery, Mission 1 only, and the Mycology hub card. Copy the mission specification unchanged to `mycology/docs/MISSION_01_THE_BASICS.md`. Integrate only its reviewed shared/Mission 1 assets. Add pure logic tests for difficulty invariants, question validation, save repair, mission gate, and no early hub award.

Serve through a basic HTTP server and verify difficulty selection precedes play; all correct/incorrect/hint paths; refresh/Continue; keyboard-only, mouse, and touch controls; reduced motion; desktop/tablet/short-phone landscape and portrait; focus/live regions; clean console/network; hub navigation; asset requests; full regression; and `git diff --check`. Preserve unrelated files and other lab progress.

Do not read or implement Mission 2 until every Mission 1 check passes and this exact commit exists:

`Build Mycology Mission 1 the-basics`

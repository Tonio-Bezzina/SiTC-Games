+# Build Mycology Complete Journey Progress Summary

Confirm Missions 1–7 checkpoints. Read the base, `missions/JOURNEY_PROGRESS_SUMMARY.md`, reviewed completion assets, hub code, and current state. Implement the read-only progress summary and automatic final award; copy the unchanged spec to `mycology/docs/JOURNEY_PROGRESS_SUMMARY.md`.

Remove the former Mission 8 ordering activity, all drag/tap/reorder/check controls, and the separate completion action. Display the seven completed missions and their saved clues in order. On entry, revalidate the seven flags, clues, lineage, case, difficulty, and schema, then append `mycology/main` idempotently without changing any other hub progress.

Run all tests and a real-browser full-completion check. Verify old Mission 8 saves migrate directly to the summary, invalid saves recover safely, award timing and idempotency, responsive layouts, keyboard navigation for remaining actions, clean console/assets, and `git diff --check`.


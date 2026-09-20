# Build Mycology Mission 8 Mycology Detective

Confirm Missions 1–7 checkpoints. Read the base, `missions/MISSION_08_MYCOLOGY_DETECTIVE.md`, reviewed completion assets, hub code, and current state. Implement Mission 8 and final completion only; copy the unchanged spec to `mycology/docs/MISSION_08_MYCOLOGY_DETECTIVE.md`.

Implement eight-card ordering through drag, tap/slot, and keyboard reordering; exact feedback; saved order; and the separate `Complete my journey` validator. Award only `completedCases.mycology = ["main"]` or append `"main"` idempotently after revalidating all flags, clues, lineage, case, difficulty, and schema. Preserve every other hub field/lab. Implement review and confirmed replay with fresh case state while retaining hub progress.

Add focused tests for ordering, incomplete/corrupt/direct-route attacks, idempotency, preservation, review, and replay. Run the complete suite and a full Mission 1–8 regression. In a real browser verify wrong/correct/hint, refresh, all input methods, reduced motion, layouts, accessibility, console/network/assets, hub incomplete before final action and complete once after, links, replay, and diff check.

Commit only after the complete game gate passes:

`Build Mycology Mission 8 mycology-detective`

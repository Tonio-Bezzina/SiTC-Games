# Build Mycology Mission 4 Process Dermatology Sample

Confirm Missions 1–3 checkpoints. Read `missions/MISSION_04_PROCESS_DERMATOLOGY_SAMPLE.md`, the base, reviewed assets, and current implementation completely. Implement Mission 4 only plus safe migration and copy the unchanged spec to `mycology/docs/MISSION_04_PROCESS_DERMATOLOGY_SAMPLE.md`.

Build the exact six-token, six-target allocation gate: three independently empty microscope slides and three independently empty culture media, with one piece permitted per target. Make empty targets unmistakable, reject occupied-target placement with corrective feedback, and support drag, tap/select, and keyboard placement. Replace the range control with five registered microscope views—one focused and four out of focus—followed by clue-area selection on the focused view only. Persist unique destinations and microscopy state without duplication. Add tests for capacity, allocation, focus/view validation, recovery, lineage, and no award.

Run all tests and smoke Missions 1–3. Real-browser test balanced/unbalanced paths, wrong/correct field, hint, refresh/Continue, all input methods, reduced motion, desktop/tablet/short-phone/portrait, focus/live counts, console/network/assets, and diff check.

Do not read or implement Mission 5 until the gate passes and this exact commit exists:

`Build Mycology Mission 4 process-dermatology-sample`

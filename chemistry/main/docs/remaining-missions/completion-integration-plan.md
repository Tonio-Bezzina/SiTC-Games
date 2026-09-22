# Clinical Chemistry completion integration plan

Status date: 22 September 2026
Current playable endpoint: Chapter 3 quality control
Target endpoint: six complete chapters, checked report delivery, badge persistence, replay, and return

This document is self-contained. It defines how the remaining chapter implementations connect to the existing game without breaking saved progress, identity continuity, difficulty switching, rotation safety, or shared passport data.

## Current architecture

- Plain HTML/CSS/JavaScript under `chemistry/main/`.
- Runtime files: `index.html`, `style.css`, `game.js`, and `assets/`.
- Chemistry checkpoint key: `sitcChemistryMainCheckpointV1`.
- Current checkpoint schema version: 3.
- Current terminal stage: `qc-complete` rendered as end-of-available-content.
- Current completed chapter flags: `chapter1Complete`, `chapter2Complete`; Chapter 3 acceptance is held in `qualityControl` and terminal stage.
- Shared passport key exists in the root hub: `sitcGameProgressV2`.
- No current Chemistry passport write and no badge award.

Unrelated files, especially existing Transfusion working-tree changes, must not be altered while completing Chemistry.

## Target chapter route

```text
Opening
  → Chapter 1 identity/reception
  → Chapter 2 centrifuge/plasma
  → Chapter 3 quality control
  → Chapter 4 analyser measurement
  → Chapter 5 result review
  → Chapter 6 delivery/recap
  → Mission complete/badge
```

No chapter may advance from animation callbacks alone. Each transition checks the logical completion gate and saves before rendering the next entry state.

## Target root state

Recommended shape:

```js
{
  version: 6,
  level: "junior" | "explorer" | "challenge",
  caseData: {
    name: "Ian …",
    id: "12345H",
    dob: "DD/MM/YYYY",
    accession: "CC-123456",
    test: "Glucose"
  },
  measurementCase: {
    category: "above" | "within",
    reactionStrength: "strong" | "moderate",
    graphVariant: "highPlateau" | "midPlateau",
    reportMarker: 0.78,
    doctorDialogue: "above" | "within"
  },
  stage: "…",
  clueSeen: true,
  chapter1Complete: true,
  chapter2Complete: true,
  chapter3Complete: true,
  chapter4Complete: false,
  chapter5Complete: false,
  chapter6Complete: false,
  scenario: [],
  centrifuge: {},
  qualityControl: {},
  analyser: null,
  review: null,
  delivery: null,
  soundOn: true
}
```

The exact final version number may differ, but use an explicit migration per schema change. Do not silently accept malformed future-shaped objects.

## Case generation and invariants

Generate once at new-case start:

- Ian identity and birthday based on the initial level's internal age range.
- Five digits plus H/L ID no.
- Accession.
- Correct/mismatching reception sets.
- Core patient result case and corresponding reaction/graph/report/dialogue.

Invariants throughout the mission:

- Ian's name, ID no., birthday, accession, test, accepted sample, and measurement case never change on retry, refresh, resize, rotation, or mid-mission level switch.
- Only the unfinished chapter's level-specific hints, distractors, layout, or QC scenario may rebuild.
- Rejected Chapter 1 material never enters later chapters.
- Yellow centrifuge samples never become Ian's sample and are not called plasma in a way that conflicts with their preparation.
- A failing QC blocks Chapter 4.
- Chapter 4's reaction and graph determine the immutable case shown in Chapters 5–6.
- Badge completion never alters the patient result to reward the player.

## Checkpoint migrations

### Existing version 3

Preserve the current v1→v2 and v2→v3 migration logic. Add migration from version 3:

- If stage is `qc-complete` and `qualityControl.accepted === true` with passing result, set `chapter3Complete = true`, create the saved measurement case if missing, create a clean Chapter 4 state, and enter `analyser-entry`.
- If QC is unfinished, add new fields with safe defaults but keep the current QC phase and scenario.
- Never mark Chapter 4 complete during migration.

### Later schemas

- Chapter 4 schema introduces `measurementCase`, `chapter3Complete`, `chapter4Complete`, and `analyser`.
- Chapter 5 schema introduces `chapter5Complete`, `review`, and `report`.
- Chapter 6 schema introduces `chapter6Complete`, `delivery`, and `badgeAwarded`.

Write migrations as ordered transformations. Validate after migration. If validation fails, prefer a safe chapter-entry state that preserves valid Ian/case data rather than partially trusting broken action state.

## Stage validation

Maintain central helpers:

- `isCentrifugeStage`
- `isQualityControlStage`
- `isAnalyserStage`
- `isReviewStage`
- `isDeliveryStage`

The valid-stage list and matching state validation must update together. Validate enums, arrays, normalized marker bounds, required completed prerequisites, and patient ID format. A stage cannot claim a later chapter while an earlier required completion flag is false.

## Rendering and routing

Keep one central `render()` dispatch. For maintainability, move each new chapter into focused functions or separate modules only if the existing no-build architecture can load them reliably. Avoid copying the entire game into chapter-specific pages; one continuous state is required.

Update `updateChrome()` to derive chapter labels for all six chapters. Do not use a nested ternary that becomes unreadable; create `chapterForStage(stage)` and a label map.

Every render must:

1. Cancel stale scheduled work.
2. Update top chrome.
3. Render from saved logical state.
4. Restore the correct guide message.
5. Wire only controls allowed in the current phase.
6. Schedule only the current resumable animation.

## Timer and animation safety

Replace the single-timer assumption if Chapter 4 needs both graph and status animation, but keep a central cancellation registry. Associate callbacks with a monotonically increasing render/chapter token. A callback checks its token and current stage before mutating state.

Pause when:

- Portrait overlay is active.
- Level or Help dialog is open.
- Full-screen transition/layout rebuild occurs if geometry matters.
- Page visibility/blur would allow hidden progress.

Cancel when:

- Difficulty changes.
- Chapter exits.
- Replay/new case starts.
- A saved checkpoint is replaced.

## Input contract across remaining chapters

- Drag is primary for Ian's tube, Chapter 4 tools, and Chapter 6 recap cards.
- Use pointer capture and one active primary pointer.
- Apply a finger offset/lift.
- Valid targets highlight and use forgiving geometry.
- Missed/cancelled drops return to last valid position without an error.
- Suppress the click generated after a completed drag.
- Every drag has tap/select-then-target and keyboard alternatives.
- Chapter 5 checklist decisions are direct buttons, not artificial dragging.
- Rotation, level change, blur, and rerender cancel active gestures safely.

## Difficulty switching

Use a chapter reset dispatcher:

```text
unfinished Chapter 3 → rebuild QC scenario for selected level
unfinished Chapter 4 → analyser-entry; preserve prepared sample, QC, and measurement case
unfinished Chapter 5 → review entry; preserve settled result
unfinished Chapter 6 → delivery-ready; preserve checked report and dialogue case
mission complete → start a new case under selected level
```

Selecting the current level closes the picker only. Completed chapters never replay or become invalid. Persist selected level and, optionally, level history separately from patient/case invariants.

## Rotation and responsive continuity

Retain the blocking portrait gate. It takes visual/input precedence over inspection and level dialogs while leaving them preserved underneath.

On portrait entry:

- Pause timers/animation frames.
- Cancel the active drag and return the object.
- Do not submit decisions, complete graph reading, send report, or award badge.

On landscape resume:

- Recalculate geometry.
- Resume the saved phase, not a newly randomised scene.
- Preserve card/sample/tool positions and open dialogs.

Test desktop, tablet landscape, 844×390 landscape, and matching portrait transitions. Reflow artwork rather than shrinking critical graph/report text.

## Shared progress integration

Only Chapter 6 final completion writes shared progress:

- Key: `sitcGameProgressV2`.
- Ensure `completedCases.chemistry` is an array.
- Add `main` if absent.
- Preserve all other data and unknown fields.
- Be idempotent.
- Handle corrupt/missing/unavailable storage without blocking in-session completion.

The Chemistry checkpoint and shared passport serve different purposes. Replay clears/replaces only the checkpoint; it does not remove the badge.

## Hub and copy updates

After Chapters 4–6 ship:

- Update `chemistry/index.html` to describe the complete mission.
- Remove partial-section/development notices.
- Preserve route `chemistry/main/` and case ID `main`.
- Do not add fake locked cases.
- Review the root hub's current mastery wording because Chemistry has exactly one listed case.
- Update Help content to cover the analyser sequence, review, and recap without giving away every answer.
- Apply the Chapter 3 completion brief before connecting it to Chapter 4.

## Implementation order

1. Complete the documented Chapter 3 revision.
2. Add checkpoint schema/migration scaffolding for Chapters 4–6 and the coherent measurement case.
3. Build Chapter 4 exterior entry with existing art.
4. Approve/integrate cutaway assets and implement the four analyser actions plus graph.
5. Build Chapter 5 report/checklist.
6. Build Chapter 6 delivery/recap.
7. Add badge persistence and final screen.
8. Update Chemistry hub/help copy.
9. Run per-chapter and full-mission verification.

## Full-mission verification matrix

Minimum required runs:

- Fresh Junior, Explorer, and Challenge completions.
- Explorer pass and fail QC variants across new cases.
- Above and within measurement/report/dialogue variants.
- Deliberate wrong sample, centrifuge error, QC decision error, analyser order error, graph early-use error, result classification error, and recap order error.
- Drag-primary, tap-only, and keyboard-only complete missions.
- Muted audio, reduced motion, enlarged text, and full-screen denial.
- Refresh at every meaningful phase and during every animation.
- Rotation during each drag, centrifuge spin, QC processing, graph, result dialog, recap, and badge transition.
- Every pairwise level change during unfinished Chapters 1–6.
- Existing Transfusion progress plus unknown progress fields before Chemistry badge award.
- Corrupt checkpoint, corrupt passport, and unavailable storage.
- Hosted-subpath asset and return-link checks.

## Release gate

Do not call the mission complete until:

- All six chapter gates are reachable and cannot be bypassed.
- Ian identity and story result remain coherent end to end.
- Chapter 3 satisfies its completion brief and safely hands off to Chapter 4.
- Graph, reaction, report, and dialogue agree.
- Junior Chapter 5 has no hidden identity/review actions.
- The badge is awarded exactly once only after Chapter 6.
- Replay preserves earned progress and generates a new coherent case.
- No placeholder, dead Continue button, partial-content message, missing asset, or development-only control remains.

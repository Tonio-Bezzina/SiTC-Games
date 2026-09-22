# Clinical Chemistry remaining-mission implementation pack

Status date: 22 September 2026
Design authority: `C:/Users/User/.codex/.chatgpt-projects/g-p-6a9b1ed709048191bd77a1663d5f308c/chemistry-game-design.md`
Implementation audited: `chemistry/main/` on commit `25abc7c`

This folder converts the remaining work in the Clinical Chemistry design into implementation-ready briefs. Each chapter brief is intentionally self-contained: a developer can use one chapter file without needing to infer requirements from the other files. The design authority remains the source of truth if these briefs are later edited inconsistently.

## Current implementation audit

The playable mission currently contains:

1. Opening, level selection, clinic introduction, and clue-strip introduction.
2. Chapter 1: PTS arrival, carrier opening, sample/request inspection, identity matching, and transfer to the receiving rack.
3. Chapter 2: four- or eight-slot centrifuge balancing, lid and spin controls, retrieval of Ian's separated grey-top sample, and plasma identification.
4. Chapter 3: a passing or failing quality-control path, scientist intervention, a fresh passing material, and an end-of-available-content screen.

The current saved checkpoint is version 3 and uses `sitcChemistryMainCheckpointV1`. The current game deliberately does not write to the shared passport and does not award the Chemistry badge.

## Remaining work packages

Implement in this order:

1. [Chapter 3 — quality-control completion revision](chapter-3-quality-control-completion.md)
   Revise and complete the current final chapter before extending it. This is documentation only for now; the current code is not changed by this pack.
2. [Chapter 4 — analyser measurement](chapter-4-analyser-measurement.md)
   Load Ian's prepared sample, choose glucose, enter the teaching cutaway, transfer an aliquot, add reagent, mix/react, and obtain a settled light reading.
3. [Chapter 5 — result review](chapter-5-result-review.md)
   Review identity, compare the result with the story's example range, and complete scientist review according to level.
4. [Chapter 6 — report delivery and completion](chapter-6-report-delivery-and-completion.md)
   Send the checked report, return to the clinic, complete the recap, award and persist the badge, and provide replay/return routes.

Supporting documents:

- [Remaining asset production brief](remaining-assets.md): exact reuse decisions, missing assets, prompts/specifications, interface layers, and acceptance checks.
- [Asset management standard](asset-management.md): naming, provenance, manifest, versioning, optimisation, integration, and retirement rules.
- [Completion integration plan](completion-integration-plan.md): checkpoint migration, shared case data, chapter routing, passport persistence, and final cross-chapter verification.

## Boundaries for the work

- Preserve the plain HTML/CSS/JavaScript architecture in `chemistry/main/`.
- Preserve Ian's generated name, five-digit-plus-H/L ID no., birthday, accession, accepted grey-top sample, prepared plasma, and saved difficulty across all remaining chapters.
- Keep the existing landscape rotation gate, Level control, sound control, full-screen control, help dialog, guide strip, drag-first interactions, tap/select alternative, and keyboard route.
- Do not display age ranges in the player interface.
- Do not invent clinical units, cutoffs, diagnoses, treatment, or instrument settings.
- Do not award a badge before Chapter 6 is complete.
- Reuse current artwork and DOM/CSS/SVG interface layers wherever practical. Generate new raster artwork only for genuinely missing illustrated objects or scenes.
- Do not modify or replace unknown fields in `sitcGameProgressV2`.
- A change of difficulty restarts only the unfinished chapter. It never changes Ian's identity or invalidates completed chapters.

## Definition of completion

The Chemistry mission is complete only when Chapters 1–6 can be played continuously; all three levels complete; failure and recovery paths remain coherent; reload, rotation, and level changes cannot bypass gates; Ian's identifiers and result story remain consistent; the final badge is awarded exactly once without disturbing other laboratory progress; and the Chemistry hub no longer describes the mission as a partial section.

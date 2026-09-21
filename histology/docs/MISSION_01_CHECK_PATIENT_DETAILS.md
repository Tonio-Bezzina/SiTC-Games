# Mission 1 — Check the Patient Details

## Purpose and dependency

This document specifies the first mission of **The Histology Journey**: **Specimen Reception & Identification**.

This is the one mission explicitly required to use these external SiTC source documents:

- `C:\Users\User\.codex\.chatgpt-projects\g-p-6a9b1ed709048191bd77a1663d5f308c\patient-selection-scene.md`
- `C:\Users\User\.codex\.chatgpt-projects\g-p-6a9b1ed709048191bd77a1663d5f308c\patient-identity-generation.md`

Those files are authoritative for the patient-comparison interaction and identity-generation rules. The requirements are also summarised here so the mission can be understood and implemented without relying on another Histology mission file.

## Mission outcome

The player must identify the complete sample set that matches the patient request, submit it, and transfer the accepted labelled skin-specimen container to the receiving/scanning rack. This teaches that the **name, ID no., and date of birth must all match** before a specimen is accepted.

## Player-facing copy

- Title: **Check the Patient Details**
- Question: **“Do the patient details on the sample match the form?”**
- Scientific term: **Specimen Reception & Identification**
- Guide instruction: **“Compare the patient details on the request, specimen label and reference. Find the matching skin sample set.”**
- Correct selection: **“Matched! This sample belongs to [patient name].”**
- Accepted transfer instruction: **“Move the accepted specimen to the receiving and scanning rack.”**
- Rejected label: **“Rejected set — remains at reception.”**
- Completion feedback: **“Correct! The patient's details match and the specimen is ready for the next step.”**
- Completion action: **NEXT**

## What the player sees

After the short introduction, reveal one reference request display and two complete sample stations side by side.

Each station contains:

- one sealed, transparent specimen container holding a small skin sample in preservative;
- one readable container label;
- one paper request form that belongs to that container.

The reference display and each paper request display:

- patient name;
- **ID no.**;
- date of birth in `DD/MM/YYYY` format.

Each specimen-container label displays only the patient's name value and ID value. Do not show the **Patient name** or **ID no.** field labels on the container, and do not show date of birth on the container.

The reference may also show **Specimen: Skin** and **Requested investigation: Histology**. Non-essential clinical details may be visually obscured, but the three identity fields must remain readable.

Both candidates use the same container type, lid colour, tissue appearance, and decorative styling. The answer must come from reading identifiers, not from position, colour, animation, or an obvious visual cue.

## Scene sequence

1. Show the scientist guide and title.
2. Once per new case, point to the real guide strip with: **“Look here for clues to help you complete your mission.”**
3. Reveal the reference and both complete sample sets.
4. Randomise whether the correct set appears left or right once when the case is created. Do not change it during that case.
5. Let the player inspect either complete set without submitting an answer.
6. Require **Select this sample** to submit the expanded set.
7. If incorrect, keep the set open, highlight exact mismatch fields on every relevant surface, and allow comparison or retry.
8. If correct, lock the accepted set and require the player to move its specimen container to the receiving/scanning rack.
9. Leave the incorrect set visibly at reception.
10. Enable **NEXT** only after the accepted container reaches the rack.

## Inspecting a sample set

Selecting a station expands its container label and paper request together. Only one station is expanded at a time.

Controls:

- **Select this sample** — submits the candidate.
- **Compare other sample** — closes the current detail view and returns focus to the station's inspect control.

Opening, closing, comparing, or missing a drag is not an incorrect scientific attempt. On open, set `aria-expanded="true"` and move focus to **Select this sample**.

## Identity generation

Generate and save the date of birth before the ID.

- Junior internal age: 7–9
- Explorer internal age: 10–12
- Challenge internal age: 13–16
- Do not display these ages.
- Date format: `DD/MM/YYYY`
- Player-facing identifier label: **ID no.**
- ID format: 4–7 digits followed by uppercase `H` or `L`
- The final two digits of the numeric part must equal the final two digits of that patient's birth year.
- Validate the format with `^\d{4,7}[HL]$`, then validate the year rule separately.
- Treat IDs as strings and keep all IDs unique within the scene.

Create the case in this order:

```text
mission reference date
  → level-specific date of birth
  → ID no. derived from birth year
  → name, request and accession details
  → correct and incorrect sample candidates
```

The correct candidate's paper request must match the reference exactly. Its container label must match the reference name and ID. An incorrect candidate's container name and ID must agree with its own paper request.

## Difficulty by level

| Level | Incorrect candidate | Expected mismatch fields |
|---|---|---|
| Junior | Different name, different valid birthday, and ID derived from that birthday | `name`, `id`, `dob` |
| Explorer | Same name and birthday; clearly different valid ID whose last two digits still match the shared birth year | `id` |
| Challenge | Same name and birthday; subtly different valid ID by changing/transposing prefix digits or flipping `H`/`L` | `id` |

Never alter the final two birth-year digits for an incorrect candidate that shares the reference date of birth. Calculate `mismatchFields` from the completed data rather than maintaining it manually.

## Submission and feedback

The answer is correct only if all three identifiers match exactly after normalising stored values. Do not infer a match from the birth-year suffix alone.

Incorrect feedback:

- One ID mismatch: **“This ID no. is different. Compare these two numbers on the reference, specimen label and paper request.”**
- Several mismatches: **“These patient details conflict. Compare the name and ID no. on all three surfaces, then compare the date of birth on the reference and paper request.”**

On an incorrect answer:

- keep the selected station expanded;
- mark every conflicting field with text/icon and colour on each surface where that field appears; date-of-birth mismatches appear on the reference and paper request, not on the container label;
- do not shuffle stations or regenerate any patient data;
- do not relabel or accept the mismatched specimen;
- do not count inspections or navigation as wrong answers.

On a correct answer, show **“Matched! This sample belongs to [patient name].”** Then enable drag, tap/select-then-target, and keyboard controls for moving the accepted container to the rack. Scanning links the existing specimen label to an accession record; it must not overwrite the identity label.

## Completion conditions

The mission is complete only when all are true:

1. Both candidate sets have been revealed.
2. At least one complete set has been inspected.
3. Name, ID no., and date of birth have been compared.
4. The matching set has been submitted.
5. The accepted labelled skin-specimen container has reached the receiving/scanning rack.
6. The rejected set remains at reception and is unavailable to later missions.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` and error red `#B51F3C` only with explicit text/icons.

Use rounded panels, bold child-friendly sans-serif text, high contrast, and a clean laboratory reception scene. Maintain a game bar, central activity area, scientist guide strip, progress label **Mission 1 of 7**, and disabled **NEXT** until completion.

## Accessibility and persistence

- Make identifiers readable at desktop, tablet-landscape, and short-phone-landscape sizes.
- Provide 44-by-44-pixel minimum targets and visible keyboard focus.
- Support drag, tap/select, and keyboard transfer paths.
- Announce feedback with `aria-live`.
- Do not rely on colour alone for mismatches.
- Prevent overlays from hiding fields under comparison.
- For reduced motion, use static outlines/arrows instead of pulsing or travel animation.
- If portrait is blocked, freeze and restore the scene unchanged after rotation.

Persist `missionStartedAt`, level, reference identity, candidates, candidate order, expanded station, mismatch fields, accepted candidate, rack-transfer status, and one-time cue state. Refresh, retry, Continue, and level changes must not silently change the reference patient.

## Acceptance checks

- Name and ID match across the correct reference, container label, and paper request; date of birth matches between the reference and paper request.
- Every generated ID has the required format and birth-year suffix.
- The incorrect set differs only in the level-appropriate fields.
- The correct station can appear on either side across new cases, but not move during a case.
- Wrong selection highlights the exact fields on all relevant surfaces and stays open.
- The rejected set cannot enter the rack or later missions.
- Mouse, touch, tap-only, and keyboard-only paths all work.
- Every visible ID field label says **ID no.**; the specimen-container label intentionally shows values without field labels.


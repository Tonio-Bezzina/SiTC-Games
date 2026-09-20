# Mission 2 Match the Sample

## Purpose and entry

Mission 2 teaches that the specimen must correspond to the body site under investigation. It requires Mission 1 completion. Input is the safety clue and five fictional complaint cards. Output is five correct matches plus selection of Jamie Borg’s skin scraping as the continuous case.

Instruction: **Fungal infections can occur all over the body. Can you match the sample to the correct patient?** The scene shows five illustrated patient cards (ear discomfort, skin rash, changed nail, urinary symptoms, sore mouth) and five specimens (ear swab, skin scrapings, nail clippings, urine sample, mouth swab). Copy must say these are complaints under investigation, not confirmed diagnoses.

## Interaction and feedback

Pairs are ear ↔ ear swab, skin ↔ skin scrapings, nail ↔ nail clippings, urinary ↔ urine sample, and mouth ↔ mouth swab. Pointer users drag or tap a specimen then tap a patient. Keyboard users focus a specimen, press Enter/Space to select it, move to a patient, and press Enter/Space to place it. Escape cancels selection.

Correct: **Well done! This sample is needed for this patient.** Incorrect: **Not this one. Look closely at what the patient is complaining of and try again.** Hint: **Match the sample name to the body area shown on the patient card.** Learning: **Fungal infections can affect many areas of the body. Collecting the right sample is important for the scientist investigating what may be present.**

After all five: **All five samples are matched. Jamie’s skin scraping will continue through our journey.** Continue records the five pairs, `caseId`, `patient = Jamie Borg`, `specimen = skin scrapings`, `missionFlags[2]`, and the matching clue.

## State and assets

Persist matched keys, selected specimen, attempts, and hint state after every placement. Resume recreates only unmatched objects. Review is non-destructive. Required assets: all shared guide/help/success assets, `assets/mission-2/patient-cards.svg`, and `assets/mission-2/specimen-items.svg`. Live HTML supplies names, complaint text, specimen names, match status, and accessible descriptions.

Use equal visual prominence; do not colour the correct pair alike before selection. Minimum targets are 60 px. Selected and matched states use icon/text as well as colour. Reduced motion removes snap/flight animation and updates immediately.

## Verification gate

Test all 25 possible attempted pairings, correct feedback, at least two wrong retries, drag, tap-select, keyboard-select, Escape cancel, refresh after two matches, all difficulties, responsive layouts, and transition to Mission 3. Confirm no hub award and no Mission 3+ state.

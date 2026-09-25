# Mission 2 Match the Sample

## Purpose and entry

Mission 2 teaches that the specimen must correspond to the body site under investigation. It requires Mission 1 completion. Input is the safety clue and five fictional patients shown one after another. Output is five correct matches plus selection of Jamie Borg’s skin scraping as the continuous case.

Instruction: **Meet each patient one at a time. Look at their complaint, then choose the specimen that should be collected.** The scene shows one illustrated patient at a time (ear discomfort, skin rash, changed nail, urinary symptoms, sore mouth) and five illustrated specimen choices (ear swab, skin scrapings, nail clippings, urine sample, mouth swab). Copy must say these are complaints under investigation, not confirmed diagnoses.

## Interaction and feedback

Pairs are ear ↔ ear swab, skin ↔ skin scrapings, nail ↔ nail clippings, urinary ↔ urine sample, and mouth ↔ mouth swab. The player sees Morgan, Jamie, Riley, Sam, and Alex sequentially. For each patient, pointer and keyboard users choose one of five semantic specimen buttons. A correct choice reveals a Next patient button; the fifth correct choice reveals Save matching clue. An incorrect choice leaves the same patient on screen for another attempt.

Correct: **Well done! This sample is needed for this patient.** Incorrect: **Not this one. Look closely at what the patient is complaining of and try again.** Hint: **Match the specimen name to the body area and complaint shown by the current patient.** Learning: **Fungal infections can affect many areas of the body. Collecting the right sample is important for the scientist investigating what may be present.**

After all five: **All five samples are matched. Jamie’s skin scraping will continue through our journey.** Continue records the five pairs, `caseId`, `patient = Jamie Borg`, `specimen = skin scrapings`, `missionFlags[2]`, and the matching clue.

## State and assets

Persist matched keys, the patient awaiting advancement, attempts, and hint state after every choice. Resume returns to the current patient without losing a correct choice. Review is non-destructive. Required assets: all shared guide/help/success assets, five `assets/mission-2/patient-*.png` illustrations, and five `assets/mission-2/specimen-*.png` illustrations. Live HTML supplies names, complaint text, specimen names, progress, and accessible descriptions.

Use equal visual prominence for all five specimens; do not colour or style the correct choice differently before selection. Minimum targets are 60 px. Correctness uses text as well as colour. Reduced motion removes lift animation and updates immediately.

## Verification gate

Test all 25 possible attempted pairings, correct feedback, at least two wrong retries, sequential patient advancement, pointer and keyboard selection, refresh after two matches and while awaiting Next patient, all difficulties, responsive layouts, and transition to Mission 3. Confirm no hub award and no Mission 3+ state.

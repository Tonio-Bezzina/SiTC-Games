# Mission 3 Detail Checking

## Purpose and entry

Mission 3 teaches specimen-reception identity checks. It requires Missions 1–2 and the five matched pairs. Input is five fictional sample/request pairs. Output is three accepted pairs, two rejected mismatches, and Jamie’s accepted skin scraping ready for processing.

Instruction: **New samples have arrived! Before we investigate, can you check that the specimen information matches the request forms?** For each case, show live HTML fields for surname, `MYC-####` ID, and specimen type on a blank sample label and request form.

## Deterministic case set

Cases 1, 3, and 5 match. Case 2 has an ID-number mismatch only. Case 4 has a surname mismatch only. Never use real dates of birth or hospital identifiers. Decision buttons are exactly:

- **The details on the sample match those on the request form! The sample can be sent for processing.**
- **There is a mismatch! The sample cannot be processed.**

Correct match: **Excellent! The details match. We can continue with the next specimen.** Correct rejection: **Excellent! You found the mismatch. This specimen must not be processed in our simulation.** Incorrect: **Something doesn’t match. Check the information again.** Hint: **Compare the surname, ID number, and specimen type one field at a time.** Learning: **Specimen reception is the first laboratory step. Correct identification helps ensure that results are linked to the correct patient.**

Completion: **Jamie’s skin scraping is correctly identified and ready for the next stage.**

## State, assets, and accessibility

Persist case index, correct decisions, attempts, hint state, and accepted/rejected keys. Corrupt or inconsistent arrays restart this mission without changing prior flags. Required assets: shared guide/help/success assets, `assets/mission-3/reception-background.png`, `assets/mission-3/dermatology-envelope.svg`, and `assets/mission-3/request-form-blank.svg`.

The comparison uses a semantic definition list/table with accessible row labels. Mismatches are not pre-highlighted. Focus feedback and decision buttons are visible, at least 48 px, and fully keyboard/touch operable. Reduced motion removes card-slide transitions.

## Verification gate

Verify exactly five cases and exactly the specified mismatch types; field-by-field copy; both correct feedback variants; incorrect retry; refresh on cases 2 and 4; keyboard-only and touch; no real data; persistence repair; and Mission 4 receives only the accepted `MYC-2048` skin-scraping lineage. No hub award.


# Mission 5 Check the Culture

## Purpose and entry

Mission 5 teaches recognition of mould-like culture growth without diagnosis. It requires the Mission 4 plate and microscopy clue. Input is the simulated incubated culture. Output is a growth-positive colony clue.

Show **One simulated week later…** with a skippable time-lapse; reduced motion jumps instantly to the open-incubator state. Instruction: **The culture has been given time to grow. Can you find the plate showing fungal growth?** Four equal registered choice cards appear. Each card keeps its plate image and live appearance description together: one fluffy/powdery mould-like target, one no-growth plate, and two irrelevant non-fungal appearances. Choice order may rotate by case ID, but target semantics remain fixed.

Correct: **Excellent! We found fungal growth. Now we need to work out what it is.** Incorrect: **Not this one. Look for the plate showing fungal or mould-like growth.** Hint: **Look for a fluffy or powdery colony spreading across the agar surface.** Learning: **After fungal growth is detected, the laboratory can examine its appearance and use further tests to investigate the organism.** Completion: **Culture clue saved. Let’s compare the colony and microscopic appearance.**

## State and assets

Persist time-lapse viewed/skipped, plate order, attempts, selected plate, clue, and mission flag. Resume after the time-lapse must not replay it unless the player chooses review. Required: shared guide/help/success assets, `assets/mission-5/incubator.svg`, four `assets/mission-5/culture-plate-*.svg` assets, and the continuing `assets/mission-4/sdcc-plate.svg`.

Plates are semantic buttons with accessible appearance descriptions, not species names. Correctness is not encoded in border colour or location. Selected colony zoom is a CSS transform; reduced motion replaces it with an enlarged static detail beside the choices. Controls support keyboard, mouse, and touch.

## Verification gate

Test skip and completed time-lapse, reduced motion, all four choices in rotated orders, wrong retry/hint, static enlarged detail, refresh before/after selection, input continuity, keyboard/touch, and Mission 6 transition. No organism diagnosis and no hub award.

# Mission 8 Become the Mycology Detective

## Purpose and entry

Mission 8 consolidates the complete journey. It requires all seven earlier flags and clue records. Input is eight stage cards. Output is `missionFlags[8] = true`; only a separate validated completion action may award `mycology/main`.

Instruction: **You’ve collected all the clues. Can you put the laboratory journey in the correct order?** Required order: **sample arrives → check details → microscopy → culture → check growth → identification → antifungal susceptibility testing → laboratory result**.

Players drag cards, tap a card then a numbered slot, or use keyboard **Move earlier/Move later** buttons. **Check order** validates only when all slots are filled. Correct: **Fantastic! You followed the specimen through the mycology laboratory.** Incorrect: **Almost! Think about what the laboratory needs to do first, and what information becomes available later.** Hint: **The sample must arrive and be checked before testing begins. Identification follows visible growth.** Learning: **Different laboratory methods provide different pieces of information. Together they help the mycologist investigate the specimen.**

After correct order, save the flag and show **Complete my journey**. Activating it revalidates schema version, case ID, difficulty, exact eight flags, accepted skin-scraping lineage, and required safety/matching/microscopy/culture/identification/MIC clues. Only then append `"main"` idempotently to `sitcGameProgressV2.completedCases.mycology` without altering other labs.

## Completion, state, and assets

Final copy is exactly:

- **CONGRATULATIONS, JUNIOR MYCOLOGIST! You solved the fungal mystery!**
- **Mycology scientists use many different laboratory clues and tests to investigate fungal infections. You followed the specimen all the way from the patient to the final laboratory result!**
- **JUNIOR MYCOLOGIST — MISSION COMPLETE!**

Actions: **Review my journey**, **Back to SiTC Games**, **Play again**. Replay confirmation: **Start a fresh fictional case? Your SiTC laboratory badge will stay safe.**

Persist order, attempts, hint, mission flag, and completed timestamp. Required: shared guide/success assets, `assets/mission-8/detective-board-background.png`, `journey-icons.svg`, `assets/completion/completion-lab-background.png`, and `completion/junior-mycologist-badge.svg`.

Reduced motion uses instant card placement and no completion zoom/confetti. Reordering and final controls are keyboard/mouse/touch accessible; order changes are announced.

## Verification gate

Test wrong/partial/correct orders, three input methods, refresh mid-order and after flag, direct final-route attack, missing/corrupt predecessor flags/clues, award absence before final action, idempotent single award after action, preservation of other labs, review without corruption, confirmed/cancelled replay, fresh case ID, all layouts, reduced motion, focus, console, and return links.

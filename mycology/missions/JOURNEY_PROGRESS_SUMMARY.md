+# Complete Journey Progress Summary

## Purpose and entry

This is a read-only completion view, not a mission. It appears immediately after Mission 7 saves the correct MIC clue. There is no card ordering, answer check, drag interaction, hint, or separate completion action.

The summary displays the complete case progress in order:

1. Safe science
2. Match the sample
3. Check the details
4. Process the sample
5. Check the culture
6. Identify the fungus
7. Read the antifungal endpoint

Each row shows a completion mark and the saved clue from that mission. The existing journey illustration shows the specimen pathway from arrival to laboratory result.

## Completion and hub award

Entry revalidates schema version, case ID, difficulty, all seven mission flags, the accepted skin-scraping lineage, and required safety, matching, microscopy, culture, identification, and MIC clues. It then appends `"main"` idempotently to `sitcGameProgressV2.completedCases.mycology` while preserving every other hub field and laboratory.

The page shows:

- **YOUR COMPLETE MYCOLOGY JOURNEY · 7 OF 7**
- **CONGRATULATIONS, JUNIOR MYCOLOGIST!**
- **You solved the fungal mystery!**
- **JUNIOR MYCOLOGIST — JOURNEY COMPLETE!**

Only the post-completion actions **Back to SiTC Games** and **Play again** remain. Replay confirmation is unchanged and keeps the earned hub badge safe.

## Verification gate

Test automatic display and award after Mission 7, exact seven-row progress order and clue text, refresh/resume, migration from old Mission 8 saves, invalid/missing predecessor recovery, idempotent award, preservation of other laboratories, confirmed/cancelled replay, responsive layouts, reduced motion, clean console/assets, and absence of the old ordering controls.


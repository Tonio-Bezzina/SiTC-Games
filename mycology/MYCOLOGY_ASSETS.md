# Mycology Asset Production Manifest

## Visual system

All interface text, questions, labels, patient data, answer states, buttons, progress, focus, and feedback remain live HTML/CSS. The interface uses the verified SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, white `#FFFFFF`, success `#08784F`, and error `#B51F3C`.

Scientific colours may depart from the interface palette only within specimen, culture, stain, well, and microscopy artwork. Fluorescence fields use a near-black field with bright blue-white fungal structures. Culture plates use neutral agar and the source-specified colony colours. Susceptibility wells use source-specified pink growth and blue no-growth, always with text/symbol reinforcement in HTML.

Raster style is a polished, friendly, semi-realistic 3D educational illustration: rounded forms, clean materials, soft cool daylight from upper left, subtle navy contact shadows, no logos, no text, no real people, no gore, and no uncanny or malformed laboratory equipment.

## Asset inventory

| ID / filename | Use | Format / canvas | Background and composition | Status / continuity / alt recommendation |
|---|---|---|---|---|
| `shared-lab-bg` / `shared/mycology-lab-background.png` | Difficulty and shell backdrop | PNG 1536×1024 | Opaque; wide clean mycology lab, empty central safe area | Unique generated raster; “Bright illustrated mycology laboratory” |
| `guide-neutral` / `shared/dr-mira-neutral.png` | Opening/help | PNG 1024×1024 | Transparent; full-body guide centred, feet at y=930 | Generated state family; “Dr Mira Spore standing with hands relaxed” |
| `guide-pointing` / `shared/dr-mira-pointing.png` | Hints | PNG 1024×1024 | Transparent; same character/camera/anchor | Generated state family; “Dr Mira Spore pointing toward a clue” |
| `guide-success` / `shared/dr-mira-success.png` | Mission completion | PNG 1024×1024 | Transparent; same character/camera/anchor | Generated state family; “Dr Mira Spore celebrating” |
| `mycology-icon` / `shared/mycology-game-icon.svg` | Hub/game bar | SVG 128×128 | Transparent; microscope plus mushroom silhouette, no text | Code-rendered, unique |
| `hint-icon` / `shared/hint-icon.svg` | Hint button | SVG 48×48 | Transparent | Reused visual convention, new SVG |
| `success-icon` / `shared/success-check.svg` | Correct state | SVG 48×48 | Transparent | Shared |
| `rotate-icon` / `shared/rotate-device.svg` | Orientation panel | SVG 240×160 | Transparent | Shared |
| `mission-1-safety` / `mission-1/safety-lab-vignettes.svg` | Six-question support strip | SVG 1200×500 | Transparent; six safe, non-procedural icons | Code-rendered; no answer labels |
| `patient-family` / five `mission-2/patient-*.png` files | Five fictional adults showing ear, skin, nail, urinary, or mouth complaints | PNG 1024×1024 each | Transparent; registered to anchor 512×960; one patient per file | Generated raster; live names/copy; age-neutral; no diagnostic claim |
| `specimen-family` / five `mission-2/specimen-*.png` files | Ear swab, skin scrapings, nail clippings, sealed urine cup, mouth swab | PNG 640×640 each | Transparent; registered to anchor 320×570; one isolated object per file | Generated raster; no identifiers or answer styling |
| `reception-bg` / `mission-3/reception-background.png` | Reception setting | PNG 1536×1024 | Opaque; counters and empty safe areas for live forms | Generated raster; “Illustrated laboratory specimen reception” |
| `sample-envelope` / `mission-3/dermatology-envelope.svg` | Continuing case | SVG 480×320 | Transparent, blank label area | Code-rendered; no baked data |
| `request-form` / `mission-3/request-form-blank.svg` | Live identity comparison | SVG 600×760 | Opaque white paper, blank rows | Code-rendered; all data HTML overlays |
| `processing-bg` / `mission-4/processing-bench-background.png` | Skin split workspace | PNG 1536×1024 | Opaque; empty bench centre | Generated raster; “Clean illustrated mycology processing bench” |
| `skin-piece` / `mission-4/skin-scraping-piece.svg` | Six draggable pieces | SVG 160×120 | Transparent; neutral small flakes, non-gory | Reused instance, six HTML copies |
| `slide` / `mission-4/microscope-slide.svg` | Microscopy target | SVG 520×260 | Transparent | Code-rendered |
| `culture-plate` / `mission-4/sdcc-plate.svg` | Culture target | SVG 520×420 | Transparent, neutral agar, blank live label area | Code-rendered; no recipe |
| `fluorescence-field` / `mission-4/fluorescence-field.svg` | Pan/focus observation | SVG 1400×900 | Opaque near-black; sparse bright septate branching elements and spores in one target region | Code-rendered for scientific control; stylised not diagnostic |
| `incubator` / `mission-5/incubator.svg` | Time transition | SVG 900×700 | Transparent; closed/open states via groups | Code-rendered |
| `culture-choices` / `mission-5/culture-plate-choices.svg` | Four culture choices | SVG 1400×700 | Transparent; registered plates on identical canvases | Code-rendered; only one mould-like target, no text |
| `aspergillus-colonies` / `mission-6/aspergillus-colony-set.svg` | Four colony references | SVG 1400×700 | Transparent; blue-green, yellow-green, black, cinnamon-brown | Code-rendered; equal prominence |
| `aspergillus-fields` / `mission-6/aspergillus-microscopy-set.svg` | Four microscopic references | SVG 1400×700 | Transparent; simplified head morphology | Code-rendered; educational disclaimer in HTML |
| `key-arrows` / `mission-6/identification-key-arrows.svg` | Branching key | SVG 1200×500 | Transparent, arrows only | Code-rendered; all clue text HTML |
| `mic-plate` / `mission-7/mic-plate.svg` | Simplified 96-well plate | SVG 1200×720 | Transparent; well geometry only; fills controlled by CSS | Code-rendered; no drug/clinical labels |
| `detective-board` / `mission-8/detective-board-background.png` | Sequence board | PNG 1536×1024 | Opaque cork/clean lab hybrid with empty card zones | Generated raster; “Illustrated clue board with empty card spaces” |
| `journey-icons` / `mission-8/journey-icons.svg` | Eight ordering cards | SVG 1200×400 | Transparent; eight symbols without labels | Code-rendered; text remains HTML |
| `completion-bg` / `completion/completion-lab-background.png` | Final screen | PNG 1536×1024 | Opaque; bright lab, central negative space, subtle fungi motifs | Generated raster; “Celebratory illustrated mycology laboratory” |
| `completion-badge` / `completion/junior-mycologist-badge.svg` | Final award | SVG 300×300 | Transparent; mushroom/microscope motif, no words | Code-rendered |
| `reduced-process` / `shared/reduced-motion-process.svg` | Static animation equivalent | SVG 1200×260 | Transparent before/after timeline | Code-rendered; labels HTML |

## Reuse map

- Dr Mira’s three registered states appear in the difficulty scene, hints, mission completions, and final screen.
- `skin-scraping-piece.svg` is instantiated six times; duplication happens in markup, not separate files.
- `sdcc-plate.svg` continues from Mission 4 into Mission 5 before being replaced by the registered plate-choice family.
- Mission 4 microscopy, Mission 5 colony, Mission 6 identification, and Mission 7 MIC become the four scientific clue cards reused in Mission 8 and review mode.
- Shared icons and shell background are reused across missions but never baked with text.

## Registration and production standards

State families must use identical viewBox/canvas, scale, camera, lighting, and anchor coordinates. Character feet anchor at `(512,930)` on 1024-square canvases. Plate families centre at 50%/55% with identical dish diameter. Transparent PNGs must have clean straight-alpha edges and no matte halo. Opaque backgrounds must reserve the upper 18% and central 45% as safe overlay areas.

SVGs must include `viewBox`, descriptive `<title>`, logical groups, and no external fonts, raster links, scripts, filters that impair performance, or baked instructional text. Animated states are CSS/JS transforms of static assets; reduced-motion uses instant state swaps or `reduced-motion-process.svg`.

Prohibited details: logos, watermarks, real identifiers, answer markers, captions, buttons, written instructions, reagent recipes, visible needles, flames in procedural scenes, open live-culture handling, treatment claims, realistic lesions, gore, extra fingers/limbs, distorted glassware, impossible microscope optics, or culture colour that reveals correctness through UI styling.

## Metadata schema

`asset-manifest.json` is an object with `schemaVersion`, `generatedAt`, `palette`, `style`, and `assets`. Each asset record contains `id`, `file`, `type`, `width`, `height`, `bytes`, `sha256`, `background`, `source`, `missions`, `usage`, `alt`, `registrationFamily`, `anchor`, `scientificNotes`, `prohibited`, and `status`. Values must reflect actual files. SVG dimensions come from width/height or viewBox; PNG dimensions come from file headers.

## Contact sheets

Create labelled PNG contact sheets in `assets/contact-sheets/`:

1. `shared-and-backgrounds.png` — every generated raster at readable size;
2. `mission-assets.png` — every mission SVG rendered on checker/white panels;
3. `state-families.png` — guide poses and registered plate/colony/microscopy families side by side.

Labels belong only on contact sheets, never production artwork. Each sheet includes filename and pixel dimensions.

## Automated and visual QA

Automated checks must verify: every required file exists; filenames are lowercase kebab-case; manifest entries are unique and exhaustive; dimensions/bytes/hashes are real; PNG signatures and alpha/opacity match declarations; SVG XML parses with a viewBox; no external URLs, scripts, embedded patient text, logos, or unexpected text nodes exist; registration-family canvases match; all runtime references resolve; and all contact sheets exist.

Visual inspection at full size must verify: consistent guide identity and lighting; clean transparency; readable game-size silhouettes; correct body-site/sample distinction; six visibly identical skin-scraping pieces; balanced 3/3 destinations; credible slide/plate/microscope relationships; sparse septate branching fluorescence target; one unambiguous mould-like culture without answer styling; equal prominence of four *Aspergillus* references; accurate simplified clue differences; orderly well gradients; safe text-overlay areas; no malformed equipment, accidental text, watermark, correct-answer bias, or continuity break.

# Remaining Clinical Chemistry assets — production brief and reuse plan

Status date: 22 September 2026
Applies to: completion of Chapters 3–6 and final mission polish
Design authority: `chemistry-game-design.md`, especially Visual direction and artwork plan

This document is self-contained. It inventories the current artwork, identifies the remaining assets needed for the complete mission, defines what should be reused or built as interface code, and supplies production specifications for genuinely new illustrations.

## Asset principles

1. Reuse before generating. Prefer an existing Chemistry asset, then a visually compatible SiTC asset, then a new illustration.
2. Do not bake readable text, patient identifiers, barcodes, graph axes, range bands, markers, buttons, liquid states, hit zones, or feedback into raster images.
3. Build stateful teaching elements in HTML/CSS/SVG so they remain editable, responsive, accessible, and independently animated.
4. Use raster generation only for illustrated equipment, characters, and backgrounds that cannot be recreated cleanly from current assets.
5. Maintain the established polished child-friendly 3D-cartoon style: white/deep-navy/cyan equipment, soft rounded forms, gentle lighting, transparent cutouts, and calm clinical environments.
6. Inspect transparency and cutout edges against the actual intended background at desktop, tablet landscape, and short-phone landscape sizes.

## Existing Chemistry asset inventory and planned reuse

| Existing file | Current role | Remaining-mission reuse |
|---|---|---|
| `analyser-exterior-v1.png` | Chapter 3 analyser | Chapter 4 exterior scan/load and optional Chapter 5 background |
| `check-sample-vial-v1.png` | Current Chapter 3 QC vial | Keep artwork; continue to use an editable HTML label defined by the Chapter 3 brief |
| `ian-separated-v1.png` | Ian's centrifuged grey-top tube | Chapter 3 waiting rack and Chapter 4 patient rack/cutaway anchor |
| `sample-rack-clean-v3.png` | Chapter 1 receiving rack | Candidate Chapter 4 patient rack if composition and scale fit |
| `request-monitor-v1.png` | Chapter 1 request monitor | Candidate shell/background for Chapter 5 reporting screen |
| `paper-request-v2.png` | Chapter 1 paper request | Candidate blank base for Chapter 5/6 checked report; text remains HTML |
| `centrifuge-bench-v1.png` | Chapter 2 bench and current Chapter 3 background | Reuse as analyser-room background if its composition remains credible |
| `reception-background-v1.png` | Chapter 1 laboratory background | Optional reporting-lab background crop if more suitable than centrifuge bench |
| `ian-seated-v2.png` | Clinic opening | Chapter 6 return-to-clinic scene |
| `malta-window-townscape-v2.png` | Clinic window | Chapter 6 clinic continuity |
| `grey-bottle-v1.png` | Unseparated grey-top tube | Thumbnail only when recalling Chapter 1; do not use in Chapter 4 after separation |
| `yellow-bottle-v1.png` | Other centrifuge samples | Optional recap/background thumbnail only |
| `inspection-holder-v1.png` | Chapter 2 inspection | Optional prepared-sample holder in Chapter 4 exterior entry |
| PTS and centrifuge assets | Chapters 1–2 | Recap thumbnails only; do not redraw full scenes |

Stable file names may remain when the raster itself is unchanged. Retaining `check-sample-vial-v1.png` is acceptable because the image contains no required baked label and changing references adds no player value.

## Existing cross-game candidates

Inspect before copying or directly referencing:

- `transfusion/nicky/assets/doctor-v1.png`
- `transfusion/nicky/assets/nurse-v1.png`
- `transfusion/nicky/assets/screen-2/nurse-received.png`
- `transfusion/nicky/assets/screen-4/pipette-empty.png`
- `transfusion/nicky/assets/screen-4/pipette-loaded.png`

Reuse only when pose, viewpoint, lighting, uniform, story context, resolution, and licensing/provenance fit. The Transfusion doctor must not carry emergency-specific props or body language into Ian's calm clinic. The Transfusion pipette may inspire proportions but should not be used if it visually contradicts an automated analyser probe.

If a cross-game asset is reused, prefer copying a versioned derivative into `chemistry/main/assets/` only when the Chemistry mission needs independent cropping/maintenance. If the exact source file is shared without modification, document the dependency and verify hosted relative paths.

## New illustrated assets required

### A1 — Analyser teaching cutaway

Proposed file: `analyser-cutaway-v1.png`
Owner: Chapter 4
Priority: critical

Purpose: memorable interior teaching scene behind separate interactive components.

Specification:

- Wide landscape composition suitable for a 16:9 stage with safe cropping to 844×390.
- Simplified interior of the established analyser, using the same white, deep-navy, cyan, and soft-grey materials as `analyser-exterior-v1.png`.
- Clear visual bays for patient tube, reaction cup, reagent path, mixer, light source, and detector.
- Keep the central reaction cup and graph region visually uncluttered.
- No text, arrows, numbers, graph, liquid colour, light beam, tools, tubes, controls, logos, or baked highlights.
- Transparent foreground/housing cutout is preferred if it improves responsive composition; otherwise use a full background with documented safe areas.
- The machine must look educational and plausible without presenting an exact commercial analyser.

Prompt intent:

> Wide child-friendly 3D-cartoon clinical chemistry analyser interior cutaway matching an existing white, deep-navy and cyan benchtop analyser; simplified clean compartments for sample, reaction cup, reagent path, mixer and optical detector; calm polished museum-game style; blank equipment, no text, labels, tubes, liquid, graph, buttons, logo or UI; leave clear central interaction space and right-side graph-safe space.

Acceptance:

- Reads as the inside of the existing exterior.
- Supports separate overlays without perspective conflict.
- No essential detail is lost at phone landscape crop.

### A2 — Teaching sample probe

Proposed file: `analyser-probe-v1.png`
Owner: Chapter 4
Priority: critical

Specification:

- Transparent cutout, vertical or slightly angled to match the cutaway.
- Rounded automated sampling arm/probe, not a hand-held child pipette.
- Neutral empty state; liquid/aliquot is an SVG/CSS overlay.
- No text, logo, fixed highlight, or background.
- Include enough visual shaft thickness for a generous invisible 48+ pixel hit area without making the probe biologically oversized.

Prompt intent:

> Transparent polished 3D-cartoon automated clinical chemistry sample probe, white and deep navy housing with cyan detail, slim metal sampling tip, isolated front-three-quarter view, no liquid, text, logo, hand, background or shadow beyond a subtle contact/ambient shadow.

### A3 — Glucose reagent dispenser

Proposed file: `glucose-reagent-dispenser-v1.png`
Owner: Chapter 4
Priority: critical

Specification:

- Transparent cutout matching the cutaway perspective.
- Clearly distinct from the patient probe and QC vial.
- Generic unbranded reagent reservoir/dispenser with an editable blank label region if visible.
- Reagent droplets/path remain interface overlays.
- No chemical formula, hazard label, brand, exact volume, or baked text.

Prompt intent:

> Transparent child-friendly 3D-cartoon automated reagent dispenser for a clinical chemistry analyser; compact white, navy and cyan module with a small generic reagent reservoir and delivery nozzle; blank label area; isolated; no text, branding, hazard symbols, droplets, liquid path, hands or background.

### A4 — Clear reaction cup

Proposed file: `reaction-cup-empty-v1.png`
Owner: Chapter 4
Priority: critical

Specification:

- Transparent empty cuvette/reaction cup with clearly defined interior mask area.
- Straight or cutaway-compatible view.
- No liquid baked in. Sample-added, reagent-added, reacting, and measured fills are SVG/CSS layers clipped to the cup.
- Rim and wall edges remain readable on both dark cutaway and pale fallback backgrounds.

Prompt intent:

> Transparent isolated clear clinical chemistry reaction cup/cuvette in polished educational 3D-cartoon style; empty, clean, simple front-three-quarter view with readable rim and walls; no liquid, label, scale, hand, rack or background.

### A5 — Optical detector module, conditional

Proposed file: `optical-detector-v1.png`
Owner: Chapter 4
Priority: conditional

Create only if the cutaway does not already supply a visually usable light-source/detector housing. The light beam, signal, labels, and active state stay SVG/CSS.

Specification:

- Two simple aligned modules or one detector housing matching the analyser.
- Neutral inactive state.
- No beam, glow, graph, label, wavelength, or numerical marking.

### A6 — Laboratory scientist guide/acknowledgement

Proposed files:

- Preferred minimum: `scientist-guide-v1.png`
- Optional variant only if needed: `scientist-acknowledge-v1.png`

Owners: Chapters 3 and 5
Priority: high

Specification:

- One versatile calm biomedical scientist in the established SiTC character style.
- Transparent full- or three-quarter-body cutout.
- Neutral open-hand teaching pose that works beside QC and reporting screens.
- Lab coat and appropriate laboratory clothing; no brand, readable badge, sample in hand, emergency pose, fixed speech bubble, or background.
- If one pose can be mirrored/cropped for both chapters, do not create a second asset.

Prompt intent:

> Transparent friendly biomedical laboratory scientist in the established polished child-friendly 3D-cartoon SiTC style; calm inclusive adult, lab coat and laboratory clothing, open-hand teaching/acknowledging pose, three-quarter body, front three-quarter view; no patient, equipment, speech bubble, text, badge details, logo or background.

### A7 — Calm clinic doctor, conditional after reuse review

Proposed file: `doctor-clinic-v1.png`
Owner: Chapter 6 and opening polish
Priority: high if Transfusion doctor is unsuitable

Specification:

- Transparent doctor in a calm clinic consultation pose.
- Consistent character proportions and lighting with `ian-seated-v2.png`.
- Holding a blank tablet/report or gesturing toward a separate report layer.
- No emergency posture, medical procedure, diagnosis expression, readable text, or background.

Prompt intent:

> Transparent friendly doctor for a calm paediatric clinic conversation, polished child-friendly 3D-cartoon SiTC style matching an existing seated boy; reassuring posture, holding a blank tablet or gently gesturing, no emergency equipment, readable text, diagnosis, speech bubble, logo or background.

### A8 — Parent/carer, optional but design-completing

Proposed file: `parent-carer-v1.png`
Owner: Chapter 6 and opening polish
Priority: medium

Specification:

- Calm supportive adult seated or standing behind/beside Ian.
- Transparent cutout with no text or props that imply a specific diagnosis.
- Create only if layout can accommodate the figure without reducing active text/control space on short screens. It may be hidden decoratively at the shortest landscape breakpoint while remaining semantically unnecessary.

### A9 — Clinical Chemistry badge

Proposed file: `chemistry-badge-v1.png` or code-native SVG
Owner: Chapter 6
Priority: critical

Prefer a repository-authored SVG/HTML/CSS badge if the shared badge system supports it. Otherwise generate a transparent illustrated medallion.

Specification:

- Navy/cyan/gold medallion using chemistry imagery such as a tube, reaction cup, and light beam.
- No baked words; “Clinical Chemistry Badge Earned!” remains HTML.
- Strong silhouette at small hub scale and high-resolution completion scale.
- No commercial analyser logo, medical cross misuse, patient result number, or diagnosis symbol.

Prompt intent for raster fallback:

> Transparent celebratory Clinical Chemistry game badge, polished child-friendly 3D-cartoon medallion in navy, cyan and gold; simple sample tube, reaction cup and light-beam motif; symmetrical clear silhouette; no words, letters, numbers, logo, patient result or background.

## Assets that should be interface code, not generated images

| Element | Preferred technology | Reason |
|---|---|---|
| Patient labels and accession | HTML | Editable, accessible, case-specific |
| QC/sample loading targets | HTML/CSS | Responsive hit zones and state highlights |
| Aliquot and reagent paths | SVG/CSS | Animation, reduced motion, recolouring |
| Reaction liquid states | SVG/CSS mask inside cup | Case consistency and independent states |
| Light beam | SVG/CSS | Direction, motion, reduced-motion state |
| Live graph axes/trace/point | SVG | Responsive, accessible labels, deterministic path |
| Example result band/marker | HTML/SVG | No baked units; result variants |
| Reporting checklist | HTML | Keyboard and screen-reader semantics |
| Checked report text/stamps | HTML/CSS | Patient-specific and localisable |
| Recap cards and slots | HTML with existing thumbnails | Drag/tap/keyboard state |
| Speech/dialogue | HTML | Responsive, accessible, case-specific |
| Badge title/actions | HTML | Never bake readable copy into badge art |

## Reusable thumbnail plan

Build recap cards from existing assets rather than commissioning three new illustrations:

- **Check and prepare:** crop/composite `grey-bottle-v1.png`, `centrifuge-open-v1.png`, or `check-sample-vial-v1.png` behind a code-rendered card.
- **Measure:** use `analyser-cutaway-v1.png` or reaction-cup thumbnail.
- **Review and report:** use `request-monitor-v1.png` or checked-report DOM snapshot-style illustration.

Use CSS `object-fit: contain` and controlled masks; never destructively edit the source PNGs merely to create thumbnails.

## Size, format, and safe-area guidance

- Backgrounds/cutaways: author at roughly 16:9 and at least 1600×900 where practical.
- Transparent equipment/characters: enough resolution for a 700–1000 CSS-pixel display dimension on high-density screens; retain alpha.
- Prefer PNG for painted transparent cutouts; use SVG for authored diagrams and interface layers.
- Do not upscale low-resolution source images to create false detail.
- Keep critical illustrated content inside the central 80% width and 82% height; test actual CSS crops rather than trusting nominal safe areas.
- Optimise files after visual approval, preserving alpha and avoiding halos.

## Production order

1. Build an HTML/CSS wireframe using existing assets and placeholder boxes for new cutaway components.
2. Confirm phone/tablet composition and interaction geometry.
3. Produce A1 cutaway.
4. Produce A2–A4 interactive cutouts against the approved cutaway perspective.
5. Decide whether A5 is necessary.
6. Reuse-test or produce A6 scientist.
7. Reuse-test the Transfusion doctor; produce A7 only if required.
8. Add A8 only if the clinic remains readable.
9. Produce/code A9 badge after final hub scale is known.

## Acceptance checklist for every new raster asset

- Visual comparison with current Chemistry assets at actual game scale.
- Correct alpha at all four corners when transparency is required.
- No white/black fringe on pale and dark intended backgrounds.
- No baked readable text, UI, marker, liquid state, or target highlight.
- Perspective and lighting agree with the destination scene.
- Object is not cropped by its own canvas.
- Works at desktop, tablet landscape, and 844×390 short phone landscape.
- Can be hidden/repositioned without obscuring essential controls.
- Has a source/provenance record and exact final prompt.
- Has a clear accessible role: meaningful images receive alt text; purely decorative layers use empty alt text.
- Duplicate/unused candidates are not committed.

## Minimum complete asset set

The complete mission can ship with only these new visual assets if reuse tests pass:

1. `analyser-cutaway-v1.png`
2. `analyser-probe-v1.png`
3. `glucose-reagent-dispenser-v1.png`
4. `reaction-cup-empty-v1.png`
5. `scientist-guide-v1.png`
6. `chemistry-badge-v1.png` or a code-native equivalent

The detector, doctor, and parent/carer are conditional. All graph, result, report, recap, dialogue, and state graphics should be code-native layers.

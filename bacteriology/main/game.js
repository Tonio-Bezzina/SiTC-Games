(function () {
  "use strict";
  const L = window.BJLogic;
  const STORAGE = "sitc-bacteriology-journey-v1";
  const HUB_STORAGE = "sitcGameProgressV2";
  const app = document.getElementById("app");
  const announcer = document.getElementById("announcer");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let timerCounter = 0;
  let missionTransition = false;
  let missionTransitionTimer = null;
  let mission5Animating = false;
  let mission5AnimationTimer = null;
  let activeNativeDrag = null;
  let mission6Timer = null;
  let mission7Timer = null;
  let mission9Timer = null;
  let gramAutoTimer = null;
  let openSampleInfo = null;
  let openAgarInfo = null;
  const SAMPLE_INFO = {
    urine: { title:"Urine sample", file:"urine-sample.png", what:"Urine collected in a clean, sterile specimen cup.", use:"It can be cultured when a urinary tract infection is suspected, helping the laboratory look for bacteria from the urinary system." },
    blood: { title:"Blood culture", file:"blood-culture.png", what:"A special bottle containing a blood sample and culture medium.", use:"It is used when a bloodstream infection is suspected, allowing the laboratory to check whether bacteria or other germs grow from the blood." },
    swab: { title:"Throat swab", file:"throat-swab.png", what:"A sterile swab used to collect material from the back of the throat and tonsils.", use:"It can be tested or cultured when a bacterial throat infection such as group A strep is suspected." }
  };
  const AGAR_INFO = {
    blood: { title:"Blood agar", file:"blood-agar.png", what:"An enriched red culture medium containing blood.", use:"It supports many bacteria and lets scientists see haemolysis. For this throat swab, it can show the beta-haemolysis associated with Streptococcus pyogenes." },
    chocolate: { title:"Chocolate agar", file:"chocolate-agar.png", what:"An enriched brown medium made using heated blood, which releases nutrients needed by fastidious bacteria.", use:"It is commonly used to grow demanding organisms such as Haemophilus and Neisseria. It is not the selected medium for this throat-culture mission." },
    salmonella: { title:"Salmonella chromogenic agar", file:"salmonella-chromogenic-agar.png", what:"A selective and differential medium containing chromogens that can produce distinctive colony colours.", use:"It is used for the presumptive detection of Salmonella, especially from faecal, food or environmental samples." },
    cled: { title:"CLED agar", file:"cled-agar.png", what:"Cystine–lactose–electrolyte-deficient agar, a pale blue-green differential medium.", use:"It is mainly used for urine cultures to isolate and count common urinary pathogens. Its low electrolyte content limits Proteus swarming." }
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE));
      return saved && saved.version === 1 ? { ...L.initialState(), ...saved } : L.initialState();
    } catch (_) { return L.initialState(); }
  }
  let state = load();
  if (!("selectedPpe" in state)) state.selectedPpe = null;
  if (!("mission4SolutionShown" in state)) state.mission4SolutionShown = false;
  if (!("sampleSelected" in state.matching)) state.matching.sampleSelected = false;
  const m5Defaults = L.initialState().mission5;
  const legacyM5 = state.mission5 || {};
  const previousM5Step = Number(legacyM5.step || 0);
  const hasModernM5 = "swabOpen" in legacyM5;
  state.mission5 = { ...m5Defaults, ...legacyM5 };
  if (!hasModernM5 && previousM5Step > 0) {
    state.mission5.swabOpen = previousM5Step >= 1;
    state.mission5.plateOpen = previousM5Step >= 2;
    state.mission5.inoculated = previousM5Step >= 3;
    state.mission5.swabClosed = previousM5Step >= 4;
    if (previousM5Step >= 5) { state.mission5.loopLoaded = true; state.mission5.streakStage = 3; }
  }
  const m6Defaults = L.initialState().mission6;
  const legacyM6 = state.mission6 || {};
  const previousM6Step = Number(legacyM6.step || 0);
  const hasModernM6 = "incubatorOpen" in legacyM6;
  state.mission6 = { ...m6Defaults, ...legacyM6 };
  if (!hasModernM6 && previousM6Step > 0) {
    state.mission6.incubatorOpen = previousM6Step >= 1;
    state.mission6.platePlaced = previousM6Step >= 2;
    state.mission6.incubatorClosed = previousM6Step >= 3;
    state.mission6.incubationStarted = previousM6Step >= 4;
    state.mission6.incubationComplete = previousM6Step >= 4;
    state.mission6.reopened = previousM6Step >= 5;
    state.mission6.inspected = previousM6Step >= 5;
  }
  const m7Defaults = L.initialState().mission7;
  const legacyM7 = state.mission7 || {};
  const previousM7Step = Number(legacyM7.step || 0);
  const hasModernM7 = "waterAdded" in legacyM7;
  state.mission7 = { ...m7Defaults, ...legacyM7 };
  if (!hasModernM7 && previousM7Step > 0) {
    state.mission7.waterAdded = previousM7Step >= 1;
    state.mission7.loopSelected = previousM7Step >= 2;
    state.mission7.colonySelected = previousM7Step >= 3;
    state.mission7.selectedColony = previousM7Step >= 3 ? "isolated-1" : null;
    state.mission7.colonyTransferred = previousM7Step >= 4;
    state.mission7.smearStage = previousM7Step >= 4 ? 3 : 0;
    state.mission7.wetSmearComplete = previousM7Step >= 4;
    state.mission7.dryingStarted = previousM7Step >= 5;
    state.mission7.dryingComplete = previousM7Step >= 5;
    state.mission7.heatPass = previousM7Step >= 5 ? 3 : 0;
    state.mission7.heatFixed = previousM7Step >= 5;
    state.mission7.complete = previousM7Step >= 5;
  }
  state.gram = { ...L.initialState().gram, ...(state.gram || {}) };
  const m9Defaults = L.initialState().mission9;
  const legacyM9 = state.mission9 || {};
  const hasModernM9 = "focusComplete" in legacyM9;
  state.mission9 = { ...m9Defaults, ...legacyM9 };
  if (!hasModernM9 && legacyM9.placed) {
    state.mission9.transitionStarted = true;
    state.mission9.focusComplete = true;
  }
  if (state.completed.includes(9)) {
    state.mission9.placed = true;
    state.mission9.transitionStarted = true;
    state.mission9.focusComplete = true;
    state.mission9.selectedAnswer = "chains";
    state.mission9.complete = true;
  }
  const M8_ASSETS = ["crystal-violet-bottle.png","lugols-iodine-bottle.png","decolorizer-bottle.png","carbol-fuchsin-bottle.png","wash-bottle.png","reagent-drop-clear.png","reagent-drop-violet.png","reagent-drop-iodine.png","reagent-drop-decolorizer.png","reagent-drop-fuchsin.png","slide-heat-fixed.png","slide-crystal-violet.png","slide-crystal-violet-rinsed.png","slide-iodine.png","slide-iodine-rinsed.png","slide-decolorizing.png","slide-decolorized-rinsed.png","slide-carbol-fuchsin.png","slide-gram-stain-complete.png"];
  M8_ASSETS.forEach(file=>{const image=new Image();image.src=`assets/mission-8/${file}`;image.decode?.().catch(()=>{});});
  const M9_ASSETS = ["compound-microscope-empty.png","compound-microscope-with-slide.png","microscope-stage-closeup-empty.png","microscope-stage-closeup-with-slide.png","gram-stained-slide-draggable.png","microscope-eyepiece-overlay.png","microscopy-field-pink-rods.png","microscopy-field-purple-rods.png","microscopy-field-purple-cocci-chains.png","microscopy-field-purple-cocci-clusters.png","microscope-focus-soft.png","microscope-focus-sharp.png"];
  M9_ASSETS.forEach(file=>{const image=new Image();image.src=`assets/mission-9/${file}`;image.decode?.().catch(()=>{});});
  let orientationBlocked = matchMedia("(orientation: portrait) and (max-width: 900px)").matches;

  function save() { localStorage.setItem(STORAGE, JSON.stringify(state)); }
  function saveHubCompletion() {
    let progress = { completedCases: {} };
    try { progress = JSON.parse(localStorage.getItem(HUB_STORAGE)) || progress; } catch (_) { /* Start a fresh shared progress record. */ }
    if (!progress.completedCases) progress.completedCases = {};
    if (!Array.isArray(progress.completedCases.bacteriology)) progress.completedCases.bacteriology = [];
    if (!progress.completedCases.bacteriology.includes("main")) progress.completedCases.bacteriology.push("main");
    localStorage.setItem(HUB_STORAGE, JSON.stringify(progress));
  }
  function announce(message) { announcer.textContent = ""; requestAnimationFrame(() => { announcer.textContent = message; }); }
  function setFeedback(message, type = "") { state.feedback = message; state.feedbackType = type; save(); announce(message); render(); }
  function e(value) { return String(value).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c])); }
  function h(tag, attrs = {}, children = "") {
    const attr = Object.entries(attrs).filter(([,v]) => v !== false && v != null).map(([k,v]) => `${k}="${e(v)}"`).join(" ");
    return `<${tag}${attr ? " " + attr : ""}>${children}</${tag}>`;
  }
  function ageConfig() { return L.LEVELS[state.age] || L.LEVELS.junior; }
  function younger(young, mid, older) { return state.age === "junior" ? young : state.age === "explorer" ? mid : older; }
  function feedback() { return `<div class="feedback ${state.feedbackType || ""}" role="status">${state.feedback || "Choose an action to continue your investigation."}</div>`; }
  function learning(text, older = "") { return `<div class="learning"><strong>Learning point</strong><br>${text}${older && state.age === "challenge" ? `<div class="older-note">🔎 ${older}</div>` : ""}</div>`; }
  function btn(label, action, extra = "") { return `<button class="btn ${extra}" data-action="${action}">${label}</button>`; }
  function choice(icon, title, sub, action, value, pressed = false, cls = "") { return `<button class="choice ${cls}" data-action="${action}" data-value="${e(value)}" aria-pressed="${pressed}"><span class="big-icon" aria-hidden="true">${icon}</span><strong>${title}</strong>${sub ? `<small>${sub}</small>` : ""}</button>`; }
  function completeMission(number, message) {
    if (!state.completed.includes(number)) state.completed.push(number);
    state.feedback = message;
    state.feedbackType = "good";
    save(); announce(message); render();
  }
  function continueMission() {
    const current = state.mission;
    if (!state.completed.includes(current)) return;
    state.mission = current + 1;
    if (state.mission === 3) {
      state.matching.carrierOpen = true;
      state.matching.clueSeen = true;
    }
    state.feedback = ""; state.feedbackType = "";
    save(); render();
  }
  function missionHeader(number, title, lede) {
    return `<div class="mission-label">Mission ${number} of 10</div><h1>${title}</h1><p class="lede">${lede}</p>`;
  }
  function shell(content, guide) {
    const progress = state.mission ? Math.min(100, state.completed.length * 10) : 0;
    const footerText = state.feedback || guide;
    const footerType = state.feedback ? state.feedbackType : "";
    const screenClass = state.mission === 1 ? "screen mission-one-screen" : state.mission === 2 ? "screen mission-two-screen" : state.mission === 3 ? "screen mission-three-screen" : state.mission === 4 ? "screen mission-four-screen" : state.mission === 5 ? "screen mission-five-screen" : state.mission === 6 ? "screen mission-six-screen" : state.mission === 7 ? "screen mission-seven-screen" : state.mission === 8 ? "screen mission-eight-screen" : state.mission === 9 ? "screen mission-nine-screen" : "screen";
    const transition = missionTransition ? `<div class="mission-door-transition" aria-hidden="true"><img src="assets/mission-1/preparation-room-background.png" alt=""></div>` : "";
    return `<div id="gameShell" class="shell"><div id="gameStage"><header class="topbar"><div class="brand"><span class="brand-mark">🦠</span><span>Bacteriology Journey</span></div><div class="progress-track" aria-label="Journey ${progress}% complete"><div class="progress-fill" style="width:${progress}%"></div></div><div class="age-chip">${state.age ? ageConfig().label : "Junior lab"}</div></header><main class="screen-host"><section class="${screenClass}"><div class="screen-scroll">${content}</div></section>${transition}</main><footer class="guide game-footer ${footerType}" aria-label="Scientist guide"><div class="guide-avatar" aria-hidden="true">👩🏽‍🔬</div><div><h2>Dr Mira says</h2><p>${footerText}</p></div></footer></div></div>`;
  }

  function startScreen() {
    const cards = Object.entries(L.LEVELS).map(([key, value], i) => `<button class="age-card" data-action="choose-age" data-value="${key}"><span class="emoji" aria-hidden="true">${["🧪","🔬","🧬"][i]}</span><span><strong>${value.label}</strong><small>${["Friendly clues and simple words","More science and closer choices","Deeper explanations and subtle clues"][i]}</small></span><span class="arrow" aria-hidden="true">→</span></button>`).join("");
    return `<div id="gameShell" class="shell"><div id="gameStage" class="start-stage"><main class="screen-host"><section class="screen"><div class="screen-scroll hero-start"><section><div class="mission-label">Become a Junior Bacteriologist</div><h1>Bacteriology<br>Journey</h1><p class="lede">Can you follow a throat sample through the laboratory and solve the mystery of the bacteria?</p><h2>Choose your age group</h2><div class="age-cards">${cards}</div></section><div class="hero-orbit" aria-hidden="true"><span class="petri-orbit one"></span><span class="petri-orbit two"></span></div></div></section></main></div></div>`;
  }

  function mission1() {
    const ready = state.ppe.includes("coat") && state.ppe.includes("gloves");
    const scientistFile = ready ? "scientist-with-lab-coat-and-gloves.png" : state.ppe.includes("coat") ? "scientist-with-lab-coat.png" : state.ppe.includes("gloves") ? "scientist-with-gloves.png" : "scientist-base.png";
    const scientistLabel = ready ? "Scientist wearing a lab coat and blue gloves" : state.ppe.includes("coat") ? "Scientist wearing a lab coat" : state.ppe.includes("gloves") ? "Scientist wearing blue gloves" : "Scientist ready to put on protective equipment";
    const item = (key, label, file, cls) => `<button class="ppe-item ${cls} ${state.selectedPpe===key?"is-selected":""} ${state.ppe.includes(key)?"is-equipped":""}" data-action="ppe" data-value="${key}" draggable="true" data-drag="ppe" data-drag-image="assets/mission-1/${key==="gloves"?"blue-gloves-draggable.png":file}" aria-label="${label}${state.ppe.includes(key)?", equipped":""}" aria-pressed="${state.selectedPpe===key||state.ppe.includes(key)}"><img src="assets/mission-1/${file}" alt="" draggable="false"><span>${label}</span></button>`;
    const coatProxy = `<button class="ppe-coat-select ${state.selectedPpe==="coat"?"is-selected":""} ${state.ppe.includes("coat")?"is-equipped":""}" data-action="ppe" data-value="coat" draggable="true" data-drag="ppe" data-drag-image="assets/mission-1/lab-coat-on-hook.png" aria-label="Lab coat${state.ppe.includes("coat")?", equipped":""}" aria-pressed="${state.selectedPpe==="coat"||state.ppe.includes("coat")}">Lab coat</button>`;
    const result = `<p>Excellent! You chose the correct PPE. Now we’re ready to enter the laboratory!</p>${learning("We wear appropriate PPE in the laboratory to protect ourselves from samples and microorganisms.")}`;
    const controls = state.completed.includes(1)
      ? `<div class="mission-one-result" role="status" aria-live="polite"><div class="mission-one-result-card">${result}<div class="actions">${btn("Mission 2 →","continue","coral")}</div></div></div>`
      : ready ? `<div class="mission-one-result" role="status" aria-live="polite"><div class="mission-one-result-card">${result}<div class="actions">${btn("Enter the laboratory →","complete-1","coral")}</div></div></div>` : "";
    return shell(`<div class="mission-one-title">${missionHeader(1,"Enter the lab",younger("Help Dr Mira prepare to enter the laboratory safely.","Choose the PPE needed for this task.","Select the appropriate PPE for handling this specimen."))}<div class="instruction">Drag an item to the scientist, or select it and then choose the scientist.</div></div><div class="ppe-scene" aria-label="Laboratory preparation room"><img class="ppe-background" src="assets/mission-1/preparation-room-background.png" alt="Laboratory preparation room"><button class="scientist-stack" data-action="apply-ppe" data-drop="ppe" aria-label="Scientist, PPE drop target. Select to apply the chosen item."><img class="scientist-state" src="assets/mission-1/${scientistFile}" alt="${scientistLabel}"></button>${item("coat","Lab coat","lab-coat-on-hook.png","ppe-coat")}${coatProxy}${item("hat","Hard hat","hard-hat.png","ppe-hat")}<img class="ppe-countertop" src="assets/mission-1/ppe-countertop.png" alt="" aria-hidden="true">${item("gloves","Glove box; select a pair of blue gloves","gloves-box.png","ppe-gloves")}${item("glasses","Safety glasses","safety-glasses-container.png","ppe-glasses")}${item("visor","Face visor","face-visor-container.png","ppe-visor")}${controls}</div>`, "The right protection depends on the laboratory task. For this one, choose exactly two items.");
  }

  function mission2() {
    const options = [
      ["urine","Urine sample","A sample from the urinary system","urine-sample.png"],
      ["blood","Blood culture","A bottle used when bacteria may be in blood","blood-culture.png"],
      ["swab","Throat swab","A swab collected from the throat","throat-swab.png"]
    ];
    const specimen = ([value,title,sub,file]) => `<div class="specimen-option"><button class="choice specimen-choice" data-action="sample" data-value="${value}" aria-label="Choose ${title}"><img src="assets/mission-2/${file}" alt=""><strong>${title}</strong>${state.age==="junior"?"":`<small>${sub}</small>`}</button><button class="sample-info-button" data-action="sample-info" data-value="${value}" aria-label="Learn about ${title}">?</button></div>`;
    const info = SAMPLE_INFO[openSampleInfo];
    const infoDialog = info ? `<div class="sample-info-backdrop" data-action="close-sample-info"><section class="sample-info-dialog" role="dialog" aria-modal="true" aria-labelledby="sample-info-title"><button class="sample-info-close" data-action="close-sample-info" aria-label="Close sample information">×</button><img src="assets/mission-2/${info.file}" alt=""><div><div class="mission-label">Sample guide</div><h2 id="sample-info-title">${info.title}</h2><p><strong>What it is:</strong> ${info.what}</p><p><strong>Where it is used:</strong> ${info.use}</p></div></section></div>` : "";
    const completion = state.completed.includes(2) ? learning("Different infections require samples from different parts of the body.")+`<div class="actions">${btn("Mission 3 →","continue")}</div>` : "";
    return shell(`<div class="mission-two-scene" aria-label="Inside the bacteriology laboratory"><img class="mission-two-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-two-title">${missionHeader(2,"What sample do we need?","Our patient has a <strong><u>sore throat</u></strong>. Which sample should the doctor take to look for bacteria that may be causing the infection?")}</div><div class="mission-two-feedback">${feedback()}${completion}</div><div class="mission-two-choices">${options.map(specimen).join("")}</div>${infoDialog}</div>`, "Think about where the patient's infection is. You can retry any choice.");
  }

  function fieldRows(person, mismatch = [], source = "") {
    const attr = key => source ? ` data-${source}-field="${key}"` : "";
    const row = (key,label,value) => `<dt${attr(key)} class="${mismatch.includes(key)?"mismatch":""}">${label}</dt><dd${attr(key)} class="${mismatch.includes(key)?"mismatch":""}">${e(value)}</dd>`;
    return `<dl class="fields">${row("name","Name",person.name)}${row("id","ID no.",person.id)}${row("dob","Date of birth",person.dob)}${person.test?row("test","Requested test",person.test):""}${person.specimen?row("specimen","Specimen",person.specimen):""}</dl>`;
  }
  function matchingRow(candidate, key, label, mismatch, source = "sample") {
    return `<span class="m3-data-row ${mismatch.includes(key)?"mismatch":""}" data-${source}-field="${key}"><b>${label}</b><span>${e(candidate[key])}</span></span>`;
  }
  function sampleLabel(candidate, mismatch) {
    return `<span class="m3-tube-label">${matchingRow(candidate,"name","Name",mismatch)}${matchingRow(candidate,"id","ID",mismatch)}${matchingRow(candidate,"dob","DOB",mismatch)}</span>`;
  }
  function requestPaper(candidate, mismatch) {
    return `<span class="m3-paper-sheet"><strong>Bacteriology request</strong><span class="m3-paper-section"><em>Patient details</em>${matchingRow(candidate,"name","Name",mismatch)}${matchingRow(candidate,"id","ID no.",mismatch)}${matchingRow(candidate,"dob","Date of birth",mismatch)}</span><span class="m3-paper-section"><em>Investigation</em>${matchingRow(candidate,"test","Test",mismatch)}${matchingRow(candidate,"specimen","Specimen",mismatch)}</span><span class="m3-paper-scribbles" aria-hidden="true"><i></i><i></i><i></i></span></span>`;
  }
  function candidate(candidate, index) {
    const open = state.matching.expanded === index;
    const mismatch = open ? state.matching.mismatch : [];
    return `<article class="m3-sample-station station-${index} ${open?"expanded":""}" data-index="${index}"><button class="m3-station-inspect" data-action="inspect" data-value="${index}" aria-label="Inspect complete sample set ${index+1}" aria-expanded="${open}"><span class="m3-station-name">Sample set ${index+1}</span><span class="m3-tube-wrap"><img src="assets/mission-2/throat-swab.png" alt="Throat swab transport tube">${sampleLabel(candidate,mismatch)}</span><span class="m3-paper-wrap">${requestPaper(candidate,mismatch)}</span><span class="m3-inspect-prompt">${open?"Reviewing complete set":"Tap to inspect"}</span></button>${open?`<div class="m3-station-actions">${btn("Select this sample","select-candidate","")} ${btn("Compare other sample","compare-other","secondary")}</div>`:""}</article>`;
  }
  function mission3Transfer(c) {
    const accepted = c.candidates[state.matching.accepted];
    const rejectedIndex = c.candidates.findIndex((_,index)=>index!==state.matching.accepted);
    const selected = state.matching.sampleSelected;
    const complete = state.matching.racked;
    const guidance = complete ? "" : `<div class="m3-transfer-guidance ${selected?"sample-selected":""}" aria-hidden="true"><svg viewBox="0 0 220 90"><path d="M12 63 C74 8 137 13 198 55"/><path d="M179 37 L201 56 L172 63"/></svg><span>Place the tube in the tube holder</span></div>`;
    return `<div class="m3-transfer" aria-label="Accepted sample transfer"><div class="m3-transfer-heading"><div class="mission-label">Mission 3 of 10</div><h1>Matched! This sample belongs to Amelia.</h1><p>Move the accepted throat swab to the receiving and scanning rack.</p></div><aside class="m3-rejected" aria-label="Rejected sample set ${rejectedIndex+1} remains at reception"><strong>Rejected set ${rejectedIndex+1}</strong><span>Remains at reception</span><div><img src="assets/mission-2/throat-swab.png" alt="Rejected throat swab"><span class="m3-mini-paper" aria-hidden="true"></span></div></aside><button class="m3-accepted-sample ${selected?"selected":""}" data-action="toggle-accepted-sample" data-value="accepted" draggable="true" data-drag="rack" data-drag-image="assets/mission-2/throat-swab.png" aria-pressed="${selected}" aria-label="Accepted throat swab for ${e(accepted.name)}. Select it, or drag it to the receiving rack."><img src="assets/mission-2/throat-swab.png" alt="">${sampleLabel(accepted,[])}</button>${guidance}<button class="m3-rack ${selected?"active":""} ${complete?"ready":""}" data-action="rack-sample" data-drop="rack" aria-label="Bacteriology receiving and scanning rack${complete?", accepted sample scanned":". Select after choosing the accepted swab, or drop it here."}"><span>${complete?"✓ Accepted sample scanned":"Tube holder / scanning rack"}</span><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i></button>${complete?`<div class="m3-complete-card" role="status"><p>Patient matched and sample received safely.</p>${learning("Patient details must be checked carefully so that results are reported for the correct patient.")}<div class="actions">${btn("Mission 4 →","complete-3","coral")}</div></div>`:""}</div>`;
  }
  function mission3() {
    const c = state.patientCase;
    const monitorMismatch = state.matching.mismatch;
    const background = `<img class="mission-three-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside the bacteriology laboratory">`;
    if (state.matching.accepted != null) return shell(`<div class="mission-three-scene">${background}${mission3Transfer(c)}</div>`, state.matching.racked?"The accepted swab is safely linked to Amelia’s laboratory request.":"Drag the accepted sample to the rack, or select the sample and then select the rack.");
    const stations = c.candidates.map(candidate).join("");
    const reviewing = Number.isInteger(state.matching.expanded);
    return shell(`<div class="mission-three-scene ${reviewing?"reviewing-sample":""}">${background}<div class="m3-match-heading"><div class="mission-label">Mission 3 of 10</div><h1>Match the patient</h1><p>Compare name, ID no. and date of birth on all three surfaces.</p></div><aside class="m3-reference-monitor" aria-label="Laboratory request monitor"><div class="m3-monitor-screen"><strong>Laboratory request monitor</strong>${fieldRows(c.reference,monitorMismatch,"reference")}</div></aside><div class="m3-sample-stations">${stations}</div>${monitorMismatch.length?`<div class="m3-match-alert" role="alert">${monitorMismatch.length===1?"This ID no. is different. Compare the highlighted numbers.":"These patient details conflict. Compare the highlighted fields."}</div>`:""}</div>`, "Check the name, ID no. and date of birth on the monitor, sample label and request form.");
  }

  function mission4() {
    const plates = [
      ["blood","Blood agar","Shows haemolysis","blood-agar.png"],
      ["chocolate","Chocolate agar","For fastidious bacteria","chocolate-agar.png"],
      ["salmonella","Salmonella chromogenic agar","For Salmonella detection","salmonella-chromogenic-agar.png"],
      ["cled","CLED agar","Commonly used for urine","cled-agar.png"]
    ];
    const plate = ([value,title,sub,file]) => `<div class="agar-option"><button class="choice agar-choice ${state.mission4SolutionShown&&value==="blood"?"solution-correct":""}" data-action="agar" data-value="${value}" aria-label="Choose ${title}"><img src="assets/mission-4/${file}" alt=""><strong>${title}</strong>${state.age==="junior"?"":`<small>${sub}</small>`}</button><button class="agar-info-button" data-action="agar-info" data-value="${value}" aria-label="Learn about ${title}">?</button></div>`;
    const info = AGAR_INFO[openAgarInfo];
    const infoDialog = info ? `<div class="sample-info-backdrop" data-action="close-agar-info"><section class="sample-info-dialog" role="dialog" aria-modal="true" aria-labelledby="agar-info-title"><button class="sample-info-close" data-action="close-agar-info" aria-label="Close agar information">×</button><img src="assets/mission-4/${info.file}" alt=""><div><div class="mission-label">Agar guide</div><h2 id="agar-info-title">${info.title}</h2><p><strong>What it is:</strong> ${info.what}</p><p><strong>Where it is used:</strong> ${info.use}</p></div></section></div>` : "";
    const completion = state.completed.includes(4) ? learning("Different culture media are used for different organisms and specimens.")+`<div class="actions">${btn("Mission 5 →","continue")}</div>` : "";
    const solution = state.mission4SolutionShown && !state.completed.includes(4) ? `<div class="m4-solution" role="status"><strong>Solution: Blood agar</strong><p>Blood agar supports the bacteria being investigated and lets the laboratory observe haemolysis.</p><ul><li><b>Chocolate agar</b> is used for other fastidious organisms.</li><li><b>Salmonella chromogenic agar</b> is designed for suspected Salmonella.</li><li><b>CLED agar</b> is mainly used for urine cultures.</li></ul></div>` : "";
    const solutionButton = !state.completed.includes(4) && !state.mission4SolutionShown ? `<div class="m4-solution-action">${btn("Show me the solution","show-agar-solution","secondary")}</div>` : "";
    return shell(`<div class="mission-four-scene" aria-label="Agar selection inside the bacteriology laboratory"><img class="mission-four-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-four-title">${missionHeader(4,"Choose the correct agar","Which agar plate should we use to grow bacteria from this throat swab?")}</div><div class="mission-four-feedback">${solution||feedback()}${solutionButton}${completion}</div><div class="mission-four-choices">${plates.map(plate).join("")}</div>${infoDialog}</div>`, "The sample is a throat swab. Choose the medium specified for this investigation.");
  }

  function mission5() {
    const m = state.mission5;
    const phase = !m.swabOpen ? 0 : !m.plateOpen ? 1 : !m.inoculated ? 2 : !m.swabClosed ? 3 : !m.loopLoaded ? 4 : m.streakStage < 3 ? 5 : 6;
    const prompts = [
      "First, open the throat-swab container.",
      "Now open the blood agar plate.",
      "Move the throat swab onto the starting area of the blood agar.",
      "Close the throat swab safely before continuing.",
      "Move the 10 µL loop through the starting area.",
      "Now streak across the rest of the agar.",
      "The plate is ready for the incubator."
    ];
    const arrowLabels = ["Open the swab","Lift the lid","Start here","Tap to close the swab","Touch the starting area","Follow the arrows",""];
    const swabFile = m.swabOpen && !m.swabClosed ? "throat-swab-open.png" : "throat-swab-closed.png";
    const swabActive = phase === 0 || phase === 2 || phase === 3;
    const loopActive = (phase === 4 || phase === 5) && !mission5Animating;
    const streakFile = m.streakStage === 1 ? "streak-pattern-stage-1.png" : m.streakStage === 2 ? "streak-pattern-stage-2.png" : m.streakStage >= 3 ? "streak-pattern-complete.png" : "";
    const zones = [1,2,3].map(zone => `<button class="m5-streak-zone zone-${zone} ${phase===5&&!mission5Animating&&zone===m.streakStage+1?"active":""} ${zone<=m.streakStage?"done":""}" data-action="m5-streak-zone" data-value="${zone}" data-drop="m5-streak" aria-label="Streak section ${zone}${zone<=m.streakStage?", complete":zone===m.streakStage+1?", next":""}" aria-disabled="${phase!==5||mission5Animating||zone!==m.streakStage+1}" ${mission5Animating?"disabled":""}><span>${zone}</span></button>`).join("");
    const streakMotion = mission5Animating && m.streakStage > 0 ? `<img class="m5-streak-motion motion-${m.streakStage}" src="assets/mission-5/sterile-loop-10ul.png" alt="" aria-hidden="true">` : "";
    const arrow = phase < 6 && !mission5Animating ? `<div class="m5-guidance arrow-${phase}" aria-hidden="true"><svg viewBox="0 0 180 80"><path d="M8 58 C55 8 110 8 158 46"/><path d="M145 30 L160 47 L137 51"/></svg><span>${arrowLabels[phase]}</span></div>` : "";
    const completion = phase === 6 && !mission5Animating ? `<div class="m5-completion" role="status" aria-live="polite"><div class="m5-completion-card"><p><strong>Excellent!</strong> The blood agar plate has been inoculated and streaked correctly.</p>${learning("Streaking spreads bacteria across the agar so that separate colonies can grow.","Each visible colony may grow from a single bacterium or a small group of bacteria.")}<div class="actions">${btn("Place in the incubator →","m5-next","coral")}</div></div></div>` : "";
    return shell(`<div class="mission-five-scene ${mission5Animating?"is-streaking":""}" aria-label="Blood agar inoculation workstation"><img class="mission-five-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-five-title"><div class="mission-label">Mission 5 of 10</div><h1>Streak the plate</h1><p>Create the starting area, then spread the material so separate colonies can grow.</p></div><div class="mission-five-prompt" role="status"><strong>Step ${Math.min(phase+1,6)} of 6</strong><span>${prompts[phase]}</span></div><div class="m5-countertop" aria-hidden="true"></div><button class="m5-swab ${swabActive?"active":""} ${m.selected==="swab"?"selected":""} ${m.swabClosed?"put-away":""}" data-action="${phase===0?"m5-open-swab":phase===3?"m5-close-swab":"m5-select-tool"}" data-value="swab" draggable="${phase===2}" data-drag="m5-pool" data-drag-image="assets/mission-5/throat-swab-applicator.png" data-drag-tip-x="0.15" data-drag-tip-y="0.86" aria-pressed="${m.selected==="swab"}" aria-label="${phase===0?"Open the throat-swab container":phase===3?"Return and close the throat swab":"Throat-swab applicator"}"><img src="assets/mission-5/${swabFile}" alt="">${m.swabOpen&&!m.swabClosed?`<img class="m5-swab-stick" src="assets/mission-5/throat-swab-applicator.png" alt="">`:""}<span>${phase===0?"Open the swab":phase===3?"Close the swab":"Throat swab"}</span></button><div class="m5-plate ${m.plateOpen?"open":""}"><button class="m5-plate-control ${phase===1?"active":""}" data-action="m5-open-plate" aria-label="Open the blood agar plate"><img class="m5-plate-base" src="assets/mission-5/${m.plateOpen?"blood-agar-plate-open.png":"blood-agar-plate-closed.png"}" alt="Blood agar plate"><img class="m5-plate-lid" src="assets/mission-5/blood-agar-lid.png" alt="" aria-hidden="true"></button>${m.inoculated?`<img class="m5-plate-overlay m5-pool" src="assets/mission-5/inoculation-pool-overlay.png" alt="">`:""}${streakFile?`<img class="m5-plate-overlay m5-streak-overlay" src="assets/mission-5/${streakFile}" alt="">`:""}${streakMotion}<button class="m5-pool-target ${phase===2||phase===4?"active":""}" data-action="m5-pool-target" data-drop="m5-pool" aria-label="${phase===2?"Starting area for the throat swab":phase===4?"Starting area for the 10 microlitre loop":"Starting inoculation area"}" ${phase===2||phase===4?"":"disabled"}><span>${phase===2?"Start here":phase===4?"Touch the starting area":"✓"}</span></button>${phase===5?`<div class="m5-streak-zones">${zones}</div>`:""}</div><button class="m5-loop ${loopActive?"active":""} ${m.selected==="loop"?"selected":""}" data-action="m5-select-tool" data-value="loop" draggable="${loopActive&&!mission5Animating}" data-drag="${phase===4?"m5-pool":"m5-streak"}" data-drag-image="assets/mission-5/sterile-loop-10ul.png" aria-pressed="${m.selected==="loop"}" aria-label="10 microlitre sterile loop"><img src="assets/mission-5/sterile-loop-10ul.png" alt=""><span>10 µL loop</span></button>${arrow}${completion}</div>`, prompts[phase]);
  }

  function mission6() {
    const m=state.mission6,phase=m6Phase();
    const prompts=["First, open the incubator.","Place the streaked blood agar plate on the highlighted shelf.","Close the incubator door.","Start the incubation.","The bacteria need time to grow.","Incubation is complete. Open the incubator.","Select the plate to inspect the bacterial growth.","What happened to the bacteria during incubation?","The culture is ready for Gram-stain preparation."];
    const labels=["Open the incubator","Place it here","Close the door","Start incubation","Incubating at 37°C…","Open and inspect","Inspect the plate","Choose an answer",""];
    const incubatorFile=phase===0?"incubator-closed.png":[1,2,6,7,8].includes(phase)?"incubator-open-empty.png":phase===3?"incubator-closed.png":"incubator-closed-active.png";
    const plateOnBench=phase<=1;
    const plateOnShelf=m.platePlaced&&(phase===2||phase===6);
    const grown=m.incubationComplete;
    const plateStack=(cls,interactive=false)=>`<${interactive?"button":"div"} class="m6-plate-stack ${cls} ${m.selected==="plate"?"selected":""}" ${interactive?`data-action="${phase<=1?"m6-select-plate":"m6-inspect"}" data-value="plate" draggable="true" data-drag="${phase<=1?"m6-shelf":"m6-inspect"}" data-drag-image="assets/mission-6/${grown?"incubated-blood-agar-plate.png":"streaked-blood-agar-plate.png"}" aria-pressed="${m.selected==="plate"}" aria-label="${grown?"Incubated blood agar plate with visible colonies":"Completed streaked blood agar plate"}"`:""}><img class="m6-plate-base" src="assets/mission-6/${grown?"incubated-blood-agar-plate.png":"streaked-blood-agar-plate.png"}" alt=""><img class="m6-streak-layer" src="assets/mission-5/streak-pattern-complete.png" alt="">${grown?`<img class="m6-colony-layer" src="assets/mission-6/colony-inspection-overlay.png" alt="">`:""}</${interactive?"button":"div"}>`;
    const incubatorAction=phase===0||phase===5?"m6-open":phase===2?"m6-close":phase===3?"m6-start":"m6-incubator";
    const arrow=phase<7?`<div class="m6-guidance guide-${phase}" aria-hidden="true"><svg viewBox="0 0 180 80"><path d="M8 58 C55 8 110 8 158 46"/><path d="M145 30 L160 47 L137 51"/></svg><span>${labels[phase]}</span></div>`:"";
    const answers=phase===7?`<div class="m6-question" role="group" aria-label="What happened to the bacteria during incubation?"><h2>What happened to the bacteria?</h2>${choice("💨","They disappeared","","growth","gone")}${choice("🦠","They grew into colonies","","growth","colonies")}${choice("🧬","They turned into viruses","","growth","viruses")}</div>`:"";
    const completion=phase===8?`<div class="m6-completion" role="status" aria-live="polite"><div class="m6-completion-card"><p><strong>Excellent!</strong> The incubated plate shows visible bacterial colonies.</p>${learning("Bacteria need suitable conditions, such as the right temperature and enough time, to grow.","A visible colony may develop from one bacterium or a small group of bacteria multiplying many times.")}<div class="actions">${btn("Prepare a Gram stain →","m6-next","coral")}</div></div></div>`:"";
    return shell(`<div class="mission-six-scene phase-${phase}" aria-label="Incubation workstation inside the bacteriology laboratory"><img class="mission-six-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-six-title"><div class="mission-label">Mission 6 of 10</div><h1>Into the incubator</h1><p>Bacteria need the right conditions and time to grow.</p></div><div class="mission-six-prompt" role="status"><strong>Step ${Math.min(phase+1,8)} of 8</strong><span>${prompts[phase]}</span></div><div class="m6-countertop" aria-hidden="true"></div>${plateOnBench?plateStack(`on-bench ${phase===1?"active":""}`,true):""}<div class="m6-incubator ${phase===4?"incubating":""}"><img src="assets/mission-6/${incubatorFile}" alt="${phase===0||phase===3||phase===4||phase===5?"Closed":"Open"} laboratory incubator set to 37 degrees Celsius"><button class="m6-incubator-control ${[0,2,3,5].includes(phase)?"active":""}" data-action="${incubatorAction}" aria-label="${labels[phase]||"Incubator"}"></button>${plateOnShelf?plateStack(`on-shelf ${phase===6?"active":""}`,phase===6):""}<button class="m6-shelf-target ${phase===1?"active":""}" data-action="m6-shelf" data-drop="m6-shelf" aria-label="Highlighted incubator shelf. Place the streaked plate here." ${phase===1?"":"disabled"}><span>Place it here</span></button></div>${phase===4?`<div class="m6-time-overlay" role="status"><div class="m6-night-light"></div><div class="m6-clock"><img src="assets/mission-6/laboratory-clock.png" alt="Laboratory clock showing time passing"><i aria-hidden="true"></i></div><strong>Incubating at 37°C…</strong>${btn("Skip time animation","m6-skip","secondary")}</div>`:""}${phase===6?`<button class="m6-inspect-target" data-action="m6-inspect" data-drop="m6-inspect" aria-label="Inspection area for the incubated plate">Inspect the plate</button>`:""}${m.inspected?plateStack("inspection",false):""}${answers}${arrow}${completion}</div>`,prompts[phase]);
  }

  function mission7() {
    const m=state.mission7,phase=m7Phase();
    const prompts=[
      "Add one drop of distilled water to the centre of the microscope slide.",
      "Select the sterile 1 µL loop.",
      "Use the loop to select one isolated colony from the incubated plate.",
      "Move the colony into the water drop on the slide.",
      "Spread the bacteria through the water to make a thin smear.",
      "Allow the smear to air-dry before heat fixation.",
      "Air-drying…",
      "Light the Bunsen burner.",
      "Pass the dried slide carefully above the flame to heat-fix the smear.",
      "The prepared slide is ready for Gram staining."
    ];
    const stepNumber=[1,2,3,4,5,6,6,7,7,7][phase];
    const slideFile=m.heatFixed?"microscope-slide-heat-fixed.png":m.dryingComplete?"microscope-slide-smear-dry.png":m.wetSmearComplete?"microscope-slide-smear-wet.png":m.colonyTransferred?"microscope-slide-colony-in-water.png":m.waterAdded?"microscope-slide-water-drop.png":"microscope-slide-clean.png";
    const slideActive=[0,3,4,5,8].includes(phase);
    const loopActive=[1,2,3,4].includes(phase);
    const guideLabels=["Add one drop","Select the 1 µL loop","Choose one colony","Transfer the colony","Spread a thin smear","Leave the slide to dry","Air-drying…","Light the burner","Pass above the flame",""];
    const guidance=phase<9?`<div class="m7-guidance guide-${phase}" aria-hidden="true"><svg viewBox="0 0 190 90"><path d="M8 65 C58 8 124 8 168 51"/><path d="M153 35 L170 52 L145 57"/></svg><span>${guideLabels[phase]}</span></div>`:"";
    const smearZones=phase===4?[1,2,3].map(i=>`<button class="m7-smear-zone zone-${i} ${i===m.smearStage+1?"active":i<=m.smearStage?"done":""}" data-action="m7-smear-zone" data-value="${i}" data-drop="m7-smear" aria-label="Smear guidance zone ${i} of 3" ${i===m.smearStage+1?"":"disabled"}><span>${i<=m.smearStage?"✓":i}</span></button>`).join(""):"";
    const heatZones=phase===8?[1,2,3].map(i=>`<button class="m7-heat-zone zone-${i} ${i===m.heatPass+1?"active":i<=m.heatPass?"done":""}" data-action="m7-heat-zone" data-value="${i}" data-drop="m7-heat" aria-label="Heat-fix pass ${i} of 3 above the flame" ${i===m.heatPass+1?"":"disabled"}><span>${i<=m.heatPass?"✓":i}</span></button>`).join(""):"";
    const colonies=phase===2?`<div class="m7-colony-targets" role="group" aria-label="Choose an isolated colony"><button class="m7-colony-target isolated one" data-action="m7-colony" data-value="isolated-1" data-drop="m7-colony" aria-label="Isolated colony one"></button><button class="m7-colony-target isolated two" data-action="m7-colony" data-value="isolated-2" data-drop="m7-colony" aria-label="Isolated colony two"></button><button class="m7-colony-target crowded" data-action="m7-colony" data-value="crowded" data-drop="m7-colony" aria-label="Crowded area of bacterial growth"></button></div>`:"";
    const completion=phase===9?`<div class="m7-completion" role="status" aria-live="polite"><div class="m7-completion-card"><p><strong>Excellent!</strong> The bacterial smear is prepared and ready for Gram staining.</p>${learning("We prepare bacteria on a slide so that we can examine them under a microscope.","Heat fixation helps attach the dried bacterial smear to the slide before staining.")}<div class="actions">${btn("Start the Gram stain →","m7-next","coral")}</div></div></div>`:"";
    return shell(`<div class="mission-seven-scene phase-${phase}" aria-label="Bacterial smear preparation workstation"><img class="mission-seven-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-seven-title"><div class="mission-label">Mission 7 of 10</div><h1>Prepare the slide</h1><p>Make a thin bacterial smear for Gram staining.</p></div><div class="mission-seven-prompt" role="status" aria-live="polite"><strong>Step ${stepNumber} of 7</strong><span>${prompts[phase]}</span></div><div class="m7-countertop" aria-hidden="true"></div><div class="m7-plate ${phase>2?"picked":""}" aria-label="Incubated blood agar plate"><img src="assets/mission-7/incubated-blood-agar-plate.png" alt=""><img src="assets/mission-5/streak-pattern-complete.png" alt=""><img src="assets/mission-7/${phase>2?"colony-picked-overlay.png":"selectable-colony-overlay.png"}" alt="">${colonies}</div><button class="m7-dropper ${phase===0?"active":""} ${m.selected==="dropper"?"selected":""}" data-action="m7-select-dropper" data-value="dropper" draggable="${phase===0}" data-drag="m7-water" data-drag-image="assets/mission-7/distilled-water-dropper.png" aria-pressed="${m.selected==="dropper"}" aria-label="Distilled-water dropper"><img src="assets/mission-7/distilled-water-dropper.png" alt=""><span>Select distilled water</span></button><button class="m7-loop ${loopActive?"active":""} ${m.loopSelected?"selected":""} ${m.colonySelected?"loaded":""}" data-action="m7-select-loop" data-value="loop" draggable="${[2,3,4].includes(phase)}" data-drag="${phase===2?"m7-colony":phase===3?"m7-transfer":"m7-smear"}" data-drag-image="assets/mission-7/${m.colonySelected?"loop-with-colony.png":"sterile-loop-1ul.png"}" aria-pressed="${m.loopSelected}" aria-label="Sterile 1 microlitre loop${m.colonySelected?" carrying one colony":""}"><img src="assets/mission-7/${m.colonySelected?"loop-with-colony.png":"sterile-loop-1ul.png"}" alt=""><span>1 µL loop</span></button><button class="m7-slide ${slideActive?"active":""} ${m.selected==="slide"?"selected":""} ${m.dryingStarted&&!m.dryingComplete?"on-rack":""} ${m.heatFixed?"heat-fixed":""}" data-action="m7-slide" data-value="slide" draggable="${phase===5||phase===8}" data-drag="${phase===5?"m7-rack":"m7-heat"}" data-drag-image="assets/mission-7/${slideFile}" aria-pressed="${m.selected==="slide"}" aria-label="${m.heatFixed?"Completed heat-fixed microscope slide":m.dryingComplete?"Dry bacterial smear on microscope slide":m.wetSmearComplete?"Wet bacterial smear on microscope slide":"Microscope slide"}"><img src="assets/mission-7/${slideFile}" alt=""></button><button class="m7-water-target ${phase===0||phase===3?"active":""}" data-action="${phase===0?"m7-water":phase===3?"m7-transfer":"m7-wrong"}" data-drop="${phase===0?"m7-water":"m7-transfer"}" aria-label="${phase===0?"Centre target for one drop of distilled water":"Water-drop transfer target"}" ${phase===0||phase===3?"":"disabled"}><span>${phase===0?"Add one drop":"Transfer here"}</span></button>${smearZones}<div class="m7-rack ${m.selected==="slide"?"ready":""}"><img src="assets/mission-7/slide-rack.png" alt="Slide drying rack"><button class="m7-rack-target ${phase===5?"active":""} ${m.selected==="slide"?"ready":""}" data-action="m7-rack" data-drop="m7-rack" aria-label="Safe slide rack for air-drying" ${phase===5?"":"disabled"}><span>Leave the slide to dry</span></button></div><button class="m7-burner ${phase===7?"active":""}" data-action="m7-burner" aria-pressed="${m.burnerLit}" aria-label="${m.burnerLit?"Lit Bunsen burner with a controlled blue flame":"Light the Bunsen burner"}"><img src="assets/mission-7/${m.burnerLit?"bunsen-burner-lit.png":"bunsen-burner-unlit.png"}" alt=""><i class="m7-flame" aria-hidden="true"></i><span>${phase===7?"Light the burner":"Bunsen burner"}</span></button>${heatZones}${phase===6?`<div class="m7-drying" role="status"><strong>Air-drying…</strong><span aria-hidden="true">≈ ≈ ≈</span>${btn("Skip drying animation","m7-skip-drying","secondary")}</div>`:""}${phase===0?`<img class="m7-droplet" src="assets/mission-7/distilled-water-drop.png" alt="" aria-hidden="true">`:""}${guidance}${completion}</div>`,prompts[phase]);
  }

  function gramChecklist() {
    return `<ol class="m8-checklist" aria-label="Gram-stain checklist">${L.GRAM_STEPS.map((step,i)=>`<li class="${i<state.gram.step?"done":i===state.gram.step&&!state.gram.complete?"current":""}" ${i===state.gram.step&&!state.gram.complete?'aria-current="step"':""}><span>${i<state.gram.step?"✓":i+1}</span><b>${step.title}</b>${step.seconds?`<small>${step.seconds} seconds</small>`:""}</li>`).join("")}</ol>`;
  }
  function gramButtons() {
    const bottles=[["violet","Crystal violet","crystal-violet-bottle.png"],["water","Water","wash-bottle.png"],["iodine","Lugol’s iodine","lugols-iodine-bottle.png"],["decolorizer","Decolorizer","decolorizer-bottle.png"],["fuchsin","Carbol fuchsin","carbol-fuchsin-bottle.png"]];
    const correct=(L.GRAM_STEPS[state.gram.step]||{}).bottle;
    return `<div class="m8-bottles">${bottles.map(b=>`<button class="m8-bottle ${correct===b[0]?"active":""} ${state.gram.selected===b[0]?"selected":""}" data-action="gram-bottle" data-value="${b[0]}" draggable="${state.gram.mode==="manual"&&!state.gram.running&&!state.gram.complete}" data-drag="m8-slide" data-drag-image="assets/mission-8/${b[2]}" aria-pressed="${state.gram.selected===b[0]}" aria-label="${b[1]} bottle${correct===b[0]?", suggested for the current step":""}" ${state.gram.mode!=="manual"||state.gram.complete?"disabled":""}><img src="assets/mission-8/${b[2]}" alt=""><span>${b[1]}</span></button>`).join("")}</div>`;
  }
  function gramSlideFile(){
    if(state.gram.complete)return "slide-gram-stain-complete.png";
    const after=["slide-heat-fixed.png","slide-crystal-violet.png","slide-crystal-violet-rinsed.png","slide-iodine.png","slide-iodine-rinsed.png","slide-decolorizing.png","slide-decolorized-rinsed.png","slide-carbol-fuchsin.png"];
    const active=["slide-crystal-violet.png","slide-crystal-violet-rinsed.png","slide-iodine.png","slide-iodine-rinsed.png","slide-decolorizing.png","slide-decolorized-rinsed.png","slide-carbol-fuchsin.png","slide-gram-stain-complete.png"];
    return (state.gram.running?active:after)[Math.min(state.gram.step,7)];
  }
  function gramPrompt(){
    const prompts=["Apply crystal violet to cover the heat-fixed smear.","Rinse the slide gently with water.","Apply Lugol’s iodine to the smear.","Rinse the slide gently with water.","Apply the decolorizer carefully.","Rinse immediately with water to stop the decolorizer.","Apply carbol fuchsin as the counterstain.","Give the slide its final gentle water rinse."];
    return prompts[Math.min(state.gram.step,7)];
  }
  function mission8() {
    if (!state.gram.mode) return shell(`<div class="mission-eight-scene intro" aria-label="Gram-staining laboratory workstation"><img class="mission-eight-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="m8-countertop" aria-hidden="true"></div><div class="m8-intro" role="dialog" aria-labelledby="m8-intro-title"><div class="mission-label">Mission 8 of 10</div><h1 id="m8-intro-title">The Gram stain</h1><p>Gram staining uses a sequence of stains and rinses to help us examine bacteria.</p><div class="m8-mode-grid"><button class="m8-mode" data-action="gram-mode" data-value="manual"><strong>Guide me through it</strong><span>You choose each reagent and follow every step.</span></button><button class="m8-mode" data-action="gram-mode" data-value="auto"><strong>Show the automatic procedure</strong><span>Watch the correct procedure with explanations.</span></button></div></div></div>`, "Choose guided practice or the automatic demonstration. Both use the same scientific order and timings.");
    const step=L.GRAM_STEPS[state.gram.step] || L.GRAM_STEPS[7];
    const isRinse=step.bottle==="water";
    const drop={violet:"violet",water:"clear",iodine:"iodine",decolorizer:"decolorizer",fuchsin:"fuchsin"}[step.bottle];
    const timing=step.seconds?`${step.title} — ${step.seconds} seconds`:step.key==="rinse3"?"Rinse now":"Rinse gently";
    const timerText=String(Math.max(0,state.gram.timerRemaining||step.seconds)).padStart(2,"0");
    const guidance=state.gram.complete?"":`<div class="m8-guidance" aria-hidden="true"><svg viewBox="0 0 180 90"><path d="M8 18 C62 4 98 76 166 50"/><path d="m151 39 16 11-18 8"/></svg><span>${isRinse?(step.key==="rinse3"?"Rinse now":"Rinse gently"):"Apply to the smear"}</span></div>`;
    const completion=state.gram.complete?`<div class="m8-completion" role="status" aria-live="polite"><div class="m8-completion-card"><p><strong>Excellent!</strong> You completed the Gram stain in the correct order.</p>${learning("Gram staining helps us see and classify bacteria. Gram-positive bacteria stain purple, while Gram-negative bacteria stain pink.","The colour difference happens because Gram-positive and Gram-negative bacteria have different cell-envelope structures.")}<div class="actions">${state.gram.mode==="auto"?btn("Replay procedure","gram-replay","secondary"):""}${btn("View under the microscope →","m8-next","coral")}</div></div></div>`:"";
    return shell(`<div class="mission-eight-scene mode-${state.gram.mode} step-${state.gram.step} ${state.gram.running?"running":""}" aria-label="Gram-staining laboratory workstation"><img class="mission-eight-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-eight-title"><div class="mission-label">Mission 8 of 10</div><h1>The Gram stain</h1><p>${state.gram.mode==="auto"?"Automatic demonstration":"Guided manual mode"}</p></div><div class="mission-eight-prompt" role="status" aria-live="polite"><strong>Step ${Math.min(state.gram.step+1,8)} of 8</strong><span>${state.gram.complete?"The Gram stain is complete!":gramPrompt()}</span><em>${timing}</em></div><div class="m8-countertop" aria-hidden="true"></div>${gramButtons()}<div class="m8-workstation"><button class="m8-slide-target ${state.gram.selected?"ready":""}" data-action="gram-slide" data-drop="m8-slide" aria-label="Microscope slide application target"><img src="assets/mission-8/${gramSlideFile()}" alt="${state.gram.complete?"Completed Gram-stained microscope slide":"Microscope slide at the current Gram-stain stage"}"></button>${state.gram.running?`<img class="m8-drop drop-${drop}" src="assets/mission-8/reagent-drop-${drop}.png" alt="" aria-hidden="true">${isRinse?`<i class="m8-water-stream" aria-hidden="true"></i>`:""}`:""}</div>${guidance}<aside class="m8-checklist-panel"><h2>Gram-stain checklist</h2>${gramChecklist()}</aside>${state.gram.running&&step.seconds?`<div class="m8-timer" role="timer" aria-label="${step.title} timer"><span>${timerText}</span><small>scientific seconds</small>${btn("Skip time animation","gram-skip-time","secondary")}</div>`:""}<div class="m8-controls">${state.gram.mode==="auto"&&!state.gram.complete?(state.gram.paused?btn("Resume","gram-resume"):btn("Pause","gram-pause","secondary"))+btn("Switch to guided mode","gram-switch","secondary"):""}</div>${completion}</div>`, "Follow the highlighted reagent and the eight-step checklist.");
  }

  function mission9() {
    const m=state.mission9;
    if (!m.placed) {
      return shell(`<div class="mission-nine-scene placement" aria-label="Microscope workstation inside the bacteriology laboratory"><img class="mission-nine-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-nine-title"><div class="mission-label">Mission 9 of 10</div><h1>Look under the microscope</h1><p>Your completed Gram-stained slide is ready.</p></div><div class="mission-nine-prompt" role="status" aria-live="polite"><strong>Step 1 of 2</strong><span>Place the completed Gram-stained slide onto the microscope stage.</span></div><div class="m9-countertop" aria-hidden="true"></div><img class="m9-microscope" src="assets/mission-9/compound-microscope-empty.png" alt="Binocular microscope with an empty stage"><button class="m9-slide ${m.selected?"selected":""}" data-action="m9-select-slide" data-value="slide" draggable="true" data-drag="m9-stage" data-drag-image="assets/mission-9/gram-stained-slide-draggable.png" aria-pressed="${m.selected}" aria-label="Completed Gram-stained slide. Select it, then choose the microscope stage."><img src="assets/mission-9/gram-stained-slide-draggable.png" alt=""><span>Select the slide</span></button><button class="m9-stage-target ${m.selected?"ready":""}" data-action="m9-place-slide" data-drop="m9-stage" aria-label="Empty microscope stage, slide placement target"><img src="assets/mission-9/microscope-stage-closeup-empty.png" alt=""><span>Place slide here</span></button><div class="m9-guidance" aria-hidden="true"><svg viewBox="0 0 220 100"><path d="M10 72 C65 12 136 12 198 58"/><path d="M181 40 L201 59 L173 65"/></svg><span>Move the slide to the stage</span></div></div>`, "Select the stained slide, then place it on the highlighted microscope stage.");
    }
    if (!m.focusComplete) {
      return shell(`<div class="mission-nine-scene focusing" aria-label="Focusing the microscope"><img class="mission-nine-background m9-zoom-background" src="assets/mission-2/laboratory-interior-background.png" alt=""><div class="m9-countertop" aria-hidden="true"></div><img class="m9-microscope placed" src="assets/mission-9/compound-microscope-with-slide.png" alt="Microscope with the Gram-stained slide secured on its stage"><div class="m9-focus-view" role="status" aria-live="polite"><img class="m9-focus-soft" src="assets/mission-9/microscope-focus-soft.png" alt=""><img class="m9-focus-sharp" src="assets/mission-9/microscope-focus-sharp.png" alt=""><img class="m9-eyepiece" src="assets/mission-9/microscope-eyepiece-overlay.png" alt=""><strong>Focusing the microscope…</strong><span>The view is becoming clear.</span></div><div class="m9-focus-control">${btn("Skip focus animation","m9-skip-focus","secondary")}</div></div>`, "The slide is secure. Focus the view before comparing the bacteria.");
    }
    const opts=[
      ["pink","Pink rods","microscopy-field-pink-rods.png"],
      ["prods","Purple rods","microscopy-field-purple-rods.png"],
      ["chains","Purple cocci in chains","microscopy-field-purple-cocci-chains.png"],
      ["clusters","Purple cocci in clusters","microscopy-field-purple-cocci-clusters.png"]
    ];
    const completion=m.complete?`<div class="m9-completion" role="dialog" aria-modal="true" aria-labelledby="m9-complete-title"><div class="m9-completion-card"><p id="m9-complete-title"><strong>Excellent!</strong> These Gram-positive cocci in chains are consistent with streptococci.</p><div class="m9-clues" aria-label="Microscopy clues"><span><b>Purple</b> colour</span><span><b>Round</b> shape</span><span><b>Chain</b> arrangement</span></div>${learning("These are Gram-positive cocci arranged in chains. This appearance is consistent with streptococci.","Their purple colour, round shape and chain arrangement help us recognise them as streptococci, but species identification needs another test.")}<div class="actions">${btn("Identify the species →","m9-next","coral")}</div></div></div>`:"";
    return shell(`<div class="mission-nine-scene comparison" aria-label="Microscope field comparison"><div class="m9-micro-background"></div><div class="mission-nine-title"><div class="mission-label">Mission 9 of 10</div><h1>Look under the microscope</h1><p>Compare colour, shape and arrangement.</p></div><div class="mission-nine-prompt" role="status" aria-live="polite"><strong>Step 2 of 2</strong><span>Which picture shows the bacteria we are looking for?</span></div><div class="m9-field-grid" role="group" aria-label="Microscopic appearance choices">${opts.map(([value,label,file])=>{const wrong=m.attempts.includes(value),selected=m.selectedAnswer===value;return `<button class="m9-field-choice ${wrong?"wrong":""} ${selected?"selected":""}" data-action="m9-answer" data-value="${value}" aria-pressed="${selected}" aria-label="${label}"><img src="assets/mission-9/${file}" alt=""><strong>${label}</strong>${wrong?'<small>Try again</small>':""}</button>`;}).join("")}</div><p class="m9-comparison-hint">Look carefully at all three clues: colour, shape and arrangement.</p>${completion}</div>`, "Look carefully at all three clues: purple colour, round shape and chain arrangement.");
  }

  function mission10() {
    const s=state.mission10.step;
    const steps=["Select the 1 µL loop.","Choose one colony.","Place the bacteria onto a spot on the MALDI target plate.","Select the pipette.","Draw matrix solution into the pipette.","Place matrix over the bacteria spot.","Load the MALDI target plate into the MALDI-TOF.","Analysing the bacterial protein pattern…","Identification complete"];
    const actions=["Select 1 µL loop","Pick a single colony","Spot the MALDI target plate","Select pipette","Draw matrix solution","Add matrix to spot","Load MALDI target plate","Start analysis"];
    const complete=s>=8;
    return shell(`${missionHeader(10,"The final mystery","Microscopy gave us clues. Now use MALDI-TOF to identify the bacterium to species level.")}<div class="instruction"><strong>${complete?"Result":`Step ${s+1}`}:</strong> ${steps[s]}</div><div class="maldi"><div class="maldi-screen"><strong>MALDI-TOF</strong>${complete?`<h2>IDENTIFICATION COMPLETE</h2><p>Bacterial identification: MATCH FOUND</p><h2><i>Streptococcus pyogenes</i></h2>`:`<div class="target" aria-label="MALDI target plate">${Array.from({length:12},(_,i)=>`<span class="spot ${s>=3&&i===5?"filled":""}"></span>`).join("")}</div><p>${s>=7?"Comparing bacterial protein pattern…":"Instrument ready"}</p>`}</div></div><div class="actions">${!complete?btn(actions[s],"maldi-step",s>=6?"coral":""):btn("Complete the journey","complete-10","coral")}</div>${feedback()}`, "Use one colony, spot it on the MALDI target plate, add matrix, then load the target plate into the instrument.");
  }

  function summary() {
    const items=["🧪 Collected the right specimen","📋 Matched the patient details","🧫 Selected the culture medium","〰️ Streaked the bacteria","🌡️ Incubated the culture","🔬 Prepared the microscope slide","🟣 Performed a Gram stain","👀 Examined the bacteria","🧬 Identified the mystery bacterium"];
    return shell(`<span class="complete-badge">✓ Journey complete</span><h1>Congratulations,<br>Junior Bacteriologist!</h1><p class="lede">You followed Amelia Galea’s throat swab from reception to a final species identification.</p><ul class="summary-list">${items.map(i=>`<li>${i}</li>`).join("")}</ul><div class="learning"><strong>You identified <i>Streptococcus pyogenes</i>!</strong><br><br>Bacteriologists use many different tests and clues to identify bacteria that can cause infections.</div><div class="actions"><a class="btn secondary" href="../../">Return to Game Hub</a>${btn("Review the journey","review","secondary")}${btn("Start a new case","new-case","coral")}</div>`, "Excellent laboratory work. You checked identity, followed each scientific step and waited for MALDI-TOF before naming the species.");
  }

  function render() {
    clearTimeout(timer);
    clearTimeout(gramAutoTimer);
    clearTimeout(mission6Timer);
    clearTimeout(mission7Timer);
    clearTimeout(mission9Timer);
    if (!state.age || state.mission===0) app.innerHTML=startScreen();
    else if(state.mission===11) app.innerHTML=summary();
    else app.innerHTML=({1:mission1,2:mission2,3:mission3,4:mission4,5:mission5,6:mission6,7:mission7,8:mission8,9:mission9,10:mission10}[state.mission]||mission1)();
    bindDrag();
    if(!orientationBlocked&&state.mission===8&&state.gram.running&&!state.gram.paused&&!state.gram.complete) scheduleGramTick();
    else if(!orientationBlocked&&state.mission===8&&state.gram.mode==="auto"&&!state.gram.paused&&!state.gram.complete) scheduleGramAuto();
    if(!orientationBlocked&&state.mission===6&&state.mission6.incubationStarted&&!state.mission6.incubationComplete) scheduleMission6Incubation();
    if(!orientationBlocked&&state.mission===7&&state.mission7.dryingStarted&&!state.mission7.dryingComplete) scheduleMission7Drying();
    if(!orientationBlocked&&state.mission===9&&state.mission9.transitionStarted&&!state.mission9.focusComplete) scheduleMission9Focus();
  }

  function resetGram(mode) { clearTimeout(timer);clearTimeout(gramAutoTimer);state.gram={...L.initialState().gram,mode};timerCounter=0;state.feedback="";state.feedbackType="";save();render(); }
  function advanceGram() {
    const finished=L.GRAM_STEPS[state.gram.step];
    state.gram.running=false;state.gram.selected=null;state.gram.timerRemaining=0;state.gram.timerTotal=0;
    if(state.gram.step>=L.GRAM_STEPS.length-1){state.gram.step=L.GRAM_STEPS.length;state.gram.complete=true;if(!state.completed.includes(8))state.completed.push(8);state.feedback="The Gram stain is complete! The slide is ready for microscopy.";state.feedbackType="good";}
    else {state.gram.step+=1;state.feedback=finished.message;state.feedbackType="good";}
    save(); render();
  }
  function scheduleGramAuto() {
    if(state.gram.step>=L.GRAM_STEPS.length){state.gram.complete=true;save();render();return;}
    gramAutoTimer=setTimeout(()=>startGramStep(L.GRAM_STEPS[state.gram.step].bottle),reducedMotion?30:350);
  }
  function startGramStep(value){
    const step=L.GRAM_STEPS[state.gram.step];
    if(value!==step.bottle){setFeedback("Not quite — check the next step on the checklist.","try");return;}
    state.gram.selected=null;state.gram.running=true;state.gram.timerTotal=step.seconds;state.gram.timerRemaining=reducedMotion&&step.seconds?1:step.seconds;state.gram.visualSkipped=false;state.feedback=step.message;state.feedbackType="good";save();render();
  }
  function scheduleGramTick(){
    const step=L.GRAM_STEPS[state.gram.step];
    if(!step){advanceGram();return;}
    if(!step.seconds){timer=setTimeout(advanceGram,reducedMotion?40:520);return;}
    timer=setTimeout(()=>{if(orientationBlocked||state.gram.paused)return;state.gram.timerRemaining=Math.max(0,state.gram.timerRemaining-1);timerCounter=state.gram.timerRemaining;save();if(state.gram.timerRemaining<=0)advanceGram();else{const counter=document.querySelector(".m8-timer>span");if(counter)counter.textContent=String(state.gram.timerRemaining).padStart(2,"0");scheduleGramTick();}},reducedMotion?1:35);
  }
  function applyManualBottle(value) {
    const step=L.GRAM_STEPS[state.gram.step];
    if(state.gram.running)return;
    if(value!==step.bottle){setFeedback("Not quite—check the next step on the Gram-stain checklist.","try");return;}
    state.gram.selected=state.gram.selected===value?null:value;state.feedback=state.gram.selected?`${step.title} selected. Apply it to the highlighted slide.`:`${step.title} deselected.`;state.feedbackType=state.gram.selected?"good":"";save();render();
  }

  function m9Update(message,type="good"){
    state.feedback=message;state.feedbackType=type;save();announce(message);render();
  }
  function m9Wrong(message="Place the Gram-stained slide carefully onto the microscope stage."){
    m9Update(message,"try");
  }
  function m9PlaceSlide(fromDrag=false,value=""){
    const m=state.mission9;
    if(m.placed||(fromDrag?value!=="slide":!m.selected)){m9Wrong();return;}
    m.selected=false;m.placed=true;m.transitionStarted=true;m.focusComplete=false;m.focusSkipped=false;
    m9Update("Slide placed. Now look through the microscope.");
  }
  function scheduleMission9Focus(){
    clearTimeout(mission9Timer);
    mission9Timer=setTimeout(()=>{
      if(state.mission!==9||orientationBlocked||state.mission9.focusComplete)return;
      state.mission9.focusComplete=true;
      state.feedback="The microscopic fields are in focus. Compare the colour, shape and arrangement.";
      state.feedbackType="good";
      save();announce(state.feedback);render();
    },reducedMotion?30:1650);
  }
  function m9Answer(value){
    const m=state.mission9;
    if(!m.focusComplete){m9Wrong("Finish focusing the microscope before comparing the fields.");return;}
    m.selectedAnswer=value;
    if(value==="chains"){
      m.complete=true;
      if(!state.completed.includes(9))state.completed.push(9);
      state.feedback="Excellent! These Gram-positive cocci in chains are consistent with streptococci.";
      state.feedbackType="good";
      save();announce(state.feedback);render();
      setTimeout(()=>document.querySelector('[data-action="m9-next"]')?.focus(),0);
      return;
    }
    if(!m.attempts.includes(value))m.attempts.push(value);
    m9Update("Not quite. Look carefully at the colour, shape and arrangement. Try again!","try");
  }

  function findDragTarget(source,dropType,clientX,clientY,visualWidth=110,visualHeight=110){
    const tipX=Number(source.dataset.dragTipX),tipY=Number(source.dataset.dragTipY);
    const tip=Number.isFinite(tipX)&&Number.isFinite(tipY)?{x:tipX,y:tipY}:null;
    return [...document.querySelectorAll(`[data-drop='${dropType}']`)].find(el=>{
      const rect=el.getBoundingClientRect();
      return L.dragTouchesRect(
        {x:clientX,y:clientY},
        {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},
        {width:visualWidth,height:visualHeight},
        tip
      );
    });
  }
  function completeDrop(value,dropType,target){
    if(!target)return;
    if(dropType==="ppe")handlePpe(value);
    if(dropType==="rack")rackSample(true);
    if(dropType.startsWith("m5-"))handleM5Drop(value,target.dataset.drop,target.dataset.value);
    if(dropType.startsWith("m6-"))handleM6Drop(value,target.dataset.drop);
    if(dropType.startsWith("m7-"))handleM7Drop(value,target.dataset.drop,target.dataset.value);
    if(dropType==="m8-slide")startGramStep(value);
    if(dropType==="m9-stage")m9PlaceSlide(true,value);
  }
  function bindDrag(){
    document.querySelectorAll("[draggable=true]").forEach(el=>{
      el.addEventListener("dragstart",ev=>{
        ev.dataTransfer.setData("text/plain",el.dataset.value);
        ev.dataTransfer.effectAllowed="move";
        const ghost=document.createElement("img");
        ghost.src=el.dataset.dragImage||el.querySelector("img")?.src||"";
        ghost.className="native-drag-image"; document.body.appendChild(ghost);
        ev.dataTransfer.setDragImage(ghost,55,55);
        activeNativeDrag={source:el,handled:false,x:ev.clientX,y:ev.clientY,width:110,height:110};
        setTimeout(()=>ghost.remove(),0);
      });
      el.addEventListener("drag",ev=>{
        if(activeNativeDrag?.source===el&&(ev.clientX!==0||ev.clientY!==0)){
          activeNativeDrag.x=ev.clientX;activeNativeDrag.y=ev.clientY;
        }
      });
      el.addEventListener("dragend",ev=>{
        if(activeNativeDrag?.source!==el)return;
        const drag=activeNativeDrag;
        const clientX=ev.clientX!==0||ev.clientY!==0?ev.clientX:drag.x;
        const clientY=ev.clientX!==0||ev.clientY!==0?ev.clientY:drag.y;
        activeNativeDrag=null;
        if(drag.handled)return;
        const dropType=el.dataset.drag;
        const target=findDragTarget(el,dropType,clientX,clientY,drag.width,drag.height);
        completeDrop(el.dataset.value,dropType,target);
        if(!target&&dropType==="m9-stage")m9Wrong();
      });
      el.addEventListener("pointerdown",beginTouchDrag);
    });
    document.querySelectorAll("[data-drop]").forEach(el=>{el.addEventListener("dragover",ev=>ev.preventDefault());el.addEventListener("drop",ev=>{ev.preventDefault();const v=ev.dataTransfer.getData("text/plain");if(activeNativeDrag)activeNativeDrag.handled=true;completeDrop(v,el.dataset.drop,el);});});
  }
  function beginTouchDrag(ev){
    if(ev.pointerType==="mouse")return;
    const source=ev.currentTarget,value=source.dataset.value;
    let moved=false,ghost=null;
    try { source.setPointerCapture?.(ev.pointerId); } catch (_) { /* Synthetic and older touch events may not expose capture. */ }
    const move=event=>{
      if(!moved){moved=true;ghost=document.createElement("img");ghost.className="ppe-drag-ghost";ghost.src=source.dataset.dragImage||source.querySelector("img").src;document.body.appendChild(ghost);}
      event.preventDefault();ghost.style.left=`${event.clientX}px`;ghost.style.top=`${event.clientY}px`;
    };
    const finish=event=>{
      source.removeEventListener("pointermove",move);source.removeEventListener("pointerup",finish);source.removeEventListener("pointercancel",finish);
      const ghostRect=ghost?.getBoundingClientRect();ghost?.remove();
      if(moved){const dropType=source.dataset.drag;const target=findDragTarget(source,dropType,event.clientX,event.clientY,ghostRect?.width||110,ghostRect?.height||110);completeDrop(value,dropType,target);if(!target&&dropType==="m9-stage")m9Wrong();}
    };
    source.addEventListener("pointermove",move);source.addEventListener("pointerup",finish);source.addEventListener("pointercancel",finish);
  }
  function selectPpe(value){
    if(!["coat","gloves"].includes(value)){state.selectedPpe=null;setFeedback("Not quite! We don’t need this item for this task. Try again!","try");return;}
    state.selectedPpe=value;
    setFeedback(value==="coat"?"Lab coat selected. Now choose the scientist to put it on.":"A pair of blue gloves is selected. Now choose the scientist to put them on.");
  }
  function handlePpe(value){
    if(["coat","gloves"].includes(value)){if(!state.ppe.includes(value))state.ppe.push(value);state.selectedPpe=null;setFeedback(value==="coat"?"Great choice! A lab coat helps protect our clothes and skin.":"Correct! Gloves help protect our hands from samples and microorganisms.","good");}
    else setFeedback("Not quite! We don’t need this item for this task. Try again!","try");
  }
  function rackSample(fromDrag = false){
    if(state.matching.accepted==null)return;
    if(!fromDrag&&!state.matching.sampleSelected){setFeedback("Select the accepted throat swab first, then select the receiving rack.");return;}
    state.matching.sampleSelected=false;state.matching.racked=true;setFeedback("Scanned! The existing patient label is now linked to the bacteriology accession record.","good");
  }
  function m5Phase(){
    const m=state.mission5;
    return !m.swabOpen?0:!m.plateOpen?1:!m.inoculated?2:!m.swabClosed?3:!m.loopLoaded?4:m.streakStage<3?5:6;
  }
  function m5Update(message,type="good"){
    state.feedback=message;state.feedbackType=type;save();announce(message);render();
  }
  function m5Wrong(){
    const prompts=["Open the throat-swab container first.","Open the blood agar plate next.","Select the throat swab, then choose the highlighted starting area.","Close the throat swab safely before using the loop.","Select the 10 µL loop, then choose the highlighted starting area.","Follow the numbered streak sections in order.","The plate is ready for the incubator."];
    m5Update(`Not yet. ${prompts[m5Phase()]}`,"try");
  }
  function m5SelectTool(value){
    const phase=m5Phase();
    if((phase===2&&value!=="swab")||((phase===4||phase===5)&&value!=="loop")||![2,4,5].includes(phase)){m5Wrong();return;}
    state.mission5.selected=value;
    m5Update(value==="swab"?"Throat swab selected. Now choose the highlighted starting area.":phase===4?"10 µL loop selected. Now touch the highlighted starting area.":"Loop selected. Follow the next numbered streak section.");
  }
  function m5Pool(fromDrag=false,value=""){
    const phase=m5Phase(),m=state.mission5;
    if(phase===2&&(fromDrag?value==="swab":m.selected==="swab")){
      m.inoculated=true;m.step=3;m.selected=null;m5Update("Good! You created a small starting area on the agar.");return;
    }
    if(phase===4&&(fromDrag?value==="loop":m.selected==="loop")){
      m.loopLoaded=true;m.step=5;m.selected="loop";m5Update("The loop has collected material from the starting area.");return;
    }
    m5Wrong();
  }
  function m5Streak(zone,fromDrag=false,value=""){
    const m=state.mission5,next=m.streakStage+1;
    if(mission5Animating)return;
    if(m5Phase()!==5||(!fromDrag&&m.selected!=="loop")||(fromDrag&&value!=="loop")||Number(zone)!==next){m5Wrong();return;}
    m.streakStage=next;m.step=5+next;
    state.feedback=next===3?"Excellent streaking! Material is spread from the starting area across the plate.":"Good—continue following the arrows.";
    state.feedbackType="good";
    clearTimeout(mission5AnimationTimer);
    mission5Animating=!reducedMotion;
    save();announce(state.feedback);render();
    if(mission5Animating)mission5AnimationTimer=setTimeout(()=>{mission5Animating=false;render();},720);
  }
  function handleM5Drop(value,targetType,targetValue){
    if(targetType==="m5-pool")m5Pool(true,value);
    if(targetType==="m5-streak")m5Streak(targetValue,true,value);
  }
  function m6Phase(){
    const m=state.mission6;
    return !m.incubatorOpen?0:!m.platePlaced?1:!m.incubatorClosed?2:!m.incubationStarted?3:!m.incubationComplete?4:!m.reopened?5:!m.inspected?6:!m.complete?7:8;
  }
  function m6Update(message,type="good"){
    state.mission6.step=m6Phase();state.feedback=message;state.feedbackType=type;save();announce(message);render();
  }
  function m6Wrong(){
    const messages=["Open the incubator before placing the plate inside.","Select the streaked plate, then place it on the highlighted shelf.","Place the streaked plate on the shelf before closing the incubator.","Close the incubator before starting incubation.","Wait until incubation is complete before opening the door.","Incubation is complete. Open the incubator to continue.","Select the incubated plate to inspect its growth.","Inspect the plate and choose what happened to the bacteria.","The culture is ready for Gram-stain preparation."];
    m6Update(messages[m6Phase()],"try");
  }
  function scheduleMission6Incubation(){
    mission6Timer=setTimeout(()=>{if(state.mission!==6||state.mission6.incubationComplete)return;state.mission6.incubationComplete=true;m6Update("Incubation complete: night has become morning.");},reducedMotion?80:2600);
  }
  function m6PlacePlate(fromDrag=false,value=""){
    const m=state.mission6;
    if(m6Phase()!==1||(fromDrag?value!=="plate":m.selected!=="plate")){m6Wrong();return;}
    m.platePlaced=true;m.selected=null;m6Update("The streaked plate is safely inside the incubator.");
  }
  function m6Inspect(fromDrag=false,value=""){
    if(m6Phase()!==6||(fromDrag&&value!=="plate")){m6Wrong();return;}
    state.mission6.inspected=true;state.mission6.selected=null;m6Update("Growth is visible on the blood agar.");
  }
  function handleM6Drop(value,targetType){
    if(targetType==="m6-shelf")m6PlacePlate(true,value);
    if(targetType==="m6-inspect")m6Inspect(true,value);
  }

  function m7Phase(){
    const m=state.mission7;
    return !m.waterAdded?0:!m.loopSelected?1:!m.colonySelected&&!m.colonyTransferred?2:!m.colonyTransferred?3:!m.wetSmearComplete?4:!m.dryingStarted?5:!m.dryingComplete?6:!m.burnerLit&&!m.heatFixed?7:!m.heatFixed?8:9;
  }
  function m7Update(message,type="good"){
    state.mission7.step=m7Phase();state.feedback=message;state.feedbackType=type;save();announce(message);render();
  }
  function m7Wrong(message=""){
    const messages=["Add the distilled water before selecting a colony.","Select the sterile 1 µL loop.","Use the 1 µL loop to select one isolated colony.","Place the colony into the water drop before spreading it.","Follow the highlighted area to keep the smear thin and controlled.","Place the wet smear on the slide rack to air-dry.","The smear must be completely air-dried before heat fixation.","Light the burner before heat-fixing the slide.","Keep the slide above the flame and move it through carefully.","The slide is ready for Gram staining."];
    m7Update(message||messages[m7Phase()],"try");
  }
  function m7Water(fromDrag=false,value=""){
    const m=state.mission7;if(m7Phase()!==0||(fromDrag?value!=="dropper":m.selected!=="dropper")){m7Wrong();return;}
    m.waterAdded=true;m.selected=null;m7Update("One drop of distilled water is on the slide.");
  }
  function m7Colony(value,fromDrag=false,dragValue=""){
    if(m7Phase()!==2||(fromDrag&&dragValue!=="loop")){m7Wrong(m7Phase()<2?"Select the sterile 1 µL loop first.":"");return;}
    if(value==="crowded"){m7Wrong("Choose a separate, isolated colony rather than an area where colonies are crowded together.");return;}
    const m=state.mission7;m.colonySelected=true;m.selectedColony=value;m.selected="loop";m7Update("One isolated colony has been selected.");
  }
  function m7Transfer(fromDrag=false,value=""){
    const m=state.mission7;if(m7Phase()!==3||(fromDrag?value!=="loop":m.selected!=="loop")){m7Wrong();return;}
    m.colonyTransferred=true;m.colonySelected=false;m.selected="loop";m7Update("The bacterial colony is now in the water drop.");
  }
  function m7Smear(zone,fromDrag=false,value=""){
    const m=state.mission7,next=m.smearStage+1;
    if(m7Phase()!==4||Number(zone)!==next||(fromDrag?value!=="loop":m.selected!=="loop")){m7Wrong();return;}
    m.smearStage=next;
    if(next===3){m.wetSmearComplete=true;m.selected=null;m7Update("The bacteria have been spread into a thin wet smear.");}
    else m7Update("Good—keep the smear thin and even.");
  }
  function m7Rack(fromDrag=false,value=""){
    const m=state.mission7;if(m7Phase()!==5||(fromDrag?value!=="slide":m.selected!=="slide")){m7Wrong();return;}
    m.dryingStarted=true;m.selected=null;m7Update("Air-drying…");
  }
  function scheduleMission7Drying(){
    mission7Timer=setTimeout(()=>{if(state.mission!==7||state.mission7.dryingComplete)return;state.mission7.dryingComplete=true;m7Update("The smear is dry and ready to heat-fix.");},reducedMotion?80:1900);
  }
  function m7Heat(zone,fromDrag=false,value=""){
    const m=state.mission7,next=m.heatPass+1;
    if(m7Phase()!==8||Number(zone)!==next||(fromDrag?value!=="slide":m.selected!=="slide")){m7Wrong();return;}
    m.heatPass=next;
    if(next===3){m.heatFixed=true;m.burnerLit=false;m.complete=true;m.selected=null;if(!state.completed.includes(7))state.completed.push(7);m7Update("The dried bacterial smear has been heat-fixed safely.");}
    else m7Update(next===2?"Good—one more careful pass above the flame.":"Good—continue with another careful pass above the flame.");
  }
  function handleM7Drop(value,targetType,targetValue){
    if(targetType==="m7-water")m7Water(true,value);
    else if(targetType==="m7-colony")m7Colony(targetValue,true,value);
    else if(targetType==="m7-transfer")m7Transfer(true,value);
    else if(targetType==="m7-smear")m7Smear(targetValue,true,value);
    else if(targetType==="m7-rack")m7Rack(true,value);
    else if(targetType==="m7-heat")m7Heat(targetValue,true,value);
  }

  app.addEventListener("click", function(ev){
    const target=ev.target.closest("[data-action]"); if(!target)return;
    const action=target.dataset.action,value=target.dataset.value;
    if(action==="choose-age"){state=L.initialState();state.age=value;state.mission=1;state.patientCase=L.createCase(value,new Date());state.feedback="Welcome, Junior Bacteriologist! Discover which bacterium is making the patient sick.";state.feedbackType="good";save();render();return;}
    if(action==="continue"){continueMission();return;}
    if(action==="ppe"){selectPpe(value);return;}
    if(action==="apply-ppe"){if(state.selectedPpe)handlePpe(state.selectedPpe);return;}
    if(action==="complete-1"){
      if(state.ppe.includes("coat")&&state.ppe.includes("gloves")){
        const message = "Excellent! You chose the correct PPE. Now we’re ready to enter the laboratory!";
        if(!state.completed.includes(1))state.completed.push(1);
        clearTimeout(missionTransitionTimer);
        missionTransition=!reducedMotion;
        state.mission=2;
        state.feedback=message;
        state.feedbackType="good";
        save(); announce(message); render();
        if(missionTransition)missionTransitionTimer=setTimeout(()=>{missionTransition=false;render();},1350);
      }
      return;
    }
    if(action==="sample-info"){
      openSampleInfo=value;
      render();
      announce(`${SAMPLE_INFO[value].title} information opened.`);
      document.querySelector(".sample-info-close")?.focus();
      return;
    }
    if(action==="close-sample-info"){
      if(target.classList.contains("sample-info-backdrop")&&ev.target!==target)return;
      const valueToFocus=openSampleInfo;
      openSampleInfo=null;
      render();
      document.querySelector(`[data-action="sample-info"][data-value="${valueToFocus}"]`)?.focus();
      return;
    }
    if(action==="agar-info"){
      openAgarInfo=value;
      render();
      announce(`${AGAR_INFO[value].title} information opened.`);
      document.querySelector(".sample-info-close")?.focus();
      return;
    }
    if(action==="close-agar-info"){
      if(target.classList.contains("sample-info-backdrop")&&ev.target!==target)return;
      const valueToFocus=openAgarInfo;
      openAgarInfo=null;
      render();
      document.querySelector(`[data-action="agar-info"][data-value="${valueToFocus}"]`)?.focus();
      return;
    }
    if(action==="sample"){if(value==="swab")completeMission(2,"Correct! A throat swab collects a sample from the throat so the laboratory can look for bacteria.");else setFeedback("Not this one! This sample comes from a different part of the body. Think about where the infection is.","try");return;}
    if(action==="inspect"){state.matching.expanded=state.matching.expanded===Number(value)?null:Number(value);state.matching.mismatch=[];state.feedback="Opening a set is for inspection—it does not submit an answer.";state.feedbackType="";save();render();if(state.matching.expanded!=null)setTimeout(()=>document.querySelector('[data-action="select-candidate"]')?.focus(),0);return;}
    if(action==="compare-other"){state.matching.expanded=state.matching.expanded===0?1:0;state.matching.mismatch=[];save();render();setTimeout(()=>document.querySelector('[data-action="select-candidate"]')?.focus(),0);return;}
    if(action==="select-candidate"){
      const i=state.matching.expanded,c=state.patientCase.candidates[i],fields=L.identityMismatchFields(state.patientCase.reference,c);
      if(fields.length){state.matching.mismatch=fields;setFeedback(fields.length===1?"This ID no. is different. Compare these numbers on the monitor, swab and paper request.":"These patient details conflict. Compare the name, ID no. and date of birth on all three surfaces.","try");}
      else{state.matching.mismatch=[];state.matching.accepted=i;setFeedback("Matched! This sample belongs to Amelia. Now move the accepted throat swab to the receiving/scanning rack.","good");}
      return;
    }
    if(action==="toggle-accepted-sample"){state.matching.sampleSelected=!state.matching.sampleSelected;setFeedback(state.matching.sampleSelected?"Accepted throat swab selected. Now choose the receiving and scanning rack.":"Accepted throat swab deselected.");return;}
    if(action==="rack-sample"){rackSample();return;}
    if(action==="complete-3"){
      if(state.matching.racked){
        if(!state.completed.includes(3))state.completed.push(3);
        state.mission=4;state.feedback="Patient matched and sample received safely.";state.feedbackType="good";
        save();announce(state.feedback);render();
      }
      return;
    }
    if(action==="show-agar-solution"){state.mission4SolutionShown=true;state.feedback="Blood agar is the correct medium for this throat-culture investigation.";state.feedbackType="good";save();announce(state.feedback);render();return;}
    if(action==="agar"){if(value==="blood")completeMission(4,"Excellent! You selected blood agar for this investigation.");else setFeedback("Not this one! This agar is designed for a different investigation. Try again.","try");return;}
    if(action==="m5-open-swab"){
      if(m5Phase()!==0){m5Wrong();return;}
      state.mission5.swabOpen=true;state.mission5.step=1;m5Update("The throat swab is open.");return;
    }
    if(action==="m5-open-plate"){
      if(m5Phase()!==1){m5Wrong();return;}
      state.mission5.plateOpen=true;state.mission5.step=2;m5Update("The blood agar plate is open.");return;
    }
    if(action==="m5-select-tool"){m5SelectTool(value);return;}
    if(action==="m5-pool-target"){m5Pool();return;}
    if(action==="m5-close-swab"){
      if(m5Phase()!==3){m5Wrong();return;}
      state.mission5.swabClosed=true;state.mission5.step=4;state.mission5.selected=null;m5Update("The throat swab is safely closed.");return;
    }
    if(action==="m5-streak-zone"){m5Streak(value);return;}
    if(action==="m5-next"){
      if(m5Phase()===6){if(!state.completed.includes(5))state.completed.push(5);state.mission=6;state.feedback="The plate is ready for incubation.";state.feedbackType="good";save();announce(state.feedback);render();}
      return;
    }
    if(action==="m6-open"){
      const phase=m6Phase();if(phase===0){state.mission6.incubatorOpen=true;m6Update("The incubator is open.");return;}if(phase===5){state.mission6.reopened=true;m6Update("The plate is ready to inspect.");return;}m6Wrong();return;
    }
    if(action==="m6-select-plate"){if(m6Phase()!==1){m6Wrong();return;}state.mission6.selected=state.mission6.selected==="plate"?null:"plate";m6Update(state.mission6.selected?"Streaked plate selected. Now choose the highlighted shelf.":"Plate deselected.",state.mission6.selected?"good":"");return;}
    if(action==="m6-shelf"){m6PlacePlate();return;}
    if(action==="m6-close"){if(m6Phase()!==2){m6Wrong();return;}state.mission6.incubatorClosed=true;m6Update("The incubator is closed and set to 37°C.");return;}
    if(action==="m6-start"){if(m6Phase()!==3){m6Wrong();return;}state.mission6.incubationStarted=true;m6Update("Incubation has started at 37°C.");return;}
    if(action==="m6-skip"){if(m6Phase()!==4){m6Wrong();return;}state.mission6.incubationComplete=true;m6Update("Incubation complete: night has become morning.");return;}
    if(action==="m6-inspect"){m6Inspect();return;}
    if(action==="m6-incubator"){m6Wrong();return;}
    if(action==="growth"){
      if(m6Phase()!==7){m6Wrong();return;}
      if(value==="colonies"){state.mission6.complete=true;if(!state.completed.includes(6))state.completed.push(6);m6Update("Correct! The bacteria multiplied and grew into visible colonies.");}
      else m6Update("Not quite. Incubation provides suitable conditions for bacteria to grow. Try again.","try");
      return;
    }
    if(action==="m6-next"){if(m6Phase()===8){state.mission=7;state.feedback="The culture is ready for Gram-stain preparation.";state.feedbackType="good";save();announce(state.feedback);render();}return;}
    if(action==="m7-select-dropper"){if(m7Phase()!==0){m7Wrong();return;}state.mission7.selected=state.mission7.selected==="dropper"?null:"dropper";m7Update(state.mission7.selected?"Distilled water selected. Now choose the centre of the slide.":"Distilled water deselected.",state.mission7.selected?"good":"");return;}
    if(action==="m7-water"){m7Water();return;}
    if(action==="m7-select-loop"){
      const phase=m7Phase();
      if(phase===1){state.mission7.loopSelected=true;state.mission7.selected="loop";m7Update("The 1 µL loop is ready.");return;}
      if([2,3,4].includes(phase)){state.mission7.selected="loop";m7Update(phase===2?"Loop selected. Choose one isolated colony.":phase===3?"Loaded loop selected. Transfer the colony into the water drop.":"Loop selected. Follow the smear zones in order.");return;}
      m7Wrong();return;
    }
    if(action==="m7-colony"){m7Colony(value);return;}
    if(action==="m7-transfer"){m7Transfer();return;}
    if(action==="m7-smear-zone"){m7Smear(value);return;}
    if(action==="m7-slide"){
      const phase=m7Phase();
      if(phase===5||phase===8){state.mission7.selected=state.mission7.selected==="slide"?null:"slide";m7Update(state.mission7.selected?(phase===5?"Slide selected. Place it on the drying rack.":"Dried slide selected. Follow the heat-fix zones above the flame."):"Slide deselected.",state.mission7.selected?"good":"");return;}
      m7Wrong();return;
    }
    if(action==="m7-rack"){m7Rack();return;}
    if(action==="m7-skip-drying"){if(m7Phase()!==6){m7Wrong();return;}state.mission7.dryingComplete=true;m7Update("The smear is dry and ready to heat-fix.");return;}
    if(action==="m7-burner"){if(m7Phase()!==7){m7Wrong(m7Phase()===6?"The smear must be completely air-dried before heat fixation.":"");return;}state.mission7.burnerLit=true;state.mission7.selected="slide";m7Update("The burner is lit. Pass the dried slide carefully above the flame.");return;}
    if(action==="m7-heat-zone"){m7Heat(value);return;}
    if(action==="m7-wrong"){m7Wrong();return;}
    if(action==="m7-next"){if(m7Phase()===9){state.mission=8;state.feedback="The prepared slide is ready for Gram staining.";state.feedbackType="good";save();announce(state.feedback);render();}return;}
    if(action==="gram-mode"){resetGram(value);return;}
    if(action==="gram-bottle"){applyManualBottle(value);return;}
    if(action==="gram-slide"){if(state.gram.mode!=="manual"||state.gram.running)return;if(!state.gram.selected){setFeedback("Select the highlighted reagent first, then apply it to the slide.","try");return;}startGramStep(state.gram.selected);return;}
    if(action==="gram-pause"){clearTimeout(timer);clearTimeout(gramAutoTimer);state.gram.paused=true;state.feedback="Automatic procedure paused safely.";save();render();return;}
    if(action==="gram-resume"){state.gram.paused=false;state.feedback="Automatic procedure resumed.";save();render();return;}
    if(action==="gram-skip-time"){if(state.gram.running&&L.GRAM_STEPS[state.gram.step]?.seconds){state.gram.visualSkipped=true;state.gram.timerRemaining=0;advanceGram();}return;}
    if(action==="gram-replay"){resetGram(state.gram.mode==="choose"?"auto":state.gram.mode);return;}
    if(action==="gram-switch"){resetGram("manual");return;}
    if(action==="m8-next"){if(state.gram.complete){if(!state.completed.includes(8))state.completed.push(8);state.mission=9;state.feedback="The stained slide is ready for microscopy.";state.feedbackType="good";save();announce(state.feedback);render();}return;}
    if(action==="m9-select-slide"){if(state.mission9.placed){m9Wrong("The slide is already secured on the microscope stage.");return;}state.mission9.selected=!state.mission9.selected;m9Update(state.mission9.selected?"Gram-stained slide selected. Now choose the highlighted microscope stage.":"Slide deselected.",state.mission9.selected?"good":"");return;}
    if(action==="m9-place-slide"){m9PlaceSlide();return;}
    if(action==="m9-skip-focus"){if(!state.mission9.placed||state.mission9.focusComplete){m9Wrong("Place the slide before focusing the microscope.");return;}clearTimeout(mission9Timer);state.mission9.focusSkipped=true;state.mission9.focusComplete=true;m9Update("The microscopic fields are in focus. Compare the colour, shape and arrangement.");return;}
    if(action==="m9-answer"){m9Answer(value);return;}
    if(action==="m9-next"){if(state.mission9.complete){state.mission=10;state.feedback="Microscopy is consistent with streptococci. Use MALDI-TOF to identify the species.";state.feedbackType="good";save();announce(state.feedback);render();}return;}
    if(action==="maldi-step"){state.mission10.step=Math.min(8,state.mission10.step+1);state.feedback=state.mission10.step===8?"MALDI-TOF found a species match.":"Correct—continue the MALDI-TOF preparation.";state.feedbackType="good";save();render();return;}
    if(action==="complete-10"){if(state.mission10.step>=8){if(!state.completed.includes(10))state.completed.push(10);state.mission=11;save();saveHubCompletion();render();}return;}
    if(action==="review"){state.mission=1;save();render();return;}
    if(action==="new-case"){localStorage.removeItem(STORAGE);state=L.initialState();render();return;}
  });

  window.addEventListener("keydown",ev=>{
    if(openAgarInfo&&ev.key==="Escape"){
      ev.preventDefault();
      const valueToFocus=openAgarInfo;
      openAgarInfo=null;
      render();
      document.querySelector(`[data-action="agar-info"][data-value="${valueToFocus}"]`)?.focus();
      return;
    }
    if(openAgarInfo&&ev.key==="Tab"){
      ev.preventDefault();
      document.querySelector(".sample-info-close")?.focus();
      return;
    }
    if(openSampleInfo&&ev.key==="Escape"){
      ev.preventDefault();
      const valueToFocus=openSampleInfo;
      openSampleInfo=null;
      render();
      document.querySelector(`[data-action="sample-info"][data-value="${valueToFocus}"]`)?.focus();
      return;
    }
    if(openSampleInfo&&ev.key==="Tab"){
      ev.preventDefault();
      document.querySelector(".sample-info-close")?.focus();
      return;
    }
    if((ev.key==="Enter"||ev.key===" ")&&document.activeElement?.dataset.drop==="rack"){ev.preventDefault();rackSample();}
  });
  const orientationQuery=matchMedia("(orientation: portrait) and (max-width: 900px)");
  orientationQuery.addEventListener?.("change",event=>{orientationBlocked=event.matches;if(orientationBlocked){clearTimeout(timer);clearTimeout(gramAutoTimer);clearTimeout(mission6Timer);clearTimeout(mission7Timer);clearTimeout(mission9Timer);save();}else render();});
  render();
})();

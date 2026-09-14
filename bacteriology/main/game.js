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
  if (state.gram && state.gram.running) state.gram.running = false;
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
    const screenClass = state.mission === 1 ? "screen mission-one-screen" : state.mission === 2 ? "screen mission-two-screen" : state.mission === 3 ? "screen mission-three-screen" : state.mission === 4 ? "screen mission-four-screen" : state.mission === 5 ? "screen mission-five-screen" : "screen";
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
    return shell(`<div class="mission-one-title">${missionHeader(1,"Enter the lab",younger("Help Dr Mira prepare to enter the laboratory safely.","Choose the PPE needed for this task.","Select the appropriate PPE for handling this specimen."))}<div class="instruction">Drag an item to the scientist, or select it and then choose the scientist.</div></div><div class="ppe-scene" aria-label="Laboratory preparation room"><img class="ppe-background" src="assets/mission-1/preparation-room-background.png" alt="Laboratory preparation room"><button class="scientist-stack" data-action="apply-ppe" data-drop="ppe" aria-label="Scientist, PPE drop target. Select to apply the chosen item."><img class="scientist-state" src="assets/mission-1/${scientistFile}" alt="${scientistLabel}"></button>${item("coat","Lab coat","lab-coat-on-hook.png","ppe-coat")}${coatProxy}${item("hat","Hard hat","hard-hat-on-hook.png","ppe-hat")}<img class="ppe-countertop" src="assets/mission-1/ppe-countertop.png" alt="" aria-hidden="true">${item("gloves","Glove box; select a pair of blue gloves","gloves-box.png","ppe-gloves")}${item("glasses","Safety glasses","safety-glasses-container.png","ppe-glasses")}${item("visor","Face visor","face-visor-container.png","ppe-visor")}${controls}</div>`, "The right protection depends on the laboratory task. For this one, choose exactly two items.");
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
    return shell(`<div class="mission-two-scene" aria-label="Inside the bacteriology laboratory"><img class="mission-two-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-two-title">${missionHeader(2,"What sample do we need?","Our patient has a sore throat. Which sample should the doctor take to look for bacteria that may be causing the infection?")}</div><div class="mission-two-feedback">${feedback()}${completion}</div><div class="mission-two-choices">${options.map(specimen).join("")}</div>${infoDialog}</div>`, "Think about where the patient's infection is. You can retry any choice.");
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
    return `<div class="m3-transfer" aria-label="Accepted sample transfer"><div class="m3-transfer-heading"><div class="mission-label">Mission 3 of 10</div><h1>Matched! This sample belongs to Amelia.</h1><p>Move the accepted throat swab to the receiving and scanning rack.</p></div><aside class="m3-rejected" aria-label="Rejected sample set ${rejectedIndex+1} remains at reception"><strong>Rejected set ${rejectedIndex+1}</strong><span>Remains at reception</span><div><img src="assets/mission-2/throat-swab.png" alt="Rejected throat swab"><span class="m3-mini-paper" aria-hidden="true"></span></div></aside><button class="m3-accepted-sample ${selected?"selected":""}" data-action="toggle-accepted-sample" data-value="accepted" draggable="true" data-drag="rack" data-drag-image="assets/mission-2/throat-swab.png" aria-pressed="${selected}" aria-label="Accepted throat swab for ${e(accepted.name)}. Select it, or drag it to the receiving rack."><img src="assets/mission-2/throat-swab.png" alt="">${sampleLabel(accepted,[])}</button><button class="m3-rack ${selected?"active":""} ${complete?"ready":""}" data-action="rack-sample" data-drop="rack" aria-label="Bacteriology receiving and scanning rack${complete?", accepted sample scanned":". Select after choosing the accepted swab, or drop it here."}"><span>${complete?"✓ Accepted sample scanned":"Receiving / scanning rack"}</span><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i></button>${complete?`<div class="m3-complete-card" role="status"><p>Patient matched and sample received safely.</p>${learning("Patient details must be checked carefully so that results are reported for the correct patient.")}<div class="actions">${btn("Mission 4 →","complete-3","coral")}</div></div>`:""}</div>`;
  }
  function mission3() {
    const c = state.patientCase;
    const monitorMismatch = state.matching.mismatch;
    const background = `<img class="mission-three-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside the bacteriology laboratory">`;
    if (!state.matching.carrierOpen) return shell(`<div class="mission-three-scene">${background}<div class="m3-opening-title">${missionHeader(3,"Match the patient","A specimen carrier has arrived at bacteriology reception.")}<div class="instruction">Compare the patient details on the monitor, sample label and request form.</div></div><button class="m3-carrier" data-action="open-carrier" aria-label="Open specimen carrier and reveal two complete sample sets"><span aria-hidden="true">↗</span><strong>SPECIMEN CARRIER</strong><small>Open carrier</small></button></div>`, "At reception, every sample must be matched before it can enter the laboratory.");
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
    const plate = ([value,title,sub,file]) => `<div class="agar-option"><button class="choice agar-choice" data-action="agar" data-value="${value}" aria-label="Choose ${title}"><img src="assets/mission-4/${file}" alt=""><strong>${title}</strong>${state.age==="junior"?"":`<small>${sub}</small>`}</button><button class="agar-info-button" data-action="agar-info" data-value="${value}" aria-label="Learn about ${title}">?</button></div>`;
    const info = AGAR_INFO[openAgarInfo];
    const infoDialog = info ? `<div class="sample-info-backdrop" data-action="close-agar-info"><section class="sample-info-dialog" role="dialog" aria-modal="true" aria-labelledby="agar-info-title"><button class="sample-info-close" data-action="close-agar-info" aria-label="Close agar information">×</button><img src="assets/mission-4/${info.file}" alt=""><div><div class="mission-label">Agar guide</div><h2 id="agar-info-title">${info.title}</h2><p><strong>What it is:</strong> ${info.what}</p><p><strong>Where it is used:</strong> ${info.use}</p></div></section></div>` : "";
    const completion = state.completed.includes(4) ? learning("Different culture media are used for different organisms and specimens.")+`<div class="actions">${btn("Mission 5 →","continue")}</div>` : "";
    return shell(`<div class="mission-four-scene" aria-label="Agar selection inside the bacteriology laboratory"><img class="mission-four-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-four-title">${missionHeader(4,"Choose the correct agar","Which agar plate should we use to grow bacteria from this throat swab?")}</div><div class="mission-four-feedback">${feedback()}${completion}</div><div class="mission-four-choices">${plates.map(plate).join("")}</div>${infoDialog}</div>`, "The sample is a throat swab. Choose the medium specified for this investigation.");
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
    const arrowLabels = ["Open the swab","Lift the lid","Start here","Close the swab","Touch the starting area","Follow the arrows",""];
    const swabFile = m.swabOpen && !m.swabClosed ? "throat-swab-open.png" : "throat-swab-closed.png";
    const swabActive = phase === 0 || phase === 2 || phase === 3;
    const loopActive = phase === 4 || phase === 5;
    const streakFile = m.streakStage === 1 ? "streak-pattern-stage-1.png" : m.streakStage === 2 ? "streak-pattern-stage-2.png" : m.streakStage >= 3 ? "streak-pattern-complete.png" : "";
    const zones = [1,2,3].map(zone => `<button class="m5-streak-zone zone-${zone} ${phase===5&&!mission5Animating&&zone===m.streakStage+1?"active":""} ${zone<=m.streakStage?"done":""}" data-action="m5-streak-zone" data-value="${zone}" data-drop="m5-streak" aria-label="Streak section ${zone}${zone<=m.streakStage?", complete":zone===m.streakStage+1?", next":""}" aria-disabled="${phase!==5||mission5Animating||zone!==m.streakStage+1}" ${mission5Animating?"disabled":""}><span>${zone}</span></button>`).join("");
    const streakMotion = mission5Animating && m.streakStage > 0 ? `<img class="m5-streak-motion motion-${m.streakStage}" src="assets/mission-5/sterile-loop-10ul.png" alt="" aria-hidden="true">` : "";
    const arrow = phase < 6 ? `<div class="m5-guidance arrow-${phase}" aria-hidden="true"><svg viewBox="0 0 180 80"><path d="M8 58 C55 8 110 8 158 46"/><path d="M145 30 L160 47 L137 51"/></svg><span>${arrowLabels[phase]}</span></div>` : "";
    const completion = phase === 6 && !mission5Animating ? `<div class="m5-completion" role="status" aria-live="polite"><div class="m5-completion-card"><p><strong>Excellent!</strong> The blood agar plate has been inoculated and streaked correctly.</p>${learning("Streaking spreads bacteria across the agar so that separate colonies can grow.","Each visible colony may grow from a single bacterium or a small group of bacteria.")}<div class="actions">${btn("Place in the incubator →","m5-next","coral")}</div></div></div>` : "";
    return shell(`<div class="mission-five-scene" aria-label="Blood agar inoculation workstation"><img class="mission-five-background" src="assets/mission-2/laboratory-interior-background.png" alt="Inside a modern bacteriology laboratory"><div class="mission-five-title"><div class="mission-label">Mission 5 of 10</div><h1>Streak the plate</h1><p>Create the starting area, then spread the material so separate colonies can grow.</p></div><div class="mission-five-prompt" role="status"><strong>Step ${Math.min(phase+1,6)} of 6</strong><span>${prompts[phase]}</span></div><div class="m5-countertop" aria-hidden="true"></div><button class="m5-swab ${swabActive?"active":""} ${m.selected==="swab"?"selected":""} ${m.swabClosed?"put-away":""}" data-action="${phase===0?"m5-open-swab":phase===3?"m5-close-swab":"m5-select-tool"}" data-value="swab" draggable="${phase===2}" data-drag="m5-pool" data-drag-image="assets/mission-5/throat-swab-applicator.png" aria-pressed="${m.selected==="swab"}" aria-label="${phase===0?"Open the throat-swab container":phase===3?"Return and close the throat swab":"Throat-swab applicator"}"><img src="assets/mission-5/${swabFile}" alt="">${m.swabOpen&&!m.swabClosed?`<img class="m5-swab-stick" src="assets/mission-5/throat-swab-applicator.png" alt="">`:""}<span>${phase===0?"Open the swab":phase===3?"Close the swab":"Throat swab"}</span></button><div class="m5-plate ${m.plateOpen?"open":""}"><button class="m5-plate-control ${phase===1?"active":""}" data-action="m5-open-plate" aria-label="Open the blood agar plate"><img class="m5-plate-base" src="assets/mission-5/${m.plateOpen?"blood-agar-plate-open.png":"blood-agar-plate-closed.png"}" alt="Blood agar plate"><img class="m5-plate-lid" src="assets/mission-5/blood-agar-lid.png" alt="" aria-hidden="true"></button>${m.inoculated?`<img class="m5-plate-overlay m5-pool" src="assets/mission-5/inoculation-pool-overlay.png" alt="">`:""}${streakFile?`<img class="m5-plate-overlay m5-streak-overlay" src="assets/mission-5/${streakFile}" alt="">`:""}${streakMotion}<button class="m5-pool-target ${phase===2||phase===4?"active":""}" data-action="m5-pool-target" data-drop="m5-pool" aria-label="${phase===2?"Starting area for the throat swab":phase===4?"Starting area for the 10 microlitre loop":"Starting inoculation area"}" ${phase===2||phase===4?"":"disabled"}><span>${phase===2?"Start here":phase===4?"Touch the starting area":"✓"}</span></button>${phase===5?`<div class="m5-streak-zones">${zones}</div>`:""}</div><button class="m5-loop ${loopActive?"active":""} ${m.selected==="loop"?"selected":""}" data-action="m5-select-tool" data-value="loop" draggable="${loopActive&&!mission5Animating}" data-drag="${phase===4?"m5-pool":"m5-streak"}" data-drag-image="assets/mission-5/sterile-loop-10ul.png" aria-pressed="${m.selected==="loop"}" aria-label="10 microlitre sterile loop"><img src="assets/mission-5/sterile-loop-10ul.png" alt=""><span>10 µL loop</span></button>${arrow}${completion}</div>`, prompts[phase]);
  }

  function mission6() {
    const s=state.mission6.step;
    const text=["Open the incubator.","Move the streaked plate inside.","Close the incubator.","Incubating… night becomes morning.","Open the incubator and inspect the plate.","What happened to the bacteria?"][s];
    return shell(`${missionHeader(6,"Into the incubator","Bacteria need the right conditions to grow.")}<div class="instruction">${text}</div><div class="lab-bench" style="display:grid;place-items:center"><div class="maldi" style="width:min(520px,100%)"><div class="maldi-screen"><strong>INCUBATOR</strong><div class="timer">37°C</div><p>${s===0?"Door closed":s===1?"Door open — empty shelf":s===2?"Plate on shelf — door open":s===3?"INCUBATING…":s>=4?"Incubation complete":""}</p></div>${s>=2?`<div class="plate" style="width:120px">${s>=4?'<span class="colonies"></span>':s>=2?'<span class="streaks"></span>':""}</div>`:""}</div><div class="actions">${s<5?btn(["Open incubator","Place plate inside","Close incubator","Wait for morning","Open and inspect"][s],"incubator-step",s===2?"coral":""):""}</div></div>${s===5?`<div class="grid grid-3">${choice("💨","They disappeared","","growth","gone")}${choice("🦠","They grew into colonies","","growth","colonies")}${choice("🧬","They turned into viruses","","growth","viruses")}</div>`:""}${feedback()}${state.completed.includes(6)?learning("Bacteria need suitable conditions, such as the right temperature and enough time, to grow.")+`<div class="actions">${btn("Mission 7 →","continue")}</div>`:""}`, "The incubator is set to 37°C. Complete opening, loading and closing in the correct order.");
  }

  function mission7() {
    const s=state.mission7.step;
    const steps=["Place one drop of distilled water onto the slide.","Select the loop.","Choose one colony from the culture plate.","Spread the bacteria onto the drop of water.","Move the slide over the Bunsen burner to heat-fix it.","The slide is ready for staining."];
    const actions=["Use distilled-water dropper","Select the loop","Pick one colony","Spread bacteria in the water","Heat-fix the slide"];
    return shell(`${missionHeader(7,"Prepare the slide","Bacteria are microscopic. Prepare a sample so we can examine it under a microscope.")}<div class="instruction"><strong>Step ${Math.min(s+1,5)}:</strong> ${steps[s]}</div><div class="lab-bench"><div class="grid grid-4"><div class="object"><span class="big-icon">🧫</span><strong>Culture plate</strong>${s>=2?'<small>Colony selected</small>':""}</div><div class="object"><span class="big-icon">▱</span><strong>Microscope slide</strong>${s>=1?'<small>💧 Water drop</small>':""}</div><div class="object"><span class="big-icon">💧</span><strong>Distilled water</strong></div><div class="object"><span class="big-icon">🔥</span><strong>Bunsen burner</strong></div></div><div class="actions">${s<5?btn(actions[s],"slide-step",s===4?"coral":""):""}</div></div>${feedback()}${s>=5?learning("We prepare bacteria on a slide so that we can examine them under a microscope.")+`<div class="actions">${state.completed.includes(7)?btn("Mission 8 →","continue"):btn("Finish Mission 7","complete-7","coral")}</div>`:""}`, "Keep the preparation order exact: water, colony, spreading, then heat-fixation.");
  }

  function gramChecklist() {
    return `<ol class="checklist">${L.GRAM_STEPS.map((step,i)=>`<li class="${i<state.gram.step?"done":i===state.gram.step&&!state.gram.complete?"current":""}">${i<state.gram.step?"✓ ":""}${i+1}. ${step.title}</li>`).join("")}</ol>`;
  }
  function gramButtons() {
    const bottles=[["water","Water","#bcecff"],["violet","Crystal violet","#7742b5"],["iodine","Lugol’s iodine","#be7530"],["decolorizer","Decolorizer","#e3c247"],["fuchsin","Carbol Fuchsin","#e6689a"]];
    return `<div class="grid bottles">${bottles.map(b=>`<button class="choice bottle" style="--bottle:${b[2]}" data-action="gram-bottle" data-value="${b[0]}" ${state.gram.running||state.gram.complete?"disabled":""}><strong>${b[1]}</strong></button>`).join("")}</div>`;
  }
  function mission8() {
    if (!state.gram.mode) return shell(`${missionHeader(8,"The Gram stain","Follow the local laboratory protocol to stain the heat-fixed slide.")}<div class="lab-bench" style="display:grid;place-items:center"><button class="btn coral" style="font-size:1.35rem;padding:18px 30px" data-action="gram-play">▶ PLAY</button></div>${feedback()}`, "The large PLAY control lets you watch the full procedure or complete every step yourself.");
    if (state.gram.mode === "choose") return shell(`${missionHeader(8,"Choose a play mode","Both modes teach the same eight-step Gram-stain procedure.")}<div class="grid grid-2">${choice("▶","Watch automatically","Guided animation with pause, resume and replay","gram-mode","auto")}${choice("🧪","Do it myself","Choose each bottle in checklist order","gram-mode","manual")}</div>${feedback()}`, "You can switch from automatic to manual; the procedure safely restarts from Step 1.");
    const step=L.GRAM_STEPS[state.gram.step] || L.GRAM_STEPS[7];
    const status=state.gram.complete?"The Gram stain is complete!":state.gram.running?`${step.message}`:`Next: ${step.detail}`;
    return shell(`${missionHeader(8,"The Gram stain",state.gram.mode==="auto"?"Watch the complete guided procedure.":"Use the checklist to apply each reagent and rinse in order.")}<div class="gram-layout"><div><div class="instruction">${status}</div><div class="lab-bench" style="min-height:180px;text-align:center"><div aria-label="Slide rack over sink" style="font-size:4rem">${state.gram.complete?"🟣":"▱"}</div>${state.gram.running?`<div class="timer">${timerCounter?`0:${String(timerCounter).padStart(2,"0")}`:"FAST TIMER"}</div>`:""}</div>${state.gram.mode==="manual"?gramButtons():""}<div class="actions">${state.gram.mode==="auto"&&!state.gram.complete?(state.gram.paused?btn("Resume","gram-resume"):btn("Pause","gram-pause","secondary"))+btn("Replay","gram-replay","secondary"):""}${state.gram.mode==="auto"?btn("Switch to do it myself","gram-switch","secondary"):""}${state.gram.complete?btn("Replay procedure","gram-replay","secondary")+(state.completed.includes(8)?btn("Mission 9 →","continue"):btn("Finish Mission 8","complete-8","coral")):""}</div></div><aside>${gramChecklist()}</aside></div>${feedback()}${state.gram.complete?learning("Gram staining helps us see and classify bacteria. Gram-positive bacteria stain purple, while Gram-negative bacteria stain pink.","The difference happens because Gram-positive and Gram-negative bacteria have different cell-envelope structures."):""}`, "The order is crystal violet, water, Lugol’s iodine, water, decolorizer, water, Carbol Fuchsin, then water.");
  }

  function mission9() {
    if (!state.mission9.placed) return shell(`${missionHeader(9,"Look under the microscope","Your stained slide is ready.")}<div class="instruction">Place the slide onto the microscope stage.</div><div class="lab-bench" style="display:grid;place-items:center"><div style="font-size:7rem" aria-hidden="true">🔬</div>${btn("Place slide on microscope","place-slide","coral")}</div>${feedback()}`, "Use the microscope to compare colour, shape and arrangement.");
    const opts=[["pink-rods","Pink rods","pink"],["purple-rods","Purple rods","prods"],["chains","Purple cocci in chains","chains"],["clusters","Purple cocci in clusters","clusters"]];
    return shell(`${missionHeader(9,"Look under the microscope","Which picture shows the bacteria we are looking for?")}<div class="grid micro-grid">${opts.map(o=>`<button class="choice micro-choice" data-action="microscope" data-value="${o[2]}"><span class="micro ${o[0]}" aria-hidden="true"><span></span></span><strong>${o[1]}</strong></button>`).join("")}</div>${feedback()}${state.completed.includes(9)?learning("These are Gram-positive cocci arranged in chains. This appearance is consistent with streptococci.","Their purple colour, round shape and chain arrangement help us recognise them as streptococci, but species identification needs another test.")+`<div class="actions">${btn("Mission 10 →","continue")}</div>`:""}`, "Look carefully at all three clues: purple colour, round shape and chain arrangement.");
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
    if (!state.age || state.mission===0) app.innerHTML=startScreen();
    else if(state.mission===11) app.innerHTML=summary();
    else app.innerHTML=({1:mission1,2:mission2,3:mission3,4:mission4,5:mission5,6:mission6,7:mission7,8:mission8,9:mission9,10:mission10}[state.mission]||mission1)();
    bindDrag();
    if(!orientationBlocked&&state.mission===8&&state.gram.mode==="auto"&&!state.gram.paused&&!state.gram.complete) scheduleGramAuto();
  }

  function resetGram(mode) { clearTimeout(timer); state.gram={mode,step:0,paused:false,complete:false,running:false}; timerCounter=0; save(); render(); }
  function advanceGram() {
    state.gram.running=false;
    if(state.gram.step>=L.GRAM_STEPS.length-1){ state.gram.step=L.GRAM_STEPS.length; state.gram.complete=true; state.feedback="The Gram stain is complete! Some bacteria remain purple, while others become pink."; state.feedbackType="good"; }
    else state.gram.step+=1;
    save(); render();
  }
  function scheduleGramAuto() {
    if(state.gram.step>=L.GRAM_STEPS.length){state.gram.complete=true;save();render();return;}
    const step=L.GRAM_STEPS[state.gram.step]; state.gram.running=true; save();
    timerCounter=step.seconds;
    const duration=reducedMotion?80:(step.seconds?900:500);
    timer=setTimeout(advanceGram,duration);
  }
  function applyManualBottle(value) {
    const step=L.GRAM_STEPS[state.gram.step];
    if(value!==step.bottle){setFeedback("Not quite — check the next step on the checklist.","try");return;}
    state.feedback=step.message; state.feedbackType="good"; state.gram.running=true; timerCounter=step.seconds; save(); render();
    timer=setTimeout(advanceGram,reducedMotion?80:(step.seconds?700:300));
  }

  function bindDrag(){
    document.querySelectorAll("[draggable=true]").forEach(el=>{
      el.addEventListener("dragstart",ev=>{
        ev.dataTransfer.setData("text/plain",el.dataset.value);
        ev.dataTransfer.effectAllowed="move";
        const ghost=document.createElement("img");
        ghost.src=el.dataset.dragImage||el.querySelector("img")?.src||"";
        ghost.className="native-drag-image"; document.body.appendChild(ghost);
        ev.dataTransfer.setDragImage(ghost,55,55); setTimeout(()=>ghost.remove(),0);
      });
      el.addEventListener("pointerdown",beginTouchDrag);
    });
    document.querySelectorAll("[data-drop]").forEach(el=>{el.addEventListener("dragover",ev=>ev.preventDefault());el.addEventListener("drop",ev=>{ev.preventDefault();const v=ev.dataTransfer.getData("text/plain");if(el.dataset.drop==="ppe")handlePpe(v);if(el.dataset.drop==="rack")rackSample(true);if(el.dataset.drop.startsWith("m5-"))handleM5Drop(v,el.dataset.drop,el.dataset.value);});});
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
      source.removeEventListener("pointermove",move);source.removeEventListener("pointerup",finish);source.removeEventListener("pointercancel",finish);ghost?.remove();
      if(moved){const dropType=source.dataset.drag;const target=[...document.querySelectorAll(`[data-drop='${dropType}']`)].find(el=>{const r=el.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;});if(target&&dropType==="ppe")handlePpe(value);if(target&&dropType==="rack")rackSample(true);if(target&&dropType.startsWith("m5-"))handleM5Drop(value,target.dataset.drop,target.dataset.value);}
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
    if(action==="open-carrier"){state.matching.carrierOpen=true;state.matching.clueSeen=true;setFeedback("Carrier open. Inspect a complete bottle-and-paper set before selecting it.","good");return;}
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
    if(action==="incubator-step"){state.mission6.step=Math.min(5,state.mission6.step+1);state.feedback=state.mission6.step===4?"Incubation complete: night has become morning.":"Good—continue in order.";state.feedbackType="good";save();render();return;}
    if(action==="growth"){if(value==="colonies")completeMission(6,"Correct! The bacteria grew into small beta-haemolytic, pale-grey colonies.");else setFeedback(value==="gone"?"Not quite. Look at the new pale-grey spots on the plate.":"Bacteria do not turn into viruses. Look for visible growth on the plate.","try");return;}
    if(action==="slide-step"){state.mission7.step=Math.min(5,state.mission7.step+1);state.feedback=["One drop of distilled water is on the slide.","The loop is ready.","One colony has been selected.","The bacteria are spread into the water drop.","The slide has been heat-fixed and is ready to stain."][state.mission7.step-1];state.feedbackType="good";save();render();return;}
    if(action==="complete-7"){if(state.mission7.step>=5)completeMission(7,"Slide preparation complete.");return;}
    if(action==="gram-play"){state.gram.mode="choose";save();render();return;}
    if(action==="gram-mode"){resetGram(value);return;}
    if(action==="gram-bottle"){applyManualBottle(value);return;}
    if(action==="gram-pause"){clearTimeout(timer);state.gram.paused=true;state.gram.running=false;state.feedback="Automatic procedure paused safely.";save();render();return;}
    if(action==="gram-resume"){state.gram.paused=false;state.feedback="Automatic procedure resumed.";save();render();return;}
    if(action==="gram-replay"){resetGram(state.gram.mode==="choose"?"auto":state.gram.mode);return;}
    if(action==="gram-switch"){resetGram("manual");return;}
    if(action==="complete-8"){if(state.gram.complete)completeMission(8,"Gram stain complete. The slide is ready for microscopy.");return;}
    if(action==="place-slide"){state.mission9.placed=true;setFeedback("Slide placed. Now compare the microscopic appearances.","good");return;}
    if(action==="microscope"){if(value==="chains")completeMission(9,"Excellent! These Gram-positive cocci in chains are consistent with streptococci.");else setFeedback("Not quite. Look carefully at the colour, shape and arrangement. Try again!","try");return;}
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
  orientationQuery.addEventListener?.("change",event=>{orientationBlocked=event.matches;if(orientationBlocked){clearTimeout(timer);if(state.gram?.running){state.gram.running=false;save();}}else render();});
  render();
})();

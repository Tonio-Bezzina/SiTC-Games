(function(){
  "use strict";
  const L=window.MycologyLogic;
  const app=document.querySelector("#app");
  const announcer=document.querySelector("#announcer");
  const orientationDialog=document.querySelector("#orientationDialog");
  const STORAGE_KEY="sitcMycologyJourneyV1";
  let state=null;
  let feedback="";
  let feedbackType="";
  let portraitDismissed=false;

  function load(){
    try{return L.sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return null;}
  }
  function save(){state.updatedAt=new Date().toISOString();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  function announce(message){announcer.textContent="";requestAnimationFrame(()=>{announcer.textContent=message;});}
  function title(s){return s.charAt(0).toUpperCase()+s.slice(1);}
  function maybeOrientation(){if(matchMedia("(orientation: portrait) and (max-width: 800px)").matches&&!portraitDismissed&&!orientationDialog.open)orientationDialog.showModal();}

  function renderLevel(){
    const resume=load();
    app.innerHTML=`<main class="level-screen" id="main"><div class="level-backdrop" aria-hidden="true"></div><a class="level-back" href="../">← All laboratories</a><section class="level-copy"><p class="eyebrow">THE MYCOLOGY JOURNEY</p><h1>Become a Junior Mycologist!</h1><p>Follow one specimen through the laboratory, collect every clue, and solve the fungal mystery. Choose how much guidance you would like.</p><div class="level-guide"><img src="assets/shared/dr-mira-neutral.png" alt="Dr Mira Spore, your fictional mycology guide"></div></section><section class="level-picker" aria-labelledby="chooseTitle"><p class="eyebrow">CHOOSE YOUR GUIDANCE</p><h2 id="chooseTitle">How much help would you like?</h2><div class="level-grid">${[["junior","●","Junior","Ages 8–10","More guidance and earlier hints"],["explorer","●●","Explorer","Ages 10–12","Balanced guidance and optional hints"],["challenge","●●●","Challenge","Ages 12–14","Fewer prompts and optional hints"]].map(x=>`<button class="level-card" type="button" data-difficulty="${x[0]}"><span class="level-dots" aria-hidden="true">${x[1]}</span><strong>${x[2]}</strong><span>${x[3]}</span><em>${x[4]}</em></button>`).join("")}</div>${resume?`<button class="secondary-button continue-button" type="button" data-continue>Continue case ${resume.caseId} from Mission ${resume.currentMission}</button>`:""}<p class="reassurance">You can change guidance at any time. Your progress will be kept.</p></section></main>`;
    app.querySelectorAll("[data-difficulty]").forEach(b=>b.addEventListener("click",()=>{state=L.freshState(b.dataset.difficulty);save();renderMission1();}));
    app.querySelector("[data-continue]")?.addEventListener("click",()=>{state=resume;route();});
    maybeOrientation();
  }

  function chrome(content,mission=1){
    app.innerHTML=`<div class="game-shell"><header class="game-bar"><a class="back-link" href="../">← All laboratories</a><div class="game-heading"><span>THE MYCOLOGY JOURNEY</span><strong>Case ${state.caseId}</strong></div><div class="mission-progress"><strong>${mission}/8</strong><span>missions</span></div><button class="level-control" type="button" data-level>Guidance: ${title(state.difficulty)}</button></header>${content}<footer class="guide-strip"><img src="assets/shared/dr-mira-neutral.png" alt=""><div><strong>Dr Mira</strong><p>Take your time. Every safe choice is a step toward solving the mystery.</p></div><button class="hint-button" type="button" data-hint><img src="assets/shared/hint-icon.svg" alt="">Hint</button></footer></div>`;
    app.querySelector("[data-level]").addEventListener("click",renderLevel);
  }

  function renderMission1(){
    if(!state){renderLevel();return;}
    if(state.missionFlags[1]){renderMission1Complete();return;}
    const m=state.missionState[1];
    const q=L.QUESTIONS[m.questionIndex];
    chrome(`<main class="mission-scene" id="main"><header class="mission-title"><p class="eyebrow">MISSION 1 OF 8 · THE BASICS</p><h1>Start with safe science</h1><p>Mycology is the study of fungi. This includes yeasts and moulds which can cause infections. Answer the following questions and start your journey to become a Junior Mycologist.</p></header><div class="mission-workspace"><aside class="guide-panel"><img src="assets/shared/${feedbackType==="good"?"dr-mira-success":"dr-mira-pointing"}.png" alt="Dr Mira Spore ${feedbackType==="good"?"celebrating":"pointing toward the question"}"></aside><section class="question-panel" aria-labelledby="questionTitle"><div class="question-progress" aria-label="Question ${m.questionIndex+1} of 6">${L.QUESTIONS.map((_,i)=>`<span class="question-dot ${m.completedQuestions.includes(i)?"done":i===m.questionIndex?"current":""}"></span>`).join("")}</div><p class="eyebrow">QUESTION ${m.questionIndex+1} OF 6</p><h2 id="questionTitle">${q.q}</h2><div class="answer-grid">${q.a.map((answer,i)=>`<button class="answer-button" type="button" data-answer="${i}" ${m.completedQuestions.includes(m.questionIndex)?"disabled":""}>${answer}</button>`).join("")}</div><p class="feedback ${feedbackType}" tabindex="-1" aria-live="assertive">${feedback}</p><p class="hint-text" ${m.hintShown?"":"hidden"}>Look for the answer that protects people, specimens, and the workspace.</p><div class="question-actions"><button class="secondary-button" type="button" data-question-hint>Show hint</button>${m.completedQuestions.includes(m.questionIndex)?`<button class="primary-button" type="button" data-next>${m.questionIndex===5?"Finish safety check":"Next question"}</button>`:""}</div></section></div></main>`);
    app.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>answer(Number(b.dataset.answer))));
    app.querySelector("[data-question-hint]").addEventListener("click",showHint);
    app.querySelector("[data-hint]").addEventListener("click",showHint);
    app.querySelector("[data-next]")?.addEventListener("click",nextQuestion);
    maybeOrientation();
  }

  function answer(choice){
    const m=state.missionState[1];
    if(L.answerQuestion(m.questionIndex,choice)){
      if(!m.completedQuestions.includes(m.questionIndex))m.completedQuestions.push(m.questionIndex);
      feedback="Correct.";feedbackType="good";save();renderMission1();announce("Correct.");
      setTimeout(()=>app.querySelector("[data-next]")?.focus(),0);
    }else{
      m.attempts[m.questionIndex]+=1;
      if(L.shouldAutoHint(state.difficulty,m.attempts[m.questionIndex]))m.hintShown=true;
      feedback="Try again.";feedbackType="try";save();renderMission1();announce("Try again.");
      setTimeout(()=>app.querySelector(".feedback")?.focus(),0);
    }
  }
  function showHint(){state.missionState[1].hintShown=true;save();renderMission1();announce("Hint shown.");}
  function nextQuestion(){
    const m=state.missionState[1];feedback="";feedbackType="";
    if(m.questionIndex<5){m.questionIndex+=1;m.hintShown=false;save();renderMission1();setTimeout(()=>app.querySelector("[data-answer]")?.focus(),0);}
    else if(L.finishMission1(state)){save();renderMission1Complete();}
  }
  function renderMission1Complete(){
    chrome(`<main class="mission-complete" id="main"><section class="complete-card"><img src="assets/shared/dr-mira-success.png" alt="Dr Mira Spore celebrating"><div><p class="eyebrow">MISSION 1 COMPLETE</p><h1>Safety check complete</h1><p>Safety check complete. Let’s match each patient with the right sample.</p><button class="primary-button" type="button" data-mission2>Continue to Mission 2</button></div></section></main>`);
    app.querySelector("[data-hint]").hidden=true;
    app.querySelector("[data-mission2]").addEventListener("click",renderMission2);
  }

  function renderMission2(){
    const m=state.missionState[2];
    if(state.missionFlags[2]){renderMissionComplete(2,"Samples matched","All five samples are matched. Jamie’s skin scraping will continue through our journey.","Continue to Mission 3",()=>announce("Mission 3 is the next stage of the journey."));return;}
    chrome(`<main class="mission-scene" id="main"><header class="mission-title"><p class="eyebrow">MISSION 2 OF 8 · MATCH THE SAMPLE</p><h1>Match each complaint to a sample</h1><p>Fungal infections can occur all over the body. Can you match the sample to the correct patient? These are complaints under investigation, not confirmed diagnoses.</p></header><section class="activity-card"><div class="reference-art"><img src="assets/mission-2/patient-cards.svg" alt="Five illustrated fictional patient complaint cards"><img src="assets/mission-2/specimen-items.svg" alt="Five illustrated specimen containers"></div><div class="match-columns"><div><h2>1. Choose a specimen</h2>${L.MATCHES.map(x=>`<button class="choice-button ${m.selected===x.key?"selected":""}" draggable="true" data-specimen="${x.key}" ${m.matched.includes(x.key)?"disabled":""}>${x.specimen}${m.matched.includes(x.key)?" — matched":""}</button>`).join("")}</div><div><h2>2. Choose or drop on the patient</h2>${L.MATCHES.map(x=>`<button class="choice-button" data-patient="${x.key}" ${m.matched.includes(x.key)?"disabled":""}>${x.patient}${m.matched.includes(x.key)?" — matched":""}</button>`).join("")}</div></div><p class="feedback ${feedbackType}" tabindex="-1">${feedback}</p><p class="hint-text" ${m.hintShown?"":"hidden"}>Match the sample name to the body area shown on the patient card.</p>${m.matched.length===5?`<div class="success-panel"><p><strong>All five samples are matched.</strong> Jamie’s skin scraping will continue through our journey.</p><button class="primary-button" data-finish2>Save matching clue</button></div>`:""}</section></main>`,2);
    app.querySelectorAll("[data-specimen]").forEach(b=>b.addEventListener("click",()=>{m.selected=b.dataset.specimen;feedback="Now choose the matching patient.";feedbackType="";save();renderMission2();}));
    app.querySelectorAll("[data-specimen]").forEach(b=>b.addEventListener("dragstart",e=>{m.selected=b.dataset.specimen;e.dataTransfer.setData("text/plain",b.dataset.specimen);}));
    app.querySelectorAll("[data-patient]").forEach(b=>b.addEventListener("click",()=>{if(!m.selected){feedback="Choose a specimen first.";feedbackType="try";}else if(L.matchSample(m.selected,b.dataset.patient)){m.matched.push(m.selected);m.selected=null;feedback="Well done! This sample is needed for this patient.";feedbackType="good";}else{m.attempts+=1;feedback="Not this one. Look closely at what the patient is complaining of and try again.";feedbackType="try";if(L.shouldAutoHint(state.difficulty,m.attempts))m.hintShown=true;}save();renderMission2();announce(feedback);}));
    app.querySelectorAll("[data-patient]").forEach(b=>{b.addEventListener("dragover",e=>e.preventDefault());b.addEventListener("drop",e=>{e.preventDefault();m.selected=e.dataTransfer.getData("text/plain");b.click();});});
    app.querySelector("[data-hint]").addEventListener("click",()=>{m.hintShown=true;save();renderMission2();});
    app.querySelector("[data-finish2]")?.addEventListener("click",()=>{if(L.finishMission2(state)){save();renderMission2();}});
  }

  function renderMissionComplete(number,titleText,body,buttonText,next){
    chrome(`<main class="mission-complete" id="main"><section class="complete-card"><img src="assets/shared/dr-mira-success.png" alt="Dr Mira Spore celebrating"><div><p class="eyebrow">MISSION ${number} COMPLETE</p><h1>${titleText}</h1><p>${body}</p><button class="primary-button" type="button" data-next-mission>${buttonText}</button></div></section></main>`,number);
    app.querySelector("[data-hint]").hidden=true;app.querySelector("[data-next-mission]").addEventListener("click",next);
  }
  function route(){if(!state)return renderLevel();if(state.currentMission===1)return renderMission1();if(state.currentMission===2)return renderMission2();renderMission2();}

  addEventListener("keydown",event=>{if(event.key==="Escape"&&state?.currentMission===2&&state.missionState[2].selected){state.missionState[2].selected=null;save();renderMission2();announce("Selection cancelled.");}});

  document.querySelector("#continuePortrait").addEventListener("click",()=>{portraitDismissed=true;orientationDialog.close();});
  addEventListener("resize",maybeOrientation);
  renderLevel();
})();

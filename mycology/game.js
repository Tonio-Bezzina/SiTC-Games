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
    app.querySelector("[data-continue]")?.addEventListener("click",()=>{state=resume;renderMission1();});
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
    app.querySelector("[data-mission2]").addEventListener("click",()=>{announce("Mission 2 is the next stage of the journey.");});
  }

  document.querySelector("#continuePortrait").addEventListener("click",()=>{portraitDismissed=true;orientationDialog.close();});
  addEventListener("resize",maybeOrientation);
  renderLevel();
})();

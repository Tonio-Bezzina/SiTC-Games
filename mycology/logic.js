(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MycologyLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const VERSION = 6;
  const SPECIES=[
    {key:"fumigatus",colony:"Blue-green colony",head:"Columnar head with small blue-green spores",name:"Aspergillus fumigatus"},
    {key:"flavus",colony:"Yellow-green colony",head:"Rough conidiophore with rough green spores",name:"Aspergillus flavus"},
    {key:"niger",colony:"Black colony",head:"Biseriate phialides with rough black spores",name:"Aspergillus niger"},
    {key:"terreus",colony:"Cinnamon-brown colony",head:"Uniseriate phialides with small smooth spores",name:"Aspergillus terreus"}
  ];
  const DIFFICULTIES = ["junior", "explorer", "challenge"];
  const QUESTIONS = [
    { q:"Why is it important to wear a lab coat while doing experiments?", a:["It keeps you warm when the room gets chilly.","It keeps your clothes clean and protects your skin.","It helps you spot microscopic mould spores easier.","It helps you run faster around the workbench."], correct:1 },
    { q:"Why must you check sample details before opening containers?", a:["To practice reading out loud to your friends.","To make sure the container is shiny enough to use.","To make sure that the patient details match those on the request form.","To guess how heavy the container will be when lifted."], correct:2 },
    { q:"What is the best way to clean your workspace?", a:["Cover the dirt with clean sheets of paper.","Blow gently across the table to clear away dust.","Wipe the bench with a clean disinfectant cloth.","Dust the bench using your bare hands."], correct:2 },
    { q:"Why should long hair be tied back before working in the lab?", a:["To make sure your lab coat fits better.","To help you hear instructions better.","To be more stylish.","To keep hair out of flames and off agar plates."], correct:3 },
    { q:"What is the primary reason for wearing disposable gloves in a lab?", a:["To allow you to touch hot glass safely.","To make your hands look like colorful balloons.","To prevent hand germs from contaminating samples.","To avoid washing your hands after finishing."], correct:2 },
    { q:"What is the proper way to leave your lab station when you finish an experiment?", a:["Leave everything on the desk for the next person.","Dispose of waste in the proper bin, clean surfaces, wash your hands, and remove your PPE.","Throw everything into the recycling bin.","Just turn off the lights and walk out."], correct:1 }
  ];
  const MATCHES = [
    {key:"ear",patient:"Morgan — ear discomfort",specimen:"Ear swab"},
    {key:"skin",patient:"Jamie Borg — skin rash",specimen:"Skin scrapings"},
    {key:"nail",patient:"Riley — changed nail",specimen:"Nail clippings"},
    {key:"urinary",patient:"Sam — urinary symptoms",specimen:"Urine sample"},
    {key:"mouth",patient:"Alex — sore mouth",specimen:"Mouth swab"}
  ];
  const RECEPTION_CASES = [
    {key:"case-1",sample:["Nadia","MYC-1103","Ear swab"],form:["Nadia","MYC-1103","Ear swab"],match:true},
    {key:"case-2",sample:["Ellis","MYC-1639","Nail clippings"],form:["Ellis","MYC-1649","Nail clippings"],match:false},
    {key:"case-3",sample:["Jamie Borg","MYC-2048","Skin scrapings"],form:["Jamie Borg","MYC-2048","Skin scrapings"],match:true},
    {key:"case-4",sample:["Morgan","MYC-2710","Mouth swab"],form:["Moran","MYC-2710","Mouth swab"],match:false},
    {key:"case-5",sample:["Riley","MYC-3186","Urine sample"],form:["Riley","MYC-3186","Urine sample"],match:true}
  ];
  function caseId(seed=Date.now()) { return `MYC-${String(Math.abs(Number(seed))%10000).padStart(4,"0")}`; }
  function freshState(difficulty, seed) {
    if (!DIFFICULTIES.includes(difficulty)) throw new Error("Invalid difficulty");
    return {version:VERSION,caseId:caseId(seed),difficulty,currentMission:1,missionFlags:{},clues:{},missionState:{1:{questionIndex:0,attempts:[0,0,0,0,0,0],completedQuestions:[],hintShown:false},2:{matched:[],selected:null,attempts:0,hintShown:false},3:{caseIndex:0,decisions:[],attempts:0,hintShown:false},4:{destinations:{},focus:35,stage:"allocate",found:false,attempts:0,hintShown:false},5:{stage:"timelapse",viewed:false,selected:null,attempts:0,hintShown:false},6:{node:0,selections:[],viewed:[],attempts:0,hintShown:false}},completed:false,updatedAt:new Date().toISOString()};
  }
  function earliestIncomplete(flags={}) { for(let i=1;i<=8;i+=1) if(flags[i]!==true) return i; return 8; }
  function sanitize(raw) {
    if (!raw || typeof raw!=="object" || ![1,2,3,4,5,VERSION].includes(raw.version) || !DIFFICULTIES.includes(raw.difficulty) || !/^MYC-\d{4}$/.test(raw.caseId||"")) return null;
    const flags={}; let gap=false;
    for(let i=1;i<=8;i+=1){ if(raw.missionFlags?.[i]===true && !gap) flags[i]=true; else gap=true; }
    const mission=Math.min(Number(raw.currentMission)||1,earliestIncomplete(flags));
    const source=raw.missionState?.[1]||{};
    const completedQuestions=Array.isArray(source.completedQuestions)?source.completedQuestions.filter((n)=>Number.isInteger(n)&&n>=0&&n<6).filter((n,i,a)=>a.indexOf(n)===i):[];
    const attempts=Array.from({length:6},(_,i)=>Math.max(0,Number(source.attempts?.[i])||0));
    const m2=raw.missionState?.[2]||{};
    const matched=Array.isArray(m2.matched)?m2.matched.filter(k=>MATCHES.some(x=>x.key===k)).filter((k,i,a)=>a.indexOf(k)===i):[];
    const m3=raw.missionState?.[3]||{};const decisions=Array.isArray(m3.decisions)?m3.decisions.filter(k=>RECEPTION_CASES.some(x=>x.key===k)).filter((k,i,a)=>a.indexOf(k)===i):[];
    const m4=raw.missionState?.[4]||{};const destinations={};for(let i=1;i<=6;i+=1)if(["slide","culture"].includes(m4.destinations?.[i]))destinations[i]=m4.destinations[i];
    const m5=raw.missionState?.[5]||{};
    const m6=raw.missionState?.[6]||{};const selections=Array.isArray(m6.selections)?m6.selections.slice(0,3):[];
    return {...raw,version:VERSION,missionFlags:flags,currentMission:mission,clues:raw.clues&&typeof raw.clues==="object"?raw.clues:{},missionState:{...raw.missionState,1:{questionIndex:Math.min(5,Math.max(0,Number(source.questionIndex)||0)),attempts,completedQuestions,hintShown:Boolean(source.hintShown)},2:{matched,selected:null,attempts:Math.max(0,Number(m2.attempts)||0),hintShown:Boolean(m2.hintShown)},3:{caseIndex:Math.min(decisions.length,4),decisions,attempts:Math.max(0,Number(m3.attempts)||0),hintShown:Boolean(m3.hintShown)},4:{destinations,focus:Math.min(100,Math.max(0,Number(m4.focus)||35)),stage:m4.stage==="microscopy"?"microscopy":"allocate",found:Boolean(m4.found),attempts:Math.max(0,Number(m4.attempts)||0),hintShown:Boolean(m4.hintShown)},5:{stage:m5.stage==="choices"?"choices":"timelapse",viewed:Boolean(m5.viewed),selected:["mould","none","bacteria","yeast"].includes(m5.selected)?m5.selected:null,attempts:Math.max(0,Number(m5.attempts)||0),hintShown:Boolean(m5.hintShown)},6:{node:Math.min(2,Math.max(0,Number(m6.node)||0)),selections,viewed:Array.isArray(m6.viewed)?m6.viewed.filter(k=>SPECIES.some(x=>x.key===k)):[],attempts:Math.max(0,Number(m6.attempts)||0),hintShown:Boolean(m6.hintShown)}},completed:false};
  }
  function answerQuestion(index,choice){ return Number.isInteger(index)&&QUESTIONS[index]&&QUESTIONS[index].correct===choice; }
  function shouldAutoHint(difficulty,attempts){ return difficulty==="junior"?attempts>=1:difficulty==="explorer"?attempts>=2:false; }
  function canCompleteMission1(state){ return state?.missionState?.[1]?.completedQuestions?.length===QUESTIONS.length; }
  function finishMission1(state){ if(!canCompleteMission1(state)) return false; state.missionFlags[1]=true; state.clues.safety="complete"; state.currentMission=2; state.updatedAt=new Date().toISOString(); return true; }
  function matchSample(specimenKey,patientKey){return specimenKey===patientKey&&MATCHES.some(x=>x.key===specimenKey);}
  function finishMission2(state){if(state?.missionState?.[2]?.matched?.length!==MATCHES.length)return false;state.missionFlags[2]=true;state.clues.matching="five correct sample-to-site matches";state.clues.patient="Jamie Borg";state.clues.specimen="skin scrapings";state.currentMission=3;return true;}
  function receptionDecision(index,saysMatch){return Boolean(RECEPTION_CASES[index]?.match)===Boolean(saysMatch);}
  function finishMission3(state){if(state?.missionState?.[3]?.decisions?.length!==5)return false;state.missionFlags[3]=true;state.clues.reception="accepted MYC-2048 skin scraping";state.currentMission=4;return true;}
  function allocationCounts(destinations={}){return {slide:Object.values(destinations).filter(x=>x==="slide").length,culture:Object.values(destinations).filter(x=>x==="culture").length};}
  function allocationReady(destinations){const c=allocationCounts(destinations);return c.slide===3&&c.culture===3;}
  function microscopyTarget(focus,region){return Number(focus)>=60&&region==="branching";}
  function finishMission4(state){if(!allocationReady(state?.missionState?.[4]?.destinations)||!state.missionState[4].found)return false;state.missionFlags[4]=true;state.clues.microscopy="fungal elements seen";state.clues.culturePlate="simulated SDCC plate inoculated";state.currentMission=5;return true;}
  function plateOrder(id){const plates=["mould","none","bacteria","yeast"],n=Number(String(id).slice(-1))%4;return plates.slice(n).concat(plates.slice(0,n));}
  function finishMission5(state){if(state?.missionState?.[5]?.selected!=="mould")return false;state.missionFlags[5]=true;state.clues.culture="growth-positive fluffy powdery colony";state.currentMission=6;return true;}
  function keyChoice(node,key){return ["blue-green","columnar","fumigatus"][node]===key;}
  function finishMission6(state){if(state?.missionState?.[6]?.selections?.join("|")!=="blue-green|columnar|fumigatus")return false;state.missionFlags[6]=true;state.clues.identification="Aspergillus fumigatus";state.currentMission=7;return true;}
  function canAwardHub(){ return false; }
  return {VERSION,DIFFICULTIES,QUESTIONS,MATCHES,RECEPTION_CASES,SPECIES,caseId,freshState,sanitize,answerQuestion,shouldAutoHint,canCompleteMission1,finishMission1,matchSample,finishMission2,receptionDecision,finishMission3,allocationCounts,allocationReady,microscopyTarget,finishMission4,plateOrder,finishMission5,keyChoice,finishMission6,canAwardHub,earliestIncomplete};
});

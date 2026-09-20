"use strict";
const assert=require("assert");
const L=require("../logic.js");

for(const level of L.DIFFICULTIES){const s=L.freshState(level,2048);assert.equal(s.difficulty,level);assert.equal(s.currentMission,1);assert.deepEqual(s.missionFlags,{});assert.equal(s.caseId,"MYC-2048");}
assert.equal(L.QUESTIONS.length,6);
assert.deepEqual(L.QUESTIONS.map(q=>q.correct),[1,2,2,3,2,1]);
L.QUESTIONS.forEach((q,index)=>q.a.forEach((_,choice)=>assert.equal(L.answerQuestion(index,choice),choice===q.correct)));
assert.equal(L.shouldAutoHint("junior",1),true);assert.equal(L.shouldAutoHint("explorer",1),false);assert.equal(L.shouldAutoHint("explorer",2),true);assert.equal(L.shouldAutoHint("challenge",99),false);
const raw=L.freshState("junior",2048);raw.missionFlags={1:true,3:true};raw.currentMission=7;raw.missionState[1].attempts=[-1,"2"];const repaired=L.sanitize(raw);assert.deepEqual(repaired.missionFlags,{1:true});assert.equal(repaired.currentMission,2);assert.deepEqual(repaired.missionState[1].attempts,[0,2,0,0,0,0]);
const s=L.freshState("explorer",2048);assert.equal(L.finishMission1(s),false);s.missionState[1].completedQuestions=[0,1,2,3,4,5];assert.equal(L.finishMission1(s),true);assert.equal(s.missionFlags[1],true);assert.equal(s.currentMission,2);assert.equal(s.clues.safety,"complete");
assert.equal(L.canAwardHub(s),false);
assert.equal(L.sanitize({version:99}),null);
for(const a of L.MATCHES)for(const b of L.MATCHES)assert.equal(L.matchSample(a.key,b.key),a.key===b.key);
const s2=L.freshState("junior",2048);s2.missionFlags[1]=true;s2.currentMission=2;s2.missionState[2].matched=L.MATCHES.map(x=>x.key);assert(L.finishMission2(s2));assert.equal(s2.clues.patient,"Jamie Borg");assert.equal(s2.clues.specimen,"skin scrapings");assert.equal(L.canAwardHub(),false);
assert.equal(L.RECEPTION_CASES.length,5);assert.deepEqual(L.RECEPTION_CASES.map(x=>x.match),[true,false,true,false,true]);L.RECEPTION_CASES.forEach((c,i)=>{assert(L.receptionDecision(i,c.match));assert(!L.receptionDecision(i,!c.match));});
const s3=L.freshState("explorer",2048);s3.missionState[3].decisions=L.RECEPTION_CASES.map(x=>x.key);assert(L.finishMission3(s3));assert.equal(s3.clues.reception,"accepted MYC-2048 skin scraping");
assert.deepEqual(L.allocationCounts({1:"slide",2:"slide",3:"slide",4:"culture",5:"culture",6:"culture"}),{slide:3,culture:3});assert(L.allocationReady({1:"slide",2:"slide",3:"slide",4:"culture",5:"culture",6:"culture"}));assert(!L.microscopyTarget(59,"branching"));assert(L.microscopyTarget(60,"branching"));
const s4=L.freshState("challenge",2048);s4.missionState[4].destinations={1:"slide",2:"slide",3:"slide",4:"culture",5:"culture",6:"culture"};s4.missionState[4].found=true;assert(L.finishMission4(s4));assert.equal(s4.clues.microscopy,"fungal elements seen");
assert.deepEqual(L.plateOrder("MYC-2048"),["mould","none","bacteria","yeast"]);assert.deepEqual(L.plateOrder("MYC-2049"),["none","bacteria","yeast","mould"]);const s5=L.freshState("junior",2048);assert(!L.finishMission5(s5));s5.missionState[5].selected="mould";assert(L.finishMission5(s5));assert.equal(s5.clues.culture,"growth-positive fluffy powdery colony");
console.log("PASS mycology logic missions 1-5");

"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..","..");
const mycology=path.join(root,"mycology");
const read=p=>fs.readFileSync(p,"utf8");

const html=read(path.join(mycology,"index.html"));
const game=read(path.join(mycology,"game.js"));
const hub=read(path.join(root,"hub.js"));
for(const file of ["styles.css","logic.js","game.js"]) assert(fs.existsSync(path.join(mycology,file)),`${file} missing`);
assert(html.includes('href="styles.css"')&&html.includes('src="logic.js"')&&html.includes('src="game.js"'));
for(const match of game.matchAll(/(?:src=\\?"|url\(\\?")([^"')]+assets\/[^"')]+)/g)){
  const relative=match[1].replace(/^\.\//,"");
  assert(fs.existsSync(path.join(mycology,relative)),`missing runtime asset ${relative}`);
}
for(let i=1;i<=8;i+=1){
  const prefix=`MISSION_${String(i).padStart(2,"0")}_`;
  const source=fs.readdirSync(path.join(mycology,"missions")).find(x=>x.startsWith(prefix));
  const copy=fs.readdirSync(path.join(mycology,"docs")).find(x=>x.startsWith(prefix));
  assert(source&&copy,`mission ${i} specification copy missing`);
  assert.strictEqual(read(path.join(mycology,"missions",source)),read(path.join(mycology,"docs",copy)),`mission ${i} copy changed`);
}
assert(hub.includes('id: "mycology"')&&hub.includes('href: "mycology/"'),"hub Mycology card missing");
for(const copy of ["CONGRATULATIONS, JUNIOR MYCOLOGIST!","You solved the fungal mystery!","JUNIOR MYCOLOGIST — MISSION COMPLETE!","Complete my journey","Start a fresh fictional case?","Your SiTC laboratory badge will stay safe."])assert(game.includes(copy)||html.includes(copy),`completion copy missing: ${copy}`);
assert(game.includes('localStorage.setItem("sitcGameProgressV2"'),"hub award integration missing");
console.log("PASS Mycology static integration, docs, assets, hub, and completion copy");

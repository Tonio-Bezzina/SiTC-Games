"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "assets");
const input = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const at = arg.indexOf("=");
  return [arg.slice(0, at), arg.slice(at + 1)];
}));

const dirs = ["shared", "mission-1", "mission-2", "mission-3", "mission-4", "mission-5", "mission-6", "mission-7", "mission-8", "completion", "contact-sheets", "sources"];
dirs.forEach((dir) => fs.mkdirSync(path.join(root, dir), { recursive: true }));

const svg = (title, width, height, body, extra = "") => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title" ${extra}>
  <title id="title">${title}</title>
${body.trim()}
</svg>\n`;

const writeSvg = (file, title, width, height, body, extra) => {
  const target = path.join(root, file);
  fs.writeFileSync(target, svg(title, width, height, body, extra), "utf8");
};

const C = { navy: "#073C63", blue: "#087FC1", cyan: "#21C9DC", gold: "#FFC83D", ink: "#153344", muted: "#4B6675", soft: "#DFF9FC", white: "#FFFFFF", success: "#08784F", error: "#B51F3C" };

writeSvg("shared/mycology-game-icon.svg", "Microscope and mushroom mycology symbol", 128, 128, `
  <circle cx="64" cy="64" r="60" fill="${C.soft}" stroke="${C.navy}" stroke-width="6"/>
  <path d="M38 91h55M48 84h36M64 32v37c0 12-9 20-21 20" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>
  <path d="M55 26h25v13H55z" fill="${C.cyan}" stroke="${C.navy}" stroke-width="5"/>
  <path d="M73 55h20v9H73z" fill="${C.gold}" stroke="${C.navy}" stroke-width="4"/>
  <path d="M87 29c13 0 23 8 23 18H64c0-10 10-18 23-18zM83 47h8v19h-8z" fill="${C.gold}" stroke="${C.navy}" stroke-width="4" stroke-linejoin="round"/>
`);
writeSvg("shared/hint-icon.svg", "Hint light bulb", 48, 48, `<circle cx="24" cy="21" r="14" fill="${C.gold}" stroke="${C.navy}" stroke-width="4"/><path d="M18 35h12M20 41h8M24 3v5M7 10l4 4M41 10l-4 4" fill="none" stroke="${C.navy}" stroke-width="4" stroke-linecap="round"/>`);
writeSvg("shared/success-check.svg", "Success check mark", 48, 48, `<circle cx="24" cy="24" r="21" fill="${C.success}"/><path d="m13 24 7 7 15-16" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`);
writeSvg("shared/rotate-device.svg", "Rotate device to landscape", 240, 160, `<rect x="70" y="25" width="100" height="110" rx="14" fill="white" stroke="${C.navy}" stroke-width="7"/><circle cx="120" cy="119" r="4" fill="${C.navy}"/><path d="M35 54c18-28 46-40 75-36M30 43l5 11 12-2M205 106c-18 28-46 40-75 36M210 117l-5-11-12 2" fill="none" stroke="${C.cyan}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
writeSvg("shared/reduced-motion-process.svg", "Static before and after laboratory process", 1200, 260, `<g fill="white" stroke="${C.blue}" stroke-width="5"><rect x="25" y="45" width="250" height="170" rx="24"/><rect x="475" y="45" width="250" height="170" rx="24"/><rect x="925" y="45" width="250" height="170" rx="24"/></g><g fill="none" stroke="${C.gold}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M305 130h130l-28-28m28 28-28 28M755 130h130l-28-28m28 28-28 28"/></g><g fill="${C.soft}" stroke="${C.navy}" stroke-width="6"><path d="M98 98h104v74H98z"/><circle cx="600" cy="130" r="52"/><rect x="1005" y="83" width="90" height="94" rx="16"/></g>`);

writeSvg("mission-1/safety-lab-vignettes.svg", "Six laboratory safety symbols", 1200, 500, `<g stroke="${C.navy}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(45 55)"><path d="M70 20h70l35 85-23 88H58l-23-88z" fill="${C.cyan}"/><path d="M70 20 35 105m105-85 35 85" fill="none"/></g><g transform="translate(235 55)"><rect x="22" y="35" width="150" height="120" rx="18" fill="white"/><path d="M48 70h98M48 102h98M48 134h55"/></g><g transform="translate(430 55)"><rect x="20" y="95" width="160" height="86" rx="16" fill="${C.soft}"/><path d="m55 60 25 15-25 15m70-30-25 15 25 15"/><path d="M40 130h120" stroke="${C.cyan}"/></g><g transform="translate(625 55)"><circle cx="100" cy="58" r="35" fill="#8E5B3D"/><path d="M52 178c7-65 89-65 96 0M65 63c20 24 50 24 70 0" fill="${C.soft}"/><path d="M100 20v-16"/></g><g transform="translate(820 55)"><path d="M55 170c-32-38-20-97 12-117 17 22 30 50 30 78 0-34 13-67 34-92 34 30 35 95 1 131z" fill="#49B7E8"/><path d="M96 60v110"/></g><g transform="translate(1010 55)"><path d="M55 55h90l-12 125H67z" fill="${C.soft}"/><path d="M45 55h110M80 35h40M82 90v55m36-55v55"/><path d="M45 195h110" stroke="${C.success}"/></g></g>`);

writeSvg("mission-2/patient-cards.svg", "Five fictional patient body-site cards", 1400, 760, `<g stroke="${C.navy}" stroke-width="5"><g fill="white">${[20,296,572,848,1124].map(x => `<rect x="${x}" y="20" width="256" height="720" rx="28"/>`).join("")}</g><g fill="${C.soft}">${[148,424,700,976,1252].map(x => `<circle cx="${x}" cy="178" r="78"/>`).join("")}</g><g fill="#C98A68">${[148,424,700,976,1252].map(x => `<circle cx="${x}" cy="166" r="47"/><path d="M${x-76} 430c4-105 148-105 152 0v180H${x-76}z"/>`).join("")}</g><g fill="${C.gold}" stroke="${C.navy}"><circle cx="108" cy="166" r="18"/><circle cx="424" cy="365" r="27"/><rect x="662" y="360" width="76" height="28" rx="12"/><path d="M942 365h68v96h-68z"/><circle cx="1252" cy="166" r="26"/></g></g>`);
writeSvg("mission-2/specimen-items.svg", "Five mycology specimen items", 1400, 360, `<g stroke="${C.navy}" stroke-width="6" stroke-linejoin="round"><g transform="translate(35 35)"><rect x="38" y="35" width="190" height="45" rx="20" fill="${C.soft}"/><path d="M55 57h140"/><circle cx="205" cy="57" r="17" fill="white"/></g><g transform="translate(305 35)"><path d="M35 160h210v75H35z" fill="#E8D4BA"/><g fill="#C9A783" stroke-width="3"><path d="m70 175 20-18 25 20-18 20z"/><path d="m120 198 28-24 25 27-24 21z"/><path d="m177 172 20-17 23 22-18 18z"/></g></g><g transform="translate(580 35)"><path d="M48 90c35-45 145-45 180 0l-18 115c-42 30-102 30-144 0z" fill="#E5C59E"/><path d="M72 105h132"/></g><g transform="translate(855 35)"><path d="M65 65h150l-12 190H77z" fill="white"/><path d="M78 145h124v98H78z" fill="#F1D34F"/><rect x="58" y="35" width="164" height="44" rx="15" fill="${C.cyan}"/></g><g transform="translate(1130 35)"><rect x="35" y="60" width="200" height="42" rx="18" fill="${C.soft}"/><path d="M55 81h145"/><ellipse cx="205" cy="81" rx="23" ry="15" fill="white"/></g></g>`);

writeSvg("mission-3/dermatology-envelope.svg", "Blank dermatology specimen envelope", 480, 320, `<path d="M35 55h410v225H35z" fill="#D9B878" stroke="${C.navy}" stroke-width="7"/><path d="m35 55 205 135L445 55" fill="#E9CA8E" stroke="${C.navy}" stroke-width="7"/><rect x="118" y="188" width="244" height="66" rx="8" fill="white" stroke="${C.navy}" stroke-width="5"/>`);
writeSvg("mission-3/request-form-blank.svg", "Blank laboratory request form", 600, 760, `<rect x="35" y="25" width="530" height="710" rx="18" fill="white" stroke="${C.navy}" stroke-width="8"/><rect x="70" y="70" width="460" height="80" rx="12" fill="${C.soft}"/><g fill="none" stroke="${C.muted}" stroke-width="4"><path d="M70 210h460M70 280h460M70 350h460M70 420h460M70 490h460M70 560h460"/><rect x="70" y="615" width="42" height="42"/><rect x="180" y="615" width="42" height="42"/><rect x="290" y="615" width="42" height="42"/></g>`);

writeSvg("mission-4/skin-scraping-piece.svg", "Small skin scraping flake", 160, 120, `<path d="M16 70 38 26l52-14 48 27-8 50-52 20-50-12z" fill="#D9B590" stroke="#8B684C" stroke-width="6"/><path d="m40 66 30-18 28 10 20-8M58 89l22-18 26 12" fill="none" stroke="#B98C67" stroke-width="4" stroke-linecap="round"/>`);
writeSvg("mission-4/microscope-slide.svg", "Blank microscope slide", 520, 260, `<rect x="25" y="55" width="470" height="150" rx="18" fill="#DDF6FA" fill-opacity=".72" stroke="${C.navy}" stroke-width="8"/><rect x="55" y="75" width="105" height="110" rx="10" fill="white" stroke="${C.blue}" stroke-width="5"/><ellipse cx="328" cy="130" rx="78" ry="50" fill="#BFEAF1" stroke="${C.cyan}" stroke-width="5"/>`);
writeSvg("mission-4/sdcc-plate.svg", "Blank selective fungal agar plate", 520, 420, `<ellipse cx="260" cy="230" rx="220" ry="145" fill="#EEF7FA" stroke="${C.navy}" stroke-width="9"/><ellipse cx="260" cy="210" rx="198" ry="124" fill="#E6D79A" stroke="#B79F55" stroke-width="6"/><path d="M88 155c70-55 270-70 345 8" fill="none" stroke="white" stroke-opacity=".55" stroke-width="12" stroke-linecap="round"/><rect x="165" y="343" width="190" height="45" rx="10" fill="white" stroke="${C.navy}" stroke-width="5"/>`);
writeSvg("mission-4/fluorescence-field.svg", "Simulated fluorescence field with sparse septate fungal structures", 1400, 900, `<rect width="1400" height="900" fill="#020A18"/><defs><filter id="g"><feGaussianBlur stdDeviation="7"/></filter></defs><g fill="none" stroke="#5BE9FF" stroke-linecap="round"><g opacity=".35" filter="url(#g)" stroke-width="23"><path d="M160 720C330 660 390 430 560 410S790 230 1010 255M555 410l-75-145M760 320l110-150M350 580l-120-140"/></g><g stroke-width="10"><path d="M160 720C330 660 390 430 560 410S790 230 1010 255M555 410l-75-145M760 320l110-150M350 580l-120-140"/><path d="M263 674l-22-31m119-84-31-20m127-98-34-8m91-41-22-30m111-22-11-35m106 4 24-29" stroke="#B7FAFF" stroke-width="5"/></g><g fill="#9AF5FF" stroke="#E8FFFF" stroke-width="4">${[[1010,255],[1050,236],[1086,264],[870,170],[900,146],[930,180],[480,265],[448,240]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="15"/>`).join("")}</g></g>`);

writeSvg("mission-5/incubator.svg", "Closed and open simulated incubator states", 900, 700, `<g id="closed"><rect x="70" y="70" width="330" height="560" rx="30" fill="#E9F3F6" stroke="${C.navy}" stroke-width="10"/><rect x="110" y="145" width="250" height="330" rx="18" fill="#A7D8E5" stroke="${C.blue}" stroke-width="8"/><circle cx="330" cy="105" r="14" fill="${C.success}"/><rect x="340" y="270" width="25" height="95" rx="12" fill="${C.navy}"/></g><g id="open"><rect x="500" y="70" width="330" height="560" rx="30" fill="#E9F3F6" stroke="${C.navy}" stroke-width="10"/><rect x="535" y="145" width="260" height="410" rx="18" fill="#B8D0D8" stroke="${C.blue}" stroke-width="8"/>${[220,340,460].map(y=>`<path d="M555 ${y}h220" stroke="${C.navy}" stroke-width="8"/><ellipse cx="665" cy="${y-18}" rx="88" ry="28" fill="#E6D79A" stroke="${C.navy}" stroke-width="5"/>`).join("")}<path d="M500 130 430 175v390l70 48z" fill="#D8E6EA" stroke="${C.navy}" stroke-width="10"/></g>`);
writeSvg("mission-5/culture-plate-choices.svg", "Four registered culture plate appearances", 1400, 700, `<g>${[175,525,875,1225].map((x,i)=>`<g transform="translate(${x} 350)"><circle r="145" fill="#EEF7FA" stroke="${C.navy}" stroke-width="9"/><circle r="124" fill="#E6D79A" stroke="#B79F55" stroke-width="5"/>${i===0?`<g fill="#5C786F" stroke="#E9F4EA" stroke-width="5">${[[0,0,78],[-55,-28,45],[55,28,50],[22,-62,42],[-32,65,38]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}"/>`).join("")}</g>`:i===1?`<circle r="18" fill="#D2C77C"/>`:i===2?`<g fill="#D8C6A0">${[[-55,-35],[40,-45],[-15,42],[62,35]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="13"/>`).join("")}</g>`:`<g fill="#C89471">${[[-65,-10],[-15,-55],[50,-28],[45,48],[-32,55]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="20"/>`).join("")}</g>`}</g>`).join("")}</g>`);

const colony = (x, color, accent) => `<g transform="translate(${x} 350)"><circle r="145" fill="#EEF7FA" stroke="${C.navy}" stroke-width="9"/><circle r="124" fill="#E6D79A" stroke="#B79F55" stroke-width="5"/><g fill="${color}" stroke="${accent}" stroke-width="4">${[[0,0,72],[-55,-22,42],[54,25,45],[16,-64,37],[-30,65,35]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}"/>`).join("")}</g></g>`;
writeSvg("mission-6/aspergillus-colony-set.svg", "Four simplified Aspergillus colony colour references", 1400, 700, colony(175,"#3E8C83","#9DD3C8")+colony(525,"#A4A72D","#D9DC72")+colony(875,"#1F2427","#666D70")+colony(1225,"#A56E48","#D7A681"));
const head = (x, color, mode) => `<g transform="translate(${x} 350)" stroke="${C.navy}" stroke-width="6"><path d="M0 125V-10"/><circle cy="-40" r="35" fill="${color}"/>${mode==="column"?`<path d="M-30-55c-35-80-35-150 0-195M-10-65c-8-85-5-150 10-205M15-65c12-85 18-145 25-195M32-55c38-74 43-136 42-180" fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round"/>`:`<g fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round">${[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(a=>`<path d="M0-40  ${Math.sin(a*Math.PI/180)*105} ${-40-Math.cos(a*Math.PI/180)*105}"/>`).join("")}</g>`}${mode==="bi"?`<circle cy="-40" r="72" fill="none" stroke="${color}" stroke-width="8"/>`:""}</g>`;
writeSvg("mission-6/aspergillus-microscopy-set.svg", "Four simplified Aspergillus conidial-head references", 1400, 700, head(175,"#3E8C83","column")+head(525,"#A4A72D","radiate")+head(875,"#202426","bi")+head(1225,"#A56E48","radiate"));
writeSvg("mission-6/identification-key-arrows.svg", "Branching identification key arrows", 1200, 500, `<g fill="none" stroke="${C.navy}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M600 35v90H300v110M600 125h300v110M300 235H150v120M300 235h150v120M900 235H750v120M900 235h150v120"/><path d="m125 330 25 25 25-25m250 0 25 25 25-25m250 0 25 25 25-25m250 0 25 25 25-25"/></g><g fill="${C.gold}" stroke="${C.navy}" stroke-width="5"><circle cx="600" cy="35" r="25"/><circle cx="300" cy="235" r="20"/><circle cx="900" cy="235" r="20"/></g>`);

const wells = [];
for (let row=0; row<8; row++) for (let col=0; col<12; col++) wells.push(`<circle cx="${150+col*82}" cy="${95+row*74}" r="25" fill="${C.soft}" stroke="${C.navy}" stroke-width="4" data-row="${row}" data-col="${col}"/>`);
writeSvg("mission-7/mic-plate.svg", "Simplified ninety-six well test plate geometry", 1200, 720, `<rect x="45" y="30" width="1110" height="660" rx="45" fill="#E8F4F7" stroke="${C.navy}" stroke-width="10"/><g>${wells.join("")}</g>`);

writeSvg("mission-8/journey-icons.svg", "Eight laboratory journey symbols", 1200, 400, `<g fill="white" stroke="${C.navy}" stroke-width="5">${Array.from({length:8},(_,i)=>`<rect x="${15+i*148}" y="65" width="135" height="270" rx="22"/>`).join("")}</g><g fill="${C.soft}" stroke="${C.blue}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M48 145h68v100H48zM48 145l34 34 34-34"/><path d="M200 145h70v90h-70zM212 175h46M212 198h46"/><path d="M385 130v120m-55-60h110"/><circle cx="526" cy="195" r="55"/><path d="M625 245h105M642 155h70l18 90H625z"/><path d="M800 255V145m-32 28 32-28 32 28"/><rect x="924" y="140" width="80" height="120" rx="12"/><path d="M1060 155h98v95h-98zM1075 180h68M1075 205h68"/></g>`);
writeSvg("completion/junior-mycologist-badge.svg", "Junior mycologist completion badge", 300, 300, `<circle cx="150" cy="150" r="138" fill="${C.gold}" stroke="${C.navy}" stroke-width="12"/><circle cx="150" cy="150" r="105" fill="white" stroke="${C.cyan}" stroke-width="8"/><path d="M86 190h130M105 180h90M145 72v90c0 22-16 36-38 36" fill="none" stroke="${C.navy}" stroke-width="14" stroke-linecap="round"/><path d="M130 65h55v24h-55z" fill="${C.cyan}" stroke="${C.navy}" stroke-width="8"/><path d="M205 83c30 0 50 19 50 42H155c0-23 20-42 50-42zM196 125h18v46h-18z" fill="${C.gold}" stroke="${C.navy}" stroke-width="8" stroke-linejoin="round"/>`);

async function raster(sourceKey, target, width, height, fit = "cover", position = "centre") {
  if (!input[sourceKey]) throw new Error(`Missing generated source ${sourceKey}`);
  await sharp(input[sourceKey]).resize(width, height, { fit, position }).png({ compressionLevel: 9 }).toFile(path.join(root, target));
}

async function guideRaster(sourceKey, target) {
  if (!input[sourceKey]) throw new Error(`Missing generated source ${sourceKey}`);
  const trimmed = await sharp(input[sourceKey]).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).resize({ width: 960, height: 900, fit: "inside" }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: trimmed, left: Math.round((1024 - meta.width) / 2), top: 30 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, target));
}

function esc(value) { return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
async function contactSheet(files, output, columns, cellW, cellH) {
  const cards = [];
  for (let i=0;i<files.length;i++) {
    const file = path.join(root, files[i]);
    const meta = await sharp(file).metadata();
    const thumb = await sharp(file, { density: 130 }).flatten({background:"#f7fcff"}).resize(cellW-24, cellH-62, {fit:"contain",background:"#f7fcff"}).png().toBuffer();
    const label = Buffer.from(svg(`${files[i]} label`, cellW, 50, `<rect width="${cellW}" height="50" fill="${C.navy}"/><text x="14" y="21" fill="white" font-family="Arial" font-size="14" font-weight="700">${esc(files[i])}</text><text x="14" y="41" fill="#BCEEF4" font-family="Arial" font-size="12">${meta.width} × ${meta.height}</text>`));
    const card = await sharp({create:{width:cellW,height:cellH,channels:4,background:"#ffffff"}}).composite([{input:thumb,left:12,top:8},{input:label,left:0,top:cellH-50}]).png().toBuffer();
    cards.push({input:card,left:(i%columns)*cellW,top:Math.floor(i/columns)*cellH});
  }
  const rows=Math.ceil(files.length/columns);
  await sharp({create:{width:columns*cellW,height:rows*cellH,channels:4,background:"#dff9fc"}}).composite(cards).png().toFile(path.join(root,"contact-sheets",output));
}

async function main() {
  await guideRaster("neutral", "shared/dr-mira-neutral.png");
  await guideRaster("pointing", "shared/dr-mira-pointing.png");
  await guideRaster("success", "shared/dr-mira-success.png");
  await raster("sharedbg", "shared/mycology-lab-background.png", 1536, 1024);
  await raster("reception", "mission-3/reception-background.png", 1536, 1024);
  await raster("processing", "mission-4/processing-bench-background.png", 1536, 1024);
  await raster("detective", "mission-8/detective-board-background.png", 1536, 1024);
  await raster("completion", "completion/completion-lab-background.png", 1536, 1024);

  const rasterFiles=["shared/dr-mira-neutral.png","shared/dr-mira-pointing.png","shared/dr-mira-success.png","shared/mycology-lab-background.png","mission-3/reception-background.png","mission-4/processing-bench-background.png","mission-8/detective-board-background.png","completion/completion-lab-background.png"];
  const svgFiles=[];
  for(const dir of dirs.filter(d=>!d.includes("contact")&&!d.includes("sources"))) for(const name of fs.readdirSync(path.join(root,dir))) if(name.endsWith(".svg")) svgFiles.push(`${dir}/${name}`);
  await contactSheet(rasterFiles,"shared-and-backgrounds.png",2,520,380);
  await contactSheet(svgFiles,"mission-assets.png",3,420,310);
  await contactSheet(["shared/dr-mira-neutral.png","shared/dr-mira-pointing.png","shared/dr-mira-success.png","mission-5/culture-plate-choices.svg","mission-6/aspergillus-colony-set.svg","mission-6/aspergillus-microscopy-set.svg"],"state-families.png",3,440,360);

  const all=[...rasterFiles,...svgFiles].sort();
  const usage={};
  const sourceNotes={};
  for(const file of all){
    const p=path.join(root,file); const buf=fs.readFileSync(p); let meta=await sharp(p,{density:130}).metadata();
    if(file.endsWith(".svg")){
      const source=buf.toString("utf8");
      meta={...meta,width:Number(source.match(/<svg[^>]*\bwidth="([0-9.]+)"/)?.[1]),height:Number(source.match(/<svg[^>]*\bheight="([0-9.]+)"/)?.[1])};
    }
    const missionMatch=file.match(/mission-(\d)/);
    usage[file]=missionMatch?[Number(missionMatch[1])]:file.startsWith("completion/")?[8]:[1,2,3,4,5,6,7,8];
    sourceNotes[file]=file.endsWith(".png")?"OpenAI generated raster, resized and registered with Sharp":"Repository-native SVG";
    manifest.assets.push({id:file.replace(/\.[^.]+$/,"").replace(/\//g,"-"),file,type:path.extname(file).slice(1),width:meta.width,height:meta.height,bytes:buf.length,sha256:crypto.createHash("sha256").update(buf).digest("hex"),background:file.includes("background")?"opaque":"transparent-or-svg",source:sourceNotes[file],missions:usage[file],usage:"See MYCOLOGY_ASSETS.md",alt:path.basename(file,path.extname(file)).replace(/-/g," "),registrationFamily:file.includes("dr-mira")?"dr-mira":file.includes("aspergillus")?"aspergillus-reference":file.includes("culture-plate-choices")?"culture-choices":null,anchor:file.includes("dr-mira")?{"x":512,"y":930}:null,scientificNotes:"Educational illustration; live copy supplies interpretation.",prohibited:["real patient data","logos","baked answer labels"],status:"production"});
  }
  fs.writeFileSync(path.join(root,"asset-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  fs.writeFileSync(path.join(root,"sources","generation-prompts.md"),`# Mycology Raster Generation Notes\n\nGenerated with the built-in OpenAI image-generation tool on 20 September 2026. Prompts locked a polished semi-realistic 3D educational style, soft cool upper-left lighting, SiTC teal/navy/cyan/gold palette, safe overlay areas, and prohibited text, labels, logos, watermarks, real patient data, and open-culture handling. Dr Mira variants used the neutral pose as their identity and registration reference.\n`);
}

const manifest={schemaVersion:1,generatedAt:"2026-09-20T00:00:00Z",palette:C,style:"Friendly semi-realistic 3D raster environments plus deterministic scientific SVG",assets:[]};
main().catch((error)=>{console.error(error);process.exit(1);});

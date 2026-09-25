// Run after changing site files: node tools/generate-offline-manifest.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const folders = ['assets', 'bacteriology', 'case-library', 'chemistry', 'haematology', 'histology', 'lab-hero', 'mycology', 'transfusion'];
const extensions = /\.(html|css|js|json|png|jpe?g|svg|webp|gif|woff2?|mp3|mp4)$/i;
const files = ['index.html', 'hub.js', 'styles.css', 'offline.js', 'manifest.webmanifest', 'offline-icon.svg'];
function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const name = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'tests') walk(name);
    } else if (extensions.test(entry.name)) files.push(name);
  }
}
folders.forEach(walk);
files.sort();
const version = crypto.createHash('sha256');
let bytes = 0;
for (const file of files) {
  const content = fs.readFileSync(path.join(root, file));
  version.update(file).update(content);
  bytes += content.length;
}
fs.writeFileSync(path.join(root, 'offline-files.json'), JSON.stringify({
  version: version.digest('hex').slice(0, 16), bytes,
  files: files.map(file => file.split('/').map(encodeURIComponent).join('/'))
}, null, 2) + '\n');
console.log(`${files.length} files, ${(bytes / 1048576).toFixed(1)} MiB`);

// Namensregel: Nur Christian hat einen Namen. Prüft Code, HTML, README, Tools und Tests auf alte Personennamen.
'use strict';
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const BAD = ['Ka' + 'lle', 'Ra' + 'lf', 'Bir' + 'git', 'Gün' + 'ther', 'Yil' + 'maz', 'Sta' + 'hl', 'Hen' + 'rike', 'To' + 'bi', 'Kyo' + 'cera', 'Brett' + 'schneider'];
const files = [];
const walk = d => fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|html|md|py|css)$/.test(f)) files.push(p); });
['js', 'tools', 'test', 'css', 'docs'].forEach(d => walk(path.join(root, d)));
files.push(path.join(root, 'index.html'), path.join(root, 'README.md'));
let bad = 0;
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const w of BAD) { const re = new RegExp('\\b' + w + '\\b', 'i'); if (re.test(txt)) { console.log('Name gefunden:', w, 'in', path.relative(root, f)); bad++; } }
}
if (bad) { console.log(bad + ' Verstöße gegen die Namensregel'); process.exit(1); }
console.log('ok Namensregel (' + files.length + ' Dateien)');

// Namensregel: Nur Christian und Sandra haben Namen (v0.9). Prüft Code, HTML, README, Tools und Tests auf alte Personennamen.
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
// v0.9: genau zwei spielbare Figuren mit Namen, und das Spiel enthält keine Gesundheitsthemen rund um die Figuren
// (»MES« heißt Manufacturing Execution System; die Abkürzung »MS« kommt im Spieltext nicht vor)
global.window = global.window || {}; const SCx = require('./helper.js');
const names = Object.values(SCx.FIGUREN).map(f => f.name).sort();
if (JSON.stringify(names) !== JSON.stringify(['Christian', 'Sandra'])) { console.log('Figurennamen falsch:', names.join(', ')); bad++; }
const HEALTH = /\bMS\b|Sklerose|Rollstuhl|Diagnose|Therapie|Medikament|Arzttermin/;
for (const f of files.filter(f => /[\\/](js|css)[\\/]/.test(f) || /index\.html$/.test(f))) { const txt = fs.readFileSync(f, 'utf8'); if (HEALTH.test(txt)) { console.log('Gesundheitsthema gefunden in', path.relative(root, f), txt.match(HEALTH)[0]); bad++; } }
// Neue Figurentexte: kein anderer Personenname als Christian oder Sandra in »Name:«-artigen Anreden
const figTxt = JSON.stringify([SCx.FIGUREN, SCx.CHRISTIAN_TIPPS, SCx.SANDRA_NPC, SCx.SANDRA_SZENEN, SCx.SANDRA_TAG1, SCx.KOLLEGE_BUBBLES]);
for (const m of figTxt.matchAll(/\b([A-ZÄÖÜ][a-zäöüß]+), (?:die|der) (?:neue|erfahrene|Kollegin|Kollege)/g)) if (!['Christian', 'Sandra'].includes(m[1])) { console.log('Unbekannter Name:', m[1]); bad++; }
if (bad) { console.log(bad + ' Verstöße gegen die Namensregel'); process.exit(1); }
console.log('ok Namensregel (' + files.length + ' Dateien)');

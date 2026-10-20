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
// v0.11: Kein Kollege wird abwertend als untätig bezeichnet. Das Wort und seine Varianten sind überall verboten
// (Wort zusammengesetzt, damit es auch hier nicht im Klartext steht; »fault« im Code heißt Störung und ist nicht gemeint).
const W1 = 'f' + 'aul', W2 = 'la' + 'zy';
const SCHMAEH = new RegExp(W1 + '(?!t)|' + W2, 'i'); // auch in Zusammensetzungen; fault, faulty, faulted bleiben erlaubt
for (const f of files) { const txt = fs.readFileSync(f, 'utf8'); const m = txt.match(SCHMAEH); if (m) { console.log('Abwertendes Wort gefunden in', path.relative(root, f), m[0]); bad++; } if (SCHMAEH.test(path.basename(f))) { console.log('Dateiname:', f); bad++; } }
for (const t of [].concat(...Object.values(SCx.BUBBLES), ...Object.values(SCx.VISIT_TEXT || {}).flat(), SCx.PARTY_GAESTE || '', Object.values(SCx.SANDRA_SZENEN3 || {}), Object.values(SCx.SANDRA_SZENEN2 || {}))) if (SCHMAEH.test(String(t))) { console.log('Spieltext:', t); bad++; }
// v0.12: Das Spiel macht keine Netzwerkaufrufe (keine Telemetrie). Gilt für js/ und index.html.
const NETZ = new RegExp('\\b(' + ['fe' + 'tch\\s*\\(', 'XMLHttp' + 'Request', 'send' + 'Beacon', 'Web' + 'Socket', 'Event' + 'Source'].join('|') + ')');
for (const f of [path.join(root, 'index.html')].concat(fs.readdirSync(path.join(root, 'js')).map(x => path.join(root, 'js', x)))) { const m = fs.readFileSync(f, 'utf8').match(NETZ); if (m) { console.log('Netzwerkaufruf in', path.relative(root, f), m[0]); bad++; } }
{ const h = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); const ext = (h.match(/(src|href)=["'](https?:)?\/\/[^"']+/g) || []); if (ext.length) { console.log('Externe Quelle in index.html:', ext.join(', ')); bad++; } }
if (bad) { console.log(bad + ' Verstöße gegen die Namensregel'); process.exit(1); }
console.log('ok Namensregel (' + files.length + ' Dateien)');

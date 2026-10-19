// Grundtests der Spiellogik: node test/sim.test.js
'use strict';
const assert = require('assert');
const SC = require('./helper.js'); const sim = SC.sim;
let n = 0; const t = (name, f) => { f(); n++; console.log('ok', name); };
t('neues Spiel', () => { const S = sim.newGame(42); assert.strictEqual(S.day, 1); assert.strictEqual(S.modules.length, 5); assert.ok(S.meetings.length >= 1); assert.strictEqual(S.meetings[0].kind, 'chef'); });
t('Pipeline-Reihenfolge erzwungen', () => { const S = sim.newGame(1); assert.ok(!sim.act(S, 'buero', 'spec').ok); assert.ok(sim.act(S, 'halle', 'req').ok); assert.strictEqual(S.modules[0].req, 1); });
t('verpasstes Chef-Meeting kostet Laune', () => { const S = sim.newGame(3); const c = S.chef; sim.advance(S, 9 * 60 + 20 - S.minute); assert.ok(S.chef < c); assert.strictEqual(S.meetings[0].state, 'missed'); });
t('Meeting besuchen', () => { const S = sim.newGame(3); sim.advance(S, 9 * 60 - 5 - S.minute); assert.ok(sim.act(S, 'meeting', 'attend').ok); assert.strictEqual(S.meetings[0].state, 'done'); });
t('Excel fehlt am Abend', () => { const S = sim.newGame(5); S.minute = SC.DAY_END; const c = S.chef; sim.endDay(S); assert.ok(S.lastReport.lines.some(l => /Excel/.test(l[1]))); });
t('Feierabend erst ab 15 Uhr', () => { const S = sim.newGame(5); assert.ok(!sim.act(S, 'pforte', 'home').ok); S.minute = 15 * 60; assert.ok(sim.act(S, 'pforte', 'home').ok); });
t('Wochenendschicht kostet Familie', () => { const S = sim.newGame(5); const f = S.family; sim.weekend(S, 2); assert.strictEqual(S.family, f - 26); });
t('Spiel endet spätestens am Termin', () => { const S = sim.newGame(9); let g = 0; while (S.phase !== 'ende' && g++ < 40) { S.minute = SC.DAY_END; sim.endDay(S); if (S.phase === 'wochenende') sim.weekend(S, 0); sim.startDay(S); } assert.strictEqual(S.phase, 'ende'); assert.ok(!S.result.win); });
console.log(n + ' Tests ok');

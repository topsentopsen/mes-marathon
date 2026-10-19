// Balance-Bot: spielt viele Partien mit einfachen Strategien. Aufruf: node tools/bot.js [anzahl]
'use strict';
const SC = require('../test/helper.js'); const sim = SC.sim;
const WALK = 8; // Minuten je Raumwechsel (Laufen + Aufzug)
function tryAct(S, room, id) { const a = sim.actions[room].find(x => x.id === id); if (a.check(S)) return false; if (S.at !== room) { sim.advance(S, WALK); S.at = room; if (a.check(S)) return false; } return sim.act(S, room, id).ok; }
function playDay(S, P) {
  S.at = 'pforte';
  let guard = 0;
  while (S.phase === 'tag' && guard++ < 200) {
    if (S.burnout || S.minute >= SC.LATEST) break;
    if (S.minute >= (P.leave || SC.DAY_END)) { break; }
    const m = sim.activeMeeting(S);
    const goM = m && (P.meet === 'all' || (P.meet === 'chef' && m.kind !== 'kalle') || (P.meet === 'smart' && (m.kind !== 'kalle' || S.kalle < 55)));
    if (goM) { if (S.at !== 'meeting') { sim.advance(S, WALK); S.at = 'meeting'; } if (tryAct(S, 'meeting', 'attend')) continue; }
    const nm = sim.nextMeeting(S);
    if (nm && goMeetSoon(S, nm, P) && nm.start - S.minute < 60 && nm.start - S.minute > 0) { sim.advance(S, Math.min(nm.start - S.minute, 15)); continue; }
    if (P.excel && !S.excel && S.minute > 14 * 60 && tryAct(S, 'buero', 'excel')) continue;
    if (S.energy < 40 && S.coffee < 3 && tryAct(S, 'kantine', 'coffee')) continue;
    if (!S.lunch && S.minute >= 11.5 * 60 && tryAct(S, 'kantine', 'lunch')) continue;
    if (!S.server.up && tryAct(S, 'server', 'restart')) continue;
    if (S.printer.jam && sim.targets.print(S) && tryAct(S, 'drucker', 'fix')) continue;
    if (P.report && S.excel && S.reported !== S.day && tryAct(S, 'chef', 'report')) continue;
    if (tryAct(S, 'chef', 'abnahme') || tryAct(S, 'drucker', 'print') || tryAct(S, 'server', 'deploy') || tryAct(S, 'halle', 'test') || tryAct(S, 'buero', 'impl') || tryAct(S, 'buero', 'spec') || tryAct(S, 'halle', 'req')) continue;
    if (P.care && tryAct(S, 'server', 'care')) continue;
    if (tryAct(S, 'schicht', 'kalle')) continue;
    sim.advance(S, 15);
  }
  if (S.phase === 'tag') sim.endDay(S);
  if (S.phase === 'wochenende') sim.weekend(S, P.we(S));
  if (S.phase !== 'ende') sim.startDay(S);
}
function goMeetSoon(S, m, P) { return P.meet === 'all' || m.kind !== 'kalle' || (P.meet === 'smart' && S.kalle < 55); }
const POL = {
  passiv: { meet: 'none', excel: false, we: () => 0, leave: 15 * 60 },
  einfach: { meet: 'chef', excel: true, we: () => 0 },
  gut: { meet: 'smart', excel: true, report: true, care: true, we: S => S.family > 55 ? 1 : 0 },
  meetingfan: { meet: 'all', excel: true, report: true, we: () => 0 },
  gut_ohneWE: { meet: 'smart', excel: true, report: true, care: true, we: () => 0 },
  gut_ohneCare: { meet: 'smart', excel: true, report: true, we: S => S.family > 55 ? 1 : 0 },
  einfachWE: { meet: 'chef', excel: true, we: S => S.family > 55 ? 1 : 0 },
  workaholic: { meet: 'chef', excel: true, we: () => 2, leave: 19 * 60 + 30 }
};
const n = +process.argv[2] || 200;
for (const [k, P] of Object.entries(POL)) {
  const r = { win: 0, chef: 0, fam: 0, dead: 0, days: [], prog: [] };
  for (let i = 0; i < n; i++) {
    const S = sim.newGame(1000 + i * 7919);
    let g = 0; while (S.phase !== 'ende' && g++ < 40) playDay(S, P);
    const w = S.result.why;
    if (S.result.win) { r.win++; r.days.push(S.day); } else if (/Werksleitung zieht/.test(w)) r.chef++; else if (/Imker/.test(w)) r.fam++; else r.dead++;
    r.prog.push(sim.progress(S));
  }
  const med = a => a.length ? a.sort((x, y) => x - y)[Math.floor(a.length / 2)] : '-';
  console.log(k.padEnd(11), 'Sieg', r.win, 'Siegtag', med(r.days), '| Chef raus', r.chef, '| Familie', r.fam, '| Termin', r.dead, '| Fortschritt Median', med(r.prog));
}

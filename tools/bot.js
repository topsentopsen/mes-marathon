// Balance-Bot: spielt viele Partien mit einfachen Strategien.
// Aufruf: node tools/bot.js [anzahl] [--check]
'use strict';
const SC = require('../test/helper.js'); const sim = SC.sim;
const WALK = 8; // Minuten je Raumwechsel (Laufen + Aufzug)
let FREE = Infinity; // Minuten bis zum nächsten gewünschten Meeting
function tryAct(S, room, id) {
  if (S.pending) return false;
  const a = sim.actions[room].find(x => x.id === id); if (a.check(S)) return false;
  if (room !== 'meeting' && a.cost * sim.slow(S) + (S.at !== room ? WALK : 0) > FREE) return false;
  if (S.at !== room) { sim.advance(S, WALK); S.at = room; if (S.pending || a.check(S)) return false; }
  return sim.act(S, room, id).ok;
}
function resolveVisit(S, P) {
  const p = S.pending, opts = sim.visitOptions(S).map(o => o.id);
  let c = opts[opts.length - 1];
  if (p.id === 'itchefin') {
    if (P.visit === 'skip') c = 'skip';
    else { const right = p.opts.indexOf(SC.PYRAMID_Q[p.q].a); c = sim.rng(S) < P.pyr ? 'a' + right : 'a' + Math.floor(sim.rng(S) * 3); }
  } else if (opts.length === 1) c = opts[0];
  // v0.3 Pflicht-Ereignisse: feste, nachvollziehbare Regeln (passiv nimmt immer die letzte Option)
  else if (p.id === 'rivale') c = P.gegen !== false && P.visit !== 'skip' && S.budget >= 15 ? 'gegen' : 'hin';
  else if (p.id === 'kaffee') c = P.visit === 'skip' ? 'durchhalten' : S.energy < 70 ? 'kantine' : 'durchhalten';
  else if (p.id === 'kreis') c = P.visit === 'skip' ? 'spaeter' : 'meeting';
  else if (p.id === 'raetsel') c = P.visit === 'skip' ? 'ticket' : S.budget >= 15 ? 'service' : 'aus';
  else if (p.id === 'party') c = opts[S.seed % opts.length];
  else if (P.visit === 'listen') c = opts[0];
  else if (P.visit === 'smart') c = (p.id === 'italien' && (S.energy < 60 || S.itStreak > 0)) || p.id === 'altwerk' ? opts[0] : opts[1];
  else c = opts[1];
  sim.choose(S, c);
}
function playDay(S, P) {
  S.at = 'pforte';
  let guard = 0;
  while (S.phase === 'tag' && guard++ < 300) {
    if (S.pending) { resolveVisit(S, P); continue; }
    if (S.burnout || S.minute >= SC.LATEST) break;
    if (S.minute >= (P.leave || SC.DAY_END)) break;
    const m = sim.activeMeeting(S);
    const wants = mt => P.meet === 'all' || (mt.kind !== 'schicht' && P.meet !== 'none') || (P.meet === 'smart' && S.schicht < 55);
    if (m && wants(m)) { if (S.at !== 'meeting') { sim.advance(S, WALK); S.at = 'meeting'; } if (tryAct(S, 'meeting', 'attend')) continue; if (S.pending) continue; }
    const nm = sim.nextMeeting(S);
    FREE = nm && wants(nm) && nm.start > S.minute ? nm.start + 5 - S.minute - WALK : Infinity;
    const short = FREE < 75;
    if (P.excel && !S.excel && (S.minute > 14 * 60 || short) && tryAct(S, 'buero', 'excel')) continue;
    if (short && P.bericht && tryAct(S, 'leitstand', 'bericht')) continue;
    if (short && P.report && S.excel && S.reported !== S.day && tryAct(S, 'chef', 'report')) continue;
    if (S.energy < 40 && S.coffee < 3 && tryAct(S, 'kantine', 'coffee')) continue;
    if (!S.lunch && S.minute >= 11.5 * 60 && tryAct(S, 'kantine', 'lunch')) continue;
    if (P.tranche && S.trancheWeek !== sim.week(S) && tryAct(S, 'controlling', 'tranche')) continue;
    if (P.kredit && S.budget < 10 && tryAct(S, 'controlling', 'kredit')) continue;
    if (P.kredit && S.budget > 40 && S.kredit > 0 && tryAct(S, 'controlling', 'tilgen')) continue;
    if (P.zusage && !S.zusage && S.day >= 3 && tryAct(S, 'chef', 'z_' + P.zusage)) continue;
    if (P.berater && S.budget > 45 && tryAct(S, 'controlling', 'berater')) continue;
    if (!S.server.up && tryAct(S, 'server', 'restart')) continue;
    if (P.repair && !sim.targets.test(S) && sim.targets.testAny(S) && tryAct(S, 'werkstatt', P.repair === 'notbehelf' ? 'notbehelf' : 'repair')) continue;
    if (P.repairAll && S.stations.some(st => st.fault) && tryAct(S, 'werkstatt', 'repair')) continue;
    if (S.printer.jam && sim.targets.print(S) && tryAct(S, 'drucker', 'fix')) continue;
    if (P.schichtplan && S.minute < 12 * 60 && sim.targets.testAny(S) && tryAct(S, 'schicht', 'schichtplan')) continue;
    if (P.report && S.excel && S.reported !== S.day && tryAct(S, 'chef', 'report')) continue;
    if (P.bericht && S.minute >= 13 * 60 && tryAct(S, 'leitstand', 'bericht')) continue;
    if (((P.migrate !== false && S.sap.state === 'migration') || S.sap.state === 'nacharbeit') && tryAct(S, 'buero', 'migrate')) continue;
    if (tryAct(S, 'chef', 'abnahme') || tryAct(S, 'drucker', 'print') || tryAct(S, 'server', 'deploy') || tryAct(S, 'halle', 'test') || tryAct(S, 'buero', 'impl') || tryAct(S, 'buero', 'spec') || tryAct(S, 'halle', 'req')) continue;
    if (P.review && tryAct(S, 'it', 'review')) continue;
    if (P.care && tryAct(S, 'server', 'care')) continue;
    if (P.repair && tryAct(S, 'werkstatt', P.repair === 'notbehelf' ? 'notbehelf' : 'repair')) continue;
    if (FREE === Infinity && tryAct(S, 'schicht', 'gespraech')) continue;
    if (nm && wants(nm) && FREE < Infinity && S.minute < nm.start - 15) { sim.advance(S, Math.max(1, Math.min(15, nm.start - 15 - S.minute))); continue; }
    sim.advance(S, 15);
  }
  if (S.phase === 'tag') sim.endDay(S);
  if (S.phase === 'wochenende') sim.weekend(S, P.we(S));
  if (S.phase !== 'ende') sim.startDay(S);
}
const BASE = { repairAll: true, excel: true, report: true, bericht: true, tranche: true, repair: 'repair', visit: 'smart', pyr: 0.8, care: false, review: true, meet: 'smart', schichtplan: true, we: S => (S.sap.cutover ? 1 : S.family > 55 ? 1 : 0) };
const P = o => Object.assign({}, BASE, o);
const POL = {
  passiv: { meet: 'none', excel: false, report: false, bericht: false, tranche: false, repair: false, review: false, schichtplan: false, visit: 'skip', leave: 15 * 60, we: () => 0 },
  einfach: P({ repairAll: false, meet: 'chef', repair: 'notbehelf', schichtplan: false, bericht: false, review: false, we: () => 0 }),
  gut: P({ care: true }),
  meetingfan: P({ care: true, meet: 'all', schichtplan: false }),
  meetingfan_plus: P({ care: true, meet: 'all' }),
  ohneSchichtplan: P({ care: true, schichtplan: false }),
  ablenkbar: P({ care: true, visit: 'listen' }),
  berater: P({ care: true, berater: true, kredit: true }),
  workaholic: P({ meet: 'chef', we: () => 2, leave: 19 * 60 + 30 }),
  fleissig: P({ care: true, we: S => (S.sap.cutover || S.family > 60 ? 1 : 0), leave: 18 * 60 }),
  sparfuchs: P({ care: true, tranche: false }),
  // Chaos-Pfad: migriert keine SAP-Stammdaten und nimmt beim Cutover frei (we: 0)
  ohneGegen: P({ care: true, gegen: false }),
  zusager: P({ care: true, zusage: 'mittel' }),
  waghalsig: P({ care: true, zusage: 'kurz' }),
  sapChaos: P({ care: true, migrate: false, we: S => (S.sap.cutover ? 0 : S.family > 55 ? 1 : 0) })
};
function run(n) {
  const rows = {};
  for (const [k, pol] of Object.entries(POL)) {
    const r = { win: 0, chef: 0, fam: 0, dead: 0, budget: 0, days: [], prog: [], bud: [], kpi: [], meet: [], useless: [], chaos: 0 };
    for (let i = 0; i < n; i++) {
      const S = sim.newGame(1000 + i * 7919);
      let g = 0; while (S.phase !== 'ende' && g++ < 40) playDay(S, pol);
      const w = S.result.why;
      if (S.result.win) { r.win++; r.days.push(S.day); } else if (/Werkleitung zieht/.test(w)) r.chef++; else if (/Imker/.test(w)) r.fam++; else if (/Controlling/.test(w)) r.budget++; else r.dead++;
      r.prog.push(sim.progress(S)); r.bud.push(S.budget); r.kpi.push(sim.kpiIndex(S)); r.meet.push(S.stats.meetings); r.useless.push(S.stats.useless); if (S.stats.chaosDays) r.chaos++;
    }
    const med = a => a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : '-';
    rows[k] = { win: Math.round(r.win / n * 100), winDay: med(r.days), chef: r.chef, fam: r.fam, termin: r.dead, budget: r.budget, prog: med(r.prog), bud: med(r.bud), kpi: med(r.kpi), meet: med(r.meet), useless: med(r.useless), chaos: Math.round(r.chaos / n * 100) };
  }
  return rows;
}
if (require.main === module) {
  const n = +process.argv[2] || 200;
  const rows = run(n);
  console.log('Strategie        Sieg%  Siegtag | Werkl. Familie Termin Budget | Fortschr. Budget KPI Meet(nutzlos) Chaos%');
  for (const [k, x] of Object.entries(rows)) console.log(k.padEnd(16), String(x.win).padStart(5), String(x.winDay).padStart(8), '|', String(x.chef).padStart(6), String(x.fam).padStart(7), String(x.termin).padStart(6), String(x.budget).padStart(6), '|', String(x.prog).padStart(9), String(x.bud).padStart(6), String(x.kpi).padStart(3), (x.meet + '(' + x.useless + ')').padStart(13), String(x.chaos).padStart(6));
  if (process.argv.includes('--check')) {
    const R = rows, errs = [], warn = [];
    const best = Math.max(...Object.values(R).map(x => x.win));
    // harte Invarianten (Auftrag: Meeting-Marathon ist nicht die stärkste Strategie)
    if (R.meetingfan.win > R.gut.win - 15) errs.push('meetingfan nicht >= 15 PP unter gut');
    if (R.meetingfan_plus.win > R.gut.win - 8) errs.push('meetingfan_plus nicht >= 8 PP unter gut');
    // v0.3: Die beste Strategie muss eine »vernünftige« sein (keine Meeting-, Passiv- oder Chaos-Strategie).
    // fleissig (maßvolle Überstunden + Samstagsschicht) darf vorn liegen, muss aber mindestens 20 % der Partien über die Familie verlieren.
    const SANE = ['gut', 'berater', 'fleissig', 'ohneGegen', 'zusager'];
    if (!SANE.some(k => R[k].win === best)) errs.push('beste Strategie ist keine der vernünftigen (' + SANE.join(', ') + ')');
    if (R.fleissig.fam < n * 0.2) errs.push('fleissig verliert zu selten über die Familie');
    const rank = Object.values(R).map(x => x.win).sort((a, b) => b - a).indexOf(R.meetingfan.win) + 1;
    if (rank < 4) errs.push('meetingfan auf Rang ' + rank + ' (höchstens Rang 4 erlaubt)');
    if (R.passiv.win > 5) errs.push('passiv gewinnt zu oft');
    if (best > 75) errs.push('Spiel zu leicht (> 75 %)');
    if (R.sapChaos.chaos < 90) errs.push('Chaos-Pfad nicht abgedeckt (sapChaos Chaos% ' + R.sapChaos.chaos + ')');
    if (R.sapChaos.win > R.gut.win - 8) errs.push('SAP-Chaos lohnt sich (sapChaos nicht >= 8 PP unter gut)');
    // Zielbereiche aus docs/PHASEN.md 10.2 (Abweichungen als Warnung)
    const Z = { einfach: [20, 40], gut: [55, 70], ohneSchichtplan: [45, 62], meetingfan: [8, 30], ablenkbar: [30, 50], berater: [50, 68], workaholic: [0, 5], sparfuchs: [35, 55] };
    for (const [k, [lo, hi]] of Object.entries(Z)) if (R[k].win < lo || R[k].win > hi) warn.push(k + ' ' + R[k].win + ' % (Ziel ' + lo + '–' + hi + ')');
    if (R.ohneSchichtplan.win > R.gut.win - 3) warn.push('ohneSchichtplan nicht >= 3 PP unter gut');
    if (warn.length) console.log('WARNUNG Zielbereiche: ' + warn.join('; '));
    console.log(errs.length ? 'CHECK FEHLER: ' + errs.join('; ') : 'CHECK OK (harte Invarianten)');
    process.exitCode = errs.length ? 1 : 0;
  }
}
module.exports = { run, POL, playDay };

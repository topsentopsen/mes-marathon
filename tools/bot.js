// Balance-Bot: spielt viele Partien mit einfachen Strategien.
// Aufruf: node tools/bot.js [anzahl] [--check] [--figur=sandra|ivo] [--ea]
// Early Access: ohne --ea misst der Bot das volle Spiel (SC.EA = null), mit --ea das eine Level (Woche 1, Sieg = Ziel der Woche erreicht)
'use strict';
const SC = require('../test/helper.js'); const sim = SC.sim;
const WALK = 8; // Minuten je Raumwechsel (Laufen + Aufzug)
let FREE = Infinity; // Minuten bis zum nächsten gewünschten Meeting
function tryAct(S, room, id) {
  if (S.pending) return false;
  const a = sim.actions[room].find(x => x.id === id); if (a.check(S)) return false;
  if (room !== 'meeting' && a.cost * sim.slow(S) * sim.figF(S, id) + (S.at !== room ? WALK : 0) > FREE) return false;
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
  else if (p.id === 'tesla' && P.elon && opts.includes('thema')) c = 'thema';
  else if (p.id === 'christian') c = P.visit === 'skip' ? 'spaeter' : 'zuhoeren';
  else if (P.visit === 'listen') c = opts[0];
  else if (P.visit === 'smart') c = (p.id === 'italien' && (S.energy < 60 || S.itStreak > 0)) || p.id === 'altwerk' ? opts[0] : opts[1];
  else c = opts[1];
  sim.choose(S, c);
}
// v0.4 Markt: nur sichtbare Angebote und Preise, keine versteckten Felder
function marktWahl(S, P) {
  if (!P.markt || !S.markt || S.markt.bought) return -1;
  const O = S.markt.offers, idx = id => O.findIndex(o => o.id === id);
  const paper = !!(sim.targets.req(S) || sim.targets.spec(S));
  if (P.markt === 'spar') { const l = idx('lizenz'); if (l >= 0 && S.budget < 70) return l; return -1; }
  if (P.markt === 'klug') { const l = idx('lizenz'); if (l >= 0 && S.budget < 20) return l; const k = idx('paket'); if (k >= 0 && paper && O[k].price <= 15 && S.budget > 50) return k; return -1; }
  // v0.5 image: Agentur-Kampagne und Pressemitteilung für das Konzernaudit, sonst wie klug
  if (P.markt === 'image') { for (const id of ['kampagne', 'presse']) { const k = idx(id); if (k >= 0 && S.budget - O[k].price > 25) return k; } const l = idx('lizenz'); if (l >= 0 && S.budget < 20) return l; return -1; }
  if (P.markt === 'fan') { let best = -1; O.forEach((o, i) => { const it = SC.MARKT.find(x => x.id === o.id); if (it.sell || o.price > S.budget - 10 || (o.id === 'paket' && !paper)) return; if (best < 0 || o.price < O[best].price) best = i; }); return best; }
  return -1;
}
// v0.5 Ausschreibung: nur sichtbare Werte (Los, Richtpreis, das zuletzt bekannte Nord-Gebot im Verhältnis zum Richtpreis)
function auktionWahl(S, P) {
  // nur, wenn Christian ohnehin im Büro oder im Controlling steht (kein Extra-Weg)
  if (!P.auktion || !sim.auktionOpen(S) || S.auktion.bid !== null || (S.at !== 'buero' && S.at !== 'controlling')) return -1;
  const F = SC.TUNE.auktion.bids;
  if (P.auktion === 'mittel') return S.budget > 45 ? 1 : -1;
  if (P.auktion === 'schlau') { if (S.budget < 35) return -1; if (S.nordLastR === null || S.nordLastR === undefined) return 1; const i = F.findIndex(f => f > S.nordLastR); return i < 0 ? 2 : i; }
  return -1;
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
    // v0.5 Süßigkeitenbox: nur sichtbare Werte (Box-Inhalt, Woche); 'mit' füllt auf, wenn er ohnehin in der Kantine steht, 'extra' geht dafür hin
    // v0.6 Gag-Fan: Pappkamerad und Fax je dreimal, wenn er ohnehin im Raum ist
    if (P.gag && S.at === 'buero' && S.stats.pappe < 3 && tryAct(S, 'buero', 'pappe')) continue;
    if (P.gag && S.at === 'drucker' && S.stats.fax < 3 && tryAct(S, 'drucker', 'fax')) continue;
    if (P.suess && S.box.week !== sim.week(S) && S.box.n <= 3 && (S.at === 'kantine' || P.suessWeg) && tryAct(S, 'kantine', 'box_' + P.suess)) continue;
    if (!S.lunch && S.minute >= 11.5 * 60 && tryAct(S, 'kantine', 'lunch')) continue;
    if (P.suess && S.box.week !== sim.week(S) && S.box.n <= 3 && S.at === 'kantine' && tryAct(S, 'kantine', 'box_' + P.suess)) continue;
    if (P.tranche && S.trancheWeek !== sim.week(S) && tryAct(S, 'controlling', 'tranche')) continue;
    if (P.kredit && S.budget < 10 && tryAct(S, 'controlling', 'kredit')) continue;
    if (P.kredit && S.budget > 40 && S.kredit > 0 && tryAct(S, 'controlling', 'tilgen')) continue;
    // v0.4 Prognose (nur aus HUD-Werten: KPI-Index und Plan stehen im Leitstand) und Wassermelone
    if (P.plan && S.at === 'leitstand' && sim.weekday(S) <= 1 && S.prog.week !== sim.week(S) && tryAct(S, 'leitstand', ['p_lo', 'p_mid', 'p_hi'][sim.prognoseBand(S)])) continue;
    if (P.melone && S.prog.melone !== sim.week(S) && tryAct(S, 'leitstand', 'melone')) continue;
    { const i = marktWahl(S, P); if (i >= 0 && tryAct(S, 'controlling', 'm' + i)) continue; }
    { const i = auktionWahl(S, P); if (i >= 0 && tryAct(S, S.at === 'controlling' ? 'controlling' : 'buero', 'a' + i)) continue; }
    if (P.kopf && S.kopf !== S.day && S.vDay === S.day && S.vN >= P.kopf && sim.kopfhoerer(S).ok) continue;
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
const BASE = { plan: true, markt: 'klug', repairAll: true, excel: true, report: true, bericht: true, tranche: true, repair: 'repair', visit: 'smart', pyr: 0.8, care: false, review: true, meet: 'smart', schichtplan: true, we: S => (S.sap.cutover ? 1 : S.family > 55 ? 1 : 0) };
const P = o => Object.assign({}, BASE, o);
const POL = {
  passiv: { meet: 'none', excel: false, report: false, bericht: false, tranche: false, repair: false, review: false, schichtplan: false, visit: 'skip', leave: 15 * 60, we: () => 0 },
  einfach: P({ repairAll: false, meet: 'chef', repair: 'notbehelf', schichtplan: false, bericht: false, review: false, we: () => 0 }),
  gut: P({ care: true }),
  meetingfan: P({ care: true, meet: 'all', schichtplan: false }),
  meetingfan_plus: P({ care: true, meet: 'all' }),
  ohneSchichtplan: P({ care: true, schichtplan: false }),
  // v0.5: ablenkbar hört allen zu, setzt aber nach dem ersten Besuch des Tages die Kopfhörer auf (neues Werkzeug im HUD);
  // ablenkbar_alt ist die unveränderte v0.4-Strategie ohne Kopfhörer (zum Vergleich)
  ablenkbar: P({ care: true, visit: 'listen', kopf: 1 }),
  ablenkbar_alt: P({ care: true, visit: 'listen' }),
  berater: P({ care: true, berater: true, kredit: true }),
  workaholic: P({ meet: 'chef', we: () => 2, leave: 19 * 60 + 30 }),
  fleissig: P({ care: true, we: S => (S.sap.cutover || S.family > 60 ? 1 : 0), leave: 18 * 60 }),
  // sparfuchs: holt nie die Tranche (wie v0.3); seit v0.4 verkauft er wie alle bei Ebbe (< 20 k€) eine alte Lizenz im Markt
  sparfuchs: P({ care: true, tranche: false }),
  marktfan: P({ care: true, markt: 'fan' }),
  ohnePlan: P({ care: true, plan: false, markt: false }),
  melone: P({ care: true, melone: true }),
  // v0.5: Ausschreibung (bietet nach dem letzten bekannten Nord-Gebot), Konzernaudit-Jäger (Image über Markt)
  bieter: P({ care: true, auktion: 'schlau' }),
  // v0.5 Süßigkeitenbox: naschbox füllt Schoko nach, wenn er ohnehin in der Kantine ist; lakritz nur Lakritz; naschWeg geht extra hin
  naschbox: P({ care: true, suess: 'schoko' }),
  lakritz: P({ care: true, suess: 'lakritz' }),
  naschWeg: P({ care: true, suess: 'schoko', suessWeg: true }),
  elonThema: P({ care: true, elon: true }),
  gagfan: P({ care: true, gag: true }),
  // Referenz (v0.5 gefunden, gilt schon für v0.4): wie gut, aber jeden Tag bis 17:30 (maßvolle Überstunden)
  gut1730: P({ care: true, leave: 17 * 60 + 30 }),
  vorzeig: P({ care: true, markt: 'image', auktion: 'mittel' }),
  // Chaos-Pfad: migriert keine SAP-Stammdaten und nimmt beim Cutover frei (we: 0)
  ohneGegen: P({ care: true, gegen: false }),
  zusager: P({ care: true, zusage: 'mittel' }),
  waghalsig: P({ care: true, zusage: 'kurz' }),
  sapChaos: P({ care: true, migrate: false, we: S => (S.sap.cutover ? 0 : S.family > 55 ? 1 : 0) })
};
function run(n, figur) {
  const rows = {};
  for (const [k, pol] of Object.entries(POL)) {
    const r = { pfad: 0, win: 0, chef: 0, fam: 0, dead: 0, budget: 0, days: [], prog: [], bud: [], kpi: [], meet: [], useless: [], chaos: 0, titel: 0 };
    for (let i = 0; i < n; i++) {
      const S = sim.newGame(1000 + i * 7919, figur);
      let g = 0; while (S.phase !== 'ende' && g++ < 40) playDay(S, pol);
      const w = S.result.why;
      if (S.result.win) { r.win++; r.days.push(S.day); } else if (/Werkleitung zieht/.test(w)) r.chef++; else if (/Imker/.test(w)) r.fam++; else if (/Controlling/.test(w)) r.budget++; else r.dead++;
      r.prog.push(sim.progress(S)); r.bud.push(S.budget); r.kpi.push(sim.kpiIndex(S)); r.meet.push(S.stats.meetings); r.useless.push(S.stats.useless); if (S.stats.chaosDays) r.chaos++; if (S.titel) r.titel++; if (S.result.pfad) r.pfad++;
    }
    const med = a => a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : '-';
    rows[k] = { win: Math.round(r.win / n * 100), winDay: med(r.days), chef: r.chef, fam: r.fam, termin: r.dead, budget: r.budget, prog: med(r.prog), bud: med(r.bud), kpi: med(r.kpi), meet: med(r.meet), useless: med(r.useless), chaos: Math.round(r.chaos / n * 100), titel: Math.round(r.titel / n * 100), pfad: Math.round(r.pfad / n * 100) };
  }
  return rows;
}
if (require.main === module) {
  const n = +process.argv[2] || 200;
  if (!process.argv.includes('--ea')) SC.EA = null;
  else { // Early Access: Level »Woche 1« für alle drei Figuren, eigene Grenzen
    const keep = ['passiv', 'einfach', 'gut', 'meetingfan', 'ablenkbar', 'workaholic', 'fleissig', 'gut1730', 'naschbox', 'bieter'];
    for (const k of Object.keys(POL)) if (!keep.includes(k)) delete POL[k];
    const errs = [], all = {};
    for (const f of ['christian', 'sandra', 'ivo']) { const R = run(n, f); all[f] = R; console.log('Woche 1, ' + f + ': ' + Object.entries(R).map(([k, x]) => k + ' ' + x.win + ' %').join(', ')); }
    if (process.argv.includes('--check')) {
      for (const [f, R] of Object.entries(all)) {
        if (R.gut.win < 60 || R.gut.win > 92) errs.push(f + ': gut ' + R.gut.win + ' % nicht in 60 bis 92');
        if (R.passiv.win > 15) errs.push(f + ': passiv ' + R.passiv.win + ' % über 15');
        if (R.meetingfan.win >= R.gut.win) errs.push(f + ': meetingfan nicht unter gut');
        if (R.einfach.win < 30) errs.push(f + ': einfach unter 30 %');
        // Ivo lernt das MES noch (Lernkurve bis Tag 10), in einer einzigen Woche ist er darum etwas schwerer zu spielen
        if (Math.abs(R.gut.win - all.christian.gut.win) > 15) errs.push(f + ': gut weicht mehr als 15 PP von Christian ab');
      }
      console.log(errs.length ? 'EA-CHECK FEHLER: ' + errs.join('; ') : 'EA-CHECK OK (Woche 1)'); if (errs.length) process.exitCode = 1;
    }
    return;
  }
  const fa = process.argv.find(a => a.startsWith('--figur=')), figur = fa ? fa.slice(8) : 'christian';
  const rows = run(n, figur);
  if (figur !== 'christian') console.log('Figur: ' + figur);
  console.log('Strategie        Sieg%  Siegtag | Werkl. Familie Termin Budget | Fortschr. Budget KPI Meet(nutzlos) Chaos% Titel% Vorzeig%');
  for (const [k, x] of Object.entries(rows)) console.log(k.padEnd(16), String(x.win).padStart(5), String(x.winDay).padStart(8), '|', String(x.chef).padStart(6), String(x.fam).padStart(7), String(x.termin).padStart(6), String(x.budget).padStart(6), '|', String(x.prog).padStart(9), String(x.bud).padStart(6), String(x.kpi).padStart(3), (x.meet + '(' + x.useless + ')').padStart(13), String(x.chaos).padStart(6), String(x.titel).padStart(6), String(x.pfad).padStart(8));
  if (process.argv.includes('--check')) {
    const R = rows, errs = [], warn = [];
    // gut1730 ist eine Referenz für die offene Abweichung »maßvolle Überstunden« (docs/BALANCE-v0.7.md), sie zählt nur als Warnung
    const best = Math.max(...Object.entries(R).filter(([k]) => k !== 'gut1730').map(([, x]) => x.win));
    // harte Invarianten (Auftrag: Meeting-Marathon ist nicht die stärkste Strategie)
    if (R.meetingfan.win > R.gut.win - 15) errs.push('meetingfan nicht >= 15 PP unter gut');
    if (R.meetingfan_plus.win > R.gut.win - 8) errs.push('meetingfan_plus nicht >= 8 PP unter gut');
    // v0.3: Die beste Strategie muss eine »vernünftige« sein (keine Meeting-, Passiv- oder Chaos-Strategie).
    // fleissig (maßvolle Überstunden + Samstagsschicht) darf vorn liegen, muss aber mindestens 20 % der Partien über die Familie verlieren.
    const SANE = ['gut', 'berater', 'fleissig', 'ohneGegen', 'zusager', 'bieter', 'naschbox', 'lakritz', 'elonThema', 'melone', 'ohnePlan'];
    if (!SANE.some(k => R[k].win === best)) errs.push('beste Strategie ist keine der vernünftigen (' + SANE.join(', ') + ')');
    if (R.fleissig.fam < n * 0.2) errs.push('fleissig verliert zu selten über die Familie');
    const rank = Object.values(R).map(x => x.win).sort((a, b) => b - a).indexOf(R.meetingfan.win) + 1;
    if (rank < 4) errs.push('meetingfan auf Rang ' + rank + ' (höchstens Rang 4 erlaubt)');
    if (R.passiv.win > 5) errs.push('passiv gewinnt zu oft');
    if (best > 75) errs.push('Spiel zu leicht (> 75 %)');
    if (R.sapChaos.chaos < 90) errs.push('Chaos-Pfad nicht abgedeckt (sapChaos Chaos% ' + R.sapChaos.chaos + ')');
    if (R.sapChaos.win > R.gut.win - 8) errs.push('SAP-Chaos lohnt sich (sapChaos nicht >= 8 PP unter gut)');
    // v0.4: Wassermelone und Marktfan dürfen sich nicht lohnen, der Titel ist selten, aber erreichbar
    if (R.melone.win > R.gut.win + 3) errs.push('Wassermelonen-Bericht lohnt sich (melone > gut + 3)');
    if (R.marktfan.win > R.gut.win) errs.push('Markt-Dauerkauf lohnt sich (marktfan > gut)');
    if (R.gut.titel > 40) errs.push('Werk des Jahres zu leicht (gut Titel% > 40)');
    // v0.5: zweiter Siegpfad »Vorzeigewerk« ist erreichbar, aber nicht dominant; die Ausschreibung ist kein Gratis-Gewinn
    if (R.vorzeig.win > R.gut.win) errs.push('Vorzeigewerk-Jagd schlägt gut');
    if (R.vorzeig.pfad < 10) errs.push('Vorzeigewerk kaum erreichbar (vorzeig Vorzeig% < 10)');
    if (R.gut.pfad > 12) errs.push('Vorzeigewerk zu häufig nebenbei (gut Vorzeig% > 12)');
    for (const k of ['meetingfan', 'passiv', 'workaholic', 'sapChaos']) if (R[k].pfad > 3) errs.push(k + ' erreicht das Vorzeigewerk zu oft');
    if (R.elonThema && R.elonThema.win > R.gut.win + 4) errs.push('Thema wechseln beim Tesla-Kollegen lohnt sich zu sehr (elonThema > gut + 4)');
    if (R.gagfan && R.gagfan.win > R.gut.win + 3) errs.push('Gags lohnen sich (gagfan > gut + 3)');
    if (R.gagfan && R.gagfan.meet !== undefined && Math.abs(R.gagfan.meet - R.gut.meet) > 1) errs.push('Gags ändern die Meetings');
    if (R.bieter.win > R.gut.win + 8) errs.push('Ausschreibung lohnt sich zu sehr (bieter > gut + 8)');
    // v0.5 Süßigkeitenbox: ignorieren (gut) darf nicht klar besser sein, Pflege nicht dominant
    if (R.gut.win > R.naschbox.win + 4) errs.push('Süßigkeitenbox ignorieren lohnt sich (gut > naschbox + 4)');
    if (R.naschbox.win > R.gut.win + 6) errs.push('Süßigkeitenbox zu stark (naschbox > gut + 6)');
    if (R.naschWeg.win > R.naschbox.win + 3) errs.push('Extra-Weg zur Box lohnt sich');
    // Zielbereiche aus docs/PHASEN.md 10.2 (Abweichungen als Warnung)
    const Z = { einfach: [20, 40], gut: [55, 70], ohneSchichtplan: [45, 62], meetingfan: [8, 30], ablenkbar: [30, 50], berater: [50, 68], workaholic: [0, 5], sparfuchs: [35, 55] };
    for (const [k, [lo, hi]] of Object.entries(Z)) if (R[k].win < lo || R[k].win > hi) warn.push(k + ' ' + R[k].win + ' % (Ziel ' + lo + '–' + hi + ')');
    if (R.ohneSchichtplan.win > R.gut.win - 3) warn.push('ohneSchichtplan nicht >= 3 PP unter gut');
    if (R.gut1730.win > 75) warn.push('gut1730 ' + R.gut1730.win + ' % (über 75, offene Abweichung)');
    if (R.fleissig.win > R.gut.win + 3) warn.push('fleissig ' + R.fleissig.win + ' % (mehr als gut + 3)');
    // v0.9 Figuren: Sandra liegt bei gut höchstens 5 PP neben Christian, keine vernünftige Strategie mehr als 8 PP darüber
    if (figur !== 'christian') {
      const C = run(n, 'christian');
      console.log('Vergleich Christian gut ' + C.gut.win + ' %, ' + figur + ' gut ' + R.gut.win + ' %');
      if (Math.abs(R.gut.win - C.gut.win) > 5) errs.push(figur + ' gut weicht mehr als 5 PP von Christian ab');
      // v0.11: Seit Sandras Zeitvorteil nur bis Feierabend gilt, braucht fleissig keine Ausnahme mehr (vorher bis 15 PP erlaubt)
      for (const k of SANE) if (R[k].win > C[k].win + 8) errs.push(figur + ' ' + k + ' mehr als 8 PP über Christian');
      if (R.gut1730.win > C.gut1730.win + 3) errs.push(figur + ' gut1730 mehr als 3 PP über Christian');
      if (R.fleissig.win > R.gut.win - 5) errs.push(figur + ' fleissig nicht >= 5 PP unter gut');
    }
    if (warn.length) console.log('WARNUNG Zielbereiche: ' + warn.join('; '));
    console.log(errs.length ? 'CHECK FEHLER: ' + errs.join('; ') : 'CHECK OK (harte Invarianten)');
    process.exitCode = errs.length ? 1 : 0;
  }
}
module.exports = { run, POL, playDay };

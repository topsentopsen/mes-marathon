// MES-Marathon: Spiellogik ohne Grafik (läuft auch in Node für Tests und Balance-Bot)
'use strict';
(function (SC) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rng(S) { S.rs = (S.rs * 1103515245 + 12345) & 0x7fffffff; return S.rs / 0x7fffffff; }
  // Eigener Zufallsstrom für die v0.3-Gags (Flurfunk, Bingo, Durchsagen): die bestehenden Würfe aus S.rs bleiben je Seed gleich
  function rngF(S) { S.rf = (S.rf * 1103515245 + 12345) & 0x7fffffff; return S.rf / 0x7fffffff; }
  const pickF = (S, arr) => arr[Math.floor(rngF(S) * arr.length)];
  // v0.4: dritter Zufallsstrom für Markt, Hotline und Prognose-Audit (S.rs und S.rf bleiben je Seed gleich)
  function rngM(S) { S.rm = (S.rm * 1103515245 + 12345) & 0x7fffffff; return S.rm / 0x7fffffff; }
  // v0.5: vierter, zustandsloser Strom für Ausschreibung und neue Gags (hängt nur von Seed und Salz ab, kein Feld in S)
  function rngA(S, salt) { const x = (((S.seed ^ Math.imul(salt, 0x85ebca6b)) & 0x7fffffff) || 13) >>> 0; return ((x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
  const ri = (S, a, b) => a + Math.floor(rng(S) * (b - a + 1));
  const pick = (S, arr) => arr[Math.floor(rng(S) * arr.length)];
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
  const T = () => SC.TUNE;
  const SIREN = 14 * 60, HANDOVER = 14 * 60 + 20;

  function newModule(def, need) {
    return { id: def.id, name: def.name, station: def.station, need: Object.assign({}, need), req: 0, spec: 0, impl: 0, deployed: false, test: 0, printed: false, done: false };
  }
  function newGame(seed) {
    const S = {
      v: SC.VERSION, seed: seed >>> 0 || 1, rs: (seed >>> 0 || 1), rf: (((seed >>> 0) ^ 0x5bd1e995) & 0x7fffffff) || 7, rm: (((seed >>> 0) ^ 0x2545f491) & 0x7fffffff) || 11, day: 1, minute: SC.DAY_START, phase: 'tag',
      name: SC.PLAYER.name, deadline: SC.DEADLINE,
      energy: 100, chef: 60, family: 70, schicht: 50,
      budget: T().budgetStart, kredit: 0, trancheCut: 0, image: 50, nordUntil: 0, lastRival: -1, zusage: null, trancheWeek: -1, partsUntil: 0,
      kpi: Object.assign({}, SC.KPI.start), kpiHist: [], downMin: 0, reportDay: 0, reportWeek: -1,
      modules: SC.MODULES.map(m => newModule(m, SC.NEED)),
      stations: SC.STATIONS.map(s => ({ id: s.id, fault: null, pend: null, care: 0, again: 0 })),
      server: { up: true, crashAt: null, careUntil: 0 }, printer: { jam: false },
      excel: false, coffee: 0, lunch: false, lunchBonus: false, coffeeBlock: 0, meetings: [], visits: [], pending: null,
      uselessToday: 0, uselessMin: 0, uselessYesterday: 0, sirene: 0, testSlot: 0, itReview: 0,
      sap: { state: 'none', pk: 0, need: 4 }, fusion: false, chaosUntil: 0,
      rivals: SC.RIVALS.map(r => ({ name: r.name, prog: 0, live: false })),
      msgs: [], result: null, dayLog: [], bingo: [], eggs: {}, durchsageAt: null, ev: {}, itStreak: 0, tiramisu: 0, kaffeeDef: 0, partyMin: 0, immerToday: 0,
      markt: null, lizenzen: T().markt.lizenzen, tonerUntil: 0, prog: { week: -1, k: null, melone: -1, hits: 0 }, hotlineDay: 0, titel: null,
      auktion: null, nordLast: null, nordLastR: null, box: { n: 0, sorte: null, week: -1, day: 0, gast: null, stand: null, used: false }, audit: { streak: 0, day: 0 }, elon: { day: 0, n: 0, meet: 0 }, kopf: 0, vDay: 0, vN: 0, pfad: null,
      stats: { pappe: 0, aufzug: 0, fax: 0, elon: 0, elonThema: 0, meetings: 0, useless: 0, missed: 0, weekend: 0, overtime: 0, bugs: 0, coffee: 0, visits: 0, pyrRight: 0, pyrWrong: 0, faults: 0, repairs: 0, budgetSpent: 0, chaosDays: 0, flur: 0, bingo: 0, eggs: 0, immer: 0, tiramisu: 0, markt: 0, prognose: 0, treffer: 0, melone: 0, hotline: 0, auktion: 0, auktionWin: 0, kopf: 0, zwilling: 0, archiv: 0, suess: 0, suessGut: 0, suessMeck: 0, suessLetztes: 0 }
    };
    planDay(S);
    return S;
  }
  const weekday = S => (S.day - 1) % 5;
  const week = S => Math.floor((S.day - 1) / 5);
  const modById = (S, id) => S.modules.find(m => m.id === id);
  const stationOf = (S, id) => S.stations.find(s => s.id === id);
  const stName = id => SC.STATIONS.find(s => s.id === id).name;
  const isDone = (S, id) => { const m = modById(S, id); return !!(m && m.done); };
  function say(S, t, bad) { S.msgs.push({ t, bad: !!bad }); S.dayLog.push((bad ? '✗ ' : '• ') + hm(S.minute) + ' ' + t); }
  function spend(S, k, why) { S.budget = Math.round((S.budget - k) * 10) / 10; S.stats.budgetSpent += k; if (why) say(S, why + ' (−' + k + ' k€)', true); }

  function planDay(S) {
    S.excel = false; S.coffee = 0; S.lunch = false; S.dayLog = []; S.immerToday = 0; S.partyMin = 0;
    S.uselessYesterday = S.uselessToday; S.uselessToday = 0; S.uselessMin = 0;
    const big = [];
    // Großereignisse
    if (S.day >= 6 && S.sap.state === 'none') {
      S.sap = { state: 'migration', pk: 0, need: 4 };
      spend(S, T().cost.sap);
      const e = modById(S, 'erp');
      if (e.done) { e.done = false; e.printed = false; e.test = Math.max(0, e.need.test - 1); e.deployed = true; }
      else { e.impl = e.impl > 0 ? Math.max(1, e.impl - 2) : 0; e.deployed = false; e.test = 0; e.printed = false; }
      big.push({ at: 8 * 60, id: 'sap' });
    }
    if (S.day >= 13 && !S.fusion) {
      S.fusion = true; S.deadline = SC.DEADLINE + 2;
      S.modules.push(newModule(SC.FUSION, SC.NEED_FUSION));
      spend(S, T().cost.fusion);
      big.push({ at: 8 * 60 + 30, id: 'uebernahme' });
    }
    // Pflicht-Ereignisse v0.3 (feste Tage, bis sie entschieden sind)
    if (S.day >= 10 && !S.ev.kaffee && !big.length) big.push({ at: 8 * 60 + 15, id: 'kaffee', t: 0 });
    if (S.ev.ticket && S.day >= S.ev.ticket && !S.ev.ticket2) {
      S.ev.ticket2 = S.day; const st = stationOf(S, 'inpack'); if (!st.fault) { st.fault = { at: SC.DAY_START }; S.stats.faults++; }
      say(S, 'Ticket #4711 ist wieder da: Die Lampe am Verpackungsautomaten blinkt wieder Morse (— — · · · · = M E S). Die Innenverpackung steht seit Schichtbeginn. Ab in die Werkstatt.', true);
    }
    if (S.day >= 14 && !S.ev.party) S.msgs.push({ t: 'Rundmail der Werkleitung: Heute ab 16:30 All-Employee-Party in der Kantine. Verkleidungspflicht! Feierabend erst nach der Party.', bad: false });
    // Meetings: zuerst die Pflichttermine der Werkleitung, dann der Rest
    const M = [{ start: 9 * 60, dur: 15, kind: 'chef', title: 'Daily bei der Werkleitung' }];
    if (S.sap.state === 'migration' && S.sap.kick !== true && (S.sap.kick = true)) M.push({ start: 11 * 60, dur: 60, kind: 'chef', title: 'SAP-Kick-off der Werkleitung (Pflicht)' });
    if (weekday(S) === 4) M.push({ start: 14 * 60 + 30, dur: 30, kind: 'chef', title: 'Wochenrückblick mit der Werkleitung (KPI)' });
    // Montagsrunde: am Tag des SAP-Kick-offs (11:00) kürzt der Schichtleiter auf 30 Min., damit Christian pünktlich oben ist
    const kickDay = M.some(m => /SAP-Kick-off/.test(m.title));
    if (weekday(S) === 0) M.push(kickDay ? { start: 10 * 60, dur: 30, kind: 'schicht', title: 'Montagsrunde Schicht (Kurzfassung wegen SAP, sagt er)' } : { start: 10 * 60, dur: 45, kind: 'schicht', title: 'Montagsrunde Schicht (Pflicht laut Schichtleiter)' });
    const tm = T().meet;
    let n = 1 + (rng(S) < 0.55 ? 1 : 0) + (S.schicht > 70 && rng(S) < 0.4 ? 1 : 0) + (S.schicht > 85 && rng(S) < tm.spiral2 ? 1 : 0) + (S.uselessYesterday >= 2 && rng(S) < tm.spiral ? 1 : 0);
    if (isDone(S, 'auftrag') && rng(S) < 0.3) n--;
    n = Math.max(1, n);
    for (let i = 0; i < n; i++) M.push({ start: ri(S, 20, 31) * 30, dur: pick(S, [30, 45, 60]), kind: 'schicht', title: pick(S, SC.USELESS) });
    if (rng(S) < 0.45) { const u = pick(S, SC.USEFUL); M.push({ start: ri(S, 20, 30) * 30, dur: 60, kind: 'useful', title: u.title, eff: u.eff }); }
    const out = [];
    const prio = m => (m.kind === 'chef' ? 0 : 1);
    M.map((m, i) => ({ m, i })).sort((a, b) => prio(a.m) - prio(b.m) || a.i - b.i).forEach(({ m }) => {
      if (m.start + m.dur > 16 * 60 + 30) return;
      if (out.some(o => m.start < o.start + o.dur + 15 && o.start < m.start + m.dur + 15)) return;
      out.push(m);
    });
    out.sort((a, b) => a.start - b.start);
    S.meetings = out.map(m => Object.assign({ state: 'open' }, m));
    // Server-Absturz
    let risk = S.day <= S.server.careUntil ? 0.06 : 0.22;
    if (S.sap.state === 'migration') risk += 0.08;
    S.server.crashAt = S.server.up && rng(S) < risk ? ri(S, 9 * 60, 16 * 60) : null;
    // Stationsstörungen (der Verpackungsautomat zuerst)
    for (const st of S.stations) {
      if (st.fault) { st.pend = null; continue; }
      let p = st.id === 'inpack' ? T().fault.inpack : st.id === 'auspack' ? T().fault.auspack : T().fault.other;
      if (st.care >= S.day) p *= 0.4;
      if (st.again === S.day) p = Math.max(p, 0.6);
      st.pend = rng(S) < p ? ri(S, 9 * 60, 15 * 60) : null;
    }
    planVisits(S, big);
    planMarkt(S);
    planAuktion(S);
    planBox(S);
    // Werksdurchsage: einmal am Tag zu einer zufälligen Zeit
    S.durchsageAt = 9 * 60 + Math.floor(rngF(S) * 7 * 60);
  }

  // v0.4 Markt: drei verschiedene Angebote am Tag, Preise im Korridor base × (lo … hi)
  function planMarkt(S) {
    // Tages-Seed: die Angebote hängen nur von Seed und Tag ab, nicht davon, ob vorher Hotline oder Audit gewürfelt haben
    S.rm = ((S.seed ^ Math.imul(S.day, 0x9e3779b1)) & 0x7fffffff) || 11;
    const M = T().markt, pool = SC.MARKT.filter(x => x.id !== 'lizenz' || S.lizenzen > 0).map(x => x.id), offers = [];
    while (offers.length < M.n && pool.length) { const id = pool.splice(Math.floor(rngM(S) * pool.length), 1)[0], it = SC.MARKT.find(x => x.id === id); offers.push({ id, price: Math.round(it.base * (M.lo + rngM(S) * (M.hi - M.lo))) }); }
    S.markt = { day: S.day, offers, bought: false };
  }
  function buy(S, i) {
    const o = S.markt.offers[i], it = SC.MARKT.find(x => x.id === o.id);
    S.markt.bought = true; S.stats.markt++;
    if (it.sell) { S.budget += o.price; S.lizenzen--; S.image -= 1; }
    else spend(S, o.price);
    if (o.id === 'paket') { const m = onePaper(S); say(S, it.msg + (m ? ' ' + m.name + ' +1 Paket.' : ' Nur leider ist gerade nichts offen.') + ' (−' + o.price + ' k€)'); return; }
    if (o.id === 'teile') S.partsUntil = Math.max(S.partsUntil, S.day + 2);
    if (o.id === 'kampagne') S.image += 4;
    if (o.id === 'presse') { S.image += 2; S.chef += 2; }
    if (o.id === 'toner') S.tonerUntil = S.day + 2;
    if (o.id === 'wartung') { S.server.careUntil = Math.max(S.server.careUntil, S.day + 2); }
    S.image = clamp(S.image, 0, 100);
    say(S, it.msg + (it.sell ? ' (+' + o.price + ' k€)' : ' (−' + o.price + ' k€)'));
  }
  // v0.5 Ausschreibung: Dienstag hängt ein Los aus, Gebote bis Mittwoch 15:00, Werk Nord bietet verdeckt (zustandsloser Strom, je Seed und Woche fest)
  function planAuktion(S) {
    const AU = T().auktion, w = week(S);
    if (S.auktion && !S.auktion.res && S.day > S.auktion.closeDay) closeAuktion(S, null);
    if ((weekday(S) !== 1 && weekday(S) !== 2) || S.day < AU.from || w === 2 || (S.auktion && S.auktion.week === w)) return;
    const heute = weekday(S) === 2; // v0.6: Dienstag fiel aus (Krankheitstag), dann Mittwoch mit Frist heute 15:00
    const lot = Math.floor(rngA(S, 100 * w + 1) * SC.AUKTION.length), L = SC.AUKTION[lot];
    S.auktion = { week: w, lot, closeDay: S.day + (heute ? 0 : 1), bid: null, res: null, nord: Math.floor(L.base * nordRatio(S, w)) };
    S.msgs.push({ t: 'Ausschreibung im Controlling: ' + L.label + '. Richtpreis ' + L.base + ' k€, Gebote bis ' + (heute ? 'heute' : 'morgen') + ' 15:00. Werk Nord bietet auch.', bad: false });
  }
  // Werk Nord bietet nicht blind: der Faktor zum Richtpreis wandert von Woche zu Woche nur wenig (wer das letzte Nord-Gebot kennt, kann besser bieten)
  function nordRatio(S, w) { const AU = T().auktion; let r = AU.nordLo + rngA(S, 2) * (AU.nordHi - AU.nordLo); for (let k = 1; k <= w; k++) r = clamp(r + (rngA(S, 100 * k + 2) - 0.5) * AU.drift, AU.nordLo, AU.nordHi); return r; }
  // v0.5 Süßigkeitenbox: morgens wird genascht (1 bis 2 Stück, das letzte bleibt liegen), ein Stammgast schaut vorbei.
  // Passt die Sorte: kleine Hilfe von genau dieser Rolle. Leer oder falsche Sorte: Gemecker, die Teamlaune sinkt (Schichtleiter −1).
  function planBox(S) {
    const B = S.box, ST = T().suess; B.gast = null; B.stand = null; B.used = false; B.day = S.day;
    if (S.day < ST.from) return;
    const g = SC.NASCHER[Math.floor(rngA(S, 9000 + S.day * 8 + 1) * SC.NASCHER.length)], beschwert = rngA(S, 9000 + S.day * 8 + 2) < ST.beschwer;
    if (B.n > 1) B.n = Math.max(1, B.n - 1 - (rngA(S, 9000 + S.day * 8) < 0.5 ? 1 : 0));
    B.gast = g.id;
    if (B.n > 1 && B.sorte === g.mag) { B.stand = 'gut'; S.stats.suessGut++;
      if (g.id === 'schicht') S.schicht = clamp(S.schicht + ST.schichtGut, 0, 100); if (g.id === 'chef') S.chef = clamp(S.chef + ST.chefGut, 0, 100);
      S.msgs.push({ t: 'Süßigkeitenbox: ' + g.who + ' ' + g.gut, bad: false }); return; }
    B.stand = B.n > 1 ? 'falsch' : 'leer';
    if (!beschwert) return;
    // nur der Schichtleiter trägt es weiter (Teamlaune), alle anderen meckern nur
    S.stats.suessMeck++; const pen = g.id === 'schicht' ? ST.schichtLeer : 0; S.schicht = clamp(S.schicht - pen, 0, 100);
    const extra = B.n === 1 ? ' ' + SC.LETZTES[Math.floor(rngA(S, 9000 + S.day * 8 + 3) * SC.LETZTES.length)] : '';
    S.msgs.push({ t: 'Süßigkeitenbox: ' + g.who + ': ' + (B.stand === 'leer' ? g.leer : typeof g.meck === 'string' ? g.meck : g.meck[B.sorte]) + extra + (pen ? ' (Teamlaune: Schichtleiter −' + pen + ')' : ''), bad: true });
  }
  // Hilfe des Stammgasts (einmal am Tag): kürzere Aktion bei genau dieser Rolle
  function boxRabatt(S, room, id) {
    const B = S.box, ST = T().suess; if (!B || B.stand !== 'gut' || B.used || B.day !== S.day) return 0;
    const hit = (B.gast === 'werkstatt' && room === 'werkstatt' && (id === 'repair' || id === 'notbehelf')) || (B.gast === 'kantine' && id === 'lunch') || (B.gast === 'it' && id === 'review') || (B.gast === 'controlling' && room === 'controlling') || (B.gast === 'schicht' && id === 'test') || (B.gast === 'chef' && room === 'chef');
    return hit ? ST.zeit : 0;
  }
  const bidPrice = (S, i) => Math.round(SC.AUKTION[S.auktion.lot].base * T().auktion.bids[i]);
  // Zuschlag: höheres Gebot gewinnt, Gleichstand geht an Werk Nord; gezahlt wird erst beim Zuschlag. R: Abendbilanz (optional)
  function closeAuktion(S, R) {
    const a = S.auktion; if (!a || a.res) return;
    const AU = T().auktion, L = SC.AUKTION[a.lot], com = SC.NORD_GEBOTE[Math.floor(rngA(S, 100 * a.week + 3) * SC.NORD_GEBOTE.length)];
    let t;
    if (a.bid !== null && a.bid > a.nord) {
      let extra = '';
      if (L.id === 'kontingent') { let k = 0; for (let j = 0; j < T().auktion.pakete; j++) if (onePaper(S)) k++; extra = k ? ' Die Berater liefern ' + k + (k > 1 ? ' Pakete.' : ' Paket.') : ''; if (!k) { a.res = 'storno'; S.nordLast = a.nord; S.nordLastR = Math.round(a.nord / L.base * 100) / 100; const ts = 'Zuschlag storniert: Für das Beraterkontingent ist nichts mehr offen. Das Controlling zahlt nichts. ' + com; if (R) R.lines.push(['info', ts]); else say(S, ts); return; } }
      a.res = 'win'; S.stats.auktionWin++; spend(S, a.bid);
      if (L.id === 'teile') S.partsUntil = Math.max(S.partsUntil, S.day + 4);
      else if (L.id === 'wartung') { S.server.careUntil = Math.max(S.server.careUntil, S.day + 4); for (const id of ['inpack', 'auspack']) stationOf(S, id).care = Math.max(stationOf(S, id).care, S.day + 4); }
      t = 'Zuschlag! ' + L.short + ' für ' + a.bid + ' k€ (Werk Nord bot ' + a.nord + ' k€).' + extra + ' ' + com;
    } else if (a.bid !== null) {
      // Verlieren kostet nichts außer der Zeit fürs Gebot (Messung v0.5: mit Strafe war Bieten klar ein Verlustgeschäft)
      a.res = 'lose';
      t = 'Ausschreibung verloren: Werk Nord bekommt ' + L.short + ' für ' + a.nord + ' k€ (dein Gebot ' + a.bid + ' k€). ' + com;
    } else { a.res = 'none'; t = 'Ausschreibung ' + L.short + ' ohne dein Gebot: Werk Nord nimmt es für ' + a.nord + ' k€. ' + com; }
    S.nordLast = a.nord; S.nordLastR = Math.round(a.nord / L.base * 100) / 100;
    if (R) R.lines.push([a.res === 'win' ? 'good' : 'info', t]); else say(S, t);
  }
  const auktionOpen = S => !!(S.auktion && !S.auktion.res && (S.day < S.auktion.closeDay || (S.day === S.auktion.closeDay && S.minute < T().auktion.close)));
  // v0.5 Zweiter Siegpfad »Vorzeigewerk«: Konzernaudit an einem Freitag ab Tag 15 (KPI-Index, Image, abgenommene Module). Idempotent über audit.day
  const auditOk = S => kpiIndex(S) >= T().audit.kpi && S.image >= T().audit.image && doneCount(S) >= T().audit.mods;
  function auditFreitag(S, R) {
    const AD = T().audit; if (S.audit.day === S.day || S.day < AD.from) return; S.audit.day = S.day;
    if (auditOk(S)) { S.audit.streak++; R.lines.push(['good', 'Konzernaudit »Vorzeigewerk«: Bestwerte (KPI-Index ' + kpiIndex(S) + ' %, Image ' + Math.round(S.image) + '), Serie ' + S.audit.streak + '/' + AD.streak + '.']); if (S.audit.streak >= AD.streak) S.pfad = 'vorzeig'; }
    else { if (S.audit.streak) R.lines.push(['info', 'Konzernaudit »Vorzeigewerk«: diesmal keine Bestwerte, die Serie beginnt von vorn.']); S.audit.streak = 0; }
  }
  const prognoseBand = S => { const d = kpiScore(S) - kpiPath(S), b = T().prognose.band; return d < -b ? 0 : d > b ? 2 : 1; };

  function planVisits(S, big) {
    const v = T().visit, V = [];
    if (rng(S) < v.tesla) V.push({ at: ri(S, 8 * 60, 15 * 60), id: 'tesla', duo: rng(S) < v.duo });
    let it = 0;
    for (let h = 9; h <= 16; h++) if (it < v.italienMax && rng(S) < v.italienHour) { V.push({ at: h * 60 + ri(S, 0, 15), id: 'italien' }); it++; }
    const pIt = S.day === 1 ? 1 : S.day % 2 === 0 ? v.itEven : v.itOdd;
    if (rng(S) < pIt) { const qi = Math.floor(rng(S) * SC.PYRAMID_Q.length); const q = SC.PYRAMID_Q[qi]; const wrong = [0, 1, 2, 3, 4].filter(x => x !== q.a); const w1 = wrong.splice(Math.floor(rng(S) * wrong.length), 1)[0]; const w2 = wrong[Math.floor(rng(S) * wrong.length)]; const opts = [q.a, w1, w2]; for (let i = 2; i > 0; i--) { const j = Math.floor(rng(S) * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; } V.push({ at: ri(S, 9 * 60 + 30, 15 * 60), id: 'itchefin', q: qi, opts, open: Math.floor(rng(S) * SC.VISIT_TEXT.itchefin.length) }); }
    if (rng(S) < v.ahnungslos) V.push({ at: ri(S, 8 * 60 + 30, 16 * 60), id: 'ahnungslos' });
    if (S.fusion && rng(S) < v.altwerk) V.push({ at: ri(S, 8 * 60 + 30, 16 * 60), id: 'altwerk' });
    for (const g of ['lieferant', 'azubi', 'audit']) if (rng(S) < v.glueck) V.push({ at: ri(S, 8 * 60, 16 * 60), id: g });
    // Flurfunk (v0.3): an etwa einem Drittel der Tage ohne Großereignis, eigener Zufallsstrom
    // Aktive Rivalen (aus Sender-Chef): höchstens ein Eingriff am Tag, nie zweimal hintereinander derselbe
    { const R0 = T().rival, lead = progress(S) >= Math.max(...S.rivals.map(r => r.prog)); const cand = S.rivals.map((r, i) => i).filter(i => !S.rivals[i].live && i !== S.lastRival);
      if (S.day >= R0.from && cand.length && rngF(S) < R0.p + (lead ? R0.lead : 0)) { const r = cand[Math.floor(rngF(S) * cand.length)]; S.lastRival = r; V.push({ at: ri2(S, 9 * 60, 15 * 60), id: 'rivale', r, t: 0 }); } else S.lastRival = -1; }
    if (S.day >= 9 && !S.ev.kreis) V.push({ at: ri2(S, 10 * 60, 14 * 60), id: 'kreis', t: 0 });
    if (S.day >= 12 && !S.ev.raetsel) V.push({ at: ri2(S, 10 * 60, 13 * 60), id: 'raetsel', t: 0 });
    if (!big.length && rngF(S) < T().flur) V.push({ at: ri2(S, 9 * 60, 15 * 60 + 30), id: 'flur', k: Math.floor(rngF(S) * SC.FLUR.length), t: 0 });
    for (const x of V) if (x.t === undefined) x.t = Math.floor(rng(S) * 100);
    V.sort((a, b) => a.at - b.at);
    const out = big.slice();
    for (const x of V) {
      let at = x.at;
      for (const m of S.meetings) if (at >= m.start - 20 && at < m.start + m.dur) at = m.start + m.dur;
      const prev = out[out.length - 1];
      if (prev && at < prev.at + 25) at = prev.at + 25;
      for (const m of S.meetings) if (at >= m.start - 20 && at < m.start + m.dur) at = m.start + m.dur;
      if (at > 16 * 60 + 30) continue;
      x.at = at; out.push(x);
    }
    // Party am Abend: fester Termin 16:30, nach allen anderen Besuchen
    if (S.day >= 14 && !S.ev.party) { const last = out[out.length - 1]; out.push({ at: Math.max(16 * 60 + 30, last ? last.at + 25 : 0), id: 'party', t: 0 }); }
    S.visits = out;
  }

  function ri2(S, a, b) { return a + Math.floor(rngF(S) * (b - a + 1)); }
  function egg(S, k, t) { if (S.eggs[k]) return; S.eggs[k] = S.day; S.stats.eggs++; say(S, 'Easter Egg! ' + t); }
  function advance(S, mins) { S.minute += mins; events(S); }
  function events(S) {
    for (const m of S.meetings) {
      if (m.state === 'open' && S.minute > m.start + 10) {
        m.state = 'missed';
        if (m.kind === 'chef') { S.chef -= 7; S.stats.missed++; say(S, 'Meeting verpasst: »' + m.title + '«. Die Werkleitung notiert sich das.', true); }
        else if (m.kind === 'schicht') { S.schicht -= 13; S.stats.missed++; say(S, '»' + m.title + '« geschwänzt. Der Schichtleiter ist beleidigt.', true); }
        else { say(S, '»' + m.title + '« fand ohne dich statt.', true); }
      }
    }
    if (S.server.up && S.server.crashAt !== null && S.minute >= S.server.crashAt) {
      S.server.up = false; S.server.crashAt = null;
      say(S, 'Alarm: Der MES-Server in Rack 4 ist abgestürzt! Deployment und Testläufe gehen erst nach Neustart.', true);
    }
    for (const st of S.stations) {
      if (st.pend !== null && st.pend !== undefined && S.minute >= st.pend) {
        st.fault = { at: st.pend }; st.pend = null; S.stats.faults++;
        const pack = st.id === 'inpack' || st.id === 'auspack';
        say(S, (pack ? pick(S, SC.PACKER_FAULTS) + ' (' + stName(st.id) + ')' : 'Störung an der Station ' + stName(st.id) + ': Die SPS meldet »Zustand unbekannt«.') + ' Ab in die Werkstatt.', true);
      }
    }
    // Der italienische Kollege kommt jede volle Stunde vorbei (kurz im Vorbeigehen, wenn kein Besuch geplant ist)
    const hr = Math.floor(S.minute / 60);
    if (S.phase === 'tag' && hr >= 9 && hr <= 16 && S.itHour !== hr && !activeMeeting(S)) {
      S.itHour = hr;
      if (!S.visits.some(v => v.id === 'italien' && Math.floor(v.at / 60) === hr) && rng(S) < 0.7) { say(S, 'Der italienische Kollege im Vorbeigehen: »' + pick(S, SC.ITALIEN_KURZ) + '« (2 Min.)'); S.minute += 2; }
    }
    if (S.phase === 'tag' && S.durchsageAt !== null && S.minute >= S.durchsageAt && !activeMeeting(S)) { S.durchsageAt = null; say(S, 'Werksdurchsage: »' + pickF(S, SC.DURCHSAGEN) + '«'); }
    if (S.auktion && !S.auktion.res && (S.day > S.auktion.closeDay || (S.day === S.auktion.closeDay && S.minute >= T().auktion.close))) closeAuktion(S, null);
    if (S.sirene !== S.day && S.minute >= SIREN && S.minute < SC.LATEST) { S.sirene = S.day; say(S, 'Sirene: Schichtwechsel! In den Hallen ist bis 14:20 Übergabe.'); }
    if (!S.pending && S.visits.length && S.minute >= S.visits[0].at && !activeMeeting(S) && S.phase === 'tag') S.pending = S.visits.shift();
    S.chef = clamp(S.chef, 0, 100); S.schicht = clamp(S.schicht, 0, 100); S.family = clamp(S.family, 0, 100); S.energy = clamp(S.energy, 0, 100);
  }

  // Running Gag: »Das hatten wir schon immer so« (Zähler in der Tagesbilanz)
  function immer(S) { if (rngF(S) < 0.6) { S.immerToday++; S.stats.immer++; say(S, 'Der Schichtleiter: »' + pickF(S, SC.IMMER) + '« (heute ' + S.immerToday + 'x)'); } }
  // Buzzword-Bingo: jede Werkleitungsrunde liefert ein Buzzword, fünf verschiedene = BINGO (nur Punkte)
  function bingo(S) {
    const w = pickF(S, SC.BUZZ);
    if (S.bingo.includes(w)) return;
    S.bingo.push(w);
    if (S.stats.bingo) return;
    if (S.bingo.length >= SC.BINGO_NEED) { S.stats.bingo = 1; S.bingoDay = S.day; say(S, 'BINGO! Die Werkleitung sagt »' + w + '«. Fünf Buzzwords voll. Du rufst es nicht laut. Innerlich schon. (+' + T().bingoScore + ' Punkte)'); }
    else say(S, 'Buzzword-Bingo: »' + w + '« (' + S.bingo.length + '/' + SC.BINGO_NEED + ')');
  }
  const partyToday = S => S.day >= 14 && !S.ev.party && S.visits.concat(S.pending ? [S.pending] : []).some(v => v.id === 'party');
  const rahmen = S => (S.image >= 60 ? T().kredit.rahmenHoch : T().kredit.rahmen);
  const doneCount = S => S.modules.filter(m => m.done).length;
  function nextMeeting(S) { return S.meetings.find(m => m.state === 'open' && m.start + 10 >= S.minute) || null; }
  function activeMeeting(S) { return S.meetings.find(m => m.state === 'open' && S.minute >= m.start - 20 && S.minute <= m.start + 10) || null; }

  const firstMod = (S, f) => S.modules.find(m => !m.done && f(m)) || null;
  const faulted = (S, m) => !!stationOf(S, m.station).fault;
  const targets = {
    req: S => firstMod(S, m => m.req < m.need.req),
    spec: S => firstMod(S, m => m.req >= m.need.req && m.spec < m.need.spec),
    impl: S => firstMod(S, m => m.spec >= m.need.spec && m.impl < m.need.impl),
    deploy: S => firstMod(S, m => m.impl >= m.need.impl && !m.deployed),
    test: S => firstMod(S, m => m.deployed && m.test < m.need.test && !faulted(S, m)),
    testAny: S => firstMod(S, m => m.deployed && m.test < m.need.test),
    print: S => firstMod(S, m => m.test >= m.need.test && !m.printed),
    abnahme: S => firstMod(S, m => m.printed && !(m.id === 'erp' && sapOpen(S)))
  };
  // SAP noch nicht sauber: Migration läuft oder Nacharbeit nach einem Chaos-Cutover
  const sapOpen = S => S.sap.state === 'migration' || S.sap.state === 'nacharbeit';
  function slow(S) { return S.energy < 25 ? 1.5 : S.energy < 45 ? 1.2 : 1; }
  const eff = S => Math.min(S.schicht, T().meet.cap);
  // Ein Arbeitspaket in der Pipeline (Wochenende, Berater, Azubi, Pyramide)
  function autoWork(S, k) {
    let did = 0;
    while (k-- > 0) {
      const te = targets.test(S), dp = targets.deploy(S), im = targets.impl(S), sp = targets.spec(S), r = targets.req(S);
      if (te) te.test++; else if (dp) dp.deployed = true; else if (im) im.impl++; else if (sp) sp.spec++; else if (r) r.req++; else break;
      did++;
    }
    return did;
  }
  // Running Gag: Drucker-Fehlermeldungen werden zum SAP-Cutover hin absurder
  function druckerFehler(S) { const st = S.day >= 10 || S.sap.state === 'migration' ? 2 : Math.min(2, Math.floor(S.day / 4)); return pickF(S, SC.DRUCKER_FEHLER[st]); }
  const onePaperTarget = S => targets.req(S) || targets.spec(S);
  function onePaper(S) { const m = targets.req(S) || targets.spec(S); if (!m) return null; if (m.req < m.need.req) m.req++; else m.spec++; return m; }
  function faultyStation(S) {
    const need = S.modules.filter(m => !m.done).map(m => m.station);
    return S.stations.filter(s => s.fault).sort((a, b) => (need.includes(b.id) ? 1 : 0) - (need.includes(a.id) ? 1 : 0))[0] || null;
  }
  function fixFault(S, st) { S.downMin += Math.max(0, S.minute - st.fault.at); st.fault = null; S.stats.repairs++; }

  // v0.5 Ausschreibung: ein verdecktes Gebot je Los, gezahlt wird erst beim Zuschlag (im Controlling oder per Mail aus dem Büro)
  const AUK_ACTS = cost => [0, 1, 2].map(i => ({ id: 'a' + i, cost, energy: 1,
        label: S => { if (!S || !S.auktion || S.auktion.res) return 'Ausschreibung: ' + SC.AUKTION_BIDS[i]; return 'Ausschreibung: ' + SC.AUKTION_BIDS[i] + ' ' + bidPrice(S, i) + ' k€'; },
        check: S => !S.auktion || S.auktion.res ? 'Gerade keine Ausschreibung. Die nächste hängt am Dienstag aus (nicht in der Woche der Übernahme).' : !auktionOpen(S) ? 'Die Frist ist um (Mittwoch 15:00).' : S.auktion.bid !== null ? 'Dein Gebot liegt schon im Umschlag (' + S.auktion.bid + ' k€).' : S.budget < bidPrice(S, i) ? 'Dafür reicht das Budget nicht.' : null,
        run: S => { S.auktion.bid = bidPrice(S, i); S.stats.auktion++; say(S, 'Gebot abgegeben: ' + S.auktion.bid + ' k€ für ' + SC.AUKTION[S.auktion.lot].short + '. Die Controlling-Abteilung klebt den Umschlag zu und stempelt »VERTRAULICH«. Zuschlag Mittwoch 15:00.'); } }));
  // Aktionen je Raum: { label, cost (min), energy, check(S) -> null|Grund, run(S) }
  const A = {
    halle: [
      { id: 'req', label: 'Requirements an der Station aufnehmen', cost: 45, energy: 8,
        check: S => targets.req(S) ? null : 'Alle Requirements sind aufgenommen.',
        run: S => {
          const m = targets.req(S), st = stName(m.station);
          if (S.schicht < 40 && rng(S) < 0.5) { say(S, 'Der Schichtleiter hat die Bediener an der ' + st + ' abgezogen. Keine Requirements.', true); return; }
          let g = 1; if (eff(S) >= 65 && rng(S) < T().meet.reqDouble) g = 2;
          m.req = Math.min(m.need.req, m.req + g);
          const dumb = rng(S) < 0.2 ? ' Ein Kollege ohne Ahnung fragt dazwischen, ob das MES auch Kaffee kochen kann.' : '';
          say(S, 'Requirements ' + m.name + ' (' + st + '): ' + m.req + '/' + m.need.req + (g > 1 ? ' (der Schichtleiter hat extra Leute geschickt!)' : '') + '.' + dumb);
        } },
      { id: 'test', label: 'Testlauf an der Teststation fahren', cost: 75, energy: 12,
        check: S => { if (!targets.testAny(S)) return 'Nichts testbereit. Erst implementieren und im Serverraum deployen.'; if (!targets.test(S)) { const m = targets.testAny(S); return 'Station ' + stName(m.station) + ' steht (Störung). Erst in die Werkstatt.'; } return !S.server.up ? 'Server ist down. Erst im Serverraum neu starten.' : null; },
        run: S => {
          const m = targets.test(S);
          if (rng(S) < (S.schicht < 40 ? 0.8 - S.schicht / 100 : S.schicht < 60 ? 0.15 : 0)) { S._cost = 30; say(S, 'Der Schichtleiter: »Die ' + stName(m.station) + ' ist heute nicht frei. Hättest halt zu meinem Meeting kommen sollen.« (30 Minuten verloren)', true); return; }
          spend(S, T().cost.test);
          const bug = 0.34 - m.spec * 0.03 - (isDone(S, 'qs') ? 0.05 : 0) + (S.chaosUntil >= S.day ? 0.12 : 0) + (S.kaffeeDef === S.day ? 0.08 : 0) - (S.tiramisu === S.day ? T().tiramisu : 0);
          const tira = S.tiramisu === S.day; S.tiramisu = 0; if (tira) { S.stats.tiramisu++; say(S, 'Tiramisu-Effekt: Die Spezifikation sitzt, der Testlauf geht mit weniger Fehlerrisiko an die Station.'); }
          if (rng(S) < Math.max(0, bug)) { m.impl = Math.max(0, m.impl - 1); m.deployed = false; S.stats.bugs++; say(S, 'Testlauf ' + m.name + ' an der ' + stName(m.station) + ': Bug gefunden! Zurück an den Schreibtisch (Implementierung ' + m.impl + '/' + m.need.impl + ').', true); return; }
          m.test++; say(S, 'Testlauf ' + m.name + ' an der ' + stName(m.station) + ' bestanden: ' + m.test + '/' + m.need.test + '.');
        } },
      { id: 'linie', label: 'Mit der Schicht an der Produktionsstraße plaudern', cost: 20, energy: 2,
        check: () => null, run: S => { S.schicht += 4; say(S, 'Die Schicht findet es gut, dass sich »der vom MES« mal blicken lässt. Die Extrusion brummt zustimmend.'); } }
    ],
    schicht: [
      { id: 'gespraech', label: 'Mit dem Schichtleiter über die Linie reden', cost: 25, energy: 3, check: () => null,
        run: S => { S.schicht += 7; say(S, 'Der Schichtleiter: »Schön, dass du vorbeischaust. Ich lad dich gleich mal in was ein.«'); immer(S);
          if (rng(S) < 0.6) { const st = Math.ceil((S.minute + 60) / 30) * 30; if (st + 45 <= 16 * 60 + 30 && !S.meetings.some(x => x.state === 'open' && Math.abs(x.start - st) < 60)) { S.meetings.push({ start: st, dur: 45, kind: 'schicht', title: pick(S, SC.USELESS), state: 'open' }); S.meetings.sort((a, b) => a.start - b.start); say(S, 'Neue Einladung vom Schichtleiter: ' + hm(st) + ' im Besprechungsraum.'); } } } },
      { id: 'schichtplan', label: 'Schichtplan für Testläufe abstimmen', cost: 30, energy: 4,
        check: S => S.testSlot === S.day ? 'Heute schon abgestimmt.' : S.schicht >= 40 ? null : 'Der Schichtleiter ist gerade nicht gut auf dich zu sprechen.',
        run: S => { S.schicht += 3; S.testSlot = S.day; say(S, 'Der Schichtleiter reserviert dir heute die Teststationen. Testläufe gehen schneller. Ganz ohne Meeting.'); } }
    ],
    werkstatt: [
      { id: 'repair', label: 'Störung reparieren (Instandhaltung)', cost: 35, energy: 6,
        check: S => faultyStation(S) ? null : 'Gerade läuft alles. Die Instandhaltung trinkt Kaffee.',
        run: S => { const st = faultyStation(S); fixFault(S, st); spend(S, S.partsUntil >= S.day ? 2 : T().cost.repair); if (rng(S) < 0.25) st.again = S.day + 1;
          say(S, stName(st.id) + ' repariert. ' + (st.id === 'inpack' || st.id === 'auspack' ? 'Der Verpackungsautomat schnurrt. Vorerst.' : 'Die Instandhaltung: »Lag am Stecker.«')); } },
      { id: 'notbehelf', label: 'Notbehelf mit Kabelbinder (schnell, hält nicht immer)', cost: 15, energy: 1,
        check: S => faultyStation(S) ? null : 'Nichts kaputt. Der Kabelbinder bleibt in der Schublade.',
        run: S => { const st = faultyStation(S); if (rng(S) < 0.6) st.again = S.day + 1; if (rng(S) < 0.5) { fixFault(S, st); say(S, stName(st.id) + ': Kabelbinder hält. Wunder gibt es.'); } else say(S, stName(st.id) + ': Kabelbinder gerissen. Die Station steht weiter.', true); } },
      { id: 'wartung', label: 'Präventive Wartung am Verpackungsautomaten', cost: 40, energy: 4,
        check: S => stationOf(S, 'inpack').care >= S.day + 1 ? 'Gerade erst gewartet.' : null,
        run: S => { spend(S, T().cost.care); stationOf(S, 'inpack').care = S.day + 3; stationOf(S, 'auspack').care = S.day + 3; say(S, 'Verpackungsautomat gewartet, Folienrolle gerade gerückt, gut zugeredet. Die nächsten Tage hakt er seltener.'); } }
    ],
    buero: [
      { id: 'spec', label: 'Spezifikation schreiben', cost: 50, energy: 9,
        check: S => targets.spec(S) ? null : 'Keine Spezifikation offen (erst Requirements in den Hallen aufnehmen).',
        run: S => { const m = targets.spec(S); m.spec++; say(S, 'Spezifikation ' + m.name + ': ' + m.spec + '/' + m.need.spec + '.'); } },
      { id: 'impl', label: 'Implementieren', cost: 75, energy: 12,
        check: S => targets.impl(S) ? null : 'Nichts zu implementieren (erst Spezifikation fertig schreiben).',
        run: S => { const m = targets.impl(S); m.impl++; say(S, 'Implementierung ' + m.name + ': ' + m.impl + '/' + m.need.impl + '.'); } },
      { id: 'migrate', label: 'SAP-Stammdaten migrieren', cost: 60, energy: 9,
        check: S => sapOpen(S) ? null : 'Gerade keine Migration. Genieß es.',
        run: S => { S.sap.pk++; say(S, (S.sap.state === 'nacharbeit' ? 'Nacharbeit Stammdaten ' : 'Stammdaten ') + S.sap.pk + '/' + S.sap.need + ': 14.000 Materialnummern, 11.000 davon heißen »Schraube«.');
          if (S.sap.pk >= S.sap.need && S.sap.state === 'nacharbeit') { S.sap.state = 'done'; say(S, 'Stammdaten endlich sauber. Die ERP-Schnittstelle kann jetzt abgenommen werden. Die Werkleitung tut so, als wäre nichts gewesen.'); }
          else if (S.sap.pk >= S.sap.need) { S.sap.state = 'done'; S.chef += 6; say(S, 'SAP-Cutover vorgezogen und geschafft! Die Werkleitung +6. Das neue SAP fragt jetzt bei jedem Klick »Sind Sie sicher?«.'); } } },
      { id: 'excel', label: 'Excel-Liste für die Werkleitung pflegen', cost: 20, energy: 3,
        check: S => S.excel ? 'Heute schon gepflegt.' : null,
        run: S => { S.excel = true; say(S, 'Excel-Liste aktualisiert: 47 Spalten, 3 Farben, ein SVERWEIS, den nur du verstehst.'); if (S.day === 13) egg(S, 'excel', 'Nach der Übernahme heißt die Datei jetzt »MES_Rollout_final_v7_NEU_final_v2_NEU_wirklichfinal_Christian_Altwerk.xlsx«. Speichern dauert vier Minuten.'); } },
      { id: 'hotline', label: 'SAP-Hotline anrufen (Warteschleife 30 bis 60 Min., vielleicht 1 Stammdatenpaket)', cost: 45, energy: 3,
        check: S => S.sap.state !== 'migration' ? 'Die Hotline hilft nur während der Migration. Danach hilft sie gar nicht mehr.' : S.hotlineDay === S.day ? 'Heute schon angerufen. Die Melodie läuft noch im Kopf.' : null,
        run: S => { const H = T().hotline; S.hotlineDay = S.day; S.stats.hotline++; S._cost = H.min + Math.floor(rngM(S) * (H.max - H.min + 1));
          const t = SC.HOTLINE[Math.floor(rngM(S) * SC.HOTLINE.length)];
          if (rngM(S) < H.p) { S.sap.pk++; say(S, 'SAP-Hotline: ' + t + ' Nach ' + S._cost + ' Minuten hilft dir tatsächlich jemand: Stammdaten ' + S.sap.pk + '/' + S.sap.need + '.'); if (S.sap.pk >= S.sap.need) { S.sap.state = 'done'; S.chef += 6; say(S, 'SAP-Cutover vorgezogen und geschafft! Die Werkleitung +6.'); } }
          else { S.energy -= 3; say(S, 'SAP-Hotline: ' + t + ' Nach ' + S._cost + ' Minuten: »Dafür ist ein anderes Team zuständig.« Aufgelegt. Energie −3.', true); } } },
      ...AUK_ACTS(5).map(a => Object.assign({}, a, { label: S => a.label(S).replace('Ausschreibung:', 'Gebot per Mail:') })),
      { id: 'pappe', label: 'Den Pappkameraden anschauen', cost: 3, energy: 0, check: () => null,
        run: S => { S.stats.pappe++; say(S, SC.PAPPE[(S.stats.pappe - 1) % SC.PAPPE.length]); if (S.stats.pappe >= 6) egg(S, 'pappe', SC.PAPPE_EGG); } },
      { id: 'mail', label: 'Postfach aufräumen', cost: 15, energy: 1, check: () => null,
        run: S => { if (rng(S) < 0.3) { S.chef += 2; say(S, 'Eine Mail der Werkleitung rechtzeitig beantwortet. Pluspunkt.'); } else say(S, '43 Mails, davon 41 Einladungen vom Schichtleiter in CC.'); } }
    ],
    leitstand: [
      { id: 'bericht', label: 'KPI-Bericht für die Werkleitung erstellen', cost: 30, energy: 4,
        check: S => S.reportDay === S.day ? 'Heute schon berichtet.' : null,
        run: S => { S.reportDay = S.day; S.reportWeek = week(S); S.chef += 2; const ok = kpiScore(S) >= kpiPath(S);
          if (ok) S.chef += 2; say(S, 'KPI-Bericht verschickt: OEE ' + S.kpi.oee.toFixed(1) + ' %, Ausschuss ' + S.kpi.ausschuss.toFixed(1) + ' %. ' + (ok ? 'Die Werkleitung: »Das sieht ja fast nach Plan aus.« (+4)' : 'Die Werkleitung: »Und wann wird das grün?« (+2)')); } },
      // v0.4 Planen mit Prognose: Montag oder Dienstag eine Prognose für den KPI-Index am Freitag abgeben, Auswertung im Wochenrückblick
      ...SC.PROGNOSE.map(P0 => ({ id: P0.id, label: P0.label, cost: 5, energy: 1,
        check: S => S.prog.week === week(S) ? 'Diese Woche ist die Prognose schon abgegeben.' : weekday(S) > 1 ? 'Prognosen nimmt die Werkleitung nur Montag und Dienstag an.' : null,
        run: S => { S.prog.week = week(S); S.prog.k = P0.k; S.stats.prognose++; say(S, 'Prognose an die Werkleitung: KPI-Index am Freitag ' + ['unter', 'im', 'über'][P0.k] + ' Plan. Die Werkleitung druckt die Mail aus und legt sie in die Freitagsmappe.'); } })),
      // Satire: der Wassermelonen-Bericht (außen grün, innen rot)
      { id: 'melone', label: 'Wassermelonen-Bericht: »alles grün« melden (Werkleitung +3, Audit-Risiko)', cost: 10, energy: 1,
        check: S => S.prog.melone === week(S) ? 'Diese Woche war schon alles grün. Zweimal fällt auf.' : null,
        run: S => { S.prog.melone = week(S); S.chef += T().prognose.melone; S.stats.melone++; say(S, 'Wassermelonen-Bericht verschickt: alle Ampeln grün. Außen. Die Werkleitung strahlt (+' + T().prognose.melone + '). Innen ist er rot, aber das sieht ja keiner. Noch nicht.'); } }
    ],
    meeting: [
      { id: 'attend', label: 'Am Meeting teilnehmen', cost: 0, energy: 0,
        check: S => activeMeeting(S) ? null : 'Gerade kein Meeting. Termine siehst du oben im Kalender.',
        run: S => {
          const m = activeMeeting(S); S.minute = Math.max(S.minute, m.start); m.state = 'done'; S.stats.meetings++;
          S.minute += m.dur; S.energy -= Math.round(m.dur / 10);
          if (m.kind === 'chef') { S.chef += 3; say(S, '»' + m.title + '« besucht. Die Werkleitung nickt dir zu.'); bingo(S); }
          else if (m.kind === 'schicht') {
            const g = Math.max(0, T().meet.gain - T().meet.step * S.uselessToday);
            immer(S); S.energy -= 1 + S.uselessToday; S.schicht += g; S.uselessToday++; S.uselessMin += m.dur; S.stats.useless++;
            if (S.elon.meet !== S.day && rngA(S, 20100 + S.day) < T().elon.meet) { S.elon.meet = S.day; const x = T().elon.meetMin; S.minute += x; S.energy += T().elon.meetEnergie; elonPlus(S); say(S, SC.ELON_MEETING + ' Das Meeting dauert ' + x + ' Min. länger, aber du hast gelacht (Energie +' + T().elon.meetEnergie + ').'); }
            say(S, g > 0 ? '»' + m.title + '«: ' + m.dur + ' Minuten, null Ergebnisse. Aber der Schichtleiter strahlt (+' + g + ').' : '»' + m.title + '«: Null Ergebnisse, null Schichtleiter-Laune mehr. Er hat dir längst alles gesagt.');
          } else { const t = targets[m.eff](S); if (t) { t[m.eff] = Math.min(t.need[m.eff], t[m.eff] + (m.eff === 'test' ? 1 : 2)); say(S, '»' + m.title + '« hat wirklich geholfen: ' + t.name + ' kommt voran.'); } else say(S, '»' + m.title + '«: gutes Meeting, aber gerade nichts dafür offen.'); }
        } }
    ],
    kantine: [
      { id: 'coffee', label: 'Kaffee holen', cost: 10, energy: 0, check: S => S.kaffeeDef === S.day ? 'Der Kaffeeautomat ist defekt. Display: »Bitte Wartung rufen«. Die Wartung ist im Cutover.' : null,
        run: S => { if (S.coffeeBlock === S.day) { S.minute += 15; say(S, 'Der Tesla-Kollege und der Kollege, der nichts arbeitet, blockieren die Kaffeemaschine. Diskussion: Kann ein Auto Kaffee kochen? (+15 Min.)', true); }
          S.coffee++; S.stats.coffee++; const g = S.coffee <= 3 ? 14 : 4; S.energy += g; say(S, S.coffee <= 3 ? 'Kaffee. Energie +' + g + '.' : 'Schon der ' + S.coffee + '. Kaffee. Das Herz rast, die Wirkung nicht.');
          if (S.coffee >= 7) egg(S, 'kaffee', 'Die Kaffeemaschine zeigt »Fehler 42: Benutzer zu wach«. Die Kantinenkraft hängt ein Foto von dir an die Pinnwand.'); } },
      { id: 'lunch', label: 'Mittagessen in der Werkskantine (11:30 bis 13:30)', cost: 30, energy: 0,
        check: S => S.lunch ? 'Schon gegessen.' : (S.minute < 11 * 60 + 30 || S.minute > 13 * 60 + 30) ? 'Die Ausgabe hat nur 11:30 bis 13:30 auf.' : null,
        run: S => { S.lunch = true; const b = S.lunchBonus ? 10 : 0; S.lunchBonus = false; S.energy += 25 + b; say(S, (b ? 'Nudeln nach dem Rezept des italienischen Kollegen. Die Kantinenkraft hat es tatsächlich probiert! Energie +35. ' : 'Currywurst mit Pommes, dazu Fabriklärm. Energie +25. ') + pick(S, SC.TIPS)); } },
      // v0.5 Süßigkeitenbox (steht im Büro, Nachschub gibt es am Kiosk der Kantine): einmal pro Woche, 6 Stück
      ...Object.keys(SC.SORTEN).map(k => ({ id: 'box_' + k, label: S => 'Süßigkeitenbox auffüllen: ' + SC.SORTEN[k] + ' (' + T().suess.cost[k] + ' k€' + (S && S.box && S.box.n > 1 ? ', noch ' + S.box.n + ' Stück drin' : '') + ')', cost: 2, energy: 0,
        check: S => S.box.week === week(S) ? 'Diese Woche schon aufgefüllt. Der Kiosk hat nur einmal pro Woche Nachschub.' : S.budget < T().suess.cost[k] ? 'Dafür reicht das Budget nicht.' : null,
        run: S => { const B = S.box; let t = ''; if (B.n === 1) { S.stats.suessLetztes++; t = ' Das letzte Stück isst du selbst. Endlich.'; if (S.stats.suessLetztes >= T().suess.egg) egg(S, 'letztes', SC.LETZTES_EGG); }
          spend(S, T().suess.cost[k]); B.n = T().suess.stk; B.sorte = k; B.week = week(S); S.stats.suess++; say(S, 'Süßigkeitenbox im Büro aufgefüllt: ' + SC.SORTEN[k] + ', ' + B.n + ' Stück.' + t + ' Wer was mag, steht auf dem Zettel am Kiosk.'); } }))
    ],
    drucker: [
      { id: 'fax', label: S => S && S.eggs && S.eggs.elon ? 'Elon-Abo per Fax kündigen' : 'Das Fax-Gerät benutzen', cost: 5, energy: 0, check: () => null,
        run: S => { S.stats.fax++; say(S, S.eggs.elon ? SC.FAX_ELON : SC.FAX[(S.stats.fax - 1) % SC.FAX.length]); if (S.stats.fax >= 5) egg(S, 'fax', SC.FAX_EGG); } },
      { id: 'print', label: 'Spezifikation zur Unterschrift ausdrucken', cost: 10, energy: 1,
        check: S => S.printer.jam ? 'Papierstau! Erst beheben.' : targets.print(S) ? null : 'Nichts zu drucken (Testläufe müssen bestanden sein).',
        run: S => { const m = targets.print(S); spend(S, T().cost.toner); if (rng(S) < (S.tonerUntil >= S.day ? 0.15 : 0.3)) { S.printer.jam = true; say(S, 'Der Drucker frisst Seite 14 von 62. Papierstau. ' + druckerFehler(S), true); return; } m.printed = true; say(S, 'Spezifikation ' + m.name + ' gedruckt und geheftet. Ab zur Werkleitung!'); } },
      { id: 'fix', label: 'Papierstau beheben (Klappe A, B, C, D ...)', cost: 15, energy: 2,
        check: S => S.printer.jam ? null : 'Der Drucker läuft (gerade).', run: S => { S.printer.jam = false; say(S, 'Papierstau behoben. Toner an den Fingern inklusive. ' + druckerFehler(S)); } }
    ],
    server: [
      { id: 'deploy', label: 'Stand auf die Testumgebung deployen', cost: 20, energy: 3,
        check: S => !S.server.up ? 'Server ist down. Erst neu starten.' : targets.deploy(S) ? null : 'Nichts Neues zu deployen.',
        run: S => { const m = targets.deploy(S); m.deployed = true; say(S, m.name + ' läuft auf der Testumgebung. Bereit für den Testlauf an der ' + stName(m.station) + '.'); } },
      { id: 'restart', label: 'MES-Server neu starten', cost: 30, energy: 4,
        check: S => S.server.up ? 'Der Server läuft.' : null, run: S => { S.server.up = true; say(S, 'Server wieder oben. Die Lüfter heulen zufrieden.'); } },
      { id: 'care', label: 'Server-Wartung (Logs, Updates, Platte aufräumen)', cost: 40, energy: 5,
        check: S => S.server.careUntil >= S.day + 2 ? 'Gerade erst gewartet.' : null,
        run: S => { spend(S, T().cost.care); S.server.careUntil = S.day + 3; if (S.server.crashAt !== null && rng(S) < 0.7) S.server.crashAt = null; say(S, 'Wartung erledigt. Die nächsten Tage stürzt er seltener ab.'); } },
      // v0.5 Gag: der digitale Zwilling (keine Spielwirkung, beim 7. Mal ein Easter Egg)
      { id: 'zwilling', label: 'Den digitalen Zwilling anschauen', cost: 5, energy: 0, check: () => null,
        run: S => { S.stats.zwilling++; say(S, SC.ZWILLING[(S.stats.zwilling - 1) % SC.ZWILLING.length]); if (S.stats.zwilling >= 7) egg(S, 'zwilling', SC.ZWILLING_EGG); } }
    ],
    it: [
      { id: 'review', label: 'Architektur-Review mit der IT-Chefin', cost: 40, energy: 5,
        check: S => S.itReview === S.day ? 'Heute schon. Die Pyramide braucht Ruhe.' : (targets.req(S) || targets.spec(S)) ? null : 'Nichts zu reviewen.',
        run: S => { S.itReview = S.day; const m = onePaper(S); say(S, 'Die IT-Chefin zeichnet die Pyramide an das Whiteboard. Dann zeichnet sie sie noch mal, größer. ' + m.name + ' kommt voran (+1 Paket).'); } },
      { id: 'pyramide', label: 'Die Pyramide aus Pappe anschauen', cost: 5, energy: 0, check: () => null,
        run: S => { S.eggs.pyrN = (S.eggs.pyrN || 0) + 1; say(S, 'Feld, Steuerung, Leitebene, MES, ERP. Das MES ist Ebene drei. Wie die Etage, auf der du gerade stehst. Zufall? Die IT-Chefin sagt: nein.');
          if (S.eggs.pyrN >= 7) egg(S, 'pyramide', 'Auf der Rückseite der Pappe steht mit Bleistift: »Ebene 5: Cloud«. Jemand hat es durchgestrichen und »Nein.« daneben geschrieben.'); } }
    ],
    chef: [
      { id: 'report', label: 'Status anhand der Excel-Liste berichten', cost: 20, energy: 2, check: S => S.reported === S.day ? 'Heute schon berichtet.' : null,
        run: S => { S.reported = S.day; if (S.excel) { S.chef += 5; say(S, 'Die Werkleitung: »Die Excel-Liste ist aktuell. So mag ich das.«'); } else { S.chef -= 3; say(S, 'Die Werkleitung: »Und wo steht das in der Excel-Liste?«', true); } } },
      ...SC.ZUSAGE.map(z => ({ id: 'z_' + z.id, label: z.label + ' (Prämie ' + z.praemie + ' k€, Strafe ' + z.strafe + ' k€)', cost: 15, energy: 1,
        check: S => S.zusage ? 'Erst die offene Zusage erfüllen (bis Tag ' + S.zusage.until + ').' : S.day > 16 ? 'Ab Tag 17 nimmt die Werkleitung keine Zusagen mehr an. Nur noch Ergebnisse.' : S.day + z.days > S.deadline ? 'Die Frist läge nach dem Go-Live.' : S.modules.filter(m => !m.done).length < z.need ? 'So viele Module sind gar nicht mehr offen.' : null,
        run: S => { S.zusage = { k: z.id, base: doneCount(S), until: S.day + z.days, need: z.need }; say(S, 'Zusage an die Werkleitung: ' + z.need + (z.need > 1 ? ' Module' : ' Modul') + ' bis Tag ' + S.zusage.until + '. Die Werkleitung schreibt es auf ein Post-it und klebt es an den Bildschirm.'); } })),
      { id: 'abnahme', label: 'Abnahme mit Unterschrift einholen', cost: 30, energy: 3,
        check: S => targets.abnahme(S) ? null : (sapOpen(S) && S.modules.some(m => m.printed && !m.done) ? (S.sap.state === 'nacharbeit' ? 'Die ERP-Schnittstelle wird erst abgenommen, wenn die Stammdaten nachgearbeitet sind (Büro).' : 'Die ERP-Schnittstelle wird erst nach dem SAP-Cutover abgenommen.') : 'Keine gedruckte, getestete Spezifikation dabei.'),
        run: S => { const m = targets.abnahme(S); m.done = true; S.chef += 8; say(S, 'Abgenommen: ' + m.name + '! Unterschrift, Stempel, Händedruck.'); } }
    ],
    controlling: [
      { id: 'tranche', label: 'Wöchentliche Budget-Tranche beantragen', cost: 30, energy: 2,
        check: S => S.trancheWeek === week(S) ? 'Diese Woche schon beantragt. Formular C-18 erst wieder Montag.' : null,
        run: S => { S.trancheWeek = week(S); const k = (S.chef >= 40 ? T().tranche : T().trancheLow) + (isDone(S, 'erp') ? 5 : 0) + (S.image >= 65 ? 5 : S.image < 35 ? -5 : 0) - (S.trancheCut || 0); S.trancheCut = 0; const kk = Math.max(0, k); S.budget += kk; say(S, 'Die Controlling-Abteilung tippt lange auf dem Taschenrechner. Tranche: +' + kk + ' k€.'); } },
      { id: 'kredit', label: 'Kredit aufnehmen (+20 k€, 8 % Zins jeden Freitag, auf volle k€ gerundet)', cost: 20, energy: 1,
        check: S => S.kredit + T().kredit.schritt > rahmen(S) ? 'Kreditrahmen ausgeschöpft (' + rahmen(S) + ' k€). Mehr gibt es nur mit besserem Image.' : null,
        run: S => { S.kredit += T().kredit.schritt; S.budget += T().kredit.schritt; say(S, 'Kredit: +' + T().kredit.schritt + ' k€. Saldo ' + S.kredit + ' von ' + rahmen(S) + ' k€. Die Controlling-Abteilung notiert es in roter Tinte.'); } },
      { id: 'tilgen', label: '20 k€ Kredit tilgen', cost: 20, energy: 1,
        check: S => S.kredit <= 0 ? 'Kein Kredit offen.' : S.budget < Math.min(S.kredit, T().kredit.schritt) ? 'Dafür reicht das Budget nicht.' : null,
        run: S => { const k = Math.min(S.kredit, T().kredit.schritt); S.kredit -= k; S.budget = Math.round((S.budget - k) * 10) / 10; say(S, 'Getilgt: ' + k + ' k€. Restsaldo ' + S.kredit + ' k€. Die Controlling-Abteilung lächelt fast.'); } },
      { id: 'berater', label: 'Externe Berater holen (25 k€, einmal pro Woche)', cost: 30, energy: 2,
        check: S => S.beraterWeek === week(S) ? 'Die Berater kommen erst nächste Woche wieder. Mit neuen Folien.' : !onePaperTarget(S) ? 'Gerade nichts für Berater offen (Requirements und Spezifikation sind durch).' : S.budget < T().berater ? 'Dafür reicht das Budget nicht.' : null,
        run: S => { S.beraterWeek = week(S); spend(S, T().berater); const k = rng(S) < 0.4 ? 1 : 2; for (let i = 0; i < k; i++) onePaper(S); say(S, k === 2 ? 'Die Berater liefern tatsächlich: +2 Pakete Requirements/Spezifikation. Und 80 Folien.' : 'Die Berater liefern 120 Folien und 1 Paket Spezifikation. Die Folien haben schöne Farben.', k === 1); } },
      // v0.4 Markt: drei Angebote am Tag, ein Kauf oder Verkauf am Tag
      ...[0, 1, 2].map(i => ({ id: 'm' + i, cost: 15, energy: 1,
        label: S => { const o = S && S.markt && S.markt.offers[i]; if (!o) return 'Marktplatz: kein Angebot'; const it = SC.MARKT.find(x => x.id === o.id); return 'Markt: ' + (it.short || it.label) + (it.sell ? ' (+' : ' (') + o.price + ' k€)'; },
        check: S => { const o = S.markt && S.markt.offers[i]; if (!o) return 'Heute nur zwei Angebote. Der Markt ist auch nur ein Mensch.'; if (S.markt.bought) return 'Heute schon gehandelt. Die Controlling-Abteilung erlaubt ein Geschäft am Tag.'; const it = SC.MARKT.find(x => x.id === o.id); if (it.sell && S.lizenzen <= 0) return 'Keine alten Lizenzen mehr im Schrank.'; if (!it.sell && S.budget < o.price) return 'Dafür reicht das Budget nicht.'; if (o.id === 'paket' && !onePaperTarget(S)) return 'Gerade nichts für einen Berater offen (Requirements und Spezifikation sind durch).'; return null; },
        run: S => buy(S, i) })),
      ...AUK_ACTS(15)
    ],
    pforte: [
      { id: 'home', label: 'Ausstempeln und Feierabend machen', cost: 0, energy: 0, check: S => S.minute < 15 * 60 ? 'Vor 15:00? Der Pförtner schaut dich nur an.' : partyToday(S) ? 'Erst die Party! Verkleidungspflicht. Der Pförtner trägt schon sein Kostüm (als Pförtner).' : null, run: S => { S.goHome = true; } }
    ]
  };

  // v0.6 Aufzugknopf (Klick auf den Schacht): zählt, beim 7. Mal Easter Egg
  function aufzug(S) { S.stats.aufzug++; const n = S.stats.aufzug; if (n >= 7 && !S.eggs.aufzug) { egg(S, 'aufzug', SC.AUFZUG_EGG); return SC.AUFZUG_EGG; } return SC.AUFZUG[(n - 1) % SC.AUFZUG.length]; }
  // v0.6 Wartezeit bis zur Schichtübergabe (für die Anzeige auf den Knöpfen)
  const handoverWait = (S, room) => (room === 'halle' && S.minute >= SIREN && S.minute < HANDOVER ? HANDOVER - S.minute : 0);
  // v0.5 Elon-Zähler des Tages (Running Gag des Tesla-Kollegen); neue Zufälle nur über rngA mit Salzen ab 20000
  function elonPlus(S) { const E = S.elon; if (E.day !== S.day) { E.day = S.day; E.n = 0; } E.n++; S.stats.elon++; if (S.stats.elon >= T().elon.egg) egg(S, 'elon', SC.ELON_EGG.replace('{n}', S.stats.elon)); }
  const elonHeute = S => (S.elon && S.elon.day === S.day ? S.elon.n : 0);
  const elonSatz = S => SC.ELON[Math.floor(rngA(S, 20000 + S.day * 16 + (S.stats.visits % 16)) * SC.ELON.length)];
  // v0.5 Kopfhörer (Knopf im HUD, überall, ohne Zeit): bis Feierabend lösen sich Tesla-Kollege, Ahnungslose und Altwerk mit einem Nicken auf
  const kopfWhy = S => S.phase !== 'tag' ? 'Kein Arbeitstag.' : S.pending ? 'Erst die Unterbrechung klären.' : S.kopf === S.day ? 'Die Kopfhörer sind schon auf. Es läuft Warteschleifenmusik der SAP-Hotline. Aus Gewohnheit.' : null;
  function kopfhoerer(S) { const why = kopfWhy(S); if (why) return { ok: false, why }; S.kopf = S.day; S.schicht = clamp(S.schicht - T().kopf.schicht, 0, 100); S.stats.kopf++; say(S, 'Kopfhörer auf. Die Kollegen sehen: Christian ist »im Tunnel«. Der Schichtleiter findet das unkollegial (−' + T().kopf.schicht + ').'); return { ok: true }; }
  function act(S, room, id) {
    if (S.phase !== 'tag') return { ok: false, why: 'Kein Arbeitstag.' };
    if (S.pending) return { ok: false, why: 'Erst die Unterbrechung klären.' };
    const a = (A[room] || []).find(x => x.id === id);
    if (!a) return { ok: false, why: 'Unbekannt.' };
    const why = a.check(S);
    if (why) {
      // Easter Egg: dreimal vor 15:00 ausstempeln wollen
      if (room === 'pforte' && id === 'home') { S.eggs.pfN = (S.eggs.pfN || 0) + 1; if (S.eggs.pfN === 3) { egg(S, 'pfoertner', 'Der Pförtner schaut dich lange an. Dann sagt er: »Ich stehe hier seit 1987. Das MES hab ich schon dreimal kommen sehen. Und zweimal gehen.«'); return { ok: false, why: 'Der Pförtner: »Seit 1987, Christian.«' }; } }
      return { ok: false, why };
    }
    if (room === 'halle' && S.minute >= SIREN && S.minute < HANDOVER) { say(S, 'Schichtübergabe: Wartezeit bis 14:20.'); S.minute = HANDOVER; }
    const { cost: c0, rabatt } = costOf(S, room, id, a);
    let cost = c0;
    S.energy -= S.kaffeeDef === S.day ? Math.round(a.energy * 1.3) : a.energy;
    a.run(S);
    if (S._cost !== undefined) { cost = S._cost; delete S._cost; } else if (rabatt) S.box.used = true;
    advance(S, cost);
    if (S.energy <= 0) S.burnout = true;
    return { ok: true };
  }
  // echte Dauer einer Aktion (Gesamtprüfung v0.5: auch für die Anzeige auf den Knöpfen)
  function costOf(S, room, id, a) {
    a = a || (A[room] || []).find(x => x.id === id);
    let cost = Math.round(a.cost * slow(S));
    if (id === 'test') { if (S.testSlot === S.day) cost = Math.round(cost * 0.67); else if (eff(S) >= 70) cost = Math.round(cost * T().meet.testFactor); if (S.budget < 0) cost = Math.round(cost * 1.3); if (S.nordUntil >= S.day) cost = Math.round(cost * 1.5); }
    if (room === 'halle' && id === 'req') { const m = targets.req(S); if (m && faulted(S, m)) cost = Math.round(cost * 1.3); }
    if (room === 'halle' && S.chaosUntil >= S.day) cost = Math.round(cost * 1.4);
    if (id === 'migrate' && S.sap.state === 'nacharbeit') cost = Math.round(cost * 1.25);
    if (room === 'buero' && (id === 'spec' || id === 'impl') && S.chaosUntil >= S.day) cost = Math.round(cost * 1.25);
    if (id === 'repair' && isDone(S, 'trace')) cost -= 15;
    if (id === 'bericht' && isDone(S, 'bde')) cost = 15;
    if (S.lunch && S.minute < 15 * 60 && cost > 20) cost = Math.round(cost * 0.9);
    const r = cost > 0 ? boxRabatt(S, room, id) : 0; if (r) cost = Math.max(5, cost - r);
    // v0.6 Spätzuschlag: wer nach Feierabend noch etwas anfängt, ist langsamer (Party-Minuten zählen nicht)
    if (cost > 0 && T().ueber.spaet !== 1 && S.minute >= SC.DAY_END + (S.partyMin || 0)) cost = Math.round(cost * T().ueber.spaet);
    return { cost, rabatt: r > 0 };
  }
  const actCost = (S, room, id) => costOf(S, room, id).cost;

  // Unterbrechungen (Besuche): Optionen und Auflösung
  function visitOptions(S) {
    const p = S.pending; if (!p) return [];
    if (kopfAuf(S, p)) return [{ id: 'kopf', label: 'Kopfhörer auf: nicken und weiterarbeiten (' + T().kopf.min + ' Min.)' }];
    switch (p.id) {
      case 'tesla': return [{ id: 'zuhoeren', label: 'Zuhören (' + (p.duo ? 25 : 15) + ' Min.)' }, { id: 'abwimmeln', label: 'Abwimmeln (5 Min.)' }, { id: 'thema', label: 'Thema wechseln (' + T().elon.thema + ' Min., klappt meistens)' }];
      case 'italien': return [{ id: 'zuhoeren', label: 'Zuhören und mitessen (12 Min.)' }, { id: 'vertagen', label: '»Erzähl es mir beim Essen« (2 Min.)' }];
      case 'itchefin': return p.opts.map((l, i) => ({ id: 'a' + i, label: 'Ebene ' + l + ': ' + SC.PYR[l] })).concat([{ id: 'skip', label: 'Folie überspringen (10 Min.)' }]);
      case 'ahnungslos': return [{ id: 'erklaeren', label: 'Geduldig erklären (15 Min.)' }, { id: 'abkuerzen', label: '»Das MES ist wie Excel, nur anders.« (5 Min.)' }];
      case 'altwerk': return [{ id: 'mapping', label: 'Mapping zusammen anlegen (30 Min.)' }, { id: 'spaeter', label: 'Später (3 Min.)' }];
      case 'rivale': return [{ id: 'gegen', label: SC.RIVAL_EVT[p.r].gegen.replace('{k}', T().rival.cost) }, { id: 'hin', label: SC.RIVAL_EVT[p.r].hin.replace('{t}', T().rival.cut) }];
      case 'kaffee': return [{ id: 'kantine', label: 'In die Kantine, Filterkaffee (30 Min.)' }, { id: 'durchhalten', label: 'Durchhalten ohne Kaffee (höheres Fehlerrisiko im Testlauf)' }];
      case 'kreis': return [{ id: 'meeting', label: 'Meeting zur Kreis-Pyramide (45 Min.)' }, { id: 'spaeter', label: '»Gern, nach dem SAP-Go-live.« (3 Min.)' }];
      case 'raetsel': return [{ id: 'service', label: 'Servicetechniker rufen (5 k€, sicher, 20 Min.)' }, { id: 'aus', label: 'Aus und wieder an (gratis, 50 %, 10 Min.)' }, { id: 'ticket', label: 'Ticket aufmachen (2 Min.)' }];
      case 'party': return SC.KOSTUEME.map((k, i) => ({ id: 'k' + i, label: k.label }));
      case 'flur': return SC.FLUR[p.k].opts.map((o, i) => ({ id: 'f' + i, label: o.label }));
      default: return [{ id: 'ok', label: p.id === 'sap' || p.id === 'uebernahme' ? 'Na dann. An die Arbeit.' : 'Freut mich!' }];
    }
  }
  const KOPF = ['tesla', 'ahnungslos', 'altwerk'];
  const kopfAuf = (S, p) => S.kopf === S.day && KOPF.includes(p.id);
  function visitText(S) {
    const p = S.pending; if (!p) return null; const VT = SC.VISIT_TEXT; const t = p.t || 0;
    const of = arr => arr[t % arr.length];
    switch (p.id) {
      case 'tesla': return { who: 'Der Tesla-Kollege' + (p.duo ? ' (mit dem Kollegen, der nichts arbeitet)' : ''), text: '»' + of(VT.tesla) + ' ' + elonSatz(S) + '« Reichweite heute laut Display: ' + SC.TESLA_KM(S.day) + ' km. Gestern waren es mehr. Geladen hat er trotzdem nicht.' + (S.day >= T().elon.akkuDay ? ' »' + SC.ELON_AKKU + '«' : '') + (p.duo ? ' ' + of(VT.duo) : '') + ' Elon-Zähler heute: ' + (elonHeute(S) + 1) + '.' };
      case 'italien': return { who: 'Der italienische Kollege', text: '»' + of(VT.italien) + '«' };
      case 'itchefin': return { who: 'Die IT-Chefin (mit der Automatisierungspyramide)', text: '»' + VT.itchefin[p.open % VT.itchefin.length] + ' ' + SC.PYRAMID_Q[p.q].q + '«', pyr: true };
      case 'ahnungslos': return { who: 'Ein Kollege ohne Ahnung', text: of(VT.ahnungslos) };
      case 'altwerk': return { who: 'Der Kollege vom Altwerk', text: of(VT.altwerk) };
      case 'rivale': return { who: SC.RIVAL_EVT[p.r].who, text: SC.RIVAL_EVT[p.r].text };
      case 'kaffee': return { who: 'Die Kantinenkraft (Aushang am Kaffeeautomaten)', text: (S.sap.state === 'migration' && weekday(S) === 4 ? 'Pünktlich zum SAP-Cutover-Wochenende ist der Kaffeeautomat defekt.' : 'Der Kaffeeautomat ist defekt. Seit dem SAP-Umstieg findet er seine Materialnummer für Kaffeebohnen nicht.') + ' Display: »Bitte Wartung rufen«. Die Wartung steckt im Cutover. Die Kantine kocht notfalls Filterkaffee, aber die Schlange ist lang.' + (weekday(S) === 4 ? ' Am Wochenende bleibt er kaputt (Wochenendschicht: Energie −4 je Tag).' : '') };
      case 'kreis': return { who: 'Die IT-Chefin (mit einer neuen Folie)', text: '»Christian, die Pyramide ist vorbei. Ab heute: Industrie 5.0. Als Kreis! Alles ist mit allem verbunden, nichts ist oben, und das MES ist überall. Ich hab 45 Minuten im Besprechungsraum geblockt.«' };
      case 'raetsel': return { who: 'Die Instandhaltung', text: 'Rätselstörung am Verpackungsautomaten: Keine Fehlermeldung, nur die Lampe blinkt. Kurz, kurz, kurz, lang, lang, lang ... Die Instandhaltung meint: »Das ist Morse. Er will uns was sagen.«' };
      case 'party': return { who: 'All-Employee-Party (Kantine, ab 16:30)', text: 'Verkleidungspflicht! ' + SC.PARTY_GAESTE + ' Und du, Christian?' };
      case 'flur': return { who: 'Flurfunk · ' + SC.FLUR[p.k].who, text: SC.FLUR[p.k].text };
      case 'lieferant': return { who: 'Ein Lieferant', text: 'Ein Lieferant bringt Ersatzteile für den Verpackungsautomaten. Zum Sonderpreis, drei Tage lang.' };
      case 'azubi': return { who: 'Der Azubi', text: 'Der Azubi hat heimlich die Requirements abgetippt. Sauber. Mit Inhaltsverzeichnis.' };
      case 'audit': return { who: 'Das Qualitätsaudit', text: 'Das Qualitätsaudit lobt deine Testprotokolle bei der Werkleitung. Sogar die Excel-Liste.' };
      case 'sap': return { who: 'Die Werkleitung (Rundmail an alle)', text: 'Ab heute gibt es ein neues SAP-System! Die ERP-Schnittstelle muss neu angepasst werden, die Stammdaten müssen migriert werden (Büro, 4 Pakete). Cutover ist Freitag. Kick-off um 11:00, Pflicht. Lizenz: −' + T().cost.sap + ' k€.' };
      case 'uebernahme': return { who: 'Die Werkleitung (Betriebsversammlung in der Kantine)', text: 'Wir haben die Konkurrenz gekauft! Das Altwerk kommt dazu, mit eigenem System. Neues Modul: Systemfusion Altwerk (Teststation Extrusion). Go-Live verschiebt sich auf Tag ' + (SC.DEADLINE + 2) + '. Kosten: −' + T().cost.fusion + ' k€. Am Turm hängt jetzt ein zweites Schild. Schief.' };
      default: return { who: '', text: '' };
    }
  }
  function choose(S, opt) {
    const p = S.pending; if (!p) return { ok: false };
    S.pending = null; S.stats.visits++;
    if (S.vDay !== S.day) { S.vDay = S.day; S.vN = 0; } S.vN++;
    let min = 0;
    if (p.id === 'tesla') elonPlus(S);
    if (opt === 'kopf' && kopfAuf(S, p)) { advance(S, T().kopf.min); say(S, 'Du nickst mit Kopfhörern. ' + (p.id === 'tesla' ? 'Der Tesla-Kollege erzählt die Reichweite jetzt dem Drucker.' : p.id === 'altwerk' ? 'Der Kollege vom Altwerk legt einen Zettel hin: »Mapping morgen?«' : 'Er fragt den Drucker, ob das MES Kaffee kochen kann.')); return { ok: true }; }
    switch (p.id) {
      case 'tesla':
        if (opt === 'zuhoeren') { min = p.duo ? 25 : 15; S.energy += 4; S.schicht += 2; say(S, 'Du hörst zu. Du weißt jetzt alles über Reichweite im Winter. Energie +4 vom Lachen, und die Schicht erzählt es dem Schichtleiter (+2).'); }
        else if (opt === 'thema') { const EL = T().elon; S.stats.elonThema++; min = EL.thema; S.energy += 1;
          if (rngA(S, 20001 + S.day * 16 + (S.stats.visits % 16)) < EL.nein) { min += EL.neinMin; say(S, SC.ELON_THEMA_NEIN + ' (+' + EL.neinMin + ' Min.)', true); }
          else say(S, SC.ELON_THEMA[Math.floor(rngA(S, 20002 + S.day * 16 + (S.stats.visits % 16)) * SC.ELON_THEMA.length)] + ' Energie +1.'); }
        else { min = 5; S.energy -= 2; if (rng(S) < 0.25) { S.coffeeBlock = S.day; say(S, 'Abgewimmelt. Die beiden ziehen beleidigt in die Kaffeeküche und bleiben dort.', true); } else say(S, 'Abgewimmelt. Sie diskutieren im Flur weiter.'); }
        break;
      case 'italien':
        if (opt === 'zuhoeren') { S.itStreak = (S.itStreak || 0) + 1; }
        else S.itStreak = 0;
        if (opt === 'zuhoeren' && S.itStreak >= 3) { min = 12; S.itStreak = 0; S.tiramisu = S.day; say(S, 'Der italienische Kollege bringt dir zum Dank fürs Zuhören ein Tiramisu von seiner Nonna. Du liest die Spezifikation noch mal mit Löffel in der Hand: Der nächste Testlauf heute hat deutlich weniger Fehlerrisiko.'); }
        else if (opt === 'zuhoeren') { min = 12; S.energy += 6; if (rng(S) < 0.3) { S.lunchBonus = true; say(S, 'Er schreibt dir ein Rezept auf und gibt es der Kantinenkraft. Nächstes Mittagessen +10 Energie.'); } else say(S, 'Eine wunderbare Geschichte. Und ein Espresso. Energie +6.'); }
        else { min = 2; say(S, '»Beim Essen, versprochen!« Er zwinkert. Er kommt wieder.'); }
        break;
      case 'itchefin': {
        const q = SC.PYRAMID_Q[p.q];
        if (opt === 'skip') { min = 10; if (rng(S) < 0.35) { min += 20; say(S, 'Die IT-Chefin besteht auf der Folie. Und auf der nächsten. (+20 Min.)', true); } else say(S, 'Folie übersprungen. Sie seufzt, lächelt und kommt bestimmt wieder.'); }
        else { const lvl = p.opts[+opt.slice(1)]; if (lvl === q.a) { min = 15; S.stats.pyrRight++; const m = onePaper(S); say(S, 'Richtig, Ebene ' + q.a + ': ' + SC.PYR[q.a] + '! Die IT-Chefin strahlt und hilft dir kurz' + (m ? ': ' + m.name + ' +1 Paket.' : '.')); }
          else { min = 40; S.energy -= 4; S.stats.pyrWrong++; say(S, 'Falsch. Richtig wäre Ebene ' + q.a + ': ' + SC.PYR[q.a] + '. Es folgt ein Vortrag über alle fünf Ebenen. (40 Min.)', true); } }
        break; }
      case 'ahnungslos':
        if (opt === 'erklaeren') { min = 15; if (rng(S) < 0.5) { S.chef += 2; say(S, 'Er hat es verstanden. Glaubt er. Er lobt dich bei der Werkleitung (+2).'); } else say(S, 'Er nickt. Dann fragt er, ob das MES auch Excel kann.'); }
        else { min = 5; say(S, '»Ah. Wie Excel. Verstehe.« Er versteht nicht.'); }
        break;
      case 'altwerk':
        if (opt === 'mapping') { min = 30; const f = modById(S, 'fusion'); if (f && !f.done && f.req >= f.need.req && f.spec < f.need.spec) { f.spec++; say(S, 'Mapping angelegt: Systemfusion Spezifikation +1. »Artikelnummer_neu_2« heißt jetzt »Artikelnummer«.'); } else if (f && !f.done && f.req < f.need.req) { f.req++; say(S, 'Mapping angelegt: Systemfusion Requirements +1.'); } else { S.chef += 1; say(S, 'Gutes Gespräch. Die Werkleitung hört davon (+1).'); } }
        else { min = 3; say(S, '»Später« heißt beim Altwerk: morgen wieder.'); }
        break;
      case 'rivale':
        if (opt === 'gegen') { min = 10; spend(S, T().rival.cost); S.image += 1; say(S, p.r === 0 ? 'Der Bediener bleibt. Mit Zulage und einem neuen Stuhl. Werk Nord ist sauer.' : 'Die KPI-Folien sind bunt und überzeugen den Vorstand. Werk Süd muss jetzt selbst eine Excel-Liste vorzeigen.'); }
        else { S.image -= 3; S.rivals[p.r].prog = Math.min(99, S.rivals[p.r].prog + 2); if (p.r === 0) { S.nordUntil = S.day + 2; say(S, 'Der Bediener geht zu Werk Nord. Testläufe dauern drei Tage lang deutlich länger. Image −3.', true); } else { S.chef -= 5; S.image -= 4; S.trancheCut = (S.trancheCut || 0) + T().rival.cut; say(S, 'Der Vorstand glaubt Werk Süd: Werkleitung −5, Image −7, und die nächste Tranche wird um ' + T().rival.cut + ' k€ gekürzt.', true); } }
        S.image = clamp(S.image, 0, 100); break;
      case 'kaffee': S.ev.kaffee = S.day;
        if (opt === 'kantine') { min = 30; S.energy += 4; say(S, 'Filterkaffee aus der Kantine. Schmeckt nach 1994, wirkt aber. Der Automat bleibt kaputt, die Kantine hilft heute aus.'); }
        else { S.kaffeeDef = S.day; say(S, 'Durchhalten ohne Kaffee. Alles strengt heute mehr an, und im Testlauf passieren eher Fehler.', true); }
        break;
      case 'kreis': S.ev.kreis = S.day;
        if (opt === 'meeting') { min = 45; S.chef += 4; S.energy -= 5; say(S, '45 Minuten Kreis. Die IT-Chefin malt Pfeile, die zurück zu sich selbst zeigen. Die Werkleitung findet dein Interesse vorbildlich (+4).'); }
        else { min = 3; S.chef -= 10; say(S, 'Die IT-Chefin geht direkt zur Werkleitung: »Christian blockiert Industrie 5.0.« Werkleitung −10.', true); }
        break;
      case 'raetsel': { S.ev.raetsel = S.day; const st = stationOf(S, 'inpack');
        if (opt === 'service') { min = 20; spend(S, 5); if (st.fault) fixFault(S, st); say(S, 'Der Servicetechniker hört der Lampe zu, nickt und tauscht ein Relais. Die Lampe blinkt zum Abschied »D A N K E«. −5 k€.'); }
        else if (opt === 'aus') { min = 10; if (rngF(S) < 0.5) { if (st.fault) fixFault(S, st); say(S, 'Aus und wieder an. Er bootet, piept einmal und läuft. Niemand weiß, warum. Das ist IT.'); } else { if (!st.fault) { st.fault = { at: S.minute }; S.stats.faults++; } say(S, 'Aus und wieder an. Jetzt blinkt die Lampe »S O S«. Die Innenverpackung steht. Ab in die Werkstatt.', true); } }
        else { min = 2; S.ev.ticket = Math.max(18, S.day + 1); if (st.fault) fixFault(S, st); say(S, 'Ticket #4711 angelegt, Priorität »mittel«. Die Nachtschicht klebt Isolierband über die Lampe. Problem gelöst. Bis Tag ' + S.ev.ticket + '.'); }
        break; }
      case 'party': { S.ev.party = S.day; const k = SC.KOSTUEME[+String(opt).slice(1)] || SC.KOSTUEME[SC.KOSTUEME.length - 1];
        min = k.min; S.partyMin = Math.max(0, S.minute + k.min - SC.DAY_END) > 0 ? Math.min(k.min, S.minute + k.min - SC.DAY_END) : 0; S.energy += k.energy || 0; S.chef += k.chef || 0; S.schicht += k.schicht || 0; S.family += (k.family || 0) - 1; S.ev.kostuem = k.label.replace(/ \(.*$/, '');
        say(S, 'Party: ' + k.msg); break; }
      case 'flur': { const o = SC.FLUR[p.k].opts[+String(opt).slice(1)] || SC.FLUR[p.k].opts[1]; S.stats.flur++; min = o.min; S.energy += o.energy || 0; S.schicht += o.schicht || 0; say(S, o.msg, (o.energy || 0) < 0 || (o.schicht || 0) < 0); break; }
      case 'lieferant': S.partsUntil = Math.max(S.partsUntil, S.day + 2); say(S, 'Ersatzteile im Lager: Reparaturen kosten drei Tage lang nur 2 k€.'); break;
      case 'azubi': { const m = onePaper(S); say(S, 'Danke, Azubi!' + (m ? ' ' + m.name + ' +1 Paket.' : '')); break; }
      case 'audit': S.chef += 3; say(S, 'Lob vom Audit: Werkleitung +3.'); break;
      case 'sap': say(S, 'SAP-Migration läuft. Stammdaten im Büro migrieren, Cutover am Freitag.'); break;
      case 'uebernahme': say(S, 'Firmenübernahme: Systemfusion Altwerk ist jetzt das sechste Modul. Go-Live Tag ' + S.deadline + '.'); break;
    }
    if (min) advance(S, min); else events(S);
    return { ok: true };
  }

  // v0.5 Gag: Archiv-Tür (Deko) liefert Fundstücke, beim 5. Mal das erste Lastenheft
  function archiv(S) { S.stats.archiv++; const t = SC.ARCHIV[(S.stats.archiv - 1) % SC.ARCHIV.length]; if (S.stats.archiv === 5) egg(S, 'lastenheft', SC.ARCHIV_EGG); return t; }
  function modWork(m) { return m.need.req + m.need.spec + m.need.impl + 1 + m.need.test + 1 + 1; }
  function progress(S) {
    let p = 0, per = 0;
    for (const m of S.modules) { per += modWork(m); p += m.done ? modWork(m) : (m.req + m.spec + m.impl + (m.deployed ? 1 : 0) + m.test + (m.printed ? 1 : 0)); }
    return Math.round(p / per * 100);
  }
  // KPIs
  function kpiTarget(S, downH) {
    const K = SC.KPI, out = {};
    for (const k of Object.keys(K.start)) {
      let v = K.start[k];
      for (const m of S.modules) if (m.done && K.mod[k][m.id]) v += K.mod[k][m.id];
      v += K.down[k] * downH;
      if (S.chaosUntil >= S.day) { if (k === 'oee') v -= 4; if (k === 'ausschuss') v += 1.5; }
      out[k] = v;
    }
    return out;
  }
  function kpiScore(S) {
    const K = SC.KPI; let sum = 0;
    for (const k of Object.keys(K.start)) {
      const f = k === 'ausschuss' ? (K.start[k] - S.kpi[k]) / (K.start[k] - K.ziel[k]) : (S.kpi[k] - K.start[k]) / (K.ziel[k] - K.start[k]);
      sum += clamp(f, 0, 1.2);
    }
    return sum / 4;
  }
  const kpiIndex = S => Math.round(Math.min(1, kpiScore(S)) * 100);
  function kpiPath(S) { return clamp((S.day - 4) / (S.deadline - 4), 0, 1) * 0.9; }
  function updateKpi(S, downMin, overnight) {
    const t = kpiTarget(S, Math.min(downMin, 600) / 60);
    if (overnight) t.ausschuss += 0.6;
    for (const k of Object.keys(t)) {
      let v = S.kpi[k] + (t[k] - S.kpi[k]) * 0.35 + (rng(S) - 0.5);
      v = k === 'ausschuss' ? Math.max(0, v) : k === 'durchsatz' ? Math.max(0, v) : clamp(v, 0, 100);
      S.kpi[k] = Math.round(v * 10) / 10;
    }
    S.kpiHist.push(Object.assign({ day: S.day }, S.kpi));
    if (S.kpiHist.length > 30) S.kpiHist.shift();
  }

  // Wochenrückblick am Freitag (auch nach einem Burnout-Sprung vom Donnerstag auf den Freitag)
  function wochenRueckblick(S, R) {
    if (S.reportWeek !== week(S)) { S.chef -= 4; R.lines.push(['bad', 'Wochenrückblick ohne KPI-Bericht: Werkleitung −4']); }
    else { const d = clamp(Math.round((kpiScore(S) - kpiPath(S)) * 20), -5, 5); S.chef += d; R.lines.push([d >= 0 ? 'good' : 'bad', 'Wochenrückblick KPI-Index ' + kpiIndex(S) + ' %: Werkleitung ' + (d >= 0 ? '+' : '') + d]); }
    wochenAuswertung(S, R);
  }
  // v0.4: Prognose und Wassermelone am Freitag auswerten (idempotent: k = null, melone = -2; auch nach einem Burnout-Sprung auf den Freitag)
  function wochenAuswertung(S, R) {
        // v0.4 Prognose-Auswertung
    const PG = T().prognose, names = ['unter Plan', 'im Plan', 'über Plan'];
    if (S.prog.week === week(S) && S.prog.k !== null) { const ist = prognoseBand(S), off = Math.abs(ist - S.prog.k);
      if (off === 0) { S.chef += PG.hit; S.image += PG.hitImage; S.prog.hits++; S.stats.treffer++; R.lines.push(['good', 'Prognose getroffen (' + names[ist] + '): Werkleitung +' + PG.hit + ', Image +' + PG.hitImage + '. Die Werkleitung nennt dich »unseren Planer«.']); }
      else if (off === 1) { S.chef -= PG.miss1; R.lines.push(['info', 'Prognose knapp daneben (gesagt: ' + names[S.prog.k] + ', ist: ' + names[ist] + '). Die Werkleitung zuckt mit den Schultern (−' + PG.miss1 + ').']); }
      else { S.chef -= PG.miss2; R.lines.push(['bad', 'Prognose klar daneben (gesagt: ' + names[S.prog.k] + ', ist: ' + names[ist] + '): Werkleitung −' + PG.miss2]); }
      S.prog.k = null; }
    // Wassermelone: war es innen rot, kommt mit etwas Pech das Audit
    if (S.prog.melone === week(S)) { if (kpiScore(S) < kpiPath(S) && rngM(S) < PG.meloneP) { S.chef -= PG.meloneMinus; S.image -= PG.meloneMinus; R.lines.push(['bad', 'Das Audit schneidet die Wassermelone auf: innen rot. Werkleitung −' + PG.meloneMinus + ', Image −' + PG.meloneMinus + '. Die Werkszeitung titelt »Grün ist relativ«.']); }
      else R.lines.push(['info', 'Wassermelonen-Bericht: Niemand hat nachgeschaut. Diesmal.']); S.prog.melone = -2; }
  }
  // Abend: Bilanz, KPIs, Budget, Rivalen, Familie, Sieg/Niederlage
  function endDay(S) {
    const R = { day: S.day, weekday: SC.WEEKDAYS[weekday(S)], lines: [], log: S.dayLog.slice() };
    if (S.pending) { S.visits.unshift(S.pending); S.pending = null; }
    events(S);
    const left = Math.max(SC.DAY_END, S.minute);
    const over = Math.max(0, Math.round(left - SC.DAY_END) - (S.partyMin || 0));
    if (!S.excel) { S.chef -= 6; R.lines.push(['bad', 'Excel-Liste nicht gepflegt: Werkleitung −6']); }
    if (over > 0) { const U = T().ueber, f = Math.max(over > U.frei ? U.min : 0, Math.round(over / U.div)); S.family -= f; S.stats.overtime += over; R.lines.push(['bad', 'Überstunden ' + over + ' Min.: Familie −' + f]); }
    else { S.family += 4; R.lines.push(['good', 'Pünktlich daheim: Familie +4']); }
    // Stillstand und KPIs
    let down = S.downMin, overnight = false;
    for (const st of S.stations) if (st.fault) { down += Math.max(0, SC.DAY_END - st.fault.at); if (st.fault.at <= SC.DAY_START) overnight = true; }
    S.downMin = 0;
    const before = Object.assign({}, S.kpi);
    updateKpi(S, down, overnight);
    R.kpi = Object.keys(S.kpi).map(k => ({ k, ist: S.kpi[k], d: Math.round((S.kpi[k] - before[k]) * 10) / 10, ziel: SC.KPI.ziel[k] }));
    if (down > 0) R.lines.push(['bad', 'Stillstand heute ' + Math.round(down) + ' Min.' + (overnight ? ' (der Verpackungsautomat steht seit gestern)' : '') + ': KPIs leiden']);
    const met = R.kpi.filter(x => x.k === 'ausschuss' ? x.ist <= x.ziel : x.ist >= x.ziel).length;
    if (met >= 3) { S.chef += 2; R.lines.push(['good', met + ' von 4 KPIs im Ziel: Werkleitung +2']); }
    // Besprechungsquote
    if (S.uselessMin > T().meet.quotaMin) { const k = Math.ceil((S.uselessMin - T().meet.quotaMin) / 30); S.chef -= k * T().meet.quotaPen; R.lines.push(['bad', 'Die Werkleitung zählt: ' + S.uselessMin + ' Min. Schichtleiter-Meetings, null Ergebnisse. Werkleitung −' + k * T().meet.quotaPen]); }
    if (S.auktion && !S.auktion.res && S.day >= S.auktion.closeDay) closeAuktion(S, R);
    // Wochenrückblick
    if (weekday(S) === 4) wochenRueckblick(S, R);

    // Budget
    if (T().cost.daily) spend(S, T().cost.daily);
    if (weekday(S) === 4 && S.kredit > 0) { const z = Math.max(1, Math.round(S.kredit * T().kredit.zins)); spend(S, z); R.lines.push(['bad', 'Kreditzinsen (Saldo ' + S.kredit + ' k€): −' + z + ' k€']); }
    // Zusage an die Werkleitung
    if (S.zusage) { const Z = SC.ZUSAGE.find(z => z.id === S.zusage.k), got = doneCount(S) - S.zusage.base;
      if (got >= S.zusage.need) { S.budget += Z.praemie; S.chef += Z.chef; S.image += Z.image; R.lines.push(['good', 'Zusage gehalten (' + got + '/' + S.zusage.need + ' Module): +' + Z.praemie + ' k€, Werkleitung +' + Z.chef + ', Image +' + Z.image]); S.zusage = null; }
      else if (S.day >= S.zusage.until) { spend(S, Z.strafe); S.chef -= Z.chefMinus; S.image -= Z.imageMinus; R.lines.push(['bad', 'Zusage gebrochen (' + got + '/' + S.zusage.need + ' Module bis Tag ' + S.zusage.until + '): −' + Z.strafe + ' k€, Werkleitung −' + Z.chefMinus + ', Image −' + Z.imageMinus]); S.zusage = null; } }
    if (S.budget < 0) { S.chef -= 2; R.lines.push(['bad', 'Budgetsperre (' + S.budget + ' k€): Werkleitung −2, Testläufe dauern länger']); }
    // Rivalen
    for (const [i, r] of S.rivals.entries()) {
      if (r.live) continue;
      const cfg = SC.RIVALS[i]; r.prog = Math.min(100, Math.round((r.prog + (cfg.min + rng(S) * (cfg.max - cfg.min)) * (1.1 - 0.002 * S.image)) * 10) / 10);
      if (r.prog >= 100) { r.live = true; S.chef -= 8; S.image -= 5; R.lines.push(['bad', r.name + ' ist live gegangen! Werkleitung −8, Image −5']); }
    }
    const me = progress(S);
    const best = Math.max(...S.rivals.map(r => r.prog));
    if (me >= best) { S.chef += 2; R.lines.push(['good', 'Du führst im Werksvergleich: Werkleitung +2']); }
    else if (me < best - 12) { S.chef -= 3; R.lines.push(['bad', 'Deutlich hinter ' + S.rivals.find(r => r.prog === best).name + ': Werkleitung −3']); }
    if (me >= best || met >= 3) S.image += 1;
    S.image = clamp(S.image, 0, 100);
    // v0.5 Konzernaudit erst nach allen Abendwirkungen auf Image und Werkleitung (Review 1)
    if (weekday(S) === 4) auditFreitag(S, R);
    if (S.modules.some(m => m.deployed && !m.done) && rng(S) < 0.22) { S.energy -= 10; S.family -= 3; R.lines.push(['bad', '23:40 Anruf aus der Nachtschicht: »Das neue MES-Dings zeigt Rot.« Energie −10, Familie −3']); }
    if (S.chaosUntil >= S.day) { S.stats.chaosDays++; R.lines.push(['bad', 'SAP-Chaos: Niemand findet seine Materialnummer.']); }
    // Das Chaos hört erst auf, wenn die Stammdaten nachgearbeitet sind
    if (S.sap.state === 'nacharbeit' && S.chaosUntil <= S.day) { S.chaosUntil = S.day + 1; R.lines.push(['bad', 'SAP-Chaos geht weiter, bis die Stammdaten nachgearbeitet sind.']); }
    if (S.immerToday) R.lines.push(['info', '»Das hatten wir schon immer so«: heute ' + S.immerToday + 'x, insgesamt ' + S.stats.immer + 'x']);
    if (S.ev.party === S.day) R.lines.push(['info', 'Kostümparty: du warst ' + S.ev.kostuem + '. Die Überstunden zählen heute nicht.']);
    if (S.bingoDay === S.day) R.lines.push(['info', 'Buzzword-Bingo gewonnen: ' + S.bingo.slice(0, SC.BINGO_NEED).join(', ') + ' (+' + T().bingoScore + ' Punkte)']);
    if (elonHeute(S)) R.lines.push(['info', 'Elon-Zähler heute: ' + elonHeute(S) + ' (insgesamt ' + S.stats.elon + '). Der Tesla-Kollege ist zufrieden mit dir.']);
    R.lines.push(['info', 'Werkszeitung: ' + pickF(S, SC.SCHLAGZEILEN)]);
    S.schicht -= 3;
    if (S.schicht < 20) { S.chef -= 3; R.lines.push(['bad', 'Der Schichtleiter hat sich bei der Werkleitung über dich beschwert: Werkleitung −3']); }
    const rest = 55 - Math.round(over / T().ueber.rest);
    S.energy = clamp(S.energy + rest, 15, 100);
    let fri = weekday(S) === 4;
    if (S.burnout) { S.burnout = false; S.chef -= 8; S.family -= 4; S.energy = 70; R.lines.push(['bad', 'Am Schreibtisch eingeschlafen, Kopf auf der Tastatur. Ein Tag krank: Werkleitung −8.']); S.day++; if (T().cost.daily) spend(S, T().cost.daily); if (weekday(S) === 4 && S.kredit > 0) { const z = Math.max(1, Math.round(S.kredit * T().kredit.zins)); spend(S, z); R.lines.push(['bad', 'Kreditzinsen (Saldo ' + S.kredit + ' k€): −' + z + ' k€']); } if (S.auktion && !S.auktion.res && S.day >= S.auktion.closeDay) closeAuktion(S, R); if (weekday(S) === 4) { fri = true; wochenRueckblick(S, R); S.chef = clamp(S.chef, 0, 100); S.image = clamp(S.image, 0, 100); auditFreitag(S, R); } }
    S.chef = clamp(S.chef, 0, 100); S.family = clamp(S.family, 0, 100); S.schicht = clamp(S.schicht, 0, 100);
    R.progress = me; R.rivals = S.rivals.map(r => ({ name: r.name, prog: r.prog })); R.budget = S.budget; R.kpiIndex = kpiIndex(S);
    R.friday = fri;
    if (R.friday && S.day >= 10 && S.sap.state === 'migration') { S.sap.cutover = true; R.lines.push(['bad', 'SAP-Cutover steht an, aber die Stammdaten sind erst ' + S.sap.pk + '/' + S.sap.need + '. Wochenendschicht oder Chaos?']); }
    checkEnd(S);
    if (!S.result) S.phase = R.friday ? 'wochenende' : 'abend';
    S.lastReport = R;
    return R;
  }
  function checkEnd(S) {
    if (S.result) return;
    if (S.modules.every(m => m.done)) S.result = { win: true, why: 'Alle ' + S.modules.length + ' Module sind abgenommen. Das MES geht in ' + SC.PLANT + ' live! Nach nur ' + (7 + S.day % 3) + ' Jahren.' };
    else if (S.budget < -40) S.result = { win: false, why: 'Das Controlling stoppt das Projekt. Du darfst die Excel-Liste behalten.' };
    else if (S.chef <= 0) S.result = { win: false, why: 'Die Werkleitung zieht dich vom Projekt ab. Werk Nord übernimmt.' };
    else if (S.family <= 0) S.result = { win: false, why: 'Zuhause hängt der Haussegen schief. Du kündigst und wirst Imker.' };
    // v0.5 zweiter Siegpfad: nach den Niederlagen durch Werkleitung, Familie und Budget, aber vor dem verpassten Termin
    else if (S.pfad === 'vorzeig') S.result = { win: true, pfad: 'vorzeig', why: SC.VORZEIG };
    else if (S.day >= S.deadline) S.result = { win: false, why: 'Go-Live-Termin verpasst. Das Projekt wird »neu aufgesetzt«, mit einem neuen Kick-off zum Kick-off.' };
    if (S.result && S.result.win && !S.result.pfad) { if (kpiIndex(S) >= T().titel.kpi && S.image >= T().titel.image) { S.titel = 'Werk des Jahres'; S.result.titel = S.titel; S.result.why += ' Und mehr: KPI-Index ' + kpiIndex(S) + ' %, Image ' + Math.round(S.image) + '. Der Konzern kürt ' + SC.PLANT + ' zum »Werk des Jahres«. Der Pokal steht jetzt neben der Pyramide aus Pappe.'; } }
    if (S.result) { S.result.score = score(S); S.phase = 'ende'; }
  }
  function score(S) {
    return Math.max(0, Math.round(progress(S) * 10 + (S.result && S.result.win ? (S.result.pfad ? T().audit.score : (S.deadline - S.day) * 150 + 1000) : 0) + S.family * 5 + S.chef * 5 + kpiIndex(S) * 5 + Math.max(0, S.budget) / 2 + (S.stats.bingo ? T().bingoScore : 0) + S.stats.eggs * 25 + S.image * 3 - S.kredit / 2 + (S.titel ? T().titel.score : 0)));
  }
  // Wochenendschicht: shifts = 0, 1 oder 2 Tage
  function weekend(S, shifts) {
    const out = [];
    // Cutover am Wochenende: die Schicht migriert zuerst die fehlenden Stammdaten
    let sapRest = S.sap.cutover && S.sap.state === 'migration' && shifts >= 1 ? Math.max(0, S.sap.need - S.sap.pk) : 0;
    for (let d = 0; d < shifts; d++) {
      S.stats.weekend++;
      const use = Math.min(4, sapRest); sapRest -= use;
      autoWork(S, 4 - use);
      spend(S, T().cost.weekend);
      S.family -= T().weekendFam; S.energy -= 12 + (S.ev.kaffee === S.day ? 4 : 0); S.chef += 3;
    }
    if (shifts > 0 && S.ev.kaffee === S.day) out.push('Der Kaffeeautomat ist auch am Wochenende kaputt: zusätzlich Energie −' + 4 * shifts + '.');
    if (shifts === 0) { S.family += 8; S.energy = 100; out.push('Wochenende frei: Familie +8, voll erholt.'); }
    else out.push('Wochenendschicht (' + shifts + (shifts > 1 ? ' Tage' : ' Tag') + '): viel geschafft, Familie −' + T().weekendFam * shifts + ', Werkleitung +' + 3 * shifts + ', Budget −' + T().cost.weekend * shifts + ' k€ (Zuschläge).');
    if (S.sap.cutover && S.sap.state === 'migration') {
      S.sap.cutover = false; S.sap.state = 'done';
      if (shifts >= 1) { S.sap.pk = S.sap.need; out.push('SAP-Cutover am Wochenende durchgezogen (die Schicht hat die restlichen Stammdaten migriert). Montag läuft alles. Fast.'); }
      else { S.chaosUntil = S.day + 3; S.chef -= 8; if (S.sap.pk < S.sap.need) S.sap.state = 'nacharbeit'; out.push('SAP-Cutover ohne Wochenendschicht: drei Tage Chaos, Werkleitung −8.' + (S.sap.state === 'nacharbeit' ? ' Die fehlenden Stammdaten (' + (S.sap.need - S.sap.pk) + ' Pakete) müssen im Büro nachgearbeitet werden, sonst keine Abnahme der ERP-Schnittstelle.' : '')); }
    }
    S.chef = clamp(S.chef, 0, 100); S.family = clamp(S.family, 0, 100); S.energy = clamp(S.energy, 15, 100);
    if (S.family <= 0) { S.result = { win: false, why: 'Zuhause hängt der Haussegen schief. Du kündigst und wirst Imker.' }; S.result.score = score(S); S.phase = 'ende'; }
    else checkEnd(S);
    return out;
  }
  function startDay(S) {
    if (S.phase === 'ende') return;
    S.day++; S.minute = SC.DAY_START; S.phase = 'tag'; S.goHome = false; S.msgs = []; S.pending = null;
    if (S.printer.jam && rng(S) < 0.5) S.printer.jam = false;
    // Nachtschicht und Instandhaltung beheben manches über Nacht (der Verpackungsautomat bleibt gern stehen)
    for (const st of S.stations) if (st.fault) { const pack = st.id === 'inpack' || st.id === 'auspack'; if (rng(S) < (pack ? 0.35 : 0.75)) { st.fault = null; S.msgs.push({ t: 'Die Nachtschicht hat ' + stName(st.id) + ' wieder zum Laufen gebracht. Mit einem beherzten Tritt.', bad: false }); } else st.fault.at = SC.DAY_START; }
    planDay(S);
  }
  const SAVE = 'mesmarathon-save';
  function save(S) { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* */ } }
  // v0.4: alter Spielstand einer anderen Version (für einen Hinweis im Titel)
  function oldSave() { try { const s = JSON.parse(localStorage.getItem(SAVE)); return s && s.v !== SC.VERSION ? s.v : null; } catch (e) { return null; } }
  function load() { try { const s = JSON.parse(localStorage.getItem(SAVE)); if (!s || s.v !== SC.VERSION) return null; const d = newGame(s.seed || 1); for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k]; for (const k of Object.keys(d.stats)) if (s.stats[k] === undefined) s.stats[k] = 0; return s; } catch (e) { return null; } }
  // Highscore (lokal, Top 5) wie bei Mad TV
  function addScore(S) {
    try { const k = 'mesmarathon-highscore'; const L = JSON.parse(localStorage.getItem(k) || '[]'); L.push({ score: S.result.score, win: S.result.win, day: S.day }); L.sort((a, b) => b.score - a.score); localStorage.setItem(k, JSON.stringify(L.slice(0, 5))); return L.slice(0, 5); } catch (e) { return []; }
  }
  function highscores() { try { return JSON.parse(localStorage.getItem('mesmarathon-highscore') || '[]'); } catch (e) { return []; } }

  SC.sim = { newGame, act, actCost, elonHeute, aufzug, handoverWait, advance, events, endDay, weekend, startDay, progress, nextMeeting, activeMeeting, actions: A, targets, hm, weekday, week, save, load, slow,
    choose, visitOptions, visitText, oldSave, archiv, kopfhoerer, kopfWhy, nordRatio, rngA, closeAuktion, auktionOpen, bidPrice, auditOk, rngF, rngM, prognoseBand, rahmen, kpiScore, kpiIndex, kpiPath, kpiTarget, autoWork, addScore, highscores, stationOf, stName, rng };
})(window.SC);

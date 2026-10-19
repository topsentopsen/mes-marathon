// MES-Marathon: Spiellogik ohne Grafik (läuft auch in Node für Tests und Balance-Bot)
'use strict';
(function (SC) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rng(S) { S.rs = (S.rs * 1103515245 + 12345) & 0x7fffffff; return S.rs / 0x7fffffff; }
  // Eigener Zufallsstrom für die v0.3-Gags (Flurfunk, Bingo, Durchsagen): die bestehenden Würfe aus S.rs bleiben je Seed gleich
  function rngF(S) { S.rf = (S.rf * 1103515245 + 12345) & 0x7fffffff; return S.rf / 0x7fffffff; }
  const pickF = (S, arr) => arr[Math.floor(rngF(S) * arr.length)];
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
      v: SC.VERSION, seed: seed >>> 0 || 1, rs: (seed >>> 0 || 1), rf: (((seed >>> 0) ^ 0x5bd1e995) & 0x7fffffff) || 7, day: 1, minute: SC.DAY_START, phase: 'tag',
      name: SC.PLAYER.name, deadline: SC.DEADLINE,
      energy: 100, chef: 60, family: 70, schicht: 50,
      budget: T().budgetStart, debt: [], trancheWeek: -1, partsUntil: 0,
      kpi: Object.assign({}, SC.KPI.start), kpiHist: [], downMin: 0, reportDay: 0, reportWeek: -1,
      modules: SC.MODULES.map(m => newModule(m, SC.NEED)),
      stations: SC.STATIONS.map(s => ({ id: s.id, fault: null, pend: null, care: 0, again: 0 })),
      server: { up: true, crashAt: null, careUntil: 0 }, printer: { jam: false },
      excel: false, coffee: 0, lunch: false, lunchBonus: false, coffeeBlock: 0, meetings: [], visits: [], pending: null,
      uselessToday: 0, uselessMin: 0, uselessYesterday: 0, sirene: 0, testSlot: 0, itReview: 0,
      sap: { state: 'none', pk: 0, need: 4 }, fusion: false, chaosUntil: 0,
      rivals: SC.RIVALS.map(r => ({ name: r.name, prog: 0, live: false })),
      msgs: [], result: null, dayLog: [], bingo: [], eggs: {}, durchsageAt: null,
      stats: { meetings: 0, useless: 0, missed: 0, weekend: 0, overtime: 0, bugs: 0, coffee: 0, visits: 0, pyrRight: 0, pyrWrong: 0, faults: 0, repairs: 0, budgetSpent: 0, chaosDays: 0, flur: 0, bingo: 0, eggs: 0 }
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
    S.excel = false; S.coffee = 0; S.lunch = false; S.dayLog = [];
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
    // Werksdurchsage: einmal am Tag zu einer zufälligen Zeit
    S.durchsageAt = 9 * 60 + Math.floor(rngF(S) * 7 * 60);
  }

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
    if (S.sirene !== S.day && S.minute >= SIREN && S.minute < SC.LATEST) { S.sirene = S.day; say(S, 'Sirene: Schichtwechsel! In den Hallen ist bis 14:20 Übergabe.'); }
    if (!S.pending && S.visits.length && S.minute >= S.visits[0].at && !activeMeeting(S) && S.phase === 'tag') S.pending = S.visits.shift();
    S.chef = clamp(S.chef, 0, 100); S.schicht = clamp(S.schicht, 0, 100); S.family = clamp(S.family, 0, 100); S.energy = clamp(S.energy, 0, 100);
  }

  // Buzzword-Bingo: jede Werkleitungsrunde liefert ein Buzzword, fünf verschiedene = BINGO (nur Punkte)
  function bingo(S) {
    const w = pickF(S, SC.BUZZ);
    if (S.bingo.includes(w)) return;
    S.bingo.push(w);
    if (S.stats.bingo) return;
    if (S.bingo.length >= SC.BINGO_NEED) { S.stats.bingo = 1; S.bingoDay = S.day; say(S, 'BINGO! Die Werkleitung sagt »' + w + '«. Fünf Buzzwords voll. Du rufst es nicht laut. Innerlich schon. (+' + T().bingoScore + ' Punkte)'); }
    else say(S, 'Buzzword-Bingo: »' + w + '« (' + S.bingo.length + '/' + SC.BINGO_NEED + ')');
  }
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
  function onePaper(S) { const m = targets.req(S) || targets.spec(S); if (!m) return null; if (m.req < m.need.req) m.req++; else m.spec++; return m; }
  function faultyStation(S) {
    const need = S.modules.filter(m => !m.done).map(m => m.station);
    return S.stations.filter(s => s.fault).sort((a, b) => (need.includes(b.id) ? 1 : 0) - (need.includes(a.id) ? 1 : 0))[0] || null;
  }
  function fixFault(S, st) { S.downMin += Math.max(0, S.minute - st.fault.at); st.fault = null; S.stats.repairs++; }

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
          const bug = 0.34 - m.spec * 0.03 - (isDone(S, 'qs') ? 0.05 : 0) + (S.chaosUntil >= S.day ? 0.12 : 0);
          if (rng(S) < bug) { m.impl = Math.max(0, m.impl - 1); m.deployed = false; S.stats.bugs++; say(S, 'Testlauf ' + m.name + ' an der ' + stName(m.station) + ': Bug gefunden! Zurück an den Schreibtisch (Implementierung ' + m.impl + '/' + m.need.impl + ').', true); return; }
          m.test++; say(S, 'Testlauf ' + m.name + ' an der ' + stName(m.station) + ' bestanden: ' + m.test + '/' + m.need.test + '.');
        } },
      { id: 'linie', label: 'Mit der Schicht an der Produktionsstraße plaudern', cost: 20, energy: 2,
        check: () => null, run: S => { S.schicht += 4; say(S, 'Die Schicht findet es gut, dass sich »der vom MES« mal blicken lässt. Die Extrusion brummt zustimmend.'); } }
    ],
    schicht: [
      { id: 'gespraech', label: 'Mit dem Schichtleiter über die Linie reden', cost: 25, energy: 3, check: () => null,
        run: S => { S.schicht += 7; say(S, 'Der Schichtleiter: »Schön, dass du vorbeischaust. Ich lad dich gleich mal in was ein.«');
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
        run: S => { S.excel = true; say(S, 'Excel-Liste aktualisiert: 47 Spalten, 3 Farben, ein SVERWEIS, den nur du verstehst.'); } },
      { id: 'mail', label: 'Postfach aufräumen', cost: 15, energy: 1, check: () => null,
        run: S => { if (rng(S) < 0.3) { S.chef += 2; say(S, 'Eine Mail der Werkleitung rechtzeitig beantwortet. Pluspunkt.'); } else say(S, '43 Mails, davon 41 Einladungen vom Schichtleiter in CC.'); } }
    ],
    leitstand: [
      { id: 'bericht', label: 'KPI-Bericht für die Werkleitung erstellen', cost: 30, energy: 4,
        check: S => S.reportDay === S.day ? 'Heute schon berichtet.' : null,
        run: S => { S.reportDay = S.day; S.reportWeek = week(S); S.chef += 2; const ok = kpiScore(S) >= kpiPath(S);
          if (ok) S.chef += 2; say(S, 'KPI-Bericht verschickt: OEE ' + S.kpi.oee.toFixed(1) + ' %, Ausschuss ' + S.kpi.ausschuss.toFixed(1) + ' %. ' + (ok ? 'Die Werkleitung: »Das sieht ja fast nach Plan aus.« (+4)' : 'Die Werkleitung: »Und wann wird das grün?« (+2)')); } }
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
            S.energy -= 1 + S.uselessToday; S.schicht += g; S.uselessToday++; S.uselessMin += m.dur; S.stats.useless++;
            say(S, g > 0 ? '»' + m.title + '«: ' + m.dur + ' Minuten, null Ergebnisse. Aber der Schichtleiter strahlt (+' + g + ').' : '»' + m.title + '«: Null Ergebnisse, null Schichtleiter-Laune mehr. Er hat dir längst alles gesagt.');
          } else { const t = targets[m.eff](S); if (t) { t[m.eff] = Math.min(t.need[m.eff], t[m.eff] + (m.eff === 'test' ? 1 : 2)); say(S, '»' + m.title + '« hat wirklich geholfen: ' + t.name + ' kommt voran.'); } else say(S, '»' + m.title + '«: gutes Meeting, aber gerade nichts dafür offen.'); }
        } }
    ],
    kantine: [
      { id: 'coffee', label: 'Kaffee holen', cost: 10, energy: 0, check: () => null,
        run: S => { if (S.coffeeBlock === S.day) { S.minute += 15; say(S, 'Der Tesla-Kollege und der Kollege, der nichts arbeitet, blockieren die Kaffeemaschine. Diskussion: Kann ein Auto Kaffee kochen? (+15 Min.)', true); }
          S.coffee++; S.stats.coffee++; const g = S.coffee <= 3 ? 14 : 4; S.energy += g; say(S, S.coffee <= 3 ? 'Kaffee. Energie +' + g + '.' : 'Schon der ' + S.coffee + '. Kaffee. Das Herz rast, die Wirkung nicht.');
          if (S.coffee >= 7) egg(S, 'kaffee', 'Die Kaffeemaschine zeigt »Fehler 42: Benutzer zu wach«. Die Kantinenkraft hängt ein Foto von dir an die Pinnwand.'); } },
      { id: 'lunch', label: 'Mittagessen in der Werkskantine (11:30 bis 13:30)', cost: 30, energy: 0,
        check: S => S.lunch ? 'Schon gegessen.' : (S.minute < 11 * 60 + 30 || S.minute > 13 * 60 + 30) ? 'Die Ausgabe hat nur 11:30 bis 13:30 auf.' : null,
        run: S => { S.lunch = true; const b = S.lunchBonus ? 10 : 0; S.lunchBonus = false; S.energy += 25 + b; say(S, (b ? 'Nudeln nach dem Rezept des italienischen Kollegen. Die Kantinenkraft hat es tatsächlich probiert! Energie +35. ' : 'Currywurst mit Pommes, dazu Fabriklärm. Energie +25. ') + pick(S, SC.TIPS)); } }
    ],
    drucker: [
      { id: 'print', label: 'Spezifikation zur Unterschrift ausdrucken', cost: 10, energy: 1,
        check: S => S.printer.jam ? 'Papierstau! Erst beheben.' : targets.print(S) ? null : 'Nichts zu drucken (Testläufe müssen bestanden sein).',
        run: S => { const m = targets.print(S); spend(S, T().cost.toner); if (rng(S) < 0.3) { S.printer.jam = true; say(S, 'Der Drucker frisst Seite 14 von 62. Papierstau.', true); return; } m.printed = true; say(S, 'Spezifikation ' + m.name + ' gedruckt und geheftet. Ab zur Werkleitung!'); } },
      { id: 'fix', label: 'Papierstau beheben (Klappe A, B, C, D ...)', cost: 15, energy: 2,
        check: S => S.printer.jam ? null : 'Der Drucker läuft (gerade).', run: S => { S.printer.jam = false; say(S, 'Papierstau behoben. Toner an den Fingern inklusive.'); } }
    ],
    server: [
      { id: 'deploy', label: 'Stand auf die Testumgebung deployen', cost: 20, energy: 3,
        check: S => !S.server.up ? 'Server ist down. Erst neu starten.' : targets.deploy(S) ? null : 'Nichts Neues zu deployen.',
        run: S => { const m = targets.deploy(S); m.deployed = true; say(S, m.name + ' läuft auf der Testumgebung. Bereit für den Testlauf an der ' + stName(m.station) + '.'); } },
      { id: 'restart', label: 'MES-Server neu starten', cost: 30, energy: 4,
        check: S => S.server.up ? 'Der Server läuft.' : null, run: S => { S.server.up = true; say(S, 'Server wieder oben. Die Lüfter heulen zufrieden.'); } },
      { id: 'care', label: 'Server-Wartung (Logs, Updates, Platte aufräumen)', cost: 40, energy: 5,
        check: S => S.server.careUntil >= S.day + 2 ? 'Gerade erst gewartet.' : null,
        run: S => { spend(S, T().cost.care); S.server.careUntil = S.day + 3; if (S.server.crashAt !== null && rng(S) < 0.7) S.server.crashAt = null; say(S, 'Wartung erledigt. Die nächsten Tage stürzt er seltener ab.'); } }
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
      { id: 'abnahme', label: 'Abnahme mit Unterschrift einholen', cost: 30, energy: 3,
        check: S => targets.abnahme(S) ? null : (sapOpen(S) && S.modules.some(m => m.printed && !m.done) ? (S.sap.state === 'nacharbeit' ? 'Die ERP-Schnittstelle wird erst abgenommen, wenn die Stammdaten nachgearbeitet sind (Büro).' : 'Die ERP-Schnittstelle wird erst nach dem SAP-Cutover abgenommen.') : 'Keine gedruckte, getestete Spezifikation dabei.'),
        run: S => { const m = targets.abnahme(S); m.done = true; S.chef += 8; say(S, 'Abgenommen: ' + m.name + '! Unterschrift, Stempel, Händedruck.'); } }
    ],
    controlling: [
      { id: 'tranche', label: 'Wöchentliche Budget-Tranche beantragen', cost: 30, energy: 2,
        check: S => S.trancheWeek === week(S) ? 'Diese Woche schon beantragt. Formular C-18 erst wieder Montag.' : null,
        run: S => { S.trancheWeek = week(S); const k = (S.chef >= 40 ? T().tranche : T().trancheLow) + (isDone(S, 'erp') ? 5 : 0); S.budget += k; say(S, 'Die Controlling-Abteilung tippt lange auf dem Taschenrechner. Tranche: +' + k + ' k€.'); } },
      { id: 'vorschuss', label: 'Vorschuss (+25 k€ jetzt, −30 k€ in fünf Tagen)', cost: 20, energy: 1,
        check: S => S.debt.length ? 'Erst den alten Vorschuss zurückzahlen.' : null,
        run: S => { S.budget += T().vorschuss; S.debt.push({ due: S.day + 5, amt: T().rueckzahlung }); say(S, 'Vorschuss: +' + T().vorschuss + ' k€. Die Controlling-Abteilung notiert Tag ' + (S.day + 5) + ' in roter Tinte.'); } },
      { id: 'berater', label: 'Externe Berater holen (25 k€, einmal pro Woche)', cost: 30, energy: 2,
        check: S => S.beraterWeek === week(S) ? 'Die Berater kommen erst nächste Woche wieder. Mit neuen Folien.' : S.budget < T().berater ? 'Dafür reicht das Budget nicht.' : null,
        run: S => { S.beraterWeek = week(S); spend(S, T().berater); const k = rng(S) < 0.4 ? 1 : 2; for (let i = 0; i < k; i++) onePaper(S); say(S, k === 2 ? 'Die Berater liefern tatsächlich: +2 Pakete Requirements/Spezifikation. Und 80 Folien.' : 'Die Berater liefern 120 Folien und 1 Paket Spezifikation. Die Folien haben schöne Farben.', k === 1); } }
    ],
    pforte: [
      { id: 'home', label: 'Ausstempeln und Feierabend machen', cost: 0, energy: 0, check: S => S.minute < 15 * 60 ? 'Vor 15:00? Der Pförtner schaut dich nur an.' : null, run: S => { S.goHome = true; } }
    ]
  };

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
    let cost = Math.round(a.cost * slow(S));
    if (id === 'test') { if (S.testSlot === S.day) cost = Math.round(cost * 0.67); else if (eff(S) >= 70) cost = Math.round(cost * T().meet.testFactor); if (S.budget < 0) cost = Math.round(cost * 1.3); }
    if (room === 'halle' && id === 'req') { const m = targets.req(S); if (m && faulted(S, m)) cost = Math.round(cost * 1.3); }
    if (room === 'halle' && S.chaosUntil >= S.day) cost = Math.round(cost * 1.4);
    if (id === 'migrate' && S.sap.state === 'nacharbeit') cost = Math.round(cost * 1.25);
    if (room === 'buero' && (id === 'spec' || id === 'impl') && S.chaosUntil >= S.day) cost = Math.round(cost * 1.25);
    if (id === 'repair' && isDone(S, 'trace')) cost -= 15;
    if (id === 'bericht' && isDone(S, 'bde')) cost = 15;
    if (S.lunch && S.minute < 15 * 60 && cost > 20) cost = Math.round(cost * 0.9);
    S.energy -= a.energy;
    a.run(S);
    if (S._cost !== undefined) { cost = S._cost; delete S._cost; }
    advance(S, cost);
    if (S.energy <= 0) S.burnout = true;
    return { ok: true };
  }

  // Unterbrechungen (Besuche): Optionen und Auflösung
  function visitOptions(S) {
    const p = S.pending; if (!p) return [];
    switch (p.id) {
      case 'tesla': return [{ id: 'zuhoeren', label: 'Zuhören (' + (p.duo ? 25 : 15) + ' Min.)' }, { id: 'abwimmeln', label: 'Abwimmeln (5 Min.)' }];
      case 'italien': return [{ id: 'zuhoeren', label: 'Zuhören und mitessen (12 Min.)' }, { id: 'vertagen', label: '»Erzähl es mir beim Essen« (2 Min.)' }];
      case 'itchefin': return p.opts.map((l, i) => ({ id: 'a' + i, label: 'Ebene ' + l + ': ' + SC.PYR[l] })).concat([{ id: 'skip', label: 'Folie überspringen (10 Min.)' }]);
      case 'ahnungslos': return [{ id: 'erklaeren', label: 'Geduldig erklären (15 Min.)' }, { id: 'abkuerzen', label: '»Das MES ist wie Excel, nur anders.« (5 Min.)' }];
      case 'altwerk': return [{ id: 'mapping', label: 'Mapping zusammen anlegen (30 Min.)' }, { id: 'spaeter', label: 'Später (3 Min.)' }];
      case 'flur': return SC.FLUR[p.k].opts.map((o, i) => ({ id: 'f' + i, label: o.label }));
      default: return [{ id: 'ok', label: p.id === 'sap' || p.id === 'uebernahme' ? 'Na dann. An die Arbeit.' : 'Freut mich!' }];
    }
  }
  function visitText(S) {
    const p = S.pending; if (!p) return null; const VT = SC.VISIT_TEXT; const t = p.t || 0;
    const of = arr => arr[t % arr.length];
    switch (p.id) {
      case 'tesla': return { who: 'Der Tesla-Kollege' + (p.duo ? ' (mit dem Kollegen, der nichts arbeitet)' : ''), text: '»' + of(VT.tesla) + '«' + (p.duo ? ' ' + of(VT.duo) : '') };
      case 'italien': return { who: 'Der italienische Kollege', text: '»' + of(VT.italien) + '«' };
      case 'itchefin': return { who: 'Die IT-Chefin (mit der Automatisierungspyramide)', text: '»' + VT.itchefin[p.open % VT.itchefin.length] + ' ' + SC.PYRAMID_Q[p.q].q + '«', pyr: true };
      case 'ahnungslos': return { who: 'Ein Kollege ohne Ahnung', text: of(VT.ahnungslos) };
      case 'altwerk': return { who: 'Der Kollege vom Altwerk', text: of(VT.altwerk) };
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
    let min = 0;
    switch (p.id) {
      case 'tesla':
        if (opt === 'zuhoeren') { min = p.duo ? 25 : 15; S.energy += 4; S.schicht += 2; say(S, 'Du hörst zu. Du weißt jetzt alles über Reichweite im Winter. Energie +4 vom Lachen, und die Schicht erzählt es dem Schichtleiter (+2).'); }
        else { min = 5; S.energy -= 2; if (rng(S) < 0.25) { S.coffeeBlock = S.day; say(S, 'Abgewimmelt. Die beiden ziehen beleidigt in die Kaffeeküche und bleiben dort.', true); } else say(S, 'Abgewimmelt. Sie diskutieren im Flur weiter.'); }
        break;
      case 'italien':
        if (opt === 'zuhoeren') { min = 12; S.energy += 6; if (rng(S) < 0.3) { S.lunchBonus = true; say(S, 'Er schreibt dir ein Rezept auf und gibt es der Kantinenkraft. Nächstes Mittagessen +10 Energie.'); } else say(S, 'Eine wunderbare Geschichte. Und ein Espresso. Energie +6.'); }
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
      case 'flur': { const o = SC.FLUR[p.k].opts[+String(opt).slice(1)] || SC.FLUR[p.k].opts[1]; S.stats.flur++; min = o.min; S.energy += o.energy || 0; S.schicht += o.schicht || 0; say(S, o.msg, (o.energy || 0) < 0 || (o.schicht || 0) < 0); break; }
      case 'lieferant': S.partsUntil = S.day + 3; say(S, 'Ersatzteile im Lager: Reparaturen kosten drei Tage lang nur 2 k€.'); break;
      case 'azubi': { const m = onePaper(S); say(S, 'Danke, Azubi!' + (m ? ' ' + m.name + ' +1 Paket.' : '')); break; }
      case 'audit': S.chef += 3; say(S, 'Lob vom Audit: Werkleitung +3.'); break;
      case 'sap': say(S, 'SAP-Migration läuft. Stammdaten im Büro migrieren, Cutover am Freitag.'); break;
      case 'uebernahme': say(S, 'Firmenübernahme: Systemfusion Altwerk ist jetzt das sechste Modul. Go-Live Tag ' + S.deadline + '.'); break;
    }
    if (min) advance(S, min); else events(S);
    return { ok: true };
  }

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

  // Abend: Bilanz, KPIs, Budget, Rivalen, Familie, Sieg/Niederlage
  function endDay(S) {
    const R = { day: S.day, weekday: SC.WEEKDAYS[weekday(S)], lines: [], log: S.dayLog.slice() };
    if (S.pending) { S.visits.unshift(S.pending); S.pending = null; }
    events(S);
    const left = Math.max(SC.DAY_END, S.minute);
    const over = Math.max(0, Math.round(left - SC.DAY_END));
    if (!S.excel) { S.chef -= 6; R.lines.push(['bad', 'Excel-Liste nicht gepflegt: Werkleitung −6']); }
    if (over > 0) { const f = Math.round(over / 20); S.family -= f; S.stats.overtime += over; R.lines.push(['bad', 'Überstunden ' + over + ' Min.: Familie −' + f]); }
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
    // Wochenrückblick
    if (weekday(S) === 4) {
      if (S.reportWeek !== week(S)) { S.chef -= 4; R.lines.push(['bad', 'Wochenrückblick ohne KPI-Bericht: Werkleitung −4']); }
      else { const d = clamp(Math.round((kpiScore(S) - kpiPath(S)) * 20), -5, 5); S.chef += d; R.lines.push([d >= 0 ? 'good' : 'bad', 'Wochenrückblick KPI-Index ' + kpiIndex(S) + ' %: Werkleitung ' + (d >= 0 ? '+' : '') + d]); }
    }
    // Budget
    if (T().cost.daily) spend(S, T().cost.daily);
    for (const d of S.debt.slice()) if (d.due <= S.day) { spend(S, d.amt); S.debt.splice(S.debt.indexOf(d), 1); R.lines.push(['bad', 'Vorschuss zurückgezahlt: −' + d.amt + ' k€']); }
    if (S.budget < 0) { S.chef -= 2; R.lines.push(['bad', 'Budgetsperre (' + S.budget + ' k€): Werkleitung −2, Testläufe dauern länger']); }
    // Rivalen
    for (const [i, r] of S.rivals.entries()) {
      if (r.live) continue;
      const cfg = SC.RIVALS[i]; r.prog = Math.min(100, Math.round((r.prog + cfg.min + rng(S) * (cfg.max - cfg.min)) * 10) / 10);
      if (r.prog >= 100) { r.live = true; S.chef -= 8; R.lines.push(['bad', r.name + ' ist live gegangen! Werkleitung −8']); }
    }
    const me = progress(S);
    const best = Math.max(...S.rivals.map(r => r.prog));
    if (me >= best) { S.chef += 2; R.lines.push(['good', 'Du führst im Werksvergleich: Werkleitung +2']); }
    else if (me < best - 12) { S.chef -= 3; R.lines.push(['bad', 'Deutlich hinter ' + S.rivals.find(r => r.prog === best).name + ': Werkleitung −3']); }
    if (S.modules.some(m => m.deployed && !m.done) && rng(S) < 0.22) { S.energy -= 10; S.family -= 3; R.lines.push(['bad', '23:40 Anruf aus der Nachtschicht: »Das neue MES-Dings zeigt Rot.« Energie −10, Familie −3']); }
    if (S.chaosUntil >= S.day) { S.stats.chaosDays++; R.lines.push(['bad', 'SAP-Chaos: Niemand findet seine Materialnummer.']); }
    // Das Chaos hört erst auf, wenn die Stammdaten nachgearbeitet sind
    if (S.sap.state === 'nacharbeit' && S.chaosUntil <= S.day) { S.chaosUntil = S.day + 1; R.lines.push(['bad', 'SAP-Chaos geht weiter, bis die Stammdaten nachgearbeitet sind.']); }
    if (S.bingoDay === S.day) R.lines.push(['info', 'Buzzword-Bingo gewonnen: ' + S.bingo.slice(0, SC.BINGO_NEED).join(', ') + ' (+' + T().bingoScore + ' Punkte)']);
    R.lines.push(['info', 'Werkszeitung: ' + pickF(S, SC.SCHLAGZEILEN)]);
    S.schicht -= 3;
    if (S.schicht < 20) { S.chef -= 3; R.lines.push(['bad', 'Der Schichtleiter hat sich bei der Werkleitung über dich beschwert: Werkleitung −3']); }
    const rest = 55 - Math.round(over / 6);
    S.energy = clamp(S.energy + rest, 15, 100);
    let fri = weekday(S) === 4;
    if (S.burnout) { S.burnout = false; S.chef -= 8; S.family -= 4; S.energy = 70; R.lines.push(['bad', 'Am Schreibtisch eingeschlafen, Kopf auf der Tastatur. Ein Tag krank: Werkleitung −8.']); S.day++; if (weekday(S) === 4) fri = true; }
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
    else if (S.day >= S.deadline) S.result = { win: false, why: 'Go-Live-Termin verpasst. Das Projekt wird »neu aufgesetzt«, mit einem neuen Kick-off zum Kick-off.' };
    if (S.result) { S.result.score = score(S); S.phase = 'ende'; }
  }
  function score(S) {
    return Math.max(0, Math.round(progress(S) * 10 + (S.result && S.result.win ? (S.deadline - S.day) * 150 + 1000 : 0) + S.family * 5 + S.chef * 5 + kpiIndex(S) * 5 + Math.max(0, S.budget) / 2 + (S.stats.bingo ? T().bingoScore : 0) + S.stats.eggs * 25));
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
      S.family -= 13; S.energy -= 12; S.chef += 3;
    }
    if (shifts === 0) { S.family += 8; S.energy = 100; out.push('Wochenende frei: Familie +8, voll erholt.'); }
    else out.push('Wochenendschicht (' + shifts + (shifts > 1 ? ' Tage' : ' Tag') + '): viel geschafft, Familie −' + 13 * shifts + ', Werkleitung +' + 3 * shifts + ', Budget −' + T().cost.weekend * shifts + ' k€ (Zuschläge).');
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
  function load() { try { const s = JSON.parse(localStorage.getItem(SAVE)); return s && s.v === SC.VERSION ? s : null; } catch (e) { return null; } }
  // Highscore (lokal, Top 5) wie bei Mad TV
  function addScore(S) {
    try { const k = 'mesmarathon-highscore'; const L = JSON.parse(localStorage.getItem(k) || '[]'); L.push({ score: S.result.score, win: S.result.win, day: S.day }); L.sort((a, b) => b.score - a.score); localStorage.setItem(k, JSON.stringify(L.slice(0, 5))); return L.slice(0, 5); } catch (e) { return []; }
  }
  function highscores() { try { return JSON.parse(localStorage.getItem('mesmarathon-highscore') || '[]'); } catch (e) { return []; } }

  SC.sim = { newGame, act, advance, events, endDay, weekend, startDay, progress, nextMeeting, activeMeeting, actions: A, targets, hm, weekday, week, save, load, slow,
    choose, visitOptions, visitText, rngF, kpiScore, kpiIndex, kpiPath, kpiTarget, autoWork, addScore, highscores, stationOf, stName, rng };
})(window.SC);

// MES-Marathon: Spiellogik ohne Grafik (läuft auch in Node für Tests und Balance-Bot)
'use strict';
(function (SC) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rng(S) { S.rs = (S.rs * 1103515245 + 12345) & 0x7fffffff; return S.rs / 0x7fffffff; }
  const ri = (S, a, b) => a + Math.floor(rng(S) * (b - a + 1));
  const pick = (S, arr) => arr[Math.floor(rng(S) * arr.length)];
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');

  function newGame(seed, name) {
    const S = {
      v: SC.VERSION, seed: seed >>> 0 || 1, rs: (seed >>> 0 || 1), day: 1, minute: SC.DAY_START, phase: 'tag',
      name: name || SC.PLAYER.name,
      energy: 100, chef: 60, family: 70, kalle: 50,
      modules: SC.MODULES.map(m => ({ id: m.id, name: m.name, req: 0, spec: 0, impl: 0, deployed: false, test: 0, printed: false, done: false })),
      server: { up: true, crashAt: null, careUntil: 0 }, printer: { jam: false },
      excel: false, coffee: 0, lunch: false, meetings: [], rivals: SC.RIVALS.map(r => ({ name: r.name, plant: r.plant, prog: 0, live: false })),
      log: [], msgs: [], result: null, stats: { meetings: 0, useless: 0, missed: 0, weekend: 0, overtime: 0, bugs: 0, coffee: 0 },
      dayLog: []
    };
    planDay(S);
    return S;
  }
  const weekday = S => (S.day - 1) % 5;
  function say(S, t, bad) { S.msgs.push({ t, bad: !!bad }); S.dayLog.push((bad ? '✗ ' : '• ') + hm(S.minute) + ' ' + t); }

  function planDay(S) {
    S.excel = false; S.coffee = 0; S.lunch = false; S.dayLog = [];
    const M = [{ start: 9 * 60, dur: 15, kind: 'chef', title: 'Daily bei der Werksleitung' }];
    if (weekday(S) === 4) M.push({ start: 14 * 60, dur: 30, kind: 'chef', title: 'Wochenrückblick mit der Werksleitung' });
    if (weekday(S) === 0) M.push({ start: 10 * 60, dur: 45, kind: 'kalle', title: 'Montagsrunde Schicht (Pflicht laut Kalle)' });
    const n = 1 + (rng(S) < 0.55 ? 1 : 0) + (S.kalle > 70 && rng(S) < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) M.push({ start: ri(S, 20, 31) * 30, dur: pick(S, [30, 45, 60]), kind: 'kalle', title: pick(S, SC.USELESS) });
    if (rng(S) < 0.45) { const u = pick(S, SC.USEFUL); M.push({ start: ri(S, 20, 30) * 30, dur: 60, kind: 'useful', title: u.title, eff: u.eff }); }
    M.sort((a, b) => a.start - b.start);
    const out = [];
    for (const m of M) { const prev = out[out.length - 1]; if (prev && m.start < prev.start + prev.dur + 15) continue; if (m.start + m.dur > 16 * 60 + 30) continue; out.push(m); }
    S.meetings = out.map(m => Object.assign({ state: 'open' }, m));
    // Server-Absturz für heute auswürfeln
    const risk = S.day <= S.server.careUntil ? 0.06 : 0.22;
    S.server.crashAt = S.server.up && rng(S) < risk ? ri(S, 9 * 60, 16 * 60) : null;
  }

  // Zeit läuft (Echtzeit oder durch Aktionen). Löst Ereignisse aus.
  function advance(S, mins) {
    S.minute += mins;
    events(S);
  }
  function events(S) {
    for (const m of S.meetings) {
      if (m.state === 'open' && S.minute > m.start + 10) {
        m.state = 'missed';
        if (m.kind === 'chef') { S.chef -= 7; S.stats.missed++; say(S, 'Meeting verpasst: »' + m.title + '«. Die Werksleitung notiert sich das.', true); }
        else if (m.kind === 'kalle') { S.kalle -= 13; S.stats.missed++; say(S, 'Kalles »' + m.title + '« geschwänzt. Kalle ist beleidigt.', true); }
        else { say(S, '»' + m.title + '« fand ohne dich statt.', true); }
      }
    }
    if (S.server.up && S.server.crashAt !== null && S.minute >= S.server.crashAt) {
      S.server.up = false; S.server.crashAt = null;
      say(S, 'Alarm: Der MES-Server in Rack 4 ist abgestürzt! Deployment und Testläufe gehen erst nach Neustart.', true);
    }
    S.chef = clamp(S.chef, 0, 100); S.kalle = clamp(S.kalle, 0, 100); S.family = clamp(S.family, 0, 100); S.energy = clamp(S.energy, 0, 100);
  }

  function nextMeeting(S) { return S.meetings.find(m => m.state === 'open' && m.start + 10 >= S.minute) || null; }
  function activeMeeting(S) { return S.meetings.find(m => m.state === 'open' && S.minute >= m.start - 20 && S.minute <= m.start + 10) || null; }

  const firstMod = (S, f) => S.modules.find(m => !m.done && f(m)) || null;
  const N = SC.NEED;
  const targets = {
    req: S => firstMod(S, m => m.req < N.req),
    spec: S => firstMod(S, m => m.req >= N.req && m.spec < N.spec),
    impl: S => firstMod(S, m => m.spec >= N.spec && m.impl < N.impl),
    deploy: S => firstMod(S, m => m.impl >= N.impl && !m.deployed),
    test: S => firstMod(S, m => m.deployed && m.test < N.test),
    print: S => firstMod(S, m => m.test >= N.test && !m.printed),
    abnahme: S => firstMod(S, m => m.printed)
  };
  function slow(S) { return S.energy < 25 ? 1.5 : S.energy < 45 ? 1.2 : 1; }

  // Aktionen je Raum: { label, cost (min), check(S) -> null|Grund, run(S) }
  const A = {
    halle: [
      { id: 'req', label: 'Requirements bei Bedienern und Meistern aufnehmen', cost: 60, energy: 8,
        check: S => targets.req(S) ? null : 'Alle Requirements sind aufgenommen.',
        run: S => { const m = targets.req(S); let g = 1; if (S.kalle >= 65 && rng(S) < 0.55) g = 2; if (S.kalle < 40 && rng(S) < 0.5) { say(S, 'Kalle hat die Bediener abgezogen. Nur halbe Requirements.', true); return; } m.req = Math.min(N.req, m.req + g); say(S, 'Requirements für ' + m.name + ': ' + m.req + '/' + N.req + (g > 1 ? ' (Kalle hat extra Leute geschickt!)' : '')); } },
      { id: 'test', label: 'Testlauf an Linie 3 fahren', cost: 90, energy: 12,
        check: S => !targets.test(S) ? 'Nichts testbereit. Erst implementieren und im Serverraum deployen.' : !S.server.up ? 'Server ist down. Erst im Serverraum neu starten.' : null,
        run: S => {
          const m = targets.test(S);
          if (rng(S) < (S.kalle < 40 ? 0.8 - S.kalle / 100 : S.kalle < 60 ? 0.15 : 0)) { S.minute -= 60; say(S, 'Kalle: »Linie 3 ist heute nicht frei. Hättest halt zu meinem Meeting kommen sollen.« (30 Minuten verloren)', true); return; }
          const bug = 0.34 - m.spec * 0.03;
          if (rng(S) < bug) { m.impl = Math.max(0, m.impl - 1); m.deployed = false; S.stats.bugs++; say(S, 'Testlauf ' + m.name + ': Bug gefunden! Zurück an den Schreibtisch (Implementierung ' + m.impl + '/' + N.impl + ').', true); return; }
          m.test++; say(S, 'Testlauf ' + m.name + ' bestanden: ' + m.test + '/' + N.test + '.');
        } },
      { id: 'linie', label: 'Mit der Schicht an der Linie plaudern', cost: 20, energy: 2,
        check: () => null, run: S => { S.kalle += 4; say(S, 'Die Schicht findet es gut, dass sich »der vom MES« mal blicken lässt.'); } }
    ],
    schicht: [
      { id: 'kalle', label: 'Mit Kalle über die Linie reden', cost: 25, energy: 3, check: () => null,
        run: S => { S.kalle += 7; say(S, 'Kalle: »Schön, dass du vorbeischaust. Ich lad dich gleich mal in was ein.«');
          if (rng(S) < 0.6) { const st = Math.ceil((S.minute + 60) / 30) * 30; if (st + 45 <= 16 * 60 + 30 && !S.meetings.some(x => x.state === 'open' && Math.abs(x.start - st) < 60)) { S.meetings.push({ start: st, dur: 45, kind: 'kalle', title: pick(S, SC.USELESS), state: 'open' }); S.meetings.sort((a, b) => a.start - b.start); say(S, 'Neue Einladung von Kalle: ' + hm(st) + ' im Besprechungsraum.'); } } } },
      { id: 'schichtplan', label: 'Schichtplan für Testläufe abstimmen', cost: 30, energy: 4, check: S => S.kalle >= 40 ? null : 'Kalle ist gerade nicht gut auf dich zu sprechen.',
        run: S => { S.kalle += 3; S.testSlot = S.day; say(S, 'Kalle reserviert dir heute die Linie. Testläufe gehen schneller.'); } }
    ],
    buero: [
      { id: 'spec', label: 'Spezifikation schreiben', cost: 60, energy: 9,
        check: S => targets.spec(S) ? null : 'Keine Spezifikation offen (erst Requirements in der Halle aufnehmen).',
        run: S => { const m = targets.spec(S); m.spec++; say(S, 'Spezifikation ' + m.name + ': ' + m.spec + '/' + N.spec + '.'); } },
      { id: 'impl', label: 'Implementieren', cost: 90, energy: 12,
        check: S => targets.impl(S) ? null : 'Nichts zu implementieren (erst Spezifikation fertig schreiben).',
        run: S => { const m = targets.impl(S); m.impl++; say(S, 'Implementierung ' + m.name + ': ' + m.impl + '/' + N.impl + '.'); } },
      { id: 'excel', label: 'Excel-Liste für die Werksleitung pflegen', cost: 20, energy: 3,
        check: S => S.excel ? 'Heute schon gepflegt.' : null,
        run: S => { S.excel = true; say(S, 'Excel-Liste aktualisiert: 47 Spalten, 3 Farben, ein SVERWEIS, den nur du verstehst.'); } },
      { id: 'mail', label: 'Postfach aufräumen', cost: 15, energy: 1, check: () => null,
        run: S => { if (rng(S) < 0.3) { S.chef += 2; say(S, 'Eine Mail der Werksleitung rechtzeitig beantwortet. Pluspunkt.'); } else say(S, '43 Mails, davon 41 Kalle-Einladungen in CC.'); } }
    ],
    drucker: [
      { id: 'print', label: 'Spezifikation zur Unterschrift ausdrucken', cost: 10, energy: 1,
        check: S => S.printer.jam ? 'Papierstau! Erst beheben.' : targets.print(S) ? null : 'Nichts zu drucken (Testläufe müssen bestanden sein).',
        run: S => { const m = targets.print(S); if (rng(S) < 0.3) { S.printer.jam = true; say(S, 'Der Drucker frisst Seite 14 von 62. Papierstau.', true); return; } m.printed = true; say(S, 'Spezifikation ' + m.name + ' gedruckt und geheftet. Ab zur Werksleitung!'); } },
      { id: 'fix', label: 'Papierstau beheben (Klappe A, B, C, D ...)', cost: 15, energy: 2,
        check: S => S.printer.jam ? null : 'Der Drucker läuft (gerade).', run: S => { S.printer.jam = false; say(S, 'Papierstau behoben. Toner an den Fingern inklusive.'); } }
    ],
    server: [
      { id: 'deploy', label: 'Stand auf die Testumgebung deployen', cost: 20, energy: 3,
        check: S => !S.server.up ? 'Server ist down. Erst neu starten.' : targets.deploy(S) ? null : 'Nichts Neues zu deployen.',
        run: S => { const m = targets.deploy(S); m.deployed = true; say(S, m.name + ' läuft auf der Testumgebung. Bereit für den Testlauf in der Halle.'); } },
      { id: 'restart', label: 'MES-Server neu starten', cost: 30, energy: 4,
        check: S => S.server.up ? 'Der Server läuft.' : null, run: S => { S.server.up = true; say(S, 'Server wieder oben. Die Lüfter heulen zufrieden.'); } },
      { id: 'care', label: 'Server-Wartung (Logs, Updates, Platte aufräumen)', cost: 40, energy: 5,
        check: S => S.server.careUntil >= S.day + 2 ? 'Gerade erst gewartet.' : null,
        run: S => { S.server.careUntil = S.day + 3; if (S.server.crashAt !== null && rng(S) < 0.7) S.server.crashAt = null; say(S, 'Wartung erledigt. Die nächsten Tage stürzt er seltener ab.'); } }
    ],
    meeting: [
      { id: 'attend', label: 'Am Meeting teilnehmen', cost: 0, energy: 0,
        check: S => activeMeeting(S) ? null : 'Gerade kein Meeting. Termine siehst du oben im Kalender.',
        run: S => {
          const m = activeMeeting(S); S.minute = Math.max(S.minute, m.start); m.state = 'done'; S.stats.meetings++;
          S.minute += m.dur; S.energy -= Math.round(m.dur / 10);
          if (m.kind === 'chef') { S.chef += 3; say(S, '»' + m.title + '« besucht. Die Werksleitung nickt dir zu.'); }
          else if (m.kind === 'kalle') { S.kalle += 8; S.stats.useless++; say(S, '»' + m.title + '«: ' + m.dur + ' Minuten, null Ergebnisse. Aber Kalle strahlt.'); }
          else { const t = targets[m.eff](S); if (t) { t[m.eff] = Math.min(N[m.eff], t[m.eff] + (m.eff === 'test' ? 1 : 2)); say(S, '»' + m.title + '« hat wirklich geholfen: ' + t.name + ' kommt voran.'); } else say(S, '»' + m.title + '«: gutes Meeting, aber gerade nichts dafür offen.'); }
        } }
    ],
    kantine: [
      { id: 'coffee', label: 'Kaffee holen', cost: 10, energy: 0, check: () => null,
        run: S => { S.coffee++; S.stats.coffee++; const g = S.coffee <= 3 ? 14 : 4; S.energy += g; say(S, S.coffee <= 3 ? 'Kaffee. Energie +' + g + '.' : 'Schon der ' + S.coffee + '. Kaffee. Das Herz rast, die Wirkung nicht.'); } },
      { id: 'lunch', label: 'Mittagessen (11:30 bis 13:30)', cost: 30, energy: 0,
        check: S => S.lunch ? 'Schon gegessen.' : (S.minute < 11 * 60 + 30 || S.minute > 13 * 60 + 30) ? 'Die Ausgabe hat nur 11:30 bis 13:30 auf.' : null,
        run: S => { S.lunch = true; S.energy += 25; say(S, 'Currywurst mit Pommes. Energie +25. ' + pick(S, SC.TIPS)); } }
    ],
    chef: [
      { id: 'report', label: 'Status berichten', cost: 20, energy: 2, check: S => S.reported === S.day ? 'Heute schon berichtet.' : null,
        run: S => { S.reported = S.day; if (S.excel) { S.chef += 5; say(S, 'Dr. Stahl: »Die Excel-Liste ist aktuell. So mag ich das.«'); } else { S.chef -= 3; say(S, 'Dr. Stahl: »Und wo steht das in der Excel-Liste?«', true); } } },
      { id: 'abnahme', label: 'Abnahme mit Unterschrift einholen', cost: 30, energy: 3,
        check: S => targets.abnahme(S) ? null : 'Keine gedruckte, getestete Spezifikation dabei.',
        run: S => { const m = targets.abnahme(S); m.done = true; S.chef += 8; say(S, 'Abgenommen: ' + m.name + '! Unterschrift, Stempel, Händedruck.'); } }
    ],
    pforte: [
      { id: 'home', label: 'Feierabend machen', cost: 0, energy: 0, check: S => S.minute < 15 * 60 ? 'Vor 15:00? Günther schaut dich nur an.' : null, run: S => { S.goHome = true; } }
    ]
  };

  function act(S, room, id) {
    if (S.phase !== 'tag') return { ok: false, why: 'Kein Arbeitstag.' };
    const a = (A[room] || []).find(x => x.id === id);
    if (!a) return { ok: false, why: 'Unbekannt.' };
    const why = a.check(S); if (why) return { ok: false, why };
    let cost = Math.round(a.cost * slow(S));
    if (id === 'test' && (S.testSlot === S.day || S.kalle >= 70)) cost = Math.round(cost * 0.67);
    if (S.lunch && S.minute < 15 * 60 && cost > 20) cost = Math.round(cost * 0.9);
    S.energy -= a.energy;
    a.run(S);
    advance(S, cost);
    if (S.energy <= 0) { S.burnout = true; }
    return { ok: true };
  }
  function progress(S) {
    const per = N.req + N.spec + N.impl + 1 + N.test + 1 + 1;
    let p = 0;
    for (const m of S.modules) p += m.done ? per : (m.req + m.spec + m.impl + (m.deployed ? 1 : 0) + m.test + (m.printed ? 1 : 0));
    return Math.round(p / (per * S.modules.length) * 100);
  }

  // Abend: Bilanz, Rivalen, Familie, Sieg/Niederlage. Gibt Bericht zurück.
  function endDay(S) {
    const R = { day: S.day, weekday: SC.WEEKDAYS[weekday(S)], lines: [], log: S.dayLog.slice() };
    events(S);
    const left = Math.max(SC.DAY_END, S.minute);
    const over = Math.max(0, Math.round(left - SC.DAY_END));
    if (!S.excel) { S.chef -= 6; R.lines.push(['bad', 'Excel-Liste nicht gepflegt: Werksleitung −6']); }
    if (over > 0) { const f = Math.round(over / 12); S.family -= f; S.stats.overtime += over; R.lines.push(['bad', 'Überstunden ' + over + ' Min.: Familie −' + f]); }
    else { S.family += 4; R.lines.push(['good', 'Pünktlich daheim: Familie +4']); }
    for (const [i, r] of S.rivals.entries()) {
      if (r.live) continue;
      const cfg = SC.RIVALS[i]; r.prog = Math.min(100, Math.round((r.prog + cfg.min + rng(S) * (cfg.max - cfg.min)) * 10) / 10);
      if (r.prog >= 100) { r.live = true; S.chef -= 8; R.lines.push(['bad', r.name + ' (' + r.plant + ') ist live gegangen! Werksleitung −8']); }
    }
    const me = progress(S);
    const best = Math.max(...S.rivals.map(r => r.prog));
    if (me >= best) { S.chef += 2; R.lines.push(['good', 'Du führst im Werksvergleich: Werksleitung +2']); }
    else if (me < best - 12) { S.chef -= 3; R.lines.push(['bad', 'Deutlich hinter ' + S.rivals.find(r => r.prog === best).name + ': Werksleitung −3']); }
    if (S.modules.some(m => m.deployed && !m.done) && rng(S) < 0.22) { S.energy -= 10; S.family -= 3; R.lines.push(['bad', '23:40 Anruf aus der Nachtschicht: »Das neue MES-Dings zeigt Rot.« Energie −10, Familie −3']); }
    S.kalle -= 3; // Kalle vergisst schnell
    if (S.kalle < 20) { S.chef -= 3; R.lines.push(['bad', 'Kalle hat sich bei der Werksleitung über dich beschwert: Werksleitung −3']); }
    // Erholung
    const rest = 55 - Math.round(over / 6);
    S.energy = clamp(S.energy + rest, 15, 100);
    if (S.burnout) { S.burnout = false; S.chef -= 8; S.family -= 4; S.energy = 70; R.lines.push(['bad', 'Zusammengeklappt am Schreibtisch. Ein Tag krank: Werksleitung −8.']); S.day++; }
    S.chef = clamp(S.chef, 0, 100); S.family = clamp(S.family, 0, 100); S.kalle = clamp(S.kalle, 0, 100);
    R.progress = me; R.rivals = S.rivals.map(r => ({ name: r.name, plant: r.plant, prog: r.prog }));
    R.friday = weekday(S) === 4;
    // Ende?
    if (S.modules.every(m => m.done)) S.result = { win: true, why: 'Alle fünf Module sind abgenommen. Das MES geht in ' + SC.PLANT + ' live!' };
    else if (S.chef <= 0) S.result = { win: false, why: 'Die Werksleitung zieht dich vom Projekt ab. Ralf übernimmt.' };
    else if (S.family <= 0) S.result = { win: false, why: 'Zuhause hängt der Haussegen schief. Du kündigst und wirst Imker.' };
    else if (S.day >= SC.DEADLINE) S.result = { win: false, why: 'Go-Live-Termin verpasst. Das Projekt wird »neu aufgesetzt«, ohne dich.' };
    if (S.result) { S.result.score = score(S); S.phase = 'ende'; }
    else S.phase = R.friday ? 'wochenende' : 'abend';
    S.lastReport = R;
    return R;
  }
  function score(S) {
    return Math.max(0, Math.round(progress(S) * 10 + (S.result && S.result.win ? (SC.DEADLINE - S.day) * 150 + 1000 : 0) + S.family * 5 + S.chef * 5));
  }
  // Wochenendschicht: shifts = 0, 1 oder 2 Tage
  function weekend(S, shifts) {
    const out = [];
    for (let d = 0; d < shifts; d++) {
      S.stats.weekend++;
      let work = 4;
      while (work > 0) {
        const r = targets.req(S), sp = targets.spec(S), im = targets.impl(S), te = targets.test(S), dp = targets.deploy(S);
        if (te) { te.test++; } else if (dp) { dp.deployed = true; } else if (im) { im.impl++; } else if (sp) { sp.spec++; } else if (r) { r.req++; } else break;
        work--;
      }
      S.family -= 13; S.energy -= 12; S.chef += 3;
    }
    if (shifts === 0) { S.family += 8; S.energy = 100; out.push('Wochenende frei: Familie +8, voll erholt.'); }
    else out.push('Wochenendschicht (' + shifts + (shifts > 1 ? ' Tage' : ' Tag') + '): viel geschafft, Familie −' + 13 * shifts + ', Werksleitung +' + 3 * shifts + '.');
    S.chef = clamp(S.chef, 0, 100); S.family = clamp(S.family, 0, 100); S.energy = clamp(S.energy, 15, 100);
    if (S.family <= 0) { S.result = { win: false, why: 'Zuhause hängt der Haussegen schief. Du kündigst und wirst Imker.' }; S.result.score = score(S); S.phase = 'ende'; }
    return out;
  }
  function startDay(S) {
    if (S.phase === 'ende') return;
    S.day++; S.minute = SC.DAY_START; S.phase = 'tag'; S.goHome = false; S.msgs = [];
    if (S.printer.jam && rng(S) < 0.5) S.printer.jam = false;
    planDay(S);
  }
  function save(S) { try { localStorage.setItem('mesmarathon-save', JSON.stringify(S)); } catch (e) { /* */ } }
  function load() { try { const s = JSON.parse(localStorage.getItem('mesmarathon-save')); return s && s.v === SC.VERSION ? s : null; } catch (e) { return null; } }

  SC.sim = { newGame, act, advance, events, endDay, weekend, startDay, progress, nextMeeting, activeMeeting, actions: A, targets, hm, weekday, save, load, slow };
})(window.SC);

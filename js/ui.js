// MES-Marathon: Oberfläche (HUD, Räume, Overlays)
'use strict';
(function (SC) {
  const $ = id => document.getElementById(id);
  const S = () => SC.S, sim = () => SC.sim, hm = m => SC.sim.hm(m);
  const aud = (fn, ...a) => { try { if (SC.audio && typeof SC.audio[fn] === 'function') SC.audio[fn](...a); } catch (e) { /* Ton darf nie stören */ } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bar = (v, cls) => '<span class="moodbar ' + (cls || '') + '"><span style="width:' + Math.max(0, Math.min(100, v)) + '%"></span></span>';
  const UI = SC.ui = { paused: false, speed: 1, room: null, _ov: false };
  let shown = 0;

  UI.overlayOpen = () => UI._ov;
  function overlay(html) { $('overlay').innerHTML = '<div class="box">' + html + '</div>'; $('overlay').classList.remove('hidden'); UI._ov = true; }
  function closeOverlay() { $('overlay').classList.add('hidden'); UI._ov = false; }
  UI.toast = function (t, bad) { const el = $('ticker'); el.innerHTML = '<span class="' + (bad ? 'bad' : '') + '">' + esc(t) + '</span>'; };

  function flushMsgs() {
    const s = S(); if (!s) return;
    while (shown < s.msgs.length) { const m = s.msgs[shown++]; UI.toast(m.t, m.bad); if (m.bad) aud('jingle', 'spotFail'); }
  }

  UI.hud = function () {
    const s = S(); if (!s) return;
    flushMsgs();
    $('hud-day').textContent = 'Tag ' + s.day + '/' + s.deadline + ' · ' + SC.WEEKDAYS[sim().weekday(s)].slice(0, 2);
    $('hud-clock').textContent = hm(s.minute);
    $('hud-clock').className = 'hud-item' + (s.minute >= SC.DAY_END ? ' late' : '');
    $('hud-energy').innerHTML = '⚡ ' + bar(s.energy);
    $('hud-chef').innerHTML = 'Werkleitung ' + bar(s.chef);
    $('hud-family').innerHTML = 'Familie ' + bar(s.family, 'heartbar');
    $('hud-schicht').innerHTML = 'Schichtleiter ' + bar(s.schicht);
    $('hud-budget').innerHTML = 'Budget <span class="' + (s.budget < 0 ? 'bad' : s.budget < 20 ? 'warn' : 'good') + '">' + Math.round(s.budget) + ' k€</span>';
    $('hud-kpi').textContent = 'KPI ' + sim().kpiIndex(s) + ' %';
    $('hud-prog').textContent = 'MES ' + sim().progress(s) + ' %';
    if (s.pending && !UI._ov) showVisit();
    if (s.sirene === s.day && UI._siren !== s.day) { UI._siren = s.day; aud('jingle', 'siren'); }
    const nm = sim().nextMeeting(s), act = sim().activeMeeting(s);
    $('calendar').innerHTML = (act ? '<b class="blink">JETZT ' + hm(act.start) + ' ' + esc(act.title) + ' → MEETING (2. OG)</b>' : nm ? 'Nächster Termin: <b>' + hm(nm.start) + '</b> ' + esc(nm.title) + ' <span class="dim">(' + nm.dur + ' Min.)</span>' : '<span class="dim">Keine Termine mehr heute.</span>') +
      ' · Server: ' + (s.server.up ? '<span class="good">läuft</span>' : '<span class="bad">DOWN</span>') + (s.printer.jam ? ' · <span class="bad">Drucker: Papierstau</span>' : '') +
      (s.stations.some(x => x.fault) ? ' · <span class="bad">Störung: ' + s.stations.filter(x => x.fault).map(x => sim().stName(x.id)).join(', ') + '</span>' : '') +
      (s.sap.state === 'migration' || s.sap.state === 'nacharbeit' ? ' · <span class="warn">SAP-' + (s.sap.state === 'nacharbeit' ? 'Nacharbeit ' : 'Migration ') + s.sap.pk + '/' + s.sap.need + '</span>' : '') + (s.chaosUntil >= s.day ? ' · <span class="bad">SAP-Chaos</span>' : '') + (s.excel ? '' : ' · <span class="bad">Excel-Liste offen</span>') + (s.tiramisu === s.day ? ' · <span class="good">Tiramisu: nächster Testlauf −15 % Fehlerrisiko</span>' : s.itStreak > 0 ? ' · <span class="dim">Tiramisu ' + s.itStreak + '/3</span>' : '') + (s.kaffeeDef === s.day ? ' · <span class="bad">Kaffeeautomat defekt</span>' : '') + (s.nordUntil >= s.day ? ' · <span class="bad">Bediener fehlt (Werk Nord)</span>' : '') + (s.zusage ? ' · <span class="warn">Zusage bis Tag ' + s.zusage.until + '</span>' : '');
    if (UI.room && UI._lastMin !== Math.floor(s.minute / 5)) { UI._lastMin = Math.floor(s.minute / 5); renderRoom(); }
  };

  UI.walkTo = function (room) {
    if (!S() || S().phase !== 'tag') return;
    if (UI.room) UI.closeRoom();
    const r = SC.ROOMS[room]; const f = SC.FLOORS[r.floor]; const d = f.doors.find(x => x.room === room);
    SC.building.goTo(r.floor, d.x, room);
  };
  UI.openRoom = function (room) {
    if (!S() || S().phase !== 'tag') { SC.building.showPlayer(); return; }
    UI.room = room; aud('jingle', 'door'); aud('zone', room); renderRoom(); $('room').classList.remove('hidden');
  };
  UI.closeRoom = function () { UI.room = null; $('room').classList.add('hidden'); aud('zone', null); SC.building.showPlayer(); if (S()) sim().save(S()); };

  function modTable(s) {
    const c = (v, n) => '<td class="' + (v >= n ? 'good' : v > 0 ? '' : 'dim') + '">' + v + '/' + n + '</td>';
    const y = b => '<td class="' + (b ? 'good' : 'dim') + '">' + (b ? '✓' : '–') + '</td>';
    return '<table class="xl"><tr><th>Modul</th><th>Req.</th><th>Spez.</th><th>Impl.</th><th>Deploy</th><th>Test</th><th>Druck</th><th>Abnahme</th></tr>' +
      s.modules.map(m => '<tr><td>' + esc(m.name) + ' <span class="dim small">(' + esc(sim().stName(m.station)) + ')</span></td>' + (m.done ? '<td colspan="7" class="good">ABGENOMMEN ✓</td>' : c(m.req, m.need.req) + c(m.spec, m.need.spec) + c(m.impl, m.need.impl) + y(m.deployed) + c(m.test, m.need.test) + y(m.printed) + y(false)) + '</tr>').join('') +
      (s.sap.state !== 'none' ? '<tr><td>SAP-Stammdaten</td><td colspan="7" class="' + (s.sap.state === 'done' ? 'good">migriert ✓' : 'warn">' + s.sap.pk + '/' + s.sap.need + ' migriert, ' + (s.sap.state === 'nacharbeit' ? 'Nacharbeit nach dem Chaos-Cutover' : 'Cutover Freitag Tag 10')) + '</td></tr>' : '') + '</table>';
  }

  function renderRoom() {
    const s = S(), room = UI.room; if (!s || !room) return;
    const R = SC.ROOMS[room], acts = sim().actions[room];
    let h = '<div class="room-head"><h2>' + esc(R.title) + '</h2><span class="dim">' + esc(R.who) + '</span><button data-a="leave">Raus (Esc)</button></div>';
    if (room === 'meeting') {
      h += '<h3>Kalender heute</h3><table>' + s.meetings.map(m => '<tr><td>' + hm(m.start) + '</td><td>' + esc(m.title) + '</td><td>' + m.dur + ' Min.</td><td>' + ({ chef: 'Werkleitung', schicht: 'Schichtleiter', useful: '<span class="good">nützlich</span>' })[m.kind] + '</td><td class="' + (m.state === 'missed' ? 'bad' : m.state === 'done' ? 'good' : '') + '">' + ({ open: 'offen', missed: 'verpasst', done: 'dabei' })[m.state] + '</td></tr>').join('') + '</table>';
    }
    if (room === 'buero' || room === 'chef') h += '<h3>' + (room === 'buero' ? 'Excel-Liste »MES_Rollout_final_v7_NEU.xlsx«' : 'Werksvergleich') + '</h3>' + (room === 'buero' ? modTable(s) : rivals(s));
    if (room === 'chef') h += '<div class="say">' + chefSays(s) + '</div>';
    if (room === 'chef') h += '<p>Image im Konzern: <b>' + Math.round(s.image) + '</b>/100 · ' + (s.zusage ? '<span class="warn">Offene Zusage: ' + s.zusage.need + ' Modul(e) bis Tag ' + s.zusage.until + ' (geschafft: ' + (s.modules.filter(m => m.done).length - s.zusage.base) + ')</span>' : '<span class="dim">Keine offene Zusage. Zusagen bringen Prämie und Image, gebrochene kosten.</span>') + '</p>';
    if (room === 'schicht') h += '<div class="say">' + schichtSays(s) + '</div>';
    if (room === 'halle') h += stationTable(s);
    if (room === 'werkstatt') h += '<div class="say">' + (s.stations.some(x => x.fault) ? 'Die Instandhaltung: »' + s.stations.filter(x => x.fault).map(x => sim().stName(x.id)).join(', ') + ' steht. Wie immer zuerst der Verpackungsautomat?«' : 'Die Instandhaltung: »Alles läuft. Das macht mich nervös.«') + (s.partsUntil >= s.day ? ' <span class="good">Ersatzteile im Lager (Reparatur 2 k€).</span>' : '') + '</div>';
    if (room === 'leitstand') h += kpiTable(s);
    if (room === 'controlling') h += '<p>Budget: <b class="' + (s.budget < 0 ? 'bad' : '') + '">' + Math.round(s.budget) + ' k€</b> · ausgegeben: ' + Math.round(s.stats.budgetSpent) + ' k€ · Tranche diese Woche: ' + (s.trancheWeek === sim().week(s) ? '<span class="good">beantragt</span>' : '<span class="warn">offen</span>') + ' · Kredit: ' + (s.kredit ? '<span class="warn">' + s.kredit + ' k€</span>' : '0 k€') + ' von ' + sim().rahmen(s) + ' k€ Rahmen (8 % Zins freitags) · Image: <b>' + Math.round(s.image) + '</b>' + '</p><p class="small dim">Unter 0 k€: Budgetsperre. Unter −40 k€ stoppt das Controlling das Projekt.</p>';
    if (room === 'it') h += pyramidHtml(null) + '<div class="say">Die IT-Chefin: »' + esc(SC.VISIT_TEXT.itchefin[s.day % SC.VISIT_TEXT.itchefin.length]) + ' Hast du gesehen? Jede Etage hier ist eine Ebene. Das hab ich durchgesetzt.«</div>';
    if (room === 'server') h += '<p>Status: ' + (s.server.up ? '<span class="good">MES-Server läuft</span>' : '<span class="bad">MES-Server DOWN</span>') + (s.server.careUntil >= s.day ? ' · <span class="good">frisch gewartet</span>' : '') + '</p>';
    h += '<h3>Was tun?</h3><div class="acts">';
    for (const a of acts) {
      const why = a.check(s); let cost = Math.round(a.cost * sim().slow(s));
      h += '<button data-a="' + a.id + '"' + (why ? ' disabled title="' + esc(why) + '"' : '') + '>' + esc(a.label) + (cost ? ' <span class="small">(' + cost + ' Min.)</span>' : '') + '</button>' + (why ? '<div class="small dim why">' + esc(why) + '</div>' : '');
    }
    h += '</div>';
    if (room === 'halle' || room === 'buero') h += '<p class="small dim">Ablauf je Modul: Requirements (Hallen, Station) → Spezifikation → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Hallen, Teststation) → Ausdruck (Drucker) → Abnahme (Werkleitung).</p>';
    $('room').innerHTML = h;
  }
  function rivals(s) {
    const me = sim().progress(s);
    const rows = [{ name: SC.PLANT + ' (Christian)', prog: me, me: true }].concat(s.rivals).sort((a, b) => b.prog - a.prog);
    return '<table>' + rows.map(r => '<tr><td>' + (r.me ? '<b>' + esc(r.name) + '</b>' : esc(r.name)) + '</td><td><span class="qbox"><span class="qbar" style="width:' + r.prog + '%"></span></span> ' + Math.round(r.prog) + ' %</td></tr>').join('') + '</table>';
  }
  function chefSays(s) {
    if (s.chef < 25) return 'Die Werkleitung: »Ich überlege ernsthaft, Werk Nord Ihr Projekt zu geben.«';
    if (!s.excel) return 'Die Werkleitung: »Ich sehe da nichts Neues in der Excel-Liste.«';
    if (s.budget < 0) return 'Die Werkleitung: »Das Controlling ruft mich jeden Tag an. Wegen Ihnen.«';
    if (s.chef > 75) return 'Die Werkleitung: »Weiter so. Der Vorstand schaut auf ' + SC.PLANT + '. Und auf die OEE.«';
    return 'Die Werkleitung: »Go-Live ist Tag ' + s.deadline + '. Das steht. Und die KPIs will ich grün sehen.«';
  }
  function schichtSays(s) {
    if (s.schicht < 30) return 'Der Schichtleiter: »Ach, DU. Die Linie ist leider voll. Die ganze Woche. Vielleicht.«';
    if (s.schicht > 75) return 'Der Schichtleiter: »Mein bester Mann! Kommst du nachher zu meiner Runde? Und zur danach?«';
    return 'Der Schichtleiter: »Ich hab da noch ein Meeting angesetzt. Ist wichtig. Glaub ich.«';
  }
  function stationTable(s) {
    const tests = id => s.modules.filter(m => m.station === id).map(m => esc(m.name)).join(', ');
    return '<h3>Stationen (Produktionsstraße 1 und 2)</h3><table><tr><th>Station</th><th>Status</th><th>Teststation für</th></tr>' + SC.STATIONS.map(d => {
      const st = sim().stationOf(s, d.id); const pack = d.id === 'inpack' || d.id === 'auspack';
      return '<tr><td>' + esc(d.name) + (pack ? ' <span class="dim small">(Verpackungsautomat)</span>' : '') + '</td><td class="' + (st.fault ? 'bad">✗ STÖRUNG' : 'good">✓ läuft') + '</td><td>' + (tests(d.id) || '<span class="dim">–</span>') + '</td></tr>';
    }).join('') + '</table>' + (s.chaosUntil >= s.day ? '<p class="bad">SAP-Chaos: Alle Hallen-Aktionen dauern länger.</p>' : '');
  }
  function spark(arr) { const c = '▁▂▃▄▅▆▇█'; if (!arr.length) return ''; const lo = Math.min(...arr), hi = Math.max(...arr); return arr.map(v => c[hi === lo ? 3 : Math.round((v - lo) / (hi - lo) * 7)]).join(''); }
  function kpiTable(s) {
    const K = SC.KPI;
    return '<h3>Kennzahlen (Ist, Ziel, Verlauf)</h3><table><tr><th>KPI</th><th>Ist</th><th>Ziel</th><th>Verlauf</th></tr>' + Object.keys(K.start).map(k => {
      const ist = s.kpi[k], ok = k === 'ausschuss' ? ist <= K.ziel[k] : ist >= K.ziel[k];
      return '<tr><td>' + K.names[k] + '</td><td class="' + (ok ? 'good' : 'bad') + '">' + ist.toFixed(1) + K.unit[k] + '</td><td>' + (k === 'ausschuss' ? '≤ ' : '≥ ') + K.ziel[k] + K.unit[k] + '</td><td class="spark">' + spark(s.kpiHist.map(h => h[k]).slice(-12)) + '</td></tr>';
    }).join('') + '</table><p>KPI-Index: <b>' + sim().kpiIndex(s) + ' %</b> · Plan heute: ' + Math.round(sim().kpiPath(s) * 100) + ' % · Bericht heute: ' + (s.reportDay === s.day ? '<span class="good">verschickt</span>' : '<span class="warn">offen</span>') + '</p><p class="small dim">Abgenommene Module verbessern die Kennzahlen (BDE vor allem die OEE). Stillstand, etwa des Verpackungsautomaten, drückt sie. Freitag fragt die Werkleitung im Wochenrückblick nach dem Bericht.</p>';
  }
  function pyramidHtml(q) {
    return '<div class="pyr">' + [4, 3, 2, 1, 0].map(l => '<div class="pl l' + l + (q && q === l ? ' hl' : '') + '" style="width:' + (40 + (4 - l) * 15) + '%">Ebene ' + l + ': ' + SC.PYR[l] + (l === 3 ? ' ← hier ist das MES' : '') + '</div>').join('') + '</div>';
  }
  function showVisit() {
    const s = S(); const vt = sim().visitText(s); if (!vt) return;
    aud('jingle', s.pending.id === 'sap' || s.pending.id === 'uebernahme' ? 'alarm' : 'visit');
    SC.building.summon && SC.building.summon(s.pending.id);
    overlay('<h2>' + esc(vt.who) + '</h2><div class="visit"><p>' + esc(vt.text) + '</p>' + (vt.pyr ? pyramidHtml(null) : '') + '</div><p class="vopts">' + sim().visitOptions(s).map(o => '<button data-v="' + o.id + '">' + esc(o.label) + '</button>').join(' ') + '</p><p class="small dim">' + hm(s.minute) + ' Uhr · Die Uhr steht, solange du entscheidest.</p>');
  }

  function doAct(id) {
    const s = S();
    if (id === 'leave') { UI.closeRoom(); return; }
    const r = sim().act(s, UI.room, id);
    if (!r.ok) { UI.toast(r.why, true); return; }
    aud('jingle', 'buy');
    if (s.goHome) { UI.closeRoom(); UI.endDay(); return; }
    if (s.minute >= SC.LATEST) { UI.closeRoom(); UI.toast('20:00: Der Pförtner schließt ab.'); UI.endDay(); return; }
    renderRoom(); UI.hud();
  }

  UI.tick = function () {
    const s = S();
    if (s.minute >= SC.DAY_END && !s._warned) { s._warned = true; UI.toast('17:00 Feierabend! Überstunden gehen bis 20:00, kosten aber Familie. Raus über die Pforte (EG).'); }
    if (s.minute >= SC.LATEST) { if (UI.room) UI.closeRoom(); UI.toast('20:00: Der Pförtner schließt ab.'); UI.endDay(); }
    if (s.burnout) { if (UI.room) UI.closeRoom(); UI.endDay(); }
  };

  UI.endDay = function () {
    const s = S(); if (s.phase !== 'tag') return;
    const R = sim().endDay(s); shown = 0; s.msgs = [];
    showEvening(s, R);
  };
  function showEvening(s, R) {
    if (!R) { s.phase = 'tag'; morning(); return; }
    aud('play', 'balance');
    let h = '<h2>Feierabend · ' + R.weekday + ', Tag ' + R.day + '</h2>' +
      '<div class="chefin"><img src="img/portrait.png" alt="" class="pt"><div><p>Projektfortschritt: <b>' + R.progress + ' %</b></p>' + rivals(s) + '</div></div>' +
      '<h3>Bilanz</h3><ul>' + R.lines.map(l => '<li class="' + l[0] + '">' + esc(l[1]) + '</li>').join('') + '</ul>' +
      '<h3>KPIs heute</h3><p class="kpis">' + R.kpi.map(x => { const ok = x.k === 'ausschuss' ? x.ist <= x.ziel : x.ist >= x.ziel; const better = x.k === 'ausschuss' ? x.d < 0 : x.d > 0; return '<span class="' + (ok ? 'good' : '') + '">' + SC.KPI.names[x.k] + ' ' + x.ist.toFixed(1) + ' <span class="' + (better ? 'good' : x.d === 0 ? 'dim' : 'bad') + '">' + (x.d > 0 ? '▲' : x.d < 0 ? '▼' : '•') + '</span> <span class="dim">(Ziel ' + x.ziel + ')</span></span>'; }).join(' · ') + '</p>' +
      '<p>Werkleitung ' + bar(s.chef) + ' · Familie ' + bar(s.family, 'heartbar') + ' · Schichtleiter ' + bar(s.schicht) + ' · Energie morgen ' + bar(s.energy) + ' · Budget <b>' + Math.round(s.budget) + ' k€</b></p>' +
      '<details><summary>Tagesprotokoll</summary><ul class="log">' + R.log.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul></details>';
    if (s.phase === 'ende') { h += endHtml(s); aud('jingle', s.result.win ? 'win' : 'lose'); h += '<p><button data-o="title">Zum Titel</button></p>'; }
    else if (s.phase === 'wochenende') h += '<h3>Wochenende! Der Schichtleiter sucht Leute für die Wochenendschicht.</h3>' + (s.sap.cutover ? '<p class="warn">SAP-Cutover steht an! Ohne Wochenendschicht gibt es drei Tage Chaos.</p>' : '') + '<p class="small">Jeder Tag Wochenendschicht bringt ca. 4 Arbeitspakete, kostet aber Familie (−13), Energie und ' + SC.TUNE.cost.weekend + ' k€ Zuschläge.</p><p><button data-o="we0">Frei nehmen</button> <button data-o="we1">Samstag arbeiten</button> <button data-o="we2">Samstag und Sonntag</button></p>';
    else h += '<p><button data-o="next">Nächster Tag</button></p>';
    sim().save(s);
    overlay(h);
  }
  function endHtml(s) {
    return '<div class="end ' + (s.result.win ? 'good' : 'bad') + '"><h2>' + (s.result.win ? 'GO-LIVE!' : 'PROJEKT GESCHEITERT') + '</h2><p>' + esc(s.result.why) + '</p><p>Punkte: <b>' + s.result.score + '</b></p>' +
      '<p class="small">KPI-Index: ' + sim().kpiIndex(s) + ' % · Budget: ' + Math.round(s.budget) + ' k€ · Besuche: ' + s.stats.visits + ' · Pyramiden-Fragen richtig: ' + s.stats.pyrRight + '/' + (s.stats.pyrRight + s.stats.pyrWrong) + ' · Störungen: ' + s.stats.faults + '</p>' + highHtml(s) +
      '<p class="small">Meetings besucht: ' + s.stats.meetings + ' (davon nutzlos: ' + s.stats.useless + ') · verpasst: ' + s.stats.missed + ' · Wochenendschichten: ' + s.stats.weekend + ' · Bugs: ' + s.stats.bugs + ' · Kaffee: ' + s.stats.coffee + ' · Überstunden: ' + s.stats.overtime + ' Min.</p></div>';
  }
  function highHtml(s) {
    if (!s._hs) { s._hs = true; s._hl = sim().addScore(s); }
    const L = s._hl || sim().highscores();
    return L.length ? '<p class="small">Bestenliste: ' + L.map((x, i) => (i + 1) + '. ' + x.score + (x.win ? ' (Go-Live Tag ' + x.day + ')' : '')).join(' · ') + '</p>' : '';
  }
  function next() { const s = S(); sim().startDay(s); s._warned = false; shown = 0; closeOverlay(); SC.building.reset(); aud('play', 'tower'); morning(); sim().save(s); }
  function morning() {
    const s = S();
    UI.toast('Guten Morgen! ' + SC.WEEKDAYS[sim().weekday(s)] + ', Tag ' + s.day + '. Erster Termin: ' + (s.meetings[0] ? hm(s.meetings[0].start) + ' ' + s.meetings[0].title : 'keiner'));
  }

  UI.newGame = function (seed) {
    SC.S = sim().newGame(seed || (Date.now() & 0x7fffffff)); shown = 0; UI._siren = 0;
    SC.building.reset(); closeOverlay(); aud('unlock'); aud('play', 'tower'); morning(); sim().save(SC.S);
  };
  UI.showTitle = function () {
    const sv = sim().load();
    overlay('<div class="title"><h1 class="logo">MES-MARATHON</h1><p class="dim">Ein Werk. Sieben Stationen. Fünf Module. Zwanzig Tage. Unendlich viele Meetings.</p>' +
      '<img src="img/portrait.png" alt="Christian" class="pt big"><p>Du bist <b>Christian</b>, ca. 40, MES-Projektleiter in ' + SC.PLANT + '. Seit Jahren führst du das MES ein. Diesmal wirklich.</p>' +
      '<p><button data-o="new">Neues Spiel</button> ' + (sv && sv.phase !== 'ende' ? '<button data-o="cont">Weiterspielen (Tag ' + sv.day + ')</button> ' : '') + '<button data-o="help">Anleitung</button></p>' +
      '<p class="small dim">Inspiriert von Mad TV (1991). Eigenes Fanprojekt, alle Figuren frei erfunden. Version ' + SC.VERSION + '</p>' + (sim().highscores().length ? '<p class="small">Bestenliste: ' + sim().highscores().map((x, i) => (i + 1) + '. ' + x.score).join(' · ') + '</p>' : '') + '</div>');
  };
  function help() {
    overlay('<h2>Anleitung</h2><p>Du bist Christian, MES-Projektleiter in ' + SC.PLANT + '. Bis Tag ' + SC.DEADLINE + ' müssen alle Module des neuen Manufacturing Execution Systems abgenommen sein. Werk Nord und Werk Süd machen dasselbe, und die Werkleitung vergleicht.</p>' +
      '<ul><li><b>Das Werk ist die Automatisierungspyramide:</b> EG Feld (Pforte, Schichtleiter, Hallen), 1 Steuerung (Werkstatt, Drucker, Kantine), 2 Leitebene (Büro, Leitstand, Meeting), 3 MES (Server, IT), 4 ERP (Werkleitung, Controlling). Die IT-Chefin fragt gern danach.</li>' +
      '<li><b>Klick auf eine Tür</b> (oder die Knöpfe unten): Christian läuft hin, Aufzug inklusive. Die Uhr läuft weiter.</li>' +
      '<li><b>Ablauf je Modul:</b> Requirements (Hallen, an der Station des Moduls) → Spezifikation → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Hallen, Teststation) → Ausdruck (Drucker) → Abnahme (Werkleitung).</li>' +
      '<li><b>Stationen:</b> DEA, DEC, EEA, Extrusion, Innenverpackung, Außenverpackung, Sterilisation. Der Verpackungsautomat fällt ständig aus. Steht eine Teststation, hilft die Werkstatt.</li>' +
      '<li><b>Meetings:</b> Die Werkleitung hasst Schwänzer. Der Schichtleiter lädt ständig zu nutzlosen Meetings ein. Eins tut ihm gut, jedes weitere bringt weniger, und ab 90 Minuten am Tag zählt die Werkleitung mit. Besser: im Schichtleiter-Büro den Schichtplan abstimmen.</li>' +
      '<li><b>Besuche:</b> Der Tesla-Kollege (oft mit dem Kollegen, der nichts arbeitet), der italienische Kollege mit Geschichten vom Essen, Kollegen ohne Ahnung und die IT-Chefin mit der Pyramide. Du entscheidest, wie viel Zeit du ihnen gibst.</li>' +
      '<li><b>KPIs</b> (OEE, Ausschuss, Durchsatz, Liefertreue) im Leitstand. Abgenommene Module verbessern sie, Stillstand drückt sie. KPI-Bericht täglich, Freitag Wochenrückblick.</li>' +
      '<li><b>Budget</b> im Controlling: Tranche einmal pro Woche, Vorschuss, Berater. Testläufe, Reparaturen, Toner und Wochenendschichten kosten. Unter −40 k€ ist Schluss.</li>' +
      '<li><b>Großereignisse:</b> Tag 6 kommt ein neues SAP (Stammdaten migrieren, Cutover Freitag). Tag 13 kauft die Firma die Konkurrenz (Systemfusion als sechstes Modul, Go-Live Tag 22).</li>' +
      '<li><b>Flurfunk (neu in 0.3):</b> Brandschutzübungen, Beamer-Kabel, Überraschungsgerichte und mehr. Die Werkleitung streut Buzzwords: fünf verschiedene sind ein Bingo (Punkte). Werksdurchsagen, die Werkszeitung am Abend und ein paar Easter Eggs.</li>' +
      '<li><b>Excel-Liste</b> jeden Tag pflegen. Server und Drucker zicken. Kaffee und Mittagessen in der Kantine geben Energie.</li>' +
      '<li><b>Feierabend</b> über die Pforte ab 15:00. Überstunden bis 20:00 kosten Familie. Sirene um 14:00: Schichtwechsel.</li>' +
      '<li>Verloren: Werkleitung oder Familie auf null, Budget unter −40 k€ oder Go-Live-Termin verpasst.</li></ul><p class="small">Tasten: Leertaste Pause, + Tempo, Esc Raum verlassen, M Ton.</p><p><button data-o="back">Zurück</button></p>');
  }

  UI.init = function () {
    $('room').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b && !b.disabled) doAct(b.dataset.a); });
    $('overlay').addEventListener('click', e => {
      const v = e.target.closest('button[data-v]');
      if (v && S() && S().pending) { sim().choose(S(), v.dataset.v); closeOverlay(); SC.building.dismiss && SC.building.dismiss(); if (UI.room) renderRoom(); UI.hud(); sim().save(S()); if (S().minute >= SC.LATEST) UI.tick(); return; }
      const b = e.target.closest('button[data-o]'); if (!b) return; const o = b.dataset.o; aud('unlock');
      if (o === 'new') UI.newGame();
      else if (o === 'cont') { SC.S = sim().load(); shown = SC.S.msgs.length; closeOverlay(); SC.building.reset(); UI._siren = SC.S.sirene; if (SC.S.phase === 'tag') { aud('play', 'tower'); morning(); } else showEvening(SC.S, SC.S.lastReport); }
      else if (o === 'help') help();
      else if (o === 'back' || o === 'title') UI.showTitle();
      else if (o === 'next') next();
      else if (o.startsWith('we')) { const out = sim().weekend(S(), +o[2]); if (S().phase === 'ende') { overlay('<h2>Wochenende</h2><p>' + esc(out.join(' ')) + '</p>' + endHtml(S()) + '<p><button data-o="title">Zum Titel</button></p>'); } else { S().day += 0; next(); UI.toast(out.join(' ')); } }
    });
    const nav = $('rooms');
    nav.innerHTML = SC.FLOORS.map((f, i) => '<span class="floor-grp"><span class="fl">' + (i === 0 ? 'EG' : i) + ' ' + f.name + '</span>' + f.doors.filter(d => d.room).map(d => '<button data-r="' + d.room + '">' + esc(SC.ROOMS[d.room].title.split(' (')[0]) + '</button>').join('') + '</span>').reverse().join('');
    nav.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) UI.walkTo(b.dataset.r); });
    const cv = $('cv');
    cv.addEventListener('mousemove', e => { const [x, y] = SC.building.toLogical(e); const p = SC.building.pick(x, y); SC.building.setHover(p); cv.style.cursor = p ? 'pointer' : 'default'; });
    cv.addEventListener('click', e => {
      if (!S() || S().phase !== 'tag') return;
      const [x, y] = SC.building.toLogical(e); const p = SC.building.pick(x, y);
      if (!p && SC.building.chimney && SC.building.chimney(x, y)) { const S0 = S(); S0.eggs.chN = (S0.eggs.chN || 0) + 1; UI.toast(SC.SCHORNSTEIN[(S0.eggs.chN - 1) % SC.SCHORNSTEIN.length]); if (S0.eggs.chN === 5 && !S0.eggs.schornstein) { S0.eggs.schornstein = S0.day; S0.stats.eggs++; UI.toast('Easter Egg! Fünfmal den Schornstein angeklickt. Die Werkleitung macht dich zum Schornsteinbeauftragten. Ehrenamtlich.'); } return; }
      if (p) { if (p.d.deco) { UI.toast(p.d.msg); SC.building.goTo(p.f, p.d.x, null); } else UI.walkTo(p.d.room); return; }
      const f = SC.building.floorAt(y); if (f !== null && x > 70 && x < 410) SC.building.goTo(f, Math.round(x), null);
    });
    $('btn-pause').onclick = () => { UI.paused = !UI.paused; $('btn-pause').textContent = UI.paused ? 'Weiter' : 'Pause'; };
    $('btn-speed').onclick = () => { UI.speed = UI.speed >= 4 ? 1 : UI.speed * 2; $('btn-speed').textContent = 'Tempo ' + UI.speed + 'x'; };
    $('btn-menu').onclick = () => { UI.paused = true; $('btn-pause').textContent = 'Weiter'; UI.showTitle(); };
    if (SC.audio) { SC.audio.init(); }
    const syncSnd = () => { $('btn-sound').textContent = SC.audio && SC.audio.isMuted() ? 'Ton aus' : 'Ton an'; };
    $('btn-sound').onclick = () => { aud('unlock'); aud('setMuted', !(SC.audio && SC.audio.isMuted())); syncSnd(); if (SC.audio && !SC.audio.isMuted()) aud('play', S() && S().phase === 'tag' ? 'tower' : 'title'); };
    $('vol').oninput = e => aud('setVolume', e.target.value / 100);
    syncSnd();
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Escape' && UI.room) UI.closeRoom();
      if (e.key === ' ') { $('btn-pause').click(); e.preventDefault(); }
      if (e.key === '+') $('btn-speed').click();
      if (e.key === 'm' || e.key === 'M') $('btn-sound').click();
    });
    aud('play', 'title');
  };
})(window.SC);

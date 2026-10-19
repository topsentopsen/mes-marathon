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
    $('hud-day').textContent = 'Tag ' + s.day + '/' + SC.DEADLINE + ' · ' + SC.WEEKDAYS[sim().weekday(s)].slice(0, 2);
    $('hud-clock').textContent = hm(s.minute);
    $('hud-clock').className = 'hud-item' + (s.minute >= SC.DAY_END ? ' late' : '');
    $('hud-energy').innerHTML = '⚡ ' + bar(s.energy);
    $('hud-chef').innerHTML = 'Chefin ' + bar(s.chef);
    $('hud-family').innerHTML = 'Familie ' + bar(s.family, 'heartbar');
    $('hud-kalle').innerHTML = 'Kalle ' + bar(s.kalle);
    $('hud-prog').textContent = 'Projekt ' + sim().progress(s) + ' %';
    const nm = sim().nextMeeting(s), act = sim().activeMeeting(s);
    $('calendar').innerHTML = (act ? '<b class="blink">JETZT ' + hm(act.start) + ' ' + esc(act.title) + ' → MEETING (2. OG)</b>' : nm ? 'Nächster Termin: <b>' + hm(nm.start) + '</b> ' + esc(nm.title) + ' <span class="dim">(' + nm.dur + ' Min.)</span>' : '<span class="dim">Keine Termine mehr heute.</span>') +
      ' · Server: ' + (s.server.up ? '<span class="good">läuft</span>' : '<span class="bad">DOWN</span>') + (s.printer.jam ? ' · <span class="bad">Drucker: Papierstau</span>' : '') + (s.excel ? '' : ' · <span class="bad">Excel-Liste offen</span>');
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
    UI.room = room; aud('jingle', 'door'); renderRoom(); $('room').classList.remove('hidden');
  };
  UI.closeRoom = function () { UI.room = null; $('room').classList.add('hidden'); SC.building.showPlayer(); if (S()) sim().save(S()); };

  function modTable(s) {
    const N = SC.NEED; const c = (v, n) => '<td class="' + (v >= n ? 'good' : v > 0 ? '' : 'dim') + '">' + v + '/' + n + '</td>';
    const y = b => '<td class="' + (b ? 'good' : 'dim') + '">' + (b ? '✓' : '–') + '</td>';
    return '<table class="xl"><tr><th>Modul</th><th>Req.</th><th>Spez.</th><th>Impl.</th><th>Deploy</th><th>Test</th><th>Druck</th><th>Abnahme</th></tr>' +
      s.modules.map(m => '<tr><td>' + esc(m.name) + '</td>' + (m.done ? '<td colspan="7" class="good">ABGENOMMEN ✓</td>' : c(m.req, N.req) + c(m.spec, N.spec) + c(m.impl, N.impl) + y(m.deployed) + c(m.test, N.test) + y(m.printed) + y(false)) + '</tr>').join('') + '</table>';
  }

  function renderRoom() {
    const s = S(), room = UI.room; if (!s || !room) return;
    const R = SC.ROOMS[room], acts = sim().actions[room];
    let h = '<div class="room-head"><h2>' + esc(R.title) + '</h2><span class="dim">' + esc(R.who) + '</span><button data-a="leave">Raus (Esc)</button></div>';
    if (room === 'meeting') {
      h += '<h3>Kalender heute</h3><table>' + s.meetings.map(m => '<tr><td>' + hm(m.start) + '</td><td>' + esc(m.title) + '</td><td>' + m.dur + ' Min.</td><td>' + ({ chef: 'Werksleitung', kalle: 'Kalle', useful: '<span class="good">nützlich</span>' })[m.kind] + '</td><td class="' + (m.state === 'missed' ? 'bad' : m.state === 'done' ? 'good' : '') + '">' + ({ open: 'offen', missed: 'verpasst', done: 'dabei' })[m.state] + '</td></tr>').join('') + '</table>';
    }
    if (room === 'buero' || room === 'chef') h += '<h3>' + (room === 'buero' ? 'Excel-Liste »MES_Rollout_final_v7_NEU.xlsx«' : 'Werksvergleich') + '</h3>' + (room === 'buero' ? modTable(s) : rivals(s));
    if (room === 'chef') h += '<div class="say">' + chefSays(s) + '</div>';
    if (room === 'schicht') h += '<div class="say">' + kalleSays(s) + '</div>';
    if (room === 'server') h += '<p>Status: ' + (s.server.up ? '<span class="good">MES-Server läuft</span>' : '<span class="bad">MES-Server DOWN</span>') + (s.server.careUntil >= s.day ? ' · <span class="good">frisch gewartet</span>' : '') + '</p>';
    h += '<h3>Was tun?</h3><div class="acts">';
    for (const a of acts) {
      const why = a.check(s); let cost = Math.round(a.cost * sim().slow(s));
      h += '<button data-a="' + a.id + '"' + (why ? ' disabled title="' + esc(why) + '"' : '') + '>' + esc(a.label) + (cost ? ' <span class="small">(' + cost + ' Min.)</span>' : '') + '</button>' + (why ? '<div class="small dim why">' + esc(why) + '</div>' : '');
    }
    h += '</div>';
    if (room === 'halle' || room === 'buero') h += '<p class="small dim">Ablauf je Modul: Requirements (Halle) → Spezifikation (Büro) → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Halle) → Ausdruck (Drucker) → Abnahme (Werksleitung).</p>';
    $('room').innerHTML = h;
  }
  function rivals(s) {
    const me = sim().progress(s);
    const rows = [{ name: s.name, plant: SC.PLANT, prog: me, me: true }].concat(s.rivals).sort((a, b) => b.prog - a.prog);
    return '<table>' + rows.map(r => '<tr><td>' + (r.me ? '<b>' + esc(r.name) + '</b>' : esc(r.name)) + '</td><td>' + esc(r.plant) + '</td><td><span class="qbox"><span class="qbar" style="width:' + r.prog + '%"></span></span> ' + Math.round(r.prog) + ' %</td></tr>').join('') + '</table>';
  }
  function chefSays(s) {
    if (s.chef < 25) return 'Dr. Stahl: »Ich überlege ernsthaft, Ralf Ihr Projekt zu geben.«';
    if (!s.excel) return 'Dr. Stahl: »Ich sehe da nichts Neues in der Excel-Liste.«';
    if (s.chef > 75) return 'Dr. Stahl: »Weiter so. Der Vorstand schaut auf ' + SC.PLANT + '.«';
    return 'Dr. Stahl: »Go-Live ist Tag ' + SC.DEADLINE + '. Das steht. Fragen?«';
  }
  function kalleSays(s) {
    if (s.kalle < 30) return 'Kalle: »Ach, DU. Die Linie ist leider voll. Die ganze Woche. Vielleicht.«';
    if (s.kalle > 75) return 'Kalle: »Mein bester Mann! Für dich mach ich die Linie frei. Kommst du nachher zu meiner Runde?«';
    return 'Kalle: »Ich hab da noch ein Meeting angesetzt. Ist wichtig. Glaub ich.«';
  }

  function doAct(id) {
    const s = S();
    if (id === 'leave') { UI.closeRoom(); return; }
    const r = sim().act(s, UI.room, id);
    if (!r.ok) { UI.toast(r.why, true); return; }
    aud('jingle', 'buy');
    if (s.goHome) { UI.closeRoom(); UI.endDay(); return; }
    if (s.minute >= SC.LATEST) { UI.closeRoom(); UI.toast('20:00 – Günther schließt ab.'); UI.endDay(); return; }
    renderRoom(); UI.hud();
  }

  UI.tick = function () {
    const s = S();
    if (s.minute >= SC.DAY_END && !s._warned) { s._warned = true; UI.toast('17:00 Feierabend! Überstunden gehen bis 20:00, kosten aber Familie. Raus über die Pforte (EG).'); }
    if (s.minute >= SC.LATEST) { if (UI.room) UI.closeRoom(); UI.toast('20:00 – Günther schließt ab.'); UI.endDay(); }
    if (s.burnout) { if (UI.room) UI.closeRoom(); UI.endDay(); }
  };

  UI.endDay = function () {
    const s = S(); if (s.phase !== 'tag') return;
    const R = sim().endDay(s); shown = 0; s.msgs = [];
    aud('play', 'balance');
    let h = '<h2>Feierabend · ' + R.weekday + ', Tag ' + R.day + '</h2>' +
      '<div class="chefin"><img src="img/portrait.png" alt="" class="pt"><div><p>Projektfortschritt: <b>' + R.progress + ' %</b></p>' + rivals(s) + '</div></div>' +
      '<h3>Bilanz</h3><ul>' + R.lines.map(l => '<li class="' + l[0] + '">' + esc(l[1]) + '</li>').join('') + '</ul>' +
      '<p>Werksleitung ' + bar(s.chef) + ' · Familie ' + bar(s.family, 'heartbar') + ' · Kalle ' + bar(s.kalle) + ' · Energie morgen ' + bar(s.energy) + '</p>' +
      '<details><summary>Tagesprotokoll</summary><ul class="log">' + R.log.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul></details>';
    if (s.phase === 'ende') { h += endHtml(s); aud('jingle', s.result.win ? 'win' : 'lose'); h += '<p><button data-o="title">Zum Titel</button></p>'; }
    else if (s.phase === 'wochenende') h += '<h3>Wochenende! Kalle sucht Leute für die Wochenendschicht.</h3><p class="small">Jeder Tag Wochenendschicht bringt ca. 4 Arbeitspakete, kostet aber Familie (−13) und Energie.</p><p><button data-o="we0">Frei nehmen</button> <button data-o="we1">Samstag arbeiten</button> <button data-o="we2">Samstag und Sonntag</button></p>';
    else h += '<p><button data-o="next">Nächster Tag</button></p>';
    sim().save(s);
    overlay(h);
  };
  function endHtml(s) {
    return '<div class="end ' + (s.result.win ? 'good' : 'bad') + '"><h2>' + (s.result.win ? 'GO-LIVE!' : 'PROJEKT GESCHEITERT') + '</h2><p>' + esc(s.result.why) + '</p><p>Punkte: <b>' + s.result.score + '</b></p>' +
      '<p class="small">Meetings besucht: ' + s.stats.meetings + ' (davon nutzlos: ' + s.stats.useless + ') · verpasst: ' + s.stats.missed + ' · Wochenendschichten: ' + s.stats.weekend + ' · Bugs: ' + s.stats.bugs + ' · Kaffee: ' + s.stats.coffee + ' · Überstunden: ' + s.stats.overtime + ' Min.</p></div>';
  }
  function next() { const s = S(); sim().startDay(s); s._warned = false; shown = 0; closeOverlay(); SC.building.reset(); aud('play', 'tower'); morning(); sim().save(s); }
  function morning() {
    const s = S();
    UI.toast('Guten Morgen! ' + SC.WEEKDAYS[sim().weekday(s)] + ', Tag ' + s.day + '. Erster Termin: ' + (s.meetings[0] ? hm(s.meetings[0].start) + ' ' + s.meetings[0].title : 'keiner'));
  }

  UI.newGame = function (seed) {
    const name = ($('pname') && $('pname').value.trim()) || SC.PLAYER.name;
    SC.S = sim().newGame(seed || (Date.now() & 0x7fffffff), name.slice(0, 16)); shown = 0;
    SC.building.reset(); closeOverlay(); aud('unlock'); aud('play', 'tower'); morning(); sim().save(SC.S);
  };
  UI.showTitle = function () {
    const sv = sim().load();
    overlay('<div class="title"><h1 class="logo">MES-MARATHON</h1><p class="dim">Ein Werk. Fünf Module. Zwanzig Tage. Unendlich viele Meetings.</p>' +
      '<img src="img/portrait.png" alt="Spielfigur" class="pt big"><p>Dein Name: <input id="pname" maxlength="16" value="' + esc(sv ? sv.name : SC.PLAYER.name) + '"></p>' +
      '<p><button data-o="new">Neues Spiel</button> ' + (sv && sv.phase !== 'ende' ? '<button data-o="cont">Weiterspielen (Tag ' + sv.day + ')</button> ' : '') + '<button data-o="help">Anleitung</button></p>' +
      '<p class="small dim">Inspiriert von Mad TV (1991). Eigenes Fanprojekt, alle Figuren frei erfunden. Version ' + SC.VERSION + '</p></div>');
  };
  function help() {
    overlay('<h2>Anleitung</h2><p>Du bist MES-Ingenieur in ' + SC.PLANT + '. Bis Tag ' + SC.DEADLINE + ' müssen alle fünf Module des neuen Manufacturing Execution Systems abgenommen sein. Ralf (Werk Nord) und Birgit (Werk Süd) machen dasselbe, und die Werksleitung vergleicht.</p>' +
      '<ul><li><b>Klick auf eine Tür</b> (oder die Knöpfe unten): Figur läuft hin, Aufzug inklusive. Die Uhr läuft dabei weiter.</li>' +
      '<li><b>Ablauf je Modul:</b> Requirements (Halle) → Spezifikation → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Halle) → Ausdruck (Drucker) → Abnahme (Werksleitung, 4. OG).</li>' +
      '<li><b>Meetings:</b> Termine stehen oben. Pünktlich im Besprechungsraum sein. Die Werksleitung hasst Schwänzer. Schichtleiter Kalle lädt ständig zu nutzlosen Meetings ein; wer fehlt, bekommt keine Linie für Testläufe.</li>' +
      '<li><b>Excel-Liste</b> jeden Tag im Büro pflegen, sonst ist die Werksleitung sauer.</li>' +
      '<li><b>Server</b> stürzt manchmal ab, <b>Drucker</b> hat Papierstau. Kaffee und Mittagessen in der Kantine geben Energie. Müde arbeitest du langsamer.</li>' +
      '<li><b>Feierabend</b> über die Pforte ab 15:00. Überstunden bis 20:00 kosten Familie. Freitags gibt es die Wochenendschicht.</li>' +
      '<li>Verloren: Werksleitung oder Familie auf null, oder Go-Live-Termin verpasst.</li></ul><p class="small">Tasten: Leertaste Pause, + Tempo, Esc Raum verlassen, M Ton.</p><p><button data-o="back">Zurück</button></p>');
  }

  UI.init = function () {
    $('room').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b && !b.disabled) doAct(b.dataset.a); });
    $('overlay').addEventListener('click', e => {
      const b = e.target.closest('button[data-o]'); if (!b) return; const o = b.dataset.o; aud('unlock');
      if (o === 'new') UI.newGame();
      else if (o === 'cont') { SC.S = sim().load(); shown = SC.S.msgs.length; closeOverlay(); SC.building.reset(); aud('play', 'tower'); if (SC.S.phase !== 'tag') { SC.S.phase = 'tag'; } morning(); }
      else if (o === 'help') help();
      else if (o === 'back' || o === 'title') UI.showTitle();
      else if (o === 'next') next();
      else if (o.startsWith('we')) { const out = sim().weekend(S(), +o[2]); if (S().phase === 'ende') { overlay('<h2>Wochenende</h2><p>' + esc(out.join(' ')) + '</p>' + endHtml(S()) + '<p><button data-o="title">Zum Titel</button></p>'); } else { S().day += 0; next(); UI.toast(out.join(' ')); } }
    });
    const nav = $('rooms');
    nav.innerHTML = Object.keys(SC.ROOMS).map(k => '<button data-r="' + k + '">' + esc(SC.ROOMS[k].title) + '</button>').join('');
    nav.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) UI.walkTo(b.dataset.r); });
    const cv = $('cv');
    cv.addEventListener('mousemove', e => { const [x, y] = SC.building.toLogical(e); const p = SC.building.pick(x, y); SC.building.setHover(p); cv.style.cursor = p ? 'pointer' : 'default'; });
    cv.addEventListener('click', e => {
      if (!S() || S().phase !== 'tag') return;
      const [x, y] = SC.building.toLogical(e); const p = SC.building.pick(x, y);
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

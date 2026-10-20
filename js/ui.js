// MES-Marathon: Oberfläche (HUD, Räume, Overlays)
'use strict';
(function (SC) {
  const $ = id => document.getElementById(id);
  const S = () => SC.S, sim = () => SC.sim, hm = m => SC.sim.hm(m);
  const aud = (fn, ...a) => { try { if (SC.audio && typeof SC.audio[fn] === 'function') SC.audio[fn](...a); } catch (e) { /* Ton darf nie stören */ } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bar = (v, cls) => '<span class="moodbar ' + (cls || '') + '"><span style="width:' + Math.max(0, Math.min(100, v)) + '%"></span></span>';
  const UI = SC.ui = { paused: false, speed: 1, room: null, _ov: false };
  // v0.9 Tempo-Stufe (gemerkt im Browser, Standard Langsam) und Schriftgröße
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; };
  UI.tempo = Math.max(0, SC.TEMPO.findIndex(t => t.id === store('mesmarathon-tempo')));
  UI.speed = SC.TEMPO[UI.tempo].f;
  UI.setTempo = function (i) { UI.tempo = Math.max(0, Math.min(SC.TEMPO.length - 1, i)); UI.speed = SC.TEMPO[UI.tempo].f; store('mesmarathon-tempo', SC.TEMPO[UI.tempo].id); const b = document.getElementById('btn-speed'); if (b) b.textContent = 'Tempo: ' + SC.TEMPO[UI.tempo].name; };
  // v0.9: Auch ein offenes Textfeld (Fokus in input oder textarea, z. B. mit Handy-Tastatur) hält die Uhr an
  UI.typing = () => { const a = document.activeElement; if (!a) return false; if (a.isContentEditable || a.tagName === 'TEXTAREA') return true; return a.tagName === 'INPUT' && !/^(range|checkbox|radio|button|submit|reset|color|file|image|hidden)$/i.test(a.type || 'text'); };
  UI.clockRuns = () => { const s = SC.S; return !!(s && s.phase === 'tag' && !UI.paused && !UI._ov && !UI.room && !UI.typing()); };
  UI.setGross = function (on) { document.body.classList.toggle('gross', !!on); store('mesmarathon-schrift', on ? 'gross' : 'normal'); const b = document.getElementById('btn-schrift'); if (b) b.textContent = on ? 'Schrift: Groß' : 'Schrift: Normal'; if (UI.room && UI.fitRoom) UI.fitRoom(); };
  let shown = 0;
  const SND_HINT = 'Ton an. Kein Ton? Stummschalter am iPhone prüfen und Lautstärke hoch.';

  UI.overlayOpen = () => UI._ov;
  // v0.9: Texte sind für Christian geschrieben, SC.fill passt sie für Sandra an (raw: Figurenwahl, dort stehen beide Namen)
  const F = h => SC.fill ? SC.fill(SC.S, h) : h;
  function overlay(html, raw) { if (!raw) html = F(html); UI._hseiten = null; UI._ovAt = performance.now(); if (!/data-o="logzu"/.test(html)) UI._log = false; $('overlay').innerHTML = '<div class="box">' + html + '</div>'; $('overlay').classList.remove('hidden'); UI._ov = true; padOverlay(); }
  // v0.10: Auf dem Handy liegt der Ton-Knopf über Dialogen; der Dialog beginnt deshalb darunter
  window.addEventListener('resize', () => { if (UI._ov) padOverlay(); });
  function padOverlay() { const o = $('overlay'), b = document.getElementById('btn-sound'); if (window.innerWidth > 640 || !b) { o.style.paddingTop = ''; return; } const r = b.getBoundingClientRect(); o.style.paddingTop = (r.bottom > 0 && r.bottom < window.innerHeight * 0.5 ? Math.round(r.bottom + 6) : 10) + 'px'; }
  function closeOverlay() { $('overlay').classList.add('hidden'); UI._ov = false; UI._ovAt = 0; }
  UI.toast = function (t, bad) { const el = $('ticker'); el.innerHTML = F('<span class="' + (bad ? 'bad' : '') + '">' + esc(t) + '</span>'); };

  // v0.8: Tipp auf den Ticker zeigt das Tagesprotokoll (das Overlay hält die Uhr an)
  UI.showLog = function () { const s = S(); if (!s || s.phase !== 'tag' || UI._ov) return; UI._log = true; overlay('<h2>Tagesprotokoll · Tag ' + s.day + '</h2>' + (s.dayLog.length ? '<ul class="log">' + s.dayLog.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' : '<p class="dim">Noch nichts passiert. Verdächtig.</p>') + '<p><button data-o="logzu">Weiter</button></p>'); };
  function flushMsgs() {
    const s = S(); if (!s) return;
    // v0.8: mehrere Meldungen in einem Takt überschreiben sich nicht mehr, die letzten zwei stehen zusammen im Ticker
    const neu = s.msgs.slice(shown); shown = s.msgs.length; if (!neu.length) return;
    const last = neu.slice(window.innerWidth < 640 ? -1 : -2); UI.toast(last.map(m => m.t).join(' · '), last.some(m => m.bad)); if (neu.some(m => m.bad)) aud('jingle', 'spotFail');
  }

  UI.hud = function () {
    const s = S(); if (!s) return;
    flushMsgs();
    $('hud-day').textContent = 'Tag ' + s.day + '/' + s.deadline + ' · ' + SC.WEEKDAYS[sim().weekday(s)].slice(0, 2);
    $('hud-clock').textContent = (s.phase === 'tag' && !UI.clockRuns() ? '⏸ ' : '') + hm(s.minute);
    $('hud-clock').title = UI.clockRuns() ? 'Die Uhr läuft' : 'Die Uhr steht (Raum, Dialog oder Pause)';
    $('hud-clock').className = 'hud-item' + (s.minute >= SC.DAY_END ? ' late' : '');
    $('hud-energy').innerHTML = '⚡ ' + bar(s.energy);
    $('hud-chef').innerHTML = 'Werkleitung ' + bar(s.chef);
    $('hud-family').innerHTML = 'Familie ' + bar(s.family, 'heartbar');
    $('hud-schicht').innerHTML = 'Schichtleiter ' + bar(s.schicht);
    $('hud-budget').innerHTML = 'Budget <span class="' + (s.budget < 0 ? 'bad' : s.budget < 20 ? 'warn' : 'good') + '">' + Math.round(s.budget) + ' k€</span>';
    $('hud-kpi').textContent = 'KPI ' + sim().kpiIndex(s) + ' %';
    $('hud-prog').textContent = 'MES ' + sim().progress(s) + ' %';
    const bf = document.getElementById('btn-figur'); if (bf) bf.textContent = '👤 ' + (s.name || 'Christian');
    if (s.pending && !UI._ov) showVisit();
    if (s.sirene === s.day && UI._siren !== s.day) { UI._siren = s.day; aud('jingle', 'siren'); }
    const nm = sim().nextMeeting(s), act = sim().activeMeeting(s);
    $('calendar').innerHTML = F(act ? '<b class="blink">JETZT ' + hm(act.start) + ' ' + esc(act.title) + ' → MEETING (2. OG)</b>' : nm ? 'Nächster Termin: <b>' + hm(nm.start) + '</b> ' + esc(nm.title) + ' <span class="dim">(' + nm.dur + ' Min.)</span>' : '<span class="dim">Keine Termine mehr heute.</span>') +
      ' · Server: ' + (s.server.up ? '<span class="good">läuft</span>' : '<span class="bad">DOWN</span>') + (s.printer.jam ? ' · <span class="bad">Drucker: Papierstau</span>' : '') +
      (s.stations.some(x => x.fault) ? ' · <span class="bad">Störung: ' + s.stations.filter(x => x.fault).map(x => sim().stName(x.id)).join(', ') + '</span>' : '') +
      (s.sap.state === 'migration' || s.sap.state === 'nacharbeit' ? ' · <span class="warn">SAP-' + (s.sap.state === 'nacharbeit' ? 'Nacharbeit ' : 'Migration ') + s.sap.pk + '/' + s.sap.need + '</span>' : '') + (s.chaosUntil >= s.day ? ' · <span class="bad">SAP-Chaos</span>' : '') + (s.excel ? '' : ' · <span class="bad">Excel-Liste offen</span>') + (s.tiramisu === s.day ? ' · <span class="good">Tiramisu: nächster Testlauf −15 % Fehlerrisiko</span>' : s.itStreak > 0 ? ' · <span class="dim">Tiramisu ' + s.itStreak + '/3</span>' : '') + (s.kaffeeDef === s.day ? ' · <span class="bad">Kaffeeautomat defekt</span>' : '') + (s.nordUntil >= s.day ? ' · <span class="bad">Bediener fehlt (Werk Nord)</span>' : '') + (s.zusage ? ' · <span class="warn">Zusage bis Tag ' + s.zusage.until + '</span>' : '') + (s.prog && s.prog.week === sim().week(s) && s.prog.k !== null ? ' · <span class="dim">Prognose: ' + ['unter', 'im', 'über'][s.prog.k] + ' Plan</span>' : '') + (sim().auktionOpen(s) ? ' · <span class="warn">Ausschreibung bis Mi 15:00' + (s.auktion.bid !== null ? ' (Gebot ' + s.auktion.bid + ' k€)' : '') + '</span>' : '') + (s.kopf === s.day ? ' · <span class="dim">🎧 Kopfhörer auf</span>' : '') + (sim().elonHeute(s) ? ' · 🚀 Elon-Zähler ' + sim().elonHeute(s) : '') + (s.day >= SC.TUNE.suess.from ? ' · <span class="' + (s.box.n <= 1 ? 'bad' : s.box.stand === 'falsch' ? 'warn' : 'dim') + '">🍬 Box ' + (s.box.n <= 1 ? (s.box.n === 1 ? 'leer (nur das letzte Stück)' : 'leer') : s.box.n + '/' + SC.TUNE.suess.stk + ' ' + SC.SORTEN[s.box.sorte]) + '</span>' : '');
    $('btn-kopf').disabled = !!sim().kopfWhy(s); $('btn-kopf').textContent = s.kopf === s.day ? '🎧 auf' : '🎧 Kopfhörer';
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
    // v0.13: Kam man per Tastatur über einen Raumknopf (die am PC im Raum verdeckt sind), springt der Fokus auf »Raus« und danach zurück
    const ae = document.activeElement; let tast = false; try { tast = !!(ae && ae.closest && ae.closest('#rooms') && ae.matches(':focus-visible')); } catch (e) { /* */ }
    UI._opener = tast ? ae : null;
    UI.room = room; document.body.classList.add('raum'); aud('jingle', 'door'); aud('zone', room); renderRoom(); $('room').classList.remove('hidden'); fitRoom();
    if (tast) { const b = $('room').querySelector('button[data-a="leave"]'); if (b) b.focus(); }
  };
  UI.closeRoom = function () { UI.room = null; document.body.classList.remove('raum'); $('room').classList.add('hidden'); aud('zone', null); SC.building.showPlayer(); if (S()) sim().save(S()); const o = UI._opener; UI._opener = null; if (o && document.contains(o)) o.focus(); };

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
    // v0.13: Kopf oben, darunter zwei Spalten (Infos links, Aktionen rechts), damit der Raum ohne Scrollen auf den Bildschirm passt
    const head = '<div class="room-head"><h2>' + esc(R.title) + '</h2><span class="dim">' + esc(R.who) + '</span><span class="dim small">⏸ Uhr steht, solange du hier bist</span><button data-a="leave">Raus (Esc)</button></div>';
    let h = '';
    if (room === 'meeting') {
      h += '<h3>Kalender heute</h3><table>' + s.meetings.map(m => '<tr><td>' + hm(m.start) + '</td><td>' + esc(m.title) + '</td><td>' + m.dur + ' Min.</td><td>' + ({ chef: 'Werkleitung', schicht: 'Schichtleiter', useful: '<span class="good">nützlich</span>' })[m.kind] + '</td><td class="' + (m.state === 'missed' ? 'bad' : m.state === 'done' ? 'good' : '') + '">' + ({ open: 'offen', missed: 'verpasst', done: 'dabei' })[m.state] + '</td></tr>').join('') + '</table>';
    }
    if (room === 'buero' && sim().auktionOpen(s)) h += '<p class="warn">Ausschreibung offen: ' + esc(SC.AUKTION[s.auktion.lot].label) + '. Gebot per Mail geht auch von hier.</p>';
    if (room === 'buero' || room === 'kantine') h += boxHtml(s, room === 'kantine');
    if (room === 'buero' || room === 'chef') h += '<h3>' + (room === 'buero' ? 'Excel-Liste »MES_Rollout_final_v7_NEU.xlsx«' : 'Werksvergleich') + '</h3>' + (room === 'buero' ? modTable(s) : rivals(s));
    if (room === 'chef') h += '<div class="say">' + chefSays(s) + '</div>';
    if (room === 'chef') h += '<p>Image im Konzern: <b>' + Math.round(s.image) + '</b>/100 · ' + (s.zusage ? '<span class="warn">Offene Zusage: ' + s.zusage.need + ' Modul(e) bis Tag ' + s.zusage.until + ' (geschafft: ' + (s.modules.filter(m => m.done).length - s.zusage.base) + ')</span>' : '<span class="dim">Keine offene Zusage. Zusagen bringen Prämie und Image, gebrochene kosten.</span>') + '</p>';
    if (room === 'schicht') h += '<div class="say">' + schichtSays(s) + '</div>';
    if (room === 'halle') h += stationTable(s);
    if (room === 'schicht') h += '<div class="say">Abreißkalender an der Wand: ' + esc(sim().kalender(s)) + '</div>';
    if (room === 'werkstatt') h += '<div class="say">' + (s.stations.some(x => x.fault) ? 'Die Instandhaltung: »' + s.stations.filter(x => x.fault).map(x => sim().stName(x.id)).join(', ') + ' steht. Wie immer zuerst der Verpackungsautomat?«' : 'Die Instandhaltung: »Alles läuft. Das macht mich nervös.«') + (s.partsUntil >= s.day ? ' <span class="good">Ersatzteile im Lager (Reparatur 2 k€).</span>' : '') + '</div>';
    if (room === 'leitstand') h += '<div class="say">Diagramm des Tages: ' + esc(sim().diagramm(s)) + '</div>';
    if (room === 'pforte') h += '<div class="say">Aushang am Werkstor: ' + esc(sim().aushang(s)) + '</div>';
    if (room === 'leitstand') h += kpiTable(s) + progHtml(s) + auditHtml(s);
    if (room === 'controlling') h += '<p>Budget: <b class="' + (s.budget < 0 ? 'bad' : '') + '">' + Math.round(s.budget) + ' k€</b> · ausgegeben: ' + Math.round(s.stats.budgetSpent) + ' k€ · Tranche diese Woche: ' + (s.trancheWeek === sim().week(s) ? '<span class="good">beantragt</span>' : '<span class="warn">offen</span>') + ' · Kredit: ' + (s.kredit ? '<span class="warn">' + s.kredit + ' k€</span>' : '0 k€') + ' von ' + sim().rahmen(s) + ' k€ Rahmen (8 % Zins freitags) · Image: <b>' + Math.round(s.image) + '</b>' + '</p><p class="small dim">Unter 0 k€: Budgetsperre. Unter −40 k€ stoppt das Controlling das Projekt.</p>' + marktHtml(s) + auktionHtml(s);
    if (room === 'it') h += pyramidHtml(null) + '<div class="say">Die IT-Chefin: »' + esc(SC.VISIT_TEXT.itchefin[s.day % SC.VISIT_TEXT.itchefin.length]) + ' Hast du gesehen? Jede Etage hier ist eine Ebene. Das hab ich durchgesetzt.«</div>';
    if (room === 'server') h += '<p>Status: ' + (s.server.up ? '<span class="good">MES-Server läuft</span>' : '<span class="bad">MES-Server DOWN</span>') + (s.server.careUntil >= s.day ? ' · <span class="good">frisch gewartet</span>' : '') + '</p>';
    let info = h; h = '<h3>Was tun?</h3><div class="acts">';
    for (const a of acts) {
      const why = a.check(s); let cost = sim().actCost(s, room, a.id); const label = typeof a.label === 'function' ? a.label(s) : a.label;
      const wait = sim().handoverWait(s, room), fertig = s.minute + wait + cost, spaet = fertig > SC.DAY_END + (s.partyMin || 0);
      // v0.11: Sandras Stärken und Schwächen sichtbar auf dem Knopf (nur Anzeige)
      const ff = s.figur === 'sandra' && cost ? sim().figF(s, a.id) : 1, roh = s.figur === 'sandra' && cost ? (SC.TUNE.figur.sandra.dauer[a.id] || 1) : 1, fv = ff < 1 ? ' <span class="small good fig">Sandra: schneller</span>' : ff > 1 ? ' <span class="small warn fig">Sandra: langsamer</span>' : roh < 1 ? ' <span class="small dim fig">Sandra: Vorsprung nur bis 17:00</span>' : '';
      h += '<div class="act"><button data-a="' + a.id + '"' + (why ? ' disabled title="' + esc(why) + '"' : '') + '>' + esc(label) + (cost ? ' <span class="small">(' + cost + ' Min.' + (wait ? ' + ' + wait + ' Wartezeit' : '') + ', fertig ' + (spaet ? '⚠ ' : '') + hm(fertig) + (spaet ? ' nach Feierabend' : '') + ')</span>' : '') + fv + '</button>' + (why ? '<div class="small dim why">' + esc(why) + '</div>' : '') + '</div>';
    }
    h += '</div>';
    if (room === 'halle' || room === 'buero') info += '<p class="small dim">Ablauf je Modul: Requirements (Hallen, Station) → Spezifikation → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Hallen, Teststation) → Ausdruck (Drucker) → Abnahme (Werkleitung).</p>';
    const fa = document.activeElement && $('room').contains(document.activeElement) && document.activeElement.dataset ? document.activeElement.dataset.a : null; // Fokus über das Neuzeichnen retten
    $('room').innerHTML = F(head + '<div class="room-cols' + (info ? '' : ' nur-acts') + '">' + (info ? '<div class="room-info">' + info + '</div>' : '') + '<div class="room-act">' + h + '</div></div>');
    // Breite Tabellen schieben auf dem Handy nur sich selbst zur Seite, nicht den ganzen Raum
    $('room').querySelectorAll('table').forEach(t => { const d = document.createElement('div'); d.className = 'tw'; t.parentNode.insertBefore(d, t); d.appendChild(t); });
    fitRoom();
    if (fa) { const nb = $('room').querySelector('button[data-a="' + fa + '"]'); if (nb && !nb.disabled) nb.focus(); }
  }
  // v0.13: Am PC soll ein Raum ohne Scrollen passen. Reicht die normale Aufteilung nicht, werden die Infos zweispaltig, danach etwas dichter gesetzt.
  const DESKTOP = '(min-width: 900px) and (min-height: 560px)';
  const VARIANTEN = ['', ' v-info2', ' v-acts', ' v-fluss', ' v-fluss v-fluss2', ' v-eng', ' v-info2 v-eng', ' v-acts v-eng', ' v-fluss v-eng', ' v-fluss v-fluss2 v-eng'], LETZTE = {};
  function fitRoom() {
    const el = $('room'), cols = el.querySelector('.room-cols'); if (!cols) return;
    const base = 'room-cols' + (cols.querySelector('.room-info') ? '' : ' nur-acts'), desk = !!(window.matchMedia && window.matchMedia(DESKTOP).matches);
    const hidden = el.classList.contains('hidden'); if (hidden) el.classList.remove('hidden');
    // zuerst die zuletzt passende Aufteilung dieses Raums, damit die Spalten zwischen zwei Aktionen nicht springen
    const last = LETZTE[UI.room], order = desk ? (last !== undefined ? [last].concat(VARIANTEN.filter(v => v !== last)) : VARIANTEN) : [''];
    let best = null;
    for (const v of order) {
      cols.className = base + v; let over = el.scrollHeight - el.clientHeight;
      if (el.scrollWidth > el.clientWidth + 1) over += 1000;
      el.querySelectorAll('.tw').forEach(t => { if (t.scrollWidth > t.clientWidth + 1) over += 1000; }); // seitlich verschobene Tabelle zählt als nicht passend
      if (!best || over < best.over) best = { v, over }; if (over <= 0) break;
    }
    cols.className = base + best.v; if (desk && best.over <= 0) LETZTE[UI.room] = best.v;
    if (hidden) el.classList.add('hidden');
  }
  UI.fitRoom = fitRoom;
  // Fenstergröße geändert: Raum neu aufteilen, Anleitung neu in Seiten teilen (gebündelt pro Bild)
  let rz = 0;
  window.addEventListener('resize', () => { if (rz) return; rz = requestAnimationFrame(() => { rz = 0; if (UI.room) fitRoom(); if (UI._ov && document.querySelector('#overlay .hilfe')) { const i = UI._hseiten ? UI._hseiten.i : 0; help(); zeigeSeite(i); } }); });

  // v0.4 Markt und Prognose
  function marktHtml(s) {
    if (!s.markt) return '';
    return '<h3>Markt heute (ein Geschäft am Tag)</h3><table>' + s.markt.offers.map(o => { const it = SC.MARKT.find(x => x.id === o.id); return '<tr><td>' + esc(it.label) + '</td><td class="' + (it.sell ? 'good">+' : '">') + o.price + ' k€</td></tr>'; }).join('') + '</table><p class="small dim">' + (s.markt.bought ? 'Heute schon gehandelt.' : 'Die Angebote wechseln jeden Tag. Alte Lizenzen im Schrank: ' + s.lizenzen + '.') + '</p>';
  }
  function progHtml(s) {
    const names = ['unter Plan', 'im Plan', 'über Plan'], wk = sim().week(s), now = names[sim().prognoseBand(s)];
    return '<h3>Planung</h3><p>' + (s.prog.week === wk && s.prog.k !== null ? 'Prognose dieser Woche: <b>' + names[s.prog.k] + '</b>. Stand heute: ' + now + '. Auswertung im Wochenrückblick am Freitag.' : 'Noch keine Prognose diese Woche (Montag oder Dienstag). Stand heute: <b>' + now + '</b>.') + (s.prog.melone === wk ? ' <span class="warn">Wassermelonen-Bericht ist raus.</span>' : '') + ' Treffer bisher: ' + s.prog.hits + '.</p><p class="small dim">Treffer: Werkleitung +' + SC.TUNE.prognose.hit + ', Image +' + SC.TUNE.prognose.hitImage + '. Zwei Stufen daneben: Werkleitung −' + SC.TUNE.prognose.miss2 + '.</p>';
  }
  // v0.5 Ausschreibung und Konzernaudit
  function auktionHtml(s) {
    const a = s.auktion, AU = SC.TUNE.auktion;
    let h = '<h3>Ausschreibung (Gebote bis Mittwoch 15:00, verdeckt gegen Werk Nord)</h3>';
    if (!a) return h + '<p class="dim">Die erste Ausschreibung hängt Dienstag aus.</p>';
    const L = SC.AUKTION[a.lot];
    h += '<table><tr><td>' + esc(L.label) + '</td><td>Richtpreis ' + L.base + ' k€</td><td>' + (a.res ? ({ win: '<span class="good">gewonnen</span>', lose: '<span class="bad">an Werk Nord</span>', none: '<span class="dim">ohne dich vergeben</span>', storno: '<span class="dim">storniert (nichts mehr offen)</span>' })[a.res] : a.bid !== null ? 'dein Gebot: <b>' + a.bid + ' k€</b>' : sim().auktionOpen(s) ? '<span class="warn">offen</span>' : '<span class="dim">Frist vorbei</span>') + '</td></tr></table>';
    return h + '<p class="small dim">Gezahlt wird nur beim Zuschlag. Gleichstand gewinnt Werk Nord, das großzügige Gebot (130 %) gewinnt immer. ' + (s.nordLastR ? 'Werk Nord bot zuletzt ' + Math.round(s.nordLastR * 100) + ' % des Richtpreises (es ändert sich von Woche zu Woche nur wenig).' : 'Wie viel Werk Nord bietet, weiß noch niemand (' + Math.round(AU.nordLo * 100) + ' bis ' + Math.round(AU.nordHi * 100) + ' % des Richtpreises, sagt der Flurfunk).') + '</p>';
  }
  // v0.5 Süßigkeitenbox
  function boxHtml(s, zettel) {
    const B = s.box, g = SC.NASCHER.find(x => x.id === B.gast);
    let h = '<h3>Süßigkeitenbox im Büro</h3><p>' + (B.n > 1 ? '🍬 ' + B.n + '/' + SC.TUNE.suess.stk + ' ' + esc(SC.SORTEN[B.sorte]) : B.n === 1 ? '<span class="warn">Nur noch das letzte Stück. Das nimmt niemand.</span>' : '<span class="warn">Leer.</span>') + (g ? ' · Stammgast heute früh: ' + esc(g.who) + ' (' + ({ gut: '<span class="good">zufrieden</span>', falsch: '<span class="warn">falsche Sorte</span>', leer: '<span class="bad">enttäuscht</span>' })[B.stand] + ')' : '') + '</p>';
    if (zettel && sim().saison()) h += '<p class="small">' + esc(SC.SAISON) + '</p>';
    if (zettel) h += '<p class="small dim">Zettel am Kiosk, wer was mag: ' + SC.NASCHER.map(x => esc(x.who.replace(/^(Der|Die) /, '')) + ': ' + SC.SORTEN[x.mag]).join(' · ') + '. Einmal pro Woche Nachschub, das letzte Stück bleibt immer liegen.</p>';
    return h;
  }
  function auditHtml(s) {
    const AD = SC.TUNE.audit, mods = s.modules.filter(m => m.done).length, k = sim().kpiIndex(s), im = Math.round(s.image);
    const miss = [k < AD.kpi ? 'KPI-Index ' + k + '/' + AD.kpi : '', im < AD.image ? 'Image ' + im + '/' + AD.image : '', mods < AD.mods ? 'Module ' + mods + '/' + AD.mods : ''].filter(Boolean);
    return '<h3>Konzernaudit »Vorzeigewerk« (zweiter Weg zum Sieg)</h3><p>Jeden Freitag ab Tag ' + AD.from + ': KPI-Index ab ' + AD.kpi + ' %, Image ab ' + AD.image + ' und mindestens ' + AD.mods + ' abgenommene Module. Dann ist das Projekt ein Erfolg, auch ohne alle Module. ' + (miss.length ? '<span class="warn">Es fehlt: ' + esc(miss.join(', ')) + '.</span>' : '<span class="good">Stand heute würde es reichen.</span>') + '</p>';
  }
  function rivals(s) {
    const me = sim().progress(s);
    const rows = [{ name: SC.PLANT + ' (' + (s.name || 'Christian') + ')', prog: me, me: true }].concat(s.rivals).sort((a, b) => b.prog - a.prog);
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
    if (s.schicht > 75) return 'Der Schichtleiter: »Auf dich ist Verlass! Kommst du nachher zu meiner Runde? Und zur danach?«';
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
    renderRoom(); UI.tick(); UI.hud();
  }

  // v0.9: wichtige Hinweise bleiben stehen, bis man »Weiter« klickt (die Uhr steht so lange)
  UI.hinweis = function (t) { const s0 = S(); if (s0 && s0.pending) { s0.msgs.push({ t, bad: false }); s0.dayLog.push('• ' + hm(s0.minute) + ' ' + t); } UI.toast(t); if (S() && S().minute < SC.LATEST && !S().burnout && !S().pending) overlay('<h2>Hinweis</h2><p class="lese">' + esc(t) + '</p><p><button data-o="weiter">Weiter</button></p>'); };
  UI.tick = function () {
    const s = S();
    if (s.minute >= SC.DAY_END && !s._warned) { s._warned = true; UI.hinweis(s.day >= 14 && !s.ev.party ? '17:00, aber erst die Party in der Kantine! Verkleidungspflicht. Die Party zählt nicht als Überstunden.' : '17:00 Feierabend! Überstunden gehen bis 20:00, kosten aber Familie' + (SC.TUNE.ueber.spaet > 1 ? ', und was du jetzt noch anfängst, dauert länger (Spätzuschlag: ×' + String(SC.TUNE.ueber.spaet).replace('.', ',') + ')' : '') + '. Raus über die Pforte (EG).'); }
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
    // v0.13: am PC zweispaltig (links Fortschritt und Bilanz, rechts KPIs und Werte, am Spielende rechts das Ergebnis), damit nichts scrollt
    const kopf = '<h2>Feierabend · ' + R.weekday + ', Tag ' + R.day + '</h2>',
      fort = '<div class="chefin">' + pimg(s.figur, 'pt') + '<div><p>Projektfortschritt: <b>' + R.progress + ' %</b></p>' + rivals(s) + '</div></div>',
      bilanz = '<h3>Bilanz</h3><ul>' + R.lines.map(l => '<li class="' + l[0] + '">' + esc(l[1]) + '</li>').join('') + '</ul>',
      kpis = '<h3>KPIs heute</h3><p class="kpis">' + R.kpi.map(x => { const ok = x.k === 'ausschuss' ? x.ist <= x.ziel : x.ist >= x.ziel; const better = x.k === 'ausschuss' ? x.d < 0 : x.d > 0; return '<span class="' + (ok ? 'good' : '') + '">' + SC.KPI.names[x.k] + ' ' + x.ist.toFixed(1) + ' <span class="' + (better ? 'good' : x.d === 0 ? 'dim' : 'bad') + '">' + (x.d > 0 ? '▲' : x.d < 0 ? '▼' : '•') + '</span> <span class="dim">(Ziel ' + x.ziel + ')</span></span>'; }).join(' · ') + '</p>',
      werte = '<p>Werkleitung ' + bar(s.chef) + ' · Familie ' + bar(s.family, 'heartbar') + ' · Schichtleiter ' + bar(s.schicht) + ' · Energie morgen ' + bar(s.energy) + ' · Budget <b>' + Math.round(s.budget) + ' k€</b></p>',
      proto = '<details><summary>Tagesprotokoll</summary><ul class="log">' + R.log.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul></details>';
    let h = kopf;
    if (s.phase === 'ende') { h += '<div class="abend mit-ende"><div class="abend-a">' + fort + bilanz + kpis + werte + proto + '</div><div class="abend-b">' + endHtml(s) + '</div></div>'; aud('jingle', s.result.win ? 'win' : 'lose'); h += '<p><button data-o="title">Zum Titel</button></p>'; }
    else if (s.phase === 'wochenende') h += '<div class="abend"><div class="abend-a">' + fort + bilanz + '</div><div class="abend-b">' + kpis + werte + proto + '<h3>Wochenende! Der Schichtleiter sucht Leute für die Wochenendschicht.</h3>' + (s.sap.cutover ? '<p class="warn">SAP-Cutover steht an! Ohne Wochenendschicht gibt es drei Tage Chaos.</p>' : '') + '<p class="small">Jeder Tag Wochenendschicht bringt bis zu 4 Arbeitspakete (beim SAP-Cutover gehen sie zuerst in die Stammdaten), kostet aber Familie (−' + SC.TUNE.weekendFam + '), Energie (−12, bei kaputtem Kaffeeautomaten −16) und ' + SC.TUNE.cost.weekend + ' k€ Zuschläge.</p><p class="small dim">' + esc(sim().wochenendGag(s)) + '</p></div></div><p><button data-o="we0">Frei nehmen</button> <button data-o="we1">Samstag arbeiten</button> <button data-o="we2">Samstag und Sonntag</button></p>';
    else h += '<div class="abend"><div class="abend-a">' + fort + bilanz + '</div><div class="abend-b">' + kpis + werte + proto + '</div></div><p><button data-o="next">Nächster Tag</button></p>';
    sim().save(s);
    overlay(h);
  }
  function endHtml(s) {
    return '<div class="end ' + (s.result.win ? 'good' : 'bad') + '"><h2>' + (s.result.win ? (s.result.pfad ? 'VORZEIGEWERK!' : s.result.titel ? 'GO-LIVE! WERK DES JAHRES!' : 'GO-LIVE!') : 'PROJEKT GESCHEITERT') + '</h2><p>' + esc(s.result.why) + '</p><p>Punkte: <b>' + s.result.score + '</b></p>' +
      '<p class="small">KPI-Index: ' + sim().kpiIndex(s) + ' % · Budget: ' + Math.round(s.budget) + ' k€ · Besuche: ' + s.stats.visits + ' · Pyramiden-Fragen richtig: ' + s.stats.pyrRight + '/' + (s.stats.pyrRight + s.stats.pyrWrong) + ' · Störungen: ' + s.stats.faults + '</p>' + highHtml(s) +
      '<p class="small">Meetings besucht: ' + s.stats.meetings + ' (davon nutzlos: ' + s.stats.useless + ') · verpasst: ' + s.stats.missed + ' · Wochenendschichten: ' + s.stats.weekend + ' · Bugs: ' + s.stats.bugs + ' · Kaffee: ' + s.stats.coffee + ' · Überstunden: ' + Math.round(s.stats.overtime) + ' Min.</p>' + werkInZahlen(s) + '<p class="say">' + esc(sim().abschluss(s)) + '</p></div>';
  }
  // v0.7 »Dein Werk in Zahlen« (nur vorhandene Statistik)
  function werkInZahlen(s) {
    const st = s.stats, z = [['Elon-Erwähnungen', st.elon], ['Blicke auf den Pappkameraden', st.pappe], ['Faxe', st.fax], ['Aufzugknopf gedrückt', st.aufzug], ['Süßigkeitenbox aufgefüllt', st.suess], ['»Das hatten wir schon immer so«', st.immer], ['Kopfhörer aufgesetzt', st.kopf], ['Easter Eggs', st.eggs]].filter(x => x[1]);
    return z.length ? '<h3>Dein Werk in Zahlen</h3><p class="small">' + z.map(x => esc(x[0]) + ': <b>' + x[1] + '</b>').join(' · ') + '</p>' : '';
  }
  // v0.10 Bestenliste mit Figur; im gefüllten Overlay steht {C} für Christian (sonst würde SC.fill daraus Sandra machen)
  const figTag = (x, filled) => (x.figur === 'sandra' ? ', Sandra' : x.figur === 'christian' ? (filled ? ', {C}' : ', Christian') : '');
  function highHtml(s) {
    if (!s._hs) { s._hs = true; s._hl = sim().addScore(s); }
    const L = s._hl || sim().highscores();
    return L.length ? '<p class="small">Bestenliste: ' + L.map((x, i) => (i + 1) + '. ' + x.score + figTag(x, true) + (x.win ? ' (Go-Live Tag ' + x.day + ')' : '')).join(' · ') + '</p>' : '';
  }
  function next() { const s = S(); sim().startDay(s); s._warned = false; shown = 0; closeOverlay(); SC.building.reset(); aud('play', 'tower'); morning(); sim().save(s); }
  function morning() {
    const s = S();
    UI.toast('Guten Morgen! ' + SC.WEEKDAYS[sim().weekday(s)] + ', Tag ' + s.day + '. Erster Termin: ' + (s.meetings[0] ? hm(s.meetings[0].start) + ' ' + s.meetings[0].title : 'keiner') + (UI._sndHint ? ' · ' + SND_HINT : ''));
    UI._sndHint = false;
  }

  const unpause = () => { UI.paused = false; $('btn-pause').textContent = 'Pause'; };
  UI.seenHint = () => { try { return !!localStorage.getItem('mesmarathon-hinweis'); } catch (e) { return true; } };
  // v0.9 Porträts: Christian hat die PNG-Datei, Sandra wird mit Rechtecken gezeichnet (kein getImageData, klappt auch unter file://)
  const PIMG = {};
  UI.portrait = function (fig) {
    if (fig !== 'sandra') return 'img/portrait.png';
    if (PIMG.sandra) return PIMG.sandra;
    try {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32; const g = c.getContext('2d');
      const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      r(0, 0, 32, 32, '#1c2a3a'); r(0, 26, 32, 6, '#24384c');
      r(8, 5, 16, 6, '#6a3a1c'); r(7, 8, 3, 14, '#6a3a1c'); r(22, 8, 3, 10, '#6a3a1c'); r(24, 10, 4, 3, '#6a3a1c'); r(26, 12, 3, 8, '#5a3014'); // Haare mit Pferdeschwanz
      r(10, 9, 12, 13, '#f0c090'); r(12, 13, 2, 2, '#202020'); r(18, 13, 2, 2, '#202020'); r(14, 18, 4, 1, '#b05040'); // Gesicht
      r(11, 11, 4, 1, '#4a2a10'); r(17, 11, 4, 1, '#4a2a10');
      r(6, 23, 20, 9, '#58b8a8'); r(13, 23, 6, 4, '#f4f8ff'); r(15, 23, 2, 9, '#2c6a60'); // Blazer mit Bluse
      r(20, 27, 4, 3, '#f0f0f0'); r(21, 28, 2, 1, '#40a0e0'); // Ausweis
      PIMG.sandra = c.toDataURL();
    } catch (e) { PIMG.sandra = 'img/portrait.png'; }
    return PIMG.sandra;
  };
  const pimg = (fig, cls, alt) => '<img src="' + UI.portrait(fig) + '" alt="' + (alt || '') + '" class="' + cls + '">';
  // v0.9 Figurenwahl: der erste Schritt bei »Neues Spiel«
  // v0.11: Figurenkarte im Spiel (Knopf mit dem Namen im HUD), Uhr steht solange
  UI.figurKarte = function () { const s = S(); if (!s) return; const X = SC.FIGUREN[s.figur] || SC.FIGUREN.christian;
    overlay('<h2>' + X.name + '</h2><div class="chefin">' + pimg(s.figur, 'pt', X.name) + '<div><p>' + X.titel + ', ' + X.kurz + '</p><ul class="small figkarte">' + X.plus.map(t => '<li class="good">+ ' + t + '</li>').join('') + X.minus.map(t => '<li class="warn">− ' + t + '</li>').join('') + '</ul></div></div><p><button data-o="weiter">Weiter</button></p>', true); };
  UI.pickFigur = function () {
    const card = f => { const X = SC.FIGUREN[f]; return '<div class="figur" data-fig="' + f + '">' + pimg(f, 'pt big', X.name) + '<h3>' + X.name + '</h3><p class="small">' + X.titel + ', ' + X.kurz + '</p>' +
      '<ul class="small">' + X.plus.map(t => '<li class="good">+ ' + t + '</li>').join('') + X.minus.map(t => '<li class="warn">− ' + t + '</li>').join('') + '</ul><p><button data-f="' + f + '">Als ' + X.name + ' spielen</button></p></div>'; };
    overlay('<h2>Wer bist du?</h2><p>Such dir aus, wer das MES diesmal wirklich einführt. Die andere Figur ist im Werk als Kollege oder Kollegin dabei.</p><div class="figuren">' + card('christian') + card('sandra') + '</div><p><button data-o="titel">Zurück</button></p>', true);
  };
  UI.newGame = function (seed, figur) {
    figur = SC.FIGUREN[figur] ? figur : SC.FIGUREN[store('mesmarathon-figur')] ? store('mesmarathon-figur') : 'christian'; // v0.14.1: gemerkte Figur, die es nicht mehr gibt, wird zu Christian
    try { localStorage.setItem('mesmarathon-hinweis', '1'); } catch (e) { /* */ }
    if (UI.room) UI.closeRoom();
    unpause(); store('mesmarathon-figur', figur); SC.S = sim().newGame(seed || (Date.now() & 0x7fffffff), figur); shown = 0; UI._siren = 0;
    SC.building.reset(); closeOverlay(); aud('unlock'); aud('play', 'tower'); morning(); sim().save(SC.S);
  };
  UI.showTitle = function () {
    const fv = document.getElementById('foot-v'); if (fv) fv.textContent = 'v' + SC.VERSION;
    const sv = sim().load();
    overlay('<div class="title"><h1 class="logo">MES-MARATHON</h1><p class="dim">Ein Werk. Sieben Stationen. Fünf Module. Zwanzig Tage. Unendlich viele Meetings.</p>' +
      '<p class="figuren-mini">' + pimg('christian', 'pt', 'Christian') + ' ' + pimg('sandra', 'pt', 'Sandra') + '</p><p>Du bist <b>Christian</b>, der erfahrene MES-Projektleiter, oder <b>Sandra</b>, die Kollegin aus der MES-Entwicklung. Seit Jahren wird in ' + SC.PLANT + ' das MES eingeführt. Diesmal wirklich.</p>' +
      (sim().oldSave && sim().oldSave() ? '<p class="small warn">Dein Spielstand stammt aus Version ' + esc(sim().oldSave()) + ' und passt nicht zu ' + SC.VERSION + '. Bitte neu starten.</p>' : '') +
      (!sv && !sim().highscores().length && !UI.seenHint() ? '<p class="small">Erstes Mal hier? Die Anleitung erklärt alles. Kurz: Module durch die Pipeline bringen, Meetings klug wählen, ab 17:00 wird es teuer. <span class="nur-tasten">Tasten: Leertaste (Pause), + und − (Tempo), M (Ton), K (Kopfhörer). </span>In Räumen steht die Uhr.</p>' : '') + '<p><button data-o="new">Neues Spiel</button> ' + (sv && sv.phase !== 'ende' ? '<button data-o="cont">Weiterspielen (Tag ' + sv.day + ', ' + esc(sv.name || 'Christian') + ')</button> ' : '') + '<button data-o="help">Anleitung</button> <button data-o="schrift" id="btn-schrift">' + (document.body.classList.contains('gross') ? 'Schrift: Groß' : 'Schrift: Normal') + '</button></p>' +
      '<p class="small dim">Inspiriert von Mad TV (1991). Eigenes Fanprojekt, alle Figuren frei erfunden. Version ' + SC.VERSION + '</p>' + (sim().highscores().length ? '<p class="small">Bestenliste: ' + sim().highscores().map((x, i) => (i + 1) + '. ' + x.score + figTag(x, false)).join(' · ') + '</p>' : '') + '</div>', true);
  };
  function help() {
    overlay('<h2>Anleitung</h2><div class="hilfe"><p>Du bist {C} (erfahrener Projektleiter fürs MES) oder Sandra (Spezialistin aus der MES-Entwicklung) in ' + SC.PLANT + '. Die Wahl kommt bei »Neues Spiel«. Bis Tag ' + SC.DEADLINE + ' müssen alle Module des neuen Manufacturing Execution Systems abgenommen sein. Werk Nord und Werk Süd machen dasselbe, und die Werkleitung vergleicht.</p>' +
      '<ul><li><b>Das Werk ist die Automatisierungspyramide:</b> EG Feld (Pforte, Schichtleiter, Hallen), 1 Steuerung (Werkstatt, Drucker, Kantine), 2 Leitebene (Büro, Leitstand, Meeting), 3 MES (Server, IT), 4 ERP (Werkleitung, Controlling). Die IT-Chefin fragt gern danach.</li>' +
      '<li><b>Klick auf eine Tür</b> (oder die Knöpfe unten): Deine Figur läuft hin, Aufzug inklusive. Beim Laufen läuft die Uhr. In einem Raum, bei Besuchen, Hinweisen und in der Pause steht sie: Lies in Ruhe. Zeit kosten nur das Laufen und die Aktionen: Eine Aktion springt die Uhr um ihre Dauer vor. Auch während du in ein Textfeld tippst, steht die Uhr.</li><li><b>Tempo:</b> Knopf oben oder Tasten + und −. Langsam (Standard): eine Spielstunde dauert 60 Sekunden, Normal 40, Schnell 30. <b>Schrift:</b> im Menü auf Groß stellen.</li>' +
      '<li><b>Ablauf je Modul:</b> Requirements (Hallen, an der Station des Moduls) → Spezifikation → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Hallen, Teststation) → Ausdruck (Drucker) → Abnahme (Werkleitung).</li>' +
      '<li><b>Stationen:</b> DEA, DEC, EEA, Extrusion, Innenverpackung, Außenverpackung, Sterilisation. Der Verpackungsautomat fällt ständig aus. Steht eine Teststation, hilft die Werkstatt.</li>' +
      '<li><b>Meetings:</b> Die Werkleitung hasst Schwänzer. Der Schichtleiter lädt ständig zu nutzlosen Meetings ein. Eins tut ihm gut, jedes weitere bringt weniger, und ab 90 Minuten am Tag zählt die Werkleitung mit. Besser: im Schichtleiter-Büro den Schichtplan abstimmen.</li>' +
      '<li><b>Besuche:</b> Der Tesla-Kollege (oft mit dem Kollegen aus dem Nachbarbüro, der sagt, er arbeite zu viel), der italienische Kollege mit Geschichten vom Essen, Kollegen aus anderen Abteilungen mit ehrlichen Fragen und die IT-Chefin mit der Pyramide. Du entscheidest, wie viel Zeit du ihnen gibst.</li>' +
      '<li><b>KPIs</b> (OEE, Ausschuss, Durchsatz, Liefertreue) im Leitstand. Abgenommene Module verbessern sie, Stillstand drückt sie. KPI-Bericht täglich, Freitag Wochenrückblick.</li>' +
      '<li><b>Budget</b> im Controlling: Tranche einmal pro Woche, Kredit (Rahmen 60 k€, ab Image 60 mehr, 8 % Zins jeden Freitag), Berater. Testläufe, Reparaturen, Toner und Wochenendschichten kosten. Unter −40 k€ ist Schluss.</li>' +
      '<li><b>Großereignisse:</b> Tag 6 kommt ein neues SAP (Stammdaten migrieren, Cutover Freitag). Tag 13 kauft die Firma die Konkurrenz (Systemfusion als sechstes Modul, Go-Live Tag 22).</li>' +
      '<li><b>Neu in 0.3:</b> Werk Nord und Werk Süd greifen ein (Abwerbung, Gerüchte beim Vorstand). Gegenmaßnahmen kosten Geld, Ignorieren kostet Image. Das Image im Konzern beeinflusst Tranche, Kreditrahmen und das Tempo der Rivalen. In der Werkleitung kannst du Zusagen machen (Module bis zu einer Frist): gehalten gibt Prämie, gebrochen kostet. Dazu Pflichttermine: Kaffeeautomat zum SAP-Cutover, die IT-Chefin mit Industrie 5.0 als Kreis, ein Morse-Rätsel am Verpackungsautomaten und die Kostümparty ab Tag 14 (Feierabend erst nach der Party). Wer dem italienischen Kollegen dreimal in Folge zuhört, bekommt Tiramisu.</li>' +
      '<li><b>Neu in 0.4:</b> Markt im Controlling (drei Angebote am Tag, ein Geschäft: Berater-Paket, Ersatzteile, Agentur-Kampagne, Pressemitteilung, Toner, Wartungsvertrag oder eine alte Lizenz verkaufen). Im Leitstand Montag oder Dienstag eine Prognose für den KPI-Index am Freitag abgeben (Treffer: Werkleitung und Image). Der Wassermelonen-Bericht meldet »alles grün«, bis das Audit nachschaut. Während der SAP-Migration gibt es die SAP-Hotline. Go-Live mit KPI-Index ab 90 % und Image ab 75: Titel »Werk des Jahres«. Jede Etage hat ein Fenster in die Produktion.</li>' +
      '<li><b>Neu in 0.5:</b> Dienstags hängt im Controlling eine Ausschreibung aus (Ersatzteile, Beraterkontingent oder Wartungspaket). Gebote bis Mittwoch 15:00, im Controlling oder per Mail aus dem Büro. Werk Nord bietet verdeckt, gezahlt wird nur beim Zuschlag. Zweiter Weg zum Sieg: das Konzernaudit »Vorzeigewerk« (Freitag ab Tag 15, sehr hohes Image und KPI-Index, mindestens 3 Module). Der Knopf 🎧 setzt Kopfhörer auf: Tesla-Kollege, Ahnungslose und Altwerk halten sich dann kurz. Im Serverraum wohnt jetzt ein digitaler Zwilling, und das Archiv hat Fundstücke. Christian bringt immer Süßigkeiten mit: Die Box im Büro füllst du einmal pro Woche am Kiosk der Kantine auf (Schoko-Mix, Gummibärchen oder Lakritz). Jeden Tag schaut ein Stammgast vorbei. Passt die Sorte, hilft er dir (zum Beispiel eine Reparatur oder ein Testlauf 10 Min. kürzer), sonst wird gemeckert. Das letzte Stück nimmt niemand. Und der Tesla-Kollege erzählt dir jetzt dauernd, was »Elon« angeblich alles anders machen würde (Elon-Zähler oben). Thema wechseln geht meistens.</li>' +
      '<li><b>Neu in 0.6:</b> Die Aktionsknöpfe zeigen, wann du fertig bist (⚠: nach Feierabend), in den Hallen auch die Wartezeit der Schichtübergabe. Wer nach 17:00 noch etwas anfängt, hat weniger Energie und braucht länger. Tasten: Leertaste Pause, + Tempo, M Ton, K Kopfhörer. Im Büro wartet ein Pappkamerad, im Druckerraum ein Fax-Gerät, und der Aufzug (Klick auf die Kabine) hat ein Geheimnis. Fällt der Dienstag aus, hängt die Ausschreibung am Mittwoch aus.</li>' +
      '<li><b>Neu in 0.7:</b> Im Schichtleiter-Büro hängt ein Abreißkalender, am Ende zeigt »Dein Werk in Zahlen«, was du so getrieben hast. Im Herbst gibt es am Kiosk Lebkuchen. Beim ersten Start gibt das Titelbild eine Kurzanleitung. Fällt der Freitag aus, weil die Energie auf null war, kommt das Wochenende danach trotzdem.</li>' +
      '<li><b>Neu in 0.13:</b> Breiteres Layout: Am PC passen Räume, Dialoge und die Anleitung ohne Scrollen auf den Bildschirm. In Räumen stehen links die Infos und rechts die Aktionen, die Raumknöpfe stehen neben dem Werk. Die Anleitung blättert mit ◀ und ▶. Spielstände aus 0.7 bis 0.12 laden weiter.</li>' +
      '<li><b>Neu in 0.12:</b> Alle Dialoge überarbeitet: weniger Widersprüche, Anrede passt für beide Figuren, ein paar Pointen sitzen besser. Auf dem Handy passen Dialoge und Räume besser auf den Bildschirm. Spielstände aus 0.7 bis 0.11 laden weiter.</li>' +
      '<li><b>Neu in 0.11:</b> Der Knopf mit dem Namen oben zeigt die Figurenkarte mit Stärken und Schwächen. Bei Sandra steht auf den Aktionsknöpfen, was ihr schneller oder langsamer gelingt; ihr Vorsprung am Rechner gilt bis Feierabend. Drei neue MES-Szenen. Kommt 17:00 mitten in einem Besuch, steht der Hinweis im Ticker. Spielstände aus 0.7 bis 0.10 laden weiter.</li>' +
      '<li><b>Neu in 0.9:</b> Mehr Ruhe zum Lesen: In Räumen steht die Uhr, der 17:00-Hinweis wartet auf »Weiter«, Tempo Langsam/Normal/Schnell (Standard Langsam), größere Schrift und Schalter »Schrift: Groß«. Leertaste bestätigt Hinweise mit nur einem Knopf, statt die Pause umzuschalten. Zwei Figuren zur Wahl: {C} (erfahren, gute Beziehungen) oder Sandra (Kollegin aus der MES-Entwicklung, schneller am Rechner, neu im Werk). Die andere Figur ist als Kollege oder Kollegin im MES-Stock unterwegs. Alle Texte im Werk sind schärfer gezeichnet.</li>' +
      '<li><b>Neu in 0.8:</b> Ein Tipp auf den Ticker unten zeigt das Tagesprotokoll (die Uhr steht so lange). Kommen mehrere Meldungen auf einmal, stehen die letzten zwei zusammen im Ticker. Am Werkstor hängt ein Aushang, im Leitstand das Diagramm des Tages. Energie auf null am Freitag kostet den Montag. Spielstände aus 0.7 laden weiter.</li>' +
      '<li><b>Flurfunk (neu in 0.3):</b> Brandschutzübungen, Beamer-Kabel, Überraschungsgerichte und mehr. Die Werkleitung streut Buzzwords: fünf verschiedene sind ein Bingo (Punkte). Werksdurchsagen, die Werkszeitung am Abend und ein paar Easter Eggs.</li>' +
      '<li><b>Excel-Liste</b> jeden Tag pflegen. Server und Drucker zicken. Kaffee und Mittagessen in der Kantine geben Energie. Bei Energie 0 schläfst du am Schreibtisch ein: Der nächste Tag fällt aus (Energie auf null, Werkleitung −8, Familie −4; am Freitag trifft es den Montag). Fällt so der Tag vor dem Go-Live-Termin aus, ist am Abend danach Schluss.</li>' +
      '<li><b>Feierabend</b> über die Pforte ab 15:00. Überstunden bis 20:00 kosten Familie. Sirene um 14:00: Schichtwechsel.</li>' +
      '<li><b>Ton auf dem Handy:</b> Der Ton startet mit der ersten Berührung. Oben rechts schaltet der Ton-Knopf an und aus. Auf dem iPhone den Stummschalter prüfen.</li><li>Verloren: Werkleitung oder Familie auf null, Budget unter −40 k€ oder Go-Live-Termin verpasst.</li></ul><p class="small">Tasten: Leertaste Pause, + Tempo, Esc Raum verlassen, M Ton, K Kopfhörer.</p></div><p class="hilfe-nav"><button data-o="back">Zurück</button></p>');
    blaettern();
  }
  // v0.13: Passt die Anleitung am PC nicht auf den Bildschirm, wird sie in Seiten geteilt (gleicher Text, nur aufgeteilt; ◀ und ▶ blättern)
  function blaettern() {
    const box = document.querySelector('#overlay .box'), hl = box && box.querySelector('.hilfe'); if (!hl) return;
    if (!(window.matchMedia && window.matchMedia(DESKTOP).matches) || box.scrollHeight <= box.clientHeight) return;
    const teile = []; for (const n of [...hl.children]) { if (n.tagName === 'UL') for (const li of [...n.children]) teile.push(li); else teile.push(n); }
    hl.innerHTML = ''; const nav = box.querySelector('.hilfe-nav'); nav.insertAdjacentHTML('afterbegin', '<button data-o="hs-1" aria-label="Vorherige Seite">◀</button> <span class="hs-n"></span> <button data-o="hs+1" aria-label="Nächste Seite">▶</button> ');
    const seiten = []; let seite = null, ul = null;
    const neu = () => { seite = document.createElement('div'); seite.className = 'hilfe-seite'; hl.appendChild(seite); seiten.push(seite); ul = null; };
    const dazu = t => { if (t.tagName === 'LI') { if (!ul) { ul = document.createElement('ul'); seite.appendChild(ul); } ul.appendChild(t); } else { ul = null; seite.appendChild(t); } };
    neu();
    for (const t of teile) {
      dazu(t);
      if (box.scrollHeight > box.clientHeight && seite.querySelectorAll('li, :scope > p').length > 1) {
        const leer = t.parentNode.tagName === 'UL' && t.parentNode.children.length === 1 ? t.parentNode : null; t.remove(); if (leer) leer.remove();
        seite.classList.add('hidden'); neu(); dazu(t);
      }
    }
    UI._hseiten = { seiten, i: 0 }; zeigeSeite(0);
  }
  function zeigeSeite(i) {
    const H = UI._hseiten; if (!H) return; H.i = Math.max(0, Math.min(H.seiten.length - 1, i));
    H.seiten.forEach((x, k) => x.classList.toggle('hidden', k !== H.i));
    const n = document.querySelector('#overlay .hs-n'); if (n) n.textContent = 'Seite ' + (H.i + 1) + '/' + H.seiten.length;
    const a = document.querySelector('#overlay button[data-o="hs-1"]'), b = document.querySelector('#overlay button[data-o="hs+1"]'); const fa = document.activeElement === a || document.activeElement === b;
    if (a) a.disabled = H.i === 0; if (b) b.disabled = H.i === H.seiten.length - 1;
    if (fa && document.activeElement && document.activeElement.disabled) (a && !a.disabled ? a : b).focus(); // Fokus bleibt beim Blättern erhalten
  }

  UI.init = function () {
    $('room').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b && !b.disabled) doAct(b.dataset.a); });
    $('overlay').addEventListener('click', e => {
      const v = e.target.closest('button[data-v]');
      if (v && S() && S().pending) { sim().choose(S(), v.dataset.v); closeOverlay(); SC.building.dismiss && SC.building.dismiss(); if (UI.room) renderRoom(); UI.hud(); sim().save(S()); if (S().minute >= SC.LATEST) UI.tick(); return; }
      const fb = e.target.closest('button[data-f]'); if (fb) { aud('unlock'); UI.newGame(0, fb.dataset.f); return; }
      const b = e.target.closest('button[data-o]'); if (!b) return; const o = b.dataset.o; aud('unlock');
      if (o === 'new') UI.pickFigur();
      else if (o === 'titel') UI.showTitle();
      else if (o === 'cont') { if (UI.room) UI.closeRoom(); unpause(); SC.S = sim().load(); shown = SC.S.msgs.length; closeOverlay(); SC.building.reset(); UI._siren = SC.S.sirene; if (SC.S.phase === 'tag') { aud('play', 'tower'); morning(); } else showEvening(SC.S, SC.S.lastReport); }
      else if (o === 'logzu') { UI._log = false; closeOverlay(); }
      else if (o === 'weiter') closeOverlay();
      else if (o === 'schrift') { UI.setGross(!document.body.classList.contains('gross')); }
      else if (o === 'help') help();
      else if (o === 'hs-1' || o === 'hs+1') zeigeSeite(UI._hseiten ? UI._hseiten.i + (o === 'hs+1' ? 1 : -1) : 0);
      else if (o === 'back' || o === 'title') UI.showTitle();
      else if (o === 'next') next();
      else if (o.startsWith('we')) { const out = sim().weekend(S(), +o[2]); sim().save(S()); if (S().phase === 'ende') { aud('jingle', S().result.win ? 'win' : 'lose'); overlay('<h2>Wochenende</h2><div class="abend mit-ende"><div class="abend-a"><p>' + esc(out.join(' ')) + '</p></div><div class="abend-b">' + endHtml(S()) + '</div></div><p><button data-o="title">Zum Titel</button></p>'); } else { next(); UI.toast(out.join(' ')); } }
    });
    const nav = $('rooms');
    nav.innerHTML = SC.FLOORS.map((f, i) => '<span class="floor-grp"><span class="fl">' + (i === 0 ? 'EG' : i) + ' ' + f.name + '</span>' + f.doors.filter(d => d.room).map(d => '<button data-r="' + d.room + '">' + esc(SC.ROOMS[d.room].title.split(' (')[0]) + '</button>').join('') + '</span>').reverse().join('');
    $('ticker').addEventListener('click', () => UI.showLog());
    $('ticker').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); UI.showLog(); } });
    nav.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) UI.walkTo(b.dataset.r); });
    const cv = $('cv');
    cv.addEventListener('mousemove', e => { const [x, y] = SC.building.toLogical(e); const p = SC.building.pick(x, y); SC.building.setHover(p); cv.style.cursor = p ? 'pointer' : 'default'; });
    cv.addEventListener('click', e => {
      if (!S() || S().phase !== 'tag') return;
      const [x, y] = SC.building.toLogical(e); const p = SC.building.pick(x, y);
      if (!p && SC.building.chimney && SC.building.chimney(x, y)) { const S0 = S(); S0.eggs.chN = (S0.eggs.chN || 0) + 1; UI.toast(SC.SCHORNSTEIN[(S0.eggs.chN - 1) % SC.SCHORNSTEIN.length]); if (S0.eggs.chN === 5 && !S0.eggs.schornstein) { S0.eggs.schornstein = S0.day; S0.stats.eggs++; UI.toast('Easter Egg! Fünfmal den Schornstein angeklickt. Die Werkleitung ernennt dich zum Schornsteinbeauftragten. Ehrenamtlich.'); } return; }
      if (!p && SC.building.liftHit && SC.building.liftHit(x, y)) { const t = sim().aufzug(S()); if (t) UI.toast(t); flushMsgs(); return; }
      if (p) { if (p.d.deco) { UI.toast(p.d.label === 'ARCHIV' ? sim().archiv(S()) : p.d.msg); flushMsgs(); SC.building.goTo(p.f, p.d.x, null); } else UI.walkTo(p.d.room); return; }
      const f = SC.building.floorAt(y); if (f !== null && x > 70 && x < 410) SC.building.goTo(f, Math.round(x), null);
    });
    $('btn-pause').onclick = () => { UI.paused = !UI.paused; $('btn-pause').textContent = UI.paused ? 'Weiter' : 'Pause'; };
    $('btn-speed').onclick = () => UI.setTempo((UI.tempo + 1) % SC.TEMPO.length); UI.setTempo(UI.tempo); UI.setGross(store('mesmarathon-schrift') === 'gross');
    $('btn-kopf').onclick = () => { const s = S(); if (!s) return; const r = sim().kopfhoerer(s); if (!r.ok) UI.toast(r.why, true); UI.hud(); if (UI.room) renderRoom(); };
    $('btn-figur').onclick = () => UI.figurKarte();
    $('btn-menu').onclick = () => { UI.paused = true; $('btn-pause').textContent = 'Weiter'; UI.showTitle(); };
    if (SC.audio) { SC.audio.init(); }
    // v0.4: Ton-Knopf zeigt auch »Ton: tippen«, solange der Browser den Ton noch sperrt (Handy)
    const syncSnd = () => { const A = SC.audio, st = A && A.state ? A.state() : {}; $('btn-sound').textContent = A && A.isMuted() ? '🔇 Ton aus' : st.ctx === 'running' ? '🔊 Ton an' : '🔈 Ton: tippen'; };
    UI.syncSnd = syncSnd; setInterval(syncSnd, 1000); if (SC.audio) SC.audio.onState = syncSnd;
    // iOS-Hinweis einmal je Gerät (nicht bei jedem Seitenaufruf)
    if (SC.audio) SC.audio.onFirstUnlock = () => { let seen = false; try { seen = !!localStorage.getItem('mesmarathon-sndhint'); localStorage.setItem('mesmarathon-sndhint', '1'); } catch (e) { /* */ } if (!seen && SC.audio.isIOS && SC.audio.isIOS()) { UI._sndHint = true; UI.toast(SND_HINT); } };
    // Erster Tipp auf »Ton: tippen« entsperrt nur, er schaltet den Ton nicht ab: hat dieselbe Geste gerade erst entsperrt (< 1,5 s), nicht umschalten
    // v0.5: »frisch« nur, wenn die entsperrende Geste auf dem Ton-Knopf selbst lag (oder Taste M war); ein Tipp irgendwo anders davor zählt nicht
    $('btn-sound').onclick = () => { const A = SC.audio, btn = $('btn-sound'), g = A && A._gestureEl, fresh = !!(A && A._gestureUnlockAt && Date.now() - A._gestureUnlockAt < 1500 && g && (g === 'key-m' || (g.nodeType === 1 && btn.contains(g)))); if (A) { A._gestureUnlockAt = 0; A._gestureEl = null; } aud('unlock'); if (A && !A.isMuted() && fresh) { syncSnd(); aud('play', S() && S().phase === 'tag' ? 'tower' : 'title'); return; } aud('setMuted', !(A && A.isMuted())); syncSnd(); if (SC.audio && !SC.audio.isMuted()) aud('play', S() && S().phase === 'tag' ? 'tower' : 'title'); };
    $('vol').oninput = e => aud('setVolume', e.target.value / 100);
    syncSnd();
    document.addEventListener('keydown', e => {
      if (UI.typing()) return;
      if (e.key === 'Escape' && UI._ov) { const one = document.querySelector('#overlay button[data-o="weiter"], #overlay button[data-o="logzu"]'); if (one) { one.click(); return; } }
      if (e.key === 'Escape' && UI.room) UI.closeRoom();
      // v0.9: Bei offenem Dialog schaltet die Leertaste nicht mehr die Pause um; hat der Dialog genau einen Knopf, lösen Leertaste und Enter ihn aus
      // (gehaltene Taste und die ersten 400 ms nach dem Öffnen zählen nicht, damit niemand einen Hinweis ungelesen wegdrückt)
      if (UI._ov && (e.key === ' ' || e.key === 'Enter')) { const bs = document.querySelectorAll('#overlay button'); if (bs.length === 1 && !document.querySelector('#overlay button[data-v]')) { e.preventDefault(); if (!e.repeat && performance.now() - (UI._ovAt || 0) > 400) bs[0].click(); } return; }
      // v0.10: im Raum steht die Uhr ohnehin; die Leertaste löst dort einen fokussierten Knopf aus statt die Pause
      if (e.key === ' ') { if (UI.room) { const t = document.activeElement && document.activeElement.tagName; if (!/^(BUTTON|SELECT|INPUT|A)$/.test(t || '')) e.preventDefault(); return; } $('btn-pause').click(); e.preventDefault(); }
      if (e.key === '+') UI.setTempo(UI.tempo + 1);
      if (e.key === '-' || e.key === '−') UI.setTempo(UI.tempo - 1);
      if (e.key === 'm' || e.key === 'M') $('btn-sound').click();
      if ((e.key === 'k' || e.key === 'K') && S() && !sim().kopfWhy(S())) $('btn-kopf').click();
    });
    aud('play', 'title');
  };
})(window.SC);

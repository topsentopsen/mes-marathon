// Headless-Chrome-Prüfung: lädt das Spiel, klärt einen Besuch, spielt Aktionen und einen Feierabend, macht Screenshots.
// Aufruf: NODE_PATH=/workspace/tmp-check/node_modules node test/browser-check.js [url]
'use strict';
const puppeteer = require('puppeteer-core');
const url = process.argv[2] || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
const out = process.env.SHOTS || '/workspace/mes-marathon';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1000 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('requestfailed', r => errs.push('requestfailed: ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' }); await wait(600);
  const title = await page.evaluate(() => ({ text: document.querySelector('#overlay').innerText, name: !!document.querySelector('#pname') }));
  await page.screenshot({ path: out + '-1-titel.png' });
  await page.click('button[data-o="new"]'); await wait(300);
  // v0.9 Figurenwahl ist der erste Schritt nach »Neues Spiel«
  const fig = await page.evaluate(() => ({ noGame: !window.SC.S || window.SC.S.day === undefined || !document.querySelector('button[data-v]'), btns: [...document.querySelectorAll('#overlay button[data-f]')].map(b => b.dataset.f), imgs: [...document.querySelectorAll('#overlay .figur img')].map(i => i.complete && i.naturalWidth > 0), text: document.querySelector('#overlay').innerText }));
  await page.screenshot({ path: out + '-0-figurenwahl.png' });
  await page.click('button[data-f="christian"]'); await wait(300);
  fig.christian = await page.evaluate(() => [window.SC.S.figur, window.SC.S.name, localStorage.getItem('mesmarathon-figur')]);
  // Besuch erzwingen: IT-Chefin mit der Pyramide
  await page.evaluate(() => { const S = window.SC.S; const v = S.visits.find(x => x.id === 'itchefin'); S.visits = S.visits.filter(x => x !== v); S.pending = v; });
  await wait(400);
  await page.screenshot({ path: out + '-2-itchefin.png' });
  const visitShown = await page.evaluate(() => !!document.querySelector('button[data-v]'));
  await page.click('button[data-v="skip"]'); await wait(200);
  await page.evaluate(() => { const S = window.SC.S; S.visits = []; S.stations.find(s => s.id === 'inpack').fault = { at: S.minute }; });
  await page.click('#rooms button[data-r="halle"]');
  await page.waitForFunction(() => window.SC.ui.room === 'halle', { timeout: 30000 });
  await page.click('#room button[data-a="req"]'); await wait(300);
  await page.screenshot({ path: out + '-3-hallen.png' });
  await page.click('#room button[data-a="leave"]'); await wait(1200);
  await page.screenshot({ path: out + '-4-fabrik.png' });
  await page.click('#rooms button[data-r="leitstand"]');
  await page.waitForFunction(() => window.SC.ui.room === 'leitstand', { timeout: 30000 });
  await page.click('#room button[data-a="bericht"]'); await wait(300);
  await page.screenshot({ path: out + '-5-leitstand.png' });
  await page.evaluate(() => { window.SC.S.pending = { id: 'tesla', duo: true, t: 3 }; }); await wait(300);
  await page.screenshot({ path: out + '-6-tesla.png' });
  await page.click('button[data-v="abwimmeln"]'); await wait(200);
  const st = await page.evaluate(() => { const s = window.SC.S; return { min: Math.round(s.minute), req: s.modules[0].req, budget: s.budget, msgs: s.msgs.length, hud: document.querySelector('#hud').innerText.replace(/\s+/g, ' ') }; });
  await page.evaluate(() => window.SC.debug.endDay()); await wait(300);
  await page.screenshot({ path: out + '-7-bilanz.png' });
  await page.click('button[data-o="next"]'); await wait(300);
  const d2 = await page.evaluate(() => window.SC.S.day);
  const text = await page.evaluate(() => document.body.innerText);
  // v0.7: Kurzanleitung beim ersten Start, Abreißkalender, Dein Werk in Zahlen
  const v07 = await page.evaluate(() => { const S = window.SC.S; S.pending = null; S.visits = []; window.SC.ui.openRoom('schicht'); const kal = /Abreißkalender/.test(document.getElementById('room').innerText); window.SC.ui.closeRoom(); return { kal }; });
  // v0.8: Aushang an der Pforte, Diagramm im Leitstand, Tipp auf den Ticker zeigt das Tagesprotokoll
  Object.assign(v07, await page.evaluate(() => { const S = window.SC.S; S.pending = null; S.visits = []; const r = {}; window.SC.ui.openRoom('pforte'); r.aushang = /Aushang am Werkstor/.test(document.getElementById('room').innerText); window.SC.ui.closeRoom(); window.SC.ui.openRoom('leitstand'); r.diagramm = /Diagramm des Tages/.test(document.getElementById('room').innerText); window.SC.ui.closeRoom();
    document.getElementById('ticker').click(); r.log = /Tagesprotokoll/.test(document.getElementById('overlay').innerText) && window.SC.ui.overlayOpen(); const b = document.querySelector('#overlay button[data-o="logzu"]'); if (b) b.click(); r.logZu = !window.SC.ui.overlayOpen(); S.msgs.push({ t: 'Meldung A', bad: true }, { t: 'Meldung B', bad: false }); window.SC.ui.hud(); r.ticker2 = /Meldung A · Meldung B/.test(document.getElementById('ticker').innerText); document.getElementById('ticker').click(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); r.escZu = !window.SC.ui.overlayOpen(); return r; }));
  v07.hint = /Erstes Mal hier/.test(title.text); if (!v07.hint || !v07.kal || !v07.aushang || !v07.diagramm || !v07.log || !v07.logZu || !v07.ticker2 || !v07.escZu) errs.push('v0.7/v0.8-Anzeige fehlt: ' + JSON.stringify(v07));
  // v0.9: Uhr steht in Räumen, Dialogen und Pause; Tempo-Stufen; Leertaste im Dialog; 17:00-Hinweis mit Weiter; Schriftgröße; Textfeld; Zeitsprung bei Aktionen; Laufzeit in Spielminuten
  const calm = () => page.evaluate(() => { const S = window.SC.S; S.visits = []; S.pending = null; S.meetings = []; S.server.crashAt = null; S.burnout = false; S._warned = false; S.minute = 9 * 60; });
  await calm();
  const v09 = await page.evaluate(() => ({ tempoText: document.getElementById('btn-speed').textContent, speed: window.SC.ui.speed, roomFont: (window.SC.ui.openRoom('buero'), parseFloat(getComputedStyle(document.getElementById('room')).fontSize)) }));
  const m0 = await page.evaluate(() => window.SC.S.minute); await wait(1500); v09.roomStill = (await page.evaluate(() => window.SC.S.minute)) === m0; v09.stoppedIcon = await page.evaluate(() => /⏸/.test(document.getElementById('hud-clock').textContent));
  await page.evaluate(() => window.SC.ui.closeRoom());
  const rate = async () => { const a = await page.evaluate(() => [window.SC.S.minute, performance.now()]); await wait(2000); const b = await page.evaluate(() => [window.SC.S.minute, performance.now()]); return Math.round((b[0] - a[0]) / ((b[1] - a[1]) / 1000) * 100) / 100; };
  v09.rate = {};
  for (let i = 0; i < 3; i++) { await calm(); await page.evaluate(i => window.SC.ui.setTempo(i), i); v09.rate[['langsam', 'normal', 'schnell'][i]] = Math.min(await rate(), await rate()); }
  v09.secPerHour = Object.fromEntries(Object.entries(v09.rate).map(([k, r]) => [k, Math.round(60 / r)]));
  await page.evaluate(() => window.SC.ui.setTempo(0));
  await page.evaluate(() => document.getElementById('ticker').click()); const m1 = await page.evaluate(() => window.SC.S.minute); await wait(1200); v09.overlayStill = (await page.evaluate(() => window.SC.S.minute)) === m1;
  const p0 = await page.evaluate(() => window.SC.ui.paused); await page.keyboard.press('Space'); await wait(100); v09.spaceNoPause = (await page.evaluate(() => window.SC.ui.paused)) === p0; v09.spaceClosesSingle = !(await page.evaluate(() => window.SC.ui.overlayOpen()));
  await page.keyboard.press('Space'); await wait(100); v09.pauseKey = await page.evaluate(() => window.SC.ui.paused); const m2 = await page.evaluate(() => window.SC.S.minute); await wait(1000); v09.pauseStill = (await page.evaluate(() => window.SC.S.minute)) === m2; await page.keyboard.press('Space'); await wait(100);
  await page.keyboard.press('Equal'); await page.keyboard.type('+'); await wait(100); v09.plus = await page.evaluate(() => [window.SC.ui.tempo, localStorage.getItem('mesmarathon-tempo'), document.getElementById('btn-speed').textContent]);
  await page.keyboard.type('-'); await wait(100); v09.minus = await page.evaluate(() => window.SC.ui.tempo);
  await calm(); await page.evaluate(() => { const S = window.SC.S; S.minute = window.SC.DAY_END - 2; window.SC.ui.openRoom('leitstand'); }); await wait(200); await page.evaluate(() => document.querySelector('#room button[data-a="bericht"]').click()); await wait(300);
  v09.hinweis = await page.evaluate(() => !!document.querySelector('#overlay button[data-o="weiter"]') && /17:00/.test(document.getElementById('overlay').innerText));
  await page.screenshot({ path: out + '-8-hinweis-1700.png' });
  await wait(300); await page.keyboard.press('Enter'); await wait(100); v09.hinweisZu = !(await page.evaluate(() => window.SC.ui.overlayOpen()));
  // Zeitsprung: eine Aktion springt die Uhr um genau ihre Dauer vor, danach steht sie im Raum wieder
  v09.sprung = await page.evaluate(async () => { const S = window.SC.S, sim = window.SC.sim; S.minute = 10 * 60; S._warned = true; S.visits = []; S.pending = null; S.meetings = []; S.energy = 100; window.SC.ui.closeRoom(); window.SC.ui.openRoom('halle'); const b = [...document.querySelectorAll('#room button[data-a]')].find(x => !x.disabled && x.dataset.a !== 'leave'); if (!b) return { none: true }; const id = b.dataset.a; const before = S.minute; const c = sim.actCost(S, 'halle', id); b.click(); const after = S.minute; await new Promise(r => setTimeout(r, 1200)); return { id, before, after, cost: c, still: S.minute === after, jumpOk: after - before >= c && after - before <= c + 25 }; });
  await page.evaluate(() => window.SC.ui.closeRoom());
  // Textfeld: Fokus in einem Eingabefeld hält die Uhr an, nach blur läuft sie weiter
  await calm(); await page.evaluate(() => { const i = document.createElement('input'); i.type = 'text'; i.id = 'testfeld'; document.getElementById('app').appendChild(i); });
  await page.focus('#testfeld'); await page.keyboard.type('Gebot 42'); const t0m = await page.evaluate(() => window.SC.S.minute); await wait(1200); v09.textStill = (await page.evaluate(() => window.SC.S.minute)) === t0m; v09.textTyped = await page.evaluate(() => document.getElementById('testfeld').value === 'Gebot 42' && window.SC.ui.tempo === 0);
  await page.evaluate(() => document.getElementById('testfeld').blur()); const t1m = await page.evaluate(() => window.SC.S.minute); await wait(1200); v09.textBlurRuns = (await page.evaluate(() => window.SC.S.minute)) > t1m; await page.evaluate(() => document.getElementById('testfeld').remove());
  // Laufzeit Erdgeschoss (Pforte) bis 2. Etage (Büro) in Spielminuten je Tempo
  v09.walk = {};
  for (let i = 0; i < 3; i++) { await calm(); await page.evaluate(i => window.SC.ui.setTempo(i), i); await page.evaluate(() => window.SC.ui.walkTo('pforte')); await page.waitForFunction(() => window.SC.ui.room === 'pforte', { timeout: 30000 }); await page.evaluate(() => window.SC.ui.closeRoom()); await calm();
    const w0 = await page.evaluate(() => window.SC.S.minute); await page.evaluate(() => window.SC.ui.walkTo('buero')); await page.waitForFunction(() => window.SC.ui.room === 'buero', { timeout: 30000 }); v09.walk[['langsam', 'normal', 'schnell'][i]] = Math.round(((await page.evaluate(() => window.SC.S.minute)) - w0) * 10) / 10; await page.evaluate(() => window.SC.ui.closeRoom()); }
  await page.evaluate(() => window.SC.ui.setTempo(1)); await page.reload(); await wait(500); v09.tempoAfterReload = await page.evaluate(() => [window.SC.ui.tempo, document.getElementById('btn-speed').textContent]); await page.evaluate(() => { window.SC.ui.setTempo(0); });
  const okR = (r, want) => Math.abs(r - want) / want < 0.25;
  if (v09.tempoText !== 'Tempo: Langsam' || v09.speed !== 0.5 || v09.roomFont < 18 || !v09.stoppedIcon || !v09.roomStill || !okR(v09.rate.langsam, 1) || !okR(v09.rate.normal, 1.5) || !okR(v09.rate.schnell, 2) || !v09.overlayStill || !v09.spaceNoPause || !v09.spaceClosesSingle || !v09.pauseKey || !v09.pauseStill || v09.plus[0] !== 1 || v09.plus[1] !== 'normal' || v09.minus !== 0 || !v09.hinweis || !v09.hinweisZu || !v09.sprung.jumpOk || !v09.sprung.still || !v09.textStill || !v09.textTyped || !v09.textBlurRuns || v09.tempoAfterReload[0] !== 1) errs.push('v0.9-Zeitmechanik: ' + JSON.stringify(v09));
  // v0.9 Sandra: Wahl, Anrede, Kollege Christian, Spielstand mit Figur
  await page.evaluate(() => { localStorage.removeItem('mesmarathon-save'); window.SC.ui.showTitle(); }); await wait(300);
  await page.click('button[data-o="new"]'); await wait(300); await page.click('button[data-f="sandra"]'); await wait(500);
  fig.sandra = await page.evaluate(() => [window.SC.S.figur, window.SC.S.name, window.SC.S.chef, window.SC.S.schicht]);
  await page.evaluate(() => { const S = window.SC.S; S.visits = []; S.pending = null; S.minute = 9 * 60; }); await wait(300);
  await page.screenshot({ path: out + '-9-sandra-haus.png' });
  await page.evaluate(() => window.SC.ui.walkTo('halle')); await page.waitForFunction(() => window.SC.ui.room === 'halle', { timeout: 30000 });
  await page.evaluate(() => document.querySelector('#room button[data-a="linie"]').click()); await wait(400);
  await page.evaluate(() => document.querySelector('#room button[data-a="leave"]').click()); await wait(800);
  await page.evaluate(() => window.SC.ui.showLog()); await wait(300); fig.anrede = await page.evaluate(() => document.querySelector('#overlay').innerText);
  await page.screenshot({ path: out + '-9-sandra-protokoll.png' }); await page.evaluate(() => document.querySelector('button[data-o="logzu"]').click()); await wait(300);
  await page.evaluate(() => { const S = window.SC.S; S.pending = { id: 'christian', at: S.minute, t: 0 }; }); await wait(1200);
  fig.besuch = await page.evaluate(() => document.querySelector('#overlay').innerText);
  await page.screenshot({ path: out + '-9-sandra-besuch-christian.png' });
  await page.evaluate(() => document.querySelector('button[data-v="zuhoeren"]').click()); await wait(300);
  await page.reload({ waitUntil: 'load' }); await wait(600);
  fig.cont = await page.evaluate(() => (document.querySelector('button[data-o="cont"]') || {}).textContent);
  await page.click('button[data-o="cont"]'); await wait(400); fig.loaded = await page.evaluate(() => [window.SC.S.figur, window.SC.S.name]);
  fig.ok = fig.btns.join() === 'christian,sandra' && fig.imgs.length === 2 && fig.imgs.every(Boolean) && fig.christian.join() === 'christian,Christian,christian' && fig.sandra.join() === 'sandra,Sandra,55,42' &&
    /»die vom MES«/.test(fig.anrede) && !/Christian/.test(fig.anrede) && /Christian, der erfahrene Kollege/.test(fig.besuch) && !/\{C\}/.test(fig.besuch) && /Sandra/.test(fig.cont || '') && fig.loaded.join() === 'sandra,Sandra';
  if (!fig.ok) errs.push('v0.9-Figuren fehlerhaft: ' + JSON.stringify(fig).slice(0, 600));
  // v0.10: Leertaste im Raum, Tastaturfokus, Kontrast, Bestenliste mit Figur; Handy: Ton-Knopf über Dialogen, Raumhöhe
  const v10 = {};
  await page.evaluate(() => { const S = window.SC.S; S.visits = []; S.pending = null; }); await page.evaluate(() => window.SC.ui.walkTo('buero')); await page.waitForFunction(() => window.SC.ui.room === 'buero', { timeout: 30000 });
  const q0 = await page.evaluate(() => window.SC.ui.paused); await page.keyboard.press('Space'); await wait(200); v10.spaceRoom = (await page.evaluate(() => window.SC.ui.paused)) === q0;
  await page.keyboard.press('Escape'); await wait(800); const q1 = await page.evaluate(() => window.SC.ui.paused); await page.keyboard.press('Space'); await wait(200); v10.spaceOutside = (await page.evaluate(() => window.SC.ui.paused)) !== q1; await page.keyboard.press('Space'); await wait(200);
  await page.focus('#ticker'); v10.focus = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return document.activeElement.id + ' ' + cs.outlineStyle + ' ' + cs.outlineWidth; });
  await page.keyboard.press('Enter'); await wait(300); v10.tickerKey = await page.evaluate(() => !!document.querySelector('#overlay button[data-o="logzu"]')); await page.keyboard.press('Escape'); await wait(300);
  const lum = c => { const v = c.match(/\d+/g).slice(0, 3).map(x => { x = x / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const cols = await page.evaluate(() => { const d = document.createElement('p'); d.className = 'dim'; d.textContent = 'x'; document.querySelector('#overlay').appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
  const L1 = lum(cols), L2 = lum('rgb(0,85,170)'); v10.dimContrast = Math.round((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05) * 10) / 10;
  v10.ok = v10.spaceRoom && v10.spaceOutside && /ticker solid 3px/.test(v10.focus) && v10.tickerKey && v10.dimContrast >= 4.5;
  if (!v10.ok) errs.push('v0.10-Desktop fehlerhaft: ' + JSON.stringify(v10));
  const mob = await browser.newPage(); await mob.setViewport({ width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  mob.on('pageerror', e => errs.push('mobil pageerror: ' + e.message)); mob.on('console', m => { if (m.type() === 'error') errs.push('mobil ' + m.text()); });
  await mob.goto(url, { waitUntil: 'load' }); await mob.evaluate(() => localStorage.clear()); await mob.reload({ waitUntil: 'load' }); await wait(500);
  const overlap = () => mob.evaluate(() => { const a = document.getElementById('btn-sound').getBoundingClientRect(), b = document.querySelector('#overlay .box').getBoundingClientRect(); return !(a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right); });
  v10.mobTitleOverlap = await overlap(); await mob.evaluate(() => document.querySelector('button[data-o="new"]').click()); await wait(400); v10.mobFigOverlap = await overlap();
  await mob.screenshot({ path: out + '-10-mobil-figurenwahl.png' });
  await mob.evaluate(() => document.querySelector('button[data-f="sandra"]').click()); await wait(500); await mob.evaluate(() => { const S = window.SC.S; S.visits = []; S.pending = null; });
  await mob.evaluate(() => window.SC.ui.walkTo('halle')); await mob.waitForFunction(() => window.SC.ui.room === 'halle', { timeout: 30000 }); await wait(300);
  v10.mobRoomH = await mob.evaluate(() => Math.round(document.getElementById('room').getBoundingClientRect().height)); await mob.screenshot({ path: out + '-10-mobil-raum.png' });
  await mob.evaluate(() => window.SC.ui.closeRoom()); await wait(300); v10.mobStageRatio = await mob.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return Math.round(r.width / r.height * 100) / 100; });
  v10.mobOk = !v10.mobTitleOverlap && !v10.mobFigOverlap && v10.mobRoomH >= 0.6 * 640 && Math.abs(v10.mobStageRatio - 1.6) < 0.03;
  if (!v10.mobOk) errs.push('v0.10-Handy fehlerhaft: ' + JSON.stringify(v10)); await mob.close();
  // v0.11: 17:00 bei offenem Besuch nur im Ticker; Knopfvermerk und Figurenkarte für Sandra; gedrehte Schrift mit Mindestgröße
  const v11 = {};
  await page.evaluate(() => { const S = window.SC.S; window.SC.ui.closeRoom(); S.visits = []; S.meetings = []; S.minute = window.SC.DAY_END - 1; S._warned = false; S.pending = { id: 'italien', at: S.minute, t: 0 }; }); await wait(400);
  await page.evaluate(() => window.SC.ui.setTempo(2)); await page.waitForFunction(() => window.SC.S._warned, { timeout: 8000 }).catch(() => {}); await wait(300);
  v11.hinweisBesuch = await page.evaluate(() => ({ warned: !!window.SC.S._warned, visit: !!document.querySelector('#overlay button[data-v]'), noHint: !document.querySelector('#overlay button[data-o="weiter"]'), ticker: /17:00/.test(document.getElementById('ticker').innerText), log: window.SC.S.dayLog.some(l => /17:00 Feierabend|erst die Party/.test(l)) }));
  await page.screenshot({ path: out + '-11-hinweis-bei-besuch.png' });
  await page.evaluate(() => { const b = document.querySelector('#overlay button[data-v]'); if (b) b.click(); window.SC.ui.setTempo(0); }); await wait(300);
  await page.evaluate(() => { const S = window.SC.S; S.visits = []; S.pending = null; S.minute = 10 * 60; window.SC.ui.closeOverlay && window.SC.ui.closeOverlay(); window.SC.ui.openRoom('buero'); }); await wait(300);
  v11.vermerk = await page.evaluate(() => [...document.querySelectorAll('#room .fig')].map(x => x.textContent));
  await page.screenshot({ path: out + '-11-sandra-knopfvermerk.png' });
  await page.evaluate(() => { window.SC.ui.closeRoom(); window.SC.ui.openRoom('halle'); }); await wait(300); v11.vermerkHalle = await page.evaluate(() => [...document.querySelectorAll('#room .fig')].map(x => x.textContent));
  await page.evaluate(() => window.SC.ui.closeRoom()); await wait(200); await page.click('#btn-figur'); await wait(300);
  v11.karte = await page.evaluate(() => ({ btn: document.getElementById('btn-figur').textContent, txt: document.getElementById('overlay').innerText }));
  await page.screenshot({ path: out + '-11-sandra-figurenkarte.png' }); await page.keyboard.press('Escape'); await wait(200);
  v11.ok = v11.hinweisBesuch.warned && v11.hinweisBesuch.visit && v11.hinweisBesuch.noHint && v11.hinweisBesuch.ticker && v11.hinweisBesuch.log && v11.vermerk.some(t => /schneller/.test(t)) && v11.vermerkHalle.some(t => /langsamer/.test(t)) && /Sandra/.test(v11.karte.btn) && /MES-Entwicklung/.test(v11.karte.txt) && /\+ /.test(v11.karte.txt);
  if (!v11.ok) errs.push('v0.11 fehlerhaft: ' + JSON.stringify(v11).slice(0, 600));
  console.log(JSON.stringify({ title: title.text.slice(0, 160), nameField: title.name, visitShown, st, d2, v07, v09, fig, v10, v11, errs }, null, 1));
  if (errs.length || d2 !== 2 || !visitShown || title.name) process.exitCode = 1;
  await browser.close();
})();

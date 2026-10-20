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
    document.getElementById('ticker').click(); r.log = /Tagesprotokoll/.test(document.getElementById('overlay').innerText) && window.SC.ui.overlayOpen(); const b = document.querySelector('#overlay button[data-o="logzu"]'); if (b) b.click(); r.logZu = !window.SC.ui.overlayOpen(); return r; }));
  v07.hint = /Erstes Mal hier/.test(title.text); if (!v07.hint || !v07.kal || !v07.aushang || !v07.diagramm || !v07.log || !v07.logZu) errs.push('v0.7-Anzeige fehlt: ' + JSON.stringify(v07));
  console.log(JSON.stringify({ title: title.text.slice(0, 160), nameField: title.name, visitShown, st, d2, v07, errs }, null, 1));
  if (errs.length || d2 !== 2 || !visitShown || title.name) process.exitCode = 1;
  await browser.close();
})();

// Headless-Chrome: eingefrorene GoatCounter-Kopie lädt ohne Fehler, sendet lokal nichts, #toggle-goatcounter setzt den Ausschluss.
// Aufruf: NODE_PATH=/workspace/tmp-check/node_modules node test/goatcounter-browser.js
'use strict';
const puppeteer = require('puppeteer-core');
const base = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errs = [], ext = [], dialogs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) ext.push(r.url()); });
  page.on('dialog', async d => { dialogs.push(d.message()); await d.accept(); });
  await page.goto(base + '?test=1', { waitUntil: 'load' }); await wait(800);
  const r1 = await page.evaluate(() => ({ loaded: !!(window.goatcounter && window.goatcounter.count), filter: window.goatcounter && window.goatcounter.filter(), url: window.goatcounter && window.goatcounter.url() }));
  await page.goto(base + '#toggle-goatcounter', { waitUntil: 'load' }); await wait(800);
  const r2 = await page.evaluate(() => ({ skip: localStorage.getItem('skipgc'), filter: window.goatcounter.filter() }));
  await page.goto('about:blank'); await page.goto(base + '#toggle-goatcounter', { waitUntil: 'load' }); await wait(800); // Neuladen nötig, ein reiner Sprung auf #toggle-goatcounter in derselben Seite reicht nicht
  const r3 = await page.evaluate(() => localStorage.getItem('skipgc'));
  const u = new URL(r1.url), ok = r1.loaded && r1.filter === 'localfile' && u.searchParams.get('q') === null && !/test=1/.test(r1.url) && r2.skip === 't' && /DISABLED/.test(dialogs[0] || '') && r3 === null && /ENABLED/.test(dialogs[1] || '') && !ext.length && !errs.length;
  console.log(JSON.stringify({ r1, r2, r3, dialogs, ext, errs, ok }, null, 1)); if (!ok) process.exitCode = 1; await browser.close();
})();

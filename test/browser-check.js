// Headless-Chrome-Prüfung: lädt das Spiel, spielt Aktionen und einen Feierabend, macht Screenshots.
// Aufruf: NODE_PATH=/workspace/tmp-check/node_modules node test/browser-check.js [url]
'use strict';
const puppeteer = require('puppeteer-core');
const url = process.argv[2] || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
const out = process.env.SHOTS || '/workspace/mes-shot';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 900 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('requestfailed', r => errs.push('requestfailed: ' + r.url()));
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' }); await wait(600);
  await page.screenshot({ path: out + '-1-titel.png' });
  await page.click('button[data-o="new"]'); await wait(300);
  await page.click('#rooms button[data-r="halle"]');
  await page.waitForFunction(() => window.SC.ui.room === 'halle', { timeout: 30000 });
  await page.click('#room button[data-a="req"]'); await wait(200);
  await page.screenshot({ path: out + '-2-halle.png' });
  await page.click('#rooms button[data-r="buero"]');
  await page.waitForFunction(() => window.SC.ui.room === 'buero', { timeout: 30000 });
  await page.click('#room button[data-a="excel"]'); await wait(200);
  await page.screenshot({ path: out + '-3-buero.png' });
  await page.click('#room button[data-a="leave"]'); await wait(1500);
  await page.screenshot({ path: out + '-4-haus.png' });
  const st = await page.evaluate(() => { const s = window.SC.S; return { min: s.minute, req: s.modules[0].req, excel: s.excel, msgs: s.msgs.length }; });
  await page.evaluate(() => window.SC.debug.endDay()); await wait(300);
  await page.screenshot({ path: out + '-5-bilanz.png' });
  await page.click('button[data-o="next"]'); await wait(300);
  const d2 = await page.evaluate(() => window.SC.S.day);
  console.log(JSON.stringify({ st, d2, errs }, null, 1));
  await browser.close();
})();

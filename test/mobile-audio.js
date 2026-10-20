// Handy-Ton (v0.4, Randfall v0.5): headless Chrome mit Mobile-Emulation (iPhone und Android, Touch-Events) und Standard-Autoplay-Sperre.
// Prüft: vor der ersten Berührung läuft kein Ton, nach dem ersten Tippen ist der AudioContext »running«,
// nach einem Unterbruch (suspend wie beim Tab-Wechsel) entsperrt die nächste Berührung wieder, Ton-Knopf schaltet.
// Aufruf: NODE_PATH=/workspace/tmp-check/node_modules node test/mobile-audio.js
'use strict';
const puppeteer = require('puppeteer-core');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
const out = process.env.SHOTS || '/workspace/mes-marathon-v06-mobil';
const wait = ms => new Promise(r => setTimeout(r, ms));
const DEV = [
  { name: 'iphone', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', w: 390, h: 844 },
  { name: 'android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36', w: 412, h: 915 }
];
async function tapSel(page, sel) { const r = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); if (!r) throw new Error('fehlt: ' + sel); await page.touchscreen.tap(r.x, r.y); }
// langsamer Tipp wie ein echter Finger: 150 ms zwischen Berühren und Loslassen (Review-Befund: Race beim ersten Tipp)
async function slowTap(page, sel) { const r = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); await page.touchscreen.touchStart(r.x, r.y); await wait(150); await page.touchscreen.touchEnd(); }
(async () => {
  // bewusst OHNE --autoplay-policy=no-user-gesture-required: wie ein echtes Handy
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const res = [];
  for (const d of DEV) {
    const page = await browser.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.setUserAgent(d.ua);
    await page.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'load' }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(500);
    const st = () => page.evaluate(() => Object.assign(window.SC.audio.state(), { btn: document.getElementById('btn-sound').textContent, ticker: document.getElementById('ticker').innerText }));
    const before = await st();
    await tapSel(page, 'button[data-o="new"]'); await wait(500);
    await tapSel(page, 'button[data-f="christian"]'); await wait(500);
    const after = await st();
    await page.screenshot({ path: out + '-' + d.name + '.png' });
    // Unterbruch wie beim Tab-Wechsel oder Anruf: Kontext angehalten, die nächste Berührung (auf das Spielfeld) entsperrt wieder
    await page.evaluate(() => window.SC.audio._ctx.suspend()); await wait(200);
    const susp = await st();
    await tapSel(page, '#cv'); await wait(400);
    const again = await st();
    // Ton-Knopf als allererste Berührung (Review-Befund): darf den Ton nicht abschalten, sondern nur entsperren
    const p2 = await browser.newPage(); await p2.setUserAgent(d.ua); await p2.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p2.goto(url, { waitUntil: 'load' }); await wait(1300);
    // der Ton-Knopf muss auch über dem Titelbild wirklich getroffen werden (v0.5: lag vorher unter dem Overlay)
    const hit = await p2.evaluate(() => { const b = document.getElementById('btn-sound').getBoundingClientRect(); const e = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!e && e.id === 'btn-sound'; });
    await slowTap(p2, '#btn-sound'); await wait(400);
    const first = await p2.evaluate(() => Object.assign(window.SC.audio.state(), { btn: document.getElementById('btn-sound').textContent })); await p2.close();
    // v0.5 Randfall: Tipp irgendwo (entsperrt), binnen 300 ms Tipp auf den Ton-Knopf: muss sofort abschalten
    const p3 = await browser.newPage(); await p3.setUserAgent(d.ua); await p3.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p3.goto(url, { waitUntil: 'load' }); await wait(800); await slowTap(p3, '#cv'); await wait(300); await slowTap(p3, '#btn-sound'); await wait(300);
    const edge = await p3.evaluate(() => Object.assign(window.SC.audio.state(), { btn: document.getElementById('btn-sound').textContent })); await p3.close();
    // v0.5: Taste M als allererste Eingabe entsperrt nur (schaltet nicht ab)
    const p4 = await browser.newPage(); await p4.setUserAgent(d.ua); await p4.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p4.goto(url, { waitUntil: 'load' }); await wait(800); await p4.keyboard.press('m'); await wait(300);
    const keyM = await p4.evaluate(() => Object.assign(window.SC.audio.state(), { btn: document.getElementById('btn-sound').textContent })); await p4.close();
    // v0.9: Knöpfe mindestens 44 px hoch, ein langer Ticker-Text verschiebt das Spielfeld nicht
    const p5 = await browser.newPage(); await p5.setUserAgent(d.ua); await p5.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p5.goto(url, { waitUntil: 'load' }); await wait(600); await p5.evaluate(() => document.querySelector('button[data-o="new"]').click()); await wait(400); await p5.evaluate(() => document.querySelector('button[data-f="christian"]').click()); await wait(400); await p5.evaluate(() => { const b = document.querySelector('#overlay .ea-badge') && document.querySelector('#overlay button[data-o="weiter"]'); if (b) b.click(); }); await wait(200); // Early Access: Level-Start schließen
    const lay = await p5.evaluate(async () => { const top = () => document.getElementById('rooms').getBoundingClientRect().top; const t0 = top(); window.SC.ui.toast('Sehr lange Meldung: '.repeat(30)); await new Promise(r => setTimeout(r, 100)); const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'mfeld'; document.getElementById('app').appendChild(inp); return { tickerH: Math.round(document.getElementById('ticker').getBoundingClientRect().height), speedH: document.getElementById('btn-speed').getBoundingClientRect().height, shift: Math.round(top() - t0), tempo: document.getElementById('btn-speed').textContent }; }); const mf0 = await p5.evaluate(() => { window.SC.S.visits = []; window.SC.S.pending = null; return window.SC.S.minute; }); await p5.tap('#mfeld'); await wait(150); const mfA = await p5.evaluate(() => window.SC.S.minute); await wait(1200); lay.textDbg = await p5.evaluate(m => [document.activeElement && document.activeElement.id, window.SC.S.minute - m, window.SC.ui.overlayOpen(), window.SC.ui.room], mf0); lay.textStill = lay.textDbg[0] === 'mfeld' && lay.textDbg[1] === mfA - mf0; await p5.evaluate(() => document.activeElement.blur()); await wait(1200); lay.blurRuns = await p5.evaluate(m => window.SC.S.minute > m, mf0); await p5.close();
    await wait(1600); await slowTap(page, '#btn-sound'); await wait(200); const muted = await st();
    await tapSel(page, '#btn-sound'); await wait(300); const unmuted = await st();
    const ok = before.ctx !== 'running' && after.ctx === 'running' && after.ready && susp.ctx === 'suspended' && again.ctx === 'running' && muted.muted && /aus/.test(muted.btn) && !unmuted.muted && unmuted.ctx === 'running' && /Ton an/.test(unmuted.btn) && hit && !first.muted && first.ctx === 'running' && edge.muted && /aus/.test(edge.btn) && !keyM.muted && keyM.ctx === 'running' && lay.speedH >= 44 && Math.abs(lay.shift) <= 2 && lay.tickerH <= 120 && lay.textStill && lay.blurRuns && !errs.length &&
      (d.name !== 'iphone' || /Stummschalter/.test(after.ticker));
    res.push({ dev: d.name, before: before.ctx, btnBefore: before.btn, after: after.ctx, el: after.el, btnAfter: after.btn, iosHint: /Stummschalter/.test(after.ticker), susp: susp.ctx, again: again.ctx, muted: muted.btn, unmuted: unmuted.btn, buttonOnTop: hit, firstTapButton: first.btn, first, edgeTapThenButton: edge.btn, edgeMuted: edge.muted, keyM: keyM.btn, keyMctx: keyM.ctx, lay, errs, ok });
    await page.close();
  }
  console.log(JSON.stringify(res, null, 1));
  if (res.some(r => !r.ok)) process.exitCode = 1;
  await browser.close();
})();

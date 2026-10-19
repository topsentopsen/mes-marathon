// Simulierter Handspiel-Durchlauf im headless Chrome: klickt sich wie ein Mensch durch mehrere Tage
// (Raumknöpfe, Aktionen, Besuche, Meetings, Feierabend, Wochenende), prüft »Weiterspielen« nach dem Abend
// und macht Screenshots. Aufruf: NODE_PATH=/workspace/tmp-check/node_modules node test/playthrough.js [tage] [seed]
'use strict';
const puppeteer = require('puppeteer-core');
const path = require('path');
const DAYS = +process.argv[2] || 6, SEED = +process.argv[3] || 4242;
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
const out = process.env.SHOTS || '/workspace/mes-marathon-play';
const wait = ms => new Promise(r => setTimeout(r, ms));
// Klick im Seitenkontext (der Raum wird alle 5 Spielminuten neu gezeichnet, Element-Handles veralten sonst)
const click = (page, sel) => page.evaluate(s => { const b = document.querySelector(s); if (b && !b.disabled) { b.click(); return true; } return false; }, sel);
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1000 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' }); await wait(400);
  await page.click('button[data-o="new"]'); await wait(200);
  await page.evaluate(seed => { window.SC.ui.newGame(seed); window.SC.ui.speed = 4; }, SEED);
  const log = [], shots = [], contChecks = [];
  let lastDay = 0, actions = 0, visits = 0, meetings = 0, guard = 0, shotDay = {};
  const t0 = Date.now();
  while (guard++ < 20000 && Date.now() - t0 < 12 * 60 * 1000) {
    const st = await page.evaluate(() => {
      const S = window.SC.S, UI = window.SC.ui, sim = window.SC.sim, B = window.SC.building;
      const q = s => UI.overlayOpen() && !!document.querySelector(s);
      const ok = (room, id) => { const a = sim.actions[room].find(x => x.id === id); return a && !a.check(S); };
      let want = null;
      if (S.phase === 'tag' && !S.pending) {
        const am = sim.activeMeeting(S);
        const order = [];
        if (am && (am.kind !== 'schicht' || S.schicht < 60)) order.push(['meeting', 'attend']);
        if (S.minute >= 15 * 60 + 30) order.push(['buero', 'excel'], ['pforte', 'home']);
        order.push(['buero', 'excel'], ['controlling', 'tranche'], ['leitstand', 'p_mid'], ['controlling', 'm0'], ['kantine', 'lunch'], ['server', 'restart'], ['werkstatt', 'repair'], ['drucker', 'fix'],
          ['chef', 'abnahme'], ['drucker', 'print'], ['server', 'deploy'], ['halle', 'test'], ['buero', 'migrate'], ['buero', 'impl'], ['buero', 'spec'], ['halle', 'req'], ['leitstand', 'bericht'], ['leitstand', 'p_mid'], ['chef', 'report'], ['controlling', 'm0']);
        if (S.energy < 40) order.unshift(['kantine', 'coffee']);
        want = order.find(([r, i]) => ok(r, i)) || ['pforte', S.minute >= 15 * 60 ? 'home' : null];
      }
      return { day: S.day, phase: S.phase, min: Math.round(S.minute), room: UI.room, ov: UI.overlayOpen(), walking: B.walking(),
        visit: q('#overlay button[data-v]'), next: q('#overlay button[data-o="next"]'), we: q('#overlay button[data-o="we1"]'), title: q('#overlay button[data-o="title"]'),
        want, ended: S.phase === 'ende' };
    });
    if (st.title || st.ended && !st.next && !st.we) { log.push('Spielende an Tag ' + st.day); break; }
    if (st.day !== lastDay && st.phase === 'tag' && !st.ov) { lastDay = st.day; log.push('Tag ' + st.day + ' beginnt ' + st.min); }
    if (st.visit) { visits++; if (visits <= 3) { const f = out + '-besuch-' + visits + '.png'; await page.screenshot({ path: f }); shots.push(f); } await click(page, '#overlay button[data-v]'); await wait(80); continue; }
    if (st.next || st.we) {
      if (!shotDay[st.day]) { shotDay[st.day] = 1; const f = out + '-abend-tag' + st.day + '.png'; await page.screenshot({ path: f }); shots.push(f); }
      // Weiterspielen nach dem Abend: Seite neu laden, Titel, »Weiterspielen«, Abend muss wieder da sein
      if ((st.day === 1 || st.we) && !contChecks.some(c => c.day === st.day)) {
        await page.reload({ waitUntil: 'load' }); await wait(400);
        const hasCont = await page.$('button[data-o="cont"]'); let r = { day: st.day, phase: st.phase, cont: !!hasCont };
        if (hasCont) { await page.click('button[data-o="cont"]'); await wait(300); r = Object.assign(r, await page.evaluate(() => ({ after: window.SC.S.phase, dayAfter: window.SC.S.day, next: !!document.querySelector('#overlay button[data-o="next"]'), we: !!document.querySelector('#overlay button[data-o="we1"]') }))); await page.evaluate(() => { window.SC.ui.speed = 4; }); }
        r.ok = r.cont && r.after === st.phase && r.dayAfter === st.day && (st.we ? r.we : r.next); contChecks.push(r); continue;
      }
      if (st.day >= DAYS) break;
      await click(page, st.we ? '#overlay button[data-o="we1"]' : '#overlay button[data-o="next"]'); await wait(150); continue;
    }
    if (st.phase !== 'tag' || st.ov) { await wait(100); continue; }
    if (st.room) {
      const id = st.want && st.want[0] === st.room ? st.want[1] : null;
      const btn = id ? await click(page, '#room button[data-a="' + id + '"]') : false;
      if (btn) { actions++; if (id === 'attend') meetings++; if (!shotDay['r' + st.day] && st.day % 2 === 1) { shotDay['r' + st.day] = 1; const f = out + '-raum-tag' + st.day + '-' + st.room + '.png'; await page.screenshot({ path: f }); shots.push(f); } }
      await click(page, '#room button[data-a="leave"]');
      await wait(60); continue;
    }
    if (!st.walking && st.want && st.want[1]) { await click(page, '#rooms button[data-r="' + st.want[0] + '"]'); await wait(120); continue; }
    if (!st.walking && st.want && !st.want[1] && !shotDay['f' + st.day]) { shotDay['f' + st.day] = 1; const f = out + '-fabrik-tag' + st.day + '.png'; await page.screenshot({ path: f }); shots.push(f); }
    await wait(150);
  }
  const fin = await page.evaluate(() => { const S = window.SC.S; return { day: S.day, phase: S.phase, prog: window.SC.sim.progress(S), chef: S.chef, family: S.family, budget: S.budget, kpi: window.SC.sim.kpiIndex(S), sap: S.sap.state, stats: S.stats }; });
  console.log(JSON.stringify({ secs: Math.round((Date.now() - t0) / 1000), actions, visits, meetings, log, contChecks, fin, shots, errs }, null, 1));
  if (errs.length || contChecks.some(c => !c.ok) || fin.day < Math.min(DAYS, 2)) process.exitCode = 1;
  await browser.close();
})();

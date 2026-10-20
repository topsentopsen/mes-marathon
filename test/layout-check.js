// v0.13 Layout-Prüfung: öffnet jeden Raum und jeden Dialog in vielen Spielständen bei mehreren Fenstergrößen.
// Am PC darf weder die Seite noch ein Raum noch ein Dialog scrollen (scrollHeight <= clientHeight), auf dem Handy
// ist Scrollen erlaubt, aber nichts darf seitlich abgeschnitten sein.
// Aufruf: NODE_PATH=/workspace/tmp-check/node_modules node test/layout-check.js [url] [--shots] [--gross]
// Fenster: VPS=1366x768,1440x900,1920x1080,390x844 (Standard). Screenshots: SHOTS=/pfad (mit --shots).
'use strict';
const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path');
const url = process.argv.find(a => /^(file|https?):/.test(a)) || 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTDIR = process.env.SHOTS || '/workspace/mes-layout-shots';
const SHOTS = process.argv.includes('--shots'), GROSS = process.argv.includes('--gross');
const VPS = (process.env.VPS || '1366x768,1440x900,1920x1080,390x844').split(',').map(v => v.split('x').map(Number));
// Spielstände: drei Partien (Christian »gut«, Sandra »vorzeig«, Christian »sapChaos«), jeweils zu Tagesbeginn
const states = (() => { const SC = require('./helper.js'), sim = SC.sim, { POL, playDay } = require('../tools/bot.js'), out = [];
  for (const [figur, seed, pol] of [['christian', 4242, 'gut'], ['sandra', 777, 'vorzeig'], ['christian', 99, 'sapChaos']]) {
    const S = sim.newGame(seed, figur); let g = 0;
    while (S.phase !== 'ende' && g++ < 40) { if (S.phase === 'tag' && !S.pending) out.push({ label: figur + '-' + pol + '-tag' + S.day, s: JSON.parse(JSON.stringify(S)) }); playDay(S, POL[pol]); }
  }
  return out; })();
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const result = {};
  for (const [w, h] of VPS) {
    const mobile = w < 640;
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(400);
    // Titel, Anleitung, Figurenwahl (Dialoge vor dem Spiel)
    const meas = () => page.evaluate(() => {
      const de = document.documentElement, r = [];
      if (de.scrollHeight > window.innerHeight + 1) r.push('Seite H ' + de.scrollHeight + '>' + window.innerHeight);
      if (de.scrollWidth > window.innerWidth + 1) r.push('Seite B ' + de.scrollWidth + '>' + window.innerWidth);
      const els = [document.getElementById('room'), ...document.querySelectorAll('#overlay .box'), ...document.querySelectorAll('#room *, #overlay .box *, #ticker, #calendar')];
      for (const el of els) {
        if (!el || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
        if (el.id === 'ticker') continue; // Ticker: eigener Bereich, nicht Teil eines Menüs
        if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll|hidden/.test(getComputedStyle(el).overflowY) && el.clientHeight > 0) r.push((el.id || el.className || el.tagName) + ' H ' + el.scrollHeight + '>' + el.clientHeight);
        if (el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(el).overflowX) && el.clientWidth > 0) r.push((el.id || el.className || el.tagName) + ' B ' + el.scrollWidth + '>' + el.clientWidth);
      }
      // Abgeschnitten: Knöpfe außerhalb des sichtbaren Bereichs ihres Containers
      for (const b of document.querySelectorAll('#room button, #overlay button')) {
        if (b.offsetParent === null) continue; const q = b.getBoundingClientRect();
        if (q.right > window.innerWidth + 1 || q.left < -1) r.push('Knopf außerhalb B: ' + b.textContent.slice(0, 30));
      }
      return r;
    });
    const res = { rooms: {}, dialogs: {}, worst: {}, n: 0, bad: 0, errs };
    if (GROSS) await page.evaluate(() => window.SC.ui.setGross(true));
    const note = (bucket, key, r) => { res.n++; if (r.length) { res.bad++; (res[bucket][key] = res[bucket][key] || []).push(r.join('; ')); } };
    note('dialogs', 'titel', await meas());
    await page.evaluate(() => document.querySelector('button[data-o="help"]').click()); await wait(100); note('dialogs', 'anleitung', await meas());
    res.hilfeSeiten = await page.evaluate(() => document.querySelectorAll('#overlay .hilfe-seite').length || 1);
    for (let i = 1; i < res.hilfeSeiten; i++) { await page.evaluate(() => document.querySelector('#overlay button[data-o="hs+1"]').click()); await wait(30); note('dialogs', 'anleitung-seite' + (i + 1), await meas()); if (SHOTS && i === 1) await page.screenshot({ path: SHOTDIR + '/' + w + 'x' + h + '-anleitung-seite2.png' }); }
    res.hilfeText = await page.evaluate(() => document.querySelector('#overlay .hilfe').textContent.replace(/\s+/g, ' ').length);
    if (SHOTS) await page.screenshot({ path: SHOTDIR + '/' + w + 'x' + h + '-anleitung.png' });
    await page.evaluate(() => document.querySelector('button[data-o="back"]').click()); await wait(50);
    await page.evaluate(() => document.querySelector('button[data-o="new"]').click()); await wait(100); note('dialogs', 'figurenwahl', await meas());
    await page.evaluate(() => document.querySelector('button[data-f="christian"]').click()); await wait(300);
    const rooms = await page.evaluate(() => Object.keys(window.SC.ROOMS));
    for (const st of states) {
      for (const late of [false, true]) {
        const r = await page.evaluate((s, late, rooms) => {
          const SC = window.SC, UI = SC.ui; if (late) { s.minute = 16 * 60 + 50; s._warned = true; }
          localStorage.setItem('mesmarathon-save', JSON.stringify(s)); SC.S = SC.sim.load(); SC.S.pending = null;
          if (UI.overlayOpen()) document.getElementById('overlay').classList.add('hidden'), UI._ov = false;
          if (UI.room) UI.closeRoom(); UI.hud(); const out = {};
          for (const room of rooms) {
            UI.openRoom(room); UI.hud();
            const de = document.documentElement, m = []; const el = document.getElementById('room');
            if (de.scrollHeight > window.innerHeight + 1) m.push('Seite H ' + de.scrollHeight + '>' + window.innerHeight);
            if (de.scrollWidth > window.innerWidth + 1) m.push('Seite B ' + de.scrollWidth + '>' + window.innerWidth);
            if (el.scrollHeight > el.clientHeight + 1) m.push('#room H ' + el.scrollHeight + '>' + el.clientHeight);
            if (el.scrollWidth > el.clientWidth + 1) m.push('#room B ' + el.scrollWidth + '>' + el.clientWidth);
            if (window.innerWidth < 640) { // Handy: Scrollen erlaubt, aber nichts darf seitlich abgeschnitten sein
              const rr0 = el.getBoundingClientRect();
              for (const b of el.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (q.right > rr0.right + 1 || q.left < rr0.left - 1 || q.width < 40 || q.height < 40) { m.push('Handy: Knopf seitlich abgeschnitten oder zu klein: ' + b.textContent.slice(0, 25) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height)); break; } }
              if (getComputedStyle(el).overflowY !== 'auto') m.push('Handy: Raum nicht scrollbar');
              out[room] = { m, rh: 0, ch: 0, v: 'mobil', fs: 99 }; UI.closeRoom(); continue;
            }
            for (const c of el.querySelectorAll('*')) { const cs = getComputedStyle(c); if (/auto|scroll/.test(cs.overflowY) && c.scrollHeight > c.clientHeight + 1) m.push(c.className + ' H ' + c.scrollHeight + '>' + c.clientHeight); if (window.innerWidth >= 640 && /auto|scroll/.test(cs.overflowX) && c.scrollWidth > c.clientWidth + 1) m.push(c.className + ' B ' + c.scrollWidth + '>' + c.clientWidth); }
            // Inhalt unten abgeschnitten (overflow hidden): letzter Knopf im Raum sichtbar?
            const rr = el.getBoundingClientRect();
            for (const b of el.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (q.bottom > rr.bottom + 1 || q.right > rr.right + 1) { m.push('Knopf abgeschnitten: ' + b.textContent.slice(0, 25)); break; } }
            const cc = el.querySelector('.room-cols'); out[room] = { m, rh: el.scrollHeight, ch: el.clientHeight, ph: de.scrollHeight, v: cc ? cc.className.replace(/room-cols ?|nur-acts ?/g, '').trim() || 'normal' : '?', fs: parseFloat(getComputedStyle(cc.querySelector('button') || cc).fontSize) };
            UI.closeRoom();
          }
          return out;
        }, st.s, late, rooms);
        for (const [room, x] of Object.entries(r)) { res.var = res.var || {}; res.var[x.v] = (res.var[x.v] || 0) + 1; if (x.v !== 'mobil') res.minFs = Math.min(res.minFs || 99, x.fs); note('rooms', room, x.m.map(t => st.label + (late ? '@16:50' : '') + ' ' + t)); const sl = x.rh - x.ch; if (!res.worst[room] || sl > res.worst[room].slack) res.worst[room] = { slack: sl, rh: x.rh, ch: x.ch, st: st.label + (late ? '@16:50' : '') }; }
      }
    }
    // Dialoge im Spiel: Besuche, Abend, Wochenende, Protokoll, Hinweis, Figurenkarte, Menü
    const st = states.find(x => /tag9$/.test(x.label)) || states[8];
    await page.evaluate(s => { localStorage.setItem('mesmarathon-save', JSON.stringify(s)); window.SC.S = window.SC.sim.load(); }, st.s);
    let vshot = false;
    for (const s2 of states) {
      const n = await page.evaluate(s => { localStorage.setItem('mesmarathon-save', JSON.stringify(s)); window.SC.S = window.SC.sim.load(); return window.SC.S.visits.length; }, s2.s);
      for (let i = 0; i < n; i++) {
        const vid = await page.evaluate(i => { const S = window.SC.S, UI = window.SC.ui; if (UI.overlayOpen()) { document.getElementById('overlay').classList.add('hidden'); UI._ov = false; } const v = S.visits[i]; S.minute = Math.max(S.minute, v.at || S.minute); S.pending = v; try { UI.hud(); } catch (e) { return 'FEHLER ' + v.id + ' ' + e.message; } return v.id; }, i); await wait(10);
        note('dialogs', 'besuch-' + vid.replace(/ .*/, ''), (await meas()).map(t => s2.label + ' ' + t));
        if (SHOTS && !vshot && vid === 'itchefin') { vshot = true; await page.screenshot({ path: SHOTDIR + '/' + w + 'x' + h + '-besuch-itchefin.png' }); }
        await page.evaluate(() => { window.SC.S.pending = null; });
      }
    }
    await page.evaluate(s => { localStorage.setItem('mesmarathon-save', JSON.stringify(s)); window.SC.S = window.SC.sim.load(); }, st.s);
    await page.evaluate(() => { const UI = window.SC.ui; document.getElementById('overlay').classList.add('hidden'); UI._ov = false; UI.showLog(); }); note('dialogs', 'protokoll', await meas());
    await page.evaluate(() => { const UI = window.SC.ui; document.getElementById('overlay').classList.add('hidden'); UI._ov = false; UI.hinweis('17:00 Feierabend! Überstunden gehen bis 20:00, kosten aber Familie, und was du jetzt noch anfängst, dauert länger (Spätzuschlag: ×1,2). Raus über die Pforte (EG).'); }); note('dialogs', 'hinweis', await meas());
    await page.evaluate(() => { const UI = window.SC.ui; document.getElementById('overlay').classList.add('hidden'); UI._ov = false; document.getElementById('btn-figur').click(); }); await wait(30); note('dialogs', 'figurenkarte', await meas());
    await page.evaluate(() => { const UI = window.SC.ui; document.getElementById('overlay').classList.add('hidden'); UI._ov = false; document.getElementById('btn-menu').click(); }); await wait(30); note('dialogs', 'menue', await meas());
    for (const s2 of states.filter((x, i) => i % 3 === 0)) {
      await page.evaluate(s => { const UI = window.SC.ui; document.getElementById('overlay').classList.add('hidden'); UI._ov = false; localStorage.setItem('mesmarathon-save', JSON.stringify(s)); window.SC.S = window.SC.sim.load(); window.SC.S.pending = null; UI.endDay(); }, s2.s); await wait(30);
      note('dialogs', 'abend', (await meas()).map(t => s2.label + ' ' + t));
      await page.evaluate(() => { const d = document.querySelector('#overlay details'); if (d) d.open = true; }); await wait(10);
      note('dialogs', 'abend-protokoll-offen', (await meas()).map(t => s2.label + ' ' + t));
    }
    // Screenshots typischer Raum (Leitstand, Tag 9, 16:50) und Fabrik
    if (SHOTS) {
      for (const [room, lab] of [['leitstand', 'leitstand'], ['buero', 'buero'], ['controlling', 'controlling']]) {
        await page.evaluate((s, room) => { const UI = window.SC.ui; document.getElementById('overlay').classList.add('hidden'); UI._ov = false; s = JSON.parse(JSON.stringify(s)); s.minute = 16 * 60 + 50; s._warned = true; localStorage.setItem('mesmarathon-save', JSON.stringify(s)); window.SC.S = window.SC.sim.load(); window.SC.S.pending = null; if (UI.room) UI.closeRoom(); UI.openRoom(room); UI.hud(); }, st.s, room); await wait(200);
        await page.screenshot({ path: SHOTDIR + '/' + w + 'x' + h + '-' + lab + '.png' });
      }
      await page.evaluate(() => { const UI = window.SC.ui; if (UI.room) UI.closeRoom(); }); await wait(300);
      await page.screenshot({ path: SHOTDIR + '/' + w + 'x' + h + '-fabrik.png' });
    }
    result[w + 'x' + h] = res; await page.close();
  }
  await browser.close();
  for (const [vp, r] of Object.entries(result)) {
    console.log('== ' + vp + (GROSS ? ' (Schrift groß)' : '') + ': ' + r.n + ' Prüfungen, ' + r.bad + (+vp.split('x')[0] < 640 ? ' mit Scrollen (Handy: erlaubt, bewertet wird nur seitlich)' : ' mit Scrollen/Abschneiden') + (r.errs.length ? ', JS-Fehler: ' + r.errs.join(' | ') : ''));
    for (const [k, v] of Object.entries(r.rooms)) console.log('  Raum ' + k + ': ' + v.length + 'x, z.B. ' + v[0]);
    for (const [k, v] of Object.entries(r.dialogs)) console.log('  Dialog ' + k + ': ' + v.length + 'x, z.B. ' + v[0]);
    console.log('  Varianten: ' + JSON.stringify(r.var) + (r.minFs ? ', kleinste Knopfschrift ' + r.minFs + ' px' : '') + ', Anleitung: ' + r.hilfeSeiten + ' Seite(n), ' + r.hilfeText + ' Zeichen');
  }
  if (process.env.RESULT) fs.writeFileSync(process.env.RESULT, JSON.stringify(result, null, 1));
  // Bewertung: PC ohne jeden Befund; Handy nur seitliche Befunde (Scrollen nach unten ist dort erlaubt)
  let fail = 0;
  for (const [vp, r] of Object.entries(result)) {
    const mobil = +vp.split('x')[0] < 640; let n = 0;
    for (const b of ['rooms', 'dialogs']) for (const v of Object.values(r[b])) for (const x of v) if (!mobil || x.split('; ').some(t => / B |Handy/.test(t))) n++;
    if (r.errs.length) n++;
    console.log(vp + (GROSS ? ' (Schrift groß)' : '') + ': ' + (n ? n + ' Befunde' : 'ok') + (mobil ? ' (Handy: seitlich)' : ''));
    if (n && !GROSS) fail++;
  }
  console.log(fail ? 'LAYOUT FEHLER' : 'ok Layout-Prüfung');
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });

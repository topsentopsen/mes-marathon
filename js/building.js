// MES-Marathon: Fabrik im Querschnitt (Etagen = Automatisierungspyramide), Hallenflügel, Aufzug und Figuren (Canvas, Pixel-Look)
'use strict';
(function (SC) {
  const W = 480, H = 300, FH = 50, GROUND = 288, BX0 = 64, BX1 = 416, EX = 240, EW = 30;
  const WALLS = ['#8a8e94', '#a8a89c', '#b8c4cc', '#8c9ca8', '#d0c0a0'];
  let cv, ctx, hover = null, blink = 0;
  const P = { x: 190, f: 0, dir: 1, moving: false, anim: 0, visible: true, inLift: false, queue: [] };
  const lift = { pos: 0 };
  // Figuren nur über Rollen: Schichtleiter, Tesla-Kollege, der Kollege, der nichts arbeitet, italienischer Kollege, IT-Chefin
  const NPC0 = [
    { role: 'schicht', f: 0, x: 170, dir: 1, col: '#e0e020' },
    { role: 'tesla', f: 1, x: 300, dir: -1, col: '#d03030' },
    { role: 'nix', f: 1, x: 288, dir: 1, col: '#7a7a70', idle: true },
    { role: 'italien', f: 2, x: 290, dir: -1, col: '#f0f0f0' },
    { role: 'itchefin', f: 3, x: 300, dir: 1, col: '#9050d0' }
  ];
  let npcs = NPC0.map(n => Object.assign({ wait: 0, home: n.f, hx: n.x }, n));
  const smoke = [];
  // v0.3: Sprechblasen (rein kosmetisch, Math.random ist hier erlaubt, die Spiellogik bleibt unberührt)
  const bub = { n: null, t: '', ttl: 0, next: 4 };
  let tick = 0;
  const floorY = f => GROUND - f * FH;

  // Skyline einmal fest erzeugen
  const sky = [];
  (function () {
    let s = 7, x = 0;
    const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    while (x < W) { const w = 18 + Math.floor(r() * 30), h = 40 + Math.floor(r() * 120); sky.push({ x, w, h, win: Math.floor(r() * 1000) }); x += w + 2; }
  })();

  function lerpCol(a, b, t) {
    const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
    return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',') + ')';
  }
  function skyCols(min) {
    const day = ['#1040b0', '#80c8ff'], dusk = ['#402080', '#ff9040'], night = ['#000018', '#182060'];
    const h = min / 60;
    if (h < 16) return day;
    if (h < 18) { const t = (h - 16) / 2; return [lerpCol(day[0], dusk[0], t), lerpCol(day[1], dusk[1], t)]; }
    if (h < 19) { const t = h - 18; return [lerpCol(dusk[0], night[0], t), lerpCol(dusk[1], night[1], t)]; }
    return night;
  }

  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function text(t, x, y, c, size, align) {
    ctx.font = 'bold ' + (size || 7) + 'px monospace'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#000'; ctx.fillText(t, x + 1, y + 1); ctx.fillStyle = c; ctx.fillText(t, x, y);
  }

  function drawSky(min) {
    const [top, bot] = skyCols(min);
    const bands = 20;
    for (let i = 0; i < bands; i++) { // Copper-Balken
      ctx.fillStyle = lerpCol(rgbHex(top), rgbHex(bot), i / (bands - 1));
      ctx.fillRect(0, Math.floor(i * H / bands), W, Math.ceil(H / bands) + 1);
    }
    const night = min >= 18 * 60 + 30;
    if (night) for (let i = 0; i < 40; i++) rect((i * 97) % W, (i * 53) % 120, 1, 1, '#fff');
    // Sonne/Mond
    const h = min / 60;
    if (h < 18.5) { const sy = 30 + Math.max(0, (h - 12)) * 22; rect(440, sy, 14, 14, '#ffe060'); rect(438, sy + 2, 18, 10, '#ffe060'); }
    else { rect(30, 24, 10, 10, '#f0f0c0'); rect(33, 24, 7, 7, lerpCol(rgbHex(top), rgbHex(top), 0)); }
    sky.forEach(b => {
      rect(b.x, GROUND - b.h, b.w, b.h, night ? '#101830' : '#3a4870');
      if (min > 17 * 60) for (let y = GROUND - b.h + 4; y < GROUND - 4; y += 7) for (let x = b.x + 3; x < b.x + b.w - 3; x += 6)
        if (((x * 7 + y * 13 + b.win) % 5) === 0) rect(x, y, 2, 3, '#ffd860');
    });
  }
  function rgbHex(c) {
    if (c[0] === '#') return c;
    const m = c.match(/\d+/g).map(Number); return '#' + m.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  // Kostüme ab 16:00 am Party-Tag (Umziehen vor der Party) und danach bis Feierabend
  const partyDay = () => { const S = SC.S; return !!(S && S.ev && S.day >= 14 && S.minute >= 16 * 60 && (!S.ev.party || S.ev.party === S.day)); };
  // v0.3 Kostümparty: die Rollenfiguren tauchen verkleidet auf (nur Grafik)
  function costume(x, y, role) {
    if (role === 'schicht') { rect(x - 5, y - 17, 10, 9, '#ffffff'); rect(x - 5, y - 17, 10, 2, '#d02020'); for (let i = 0; i < 3; i++) rect(x - 4 + i * 3, y - 14, 2, 2, '#202020'); }
    else if (role === 'tesla') { rect(x - 3, y - 30, 7, 5, '#20c040'); rect(x + 4, y - 29, 1, 3, '#20c040'); rect(x - 2, y - 29, 3, 3, '#a0ffa0'); }
    else if (role === 'nix') { rect(x - 4, y - 26, 9, 3, '#ffd000'); rect(x - 2, y - 28, 5, 2, '#ffd000'); }
    else if (role === 'italien') { rect(x - 5, y - 16, 10, 8, '#f0c060'); rect(x - 4, y - 15, 8, 6, '#e03020'); rect(x - 2, y - 14, 2, 2, '#ffffff'); rect(x + 1, y - 12, 2, 2, '#ffffff'); rect(x - 1, y - 11, 1, 1, '#20a040'); }
    else if (role === 'itchefin') { rect(x - 6, y - 32, 13, 1, '#40e0ff'); rect(x - 6, y - 32, 1, 6, '#40e0ff'); rect(x + 6, y - 32, 1, 6, '#40e0ff'); rect(x - 6, y - 27, 13, 1, '#40e0ff'); }
  }
  function drawMan(x, y, col, anim, moving, dir, me, role) {
    x = Math.round(x); y = Math.round(y);
    const s = moving ? Math.round(Math.sin(anim) * 2) : 0;
    rect(x - 3, y - 8, 2, 8 - Math.max(0, s), '#202048');
    rect(x + 1, y - 8, 2, 8 - Math.max(0, -s), '#202048');
    rect(x - 4, y - 17, 8, 9, col);
    rect(x - 5, y - 16, 1, 6, col); rect(x + 4, y - 16, 1, 6, col);
    if (me) { rect(x - 2, y - 17, 4, 2, '#f4f8ff'); rect(x, y - 15, 1, 6, '#6a94c4'); } // Hemd mit hellem Kragen und Knopfleiste
    else if (role === 'schicht') { rect(x - 4, y - 13, 8, 1, '#c0c0c0'); rect(x - 4, y - 11, 8, 1, '#c0c0c0'); }
    else if (role === 'tesla') { rect(x - 2, y - 15, 5, 1, '#fff'); rect(x, y - 14, 1, 4, '#fff'); }
    else if (role === 'italien') { rect(x - 4, y - 12, 3, 2, '#20a040'); rect(x - 1, y - 12, 2, 2, '#fff'); rect(x + 1, y - 12, 3, 2, '#e02020'); }
    else if (role === 'itchefin') { rect(x - 1, y - 16, 3, 3, '#ffcc00'); rect(x, y - 17, 1, 1, '#ffcc00'); }
    else { rect(x - 1, y - 17, 2, 5, '#ffffff'); rect(x, y - 16, 1, 4, '#c02020'); }
    rect(x - 2, y - 22, 5, 5, '#f0c090');
    if (me) { rect(x - 3, y - 24, 7, 3, '#c4c4c8'); rect(x - 3, y - 22, 1, 3, '#a4a4aa'); rect(x + 3, y - 22, 1, 2, '#a4a4aa'); rect(x - 1, y - 24, 1, 1, '#e8e8ec'); rect(x + 1, y - 24, 1, 1, '#909096'); }
    else if (role === 'schicht') { rect(x - 3, y - 24, 7, 2, '#ffffff'); rect(x - 4, y - 22, 9, 1, '#ffffff'); }
    else if (role === 'itchefin') { rect(x - 3, y - 23, 7, 2, '#603020'); rect(x - 3, y - 21, 1, 5, '#603020'); rect(x + 3, y - 21, 1, 5, '#603020'); }
    else rect(x - 2, y - 23, 5, 2, role === 'italien' ? '#201008' : '#402010');
    rect(x + (dir < 0 ? -2 : 2), y - 21, 1, 1, '#000');
    if (!me && role && partyDay()) costume(x, y, role);
    if (role === 'itchefin') { rect(x + 5, y - 18, 6, 1, '#ff8040'); rect(x + 6, y - 20, 4, 1, '#80e080'); rect(x + 7, y - 22, 2, 1, '#40e0ff'); } // Pyramide unter dem Arm
  }

  function drawFloor(f, min) {
    const top = floorY(f + 1) + 4, bot = floorY(f), h = bot - top;
    rect(BX0 + 4, top, BX1 - BX0 - 8, h, WALLS[f]);
    rect(BX0 + 4, bot - 9, BX1 - BX0 - 8, 9, shade(WALLS[f], -40)); // Sockel
    rect(BX0 + 4, bot - 10, BX1 - BX0 - 8, 1, shade(WALLS[f], 30));
    for (let x = BX0 + 30; x < BX1 - 20; x += 70) { rect(x, top, 12, 2, '#555'); rect(x + 2, top + 2, 8, 2, min > 17 * 60 ? '#fff8c0' : '#ddd'); } // Lampen
    // v0.4: jede Etage hat ihr eigenes Fenster in die Produktion, mit eigener Ansicht (die Türen bleiben, wo sie sind)
    // EG Feld: nur eine Scheibe (rechts stehen Förderband und Presse), sonst zwei Scheiben mit einer durchgehenden Szene
    if (f === 2) { prodWindow(259, top + 5, 42, h - 17, 0); prodWindow(360, top + 5, 44, h - 17, 101); }
    else { floorWindow(f, 259, top + 5, 42, h - 17, 0, min); if (f !== 0) floorWindow(f, 360, top + 5, 44, h - 17, 101, min); }
    plant(BX0 + 16, bot); plant(BX1 - 16, bot);
    // Türen
    SC.FLOORS[f].doors.forEach(d => {
      const hov = hover && hover.f === f && hover.d === d;
      rect(d.x - 13, bot - 33, 26, 33, hov ? '#ffff00' : '#3a2410');
      rect(d.x - 11, bot - 31, 22, 31, d.deco ? '#706050' : '#8a5a2a');
      rect(d.x - 9, bot - 29, 18, 12, d.deco ? '#605040' : '#9a6a3a');
      rect(d.x + 6, bot - 16, 2, 2, '#ffd040');
      rect(d.x - 26, bot - 43, 52, 9, d.deco ? '#404040' : '#0055aa');
      rect(d.x - 26, bot - 43, 52, 1, '#fff');
      text(d.label, d.x, bot - 42, d.deco ? '#aaa' : '#fff', 7);
    });
    // Etagenschild: Ebene der Automatisierungspyramide
    rect(BX0 + 4, top + 15, 41, 9, '#202020'); text((f === 0 ? 'EG ' : f + ' ') + SC.FLOORS[f].name, BX0 + 24, top + 16, ['#ff8040', '#ffcc00', '#80e080', '#40e0ff', '#c080ff'][f], 6);
    if (f === 0) { // Hallenboden: Warnstreifen und Förderband
      for (let x = BX0 + 4; x < BX1 - 4; x += 8) rect(x, bot - 9, 4, 3, '#e0c020');
      const off = Math.floor(tick / 3) % 12;
      rect(BX0 + 250, bot - 14, 100, 4, '#404040');
      for (let x = BX0 + 250 + off; x < BX0 + 346; x += 24) rect(x, bot - 20, 8, 6, '#b08850');
      press(364, bot - 10);
    }
  }
  // v0.3: animierte Stanzpresse im EG (Stößel fährt auf und ab, Funken beim Aufschlag)
  function press(x, y) {
    const ph = (tick % 60) / 60, down = ph < 0.5 ? Math.sin(ph * Math.PI * 2) : 0, ram = Math.round(down * 9);
    rect(x, y - 30, 4, 30, '#4a5a6a'); rect(x + 22, y - 30, 4, 30, '#4a5a6a'); rect(x - 2, y - 33, 30, 5, '#2e3a46'); rect(x + 2, y - 32, 22, 1, '#ffcc00');
    rect(x + 11, y - 28, 4, 4 + ram, '#a0a8b0'); rect(x + 6, y - 24 + ram, 14, 5, '#d04020'); rect(x + 6, y - 24 + ram, 14, 1, '#ff8060');
    rect(x + 3, y - 6, 20, 6, '#303840'); rect(x + 4, y - 7, 18, 1, '#e0c020');
    if (ram >= 8) { rect(x + 3, y - 9, 1, 1, '#ffff80'); rect(x + 23, y - 10, 1, 1, '#ffff80'); rect(x + 1, y - 12, 1, 1, '#ffd040'); rect(x + 25, y - 8, 1, 1, '#ffd040'); }
    const S = SC.S, jam = S && S.stations && S.stations.some(st => st.fault && (st.id === 'inpack' || st.id === 'auspack'));
    rect(x + 24, y - 38, 3, 3, jam ? ((Math.floor(blink / 6) % 2) ? '#ff2020' : '#600000') : '#30e030');
  }
  // Blick durchs Fenster in die Produktionshalle: Rückwand, Roboterarm, Förderband mit Kartons, Hallenkran
  function prodWindow(x0, y0, w, h, sx) {
    rect(x0 - 2, y0 - 2, w + 4, h + 4, '#2a2a30'); rect(x0, y0, w, h, '#1c2a3a');
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    const X = v => x0 + v - sx; // gemeinsame Szene über beide Scheiben
    for (let gx = -sx % 10; gx < w; gx += 10) rect(x0 + gx, y0, 1, h, '#22344a');
    rect(x0, y0 + 4, w, 2, '#3a4a5a'); // Kranbahn
    const cr = (tick * 0.4) % 160; rect(X(cr), y0 + 3, 12, 4, '#e0a020'); rect(X(cr) + 5, y0 + 7, 1, 8, '#888'); rect(X(cr) + 3, y0 + 15, 5, 3, '#806040');
    const belt = y0 + h - 7; rect(x0, belt, w, 3, '#505860');
    for (let bx = -((tick * 0.6) % 18); bx < 160; bx += 18) { const xx = X(bx); if (xx > x0 - 8 && xx < x0 + w) rect(xx, belt - 5, 7, 5, '#c09060'); }
    // Roboterarm an Station »Scheibe 1«
    const bxr = X(22), by = belt, a1 = -1.2 + Math.sin(tick / 25) * 0.5, a2 = a1 + 1.1 + Math.sin(tick / 17) * 0.6;
    rect(bxr - 3, by - 3, 7, 3, '#ff8000');
    const ex = bxr + Math.cos(a1) * 9, ey = by - 3 + Math.sin(a1) * 9, hx = ex + Math.cos(a2) * 7, hy = ey + Math.sin(a2) * 7;
    ctx.strokeStyle = '#ff9a20'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bxr, by - 3); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    rect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3, '#d0d0d0'); if (Math.sin(tick / 17) > 0.9) rect(Math.round(hx) + 2, Math.round(hy), 1, 1, '#ffff80');
    // Extruder mit Lauflicht in Scheibe 2
    const ex0 = X(120); rect(ex0, by - 12, 26, 12, '#5a6a7a'); rect(ex0 + 2, by - 10, 22, 3, '#2a3038'); rect(ex0 + 2 + (tick >> 2) % 20, by - 10, 3, 3, '#40e0ff'); rect(ex0 + 26, by - 6, 8, 2, '#c0c0c0');
    ctx.restore();
    rect(x0 + Math.floor(w / 2), y0, 1, h, '#2a2a30'); rect(x0, y0 + Math.floor(h / 2), w, 1, 'rgba(42,42,48,0.6)'); // Sprossen
    rect(x0, y0, w, 1, 'rgba(255,255,255,0.25)');
  }
  // v0.4 Fensteransichten je Etage: 0 Feld (Lichtschranke am Band), 1 Steuerung (Schaltschränke, SPS), 3 MES (Blick von oben mit Tracking), 4 ERP (Laderampe, Lkw, Parkplatz)
  function floorWindow(f, x0, y0, w, h, sx, min) {
    const S = SC.S, X = v => x0 + v - sx;
    rect(x0 - 2, y0 - 2, w + 4, h + 4, '#2a2a30');
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    if (f === 0) {
      rect(x0, y0, w, h, '#2c3440'); const belt = y0 + h - 8; rect(x0, belt, w, 4, '#505860'); for (let k = 0; k < w; k += 6) rect(x0 + k + (tick >> 1) % 6, belt + 1, 2, 1, '#383e46');
      rect(x0 + 18, y0 + 6, 3, belt - y0 - 6, '#e0c020'); rect(x0 + 30, y0 + 6, 3, belt - y0 - 6, '#e0c020'); // Lichtschranke (Sender, Empfänger)
      let cut = false; for (let bx = -((tick * 0.7) % 22); bx < w; bx += 22) { const xx = x0 + bx; rect(xx, belt - 7, 9, 7, '#c09060'); rect(xx + 3, belt - 6, 3, 2, '#ffffff'); if (xx + 9 > x0 + 21 && xx < x0 + 30) cut = true; }
      rect(x0 + 21, belt - 4, 9, 1, cut ? 'rgba(255,40,40,0.4)' : '#ff3030'); rect(x0 + 18, y0 + 4, 3, 2, cut ? '#ffd040' : '#30e030');
      text('B12', x0 + 25, y0 + 6, '#fff', 5);
    } else if (f === 1) {
      rect(x0, y0, w, h, '#3a4048'); const bad = !!(S && S.stations && S.stations.some(st => st.fault));
      for (let c = 0; c < 6; c++) { const cx = X(c * 25 + 4); if (cx > x0 + w || cx + 20 < x0) continue; rect(cx, y0 + 3, 20, h - 6, '#7a8a96'); rect(cx + 1, y0 + 4, 18, h - 8, '#c8ccd0'); rect(cx + 9, y0 + 4, 1, h - 8, '#7a8a96');
        for (let r = 0; r < 3; r++) for (let l = 0; l < 3; l++) { const red = bad && (c === 1 || c === 4) && r === 0 && l === 1; rect(cx + 2 + l * 2, y0 + 7 + r * 5, 1, 1, red ? ((blink >> 3) % 2 ? '#ff2020' : '#500000') : ((tick + c * 7 + r * 3 + l * 5) % 40 < 30 ? '#30e030' : '#104010')); }
        rect(cx + 11, y0 + 6, 7, 5, '#204060'); text(['S7', 'IO', 'PLC', 'HMI', 'NOT', 'BUS'][c], cx + 14, y0 + 6, '#80e0ff', 4); rect(cx + 12, y0 + 14, 5, 7, '#303840'); }
      rect(x0, y0 + h - 3, w, 3, '#e0c020'); // Kabelkanal
    } else if (f === 3) {
      rect(x0, y0, w, h, '#2a2e34'); for (let gx = -sx % 8; gx < w; gx += 8) rect(x0 + gx, y0, 1, h, '#30353c');
      const lines = [y0 + 7, y0 + h - 9]; lines.forEach((ly, li) => { rect(x0, ly, w, 3, '#505860'); for (let bx = -((tick * (0.5 + li * 0.2)) % 16); bx < 160; bx += 16) { const xx = X(bx); if (xx > x0 - 6 && xx < x0 + w) { rect(xx, ly - 1, 5, 5, '#c09060'); rect(xx + 1, ly - 3, 3, 1, '#40ff80'); } } });
      SC.STATIONS.forEach((d, i) => { const st = S && S.stations && S.stations[i], xx = X(4 + i * 21), yy = i < 3 ? lines[0] + 5 : lines[1] - 8; rect(xx, yy, 8, 4, st && st.fault ? ((blink >> 3) % 2 ? '#ff2020' : '#802020') : '#5a7a9a'); });
      rect(x0 + 2, y0 + h / 2 - 4, 30, 7, 'rgba(0,0,0,0.55)'); text((sx ? 'OEE ' + (S && S.kpi ? S.kpi.oee.toFixed(0) : '62') + '%' : 'MES ' + (S && SC.sim ? SC.sim.progress(S) : 0) + '%'), x0 + 17, y0 + h / 2 - 3, '#40ff80', 5);
    } else {
      const sk = skyCols(min); rect(x0, y0, w, h, sk[1]); rect(x0, y0, w, 6, sk[0]);
      rect(x0, y0 + h - 10, w, 10, '#404448'); for (let k = -sx % 12; k < w; k += 12) rect(x0 + k, y0 + h - 5, 6, 1, '#e0e0e0');
      rect(X(4), y0 + h - 20, 40, 10, '#6a6e74'); rect(X(4), y0 + h - 21, 40, 1, '#e0c020'); // Laderampe
      const lx = X(46 + Math.sin(tick / 90) * 6); rect(lx, y0 + h - 21, 34, 13, '#e8e8e8'); rect(lx + 34, y0 + h - 18, 12, 10, '#2060c0'); rect(lx + 40, y0 + h - 16, 5, 4, '#a0d8ff'); rect(lx + 4, y0 + h - 8, 5, 3, '#202020'); rect(lx + 36, y0 + h - 8, 5, 3, '#202020'); text('MES', lx + 17, y0 + h - 19, '#2060c0', 5);
      const tx = X(116); rect(tx, y0 + h - 14, 18, 5, '#d03030'); rect(tx + 4, y0 + h - 17, 10, 3, '#a0d8ff'); rect(tx + 2, y0 + h - 9, 3, 2, '#202020'); rect(tx + 13, y0 + h - 9, 3, 2, '#202020');
      rect(X(140), y0 + h - 22, 3, 12, '#30a030'); rect(X(139), y0 + h - 22, 5, 3, (blink >> 4) % 2 ? '#40ff40' : '#208020'); // Ladesäule, nicht eingesteckt
      if (min > 17 * 60) for (let k = 0; k < 3; k++) rect(X(20 + k * 40), y0 + 2, 1, 6, '#ffd860');
    }
    ctx.restore();
    rect(x0 + Math.floor(w / 2), y0, 1, h, '#2a2a30'); rect(x0, y0, w, 1, 'rgba(255,255,255,0.25)');
  }
  // Kulisse: große Produktionshalle mit Sheddach und Hallenkran hinter dem Turm
  function drawHall(min) {
    const top = 120, night = min >= 18 * 60 + 30;
    rect(0, top, W, GROUND - top, night ? '#22262e' : '#3c424e');
    for (let x = 0; x < W; x += 30) { for (let k = 0; k < 10; k++) rect(x + k * 3, top - k, 30 - k * 3, 1, night ? '#2a2e38' : '#4a5060'); rect(x + 27, top - 10, 3, 10, night ? '#ffd860' : '#a0d8ff'); }
    for (let x = 6; x < W; x += 22) rect(x, top + 10, 12, 8, night || min > 17 * 60 ? '#ffd860' : '#7090b0');
    rect(0, top + 24, W, 2, '#2a2e36'); const cr = (tick * 0.25) % (W + 40) - 20; rect(cr, top + 22, 34, 4, '#e0a020'); rect(cr + 16, top + 26, 1, 10, '#999'); rect(cr + 13, top + 36, 7, 4, '#806040');
  }
  function machine(x, y, label, st, lampOn) {
    rect(x, y - 20, 24, 20, '#5a6470'); rect(x + 2, y - 18, 20, 7, '#2a3038'); rect(x + 3, y - 17, 18, 5, st ? '#401010' : '#103020');
    text(label, x + 12, y - 9, '#fff', 6);
    rect(x + 18, y - 25, 4, 4, st ? (lampOn ? '#ff2020' : '#600000') : '#30e030');
    rect(x + 4, y - 23, 2, 3, '#888');
  }
  function drawWings(min) {
    const S = SC.S, on = Math.floor(blink / 10) % 2 === 0;
    const fault = id => !!(S && S.stations && S.stations.find(x => x.id === id && x.fault));
    const wing = (x0, w, rows) => {
      const top = GROUND - 2 * FH - 6;
      rect(x0, top, w, GROUND - top, '#4a4e58'); rect(x0 + 2, top + 2, w - 4, GROUND - top - 2, '#6a7078');
      for (let i = 0; i < Math.ceil(w / 14); i++) { const xx = x0 + i * 14; for (let k = 0; k < 6; k++) rect(xx + k * 2, top - k - 1, 14 - k * 2, 1, '#5a5a70'); rect(xx + 12, top - 7, 2, 6, '#a0d8ff'); }
      rows.forEach((row, r) => row.forEach((id, c) => { const d = SC.STATIONS.find(x => x.id === id); machine(x0 + 3 + c * 26, GROUND - 4 - r * (FH + 2), d.short, fault(id), on); }));
      rect(x0, GROUND - FH - 2, w, 2, '#3a3a3a');
    };
    wing(2, 58, [['dea', 'dec'], ['eea']]);
    wing(420, 58, [['extr', 'ster'], ['inpack', 'auspack']]);
    // Förderband zwischen Halle und Flügel rechts
    const off = Math.floor(tick / 3) % 10;
    rect(BX1, GROUND - 8, 6, 4, '#404040'); rect(56, GROUND - 8, 10, 4, '#404040');
    for (let x = 420 + off; x < 476; x += 20) rect(x, GROUND - 30, 6, 5, '#b08850');
  }
  function plant(x, y) { rect(x - 4, y - 7, 8, 7, '#a04020'); rect(x - 6, y - 15, 4, 8, '#208020'); rect(x - 2, y - 18, 4, 11, '#30a030'); rect(x + 2, y - 14, 4, 7, '#208020'); }
  function shade(hex, d) { const p = [1, 3, 5].map(i => Math.max(0, Math.min(255, parseInt(hex.substr(i, 2), 16) + d))); return '#' + p.map(v => v.toString(16).padStart(2, '0')).join(''); }

  function drawBuilding(min) {
    const topY = floorY(5);
    rect(BX0 - 4, topY - 6, BX1 - BX0 + 8, GROUND - topY + 6, '#5a5a78');
    rect(BX0 - 4, topY - 6, BX1 - BX0 + 8, 2, '#9a9ab8');
    blink += 1;
    // Sheddach (Sägezahn mit Oberlichtern)
    for (let i = 0; i < 8; i++) { const x0 = BX0 - 4 + i * 44; for (let k = 0; k < 10; k++) rect(x0 + k * 3, topY - 6 - k, 44 - k * 3, 1, '#6a6a80'); rect(x0 + 41, topY - 16, 3, 10, '#a0d8ff'); }
    // Schornstein mit Rauch
    const CX = BX1 - 34;
    rect(CX, 2, 12, topY - 8, '#8a3a2a'); for (let y = 6; y < topY - 8; y += 6) rect(CX, y, 12, 1, '#6a2a1a'); rect(CX - 2, 2, 16, 3, '#5a5a5a');
    if (tick % 9 === 0) smoke.push({ x: CX + 6, y: 0, r: 3, a: 0.7 });
    for (const p of smoke) { p.y -= 0.25; p.x += 0.35; p.r += 0.05; p.a -= 0.006; ctx.fillStyle = 'rgba(200,200,200,' + Math.max(0, p.a) + ')'; ctx.fillRect(Math.round(p.x - p.r), Math.round(p.y - p.r + 2), Math.round(p.r * 2), Math.round(p.r * 2)); }
    while (smoke.length && smoke[0].a <= 0) smoke.shift();
    // Sirene / Warnleuchte zum Schichtwechsel
    const siren = min >= 14 * 60 && min < 14 * 60 + 20;
    rect(EX - 3, topY - 26, 6, 6, siren ? ((Math.floor(blink / 8) % 2) ? '#ffee00' : '#ff8800') : '#605020');
    rect(BX0 + 20, topY - 32, 90, 14, '#101010'); text(SC.PLANT.toUpperCase(), BX0 + 65, topY - 29, '#ff8800', 9);
    rect(EX + 22, topY - 32, 70, 14, '#101010'); text('MES', EX + 57, topY - 29, '#40e0ff', 10);
    if (SC.S && SC.S.fusion) { ctx.save(); ctx.translate(BX0 + 70, topY - 40); ctx.rotate(-0.08); rect(-30, -6, 60, 10, '#303030'); text('+ ALTWERK', 0, -5, '#ffcc00', 7); ctx.restore(); }
    for (let f = 0; f < 5; f++) drawFloor(f, min);
    drawWings(min);
    for (let f = 1; f < 5; f++) rect(BX0, floorY(f), BX1 - BX0, 4, '#4a3a3a');
    rect(BX0 - 10, GROUND, BX1 - BX0 + 20, H - GROUND, '#303030');
    rect(0, GROUND + 4, W, H - GROUND, '#202020');
    // Aufzugsschacht
    rect(EX - EW / 2, floorY(5) + 4, EW, GROUND - floorY(5) - 4, '#26262e');
    rect(EX, floorY(5) + 4, 1, GROUND - floorY(5), '#555');
    for (let f = 0; f < 5; f++) { const b = floorY(f); rect(EX - EW / 2 - 2, b - 36, 2, 36, '#999'); rect(EX + EW / 2, b - 36, 2, 36, '#999'); rect(EX - EW / 2 - 2, b - 38, EW + 4, 2, '#999'); }
    const cy = floorY(lift.pos);
    rect(EX - EW / 2 + 1, cy - 35, EW - 2, 35, '#b09040');
    rect(EX - EW / 2 + 3, cy - 33, EW - 6, 31, '#e0d090');
    rect(EX - EW / 2 + 1, cy - 35, EW - 2, 2, '#705010');
    // Etagenanzeige über dem Aufzug im EG
    text(String(Math.round(lift.pos) === 0 ? 'EG' : Math.round(lift.pos)), EX, floorY(0) - 46, '#ff4040', 7);
  }

  function updateBubble(dt) {
    if (SC.S && SC.S.pending) { bub.n = null; return; }
    if (bub.ttl > 0) { bub.ttl -= dt; if (bub.ttl <= 0) bub.n = null; return; }
    bub.next -= dt; if (bub.next > 0) return;
    bub.next = 6 + Math.random() * 8;
    const here = npcs.filter(n => n.f === P.f && SC.BUBBLES && SC.BUBBLES[n.role]);
    const pool = here.length && Math.random() < 0.7 ? here : npcs.filter(n => SC.BUBBLES && SC.BUBBLES[n.role]);
    if (!pool.length) return;
    const n = pool[Math.floor(Math.random() * pool.length)], L = partyDay() && SC.PARTY_BUBBLES && SC.PARTY_BUBBLES[n.role] && Math.random() < 0.6 ? SC.PARTY_BUBBLES[n.role] : SC.BUBBLES[n.role];
    bub.n = n; bub.t = L[Math.floor(Math.random() * L.length)]; bub.ttl = 3;
  }
  function drawBubble() {
    const n = bub.n; if (!n || !bub.t) return;
    ctx.font = 'bold 6px monospace';
    const w = Math.ceil(ctx.measureText(bub.t).width) + 6, h = 10;
    const x = Math.round(Math.max(BX0 + 2, Math.min(BX1 - w - 2, n.x - w / 2))), y = Math.round(floorY(n.f) - 38);
    rect(x - 1, y - 1, w + 2, h + 2, '#000'); rect(x, y, w, h, '#fffbe8');
    rect(Math.round(n.x) - 1, y + h, 3, 2, '#fffbe8'); rect(Math.round(n.x), y + h + 2, 1, 2, '#fffbe8');
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = '#202020'; ctx.fillText(bub.t, x + 3, y + 2);
  }
  function updateNpcs(dt) {
    tick++;
    updateBubble(dt);
    npcs.forEach(n => {
      if (n.idle) { n.moving = false; return; }
      if (n.target !== undefined) { const d = n.target - n.x; if (Math.abs(d) < 2) { n.moving = false; n.dir = P.x > n.x ? 1 : -1; return; } n.x += Math.sign(d) * 50 * dt; n.dir = Math.sign(d); n.moving = true; n.anim = (n.anim || 0) + dt * 8; return; }
      if (n.wait > 0) { n.wait -= dt; n.moving = false; return; }
      n.x += n.dir * 30 * dt; n.moving = true; n.anim = (n.anim || 0) + dt * 8;
      if (n.x < BX0 + 30 || n.x > BX1 - 30 || (Math.abs(n.x - EX) < 18 && Math.random() < 0.02)) { n.dir *= -1; n.wait = 0.5 + Math.random() * 2; n.x = Math.max(BX0 + 30, Math.min(BX1 - 30, n.x)); }
    });
  }

  function moveLift(f, dt) {
    const d = f - lift.pos, sp = 1.4 * dt;
    if (Math.abs(d) <= sp) { lift.pos = f; return true; }
    lift.pos += Math.sign(d) * sp; return false;
  }

  const B = {
    W, H,
    init(canvas) { cv = canvas; ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; },
    reset() { P.x = 190; P.f = 0; P.queue = []; P.visible = true; P.inLift = false; lift.pos = 0; B.dismiss(); },
    // Besuch: die Figur kommt zu Christian auf die Etage (Dialog läuft in ui.js)
    summon(id) {
      const p = SC.S && SC.S.pending;
      const roles = id === 'tesla' ? (p && p.duo ? ['tesla', 'nix'] : ['tesla']) : id === 'italien' ? ['italien'] : id === 'itchefin' ? ['itchefin'] : [];
      if (id === 'flur' && p && SC.FLUR[p.k] && SC.FLUR[p.k].role) roles.push(SC.FLUR[p.k].role);
      roles.forEach((r, i) => { const n = npcs.find(q => q.role === r); if (!n) return; n.f = P.f; n.idle = false; const side = P.x > 300 ? -1 : 1; n.x = P.x + side * 60; n.target = P.x + side * (14 + i * 10); });
    },
    dismiss() { npcs = NPC0.map(n => Object.assign({ wait: 0, home: n.f, hx: n.x }, n)); },
    busy() { const st = P.queue[0]; return !!st && (st.t === 'call' || st.t === 'ride'); },
    walking() { return P.queue.length > 0; },
    showPlayer() { P.visible = true; },
    goTo(f, x, room) {
      if (B.busy()) { // im Aufzug: Ziel nach der Fahrt anhängen
        const ride = P.queue.findIndex(s => s.t === 'ride');
        P.queue = P.queue.slice(0, ride + 1);
        if (P.queue[ride].f !== f) P.queue.push({ t: 'walk', x: EX }, { t: 'call' }, { t: 'ride', f });
      } else {
        P.queue = [];
        if (f !== P.f) P.queue.push({ t: 'walk', x: EX }, { t: 'call' }, { t: 'ride', f });
      }
      P.queue.push({ t: 'walk', x });
      if (room) P.queue.push({ t: 'enter', room });
      P.visible = true;
    },
    update(dt, onEnter) {
      P.moving = false;
      const st = P.queue[0];
      if (st) {
        if (st.t === 'walk') {
          const d = st.x - P.x, sp = 80 * dt;
          if (Math.abs(d) <= sp) { P.x = st.x; P.queue.shift(); } else { P.x += Math.sign(d) * sp; P.dir = Math.sign(d); P.moving = true; }
        } else if (st.t === 'call') { if (moveLift(P.f, dt)) P.queue.shift(); }
        else if (st.t === 'ride') { P.inLift = true; if (moveLift(st.f, dt)) { P.f = st.f; P.inLift = false; P.queue.shift(); } }
        else if (st.t === 'enter') { P.queue.shift(); P.visible = false; if (onEnter) onEnter(st.room); }
      }
      if (P.moving) P.anim += dt * 10;
      updateNpcs(dt);
    },
    draw(min) {
      drawSky(min);
      drawHall(min);
      drawBuilding(min);
      npcs.forEach(n => drawMan(n.x, floorY(n.f), n.col, n.anim || 0, n.moving, n.dir, false, n.role));
      drawBubble();
      if (P.visible) {
        const y = P.inLift ? floorY(lift.pos) : floorY(P.f);
        drawMan(P.x, y, SC.PLAYER.col, P.anim, P.moving, P.dir, true);
        if (!P.inLift) { rect(P.x - 1, y - 30, 3, 3, '#ffcc00'); }
      }
    },
    // Koordinaten im Canvas (logisch) zu Tür
    pick(lx, ly) {
      const f = Math.floor((GROUND - ly) / FH);
      if (f < 0 || f > 4) return null;
      const bot = floorY(f);
      for (const d of SC.FLOORS[f].doors) if (lx >= d.x - 26 && lx <= d.x + 26 && ly >= bot - 44 && ly <= bot) return { f, d };
      return null;
    },
    // Easter Egg: Klick auf den Schornstein
    chimney(lx, ly) { const CX = BX1 - 34; return lx >= CX - 2 && lx <= CX + 14 && ly >= 0 && ly <= floorY(5) - 6; },
    bubble: () => (bub.n ? { role: bub.n.role, t: bub.t } : null),
    floorAt(ly) { const f = Math.floor((GROUND - ly) / FH); return f >= 0 && f <= 4 ? f : null; },
    setHover(h) { hover = h; },
    toLogical(ev) { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * W / r.width, (ev.clientY - r.top) * H / r.height]; },
    player: P
  };
  SC.building = B;
})(window.SC);

// MES-Marathon: prozedurale Musik, Jingles und Fabriklärm (Web Audio API). Eigene Kompositionen, keine fremden Melodien oder Samples.
'use strict';
(function (SC) {
  const KEY = 'mesmarathon-audio';
  const A = SC.audio = {
    ready: false, muted: false, volume: 0.5, _ctx: null, _master: null, _comp: null,
    _timer: null, _track: null, _nextNote: 0, _step: 0, _voices: [], _duckUntil: 0
  };

  // Eigene Motive (MIDI-Noten, 0 = Pause). Entstehung 19.10.2026, Dur-/Moll-Pentatonik, frei erfunden.
  // title: C-Dur-Pentatonik, Motiv C–E–A–G (aufsteigend dann fallend), 8 Takte @ 92 BPM
  // tower: F-Dur-Ostinato Bass F–C–A–C, Lead sparsamer Sprung, 8 Takte @ 108 BPM
  // evening: D-Moll-ähnlich, steigende Spannung D–F–A–Bb, 6 Takte @ 120 BPM
  // balance: A-Moll-Pentatonik, ruhig A–C–E–D, 4 Takte @ 80 BPM
  const TRACKS = {
    title: {
      bpm: 92, bars: 8,
      lead: [
        [60, 2], [64, 2], [69, 2], [67, 2], [64, 2], [62, 2], [60, 4],
        [67, 2], [69, 2], [72, 2], [69, 2], [67, 2], [64, 2], [60, 4],
        [64, 2], [67, 2], [69, 4], [67, 2], [64, 2], [62, 2], [60, 2],
        [0, 2], [60, 2], [64, 2], [67, 2], [69, 2], [67, 2], [64, 4],
        [60, 2], [64, 2], [69, 2], [67, 2], [72, 4], [69, 2], [67, 2],
        [64, 2], [62, 2], [60, 4], [0, 2], [57, 2], [60, 2], [64, 2],
        [67, 2], [64, 2], [60, 2], [62, 2], [64, 4], [60, 4],
        [69, 2], [67, 2], [64, 2], [62, 2], [60, 8],
      ],
      bass: [
        [48, 4], [48, 4], [53, 4], [48, 4],
        [45, 4], [48, 4], [50, 4], [48, 4],
        [48, 4], [53, 4], [55, 4], [53, 4],
        [48, 4], [45, 4], [48, 4], [43, 4],
        [48, 4], [48, 4], [53, 4], [48, 4],
        [45, 4], [48, 4], [50, 4], [48, 4],
        [48, 4], [53, 4], [55, 4], [53, 4],
        [48, 4], [50, 4], [48, 8],
      ],
      perc: 'k.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hh'
    },
    tower: {
      bpm: 108, bars: 8,
      lead: [
        [0, 8], [65, 2], [69, 2], [72, 2], [69, 2],
        [0, 8], [67, 2], [65, 2], [64, 2], [65, 2],
        [0, 8], [72, 2], [69, 2], [65, 2], [62, 2],
        [0, 8], [65, 2], [67, 2], [69, 4],
        [0, 8], [69, 2], [72, 2], [74, 2], [72, 2],
        [0, 8], [69, 2], [65, 2], [64, 4],
        [65, 4], [0, 4], [60, 4], [0, 4],
        [0, 16],
      ],
      bass: [
        [41, 2], [48, 2], [45, 2], [48, 2], [41, 2], [48, 2], [45, 2], [48, 2],
        [41, 2], [48, 2], [45, 2], [48, 2], [43, 2], [50, 2], [47, 2], [50, 2],
        [41, 2], [48, 2], [45, 2], [48, 2], [41, 2], [48, 2], [45, 2], [48, 2],
        [38, 2], [45, 2], [41, 2], [45, 2], [41, 2], [48, 2], [45, 2], [48, 2],
        [41, 2], [48, 2], [45, 2], [48, 2], [41, 2], [48, 2], [45, 2], [48, 2],
        [41, 2], [48, 2], [45, 2], [48, 2], [43, 2], [50, 2], [47, 2], [50, 2],
        [41, 2], [48, 2], [45, 2], [48, 2], [41, 2], [48, 2], [45, 2], [48, 2],
        [36, 2], [43, 2], [41, 2], [48, 2], [41, 4], [0, 4],
      ],
      perc: 'k.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hhk.h.h.h.k.h.s.hh'
    },
    evening: {
      bpm: 120, bars: 6,
      lead: [
        [62, 2], [65, 2], [69, 2], [70, 2], [69, 2], [65, 2], [62, 4],
        [65, 2], [69, 2], [74, 2], [70, 2], [69, 4], [65, 4],
        [62, 2], [65, 2], [69, 2], [74, 2], [77, 4], [74, 2], [70, 2],
        [69, 2], [65, 2], [62, 2], [65, 2], [69, 4], [0, 4],
        [70, 2], [69, 2], [65, 2], [62, 2], [65, 2], [69, 2], [70, 4],
        [74, 2], [70, 2], [69, 2], [65, 2], [62, 8],
      ],
      bass: [
        [50, 4], [50, 4], [53, 4], [50, 4],
        [48, 4], [50, 4], [53, 4], [55, 4],
        [50, 4], [53, 4], [55, 4], [53, 4],
        [50, 4], [48, 4], [50, 4], [46, 4],
        [50, 4], [53, 4], [55, 4], [58, 4],
        [55, 4], [53, 4], [50, 8],
      ],
      perc: 'k.s.k.s.k.s.k.ssk.s.k.s.k.s.k.ssk.s.k.s.k.s.k.ssk.s.k.s.k.s.k.ssk.s.k.s.k.s.k.ssk.s.k.s.k...s...'
    },
    balance: {
      bpm: 80, bars: 4,
      lead: [
        [69, 4], [72, 4], [76, 4], [74, 4],
        [72, 4], [69, 4], [67, 4], [69, 4],
        [72, 4], [76, 4], [79, 4], [76, 4],
        [74, 4], [72, 4], [69, 8],
      ],
      bass: [
        [45, 8], [48, 8],
        [40, 8], [45, 8],
        [45, 8], [48, 8],
        [43, 8], [45, 8],
      ],
      perc: ''
    }
  };
  A.TRACKS = TRACKS;

  const JINGLES = {
    door: [[67, 0.08], [72, 0.12]],
    buy: [[76, 0.05], [83, 0.07], [88, 0.09], [93, 0.08]],
    spotOk: [[60, 0.08], [64, 0.08], [67, 0.14]],
    spotFail: [[62, 0.12], [55, 0.18]],
    win: [[60, 0.12], [64, 0.12], [67, 0.12], [72, 0.18], [67, 0.1], [72, 0.35]],
    lose: [[64, 0.2], [62, 0.2], [60, 0.25], [57, 0.3], [53, 0.45]],
    visit: [[72, 0.1], [67, 0.18]],
    alarm: [[81, 0.08], [0, 0.05], [81, 0.08], [0, 0.05], [81, 0.12]]
  };
  A.JINGLES = JINGLES;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      if (typeof o.muted === 'boolean') A.muted = o.muted;
      if (Number.isFinite(o.volume)) A.volume = Math.max(0, Math.min(1, o.volume));
    } catch (e) { /* ignore */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ muted: A.muted, volume: A.volume })); } catch (e) { /* ignore */ }
  }
  function freq(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function ensureCtx() {
    if (A._ctx) return A._ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = A.muted ? 0 : A.volume * 0.22;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3;
    comp.attack.value = 0.01; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ctx.destination);
    A._ctx = ctx; A._master = master; A._comp = comp;
    ctx.onstatechange = () => { if (A.onState) try { A.onState(ctx.state); } catch (e) { /* */ } };
    return ctx;
  }

  function setMasterGain() {
    if (!A._master) return;
    const v = A.muted ? 0 : A.volume * 0.22;
    const t = A._ctx.currentTime;
    A._master.gain.cancelScheduledValues(t);
    A._master.gain.setValueAtTime(A._master.gain.value, t);
    A._master.gain.linearRampToValueAtTime(v, t + 0.05);
  }

  function tone(note, when, dur, type, gain) {
    if (!note || !A._ctx || A.muted) return;
    const ctx = A._ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq(note), when);
    const peak = (gain || 0.12) * (when < A._duckUntil ? 0.7 : 1);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(peak, when + 0.008);
    g.gain.setValueAtTime(peak, when + Math.max(0.01, dur - 0.05));
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(A._master);
    o.start(when); o.stop(when + dur + 0.02);
    o.onended = () => {
      try { o.disconnect(); g.disconnect(); } catch (e) { /* */ }
      const i = A._voices.indexOf(o); if (i >= 0) A._voices.splice(i, 1);
    };
    A._voices.push(o);
  }

  function noiseHit(when, dur, gain) {
    if (!A._ctx || A.muted) return;
    const ctx = A._ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(gain || 0.08, when);
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    src.connect(g); g.connect(A._master);
    src.start(when); src.stop(when + dur + 0.01);
  }

  function kick(when) {
    if (!A._ctx || A.muted) return;
    const ctx = A._ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, when);
    o.frequency.exponentialRampToValueAtTime(40, when + 0.12);
    g.gain.setValueAtTime(0.18, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.15);
    o.connect(g); g.connect(A._master);
    o.start(when); o.stop(when + 0.16);
  }

  function thump(when, level) {
    if (!A._ctx || A.muted) return;
    const ctx = A._ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(70, when); o.frequency.exponentialRampToValueAtTime(30, when + 0.09);
    g.gain.setValueAtTime(0.05 * level, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);
    o.connect(g); g.connect(A._master); o.start(when); o.stop(when + 0.13);
    noiseHit(when + 0.01, 0.05, 0.025 * level);
  }
  // Fabrik-Grundrauschen: gefiltertes Rauschen plus tiefes Brummen, Lautstärke je nach Raum
  A._amb = 0;
  function ensureAmbient() {
    if (A._ambNodes || !A._ctx) return;
    const ctx = A._ctx, len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const g = ctx.createGain(); g.gain.value = 0;
    const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 55; const hg = ctx.createGain(); hg.gain.value = 0;
    src.connect(lp); lp.connect(g); g.connect(A._master); hum.connect(hg); hg.connect(A._master);
    src.start(); hum.start();
    A._ambNodes = { g, hg };
  }
  A.ambient = function (level) {
    A._amb = Math.max(0, Math.min(1, level || 0));
    if (!A.ready || !A._ctx) return;
    if (A.muted && A._amb > 0) return;
    ensureAmbient();
    const t = A._ctx.currentTime, n = A._ambNodes;
    n.g.gain.cancelScheduledValues(t); n.g.gain.linearRampToValueAtTime(0.3 * A._amb, t + 0.4);
    n.hg.gain.cancelScheduledValues(t); n.hg.gain.linearRampToValueAtTime(0.12 * A._amb, t + 0.4);
  };
  A.zone = function (room) {
    const loud = { halle: 1, werkstatt: 0.9, schicht: 0.7, pforte: 0.6 }, quiet = { buero: 0.25, meeting: 0.2, chef: 0.15, controlling: 0.15, it: 0.25, leitstand: 0.3 };
    A.ambient(A._track !== 'tower' ? 0 : room == null ? 0.5 : (loud[room] || quiet[room] || 0.45));
  };
  // Schichtwechsel-Sirene: Sägezahn auf und ab
  A.siren = function () {
    if (!A.ready || A.muted || !A._ctx) return;
    const ctx = A._ctx, t = ctx.currentTime + 0.02, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(440, t); o.frequency.linearRampToValueAtTime(680, t + 1.2); o.frequency.linearRampToValueAtTime(440, t + 2.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.2); g.gain.setValueAtTime(0.07, t + 2.1); g.gain.linearRampToValueAtTime(0.0001, t + 2.4);
    o.connect(g); g.connect(A._master); o.start(t); o.stop(t + 2.5);
    A._duckUntil = t + 2.4;
  };
  function expandNotes(arr) {
    const out = [];
    let step = 0;
    for (const [n, len] of arr) {
      out.push({ step, n, len });
      step += len;
    }
    return out;
  }

  function schedule() {
    if (!A._ctx || !A._track || A.muted) return;
    const tr = TRACKS[A._track];
    if (!tr) return;
    const ctx = A._ctx;
    const stepSec = 60 / tr.bpm / 4;
    const total = tr.bars * 16;
    const horizon = ctx.currentTime + 0.12;
    const lead = expandNotes(tr.lead);
    const bass = expandNotes(tr.bass);
    while (A._nextNote < horizon) {
      const st = A._step % total;
      const when = A._nextNote;
      for (const x of lead) if (x.step === st && x.n) tone(x.n, when, x.len * stepSec * 0.92, 'square', 0.09);
      for (const x of bass) if (x.step === st && x.n) tone(x.n, when, x.len * stepSec * 0.95, 'triangle', 0.11);
      if (A._amb > 0 && A._track === 'tower' && st % 8 === 4) thump(when, A._amb); // Presse in der Halle
      if (tr.perc && tr.perc.length) {
        const ch = tr.perc[st % tr.perc.length];
        if (ch === 'k') kick(when);
        else if (ch === 's') noiseHit(when, 0.06, 0.1);
        else if (ch === 'h') noiseHit(when, 0.03, 0.035);
      }
      A._step++;
      A._nextNote += stepSec;
    }
  }

  function startScheduler() {
    if (A._timer) return;
    A._timer = setInterval(schedule, 25);
  }
  function stopScheduler() {
    if (A._timer) { clearInterval(A._timer); A._timer = null; }
  }
  function killVoices() {
    const t = A._ctx ? A._ctx.currentTime : 0;
    A._voices.forEach(o => { try { o.stop(t + 0.05); } catch (e) { /* */ } });
    A._voices = [];
  }

  // v0.4 Handy-Ton: iOS spielt Web Audio in der Audio-Session »ambient« ab, die der Stummschalter stummschaltet.
  // Ein stummes, geloopt laufendes <audio>-Element (und navigator.audioSession, wo vorhanden) schaltet auf »playback«.
  function silentWav() {
    const n = 800, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, t) => { for (let i = 0; i < t.length; i++) b[o + i] = t.charCodeAt(i); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) b[44 + i] = 128;
    let str = ''; for (let i = 0; i < b.length; i++) str += String.fromCharCode(b[i]);
    return 'data:audio/wav;base64,' + btoa(str);
  }
  function sessionPlayback() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* */ }
    try {
      if (!A._el) { const el = document.createElement('audio'); el.src = silentWav(); el.loop = true; el.setAttribute('playsinline', ''); el.setAttribute('webkit-playsinline', ''); el.preload = 'auto'; A._el = el; }
      if (A._el.paused && !A.muted) { const pr = A._el.play(); if (pr && pr.catch) pr.catch(() => { /* ohne Geste: beim nächsten Tippen */ }); }
    } catch (e) { /* */ }
  }
  A.isIOS = () => { try { return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); } catch (e) { return false; } };
  A.unlock = function () {
    load();
    const ctx = ensureCtx();
    if (!ctx) return;
    // in der Nutzer-Geste: resume() und ein 1-Sample-Puffer (ältere WebKit-Versionen entsperren erst damit)
    if (ctx.state !== 'running') { try { const pr = ctx.resume(); if (pr && pr.catch) pr.catch(() => { /* */ }); } catch (e) { /* */ } }
    if (!A._kicked) { try { const src = ctx.createBufferSource(); src.buffer = ctx.createBuffer(1, 1, 22050); src.connect(ctx.destination); src.start(0); A._kicked = true; } catch (e) { /* */ } }
    sessionPlayback();
    if (!A.ready && A.onFirstUnlock) { try { A.onFirstUnlock(); } catch (e) { /* */ } }
    A.ready = true;
    setMasterGain();
    if (A._pending) { const id = A._pending; A._pending = null; A.play(id); }
  };

  A.play = function (id) {
    if (!TRACKS[id]) return;
    if (!A.ready) { A._pending = id; return; }
    if (A._track === id) return;
    killVoices();
    A._track = id;
    if (A.zone) A.zone(id === 'tower' ? undefined : null);
    A._step = 0;
    A._nextNote = A._ctx.currentTime + 0.05;
    startScheduler();
    schedule();
  };

  A.stop = function () {
    A._track = null;
    stopScheduler();
    killVoices();
  };

  A.jingle = function (id) {
    if (id === 'siren') return A.siren();
    if (!A.ready || A.muted || !A._ctx) return;
    const seq = JINGLES[id];
    if (!seq) return;
    const ctx = A._ctx;
    let t = ctx.currentTime + 0.02;
    A._duckUntil = t + seq.reduce((a, x) => a + x[1], 0) + 0.1;
    const type = (id === 'spotFail' || id === 'lose') ? 'triangle' : 'square';
    const g = id === 'win' || id === 'lose' ? 0.16 : 0.14;
    for (const [n, d] of seq) {
      tone(n, t, d, type, g);
      t += d;
    }
  };

  A.setMuted = function (m) {
    A.muted = !!m;
    setMasterGain();
    save();
    if (A._el) { try { if (A.muted) A._el.pause(); else sessionPlayback(); } catch (e) { /* */ } }
    if (A.muted) { stopScheduler(); killVoices(); if (A._ambNodes) { A._ambNodes.g.gain.value = 0; A._ambNodes.hg.gain.value = 0; } }
    else if (A._amb > 0) A.ambient(A._amb);
    else if (A._track && A.ready) { A._nextNote = A._ctx.currentTime + 0.05; startScheduler(); }
  };
  A.isMuted = () => A.muted;
  A.setVolume = function (v) {
    A.volume = Math.max(0, Math.min(1, Number(v) || 0));
    setMasterGain();
    save();
  };
  A.getVolume = () => A.volume;
  A.state = () => ({ muted: A.muted, volume: A.volume, ready: A.ready, track: A._track, ctx: A._ctx ? A._ctx.state : 'none', el: A._el ? !A._el.paused : false });

  A.init = function () {
    load();
    // Jede echte Berührung, jeder Klick und jede Taste entsperrt den Ton (erneut), solange der AudioContext nicht läuft:
    // nach Tab-Wechsel, Anruf oder Sperrbildschirm bleibt er auf iOS sonst »suspended« oder »interrupted«.
    const gesture = () => { if (A.muted && A._ctx) return; if (!A._ctx || A._ctx.state !== 'running' || (A._el && A._el.paused && !A.muted)) A.unlock(); };
    ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, gesture, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', () => {
      if (!A._ctx) return;
      if (document.hidden) { A._ctx.suspend(); if (A._el) try { A._el.pause(); } catch (e) { /* */ } }
      else if (A.ready && !A.muted) { const pr = A._ctx.resume(); if (pr && pr.catch) pr.catch(() => { /* nächste Geste */ }); sessionPlayback(); }
    });
    window.addEventListener('pageshow', () => { if (A._ctx && A.ready && !A.muted && A._ctx.state !== 'running') { const pr = A._ctx.resume(); if (pr && pr.catch) pr.catch(() => { /* */ }); } });
  };

  // Hilfsfunktion für Tests ohne AudioContext
  A._validateTracks = function () {
    const issues = [];
    for (const id of Object.keys(TRACKS)) {
      const tr = TRACKS[id];
      const need = tr.bars * 16;
      const sum = arr => arr.reduce((a, x) => a + x[1], 0);
      if (sum(tr.lead) !== need) issues.push(id + ' lead ' + sum(tr.lead) + '≠' + need);
      if (sum(tr.bass) !== need) issues.push(id + ' bass ' + sum(tr.bass) + '≠' + need);
      for (const [n, l] of tr.lead.concat(tr.bass)) {
        if (!Number.isInteger(n) || !Number.isInteger(l) || l < 1) issues.push(id + ' bad note');
        if (n !== 0 && (n < 24 || n > 96)) issues.push(id + ' note out of range ' + n);
      }
      if (tr.perc) {
        if (tr.perc.length !== need) issues.push(id + ' perc ' + tr.perc.length + '≠' + need);
        if (/[^ksh.]/.test(tr.perc)) issues.push(id + ' bad perc char');
      }
    }
    return issues;
  };
})(window.SC = window.SC || {});

// GoatCounter-Vorbereitung: eingefrorene Kopie, nur Pfade, keine Ereignisse, kein Zähler aus dem Spielcode.
// Aufruf: node test/goatcounter.test.js
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..'), VEND = path.join(root, 'vendor', 'goatcounter-count.js');
const ORIG_SHA256 = '9e4391f5c18cb24de433b6ef31d8b1f1c85ee41c6f0ad274b28664168063725a';
let n = 0; const t = (name, f) => { f(); n++; console.log('ok', name); };
const src = fs.readFileSync(VEND, 'utf8');

t('Kopie entspricht count.v5.js plus drei markierten Änderungen (SHA-256 des Originals)', () => {
  const marker = '// ---- Ende MES-Marathon-Kopf ----\n'; assert.ok(src.includes(marker)); let body = src.slice(src.indexOf(marker) + marker.length);
  const back = [["\t\t\tq: '',  // MES-Marathon: kein Query-String senden (leer wird nicht übertragen)\n", '\t\t\tq: location.search,\n'],
    ['\t\tif (is_empty(data.r)) data.r = document.referrer.split(/[?#]/)[0]  // MES-Marathon: Referrer ohne Query und Fragment\n', '\t\tif (is_empty(data.r)) data.r = document.referrer\n'],
    ["\t\treturn loc.pathname || '/'  // MES-Marathon: nur der Pfad, ohne Query-String\n", "\t\treturn (loc.pathname + loc.search) || '/'\n"]];
  for (const [a, b] of back) { assert.strictEqual(body.split(a).length, 2, a); body = body.replace(a, b); }
  assert.strictEqual(crypto.createHash('sha256').update(body).digest('hex'), ORIG_SHA256);
  assert.strictEqual((src.slice(src.indexOf(marker)).match(/MES-Marathon:/g) || []).length, 3); // genau drei Änderungen im Code
});

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tags = html.match(/<script[^>]*data-goatcounter[^>]*><\/script>/g) || [];
t('index.html: genau ein GoatCounter-Tag, async, lokale Kopie, Platzhalter oder echter Name, keine Ereignisse', () => {
  assert.strictEqual(tags.length, 1); const g = tags[0];
  assert.ok(/\sasync[\s>]/.test(g)); assert.ok(/src="vendor\/goatcounter-count\.js"/.test(g)); assert.ok(!/gc\.zgo\.at|zgo\.at/.test(html));
  const ep = g.match(/data-goatcounter="([^"]+)"/)[1]; assert.ok(/^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/i.test(ep), ep);
  const set = JSON.parse(g.match(/data-goatcounter-settings='([^']+)'/)[1]); assert.strictEqual(set.allow_local, false); assert.strictEqual(set.allow_frame, false); assert.strictEqual(set.no_events, true); assert.ok(!('path' in set) && !('referrer' in set) && !('event' in set));
  assert.ok(!/data-goatcounter-click/.test(html));
});

t('Spielcode ruft GoatCounter nie auf, keine Zugangsdaten im Repo', () => {
  for (const f of fs.readdirSync(path.join(root, 'js'))) assert.ok(!/goatcounter/i.test(fs.readFileSync(path.join(root, 'js', f), 'utf8')), f);
  for (const f of ['index.html', 'vendor/goatcounter-count.js', 'docs/GOATCOUNTER.md']) { const x = fs.readFileSync(path.join(root, f), 'utf8'); assert.ok(!/api[_-]?key|api\/v0|Authorization|Bearer\s|token\s*[:=]/i.test(x), f); }
});

// Die Kopie in einer kleinen Nachbildung des Browsers laufen lassen und mitschneiden, was sie senden würde
function run({ search = '', hash = '', ref = '', skip = false, host = 'topsentopsen.github.io', proto = 'https:' } = {}) {
  const sent = [], alerts = [], store = skip ? { skipgc: 't' } : {};
  const ds = { goatcounter: tags[0].match(/data-goatcounter="([^"]+)"/)[1], goatcounterSettings: tags[0].match(/data-goatcounter-settings='([^']+)'/)[1] };
  const location = { pathname: '/mes-marathon/', search, hash, hostname: host, protocol: proto, toString() { return 'https://' + host + '/mes-marathon/' + search + hash; } };
  const window = { screen: { width: 390, height: 844 }, devicePixelRatio: 3 };
  const document = { body: {}, referrer: ref, title: 'MES-Marathon', visibilityState: 'visible', querySelector: q => q.startsWith('script[data-goatcounter]') ? { dataset: ds } : null, querySelectorAll: () => [], addEventListener() {} };
  const ctx = { window, document, location, parent: { location }, navigator: { sendBeacon: u => { sent.push(u); return true; } }, console: { warn() {}, error() {}, log() {} }, alert: m => alerts.push(m),
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } }, encodeURIComponent };
  ctx.window.goatcounter = undefined; ctx.goatcounter = undefined; vm.createContext(ctx); ctx.window = ctx; Object.assign(ctx, { screen: window.screen, devicePixelRatio: 3 });
  vm.runInContext(src, ctx); return { sent, alerts, store };
}

t('A2: gesendet wird nur der Pfad, kein Query-String, kein Fragment, Referrer ohne Query', () => {
  const r = run({ search: '?name=x&utm_source=y', hash: '#abc', ref: 'https://example.org/seite?geheim=1#x' }); assert.strictEqual(r.sent.length, 1);
  const u = new URL(r.sent[0]); assert.strictEqual((u.origin + u.pathname).toLowerCase(), tags[0].match(/data-goatcounter="([^"]+)"/)[1].toLowerCase());
  assert.strictEqual(u.searchParams.get('p'), '/mes-marathon/'); assert.strictEqual(u.searchParams.get('q'), null); assert.strictEqual(u.searchParams.get('r'), 'https://example.org/seite');
  assert.ok(!/name|utm_|geheim|abc/.test(decodeURIComponent(r.sent[0])), r.sent[0]); assert.strictEqual(u.searchParams.get('e'), null);
});

t('Eigenes Gerät: #toggle-goatcounter setzt den Ausschluss, danach wird nichts gesendet; erneut aufrufen hebt ihn auf', () => {
  const a = run({ hash: '#toggle-goatcounter' }); assert.strictEqual(a.store.skipgc, 't'); assert.strictEqual(a.sent.length, 0); assert.strictEqual(a.alerts.length, 1);
  assert.strictEqual(run({ skip: true }).sent.length, 0);
  const b = run({ hash: '#toggle-goatcounter', skip: true }); assert.ok(!('skipgc' in b.store)); assert.strictEqual(b.sent.length, 1);
});

t('Lokal (localhost, file) wird nie gesendet', () => { assert.strictEqual(run({ host: 'localhost' }).sent.length, 0); assert.strictEqual(run({ host: '', proto: 'file:' }).sent.length, 0); assert.strictEqual(run({ host: '192.168.1.5' }).sent.length, 0); });

console.log(n + ' GoatCounter-Tests ok');

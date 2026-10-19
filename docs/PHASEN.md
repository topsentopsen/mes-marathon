# MES-Marathon – Umsetzungsplan v0.2.0

> **Historisch (Planung v0.2.0).** Zahlen und Uhrzeiten haben sich seither geändert (z. B. SAP-Kick-off 11:00). Maßgeblich ist `js/data.js`.

Grundlage: `docs/KONZEPT.md` (Kapitelverweise „K x“). Ziel: an einem Abend umsetzbar, **ca. 600–900 geänderte Zeilen**, auf der vorhandenen Struktur (`js/data.js`, `sim.js`, `building.js`, `ui.js`, `audio.js`, `tools/bot.js`, `test/`).

Arbeitsregeln:
- Nach **jeder Phase** `node test/sim.test.js` (alle grün) und `node tools/bot.js 100` (läuft ohne Absturz), dann committen.
- Priorität **P1** = Pflicht, **P2** = streichen, wenn die Zeit knapp wird (Streichliste am Ende).
- Alle Zahlen sind Startwerte. Feinjustierung nur in Phase 10 über die Hebel in `data.js`.
- Save-Version: `SC.VERSION = '0.2.0'` (alte Spielstände werden dadurch verworfen, `load()` prüft `s.v`).

Zeilenbudget (Summe ca. 850):

| Phase | Inhalt | Zeilen |
|---|---|---|
| 1 | Namen/Rollen | 60 |
| 2 | Daten (Stationen, Etagen, Räume, Texte) | 110 |
| 3 | Sim-Kern: Stationen, Budget, Meeting-Balance, Sirene | 150 |
| 4 | Besucher-Ereignisse | 90 |
| 5 | KPIs und Reporting | 60 |
| 6 | Großereignisse | 70 |
| 7 | UI | 120 |
| 8 | Grafik (Fabrik, Figuren) | 100 |
| 9 | Ton | 40 |
| 10 | Bot, Tests, Balance | 100 |

---

## Phase 1 – Namen und Rollen (P1, ca. 60 Zeilen)

Zuerst, weil alle weiteren Phasen die neuen Bezeichner nutzen. Reine Umbenennung, Verhalten unverändert.

1. `js/data.js`
   - `SC.VERSION = '0.2.0'`.
   - `SC.PLAYER = { name: 'Christian', col: '#8cb8e8' }`.
   - `SC.RIVALS`: `{ name: 'Werk Nord', col: '#ff6040', min: 3, max: 7.5 }`, `{ name: 'Werk Süd', col: '#40d070', min: 3.5, max: 7 }` (Feld `plant` entfällt; `sim.js`/`ui.js` nutzen nur `name`).
   - `SC.ROOMS.*.who`: „der Pförtner“, „der Schichtleiter“, „die Kantinenkraft“, „die Werkleitung“, Drucker „der Drucker“.
   - `SC.USELESS`/`TIPS`/`USEFUL`: Namen raus („Frau ‹alter Name›:“ → „Kantinenkraft:“, „‹alter Name›“ → „Schichtleiter“).
2. `js/sim.js`
   - `S.‹alter Name›` → `S.schicht`; Meeting-`kind: '‹alter Name›'` → `'schicht'`; Aktions-ID `'‹alter Name›'` → `'schichtgespraech'`; alle `say(...)`-Texte ohne Namen („Der Schichtleiter ist beleidigt“, „Die Werkleitung: …“, `r.name + ' ist live gegangen'`).
   - `S.name`/`newGame(seed, name)`: Name immer `SC.PLAYER.name` (Parameter bleibt für Tests akzeptiert, wird ignoriert).
   - Ergebnistexte: „Werk Nord übernimmt“ statt ‹alter Name›.
3. `js/ui.js`
   - HUD: „Chefin“ → „Werkleitung“, „‹alter Name›“ → „Schichtleiter“; alte Sprechfunktion → `schichtSays`, `chefSays` ohne „Dr. ‹alter Name›“ („Die Werkleitung: »…«“); Rivalen-Tabelle zeigt nur `name`.
   - Titelbild: Eingabefeld `#pname` entfällt (`index.html` mitändern), `UI.newGame` nutzt `SC.PLAYER.name`.
   - Hilfetext ohne Namen.
4. `index.html`: `id="hud-‹alter Name›"` → `hud-schicht`, evtl. Titel/Meta-Texte prüfen. `README.md` und `tools/bot.js` (`/Werksleitung zieht/`-Regex bleibt, Text des Ergebnisses beibehalten).
5. `test/names.test.js` (neu, ca. 15 Zeilen): liest alle Dateien aus `js/`, `index.html`, `README.md`, `tools/`, `test/` per `fs` und prüft, dass keines der Wörter vorkommt: `['Ka'+'lle','Ra'+'lf','Bir'+'git','Gün'+'ther','Yil'+'maz','Sta'+'hl','Hen'+'rike','To'+'bi','Ky'+'ocera','Brett'+'schneider']`. Die Wörter werden **zerlegt im Test** gespeichert, damit der Test sich nicht selbst findet. Case-insensitiv, Wortgrenze für „‹alter Name›“ (damit nichts Zufälliges wie „Stahlwerk“ trifft; „‹alter Name›“ als Wort ist verboten).
6. Check: `node test/names.test.js` → keine Treffer (prüft auch `docs/`).

Akzeptanz: Spiel startet, Figur heißt Christian, keine Namen in HUD/Texten, alte Tests grün (Test „Spiel endet…“ unverändert).

## Phase 2 – Daten (P1, ca. 110 Zeilen, nur `js/data.js`)

1. Stationen:
```js
SC.STATIONS = [
  { id: 'dea', name: 'DEA' }, { id: 'dec', name: 'DEC' }, { id: 'eea', name: 'EEA' },
  { id: 'extr', name: 'Extrusion' }, { id: 'inpack', name: 'Innenverpackung' },
  { id: 'auspack', name: 'Außenverpackung' }, { id: 'ster', name: 'Sterilisation' }
];
```
2. `SC.NEED = { req: 3, spec: 3, impl: 4, test: 3 }` (vorher impl 5). `SC.NEED_FUSION = { req: 2, spec: 2, impl: 3, test: 2 }`.
3. `SC.MODULES` mit `station`: auftrag→`dea`, bde→`dec`, trace→`inpack`, qs→`ster`, erp→`eea`. `SC.FUSION = { id: 'fusion', name: 'Systemfusion Altwerk', station: 'extr' }`.
4. `SC.FLOORS` neu (Schilder `name`: FELD, STEUERUNG, LEITEBENE, MES, ERP; Türen je Etage bei x = 122 / 186 / 330, alle Räume wie K 4):
   - 0: PFORTE `pforte`, SCHICHT `schicht`, HALLEN `halle`
   - 1: WERKSTATT `werkstatt`, DRUCKER `drucker`, KANTINE `kantine`
   - 2: BÜRO `buero`, LEITSTAND `leitstand`, MEETING `meeting`
   - 3: SERVER `server`, ARCHIV (deco), IT `it`
   - 4: CHEF `chef`, HR (deco), CONTROLLING `controlling`
5. `SC.ROOMS` ergänzen: `werkstatt` (Instandhaltung, floor 1), `leitstand` (KPI, floor 2), `it` (IT-Chefin, floor 3), `controlling` (floor 4); `floor`-Felder der verschobenen Räume anpassen (drucker 1, kantine 1, buero 2, meeting 2, server 3, chef 4). `pforte`/`schicht`/`halle` bleiben auf 0.
6. `SC.PYR = ['Feld', 'Steuerung', 'Leitebene', 'MES', 'ERP']`; `SC.PYRAMID_Q` (8 Einträge `{ q, a: Ebenenindex }`):
   Lichtschranke am Förderband (0), SPS der Extrusion (1), Bediener-Visualisierung/HMI (2), Wo sitzt das MES? (3), Auftragsfeinplanung (3), Finanzbuchhaltung (4), Betriebsdatenerfassung am Etikettierer (3), Notaus-Taster der Sterilisation (0).
7. `SC.VISITS`: Texte (je 3–4 Varianten pro Figur) für tesla, duo-Zusatz, italien, itchefin (Eröffnungssätze), ahnungslos, altwerk, glueck-Ereignisse. Beispiele: Tesla: „Wusstest du, dass man im Tesla die Scheibenwischer per Update verbessern kann? Bei meinem Staubsauger leider nicht.“ Duo: „Der andere nickt und sagt: ›Genau.‹ Er sagt das seit 2019.“ Italien: „Meine Nonna hat gestern die Soße vier Stunden gekocht. Vier! Ich hab ein Foto.“ IT-Chefin: „Und jetzt kurz zur Pyramide. Ebene drei, bitte.“
8. Alle Zahlen als Konstanten bündeln (Hebel für Phase 10):
```js
SC.TUNE = {
  budgetStart: 90, tranche: 30, trancheLow: 15, vorschuss: 25, rueckzahlung: 30, berater: 15,
  cost: { test: 2, repair: 3, care: 2, toner: 1, weekend: 8, sap: 10, fusion: 12 },
  fault: { inpack: 0.40, auspack: 0.15, other: 0.04 },
  visit: { tesla: 0.55, duo: 0.6, italienHour: 0.30, italienMax: 3, itEven: 0.85, itOdd: 0.25, ahnungslos: 0.5, altwerk: 0.5, glueck: 0.08 },
  meet: { gain: 8, step: 2, cap: 80, quotaMin: 90, quotaPen: 2, spiral: 0.35, spiral2: 0.5, testFactor: 0.8, reqDouble: 0.35 }
};
```
9. `SC.KPI = { start: { oee: 62, ausschuss: 5.5, durchsatz: 100, liefer: 86 }, ziel: { oee: 78, ausschuss: 3.0, durchsatz: 112, liefer: 94 }, mod: { oee: { bde: 7, auftrag: 3, trace: 2, qs: 2, erp: 1, fusion: 2 }, ausschuss: { qs: -1.5, trace: -0.8, bde: -0.5, fusion: -0.2 }, durchsatz: { bde: 5, auftrag: 4, fusion: 3, qs: 2, erp: 1 }, liefer: { auftrag: 4, erp: 3, trace: 1, bde: 1, fusion: 1 } }, down: { oee: -1.2, ausschuss: 0.15, durchsatz: -2, liefer: -0.8 } }`.
10. Version der Tipps: 6 `SC.TIPS` bleiben, 4 neue (Instandhaltung: „Der Automat mag keine Etiketten, die schief sind. Und keine, die gerade sind.“).

Test (in Phase 3 zusammen): `SC.STATIONS.length === 7`, jede `MODULES[i].station` existiert in `STATIONS`.

## Phase 3 – Sim-Kern (P1, ca. 150 Zeilen, `js/sim.js`)

### 3.1 Zustand (`newGame`)
Neue Felder: `budget: TUNE.budgetStart`, `debt: []`, `kpi: { ...SC.KPI.start }`, `kpiHist: []`, `stations: SC.STATIONS.map(s => ({ id: s.id, fault: null, care: 0, again: 0 }))`, `uselessToday: 0, uselessMin: 0, uselessYesterday: 0`, `sirene: 0`, `sap: { state: 'none', pk: 0 }`, `fusion: false`, `deadline: SC.DEADLINE`, `chaosUntil: 0`, `reportDay: 0`, `trancheWeek: -1`, `stats.visits/pyrRight/pyrWrong/faults/budgetSpent`. Module bekommen `need: SC.NEED` (Fusion: `SC.NEED_FUSION`) und `station`.
`N`-Zugriffe (`N.req` etc.) durch `m.need.req` ersetzen: `targets.*`, `progress()`, `modTable`. `per`-Berechnung in `progress` pro Modul (Summe aus `need`).

### 3.2 Budget-Helfer
`spend(S, k)`: `S.budget -= k; S.stats.budgetSpent += k; say` nur bei großen Posten. Anwendung: Testlauf 2 (in `halle.test.run`), Wartung 2, Toner 1 (beim erfolgreichen Druck), Wochenende 8/Tag. `endDay`: `S.debt`-Einträge mit `due <= day` abbuchen (−30). `budget < 0` → `S.budgetLock = true`: Werkleitung −2 am Abend, Testlauf-Kosten ×1,3 (in `act`: `if (id === 'test' && S.budget < 0) cost *= 1.3`). `budget < -40` → Niederlage in `endDay`-Ergebnisprüfung: „Das Controlling stoppt das Projekt. Du darfst die Excel-Liste behalten.“

### 3.3 Stationen und Störungen
- `planDay`: für jede Station `p = TUNE.fault[...]` (inpack 0.40, auspack 0.15, sonst 0.04); `×0.4`, wenn `st.care >= S.day`; `p = 0.6` wenn `st.again === S.day` (Folgetag-Störung aus Reparatur/Notbehelf). Treffer → `st.pend = ri(9*60, 15*60)`; sonst `null`.
- `events()`: `st.pend !== null && minute >= st.pend` → `st.fault = { at: st.pend }`, `st.pend = null`, `say(..., true)` mit Text je nach Station (Verpackungsautomat bei inpack/auspack: Pool aus 5 Sprüchen: „Fehler 17: Etikett klebt am Falschen.“, „Folienriss. Wieder.“, ...); `stats.faults++`.
- `halle.test`/`halle.req` bekommen Stationsbezug: `const st = stationOf(S, targets.X(S).station)`; `test.check`: wenn `st.fault` → `'Station ' + name + ' steht (Störung). Erst Werkstatt.'`; `req` bei Störung `cost × 1.3`.
- Neuer Raum `werkstatt` (Aktionen):
  - `repair`: Kosten 45 Min (30, wenn Modul `trace` done), Energie 6, 3 k€; `check`: es gibt eine Störung. `run`: `fault = null`; mit 25 % `st.again = day + 1`.
  - `notbehelf`: 15 Min, Energie 1, 0 k€; 50 % `fault = null`, sonst Text „hält nicht“; setzt in jedem Fall mit 60 % `st.again = day + 1`.
  - `wartung`: 40 Min, Energie 4, 2 k€; Station mit höchster Ausfallwahrscheinlichkeit (Verpackung zuerst), `st.care = day + 3`.
- `endDay`: `downMin = Σ (DAY_END − fault.at)` für aktive Störungen (+ erledigte Störungen: Beginn bis Reparaturzeit; dafür `fault.fixedAt` beim Reparieren in `st.log` merken), Störung über Nacht aktiv → bleibt (`fault` bleibt; „Automat steht seit gestern“, Ausschuss +0,6 zusätzlich).

### 3.4 Meeting-Balance (der wichtigste Block, P1)
- `planDay`: Einladungszahl `n = 1 + (rng < 0.55) + (schicht > 70 && rng < 0.4) + (schicht > 85 && rng < TUNE.meet.spiral2) + (S.uselessYesterday >= 2 && rng < TUNE.meet.spiral) − (auftrag done ? (rng < 0.3) : 0)`, mindestens 1 (außer Montag: Montagsrunde zählt extra). `S.uselessYesterday = S.uselessToday; S.uselessToday = 0; S.uselessMin = 0`.
- `meeting.attend` für Schichtleiter-Meetings: `gain = Math.max(0, TUNE.meet.gain - TUNE.meet.step * S.uselessToday)` (8, 6, 4, 2, 0); `S.schicht += gain`; Energie `Math.round(dur/10) + 1 + S.uselessToday`; `S.uselessToday++`; `S.uselessMin += dur`. Text beim vierten Meeting: „Null Ergebnisse, null Schichtleiter-Laune mehr. Er hat dir längst alles gesagt.“
- Deckel: Hilfsfunktion `eff = S => Math.min(S.schicht, TUNE.meet.cap)`; Nutzen nur noch über `eff(S)`: `req`: Doppelpaket bei `eff >= 65` mit Chance `reqDouble` (0.35); Testlauf-Zeit ×`testFactor` (0.8) bei `eff >= 70` (vorher 0.67). `S.testSlot === S.day` (Schichtplan-Aktion) bleibt bei ×0.67 und wird damit zur besseren Alternative; Kosten der Aktion unverändert (30 Min, Energie 4).
- `endDay`-Zeile Besprechungsquote: `if (S.uselessMin > TUNE.meet.quotaMin) { const k = Math.ceil((S.uselessMin - quotaMin) / 30); S.chef -= k * quotaPen; line bad: 'Die Werkleitung zählt: ' + S.uselessMin + ' Min. Meetings, null Ergebnisse. Werkleitung −' + k*2 }`.
- Zusatz: Verpasste Schichtleiter-Meetings kosten weiter −13 (damit „komplett meiden“ nicht optimal ist), aber die Linien-Blockade (Testlauf-Ausfall) bleibt wie in v0.1.1.

### 3.5 Schichtwechsel
`events()`: beim Überschreiten von 14:00, wenn `S.sirene !== S.day`: `S.sirene = S.day; say('Sirene: Schichtwechsel. In der Halle ist bis 14:20 Übergabe.')`. In `act()` vor Ausführung: bei `room === 'halle'` und `minute` in `[14*60, 14*60+20)` → `S.minute = 14*60+20` (Verlust als Text „Wartezeit wegen Schichtübergabe“), danach normal.

### 3.6 Wochenende
`weekend()`: je Schicht `spend(S, TUNE.cost.weekend)`; `autoWork` unverändert, nutzt `m.need`. Cutover-Logik siehe Phase 6.

Tests Phase 3 (in `test/sim.test.js`): siehe „Testfälle“, Nummern T4–T9, T14.

## Phase 4 – Besucher-Ereignisse (P1 für Duo/Italiener/IT, P2 für Ahnungslos/Glück; ca. 90 Zeilen, `js/sim.js` + `data.js`)

1. `planDay` ruft `planVisits(S)`: erzeugt `S.visits = [{ at, id, duo }]`:
   - `tesla`: `rng < 0.55`, `at = ri(8*60, 15*60)`, `duo = rng < 0.6`.
   - `italien`: für `h` in 9..16: `rng < 0.30` und bisher < 3 → `at = h*60 + ri(0, 15)`.
   - `itchefin`: `Tag 1` sicher, sonst gerade Tage 0.85, ungerade 0.25, `at = ri(9*60+30, 15*60)`.
   - `ahnungslos`: 0.5, `at = ri(8*60+30, 16*60)`.
   - `altwerk`: ab Tag 13, 0.5.
   - `glueck`: 0.08 für `lieferant`, 0.08 `azubi`, 0.08 `audit`, Zeit zufällig.
   - Zeiten sortieren; Mindestabstand 25 Min (spätere verschieben); keine Zeit in einem Meeting-Fenster (`m.start-20 .. m.start+m.dur`) → auf das Ende des Meetings schieben; alles `<= 16:30`.
2. `events()`: `if (!S.pending && S.visits.length && S.minute >= S.visits[0].at && !activeMeeting(S)) S.pending = S.visits.shift()`.
3. `SC.sim.choose(S, optId)` löst `S.pending`:
   - Tesla: `zuhoeren` (25 Min, Duo 35, Energie +2), `abwimmeln` (5 Min, Energie −2; 25 % `S.coffeeBlock = S.day`, dann Kaffee 25 statt 10 Min).
   - Italien: `zuhoeren` (12 Min, Energie +4; 30 % `S.lunchBonus = true`, nächstes Mittagessen +10), `vertagen` (2 Min).
   - IT-Chefin: Frage `q = pick(SC.PYRAMID_Q)` aus `S.pending.q` (bei Planung festgelegt), drei Antworten (die richtige + zwei zufällige andere, gemischt); `antwort(i)`: richtig → 15 Min, `+1` Paket auf `targets.req(S) || targets.spec(S)`, `stats.pyrRight++`; falsch → 40 Min, Energie −4, `stats.pyrWrong++`. `ueberspringen`: 10 Min; 35 % → +20 Min.
   - Ahnungslos: `erklaeren` (20 Min; 35 %: Werkleitung +2), `abkuerzen` (5 Min).
   - Altwerk: `mapping` (30 Min; Fusion-Spezifikation +1 falls offen, sonst Werkleitung +1), `spaeter` (3 Min).
   - Glück: `lieferant` → `S.partsUntil = day + 3` (Reparatur kostet 2 statt 3 k€), `azubi` → +1 Paket (Requirements/Spezifikation), `audit` → Werkleitung +3; je ein Button „Freut mich“.
   - Jede Wahl: `advance(S, min)`, `S.pending = null`, `stats.visits++`, `say(...)`.
4. Wichtig für Tests/Bot: `act()` verweigert Aktionen, solange `S.pending` gesetzt ist (`{ ok:false, why:'Erst die Unterbrechung klären.' }`). Die Zeit läuft in der UI während `pending` nicht (UI pausiert).

## Phase 5 – KPIs und Reporting (P1, ca. 60 Zeilen, `sim.js` + `data.js`)

1. `kpiTarget(S)`: für jeden KPI `start + Σ SC.KPI.mod[k][id]` über abgenommene Module; Abzüge: `downH = downMin/60`: `+ KPI.down[k] * downH`; Chaos (`S.chaosUntil >= S.day`): OEE −4, Ausschuss +1,5.
2. `updateKpi(S)` in `endDay` (vor der Ergebnisprüfung): `kpi[k] += (target - kpi[k]) * 0.35 + (rng - 0.5) * 1.0` (OEE und Liefertreue geclampt 0–100, Ausschuss ≥ 0); `S.kpiHist.push({ day, ...kpi })`.
3. `kpiScore(S)`: Mittel über vier KPIs von `clamp((ist - start)/(ziel - start), 0, 1.2)` (Ausschuss umgekehrt: `(start - ist)/(start - ziel)`); Anzeige `Math.round(min(1, ·) * 100)`.
4. Leitstand-Aktionen:
   - `bericht`: 30 Min (15 mit BDE), Energie 4; `check`: `S.reportDay === S.day` → „Heute schon berichtet“; `run`: `S.reportDay = day`, `S.reportWeek = week`, Werkleitung +2; weitere +2, wenn `kpiScore >= day/deadline`.
   - `pause` (optional, P2): „Schichtbericht lesen“ 10 Min, Energie +1 (Comedy-Text).
5. Freitag (`endDay` bei `weekday == 4`): `Wochenrückblick`: ohne `reportWeek === week` → Werkleitung −4; sonst `clamp(round((score - day/deadline) * 20), -5, 5)`.
6. `score()`: `+ kpiScore*5 + budget/2` (min 0 gesamt), Gewinnbonus unverändert.
7. Controlling-Aktionen (Raum `controlling`, P1 bis auf Vorschuss P2):
   - `tranche`: 30 Min, Energie 2; `check`: einmal je Woche (`trancheWeek !== week`); `+30` k€ (Werkleitung ≥ 40, sonst `+15`; mit ERP done `+5` extra).
   - `vorschuss`: 20 Min; `check`: `S.debt.length === 0`; `+25` k€, `S.debt.push({ due: day + 5, amt: 30 })`.
   - `berater`: 30 Min, 15 k€, `check`: `budget >= 0`; `autoWork(S, 3)` (neue Hilfsfunktion, aus `weekend()` herausgezogen); 25 % nur 1 Paket.

## Phase 6 – Großereignisse (P1, ca. 70 Zeilen, `sim.js`)

In `startDay`/`planDay` ergänzen:

### SAP (Tag 6)
- `planDay` bei `S.day === 6`: `S.sap = { state: 'migration', pk: 0, need: 4 }`, `spend(S, 10)`, `S.pending = { id: 'sap' }` (Dialog „Neues SAP“ mit einem Button), Meeting 10:00/60 Min `kind: 'chef'`, Titel „SAP-Kick-off der Werkleitung“.
- ERP-Reset: `m = module 'erp'`: wenn `m.done`: `m.done = false; m.printed = false; m.test = Math.max(0, N.test - 1)`; sonst `m.impl = Math.max(1, m.impl - 2); m.deployed = false`.
- Büro-Aktion `migrate`: 60 Min, Energie 9; `check`: `sap.state === 'migration'`; `pk++` (Text „Stammdaten 3/4: 14.000 Materialnummern, 11.000 davon heißen ›Schraube‹“).
- Während `migration`: `crash`-Risiko in `planDay` +0.08; `targets.abnahme` ignoriert `erp`.
- Cutover (Freitag Tag 10): im `endDay`: `pk >= need` → `state = 'done'`, Werkleitung +6, Zeile „Cutover geschafft“. Sonst bleibt `state = 'migration'` und die Wochenendentscheidung (`weekend`): `shifts >= 1` → `state = 'done'`, Zeile „Cutover am Wochenende“; `shifts === 0` → `state = 'done'; S.chaosUntil = S.day + 3; S.chef -= 5` und Zeile. Nach Cutover wirkt ERP-Abnahme wieder.
- UI: bei `sap.state === 'migration'` im Wochenendfenster Hinweis „Cutover steht an!“.

### Firmenübernahme (Tag 13)
- `planDay` bei `S.day === 13`: `S.deadline = SC.DEADLINE + 2`, `S.modules.push(newModule(SC.FUSION, SC.NEED_FUSION))`, `spend(S, 12)`, `S.fusion = true`, `S.pending = { id: 'uebernahme' }`, Ticker, `S.rivals`-Tabelle unverändert.
- Alle `S.day >= SC.DEADLINE`-Prüfungen (sim.js, ui.js: „Tag x/20“) auf `S.deadline` umstellen; `S.deadline` ist in `newGame` gesetzt.
- Win: unverändert `S.modules.every(m => m.done)`. Fusion-Modul muss nach Tag 13 `done` werden.

Tests: T11, T12.

## Phase 7 – Oberfläche (P1, ca. 120 Zeilen, `js/ui.js`, `index.html`, `css/style.css`)

1. HUD: `hud-budget` („Budget 84 k€“, rot bei < 0, gelb bei < 20) und `hud-kpi` („KPI 63 %“); `hud-day` zeigt `S.deadline`.
2. Besucher-Dialog: in `UI.tick` (und `UI.hud`): wenn `S.pending` und kein Dialog offen → `overlay(visitHtml(S.pending))` mit Figur-Rolle als Überschrift („Der italienische Kollege steht im Raum“), Text, Buttons `data-v="optId"`; Klick → `sim().choose`, Dialog schließen, `renderRoom/hud`, Ton `visit`. Zeit pausiert in `main.js`-Loop, solange `S.pending`/Dialog offen (Prüfung `UI.overlayOpen()` existiert bereits; sicherstellen, dass der Loop bei offenem Overlay nicht läuft).
   - IT-Chefin-Dialog: Frage, Pyramiden-Grafik als Textblock (5 Zeilen `Ebene 4 ERP` … `Ebene 0 Feld`), Antwort-Buttons.
   - SAP- und Übernahme-Dialog nutzen dieselbe Funktion (`id: 'sap'`/`'uebernahme'`, Text fest).
3. Raumansichten:
   - `halle`: Stationstafel (7 Zeilen: Name, Status ✓/✗ Störung, Teststation von Modul X).
   - `leitstand`: KPI-Tabelle (Ist, Ziel, Pfeil, Mini-Verlauf aus `kpiHist` als `▁▂▃▅▆▇`), Werkleitung/Wochenpfad.
   - `werkstatt`: Störungsliste der Stationen.
   - `controlling`: Budget, Schuldenliste, Tranche-Status.
   - `it`: Pyramide als Textgrafik; Aktion `review` (P2).
   - `buero`: Excel-Tabelle zeigt auch Fusion-Zeile; bei SAP-Migration Zeile „Stammdaten 2/4“.
4. Bilanz: zusätzlich Zeilen für KPI-Veränderungen (`OEE 64,2 % (Ziel 78)`), Budget, Meeting-Quote; Endbildschirm: Besucher-Statistik, Pyramiden-Quote (`richtig/gesamt`), KPI-Index.
5. `help()` neu schreiben (Pyramide, Stationen, Budget, Besucher, Großereignisse) – ca. 15 Zeilen.
6. `rooms`-Navigation: 13 Knöpfe gruppiert nach Etage (CSS `.floor-grp`).
7. Dialog-/Tick-Meldungen: `UI.toast` bleibt.

## Phase 8 – Grafik (P1 für Fabrik + Christian, P2 für NPC-Besuche; ca. 100 Zeilen, `js/building.js`, `tools/portrait.py`)

1. Fabrikdach: `drawBuilding` – Sendemast ersetzen durch Schornstein (x = `BX0 + 24`, 12×46 px, Ziegelfarbe, Rauchpuffer-Array mit `y -= 0.2 * dt`, Alpha-Fade) und Sheddach über dem Turm (Zickzack aus `rect`-Treppe oder Pfad, 6 Zähne, hellblaue Oberlichter). Schild „WERK MITTE“ bleibt, Schild „MES“ bleibt; ab `S.fusion` zweites schiefes Schild „+ ALTWERK“.
2. Hallenflügel links (x 4–60) und rechts (x 420–476) auf Bodenhöhe, je Station ein Maschinenblock (14–18 px breit), 3-Buchstaben-Label (DEA, DEC, EEA, EXT, INN, AUS, STE), Statuslampe: grün (`S.stations[i].fault === null`), rot blinkend bei Störung, gelb bei `st.pend`-Vorwarnung nicht nötig. Förderband als bewegter Streifen (`blink`-Offset) mit zwei Kisten, die in die Halle laufen. Sheddach der Flügel.
3. Etagenschilder: `text(String(f === 0 ? 'EG' : f))` ersetzen durch `SC.FLOORS[f].name` (kleine Plakette links in der Etage).
4. Sirene: bei 14:00–14:20 gelbe Warnleuchte (3×3 px) blinkt auf dem Dach (`min` ist schon Parameter von `draw`).
5. `drawMan` Varianten (Parameter `role`): `me` (Christian): vollere graue Haare (7×4 px Kappe in `#bebec0` mit Strähnen in `#9a9aa0`, Seitenhaare), Gesicht frei (kein Bart), Hemd hellblau mit Kragen. NPC-Rollen: Schichtleiter (Warnweste `#e0e020`, Helm), IT-Chefin (violett), Italiener (grün-weiß-rotes Hemdband 3 px), Tesla-Kollege (rotes „T“ als 3×3 px), Kollege ohne Arbeit (steht, `moving = false`).
6. NPC-Besuche (P2): `B.summon(role)`: gleichnamiger NPC wird auf die Etage von Christian gesetzt und läuft zu ihm; `B.dismiss()` lässt ihn weitergehen. Ohne diesen Schritt reicht der Dialog allein.
7. `tools/portrait.py`: Portrait 32×32 und 96×96 neu rendern – graue, dichte Haare, kein Bart, Hemd mit Kragen, ca. 40 (Fältchen nur 2–3 Pixel). Danach `img/portrait.png`, `img/portrait-32.png`, `img/apple-touch-icon.png` neu erzeugen.

## Phase 9 – Ton (P1 für Sirene und Grundrauschen; ca. 40 Zeilen, `js/audio.js`)

1. `A.ambient(level)`: ein Rauschpuffer (2 s, `Math.random`, einmal erzeugt) als Loop durch `BiquadFilter` (lowpass 420 Hz) mit Gain `0.03 * level`; dazu ein tiefer Sinus 55 Hz (Gain `0.015 * level`). Rhythmisches Stampfen: im bestehenden Scheduler zusätzlich alle 0,5 s ein leiser `kick`/`noiseHit` (Gain 0.04 · level) – nur wenn `ambientOn`.
2. `A.zone(room)`: ruft `A.ambient(1.0)` in `halle`/`werkstatt`, `0.5` im Rest, `0.25` in Büro/Meeting/Chef. `UI.openRoom/closeRoom` rufen `aud('zone', room)`.
3. Jingles: `siren` (Sägezahn 440→680 Hz hoch, 1.2 s runter, 2,4 s gesamt, Gain 0.12) – wird in `UI.hud` gespielt, wenn `S.sirene === S.day` neu gesetzt (`shownSirene`); `visit` (zwei kurze Töne wie Türgong), `alarm` (3 Piepser, bei Stationsstörung).
4. Wichtig: Alle neuen Aufrufe gehen über `aud(fn, ...)`, das bei fehlender Funktion/Fehler still bleibt. `A._validateTracks` bleibt unverändert; `A.ambient` darf bei `muted` nichts starten.

## Phase 10 – Bot, Tests, Balance (P1, ca. 100 Zeilen, `tools/bot.js`, `test/`)

### 10.1 Bot-Erweiterung
`tryAct` bleibt. `playDay` bekommt, in dieser Reihenfolge, **vor** den Pipeline-Aktionen:
1. Offenes `S.pending` → `resolveVisit(S, P)` (Bot wählt: `P.visit === 'skip'` immer abwimmeln/vertagen/überspringen; `'listen'` immer zuhören/erklären; `'smart'`: Italiener zuhören nur bei Energie < 60, IT-Chefin Antwort richtig mit Wahrscheinlichkeit `P.pyr`, sonst zufällig, alle anderen abwimmeln).
2. Station mit Störung, die für ein Modul gebraucht wird → `werkstatt.repair` (`P.repair === 'notbehelf'` nutzt Notbehelf).
3. `controlling.tranche` am ersten freien Tag der Woche (`P.tranche`); bei `budget < 10` `vorschuss` (`P.kredit`), bei `budget > 30 && P.berater` → `berater`.
4. `leitstand.bericht` ab 13:00 (`P.bericht`); `schicht.schichtplan` am Vormittag (`P.schichtplan`) bei `schicht >= 40`.
5. Migration (`buero.migrate`) hat Vorrang vor Spezifikationen, solange `sap.state === 'migration'`.
6. Wochenende: `P.we(S)` erhält zusätzlich `S.sap.state` (Cutover → mind. 1 Tag), sonst wie bisher.

`BASE = { excel: true, report: true, bericht: true, tranche: true, repair: true, visit: 'smart', pyr: 0.8, care: false }`.

Strategien (alle `Object.assign({}, BASE, …)`; **nur** die genannte Variable unterscheidet sich vom Referenzspieler):

| Name | Unterschied |
|---|---|
| `passiv` | `meet: 'none'`, `excel/bericht/tranche/repair: false`, `visit: 'skip'`, `leave: 15:00`, `we: 0` |
| `einfach` | `meet: 'chef'`, `repair: 'notbehelf'`, `schichtplan: false`, `we: 0` |
| `gut` (Referenz) | `meet: 'smart'`, `schichtplan: true`, `care: true`, `we: family > 55 ? 1 : 0` |
| `meetingfan` | wie `gut`, aber `meet: 'all'` und `schichtplan: false` |
| `meetingfan_plus` | wie `gut`, aber `meet: 'all'` **mit** `schichtplan: true` (Gegenprobe: schadet allein das Meeting?) |
| `ohneSchichtplan` | wie `gut`, aber `schichtplan: false` |
| `ablenkbar` | wie `gut`, aber `visit: 'listen'` |
| `berater` | wie `gut`, aber `berater: true`, `kredit: true` |
| `workaholic` | `meet: 'chef'`, `we: 2`, `leave: 19:30`, sonst BASE |
| `sparfuchs` | wie `gut`, aber `tranche: false` (Controlling gemieden) |

Bot-Ausgabe pro Strategie: Sieg (n), Siegtag-Median, Gründe der Niederlage (Werkleitung, Familie, Termin, **Budget**), Fortschritt-Median, Budget-Median am Ende, KPI-Index-Median, Meetings besucht (Median). Option `--check`: Exit-Code ≠ 0, wenn die Ziele unten verletzt werden. Seed bleibt `1000 + i * 7919`. `n` Standard 200, für Abnahme 300.

### 10.2 Balance-Ziele (n = 300, Seeds wie bisher)

| Strategie | Siegquote Ziel | Zusatz |
|---|---|---|
| `passiv` | ≤ 5 % | meist Werkleitung/Termin |
| `einfach` | 20–40 % | |
| `gut` | **55–70 %** | Siegtag-Median ≤ 21 |
| `ohneSchichtplan` | 45–62 % | ≥ 3 PP unter `gut` |
| `meetingfan` | **25–40 %** und **≥ 15 PP unter `gut`** | Siegtag-Median ≥ `gut` + 1 |
| `meetingfan_plus` | ≤ `gut` − 8 PP | zeigt, dass Meetings selbst kosten |
| `ablenkbar` | 30–50 % | |
| `berater` | 50–68 % | darf `gut` um höchstens 5 PP schlagen |
| `workaholic` | 25–45 % | ≥ 35 % der Niederlagen Familie |
| `sparfuchs` | 35–55 % | Budgetniederlagen ≥ 10 % |

Invarianten: Höchste Quote gehört `gut` oder `berater`; `meetingfan` liegt höchstens auf Rang 4 von 10; keine Strategie > 75 % (Spiel nicht trivial); Budgetniederlagen insgesamt 5–20 % (Budget ist spürbar, nicht dominant); SAP-Chaos-Tage bei `gut` in ≤ 25 % der Partien.

### 10.3 Hebel zum Nachjustieren (Reihenfolge, immer nur einen ändern, dann Bot)
1. `meetingfan` zu stark → `meet.gain` −1, `meet.cap` 80→75, `quotaMin` 90→75, `spiral` +0.1.
2. `meetingfan` zu schwach (< 20 %) → `meet.testFactor` 0.8→0.75 oder `quotaPen` 2→1.
3. Alle zu schwach → `SC.NEED.impl` 4→3 (letzter Ausweg), `fault.inpack` 0.40→0.30, `visit.italienHour` 0.30→0.25, `deadline`-Zuschlag Übernahme 2→3.
4. Alle zu stark → `cost.test` 2→3, `visit.tesla` +0.1, Budgetstart −10.
5. Budget zu locker/knapp → `tranche` ±5, `cost.weekend` ±2.

### 10.4 Testfälle (`test/sim.test.js`, neu `test/names.test.js`; Stil wie bisher `t('name', () => {...})`)

| Nr. | Test | Prüfung |
|---|---|---|
| T1 | Namensregel | `names.test.js`: Verbotsliste in keiner Datei |
| T2 | Christian | `newGame(1).name === 'Christian'`, `RIVALS[0].name === 'Werk Nord'` |
| T3 | Stationen | 7 Stationen, jedes Modul hat gültige `station`, `need` pro Modul gesetzt |
| T4 | Stationsstörung sperrt Test | Störung auf Teststation gesetzt → `act(halle,test).ok === false`; nach `werkstatt.repair` → ok, Budget −3 |
| T5 | Reparatur-Wiederholung | mit `rs` so manipuliert, dass `rng < 0.25` → `again === day + 1`; Notbehelf lässt 50 % durch (1000 Läufe: 40–60 %) |
| T6 | Meeting-Ertrag fällt | 4 Schichtleiter-Meetings nacheinander: Laune +8, +6, +4, +2 |
| T7 | Besprechungsquote | 120 Min nutzlose Meetings → `endDay` Zeile mit Werkleitung −4 |
| T8 | Sirene | Zeit auf 13:59 → `advance(2)` setzt `sirene`; `act(halle,req)` um 14:05 endet frühestens 14:20 + Dauer |
| T9 | Besucherplan | gleicher Seed → gleiche `visits`; Italiener ≤ 3 pro Tag; Abstände ≥ 25 Min; keine im Meeting; nur ein `pending`; `act` blockiert, solange `pending` |
| T10 | Pyramiden-Frage | richtig: Paket +1, `pyrRight` +1, 15 Min; falsch: 40 Min, Energie −4 |
| T11 | SAP | Tag 6: Zustand `migration`, Budget −10, `erp.impl` reduziert; 4× `migrate` → `done` bei Cutover; mit 3/4 und `weekend(0)` → Chaos (`chaosUntil`), mit `weekend(1)` → kein Chaos |
| T12 | Übernahme | Tag 13: `modules.length === 6`, `deadline === 22`, Fusion-`need` 2/2/3/2; Sieg erst nach Fusion `done` |
| T13 | KPI | alle Module `done` → Ist nähert sich Ziel nach 15 Abenden (|Ist−Ziel| < 4); Störung drückt OEE; keine NaN; Ausschuss ≥ 0 |
| T14 | Budget | Wochenende kostet 8/Tag; Tranche nur 1× pro Woche; Budget < 0 → Werkleitung −2 am Abend; < −40 → Niederlage „Controlling“ |
| T15 | Vorschuss | +25 jetzt, −30 an Tag +5, nur einer gleichzeitig |
| T16 | Speicherversion | `save`/`load` mit `v === '0.2.0'`; Spielstand `0.1.1` wird verworfen |
| T17 | Spielende | wie bisher (nur Deadline 22 nach Tag 13 beachten): Spiel endet durch Termin |
| T18 | Bot-Determinismus | zwei Läufe mit gleichem Seed liefern gleiches Ergebnis |
| T19 | Invariante | 40 Partien `gut`: kein `NaN`/`undefined` in `S`, `energy/chef/family/schicht` in 0–100 |
| T20 | Bot-Smoke | `meetingfan` (n = 60) hat weniger Siege als `gut` (nur als Warnung, nicht hart, wegen Zufall) |

`test/browser-check.js`: Selektoren (`hud-‹alter Name›` → `hud-schicht`, neue IDs `hud-budget`, `hud-kpi`) anpassen; prüfen, dass das Titelbild ohne Namensfeld lädt und ein Besucher-Dialog schließbar ist.

### 10.5 Abnahme v0.2.0
- `node test/sim.test.js`, `node test/names.test.js` grün.
- `node tools/bot.js 300 --check` erfüllt 10.2 (sonst nach 10.3 nachjustieren, Ergebnisse ins Commit schreiben).
- Spielen (30 Min): Fabrik erkennbar, Sirene hörbar, jeder Besucher mindestens einmal gesehen, SAP und Übernahme laufen durch, Pyramide ist in der Anleitung verständlich.
- Textdurchsicht (Ton-Check K 11): kein Name, keine Spitze gegen Personengruppen, italienischer Kollege liebevoll.
- `README.md` aktualisieren (Version, Bedienung, Namensregel), Commit `v0.2.0: ...`.

---

## Reihenfolge am Abend (mit Zeitplan)

1. Phase 1 (30 Min) → Commit.
2. Phase 2 + 3 (90 Min) → Tests T3–T8, T14, T16 → Commit.
3. Phase 5 + 6 (60 Min, Reporting/Budget vor Ereignissen, weil Bot sie braucht) → T11–T13, T15 → Commit.
4. Phase 4 (45 Min) → T9, T10 → Commit.
5. Phase 7 (60 Min) → manuell klicken → Commit.
6. Phase 10 vorgezogen: Bot erweitern, Balance messen (45 Min); danach erst Grafik/Ton, damit Balance nicht von Optik abhängt.
7. Phase 8 + 9 (60 Min) → Commit.
8. Abnahme 10.5, ggf. feine Balance, `v0.2.0` Commit.

## Streichliste, falls die Zeit knapp wird (Reihenfolge)
1. NPC-Besuchsanimation (Phase 8 Punkt 6), `it`-Raumaktion `review`, Leitstand-`pause`.
2. Glücksereignisse und Kollege ohne Ahnung (Phase 4 P2).
3. Vorschuss (Phase 5.7) und `berater`-Strategie.
4. Hallenflügel nur als Rechtecke ohne Förderbandanimation.
5. Wartung für Stationen (`werkstatt.wartung`).
Nicht streichen: Namen, Stationen, Verpackungsautomat, Meeting-Balance, KPI/Budget-Grundgerüst, SAP, Übernahme, IT-Chefin, Sheddach/Schornstein, Sirene, Christian-Sprite.

## Ausblick v0.3 (optional)
- **Kundenaufträge** (Mad-TV-Werbeverträge): Aufträge mit Liefertermin und Konventionalstrafe; Liefertreue wird zur Spielmechanik.
- **Betriebsklima** als sechster Wert: Zuhören/Abwimmeln wirkt langfristig, der Kollege ohne Arbeit hebt oder senkt es.
- **Highscore-Liste** (lokal, Top 5) und Tagesstatistik als Diagramm (Mad-TV-Kontostand).
- **Ersatzteil-Auktion** in der Werkstatt (Mad-TV-Filmauktion).
- **Zweite Hallenstraße** begehbar (Förderband-Minispiel für Testläufe), Nachtschicht mit Sirene um 22:00.
- **Mehr Großereignisse**: Audit, Cyberangriff-Übung (harmlos: „Phishing-Test: 14 Kollegen haben auf das Gewinnspiel geklickt“), Werksverlagerung.
- **Schwierigkeitsstufen** (Deadline 18/20/24, Budget 60/90/120).
- **Zweiter Spielstil** „Sandbox“: unendlich viele Tage, KPI-Highscore.

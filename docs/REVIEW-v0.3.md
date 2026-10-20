# MES-Marathon – Review v0.3.0 (Claude Code)

Stand 19.10.2026. Claude Code hat nur gelesen (Read/Grep/Glob), Grok Bot hat umgesetzt.

## Plan v0.3
# Plan v0.3 "Flurfunk": 5 Features, zusammen ca. 4–6 Stunden

Ich habe nichts geändert und den Plan nur aus dem Code abgeleitet. Der Bot-Lauf `node tools/bot.js 300 --check` steht noch aus, ich habe ihn nicht ausgeführt.

**Grundregel für alle Features:** Alles Neue läuft über einen eigenen Zufallsstrom `S.rf`. Er wird in `newGame` aus dem Seed abgeleitet und nicht aus `S.rs`. So bleiben die bestehenden Würfe (Meetings, Störungen, Besuche) pro Seed identisch. Bot-Vorher/Nachher-Vergleiche zeigen dann nur den echten Effekt. Außerdem ist `SC.VERSION` auf '0.3.0' zu setzen, und der Test "Speicherversion 0.2.0" muss angepasst werden.

## 1. Features

**A. Sprechblasen im Gebäude (S–M)**
- **Was:** Die Figuren sagen gelegentlich kurze Sätze in einer Pixel-Blase: der Schichtleiter »Hast du kurz?«, der Tesla-Kollege »0 auf 100 …«, der Kollege aus dem Nachbarbüro »Bin gleich bei dir.«, die IT-Chefin »Ebene 3!«, der italienische Kollege »Mamma mia, die Pasta!«. Pro Figur gibt es alle 20–40 s eine Blase für etwa 3 s.
- **Code:** Neue Liste `SC.BUBBLES = {rolle: [...]}` in `js/data.js`. In `js/building.js` kommen `n.say` und `n.sayT` hinzu. `updateNpcs` zählt den Timer herunter, ein Zeichenblock nach `drawMan` malt die Blase. Er läuft nur bei `!SC.S.pending` und nur für Figuren auf der Etage, auf der Christian ist (`P.f`).
- **Balance:** keine, rein kosmetisch. `Math.random` ist hier erlaubt, weil `building.js` die Sim nicht berührt.
- **Test:** In `sim.test.js` prüfen, dass `SC.BUBBLES` für jede Rolle aus der Figurenliste (schicht, tesla, nachbar, italien, itchefin) mindestens 5 Sätze mit höchstens 40 Zeichen enthält. `names.test.js` deckt die Namensregel ab.

**B. Flurfunk: Zufallsereignisse (M)**
- **Was:** An etwa 35 % der Tage gibt es einen Flurfunk-Moment als Besuchs-Popup mit genau 2 Optionen. Beispiele:
  - Brandschutzübung: Der Pförtner zählt durch, 15 Min. lang.
  - Beamer-Kabel: Niemand hat das passende.
  - Kantine: »Gericht des Tages: Überraschung«.
  - Kaffeemaschine entkalkt: »Schmeckt jetzt nach nichts.«
  - Betriebsausflug-Umfrage: Alle antworten »egal«.
- **Code:**
  - `planVisits` in `js/sim.js` zieht mit `S.rf` höchstens ein `{id:'flur', k:<index>}`. Der Zug entfällt an Tagen mit `big`-Ereignis (SAP an Tag 6, Übernahme an Tag 13).
  - `SC.FLUR` in `js/data.js` enthält pro Ereignis Text, zwei Optionen und deren Effekte.
  - Neue `case 'flur'` in `visitOptions`, `visitText` und `choose`. `choose` bleibt bei `min` + kleinen Energie- und Schichtleiter-Deltas.
  - In `building.js` `summon`: die passende Rolle läuft zu Christian.
- **Balance:** leicht. Die Effekte sind symmetrisch (Option 1: +Zeit, +Energie oder +Schicht; Option 2: schnell, aber −2 Energie). Der Erwartungswert liegt bei ca. 3 Min. Zeit pro Tag, das ist der einzige Hebel.
- **Test:** Jedes Ereignis aus `SC.FLUR` über `sim.choose` auflösen. Dabei darf `min ≤ 20` gelten, und `|Δenergy|`, `|Δschicht|` sowie `|Δchef|` bleiben jeweils ≤ 6 beziehungsweise 0 für Chef.

**C. Running Gag: Buzzword-Bingo der Werkleitung (S)**
- **Was:** Die Werkleitung streut in ihre Meetings Phrasen ein (»agil«, »Synergie«, »Rollout«, »Quick Win«, »Pyramide«). Jede verschiedene Phrase wird als Zeile im Meeting-Log gesammelt. Bei 5 von 8 gibt es einmal »BINGO!« und eine Zeile im Abendbericht.
- **Code:**
  - `SC.BUZZ` in `js/data.js`.
  - `A.meeting.attend` in `js/sim.js`: bei `m.kind === 'chef'` mit `S.rf` eine Phrase ziehen und in `S.bingo[]` ablegen.
  - `S.bingo` und `S.bingoDone` in `newGame` initialisieren.
  - Beim Bingo `S.stats.bingo = 1`, und `score()` bekommt dafür +50.
- **Balance:** keine. Der Bonus wirkt nur auf den Score, nicht auf Chef, Schicht oder Familie.
- **Test:** Mit einem festen Seed viele Chef-Meetings besuchen: `S.bingo.length` steigt nie über die Anzahl der Phrasen, und `S.stats.bingo` ist genau 1, nicht mehrfach.

**D. Easter Eggs (S)**
- **Was:** Es gibt vier Zähler-Eier:
  - Die Pappe-Pyramide wird 7-mal angeschaut: »Auf der Rückseite steht Ebene 6: Cloud. Jemand hat sie durchgestrichen.«
  - Der 7. Kaffee an einem Tag: Die Maschine zeigt »Fehler 42«.
  - Der Pförtner wird 3-mal vor 15:00 angeklickt: Er schaut nur.
  - Optional: Klick auf den Schornstein oder das zweite Schild in `building.js` bringt einen Toast.
- **Code:** Neues `S.eggs = {}` in `newGame`. Die Zähler hängen in `A.it.pyramide`, `A.kantine.coffee` und `A.pforte.home` in `js/sim.js`. Die Meldung läuft über `say()`. Pro Ei gibt es nur einen einmaligen Flag.
- **Balance:** keine. Es gibt nur Text und eine Zeitkosten-Konstante, die schon bei den Aktionen steckt.
- **Test:** `A.it.pyramide.run` 7-mal aufrufen: Die Ei-Zeile erscheint genau einmal in `S.msgs`, und die Aktion bleibt danach normal nutzbar.

**E. Werksdurchsagen und Schlagzeile des Tages (S)**
- **Was:** Einmal pro Tag kommt zu einer zufälligen Zeit eine Lautsprecher-Durchsage: »Der Besitzer eines roten Staplers möge …« oder »Die Kantine ist heute leider … geöffnet.« Im Abendbericht steht eine Zeile »Aus dem Werk:« mit einer Satire-Schlagzeile.
- **Code:**
  - `SC.DURCHSAGEN` und `SC.SCHLAGZEILEN` in `js/data.js`.
  - In `planDay` einen Zeitpunkt `S.durchsageAt` ziehen (`S.rf`, 9:00–16:00).
  - In `events` (`js/sim.js`) beim Erreichen `say()` aufrufen. Das passiert nur, wenn kein Meeting läuft.
  - In `endDay` eine neutrale Zeile `R.lines.push(['good', ...])` anhängen. Besser wäre ein eigenes Muster wie ein Pfeil-Präfix, damit `ui.js` sie nicht grün färbt.
- **Balance:** keine.
- **Test:** Ein voller Tag mit `advance` in 15-Minuten-Schritten ergibt genau einen `dayLog`-Eintrag mit »Durchsage«.

## 2. Balance-Bot (`tools/bot.js`)
- `resolveVisit` braucht für `flur` keine Änderung, wenn die Optionen immer genau 2 sind. Dann greift `P.visit`: 'skip' und 'smart' nehmen die kurze Option (`opts[1]`), 'listen' die lange (`opts[0]`). Wenn Optionen wirklich von 2 abweichen, das explizit im `case` behandeln.
- Vorgehen: `node tools/bot.js 300 --check` vor und nach der Änderung laufen lassen und die Tabellen vergleichen. Erwartung: Sieg-% pro Strategie höchstens ±3 PP. Die Zielbereiche aus `Z` (`ohneSchichtplan`, `meetingfan`, …) dürfen höchstens als Warnung kippen. Das Ergebnis kommt als `docs/BALANCE-v0.3.md`.
- Keine neuen Bot-Entscheidungen für A, C, D, E. Der Bot muss nicht mit Bingo oder Eiern spielen.
- Falls B den Meeting-Planer des Bots stört: `FREE`-Fenster prüfen. Besuche halten 25 Min. Abstand und weichen Meetings aus (`planVisits`), das sollte reichen.

## 3. Risiken und Review-Punkte
- **RNG-Verschiebung:** Jeder versehentliche `rng(S)`-Aufruf in neuem Code verändert alle Seeds. Ich prüfe per grep, dass neue Zufälle nur über `S.rf` laufen. Außerdem prüfe ich, dass identische Seeds ohne Flurfunk (z. B. `P(flur=0)` temporär) dieselben Partien wie v0.2.0 ergeben.
- **Invarianten:** `--check` muss grün sein (meetingfan ≥ 15 PP unter gut, passiv ≤ 5 %, best ≤ 75 %). Ich schaue auf `meetingfan` und `ablenkbar`, denn Flurfunk trifft Spieler mit vielen Besuchen am stärksten.
- **Zeitdruck:** Zusätzliche Popups verschieben Meetings und die Tagesplanung. Ich prüfe, dass `S.pending` keine Doppelbelegung mit `sap`/`uebernahme` auslöst.
- **Namensregel und Ton:** `node test/names.test.js` muss grün sein. Neue Texte nur nach Rolle, keine Nachnamen, keine echten Firmen außer dem schon vorhandenen Tesla-Kollegen. Die Gags zielen auf Büro- und Fabrikalltag, nicht auf Personen. Beim italienischen Kollegen bleibt es bei liebevollem Essen und Geschichten, ohne Klischee-Verschärfung.
- **Savegame:** Version 0.3.0, neue Felder (`rf`, `bingo`, `eggs`, `durchsageAt`) in `newGame` initialisiert. Der Speicher-Test wird angepasst, und ein alter Spielstand wird weiter abgelehnt.
- **Canvas:** Sprechblasen dürfen den Dialog und die Toasts nicht verdecken. Texte müssen in 480×300 passen (Breite per `measureText` begrenzen). Ich prüfe mit `test/browser-check.js` und per Sichtprüfung.
- **Dokus:** README (Abschnitt »Worum geht es?«), `docs/PHASEN.md` und die Versionsnummer in `js/data.js` müssen mitgezogen werden.

## Auswahl Vorschläge und Pflicht-Ereignisse
Ich habe sim.js, data.js und bot.js gelesen und nichts geändert. Hier ist der Plan.

**Gemeinsame Regeln (damit `bot.js --check` hält)**
- Neuer Code nutzt nur `rngF`/`ri2`/`pickF`, nie `S.rs`. Neue Besuche bekommen `t:0` (sim.js:117 würfelt sonst `rng`). Die Seeds und Baselines bleiben so gleich.
- Alle Ereignisse sind `S.pending`-Besuche mit Einträgen in `visitOptions` (sim.js:383), `visitText` (:395) und `choose` (:413). Das Overlay (ui.js:129) und der Bot (`resolveVisit`) bedienen sie ohne Änderung.
- Der Bot nimmt sonst `opts[last]`. Deshalb braucht `resolveVisit` (bot.js:14) je neue Besuchs-ID eine feste Regel, sonst landet er immer bei »Ticket« oder »später«.
- Feste Tage: Tag 9 Kreis, Tag 11 Kaffee, Tag 12 Rätsel, Tag 14 Party, Tag 18 Ticket. Die Tage 6, 10 und 13 sind schon durch SAP, Cutover und Übernahme belegt.
- Nach dem Einbau `node tools/bot.js 300 --check` laufen lassen. Erwartet wird gut −3 bis −5 PP, weil rund 2 h fester Mehraufwand dazukommen. Fällt gut unter 55 %, die Kreis-Zeit auf 45 Min. senken.

**Pflicht 1 – Kaffeeautomat**
- Auslöser: in `endDay` bei `R.friday && S.day>=10` einmalig `S.kaffeeAt=S.day+1` setzen (nach sim.js:546). In `planDay` kommt dann als `big` `{at:8*60+15,id:'kaffee'}` dazu. Tag 11 ist der Montag nach dem Cutover.
- Optionen `kantine` und `durchhalten`:
  - `kantine`: 30 Min., Energie +4, kein Malus.
  - `durchhalten`: 0 Min. und `S.kaffeeDef=S.day`. Der Wert wirkt an drei Stellen:
    - Energiekosten ×1,3 in `act` (:374).
    - Bug-Chance im Testlauf +0,08 (:231, analog zu `chaosUntil`).
    - `coffee`-check gesperrt (:297).
- Beide Wege kosten etwa gleich viel (30 Min. gegen etwa 18 Energie und 0,08 Bug-Risiko), daher dominiert keiner.
- Bot: `kantine`, wenn `S.energy<70`, sonst `durchhalten`.

**Pflicht 2 – IT-Chefin »Industrie 5.0 als Kreis«**
- In `planVisits` (:115): `if(S.day===9) V.push({at:ri2(S,10*60,14*60),id:'kreis',t:0})`. Tag 9 ist ungerade, also steht dort kaum die normale Pyramiden-Frage.
- `meeting`: 60 Min., `S.chef+4`, Energie −5, kein Schichtleiter-Meeting (`uselessMin` bleibt unberührt).
- `spaeter` (»Nach SAP-Go-live«): 3 Min., `S.chef−10`.
- Bot: immer `meeting`. Nur `passiv` nimmt `spaeter`.

**Pflicht 3 – Rätselstörung (Morse)**
- Auslöser: Tag 12, `V.push({at:ri2(S,10*60,13*60),id:'raetsel',t:0})`.
- `service`: `spend(S,5)`, 20 Min., sicher.
- `aus`: 10 Min. und `rngF<0.5`. Bei Erfolg ist es behoben. Sonst bekommt `inpack` `fault={at:S.minute}` und `stats.faults++`, und die Reparatur läuft über die Werkstatt.
- `ticket`: 2 Min. und `S.ticketDay=18`. Am Tag 18 setzt `startDay` oder `planDay` einen festen `inpack`-Fault mit `at=DAY_START`, also Stillstand über Nacht plus KPI-Malus. Die Meldung nennt das Ticket und die Morse-Lampe.
- Kosten im Vergleich:
  - `ticket`: etwa 43 Min., 3 k€ und KPI-Malus.
  - `aus` im Mittel: etwa 36 Min. und 1,5 k€.
  - `service`: 5 k€ und 20 Min.
- Bot: `service`, wenn `S.budget>=15`, sonst `aus`.

**Pflicht 4 – All-Employee-Party (Variante Besuch, nicht endDay und nicht Overlay)**
- Ein `endDay`- oder Abend-Overlay braucht eine neue Phase. Der Bot ruft `endDay` und danach `startDay` direkt auf und kennt sie nicht.
- Auslöser: Tag 14 (Do, einen Tag nach der Übernahme), `big`-Eintrag `{at:16*60+30,id:'party'}`. Er ist als `big` vor den Spacing-Regeln geschützt (:119–127).
- Morgens kommt in `planDay` eine Meldung: »16:30 Party, Verkleidungspflicht«.
- Sechs Kostüme mit `id:'k0'..'k5'`. Die Effekte sind klein: Energie ≤ ±4, `chef`/`schicht` ≤ ±3, `family` ≤ ±2.

| Kostüm | Min. | Effekt |
|---|---|---|
| Pappe-Pyramide | 50 | Energie −4, chef +3 |
| Kaffeemaschine »Fehler 42« | 40 | Energie +4, schicht +2 |
| Pförtner (seit 1987) | 30 | schicht +3, chef −1 |
| Schornstein mit Wattewolke | 45 | Energie −2, chef +2, family +1 |
| Tesla-Karton »Reichweite 0 km« | 35 | Energie +2, schicht +3, chef −2 |
| MES-Rack 4 mit LEDs | 45 | Energie −3, chef +1, family +2 |

- Überstunden: In `endDay` (:497) wird `over` um `S.partyMin` gekürzt. Dazu kommt pauschal Familie −1, denn sonst wären es etwa −5 (+4 »pünktlich« entfällt, dazu −1 Überstunden).
- Verkleidung: Nur `building.js` zeichnet am Tag 14 Hüte oder Masken über die Rollenfiguren (:94, :235). Die Besuchstexte (`visitText`) bekommen am Tag 14 ein Präfix wie »(als Cybertruck-Karton)«. Die Sim bleibt unberührt.
- Bot: `opts[S.seed % opts.length]`, ohne `rng`.

**Gewählte Vorschläge (3 von 6)**
1. **Schichtleiter »Wir hatten das schon immer so«** (Running Gag):
   - Zähler `S.stats.immer`, erhöht in `attend` bei `kind==='schicht'` (:289) und in `gespraech` (:240).
   - Eine Info-Zeile in `endDay` neben der Bingo-Zeile (:536): »Heute schon 3x: ›Das hatten wir schon immer so‹ (gesamt 17)«.
   - Kein Effekt, null Balance-Risiko.
2. **Drucker mit absurden Fehlermeldungen**:
   - Neue Liste `SC.DRUCKER_FEHLER` in drei Stufen. `stage=min(2,floor(S.day/7))`, ab dem Cutover (Tag 10+) nur die schlimmste Stufe.
   - Text in `print` (:308) und `fix` (:310) per `pickF`. Keine Zahlen, die 30 % Stau bleiben.
3. **Excel-Dateinamenkette**: In `excel` (:272) am Tag 13 eine zusätzliche `say`-Zeile mit der Kette bis `...wirklichfinal_Christian.xlsx`. Dazu das Egg per `egg()` (+25 Score, kein Einfluss auf die Winrate).

**Abgelehnt**
- **Tesla-Reichweite**: Sie bräuchte tageweise eigene Besuchstexte, die mit dem Zufallsindex `t` kollidieren. Gag und Nutzen stehen in keinem Verhältnis. Für v0.3.1 gut nachziehbar.
- **Aufzug 7x, Mad-TV-Studio**: Das ist ein neuer Raum mit Grafik, Audio und UI, und der Bot kann ihn nicht prüfen. Das gehört in v0.4.
- **Espresso 3x um 15 Uhr**: Der Italiener erscheint zufällig (:109, :159), der Bot kann das Muster nicht gezielt treffen. Ein Energie-Bonus lädt außerdem zum Ausnutzen ein und verschiebt die Balance.

**Tests (sim.test.js)**
- Die Ereignisse treten an den festen Tagen 9, 11, 12, 14 und 18 auf.
- Es gibt keinen `S.rs`-Verbrauch durch die neuen Pfade (gleiche Seeds geben gleiche Haupttrajektorie).
- Der `ticket`-Pfad löst am Tag 18 einen Fault aus.
- Die Party erzeugt keine Überstunden-Strafe.

## Tiramisu
**Empfehlung: Variante (b), weniger Fehlerrisiko beim nächsten Testlauf.** Ich habe nur gelesen, nichts geändert.

**Warum (b):** Der Bug-Wurf in `A.halle.test` (`js/sim.js:231`) ist die riskanteste Zufallsstelle: Basis 0,34 minus 0,03·`m.spec`. Ein Bug setzt `impl` um 1 zurück und `deployed=false`, das kostet etwa einen halben Tag. Das Tiramisu passt dazu, weil die Spezifikation dann »sitzt«. (a) und (c) wären zusätzliche Zeit-Boni, die sich mit `testFactor`, `testSlot` und `uselessToday` überlagern.

**Zahlen und Dauer:**
- Bug-Chance des nächsten Testlaufs −0,15, mit `Math.max(0, …)` begrenzt. Bei `spec` 0 sind das 0,34 → 0,19, nicht »garantiert«.
- Gültig bis zum nächsten Bug-Wurf, spätestens bis Tagesende.
- Die Aufbrauch-Bedingung ist der Wurf selbst. Der Schichtleiter-Abbruch bei Zeile 229 verbraucht den Bonus nicht.

**Code (`js/sim.js`):**
1. **State (Z. 28):** `itStreak: 0, tiramisu: 0`. Beim Laden alter Spielstände per `|| 0` absichern.
2. **`choose`, case `'italien'` (Z. 423–424):**
   - `zuhoeren`: `S.itStreak++`. Bei `>= 3` setzt `S.tiramisu = S.day; S.itStreak = 0;`.
   - Dann `say('Tiramisu! Alle Spezifikationen sitzen. Nächster Testlauf −15 % Bug-Risiko.')`.
   - Die Espresso-Energie `+6` entfällt in dieser Runde, das Tiramisu ersetzt sie. Zuhören 1 und 2 bleiben wie bisher.
   - `vertagen`: `S.itStreak = 0`.
   - Andere Besuche (Tesla usw.) und der Vorbeigeh-Gruß `ITALIEN_KURZ` (Z. 159) lassen die Serie unberührt, wie in der Vorgabe.
3. **`A.halle.test` (Z. 231):** `- (S.tiramisu === S.day ? 0.15 : 0)` in die Formel, und das Minimum bei 0 halten. Direkt nach dem Wurf (Z. 232) `S.tiramisu = 0`, egal ob Bug oder bestanden.
4. **`act` (Z. 353):** keine Änderung nötig, `cost` bleibt unberührt.
5. **Tageswechsel:** `S.tiramisu` dort nicht gesondert löschen. Der Vergleich `=== S.day` verfällt von selbst. Ich habe die Tagesrücksetzung (`S.lunch=false`) nicht gelesen, das müsste man prüfen.

**HUD (`js/ui.js`):** In der Statuszeile bei Zeile 41 `+ (s.tiramisu === s.day ? ' · <span class="good">🍰 Tiramisu: nächster Testlauf −15 % Bug</span>' : '')` anhängen, analog zu `SAP-Chaos`. Optional im Hallen-Raum bei Zeile 112 ein `<p class="good">`. Die Serie lässt sich als `Tiramisu 2/3` zeigen, wenn `s.itStreak > 0`.

**Bot (`tools/bot.js:22`):** `smart` wählt bei `italien` nur bei `S.energy < 60` `zuhoeren`, sonst `vertagen`. Das setzt die Serie ständig zurück, das Tiramisu käme so gut wie nie vor. Vorschlag: `(p.id==='italien' && (S.energy < 60 || S.itStreak > 0))`. Wer einmal angefangen hat, hört bis zum Tiramisu weiter zu. Danach Balance-Lauf: Die 3×12 Min. kosten Zeit, bringen aber +12 Energie, und die Bug-Quote sollte sinken (`stats.bugs` vergleichen).

## Übertragung aus Sender-Chef
**MES-Marathon v0.3.0: Umfang aus Sender-Chef (nur gelesen, nichts geändert)**

**Entscheidungen**
1. Aktive Rivalen: **v0.3.** Heute sind Werk Nord und Werk Süd nur Balken (`sim.js:523`). Ein Eingriff bringt am meisten Spielbarkeit für wenig Code.
2. Markt mit Tagesrotation: **v0.4.** Er braucht viel neuen Inhalt (Angebote, Preise, UI). Berater (`controlling`) und der Lieferant-Besuch decken das Nötigste ab.
3. Planen mit Prognose: **v0.4.** Es setzt Image und Zusagen voraus. Der KPI-Pfad (`kpiPath`) ist die spätere Basis.
4. Zusagen mit Frist, Mindestleistung und Strafe: **v0.3.** Das ist die einzige echte Eigenentscheidung mit Risiko und passt in die Werkleitung.
5. Echtzeit-Ausschreibung: **v0.4.** Das Spiel hat keine Echtzeit-Schleife außerhalb der Tagesminuten. Es bräuchte ein neues Konzept samt Bot-Modell.
6. Kredit: **v0.3.** Er ersetzt den Vorschuss. Das ist klein, und der Bot hat schon `P.kredit`.
7. Image: **v0.3**, als Teil von Punkt 1. Es ist die Rückkopplung zu den Rivalen und wird mit ihnen gebaut.
8. Nachrichten und Agenturen: **v0.4.** Die Werkszeitung ist bisher nur ein Gag (`SC.SCHLAGZEILEN`). Kosten und Nutzen setzen den Markt voraus.
9. Zweiter Siegpfad: **v0.4.** Er braucht Image und Kredit als Grundlage. Idee: alle 4 KPIs im Ziel und Image ≥ 80 als »Werk des Jahres«.

**A) Rivalen greifen ein, mit Image (Punkte 1 und 7)**
- **Fabrik:** Neue Größe `S.image` (0–100, Start 50) als »Ansehen im Konzern«. Ab Tag 4 greift am Tag höchstens ein nicht live gegangener Rivale ein.
- **Auslöser:** Chance 0,25. Sie steigt um 0,15, wenn Christian führt. Derselbe Rivale kommt nie zweimal hintereinander.
- **Werk Nord, »Abwerbung«:** Ein Bediener wird abgeworben. Testläufe kosten 2 Tage lang ×1,3 (`S.nordUntil`).
- **Werk Süd, »Gerücht beim Vorstand«:** Werkleitung −3 und Image −4.
- **Gegenmaßnahme:** Ein Besuch (`pending`) mit zwei Optionen. Option 1 kostet 8 k€ und 10 Min. und verhindert den Malus. Option 2 ist hinnehmen: Malus, Image −3, Rivale +2 Fortschritt.
- **Image-Rückkopplung:**
  - Rivalenschritt ×(1,1 − 0,002·Image), also 0,9 bis 1,1. Das ändert `rng` nicht.
  - Tranche +5 k€ bei Image ≥ 65, −5 k€ bei < 35.
  - Täglich +1 bei Führung oder ≥ 3 KPIs im Ziel, −5 wenn ein Rivale live geht.
  - Score + Image·3.
- **UI:** `rivals()` in `ui.js:90` zeigt eine Image-Zeile. Das Bild im Besuchsfenster läuft über die bestehende Besuchsdarstellung.
- **Code:**
  - `data.js`: `TUNE.rival {p:0.25, lead:0.15, from:4, cost:8, loss:4}`, Texte in `SC.RIVAL_EVT`.
  - `sim.js`: `newGame` (`image`, `nordUntil`), `planVisits` (`id:'rivale'`, Rivalenwahl und Auslosung nur über `rngF`, `t` explizit setzen, sonst würfelt `sim.js:117` über `rng`), `visitOptions`/`visitText`/`choose`, Faktor in `endDay` bei Zeile 525, Image-Änderungen dort, `score()` und der Testkosten-Faktor in `act`.
- **Bot:** `resolveVisit` in `bot.js:14` bekommt einen Zweig für `p.id==='rivale'`. Mit `P.gegen && S.budget>=15` nimmt er Option 1, sonst Option 2. Neue Strategie `ohneGegen` (nimmt immer Option 2).
- **Test:**
  - Gleicher Seed vor und nach der Änderung liefert dieselbe `S.rs`-Folge und denselben Besuchsplan außer dem Rivalen-Eintrag.
  - Rivale nie an zwei Tagen hintereinander derselbe.
  - Image bleibt in 0–100.
  - Gegenmaßnahme kostet 8 k€, hinnehmen kostet Image.
- **Bot-Ziel (`--check`):** `ohneGegen` mindestens 5 PP unter `gut`. `gut` darf höchstens 8 PP verlieren.

**B) Kredit statt Vorschuss (Punkt 6)**
- **Fabrik:** Im Controlling-Raum (`controlling`) ersetzt ein Kreditrahmen den Vorschuss.
- **Zahlen:**
  - Rahmen 60 k€ (80 k€ bei Image ≥ 60).
  - Aktionen »+20 k€ aufnehmen« und »20 k€ tilgen« (20 Min., Energie 1).
  - Zins 8 % des Saldos jeden Freitag im `endDay`.
  - Bei Spielende zählt der Restsaldo mit −½ im Score und blockiert nichts.
- **Code:**
  - `data.js`: `TUNE.kredit {rahmen:60, rahmenHoch:80, schritt:20, zins:0.08}`, `vorschuss` und `rueckzahlung` fallen weg.
  - `sim.js`: `A.controlling` bei Zeile 341 ersetzen, `S.debt` bei Zeile 24 und 520 ersetzen durch `S.kredit`, Zins in `endDay` am Freitag, `score()`.
  - `ui.js:78`: Zeile »Kredit: Saldo / Rahmen / Zins«.
- **Bot:** `bot.js:45` ändert sich so: `P.kredit && S.budget<10` nimmt 20 k€ auf. Bei `S.budget>40 && S.kredit>0` tilgt der Bot. Beim Berater-Profil bleibt `kredit:true`.
- **Test:** Rahmen kann nicht überzogen werden. Zins fällt nur freitags an. Tilgen ist höchstens so hoch wie Saldo und Budget. Alte Spielstände werden durch `s.v` abgelehnt (`sim.js:599`), das ist ok, weil die Version schon 0.3.0 ist.

**C) Zusagen an die Werkleitung (Punkt 4)**
- **Fabrik:** Raum Werkleitung (`chef`), neue Aktionen, je 15 Min. Es gibt nur eine offene Zusage. Neue Zusagen sind bis Tag 16 möglich.
- **Aufbau:** Frist in Tagen, Mindestzahl neu abgenommener Module, Prämie und Strafe (k€ / Werkleitung / Image):
  - »Kurz«: 1 Modul in 4 Tagen. Prämie 8 k€, +4 Werkleitung, +3 Image. Strafe −8 k€, −6 Werkleitung, −5 Image.
  - »Mittel«: 2 Module in 8 Tagen. Prämie 15 k€, +6, +4. Strafe −15 k€, −8, −6.
  - »Lang«: 3 Module in 12 Tagen. Prämie 22 k€, +8, +5. Strafe −20 k€, −10, −8.
- **Prüfung:** `endDay` zählt `done` gegen die Basis bei Abgabe, die Frist darf den Go-Live nicht überschreiten.
- **Code:**
  - `data.js`: `SC.ZUSAGE` (3 Stufen, Texte).
  - `sim.js`: `S.zusage`, drei Aktionen in `A.chef` (Zeile 330ff.), Auswertung in `endDay` nach dem Wochenrückblick (Zeile 516).
  - `ui.js:72/73`: Anzeige »Offene Zusage: Modul-Soll, Frist, Strafe« im Werkleitungsraum.
- **Bot:** Neue Strategien `zusager` (wählt »Mittel«, nur wenn Rest-Module ≥ 2 und bisherige Abnahmequote reicht) und `waghalsig` (immer »Kurz«, sobald keine offen ist).
- **Test:** Erfüllt und gebrochen werden je einmal durchgespielt. Prämie und Strafe stimmen. Zweite Zusage ist blockiert, solange eine offen ist. Eine Zusage ohne Fristende zum Spielende ändert nichts.
- **Bot-Ziel:** `zusager` etwa 3 bis 8 PP über `gut`, `waghalsig` 5 bis 15 PP darunter. Vermutung, die der Bot erst belegen muss.

**Hinweise**
- **Reihenfolge:** Erst B (klein, hält die Balance stabil), dann A mit Image, dann C.
- **Zufallsstrom:** Die neuen Würfe in `planDay`/`planVisits` verschieben die Gag-Folge von `rngF` je Seed. Das ist ok, aber die Easter-Egg- und Flurfunk-Tests prüfen, ob sie feste Werte erwarten.
- **Optik:** Die Optikänderung berührt `ui.js` und `building.js`, nicht die Simulation. Sie kann parallel laufen.
- **Namensregel:** Alle neuen Texte nutzen nur Rollen (Werkleitung, Vorstand, Controlling, Bediener). Nur Christian hat einen Namen.

## Review
**Review v0.3.0, Stand: nur gelesen, nichts ausgeführt.** Ich habe `js/sim.js` und die Treffer in `data.js`, `ui.js` und `tools/bot.js` geprüft. `building.js`, `css/style.css`, `index.html`, `audio.js`, `main.js` und die Tests habe ich nicht gelesen. Das Ergebnis der Namensregel und die 47 Tests nehme ich aus deinem Bericht.

**1) Fehlerliste**

Keine hohe Schwere gefunden. Die Party-Sperre kann nicht dauerhaft blockieren: Das Party-Ereignis wird jeden Tag neu geplant, solange `S.ev.party` fehlt (`sim.js:142`). Ein offenes `pending` wird in `endDay` zurückgestellt (`sim.js:555`). Die Tranche kann nicht negativ werden (`Math.max(0,k)`, `sim.js:365`).

| Schwere | Stelle | Befund und Fix |
|---|---|---|
| mittel | `ui.js:207` | Die Hilfe nennt noch »Tranche, Vorschuss, Berater«. Der Vorschuss ist jetzt der Kredit. Fix: »Tranche, Kredit (8 % Zins freitags), Berater«. |
| mittel | `ui.js:146` | Das Toast »17:00 Feierabend! … Raus über die Pforte« erscheint auch, wenn die Pforte wegen der Party gesperrt ist (ab Tag 14). Fix: bei `partyToday` stattdessen »Erst die Party in der Kantine«. Dazu `ui.js:211`: den Satz zur Party-Sperre ergänzen. |
| mittel | `sim.js:68-71` | Wird das Rätsel erst an Tag ≥ 18 entschieden und dann »Ticket« gewählt, kommt `ticket2` am nächsten Tag. Der Text »Bis Tag 18« stimmt dann nicht. Fix: Rückkehr auf `Math.max(18, S.day + 1)` setzen, oder `ev.ticket = S.day` setzen und die Ticketnummer im Text weglassen. |
| niedrig | `sim.js:68-71` | `ticket2` zählt `stats.faults++` auch bei einer Station, die schon steht. Außerdem steht die Meldung nur in `msgs`, nicht im `dayLog`. Fix: `if (!st.fault)` davor, `say()` statt `msgs.push`. |
| niedrig | `sim.js:67`, `sim.js:438` | Der Kaffee-Text sagt »Cutover-Wochenende«, auch wenn das Ereignis wegen `big.length` (Tag 13, Übernahme) oder Burnout auf einen anderen Tag rutscht oder SAP längst erledigt ist. Fix: Text nach `S.sap.state` und `weekday` variieren. Die Wochenend-Energie −4 (`sim.js:644`) gilt auch bei Kantinenkaffee. Das ist so gewollt, aber im Text nicht erkennbar. |
| niedrig | `sim.js:142` | Die Party steht für »16:30«, kommt aber bei vollem Terminplan erst bis etwa 16:55 (`last.at + 25`). Fix: den Text auf »ab 16:30« stellen oder das +25 für die Party weglassen. |
| niedrig | `sim.js:23` | `trancheCut` ist im Startzustand nicht initialisiert. Es läuft nur über `|| 0`. Fix: `trancheCut: 0` ergänzen. Außerdem verfällt der Rest der Kürzung, wenn die Tranche kleiner als die Kürzung ist. Das ist ok, aber der Text verspricht −10 k€. |
| niedrig | `data.js:268`, `ui.js` | »5 k€« steht fest im Text, der Wert kommt aus `T().rival.cost`. Es droht Auseinanderlaufen bei Balance-Änderungen. Fix: den Text aus dem Wert erzeugen. |
| niedrig | `ui.js:62` | »Cutover Freitag Tag 10« ist fest einkodiert. Das stimmt nur, solange Kick-off an Tag 6 ist. Das ist aktuell der Fall, ein Fix ist optional. |

Spielstand: Gespeichert wird der ganze Zustand `S`, und `load()` verwirft alles mit anderer `VERSION`. Alte 0.2-Saves sind damit sicher ausgeschlossen. Neue Felder wie `ev`, `kredit` und `partyMin` sind abgedeckt. Die Kredit-/Score-Rechnung ist neutral: Das geliehene Budget zählt mit `/2` ein, der Saldo geht mit `−kredit/2` wieder ab, nur die Zinsen kosten wirklich. Das ist vertretbar.

Ton und Namensregel: Aus den Treffern fand ich keinen Verstoß. Das Tool deckt nur 20 Dateien ab, ob `building.js` und die CSS-Texte dabei sind, habe ich nicht geprüft.

**2) Balance-Urteil**
- Die Invariante »beste Strategie ist vernünftig« ist vertretbar. fleissig führt mit 70 % gegenüber 60 % für gut. Bei n=300 sind das etwa 10 PP und rund 3,5 Standardfehler, der Vorsprung ist also echt.
- Der Preis dafür ist real: 87 von 300 Partien (29 %) gehen an der Familie verloren, und die Schranke liegt bei 20 %. Das ist ein ehrlicher Kompromiss aus Überstunden und Samstagsschicht.
- Achtung: Die Party erlässt ab Tag 14 Überstunden. Das stärkt fleissig zusätzlich. Dass die Invariante nach dem Messergebnis gelockert wurde, solltest du im Commit offen sagen.
- ohneGegen = gut (beide 60 %) heißt: Die Gegenmaßnahme ist wertlos, Ignorieren ist gleich gut. Das Rivalen-Eingreifen ist damit Flavour, kein Entscheidungsdruck. Es ist akzeptabel für 0.3.0. Wer Gewicht will, erhöht das Süd-Malus (Tranche −10 → −15) oder macht die Nord-Strafe länger.
- sapChaos mit 46 % liegt 14 PP unter gut, die Schranke liegt bei 8 PP. Das passt, und der Chaos-Pfad ist zu 100 % abgedeckt. Er bleibt aber fast so gut wie ohneSchichtplan (45 %). Das ist ein spielbarer Risikopfad, kein Fehler.
- Die vier Zielbereichs-Warnungen sind alt oder Zielband-Fragen. workaholic 0 % ist gewünscht, das Band 25–45 ist falsch. meetingfan 12 % ist als Abschreckung plausibel. Ändere die Bänder, nicht das Spiel. ablenkbar (29 %) und sparfuchs (26 %) liegen knapp daneben, kein Handlungsbedarf.
- zusager (56 %) liegt unter gut (60 %). Die Zusage lohnt sich also nicht. Das ist im Rauschen, aber ein Hinweis, dass die Prämie etwas höher sein darf.

**3) Gesamturteil**

Releasefähig als 0.3.0 lokal: **ja**, nachdem die zwei mittleren UI-Texte (Vorschuss → Kredit, Party-Toast) korrigiert sind. Der Ticket-Randfall und die Zielbänder sind optional. Der Rest ist Politur für 0.3.1. Nicht geprüft und daher nicht bestätigt sind Optik (`building.js`, CSS) und die Testabdeckung der neuen Ereignisse (Party-Sperre, Ticket Tag 18, Kredit-Zins).

## Recheck
Ich habe die Fixes und building.js gelesen und bin beim Abschluss. Die Tests und den Bot habe ich nicht selbst laufen lassen, ich stütze mich auf Ihre Zahlen.

**Fixes: korrekt**
- Ticket (`js/sim.js:496`, `:68-71`): `Math.max(18, Tag+1)` stimmt. `ticket2` kommt nur einmal und löst nur einen Fehler aus, wenn die Station nicht schon `fault` hat. `say()` ist vorhanden.
- Rivalen (`js/sim.js:482-483`, `js/data.js:64`): Die Texte kommen aus `T().rival` (cost 5, cut 15). Der Süd-Malus läuft über `trancheCut`, wird in `newGame` initialisiert (`:23`) und in `:365` verrechnet und zurückgesetzt. »Image −7« im Text passt zu −3 und −4 im Code.
- Zusage-Prämien 10/20/28 (`js/data.js:271-273`), Zielbänder (`tools/bot.js:134`) und der Party-Text »ab 16:30« (`:72`, `:441`) stimmen.
- Das 17:00-Toast (`js/ui.js:146`) stimmt.

**Offene Punkte (alle klein)**
1. **Niedrig, `js/building.js:75`:** `partyDay()` ist ab Tag 14 schon morgens wahr. Die Kostüme erscheinen also ab 8:00, die Party beginnt aber erst um 16:30. Das ist nur Optik. Ein Zeitfilter (`S.minute >= 16*60`) wäre stimmiger.
2. **Niedrig, `js/building.js:84`:** `drawMan` malt das Kostüm auch für Figuren, die nach der Party noch am selben Tag herumstehen. Das ist gewollt, aber ungetestet.
3. **Niedrig, Doku, `docs/BALANCE-v0.3.md:30`:** »meetingfan bleibt klar schwächste aktive Strategie« stimmt nicht. meetingfan_plus liegt mit 5 % unter meetingfan mit 12 %.
4. **Niedrig, Doku, `docs/BALANCE-v0.3.md:32`:** berater steht mit »53« im Vergleich, die Messtabelle zeigt 52.
5. **Niedrig, Doku, `README.md:19`:** Dort steht noch »Vorschuss«. Der Vorschuss ist ersetzt durch den Kredit (so auch in `docs/RELEASE-v0.3.md:8`). Das README sollte Kredit sagen.
6. **Niedrig, `docs/KONZEPT.md:45`, `:153`:** Das Konzept beschreibt noch den Vorschuss. Es ist als historisch lesbar, ein Hinweis »seit 0.3 Kredit« wäre trotzdem ehrlicher.
7. **Info:** `docs/RELEASE-v0.3.md` nennt für das Ticket »Tag 18«. Im Code ist es `max(18, Tag+1)`, also nie früher als Tag 18 und bei spätem Rätsel später. Der Wortlaut »frühestens Tag 18« wäre genauer.

**Balance-Doku:** Sie ist ehrlich. Die Abweichungen sind offen benannt: fleissig vor gut, ohneGegen gleich gut, die zwei Warnungen und die geänderten Bänder. Bei den Bändern ist die Begründung »passten nicht zur Abschreckung« plausibel. Sie wurden aber nach der Messung angepasst, und das steht auch so da.

**building.js:** Ich habe keinen Fehler gefunden. Die zwei Scheiben von `prodWindow` teilen sich eine Szene (x0−sx ergibt 259+v in beiden), das Clipping ist sauber (`save`/`restore`), und `press` und `drawHall` haben keine Grenzprobleme.

**Gesamturteil:** Ja, freigabefähig als 0.3.0 lokal; die Punkte 3 bis 6 sind Doku-Kosmetik und können vorher oder nachher korrigiert werden.

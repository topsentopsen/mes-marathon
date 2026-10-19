# MES-Marathon: Review v0.4.0 (Claude Code)

Stand 19.10.2026. Claude Code hat geplant und zweimal geprüft, nur lesend (Read/Grep/Glob). Grok Bot hat umgesetzt. Unter jedem Review steht, was daraus geworden ist.

## Plan v0.4
# Plan MES-Marathon v0.4.0 »Leitstand«

Ich habe die genannten Dateien gelesen. `/workspace/sender-chef` habe ich nicht geöffnet, der Plan baut nur auf dem v0.3-Code auf. Auch die UI-Funktionen in `js/ui.js` habe ich nur überflogen, nicht im Detail gelesen.

## Priorisierung
- **v0.4:** Fenster pro Etage, Markt (mit Agentur als Marktartikel), Planen mit Prognose, Balance, 2 neue Gags, Tesla-Reichweite, »Werk des Jahres« als Titel.
- **v0.5:** Ausschreibung/Auktion, Aufzug-Studio, echter zweiter Siegpfad.

## 1. Fenster pro Etage (reine Optik, ohne Sim-Änderung)
- **Slots:** `drawFloor` in `js/building.js:108` hat nur für `f===2` zwei Fenster, bei x=259 (42 breit) und x=360 (44 breit). Für alle Etagen nutze ich dieselben Slots. Die Bilder bei x=262/372 entfallen dort. Die Türen bei x=122, 186 und 330 mit ±26 Schild bleiben unberührt.
- **Umbau:** `prodWindow(x0,y0,w,h,sx)` bekommt den Parameter `view`. Danach folgt ein `switch` über je eine kleine Funktion pro Etage. Die Clip-Technik (`ctx.save`, `ctx.clip`) bleibt wie bisher.
- **Ansichten:**
  - **Feld (0):** der bisherige Panorama-Inhalt (Roboterarm, Förderband, Extruder).
  - **Steuerung (1):** Schaltschrankreihe mit SPS-LEDs. Eine LED blinkt rot, wenn `S.stations` eine Störung hat.
  - **Leitebene (2):** Leitwarte mit Monitoren. Die Kurven kommen aus `S.kpiHist`, die Ampel aus `kpiIndex`.
  - **MES (3):** Serverraum von oben mit Racks. Rack 4 ist rot, wenn `!S.server.up`.
  - **ERP (4):** Parkplatz mit Lkw, Tesla und Schornstein. Die Farben kommen aus `skyCols(min)`.
- **Test:** Neuer Test `FLOORS-Türen unverändert`. Er vergleicht `x`, `label` und `room` aller 15 Türen mit einer festen Kopie aus v0.3. Dazu kommt `browser-check` mit je einem Frame pro Etage.
- **Risiko:** Keines für die Balance. Die Performance ist unkritisch (10 Scheiben).

## 2. Markt mit Tagesrotation (Controlling)
- **Neuer Zufallsstrom:** `S.rm`, abgeleitet aus dem Seed wie `rf`. Damit bleibt `rs` je Seed gleich. Der Test »eigener Zufallsstrom« wird um `rm` erweitert.
- **Daten:**
  - `S.markt = {day, offers:[{k,price,sell}], bought:0}`
  - `SC.MARKT`: 7 Artikel. Jeder hat `id`, `label`, `base` und `eff`. Der Preis ist `base × (0.8…1.3)`, gewürfelt mit `rm`.
- **Artikel:**
  - Berater-Tagespaket: +1 Paket für 12–18 k€.
  - Ersatzteile: `partsUntil = day+3`, 6–10 k€.
  - Altlizenz verkaufen: +10–18 k€ und Image −1. Das ist die Spar-Quelle.
  - Imagekampagne der Agentur: Image +4, 12–18 k€. Das ersetzt »Nachrichten/Agenturen«.
  - Zeitungsente: Image +2 oder Werkleitung +2, 6 k€.
  - Zwei weitere Artikel mit kleinem Effekt.
- **TUNE:** `markt: {n: 3, spread: [0.8, 1.3], maxPerDay: 1}`. Die Preise stehen in `SC.MARKT`.
- **Aktion:** `A.controlling` bekommt `m0`, `m1`, `m2`. Die Tabelle der Angebote zeichnet `renderRoom` (Funktion `marktTable` in `ui.js`). `planDay` erzeugt die Angebote. Der Preis liegt bei der Aktion, die Auszahlung läuft über `spend`.
- **Bot:** Neue Regeln für `gut`: Das Berater-Paket wird gekauft, wenn der Preis ≤ 15 und das Budget > 50 ist. Dazu kommt eine neue Strategie `marktfan`, die jeden Tag das billigste Angebot nimmt.
- **Test:** Angebote sind je Seed und Tag gleich. Es gibt höchstens einen Kauf pro Tag. Preise liegen im Korridor. Das Budget bleibt endlich.
- **Risiko:** Berater-Pakete ersetzen teurere Berater. Deshalb bleibt `maxPerDay` bei 1. Außerdem prüfe ich, dass `gut` höchstens +4 PP gewinnt.

## 3. Planen mit Prognose (Leitstand)
- **Daten:** `S.prog = {week, band, melone}`.
- **Aktion:** Am Wochenstart gibt Christian eine Prognose ab. `p_lo`, `p_mid` und `p_hi` stehen für die Bänder des KPI-Index am Freitag, relativ zu `kpiPath`. Die Aktion kostet 20 Min.
- **Auswertung** im Freitags-`endDay`:
  - Treffer: Werkleitung +4, Image +2.
  - Eine Stufe daneben: nichts.
  - Zwei Stufen daneben: Werkleitung −3.
- **Satire »Wassermelone«:** Die Aktion `melone` meldet »alles grün«, egal wie die Zahlen stehen. Sie gibt sofort Werkleitung +3. Mit 30 % Wahrscheinlichkeit (Würfel aus `rm`) kommt das Audit. Dann gibt es Image −6 und Werkleitung −6. Das ist ein bewusstes Risiko mit negativem Erwartungswert.
- **Bot:** `plan: true` wählt das Band aus `kpiScore − kpiPath`. Das ist legitim, weil die Zahl im HUD steht.
- **Test:** Treffer, Fehlschuss und Melone mit festem Würfel. Die Prognose lässt sich nur einmal pro Woche abgeben.
- **Risiko:** Der Effekt ist klein (±4). Wirkt `plan` bei `gut` um mehr als 3 PP, senke ich den Treffer-Bonus auf +3.

## 4. Neue Gags
1. **Wassermelonen-KPI:** siehe Punkt 3. Außen grün, innen rot.
2. **SAP-Hotline** (Büro, `hotline`):
   - Nur im Zustand `migration`, höchstens einmal pro Tag.
   - 30–60 Min. Warteschleife mit Jingle. Mit 50 % Wahrscheinlichkeit gibt es +1 Stammdaten-Paket, sonst nur Stress (Energie −3).
   - **TUNE:** `hotline: {p: 0.5, min: [30, 60]}`.
   - Beim Chaos-Pfad ist sie gesperrt. So bleibt die Invariante `sapChaos` ≥ 8 PP unter `gut` erhalten.
3. **Tesla-Reichweite:** Ein Textbaustein statt 20 Einzeltexte. »Reichweite heute: {430−11·day} km. Gestern waren es mehr.« Er steht im Tesla-Besuchstext (`visitText`, `case 'tesla'`) und im Ticker. Keine neuen Felder.

Der »Pappkamerad« (Digitaler Zwilling in Meetings) geht nach v0.5. Er greift direkt die Meeting-Invarianten an.

## 5. Zweiter Siegpfad (nur Titel)
Bei einem Sieg mit allen 4 KPIs im Ziel und Image ≥ 80 setzt `checkEnd` `S.result.titel = 'Werk des Jahres'`. Der Titel gibt +300 Punkte. Er verändert das Siegen selbst nicht und ist deshalb balanceneutral.

## 6. Balance

**sparfuchs (26 %, Ziel 35–55):** 218 von 300 Partien enden mit »Controlling stoppt«. Der Bot nimmt nie die Tranche (30 k€ pro Woche). Der Median liegt bei −43 k€.
- **Legitim:**
  - Bot-Regeln, die nur HUD-Werte nutzen: `kredit: true` (aktiv bei Budget < 10), Altlizenz verkaufen im Markt, kein Berater, kein `care`.
  - TUNE: `kredit.rahmen` 60 → 70, `cost.daily` 1 → 0.8, `cost.sap` 10 → 8. Das ist mäßig und wirkt auf alle.
- **Schummeln:**
  - Sonderfälle im Sim nach Strategiename.
  - Der Bot liest versteckte Felder wie `st.pend` oder `server.crashAt`.
  - Strategien pro Seed einzeln abstimmen.
  - Den Check lockern, statt die Zahlen zu ändern.
- **Reihenfolge:** Erst die Bot-Regel und der Markt, dann messen. Erst danach drehe ich an TUNE.

**ablenkbar (29 %, Ziel 30–50):** `visit:'listen'` nimmt immer `opts[0]`, also die zeitintensive Option bei Tesla, Italiener, Ahnungslos, Altwerk und Flurfunk.
- **Messen:** Zuerst zähle ich, wie viele Minuten pro Besuchstyp verloren gehen.
- **TUNE (alle Strategien):** `visit.tesla` 0.55 → 0.50, Tesla-`duo` 0.6 → 0.5.
- **Bot:** `listen` darf `rivale` und `raetsel` wie `smart` entscheiden. Die Frage der IT-Chefin beantwortet er schon jetzt über `P.pyr`.

**Prüfungen nach jeder Änderung** mit `node tools/bot.js 300 --check`:
- Die harten Invarianten müssen halten.
- `gut`, `fleissig` und `berater` dürfen sich um höchstens ±5 PP verschieben.
- `meetingfan` muss ≥ 15 PP unter `gut` bleiben.
- Bänder: `ablenkbar` 30–50, `sparfuchs` 35–55.

## 7. Umsetzungsreihenfolge
1. `VERSION` 0.4.0, Save-Version und neue Felder.
2. Fenster pro Etage und Türen-Test.
3. Bot-Messung als Basis, dann Balance-Schritt A (Bot-Regeln für `sparfuchs`/`ablenkbar`).
4. Markt, dann messen.
5. Prognose und Wassermelone, dann messen.
6. Hotline, Tesla-Reichweite und Titel.
7. TUNE-Feinschliff, falls die Bänder noch nicht stimmen.
8. `BALANCE-v0.4.md`, Release-Notes, Namensregel und Playthrough.

## 8. Gesamtrisiko
Markt und Prognose geben beide Budget oder Werkleitung dazu und können das Spiel leichter machen. Mit `best > 75` schlägt der Check an. Zusätzlich beobachte ich, ob `fleissig` weiter vorn liegt. Wenn ja, darf `bot.js` die Invariante nur mit Begründung ändern, wie schon in v0.3.

## Review 1
# Review MES-Marathon v0.4.0

Das Review beruht auf dem Lesen des Diffs. Ich habe weder die Tests noch die Bot-Läufe gestartet, die Balance-Zahlen sind also die aus deiner Nachricht. Dasselbe gilt für `claude_plan04.log`: Ich habe die Datei nicht geöffnet, weil mein Befehl dafür nicht freigegeben wurde.

## Hoch

1. **Burnout am Donnerstag überspringt die Freitagsauswertung** (`js/sim.js:668`, Auswertung bei ca. 624–633).
   - `S.day++` läuft nach dem `weekday===4`-Block. Wer donnerstags ausbrennt, landet am Freitag, ohne dass Prognose und Wassermelonen-Audit ausgewertet wurden.
   - Folgen: Die Melone bringt +3 Werkleitung ohne Audit-Risiko. Ein Prognose-Treffer wird nicht honoriert und auch nicht bestraft. Der Wochenrückblick fällt aus, das war schon in v0.3 so.
   - Fix: Den v0.4-Block in eine Funktion `wochenAuswertung(S, R)` auslagern. Sie läuft im Freitags-`if` und noch einmal, wenn der Burnout-Sprung auf einen Freitag fällt (`if (weekday(S)===4) { fri = true; wochenAuswertung(S,R); }`). Die Funktion muss mit `prog.k=null` und `melone=-2` idempotent sein. Falls der Burnout selbst am Freitag passiert, ist ohnehin alles gelaufen.
   - Wer eine Pause nach dem Sprung will, kann die Auswertung auch nur auslassen und `melone`/`k` zurücksetzen. Die Auswertung nachzuholen ist aber fairer.

## Mittel

2. **Ton-Knopf schaltet bei »Ton: tippen« den Ton ab** (`js/ui.js:261`, `js/audio.js:388`).
   - Der Capture-Listener entsperrt bei `touchend`/`click` zuerst. Danach läuft `onclick` und kippt `muted` auf `true`.
   - Wer den Knopf mit der Beschriftung »Ton: tippen« antippt, hat danach »Ton aus«. Das ist wahrscheinlich genau der Handy-Fall.
   - Fix: Im `onclick` zuerst `const war = A.state().ctx === 'running'` lesen. Wenn nicht stumm und `!war`, nur entsperren und `play` aufrufen, nicht toggeln. Das gilt auch für die Taste M.

3. **Der Markt-Zufallsstrom hängt vom Spielerverhalten ab** (`js/sim.js:117`, `:324`).
   - Hotline und Melonen-Audit ziehen aus `rngM`. Die Zahl der Ziehungen in `planMarkt` hängt zusätzlich von `S.lizenzen` ab.
   - Ob der Spieler die Hotline nutzt, verschiebt damit alle späteren Marktangebote desselben Seeds. Der Test prüft nur Tag 1.
   - Fix: In `planMarkt` einen Tages-Seed setzen, z. B. `S.rm = ((S.seed ^ Math.imul(S.day, 0x9e3779b1)) & 0x7fffffff) || 11`. Hotline und Audit können dann weiter `rngM` nutzen.

4. **Prognose »im Plan« kann nie »klar daneben« sein** (`js/sim.js:337`, `:626`).
   - Mit drei Bändern liegt `p_mid` höchstens eine Stufe daneben. Wer immer die Mitte tippt, riskiert nichts und kassiert bei jedem Treffer +4 Werkleitung und +2 Image.
   - Fix: Einen Abzug (−1) auch bei einer Stufe daneben einführen, oder den Strafbetrag für `p_mid` zählen lassen. Alternativ: Treffer bei »im Plan« nur halb zählen.

5. **Balance-Änderungen sind nicht sauber begründet.**
   - Das Bot-Rauschen bei 300 Partien beträgt etwa ±5 PP (95 %-Intervall). Ob `ohnePlan` 56 gegen `gut` 60 etwas aussagt, ist offen. Die Seeds sind für alle Strategien gleich, das hilft etwas. Gib die gepaarte Differenz oder n=1000 an.
   - sparfuchs 26→54 und ablenkbar 29→35 kommen laut deiner Beschreibung von der neuen Basisregel `markt:'klug'`. Das ist keine Spielbalance-Änderung, sondern ein Bot-Vergleich mit anderem Verhalten. Das Lizenz-Geld (ca. 40 k€) ersetzt faktisch die Tranche und lässt sparfuchs an die Obergrenze 55 stoßen. Das ist legitim, aber dokumentiere es als Folge der Lizenzen und nicht als Rückkehr in die Zielzone.
   - Die TUNE-Senkung von `visit.tesla` und `duo` auf 0.5 (`js/data.js:67`) trifft alle Strategien global. Notiere, welche Zahl sie ausgleichen soll. Meiner Meinung nach gehört das Nachjustieren an den neuen Hebeln (Prognosekosten, Markt-Preise), nicht an alten Besuchsraten.
   - Die Prognosekosten von 20 auf 5 Min. zu senken, bis der Bot nichts mehr verliert, ist ein Bot-Artefakt. Der Bot liest `prognoseBand` direkt aus der Simulation und ist damit ein perfekter Beobachter.

6. **Audio-Fix trifft die wahrscheinlichen Ursachen.**
   - **iOS Safari:** Das stumme, geloopte `<audio>` und `audioSession='playback'` sind die gängige Lösung gegen den Stummschalter. Der zusätzliche Entsperrer in `touchend` ist ebenfalls richtig, denn `touchstart` zählt auf iOS nicht als Aktivierung.
   - **Android Chrome:** `click` und `touchend` reichen.
   - **Nebenwirkungen:**
     - `playback` unterbricht fremde Musik und Podcasts und kann ein Lockscreen-Widget (»Now Playing«) erzeugen.
     - Der Hinweis erscheint bei jedem Seitenaufruf auf iOS.
     - `A.ready=true` wird auch gesetzt, wenn der Kontext noch `suspended` ist. Das ist harmlos, weil die Taktung an `currentTime` hängt.
     - Fehlt die Wiedergabe-Berechtigung dauerhaft, ruft jeder Tipp `unlock()` und `load()` auf. Die Kosten sind klein.
   - Nicht geprüft: kein echtes Gerät, kein CSP-Header gefunden (`index.html` enthält keinen).

## Niedrig

7. Die Dauer-Texte sagen »3 Tage«, aber `partsUntil`, `tonerUntil` und `careUntil` mit `>= day` gelten 4 Tage (`js/sim.js:130–133`). Entweder `day + 2` setzen oder den Text auf »4 Tage« ändern.
8. Die Markt-Tabelle (`js/ui.js` `marktHtml`) wiederholt die drei Angebote, die auch als Knöpfe dastehen. Die Knopftexte (»Markt: Berater-Tagespaket (1 Paket Requirements/Spezifikation) für 15 k€«) sind auf dem Handy sehr lang.
9. Die Ton-Knopf-Beschriftung mit Emoji ist breiter als `min-width: 72px` (`css/style.css:69`). Das kann die Kopfleiste umbrechen.
10. Speicherstände aus v0.3 werden stillschweigend verworfen (`js/sim.js:726`). Ein Hinweis beim Start wäre fair.
11. Der Wassermelonen-Bericht ist im Schnitt leicht positiv, wenn der Index nicht unter Plan liegt, denn dann gibt es +3 ohne Risiko. Der Bot `melone` (57 gegen 60) bestätigt das: kein Ausbruch.

## Texte

Comedy passt, keine Beleidigungen, keine Namen außer Christian. »Werk Mitte« stimmt mit `SC.PLANT` überein. »Synergie & Söhne« ist erfunden und unauffällig.

## Gesamturteil

**Funktional solide, aber noch nicht freigabereif.** Das Hauptproblem ist Befund 1 (Burnout am Donnerstag umgeht die Auswertung und macht die Melone risikolos). Dazu kommt Befund 2, der Ton-Knopf, der auf dem Handy den Ton abschaltet.

Befund 3 (Markt-Zufall) und 4 (»im Plan« ohne Risiko) sind schnell behoben. Die Balance ist plausibel: Keine Strategie bricht aus, die Invarianten halten. Sie sollte aber mit gepaarten oder größeren Stichproben und einer klaren Begründung für die Besuchsraten abgesichert werden.

Mit den Fixes für 1–4 und kurzer Dokumentation der Balance-Gründe ist v0.4.0 freigabefähig.

### Umsetzung zu Review 1
- 1 Burnout am Donnerstag: Wochenrückblick, Prognose und Wassermelone laufen in `wochenRueckblick`/`wochenAuswertung` und werden nach dem Sprung auf den Freitag nachgeholt (Test).
- 2 Ton-Knopf: Der erste Tipp entsperrt nur (in Review 2 noch ein Race gefunden, siehe unten).
- 3 Markt: Tages-Seed in `planMarkt`, Angebote hängen nur von Seed und Tag ab (Test).
- 4 Prognose: »knapp daneben« kostet 1 Werkleitung (Test).
- 5 Balance: n=1000 gemessen. Die Senkung der Tesla-Besuchsraten hatte bei n=1000 keinen Effekt und ist zurückgenommen. Prognose bei 20 Min. kostet gut 5 PP, deshalb 5 Min. Begründungen in `docs/BALANCE-v0.4.md`.
- 7 Laufzeiten: Markt-Effekte gelten heute und zwei weitere Tage (»3 Tage«).
- 8 Kurze Markt-Knöpfe, 9 breiterer Ton-Knopf, 10 Hinweis auf alten Spielstand.

## Review 2
## Zweites Review MES-Marathon v0.4.0

**Geprüft:** Befund 1 bis 4, 7 bis 10 sind im Code umgesetzt. Ich habe nur gelesen und keine Tests ausgeführt (`node test/sim.test.js` und der Browser-Test wurden nicht ausgeführt). Der Log `claude_review04.log` liegt außerhalb des erlaubten Ordners und war nicht lesbar. Ich habe die Befunde deshalb nach Ihrer Nummerierung gegen den Diff geprüft.

Offene Befunde:

### Mittel
1. **Ton-Knopf: Race beim ersten Tipp.** `js/ui.js:259` und `:264`, dazu `js/audio.js:141`.
   - `dataset.ctx` soll den Zustand vor dem Tipp enthalten. Die Geste (pointerdown, touchstart, mousedown) entsperrt den Kontext aber schon vorher. `onstatechange` ruft danach `syncSnd` auf und setzt `dataset.ctx` auf `running`.
   - Auch das 1-s-Intervall kann dazwischenfallen. Bis zum `click` ist der Zustand also oft schon `running`. Dann schaltet der erste Tipp den Ton ab, genau der Fehler, den der Fix beheben sollte.
   - Der Test (`test/mobile-audio.js`) kann das übersehen, weil Puppeteer pointerdown und click sehr schnell hintereinander schickt. Echte Finger oder Mausklicks haben 50 bis 150 ms Abstand.
   - **Fix:** Den Zustand nicht aus dem DOM lesen. In `audio.js` `gesture()` vor `A.unlock()` den Zustand festhalten, zum Beispiel `A._ctxBeforeGesture`. Die Zeit der letzten Entsperrung geht auch (`A._unlockedAt`). Im Handler dann `was = running` nur gelten lassen, wenn die Entsperrung nicht in der aktuellen Geste war.
   - Alternativ `syncSnd` nur ohne gedrückte Taste ausführen. Zusätzlich im Test eine Verzögerung von 100 ms zwischen `touchstart` und `click` einbauen.

### Niedrig
2. **Burnout-Sprung auf Freitag lässt Image ungeklemmt.** `js/sim.js:674`.
   - `wochenAuswertung` läuft nach `S.image = clamp(...)` in Zeile 660. Treffer (+2) oder Melone (−6) können Image über 100 oder unter 0 bringen.
   - **Fix:** Nach dem Aufruf `S.image = clamp(S.image, 0, 100)`.
3. **Burnout am Donnerstag überspringt den Wochenrückblick.** `js/sim.js:636` bis `:639`, `:674`.
   - Die Zeilen 636 bis 639 (−4 ohne Bericht, oder ±5 nach KPI) laufen nur am echten Freitag. Ein Burnout am Donnerstag entzieht sich also dieser Wertung, der Wochenrückblick-Abzug entfällt.
   - Zumindest in `docs/BALANCE-v0.4.md` offen nennen. Oder die Rückblick-Zeilen ebenfalls in die Funktion ziehen.
4. **README verweist auf eine fehlende Datei.** `README.md:11` nennt `docs/REVIEW-v0.4.md`, die Datei existiert nicht (`docs/` enthält nur REVIEW-v0.2 und REVIEW-v0.3).
   - **Fix:** Datei anlegen oder den Verweis streichen.
5. **Fenster EG-Feld und 3 MES zeigen nicht alle Stationen.** `js/building.js:117`, `:195`.
   - In Etage 3 liegen die Stationen 2 bis 4 (x = 46, 67, 88) zwischen den beiden Scheiben (0 bis 42 und 101 bis 145). Sie sind nie sichtbar.
   - Ihre Störung blinkt also nirgends, obwohl die Doku das verspricht.
   - **Fix:** Stationsabstand 21 auf etwa 10 verkleinern, oder die Doku auf »einige Stationen« ändern.
6. **RELEASE-v0.4.md, Handy-Ton.**
   - **Überschrift** (`docs/RELEASE-v0.4.md:21`): »Fehlerbehebung« und »Ursache.« behaupten mehr, als bekannt ist.
     - **Fix:** »Behebungsversuch (nicht am Gerät verifiziert)« und »Vermutete Ursachen«.
   - **Ursache 1** (Z. 23): Die Quelle ist die Safari-Audio-Session-Dokumentation. »Hauptursache, sehr wahrscheinlich« ist als Hypothese ehrlich. Sie ist durch keinen Test belegt.
   - **Ursache 2** (Z. 24): »Nachgestellt im Test« gilt nur für Headless-Chrome-Emulation, nicht für iOS. Das gehört dazu.

### Beurteilung der Handy-Ton-Beschreibung
Insgesamt ehrlich: Der Abschnitt nennt die fehlende Gerätprüfung und die Nebenwirkung auf fremde Musik. Die Gewichtung ist aber zu sicher, siehe Punkt 6.

### Sonstiges, kein Befund
- Tesla-Raten stehen wieder auf 0.55 und 0.6, die Doku passt dazu.
- Die Zahlen in `BALANCE-v0.4.md` stimmen mit Ihren neuen n=1000-Werten überein.
- Die 63 Tests passen zur Anzahl in `test/sim.test.js`.

## Gesamturteil
**Freigabefähig als 0.4.0 lokal: ja, mit einer Bedingung.** Befund 1 (Ton-Knopf-Race) sollte vorher behoben werden, sonst ist der Kern-Fix des Release nicht sicher. Alle übrigen Befunde sind kosmetisch oder dokumentarisch und lassen sich nachziehen.

### Umsetzung zu Review 2
- 1 Race beim ersten Tipp: Der Gesten-Listener merkt sich, wann er einen nicht laufenden Kontext entsperrt hat (`_gestureUnlockAt`). Der Ton-Knopf schaltet nicht um, wenn das in derselben Geste war. Test mit langsamem Tipp (150 ms).
- 2 Image und Werkleitung werden nach der nachgeholten Freitagsauswertung geklemmt (Test).
- 3 Der Wochenrückblick wird nach einem Burnout am Donnerstag ebenfalls nachgeholt.
- 4 Diese Datei.
- 5 MES-Draufsicht: alle sieben Stationen liegen jetzt in den sichtbaren Scheiben.
- 6 Release-Notes: »vermutete Ursachen«, »nicht am echten Gerät verifiziert«, Nachstellung nur in headless Chrome.

## Review 3 (kurz, nur der letzte Diff)
**Befunde (offen)**

1. **Ton-Knopf, kleiner Randfall** (`js/audio.js:389`, `js/ui.js:264`): Der Zeitstempel `_gestureUnlockAt` wird bei *jeder* Geste im Dokument gesetzt, solange der Kontext nicht läuft. Er wird nur im Knopf-Klick zurückgesetzt. Tippt jemand auf eine beliebige Stelle, der Kontext läuft dann aber wieder, und tippt innerhalb von 1,5 s auf den Ton-Knopf, wird dieser Tipp als „frisch entsperrt“ gewertet. Der Ton wird dann nicht abgeschaltet. Das tritt kaum auf und ist harmlos, der Knopf funktioniert beim zweiten Tipp. Es blockiert die Freigabe nicht.

**Zu Ihren Fragen**

- **Ton-Knopf-Race:** Gelöst. Die Capture-Listener auf `pointerdown`, `touchstart` und weitere laufen vor dem Klick. Spätere Tipps nach Tab-Wechsel, Anruf oder Sperrbildschirm setzen den Stempel neu, solange der Kontext nicht „running“ ist. Der Tipp entsperrt dann nur und schaltet nicht ab. Läuft der Kontext, schaltet der Knopf normal um. Das entfernte `dataset.ctx` wird nirgends mehr gelesen (grep).
- **`wochenRueckblick`:** Korrekt und ohne Doppelauswertung am echten Freitag.
  - Der Burnout-Zweig greift nur, wenn der Burnout-Tag ein Donnerstag war. Dort ist die Bedingung `weekday===4` bei `js/sim.js:639` falsch, der Rückblick läuft also nicht doppelt.
  - Danach ist der Freitag übersprungen, die nächste Auswertung kommt erst eine Woche später.
  - Bei Burnout an einem Freitag läuft der Rückblick nur einmal bei `js/sim.js:639`.
  - `wochenAuswertung` ist über `prog.k = null` und `melone = -2` idempotent.
  - Die Werte für Werkleitung und Image werden danach geklemmt.

**Urteil:** Freigabefähig als 0.4.0 lokal: **ja**. Ich habe nur den Diff gelesen und die Tests nicht ausgeführt.

### Umsetzung zu Review 3
- Randfall bewusst gelassen (harmlos, der zweite Tipp schaltet). In docs/PLAN-v0.5.md vermerkt.

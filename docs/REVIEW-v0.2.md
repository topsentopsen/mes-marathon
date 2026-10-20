# Review MES-Marathon v0.2.0

Geprüft: Commit a3c1eae (`git diff HEAD~1 -- js tools test`), alle `js/*.js`, `tools/bot.js`, `test/*.js`, `index.html`, `README.md`, `tools/portrait.py`, Konzept und Plan.
Ausgeführt: `node test/sim.test.js` (25 Tests ok), `node test/names.test.js` (ok, 17 Dateien), `node tools/bot.js 300 --check` (»CHECK OK«, aber siehe 12). Browser-Check nicht ausgeführt (kein Chrome verlangt). Es wurde kein Code geändert.

Legende: ✔ erfüllt · ◐ teilweise · ✘ nicht erfüllt

## 1. Abhakliste gegen den Auftrag

| # | Punkt | Urteil | Fundstelle / Anmerkung |
|---|---|---|---|
| 1 | Hauptfigur Christian, MES seit Jahren, Spielname MES-Marathon | ✔ | `data.js:13` (`SC.PLAYER`), `ui.js` Titel »Seit Jahren führst du das MES ein. Diesmal wirklich.«, `index.html:6` Titel, `sim.js:506` Siegtext »nach nur 7–9 Jahren«. Namensfeld entfernt (`index.html`, Browser-Check prüft `#pname`). Rest: toter CSS-Selektor `css/style.css:82` (`input#pname`). |
| 2 | Nur Christian hat einen Namen | ✔ | `names.test.js` grün. Zusätzlich gegrept: kein `Dr.`/`Frau`/`Herr` in `js/`, `index.html`, `README.md`, `tools/`. Alle Figuren nur als Rolle (`data.js:46-58`, `ui.js` `chefSays`/`schichtSays`, `building.js:9-16`). Schwäche: Die Verbotsliste (`names.test.js:6`) kennt nur die zehn alten Namen und findet neue Namen nicht. Werk Nord/Süd sind Werke, keine Personen. `docs/` ist ersetzt, Test läuft darüber. |
| 3 | Fabrik, Pyramide, Atmosphäre | ✔ | Etagen = Feld/Steuerung/Leitebene/MES/ERP (`data.js:20,38-44`, Test »Etagen = Automatisierungspyramide«). Fabrik: Sheddach, Schornstein mit Rauch, Hallenflügel mit Stationsmaschinen und Statuslampen, Förderband, Sirene-Leuchte, Schild »+ ALTWERK« (`building.js:125-185`). Schichtbetrieb: Sirene 14:00, Übergabe bis 14:20 sperrt die Halle (`sim.js:144,326`). Ton: Rauschen, Brummen, Stampfen, Sirene (`audio.js:204-246`, Stampfen nur im Track `tower`). Kantine mit Mittagessen (`sim.js:269`). Kleinigkeiten: Die Zonenlautstärke gilt nur im Track `tower`. `UI._siren` wird bei neuem Spiel nicht zurückgesetzt, die Sirene fehlt dann an Tag 1 (`ui.js:50`). Dasselbe bei »Weiterspielen« nach 14:00: Sie ertönt sofort erneut. |
| 4 | Sieben Stationen | ✔ | `data.js:21-25`, jedes Modul hat eine Teststation (`data.js:29-36`), Tafel in den Hallen (`ui.js` `stationTable`), Maschinen im Gebäude. Extrusion/EEA/DEA/DEC/Sterilisation sind nur Teststationen für Module, spielerisch dünn (Störung 4 %), aber vorhanden. |
| 5 | Figuren/Ereignisse | ◐ | Siehe Einzelpunkte unten. |
| 5a | Kollegen ohne Ahnung | ✔ | `data.js:143`, Besuch `sim.js:105`, Zufallsspruch bei Requirements `sim.js:193`. |
| 5b | Tesla-Kollege | ✔ | `data.js:118`, `sim.js:100,375`, Kaffeemaschine blockiert `sim.js:267`. Inhaltlich leichte Unstimmigkeit: »Wenn ich einen hätte« (`data.js:120`) heißt, er besitzt keinen Tesla, »Reichweite im Winter« (`data.js:122`) heißt, er hat einen. Als Pointe tragbar. |
| 5c | Kollege aus dem Nachbarbüro, redet nur mit dem Tesla-Kollegen | ✔ | Nur als Duo (`duo` 60 %, `data.js:124-128`, `sim.js:357`), nie allein. NPC `nachbar` steht im Gebäude (`building.js:13`). Aber: `summon('tesla')` holt `nachbar` immer mit (`building.js:210`), auch wenn `duo` falsch ist. Das ist ein Grafikfehler. |
| 5d | Italiener stündlich mit Geschichten | ◐ | `sim.js:102`: je Stunde 9–16 Uhr 30 % Chance, höchstens 3 pro Tag. Im Mittel etwa 2,4 pro Tag, nicht »stündlich«. Entspricht PHASEN 4.1, aber nicht dem Wortlaut des Auftrags. Fix: `italienHour` 0.30 → ca. 0.5 und `italienMax` 4. Das drückt die Balance (siehe 12), also zusammen mit Gegenmaßnahmen ändern. Texte ✔ liebevoll. |
| 5e | IT-Chefin immer mit Pyramide, taucht immer wieder auf | ✔ | Jeder ihrer Auftritte enthält die Pyramide (`data.js:136-142`, Dialog + Pyramidengrafik `ui.js` `pyramidHtml`, Quiz `data.js:107-116`). Tag 1 sicher, gerade Tage 85 %, ungerade 25 % (`sim.js:103`), dazu IT-Raum mit Pappe-Pyramide. Sicher ist »immer« nur an Tag 1. Das ist vertretbar. |
| 5f | Verpackungsautomat mit ständigen Problemen | ✔ | Innenverpackung 40 %, Außenverpackung 15 % pro Tag (`data.js:64`), 5 Sprüche (`data.js:155`), Wiederholungsstörung, Wartungsaktion, steht über Nacht (`sim.js:542`). Test vorhanden. |
| 5g | Schichtleiter mit unnötigen Meetings | ✔ | `data.js:82-88`, Spirale `sim.js:69`, abnehmender Ertrag `sim.js:259`, Quote `sim.js:468`. |
| 5h | Excel-Liste, Drucker, Serverraum | ✔ | `sim.js:239,273,280`. Excel-Datei im Büro (`ui.js`), Papierstau, Serverabsturz mit Wartung. |
| 6 | Alltag: Spezifikation, Requirements, Testläufe, Wochenendschicht, Implementation, Meetings | ✔ | Pipeline `sim.js:154-163,184-318`, Wochenende `sim.js:517`. |
| 7 | Großereignisse | ✔ | SAP Tag 6 mit Migration, Kick-off-Pflicht, ERP-Reset, Cutover Freitag, Chaos oder Wochenendschicht (`sim.js:49-56,498,527-531`). Übernahme Tag 13 mit sechstem Modul, Termin Tag 22, Altwerk-Kollege (`sim.js:57-62,106,393`). Tests vorhanden. Der Bot lässt nie Chaos auftreten (Chaos% 0 in allen Zeilen, siehe 12). Das Chaos-Pfad-Verhalten ist nur durch einen Einzeltest gedeckt. |
| 8 | KPIs, Zielwerte, Reporting, Budget | ✔ | `data.js:68-80`, `sim.js:413-445`, Leitstand-Tabelle mit Ziel und Verlauf (`ui.js` `kpiTable`), Bericht und Wochenrückblick (`sim.js:246,470`). Budget: Start, Tranche, Vorschuss, Berater, Kosten je Aktion, Sperre, Niederlage (`sim.js:305-313,475-477,507`). Dauerbrenner ja, spielerisch aber nur bei Berater/Sparfuchs fühlbar (siehe 12). |
| 9 | Elemente aus Sender-Chef/Mad TV | ✔ | Querschnitt mit Aufzug, Echtzeit-Tag mit Pause/Tempo, Besucher mit Entscheidungen, Rivalen, Abendbilanz, Highscore (`sim.js:549`), Chiptune. Zufallsereignisse Lieferant/Azubi/Audit. |
| 10 | Ton Comedy, nicht beleidigend | ✔ | Alle Texte in `data.js`, `sim.js`, `ui.js` gelesen. Kein Drama, keine Herabsetzung von Gruppen. Italiener: Nonna, Espresso, Käse, Bäckerei, »Erst essen, dann Pyramide« (`data.js:130-134`), liebevoll und er wird nie ausgelacht. Einziger Fall am Rand: »Mit einem beherzten Tritt« (`sim.js:542`) gegen die Nachtschicht-Technik und »Er sagt das seit 2019« über den Kollegen aus dem Nachbarbüro. Beides Satire über Zustände und im Rahmen. Empfehlung: Der Satz `data.js:134` (»Du siehst müde aus«) ist freundlich, so lassen. |
| 11 | Icon Christian | ✔ | Portrait (`img/portrait.png`, angesehen): volles graues Haar, kein Bart, Hemd mit Kragen und Knöpfen, Falten angedeutet, wirkt um die 40. `portrait.py` rendert 32×32, `portrait.png`, Favicon, Apple-Icon. Sprite `building.js:80,87`: graue Haarkappe mit Seitenhaar, Hemd mit Kragen und Knopfleiste, ohne Bart. Kleinigkeit: In `portrait.py` wird `img.resize((16,16))` berechnet und verworfen (toter Aufruf), das Favicon enthält ein 32er-Bild mit Größenangabe. |
| 12 | Balance | ✘ | Siehe Abschnitt 2. Grundaussage erfüllt (Meetingfan ist weit entfernt von der stärksten Strategie), aber 7 von 10 Zielbereichen aus PHASEN 10.2 werden verfehlt und `--check` meldet dennoch OK. |

## 2. Bot-Messung (`node tools/bot.js 300`, Seeds 1000 + i·7919) gegen PHASEN 10.2

| Strategie | Sieg % | Soll | Urteil | Siegtag | Niederlagen W/F/T/B | Bemerkung |
|---|---|---|---|---|---|---|
| passiv | 0 | ≤ 5 | ✔ | – | 300/0/0/0 | |
| einfach | 46 | 20–40 | ✘ (+6) | 21 | 0/0/153/9 | Zu stark, die Basis ist zu leicht. |
| gut | **72** | 55–70, Median ≤ 21 | ✘ (+2) | 21 ✔ | 0/0/84/0 | Knapp über Obergrenze. |
| ohneSchichtplan | 67 | 45–62, ≥ 3 PP unter gut | ✘ (+5) | 21 | 0/5/94/0 | Nur 5 PP unter gut ✔, aber Bereich verfehlt. |
| meetingfan | **20** | 25–40, ≥ 15 PP unter gut, Siegtag ≥ gut+1 | ◐ | 21 ✘ | 1/0/239/0 | 52 PP unter gut ✔, Bereich unterschritten (−5), Siegtag-Median nicht später (21 statt 22). |
| meetingfan_plus | 11 | ≤ gut − 8 | ✔ | 22 | 4/…/262 | Auffällig: schlechter als meetingfan ohne Schichtplan (20 %). Der Schichtplan (30 Min.) schadet hier, wenn man ohnehin zu allen Meetings geht. Das widerspricht der Absicht (»Schichtplan = bessere Alternative«) nur scheinbar, ist aber ein Hinweis auf zu viel Zeitdruck. |
| ablenkbar | 24 | 30–50 | ✘ (−6) | 22 | 0/6/222/0 | Besuche sind sehr teuer. |
| berater | 49 | 50–68, ≤ gut + 5 | ✘ (−1) | 17 | 0/0/2/**152** | Gewinnt schnell (Tag 17) oder scheitert am Budget: 51 % Budgetniederlagen. Median Budget −41. Das Spiel kippt bei Berater + Vorschuss in die Niederlage. |
| workaholic | **0** | 25–45, ≥ 35 % Familie | ✘ (−25) | – | 0/**300**/0/0 | 100 % Familie-Niederlagen, keine Variation: Die Strategie ist nie spielbar. Plan wollte Werte um 35 %. |
| sparfuchs | 37 | 35–55, Budgetniederlagen ≥ 10 % | ✔ | 19 | 0/0/0/188 | Budgetniederlagen 63 %. Plan-Zusatz »≥ 10 %« ist formal erfüllt, aber die Strategie scheitert fast nur am Budget. |

Invarianten:
- Höchste Quote bei `gut` ✔. `meetingfan` auf Rang 7 von 10 ✔ (»höchstens Rang 4« ist erfüllt, wenn man so liest, dass er nicht unter den ersten vier sein darf). Keine Strategie über 75 % ✔.
- Budgetniederlagen insgesamt 340 von 3000 = 11,3 % ✔ (Soll 5–20 %), aber ungleich verteilt: nur bei zwei Strategien.
- SAP-Chaos-Tage bei `gut`: 0 % ✔. Aber überall 0 %, weil der Bot bei Cutover immer Wochenendschicht wählt (`bot.js:84`, `BASE.we`). Der Chaos-Pfad kommt in den Läufen nicht vor.

**Kernaussage zu Punkt 12:** Wer alle nutzlosen Meetings besucht, ist deutlich schlechter (20 % gegen 72 %). Die Absicht ist erfüllt. Die Gesamtlage liegt aber etwas zu leicht (gut 72 %, einfach 46 %) und der Workaholic ist unmöglich.

**`--check` ist zu schwach:** `bot.js:99-106` prüft nur fünf Dinge (meetingfan ≥ 15 PP und meetingfan_plus ≥ 8 PP unter gut, beste = gut/berater, passiv ≤ 5, max ≤ 75). Die Bereiche aus PHASEN 10.2 werden nicht geprüft. »CHECK OK« bedeutet daher nicht »Abnahme 10.5 erfüllt«. Das README (»Siehe `docs/BALANCE-v0.2.md`«) verweist außerdem auf eine **nicht vorhandene Datei** (`docs/` enthält nur KONZEPT.md, PHASEN.md).

## 3. Fehler und Randfälle im Code

### Blocker
Keine. Das Spiel läuft, Tests und Bot-Läufe ohne Absturz, keine NaN in den Invarianten.

### Wichtig
1. **»Weiterspielen« nach dem Abend wiederholt den Tag** (`ui.js:~166`, Code unverändert aus v0.1.1, aber mit v0.2 gefährlicher). `save()` speichert nach `endDay` (Phase `abend`/`wochenende`), `cont` setzt die Phase auf `tag` zurück. Folge: Der Abend wird zweimal gewertet (KPI-Schritt, Rivalen, Familie, Budget-Tagesabzug, Rückzahlung), die Wochenendentscheidung entfällt, und `S.sap.cutover` bleibt gesetzt, ohne dass `weekend()` je läuft (Cutover wird nie aufgelöst, kein Chaos, kein Wochenende). Außerdem Save-Scumming. Fix: In `cont` bei `phase` = `abend`/`wochenende` nicht auf `tag` zurücksetzen, sondern das Abend-Overlay (oder `next`/Wochenendfenster) neu zeigen, oder erst nach `startDay` speichern; für `wochenende` das Overlay mit den Knöpfen `we0..2` zeigen.
2. **Burnout verschiebt den Wochentag** (`sim.js:494-497`). Bei Burnout wird `S.day++` ausgeführt, bevor `R.friday` berechnet wird (Zeile 497, nach Zeile 494). Beispiel (reproduziert): Burnout Donnerstag Tag 9 → Tag 10, `friday` wahr, Phase `wochenende`, danach `startDay` → Tag 11 (Montag). Der Freitag fällt komplett aus (kein Wochenrückblick, kein Cutover-Check), und umgekehrt entsteht nach einem Burnout am Freitag keine Wochenendentscheidung. Fix: `const friday = weekday(S) === 4` **vor** dem `S.day++` berechnen und verwenden, und das Cutover mit dem alten Tag prüfen. Oder `S.day++` in `startDay` über ein Flag lösen.
3. **Balance:** `--check` aufhärten und die Werte aus 10.3 nachjustieren (siehe Abschnitt 2, Fixes unten). Es fehlt die in 10.5 geforderte Begründung im Commit; der Commit trägt »(WIP)«.
4. **README verweist auf `docs/BALANCE-v0.2.md`**, die Datei gibt es nicht.

### Klein
5. **Geblockter Testlauf**: `sim.js:200` `S.minute -= 60` und danach `advance(cost)` (75 Min.) ergibt netto +15 Min., der Text sagt »30 Minuten verloren«. Das ist ein Altfehler aus v0.1.1 (dort identisch). Zusätzlich wurden die 2 k€ schon vorher abgebucht (`sim.js:199`). Fix: Zeit explizit setzen (`S.minute += 30 - cost` oder Text ändern) und `spend` erst nach der Blockprüfung.
6. **Montagsrunde und SAP-Kick-off kollidieren an Tag 6** (beide 10:00, Montag). Die Überlappungsprüfung verwirft still die Montagsrunde (`sim.js:64-80`). Kein Schaden, aber die Pflichtmeldung der Montagsrunde fehlt am SAP-Montag. Fix: Montagsrunde an solchen Tagen auf 11:15 legen oder bewusst im Text erwähnen.
7. **`UI._siren` wird bei neuem Spiel/Weiterspielen nicht zurückgesetzt** (`ui.js:50`): Die Sirene fehlt an Tag 1 des zweiten Spiels. Fix: In `newGame`/`cont` `UI._siren = 0` setzen.
8. **`summon('tesla')` holt den Kollegen ohne Arbeit auch ohne Duo** (`building.js:210`). Fix: `summon(id, p)` mit `p.duo` auswerten.
9. **Vorbesuch-Zeitfenster**: Neue Schichtleiter-Einladungen aus `gespraech` (`sim.js:211`) werden nicht gegen bereits geplante Besuche geprüft; ein Besuch kann kurz vor einem Meeting aufpoppen und das Meeting verpassen lassen (Chef −7 oder Schichtleiter −13). Fix: Beim Einfügen Besuche in `[st−20, st+45]` nach hinten schieben.
10. **`kpiPath` springt bei Tag 13**: Der Wochenpfad nutzt `S.deadline` (`sim.js:434`), der von 20 auf 22 wechselt; der Wochenrückblick am Freitag Tag 15 vergleicht daher gegen einen anderen Pfad als davor. Nur Feinheit.
11. **Spielstand-Resttext**: `ui.js` Titel »Zwanzig Tage« und Hilfe nutzen `SC.DEADLINE` (20), nach der Übernahme gilt 22. Im Spiel ok, da HUD `s.deadline` zeigt.
12. **Toter Code und Reste**: `css/style.css:82` `input#pname`; `portrait.py` toter `resize`-Aufruf; `SC.NEED_FUSION` und `SC.TUNE.cost.daily` (1 k€ pro Tag, siehe Abweichungen) ok.
13. **Test-Abdeckung**: Es gibt keinen Test für den Chaos-Pfad im Bot, keinen für `cont` nach dem Abend, keinen für Burnout, keinen für die Glücksereignisse; `T5` (Wiederholungsstörung 25 % per `rng`-Manipulation) fehlt (nur Notbehelf-Quote geprüft); `T13` Störung drückt OEE ist geprüft ✔.
14. **Namenstest** erkennt nur die bekannte Liste. Ein zusätzlicher Heuristiktest (Muster `»[A-ZÄÖÜ][a-zäöüß]+:«` als Sprecher, `Frau|Herr|Dr.` plus Großbuchstabe) würde neue Namen fangen.

## 4. Abweichungen von PHASEN.md

| Stelle | Plan | Ist | Bewertung |
|---|---|---|---|
| `TUNE.budgetStart` | 90 | 100 (`data.js:62`) | Bewusst gelockert (Balance), im Commit-Text nicht erwähnt. |
| `TUNE.meet.testFactor` | 0.8 | 0.75 (`data.js:66`) | Hebel nach 10.3 Nr. 2 gezogen, aber ohne Dokumentation. |
| `TUNE.cost.daily` | nicht vorgesehen | 1 k€/Tag (`data.js:63`, `sim.js:475`) | Neu. Sinnvoll als Dauerbrenner, im Plan nicht beschrieben. |
| `RIVALS` min/max | Nord 3–7,5, Süd 3,5–7 | 3–7, 3,5–6,5 (`data.js:16-17`) | Rivalen etwas langsamer. |
| `SC.VISITS` | Name `VISITS` | `VISIT_TEXT` | Unkritisch. |
| Aktion `schichtgespraech` | ID | `gespraech` (`sim.js:209`) | Unkritisch. |
| `berater.check` | `budget >= 0` | `budget >= 15` (`sim.js:312`) | Strenger, sinnvoll. |
| Leitstand `pause` (P2) | optional | fehlt | Streichliste, ok. |
| Besuche NPC-Animation (P2) | Streichliste | **umgesetzt** (`building.js:209-213`) | Bonus. |
| `it.review` (P2) | Streichliste | umgesetzt (`sim.js:291`) | Bonus. |
| Test T5 (Wiederholung 25 %) | verlangt | nur Notbehelf-Quote | Teilweise. |
| Test T18/T19/T20 | Bot-Determinismus, Invarianten, Smoke | in einem Test gebündelt | ok. |
| `--check` | »verletzt Ziele unten« | prüft nur Teilmenge | Abweichung, siehe oben. |
| 10.5 Spielen (30 Min.) und Browser-Check | verlangt | nicht belegt (WIP-Commit) | Offen. |
| `docs/BALANCE-v0.2.md` | nicht im Plan | im README erwähnt, fehlt | Fehler. |
| Zeilenbudget | 600–900 | +1591/−289 | Deutlich überschritten, nur Hinweis. |

## 5. Vorschläge zur Balance (nach 10.3, einzeln und mit Bot prüfen)

1. **workaholic**: Familie −13 pro Wochenendtag und `leave 19:30` kippen jede Partie. Entweder `leave` → 18:30 im Bot oder `family`-Verlust pro Überstunde (`sim.js:455`, `over/12`) auf `over/15`. Ziel 25–45 %.
2. **gut/einfach zu leicht** (72 %/46 %): `cost.test` 2 → 3 oder `visit.tesla` +0.1 (Hebel 4). Das senkt `einfach` stärker als `gut`, wenn man zusätzlich `fault.other` leicht hebt.
3. **meetingfan zu schwach** (20 %): `quotaPen` 2 → 1 oder `testFactor` zurück auf 0.8 (Hebel 2). Wirkt aber auch auf `gut`.
4. **ablenkbar** (24 %): `visit.italienHour` 0.30 → 0.25 (Hebel 3), das widerspricht aber Punkt 5d (stündlich). Besser: Zuhören-Kosten senken (Tesla 25 → 20, Italiener 12 → 10) und den Italiener öfter, aber kürzer machen.
5. **berater** (51 % Budgetniederlagen): `berater` 15 → 12 k€ oder das Bot-Verhalten `P.berater && S.budget > 30` einschränken. Das Spiel ist im Moment bei Berater + Vorschuss fast ein Todesurteil.
6. **`--check`** um die Bereiche aus 10.2 erweitern (Sieg-%-Intervalle, Siegtag-Median, Budgetanteil gesamt, Chaos ≤ 25 %), damit »CHECK OK« wirklich »Abnahme« heißt. Außerdem eine Strategie, die das Chaos auslöst (`we: 0` bei Cutover), für den Chaos-Pfad.

## 6. Gesamturteil

**Freigabefähig: nein, noch nicht als v0.2.0 (der Commit ist selbst als WIP markiert).** Inhaltlich ist der Auftrag zu etwa 90 % erfüllt (Punkte 1–11 ✔ bzw. ◐ nur beim »stündlichen« Italiener). Es gibt keinen Blocker im Sinne eines Absturzes. Offen sind das Balance-Ziel (Punkt 12), zwei Logikfehler beim Tag-/Abend-Ablauf und die fehlende Balance-Dokumentation.

**Blocker:** keine technischen. Freigabe-Blocker: (a) Balance verfehlt 7 von 10 Zielbereichen, (b) `--check` meldet fälschlich OK, (c) README verweist auf fehlende Datei.

**Top-5-Fixes**
1. `cont` nach dem Abend: Phase nicht auf `tag` zwingen; Abend/Wochenende sauber fortsetzen (`ui.js`, verhindert doppelte Bilanz und verlorenen SAP-Cutover).
2. Burnout: `R.friday` und Cutover-Prüfung vor `S.day++` berechnen (`sim.js:494-498`).
3. Balance nachziehen: Workaholic spielbar machen, `gut`/`einfach` leicht senken, `berater` entschärfen, `ablenkbar`/`meetingfan` um 5 PP anheben; danach `bot.js 300` erneut messen.
4. `bot.js --check` auf alle Zielbereiche aus PHASEN 10.2 erweitern und `docs/BALANCE-v0.2.md` mit der Messtabelle anlegen (oder den README-Verweis streichen).
5. Kleinkram bündeln: Siren-Reset (`ui.js:50`), `summon` mit `duo`, geblockter Testlauf (Zeit/Text/Budget, `sim.js:199-200`), Montagsrunde/SAP-Kick-off, »stündlicher« Italiener (Punkt 5d), toter `#pname`-CSS.

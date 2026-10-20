Ich habe alle genannten Dateien gelesen. Nichts wurde geändert, und kein Test oder Bot lief. Der Plan folgt.

## 1) Zeitmechanik
**Kernbefund:** Die Räume sind kein Overlay (`#room`), deshalb läuft die Uhr beim Lesen weiter (`main.js:8` prüft nur `overlayOpen`). Der Fix ist eine Bedingung `&& !UI.room` an dieser Stelle.

- **Uhr läuft:** beim Laufen, im Aufzug und im Haus ohne offenen Raum (wie bei Mad TV).
- **Uhr steht:** bei offenem Raum, jedem Overlay (Besuch, Protokoll, Abend, Titel, Anleitung) und in der Pause.
- **Weitere Stellen geprüft:** Ticker und Kalender sind nur Anzeigen und blockieren nichts. Sprechblasen (`building.js:285`, 3 s) sind Kulisse. `btn-menu` pausiert bereits.
- **Klick auf Tür oder Raumknopf:** `walkTo` schließt den Raum zuerst, die Uhr läuft dann wieder.
- **Alternative:** Uhr nur beim Laufen. Das wäre ein größerer Eingriff, ich rate davon ab.

**Folgefehler, den der Fix sonst erzeugt:** `UI.tick` (`ui.js:187`) wird nur aus der Hauptschleife gerufen. Wenn die Uhr im Raum steht, bleiben diese Dinge sonst aus:
- die 17:00-Warnung,
- der Burnout-Abbruch (`ui.js:191`),
- das 20:00-Ende, das `doAct:183` allein abdeckt.

Daher `UI.tick()` am Ende von `doAct` (`ui.js:184`) aufrufen.

**Tempo-Stufen.** `MIN_PER_SEC = 2` (`data.js:12`) bleibt. Neu ist `SC.TEMPO` mit den Faktoren 0,5 / 0,75 / 1.

| Stufe | Spielmin./Echtsek. | Echtsek. pro Spielstunde |
|---|---|---|
| vorher 1x | 2 | 30 |
| vorher 2x | 4 | 15 |
| vorher 4x | 8 | 7,5 |
| **Langsam (Standard)** | 1 | **60** |
| Normal | 1,5 | 40 |
| Schnell (= altes 1x) | 2 | 30 |

- `UI.speed` bleibt der Faktor (`ui.js:9`), und `playthrough.js` setzt weiter 4.
- `main.js:12` bremst die Laufgeschwindigkeit bisher mit `min(UI.speed,2)`. Bei Faktor 0,5 liefe Christian sonst halb so schnell. Ändern auf `Math.max(1, Math.min(UI.speed, 2))`.
- Tempo steht in `localStorage` unter `mesmarathon-tempo`, nicht in `S`.
- `btn-speed` (`ui.js:304`, `index.html:27`) zeigt »Tempo: Langsam«. Der Knopf wechselt zyklisch, damit er mobil bedienbar bleibt.
- Tasten `+` und `−` (`ui.js:323`) wechseln ohne Umbruch, auch Ziffernblock.
- Die Uhr (`ui.js:31`) zeigt »⏸« und »Uhr steht«, solange sie angehalten ist. Der Raumkopf (`ui.js:74`) bekommt denselben Hinweis. Der Satz »Die Uhr läuft weiter« (`ui.js:255`) in der Anleitung wird korrigiert.
- **17:00-Hinweis** (`ui.js:189`): Er wird ein kleines Overlay mit »Weiter«, weil das Ticker-Toast sonst vom nächsten Eintrag überschrieben wird. Bei 20:00 und Burnout deckt der Abend-Dialog das ab.

## 2) Lesbarkeit
Ziel ist mindestens 18 px für Fließtext (XAG 101). Die CSS-Werte werden auf `rem` umgestellt, mit zwei Stufen »Schrift Normal/Groß« (18/22 px) in `localStorage`. Strg + Plus bleibt möglich.

| Element | vorher (px) | Desktop | Handy |
|---|---|---|---|
| `#room` (`style.css:15`, `:60`) | 14 / 12 | 18 | 16 |
| Tabellen (`:24`, `:85`) | 13 / 12 | 16 | 14 |
| `.small` (`:37`) | 11 | 14 | 13 |
| Ticker (`:21`) | 14 | 18 | 16 |
| Kalender (`:76`) | 13 | 16 | 15 |
| Besuchstext `.visit p` (`:99`) | 15 | 20 | 17 |
| Overlay-Fließtext (`.box`, `:46`) | 16 | 18 | 16 |
| Knöpfe (`:9`, `:94`) | 14 / 12 | 16 | 15 |
| Protokoll (`:59`) | 12 | 15 | 14 |

- Zeilenhöhe 1,5.
- Raumtext scrollt in `#room` (`overflow:auto` ist schon da). Das Seitenverhältnis des Canvas bleibt.
- Sprechblasen: Schrift 6 → 8 px und Dauer 3 → 6 s (`building.js:285`, `:289`). Die Blasen sind bisher auf dem Handy unlesbar, und es ist rein kosmetisch.
- **Klick zum Weiter:** Nichts verschwindet mehr von allein. Ausnahme sind die Blasen, die Kulisse sind. Auf dem Single-Button-Overlay lösen Enter und Leertaste den Knopf aus. Besuche mit mehreren Optionen werden nie per Taste entschieden.
- **Vorlesen (optional, zuletzt):** Knopf und Taste V, etwa 15 Zeilen in `ui.js`.
  - Es liest `.visit`, `.say` oder den Ticker per `speechSynthesis`, Sprache `de-DE`.
  - Nur auf Knopfdruck (iOS verlangt eine Geste), `cancel` beim Schließen.
  - Fehlt die API, wird der Knopf nicht angezeigt.

## 3) v0.8-Restpunkte
- **Leertaste im Overlay:** `ui.js:322` schaltet die Pause auch bei offenem Overlay um. Neu: `if (UI._ov)` zuerst abfangen, dort gilt nur die Regel »ein Knopf = Weiter«.
- **Ticker auf dem Handy:**
  - Unter 640 px zeigt `flushMsgs` (`ui.js:24`) nur die letzte Meldung. Die volle Liste steht im Protokoll.
  - Der Ticker bekommt feste `min-height` 4,4em und `max-height` 6em mit `overflow:auto`, damit die Seite nicht springt.
  - Handy-Knöpfe bekommen mindestens 44 px Höhe.

## 4) Balance und Bot
- **Beim Menschen kostet nur noch das Laufen Spielzeit.** Das Lesen im Raum kostet keine mehr. Der Bot rechnet ohne Lesezeit, der Mensch war bisher also schlechter gestellt.
- **WALK = 8** (`bot.js:5`). Meine Schätzung (nicht gemessen): etwa 5,5 Echtsekunden je Etagenwechsel bei 80 px/s Laufen und 1,4 Etagen/s im Aufzug. Das ergibt etwa 5,5 (Langsam), 8 (Normal) und 11 (Schnell) Spielminuten. Die Messung geschieht im Browser-Check.
- **Normal ist damit auf WALK = 8 kalibriert.** Langsam ist bewusst leichter als der Bot, grob 2–3 Min. je Wechsel. Das wird in `BALANCE-v0.9` dokumentiert.
- **Entscheidungsregel:** Liegt die Messung bei Normal innerhalb 8 ± 2 Min., bleiben WALK, TUNE, Wertung, Zufall und `bot.js` unverändert. Liegt sie außerhalb, ändere ich den Normal-Faktor in `SC.TEMPO`, nie WALK. Beleg wie in v0.8: Je 3000 Partien vor und nach der Änderung, `diff` leer.

## 5) Tests
- **sim.test.js:**
  - Ein 0.8.0-Spielstand lädt (`SAVE_OK = ['0.7.0','0.8.0']`, `VERSION = '0.9.0'`), 0.7.0 ebenfalls, 0.6.0 wird abgelehnt.
  - `Object.keys(newGame)` bleibt unverändert, es gibt kein neues Feld in `S`.
  - `SC.TEMPO` hat drei Stufen mit steigenden Faktoren.
- **browser-check.js:**
  - Im offenen Raum ändert sich `s.minute` nach 1,5 s nicht, nach `closeRoom` schon. Das Gleiche gilt für Overlay und Pause.
  - Die Tempo-Stufen verhalten sich im Verhältnis 1 : 1,5 : 2 (± 25 %). `+` und `−` wirken, `localStorage` wird gesetzt und beim Reload gelesen, der Standard ist Langsam, der HUD-Text stimmt.
  - Leertaste bei offenem Overlay ändert `UI.paused` nicht.
  - Eine Aktion über 17:00 löst Hinweis und `_warned` aus. Eine Aktion bei Burnout löst `endDay` aus.
  - Die gemessenen Spielminuten je Raumwechsel werden ausgegeben (Etage 0 → 2).
  - `getComputedStyle` ergibt für `#room` mindestens 18 px.
  - Mit gestubbter `speechSynthesis` ruft der Knopf `speak` auf. Ohne API ist der Knopf weg und es gibt keinen Fehler.
- **mobile-audio.js:** Die Stage-Position bleibt nach einer langen Meldung gleich. `btn-speed` ist per Touch treffbar und mindestens 44 px hoch.
- **playthrough.js:** `wait(60)` im Raum, Spielminute vorher und nachher gleich. Zusätzlich ein kurzer Lauf mit Standardtempo (3 Tage) statt Faktor 4.
- **Auch:** `names.test` und Bot `--check`.

## 6) Nicht in v0.9
- keine Änderung an `TUNE`, Wertung, Zufall, `sim.js` oder `bot.js` (WALK bleibt 8)
- keine Textgeschwindigkeit oder Schreibmaschinen-Effekt
- kein Auto-Vorlesen, keine Stimmwahl
- kein neues Spielfeld in `S`
- keine Raum-Layout-Umbauten, kein Verlauf außer dem bestehenden Protokoll
- keine neuen Figuren oder Namen
- keine neuen Gags oder Inhalte

Eine Abweichung zur Recherche: Der Tag beginnt laut Code um 07:30 (`data.js:9`), nicht um 08:00. Das sind 9,5 Spielstunden, also 4:45 Minuten statt 4,5 bei Tempo 1.

# MES-Marathon: Plan v0.7.0 (Feinschliff, letzte Version dieser Runde)

Plan von Claude Code (nur lesend), Stand 20.10.2026. Wirkungen sind Erwartungen, gemessen wird bei der Umsetzung (`docs/BALANCE-v0.7.md`).

## 1) Balance: gut1730 senken
Der Familienabzug steht in `sim.js:752`: `f = max(over > frei ? min : 0, round(over/div))`. Aktuell gilt `ueber.min = 0` (`data.js:83`), die Schwelle `frei: 15` greift also nie. Bei 17:30 sind es `round(30/20) = 2`.

Mit `min` gäbe es einen Sockel für kurze Überstunden, der lange kaum ändert: 60 Min. kosten ohnehin 3. Fleissig (lange Überstunden plus Samstag) bleibt daher fast unberührt.

Messung: `node tools/bot.js 3000 --check`, je Variante eine Zeile.

| Variante | TUNE | Wirkung bei 17:30 |
|---|---|---|
| A | `ueber.min` 3 | Familie −3 statt −2 |
| B | `ueber.min` 4 | Familie −4 |
| C | `ueber.min` 3 und `frei` 25 | Sockel erst ab 17:25 |

Als Referenz bleibt v0.6 (`min` 0). Die Energie am Folgemorgen (`rest`) ändere ich nicht. Der Test über/4 hat in v0.6 gut auf 56,8 gedrückt.

**Entscheidungsregel:**
- gut ≥ 58, also höchstens 0,6 PP unter 58,6.
- fleissig ≥ 32. Das gilt als Untergrenze, damit es nicht noch tiefer fällt, und gleichzeitig fleissig ≤ gut + 3.
- gut1730 ≤ 72 bei n=3000.
- Von den Varianten, die das erfüllen, nehme ich die mit dem kleinsten Eingriff (A vor B vor C).
- Erfüllt keine die Regel, bleibt es bei v0.6 (74,5 %) und wird in der Doku als bewusst offen eingetragen.

Zusätzlich mit n=3000 messen: meetingfan und meetingfan_plus bleiben ≤ 16 bzw. ≤ 6, `SANE` unverändert.

## 2) Kleine Bugfixes und offene Punkte
1. **Kaffee-Malus nach Burnout am Freitag** (`sim.js:841` und `843`).
   - Problem: Im Burnout-Zweig (`sim.js:806`) zählt `S.day++` weiter. Danach ist `S.ev.kaffee === S.day` falsch, und der Wochenend-Malus entfällt.
   - Fix: `S.ev.kaffeeFr = true` im Burnout-Zweig setzen, wenn `S.ev.kaffee === S.day` vor dem `S.day++`. In `weekend()` dieses Flag mitprüfen. Ein Vergleich mit `S.day - 1` wäre falsch, weil dann auch ein normales Wochenende nach einem Donnerstag-Ereignis träfe.
   - Test: Burnout am Freitag mit defektem Automaten, dann Wochenendschicht, Energie −16 statt −12.
2. **Rabatt bei Mindestdauer** (`sim.js:547` und `564`).
   - Problem: `costOf` nimmt `max(5, cost - r)`. Danach verbraucht `S.box.used = true` den Rabatt, auch wenn er nichts bringt. Er ist heute unerreichbar, weil alle betroffenen Aktionen ≥ 15 Min. dauern.
   - Fix: `rabatt: cost0 - cost > 0`. Test mit künstlicher 5-Min.-Dauer.
3. **Wochenende gegen Krankheitstag bei Burnout am Freitag.** Die Reihenfolge nicht ändern (das würde Würfe verschieben). Stattdessen im Text von `sim.js:806` und in der Anleitung (`ui.js:253`) klarstellen.
4. **Salzüberlappung** (`sim.js:433`, `518`, `615`).
   - Elon-Würfe und Meeting-Salze überlappen (z. B. `20000 + day*16 + v + 1` gegen `20001 + day*16 + v`).
   - Nicht anfassen, weil jede Änderung Würfe je Seed verschiebt.
   - Neue Zufälle nur mit festem Salzbereich ab 31000 (Gag 3: 31000 bis 31099 reserviert), und diesen Bereich als Kommentar bei `rngA` vermerken.
   - Test: Salzbereiche aller `rngA`-Aufrufe per Regex auflisten und prüfen, dass neue Salze ≥ 31000 nicht überlappen.
5. **Doku und Kommentar.** README, BALANCE, RELEASE und REVIEW v0.7 schreiben. Außerdem den Kommentar bei `bot.js:170` und die Warnschwelle `bot.js:207` an die neue gut1730-Zahl anpassen.

## 3) Kleine Gags (ohne oder mit winziger Spielwirkung)
1. **Kalender im Schichtleiter-Büro.** Die Büro-Beschreibung (`data.js:54` ff.) bekommt eine Zeile mit einem Abreißkalender. Jedes Mal, wenn man das Büro betritt, steht ein anderer Spruch dort (z. B. »Heute: Tag 7 von 21. Der Kalender ist optimistisch.«). Der Wurf läuft über `rngA(S, 31000 + S.day)`. Keine Spielwirkung. Test: 5 Seeds, Text vorhanden, Salz ≥ 31000.
2. **Saisonale Süßigkeit.** Gilt nur, wenn die Systemzeit im Oktober bis Dezember liegt. Die Box zeigt dann einen zusätzlichen Hinweis (z. B. »Lebkuchen sind da. Seit September.«). Rein kosmetisch: kein Würfelwurf, kein neuer Zufall, kein Einfluss auf Seeds oder Bot. Test mit gesetztem Datum.
3. **Abschluss-Gag im Endbildschirm** (`ui.js:207`). Eine Zeile unter dem Ergebnis, je nach Sieg oder Niederlage (z. B. Sieg: »Der Pappkamerad lässt ausrichten: Er hat das alles schon gewusst.«). Auswahl über `rngA(S, 31100 + S.day)`. Namenstest und Elon-Regel greifen (Test in `names.test.js` ergänzen). Keine Spielwirkung.

## 4) Komfort (höchstens zwei)
1. **»Dein Werk in Zahlen«** in `endHtml` (`ui.js:206`). Bei den vorhandenen `s.stats` einen Block mit Kaffee, Meetings, Überstunden, Elon-Zähler und Pappkamerad-Blicken anzeigen. Reine Anzeige aus vorhandenen Zahlen.
2. **Hinweis beim ersten Start.** Einmalig, wenn weder Spielstand noch Bestenliste existieren: »Taste K, Zuschlag ab 17:00, Hilfe im Menü«. Gespeichert in einem eigenen `localStorage`-Schlüssel, ohne den Spielstand zu berühren.

## 5) Tests und Bot-Invarianten
- `sim.test.js`: Kaffee-Malus nach Burnout am Freitag, Rabatt-Mindestdauer, `ueber.min` bei 17:30 (die gewählte Variante), alle Salze der neuen Gags ≥ 31000 und nicht überlappend, Kalender-Spruch und Abschluss-Gag je Seed stabil.
- Alte Würfe je Seed unverändert: vorhandener Seed-Regressionstest bleibt grün. Die einzige Ausnahme ist die Familienänderung durch `ueber.min`. Sie verändert den Spielverlauf, nicht die Würfe.
- `names.test.js`: nur Christian hat einen Namen, Elon nur als vage Umschreibung.
- `bot.js --check`: gagfan ≤ gut + 3 und gleiche Meetingzahl wie gut. gut1730-Warnschwelle auf 73 anpassen, wenn Variante gewählt ist. `SANE` unverändert, meetingfan bleibt bei ≤ 16.
- `browser-check.js` und `playthrough.js` laufen lassen, danach Release-Dokumente (Version 0.7.0 in `SC.VERSION`, Footer, Test).

Es wird nichts installiert, es gibt keinen neuen Raum und keinen großen Umbau.

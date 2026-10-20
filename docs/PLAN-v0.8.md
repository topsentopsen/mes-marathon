# Plan MES-Marathon v0.8.0 (Feinschliff, einzige Runde)

Alles unten stammt aus dem Lesen des Codes. Gelaufen ist nichts. Die Änderungen sind Texte, Anzeige und Gags, die kein TUNE-Wert und keine Spielregel berühren.

## 1) Bugfixes und Unschärfen
1. **`sim.js:757`, »Familie −0«.** Bei 1 bis 9 Min. Überstunden rundet `round(over/20)` auf 0. Die Bilanz zeigt trotzdem »Überstunden 5 Min.: Familie −0« in Rot. Die Zahl bleibt, nur der Text ändert sich. Bei `f === 0` kommt eine Info-Zeile: »Überstunden 5 Min.: Das Abendessen ist noch warm. Familie unverändert.« Test: `endDay` bei 17:05 liefert eine Info-Zeile ohne »−0«, und die Familie ist unverändert.
2. **`ui.js:16` und `ui.js:20`, Meldungen überschreiben sich.** `toast` ersetzt das Ticker-Feld. Kommen in einem HUD-Takt mehrere Meldungen (verpasstes Meeting plus Störung plus Durchsage), sieht man nur die letzte. Fix: `flushMsgs` zeigt die letzten zwei verbunden an, rot, wenn eine davon schlecht ist. Browser-Check ergänzen.
3. **`ui.js:279`, Wochenende beendet das Spiel ohne Ton.** `showEvening` spielt bei Spielende `aud('jingle', win/lose)` (`ui.js:202`). Der Wochenendpfad tut es nicht. Fix: dieselbe Zeile ergänzen.
4. **`sim.js:811`, Burnout am Freitag.** `fri` steht vor `S.day++`. Der Montag fällt aus, und `startDay` springt auf Dienstag. Der Text sagt nur »Ein Tag krank«, einen Hinweis gibt es nur für Donnerstag. Fix: Bei `weekday(S) === 4` »Der Montag fällt aus.« anhängen, ebenso in der Anleitung (`ui.js:261`). Test: Burnout am Freitag, `startDay` ergibt Tag 7.
5. **Test ohne Codeänderung.** `ui.js:203` hat feste Zahlen (Energie −12/−16, 4 Pakete), die in `sim.js:846` und `sim.js:848` dupliziert sind. Ein Textabgleich-Test gegen die TUNE-Werte verhindert, dass beides auseinanderläuft.

## 2) Gags (keine Spielwirkung, keine Zeitkosten)
Die Salze liegen bei 32000 und höher, also frei. Bisher belegt sind Ausschreibung <1000, Box 9000 bis 9999, Elon 20000 bis 20999 und die v0.7-Gags ab 31000. Zu jedem Gag kommt eine Funktion in `sim.js` neben `kalender` (`sim.js:522`) und ein Eintrag in `data.js`. Der Kommentar `sim.js:12` bekommt die neuen Bereiche.
1. **Aushang am Werkstor** (Pforte, Anzeige in `renderRoom` als `.say`). Salz `32000 + day%100`. Texte:
   - »Gefunden: ein Schlüssel zu Raum 4.17. Raum 4.17 gibt es nicht.«
   - »Ladesäule 1 ist belegt. Vom selben Auto seit Dienstag.«
   - »Die Stempeluhr geht 4 Minuten vor. Der Schichtleiter sagt: Absicht.«
   - »Wegen Umbau ist der Umbau bis auf Weiteres geschlossen.«
   - »Fahrgemeinschaft zu Parkplatz B gesucht. Es ist derselbe Weg.«
2. **Diagramm des Tages** (Leitstand, `renderRoom`). Salz `32100 + day%100`. Texte:
   - »Das Diagramm zeigt heute eine Linie. Sie geht nach oben, wenn man die Achse dreht.«
   - »Die Ampel ist grün. Sie war nie anders. Auch nachts nicht.«
   - »Neue Kennzahl: Kennzahlen pro Kennzahl.«
3. **Wochenend-Zeile** im Wochenend-Dialog (`ui.js:203`). Salz `32200 + day%100`. Texte:
   - »Der Pappkamerad hat am Wochenende Schicht. Ohne Zuschlag, aber mit Haltung.«
   - »Im Büro brennt noch Licht. Es ist der Beamer.«

Bei allen drei Gags:
- Es gibt keinen `egg()`-Aufruf, keinen `stats.eggs` und kein neues Feld in `S`. Jedes Egg gibt +25 Punkte (`sim.js:834`) und würde die Wertung ändern.
- Die Tests prüfen je Seed einen stabilen Text, Namensregel und Elon-Regel.

## 3) Komfort (zwei Punkte)
1. **Spielstand überlebt v0.7.0 → v0.8.0.** `load()` (`sim.js:875`) und `oldSave` (`sim.js:874`) akzeptieren zusätzlich `SC.SAVE_OK = ['0.7.0']`. v0.8 fügt kein Feld in `S` hinzu, und `load` füllt fehlende Felder ohnehin auf. Test: Ein Spielstand mit `v:'0.7.0'` lädt, ein Spielstand mit 0.2.0 nicht (`sim.test.js:37` anpassen).
2. **Tipp auf den Ticker öffnet das Tagesprotokoll.** `dayLog` gibt es schon, und `showEvening` zeigt es bereits (`ui.js:201`). Das Overlay pausiert die Uhr (`main.js:8`), kostet also keine Spielzeit. Der Ticker ist ein `footer`, es braucht nur einen Klick-Handler und `overlay()`.

## 4) Tests und Bot-Invarianten
- `sim.test.js` bekommt Tests für:
  - die vier Bugfixes
  - SAVE_OK
  - die drei Gags
  - den Salz-Audit: per Regex alle `rngA`-Salze sammeln und prüfen, dass die Bereiche ab 32000 nicht überlappen
- `names.test.js` bleibt unverändert und muss grün sein. Der Elon-Text darf nur eine vage Umschreibung sein.
- **Bot:** Vor der ersten Änderung `node tools/bot.js 3000 --check > base.txt` ausführen, nach der Umsetzung noch einmal. Die Tabelle muss **Zeichen für Zeichen identisch** sein. Der Bot nutzt `sim.js` ohne UI, und es ändern sich nur Texte. Eine Abweichung, auch nur im Rauschen, heißt dann: Etwas hat einen Zufallswurf oder Spielstand berührt. Dann wird der Fehler gesucht, nicht das Rauschen toleriert.
- Der vorhandene Seed-Regressionstest (`rs`, `rf`, `rm` je Seed) bleibt grün.
- `browser-check.js` ergänzen um Aushang, Diagramm und Ticker-Protokoll. `playthrough.js` und `mobile-audio.js` laufen lassen.
- Freigabe: `SC.VERSION` (`data.js:6`), die Datei `VERSION`, der Footer und der Test `sim.test.js:37` auf 0.8.0. Dazu README sowie `RELEASE`, `REVIEW` und `BALANCE` v0.8. In BALANCE steht nur »unverändert, identische Tabelle«.

## 5) Nicht in v0.8
- **TUNE und Regeln:**
  - keine TUNE-Änderung, auch kein `ueber.min`
  - keine Änderung an Wertung, Siegbedingungen oder dem gut1730-Vorteil
  - keine Überstunden-Punktewertung (offen laut `BALANCE-v0.7.md`)
- **Zufall:**
  - keine Salzbereinigung der Elon- und Meeting-Salze (`sim.js:437`, `sim.js:632`), sie würde Würfe je Seed verschieben
  - keine neuen Zufälle über `rng`, `rngF` oder `rngM`
- **Inhalt:**
  - kein neuer Raum und kein neuer Siegpfad
  - keine Aktion mit Zeitkosten
  - keine Easter Eggs mit Punkten
  - kein weiterer Elon-Ausbau
- **Technik:** keine Installation, keine Umbauten an Sound oder Grafik, keine Änderung des Speicherformats.

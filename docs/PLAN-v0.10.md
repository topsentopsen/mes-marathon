
# Plan v0.10.0 (Feinschliff, Sandra-Szenen, Lesbarkeit)

**Leitplanken (gelten für alle Punkte):**
- Wertung, Punkte, Siegbedingungen und TUNE bleiben unverändert.
- Neue Texte laufen nur über `rngA` mit den Salzen 34000, 34100, 34200, 34300 und 34400. Sie stehen als Literal `rngA(S, 34xxx` im Quelltext, damit der Salz-Audit (`test/sim.test.js:245`) sie findet.
- Kein Wurf aus `rs`, `rf` oder `rm`, keine neuen Felder in `S`, keine Zeitkosten.
- `msgs` und `dayLog` stehen im Hash-Skip (`sim.test.js:270`), neue Meldungen ändern die Goldwerte also nicht.
- Version: `data.js:6` auf `0.10.0`, `data.js:8` `SAVE_OK` plus `'0.9.0'`, Datei `VERSION`, `sim.test.js:38`.

## 1) Bugfixes und offene Punkte (nach Priorität)

| Nr. | Befund | Fix | Test |
|---|---|---|---|
| 1 | Bestenliste ohne Figur (Review 2: 7, 20) | `sim.js:907`: Eintrag `{score, win, day, figur: S.figur}`. Wertung und Sortierung bleiben gleich. Anzeige `ui.js:241` und `ui.js:291`: Zusatz »(Sandra)« oder »(Christian)«. Alte Einträge ohne `figur` bekommen keinen Zusatz. | `sim.test.js`: `localStorage`-Stub wie in Zeile 38. Je ein Eintrag pro Figur, `figur` ist gespeichert, Reihenfolge nur nach Punkten, alter Eintrag ohne Feld wirft nicht. |
| 2 | Ton-Knopf über langen Dialogen auf dem Handy (Release »Bekannte Grenzen«) | `css/style.css:120`: im Media-Query `#overlay { align-items: flex-start; padding-top: 56px; }`, `.box { max-height: calc(100vh - 66px); }`. Falls der Knopf höher steht, setzt `overlay()` (`ui.js:25`) `paddingTop` auf `btn-sound.getBoundingClientRect().bottom + 6`, nur bei Breite ≤ 640. | Browser-Check bei 360×640 und 320×568: Rechteck von `#btn-sound` und Rechteck von `.box` überlappen nicht, solange ein Dialog offen ist. Der Ton-Knopf bleibt klickbar. |
| 3 | Leertaste im Raum schaltet die Pause (Review 1: 11) | `ui.js:371`: `if (e.key === ' ') { if (UI.room) return; ... }`. Ein fokussierter Knopf löst sich nativ aus, Pause nur außerhalb. | Browser-Check: Raum offen, Leertaste, `UI.paused` bleibt gleich. Raum zu, Leertaste, Pause wechselt. |
| 4 | Besuch über 17:00 bei offenem Raum ungetestet (Review 1: 12) | Zuerst reproduzieren. Aktion im Raum um 16:50 mit Dauer über 10 Min. Erwartet wird: Der Hinweis erscheint, »Weiter« schließt ihn, die Uhr läuft nicht doppelt. Nur bei einem Fehler Code ändern (`ui.js:190` bis `205`). | Browser-Check-Szenario. Zusätzlich ein Sim-Test, dass `advance` über 17:00 keinen Besuch verliert. |
| 5 | Textrenderer-Feinheiten (Review 2: 23 bis 25) | Die Review nennt keine Details. Ich prüfe nur diese Stellen: `building.js:79` (`q.mw * s * 1.25` ist fest, besser Faktor `growF`), `building.js:80` (Konturbreite bei Drehung fest 1,5), `building.js:56` (`growF` vor der ersten Größenanpassung des Canvas). Nur beheben, was messbar abweicht. | Browser-Check: Text in Sprechblase und Türschild liegt innerhalb seines Kastens, bei DPR 1, 2 und 3. |
| 6 | `CHRISTIAN_TIPPS[0]` hat verschachtelte »« (`data.js:30`) | Innen ›Wir schauen mal‹. | Der Namenstest scannt die Texte schon, dazu ein Test auf balancierte »«. |
| 7 | Tests Review 2: 29, 31 bis 33 | Siehe Abschnitt 5. | |

## 2) Sandra-Szenen und Zeilen

**Wirkung:** nur `say(...)`, keine Spielwirkung.

**a) Neue Szenen für Sandra (9 Stück):**
- Neue Tabelle `SC.SANDRA_SZENEN2` in `data.js` nach Zeile 53. Schlüssel sind die Aktions-IDs, die bisher keine Szene haben: `print`, `schichtplan`, `excel`, `gespraech`, `restart`, `abnahme`, `review`, `wartung`, `mail`.
- Aufruf in `figurNach` (`sim.js:577`), direkt nach der bestehenden Zeile:
  `const k2 = SZ2_IDS.indexOf(id); if (k2 >= 0 && rngA(S, 34000 + ((S.day * 11 + k2 * 7) % 100)) < 0.3) say(S, SC.SANDRA_SZENEN2[id]);`
- Die bestehenden Szenen (Salz 33300) bleiben unberührt, die IDs überschneiden sich nicht.
- Texte:
  - `print` (Etiketten): »Auf dem Etikett fehlt die Chargennummer. Im Datensatz steht sie. Zwischen beiden liegt ein Drucker mit eigenem Kopf.«
  - `schichtplan` (Rüsten): »Rüsten dauert laut Plan 20 Minuten. Die Schicht zeigt dir den Trick mit dem zweiten Wagen: Jetzt sind es zwölf. Der Trick steht ab heute im MES.«
  - `excel` (Rückmeldungen): »Die Rückmeldung kommt als Foto vom Zettel. Du liest eine 3, die Schicht liest eine 8. Ihr einigt euch auf: Terminal in Reichweite.«
  - `gespraech` (Auftragsfreigabe): »Der Schichtleiter gibt den Auftrag frei, sobald das Material da ist. Das MES, sobald es das weiß. Du baust die Brücke: ein Knopf am Terminal.«
  - `restart` (Schnittstellen): »Nach dem Neustart melden sich die Schnittstellen der Reihe nach zurück. Die Waage braucht am längsten. Sie war schon immer gründlich.«
  - `abnahme` (Chargen): »Du nennst eine Charge, und die Schicht zeigt in zwei Minuten, wo jede Palette war. Die Werkleitung nickt. Dafür ist das MES da.«
  - `review`: »Die IT-Chefin fragt nach der Fußnote auf Seite vier der Schnittstellenbeschreibung. Du hast die Seite. Und die Fußnote.«
  - `wartung`: »Am Automaten klebt ein Zettel: ›Nicht anfassen, läuft.‹ Du fotografierst ihn für die Dokumentation und fasst nichts an.«
  - `mail`: »Im Postfach: 14 Mails mit ›Dringend‹, zwei mit Inhalt. Du sortierst nach Inhalt, nicht nach Ausrufezeichen.«
- Erscheinen: im jeweiligen Raum nach der Aktion, im Ticker und im Tagesprotokoll.

**b) Christian als Kollege bei Sandra (4 Tipps):**
- Neue Liste `SC.CHRISTIAN_TIPPS2` in `data.js` nach Zeile 35.
- Nutzung in `sim.js:631` (Besuch `christian`): Eine neue Prüfung `rngA(S, 34100 + S.day % 100) < 0.4` wählt über `rngA(S, 34200 + S.day % 100)` aus der neuen Liste. Sonst bleibt die alte Auswahl (Salz 33200, Länge 5) unverändert.
- Tipps:
  - »Wenn der Bediener ›gleich‹ sagt, meint er nach der Pause. Notier dir beides.«
  - »Beim Rüsten stehen alle gern still daneben. Setz dich dazu. Nach zehn Minuten erzählen sie dir das Wichtigste.«
  - »Auf den Chargen läuft in der Halle Papier mit. Das Papier weiß mehr als jedes Konzept. Frag, bevor du ersetzt.«
  - »Etiketten liest im Werk jeder. Mach die Schrift groß.«
- Blasen (`data.js:61`, höchstens 40 Zeichen): »Rüsten? Setz dich dazu.«, »Erst fragen, dann ersetzen.«, »Charge? Frag das Papier.«

**c) Sandra als Kollegin bei Christian (3 Zeilen):**
- Neue Liste `SC.SANDRA_NPC2` nach `data.js:42`.
- Auswahl in `planDay` (`sim.js:64`) als `else if (S.figur !== 'sandra' && S.day >= 3 && rngA(S, 34300 + S.day % 100) < 0.2) say(S, SC.SANDRA_NPC2[Math.floor(rngA(S, 34400 + S.day % 100) * SC.SANDRA_NPC2.length)]);`
- Zeilen:
  - »Sandra aus der MES-Entwicklung bringt eine Skizze zur Auftragsfreigabe mit. Du ergänzt, wer in der Halle wirklich freigibt. Sie zeichnet einen zweiten Pfeil ein.«
  - »Sandra fragt nach den Rückmeldungen aus der Halle. Du zeigst deine Excel-Liste. Sie will daraus eine Schnittstelle machen. Du sagst: ›Die Liste bleibt.‹ Sie nickt.«
  - »Sandra hat Etiketten-Muster im Postfach. Gemeinsam sucht ihr die Schrift, die man in der Halle auf zwei Meter Abstand liest.«
- Blasen (`data.js:62`): »Ich zeichne dir die Freigabe.«, »Etikett in 100 mal 60?«, »Schnittstelle? Sag Bescheid.«

## 3) Lesbarkeit

| Nr. | Maßnahme | Messung im Browser-Check |
|---|---|---|
| 1 | **Kontrast.** `.dim` (`style.css:37`, `#8ab`) hat auf `#0055aa` nur etwa 3,2:1. Neu `#bcd`. `.foot` (`style.css:22`, `#555` auf Schwarz) wird `#999`. Deaktivierte Knöpfe (`style.css:12`) bekommen `#222` auf `#8a8a8a`. | Für alle sichtbaren Textknoten in `#room` und `.box`: Verhältnis aus `getComputedStyle` ≥ 4,5:1 (große Schrift ≥ 3:1), ausgenommen `disabled`. |
| 2 | **Zeilenlänge.** Neue Regel `#room p, .box p, .say { max-width: 70ch; }` (ohne Tabellen). | Für jeden Absatz mit mehr als 80 Zeichen: Breite ÷ (Schriftgröße × 0,6) ≤ 72 Zeichen, auch mit `body.gross` und bei 360 px. |
| 3 | **Fokus-Rahmen für die Tastatur.** `button:focus-visible, select:focus-visible, summary:focus-visible, #ticker:focus-visible { outline: 3px solid #ffcc00; outline-offset: 2px; }`. `index.html:40`: `#ticker` bekommt `tabindex="0"` und `role="status"`. Enter und Leertaste öffnen das Protokoll, über einen Zusatz am vorhandenen Handler. | Tab durch Titel, Figurenwahl, Raumknöpfe und Raum. Jeder Fokus hat `outline-width ≥ 2px`, Farbkontrast zum Hintergrund ≥ 3:1. Kein Fokus bleibt unsichtbar. |
| 4 | **Handy-Raum-Panel ohne Umbau.** `ui.js:69` (`openRoom`) setzt `body.raum`, `ui.js:73` (`closeRoom`) nimmt es weg. CSS im Media-Query: `body.raum #stage { aspect-ratio: auto; height: 72vh; min-height: 360px; }`. Der Canvas dahinter ist verdeckt (`#room` ist zu 97 % deckend) und `cssW` wird neu berechnet. | 360×640: sichtbare Höhe von `#room` ≥ 0,6 × Fensterhöhe (vorher etwa 225 px). Nach `closeRoom` stimmt das Seitenverhältnis wieder (480/300, Toleranz 1 px). Keine Konsolenfehler. |
| 5 | **Mindestschrift im Canvas.** `building.js:51` `TXT_MIN_CSS` von 9 auf 10 nur bei Breite ≤ 640. Zurücknehmen, wenn Blasen oder Türschilder überlaufen. | Kleinste gezeichnete Schrift (`Q` auslesen) ≥ 10 × DPR auf dem Handy. Keine Blase über den Gebäuderand (Klemmung bei `building.js:333` greift). |

## 4) Feinschliff (ohne Spielwirkung)
- `ui.js:267`: »Weiterspielen« zeigt zusätzlich die Spielzeit der Figur im Namen, nur Anzeige (der Tag steht schon dort).
- `ui.js:370`: nach dem Schließen eines Ein-Knopf-Dialogs per Leertaste den Fokus auf den zuvor fokussierten Knopf zurück. Dabei keinen Autofokus beim Öffnen setzen, weil Firefox bei Leertaste sonst doppelt auslösen könnte.
- `style.css:100`: `.vopts button` bekommt `min-height: 44px` auch am PC für Besuche (nur Trefferfläche).
- `ui.js:191`: Raumknöpfe zeigen im Titel (`title`-Attribut) die Taste Esc zum Schließen.
- `README.md`: Tastenliste mit Leertaste im Raum, Esc und Tab ergänzen.
- Docs: `docs/PLAN-v0.10.md`, `RELEASE-v0.10.md`, `REVIEW-v0.10.md`, `BALANCE-v0.10.md` (nur Bestätigung gleicher Tabellen) und README.

## 5) Tests und Checks

**Sim- und Namenstests (`test/sim.test.js`, `test/names.test.js`):**
1. **Salz-Audit** (`sim.test.js:245`): Salze 34000, 34100, 34200, 34300, 34400 kommen vor, Abstand ≥ 100, keine Lücke zwischen 21000 und 31000 betroffen.
2. **Sandra-Goldwerte** (neu): Hash wie Zeile 270 für `sim.newGame(seed, 'sandra')`, Seeds und Spielablauf wie der Bot, Goldwerte vorher aus dem Stand `a352acd` erzeugt und eingetragen. Das war die Lücke aus Review 2 (27).
3. **Bot-Tabellen:** `tools/bot.js` Christian und Sandra, je 3000 Partien, vor und nach der Änderung `diff` leer (Meldungen vs. Hash). Das Ergebnis kommt in `BALANCE-v0.10.md`.
4. **Szenen laufen ohne Wirkung:** Pro neue ID 80 Seeds. `S` ohne `msgs`, `dayLog` und Zeit bleibt gleich zu einem Lauf ohne `SANDRA_SZENEN2`. Zeit ≤ Kosten der Aktion. Mindestens eine Szene pro ID erscheint.
5. **Text-Regeln für alle neuen Listen:** keine Gedankenstriche (` – `, `—`), keine `{...}`-Reste nach `SC.fill`, Blasen ≤ 40 Zeichen, Grammatiktest wie Zeile 273 (SC.fill für Sandra), nur die Namen Christian und Sandra, kein Gesundheitswort (`names.test.js:23`: neue Listen in `figTxt` aufnehmen).
6. **Auswahl der Tipps:** Alte Auswahl über 33200 liefert je Seed denselben Text wie in v0.9.0, sofern die neue Prüfung nicht greift.
7. **Besuch über 17:00** und **Bestenliste mit Figur** (siehe 1.1 und 1.4).
8. **Spielstand 0.9.0 lädt** (`sim.test.js:251`: `'0.9.0'` in die Liste).

**Browser-Check (`test/browser-check.js`), Desktop 1280×800 und Handy 360×640 (iPhone und Android) plus 320×568:**
- Kein Konsolenfehler im Kurzlauf mit Christian und mit Sandra (je 3 Tage).
- Ton-Knopf und Dialog überlappen nicht (3.2).
- Leertaste im Raum (1.3).
- Kontrast, Zeilenlänge, Fokus-Rahmen und Raumhöhe laut Abschnitt 3.
- Neue Szene erscheint im Ticker (Seed mit bekannter Trefferzahl, `debug.newGame`).
- `test/mobile-audio.js` und `test/playthrough.js` laufen wie bisher.
- Handspiel: 15 Tage je Figur.

## 6) Nicht in v0.10
- Keine Änderung an Wertung, Punkten, Siegbedingungen, TUNE oder Bot-Tabellen.
- Keine neuen Felder in `S`, keine Zeitkosten für Texte, keine Würfe aus `rs`, `rf`, `rm`.
- Kein neuer Raum, keine neue Figur, keine Dialog-Bäume, kein Sandra-Besuch bei Christian mit Zeitkosten.
- Keine getrennten Bestenlisten je Figur (nur eine Liste mit Zusatz).
- Keine neue Bilddatei, keine Installation, kein Vorlesen.
- Kein Layoutumbau des Hauses auf dem Handy (nur `body.raum`-Höhe).
- Keine Änderung an `SC.FILL`-Regeln, außer wenn der Grammatiktest etwas findet.
- Keine neuen Elon-Zitate (Elon nur vage über den Tesla-Kollegen).

## Offene Annahmen
- Review 2 nennt zu 23 bis 25 keine Details. Ich prüfe daher nur die drei Stellen in 1.5.
- Die Kontrastwerte (etwa 3,2:1 für `.dim`) sind von mir geschätzt, nicht gemessen. Der Browser-Check liefert die echten Zahlen.
- `body.raum` auf dem Handy lässt sich erst im Browser beurteilen. Wenn der Canvas hinter dem Raum sichtbar durchscheint, wird die Höhe zurückgenommen.

# MES-Marathon v0.3.0 »Flurfunk« – Release-Notes

Stand 19.10.2026, **lokal auf Branch v0.3-dev, nicht veröffentlicht**. Spielstände aus v0.2.0 werden nicht übernommen (Speicherversion 0.3.0).

## Neu
- **Pflicht-Ereignisse:** Kaffeeautomat defekt zum SAP-Cutover (Kantine 30 Min. oder durchhalten mit höherem Fehlerrisiko), die IT-Chefin mit »Industrie 5.0 als Kreis« (Meeting 45 Min., Werkleitung +4, oder »nach dem SAP-Go-live«, Werkleitung −10), Morse-Rätsel am Verpackungsautomaten (Techniker 5 k€, aus und wieder an 50 %, Ticket kommt an Tag 18 zurück), All-Employee-Party mit Verkleidungspflicht ab Tag 14 (sechs Kostüme, verkleidete Kollegen im Gebäude, Party zählt nicht als Überstunden).
- **Tiramisu:** Dreimal in Folge dem italienischen Kollegen zuhören. Der nächste Testlauf am selben Tag hat 15 Prozentpunkte weniger Fehlerrisiko, im HUD sichtbar.
- **Aus Sender-Chef übertragen:** Werk Nord und Werk Süd greifen aktiv ein (Abwerbung, Gerücht beim Vorstand), Image im Konzern als Rückkopplung (Tranche, Kreditrahmen, Tempo der Rivalen, Punkte), Kredit mit Rahmen, 8 % Zins jeden Freitag und Tilgung (ersetzt den Vorschuss), Zusagen an die Werkleitung mit Frist, Mindestleistung, Prämie und Strafe.
- **Flurfunk:** zehn kleine Zufallsereignisse, Sprechblasen der Figuren, Buzzword-Bingo der Werkleitung, Werksdurchsagen, Werkszeitung in der Abendbilanz, Running Gags (»Das hatten wir schon immer so« mit Zähler, Drucker-Fehlermeldungen, die zum Cutover hin absurder werden), Easter Eggs (Pyramide, Kaffee, Pförtner, Schornstein, Excel-Dateiname an Tag 13).
- **Fabrik-Optik:** Panoramafenster der Leitebene mit Blick in die Produktion (Roboterarm, Kran, Förderband, Extruder), animierte Stanzpresse im Erdgeschoss, große Produktionshalle mit Hallenkran als Kulisse. Türen unverändert.

## Behoben
- SAP-Chaos war günstiger als Migrieren (siehe BALANCE-v0.3.md).
- Wochenendschicht beim Cutover migriert zuerst die fehlenden Stammdaten.
- Montagsrunde am SAP-Kick-off-Tag auf 30 Min. gekürzt (Puffer vorher genau 15 Min.).
- Toter `resize` in `tools/portrait.py` entfernt.

## Tests
- `node test/sim.test.js`: 47 Tests, `node test/names.test.js`: Namensregel ok.
- `node tools/bot.js 300 --check`: CHECK OK (harte Invarianten), zwei Warnungen.
- `node test/browser-check.js` und neu `node test/playthrough.js` (headless Handspiel über mehrere Tage inkl. »Weiterspielen« nach dem Abend und am Wochenende).

## Bekannte Balance-Abweichungen
Siehe `docs/BALANCE-v0.3.md`: fleissig (70 %) vor gut (60 %), Invariante dafür angepasst; Gegenmaßnahmen gegen Rivalen und Zusagen lohnen sich in der Bot-Messung nicht; ablenkbar 29 % und sparfuchs 26 % knapp unter ihren Bändern; Bänder für meetingfan und workaholic angepasst.

## Für v0.4 vorgemerkt
Siehe `docs/PLAN-v0.4.md`.

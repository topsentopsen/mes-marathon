# MES-Marathon

Retro-Managerspiel im Browser, inspiriert von **Mad TV** (1991) und abgeleitet aus [Sender-Chef](https://github.com/topsentopsen/sender-chef). Statt eines Fernsehsenders führst du als **Christian** (ca. 40, sehr viel graue Haare, kein Bart, Hemd) seit Jahren ein MES (Manufacturing Execution System) in *Werk Mitte* ein. Diesmal wirklich. Comedy, kein Drama.

**Spielen:** https://topsentopsen.github.io/mes-marathon/

## Worum geht es? (v0.2.0)
- **Fabrik als Automatisierungspyramide:** Jede Etage ist eine Ebene. EG Feld (Werkstor, Schichtleiter, Produktionshallen), 1 Steuerung (Werkstatt, Drucker, Werkskantine), 2 Leitebene (Büro, Leitstand, Besprechungsraum), 3 MES (Serverraum, IT-Büro), 4 ERP (Werkleitung, Controlling). Sheddach, Schornstein, Hallenflügel, Förderbänder, Schichtwechsel-Sirene um 14:00, Fabriklärm im prozeduralen Sound.
- **Sieben Stationen:** DEA, DEC, EEA, Extrusion, Innenverpackung, Außenverpackung, Sterilisation. Jedes Modul hat eine Teststation. Der **Verpackungsautomat** macht ständig Probleme.
- **Alltag:** Requirements → Spezifikation → Implementierung → Deployment → Testlauf → Ausdruck → Abnahme. Dazu Meetings, Wochenendschichten, Überstunden, Excel-Liste, Drucker mit Papierstau, Serverraum.
- **Figuren (nur Rollen, nur Christian hat einen Namen):** der Schichtleiter mit seinen unnötigen Meetings, die IT-Chefin, die immer mit der Automatisierungspyramide kommt (Pyramiden-Quiz), der Tesla-Kollege, der Kollege, der nichts arbeitet und nur mit dem Tesla-Kollegen redet, der italienische Kollege mit stündlichen Geschichten aus Italien und vom Essen, Kollegen ohne Ahnung, die Werkleitung, die Controlling-Abteilung, die Instandhaltung, der Pförtner, die Kantinenkraft.
- **Großereignisse:** Tag 6 neues SAP-System mit Stammdatenmigration und Cutover am Freitag (sonst drei Tage Chaos). Tag 13 Firmenübernahme mit Systemfusion als sechstem Modul, Go-Live rückt auf Tag 22.
- **KPIs:** OEE, Ausschuss, Durchsatz, Liefertreue mit Zielwerten, Verlauf im Leitstand, täglicher KPI-Bericht und Wochenrückblick am Freitag.
- **Budget als Dauerbrenner:** wöchentliche Tranche, Vorschuss, externe Berater; Testläufe, Reparaturen, Toner und Wochenendschichten kosten.
- **Aus Mad TV/Sender-Chef:** Gebäude im Querschnitt mit Aufzug, Echtzeit-Tag mit Tempo und Pause, Besucher mit Entscheidung, Konkurrenz (Werk Nord, Werk Süd), Abendbilanz, Wochenende, lokale Bestenliste, Chiptune-Musik.

## Technik
Vanilla JavaScript ohne Build, Canvas-Pixelgrafik, Musik und Fabriklärm per Web Audio. `index.html` öffnen genügt.

- `js/data.js` Daten und Balance-Hebel (`SC.TUNE`), `js/sim.js` Spiellogik (läuft auch in Node), `js/ui.js` Oberfläche, `js/building.js` Fabrik, Aufzug und Figuren, `js/audio.js` Musik und Fabriklärm.
- Tests: `node test/sim.test.js`, `node test/names.test.js`, Browser: `node test/browser-check.js [url]` (puppeteer-core).
- Balance-Bot: `node tools/bot.js 300 --check`.
- Konzept und Plan: `docs/KONZEPT.md`, `docs/PHASEN.md`.

Eigenes Fanprojekt, keine Original-Inhalte von Mad TV. Alle Figuren, Werke und Firmen sind frei erfunden.

## Balance (v0.2.0, `node tools/bot.js 300`)
Siehe `docs/BALANCE-v0.2.md`. Kurz: die gute Strategie (Schichtplan abstimmen statt Meeting-Marathon) gewinnt am häufigsten, wer alle Meetings des Schichtleiters besucht, deutlich seltener.

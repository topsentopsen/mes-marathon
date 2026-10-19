# MES-Marathon

Retro-Managerspiel im Browser, inspiriert von **Mad TV** (1991) und abgeleitet aus [Sender-Chef](https://github.com/topsentopsen/sender-chef). Statt eines Fernsehsenders führst du als **Christian** (ca. 40, sehr viel graue Haare, kein Bart, Hemd) seit Jahren ein MES (Manufacturing Execution System) in *Werk Mitte* ein. Diesmal wirklich. Comedy, kein Drama.

**Spielen:** https://topsentopsen.github.io/mes-marathon/

## Neu in v0.5.0 »Ausschreibung«
- Ausschreibung gegen Werk Nord (verdeckte Gebote bis Mittwoch 15:00), zweiter Weg zum Sieg: Konzernaudit »Vorzeigewerk«.
- Christians Süßigkeitenbox im Büro (Stammgäste mit Vorlieben, Gemecker, das letzte Stück), Kopfhörer im HUD, digitaler Zwilling, Fundstücke im Archiv.
- Ton-Knopf: Randfall beim schnellen Tippen behoben, auf dem Handy auch über Titel- und Abendbild bedienbar.
- Details: `docs/RELEASE-v0.5.md`, Balance: `docs/BALANCE-v0.5.md`, Review und Gesamtprüfung: `docs/REVIEW-v0.5.md`, Ausblick: `docs/PLAN-v0.6.md`.

## Neu in v0.4.0 »Leitstand«
- Jede Etage hat ein eigenes Fenster in die Produktion (Lichtschranke, Schaltschränke, Panorama, MES-Draufsicht, Laderampe). Türen unverändert.
- Markt im Controlling (mit Agentur und Nachrichtenagentur), Prognose mit Freitagsauswertung, Wassermelonen-Bericht, SAP-Hotline, Tesla-Reichweite, Titel »Werk des Jahres«.
- Ton auf dem Handy behoben (Entsperren bei jeder Berührung, iPhone-Stummschalter, Ton-Knopf mit Zustand).
- Details: `docs/RELEASE-v0.4.md`, Balance: `docs/BALANCE-v0.4.md`, Review: `docs/REVIEW-v0.4.md`, Ausblick: `docs/PLAN-v0.5.md`.

## Neu in v0.3.0 »Flurfunk«
- Pflicht-Ereignisse (Kaffeeautomat zum Cutover, Industrie 5.0 als Kreis, Morse-Rätsel, Kostümparty), Tiramisu, aktive Rivalen mit Image, Kredit, Zusagen an die Werkleitung, Flurfunk mit Sprechblasen, Buzzword-Bingo, Durchsagen, Werkszeitung, Running Gags und Easter Eggs.
- Fabrik-Optik: Panoramafenster in die Produktion, animierte Stanzpresse, Hallenkulisse mit Kran.
- Details: `docs/RELEASE-v0.3.md`, Balance: `docs/BALANCE-v0.3.md`, Ausblick: `docs/PLAN-v0.4.md`.

## Worum geht es? (seit v0.2.0)
- **Fabrik als Automatisierungspyramide:** Jede Etage ist eine Ebene. EG Feld (Werkstor, Schichtleiter, Produktionshallen), 1 Steuerung (Werkstatt, Drucker, Werkskantine), 2 Leitebene (Büro, Leitstand, Besprechungsraum), 3 MES (Serverraum, IT-Büro), 4 ERP (Werkleitung, Controlling). Sheddach, Schornstein, Hallenflügel, Förderbänder, Schichtwechsel-Sirene um 14:00, Fabriklärm im prozeduralen Sound.
- **Sieben Stationen:** DEA, DEC, EEA, Extrusion, Innenverpackung, Außenverpackung, Sterilisation. Jedes Modul hat eine Teststation. Der **Verpackungsautomat** macht ständig Probleme.
- **Alltag:** Requirements → Spezifikation → Implementierung → Deployment → Testlauf → Ausdruck → Abnahme. Dazu Meetings, Wochenendschichten, Überstunden, Excel-Liste, Drucker mit Papierstau, Serverraum.
- **Figuren (nur Rollen, nur Christian hat einen Namen):** der Schichtleiter mit seinen unnötigen Meetings, die IT-Chefin, die immer mit der Automatisierungspyramide kommt (Pyramiden-Quiz), der Tesla-Kollege, der Kollege, der nichts arbeitet und nur mit dem Tesla-Kollegen redet, der italienische Kollege mit stündlichen Geschichten aus Italien und vom Essen, Kollegen ohne Ahnung, die Werkleitung, die Controlling-Abteilung, die Instandhaltung, der Pförtner, die Kantinenkraft.
- **Großereignisse:** Tag 6 neues SAP-System mit Stammdatenmigration und Cutover am Freitag (sonst drei Tage Chaos). Tag 13 Firmenübernahme mit Systemfusion als sechstem Modul, Go-Live rückt auf Tag 22.
- **KPIs:** OEE, Ausschuss, Durchsatz, Liefertreue mit Zielwerten, Verlauf im Leitstand, täglicher KPI-Bericht und Wochenrückblick am Freitag.
- **Budget als Dauerbrenner:** wöchentliche Tranche, Kredit (seit v0.3, vorher Vorschuss), externe Berater; Testläufe, Reparaturen, Toner und Wochenendschichten kosten.
- **Aus Mad TV/Sender-Chef:** Gebäude im Querschnitt mit Aufzug, Echtzeit-Tag mit Tempo und Pause, Besucher mit Entscheidung, Konkurrenz (Werk Nord, Werk Süd), Abendbilanz, Wochenende, lokale Bestenliste, Chiptune-Musik.

## Technik
Vanilla JavaScript ohne Build, Canvas-Pixelgrafik, Musik und Fabriklärm per Web Audio. `index.html` öffnen genügt.

- `js/data.js` Daten und Balance-Hebel (`SC.TUNE`), `js/sim.js` Spiellogik (läuft auch in Node), `js/ui.js` Oberfläche, `js/building.js` Fabrik, Aufzug und Figuren, `js/audio.js` Musik und Fabriklärm.
- Tests: `node test/sim.test.js`, `node test/names.test.js`, Browser: `node test/browser-check.js [url]`, `node test/playthrough.js [tage] [seed]` und Handy-Ton `node test/mobile-audio.js` (puppeteer-core).
- Balance-Bot: `node tools/bot.js 300 --check`.
- Konzept und Plan: `docs/KONZEPT.md`, `docs/PHASEN.md`.

Eigenes Fanprojekt, keine Original-Inhalte von Mad TV. Alle Figuren, Werke und Firmen sind frei erfunden.

## Balance (v0.5.0, `node tools/bot.js 1000 --check`)
Siehe `docs/BALANCE-v0.5.md` (ältere: `docs/BALANCE-v0.4.md`, `-v0.3`, `-v0.2`). Meeting-Marathon bleibt deutlich schwächer als planvolles Arbeiten (16 gegen 61 %). Das Vorzeigewerk ist ein eigener Weg (Vorzeigewerk-Jagd 57 %, davon 39 % über das Audit), aber nicht stärker als gut. Offen: Wer jeden Tag bis 17:30 bleibt, gewinnt 80 %.

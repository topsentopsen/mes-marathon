# MES-Marathon

Retro-Managerspiel im Browser, inspiriert von **Mad TV** (1991) und abgeleitet aus [Sender-Chef](https://github.com/topsentopsen/sender-chef). Statt eines Fernsehsenders führst du als **Christian** (ca. 40, sehr viel graue Haare, kein Bart, Hemd) oder seit v0.9 als **Sandra** (Kollegin aus der MES-Entwicklung, braune Haare, Blazer) seit Jahren ein MES (Manufacturing Execution System) in *Werk Mitte* ein. Diesmal wirklich. Comedy, kein Drama.

**Spielen:** https://topsentopsen.github.io/mes-marathon/

## Neu in v0.11.0 »Sandra im Detail«

Sandra nachgeschärft: Figurenkarte über den Namensknopf, Knopfvermerke zu ihren Stärken und Schwächen, fachlich genauere MES-Szenen und drei neue (Stillstandsgründe, Fehlerwarteschlange, Ausschuss). Ihr Vorsprung am Rechner gilt nur bis Feierabend (docs/BALANCE-v0.11.md). Der Kollege aus dem Nachbarbüro hat seinen neuen Namen. Der 17:00-Hinweis stört keinen offenen Besuch mehr. Christians Wertung ist unverändert.

## Neu in v0.10.0 »Feinschliff mit Sandra«
- Neun neue Szenen für Sandra aus dem MES-Alltag, neue Tipps von Christian und neue Zeilen, wenn Sandra bei Christian vorbeischaut. Die Bestenliste zeigt die Figur.
- Lesbarkeit: hellere Hinweistexte, Absätze höchstens 70 Zeichen, sichtbarer Tastaturfokus, Ticker per Tab und Enter. Auf dem Handy beginnen Dialoge unter dem Ton-Knopf, und Räume sind höher.
- Tasten: Leertaste (Pause, im Raum und in Dialogen löst sie den Knopf aus), Enter, Esc (Raum verlassen, Hinweis schließen), Tab, + und − (Tempo), M (Ton), K (Kopfhörer).
- Details: `docs/RELEASE-v0.10.md`. Balance: `docs/BALANCE-v0.10.md` (unverändert). Review: `docs/REVIEW-v0.10.md`. Plan: `docs/PLAN-v0.10.md`.

## Neu in v0.9.0 »Sandra«
- Mehr Ruhe zum Lesen: In Räumen, Dialogen, Hinweisen und Textfeldern steht die Uhr, eine Aktion springt um ihre Dauer vor. Tempo Langsam, Normal, Schnell (Standard Langsam: 60 Echtsekunden pro Spielstunde, vorher 30). Der 17:00-Hinweis wartet auf »Weiter«. Größere und scharfe Schrift, Schalter »Schrift: Groß«.
- Zweite Figur: Bei »Neues Spiel« wählst du Christian oder Sandra. Die andere Figur ist als Kollege oder Kollegin im Werk. Spielstände speichern die Figur, alte Stände laden mit Christian.
- Details: `docs/RELEASE-v0.9.md`. Balance: `docs/BALANCE-v0.9.md`. Review: `docs/REVIEW-v0.9.md`. Pläne: `docs/PLAN-v0.9.md`, `docs/PLAN-v0.9-Sandra.md`. Recherche Tempo und Lesehilfen: `docs/RECHERCHE-v0.9-Tempo.md`.

## Neu in v0.8.0 »Aushang«
- Ein Tipp auf den Ticker zeigt das Tagesprotokoll (📋). Außerdem gibt es einen Aushang am Werkstor, das Diagramm des Tages im Leitstand und eine Zeile im Wochenend-Dialog. Spielstände aus 0.7.0 laden weiter.
- Behoben: »Familie −0«, Meldungen im Ticker überschrieben sich, Jingle am Spielende über das Wochenende, Burnout am Freitag, doppelte Aufzählungspunkte im Protokoll.
- Details: `docs/RELEASE-v0.8.md`. Balance: `docs/BALANCE-v0.8.md` (unverändert). Review: `docs/REVIEW-v0.8.md`. Plan: `docs/PLAN-v0.8.md`.

## Neu in v0.7.0 »Abreißkalender«
- Abreißkalender im Schichtleiter-Büro, »Dein Werk in Zahlen« und ein Abschluss-Satz im Endbildschirm, Lebkuchen im Herbst, Kurzanleitung beim ersten Start.
- Behoben: Überstunden mit Nachkommastellen, Kaffeeautomat nach Burnout am Freitag, Randfall der Süßigkeitenbox.
- Details: `docs/RELEASE-v0.7.md`, Balance: `docs/BALANCE-v0.7.md`, Review: `docs/REVIEW-v0.7.md`, Plan: `docs/PLAN-v0.7.md`.

## Neu in v0.6.0 »Feinschliff«
- Endzeit und Wartezeit auf den Aktionsknöpfen, Spätzuschlag nach 17:00 (×1,2), Ausschreibung nach Krankheitstag am Mittwoch.
- Pappkamerad im Büro, Fax-Gerät im Druckerraum, ein Geheimnis im Aufzug, Taste K für die Kopfhörer.
- Details: `docs/RELEASE-v0.6.md`, Balance: `docs/BALANCE-v0.6.md`, Review: `docs/REVIEW-v0.6.md`.

## Neu in v0.5.0 »Ausschreibung«
- Ausschreibung gegen Werk Nord (verdeckte Gebote bis Mittwoch 15:00), zweiter Weg zum Sieg: Konzernaudit »Vorzeigewerk«.
- Christians Süßigkeitenbox im Büro (Stammgäste mit Vorlieben, Gemecker, das letzte Stück), der Tesla-Kollege schwärmt von »Elon« (Elon-Zähler, Thema wechseln), Kopfhörer im HUD, digitaler Zwilling, Fundstücke im Archiv.
- Ton-Knopf: Randfall beim schnellen Tippen behoben, auf dem Handy auch über Titel- und Abendbild bedienbar.
- Details: `docs/RELEASE-v0.5.md`, Balance: `docs/BALANCE-v0.5.md`, Review und Gesamtprüfung: `docs/REVIEW-v0.5.md`, Plan v0.6: `docs/PLAN-v0.6.md`.

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
- **Figuren (nur Rollen, nur Christian hat einen Namen):** der Schichtleiter mit seinen unnötigen Meetings, die IT-Chefin, die immer mit der Automatisierungspyramide kommt (Pyramiden-Quiz), der Tesla-Kollege, der Kollege aus dem Nachbarbüro, der nur mit dem Tesla-Kollegen redet, der italienische Kollege mit stündlichen Geschichten aus Italien und vom Essen, Kollegen ohne Ahnung, die Werkleitung, die Controlling-Abteilung, die Instandhaltung, der Pförtner, die Kantinenkraft.
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

## Balance (v0.11.0: Christian unverändert, Sandra siehe docs/BALANCE-v0.11.md; `node tools/bot.js 1000 --check`, für Sandra mit `--figur=sandra`)
Siehe `docs/BALANCE-v0.9.md` (Christian unverändert, Sandra gut 56 gegen 58 %), `docs/BALANCE-v0.8.md` und `docs/BALANCE-v0.7.md` (ältere: `-v0.6` bis `-v0.2`). Seit v0.6 unverändert, in v0.8 ist die Bot-Tabelle identisch. Meeting-Marathon bleibt deutlich schwächer als planvolles Arbeiten (15 gegen 60 %). Überstunden lohnen sich weniger: fleissig 35 %, bis 17:30 bleiben 74,5 % (3000 Partien). Offen: Das ist weiter etwa 15 PP besser als pünktlich gehen.

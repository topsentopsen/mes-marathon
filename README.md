# MES-Marathon

Retro-Managerspiel im Browser, inspiriert von **Mad TV** (1991): Statt eines Fernsehsenders führst du als MES-Ingenieur in *Werk Mitte* die Einführung eines Manufacturing Execution Systems zum Go-Live.

**Spielen:** https://topsentopsen.github.io/mes-marathon/

## Worum geht es?
- 5 Module (Auftragsverwaltung, BDE, Rückverfolgung, Qualitätsprüfung, ERP-Schnittstelle), jedes durchläuft Requirements → Spezifikation → Implementierung → Deployment → Testlauf → Ausdruck → Abnahme.
- Der Alltag: Spezifikationen, Requirements, Testläufe, Implementationen, Meetings und Wochenendschichten.
- Gebäude im Querschnitt mit Aufzug: Pforte, Schichtleiter, Fertigungshalle, Büro, Drucker, Besprechungsraum, Kantine, Serverraum, Werksleitung.
- Schichtleiter Kalle lädt laufend zu nutzlosen Meetings ein. Wer schwänzt, bekommt die Linie für Testläufe nicht.
- Die Werksleitung will täglich die Excel-Liste sehen. Der Server stürzt ab, der Drucker hat Papierstau.
- Konkurrenz: Ralf (Werk Nord) und Birgit (Werk Süd) im Werksvergleich.
- Energie (Kaffee, Mittagessen), Familie (Überstunden und Wochenendschichten kosten), Laune von Werksleitung und Schichtleiter.

## Technik
Vanilla JavaScript ohne Build, Canvas-Pixelgrafik, prozedurale Musik per Web Audio. `index.html` öffnen genügt.

- `js/sim.js` Spiellogik (läuft auch in Node), `js/ui.js` Oberfläche, `js/building.js` Gebäude und Aufzug, `js/audio.js` Musik.
- Tests: `node test/sim.test.js`, Balance-Bot: `node tools/bot.js 300`.

Eigenes Fanprojekt, keine Original-Inhalte von Mad TV. Alle Figuren und Firmen sind frei erfunden.

# Balance v0.11.0

Stand 20.10.2026. Christian ist exakt unverändert: `node tools/bot.js 3000 --check` liefert dieselbe Tabelle wie v0.10.0 (zeilengleicher Vergleich), die Goldwerte im Test sind gleich geblieben.

## Messung Balance-Punkt 7 (nur Sandra: Zeitvorteil nur bis Feierabend)

Eigener Bot-Lauf, 3000 Partien je Strategie, Sandra, Schalter `nurBis17` aus und an. Siegquote in Prozent, dahinter Partien mit Familienverlust.

| Strategie | Christian | Sandra aus | Sandra an |
|---|---|---|---|
| gut (Standard) | 58 | 56 | 56 |
| fleissig | 34 | 46 (1602) | 33 (1999) |
| gut1730 | 75 | 77 (36) | 75 (52) |
| ohneSchichtplan | 55 | 57 | 56 |
| einfach | 23 | 37 | 37 |

Ergebnis: Der Ausreißer fleissig schrumpft von +12 auf −1 Prozentpunkte gegenüber Christian, gut1730 von +2 auf 0. Die Standardstrategie gut bleibt bei 56 % (Christian 58 %), also im Rahmen. Entscheidung: übernommen (`SC.TUNE.figur.sandra.nurBis17 = true`). Ihre Schwächen (Hallen-Anforderungen, Reparaturen, Notbehelf) gelten weiter den ganzen Tag.

Folge im Bot: Die Ausnahme für fleissig (bis +15 PP) ist entfallen, es gilt die normale Grenze von +8 PP. Neu: gut1730 darf höchstens 3 PP über Christian liegen.

## Bleibt

- einfach liegt bei Sandra weiter 14 PP über Christian. Diese Strategie macht keine Überstunden, der Feierabend-Schalter greift dort nicht. Sie bleibt mit 37 % klar unter gut und ist keine Gewinnstrategie. Dokumentiert, nicht geändert.
- ohneSchichtplan liegt bei Sandra mit 56 % gleichauf mit gut (Warnung, kein Fehler, wie seit v0.9).
- Sandras Goldwerte im Test sind wegen der Änderung neu gesetzt (`test/sim.test.js`, Test »v0.11 Sandra spielt exakt wie festgelegt«).

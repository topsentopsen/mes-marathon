# MES-Marathon: Review v0.6.0

Lead für Planung und Review: Claude Code (nur lesende Werkzeuge). Plan: `docs/PLAN-v0.6.md`.

## Umsetzung gegen den Plan
- Balance: drei Varianten wie geplant gemessen (plus 1,15), 1,2 nach der Entscheidungsregel gewählt.
- Bugfixes 1 bis 5, Gags (Pappkamerad, Aufzug, Fax), Komfort (Endzeit, Taste K, Tooltips), Bot (gagfan, SANE) umgesetzt.
- Nicht umgesetzt: »fleissig.fam ≥ 20 %« bleibt (fleissig verliert 65 % über die Familie, die Regel greift ohnehin); gut1730 und fleissig bleiben Warnungen (gut1730 schwankt bei n=1000 um die Grenze).
- Selbst gefunden beim Screenshot: Wartezeit wurde mit Nachkommastellen angezeigt (»12.966 Wartezeit«), jetzt aufgerundet; ⚠ statt gelber Schrift, weil Gelb auf Orange schlecht lesbar war.

## Review und Gesamtprüfung Konsistenz und Logik (Claude)
Urteil: »Code im Kern korrekt. 1,2 behalten. Nach Fix von Doku und Aufzug-Klick freigeben.«
| # | Befund | Schwere | Umsetzung |
|---|---|---|---|
| 1 | Doku v0.6 fehlt, README nennt alte Zahlen | hoch | BALANCE/RELEASE/REVIEW-v0.6, README |
| 2 | Aufzug-Klick über die ganze Schachthöhe nimmt den Etagenboden zum Laufen weg | mittel | nur die Kabine an ihrer aktuellen Position |
| 3 | ⚠ auf Party-Tagen, obwohl kein Zuschlag greift | mittel | Grenze 17:00 + Party-Minuten |
| 4 | Aktionen mit eigener Dauer (Hotline, blockierter Testlauf) umgingen den Spätzuschlag | mittel | Zuschlag auch auf die eigene Dauer, Test mit der Hotline |
| 5 | Bot-Schwellen | niedrig | bewusst so gelassen (siehe oben) |
| 6 | Doppelte Meldung beim Aufzug-Ei | niedrig | nur noch eine |
| 7 | Anleitung nennt Taste K nicht | niedrig | ergänzt |
| 8 | Fristtext ohne Mittwoch-Fall | niedrig | ergänzt |
| 9 | Fax-Ei entschuldigt sich für »die letzte Ausschreibung« auch vor der ersten | niedrig | »für alle Ausschreibungen, vergangene und künftige« |

Geprüft und in Ordnung (Claude): Spätzuschlag nur bei Dauer > 0 und nach den Rabatten, Knopf und Aktion gleich; Mittwochs-Ausschreibung mit Burnout, Woche 2 und Doppelungsschutz; Wartezeit deckungsgleich mit `act`; Namen und Elon-Texte; Fax-Label; Spielstand ergänzt neue Felder.

# MES-Marathon: Review v0.7.0

Lead für Planung und Review: Claude Code (nur lesende Werkzeuge). Plan: `docs/PLAN-v0.7.md`.

## Umsetzung gegen den Plan
- Balance: drei Varianten gemessen, keine erfüllt die Regel, v0.6 bleibt (`docs/BALANCE-v0.7.md`).
- Bugfixes 1 bis 5, Gags (Kalender, Saison, Abschluss), Komfort (Dein Werk in Zahlen, Kurzanleitung beim ersten Start) umgesetzt.
- Selbst gefunden beim Screenshot: Überstunden im Endbildschirm mit Nachkommastellen; Kaffee stand doppelt im Endbildschirm (aus »Dein Werk in Zahlen« entfernt).

## Gesamtprüfung Konsistenz und Logik (Claude, Änderungen seit v0.5 und Stichprobe)
Urteil: »Im Code kein Fehler, der die Freigabe verhindert. Nach Doku und den Befunden 2 und 3 kann v0.7.0 raus.«
| # | Befund | Schwere | Umsetzung |
|---|---|---|---|
| 1 | Doku v0.7 fehlt, README alt | Blocker | BALANCE/RELEASE/REVIEW-v0.7, README |
| 2 | Kaffee-Fix gab auch einem Donnerstagsdefekt mit Donnerstags-Burnout einen Wochenend-Malus, den er ohne Burnout nicht hätte | mittel | nur bei Burnout am Freitag; Test für beide Fälle |
| 3 | Pförtner: Ei »dreimal kommen, zweimal gehen« gegen Abschluss »dreimal gehen, jetzt viermal« | mittel | »zweimal gehen sehen, jetzt dreimal« |
| 4 | Anleitung in der Reihenfolge 0.7, 0.6, 0.5; Kurzanleitung und Burnout-Text fehlen | niedrig | aufsteigend, ergänzt |
| 5 | Bot-Kommentar zeigt auf BALANCE-v0.5 | niedrig | auf v0.7 |
| 6 | Wochenendtext nennt nur Energie −12 | niedrig | »−12, bei kaputtem Kaffeeautomaten −16« |
| 7 | Rabatt-Randfall unter 5 Min. | niedrig | `min(alte Dauer, max(5, …))` |
| 8 | Browser-Check prüft die v0.7-Anzeigen nicht | niedrig | Kurzanleitung und Kalender im Browser-Check |

Geprüft und in Ordnung (Claude): Salzbereiche ohne Überlappung, Saison ohne Zufall, Kalender, Endbildschirm (Nullwerte gefiltert, gerundet), eigener Schlüssel für die Kurzanleitung, Knöpfe mit Endzeit und ⚠, Rabatt, Version 0.7.0 überall, Namen und Elon-Texte.

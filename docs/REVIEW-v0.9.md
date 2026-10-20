# MES-Marathon: Review v0.9.0

Für Planung und Review ist Claude Code zuständig, nur mit lesenden Werkzeugen. Pläne: `docs/PLAN-v0.9.md` (Zeit und Lesbarkeit), `docs/PLAN-v0.9-Sandra.md` (zweite Figur). Recherche: `docs/RECHERCHE-v0.9-Tempo.md`.

Vorgaben des Projektinhabers: Das Spiel soll langsamer und leichter werden, damit man in Ruhe lesen kann. Die Uhr steht, solange ein Text, ein Dialog oder ein Textfeld offen ist. Eine Aktion lässt die Zeit um ihre Dauer springen. Kein Vorlesen. Schrift im Haus scharf. Sandra als zweite spielbare Figur (MES heißt Manufacturing Execution System, keine Gesundheitsthemen), Figurenwahl als erster Schritt, Christian bleibt unverändert.

## Review 1: Zeitmechanik und Lesbarkeit
Urteil: »bedingt freigabefähig«.

| Nr. | Befund | Schwere | Stand |
|---|---|---|---|
| 1 | Enter und Leertaste blockierten Knöpfe in Dialogen | mittel | behoben: `preventDefault` nur im Ein-Knopf-Zweig |
| 2 | Hinweis per gehaltener Taste sofort weggeklickt | mittel | behoben: `e.repeat` ignoriert, 400 ms Sperre nach dem Öffnen |
| 3 | Esc schloss den Raum hinter dem Hinweis | niedrig | behoben: Esc löst »Weiter« aus |
| 4 | Raum blieb bei »Neues Spiel« und »Weiterspielen« offen | mittel | behoben: `closeRoom` vorher |
| 5 | Sprechblasen auf dem Handy klein | niedrig | behoben: scharfe Schrift mit Mindestgröße, Blase wächst mit (Review 2, Nr. 21) |
| 6 | Raum-Panel auf dem Handy niedrig | mittel | bekannte Grenze: bedienbar, scrollt |
| 7 | Navigation zu hoch | niedrig | behoben: Raumknöpfe 40 px |
| 8 | `zoom` erst ab Firefox 126 | niedrig | bekannte Grenze |
| 9 | Ticker am PC sprang | niedrig | behoben: Mindesthöhe |
| 10 | Vorlesen | niedrig | entfällt: Vorlesen auf Wunsch des Projektinhabers entfernt |
| 11 | Leertaste im Raum schaltet Pause | niedrig | offen, harmlos (Uhr steht dort ohnehin) |
| 12 | Besuch über 17:00 mit offenem Raum ungetestet | niedrig | offen |
| 13 | Docs fehlten | mittel | erledigt (diese Datei, RELEASE, BALANCE, README) |

## Review 2: Sandra und scharfe Schrift
Urteil: »bedingt freigabefähig. Vor der Freigabe nötig: Punkte 1, 2, 13, 14, 27, 28. Dringend wegen Mobil: 21 und 22.«

| Nr. | Befund | Schwere | Stand |
|---|---|---|---|
| 1 | »Mein bester Mann!« auch für Sandra | hoch | behoben: »Auf dich ist Verlass!« für beide |
| 2 | »den Entsorger« männlich | mittel | behoben: für Sandra »die Entsorgerin« |
| 3, 28 | fill braucht einen Grammatiktest | mittel | behoben: Test prüft alle Quelltexte nach `SC.fill` für Sandra |
| 4 | Kalender ohne fill | niedrig | behoben |
| 5, 30 | fill ist nicht idempotent | niedrig | dokumentiert, Test prüft die genau vier Anzeigestellen |
| 6 | Werk Mitte (Christian) über Textersatz | niedrig | behoben: nutzt `s.name` |
| 8 | Anleitung nennt eine Figur | niedrig | behoben: nennt beide |
| 9 | Besuch »christian« in einem Christian-Stand gibt TypeError | niedrig | behoben: Rückfall auf Sandras Werte |
| 12 | Sandra-Zeile ändert Christians Protokoll | mittel | gewollt, im Plan vermerkt (keine Würfe, keine Zeit) |
| 13 | Pförtner hält Sandra für einen Gast | mittel | behoben: Pointe ist jetzt das Formular ohne Feld »arbeitet hier« |
| 14 | Sandra als Kaffeeholerin | mittel | behoben: »Zuhören und mitschreiben« |
| 15 | Altersklischee »alt analog, jung digital« | mittel | behoben: Christian »steckt in vielen Gesprächen und Meetings«, Sandra »kennt die MES-Schnittstellen aus der Entwicklung«; SVERWEIS-Zeile würdigt Christian |
| 16 | »jüngere Kollegin« betont das Alter | niedrig | bleibt, Vorgabe des Projektinhabers |
| 17 | Szenen in der dritten Person | niedrig | behoben: »Du fragst …« |
| 18, 19 | unklare Pointen | niedrig | behoben |
| 21 | Blasen auf dem Handy gequetscht | mittel | behoben: Blase wächst um den Mindestgrößen-Faktor |
| 22 | Performance bei DPR 3 | mittel | behoben: Pixeldichte höchstens 2, Breite per ResizeObserver gecacht |
| 23 bis 25 | Feinheiten im Textrenderer | niedrig | offen, kein sichtbarer Fehler |
| 27 | Test »Christian wie v0.8« war tautologisch | hoch | behoben: Goldwerte aus v0.8.0 (voller Bot-Lauf, Hash über den Endzustand ohne Texte, drei Seeds) |
| 7, 20, 29, 31 bis 33 | Bestenliste ohne Figur, weitere Tests | niedrig | offen für v0.10 |

## Prüfungen
- 113 Sim-Tests, Namenstest (nur Christian und Sandra, keine Gesundheitsbegriffe im Spieltext).
- Bot Christian 3000 Partien: zeichengleich zu v0.8.0. Bot Sandra 3000 Partien: alle harten Checks grün (`docs/BALANCE-v0.9.md`).
- Browser-Check (Desktop), Mobil-Check (iPhone und Android), Handspiel 15 Tage mit Christian und mit Sandra.

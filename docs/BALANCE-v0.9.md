# Balance v0.9.0

Stand 20.10.2026. Gemessen mit `node tools/bot.js 3000 --check` (Christian) und `node tools/bot.js 3000 --check --figur=sandra`.

## Christian: unverändert
Die Bot-Tabelle für Christian ist zeichengleich zu v0.8.0 (Datei-Vergleich ohne Unterschied). Christian ist die Basis: alle Faktoren 1, keine Boni. Sandras Zusätze greifen nur, wenn `S.figur === 'sandra'`. Die Zeile »Sandra schaut kurz rein« in Christians Spiel nutzt nur `rngA` (Salz 33400 und 33500) und kostet keine Zeit; ein Test prüft, dass Christian mit und ohne Figurenparameter zeichengleich würfelt.

## Zeit für Menschen (nicht im Bot)
Der Bot rechnet ohne Echtzeit. Für Menschen wird das Spiel leichter, weil Lesen nichts mehr kostet: In Räumen, Dialogen, Hinweisen und Textfeldern steht die Uhr. Eine Aktion springt die Uhr um ihre Dauer vor.

| Tempo | Echtsekunden je Spielstunde | Laufweg Pforte bis Büro (Spielminuten) |
|---|---|---|
| vorher 1x / 2x / 4x | 30 / 15 / 7,5 | Uhr lief auch im Raum |
| Langsam (Standard) | 60 | 4,4 |
| Normal | 40 | 6,6 |
| Schnell | 30 | 8,9 |

Bot-Annahme `WALK = 8` Minuten je Raumwechsel. Langsam ist für Menschen also leichter als der Bot, Normal liegt im Rahmen 8 ± 2.

## Sandra (neu)
Werte in `SC.TUNE.figur.sandra`:
- Start: Werkleitung 55 (Christian 60), Schichtleiter 42 (50), Familie und Energie gleich.
- Schneller am Rechner: Spezifikation ×0,95, Implementierung ×0,9, Deploy und Neustart ×0,85, Migration ×0,9, Bericht ×0,85, Review ×0,8.
- Langsamer in der Halle: Requirements ×1,25, Reparatur und Notbehelf ×1,4.
- Beziehungen wachsen langsamer: Schichtleiter-Gewinne ×0,6, Abnahme Werkleitung +6 statt +8.
- Testlauf-Fehlerrisiko −4 PP, Mapping beim Altwerk 18 statt 30 Min., »Geduldig erklären« klappt mit 65 statt 50 %, falsche Pyramiden-Antwort kostet 25 statt 40 Min.
- Christian kommt als Kollege an 45 % der Tage ab Tag 2 vorbei (12 Min., Schichtleiter +4).

Die erste Fassung aus dem Plan (Faktoren 0,75 bis 0,9) ergab gut 73 % gegen 58 % bei Christian. Die Faktoren wurden um 0,05 angehoben und die Hallen-Schwächen verstärkt.

| Strategie | Christian | Sandra |
|---|---|---|
| gut | 58 | 56 |
| berater | 54 | 53 |
| bieter | 63 | 61 |
| naschbox | 59 | 59 |
| ohnePlan | 55 | 53 |
| ohneSchichtplan | 55 | 57 |
| sparfuchs | 52 | 49 |
| vorzeig | 55 | 50 |
| sapChaos | 46 | 43 |
| ablenkbar | 41 | 34 |
| fleissig | 34 | 46 |
| einfach | 23 | 37 |
| meetingfan | 16 | 22 |
| meetingfan_plus | 7 | 10 |
| passiv, workaholic | 0 | 0 |

Harte Checks für Sandra (in `tools/bot.js`): alle bisherigen Invarianten, gut höchstens 5 PP neben Christian, keine vernünftige Strategie mehr als 8 PP über Christian. Alle grün.

## Abweichungen (bewusst)
- **fleissig** liegt bei Sandra 12 PP über Christian. Grund: Wer am Rechner schneller ist, macht weniger Überstunden und verliert seltener über die Familie. Für fleissig gilt deshalb: höchstens 15 PP über Christian und mindestens 5 PP unter gut derselben Figur (46 zu 56).
- **einfach** (37 %) liegt im Zielbereich 20 bis 40, aber 14 PP über Christian: Sandra ist für einfache Spielweisen etwas gnädiger. Warnung, kein harter Check.
- **ohneSchichtplan** liegt bei Sandra 1 PP über gut (Warnung): Ihre Schichtleiter-Beziehung wächst langsamer, deshalb bringt das Abstimmen des Schichtplans ihr weniger.

# MES-Marathon: Review v0.8.0

Für Planung und Review ist Claude Code zuständig, nur mit lesenden Werkzeugen. Der Plan steht in `docs/PLAN-v0.8.md`.

Vorgabe des Projektinhabers: Die Balance bleibt, wie sie ist. TUNE, Wertung und Siegbedingungen bleiben unverändert, und der Vorsprung von gut1730 wird bewusst nicht angefasst.

## Umsetzung gegen den Plan
- **Bugfixes 1 bis 5:** alle umgesetzt.
  - »Familie −0«
  - Ticker-Meldungen überschrieben sich gegenseitig
  - Jingle am Spielende über das Wochenende
  - Burnout am Freitag
  - Abgleichtest zwischen Wochenendtext und Spiellogik
- **Gags:** Aushang am Werkstor, Diagramm des Tages, Wochenend-Zeile. Sie haben keine Spielwirkung, legen kein Feld in S an und geben kein Easter Egg (sonst gäbe es +25 Punkte).
- **Komfort:** Spielstände aus 0.7.0 laden weiter (`SC.SAVE_OK`). Ein Tipp auf den Ticker zeigt das Tagesprotokoll.
- **Selbst beim Screenshot gefunden:** Das Tagesprotokoll zeigte doppelte Aufzählungspunkte, auch am Abend. Jetzt `list-style: none`.

## Gesamtprüfung Konsistenz und Logik (Claude)
Urteil: »Freigabe unter Auflagen. Ich habe keinen Blocker im Code gefunden.«

| # | Befund | Schwere | Umsetzung |
|---|---|---|---|
| 1 | Doku v0.8 fehlt | mittel | REVIEW, RELEASE und BALANCE v0.8 sowie README |
| 2 | Identische Bot-Tabelle nicht belegt | mittel | Je 3000 Partien vor und nach der Umsetzung, `diff` leer (BALANCE-v0.8) |
| 3 | Browser-Check prüft zwei Ticker-Meldungen nicht, Fehlertext »v0.7« | niedrig | Prüfung ergänzt, außerdem Esc schließt das Protokoll, Text angepasst |
| 4 | Ticker auf dem Handy: Trefferfläche klein, Tipp-Hinweis nur als `title` | mittel | `min-height` 2.4em, mehr Innenabstand, sichtbares 📋 im Ticker |
| 5 | Esc im Protokoll-Overlay ungeprüft | niedrig | Esc schließt das Protokoll (Browser-Check) |
| 7 | 0.7-Spielstand in der Wochenendphase | niedrig | Test lädt ihn und spielt weiter |
| 8 | Burnout-Text nennt Familie −4 nicht, Anleitung ohne Montag | niedrig | Text und Anleitung ergänzt |
| 9 | Nach der Party wirkt »Überstunden N Min.« widersprüchlich, Test schwach | niedrig | »Nach der Party noch N Min. geblieben«, Test prüft die Familie exakt |

Von Claude geprüft und für in Ordnung befunden:
- Ticker-Sperren (Titel, Besuch, Abend, Ende)
- kein Doppel-Jingle
- `oldSave` bei 0.7.0
- Tageszählung beim Burnout am Freitag
- Gags zustandslos über `rngA` (32000, 32100 und 32200)
- Salz-Audit
- Namens- und Elon-Regel

## Tests
- 102 Sim-Tests
- Namenstest
- Bot 3000 mit `--check`, Tabelle identisch
- Browser-Check: Kalender, Kurzanleitung, Aushang, Diagramm, Protokoll, zwei Meldungen, Esc
- Mobil-Audio auf iPhone und Android
- Handspiel über 15 Tage

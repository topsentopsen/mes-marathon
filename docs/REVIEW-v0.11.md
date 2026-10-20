# Review v0.11.0

Stand 20.10.2026. Plan und Prüfung durch Claude Code (nur lesend), Umsetzung durch Grok Bot.

## Befunde und Umgang

1. mittel: Die Ausschuss-Szene beim Notbehelf sagte »Der Notbehelf läuft«, obwohl er nur in der Hälfte der Fälle hält. Behoben, der Text ist jetzt unabhängig vom Ausgang.
2. mittel: Der Hinweis zur Abnahme (»kennt dich noch nicht so lange«) kam bei jeder Abnahme. Behoben, nur noch in den ersten zehn Tagen; der Schichtleiter-Hinweis in den ersten fünf.
3. mittel: Die Figurenkarte nannte die Grenze bis Feierabend nicht. Behoben im Plus-Text, und auf den Knöpfen steht nach 17:00 »Sandra: Vorsprung nur bis 17:00«.
4. niedrig: README sprach noch von der jüngeren Kollegin, der Kaffeesatz nannte das Herz. Beides neutral formuliert.
5. niedrig: Gedrehte Schrift mit fester Breite wurde gestaucht. Behoben, gestaucht wird nur noch gewachsene Schrift.
6. niedrig: Testlücken. Ergänzt: neue Szenen im ID-Test und im Namens-Test, Abnahme-Hinweis nie bei Christian, Wortformen im Wortverbot erweitert.
7. niedrig: Der 17:00-Hinweis bei offenem Besuch steht im Ticker und wird nach der Entscheidung von neuen Meldungen abgelöst. Er bleibt im Tagesprotokoll stehen. So belassen.
8. niedrig: Gedankenstriche in neuen Texten. Geprüft, keine vorhanden.

## Korrektur des Projektinhabers vom 20.10.2026

Der Kollege, der bisher über seine Untätigkeit beschrieben wurde, heißt jetzt überall »der Kollege aus dem Nachbarbüro« (interne Kennung `nachbar`). Er behauptet, so viel zu arbeiten, dass er zu viel arbeitet; die Wahrheit zeigt nur sein Verhalten (dritter Kaffee in aller Ruhe, Kostüm in der Arbeitszeit gebastelt). Ein Test in `test/names.test.js` schließt das abwertende Wort und seine Varianten in allen Dateien, Dateinamen und Spieltexten aus. »fault« im Code (Störung einer Station) ist ein anderes Wort und bleibt.

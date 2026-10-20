# MES-Marathon: Review v0.10.0

Plan und Review: Claude Code, nur lesend. Plan: `docs/PLAN-v0.10.md`.

## Umsetzung gegen den Plan
- Umgesetzt: 1.1 Bestenliste mit Figur, 1.2 Ton-Knopf über Dialogen, 1.3 Leertaste im Raum, 1.6 Anführungszeichen, 2a bis 2c Szenen, Tipps, Zeilen und Blasen, 3.1 Kontrast, 3.2 Zeilenlänge, 3.3 Fokus-Rahmen und Ticker per Tastatur, 3.4 höherer Raum auf dem Handy, 4 Besuchsknöpfe 44 px.
- Verschoben: 1.4 (Besuch über 17:00 bei offenem Raum, nur Test), 1.5 und 3.5 (Feinheiten im Textrenderer, keine messbare Abweichung), Feinschliff »Fokus zurück nach Dialog« und Esc im Knopf-Titel.

## Gesamtprüfung (Claude)
Urteil: »Freigabefähig: ja, bedingt. Es gibt keinen Blocker und keine Regression in der Wertung.«

| Nr. | Befund | Schwere | Stand |
|---|---|---|---|
| 1 | Dialogabstand wird beim Drehen des Handys nicht neu berechnet | niedrig | behoben: resize-Listener |
| 2 | Leertaste im Raum scrollt die Seite, wenn kein Knopf fokussiert ist | niedrig | behoben |
| 3 bis 7 | Besuch im Raum, Ticker-Taste, body.raum, figTag mit {C}, Wertung | ohne Befund | |
| 8 | Ton und Respekt der neuen Texte | ohne Befund | |
| 9 | Test, dass alle Szenen-IDs echte Aktionen sind | niedrig | behoben |

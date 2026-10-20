# Review v0.12.0

Stand 20.10.2026. Claude Code hat zweimal nur lesend geprüft: zuerst alle Texte (Vorschläge in docs/DIALOGE-v0.12.md), dann den fertigen Dialog-Diff samt Vorschlägen für kleine Verbesserungen.

## Befunde der zweiten Prüfung und Umgang

1. mittel: Die neue Stillstandsgründe-Szene ging rechnerisch nicht auf (83 minus 80 ergibt drei, nicht vier). Behoben, Pointe jetzt »Sonstiges 3«.
2. niedrig: Sprecherlabel »Ein Kollege ohne Ahnung« an drei Stellen und in der Hilfe. Ersetzt durch neutrale Abteilungen; die Fragen zeigen den Witz von selbst.
3. niedrig: »Schornsteinbetreuung« war schwächer als das Amtsdeutsch. Zurück zu »Schornsteinbeauftragten«, für Sandra über eine neue SC.FILL-Regel »zur Schornsteinbeauftragten«.
4. mittel: vh-Höhen auf dem Handy liegen unter der Browserleiste. dvh ergänzt (vh bleibt als Rückfall).
5. niedrig: Tastenhinweis auf dem Titel ist auf Touch-Geräten sinnlos. Ausgeblendet bei grobem Zeiger ohne Hover.
6. niedrig: Raumknöpfe auf dem Desktop klein. Mindesthöhe 28 px.
7. niedrig: Scrollen im Dialog zog die Seite mit. overscroll-behavior ergänzt.
8. Vorschlag Fußzeilenfarbe: nicht übernommen, der Kontrast ist seit v0.10 schon angehoben.

## Offene Punkte aus v0.11

- Testlücke Abnahme-Hinweis: geschlossen, der Test spielt die Abnahme jetzt wirklich (Sandra Tag 3 mit Hinweis, Tag 12 ohne, Christian nie, Werkleitung +6 statt +8).
- Strategie »einfach« bei Sandra: gemessen, nicht geändert (docs/BALANCE-v0.12.md).

# Release v0.15.0 »Selbst aufgefüllt«

Stand 21.10.2026.

Ziel: Die Spielfigur füllt die Süßigkeitenbox im Büro auf, nicht in der Kantine.

- Die drei Aktionen `box_schoko`, `box_gummi` und `box_lakritz` stehen jetzt im Büro (vorher Kantine). Kennungen, Preis (3, 2 und 1 k€), Dauer (2 Min.), Energie (0), Wochengrenze und Wirkung des Stammgasts sind unverändert.
- Anzeige im Büro: eine Zeile »Süßigkeitenbox auffüllen« mit drei kleinen Knöpfen statt drei langer Knöpfe, damit das Büro bei 1366 × 768 ohne Scrollen passt. Der Zettel, wer was mag, hängt jetzt an der Box (nach Sorte gruppiert).
- Texte: »Du füllst die Süßigkeitenbox im Büro auf …«, Sperrtext »Dein Vorrat reicht nur für einmal pro Woche.« Die Texte sprechen die Figur mit »du« an und passen für Christian und Sandra.
- Kantine: nur noch Kaffee und Mittagessen, im Herbst der Hinweis auf Lebkuchen am Kiosk.
- Anleitung: Absatz »Neu in 0.15«, der Absatz zu 0.5 nennt das Büro.
- Bot: `naschbox` und `lakritz` füllen auf, wenn sie ohnehin im Büro sind, `naschWeg` geht extra hin.
- Spielstände aus 0.7.0 bis 0.14.1 laden weiter (kein neues Feld, die Box bleibt wie gespeichert).
- Tests: zwei neue Tests in `test/sim.test.js` (Auffüllen im Büro für beide Figuren, Kantine ohne Box, Wochengrenze, Budget, gleiche Dauer für beide Figuren, Laden eines 0.14.1-Stands).
- Bewertung der Änderung mit Bot-Zahlen: `/workspace/mes-bewertung-buero-suessigkeiten.md` (außerhalb des Repos).
- Keine neue HTML-Seite, keine neuen Skripte, keine Netzwerkaufrufe.

# Release v0.16.0 »Senior Principal«

Stand 21.10.2026. Branch `dritte-figur` (Basis v0.15.0, 5efef17), nicht nach main gemergt.

## Konzept

- Dritte Figur ohne Eigennamen, nur mit Titel: **Senior Principal** (Kennung `senior`, `ohneName: true`). Namensregel bleibt: Eigennamen haben nur Christian und Sandra.
- Herkunft: viele Jahre Konzernstrategie, Projekte und Budgets. Hoher Titel, im Thema MES neu.
- Aussehen (Porträt 32 × 32 und Figur im Werk): kurze dunkle Haare mit grauen Schläfen, runde Brille, dunkelblaues Sakko, heller Rollkragen, Einstecktuch, Notizbuch. Kein Bart, keine Warnweste, kein Werksausweis.
- Texte ohne Artikel und Pronomen für die Figur (»Senior Principal fragt …«), Geschlecht bleibt offen. Humor über Titel gegen MES-Wissen, ohne Herablassung: Senior Principal hört zu, fragt nach und bringt Erfahrung aus Strategie und Budget ein.
- Eigene Texte: erster Tag (`SC.SENIOR_TAG1`), elf Fachbegriffe des Tages (`SC.SENIOR_BEGRIFFE`, Tag 1 bis 11), Erklärung beim ersten Mal jeder Fachaktion (`SC.SENIOR_ERKL`), zwölf Szenen (`SC.SENIOR_SZENEN`, 30 %, Salz 38000), Hinweis auf Gewicht bei der Werkleitung (Salz 38500). Zum Start die Einarbeitungsmappe mit fünf Begriffen (`UI.mappe`, die Uhr steht).
- Anrede in Spielertexten über `SC.FILL.senior`: »jemand vom MES«, »das MES-Team«, »Sakko wie immer«, »letzte Instanz«, »gehst in die Imkerei«, »Ehrenmitglied der Schornsteinpflege«, Pappaufsteller.
- Christian kommt als Kollege zu Besuch (40 %, 12 Min., Schichtleiter +3), Sandras Zeilen im Werk bleiben.

## Mechanik

- Lernkurve: `req, test, linie, spec, impl, migrate, deploy, restart, review, repair, wartung` kosten an Tag 1 den Faktor 1,4. Der Aufschlag sinkt quadratisch und ist ab Tag 12 weg (Tag 3 etwa +27 %, Tag 6 +12 %, Tag 9 +3 %). Testfehler in der Einarbeitung bis +4 PP (gleiche Kurve).
- Stärken: Werkleitung Start 66 und Zuwächse aus Aktionen ×1,25; Excel-Liste und Mails ×0,7, Tranche und Kredit ×0,6, Berater ×0,7, Bericht an die Werkleitung ×0,75, Abnahme ×0,8, KPI-Bericht ×0,85; jede Tranche +5 k€; an Chaostagen Halle ×1,2 statt ×1,4 und Büro ×1,1 statt ×1,25.
- Schwächen außerdem: Schichtleiter Start 48, Altwerk-Mapping 40 Min., falsche Pyramidenantwort 45 Min.
- Knopfvermerke: »lernt +40 %« (sinkt täglich) und »Routine«. Kurz gehalten, damit das Büro bei 1366 × 768 nicht scrollt.
- Code: `FG(S)` liest allgemein `SC.TUNE.figur[S.figur]`; Christian bleibt ohne Abweichung. Christian und Sandra spielen exakt wie in v0.15.0 (Goldwerte unverändert, Bot-Zahlen identisch).

## Balance (Bot, 2000 Partien, Startwerte 1000 + i · 7919)

| Strategie | Christian vorher | Christian nachher | Sandra vorher | Sandra nachher | Senior Principal |
|---|---|---|---|---|---|
| gut | 58 | 58 | 55 | 55 | 57 |
| naschbox | 58 | 58 | 58 | 58 | 56 |
| naschWeg | 57 | 57 | 56 | 56 | 59 |
| lakritz | 58 | 58 | 55 | 55 | 56 |
| fleissig | 34 | 34 | 33 | 33 | 17 |
| gut1730 | 75 | 75 | 75 | 75 | 70 |
| berater | 53 | 53 | 53 | 53 | 57 |
| einfach | 24 | 24 | 37 | 37 | 19 |

- Fortschritt (Median, gut): Tag 5 Christian 35 %, Senior Principal 30 %; Tag 20 Christian 95 %, Senior Principal 93 %. Am Anfang langsamer, dann aufgeholt.
- Messweg zur Lernkurve (je 1000 Partien): ohne Lernkurve gut 67 %, lineare Kurve 1,4 nur 37 %, quadratische Kurve 1,4 mit Projekt- und Budgetstärken 59 %. Start und Zuwachs bei der Werkleitung ändern die Siegquote kaum.
- Altlast Sandra gut1730 (79 gegen 74 % bei 300 Partien) war Rauschen. Bei 2000 Partien liegen beide bei 75 %. Sandra bleibt unverändert; die Prüfung erlaubt unter 1000 Partien 5 PP, ab 1000 Partien 3 PP.
- Süßigkeitenbox (v0.15) mit 5 statt 2 Min. nachgemessen: Christian naschbox 58 (gleich), naschWeg 60 (+3); Sandra naschbox 56 (−2), naschWeg 61 (+5); Senior Principal 56 und 58 (gleich und −1). Die Box ist mit 2 Min. nicht zu stark (naschbox minus gut 0, +3, −1 PP), daher bleibt es bei 2 Min.
- `tools/bot.js --alle` spielt alle drei Figuren und prüft: harte Invarianten je Figur, gut höchstens 3 PP auseinander (ab 1000 Partien), Senior Principal an Tag 5 hinter Christian und an Tag 20 höchstens 3 PP dahinter. Ergebnis: CHECK OK.

## Tests

- `test/sim.test.js`: 133 Tests, davon 7 neu (Start und Titel, Lernkurve, Stärken, Erklärung und Szenen, Kollege, Spielstand und Bestenliste, neutrale Texte, Goldwerte Senior Principal).
- `test/names.test.js`: Eigennamen weiter nur Christian und Sandra, »Senior Principal« als einzige Figur ohne Namen, der Name »Ste­fan« ist verboten, die Senior-Texte legen kein Geschlecht fest und übernehmen nichts von der früheren dritten Figur.
- `test/browser-check.js`: drei Karten, Abschnitt v0.16 (Wahl, Mappe, Vermerke, Figurenkarte, Christian als Kollege).
- `test/layout-check.js`: zusätzliche Partie Senior Principal, Einarbeitungsmappe, Figurenkarte und Figurenwahl im Spiel. Bei 1366 × 768, 1440 × 900 und 1920 × 1080 ohne Scrollen.
- `test/playthrough.js` mit `FIGUR=christian|sandra|senior` und `test/mobile-audio.js`: ohne Fehler.
- Spielstände 0.7.0 bis 0.15.0 laden (`SC.SAVE_OK` um 0.15.0 ergänzt).

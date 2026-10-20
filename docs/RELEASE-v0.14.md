# Release v0.14.0 »Quereinsteiger«

Stand 20.10.2026.

Ziel: eine dritte spielbare Figur, Ivo, der vom MES noch keine Ahnung hat. Er ist neu, nicht dumm. Der Humor geht über die Fachbegriffe, nie über ihn und nie über seine Herkunft.

- Figurenwahl mit drei Karten: Christian, Sandra, Ivo. Ivo ist MES-Quereinsteiger, vorher in der Werkslogistik. Aussehen: dunkle kurze Haare, gepflegter dunkler Vollbart, wärmerer Hautton, Warnweste über grauem Pulli (Porträt und Spielfigur im Werk).
- Startwerte: Werkleitung 50, Schichtleiter 58.
- Stärken: Hallen-Anforderungen (Faktor 0,8), Linie, Gespräch und Schichtplan beim Schichtleiter (je 0,85). Das Vertrauen des Schichtleiters wächst schneller (Faktor 1,2). Diese Vorteile gelten auch nach 17:00.
- Lernkurve: Spezifikation, Implementierung, Deployment, Migration, Bericht und Code-Review dauern am Tag 1 20 % länger, Neustart 15 %. Der Aufschlag sinkt jeden Tag und ist ab Tag 10 weg. Am Tag 10 meldet das Spiel das. Auf den Knöpfen steht »Ivo: schneller« oder »Ivo: lernt noch«.
- Weitere Werte: Mapping beim Altwerk 38 Min., Pyramide falsch beantwortet 35 Min., Erklären gelingt mit 60 %, keine Abzüge bei der Abnahme, Testrisiko wie bei Christian.
- Eigener Einstieg: Beim Spielstart mit Ivo erscheint »Ivos erster Tag im MES« mit einem kurzen Glossar (MES, ERP, SPS, Requirements, Spezifikation bis Deployment, Abnahme). Die Uhr steht dabei. Der Einstieg kommt nur einmal je Partie.
- Merkzettel: Bis Tag 10 steht in jedem Raum ein Merkzettel mit den wichtigsten Begriffen für diesen Raum.
- Eigene Szenen (17 Stück, nach Aktionen): Ivo verwechselt Begriffe (Deployment und Palette, SPS und SMS, Charge und Chef, n.i.O.) und lernt sie. Oft hilft ihm seine Hallenerfahrung. Zufall nur über eigene Salze (rngA 36000 und 37000), keine Zeitkosten.
- Christian kommt als Kollege vorbei (wie bei Sandra) und erklärt das MES, eigene Sprechblasen im Werk.
- Christian und Sandra: Texte, Werte und Abläufe unverändert (Gold-Tests grün, Textvergleich mit 0.13: nur neue Texte für Ivo). Anleitung und Titel bekommen je einen neuen Absatz, »Neu in 0.14« steht in der Anleitung.
- Namensregel: Christian, Sandra und Ivo haben Namen, alle anderen heißen nach ihrer Rolle. `test/names.test.js` prüft das und dazu, dass Ivos Texte ihn nicht abwerten.
- Balance (300 Partien je Strategie, `node tools/bot.js 300 --check --figur=ivo`): Ivo gut 61 % gegen Christian 56 %, gut1730 73 % (Christian 74 %), fleissig 24 %, Süßigkeitenbox 58 %, Vorzeigewerk 55 %. Harte Invarianten erfüllt.
- Layout: `test/layout-check.js` prüft jetzt auch eine Ivo-Partie und Ivos Einstieg. Bei 1366 × 768, 1440 × 900 und 1920 × 1080 scrollt nichts.
- Spielstände aus 0.7.0 bis 0.13.0 laden weiter.
- Keine neue HTML-Seite, keine neuen Skripte, keine Netzwerkaufrufe.

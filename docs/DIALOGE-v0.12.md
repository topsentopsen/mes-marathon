# Dialogrunde v0.12.0

Stand 20.10.2026. Geprüft wurden alle Spieltexte in `js/data.js`, `js/sim.js`, `js/ui.js` und `js/building.js`: Szenen, Sprechblasen, Besuche und ihre Antworten, Meldungen und Ticker, Abendbericht, Spielenden, Tipps, Figurenkarten, Party, Easter Eggs, Hilfe und Titel. Für Sandra wurden alle Texte zusätzlich nach `SC.fill` gelesen.

- Geprüft: rund 565 Texte (Claude Code: 300 in data.js und 265 in sim.js, ui.js, building.js; dazu eine eigene Lesung aller Sandra-Texte nach SC.fill, der Elon-, Tipp-, Ende-, Schlagzeilen- und Durchsagenlisten und ein automatischer Doppelungs-Check).
- Geändert: 27 Texte (plus eine neue SC.FILL-Regel für »zur Schornsteinbeauftragten«).
- Zweiter Prüfer: Claude Code, nur lesend, hat die Änderungen danach noch einmal geprüft; seine Befunde sind eingearbeitet.
- Der Kollege aus dem Nachbarbüro bleibt neutral benannt. Dass er nichts tut, zeigt nur sein Verhalten.

## Vorher und nachher

| Nr. | Datei | Vorher | Nachher | Grund |
|---|---|---|---|---|
| 1 | `js/data.js` | Herzlichen Glückwunsch an die Extrusion: drei Tage ohne Etikettenstau! | Glückwunsch an die Extrusion: drei Tage ohne Folienstau! | Logik: In der Extrusion entsteht Folie, kein Etikett. |
| 2 | `js/data.js` | »Ich bin auf Diät.« (1 Min.) | »Ich bin schon satt.« (1 Min.) | Regel: kein Ernährungs- und Gesundheitsthema. |
| 3 | `js/data.js` | Mit dem Tesla wäre ich heute 4 Minuten früher hier gewesen. Wenn ich einen hätte. | Mit dem Tesla wäre ich heute 4 Minuten früher hier gewesen. Wenn Ladesäule 1 frei gewesen wäre. | Logik: Der Tesla-Kollege fährt einen Tesla (Reichweitenanzeige, Ladesäulen-Aushang). |
| 4 | `js/data.js` | Heute Mittag mach ich euch allen Bruschetta. Versprochen! | Bald mach ich euch allen Bruschetta. Versprochen! | Logik: Die Blase kann am Nachmittag erscheinen. |
| 5 | `js/data.js` | Der Pförtner: »Das MES hab ich schon zweimal gehen sehen. Jetzt dreimal.« | Der Pförtner: »Das MES hab ich schon dreimal gehen sehen. Jetzt viermal.« | Logik: Der Siegtext spricht vom vierten MES. |
| 6 | `js/data.js` | vier tun dasselbe, eines tut nichts, das siebte ist der Schichtleiter. | vier tun dasselbe, zwei tun nichts, das siebte ist der Schichtleiter. | Logik: Die Zählung ging nicht auf (4 + 1 ergibt nicht 6). |
| 7 | `js/data.js` | Sie macht ein Foto und baut am Nachmittag ein Pflichtfeld weniger ein. | Sie macht ein Foto und baut später ein Pflichtfeld weniger ein. | Logik: Der Besuch kann auch am Nachmittag stattfinden. |
| 8 | `js/data.js` | Der Stapler parkt ein. Dann die Mülltonne aus. Ihr lacht beide. | Der Stapler parkt rückwärts ein. Dann parkt er die Mülltonne aus. Ihr lacht beide. | Humor: Pointe war als Satz kaum verständlich. |
| 9 | `js/data.js` | Er nickt verständnisvoll. Er weiß nicht, was USB-C ist. | Er nickt verständnisvoll und fragt, ob es das auch als VGA gibt. | Ton: alte Pointe war herablassend, die neue zeigt Verhalten. |
| 10 | `js/data.js` | »Der Schichtleiter mag es, wenn man zu seinen Meetings kommt. Aber er merkt es nicht, wenn man nur zu einem kommt.« | »Der Schichtleiter freut sich über jedes Meeting, zu dem man kommt. Er zählt aber auch die, zu denen man nicht kommt.« | Logik: alter Satz widersprach sich selbst. |
| 11 | `js/data.js` | Elon würde dieses Werk in zwei Wochen hochziehen. Mindestens. | Elon würde dieses Werk in zwei Wochen hochziehen. Höchstens. | Logik: Prahlerei braucht »höchstens«. |
| 12 | `js/data.js` | Spruch des Tages: »Gut geplant ist halb geschwänzt.« Jemand hat »geschwänzt« durchgestrichen. | Spruch des Tages: »Gut geplant ist halb gewonnen.« Jemand hat »gewonnen« durchgestrichen und »vertagt« darübergeschrieben. | Humor: Pointe fehlte der Ersatz. |
| 13 | `js/data.js` | Du schreibst »Echtzeit« aufs Whiteboard und streichst es nicht durch. | Du schreibst »Echtzeit« aufs Whiteboard. Jemand ergänzt in Klammern: »(abends)«. | Humor: Pointe zeigt jetzt das Verhalten der Halle. |
| 14 | `js/sim.js` | Abgewimmelt. Die beiden ziehen beleidigt in die Kaffeeküche und bleiben dort. | Abgewimmelt. Der Tesla-Kollege zieht beleidigt in die Kaffeeküche und holt Verstärkung aus dem Nachbarbüro. | Logik: »Die beiden« passte nur beim Duo-Besuch. |
| 15 | `js/sim.js` | Abgewimmelt. Sie diskutieren im Flur weiter. | Abgewimmelt. Die Reichweite wird im Flur weiter diskutiert, jetzt vor dem Feuerlöscher. | Logik: »Sie« passte nicht beim Einzelbesuch. |
| 16 | `js/sim.js` | Die Werkleitung nennt dich »unseren Planer«. | Die Werkleitung nennt dich ab jetzt nur noch »die Planung«. | Anrede: »Planer« war für Sandra falsch. |
| 17 | `js/ui.js` | Die Werkleitung macht dich zum Schornsteinbeauftragten. Ehrenamtlich. | Die Werkleitung ernennt dich zum Schornsteinbeauftragten. Ehrenamtlich. | Anrede: für Sandra jetzt »zur Schornsteinbeauftragten« über SC.FILL, Amtsdeutsch bleibt. |
| 18 | `js/ui.js` | dauert länger (müde: × | dauert länger (Spätzuschlag: × | Regel: Zustandswort durch Mechanik ersetzt. |
| 19 | `js/ui.js` | M (Ton), K. In Räumen steht die Uhr. | M (Ton), K (Kopfhörer). In Räumen steht die Uhr. | Logik: Taste K war unerklärt. |
| 20 | `js/data.js` | »Dein SVERWEIS ist das einzige Dokument, das die Schicht wirklich liest. Ich hab ihn dokumentiert.« | »Deine Excel-Liste ist das einzige Dokument, das die Schicht wirklich liest. Ich hab sie dokumentiert. Jetzt gibt es zwei.« | Logik: Ein SVERWEIS ist kein Dokument; Pointe ergänzt. |
| 21 | `js/data.js` | Du legst einen vierten an: »Siehe Sonstiges«. Er wird sofort beliebt. | Du streichst 80 und benennst die drei übrigen so, wie die Schicht wirklich spricht. Am nächsten Tag legt sie »Sonstiges 3« an. | Figur: Sandra machte als Fachfrau das Chaos größer; jetzt löst sie es, die Halle behält trotzdem ihr »Sonstiges«. |
| 22 | `js/data.js` | »Auf den Chargen läuft in der Halle Papier mit. Das Papier weiß mehr als jedes Konzept. Frag, bevor du ersetzt.« | »Mit jeder Charge läuft in der Halle ein Zettel mit. Der Zettel weiß mehr als jedes Konzept. Frag, bevor du ihn ersetzt.« | Sprache: Satz war schief. |
| 23 | `js/data.js` | Ein Kollege ohne Ahnung: » | Ein Kollege aus der Buchhaltung: » | Ton: »ohne Ahnung« war herablassend, die Frage zeigt es von selbst. |
| 24 | `js/data.js` | { id: 'beamer', who: 'Ein Kollege ohne Ahnung', | { id: 'beamer', who: 'Ein Kollege aus der Buchhaltung', | Ton: Sprecherlabel war abwertend. |
| 25 | `js/sim.js` | case 'ahnungslos': return { who: 'Ein Kollege ohne Ahnung', | case 'ahnungslos': return { who: 'Besuch aus einer anderen Abteilung', | Ton und Logik: Label war abwertend und doppelte den Sprecher im Text. |
| 26 | `js/sim.js` | ' Ein Kollege ohne Ahnung fragt dazwischen, ob das MES auch Kaffee kochen kann.' | ' Ein Kollege aus dem Einkauf fragt dazwischen, ob das MES auch Kaffee kochen kann.' | Ton: Frage zeigt es von selbst. |
| 27 | `js/ui.js` | Kollegen ohne Ahnung und die IT-Che | Kollegen aus anderen Abteilungen mit ehrlichen Fragen und die IT-Che | Ton: Hilfe nicht abwertend. |

## Bewusst nicht geändert

- Die Kantinenkraft siezt, alle anderen duzen. Das passt zur Figur.
- Die Elon-Sätze bleiben als Vermutungen des Tesla-Kollegen (»glaube ich«, »stelle mir vor«) und behaupten nichts Konkretes.
- Der Archiv-Text an der Tür und der erste Archiv-Fund sind gleich, die Tür zeigt aber den Fund aus der Liste (keine sichtbare Doppelung).

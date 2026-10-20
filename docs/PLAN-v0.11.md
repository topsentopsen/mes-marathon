# MES-Marathon v0.11: Prüfung Sandra und Plan

Ich habe nur gelesen. Es lief weder Bot noch Test, alle Zahlen stammen aus `docs/BALANCE-v0.9.md` und `docs/BALANCE-v0.10.md`. Wo ich etwas nicht prüfen konnte, steht »ungeprüft«. Die Zeilen 295, 309 und 311 in `ui.js` habe ich nur per Suchtreffer gesehen.

**Fazit:** `SC.fill` ist an allen Anzeigestellen aktiv (`overlay`, `toast`, `renderRoom`, Blasen). Es gibt keinen Blocker. Die Fundstellen sind kleine Textfehler, eine kleine Lücke bei der Sichtbarkeit und die Balance-Ausreißer.

## 1) Stimmigkeit (Texte)

| Nr. | Schwere | Fundstelle und Originaltext | Vorschlag |
|---|---|---|---|
| 1.1 | mittel | `data.js:24`, `ui.js:293`, `ui.js:314`, Kommentar `data.js:18`: »die jüngere Kollegin aus der MES-Entwicklung« und »jüngere Kollegin«. Das ist eine Altersangabe und widerspricht der Regel gegen Altersklischees. | `kurz: 'die Kollegin aus der MES-Entwicklung'`. Bei Christian ist »der Erfahrene« besser mit »mit langer Werkserfahrung« gesagt. Die Überschrift in `ui.js:293` entsprechend ändern. |
| 1.2 | mittel | `data.js:343`: »Ihr seid das Paar des Abends.« (Ladesäule mit dem Tesla-Kollegen). Für Sandra liest sich das wie ein Paar-Klischee. | »Ihr seid das Duo des Abends.« Das gilt neutral für beide Figuren. |
| 1.3 | mittel | Pappkamerad: `data.js:397-403`, `data.js:450`, `data.js:433-434`, Aktionsname `sim.js:418`. »Kamerad« ist männlich, und das Gesicht ist Sandras. Es gibt dort kein `SC.FILL`-Paar. | Für Sandra zwei Paare in `SC.FILL`: `[/Pappkameraden/g, 'Pappaufsteller']` und `[/Pappkamerad\b/g, 'Pappaufsteller']`. Die Reihenfolge ist wichtig, »Pappaufsteller« ist ebenfalls männlich. So bleiben »Er«, »Seine« und »ihn« grammatisch richtig. |
| 1.4 | niedrig | `data.js:230`: »Christian, du siehst müde aus. Bei uns sagt man: Erst essen, dann Pyramide.« Das ist ein Kommentar zum Aussehen. | »Christian, hast du schon gegessen? Bei uns sagt man: Erst essen, dann Pyramide.« |
| 1.5 | niedrig | `data.js:433`: »Viertes MES. Das erste, das bleibt.« Sandra ist neu im Werk, die Zählung passt aber trotzdem. | »Viertes MES im Werk. Das erste, das bleibt.« |
| 1.6 | niedrig | `ui.js:313`, `ui.js:315` (Hilfe): »Burnout«. Suchtreffer »Burnout« auch bei `sim.js:763`, `769`, `870`, »krank« bei `ui.js:317` und `sim.js:844`. Bei `sim.js` ungeprüft, ob Spieltext oder Code. | In Spieltexten neutral formulieren: »Fällt der Freitag aus, weil die Energie auf null ist«. Den Test `HEALTH` in `names.test.js:20` um `Burnout|krank` erweitern. |
| 1.7 | niedrig | `ui.js:311` (Hilfe): »Christian bringt immer Süßigkeiten mit«. Aus dem Titel nach einem Sandra-Spiel wird daraus »Sandra bringt…«. Das ist stimmig, aber zufällig. | `{C}` verwenden und im Text »Du bringst immer Süßigkeiten mit« schreiben. |
| 1.8 | niedrig | `data.js:53-54`, `SANDRA_NPC` (in Christians Spiel): »…ob man das ausdrucken kann« passt. Aber »Es hat Spaltenüberschriften. Du nickst anerkennend.« klingt herablassend, weil das Lob dem niedrigen Maßstab gilt. Bei `data.js:52` erklärt Christian Sandra den BDE-Feed, den sie selbst gebaut hat. | Zeile 54: »Sandra schickt dir ein Mapping mit Versionsnummer und Änderungsprotokoll. Du fragst, ob du das abschreiben darfst.« Zeile 52: Sandra fragt, »wie die Halle den Feed wirklich befüllt«. Sie erfährt so etwas, das sie nicht wusste. |

Die Prüfung der übrigen Punkte:
- **Ohne Befund:** Hemd (`SC.FILL` ersetzt es durch »Blazer«), Rolle »Projektleiter« (`FILL` greift bei »MES-Projektleiter«), »der vom MES«, »den Entsorger«, Ende-Texte, `SC.VORZEIG`, Excel-Dateiname (Sandra statt Christian), Kopfhörer, Pförtner, Abendbericht. Eine Altersangabe »ca. 40« und »graue Haare« habe ich nicht gefunden.
- **Zusatzprobe:** `SC.FILL` ersetzt `Christian` global. Der Test `sim.test.js:273` schützt davor, `SC.fill` doppelt anzuwenden.
- **Werkszeitung (`SC.SCHLAGZEILEN`) und Easter Eggs:** Sie enthalten keinen Spielernamen und keine männliche Anrede. Die Namensregel ist erfüllt: nur Christian und Sandra, Elon nur vage über den Tesla-Kollegen.

## 2) MES-Glaubwürdigkeit (Texte)

Stark und plausibel sind: BDE-Feed, Mapping, die Etikettenszene mit der Chargennummer (`SANDRA_SZENEN2.print`), die OEE-Formeln und die Rückmeldung per Foto vom Zettel mit dem Terminal in Reichweite.

| Nr. | Schwere | Befund | Textvorschlag |
|---|---|---|---|
| 2.1 | mittel | `SANDRA_SZENEN2.schichtplan` (`data.js:70`): »Der Trick steht ab heute im MES« ist fachlich unscharf. Gemeint ist die Rüstzeit im Stammsatz. | »…Jetzt sind es zwölf. Du trägst die Rüstzeit im Stammsatz nach, ab heute plant das MES mit zwölf.« |
| 2.2 | mittel | `SANDRA_SZENEN2.abnahme` (`data.js:74`): »die Schicht zeigt in zwei Minuten, wo jede Palette war« ist nicht schlüssig. Das zeigt die Rückverfolgung im MES, und es steht im Raum der Werkleitung. | »Du nennst eine Charge, und das MES zeigt in zwei Minuten, wo jede Palette war. Die Werkleitung nickt. Dafür ist es da.« |
| 2.3 | niedrig | `SANDRA_SZENEN.impl` (`data.js:60`): »Der Drucker meldet sich als Teilnehmer an« ist unklar. | »Du zeichnest die Schnittstelle auf das Whiteboard. Der Etikettendrucker kann kein UTF-8. Aus ›Größe‹ wird ›Gr??e‹, und das steht jetzt auch im Pflichtenheft.« |
| 2.4 | niedrig | `SANDRA_SZENEN.bericht` (`data.js:63`): »die vierte Formel« bleibt oberflächlich. | »…Eine zählt das Rüsten als Ausfall, die andere nicht. Du nimmst die vierte: die dokumentierte.« |
| 2.5 | niedrig | `SANDRA_SZENEN.migrate` (`data.js:62`) | Ergänzen: »…Die Werkstatt: ›Die große.‹ Die Einheit: Stück oder Karton? ›Ja.‹« |
| 2.6 | niedrig | `KOLLEGE_BUBBLES.sandra` (`data.js:87`): »Etikett in 100 mal 60?« | »Etikett in 100 mal 60 mm?« (25 Zeichen, bleibt unter dem Limit von 40). |

Es fehlen diese MES-Themen, die zu Sandra passen: Stillstandsgründe-Katalog (BDE), Schichtwechsel und Zeitstempel (Sirene 14:00), Terminal-Puffer bei Netzausfall, Fehlerwarteschlange der Schnittstelle, Nacharbeit und Ausschussbuchung, Teilmengen und Chargensplitting, Änderungsprotokoll. Vorschlag: vier neue Zeilen in `SANDRA_SZENEN2` oder als `SANDRA_SZENEN3`, Salze 35000 bis 35400, nur `rngA`, ohne Zeit. Zwei Beispiele:
- **BDE:** »Der Katalog der Stillstandsgründe hat 83 Einträge. Die Schicht nutzt drei: ›Sonstiges‹, ›Sonstiges 2‹ und ›Pause‹.«
- **Schnittstelle:** »Die Fehlerwarteschlange der Schnittstelle enthält 212 Meldungen. 211 sind dieselbe. Du suchst die eine andere.«

Dabei keine Begriffe aus Gesundheit oder Medizin verwenden. Sterilisation und Chargen sind Prozessbegriffe und bleiben unproblematisch.

## 3) Spielgefühl (Stärken und Schwächen)

Die Aktionsknöpfe zeigen bereits die kürzere Dauer (`ui.js:110-112`, `costOf` rechnet `figF` ein). Es fehlt aber der Bezug. Man merkt das Tempo, ohne zu wissen, warum. Der Schichtleiter-Aufbau (×0,6) ist unsichtbar, ebenso `testRisk`, `abnahmeChef -2` und `erklaeren`.

| Nr. | Schwere | Vorschlag (alles ohne Wertungsänderung) |
|---|---|---|
| 3.1 | mittel | **Vermerk auf den Knöpfen:** `ui.js:112` ergänzt hinter der Dauer einen kleinen Vermerk, wenn `|Δ| ≥ 2 Min.`: `<span class="small good">Sandra: −3</span>` oder `<span class="small warn">Sandra: +7</span>`. Die Vergleichsdauer kommt aus einer neuen Funktion `sim.actCostBase(S, room, id)`. Sie ruft `costOf` mit `{...S, figur: 'christian'}` auf, ist reine Anzeige und wirft keinen Zufall. Ungeprüft: ob `boxRabatt` in `costOf` rein lesend ist. |
| 3.2 | mittel | **Schichtleiter-Aufbau sichtbar:** In `figurNach` (`sim.js:576`) bei gedämpftem Gewinn `say(S, 'Schichtleiter +2 (bei dir wächst das langsamer, sonst +4)')`. Das ist nur eine Zeile in `msgs` und `dayLog`. **Kein neues Feld in S anlegen**, sonst bricht der Goldwert-Hash für Sandra. |
| 3.3 | niedrig | **Zeile unter dem Raumkopf:** Büro, Server und IT zeigen »Sandra: Schnittstellen-Arbeit geht flotter«, Halle und Werkstatt »Sandra: in der Halle dauert es länger, Christian als Kollege hilft«. Das ist ein reiner Textblock in `renderRoom`. |
| 3.4 | niedrig | **Testlauf und Erklären:** Im Titel-Tooltip (`title`) des Testlauf-Knopfs »Sandra: etwas weniger Fehlerrisiko«. Bei »Geduldig erklären« die Chance anzeigen (65 statt 50 %). |
| 3.5 | niedrig | **Figurenkarte im Spiel:** Klick auf den Namen im HUD öffnet Plus und Minus aus `SC.FIGUREN`. Heute stehen sie nur bei der Wahl. |

## 4) Balance Sandra

Ausgangslage (3000 Läufe, Bot): gut 56 gegen 58, `fleissig` 46 gegen 34 (+12 PP), `einfach` 37 gegen 23 (+14 PP), `ohneSchichtplan` 57 und damit 1 PP über gut. Alle harten Checks sind grün.

**Dürfen Sandras Werte geändert werden?** Ja. `FG(S)` liefert für Christian `null`, und der Goldwert-Test prüft Christian unabhängig. Voraussetzung: Christians Bot-Tabelle bleibt zeichengleich, und das Sandra-Gold ändert sich mit, sodass `sim.test.js:296` neue Hashes bekommt. Meine Wirkungsschätzungen sind **ungeprüft**, sie müssen mit `node tools/bot.js 3000 --check --figur=sandra` gemessen werden.

| Nr. | Schwere | Befund und Empfehlung |
|---|---|---|
| 4.1 | niedrig | **fleissig +12 PP:** Der Vorteil kommt daher, dass kürzere Dauern weniger Überstunden und damit weniger Familienverlust bedeuten (`BALANCE-v0.9`). Das ist erklärbar und bewusst. Der Bot ist hier nicht der Mensch: fleissig bleibt 10 PP unter gut. **Empfehlung: lassen und dokumentieren.** Soll es dennoch sinken, wäre Experiment A möglich: Sandras Zeitvorteil gilt nur bis 17:00 (in `costOf` den Faktor `figF` nur anwenden, wenn `!late`). Erwartung: fleissig etwa 4 bis 6 PP weniger, gut höchstens 1 PP weniger. Das bleibt im Rahmen (»gut höchstens 5 PP neben Christian«). |
| 4.2 | niedrig | **einfach +14 PP:** Im Zielbereich 20 bis 40 %, deshalb nur Warnung. Die Spielart ist wenig Aufwand, und Sandras Tempo trägt hier mehr. **Empfehlung: lassen.** Experiment A wirkt vermutlich auch hier, wenn einfach Überstunden macht. Das ist offen. |
| 4.3 | niedrig | **ohneSchichtplan 57 über gut 56:** Das Abstimmen des Schichtplans kostet Zeit und bringt Sandra wegen `schichtF` 0,6 zu wenig. Experiment C: `schichtF` von 0,6 auf 0,65 anheben, oder den Schichtplan davon ausnehmen. Erwartung: gut +1 bis 2, ohneSchichtplan unverändert, die Warnung entfällt. Nebenwirkung: Strategien, die viel mit dem Schichtleiter machen, werden etwas besser. Nur mit Messung übernehmen. |

Beide Experimente sind optional. Wenn sie die Checks nicht verbessern, gilt die Begründung oben und der Stand bleibt wie in v0.10.

## 5) Offene Punkte aus v0.10

| Nr. | Schwere | Befund |
|---|---|---|
| 5.1 | niedrig | **Besuch nach 17:00 bei offenem Raum.** Ablauf: `sim.js:247` begrenzt Besuche auf höchstens 16:30. `sim.js:287` setzt `pending`, sobald `minute >= at`. Eine Aktion kurz vor 17:00 springt über die Grenze (`doAct`, `ui.js:191`), dann zeigt `UI.tick` (`ui.js:206`) zuerst den Hinweis und `UI.hud` (`ui.js:55`) danach den Besuch über dem offenen Raum. Zeitprobleme ergeben sich nicht: Wählt man eine lange Option und kommt auf 20:00, schließt `ui.js:326` per `UI.tick` den Raum und beendet den Tag. **Mögliches Fehlerszenario** (nur gelesen): Der Hinweis ersetzt den Besuchsdialog, weil `overlay()` den Inhalt überschreibt. Die Buttons sind weg, `pending` bleibt, `act()` antwortet mit »Erst die Unterbrechung klären« (`sim.js:551`). Erst `hud()` nach »Weiter« öffnet den Besuch wieder. Das sollte funktionieren, ist aber ungeprüft. Außerdem lässt `act` am Pforten-Knopf »Feierabend« nichts zu, solange ein Besuch offen ist. **Vorschlag:** In `UI.hinweis` nicht anzeigen, solange `s.pending` offen ist (stattdessen nur Toast), und ein Test (siehe 6). |
| 5.2 | niedrig | **Textrenderer (`building.js:56-84`).** (a) Rotierter Text (`rot`) bekommt keine Mindestgröße (`minPx` greift nur im `else`-Zweig, `building.js:73-77`), der Text bleibt winzig. (b) Wachsender Text darf 25 % breiter werden (`q.mw * s * 1.25`), das überlappt Nachbarn. (c) Mit `maxW` staucht `fillText` die Zeichen horizontal. Besser wäre, die Schriftgröße zu verkleinern, bis es passt. (d) Pro Eintrag `v.font` und `strokeText` neu setzen. Gleiche Schrift gruppieren. (e) `growF` rechnet mit `cv.width / W`, `drawBubble` (`building.js:332`) misst mit `ctx.font` der Zeichenfläche ohne Skalierung. Das passt nur, solange `DPR` und `W` konstant sind. **Konkret:** (a) und (b) beheben. (c) bis (e) nur, wenn Messung oder Screenshot es verlangen. |
| 5.3 | niedrig | **gut1730 mit 77 %** (`BALANCE-v0.5`, `v0.8`): Der Vorsprung bleibt auf Wunsch des Projektinhabers stehen, weil jede Änderung an Überstunden Christians Würfe verändert. Möglich ist nur eine Anzeige: Der 17:00-Hinweis (`ui.js:206`) nennt schon »Familie« und »müde ×1,2«. Mehr geht für Christian nicht, ohne die Wertung zu ändern. **Für Sandra** wäre Experiment A in 4.1 auch hier die einzige Stellschraube. Den Wert für Sandra gibt es nicht in den Dokumenten, vor einer Entscheidung `--check --figur=sandra` mit gut1730 lesen. **Fazit: dokumentieren, nicht ändern.** |

## 6) Tests, die ergänzt werden sollten

1. **`sim.test.js`, Texte:** Für Sandra darf nach `SC.fill` in keinem Textbaustein »Hemd«, »Pappkamerad«, »jünger«, »Paar des Abends«, »Burnout« vorkommen (durch alle `SC.*` Textlisten laufen). Schützt 1.1 bis 1.3 und 1.6.
2. **`names.test.js:23`:** `figTxt` um `SANDRA_SZENEN2`, `CHRISTIAN_TIPPS2` und `SANDRA_NPC2` erweitern. Heute prüft `sim.test.js:305` sie nur auf Gedankenstriche, Anführungszeichen und Platzhalter, nicht auf Fremdnamen.
3. **`HEALTH` in `names.test.js:20`:** `Burnout|krank` ergänzen, nachdem 1.6 geklärt ist.
4. **Knopf-Vermerk (nach 3.1):** `actCostBase` gleich `actCost` für Christian, für Sandra gleich Christians Dauer. Danach das Gold-Hash-Muster aus `sim.test.js:269` wiederholen: Aufruf ändert den Zustand nicht.
5. **Dämpfungs-Meldung (nach 3.2):** Der Text erscheint nur für Sandra, nur bei Gewinn, und `S` bekommt keine neuen Schlüssel. Das Sandra-Gold bleibt bis auf `msgs` und `dayLog` gleich.
6. **Besuch nach 17:00 (5.1):** `act` bei `minute = 16:55` und 90 Minuten, dann Besuch offen. Erwartung: Hinweis ersetzt den Besuch nicht (oder der Besuch erscheint nach »Weiter«). In `browser-check.js` mit offenem Raum prüfen.
7. **Pappaufsteller-Paar (1.3):** Eine `fill`-Probe pro Satz in `SC.PAPPE`, `PAPPE_EGG`, `WOCHENEND_GAG[0]` und `ABSCHLUSS`.
8. **Szenen-Plausibilität:** Jede Szene in `SANDRA_SZENEN` und `SANDRA_SZENEN2` hat höchstens 220 Zeichen (Handy-Zeilenlänge) und bleibt ohne Namen außer Christian und Sandra.
9. **Experiment A oder C (4):** Jede Änderung in `tools/bot.js` mit neuer Schwelle absichern und Christian weiter zeichengleich zu v0.9.0 prüfen.

## Reihenfolge für v0.11

1. Texte 1.1 bis 1.8, 2.1 bis 2.6 und die vier neuen Szenen (nur Daten).
2. Sichtbarkeit 3.1 bis 3.3 (Anzeige, ohne Wertung).
3. Renderer 5.2 (a) und (b), Besuch-Hinweis 5.1.
4. Tests aus 6, dann Bot-Lauf für Christian (muss zeichengleich bleiben) und Sandra.
5. Balance-Experimente 4.1 und 4.3 nur bei sauberer Messung, sonst Doku wie oben.

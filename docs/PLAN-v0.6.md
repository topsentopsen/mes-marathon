# Plan MES-Marathon v0.6.0 »Feinschliff«

Plan von Claude Code (nur lesend), Stand 19.10.2026. Die Balance-Zahlen sind Schätzungen, gemessen wird bei der Umsetzung (Ergebnis in `docs/BALANCE-v0.6.md`). Vorgabe: Feinschliff, Bugfixes, Balance, kleine Gags, keine großen Umbauten.

## 1) Balance: Spätzuschlag statt Familien-Hebel
**Ursache:** `gut` startet nach 17:00 keine Aktion mehr, `gut1730` und `fleissig` schon. Familie-Hebel treffen deshalb vor allem `fleissig`, das am Familien-Abgrund (Kippschwelle) steht, nicht `gut1730`. Der Hebel soll daher an Aktionen hängen, die nach 17:00 beginnen.

**Neuer Wert:** `TUNE.ueber.spaet` (`data.js:83`). In `costOf` (`sim.js:554`, nach dem Mittagsrabatt) wird die Dauer mit `ueber.spaet` multipliziert. Das gilt nur, wenn `cost > 0` und `S.minute >= SC.DAY_END + (S.partyMin || 0)`. Die Pforte bleibt bei 0 Minuten, die Party-Tage zählen nicht.

| Variante | TUNE | Erwartung (Schätzung) |
|---|---|---|
| A | `spaet: 1.10` | gut1730 ca. 75, fleissig ca. 50, gut unverändert |
| B | `spaet: 1.20` | gut1730 ca. 73, fleissig ca. 33 (das ist die Vormessung aus BALANCE, dort für »Arbeit nach 17:00 ×1,2«) |
| C | `spaet: 1.10` plus neu `ueber.rest: 4` (`sim.js:791`: `55 − round(over/rest)`, bisher fest 6) | gut1730 ca. 73 bis 74, gut höchstens −1 |

**Annahmen und Risiken:**
- Es kommt kein neuer Zufall dazu, die alten Würfe je Seed bleiben gleich.
- Kein Hebel trifft `gut` laut Konstruktion.
- Mit fleissig unter 64 wird `bieter` (63 bis 64) zum Bestwert. Dann schlägt `bot.js:174` an, weil `bieter` nicht in `SANE` steht.
- `fleissig.fam` kann unter 20 % rutschen.

**Entscheidung:** nehmen, was mit n=3000 gut ≥ 58, gut1730 ≤ 75 und fleissig ≤ gut+3 liefert. Wenn A und C bei gut1730 über 75 bleiben, wird B genommen.

## 2) Bugfixes und Feinschliff
1. **Wartezeit der Sirene fehlt auf den Knöpfen.** `sim.js:533` setzt in den Hallen still auf 14:20, `ui.js:89` zeigt nur die Dauer. Neu: `sim.handoverWait(S, room)`, Anzeige »(75 Min. + 12 Wartezeit)«.
2. **Krankheitstag am Dienstag lässt die Ausschreibung ausfallen.** `sim.js:147` hängt das Los nur dienstags aus. Fix: Dienstag oder Mittwoch, `closeDay = S.day + (weekday===1 ? 1 : 0)` (`sim.js:149`), Text »bis heute 15:00«. Der Schutz `week === w` verhindert Doppelungen.
3. **Toter Code:** `ui.js:267` (`S().day += 0`) entfernen.
4. **Texte zum Spätzuschlag:** `ui.js:180` (17:00-Hinweis) und die Anleitung `ui.js:252` ergänzen.
5. **Doku:** `README` (»Offen: 17:30«) und Hilfe »Neu in 0.6« aktualisieren, `SC.VERSION = '0.6.0'` (`data.js:6`).

## 3) Gags
Alle Gags haben keine Spielwirkung und nutzen keinen Zufall. Die Texte rotieren über Zähler. Salzblock 30000–30999 bleibt für v0.6 reserviert, 31000+ für v0.7.

- **Pappkamerad (Büro).** `sim.js:405`, vor `mail`. Aktion »Den Pappkameraden anschauen« (3 Min., Energie 0), neu `stats.pappe` (`load` ergänzt das Feld). Texte in `SC.PAPPE`, zum Beispiel:
  - »Der Pappkamerad sitzt auf deinem Stuhl. Ein Kollege grüßt ihn. Seine Haltung ist besser als deine.«
  - »Der Schichtleiter lädt den Pappkameraden zu einem Meeting ein. Er kommt nicht. Die Einladung schon.«
  - Ei beim 6. Mal: »Der Pappkamerad hat den besten Terminkalender im Werk: leer.«
  - Er geht in kein Meeting, die Meeting-Invarianten bleiben unberührt.
  - Test: Aktion bei offenem Meeting, danach sind `S.meetings`, `chef`, `schicht` und `energy` gleich, nur `minute +3`, Ei genau einmal.
- **Aufzugknopf (kein neuer Raum).** `building.js:377`: neben `chimney` kommt `liftHit(x, y)` für den Schacht. `sim.aufzug(S)` zählt wie `archiv` (`sim.js:672`), Ei beim 7. Mal. `ui.js:277` ruft es im Klick-Handler auf. Texte in `SC.AUFZUG`:
  - »Der Aufzug ist schon da.«
  - »Der Aufzug denkt nach.«
  - Ei: »Du bist im Aufzug-Studio: Heute zu Gast niemand. Wir haben nur Zeit bis Ebene drei.«
  - Test: 7 Aufrufe, `eggs.aufzug` gesetzt, +25 Punkte nur einmal.
- **Fax-Gerät (Druckerraum).** `sim.js:458`: Aktion »Das Fax-Gerät benutzen« (5 Min.). Nach dem Elon-Ei (`S.eggs.elon`) lautet das Label »Elon-Abo per Fax kündigen«, die Antwort: »Empfänger unbekannt. Das Abo läuft weiter.« Ei beim 5. Mal: Fax von Werk Nord mit Entschuldigung auf Folie 39. Elon bleibt eine vage Umschreibung des Kollegen. Test: `stats.elon` unverändert, Elon-Satztest auch über `SC.FAX_ELON`.

## 4) Komfort (2)
1. **Endzeit auf den Aktionsknöpfen** (`ui.js:89`): »(75 Min., fertig 15:45)«. Die Zeit wird `warn`-markiert, wenn sie nach 17:00 liegt, mit Hinweis auf den Zuschlag.
2. **Taste K für Kopfhörer** (`ui.js:296–302`, mit Guard für `S()` und `kopfWhy`). Dazu Tooltips mit den Tasten an Pause, Tempo und Ton (`index.html:26–29`).

## 5) Tests und Bot
- **Spätzuschlag:** vor 17:00 unverändert, `spaet = 1` ist v0.5-identisch, auf Party-Tagen erst ab 17:00 + `partyMin`, Knopf und Aktion zeigen dieselbe Dauer (Gesamtprüfung #5).
- **Ausschreibung:** hängt nach dem Krankheitstag am Mittwoch aus, `auktionOpen` um 14:59 wahr und um 15:00 falsch.
- **Weitere Tests:** `handoverWait` (14:05 gibt 15 Min.), Namenstest für die neuen Texte, `rs`, `rf`, `rm` bis Tag 12 bleiben identisch, VERSION-Test auf 0.6.0.
- **Bot:**
  - `bieter` in `SANE` aufnehmen (`bot.js:173`).
  - `fleissig.fam ≥ 20 %` ersetzen durch »oder ≥ 10 PP unter gut«.
  - Neue Strategie `gagfan` (Pappkamerad und Fax je dreimal, vor `bot.js:99`) mit der Invariante `gagfan ≤ gut` und gleicher Meetingzahl.
  - `gut1730 ≤ 75` und `fleissig ≤ gut+3` von Warnung auf hart hochstufen, aber nur, wenn sie in der Messung halten.

## 6) Nicht in v0.6 (→ v0.7)
- Aufzug-Studio als Raum.
- Pappkamerad als Meeting-Ersatz.
- Ausschreibung mit mehreren Bietern und Los »Lizenzen«.
- Familienmodell mit Abendessen-Ereignissen.
- Neue Salze oder Genauigkeit bei `rngA`: die Salzbereiche überlappen (`sim.js:433`, `518`, `615`), das würde die Würfe der Elon-Texte aus v0.5 je Seed verschieben.
- Jahreszeiten, Wetter, Lebkuchen, Betriebsrat, Zertifizierungsaudit, Jingles, Handspiel-Bot.
- Kalender-Gag im Schichtleiter-Büro.
- Reihenfolge von Wochenende und Krankheitstag bei Burnout am Freitag.
- Kaffee-Malus nach Burnout am Freitag.

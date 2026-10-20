# Plan v0.9.0-Figuren: Sandra und Christian

Ich habe nichts geändert und keinen Test und keinen Bot laufen lassen. Alle Zahlen zur Balance sind Schätzungen aus dem Code. Gemessen wird erst in der Umsetzung (Abschnitt 5).

## 1) Datenmodell und Figurenwahl
- `data.js:17`: `SC.PLAYER` wird zu `SC.FIGUREN = {christian, sandra}`.
  - Felder je Figur: `name`, `col`, `der` (der/die), `den` (den/die), `in` (''/'in').
  - Sandra: Farbe `#58b8a8`.
- `sim.js:23`: `newGame(seed, figur='christian')`.
  - Neues Feld `S.figur`, `S.name` kommt aus `SC.FIGUREN`.
  - Startwerte kommen aus `TUNE.figur[figur].start`.
- `sim.js:878` (`load`): Das Feld wird schon aus `newGame` aufgefüllt, ein alter Stand bekommt also `'christian'`.
  - Zusätzlich: unbekannte Figur wird zu Christian.
  - `VERSION` bleibt `0.9.0`, `SAVE_OK` bleibt.
- `ui.js:300`: `o==='new'` öffnet `pickFigur()`.
  - Zwei Karten mit Porträt, Name, je zwei Zeilen Stärken und Schwächen und den Knöpfen `button[data-f=…]`.
  - Die Wahl ruft `UI.newGame(seed, figur)` auf (`ui.js:256`) und merkt sich die Figur in `localStorage` (`mesmarathon-figur`), nicht in `S`.
- `ui.js:265`: Der Titeltext wird neutral: »Du bist Christian oder Sandra«.
- `ui.js:267`: »Weiterspielen (Tag n, Name)«.
- `main.js:24`: `debug.newGame(seed, figur)`.
- **Grafik:**
  - `building.js:85` (`drawMan`) bekommt einen `look`-Parameter.
    - Sandra: Farbe `#58b8a8`, braune Haare, Pferdeschwanz (rund 6 `rect`).
    - Die Zeilen 92 und 99 sind bisher die Christian-Variante (graue Haare, Hemd).
  - Das Porträt von Sandra zeichnet `UI.portrait('sandra')` direkt mit `fillRect` (32×32) in ein Canvas und gibt `toDataURL` zurück.
    - Kein Umfärben von `portrait.png`, denn `getImageData` ist unter `file://` gesperrt.
    - Christian behält die PNG-Datei.

## 2) Mechanik (`TUNE.figur`)
Christian ist die neutrale Basis: Alle Faktoren sind 1, alle Boni 0. Sein Altwissen und seine Beziehungen sind der Maßstab, und Sandra muss sie sich erst erarbeiten. Christians Müdigkeit und Tool-Ferne zeigen sich darin, dass er keine Tool-Boni hat. Dadurch bleiben die Würfe und Werte je Seed unverändert.

**Sandra:**
- **Start** (`sim.js:26`): Werkleitung 55 (60), Schichtleiter 42 (50), Familie und Energie wie Christian.
- **Dauer-Faktoren** in `costOf` (`sim.js:563`, nach `slow`):

  | Aktion | Faktor |
  |---|---|
  | `spec` | 0,9 |
  | `impl` | 0,85 |
  | `deploy` | 0,8 |
  | `restart` | 0,8 |
  | `migrate` | 0,85 |
  | `bericht` | 0,8 |
  | `review` | 0,75 |
  | `req` (Hallen) | 1,2 |
  | `repair` und `notbehelf` | 1,25 |

- **Schichtleiter-Gewinn** ×0,6 an drei Stellen (`sim.js:364`, `:368`, `:435`), Abnahme-Werkleitung +6 statt +8 (`sim.js:494`).
- **Fehlerrisiko Testlauf:** −0,04 (`sim.js:358`).
- **Besuche:**
  - Mapping beim Altwerk 18 statt 30 Min. (`:657`).
  - Ahnungslos erklären klappt mit 0,65 statt 0,5 (`:653`).
  - Falsche Pyramiden-Antwort kostet 25 statt 40 Min. (`:650`).
- **Christian als NPC-Besuch:** Das Gespräch kostet 12 Min. und bringt Schichtleiter +4. Es kommt mit 45 % am Tag, ab Tag 2.

**Begründung:** Sandra spart bei den Werkzeugaufgaben etwa 90 Min. je Modul. Sie verliert bei den informellen Wegen, bei Schichtleiter und Werkleitung sowie in der Werkstatt. Der Besuch von Christian gleicht einen Teil davon aus.

## 3) Szenen und Sprüche
Alle Texte sind Sandras Meldungen im Spiel (`say`). Die Platzhalter `{name}` usw. werden dabei ersetzt (siehe 4).

**Sandra:**
1. Tag 1, Pforte: »Der Pförtner gibt dir einen Ausweis: ›Gast‹. Nach Rückfrage: ›MES, Ebene drei.‹ Er kürzt auf ›Ebene drei‹.«
2. Stammdaten: »11.000-mal ›Schraube‹. Sandra fragt: Welche? Die Werkstatt: ›Die große.‹«
3. Excel-Liste: »47 Spalten. Sandra markiert sechs fürs MES. Die Spalte ›Bemerkung‹ enthält alle Geschäftsregeln.«
4. BDE: »Der Bediener: ›Tippen wir abends nach.‹ Sandra schreibt ›Echtzeit‹ aufs Whiteboard und streicht es durch.«
5. Tool-Zoo (Serverraum): »Sieben Tools für die Auftragsübergabe: vier gleich, eines tut nichts, das siebte ist der Schichtleiter.«
6. OEE (Leitstand): »Drei Leute, drei Formeln für die OEE. Sandra nimmt die vierte: die dokumentierte.«
7. Schichtleiter: »Sandra fragt: ›Warum schon immer?‹ Es folgt die längste Pause des Tages.«
8. Schnittstelle: »Sandra zeichnet die Schnittstelle. Der Drucker meldet sich als Teilnehmer an.«

**Christian bei Sandra (NPC, Besuch `christian`):**
- »Der Schichtleiter sagt nie Nein. Er sagt ›Wir schauen mal‹.«
- »Frag nicht nach dem Ticket, frag die Werkstatt nach dem Kaffee.«
- »Die Liste ist nicht schön, aber sie stimmt.«
- Sprechblasen: »Erst Kaffee, dann Frage.«, »Dein Mapping ist besser als mein SVERWEIS.«

**Sandra bei Christian (NPC):** Das ist nur eine Logzeile und eine Blase, kein Besuch mit Zeitkosten.
- Hintergrund: Ein echter Besuch würde Christians Tagesplan verschieben, und die Bot-Tabelle für Christian soll identisch zu v0.8 bleiben.
- Die Zeile kommt über `rngA` mit Salz 33100, ohne Zeitkosten.
- Beispieltext: »Sandra, die neue Kollegin aus der MES-Entwicklung: ›Dein SVERWEIS ist beeindruckend. Ich hab ihn nachgebaut, dauert drei Tage.‹«
- Blasen: »Mapping? Gib mir 10 Min.«, »Frag mich zum BDE-Feed.«

**Salze:** 33000 (Besuch) und 33100 (Logzeile) für den Besuch bzw. die Logzeile. Die Szenen laufen über `gagA` mit 33200 und 33300 (Salz-Audit in `sim.test.js:245` prüft die Überlappung).

## 4) Textschablone
- Platzhalter `{name}`, `{der}`, `{den}`, `{in}` (z. B. »{der} vom MES«).
- Eine Hilfsfunktion `SC.fill(S, t)` wird an folgenden Stellen angewendet:
  - in `say` (`sim.js:51`),
  - in `visitText` (`sim.js:601`),
  - bei den Sprechblasen (`building.js:285`),
  - an den Pförtner-`why`-Texten (`sim.js:547`).
- Zu ersetzen sind:
  - die Anreden in `data.js` (144, 156, 133, 179, 193, 275),
  - die Kostüme (270), `PYRAMID_Q`, `VORZEIG` (426),
  - die Stellen mit »der/den vom MES« (364, 430),
  - `sim.js:400` (Excel-Dateiname), `:538`, `:547`, `:612`, `:614`,
  - `ui.js:152`, `:265`, `:271`, `:283`.
- Das Kostüm »Hemd wie immer« bekommt für Sandra die Variante »Blazer wie immer«.
- `index.html:6` (Titel) wird neutral.

## 5) Bot und Balance
- `bot.js:10`: Die Dauer wird mit `sim.figF(S,id)` multipliziert (für Christian exakt ×1). `run(n, figur)` ruft `newGame(1000+i*7919, figur)` auf, aufrufbar mit `--figur=sandra`.
- **Neue Bot-Regel:** `resolveVisit` nimmt bei `christian` und `P.visit != 'skip'` immer `opts[0]`.
- **Messung:**
  - 3000 Partien je Figur.
  - Christian: `diff` zur v0.8-Tabelle muss leer sein.
  - Sandra: Ziel `gut` = 58 ± 5 %, und Abstand zu Christian `gut` höchstens 5 PP.
- **Stellschrauben, nur für Sandra:** `impl`/`spec`-Faktor in Schritten von 0,05 und Startwert Schichtleiter in Schritten von 5.
- **Invarianten:**
  - Dieselben harten Checks wie bisher gelten je Figur.
  - Keine SANE-Strategie liegt mehr als 8 PP über der von Christian.
  - Eine Sandra-Strategie »nur Schichtleiter pflegen« (`sandraNetz`) darf höchstens `gut`+3 PP erreichen.
- **Meine Schätzung vorab:** Sandra liegt zuerst klar über Christian. Dann würde ich die Faktoren auf 0,9 bis 0,95 anheben.

## 6) Tests
- **sim.test.js:**
  - Die `KEYS` in Zeile 253 bekommen `figur`.
  - 0.7.0- und 0.8.0-Stände laden mit Christian.
  - Sandra-Start: Werkleitung 55 und Schichtleiter 42.
  - Dauer-Faktoren: `impl` kostet für Sandra 64 statt 75 Min.
  - Platzhalter: `{name}` bleibt in keinem Ausgabetext stehen.
  - Salz-Audit mit den neuen Salzen ab 33000.
  - Keine Würfe für Christian verändert: gleiche Meldungen und Werte je Seed.
- **names.test.js:**
  - Erlaubte Namen sind nur Christian und Sandra.
  - Ein neuer Allowlist-Check findet »Name:«-Zeilen und Texte mit Namen.
  - »Elon« steht nur in den Texten des Tesla-Kollegen (`data.js:309` ff.).
  - Die Testdateien sind ausgenommen.
- **browser-check, mobile-audio und playthrough:**
  - Nach `button[data-o="new"]` folgt zuerst `button[data-f=christian]`: `browser-check.js:22`, `mobile-audio.js:30` und `:55`, `playthrough.js:23`.
  - Neu: Die Figurenwahl ist der erste Schritt nach »Neues Spiel«, mit zwei Karten und beiden Porträts.
  - Nach `data-f=sandra` stehen `S.figur='sandra'` und der Name in den Sprechblasen.
  - Ein Kurzlauf (3 Tage) mit Sandra ohne Konsolenfehler.

## 7) Nicht in dieser Version
- Kein neuer Raum und keine neuen Spielregeln.
- Keine Änderung an Christians Werten oder Würfen.
- Kein Besuch von Sandra bei Christian mit Zeitkosten.
- Keine Mehrspieler-, Figurenwechsel- oder Dialog-Bäume.
- Kein neues Werkzeug, kein Installieren, keine neue Bilddatei.
- Kein Wort zu Gesundheit.

## Umsetzung: Abweichungen vom Plan
- Textschablone: Statt Platzhalter in jedem Text bleiben die Texte für Christian geschrieben. `SC.fill` passt sie für Sandra an (Christian zu Sandra, »der/den vom MES« zu »die vom MES«, »Hemd wie immer« zu »Blazer wie immer«, »MES-Projektleiter« zu »MES-Spezialistin«). `{C}` steht für Christian als Kollegen und wird nach der Anpassung eingesetzt. Angewendet an den Anzeigestellen (Overlay, Raum, Ticker, Sprechblasen), nicht in der Spiellogik.
- Faktoren nach Messung angehoben (Plan: Schätzung »Sandra zuerst klar über Christian«, gemessen 73 % zu 58 %): spec 0,95, impl 0,9, deploy und restart 0,85, migrate 0,9, bericht 0,85, review 0,8; Schwächen verstärkt: req 1,25, repair und notbehelf 1,4.
- Schichtleiter-Gewinn ×0,6 wird zentral nach jeder Aktion verrechnet (nicht an drei Stellen), Abnahme bringt Sandra 2 Punkte weniger.
- Salze: 33000 und 33100 (Besuch Christian), 33200 (Tipp), 33300 (Szenen), 33400 und 33500 (Zeile von Sandra bei Christian).
- fleissig darf bei Sandra bis 15 PP über Christian liegen und muss 5 PP unter gut bleiben (docs/BALANCE-v0.9.md).

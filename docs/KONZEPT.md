# MES-Marathon – Konzept v0.2.0

Stand: Planung nach v0.1.1. Umsetzungsschritte stehen in `docs/PHASEN.md`.
Dieses Dokument beschreibt, **was** das Spiel in v0.2.0 sein soll. Alle Zahlen sind Startwerte, die der Balance-Bot (`tools/bot.js`) nachjustiert.

> Hinweis zur Quellenlage: `/workspace/sender-chef` war für die Planung nicht lesbar (Zugriff verweigert). Der Abschnitt „Sender-Chef/Mad TV“ (Kap. 14) stützt sich deshalb auf die bekannte Mad-TV-Mechanik und auf das, was in v0.1.1 bereits übernommen ist. Vor Umsetzung kurz gegen `sender-chef/docs/PLAN.md` und `js/data.js` prüfen und Kap. 14 ggf. korrigieren.

---

## 1. Spielidee in einem Satz

**Christian** führt seit Jahren ein MES (Manufacturing Execution System) in einer Fabrik ein. Er läuft durch ein Werk, das **wie die Automatisierungspyramide gebaut ist** (unten Feld, oben ERP), nimmt Anforderungen auf, schreibt, implementiert, testet und lässt abnehmen – und wird dabei von Meetings, Kollegen, einem störrischen Verpackungsautomaten, der IT-Chefin mit ihrer Pyramide, zwei Großprojekten (SAP, Firmenübernahme) und dem Budget gebremst. Comedy, kein Drama.

Spielname: **MES-Marathon**. Spielrahmen: 20 Arbeitstage (Go-Live Tag 20), Echtzeit mit Pause/Tempo, Rundenabschluss pro Abend, Wochenendschicht am Freitag. Das alles bleibt aus v0.1.1.

## 2. Spielschleife (unverändert, plus neue Ebene)

1. **Morgens**: Termine im Kalender ansehen (Werkleitung-Daily, Schichtleiter-Meetings, evtl. nützliche Meetings).
2. **Tagsüber**: Raum anklicken, Figur läuft hin (Aufzug), Aktion wählen, Uhr läuft. Pro Modul: Requirements (Halle) → Spezifikation (Büro) → Implementierung (Büro) → Deployment (Serverraum) → Testlauf (Halle, Teststation des Moduls) → Ausdruck (Drucker) → Abnahme (Werkleitung).
3. **Unterbrechungen** (neu): Kollegen und Störungen platzen in den Tag (Kap. 7). Kleine Entscheidungen im Dialogfenster.
4. **Abends**: Bilanz (Werkleitung, Familie, Energie, Schichtleiter, **Budget, KPIs**), Werksvergleich mit Werk Nord und Werk Süd.
5. **Freitag**: Wochenrückblick (KPI-Soll/Ist), Wochenendschicht ja/nein (kostet Familie, Energie **und Budget**).

**Neu in v0.2.0 – die zweite Ebene:** Module liefern nicht nur „Fortschritt in Prozent“, sondern verbessern **KPIs** (OEE, Ausschuss, Durchsatz, Liefertreue) und **erleichtern den Alltag** (z. B. automatischer KPI-Bericht, weniger Schichtübergabe-Meetings). Das gibt dem Spiel eine Aufbaukurve wie bei Mad TV.

## 3. Figuren

**Namensregel (verbindlich):** Nur **Christian** hat einen Namen. Alle anderen Figuren, Werke und Gegenstände werden **nur über Rollen/Bezeichnungen** angesprochen. Das gilt für Spieltext, HUD, Code-Bezeichner, Kommentare, README, Tests. Details in Kap. 12.

| Figur (Rolle) | Ort | Verhalten / wiederkehrende Rolle | Ton |
|---|---|---|---|
| **Christian** (Spieler) | überall | ca. 40, sehr viel graue Haare, kein Bart, Hemd. Leitet das MES-Projekt seit Jahren. | selbstironisch |
| **der Schichtleiter** | Schichtleiter-Büro (EG), Meetings (Leitebene) | Lädt zu nutzlosen Meetings ein. Wer kommt, bekommt kurz Gefälligkeiten (Linie frei), aber das Meeting-Karussell dreht sich schneller. | herzlich-wichtigtuerisch |
| **die Werkleitung** | Werkleitung (ERP-Etage) | Liest täglich die Excel-Liste, nimmt ab, vergleicht die Werke, verteilt Ziele. | trocken, streng-fair |
| **die IT-Chefin** | IT-Büro (MES-Etage), taucht überall auf | Kommt **immer** mit der Automatisierungspyramide. Fragt „Auf welcher Ebene…?“. Richtige Antwort hilft, falsche gibt Vortrag. | begeistert, pedantisch, sympathisch |
| **der Tesla-Kollege** | Flure, Kaffeeküche | Redet den ganzen Tag Quatsch über Tesla (Reichweite, Software-Updates, Lackfarben). | harmlos, nervig-komisch |
| **der Kollege, der nichts arbeitet** | Flure, neben dem Tesla-Kollegen | Arbeitet nicht, redet nur mit dem Tesla-Kollegen, nickt und kommentiert. Erscheint **als Duo** mit dem Tesla-Kollegen. | Running Gag |
| **der italienische Kollege** | überall, ca. stündlich | Lenkt mit Geschichten aus Italien und vom Essen ab (liebevoll, kein Klischee-Spott; er ist fachlich gut und großzügig). | warm, appetitanregend |
| **ein Kollege ohne Ahnung** (mehrere: Vertrieb, Einkauf, Marketing) | Büro, Flure | Fragt ahnungslos („Ist das MES das mit Excel?“). | freundlich-naiv |
| **der Verpackungsautomat** | Innenverpackung / Außenverpackung | Macht ständig Probleme (Etikettenstau, Folienriss, „Fehler 17“). Eine Figur ohne Gesicht, aber mit Charakter. | Dauerbrenner |
| **die Instandhaltung** | Werkstatt (Steuerung) | Repariert Stationen; gibt Tipps. | lakonisch |
| **der Pförtner** | Pforte | Feierabend ab 15:00, schließt um 20:00 ab. | knapp |
| **die Kantinenkraft** | Kantine | Mittagessen, Tipps (`SC.TIPS`). | mütterlich-trocken |
| **der Drucker** | Druckerraum | Papierstau. Gegenstand, nicht Person. Kein Eigenname (alter Name entfällt). | Dauerbrenner |
| **die Controlling-Kraft** | Controlling (ERP-Etage) | Gibt Budget frei, gewährt Vorschuss, mahnt. | knausrig-höflich |
| **Werk Nord / Werk Süd** | Werksvergleich | Konkurrierende Werke, die dasselbe MES einführen (nur Fortschrittsbalken). | Wettbewerb |
| **der Kollege vom Altwerk** (ab Firmenübernahme) | Flure | „Bei uns hieß das Feld aber anders.“ | freundlich-stur |

**Christian als Icon:** Pixel-Portrait (`img/portrait*.png`, `tools/portrait.py`) und Spielsprite: graue, volle Haare (zwei Grautöne), kein Bart, Hemd mit Kragen, ca. 40.

## 4. Gebäude: Querschnitt als Automatisierungspyramide

Gebäude bleibt 5 Etagen mit Aufzug, aber jede Etage ist eine **Ebene der Pyramide** (unten ist das Feld, oben ERP). Das macht die Pyramide der IT-Chefin zum begehbaren Gag und erklärt Spielern die Struktur.

| Etage | Ebene | Türen (Raum-ID) | Inhalt |
|---|---|---|---|
| 0 (EG) | **Feld** | PFORTE `pforte`, SCHICHT `schicht`, HALLEN `halle` | Maschinenhallen. Sichtbar links/rechts vom Turm als Hallenflügel mit Sheddach (Kap. 13). |
| 1 | **Steuerung** | WERKSTATT `werkstatt`, DRUCKER `drucker`, KANTINE `kantine` | SPS/Instandhaltung, Drucker, Werkskantine |
| 2 | **Leitebene** | BÜRO `buero`, LEITSTAND `leitstand`, MEETING `meeting` | Engineering-Büro (Excel-Liste), Leitstand (KPI/Reporting), Besprechungsraum |
| 3 | **MES** | SERVER `server`, ARCHIV (nur Deko), IT `it` | Serverraum, IT-Chefin |
| 4 | **ERP** | CHEF `chef`, HR (nur Deko), CONTROLLING `controlling` | Werkleitung, Budget |

### Produktionsbereiche (Hallen/Stationen im Raum `halle`)

Sieben Stationen, Namen **exakt so**, ohne Ausdeutung der Abkürzungen: **DEA, DEC, EEA, Extrusion, Innenverpackung, Außenverpackung, Sterilisation**.

Jedes Modul hat eine **Teststation** (dort Requirements und Testlauf):

| Modul | Teststation |
|---|---|
| Auftragsverwaltung | DEA |
| Betriebsdatenerfassung (BDE) | DEC |
| Rückverfolgung | Innenverpackung |
| Qualitätsprüfung | Sterilisation |
| ERP-Schnittstelle | EEA |
| Systemfusion Altwerk (ab Tag 13) | Extrusion |

Außenverpackung hat keine Modulaufgabe, zählt aber für Störungen und KPIs. Der Verpackungsautomat steht in Innen- **und** Außenverpackung (70 % / 30 % der Störungen).

## 5. Werte und Ressourcen

| Wert | Bereich | Start | Verlust bei | Bemerkung |
|---|---|---|---|---|
| Energie | 0–100 | 100 | Arbeit, Meetings, Überstunden | 0 = Zusammenbruch (wie bisher) |
| Werkleitung (Laune) | 0–100 | 60 | verpasste Meetings, Excel, Rückstand | 0 = Projekt abgezogen |
| Familie | 0–100 | 70 | Überstunden, Wochenendschicht | 0 = Kündigung (Imker) |
| Schichtleiter (Laune) | 0–100 | 50 | verpasste seiner Meetings | **Nutzen gedeckelt bei 80** (Balance, Kap. 10) |
| **Budget (k€)** | −∞…∞ | 90 | Testläufe, Reparaturen, Wochenende, Lizenzen | < 0 Budgetsperre, < −40 Projektstopp |
| **KPI-Index** | 0–100 | – | – | aus 4 Kennzahlen (Kap. 8), nur Anzeige, Reporting, Punkte |

Weitere: Kaffee-Zähler, Mittagessen, Server-/Druckerstatus, **Stationsstörungen**, SAP-Zustand, Fusionszustand.

Neue Niederlage: *Budget unter −40 k€* („Das Controlling stoppt das Projekt“). Alle bisherigen Siegbedingungen bleiben (alle Module abgenommen), jetzt inklusive Systemfusion nach Tag 13.

## 6. Alltag (bleibt, wird ergänzt)

Spezifikationen, Requirements, Testläufe, Implementierungen, Meetings, Wochenendschichten, Excel-Liste, Drucker, Serverraum, Kantine bleiben. Änderungen:

- Pipeline-Bedarf je Modul: `req 3 / spec 3 / impl 4 (vorher 5) / test 3`, weil die neuen Unterbrechungen Zeit kosten. Fusionsmodul: `2/2/3/2`.
- Testläufe kosten 2 k€ (Ausschussware) und gehen nicht, wenn die Teststation steht.
- **Schichtwechsel 14:00** mit Sirene: Halle-Aktionen warten bis 14:20 (Schichtübergabe).
- Module, die abgenommen sind, bringen **Alltagsvorteile**: BDE → KPI-Bericht in halber Zeit; Rückverfolgung → Reparatur des Verpackungsautomaten 15 Min schneller; Qualitätsprüfung → Bugwahrscheinlichkeit −5 %-Punkte; Auftragsverwaltung → weniger Schichtübergabe-Meetings; ERP-Schnittstelle → Budgettranche +5 k€.

## 7. Ereignisse

### 7.1 Besucher-Dialoge (wiederkehrend, Tagesplanung)

Zu Tagesbeginn wird eine Liste „Besuche“ ausgewürfelt. Beim Eintreten pausiert die Uhr, eine Figur läuft zu Christian, ein Dialog mit 2–3 Optionen erscheint (Zeit/Energie/Folgen). Nie während eines Meetings, nie zwei gleichzeitig, mindestens 25 Min Abstand.

| Figur | Wahrscheinlichkeit | Optionen (Zeit, Wirkung) |
|---|---|---|
| Tesla-Kollege (als Duo mit dem Kollegen, der nichts arbeitet, in 60 %) | 55 % pro Tag, 8:00–15:00 | Zuhören: 25 Min (Duo 35), Energie +2. Abwimmeln: 5 Min, Energie −2; in 25 % der Fälle sperrt das Duo die Kaffeeküche (Kaffee dauert den Tag 25 statt 10 Min). |
| italienischer Kollege | je Stunde 9–16 Uhr 30 %, max. 3 pro Tag | Zuhören: 12 Min, Energie +4, in 30 % „Rezept“: nächstes Mittagessen +10 Energie. Vertagen: 2 Min („Erzähl es mir beim Essen“). |
| IT-Chefin (Automatisierungspyramide) | Tag 1 sicher; gerade Tage 85 %, ungerade 25 % | Pyramiden-Frage mit drei Antworten (Kap. 7.2). Folie überspringen: 10 Min, in 35 % besteht sie darauf (+20 Min). |
| Kollege ohne Ahnung | 50 % pro Tag | Erklären: 20 Min, in 35 % lobt er dich bei der Werkleitung (+2). Abkürzen: 5 Min. |
| Kollege vom Altwerk | ab Tag 13, 50 % pro Tag | Mapping anlegen: 30 Min, Systemfusion Spezifikation +1 (sonst nur Lob). Später: 3 Min. |
| Glücksfälle (je 8 %) | Lieferant bietet Ersatzteile an (Reparatur −1 k€ für 3 Tage), der Azubi hilft (+1 Arbeitspaket), das Qualitätsaudit lobt (+3 Werkleitung) | einmal klicken |

### 7.2 Pyramiden-Fragen der IT-Chefin

Ebenen: 0 Feld, 1 Steuerung, 2 Leitebene, 3 MES, 4 ERP. Acht Fragen in `SC.PYRAMID_Q`, z. B. „Wo sitzt die SPS der Extrusion?“ (Steuerung), „Wo wohnt die Finanzbuchhaltung?“ (ERP), „Wo sitzt das MES?“ (Ebene 3), „Lichtschranke am Förderband?“ (Feld), „Bediener-Visualisierung?“ (Leitebene), „Auftragsfeinplanung?“ (MES). Richtig: 15 Min, **+1 Arbeitspaket** (Requirements oder Spezifikation des aktuellen Moduls). Falsch: 40 Min Vortrag, Energie −4. Das Gebäude selbst (Etagenschilder) verrät die Antworten – Lerneffekt als Gag.

### 7.3 Verpackungsautomat und Stationsstörungen

Tagesplanung: Innenverpackung 40 % (Verpackungsautomat), Außenverpackung 15 % (Verpackungsautomat), jede andere Station 4 %. Die Störung beginnt zwischen 9:00 und 15:00. Wirkung: Teststation gesperrt (Testlauf nicht möglich), Requirements dort +30 % Zeit, KPI-Abzüge. Behebung in der Werkstatt:

- **Reparatur**: 45 Min (30 mit Rückverfolgung), 3 k€, Energie −6. In 25 % tritt die Störung am Folgetag wieder auf („ständig Probleme“).
- **Notbehelf**: 15 Min, 0 k€, hält nur in 50 % der Fälle; Folgetag-Störung 60 %.
- **Präventive Wartung** (40 Min, 2 k€): Störungsrisiko dieser Station 3 Tage lang ×0,4.

### 7.4 Bestehende Ereignisse (bleiben)

Serverabsturz (22 %, mit Wartung 6 %), Papierstau (30 % beim Druck), 23:40-Anruf (22 %), Meeting-Einladungen des Schichtleiters bei Besuch, Bugs im Testlauf (34 % − 3 %·Spezifikationsstand).

## 8. KPIs, Zielwerte, Reporting

**Vier Kennzahlen** (Leitstand-Raum, Bilanz, Wochenrückblick):

| KPI | Start | Ziel (Tag 20) | Modulbeiträge (nur wenn abgenommen) | Abzüge |
|---|---|---|---|---|
| OEE (%) | 62 | 78 | BDE +7, Auftrag +3, Rückverfolgung +2, Qualität +2, ERP +1, Fusion +2 | Stillstand: −1,2 je Stunde |
| Ausschuss (%) | 5,5 | ≤ 3,0 | Qualität −1,5, Rückverfolgung −0,8, BDE −0,5, Fusion −0,2 | +0,15 je Stillstandsstunde, Chaos +1,5 |
| Durchsatz (Index) | 100 | 112 | BDE +5, Auftrag +4, Fusion +3, Qualität +2, ERP +1 | −2 je Stillstandsstunde |
| Liefertreue (%) | 86 | 94 | Auftrag +4, ERP +3, Rückverfolgung +1, BDE +1, Fusion +1 | −0,8 je Stillstandsstunde |

Jeden Abend läuft der Ist-Wert 35 % in Richtung „Modulziel minus Abzüge heute“ (Glättung, Rauschen ±0,5). **KPI-Index** = Mittel der vier Zielerreichungen (0–120 %, auf 100 gedeckelt für die Anzeige).

**Reporting:** Im Leitstand „KPI-Bericht erstellen“ (30 Min, mit BDE 15 Min, einmal pro Tag): Werkleitung +2, weitere +2 wenn der KPI-Index über dem Wochenpfad (Tag/20) liegt. **Freitag (Wochenrückblick):** Ohne Bericht der Woche −4 Werkleitung; mit Bericht ±5 je nach Abstand zum Pfad. Excel-Liste bleibt daneben (Werkleitung −6 am Abend, wenn nicht gepflegt).

**Budget als Dauerbrenner** (Controlling, ERP-Etage; Anzeige im HUD):

- Start 90 k€. **Quartalsfreigabe** („Tranche“) einmal je Woche beantragen: +30 k€ (Werkleitung ≥ 40) sonst +15 k€; 30 Min.
- **Vorschuss**: +25 k€ sofort, −30 k€ automatisch fünf Tage später; nur einer gleichzeitig. *(Seit v0.3.0 ersetzt durch einen Kredit mit Rahmen, Zins und Tilgung, siehe docs/RELEASE-v0.3.md.)*
- **Externe Berater**: 15 k€, 30 Min, +3 Arbeitspakete (25 %: nur +1, „Folien statt Ergebnis“).
- Ausgaben: Testlauf 2, Reparatur 3, Wartung Server/Station 2, Druck-Toner 1, Wochenendschicht 8/Tag, SAP-Lizenz 10 (Tag 6), Systemfusion 12 (Tag 13).
- Budget < 0: Budgetsperre (Werkleitung −2 pro Abend, keine Berater, Testläufe +30 % Zeit „wegen Freigabe“). < −40: Niederlage.

## 9. Großereignisse

### 9.1 Neues SAP-System mit Systemmigration (Tag 6, Montag)

- Ankündigung 8:00 per Dialog, Pflicht-Kick-off der Werkleitung um 10:00 (60 Min). Lizenz −10 k€.
- ERP-Schnittstelle muss angepasst werden: Implementierung −2 (min. 1), Deployment verloren; war das Modul schon abgenommen: Abnahme zurückgenommen, ein Testlauf wiederholen.
- **Stammdatenmigration**: neue Büro-Aktion (60 Min, Energie 9, 1 von 4 Paketen). Während der Migration: Serverabsturzrisiko +8 %-Punkte; ERP-Abnahme gesperrt.
- **Cutover Freitag Tag 10**: Sind 4/4 Pakete fertig: Erfolg (Werkleitung +6). Sonst Entscheidung am Wochenende: Wochenendschicht (mind. 1 Tag) schließt die Migration ab, **kein Chaos**; Wochenende frei = „Chaos“ drei Tage lang (Halle-Aktionen +25 % Zeit, OEE −4, Ausschuss +1,5, Werkleitung −5).

### 9.2 Firmenübernahme mit Systemfusion (Tag 13, Mittwoch)

- 8:30 Dialog der Werkleitung: „Wir haben die Konkurrenz gekauft.“ Neues sechstes Modul **Systemfusion Altwerk** (Bedarf 2/2/3/2, Teststation Extrusion). −12 k€.
- **Go-Live-Termin verschiebt sich von Tag 20 auf Tag 22** (Tage 21 und 22 sind Montag/Dienstag).
- Neue Figur: Kollege vom Altwerk (Kap. 7.1). Gag: Zwei Werksschilder am Turm („WERK MITTE“ + schief angeschraubtes zweites Schild).
- Win-Bedingung: alle sechs Module abgenommen.

## 10. Balance-Grundsatz: Meetingbesuch ist kein Siegrezept

Der Schichtleiter bleibt ein Dauerbrenner, aber „alle Meetings besuchen“ darf **nicht** die stärkste Strategie sein. Maßnahmen (Zahlen in PHASEN.md):

1. Abnehmender Ertrag: Schichtleiter-Laune pro nutzlosem Meeting am Tag +8, +6, +4, +2, dann 0.
2. Nutzen der Laune gedeckelt bei 80 (Testlauf-Zeit −20 % statt −33 %, doppelte Requirements nur 35 %).
3. Wirkliche Kosten: Meetingdauer + Laufzeit, Energie `dur/10 + 1` (+1 je weiterem Meeting am selben Tag).
4. **Meeting-Spirale**: Wer ≥ 2 nutzlose Meetings am Tag besucht, wird morgen mit +35 % Wahrscheinlichkeit zusätzlich eingeladen; bei Laune > 85 eine weitere Einladung (50 %).
5. **Besprechungsquote**: Mehr als 90 Min nutzlose Meetings an einem Tag: Werkleitung −2 je angefangene 30 Min darüber.
6. **Bessere Alternative**: „Schichtplan abstimmen“ (30 Min, einmal täglich) liefert die Testlauf-Beschleunigung (−33 % Zeit) ohne Meetings – das ist der Weg der „guten“ Strategie.
7. Neue Zeitfresser (Besucher, Störungen) machen jede verlorene Stunde teurer.

Ziel: meetingfan ≥ 15 Prozentpunkte hinter der besten Strategie (Details in PHASEN.md).

## 11. Ton und Humorregeln

- Freundlich-satirisch, nie bösartig. Gelacht wird über **Situationen** (Meeting über das Meeting, 90 Folien, Papierstau), nicht über Personengruppen.
- Der italienische Kollege ist warm, fachlich kompetent und großzügig; sein Thema ist Essen/Familie/Heimat. Keine Akzent-Schreibweise, keine Mafia-/Pizza-Witze, keine Faulheitsklischees. Er lenkt ab, weil er gern erzählt.
- Der Kollege, der nichts arbeitet, und der Tesla-Kollege sind Running Gags, keine Beleidigung. Tesla-Quatsch bleibt absurd, nicht politisch (Reichweite im Winter, Hupe mit Furzgeräusch, „Autopilot im Flur“). Kein Bezug auf reale Personen.
- Die IT-Chefin ist klug und im Recht – sie nervt nur durch Wiederholung. Pyramiden-Satz wird jedes Mal anders eröffnet („Und jetzt kurz zur Pyramide“, „Wo waren wir? Genau: Ebene drei“).
- Kein Drama: Niederlagen sind absurd-freundlich („du wirst Imker“). Die Familie ist ein Wert, kein Schuldgefühl.
- Alle Firmen, Werke und Produkte erfunden; Marken nur als harmlose Anspielung („ein Elektroauto“ statt Tesla im Fließtext der Figurenbeschreibung ist erlaubt, im Spieltext darf „Tesla“ als Gesprächsthema stehen).

## 12. Namensregel (Umsetzung)

Verboten (Spieltext, Code-Bezeichner, Kommentare, Dateien außer `docs/`): ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, Auftraggeber, ‹alter Name›, ‹alter Name›.
Ersatz:

| alt | neu |
|---|---|
| Spieler „Auftraggeber“ (`SC.PLAYER`) | `Christian` (Name im Titelbild fest, Eingabefeld entfällt) |
| Schichtleiter ‹alter Name› (`‹alter Name›`, Kind `'‹alter Name›'`) | der Schichtleiter (`schicht`, Kind `'schicht'`) |
| Dr. ‹alter Name› ‹alter Name›, „Chefin“ | die Werkleitung (`chef` bleibt als interner Raum-/Wertname, Anzeige „Werkleitung“) |
| Pförtner ‹alter Name› | der Pförtner |
| Frau ‹alter Name› | die Kantinenkraft |
| ‹alter Name› / ‹alter Name› | **Werk Nord / Werk Süd** (Rivalen heißen nur noch so) |
| „‹alter Name›-‹alter Name› 2“ | der Drucker |

Absicherung: Test `test/names.test.js` durchsucht `js/ index.html README.md tools/ test/` nach der Verbotsliste (Ausnahme: die Testdatei selbst, die die Liste nur als Regex-Quelle aus `docs/` liest oder verschlüsselt führt, siehe PHASEN.md).

## 13. Fabrik-Atmosphäre (Grafik und Ton)

**Grafik** (`js/building.js`, Pixel-Look beibehalten):
- Sheddach (Sägezahndach mit Oberlichtern) auf dem Turm und den Hallenflügeln, Schornstein mit aufsteigendem Rauch.
- Zwei Hallenflügel (links: DEA, DEC, EEA; rechts: Extrusion, Innenverpackung, Außenverpackung, Sterilisation) mit Maschinenblöcken, Beschriftung und **Statuslampe** (grün/gelb blinkend/rot bei Störung). Förderband mit laufenden Kisten zwischen den Flügeln und der Halle-Tür.
- Etagenschilder mit den Pyramidenebenen (FELD, STEUERUNG, LEITEBENE, MES, ERP).
- Schichtwechsel 14:00: Warnleuchte auf dem Dach blinkt 20 Spielminuten.
- Figuren-Varianten: Schichtleiter (Warnweste, Helm), IT-Chefin (violett, Pyramiden-Abzeichen), italienischer Kollege (dezent grün-weiß-rotes Hemdband), Tesla-Kollege (rotes „T“ auf der Brust), Kollege ohne Arbeit (lehnt an der Wand).

**Ton** (`js/audio.js`, rein prozedural): leises Fabrik-Grundrauschen (tiefes Brummen + gedämpfter Rauschteppich), rhythmisches Pressen/Stampfen, lauter in der Halle, leiser im Büro; Schichtwechsel-Sirene (14:00); kurzer Dialog-Gong bei Besuchen; Alarm bei Störung.

## 14. Sender-Chef/Mad TV: was übernommen wird

Bereits in v0.1.1: Querschnitt-Gebäude mit Aufzug, Raumtüren, Echtzeit mit Tempo/Pause, Ticker, Rivalen, Tagesbilanz, Wochenende, Himmel-Verlauf, Amiga-Look, Prozedural-Musik.

Aus Mad TV neu übernommen (laut Mad-TV-Kenntnis, siehe Hinweis oben):

| Mad-TV-Element | Umsetzung in MES-Marathon | Version |
|---|---|---|
| Zufalls-Besucher mit Entscheidung | Besucher-Dialoge (Kap. 7) | 0.2.0 |
| Quote | KPIs und Werkleitung-Reporting (Kap. 8) | 0.2.0 |
| Bank/Kredit, Kontostand | Controlling: Vorschuss, Tranche, Budget (Kap. 8) | 0.2.0 |
| Konkurrenzsender | Werk Nord/Süd bleiben | 0.1.1 |
| Programm-/Werbeverträge | Kundenaufträge mit Liefertermin (Liefertreue-Aufträge) | Ausblick 0.3 |
| Filmeinkauf/Auktion | Ersatzteil-/Berater-Einkauf (Berater in 0.2.0, Auktion 0.3) | teils |
| Highscore-Liste | lokale Top 5 | Ausblick 0.3 |
| Sendeausfälle/Pannen | Stationsstörungen, Serverabsturz | 0.2.0 |
| Stimmung der Zuschauer | Schichtleiter-Laune; Betriebsklima als eigener Wert | Ausblick 0.3 |

## 15. Abgleich: Auftrag → Umsetzung

Status: ✔ = in v0.1.1 vorhanden, ✘ = fehlt/falsch, ➜ = in v0.2.0 geplant (Kapitel/Phase).

| Nr. | Auftrag (Auftraggeber) | v0.1.1 | v0.2.0 |
|---|---|---|---|
| 1 | Hauptfigur Christian, Spielname MES-Marathon | Titel ✔, Figur heißt „Auftraggeber“ ✘ | ➜ Christian, Eingabefeld entfällt (Kap. 3, 12; Phase 1) |
| 2 | Nur Christian hat Namen, alle anderen nur Rollen, auch in Code/HUD | ✘ (‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›, ‹alter Name›-‹alter Name›) | ➜ Rollen, Werk Nord/Süd, Namenstest (Kap. 12; Phase 1) |
| 3 | Fabrik, Automatisierungspyramide als Levels | ✘ (Verwaltungsgebäude) | ➜ Etagen = Pyramide (Kap. 4; Phase 2, 8) |
| 4 | Fabrik erkennbar: Hallen, Straßen, Schichtbetrieb, Lärm, Kantine, Sheddach, Schornstein, Förderbänder, Maschinen, Sirene | Kantine ✔, Schichtleiter ✔, sonst ✘ | ➜ Kap. 13; Phasen 8, 9; Sirene 14:00 (Phase 3) |
| 5 | Produktionsbereiche DEA, DEC, EEA, Extrusion, Innenverpackung, Außenverpackung, Sterilisation | ✘ (nur „Linie 3“) | ➜ 7 Stationen (Kap. 4; Phase 2, 3) |
| 6 | Kollegen ohne Ahnung | ✘ | ➜ Besucher (Kap. 7.1; Phase 4) |
| 7 | Tesla-Kollege (Quatsch über Tesla) | ✘ | ➜ Besucher (Kap. 7.1) |
| 8 | Kollege, der nichts arbeitet, redet nur mit Tesla-Kollege | ✘ | ➜ Duo-Variante (Kap. 7.1) |
| 9 | Italienischer Kollege stündlich mit Geschichten und Essen | ✘ | ➜ Besucher stündlich, max. 3/Tag (Kap. 7.1, 11) |
| 10 | IT-Chefin kommt IMMER mit Pyramide, taucht immer wieder auf | ✘ | ➜ Besucher + Quiz + IT-Büro (Kap. 7.1, 7.2) |
| 11 | Verpackungsautomat macht ständig Probleme | ✘ (nur Server, Drucker) | ➜ Stationsstörungen, Wiederholungsstörung (Kap. 7.3) |
| 12 | Schichtleiter mit unnötigen Meetings bleibt | ✔ (Name falsch) | ➜ bleibt, Rolle (Kap. 3, 10) |
| 13 | Excel-Liste, Drucker, Serverraum dürfen bleiben | ✔ | ✔ bleibt (Kap. 6) |
| 14 | Spezifikationen, Requirements, Testläufe, Wochenendschichten, Implementationen, Meetings | ✔ | ✔ bleibt, ergänzt (Kap. 6) |
| 15 | Großereignis: neues SAP mit Systemmigration | ✘ | ➜ Tag 6–10 (Kap. 9.1; Phase 6) |
| 16 | Großereignis: Firmenübernahme mit Systemfusion | ✘ | ➜ Tag 13 (Kap. 9.2; Phase 6) |
| 17 | KPIs (OEE, Ausschuss, Durchsatz, Liefertreue), Zielwerte, Reporting | ✘ | ➜ Kap. 8; Phase 5 |
| 18 | Budget als Dauerbrenner | ✘ | ➜ Kap. 8; Phase 3, 5 |
| 19 | Weitere Mad-TV-Elemente, wenn sie die Dynamik bereichern | teils | ➜ Kap. 14 |
| 20 | Ton: Comedy, freundlich-satirisch, auch beim Italiener liebevoll | ✔ im Ansatz | ➜ Kap. 11 (Textprüfung in Phase 10) |
| 21 | Icon Christian: ca. 40, viel graue Haare, kein Bart, Hemd | graue Haare ✔ (Sprite klein), Portrait prüfen | ➜ Phase 8 (Sprite, `tools/portrait.py`) |
| 22 | Balance: meetingfan nicht stärkste Strategie; Bot-Messung wie bisher | ✘ (meetingfan ≈ 70 %, „gut“ 56 %) | ➜ Kap. 10; Phase 3, 10; Ziele in PHASEN.md |

## 16. Annahmen und offene Punkte

- „Level“ wurden als Pyramidenebenen in den Etagen gelöst (kein zweites Spielfeld).
- „Produktionsstraßen“ erscheinen als Förderband + Hallenflügel, nicht als begehbare Räume (nur Raum `halle` mit Stationstafel).
- Deadline-Verschiebung auf Tag 22 bei der Übernahme ist eine Designentscheidung (Fusionsmodul braucht Zeit). Falls Auftraggeber lieber hart bei Tag 20 bleibt, müssen die Bedarfe des Fusionsmoduls und das Budget im Bot neu eingestellt werden.
- Zahlenwerte sind **Startwerte**; maßgeblich sind die Bot-Ziele in `docs/PHASEN.md`. Die Ausgangsmessung von v0.1.1 konnte in dieser Planungssitzung nicht neu ausgeführt werden (Bot-Lauf nicht freigegeben); es gelten die vom Besitzer genannten Werte (meetingfan ≈ 70 %, „gut“ 56 %).

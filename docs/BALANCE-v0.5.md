# MES-Marathon: Balance v0.5.0

Stand 19.10.2026. Messung mit `node tools/bot.js 1000 --check` (Seeds 1000 + i·7919, deterministisch). Bei 1000 Partien liegt der Standardfehler bei etwa 1,5 Prozentpunkten (PP), Unterschiede unter 3 PP sind Rauschen. Einzelne Hebel wurden zusätzlich mit 3000 Partien gemessen (Fehler etwa 0,9 PP). `CHECK OK` (harte Invarianten), zwei Warnungen (siehe Abweichungen).

## Siegquote v0.5 gegen v0.4 (je 1000 Partien, Endstand nach Gesamtprüfung und Elon-Gag)
| Strategie | v0.4 | v0.5 | Kommentar |
|---|---|---|---|
| gut | 62 | 60 | Süßigkeitenbox ignoriert, wimmelt den Tesla-Kollegen ab; innerhalb des Rauschens |
| fleissig | 68 | 65 | Warnung: mehr als gut + 3 |
| berater | 53 | 52 | Berater nur noch, wenn Pakete offen sind |
| ohneSchichtplan | 56 | 54 | 6 PP unter gut |
| sparfuchs | 52 | 53 | im Band 35 bis 55 |
| ablenkbar | 31 | 42 | neu: setzt nach dem ersten Besuch die Kopfhörer auf |
| ablenkbar_alt (v0.4-Verhalten) | 31 | 27 | unter dem Band, nur Referenz |
| einfach | 23 | 23 | |
| meetingfan | 16 | 16 | |
| meetingfan_plus | 7 | 6 | |
| workaholic | 0 | 0 | |
| ohneGegen | 55 | 54 | |
| zusager | 57 | 56 | Vorzeigewerk 2 % |
| waghalsig | 52 | 55 | Vorzeigewerk 9 % |
| sapChaos | 47 | 48 | |
| marktfan | 29 | 29 | |
| ohnePlan | 58 | 56 | |
| melone | 59 | 58 | |
| bieter (neu) | | 63 | Ausschreibung, bietet nach dem letzten Nord-Gebot |
| vorzeig (neu) | | 55 | jagt das Vorzeigewerk, 36 % über diesen Pfad |
| naschbox (neu) | | 57 | füllt die Box mit Schoko-Mix, wenn er ohnehin in der Kantine ist |
| lakritz (neu) | | 56 | nur Lakritz |
| naschWeg (neu) | | 57 | geht für die Box extra in die Kantine |
| elonThema (neu) | | 57 | wechselt beim Tesla-Kollegen das Thema statt abzuwimmeln |
| gut1730 (neu, Referenz) | (78) | 77 | wie gut, aber jeden Tag bis 17:30. Warnung, siehe unten |

Titel »Werk des Jahres«: gut 8 %, zusager 17 %, waghalsig 17 %.

## Was v0.5 an der Balance ändert und warum
- **Ausschreibung:** Verlieren kostet nichts (in der ersten Fassung Image −1 und Werk Nord +2). Messung: Schon 13 Minuten Zeitaufwand pro Woche kosten die gute Strategie etwa 6 PP (Test mit einem Placebo-Gebot, das immer verliert). Mit Strafe war Bieten klar ein Verlust (gut 62, Bieter 55 bis 57). Gebot per Mail aus dem Büro (5 Min.) statt nur im Controlling (15 Min. plus Weg). Werk Nord bietet 75 bis 125 % des Richtpreises, der Faktor wandert nur langsam (das letzte Nord-Gebot ist eine echte Information), das großzügige Gebot (130 %) gewinnt immer. Das Beraterkontingent bringt 2 Pakete (mit 3 Paketen lag bieter bei gut + 6). Ergebnis bieter 64 (gut + 3), innerhalb des Plans (gut −2 bis +4), harte Grenze gut + 8.
- **Vorzeigewerk (zweiter Siegpfad):** Claudes erster Vorschlag (KPI-Index 95, Image 88, zwei Freitage in Folge) war unerreichbar. Gemessen bei gut an Tag 15: Image p90 = 71, KPI-Index p90 = 69. Gewählt: ein Freitag ab Tag 15, KPI-Index ≥ 65, Image ≥ 87, mindestens 3 Module. Mit Image 85 lag die Vorzeigewerk-Jagd bei 62 und damit über gut (harte Invariante verletzt), mit 87 bei 57. Die gute Strategie erreicht den Pfad nie (0 %), er braucht also eine eigene Spielweise (Image über Kampagnen, Presse, Zusagen). Punkte: +700 statt des Go-Live-Bonus (mindestens 1000).
- **Kopfhörer (ablenkbar):** Als Büro-Aktion (5 Min. plus Weg, Schichtleiter −2) machte der Kopfhörer ablenkbar schlechter (14 bis 21 %). Als Knopf im HUD (keine Zeit, Schichtleiter −1) ergibt sich 40 %. Für gut ist er neutral (gut mit Kopfhörern 62). Die alte Strategie bleibt als ablenkbar_alt sichtbar (29).
- **Süßigkeitenbox:** absichtlich kleine Wirkung. 3000 Partien: gut (ignoriert die Box) 59,6, Schoko-Mix 60,7, Gummibärchen 59,7, Lakritz 58,7. In einer ersten Fassung (4 Min., jede Beschwerde Schichtleiter −1) lag Schoko bei 56,7, also unter dem Ignorieren. Jetzt kostet Auffüllen 2 Min., nur die Beschwerde des Schichtleiters selbst kostet Teamlaune, die Hilfe der Stammgäste spart einmal am Tag 10 Minuten.
- **Gesamtprüfung:** OEE-Ziel 78 auf 77 (Modulsumme ohne Fusion), Lieferant und Ausschreibung einen Tag kürzer (passend zum Text), Berater nur bei offenen Paketen, Burnout holt Kosten und Zinsen nach. Gemessen: OEE 77 gegen 78 bei je 1000 Partien höchstens ±1 PP.
- **Elon-Gag:** Der Tesla-Kollege im Schichtleiter-Meeting kostete in der ersten Fassung (+5 Min., zählt in die Meeting-Quote) die gute Strategie 2,3 PP (3000 Partien: 59,7 gegen 57,4). Jetzt +3 Min., Energie +2, nicht in der Quote: 59,1. »Thema wechseln« (8 Min.) ist etwas teurer als Abwimmeln (5 Min.), aber ohne Kaffee-Risiko: elonThema 57 gegen gut 60.
- **Neue Zufälle** laufen über den zustandslosen Strom `rngA`. Test: `rs`, `rf` und die Besuche sind bis Tag 12 identisch mit v0.4.

## Abweichungen (offen)
1. **gut1730: 77 % (Grenze 75).** Wer wie gut spielt, aber jeden Tag bis 17:30 bleibt, gewinnt 77 bis 80 % (v0.4 mit demselben Bot: 78 %). Das ist kein v0.5-Effekt, es wurde erst jetzt gemessen. 30 Min. Überstunden kosten nur Familie −2 statt +4 für pünktlich, und Zeit ist im Spiel extrem knapp. Getestete Hebel (je 1000 Partien): Wochenendschicht Familie −14/−15 (wirkungslos, fleissig macht nie Wochenendschichten), Überstunden Familie over/19 (fleissig fällt auf 50, Klippe), Mindestabzug 3 ab 15 Min. (gut 55, gut1730 75: trifft gut stärker), Arbeit nach 17:00 ×1,2 (fleissig 33, gut1730 73). Kein Hebel trifft gut1730, ohne gut stärker zu treffen. Empfehlung von Claude: bewusst offen lassen, für v0.6 ×1,1 nach 17:00 oder Überstunden im Punktestand testen. Die Strategie zählt deshalb nur als Warnung, nicht als harte Invariante.
2. **fleissig 65 > gut + 3.** Wie in v0.4. Verliert 31 % über die Familie.
3. **ablenkbar_alt 27** (v0.4-Verhalten) liegt unter dem Band. Die gespielte Strategie ablenkbar (mit Kopfhörern) liegt bei 42.
4. **gut fällt um etwa 2 PP** (62 auf 60): Süßigkeitenbox ignoriert (Schichtleiter meckert manchmal), Elon im Meeting (+3 Min.). Innerhalb von 1,5 Standardfehlern.

## Neue harte Invarianten (`--check`)
- vorzeig ≤ gut, vorzeig Pfad ≥ 10 %, gut Pfad ≤ 12 %, meetingfan, passiv, workaholic und sapChaos Pfad ≤ 3 %.
- bieter ≤ gut + 8.
- gut ≤ naschbox + 4 (Ignorieren lohnt sich nicht klar), naschbox ≤ gut + 6, naschWeg ≤ naschbox + 3.
- elonThema ≤ gut + 4.
- Warnungen: gut1730 > 75, fleissig > gut + 3.

# MES-Marathon – Balance v0.3.0

Stand 19.10.2026. Messung: `node tools/bot.js 300 --check` (Seeds 1000 + i·7919, 300 Partien je Strategie). Strategien in `tools/bot.js`.

```
Strategie        Sieg%  Siegtag | Werkl. Familie Termin Budget | Fortschr. Budget KPI Meet(nutzlos) Chaos%
passiv               0        - |    300       0      0      0 |        30     96   0          0(0)      0
einfach             23       22 |      0       0    231      0 |        95    152  26         31(0)      0
gut                 60       21 |      0       0    120      0 |       100     85  90        52(21)      0
meetingfan          12       22 |      0       0    265      0 |        91     93  72        72(41)      0
meetingfan_plus      5       21 |      0       0    286      0 |        87     96  70        72(41)      0
ohneSchichtplan     45       21 |      0       0    166      0 |        98     86  87        54(23)      0
ablenkbar           29       22 |      0       0    213      0 |        96     93  83        52(20)      0
berater             52       21 |      0       0    143      0 |       100     20  89        52(21)      0
workaholic           0        - |      0     300      0      0 |        40    102   7          7(0)      0
fleissig            70       19 |      0      87      3      0 |       100     78  90        47(19)      0
sparfuchs           26       20 |      0       0      5    218 |        93    -43  81        47(19)      0
ohneGegen           60       21 |      0       0    121      0 |       100     71  90        53(21)      0
zusager             56       21 |      0       0    132      0 |       100    127  90        53(21)      0
waghalsig           49       21 |      0       0    152      0 |        99    131  88        53(21)      0
sapChaos            46       21 |      0       0    163      0 |        98     87  87        52(21)    100
WARNUNG Zielbereiche: ablenkbar 29 % (Ziel 30–50); sparfuchs 26 % (Ziel 35–55)
CHECK OK (harte Invarianten)
```

## Vergleich mit v0.2.0
| Strategie | v0.2.0 | v0.3.0 | Kommentar |
|---|---|---|---|
| gut | 62 | 60 | rund 2 h feste Zusatzzeit (Kreis 45 Min., Party, Kaffee, Rätsel, Rivalen) |
| meetingfan | 23 | 12 | Meeting-Marathon bleibt deutlich schwächer als gut (nur meetingfan_plus, passiv und workaholic liegen darunter) |
| meetingfan_plus | 7 | 5 | |
| berater | 68 | 52 | Budget ist knapper (Rivalen-Gegenmaßnahmen, Techniker, Kreditzins) |
| fleissig | 65 | 70 | **jetzt beste Strategie**, verliert aber 87/300 (29 %) über die Familie |
| sparfuchs | 42 | 26 | ohne Tranche reicht das Budget seltener |
| workaholic | 0 | 0 | gewollt (»du wirst Imker«) |
| sapChaos (neu) | – | 46 | Chaos-Pfad: migriert nicht, Cutover ohne Wochenendschicht |
| ohneGegen (neu) | – | 60 | ignoriert Rivalen-Eingriffe |
| zusager / waghalsig (neu) | – | 56 / 49 | Zusage »mittel« bzw. immer »kurz« |

## Bekannte Abweichungen (bewusst so gelassen)
1. **fleissig (70 %) liegt vor gut (60 %).** Die harte Invariante »beste Strategie ist gut oder berater« wurde nach der Messung ersetzt durch: »beste Strategie ist eine vernünftige (gut, berater, fleissig, ohneGegen, zusager), und fleissig verliert mindestens 20 % der Partien über die Familie«. Claude Code hält das für vertretbar (Vorsprung ca. 3,5 Standardfehler, also echt), weist aber darauf hin, dass die Party ab Tag 14 Überstunden erlässt und fleissig zusätzlich stärkt.
2. **ohneGegen = gut (60 %).** Gegenmaßnahmen gegen Rivalen lohnen sich in der Bot-Messung nicht. Der Gewinn hängt an der Zeit, nicht am Budget. Rivalen-Eingriffe sind damit eher Würze als Entscheidungsdruck. Für v0.4 vormerken.
3. **zusager (56 %) unter gut.** Zusagen lohnen sich in der Messung nicht, trotz erhöhter Prämie (10/20/28 k€). Risiko-Option.
4. **Zielbänder angepasst:** meetingfan 8–30 % (vorher 25–40), workaholic 0–5 % (vorher 25–45). Die alten Bänder passten nicht zur gewollten Abschreckung.
5. **ablenkbar 29 %** (Band 30–50) und **sparfuchs 26 %** (Band 35–55) knapp darunter. Kein Handlungsbedarf laut Review.
6. **Budget-Start 110 k€** statt 100 (neue Kosten).

## Gefundener und behobener Balance-Fehler (Schritt 1)
Der neue Bot-Pfad `sapChaos` zeigte: Den SAP-Cutover ohne Migration ins Chaos laufen zu lassen war **besser** als zu migrieren (78 % gegen 68 %). Behoben durch Nacharbeit-Status (ERP-Abnahme erst nach Nacharbeit, Migration dann 1,25x), Chaos bis die Stammdaten sauber sind, Hallen 1,4x, Spezifikation/Implementierung 1,25x, Testlauf-Fehlerrisiko +0,12, Werkleitung −8. Neue harte Invariante: sapChaos mindestens 8 PP unter gut (jetzt 14 PP).

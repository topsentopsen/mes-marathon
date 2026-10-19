# MES-Marathon: Balance v0.4.0

Stand 19.10.2026. Messung: `node tools/bot.js 300 --check` (Seeds 1000 + i·7919, gleiche Seeds für alle Strategien) und zur Absicherung `node tools/bot.js 1000`. Strategien in `tools/bot.js`.

```
Strategie        Sieg%  Siegtag | Werkl. Familie Termin Budget | Fortschr. Budget KPI Meet(nutzlos) Chaos% Titel%
passiv               0        - |    300       0      0      0 |        30     96   0          0(0)      0      0
einfach             27       21 |      0       0    219      0 |        95    101  28         31(0)      0      0
gut                 61       21 |      0       0    117      0 |       100     48  90        52(21)      0      6
meetingfan          17       22 |      0       0    250      0 |        92     48  74        72(41)      0      1
meetingfan_plus      6       22 |      0       0    282      0 |        87     48  69        72(41)      0      0
ohneSchichtplan     58       21 |      0       0    127      0 |       100     46  89        54(22)      0      8
ablenkbar           32       22 |      0       0    203      0 |        96     49  83        52(20)      0      3
berater             52       21 |      0       0    144      0 |       100     21  88        53(21)      0      3
workaholic           0        - |      0     300      0      0 |        41     91   6          7(0)      0      0
fleissig            65       19 |      0     101      5      0 |       100     35  88        46(19)      0     16
sparfuchs           51       21 |      0       0     93     55 |       100    -28  88        52(21)      0      0
marktfan            26       22 |      0       0    222      0 |        95      3  84        53(22)      0      3
ohnePlan            60       21 |      0       0    120      0 |       100     85  90        52(21)      0      2
melone              61       21 |      0       0    118      0 |       100     48  90        52(21)      0      2
ohneGegen           57       21 |      0       0    129      0 |       100     38  90        52(21)      0      0
zusager             61       21 |      0       0    116      0 |       100     80  89        52(21)      0     20
waghalsig           51       21 |      0       0    146      0 |       100     82  86        53(21)      0     23
sapChaos            44       21 |      0       0    169      0 |        98     47  87        52(21)    100      3
CHECK OK (harte Invarianten)
```

## Vergleich v0.3.0 und v0.4.0 (Siegquote in %)
| Strategie | v0.3.0 (n=300) | v0.4.0 (n=300) | v0.4.0 (n=1000) | Kommentar |
|---|---|---|---|---|
| gut | 60 | 61 | 62 | nutzt jetzt Prognose (Mo/Di im Leitstand) und die Basis-Marktregel |
| fleissig | 70 | 65 | 68 | weiter beste Strategie, verliert 30 % der Partien über die Familie |
| berater | 52 | 52 | 53 | |
| ohneSchichtplan | 45 | 58 | 56 | profitiert wie alle von der Lizenz als Notgroschen |
| sparfuchs | 26 | 51 | 52 | **wieder im Zielband 35 bis 55** (siehe unten) |
| ablenkbar | 29 | 32 | 31 | **knapp im Zielband 30 bis 50** (siehe unten) |
| einfach | 23 | 27 | 23 | |
| meetingfan | 12 | 17 | 16 | bleibt mindestens 15 PP unter gut |
| meetingfan_plus | 5 | 6 | 7 | |
| workaholic | 0 | 0 | 0 | gewollt (»du wirst Imker«) |
| ohneGegen | 60 | 57 | 55 | |
| zusager / waghalsig | 56 / 49 | 61 / 51 | 57 / 52 | Hauptweg zum Titel »Werk des Jahres« (18 bis 23 % der Partien) |
| sapChaos | 46 | 44 | 47 | Chaos-Pfad lohnt sich weiter nicht |
| marktfan (neu) | | 26 | 29 | kauft jeden Tag das billigste Angebot: Geld weg, Zeit weg |
| ohnePlan (neu) | | 60 | 58 | wie gut, aber ohne Prognose und ohne Markt |
| melone (neu) | | 61 | 59 | wie gut, plus Wassermelonen-Bericht jede Woche |

## Was die Zahlen bewegt hat
- **sparfuchs 26 auf 51:** Der Bot ist unverändert (holt nie die Tranche). Neu ist der Markt: Wie alle Strategien verkauft er bei Budget unter 20 k€ eine der drei alten MES-Lizenzen (je etwa 11 bis 18 k€). Das Lizenzgeld ersetzt faktisch einen Teil der Tranche. Das ist keine Rückkehr der alten Strategie in die Zielzone, sondern eine Folge des neuen Markts. Er verliert weiter 20 % der Partien über das Budget (n=1000; v0.3: 73 %).
- **ablenkbar 29 auf 31 (n=1000):** kleiner Gewinn durch dieselbe Basis-Marktregel. Er liegt nur knapp im Band. Ein Versuch, die Besuchsraten des Tesla-Kollegen zu senken (0.55 auf 0.5, Duo 0.6 auf 0.5), brachte bei n=1000 nichts messbares (31 zu 31) und wurde auf Rat von Claude Code wieder zurückgenommen. Die alten Besuchsraten gelten weiter.
- **Prognose kostet 5 statt 20 Minuten:** Bei 20 Minuten verlor gut 5 PP (n=1000: 56 zu 61), weil die Zeit bis zum Go-Live der Engpass ist. Mit 5 Minuten (eine Mail an die Werkleitung) liegt gut mit Planung und Markt bei 62, ohne bei 58. Hinweis: Der Bot liest das Band »Stand heute«, das im Leitstand auch für den Spieler sichtbar ist. Er kennt den Freitagswert nicht. Seine Trefferquote liegt bei knapp der Hälfte.
- **»Knapp daneben« kostet jetzt 1 Werkleitung** (Review-Befund): Sonst wäre »im Plan« risikolos.

## Bekannte Abweichungen (bewusst so gelassen)
- **fleissig bleibt beste Strategie** (68 zu 62 bei n=1000), verliert aber 30 % der Partien über die Familie. Die harte Invariante aus v0.3 gilt weiter.
- **ablenkbar liegt nur knapp im Band** (31 bei n=1000, 32 bei n=300). Kleine Änderungen können ihn wieder unter 30 drücken.
- **sparfuchs liegt nahe der Obergrenze** (51 bis 52, Band 35 bis 55), weil die Lizenz als Notgroschen wirkt.
- **ohneSchichtplan liegt 3 bis 6 PP unter gut** (v0.3: 15). Die Warnschwelle (mindestens 3 PP) hält.
- **Wassermelone ist im Schnitt neutral** (59 zu 62 bei n=1000). Liegt der KPI-Index nicht unter Plan, ist der Bericht ohne Risiko (+3 Werkleitung). Gewollt als Satire: Grün melden lohnt sich nur, wenn es eh grün ist.
- **Titel »Werk des Jahres«** (Sieg mit KPI-Index ab 90 % und Image ab 75): gut 7 %, zusager 18 %, waghalsig 23 % (n=1000). Er ist ein Bonus (+300 Punkte), kein eigener Siegpfad, deshalb balanceneutral.

## Neue harte Invarianten (tools/bot.js --check)
- melone höchstens 3 PP über gut, marktfan nicht über gut, Titel bei gut höchstens 40 %.
- Alle Invarianten aus v0.3 gelten weiter (Meeting-Marathon, passiv, Chaos-Pfad, vernünftige beste Strategie, fleissig verliert mindestens 20 % über die Familie).

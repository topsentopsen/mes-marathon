# MES-Marathon – Balance v0.2.0

Stand 19.10.2026. Messung: `node tools/bot.js 300 --check` (Seeds 1000 + i·7919, 300 Partien je Strategie). Strategien in `tools/bot.js`, Ziele in `docs/PHASEN.md` 10.2.

```
Strategie        Sieg%  Siegtag | Werkl. Familie Termin Budget | Fortschr. Budget KPI Meet(nutzlos) Chaos%
passiv               0        - |    300       0      0      0 |        30     86   0          0(0)      0
einfach             20       21 |      0       0    239      0 |        93    163  26         31(0)      0
gut                 62       21 |      0       0    113      0 |       100     95  90        52(21)      0
meetingfan          23       22 |      0       0    231      0 |        93    104  78        72(41)      0
meetingfan_plus      7       22 |      0       0    280      0 |        89    105  70        72(41)      0
ohneSchichtplan     59       21 |      0       0    122      0 |       100     96  90        54(23)      0
ablenkbar           34       22 |      0       0    197      0 |        96    103  85        52(20)      0
berater             68       20 |      0       0     95      0 |       100     15  91        51(20)      0
workaholic           0        - |      0     300      0      0 |        43     94   7          7(0)      0
fleissig            65       19 |      0      98      7      0 |       100     89  88        45(18)      0
sparfuchs           42       20 |      0       0      6    167 |        97    -42  83        48(19)      0
WARNUNG Zielbereiche: meetingfan 23 % (Ziel 25–40); workaholic 0 % (Ziel 25–45)
CHECK OK (harte Invarianten)
```

## Einordnung
- **Auftrag erfüllt:** Wer alle unnötigen Meetings des Schichtleiters besucht, ist nicht die stärkste Strategie. `meetingfan` 23 % gegen `gut` 62 % (39 PP Abstand), `meetingfan_plus` (alle Meetings *und* Schichtplan) nur 7 %. In v0.1.1 lag `meetingfan` mit ca. 70 % noch vorn.
- Hebel dafür: abnehmender Ertrag je nutzlosem Meeting (+8, +6, +4, +2, 0), Nutzen der Schichtleiter-Laune bei 80 gedeckelt, Besprechungsquote ab 90 Min. am Tag, Meeting-Spirale (wer viel kommt, wird mehr eingeladen) und die Alternative „Schichtplan abstimmen“.
- `berater` (68 %) liegt 6 PP über `gut`, weil Berater einmal pro Woche Papierarbeit abnehmen; Ziel war höchstens 5 PP. Bewusst so gelassen, Berater kosten 25 k€ und das Budget wird knapp (Median 15 k€ am Ende).
- `workaholic` (Überstunden bis 19:30 und jedes Wochenende beide Tage) verliert immer über die Familie. Das ist gewollt (wie in v0.1.1, „du wirst Imker“); das Ziel 25–45 % aus PHASEN.md wurde nicht übernommen. Die maßvolle Variante `fleissig` (bis 18:00, Samstagsschicht nur bei Familie > 60) gewinnt 65 %, verliert aber ein Drittel der Partien über die Familie.
- `meetingfan` liegt mit 23 % knapp unter dem Zielband 25–40 %.

## Änderungen gegenüber dem Plan (PHASEN.md)
- Arbeitszeiten: Requirements 45, Spezifikation 50, Implementierung 75, Testlauf 75, Reparatur 35 Min. (sonst war kein Sieg im Termin möglich, `gut` < 5 %).
- Überstunden kosten Familie 1 je 20 Min. (statt 12), Besprechungsquote −1 je 30 Min. (statt −2), Budgetstart 100 k€ (statt 90).
- Nachtschicht repariert Störungen über Nacht (Verpackungsautomat 35 %, andere Stationen 75 %), Stillstand für KPIs auf 10 h/Tag gedeckelt.
- Berater: 25 k€, einmal pro Woche, 1–2 Pakete Requirements/Spezifikation.
- Der italienische Kollege kommt jede volle Stunde (70 %) kurz im Vorbeigehen (2 Min., Ticker), dazu bis zu drei Besuche mit Entscheidung.

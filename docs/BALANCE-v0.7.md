# MES-Marathon: Balance v0.7.0

Stand 20.10.2026. Messung mit `node tools/bot.js 1000 --check`, Hebel mit 3000 Partien. `CHECK OK`, eine Warnung.

## Versuch: Sockel für kurze Überstunden (Plan von Claude)
Idee: `TUNE.ueber.min` als Familien-Sockel für Überstunden ab `ueber.frei` Minuten, damit 17:30 spürbar wird. Messreihe (3000 Partien, gut / gut1730 / fleissig):

| Variante | gut | gut1730 | fleissig |
|---|---|---|---|
| v0.6 (min 0) | 58,6 | 74,5 | 34,3 |
| min 3 | 52,2 | 72,8 | 32,0 |
| min 4 | 46,0 | 61,7 | 18,3 |
| min 3, frei 25 | 56,1 | 72,8 | 32,5 |

Entscheidungsregel: gut ≥ 58, fleissig ≥ 32, gut1730 ≤ 72. **Keine Variante erfüllt sie.** Der Sockel trifft die gute Strategie stärker als gut1730, weil auch sie oft eine Aktion über 17:00 hinaus beendet. Daher bleibt v0.6 unverändert (`ueber.min` 0).

## Siegquote v0.7 (1000 Partien)
Unverändert gegenüber v0.6 (die v0.7-Änderungen sind Gags, Anzeige und Randfälle): gut 60, fleissig 35, gut1730 76 (3000 Partien: 74,5), meetingfan 15, meetingfan_plus 6, ablenkbar 42, berater 52, sparfuchs 53, bieter 62, vorzeig 56, naschbox 57, elonThema 57, gagfan 56, sapChaos 47, einfach 22, workaholic 0, passiv 0.

## Abweichungen (offen, nach dieser Runde)
1. **gut1730 74,5 bis 76 %** (Grenze 75): Bis 17:30 bleiben ist weiter etwa 15 PP besser als pünktlich gehen. Drei Runden Hebel (v0.5 Familie und Wochenende, v0.6 Spätzuschlag, v0.7 Sockel) zeigen: Jeder Familien-Hebel trifft gut stärker. Ein möglicher nächster Ansatz wäre, Überstunden nicht über die Siegchance, sondern im Punktestand zu bewerten (größerer Eingriff, nicht in dieser Runde).
2. **fleissig 35:** Überstunden plus Samstag lohnen sich nicht (gewollt), der Abfall seit v0.5 ist steil.
3. **ablenkbar_alt 27** (v0.4-Verhalten ohne Kopfhörer) unter dem Band, nur Referenz.

# MES-Marathon: Balance v0.6.0

Stand 19.10.2026. Messung mit `node tools/bot.js 1000 --check` (Seeds 1000 + i·7919), Hebel mit 3000 Partien (Fehler etwa 0,9 PP). `CHECK OK`, eine Warnung.

## Der Hebel: Spätzuschlag
Wer nach 17:00 noch eine Aktion anfängt, ist müde: Sie dauert ×1,2 (`TUNE.ueber.spaet`). Party-Minuten zählen nicht. Die gute Strategie fängt nach 17:00 nichts mehr an und ist daher kaum betroffen. Messreihe (3000 Partien):

| Variante | gut | gut1730 | fleissig |
|---|---|---|---|
| v0.5 (spaet 1) | 59,1 | 78,2 | 65,2 |
| spaet 1,1 | 58,7 | 77,0 | 49,6 |
| spaet 1,15 | 58,5 | 75,7 | 44,0 |
| spaet 1,2 (gewählt) | 58,6 | 74,5 | 34,3 |
| spaet 1,1 und Erholung over/4 statt over/6 | 56,8 | 71,7 | 40,9 |

Entscheidungsregel aus dem Plan: gut ≥ 58, gut1730 ≤ 75, fleissig ≤ gut + 3. Nur 1,2 erfüllt alle drei. Claude: »Vertretbar, mit bekanntem Preis.«

## Siegquote v0.6 gegen v0.5 (je 1000 Partien)
| Strategie | v0.5 | v0.6 | Kommentar |
|---|---|---|---|
| gut | 60 | 60 | |
| fleissig | 65 | 35 | Überstunden plus Samstag lohnen sich nicht mehr (Familie 65 %) |
| gut1730 (Referenz) | 77 | 76 | n=3000: 74,5; Warnung über 75 bei n=1000 im Rauschen |
| berater | 52 | 52 | |
| ohneSchichtplan | 54 | 54 | |
| sparfuchs | 53 | 53 | |
| ablenkbar | 42 | 42 | |
| ablenkbar_alt | 27 | 27 | |
| einfach | 23 | 23 | |
| meetingfan | 16 | 15 | |
| meetingfan_plus | 6 | 6 | |
| workaholic | 0 | 0 | |
| bieter | 63 | 62 | |
| vorzeig | 55 | 56 | |
| naschbox | 57 | 57 | |
| elonThema | 57 | 57 | |
| gagfan (neu) | | 56 | schaut Pappkamerad und Fax je dreimal an: Gags kosten nur Zeit |
| zusager | 56 | 57 | |
| waghalsig | 55 | 55 | |
| sapChaos | 48 | 47 | |

## Abweichungen (offen)
1. **gut1730 74,5 bis 76 %.** Abgeschwächt, nicht gelöst: Bis 17:30 bleiben ist weiter etwa 15 PP besser als pünktlich gehen. Grund: Zeit ist der Engpass, 30 Minuten am Tag sind viel. Für v0.7 vorgemerkt.
2. **fleissig fällt steil** (65 auf 35). Spielerisch gewollt (Überstunden sollen sich nicht lohnen), aber eine Klippe. Der Zuschlag ist sichtbar (⚠ auf den Knöpfen, 17:00-Hinweis, Anleitung).

## Neue Invarianten
- gagfan ≤ gut + 3, gleiche Meetingzahl wie gut (±1).
- Die »vernünftigen« Strategien für den Bestwert: gut, berater, fleissig, ohneGegen, zusager, bieter, naschbox, lakritz, elonThema, melone, ohnePlan.

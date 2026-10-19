# MES-Marathon: Review v0.5.0

Lead für Planung und Review: Claude Code (nur lesende Werkzeuge). Umsetzung: Grok Bot. Rohfassungen der Pläne und Reviews liegen im Arbeitsordner (`claude_plan05.log`, `claude_suess05.log`, `claude_review05.log` und folgende).

## Plan (Claude)
- v0.5: Audio-Randfall, Ausschreibung, zweiter Siegpfad, Kopfhörer als Hebel für ablenkbar, drei Gags (Archiv, digitaler Zwilling, Werk-Nord-Kommentare).
- v0.6: Aufzug-Studio (neuer Raum, Türen bleiben unverändert) und Pappkamerad (greift die Meeting-Invarianten an).
- Neue Zufälle über einen zustandslosen Strom `rngA`, damit alte Würfe je Seed gleich bleiben.

### Abweichungen vom Plan bei der Umsetzung (gemessen)
- Audit-Schwellen: Plan 95/88 und zwei Freitage, gemessen unerreichbar. Umgesetzt: ein Freitag ab Tag 15, KPI-Index 65, Image 87, 3 Module.
- Ausschreibung: Strafe beim Verlieren gestrichen, Gebot auch per Mail aus dem Büro, Werk Nord als langsame Zufallswanderung (das letzte Gebot ist Information).
- Kopfhörer: Knopf im HUD statt Büro-Aktion (als Aktion netto schädlich), Schichtleiter −1 statt −2.
- Zusätzlich gefunden: Der Ton-Knopf lag auf dem Handy unter dem Overlay.

## Süßigkeitenbox (Plan von Claude, auf Wunsch des Projektinhabers)
- Box im Büro, Nachschub einmal pro Woche am Kantinen-Kiosk (Weg fällt mit dem Mittagessen zusammen), drei Sorten mit Preisen, Stammgast je Tag mit fester Vorliebe, Gemecker bei leer oder falscher Sorte, das letzte Stück als Running Gag.
- Umsetzung mit gemessenen Änderungen: Auffüllen 2 statt 4 Min.; nur das Gemecker des Schichtleiters kostet Teamlaune (vorher jedes, dann lag Schoko unter dem Ignorieren); jede Rolle hilft bei passender Sorte einmal am Tag mit 10 Min. bei ihrer Aufgabe.

## Review 1 (Claude) und Umsetzung
Urteil: »Freigabe mit Auflagen.«
| Befund | Schwere | Umsetzung |
|---|---|---|
| Vorzeigewerk wurde vor den übrigen Abendwirkungen geprüft und schlug Niederlagen am selben Abend | mittel | Audit nach allen Abendwirkungen (auch nach Burnout-Sprung), in `checkEnd` nach Werkleitung, Familie und Budget, vor dem Termin. Test |
| Text »Image −0.« beim verlorenen Gebot, rot | niedrig | Text ohne Strafe, als Info |
| Großzügiges Gebot (130 %) konnte bei Gleichstand verlieren | niedrig | Nord höchstens 125 %, abgerundet; Test über 300 Seeds |
| Beraterkontingent ohne offene Pakete wurde bezahlt | niedrig | Zuschlag wird storniert, nichts bezahlt; Test |
| Laufzeit »5 Tage« stimmte nicht | niedrig | Wirkung ab Zuschlag 5 Tage, Text angepasst |
| Zahlung erst beim Zuschlag kann ins Minus führen | niedrig | bewusst so (wie jede Rechnung), Test |
| rngA mit grober Präzision | niedrig | gleiche Technik wie die alten Ströme, ausreichend |
| gut1730 (78 %) | Frage | bewusst offen, in BALANCE und Release dokumentiert |

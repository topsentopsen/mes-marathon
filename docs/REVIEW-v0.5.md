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

## Review 2 (Claude) und Umsetzung
Urteil: »v0.5.0 ist lokal freigabefähig, wenn Befund 1 vorher behoben wird.« Alle Befunde aus Review 1 korrekt umgesetzt.
| Befund | Schwere | Umsetzung |
|---|---|---|
| Gemecker nannte eine feste falsche Sorte (»Lakritz?« auch bei Gummibärchen) | mittel | Gemecker je Sorte (`meck` als Objekt), Test über alle Rollen und Sorten |
| »Wer hat die Schokolade alle gemacht?« bei nie gefüllter Box | niedrig | neutral: »Die Box ist leer.« |
| »Stammgast heute: … enttäuscht« auch nach dem Auffüllen | niedrig | »Stammgast heute früh« |
| Box-Hilfe verbraucht, auch wenn ein blockierter Testlauf die Dauer überschreibt | niedrig | Hilfe erst nach der Aktion verbraucht, nur wenn sie wirkt; Test |
| Spielstand 0.5.0 ohne neue Felder stürzt ab | niedrig | `load` ergänzt fehlende Felder aus einem neuen Spiel; Test |
| Auffüllen bei voller Box verschwendet Geld | niedrig | Knopf zeigt »noch N Stück drin« |
| »Papierchen« am Tablettband | niedrig | Text je Sorte |

## Gesamtprüfung Konsistenz und Logik (Claude, ganzer Code und alle Texte)
| # | Befund | Schwere | Umsetzung |
|---|---|---|---|
| 1 | Projektinhaber mit Namen in REVIEW-v0.5, Namenstest rot | hoch | Rollenbegriff, Namenstest grün |
| 2 | Ei »fünfmal das letzte Stück« im Spiel unerreichbar (höchstens 3 bis 4 Nachfüllungen) | mittel | Schwelle 3 (`TUNE.suess.egg`), Test spielt es im normalen Ablauf bis Tag 18 |
| 3 | Berater (25 k€) auch ohne offene Pakete | mittel | Check »nichts für Berater offen«, Test |
| 4 | Burnout am Donnerstag überspringt Tageskosten und Freitagszinsen | mittel | im Burnout-Zweig nachgeholt, Test |
| 5 | Dauer auf den Knöpfen ≠ echte Dauer (Testlauf mit Schichtplan, Chaos, Mittag, Box-Hilfe …) | mittel | gemeinsame Berechnung `costOf`/`actCost` für Knopf und Aktion, Test |
| 6 | Spielende am Wochenende nicht gespeichert, »Weiterspielen« erlaubte eine andere Wahl | mittel | nach `weekend()` speichern |
| 7 | KONZEPT (Stand v0.2) widerspricht dem Code in 9 Zahlen | mittel | als historisch markiert, aktuelle Werte zusammengefasst; PHASEN ebenso |
| 8 | Durchsage »der echte Schichtwechsel ist erst um 14:00« auch nach 14:00 | niedrig | »wie immer um 14:00« |
| 9 | Nord-Abwerbung »zwei Tage« vs. 3 Tage | niedrig | »drei Tage« |
| 10 | Laufzeiten: Lieferant 4 statt 3 Tage, Ausschreibung 6 statt 5 | niedrig | Lieferant heute + 2 Tage, Ausschreibung »5 Arbeitstage ab Zuschlag« (Code day+4), Test |
| 11 | OEE-Ziel 78 % nur mit Fusion erreichbar (Module zusammen 77) | niedrig | Ziel 77; Bot n=1000: Siegquoten unverändert (±1) |
| 12 | Box-Hilfe verfällt bei blockiertem Testlauf | niedrig | siehe Review 2 |
| 13 | »Pausiert« bleibt nach Menü bei neuem Spiel/Weiterspielen | niedrig | Pause wird zurückgesetzt |
| 14 | Spielstand nur per Versionsstring geprüft | niedrig | fehlende Felder werden ergänzt |
| 15 | Feste Zahlen in der UI (Familie −13, »ca. 4 Pakete«, Footer, Zinsrundung, »nächste Ausschreibung Dienstag« in der Übernahme-Woche) | niedrig | Werte aus `TUNE`, Footer aus `SC.VERSION`, Zinstext »auf volle k€ gerundet«, Hinweis auf die Übernahme-Woche |
| 16 | Burnout am Tag vor dem Termin beendet das Spiel | niedrig | bewusst so, steht jetzt in der Anleitung |

Geprüft und konsistent (laut Claude): Uhrzeiten (Sirene 14:00 bis 14:20, Mittag 11:30 bis 13:30, Pforte ab 15:00, Kick-off 11:00 ohne Kollision), Audit-Zahlen in Code, UI, README, Release, Balance und Bot, Kredit, Tranche, Zusagen, Titel, Prognose, Markt, VERSION/SC.VERSION/Test, Wochenrückblick, Prognose und Audit beim Burnout, Weiterspielen nach dem Abend.

## Running Gag »Elon« (Plan von Claude, auf Wunsch des Projektinhabers)
- Der Tesla-Kollege (weiter ohne Namen) erzählt bei jedem Besuch, was »Elon« angeblich alles anders machen würde, nur als vage Umschreibung in seinen eigenen Worten (»Elon würde dieses Werk in zwei Wochen hochziehen. Behaupte ich jetzt mal.«). Keine Zitate, keine Behauptungen über die reale Person, nichts Politisches, kein Nachname. Ein Test prüft das für jeden Satz (Umschreibungs- und Ich-Marker, kein Zitatformat, Verbotsliste).
- Elon-Zähler des Tages im Kalender und in der Tagesbilanz, Easter Egg ab 8 Erwähnungen insgesamt.
- Reichweite: ab Tag 15 »Ich lade inzwischen dauernd Elon-Posts. Den Akku leider nicht.«
- Neue Option »Thema wechseln« (8 Min., Energie +1, in 20 % der Fälle +4 Min.).
- In Schichtleiter-Meetings sitzt er höchstens einmal am Tag mit 25 % dabei: +3 Min., Energie +2 vom Lachen, zählt nicht in die Meeting-Quote. Gemessen (gut, n=3000): ohne 59,7 %, mit +5 Min. und Quote 57,4 %, mit +3 Min. und Energie +2 59,1 %. Deshalb die milde Variante.
- Abweichung vom Plan: Claudes Ei bei 5 an einem Tag ist kaum erreichbar (höchstens ein Besuch plus ein Meeting am Tag), daher 8 insgesamt.

## Review 3 (Claude, Nachprüfung) und Umsetzung
Urteil: »Bedingt freigabefähig. Kein blockierender Logikfehler.« Alle Fixes aus Review 2 und Gesamtprüfung korrekt.
- Zwei Elon-Sätze klangen wie Aussagen über die reale Person (»Elon sagt sinngemäß …«, »Elon hat gestern angeblich gepostet«): umformuliert in Konjunktiv und Vorstellung des Kollegen. Test verschärft: kein »Elon sagt/schreibt/postet/meint/hat« im Indikativ.
- Durchsage zum »Meeting zur Reduzierung von Durchsagen« kündigte ein Meeting an, das es nicht gibt: »fällt aus, wegen zu vieler Durchsagen«.
- Bewusst offen (niedrig): Rabatt bei Mindestdauer 5 Min. theoretisch verbraucht (alle betroffenen Aktionen dauern ≥ 15 Min.); Kaffee-Malus am Wochenende entfällt nach Burnout am Freitag; Salzbereiche der Elon-Würfe überlappen leicht (keine Balance-Wirkung).
- Ei »letztes Stück« ab 3: im Test mit normalem Spielablauf (mittwochs auffüllen) bis Tag 18 nachgewiesen.

## Ergebnis
90 Sim-Tests, Namenstest, Bot-Check (n=1000, CHECK OK, 2 Warnungen), Browser-Check, Handspiel 15 Tage (Seed 4343) ohne JS-Fehler, Mobil-Audio (iPhone und Android, Randfall, Taste M, Knopf über dem Overlay) grün.

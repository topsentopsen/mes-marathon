# MES-Marathon – Plan v0.4.0 (nur vorgemerkt, nicht umgesetzt)

Stand 19.10.2026. Nichts davon ist in v0.3.0 enthalten.

## Vorgaben für v0.4
- **Mehrere Ebenen mit eigenem Fenster in die Produktion.** In v0.3 hat nur die Leitebene ein Panoramafenster (zwei Scheiben). In v0.4 bekommt jede Etage ein eigenes Fenster mit passender Ansicht (Feld: Förderbänder, Steuerung: Schaltschränke und SPS, Leitebene: Leitwarte, MES: Serverraum mit Blick nach unten, ERP: Parkplatz und Lkw). Die Türen bleiben unverändert.
- **Ideensammlung** für ein rundes Spiel (unten).
- **Weitere Testläufe:** mehr Handspiel-Durchläufe im Browser (verschiedene Seeds, bis Spielende), Balance-Bot mit zusätzlichen Strategien für die v0.4-Elemente, Zielbänder neu festlegen.

## Aus v0.3 verschoben (Sender-Chef-Elemente, Begründung von Claude Code)
| # | Element | Grund für v0.4 |
|---|---|---|
| 2 | Markt mit Tagesrotation (kaufen/verkaufen: Berater, Lizenzen, Ersatzteile) | viel neuer Inhalt (Angebote, Preise, UI); Berater und Lieferant decken das Nötigste ab |
| 3 | Planen mit Prognose und Auswertung | setzt Image und Zusagen voraus; `kpiPath` ist die Basis |
| 5 | Echtzeit-Ausschreibung bis zu einer Uhrzeit | braucht ein neues Echtzeit-Konzept samt Bot-Modell |
| 8 | Nachrichten und Agenturen mit Kosten und Nutzen | setzt den Markt voraus; die Werkszeitung ist bisher nur Gag |
| 9 | Zweiter Siegpfad | braucht Image und Kredit als Grundlage; Idee: »Werk des Jahres« (alle 4 KPIs im Ziel und Image ≥ 80) |

## Weitere verschobene Ideen
- Running Gag Reichweitenanzeige des Tesla-Kollegen (steigt jeden Tag): braucht tageweise eigene Texte.
- Hidden Extra: 7x Aufzugknopf führt in ein geheimes Studio als Mad-TV-Hommage: neuer Raum mit Grafik, Ton und UI.
- Espresso des italienischen Kollegen um 15 Uhr (dreimal in Folge): in v0.3 ersetzt durch das Tiramisu (dreimal in Folge zuhören).

## Ideensammlung
- Wetter und Jahreszeit im Fenster (Hitzetage: Extrusion zickt).
- Nachtschicht als spielbarer Bonus-Tag.
- Betriebsrat als Rolle mit Zustimmungspflicht für Wochenendschichten.
- Zertifizierungsaudit als Großereignis (ISO-Ordner im Archiv).
- Mehr Easter Eggs im Archiv (»das erste MES-Lastenheft«).
- Ton: eigene Jingles für Party, Durchsage und Rivalen-Eingriff.
- Balance: Zielbänder aus PHASEN.md 10.2 für v0.4 neu festlegen (meetingfan, workaholic, sparfuchs).

# Release v0.13.0 »Breitbild«

Stand 20.10.2026.

Ziel: Am PC passt alles auf einen Bildschirm, ohne dass die Seite, ein Raum oder ein Dialog scrollt. Texte und Wertung bleiben unverändert, geändert sind nur Layout und Darstellung.

- Layout am PC (ab 900 × 560 Pixel Fenster): Das Spiel nutzt die Fensterhöhe und bis 1880 Pixel Breite. Oben Kopfzeile und Kalender, darunter das Werk und rechts daneben die Raumknöpfe der fünf Etagen, unten der Ticker. Die Fabrik behält ihr Seitenverhältnis 480 : 300.
- Räume: Kopf oben, darunter links die Infos (Tabellen, Aussagen, Hinweise) und rechts »Was tun?« mit den Aktionen in mehreren Spalten. Der Raum deckt am PC Werk und Raumknöpfe ab (raus mit »Raus« oder Esc). Passt ein Raum so nicht, probiert das Spiel weitere Aufteilungen (Infos zweispaltig, Aktionen breiter, alles in einem Fluss über zwei oder drei Spalten, zuletzt etwas dichtere Schrift).
- Schrift: ab 1000 Pixel Fensterhöhe wie bisher 18 Pixel im Raum, darunter 17 beziehungsweise 16 Pixel; nur in der dichtesten Aufteilung 15 Pixel.
- Dialoge: breiter, Feierabend und Spielende zweispaltig, die Anleitung in Spalten und bei Bedarf auf Seiten (◀ und ▶).
- Handy: wie bisher untereinander, Scrollen im Raum ist dort erlaubt. Breite Tabellen schieben sich nur selbst zur Seite, lange Wörter in Überschriften brechen um.
- Test: `test/layout-check.js` öffnet jeden Raum und jeden Dialog in vielen Spielständen bei 1366 × 768, 1440 × 900 und 1920 × 1080 und prüft scrollHeight ≤ clientHeight, dazu das Handy (390 × 844) auf seitliches Abschneiden.
- Bekannt: Mit »Schrift: Groß« und in sehr niedrigen Fenstern (etwa 1024 × 768) kann ein voller Raum (Büro, Controlling) noch ein wenig scrollen, abgeschnitten wird nichts.
- Spielstände aus 0.7.0 bis 0.12.0 laden weiter.

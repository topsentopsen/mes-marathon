# MES-Marathon: Balance v0.8.0

Vorgabe des Projektinhabers: Die Balance bleibt, wie sie ist. TUNE, Wertung und Siegbedingungen sind unverändert. Der Vorsprung von gut1730 bleibt bewusst stehen.

## Nachweis
- Befehl: `node tools/bot.js 3000 --check`, vor der ersten Änderung (Stand v0.7.0) und nach allen v0.8-Änderungen samt Review-Fixes.
- Ergebnis: Die Ausgaben sind **Zeichen für Zeichen identisch** (`diff` leer). Die neuen Gags laufen über das zustandslose `rngA` mit den Salzen 32000, 32100 und 32200. Sie legen kein Feld in S an und geben weder Easter Egg noch Punkte. Alle übrigen Änderungen betreffen Texte und Bedienung.
- Auszug (3000 Partien, Siegquote in %): gut 58, fleissig 34, gut1730 75, ablenkbar 41, berater 54, bieter 63, naschbox 59, elonThema 56, gagfan 57, vorzeig 55, sapChaos 46. `CHECK OK`.

## Offen (unverändert, siehe BALANCE-v0.7)
- gut1730 liegt bei 75 bis 76 %. Laut Entscheidung des Projektinhabers bleibt das so.
- fleissig liegt bei 34.

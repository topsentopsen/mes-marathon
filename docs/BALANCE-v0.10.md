# Balance v0.10.0

Stand 20.10.2026. Keine Änderung an Wertung, Punkten, Siegbedingungen oder TUNE.

- Christian: `node tools/bot.js 3000 --check` ist zeichengleich zu v0.9.0 (und damit zu v0.8.0).
- Sandra: `node tools/bot.js 3000 --check --figur=sandra` ist zeichengleich zu v0.9.0 (gut 56 %, Christian 58 %).
- Goldwert-Tests: voller Bot-Lauf für drei Seeds, Hash über den Endzustand ohne Texte, für Christian gegen v0.8.0 und für Sandra gegen v0.9.0.
- Neue Szenen, Tipps und Zeilen laufen nur über zustandsloses `rngA` (Salze 34000 bis 34400), kosten keine Zeit und legen kein Feld in S an.
- Abweichungen wie in `docs/BALANCE-v0.9.md` (fleissig bei Sandra, gut1730).

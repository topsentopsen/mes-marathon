# MES-Marathon v0.4.0 »Leitstand« (Release-Notes)

Stand 19.10.2026. Lokal auf dem Branch v0.4-dev, noch nicht veröffentlicht.

## Neu
- **Jede Etage hat ein Fenster in die Produktion**, mit eigener Ansicht je Ebene der Automatisierungspyramide:
  - EG Feld: Lichtschranke B12 am Förderband (der Strahl bricht, wenn ein Karton durchfährt).
  - 1 Steuerung: Schaltschränke mit SPS, IO, HMI; eine LED blinkt rot bei einer Störung.
  - 2 Leitebene: das Panoramafenster aus v0.3 (Roboterarm, Kran, Extruder).
  - 3 MES: Blick von oben auf beide Straßen, Kartons mit Tracking-Marke, Stationen blinken rot bei Störung, Anzeige MES-Fortschritt und OEE.
  - 4 ERP: Laderampe mit Lkw, der Tesla des Kollegen neben der Ladesäule (nicht eingesteckt), Himmel nach Tageszeit.
  - Alle 15 Türen sind exakt wie in v0.3 (eigener Test).
- **Markt im Controlling:** jeden Tag drei Angebote, ein Geschäft am Tag. Berater-Tagespaket, Ersatzteile, Imagekampagne der Agentur »Synergie & Söhne«, Pressemitteilung über die Nachrichtenagentur, Toner, Wartungsvertrag für Rack 4, oder eine der drei alten MES-Lizenzen von 2009 verkaufen (Geld, Image −1). Damit sind Markt sowie Nachrichten und Agenturen aus der v0.4-Liste umgesetzt.
- **Planen mit Prognose und Auswertung (Leitstand):** Montag oder Dienstag eine Prognose für den KPI-Index am Freitag abgeben (unter, im oder über Plan, 5 Min.). Freitag im Wochenrückblick: Treffer Werkleitung +4 und Image +2, knapp daneben −1, klar daneben −3.
- **Wassermelonen-Bericht:** »alles grün« melden (Werkleitung +3 sofort). Ist es innen rot, schneidet das Audit am Freitag mit 35 % die Melone auf (Werkleitung −6, Image −6).
- **SAP-Hotline (Büro, nur während der Migration):** 30 bis 60 Minuten Warteschleife, in etwa jedem zweiten Anruf ein Stammdatenpaket.
- **Tesla-Reichweite:** Die Anzeige des Tesla-Kollegen sinkt jeden Tag um 11 km. Er lädt trotzdem nie.
- **Titel »Werk des Jahres«:** Go-Live mit KPI-Index ab 90 % und Image ab 75 gibt den Titel und +300 Punkte.
- **Hinweis bei altem Spielstand** aus einer anderen Version im Titelbild.

## Fehlerbehebung: kein Ton auf dem Handy (hohe Priorität)
**Ursache.** Der Ton lief nur über die Web Audio API und wurde nur beim Tippen auf Knöpfe im Titel- oder Abendbild (und den Ton-Knopf) entsperrt. Daraus ergaben sich drei Fehler:
1. **iPhone (Hauptursache, sehr wahrscheinlich):** Safari ordnet reines Web Audio der Audio-Session »ambient« zu. Ist der Stummschalter an, bleibt es komplett still, auch bei voller Lautstärke. Das passt zu »Ton fehlt komplett«.
2. **Nach Tab-Wechsel, Sperrbildschirm oder Anruf** (iOS und Android): `visibilitychange` rief `resume()` ohne Nutzer-Geste auf. Das lehnen mobile Browser ab, der AudioContext blieb »suspended«. Tippen ins Spielfeld oder auf die Raumknöpfe hat ihn nie wieder entsperrt. Nachgestellt im Test: Mit dem Code von v0.3.0 bleibt der Kontext nach dem Unterbruch und einem Tipp ins Spielfeld »suspended«.
3. **Ältere WebKit-Versionen** entsperren erst, wenn in der Geste wirklich ein Puffer startet. Das fehlte.
Dazu zeigte der Ton-Knopf immer »Ton an«, auch wenn der Browser den Ton noch sperrte.

**Behebung (js/audio.js, js/ui.js).**
- Jede echte Geste (pointerdown, touchstart, touchend, mousedown, click, keydown) entsperrt den Ton, solange der AudioContext nicht läuft, auch nach einem Unterbruch.
- Beim ersten Entsperren startet ein 1-Sample-Puffer.
- Gegen den Stummschalter: ein stummes, geloopt laufendes `<audio>`-Element (WAV im Speicher, `playsinline`) und, wo vorhanden, `navigator.audioSession.type = 'playback'`. Nebenwirkung: Wie bei jeder Musik-App unterbricht das Spiel fremde Musik, solange der Ton an ist.
- Ton-Knopf mit Zustand: »🔊 Ton an«, »🔇 Ton aus« oder »🔈 Ton: tippen«. Der erste Tipp auf »Ton: tippen« entsperrt nur und schaltet nicht ab.
- Auf dem iPhone einmal je Gerät der Hinweis »Kein Ton? Stummschalter prüfen«.
- Test: `test/mobile-audio.js` (headless Chrome, iPhone- und Android-Emulation mit Touch-Events, ohne Autoplay-Freigabe).
- Nicht prüfbar ohne echtes Gerät: das Verhalten des Stummschalters selbst. Bitte auf dem iPhone einmal mit Stummschalter an und aus testen.

## Balance
Siehe `docs/BALANCE-v0.4.md`. sparfuchs (26 auf 51 bis 52) und ablenkbar (29 auf 31 bis 32) liegen wieder in ihren Zielbändern. Die Gründe und die verbleibenden Abweichungen sind dort offen genannt (fleissig weiter beste Strategie, ablenkbar nur knapp im Band, sparfuchs nahe der Obergrenze).

## Nach v0.5 verschoben
Ausschreibung/Auktion, Aufzug-Studio, echter zweiter Siegpfad, »Pappkamerad« im Meeting. Begründungen in `docs/PLAN-v0.5.md`.

## Tests
- `node test/sim.test.js` (63 Tests), `node test/names.test.js`, `node tools/bot.js 300 --check`
- `NODE_PATH=... node test/browser-check.js`, `test/playthrough.js 15 4343`, `test/mobile-audio.js`

# Recherche Spieltempo und Lesbarkeit (20.10.2026)

Anlass ist Feedback des Projektinhabers vom 20.10.2026 (07:17 und 07:19): Das Spiel läuft zu schnell, beim Lesen und Entscheiden tickt die Uhr weiter, alles wirkt gehetzt. Es soll insgesamt leichter werden, damit man in Ruhe lesen kann.

## 1. Das Vorbild: Mad TV (Rainbow Arts, 1991)
Laut README ist MES-Marathon von Mad TV inspiriert.

**Was das Spiel ist:** Man leitet als Programmdirektor einen kleinen Fernsehsender. Man läuft mit einer Figur durch ein Hochhaus, fährt Aufzug und geht in Räume (Filmhändler, Werbeagentur, Chef und andere). Dort kauft man ein, verhandelt und stellt das Programm zusammen. MES-Marathon hat genau diesen Aufbau übernommen: das Bürogebäude mit Aufzug, die Räume und der Tag mit Uhr.

**Wie das Original mit der Zeit umgeht:**
- **Länge eines Tages:** Ein Spieltag geht von 17:00 bis 01:00 Uhr, also acht Spielstunden. Danach endet der Tag, egal was man gerade tut. (Anleitung: »Every day starts at 17:00 and ends at 01:00«; GameFAQs; Wikipedia: »Each day is timed, and after eight game hours the day of programming ends.«)
- **Die Uhr läuft in Echtzeit weiter**, auch beim Laufen, im Aufzug und in den Räumen. Laut deutscher Wikipedia verliert man »spielentscheidende Sekunden«, wenn der Aufzug oder ein Büro gerade von einem Gegner belegt ist.
- **Tempo einstellbar:** In der Senderzentrale gibt es einen Regler (»das Auto unten«) von langsam bis schnell (Anleitung: »The car at the bottom represents the speed of the game. The slowest setting is on the left«). Der Regler sitzt nur am Bürocomputer. Gamezone warnt deshalb: Wer auf höchster Stufe in einen anderen Teil des Hauses geht, hat das Tempo nicht zur Hand.
- **Pause:** Das Spiel lässt sich jederzeit mit der Leertaste anhalten. Laut Gamezone fehlt das in der Anleitung: »Das Spiel kann jederzeit mit der Leertaste pausiert werden, in der Anleitung hat man das irgendwie vergessen zu erwähnen.«
- **Echtsekunden pro Spieltag:** Dazu habe ich keine verlässliche Zahl gefunden, die Anleitung nennt nur den Regler.

**Fazit für den Projektinhaber:** Auch im Original läuft die Uhr beim Lesen weiter. Wer Ruhe wollte, musste das Tempo herunterdrehen oder die Leertaste drücken. MES-Marathon hat diese Hektik geerbt, aber ohne gut sichtbaren Tempo-Regler und ohne Hinweis auf die Pause. Moderne Spiele lösen das freundlicher (siehe 2).

Quellen:
- Mad-TV-Anleitung (englische Übersetzung): https://www.gamesdatabase.org/Media/SYSTEM/Commodore_Amiga/Manual/formated/Mad_TV_-_1991_-_Rainbow_Arts.htm
- Deutsche Anleitung (Auszug): https://www.freegameempire.com/games/Mad-TV/manual-pdf
- Gamezone, Usertipps: https://www.gamezone.de/Mad-TV-Spiel-13137/Tipps/Spieletipps-zu-Mad-TV-Ratschlaege-fuer-Fernsehmacher-Usertipps-1063375/
- GameFAQs FAQ: https://gamefaqs.gamespot.com/pc/581730-mad-tv/faqs/38558
- Wikipedia (en): https://en.wikipedia.org/wiki/Mad_TV_(video_game)
- Wikipedia (de): https://de.wikipedia.org/wiki/Mad_TV

## 2. Übliche Mechaniken in vergleichbaren Spielen
- **Uhr hält bei Entscheidungen an:**
  - In Crusader Kings III halten Ereignisfenster im Einzelspieler das Spiel an, bis man eine Antwort wählt (Paradox-Forum).
  - Europa Universalis IV: Leertaste ist Start/Pause, mit + und − gibt es fünf Stufen. Auf Stufe 1 dauert ein Spieltag 2 Sekunden, auf Stufe 4 0,2 Sekunden (EU4-Wiki).
  - Üblich ist also: Echtzeit nur, wenn man nichts liest. Dazu eine einstellbare Geschwindigkeit, die langsam startet.
- **Lesehilfen, Textgeschwindigkeit und Klick zum Weiter** (Visual Novels und Adventures, Beispiel Ren'Py):
  - Die Textgeschwindigkeit ist einstellbar, »0« zeigt den Text sofort, ein Schreibmaschinen-Effekt ist optional.
  - Automatisches Weiterblättern gibt es nur auf Wunsch. Standard ist »Klick zum Weiter«.
  - Ein Verlauf (History) erlaubt es, Gesagtes noch einmal zu lesen.
- **Barrierefreiheit (Game Accessibility Guidelines, Xbox Accessibility Guidelines):**
  - Basis-Empfehlungen:
    - Texte im eigenen Tempo weiterklicken
    - einstellbare Spielgeschwindigkeit
    - gut lesbare Standard-Schriftgröße
    - einfache Sprache
    - Erinnerung an Steuerung und Ziele
    - Einstellungen merken
    - wählbare Schwierigkeit
  - Xbox XAG 116: Texte, die nach einer Zeit verschwinden, sollen sich auf mindestens das Zehnfache verlängern lassen, oder sie bleiben stehen, bis man sie wegklickt.
  - Xbox XAG 101: Fließtext am PC mindestens 18 px Zeichenhöhe bei 1080p, skalierbar bis 200 %.
- **Vorlesen:** Browser haben eine eingebaute Sprachausgabe (Web Speech API, `speechSynthesis`, laut MDN seit 2018 in allen gängigen Browsern). Man muss nichts installieren, Stimmen und Qualität hängen aber vom Gerät ab.

Quellen:
- Game Accessibility Guidelines: https://gameaccessibilityguidelines.com/full-list/
- Xbox XAG 116 (Zeitlimits): https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/116
- Xbox XAG 101 (Textdarstellung): https://devdocs.xbox.com/build/game-principles/accessibility/xag-deep-dives/xag-101-text-display
- Ren'Py Einstellungen: https://www.renpy.org/doc/html/preferences.html
- Ren'Py Verlauf: https://www.renpy.org/doc/html/history.html
- EU4-Wiki, Spielgeschwindigkeit: https://eu4.paradoxwikis.com/index.php?section=13&title=Ingame_screen&veaction=edit
- EU4-Wiki, Tasten: https://eu4.paradoxwikis.com/index.php?section=1&title=Controls&veaction=edit
- CK3, Pause bei Ereignissen: https://forum.paradoxplaza.com/forum/threads/is-autopause-on-events-a-setting.1445451/
- MDN SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

## 3. Ist-Stand MES-Marathon v0.8.0 (gemessen im Code)
- **Grundtempo:** `SC.MIN_PER_SEC = 2`, also 2 Spielminuten pro Echtsekunde. Eine Spielstunde dauert 30 Echtsekunden, der Arbeitstag von 08:00 bis 17:00 (9 Spielstunden) 4,5 Minuten. Mit Tempo 2x sind es 15 s pro Spielstunde, mit 4x 7,5 s.
- **Die Uhr steht schon** bei Besuchen und Unterbrechungen, am Feierabend, am Wochenende, im Tagesprotokoll, in der Pause und in der Anleitung (alles Overlays).
- **Die Uhr läuft weiter** in den Räumen, also beim Lesen der Raumtexte, Tabellen und Aktionsknöpfe, beim Lesen des Tickers und beim Laufen durchs Haus.
- **Leertaste:** Sie schaltet die Pause auch um, wenn ein Overlay offen ist.
- **Ticker:** Lange Meldungen werden auf dem Handy mehrzeilig.
- **Balance-Bot:** Er rechnet ohne Echtzeit, pauschal 8 Spielminuten pro Raumwechsel und keine Lesezeit. Ein Mensch war bisher also schlechter gestellt als der Bot.

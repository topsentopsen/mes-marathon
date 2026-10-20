# Early Access 0.14.0-ea.1 »Woche 1«

Stand 20.10.2026. Branch early-access, abgezweigt von main 502abd6 (v0.14.0). main und die Pages-Seite bleiben unverändert.

## Schritt 1: Name ersetzt
Der Name des Raketen-Milliardärs steht in keinem sichtbaren Text mehr. Der Tesla-Kollege schwärmt jetzt abwechselnd vom »Raketen-Milliardär«, vom »Chef vom Elektroauto-Konzern« oder kurz vom »Milliardär«. Der Zähler heißt »Milliardärs-Zähler«, das Abo »Milliardärs-Abo«. Interne Kennungen (`stats.elon`, `eggs.elon`, `SC.ELON…`, `elonHeute`, `TUNE.elon`) bleiben, damit Spielstände passen. Sie werden nie angezeigt. `test/names.test.js` prüft, dass der Name in js/, css/, index.html, README.md und in allen Spieldaten nicht mehr vorkommt.

## Schritt 2: ein Level
- **Level »Woche 1: Das erste Modul«:** Montag bis Freitag. Ziel: bis Freitag 17:00 mindestens ein Modul abgenommen. Nach dem Freitagabend kommt statt des Wochenendes der Ende-Bildschirm. Er zeigt das Ergebnis (geschafft oder nicht) und »Ende der Early-Access-Version. Mehr folgt.«, ohne Termin. Knöpfe: »Nochmal spielen« und »Zum Titel«.
- **Verlieren in der Woche:** Wie im Hauptspiel über Werkleitung, Familie oder Budget. Ein Burnout am Donnerstag oder Freitag beendet die Woche.
- **Figuren:** Christian, Sandra und Ivo sind alle wählbar. Ivo ist in einer einzelnen Woche etwas schwerer, weil seine Lernkurve bis Tag 10 läuft.
- **Level-Start:** Nach der Figurenwahl erscheint ein Dialog mit Ziel, Ablauf eines Moduls und dem Hinweis, was gesperrt ist. Bei Ivo folgt danach sein Einstieg.
- **Kennzeichnung:** Der Titel trägt das Kennzeichen »Early Access«. Das HUD zeigt »Tag x/5«. Die Werkleitung nennt das Wochenziel. Die Anleitung beginnt mit einem Hinweis zum Early Access.
- **Gesperrt:** Wochenenden, SAP-Migration (ab Tag 6), Firmenübernahme, Konzernaudit und Vorzeigewerk, Party und alles ab Tag 6. Die Zusagen an die Werkleitung (sie reichen über Tag 5 hinaus) sind ausgeblendet und lassen sich nicht ausführen.
- **Version und Spielstände:** Die Version heißt 0.14.0-ea.1 (Fußzeile, Titel, Level-Start). Alle localStorage-Schlüssel beginnen mit `mesmarathon-ea-` (Spielstand, Bestenliste, Figur, Tempo, Schrift, Ton). Stände des Hauptspiels werden nicht geladen.
- **Technik:** Schalter `SC.EA` in `js/data.js`. Mit `SC.EA = null` läuft das volle Spiel unverändert, so prüfen es die Logiktests und der Balance-Bot. Keine neuen Abhängigkeiten, keine Netzwerkaufrufe, kein Tracking, keine neue HTML-Seite.
- **Bot, Woche 1, 300 Partien je Strategie (`node tools/bot.js 300 --ea --check`):**

  | Strategie | Christian | Sandra | Ivo |
  |---|---|---|---|
  | gut | 79 % | 70 % | 67 % |
  | einfach | 72 % | 79 % | 72 % |
  | meetingfan | 67 % | 66 % | 26 % |
  | passiv | 0 % | 0 % | 0 % |
  | fleissig | 94 % | 93 % | 87 % |

  In einer einzigen Woche lohnen sich Überstunden mehr als im ganzen Spiel, weil die Familie erst später leidet.
- **Tests:**
  - `test/sim.test.js`: 131 Tests, davon 3 neu für das Level.
  - `test/playthrough.js` spielt das Level für jede Figur bis zum Ende-Bildschirm.
  - `test/browser-check.js` prüft Titel, Level-Start, HUD, ausgeblendete Zusagen und den Ende-Bildschirm.
  - `test/layout-check.js` prüft Level-Start und Ende-Bildschirm (gewonnen und verloren) bei 1366 × 768, 1440 × 900 und 1920 × 1080 ohne Scrollen.

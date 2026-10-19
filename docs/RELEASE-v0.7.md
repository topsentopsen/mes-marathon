# MES-Marathon v0.7.0 »Abreißkalender«

Stand 20.10.2026. Letzte Version dieser Runde.

## Neu
- **Abreißkalender im Schichtleiter-Büro:** jeden Tag ein anderer Spruch.
- **Dein Werk in Zahlen:** Der Endbildschirm zählt Elon-Erwähnungen, Blicke auf den Pappkameraden, Faxe, Aufzugknopf, Süßigkeitenbox, »Das hatten wir schon immer so«, Kopfhörer und Easter Eggs. Dazu ein Abschluss-Satz, je nach Sieg oder Niederlage.
- **Herbst:** Von Oktober bis Dezember gibt es am Kiosk Lebkuchen (nur Anzeige, keine Wirkung).
- **Erster Start:** Das Titelbild zeigt einmal eine Kurzanleitung.

## Behoben
- Überstunden im Endbildschirm mit Nachkommastellen (»22.867999 Min.«), jetzt gerundet.
- Kaffeeautomat: Bei einem Burnout am Freitag entfiel der Wochenend-Malus des kaputten Automaten.
- Die Hilfe der Süßigkeitenbox wurde auch verbraucht, wenn die Mindestdauer sie schluckte.
- Burnout am Freitag: Text stellt klar, dass das Wochenende trotzdem kommt.
- Aus dem Review: Pförtner-Sätze widersprachen sich, Reihenfolge »Neu in 0.5/0.6/0.7« in der Anleitung, Wochenendtext nennt den Kaffee-Malus, Bot-Kommentar. Details: `docs/REVIEW-v0.7.md`.

## Balance
Siehe `docs/BALANCE-v0.7.md`. Unverändert gegenüber v0.6. Der geplante Überstunden-Sockel traf die gute Strategie stärker als gut1730 und wurde verworfen. Offen: gut1730 74,5 bis 76 %.

## Tests
96 Sim-Tests (neu: Kaffee nach Burnout am Freitag und Donnerstag, Box-Hilfe bei Mindestdauer, Kalender, Abschluss, Saison, Salze), Namenstest, Bot-Check, Browser-Check (neu: Kurzanleitung, Kalender), Handspiel, Mobil-Audio.

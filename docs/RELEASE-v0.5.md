# MES-Marathon v0.5.0 »Ausschreibung«

Stand 19.10.2026. Lokal auf dem Branch v0.5-dev, nicht veröffentlicht.

## Neu
- **Ausschreibung gegen Werk Nord:** Dienstags hängt im Controlling ein Los aus (Rahmenvertrag Ersatzteile, Beraterkontingent mit 2 Paketen oder Wartungspaket für Server und Verpackungsautomat). Drei verdeckte Gebote zur Wahl (80, 100 oder 130 % des Richtpreises), im Controlling (15 Min.) oder per Mail aus dem Büro (5 Min.). Zuschlag Mittwoch 15:00, Gleichstand gewinnt Werk Nord, gezahlt wird nur beim Zuschlag. Werk Nord bietet 75 bis 125 % und ändert sein Verhalten von Woche zu Woche nur wenig: Wer das letzte Nord-Gebot kennt, bietet besser. Keine Ausschreibung in der Woche der Übernahme. Werk Nord kommentiert jedes Gebot (Dienstwagen und Kuchen, Fax, Neonunterschrift).
- **Zweiter Weg zum Sieg, Konzernaudit »Vorzeigewerk«:** an einem Freitag ab Tag 15 mit KPI-Index ab 65 %, Image ab 87 und mindestens 3 abgenommenen Modulen. Das Projekt gilt dann als Erfolg, auch ohne alle Module (+700 Punkte statt Go-Live-Bonus). Werkleitung, Familie oder Budget auf null am selben Abend gehen vor. Fortschritt im Leitstand sichtbar.
- **Christians Süßigkeitenbox:** Christian bringt immer Süßigkeiten mit. Die Box steht im Büro, Nachschub gibt es einmal pro Woche am Kiosk der Kantine (Schoko-Mix 3 k€, Gummibärchen 2 k€, Lakritz 1 k€, je 2 Min., 6 Stück). Morgens wird genascht (1 bis 2 Stück), das letzte Stück nimmt niemand (Running Gag, fünfmal selbst gegessen ist ein Easter Egg). Jeden Tag ab Tag 3 schaut ein Stammgast vorbei, die Vorlieben stehen auf einem Zettel am Kiosk: Schichtleiter, Werkleitung und Controlling mögen Schoko, Instandhaltung und Kantinenkraft Gummibärchen, die IT-Chefin Lakritz. Passt die Sorte, hilft genau diese Rolle einmal am Tag (Testlauf, Termin bei der Werkleitung, Controlling-Aktion, Reparatur, Mittagessen oder Review 10 Min. kürzer; dazu Schichtleiter +1 oder Werkleitung +1). Ist die Box leer oder die Sorte falsch, wird gemeckert (Sprechblase im Ticker), nur das Gemecker des Schichtleiters kostet Teamlaune (Schichtleiter −1).
- **Kopfhörer (🎧 im HUD):** ohne Zeitaufwand, einmal am Tag, Schichtleiter −1. Bis Feierabend halten sich Tesla-Kollege, Kollegen ohne Ahnung und der Kollege vom Altwerk kurz (2 Min., ohne Gewinn). Der italienische Kollege und die IT-Chefin lassen sich nicht abwimmeln.
- **Running Gag »Elon«:** Der Tesla-Kollege (weiter ohne Namen) erzählt bei jedem Besuch, was Elon angeblich alles anders machen würde. Nur seine eigene, vage Schwärmerei, keine Zitate. Elon-Zähler des Tages im Kalender und in der Bilanz, Easter Egg ab 8. Neue Option »Thema wechseln« (8 Min., klappt meistens). Ab Tag 15 lädt er »dauernd Elon-Posts, den Akku leider nicht«. In Schichtleiter-Meetings sitzt er manchmal dabei (+3 Min., Energie +2 vom Lachen).
- **Gags:** digitaler Zwilling im Serverraum (beim 7. Besuch ein Easter Egg), Fundstücke im Archiv (beim 5. Klick das erste MES-Lastenheft, Version 0.1).

## Behoben
- **Ton-Knopf, Randfall aus v0.4:** Ein Tipp irgendwo und binnen 1,5 s ein Tipp auf den Ton-Knopf schaltete erst beim zweiten Tipp ab. Ursache: Der Zeitstempel der entsperrenden Geste merkte sich nicht, wo getippt wurde. Jetzt zählt nur eine Geste auf dem Ton-Knopf selbst (oder Taste M) als »nur entsperren«.
- **Ton-Knopf lag auf dem Handy unter dem Titel- und Abendbild:** Das Overlay deckte die Kopfleiste ab, der Ton ließ sich dort nicht schalten. Der v0.4-Test »Ton-Knopf als erste Berührung« traf deshalb in Wahrheit das Overlay. Jetzt liegen Ton-Knopf und Lautstärke darüber, der Test prüft mit `elementFromPoint`.
- **Gesamtprüfung Konsistenz und Logik:** angezeigte Dauer auf den Knöpfen = echte Dauer; Berater nur, wenn Pakete offen sind; Burnout holt Tageskosten und Freitagszinsen nach; Spielende am Wochenende wird gespeichert; Pause nach dem Menü zurückgesetzt; Spielstände mit fehlenden Feldern werden ergänzt; Laufzeiten, Durchsagen und Texte passen zu den Werten; OEE-Ziel 77 (vorher ohne Fusion unerreichbar); KONZEPT als historisch markiert. Details: `docs/REVIEW-v0.5.md`.

## Balance
Siehe `docs/BALANCE-v0.5.md`. Offen: Wer jeden Tag bis 17:30 bleibt, gewinnt 77 % (gilt schon für v0.4, Grenze 75); fleissig 65 > gut 60 + 3. Auffüllen der Box bei fast voller Box ist erlaubt (der Knopf zeigt, wie viel noch drin ist).

## Tests
`node test/sim.test.js` (neu: Ausschreibung, Vorzeigewerk, Kopfhörer, Süßigkeitenbox, Gags, alte Würfe je Seed unverändert), `node test/names.test.js`, `node tools/bot.js 300 --check`, Browser: `test/browser-check.js`, `test/playthrough.js 15 4343`, `test/mobile-audio.js` (iPhone und Android, neu: Randfall, Taste M, Knopf über dem Overlay).

Alte Spielstände (v0.4) werden nicht geladen, das Titelbild weist darauf hin.

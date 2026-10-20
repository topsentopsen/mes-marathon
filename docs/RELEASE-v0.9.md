# MES-Marathon v0.9.0 »Sandra«

Stand 20.10.2026. Mehr Ruhe zum Lesen, scharfe Schrift und eine zweite Figur.

## Neu
- **Die Uhr steht, solange du liest.** In Räumen, bei Besuchen, Hinweisen, im Tagesprotokoll, in der Pause und während du in ein Textfeld tippst. Ein ⏸ an der Uhr zeigt das. Zeit kosten nur das Laufen und die Aktionen: Eine Aktion springt die Uhr um ihre Dauer vor.
- **Tempo Langsam, Normal, Schnell** (Standard Langsam): 60, 40 oder 30 Echtsekunden pro Spielstunde (vorher 30, 15 oder 7,5). Tasten + und −, die Wahl bleibt gespeichert.
- **Der 17:00-Hinweis wartet auf »Weiter«** (Klick, Enter, Leertaste oder Esc).
- **Größere Schrift** in Räumen, Dialogen, Ticker und Knöpfen, dazu der Schalter »Schrift: Groß« im Titel.
- **Scharfe Schrift im Haus:** Türschilder, Anzeigen und Sprechblasen werden in voller Bildschirmauflösung gezeichnet, mit Kontur und einer Mindestgröße.
- **Sandra** als zweite spielbare Figur. Bei »Neues Spiel« wählst du zuerst: Christian (der Erfahrene, gute Beziehungen) oder Sandra (die jüngere Kollegin aus der MES-Entwicklung, schneller bei Spezifikation, Umsetzung, Deploy und Berichten, dafür neu im Werk). Sandra hat eigene Szenen, Christian besucht sie als Kollege mit Tipps aus der Halle. Spielt man Christian, schaut Sandra manchmal vorbei.
- **Spielstände** speichern die Figur. Stände aus 0.7.0 und 0.8.0 laden weiter, ohne Figur mit Christian. »Weiterspielen« nennt Tag und Figur.

## Behoben
- Leertaste in einem Dialog schaltete die Pause um. Jetzt bestätigt sie Dialoge mit genau einem Knopf. Gehaltene Tasten und die ersten 400 ms nach dem Öffnen zählen nicht.
- Auf dem Handy war der Ticker bei langen Meldungen zu hoch, jetzt steht dort nur die letzte Meldung.
- Bei »Neues Spiel« und »Weiterspielen« blieb ein offener Raum stehen.

## Balance
Christian: Bot-Tabelle zeichengleich zu v0.8.0. Sandra: gut 56 % (Christian 58 %). Abweichungen (fleissig, einfach) in `docs/BALANCE-v0.9.md`. Für Menschen ist das Spiel leichter, weil Lesen keine Zeit mehr kostet.

## Bekannte Grenzen
- Auf dem Handy ist das Raum-Panel niedrig und scrollt.
- »Schrift: Groß« nutzt CSS `zoom`, in Firefox erst ab Version 126.
- Auf schmalen Handys liegt der Ton-Knopf über dem oberen Rand langer Dialoge (er bleibt absichtlich immer erreichbar).

## Tests
113 Sim-Tests, Namenstest, Bot-Check für beide Figuren, Browser-Check, Mobil-Check und Handspiel mit beiden Figuren. Details in `docs/REVIEW-v0.9.md`.

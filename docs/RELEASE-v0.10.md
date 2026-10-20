# MES-Marathon v0.10.0 »Feinschliff mit Sandra«

Stand 20.10.2026. Feinschliff, mehr Szenen, bessere Lesbarkeit. Wertung und Balance unverändert.

## Neu
- **Neun neue Szenen für Sandra** aus dem MES-Alltag: Etiketten ohne Chargennummer, Rüsten mit dem zweiten Wagen, Rückmeldung als Foto vom Zettel, Auftragsfreigabe, Schnittstellen nach dem Neustart, Chargenverfolgung bei der Abnahme, Review, Wartung, Postfach.
- **Vier neue Tipps von Christian** (Rüsten, Chargenpapier, Etiketten, »gleich« heißt nach der Pause) und **drei neue Zeilen**, wenn Sandra bei Christian vorbeischaut. Neue Sprechblasen für beide.
- **Bestenliste mit Figur:** Jeder neue Eintrag zeigt, ob Christian oder Sandra gespielt hat.
- **Tastatur:** sichtbarer Fokus-Rahmen, der Ticker ist per Tab erreichbar und öffnet das Protokoll mit Enter oder Leertaste.

## Lesbarkeit
- Graue Hinweistexte heller (Kontrast 5,3 zu 1 statt etwa 3,2 zu 1), Fußzeile und deaktivierte Knöpfe besser lesbar.
- Absätze höchstens 70 Zeichen breit.
- Handy: Dialoge beginnen unter dem Ton-Knopf (auch nach dem Drehen), Räume sind deutlich höher (457 statt etwa 225 Pixel bei 360 mal 640), Besuchsknöpfe mindestens 44 Pixel hoch.

## Behoben
- Leertaste im Raum schaltete die Pause um (dort steht die Uhr ohnehin) und ließ die Seite springen. Jetzt löst sie einen fokussierten Knopf aus.
- Verschachtelte Anführungszeichen in einem Tipp von Christian.

## Balance
Unverändert, beide Bot-Tabellen zeichengleich zu v0.9.0 (`docs/BALANCE-v0.10.md`).

## Tests
117 Sim-Tests (neu: Goldwerte für Sandra, Bestenliste, neue Texte, Szenen-IDs), Namenstest, Bot-Check für beide Figuren, Browser-Check mit Handy-Messungen, Mobil-Check, Handspiel mit beiden Figuren. Details in `docs/REVIEW-v0.10.md`.

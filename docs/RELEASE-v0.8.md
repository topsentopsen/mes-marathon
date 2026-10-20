# MES-Marathon v0.8.0 »Aushang«

Stand 20.10.2026. Eine zusätzliche Runde Feinschliff, die Balance bleibt unverändert.

## Neu
- **Tagesprotokoll per Tipp auf den Ticker.** Solange es offen ist, steht die Uhr. Es schließt mit »Weiter« oder Esc. Ein 📋 im Ticker weist darauf hin.
- **Aushang am Werkstor**, jeden Tag ein anderer, zum Beispiel »Wegen Umbau ist der Umbau bis auf Weiteres geschlossen.«
- **Diagramm des Tages im Leitstand**, zum Beispiel »Neue Kennzahl: Kennzahlen pro Kennzahl.«
- **Eine Zeile im Wochenend-Dialog**, zum Beispiel »Der Pappkamerad hat am Wochenende Schicht.«
- **Spielstände aus 0.7.0 laden weiter.** Das Speicherformat ist unverändert.

## Behoben
- Bei 1 bis 9 Min. Überstunden stand in der Bilanz rot »Familie −0«. Jetzt kommt eine Info-Zeile: »Das Abendessen ist noch warm.« Nach der Party heißt sie »Nach der Party noch N Min. geblieben«.
- Kamen mehrere Meldungen gleichzeitig, sah man im Ticker nur die letzte. Jetzt stehen die letzten zwei zusammen im Ticker.
- Endete das Spiel über die Wochenendentscheidung, fehlte der Jingle.
- Ein Burnout am Freitag kostet den Montag, der Text sagt das jetzt. Der Burnout-Text nennt außerdem Familie −4.
- Im Tagesprotokoll standen doppelte Aufzählungspunkte.

## Balance
Unverändert, die Bot-Tabelle ist identisch (siehe `docs/BALANCE-v0.8.md`).

## Tests
102 Sim-Tests, Namenstest, Bot-Check, Browser-Check, Mobil-Audio und Handspiel. Details in `docs/REVIEW-v0.8.md`.

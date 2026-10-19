# MES-Marathon v0.6.0 »Feinschliff«

Stand 19.10.2026.

## Neu
- **Endzeit auf jedem Aktionsknopf:** »(75 Min., fertig 15:45)«, nach Feierabend mit ⚠. In den Hallen steht zur Sirene auch die Wartezeit bis zur Übergabe dabei.
- **Spätzuschlag:** Was du nach 17:00 noch anfängst, dauert ×1,2 (müde). Gilt auch für die SAP-Hotline. Party-Minuten zählen nicht.
- **Ausschreibung nach Krankheitstag:** Fällt der Dienstag aus, hängt sie am Mittwoch aus, Frist heute 15:00.
- **Kleine Gags:** ein Pappkamerad im Büro (3 Min., ohne Wirkung, Easter Egg beim 6. Mal), ein Fax-Gerät im Druckerraum (nach dem Elon-Ei: »Elon-Abo per Fax kündigen«, Easter Egg beim 5. Mal), die Aufzugkabine anklicken (beim 7. Mal das Aufzug-Studio, eine Mad-TV-Hommage, ohne neuen Raum).
- **Tasten:** K setzt die Kopfhörer auf; Tooltips nennen die Tasten (Leertaste, +, M, K).

## Behoben
- Die Wartezeit der Schichtübergabe war auf den Knöpfen unsichtbar.
- Toter Code im Wochenend-Handler.
- Aus dem Review: Aufzug-Klick nur auf die Kabine (der Etagenboden daneben bleibt zum Laufen klickbar), ⚠ auf Party-Tagen erst nach den Party-Minuten, Spätzuschlag auch für Aktionen mit eigener Dauer, keine doppelte Meldung beim Aufzug-Ei, Fax-Ei-Text, Fristtext. Details: `docs/REVIEW-v0.6.md`.

## Balance
Siehe `docs/BALANCE-v0.6.md`. fleissig 65 auf 35, gut1730 78 auf 74,5 (3000 Partien), gut unverändert. Offen: gut1730 weiter etwa 15 PP über gut.

## Tests
93 Sim-Tests (neu: Gags, Spätzuschlag mit Party und Hotline, Wartezeit, Mittwochs-Ausschreibung, VERSION-Datei = SC.VERSION), Namenstest, Bot-Check, Browser-Check, Handspiel, Mobil-Audio.

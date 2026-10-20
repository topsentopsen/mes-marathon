# Release v0.14.1

Stand 20.10.2026.

Ziel: zurück auf den Stand vor v0.14.0. Spielbar sind nur Christian und Sandra.

- Die dritte Figur aus v0.14.0 ist vollständig entfernt: Figurenkarte, Porträt, Spielfigur im Werk, Startwerte, Lernkurve, Einstieg mit Glossar, Merkzettel, eigene Szenen, Sprechblasen, Kollegen-Text, Knopfvermerke, Anleitung, Titel, Fußzeile, CSS, Tests, Bot-Option und die Erweiterung der Namensregel. Umgesetzt als `git revert` von v0.14.0, kein Reset.
- Namensregel wieder wie v0.13: Nur Christian und Sandra haben Namen, alle anderen heißen nach ihrer Rolle (`test/names.test.js`).
- Texte, Werte, Balance und Layout entsprechen v0.13.0.
- Spielstände aus 0.7.0 bis 0.14.0 laden weiter. Ein Spielstand mit einer Figur, die es nicht mehr gibt, lädt nicht: Der Titel meldet, dass er nicht passt, und »Neues Spiel« führt zur Figurenwahl. Eine gemerkte Figur, die es nicht mehr gibt, wird zu Christian. Kein Absturz.
- Keine neue HTML-Seite, keine neuen Skripte, keine Netzwerkaufrufe.

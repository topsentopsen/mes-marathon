# GoatCounter: Seitenaufrufe zählen

Stand 20.10.2026. Vorbereitet im Branch `goatcounter-dev`, noch nicht veröffentlicht. Die Seite zählt erst, wenn der Platzhalter ersetzt und der Branch nach main übernommen ist.

## Was gezählt wird

- Nur Seitenaufrufe, und nur der Pfad (`/mes-marathon/`). Kein Query-String, kein Teil hinter `#`, keine Klicks im Spiel, keine Ereignisse.
- Woher jemand kam (Referrer), nur als Adresse ohne Query und ohne `#`.
- GoatCounter leitet daraus Browser, System, Bildschirmbreite und Land ab und speichert nur Summen. IP-Adressen werden laut GoatCounter nicht gespeichert.
- Das Spiel selbst ruft GoatCounter nie auf. Es gibt nur ein Script-Tag in `index.html`.
- Das Script wird nicht von GoatCounter geladen, sondern liegt als eingefrorene Kopie im Repo: `vendor/goatcounter-count.js` (Version v5, Quelle und Prüfsumme stehen oben in der Datei).

## Einrichten (einmalig)

1. Auf https://www.goatcounter.com ein Konto anlegen. Dafür braucht es eine E-Mail-Adresse.
2. Einen Seitennamen wählen, zum Beispiel `mes-marathon`. Das Dashboard liegt dann unter `https://mes-marathon.goatcounter.com`.
3. In den Einstellungen das Dashboard privat lassen: keinen öffentlichen Zugang einschalten und keine Lese-Links oder API-Schlüssel anlegen. Angesehen wird nur mit Login.
4. In `index.html` im GoatCounter-Tag `SEITENNAME` durch den gewählten Namen ersetzen, also `https://mes-marathon.goatcounter.com/count`.
5. Tests laufen lassen (`node test/goatcounter.test.js` und die übrigen Tests), dann den Branch nach main übernehmen. Erst ab dann zählt die Seite.

Zugangsdaten, Passwörter oder Schlüssel gehören nie ins Repo.

## Eigenes Gerät nicht mitzählen

In jedem eigenen Browser einmal diese Adresse öffnen:

https://topsentopsen.github.io/mes-marathon/#toggle-goatcounter

Es erscheint ein Hinweisfenster (englisch: »GoatCounter tracking is now DISABLED in this browser …«). Ab dann zählt dieser Browser nicht mehr mit. Die Markierung liegt nur in diesem Browser (localStorage, Eintrag `skipgc`). Wer dieselbe Adresse noch einmal öffnet, schaltet das Zählen wieder ein. Das funktioniert mit der eingefrorenen Kopie genauso wie mit dem Original, ein Test prüft das.

Ist die Seite schon offen, reicht es nicht, nur `#toggle-goatcounter` an die Adresse anzuhängen: Danach die Seite neu laden (F5 oder Neu-laden-Knopf), sonst erscheint das Fenster nicht.

Gilt je Browser und je Gerät: Handy, Laptop und ein zweiter Browser brauchen den Aufruf jeweils einmal. Nach dem Löschen der Browserdaten muss man ihn wiederholen.

Lokal (Datei im Browser geöffnet, localhost, Heimnetz) wird ohnehin nie gezählt.

## Datenschutz

- GoatCounter setzt keine Cookies und speichert keine IP-Adressen, die Server stehen bei Hetzner in Finnland und Deutschland. Laut GoatCounter ist deshalb wahrscheinlich kein Einwilligungs-Hinweis nötig. Das ist die Einschätzung des Anbieters, keine Rechtsberatung.
- Trotzdem ruft jeder Besucher dann einen Dritten auf (goatcounter.com). Ehrlich ist ein kurzer Satz in der Fußzeile, zum Beispiel »Zählt Aufrufe anonym mit GoatCounter, ohne Cookies.« Ob ein Impressum oder eine Datenschutzerklärung nötig ist, sollte vor dem Veröffentlichen geklärt werden.
- Quellen: https://www.goatcounter.com/help/privacy , https://www.goatcounter.com/help/gdpr , https://www.goatcounter.com/help/skip-dev , https://www.goatcounter.com/help/countjs-versions

# Vorschlag: Zugriffsstatistik für die veröffentlichte Seite

Stand 20.10.2026. Nur Vorschlag, nichts davon ist eingebaut. Im Spiel gibt es keine Statistik und kein Tracking. Ein Test (`test/names.test.js`) stellt sicher, dass der Spielcode keine Netzwerkaufrufe enthält (fetch, XMLHttpRequest, sendBeacon, WebSocket).

Ziel: Der Projektinhaber sieht über einen privaten Zugang, wie oft der Link https://topsentopsen.github.io/mes-marathon/ aufgerufen wurde, grob von welchem Gerätetyp, und ob ein Aufruf von seinem eigenen Gerät kam. Keine Personendaten, kein Fingerprinting.

## 1. Was GitHub selbst liefert

- **Traffic in den Insights und die Traffic API zählen Besuche auf github.com, nicht auf der Pages-Seite.** Die Doku beschreibt den Traffic-Graph als Klone, Besucher der letzten 14 Tage, verweisende Seiten und beliebte Inhalte des Repositorys, sichtbar für alle mit Push-Rechten. Quelle: https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository
- Die Traffic API (`/traffic/views`, `/traffic/clones`, `/traffic/popular/paths`, `/traffic/popular/referrers`) liefert nur `count` und `uniques` je Tag oder Woche für 14 Tage. **Felder für Gerät oder Browser gibt es nicht.** Quelle: https://docs.github.com/en/rest/metrics/traffic
- Aufrufe von `*.github.io` kommen in der Doku nicht vor. Dass Pages-Aufrufe dort fehlen, schließe ich aus dem beschriebenen Umfang; eine Seite, die das ausdrücklich verneint, habe ich auf docs.github.com nicht gefunden. Drittquellen sagen es ausdrücklich (z. B. https://webapps.stackexchange.com/questions/103618/analytics-on-github-pages).
- **Server-Logs von Pages lassen sich nicht abrufen.** GitHub schreibt nur, dass beim Besuch einer Pages-Seite die IP-Adresse aus Sicherheitsgründen protokolliert wird. Einen Zugang für Seitenbetreiber nennt die Doku nicht. Quelle: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages (Abschnitt »Data collection«)

Ergebnis: Ohne einen externen Zähldienst gibt es keine Aufrufzahlen der Spielseite.

## 2. Warum eine private Seite im Pages-Repo nicht reicht

Das Repo und die Pages-Seite sind öffentlich. Alles, was dort liegt, kann jeder lesen, auch eine Statistikseite unter einem »geheimen« Pfad: Der Pfad steht im Repo und in der Git-Historie. Ein geheimer Pfad ist keine Sicherheit. Der private Zugang muss deshalb beim Zähldienst liegen (Dashboard mit Login) und nicht bei uns.

## 3. Eigenes Gerät erkennen: Markierung statt Fingerprinting

- **Fingerprinting** (Gerät über Bildschirm, Schriften, Canvas usw. wiedererkennen) liest Informationen aus dem Endgerät. Nach § 25 TDDDG (früher TTDSG) braucht das in der Regel eine Einwilligung, nach DSGVO gilt das Ergebnis als personenbezogen. Dazu kommt ein Banner, und zuverlässig ist es auch nicht (Browser-Updates, Datenschutzmodi). Kommt nicht in Frage.
- **Markierung auf dem Gerät des Projektinhabers:** Der Projektinhaber setzt einmal pro Browser selbst einen localStorage-Eintrag, und der Zähldienst zählt diesen Browser dann nicht mehr mit. Das betrifft nur sein eigenes Gerät, für andere Besucher wird nichts gespeichert. Empfohlen.
- **Grobe Gerätekategorien** (Desktop oder Handy, Browser, Betriebssystem) zeigen die Dienste unten ohnehin aus dem User-Agent bzw. der Bildschirmbreite an. Dafür muss nichts gebaut werden.
- Wichtig: Jede Zählung über alle Spieler läuft über einen externen Dienst. Für unser System ist das kein neuer Netzweg (es ist nur ein Script-Tag auf der Seite), aber jeder Besucher ruft dann einen Dritten auf. Das ist Cloud-Telemetrie und braucht das Ja des Projektinhabers, und laut Regel auch Sentinels Freigabe.

## 4. Dienste im Vergleich

| | GoatCounter | Plausible | Umami Cloud | Cloudflare Web Analytics |
|---|---|---|---|---|
| Kosten | kostenlos bei normaler Nutzung, Spenden erwünscht | ab 9 $/Monat (Starter, 10k Seitenaufrufe) | Hobby kostenlos (100k Ereignisse/Monat, 1 Website, 6 Monate Aufbewahrung) | kostenlos |
| Serverstandort | Hetzner in Finnland und Deutschland, Betreiber in Irland | EU, Firma in Estland | US und EU | Cloudflare (USA), Standort der Daten nicht festgelegt |
| Cookies, Banner | keine Cookies, laut Anbieter wohl kein Hinweis nötig | keine Cookies, laut Anbieter kein Banner nötig | keine Cookies, laut Anbieter kein Banner nötig | erhebt laut Anbieter keine personenbezogenen Daten |
| Gerät grob | Browser, System, Bildschirmbreite, Land | Browser, System, Gerätetyp, Land | Browser, System, Gerät, Land | Seitenaufrufe, Besucher, Gerät, Browser |
| Eigenes Gerät ausschließen | URL mit `#toggle-goatcounter` öffnen, setzt den Ausschluss für diesen Browser; zusätzlich IP-Ausschluss in den Einstellungen | in der Konsole `localStorage.plausible_ignore=true`, oder eine Ausschluss-Seite auf derselben Domain | in der Konsole `localStorage.setItem('umami.disabled', 1)` | in der Doku keine Ausschluss-Funktion gefunden |
| Privater Zugang | Dashboard mit Login | Dashboard mit Login; zusätzlich geteilter Link, optional mit Passwort | Dashboard mit Login; Teilen per Link möglich | Cloudflare-Konto |

Bei allen Diensten lässt sich dem Gerät des Projektinhabers ausschließen, aber nicht getrennt zählen. Getrennt zählen ginge nur, wenn die Seite auf seinem Gerät einen anderen Pfad meldet. Bei GoatCounter ist das dokumentiert (`path` als Callback). Das wäre dann aber zusätzlicher Code im Spiel und ist nicht Teil der Empfehlung.

Geteilte Lese-Links (Plausible, Umami) enthalten ein Token in der URL. Wer den Link hat, sieht die Zahlen. Er darf deshalb nie ins Repo, nicht in Chats und nicht in Screenshots. Bei Plausible lieber mit Passwort anlegen.

## 5. Empfehlung

**GoatCounter**: kostenlos, EU-Server, keine Cookies, keine gespeicherten IP-Adressen, Browser, System und Bildschirmbreite reichen für »Desktop oder Handy«, und den Ausschluss des eigenen Geräts setzt man mit einem Klick, ganz ohne Konsole. Der private Zugang läuft über das GoatCounter-Dashboard mit Login. Ein Lese-Link mit Token ist nicht nötig. Wenn der Projektinhaber lieber ein bezahltes Produkt mit EU-Firma und Passwort-geschütztem Teil-Link möchte: Plausible.

Einbauschritte, erst nach das Ja des Projektinhabers und Sentinels Freigabe:
1. Der Projektinhaber legt selbst ein GoatCounter-Konto an (E-Mail nötig) und wählt einen Code, z. B. `MEINCODE`. In den Einstellungen die Sammlung einzelner Seitenaufrufe aus lassen (Standard).
2. In `index.html` vor `</body>` genau ein Script-Tag ergänzen:
   `<script data-goatcounter="https://MEINCODE.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`
3. Der Netzwerk-Test im Repo erlaubt dann genau diese eine externe Adresse in `index.html`; der Spielcode in `js/` bleibt ohne Netzwerkaufrufe.
4. Der Projektinhaber öffnet einmal auf jedem eigenen Browser `https://topsentopsen.github.io/mes-marathon/#toggle-goatcounter` und bestätigt das Fenster. Ab dann zählt dieser Browser nicht mehr mit.
5. In der Anleitung oder Fußzeile einen kurzen Satz ergänzen: »Zählt Aufrufe anonym mit GoatCounter, ohne Cookies.« Rechtlich wohl nicht nötig, aber ehrlich.

Quellen: GoatCounter https://www.goatcounter.com/ , https://www.goatcounter.com/help/privacy , https://www.goatcounter.com/help/gdpr , https://www.goatcounter.com/help/skip-dev , https://www.goatcounter.com/help/js · Plausible https://plausible.io/data-policy , https://plausible.io/docs/excluding-localstorage , https://plausible.io/docs/shared-links · Umami https://umami.is/pricing , https://umami.is/docs/exclude-my-own-visits · Cloudflare https://developers.cloudflare.com/web-analytics/about/ · GitHub wie oben. Keine Rechtsberatung.

// MES-Marathon: Spieldaten. Alle Figuren, Firmen und Texte sind frei erfunden.
// Namensregel: Nur Christian und Sandra haben Namen. Alle anderen Figuren heißen nur nach ihrer Rolle.
'use strict';
window.SC = window.SC || {};
(function (SC) {
  SC.VERSION = '0.14.1-ea.1';
  // v0.8: Spielstände dieser Versionen laden weiter (kein neues Feld in S)
  // Early Access: eigene Spielstände (Schlüssel mesmarathon-ea-...), Stände des Hauptspiels werden nicht geladen
  SC.SAVE_OK = [];
  // Early Access: genau ein Level, Woche 1 (Montag bis Freitag). Ziel: bis Freitag Feierabend mindestens ein Modul abgenommen.
  // Danach kommt statt des Wochenendes der Ende-Bildschirm. SC.EA = null schaltet das volle Spiel ein (nur für Tests und Bot).
  SC.EA = {
    tage: 5, ziel: 1,
    gesperrt: ['z_kurz', 'z_mittel', 'z_lang'],
    titel: 'Woche 1: Das erste Modul',
    kurz: 'Early Access: Woche 1',
    start: 'Montag, 07:30, Werk Mitte. Die Werkleitung will bis Freitag Feierabend das erste MES-Modul abgenommen sehen. Welches, ist ihr egal. Hauptsache, es steht ein Haken in der Excel-Liste.',
    ablauf: 'So geht ein Modul: Requirements in den Hallen, Spezifikation und Implementierung im Büro, Deployment im Serverraum, Testlauf in den Hallen, Ausdruck am Drucker, Abnahme bei der Werkleitung.',
    gesperrtText: 'In dieser Version endet das Spiel nach dem Freitag. Wochenenden, die SAP-Migration, die Firmenübernahme, das Konzernaudit, Zusagen an die Werkleitung und alles ab Tag 6 sind noch gesperrt.',
    chef: 'Die Werkleitung: »Bis Freitag will ich ein abgenommenes Modul sehen. Eins. Das ist ja wohl zu schaffen.«',
    gewonnen: 'Freitag, Feierabend: Das erste Modul ist abgenommen. Die Werkleitung macht einen Haken in die Excel-Liste und rahmt ihn fast ein.',
    gewonnen2: 'Freitag, Feierabend: Mehr als ein Modul abgenommen. Die Werkleitung prüft zweimal, ob die Excel-Liste kaputt ist.',
    verloren: 'Freitag, Feierabend: Noch kein Modul abgenommen. Die Werkleitung nennt es »Lernwoche« und plant ein Kick-off zum Kick-off.',
    ende: 'Hier endet die Early-Access-Version. Mehr folgt.',
    endeKlein: 'Danke fürs Spielen! In der Vollversion geht es nach dem Wochenende weiter, mit SAP-Migration, Firmenübernahme und 20 Tagen bis zum Go-Live.'
  };
  SC.DAY_START = 7 * 60 + 30;   // 07:30 Frühschicht-Beginn im Büro
  SC.DAY_END = 17 * 60;         // 17:00 regulärer Feierabend
  SC.LATEST = 20 * 60;          // 20:00 der Pförtner schließt ab
  SC.MIN_PER_SEC = 2;           // Spielminuten pro Echtsekunde bei Faktor 1 (bis v0.8 »Tempo 1x«)
  // v0.9 Tempo-Stufen (Faktor auf MIN_PER_SEC): Langsam 60, Normal 40, Schnell 30 Echtsekunden pro Spielstunde; Standard Langsam
  SC.TEMPO = [{ id: 'langsam', name: 'Langsam', f: 0.5 }, { id: 'normal', name: 'Normal', f: 0.75 }, { id: 'schnell', name: 'Schnell', f: 1 }];
  SC.DEADLINE = 20;             // Go-Live am Abend von Arbeitstag 20 (nach der Übernahme 22)
  SC.WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  SC.PLAYER = { name: 'Christian', col: '#8cb8e8' };
  // v0.9 Figurenwahl: Christian (der Erfahrene) oder Sandra (die Kollegin aus der MES-Entwicklung).
  // Namensregel: Nur Christian und Sandra haben Namen. Alle anderen Figuren heißen nach ihrer Rolle.
  SC.FIGUREN = {
    christian: { id: 'christian', name: 'Christian', col: '#8cb8e8', titel: 'MES-Projektleiter', kurz: 'mit langer Werkserfahrung',
      plus: ['Kennt jede Station und jeden Schichtleiter persönlich', 'Gute Beziehungen: Werkleitung 60, Schichtleiter 50'],
      minus: ['Steckt in vielen Gesprächen und Meetings', 'Kein Vorsprung bei Spezifikation, Umsetzung und Berichten'] },
    sandra: { id: 'sandra', name: 'Sandra', col: '#58b8a8', titel: 'MES-Spezialistin', kurz: 'die Kollegin aus der MES-Entwicklung',
      plus: ['Kennt die MES-Schnittstellen aus der Entwicklung: Spezifikation, Umsetzung, Deploy, Berichte und Migration gehen bis Feierabend flotter', 'Weniger Fehler im Testlauf, Mapping beim Altwerk in 18 statt 30 Min.'],
      minus: ['Neu im Werk: Werkleitung 55, Schichtleiter 42, Beziehungen wachsen langsamer', 'Hallen-Anforderungen und Reparaturen dauern länger'] }
  };
  // Christian als Kollege bei Sandra (Besuch, 12 Min.): erprobte Tipps aus der Halle
  SC.CHRISTIAN_TIPPS = [
    '»Der Schichtleiter sagt nie Nein. Er sagt ›Wir schauen mal‹. Das heißt Nein.«',
    '»Frag nicht nach dem Ticket. Frag die Werkstatt, ob sie einen Kaffee will.«',
    '»Die Excel-Liste ist nicht schön. Aber sie stimmt. Meistens.«',
    '»Wenn die Presse steht, steht sie nicht wegen des MES. Sag das trotzdem nicht laut.«',
    '»Bring zur Frühschicht Brezeln mit. Das ist kein Trick, das ist Projektmanagement.«'
  ];
  // v0.10: weitere Tipps von Christian (Salze 34100 und 34200)
  SC.CHRISTIAN_TIPPS2 = [
    '»Wenn der Bediener ›gleich‹ sagt, meint er nach der Pause. Notier dir beides.«',
    '»Beim Rüsten stehen alle gern still daneben. Setz dich dazu. Nach zehn Minuten erzählen sie dir das Wichtigste.«',
    '»Mit jeder Charge läuft in der Halle ein Zettel mit. Der Zettel weiß mehr als jedes Konzept. Frag, bevor du ihn ersetzt.«',
    '»Etiketten liest im Werk jeder. Mach die Schrift groß.«'
  ];
  // v0.10: weitere Zeilen, wenn Sandra bei Christian vorbeischaut (Salze 34300 und 34400)
  SC.SANDRA_NPC2 = [
    'Sandra aus der MES-Entwicklung bringt eine Skizze zur Auftragsfreigabe mit. Du ergänzt, wer in der Halle wirklich freigibt. Sie zeichnet einen zweiten Pfeil ein.',
    'Sandra fragt nach den Rückmeldungen aus der Halle. Du zeigst deine Excel-Liste. Sie will daraus eine Schnittstelle machen. Du sagst: »Die Liste bleibt.« Sie nickt und baut die Schnittstelle so, dass die Liste bleibt.',
    'Sandra hat Etiketten-Muster im Postfach. Gemeinsam sucht ihr die Schrift, die man in der Halle auf zwei Meter Abstand liest.'
  ];
  // Sandra als Kollegin bei Christian: nur eine Zeile im Protokoll, keine Zeitkosten
  SC.SANDRA_NPC = [
    'Sandra, die Kollegin aus der MES-Entwicklung, schaut kurz rein: »Deine Excel-Liste ist das einzige Dokument, das die Schicht wirklich liest. Ich hab sie dokumentiert. Jetzt gibt es zwei.«',
    'Sandra aus der MES-Entwicklung fragt, wie die Halle den BDE-Feed wirklich befüllt. Du zeigst ihr den Zettel neben der Stempeluhr. Sie macht ein Foto und baut später ein Pflichtfeld weniger ein.',
    'Sandra zeigt dir ein neues Dashboard. Der Schichtleiter fragt, ob man das ausdrucken kann.',
    'Sandra schickt dir ein Mapping mit Versionsnummer und Änderungsprotokoll. Du fragst, ob du das für die Excel-Liste abschreiben darfst. Sie sagt ja.'
  ];
  // Sandras eigene Szenen: erscheinen manchmal nach passenden Aktionen
  SC.SANDRA_SZENEN = {
    req: 'Du fragst die Schicht: »Warum machen wir das so?« Antwort: »Schon immer.« Es folgt die längste Pause des Tages.',
    spec: 'Excel-Liste mit 47 Spalten. Du markierst sechs fürs MES. Die Spalte »Bemerkung« enthält alle Geschäftsregeln.',
    impl: 'Du zeichnest die Schnittstelle zum Etikettendrucker auf das Whiteboard. Der Drucker kann kein UTF-8: Aus »Größe« wird »Gr??e«. Das steht jetzt auch im Pflichtenheft.',
    deploy: 'Sieben Tools für die Auftragsübergabe: vier tun dasselbe, zwei tun nichts, das siebte ist der Schichtleiter.',
    migrate: 'Stammdaten: 11.000-mal »Schraube«. Du fragst: »Welche?« Die Werkstatt: »Die große.« Einheit Stück oder Karton? »Ja.«',
    bericht: 'Drei Leute, drei Formeln für die OEE. Eine zählt das Rüsten als Ausfall, eine nicht, eine je nach Wetter. Du nimmst die vierte: die dokumentierte.',
    test: 'Der Bediener: »Die Stückzahl tippen wir abends nach.« Du schreibst »Echtzeit« aufs Whiteboard. Jemand ergänzt in Klammern: »(abends)«.',
    linie: 'Die Schicht zeigt dir die Stempeluhr von 1994. Du bist ehrlich beeindruckt, und die Schicht freut sich darüber.'
  };
  // v0.10: weitere Szenen für Sandra (Salz 34000), nur bei Aktionen ohne bisherige Szene
  SC.SANDRA_SZENEN2 = {
    print: 'Auf dem Etikett fehlt die Chargennummer. Im Datensatz steht sie. Dazwischen liegt ein Drucker mit eigenem Kopf.',
    schichtplan: 'Rüsten dauert laut Plan 20 Minuten. Die Schicht zeigt dir den Trick mit dem zweiten Wagen: Jetzt sind es zwölf. Du trägst die Rüstzeit im Stammsatz nach, ab heute plant das MES mit zwölf.',
    excel: 'Die Rückmeldung kommt als Foto vom Zettel. Du liest eine 3, die Schicht liest eine 8. Ihr einigt euch auf ein Terminal in Reichweite.',
    gespraech: 'Der Schichtleiter gibt den Auftrag frei, sobald das Material da ist. Das MES, sobald es das weiß. Du baust die Brücke: ein Knopf am Terminal.',
    restart: 'Nach dem Neustart melden sich die Schnittstellen der Reihe nach zurück. Die Waage braucht am längsten. Sie war schon immer gründlich.',
    abnahme: 'Du nennst eine Charge, und das MES zeigt in zwei Minuten, wo jede Palette war. Die Werkleitung nickt. Dafür ist es da.',
    review: 'Die IT-Chefin fragt nach der Fußnote auf Seite vier der Schnittstellenbeschreibung. Du hast die Seite. Und die Fußnote.',
    wartung: 'Am Automaten klebt ein Zettel: »Nicht anfassen, läuft.« Du fotografierst ihn für die Dokumentation und fasst nichts an.',
    mail: 'Im Postfach: 14 Mails mit »Dringend«, zwei mit Inhalt. Du sortierst nach Inhalt, nicht nach Ausrufezeichen.'
  };
  // v0.11: drei weitere Szenen (Salz 35000), Stillstandsgründe, Fehlerwarteschlange, Ausschuss
  SC.SANDRA_SZENEN3 = {
    repair: 'Der Katalog der Stillstandsgründe hat 83 Einträge. Die Schicht nutzt drei: »Sonstiges«, »Sonstiges 2« und »Pause«. Du streichst 80 und benennst die drei übrigen so, wie die Schicht wirklich spricht. Am nächsten Tag legt sie »Sonstiges 3« an.',
    care: 'Die Fehlerwarteschlange der Schnittstelle enthält 212 Meldungen. 211 sind dieselbe. Du suchst die eine andere. Sie lautet: »Siehe oben.«',
    notbehelf: 'Beim Notbehelf fallen 40 Teile Ausschuss an. Gebucht werden sie auf die Kostenstelle »Muss weg«. Du legst im MES einen echten Ausschussgrund an. Die Kostenstelle bleibt trotzdem.'
  };
  SC.SANDRA_TAG1 = 'Dein Werksausweis ist noch nicht gedruckt. Der Pförtner schreibt dir einen Besucherzettel: »MES, Ebene drei.« Das Formular hat kein Feld für »arbeitet hier«.';
  // Anrede im Text: alle Spielertexte sind für Christian geschrieben, für Sandra werden sie angepasst.
  // Nur einmal je Text anwenden (an den Anzeigestellen), denn aus {C} wird »Christian«, und ein zweiter Lauf machte daraus »Sandra«.
  SC.FILL = { sandra: [[/Christian/g, 'Sandra'], [/»der vom MES«/g, '»die vom MES«'], [/»den vom MES«/g, '»die vom MES«'], [/Hemd wie immer/g, 'Blazer wie immer'], [/»den Entsorger«/g, '»die Entsorgerin«'], [/wirst Imker\./g, 'wirst Imkerin.'], [/zum Schornsteinbeauftragten/g, 'zur Schornsteinbeauftragten'], [/Pappkameraden/g, 'Pappaufsteller'], [/Pappkamerad\b/g, 'Pappaufsteller'], [/MES-Projektleiter\b/g, 'MES-Spezialistin']] };
  // {C} steht in Texten, in denen Christian als Kollege vorkommt (wird nach der Anpassung eingesetzt)
  SC.fill = (S, t) => { if (t == null) return t; t = String(t); const L = S && SC.FILL[S.figur]; if (L) for (const [a, b] of L) t = t.replace(a, b); return t.replace(/\{C\}/g, 'Christian'); };
  SC.KOLLEGE_BUBBLES = {
    christian: ['Erst Kaffee, dann Frage.', 'Dein Mapping schlägt meinen SVERWEIS.', 'Kennst du schon den Schichtleiter?', 'Wir schauen mal. Das heißt Nein.', 'Rüsten? Setz dich dazu.', 'Erst fragen, dann ersetzen.', 'Charge? Frag das Papier.'],
    sandra: ['Mapping? Gib mir 10 Min.', 'Frag mich zum BDE-Feed.', 'Ich hab ein Dashboard gebaut!', 'Echtzeit heißt jetzt, nicht abends.', 'Ich zeichne dir die Freigabe.', 'Etikett in 100 mal 60 mm?', 'Schnittstelle? Sag Bescheid.']
  };
  SC.PLANT = 'Werk Mitte';
  SC.RIVALS = [
    { name: 'Werk Nord', col: '#ff6040', min: 3, max: 7 },
    { name: 'Werk Süd', col: '#40d070', min: 3.5, max: 6.5 }
  ];
  // Automatisierungspyramide: Etage = Ebene
  SC.PYR = ['Feld', 'Steuerung', 'Leitebene', 'MES', 'ERP'];
  SC.STATIONS = [
    { id: 'dea', name: 'DEA', short: 'DEA' }, { id: 'dec', name: 'DEC', short: 'DEC' }, { id: 'eea', name: 'EEA', short: 'EEA' },
    { id: 'extr', name: 'Extrusion', short: 'EXT' }, { id: 'inpack', name: 'Innenverpackung', short: 'INN' },
    { id: 'auspack', name: 'Außenverpackung', short: 'AUS' }, { id: 'ster', name: 'Sterilisation', short: 'STE' }
  ];
  // Bedarf je Projektphase (Arbeitspakete)
  SC.NEED = { req: 3, spec: 3, impl: 4, test: 3 };
  SC.NEED_FUSION = { req: 2, spec: 2, impl: 3, test: 2 };
  SC.MODULES = [
    { id: 'auftrag', name: 'Auftragsverwaltung', station: 'dea' },
    { id: 'bde', name: 'Betriebsdatenerfassung (BDE)', station: 'dec' },
    { id: 'trace', name: 'Rückverfolgung', station: 'inpack' },
    { id: 'qs', name: 'Qualitätsprüfung', station: 'ster' },
    { id: 'erp', name: 'ERP-Schnittstelle', station: 'eea' }
  ];
  SC.FUSION = { id: 'fusion', name: 'Systemfusion Altwerk', station: 'extr' };
  // Etagen 0 = EG (Feld) ... 4 = oben (ERP). Türen links und rechts vom Aufzug (x 240).
  SC.FLOORS = [
    { name: 'FELD', doors: [{ x: 122, label: 'PFORTE', room: 'pforte' }, { x: 186, label: 'SCHICHT', room: 'schicht' }, { x: 330, label: 'HALLEN', room: 'halle' }] },
    { name: 'STEUERUNG', doors: [{ x: 122, label: 'WERKSTATT', room: 'werkstatt' }, { x: 186, label: 'DRUCKER', room: 'drucker' }, { x: 330, label: 'KANTINE', room: 'kantine' }] },
    { name: 'LEITEBENE', doors: [{ x: 122, label: 'BÜRO', room: 'buero' }, { x: 186, label: 'LEITSTAND', room: 'leitstand' }, { x: 330, label: 'MEETING', room: 'meeting' }] },
    { name: 'MES', doors: [{ x: 122, label: 'SERVER', room: 'server' }, { x: 186, label: 'ARCHIV', room: null, deco: true, msg: 'Archiv: Lastenhefte seit 2009. Das erste MES-Lastenheft liegt ganz unten, unter dem zweiten.' }, { x: 330, label: 'IT', room: 'it' }] },
    { name: 'ERP', doors: [{ x: 122, label: 'WERKLEITUNG', room: 'chef' }, { x: 186, label: 'HR', room: null, deco: true, msg: 'Personalabteilung: »Ihre Überstunden bitte im Formular C-17 eintragen. In dreifacher Ausfertigung. Der Drucker ist ja da.«' }, { x: 330, label: 'CONTROLLING', room: 'controlling' }] }
  ];
  SC.ROOMS = {
    pforte: { title: 'Werkstor & Pforte', who: 'der Pförtner, Stempeluhr, Schranke', floor: 0 },
    schicht: { title: 'Schichtleiter-Büro', who: 'der Schichtleiter, Schichtplan an der Wand, drei Kalender', floor: 0 },
    halle: { title: 'Produktionshallen', who: 'Sieben Stationen, zwei Produktionsstraßen, viel Lärm', floor: 0 },
    werkstatt: { title: 'Werkstatt (Instandhaltung)', who: 'die Instandhaltung, Schraubstock, SPS-Koffer', floor: 1 },
    drucker: { title: 'Druckerraum', who: 'der Drucker, der einzige, der das Formular kann', floor: 1 },
    kantine: { title: 'Werkskantine', who: 'die Kantinenkraft, Tablettband, Tagesgericht', floor: 1 },
    buero: { title: 'Mein Büro', who: 'Schreibtisch, zwei Monitore, die Excel-Liste', floor: 2 },
    leitstand: { title: 'Leitstand (KPI & Reporting)', who: 'Großbildschirm, Ampeln, ein Diagramm, das niemand versteht', floor: 2 },
    meeting: { title: 'Besprechungsraum', who: 'Beamer, kalter Kaffee, Moderationskoffer', floor: 2 },
    server: { title: 'Serverraum', who: 'Rack 4, MES-Server und Testumgebung', floor: 3 },
    it: { title: 'IT-Büro', who: 'die IT-Chefin und eine Automatisierungspyramide aus Pappe, 1,20 m hoch', floor: 3 },
    chef: { title: 'Werkleitung', who: 'die Werkleitung, Ledersessel, Ausblick auf den Parkplatz', floor: 4 },
    controlling: { title: 'Controlling', who: 'die Controlling-Abteilung, Taschenrechner mit Papierrolle', floor: 4 }
  };
  // Zahlen-Hebel für die Balance (docs/PHASEN.md 10.3)
  SC.TUNE = {
    // v0.9 Figuren: Christian ist die Basis (alles 1, keine Boni), nur Sandra hat Abweichungen
    figur: { sandra: { start: { chef: 55, schicht: 42 }, dauer: { spec: 0.95, impl: 0.9, deploy: 0.85, restart: 0.85, migrate: 0.9, bericht: 0.85, review: 0.8, req: 1.25, repair: 1.4, notbehelf: 1.4 },
      // v0.11 nurBis17: der Zeitvorteil gilt nur bis Feierabend (gemessen: fleissig 46 auf 33 %, gut1730 77 auf 75 %, gut bleibt 56 %)
      nurBis17: true, schichtF: 0.6, abnahmeChef: -2, testRisk: 0.04, mapping: 18, erklaeren: 0.65, pyrFalsch: 25, kollege: { p: 0.45, min: 12, schicht: 4, ab: 2 } } },
    budgetStart: 110, tranche: 30, trancheLow: 15, berater: 25,
    kredit: { rahmen: 60, rahmenHoch: 80, schritt: 20, zins: 0.08 },
    rival: { p: 0.2, lead: 0.1, from: 4, cost: 5, cut: 15 },
    cost: { test: 2, repair: 3, care: 2, toner: 1, weekend: 8, sap: 10, fusion: 12, daily: 1 },
    fault: { inpack: 0.40, auspack: 0.15, other: 0.04 },
    visit: { tesla: 0.55, duo: 0.6, italienHour: 0.30, italienMax: 3, itEven: 0.85, itOdd: 0.25, ahnungslos: 0.5, altwerk: 0.5, glueck: 0.08 },
    flur: 0.35, bingoScore: 50, tiramisu: 0.15,
    // v0.4: Markt im Controlling, Prognose im Leitstand, SAP-Hotline, Titel »Werk des Jahres«
    markt: { n: 3, lo: 0.8, hi: 1.3, lizenzen: 3 },
    prognose: { band: 0.06, hit: 4, hitImage: 2, miss1: 1, miss2: 3, melone: 3, meloneP: 0.35, meloneMinus: 6 },
    hotline: { p: 0.5, min: 30, max: 60 },
    titel: { kpi: 90, image: 75, score: 300 },
    // v0.5: Ausschreibung (Gebote bis Mittwoch 15:00 gegen Werk Nord), zweiter Siegpfad »Vorzeigewerk«, Kopfhörer
    auktion: { from: 2, close: 15 * 60, bids: [0.8, 1, 1.3], nordLo: 0.75, nordHi: 1.25, drift: 0.3, pakete: 2 },
    audit: { from: 15, kpi: 65, image: 87, mods: 3, streak: 1, score: 700 },
    kopf: { schicht: 1, min: 2 },
    weekendFam: 13,
    // v0.5 Süßigkeitenbox: einmal pro Woche auffüllen (Kantinen-Kiosk), 6 Stück, Verbrauch 1 bis 2 am Tag, das letzte Stück nimmt niemand
    suess: { from: 3, stk: 6, cost: { schoko: 3, gummi: 2, lakritz: 1 }, beschwer: 0.5, schichtGut: 1, schichtLeer: 1, chefGut: 1, zeit: 10, egg: 3 },
    elon: { thema: 8, nein: 0.2, neinMin: 4, meet: 0.25, meetMin: 3, meetEnergie: 2, egg: 8, akkuDay: 15 },
    // Überstunden: Familie −over/div; ab »frei« Minuten mindestens »min« (das Abendessen ist dann kalt)
    ueber: { div: 20, frei: 15, min: 0, spaet: 1.2, rest: 6 },
    meet: { gain: 8, step: 2, cap: 80, quotaMin: 90, quotaPen: 1, spiral: 0.35, spiral2: 0.5, testFactor: 0.75, reqDouble: 0.35 }
  };
  SC.KPI = {
    names: { oee: 'OEE', ausschuss: 'Ausschuss', durchsatz: 'Durchsatz', liefer: 'Liefertreue' },
    unit: { oee: ' %', ausschuss: ' %', durchsatz: ' (Index)', liefer: ' %' },
    start: { oee: 62, ausschuss: 5.5, durchsatz: 100, liefer: 86 },
    ziel: { oee: 77, ausschuss: 3.0, durchsatz: 112, liefer: 94 },
    mod: {
      oee: { bde: 7, auftrag: 3, trace: 2, qs: 2, erp: 1, fusion: 2 },
      ausschuss: { qs: -1.5, trace: -0.8, bde: -0.5, fusion: -0.2 },
      durchsatz: { bde: 5, auftrag: 4, fusion: 3, qs: 2, erp: 1 },
      liefer: { auftrag: 4, erp: 3, trace: 1, bde: 1, fusion: 1 }
    },
    down: { oee: -1.2, ausschuss: 0.15, durchsatz: -2, liefer: -0.8 }
  };
  // Nutzlose Meetings des Schichtleiters
  SC.USELESS = [
    'Abstimmung zur Abstimmung', 'Vorbesprechung zum Jour fixe', 'Lessons Learned zum letzten Lessons Learned',
    'Kurzer Austausch (90 Folien)', 'Rundgang: Wo steht der Feuerlöscher?', 'Sync zum Schichtübergabe-Sync',
    'Brainstorming: neue Farbe für die Pausenraumtür', 'Kick-off zum Kick-off', 'Workshop: Effizientere Meetings',
    'Klärung der Klärungspunkte', 'Infoveranstaltung: Neue Kaffeemaschine', 'Arbeitskreis Arbeitskreise',
    'Gemeinsames Anschauen der Excel-Liste am Beamer'
  ];
  SC.USEFUL = [
    { title: 'Requirements-Workshop mit der Qualität', eff: 'req' },
    { title: 'Spezifikations-Review mit der IT', eff: 'spec' },
    { title: 'Testplanung mit der Linie', eff: 'test' }
  ];
  SC.TIPS = [
    'Die Kantinenkraft: »Der Schichtleiter freut sich über jedes Meeting, zu dem man kommt. Er zählt aber auch die, zu denen man nicht kommt.«',
    'Ein Instandhalter: »Der Server in Rack 4 schmiert ab, wenn keiner nach ihm schaut. Wie ich.«',
    'Eine Kollegin aus dem Einkauf: »Die Werkleitung liest jeden Tag die Excel-Liste. Jeden. Tag.«',
    'Der Azubi: »Ohne ausgedruckte Spezifikation unterschreibt die Werkleitung gar nichts.«',
    'Die Kantinenkraft: »Nach dem Mittagessen geht alles schneller, glauben Sie mir.«',
    'Ein Bediener: »Testläufe gehen nur, wenn die Testumgebung den aktuellen Stand hat.«',
    'Die Instandhaltung: »Der Automat mag keine Etiketten, die schief sind. Und keine, die gerade sind.«',
    'Ein Bediener: »Wenn du mit dem Schichtleiter den Schichtplan abstimmst, kriegst du die Linie. Ganz ohne Meeting.«',
    'Die Controlling-Abteilung (im Vorbeigehen): »Die Tranche gibt es einmal pro Woche. Wer nicht fragt, kriegt nix.«',
    'Die Kantinenkraft: »Heute Schnitzel. Morgen auch. Das ist kein Fehler, das ist ein Prozess.«'
  ];
  // Pyramiden-Fragen der IT-Chefin: a = richtige Ebene (Index in SC.PYR)
  SC.PYRAMID_Q = [
    { q: 'Die Lichtschranke am Förderband der Außenverpackung: auf welcher Ebene?', a: 0 },
    { q: 'Die SPS der Extrusion: auf welcher Ebene?', a: 1 },
    { q: 'Die Bediener-Visualisierung am Leitstand: auf welcher Ebene?', a: 2 },
    { q: 'Und wo, Christian, sitzt das MES?', a: 3 },
    { q: 'Die Auftragsfeinplanung für DEA und DEC: auf welcher Ebene?', a: 3 },
    { q: 'Die Finanzbuchhaltung: auf welcher Ebene?', a: 4 },
    { q: 'Die Betriebsdatenerfassung am Etikettierer: auf welcher Ebene?', a: 3 },
    { q: 'Der Notaus-Taster der Sterilisation: auf welcher Ebene?', a: 0 }
  ];
  SC.VISIT_TEXT = {
    tesla: [
      'Wusstest du, dass man beim Tesla die Scheibenwischer per Update verbessern kann? Bei meinem Staubsauger geht das leider nicht.',
      'Ich hab ausgerechnet: Mit dem Tesla wäre ich heute 4 Minuten früher hier gewesen. Wenn Ladesäule 1 frei gewesen wäre.',
      'Der neue Tesla kann angeblich allein einparken. Ich überlege, ob er auch allein in Meetings gehen kann.',
      'Reichweite im Winter, Christian. Darüber muss man reden. Jetzt. Ausführlich.'
    ],
    duo: [
      'Der Kollege aus dem Nachbarbüro steht daneben, nickt und sagt: »Genau.« Dann: »Ich muss gleich wieder rüber, ich arbeite ja eh zu viel.« Er bleibt bis zum Schluss.',
      'Der Kollege aus dem Nachbarbüro ergänzt: »Und die Hupe kann Geräusche machen.« Beide lachen eine Minute lang. Er sagt, das sei seine erste Pause seit Wochen.',
      'Der Kollege aus dem Nachbarbüro hält einen Kaffee. Es ist sein dritter. »Ich komme vor lauter Arbeit zu nichts«, sagt er und trinkt in aller Ruhe aus.'
    ],
    italien: [
      'Meine Nonna hat am Sonntag die Soße vier Stunden gekocht. Vier! Ich hab ein Foto. Und noch eins. Und ein Video.',
      'In meinem Dorf gibt es eine Bäckerei, die backt seit 1890 dasselbe Brot. Nie ein Update. Nie ein Absturz.',
      'Weißt du, warum Espresso so klein ist? Damit man öfter Pause machen kann. Ich hab dir einen mitgebracht.',
      'Mein Onkel hat einmal einen Käse so groß wie ein Autoreifen gemacht. Das Dorf hat drei Tage gefeiert.',
      'Christian, hast du schon gegessen? Bei uns sagt man: Erst essen, dann Pyramide.'
    ],
    itchefin: [
      'Und jetzt kurz zur Pyramide.',
      'Christian! Gut, dass ich dich treffe. Ich hab die Pyramide dabei.',
      'Wo waren wir? Genau: Ebene drei.',
      'Ich will dich nicht aufhalten. Nur eine Frage zur Pyramide.',
      'Ich hab die Pyramide neu ausgedruckt. In Farbe.'
    ],
    ahnungslos: [
      'Ein Kollege aus dem Vertrieb: »Ist das MES das mit Excel? Oder ist Excel das MES?«',
      'Eine Kollegin aus dem Marketing: »Kann das MES auch Instagram?«',
      'Ein Kollege aus dem Einkauf: »Wenn das MES fertig ist, brauchen wir dann noch Strom?«',
      'Ein Kollege aus der Buchhaltung: »Ich hab gehört, das MES macht alles automatisch. Auch Meetings?«'
    ],
    altwerk: [
      'Der Kollege vom Altwerk: »Bei uns hieß das Feld aber Artikelnummer_neu_2.«',
      'Der Kollege vom Altwerk: »Wir hatten auch ein MES. Also, eine Excel-Liste. Mit Makros!«',
      'Der Kollege vom Altwerk: »Unsere Pyramide war aber vier Ebenen hoch.«'
    ]
  };
  SC.ITALIEN_KURZ = [
    'Bald mach ich euch allen Bruschetta. Versprochen!', 'Hab ich dir schon von der Hochzeit meiner Cousine erzählt? 400 Gäste. Drei Tage.',
    'Christian, der Kaffee hier ist kein Kaffee. Morgen bring ich echten mit.', 'In Italien hätte die Extrusion längst Mittagspause.',
    'Meine Mama sagt, ein MES ist wie ein Ragù: braucht Zeit.', 'Weißt du, wie man Pasta richtig kocht? Ich erklär es dir später. Ausführlich.'
  ];
  SC.PACKER_FAULTS = [
    'Verpackungsautomat: »Fehler 17: Etikett klebt am Falschen.«',
    'Verpackungsautomat: Folienriss. Wieder.',
    'Verpackungsautomat: Die Kartons kommen jetzt hochkant raus. Niemand weiß warum.',
    'Verpackungsautomat: Display zeigt »Bitte warten«. Seit 40 Minuten.',
    'Verpackungsautomat: Er piept. Nicht wegen eines Fehlers, sagt er. Einfach so.'
  ];

  // v0.3 »Flurfunk«: Sprechblasen der Figuren im Gebäude (rein kosmetisch, höchstens 40 Zeichen)
  SC.BUBBLES = {
    schicht: ['Hast du kurz?', 'Kleines Meeting gleich?', 'Ich lad dich mal ein.', 'Wichtig. Glaub ich.', 'Nur fünf Minuten!', 'Termin folgt!'],
    tesla: ['0 auf 100 in 3,1!', 'Reichweite, Christian!', 'Update über Nacht!', 'Der parkt allein ein.', 'Hast du das Video gesehen?', 'Der Milliardär würde das anders machen!', 'Mars, Christian, Mars!'],
    nachbar: ['Genau.', 'Bin gleich bei dir.', 'Erst mal Kaffee.', 'Ich arbeite eh zu viel.', 'Ich warte auf Rückmeldung.', 'Bei mir brennt die Hütte!'],
    italien: ['Mamma mia, die Pasta!', 'Heute Bruschetta!', 'Espresso? Espresso.', 'In Italien ist jetzt Pause.', 'Meine Nonna sagt ...'],
    itchefin: ['Ebene 3!', 'Denk an die Pyramide!', 'Feld, Steuerung, ...', 'Wo ist das MES? Na?', 'Ich hab Folien dabei.']
  };
  // Flurfunk: kleine Zufallsereignisse mit zwei Optionen (lang/kurz). Effekte bewusst klein.
  SC.FLUR = [
    { id: 'brandschutz', who: 'Der Brandschutzbeauftragte', text: 'Brandschutzübung! Alle raus auf den Parkplatz. Der Pförtner zählt durch und kommt jedes Mal auf eine andere Zahl.',
      opts: [{ label: 'Brav mitgehen (15 Min.)', min: 15, energy: 4, schicht: 2, msg: 'Frische Luft am Sammelplatz. Die Schicht sieht dich dort und findet das solidarisch (+2).' },
        { label: 'Tür zu, weiterarbeiten (2 Min.)', min: 2, energy: -2, msg: 'Der Brandschutzbeauftragte notiert: »Büro, 2. OG: verbrannt.« Nur auf dem Papier.' }] },
    { id: 'beamer', who: 'Ein Kollege aus der Buchhaltung', text: 'Der Beamer im Besprechungsraum geht nicht. Hast du ein HDMI-Kabel? Oder VGA? Oder das andere?',
      opts: [{ label: 'Adapter suchen helfen (12 Min.)', min: 12, energy: 0, schicht: 2, msg: 'Im Moderationskoffer liegen 14 Adapter. Keiner passt. Der fünfzehnte schon. Der Schichtleiter ist dir dankbar (+2).' },
        { label: '»Ich hab nur USB-C.« (2 Min.)', min: 2, energy: -1, msg: 'Er nickt verständnisvoll und fragt, ob es das auch als VGA gibt.' }] },
    { id: 'ueberraschung', who: 'Die Kantinenkraft', role: null, text: 'Gericht des Tages: »Überraschung«. Die Kantinenkraft zwinkert. Sie zwinkert sonst nie.',
      opts: [{ label: 'Probieren (10 Min.)', min: 10, energy: 5, msg: 'Es ist Currywurst. Die Überraschung ist die Soße: Mango. Energie +5.' },
        { label: 'Lieber nicht (1 Min.)', min: 1, energy: -1, msg: 'Du wirst nie erfahren, was es war. Die Kantinenkraft auch nicht.' }] },
    { id: 'entkalkt', who: 'Die Instandhaltung', text: 'Die Kaffeemaschine wurde entkalkt. Der Kaffee schmeckt jetzt nach nichts. Die Instandhaltung: »Das ist der Geschmack von Sauberkeit.«',
      opts: [{ label: 'Trotzdem trinken (8 Min.)', min: 8, energy: 4, msg: 'Schmeckt nach nichts, wirkt aber. Energie +4.' },
        { label: 'Wasser aus dem Büro (2 Min.)', min: 2, energy: -1, msg: 'Wasser. Das MES-Projekt wird dadurch nicht schneller, aber du hydrierst.' }] },
    { id: 'ausflug', who: 'Die Personalabteilung', text: 'Umfrage zum Betriebsausflug: Kanu, Kletterwald oder Führung durchs eigene Werk? Bisher haben alle »egal« angekreuzt.',
      opts: [{ label: 'Ausführlich ausfüllen (10 Min.)', min: 10, energy: 2, msg: 'Du kreuzt »Kanu« an und schreibst eine Begründung. Es wird die Werksführung. Wie jedes Jahr.' },
        { label: '»Egal« ankreuzen (1 Min.)', min: 1, energy: -1, msg: 'Ergebnis der Umfrage: 100 % »egal«. Die Personalabteilung wertet das als Zustimmung.' }] },
    { id: 'stapler', who: 'Der Tesla-Kollege', role: 'tesla', text: 'Der Tesla-Kollege zeigt dir ein Video vom Parkplatz: Ein Gabelstapler parkt rückwärts ein. Ganz allein. Fast.',
      opts: [{ label: 'Video anschauen (8 Min.)', min: 8, energy: 4, msg: 'Der Stapler parkt rückwärts ein. Dann parkt er die Mülltonne aus. Ihr lacht beide. Energie +4.' },
        { label: '»Schick es mir.« (1 Min.)', min: 1, energy: -1, msg: 'Er schickt es dir. Und drei weitere. Und eine Sprachnachricht.' }] },
    { id: 'torte', who: 'Die IT-Chefin', role: 'itchefin', text: 'Die IT-Chefin hat die Automatisierungspyramide als Torte bestellt. Für den Geburtstag der Werkleitung. Sie sucht jemanden zum Probe-Essen von Ebene 2.',
      opts: [{ label: 'Probe-Essen (10 Min.)', min: 10, energy: 6, msg: 'Ebene 2 (Leitebene) ist Marzipan. Ebene 3 (MES) ist noch nicht fertig. Natürlich. Energie +6.' },
        { label: '»Ich bin schon satt.« (1 Min.)', min: 1, energy: -1, msg: '»Schade. Dann bekommst du Ebene 0, das ist nur der Teller.«' }] },
    { id: 'meetingmeeting', who: 'Der Schichtleiter', role: 'schicht', text: 'Der Schichtleiter sammelt Unterschriften: Er will ein Meeting über die Abschaffung unnötiger Meetings ansetzen.',
      opts: [{ label: 'Unterschreiben (5 Min.)', min: 5, energy: 0, schicht: 3, msg: 'Er strahlt. Das Meeting dazu ist nächste Woche, Dauer 90 Minuten. Schichtleiter +3.' },
        { label: 'Freundlich ablehnen (1 Min.)', min: 1, energy: 0, schicht: -2, msg: '»Verstehe. Dann besprechen wir das im Meeting.« Schichtleiter −2.' }] },
    { id: 'passwort', who: 'Die IT (Rundmail)', text: 'Pflicht für alle: Passwort ändern. Mindestens 16 Zeichen, ein Sonderzeichen, ein Emoji und keins der letzten 40.',
      opts: [{ label: 'Sofort ändern (8 Min.)', min: 8, energy: -1, msg: 'Geschafft. Du hast es auf einen Zettel geschrieben, den du unter die Tastatur legst. Sicherheit!' },
        { label: '»Morgen erinnern« (1 Min.)', min: 1, energy: 0, msg: 'Morgen erinnert es dich. Und übermorgen. Und in jedem Meeting am Beamer.' }] },
    { id: 'app', who: 'Der Azubi', text: 'Der Azubi fragt, ob er die Excel-Liste »mal schnell« in eine App umziehen darf. Mit Dark Mode.',
      opts: [{ label: 'Geduldig erklären, warum nicht (10 Min.)', min: 10, energy: 1, msg: 'Du erklärst den SVERWEIS. Er schaut dich an, als hättest du Excel erfunden. Aber er hört zu.' },
        { label: '»Frag die Werkleitung.« (1 Min.)', min: 1, energy: -1, msg: 'Die Werkleitung findet die Idee gut und beauftragt dich. Für 2031.' }] }
  ];
  // Buzzword-Bingo der Werkleitung (Running Gag, nur Punkte)
  SC.BUZZ = ['Synergie', 'agil', 'Quick Win', 'Rollout', 'Low-Hanging Fruit', 'Leuchtturmprojekt', 'Mehrwert', 'Digitalisierung'];
  SC.BINGO_NEED = 5;
  // Werksdurchsagen (einmal am Tag) und Schlagzeilen der Werkszeitung (Abendbilanz)
  SC.DURCHSAGEN = [
    'Der Fahrer des roten Gabelstaplers mit dem Kennzeichen »Bitte nicht berühren« möge sich an der Pforte melden.',
    'Die Kantine ist heute bis auf Weiteres geöffnet. Wir bitten um Verständnis.',
    'Der Notausgang West ist ab sofort wieder ein Notausgang. Bitte die Paletten entfernen.',
    'Glückwunsch an die Extrusion: drei Tage ohne Folienstau! Der Rekord liegt bei vier.',
    'Das Meeting zur Reduzierung von Durchsagen fällt aus. Wegen zu vieler Durchsagen.',
    'Wer hat den Tacker aus der Werkleitung? Er wird vermisst. Bitte keine Fragen stellen, einfach zurückbringen.',
    'Probealarm der Sirene. Bitte nicht in Panik verfallen. Der Schichtwechsel ist wie immer um 14:00.',
    'Parkplatz P3 wird heute neu markiert. Bitte nicht auf den frischen Linien parken. Wie gestern.'
  ];
  SC.SCHLAGZEILEN = [
    'Verpackungsautomat als »Mitarbeiter des Monats« nominiert. Er war am häufigsten im Gespräch.',
    'Studie: Neun von zehn Meetings hätten eine Mail sein können. Die zehnte war eine Mail.',
    'IT-Chefin lässt die Pyramide auf die Kantinentabletts drucken. Ebene 3 liegt unter dem Schnitzel.',
    'Excel-Liste überschreitet 1.000 Zeilen. Die Werkleitung gratuliert per Excel-Liste.',
    'Instandhaltung findet einen Kabelbinder von 1998. Er hält noch.',
    'Tesla-Kollege fährt jetzt mit dem Rad. Er redet trotzdem über Reichweite.',
    'Italienischer Kollege bringt Tiramisu mit. Die Werkleitung beruft eine Sondersitzung ein.',
    'Drucker druckt 62 Seiten ohne Stau. Experten sind ratlos, der Drucker schweigt.',
    'Schichtleiter plant den meetingfreien Freitag. Kick-off ist am Montag.',
    'Werk Süd führt jetzt auch eine Excel-Liste. Sie hat 48 Spalten. Eine mehr als unsere.'
  ];
  SC.SCHORNSTEIN = [
    'Der Schornstein raucht. Laut Werkleitung ist das »Digitalisierung, die man sieht«.',
    'Aus dem Schornstein kommt heute eine Rauchwolke in Form einer Pyramide. Die IT-Chefin hat ein Foto gemacht.',
    'Der Schornstein ist denkmalgeschützt. Das MES leider nicht.'
  ];

  // v0.3 Pflicht-Ereignisse: Kaffeeautomat, Kreis-Pyramide, Morse-Rätsel, Kostümparty
  SC.KOSTUEME = [
    { label: 'Pappe-Pyramide (50 Min.)', min: 50, energy: -4, chef: 3, msg: 'Du kommst als Automatisierungspyramide. Die IT-Chefin weint vor Rührung. Die Werkleitung findet es »strategisch« (+3).' },
    { label: 'Kaffeemaschine »Fehler 42« (40 Min.)', min: 40, energy: 4, schicht: 2, msg: 'Du piepst den ganzen Abend und gibst niemandem Kaffee. Die Schicht feiert dich (+2). Irgendwie erholsam.' },
    { label: 'Verpackungsautomat aus Karton (45 Min.)', min: 45, energy: -2, schicht: 3, chef: -1, msg: 'Alle zehn Minuten fällt dein Kostüm auseinander. Die Instandhaltung repariert es mit Kabelbinder. Riesenapplaus.' },
    { label: 'Schornstein mit Wattewolke (45 Min.)', min: 45, energy: -2, chef: 2, family: 1, msg: 'Die Werkleitung fotografiert dich für die Werkszeitung (+2). Zuhause hängt das Foto am Kühlschrank.' },
    { label: 'Ladesäule mit Kabel (35 Min.)', min: 35, energy: 2, schicht: 3, chef: -2, msg: 'Der Tesla-Kollege lädt sich den ganzen Abend an dir auf. Ihr seid das Duo des Abends.' },
    { label: 'Gar nicht, Hemd wie immer (15 Min.)', min: 15, energy: 0, chef: -3, family: 1, msg: 'Du kommst als Christian. Verkleidungspflicht verletzt, die Werkleitung notiert es (−3). Dafür bist du früh daheim.' }
  ];
  SC.PARTY_GAESTE = 'Der Schichtleiter kommt als Wandkalender (alle Tage voller Meetings). Der Tesla-Kollege kommt als Reichweitenanzeige. Der Kollege aus dem Nachbarbüro kommt als Überstundenzettel. Er sagt, das Kostüm sei autobiografisch. Gebastelt hat er es in der Arbeitszeit. Der italienische Kollege kommt als Pizza Margherita. Die IT-Chefin kommt als Kreis. Die Werkleitung kommt als Gantt-Diagramm.';
  SC.PARTY_BUBBLES = { schicht: ['Ich bin ein Kalender!', 'Termin um 17:00!'], tesla: ['Reichweite: 100 %!', 'Ich bin geladen!'], nachbar: ['Ich arbeite zu viel!', 'Kostüm: Überstunden.'], italien: ['Ich bin eine Pizza!', 'Margherita, bitte!'], itchefin: ['Industrie 5.0!', 'Ich bin ein Kreis.'] };
  // Running Gags
  SC.IMMER = ['Das hatten wir schon immer so.', 'Haben wir schon immer so gemacht.', 'Das war schon immer so, Christian.'];
  SC.DRUCKER_FEHLER = [
    ['Der Drucker meldet: »Papierformat unbekannt (A4)«.', 'Der Drucker meldet: »Toner fast leer« (seit 2019).', 'Der Drucker meldet: »Bitte Klappe C schließen«. Es gibt keine Klappe C.'],
    ['Der Drucker meldet: »Fehler 49.4C02: Drucker hat schlechte Laune«.', 'Der Drucker meldet: »Ihr Druckauftrag ist mir egal«.', 'Der Drucker druckt eine Testseite. Darauf steht nur: »Warum?«'],
    ['Der Drucker meldet: »SAP-Cutover erkannt. Drucker geht in den Widerstand.«', 'Der Drucker meldet: »Materialnummer für Papier nicht gefunden (neues SAP)«.', 'Der Drucker meldet auf Latein: »Memento mori«. Dann piept er dreimal.']
  ];

  // v0.3 aus Sender-Chef übertragen: aktive Rivalen mit Image, Zusagen an die Werkleitung
  SC.RIVAL_EVT = [
    { who: 'Werk Nord (Anruf aus der Personalabteilung)', text: 'Werk Nord wirbt einen erfahrenen Bediener der Extrusion ab. Mit Dienstwagen. Ohne ihn werden die Testläufe drei Tage lang zäh.',
      gegen: 'Bediener mit Zulage halten ({k} k€, 10 Min.)', hin: 'Ziehen lassen (Testläufe 3 Tage deutlich langsamer)' },
    { who: 'Werk Süd (Flurfunk aus dem Vorstand)', text: 'Werk Süd erzählt dem Vorstand, Werk Mitte habe »noch nicht mal eine Excel-Liste«. Die Werkleitung hat es gehört.',
      gegen: 'Gegendarstellung mit KPI-Folien ({k} k€ Grafikagentur, 10 Min.)', hin: 'Ignorieren (Werkleitung −5, Image −7, nächste Tranche −{t} k€)' }
  ];
  SC.ZUSAGE = [
    { id: 'kurz', label: 'Zusage »kurz«: 1 Modul in 4 Tagen', need: 1, days: 4, praemie: 10, chef: 4, image: 3, strafe: 8, chefMinus: 6, imageMinus: 5 },
    { id: 'mittel', label: 'Zusage »mittel«: 2 Module in 8 Tagen', need: 2, days: 8, praemie: 20, chef: 6, image: 4, strafe: 15, chefMinus: 8, imageMinus: 6 },
    { id: 'lang', label: 'Zusage »lang«: 3 Module in 12 Tagen', need: 3, days: 12, praemie: 28, chef: 8, image: 5, strafe: 20, chefMinus: 10, imageMinus: 8 }
  ];
  // v0.4 Markt im Controlling: jeden Tag drei Angebote (eigener Zufallsstrom), höchstens ein Kauf am Tag
  // sell: true = Christian verkauft etwas und bekommt Geld
  SC.MARKT = [
    { id: 'paket', label: 'Berater-Tagespaket (1 Paket Requirements/Spezifikation)', short: 'Berater-Paket', base: 15, msg: 'Ein Berater kommt für einen Tag. Er bringt Folien und tatsächlich ein Arbeitspaket mit.' },
    { id: 'teile', label: 'Ersatzteile für den Verpackungsautomaten (3 Tage Reparatur 2 k€)', short: 'Ersatzteile', base: 8, msg: 'Ersatzteile im Lager: Reparaturen kosten heute und die nächsten zwei Tage nur 2 k€. Die Instandhaltung streichelt die Kiste.' },
    { id: 'lizenz', label: 'Alte MES-Lizenz von 2009 verkaufen (noch in Folie, Image −1)', short: 'Lizenz 2009 verkaufen', base: 14, sell: true, msg: 'Ein Werk in Übersee kauft die Lizenz von 2009. Die Werkleitung fragt nicht, warum wir die noch hatten.' },
    { id: 'kampagne', label: 'Imagekampagne der Agentur »Synergie & Söhne« (Image +4)', short: 'Agentur-Kampagne', base: 15, msg: 'Die Agentur dreht ein Video: Drohnenflug über den Parkplatz, dazu »Wir sind Industrie 4.0«. Image +4.' },
    { id: 'presse', label: 'Pressemitteilung über die Nachrichtenagentur (Image +2, Werkleitung +2)', short: 'Pressemitteilung', base: 6, msg: 'Die Agenturmeldung: »Werk Mitte führt MES ein.« Wieder. Die Werkleitung schneidet sie trotzdem aus (+2).' },
    { id: 'toner', label: 'Toner auf Vorrat (3 Tage weniger Papierstau)', short: 'Toner', base: 4, msg: 'Zwölf Tonerkartuschen. Der Drucker wirkt eingeschüchtert.' },
    { id: 'wartung', label: 'Wartungsvertrag für Rack 4 (3 Tage weniger Abstürze)', short: 'Wartungsvertrag Rack 4', base: 7, msg: 'Ein Techniker klebt einen Aufkleber »gewartet« auf Rack 4. Es scheint zu helfen.' }
  ];
  // v0.4 Running Gag: Reichweitenanzeige des Tesla-Kollegen (sinkt jeden Tag, er lädt trotzdem nie)
  SC.TESLA_KM = d => Math.max(12, 430 - 11 * d);
  // v0.5 Running Gag: Der Tesla-Kollege ist großer Fan eines Raketen-Milliardärs (früher beim Namen genannt, seit early-access nur noch umschrieben). Nur vage Umschreibungen in seinen eigenen Worten,
  // klar als seine Übertreibung, keine Zitate und keine Behauptungen über die reale Person, nichts Politisches.
  SC.ELON = [
    'Der Chef vom Elektroauto-Konzern würde bestimmt sagen, Meetings sind ineffizient. Glaube ich. Oder hab ich das geträumt?',
    'Der Raketen-Milliardär würde dieses Werk in zwei Wochen hochziehen. Höchstens. Behaupte ich jetzt mal.',
    'Wenn es nach mir ginge, fliegt das Werk bald zum Mars. Der Raketen-Milliardär fände das bestimmt super.',
    'Ich stelle mir vor, der Chef vom Elektroauto-Konzern würde gerade wieder irgendwas Großes posten. Was genau, weiß ich nicht, aber ich bin jetzt schon begeistert.',
    'Ich wette, der Raketen-Milliardär hätte das MES längst eingeführt. Mit einem einzigen Knopf.',
    'Wäre der Chef vom Elektroauto-Konzern hier Werkleiter, gäbe es keine Schichtleiter-Meetings. Glaube ich. Hoffe ich.',
    'Ich stelle mir vor, der Raketen-Milliardär würde die Kantine in eine Rakete verlegen. Currywurst in der Schwerelosigkeit!',
    'Ich wette, der Chef vom Elektroauto-Konzern würde den Gabelstapler allein fahren lassen. Also noch alleiner.',
    'Ich hab dir einen Link zu irgendwas mit dem Raketen-Milliardär geschickt. Nicht geöffnet? Ich erzähl es dir, so ungefähr.',
    'Ich bin sicher, der Chef vom Elektroauto-Konzern fände, Reichweite ist Einstellungssache. So ungefähr jedenfalls.'
  ];
  // v0.6 kleine Gags ohne Spielwirkung
  SC.PAPPE = [
    'Der Pappkamerad mit deinem Gesicht sitzt auf deinem Stuhl. Ein Kollege grüßt ihn. Seine Haltung ist besser als deine.',
    'Der Schichtleiter hat den Pappkameraden zu einem Meeting eingeladen. Er kommt nicht. Die Einladung schon.',
    'Jemand hat dem Pappkameraden einen Kaffee hingestellt. Er hat ihn nicht angerührt. Disziplin.',
    'Der Pappkamerad trägt jetzt einen Besucherausweis. Gültig bis Go-Live.',
    'Die IT-Chefin hat dem Pappkameraden eine Pyramide in die Hand gedrückt. Er hält sie richtig herum.'
  ];
  SC.PAPPE_EGG = 'Der Pappkamerad hat den besten Terminkalender im Werk: leer. Die Werkleitung fragt, ob er befördert werden kann.';
  SC.AUFZUG = [
    'Du drückst den Aufzugknopf. Der Aufzug ist schon da. Er war immer schon da.',
    'Der Aufzug denkt nach. Dann fährt er in den Keller, den es nicht gibt.',
    'Im Aufzug hängt ein Zettel: »Max. 8 Personen oder 1 Schichtleiter-Meeting.«',
    'Aufzugmusik: die Warteschleife der SAP-Hotline, als Jazz.',
    'Der Knopf leuchtet. Mehr passiert nicht. Wie beim letzten MES.',
    'Jemand hat einen Aufkleber angebracht: »Ebene 2,5: Middleware«.'
  ];
  SC.AUFZUG_EGG = 'Die Tür geht auf, und du stehst im Aufzug-Studio: Scheinwerfer, ein Mikrofon, ein Publikum aus Paletten. »Heute zu Gast: niemand. Wir haben nur Zeit bis Ebene drei.«';
  SC.FAX = [
    'Du faxt der Werkleitung den Projektstand. Antwort per Fax: »Bitte per Mail.«',
    'Das Fax-Gerät piept, kreischt und druckt dann ein Fax von 2009: »Lastenheft folgt.«',
    'Du faxt Werk Nord einen Glückwunsch. Zurück kommt eine Folie. Folie 38 von 40.',
    'Das Fax-Gerät meldet »Papierstau«. Der Drucker daneben fühlt sich verstanden.'
  ];
  SC.FAX_ELON = 'Du versuchst, das Milliardärs-Abo des Tesla-Kollegen per Fax zu kündigen. Rückmeldung: »Empfänger unbekannt.« Das Abo läuft weiter, behauptet er jedenfalls.';
  SC.FAX_EGG = 'Werk Nord faxt eine Entschuldigung für alle Ausschreibungen, vergangene und künftige. Auf Folie 39. Folie 40 fehlt. Das Fax-Gerät wird ab heute im Archiv geführt.';
  // v0.7 Abreißkalender im Schichtleiter-Büro (je Tag ein Blatt), Abschluss-Gag im Endbildschirm, Saison-Süßigkeit
  SC.KALENDER = [
    'Spruch des Tages: »Ein Meeting am Tag hält den Fortschritt fern.«',
    'Spruch des Tages: »Wer plant, hat mehr Termine.«',
    'Heute vor 7 Jahren: Kick-off des MES. Heute: Kick-off zum Kick-off.',
    'Spruch des Tages: »Die Schicht ist das Ziel.« Darunter, handschriftlich: »Und Kuchen.«',
    'Heute ist Tag der offenen Tür. Gemeint ist die Tür zum Besprechungsraum.',
    'Spruch des Tages: »Gut geplant ist halb gewonnen.« Jemand hat »gewonnen« durchgestrichen und »vertagt« darübergeschrieben.',
    'Der Kalender ist von 2019. Der Schichtleiter sagt, die Wochentage stimmen wieder.',
    'Spruch des Tages: »Zuhören ist auch Arbeit.« Gefaltet zu einem Hut.'
  ];
  SC.ABSCHLUSS = {
    win: ['Der Pappkamerad lässt ausrichten: Er hat das alles schon gewusst.', 'Der Pförtner stempelt dich aus und sagt: »Viertes MES. Das erste, das bleibt.«', 'Der Schichtleiter lädt zum Abschluss-Meeting. Diesmal gehst du gern hin. Es gibt Kuchen.'],
    lose: ['Der Pappkamerad übernimmt dein Büro. Keiner merkt den Unterschied, sagt die Werkleitung.', 'Der Pförtner: »Das MES hab ich schon dreimal gehen sehen. Jetzt viermal.«', 'Der Tesla-Kollege meint, der Chef vom Elektroauto-Konzern hätte das bestimmt anders gemacht. Er weiß nur nicht, wie.']
  };
  // v0.8 Gags ohne Spielwirkung (Salze 32000+, 32100+, 32200+)
  SC.AUSHANG = [
    'Gefunden: ein Schlüssel zu Raum 4.17. Raum 4.17 gibt es nicht.',
    'Ladesäule 1 ist belegt. Vom selben Auto seit Dienstag.',
    'Die Stempeluhr geht 4 Minuten vor. Der Schichtleiter sagt: Absicht.',
    'Wegen Umbau ist der Umbau bis auf Weiteres geschlossen.',
    'Fahrgemeinschaft zu Parkplatz B gesucht. Es ist derselbe Weg.'
  ];
  SC.DIAGRAMM = [
    'Das Diagramm zeigt heute eine Linie. Sie geht nach oben, wenn man die Achse dreht.',
    'Die Ampel ist grün. Sie war nie anders. Auch nachts nicht.',
    'Neue Kennzahl: Kennzahlen pro Kennzahl.'
  ];
  SC.WOCHENEND_GAG = [
    'Der Pappkamerad hat am Wochenende Schicht. Ohne Zuschlag, aber mit Haltung.',
    'Im Büro brennt noch Licht. Es ist der Beamer.'
  ];
  SC.SAISON = 'Am Kiosk gibt es schon Lebkuchen. Seit September. Niemand weiß, ob das zu früh oder zu spät ist.';
  SC.ELON_AKKU = 'Ich lade inzwischen dauernd Posts vom Raketen-Milliardär. Den Akku leider nicht.';
  SC.ELON_THEMA = [
    '»Und wie ist der Reifendruck?« Er redet zwei Minuten über Reifen. Der Raketen-Milliardär kommt darin nur einmal vor.',
    '»Gibt es heute Kuchen in der Kantine?« Er vergisst den Chef vom Elektroauto-Konzern. Für drei Sekunden.',
    '»Wie weit kommst du heute noch?« Er schaut aufs Display, wird still und wechselt das Thema selbst.'
  ];
  SC.ELON_THEMA_NEIN = 'Du versuchst es mit dem Wetter. Er: »Apropos Wetter, der Raketen-Milliardär ...« Das dauert jetzt länger.';
  SC.ELON_MEETING = 'Der Tesla-Kollege sitzt mit im Meeting und erklärt bei jedem Punkt, was der Chef vom Elektroauto-Konzern an dieser Stelle angeblich anders machen würde.';
  SC.ELON_EGG = 'Milliardärs-Zähler {n}: Der Tesla-Kollege hat dir ein Abo für seine tägliche Milliardärs-Zusammenfassung eingerichtet. Mit Reichweitenangabe. Kündigen geht nur per Fax.';
  // v0.4 SAP-Hotline (Büro, nur während der Migration): Warteschleife mit Ansage
  SC.HOTLINE = [
    'Ihr Anruf ist uns wichtig. Sie sind Nummer 47 in der Warteschleife. Bitte halten Sie Ihre Materialnummer bereit.',
    'Für Fragen zur Migration drücken Sie die 1. Für Fragen zur Migration der Migration drücken Sie die 2.',
    'Die Hotline spielt »Für Elise« in Endlosschleife. Nach dem dritten Durchlauf summst du mit.',
    'Eine freundliche Stimme: »Haben Sie es schon mit Aus- und wieder Einschalten versucht?« Es ist ein SAP-System.'
  ];
  // v0.5 Ausschreibung: ein Los je Woche (nicht in der Übernahme-Woche), Richtpreis base in k€
  SC.AUKTION = [
    { id: 'teile', label: 'Rahmenvertrag Ersatzteile (5 Arbeitstage ab Zuschlag: Reparatur für 2 k€)', short: 'Ersatzteile', base: 10 },
    { id: 'kontingent', label: 'Beraterkontingent (2 Pakete Requirements/Spezifikation)', short: 'Beraterkontingent', base: 22 },
    { id: 'wartung', label: 'Wartungspaket Server und Verpackungsautomat (5 Arbeitstage ab Zuschlag)', short: 'Wartungspaket', base: 12 }
  ];
  SC.AUKTION_BIDS = ['Gebot knapp', 'Gebot zum Richtpreis', 'Gebot großzügig'];
  // Satire: Werk Nord bietet immer etwas dazu
  SC.NORD_GEBOTE = [
    'Werk Nord legt einen Dienstwagen und ein Stück Kuchen dazu.',
    'Werk Nord bietet in einer PowerPoint mit 40 Folien. Das Angebot steht auf Folie 39.',
    'Werk Nord schickt das Gebot per Fax. Das Controlling ist gerührt.',
    'Werk Nord bietet und behauptet, das MES dort laufe schon. Seit 2014. Im Testmodus.',
    'Werk Nord legt einen Gutschein für die Kantine bei. Die Kantine kennt Werk Nord gar nicht.',
    'Werk Nord bietet mit Unterschrift in Neonfarbe, damit es »digitaler« aussieht.'
  ];
  SC.ARCHIV = [
    'Archiv: Lastenhefte seit 2009. Das erste MES-Lastenheft liegt ganz unten, unter dem zweiten.',
    'Archiv: Ein Ordner »MES 2.0 (nie gestartet)«. Daneben »MES 3.0 (sofort gestoppt)«.',
    'Archiv: Ein Karton mit 400 Disketten. Beschriftung: »Stammdaten, final«.',
    'Archiv: Ein Wandkalender von 2011. Bei Go-Live steht »nächste Woche«.'
  ];
  SC.ARCHIV_EGG = 'Ganz unten im Archiv: das erste MES-Lastenheft, Version 0.1. Seite 1, einziger Satz: »Das System soll schnell sein.« Seite 2: »Und alles können.« Unterschrieben 2009.';
  SC.ZWILLING = [
    'Der digitale Zwilling von Werk Mitte läuft. Er hat heute schon 3 Module abgenommen. Virtuell.',
    'Der Zwilling meldet OEE 99,9 %. Er hat keinen Verpackungsautomaten modelliert.',
    'Der Zwilling ist pünktlicher als du und schreibt schönere Excel-Listen. Er hat auch keine Familie.',
    'Der Zwilling schlägt vor, das Daily der Werkleitung zu simulieren. Die Werkleitung hat abgelehnt. Real.'
  ];
  SC.ZWILLING_EGG = 'Der digitale Zwilling hat einen eigenen Zwilling angelegt. Der fragt, ob er ins Meeting darf. Du schaltest beide aus.';
  SC.VORZEIG = 'Das Konzernaudit kürt Werk Mitte zum »Vorzeigewerk«: Image und Kennzahlen glänzen, obwohl noch nicht alle Module abgenommen sind. Den Rest übernimmt ein Exzellenz-Team aus der Zentrale. Christian geht auf Vortragsreise: »Wie wir das MES fast eingeführt haben«.';
  // v0.5 Süßigkeitenbox im Büro: Christian bringt immer etwas mit. Jeden Tag schaut ein Stammgast vorbei.
  SC.SORTEN = { schoko: 'Schoko-Mix', gummi: 'Gummibärchen', lakritz: 'Lakritz' };
  SC.NASCHER = [
    { id: 'schicht', who: 'Der Schichtleiter', mag: 'schoko', gut: 'nimmt sich zwei Stück, lobt »den vom MES« vor der Schicht und gibt die Teststation heute schneller frei (Schichtleiter +1, ein Testlauf 10 Min. kürzer).', meck: { gummi: '»Gummibärchen? Ich leite eine Schicht, keinen Kindergarten.«', lakritz: '»Lakritz? Das ist ja wie meine Montagsrunde: keiner will es, alle müssen.«' }, leer: '»Die Box ist leer. Das ist ein Meeting wert.«' },
    { id: 'chef', who: 'Die Werkleitung', mag: 'schoko', gut: 'nimmt ein Stück »für den Vorstand«. Die Stimmung oben ist gut (Werkleitung +1, ein Termin bei der Werkleitung 10 Min. kürzer).', meck: '»Pralinen wären angemessen. Wir sind ein Konzern, keine Kantine.«', leer: '»Eine leere Box ist ein schlechtes Signal an die Mannschaft. Schreiben Sie das in die Excel-Liste.«' },
    { id: 'controlling', who: 'Die Controlling-Abteilung', mag: 'schoko', gut: 'bucht die Schokolade als »Motivation, Kostenstelle 4711« und stempelt heute dein nächstes Formular schneller (eine Aktion im Controlling 10 Min. kürzer).', meck: '»Die Box kostet. Ich hab es in Zeile 14 gebucht. Unter Fehlinvestition.«', leer: '»Leere Box, volle Kostenstelle. Typisch Projekt.«' },
    { id: 'werkstatt', who: 'Die Instandhaltung', mag: 'gummi', gut: 'kaut zufrieden auf einem Gummibärchen und kommt heute sofort, wenn etwas klemmt (eine Reparatur 10 Min. kürzer).', meck: '»Gummibärchen oder ich lass den Automaten stehen.«', leer: '»Keine Gummibärchen, keine Gewährleistung.«' },
    { id: 'kantine', who: 'Die Kantinenkraft', mag: 'gummi', gut: 'schiebt dir zum Dank das Tablett schon hin (Mittagessen heute 10 Min. kürzer).', meck: { schoko: '»Schoko-Mix? Der schmilzt mir am Tablettband.«', lakritz: '»Lakritz? Davon bleiben schwarze Finger am Tablettband.«' }, leer: '»Die Box ist leer. Wie die Kaffeemaschine nach dem SAP-Umstieg.«' },
    { id: 'it', who: 'Die IT-Chefin', mag: 'lakritz', gut: 'strahlt: »Lakritz ist die Pyramide unter den Süßigkeiten: schwarz, hart, notwendig.« Das Review heute geht schneller (10 Min. kürzer).', meck: { schoko: '»Schokolade? Das ist so 2010. Industrie 5.0 isst Lakritz.«', gummi: '»Gummibärchen? Die sind so bunt wie eine Folie vom Berater. Industrie 5.0 isst Lakritz.«' }, leer: '»Eine leere Box. Das ist Ebene 0: Feld. Nichts drin.«' }
  ];
  SC.LETZTES = [
    'Da liegt es wieder: das letzte Stück. Seit Montag. Niemand traut sich.',
    'Das letzte Stück in der Box hat inzwischen eine eigene Materialnummer im SAP.',
    'Jemand hat einen Zettel an das letzte Stück geklebt: »Reserviert. Für den Go-Live.«'
  ];
  SC.LETZTES_EGG = 'Dreimal hast du das letzte Stück selbst gegessen. Die Kollegen nennen dich jetzt »den Entsorger«. Der Schichtleiter will dazu ein Meeting.';
  SC.PROGNOSE = [
    { id: 'p_lo', label: 'Prognose: KPI-Index Freitag unter Plan', k: 0 },
    { id: 'p_mid', label: 'Prognose: KPI-Index Freitag im Plan', k: 1 },
    { id: 'p_hi', label: 'Prognose: KPI-Index Freitag über Plan', k: 2 }
  ];
})(window.SC);

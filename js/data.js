// MES-Marathon: Spieldaten. Alle Figuren, Firmen und Texte sind frei erfunden.
// Namensregel: Nur Christian hat einen Namen. Alle anderen Figuren heißen nur nach ihrer Rolle.
'use strict';
window.SC = window.SC || {};
(function (SC) {
  SC.VERSION = '0.3.0';
  SC.DAY_START = 7 * 60 + 30;   // 07:30 Frühschicht-Beginn im Büro
  SC.DAY_END = 17 * 60;         // 17:00 regulärer Feierabend
  SC.LATEST = 20 * 60;          // 20:00 der Pförtner schließt ab
  SC.MIN_PER_SEC = 2;           // Spielminuten pro Echtsekunde bei Tempo 1
  SC.DEADLINE = 20;             // Go-Live am Abend von Arbeitstag 20 (nach der Übernahme 22)
  SC.WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  SC.PLAYER = { name: 'Christian', col: '#8cb8e8' };
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
    budgetStart: 110, tranche: 30, trancheLow: 15, berater: 25,
    kredit: { rahmen: 60, rahmenHoch: 80, schritt: 20, zins: 0.08 },
    rival: { p: 0.2, lead: 0.1, from: 4, cost: 5 },
    cost: { test: 2, repair: 3, care: 2, toner: 1, weekend: 8, sap: 10, fusion: 12, daily: 1 },
    fault: { inpack: 0.40, auspack: 0.15, other: 0.04 },
    visit: { tesla: 0.55, duo: 0.6, italienHour: 0.30, italienMax: 3, itEven: 0.85, itOdd: 0.25, ahnungslos: 0.5, altwerk: 0.5, glueck: 0.08 },
    flur: 0.35, bingoScore: 50, tiramisu: 0.15,
    meet: { gain: 8, step: 2, cap: 80, quotaMin: 90, quotaPen: 1, spiral: 0.35, spiral2: 0.5, testFactor: 0.75, reqDouble: 0.35 }
  };
  SC.KPI = {
    names: { oee: 'OEE', ausschuss: 'Ausschuss', durchsatz: 'Durchsatz', liefer: 'Liefertreue' },
    unit: { oee: ' %', ausschuss: ' %', durchsatz: ' (Index)', liefer: ' %' },
    start: { oee: 62, ausschuss: 5.5, durchsatz: 100, liefer: 86 },
    ziel: { oee: 78, ausschuss: 3.0, durchsatz: 112, liefer: 94 },
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
    'Die Kantinenkraft: »Der Schichtleiter mag es, wenn man zu seinen Meetings kommt. Aber er merkt es nicht, wenn man nur zu einem kommt.«',
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
      'Ich hab ausgerechnet: Mit dem Tesla wäre ich heute 4 Minuten früher hier gewesen. Wenn ich einen hätte.',
      'Der neue Tesla kann angeblich allein einparken. Ich überlege, ob er auch allein in Meetings gehen kann.',
      'Reichweite im Winter, Christian. Darüber muss man reden. Jetzt. Ausführlich.'
    ],
    duo: [
      'Der Kollege, der nichts arbeitet, steht daneben, nickt und sagt: »Genau.« Er sagt das seit 2019.',
      'Der Kollege, der nichts arbeitet, ergänzt: »Und die Hupe kann Geräusche machen.« Beide lachen eine Minute lang.',
      'Der Kollege, der nichts arbeitet, hält einen Kaffee. Es ist sein dritter. Gearbeitet hat er heute noch nicht.'
    ],
    italien: [
      'Meine Nonna hat am Sonntag die Soße vier Stunden gekocht. Vier! Ich hab ein Foto. Und noch eins. Und ein Video.',
      'In meinem Dorf gibt es eine Bäckerei, die backt seit 1890 dasselbe Brot. Nie ein Update. Nie ein Absturz.',
      'Weißt du, warum Espresso so klein ist? Damit man öfter Pause machen kann. Ich hab dir einen mitgebracht.',
      'Mein Onkel hat einmal einen Käse so groß wie ein Autoreifen gemacht. Das Dorf hat drei Tage gefeiert.',
      'Christian, du siehst müde aus. Bei uns sagt man: Erst essen, dann Pyramide.'
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
      'Ein Kollege ohne Ahnung: »Ich hab gehört, das MES macht alles automatisch. Auch Meetings?«'
    ],
    altwerk: [
      'Der Kollege vom Altwerk: »Bei uns hieß das Feld aber Artikelnummer_neu_2.«',
      'Der Kollege vom Altwerk: »Wir hatten auch ein MES. Also, eine Excel-Liste. Mit Makros!«',
      'Der Kollege vom Altwerk: »Unsere Pyramide war aber vier Ebenen hoch.«'
    ]
  };
  SC.ITALIEN_KURZ = [
    'Heute Mittag mach ich euch allen Bruschetta. Versprochen!', 'Hab ich dir schon von der Hochzeit meiner Cousine erzählt? 400 Gäste. Drei Tage.',
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
    tesla: ['0 auf 100 in 3,1!', 'Reichweite, Christian!', 'Update über Nacht!', 'Der parkt allein ein.', 'Hast du das Video gesehen?'],
    nix: ['Genau.', 'Bin gleich bei dir.', 'Erst mal Kaffee.', 'Viel los heute, ne?', 'Ich warte auf Rückmeldung.'],
    italien: ['Mamma mia, die Pasta!', 'Heute Bruschetta!', 'Espresso? Espresso.', 'In Italien ist jetzt Pause.', 'Meine Nonna sagt ...'],
    itchefin: ['Ebene 3!', 'Denk an die Pyramide!', 'Feld, Steuerung, ...', 'Wo ist das MES? Na?', 'Ich hab Folien dabei.']
  };
  // Flurfunk: kleine Zufallsereignisse mit zwei Optionen (lang/kurz). Effekte bewusst klein.
  SC.FLUR = [
    { id: 'brandschutz', who: 'Der Brandschutzbeauftragte', text: 'Brandschutzübung! Alle raus auf den Parkplatz. Der Pförtner zählt durch und kommt jedes Mal auf eine andere Zahl.',
      opts: [{ label: 'Brav mitgehen (15 Min.)', min: 15, energy: 4, schicht: 2, msg: 'Frische Luft am Sammelplatz. Die Schicht sieht dich dort und findet das solidarisch (+2).' },
        { label: 'Tür zu, weiterarbeiten (2 Min.)', min: 2, energy: -2, msg: 'Der Brandschutzbeauftragte notiert: »Büro, 2. OG: verbrannt.« Nur auf dem Papier.' }] },
    { id: 'beamer', who: 'Ein Kollege ohne Ahnung', text: 'Der Beamer im Besprechungsraum geht nicht. Hast du ein HDMI-Kabel? Oder VGA? Oder das andere?',
      opts: [{ label: 'Adapter suchen helfen (12 Min.)', min: 12, energy: 0, schicht: 2, msg: 'Im Moderationskoffer liegen 14 Adapter. Keiner passt. Der fünfzehnte schon. Der Schichtleiter ist dir dankbar (+2).' },
        { label: '»Ich hab nur USB-C.« (2 Min.)', min: 2, energy: -1, msg: 'Er nickt verständnisvoll. Er weiß nicht, was USB-C ist.' }] },
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
      opts: [{ label: 'Video anschauen (8 Min.)', min: 8, energy: 4, msg: 'Der Stapler parkt ein. Dann die Mülltonne aus. Ihr lacht beide. Energie +4.' },
        { label: '»Schick es mir.« (1 Min.)', min: 1, energy: -1, msg: 'Er schickt es dir. Und drei weitere. Und eine Sprachnachricht.' }] },
    { id: 'torte', who: 'Die IT-Chefin', role: 'itchefin', text: 'Die IT-Chefin hat die Automatisierungspyramide als Torte bestellt. Für den Geburtstag der Werkleitung. Sie sucht jemanden zum Probe-Essen von Ebene 2.',
      opts: [{ label: 'Probe-Essen (10 Min.)', min: 10, energy: 6, msg: 'Ebene 2 (Leitebene) ist Marzipan. Ebene 3 (MES) ist noch nicht fertig. Natürlich. Energie +6.' },
        { label: '»Ich bin auf Diät.« (1 Min.)', min: 1, energy: -1, msg: '»Schade. Dann bekommst du Ebene 0, das ist nur der Teller.«' }] },
    { id: 'meetingmeeting', who: 'Der Schichtleiter', role: 'schicht', text: 'Der Schichtleiter sammelt Unterschriften: Er will ein Meeting über die Abschaffung unnötiger Meetings ansetzen.',
      opts: [{ label: 'Unterschreiben (5 Min.)', min: 5, energy: 0, schicht: 3, msg: 'Er strahlt. Das Meeting dazu ist nächste Woche, Dauer 90 Minuten. Schichtleiter +3.' },
        { label: 'Freundlich ablehnen (1 Min.)', min: 1, energy: 0, schicht: -2, msg: '»Verstehe. Dann besprechen wir das im Meeting.« Schichtleiter −2.' }] },
    { id: 'passwort', who: 'Die IT (Rundmail)', text: 'Pflicht für alle: Passwort ändern. Mindestens 16 Zeichen, ein Sonderzeichen, ein Emoji und keins der letzten 40.',
      opts: [{ label: 'Sofort ändern (8 Min.)', min: 8, energy: -1, msg: 'Geschafft. Du hast es auf einen Zettel geschrieben, den du unter die Tastatur legst. Sicherheit!' },
        { label: '»Morgen erinnern« (1 Min.)', min: 1, energy: 0, msg: 'Morgen erinnert es dich. Und übermorgen. Und in jedem Meeting am Beamer.' }] },
    { id: 'app', who: 'Der Azubi', text: 'Der Azubi fragt, ob er die Excel-Liste »mal schnell« in eine App umziehen darf. Mit Dark Mode.',
      opts: [{ label: 'Geduldig erklären, warum nicht (10 Min.)', min: 10, energy: 1, msg: 'Du erklärst den SVERWEIS. Er schaut dich an wie ein Museumsstück. Aber er hört zu.' },
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
    'Herzlichen Glückwunsch an die Extrusion: drei Tage ohne Etikettenstau! Der Rekord liegt bei vier.',
    'Das Meeting zur Reduzierung von Durchsagen beginnt in fünf Minuten im Besprechungsraum.',
    'Wer hat den Tacker aus der Werkleitung? Er wird vermisst. Bitte keine Fragen stellen, einfach zurückbringen.',
    'Probealarm der Sirene. Bitte nicht in Panik verfallen. Der echte Schichtwechsel ist erst um 14:00.',
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

  // v0.3 Pflicht-Ereignisse (Tobi): Kaffeeautomat, Kreis-Pyramide, Morse-Rätsel, Kostümparty
  SC.KOSTUEME = [
    { label: 'Pappe-Pyramide (50 Min.)', min: 50, energy: -4, chef: 3, msg: 'Du kommst als Automatisierungspyramide. Die IT-Chefin weint vor Rührung. Die Werkleitung findet es »strategisch« (+3).' },
    { label: 'Kaffeemaschine »Fehler 42« (40 Min.)', min: 40, energy: 4, schicht: 2, msg: 'Du piepst den ganzen Abend und gibst niemandem Kaffee. Die Schicht feiert dich (+2). Irgendwie erholsam.' },
    { label: 'Verpackungsautomat aus Karton (45 Min.)', min: 45, energy: -2, schicht: 3, chef: -1, msg: 'Alle zehn Minuten fällt dein Kostüm auseinander. Die Instandhaltung repariert es mit Kabelbinder. Riesenapplaus.' },
    { label: 'Schornstein mit Wattewolke (45 Min.)', min: 45, energy: -2, chef: 2, family: 1, msg: 'Die Werkleitung fotografiert dich für die Werkszeitung (+2). Zuhause hängt das Foto am Kühlschrank.' },
    { label: 'Ladesäule mit Kabel (35 Min.)', min: 35, energy: 2, schicht: 3, chef: -2, msg: 'Der Tesla-Kollege lädt sich den ganzen Abend an dir auf. Ihr seid das Paar des Abends.' },
    { label: 'Gar nicht, Hemd wie immer (15 Min.)', min: 15, energy: 0, chef: -3, family: 1, msg: 'Du kommst als Christian. Verkleidungspflicht verletzt, die Werkleitung notiert es (−3). Dafür bist du früh daheim.' }
  ];
  SC.PARTY_GAESTE = 'Der Schichtleiter kommt als Wandkalender (alle Tage voller Meetings). Der Tesla-Kollege kommt als Reichweitenanzeige. Der Kollege, der nichts arbeitet, kommt als »Kollege, der arbeitet«, und niemand erkennt ihn. Der italienische Kollege kommt als Pizza Margherita. Die IT-Chefin kommt als Kreis. Die Werkleitung kommt als Gantt-Diagramm.';
  SC.PARTY_BUBBLES = { schicht: ['Ich bin ein Kalender!', 'Termin um 17:00!'], tesla: ['Reichweite: 100 %!', 'Ich bin geladen!'], nix: ['Ich arbeite. Echt.', 'Kostüm: fleißig.'], italien: ['Ich bin eine Pizza!', 'Margherita, bitte!'], itchefin: ['Industrie 5.0!', 'Ich bin ein Kreis.'] };
  // Running Gags
  SC.IMMER = ['Das hatten wir schon immer so.', 'Haben wir schon immer so gemacht.', 'Das war schon immer so, Christian.'];
  SC.DRUCKER_FEHLER = [
    ['Der Drucker meldet: »Papierformat unbekannt (A4)«.', 'Der Drucker meldet: »Toner fast leer« (seit 2019).', 'Der Drucker meldet: »Bitte Klappe C schließen«. Es gibt keine Klappe C.'],
    ['Der Drucker meldet: »Fehler 49.4C02: Drucker hat schlechte Laune«.', 'Der Drucker meldet: »Ihr Druckauftrag ist mir egal«.', 'Der Drucker druckt eine Testseite. Darauf steht nur: »Warum?«'],
    ['Der Drucker meldet: »SAP-Cutover erkannt. Drucker geht in den Widerstand.«', 'Der Drucker meldet: »Materialnummer für Papier nicht gefunden (neues SAP)«.', 'Der Drucker meldet auf Latein: »Memento mori«. Dann piept er dreimal.']
  ];

  // v0.3 aus Sender-Chef übertragen: aktive Rivalen mit Image, Zusagen an die Werkleitung
  SC.RIVAL_EVT = [
    { who: 'Werk Nord (Anruf aus der Personalabteilung)', text: 'Werk Nord wirbt einen erfahrenen Bediener der Extrusion ab. Mit Dienstwagen. Ohne Testläufe wird es hier zwei Tage lang zäh.',
      gegen: 'Bediener mit Zulage halten (5 k€, 10 Min.)', hin: 'Ziehen lassen (Testläufe 3 Tage deutlich langsamer)' },
    { who: 'Werk Süd (Flurfunk aus dem Vorstand)', text: 'Werk Süd erzählt dem Vorstand, Werk Mitte habe »noch nicht mal eine Excel-Liste«. Die Werkleitung hat es gehört.',
      gegen: 'Gegendarstellung mit KPI-Folien (5 k€ Grafikagentur, 10 Min.)', hin: 'Ignorieren (Werkleitung −5, Image −7, nächste Tranche −10 k€)' }
  ];
  SC.ZUSAGE = [
    { id: 'kurz', label: 'Zusage »kurz«: 1 Modul in 4 Tagen', need: 1, days: 4, praemie: 8, chef: 4, image: 3, strafe: 8, chefMinus: 6, imageMinus: 5 },
    { id: 'mittel', label: 'Zusage »mittel«: 2 Module in 8 Tagen', need: 2, days: 8, praemie: 15, chef: 6, image: 4, strafe: 15, chefMinus: 8, imageMinus: 6 },
    { id: 'lang', label: 'Zusage »lang«: 3 Module in 12 Tagen', need: 3, days: 12, praemie: 22, chef: 8, image: 5, strafe: 20, chefMinus: 10, imageMinus: 8 }
  ];
})(window.SC);

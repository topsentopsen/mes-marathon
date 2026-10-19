// MES-Marathon: Spieldaten. Alle Figuren, Firmen und Texte sind frei erfunden.
// Namensregel: Nur Christian hat einen Namen. Alle anderen Figuren heißen nur nach ihrer Rolle.
'use strict';
window.SC = window.SC || {};
(function (SC) {
  SC.VERSION = '0.2.0';
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
    budgetStart: 100, tranche: 30, trancheLow: 15, vorschuss: 25, rueckzahlung: 30, berater: 25,
    cost: { test: 2, repair: 3, care: 2, toner: 1, weekend: 8, sap: 10, fusion: 12, daily: 1 },
    fault: { inpack: 0.40, auspack: 0.15, other: 0.04 },
    visit: { tesla: 0.55, duo: 0.6, italienHour: 0.30, italienMax: 3, itEven: 0.85, itOdd: 0.25, ahnungslos: 0.5, altwerk: 0.5, glueck: 0.08 },
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
})(window.SC);

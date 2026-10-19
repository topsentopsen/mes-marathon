// MES-Marathon: Spieldaten. Alle Namen, Firmen und Texte sind frei erfunden.
'use strict';
window.SC = window.SC || {};
(function (SC) {
  SC.VERSION = '0.1.0';
  SC.DAY_START = 7 * 60 + 30;   // 07:30 Arbeitsbeginn
  SC.DAY_END = 17 * 60;         // 17:00 regulärer Feierabend
  SC.LATEST = 20 * 60;          // 20:00 Pförtner schließt ab
  SC.MIN_PER_SEC = 2;           // Spielminuten pro Echtsekunde bei Tempo 1
  SC.DEADLINE = 20;             // Go-Live am Abend von Arbeitstag 20
  SC.WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  SC.PLAYER = { name: 'Tobi', col: '#8cb8e8' };
  SC.PLANT = 'Werk Mitte';
  SC.RIVALS = [
    { name: 'Ralf', plant: 'Werk Nord', col: '#ff6040', min: 3, max: 7.5 },
    { name: 'Birgit', plant: 'Werk Süd', col: '#40d070', min: 3.5, max: 7 }
  ];
  // Bedarf je Projektphase (Arbeitspakete)
  SC.NEED = { req: 3, spec: 3, impl: 4, test: 2 };
  SC.MODULES = [
    { id: 'auftrag', name: 'Auftragsverwaltung' },
    { id: 'bde', name: 'Betriebsdatenerfassung (BDE)' },
    { id: 'trace', name: 'Rückverfolgung' },
    { id: 'qs', name: 'Qualitätsprüfung' },
    { id: 'erp', name: 'ERP-Schnittstelle' }
  ];
  // Etagen: 0 = EG ... 4 = oben. Türen links und rechts vom Aufzug (x 240).
  SC.FLOORS = [
    { name: 'EG', doors: [{ x: 122, label: 'PFORTE', room: 'pforte' }, { x: 186, label: 'SCHICHT', room: 'schicht' }, { x: 330, label: 'HALLE', room: 'halle' }] },
    { name: '1', doors: [{ x: 130, label: 'BÜRO', room: 'buero' }, { x: 340, label: 'DRUCKER', room: 'drucker' }] },
    { name: '2', doors: [{ x: 130, label: 'MEETING', room: 'meeting' }, { x: 340, label: 'KANTINE', room: 'kantine' }] },
    { name: '3', doors: [{ x: 130, label: 'SERVER', room: 'server' }, { x: 340, label: 'ARCHIV', room: null, deco: true, msg: 'Archiv: Ordner mit Lastenheften von 2009. Hier findet niemand etwas.' }] },
    { name: '4', doors: [{ x: 130, label: 'CHEF', room: 'chef' }, { x: 340, label: 'HR', room: null, deco: true, msg: 'Personalabteilung: »Ihre Überstunden bitte bis Monatsende im Formular C-17 eintragen.«' }] }
  ];
  SC.ROOMS = {
    pforte: { title: 'Pforte', who: 'Pförtner Günther', floor: 0 },
    schicht: { title: 'Schichtleiter-Büro', who: 'Schichtleiter Kalle Brettschneider', floor: 0 },
    halle: { title: 'Fertigungshalle', who: 'Linie 3, Bediener und Maschinen', floor: 0 },
    buero: { title: 'Mein Büro', who: 'Schreibtisch, zwei Monitore, die Excel-Liste', floor: 1 },
    drucker: { title: 'Druckerraum', who: 'Der Drucker »Kyocera-Kalle 2«', floor: 1 },
    meeting: { title: 'Besprechungsraum', who: 'Beamer, kalter Kaffee, Moderationskoffer', floor: 2 },
    kantine: { title: 'Kantine & Kaffeeküche', who: 'Frau Yilmaz an der Ausgabe', floor: 2 },
    server: { title: 'Serverraum', who: 'Rack 4, MES-Server und Testumgebung', floor: 3 },
    chef: { title: 'Werksleitung', who: 'Werksleiterin Dr. Henrike Stahl', floor: 4 }
  };
  // Nutzlose Meetings des Schichtleiters
  SC.USELESS = [
    'Abstimmung zur Abstimmung', 'Vorbesprechung zum Jour fixe', 'Lessons Learned zum letzten Lessons Learned',
    'Kurzer Austausch (90 Folien)', 'Rundgang: Wo steht der Feuerlöscher?', 'Sync zum Schichtübergabe-Sync',
    'Brainstorming: neue Farbe für die Pausenraumtür', 'Kick-off zum Kick-off', 'Workshop: Effizientere Meetings',
    'Klärung der Klärungspunkte', 'Infoveranstaltung: Neue Kaffeemaschine'
  ];
  SC.USEFUL = [
    { title: 'Requirements-Workshop mit der Qualität', eff: 'req' },
    { title: 'Spezifikations-Review mit der IT', eff: 'spec' },
    { title: 'Testplanung mit der Linie', eff: 'test' }
  ];
  SC.TIPS = [
    'Frau Yilmaz: »Der Kalle mag es, wenn man zu seinen Meetings kommt. Sonst blockiert er die Linie.«',
    'Ein Instandhalter: »Der Server in Rack 4 schmiert ab, wenn keiner nach ihm schaut.«',
    'Kollegin aus dem Einkauf: »Die Stahl liest jeden Tag die Excel-Liste. Jeden. Tag.«',
    'Azubi: »Ohne ausgedruckte Spezifikation unterschreibt die Werksleitung gar nichts.«',
    'Frau Yilmaz: »Nach dem Mittagessen geht alles schneller, glauben Sie mir.«',
    'Ein Bediener: »Testläufe gehen nur, wenn die Testumgebung den aktuellen Stand hat.«'
  ];
})(window.SC);

// Statistiche — dati realistici

const STAT_PRENOTAZIONI = {
  kpi: {
    coperti: { val: 1150, delta: 12.5 },
    occupazione: { val: 79, delta: 12.5 },
    perTavolo: { val: 2.4, delta: 5.2 },
    durata: { val: '1h 50m', delta: -3.1 },
  },
  fasceOccupazione: [
    { ora:'12:00', tavoli: 14, max: 20 },
    { ora:'13:00', tavoli: 16, max: 20 },
    { ora:'14:00', tavoli: 12, max: 20 },
    { ora:'19:00', tavoli: 10, max: 20 },
    { ora:'20:00', tavoli: 18, max: 20 },
    { ora:'21:00', tavoli: 19, max: 20 },
    { ora:'22:00', tavoli: 13, max: 20 },
  ],
  stato: {
    totale: 543,
    cancellate: { n: 39, pct: 7.2 },
    noShow: { n: 18, pct: 3.3 },
    confermate: { n: 432, pct: 79.6 },
    inAttesa: { n: 54, pct: 9.9 },
  },
  copertiGiorno: [
    { d:'Lun', val: 18, target: 25 },
    { d:'Mar', val: 32, target: 25 },
    { d:'Mer', val: 21, target: 25 },
    { d:'Gio', val: 38, target: 25 },
    { d:'Ven', val: 14, target: 25 },
    { d:'Sab', val: 28, target: 25 },
    { d:'Dom', val: 22, target: 25 },
  ],
  // Palette warm: rosso → arancione → ambra → ocra. Niente nero / verde.
  // 4 tonalità distinguibili che parlano col brand magenta senza imitarlo.
  distribuzione: [
    { label:'Tavoli da 2',  pct: 38.4, color:'#B53338' }, // rosso scuro
    { label:'Tavoli da 4',  pct: 28.7, color:'#FF5A5F' }, // brand
    { label:'Tavoli da 6',  pct: 18.9, color:'#F59E0B' }, // ambra
    { label:'Tavoli da 8+', pct: 14.0, color:'#FDBA74' }, // arancio chiaro
  ],
};

const STAT_ORDINI = {
  kpi: {
    scontrino: { val: 45.50, delta: 12.5 },
    completati: { val: 1320, delta: 12.5 },
  },
  asporto: { completati: 612, tempoMedio: '14 min' },
  sala:    { completati: 708, tempoMedio: '52 min' },
  scontrinoTrend: { // 12 mesi, 3 canali
    direta:  [4500, 4800, 5200, 6100, 5500, 6800, 6300, 5800, 7200, 6400, 7000, 7300],
    asporto: [2600, 2800, 3100, 3700, 3300, 4100, 3800, 3500, 4400, 3900, 4250, 4500],
    delivery:[ 800,  900, 1100, 1500, 1300, 1800, 1700, 1500, 2100, 1900, 2050, 2300],
  },
  // Heatmap: 7 giorni × 8 fasce, ogni cella = ordini medi nel giorno tipico
  heatmap: [
    // 08-09, 09-10, 10-11, 11-12, 12-13, 13-14, 19-20, 20-21
    { ora:'08-09', val:[ 4, 5, 4, 6, 6,12, 8] },
    { ora:'09-10', val:[ 6, 7, 6, 7, 8,18,14] },
    { ora:'10-11', val:[ 3, 4, 3, 5, 5,10, 8] },
    { ora:'11-12', val:[ 8,10, 9,11,14,22,18] },
    { ora:'12-13', val:[28,32,30,34,42,58,52] },
    { ora:'13-14', val:[42,46,44,48,56,72,68] },
    { ora:'19-20', val:[24,28,26,32,46,68,60] },
    { ora:'20-21', val:[38,44,42,48,62,84,78] },
    { ora:'21-22', val:[22,26,24,30,38,52,46] },
  ],
};

const STAFF = [
  { nome:'Marco Esposito', ruolo:'Cameriere', avatar:'ME', avatarBg:'#FF5A5F', scontrino: 38.20, vsTeam: -8.13, ordini: 312, tavoli: 142, tip: 240 },
  { nome:'Sofia Bianchi',  ruolo:'Cameriera', avatar:'SB', avatarBg:'#B53338', scontrino: 52.40, vsTeam: +6.07, ordini: 286, tavoli: 138, tip: 380 },
  { nome:'Luca Conti',     ruolo:'Cameriere', avatar:'LC', avatarBg:'#0F1115', scontrino: 47.80, vsTeam: +1.47, ordini: 264, tavoli: 121, tip: 310 },
  { nome:'Giulia Romano',  ruolo:'Cameriera', avatar:'GR', avatarBg:'#16A34A', scontrino: 49.10, vsTeam: +2.77, ordini: 298, tavoli: 134, tip: 350 },
  { nome:'Davide Russo',   ruolo:'Cameriere', avatar:'DR', avatarBg:'#2563EB', scontrino: 41.90, vsTeam: -4.43, ordini: 245, tavoli: 110, tip: 200 },
  { nome:'Chiara Greco',   ruolo:'Cameriera', avatar:'CG', avatarBg:'#7C3AED', scontrino: 55.20, vsTeam: +8.87, ordini: 274, tavoli: 130, tip: 410 },
  { nome:'Andrea Marino',  ruolo:'Cameriere', avatar:'AM', avatarBg:'#D97706', scontrino: 44.30, vsTeam: -2.03, ordini: 252, tavoli: 115, tip: 220 },
  { nome:'Elena Costa',    ruolo:'Maître',    avatar:'EC', avatarBg:'#E04347', scontrino: 58.60, vsTeam: +12.27,ordini: 198, tavoli: 95,  tip: 460 },
];

const STAT_CLIENTI = {
  unici: { val: 1240, delta: 12 },
  abituali: { val: 487, delta: 8 },
  rating: 4.5,
  recensioni: 543,
  starBreakdown: [
    { stars: 5, count: 320 },
    { stars: 4, count: 142 },
    { stars: 3, count: 48 },
    { stars: 2, count: 21 },
    { stars: 1, count: 12 },
  ],
  ratingTrend: [4.2,4.3,4.4,4.4,4.3,4.5,4.6,4.5,4.6,4.7,4.6,4.8],
  ciclo: [
    { stato:'Prima visita',           n: 433, pct: 35, delta: 12.5 },
    { stato:'Ritorno entro 30 giorni', n: 320, pct: 26, delta: 10.0 },
    { stato:'Ritorno entro 90 giorni', n: 210, pct: 17, delta: 5.0 },
    { stato:'3+ visite ultimi 90gg',   n: 180, pct: 14, delta: 15.0 },
    { stato:'6+ visite ultimi 90gg',   n: 97,  pct:  8, delta: 7.5 },
  ],
};

const STAT_ECONOMICI = {
  ricavi: { val: 86420, delta: 12.5 },
  costi:  { val: 52180, delta: -4.2 },
  utile:  { val: 34240, delta: 18.7 },
  origine: {
    sala:     [4200, 4500, 4800, 5400, 5100, 5800, 5400, 4900, 6200, 5800, 6100, 6400],
    asporto:  [2400, 2600, 2800, 3200, 3000, 3400, 3200, 2900, 3700, 3400, 3600, 3800],
    diretta:  [ 800,  900, 1000, 1200, 1100, 1300, 1200, 1100, 1400, 1300, 1350, 1450],
  },
  totaleRicavi: { byup: 36120, contanti: 21240, carte: 29060 },
  fatturatoTrend: [42500, 48200, 52000, 56800, 51400, 58200, 54800, 49600, 64200, 58800, 62400, 65800],
  costiBreakdown: [
    { cat:'Stipendi',     fissi: 100, var: 0,   tot: 18400, delta: 0.5 },
    { cat:'Materie prime', fissi: 0,  var: 100, tot: 14200, delta: 8.2 },
    { cat:'Utenze',       fissi: 70, var: 30,  tot: 4800,  delta: -2.1 },
    { cat:'F&B beverage', fissi: 30, var: 70,  tot: 6400,  delta: 5.4 },
    { cat:'Locale & affitto', fissi: 100, var: 0, tot: 5000, delta: 0 },
    { cat:'Attrezzature & ammortamento', fissi: 90, var: 10, tot: 1800, delta: -8.0 },
    { cat:'Altro',        fissi: 50, var: 50,  tot: 1580,  delta: 3.2 },
  ],
};

const STAT_VENDITE = {
  kpi: {
    articoli: { val: 3.2, delta: 8.4, sub:'Articoli per ordine medio' },
    margine:  { val: 62, delta: 4.1, sub:'Margine medio (%)' },
    venduti:  { val: 13560, delta: 12.5, sub:'Articoli totali venduti' },
  },
  piatti: [
    { nome:'Cacio e Pepe',   costo: 4.20, ricavo: 14.00, margine: 9.80, n: 412, costiTot: 1730.4, ricavoTot: 5768, marginePct: 70 },
    { nome:'Carbonara',      costo: 4.80, ricavo: 15.00, margine: 10.20, n: 386, costiTot: 1852.8, ricavoTot: 5790, marginePct: 68 },
    { nome:'Amatriciana',    costo: 4.50, ricavo: 14.50, margine: 10.00, n: 342, costiTot: 1539.0, ricavoTot: 4959, marginePct: 69 },
    { nome:'Saltimbocca',    costo: 7.20, ricavo: 22.00, margine: 14.80, n: 198, costiTot: 1425.6, ricavoTot: 4356, marginePct: 67 },
    { nome:'Coda alla vaccinara', costo: 8.90, ricavo: 24.00, margine: 15.10, n: 142, costiTot: 1263.8, ricavoTot: 3408, marginePct: 63 },
    { nome:'Trippa',         costo: 5.40, ricavo: 16.00, margine: 10.60, n: 124, costiTot: 669.6,  ricavoTot: 1984, marginePct: 66 },
    { nome:'Tiramisù',       costo: 2.10, ricavo: 8.00,  margine: 5.90,  n: 386, costiTot: 810.6,  ricavoTot: 3088, marginePct: 74 },
    { nome:'Pesce spada',    costo: 12.40,ricavo: 28.00, margine: 15.60, n: 98,  costiTot: 1215.2, ricavoTot: 2744, marginePct: 56 },
    { nome:'Carciofi alla giudia', costo: 3.20, ricavo: 9.00, margine: 5.80, n: 264, costiTot: 844.8, ricavoTot: 2376, marginePct: 64 },
    { nome:'Bruschetta',     costo: 1.40, ricavo: 6.00,  margine: 4.60,  n: 312, costiTot: 436.8,  ricavoTot: 1872, marginePct: 77 },
  ],
};

const STAT_APP = {
  funnel: [
    { label:'Visualizzazioni vetrina', val: 10000, pct: 100 },
    { label:'Visualizzazioni menu',     val: 7500,  pct: 75 },
    { label:'Carrello creato',          val: 4200,  pct: 42 },
    { label:'Pagamento completato',     val: 2900,  pct: 29 },
  ],
  conversionePiatti: [
    { piatto:'Acqua naturale',      view: 3200, ord: 2640, conv: 82.5 },
    { piatto:'Cacio e Pepe',        view: 2800, ord: 1450, conv: 51.8 },
    { piatto:'Carbonara',           view: 2640, ord: 1380, conv: 52.3 },
    { piatto:'Amatriciana',         view: 2380, ord: 1190, conv: 50.0 },
    { piatto:'Tiramisù',            view: 1820, ord: 1310, conv: 72.0 },
    { piatto:'Bruschetta',          view: 1640, ord: 980,  conv: 59.8 },
    { piatto:'Saltimbocca',         view: 1420, ord: 580,  conv: 40.8 },
    { piatto:'Carciofi alla giudia', view: 1280, ord: 720,  conv: 56.3 },
    { piatto:'Pesce spada',         view: 920,  ord: 280,  conv: 30.4 },
    { piatto:'Coda alla vaccinara', view: 720,  ord: 240,  conv: 33.3 },
  ],
};

window.STAT_PRENOTAZIONI = STAT_PRENOTAZIONI;
window.STAT_ORDINI = STAT_ORDINI;
window.STAFF = STAFF;
window.STAT_CLIENTI = STAT_CLIENTI;
window.STAT_ECONOMICI = STAT_ECONOMICI;
window.STAT_VENDITE = STAT_VENDITE;
window.STAT_APP = STAT_APP;

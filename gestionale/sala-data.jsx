// Sala — dati estesi con modello ordini realistico
// Stati articolo: 'ordinato' (in coda cucina) | 'in_cottura' (preso in carico) | 'pronto' (sul pass)
// Niente 'consegnato' — il sistema non lo sa.
// Origin: 'cameriere' | 'byup' (per distinguere chi ha mandato l'ordine)

const SALA_TAVOLI = [
  { id: 1,  state: 'occupato', posti: 4, coperti: 4, byup: 2, byupWeb: 0, party: 'Famiglia Robinson', sittingMin: 32, conto: 87.00, contoSaldato: false,
    guests: [
      { id:'g1', name:'Marco R.',     source:'byup' },
      { id:'g2', name:'Giulia R.',    source:'byup' },
      { id:'g3', name:'Guest 3',      source:'guest' },
      { id:'g4', name:'Guest 4',      source:'guest' },
    ],
    ordini: [
      { id:'o1', nome:'Tagliere misto',     qty:1, prezzo:14, stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0,  origin:'byup',     guestId:null },
      { id:'o2', nome:'Tagliatelle al ragù',qty:1, prezzo:13, stato:'in_cottura', minutiInPreparazione:8, minutiInCoda:0,  origin:'byup',     guestId:'g1' },
      { id:'o2b',nome:'Tagliatelle al ragù',qty:1, prezzo:13, stato:'in_cottura', minutiInPreparazione:8, minutiInCoda:0,  origin:'byup',     guestId:'g2' },
      { id:'o3', nome:'Bistecca fiorentina',qty:1, prezzo:38, stato:'in_cottura', minutiInPreparazione:14,minutiInCoda:0,  origin:'cameriere',guestId:null },
      { id:'o4', nome:'Acqua naturale',     qty:2, prezzo:3,  stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0,  origin:'cameriere',guestId:null },
    ],
    minutiSenzaOrdine: 8, timeSinceLastOrder: 8, note: null,
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 2,  state: 'libero',   posti: 2, ordini: [],
    nextReservation: { time: '22:00', name: 'Stark', posti: 2, inMin: 45 },
    minutiAllaPrenotazione: 45 },

  // daIncassare < conto: la differenza è quanto già pagato in app (riga
  // "Pagato in app" nel blocco conto a scontrino della card espansa)
  { id: 3,  state: 'occupato', posti: 6, coperti: 5, byup: 3, byupWeb: 1, party: 'Rachel Green + friends', sittingMin: 18, conto: 42.50, daIncassare: 24.50, contoSaldato: false,
    guests: [
      { id:'g3a', name:'Luca V.',    source:'byup' },
      { id:'g3b', name:'Sara V.',    source:'byup' },
      { id:'g3c', name:'Anna B.',    source:'byup' },
      { id:'g3d', name:'Guest 4',    source:'guest' },
      { id:'g3e', name:'Guest 5',    source:'guest' },
    ],
    ordini: [
      { id:'o5',  nome:'Bruschette miste',    qty:2, prezzo:8,  stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0,  origin:'byup',     guestId:null },
      { id:'o6a', nome:'Pizza margherita',    qty:1, prezzo:9,  stato:'in_cottura', minutiInPreparazione:5, minutiInCoda:0,  origin:'byup',     guestId:'g3a' },
      { id:'o6b', nome:'Pizza margherita',    qty:1, prezzo:9,  stato:'in_cottura', minutiInPreparazione:5, minutiInCoda:0,  origin:'byup',     guestId:'g3b' },
      { id:'o6c', nome:'Pizza margherita',    qty:1, prezzo:9,  stato:'in_cottura', minutiInPreparazione:5, minutiInCoda:0,  origin:'byup',     guestId:'g3c' },
      { id:'o7a', nome:'Pizza diavola',       qty:1, prezzo:11, stato:'ordinato',   minutiInPreparazione:0, minutiInCoda:5,  origin:'cameriere',guestId:null },
      { id:'o7b', nome:'Pizza diavola',       qty:1, prezzo:11, stato:'ordinato',   minutiInPreparazione:0, minutiInCoda:5,  origin:'cameriere',guestId:null },
    ],
    // Incassi già arrivati su questo conto: due ospiti hanno pagato la loro
    // parte dall'app prima che il conto si chiudesse.
    pagamenti: [
      { id:'p3a', method:'byup', amount: 9.00, ora:'20:41', chi:'Luca V.' },
      { id:'p3b', method:'byup', amount: 9.00, ora:'20:43', chi:'Sara V.' },
    ],
    minutiSenzaOrdine: 4, timeSinceLastOrder: 4,
    note: { tipo:'evento', testo:'Compleanno' },
    extraNote: { tipo:'generica', testo:'Servire al tavolo con tovaglia bianca' },
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 4,  state: 'prenotato', posti: 4, ordini: [],
    nextReservation: { time: '20:30', name: 'Annie Edison', posti: 4, inMin: 12 },
    minutiAllaPrenotazione: 12 },

  { id: 5,  state: 'occupato', posti: 2, coperti: 2, byup: 0, byupWeb: 0, party: null, sittingMin: 65, conto: 56.00, contoSaldato: true,
    ordini: [
      { id:'o8',  nome:'Antipasto della casa',qty:2, prezzo:10, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'cameriere' },
      { id:'o9',  nome:'Risotto ai funghi',   qty:2, prezzo:14, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'cameriere' },
      { id:'o10', nome:'Tiramisù',            qty:2, prezzo:6,  stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'cameriere' },
    ],
    minutiSenzaOrdine: 18, timeSinceLastOrder: 18, note: null,
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 6,  state: 'dapulire', posti: 4, freedMinAgo: 4, minutiDaPulire: 4, ordini: [],
    nextReservation: { time: '21:30', name: 'Conti', posti: 4, inMin: 95 },
    minutiAllaPrenotazione: 95 },

  { id: 7,  state: 'occupato', posti: 8, coperti: 7, byup: 4, byupWeb: 0, party: 'Tommy Shelby', sittingMin: 48, conto: 184.00, daIncassare: 130.00, contoSaldato: false,
    guests: [
      { id:'g7a', name:'Paolo N.',  source:'byup' },
      { id:'g7b', name:'Elena N.',  source:'byup' },
      { id:'g7c', name:'Marco T.',  source:'byup' },
      { id:'g7d', name:'Chiara R.', source:'byup' },
    ],
    ordini: [
      { id:'o11', nome:'Crostini misti',     qty:4, prezzo:7,  stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0,  origin:'byup',     guestId:null },
      { id:'o12a',nome:'Pappardelle cinghiale',qty:2, prezzo:14, stato:'in_cottura', minutiInPreparazione:6, minutiInCoda:0, origin:'byup',    guestId:'g7a' },
      { id:'o12b',nome:'Pappardelle cinghiale',qty:1, prezzo:14, stato:'in_cottura', minutiInPreparazione:6, minutiInCoda:0, origin:'byup',    guestId:'g7b' },
      { id:'o12c',nome:'Pappardelle cinghiale',qty:2, prezzo:14, stato:'in_cottura', minutiInPreparazione:6, minutiInCoda:0, origin:'byup',    guestId:'g7c' },
      { id:'o13', nome:'Tagliata di manzo',  qty:3, prezzo:22, stato:'ordinato',   minutiInPreparazione:0, minutiInCoda:18, origin:'cameriere', guestId:null },
      { id:'o14', nome:'Pasta s/ glutine',   qty:1, prezzo:14, stato:'in_cottura', minutiInPreparazione:7, minutiInCoda:0,  origin:'byup',     guestId:'g7d', alert:'allergia' },
      { id:'o15', nome:'Vino rosso',         qty:1, prezzo:24, stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0,  origin:'cameriere', guestId:null },
    ],
    // Conto lungo pagato a pezzi: due quote dall'app, una in contanti al
    // banco. Serve a vedere i tre canali insieme nella finestra di saldo.
    pagamenti: [
      { id:'p7a', method:'byup',     amount: 21.00, ora:'21:02', chi:'Paolo N.' },
      { id:'p7b', method:'byup',     amount: 18.00, ora:'21:05', chi:'Elena N.' },
      { id:'p7c', method:'contanti', amount: 15.00, ora:'21:11', chi:null },
    ],
    minutiSenzaOrdine: 6, timeSinceLastOrder: 6,
    note: { tipo:'allergia', testo:'Allergia glutine', ospite:'Marco R.' },
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 8,  state: 'libero',   posti: 2, ordini: [], nextReservation: null, minutiAllaPrenotazione: null },

  { id: 9,  state: 'occupato', posti: 4, coperti: 3, byup: 0, byupWeb: 1, party: 'Di Caprio', sittingMin: 12, conto: 18.00, contoSaldato: false,
    ordini: [
      { id:'o16', nome:'Aperitivo della casa', qty:3, prezzo:6, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup' },
    ],
    minutiSenzaOrdine: 2, timeSinceLastOrder: 2,
    note: { tipo:'generica', testo:'Servire al tavolo con tovaglia bianca' },
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 10, state: 'prenotato', posti: 6, ordini: [],
    note: { tipo:'evento', testo:'Aziendale' },
    nextReservation: { time: '20:45', name: 'Bruno Bucciarati', posti: 6, inMin: -18 },
    minutiAllaPrenotazione: -18 },

  { id: 11, state: 'occupato', posti: 4, coperti: 4, byup: 4, byupWeb: 0, party: 'Usop', sittingMin: 95, conto: 142.00, contoSaldato: false,
    guests: [
      { id:'g11a', name:'Davide L.', source:'byup' },
      { id:'g11b', name:'Marta L.',  source:'byup' },
      { id:'g11c', name:'Rita L.',   source:'byup' },
      { id:'g11d', name:'Aldo L.',   source:'byup' },
    ],
    ordini: [
      { id:'o17a', nome:'Antipasto misto', qty:1, prezzo:11, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11a' },
      { id:'o17b', nome:'Antipasto misto', qty:1, prezzo:11, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11b' },
      { id:'o17c', nome:'Antipasto misto', qty:1, prezzo:11, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11c' },
      { id:'o17d', nome:'Antipasto misto', qty:1, prezzo:11, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11d' },
      { id:'o18a', nome:'Tagliolini tartufo',qty:1, prezzo:18, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11a' },
      { id:'o18b', nome:'Tagliolini tartufo',qty:1, prezzo:18, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11b' },
      { id:'o18c', nome:'Tagliolini tartufo',qty:1, prezzo:18, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11c' },
      { id:'o18d', nome:'Tagliolini tartufo',qty:1, prezzo:18, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g11d' },
      { id:'o19',  nome:'Filetto al pepe', qty:4, prezzo:24, stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'cameriere', guestId:null },
      { id:'o20',  nome:'Caffè',           qty:4, prezzo:2,  stato:'pronto', minutiInPreparazione:0, minutiInCoda:0, origin:'cameriere', guestId:null },
    ],
    minutiSenzaOrdine: 32, timeSinceLastOrder: 32, note: null,
    nextReservation: { time: '22:15', name: 'Fabbri', posti: 4, inMin: 165 },
    minutiAllaPrenotazione: 165 },

  { id: 12, state: 'libero',   posti: 4, ordini: [],
    nextReservation: { time: '22:00', name: 'Totti', posti: 3, inMin: 40 },
    minutiAllaPrenotazione: 40 },

  // ALERT: seduto da 28 min, mai ordinato, 0 byup → alert massimo
  { id: 13, state: 'occupato', posti: 2, coperti: 2, byup: 0, byupWeb: 0, party: 'Jesse Pinkman', sittingMin: 28, conto: 0, contoSaldato: false,
    ordini: [],
    minutiSenzaOrdine: 28, timeSinceLastOrder: 28, note: null,
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 14, state: 'dapulire', posti: 4, freedMinAgo: 14, minutiDaPulire: 14, ordini: [],
    nextReservation: { time: '20:30', name: 'Conti', posti: 4, inMin: 12 }, minutiAllaPrenotazione: 12 },

  { id: 15, state: 'occupato', posti: 6, coperti: 6, byup: 0, byupWeb: 0, party: 'Margaery Tyrell', sittingMin: 38, conto: 96.00, contoSaldato: false,
    ordini: [
      { id:'o21', nome:'Tagliere salumi',  qty:1, prezzo:15, stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0,  origin:'cameriere' },
      { id:'o22', nome:'Lasagna',          qty:4, prezzo:12, stato:'in_cottura', minutiInPreparazione:4, minutiInCoda:0,  origin:'cameriere' },
      { id:'o23', nome:'Menù bambino',     qty:2, prezzo:9,  stato:'ordinato',   minutiInPreparazione:0, minutiInCoda:18, origin:'cameriere' },
    ],
    minutiSenzaOrdine: 12, timeSinceLastOrder: 12,
    note: { tipo:'generica', testo:'2 bambini · menù piccolo' },
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 16, state: 'dapulire', posti: 2, freedMinAgo: 26, minutiDaPulire: 26, ordini: [],
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 17, state: 'occupato', posti: 4, coperti: 4, byup: 2, byupWeb: 0, party: 'Frodo Baggins', sittingMin: 22, conto: 38.00, contoSaldato: false,
    guests: [
      { id:'g17a', name:'Marco F.', source:'byup' },
      { id:'g17b', name:'Lara F.',  source:'byup' },
    ],
    ordini: [
      { id:'o24a', nome:'Caprese',           qty:1, prezzo:9, stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g17a' },
      { id:'o24b', nome:'Caprese',           qty:1, prezzo:9, stato:'pronto',     minutiInPreparazione:0, minutiInCoda:0, origin:'byup', guestId:'g17b' },
      { id:'o25',  nome:'Spaghetti pomodoro',qty:2, prezzo:10,stato:'in_cottura', minutiInPreparazione:3, minutiInCoda:0, origin:'cameriere', guestId:null },
    ],
    minutiSenzaOrdine: 5, timeSinceLastOrder: 5, note: null,
    nextReservation: null, minutiAllaPrenotazione: null },

  { id: 18, state: 'prenotato', posti: 8, ordini: [],
    note: { tipo:'evento', testo:'Aziendale' },
    nextReservation: { time: '21:00', name: 'Rick Sanchez', posti: 8, inMin: 15 },
    minutiAllaPrenotazione: 15 },
];

// Conti aperti
const SALA_CONTI_APERTI = [
  { tavolo: 'Tavolo 4',  liberato: '14:30', cliente: 'Mario Rossi',     totTavolo: 85.00,  daSaldare: 45.00, oreFa: 5.5 },
  { tavolo: 'Tavolo 7',  liberato: '17:45', cliente: 'Andrea Bianchi',  totTavolo: 142.00, daSaldare: 22.00, oreFa: 3.5 },
  { tavolo: 'Tavolo 2',  liberato: '18:10', cliente: 'Simone De Luca',  totTavolo: 64.50,  daSaldare: 64.50, oreFa: 2.0 },
  { tavolo: 'Tavolo 11', liberato: '18:42', cliente: 'Famiglia Verdi',  totTavolo: 178.00, daSaldare: 38.00, oreFa: 1.25 },
  { tavolo: 'Tavolo 5',  liberato: '19:20', cliente: 'Luca Greco',      totTavolo: 52.00,  daSaldare: 16.00, oreFa: 0.3666666666666667 },
];

// Soglie default (configurabili via tweaks)
const SALA_THRESHOLDS = {
  noOrderWarn: 15,
  noOrderAlert: 25,
  overstay: 90,
  oldBillHours: 3,
};

// Soglie temporali progressive — single source of truth (vedi CLAUDE.md NOTE SISTEMA)
const PULIRE_WARNING_MIN  = 10;
const PULIRE_CRITICAL_MIN = 20;
const ORDINE_WARN_MIN     = 15;
const ORDINE_ALERT_MIN    = 30;
const CODA_ALERT_MIN      = 15;
const PRENOTAZIONE_BLOCCO_MIN = 30;
const NOSHOW_ALERT_MIN    = 15;

function getPulireSeverity(min) {
  if (min == null) return 'normal';
  if (min > PULIRE_CRITICAL_MIN) return 'critical';
  if (min >= PULIRE_WARNING_MIN) return 'warning';
  return 'normal';
}
function getOrdineSeverity(min) {
  if (min == null) return 'none';
  if (min > ORDINE_ALERT_MIN) return 'warning';
  if (min >= ORDINE_WARN_MIN) return 'info';
  return 'none';
}
function getCodaSeverity(min) {
  if (min == null) return 'normal';
  if (min > CODA_ALERT_MIN) return 'warning';
  return 'normal';
}

// Mini-menù realistico per il flow "+ Articolo"
const SALA_MENU = {
  Antipasti: [
    { id:'m-a1', nome:'Tagliere misto',         prezzo:14,
      ingredients:['Pecorino','Taleggio','Prosciutto','Salame','Miele','Marmellata'],
      extras:[{id:'e1',nome:'Miele extra',prezzo:1},{id:'e2',nome:'Marmellata di fichi',prezzo:1.5}] },
    { id:'m-a2', nome:'Bruschette al pomodoro', prezzo:7,
      ingredients:['Pomodoro','Aglio','Basilico','Olio EVO'],
      extras:[{id:'e1',nome:'Mozzarella',prezzo:2},{id:'e2',nome:'Acciughe',prezzo:2}] },
    { id:'m-a3', nome:'Caprese di bufala',      prezzo:11,
      ingredients:['Bufala','Pomodoro','Basilico'],
      extras:[{id:'e1',nome:'Pesto',prezzo:1.5}] },
    { id:'m-a4', nome:'Antipasto della casa',   prezzo:13 },
  ],
  Primi: [
    { id:'m-p1', nome:'Tagliatelle al ragù',    prezzo:13,
      ingredients:['Ragù di manzo','Tagliatelle','Parmigiano'],
      extras:[{id:'e1',nome:'Parmigiano extra',prezzo:1.5}],
      variants:[{id:'cottura',label:'Cottura pasta',options:['Al dente','Al punto','Ben cotta']}] },
    { id:'m-p2', nome:'Spaghetti pomodoro',     prezzo:10,
      ingredients:['Pomodoro','Basilico','Aglio'],
      extras:[{id:'e1',nome:'Parmigiano',prezzo:1},{id:'e2',nome:'Peperoncino',prezzo:0}],
      variants:[{id:'cottura',label:'Cottura pasta',options:['Al dente','Al punto']}] },
    { id:'m-p3', nome:'Risotto ai funghi',      prezzo:14,
      ingredients:['Funghi porcini','Brodo','Burro','Parmigiano','Prezzemolo'],
      extras:[{id:'e1',nome:'Tartufo nero',prezzo:8}] },
    { id:'m-p4', nome:'Pappardelle cinghiale',  prezzo:14,
      ingredients:['Cinghiale','Pappardelle','Pomodoro','Vino rosso'],
      variants:[{id:'cottura',label:'Cottura pasta',options:['Al dente','Al punto']}] },
    { id:'m-p5', nome:'Lasagna alla bolognese', prezzo:12,
      ingredients:['Ragù','Besciamella','Parmigiano','Sfoglia'] },
  ],
  Secondi: [
    { id:'m-s1', nome:'Bistecca fiorentina',    prezzo:38,
      ingredients:['Manzo Chianina','Sale','Rosmarino'],
      extras:[{id:'e1',nome:'Patate al forno',prezzo:4},{id:'e2',nome:'Insalata mista',prezzo:5}],
      variants:[
        {id:'cottura',label:'Cottura',options:['Al sangue','Media','Ben cotta']},
        {id:'taglio',label:'Taglio',options:['Costata','Filetto','Misto']},
        {id:'contorno',label:'Contorno incluso',options:['Patate','Insalata','Verdure grigliate']},
      ] },
    { id:'m-s2', nome:'Tagliata di manzo',      prezzo:22,
      ingredients:['Manzo','Rucola','Grana','Aceto balsamico'],
      variants:[
        {id:'cottura',label:'Cottura',options:['Al sangue','Media','Ben cotta']},
        {id:'condimento',label:'Condimento',options:['Rucola e grana','Aceto balsamico','Senza condimento']},
      ] },
    { id:'m-s3', nome:'Pollo arrosto',          prezzo:14,
      ingredients:['Pollo','Patate','Rosmarino'] },
    { id:'m-s4', nome:'Filetto al pepe verde',  prezzo:24,
      ingredients:['Filetto','Pepe verde','Panna','Brandy'],
      variants:[
        {id:'cottura',label:'Cottura',options:['Al sangue','Media','Ben cotta']},
        {id:'salsa',label:'Salsa',options:['Pepe verde','Burro al rosmarino','Senza salsa']},
      ] },
  ],
  Pizze: [
    { id:'m-z1', nome:'Pizza margherita',       prezzo:9,
      ingredients:['Pomodoro','Mozzarella','Basilico'],
      extras:[{id:'e1',nome:'Bufala',prezzo:2},{id:'e2',nome:'Olive',prezzo:1},{id:'e3',nome:'Funghi',prezzo:1.5}] },
    { id:'m-z2', nome:'Pizza diavola',          prezzo:11,
      ingredients:['Pomodoro','Mozzarella','Salame piccante'],
      extras:[{id:'e1',nome:'Peperoncino',prezzo:0},{id:'e2',nome:'Olive',prezzo:1}] },
    { id:'m-z3', nome:'Pizza 4 formaggi',       prezzo:12,
      ingredients:['Mozzarella','Gorgonzola','Fontina','Parmigiano'] },
  ],
  Contorni: [
    { id:'m-c1', nome:'Patate al forno',        prezzo:5 },
    { id:'m-c2', nome:'Insalata mista',         prezzo:5 },
    { id:'m-c3', nome:'Verdure grigliate',      prezzo:6 },
  ],
  Dolci: [
    { id:'m-d1', nome:'Tiramisù',               prezzo:6,
      ingredients:['Mascarpone','Savoiardi','Caffè','Cacao'] },
    { id:'m-d2', nome:'Panna cotta',            prezzo:5,
      variants:[{id:'topping',label:'Topping',options:['Frutti di bosco','Caramello','Cioccolato']}] },
    { id:'m-d3', nome:'Torta della casa',       prezzo:6 },
  ],
  Bevande: [
    { id:'m-b1', nome:'Acqua naturale 1L',      prezzo:3 },
    { id:'m-b2', nome:'Acqua frizzante 1L',     prezzo:3 },
    { id:'m-b3', nome:'Vino rosso (1/2)',       prezzo:14,
      variants:[{id:'tipo',label:'Tipo',options:['Della casa','Chianti','Montepulciano']}] },
    { id:'m-b4', nome:'Birra media',            prezzo:5,
      variants:[{id:'tipo',label:'Tipo',options:['Chiara','Rossa','Bianca']}] },
    { id:'m-b5', nome:'Caffè',                  prezzo:2,
      variants:[{id:'tipo',label:'Tipo',options:['Espresso','Macchiato','Decaffeinato']}] },
  ],
};

// Notifica di stato basata su soglie.
// Usa le soglie progressive ORDINE_WARN_MIN (15) / ORDINE_ALERT_MIN (30) — MAI rosso.
// 0-15' nessun segnale | 15-30' chip grigio info | >30' chip ambra warning.
function getOccupiedAlert(t) {
  if (t.state !== 'occupato') return null;
  const hasOrders = t.ordini && t.ordini.length > 0;
  // Tavolo seduto senza ordine → "Non ordina da X'"
  if (!hasOrders) {
    const sev = getOrdineSeverity(t.minutiSenzaOrdine != null ? t.minutiSenzaOrdine : t.sittingMin);
    if (sev === 'warning') return { tone:'warn', label:`Non ordina da ${t.minutiSenzaOrdine ?? t.sittingMin}'` };
    if (sev === 'info')    return { tone:'info', label:`Non ordina da ${t.minutiSenzaOrdine ?? t.sittingMin}'` };
    return null;
  }
  // Articoli ancora in cottura/coda e tempo dall'ultimo ordine elevato
  const hasPending = t.ordini.some(o => o.stato !== 'pronto');
  if (hasPending && t.timeSinceLastOrder != null) {
    const sev = getOrdineSeverity(t.timeSinceLastOrder);
    if (sev === 'warning') return { tone:'warn', label:`Ordine in attesa da ${t.timeSinceLastOrder}'` };
    if (sev === 'info')    return { tone:'info', label:`Ordine in attesa da ${t.timeSinceLastOrder}'` };
  }
  return null;
}

window.SALA_TAVOLI = SALA_TAVOLI;
window.SALA_CONTI_APERTI = SALA_CONTI_APERTI;
window.SALA_THRESHOLDS = SALA_THRESHOLDS;
window.SALA_MENU = SALA_MENU;
window.getOccupiedAlert = getOccupiedAlert;
window.PULIRE_WARNING_MIN  = PULIRE_WARNING_MIN;
window.PULIRE_CRITICAL_MIN = PULIRE_CRITICAL_MIN;
window.ORDINE_WARN_MIN     = ORDINE_WARN_MIN;
window.ORDINE_ALERT_MIN    = ORDINE_ALERT_MIN;
window.CODA_ALERT_MIN      = CODA_ALERT_MIN;
window.PRENOTAZIONE_BLOCCO_MIN = PRENOTAZIONE_BLOCCO_MIN;
window.NOSHOW_ALERT_MIN    = NOSHOW_ALERT_MIN;
window.getPulireSeverity   = getPulireSeverity;
window.getOrdineSeverity   = getOrdineSeverity;
window.getCodaSeverity     = getCodaSeverity;

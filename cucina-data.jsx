// Cucina — kitchen monitor & order tracking
// "now" simulato: 14:55 — usato per calcolare l'età dei ticket

const CUC_NOW_MIN = 14 * 60 + 55; // 14:55

// Helper: minuti totali da "HH:MM"
function _toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Ticket items: state = 'todo' | 'doing' | 'done'
// kind = 'sala' | 'asporto' | 'delivery'
// course: 1=antipasto, 2=primo, 3=secondo, 4=dessert (null=portata unica)
const CUC_TICKETS_ATTIVI = [
  { id: 'a1', kind: 'sala', table: 9,  orderN: '#5678', time: '14:40', station: 'Pizza',  items: [
    { qty: 2, name: 'Margherita Pizza',   note: 'senza basilico',     allergen: false, state: 'todo', course: null },
    { qty: 1, name: 'Insalata Caesar',    note: 'aggiungi pollo',     allergen: false, state: 'todo', course: null },
  ]},
  { id: 'a4', kind: 'asporto', customer: 'Anna Bianchi', pickup: '15:10', orderN: '#1235', time: '14:48', station: 'Pizza', items: [
    { qty: 2, name: 'Margherita Pizza',   note: 'extra mozzarella',   allergen: false, state: 'todo', course: null },
    { qty: 2, name: 'Garlic Bread',       note: '',                    allergen: false, state: 'todo', course: null },
  ]},
  { id: 'a2', kind: 'sala', table: 12, orderN: '#1234', time: '14:50', station: 'Primi',  items: [
    { qty: 2, name: 'Bruschetta',          note: 'con pomodoro fresco', allergen: false, state: 'todo', course: 1 },
    { qty: 3, name: 'Spaghetti Carbonara', note: 'extra pecorino',      allergen: false, state: 'todo', course: 2 },
    { qty: 2, name: 'Tagliata di Manzo',   note: 'cottura al sangue',   allergen: false, state: 'todo', course: 3 },
  ]},
  { id: 'a3', kind: 'sala', table: 15, orderN: '#9101', time: '14:54', station: 'Primi',  items: [
    { qty: 1, name: 'Lasagna',            note: 'senza glutine',       allergen: true,  state: 'todo', course: null },
    { qty: 1, name: 'Tiramisu',           note: 'porzione singola',    allergen: false, state: 'todo', course: null },
  ]},
  { id: 'a5', kind: 'delivery', customer: 'Sara Rossi', pickup: '15:20', orderN: '#1239', time: '14:52', station: 'Secondi', items: [
    { qty: 1, name: 'Pollo alla Griglia', note: 'salsa barbecue a parte', allergen: false, state: 'todo', course: null },
    { qty: 1, name: 'Purè di Patate',     note: '',                       allergen: false, state: 'todo', course: null },
  ]},
];

const CUC_TICKETS_PREP = [
  { id: 'p1', kind: 'sala', table: 8,  orderN: '#1230', time: '14:35', station: 'Primi',  items: [
    { qty: 1, name: 'Pasta Carbonara',    note: 'extra pecorino',     allergen: false, state: 'doing', course: null },
    { qty: 1, name: 'Pasta Carbonara',    note: 'senza guanciale',    allergen: false, state: 'done',  course: null },
  ]},
  { id: 'p2', kind: 'sala', table: 4,  orderN: '#1228', time: '14:42', station: 'Pizza',  items: [
    { qty: 2, name: 'Pizza Diavola',      note: '',                    allergen: false, state: 'doing', course: null },
    { qty: 1, name: 'Pizza Marinara',     note: 'ben cotta',           allergen: false, state: 'todo',  course: null },
  ]},
  { id: 'p4', kind: 'delivery', customer: 'Luca Verdi', pickup: '15:05', orderN: '#1236', time: '14:38', station: 'Primi', items: [
    { qty: 1, name: 'Lasagna',            note: '',                    allergen: false, state: 'doing', course: null },
    { qty: 1, name: 'Tiramisu',           note: '',                    allergen: false, state: 'done',  course: null },
  ]},
  { id: 'p5', kind: 'sala', table: 6,  orderN: '#1224', time: '14:30', station: 'Primi',  items: [
    { qty: 2, name: 'Bruschetta',         note: '',                    allergen: false, state: 'done',  course: 1 },
    { qty: 2, name: 'Risotto ai Funghi',  note: '',                    allergen: false, state: 'doing', course: 2 },
    { qty: 2, name: 'Tagliata di Manzo',  note: 'al sangue',           allergen: false, state: 'todo',  course: 3 },
  ]},
  { id: 'p3', kind: 'sala', table: 11, orderN: '#1226', time: '14:45', station: 'Secondi', items: [
    { qty: 1, name: 'Tagliata di Manzo',  note: 'cottura al sangue',   allergen: false, state: 'doing', course: null },
  ]},
];

// Storico — ~80 ordini distribuiti su 4 giorni con tempi/totali plausibili
const _STAZIONI = ['Pizza','Primi','Secondi','Contorni','Bevande'];
const _CAMERIERI = ['Marco','Sara','Luca','Giulia','Andrea'];
const _MENU = [
  { name: 'Margherita Pizza',    price: 9,  station:'Pizza' },
  { name: 'Pizza Diavola',       price: 11, station:'Pizza' },
  { name: 'Pizza Marinara',      price: 8,  station:'Pizza' },
  { name: 'Spaghetti Carbonara', price: 12, station:'Primi' },
  { name: 'Pasta al Pesto',      price: 11, station:'Primi' },
  { name: 'Lasagna',             price: 13, station:'Primi' },
  { name: 'Risotto ai Funghi',   price: 14, station:'Primi' },
  { name: 'Tagliata di Manzo',   price: 22, station:'Secondi' },
  { name: 'Pollo alla Griglia',  price: 16, station:'Secondi' },
  { name: 'Frittura Mista',      price: 18, station:'Secondi' },
  { name: 'Insalata Caesar',     price: 9,  station:'Contorni' },
  { name: 'Bruschetta',          price: 6,  station:'Contorni' },
  { name: 'Patatine Fritte',     price: 5,  station:'Contorni' },
  { name: 'Tiramisù',            price: 7,  station:'Contorni' },
  { name: 'Vino della casa',     price: 14, station:'Bevande' },
  { name: 'Acqua naturale',      price: 3,  station:'Bevande' },
  { name: 'Coca Cola',           price: 4,  station:'Bevande' },
];
const _NOTES = ['', '', '', 'senza basilico', 'extra pecorino', 'cottura al sangue', 'ben cotta', 'porzione singola', 'senza glutine', '+1 mozzarella'];
const _CLIENTI_ASP = ['Anna Bianchi','Luca Verdi','Sara Rossi','Marco Gallo','Giovanni Esposito','Clara Fontana','Giulia Neri','Emma Colombo','Alessandro Fabbri'];

function _seeded(seed) {
  let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}
function _pad(n) { return n < 10 ? '0' + n : '' + n; }
function _addMin(hhmm, m) {
  const t = _toMin(hhmm) + m;
  return _pad(Math.floor(t/60)) + ':' + _pad(t%60);
}

function _genStorico() {
  const rng = _seeded(42);
  const days = [
    { label: 'Oggi',  date: 'Mar 9 dic 2025', dayKey: 'oggi' },
    { label: 'Ieri',  date: 'Lun 8 dic 2025', dayKey: 'ieri' },
    { label: 'Dom 7 dic',  date: 'Dom 7 dic 2025', dayKey: 'dom' },
    { label: 'Sab 6 dic',  date: 'Sab 6 dic 2025', dayKey: 'sab' },
  ];
  const out = [];
  let nOrd = 1232;
  days.forEach((d, di) => {
    // Più ordini sui giorni passati per realismo
    const count = di === 0 ? 28 : di === 1 ? 62 : 48;
    for (let i = 0; i < count; i++) {
      const isAsporto = rng() < 0.25;
      const startMin = 11*60 + 30 + Math.floor(rng() * (10*60));
      const start = _pad(Math.floor(startMin/60)) + ':' + _pad(startMin%60);
      const cookMin = 8 + Math.floor(rng() * 22);
      const ready = _addMin(start, cookMin);
      const served = _addMin(ready, 2 + Math.floor(rng()*5));
      const nItems = 1 + Math.floor(rng() * 5);
      const items = [];
      let total = 0;
      const stations = new Set();
      for (let j = 0; j < nItems; j++) {
        const m = _MENU[Math.floor(rng() * _MENU.length)];
        const qty = 1 + Math.floor(rng() * 3);
        const note = _NOTES[Math.floor(rng() * _NOTES.length)];
        items.push({ name: m.name, qty, price: m.price * qty, note, station: m.station });
        total += m.price * qty;
        stations.add(m.station);
      }
      const status = rng() < 0.05 ? 'annullato' : (rng() < 0.04 ? 'riaperto' : 'evaso');
      out.push({
        num: nOrd--,
        kind: isAsporto ? 'asporto' : 'sala',
        table: isAsporto ? null : (1 + Math.floor(rng() * 24)),
        customer: isAsporto ? _CLIENTI_ASP[Math.floor(rng()*_CLIENTI_ASP.length)] : null,
        cameriere: _CAMERIERI[Math.floor(rng() * _CAMERIERI.length)],
        stations: [...stations],
        start, ready, served,
        cookMin: _toMin(ready) - _toMin(start),
        items, total,
        status,
        day: d,
      });
    }
  });
  return out;
}

const CUC_STORICO = _genStorico();

window.CUC_NOW_MIN = CUC_NOW_MIN;
window._toMin = _toMin;
window.CUC_TICKETS_ATTIVI = CUC_TICKETS_ATTIVI;
window.CUC_TICKETS_PREP = CUC_TICKETS_PREP;
window.CUC_STORICO = CUC_STORICO;

// Cucina — kitchen monitor & order tracking
// "now" simulato: 14:55 — usato per calcolare l'età dei ticket

const CUC_NOW_MIN = 14 * 60 + 55; // 14:55

// Helper: minuti totali da "HH:MM"
function _toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Ticket items: state = 'todo' | 'doing' | 'done'
// kind = 'sala' | 'asporto' | 'delivery' | 'banco'
// partner (solo delivery) = piattaforma che manda il rider: 'ubereats' | 'glovo'
//   | 'deliveroo' — gli id di impostazioni-integrazioni.jsx, il KDS ci disegna
//   il marchio al posto dello scooter.
// 'banco' = ordine creato dalla cassa in Vendita diretta: niente tavolo né
// cliente. Il KDS riceve tutte le righe e filtra da sé per stazione.
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
  { id: 'a5', kind: 'delivery', partner: 'ubereats', customer: 'Sara Rossi', pickup: '15:20', orderN: '#1239', time: '14:52', station: 'Secondi', items: [
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
  { id: 'p4', kind: 'delivery', partner: 'glovo', customer: 'Luca Verdi', pickup: '15:05', orderN: '#1236', time: '14:38', station: 'Primi', items: [
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

window.CUC_NOW_MIN = CUC_NOW_MIN;
window._toMin = _toMin;
window.CUC_TICKETS_ATTIVI = CUC_TICKETS_ATTIVI;
window.CUC_TICKETS_PREP = CUC_TICKETS_PREP;

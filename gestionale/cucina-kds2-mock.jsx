// Cucina · KDS v2 — dati finti
//
// L'UNICO file da buttare quando arriva l'API. Non contiene regole: solo
// porzioni già nella forma del modello (`Kds2Portion` in cucina-kds2-data.jsx).
// I timestamp sono assoluti come lo saranno quelli veri; qui si scrivono in
// minuti relativi al caricamento solo perché un mock con orari fissi invecchia
// male — aperto il giorno dopo, mostrerebbe attese di quattordici ore.
//
// ─── Il locale ────────────────────────────────────────────────────────────
// Hamburgeria, il profilo tipico di Fresh: menu corto e ad alta rotazione.
// Quattro antipasti e due principali, cioè SEI piatti in tutto — ed è proprio
// il caso in cui una vista aggregata per piatto vale: con sei righe di menu e
// venti comande aperte, la stessa cosa torna dieci volte, e leggerla comanda
// per comanda significa contare gli hamburger a mente.
//
//   Antipasti  · Patatine fritte · Onion rings · Nachos · Alette di pollo
//   Principali · Hamburger · Cheeseburger

const KDS2_T0 = Date.now();
const fa  = m => KDS2_T0 - m * 60000;   // firedAt — inviata m minuti fa
const fra = m => KDS2_T0 + m * 60000;   // dueAt   — ritiro fra m minuti

// Sorgenti aperte: cinque tavoli, tre asporti, un delivery.
// 'Marco' è un asporto battuto in cassa: nessun orario di ritiro, il cliente
// aspetta al banco. Il suo tempo è un'attesa, non una scadenza.
const T3  = { type: 'table',    label: 'T3'  };
const T7  = { type: 'table',    label: 'T7'  };
const T9  = { type: 'table',    label: 'T9'  };
const T12 = { type: 'table',    label: 'T12' };
const T15 = { type: 'table',    label: 'T15' };
const ANNA  = { type: 'takeaway', label: 'Anna'  };
const SARA  = { type: 'takeaway', label: 'Sara'  };
const MARCO = { type: 'takeaway', label: 'Marco' };
const LUCA  = { type: 'delivery', label: 'Luca'  };

const KDS2_PORZIONI = [
  // ── Hamburger: tre porzioni standard da tre sorgenti diverse, dentro la
  //    stessa finestra (12′, 9′, 8′) → UNA riga da 6. La quarta ha un
  //    modificatore e sta per conto suo, la quinta ha un allergene e sta da
  //    sola: stesso piatto, tre righe.
  { id: 'p01', dishId: 'burger', dishName: 'Hamburger', category: 'Principali',
    quantity: 2, source: T7, firedAt: fa(12), modifiers: [], status: 'active' },
  { id: 'p02', dishId: 'burger', dishName: 'Hamburger', category: 'Principali',
    quantity: 3, source: T12, firedAt: fa(9), modifiers: [], status: 'active' },
  { id: 'p03', dishId: 'burger', dishName: 'Hamburger', category: 'Principali',
    quantity: 1, source: ANNA, firedAt: fa(8), dueAt: fra(12), modifiers: [], status: 'active' },
  { id: 'p04', dishId: 'burger', dishName: 'Hamburger', category: 'Principali',
    quantity: 1, source: T12, firedAt: fa(9),
    modifiers: [{ type: 'remove', label: 'cipolla' }], status: 'active' },
  { id: 'p05', dishId: 'burger', dishName: 'Hamburger', category: 'Principali',
    quantity: 1, source: T15, firedAt: fa(6), modifiers: [],
    allergen: { label: 'senza glutine' }, status: 'active' },

  // ── Patatine: 17′ da una parte, 8′ e 3′ dall'altra. Fra 17 e 8 corrono nove
  //    minuti e la finestra è 6 → due righe; fra 8 e 3 ne corrono cinque, e
  //    quelle due porzioni restano insieme.
  { id: 'p06', dishId: 'fries', dishName: 'Patatine fritte', category: 'Antipasti',
    quantity: 4, source: T3, firedAt: fa(17), modifiers: [], status: 'active' },
  { id: 'p07', dishId: 'fries', dishName: 'Patatine fritte', category: 'Antipasti',
    quantity: 2, source: T7, firedAt: fa(8), modifiers: [], status: 'active' },
  { id: 'p08', dishId: 'fries', dishName: 'Patatine fritte', category: 'Antipasti',
    quantity: 3, source: T9, firedAt: fa(3), modifiers: [], status: 'incoming' },

  // ── Cheeseburger: stessa dinamica del piatto principale, modificatori
  //    diversi su ogni sorgente.
  { id: 'p09', dishId: 'cheese', dishName: 'Cheeseburger', category: 'Principali',
    quantity: 2, source: T3, firedAt: fa(15), modifiers: [], status: 'active' },
  { id: 'p10', dishId: 'cheese', dishName: 'Cheeseburger', category: 'Principali',
    quantity: 2, source: LUCA, firedAt: fa(4), dueAt: fra(22),
    modifiers: [{ type: 'remove', label: 'salsa' }], status: 'incoming' },
  { id: 'p11', dishId: 'cheese', dishName: 'Cheeseburger', category: 'Principali',
    quantity: 2, source: T9, firedAt: fa(3),
    modifiers: [{ type: 'add', label: 'bacon' }], status: 'incoming' },

  { id: 'p12', dishId: 'onion', dishName: 'Onion rings', category: 'Antipasti',
    quantity: 2, source: T3, firedAt: fa(15), modifiers: [], status: 'active' },
  { id: 'p13', dishId: 'onion', dishName: 'Onion rings', category: 'Antipasti',
    quantity: 2, source: MARCO, firedAt: fa(5), modifiers: [], status: 'incoming' },

  { id: 'p14', dishId: 'nachos', dishName: 'Nachos', category: 'Antipasti',
    quantity: 1, source: T7, firedAt: fa(12),
    modifiers: [{ type: 'add', label: 'jalapeños' }], status: 'active' },
  { id: 'p15', dishId: 'nachos', dishName: 'Nachos', category: 'Antipasti',
    quantity: 2, source: ANNA, firedAt: fa(8), dueAt: fra(12), modifiers: [], status: 'active' },

  // ── Alette: tre righe da tre sorgenti. Sara ha il ritiro fra 4 minuti, e il
  //    suo tempo è in ambra pur essendo entrata dopo tavoli che aspettano il
  //    doppio. Luca porta il secondo allergene: piatto diverso dal primo, a
  //    dimostrare che la riga dedicata dipende dall'allergene e non dal piatto.
  { id: 'p16', dishId: 'wings', dishName: 'Alette di pollo', category: 'Antipasti',
    quantity: 2, source: SARA, firedAt: fa(7), dueAt: fra(4),
    modifiers: [{ type: 'remove', label: 'piccante' }], status: 'active' },
  { id: 'p17', dishId: 'wings', dishName: 'Alette di pollo', category: 'Antipasti',
    quantity: 2, source: MARCO, firedAt: fa(5), modifiers: [], status: 'incoming' },
  { id: 'p18', dishId: 'wings', dishName: 'Alette di pollo', category: 'Antipasti',
    quantity: 1, source: LUCA, firedAt: fa(4), dueAt: fra(22), modifiers: [],
    allergen: { label: 'senza sesamo' }, status: 'incoming' },
];

// ─── Coda dimostrativa ────────────────────────────────────────────────────
// Ordini che «arrivano» quando si preme il comando demo: servono a vedere che
// il riordino avviene sull'EVENTO e non sul tick, e a caricare il board oltre
// le trenta righe. Le sorgenti sono nuove a ogni giro (T20, T21, …) così ogni
// pressione aggiunge righe invece di ingrossare quelle esistenti.
const KDS2_CODA = [
  [
    { dishId: 'burger', dishName: 'Hamburger', category: 'Principali', quantity: 2, modifiers: [] },
    { dishId: 'fries',  dishName: 'Patatine fritte', category: 'Antipasti', quantity: 2, modifiers: [] },
    { dishId: 'wings',  dishName: 'Alette di pollo', category: 'Antipasti', quantity: 1,
      modifiers: [{ type: 'add', label: 'salsa barbecue' }] },
  ],
  [
    { dishId: 'cheese', dishName: 'Cheeseburger', category: 'Principali', quantity: 2, modifiers: [] },
    { dishId: 'nachos', dishName: 'Nachos', category: 'Antipasti', quantity: 2,
      modifiers: [{ type: 'remove', label: 'guacamole' }] },
    { dishId: 'onion',  dishName: 'Onion rings', category: 'Antipasti', quantity: 1,
      modifiers: [], allergen: { label: 'senza lattosio' } },
  ],
  [
    { dishId: 'burger', dishName: 'Hamburger', category: 'Principali', quantity: 3,
      modifiers: [{ type: 'remove', label: 'sottaceti' }] },
    { dishId: 'wings',  dishName: 'Alette di pollo', category: 'Antipasti', quantity: 2, modifiers: [] },
    { dishId: 'fries',  dishName: 'Patatine fritte', category: 'Antipasti', quantity: 2,
      modifiers: [{ type: 'add', label: 'cheddar' }] },
    { dishId: 'cheese', dishName: 'Cheeseburger', category: 'Principali', quantity: 2, modifiers: [] },
  ],
];

/**
 * Materializza il prossimo ordine della coda come porzioni vere, con firedAt
 * all'istante della chiamata. `seq` è un contatore crescente: entra negli id
 * (due ordini nello stesso millisecondo avrebbero la stessa chiave React) e
 * nel numero del tavolo.
 */
function kds2NuovoOrdine(seq) {
  const modello = KDS2_CODA[seq % KDS2_CODA.length];
  const ora = Date.now();
  const source = { type: 'table', label: 'T' + (20 + seq) };
  return modello.map((it, i) => Object.assign({}, it, {
    id: 'n' + seq + '-' + i,
    source,
    firedAt: ora,
    status: 'incoming',
  }));
}

window.KDS2_PORZIONI   = KDS2_PORZIONI;
window.kds2NuovoOrdine = kds2NuovoOrdine;

// Sala — data

// Stati: libero | prenotato | occupato | dapulire
// Card narrativa: posti, coperti reali, ospiti byup connessi, conto, stato cucina,
// chi è seduto (party name), in tavolo da X min, note speciali, prossima prenotazione
const SALA_TAVOLI = [
  // Sala principale
  { id: 1,  state: 'occupato', posti: 4, coperti: 4, byup: 2, party: 'Famiglia Rossi', sittingMin: 32, conto: 87.00, kitchen: 'primi pronti', note: null, nextReservation: null },
  { id: 2,  state: 'libero',   posti: 2, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, nextReservation: { time: '21:00', name: 'Bianchi', posti: 2, inMin: 85 } },
  { id: 3,  state: 'occupato', posti: 6, coperti: 5, byup: 3, party: 'Verdi + amici', sittingMin: 18, conto: 42.50, kitchen: 'ordinato', note: 'Compleanno · dolce con candelina', nextReservation: null },
  { id: 4,  state: 'prenotato',posti: 4, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, nextReservation: { time: '20:30', name: 'Martina Franco', posti: 4, inMin: 5 } },
  { id: 5,  state: 'occupato', posti: 2, coperti: 2, byup: 0, party: 'Coppia walk-in', sittingMin: 65, conto: 56.00, kitchen: 'dolci consegnati', note: null, nextReservation: null },
  { id: 6,  state: 'dapulire', posti: 4, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, freedMinAgo: 4, nextReservation: { time: '21:30', name: 'Conti', posti: 4, inMin: 95 } },
  { id: 7,  state: 'occupato', posti: 8, coperti: 7, byup: 4, party: 'Tavolata Neri', sittingMin: 48, conto: 184.00, kitchen: 'secondi pronti', note: 'Allergia: glutine (1 ospite)', nextReservation: null },
  { id: 8,  state: 'libero',   posti: 2, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, nextReservation: null },
  { id: 9,  state: 'occupato', posti: 4, coperti: 3, byup: 1, party: 'Gallo', sittingMin: 12, conto: 18.00, kitchen: 'ordinato', note: null, nextReservation: null },
  { id: 10, state: 'prenotato',posti: 6, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, nextReservation: { time: '20:45', name: 'Bruno (azienda)', posti: 6, inMin: 22 } },
  { id: 11, state: 'occupato', posti: 4, coperti: 4, byup: 4, party: 'Longo', sittingMin: 95, conto: 142.00, kitchen: 'da liberare', note: null, nextReservation: { time: '22:15', name: 'Fabbri', posti: 4, inMin: 165 } },
  { id: 12, state: 'libero',   posti: 4, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, nextReservation: { time: '20:00', name: 'Nardi', posti: 3, inMin: 40 } },
  { id: 13, state: 'occupato', posti: 2, coperti: 2, byup: 2, party: 'Costa', sittingMin: 8, conto: 0, kitchen: 'in attesa', note: null, nextReservation: null },
  { id: 14, state: 'dapulire', posti: 4, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, freedMinAgo: 12, nextReservation: null },
  { id: 15, state: 'occupato', posti: 6, coperti: 6, byup: 0, party: 'Fiori (compleanno)', sittingMin: 38, conto: 96.00, kitchen: 'primi in cottura', note: 'Bambini: 2 menù piccolo', nextReservation: null },
  { id: 16, state: 'libero',   posti: 2, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: null, nextReservation: null },
  { id: 17, state: 'occupato', posti: 4, coperti: 4, byup: 2, party: 'Fontana', sittingMin: 22, conto: 38.00, kitchen: 'antipasti', note: null, nextReservation: null },
  { id: 18, state: 'prenotato',posti: 8, coperti: 0, byup: 0, party: null, sittingMin: 0, conto: 0, kitchen: null, note: 'Gruppo aziendale · menù degustazione', nextReservation: { time: '21:00', name: 'De Luca (azienda)', posti: 8, inMin: 75 } },
];

// KPI live calcolati dai tavoli
const SALA_KPI = (() => {
  const occ = SALA_TAVOLI.filter(t => t.state === 'occupato').length;
  const tot = SALA_TAVOLI.length;
  const conto = SALA_TAVOLI.reduce((s,t) => s + (t.conto || 0), 0);
  const prenStasera = SALA_TAVOLI.filter(t => t.nextReservation).length + 4;
  const byup = SALA_TAVOLI.reduce((s,t) => s + t.byup, 0);
  return { occupati: occ, totale: tot, incassoOggi: conto + 1240, prenotazioniStasera: prenStasera, ospitByup: byup };
})();

const SALA_CONTI_APERTI = Array.from({length: 5}, (_, i) => ({
  tavolo: 1,
  liberato: '14:30',
  cliente: 'Mario Rossi',
  totTavolo: 85.00,
  daSaldare: 45.00,
}));

// Vendita diretta — menu reale con immagini, varianti, ingredienti, extras
const SALA_VENDITA_PIATTI = [
  { id: 1, name: 'Espresso', price: 1.50, cat: 'Bar', emoji: '☕',
    img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop' },
  { id: 2, name: 'Cappuccino', price: 1.80, cat: 'Bar', emoji: '☕',
    img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop',
    variants: [{ group: 'Latte', required: true, options: [{name:'Intero'},{name:'Scremato'},{name:'Soia',extra:0.50},{name:'Avena',extra:0.50}] }] },
  { id: 3, name: 'Cornetto', price: 2.00, cat: 'Bar', emoji: '🥐',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop',
    variants: [{ group: 'Tipo', required: true, options: [{name:'Vuoto'},{name:'Crema'},{name:'Cioccolato'},{name:'Marmellata'},{name:'Vegano',extra:0.30}] }] },
  { id: 4, name: 'Spritz', price: 6.50, cat: 'Bar', emoji: '🍹',
    img: 'https://images.unsplash.com/photo-1605270012917-bf357a1fae9e?w=400&auto=format&fit=crop',
    variants: [{ group: 'Aperitivo', required: true, options: [{name:'Aperol'},{name:'Campari'},{name:'Hugo'},{name:'Cynar'}] }],
    extras: [{name:'Stuzzichini',price:2.00}] },
  { id: 5, name: 'Tagliere misto', price: 14.00, cat: 'Antipasti', emoji: '🧀',
    img: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&auto=format&fit=crop',
    extras: [{name:'Burrata',price:3.00},{name:'Bresaola',price:2.50}] },
  { id: 6, name: 'Bruschetta al pomodoro', price: 7.50, cat: 'Antipasti', emoji: '🍞',
    img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&auto=format&fit=crop',
    ingredients: [{name:'Aglio',removable:true},{name:'Basilico',removable:true},{name:'Origano',removable:true}] },
  { id: 7, name: 'Pasta carbonara', price: 12.00, cat: 'Primi piatti', emoji: '🍝',
    img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&auto=format&fit=crop',
    variants: [{ group: 'Cottura', required: true, options: [{name:'Al dente'},{name:'Cottura media'},{name:'Ben cotta'}] }],
    ingredients: [{name:'Pepe',removable:true},{name:'Guanciale',removable:true,allergen:true}],
    extras: [{name:'Pecorino extra',price:1.50}] },
  { id: 8, name: 'Lasagna', price: 13.50, cat: 'Primi piatti', emoji: '🍝',
    img: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=400&auto=format&fit=crop',
    ingredients: [{name:'Besciamella',removable:true},{name:'Parmigiano',removable:true,allergen:true},{name:'Noce moscata',removable:true}] },
  { id: 13, name: 'Tagliata di manzo', price: 18.00, cat: 'Secondi piatti', emoji: '🥩',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop',
    variants: [
      { group: 'Cottura', required: true, options: [{name:'Al sangue'},{name:'Media'},{name:'Ben cotta'}] },
      { group: 'Condimento', required: false, options: [{name:'Rucola e grana'},{name:'Salsa pepe verde'},{name:'Aceto balsamico'}] },
    ],
    ingredients: [{name:'Rosmarino',removable:true},{name:'Sale grosso',removable:true}],
    extras: [{name:'Patate al forno',price:3.50}] },
  { id: 14, name: 'Bistecca fiorentina', price: 32.00, cat: 'Secondi piatti', emoji: '🥩',
    img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&auto=format&fit=crop',
    variants: [
      { group: 'Cottura', required: true, options: [{name:'Al sangue'},{name:'Media'}] },
      { group: 'Taglio', required: true, options: [{name:'Costata'},{name:'Filetto'}] },
    ],
    extras: [{name:'Contorno verdure',price:4.00}] },
  { id: 15, name: 'Branzino al forno', price: 22.00, cat: 'Secondi piatti', emoji: '🐟',
    img: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&auto=format&fit=crop',
    variants: [{ group: 'Preparazione', required: true, options: [{name:'In crosta di sale'},{name:'Al limone'},{name:'Mediterranea'}] }],
    ingredients: [{name:'Olive',removable:true},{name:'Capperi',removable:true},{name:'Pomodorini',removable:true}] },
  { id: 9, name: 'Margherita', price: 9.00, cat: 'Pizze', emoji: '🍕',
    img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&auto=format&fit=crop',
    variants: [{ group: 'Impasto', required: true, options: [{name:'Classico'},{name:'Integrale',extra:1.00},{name:'Senza glutine',extra:2.00}] }],
    extras: [{name:'Mozzarella di bufala',price:2.00},{name:'Basilico fresco',price:0.50},{name:'Olio piccante',price:0.50}] },
  { id: 10, name: 'Diavola', price: 11.00, cat: 'Pizze', emoji: '🍕',
    img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop',
    variants: [{ group: 'Impasto', required: true, options: [{name:'Classico'},{name:'Integrale',extra:1.00},{name:'Senza glutine',extra:2.00}] }],
    ingredients: [{name:'Salame piccante',removable:true},{name:'Origano',removable:true}] },
  { id: 11, name: 'Tiramisù', price: 6.00, cat: 'Dolci', emoji: '🍰',
    img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop' },
  { id: 12, name: 'Panna cotta', price: 5.50, cat: 'Dolci', emoji: '🍮',
    img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&auto=format&fit=crop',
    variants: [{ group: 'Topping', required: false, options: [{name:'Frutti di bosco'},{name:'Caramello'},{name:'Cioccolato'}] }] },
];

const SALA_VENDITA_CATS = {
  'Bar': { color: '#92400E', bg: '#FEF3C7', icon: 'coffee' },
  'Antipasti': { color: '#9A3412', bg: '#FFEDD5', icon: 'leaf' },
  'Primi piatti': { color: '#9D174D', bg: '#FCE7F3', icon: 'pasta' },
  'Pizze': { color: '#7C2D12', bg: '#FED7AA', icon: 'pizza' },
  'Secondi piatti': { color: '#7F1D1D', bg: '#FECACA', icon: 'meat' },
  'Dolci': { color: '#831843', bg: '#FBCFE8', icon: 'cake' },
};

const SALA_CALENDAR_TAVOLI = Array.from({length: 15}, (_, i) => ({
  num: 10 + i,
  posti: 8,
}));

// Stati prenotazione: confermata | inattesa | arrivata | noshow | cancellata
const SALA_PRENOTAZIONI_GRID = [
  { tavolo: 0, slot: 1, name: 'Martina Ciani', posti: 4, status: 'byup', resStatus: 'confermata', durata: 2, note: null, phone: '+39 333 1234567' },
  { tavolo: 1, slot: 4, name: 'Luca Rossi', posti: 2, status: 'byup', resStatus: 'confermata', durata: 1.5, note: 'Tavolo finestra', phone: '+39 347 9988776' },
  { tavolo: 2, slot: 0, name: 'Giulia Verdi', posti: 3, status: 'byup', resStatus: 'arrivata', durata: 2, note: null, phone: '+39 320 5544332' },
  { tavolo: 3, slot: 3, name: 'Marco Bianchi', posti: 5, status: 'byup', resStatus: 'inattesa', durata: 2, note: 'Allergia noci', phone: '+39 366 7788990' },
  { tavolo: 4, slot: 0, name: 'Sofia Neri', posti: 6, status: 'byup', resStatus: 'confermata', durata: 2.5, note: 'Compleanno · torta', phone: '+39 339 4455667' },
  { tavolo: 5, slot: 2, name: 'Alessandro Gallo', posti: 8, status: 'manuale', resStatus: 'confermata', durata: 3, note: 'Cena aziendale', phone: '+39 392 1122334' },
  { tavolo: 6, slot: 1, name: 'Chiara Bruno', posti: 2, status: 'byup', resStatus: 'noshow', durata: 1.5, note: null, phone: '+39 348 9988221' },
  { tavolo: 7, slot: 2, name: 'Matteo Longo', posti: 7, status: 'byup', resStatus: 'confermata', durata: 2, note: null, phone: '+39 351 2233445' },
  { tavolo: 8, slot: 1, name: 'Elena Fabbri', posti: 4, status: 'byup', resStatus: 'confermata', durata: 2, note: null, phone: '+39 333 5566778' },
  { tavolo: 9, slot: 3, name: 'Giorgio Nardi', posti: 3, status: 'manuale', resStatus: 'confermata', durata: 1.5, note: null, phone: '+39 340 6677889' },
  { tavolo: 10, slot: 2, name: 'Francesca Costa', posti: 5, status: 'byup', resStatus: 'confermata', durata: 2, note: 'Promo San Valentino', phone: '+39 349 7788990', promo: true },
  { tavolo: 11, slot: 1, name: 'Roberto Fiori', posti: 6, status: 'byup', resStatus: 'arrivata', durata: 2.5, note: null, phone: '+39 366 8899001' },
  { tavolo: 12, slot: 2, name: 'Anna Fontana', posti: 2, status: 'byup', resStatus: 'cancellata', durata: 1.5, note: null, phone: '+39 388 9900112' },
  { tavolo: 13, slot: 0, name: 'Simone De Luca', posti: 7, status: 'byup', resStatus: 'confermata', durata: 2, note: null, phone: '+39 327 1011213' },
  { tavolo: 14, slot: 4, name: 'Cecilia Riva', posti: 3, status: 'byup', resStatus: 'inattesa', durata: 2, note: null, phone: '+39 339 1213141' },
];

const SALA_PRENOTAZIONI_LIST = [
  { time: '20:30', tavolo: 4, name: 'Martina Franco', posti: 4, resStatus: 'inarrivo' },
  { time: '20:45', tavolo: 10, name: 'Bruno (azienda)', posti: 6, resStatus: 'inarrivo' },
  { time: '21:00', tavolo: 2, name: 'Bianchi', posti: 2, resStatus: 'confermata' },
  { time: '21:00', tavolo: 18, name: 'De Luca (azienda)', posti: 8, resStatus: 'confermata' },
  { time: '21:30', tavolo: 6, name: 'Conti', posti: 4, resStatus: 'confermata' },
  { time: '22:15', tavolo: 11, name: 'Fabbri', posti: 4, resStatus: 'confermata' },
];

window.SALA_TAVOLI = SALA_TAVOLI;
window.SALA_KPI = SALA_KPI;
window.SALA_CONTI_APERTI = SALA_CONTI_APERTI;
window.SALA_VENDITA_PIATTI = SALA_VENDITA_PIATTI;
window.SALA_VENDITA_CATS = SALA_VENDITA_CATS;
window.SALA_CALENDAR_TAVOLI = SALA_CALENDAR_TAVOLI;
window.SALA_PRENOTAZIONI_GRID = SALA_PRENOTAZIONI_GRID;
window.SALA_PRENOTAZIONI_LIST = SALA_PRENOTAZIONI_LIST;

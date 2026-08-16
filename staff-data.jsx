// byup Staff — Mock data

const STAFF_USER = {
  nome: 'Marco Rinaldi',
  ruolo: 'Cameriere',
  account: 'N° 00001',
  locale: 'Trattoria del Borgo',
  turno: '17:00 – 23:30',
  copertura: 12,  // tavoli assegnati
  oggi: { ordini: 24, scontrino: 42, mance: 18 },
};

// ─── Tavoli ────────────────────────────────────────────────
// stato: libero | prenotato | occupato | pronto | conto
const TAVOLI = [
  { id: 23, n: 23, stato: 'pronto',   coperti: 4, sedutiDa: 52, ordini: 7, saldo: 80, allergie: ['glutine'], note: 'Compleanno · candelina al dolce', cameriere: 'Marco', azione: '2 piatti pronti da servire' },
  { id: 24, n: 24, stato: 'occupato', coperti: 2, sedutiDa: 18, ordini: 4, saldo: 180, allergie: [], note: null, cameriere: 'Marco', azione: 'Antipasti consegnati' },
  { id: 25, n: 25, stato: 'occupato', coperti: 6, sedutiDa: 35, ordini: 9, saldo: 280, allergie: ['lattosio', 'noci'], note: 'Bambini piccoli', cameriere: 'Marco', azione: 'Primi in cucina' },
  { id: 26, n: 26, stato: 'conto',    coperti: 2, sedutiDa: 78, ordini: 5, saldo: 60, allergie: [], note: null, cameriere: 'Marco', azione: 'Conto richiesto' },
  { id: 12, n: 12, stato: 'occupato', coperti: 3, sedutiDa: 8,  ordini: 2, saldo: 24, allergie: [], note: null, cameriere: 'Giulia', azione: 'Hanno appena ordinato' },
  { id: 18, n: 18, stato: 'occupato', coperti: 4, sedutiDa: 65, ordini: 8, saldo: 156, allergie: ['pesce'], note: null, cameriere: 'Marco', azione: 'In attesa secondi' },
];

const TAVOLI_LIBERI = [
  { id: 40, n: 40, stato: 'prenotato', coperti: 4, prenotazione: { quando: '1h 25\'', nome: 'Famiglia Rossi', tel: '+39 333 ...' } },
  { id: 12, n: 12, stato: 'prenotato', coperti: 2, prenotazione: { quando: '50\'', nome: 'Bianchi', tel: '+39 348 ...' } },
  { id: 4,  n: 4,  stato: 'prenotato', coperti: 6, prenotazione: { quando: '3h 25\'', nome: 'Gruppo Conti', tel: '+39 320 ...' } },
  { id: 21, n: 21, stato: 'prenotato', coperti: 2, prenotazione: { quando: '5h 25\'', nome: 'Sig. Marini', tel: '+39 339 ...' } },
  { id: 30, n: 30, stato: 'libero',    coperti: 2, prenotazione: null },
  { id: 31, n: 31, stato: 'libero',    coperti: 4, prenotazione: null },
];

// ─── Menu ─────────────────────────────────────────────────
const CATEGORIE = [
  { id: 'antipasti', label: 'Antipasti' },
  { id: 'primi',     label: 'Primi piatti' },
  { id: 'secondi',   label: 'Secondi piatti' },
  { id: 'contorni',  label: 'Contorni' },
  { id: 'dolci',     label: 'Dolci' },
  { id: 'bevande',   label: 'Bevande' },
];

const PIATTI = [
  // Antipasti
  { id: 'p1', cat: 'antipasti', nome: 'Fritto all\'Italiana', prezzo: 12, descr: 'Fritto misto all\'Italiana che include suppli, fiore di zucca fritto e olive all\'ascolane.', allergeni: ['glutine','uova'], extras: [{ id:'e1', nome: 'Maionese', prezzo: 1.5 },{ id:'e2', nome: 'Salsa rosa', prezzo: 1.5 }] },
  { id: 'p2', cat: 'antipasti', nome: 'Tagliere misto', prezzo: 18, descr: 'Selezione di salumi e formaggi locali.', allergeni: ['lattosio'], extras: [] },
  { id: 'p3', cat: 'antipasti', nome: 'Impepata di cozze', prezzo: 14, descr: 'Cozze fresche al pepe nero con crostini.', allergeni: ['glutine','crost'], extras: [] },
  { id: 'p4', cat: 'antipasti', nome: 'Carciofi alla giudia', prezzo: 11, descr: 'Carciofo intero fritto, croccante fuori e morbido dentro.', allergeni: [], extras: [] },
  { id: 'p5', cat: 'antipasti', nome: 'Focaccia', prezzo: 6, descr: 'Focaccia ligure con olio e rosmarino.', allergeni: ['glutine'], extras: [] },
  // Primi
  { id: 'p10', cat: 'primi', nome: 'Carbonara', prezzo: 14, descr: 'La classica romana con guanciale, uovo e pecorino.', allergeni: ['uova','lattosio','glutine'], extras: [{ id:'e3', nome:'Tartufo', prezzo: 8 }], cottura: ['Al dente','Al punto'] },
  { id: 'p11', cat: 'primi', nome: 'Spaghetti aglio e olio', prezzo: 15, descr: 'Aglio e olio è un classico napoletano e romano. Olio d\'oliva, aglio, peperoncino.', allergeni: ['glutine'], extras: [{ id:'e4', nome:'Olive nere', prezzo: 5 },{ id:'e5', nome:'Pomodorini', prezzo: 3 },{ id:'e6', nome:'Pecorino', prezzo: 2 }], cottura: ['Al dente','Al punto'] },
  { id: 'p12', cat: 'primi', nome: 'Amatriciana', prezzo: 14, descr: 'Pasta con guanciale, pomodoro e pecorino romano.', allergeni: ['lattosio','glutine'], extras: [], cottura: ['Al dente','Al punto'] },
  { id: 'p13', cat: 'primi', nome: 'Cacio e pepe', prezzo: 13, descr: 'Solo tre ingredienti: tonnarelli, pecorino, pepe.', allergeni: ['lattosio','glutine'], extras: [], cottura: ['Al dente','Al punto'] },
  // Secondi
  { id: 'p20', cat: 'secondi', nome: 'Saltimbocca alla romana', prezzo: 22, descr: 'Vitello, prosciutto, salvia. Servito con patate.', allergeni: ['glutine'], extras: [] },
  { id: 'p21', cat: 'secondi', nome: 'Coda alla vaccinara', prezzo: 24, descr: 'Stracotto a lunga cottura con sedano e cacao.', allergeni: ['sedano'], extras: [] },
  { id: 'p22', cat: 'secondi', nome: 'Branzino al sale', prezzo: 28, descr: 'Pescato del giorno in crosta di sale.', allergeni: ['pesce'], extras: [] },
  // Bevande
  { id: 'b1', cat: 'bevande', nome: 'Acqua Panna 1L', prezzo: 3, descr: 'Naturale.', allergeni: [], extras: [] },
  { id: 'b2', cat: 'bevande', nome: 'Vino Chianti 750ml', prezzo: 22, descr: 'Chianti Classico DOCG.', allergeni: [], extras: [] },
  { id: 'b3', cat: 'bevande', nome: 'Aperol Spritz', prezzo: 8, descr: 'Aperol, Prosecco e soda. Guarnito con arancia. Aperitivo classico, fresco e leggermente amaro.', allergeni: [], extras: [{ id:'b3e1', nome:'Arancia', prezzo: 0 },{ id:'b3e2', nome:'Menta', prezzo: 0 }], cottura: null, livello: ['Normale','Poco alcohol'] },
  { id: 'b4', cat: 'bevande', nome: 'Birra Moretti 0.4L', prezzo: 5, descr: 'Lager italiana alla spina.', allergeni: ['glutine'], extras: [] },
];

// ─── Ordine corrente di Tavolo 23 (esempio) ───────────────
const ORDINE_T23 = [
  { id: 'o1', piattoId: 'p1', nome: 'Fritto all\'Italiana', cat: 'antipasti', prezzo: 12, qty: 2, stato: 'consegnato', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 50 },
  { id: 'o2', piattoId: 'p3', nome: 'Impepata di cozze', cat: 'antipasti', prezzo: 14, qty: 1, stato: 'consegnato', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 50 },
  { id: 'o3', piattoId: 'p10', nome: 'Carbonara', cat: 'primi', prezzo: 14, qty: 2, stato: 'pronto', note: 'Una senza pepe', extras: [], inviatoDa: 'Marco', minutiFa: 4, cottura: 'Al dente' },
  { id: 'o4', piattoId: 'p12', nome: 'Amatriciana', cat: 'primi', prezzo: 14, qty: 1, stato: 'pronto', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 4, cottura: 'Al dente' },
  { id: 'o5', piattoId: 'p20', nome: 'Saltimbocca alla romana', cat: 'secondi', prezzo: 22, qty: 1, stato: 'cucina', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 2 },
  { id: 'o6', piattoId: 'b2', nome: 'Vino Chianti 750ml', cat: 'bevande', prezzo: 22, qty: 1, stato: 'consegnato', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 50 },
];

// ─── Coda cucina (vista Ordini globale) ───────────────────
const CODA_CUCINA = [
  // Da inviare (composti dal cameriere ma non ancora firato)
  { tavolo: 25, stato: 'da-inviare', piatti: [
    { id:'q1', nome: 'Cacio e pepe', qty: 2 },
    { id:'q2', nome: 'Amatriciana', qty: 1 },
  ], creatoMinFa: 1 },
  // Attivi (in cucina)
  { tavolo: 23, stato: 'attivo', piatti: [
    { id:'q3', nome: 'Saltimbocca alla romana', qty: 1, da: 'Marco' },
  ], minutiInCucina: 2 },
  { tavolo: 18, stato: 'attivo', piatti: [
    { id:'q4', nome: 'Branzino al sale', qty: 1 },
    { id:'q5', nome: 'Cacio e pepe', qty: 2 },
  ], minutiInCucina: 8 },
  { tavolo: 25, stato: 'attivo', piatti: [
    { id:'q6', nome: 'Carbonara', qty: 3 },
  ], minutiInCucina: 6 },
  // Pronti (da consegnare)
  { tavolo: 23, stato: 'pronto', piatti: [
    { id:'q7', nome: 'Carbonara', qty: 2 },
    { id:'q8', nome: 'Amatriciana', qty: 1 },
  ], minutiPronto: 1 },
  { tavolo: 24, stato: 'pronto', piatti: [
    { id:'q9', nome: 'Tagliere misto', qty: 1 },
  ], minutiPronto: 3 },
];

// ─── Cliente split bill (per pagamento) ────────────────────
const CLIENTI_T23 = [
  { id: 'c1', nome: 'Marco', piatti: ['o1','o3'] },
  { id: 'c2', nome: 'Giuseppe', piatti: ['o2','o4'] },
  { id: 'c3', nome: 'Martina', piatti: ['o5'] },
  { id: 'g1', nome: 'Ospite 1', piatti: [] },
  { id: 'g2', nome: 'Ospite 2', piatti: [] },
];

Object.assign(window, { STAFF_USER, TAVOLI, TAVOLI_LIBERI, CATEGORIE, PIATTI, ORDINE_T23, CODA_CUCINA, CLIENTI_T23 });

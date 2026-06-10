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

// ─── Impostazioni operative ────────────────────────────────
// tracciaConsegne: se attiva, l'app segnala i piatti pronti dalla cucina
// e permette di segnarli come consegnati. Se disattivata non traccia nulla.
const STAFF_SETTINGS = { tracciaConsegne: true };

// ─── Tavoli ────────────────────────────────────────────────
// stato: libero | occupato | prenotato | da-pulire
// pronti: numero di piatti pronti in cucina da servire a questo tavolo (alert)
// piattiPronti: dettaglio dei piatti pronti (nome + qty) per l'anteprima senza
//               immagine in card Sala — fa capire al volo cosa consegnare.
// daInviare: numero di piatti ordinati dal tavolo in attesa di approvazione
//            del cameriere prima di essere inviati in cucina (default 0)
const TAVOLI = [
  { id: 23, n: 23, stato: 'occupato', coperti: 4, sedutiDa: 52, ordini: 7, saldo: 80, pronti: 3, piattiPronti: [{ nome: 'Carbonara', qty: 1 }, { nome: 'Carbonara', qty: 1 }, { nome: 'Amatriciana', qty: 1 }], daInviare: 0, allergie: ['glutine'], note: 'Compleanno · candelina al dolce', cameriere: 'Marco', azione: 'In sala' },
  { id: 24, n: 24, stato: 'occupato', coperti: 2, sedutiDa: 18, ordini: 4, saldo: 180, pronti: 1, piattiPronti: [{ nome: 'Tagliere misto', qty: 1 }], daInviare: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Antipasti consegnati' },
  { id: 25, n: '25-32', stato: 'occupato', coperti: 8, sedutiDa: 35, ordini: 9, saldo: 280, pronti: 0, daInviare: 2, allergie: ['lattosio', 'noci'], note: 'Tavolo unito · Bambini piccoli', cameriere: 'Marco', azione: 'Primi in cucina' },
  { id: 26, n: 26, stato: 'occupato', coperti: 2, sedutiDa: 78, ordini: 5, saldo: 60, pronti: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Conto richiesto' },
  { id: 12, n: 12, stato: 'occupato', coperti: 3, sedutiDa: 8,  ordini: 2, saldo: 24, pronti: 0, allergie: [], note: null, cameriere: 'Giulia', azione: 'Hanno appena ordinato' },
  { id: 18, n: 18, stato: 'occupato', coperti: 4, sedutiDa: 65, ordini: 8, saldo: 156, pronti: 0, allergie: ['pesce'], note: null, cameriere: 'Marco', azione: 'In attesa secondi' },
  { id: 5,  n: 5,  stato: 'occupato', coperti: 2, sedutiDa: 22, ordini: 3, saldo: 46,  pronti: 0, daInviare: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Primi consegnati' },
  { id: 7,  n: 7,  stato: 'occupato', coperti: 5, sedutiDa: 40, ordini: 6, saldo: 132, pronti: 0, daInviare: 3, allergie: ['glutine'], note: null, cameriere: 'Giulia', azione: 'Ordine da approvare' },
  { id: 9,  n: 9,  stato: 'occupato', coperti: 2, sedutiDa: 12, ordini: 2, saldo: 38,  pronti: 0, daInviare: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Hanno appena ordinato' },
  { id: 14, n: 14, stato: 'occupato', coperti: 6, sedutiDa: 55, ordini: 10, saldo: 210, pronti: 1, piattiPronti: [{ nome: 'Branzino al sale', qty: 1 }], daInviare: 0, allergie: ['lattosio'], note: 'Tavolo rumoroso', cameriere: 'Marco', azione: 'Secondi in cucina' },
  { id: 16, n: 16, stato: 'occupato', coperti: 3, sedutiDa: 70, ordini: 7, saldo: 95,  pronti: 0, daInviare: 0, allergie: [], note: null, cameriere: 'Luca', azione: 'In attesa dolci' },
  { id: 19, n: 19, stato: 'occupato', coperti: 4, sedutiDa: 30, ordini: 5, saldo: 120, pronti: 2, piattiPronti: [{ nome: 'Carciofi alla giudia', qty: 1 }, { nome: 'Carciofi alla giudia', qty: 1 }], daInviare: 0, allergie: ['pesce'], note: null, cameriere: 'Marco', azione: 'Antipasti pronti' },
];

const TAVOLI_LIBERI = [
  { id: 40, n: 40,      stato: 'prenotato', coperti: 4, prenotazione: { quando: '20\'',    nome: 'Famiglia Rossi',  tel: '+39 333 445 5678', tags: ['Compleanno'],                    allergeni: ['glutine', 'uova'],    note: 'Torta portata dal cliente · 2 bambini' } },
  { id: 8,  n: 8,       stato: 'prenotato', coperti: 4, prenotazione: { quando: '35\'',    nome: 'Ferrari',         tel: '+39 351 234 5678', tags: ['Business'],                      allergeni: [],                     note: null } },
  { id: 12, n: 12,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '50\'',    nome: 'Bianchi',         tel: '+39 348 765 4321', tags: [],                                allergeni: ['lattosio'],           note: null } },
  { id: 4,  n: 4,       stato: 'prenotato', coperti: 6, prenotazione: { quando: '1h 25\'', nome: 'Gruppo Conti',    tel: '+39 320 111 2233', tags: ['Evento aziendale', 'Menu fisso'], allergeni: ['glutine', 'soia'],    note: '2 intolleranti al glutine' } },
  { id: 21, n: 21,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '3h',      nome: 'Sig. Marini',     tel: '+39 339 987 6543', tags: [],                                allergeni: [],                     note: null } },
  { id: 42, n: 42,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '4h',      nome: 'Sig.ra Galli',    tel: '+39 347 654 3210', tags: ['Anniversario'],                  allergeni: ['pesce', 'crost'],     note: 'Decorazioni sul tavolo' } },
  { id: 28, n: 28,      stato: 'da-pulire', coperti: 4, prenotazione: null },
  { id: 6,  n: 6,       stato: 'da-pulire', coperti: 4, prenotazione: null },
  { id: 33, n: '33-34', stato: 'libero',    coperti: 4, prenotazione: null },
  { id: 35, n: '35-36', stato: 'libero',    coperti: 6, prenotazione: null },
  { id: 30, n: 30,      stato: 'libero',    coperti: 2, prenotazione: null },
  { id: 31, n: 31,      stato: 'libero',    coperti: 4, prenotazione: null },
  { id: 1,  n: 1,       stato: 'libero',    coperti: 2, prenotazione: null },
  { id: 2,  n: 2,       stato: 'libero',    coperti: 2, prenotazione: null },
  { id: 41, n: 41,      stato: 'libero',    coperti: 6, prenotazione: null },
];

// ─── Store reattivo dei tavoli ─────────────────────────────
// Stato condiviso tra Sala, dettaglio tavolo e modali: così le azioni
// (unisci, dividi, coperti, consegna, invio) si riflettono ovunque.
const TavoliStore = (() => {
  let attivi = TAVOLI;
  let liberi = TAVOLI_LIBERI;
  const subs = new Set();
  const emit = () => subs.forEach(fn => fn());
  const api = {
    getAttivi: () => attivi,
    getLiberi: () => liberi,
    setAttivi: (next) => { attivi = typeof next === 'function' ? next(attivi) : next; emit(); },
    setLiberi: (next) => { liberi = typeof next === 'function' ? next(liberi) : next; emit(); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };

  // Azioni di dominio
  api.setCoperti = (id, n) =>
    api.setAttivi(prev => prev.map(t => t.id === id ? { ...t, coperti: n } : t));
  // Coperti di un tavolo nella sezione Liberi (libero/prenotato): editabile
  // inline dalla card prima di attivare il tavolo.
  api.setCopertiLibero = (id, n) =>
    api.setLiberi(prev => prev.map(t => t.id === id ? { ...t, coperti: n } : t));

  // Unisci e dividi operano sulla lista che contiene il tavolo base: così la
  // stessa modale funziona sia per gli Occupati sia per i Liberi. Se il tavolo
  // base è libero, l'unione resta tra i Liberi (capacità sommata) e la divisione
  // rigenera tavoli liberi; se è attivo vale la semantica del servizio in corso.
  api.unisci = (id, numeri) => {
    const add = numeri.map(String);
    const inLiberi = liberi.some(t => t.id === id);
    const copertiAssorbiti = liberi
      .filter(t => add.includes(String(t.n)))
      .reduce((s, t) => s + (t.coperti || 0), 0);
    const setBase = inLiberi ? api.setLiberi : api.setAttivi;
    setBase(prev => prev.map(t => {
      if (t.id !== id) return t;
      const parti = String(t.n).split('-').map(s => s.trim());
      return { ...t, n: [...parti, ...add].join('-'), coperti: (t.coperti || 0) + copertiAssorbiti };
    }));
    // I tavoli assorbiti escono dai Liberi; il tavolo base resta dov'è.
    api.setLiberi(prev => prev.filter(t => t.id === id || !add.includes(String(t.n))));
  };

  api.dividi = (id, partiDaSeparare) => {
    const sep = partiDaSeparare.map(String);
    const inLiberi = liberi.some(t => t.id === id);
    // Parti separate: se il gruppo era libero tornano libere, se era attivo
    // (clienti già seduti) vanno sparecchiate prima di riusarle.
    const statoParti = inLiberi ? 'libero' : 'da-pulire';
    const setBase = inLiberi ? api.setLiberi : api.setAttivi;
    setBase(prev => prev.map(t => {
      if (t.id !== id) return t;
      const restanti = String(t.n).split('-').map(s => s.trim()).filter(p => !sep.includes(p));
      return { ...t, n: restanti.join('-') };
    }));
    api.setLiberi(prev => [
      ...prev,
      ...sep.map(p => ({ id: Number(p) || p, n: p, stato: statoParti, coperti: 2, prenotazione: null })),
    ]);
  };

  api.segnaConsegnato = (id) =>
    api.setAttivi(prev => prev.map(t => t.id === id ? { ...t, pronti: 0, piattiPronti: [] } : t));
  // Consegna di un singolo piatto: lo toglie dalla lista e aggiorna il conteggio.
  api.segnaPiattoConsegnato = (id, idx) =>
    api.setAttivi(prev => prev.map(t => {
      if (t.id !== id) return t;
      const piattiPronti = (t.piattiPronti || []).filter((_, i) => i !== idx);
      const pronti = piattiPronti.reduce((s, p) => s + p.qty, 0);
      return { ...t, piattiPronti, pronti };
    }));
  api.inviaCucina = (id) =>
    api.setAttivi(prev => prev.map(t => t.id === id ? { ...t, daInviare: 0 } : t));
  api.segnaPulito = (id) =>
    api.setLiberi(prev => prev.map(t => t.id === id ? { ...t, stato: 'libero' } : t));
  // No show: la prenotazione non si è presentata → tavolo torna libero.
  api.noShow = (id) =>
    api.setLiberi(prev => prev.map(t => t.id === id ? { ...t, stato: 'libero', prenotazione: null } : t));
  // Chiusura forzata: toglie il tavolo dagli occupati e lo mette tra i liberi
  // in stato "da-pulire" (anche se non saldato).
  api.liberaTavolo = (id) => {
    const t = attivi.find(x => x.id === id);
    if (!t) return;
    api.setAttivi(prev => prev.filter(x => x.id !== id));
    api.setLiberi(prev => [...prev, { id: t.id, n: t.n, stato: 'da-pulire', coperti: t.coperti, prenotazione: null }]);
  };

  return api;
})();

// Hook: sottoscrive un componente allo store e ne forza il re-render ai cambi.
function useTavoli() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => TavoliStore.subscribe(force), []);
  return { attivi: TavoliStore.getAttivi(), liberi: TavoliStore.getLiberi(), store: TavoliStore };
}

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

// ─── Sale disponibili ─────────────────────────────────────
const SALE = [
  { id: 'principale', nome: 'Sala principale', desc: '42 coperti · 15 tavoli' },
  { id: 'dehor',      nome: 'Dehor',            desc: '24 coperti · 8 tavoli'  },
  { id: 'privata',    nome: 'Sala privata',      desc: '12 coperti · 4 tavoli'  },
];

// Minuti residui alla prenotazione, dal testo "1h 25'" / "50'" / "3h".
// Serve a ordinare i prenotati per imminenza nella sezione Liberi.
function minutiPrenotazione(t) {
  const q = t?.prenotazione?.quando || '';
  const h = /(\d+)\s*h/.exec(q);
  const m = /(\d+)\s*'/.exec(q);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

Object.assign(window, { STAFF_USER, STAFF_SETTINGS, TAVOLI, TAVOLI_LIBERI, TavoliStore, useTavoli, minutiPrenotazione, SALE, CATEGORIE, PIATTI, ORDINE_T23, CODA_CUCINA, CLIENTI_T23 });

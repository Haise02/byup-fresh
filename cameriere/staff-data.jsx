// byup Staff — Mock data

const STAFF_USER = {
  nome: 'Marco',
  cognome: 'Rinaldi',
  email: 'marco.rinaldi@byup.it',
  ruolo: 'Cameriere',
  account: 'N° 00001',
  locale: 'Trattoria del Borgo',
  // Locali a cui il cameriere è abilitato: se più d'uno, dal profilo può
  // switchare quello attivo (STAFF_USER.locale).
  locali: ['Trattoria del Borgo', 'Osteria del Porto'],
  turno: '17:00 – 23:30',
  copertura: 12,  // tavoli assegnati
  oggi: { ordini: 24, scontrino: 42, mance: 18 },
};

// ─── Impostazioni operative ────────────────────────────────
// tolleranzaNoShow: minuti di ritardo oltre i quali una prenotazione è
// considerata no-show (il tavolo va liberato o si decide il da farsi).
// attesaComanda: minuti da seduti oltre i quali un tavolo occupato ancora
// senza ordini va segnalato come "comanda da prendere" (azione operativa).
// Soglie di prenotazione sui tavoli liberi (graduated disclosure):
//  · arrivoImminente: entro questi minuti il tavolo diventa "Prenotato · In arrivo".
//  · preavvisoArrivo: da questa soglia in su (prenotazione ancora lontana, 1h30+)
//    il tavolo LIBERO mostra il preavviso "prenot. tra X"; sotto la soglia (ma
//    oltre l'imminenza) è Libero pulito — manca poco, diventerà presto "In arrivo".
const STAFF_SETTINGS = { tolleranzaNoShow: 15, attesaComanda: 5, arrivoImminente: 30, preavvisoArrivo: 90 };

// ─── Tavoli ────────────────────────────────────────────────
// stato: libero | occupato | prenotato | da-pulire
// pronti: numero di piatti pronti in cucina da servire a questo tavolo (alert)
// piattiPronti: dettaglio dei piatti pronti (nome + qty) per l'anteprima senza
//               immagine in card Sala — fa capire al volo cosa consegnare.
// daInviare: numero di piatti ordinati (dal cameriere o dall'app cliente) in
//            attesa che il cameriere li invii in cucina dal tavolo (default 0)
// source_surface (orders.source_surface — P-168 · D-118): chi ha aperto la
//            sessione: 'webapp_guest' | 'byup_app' = un cliente col QR, e la
//            card porta «dal QR»; verifica: 'limite' | 'rete' = «da verificare».
const TAVOLI = [
  { id: 23, n: 23, stato: 'occupato', coperti: 4, sedutiDa: 52, ordini: 7, saldo: 80, pronti: 3, piattiPronti: [{ nome: 'Carbonara', qty: 1 }, { nome: 'Carbonara', qty: 1 }, { nome: 'Amatriciana', qty: 1 }], daInviare: 0, allergie: ['glutine'], tags: ['Compleanno'], note: 'Candelina al dolce', cameriere: 'Marco', azione: 'In sala' },
  { id: 24, n: 24, stato: 'occupato', coperti: 2, sedutiDa: 18, ordini: 4, saldo: 180, pronti: 1, piattiPronti: [{ nome: 'Tagliere misto', qty: 1 }], daInviare: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Antipasti consegnati' },
  { id: 25, n: '25+32', stato: 'occupato', coperti: 8, sedutiDa: 35, ordini: 9, saldo: 280, pronti: 0, daInviare: 2, daInviareItems: [{ nome: 'Cacio e pepe', qty: 1 }, { nome: 'Amatriciana', qty: 1 }], allergie: ['lattosio', 'noci'], note: 'Tavolo unito · Bambini piccoli', cameriere: 'Marco', azione: 'Primi in cucina' },
  { id: 26, n: 26, stato: 'occupato', coperti: 2, sedutiDa: 78, ordini: 5, saldo: 60, pronti: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Conto richiesto' },
  { id: 12, n: 12, stato: 'occupato', coperti: 3, sedutiDa: 8,  ordini: 2, saldo: 24, pronti: 0, source_surface: 'byup_app', verifica: 'rete', allergie: [], note: null, cameriere: 'Giulia', azione: 'Hanno appena ordinato' },
  { id: 18, n: 18, stato: 'occupato', coperti: 4, sedutiDa: 65, ordini: 8, saldo: 156, pronti: 0, allergie: ['pesce'], note: null, cameriere: 'Marco', azione: 'In attesa secondi' },
  { id: 5,  n: 5,  stato: 'occupato', coperti: 2, sedutiDa: 22, ordini: 3, saldo: 46,  pronti: 0, daInviare: 0, allergie: [], note: null, cameriere: 'Marco', azione: 'Primi consegnati' },
  { id: 7,  n: 7,  stato: 'occupato', coperti: 5, sedutiDa: 40, ordini: 6, saldo: 132, pronti: 0, daInviare: 3, daInviareItems: [{ nome: 'Carbonara', qty: 1 }, { nome: 'Spaghetti aglio e olio', qty: 1 }, { nome: 'Aperol Spritz', qty: 1 }], allergie: ['glutine'], tags: ['Business'], note: null, cameriere: 'Giulia', azione: 'Ordine da inviare' },
  { id: 9,  n: 9,  stato: 'occupato', coperti: 2, sedutiDa: 12, ordini: 2, saldo: 0,   pronti: 0, daInviare: 0, source_surface: 'webapp_guest', allergie: [], note: null, cameriere: 'Marco', azione: 'Hanno appena ordinato' },
  { id: 14, n: 14, stato: 'occupato', coperti: 6, sedutiDa: 55, ordini: 10, saldo: 210, pronti: 1, piattiPronti: [{ nome: 'Branzino al sale', qty: 1 }], daInviare: 0, allergie: ['lattosio'], note: 'Tavolo rumoroso', cameriere: 'Marco', azione: 'Secondi in cucina' },
  { id: 16, n: 16, stato: 'occupato', coperti: 3, sedutiDa: 70, ordini: 7, saldo: 95,  pronti: 0, daInviare: 0, allergie: [], note: null, cameriere: 'Luca', azione: 'In attesa dolci' },
  { id: 19, n: 19, stato: 'occupato', coperti: 4, sedutiDa: 30, ordini: 5, saldo: 120, pronti: 2, piattiPronti: [{ nome: 'Carciofi alla giudia', qty: 1 }, { nome: 'Carciofi alla giudia', qty: 1 }], daInviare: 0, allergie: ['pesce'], note: null, cameriere: 'Marco', azione: 'Antipasti pronti' },
];

const TAVOLI_LIBERI = [
  // Tavoli UNITI prenotati: in arrivo e in ritardo — i due scenari "uniti".
  { id: 45, n: '45+46',  stato: 'prenotato', coperti: 6, prenotazione: { quando: '15\'',    nome: 'Gruppo Esposito', tel: '+39 333 998 7766', tags: ['Compleanno', 'Menu fisso'],     allergeni: ['glutine', 'lattosio'],note: 'Tavolata unica · torta a fine cena' } },
  { id: 50, n: '50+51',  stato: 'prenotato', coperti: 8, prenotazione: { quando: '0\'',      nome: 'Gruppo Bruno',    tel: '+39 333 444 5566', tags: ['Evento aziendale'],              allergeni: ['glutine'],            note: 'Tavolata unica', ritardo: 10 } },
  { id: 40, n: 40,      stato: 'prenotato', coperti: 4, prenotazione: { quando: '20\'',    nome: 'Famiglia Robinson',  tel: '+39 333 445 5678', tags: ['Compleanno'],                    allergeni: ['glutine', 'uova'],    note: 'Torta portata dal cliente · 2 bambini' } },
  // ritardo: minuti oltre l'orario prenotato (mock). > tolleranzaNoShow → no-show.
  { id: 11, n: 11,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '0\'',     nome: 'Greco',           tel: '+39 333 222 1100', tags: [],                                allergeni: [],                     note: null, ritardo: 8 } },
  { id: 17, n: 17,      stato: 'prenotato', coperti: 4, prenotazione: { quando: '0\'',     nome: 'De Luca',         tel: '+39 340 555 7788', tags: ['Anniversario'],                  allergeni: ['glutine'],            note: null, ritardo: 22 } },
  { id: 8,  n: 8,       stato: 'prenotato', coperti: 4, prenotazione: { quando: '35\'',    nome: 'Ferrari',         tel: '+39 351 234 5678', tags: ['Business'],                      allergeni: [],                     note: null } },
  { id: 12, n: 12,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '50\'',    nome: 'Stark',         tel: '+39 348 765 4321', tags: [],                                allergeni: ['lattosio'],           note: null } },
  { id: 4,  n: 4,       stato: 'prenotato', coperti: 6, prenotazione: { quando: '1h 25\'', nome: 'Gruppo Conti',    tel: '+39 320 111 2233', tags: ['Evento aziendale', 'Menu fisso'], allergeni: ['glutine', 'soia'],    note: '2 intolleranti al glutine' } },
  { id: 21, n: 21,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '3h',      nome: 'Sig. Marini',     tel: '+39 339 987 6543', tags: [],                                allergeni: [],                     note: null } },
  { id: 42, n: 42,      stato: 'prenotato', coperti: 2, prenotazione: { quando: '4h',      nome: 'Sig.ra Galli',    tel: '+39 347 654 3210', tags: ['Anniversario'],                  allergeni: ['pesce', 'crost'],     note: 'Decorazioni sul tavolo' } },
  { id: 28, n: 28,      stato: 'da-pulire', coperti: 4, prenotazione: null },
  { id: 6,  n: 6,       stato: 'da-pulire', coperti: 4, prenotazione: null },
  { id: 33, n: '33+34', stato: 'libero',    coperti: 4, prenotazione: null },
  { id: 35, n: '35+36', stato: 'libero',    coperti: 6, prenotazione: null },
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
      const parti = String(t.n).split('+').map(s => s.trim());
      return { ...t, n: [...parti, ...add].join('+'), coperti: (t.coperti || 0) + copertiAssorbiti };
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
      const restanti = String(t.n).split('+').map(s => s.trim()).filter(p => !sep.includes(p));
      // Se viene staccato anche il tavolo base (il cui id coincide col suo
      // numero), il gruppo superstite si RI-ANCORA al primo tavolo rimasto: così
      // non collide con il nuovo libero creato per il vecchio base. Solo sui
      // liberi — su un gruppo attivo l'id porta la comanda e il base non è
      // staccabile (vincolo nell'UI Disgiungi), quindi l'id resta intatto.
      const newId = (inLiberi && restanti[0]) ? (Number(restanti[0]) || restanti[0]) : id;
      return { ...t, id: newId, n: restanti.join('+') };
    }));
    api.setLiberi(prev => [
      ...prev,
      ...sep.map(p => ({ id: Number(p) || p, n: p, stato: statoParti, coperti: 2, prenotazione: null })),
    ]);
  };

  // Sposta un tavolo su uno o PIÙ tavoli destinazione (per numero): se più d'uno
  // la destinazione è il gruppo unito (es. "29+36"). Due casi per la partenza:
  //  · attivo (clienti seduti): la destinazione prende l'ordine, il vecchio va
  //    sparecchiato (da-pulire);
  //  · prenotato/libero: la prenotazione (con i coperti) si sposta sui tavoli
  //    destinazione, il vecchio torna libero.
  // I tavoli destinazione escono sempre dai liberi (vengono occupati dallo spostamento).
  api.spostaTavolo = (id, destN) => {
    const parti = String(destN).split('+').map(s => s.trim());
    const dest = parti.join('+');
    const inAttivi = attivi.some(x => x.id === id);
    if (inAttivi) {
      const t = attivi.find(x => x.id === id);
      const vecchioN = String(t.n);
      api.setAttivi(prev => prev.map(x => x.id === id ? { ...x, n: dest } : x));
      api.setLiberi(prev => [
        ...prev.filter(x => !parti.includes(String(x.n))),
        { id: Number(vecchioN) || vecchioN, n: vecchioN, stato: 'da-pulire', coperti: 2, prenotazione: null },
      ]);
      return;
    }
    const t = liberi.find(x => x.id === id);
    if (!t) return;
    api.setLiberi(prev => [
      ...prev.filter(x => x.id !== id && !parti.includes(String(x.n))),
      { ...t, id: Number(parti[0]) || parti[0], n: dest },
      { id: Number(t.n) || t.n, n: String(t.n), stato: 'libero', coperti: 2, prenotazione: null },
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
    api.setAttivi(prev => prev.map(t => t.id === id ? { ...t, daInviare: 0, daInviareItems: [] } : t));
  // Invio selettivo: manda in cucina solo gli articoli agli indici dati; gli
  // altri restano in attesa. daInviare si ricalcola sulle quantità rimaste.
  api.inviaCucinaItems = (id, indici) =>
    api.setAttivi(prev => prev.map(t => {
      if (t.id !== id) return t;
      const items = t.daInviareItems || [];
      const restanti = items.filter((_, i) => !indici.includes(i));
      const daInviare = restanti.reduce((s, x) => s + (x.qty || 1), 0);
      return { ...t, daInviareItems: restanti, daInviare };
    }));
  // "Lo porto io": scorciatoia del cameriere su un articolo da inviare. NON lo
  // segna consegnato — al momento della comanda non ce l'ha ancora in mano.
  // Lo porta un passo avanti, a "disponibile": esce dai da-inviare ed entra nei
  // piatti pronti del tavolo, quindi compare in Da portare e sparisce solo
  // quando lo consegna davvero. Se si distrae, resta tracciato.
  api.portaDirettoItems = (id, indici) =>
    api.setAttivi(prev => prev.map(t => {
      if (t.id !== id) return t;
      const items = t.daInviareItems || [];
      const presi    = items.filter((_, i) => indici.includes(i));
      const restanti = items.filter((_, i) => !indici.includes(i));
      const piattiPronti = [
        ...(t.piattiPronti || []),
        ...presi.map(x => ({ nome: x.nome, qty: x.qty || 1, diretto: true })),
      ];
      return {
        ...t,
        daInviareItems: restanti,
        daInviare: restanti.reduce((s, x) => s + (x.qty || 1), 0),
        piattiPronti,
        pronti: piattiPronti.reduce((s, p) => s + p.qty, 0),
      };
    }));
  api.segnaPulito = (id) =>
    api.setLiberi(prev => prev.map(t => t.id === id ? { ...t, stato: 'libero' } : t));
  // No show: la prenotazione non si è presentata (ora superata) → tavolo libero.
  api.noShow = (id) =>
    api.setLiberi(prev => prev.map(t => t.id === id ? { ...t, stato: 'libero', prenotazione: null } : t));
  // Cancellazione: la prenotazione viene annullata PRIMA dell'ora. Stesso effetto
  // sul tavolo, ma evento distinto dal no-show (nel gestionale: email/penalità diverse).
  api.cancellaPrenotazione = (id) =>
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
  { id: 'p1', cat: 'antipasti', nome: 'Fritto all\'Italiana', prezzo: 12, descr: 'Fritto misto all\'Italiana che include suppli, fiore di zucca fritto e olive all\'ascolane.', allergeni: ['glutine','uova'], extras: [{ id:'e1', nome: 'Maionese', prezzo: 1.5 },{ id:'e2', nome: 'Salsa rosa', prezzo: 1.5 }], img: 'https://loremflickr.com/400/400/fried,food?lock=1' },
  { id: 'p2', cat: 'antipasti', nome: 'Tagliere misto', prezzo: 18, descr: 'Selezione di salumi e formaggi locali.', allergeni: ['lattosio'], extras: [], img: 'https://loremflickr.com/400/400/charcuterie,cheese?lock=2' },
  { id: 'p3', cat: 'antipasti', nome: 'Impepata di cozze', prezzo: 14, descr: 'Cozze fresche al pepe nero con crostini.', allergeni: ['glutine','crost'], extras: [], img: 'https://loremflickr.com/400/400/mussels,seafood?lock=4' },
  { id: 'p4', cat: 'antipasti', nome: 'Carciofi alla giudia', prezzo: 11, descr: 'Carciofo intero fritto, croccante fuori e morbido dentro.', allergeni: [], extras: [], img: 'https://loremflickr.com/400/400/artichoke,fried?lock=5' },
  { id: 'p5', cat: 'antipasti', nome: 'Focaccia', prezzo: 6, descr: 'Focaccia ligure con olio e rosmarino.', allergeni: ['glutine'], extras: [], img: 'https://loremflickr.com/400/400/focaccia,bread?lock=6' },
  // Primi
  { id: 'p10', cat: 'primi', nome: 'Carbonara', prezzo: 14, descr: 'La classica romana con guanciale, uovo e pecorino.', allergeni: ['uova','lattosio','glutine'], extras: [{ id:'e3', nome:'Tartufo', prezzo: 8 }], cottura: ['Al dente','Al punto'], img: 'https://loremflickr.com/400/400/carbonara,pasta?lock=10' },
  { id: 'p11', cat: 'primi', nome: 'Spaghetti aglio e olio', prezzo: 15, descr: 'Aglio e olio è un classico napoletano e romano. Olio d\'oliva, aglio, peperoncino.', allergeni: ['glutine'], extras: [{ id:'e4', nome:'Olive nere', prezzo: 5 },{ id:'e5', nome:'Pomodorini', prezzo: 3 },{ id:'e6', nome:'Pecorino', prezzo: 2 }], cottura: ['Al dente','Al punto'], img: 'https://loremflickr.com/400/400/spaghetti,pasta?lock=11' },
  { id: 'p12', cat: 'primi', nome: 'Amatriciana', prezzo: 14, descr: 'Pasta con guanciale, pomodoro e pecorino romano.', allergeni: ['lattosio','glutine'], extras: [], cottura: ['Al dente','Al punto'], img: 'https://loremflickr.com/400/400/pasta,tomato?lock=12' },
  { id: 'p13', cat: 'primi', nome: 'Cacio e pepe', prezzo: 13, descr: 'Solo tre ingredienti: tonnarelli, pecorino, pepe.', allergeni: ['lattosio','glutine'], extras: [], cottura: ['Al dente','Al punto'], img: 'https://loremflickr.com/400/400/pasta,cheese?lock=13' },
  // Secondi
  { id: 'p20', cat: 'secondi', nome: 'Saltimbocca alla romana', prezzo: 22, descr: 'Vitello, prosciutto, salvia. Servito con patate.', allergeni: ['glutine'], extras: [], img: 'https://loremflickr.com/400/400/veal,meat?lock=20' },
  { id: 'p21', cat: 'secondi', nome: 'Coda alla vaccinara', prezzo: 24, descr: 'Stracotto a lunga cottura con sedano e cacao.', allergeni: ['sedano'], extras: [], img: 'https://loremflickr.com/400/400/beef,stew?lock=21' },
  { id: 'p22', cat: 'secondi', nome: 'Branzino al sale', prezzo: 28, descr: 'Pescato del giorno in crosta di sale.', allergeni: ['pesce'], extras: [], img: 'https://loremflickr.com/400/400/seabass,fish?lock=22' },
  // Bevande — rotta 'diretto' = la prendi e la porti (nessuno la prepara);
  // lo Spritz va preparato, quindi rotta 'cucina' come il cibo.
  { id: 'b1', cat: 'bevande', nome: 'Acqua Panna 1L', prezzo: 3, descr: 'Naturale.', allergeni: [], extras: [], rotta: 'diretto', img: 'https://loremflickr.com/400/400/water,bottle?lock=31' },
  { id: 'b2', cat: 'bevande', nome: 'Vino Chianti 750ml', prezzo: 22, descr: 'Chianti Classico DOCG.', allergeni: [], extras: [], rotta: 'diretto', img: 'https://loremflickr.com/400/400/wine,bottle?lock=32' },
  { id: 'b3', cat: 'bevande', nome: 'Aperol Spritz', prezzo: 8, descr: 'Aperol, Prosecco e soda. Guarnito con arancia. Aperitivo classico, fresco e leggermente amaro.', allergeni: [], extras: [{ id:'b3e1', nome:'Arancia', prezzo: 0 },{ id:'b3e2', nome:'Menta', prezzo: 0 }], cottura: null, livello: ['Normale','Poco alcohol'], rotta: 'cucina', img: 'https://loremflickr.com/400/400/aperol,spritz,cocktail?lock=3' },
  { id: 'b4', cat: 'bevande', nome: 'Birra Moretti 0.4L', prezzo: 5, descr: 'Lager italiana alla spina.', allergeni: ['glutine'], extras: [], rotta: 'diretto', img: 'https://loremflickr.com/400/400/beer,glass?lock=34' },
];

// ─── Ordine corrente di Tavolo 23 (esempio) ───────────────
const ORDINE_T23 = [
  { id: 'o1', piattoId: 'p1', nome: 'Fritto all\'Italiana', cat: 'antipasti', prezzo: 12, qty: 2, stato: 'consegnato', rotta: 'cucina', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 50 },
  { id: 'o2', piattoId: 'p3', nome: 'Impepata di cozze', cat: 'antipasti', prezzo: 14, qty: 1, stato: 'consegnato', rotta: 'cucina', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 50 },
  { id: 'o3', piattoId: 'p10', nome: 'Carbonara', cat: 'primi', prezzo: 14, qty: 2, stato: 'pronto', rotta: 'cucina', note: 'Una senza pepe', extras: [], inviatoDa: 'Marco', minutiFa: 4, cottura: 'Al dente' },
  { id: 'o4', piattoId: 'p12', nome: 'Amatriciana', cat: 'primi', prezzo: 14, qty: 1, stato: 'pronto', rotta: 'cucina', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 4, cottura: 'Al dente' },
  { id: 'o5', piattoId: 'p20', nome: 'Saltimbocca alla romana', cat: 'secondi', prezzo: 22, qty: 1, stato: 'cucina', rotta: 'cucina', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 2 },
  { id: 'o6', piattoId: 'b2', nome: 'Vino Chianti 750ml', cat: 'bevande', prezzo: 22, qty: 1, stato: 'consegnato', rotta: 'diretto', note: '', extras: [], inviatoDa: 'Marco', minutiFa: 50 },
  { id: 'o7', piattoId: 'p10', nome: 'Carbonara', cat: 'primi', prezzo: 14, qty: 1, stato: 'consegnato', rotta: 'cucina', note: '', extras: [], inviatoDa: 'WebApp', minutiFa: 20 },
];

// ─── Coda cucina + bevande dirette (sorgente di "Da portare") ──
// rotta 'cucina'  → la riga diventa 'pronto' quando la cucina la sforna.
// rotta 'diretto' → niente preparazione: è da portare da subito (no attesa).
const CODA_CUCINA = [
  // Da inviare (composti dal cameriere ma non ancora firato)
  { tavolo: 25, stato: 'da-inviare', rotta: 'cucina', piatti: [
    { id:'q1', nome: 'Cacio e pepe', qty: 2 },
    { id:'q2', nome: 'Amatriciana', qty: 1 },
  ], creatoMinFa: 1 },
  // Attivi (in cucina)
  { tavolo: 23, stato: 'attivo', rotta: 'cucina', piatti: [
    { id:'q3', nome: 'Saltimbocca alla romana', qty: 1, da: 'Marco' },
  ], minutiInCucina: 2 },
  { tavolo: 18, stato: 'attivo', rotta: 'cucina', piatti: [
    { id:'q4', nome: 'Branzino al sale', qty: 1 },
    { id:'q5', nome: 'Cacio e pepe', qty: 2 },
  ], minutiInCucina: 8 },
  { tavolo: 25, stato: 'attivo', rotta: 'cucina', piatti: [
    { id:'q6', nome: 'Carbonara', qty: 3 },
  ], minutiInCucina: 6 },
  // Pronti dalla cucina (da consegnare)
  { tavolo: 23, stato: 'pronto', rotta: 'cucina', piatti: [
    { id:'q7', nome: 'Carbonara', qty: 2 },
    { id:'q8', nome: 'Amatriciana', qty: 1 },
  ], minutiPronto: 1 },
  { tavolo: 24, stato: 'pronto', rotta: 'cucina', piatti: [
    { id:'q9', nome: 'Tagliere misto', qty: 1 },
  ], minutiPronto: 6 },
  // Bevande dirette: da portare subito, nessuna attesa
  { tavolo: 12, stato: 'pronto', rotta: 'diretto', piatti: [
    { id:'q10', nome: 'Acqua Panna 1L', qty: 2 },
    { id:'q11', nome: 'Birra Moretti 0.4L', qty: 1 },
  ] },
  { tavolo: 18, stato: 'pronto', rotta: 'diretto', piatti: [
    { id:'q12', nome: 'Vino Chianti 750ml', qty: 1 },
  ] },
];

// ─── Cliente split bill (per pagamento) ────────────────────
// kind: 'byup' = utente registrato dell'app byup · 'webapp' = ospite entrato
// via QR dalla webapp (kind 'isWebApp' lato consumer). La webapp non incassa,
// quindi i suoi ordini vanno comunque saldati in cassa.
const CLIENTI_T23 = [
  { id: 'c1', nome: 'Marco', kind: 'byup', piatti: ['o1','o3'] },
  { id: 'c2', nome: 'Giuseppe', kind: 'byup', piatti: ['o2','o4'] },
  { id: 'c3', nome: 'Martina', kind: 'byup', piatti: ['o5'] },
  { id: 'w1', nome: 'Sara', kind: 'webapp', piatti: ['o6'] },
  { id: 'w2', nome: 'Luca', kind: 'webapp', piatti: ['o7'] },
  { id: 'g1', nome: 'Ospite 1', kind: 'byup', piatti: [] },
  { id: 'g2', nome: 'Ospite 2', kind: 'byup', piatti: [] },
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

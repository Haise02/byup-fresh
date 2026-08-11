// ══════════════════════════════════════════════════════════════════════════
// byup · KDS — tema, modello, dati finti
//
// Route autonoma: non tocca il KDS attuale (`byup Cucina.html`) né il KDS v2
// (`byup Cucina KDS v2.html`), che esplora la board aggregata per piatto.
// Questa esplora la board per COMANDA.
//
// ── L'UNITÀ È LA COMANDA, NON IL TAVOLO ──────────────────────────────────
// `kitchen_tickets` è ciò che il modello ha davvero: il cameriere compone e
// preme «Invia», e quel gruppo di righe diventa una comanda con un suo
// istante di partenza e un suo stato. Non esiste un contatore di «uscite
// chiamate»: l'invio È la chiamata. Un tavolo con due comande aperte ha due
// card, ognuna col suo tempo — che è la verità, non una semplificazione.
//
// ── UN SOLO TIMER PER VOLTA ──────────────────────────────────────────────
// Da `inviata` finché non è pronta: quanto sta aspettando il cliente.
// Da `pronta` finché non è consegnata: quanto sta morendo sul passe.
// Non convivono mai, quindi non c'è niente da confrontare a colpo d'occhio.
// ══════════════════════════════════════════════════════════════════════════

// ─── TEMA ─────────────────────────────────────────────────────────────────
// Fondo chiaro. Canvas grigio caldo, mai bianco puro — è la stessa famiglia di
// grigio-canvas del resto del gestionale, non un bianco che a fine turno
// affatica di più. Rapporti misurati sulla CARD (bianca: è dove vive quasi
// tutto il testo) e sul FONDO, annotati come nel resto del file.
const K = {
  FONDO:      '#EEF0F3',
  CARD:       '#FFFFFF',
  RIGA:       '#F2F4F7',
  BORDO:      '#E1E5EA',
  BORDO_ALTO: '#7C8794',

  TESTO:   '#12151A',  // 18,3:1 su CARD · 16,0:1 su FONDO
  TESTO_2: '#525A66',  //  7,0:1 su CARD ·  6,1:1 su FONDO
  TESTO_3: '#5B6472',  //  6,0:1 su CARD ·  5,2:1 su FONDO — etichette

  // Testo o icona sopra un riempimento PIENO (bottone pieno, pastiglia di
  // stato, pastiglia allergene): bianco, sempre. Token a parte apposta — non
  // è un riuso di CARD. CARD è la superficie sotto il testo normale, questo è
  // l'inchiostro sopra un colore acceso, e sul tema scuro le due cose
  // coincidevano per coincidenza (FONDO era il colore più scuro E il testo
  // più leggero insieme). Qui sono disaccoppiate apposta, altrimenti un testo
  // chiaro finirebbe sopra un riempimento altrettanto chiaro.
  SU_PIENO: '#FFFFFF',

  // ── I QUATTRO STATI. Non ce n'è un quinto.
  // Ogni stato porta anche una FORMA (il glifo) e una LARGHEZZA (il binario a
  // sinistra della card): chi non distingue rosso e verde vede comunque un
  // binario che raddoppia e un glifo che cambia.
  //   neutro 8px ▢ · ambra 14px ▲ · rosso 20px ■ · verde 14px ✓
  NEUTRO: '#64748B',  //  4,8:1 su CARD ·  4,2:1 su FONDO
  AMBRA:  '#B45309',  //  5,0:1 su CARD · bianco sopra: 5,0:1
  VERDE:  '#166534',  //  7,1:1 su CARD · bianco sopra: 7,1:1
  ROSSO:  '#DC2626',  //  4,8:1 su CARD · bianco sopra: 4,8:1 — non è il rosso
                      //  del brand, che vive solo sul marchio e sul battito e
                      //  non compare mai come riempimento
  BRAND:  '#FF5A5F',

  // Allergene: non è uno stato del tempo, è sicurezza. Canale suo.
  ALLERGENE:    '#A3157A',  // 7,1:1 su CARD · 6,3:1 su ALLERGENE_BG
  ALLERGENE_BG: '#FDECF7',
};

const T = {
  tavolo: { fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 },
  piatto: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 },
  qty:    { fontSize: 30, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  timer:  { fontSize: 30, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' },
  corpo:  { fontSize: 17, fontWeight: 600, lineHeight: 1.3 },
  etich:  { fontSize: 12.5, fontWeight: 800, letterSpacing: '0.10em', lineHeight: 1, textTransform: 'uppercase' },
};

// ─── GEOMETRIA ────────────────────────────────────────────────────────────
// 1920×1080 orizzontale, nessuna sidebar. Non è una pagina che si visita: è un
// dispositivo appeso al muro che fa una cosa sola.
const G = {
  W: 1920, H: 1080,
  BARRA_ALTA: 76, BARRA_BASSA: 76, PAD: 16,
  COL: 4, RIG: 2,
  CARD_W: 460, CARD_H: 440,
  // 64 px su un monitro a parete sono ~11 mm reali: sopra i 9 mm che si danno
  // per un polpastrello dentro un guanto da cucina.
  BERSAGLIO: 64,
};
G.SLOT = G.COL * G.RIG;

// ─── SOGLIE ───────────────────────────────────────────────────────────────
// Un KDS si tara sul campo, dopo un servizio: i numeri stanno tutti qui.
const KDS_ATTESA_AMBRA = 8;   // minuti da «inviata»
const KDS_ATTESA_ROSSO = 14;
// Il pronto non ritirato vira al critico più in fretta di tutti: il piatto è
// finito, perfetto, e sta morendo sul passe mentre nessuno lo guarda.
const KDS_RITIRO_AMBRA = 2;
const KDS_RITIRO_ROSSO = 4;
// Sei secondi: il tempo di accorgersi dell'errore mentre la mano è ancora sullo
// schermo, non il tempo di ripensarci.
const KDS_UNDO_MS = 6000;
const KDS_HEARTBEAT_ALLARME_S = 12;

// ─── TEMPO ────────────────────────────────────────────────────────────────
const kdsMin = ms => Math.max(0, Math.floor(ms / 60000));
function kdsOrario(ts) {
  if (ts == null) return '—';
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
// Due formati per due significati, e non si somigliano: `12′` è l'attesa, `3:07`
// è il ritiro — lì i secondi contano, e il formato lo dice prima del numero.
const kdsPrimi = ms => kdsMin(ms) + '′';
function kdsMinSec(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// ══════════════════════════════════════════════════════════════════════════
// MODELLO
//
// S = { comande: [], connesso: bool }
//
// comanda = { id, tavolo, sala, coperti, allergie[], nota,
//             inviata, pronta, consegnata, righe[] }
//   allergie e nota vengono dall'ORDINE (`orders.note_type`,
//   `orders.service_notes`): sono del tavolo, non della singola riga, ed è
//   l'unico posto dove il modello le tiene.
//
// riga = { id, prodotto, qty, varianti[], allergeni[], stato, annullata, visto }
//   varianti: etichette dai `variant_groups` del catalogo (Cottura, Extra…).
//   allergeni: da `menu_item_allergens`, propagati dagli ingredienti.
//   stato: da_fare | in_corso | pronto — gli stessi tre di
//   `kitchen_ticket_items.status` (queued, in_preparation, ready).
//
// Tutte le funzioni sono PURE: restituiscono uno stato nuovo, e lo stato di
// prima È l'annullamento — non c'è niente da ricostruire al contrario.
// ══════════════════════════════════════════════════════════════════════════

const kdsAperta = c => c.consegnata == null;
const kdsRigheVive = c => c.righe.filter(r => !r.annullata);
const kdsTutteProute = c => {
  const v = kdsRigheVive(c);
  return v.length > 0 && v.every(r => r.stato === 'pronto');
};
const kdsConta = c => {
  const v = kdsRigheVive(c);
  return { pronte: v.filter(r => r.stato === 'pronto').length, totale: v.length };
};
// Righe annullate dopo l'invio e non ancora prese in carico: la banda rossa
// resta finché qualcuno non dichiara di averle viste. Non sparisce a tempo —
// un avviso di tre secondi su uno schermo che in quel momento nessuno sta
// guardando è esattamente il modo in cui un piatto esce quando non doveva.
const kdsDaVedere = c => c.righe.filter(r => r.annullata && !r.visto);

/** Tono e timer di una comanda. Un solo timer alla volta, mai due. */
function kdsStato(c, ora) {
  if (c.pronta != null) {
    const ms = ora - c.pronta;
    const m = kdsMin(ms);
    return {
      fase: 'pronta',
      tono: 'verde',
      // La card resta VERDE anche col ritiro in ritardo: il piatto È pronto, e
      // dirlo giallo sarebbe una bugia. L'allarme del non-ritirato viaggia sul
      // suo timer, che si riempie e mette un anello rosso attorno alla card.
      // Due segnali sovrapposti, due significati distinti.
      tonoTimer: m >= KDS_RITIRO_ROSSO ? 'rosso' : m >= KDS_RITIRO_AMBRA ? 'ambra' : 'verde',
      ms, formato: 'secondi', etichetta: 'da ritirare',
    };
  }
  const ms = ora - c.inviata;
  const m = kdsMin(ms);
  const tono = m >= KDS_ATTESA_ROSSO ? 'rosso' : m >= KDS_ATTESA_AMBRA ? 'ambra' : 'neutro';
  return { fase: 'in_corso', tono, tonoTimer: tono, ms, formato: 'primi', etichetta: 'in attesa' };
}

const KDS_COLORE   = { neutro: K.NEUTRO, ambra: K.AMBRA, rosso: K.ROSSO, verde: K.VERDE };
const KDS_GLIFO    = { neutro: 'vuoto', ambra: 'triangolo', rosso: 'quadrato', verde: 'spunta' };
const KDS_BINARIO  = { neutro: 8, ambra: 14, rosso: 20, verde: 14 };

// ─── AZIONI ───────────────────────────────────────────────────────────────

function kdsMappa(S, comandaId, fn) {
  return Object.assign({}, S, { comande: S.comande.map(c => (c.id === comandaId ? fn(c) : c)) });
}

/** Tap sull'indicatore: da_fare → in_corso → pronto → da_fare. Sono i tre stati
 *  di `kitchen_ticket_items.status`, e il ciclo è quello del KDS già in uso. */
const KDS_CICLO = { da_fare: 'in_corso', in_corso: 'pronto', pronto: 'da_fare' };

function kdsCiclaRiga(S, comandaId, rigaId) {
  return kdsMappa(S, comandaId, c => Object.assign({}, c, {
    righe: c.righe.map(r => (r.id === rigaId ? Object.assign({}, r, { stato: KDS_CICLO[r.stato] }) : r)),
  }));
}

/** Comanda pronta: chiude anche le righe rimaste indietro. Il piatto è sul passe,
 *  una riga non può restare «da fare». */
function kdsComandaPronta(S, comandaId, ora) {
  return kdsMappa(S, comandaId, c => Object.assign({}, c, {
    pronta: ora,
    righe: c.righe.map(r => (r.annullata ? r : Object.assign({}, r, { stato: 'pronto' }))),
  }));
}

/** Consegnata: la comanda esce dalla board. Lo slot resta vuoto — vedi kds-board. */
function kdsConsegnata(S, comandaId, ora) {
  return kdsMappa(S, comandaId, c => Object.assign({}, c, { consegnata: ora }));
}

/** Presa visione di un annullamento. Non c'è un altro modo per farlo sparire. */
function kdsVisto(S, comandaId) {
  return kdsMappa(S, comandaId, c => Object.assign({}, c, {
    righe: c.righe.map(r => (r.annullata ? Object.assign({}, r, { visto: true }) : r)),
  }));
}

// ══════════════════════════════════════════════════════════════════════════
// DATI FINTI — da qui in giù si butta tutto quando arriva l'API
// ══════════════════════════════════════════════════════════════════════════

// Il device è già ristretto alle sue categorie dal routing
// (`menu_categories.kds_device_id`): questo è il KDS della cucina, e quindi
// nel catalogo qui sotto non ci sono bevande.
const KDS_PIATTI = [
  { nome: 'Fritto all\'Italiana',  allergeni: ['glutine', 'uova'] },
  { nome: 'Tagliere misto',        allergeni: ['lattosio'] },
  { nome: 'Impepata di cozze',     allergeni: ['glutine', 'crostacei'] },
  { nome: 'Carciofi alla giudia',  allergeni: [] },
  { nome: 'Carbonara',             allergeni: ['uova', 'lattosio', 'glutine'], cottura: ['Al dente', 'Al punto'] },
  { nome: 'Amatriciana',           allergeni: ['lattosio', 'glutine'],        cottura: ['Al dente', 'Al punto'] },
  { nome: 'Cacio e pepe',          allergeni: ['lattosio', 'glutine'],        cottura: ['Al dente', 'Al punto'] },
  { nome: 'Spaghetti aglio e olio', allergeni: ['glutine'],                   cottura: ['Al dente', 'Al punto'] },
  { nome: 'Branzino al sale',      allergeni: ['pesce'] },
  { nome: 'Tagliata di manzo',     allergeni: [],  cottura: ['Al sangue', 'Media', 'Ben cotta'] },
  { nome: 'Pollo alla diavola',    allergeni: [] },
  { nome: 'Patate al forno',       allergeni: [] },
  { nome: 'Tiramisù',              allergeni: ['uova', 'lattosio', 'glutine'] },
  { nome: 'Panna cotta',           allergeni: ['lattosio'] },
];
const kdsPiatto = nome => KDS_PIATTI.find(p => p.nome === nome) || { nome, allergeni: [] };

let kdsSeq = 0;
function kdsRiga(nome, qty, varianti) {
  kdsSeq += 1;
  const p = kdsPiatto(nome);
  return {
    id: 'r' + kdsSeq, prodotto: nome, qty,
    varianti: varianti || [],
    allergeni: p.allergeni,
    stato: 'da_fare', annullata: false, visto: false,
  };
}

let kdsSeqC = 0;
function kdsComanda(o) {
  kdsSeqC += 1;
  return Object.assign({
    id: 'c' + kdsSeqC, tavolo: 0, sala: 'Sala', coperti: 2,
    allergie: [], nota: null,
    inviata: 0, pronta: null, consegnata: null, righe: [],
  }, o);
}

function kdsOra(h, m) {
  const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime();
}
const MIN = 60000;

// ─── SCENARI ──────────────────────────────────────────────────────────────

function kdsScenario(nome) {
  if (nome === 'vuoto') return { ora: kdsOra(11, 30), S: { comande: [], connesso: true } };
  if (nome === 'picco') return kdsPicco();
  return kdsNormale();
}

/** Sei comande: una per ciascuno dei quattro stati, più i due estremi. */
function kdsNormale() {
  const ora = kdsOra(20, 52);
  const comande = [

    // rosso — 16 minuti, con un annullamento arrivato dopo l'invio
    kdsComanda({
      tavolo: 23, sala: 'Sala interna', coperti: 4, inviata: ora - 16 * MIN,
      allergie: ['glutine'], nota: 'Candelina al dolce',
      righe: [
        kdsRiga('Carbonara', 2, ['Al dente']),
        kdsRiga('Amatriciana', 1),
        Object.assign(kdsRiga('Patate al forno', 1), { annullata: true }),
      ],
    }),

    // ambra — 9 minuti, una riga già in corso.
    // Allergeni ma nessuna nota: è il caso più frequente, e con una fascia di
    // contesto sola le tre righe di piatti ci stanno tutte. Le card che si
    // comprimono devono essere l'eccezione, altrimenti il «+2 righe» diventa
    // l'aspetto normale della board e nessuno lo legge più.
    kdsComanda({
      tavolo: 25, sala: 'Dehors', coperti: 8, inviata: ora - 9 * MIN,
      allergie: ['lattosio', 'noci'],
      righe: [
        Object.assign(kdsRiga('Cacio e pepe', 3, ['Al punto']), { stato: 'in_corso' }),
        kdsRiga('Spaghetti aglio e olio', 2),
        kdsRiga('Impepata di cozze', 1),
      ],
    }),

    // verde — pronta da 3 minuti, nessuno la viene a prendere
    kdsComanda({
      tavolo: 19, sala: 'Sala interna', coperti: 4, inviata: ora - 21 * MIN, pronta: ora - 3 * MIN,
      allergie: ['pesce'],
      righe: [
        Object.assign(kdsRiga('Carciofi alla giudia', 2), { stato: 'pronto' }),
        Object.assign(kdsRiga('Tagliere misto', 1), { stato: 'pronto' }),
      ],
    }),

    // neutro — appena arrivata
    kdsComanda({
      tavolo: 7, sala: 'Dehors', coperti: 5, inviata: ora - 2 * MIN,
      righe: [
        kdsRiga('Tagliata di manzo', 2, ['Al sangue']),
        kdsRiga('Pollo alla diavola', 1),
        kdsRiga('Patate al forno', 2),
      ],
    }),

    // neutro — comanda lunga: la card si comprime e dichiara quante righe restano
    kdsComanda({
      tavolo: 14, sala: 'Saletta', coperti: 6, inviata: ora - 5 * MIN,
      nota: 'Menù fisso · servire tutto insieme',
      righe: [
        kdsRiga('Fritto all\'Italiana', 2),
        kdsRiga('Tagliere misto', 2),
        kdsRiga('Carciofi alla giudia', 3),
        kdsRiga('Impepata di cozze', 2),
        kdsRiga('Branzino al sale', 2),
        kdsRiga('Patate al forno', 3),
      ],
    }),

    // seconda comanda dello stesso tavolo: due card, due tempi. È la verità.
    kdsComanda({
      tavolo: 23, sala: 'Sala interna', coperti: 4, inviata: ora - 1 * MIN,
      allergie: ['glutine'], nota: 'Candelina al dolce',
      righe: [kdsRiga('Tagliata di manzo', 2, ['Media']), kdsRiga('Branzino al sale', 1)],
    }),
  ];
  return { ora, S: { comande, connesso: true } };
}

/** Diciotto comande: la paginazione non è più un'ipotesi. */
function kdsPicco() {
  const base = kdsNormale();
  const ora = base.ora;
  const sale = ['Sala interna', 'Dehors', 'Saletta'];
  const menu = [
    ['Carbonara', 'Amatriciana'], ['Tagliata di manzo', 'Patate al forno'],
    ['Fritto all\'Italiana', 'Tagliere misto'], ['Branzino al sale', 'Cacio e pepe'],
    ['Tiramisù', 'Panna cotta'], ['Pollo alla diavola', 'Carciofi alla giudia'],
  ];
  // Deterministico: uno scenario che cambia a ogni caricamento non si può
  // confrontare con quello di ieri, e un KDS lo si giudica confrontando.
  const numeri = [5, 9, 11, 12, 16, 18, 21, 24, 26, 31, 33, 40];
  const extra = numeri.map((n, i) => {
    const attesa = [3, 6, 9, 11, 15, 4][i % 6];
    const c = kdsComanda({
      tavolo: n, sala: sale[i % 3], coperti: 2 + (i % 5),
      inviata: ora - attesa * MIN,
      allergie: i % 5 === 0 ? ['glutine'] : [],
      righe: menu[i % 6].map((p, k) => {
        const pi = kdsPiatto(p);
        return kdsRiga(p, 1 + ((i + k) % 3), pi.cottura ? [pi.cottura[(i + k) % pi.cottura.length]] : []);
      }),
    });
    // Un paio col piatto pronto e nessuno che lo viene a prendere.
    if (i === 3 || i === 8) {
      c.pronta = ora - (i === 3 ? 6 : 2) * MIN;
      c.righe = c.righe.map(r => Object.assign({}, r, { stato: 'pronto' }));
    }
    return c;
  });
  return { ora, S: { comande: base.S.comande.concat(extra), connesso: true } };
}

/** Una comanda nuova che arriva adesso: serve a vedere che prende uno slot
 *  libero e che nessuna card già a schermo si sposta. */
function kdsNuovaComanda(S, ora) {
  const tavoli = [4, 8, 15, 17, 22, 28, 35];
  const usati = S.comande.filter(kdsAperta).map(c => c.tavolo);
  const n = tavoli.find(t => usati.indexOf(t) < 0) || 41;
  const scelta = KDS_PIATTI[(kdsSeqC * 3) % KDS_PIATTI.length];
  return Object.assign({}, S, {
    comande: S.comande.concat([kdsComanda({
      tavolo: n, sala: 'Sala interna', coperti: 2 + (kdsSeqC % 4), inviata: ora,
      righe: [
        kdsRiga(scelta.nome, 1 + (kdsSeqC % 3), scelta.cottura ? [scelta.cottura[0]] : []),
        kdsRiga('Patate al forno', 1),
      ],
    })]),
  });
}

// ─── Scenari forzati ──────────────────────────────────────────────────────
// Una condizione rara non si aspetta che capiti: chi valuta lo schermo la deve
// poter chiamare.
function kdsForza(S, quale, ora) {
  const aperte = S.comande.filter(kdsAperta);

  if (quale === 'annullamento') {
    const c = aperte.find(x => x.pronta == null && x.righe.some(r => !r.annullata)) || aperte[0];
    if (!c) return S;
    const r = kdsRigheVive(c).slice(-1)[0];
    if (!r) return S;
    return kdsMappa(S, c.id, x => Object.assign({}, x, {
      righe: x.righe.map(y => (y.id === r.id ? Object.assign({}, y, { annullata: true, visto: false }) : y)),
    }));
  }

  if (quale === 'allergia') {
    const c = aperte.find(x => x.allergie.length === 0) || aperte[0];
    if (!c) return S;
    return kdsMappa(S, c.id, x => Object.assign({}, x, {
      allergie: ['glutine'], nota: 'Un commensale celiaco — pentola e utensili dedicati',
    }));
  }

  if (quale === 'non_ritirato') {
    const c = aperte.find(x => x.pronta == null) || aperte[0];
    if (!c) return S;
    return kdsMappa(S, c.id, x => Object.assign({}, x, {
      pronta: ora - 8 * MIN,
      righe: x.righe.map(r => (r.annullata ? r : Object.assign({}, r, { stato: 'pronto' }))),
    }));
  }

  if (quale === 'disconnessione') return Object.assign({}, S, { connesso: false });

  return S;
}

Object.assign(window, {
  K, T, G,
  KDS_ATTESA_AMBRA, KDS_ATTESA_ROSSO, KDS_RITIRO_AMBRA, KDS_RITIRO_ROSSO,
  KDS_UNDO_MS, KDS_HEARTBEAT_ALLARME_S,
  KDS_COLORE, KDS_GLIFO, KDS_BINARIO, KDS_CICLO, KDS_PIATTI,
  kdsMin, kdsOrario, kdsPrimi, kdsMinSec,
  kdsAperta, kdsRigheVive, kdsTutteProute, kdsConta, kdsDaVedere, kdsStato,
  kdsMappa, kdsCiclaRiga, kdsComandaPronta, kdsConsegnata, kdsVisto,
  kdsScenario, kdsForza, kdsNuovaComanda, kdsOra,
});

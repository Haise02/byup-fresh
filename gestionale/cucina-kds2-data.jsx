// Cucina · KDS v2 — modello, taratura, regole delle righe
//
// Route sperimentale e autonoma: non tocca né riusa il KDS attuale
// (`byup Cucina.html`, `cucina-*.jsx`) né la vista Banco
// (`byup Cucina Banco.html`, `cucina-banco-*.jsx`). I tre schermi possono
// convivere sullo stesso locale, e questo si può buttare senza conseguenze.
//
// Qui dentro non c'è React e non c'è colore: solo il modello e le regole, tutte
// pure e tutte testabili a mano. La vista sta in `cucina-kds2-board.jsx`, i dati
// finti in `cucina-kds2-mock.jsx` — che è l'unico file da sostituire quando
// arriverà l'API.
//
// L'unità del modello è la PORZIONE: la parte di un piatto che appartiene a una
// sorgente (un tavolo, un asporto, un delivery). La RIGA — quello che il cuoco
// vede — non esiste nei dati: è UNA CARTA PER PIATTO FISICO, ricalcolata solo
// quando cambiano le porzioni. NIENTE CUMULO: «2 Margherita» non è una riga
// con un 2 davanti, sono due carte identiche una sotto l'altra — in cucina si
// spunta il piatto che si ha in mano, non una quantità.

// ─── Costanti di taratura ─────────────────────────────────────────────────
// Tutto quello che si tara sta qui, anche ciò che serve solo alla vista: un
// KDS si regola sul campo, dopo un servizio, e chi lo fa non deve cercare le
// soglie in tre file diversi.

// Evidenziazione di una sorgente: si spegne da sola, perché lo schermo è
// condiviso e chi ha toccato per ultimo se n'è già andato.
const HIGHLIGHT_TIMEOUT_MS = 9000;

// Bump dell'intera riga. 600 ms è la soglia sotto cui un tocco lungo con il
// guanto viene ancora letto come un tap involontario.
const LONG_PRESS_MS = 600;

// Finestra di annullamento. Non è un toast: resta fermo per tutto il tempo.
const UNDO_MS = 10000;

// Riverniciatura dei soli timer. NON ricalcola le righe: vedi kds2Righe.
const TICK_MS = 30000;

// Attesa di un tavolo, due soglie. Oltre la prima il tempo passa in ambra,
// oltre la seconda in rosso: fra «sta aspettando» e «sta aspettando troppo» c'è
// una differenza che in cucina si paga, e con un solo scalino i tredici minuti
// e i venti si leggevano uguali.
const SOGLIA_ATTESA_MIN = 10;
const SOGLIA_CRITICA_MIN = 14;

// Asporto e delivery non hanno un'attesa ma una scadenza: da qui in giù al
// ritiro il tempo passa in ambra.
const SOGLIA_RITIRO_MIN = 5;

// ─── Tipi ─────────────────────────────────────────────────────────────────
/**
 * @typedef {{ type: 'add'|'remove', label: string }} Kds2Modifier
 *
 * @typedef {{ delivery_mode: 'al_tavolo'|'asporto'|'consegna'|'al_banco', label: string, partner?: string, source_surface?: 'staff_web'|'webapp_guest'|'byup_app', verifica?: 'limite'|'rete'|null }} Kds2Source
 *   delivery_mode è quello del modello (orders.delivery_mode, D-14 — P-165);
 *   partner è la piattaforma accanto a `consegna` (glovo, deliveroo, ubereats).
 *   source_surface (P-168) dice chi ha aperto la sessione del tavolo: il board
 *   scrive «dal QR» sotto l'etichetta quando non è il personale, «da verificare»
 *   se il tavolo ha superato un limite o la rete non è della città.
 *   label: 'T12' per i tavoli, il nome di battesimo per asporto e consegna,
 *   il numero d'ordine ('042') per gli ordini di cassa senza tavolo.
 *
 * @typedef {Object} Kds2Portion
 * @property {string}   id
 * @property {string}   dishId
 * @property {string}   dishName
 * @property {string}   category    categoria di MENU: non esistono stazioni di
 *                                  cucina, e la categoria non ordina nulla.
 * @property {number}   quantity
 * @property {Kds2Source} source
 * @property {number}   firedAt     ms epoch — invio in cucina
 * @property {number}  [dueAt]      ms epoch — solo takeaway/delivery: ritiro
 * @property {Kds2Modifier[]} modifiers
 * @property {{label: string}} [allergen]
 * @property {'incoming'|'active'} status
 *   'incoming' = ordinata dal cameriere (o dall'app cliente) ma NON ancora
 *                inviata in cucina. La cucina la vede in anticipo — sa cosa sta
 *                per arrivare — e a schermo sta in quiete: grigio, tratto
 *                spezzato, nessun tempo colorato. Non è lavoro, è preavviso.
 *   'active'    = inviata in cucina, in produzione.
 *
 * @typedef {Object} Kds2Row     // prodotta da kds2Righe, mai persistita
 * @property {string}   id
 * @property {string}   dishId
 * @property {string}   dishName
 * @property {string}   category
 * @property {Kds2Modifier[]} modifiers
 * @property {{label: string}} [allergen]
 * @property {Kds2Portion[]} portions  sempre UNA: la porzione madre della carta
 * @property {number}   quantity      sempre 1 — la carta è un piatto fisico
 * @property {number}   firedAt       della porzione madre — è l'ordinamento
 */

// ─── Identità di una sorgente ─────────────────────────────────────────────
// Il modello non porta un id di sorgente, e non serve introdurlo: tipo +
// etichetta identificano già il tavolo o il cliente in modo stabile, ed è
// l'unica chiave che l'evidenziazione deve poter confrontare.
function kds2SorgenteId(source) {
  return source.delivery_mode + '|' + source.label;
}

// Primo posto della grammatica delle chip: IDENTITÀ.
// Per i tavoli si normalizza a «Tavolo » + numero, qualunque cosa arrivi dal
// dato ('12', 'Tav 12', 'T12'): la grammatica non può dipendere da come batte
// il cameriere. Per parola intera e non «tav.»: è il nome con cui il tavolo si
// chiama in tutto il resto del prodotto — la Sala, il conto, la conferma — e
// la cucina non ha una lingua sua. Un'abbreviazione si decifra; un nome si
// legge.
// Un ordine SENZA tavolo battuto in cassa si chiama «Ordine » + numero: non
// c'è un posto in sala da nominare né un cliente da chiamare per nome, c'è il
// codice sullo scontrino — ed è quello che il banco griderà al ritiro.
// Per asporto e delivery vale il nome, e il primo basta — in cucina si chiama
// «Anna», non «Anna Bianchi».
const KDS2_PREFISSO_TAVOLO = 'Tavolo ';
const KDS2_PREFISSO_ORDINE = 'Ordine ';

function kds2Identita(source) {
  if (source.delivery_mode === 'al_tavolo') {
    const num = String(source.label).replace(/\D+/g, '');
    return KDS2_PREFISSO_TAVOLO + (num || String(source.label));
  }
  if (source.delivery_mode === 'al_banco') {
    const num = String(source.label).replace(/\D+/g, '');
    return KDS2_PREFISSO_ORDINE + (num || String(source.label));
  }
  return String(source.label).trim().split(/\s+/)[0];
}

// ─── Le righe ─────────────────────────────────────────────────────────────

/**
 * Porzioni → carte, UNA PER PIATTO FISICO. Qui viveva l'aggregazione per
 * piatto («8 Hamburger» con le chip dei destinatari dentro): se n'è andata con
 * una decisione di prodotto — in un pub si spunta il piatto che si ha in mano,
 * e un numero davanti al nome è una cosa in più da leggere e da sbagliare.
 * Una porzione con quantità 3 diventa tre carte identiche, una sotto l'altra.
 *
 * Resta PURA e senza orologio: legge solo `firedAt`, mai `Date.now()`. È la
 * ragione per cui il board non può riordinarsi da solo mentre i timer avanzano
 * — non è una precauzione nel componente, è che il tempo non entra nel calcolo.
 *
 * @param {Kds2Portion[]} porzioni
 * @returns {Kds2Row[]} ordinate: la più vecchia in cima
 */
function kds2Righe(porzioni) {
  const righe = [];
  porzioni.forEach(p => {
    for (let i = 0; i < p.quantity; i++) {
      righe.push({
        // L'indice parte da zero e cresce: un bump scala la quantità di uno e
        // fa sparire l'ULTIMA carta, mentre le altre tengono la loro chiave —
        // così React non rimonta carte che non sono cambiate.
        id: p.id + '#' + i,
        dishId: p.dishId,
        dishName: p.dishName,
        category: p.category,
        modifiers: p.modifiers || [],
        allergen: p.allergen || null,
        portions: [p],
        quantity: 1,
        firedAt: p.firedAt,
      });
    }
  });

  // Ordinamento: attesa decrescente — cioè firedAt crescente. La categoria non
  // entra: raggruppare per categoria vorrebbe dire far scendere sotto un
  // antipasto in ritardo perché è un antipasto. I pareggi si sciolgono su
  // chiavi stabili, altrimenti due porzioni battute nello stesso secondo si
  // scambierebbero di posto a ogni ricalcolo.
  return righe.sort((a, b) =>
    (a.firedAt - b.firedAt) ||
    a.dishName.localeCompare(b.dishName, 'it') ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

// ─── Tempo ────────────────────────────────────────────────────────────────

function kds2AttesaMin(firedAt, ora) {
  return Math.max(0, Math.floor((ora - firedAt) / 60000));
}

function kds2Orario(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

// Tre gradini per l'attesa: 'ok' verde, 'attesa' ambra, 'critica' rosso. Il
// colore non porta mai da solo l'informazione — il numero c'è comunque, e la
// priorità vera la porta la posizione in lista.
function kds2TonoAttesa(min) {
  if (min > SOGLIA_CRITICA_MIN) return 'critica';
  return min > SOGLIA_ATTESA_MIN ? 'attesa' : 'ok';
}
function kds2TonoRitiro(dueAt, ora) {
  return (dueAt - ora) / 60000 <= SOGLIA_RITIRO_MIN ? 'attesa' : 'ok';
}

/**
 * Terzo posto della grammatica delle chip: TEMPO.
 * Tavolo → minuti trascorsi con apice. Asporto e delivery → ORARIO DI RITIRO,
 * mai i minuti: al banco non si chiede «da quanto aspetta», si chiede «per
 * quando è». Un asporto senza orario (battuto in cassa, il cliente aspetta lì)
 * ricade sui minuti, che è la sua grandezza vera.
 */
function kds2ChipTempo(source, firedAt, dueAt, ora) {
  if (source.delivery_mode !== 'al_tavolo' && dueAt != null) {
    return { testo: kds2Orario(dueAt), tono: kds2TonoRitiro(dueAt, ora) };
  }
  const min = kds2AttesaMin(firedAt, ora);
  return { testo: min + '′', tono: kds2TonoAttesa(min) };
}

// ─── Recap sorgenti (header) ──────────────────────────────────────────────
/**
 * Una voce per ogni sorgente con porzioni aperte. Stessa grammatica delle righe,
 * stesso componente chip: identità → quantità → tempo. La quantità è il numero
 * di porzioni ancora aperte per quella sorgente, il tempo è quello della sua
 * porzione più vecchia (o il suo ritiro).
 *
 * Anche questo è puro e senza orologio: l'ordine delle chip in alto non può
 * cambiare per un tick, esattamente come quello delle righe.
 */
function kds2Sorgenti(porzioni) {
  const mappa = new Map();
  porzioni.forEach(p => {
    const id = kds2SorgenteId(p.source);
    if (!mappa.has(id)) {
      mappa.set(id, {
        id, source: p.source, quantity: 0,
        firedAt: p.firedAt, dueAt: p.dueAt != null ? p.dueAt : null,
        status: 'incoming',
      });
    }
    const s = mappa.get(id);
    s.quantity += p.quantity;
    if (p.firedAt < s.firedAt) s.firedAt = p.firedAt;
    // Basta una porzione presa in carico perché la sorgente sia in lavorazione.
    if (p.status === 'active') s.status = 'active';
  });
  return Array.from(mappa.values()).sort((a, b) =>
    (a.firedAt - b.firedAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

// ─── Bump ─────────────────────────────────────────────────────────────────
// Le porzioni sono immutabili: ogni bump produce un array nuovo, e l'array
// precedente È l'annullamento. Non serve ricostruire niente al contrario.

/** Una porzione completata: scala di 1, e a zero esce. */
function kds2BumpUna(porzioni, portionId) {
  return porzioni
    .map(p => p.id !== portionId ? p : Object.assign({}, p, { quantity: p.quantity - 1 }))
    .filter(p => p.quantity > 0);
}

window.HIGHLIGHT_TIMEOUT_MS = HIGHLIGHT_TIMEOUT_MS;
window.LONG_PRESS_MS        = LONG_PRESS_MS;
window.UNDO_MS              = UNDO_MS;
window.TICK_MS              = TICK_MS;
window.SOGLIA_ATTESA_MIN    = SOGLIA_ATTESA_MIN;
window.SOGLIA_RITIRO_MIN    = SOGLIA_RITIRO_MIN;
window.kds2SorgenteId       = kds2SorgenteId;
window.kds2Identita         = kds2Identita;
window.kds2Righe            = kds2Righe;
window.kds2AttesaMin        = kds2AttesaMin;
window.kds2Orario           = kds2Orario;
window.kds2TonoAttesa       = kds2TonoAttesa;
window.kds2TonoRitiro       = kds2TonoRitiro;
window.kds2ChipTempo        = kds2ChipTempo;
window.kds2Sorgenti         = kds2Sorgenti;
window.kds2BumpUna          = kds2BumpUna;

// Cucina · KDS v2 — modello, taratura, regole di aggregazione
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
// vede — non esiste nei dati: è il risultato dell'aggregazione, ricalcolato solo
// quando cambiano le porzioni.

// ─── Costanti di taratura ─────────────────────────────────────────────────
// Tutto quello che si tara sta qui, anche ciò che serve solo alla vista: un
// KDS si regola sul campo, dopo un servizio, e chi lo fa non deve cercare le
// soglie in tre file diversi.

// Dentro un gruppo, una porzione che aspetta più di così rispetto alla più
// vecchia della riga apre una riga nuova. È la costante che decide se il board
// dice «otto hamburger» o «cinque hamburger, e altri tre fra poco».
const SPLIT_THRESHOLD_MIN = 6;

// Evidenziazione di una sorgente: si spegne da sola, perché lo schermo è
// condiviso e chi ha toccato per ultimo se n'è già andato.
const HIGHLIGHT_TIMEOUT_MS = 9000;

// Bump dell'intera riga. 600 ms è la soglia sotto cui un tocco lungo con il
// guanto viene ancora letto come un tap involontario.
const LONG_PRESS_MS = 600;

// Finestra di annullamento. Non è un toast: resta fermo per tutto il tempo.
const UNDO_MS = 10000;

// Riverniciatura dei soli timer. NON ricalcola l'aggregazione: vedi kds2Aggrega.
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
 * @typedef {{ type: 'table'|'takeaway'|'delivery', label: string }} Kds2Source
 *   label: 'T12' per i tavoli, il nome di battesimo per asporto e delivery.
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
 * @typedef {Object} Kds2Row     // prodotta da kds2Aggrega, mai persistita
 * @property {string}   id
 * @property {string}   dishId
 * @property {string}   dishName
 * @property {string}   category
 * @property {Kds2Modifier[]} modifiers
 * @property {{label: string}} [allergen]
 * @property {Kds2Portion[]} portions
 * @property {number}   quantity    somma delle porzioni della riga
 * @property {number}   firedAt     la più vecchia della riga — è l'ordinamento
 */

// ─── Identità di una sorgente ─────────────────────────────────────────────
// Il modello non porta un id di sorgente, e non serve introdurlo: tipo +
// etichetta identificano già il tavolo o il cliente in modo stabile, ed è
// l'unica chiave che l'evidenziazione deve poter confrontare.
function kds2SorgenteId(source) {
  return source.type + '|' + source.label;
}

// Primo posto della grammatica delle chip: IDENTITÀ.
// Per i tavoli si normalizza a «tav. » + numero, qualunque cosa arrivi dal dato
// ('12', 'Tav 12', 'T12'): la grammatica non può dipendere da come batte il
// cameriere. Per asporto e delivery vale il nome, e il primo basta — in cucina
// si chiama «Anna», non «Anna Bianchi».
const KDS2_PREFISSO_TAVOLO = 'tav. ';

function kds2Identita(source) {
  if (source.type === 'table') {
    const num = String(source.label).replace(/\D+/g, '');
    return KDS2_PREFISSO_TAVOLO + (num || String(source.label));
  }
  return String(source.label).trim().split(/\s+/)[0];
}

// ─── Aggregazione ─────────────────────────────────────────────────────────

// Firma del set di modificatori. Ordinata, così «senza cipolla + extra bacon» e
// «extra bacon + senza cipolla» sono lo stesso set: la sequenza in cui li ha
// battuti la sala non è un'informazione di cucina.
function kds2FirmaModificatori(mods) {
  if (!mods || mods.length === 0) return '';
  return mods
    .map(m => m.type + ':' + String(m.label).trim().toLowerCase())
    .sort()
    .join('+');
}

// Chiave di gruppo — regole 1 e 3.
// Regola 3 vince su tutto: una porzione con allergene sta da sola, quindi la sua
// chiave è unica per porzione. Non si aggrega mai con un'altra porzione, nemmeno
// con un'altra che porti lo stesso allergene e lo stesso piatto: due «senza
// glutine» nella stessa riga sono due piatti che si possono scambiare, ed è
// esattamente l'incidente che la riga dedicata esiste per impedire.
function kds2ChiaveGruppo(p) {
  if (p.allergen) return 'ALG§' + p.id;
  return p.dishId + '§' + kds2FirmaModificatori(p.modifiers);
}

/**
 * Porzioni → righe. Funzione PURA e senza orologio: legge solo `firedAt`, mai
 * `Date.now()`. È la ragione per cui il board non può riordinarsi da solo
 * mentre i timer avanzano — non è una precauzione nel componente, è che il
 * tempo non entra proprio nel calcolo.
 *
 * @param {Kds2Portion[]} porzioni
 * @returns {Kds2Row[]} ordinate: la più vecchia in cima
 */
function kds2Aggrega(porzioni) {
  // 1 · stesso piatto + stesso set di modificatori + stesso allergene
  const gruppi = new Map();
  porzioni.forEach(p => {
    const k = kds2ChiaveGruppo(p);
    if (!gruppi.has(k)) gruppi.set(k, []);
    gruppi.get(k).push(p);
  });

  const righe = [];
  gruppi.forEach((lista, chiave) => {
    // 2 · split per finestra temporale.
    // Il riferimento è la più vecchia DELLA RIGA, non del gruppo, e si riapre a
    // ogni riga nuova: tenendo fisso il riferimento originale, la seconda riga
    // finirebbe per raccogliere tutto il resto del servizio in un unico blocco
    // che copre mezz'ora — cioè il problema che lo split doveva risolvere.
    const ordinate = lista.slice().sort((a, b) => a.firedAt - b.firedAt);
    const finestre = [];
    ordinate.forEach(p => {
      const corrente = finestre[finestre.length - 1];
      if (!corrente || (p.firedAt - corrente[0].firedAt) > SPLIT_THRESHOLD_MIN * 60000) {
        finestre.push([p]);
      } else {
        corrente.push(p);
      }
    });

    finestre.forEach(finestra => {
      const p0 = finestra[0];
      righe.push({
        // La chiave React resta stabile finché la porzione capofila resta in
        // riga: quando esce, la riga è comunque un'altra cosa.
        id: chiave + '#' + p0.id,
        dishId: p0.dishId,
        dishName: p0.dishName,
        category: p0.category,
        modifiers: p0.modifiers || [],
        allergen: p0.allergen || null,
        portions: finestra,
        quantity: finestra.reduce((s, p) => s + p.quantity, 0),
        firedAt: p0.firedAt,
      });
    });
  });

  // Ordinamento: attesa della porzione più vecchia, decrescente — cioè firedAt
  // crescente. La categoria non entra: raggruppare per categoria vorrebbe dire
  // far scendere sotto un antipasto in ritardo perché è un antipasto.
  // I pareggi si sciolgono su chiavi stabili, altrimenti due porzioni battute
  // nello stesso secondo si scambierebbero di posto a ogni ricalcolo.
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
  if (source.type !== 'table' && dueAt != null) {
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

/** Riga intera completata. */
function kds2BumpRiga(porzioni, riga) {
  const dentro = new Set(riga.portions.map(p => p.id));
  return porzioni.filter(p => !dentro.has(p.id));
}

window.SPLIT_THRESHOLD_MIN  = SPLIT_THRESHOLD_MIN;
window.HIGHLIGHT_TIMEOUT_MS = HIGHLIGHT_TIMEOUT_MS;
window.LONG_PRESS_MS        = LONG_PRESS_MS;
window.UNDO_MS              = UNDO_MS;
window.TICK_MS              = TICK_MS;
window.SOGLIA_ATTESA_MIN    = SOGLIA_ATTESA_MIN;
window.SOGLIA_RITIRO_MIN    = SOGLIA_RITIRO_MIN;
window.kds2SorgenteId       = kds2SorgenteId;
window.kds2Identita         = kds2Identita;
window.kds2FirmaModificatori = kds2FirmaModificatori;
window.kds2ChiaveGruppo     = kds2ChiaveGruppo;
window.kds2Aggrega          = kds2Aggrega;
window.kds2AttesaMin        = kds2AttesaMin;
window.kds2Orario           = kds2Orario;
window.kds2TonoAttesa       = kds2TonoAttesa;
window.kds2TonoRitiro       = kds2TonoRitiro;
window.kds2ChipTempo        = kds2ChipTempo;
window.kds2Sorgenti         = kds2Sorgenti;
window.kds2BumpUna          = kds2BumpUna;
window.kds2BumpRiga         = kds2BumpRiga;

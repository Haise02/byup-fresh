// Cucina — dagli ordini del servizio alle porzioni del KDS v2
//
// Le due viste della cucina leggevano due servizi diversi: quella a colonne i
// ticket di `cucina-data.jsx`, la board v2 i suoi dati finti da hamburgeria.
// Passando da Ristorante a Pub non cambiava solo il modo di guardare — cambiava
// quello che c'era da cuocere, e davanti a un ristoratore si vede subito.
//
// Qui la conversione, in un file solo. P-07 (D-13): questo file si ELIMINA
// all'arrivo delle interfacce applicative vere — il modello è a porzioni
// (order_item_portions) e il KDS leggerà direttamente l'unità giusta, senza
// conversione. Non estenderlo: ogni riga aggiunta qui è debito.
//
// Un ticket ha righe («tavolo 12: 3 carbonare»), il v2 ha PORZIONI: la stessa
// riga, ma sganciata dal ticket, così può stare accanto alle carbonare di un
// altro tavolo. È solo un cambio di raggruppamento — nessun dato si inventa.

// I ticket di cucina-data.jsx hanno orari finti su un «adesso» fisso (14:55);
// il v2 lavora con timestamp assoluti. Si conserva la DISTANZA da adesso: un
// ticket delle 14:40 resta di quindici minuti fa, a qualunque ora si apra.
function _kds2Quando(hhmm) {
  if (!hhmm || typeof window._toMin !== 'function') return Date.now();
  const delta = window.CUC_NOW_MIN - window._toMin(hhmm);   // minuti fa
  return Date.now() - delta * 60000;
}

// L'etichetta della sorgente sta in una chip che si legge a tre metri: «T12»,
// «Anna». Il cognome non serve a nessuno in cucina e ruberebbe la riga.
// Il banco non ha né tavolo né cliente: ha il numero d'ordine, che è quello
// che si grida al ritiro — prima qui c'era la parola «Banco», che con due
// ordini di cassa aperti li incollava in una sorgente sola.
// La sorgente legge il modo di consegna dell'ordine (orders.delivery_mode,
// P-165) e non traduce più un vocabolario in un altro: il convertitore è
// provvisorio (P-07) e finché vive non introduce nomi suoi.
function _kds2Sorgente(t) {
  const delivery_mode = t.delivery_mode || 'al_tavolo';
  if (delivery_mode === 'al_tavolo') return { delivery_mode, label: 'T' + t.table };
  if (delivery_mode === 'al_banco')  return { delivery_mode, label: String(t.orderN || '').replace(/\D+/g, '') || 'Banco' };
  // La consegna porta anche la piattaforma: è lei che manda il rider, e il
  // board la disegna al posto dello scooter.
  return { delivery_mode, label: String(t.customer || 'Ordine').split(' ')[0], partner: t.partner };
}

// La nota del ticket è testo libero: «senza basilico», «extra mozzarella»,
// «cottura al sangue». Le prime due sono una rimozione e un'aggiunta e vanno
// lette come tali — rosso e verde, che in cucina si distinguono di sfuggita —
// la terza è un'istruzione e resta neutra. Chi scrive la nota non sa niente di
// questa distinzione: la si riconosce da come parla.
const _KDS2_TOGLIE  = /^(senza|no)\s+/i;
const _KDS2_AGGIUNGE = /^(extra|aggiungi|con|più|piu)\s+/i;
function _kds2Modificatori(nota) {
  const n = String(nota || '').trim();
  if (!n) return [];
  if (_KDS2_TOGLIE.test(n))   return [{ type: 'remove', label: n.replace(_KDS2_TOGLIE, '') }];
  if (_KDS2_AGGIUNGE.test(n)) return [{ type: 'add',    label: n.replace(_KDS2_AGGIUNGE, '') }];
  return [{ type: 'note', label: n }];
}

// `station` del ticket è la categoria di cucina («Pizza», «Primi»): è già
// quello che filtrava la vista a colonne, ed è quello che il v2 chiama
// categoria. Nessuna traduzione da inventare.
function kds2PorzioniDaTicket(tickets) {
  const out = [];
  (tickets || []).forEach(t => {
    const source = _kds2Sorgente(t);
    const firedAt = _kds2Quando(t.time);
    const dueAt = t.pickup ? _kds2Quando(t.pickup) : undefined;
    (t.items || []).forEach((it, i) => {
      // Le righe già uscite non sono più da cuocere: nella board v2 la porzione
      // fatta sparisce, non resta barrata.
      if (it.state === 'done') return;
      const p = {
        id: t.id + '-' + i,
        dishId: String(it.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        dishName: it.name,
        category: t.station || 'Cucina',
        quantity: it.qty || 1,
        source, firedAt,
        modifiers: it.allergen ? [] : _kds2Modificatori(it.note),
        status: 'active',
      };
      if (dueAt) p.dueAt = dueAt;
      // Con un allergene la nota È l'allergene («senza glutine»): dirla due
      // volte, una in rosso e una nel riquadro dell'allarme, la rende rumore.
      if (it.allergen) p.allergen = { label: String(it.note || '').trim() || 'allergene' };
      out.push(p);
    });
  });
  return out;
}

// Il servizio aperto è tutto quello che la cucina ha in mano: la coda e ciò che
// è già sul fuoco. La board v2 non separa le due cose — l'ordine in lista è la
// priorità — quindi arrivano insieme.
function kds2PorzioniDelServizio() {
  return kds2PorzioniDaTicket(
    (window.CUC_TICKETS_ATTIVI || []).concat(window.CUC_TICKETS_PREP || [])
  );
}

window.kds2PorzioniDaTicket   = kds2PorzioniDaTicket;
window.kds2PorzioniDelServizio = kds2PorzioniDelServizio;

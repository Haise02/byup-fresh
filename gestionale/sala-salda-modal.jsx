// Sala — Modale Salda conto v2: layout 2 colonne, no wizard, pre-conto sempre raggiungibile

// ── Pagamento carta su Byup Staff ──────────────────────────────────────
// Due soli stati: in attesa, poi saldato. Chi sta in cassa deve decidere
// una cosa sola — se aspettare o no — e per quella "in attesa" basta.
// Raccontare anche che qualcuno l'ha aperto o che la carta è appoggiata
// non cambia niente di quello che può fare.
//
// Il pagamento NON è indirizzato a un dispositivo: chiunque abbia Byup Staff
// può prenderlo. Per questo la schermata non nomina mai un device o una
// persona — finché non è saldato, l'unica cosa vera è che sta aspettando.
//
// PAY_FINE è finto: il telefono non è ancora collegato, quindi il saldo
// arriva a tempo. In produzione lo dice il server (Stripe Terminal).
const PAY_FINE = 16000;

// Voce della coda di incasso. Stessa forma di CODA_INCASSO in
// staff/pos-data.jsx: è il contratto fra cassa e Byup Staff, e va scritto
// con quei nomi da entrambe le parti. `inviato` qui è un timestamp — la
// coda su Staff lo formatta in ora, ma deve restare una data per calcolare
// da quanto si aspetta.
//
// L'id porta il numero del tavolo perché si legga, ma non è il tavolo: un
// conto rimandato indietro e re-inviato è una voce nuova, e due voci dello
// stesso tavolo non devono mai collidere.
// Il pallino "in attesa" respira. Sta fuori dal componente perché lo usa
// anche il contatore in Sala, che vive quando la finestra di saldo è chiusa.
(function saldaInjectPayKeyframes() {
  if (typeof document === 'undefined' || document.getElementById('salda-pay-kf')) return;
  const el = document.createElement('style');
  el.id = 'salda-pay-kf';
  el.textContent = `
@keyframes saldaPayPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.28; } }
@media (prefers-reduced-motion: reduce) {
  [style*="saldaPayPulse"] { animation: none !important; }
}`;
  document.head.appendChild(el);
})();

// Euro, non float. Qui si sommano e si sottraggono prezzi tutto il giorno:
// senza arrotondare, un residuo che deve essere zero esce 0.000000000004 e il
// conto resta aperto per niente.
const r2 = (n) => Math.round(n * 100) / 100;

function nuovaVoceCoda(tavolo, importo) {
  const t = Date.now();
  return {
    id: `c_${String(tavolo.id).padStart(2, '0')}_${t.toString(36)}`,
    tavolo: tavolo.id,
    importo,
    coperti: tavolo.coperti || 1,
    inviato: t,
  };
}

// Ambra = in sospeso. L'inchiostro è #B45309 e non PN.AMBER: su fondo
// chiaro il PN.AMBER sta a 2,86:1.
const PAY_INK = '#B45309';
const PAY_BG  = '#FEF3C7';

function SalaSaldaModal({ open, tavolo, onClose, onConfirm }) {
  // Map<itemId, qty selezionata> — permette selezione parziale (1 di 3, 2 di 3, tutti)
  const [selectedItems, setSelectedItems] = React.useState(new Map());
  // Copia locale degli ordini editabile (prezzo, nome, delete, add) — non muta tavolo.ordini
  const [editedOrdini, setEditedOrdini] = React.useState([]);
  const [addQuery, setAddQuery] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);

  // Aggiustamento totale
  const [adjust, setAdjust] = React.useState(null);
  // adjust: null | { type:'sconto-eur', val } | { type:'sconto-pct', val }
  // Uno sconto, in euro o in percentuale: parte dal totale dei piatti scelti e
  // lo abbassa. Scrivere un totale da zero non è una correzione — è un altro
  // conto — e infatti «Custom» non è più qui; «Arrotonda» era uno sconto già
  // deciso, l'unico che non si poteva dosare.

  const [pay, setPay] = React.useState({ contanti: '', carta: '' });
  const [method, setMethod] = React.useState('contanti'); // contanti | carta
  // La fattura è la stessa di Vendita diretta: una finestra sua, con la
  // ricerca in rubrica e nel registro imprese, i segmenti e il codice
  // destinatario. Qui c'erano tre campi liberi e un interruttore — la stessa
  // domanda posta in due modi diversi nei due punti in cui si incassa.
  const [fattura, setFattura] = React.useState(null);   // dati cliente o null
  const [fatturaOpen, setFatturaOpen] = React.useState(false);
  const invoice = !!fattura;
  const [adjustOpen, setAdjustOpen] = React.useState(false);

  const [done, setDone] = React.useState(false);
  // Com'è andato l'incasso, fotografato quando si preme: la schermata di
  // conferma vive dopo che il conto è chiuso e non può ricalcolarselo.
  const [esito, setEsito] = React.useState(null);
  const [preContoStampato, setPreContoStampato] = React.useState(null); // null | timestamp

  // DUE PASSI, non due colonne. Il conto e il pagamento erano affiancati: si
  // apriva la finestra e si era già davanti a «Come paga il cliente?» mentre si
  // stava ancora leggendo che cosa c'è sul tavolo. Sono due momenti diversi —
  // prima si guarda il conto (e semmai se ne salda un pezzo), poi si incassa —
  // e ora sono due schermate. La lista prende tutta la larghezza, come le righe
  // del monitor di cucina: una cosa per riga e niente da cercare di lato.
  const [passo, setPasso] = React.useState('conto');   // conto | pagamento
  // Storno di un incasso già preso: { p, fase, inviato } | null.
  // Le fasi sono le stesse dell'incasso al contrario — si chiede, si aspetta
  // (solo se i soldi sono passati da una carta), è fatto.
  const [storno, setStorno] = React.useState(null);
  // Quanto si sta incassando davvero. Vuoto = la cifra dei piatti scelti; se
  // qualcuno la riscrive, `importoTocco` dice che comanda lei — e da quel
  // momento cambiare la selezione non gliela sposta più sotto le dita.
  const [importo, setImporto] = React.useState('');
  const [importoTocco, setImportoTocco] = React.useState(false);
  const importoRef = React.useRef(null);
  const [toast, setToast] = React.useState(null);

  // Conto messo in coda di incasso su Byup Staff. La voce vive sul TAVOLO,
  // non qui: chiudere la finestra non la ritira, e riaprendola si ritrova
  // allo stato in cui era. `payTick` serve solo a far ridisegnare.
  const [payTick, setPayTick] = React.useState(0);
  const inCoda = tavolo?.incasso || null;
  const payElapsed = inCoda ? Date.now() - inCoda.inviato : 0;
  const paying = !!inCoda;

  React.useEffect(() => {
    if (!inCoda) return;
    const id = setInterval(() => setPayTick(t => t + 1), 400);
    return () => clearInterval(id);
  }, [inCoda?.inviato]);

  // Storno su carta: la richiesta parte su Byup Staff e i soldi li rimanda
  // Stripe, quindi qui si aspetta l'esito come per l'incasso. Il contante
  // invece esce dal cassetto e basta, e non passa mai da qui.
  // Sta insieme agli altri hook, sopra alla riga che chiude la finestra: un
  // effetto dichiarato più in basso esisterebbe solo a finestra aperta, e
  // React conta gli hook, non le intenzioni.
  React.useEffect(() => {
    if (!open || !storno || storno.fase !== 'attesa') return;
    const id = setInterval(() => {
      if (Date.now() - storno.inviato >= PAY_FINE) applicaStorno(storno.p);
    }, 400);
    return () => clearInterval(id);
  }, [open, storno]);

  // Chi chiude il pagamento è la Sala, non questa finestra: qui si guarda
  // solo se il conto è ancora in coda. Se la finestra tenesse un suo timer,
  // i due si farebbero la gara e il risultato dipenderebbe da chi arriva
  // prima — a volte la conferma, a volte un salto secco al conto.
  const eraInCoda = React.useRef(false);
  React.useEffect(() => {
    if (inCoda) { eraInCoda.current = true; return; }
    if (!eraInCoda.current) return;
    eraInCoda.current = false;
    // Uscito dalla coda: o l'ha incassato un telefono, o l'abbiamo ritirato
    // noi. Nel secondo caso si torna al conto, che è di nuovo modificabile.
    if (tavolo && tavolo.contoSaldato) { setDone(true); onConfirm && onConfirm(); }
  }, [inCoda]);

  React.useEffect(() => {
    if (open && tavolo) {
      const cloned = (tavolo.ordini || []).map(o => ({...o}));
      const gById = Object.fromEntries((tavolo.guests || []).map(g => [g.id, g]));
      const pagati = new Set((tavolo.pagamenti || []).map(p => String(p.chi || '').trim().toLowerCase()));
      const giaPagato = (o) => !!o.guestId && gById[o.guestId]
        && pagati.has(String(gById[o.guestId].name || '').trim().toLowerCase());
      const qPagata = (o) => (tavolo.pagamenti || []).reduce((n, p) =>
        n + ((p.items || []).find(r => r.id === o.id)?.qty || 0), 0);
      setEditedOrdini(cloned);
      setSelectedItems(new Map(cloned
        .filter(o => !giaPagato(o) && o.qty - qPagata(o) > 0)
        .map(o => [o.id, o.qty - qPagata(o)])));
      // Si riapre sempre dal conto: il passo dov'era rimasta la volta scorsa
      // non è dove si vuole ricominciare — prima si guarda cosa c'è sul tavolo.
      setPasso('conto');
      setStorno(null);
      setImporto('');
      setImportoTocco(false);
      setAdjust(null);
      setPay({ contanti:'', carta:'' });
      // Riaprendo un conto con un pagamento ancora in volo si torna dov'era:
      // ripartire da "Contanti" nasconderebbe la transazione in corso e
      // l'unico modo per annullarla.
      setMethod(tavolo.incasso ? 'carta' : 'contanti');
      setFattura(null);
      setFatturaOpen(false);
      setAdjustOpen(false);
      setDone(false);
      setEsito(null);
      setPreContoStampato(null);
      setToast(null);
      setAddQuery('');
      setAddOpen(false);
    }
  }, [open, tavolo]);

  if (!open || !tavolo) return null;

  const allOrdini = editedOrdini;
  const guests = tavolo.guests || [];
  const guestById = Object.fromEntries(guests.map(g => [g.id, g]));

  // Che cosa di questo conto è già stato pagato. Due strade portano allo
  // stesso posto: la quota di un ospite arrivata dall'app (il pagamento porta
  // il suo nome) e un incasso parziale fatto qui in cassa (il pagamento porta
  // le righe che copre, con le quantità). In tutti e due i casi quei piatti
  // non si incassano una seconda volta.
  const nomiPagati = new Set((tavolo.pagamenti || []).map(p => String(p.chi || '').trim().toLowerCase()));
  const guestPagato = (gid) => {
    const g = guestById[gid];
    return !!g && nomiPagati.has(String(g.name || '').trim().toLowerCase());
  };
  const qtyPagata = (o) => (tavolo.pagamenti || []).reduce((n, p) =>
    n + ((p.items || []).find(r => r.id === o.id)?.qty || 0), 0);
  // Quante ne restano da incassare su quella riga.
  const qtyAperta = (o) => Math.max(0, o.qty - qtyPagata(o));
  const isPagato = (o) => (!!o.guestId && guestPagato(o.guestId)) || qtyAperta(o) === 0;

  // Quello che la cassa può ancora incassare: i piatti già pagati non sono
  // «deselezionati», sono fuori dal conto — se contassero, il riepilogo
  // direbbe «4 di 6» a chi non ha toccato niente.
  // Da che schermo è arrivato il piatto lo dice l'OSPITE che l'ha ordinato,
  // non la riga: `origin` racconta chi l'ha battuto, l'ospite da dove.
  // Due sole sezioni: Byup App e Altro. La webapp è anonima — chi inquadra il
  // QR non si registra, non paga, non ha un nome da chiamare — e una sezione
  // per gente che non si può nominare non divide niente: sta in «Altro»
  // insieme al cameriere e alla cassa, senza etichette sulla riga.
  const canaleDi = (o) => {
    const g = o.guestId ? guestById[o.guestId] : null;
    return g && g.source === 'byup' ? 'byup' : 'altro';
  };
  const gruppiCanale = SALDA_CANALI
    .map(c => Object.assign({}, c, { items: allOrdini.filter(o => canaleDi(o) === c.id) }))
    .filter(g => g.items.length > 0);

  const incassabili = allOrdini.filter(o => !isPagato(o));
  const selectedOrdini = allOrdini.filter(o => (selectedItems.get(o.id) || 0) > 0);
  const subtotale = selectedOrdini.reduce((s,o) => s + Math.min(selectedItems.get(o.id) || 0, qtyAperta(o)) * o.prezzo, 0);

  // Calcolo aggiustamento — una strategia per ciascun type; restituisce { total, delta, label }.
  // Lo sconto in euro è clampato al subtotale per non generare totali negativi.
  const ADJUST_STRATEGIES = {
    'sconto-eur': (sub, val) => {
      const delta = -Math.min(val || 0, sub);
      return { total: sub + delta, delta, label: `Sconto · −€${(-delta).toFixed(2)}` };
    },
    'sconto-pct': (sub, val) => {
      const delta = -(sub * (val || 0) / 100);
      return { total: sub + delta, delta, label: `Sconto ${val}% · −€${(-delta).toFixed(2)}` };
    },
  };
  const adjustResult = adjust ? ADJUST_STRATEGIES[adjust.type]?.(subtotale, adjust.val) : null;
  const naturalTotal = Math.max(0, adjustResult?.total ?? subtotale);
  const adjustDelta = adjustResult?.delta ?? 0;
  const adjustLabel = adjustResult?.label ?? null;

  // Su `incassabili` e non su tutti gli ordini: le quote già arrivate
  // dall'app non sono soldi che il tavolo deve ancora.
  const apertoTotale = incassabili.reduce((s, o) => s + qtyAperta(o) * o.prezzo, 0);

  // ── DUE MODI DI INCASSARE, MAI INSIEME ──────────────────────────────────
  // O si scelgono i PIATTI — e la cifra è il loro valore, semmai scontato —
  // o si scrive una CIFRA a mano, e allora è un acconto puro: nessun piatto
  // risulta pagato, la selezione si svuota da sola nel momento in cui si
  // scrive. Tenerli insieme voleva dire chiudere piatti per cifre che non
  // c'entravano, e nessuno dei due numeri diceva più la verità.
  //
  // Il credito è la parte di un pagamento che eccede il valore dei piatti che
  // copriva: è un ACCONTO, e va tolto da quello che il tavolo deve ancora, o
  // riaprendo il conto quei soldi si chiederebbero due volte.
  // ATTENZIONE alle quote dall'app: non portano righe, ma i piatti di chi ha
  // pagato risultano già spenti per nome — contarle qui vorrebbe dire togliere
  // quei soldi due volte.
  const nomiOspiti = new Set(guests.map(g => String(g.name || '').trim().toLowerCase()));
  const valoreRighe = (items) => (items || []).reduce((s, r) => {
    const o = allOrdini.find(x => x.id === r.id);
    return s + (o ? o.prezzo * r.qty : 0);
  }, 0);
  const creditoDi = (p) => nomiOspiti.has(String(p.chi || '').trim().toLowerCase())
    ? 0
    : Math.max(0, r2((p.amount || 0) - valoreRighe(p.items)));
  const accontiTotale = (tavolo.pagamenti || []).reduce((s, p) => s + creditoDi(p), 0);
  // Quello che il tavolo deve ancora, in euro: il valore dei piatti aperti
  // meno gli acconti già versati. È il tetto di qualunque incasso.
  const residuoTavolo = Math.max(0, r2(apertoTotale - accontiTotale));

  // La cifra proposta è quella dei piatti scelti (già scontata), mai più di
  // quello che il tavolo deve. Scritta a mano, comanda lei — e i piatti sono
  // fuori dal discorso.
  const importoScritto = parseFloat(String(importo).replace(',', '.'));
  const richiesto = importoTocco
    ? (isNaN(importoScritto) ? 0 : Math.max(0, importoScritto))
    : Math.min(naturalTotal, residuoTavolo);
  const total = Math.min(richiesto, residuoTavolo);
  // Quanto dei piatti scelti è già coperto da un acconto versato prima: è il
  // caso in cui la selezione vale PIÙ del saldo residuo, e va detto — si
  // incassa il residuo, non il valore dei piatti, o quei soldi entrerebbero
  // due volte.
  const copertoDaAcconto = importoTocco ? 0 : Math.max(0, r2(naturalTotal - residuoTavolo));
  // Più di quello che il tavolo deve non si incassa.
  const oltreIlDovuto = richiesto - total > 0.004;

  // Quanto resta del conto dopo questo incasso. Con i piatti: escono i
  // selezionati (lo sconto è una rinuncia, non un residuo). Con la cifra a
  // mano: scendono solo gli euro scritti.
  const residuoDopo = importoTocco
    ? Math.max(0, r2(residuoTavolo - total))
    : Math.max(0, r2(residuoTavolo - subtotale));
  const parziale = residuoDopo > 0.004;
  // Si sta prendendo tutto il conto o solo una parte? Sulle cifre, non sul
  // conteggio delle righe: due bottiglie d'acqua su tre sono la stessa riga ma
  // non lo stesso importo, e chi guarda il totale sta guardando i soldi.
  const parzialeSelezione = Math.abs(subtotale - apertoTotale) > 0.004;

  // Contanti col campo vuoto = ESATTO: segue il totale senza che nessuno
  // scriva niente. Prima la CTA partiva spenta («Manca €65») finché non si
  // toccava un chip — un tocco obbligato per il caso più comune alla cassa.
  const contantiEsatto = method === 'contanti' && pay.contanti === '';
  const contanti = contantiEsatto ? total : parseFloat(pay.contanti) || 0;
  const carta = parseFloat(pay.carta) || 0;
  const paid = contanti + carta;
  const resto = paid - total;
  // Epsilon 0.01€ (1 centesimo) per tollerare rounding di float su somme parziali — es. 33.33 + 66.67.
  const canConfirm = paid >= total - 0.01 && total > 0;

  // Un gesto sulla lista fa decadere la cifra scritta a mano: comanda di
  // nuovo la selezione. È la regola simmetrica dello scrivere, che svuota la
  // selezione — i due modi non convivono mai, vince l'ultimo gesto.
  function lasciaComandareLaSelezione() {
    if (importoTocco) { setImportoTocco(false); setImporto(''); }
  }

  function toggleItem(id) {
    lasciaComandareLaSelezione();
    const o = allOrdini.find(x => x.id === id);
    if (!o || isPagato(o)) return;
    setSelectedItems(s => {
      const ns = new Map(s);
      if ((ns.get(id) || 0) > 0) ns.delete(id);
      else ns.set(id, qtyAperta(o));
      return ns;
    });
  }
  function setItemQty(id, qty) {
    lasciaComandareLaSelezione();
    const o = allOrdini.find(x => x.id === id);
    if (!o) return;
    const clamped = Math.max(0, Math.min(qty, qtyAperta(o)));
    setSelectedItems(s => {
      const ns = new Map(s);
      if (clamped === 0) ns.delete(id);
      else ns.set(id, clamped);
      return ns;
    });
  }
  function selectAll() { lasciaComandareLaSelezione(); setSelectedItems(new Map(allOrdini.filter(o => !isPagato(o)).map(o => [o.id, qtyAperta(o)]))); }
  function selectNone() { setSelectedItems(new Map()); }
  // Un canale intero, in un gesto: se è già tutto preso lo lascia, altrimenti
  // lo prende per intero. Un solo tocco che va nei due versi, come la spunta
  // «Seleziona tutti» in cima.
  function selezionaCanale(items) {
    lasciaComandareLaSelezione();
    setSelectedItems(s => {
      const ns = new Map(s);
      const tutti = items.every(o => (ns.get(o.id) || 0) >= o.qty);
      items.forEach(o => tutti ? ns.delete(o.id) : ns.set(o.id, qtyAperta(o)));
      return ns;
    });
  }

  function updateItem(id, patch) {
    setEditedOrdini(arr => arr.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  // La QUANTITÀ ORDINATA si corregge nel conto, come il nome e il prezzo: il
  // cameriere ha battuto tre birre ma erano due. Non scende mai sotto quello
  // che è già stato pagato — quelle porzioni sono un incasso, non un refuso —
  // né sotto uno: la riga da zero si toglie con il cestino, che dice quello
  // che fa. La selezione del passo dopo si riallinea da sola: quello che è
  // aperto torna tutto selezionato, coerente con l'apertura.
  function cambiaQtyOrdine(id, q) {
    const o = allOrdini.find(x => x.id === id);
    if (!o) return;
    const minQ = Math.max(1, qtyPagata(o));
    const v = Math.max(minQ, Math.round(q));
    if (v === o.qty) return;
    updateItem(id, { qty: v });
    setSelectedItems(s => {
      const ns = new Map(s);
      const aperta = v - qtyPagata(o);
      if (aperta <= 0) ns.delete(id); else ns.set(id, aperta);
      return ns;
    });
  }
  function deleteItem(id) {
    setEditedOrdini(arr => arr.filter(o => o.id !== id));
    setSelectedItems(s => { const ns = new Map(s); ns.delete(id); return ns; });
  }
  function addItemFromMenu(menuItem) {
    // Il piatto aggiunto da qui è un ORDINE NUOVO: nasce su una riga sua —
    // mai dentro una riga esistente, qualunque stato abbia — e in attesa,
    // perché per la cucina è una comanda appena inviata, non un piatto già
    // fatto. Nascesse «pronto», il pass mostrerebbe un piatto che nessuno ha
    // mai cucinato.
    const newItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nome: menuItem.nome,
      prezzo: menuItem.prezzo,
      qty: 1,
      stato: 'ordinato',
      minutiInPreparazione: 0,
      minutiInCoda: 0,
      origin: 'cameriere',
      guestId: null,
      _added: true,
    };
    setEditedOrdini(arr => [...arr, newItem]);
    setSelectedItems(s => { const ns = new Map(s); ns.set(newItem.id, 1); return ns; });
    setAddQuery('');
    setAddOpen(false);
  }

  function stampaPreConto(scope = 'tutto') {
    setPreContoStampato(Date.now());
    setToast({ type:'success', text: scope === 'tutto'
      ? `Pre-conto stampato · €${subtotale.toFixed(2)}`
      : `Pre-conto parziale stampato · ${scope}` });
    setTimeout(() => setToast(null), 2500);
  }

  function chooseMethod(m) {
    setMethod(m);
    if (m === 'carta') setPay({ contanti: '', carta: total.toFixed(2) });
    else               setPay({ contanti: '', carta: '' });
  }
  function setTendered(v)  { setPay({ contanti: v, carta: '' }); }

  // Scrive l'incasso sul TAVOLO, non nello stato della finestra: un incasso
  // parziale deve sopravvivere alla chiusura: riaprendo il conto quei piatti
  // risultano pagati e il totale chiede solo quello che manca. È la stessa
  // cosa che l'acconto fa al banco, in Vendita diretta.
  function registraIncasso(metodo) {
    // Le righe che questo incasso chiude sono quelle spuntate, qualunque cifra
    // sia entrata: è la selezione a dire QUALI piatti sono a posto. Se però il
    // conto si chiude del tutto, copre anche quello che era rimasto fuori —
    // quando il tavolo non deve più niente non può restare un piatto che
    // risulta da pagare.
    const items = !parziale
      ? incassabili.map(o => ({ id: o.id, qty: qtyAperta(o) })).filter(r => r.qty > 0)
      : selectedOrdini
          .map(o => ({ id: o.id, qty: Math.min(selectedItems.get(o.id) || 0, qtyAperta(o)) }))
          .filter(r => r.qty > 0);
    const ora = new Date();
    const pagamento = {
      id: 'pg-' + ora.getTime(),
      method: metodo,
      amount: total,
      ora: `${String(ora.getHours()).padStart(2,'0')}:${String(ora.getMinutes()).padStart(2,'0')}`,
      chi: 'Cassa',
      items,
    };
    tavolo.pagamenti = [...(tavolo.pagamenti || []), pagamento];
    return pagamento;
  }

  // ── Storno di un incasso già preso ──────────────────────────────────────
  // Il tocco sulla freccia NON storna: apre la domanda. Sono soldi, e il gesto
  // per sbaglio su una riga alta venti pixel è troppo facile.
  function stornaPagamento(p) { setStorno({ p, fase:'conferma' }); }

  // Toglie l'incasso dal conto. Le righe che copriva tornano da pagare — le
  // legge `isPagato` dai pagamenti, quindi basta togliere la voce — e il
  // tavolo torna aperto per quella cifra: la Sala lo deve sapere subito, o la
  // card continuerebbe a dire «saldato» su un conto che ha ripreso a dovere.
  function applicaStorno(p) {
    const rimasti = (tavolo.pagamenti || []).filter(x => x.id !== p.id);
    tavolo.pagamenti = rimasti;
    tavolo.contoSaldato = false;
    setPayTick(t => t + 1);
    setStorno({ p, fase:'fatto' });
    // Il residuo si rifà da zero sui pagamenti rimasti, con la stessa regola
    // di sempre: piatti ancora aperti meno gli acconti. Ricalcolarlo qui a
    // mano — invece di leggere `residuoDopo`, che parla dell'incasso in corso
    // — è l'unico modo di sapere quanto deve il tavolo DOPO aver tolto questo.
    const nomi = new Set(rimasti.map(x => String(x.chi || '').trim().toLowerCase()));
    const apertoOra = allOrdini.reduce((s, o) => {
      const qPag = rimasti.reduce((n, x) => n + ((x.items || []).find(r => r.id === o.id)?.qty || 0), 0);
      const g = o.guestId ? guestById[o.guestId] : null;
      if (g && nomi.has(String(g.name || '').trim().toLowerCase())) return s;
      return s + Math.max(0, o.qty - qPag) * o.prezzo;
    }, 0);
    const accontiOra = rimasti.reduce((s, x) => s + creditoDi(x), 0);
    onConfirm && onConfirm({
      saldato: false,
      residuo: Math.max(0, r2(apertoOra - accontiOra)),
      storno: p,
    });
  }

  // Il conto entra nella coda di incasso, visibile a tutti i Byup Staff
  // collegati. Scrivere la voce sul tavolo (e non nello stato della
  // finestra) è ciò che le permette di sopravvivere alla chiusura: la cassa
  // resta libera di lavorare altrove.
  function avviaPagamento() {
    tavolo.incasso = nuovaVoceCoda(tavolo, total);
    setPayTick(t => t + 1);
  }
  // Ritiro dalla coda — non è una cancellazione: il conto torna
  // modificabile qui in cassa. Su Byup Staff la voce sparisce; se qualcuno
  // la stava già guardando, se lo vede dire lì.
  function ritiraDallaCoda() {
    tavolo.incasso = null;
    setPayTick(t => t + 1);
    setToast({ type:'info', text:'Conto ritirato dalla coda' });
    setTimeout(() => setToast(null), 2500);
  }

  // Suggerimenti contanti: esatto + multipli arrotondati al rialzo
  function smartCashChips(tot) {
    const chips = [{ label: 'Esatto', val: tot.toFixed(2) }];
    const steps = [5, 10, 20, 50];
    const seen = new Set([Math.round(tot * 100)]);
    for (const s of steps) {
      const v = Math.ceil(tot / s) * s;
      if (v <= tot + 0.01) continue;
      const key = Math.round(v * 100);
      if (seen.has(key)) continue;
      seen.add(key);
      chips.push({ label: '€' + v, val: v.toFixed(2) });
      if (chips.length >= 4) break;
    }
    return chips;
  }

  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset: 0, background:'rgba(15,17,21,0.55)', zIndex: 60,
      }}/>
      {/* Dialog, non takeover: a 920×660 fissi con tetto al 94% il pannello
          copriva ~3/4 dell'area contenuti a ogni risoluzione (la shell scala
          tutto con uno zoom guidato dall'altezza, quindi la proporzione non
          cambiava mai) e leggeva come una schermata piena — con in più un bel
          vuoto sotto la lista articoli quando il conto è corto.
          Altezza ora guidata dal contenuto e tetto all'88%: si accorcia sui
          conti brevi, cresce e scrolla su quelli lunghi, e lascia sempre
          respirare la pagina sotto.
          Attesa e conferma non hanno una lista da mostrare: sei righe
          centrate in una finestra da 880 leggevano come un errore di
          layout. Lì si stringe a 420 — la stessa misura della finestra di
          incasso in Vendita diretta. */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%, -50%)',
        width: (paying || done || storno) ? 420 : 1080,
        maxWidth:'93%', height:'auto', maxHeight:'92%',
        background:'#fff', borderRadius: 20,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        transition:'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Lo storno prende tutta la finestra, come l'attesa e come la
            conferma: invece di spegnere lista, metodi e pulsante uno per uno,
            non c'è proprio nient'altro sullo schermo. Chi sta annullando dei
            soldi non deve poter fare altro. */}
        {storno ? (
          <SaldaStorno
            p={storno.p}
            fase={storno.fase}
            residuoDopo={residuoDopo}
            onConferma={() => {
              if (storno.p.method === 'contanti') applicaStorno(storno.p);
              else setStorno({ ...storno, fase:'attesa', inviato: Date.now() });
            }}
            onChiudi={() => setStorno(null)}/>
        ) : done ? (
          <SaldaDoneV2 tavolo={tavolo} esito={esito || {
            // Incassato da un telefono mentre la finestra era in attesa: qui
            // il resto non esiste, la carta ha pagato l'importo esatto.
            total, contanti, carta, resto: 0, metodo: 'carta', invoice, invoiceData: fattura,
          }} onClose={onClose}/>
        ) : paying ? (
          <SaldaAttesaPagamento
            tavolo={tavolo}
            total={inCoda.importo}
            elapsed={payElapsed}
            onRitira={ritiraDallaCoda}
            onClose={onClose}/>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding:'20px 24px 16px',
              display:'flex', alignItems:'flex-start', gap: 12, flexShrink: 0,
            }}>
              <div style={{flex:1, minWidth: 0}}>
                {/* Il primo passo si chiama CONTO: lì non si incassa, si
                    guarda cosa c'è sul tavolo e semmai lo si corregge.
                    «Salda conto» è il nome del secondo, dove i soldi passano
                    di mano davvero. */}
                <div style={{fontSize: 14, color:'#6B7280', fontWeight:800, letterSpacing:0.8, textTransform:'uppercase'}}>
                  {passo === 'conto' ? 'Conto' : 'Salda conto'}
                </div>
                <div style={{fontSize: 27, fontWeight: 800, color:'#0F1115', marginTop: 2, letterSpacing:-0.6, display:'flex', alignItems:'baseline', gap: 10, flexWrap:'wrap'}}>
                  <span>Tavolo {tavolo.id}{tavolo.party ? ` · ${tavolo.party}` : ''}</span>
                  <span style={{fontSize:16, fontWeight:600, color:'#9CA3AF', letterSpacing: 0}}>
                    {tavolo.coperti || 1} coperti
                  </span>
                </div>
              </div>
              <button onClick={() => stampaPreConto('tutto')} style={btnGhost}>
                <IconPrinter/>
                {preContoStampato ? 'Ristampa pre-conto' : 'Stampa pre-conto'}
              </button>
              {/* FATTURA — accanto al pre-conto, perché sono la stessa cosa:
                  i due documenti che il tavolo può chiedere. Stava in fondo
                  alla colonna del pagamento, dove la si trovava solo dopo aver
                  scelto come incassare — e invece è la prima cosa che dice il
                  cliente («mi fa fattura?»), spesso prima ancora del conto.
                  Non è un interruttore: apre la finestra dei dati del cliente,
                  la stessa dell'incasso in Vendita diretta. Accesa, porta il
                  nome di chi la riceve — rileggendo, la domanda non è se la
                  fattura c'è, è a chi si sta facendo. */}
              <button
                onClick={() => setFatturaOpen(true)}
                title={fattura
                  ? `Fattura a ${window.svfNome ? window.svfNome(fattura) : ''} · tocca per correggere`
                  : 'Emetti fattura invece della ricevuta'}
                onMouseEnter={e => { e.currentTarget.style.borderColor = fattura ? SALDA_BRAND : '#D1D5DB'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = fattura ? SALDA_BRAND : '#E5E7EB'; }}
                style={{
                  ...btnGhost, maxWidth: 260,
                  background: fattura ? SALDA_BRAND_SOFT : '#fff',
                  border: `1px solid ${fattura ? SALDA_BRAND : '#E5E7EB'}`,
                  color: fattura ? SALDA_BRAND : '#0F1115',
                  transition: 'background 150ms ease-out, border-color 150ms ease-out',
                }}>
                <span style={{display:'inline-flex', flexShrink: 0}}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="2"/><path d="M6 16h12v5H6z"/></svg>
                </span>
                <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {fattura ? (window.svfNome ? window.svfNome(fattura) : 'Fattura') : 'Emetti fattura'}
                </span>
              </button>
              <button onClick={onClose} title="Chiudi" style={saldaIconBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>

            {/* Body 2 colonne */}
            <div style={{flex:1, display:'flex', minHeight: 0}}>
              {passo === 'conto' ? (
              // ── PRIMO PASSO: IL CONTO ─────────────────────────────────────
              // Qui non si sceglie cosa pagare: si legge cosa c'è sul tavolo —
              // ogni piatto con il suo stato — e semmai lo si corregge:
              // aggiungere un articolo, ritoccare un nome o un prezzo, togliere
              // una riga battuta per sbaglio. La selezione sta nel passo dopo,
              // accanto ai soldi che muove: qui una spunta non avrebbe ancora
              // un significato, e infatti non c'è.
              <div style={{
                flex: 1, display:'flex', flexDirection:'column', minWidth: 0,
              }}>
                {/* Add-article search bar */}
                <AddArticleBar
                  query={addQuery} setQuery={setAddQuery}
                  open={addOpen} setOpen={setAddOpen}
                  onPick={addItemFromMenu}/>

                {/* Lista articoli — solo lettura e correzione */}
                <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'10px 24px 14px'}}>
                  <ListaPerCanale gruppi={gruppiCanale}
                    selezione={false}
                    selectedItems={selectedItems} toggleItem={toggleItem} setItemQty={setItemQty}
                    guestById={guestById} isPagato={isPagato}
                    selezionaCanale={selezionaCanale}
                    onChangeQty={cambiaQtyOrdine}
                    onUpdate={updateItem} onDelete={deleteItem}/>
                </div>

                {/* Piede del conto: quanto deve ancora il tavolo, e la strada
                    per andare avanti. Una sola cosa da premere. */}
                <div style={{
                  flexShrink: 0, borderTop:'1px solid #EDEFF2', background:'#fff',
                  padding:'14px 24px 18px',
                }}>
                  <div style={{display:'flex', alignItems:'baseline', gap: 14, marginBottom: 12}}>
                    <span style={{
                      fontSize: 15, fontWeight: 800, color:'#6B7280',
                      letterSpacing: 0.6, textTransform:'uppercase',
                    }}>Da incassare</span>
                    <span style={{flex:1}}/>
                    {/* Se c'è già un acconto, il valore dei piatti e quello che
                        il tavolo deve sono due numeri diversi: si vede da qui,
                        non si scopre nel passo dopo. */}
                    {accontiTotale > 0.004 && (
                      <span style={{
                        fontSize: 15, fontWeight: 600, color:'#9CA3AF',
                        fontVariantNumeric:'tabular-nums',
                      }}>già in acconto €{accontiTotale.toFixed(2)}</span>
                    )}
                    <span style={{
                      fontSize: 42, fontWeight: 800, color:'#0F1115',
                      letterSpacing:-1.4, lineHeight: 1,
                      fontVariantNumeric:'tabular-nums',
                    }}>€{residuoTavolo.toFixed(2)}</span>
                  </div>

                  {/* La stessa CTA delle card «Da saldare» in Vendita diretta:
                      è lo stesso gesto — il conto è pronto, si va a incassare —
                      e due gesti uguali non possono avere due pulsanti diversi. */}
                  <button
                    onClick={() => { if (residuoTavolo > 0.004) setPasso('pagamento'); }}
                    disabled={residuoTavolo <= 0.004}
                    onMouseEnter={e => { if (residuoTavolo <= 0.004) return; e.currentTarget.style.filter = 'brightness(1.22)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                    onMouseDown={e => { if (residuoTavolo > 0.004) e.currentTarget.style.transform = 'scale(0.99)'; }}
                    onMouseUp={e => { if (residuoTavolo > 0.004) e.currentTarget.style.transform = 'scale(1.01)'; }}
                    style={{
                      width:'100%', padding:'16px 16px', borderRadius: 999,
                      background: residuoTavolo > 0.004 ? SALDA_SUNSET_BG : '#EDEFF2',
                      color: residuoTavolo > 0.004 ? SALDA_SUNSET_TEXT : '#9CA3AF',
                      border:'1px solid transparent',
                      boxShadow: residuoTavolo > 0.004 ? SALDA_SUNSET_SHADOW : 'none',
                      fontSize: 18, fontWeight: 700, letterSpacing:-0.1,
                      cursor: residuoTavolo > 0.004 ? 'pointer' : 'not-allowed', fontFamily:'inherit',
                      transition:'box-shadow 180ms ease-out, filter 150ms ease-out, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1)',
                    }}>
                    {residuoTavolo > 0.004 ? 'Procedi al pagamento' : 'Niente da incassare'}
                  </button>
                </div>
              </div>
              ) : (

              // ── SECONDO PASSO: SALDA CONTO ───────────────────────────────
              // Due colonne. A sinistra i piatti, ed è QUI che si sceglie cosa
              // saldare: la spunta sta accanto ai soldi che muove, non due
              // schermate prima. A destra la cifra — che si può riscrivere —
              // il metodo e la conferma. All'apertura è tutto selezionato: il
              // caso più comune, il tavolo che paga tutto, è a un tocco; chi
              // divide il conto toglie, invece di dover mettere.
              <div style={{
                flex: 1, display:'flex', flexDirection:'column',
                background:'#fff', minWidth: 0,
              }}>
                {/* La via d'uscita in alto a sinistra, come nella finestra
                    Incassa di Vendita diretta: è l'unica cosa qui dentro con
                    una conseguenza — cambiare cosa si sta saldando — e stare
                    attaccata alla CTA vorrebbe dire regalare un tocco sbagliato
                    a ogni incasso. Angolo opposto, e allineata al titolo: sta
                    sul bordo della finestra, non sul bordo della colonna, o
                    sembrerebbe appesa in mezzo al bianco. */}
                <div style={{width:'100%', flexShrink: 0, padding:'0 24px 6px'}}>
                    {/* Tornando indietro la cifra scritta a mano si dimentica:
                        era la risposta a una selezione che si sta per cambiare,
                        e ritrovarsela addosso sul conto nuovo sarebbe un numero
                        vecchio travestito da proposta. */}
                    <button onClick={() => { setPasso('conto'); setImporto(''); setImportoTocco(false); }}
                      title="Torna a scegliere cosa saldare"
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F8'; e.currentTarget.style.color = SALDA_INK; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SALDA_MUTED; }}
                      style={{
                        display:'inline-flex', alignItems:'center', gap: 6,
                        padding:'8px 14px 8px 10px', borderRadius: 999,
                        background:'transparent', border:`1px solid ${SALDA_BORDO}`,
                        color: SALDA_MUTED, fontSize: 14.5, fontWeight: 700,
                        cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                        transition:'background 150ms ease-out, color 150ms ease-out',
                      }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                      Torna al conto
                    </button>
                </div>

                <div style={{flex:1, display:'flex', minHeight: 0}}>

                {/* ── SINISTRA: cosa si salda ──────────────────────────────
                    La stessa lista del conto, ma qui le righe si spuntano: il
                    − e il + dicono quante porzioni entrano in questo incasso.
                    Niente correzioni da questo lato — nome, prezzo e righe si
                    sistemano nel passo prima, dove il conto è ancora un
                    documento e non un incasso a metà. */}
                <div style={{
                  flex:'1.35 1 0', minWidth: 0,
                  display:'flex', flexDirection:'column',
                  borderRight:'1px solid #EDEFF2',
                }}>
                  <div style={{
                    padding:'6px 20px 10px',
                    display:'flex', alignItems:'center', gap: 8, flexShrink: 0,
                  }}>
                    <span style={{...SALDA_LABEL, marginBottom: 0}}>Cosa saldi</span>
                    {/* Il nome della colonna dei numeri a destra: senza,
                        quelle cifre si leggerebbero come prezzi di listino —
                        e invece sono quello che ogni riga deve ANCORA. */}
                    <span style={{...SALDA_LABEL, marginBottom: 0, marginLeft: 10}}>· Saldo per riga</span>
                    <span style={{flex:1}}/>
                    {(() => {
                      const allSel = incassabili.length > 0 && incassabili.every(o => (selectedItems.get(o.id) || 0) >= o.qty);
                      const someSel = !allSel && selectedItems.size > 0;
                      return (
                        <button
                          onClick={allSel ? selectNone : selectAll}
                          style={{...miniLink, gap: 6, color: '#374151'}}
                        >
                          <span style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            border: `1.5px solid ${allSel || someSel ? SALDA_BRAND : '#D1D5DB'}`,
                            background: allSel ? SALDA_BRAND : '#fff',
                            display: 'grid', placeItems: 'center', position: 'relative',
                          }}>
                            {allSel && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                            {someSel && (
                              <span style={{width: 9, height: 2.5, background: SALDA_BRAND, borderRadius: 2, display:'block'}}/>
                            )}
                          </span>
                          Seleziona tutti
                        </button>
                      );
                    })()}
                  </div>
                  {/* Lista PIATTA, non per canale: qui si scelgono piatti, e
                      le testate di gruppo erano tre titoli in mezzo alle
                      spunte. Da dove arriva un piatto lo dice la sua riga —
                      «Marco · BYUP», «Guest 4 · Webapp» — solo quando c'è un
                      ospite dietro; per il resto è un piatto e basta. */}
                  <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'0 20px 14px'}}>
                    {allOrdini.length === 0 ? <EmptyOrdini/> : (
                      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                        {allOrdini.map(o => (
                          <ItemRowV2 key={o.id} o={o}
                            selectedQty={selectedItems.get(o.id) || 0}
                            onToggle={()=>toggleItem(o.id)}
                            onSetQty={(q)=>setItemQty(o.id, q)}
                            guest={o.guestId ? guestById[o.guestId] : null}
                            pagato={!!isPagato(o)}
                            // Zero anche per le quote pagate PER NOME (l'app
                            // non spegne le quantità, spegne l'ospite): senza
                            // questo, una pizza già pagata direbbe €9.00 di
                            // saldo a chi sta per incassarla di nuovo.
                            saldoRiga={isPagato(o) ? 0 : r2(qtyAperta(o) * o.prezzo)}
                            selezione/>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── DESTRA: quanto e come ─────────────────────────────── */}
                <div style={{
                  flex:'1 1 0', minWidth: 380, maxWidth: 470,
                  display:'flex', flexDirection:'column', background:'#fff',
                }}>
                <div className="pn-scroll" style={{
                  flex:1, overflow:'auto', padding:'0 0 18px',
                  width:'100%',
                }}>

                  {/* HERO — la cifra che si dice ad alta voce al cliente, con
                      la sua etichetta sopra e il conto sotto. Prima era un
                      blocco rosa allineato a sinistra con l'etichetta di
                      fianco: un riquadro dentro un riquadro, in una finestra
                      che di riquadri ne ha già. Qui il numero sta al centro e
                      non ha bisogno di una scatola per farsi vedere. */}
                  <div style={{padding:'12px 22px 0', textAlign:'center'}}>
                    <div style={SALDA_LABEL}>Da incassare</div>

                    {/* LA CIFRA SI SCRIVE. Non è più solo il totale dei piatti
                        scelti: quello è la proposta, e chi sta in cassa la può
                        riscrivere — «me ne dà venti» succede tutte le sere.
                        Come nella finestra Incassa di Vendita diretta, il
                        numero è il campo: si tocca e si scrive sopra, senza un
                        interruttore da cercare da un'altra parte. */}
                    <div
                      onClick={() => importoRef.current && importoRef.current.focus()}
                      style={{display:'inline-flex', alignItems:'baseline', gap: 7, cursor:'text', padding:'2px 6px'}}>
                      <span style={{fontSize: 24, fontWeight: 800, color: SALDA_MUTED, letterSpacing:-0.5}}>€</span>
                      <input
                        ref={importoRef}
                        value={importoTocco ? importo : total.toFixed(2)}
                        onChange={e => {
                          setImportoTocco(true);
                          setImporto(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'));
                          // La cifra scritta a mano è un ACCONTO: nessun piatto
                          // risulterà pagato, e la selezione si svuota qui —
                          // vederla restare accesa direbbe il contrario.
                          setSelectedItems(new Map());
                          // Il contante ricevuto torna a «Esatto»: seguiva una
                          // cifra che non c'è più.
                          setPay({ contanti:'', carta:'' });
                        }}
                        onFocus={e => e.currentTarget.select()}
                        inputMode="decimal"
                        aria-label="Quanto incassi ora"
                        style={{
                          width: `${Math.max((importoTocco ? importo : total.toFixed(2)).length, 4)}ch`,
                          border:'none', outline:'none', background:'transparent',
                          fontFamily:'inherit', textAlign:'left',
                          fontSize: 46, fontWeight: 800, color: SALDA_INK,
                          letterSpacing:-1.5, lineHeight: 1.15, padding: 0,
                          fontVariantNumeric:'tabular-nums',
                        }}/>
                      <span style={{color: importoTocco ? SALDA_BRAND : SALDA_MUTED, display:'inline-flex', alignSelf:'center'}}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </span>
                    </div>

                    {/* Il conto, SEMPRE: dice su cosa si sta lavorando e non si
                        muove — nemmeno mentre la cifra sopra cambia. «Da
                        incassare» e «totale conto» sono due fatti diversi anche
                        quando il numero coincide. */}
                    <div style={{
                      marginTop: 4, fontSize: 15, color: SALDA_MUTED,
                      fontVariantNumeric:'tabular-nums',
                    }}>
                      Totale conto €{apertoTotale.toFixed(2)}
                      {accontiTotale > 0.004 && <> · già in acconto €{accontiTotale.toFixed(2)}</>}
                      {importoTocco
                        ? <> · acconto</>
                        : parzialeSelezione && <> · {selectedOrdini.length} {selectedOrdini.length === 1 ? 'piatto' : 'piatti'} di {incassabili.length}</>}
                    </div>

                    {/* COSA COMPORTA quello che si è appena fatto. Due soli
                        casi la cifra da sola non li racconta: la cifra scritta
                        a mano — che è un acconto, e nessun piatto risulterà
                        pagato — e i piatti scelti che valgono più del saldo
                        residuo, dove si incassa il residuo e non il loro
                        valore. Va detto qui: sulla conferma sarebbe una
                        scoperta. */}
                    {(importoTocco || oltreIlDovuto || copertoDaAcconto > 0.004) && (
                      <div style={{
                        display:'inline-flex', alignItems:'flex-start', gap: 9,
                        marginTop: 12, padding:'11px 15px', borderRadius: 12,
                        maxWidth: 560, textAlign:'left',
                        background: PAY_BG, color: PAY_INK,
                        fontSize: 15.5, lineHeight: 1.45,
                      }}>
                        <span style={{flexShrink: 0, marginTop: 1, display:'inline-flex'}}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
                        </span>
                        <span>
                          {oltreIlDovuto
                            ? <>Il tavolo deve <b>€{residuoTavolo.toFixed(2)}</b>: incassi quelli, non €{richiesto.toFixed(2)}.</>
                            : importoTocco
                              ? <>Acconto: nessun piatto risulterà pagato — dal conto scendono <b>€{total.toFixed(2)}</b>{parziale ? <>, restano €{residuoDopo.toFixed(2)}</> : <> e il conto si chiude</>}.</>
                              : <>Il tavolo ha già versato <b>€{accontiTotale.toFixed(2)}</b> in acconto: dei piatti scelti incassi il residuo, <b>€{total.toFixed(2)}</b>.</>}
                        </span>
                      </div>
                    )}

                    {/* SCONTO — agisce sui piatti selezionati, e quindi vive
                        solo quando comanda la selezione: sull'acconto scritto a
                        mano uno sconto non significa niente — la cifra è già
                        quella che si vuole. Applicato, diventa la pastiglia
                        verde: il testo la riapre, la × lo toglie. */}
                    {!importoTocco && (
                    <div style={{marginTop: 10}}>
                      {adjust ? (
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap: 8,
                          padding:'6px 8px 6px 14px', borderRadius: 999,
                          background:'#DCFCE7', color:'#166534',
                          fontSize: 15, fontWeight: 700,
                        }}>
                          <button onClick={() => setAdjustOpen(o => !o)} title="Modifica lo sconto" style={{
                            background:'transparent', border:'none', padding: 0,
                            fontFamily:'inherit', fontSize: 15, fontWeight: 700,
                            color:'#166534', cursor:'pointer',
                          }}>
                            {adjustLabel.split(' · ')[0]} · −€{Math.abs(adjustDelta).toFixed(2)}
                          </button>
                          <button onClick={() => { setAdjust(null); setAdjustOpen(false); }} title="Togli lo sconto" style={{
                            width: 24, height: 24, padding: 0, borderRadius: '50%',
                            background:'rgba(22,101,52,0.10)', border:'none', color:'#166534',
                            cursor:'pointer', display:'grid', placeItems:'center', fontFamily:'inherit',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setAdjustOpen(o => !o)} style={{
                          background:'transparent', border:'none', padding: 0,
                          fontFamily:'inherit', fontSize: 15, fontWeight: 700,
                          color: SALDA_BRAND, cursor:'pointer',
                          display:'inline-flex', alignItems:'center', gap: 4,
                        }}>
                          <span style={{textDecoration:'underline', textUnderlineOffset: 3}}>
                            Applica uno sconto
                          </span>
                          <span style={{
                            display:'inline-block',
                            transform: adjustOpen ? 'rotate(90deg)' : 'none',
                            transition:'transform 0.15s', fontSize: 15,
                          }}>›</span>
                        </button>
                      )}
                    </div>
                    )}
                    {!importoTocco && adjustOpen && (
                      <div style={{marginTop: 12, textAlign:'left'}}>
                        <AdjustPanel subtotale={subtotale} adjust={adjust} setAdjust={setAdjust}/>
                      </div>
                    )}
                  </div>

                  {/* Quello che è già arrivato su questo conto. I piatti che
                      queste quote coprono sono spenti nell'elenco del conto,
                      quindi la cifra qui sopra è già al netto: non c'è più
                      niente da mettere in relazione a mente. */}
                  <div style={{marginTop: 18}}>
                    <PagamentiConto pagamenti={tavolo.pagamenti} onStorna={stornaPagamento} />
                  </div>

                  {/* COME PAGA — due tessere parlanti, la stessa misura e la
                      stessa spunta d'angolo della finestra Incassa: è lo stesso
                      gesto fatto dalla stessa persona, e le due finestre non
                      possono chiederlo in due modi diversi. Con più spazio a
                      disposizione le tessere respirano invece di allargarsi:
                      una finestra grande non è una finestra con gli oggetti
                      grandi. */}
                  <div style={{padding:'22px 24px 0'}}>
                    <div style={SALDA_LABEL}>Come paga il cliente</div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                      <SaldaMetodoCard active={method==='contanti'} onClick={()=>chooseMethod('contanti')}
                        icon={<IconBanconota/>} label="Contanti"/>
                      <SaldaMetodoCard active={method==='carta'} onClick={()=>chooseMethod('carta')}
                        icon={<IconPos/>} label="Carta · Byup Staff"/>
                    </div>

                    {/* Cosa succede scegliendo la carta: il pulsante non
                        incassa — manda il conto sul telefono — e finora non lo
                        diceva nessuno, lo si scopriva premendo col cliente
                        davanti. */}
                    {method === 'carta' && (
                      <div style={{
                        display:'flex', gap: 10, marginTop: 14,
                        padding:'12px 16px', borderRadius: 14,
                        background: PAY_BG, color: PAY_INK,
                        fontSize: 15.5, lineHeight: 1.45,
                      }}>
                        <span style={{flexShrink: 0, marginTop: 2}}><IconCard/></span>
                        <span>
                          Il conto entra in coda su <b>Byup Staff</b> e si chiude appena il pagamento va a buon fine.
                        </span>
                      </div>
                    )}
                  </div>

                  {method === 'contanti' && (
                    <div style={{padding:'18px 24px 0'}}>
                      <CashTendered
                        total={total}
                        value={pay.contanti}
                        onChange={setTendered}
                        chips={smartCashChips(total)}/>
                    </div>
                  )}

                  {/* Carta: nessun campo. Non c'è niente da inserire —
                      l'importo è già scritto grande qui sopra. */}
                </div>

                {/* Piede dell'incasso: la riga corre da bordo a bordo e il
                    pulsante con lei, dentro lo stesso margine di tutto il
                    resto. */}
                <div style={{
                  borderTop:'1px solid #EDEFF2',
                  background:'#fff', flexShrink: 0, width:'100%',
                }}>
                <div style={{
                  padding:'16px 24px 20px',
                  display:'flex', flexDirection:'column', gap: 10,
                }}>
                  {/* Il pulsante dice il gesto che compie, non «conferma»:
                      con i contanti incassa qui, con la carta manda il conto
                      su Byup Staff e la finestra passa in attesa. Sono due
                      cose diverse e ora si leggono diverse. */}
                  {(() => {
                    const inviaSuStaff = method === 'carta';
                    const attivo = inviaSuStaff ? total > 0 : canConfirm;
                    const manca = total - paid;
                    return (
                      <React.Fragment>
                      <button onClick={() => {
                          if (!attivo) return;
                          if (inviaSuStaff) avviaPagamento();
                          else {
                            const pagamento = registraIncasso(method);
                            // Fotografia del momento in cui si incassa: la
                            // schermata di conferma deve poter dire quanto
                            // resto dare e quanto manca ancora, anche dopo che
                            // il conto è cambiato sotto.
                            setEsito({
                              total, contanti, carta, resto: Math.max(0, resto),
                              metodo: method, invoice, invoiceData: fattura,
                              residuo: residuoDopo, parziale,
                            });
                            setDone(true);
                            onConfirm && onConfirm({
                              saldato: !parziale, residuo: residuoDopo, pagamento,
                            });
                          }
                        }}
                        disabled={!attivo}
                        onMouseEnter={e => { if (attivo) e.currentTarget.style.filter = 'brightness(1.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                        style={{
                          // Verde come l'INCASSA di Vendita diretta, con la
                          // stessa spunta nel cerchio: è lo stesso gesto —
                          // prendere i soldi e chiudere — e finora era corallo,
                          // cioè lo stesso colore delle spunte di selezione due
                          // schermate prima. Il corallo qui dentro dice «scelto»,
                          // il verde dice «fatto».
                          width:'100%', padding:'17px 18px', borderRadius: 14,
                          background: attivo ? SALDA_VERDE : '#EFEFF1',
                          color: attivo ? '#fff' : '#9CA3AF',
                          border:'none',
                          boxShadow: attivo ? '0 8px 20px -8px rgba(22,163,74,0.55)' : 'none',
                          fontSize: 18, fontWeight: 700,
                          cursor: attivo ? 'pointer' : 'not-allowed',
                          fontFamily:'inherit',
                          letterSpacing:-0.1, whiteSpace:'nowrap',
                          display:'flex', alignItems:'center', justifyContent:'center', gap: 11,
                          transition:'filter 150ms ease-out',
                        }}>
                        {attivo && (
                          <span style={{
                            width: 26, height: 26, borderRadius:'50%', flexShrink: 0,
                            background:'rgba(255,255,255,0.22)',
                            display:'grid', placeItems:'center',
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                          </span>
                        )}
                        {/* Senza cifra: sta scritta enorme trenta pixel più su,
                            e una seconda copia sul pulsante era solo un numero
                            in più da confrontare. Il pulsante dice cosa succede
                            — non quanto. */}
                        {!attivo
                          ? (total === 0
                              ? (importoTocco ? 'Scrivi quanto incassi' : 'Scegli cosa saldare')
                              : `Mancano €${manca.toFixed(2)}`)
                          : inviaSuStaff
                            ? 'Manda su Byup Staff'
                            : parziale
                              ? 'Incassa in acconto'
                              : `Incassa in contanti · ${invoice ? 'fattura' : 'ricevuta'}`}
                      </button>
                      {/* Incassare una parte è normale — si paga in due, si
                          divide il tavolo — e va detto prima di premere: il
                          conto non si chiude, resta aperto per il resto. In
                          ambra, che in questa finestra è il colore di ciò che
                          resta in sospeso. */}
                      {attivo && parziale && (
                        <div style={{
                          display:'flex', alignItems:'center', gap: 10,
                          padding:'12px 16px', borderRadius: 12,
                          background: PAY_BG, color: PAY_INK,
                          fontSize: 16, fontWeight: 600,
                        }}>
                          <span>Il conto resta aperto con</span>
                          <span style={{
                            fontWeight: 800, letterSpacing:-0.3,
                            fontVariantNumeric:'tabular-nums',
                          }}>€{residuoDopo.toFixed(2)}</span>
                          <span>da saldare</span>
                        </div>
                      )}
                      </React.Fragment>
                    );
                  })()}

                  {/* Il resto NON si ripete qui: è già scritto grande accanto
                      alla cifra ricevuta, che è dove lo si legge mentre si
                      conta. Due volte nella stessa colonna era una delle due
                      di troppo. Torna dopo, sulla schermata di conferma, che
                      è l'unico posto dove serve di nuovo. */}
                  {preContoStampato && (
                    <div style={{
                      fontSize: 14.5, color:'#9CA3AF', textAlign:'center',
                      fontWeight: 600,
                    }}>
                      Pre-conto stampato {Math.floor((Date.now() - preContoStampato)/60000) || 'ora'}{Math.floor((Date.now() - preContoStampato)/60000) > 0 ? ' min fa' : ''}
                    </div>
                  )}
                </div>
                </div>
                </div>
                </div>
              </div>
              )}
            </div>

            {/* Dentro la finestra, non sopra: prende tutto il riquadro del
                salda conto e ne cambia il contenuto — niente velo, niente
                seconda cornice. Si torna indietro con la selezione e il metodo
                dov'erano. */}
            {window.SvFatturaModal && (
              <SvFatturaModal
                open={fatturaOpen}
                dentro
                lines={selectedOrdini.map(o => ({
                  displayName: o.nome,
                  piatto: { name: o.nome },
                  qty: selectedItems.get(o.id) || o.qty,
                  lineTotal: o.prezzo,
                }))}
                takeaway={false}
                cliente={fattura}
                onClose={() => setFatturaOpen(false)}
                onConfirm={setFattura}
                onRemove={() => setFattura(null)}/>
            )}

            {toast && (
              <div style={{
                position:'absolute', bottom: 80, left:'50%',
                transform:'translateX(-50%)',
                padding:'10px 16px', borderRadius: 999,
                background:'#0F1115', color:'#fff',
                fontSize: 16.5, fontWeight: 700,
                boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
                zIndex: 62,
              }}>{toast.text}</div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ────────── LISTA ARTICOLI PER CANALE ──────────
// Da dove è arrivato l'ordine è la prima cosa che divide un conto: i piatti
// battuti in cassa e quelli arrivati dai telefoni degli ospiti non si saldano
// nello stesso momento, e cercarli in una lista piatta vuol dire leggere ogni
// riga fino in fondo per scoprire di chi è. Raggruppati, la domanda «cosa
// hanno preso quelli dell'app?» ha una risposta che si vede, non si cerca.
//
// L'ordine dei gruppi è fisso — App, Webapp, Altro — e non segue i piatti:
// una lista che si riordina da sola sotto le mani non si impara mai.
// `selezione` sceglie la faccia della lista: nel pagamento le testate e le
// righe si spuntano; nel conto sono un documento — la stessa carta, letta in
// due momenti diversi.
function ListaPerCanale({ gruppi, selezione = true, selectedItems, toggleItem, setItemQty, guestById, isPagato, selezionaCanale, onChangeQty, onUpdate, onDelete }) {
  if (gruppi.length === 0) return <EmptyOrdini/>;
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14}}>
      {gruppi.map(g => {
        // Il conteggio dice cosa c'è nel gruppo, spunta compresa la roba già
        // pagata: è il contenuto della sezione, e le righe pagate si vedono
        // spente. La SPUNTA invece lavora solo su quello che si può ancora
        // incassare — prendere un piatto già pagato non vuol dire niente.
        const daPrendere = g.items.filter(o => !isPagato || !isPagato(o));
        const tutti = daPrendere.length > 0 && daPrendere.every(o => (selectedItems.get(o.id) || 0) >= o.qty);
        const alcuni = !tutti && daPrendere.some(o => (selectedItems.get(o.id) || 0) > 0);
        return (
          <div key={g.id} style={{
            border:'1px solid #EDEFF2', borderRadius: 14,
            background:'#fff', overflow:'hidden',
          }}>
            {/* Testata del canale. Dove si seleziona è premibile e prende
                tutto il gruppo in un gesto — senza, dividere il conto per
                canale vorrebbe dire spuntare otto righe a mano. Nel conto è
                una testata e basta: dice chi ha ordinato cosa, non chiede
                niente. */}
            {(() => {
              const dentroTestata = (
                <React.Fragment>
                  {selezione && (
                  <span aria-hidden="true" style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    display:'grid', placeItems:'center',
                    background: tutti ? SALDA_BRAND : '#fff',
                    border: `1.5px solid ${tutti || alcuni ? SALDA_BRAND : '#D1D5DB'}`,
                    opacity: daPrendere.length ? 1 : 0.4,
                  }}>
                    {tutti && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13 L9 17 L19 7"/></svg>
                    )}
                    {alcuni && <span style={{display:'block', width: 10, height: 2.5, background: SALDA_BRAND, borderRadius: 2}}/>}
                  </span>
                  )}
                  <span style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    display:'grid', placeItems:'center',
                    background: g.bg, color: g.ink,
                  }}>{g.icona}</span>
                  <span style={{fontSize: 17.5, fontWeight: 800, color:'#0F1115', letterSpacing:-0.2}}>
                    {g.label}
                  </span>
                  <span style={{color:'#D1D5DB', fontWeight: 700}}>·</span>
                  <span style={{
                    fontSize: 14.5, fontWeight: 700, color:'#6B7280',
                    background:'#F4F5F7', padding:'3px 10px', borderRadius: 999,
                  }}>
                    {g.items.length} articol{g.items.length === 1 ? 'o' : 'i'}
                  </span>
                </React.Fragment>
              );
              const base = {
                width:'100%', display:'flex', alignItems:'center', gap: 12,
                padding:'12px 14px', background:'#fff', border:'none',
                borderBottom:'1px solid #F1F3F5',
                fontFamily:'inherit', textAlign:'left',
              };
              if (!selezione) return <div style={base}>{dentroTestata}</div>;
              return (
                <button
                  onClick={() => { if (daPrendere.length) selezionaCanale(daPrendere); }}
                  disabled={!daPrendere.length}
                  onMouseEnter={e => { if (daPrendere.length) e.currentTarget.style.background = '#FAFBFC'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                  title={daPrendere.length ? (tutti ? `Togli ${g.label}` : `Prendi tutto ${g.label}`) : 'Già pagato'}
                  style={{
                    ...base,
                    cursor: daPrendere.length ? 'pointer' : 'default',
                    transition:'background 130ms ease-out',
                  }}>
                  {dentroTestata}
                </button>
              );
            })()}

            <div style={{display:'flex', flexDirection:'column', gap: 8, padding:'10px 12px 12px'}}>
              {g.items.map(o => (
                <ItemRowV2 key={o.id} o={o}
                  selectedQty={selectedItems.get(o.id) || 0}
                  onToggle={()=>toggleItem(o.id)}
                  onSetQty={(q)=>setItemQty(o.id, q)}
                  guest={o.guestId ? guestById[o.guestId] : null}
                  // Il canale è già scritto sulla testata: ripeterlo su ogni
                  // riga dentro il suo stesso gruppo è la definizione di
                  // rumore. Della pastiglia resta il nome — che lì dentro è
                  // l'unica cosa che distingue una riga dall'altra.
                  canaleNoto
                  selezione={selezione}
                  pagato={!!isPagato && isPagato(o)}
                  onChangeQty={onChangeQty}
                  onUpdate={onUpdate} onDelete={onDelete}/>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// I due canali da cui può arrivare un piatto. «Altro» tiene insieme tutto
// quello che non è nato da un utente dell'app: la comanda del cameriere, il
// piatto di cassa, e anche la webapp — chi inquadra il QR è anonimo, e una
// sezione per gente senza nome non divide niente. Qui c'era anche «Byup
// Webapp» come terza voce, con la sua icona: tre titoli per due distinzioni
// vere.
const SALDA_CANALI = [
  { id:'byup',  label:'Byup App', bg:'#FFE0DD', ink:'#E04347', icona: <IconTelefono/> },
  { id:'altro', label:'Altro',    bg:'#F1F2F5', ink:'#6B7280', icona: <IconPersone/> },
];

// A che punto è il piatto, con le parole e i colori della card in sala: chi
// legge il conto e chi guarda i tavoli devono vedere la stessa cosa chiamata
// nello stesso modo, o «Pronto» qui e «Servito» là diventano due stati diversi
// nella testa di chi lavora. Quattro tinte distinte perché la domanda alla
// cassa è «cosa manca ancora?» e la risposta si prende con la coda dell'occhio.
const SALDA_STATO_META = {
  ordinato:   { label:'In attesa',       ink:'#6B7280', bg:'#F3F4F6' },
  in_cottura: { label:'In preparazione', ink:'#A16207', bg:'#FEF3C7' },
  pronto:     { label:'Pronto',          ink:'#5B21B6', bg:'#EDE9FE' },
  consegnato: { label:'Consegnato',      ink:'#065F46', bg:'#D1FAE5' },
};

function StatoPiatto({ stato, spento }) {
  const m = SALDA_STATO_META[stato];
  // Uno stato che non conosciamo non si inventa: meglio niente che una
  // pastiglia che dice una cosa a caso sopra un conto da incassare.
  if (!m) return null;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
      padding:'4px 10px', borderRadius: 999,
      background: spento ? '#F1F3F5' : m.bg,
      color: spento ? '#9CA3AF' : m.ink,
      fontSize: 14, fontWeight: 700, whiteSpace:'nowrap',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: 'currentColor', opacity: spento ? 0.5 : 0.85,
      }}/>
      {m.label}
    </span>
  );
}

// `selezione` decide che riga è: nel passo del pagamento la card si spunta e
// porta il − e il +; nel conto è una riga di documento — si legge, si corregge
// (le correzioni arrivano con onUpdate/onDelete), non si sceglie.
function ItemRowV2({ o, selectedQty, onToggle, onSetQty, guest, canaleNoto, pagato, selezione = true, saldoRiga, onChangeQty, onUpdate, onDelete }) {
  // La webapp è anonima: «Guest 4» non è un nome, è un segnaposto, e una
  // pastiglia che dice un segnaposto non dice niente. Sulla riga compare solo
  // chi un nome ce l'ha — gli ospiti dell'app.
  const ospite = guest && guest.source !== 'guest' ? guest : null;
  const allSel = selectedQty >= o.qty;
  const noneSel = selectedQty === 0;
  const partialSel = !allSel && !noneSel;
  const stop = (e) => e.stopPropagation();
  const [editingName, setEditingName] = React.useState(false);
  const [editingPrice, setEditingPrice] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(o.nome);
  const [priceDraft, setPriceDraft] = React.useState(o.prezzo);
  const [hover, setHover] = React.useState(false);
  const clickTimer = React.useRef(null);

  React.useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current); }, []);
  React.useEffect(() => { setNameDraft(o.nome); }, [o.nome]);
  React.useEffect(() => { setPriceDraft(o.prezzo); }, [o.prezzo]);

  const commitName = () => {
    const v = nameDraft.trim();
    if (v && v !== o.nome) onUpdate && onUpdate(o.id, { nome: v });
    setEditingName(false);
  };
  const commitPrice = () => {
    const v = parseFloat(priceDraft);
    if (!isNaN(v) && v >= 0 && v !== o.prezzo) onUpdate && onUpdate(o.id, { prezzo: v });
    setEditingPrice(false);
  };

  // Si sceglie cliccando la card, tutta: la spunta dice se è dentro, non è un
  // bersaglio a parte da centrare col mouse mentre si ha il cliente davanti.
  return (
    <div
      onClick={(!selezione || editingName || editingPrice || pagato) ? undefined : onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={pagato ? 'Già pagato dall\u2019app: non si incassa di nuovo' : undefined}
      style={{
        display:'flex', alignItems:'center', gap: 12,
        padding:'12px 14px',
        cursor: (!selezione || editingName || editingPrice) ? 'default' : (pagato ? 'not-allowed' : 'pointer'),
        background: pagato ? '#F7F8FA' : (selezione && (allSel || partialSel) ? SALDA_BRAND_SOFT : (selezione && hover ? '#FAFBFC' : '#fff')),
        border: `1px solid ${pagato ? '#EDEFF2' : (selezione && (allSel || partialSel) ? '#FFD4D4' : '#EDEFF2')}`,
        borderRadius: 12, transition:'background 0.12s, border-color 0.12s',
        opacity: pagato ? 0.72 : 1,
      }}>
      {/* La spunta: stato, non comando — il click lo prende la card.
          Nel conto non c'è: una spunta che non decide niente insegnerebbe
          solo a non fidarsi delle spunte. */}
      {selezione && (
      <span aria-hidden="true" style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, pointerEvents:'none',
        display:'grid', placeItems:'center',
        background: pagato ? '#D6D9DE' : (noneSel ? '#fff' : SALDA_BRAND),
        border: `1.5px solid ${pagato ? '#D6D9DE' : (noneSel ? '#D1D5DB' : SALDA_BRAND)}`,
        transition:'background 0.12s, border-color 0.12s',
      }}>
        {(allSel || pagato) && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
        {partialSel && <span style={{width: 10, height: 2.5, background:'#fff', borderRadius: 2}}/>}
      </span>
      )}

      {/* IL − E IL + SU OGNI RIGA, anche da uno solo e anche quando la riga
          non è presa: il numero dice quanti se ne stanno saldando, e per
          cambiarlo si preme dov'è — sempre nello stesso posto, riga per riga.
          Prima comparivano solo sulle righe da più di uno e solo se selezionate:
          due condizioni da ricordare per un comando che deve essere lì e basta.
          Su un piatto già pagato restano fuori: non c'è niente da contare. */}
      {pagato ? (
        <span style={{
          fontSize: 16, fontWeight: 800, color:'#9CA3AF',
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 9,
          padding:'6px 0', minWidth: 40, textAlign:'center',
          fontVariantNumeric:'tabular-nums', flexShrink: 0,
        }}>{o.qty}</span>
      ) : !selezione ? (
        // Nel conto il − e il + correggono la QUANTITÀ ORDINATA — tre birre
        // battute per due — non quante se ne saldano: quello è il lavoro
        // dello stesso stepper nel passo dopo. Stessa forma, due grandezze:
        // qui cambia il conto, là cambia l'incasso.
        onChangeQty ? (
          <div onClick={stop} style={{
            display:'inline-flex', alignItems:'center',
            background:'#fff', border:'1px solid #E5E7EB', borderRadius: 9,
            overflow:'hidden', flexShrink: 0,
          }}>
            <button onClick={() => onChangeQty(o.id, o.qty - 1)} disabled={o.qty <= 1}
              style={{...qtyBtn, opacity: o.qty <= 1 ? 0.3 : 1}} title="Una in meno">−</button>
            <span style={{
              fontSize: 16, fontWeight: 800, color:'#0F1115',
              minWidth: 30, textAlign:'center', padding:'0 2px',
              whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums',
            }}>{o.qty}</span>
            <button onClick={() => onChangeQty(o.id, o.qty + 1)}
              style={qtyBtn} title="Una in più">+</button>
          </div>
        ) : (
          <span style={{
            fontSize: 16, fontWeight: 800, color:'#0F1115',
            background:'#fff', border:'1px solid #E5E7EB', borderRadius: 9,
            padding:'6px 0', minWidth: 40, textAlign:'center',
            fontVariantNumeric:'tabular-nums', flexShrink: 0,
          }}>{o.qty}</span>
        )
      ) : (
        <div onClick={stop} style={{
          display:'inline-flex', alignItems:'center',
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 9,
          overflow:'hidden', flexShrink: 0,
        }}>
          <button onClick={() => onSetQty(selectedQty - 1)} disabled={selectedQty <= 0}
            style={{...qtyBtn, opacity: selectedQty <= 0 ? 0.3 : 1}} title="Togli uno">−</button>
          <span style={{
            // Zero non è un numero come gli altri: è «questa riga non la stai
            // saldando», e si legge spento — accanto alla quantità ordinata,
            // che resta lì a dire di quante si sta parlando.
            fontSize: 16, fontWeight: 800,
            color: selectedQty === 0 ? '#C7CBD1' : '#0F1115',
            minWidth: 30, textAlign:'center', padding:'0 2px',
            whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums',
          }}>{selectedQty}{o.qty > 1 && <span style={{fontWeight: 600, color:'#C7CBD1'}}>/{o.qty}</span>}</span>
          <button onClick={() => onSetQty(selectedQty + 1)} disabled={selectedQty >= o.qty} style={{...qtyBtn, opacity: selectedQty >= o.qty ? 0.3 : 1}} title="Aggiungi uno">+</button>
        </div>
      )}

      {/* NOME — display o editing inline */}
      <span style={{flex:1, minWidth: 0, display:'inline-flex', alignItems:'center', gap: 4}}>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key==='Enter') commitName(); if (e.key==='Escape') { setNameDraft(o.nome); setEditingName(false); } }}
            onClick={stop}
            style={{
              flex:1, minWidth: 0, padding:'3px 6px',
              border:'1px solid #0F1115', borderRadius: 4,
              fontSize: 17, color:'#0F1115', outline:'none',
              fontFamily:'inherit', background:'#fff',
            }}
          />
        ) : (
          <span
            onClick={(e) => {
              if (!selezione) return;
              e.stopPropagation();
              if (clickTimer.current) clearTimeout(clickTimer.current);
              clickTimer.current = setTimeout(() => { onToggle(); clickTimer.current = null; }, 280);
            }}
            onDoubleClick={(e) => {
              if (!onUpdate) return;
              e.stopPropagation();
              if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
              setEditingName(true);
            }}
            title={onUpdate ? 'Doppio click per modificare il nome' : undefined}
            style={{
              fontSize: 17, color:'#0F1115', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              cursor:'default', borderRadius: 3, padding:'1px 3px', marginLeft: -3,
            }}
          >
            {o.nome}{o._added && <span style={{marginLeft: 6, fontSize: 13, color:'#16A34A', fontWeight: 800, letterSpacing: 0.4}}>NUOVO</span>}
          </span>
        )}
      </span>

      {/* A che punto è il piatto. Alla cassa serve PRIMA di incassare — un
          conto con una bistecca in cottura non si salda e basta — ed è per
          questo che vive nel passo del conto, dove il conto si legge. Nella
          colonna di selezione ruberebbe il posto al nome del piatto, che lì è
          la cosa da riconoscere. */}
      {!selezione && <StatoPiatto stato={o.stato} spento={pagato}/>}

      {/* Di chi è il piatto, e se quella parte è già stata pagata: una
          pastiglia sola invece del nome in corsivo più il marchio staccato. */}
      {ospite && (
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
          padding:'5px 10px', borderRadius: 999,
          background: pagato ? '#EEF0F3' : (o.origin === 'byup' && !canaleNoto ? '#FFE9E9' : '#F4F5F7'),
          fontSize: 14, fontWeight: 600,
          color: pagato ? '#9CA3AF' : '#6B7280',
        }}>
          {/* Dentro il gruppo il nome sta per intero: «Guest 4» accorciato a
              «Guest» non distingue più due persone diverse, ed è esattamente
              il lavoro che quella pastiglia deve fare lì. Fuori resta il nome
              di battesimo, che accanto al canale basta e occupa meno. */}
          {canaleNoto ? ospite.name : ospite.name.split(' ')[0]}
          {/* Dentro il suo gruppo il canale è già scritto in testata: la
              pastiglia si accorcia al nome. Resta invece «Pagato», che non è
              una provenienza ma uno stato — e quello nessuna testata lo dice. */}
          {(!canaleNoto || pagato) && <span style={{color:'#C7CBD1'}}>·</span>}
          {pagato ? (
            <span style={{fontWeight: 700}}>Pagato</span>
          ) : canaleNoto ? null : o.origin === 'byup' ? (
            <span style={{fontWeight: 800, color: SALDA_BRAND, letterSpacing: 0.3, textTransform:'uppercase', fontSize: 12.5}}>byup</span>
          ) : (
            <span style={{fontWeight: 600}}>{o.origin === 'guest' ? 'Webapp' : 'Cameriere'}</span>
          )}
        </span>
      )}
      {!ospite && o.origin === 'byup' && o.guestId && !canaleNoto && (
        <span style={{
          fontSize: 12.5, fontWeight: 800, color: SALDA_BRAND,
          background:'#FFE9E9', padding:'3px 8px', borderRadius: 999,
          letterSpacing: 0.3, textTransform:'uppercase', flexShrink: 0,
        }}>byup</span>
      )}

      {/* PREZZO — click to edit */}
      {editingPrice ? (
        <input
          autoFocus type="number" step="0.5" min="0"
          value={priceDraft}
          onChange={e => setPriceDraft(e.target.value)}
          onBlur={commitPrice}
          onKeyDown={e => { if (e.key==='Enter') commitPrice(); if (e.key==='Escape') { setPriceDraft(o.prezzo); setEditingPrice(false); } }}
          onClick={stop}
          style={{
            width: 72, padding:'3px 6px',
            border:'1px solid #0F1115', borderRadius: 4,
            fontSize: 17, color:'#0F1115', outline:'none',
            fontFamily:'inherit', background:'#fff',
            textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700,
          }}
        />
      ) : onUpdate ? (
        <button
          onClick={(e) => { e.stopPropagation(); setEditingPrice(true); }}
          title="Modifica prezzo unitario"
          style={{
            fontSize: 17, fontWeight: 700, color: pagato ? '#9CA3AF' : '#0F1115',
            minWidth: 66, textAlign:'right', fontVariantNumeric:'tabular-nums',
            background:'transparent', border:'none', cursor:'pointer',
            padding:'2px 4px', borderRadius: 4, fontFamily:'inherit',
            transition:'background 120ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F2F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          €{((!selezione || noneSel) ? o.qty * o.prezzo : selectedQty * o.prezzo).toFixed(2)}
        </button>
      ) : saldoRiga != null ? (
        // SALDO — quanto di questa riga resta da incassare. Non è il prezzo
        // pieno (che sta nel conto) né il valore selezionato (che sta
        // nell'hero): è la parte ancora aperta, e quando è zero non dice
        // «€0.00» — dice il fatto, «Saldato».
        saldoRiga <= 0.004 ? (
          <span style={{
            fontSize: 14.5, fontWeight: 800, color:'#16A34A',
            letterSpacing: 0.3, textTransform:'uppercase',
            minWidth: 66, textAlign:'right', padding:'2px 4px', flexShrink: 0,
          }}>Saldato</span>
        ) : (
          <span style={{
            fontSize: 17, fontWeight: 700, color:'#0F1115',
            minWidth: 66, textAlign:'right', fontVariantNumeric:'tabular-nums',
            padding:'2px 4px', flexShrink: 0,
          }}>€{saldoRiga.toFixed(2)}</span>
        )
      ) : (
        <span style={{
          fontSize: 17, fontWeight: 700, color: pagato ? '#9CA3AF' : '#0F1115',
          minWidth: 66, textAlign:'right', fontVariantNumeric:'tabular-nums',
          padding:'2px 4px', flexShrink: 0,
        }}>
          €{((noneSel) ? o.qty * o.prezzo : selectedQty * o.prezzo).toFixed(2)}
        </span>
      )}

      {/* DELETE — non su un piatto già pagato: quella riga è la prova di un
          incasso, e toglierla farebbe sparire i soldi dal conto. E solo nel
          conto: nel pagamento le righe non si correggono, si scelgono. */}
      {onDelete && (
      <button
        disabled={pagato}
        onClick={(e) => { e.stopPropagation(); if (!pagato && onDelete) onDelete(o.id); }}
        title="Elimina articolo"
        style={{
          width: 22, height: 22, padding: 0, borderRadius: 4,
          background:'transparent', border:'none', cursor:'pointer',
          color: (hover && !pagato) ? '#9CA3AF' : 'transparent',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          fontFamily:'inherit', transition:'color 120ms, background 120ms',
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (pagato) return; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEE2E2'; }}
        onMouseLeave={e => { e.currentTarget.style.color = (hover && !pagato) ? '#9CA3AF' : 'transparent'; e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6"/>
        </svg>
      </button>
      )}
    </div>
  );
}

const qtyBtn = {
  width: 22, height: 22, padding: 0, border: 'none',
  background: 'transparent', color: '#0F1115',
  fontSize: 18, fontWeight: 800, cursor:'pointer',
  display:'grid', placeItems:'center',
};

function EmptyOrdini() {
  return (
    <div style={{
      padding:'40px 20px', textAlign:'center', color:'#9CA3AF',
      fontSize: 17,
    }}>Nessun articolo ordinato</div>
  );
}

// ────────── RIGHT COLUMN HELPERS ──────────
function ReceiptRow({ label, value, tone, onRemove }) {
  const color = tone === 'success' ? '#16A34A' : tone === 'danger' ? '#DC2626' : '#6B7280';
  return (
    <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 16.5}}>
      <span style={{color, flex: 1}}>{label}</span>
      {onRemove && (
        <button onClick={onRemove} style={{
          background:'transparent', border:'none', padding: 0,
          fontFamily:'inherit', fontSize: 15, color:'#9CA3AF',
          cursor:'pointer', textDecoration:'underline',
        }}>rimuovi</button>
      )}
      <span style={{color, fontWeight: 700, fontVariantNumeric:'tabular-nums'}}>{value}</span>
    </div>
  );
}

// La tessera del metodo, gemella di quella in Vendita diretta: icona e nome
// su una riga sola, e la spunta nell'angolo quando è scelta. La spunta serve
// perché il colore da solo, su due tessere affiancate, dice «una è diversa» ma
// non «questa è quella scelta» — e a chi ha un cliente davanti serve la
// seconda. Le vecchie linguette erano alte 14 px con l'icona sopra al nome:
// due tessere impilate in verticale in una finestra larga il doppio.
function SaldaMetodoCard({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      position:'relative',
      display:'flex', alignItems:'center', justifyContent:'center', gap: 12,
      padding:'20px 18px', borderRadius: 14,
      background: active ? SALDA_BRAND_SOFT : '#fff',
      border: `1.5px solid ${active ? SALDA_BRAND : SALDA_BORDO}`,
      color: active ? SALDA_BRAND : SALDA_INK,
      fontSize: 18.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
      transition:'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    }}>
      {active && (
        <span style={{
          position:'absolute', top: 9, right: 9,
          width: 22, height: 22, borderRadius:'50%',
          background: SALDA_BRAND, color:'#fff',
          display:'grid', placeItems:'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
        </span>
      )}
      {icon}
      {label}
    </button>
  );
}

// Contante ricevuto — stesso disegno dell'INCASSA di Vendita diretta: una
// fila sola (Esatto, i tagli, la casella «Altro»), campo vuoto = Esatto, e
// il resto compare SOLO quando esiste. Prima c'era un campo grande che
// duplicava il totale e una striscia che diceva «Pagamento esatto» — cioè
// il caso normale — con una cifra in più da ignorare.
function CashTendered({ total, value, onChange, chips }) {
  const esatto = value === '';
  const tendered = esatto ? total : parseFloat(value) || 0;
  const enough = tendered >= total - 0.01 && tendered > 0;
  const resto = tendered - total;
  // La casella in fondo alla fila resta «Altro» finché non ci si scrive
  // dentro: premendo un taglio la cifra è già scritta sul pulsante accanto, e
  // ricopiarla qui faceva sembrare che nella stessa riga ci fossero due
  // contanti diversi. Serve saperlo, non dedurlo dal numero: chi scrive a mano
  // «85» ha scelto la casella, anche se il taglio da 85 esiste.
  const [libero, setLibero] = React.useState(false);
  const custom = libero && value !== '';
  return (
    <div>
      <div style={SALDA_LABEL}>Contante ricevuto</div>

      <div style={{display:'grid', gridTemplateColumns:`repeat(${chips.length + 1}, 1fr)`, gap: 10}}>
        {chips.map((c, i) => {
          // Il primo chip è «Esatto»: torna a SEGUIRE il totale (campo
          // vuoto), così resta giusto anche se il totale cambia dopo.
          const sel = libero ? false : (i === 0 ? esatto : (!esatto && parseFloat(c.val) === tendered));
          return (
            <button key={c.label} onClick={() => { setLibero(false); onChange(i === 0 ? '' : c.val); }} style={{
              // Scelto = velatura corallo col bordo acceso, non corallo pieno:
              // in una fila di cinque, il pieno gridava più della cifra grande
              // che sta trenta pixel sopra. Stessa mano della finestra Incassa.
              padding:'13px 8px', borderRadius: 12,
              background: sel ? SALDA_BRAND_SOFT : '#fff',
              color: sel ? SALDA_BRAND : SALDA_INK,
              border: `1px solid ${sel ? SALDA_BRAND : SALDA_BORDO}`,
              fontSize: 16.5, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
              fontVariantNumeric:'tabular-nums',
              transition:'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
            }}>{c.label}</button>
          );
        })}
        {/* L'ultimo posto della fila NON è più «Altro» e basta: è il campo che
            dice quanto hai in mano, comunque tu l'abbia scelto. Restava sul
            segnaposto anche con «Esatto» premuto o una cifra scelta — la fila
            diceva la scelta, il campo restava muto, e per sapere il contante
            ricevuto bisognava rileggere quale pastiglia fosse accesa.
            Ora porta sempre il numero, incolonnato al centro. Cliccandolo si
            seleziona tutto: si scrive sopra senza cancellare prima. */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap: 3,
          padding:'13px 8px', borderRadius: 12,
          background: custom ? SALDA_BRAND_SOFT : '#fff',
          border: `1px solid ${custom ? SALDA_BRAND : SALDA_BORDO}`,
          cursor:'text',
        }}>
          {custom && (
            <span style={{
              fontSize: 16.5, fontWeight: 700, flexShrink: 0, color: SALDA_BRAND,
            }}>€</span>
          )}
          <input
            value={custom ? value : ''}
            onChange={e => { const v = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'); setLibero(v !== ''); onChange(v); }}
            onFocus={e => e.currentTarget.select()}
            inputMode="decimal"
            placeholder="Altro"
            aria-label="Contante ricevuto"
            style={{
              width:'100%', minWidth: 0, border:'none', outline:'none',
              background:'transparent', fontFamily:'inherit', textAlign:'center',
              fontSize: 16.5, fontWeight: 700,
              color: custom ? SALDA_BRAND : SALDA_INK,
              padding: 0, fontVariantNumeric:'tabular-nums',
            }}/>
        </div>
      </div>

      {/* Il resto — o quanto manca — con le monete accanto, come al banco.
          Compare solo quando esiste: col pagamento esatto è una riga che dice
          zero. */}
      {!esatto && (resto > 0.01 || !enough) && tendered > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12,
          marginTop: 12, padding:'12px 16px', borderRadius: 14,
          background: enough ? '#F5F6F8' : PAY_BG,
        }}>
          <span style={{color: enough ? SALDA_BRAND : PAY_INK, display:'inline-flex', flexShrink: 0}}>
            <IconMonete/>
          </span>
          <span style={{fontSize: 16.5, color: enough ? SALDA_MUTED : PAY_INK}}>
            {enough ? 'Resto da dare' : 'Mancano'}
          </span>
          <span style={{flex:1}}/>
          <span style={{
            fontSize: 19, fontWeight: 800, letterSpacing:-0.3,
            color: enough ? SALDA_INK : PAY_INK,
            fontVariantNumeric:'tabular-nums',
          }}>€{Math.abs(enough ? resto : total - tendered).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// Attesa del pagamento su Byup Staff — sostituisce tutto il contenuto
// della finestra, che intanto si stringe. È il modo più semplice di dire
// "adesso non si tocca niente": invece di spegnere lista, metodi e
// pulsante uno per uno, non c'è proprio nient'altro sullo schermo.
//
// Due uscite, che fanno cose opposte e vanno tenute distinte: "Ritira"
// toglie il conto dalla coda e lo riporta modificabile qui, "Chiudi" lo
// lascia in coda e libera la cassa. Con il solo Ritira, chi vuole solo
// andarsene lo premerebbe per sbaglio.
//
// "Ritira" e non "Annulla" perché non è una cancellazione: il conto torna
// indietro, si corregge e si rimanda. È la stessa parola del pannello in
// Sala, ed è lo stesso gesto.
//
// Resta premibile fino alla fine. Se arriva tardi — carta già passata —
// non lo diciamo con un terzo stato: perde la corsa e la finestra passa a
// saldato, che è quello che è successo davvero.
function SaldaAttesaPagamento({ tavolo, total, elapsed, onRitira, onClose }) {
  const secondi = Math.floor((elapsed || 0) / 1000);
  const mmss = `${Math.floor(secondi / 60)}:${String(secondi % 60).padStart(2, '0')}`;

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding: 30,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius:'50%',
        background: PAY_BG, color: PAY_INK,
        marginBottom: 16, display:'grid', placeItems:'center',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
        </svg>
      </div>

      {/* Il pallino pulsa per dire "e' ancora vivo", ma non e' mai l'unico
          segnale: la scritta dice la stessa cosa a parole. */}
      <div style={{
        fontSize: 25, fontWeight: 800, color: PAY_INK, marginBottom: 4,
        display:'flex', alignItems:'center', gap: 10, letterSpacing:-0.3,
      }}>
        <span aria-hidden="true" style={{
          width: 11, height: 11, borderRadius: 999, flexShrink: 0,
          background: PAY_INK, animation:'saldaPayPulse 1.6s ease-in-out infinite',
        }}/>
        In coda su Byup Staff
      </div>

      <div style={{fontSize: 34, fontWeight: 800, color:'#0F1115', marginBottom: 6, letterSpacing:-0.8, fontVariantNumeric:'tabular-nums'}}>
        €{total.toFixed(2)}
      </div>

      {/* Il contatore e' l'unica cosa che si muove: senza, una schermata
          ferma non distingue "sta aspettando" da "si e' piantata". */}
      <div style={{fontSize: 16.5, color:'#6B7280', marginBottom: 14, textAlign:'center'}}>
        Tavolo {tavolo.id} · in attesa da {mmss}
      </div>

      {/* Cosa deve succedere adesso, e per mano di chi: la cassa qui non
          incassa niente, la carta si passa dal telefono. Senza questa riga
          si resta a guardare un contatore aspettando qualcosa che nessuno
          ha ancora fatto. */}
      <div style={{
        padding:'11px 14px', borderRadius: 12, background: PAY_BG, color: PAY_INK,
        fontSize: 16, lineHeight: 1.45, textAlign:'center', marginBottom: 20,
      }}>
        Apri <b>Byup Staff</b> sul telefono e passa la carta.<br/>
        Il conto si chiude da solo appena il pagamento va a buon fine.
      </div>

      <div style={{display:'flex', gap: 8}}>
        <button onClick={onRitira} style={btnSecondaryV2}>Ritira il conto</button>
        <button onClick={onClose} style={btnPrimaryV2}>Chiudi</button>
      </div>

      {/* Le due uscite fanno cose opposte e finora si distinguevano solo dal
          verbo: qui si dice quale conseguenza ha ciascuna. */}
      <div style={{
        fontSize: 14.5, color:'#9CA3AF', marginTop: 10,
        textAlign:'center', lineHeight: 1.45, maxWidth: 320,
      }}>
        «Ritira» riporta il conto in cassa e lo rende di nuovo modificabile.
        «Chiudi» lo lascia in coda: il telefono può incassarlo lo stesso.
      </div>
    </div>
  );
}

// Canali già incassati su questo conto — stessi colori della sezione conti
// in Contabilità, così un pagamento con l'app si riconosce a colpo d'occhio
// in tutti e due i posti.
const PAG_META = {
  contanti: { label:'Contanti', ink:'#0F766E', bg:'#CCFBF1' },
  carta:    { label:'Carta',    ink:'#1D4ED8', bg:'#DBEAFE' },
  byup:     { label:'Byup app', ink:'#7C3AED', bg:'#EDE9FE' },
};

function PagamentiConto({ pagamenti, onStorna }) {
  // Chiuso di suo: quanto è già arrivato è un numero solo, e alla cassa serve
  // quello. Chi ha pagato e a che ora è la risposta a una domanda che si fa
  // di rado — quando un cliente dice «ma io ho già pagato» — e allora si apre.
  const [aperto, setAperto] = React.useState(false);
  // Niente pagamenti, niente blocco: uno stato vuoto qui sarebbe solo
  // un'altra cosa da leggere in una schermata già piena.
  if (!pagamenti || pagamenti.length === 0) return null;
  const totale = pagamenti.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <button
        onClick={() => setAperto(a => !a)}
        title={aperto ? 'Nascondi chi ha pagato' : 'Vedi chi ha pagato e quando'}
        onMouseEnter={e => { e.currentTarget.style.background = '#FAFBFC'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          gap: 10, padding:'14px 22px', background:'#fff',
          border:'none', borderTop:'1px solid #EDEFF2', borderBottom:'1px solid #EDEFF2',
          cursor:'pointer', fontFamily:'inherit', textAlign:'left',
          transition:'background 140ms ease-out',
        }}>
        <span style={{display:'inline-flex', alignItems:'center', gap: 8, minWidth: 0}}>
          <span style={{
            fontSize: 14.5, color:'#6B7280', fontWeight: 800,
            letterSpacing: 0.8, textTransform:'uppercase',
          }}>Già incassato</span>
          <span style={{
            fontSize: 12.5, fontWeight: 700, color:'#9CA3AF',
            padding:'1px 7px', borderRadius: 999, background:'#F4F5F7',
            fontVariantNumeric:'tabular-nums',
          }}>{pagamenti.length}</span>
        </span>
        <span style={{display:'inline-flex', alignItems:'center', gap: 8}}>
          <span style={{
            fontSize: 17, fontWeight: 800, color:'#0F1115',
            fontVariantNumeric:'tabular-nums',
          }}>€{totale.toFixed(2)}</span>
          <span style={{
            display:'inline-flex', color:'#9CA3AF',
            transform: aperto ? 'rotate(180deg)' : 'none', transition:'transform 180ms ease-out',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </span>
      </button>

      {aperto && (
      <div style={{padding:'12px 22px 0'}}>
        <div style={{display:'flex', flexDirection:'column', gap: 6}}>
          {pagamenti.map(p => {
            const meta = PAG_META[p.method] || PAG_META.contanti;
            return (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'9px 12px', background:'#fff',
                border:'1px solid #F0F2F5', borderRadius: 10,
              }}>
                <span style={{
                  padding:'3px 9px', borderRadius: 999, flexShrink: 0,
                  background: meta.bg, color: meta.ink,
                  fontSize: 14, fontWeight: 700,
                }}>{meta.label}</span>
                <span style={{
                  flex: 1, minWidth: 0, fontSize: 15, color:'#9CA3AF',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{[p.chi, p.ora].filter(Boolean).join(' · ')}</span>
                <span style={{
                  fontSize: 16, fontWeight: 700, color:'#0F1115',
                  fontVariantNumeric:'tabular-nums', minWidth: 62, textAlign:'right',
                }}>€{p.amount.toFixed(2)}</span>
                {/* Lo storno sta accanto al pagamento che storna, che è l'unico
                    posto dove si sa QUALE annullare: un conto pagato in tre
                    riprese ha tre righe, e un pulsante fuori da qui dovrebbe
                    prima chiedere quale. La freccia torna indietro: il denaro
                    rifà la strada al contrario. */}
                {onStorna && (
                  <button
                    onClick={() => onStorna(p)}
                    title={p.method === 'contanti'
                      ? `Annulla €${p.amount.toFixed(2)} in contanti`
                      : `Storna €${p.amount.toFixed(2)}: parte la richiesta su Byup Staff`}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
                    style={{
                      width: 30, height: 30, padding: 0, borderRadius: 8, flexShrink: 0,
                      background:'transparent', border:'none', color:'#9CA3AF',
                      cursor:'pointer', fontFamily:'inherit',
                      display:'grid', placeItems:'center',
                      transition:'background 150ms ease-out, color 150ms ease-out',
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h11a5 5 0 0 1 0 10h-6"/><path d="M7 4 3 8l4 4"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Niente scorciatoia a Contabilità: sarebbe un cambio di pagina a
            conto aperto, con il cliente al tavolo che aspetta. Il rimborso
            si fa da lì quando è il suo momento — qui basta vedere che quei
            soldi sono già arrivati. */}
      </div>
      )}
    </>
  );
}

// ────────── STORNO ──────────
// Il contrario dell'incasso, e si legge come lui al contrario: si chiede, si
// aspetta se i soldi devono rifare la strada su una carta, è fatto. Tre
// schermate no: una sola che cambia poche parole, perché è sempre lo stesso
// fatto in tre momenti.
//
// Il tasto che conferma è rosso e non corallo: qui non si sta scegliendo,
// si sta togliendo — ed è l'unico posto di questa finestra dove un tocco
// fa uscire dei soldi invece di farli entrare.
function SaldaStorno({ p, fase, residuoDopo, onConferma, onChiudi }) {
  const carta = p.method !== 'contanti';
  const cerchio = (bg, fg, children) => (
    <div style={{
      width: 64, height: 64, borderRadius:'50%', marginBottom: 16,
      background: bg, color: fg, display:'grid', placeItems:'center',
    }}>{children}</div>
  );

  return (
    <div style={{padding:'36px 28px 26px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center'}}>
      {fase === 'fatto'
        ? cerchio('#DCFCE7', SALDA_VERDE,
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>)
        : cerchio(PAY_BG, PAY_INK,
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h11a5 5 0 0 1 0 10h-6"/><path d="M7 4 3 8l4 4"/></svg>)}

      <div style={{
        fontSize: 24, fontWeight: 800, color: SALDA_INK, letterSpacing:-0.4,
        display:'flex', alignItems:'center', gap: 10,
      }}>
        {fase === 'attesa' && (
          <span aria-hidden="true" style={{
            width: 11, height: 11, borderRadius: 999, flexShrink: 0,
            background: PAY_INK, animation:'saldaPayPulse 1.6s ease-in-out infinite',
          }}/>
        )}
        {fase === 'conferma' ? (carta ? 'Stornare sulla carta?' : 'Annullare questo incasso?')
          : fase === 'attesa' ? 'Storno in corso'
          : 'Incasso stornato'}
      </div>

      <div style={{
        fontSize: 34, fontWeight: 800, color: SALDA_INK, marginTop: 6,
        letterSpacing:-0.8, fontVariantNumeric:'tabular-nums',
      }}>€{p.amount.toFixed(2)}</div>

      {/* Una riga sola, e dice il gesto che tocca a chi legge — non lo stato
          interno del sistema. Alla fine dice l'altra metà della cosa: il conto
          è tornato aperto, e di quanto. */}
      <div style={{fontSize: 16, color: SALDA_MUTED, marginTop: 6, maxWidth: 380, lineHeight: 1.45}}>
        {fase === 'conferma'
          ? (carta
            ? 'La richiesta parte su Byup Staff: l’importo torna sulla carta del cliente.'
            : 'Esce dal conto: ridai i contanti dal cassetto.')
          : fase === 'attesa'
            ? 'Richiesta inviata'
            : (carta ? 'Restituiti sulla carta del cliente.' : `Ridai €${p.amount.toFixed(2)} dal cassetto.`)}
      </div>

      {fase === 'conferma' ? (
        <div style={{display:'flex', gap: 10, marginTop: 24, width:'100%'}}>
          <button onClick={onChiudi} style={{
            flex: 1, padding:'13px 18px', borderRadius: 14,
            background:'transparent', color: SALDA_INK,
            border:`1px solid ${SALDA_BORDO}`,
            fontSize: 16.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>Lascia com'è</button>
          <button onClick={onConferma} style={{
            flex: 1, padding:'13px 18px', borderRadius: 14,
            background:'#DC2626', color:'#fff', border:'none',
            fontSize: 16.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>{carta ? 'Storna' : 'Annulla l’incasso'}</button>
        </div>
      ) : fase === 'attesa' ? (
        <button onClick={onChiudi} style={{
          marginTop: 24, width:'100%', padding:'13px 18px', borderRadius: 14,
          background:'transparent', color: SALDA_MUTED,
          border:`1px solid ${SALDA_BORDO}`,
          fontSize: 16.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        }}>Torna al conto</button>
      ) : (
        <React.Fragment>
          {residuoDopo > 0.004 && (
            <div style={{
              marginTop: 18, width:'100%', padding:'12px 16px', borderRadius: 12,
              background: PAY_BG, color: PAY_INK,
              display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
              fontSize: 16, fontWeight: 600,
            }}>
              <span>Il conto è tornato aperto</span>
            </div>
          )}
          <button onClick={onChiudi} style={{
            marginTop: 18, width:'100%', padding:'13px 18px', borderRadius: 14,
            background: SALDA_INK, color:'#fff', border:'none',
            fontSize: 16.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>Torna al conto</button>
        </React.Fragment>
      )}
    </div>
  );
}

// Qui vivevano MixedPay, SmallPayInput, IconSplit e miniSplit: i pezzi del
// pagamento «misto», che chiedeva di spezzare a mano l'importo fra contanti e
// carta e di far quadrare la somma col totale. Tolto il metodo, non li usava
// più nessuno. Chi paga metà e metà salda due volte lo stesso conto: il
// parziale è già previsto, e il conto sa restare aperto per il resto.

// ────────── PANNELLO SCONTO ──────────
// UNA COSA SOLA, IN UNA FILA SOLA. Erano quattro linguette scure sopra a una
// fila di pastiglie grigie e a un campo largo quanto il pannello: tre livelli
// per scegliere un numero, con un nero che in questa finestra non appartiene a
// nessun altro comando. Adesso è la stessa fila del «Contante ricevuto» —
// quattro tagli e la casella per scriverne uno qualunque — e l'unità (€ o %)
// è un interruttore da due caselle accanto all'etichetta, perché è l'unica
// altra domanda: quanto, e in che unità.
//
// «Arrotonda» non c'è più: faceva una cosa sola e non chiedeva niente
// («arrotonda per difetto a €46»), cioè era uno sconto già scritto — e per
// giunta l'unico dei quattro che non si poteva dosare. Chi vuole togliere
// quei centesimi scrive la cifra, che è il gesto che sta già facendo.
function AdjustPanel({ subtotale, adjust, setAdjust }) {
  const [mode, setMode] = React.useState(adjust?.type === 'sconto-pct' ? 'sconto-pct' : 'sconto-eur');
  const [val, setVal] = React.useState(adjust?.val ?? '');
  // La cifra l'ha scritta qualcuno QUI DENTRO, o l'ha messa un chip? La
  // casella deve restare «Altro» finché non ci si scrive: col chip acceso il
  // numero è già scritto sul pulsante accanto, e riscriverlo nella casella fa
  // sembrare che nella stessa fila ci siano due sconti diversi.
  const [libero, setLibero] = React.useState(false);
  const pct = mode === 'sconto-pct';

  React.useEffect(() => {
    if (adjust) { setMode(adjust.type); setVal(adjust.val ?? ''); }
  }, [adjust]);

  // Zero, vuoto o una cifra che non è una cifra vogliono dire la stessa cosa:
  // nessuno sconto. Meglio togliere la correzione che tenerne una da €0,00
  // scritta nel riepilogo.
  function apply(t, v) {
    const n = parseFloat(String(v).replace(',', '.'));
    if (!n || isNaN(n) || n <= 0) { setAdjust(null); return; }
    setAdjust({ type: t, val: n });
  }
  function cambiaUnita(t) {
    // Dieci euro e dieci per cento non sono lo stesso sconto: cambiando unità
    // il numero non si porta dietro, si riparte.
    if (t === mode) return;
    setMode(t); setVal(''); setLibero(false); setAdjust(null);
  }

  const num = parseFloat(String(val).replace(',', '.')) || 0;
  // Acceso solo se la cifra è nata QUI: un chip premuto illumina il chip, non
  // la casella.
  const suMisura = libero && num > 0;

  return (
    <div style={{
      padding: 12, borderRadius: 12,
      background:'#FAFBFC', border:'1px solid #EDEFF2',
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 8}}>
        <span style={{fontSize: 15, fontWeight: 700, color:'#6B7280'}}>
          Sconto sul totale
        </span>
        <span style={{flex:1}}/>
        {/* Due caselle, non due linguette: la stessa forma delle pastiglie qui
            sotto, perché scelgono nella stessa fila di pensiero. */}
        <div style={{display:'inline-flex', gap: 4}}>
          {[{id:'sconto-eur', label:'€'}, {id:'sconto-pct', label:'%'}].map(u => {
            const sel = mode === u.id;
            return (
              <button key={u.id} onClick={() => cambiaUnita(u.id)} title={u.id === 'sconto-eur' ? 'Sconto in euro' : 'Sconto in percentuale'} style={{
                width: 38, padding:'6px 0', borderRadius: 9,
                background: sel ? SALDA_BRAND : '#fff',
                color: sel ? '#fff' : '#6B7280',
                border: `1px solid ${sel ? SALDA_BRAND : '#E5E7EB'}`,
                fontSize: 16, fontWeight: 800, cursor:'pointer', fontFamily:'inherit',
                transition:'background 0.14s, border-color 0.14s, color 0.14s',
              }}>{u.label}</button>
            );
          })}
        </div>
      </div>

      {/* Quattro tagli e la casella libera, esattamente come il contante: chi
          sta in cassa fa lo stesso gesto due volte nella stessa finestra, e
          due gesti uguali non possono avere due forme diverse. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 6}}>
        {[5, 10, 15, 20].map(v => {
          const sel = !libero && num === v;
          return (
            <button key={v} onClick={() => { setLibero(false); setVal(v); apply(mode, v); }} style={{
              padding:'13px 4px', borderRadius: 12,
              background: sel ? SALDA_BRAND_SOFT : '#fff',
              color: sel ? SALDA_BRAND : SALDA_INK,
              border: `1px solid ${sel ? SALDA_BRAND : SALDA_BORDO}`,
              fontSize: 16.5, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
              fontVariantNumeric:'tabular-nums',
              transition:'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
            }}>{pct ? `−${v}%` : `−€${v}`}</button>
          );
        })}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap: 3,
          padding:'13px 4px', borderRadius: 12,
          background: suMisura ? SALDA_BRAND_SOFT : '#fff',
          border: `1px solid ${suMisura ? SALDA_BRAND : SALDA_BORDO}`,
          cursor:'text',
        }}>
          {/* L'unità compare con la cifra: sulla casella vuota resta solo
              «Altro», che è tutto quello che quel posto deve dire. */}
          {!pct && suMisura && (
            <span style={{
              fontSize: 16, fontWeight: 700, flexShrink: 0, color: SALDA_BRAND,
            }}>€</span>
          )}
          <input
            value={suMisura ? val : ''}
            onChange={e => { const v = e.target.value.replace(/[^0-9.,]/g, ''); setLibero(v !== ''); setVal(v); apply(mode, v); }}
            onFocus={e => e.currentTarget.select()}
            inputMode="decimal"
            placeholder="Altro"
            aria-label={pct ? 'Percentuale di sconto' : 'Importo dello sconto in euro'}
            style={{
              width:'100%', minWidth: 0, border:'none', outline:'none',
              background:'transparent', fontFamily:'inherit', textAlign:'center',
              fontSize: 16, fontWeight: 700,
              color: suMisura ? SALDA_BRAND : SALDA_INK,
              padding: 0, fontVariantNumeric:'tabular-nums',
            }}/>
          {pct && suMisura && (
            <span style={{
              fontSize: 16, fontWeight: 700, flexShrink: 0, color: SALDA_BRAND,
            }}>%</span>
          )}
        </div>
      </div>

      {/* Quanto vale davvero, in euro, mentre lo si sceglie: uno sconto in
          percentuale è una promessa finché non si vede la cifra che toglie.
          Il totale grande qui sopra la mostra già aggiornata — questa riga
          serve al passaggio, non al risultato. */}
      {pct && num > 0 && (
        <div style={{fontSize: 15, color:'#6B7280', marginTop: 8}}>
          {num}% di €{subtotale.toFixed(2)} · <b style={{color:'#0F1115'}}>−€{(subtotale * num / 100).toFixed(2)}</b>
        </div>
      )}
    </div>
  );
}

// ────────── DONE ──────────
// Fra il tocco sul pulsante e la mano nel cassetto passano dei secondi, e
// questa è la schermata che si ha davanti in quei secondi: prima di tutto
// quanto va restituito, poi com'è stato pagato. Prima diceva solo il totale
// e il metodo — il resto lo si ricordava a memoria, o lo si andava a
// ricalcolare riaprendo il conto che intanto era chiuso.
// Stessa lingua e stessi colori della conferma d'incasso in Vendita diretta:
// è lo stesso gesto, fatto dalla stessa persona dietro allo stesso bancone.
function SaldaDoneV2({ tavolo, esito, onClose }) {
  const { total, contanti, carta, resto, invoice, invoiceData, residuo, parziale } = esito;
  // Un incasso, un modo: tolto il «misto», contanti e carta non possono più
  // essere pieni insieme nello stesso pagamento.
  const comeHaPagato = carta > 0 ? 'Con la carta, su Byup Staff' : 'In contanti, alla cassa';
  const [stampato, setStampato] = React.useState(false);

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', padding:'30px 26px 24px',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: parziale ? '#FEF3C7' : '#DCFCE7',
        color: parziale ? PAY_INK : '#16A34A',
        marginBottom: 14,
        display:'grid', placeItems:'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13 L9 17 L19 7"/>
        </svg>
      </div>
      <div style={{fontSize: 25, fontWeight: 800, color:'#0F1115', marginBottom: 3, letterSpacing:-0.4}}>
        {parziale ? 'Incassato' : 'Conto saldato'}
      </div>
      <div style={{fontSize: 36, fontWeight: 800, color:'#0F1115', marginBottom: 4, letterSpacing:-1, fontVariantNumeric:'tabular-nums'}}>
        €{total.toFixed(2)}
      </div>
      <div style={{fontSize: 16.5, color:'#6B7280', marginBottom: 18, textAlign:'center'}}>
        Tavolo {tavolo.id} · {comeHaPagato}
      </div>

      {/* Quanto resta sul tavolo: il conto non si è chiuso, e chi torna in
          sala deve sapere che quel tavolo ha ancora da dare. */}
      {parziale && residuo > 0.004 && (
        <div style={{
          width:'100%', marginBottom: 14,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
          padding:'12px 16px', borderRadius: 12,
          background:'#F5F6F8', border:'1px solid #EDEFF2',
        }}>
          <span style={{fontSize: 16.5, color:'#6B7280'}}>Resta da saldare sul tavolo</span>
          <span style={{
            fontSize: 20, fontWeight: 800, letterSpacing:-0.3, color:'#0F1115',
            fontVariantNumeric:'tabular-nums',
          }}>€{residuo.toFixed(2)}</span>
        </div>
      )}

      {/* Il numero che serve adesso, e che nessun altro schermo ha */}
      {resto > 0.004 && (
        <div style={{
          width:'100%', marginBottom: 14,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
          padding:'12px 16px', borderRadius: 12, background: PAY_BG,
        }}>
          <span style={{color: PAY_INK, display:'inline-flex'}}><IconCash/></span>
          <span style={{fontSize: 16.5, color: PAY_INK}}>Da restituire al cliente</span>
          <span style={{
            fontSize: 20, fontWeight: 800, letterSpacing:-0.3, color: PAY_INK,
            fontVariantNumeric:'tabular-nums',
          }}>€{resto.toFixed(2)}</span>
        </div>
      )}

      {/* La fattura è partita: si dice qui perché è l'ultimo momento in cui
          l'operatore ha ancora il cliente davanti per correggere i dati. */}
      {invoice && (
        <div style={{
          width:'100%', marginBottom: 14, padding:'11px 16px',
          borderRadius: 12, background:'#F5F6F8', border:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', gap: 12, textAlign:'left',
        }}>
          <div style={{flex:1, minWidth: 0}}>
            <div style={{fontSize: 16.5, fontWeight: 700, color:'#0F1115'}}>Fattura emessa</div>
            <div style={{
              fontSize: 15, color:'#9CA3AF', marginTop: 1,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{(invoiceData && invoiceData.ragione) || 'Dati inseriti al momento dell’incasso'}</div>
          </div>
        </div>
      )}

      <span style={{flex: 1, minHeight: 10}}/>

      {/* Lo scontrino è ciò che si fa subito dopo, non un'alternativa al
          chiudere: sta davanti, e quando è uscito lo dice. */}
      <div style={{display:'flex', gap: 8, width:'100%'}}>
        <button onClick={onClose} style={{...btnSecondaryV2, flex: 1}}>Chiudi</button>
        <button onClick={() => setStampato(true)} style={{...btnPrimaryV2, flex: 1.4, justifyContent:'center'}}>
          {stampato
            ? <>✓ Scontrino stampato</>
            : <><IconPrinter/> Stampa scontrino</>}
        </button>
      </div>
    </div>
  );
}

// ────────── ICONE ──────────
function IconPrinter() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9 V3 H18 V9"/><rect x="4" y="9" width="16" height="9" rx="1.5"/><path d="M6 14 H18 V21 H6 Z"/>
  </svg>
); }
function IconCash() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
  </svg>
); }
function IconCard() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
  </svg>
); }
// Le monete del resto: lo stesso mucchietto della finestra Incassa.
function IconMonete() { return (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="6" rx="7.5" ry="3"/>
    <path d="M4.5 6v4.5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6"/>
    <path d="M4.5 10.5V15c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-4.5"/>
  </svg>
); }

// Le due tessere del metodo, disegnate come in Vendita diretta: una banconota
// e un terminale, riconoscibili di sagoma prima che si legga il nome.
function IconBanconota() { return (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8.5" cy="12" r="2.6"/>
    <path d="M7.4 12h2.2M7.6 10.9h1.8"/><circle cx="17.5" cy="12" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
); }
function IconPos() { return (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2.5"/><rect x="7.5" y="4.5" width="9" height="4.5" rx="1"/>
    <circle cx="9" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="12.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="15.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="18.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="18.5" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
); }

// I tre canali, in tre oggetti: il telefono dell'ospite, lo schermo di chi ha
// inquadrato il QR, le persone al tavolo. Si riconoscono di sagoma, prima di
// leggere l'etichetta accanto — che è quello che serve quando si scorre un
// conto lungo cercando una sola sezione.
function IconTelefono() { return (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2.5" width="12" height="19" rx="2.6"/><path d="M10.5 18.5h3"/>
  </svg>
); }
// Qui c'era IconSchermo, lo schermo della webapp: se n'è andata con la sua
// sezione — la webapp confluisce in «Altro», senza icona e senza nome.
function IconPersone() { return (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2"/><path d="M2.5 19.5c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.2M18 14.4c2.1.6 3.5 2.3 3.5 5.1"/>
  </svg>
); }
// ────────── STILI ──────────
// Corallo del marchio: qui è il colore di ciò che è scelto e di ciò che
// incassa. Sta in una costante perché lo portano otto punti di questa
// finestra e devono essere lo stesso.
const SALDA_BRAND = '#FF3B41';
const SALDA_BRAND_SOFT = '#FFF1F1';

// La stessa scala della finestra Incassa di Vendita diretta: inchiostro,
// grigio di servizio, bordo, verde della conferma. Ricopiati e non importati
// perché questa finestra vive anche in Contabilità, che quel file non lo
// carica — leggerli da lì farebbe esplodere la pagina invece di colorare un
// pulsante.
const SALDA_INK   = '#0F1729';
const SALDA_MUTED = '#7A8394';
const SALDA_BORDO = '#E7EAEF';
const SALDA_VERDE = '#16A34A';
// L'etichetta di sezione: piccola, in maiuscoletto, sempre uguale. È quella
// che dice a ogni blocco come si chiama senza rubare spazio al suo contenuto.
const SALDA_LABEL = {
  fontSize: 13.5, fontWeight: 800, color: SALDA_MUTED,
  letterSpacing: 0.7, textTransform:'uppercase', marginBottom: 8,
};

// Qui viveva SALDA_PAGA_COL, la colonna da 620 in cui stava stretto il passo
// del pagamento: teneva vicini i suoi pezzi ma lasciava due fasce di bianco ai
// lati di una finestra da 1080, e una finestra grande con dentro una colonna
// stretta non sembra ordinata — sembra rotta. Adesso il pagamento prende la
// larghezza che ha, con lo stesso margine di tutto il resto.

// La CTA scura di Vendita diretta, quella sulle card «Da saldare»: stesso
// gesto, stesso pulsante. I valori sono ricopiati da sala-vendita-diretta.jsx
// e non importati perché questa finestra vive anche in Contabilità, che quel
// file non lo carica: leggerlo da lì farebbe esplodere la pagina invece di
// disegnare un pulsante.
const SALDA_SUNSET_BG = `
  radial-gradient(circle at 82% 18%, rgba(255, 96, 102, 0.32), transparent 62%),
  linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
`;
const SALDA_SUNSET_SHADOW = 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55), 0 3px 8px -4px rgba(80,10,30,0.30)';
const SALDA_SUNSET_TEXT = '#FFE9E6';
const btnGhost = {
  display:'inline-flex', alignItems:'center', gap: 8,
  padding:'11px 16px', background:'#fff', color:'#0F1115',
  border:'1px solid #E5E7EB', borderRadius: 11, fontSize: 16, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit', flexShrink: 0,
};
const saldaIconBtn = {
  width: 42, height: 42, borderRadius: 11, flexShrink: 0,
  background:'#fff', border:'1px solid #E5E7EB', cursor:'pointer',
  fontFamily:'inherit', color:'#6B7280',
  display:'grid', placeItems:'center',
};
const sectionLabel = {
  fontSize: 14.5, fontWeight: 800, color:'#6B7280',
  letterSpacing: 0.6, textTransform:'uppercase',
  marginBottom: 8,
};
const btnPrimaryV2 = {
  display:'inline-flex', alignItems:'center', gap: 6,
  padding:'10px 16px', background:'#0F1115', color:'#fff',
  border:'none', borderRadius: 8, fontSize: 17, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
const btnSecondaryV2 = {
  padding:'10px 16px', background:'#fff', color:'#0F1115',
  border:'1px solid #E5E7EB', borderRadius: 8, fontSize: 17, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
const miniLink = {
  background:'none', border:'none',
  padding:'2px 4px', color:'#6B7280',
  fontSize: 15.5, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
  display:'inline-flex', alignItems:'center', gap: 4,
};
// `chipQuick` e `inputV2` vivevano qui per il vecchio pannello degli
// aggiustamenti: pastiglie grigie da 6 px di raggio e un campo da 17, misure
// che non erano di nessun altro pezzo di questa finestra. Il pannello ora usa
// la fila del contante, e con lui se ne vanno anche le sue due eccezioni.

// ────────── ADD ARTICLE BAR ──────────
function AddArticleBar({ query, setQuery, open, setOpen, onPick }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, setOpen]);

  // Flatten SALA_MENU in lista piatto per ricerca
  const allMenu = React.useMemo(() => {
    const m = window.SALA_MENU || {};
    const out = [];
    Object.keys(m).forEach(cat => {
      (m[cat] || []).forEach(item => out.push({...item, categoria: cat}));
    });
    return out;
  }, []);

  const q = (query || '').trim().toLowerCase();
  const matches = q ? allMenu.filter(m => m.nome.toLowerCase().includes(q)).slice(0, 8) : [];

  return (
    <div ref={ref} style={{
      padding:'10px 18px 8px', borderBottom:'1px solid #F0F2F5',
      background:'#fff', position:'relative',
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap: 8,
        padding:'8px 10px', borderRadius: 8,
        background:'#FAFBFC', border:'1px solid #E5E7EB',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}>
          <path d="M12 5v14 M5 12h14"/>
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="Aggiungi articolo dal menù…"
          style={{
            flex:1, border:'none', outline:'none',
            background:'transparent', fontSize: 17,
            color:'#0F1115', fontFamily:'inherit',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            style={{
              width: 18, height: 18, padding: 0, borderRadius: 4,
              background:'transparent', border:'none', cursor:'pointer',
              color:'#9CA3AF', fontSize: 18, fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>×</button>
        )}
      </div>

      {open && q && (
        <div style={{
          position:'absolute', top:'calc(100% - 4px)', left: 18, right: 18,
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 8,
          boxShadow:'0 12px 28px rgba(15,17,21,0.12), 0 2px 6px rgba(15,17,21,0.06)',
          zIndex: 70, maxHeight: 280, overflow:'auto', padding: 4,
        }}>
          {matches.length === 0 ? (
            <div style={{padding:'14px 12px', fontSize: 16.5, color:'#9CA3AF', textAlign:'center'}}>
              Nessun articolo trovato. <button
                onClick={() => onPick({ nome: query.trim(), prezzo: 0 })}
                style={{
                  marginLeft: 4, padding:'2px 6px',
                  background:'#0F1115', color:'#fff', border:'none',
                  borderRadius: 4, fontSize: 15, fontWeight: 700,
                  cursor:'pointer', fontFamily:'inherit',
                }}>Crea "{query.trim()}"</button>
            </div>
          ) : (
            matches.map(m => (
              <button
                key={m.id}
                onClick={() => onPick(m)}
                style={{
                  display:'flex', alignItems:'center', gap: 10,
                  width:'100%', padding:'8px 10px', borderRadius: 6,
                  background:'transparent', border:'none', cursor:'pointer',
                  fontFamily:'inherit', textAlign:'left',
                  transition:'background 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8F9FB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{flex:1, fontSize: 17, color:'#0F1115'}}>{m.nome}</span>
                <span style={{fontSize: 15, color:'#9CA3AF'}}>{m.categoria}</span>
                <span style={{fontSize: 17, fontWeight: 700, color:'#0F1115', fontVariantNumeric:'tabular-nums', minWidth: 50, textAlign:'right'}}>
                  €{m.prezzo.toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

window.SalaSaldaModal = SalaSaldaModal;

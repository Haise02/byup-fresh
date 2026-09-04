// Sala — Tab Vendita diretta (POS) — liquid glass
// Pattern: search/filter sticky, food cards con immagine, click → personalizza,
// carrello con coperti stepper, mods inline, sconto, salva conto.

// Dark sunset glass (D3) — stessa ricetta del bottone "Unisci tavoli":
// base wine-burnt + highlight coral + inset ring caldo, mai nero piatto.
const SV_SUNSET_BG = `
  radial-gradient(circle at 82% 18%, rgba(255, 96, 102, 0.32), transparent 62%),
  linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
`;
const SV_SUNSET_SHADOW = 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55), 0 3px 8px -4px rgba(80,10,30,0.30)';
const SV_SUNSET_TEXT = '#FFE9E6';

// Memoria di sessione del prototipo. In produzione questa roba sta sul server
// e la domanda non si pone; qui serve perché passare da una sezione all'altra
// ricarica la pagina, e la coda "Da saldare" non può ripartire da capo
// ogni volta: ci vivono i conti sospesi, cioè soldi già presi.
// Se lo storage è negato (sessione privata, permessi) si degrada al seed senza
// rompere niente — si perde la persistenza, non la schermata.
function svLeggiSessione(chiave, fallback) {
  try {
    const grezzo = sessionStorage.getItem(chiave);
    if (grezzo != null) return JSON.parse(grezzo);
  } catch (e) { /* storage negato o JSON illeggibile: vale il seed */ }
  return fallback === undefined ? null : fallback;
}
function svScriviSessione(chiave, valore) {
  try { sessionStorage.setItem(chiave, JSON.stringify(valore)); } catch (e) { /* niente persistenza, pazienza */ }
}

// Come si chiama un conto quando lo cerchi a voce, che è l'unico modo in cui
// lo si cerca davvero: arriva qualcuno al banco e dice una parola.
//
// Il nome del cliente vince sempre, ovunque — al banco esattamente come in
// asporto. Se qualcuno si è presentato, quello è il suo conto e chiamarlo
// "B-3" sarebbe dargli un numero avendo già il nome. Tutto il resto viene
// dopo, in ordine di quanto è utile a chi sta dall'altra parte del bancone:
//   B-3           quello che gli diamo noi quando un nome non c'è
//   codice ritiro quello che ha in mano lui, non il nostro
//   #1247         un numero da registro, che non pronuncia nessuno
// ─── Ordini da piattaforma (P-04 · D-15) ───────────────────────────────────
// Le piattaforme sono le fonti che stanno in PN_PARTNER: sono già pagate LÀ
// e il denaro non passa da Byup. La regola è strutturale, non un dato: mai
// in «Da saldare», nemmeno se un record arrivasse con pagato:false —
// mostrarle da incassare produrrebbe doppi incassi o rifiuti al rider.
// Vincolo di prodotto: al lancio le integrazioni non esistono (servono gli
// accordi con le piattaforme); la logica nasce pronta.
const svPiattaforma = (fonte) => !!(window.PN_PARTNER || {})[fonte];
// Il nome di un ordine piattaforma È il suo codice: è quello che il rider ha
// sul telefono quando arriva al banco, ed è quello che si cerca e si grida.
const svNomeConto = (r) => svPiattaforma(r.fonte)
  ? `${window.PN_PARTNER[r.fonte].nome} ${r.codice}`
  : (r.cliente || r.banco || r.codiceRitiro || r.codice);

// Cosa resta di un ordine dopo i rimborsi: le righe tolte scompaiono dalla
// lista e il totale scende di conseguenza.
// Serve perché chi consegna deve vedere il contenuto di ADESSO, non quello
// ordinato mezz'ora fa: se il branzino è stato tolto e rimborsato, lasciarlo
// scritto nella card significa farlo cercare a chi prepara il sacchetto.
const svResiduoOrdine = (r) => {
  const rimborsato = (r.rimborsi || []).reduce((s, x) => s + x.amount, 0);
  const tolte = (r.rimborsi || []).flatMap(x => x.righe || []);
  const items = (r.items || [])
    .map((it, i) => ({
      ...it,
      qty: it.qty - tolte.filter(t => t.i === i).reduce((s, t) => s + t.qty, 0),
    }))
    .filter(it => it.qty > 0);
  return { items, rimborsato, totale: Math.max(0, r.totale - rimborsato) };
};
const svSunsetHoverIn  = e => { e.currentTarget.style.filter = 'brightness(1.15)'; };
const svSunsetHoverOut = e => { e.currentTarget.style.filter = 'none'; };

function SalaVenditaDiretta() {
  // Modulo asporto (Impostazioni → Operazioni, scelto in onboarding). Spento,
  // spariscono le code del banco e il toggle "Vai ad asporto": senza asporto
  // non esistono ordini che aspettano di essere ritirati.
  const [asportoOn, setAsportoOn] = React.useState(
    () => (window.byupReadModules ? window.byupReadModules().asporto !== false : true));
  React.useEffect(() => {
    const update = () => setAsportoOn(window.byupReadModules ? window.byupReadModules().asporto !== false : true);
    window.addEventListener('byup-modules-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-modules-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('Tutto');
  const [lines, setLines] = React.useState([]); // [{id, piatto, qty, mods, lineTotal}]
  // Acconti già incassati sul conto in corso. Vivono qui, accanto al carrello,
  // e non dentro la finestra di incasso: chiudere la finestra è un gesto che
  // si fa cento volte per servizio (arriva un ritiro, si sbaglia piatto, il
  // cliente torna alla macchina) e non può cancellare contante che è già
  // entrato in cassa. Stessa scelta di `tavolo.incasso` in Sala: lo stato del
  // denaro sta sulla cosa pagata, non sulla finestra che l'ha incassato.
  // Nessun acconto vive sul carrello. Il primo acconto trasforma il conto in
  // una voce di coda — vedi `parcheggiaConAcconto` — perché del carrello non
  // resta traccia: cambiare sezione ricarica la pagina e lo azzera. Un conto
  // con dei soldi sopra deve stare su qualcosa che sopravvive, e in Vendita
  // diretta quel qualcosa esiste già ed è la coda "Da saldare".
  const [takeaway, setTakeaway] = React.useState(false);
  // Il cliente del conto: chi ritira, o chi sta aspettando al bancone.
  // Non è più legato all'asporto. Prima si azzerava spegnendo quel flag,
  // perché "al banco un ordine è anonimo come uno scontrino" — ma non è vero
  // che al banco i nomi non servono: servono ogni volta che qualcuno aspetta
  // e va richiamato, ed è la ragione per cui esiste B-3. Se un nome c'è, quel
  // nome è meglio di qualunque numero, e vince (vedi `svNomeConto`).
  // Si azzera quando si azzera il conto, non quando si cambia modalità.
  const [taCliente, setTaCliente] = React.useState(null);
  React.useEffect(() => { if (!asportoOn) setTakeaway(false); }, [asportoOn]);
  const [incassaOpen, setIncassaOpen] = React.useState(false);
  const [personalize, setPersonalize] = React.useState(null); // {piatto}
  const [editLine, setEditLine] = React.useState(null); // line index for editing existing
  const [customOpen, setCustomOpen] = React.useState(false);
  // P-108: la riga fuori menù si riapre nella stessa finestra (indice della
  // riga in modifica), e al cambio di modo un avviso di una riga dice che le
  // aliquote sono state aggiornate. Il foglio di riproposta di P-11 è morto:
  // l'aliquota si ricava, non si sceglie.
  const [customEdit, setCustomEdit] = React.useState(null);
  const [avvisoIva, setAvvisoIva] = React.useState(null);
  // Ritiri: coda di chi aspetta al banco — asporto dai canali digitali e ordini
  // di cassa con preparazione, che abbiano o no il sacchetto. Drawer laterale +
  // conferma con codice ritiro; "Salda ora" apre l'incasso al banco.
  // Il prototipo non ha un server, e cambiare sezione È un ricaricamento di
  // pagina: senza questo, ogni stato riparte dal seed. Per la coda non va più
  // bene — da quando ci vivono anche i conti sospesi, azzerarla vuol dire
  // perdere dei soldi a ogni giro di sezione, cioè esattamente il problema che
  // spostarli qui doveva risolvere.
  // sessionStorage e non localStorage: dura quanto la scheda, così riaprendo
  // il prototipo si riparte dai dati di esempio puliti.
  const [ritiri, setRitiri] = React.useState(() => svLeggiSessione('byup.sala.ritiri', window.SALA_ASPORTO_CONTI || []));
  React.useEffect(() => { svScriviSessione('byup.sala.ritiri', ritiri); }, [ritiri]);
  // Coda aperta nel pannello: 'salda' (ancora da incassare) o 'consegna'
  // (pagati, pronti da dare via). Sono i due gesti diversi del banco, quindi
  // due liste diverse — non una sola con dentro due tipi di card.
  const [coda, setCoda] = React.useState(null);
  const [consegnatiOpen, setConsegnatiOpen] = React.useState(false);
  React.useEffect(() => {
    // Spegnere l'asporto chiude consegne e archivio, ma non "Pronti da
    // saldare": lì possono esserci conti di cassa sospesi, che con l'asporto
    // non c'entrano niente e non vanno chiusi fuori dalla vista.
    if (!asportoOn) { setCoda(c => c === 'consegna' ? null : c); setConsegnatiOpen(false); }
  }, [asportoOn]);
  // Dettaglio di un ordine già consegnato, aperto dall'archivio.
  const [dettaglio, setDettaglio] = React.useState(null);
  // Storico del servizio: ordini già chiusi. Cresce man mano che si consegna.
  const [storico, setStorico] = React.useState(() => svLeggiSessione('byup.sala.storico', window.SALA_ORDINI_STORICO || []));
  React.useEffect(() => { svScriviSessione('byup.sala.storico', storico); }, [storico]);
  const [saldaOrdine, setSaldaOrdine] = React.useState(null); // ordine da saldare al banco (modale incasso)
  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };
  // Consegnato: esce dalla coda ed entra nello storico, in cima (il più
  // recente sta sopra: le domande arrivano quasi sempre sull'ultimo ordine).
  const confermaConsegna = (ordine) => {
    setRitiri(prev => {
      const next = prev.filter(r => r.id !== ordine.id);
      if (!next.filter(r => r.pagato).length && coda === 'consegna') setCoda(null);
      return next;
    });
    setStorico(prev => [{...ordine, stato: 'consegnato'}, ...prev]);
    showToast(`✓ ${svNomeConto(ordine)} consegnato`);
  };
  // Incasso confermato: l'ordine diventa pagato e passa nella coda di chi va
  // solo consegnato — lo stesso ordine, l'altro gesto.
  const confermaSaldo = (ordine) => {
    // Un conto sospeso senza preparazione non ha niente da consegnare: il
    // caffè è già stato bevuto, mancavano solo i soldi. Saldarlo lo chiude e
    // basta — farlo passare da "Da consegnare" chiederebbe un secondo tocco
    // per un gesto che non esiste.
    if (ordine.fonte === 'banco' && !ordine.codiceRitiro) {
      setRitiri(prev => prev.filter(r => r.id !== ordine.id));
      setStorico(prev => [{...ordine, pagato: true, stato: 'consegnato'}, ...prev]);
      showToast(`✓ ${svNomeConto(ordine)} saldato`);
      return;
    }
    setRitiri(prev => prev.map(r => r.id === ordine.id ? {...r, pagato: true} : r));
    showToast(`✓ ${svNomeConto(ordine)} saldato · ora è da consegnare`);
  };

  // Un acconto preso su un ordine già in coda resta su quell'ordine. Scrive in
  // due posti perché sono due cose diverse: la lista è la verità, `saldaOrdine`
  // è la copia che la finestra aperta sta guardando.
  const aggiornaAccontiOrdine = (aggiorna) => {
    if (!saldaOrdine) return;
    const prossimi = typeof aggiorna === 'function'
      ? aggiorna(saldaOrdine.acconti || [])
      : aggiorna;
    setSaldaOrdine(o => o && ({...o, acconti: prossimi}));
    setRitiri(prev => prev.map(r => r.id === saldaOrdine.id ? {...r, acconti: prossimi} : r));
  };

  // Le due code, dalla stessa lista: il pagamento è ciò che le separa.
  // P-04: le piattaforme non passano MAI da «Da saldare» — hanno già
  // incassato loro — quindi la regola vince anche su un pagato:false.
  const daSaldare = ritiri.filter(r => !r.pagato && !svPiattaforma(r.fonte));
  const daConsegnare = ritiri.filter(r => r.pagato || svPiattaforma(r.fonte));

  // Creazione ordine al banco. Alla conferma dell'incasso l'ordine viene creato
  // e inviato ai monitor: qui NON si decide cosa passa dalla cucina: si manda
  // tutto ed è il KDS a filtrare per stazione (un caffè semplicemente non
  // comparirà su nessuna postazione). Il numero è la ricevuta dell'invio per
  // l'operatore, l'unico punto del flusso in cui l'ordine diventa una cosa.
  // Anche il contatore sopravvive al ricaricamento: se ripartisse da 1246, il
  // conto sospeso #1247 lasciato in coda e il primo ordine battuto dopo un
  // cambio di sezione porterebbero lo stesso numero — due cose diverse con lo
  // stesso nome, in una coda dove il numero è l'unica identità.
  const ordineSeq = React.useRef(svLeggiSessione('byup.sala.ordineSeq', 1246));
  const numeraOrdine = () => {
    const n = ++ordineSeq.current;
    svScriviSessione('byup.sala.ordineSeq', n);
    return n;
  };
  // Codice ritiro: alfabeto senza I/O/0/1 — va dettato a voce al cliente.
  const nuovoCodiceRitiro = () => Array.from({length: 4}, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

  // Nome del conto al banco. Chi ordina al bancone non lascia un nome — non
  // c'è un'app di mezzo e chiederlo per un caffè è assurdo — quindi glielo
  // diamo noi: B-1, B-2, corto abbastanza da dirlo a voce e da scriverlo su
  // un bicchiere. Il progressivo dell'ordine (#1247) non serve a questo: è un
  // numero da registro, cresce tutto il giorno e non lo pronuncia nessuno.
  // Riparte da 1 ogni giorno: al banco un numero vive quanto il servizio, e
  // "B-3" alle nove di sera non deve competere con il "B-3" di stamattina.
  const nuovoNumeroBanco = () => {
    const oggi = new Date().toISOString().slice(0, 10);
    const cur = svLeggiSessione('byup.sala.banco', null);
    const n = (cur && cur.giorno === oggi) ? cur.n + 1 : 1;
    svScriviSessione('byup.sala.banco', { giorno: oggi, n });
    return `B-${n}`;
  };

  // Un ordine entra nella coda al banco se c'è qualcosa da aspettare, non se è
  // da asporto: chi ordina una lasagna e si siede va richiamato al banco
  // esattamente come chi la porta via. In produzione la risposta arriva a
  // valle dal KDS (una stazione ha preso in carico l'ordine?); qui la
  // approssimiamo con la categoria, che è l'unico segnale disponibile.
  const haPreparazione = (righe) => righe.some(l =>
    l.piatto.cat !== 'Bar' && l.piatto.cat !== 'Personalizzato');

  const creaOrdine = (totale) => {
    const numero = numeraOrdine();
    const ordine = { numero, codice: `#${numero}`, totale, takeaway };
    // In coda: l'ordine non finisce col pagamento, resta in attesa di ritiro.
    // Il flag asporto qui non decide nulla — dice solo se va incartato.
    if (haPreparazione(lines)) {
      ordine.codiceRitiro = nuovoCodiceRitiro();
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setRitiri(prev => [...prev, {
        id: `banco-${numero}`, codice: ordine.codice,
        cliente: taCliente, ritiro: hhmm,
        fonte: 'banco', pagato: true, asporto: takeaway, totale,
        banco: takeaway ? null : nuovoNumeroBanco(),
        codiceRitiro: ordine.codiceRitiro,
        items: lines.map(l => ({
          nome: l.displayName || l.piatto.name, qty: l.qty, prezzo: l.lineTotal,
          aliquota: l.aliquota, ivaProfilo: l.ivaProfilo,
        })),
      }]);
    }
    setTakeaway(false);
    setTaCliente(null);
    return ordine;
  };

  // Primo acconto su un conto di cassa: il carrello smette di essere un
  // carrello e diventa una voce di coda, con dentro i soldi già presi. È il
  // "conto sospeso" di qualunque cassa, e qui la coda esiste già — quella di
  // "Da saldare", dove stanno gli ordini ancora da incassare.
  //
  // Succede subito, al primo acconto, non alla chiusura della finestra: fra i
  // due momenti ci sta un cambio di sezione, che ricarica la pagina e si
  // porterebbe via tutto. I soldi non devono mai esistere sul carrello.
  //
  // La cassa resta libera: chi ha pagato metà si sposta, il prossimo cliente
  // viene servito, e il conto si riprende da "Salda ora" quando torna.
  const parcheggiaConAcconto = (pagamento, totaleConto) => {
    const numero = numeraOrdine();
    const now = new Date();
    const voce = {
      id: `banco-${numero}`, codice: `#${numero}`,
      cliente: taCliente,
      ritiro: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      fonte: 'banco', pagato: false, asporto: takeaway, totale: totaleConto,
      // Al banco il conto prende un nome corto e detto a voce; in asporto no,
      // perché lì il nome è quello del cliente.
      banco: takeaway ? null : nuovoNumeroBanco(),
      // Il codice ritiro serve a richiamare chi aspetta un piatto. Un conto
      // sospeso di soli caffè non richiama nessuno: resta senza, ed è quello
      // che poi gli fa saltare la coda "Da consegnare" una volta saldato.
      codiceRitiro: haPreparazione(lines) ? nuovoCodiceRitiro() : null,
      acconti: [pagamento],
      items: lines.map(l => ({
        nome: l.displayName || l.piatto.name, qty: l.qty, prezzo: l.lineTotal,
          aliquota: l.aliquota, ivaProfilo: l.ivaProfilo,
      })),
    };
    setRitiri(prev => [...prev, voce]);
    setLines([]);
    setTakeaway(false);
    setTaCliente(null);
    // La finestra non si chiude: riparte sullo stesso conto, che adesso però
    // è in coda. Chi voleva pagare il resto subito non deve andarselo a
    // cercare, e chi voleva andarsene chiude e lo trova lì.
    setIncassaOpen(false);
    setSaldaOrdine(voce);
    showToast(`${svNomeConto(voce)} in attesa · restano ${svEur(totaleConto - pagamento.importo)}`);
  };

  const cats = ['Tutto', ...Array.from(new Set(SALA_VENDITA_PIATTI.map(p => p.cat)))];
  const piatti = SALA_VENDITA_PIATTI.filter(p => {
    if (cat !== 'Tutto' && p.cat !== cat) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const isCustomizable = (p) => (p.variants?.length || p.ingredients?.length || p.extras?.length);
  // Opzione obbligatoria (variant required): niente aggiunta diretta, serve
  // sempre il popup di personalizzazione — anche dal pulsante + Aggiungi.
  const hasRequiredOptions = (p) => (p.variants || []).some(g => g.required);

  // Quick add: piatti senza personalizzazione, o aggiunge un'altra riga base
  const quickAdd = (p) => {
    if (hasRequiredOptions(p)) { openPersonalizza(p); return; }
    setLines(prev => {
      // se esiste già una riga base senza mods, incrementa
      const idx = prev.findIndex(l => l.piatto.id === p.id && !l.mods);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {...next[idx], qty: next[idx].qty + 1};
        return next;
      }
      return [...prev, { piatto: p, qty: 1, mods: null, lineTotal: p.price, ...svRigaIva(p.tipologia) }];
    });
  };

  const openPersonalizza = (p) => setPersonalize({ piatto: p });

  const addPersonalized = (piatto, qty, mods, lineTotal) => {
    if (editLine !== null) {
      setLines(prev => prev.map((l, i) => i === editLine ? { piatto, qty, mods, lineTotal, ...svRigaIva(piatto.tipologia) } : l));
      setEditLine(null);
    } else {
      setLines(prev => [...prev, { piatto, qty, mods, lineTotal, ...svRigaIva(piatto.tipologia) }]);
    }
    setPersonalize(null);
  };

  const incLine = (i) => setLines(prev => prev.map((l, idx) => idx === i ? {...l, qty: l.qty + 1} : l));
  const decLine = (i) => setLines(prev => {
    const l = prev[i];
    if (l.qty <= 1) return prev.filter((_, idx) => idx !== i);
    return prev.map((x, idx) => idx === i ? {...x, qty: x.qty - 1} : x);
  });
  const removeLine = (i) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const editLineName = (i, name) => setLines(prev => prev.map((l, idx) => idx === i ? {...l, displayName: name} : l));
  const editLinePrice = (i, price) => setLines(prev => prev.map((l, idx) => idx === i ? {...l, lineTotal: price} : l));
  // P-108 (D-105, che rivede D-16): nessuna riga dichiara l'aliquota. Ogni
  // articolo — del menù o fuori menù — porta la sua TIPOLOGIA, e il profilo
  // IVA discende da tipologia × modo dell'ordine (PN_TIPOLOGIE_ARTICOLO):
  // entra CONGELATO sulla riga (svfRighe/svRiepilogoIva onorano l.aliquota,
  // quindi la fattura la raccoglie senza derivare niente) e ricorda il modo
  // in cui è nata. Le due strade — piatto del menù e fuori menù — producono
  // la stessa riga.
  const svRigaIva = (tipologia) => {
    const t = window.pnTipologia(tipologia);
    const p = window.pnTipologiaProfilo(t.id, takeaway);
    return { tipologia: t.id, aliquota: p.aliquota, ivaProfilo: p.profilo, ivaModo: takeaway };
  };
  const addCustomLine = (name, price, tipologia) => {
    setLines(prev => [...prev, {
      piatto: { id: `custom_${Date.now()}`, name, price, cat: 'Personalizzato', emoji: '✏️', custom: true, tipologia: window.pnTipologia(tipologia).id },
      qty: 1, mods: null, lineTotal: price,
      ...svRigaIva(tipologia),
    }]);
  };
  // La riga fuori menù si riapre nella stessa finestra: nome, prezzo e
  // tipologia si cambiano insieme e l'aliquota si ricalcola.
  const editCustomLine = (i, name, price, tipologia) => setLines(prev => prev.map((l, idx) => idx === i
    ? { ...l, piatto: { ...l.piatto, name, price, tipologia: window.pnTipologia(tipologia).id }, displayName: undefined, lineTotal: price, ...svRigaIva(tipologia) }
    : l));
  // Al cambio di modo (banco ↔ asporto) le righe ricalcolano il profilo dalla
  // stessa tabella e il contrassegno cambia da solo; se almeno una riga ha
  // cambiato aliquota, un avviso di una riga in cima all'ordine lo dice.
  // Niente foglio da confermare: la tabella è della legge, non dell'operatore.
  const linesRef = React.useRef(lines); linesRef.current = lines;
  const primoModo = React.useRef(true);
  React.useEffect(() => {
    if (primoModo.current) { primoModo.current = false; return; }
    let cambiate = 0;
    const next = linesRef.current.map(l => {
      const p = window.pnTipologiaProfilo(l.tipologia, takeaway);
      if (l.aliquota != null && p.aliquota !== l.aliquota) cambiate++;
      if (l.ivaModo === takeaway && l.ivaProfilo === p.profilo) return l;
      return { ...l, tipologia: window.pnTipologia(l.tipologia).id, aliquota: p.aliquota, ivaProfilo: p.profilo, ivaModo: takeaway };
    });
    if (next.some((l, i) => l !== linesRef.current[i])) setLines(next);
    setAvvisoIva(cambiate ? { asporto: takeaway } : null);
  }, [takeaway]);
  React.useEffect(() => { if (!lines.length) setAvvisoIva(null); }, [lines.length]);
  const apriIncasso = () => setIncassaOpen(true);

  // Si apre sempre, anche su un piatto senza opzioni: da quando la riga ha un
  // solo pulsante e si chiama "Personalizza", uscire in silenzio sarebbe un
  // tocco che non fa niente — il modo più veloce per far credere che sia rotto.
  // Dentro ci si trova almeno la quantità e il nome; se non c'è altro da
  // scegliere, lo dice quella schermata invece di non aprirsi.
  const editExistingLine = (i) => {
    const line = lines[i];
    if (svRigaCustom(line)) { setCustomEdit(i); return; }
    setEditLine(i);
    setPersonalize({ piatto: line.piatto, mods: line.mods, qty: line.qty });
  };

  const total = lines.reduce((s, l) => s + l.lineTotal * l.qty, 0);
  const totQty = lines.reduce((s, l) => s + l.qty, 0);

  // pinned: piatti più venduti (mock — primi 4)

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14, height:'100%', minHeight: 0}}>
      {/* Il pannello ordine sta a 440px sul desktop e scende fino a 320 dove
          la colonna si stringe (tablet in portrait): senza il clamp il menù
          restava con 220px e una card per riga. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr clamp(320px, 42%, 440px)', gap: 18, flex: 1, minHeight: 0}}>
      {/* === GRID PIATTI === */}
      <section style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
        display:'flex', flexDirection:'column', minHeight: 0, overflow:'hidden',
      }}>
        {/* Sticky header */}
        <div style={{
          padding: '14px 18px 0',
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE,
        }}>
          <div style={{display:'flex', gap: 8, marginBottom: 12, alignItems:'stretch', flexWrap:'wrap'}}>
            {/* La ricerca non si prende più tutta la riga: accanto ci stanno le
                due code del banco, che durante il servizio si guardano molto
                più spesso di quanto si cerchi un piatto per nome. Dove la
                colonna si stringe (tablet) le code scendono a capo, come i
                filtri della Sala. */}
            <div style={{position:'relative', flex: '0 1 260px', minWidth: 150}}>
              <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display:'inline-flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </span>
              <input
                id="sa-vd-search"
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cerca nel menù…"
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 10, border: `1px solid ${PN.BORDER_LIGHT}`,
                  fontSize: 16, fontFamily:'inherit', outline:'none',
                  background: '#FAFBFC',
                  boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
                }}/>
            </div>

            {/* Le due code del banco e l'archivio: esistono solo se il locale
                fa asporto. Sono stati, non modalità: aprono il pannello degli
                ordini già filtrato su quello che devi fare — incassare, o
                consegnare e basta. */}
            {/* "Da saldare" non è una cosa da asporto: ci finiscono anche i
                conti di cassa sospesi con un acconto sopra. Se ce n'è anche
                uno solo deve esserci il modo di tornarci, pure in un locale
                che l'asporto non lo fa — altrimenti quei soldi non hanno più
                una porta. */}
            {(asportoOn || daSaldare.length > 0) && <SaCodaBtn
              label="Da saldare"
              count={daSaldare.length}
              tone="amber"
              title="Ordini ancora da incassare: arrivati da app o webapp, e conti di cassa lasciati in sospeso con un acconto"
              onClick={() => setCoda('salda')}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M2 10.5h20"/><path d="M6 15h4"/></svg>}
            />}
            {asportoOn && <>
            <SaCodaBtn
              label="Da consegnare"
              count={daConsegnare.length}
              tone="green"
              title="Ordini pronti e già pagati: vanno solo consegnati"
              onClick={() => setCoda('consegna')}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
            />

            {/* Terza voce: non è una coda ma l'archivio del servizio, quindi
                niente contatore che chiama — è dove si va a cercare, non dove
                si lavora. Stessa riga perché la domanda ("l'ordine di prima?")
                nasce proprio mentre si guardano le code. */}
            <button
              onClick={() => setConsegnatiOpen(true)}
              title="Gli ordini già consegnati del servizio"
              style={{
                display:'inline-flex', alignItems:'center', gap: 8, flexShrink: 0,
                padding: '0 13px', borderRadius: 10,
                background: PN.WHITE, color: PN.TEXT,
                border: `1px solid ${PN.BORDER_LIGHT}`,
                fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                whiteSpace:'nowrap',
                boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#FAFBFC'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_LIGHT; e.currentTarget.style.background = PN.WHITE; }}>
              <span style={{color: PN.MUTED, display:'inline-flex'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              Consegnati
            </button>
            </>}
          </div>
          <div style={{display:'flex', gap: 6, paddingBottom: 12, overflowX:'auto'}}>
            {cats.map(c => {
              const on = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: '7px 14px', borderRadius: 999,
                  border: `1px solid ${on ? 'transparent' : PN.BORDER_LIGHT}`,
                  background: on ? SV_SUNSET_BG : PN.BTN_NEUTRAL,
                  color: on ? SV_SUNSET_TEXT : PN.TEXT,
                  fontSize: 16.5, fontWeight: 600, cursor:'pointer',
                  fontFamily:'inherit', whiteSpace:'nowrap',
                  boxShadow: on
                    ? SV_SUNSET_SHADOW
                    : `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
                  transition: 'background 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out',
                }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="pn-scroll" style={{
          flex: 1, overflow:'auto', padding: 18,
          display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))',
          gridAutoRows: 'min-content',
          alignItems: 'start',
          gap: 14, alignContent:'start',
        }}>
          {piatti.length === 0 && (
            <div style={{gridColumn:'1/-1', padding: 60, textAlign:'center', color: PN.MUTED, fontSize: 17.5}}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 10px',
                background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
                display:'grid', placeItems:'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </div>
              Nessun piatto trovato
            </div>
          )}
          {piatti.map(p => {
            const linesQty = lines.filter(l => l.piatto.id === p.id).reduce((s, l) => s + l.qty, 0);
            return (
              <SaPiattoCard
                key={p.id}
                p={p}
                qtyInCart={linesQty}
                customizable={isCustomizable(p)}
                requiresOptions={hasRequiredOptions(p)}
                onQuickAdd={() => quickAdd(p)}
                onPersonalizza={() => openPersonalizza(p)}
              />
            );
          })}

          {/* Articolo custom — tessera in coda alla griglia, apre la modale nome+prezzo */}
          <button
            onClick={() => setCustomOpen(true)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:8, padding:'18px 12px', minHeight:100,
              borderRadius:12, cursor:'pointer', fontFamily:'inherit',
              border:`2px dashed ${PN.BORDER}`,
              background:'transparent', color:PN.MUTED,
              transition:'border-color 150ms ease-out, color 150ms ease-out, background 150ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=PN.TEXT; e.currentTarget.style.color=PN.TEXT; e.currentTarget.style.background=PN.WHITE_FROST; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=PN.BORDER; e.currentTarget.style.color=PN.MUTED; e.currentTarget.style.background='transparent'; }}
          >
            <span style={{
              width:36, height:36, borderRadius:'50%',
              border:'2px dashed currentColor',
              display:'grid', placeItems:'center',
              fontSize:24, lineHeight:1,
            }}>+</span>
            <span style={{fontSize:15, fontWeight:600, textAlign:'center', lineHeight:1.3}}>Articolo custom</span>
          </button>
        </div>
      </section>

      {/* === CARRELLO === */}
      <SaCartPanel
        lines={lines}
        takeaway={takeaway}
        asportoOn={asportoOn}
        onToggleTakeaway={() => setTakeaway(v => !v)}
        cliente={taCliente}
        onCliente={setTaCliente}
        total={total}
        totQty={totQty}
        onInc={incLine}
        onDec={decLine}
        onRemove={removeLine}
        onEdit={editExistingLine}
        onChangeName={editLineName}
        onChangePrice={editLinePrice}
        onClear={() => { setLines([]); setTaCliente(null); }}
        onIncassa={apriIncasso}
        avvisoIva={avvisoIva}
        onChiudiAvvisoIva={() => setAvvisoIva(null)}
      />
      </div>

      <SaIncassaModal
        open={incassaOpen}
        total={total}
        lines={lines}
        takeaway={takeaway}
        onAcconto={parcheggiaConAcconto}
        onClose={() => setIncassaOpen(false)}
        onConfirm={(totale) => {
          const ordine = creaOrdine(totale);
          setLines([]);
          return ordine;
        }}
      />

      {/* Popup coda: saldare o consegnare */}
      <SaCodaModal
        open={!!coda}
        modo={coda || 'consegna'}
        ritiri={coda === 'salda' ? daSaldare : daConsegnare}
        onClose={() => setCoda(null)}
        onConsegna={confermaConsegna}
        onSalda={setSaldaOrdine}
      />

      {/* Consegnati — l'archivio del servizio */}
      {consegnatiOpen && (
        <SaConsegnatiModal
          consegnati={storico}
          onClose={() => setConsegnatiOpen(false)}
          onVai={setDettaglio}
        />
      )}

      {/* Ordine già chiuso: si apre in sola lettura, per rispondere alle
          domande che arrivano dopo — e per raggiungere i suoi documenti. */}
      {dettaglio && (
        <SaOrdineDettaglioModal
          ordine={dettaglio}
          onClose={() => setDettaglio(null)}/>
      )}

      {/* Salda ora: stessa modale incasso del banco, sul totale dell'ordine.
          Vale sia per gli asporto arrivati dai canali digitali sia per i conti
          di cassa parcheggiati con un acconto — sono la stessa cosa, un ordine
          che esiste e non è ancora saldato. Gli acconti sono suoi: la finestra
          li legge e ci riscrive dentro, così un secondo acconto resta sul conto
          in coda invece di generarne un altro. */}
      {/* L'ordine d'asporto ha già le sue righe, in una forma sua: qui si
          rivestono da riga di carrello perché la finestra fattura sappia
          leggerle. Sono cessioni, non somministrazione — takeaway sempre. */}
      <SaIncassaModal
        open={!!saldaOrdine}
        total={saldaOrdine ? saldaOrdine.totale : 0}
        lines={saldaOrdine ? saldaOrdine.items.map(it => ({
          piatto: { name: it.nome, hasAlcohol: it.hasAlcohol, tipologia: it.tipologia },
          qty: it.qty, lineTotal: it.prezzo, tipologia: it.tipologia,
          // P-108: il profilo congelato alla battuta viaggia con la riga
          // anche attraverso la coda; se manca (ordine dai canali), la
          // fattura lo ricava da tipologia × asporto.
          aliquota: it.aliquota, ivaProfilo: it.ivaProfilo,
        })) : []}
        takeaway
        pagamenti={saldaOrdine ? (saldaOrdine.acconti || []) : []}
        onPagamenti={aggiornaAccontiOrdine}
        onClose={() => setSaldaOrdine(null)}
        onConfirm={() => confermaSaldo(saldaOrdine)}
      />

      {toast && (
        <div style={{
          position:'absolute', bottom: 28, left:'50%', transform:'translateX(-50%)',
          background:'#0F1115', color:'#fff',
          padding:'12px 22px', borderRadius: 999,
          fontSize: 17, fontWeight: 700, zIndex: 120,
          whiteSpace:'nowrap',
          boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
        }}>{toast}</div>
      )}

      {personalize && (
        <SaPersonalizzaModal
          piatto={personalize.piatto}
          initialMods={personalize.mods}
          initialQty={personalize.qty}
          onClose={() => { setPersonalize(null); setEditLine(null); }}
          onConfirm={addPersonalized}
        />
      )}

      {customOpen && (
        <SaCustomModal
          takeaway={takeaway}
          onClose={() => setCustomOpen(false)}
          onConfirm={(name, price, tipologia) => { addCustomLine(name, price, tipologia); setCustomOpen(false); }}
        />
      )}

      {customEdit !== null && lines[customEdit] && (
        <SaCustomModal
          takeaway={takeaway}
          iniziale={{ name: lines[customEdit].displayName || lines[customEdit].piatto.name, price: lines[customEdit].lineTotal, tipologia: lines[customEdit].tipologia }}
          onClose={() => setCustomEdit(null)}
          onConfirm={(name, price, tipologia) => { editCustomLine(customEdit, name, price, tipologia); setCustomEdit(null); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Code del banco — due pulsanti accanto alla ricerca, uno per gesto.

// Il numero è l'informazione, non la decorazione: a zero il pulsante si spegne
// (resta cliccabile, da lì si arriva a "tutti gli ordini") e non chiama.
function SaCodaBtn({ label, count, tone, icon, title, onClick }) {
  const vuoto = count === 0;
  const badge = vuoto
    ? { bg: PN.WHITE_FROST, fg: PN.MUTED_SOFT }
    : tone === 'amber' ? { bg: PN.AMBER, fg: '#fff' } : { bg: PN.GREEN, fg: '#fff' };
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display:'inline-flex', alignItems:'center', gap: 8, flexShrink: 0,
        padding: '0 13px', borderRadius: 10,
        background: PN.WHITE, color: vuoto ? PN.MUTED : PN.TEXT,
        border: `1px solid ${PN.BORDER_LIGHT}`,
        fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        whiteSpace:'nowrap',
        boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
        transition: 'border-color 150ms, background 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#FAFBFC'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_LIGHT; e.currentTarget.style.background = PN.WHITE; }}>
      <span style={{color: vuoto ? PN.MUTED_SOFT : (tone === 'amber' ? PN.AMBER : PN.GREEN), display:'inline-flex'}}>{icon}</span>
      {label}
      <span style={{
        minWidth: 22, padding: '2px 7px', borderRadius: 999,
        background: badge.bg, color: badge.fg,
        fontSize: 14, fontWeight: 800, lineHeight: 1.2, textAlign:'center',
        fontVariantNumeric:'tabular-nums',
      }}>{count}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coda del banco — popup centrale, stessa anatomia di card per i due modi:
//   'salda'    → arrivati da app/webapp, ancora da incassare (CTA Procedi al pagamento)
//   'consegna' → già pagati, pronti da dare via (CTA Segna come consegnato)
// L'archivio dei consegnati sta nella riga in alto, non qui dentro.

const SA_CODA_MODI = {
  salda: {
    // "Da saldare" e non "Pronti da saldare": qui il tema è il pagamento, non
    // la prontezza — un ordine appena arrivato non è pronto, è solo non
    // pagato. E in fila con "Da consegnare" i due stati si leggono in
    // parallelo, che è come li usa chi sta al banco.
    titolo: 'Da saldare',
    sotto: 'Ordini ancora da incassare: arrivati da app e webapp, o lasciati in sospeso alla cassa. Saldati, passano nella coda di chi va consegnato.',
    vuotoTitolo: 'Niente da saldare',
    vuotoTesto: 'Gli ordini che arrivano già pagati non passano di qui.',
    // Chi si presenta al banco dice un codice o un nome: qui si cerca quello,
    // non si scorre la coda a occhio.
    ricerca: true,
    ricercaPlaceholder: 'Cerca per codice, nome o piatto…',
  },
  consegna: {
    titolo: 'Da consegnare',
    sotto: 'Ordini pronti e già pagati: consegnato l\'ordine, segnalo e esce dalla coda.',
    vuotoTitolo: 'Niente da consegnare',
    vuotoTesto: 'Qui arrivano gli ordini pagati, appena sono pronti al banco.',
  },
};

function SaCodaModal({ open, modo, ritiri, onClose, onConsegna, onSalda }) {
  const testi = SA_CODA_MODI[modo] || SA_CODA_MODI.consegna;
  const [q, setQ] = React.useState('');
  React.useEffect(() => { setQ(''); }, [modo, open]);
  const ql = testi.ricerca ? q.trim().toLowerCase() : '';
  const visibili = !ql ? ritiri : ritiri.filter(r =>
    // Si cerca con quello che il cliente dice: il suo nome, "B-3", il codice
    // di ritiro. Il progressivo interno resta cercabile perché a volte lo si
    // ha sotto gli occhi da un'altra schermata, ma non è più il primo modo.
    svNomeConto(r).toLowerCase().includes(ql) ||
    (r.codice || '').toLowerCase().includes(ql) ||
    (r.cliente || '').toLowerCase().includes(ql) ||
    (r.items || []).some(i => i.nome.toLowerCase().includes(ql))
  );
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  return (
    // absolute (ancorato al frame, non alla finestra): dentro il canvas scalato
    // con zoom i fixed si disallineano. Stessa scatola dei "Consegnati": le
    // code sono la stessa materia, guardata da più vicino.
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 95, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 22, width: 560, maxWidth:'100%', maxHeight:'100%',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* header */}
        <div style={{padding:'20px 22px 14px', display:'flex', alignItems:'flex-start', gap: 10, flexShrink: 0}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>{testi.titolo}</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
              {testi.sotto}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border:'none', background:'rgba(255,255,255,0.75)', color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontSize: 18, fontFamily:'inherit',
          }}>×</button>
        </div>

        {testi.ricerca && ritiri.length > 0 && (
          <div style={{padding:'0 22px 12px', flexShrink: 0}}>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display:'inline-flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </span>
              <input
                autoFocus
                value={q} onChange={e => setQ(e.target.value)}
                placeholder={testi.ricercaPlaceholder}
                onKeyDown={e => { if (e.key === 'Escape' && q) { e.stopPropagation(); setQ(''); } }}
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding: '10px 34px 10px 35px',
                  borderRadius: 10, border: `1px solid ${PN.BORDER_LIGHT}`,
                  fontSize: 16, fontFamily:'inherit', outline:'none',
                  background:'rgba(255,255,255,0.78)',
                  boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
                }}/>
              {q && (
                <button
                  onClick={() => setQ('')}
                  title="Pulisci la ricerca"
                  style={{
                    position:'absolute', right: 5, top:'50%', transform:'translateY(-50%)',
                    width: 24, height: 24, borderRadius:'50%',
                    background:'transparent', border:'none', color: PN.MUTED,
                    fontSize: 16, lineHeight: 1, cursor:'pointer', fontFamily:'inherit',
                  }}>×</button>
              )}
            </div>
          </div>
        )}

        {/* lista ordini — minHeight:0 obbligatorio: senza, il flex item cresce
            quanto il contenuto e la lista non scrolla (card tagliate in basso) */}
        <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflow:'auto', padding: '0 22px 22px', display:'flex', flexDirection:'column', gap: 12}}>
          {ritiri.length === 0 && (
            <div style={{textAlign:'center', padding:'48px 20px', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <div style={{
                width: 60, height: 60, borderRadius:'50%', marginBottom: 14,
                background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
                display:'grid', placeItems:'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
              </div>
              <div style={{fontSize: 17.5, fontWeight: 700, color: PN.TEXT, marginBottom: 5}}>{testi.vuotoTitolo}</div>
              <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5, maxWidth: 300}}>{testi.vuotoTesto}</div>
            </div>
          )}
          {ritiri.length > 0 && visibili.length === 0 && (
            <div style={{textAlign:'center', padding:'40px 20px', color: PN.MUTED, fontSize: 16}}>
              Nessun ordine in coda corrisponde a "{q.trim()}"
            </div>
          )}
          {visibili.map(r => (
            <div key={r.id}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 0 rgba(15,17,21,0.03), 0 12px 28px rgba(15,17,21,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              style={{
              border: `1px solid ${PN.BORDER_HAIR}`, borderRadius: 16,
              background: 'rgba(255,255,255,0.82)',
              boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 16px rgba(15,17,21,0.05)',
              overflow:'hidden',
              transition:'transform 160ms ease, box-shadow 180ms ease',
              // flexShrink 0 obbligatorio: senza, la colonna flex COMPRIME le card
              // per farcele stare (niente overflow → niente scroll) e il fondo
              // di ogni card — la CTA Consegna — resta clippato da overflow:hidden.
              flexShrink: 0,
            }}>
              {/* Le due cose che servono per scorrere la coda stanno sulla
                  stessa riga e sono le più grandi: CHI è (per riconoscerlo
                  quando si presenta) e QUANTO (per dirglielo). Con queste due
                  in cima la coda si legge senza leggere gli articoli.
                  Il progressivo #1247 è sparito dalla card: è un numero da
                  registro, nessuno lo pronuncia, e stava grande quanto il nome.
                  Al suo posto il nome vero del conto — B-3 al banco, il nome
                  del cliente in asporto, il codice di ritiro se non l'ha
                  lasciato. */}
              {(() => {
                const netto = svResiduoOrdine(r);
                const preso = (r.acconti || []).reduce((s, p) => s + p.importo, 0);
                const resta = Math.max(0, netto.totale - preso);
                const conAcconto = preso > 0.004 && !r.pagato;
                return (
                  <div style={{padding:'14px 16px 0'}}>
                    <div style={{display:'flex', alignItems:'baseline', gap: 12}}>
                      <span style={{
                        flex: 1, minWidth: 0, display:'flex', alignItems:'center', gap: 7,
                        overflow:'hidden',
                      }}>
                        {svPiattaforma(r.fonte) ? (
                          /* P-04: la posizione grande è del CODICE piattaforma,
                             in monospazio — è il confronto a colpo d'occhio col
                             telefono del rider. La sigla a brand pieno (da
                             PN_PARTNER, come il marchio in cucina) dice quale
                             piattaforma prima ancora di leggere. */
                          <React.Fragment>
                            <span style={{
                              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                              background: window.PN_PARTNER[r.fonte].bg,
                              color: window.PN_PARTNER[r.fonte].ink,
                              display:'inline-grid', placeItems:'center',
                              fontSize: 12, fontWeight: 800, letterSpacing: 0.3,
                            }}>{window.PN_PARTNER[r.fonte].sigla}</span>
                            <span style={{
                              minWidth: 0, fontSize: 21, fontWeight: 800, letterSpacing: 0.5,
                              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                              color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                            }}>{r.codice}</span>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <span style={{
                              minWidth: 0, fontSize: 21, fontWeight: 800, letterSpacing: -0.4,
                              color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                            }}>{svNomeConto(r)}</span>
                            {/* Un ordine dall'app ha un account dietro: il nome è
                                vero, non uno scritto a mano al banco, e a quel
                                cliente si può scrivere. Il bollino è lo stesso che
                                la Sala usa sugli ordini byup — stessa cosa, stesso
                                segno, in tutto il gestionale. */}
                            {r.fonte === 'byup' && (
                              <span style={{
                                fontSize: 12, fontWeight: 800, color:'#E04347',
                                background:'#FFE0DD', padding:'2px 6px', borderRadius: 4,
                                letterSpacing: 0.4, textTransform:'uppercase', flexShrink: 0,
                              }}>byup</span>
                            )}
                          </React.Fragment>
                        )}
                      </span>
                      {/* Niente etichetta sopra la cifra: la coda si chiama
                          "Da saldare", quindi cosa sia quel numero è già detto
                          dal posto in cui stai. */}
                      <span style={{
                        fontSize: 21, fontWeight: 800, letterSpacing: -0.4,
                        color: r.pagato ? PN.MUTED : PN.TEXT,
                        fontVariantNumeric:'tabular-nums', flexShrink: 0,
                      }}>€{(r.pagato ? netto.totale : resta).toFixed(2)}</span>
                    </div>
                    <div style={{
                      display:'flex', alignItems:'baseline', gap: 10, marginTop: 2,
                      fontSize: 14, color: PN.MUTED,
                    }}>
                      <span style={{flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>
                        {/* Piattaforma: il cliente finale scende qui sotto —
                            in cima ci sta il codice, che è per il rider. */}
                        {svPiattaforma(r.fonte)
                          ? `per ${r.cliente} · ritiro ${r.ritiro}`
                          : `${(r.fonte === 'banco' ? !!r.asporto : true) ? 'Asporto' : 'Sul posto'} · ritiro ${r.ritiro}`}
                      </span>
                      {conAcconto && (
                        <span style={{flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>di €{netto.totale.toFixed(2)}</span>
                      )}
                      {/* Quanto è già uscito dall'ordine: senza, la cifra in
                          alto sarebbe scesa senza spiegazione. */}
                      {netto.rimborsato > 0.004 && (
                        <span style={{flexShrink: 0, color:'#B91C1C', fontWeight: 600, fontVariantNumeric:'tabular-nums'}}>
                          −€{netto.rimborsato.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Gli articoli servono a consegnare, non a fare i conti: qui
                  bastano quantità e nome. I prezzi riga erano cinque numeri per
                  card che nessuno somma — il totale sta già scritto sopra, e
                  loro competevano con quello. */}
              <div style={{padding:'10px 16px 12px', display:'flex', flexDirection:'column', gap: 2}}>
                {svResiduoOrdine(r).items.map((item, i) => (
                  <div key={i} style={{display:'flex', alignItems:'center', gap: 8, fontSize: 15}}>
                    <span style={{fontWeight: 700, color: PN.MUTED_SOFT, minWidth: 22, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>{item.qty}×</span>
                    <span style={{flex: 1, minWidth: 0, color: PN.TEXT, fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.nome}</span>
                  </div>
                ))}
              </div>
              {/* CTA: mai la consegna su un ordine da saldare — prima l'incasso,
                  poi (l'ordine passa nell'altra coda) la consegna */}
              {/* Le due code sono la stessa materia guardata in due momenti,
                  e il gesto principale di una card ha lo stesso peso in
                  entrambe: pulsante pieno, larghezza intera, colore del brand.
                  Prima "Procedi al pagamento" era bianco col bordo e "Segna
                  come consegnato" pieno — due gerarchie diverse per la stessa
                  posizione, come se incassare contasse meno che consegnare. */}
              <div style={{padding:'0 16px 14px'}}>
                <button
                  onClick={() => (r.pagato ? onConsegna(r) : onSalda(r))}
                  style={{
                    width:'100%', padding:'12px 16px', borderRadius: 999,
                    background: SV_SUNSET_BG, color: SV_SUNSET_TEXT,
                    border:'1px solid transparent',
                    fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    boxShadow: SV_SUNSET_SHADOW,
                    transition:'box-shadow 180ms ease-out, filter 150ms ease-out, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.22)'; e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,200,210,0.22), inset 0 0 0 1px rgba(255,130,150,0.16), 0 12px 30px -8px rgba(80,10,30,0.65), 0 4px 10px -4px rgba(80,10,30,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = SV_SUNSET_SHADOW; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}>
                  {r.pagato ? 'Segna come consegnato' : 'Procedi al pagamento'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Consegnati — l'archivio del servizio: gli ordini che sono già usciti dalle
// code. Non ha azioni (non c'è più niente da fare), si viene per guardare:
// quant'era, a che ora è passato, da che canale era arrivato.

// ─── Provenienza dell'ordine (P-03 · D-15): sei canali, non tre ────────────
// Il canale spiega perché quell'ordine ha un nome o un codice al posto suo.
// Era una costante doppia (qui e nel dettaglio) e le copie avevano già
// divergito («Webapp» / «Webapp guest»): ora è una, per tutte e due.
// I tre nativi parlano la nostra lingua, in pastello; le tre piattaforme la
// loro: brand pieno da PN_PARTNER (panoramica-tokens.jsx), la stessa fonte
// del marchio in cucina e della riga in Integrazioni. Il colore È il
// dispositivo di riconoscimento — esterno lingua sua, interno la nostra.
// Il comportamento di coda degli ordini piattaforma (niente «Da saldare»,
// codice della piattaforma) arriva con P-04: qui c'è solo il contrassegno.
const SV_CANALE = {
  byup:   { label:'Byup App', bg: PN.PINK_BG_SOFT, fg: PN.PINK_DARK },
  webapp: { label:'Webapp',   bg: PN.BLUE_SOFT,    fg: '#1D4ED8' },
  banco:  { label:'Cassa',    bg: '#F4F5F7',       fg: PN.MUTED },
  ...Object.fromEntries(Object.entries(window.PN_PARTNER || {}).map(([id, p]) =>
    [id, { label: p.nome, bg: p.bg, fg: p.ink }])),
};

function SaConsegnatiModal({ consegnati, onClose, onVai }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 110, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 22, width: 700, maxWidth:'100%', maxHeight:'100%',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'20px 22px 16px', display:'flex', alignItems:'flex-start', gap: 10, flexShrink: 0}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>Consegnati</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2}}>
              Gli ordini già chiusi del servizio, dal più recente.
            </div>
          </div>
          <span style={{
            fontSize: 13.5, fontWeight: 800, flexShrink: 0,
            color: PN.MUTED, background:'rgba(255,255,255,0.75)',
            padding:'5px 12px', borderRadius: 999, fontVariantNumeric:'tabular-nums',
          }}>{consegnati.length}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border:'none', background:'rgba(255,255,255,0.75)', color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontSize: 18, fontFamily:'inherit',
          }}>×</button>
        </div>

        <div className="pn-scroll" style={{
          flex: 1, minHeight: 0, overflow:'auto',
          padding:'0 22px 22px', display:'flex', flexDirection:'column', gap: 8,
        }}>
          {consegnati.length === 0 && (
            <div style={{textAlign:'center', padding:'44px 20px', color: PN.MUTED, fontSize: 16}}>
              Nessun ordine consegnato: il servizio è appena cominciato.
            </div>
          )}
          {consegnati.map(o => {
            const canale = SV_CANALE[o.fonte] || SV_CANALE.banco;
            const nItems = o.items.reduce((s, i) => s + i.qty, 0);
            const reso = (o.rimborsi || []).reduce((s, r) => s + r.amount, 0);
            return (
              <div key={o.id} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'11px 14px', borderRadius: 14,
                background:'rgba(255,255,255,0.78)',
                border:`1px solid ${PN.BORDER_HAIR}`,
              }}>
                <span style={{flex: 1, minWidth: 0}}>
                  {/* Identità: il nome se l'ordine ha un account dietro, il
                      codice se è arrivato dalla webapp guest o dalla cassa. */}
                  <span style={{display:'flex', alignItems:'center', gap: 7, minWidth: 0}}>
                    <span style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>
                      {o.cliente || o.codiceRitiro || o.codice}
                    </span>
                    {o.cliente && (
                      <span style={{
                        fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
                        fontVariantNumeric:'tabular-nums', flexShrink: 0,
                        background:'#F4F5F7', border:`1px solid ${PN.BORDER_SOFT}`,
                        padding:'1px 7px', borderRadius: 7,
                      }}>{o.codice}</span>
                    )}
                  </span>
                  <span style={{display:'flex', alignItems:'center', gap: 7, marginTop: 3, minWidth: 0}}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, letterSpacing: 0.3, textTransform:'uppercase',
                      padding:'2px 8px', borderRadius: 999,
                      background: canale.bg, color: canale.fg,
                    }}>{canale.label}</span>
                    <span style={{fontSize: 14, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>
                      {o.ritiro} · {nItems} {nItems === 1 ? 'articolo' : 'articoli'}
                    </span>
                    {/* Un ordine toccato da un rimborso si vede dalla lista:
                        è esattamente quello che si sta cercando quando si apre
                        l'archivio dopo una contestazione. */}
                    {(o.annullato || reso > 0.004) && (
                      <span style={{
                        fontSize: 12, fontWeight: 800, letterSpacing: 0.3, textTransform:'uppercase',
                        padding:'2px 8px', borderRadius: 999, flexShrink: 0,
                        background: o.annullato ? '#FEE2E2' : PN.AMBER_SOFT,
                        color: o.annullato ? '#B91C1C' : '#92400E',
                      }}>{o.annullato ? 'annullato' : 'reso'}</span>
                    )}
                  </span>
                </span>
                <span style={{minWidth: 70, textAlign:'right', flexShrink: 0}}>
                  <span style={{
                    display:'block', fontSize: 17.5, fontWeight: 800, fontVariantNumeric:'tabular-nums',
                    color: o.annullato ? PN.MUTED : PN.TEXT,
                    textDecoration: o.annullato ? 'line-through' : 'none',
                  }}>€{o.totale.toFixed(2)}</span>
                  {reso > 0.004 && !o.annullato && (
                    <span style={{display:'block', fontSize: 13, fontWeight: 700, color:'#B91C1C', fontVariantNumeric:'tabular-nums'}}>
                      −€{reso.toFixed(2)}
                    </span>
                  )}
                </span>
                {/* Qui non si agisce: si apre l'ordine per guardarci dentro */}
                <button
                  onClick={() => onVai(o)}
                  title="Apri il dettaglio di questo ordine"
                  style={{
                    display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
                    padding:'7px 13px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.85)', color: PN.TEXT,
                    border: `1px solid ${PN.BORDER_LIGHT}`,
                    fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    whiteSpace:'nowrap',
                  }}>
                  Vedi ordine
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m12.5 5.5 6.5 6.5-6.5 6.5"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Dettaglio di un ordine già chiuso — sola lettura: non c'è più niente da
// fare, si viene qui per rispondere a una domanda (cosa c'era dentro,
// quant'era, a che ora è passato).
function SaOrdineDettaglioModal({ ordine, onClose }) {
  const resi = ordine.rimborsi || [];
  const totReso = resi.reduce((s, r) => s + r.amount, 0);
  const netto = Math.max(0, ordine.totale - totReso);
  // La costante di canale è quella condivisa (SV_CANALE, in testa alle
  // modali): qui serve solo l'etichetta.
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 120, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 22, width: 500, maxWidth:'100%', maxHeight:'100%',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'20px 22px 14px', display:'flex', alignItems:'flex-start', gap: 10, flexShrink: 0}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {ordine.cliente || ordine.codiceRitiro || ordine.codice}
            </div>
            <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: 5, flexWrap:'wrap'}}>
              {ordine.cliente && (
                <span style={{
                  fontSize: 13, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums',
                  background:'rgba(255,255,255,0.75)', border:`1px solid ${PN.BORDER_SOFT}`,
                  padding:'1px 8px', borderRadius: 7,
                }}>{ordine.codice}</span>
              )}
              <span style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>
                {(SV_CANALE[ordine.fonte] || SV_CANALE.banco).label} · ritiro {ordine.ritiro}
              </span>
            </div>
          </div>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 5, flexShrink: 0,
            fontSize: 13.5, fontWeight: 700,
            color: ordine.annullato ? '#B91C1C' : totReso > 0.004 ? '#92400E' : PN.MUTED,
            background: ordine.annullato ? '#FEE2E2' : totReso > 0.004 ? PN.AMBER_SOFT : 'rgba(255,255,255,0.75)',
            padding:'4px 11px', borderRadius: 999,
          }}>{ordine.annullato ? 'Annullato' : totReso > 0.004 ? 'Reso parziale' : '✓ Consegnato'}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border:'none', background:'rgba(255,255,255,0.75)', color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontSize: 18, fontFamily:'inherit',
          }}>×</button>
        </div>

        <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflow:'auto', padding:'0 22px 22px'}}>
          <div style={{
            background:'rgba(255,255,255,0.72)', border:`1px solid ${PN.BORDER_SOFT}`,
            borderRadius: 14, padding:'12px 14px', display:'flex', flexDirection:'column', gap: 5,
          }}>
            {ordine.items.map((item, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap: 9, fontSize: 15.5}}>
                <span style={{fontWeight: 700, color: PN.MUTED_SOFT, minWidth: 26, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>{item.qty}×</span>
                <span style={{flex: 1, color: PN.TEXT, fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.nome}</span>
                <span style={{fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{(item.prezzo * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:`1px solid ${PN.BORDER_SOFT}`, paddingTop: 9, marginTop: 4}}>
              <span style={{fontSize: 13.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4}}>
                {totReso > 0.004 ? 'Resta incassato' : 'Totale · pagato'}
              </span>
              <span style={{fontSize: 19, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums', letterSpacing:-0.3}}>
                €{netto.toFixed(2)}
              </span>
            </div>
            {totReso > 0.004 && (
              <div style={{fontSize: 13.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>
                Totale €{ordine.totale.toFixed(2)} · reso −€{totReso.toFixed(2)}
              </div>
            )}
          </div>

          {/* I rimborsi fatti su questo ordine, col loro documento. È la parte
              che qualcuno rileggerà fra un mese per capire cosa è successo,
              quindi porta il motivo e non solo la cifra. */}
          {resi.length > 0 && (
            <div style={{marginTop: 14}}>
              <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 8}}>
                Rimborsi
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                {resi.map(r => (
                  <div key={r.id} style={{
                    background:'rgba(255,255,255,0.72)', border:`1px solid ${PN.BORDER_SOFT}`,
                    borderRadius: 12, padding:'10px 13px',
                  }}>
                    <div style={{display:'flex', alignItems:'baseline', gap: 10}}>
                      <span style={{flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>
                        {r.tipo === 'annulla' ? 'Annullo' : 'Reso'}
                        <span style={{fontWeight: 500, color: PN.MUTED}}> · {r.metodo === 'carta' ? 'Smart POS' : 'contanti'}</span>
                      </span>
                      <span style={{fontSize: 16, fontWeight: 800, color:'#B91C1C', fontVariantNumeric:'tabular-nums'}}>
                        −€{r.amount.toFixed(2)}
                      </span>
                    </div>
                    <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, fontVariantNumeric:'tabular-nums'}}>
                      {r.doc} · {r.ora}{r.motivo ? ` · ${r.motivo}` : ''}
                    </div>
                    {r.righe && r.righe.length > 0 && (
                      <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3}}>
                        {r.righe.map(x => `${x.qty}× ${x.nome}`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Le domande che arrivano su un ordine chiuso finiscono quasi sempre
            sulla carta: lo scontrino, il suo numero, se è passato all'Agenzia.
            Quella roba vive in Contabilità → Conti, e senza un rimando la si
            raggiungeva ricominciando da capo — cambia sezione, cerca il nome,
            apri la riga. Qui il conto è già quello, e già aperto.
            "Ricevute fiscali" e non "conto": è quello che si sta cercando
            quando si preme, il conto è solo dove stanno. */}
        <div style={{padding:'0 22px 16px', flexShrink: 0}}>
          <button
            onClick={() => { window.location.href = `byup Contabilita.html?tab=conti&conto=${encodeURIComponent(window.svContoIdDiOrdine(ordine))}`; }}
            title="Apri il conto di questo ordine in Contabilità, con i suoi documenti"
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap: 7,
              width:'100%', padding:'11px 16px', borderRadius: 14,
              background:'rgba(255,255,255,0.72)', color: PN.TEXT,
              border:`1px solid ${PN.BORDER_SOFT}`,
              fontSize: 15.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              transition:'background 150ms ease-out, border-color 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = '#9CA3AF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = PN.BORDER_SOFT; }}>
            Vai alle ricevute fiscali associate
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED}}><path d="M7 17 17 7M8 7h9v9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Finestra dell'articolo fuori menù (P-108 · D-105): nome, prezzo e TIPOLOGIA.
// Chi batte non sceglie un'aliquota: dichiara che cosa vende fra le cinque
// tipologie del dizionario, e l'aliquota la fissa la legge in base al
// prodotto e al modo di consumo. La prima è preselezionata, la spiegazione
// sotto il campo dice le due aliquote e il fondamento. La stessa finestra si
// riapre cliccando la riga (`iniziale` valorizzato) con tutto modificabile.

// La tendina delle tipologie, nella lingua della cassa.
//
// Il `<select>` di sistema apre la lista del sistema operativo — tipografia
// sua, evidenziazione sua — dentro una finestra di vetro che parla un'altra
// lingua; ed è la scelta più delicata della battuta, perché decide l'aliquota.
// Qui le cinque voci sono un pannello nostro, e ognuna porta a destra
// l'ALIQUOTA CHE SI APPLICHEREBBE ORA, col modo dell'ordine: si sceglie
// guardando l'effetto, non il nome.
function SaTipologiaSelect({ value, onChange, takeaway }) {
  const [open, setOpen] = React.useState(false);
  const box = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const fuori = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', fuori);
    document.addEventListener('keydown', esc, true);
    return () => { document.removeEventListener('mousedown', fuori); document.removeEventListener('keydown', esc, true); };
  }, [open]);
  const voci = window.PN_TIPOLOGIE_ARTICOLO || [];
  const corrente = window.pnTipologia(value);
  const aliquota = (t) => (takeaway ? t.asporto : t.locale).aliquota;
  return (
    <div ref={box} style={{position:'relative'}}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        style={{
          width:'100%', display:'flex', alignItems:'center', gap: 10, textAlign:'left',
          padding: '10px 12px', borderRadius: 10, cursor:'pointer', fontFamily:'inherit',
          border: `1px solid ${open ? 'rgba(15,17,21,0.45)' : 'rgba(15,17,21,0.14)'}`,
          background: 'rgba(255,255,255,0.75)',
          boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
          fontSize: 16.5, color: PN.TEXT, transition: 'border-color 120ms ease-out',
        }}>
        <span style={{flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight: 600, fontSize: 15}}>{corrente.label}</span>
        <span style={{
          flexShrink: 0, padding: '2px 8px', borderRadius: 6, background: '#F4F5F7',
          fontSize: 13, fontWeight: 700, color: PN.MUTED, fontVariantNumeric: 'tabular-nums',
        }}>{aliquota(corrente)}%</span>
        <span style={{display:'inline-flex', color: PN.MUTED, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition:'transform 180ms ease-out'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      {open && (
        <div role="listbox" style={{
          position:'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 30,
          background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 12,
          boxShadow: '0 14px 38px rgba(15,17,21,0.16)', padding: 6, maxHeight: 300, overflowY: 'auto',
        }}>
          {voci.map(t => {
            const on = t.id === corrente.id;
            return (
              <div key={t.id} role="option" aria-selected={on}
                onClick={() => { onChange(t.id); setOpen(false); }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#F7F8FA'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                style={{
                  display:'flex', alignItems:'center', gap: 10, padding: '9px 10px', borderRadius: 9,
                  cursor:'pointer', background: on ? PN.PINK_SOFT : 'transparent',
                  color: on ? PN.PINK_DARK : PN.TEXT, transition:'background 120ms ease-out',
                }}>
                <span style={{flex: 1, minWidth: 0, fontSize: 15, fontWeight: on ? 700 : 600, lineHeight: 1.3}}>{t.label}</span>
                <span style={{
                  flexShrink: 0, padding: '2px 8px', borderRadius: 6, fontVariantNumeric: 'tabular-nums',
                  background: on ? 'rgba(255,255,255,0.7)' : '#F4F5F7',
                  fontSize: 13, fontWeight: 700, color: on ? PN.PINK_DARK : PN.MUTED,
                }}>{aliquota(t)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// La riga fuori menù si riconosce dal piatto che la porta.
const svRigaCustom = (line) => !!(line && line.piatto && (line.piatto.custom || /^custom_/.test(String(line.piatto.id))));

function SaCustomModal({ onClose, onConfirm, takeaway, iniziale }) {
  const modifica = !!iniziale;
  const [name, setName] = React.useState(iniziale ? iniziale.name : '');
  const [price, setPrice] = React.useState(iniziale ? String(iniziale.price.toFixed(2)) : '');
  const [tipologia, setTipologia] = React.useState(iniziale && iniziale.tipologia ? iniziale.tipologia : window.PN_TIPOLOGIA_DEFAULT);
  const voce = window.pnTipologia(tipologia);
  const profilo = window.pnTipologiaProfilo(tipologia, takeaway);
  const nameRef = React.useRef(null);

  React.useEffect(() => { nameRef.current?.focus(); }, []);

  const parsedPrice = parseFloat(price.replace(',', '.'));
  // La tipologia ha sempre un valore (la prima è proposta a tutti), quindi
  // non tiene mai spento il pulsante: contano solo nome e prezzo.
  const valid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const handleConfirm = () => {
    if (!valid) return;
    onConfirm(name.trim(), parsedPrice, voce.id);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && valid) handleConfirm(); if (e.key === 'Escape') onClose(); };

  const inputStyle = {
    padding: '10px 12px', borderRadius: 10,
    border: '1px solid rgba(15,17,21,0.14)', outline: 'none',
    background: 'rgba(255,255,255,0.75)',
    fontSize: 16.5, fontFamily: 'inherit', color: PN.TEXT,
    boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
    transition: 'border-color 120ms ease-out',
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20,
        width: 440, maxWidth:'100%',
        padding: '22px 22px 20px',
        display:'flex', flexDirection:'column', gap: 18,
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10}}>
          <div>
            <div style={{fontSize: 19, fontWeight: 700, color: PN.TEXT}}>{modifica ? 'Modifica l\'articolo fuori menù' : 'Articolo fuori menù'}</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2}}>{modifica ? 'Nome, prezzo e tipologia: l\'aliquota si ricalcola' : 'Non è nel menù: nome, prezzo e tipologia'}</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Inputs */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <label style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5}}>Nome articolo</label>
            <input
              ref={nameRef}
              value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey}
              placeholder="es. Servizio, Acqua del rubinetto…"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(15,17,21,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(15,17,21,0.14)'}
            />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <label style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5}}>Prezzo (€)</label>
            <input
              value={price} onChange={e => setPrice(e.target.value)} onKeyDown={handleKey}
              placeholder="0.00"
              inputMode="decimal"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(15,17,21,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(15,17,21,0.14)'}
            />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <label style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5}}>Tipologia articolo</label>
            <SaTipologiaSelect value={voce.id} onChange={setTipologia} takeaway={takeaway}/>
            {/* La spiegazione della voce scelta: le due aliquote e il
                fondamento, e in grassetto quella che vale per QUESTO ordine. */}
            <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.45}}>
              {window.pnTipologiaSpiegazione(voce.id)}
              <span style={{display:'block', marginTop: 3, color: PN.TEXT, fontWeight: 600}}>
                {takeaway ? 'Da asporto' : 'Al banco'}: IVA {profilo.aliquota}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottone conferma */}
        <button
          onClick={handleConfirm}
          disabled={!valid}
          style={{
            padding: '12px 18px', borderRadius: 999,
            background: valid ? SV_SUNSET_BG : PN.WHITE_FROST,
            color: valid ? SV_SUNSET_TEXT : PN.MUTED_SOFT,
            border: `1px solid ${valid ? 'transparent' : PN.BORDER_SOFT_A}`,
            fontSize: 17.5, fontWeight: 700,
            cursor: valid ? 'pointer' : 'not-allowed',
            fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
            boxShadow: valid ? SV_SUNSET_SHADOW : 'none',
            transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
          }}
          onMouseEnter={e => { if (valid) svSunsetHoverIn(e); }}
          onMouseLeave={svSunsetHoverOut}>
          <span>{modifica ? 'Aggiorna la riga' : 'Aggiungi al conto'}</span>
          <span style={{fontSize: 17.5, fontWeight: 700}}>{valid ? `€${parsedPrice.toFixed(2)}` : ''}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card piatto

function SaPiattoCard({ p, qtyInCart, customizable, requiresOptions, onQuickAdd, onPersonalizza }) {
  const [imgError, setImgError] = React.useState(false);
  const cardRef = React.useRef(null);
  const cat = SALA_VENDITA_CATS[p.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const inCart = qtyInCart > 0;

  // Feedback aggiunta: una miniatura del piatto "vola" dalla card al riepilogo
  // (ghost DOM + Web Animations API), poi il riepilogo fa un piccolo bump.
  const flyToCart = () => {
    const from = cardRef.current?.getBoundingClientRect();
    const to = document.getElementById('sa-cart-panel')?.getBoundingClientRect();
    if (!from || !to || !Element.prototype.animate) return;
    const size = 44;
    const startX = from.left + from.width / 2 - size / 2;
    const startY = from.top + 28;
    const dx = (to.left + 24) - startX;
    const dy = (to.top + 18) - startY;
    const ghost = document.createElement('div');
    ghost.style.cssText =
      `position:fixed; left:${startX}px; top:${startY}px; width:${size}px; height:${size}px;` +
      `border-radius:12px; overflow:hidden; z-index:300; pointer-events:none;` +
      `box-shadow:0 6px 18px rgba(15,17,21,0.25); border:2px solid #fff;` +
      `background:${cat.bg}; color:${cat.color}; display:grid; place-items:center;` +
      `font-size:20px; font-weight:700; font-family:inherit;`;
    if (!imgError && p.img) {
      const img = document.createElement('img');
      img.src = p.img;
      img.style.cssText = 'width:100%; height:100%; object-fit:cover; display:block;';
      ghost.appendChild(img);
    } else {
      ghost.textContent = p.name.charAt(0);
    }
    document.body.appendChild(ghost);
    const anim = ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 46}px) scale(0.85)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.15 },
    ], { duration: 560, easing: 'cubic-bezier(0.25, 0.1, 0.3, 1)' });
    anim.onfinish = () => {
      ghost.remove();
      window.dispatchEvent(new CustomEvent('sa-cart-bump'));
    };
  };

  const quickAddConFeedback = () => { flyToCart(); onQuickAdd(); };

  return (
    <div
      ref={cardRef}
      onClick={customizable ? onPersonalizza : quickAddConFeedback}
      title={customizable ? 'Personalizza e aggiungi' : 'Aggiungi al conto'}
      style={{
        background: PN.WHITE, borderRadius: 12,
        border: `1px solid ${inCart ? PN.PINK : PN.BORDER_SOFT_A}`,
        cursor:'pointer',
        transition:'transform 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
        position:'relative',
        display:'block',
        overflow:'hidden',
        alignSelf:'start',
        boxShadow: inCart
          ? '0 4px 14px rgba(255,90,95,0.14), 0 1px 2px rgba(15,17,21,0.04)'
          : '0 1px 2px rgba(15,17,21,0.05)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,17,21,0.09), 0 1px 2px rgba(15,17,21,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = inCart ? '0 4px 14px rgba(255,90,95,0.14), 0 1px 2px rgba(15,17,21,0.04)' : '0 1px 2px rgba(15,17,21,0.05)'; }}
    >
      {/* Image */}
      <div style={{
        height: 100, position:'relative',
        background: imgError ? cat.bg : '#F4F5F7',
        overflow:'hidden', flexShrink: 0,
      }}>
        {!imgError && p.img ? (
          <img
            src={p.img}
            alt=""
            onError={() => setImgError(true)}
            style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
          />
        ) : (
          <div style={{
            width:'100%', height:'100%',
            display:'grid', placeItems:'center',
            color: cat.color, fontSize: 34, fontWeight: 700,
            background: cat.bg,
          }}>{p.name.charAt(0)}</div>
        )}

        {/* qty badge */}
        {inCart && (
          <div key={qtyInCart} style={{
            position:'absolute', top: 8, left: 8,
            background: PN.PINK_DARK, color: PN.WHITE,
            padding:'3px 9px', borderRadius: 999,
            fontSize: 15, fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            animation: 'svCartBump 260ms ease-out',
          }}>×{qtyInCart}</div>
        )}

      </div>

      {/* Body */}
      <div style={{padding: '10px 13px 12px', display:'flex', flexDirection:'column', gap: 3}}>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: cat.color,
          letterSpacing: 0.5, textTransform:'uppercase',
        }}>{p.cat}</div>

        <div style={{
          fontSize: 17.5, fontWeight: 700, color: PN.TEXT,
          lineHeight: 1.25, textWrap:'pretty',
        }}>{p.name}</div>

        <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, marginTop: 6}}>€{p.price.toFixed(2)}</div>
        {/* + Aggiungi: aggiunta rapida su OGNI card, a tutta larghezza; il click
            sul piatto personalizza (se personalizzabile) o aggiunge direttamente.
            Con opzioni obbligatorie apre il popup di personalizzazione (senza
            fly-to-cart: non viene aggiunto nulla finché non si conferma). */}
        <button
          onClick={(e) => { e.stopPropagation(); if (requiresOptions) { onPersonalizza(); return; } quickAddConFeedback(); }}
          title={requiresOptions ? 'Scegli le opzioni e aggiungi' : 'Aggiungi al conto'}
          style={{
            marginTop: 9, width:'100%', height: 38, borderRadius: 10,
            background: PN.BTN_NEUTRAL, color: PN.TEXT, border:`1px solid ${PN.BORDER_LIGHT}`,
            fontSize: 16.5, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
            boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
            transition:'background 150ms ease-out, border-color 150ms ease-out',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL; e.currentTarget.style.borderColor = PN.BORDER_LIGHT; }}
        >
          <span style={{fontSize: 19, lineHeight: 1}}>+</span> Aggiungi
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Personalizzazione

function SaPersonalizzaModal({ piatto, initialMods, initialQty, onClose, onConfirm }) {
  const init = initialMods || {};
  const [variants, setVariants] = React.useState(() => {
    const out = {};
    (piatto.variants || []).forEach(g => {
      out[g.group] = init.variants?.[g.group] ?? (g.required ? null : null);
    });
    return out;
  });
  const [removed, setRemoved] = React.useState(() => init.removed || []);
  const [extras, setExtras] = React.useState(() => {
    const out = {};
    (piatto.extras || []).forEach(e => { out[e.name] = init.extras?.[e.name] || 0; });
    return out;
  });
  const [qty, setQty] = React.useState(initialQty || 1);

  const requiredOk = (piatto.variants || []).filter(g => g.required).every(g => variants[g.group] != null);

  // calcolo extra prezzo
  const variantExtra = Object.entries(variants).reduce((s, [grp, sel]) => {
    if (!sel) return s;
    const g = piatto.variants.find(v => v.group === grp);
    const opt = g?.options.find(o => o.name === sel);
    return s + (opt?.extra || 0);
  }, 0);
  const extraExtra = Object.entries(extras).reduce((s, [name, q]) => {
    const e = piatto.extras.find(x => x.name === name);
    return s + (e?.price || 0) * q;
  }, 0);
  const lineTotal = piatto.price + variantExtra + extraExtra;

  const submit = () => {
    if (!requiredOk) return;
    const mods = {
      variants: Object.fromEntries(Object.entries(variants).filter(([,v]) => v)),
      removed,
      extras: Object.fromEntries(Object.entries(extras).filter(([,v]) => v > 0)),
    };
    const hasMods = Object.keys(mods.variants).length || mods.removed.length || Object.keys(mods.extras).length;
    onConfirm(piatto, qty, hasMods ? mods : null, lineTotal);
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20,
        width: 480, maxWidth:'100%', maxHeight:'calc(var(--pn-vh, 100vh) * 0.88)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Header con immagine */}
        <div style={{position:'relative', height: 140, background: '#F4F5F7'}}>
          {piatto.img && (
            <img src={piatto.img} alt={piatto.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          )}
          <button onClick={onClose} style={{
            position:'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius:'50%',
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{padding: '14px 20px 0'}}>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform:'uppercase'}}>{piatto.cat}</div>
          <div style={{display:'flex', alignItems:'baseline', gap: 10, marginTop: 2}}>
            <span style={{fontSize: 23, fontWeight: 700, color: PN.TEXT}}>{piatto.name}</span>
            <span style={{fontSize: 18, fontWeight: 700, color: PN.MUTED, marginLeft:'auto'}}>€{piatto.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Body scrollabile */}
        <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: '16px 20px'}}>
          {/* Varianti */}
          {(piatto.variants || []).map(g => (
            <div key={g.group} style={{marginBottom: 18}}>
              <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{g.group}</span>
                {g.required && variants[g.group] == null && (
                  <span style={{fontSize: 14.5, color: PN.AMBER, fontWeight: 600}}>· Seleziona un'opzione</span>
                )}
              </div>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {g.options.map(o => {
                  const on = variants[g.group] === o.name;
                  return (
                    <button key={o.name} onClick={() => setVariants(v => ({...v, [g.group]: o.name}))} style={{
                      padding: '8px 12px', borderRadius: 999,
                      border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                      background: on ? PN.PINK_SOFT : PN.WHITE,
                      color: on ? PN.PINK_DARK : PN.TEXT,
                      fontSize: 16.5, fontWeight: 600, cursor:'pointer',
                      fontFamily:'inherit',
                    }}>
                      {o.name}{o.extra ? <span style={{color: PN.MUTED, fontWeight: 500}}> · +€{o.extra.toFixed(2)}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Ingredienti rimovibili */}
          {(piatto.ingredients || []).filter(i => i.removable).length > 0 && (
            <div style={{marginBottom: 18}}>
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Ingredienti</div>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {piatto.ingredients.filter(i => i.removable).map(ing => {
                  const isRemoved = removed.includes(ing.name);
                  return (
                    <button key={ing.name} onClick={() => setRemoved(r => isRemoved ? r.filter(x => x !== ing.name) : [...r, ing.name])} style={{
                      padding: '7px 12px', borderRadius: 999,
                      border: `1.5px solid ${isRemoved ? '#FECACA' : PN.GREEN_SOFT}`,
                      background: isRemoved ? '#FEF2F2' : PN.GREEN_SOFT,
                      color: isRemoved ? '#B91C1C' : PN.GREEN,
                      fontSize: 16.5, fontWeight: 600, cursor:'pointer',
                      fontFamily:'inherit',
                      textDecoration: isRemoved ? 'line-through' : 'none',
                      display:'inline-flex', alignItems:'center', gap: 5,
                    }}>
                      <span style={{fontSize: 15}}>{isRemoved ? '×' : '✓'}</span>
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras con stepper */}
          {(piatto.extras || []).length > 0 && (
            <div style={{marginBottom: 6}}>
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Extra</div>
              <div style={{display:'flex', flexDirection:'column', gap: 6}}>
                {piatto.extras.map(e => {
                  const q = extras[e.name] || 0;
                  return (
                    <div key={e.name} style={{
                      display:'flex', alignItems:'center', gap: 10,
                      padding:'8px 12px', borderRadius: 9,
                      background: q > 0 ? PN.PINK_SOFT : '#FAFBFC',
                      border: `1px solid ${q > 0 ? PN.PINK : PN.BORDER_SOFT}`,
                    }}>
                      <span style={{fontSize: 17, fontWeight: 600, color: PN.TEXT, flex: 1}}>{e.name}</span>
                      <span style={{fontSize: 16, color: PN.MUTED, fontWeight: 500}}>+€{e.price.toFixed(2)}</span>
                      <div style={{display:'flex', alignItems:'center', gap: 6, marginLeft: 4}}>
                        <button onClick={() => setExtras(x => ({...x, [e.name]: Math.max(0, q - 1)}))} disabled={q === 0} style={{
                          width: 24, height: 24, borderRadius:'50%',
                          background: q === 0 ? '#F4F5F7' : PN.TEXT,
                          color: q === 0 ? PN.MUTED_LIGHT : PN.WHITE,
                          border:'none', fontSize: 17, fontWeight: 700,
                          cursor: q === 0 ? 'default' : 'pointer', fontFamily:'inherit',
                        }}>−</button>
                        <span style={{minWidth: 16, textAlign:'center', fontSize: 17, fontWeight: 700}}>{q}</span>
                        <button onClick={() => setExtras(x => ({...x, [e.name]: q + 1}))} style={{
                          width: 24, height: 24, borderRadius:'50%',
                          background: PN.TEXT, color: PN.WHITE, border:'none',
                          fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        }}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: qty + add */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(15,17,21,0.08)',
          background: 'rgba(255,255,255,0.35)',
          display:'flex', alignItems:'center', gap: 12,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
              width: 34, height: 34, borderRadius:'50%',
              background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
              border: '1px solid rgba(15,17,21,0.10)', fontSize: 19, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>−</button>
            <span style={{minWidth: 22, textAlign:'center', fontSize: 19, fontWeight: 700}}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{
              width: 34, height: 34, borderRadius:'50%',
              background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
              border: '1px solid rgba(15,17,21,0.10)', fontSize: 19, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>+</button>
          </div>
          <button
            disabled={!requiredOk}
            onClick={submit}
            style={{
              flex: 1,
              padding: '12px 18px', borderRadius: 999,
              background: requiredOk ? SV_SUNSET_BG : PN.WHITE_FROST,
              color: requiredOk ? SV_SUNSET_TEXT : PN.MUTED_SOFT,
              border: `1px solid ${requiredOk ? 'transparent' : PN.BORDER_SOFT_A}`,
              fontSize: 17.5, fontWeight: 700,
              cursor: requiredOk ? 'pointer' : 'not-allowed',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
              boxShadow: requiredOk ? SV_SUNSET_SHADOW : 'none',
              transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
            }}
            onMouseEnter={e => { if (requiredOk) svSunsetHoverIn(e); }}
            onMouseLeave={svSunsetHoverOut}>
            <span>{initialMods != null || initialQty ? 'Aggiorna' : 'Aggiungi al conto'}</span>
            <span style={{fontSize: 17.5, fontWeight: 700}}>€{(lineTotal * qty).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carrello

// Il carrello è solo un carrello: articoli e totale, niente pagamenti. Un
// conto con dei soldi sopra non vive qui ma nella coda "Da saldare" —
// vedi `parcheggiaConAcconto` — perché il carrello non sopravvive a un cambio
// di sezione, e i soldi sì.
function SaCartPanel({ lines, takeaway, asportoOn = true, onToggleTakeaway, cliente, onCliente, total, totQty, onInc, onDec, onRemove, onEdit, onChangeName, onChangePrice, onClear, onIncassa, avvisoIva, onChiudiAvvisoIva }) {
  window.SALA_VENDITA_CLEAR = onClear;
  // Conferma prima di svuotare: il conto in corso è lavoro, non si butta per un click.
  const [clearConfirm, setClearConfirm] = React.useState(false);
  // Bump dell'icona quando la miniatura del piatto "atterra" (evento da SaPiattoCard)
  const [bump, setBump] = React.useState(0);
  React.useEffect(() => {
    const b = () => setBump(x => x + 1);
    window.addEventListener('sa-cart-bump', b);
    return () => window.removeEventListener('sa-cart-bump', b);
  }, []);
  return (
    <aside id="sa-cart-panel" style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
      display:'flex', flexDirection:'column', minHeight: 0, overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        display:'flex', alignItems:'center', gap: 10,
      }}>
        <span key={bump} style={{
          width: 28, height: 28, borderRadius: 8, background: PN.PINK_SOFT,
          display:'grid', placeItems:'center', color: PN.PINK_DARK,
          animation: bump ? 'svCartBump 320ms ease-out' : 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
        </span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, lineHeight: 1.2, whiteSpace:'nowrap'}}>Ordine</div>
          <div style={{fontSize: 15, color: PN.MUTED, marginTop: 1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{totQty} {totQty === 1 ? 'articolo' : 'articoli'}</div>
        </div>
        {/* Toggle asporto — c'è solo se il locale fa asporto. Acceso diventa
            la pillola nera piena del mockup.
            L'etichetta dice sempre dove ti porta il tocco, non dove sei: acceso
            è già tutto il pannello a dirlo (vuoto d'asporto, riga cliente,
            metodo di ritiro), quindi il bottone offre la via di ritorno. */}
        {asportoOn && <button
          onClick={onToggleTakeaway}
          title={takeaway ? 'Ordine da asporto. Tocca per riportarlo a vendita diretta' : 'Segna l\'ordine come da asporto. Se spento resta al banco'}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 17, 21, 0.14)'; if (!takeaway) { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; e.currentTarget.style.color = PN.TEXT; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = takeaway ? PN.TEXT : 'transparent'; e.currentTarget.style.borderColor = takeaway ? PN.TEXT : PN.BORDER; e.currentTarget.style.color = takeaway ? PN.WHITE : PN.MUTED; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            padding: '6px 12px', borderRadius: 10,
            border: `1.5px solid ${takeaway ? PN.TEXT : PN.BORDER}`,
            background: takeaway ? PN.TEXT : 'transparent',
            color: takeaway ? PN.WHITE : PN.MUTED,
            fontSize: 15, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            whiteSpace:'nowrap',
            transition:'background .12s, color .12s, border-color .12s, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 150ms ease',
          }}>
          {takeaway ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h18l-1.5-4.5A2 2 0 0 0 17.6 3H6.4a2 2 0 0 0-1.9 1.5L3 9Z"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/>
            </svg>
          )}
          {takeaway ? 'Vai a vendita diretta' : 'Vai ad asporto'}
        </button>}
        {lines.length > 0 && (
          <button onClick={() => setClearConfirm(true)} title="Rimuovi tutti gli articoli dal conto" style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background:'transparent', color: PN.MUTED, border: `1px solid ${PN.BORDER}`,
            cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        )}
      </div>

      {/* Popup conferma svuotamento conto */}
      {clearConfirm && (
        <div onClick={() => setClearConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 380, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#FEE2E2', color: '#DC2626',
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Rimuovere tutto?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  Tutti gli articoli verranno tolti dall'ordine in corso.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setClearConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { setClearConfirm(false); onClear(); }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: '#DC2626', color: '#fff',
                  border: '1px solid rgba(153,27,27,0.5)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Rimuovi tutto
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Lines */}
      <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: '12px 14px'}}>
        {/* P-108: al cambio di modo le aliquote si sono aggiornate da sole —
            una riga lo dice, in cima all'ordine, e si chiude con un tocco. */}
        {avvisoIva && lines.length > 0 && (
          <div role="status" style={{
            display:'flex', alignItems:'center', gap: 10, marginBottom: 10,
            padding:'8px 10px 8px 12px', borderRadius: 10,
            background: PN.PINK_BG_SOFT, border:`1px solid ${PN.BORDER_SOFT}`,
            fontSize: 14.5, fontWeight: 600, color: PN.TEXT, lineHeight: 1.35,
          }}>
            <span style={{flex: 1}}>{avvisoIva.asporto ? 'Ordine da asporto: le aliquote sono state aggiornate' : 'Ordine al banco: le aliquote sono state aggiornate'}</span>
            <button onClick={onChiudiAvvisoIva} title="Ho visto" style={{
              width: 26, height: 26, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'rgba(255,255,255,0.9)', color: PN.MUTED, display:'grid', placeItems:'center', flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        {lines.length === 0 ? (
          takeaway ? (
            /* Vuoto in asporto: il vuoto qui non è un errore, è il momento in
               cui si prende la comanda al telefono o al banco — quindi il testo
               ricorda anche cliente e orario, che sono già compilabili sopra. */
            <div style={{
              textAlign:'center', padding: '32px 22px', minHeight:'100%',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              boxSizing:'border-box',
            }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%', marginBottom: 16,
                background: PN.PINK_BG_SOFT, color: PN.PINK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
              </div>
              <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Ordine da asporto vuoto</div>
              <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, maxWidth: 320}}>
                Tocca <strong style={{color: PN.PINK, fontWeight: 700}}>+ Aggiungi</strong> per inserire prodotti da preparare per il ritiro.
                Puoi anche assegnare un cliente prima di confermare.
              </div>
            </div>
          ) : (
          <div style={{
            textAlign:'center', padding: '40px 20px',
            color: PN.MUTED,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
              background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
              display:'grid', placeItems:'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
            </div>
            <div style={{fontSize: 17, fontWeight: 600, color: PN.TEXT, marginBottom: 4}}>Conto vuoto</div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5}}>Tocca <strong>+ Aggiungi</strong> per aggiungere un piatto all'ordine,<br/>o clicca sul piatto per personalizzarlo prima di procedere</div>
          </div>
          )
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap: 10}}>
            {lines.map((l, i) => (
              <SaCartLine key={i} line={l}
                onInc={() => onInc(i)} onDec={() => onDec(i)}
                onRemove={() => onRemove(i)} onEdit={() => onEdit(i)}
                onChangeName={(name) => onChangeName(i, name)}
                onChangePrice={(price) => onChangePrice(i, price)}/>
            ))}
          </div>
        )}
      </div>

      {/* Il cliente del conto — chi ritira, o chi aspetta al bancone. Sta in
          fondo, appoggiato al totale: è l'ultima cosa che si compila prima di
          confermare, non la prima che si guarda quando si batte l'ordine.
          Non è più solo dell'asporto: al banco un nome serve esattamente
          quando serve in asporto — quando qualcuno aspetta e va richiamato —
          e se c'è batte il B-3 che gli daremmo noi. Resta facoltativo: su un
          caffè al volo nessuno lo chiede, e il conto resta un numero. */}
      {lines.length > 0 && (
        <div style={{padding: '0 14px 12px'}}>
          <SaClienteBar cliente={cliente} onChange={onCliente}/>
        </div>
      )}

      {/* Totale + pagamento */}
      <div style={{
        padding: '12px 18px 14px',
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        background: PN.WHITE,
      }}>
        {takeaway && lines.length > 0 ? (
          <>
            {/* Asporto pieno: riepilogo con lo scontrino e CTA rossa brand */}
            <div style={{display:'flex', alignItems:'center', gap: 12, paddingBottom: 12}}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: PN.PINK_BG_SOFT, color: PN.PINK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
              </span>
              {/* Niente conta articoli: la lista è qui sopra, e chi vuole
                  sapere quanti sono li conta guardandoli. Era un numero che
                  ripeteva una cosa già visibile, sotto a un totale che è
                  l'unica cifra per cui si guarda questa riga. */}
              <span style={{flex: 1, minWidth: 0, fontSize: 17.5, fontWeight: 700, color: PN.TEXT}}>Totale ordine</span>
              <span style={{fontSize: 22, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onIncassa}
              style={{
                width:'100%', padding: '14px 18px', borderRadius: 14,
                background: PN.BTN_BRAND, color: '#fff', border: 'none',
                fontSize: 17.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 20px -8px rgba(255,90,95,0.55)',
                transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
              }}>
              {/* Senza cifra: sta scritta grande dieci pixel più su. */}
              <span>Procedi al pagamento</span>
            </button>
          </>
        ) : (
          <>
            <div style={{
              display:'flex', justifyContent:'space-between',
              fontSize: 20, fontWeight: 700, color: PN.TEXT,
              paddingBottom: takeaway ? 4 : 12,
            }}>
              <span>Totale</span><span>€{total.toFixed(2)}</span>
            </div>
            {takeaway && (
              <div style={{
                display:'flex', alignItems:'center', gap: 6,
                fontSize: 14.5, color: PN.MUTED, paddingBottom: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18l-1.5-4.5A2 2 0 0 0 17.6 3H6.4a2 2 0 0 0-1.9 1.5L3 9Z"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 20v-6h6v6"/></svg>
                Metodo: ritiro in sede
              </div>
            )}

            <div style={{display:'flex', gap: 8, marginTop: 12}}>
              <button
                disabled={lines.length === 0}
                onClick={() => { if (lines.length > 0) onIncassa(); }}
                style={{
                  flex: 1,
                  padding: '11px 16px', borderRadius: 999,
                  background: lines.length === 0 ? PN.WHITE_FROST : SV_SUNSET_BG,
                  color: lines.length === 0 ? PN.MUTED_SOFT : SV_SUNSET_TEXT,
                  border: `1px solid ${lines.length === 0 ? PN.BORDER_SOFT_A : 'transparent'}`,
                  fontSize: 17.5, fontWeight: 700,
                  cursor: lines.length === 0 ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit',
                  display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
                  boxShadow: lines.length === 0 ? 'none' : SV_SUNSET_SHADOW,
                  transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
                }}
                onMouseEnter={e => { if (lines.length > 0) svSunsetHoverIn(e); }}
                onMouseLeave={svSunsetHoverOut}>
                <span style={{display:'inline-flex', alignItems:'center', gap: 8}}>
                  {takeaway && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
                  )}
                  Procedi al pagamento
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// Cliente dell'asporto: solo un nome, scritto a mano — chi ritira si annuncia
// col nome al banco, non serve un'anagrafica. La CTA apre il campo, Invio
// (o Conferma) assegna, Esc annulla.
function SaClienteBar({ cliente, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [nome, setNome] = React.useState('');
  const start = () => { setNome(cliente || ''); setEditing(true); };
  const commit = () => { setEditing(false); onChange(nome.trim() || null); };
  const cancel = () => setEditing(false);

  const ctaStyle = {
    padding: '8px 16px', borderRadius: 999, flexShrink: 0,
    background: PN.TEXT, color: PN.WHITE, border: 'none',
    fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      border: `1px solid ${PN.BORDER}`, borderRadius: 12,
      background: PN.WHITE,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: cliente ? PN.PINK_BG_SOFT : PN.WHITE_FROST,
        color: cliente ? PN.PINK : PN.MUTED_SOFT,
        display: 'grid', placeItems: 'center',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6"/></svg>
      </span>
      {!editing ? (
        <>
          <span style={{flex: 1, minWidth: 0}}>
            <span style={{display:'block', fontSize: 15, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {cliente || 'Cliente non assegnato'}
            </span>
            <span style={{display:'block', fontSize: 13, color: PN.MUTED_SOFT, marginTop: 1}}>
              {cliente ? 'Ritira quest\'ordine' : 'Chi viene a ritirare?'}
            </span>
          </span>
          {cliente && (
            <button
              onClick={() => onChange(null)}
              title="Togli il cliente dall'ordine"
              style={{
                padding: '8px 12px', borderRadius: 999, flexShrink: 0,
                background: 'transparent', color: PN.MUTED,
                border: `1px solid ${PN.BORDER}`,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>Rimuovi</button>
          )}
          <button
            onClick={start}
            title={cliente ? 'Cambia il cliente dell\'ordine' : 'Assegna un cliente all\'ordine'}
            style={ctaStyle}>{cliente ? 'Cambia' : 'Assegna cliente'}</button>
        </>
      ) : (
        <>
          <input
            autoFocus
            value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Nome cliente"
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
            style={{
              flex: 1, minWidth: 0,
              fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: PN.TEXT,
              background: 'transparent', border: 'none',
              borderBottom: `1.5px solid ${PN.TEXT}`, outline: 'none', padding: '0 1px',
            }}/>
          {/* onMouseDown: la conferma deve battere il blur dell'input */}
          <button onMouseDown={e => { e.preventDefault(); commit(); }} title="Assegna questo nome" style={ctaStyle}>Conferma</button>
        </>
      )}
    </div>
  );
}

function SaCartLine({ line, onInc, onDec, onRemove, onEdit, onChangeName, onChangePrice }) {
  const { piatto, qty, mods, lineTotal } = line;
  const cat = SALA_VENDITA_CATS[piatto.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const displayName = line.displayName || piatto.name;
  const isCustomizable = !!(piatto.variants?.length || piatto.ingredients?.length || piatto.extras?.length);
  // Il fuori menù si riapre nella sua finestra: nome, prezzo e tipologia.
  const isCustom = svRigaCustom(line);
  const hasMods = mods && (Object.keys(mods.variants||{}).length || (mods.removed||[]).length || Object.keys(mods.extras||{}).length);

  // Editing inline nome/prezzo: click sul testo, Enter conferma, Esc annulla.
  const [editingName, setEditingName] = React.useState(false);
  const [editingPrice, setEditingPrice] = React.useState(false);
  const [nameVal, setNameVal] = React.useState(displayName);
  const [priceVal, setPriceVal] = React.useState(lineTotal.toFixed(2));

  React.useEffect(() => { if (!editingName) setNameVal(displayName); }, [displayName, editingName]);
  React.useEffect(() => { if (!editingPrice) setPriceVal(lineTotal.toFixed(2)); }, [lineTotal, editingPrice]);

  const commitName = () => {
    setEditingName(false);
    const v = nameVal.trim();
    if (v && v !== displayName) onChangeName(v);
    else setNameVal(displayName);
  };
  const commitPrice = () => {
    setEditingPrice(false);
    const v = parseFloat(priceVal.replace(',', '.'));
    if (!isNaN(v) && v >= 0) onChangePrice(v);
    else setPriceVal(lineTotal.toFixed(2));
  };

  const inlineInputStyle = {
    border:'none', borderBottom:`1.5px solid ${PN.TEXT}`, outline:'none',
    background:'transparent', fontFamily:'inherit',
    fontSize:18, fontWeight:700, color: PN.TEXT, padding:'0 1px',
  };

  // Mods in riga sotto il nome ("Media · Filetto"): le scelte in grigio, le
  // rimozioni in rosso, gli extra in verde — il colore È l'informazione, il
  // separatore è neutro così la riga non diventa una collana di puntini scuri.
  const modParts = !hasMods ? [] : [
    ...Object.entries(mods.variants || {}).map(([g, v]) => ({ key: `v-${g}`, text: v, color: PN.MUTED })),
    ...(mods.removed || []).map(r => ({ key: `r-${r}`, text: `− ${r}`, color: '#B91C1C' })),
    ...Object.entries(mods.extras || {}).map(([n, q]) => ({ key: `e-${n}`, text: `+ ${q > 1 ? `${q}× ` : ''}${n}`, color: PN.GREEN })),
  ];

  return (
    <div style={{
      display:'flex', gap: 13,
      padding: 12, borderRadius: 14,
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: PN.CARD_SHADOW,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: 12, flexShrink: 0,
        background: cat.bg, overflow:'hidden',
        display:'grid', placeItems:'center', alignSelf:'flex-start',
      }}>
        {piatto.img
          ? <img src={piatto.img} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          : <span style={{fontSize: 40}}>{piatto.emoji || '🍽'}</span>}
      </div>
      <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
          {editingName ? (
            <input
              value={nameVal} onChange={e => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => { if (e.key==='Enter') commitName(); if (e.key==='Escape') { setNameVal(displayName); setEditingName(false); } }}
              autoFocus
              style={{...inlineInputStyle, flex: 1, minWidth: 0, width:'100%'}}
            />
          ) : (
            <span
              onClick={() => (isCustomizable || isCustom) ? onEdit() : setEditingName(true)}
              title={isCustom ? 'Clicca per modificare nome, prezzo e tipologia' : isCustomizable ? 'Clicca per personalizzare' : 'Clicca per modificare il nome'}
              style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer', userSelect:'none', lineHeight: 1.3}}
            >{displayName}</span>
          )}
          {editingPrice ? (
            <input
              value={priceVal} onChange={e => setPriceVal(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={e => { if (e.key==='Enter') commitPrice(); if (e.key==='Escape') { setPriceVal(lineTotal.toFixed(2)); setEditingPrice(false); } }}
              autoFocus
              inputMode="decimal"
              style={{...inlineInputStyle, fontSize: 19, width: 76, textAlign:'right', fontVariantNumeric:'tabular-nums'}}
            />
          ) : (
            <span
              onClick={() => setEditingPrice(true)}
              title="Clicca per modificare il prezzo"
              style={{fontSize: 19, fontWeight: 700, color: PN.TEXT, cursor:'text', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}
            >€{(lineTotal * qty).toFixed(2)}</span>
          )}
        </div>
        {modParts.length > 0 && (
          <div style={{fontSize: 15.5, fontWeight: 500, marginTop: 2, lineHeight: 1.4, overflow:'hidden', textOverflow:'ellipsis'}}>
            {modParts.map((p, i) => (
              <React.Fragment key={p.key}>
                {i > 0 && <span style={{color: PN.MUTED_LIGHT}}> · </span>}
                <span style={{color: p.color}}>{p.text}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        {/* P-108 (D-105): accanto al nome resta il piccolo contrassegno con
            l'aliquota APPLICATA — un dato fiscale congelato alla battuta, che
            discende da tipologia × modo e cambia da solo al cambio di modo.
            Il titolo dice la tipologia e il perché. */}
        {line.aliquota != null && (() => {
          const t = window.pnTipologia && window.pnTipologia(line.tipologia);
          return (
            <div style={{marginTop: 4}}>
              <span title={t ? `${t.label} — ${window.pnTipologiaSpiegazione(t.id)}` : undefined} style={{
                display:'inline-block', padding:'2px 8px', borderRadius: 6,
                background:'#F4F5F7', border:`1px solid ${PN.BORDER_SOFT}`,
                fontSize: 12.5, fontWeight: 600, color: PN.MUTED,
              }}>IVA {line.aliquota}%{isCustom && t ? ` · ${t.label}` : ''}</span>
            </div>
          );
        })()}
        <div style={{display:'flex', alignItems:'center', gap: 11, marginTop: 8}}>
          <button onClick={onDec} title={qty <= 1 ? 'Rimuovi dall\'ordine' : 'Diminuisci quantità'} style={{
            width: 30, height: 30, borderRadius:'50%',
            background: PN.PINK_BG_SOFT, color: PN.PINK, border:'none',
            fontSize: 18, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>−</button>
          <span style={{fontSize: 18, fontWeight: 700, minWidth: 18, textAlign:'center'}}>{qty}</span>
          <button onClick={onInc} title="Aumenta quantità" style={{
            width: 30, height: 30, borderRadius:'50%',
            background: PN.PINK_BG_SOFT, color: PN.PINK, border:'none',
            fontSize: 18, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>+</button>
        </div>
        <div style={{display:'flex', alignItems:'flex-end', gap: 8, marginTop: 7}}>
          {/* Una parola sola per tutti: "Personalizza", e porta sempre nella
              personalizzazione dell'articolo. "Rinomina" era un'altra azione
              con un altro esito nello stesso posto, e per capire quale ti
              toccava dovevi ricordarti se quel piatto avesse delle opzioni —
              cosa che si scopre solo aprendo. Un caffè si personalizza poco,
              ma il posto dove provarci è uno. */}
          <button
            onClick={onEdit}
            title={isCustom ? 'Modifica nome, prezzo e tipologia' : 'Personalizza questo articolo'}
            style={{
              display:'inline-flex', alignItems:'center', gap: 7,
              background:'transparent', border:'none', padding: '4px 0',
              color: PN.MUTED, fontSize: 15.5, fontWeight: 600,
              cursor:'pointer', fontFamily:'inherit',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            {isCustom ? 'Modifica' : 'Personalizza'}
          </button>
          <span style={{flex: 1}}/>
          <button onClick={onRemove} title="Rimuovi dall'ordine" style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: PN.WHITE_FROST, color: PN.MUTED,
            border: `1px solid ${PN.BORDER_HAIR}`,
            cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Finestra Incassa — lingua e pezzi propri.
// Gli importi qui si scrivono all'italiana (14,00): è la cifra che l'operatore
// legge ad alta voce al cliente, non un numero da tabella.

const SVI_INK    = '#0F1729';
const SVI_MUTED  = '#7A8394';
const SVI_BORDER = '#E7EAEF';
const SVI_CORAL  = PN.PINK;
const SVI_TINT   = '#FFF3F2';
const SVI_GREEN  = '#16A34A';
const SVI_LABEL  = {
  fontSize: 13.5, fontWeight: 700, color: SVI_MUTED,
  letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8,
};

const svEur = (n, tondo) => '€' + (tondo && Math.abs(n % 1) < 0.005
  ? String(Math.round(n))
  : (n || 0).toFixed(2).replace('.', ','));

// Tagli di cortesia: le banconote che il cliente può realisticamente porgere
// per quella cifra. Niente "esatto" — il campo ci nasce già sopra.
const svTagli = (residuo) => {
  const out = [];
  for (const s of [5, 10, 20, 50, 100]) {
    const v = Math.ceil(residuo / s) * s;
    if (v <= residuo + 0.004 || out.includes(v)) continue;
    out.push(v);
    if (out.length === 3) break;
  }
  return out;
};

// Interruttore da testata: piccolo, in disparte, acceso quando conta.
function SvPillola({ active, onClick, title, icon, label }) {
  return (
    <button onClick={onClick} title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
      padding: '8px 12px', borderRadius: 999,
      background: active ? SVI_TINT : '#fff',
      border: `1px solid ${active ? SVI_CORAL : SVI_BORDER}`,
      color: active ? SVI_CORAL : SVI_MUTED,
      fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      transition: 'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    }}>
      {icon}
      {label}
    </button>
  );
}

// Compatta: il modale INCASSA deve stare tutto in vista senza scroll, e le
// due tessere erano la voce più alta del coro.
function SvMetodoCard({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 14,
      background: active ? SVI_TINT : '#fff',
      border: `1.5px solid ${active ? SVI_CORAL : SVI_BORDER}`,
      color: active ? SVI_CORAL : SVI_INK,
      fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    }}>
      {active && (
        <span style={{
          position: 'absolute', top: 9, right: 9,
          width: 22, height: 22, borderRadius: '50%',
          background: SVI_CORAL, color: '#fff',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
        </span>
      )}
      {icon}
      {label}
    </button>
  );
}

const SvIcoPos = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2.5"/>
    <rect x="7.5" y="4.5" width="9" height="4.5" rx="1"/>
    <circle cx="9" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="12.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="15.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="18.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="18.5" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);

const SvIcoBanconota = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="8.5" cy="12" r="2.6"/>
    <path d="M7.4 12h2.2M7.6 10.9h1.8"/>
    <circle cx="17.5" cy="12" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);

const SvIcoMonete = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={SVI_CORAL} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="6" rx="7.5" ry="3"/>
    <path d="M4.5 6v4.5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6"/>
    <path d="M4.5 10.5V15c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-4.5"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Modale incasso semplificato (solo totale + pagamento)

function SaIncassaModal({ open, total: subtotale, onClose, onConfirm, pagamenti: pagamentiConto, onPagamenti, onAcconto, lines, takeaway }) {
  const [method, setMethod] = React.useState('contanti');
  // Incasso a più riprese: il residuo è quello che manca, non il totale. Chi
  // paga metà in contanti e metà col POS non sceglie un metodo "misto" — fa
  // due incassi, e la finestra tiene il conto.
  // Gli acconti già presi su questo conto, in ordine di arrivo: non un totale
  // ma le righe, perché la domanda al banco è "cosa mi ha già dato?".
  //
  // Le righe appartengono sempre al conto, mai a questa finestra: un ordine in
  // coda se le porta dietro e ce le riscrive. Il carrello di cassa invece non
  // è un conto e non può tenerle — non sopravvive a un cambio di sezione —
  // quindi al primo acconto passa `onAcconto` e diventa un ordine in coda.
  const [pagamentiLocali, setPagamentiLocali] = React.useState([]);
  const contoEsterno = !!onPagamenti;
  const pagamenti = contoEsterno ? (pagamentiConto || []) : pagamentiLocali;
  const setPagamenti = onPagamenti || setPagamentiLocali;
  const [importoTxt, setImporto] = React.useState('');
  const [ricevutoTxt, setRicevuto] = React.useState(null);
  // Da dove arriva il contante ricevuto: un taglio, o la casella libera.
  // La differenza serve solo alla casella — se la cifra l'ha messa un
  // pulsante lì non va riscritta, altrimenti lo stesso numero compare due
  // volte nella stessa fila, una nel chip acceso e una nel campo accanto.
  // È un dato a parte e non un confronto sul valore: uguagliando i numeri, la
  // casella si svuoterebbe mentre si scrive — «150» sparisce passando da 15.
  const [ricevutoDaTaglio, setRicevutoDaTaglio] = React.useState(false);
  const scegliTaglio   = (txt) => { setRicevuto(txt); setRicevutoDaTaglio(true); };
  const scriviRicevuto = (txt) => { setRicevuto(txt); setRicevutoDaTaglio(false); };
  // Quale pulsante di «Quanto incassi ora» è attivo: 'tutto', 'meta' o
  // 'altro'. È una SCELTA esplicita, non un confronto col valore del campo:
  // con l'uguaglianza numerica «Cifra personalizzata» non si accendeva mai
  // (il campo conteneva ancora il valore di Tutto), e dopo una modifica a
  // mano Metà restava accesa o si spegneva a caso.
  const [quota, setQuota] = React.useState('tutto');
  const importoRef = React.useRef(null);
  const ricevutoRef = React.useRef(null);
  // Fattura: non è più un interruttore ma il cliente, o niente. Un booleano
  // diceva "sì, fattura" senza sapere a chi, e a chi la si fa è l'unica cosa
  // che il documento non può dedurre da solo.
  const [fattura, setFattura] = React.useState(null);
  const [fatturaOpen, setFatturaOpen] = React.useState(false);
  // Il numero nasce alla chiusura dell'incasso, insieme all'invio: prima non
  // esiste, così una fattura abbandonata non lascia un buco nella numerazione.
  const [numeroFattura, setNumeroFattura] = React.useState(null);
  const [done, setDone] = React.useState(false);
  const [adjust, setAdjust] = React.useState(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [confirmedTotal, setConfirmedTotal] = React.useState(0);
  const [confirmedPay, setConfirmedPay] = React.useState({ contanti: 0, carta: 0 });
  const [confirmedResto, setConfirmedResto] = React.useState(0);
  // Ordine creato dal commit: lo restituisce onConfirm. Null quando l'incasso
  // non crea un ordine nuovo (es. il "Salda ora" di un asporto già esistente).
  const [ordine, setOrdine] = React.useState(null);
  // Pagamento con carta in volo su Byup Staff. Stessa coda della finestra di
  // saldo in Sala, ma qui l'attesa è BLOCCANTE: al tavolo il conto è attaccato
  // a un tavolo che resta, quindi la cassa può chiudere e tornare a lavorare;
  // al banco il cliente è davanti, il carrello vive solo qui dentro e l'ordine
  // non esiste ancora. Lasciar chiudere significherebbe due vendite in volo su
  // una cassa sola, e un pagamento senza più niente a cui attaccarsi.
  const [attesa, setAttesa] = React.useState(null); // { inviato } | null

  // Finestra di divieto notturna (P-100): fra le 23:55 e le 00:00 il canale
  // non trasmette, quindi qui non si emette niente — scontrini E fatture,
  // perché la fattura immediata parte dentro `chiudiPagamento`, cioè dallo
  // stesso bottone. Il tick al secondo tiene vivi countdown, ingresso nella
  // finestra a modale aperta e ripresa automatica a mezzanotte. La
  // definizione di byupNotteInfo sta in sala-salda-modal.jsx.
  const notte = window.byupNotteInfo();
  const [, setNotteTick] = React.useState(0);
  // P-120: la guardia delle credenziali dell'Agenzia, accanto a quella della
  // notte. Scadute, il documento non può nascere: il pulsante si spegne e il
  // testo dice chi deve rinnovare (il titolare, o l'incaricato del locale).
  const [credBlocco, setCredBlocco] = React.useState(() => (window.byupAdeCredBlocco ? window.byupAdeCredBlocco() : null));
  React.useEffect(() => {
    const ri = () => setCredBlocco(window.byupAdeCredBlocco ? window.byupAdeCredBlocco() : null);
    ['byup-ade-cred-change', 'byup-ade-incaricato-change', 'storage'].forEach(e => window.addEventListener(e, ri));
    return () => ['byup-ade-cred-change', 'byup-ade-incaricato-change', 'storage'].forEach(e => window.removeEventListener(e, ri));
  }, []);
  React.useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNotteTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [open]);

  // Storno di UN incasso già preso, non del conto intero: il cliente ha dato
  // due volte, o si è battuto l'importo sbagliato, e va tolta quella riga lì.
  // Non è il rimborso di Contabilità — quello è un documento su una vendita
  // chiusa. Qui il conto è ancora aperto e il denaro non è ancora diventato
  // uno scontrino: si sta correggendo la cassa mentre la si fa.
  //
  // Una sola variabile con dentro la fase, e non tre booleani: le fasi sono
  // in fila (conferma → attesa → fatto) e due di loro non possono coesistere.
  const [storno, setStorno] = React.useState(null); // { p, fase, inviato } | null

  // Il contante torna dal cassetto e basta: lo sa l'operatore, non il sistema.
  // Sul POS invece la restituzione è una transazione vera, che parte sul
  // telefono e ci mette il suo tempo — per questo passa da un'attesa.
  const applicaStorno = React.useCallback((p) => {
    setPagamenti(ps => ps.filter(x => x.id !== p.id));
    setStorno({ p, fase: 'fatto' });
  }, [setPagamenti]);

  // Il tocco sull'icona non storna: apre la domanda. Sono soldi, e il gesto
  // per sbaglio su una riga alta venti pixel è troppo facile.
  function stornaPagamento(p) { setStorno({ p, fase: 'conferma' }); }

  React.useEffect(() => {
    if (!storno || storno.fase !== 'attesa') return;
    const id = setInterval(() => {
      if (Date.now() - storno.inviato >= PAY_FINE) applicaStorno(storno.p);
    }, 400);
    return () => clearInterval(id);
  }, [storno, applicaStorno]);

  React.useEffect(() => {
    if (open) {
      setMethod('contanti');
      // Solo gli acconti di questa finestra si azzerano riaprendo. Quelli del
      // conto stanno fuori e devono ritrovarsi dov'erano: è tutto il punto.
      if (!contoEsterno) setPagamentiLocali([]);
      setImporto('');
      setFattura(null);
      setFatturaOpen(false);
      setNumeroFattura(null);
      setDone(false);
      setOrdine(null);
      setAdjust(null);
      setAdjustOpen(false);
      setAttesa(null);
      setStorno(null);
    }
  }, [open]);

  // Il contatore che scorre e il finto esito vivono qui dentro, non fuori come
  // in Sala: lì la finestra può chiudersi e il pagamento le sopravvive, qui la
  // finestra non si chiude finché non è finita, quindi può possederne il ciclo.
  React.useEffect(() => {
    if (!attesa) return;
    const id = setInterval(() => {
      if (Date.now() - attesa.inviato >= PAY_FINE) registraIncasso(attesa.importo, 'carta');
    }, 400);
    return () => clearInterval(id);
  }, [attesa]);

  // Calcolo aggiustamento
  let naturalTotal = subtotale;
  let adjustLabel = null;
  let adjustDelta = 0;
  if (adjust) {
    if (adjust.type === 'sconto-eur') {
      adjustDelta = -Math.min(adjust.val || 0, subtotale);
      naturalTotal = subtotale + adjustDelta;
      adjustLabel = `Sconto · −€${(-adjustDelta).toFixed(2)}`;
    } else if (adjust.type === 'sconto-pct') {
      adjustDelta = -(subtotale * (adjust.val || 0) / 100);
      naturalTotal = subtotale + adjustDelta;
      adjustLabel = `Sconto ${adjust.val}% · −€${(-adjustDelta).toFixed(2)}`;
    }
    // Qui stavano anche 'arrotonda' e 'custom': il pannello che li produceva
    // è uno solo e vive in sala-salda-modal.jsx, e quelle due voci non ci
    // sono più. Tenerne il calcolo qui vorrebbe dire lasciare in piedi due
    // rami che nessuno può più raggiungere.
  }
  const finalTotal = Math.max(0, naturalTotal);

  const incassato = pagamenti.reduce((t, p) => t + p.importo, 0);
  const incassatoCarta = pagamenti.reduce((t, p) => t + (p.come === 'carta' ? p.importo : 0), 0);
  const residuo = Math.max(0, finalTotal - incassato);
  // Conto coperto: gli acconti presi bastano, o avanzano. Non è la stessa cosa
  // di un conto vuoto — lì non c'è niente da incassare perché non c'è niente,
  // qui perché è già stato incassato tutto — e va detto con parole diverse,
  // altrimenti la cassa legge un errore dove c'è una vendita finita.
  // Ci si arriva da uno sconto applicato dopo un acconto, o da articoli tolti
  // dal conto: pagare esatto non passa mai di qui, chiude e basta.
  const saldato = finalTotal > 0.004 && residuo <= 0.004;
  // Quello che è entrato oltre il dovuto. Sono soldi del cliente: tacerli qui
  // significa tenerli, e questa è l'ultima schermata prima che il conto sparisca.
  const eccedenza = Math.max(0, incassato - finalTotal);
  // Il campo parte sul residuo: il caso normale è che paghi tutto, e chi paga
  // con un taglio più grande (o addebita solo una parte sulla carta) lo scrive
  // o tocca un pulsante.
  const importo = parseFloat((importoTxt || '').replace(',', '.')) || 0;
  // Quello che entra davvero in cassa: sopra il residuo non si incassa, si
  // rende. Sulla carta l'eccedenza non esiste — si addebita e basta.
  const preso = Math.min(importo, residuo);
  const residuoDopo = Math.max(0, residuo - preso);
  const parziale = preso > 0 && preso < residuo - 0.004;

  // Quanto incassi e quanto il cliente ti mette in mano sono due cifre, non
  // una: 35 su un residuo di 100 si pagano benissimo con una banconota da 50.
  // Finché erano lo stesso campo il resto poteva nascere solo sforando il
  // residuo, quindi su un acconto non esisteva proprio.
  // `null` = esatto, cioè segue l'importo senza che nessuno lo tocchi: il caso
  // normale non chiede niente in più a chi sta al banco.
  const ricevuto = ricevutoTxt === null
    ? preso
    : parseFloat((ricevutoTxt || '').replace(',', '.')) || 0;
  // Una sola cosa accesa per volta in quella fila: o un taglio, o la casella.
  // Senza questo, scrivendo «10,00» a mano si accendevano sia il pulsante €10
  // sia la casella, e la riga mostrava lo stesso importo due volte.
  const ricevutoLibero = ricevutoTxt !== null && !ricevutoDaTaglio;
  const resto = method === 'carta' ? 0 : Math.max(0, ricevuto - preso);
  // Il contante in mano non copre nemmeno quello che stai incassando: non è un
  // resto, è un incasso che non si può chiudere.
  const manca = method === 'carta' ? 0 : Math.max(0, preso - ricevuto);

  // Sopra: quanto togli dal conto. Tutto è il caso normale, Metà il conto
  // diviso in due — sotto i 5 euro è una cifra che non paga nessuno.
  const quote = [
    { k: 'tutto', label: 'Tutto', val: residuo },
    ...(residuo >= 5 ? [{ k: 'meta', label: 'Metà', val: Math.round(residuo * 50) / 100 }] : []),
  ];
  // Sotto: le banconote che il cliente può porgere, calcolate su quello che
  // stai incassando e non sul residuo. Se incassi 35, i tagli sono 40/50/100:
  // quelli del residuo da 100 non li porge nessuno per un acconto.
  const tagli = method === 'carta' || preso <= 0
    ? []
    : [
        { label: 'Esatto', val: preso },
        ...svTagli(preso).map(v => ({ label: svEur(v, true), val: v })),
      ];

  // I campi si riallineano al residuo quando cambia la partita: apertura,
  // metodo, acconto incassato, sconto applicato.
  React.useEffect(() => {
    if (!open) return;
    setImporto(residuo > 0 ? residuo.toFixed(2).replace('.', ',') : '');
    scriviRicevuto(null);
    setQuota('tutto');
  }, [open, method, pagamenti.length, finalTotal]);

  // Tutti gli hook sono passati: solo ora si può uscire senza disegnare nulla.
  if (!open) return null;

  function chooseMethod(m) { setMethod(m); }

  // Un incasso registrato: se copre il residuo la vendita si chiude, se no
  // resta aperta e il residuo scende — l'acconto è una riga, non un'altra
  // finestra.
  function registraIncasso(val, come) {
    const quota = Math.min(val, residuo);
    if (quota < residuo - 0.004) {
      const now = new Date();
      const riga = {
        id: `p${pagamenti.length + 1}`, come, importo: quota,
        ora: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      };
      // Chiude l'attesa del POS anche quando l'incasso è solo un acconto.
      // Prima la spegneva solo `chiudiPagamento`, cioè il ramo del saldo
      // pieno: un acconto sulla carta lasciava la finestra ferma su «In
      // attesa» per sempre, col contatore che correva su un pagamento che
      // era già arrivato. A pagare col POS metà conto ci si incastrava.
      setAttesa(null);
      // Il carrello non è un posto dove lasciare dei soldi: chi lo possiede
      // se li prende e ne fa un conto in coda. Chi invece è già un conto —
      // un ordine — se li tiene.
      if (onAcconto) onAcconto(riga, finalTotal);
      else setPagamenti(ps => [...ps, riga]);
      return;
    }
    chiudiPagamento(come, quota);
  }

  // Unico punto in cui l'incasso si chiude e l'ordine nasce: ci passano sia la
  // conferma diretta (contanti, misto) sia il ritorno del pagamento con carta.
  function chiudiPagamento(come, quota) {
    const ultima = quota != null ? quota : residuo;
    // Invio immediato: la fattura parte qui, non prima. È l'istante in cui si
    // sa COME ha pagato, e la modalità (MP01 contanti, MP08 carta) è l'unico
    // pezzo del documento che non si poteva sapere mentre lo si compilava.
    // Quello che si scrive qui è esattamente quello che Contabilità → Fatture
    // elenca: stesso numero, stesso cliente, stesse righe.
    if (fattura && !numeroFattura) {
      const numero = svfNumeroFattura();
      setNumeroFattura(numero);
      if (window.byupSaveFattura) {
        window.byupSaveFattura({
          id: numero, numero, data: new Date().toISOString(),
          stato: 'in_attesa', cliente: fattura,
          canale: takeaway ? 'asporto' : 'somministrazione',
          pagamento: come === 'carta' ? 'carta' : 'contanti',
          righe: svfRighe(lines, takeaway),
          riepilogo: svRiepilogoIva(lines, takeaway),
          totale: finalTotal,
        });
      }
    }
    setConfirmedTotal(finalTotal);
    setConfirmedPay({
      contanti: (incassato - incassatoCarta) + (come === 'carta' ? 0 : ultima),
      carta: incassatoCarta + (come === 'carta' ? ultima : 0),
    });
    // Nei casi normali è zero: l'incasso è clampato al residuo e non lo supera
    // mai. Vale per il conto già coperto, ed è l'ultima volta che se ne può
    // parlare — subito dopo il conto non esiste più.
    setConfirmedResto(Math.max(0, incassato + ultima - finalTotal));
    setOrdine(onConfirm ? onConfirm(finalTotal) : null);
    setAttesa(null);
    setDone(true);
  }

  return (
    <>
    {/* Con un pagamento in volo il click fuori non chiude: sarebbe l'unico modo
        di uscire per sbaglio da una transazione che il cliente sta pagando. */}
    <div onClick={(attesa || storno) ? undefined : onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,14,24,0.62)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff',
        borderRadius: 26,
        width: 620, maxWidth: '100%', maxHeight: '100%',
        boxShadow: '0 32px 80px rgba(5,10,25,0.45)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Lo storno prende tutta la finestra, come l'incasso e come l'attesa:
            è la stessa scelta di sempre in questo file — invece di spegnere
            lista, metodi e pulsante uno per uno, non c'è proprio nient'altro
            sullo schermo. Chi lo sta facendo non deve poter fare altro. */}
        {storno ? (
          <SvStorno
            p={storno.p}
            fase={storno.fase}
            onConferma={() => {
              if (storno.p.come === 'carta') setStorno({ ...storno, fase: 'attesa', inviato: Date.now() });
              else applicaStorno(storno.p);
            }}
            onChiudi={() => setStorno(null)}/>
        ) : done ? (
          <div style={{
            padding: '36px 28px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#DCFCE7', color: '#16A34A',
              display: 'grid', placeItems: 'center', marginBottom: 16,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13 L9 17 L19 7"/>
              </svg>
            </div>
            <div style={{ fontSize: 25, fontWeight: 800, color: SVI_INK, marginBottom: 4, letterSpacing: -0.4 }}>
              Pagamento incassato
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: SVI_INK, marginBottom: 6, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>
              {svEur(confirmedTotal)}
            </div>
            <div style={{ fontSize: 17, color: SVI_MUTED, marginBottom: confirmedResto > 0.004 ? 14 : (ordine ? 16 : 24) }}>
              {confirmedPay.contanti > 0 && confirmedPay.carta > 0
                ? `${svEur(confirmedPay.contanti)} contanti + ${svEur(confirmedPay.carta)} sul POS`
                : confirmedPay.carta > 0 ? 'Smart POS' : 'Contanti'}
            </div>
            {/* Il promemoria sopravvive alla chiusura del conto: fra il tocco
                sul pulsante e la mano nel cassetto passa qualche secondo, e
                questa schermata è quello che si ha davanti in quei secondi. */}
            {confirmedResto > 0.004 && (
              <div style={{
                width: '100%', marginBottom: ordine ? 16 : 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '11px 16px', borderRadius: 12, background: '#FEF3C7',
              }}>
                <SvIcoMonete size={22}/>
                <span style={{ fontSize: 16.5, color: '#B45309' }}>Da restituire al cliente</span>
                <span style={{
                  fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: '#B45309',
                  fontVariantNumeric: 'tabular-nums',
                }}>{svEur(confirmedResto)}</span>
              </div>
            )}
            {/* La fattura è partita davvero: numero e destinatario si leggono
                qui perché è l'unico momento in cui l'operatore può ancora dire
                "no, aspetta" al cliente che ha davanti. Lo SdI però risponde
                con comodo — può scartare fino a cinque giorni dopo — quindi
                "inviata" e non "accettata". */}
            {fattura && (
              <div style={{
                width: '100%', marginBottom: 16, padding: '11px 16px',
                borderRadius: 12, background: '#F5F6F8', border: `1px solid ${SVI_BORDER}`,
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0F1115' }}>
                    Fattura <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{numeroFattura}</span> inviata
                  </div>
                  <div style={{
                    fontSize: 15, color: SVI_MUTED, marginTop: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{svfNome(fattura)}</div>
                </div>
                <span style={{
                  fontSize: 13.5, fontWeight: 700, padding: '4px 9px', borderRadius: 7,
                  background: '#FEF3C7', color: '#B45309', flexShrink: 0,
                }}>In attesa SdI</span>
              </div>
            )}
            {/* Conferma della creazione: è l'unico punto in cui l'operatore vede
                che l'ordine esiste ed è partito. Senza, l'incasso sembra
                chiudere la transazione e basta. */}
            {ordine && (
              <div style={{
                width: '100%', marginBottom: 24,
                padding: ordine.codiceRitiro ? '12px 16px' : '10px 16px',
                borderRadius: 12, background: '#F5F6F8',
                border: `1px solid ${SVI_BORDER}`,
              }}>
                <div style={{ fontSize: 17, color: '#0F1115', fontWeight: 600 }}>
                  Ordine <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{ordine.codice}</span> creato
                </div>
                {/* Asporto: il codice va dettato al cliente, quindi grande e leggibile */}
                {ordine.codiceRitiro && (
                  <div style={{
                    marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(15,17,21,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: '#6B7280', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                      Codice ritiro
                    </span>
                    <span style={{
                      fontSize: 24, fontWeight: 800, color: '#0F1115',
                      letterSpacing: 3, fontVariantNumeric: 'tabular-nums',
                    }}>{ordine.codiceRitiro}</span>
                  </div>
                )}
              </div>
            )}
            <button onClick={onClose} style={{
              width: '100%', padding: '15px 24px',
              background: SVI_GREEN, color: '#fff',
              border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 700,
              boxShadow: '0 8px 20px -8px rgba(22,163,74,0.55)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>Chiudi</button>
          </div>
        ) : attesa ? (
          <SvAttesaPagamento
            total={attesa.importo != null ? attesa.importo : finalTotal}
            onRitira={() => setAttesa(null)}/>
        ) : (
          <>
            {/* Testata: solo i bordi della schermata. A sinistra la via
                d'uscita, a destra i due interruttori che NON sono la vendita
                — sconto e fattura, che si usano di rado.
                L'uscita sta a sinistra e non in fondo: è l'unica cosa qui
                dentro con una conseguenza, e stare attaccata alla CTA voleva
                dire regalare un click sbagliato a ogni incasso. Angolo opposto,
                posizione standard del "torna indietro", e dice dove riporta.
                Il titolo "INCASSA" è sparito: lo dice già l'etichetta sopra
                il numero, e ripeterlo era una riga rubata al respiro. */}
            <div style={{padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 8}}>
              {/* Due uscite diverse perché succedono due cose diverse.
                  Dal carrello non è ancora successo niente: si torna indietro
                  e l'ordine è lì come l'avevi lasciato — "Torna all'ordine",
                  con la parola che il pannello del carrello usa già per sé.
                  Su un conto che vive in coda uscire non è tornare indietro,
                  è rimandare: "Salda dopo" dice il tempo invece del posto, che
                  è quello che pensa chi lo preme — il cliente si è spostato,
                  ci torno. In ambra perché lascia una cosa aperta, ed è la
                  stessa ambra con cui quel conto ti aspetterà in coda. */}
              <button onClick={onClose}
                title={contoEsterno
                  ? 'Esci: il conto resta in Da saldare, con quello che hai già incassato'
                  : 'Torna all\'ordine senza incassare'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  padding: '8px 14px 8px 10px', borderRadius: 999,
                  background: contoEsterno ? PN.AMBER_SOFT : 'transparent',
                  border: `1px solid ${contoEsterno ? 'transparent' : SVI_BORDER}`,
                  color: contoEsterno ? '#92400E' : SVI_MUTED,
                  fontSize: 14.5, fontWeight: 700,
                  fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'background 150ms ease-out, color 150ms ease-out',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = contoEsterno ? '#FDE9B8' : '#F5F6F8';
                  if (!contoEsterno) e.currentTarget.style.color = SVI_INK;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = contoEsterno ? PN.AMBER_SOFT : 'transparent';
                  if (!contoEsterno) e.currentTarget.style.color = SVI_MUTED;
                }}>
                {contoEsterno ? (
                  /* Un orologio: quello che rimandi è il momento, non il posto. */
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                )}
                {contoEsterno ? 'Salda dopo' : 'Torna all\'ordine'}
              </button>
              <span style={{flex: 1}}/>
              <SvPillola
                active={adjustOpen || !!adjust}
                onClick={() => setAdjustOpen(o => !o)}
                title="Applica uno sconto in euro o in percentuale"
                icon={<span style={{fontSize: 13, fontWeight: 800, lineHeight: 1}}>%</span>}
                label={adjust ? svEur(Math.abs(adjustDelta)) : 'Sconto'}/>
              {/* Accesa, la pillola porta il nome del cliente e non la parola
                  "Fattura": la domanda che ci si fa rileggendo la testata non è
                  se la fattura c'è, è a chi si sta facendo. */}
              <SvPillola
                active={!!fattura}
                onClick={() => setFatturaOpen(true)}
                title={fattura ? `Fattura a ${svfNome(fattura)}` : 'Emetti fattura invece della ricevuta'}
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="2"/><path d="M6 16h12v5H6z"/></svg>}
                label={fattura
                  ? (svfNome(fattura).length > 16 ? svfNome(fattura).slice(0, 15) + '…' : svfNome(fattura))
                  : 'Fattura'}/>
            </div>

            <div className="pn-scroll" style={{overflow: 'auto'}}>
              {/* ── HERO: la cifra che si dice ad alta voce al cliente.
                  Ha un'etichetta, e non l'aveva: un numero grande da solo,
                  con una matita accanto, non dichiara di essere il conto — e
                  infatti il conto sembrava non esserci. Ora "DA INCASSARE"
                  lo nomina, e sotto compare l'aritmetica solo quando serve.

                  Di default NON è un campo. Prima lo era, e quel dettaglio
                  costava caro: il numero più grande della schermata era un
                  input che assomigliava al conto senza esserlo. Modificarlo
                  è diventata un'azione dichiarata, sotto la CTA.

                  Col conto già coperto tutto questo non ha più un lavoro: al
                  suo posto il fatto — è saldato — e quanto va restituito. */}
              {saldato ? (
                <SvContoSaldato total={finalTotal} eccedenza={eccedenza}/>
              ) : (
              <div style={{padding: '22px 28px 0', textAlign: 'center'}}>
                <div style={{...SVI_LABEL, marginBottom: 6}}>Incassi ora</div>

                {/* Il numero si cambia toccandolo, e basta. Prima stava dietro
                    a un interruttore in fondo alla schermata: premevi lì e
                    cambiava questa cifra qui sopra, che per giunta cambiava
                    anche significato. Causa ed effetto a due dita di distanza
                    l'una dall'altro, e nessuna delle due dove guardavi.
                    Toccare la cifra che vuoi cambiare non ha bisogno di
                    essere spiegato. */}
                <div
                  onClick={() => { importoRef.current?.focus(); }}
                  style={{
                    display: 'inline-flex', alignItems: 'baseline', gap: 7,
                    cursor: 'text', padding: '2px 6px',
                  }}>
                  <span style={{fontSize: 26, fontWeight: 800, color: SVI_MUTED, letterSpacing: -0.5}}>€</span>
                  <input
                    ref={importoRef}
                    value={importoTxt}
                    onChange={e => {
                      setImporto(e.target.value.replace(/[^0-9.,]/g, ''));
                      scriviRicevuto(null);
                      setQuota('altro');
                    }}
                    onFocus={() => {
                      // Il valore mostrato era di Tutto/Metà: al tocco si
                      // azzera e la scelta passa al campo. Se la cifra è
                      // già tua, il focus non te la butta via.
                      if (quota !== 'altro') {
                        setQuota('altro');
                        setImporto('');
                        scriviRicevuto(null);
                      }
                    }}
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-label="Quanto incassi ora"
                    size={Math.max((importoTxt || '').length, 4)}
                    style={{
                      width: `${Math.max((importoTxt || '').length, 4)}ch`,
                      border: 'none', outline: 'none',
                      background: 'transparent', fontFamily: 'inherit',
                      fontSize: 52, fontWeight: 800, color: SVI_INK,
                      letterSpacing: -1.6, padding: 0, lineHeight: 1.15,
                      fontVariantNumeric: 'tabular-nums',
                    }}/>
                  <span style={{color: quota === 'altro' ? SVI_CORAL : SVI_MUTED, display: 'inline-flex', alignSelf: 'center'}}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </span>
                </div>

                {/* Il conto, SEMPRE. È l'ancora della schermata: dice su cosa
                    stai lavorando e non si muove mai — nemmeno mentre la cifra
                    sopra cambia. Prima compariva solo quando divergeva, e così
                    il totale sembrava non esistere.
                    "Incassi ora" e "Totale conto" sono due fatti diversi anche
                    quando il numero coincide: appena tocchi la cifra sopra,
                    questa resta ferma ed è esattamente il suo lavoro. */}
                <div style={{
                  marginTop: 6, fontSize: 14.5, color: SVI_MUTED,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  Totale conto {svEur(finalTotal)}
                  {adjust && <> · {adjustLabel.split(' · ')[0].toLowerCase()}</>}
                </div>

                {/* Accanto al numero che cambiano, non in fondo alla pagina. */}
                <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14}}>
                  {quote.map(q => {
                    const on = quota === q.k;
                    return (
                      <button key={q.k}
                        onClick={() => { setQuota(q.k); setImporto(q.val.toFixed(2).replace('.', ',')); scriviRicevuto(null); }}
                        style={{
                          padding: '7px 24px', borderRadius: 999,
                          background: on ? SVI_TINT : '#fff',
                          border: `1px solid ${on ? SVI_CORAL : SVI_BORDER}`,
                          color: on ? SVI_CORAL : SVI_INK,
                          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        }}>{q.label}</button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Quello che è GIÀ entrato in cassa su questo conto, riga per
                  riga. Sempre aperto, mai dietro un tocco: finché la vendita
                  non è chiusa, «cosa mi ha già dato?» è la domanda che si fa
                  al banco col cliente davanti, e la risposta non si va a
                  cercare. Allineato a sinistra come «Contante ricevuto» — è
                  una lista, non un titolo, e sotto l'hero centrato leggeva
                  come una didascalia del numero. */}
              {pagamenti.length > 0 && (
                <div style={{padding: '20px 28px 0'}}>
                  {/* Niente totale nell'etichetta: con un acconto solo ripeteva
                      la cifra della riga sottostante, e su un conto pagato a
                      metà quel numero era pure uguale al residuo là sopra —
                      tre volte la stessa cosa. Il totale lo somma la riga di
                      contesto sotto l'hero; qui stanno i fatti, uno per riga. */}
                  <div style={{...SVI_LABEL, marginBottom: 8}}>Già incassato</div>
                  <div style={{borderRadius: 12, background: '#F5F6F8', padding: '2px 14px'}}>
                    {pagamenti.map((p, i) => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 0',
                        borderTop: i === 0 ? 'none' : `1px solid ${SVI_BORDER}`,
                      }}>
                        <span style={{color: SVI_CORAL, display: 'inline-flex', flexShrink: 0}}>
                          {p.come === 'carta'
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/></svg>}
                        </span>
                        <span style={{flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: SVI_INK}}>
                          {p.come === 'carta' ? 'Smart POS' : 'Contanti'}
                        </span>
                        <span style={{fontSize: 14, color: SVI_MUTED, fontVariantNumeric: 'tabular-nums'}}>{p.ora}</span>
                        <span style={{fontSize: 15.5, fontWeight: 800, color: SVI_INK, fontVariantNumeric: 'tabular-nums', minWidth: 62, textAlign: 'right'}}>
                          {svEur(p.importo)}
                        </span>
                        {/* Lo storno sta accanto al pagamento che storna, che è
                            l'unico posto dove si sa QUALE annullare: un conto
                            pagato in tre riprese ha tre righe, e un pulsante
                            fuori da qui dovrebbe prima chiedere quale.
                            Cosa succede dipende da come ha pagato: i contanti
                            si tolgono dal cassetto e basta, la carta no — lì
                            parte una richiesta di storno sul telefono, come per
                            l'incasso, perché a muovere i soldi è Stripe e non
                            questa schermata. */}
                        <button
                          onClick={() => stornaPagamento(p)}
                          title={p.come === 'carta'
                            ? `Storna ${svEur(p.importo)}: parte la richiesta su Byup Staff`
                            : `Annulla ${svEur(p.importo)} in contanti`}
                          style={{
                            width: 28, height: 28, padding: 0, borderRadius: 8, flexShrink: 0,
                            background: 'transparent', border: 'none', color: SVI_MUTED,
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'grid', placeItems: 'center',
                            transition: 'background 150ms ease-out, color 150ms ease-out',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SVI_MUTED; }}>
                          {/* Freccia che torna indietro: il denaro rifà la
                              strada al contrario. */}
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8h11a5 5 0 0 1 0 10h-6"/><path d="M7 4 3 8l4 4"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adjustOpen && (
                <div style={{padding: '14px 28px 0'}}>
                  <AdjustPanel
                    subtotale={subtotale}
                    adjust={adjust}
                    setAdjust={setAdjust}/>
                </div>
              )}

              {/* Come paga si sceglie solo se c'è ancora qualcosa da pagare:
                  su un conto coperto le due tessere chiederebbero di decidere
                  una cosa che non succede. */}
              {!saldato && (
              <>
              <div style={{height: 1, background: SVI_BORDER, margin: '14px 28px 0'}}/>

              {/* Metodo: due tessere parlanti — icona e nome bastano,
                  l'etichetta di sezione era rumore. */}
              <div style={{padding: '14px 28px 0'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
                  <SvMetodoCard
                    active={method === 'carta'}
                    onClick={() => chooseMethod('carta')}
                    label="Smart POS"
                    icon={<SvIcoPos/>}/>
                  <SvMetodoCard
                    active={method === 'contanti'}
                    onClick={() => chooseMethod('contanti')}
                    label="Contanti"
                    icon={<SvIcoBanconota/>}/>
                </div>
              </div>
              </>
              )}

              {/* La banconota in mano al cliente: solo contanti. Una riga
                  sola — Esatto, i tagli e la casella «Altro» per le cifre
                  che un pulsante non indovina. Niente secondo campo grande:
                  duplicava l'hero. Il resto compare SOLO quando esiste. */}
              {method === 'contanti' && preso > 0 && (
              <div style={{padding: '14px 28px 0'}}>
                <div style={SVI_LABEL}>Contante ricevuto</div>

                <div style={{
                  display: 'grid', gap: 10,
                  gridTemplateColumns: `repeat(${tagli.length + 1}, 1fr)`,
                }}>
                  {tagli.map((t, i) => {
                    // «Esatto» torna a seguire l'importo (ricevuto nullo):
                    // così resta giusto anche se l'importo cambia dopo.
                    const on = !ricevutoLibero && (ricevutoTxt === null ? i === 0 : Math.abs(ricevuto - t.val) < 0.004);
                    return (
                      <button key={t.label}
                        onClick={() => scegliTaglio(i === 0 ? null : t.val.toFixed(2).replace('.', ','))}
                        style={{
                          padding: '9px 8px', borderRadius: 12,
                          background: on ? SVI_TINT : '#fff',
                          border: `1px solid ${on ? SVI_CORAL : SVI_BORDER}`,
                          color: on ? SVI_CORAL : SVI_INK,
                          fontSize: 16.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          fontVariantNumeric: 'tabular-nums',
                        }}>{t.label}</button>
                    );
                  })}
                  {/* La casella è l'ultimo elemento della fila, non un campo
                      a parte: vuota finché non serve. */}
                  {(() => {
                    // Libera solo se la cifra l'ha scritta qualcuno qui dentro.
                    // Col taglio acceso la casella torna vuota: il numero è già
                    // sul pulsante accanto, e riscriverlo faceva sembrare che
                    // fossero due importi diversi nella stessa riga.
                    const custom = ricevutoLibero;
                    return (
                      <div
                        onClick={() => { ricevutoRef.current?.focus(); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                          padding: '9px 8px', borderRadius: 12,
                          background: custom ? SVI_TINT : '#fff',
                          border: `1px solid ${custom ? SVI_CORAL : SVI_BORDER}`,
                          cursor: 'text',
                        }}>
                        {custom && <span style={{fontSize: 16.5, fontWeight: 700, color: SVI_CORAL}}>€</span>}
                        <input
                          ref={ricevutoRef}
                          value={custom ? ricevutoTxt : ''}
                          onChange={e => scriviRicevuto(e.target.value.replace(/[^0-9.,]/g, ''))}
                          inputMode="decimal"
                          placeholder="Altro"
                          aria-label="Contante ricevuto"
                          style={{
                            width: '100%', minWidth: 0, border: 'none', outline: 'none',
                            background: 'transparent', fontFamily: 'inherit', textAlign: 'center',
                            fontSize: 16.5, fontWeight: 700,
                            color: custom ? SVI_CORAL : SVI_INK,
                            padding: 0, fontVariantNumeric: 'tabular-nums',
                          }}/>
                      </div>
                    );
                  })()}
                </div>

                {(resto > 0.004 || manca > 0.004) && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginTop: 10, padding: '10px 16px',
                    borderRadius: 14,
                    background: manca > 0.004 ? '#FEF3C7' : '#F5F6F8',
                  }}>
                    <SvIcoMonete size={22}/>
                    <span style={{fontSize: 16.5, color: manca > 0.004 ? '#B45309' : SVI_MUTED}}>
                      {manca > 0.004 ? 'Mancano' : 'Resto da dare'}
                    </span>
                    <span style={{
                      fontSize: 18, fontWeight: 800, letterSpacing: -0.3,
                      color: manca > 0.004 ? '#B45309' : SVI_INK,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{svEur(manca > 0.004 ? manca : resto)}</span>
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Solo la conferma: il documento si sceglie in testata, e qui
                resta il gesto unico che chiude la vendita. */}
            <div style={{padding: '14px 28px 18px'}}>
              {(() => {
                const inviaSuStaff = method === 'carta';
                // Un conto coperto è pronto a chiudersi: il gesto non è più
                // incassare — non c'è niente da prendere — ma chiudere la
                // vendita con quello che è già dentro. Va prima di tutto il
                // resto, perché con il residuo a zero le altre condizioni non
                // possono essere vere e lascerebbero il pulsante spento su una
                // vendita che è finita.
                // La finestra di divieto vince su tutto, anche sul conto già
                // coperto: chiuderlo emette comunque un documento.
                // Come la notte, le credenziali scadute vincono su tutto: senza
                // credenziale valida il documento commerciale non può nascere,
                // e incassare senza emettere non è ammesso (P-120, PT §12.2).
                const attivo = !notte.dentro && !credBlocco
                  && (saldato || (residuo > 0 && preso >= Math.min(residuo, 0.01) && manca <= 0.004));
                return (
                  <React.Fragment>
                  {credBlocco && (
                    <div data-cred-blocco style={{
                      display:'flex', gap: 10, alignItems:'flex-start',
                      marginBottom: 12, padding:'12px 16px', borderRadius: 12,
                      background:'#FEF2F2', color:'#991B1B',
                      fontSize: 14.5, lineHeight: 1.45,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: 2}}>
                        <rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                      </svg>
                      <span>
                        <b>{credBlocco.titolo}:</b> {credBlocco.testo}{' '}
                        <a href={credBlocco.href} style={{color:'#991B1B', fontWeight: 700}}>Vai a Dati fiscali</a>
                      </span>
                    </div>
                  )}
                  {notte.dentro && (
                    <div style={{
                      display:'flex', gap: 10, alignItems:'flex-start',
                      marginBottom: 12, padding:'12px 16px', borderRadius: 12,
                      background:'#FEF3C7', color:'#92400E',
                      fontSize: 14.5, lineHeight: 1.45,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: 2}}>
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                      </svg>
                      <span>
                        <b>{fattura ? 'La fattura' : 'Lo scontrino'} partirebbe con la data di domani: attendi mezzanotte.</b>{' '}
                        Fra le 23:55 e le 00:00 il canale dell'Agenzia non trasmette — vale anche per
                        i contanti. L'incasso riprende da solo tra <b style={{fontVariantNumeric:'tabular-nums'}}>{window.byupNotteConta(notte.mancano)}</b>.
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (!attivo) return;
                      // Ultima tranche zero: chiude su quello che è già entrato.
                      if (saldato) chiudiPagamento('contanti', 0);
                      else if (inviaSuStaff) setAttesa({ inviato: Date.now(), importo: preso });
                      else registraIncasso(preso, 'contanti');
                    }}
                    disabled={!attivo}
                    style={{
                      width: '100%', padding: '13px 18px', borderRadius: 14,
                      background: attivo ? SVI_GREEN : '#EFEFF1',
                      color: attivo ? '#fff' : '#9CA3AF',
                      border: 'none', fontSize: 18, fontWeight: 700,
                      cursor: attivo ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
                      boxShadow: attivo ? '0 8px 20px -8px rgba(22,163,74,0.55)' : 'none',
                      transition: 'filter 150ms ease-out',
                    }}
                    onMouseEnter={e => { if (attivo) e.currentTarget.style.filter = 'brightness(1.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
                    {attivo && (
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.22)',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                      </span>
                    )}
                    {/* «Nessun articolo nel conto» ora tocca solo al conto
                        davvero vuoto: quello coperto dagli acconti passa di
                        sopra, e chiude invece di spegnersi. */}
                    {/* Senza cifra: sta scritta enorme venti pixel più su, e
                        una terza copia sul pulsante era solo un numero in più
                        da confrontare. Il pulsante dice cosa succede — non
                        quanto — perché il quanto è già la cosa più visibile
                        della schermata. */}
                    {!attivo
                      ? (notte.dentro ? 'In attesa di mezzanotte'
                        : residuo <= 0 ? 'Nessun articolo nel conto'
                        : manca > 0.004 ? 'Il contante non basta'
                        : 'Inserisci un importo')
                      : saldato
                        ? `Chiudi il conto · ${fattura ? 'fattura' : 'ricevuta'}`
                        : inviaSuStaff
                          ? 'Addebita sul POS'
                          : parziale
                            ? 'Incassa in acconto'
                            : `Incassa in contanti · ${fattura ? 'fattura' : 'ricevuta'}`}
                  </button>

                  {/* Cosa resta sul conto dopo questo incasso. Compare SOLO
                      quando resta davvero qualcosa: il «Saldo €0,00» del caso
                      normale era una cifra in più da ignorare. "Saldo" e non
                      "residuo" perché sopra c'è già un "Resto" — due parole
                      simili per due cifre opposte erano l'errore più facile. */}
                  {residuo > 0 && residuoDopo > 0.004 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginTop: 12, padding: '12px 16px', borderRadius: 12,
                      background: residuoDopo > 0.004 ? '#FEF3C7' : '#F5F6F8',
                      color: residuoDopo > 0.004 ? '#B45309' : SVI_MUTED,
                      fontSize: 16, fontWeight: 600,
                    }}>
                      <span>Saldo</span>
                      <span style={{
                        fontWeight: 800, letterSpacing: -0.3,
                        color: residuoDopo > 0.004 ? '#B45309' : SVI_GREEN,
                        fontVariantNumeric: 'tabular-nums',
                      }}>{svEur(residuoDopo)}</span>
                    </div>
                  )}
                  {/* Sotto la CTA non c'è più niente da premere. L'unica cosa
                      con una conseguenza — uscire dal conto — sta in testata,
                      nell'angolo opposto: attaccata al verde era un misclick
                      regalato a ogni incasso. */}
                  </React.Fragment>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Sopra l'incasso, non al posto suo: si torna indietro col conto ancora
        dov'era. Riaprirla da pillola accesa serve a correggere il cliente —
        una P.IVA dettata male si scopre rileggendola, non prima. */}
    <SvFatturaModal
      open={fatturaOpen}
      lines={lines}
      takeaway={takeaway}
      cliente={fattura}
      onClose={() => setFatturaOpen(false)}
      onConfirm={setFattura}
      onRemove={() => setFattura(null)}/>
    </>
  );
}

// Il conto è già coperto: non c'è una cifra da chiedere, c'è un fatto da
// dire. Prende il posto dell'hero — lasciare lì il campo dell'importo su un
// conto che non deve niente è la domanda sbagliata, e chi sta in cassa la
// risponderebbe.
//
// L'eccedenza non è un dettaglio contabile: è la banconota che il cliente sta
// aspettando indietro, e questa è l'ultima schermata prima che il conto
// sparisca. Sta in ambra e non in verde perché è una cosa DA FARE, non una
// cosa fatta — lo stesso ambra di «Mancano» qui sopra.
function SvContoSaldato({ total, eccedenza }) {
  const daRestituire = eccedenza > 0.004;
  return (
    <div style={{padding: '18px 28px 0', textAlign: 'center'}}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
        background: '#DCFCE7', color: SVI_GREEN,
        display: 'grid', placeItems: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
      </div>
      <div style={{fontSize: 24, fontWeight: 800, color: SVI_INK, letterSpacing: -0.5}}>
        Conto saldato
      </div>
      {/* «€4,00 già incassati» sarebbe falso quando è entrato di più: quella
          cifra è il conto, non quello che è stato preso. "Coperto" resta vero
          in tutti e due i casi, e il quanto è entrato lo dice la lista sotto. */}
      <div style={{fontSize: 15.5, color: SVI_MUTED, marginTop: 3}}>
        Il conto di {svEur(total)} è coperto. Non resta niente da prendere.
      </div>

      {daRestituire && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginTop: 14, padding: '11px 16px', borderRadius: 14,
          background: '#FEF3C7',
        }}>
          <SvIcoMonete size={22}/>
          <span style={{fontSize: 16.5, color: '#B45309'}}>Da restituire al cliente</span>
          <span style={{
            fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: '#B45309',
            fontVariantNumeric: 'tabular-nums',
          }}>{svEur(eccedenza)}</span>
        </div>
      )}
    </div>
  );
}

// Storno di un incasso già preso. Tre fasi in fila, una schermata per volta.
//
// La differenza fra i due metodi non è cosmetica ed è tutta qui: i contanti
// li rende l'operatore aprendo il cassetto — il sistema può solo togliere la
// riga e dirgli quanto ridare — mentre sulla carta i soldi li muove Stripe,
// quindi parte una richiesta al telefono e si aspetta, esattamente come per
// l'incasso. Un'unica schermata "storno fatto" per entrambi mentirebbe sul
// secondo caso, dove al momento del tocco non è ancora successo niente.
function SvStorno({ p, fase, onConferma, onChiudi }) {
  const carta = p.come === 'carta';

  const cerchio = (bg, fg, children) => (
    <div style={{
      width: 64, height: 64, borderRadius: '50%', marginBottom: 16,
      background: bg, color: fg, display: 'grid', placeItems: 'center',
    }}>{children}</div>
  );

  return (
    <div style={{padding: '36px 28px 26px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {fase === 'fatto' ? (
        cerchio('#DCFCE7', SVI_GREEN,
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>)
      ) : (
        cerchio(PAY_BG, PAY_INK,
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h11a5 5 0 0 1 0 10h-6"/><path d="M7 4 3 8l4 4"/></svg>)
      )}

      <div style={{fontSize: 24, fontWeight: 800, color: SVI_INK, letterSpacing: -0.4, display: 'flex', alignItems: 'center', gap: 10}}>
        {fase === 'attesa' && (
          <span aria-hidden="true" style={{
            width: 11, height: 11, borderRadius: 999, flexShrink: 0,
            background: PAY_INK, animation: 'saldaPayPulse 1.6s ease-in-out infinite',
          }}/>
        )}
        {fase === 'conferma' ? (carta ? 'Stornare sul POS?' : 'Annullare questo incasso?')
          : fase === 'attesa' ? 'Storno in corso'
          : 'Incasso stornato'}
      </div>

      <div style={{
        fontSize: 34, fontWeight: 800, color: SVI_INK, marginTop: 6,
        letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums',
      }}>{svEur(p.importo)}</div>

      {/* Una riga sola, e dice il gesto che tocca a chi legge — non lo stato
          interno del sistema. */}
      <div style={{fontSize: 16, color: SVI_MUTED, marginTop: 6, maxWidth: 380, lineHeight: 1.45}}>
        {fase === 'conferma'
          ? (carta
            ? 'La richiesta parte su Byup Staff: l\'importo torna sulla carta del cliente.'
            : 'Esce dal conto: ridai i contanti dal cassetto.')
          : fase === 'attesa'
            ? 'Richiesta inviata'
            : (carta ? 'Restituiti sulla carta del cliente.' : `Ridai ${svEur(p.importo)} dal cassetto.`)}
      </div>

      {fase === 'conferma' ? (
        <div style={{display: 'flex', gap: 10, marginTop: 24, width: '100%'}}>
          <button onClick={onChiudi} style={{
            flex: 1, padding: '13px 18px', borderRadius: 14,
            background: 'transparent', color: SVI_INK,
            border: `1px solid ${SVI_BORDER}`,
            fontSize: 16.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Lascia com'è</button>
          <button onClick={onConferma} style={{
            flex: 1, padding: '13px 18px', borderRadius: 14,
            background: '#DC2626', color: '#fff', border: 'none',
            fontSize: 16.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 20px -8px rgba(220,38,38,0.55)',
          }}>{carta ? 'Invia storno' : 'Annulla incasso'}</button>
        </div>
      ) : fase === 'fatto' ? (
        <button onClick={onChiudi} style={{
          width: '100%', marginTop: 24, padding: '13px 18px', borderRadius: 14,
          background: SVI_INK, color: '#fff', border: 'none',
          fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>Torna al conto</button>
      ) : null}
    </div>
  );
}

// Attesa del pagamento con carta al banco. Stessa lingua della finestra di
// saldo in Sala — pallino che pulsa, importo, contatore — ma con una sola
// uscita invece di due.
//
// In Sala c'è anche "Chiudi", perché la cassa ha altri tavoli da servire e il
// conto resta in coda per conto suo. Qui non esiste un "intanto faccio altro":
// il cliente è al banco, la vendita è una sola e finisce adesso. Un secondo
// pulsante che libera la cassa lascerebbe un pagamento senza più un carrello
// a cui tornare.
//
// "Ritira" e non "Annulla" perché è lo stesso gesto della Sala e va chiamato
// con la stessa parola: la richiesta torna indietro, il carrello è ancora lì e
// si può correggere e rimandare. Su Byup Staff, se qualcuno l'aveva già
// aperta, se lo vede dire lì.
//
// Resta premibile fino alla fine: se arriva tardi perde la corsa e la finestra
// passa a incassato, che è quello che è successo davvero.
function SvAttesaPagamento({ total, onRitira }) {
  return (
    <div style={{
      padding: '36px 28px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: PAY_BG, color: PAY_INK,
        display: 'grid', placeItems: 'center', marginBottom: 16,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
        </svg>
      </div>

      {/* Il pallino dice "è ancora vivo", ma non è mai l'unico segnale: la
          scritta accanto dice la stessa cosa a parole. */}
      <div style={{
        fontSize: 24, fontWeight: 700, color: PAY_INK, marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span aria-hidden="true" style={{
          width: 11, height: 11, borderRadius: 999, flexShrink: 0,
          background: PAY_INK, animation: 'saldaPayPulse 1.6s ease-in-out infinite',
        }}/>
        In attesa
      </div>

      <div style={{
        fontSize: 32, fontWeight: 700, color: '#0F1115', marginBottom: 6,
        letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
      }}>€{total.toFixed(2)}</div>

      {/* Niente cronometro: a dire che è viva basta il pallino che pulsa qui
          sopra. I secondi che salgono non danno all'operatore niente su cui
          decidere — l'unica scelta è aspettare o ritirare, e vale uguale al
          quinto o al cinquantesimo — mentre l'attesa la fanno sembrare più
          lunga di quanto sia. */}
      <div style={{ fontSize: 17, color: '#6B7280', marginBottom: 24 }}>
        Richiesta inviata
      </div>

      <button onClick={onRitira} style={{
        padding: '10px 24px', borderRadius: 10,
        background: PN.WHITE_FROST, color: '#0F1115',
        border: `1px solid ${PN.BORDER_SOFT_A}`,
        fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Ritira</button>
    </div>
  );
}

// Animations
if (typeof document !== 'undefined' && !document.getElementById('sv-anims')) {
  const s = document.createElement('style');
  s.id = 'sv-anims';
  s.textContent = `
    @keyframes svCartBump { 0% { transform: scale(1); } 40% { transform: scale(1.22); } 100% { transform: scale(1); } }
  `;
  document.head.appendChild(s);
}

window.SalaVenditaDiretta = SalaVenditaDiretta;

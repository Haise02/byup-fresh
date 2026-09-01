// Tab Conti v2 — gestione conti aperti e saldati, integrazione con sala

// Mock data: 20 conti — mix di non saldati (parziali, scoperti, in attesa) e saldati (carta/contanti, con e senza rimborso)
const CONTI_MOCK = [
  // ─── Non saldati ───────────────────────────────────────────────
  { id:'cnt-1',  idOrdine:'#2511-0042', dataOra:'2025-11-15 19:42', tavolo:'Tavolo 4',  cliente:'Mario Rossi',       riferimento:{nome:'Mario Rossi', tipo:'byup'}, liberatoOre:5.5,  totaleConto:85.00,   daSaldare:45.00,  stato:'non_saldato', note:'Ospiti morbidi', operatore:'Marco',
    ordini: [{id:'o1-1',nome:'Tagliere salumi',qty:2,prezzo:13.00},{id:'o1-2',nome:'Pasta amatriciana',qty:2,prezzo:14.00},{id:'o1-3',nome:'Birra artigianale',qty:3,prezzo:6.00},{id:'o1-4',nome:'Acqua minerale',qty:2,prezzo:2.50},{id:'o1-5',nome:'Tiramisù',qty:1,prezzo:6.50},{id:'o1-6',nome:'Caffè',qty:1,prezzo:1.50}],
    payments: [{id:'p1a', method:'contanti', amount:40.00, ora:'2025-11-15 19:55', scontrinoNum:'SC-2511-0042-1', fisc:{ esito:'ritrasmissione', tentativo: 3, prossimo:'15:10' }}] },
  { id:'cnt-3',  idOrdine:'#2511-0040', dataOra:'2025-11-15 22:30', tavolo:'Asporto', canale:'asporto', cliente:'Simone De Luca',    liberatoOre:2.0,  totaleConto:64.50,   daSaldare:64.50,  stato:'non_saldato', note:'Allergeni richiesti', operatore:'Marco',
    ordini: [{id:'o3-1',nome:'Pizza Margherita',qty:1,prezzo:9.00},{id:'o3-2',nome:'Pizza Diavola',qty:1,prezzo:11.00},{id:'o3-3',nome:'Pizza Quattro stagioni',qty:1,prezzo:12.00},{id:'o3-4',nome:'Birra media',qty:2,prezzo:5.50},{id:'o3-5',nome:'Supplì (4pz)',qty:1,prezzo:7.00},{id:'o3-6',nome:'Tiramisù',qty:1,prezzo:5.50},{id:'o3-7',nome:'Acqua minerale',qty:2,prezzo:2.50},{id:'o3-8',nome:'Patatine fritte',qty:1,prezzo:4.00}],
    payments: [] },
  { id:'cnt-11', idOrdine:'#2511-0036', dataOra:'2025-11-14 21:45', tavolo:'Tavolo 10', cliente:'Roberto Esposito',  liberatoOre:18,   totaleConto:128.00,  daSaldare:128.00, stato:'non_saldato', note:'Cliente uscito senza pagare', operatore:'Giulia',
    ordini: [{id:'o11-1',nome:'Antipasto misto',qty:3,prezzo:11.00},{id:'o11-2',nome:'Risotto ai funghi',qty:2,prezzo:16.00},{id:'o11-3',nome:'Tagliata di manzo',qty:1,prezzo:24.00},{id:'o11-4',nome:'Vino al bicchiere',qty:3,prezzo:7.00},{id:'o11-5',nome:'Acqua minerale',qty:2,prezzo:3.00},{id:'o11-6',nome:'Caffè',qty:3,prezzo:1.50},{id:'o11-7',nome:'Dolce del giorno',qty:1,prezzo:7.50}],
    payments: [] },
  { id:'cnt-20', idOrdine:'#2511-0046', dataOra:'2025-11-16 13:45', tavolo:'Tavolo 12', cliente:'Compleanno Russo (8 ospiti)', riferimento:{nome:'Giulia Russo', tipo:'prenotazione'}, liberatoOre:0.5, totaleConto:312.00, daSaldare:42.00, stato:'non_saldato', note:'Conto diviso', operatore:'Marco',
    ordini: [{id:'o20-1',nome:'Servizio',qty:8,prezzo:2.00},{id:'o20-2',nome:'Antipasto misto',qty:8,prezzo:12.00},{id:'o20-3',nome:'Pasta alla norma',qty:4,prezzo:13.00},{id:'o20-4',nome:'Pasta al ragù',qty:4,prezzo:13.00},{id:'o20-5',nome:'Secondo del giorno',qty:2,prezzo:22.00},{id:'o20-6',nome:'Bottiglia vino rosso',qty:2,prezzo:18.00},{id:'o20-7',nome:'Acqua minerale',qty:8,prezzo:2.00}],
    payments: [
      {id:'p20a', method:'byup',     amount:45.00, ora:'2025-11-16 14:05', scontrinoNum:'SC-2511-0046-1'},
      {id:'p20b', method:'byup',     amount:45.00, ora:'2025-11-16 14:06', scontrinoNum:'SC-2511-0046-2'},
      // Conto diviso: uno dei documenti è stato scartato, gli altri no.
      // Lo stato sta QUI, sul pagamento: il conto non ne ha uno suo.
      {id:'p20c', method:'carta',    amount:90.00, ora:'2025-11-16 14:09', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0046-3', fisc:{ scarto:'aliquota', tentativi: 3 }},
      {id:'p20d', method:'contanti', amount:50.00, ora:'2025-11-16 14:11', scontrinoNum:'SC-2511-0046-4'},
      {id:'p20e', method:'carta',    amount:40.00, ora:'2025-11-16 14:13', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0046-5'},
    ] },

  // ─── Saldati ───────────────────────────────────────────────────
  // Incassato sul bordo della finestra di divieto (P-100): il canale l'aveva
  // già in mano alle 23:55 e l'ha accodato al giorno nuovo — stato waiting,
  // che docInfo mostra solo mentre la finestra è attiva (vera, o simulata con
  // ?notte=1). A mezzanotte parte davvero e torna un trasmesso qualunque.
  { id:'cnt-24', idOrdine:'#2511-0047', dataOra:'2025-11-16 23:38', tavolo:'Tavolo 2',  cliente:'Ultimo tavolo Ferri', liberatoOre:0.1, totaleConto:54.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p24a', method:'carta', amount:54.00, ora:'2025-11-16 23:54', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0047-1', fisc:{ esito:'waiting' }}] },
  { id:'cnt-5',  idOrdine:'#2511-0038', dataOra:'2025-11-13 20:30', tavolo:'Tavolo 1',  cliente:'Lucia Marchesi',    riferimento:{nome:'Lucia Marchesi', tipo:'byup'}, liberatoOre:48,    totaleConto:72.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p5a', method:'carta', amount:72.00, ora:'2025-11-13 21:15', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0038-1', fisc:{ scarto:'delega', tentativi: 3 }}] },
  { id:'cnt-6',  idOrdine:'#2511-0037', dataOra:'2025-11-08 21:00', tavolo:'Tavolo 3',  cliente:'Francesco Rossi',   liberatoOre:168,   totaleConto:95.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p6a', method:'contanti', amount:95.50, ora:'2025-11-08 21:45', scontrinoNum:'SC-2511-0037-1'}] },
  { id:'cnt-13', idOrdine:'#2511-0035', dataOra:'2025-11-13 13:15', tavolo:'Tavolo 4',  cliente:'Pellegrini',        liberatoOre:60,    totaleConto:64.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    // Unico conto saldato a pagamento singolo con righe: il reso — a
    // differenza dell'annullo — ha bisogno di sapere COSA si sta restituendo,
    // e lo scontrino non è itemizzato quando il conto si divide su più
    // pagamenti (le righe condivise finirebbero rese due volte).
    // Porta anche uno scarto SdI: è il conto su cui si vedono insieme le due
    // cose che possono capitare a un pagamento — un reso e un documento che
    // non è passato.
    ordini: [{id:'o13-1',nome:'Cotoletta alla milanese',qty:2,prezzo:18.00},{id:'o13-2',nome:'Patate al forno',qty:2,prezzo:5.00},{id:'o13-3',nome:'Vino al bicchiere',qty:2,prezzo:7.00},{id:'o13-4',nome:'Acqua minerale',qty:2,prezzo:2.00}],
    payments: [{id:'p13a', method:'carta', amount:64.00, ora:'2025-11-13 13:55', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0035-1', fisc:{ scarto:'dispositivo', tentativi: 2 }}] },
  { id:'cnt-14', idOrdine:'#2511-0034', dataOra:'2025-11-12 20:00', tavolo:'Tavolo 8',  cliente:'Carlo Russo',       liberatoOre:84,    totaleConto:215.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [
      {id:'p14a', method:'carta', amount:150.00, ora:'2025-11-12 22:30', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0034-1'},
      {id:'p14b', method:'contanti', amount:65.00, ora:'2025-11-12 22:32', scontrinoNum:'SC-2511-0034-2'},
    ] },
  { id:'cnt-21', idOrdine:'#2511-0029', dataOra:'2025-11-09 20:15', tavolo:'Tavolo 7',  cliente:'Cena aziendale Mele', riferimento:{nome:'Andrea Mele', tipo:'prenotazione'}, liberatoOre:96,  totaleConto:485.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'carta',
    payments: [
      {id:'p21a', method:'byup',     amount:60.00, ora:'2025-11-09 22:40', scontrinoNum:'SC-2511-0029-1'},
      {id:'p21b', method:'byup',     amount:60.00, ora:'2025-11-09 22:41', scontrinoNum:'SC-2511-0029-2'},
      {id:'p21c', method:'byup',     amount:60.00, ora:'2025-11-09 22:42', scontrinoNum:'SC-2511-0029-3'},
      {id:'p21d', method:'carta',    amount:200.00, ora:'2025-11-09 22:48', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0029-4', fisc:{ esito:'ritrasmissione', tentativo: 2, prossimo:'14:30' }},
      {id:'p21e', method:'contanti', amount:80.00, ora:'2025-11-09 22:50', scontrinoNum:'SC-2511-0029-5'},
      {id:'p21f', method:'carta',    amount:25.00, ora:'2025-11-09 22:52', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0029-6'},
    ] },
  { id:'cnt-22', idOrdine:'#2511-0027', dataOra:'2025-11-08 13:00', tavolo:'Tavolo 5',  cliente:'Pranzo team',         liberatoOre:144,  totaleConto:156.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'byup',
    payments: [
      {id:'p22a', method:'byup', amount:35.00, ora:'2025-11-08 14:20', scontrinoNum:'SC-2511-0027-1'},
      {id:'p22b', method:'byup', amount:42.00, ora:'2025-11-08 14:21', scontrinoNum:'SC-2511-0027-2', fisc:{ scarto:'dispositivo', tentativi: 2, gestito:{ come:'manuale', nota:'POS abbinato in Impostazioni e documento ritrasmesso.' } }},
      {id:'p22c', method:'byup', amount:28.00, ora:'2025-11-08 14:22', scontrinoNum:'SC-2511-0027-3'},
      {id:'p22d', method:'byup', amount:51.00, ora:'2025-11-08 14:23', scontrinoNum:'SC-2511-0027-4'},
    ] },
  { id:'cnt-23', idOrdine:'#2511-0025', dataOra:'2025-11-07 21:30', tavolo:'Tavolo 10', cliente:'Tavolata Conti (6 ospiti)', liberatoOre:168, totaleConto:267.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'contanti',
    payments: [
      {id:'p23a', method:'contanti', amount:45.00, ora:'2025-11-07 23:10', scontrinoNum:'SC-2511-0025-1'},
      {id:'p23b', method:'contanti', amount:50.00, ora:'2025-11-07 23:11', scontrinoNum:'SC-2511-0025-2'},
      {id:'p23c', method:'byup',     amount:42.00, ora:'2025-11-07 23:14', scontrinoNum:'SC-2511-0025-3', fisc:{ scarto:'aliquota', tentativi: 3, gestito:{ come:'manuale', nota:'Aliquota corretta nel catalogo e documento ritrasmesso a mano.' } }},
      {id:'p23d', method:'carta',    amount:75.00, ora:'2025-11-07 23:16', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0025-4'},
      {id:'p23e', method:'contanti', amount:55.00, ora:'2025-11-07 23:18', scontrinoNum:'SC-2511-0025-5'},
    ] },
  { id:'cnt-15', idOrdine:'#2511-0033', dataOra:'2025-11-12 13:30', tavolo:'Asporto', canale:'asporto', cliente:'Anna Costa',        riferimento:{nome:'Anna Costa', tipo:'byup'}, liberatoOre:96,    totaleConto:38.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'byup',
    payments: [{id:'p15a', method:'byup', amount:38.50, ora:'2025-11-12 14:10', scontrinoNum:'SC-2511-0033-1'}] },
  { id:'cnt-16', idOrdine:'#2511-0032', dataOra:'2025-11-11 21:30', tavolo:'Tavolo 11', cliente:'Gallo (aziendale)', liberatoOre:120,   totaleConto:340.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p16a', method:'carta', amount:340.00, ora:'2025-11-11 23:00', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0032-1'}] },
  { id:'cnt-17', idOrdine:'#2511-0030', dataOra:'2025-11-10 12:45', tavolo:'Tavolo 6',  cliente:'Coppia Neri',       riferimento:{nome:'Francesca Neri', tipo:'prenotazione'}, liberatoOre:144,   totaleConto:58.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p17a', method:'carta', amount:58.00, ora:'2025-11-10 13:50', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0030-1'}],
    rimborso: {amount:12.00, ora:'2025-11-10 14:05', method:'carta', reason:'Servizio contestato'} },
  { id:'cnt-7',  idOrdine:'#2509-0156', dataOra:'2025-08-17 22:15', tavolo:'Tavolo 6',  cliente:'Paolo Bianchi',     liberatoOre:2160,  totaleConto:110.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p7a', method:'carta', amount:110.00, ora:'2025-08-17 22:45', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2509-0156-1'}],
    rimborso: {amount:25.00, ora:'2025-08-18 10:12', method:'carta', reason:'Piatto reso: pasta troppo cotta'} },
  { id:'cnt-18', idOrdine:'#2510-0089', dataOra:'2025-10-05 21:00', tavolo:'Asporto', canale:'asporto', cliente:'Sara Mancini',      liberatoOre:1032,  totaleConto:76.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p18a', method:'contanti', amount:76.00, ora:'2025-10-05 21:50', scontrinoNum:'SC-2510-0089-1'}] },
  { id:'cnt-19', idOrdine:'#2509-0143', dataOra:'2025-09-20 13:00', tavolo:'Tavolo 3',  cliente:'Luca Caruso',       liberatoOre:1380,  totaleConto:42.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p19a', method:'carta', amount:42.50, ora:'2025-09-20 13:55', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2509-0143-1'}] },
  { id:'cnt-8',  idOrdine:'#2411-0004', dataOra:'2024-11-14 19:00', tavolo:'Asporto', canale:'asporto', cliente:'Elena Greco',       liberatoOre:8760,  totaleConto:48.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p8a', method:'contanti', amount:48.00, ora:'2024-11-14 19:45', scontrinoNum:'SC-2411-0004-1'}] },
];

// Ri-ancoraggio date: il mock è scritto con "oggi" = 16 nov 2025. Trasliamo tutte
// le date (conto, pagamenti, rimborsi) dello scarto con l'oggi reale e rigeneriamo
// i codici ordine/scontrino (#YYMM-…): la storia resta coerente e sempre attuale.
(() => {
  const shiftDays = Math.floor((Date.now() - new Date('2025-11-16T12:00:00').getTime()) / 86400000);
  const shiftStr = (str) => {
    if (!str) return str;
    const [date, time] = str.split(' ');
    const d = new Date(date + 'T' + (time || '12:00') + ':00');
    d.setDate(d.getDate() + shiftDays);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return time ? `${iso} ${time}` : iso;
  };
  CONTI_MOCK.forEach(c => {
    c.dataOra = shiftStr(c.dataOra);
    const code = c.dataOra.slice(2,4) + c.dataOra.slice(5,7);
    c.idOrdine = c.idOrdine.replace(/#\d{4}-/, '#' + code + '-');
    (c.payments || []).forEach(p => {
      p.ora = shiftStr(p.ora);
      if (p.scontrinoNum) p.scontrinoNum = p.scontrinoNum.replace(/SC-\d{4}-/, 'SC-' + code + '-');
    });
    if (c.rimborso) c.rimborso.ora = shiftStr(c.rimborso.ora);
  });

  // Il conto della finestra di divieto (P-100) è per definizione DI STASERA:
  // un waiting di ieri sarebbe già partito a mezzanotte. Lo shiftDays del mock
  // però cade su ieri per tutta la mattina (l'ancora è a mezzogiorno), quindi
  // questo conto si aggancia all'oggi vero, non allo scarto.
  const c24 = CONTI_MOCK.find(x => x.id === 'cnt-24');
  if (c24) {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const code = iso.slice(2,4) + iso.slice(5,7);
    c24.dataOra = `${iso} 23:38`;
    c24.idOrdine = '#' + code + '-0047';
    c24.payments[0].ora = `${iso} 23:54`;
    c24.payments[0].scontrinoNum = 'SC-' + code + '-0047-1';
  }
})();

// Gli incassi del banco sono conti come gli altri: la Vendita diretta li tiene
// nella sua forma (ordini in coda, consegnati) e qui entrano tradotti, in cima
// perché sono di oggi. Senza, il rimando "ricevute fiscali associate" dal
// dettaglio di un ordine consegnato porterebbe a una lista che non lo contiene.
// Il push, e non una lista a parte: Cassa, filtri e ricerca leggono tutti da
// qui, e una seconda lista parallela si sarebbe scordata metà di loro.
if (typeof svContiVenditaDiretta === 'function') {
  CONTI_MOCK.unshift(...svContiVenditaDiretta());
}

// I pagamenti sono i documenti commerciali: Cassa ci deriva le chiusure di
// giornata, quindi la lista deve essere raggiungibile da lì.
window.CONTI_MOCK = CONTI_MOCK;

// Format "2025-11-15 19:42" → "15 nov · 19:42"
function fmtDataOra(s) {
  if (!s) return '—';
  const [date, time] = s.split(' ');
  const [y, m, d] = date.split('-');
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  const mese = mesi[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} ${mese} · ${time}`;
}

// Format "2025-11-15 19:42" → "15 nov" (solo data)
function fmtData(s) {
  if (!s) return '—';
  const [date] = s.split(' ');
  const [y, m, d] = date.split('-');
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  const mese = mesi[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} ${mese}`;
}

// Format "2025-11-15 19:42" → "19:42" (solo ora)
function fmtOra(s) {
  if (!s) return '—';
  const [, time] = s.split(' ');
  return time || '—';
}

// Ora di chiusura del conto = ora dell'ultimo pagamento (quando è stato saldato).
// Conti ancora aperti (non saldati) non hanno ora di chiusura.
function oraChiusura(conto) {
  if (conto.stato !== 'saldato') return '—';
  const ps = conto.payments || [];
  if (!ps.length) return '—';
  return fmtOra(ps[ps.length - 1].ora);
}

// Logo Byup inline — gradiente brand col MARCHIO byup (stesso trattamento
// degli avatar app in sala e dei badge del calendario).
// Segnala che il riferimento è un utente loggato sulla Byup App.
function ByupMark({ size = 16 }) {
  return (
    <span title="Utente Byup App" style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width: size, height: size, borderRadius:'50%', flexShrink:0,
      background: 'linear-gradient(135deg, #FF5A5F, #B53338)',
    }}><PnI.MarkWhite size={Math.round(size * 0.6)}/></span>
  );
}

// ─── Stato di trasmissione del documento nato dal pagamento ───────────────
// Il chip vive sulla riga del pagamento perché è lì che il documento nasce:
// un conto diviso in tre pagamenti ha tre scontrini e tre esiti distinti.
function PagamentoFiscChip({ payment, onOpen }) {
  const info = docInfo(payment);
  const apribile = !!info.scarto;
  const pill = <FiscPill tipo={info.tipo} label={DOC_LABEL[info.tipo]}/>;
  const sotto = info.tipo === 'ritrasmissione' ? (
    <span style={{color: PN.MUTED, whiteSpace:'nowrap'}}>
      tentativo {info.tentativo} di 5 · prossimo alle {info.prossimo}
    </span>
  ) : info.tipo === 'waiting' ? (
    // Accodato dal canale nella finestra di divieto: nessun id AE da mostrare
    // — non è ancora partito — e la giornata fiscale sarà quella di domani.
    <span style={{color: PN.MUTED, whiteSpace:'nowrap'}}>
      parte alle 00:00 · giornata fiscale di domani
    </span>
  ) : null;
  if (!apribile) {
    return (
      <span title={info.idTrasm ? `Identificativo di ricezione ${info.idTrasm}` : undefined}
        style={{display:'inline-flex', alignItems:'center', gap: 8}}>{pill}{sotto}</span>
    );
  }
  return (
    <button onClick={onOpen} title="Apri il dettaglio dello scarto"
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
      style={{
        display:'inline-flex', alignItems:'center', gap: 8,
        background:'transparent', border:'none', padding: 0,
        cursor:'pointer', fontFamily:'inherit', fontSize: C.T_XS,
        transition:'filter 140ms ease',
      }}>{pill}{sotto}</button>
  );
}

// ─── Dettaglio dello scarto di un documento ────────────────────────────────
// Stesso scheletro delle modali della sezione (ContNuovoCosto): overlay velato
// ancorato al <main>, foglio bianco pieno, header con badge icona. Riguarda UN
// pagamento: gli altri dello stesso conto restano quelli che erano.
function DocScartoSheet({ conto, payment, onClose }) {
  useFiscTick();
  const info = docInfo(payment);
  const sc = info.scarto;
  const chiuso = !!info.gestito;
  const [nota, setNota] = React.useState(() => info.nota || '');

  // "Aperto il …" si scrive solo finché lo scarto è vivo: segnarlo su uno già
  // chiuso metterebbe nel log un evento successivo alla gestione.
  React.useEffect(() => { if (!chiuso) window.byupFiscVisto(payment.id); }, [payment.id, chiuso]);

  // Il log in ordine di accadimento — ordinato sui timestamp, non sull'ordine
  // in cui capita di costruirlo.
  const passi = [
    { txt:'Scarto rilevato', t: sc.rilevato },
    info.visto && { txt:'Aperto', t: info.visto },
    info.ritento && { txt:`Ritrasmissione avviata · tentativo ${info.ritento.tentativo} di 5`, t: info.ritento.quando },
    info.gestito && { txt: info.gestito.come === 'ritrasmissione' ? 'Gestito · ritrasmissione riuscita' : 'Gestito', t: info.gestito.quando },
  ].filter(Boolean).sort((a, b) => fiscOrdine(a.t).localeCompare(fiscOrdine(b.t)));

  const Blocco = ({ titolo, children }) => (
    <div style={{marginTop: 18}}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: PN.MUTED,
        textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
      }}>{titolo}</div>
      <div style={{fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.55}}>{children}</div>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      zIndex: 60, display:'grid', placeItems:'center', padding: 28,
      animation:'scartoFade 0.16s ease',
    }}>
      <style>{`
        @keyframes scartoFade { from {opacity: 0;} to {opacity: 1;} }
        @keyframes scartoPop {
          from {opacity: 0; transform: scale(0.965) translateY(10px);}
          to   {opacity: 1; transform: none;}
        }
        .cont-scarto-sheet textarea:focus {
          border-color: ${PN.PINK};
          box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.14);
        }
      `}</style>
      <div className="cont-scarto-sheet" onClick={e => e.stopPropagation()} style={{
        width: 640, maxWidth:'100%', maxHeight:'100%', background: PN.WHITE,
        borderRadius: 22, border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24), 0 2px 6px rgba(15,17,21,0.08)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'scartoPop 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding:'20px 26px 18px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
            <div style={{
              width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
              background: chiuso ? C.SURF_ALT : '#FEE2E2',
              color: chiuso ? PN.MUTED : '#991B1B',
              display:'grid', placeItems:'center', boxShadow: PN.INSET_HIGHLIGHT,
            }}>{chiuso ? <Ic.check size={20}/> : <Ic.warn size={19}/>}</div>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>
                {chiuso ? 'Scarto gestito' : 'Documento scartato'}
              </div>
              <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2, fontVariantNumeric:'tabular-nums'}}>
                {payment.scontrinoNum} · {fiscTs(payment.ora)} · € {payment.amount.toFixed(2)}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
              background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer',
              display:'flex', padding: 8, borderRadius: 10,
              transition:'background 130ms ease, color 130ms ease, transform 120ms ease',
            }}><Ic.close size={17}/></button>
        </div>

        <div className="pn-scroll" style={{padding:'20px 26px 22px', overflowY:'auto'}}>
          <div style={{
            padding:'14px 16px', borderRadius: C.R_MD,
            background: chiuso ? C.SURF : PN.PINK_BG_SOFT,
            border: `1px solid ${chiuso ? PN.BORDER_SOFT : '#FFD9D7'}`,
            fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT, lineHeight: 1.4,
          }}>{sc.motivo}</div>

          <Blocco titolo="Causa probabile">{sc.causa}</Blocco>

          <Blocco titolo="Cosa fare">
            {sc.azione}
            <div style={{marginTop: 10}}>
              <button onClick={() => { window.location.href = sc.vaiHref; }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = PN.WHITE; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_HAIR; e.currentTarget.style.background = PN.WHITE_HUSH; }}
                style={{
                  display:'inline-flex', alignItems:'center', gap: 7,
                  padding:'8px 13px', borderRadius: C.R_SM,
                  background: PN.WHITE_HUSH, border: `1px solid ${PN.BORDER_HAIR}`,
                  boxShadow:'inset 0 1px 1px rgba(15,17,21,0.04)',
                  fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
                  cursor:'pointer', fontFamily:'inherit',
                  transition:'border-color 150ms, background 150ms',
                }}>
                {sc.vaiLabel}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED}}><path d="M7 17 17 7M8 7h9v9"/></svg>
              </button>
            </div>
          </Blocco>

          {chiuso ? (
            info.gestito.nota && <Blocco titolo="Nota">{info.gestito.nota}</Blocco>
          ) : (
            <div style={{marginTop: 18}}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: PN.MUTED,
                textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
              }}>Nota (facoltativa)</div>
              <textarea value={nota} onChange={e => setNota(e.target.value)}
                placeholder="Cosa hai fatto per sistemarlo — resta nel log del documento"
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding:'11px 13px', border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                  fontSize: C.T_SM, fontFamily:'inherit', color: PN.TEXT,
                  outline:'none', resize:'vertical', minHeight: 78,
                  transition:'border-color 130ms ease, box-shadow 150ms ease',
                }}/>
            </div>
          )}

          <Blocco titolo="Cos'è successo">
            <div style={{position:'relative', paddingLeft: 2}}>
              {passi.map((p, i) => (
                <div key={i} style={{display:'flex', gap: 10, position:'relative', paddingBottom: i === passi.length - 1 ? 0 : 12}}>
                  {i < passi.length - 1 && (
                    <span style={{position:'absolute', left: 4.5, top: 14, bottom: -2, borderLeft:`1.5px dashed ${PN.BORDER}`}}/>
                  )}
                  <span style={{
                    width: 10, height: 10, borderRadius:'50%', flexShrink: 0, marginTop: 5,
                    background: PN.WHITE, position:'relative', zIndex: 1,
                    boxShadow: `inset 0 0 0 2px ${i === passi.length - 1 && chiuso ? PN.GREEN : (i === 0 ? '#991B1B' : 'rgba(15,17,21,0.22)')}`,
                  }}/>
                  <div style={{fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.5, minWidth: 0}}>
                    {p.txt} il <span style={{fontVariantNumeric:'tabular-nums', color: PN.MUTED}}>{p.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </Blocco>

          <div style={{fontSize: C.T_XS, color: PN.MUTED_SOFT, marginTop: 16, lineHeight: 1.5}}>
            Lo scarto riguarda solo questo documento: gli altri pagamenti del conto {conto.idOrdine} sono stati trasmessi regolarmente.
          </div>
        </div>

        {!chiuso && (
          <div style={{
            padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
            background: PN.WHITE_OFF,
            display:'flex', alignItems:'center', gap: 10,
          }}>
            <div style={{flex: 1, fontSize: C.T_XS, color: PN.MUTED_SOFT}}>
              Finché lo scarto è aperto resta segnalato in Contabilità.
            </div>
            <button onClick={() => { window.byupFiscSegnaGestita(payment.id, nota); onClose(); }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}
              style={{
                padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 6,
                transition:'background 130ms ease, border-color 130ms ease, transform 120ms ease',
              }}><Ic.check size={14}/> Segna come gestito</button>
            <button onClick={() => { window.byupFiscRiprova(payment.id, nota); onClose(); }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 90, 95, 0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}
              style={{
                padding:'10px 22px', background: PN.PINK, color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 6,
                transition:'filter 130ms ease, box-shadow 150ms ease, transform 120ms ease',
              }}><Ic.recurring size={13}/> Riprova ora</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dettaglio del conto ───────────────────────────────────────────────────
// Prima la riga si apriva in un pannello sotto e la tabella si spezzava in due:
// con più conti aperti insieme le colonne non si leggevano più. Il conto è un
// oggetto solo, e va guardato come tale — foglio sopra la lista, stesso
// scheletro di DocScartoSheet: in testa chi/quando/quanto, sotto i pagamenti.
//
// Due cose diverse possono succedere a un pagamento, e il foglio le mostra
// entrambe: il documento può non essere passato allo SdI (`onScarto`) e il
// denaro può tornare indietro (`onDettaglio`, `getStato`). Sono indipendenti —
// uno scontrino scartato resta scartato anche dopo un reso — quindi convivono
// sulla stessa riga invece di escludersi.
function ContoDettaglioSheet({ conto, saldato, getStato, onClose, onDettaglio, onScarto, onSalda }) {
  const payments = conto.payments || [];
  const storni = payments.reduce((s, p) => s + ((getStato && getStato(p.id)) ? getStato(p.id).amount : 0), 0);
  // Quanto è davvero entrato: i pagamenti meno quello che è tornato indietro.
  // Al lordo sarebbe una cifra smentita dalle righe barrate lì sotto.
  const incassato = payments.reduce((s, p) => s + p.amount, 0) - storni - (conto.rimborso ? conto.rimborso.amount : 0);
  const isSaldato = conto.stato === 'saldato' || saldato;
  const daSaldare = isSaldato ? 0 : conto.daSaldare;
  const methodMeta = {
    contanti: { label:'Contanti', icon: PnI.Coin,       color:'#0F766E', bg:'#CCFBF1' },
    carta:    { label:'Carta',    icon: PnI.Card,       color:'#1D4ED8', bg:'#DBEAFE' },
    byup:     { label:'Byup app', icon: PnI.Smartphone, color:'#7C3AED', bg:'#EDE9FE' },
    // P-04: incasso avvenuto PRESSO la piattaforma delivery — il denaro non
    // passa da Byup, e in Cassa sta fuori da contanti e POS. Il documento
    // fiscale però lo emettiamo noi (D-15 · emit_fiscal_document).
    piattaforma: { label:'Piattaforma', icon: PnI.Bag,  color:'#9A3412', bg:'#FFEDD5' },
  };

  // Le celle del riepilogo: etichetta piccola sopra, valore sotto.
  const Cifra = ({ label, children, color }) => (
    <div style={{minWidth: 0}}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: PN.MUTED_SOFT,
        textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: C.T_MD, fontWeight: 800, color: color || PN.TEXT,
        fontVariantNumeric:'tabular-nums',
        display:'flex', alignItems:'center', gap: 6, minWidth: 0,
      }}>{children}</div>
    </div>
  );

  const Sep = () => <span style={{color: PN.MUTED_LIGHT}}>·</span>;
  const Titolo = ({ children }) => (
    <div style={{
      fontSize: 11, fontWeight: 700, color: PN.MUTED,
      textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 10,
      display:'flex', alignItems:'center', gap: 8,
    }}>{children}</div>
  );

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      zIndex: 60, display:'grid', placeItems:'center', padding: 28,
      animation:'scartoFade 0.16s ease',
    }}>
      {/* Le stesse keyframes del foglio scarto: qui possono aprirsi da sole,
          senza che quello sia montato. */}
      <style>{`
        @keyframes scartoFade { from {opacity: 0;} to {opacity: 1;} }
        @keyframes scartoPop {
          from {opacity: 0; transform: scale(0.965) translateY(10px);}
          to   {opacity: 1; transform: none;}
        }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: 760, maxWidth:'100%', maxHeight:'100%', background: PN.WHITE,
        borderRadius: 22, border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24), 0 2px 6px rgba(15,17,21,0.08)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'scartoPop 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Testata: di chi è il conto, quando è nato, com'è messo */}
        <div style={{
          padding:'20px 26px 18px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
            <div style={{
              width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
              background: C.SURF_ALT, color: PN.TEXT,
              display:'grid', placeItems:'center', boxShadow: PN.INSET_HIGHLIGHT,
            }}><Ic.receipt size={19}/></div>
            <div style={{minWidth: 0}}>
              <div style={{
                fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{conto.tavolo}</div>
              <div style={{
                fontSize: C.T_SM, color: PN.MUTED, marginTop: 2,
                display:'flex', alignItems:'center', gap: 7, flexWrap:'wrap',
              }}>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{fmtDataOra(conto.dataOra)}</span>
                {conto.idOrdine && (
                  <React.Fragment>
                    <Sep/>
                    <span style={{fontFamily:'ui-monospace, Menlo, monospace', color: PN.TEXT}}>{conto.idOrdine}</span>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 10, flexShrink: 0}}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'5px 12px', borderRadius: C.R_PILL,
              background: isSaldato ? '#D1FAE5' : '#FEF2F2',
              border: `1px solid ${isSaldato ? '#A7F3D0' : '#FECACA'}`,
              color: isSaldato ? '#065F46' : '#991B1B',
              fontSize: C.T_XS, fontWeight: 700, whiteSpace:'nowrap',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius:'50%',
                background: isSaldato ? '#065F46' : '#DC2626',
              }}/>
              {isSaldato ? 'Saldato' : 'Da saldare'}
            </span>
            <button onClick={onClose}
              onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
              style={{
                background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer',
                display:'flex', padding: 8, borderRadius: 10,
                transition:'background 130ms ease, color 130ms ease',
              }}><Ic.close size={17}/></button>
          </div>
        </div>

        {/* Riepilogo: i numeri del conto su una riga sola */}
        <div style={{
          display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr',
          gap: 18, padding:'14px 26px 16px',
          background: C.SURF,
          borderTop:`1px solid ${PN.BORDER_SOFT}`,
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
        }}>
          <Cifra label="Riferimento">
            {conto.riferimento ? (
              <React.Fragment>
                {conto.riferimento.tipo === 'byup' && <ByupMark size={16}/>}
                <span style={{
                  fontSize: C.T_SM, fontWeight: 700,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{conto.riferimento.nome}</span>
              </React.Fragment>
            ) : (
              <span style={{fontSize: C.T_SM, fontWeight: 600, color: PN.MUTED}}>{conto.cliente || '—'}</span>
            )}
          </Cifra>
          <Cifra label="Totale">€{conto.totaleConto.toFixed(2)}</Cifra>
          <Cifra label="Incassato" color={incassato > 0 ? PN.TEXT : PN.MUTED_SOFT}>
            €{incassato.toFixed(2)}
          </Cifra>
          <Cifra label="Da saldare" color={daSaldare > 0 ? '#B91C1C' : PN.MUTED_SOFT}>
            {daSaldare > 0 ? `€${daSaldare.toFixed(2)}` : '—'}
          </Cifra>
        </div>

        {/* Corpo: i pagamenti, uno per riga — ognuno col suo documento */}
        <div className="pn-scroll" style={{
          padding:'16px 26px 20px', overflowY:'auto', background: C.SURF,
        }}>
          <Titolo>
            Canali di pagamento
            {payments.length > 0 && (
              <span style={{
                padding:'1px 7px', borderRadius: C.R_PILL,
                background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`,
                color: PN.MUTED, fontVariantNumeric:'tabular-nums',
              }}>{payments.length}</span>
            )}
          </Titolo>

          {payments.length === 0 ? (
            <div style={{
              padding:'22px 14px', background: PN.WHITE,
              border:`1px dashed ${PN.BORDER}`, borderRadius: C.R_MD,
              fontSize: C.T_SM, color: PN.MUTED, textAlign:'center',
            }}>Nessun pagamento ancora registrato per questo conto</div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap: 8}}>
              {payments.map(p => {
                const meta = methodMeta[p.method] || methodMeta.contanti;
                const Icon = meta.icon;
                // Lo stato del documento si legge qui, non si tocca qui: annullo
                // e reso partono solo dal dettaglio, dove le righe si vedono
                // prima di decidere — un pulsante rapido su una riga di elenco
                // farebbe scegliere alla cieca.
                const st = getStato ? getStato(p.id) : null;
                const device = p.posRef && [p.posRef.nome || p.posRef.device, p.posRef.email].filter(Boolean).join(' · ');
                return (
                  <div key={p.id} style={{
                    display:'grid',
                    gridTemplateColumns:'auto minmax(0, 1fr) auto',
                    columnGap: 12, rowGap: 8, alignItems:'center',
                    padding:'12px 14px', background: PN.WHITE,
                    border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: C.R_MD,
                    boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
                  }}>
                    <div style={{
                      gridRow:'1 / span 2',
                      width: 36, height: 36, borderRadius: 10,
                      background: meta.bg, color: meta.color,
                      display:'grid', placeItems:'center',
                    }}>{Icon ? <Icon size={16}/> : null}</div>

                    {/* Riga 1 — due stati indipendenti, in quest'ordine perché
                        rispondono a due domande diverse.
                        Prima cos'è successo ai SOLDI: il badge annullo/reso
                        cambia come si legge la cifra qui a destra, che infatti
                        va barrata — quindi va visto prima di leggerla.
                        Poi il DOCUMENTO, se è arrivato allo SdI.
                        Non si escludono: uno scontrino scartato resta scartato
                        anche dopo che il denaro è tornato indietro, e l'ufficio
                        deve poter vedere le due cose nello stesso colpo. */}
                    <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap', minWidth: 0}}>
                      <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT}}>{meta.label}</span>
                      {st && (
                        <span style={{
                          padding:'2px 8px', borderRadius: C.R_PILL, background:'#FEE2E2', color:'#B91C1C',
                          fontSize: 11.5, fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.3,
                        }}>{st.tipo === 'annullo' ? 'Annullato' : 'Reso'}</span>
                      )}
                      <PagamentoFiscChip payment={p} onOpen={() => onScarto && onScarto(p)}/>
                    </div>
                    <div style={{
                      fontWeight: 800, fontVariantNumeric:'tabular-nums',
                      fontSize: C.T_MD, textAlign:'right',
                      color: st ? PN.MUTED_SOFT : PN.TEXT,
                      textDecoration: st && st.tipo === 'annullo' ? 'line-through' : 'none',
                    }}>€{p.amount.toFixed(2)}</div>

                    {/* Riga 2 — quando e quale scontrino; il dispositivo sotto,
                        su una riga sua: in linea mandava a capo il separatore
                        e restava un puntino appeso in fondo. */}
                    <div style={{
                      fontSize: C.T_XS, color: PN.MUTED, minWidth: 0,
                      display:'flex', flexDirection:'column', gap: 3,
                    }}>
                      <span style={{display:'flex', alignItems:'center', gap: 7, flexWrap:'wrap'}}>
                        <span style={{fontVariantNumeric:'tabular-nums'}}>{fmtDataOra(p.ora)}</span>
                        {p.scontrinoNum && (
                          <React.Fragment>
                            <Sep/>
                            <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{p.scontrinoNum}</span>
                          </React.Fragment>
                        )}
                      </span>
                      {device && (
                        <span style={{minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                          <span style={{fontWeight: 700}}>Dispositivo:</span> {device}
                        </span>
                      )}
                    </div>
                    <div style={{display:'inline-flex', alignItems:'center', gap: 6, justifySelf:'end'}}>
                      {p.scontrinoNum && (
                        <button onClick={() => onDettaglio && onDettaglio(conto, p)} style={{
                          padding:'6px 10px', background: PN.WHITE,
                          border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
                          fontSize: C.T_XS, fontWeight: 600, color: PN.TEXT,
                          cursor:'pointer', fontFamily:'inherit',
                          display:'inline-flex', alignItems:'center', gap: 5,
                        }}>
                          {PnI.FileText ? <PnI.FileText size={12}/> : null}
                          Scontrino
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Annulli e resi — uno per scontrino, col documento collegato */}
          {payments.some(p => getStato && getStato(p.id)) && (
            <div style={{marginTop: 18}}>
              <Titolo>Annulli e resi</Titolo>
              <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                {payments.map(p => {
                  const st = getStato ? getStato(p.id) : null;
                  if (!st) return null;
                  return (
                    <div key={p.id} style={{
                      padding:'12px 14px',
                      background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius: C.R_MD,
                      display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 12, alignItems:'center',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background:'#FEE2E2', color:'#B91C1C',
                        display:'grid', placeItems:'center',
                      }}><PnI.RotateCcw size={16}/></div>
                      <div style={{minWidth: 0}}>
                        <div style={{fontSize: C.T_SM, fontWeight: 700, color:'#991B1B'}}>
                          {st.tipo === 'annullo' ? 'Annullo' : 'Reso'} scontrino {p.scontrinoNum}
                        </div>
                        <div style={{fontSize: C.T_XS, color:'#B91C1C', marginTop: 3, fontFamily:'ui-monospace, Menlo, monospace'}}>{st.doc}</div>
                      </div>
                      <div style={{fontWeight: 800, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, color:'#991B1B'}}>
                        −€{st.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rimborso — voce storica pre-esistente al collegamento annullo/reso,
              senza un pagamento specifico a cui agganciarsi: resta com'era. */}
          {conto.rimborso && (
            <div style={{marginTop: 18}}>
              <Titolo>Rimborso</Titolo>
              <div style={{
                padding:'12px 14px',
                background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius: C.R_MD,
                display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 12, alignItems:'center',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background:'#FEE2E2', color:'#B91C1C',
                  display:'grid', placeItems:'center',
                }}><PnI.RotateCcw size={16}/></div>
                <div style={{minWidth: 0}}>
                  <div style={{fontSize: C.T_SM, fontWeight: 700, color:'#991B1B'}}>
                    {conto.rimborso.method === 'carta' ? 'Carta' : 'Contanti'}
                  </div>
                  <div style={{fontSize: C.T_XS, color:'#B91C1C', marginTop: 3}}>
                    <span style={{fontVariantNumeric:'tabular-nums'}}>{fmtDataOra(conto.rimborso.ora)}</span>
                    {conto.rimborso.reason && ` · ${conto.rimborso.reason}`}
                  </div>
                </div>
                <div style={{fontWeight: 800, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, color:'#991B1B'}}>
                  −€{conto.rimborso.amount.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Piede: la chiusura, e se il conto è aperto anche il modo di chiuderlo */}
        <div style={{
          padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE_OFF,
          display:'flex', alignItems:'center', justifyContent:'flex-end', gap: 10,
        }}>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; }}
            style={{
              padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
              cursor:'pointer', fontFamily:'inherit',
              transition:'background 130ms ease, border-color 130ms ease',
            }}>Chiudi</button>
          {!isSaldato && (
            <button onClick={() => onSalda && onSalda(conto)}
              style={{
                padding:'10px 22px', background: PN.TEXT, color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700,
                cursor:'pointer', fontFamily:'inherit',
              }}>Vai al conto</button>
          )}
        </div>
      </div>
    </div>
  );
}

// Dettaglio scontrino — il documento con le sue righe, e le tre sole cose che
// si possono fare su un corrispettivo: stamparlo, rendere alcune righe,
// annullarlo. Diverso dalla fattura apposta: qui annullo e reso SONO chiamate
// dirette dell'API (DELETE / PATCH su IT-e-receipts), non serve un documento
// esterno come la nota di credito.
//
// Il reso è a righe intere, non a quantità: "il cliente rimanda indietro una
// delle due cotolette" è un caso che al banco non capita mai abbastanza da
// giustificare un contatore per riga.
function ScontrinoDettaglioModal({ conto, payment, stato, puoRendere, onClose, onAnnulla, onReso }) {
  const [sel, setSel] = React.useState(null); // null = sola lettura · Set(id) = selezione reso
  const [stampato, setStampato] = React.useState(false);

  const righe = conto.ordini || [];
  const statoInfo = !stato ? { label: 'Attivo', bg: '#DCFCE7', fg: '#16A34A' }
    : stato.tipo === 'annullo' ? { label: 'Annullato', bg: '#FEE2E2', fg: '#B91C1C' }
    : { label: 'Reso', bg: '#FEE2E2', fg: '#B91C1C' };
  const metodoLabel = payment.method === 'byup' ? 'Byup app' : payment.method === 'carta' ? 'Carta' : payment.method === 'piattaforma' ? 'Piattaforma' : 'Contanti';
  const totaleSel = righe.filter(r => sel && sel.has(r.id)).reduce((s, r) => s + r.qty * r.prezzo, 0);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex: 998,
      display:'flex', alignItems:'center', justifyContent:'center', padding: 20,
      fontFamily:'inherit',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, padding: 26,
        maxWidth: 440, width:'100%', maxHeight:'86vh', overflow:'auto',
      }}>
        <div style={{display:'flex', alignItems:'flex-start', gap: 10}}>
          <div style={{flex:1}}>
            <div style={{fontSize: C.T_LG, fontWeight: 800, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace'}}>
              {payment.scontrinoNum}
            </div>
            <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 3}}>
              {fmtDataOra(conto.dataOra.split(' ')[0] + ' ' + (payment.ora.split(' ')[1] || ''))} · {metodoLabel} · {conto.cliente}
            </div>
          </div>
          <span style={{
            padding:'4px 10px', borderRadius: 999, background: statoInfo.bg, color: statoInfo.fg,
            fontSize: C.T_XS, fontWeight: 700, flexShrink: 0,
          }}>{statoInfo.label}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: C.SURF_ALT, border:'none', color: PN.MUTED, cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={12}/></button>
        </div>

        {righe.length === 0 ? (
          <div style={{
            marginTop: 16, padding:'14px', background: C.SURF_ALT, borderRadius: C.R_SM,
            fontSize: C.T_SM, color: PN.MUTED, textAlign:'center',
          }}>Nessuna riga associata a questo scontrino — solo l'importo totale.</div>
        ) : (
          <div style={{marginTop: 16, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, overflow:'hidden'}}>
            {righe.map((r, i) => {
              const on = sel && sel.has(r.id);
              return (
                <div key={r.id}
                  onClick={sel ? () => setSel(s => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; }) : undefined}
                  style={{
                    display:'flex', alignItems:'center', gap: 10, padding:'9px 12px',
                    borderTop: i ? `1px solid ${PN.BORDER_SOFT}` : 'none',
                    background: on ? '#FFFBEB' : PN.WHITE,
                    cursor: sel ? 'pointer' : 'default',
                  }}>
                  {sel && (
                    <span style={{
                      width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                      border:`1.5px solid ${on ? '#B45309' : PN.BORDER}`,
                      background: on ? '#B45309' : PN.WHITE, color:'#fff',
                      display:'grid', placeItems:'center',
                    }}>{on && <PnI.Check size={10}/>}</span>
                  )}
                  <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.MUTED, minWidth: 24}}>{r.qty}×</span>
                  <span style={{flex:1, minWidth:0, fontSize: C.T_SM, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.nome}</span>
                  <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
                    €{(r.qty * r.prezzo).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          display:'flex', marginTop: 14, padding:'10px 14px', background: C.SURF_ALT, borderRadius: C.R_SM,
          fontSize: C.T_MD, fontWeight: 800, color: stato ? '#B91C1C' : PN.TEXT,
        }}>
          <span style={{flex:1}}>{stato ? (stato.tipo === 'annullo' ? 'Annullato' : 'Reso') : 'Totale'}</span>
          <span style={{fontVariantNumeric:'tabular-nums'}}>
            {stato ? '−' : ''}€{(stato ? stato.amount : payment.amount).toFixed(2)}
          </span>
        </div>

        {sel ? (
          <div style={{display:'flex', gap: 10, marginTop: 16}}>
            <button onClick={() => setSel(null)} style={{
              flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            }}>Indietro</button>
            <button onClick={() => onReso(totaleSel)} disabled={totaleSel <= 0} style={{
              flex:2, padding:'11px 14px', border:'none', borderRadius: C.R_SM,
              background: totaleSel > 0 ? PN.TEXT : '#E5E7EB',
              color: totaleSel > 0 ? '#fff' : '#9CA3AF',
              fontSize: C.T_SM, fontWeight: 700, cursor: totaleSel > 0 ? 'pointer' : 'default', fontFamily:'inherit',
            }}>{totaleSel > 0 ? `Rendi €${totaleSel.toFixed(2)}` : 'Scegli cosa rendere'}</button>
          </div>
        ) : (
          <div style={{display:'flex', gap: 8, marginTop: 16}}>
            <button onClick={() => { setStampato(true); setTimeout(() => setStampato(false), 2000); }} style={{
              flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
            }}>{stampato ? 'Stampato ✓' : 'Stampa'}</button>
            {puoRendere && (
              <button onClick={() => setSel(new Set())} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid #FCD34D`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#B45309', cursor:'pointer', fontFamily:'inherit',
              }}>Rendi</button>
            )}
            {!stato && (
              <button onClick={onAnnulla} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid #FCA5A5`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#B91C1C', cursor:'pointer', fontFamily:'inherit',
              }}>Annulla</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Popup apertura cassa — chiede il fondo cassa iniziale
function ApriCassaModal({ open, onClose, onConfirm }) {
  const [amount, setAmount] = React.useState('');
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAmount('');
      const r = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(r);
    }
    setShow(false);
  }, [open]);

  if (!open) return null;

  const value = parseFloat(amount) || 0;
  const canConfirm = value > 0;
  const chips = [50, 100, 150, 200];

  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60,
          opacity: show ? 1 : 0, transition:'opacity .18s ease',
        }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        width:420, maxWidth:'92vw',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex:61, overflow:'hidden', fontFamily:'inherit',
        animation: show ? 'cassaPopIn .22s cubic-bezier(.16,1,.3,1) both' : 'none',
        transform:'translate(-50%, -50%)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{
              width:38, height:38, borderRadius:10,
              background:'#ECFDF5', color:'#059669',
              display:'grid', placeItems:'center', flexShrink:0,
            }}>{Ic.cash ? <Ic.cash size={20}/> : '€'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize: C.T_MD, fontWeight: 800, color: PN.TEXT}}>Apri cassa</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 1}}>Indica il fondo cassa iniziale</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{padding:'18px 22px 4px'}}>
          <div style={{fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8}}>
            Fondo cassa
          </div>
          <div style={{
            display:'flex', alignItems:'baseline', gap:6,
            background:'#fff', border:`1.5px solid ${PN.BORDER}`, borderRadius:10,
            padding:'12px 14px', marginBottom:12,
          }}>
            <span style={{fontSize:22, fontWeight:700, color: PN.MUTED}}>€</span>
            <input
              type="number" autoFocus value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              style={{
                border:'none', outline:'none', width:'100%', padding:0, background:'transparent',
                fontSize:26, fontWeight:800, color: PN.TEXT, fontFamily:'inherit',
                fontVariantNumeric:'tabular-nums',
              }}/>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:4}}>
            {chips.map(v => {
              const sel = value === v;
              return (
                <button key={v} onClick={() => setAmount(String(v))} style={{
                  padding:'9px 4px', borderRadius:8,
                  background: sel ? PN.TEXT : '#fff',
                  color: sel ? '#fff' : PN.TEXT,
                  border: sel ? `1px solid ${PN.TEXT}` : `1px solid ${PN.BORDER}`,
                  fontSize: C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                }}>€{v}</button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
          <button onClick={onClose} style={{
            flex:1, padding:'11px 16px', background: PN.WHITE,
            border:`1px solid ${PN.BORDER}`, borderRadius:9,
            fontSize: C.T_SM, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          }}>Annulla</button>
          <button
            onClick={canConfirm ? () => onConfirm(value) : undefined}
            className="cassa-btn"
            style={{
              flex:2, padding:'11px 16px',
              background: canConfirm ? '#059669' : '#E5E7EB',
              color: canConfirm ? '#fff' : '#9CA3AF',
              border:'none', borderRadius:9, fontSize: C.T_SM, fontWeight:700,
              cursor: canConfirm ? 'pointer' : 'default', fontFamily:'inherit',
            }}>
            Apri cassa con €{value.toFixed(2)}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

// Popup conferma chiusura cassa — riepilogo e conferma quadratura
function ChiudiCassaModal({ open, fondoCassa, onClose, onConfirm }) {
  const [show, setShow] = React.useState(false);
  const [finale, setFinale] = React.useState(''); // saldo cassa finale inserito dall'operatore
  const [step, setStep] = React.useState('form'); // 'form' | 'warn'

  React.useEffect(() => {
    if (open) {
      setFinale('');
      setStep('form');
      const r = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(r);
    }
    setShow(false);
  }, [open]);

  if (!open) return null;

  // Incasso
  const incassoLordo = CASH_MOVEMENTS.reduce((s, m) => s + m.amount, 0);
  // Contanti = incassi dalla cassa fisica (gli incassi via app sono carta, non entrano nel cassetto).
  const incassoContanti = CASH_MOVEMENTS.filter(m => m.channel === 'cassa').reduce((s, m) => s + m.amount, 0);
  // IVA registrata, scorporata dal lordo per aliquota (ripartizione 10%/22%).
  const lordo10 = incassoLordo * 0.7, lordo22 = incassoLordo * 0.3;
  const iva10 = lordo10 - lordo10 / 1.10;
  const iva22 = lordo22 - lordo22 / 1.22;
  const ivaTotale = iva10 + iva22;

  // Saldo cassa (cassetto contanti)
  const saldoIniziale = fondoCassa || 0;
  const atteso = saldoIniziale + incassoContanti; // quanto dovrebbe esserci nel cassetto
  const finaleNum = parseFloat(String(finale).replace(',', '.')) || 0;
  // Differenza = atteso − finale dichiarato (di quanto il finale si discosta dall'atteso).
  const differenza = atteso - finaleNum;
  const diffZero = Math.abs(differenza) < 0.01;
  const canConfirm = String(finale).trim() !== '';

  const handleConfirmClick = () => {
    if (!canConfirm) return;
    if (!diffZero) { setStep('warn'); return; }
    onConfirm();
  };

  const rowStyle = (first) => ({
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'10px 14px', fontSize: C.T_SM, color: PN.TEXT,
    borderTop: first ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
  });
  const btnSecondary = { flex:1, padding:'11px 16px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius:9, fontSize: C.T_SM, fontWeight:600, cursor:'pointer', fontFamily:'inherit' };
  const btnPrimary = { flex:2, padding:'11px 16px', background: PN.TEXT, color:'#fff', border:'none', borderRadius:9, fontSize: C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit' };
  const btnDisabled = { ...btnPrimary, background:'#E5E7EB', color:'#9CA3AF', cursor:'default' };
  const btnWarn = { ...btnPrimary, background:'#D97706' };

  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60,
          opacity: show ? 1 : 0, transition:'opacity .18s ease',
        }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        width:420, maxWidth:'92vw',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex:61, overflow:'hidden', fontFamily:'inherit',
        animation: show ? 'cassaPopIn .22s cubic-bezier(.16,1,.3,1) both' : 'none',
        transform:'translate(-50%, -50%)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{
              width:38, height:38, borderRadius:10,
              background:'#FEF2F2', color:'#DC2626',
              display:'grid', placeItems:'center', flexShrink:0,
            }}>{Ic.cash ? <Ic.cash size={20}/> : '€'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize: C.T_MD, fontWeight: 800, color: PN.TEXT}}>Chiudi cassa</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 1}}>Conferma la quadratura di fine turno</div>
            </div>
          </div>
        </div>

        {step === 'form' ? (
          <>
            {/* Body */}
            <div style={{padding:'16px 22px 4px', display:'flex', flexDirection:'column', gap:16}}>
              {/* SALDO CASSA */}
              <div>
                <div style={{fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8}}>Saldo cassa</div>
                <div style={{border:`1px solid ${PN.BORDER}`, borderRadius:10, overflow:'hidden'}}>
                  <div style={rowStyle(true)}>
                    <span style={{color: PN.MUTED}}>Saldo cassa iniziale</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {saldoIniziale.toFixed(2)}</span>
                  </div>
                  <div style={rowStyle(false)}>
                    <span style={{color: PN.MUTED}}>Saldo cassa finale atteso</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}} title="Iniziale + contanti incassati">€ {atteso.toFixed(2)}</span>
                  </div>
                  {/* Saldo finale — input operatore */}
                  <div style={{...rowStyle(false), gap:12}}>
                    <span style={{color: PN.MUTED, whiteSpace:'nowrap'}}>Saldo cassa finale</span>
                    <div style={{display:'flex', alignItems:'center', gap:4, border:`1.5px solid ${PN.BORDER}`, borderRadius:8, padding:'6px 10px', background:'#fff'}}>
                      <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.MUTED}}>€</span>
                      <input
                        type="number" autoFocus value={finale}
                        onChange={e => setFinale(e.target.value)}
                        placeholder="0,00"
                        style={{border:'none', outline:'none', width:90, padding:0, background:'transparent',
                          fontSize: C.T_MD, fontWeight:800, color: PN.TEXT, fontFamily:'inherit',
                          textAlign:'right', fontVariantNumeric:'tabular-nums'}}/>
                    </div>
                  </div>
                  {/* Differenza */}
                  <div style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'12px 14px', borderTop:`1px solid ${PN.BORDER}`,
                    background: !canConfirm ? '#F8F9FB' : diffZero ? '#ECFDF5' : '#FFFBEB',
                  }}>
                    <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.TEXT}}>Differenza cassa</span>
                    <span style={{fontSize: C.T_MD, fontWeight:800, fontVariantNumeric:'tabular-nums',
                      color: !canConfirm ? PN.MUTED : diffZero ? '#059669' : '#B45309'}}>
                      {canConfirm ? `€ ${differenza.toFixed(2)}` : '—'}
                    </span>
                  </div>
                </div>
                {canConfirm && (
                  <div style={{fontSize: C.T_XS, color: diffZero ? '#059669' : '#B45309', marginTop:6}}>
                    {diffZero
                      ? 'Quadratura perfetta'
                      : `${differenza > 0 ? 'Mancano' : 'In eccesso'} € ${Math.abs(differenza).toFixed(2)} rispetto all'atteso (€ ${atteso.toFixed(2)})`}
                  </div>
                )}
              </div>

              {/* INCASSO TOTALE */}
              <div>
                <div style={{fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8}}>Incasso totale</div>
                <div style={{border:`1px solid ${PN.BORDER}`, borderRadius:10, overflow:'hidden'}}>
                  <div style={rowStyle(true)}>
                    <span style={{color: PN.MUTED}}>Importo lordo incassato</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {incassoLordo.toFixed(2)}</span>
                  </div>
                  <div style={rowStyle(false)}>
                    <span style={{color: PN.MUTED}}>IVA registrata · 10%</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {iva10.toFixed(2)}</span>
                  </div>
                  <div style={rowStyle(false)}>
                    <span style={{color: PN.MUTED}}>IVA registrata · 22%</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {iva22.toFixed(2)}</span>
                  </div>
                  <div style={{...rowStyle(false), background:'#F8F9FB', borderTop:`1px solid ${PN.BORDER}`}}>
                    <span style={{fontWeight:700, color: PN.TEXT}}>IVA totale registrata</span>
                    <span style={{fontWeight:800, fontVariantNumeric:'tabular-nums'}}>€ {ivaTotale.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
              <button onClick={onClose} style={btnSecondary}>Annulla</button>
              <button onClick={handleConfirmClick} style={canConfirm ? btnPrimary : btnDisabled}>
                Conferma chiusura
              </button>
            </div>
          </>
        ) : (
          /* Step avviso — differenza cassa ≠ 0 */
          <>
            <div style={{padding:'18px 22px 4px', display:'flex', alignItems:'flex-start', gap:14}}>
              <span style={{width:42, height:42, borderRadius:'50%', background:'#FEF3C7', color:'#B45309',
                display:'grid', placeItems:'center', flexShrink:0}}><Ic.warn size={20}/></span>
              <div>
                <div style={{fontSize: C.T_MD, fontWeight:800, color: PN.TEXT}}>La cassa non è in pari</div>
                <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop:4}}>
                  Differenza rilevata: <strong style={{color:'#B45309', fontVariantNumeric:'tabular-nums'}}>€ {differenza.toFixed(2)}</strong>. Sei sicuro di voler continuare?
                </div>
              </div>
            </div>
            <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
              <button onClick={() => setStep('form')} style={btnSecondary}>Torna indietro</button>
              <button onClick={onConfirm} style={btnWarn}>Chiudi comunque</button>
            </div>
          </>
        )}
      </div>
    </React.Fragment>
  );
}

function ContConti({ filter = 'all', fisc = null, onFiscClear, apri = null }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(filter);
  const [scartoPay, setScartoPay] = React.useState(null); // {conto, payment}
  useFiscTick();
  const [canale, setCanale] = React.useState('all'); // 'all' | 'asporto' | 'sala'
  const [modalPagamento, setModalPagamento] = React.useState(null);
  const [saldati, setSaldati] = React.useState(new Set());

  // Stato fiscale dello scontrino, per id pagamento: UN'AZIONE SOLA per
  // documento — annullato oppure reso, e da lì non si tocca più. Copre tutto
  // quello che succede davvero al banco; il reso di un reso è una
  // complicazione che nessuno ha chiesto e che costerebbe metà di questo file.
  const [scontriniStato, setScontriniStato] = React.useState({}); // { [paymentId]: {tipo, amount, doc} }
  const statoDi = (paymentId) => scontriniStato[paymentId] || null;
  // Il reso ha bisogno di sapere QUALI righe restituisce, e le righe sono del
  // conto: attendibili solo se il conto ha un pagamento solo, altrimenti sono
  // condivise fra scontrini diversi e non si sa quali coprisse questo.
  const puoRendere = (conto, payment) =>
    !statoDi(payment.id) && !!(conto.ordini || []).length && conto.payments.length === 1;

  const [modalRimborso, setModalRimborso] = React.useState(null); // {conto, payment, tipo:'annullo'|'reso', amount} | null
  const [rimborsoStep, setRimborsoStep] = React.useState('metodo'); // 'metodo' | 'conferma'
  const [dettaglioScontrino, setDettaglioScontrino] = React.useState(null); // {conto, payment} | null

  // Il conto che stai guardando: uno solo, perché il dettaglio è un foglio
  // sopra la lista e non un pannello che spezza la tabella.
  // Arrivando dal dettaglio di un ordine in Vendita diretta il conto è già
  // deciso — è quello che si stava guardando dall'altra parte del locale —
  // e il foglio si apre subito sui suoi documenti.
  const contoDaUrl = () => apri ? CONTI_MOCK.find(c => c.id === apri) || null : null;
  const [contoAperto, setContoAperto] = React.useState(contoDaUrl);
  // Arrivando da Cassa, se la giornata rimanda a un conto solo lo si apre
  // subito: è il documento su cui hai cliccato. Se ne rimanda più d'uno la
  // lista resta la lista — è già filtrata su quelli, e scegli tu.
  const fiscKey = fisc ? `${fisc.data}|${fisc.stato}` : '';
  React.useEffect(() => {
    if (!fisc) { setContoAperto(contoDaUrl()); return; }
    const attesi = CONTI_MOCK.filter(x => (x.payments || []).some(p =>
      (!fisc.data || String(p.ora || '').startsWith(fisc.data)) &&
      (!fisc.stato || docInfo(p).tipo === { scartato:'scartato', coda:'ritrasmissione', gestito:'gestito', ok:'ok', waiting:'waiting' }[fisc.stato])));
    setContoAperto(attesi.length === 1 ? attesi[0] : null);
  }, [fiscKey]);
  const [sortData, setSortData] = React.useState(null); // null | 'desc' (recenti) | 'asc' (meno recenti)

  // Filtro per periodo (P-106): stesso selettore della Cassa — CcPeriodoPicker
  // vive in contabilita-v2-cassa.jsx — applicato alla data di apertura del
  // conto. Convive col rimando `fisc` di Cassa, che filtra per giornata i
  // DOCUMENTI: sono due domande diverse e nessuna delle due spegne l'altra.
  const [periodo, setPeriodo] = React.useState(null); // {da, a} ISO o null
  const [periodoOpen, setPeriodoOpen] = React.useState(false);
  const periodoRef = React.useRef(null);
  React.useEffect(() => {
    if (!periodoOpen) return;
    const h = (e) => { if (periodoRef.current && !periodoRef.current.contains(e.target)) setPeriodoOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [periodoOpen]);

  // Cosa si restituisce l'ha già deciso il dettaglio scontrino; qui resta solo
  // il "come tornano i soldi".
  function apriRimborso(conto, payment, tipo, amount) {
    setDettaglioScontrino(null);
    setModalRimborso({ conto, payment, tipo, amount });
    setRimborsoStep('metodo');
  }
  function chiudiRimborso() {
    setModalRimborso(null);
    setRimborsoStep('metodo');
  }
  // Unico punto in cui lo stato del documento cambia. Il numero col suffisso è
  // il documento collegato, come farebbe parent_receipt_id lato SdI.
  function confermaRimborso() {
    const { payment, tipo, amount } = modalRimborso;
    setScontriniStato(st => ({ ...st, [payment.id]: {
      tipo, amount, doc: `${payment.scontrinoNum}-${tipo === 'annullo' ? 'A' : 'R'}`,
    }}));
    chiudiRimborso();
  }

  // KPI: tavoli in sospeso
  const nonSaldati = CONTI_MOCK.filter(c => c.stato === 'non_saldato');

  // L'alert "Da saldare" sparisce quando non ci sono conti aperti:
  // se era il filtro attivo, torna a "Tutti".
  React.useEffect(() => {
    if (activeFilter === 'da_saldare' && nonSaldati.length === 0) setActiveFilter('all');
  }, [activeFilter, nonSaldati.length]);

  // Filtro in arrivo da Cassa: la giornata e lo stato di trasmissione. È il
  // rimando del riepilogo, non una lista parallela — la lista è questa.
  const FISC_MAP = { scartato:'scartato', coda:'ritrasmissione', gestito:'gestito', ok:'ok', waiting:'waiting' };
  const fiscMatch = (p) => {
    if (!fisc) return true;
    if (fisc.data && !String(p.ora || '').startsWith(fisc.data)) return false;
    if (fisc.stato && docInfo(p).tipo !== FISC_MAP[fisc.stato]) return false;
    return true;
  };

  // Filtra per stato (alert da saldare) e per canale (sala / asporto)
  let filtered = CONTI_MOCK;
  if (fisc) {
    filtered = filtered.filter(c => (c.payments || []).some(fiscMatch));
  }
  if (activeFilter === 'da_saldare') {
    filtered = filtered.filter(c => c.stato === 'non_saldato');
  }
  if (canale !== 'all') {
    filtered = filtered.filter(c => (c.canale || 'sala') === canale);
  }
  if (periodo) {
    filtered = filtered.filter(c => {
      const g = String(c.dataOra || '').split(' ')[0];
      return g >= periodo.da && g <= periodo.a;
    });
  }

  // Filtra per ricerca (tavolo o cliente)
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      c.tavolo.toLowerCase().includes(q) ||
      c.cliente.toLowerCase().includes(q)
    );
  }

  // Ordina per data di apertura (toggle su click intestazione)
  if (sortData) {
    filtered = [...filtered].sort((a, b) => {
      const da = a.dataOra || '';
      const db = b.dataOra || '';
      return sortData === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
    });
  }

  // Ciclo a 3 stati: nessun ordinamento → più recenti → meno recenti → nessuno.
  // Permette di deselezionare l'ordinamento per Apertura tornando all'ordine originale.
  function toggleSortData() {
    setSortData(s => s === null ? 'desc' : s === 'desc' ? 'asc' : null);
  }

  const FISC_ETICHETTA = { scartato:'scartati', coda:'in ritrasmissione', gestito:'gestiti', ok:'trasmessi', waiting:'in attesa di mezzanotte' };
  // Il singolare serve dopo "Nessun documento …": il plurale ci stonava.
  const FISC_ETICHETTA_UNO = { scartato:'scartato', coda:'in ritrasmissione', gestito:'gestito', ok:'trasmesso', waiting:'in attesa di mezzanotte' };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Da dove arrivi: il filtro che Cassa ha impostato, e come toglierlo */}
      {fisc && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12,
          padding:'11px 16px', borderRadius: C.R_MD,
          background: PN.PINK_BG_SOFT, border:`1px solid ${PN.PINK_SOFT}`,
        }}>
          <span style={{color: PN.PINK_DARK, display:'flex'}}><Ic.receipt size={16}/></span>
          <span style={{flex:1, fontSize: C.T_SM, color: PN.TEXT}}>
            Documenti <b>{FISC_ETICHETTA[fisc.stato] || ''}</b> del{' '}
            <b>{fisc.data ? fisc.data.split('-').reverse().join('/') : ''}</b> — dal riepilogo di Cassa
          </span>
          <button onClick={() => onFiscClear && onFiscClear()}
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'6px 12px', borderRadius: C.R_SM,
              background:'transparent', border:`1px solid ${PN.PINK_SOFT}`,
              fontSize: C.T_XS, fontWeight: 600, color: PN.PINK_DARK,
              cursor:'pointer', fontFamily:'inherit',
              transition:'background 130ms ease',
            }}><Ic.close size={12}/> Mostra tutti i conti</button>
        </div>
      )}

      {/* Quando l'ultimo documento di quella giornata viene gestito la lista
          filtrata si svuota: senza una riga di spiegazione sembrerebbe un
          errore invece del lavoro finito. */}
      {fisc && filtered.length === 0 && (
        <div style={{
          padding:'22px 20px', borderRadius: C.R_MD, textAlign:'center',
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
        }}>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
            Nessun documento {FISC_ETICHETTA_UNO[fisc.stato] || ''} in questa giornata
          </div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 4}}>
            {fisc.stato === 'scartato'
              ? 'Gli scarti di quel giorno sono stati tutti gestiti.'
              : 'Non c\'è più niente con questo stato.'}
          </div>
        </div>
      )}

      {/* Card principale */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16, flexWrap:'wrap', gap: 12}}>
          <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Conti</div>
              <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{filtered.length} {filtered.length === 1 ? 'conto' : 'conti'} trovati</div>
            </div>
            {/* Filtri canale */}
            <div style={{display:'flex', gap: 8, flexWrap:'wrap'}}>
              {[
                {id:'all',     label:'Tutti'},
                {id:'asporto', label:'Asporto'},
                {id:'sala',    label:'Sala'},
              ].map(t => (
                <FilterChip key={t.id} active={canale===t.id} onClick={() => setCanale(t.id)} label={t.label}/>
              ))}
            </div>
          </div>
          {nonSaldati.length > 0 && (
            <button
              onClick={() => setActiveFilter(activeFilter==='da_saldare' ? 'all' : 'da_saldare')}
              style={{
                display:'inline-flex', alignItems:'center', gap: 8,
                padding:'7px 14px', borderRadius: C.R_PILL,
                background: activeFilter==='da_saldare' ? '#DC2626' : '#FEF2F2',
                border: `1px solid ${activeFilter==='da_saldare' ? '#DC2626' : '#FECACA'}`,
                color: activeFilter==='da_saldare' ? '#fff' : '#991B1B',
                fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>
              <span style={{
                width:8, height:8, borderRadius:'50%',
                background: activeFilter==='da_saldare' ? '#fff' : '#DC2626',
              }}/>
              {nonSaldati.length} da saldare
            </button>
          )}
        </div>

        {/* Ricerca */}
        <div style={{display:'flex', gap: 10, marginBottom: 14, flexWrap:'wrap'}}>
          <div style={{
            flex:'1 1 240px', display:'flex', alignItems:'center', gap: 8,
            padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            background: PN.WHITE,
          }}>
            <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
            <input
              type="text"
              placeholder="Cerca tavolo o cliente…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit',
              }}
            />
          </div>
          {/* Stesso bottone e stesso popover della Cassa, stessa posizione
              rispetto alla ricerca: chi ha imparato il gesto di là lo ritrova
              identico di qua. */}
          <div ref={periodoRef} style={{position:'relative'}}>
            <button onClick={() => setPeriodoOpen(o => !o)}
              style={{...iconBtn, transition: 'background 140ms ease, border-color 140ms ease, transform 130ms ease'}}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}>
              <Ic.calendar size={14}/> {ccPeriodoLabel(periodo)}
            </button>
            {periodoOpen && (
              <CcPeriodoPicker
                selected={periodo}
                onPick={(p) => { setPeriodo(p); setPeriodoOpen(false); }}
                onClear={() => { setPeriodo(null); setPeriodoOpen(false); }}
              />
            )}
          </div>
        </div>

        {/* Tabella o stato vuoto */}
        {filtered.length === 0 ? (
          <div style={{
            padding:'40px 20px', textAlign:'center',
            background: C.SURF, borderRadius: C.R_MD,
            color: PN.MUTED,
          }}>
            <div style={{fontSize: C.T_SM, fontWeight: 600}}>Nessun conto trovato</div>
            <div style={{fontSize: C.T_XS, marginTop: 6}}>Nessun conto corrisponde ai filtri</div>
          </div>
        ) : (
          <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`, ...STSCROLL()}}>
            <div style={{
              display:'grid',
              gridTemplateColumns:'0.7fr 0.7fr 0.7fr 1.1fr 0.9fr 0.8fr 110px', ...STMIN(640),
              padding:'10px 14px', background: C.TH_BG,
              fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
              textTransform:'uppercase', letterSpacing: 0.5,
            }}>
              {/* Cliccabile è il nome, non la cella: prima si allargava per
                  tutta la colonna — `alignSelf:'stretch'` più i margini
                  negativi a riempire il padding della testata — e a
                  ordinamento attivo si campiva l'intero riquadro. Che
                  l'ordinamento sia acceso lo dicono già il testo più scuro e
                  la freccia, senza colorare mezza intestazione. */}
              <span
                onClick={toggleSortData}
                style={{
                  cursor:'pointer', userSelect:'none',
                  justifySelf:'start', alignSelf:'center',
                  display:'inline-flex', alignItems:'center', gap:4,
                  color: sortData ? PN.TEXT : C.TH_TEXT,
                  transition:'color .15s',
                }}
                title="Ordina per data">
                Data
                <span style={{
                  display:'inline-flex',
                  opacity: sortData ? 1 : 0.35,
                  transform: sortData === 'asc' ? 'rotate(180deg)' : 'none',
                  transition:'transform .15s',
                }}><PnI.ChevronDown size={11}/></span>
              </span>
              <span>Ora</span>
              <span>Origine</span>
              <span>Riferimento</span>
              <span style={{textAlign:'center'}}>Totale</span>
              <span style={{textAlign:'center'}}>Da saldare</span>
              <span/>
            </div>
            <MaxRowsScroll maxRows={10}>
            {filtered.map((conto, i) => {
              // La riga aperta resta marcata sotto al foglio: chiudendolo si
              // vede subito da dove si è tornati.
              const isAperto = !!contoAperto && contoAperto.id === conto.id;
              return (
                <React.Fragment key={conto.id}>
                  <div
                    data-row
                    data-conto-id={conto.id}
                    onClick={() => setContoAperto(conto)}
                    onMouseEnter={e => { if (!isAperto) e.currentTarget.style.background = '#F7F8FA'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isAperto ? PN.PINK_SOFT : PN.WHITE; }}
                    style={{
                      display:'grid',
                      gridTemplateColumns:'0.7fr 0.7fr 0.7fr 1.1fr 0.9fr 0.8fr 110px', ...STMIN(640),
                      padding:'12px 14px', alignItems:'center',
                      fontSize: C.T_SM, color: PN.TEXT,
                      borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                      background: isAperto ? PN.PINK_SOFT : PN.WHITE,
                      boxShadow: isAperto ? `inset 3px 0 0 ${PN.PINK}` : 'none',
                      cursor:'pointer',
                      transition:'background 0.12s, box-shadow 0.12s',
                    }}>
                    <span style={{
                      fontWeight: 500,
                      color: sortData ? PN.TEXT : PN.MUTED,
                      fontVariantNumeric:'tabular-nums',
                      alignSelf:'stretch',
                      display:'flex', alignItems:'center',
                      margin:'-12px 0', padding:'12px 8px',
                      background: sortData ? C.SURF_ALT : 'transparent',
                      transition:'background .15s',
                    }}>{fmtData(conto.dataOra)}</span>
                    <span style={{
                      fontWeight: 500, color: PN.MUTED, fontSize: C.T_XS,
                      fontVariantNumeric:'tabular-nums',
                    }}>{oraChiusura(conto)}</span>
                    <span style={{fontWeight:600, color: PN.TEXT, display:'inline-flex', alignItems:'center', gap:6}}>
                      <span style={{
                        display:'inline-flex',
                        color: isAperto ? PN.PINK_DARK : PN.MUTED_LIGHT,
                        transition:'color .15s',
                      }}><PnI.ChevronRight size={11}/></span>
                      {conto.tavolo}
                    </span>
                    <span style={{display:'inline-flex', alignItems:'center', gap:6, minWidth:0}}>
                      {conto.riferimento ? (
                        <React.Fragment>
                          {conto.riferimento.tipo === 'byup' && <ByupMark size={14}/>}
                          <span style={{
                            fontWeight: 600, color: PN.TEXT,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                          }}>{conto.riferimento.nome}</span>
                        </React.Fragment>
                      ) : (
                        <span style={{color: PN.MUTED}}>—</span>
                      )}
                    </span>
                    <span style={{fontWeight:800, color: PN.TEXT, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, textAlign:'center'}}>
                      €{conto.totaleConto.toFixed(2)}
                    </span>
                    <span style={{
                      fontWeight: 600, fontSize: C.T_XS, fontVariantNumeric:'tabular-nums', textAlign:'center',
                      color: conto.stato === 'saldato' ? PN.MUTED_SOFT : PN.TEXT,
                    }}>
                      {conto.stato === 'saldato' ? '—' : `€${conto.daSaldare.toFixed(2)}`}
                    </span>
                    <span style={{textAlign:'right'}} onClick={e => e.stopPropagation()}>
                      {conto.stato === 'non_saldato' && !saldati.has(conto.id) && (
                        <button
                          onClick={() => setModalPagamento(conto)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#2E333C'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 17, 21, 0.30)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = PN.TEXT; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
                          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                          style={{
                            padding:'7px 12px', background: PN.TEXT, color:'#fff',
                            border:'none', borderRadius: 9, fontSize: C.T_XS,
                            fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                            transition:'background 130ms ease, box-shadow 150ms ease, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1)',
                          }}>
                          Vai al conto
                        </button>
                      )}
                      {conto.stato === 'non_saldato' && saldati.has(conto.id) && (
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          padding:'4px 10px', borderRadius: C.R_PILL,
                          background:'#D1FAE5', color:'#065F46',
                          fontSize: C.T_XS, fontWeight:600,
                        }}>✓ Saldato</span>
                      )}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            </MaxRowsScroll>
          </div>
        )}
      </div>

      {/* Dettaglio del conto — al posto del pannello che si apriva sotto la riga */}
      {contoAperto && (
        <ContoDettaglioSheet
          conto={contoAperto}
          saldato={saldati.has(contoAperto.id)}
          getStato={statoDi}
          onClose={() => setContoAperto(null)}
          onDettaglio={(c, p) => setDettaglioScontrino({ conto: c, payment: p })}
          onScarto={(p) => setScartoPay({ conto: contoAperto, payment: p })}
          onSalda={(c) => { setContoAperto(null); setModalPagamento(c); }}
        />
      )}

      {/* Dettaglio scontrino: il documento, le sue righe, e da lì Stampa/Rendi/Annulla */}
      {dettaglioScontrino && (
        <ScontrinoDettaglioModal
          conto={dettaglioScontrino.conto}
          payment={dettaglioScontrino.payment}
          stato={statoDi(dettaglioScontrino.payment.id)}
          puoRendere={puoRendere(dettaglioScontrino.conto, dettaglioScontrino.payment)}
          onClose={() => setDettaglioScontrino(null)}
          onAnnulla={() => apriRimborso(dettaglioScontrino.conto, dettaglioScontrino.payment, 'annullo', dettaglioScontrino.payment.amount)}
          onReso={(amount) => apriRimborso(dettaglioScontrino.conto, dettaglioScontrino.payment, 'reso', amount)}
        />
      )}

      {/* Modal rimborso — SOLO il "come tornano i soldi": cosa si sta
          restituendo (tutto o alcune righe) l'ha già deciso il dettaglio
          scontrino. Il metodo dipende dal canale del pagamento originale. */}
      {modalRimborso && (() => {
        const { conto, payment, tipo, amount } = modalRimborso;
        // contanti → restituzione manuale in cassa; carta/byup/altro → rimborso Stripe
        const useStripe = payment.method !== 'contanti';
        const channelLabel = payment.method === 'byup' ? 'Byup app' : payment.method === 'carta' ? 'Carta' : payment.method === 'piattaforma' ? 'Piattaforma' : 'Contanti';
        const titolo = tipo === 'annullo' ? 'Annulla scontrino' : 'Reso';
        return (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0,
          background:'rgba(15,17,21,0.42)', zIndex: 999,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'inherit',
        }} onClick={chiudiRimborso}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...PN.GLASS_STRONG, borderRadius: 20,
              padding: 32, maxWidth: 440, width:'100%',
            }}>
            {rimborsoStep === 'metodo' ? (
              <React.Fragment>
                <h2 style={{margin:'0 0 4px 0', fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
                  {titolo}
                </h2>
                <p style={{margin:'0 0 24px 0', fontSize: C.T_SM, color: PN.MUTED}}>
                  {conto.cliente} · {channelLabel} · €{amount.toFixed(2)}
                </p>
                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:24}}>
                  {useStripe ? (
                    <button
                      onClick={() => setRimborsoStep('conferma')}
                      style={{
                        padding:'14px 16px', background:'#4F46E5', color:'#fff',
                        border:'none', borderRadius: C.R_SM,
                        fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        textAlign:'left',
                      }}>
                      Rimborsa tramite Stripe
                      <div style={{fontSize: C.T_XS, fontWeight:500, opacity:0.8, marginTop:3}}>
                        {payment.method === 'byup'
                          ? 'Il cliente riceverà il rimborso sul metodo collegato all\'app Byup'
                          : 'Il cliente riceverà il rimborso sulla carta originale'}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setRimborsoStep('conferma')}
                      style={{
                        padding:'14px 16px', background:'#F9FAFB', color: PN.TEXT,
                        border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
                        fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        textAlign:'left',
                      }}>
                      Rimborso con contanti
                      <div style={{fontSize: C.T_XS, fontWeight:500, color: PN.MUTED, marginTop:3}}>
                        Restituzione manuale in cassa
                      </div>
                    </button>
                  )}
                </div>
                <button
                  onClick={chiudiRimborso}
                  style={{
                    width:'100%', padding:'10px 16px', background: PN.WHITE,
                    border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                    fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  }}>
                  Annulla
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h2 style={{margin:'0 0 4px 0', fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
                  {tipo === 'annullo' ? 'Confermi l\'annullo?' : 'Confermi il reso?'}
                </h2>
                <p style={{margin:'0 0 24px 0', fontSize: C.T_SM, color: PN.MUTED}}>
                  {useStripe ? 'Stripe' : 'Contanti'} · {conto.cliente} · €{amount.toFixed(2)}
                </p>
                <div style={{display:'flex', gap:10}}>
                  <button
                    onClick={() => setRimborsoStep('metodo')}
                    style={{
                      flex:1, padding:'10px 16px', background: PN.WHITE,
                      border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                      fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                    }}>
                    Indietro
                  </button>
                  <button
                    onClick={confermaRimborso}
                    style={{
                      flex:1, padding:'10px 16px',
                      background: useStripe ? '#4F46E5' : PN.TEXT,
                      color:'#fff', border:'none', borderRadius: 9,
                      fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    }}>
                    Conferma
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        );
      })()}

      {/* Modal pagamento — SalaSaldaModal (sala-salda-modal.jsx è caricato prima in pagina) */}
      {modalPagamento && (
        <SalaSaldaModal
          open={true}
          tavolo={{
            id: (modalPagamento.tavolo.match(/\d+/) || [])[0],
            party: modalPagamento.cliente || '',
            coperti: 1,
            guests: [],
            ordini: modalPagamento.ordini || [{ id: modalPagamento.id + '-1', nome: 'Saldo conto', prezzo: modalPagamento.daSaldare, qty: 1 }],
          }}
          onClose={() => setModalPagamento(null)}
          onConfirm={(esito) => { if (!esito || esito.saldato !== false) setSaldati(s => new Set([...s, modalPagamento.id])); }}
        />
      )}

      {/* Dettaglio dello scarto del singolo documento */}
      {scartoPay && (
        <DocScartoSheet
          conto={scartoPay.conto}
          payment={scartoPay.payment}
          onClose={() => setScartoPay(null)}
        />
      )}
    </div>
  );
}

window.ContConti = ContConti;
window.PagamentoFiscChip = PagamentoFiscChip;
window.DocScartoSheet = DocScartoSheet;

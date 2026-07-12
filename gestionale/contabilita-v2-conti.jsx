// Tab Conti v2 — gestione conti aperti e saldati, integrazione con sala

// Mock data: 20 conti — mix di non saldati (parziali, scoperti, in attesa) e saldati (carta/contanti, con e senza rimborso)
const CONTI_MOCK = [
  // ─── Non saldati ───────────────────────────────────────────────
  { id:'cnt-1',  idOrdine:'#2511-0042', dataOra:'2025-11-15 19:42', tavolo:'Tavolo 4',  cliente:'Mario Rossi',       riferimento:{nome:'Mario Rossi', tipo:'byup'}, liberatoOre:5.5,  totaleConto:85.00,   daSaldare:45.00,  stato:'non_saldato', note:'Ospiti morbidi', operatore:'Marco',
    ordini: [{id:'o1-1',nome:'Tagliere salumi',qty:2,prezzo:13.00},{id:'o1-2',nome:'Pasta amatriciana',qty:2,prezzo:14.00},{id:'o1-3',nome:'Birra artigianale',qty:3,prezzo:6.00},{id:'o1-4',nome:'Acqua minerale',qty:2,prezzo:2.50},{id:'o1-5',nome:'Tiramisù',qty:1,prezzo:6.50},{id:'o1-6',nome:'Caffè',qty:1,prezzo:1.50}],
    payments: [{id:'p1a', method:'contanti', amount:40.00, ora:'2025-11-15 19:55', scontrinoNum:'SC-2511-0042-1'}] },
  { id:'cnt-3',  idOrdine:'#2511-0040', dataOra:'2025-11-15 22:30', tavolo:'Asporto', canale:'asporto', cliente:'Simone De Luca',    liberatoOre:2.0,  totaleConto:64.50,   daSaldare:64.50,  stato:'non_saldato', note:'Allergeni richiesti', operatore:'Marco',
    ordini: [{id:'o3-1',nome:'Pizza Margherita',qty:1,prezzo:9.00},{id:'o3-2',nome:'Pizza Diavola',qty:1,prezzo:11.00},{id:'o3-3',nome:'Pizza Quattro stagioni',qty:1,prezzo:12.00},{id:'o3-4',nome:'Birra media',qty:2,prezzo:5.50},{id:'o3-5',nome:'Supplì (4pz)',qty:1,prezzo:7.00},{id:'o3-6',nome:'Tiramisù',qty:1,prezzo:5.50},{id:'o3-7',nome:'Acqua minerale',qty:2,prezzo:2.50},{id:'o3-8',nome:'Patatine fritte',qty:1,prezzo:4.00}],
    payments: [] },
  { id:'cnt-11', idOrdine:'#2511-0036', dataOra:'2025-11-14 21:45', tavolo:'Tavolo 10', cliente:'Roberto Esposito',  liberatoOre:18,   totaleConto:128.00,  daSaldare:128.00, stato:'non_saldato', note:'Cliente uscito senza pagare', operatore:'Giulia',
    ordini: [{id:'o11-1',nome:'Antipasto misto',qty:3,prezzo:11.00},{id:'o11-2',nome:'Risotto ai funghi',qty:2,prezzo:16.00},{id:'o11-3',nome:'Tagliata di manzo',qty:1,prezzo:24.00},{id:'o11-4',nome:'Vino al bicchiere',qty:3,prezzo:7.00},{id:'o11-5',nome:'Acqua minerale',qty:2,prezzo:3.00},{id:'o11-6',nome:'Caffè',qty:3,prezzo:1.50},{id:'o11-7',nome:'Dolce del giorno',qty:1,prezzo:7.50}],
    payments: [] },
  { id:'cnt-20', idOrdine:'#2511-0046', dataOra:'2025-11-16 13:45', tavolo:'Tavolo 12', cliente:'Compleanno Russo (8 ospiti)', riferimento:{nome:'Giulia Russo', tipo:'prenotazione'}, liberatoOre:0.5, totaleConto:312.00, daSaldare:42.00, stato:'non_saldato', note:'Conto diviso', operatore:'Marco',
    ordini: [{id:'o20-1',nome:'Coperto',qty:8,prezzo:2.00},{id:'o20-2',nome:'Antipasto misto',qty:8,prezzo:12.00},{id:'o20-3',nome:'Pasta alla norma',qty:4,prezzo:13.00},{id:'o20-4',nome:'Pasta al ragù',qty:4,prezzo:13.00},{id:'o20-5',nome:'Secondo del giorno',qty:2,prezzo:22.00},{id:'o20-6',nome:'Bottiglia vino rosso',qty:2,prezzo:18.00},{id:'o20-7',nome:'Acqua minerale',qty:8,prezzo:2.00}],
    payments: [
      {id:'p20a', method:'byup',     amount:45.00, ora:'2025-11-16 14:05', scontrinoNum:'SC-2511-0046-1'},
      {id:'p20b', method:'byup',     amount:45.00, ora:'2025-11-16 14:06', scontrinoNum:'SC-2511-0046-2'},
      {id:'p20c', method:'carta',    amount:90.00, ora:'2025-11-16 14:09', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0046-3'},
      {id:'p20d', method:'contanti', amount:50.00, ora:'2025-11-16 14:11', scontrinoNum:'SC-2511-0046-4'},
      {id:'p20e', method:'carta',    amount:40.00, ora:'2025-11-16 14:13', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0046-5'},
    ] },

  // ─── Saldati ───────────────────────────────────────────────────
  { id:'cnt-5',  idOrdine:'#2511-0038', dataOra:'2025-11-13 20:30', tavolo:'Tavolo 1',  cliente:'Lucia Marchesi',    riferimento:{nome:'Lucia Marchesi', tipo:'byup'}, liberatoOre:48,    totaleConto:72.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p5a', method:'carta', amount:72.00, ora:'2025-11-13 21:15', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0038-1'}] },
  { id:'cnt-6',  idOrdine:'#2511-0037', dataOra:'2025-11-08 21:00', tavolo:'Tavolo 3',  cliente:'Francesco Rossi',   liberatoOre:168,   totaleConto:95.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p6a', method:'contanti', amount:95.50, ora:'2025-11-08 21:45', scontrinoNum:'SC-2511-0037-1'}] },
  { id:'cnt-13', idOrdine:'#2511-0035', dataOra:'2025-11-13 13:15', tavolo:'Tavolo 4',  cliente:'Pellegrini',        liberatoOre:60,    totaleConto:64.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p13a', method:'carta', amount:64.00, ora:'2025-11-13 13:55', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0035-1'}] },
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
      {id:'p21d', method:'carta',    amount:200.00, ora:'2025-11-09 22:48', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0029-4'},
      {id:'p21e', method:'contanti', amount:80.00, ora:'2025-11-09 22:50', scontrinoNum:'SC-2511-0029-5'},
      {id:'p21f', method:'carta',    amount:25.00, ora:'2025-11-09 22:52', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0029-6'},
    ] },
  { id:'cnt-22', idOrdine:'#2511-0027', dataOra:'2025-11-08 13:00', tavolo:'Tavolo 5',  cliente:'Pranzo team',         liberatoOre:144,  totaleConto:156.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'byup',
    payments: [
      {id:'p22a', method:'byup', amount:35.00, ora:'2025-11-08 14:20', scontrinoNum:'SC-2511-0027-1'},
      {id:'p22b', method:'byup', amount:42.00, ora:'2025-11-08 14:21', scontrinoNum:'SC-2511-0027-2'},
      {id:'p22c', method:'byup', amount:28.00, ora:'2025-11-08 14:22', scontrinoNum:'SC-2511-0027-3'},
      {id:'p22d', method:'byup', amount:51.00, ora:'2025-11-08 14:23', scontrinoNum:'SC-2511-0027-4'},
    ] },
  { id:'cnt-23', idOrdine:'#2511-0025', dataOra:'2025-11-07 21:30', tavolo:'Tavolo 10', cliente:'Tavolata Conti (6 ospiti)', liberatoOre:168, totaleConto:267.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'contanti',
    payments: [
      {id:'p23a', method:'contanti', amount:45.00, ora:'2025-11-07 23:10', scontrinoNum:'SC-2511-0025-1'},
      {id:'p23b', method:'contanti', amount:50.00, ora:'2025-11-07 23:11', scontrinoNum:'SC-2511-0025-2'},
      {id:'p23c', method:'byup',     amount:42.00, ora:'2025-11-07 23:14', scontrinoNum:'SC-2511-0025-3'},
      {id:'p23d', method:'carta',    amount:75.00, ora:'2025-11-07 23:16', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0025-4'},
      {id:'p23e', method:'contanti', amount:55.00, ora:'2025-11-07 23:18', scontrinoNum:'SC-2511-0025-5'},
    ] },
  { id:'cnt-15', idOrdine:'#2511-0033', dataOra:'2025-11-12 13:30', tavolo:'Asporto', canale:'asporto', cliente:'Anna Costa',        riferimento:{nome:'Anna Costa', tipo:'byup'}, liberatoOre:96,    totaleConto:38.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'byup',
    payments: [{id:'p15a', method:'byup', amount:38.50, ora:'2025-11-12 14:10', scontrinoNum:'SC-2511-0033-1'}] },
  { id:'cnt-16', idOrdine:'#2511-0032', dataOra:'2025-11-11 21:30', tavolo:'Tavolo 11', cliente:'Gallo (aziendale)', liberatoOre:120,   totaleConto:340.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p16a', method:'carta', amount:340.00, ora:'2025-11-11 23:00', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0032-1'}] },
  { id:'cnt-17', idOrdine:'#2511-0030', dataOra:'2025-11-10 12:45', tavolo:'Tavolo 6',  cliente:'Coppia Neri',       riferimento:{nome:'Francesca Neri', tipo:'prenotazione'}, liberatoOre:144,   totaleConto:58.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p17a', method:'carta', amount:58.00, ora:'2025-11-10 13:50', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0030-1'}],
    rimborso: {amount:12.00, ora:'2025-11-10 14:05', method:'carta', reason:'Coperto contestato'} },
  { id:'cnt-7',  idOrdine:'#2509-0156', dataOra:'2025-08-17 22:15', tavolo:'Tavolo 6',  cliente:'Paolo Bianchi',     liberatoOre:2160,  totaleConto:110.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p7a', method:'carta', amount:110.00, ora:'2025-08-17 22:45', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2509-0156-1'}],
    rimborso: {amount:25.00, ora:'2025-08-18 10:12', method:'carta', reason:'Piatto reso — pasta troppo cotta'} },
  { id:'cnt-18', idOrdine:'#2510-0089', dataOra:'2025-10-05 21:00', tavolo:'Asporto', canale:'asporto', cliente:'Sara Mancini',      liberatoOre:1032,  totaleConto:76.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p18a', method:'contanti', amount:76.00, ora:'2025-10-05 21:50', scontrinoNum:'SC-2510-0089-1'}] },
  { id:'cnt-19', idOrdine:'#2509-0143', dataOra:'2025-09-20 13:00', tavolo:'Tavolo 3',  cliente:'Luca Caruso',       liberatoOre:1380,  totaleConto:42.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p19a', method:'carta', amount:42.50, ora:'2025-09-20 13:55', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2509-0143-1'}] },
  { id:'cnt-8',  idOrdine:'#2411-0004', dataOra:'2024-11-14 19:00', tavolo:'Asporto', canale:'asporto', cliente:'Elena Greco',       liberatoOre:8760,  totaleConto:48.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p8a', method:'contanti', amount:48.00, ora:'2024-11-14 19:45', scontrinoNum:'SC-2411-0004-1'}] },
];

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

// Logo Byup inline — gradiente brand con la "b" di Byup (stesso trattamento
// degli avatar app in sala e dell'avatar profilo in sidebar).
// Segnala che il riferimento è un utente loggato sulla Byup App.
function ByupMark({ size = 16 }) {
  return (
    <span title="Utente Byup App" style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width: size, height: size, borderRadius:'50%', flexShrink:0,
      background: 'linear-gradient(135deg, #FF5A5F, #B53338)', color:'#fff',
      fontSize: size * 0.66, fontWeight: 800, lineHeight: 1,
      fontFamily:'inherit',
    }}>b</span>
  );
}

function ContSaldaModal({ open, conto, onClose, onConfirm }) {
  const [method, setMethod] = React.useState('contanti');
  const [cash, setCash] = React.useState('');
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (open) { setMethod('contanti'); setCash(''); setDone(false); }
  }, [open]);

  if (!open || !conto) return null;

  const total = conto.daSaldare;
  const tendered = parseFloat(cash) || 0;
  const canConfirm = method !== 'contanti' || (tendered >= total - 0.01 && total > 0);
  const resto = tendered - total;
  const hasPartial = conto.totaleConto > conto.daSaldare;

  const chipVals = Array.from(new Set([
    total,
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
  ])).filter(v => v >= total).slice(0, 4);

  const closeBtnStyle = {
    width:32, height:32, borderRadius:8,
    background:'#F1F2F5', border:'none', cursor:'pointer',
    fontSize:20, fontFamily:'inherit', color:'#6B7280',
  };

  function handleConfirm() {
    setDone(true);
    onConfirm && onConfirm();
  }

  return (
    <React.Fragment>
      <div onClick={done ? onClose : undefined} style={{position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60}}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:860, maxWidth:'94vw', maxHeight:'90vh',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex:61, display:'flex', flexDirection:'column', overflow:'hidden',
        fontFamily:'inherit',
      }}>
      {done ? (
        <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:30}}>
          <div style={{width:72, height:72, borderRadius:'50%', background:'#DCFCE7', color:'#16A34A', marginBottom:16, display:'grid', placeItems:'center'}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13 L9 17 L19 7"/>
            </svg>
          </div>
          <div style={{fontSize:C.T_MD, fontWeight:700, color:'#0F1115', marginBottom:4}}>Pagamento incassato</div>
          <div style={{fontSize:C.T_XL, fontWeight:800, color:'#0F1115', marginBottom:8, letterSpacing:-0.5, fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</div>
          <div style={{fontSize:C.T_SM, color:'#6B7280', marginBottom:24}}>
            {conto.tavolo} · {method === 'contanti' ? 'Contanti' : 'Carta'}
          </div>
          <button onClick={onClose} style={{padding:'11px 24px', background:'#0F1115', color:'#fff', border:'none', borderRadius:9, fontSize:C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
            Chiudi
          </button>
        </div>
      ) : (
        <React.Fragment>
        {/* Header */}
        <div style={{padding:'14px 20px', borderBottom:'1px solid #F0F2F5', display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <div style={{flex:1}}>
            <div style={{fontSize:C.T_XS, color:'#6B7280', fontWeight:800, letterSpacing:0.6, textTransform:'uppercase'}}>Salda conto</div>
            <div style={{fontSize:C.T_LG, fontWeight:800, color:'#0F1115', marginTop:1}}>
              {conto.tavolo}{conto.cliente ? ` · ${conto.cliente}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>×</button>
        </div>

        {/* Body 2 colonne */}
        <div style={{flex:1, display:'flex', minHeight:0, overflow:'hidden'}}>
          {/* Sinistra: piatti ordinati */}
          <div style={{flex:'1.5 1 0', display:'flex', flexDirection:'column', borderRight:'1px solid #F0F2F5', minWidth:0, overflowY:'auto', padding:'16px 20px'}}>
            <div style={{fontSize:C.T_XS, fontWeight:800, color:'#6B7280', letterSpacing:0.6, textTransform:'uppercase', marginBottom:10}}>Piatti ordinati</div>
            {hasPartial && (
              <div style={{fontSize:C.T_XS, color:'#9CA3AF', marginBottom:10, padding:'8px 12px', background:'#F9FAFB', borderRadius:8, border:'1px solid #E5E7EB'}}>
                Tot. €{conto.totaleConto.toFixed(2)} · già incassato €{(conto.totaleConto - conto.daSaldare).toFixed(2)}
              </div>
            )}
            <div style={{display:'flex', flexDirection:'column', gap:3}}>
              {(conto.ordini || []).map(item => (
                <div key={item.id} style={{display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'#F9FAFB'}}>
                  <span style={{fontSize:C.T_XS, fontWeight:700, color:'#9CA3AF', minWidth:22, flexShrink:0}}>{item.qty}×</span>
                  <span style={{flex:1, fontSize:C.T_SM, fontWeight:600, color:'#0F1115'}}>{item.nome}</span>
                  <span style={{fontSize:C.T_SM, fontWeight:700, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>€{(item.prezzo * item.qty).toFixed(2)}</span>
                </div>
              ))}
              {!conto.ordini && (
                <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:10, background:'#F9FAFB', border:'1.5px solid #E5E7EB'}}>
                  <div style={{flex:1, fontSize:C.T_SM, fontWeight:700, color:'#0F1115'}}>Saldo conto</div>
                  <div style={{fontSize:C.T_MD, fontWeight:800, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</div>
                </div>
              )}
            </div>
            <div style={{height:1, background:'#E5E7EB', margin:'12px 0'}}/>
            <div style={{display:'flex', justifyContent:'space-between', padding:'2px 12px', fontSize:C.T_SM, fontWeight:700, color:'#0F1115'}}>
              <span>Totale ordine</span>
              <span style={{fontVariantNumeric:'tabular-nums'}}>€{conto.totaleConto.toFixed(2)}</span>
            </div>
          </div>

          {/* Destra: metodo + importo */}
          <div style={{flex:'1 1 0', display:'flex', flexDirection:'column', minWidth:0, overflowY:'auto', padding:'16px 20px', gap:16}}>
            {/* Riepilogo */}
            <div style={{display:'flex', justifyContent:'space-between', fontSize:C.T_SM, fontWeight:700, color:'#0F1115', padding:'10px 14px', background:'#F9FAFB', borderRadius:10}}>
              <span>Da incassare</span>
              <span style={{fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</span>
            </div>

            {/* Metodo */}
            <div>
              <div style={{fontSize:C.T_XS, fontWeight:800, color:'#6B7280', letterSpacing:0.6, textTransform:'uppercase', marginBottom:8}}>Come paga il cliente?</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14}}>
                {[{id:'contanti',icon:'💵',label:'Contanti'},{id:'carta',icon:'💳',label:'Carta'},{id:'byup',icon:'📱',label:'App byup'}].map(m => {
                  const on = method === m.id;
                  return (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{
                      display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                      padding:'12px 6px', borderRadius:10,
                      background: on ? '#0F1115' : '#fff',
                      color: on ? '#fff' : '#0F1115',
                      border: on ? '1px solid #0F1115' : '1px solid #E5E7EB',
                      cursor:'pointer', fontFamily:'inherit', fontSize:C.T_SM, fontWeight:700,
                    }}>
                      <span>{m.icon}</span>{m.label}
                    </button>
                  );
                })}
              </div>

              {method === 'contanti' && (
                <div>
                  <div style={{fontSize:C.T_XS, fontWeight:700, color:'#6B7280', marginBottom:6}}>Importo ricevuto</div>
                  <div style={{display:'flex', alignItems:'baseline', gap:4, background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'12px 14px', marginBottom:8}}>
                    <span style={{fontSize:C.T_LG, fontWeight:700, color:'#9CA3AF'}}>€</span>
                    <input type="number" value={cash} onChange={e => setCash(e.target.value)}
                      placeholder={total.toFixed(2)}
                      style={{border:'none', outline:'none', fontSize:C.T_XL, fontWeight:800, color:'#0F1115', width:'100%', padding:0, fontFamily:'inherit', background:'transparent', fontVariantNumeric:'tabular-nums'}}/>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12}}>
                    {chipVals.map(v => {
                      const sel = Math.abs(tendered - v) < 0.01;
                      return (
                        <button key={v} onClick={() => setCash(v.toFixed(2))} style={{
                          padding:'8px 4px', borderRadius:8,
                          background: sel ? '#0F1115' : '#fff',
                          color: sel ? '#fff' : '#0F1115',
                          border: sel ? '1px solid #0F1115' : '1px solid #E5E7EB',
                          fontSize:C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                        }}>€{v % 1 === 0 ? v : v.toFixed(2)}</button>
                      );
                    })}
                  </div>
                  {tendered > 0 && (
                    <div style={{padding:'10px 14px', borderRadius:10, background: canConfirm ? '#DCFCE7' : '#FEF3C7', color: canConfirm ? '#166534' : '#92400E', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{fontSize:C.T_SM, fontWeight:700}}>
                        {canConfirm ? (resto > 0.01 ? 'Resto da dare' : 'Pagamento esatto') : 'Manca ancora'}
                      </span>
                      <span style={{fontSize:C.T_LG, fontWeight:800, fontVariantNumeric:'tabular-nums'}}>
                        €{Math.abs(canConfirm ? resto : total - tendered).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {method === 'carta' && (
                <div style={{padding:'20px 16px', borderRadius:12, background:'#fff', border:'1.5px dashed #D1D5DB', textAlign:'center'}}>
                  <div style={{width:44, height:44, borderRadius:12, background:'#F1F2F5', display:'grid', placeItems:'center', margin:'0 auto 10px'}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
                    </svg>
                  </div>
                  <div style={{fontSize:C.T_SM, fontWeight:700, color:'#0F1115', marginBottom:4}}>Inserisci la carta nel POS</div>
                  <div style={{fontSize:C.T_XL, fontWeight:800, color:'#0F1115', letterSpacing:-0.4, fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</div>
                </div>
              )}

              {method === 'byup' && (
                <div style={{padding:'20px 16px', borderRadius:12, background:'#F5F3FF', border:'1.5px solid #DDD6FE', textAlign:'center'}}>
                  <div style={{fontSize:C.T_SM, fontWeight:700, color:'#6D28D9', marginBottom:4}}>Pagamento via app byup</div>
                  <div style={{fontSize:C.T_XL, fontWeight:800, color:'#6D28D9', letterSpacing:-0.4, fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'14px 20px', borderTop:'1px solid #F0F2F5', display:'flex', gap:10, flexShrink:0}}>
          <button onClick={onClose} style={{flex:1, padding:'11px 16px', background:'#fff', border:'1px solid #E5E7EB', borderRadius:9, fontSize:C.T_SM, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
            Annulla
          </button>
          <button
            onClick={canConfirm ? handleConfirm : undefined}
            style={{
              flex:2, padding:'11px 16px',
              background: canConfirm ? '#0F1115' : '#E5E7EB',
              color: canConfirm ? '#fff' : '#9CA3AF',
              border:'none', borderRadius:9, fontSize:C.T_SM, fontWeight:700,
              cursor: canConfirm ? 'pointer' : 'default', fontFamily:'inherit',
            }}>
            Incassa €{total.toFixed(2)}
          </button>
        </div>
        </React.Fragment>
      )}
      </div>
    </React.Fragment>
  );
}

function ContoExpandedPanel({ conto, onRimborso }) {
  const payments = conto.payments || [];
  const fmtPayOra = (s) => {
    if (!s) return '';
    const [, time] = s.split(' ');
    return time || '';
  };
  const methodMeta = {
    contanti: { label:'Contanti', icon: PnI.Coin || PnI.Wallet, color:'#0F766E', bg:'#CCFBF1' },
    carta:    { label:'Carta',    icon: PnI.Card || PnI.Wallet, color:'#1D4ED8', bg:'#DBEAFE' },
    byup:     { label:'Byup app', icon: PnI.Smartphone || PnI.Phone || PnI.Mobile || PnI.Wallet, color:'#7C3AED', bg:'#EDE9FE' },
  };
  return (
    <div style={{
      padding:'16px 18px 18px',
      background:'#F8FAFC',
      borderTop:`1px solid ${PN.BORDER_SOFT}`,
      borderBottom:`1px solid ${PN.BORDER_SOFT}`,
    }}>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        gap: 10, marginBottom: 10,
      }}>
        <span style={{
          fontSize: C.T_XS, fontWeight: 700, color: PN.MUTED,
          textTransform:'uppercase', letterSpacing: 0.5,
        }}>Canali di pagamento</span>
        {conto.idOrdine && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            fontSize: C.T_XS, color: PN.MUTED, fontWeight: 600,
          }}>
            <span style={{textTransform:'uppercase', letterSpacing: 0.5, color: PN.MUTED_SOFT || PN.MUTED}}>ID ordine</span>
            <span style={{fontFamily:'ui-monospace, Menlo, monospace', color: PN.TEXT}}>{conto.idOrdine}</span>
          </span>
        )}
      </div>

      {payments.length === 0 ? (
        <div style={{
          padding:'14px', background: PN.WHITE,
          border:`1px dashed ${PN.BORDER}`, borderRadius: C.R_SM,
          fontSize: C.T_SM, color: PN.MUTED, textAlign:'center',
        }}>Nessun pagamento ancora registrato per questo conto</div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap: 8}}>
          {payments.map(p => {
            const meta = methodMeta[p.method] || methodMeta.contanti;
            const Icon = meta.icon;
            return (
              <div key={p.id} style={{
                display:'grid',
                gridTemplateColumns:'auto 1fr auto auto',
                gap: 12, alignItems:'center',
                padding:'10px 14px', background: PN.WHITE,
                border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: C.R_SM,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: meta.bg, color: meta.color,
                  display:'grid', placeItems:'center',
                }}>{Icon ? <Icon size={15}/> : null}</div>
                <div style={{minWidth: 0, display:'flex', flexDirection:'column'}}>
                  <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, display:'flex', alignItems:'baseline', gap: 8, flexWrap:'wrap'}}>
                    <span>{meta.label}</span>
                    {p.posRef && (p.posRef.nome || p.posRef.email || p.posRef.device) && (
                      <span style={{fontSize: C.T_XS, fontWeight: 500, color: PN.MUTED}}>
                        · <span style={{fontWeight: 700, color: PN.MUTED}}>Dispositivo:</span> {[p.posRef.nome || p.posRef.device, p.posRef.email].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 4, display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
                    <span>{fmtDataOra(p.ora.split(' ')[0] + ' ' + fmtPayOra(p.ora))}</span>
                  </div>
                </div>
                <div style={{fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, color: PN.TEXT}}>
                  €{p.amount.toFixed(2)}
                </div>
                <div style={{display:'inline-flex', alignItems:'center', gap: 6}} onClick={e => e.stopPropagation()}>
                  {p.scontrinoNum && (
                    <button style={{
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
                  <button onClick={() => onRimborso && onRimborso(conto, p)} style={{
                    padding:'6px 10px', background: PN.WHITE,
                    border:`1px solid #FCA5A5`, borderRadius: C.R_SM,
                    fontSize: C.T_XS, fontWeight: 600, color: '#B91C1C',
                    cursor:'pointer', fontFamily:'inherit',
                    display:'inline-flex', alignItems:'center', gap: 5,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
                  >
                    {PnI.RotateCcw ? <PnI.RotateCcw size={12}/> : null}
                    Rimborso
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rimborso */}
      {conto.rimborso && (
        <div style={{
          marginTop: 10, padding:'10px 14px',
          background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius: C.R_SM,
          display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 12, alignItems:'center',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background:'#FEE2E2', color:'#B91C1C',
            display:'grid', placeItems:'center',
          }}>{PnI.RotateCcw ? <PnI.RotateCcw size={15}/> : (PnI.X ? <PnI.X size={15}/> : null)}</div>
          <div>
            <div style={{fontSize: C.T_SM, fontWeight: 700, color:'#991B1B'}}>
              Rimborso · {conto.rimborso.method === 'carta' ? 'Carta' : 'Contanti'}
            </div>
            <div style={{fontSize: C.T_XS, color:'#B91C1C', marginTop: 2}}>
              {fmtDataOra(conto.rimborso.ora.split(' ')[0] + ' ' + (conto.rimborso.ora.split(' ')[1] || ''))}
              {conto.rimborso.reason && ` · ${conto.rimborso.reason}`}
            </div>
          </div>
          <div style={{fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, color:'#991B1B'}}>
            −€{conto.rimborso.amount.toFixed(2)}
          </div>
        </div>
      )}

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
function ChiudiCassaModal({ open, fondoCassa, aperturaOra, onClose, onConfirm }) {
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

function ContConti({ filter = 'all' }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(filter);
  const [canale, setCanale] = React.useState('all'); // 'all' | 'asporto' | 'sala'
  const [modalPagamento, setModalPagamento] = React.useState(null);
  const [saldati, setSaldati] = React.useState(new Set());

  const [modalRimborso, setModalRimborso] = React.useState(null);
  const [rimborsoPayment, setRimborsoPayment] = React.useState(null);
  const [rimborsoStep, setRimborsoStep] = React.useState(1);

  const [expandedId, setExpandedId] = React.useState(null);
  const [sortData, setSortData] = React.useState(null); // null | 'desc' (recenti) | 'asc' (meno recenti)

  // Polling: aspetta che sala-salda-modal.jsx venga compilato da Babel (async)
  const [saldaComp, setSaldaComp] = React.useState(() => window.SalaSaldaModal || null);
  React.useEffect(() => {
    if (saldaComp) return;
    const t = setInterval(() => {
      if (window.SalaSaldaModal) {
        setSaldaComp(() => window.SalaSaldaModal);
        clearInterval(t);
      }
    }, 50);
    return () => clearInterval(t);
  }, []);

  function apriRimborso(conto, payment) {
    setModalRimborso(conto);
    setRimborsoPayment(payment || null);
    setRimborsoStep(1);
  }
  function chiudiRimborso() {
    setModalRimborso(null);
    setRimborsoPayment(null);
    setRimborsoStep(1);
  }
  function confermaRimborso() { chiudiRimborso(); }

  // KPI: tavoli in sospeso
  const nonSaldati = CONTI_MOCK.filter(c => c.stato === 'non_saldato');

  // L'alert "Da saldare" sparisce quando non ci sono conti aperti:
  // se era il filtro attivo, torna a "Tutti".
  React.useEffect(() => {
    if (activeFilter === 'da_saldare' && nonSaldati.length === 0) setActiveFilter('all');
  }, [activeFilter, nonSaldati.length]);

  // Filtra per stato (alert da saldare) e per canale (sala / asporto)
  let filtered = CONTI_MOCK;
  if (activeFilter === 'da_saldare') {
    filtered = filtered.filter(c => c.stato === 'non_saldato');
  }
  if (canale !== 'all') {
    filtered = filtered.filter(c => (c.canale || 'sala') === canale);
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

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
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
          <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
            <div style={{
              display:'grid',
              gridTemplateColumns:'0.7fr 0.7fr 0.7fr 1.1fr 0.9fr 0.8fr 110px',
              padding:'10px 14px', background: C.TH_BG,
              fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
              textTransform:'uppercase', letterSpacing: 0.5,
            }}>
              <span
                onClick={toggleSortData}
                style={{
                  cursor:'pointer', userSelect:'none',
                  alignSelf:'stretch',
                  display:'flex', alignItems:'center', gap:4,
                  margin:'-10px 0', padding:'10px 8px',
                  background: sortData ? C.SURF_ALT : 'transparent',
                  color: sortData ? PN.TEXT : C.TH_TEXT,
                  transition:'background .15s',
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
            {filtered.map((conto, i) => {
              const isExpanded = expandedId === conto.id;
              return (
                <React.Fragment key={conto.id}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : conto.id)}
                    style={{
                      display:'grid',
                      gridTemplateColumns:'0.7fr 0.7fr 0.7fr 1.1fr 0.9fr 0.8fr 110px',
                      padding:'12px 14px', alignItems:'center',
                      fontSize: C.T_SM, color: PN.TEXT,
                      borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                      background: isExpanded ? PN.PINK_SOFT : PN.WHITE,
                      boxShadow: isExpanded ? `inset 3px 0 0 ${PN.PINK}` : 'none',
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
                        color: PN.MUTED_LIGHT,
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition:'transform .15s',
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
                          style={{
                            padding:'7px 12px', background: PN.TEXT, color:'#fff',
                            border:'none', borderRadius: 9, fontSize: C.T_XS,
                            fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                          }}>
                          Salda ora
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
                  {isExpanded && (
                    <ContoExpandedPanel
                      conto={conto}
                      onRimborso={(c, p) => apriRimborso(c, p)}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal rimborso — il metodo dipende dal canale del pagamento target */}
      {modalRimborso && (() => {
        // contanti → restituzione manuale in cassa; carta/byup/altro → rimborso Stripe
        const refundMethod = rimborsoPayment?.method || modalRimborso.metodoPagamento || 'contanti';
        const useStripe = refundMethod !== 'contanti';
        const amount = rimborsoPayment ? rimborsoPayment.amount : modalRimborso.totaleConto;
        const channelLabel = refundMethod === 'byup' ? 'Byup app' : refundMethod === 'carta' ? 'Carta' : 'Contanti';
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
            {rimborsoStep === 1 ? (
              <React.Fragment>
                <h2 style={{margin:'0 0 4px 0', fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
                  Rimborso
                </h2>
                <p style={{margin:'0 0 24px 0', fontSize: C.T_SM, color: PN.MUTED}}>
                  {modalRimborso.cliente} · {channelLabel} · €{amount.toFixed(2)}
                </p>
                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:24}}>
                  {useStripe ? (
                    <button
                      onClick={() => setRimborsoStep(2)}
                      style={{
                        padding:'14px 16px', background:'#4F46E5', color:'#fff',
                        border:'none', borderRadius: C.R_SM,
                        fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        textAlign:'left',
                      }}>
                      Rimborsa tramite Stripe
                      <div style={{fontSize: C.T_XS, fontWeight:500, opacity:0.8, marginTop:3}}>
                        {refundMethod === 'byup'
                          ? 'Il cliente riceverà il rimborso sul metodo collegato all\'app Byup'
                          : 'Il cliente riceverà il rimborso sulla carta originale'}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setRimborsoStep(2)}
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
                  Confermi il rimborso?
                </h2>
                <p style={{margin:'0 0 24px 0', fontSize: C.T_SM, color: PN.MUTED}}>
                  {useStripe ? 'Stripe' : 'Contanti'} · {modalRimborso.cliente} · €{amount.toFixed(2)}
                </p>
                <div style={{display:'flex', gap:10}}>
                  <button
                    onClick={() => setRimborsoStep(1)}
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

      {/* Modal pagamento — usa SalaSaldaModal se disponibile, altrimenti fallback locale */}
      {modalPagamento && (saldaComp
        ? React.createElement(saldaComp, {
            open: true,
            tavolo: {
              id: (modalPagamento.tavolo.match(/\d+/) || [])[0],
              party: modalPagamento.cliente || '',
              coperti: 1,
              guests: [],
              ordini: modalPagamento.ordini || [{ id: modalPagamento.id + '-1', nome: 'Saldo conto', prezzo: modalPagamento.daSaldare, qty: 1 }],
            },
            onClose: () => setModalPagamento(null),
            onConfirm: () => setSaldati(s => new Set([...s, modalPagamento.id])),
          })
        : (
          <ContSaldaModal
            open={true}
            conto={modalPagamento}
            onClose={() => setModalPagamento(null)}
            onConfirm={() => setSaldati(s => new Set([...s, modalPagamento.id]))}
          />
        )
      )}
    </div>
  );
}

window.ContConti = ContConti;

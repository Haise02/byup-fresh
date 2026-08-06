// Tab Cassa v2 — elenco chiusure cassa (storico quadrature)

// ─── Trasmissione all'Agenzia delle Entrate ────────────────────────────────
// Il canale è la procedura "documento commerciale online" (via OpenAPI): ogni
// documento parte DA SOLO e in tempo reale. E nel prototipo il documento nasce
// dal PAGAMENTO — ogni elemento di `payments` in contabilita-v2-conti.jsx ha il
// suo `scontrinoNum`, quindi un conto diviso in tre pagamenti produce tre
// scontrini distinti, ognuno col suo esito.
//
// Di conseguenza lo stato di trasmissione appartiene al pagamento e NIENTE
// ALTRO lo possiede: il conto e la chiusura di giornata lo DERIVANO.
//   • Conti  → casa dello stato: il chip sulla riga del pagamento e il
//              dettaglio dello scarto (è lì che si agisce)
//   • Cassa  → vigilanza: il riepilogo per giornata e il rimando a Conti
// Qui vivono il registro delle azioni (localStorage) e le derivazioni, perché
// questo file è caricato prima di conti.jsx; i dati stanno in CONTI_MOCK.

// ─── Registro delle azioni sugli scarti, per DOCUMENTO ─────────────────────
// Stesso pattern di byupReadModules/byupWriteModules: localStorage + evento,
// così il pallino sopravvive al ricarico. È il punto della misura: un
// documento scartato non si "dimentica" da solo.
const BYUP_FISC_KEY = 'byup_fisc_documenti';
window.byupReadFisc = function () {
  try { const s = localStorage.getItem(BYUP_FISC_KEY); return s ? JSON.parse(s) : {}; }
  catch (e) { return {}; }
};
window.byupWriteFisc = function (v) {
  try { localStorage.setItem(BYUP_FISC_KEY, JSON.stringify(v)); } catch (e) {}
  // Notifica i listener della stessa pagina (storage fira solo per altre tab)
  window.dispatchEvent(new Event('byup-fisc-change'));
};

const fiscOra = () => {
  const d = new Date();
  return `${ccFmtDate(d)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
const fiscFraMinuti = (m) => {
  const d = new Date(Date.now() + m * 60000);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
// 'aaaa-mm-gg HH:MM' → 'gg/mm/aaaa HH:MM'. Le date dei conti sono ri-ancorate
// a oggi a runtime: i timestamp fiscali si derivano da lì, mai scritti a mano.
const fiscTs = (ora) => {
  const [d, t] = String(ora || '').split(' ');
  const [Y, M, D] = String(d || '').split('-');
  return D ? `${D}/${M}/${Y} ${t || '00:00'}` : '';
};
// Giorno successivo a `ora`, a un orario dato: serve per datare una gestione
// avvenuta prima che questa console esistesse, senza scrivere date a mano.
const fiscGiornoDopo = (ora, hhmm) => {
  const g = String(ora || '').split(' ')[0];
  if (!g) return '';
  const d = new Date(g + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return `${ccFmtDate(d)} ${hhmm}`;
};
// chiave ordinabile: il log deve stare in ordine di accadimento anche se un
// timestamp arriva dai dati e un altro dall'orologio.
const fiscOrdine = (t) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(t || '');
  return m ? `${m[3]}${m[2]}${m[1]}${m[4]}${m[5]}` : '';
};

// I motivi di scarto, in italiano: il codice dell'Agenzia non dice niente a chi
// deve rimediare, e il rimedio sta sempre su un'altra schermata.
const CC_SCARTI = {
  aliquota: {
    motivo:   'Aliquota IVA non valida sulla riga "Tagliere salumi e formaggi"',
    causa:    'Il prodotto è passato in cassa con un\'aliquota non prevista per la somministrazione. L\'Agenzia rifiuta l\'intero documento, non la singola riga.',
    azione:   'Correggi l\'aliquota del prodotto nel catalogo, poi ritrasmetti il documento.',
    vaiLabel: 'Apri Impostazioni → Menù',
    vaiHref:  'byup Impostazioni.html?page=menu-cucina&sub=libreria',
  },
  delega: {
    motivo:   'La delega all\'Agenzia delle Entrate è scaduta',
    causa:    'La delega che autorizza byup a trasmettere i corrispettivi per il tuo locale non è più valida. Finché non la rinnovi sul portale dell\'Agenzia ogni invio viene rifiutato.',
    azione:   'Rinnova la delega dal portale dell\'Agenzia delle Entrate, poi controlla il collegamento nei dati fiscali e ritrasmetti il documento.',
    vaiLabel: 'Apri Impostazioni → Dati fiscali',
    vaiHref:  'byup Impostazioni.html?page=fiscali',
  },
  dispositivo: {
    motivo:   'Il punto cassa non risulta censito all\'Agenzia',
    causa:    'Il dispositivo che ha emesso il documento non è fra quelli registrati per il locale: succede quando si incassa da un POS aggiunto da poco e non ancora abbinato.',
    azione:   'Abbina il dispositivo nella pagina POS e integrazioni, poi ritrasmetti il documento.',
    vaiLabel: 'Apri Impostazioni → POS e integrazioni',
    vaiHref:  'byup Impostazioni.html?page=integrazioni',
  },
};

// IVA del documento: aliquota decisa dall'id del pagamento (stabile), importo
// scorporato. Le colonne IVA della chiusura sono la somma di queste.
const ccR2 = (n) => Math.round(n * 100) / 100;
const ccEuro = (n) => (n < 0 ? `− € ${Math.abs(n).toFixed(2)}` : `€ ${n.toFixed(2)}`);
function docIva(p) {
  let s = 0;
  for (let i = 0; i < p.id.length; i++) s = (s * 31 + p.id.charCodeAt(i)) >>> 0;
  const r = (s % 100) < 24 ? 22 : 10;
  const iva = ccR2(p.amount * r / (100 + r));
  return { aliquota: r, iva10: r === 10 ? iva : 0, iva22: r === 22 ? iva : 0 };
}

// Stato effettivo di un DOCUMENTO = quello che dicono i dati + quello che ha
// fatto il ristoratore. `aperto` è la sola cosa che accende il pallino: uno
// scarto senza gestione, anche se una ritrasmissione è in volo (un tentativo
// non è una soluzione).
function docInfo(p) {
  const f = p.fisc || {};
  const salvato = window.byupReadFisc()[p.id] || {};
  const gestito = salvato.gestito || (f.gestito ? { ...f.gestito, quando: f.gestito.quando || fiscGiornoDopo(p.ora, '09:20') } : null);
  const ritento = salvato.ritento || null;
  const scarto = f.scarto ? { ...CC_SCARTI[f.scarto] , rilevato: fiscTs(p.ora) } : null;
  let tipo;
  if (!scarto) tipo = f.esito === 'ritrasmissione' ? 'ritrasmissione' : 'ok';
  else if (gestito) tipo = 'gestito';
  else tipo = ritento ? 'ritrasmissione' : 'scartato';
  return {
    tipo, scarto, gestito, ritento,
    idTrasm: scarto ? null : (f.idTrasm || (p.scontrinoNum ? p.scontrinoNum.replace('SC-', 'AE-') : null)),
    inviato: scarto ? null : fiscTs(p.ora),
    tentativo: ritento ? ritento.tentativo : (f.tentativo || 2),
    prossimo: ritento ? ritento.prossimo : (f.prossimo || '14:30'),
    visto: salvato.visto || null,
    nota: salvato.nota || null,
    aperto: !!scarto && !gestito,
  };
}

// Tutti i documenti, cioè tutti i pagamenti dei conti. Unica sorgente.
function ccDocumenti() {
  const out = [];
  (window.CONTI_MOCK || []).forEach(c => (c.payments || []).forEach(p => out.push({ conto: c, p })));
  return out;
}

// ─── Chiusure di giornata, DERIVATE dai documenti ──────────────────────────
// Una chiusura è l'insieme dei documenti emessi in quel giorno: i totali e lo
// stato di trasmissione sono somme, non numeri scritti da qualche altra parte.
function ccChiusure() {
  const perGiorno = {};
  ccDocumenti().forEach(({ p }) => {
    const g = String(p.ora || '').split(' ')[0];
    if (!g) return;
    (perGiorno[g] = perGiorno[g] || []).push(p);
  });
  return Object.keys(perGiorno).sort().reverse().map(g => {
    const docs = perGiorno[g].slice().sort((a, b) => String(a.ora).localeCompare(String(b.ora)));
    let contanti = 0, nonContanti = 0, iva10 = 0, iva22 = 0;
    docs.forEach(p => {
      const iv = docIva(p);
      iva10 += iv.iva10; iva22 += iv.iva22;
      if (p.method === 'contanti') contanti += p.amount; else nonContanti += p.amount;
    });
    const [Y, M, D] = g.split('-');
    return {
      id: g, iso: g, date: `${D}/${M}/${Y}`,
      docs, contanti: ccR2(contanti), nonContanti: ccR2(nonContanti),
      iva10: ccR2(iva10), iva22: ccR2(iva22), totale: ccR2(contanti + nonContanti),
    };
  });
}

// Riepilogo di giornata: NON è uno stato suo, è l'aggregato dei documenti.
function giornataInfo(chiusura) {
  const info = chiusura.docs.map(docInfo);
  const n = info.length;
  const scartati = info.filter(i => i.aperto).length;          // scarti non gestiti
  const gestiti  = info.filter(i => i.tipo === 'gestito').length;
  const coda     = info.filter(i => !i.scarto && i.tipo === 'ritrasmissione');
  if (scartati) return { stato:'scartato', tipo:'scartata', n, scartati,
    label: `${scartati} ${scartati === 1 ? 'scartato' : 'scartati'} su ${n}` };
  if (coda.length) return { stato:'coda', tipo:'coda', n, scartati: 0,
    label: `${coda.length} in ritrasmissione` };
  if (gestiti) return { stato:'gestito', tipo:'gestita', n, scartati: 0,
    label: `${gestiti} ${gestiti === 1 ? 'gestito' : 'gestiti'} su ${n}` };
  return { stato:'ok', tipo:'ok', n, scartati: 0, label: `${n}/${n} trasmessi` };
}

// Il badge conta i DOCUMENTI scartati e non gestiti, non le giornate.
window.byupScartiAperti = function () {
  return ccDocumenti().filter(({ p }) => docInfo(p).aperto).length;
};

// La ritrasmissione manuale NON chiude lo scarto: mette in volo un tentativo.
// Il pallino resta finché l'esito non c'è — mentire qui sarebbe peggio che non
// avere il pallino. La nota si conserva su ENTRAMBE le azioni.
window.byupFiscRiprova = function (id, nota) {
  const s = window.byupReadFisc();
  const prec = s[id] || {};
  const n = Math.min((prec.ritento ? prec.ritento.tentativo : 3) + 1, 5);
  s[id] = {
    ...prec,
    nota: (nota || '').trim() || prec.nota || null,
    ritento: { tentativo: n, quando: fiscOra(), prossimo: fiscFraMinuti(30) },
  };
  window.byupWriteFisc(s);
};
window.byupFiscSegnaGestita = function (id, nota) {
  const s = window.byupReadFisc();
  const prec = s[id] || {};
  const testo = (nota || '').trim() || prec.nota || null;
  s[id] = { ...prec, nota: testo, gestito: { quando: fiscOra(), come:'manuale', nota: testo } };
  window.byupWriteFisc(s);
};
// "Aperto il …" nel log: si scrive una volta sola, alla prima apertura.
window.byupFiscVisto = function (id) {
  const s = window.byupReadFisc();
  if (s[id] && s[id].visto) return;
  s[id] = { ...(s[id] || {}), visto: fiscOra() };
  window.byupWriteFisc(s);
};

// Ri-renderizza il componente a ogni cambio degli scarti (stessa pagina e
// altre tab), come fa la sidebar con i moduli.
function useFiscTick() {
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const agg = () => forza(x => x + 1);
    window.addEventListener('byup-fisc-change', agg);
    window.addEventListener('storage', agg);
    return () => {
      window.removeEventListener('byup-fisc-change', agg);
      window.removeEventListener('storage', agg);
    };
  }, []);
}

Object.assign(window, { docInfo, docIva, ccDocumenti, ccChiusure, giornataInfo, fiscTs, fiscOrdine, ccEuro, CC_SCARTI });

// gg/mm/aaaa da un Date
function ccFmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Calendario a comparsa per selezionare un giorno
function CassaDatePicker({ selected, onPick, onClear }) {
  const init = selected ? new Date(selected.split('/').reverse().join('-')) : new Date();
  const [view, setView] = React.useState(() => { const d = new Date(init); d.setDate(1); return d; });
  const monthLabel = view.toLocaleDateString('it-IT', {month:'long', year:'numeric'});

  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const grid = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  for (let n = 1; n <= daysInMonth; n++) grid.push(new Date(view.getFullYear(), view.getMonth(), n));
  while (grid.length % 7 !== 0) grid.push(null);

  const goPrev = () => { const d = new Date(view); d.setMonth(d.getMonth()-1); setView(d); };
  const goNext = () => { const d = new Date(view); d.setMonth(d.getMonth()+1); setView(d); };

  const navBtn = {
    width:28, height:28, borderRadius:6, background:'#fff',
    border:`1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
    color: PN.TEXT, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
  };

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:'absolute', top:'100%', right:0, marginTop:8, zIndex:60,
      width:280, padding:14, background:'#fff', borderRadius:12,
      border:`1px solid ${PN.BORDER}`, boxShadow:'0 12px 36px rgba(15,17,21,0.14)',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
        <button onClick={goPrev} style={navBtn}>‹</button>
        <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.TEXT, textTransform:'capitalize'}}>{monthLabel}</span>
        <button onClick={goNext} style={navBtn}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:4}}>
        {['L','M','M','G','V','S','D'].map((d,i) => (
          <span key={i} style={{fontSize:10, fontWeight:700, color: PN.MUTED, textAlign:'center', padding:2}}>{d}</span>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4}}>
        {grid.map((day,i) => {
          if (!day) return <span key={i}/>;
          const iso = ccFmtDate(day);
          const isSel = iso === selected;
          return (
            <button key={i} onClick={() => onPick(iso)} style={{
              padding:'7px 0', borderRadius:7, border:'none', fontFamily:'inherit',
              background: isSel ? PN.TEXT : 'transparent',
              color: isSel ? '#fff' : PN.TEXT,
              fontSize: C.T_SM, fontWeight: isSel ? 700 : 500, cursor:'pointer',
            }}>{day.getDate()}</button>
          );
        })}
      </div>
      {selected && (
        <button onClick={onClear} style={{
          width:'100%', marginTop:10, padding:'8px', borderRadius:8,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
          fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, cursor:'pointer', fontFamily:'inherit',
        }}>Mostra tutte</button>
      )}
    </div>
  );
}

// ─── Chip di stato ─────────────────────────────────────────────────────────
// Stessa pill di StatusPill (Costi): piena, radius pill, 12.5/700, e le sue
// coppie colore — verde pagato, ambra da pagare, rosso scaduto — più un grigio
// neutro per lo scarto già gestito, che non deve più chiamare.
const FISC_CHIP = {
  ok:             { color:'#065F46', bg:'#D1FAE5' },
  coda:           { color:'#92400E', bg:'#FEF3C7' },
  ritrasmissione: { color:'#92400E', bg:'#FEF3C7' },
  scartata:       { color:'#991B1B', bg:'#FEE2E2' },
  scartato:       { color:'#991B1B', bg:'#FEE2E2' },
  // Inchiostro pieno, non muted: su C.SURF_ALT il grigio PN.MUTED sta sotto il
  // 4.5:1 richiesto a questa dimensione. Senza tinta resta comunque quieto.
  gestita:        { color: PN.TEXT,  bg: C.SURF_ALT },
  gestito:        { color: PN.TEXT,  bg: C.SURF_ALT },
};

function FiscPill({ tipo, label }) {
  const s = FISC_CHIP[tipo] || FISC_CHIP.ok;
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius: C.R_PILL,
      background: s.bg, color: s.color, fontSize: 12.5, fontWeight: 700,
      width:'fit-content', whiteSpace:'nowrap',
    }}>{label}</span>
  );
}

// Riepilogo di giornata: l'aggregato dei documenti, non uno stato inventato.
function GiornataChip({ info }) {
  return (
    <span style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
      <FiscPill tipo={info.tipo} label={info.label}/>
      {info.sotto && (
        <span style={{fontSize: 12, color: PN.MUTED, marginTop: 3, whiteSpace:'nowrap'}}>{info.sotto}</span>
      )}
    </span>
  );
}

const DOC_LABEL = { ok:'Trasmesso', ritrasmissione:'In ritrasmissione', scartato:'Scartato', gestito:'Gestito' };

function ContCassa({ cassaOpen = false, setCassaOpen, onApriConti }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [selDate, setSelDate] = React.useState(null); // 'gg/mm/aaaa' o null
  const pickerRef = React.useRef(null);
  useFiscTick();

  // Stato apertura/chiusura cassa
  const [apriModal, setApriModal] = React.useState(false);
  const [chiudiModal, setChiudiModal] = React.useState(false);
  const [fondoCassa, setFondoCassa] = React.useState(null);
  const [aperturaOra, setAperturaOra] = React.useState(null);

  function handleCassaClick() {
    if (cassaOpen) { setChiudiModal(true); } else { setApriModal(true); }
  }
  function confermaApertura(amount) {
    setFondoCassa(amount);
    setAperturaOra(new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}));
    setCassaOpen && setCassaOpen(true);
    setApriModal(false);
  }
  function confermaChiusura() {
    setCassaOpen && setCassaOpen(false);
    setFondoCassa(null);
    setAperturaOra(null);
    setChiudiModal(false);
  }

  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  // Le chiusure sono DERIVATE dai documenti (i pagamenti dei conti): totali,
  // IVA e stato di trasmissione sono somme, non numeri scritti altrove.
  const allRows = ccChiusure().map(c => ({ ...c, giornata: giornataInfo(c) }));
  const rows = selDate ? allRows.filter(r => r.date === selDate) : allRows;
  const totIncassato = rows.reduce((s,r)=>s+r.totale,0);
  // Il conteggio è sui DOCUMENTI di tutte le giornate, non su quelle filtrate:
  // uno scarto non smette di esistere perché stai guardando un altro giorno.
  const scartiAperti = allRows.reduce((s,r) => s + r.giornata.scartati, 0);

  // minmax e non fr puri: con le sole frazioni, alla larghezza minima del
  // frame (1280) "Totale incassato" andava a capo e "Contanti" si attaccava a
  // "Carta e digitale". Il minimo di ogni colonna è la sua intestazione;
  // l'ultima tiene il chip più lungo.
  const cols = 'minmax(96px, 0.9fr) minmax(152px, 1fr) minmax(74px, 0.72fr) minmax(74px, 0.72fr) minmax(88px, 0.85fr) minmax(140px, 0.95fr) minmax(196px, 1.45fr)';

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Banner stato cassa */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: cassaOpen ? '#ECFDF5' : '#FEF2F2',
        border: `1px solid ${cassaOpen ? '#A7F3D0' : '#FECACA'}`,
        borderRadius: C.R_MD,
      }}>
        <span style={{
          width:10, height:10, borderRadius:'50%',
          background: cassaOpen ? PN.GREEN : PN.RED,
          boxShadow: `0 0 0 4px ${cassaOpen ? '#A7F3D055' : '#FECACA55'}`,
        }}/>
        <div style={{flex:1}}>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: cassaOpen ? '#065F46' : '#991B1B'}}>
            {cassaOpen ? 'Cassa aperta' : 'Cassa chiusa'}
          </div>
          <div style={{fontSize: C.T_XS, color: cassaOpen ? '#047857' : '#B91C1C', marginTop: 2}}>
            {cassaOpen
              ? `Aperta alle ${aperturaOra || '09:30'} · Da: Marco${fondoCassa != null ? ` · Fondo €${fondoCassa.toFixed(2)}` : ''}`
              : 'Quadratura completata correttamente'}
          </div>
        </div>
        <button
          onClick={handleCassaClick}
          className="cassa-btn"
          style={{
            padding:'9px 18px', borderRadius: C.R_PILL,
            background: cassaOpen ? PN.TEXT : '#059669', color:'#fff', border:'none',
            fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            animation: cassaOpen ? 'none' : 'cassaPulse 2s ease-out infinite',
          }}>{cassaOpen ? 'Chiudi cassa' : 'Apri cassa'}</button>
      </div>

      {/* Popup apertura cassa */}
      <ApriCassaModal
        open={apriModal}
        onClose={() => setApriModal(false)}
        onConfirm={confermaApertura}
      />

      {/* Popup conferma chiusura cassa */}
      <ChiudiCassaModal
        open={chiudiModal}
        fondoCassa={fondoCassa}
        aperturaOra={aperturaOra}
        onClose={() => setChiudiModal(false)}
        onConfirm={confermaChiusura}
      />

      {/* Card chiusure */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 16, flexWrap:'wrap', gap: 12}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
              <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Chiusure cassa</div>
              {/* Il richiamo in testata: stesso conteggio del pallino in menu,
                  si spegne solo quando lo scarto è gestito. */}
              {scartiAperti > 0 && (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 6,
                  padding:'3px 10px', borderRadius: C.R_PILL,
                  background:'#FEE2E2', color:'#991B1B',
                  fontSize: 12.5, fontWeight: 700,
                }}>
                  <span style={{width: 7, height: 7, borderRadius:'50%', background:'#DC2626', flexShrink: 0}}/>
                  {scartiAperti} {scartiAperti === 1 ? 'documento scartato' : 'documenti scartati'}
                </span>
              )}
            </div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{rows.length} chiusure · €{totIncassato.toFixed(2)} incassati</div>
          </div>
        </div>

        {/* Search + actions */}
        <div style={{display:'flex', gap: 10, marginBottom: 14, flexWrap:'wrap'}}>
          <div style={{
            flex:'1 1 240px', display:'flex', alignItems:'center', gap: 8,
            padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            background: PN.WHITE,
          }}>
            <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
            <input placeholder="Cerca per data…" style={{
              flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit',
            }}/>
          </div>
          <div ref={pickerRef} style={{position:'relative'}}>
            <button onClick={() => setPickerOpen(o => !o)}
              style={{...iconBtn, transition: 'background 140ms ease, border-color 140ms ease, transform 130ms ease'}}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}>
              <Ic.calendar size={14}/> {selDate || 'Filtra per data'}
            </button>
            {pickerOpen && (
              <CassaDatePicker
                selected={selDate}
                onPick={(iso) => { setSelDate(iso); setPickerOpen(false); }}
                onClear={() => { setSelDate(null); setPickerOpen(false); }}
              />
            )}
          </div>
        </div>

        {/* Tabella chiusure */}
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{
            display:'grid', gridTemplateColumns: cols,
            padding:'10px 14px', background: C.TH_BG,
            fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
            textTransform:'uppercase', letterSpacing: 0.5,
          }}>
            <span style={{whiteSpace:'nowrap'}}>Data</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Totale incassato</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>IVA 10%</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>IVA 22%</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Contanti</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Carta e digitale</span>
            <span style={{paddingLeft: 14, whiteSpace:'nowrap'}}>Trasmissione</span>
          </div>
          <MaxRowsScroll maxRows={10}>
          {rows.map((r,i) => (
            <div key={r.id}
              onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
              style={{
              display:'grid', gridTemplateColumns: cols,
              padding:'12px 14px', alignItems:'center',
              fontSize: C.T_SM, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
              transition:'background 120ms ease',
            }}>
              <span style={{display:'flex', alignItems:'center', gap: 8, fontVariantNumeric:'tabular-nums'}}>
                <span style={{color: PN.MUTED}}><Ic.calendar size={14}/></span>
                {r.date}
              </span>
              <span style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, letterSpacing: -0.2}}>€ {r.totale.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.iva10.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.iva22.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.contanti.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.nonContanti.toFixed(2)}</span>
              {/* Il chip è un rimando, non un contenitore: la lista dei
                  documenti è in Conti, e lì si va. */}
              <span style={{paddingLeft: 14, minWidth: 0}}>
                <button onClick={() => onApriConti && onApriConti(r.iso, r.giornata.stato)}
                  title={`Apri i documenti del ${r.date} in Conti`}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap: 8,
                    background:'transparent', border:'none', padding: 0,
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                    transition:'filter 140ms ease',
                  }}>
                  <GiornataChip info={r.giornata}/>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED_SOFT, flexShrink: 0}}><path d="M7 17 17 7M8 7h9v9"/></svg>
                </button>
              </span>
            </div>
          ))}
          </MaxRowsScroll>
        </div>
      </div>

    </div>
  );
}

// ─── Reusable styles & components ───────────────────
const iconBtn = {
  padding:'9px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
  cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
};
const iconOnlyBtn = {
  background:'transparent', border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, padding:'6px 9px', cursor:'pointer',
  color: PN.MUTED, display:'inline-flex', alignItems:'center', justifyContent:'center',
};
window.iconBtn = iconBtn;
window.iconOnlyBtn = iconOnlyBtn;

function FilterChip({ active, onClick, label, count }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      padding:'7px 14px',
      background: active ? PN.TEXT : hover ? '#F4F5F7' : PN.WHITE,
      border: `1px solid ${active || hover ? PN.TEXT : PN.BORDER}`,
      color: active ? '#fff' : PN.TEXT,
      borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 600,
      cursor:'pointer', fontFamily:'inherit',
      transform: pressed ? 'scale(0.95)' : hover ? 'scale(1.06)' : 'scale(1)',
      boxShadow: hover ? '0 4px 12px rgba(15, 17, 21, 0.10)' : 'none',
      transition: 'transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), background 140ms ease, border-color 140ms ease, box-shadow 150ms ease',
    }}>
      {label}
      {count != null && <span style={{
        background: active ? 'rgba(255,255,255,0.2)' : C.SURF_ALT,
        color: active ? '#fff' : PN.MUTED,
        padding:'1px 8px', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700,
      }}>{count}</span>}
    </button>
  );
}
window.FilterChip = FilterChip;
window.ContCassa = ContCassa;
window.GiornataChip = GiornataChip;
window.FiscPill = FiscPill;
window.DOC_LABEL = DOC_LABEL;
window.useFiscTick = useFiscTick;

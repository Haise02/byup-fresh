// Tab Cassa v2 — elenco chiusure cassa (storico quadrature)

// Storico chiusure: per ogni giornata il totale incassato, di cui contanti e non contanti.
//
// `fisc` è lo stato della trasmissione dei corrispettivi all'Agenzia delle
// Entrate. Sta QUI, sulla riga della giornata, e non in un elenco a parte:
// la relazione è 1:1 (una chiusura → una trasmissione) e la giornata è
// l'oggetto che il ristoratore riconosce. Tre esiti:
//   esito 'ok'             → accettata, con identificativo di ricezione
//   esito 'ritrasmissione' → invio non riuscito, il sistema ritenta da solo
//   scarto: {…}            → rifiuto dell'Agenzia: serve una mano umana
// `gestito` nel mock marca gli scarti già chiusi dal ristoratore; quello che
// fa dalla console si somma da localStorage (vedi lo store più sotto).
const CASH_CLOSURES = [
  { id:'cc-12', date:'12/03/2025', contanti: 642.30, nonContanti: 1180.50, iva10: 142.80, iva22: 38.40,
    fisc: { esito:'ok', ricevuta:'AE-2503-12-0042871', inviata:'12/03/2025 23:47' } },
  { id:'cc-11', date:'11/03/2025', contanti: 528.00, nonContanti: 1342.10, iva10: 156.20, iva22: 24.10,
    fisc: { esito:'ok', ricevuta:'AE-2503-11-0042698', inviata:'11/03/2025 23:44' } },
  // Scarto ancora aperto: è questo che tiene acceso il pallino su Contabilità.
  // NB: byup non conserva le credenziali AdE (lo dichiara Impostazioni → Dati
  // fiscali), quindi lo scarto è sulla DELEGA scaduta, non su una password:
  // il rimedio sta sul portale dell'Agenzia, e il gestionale lo dice.
  { id:'cc-10', date:'10/03/2025', contanti: 711.40, nonContanti:  980.75, iva10: 128.50, iva22: 19.80,
    fisc: { esito:'scarto', scarto: {
      rilevato: '10/03/2025 23:52',
      motivo:   'La delega all\'Agenzia delle Entrate è scaduta',
      causa:    'La delega che autorizza byup a trasmettere i corrispettivi per il tuo locale è scaduta il 09/03/2025. Finché non la rinnovi, l\'Agenzia rifiuta ogni invio — anche quelli dei giorni successivi.',
      azione:   'Rinnova la delega dal portale dell\'Agenzia delle Entrate, poi controlla il collegamento in Impostazioni → Dati fiscali e riprova la trasmissione.',
      vaiLabel: 'Apri Impostazioni → Dati fiscali',
      vaiHref:  'byup Impostazioni.html?page=fiscali',
    } } },
  { id:'cc-09', date:'09/03/2025', contanti: 489.20, nonContanti: 1520.00, iva10:  96.30, iva22: 84.60,
    fisc: { esito:'ritrasmissione', tentativo: 2, prossimo: '14:30' } },
  { id:'cc-08', date:'08/03/2025', contanti: 856.90, nonContanti: 2104.30, iva10: 214.70, iva22: 52.30,
    fisc: { esito:'ok', ricevuta:'AE-2503-08-0042104', inviata:'08/03/2025 23:58' } },
  { id:'cc-07', date:'07/03/2025', contanti: 402.10, nonContanti:  765.40, iva10:  61.40, iva22: 71.90,
    fisc: { esito:'ok', ricevuta:'AE-2503-07-0041955', inviata:'07/03/2025 23:39' } },
  // Scarto già gestito: resta a memoria, ma non suona più.
  { id:'cc-06', date:'06/03/2025', contanti: 615.70, nonContanti: 1188.20, iva10: 132.90, iva22: 41.50,
    fisc: { esito:'scarto',
      scarto: {
        rilevato: '06/03/2025 23:49',
        motivo:   'Un prodotto ha un\'aliquota IVA non valida',
        causa:    'Il prodotto "Tagliere salumi e formaggi" era a un\'aliquota non prevista per la somministrazione. L\'Agenzia rifiuta l\'intero scontrino, non la singola riga.',
        azione:   'Correggi l\'aliquota del prodotto nel catalogo, poi riprova la trasmissione.',
        vaiLabel: 'Apri Impostazioni → Menù',
        vaiHref:  'byup Impostazioni.html?page=menu-cucina&sub=libreria',
      },
      gestito: { quando:'07/03/2025 09:20', come:'manuale', nota:'Aliquota corretta al 10% e corrispettivo reinviato a mano dal cassetto fiscale.' } } },
  { id:'cc-05', date:'05/03/2025', contanti: 733.50, nonContanti: 1402.60, iva10: 168.40, iva22: 33.20,
    fisc: { esito:'ok', ricevuta:'AE-2503-05-0041612', inviata:'05/03/2025 23:51' } },
  { id:'cc-04', date:'04/03/2025', contanti: 388.90, nonContanti:  902.40, iva10:  88.10, iva22: 27.60,
    fisc: { esito:'ok', ricevuta:'AE-2503-04-0041488', inviata:'04/03/2025 23:36' } },
  { id:'cc-03', date:'03/03/2025', contanti: 561.20, nonContanti: 1265.80, iva10: 138.60, iva22: 42.30,
    fisc: { esito:'ok', ricevuta:'AE-2503-03-0041307', inviata:'03/03/2025 23:42' } },
];

// ─── Scarti fiscali: cosa ha fatto il ristoratore ──────────────────────────
// Stesso pattern di byupReadModules/byupWriteModules: localStorage + evento,
// così il pallino sopravvive al ricarico della pagina. È il punto della
// misura: un corrispettivo scartato non si "dimentica" da solo.
const BYUP_FISC_KEY = 'byup_fisc_scarti';
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
// 'gg/mm/aaaa HH:MM' → chiave ordinabile: il log deve stare in ordine di
// accadimento anche se un timestamp arriva dal mock e un altro dall'orologio.
const fiscOrdine = (t) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(t || '');
  return m ? `${m[3]}${m[2]}${m[1]}${m[4]}${m[5]}` : '';
};

// Stato effettivo di una chiusura = mock + azioni salvate.
// `aperto` è la sola cosa che accende il pallino: uno scarto senza gestione,
// anche se una ritrasmissione è in volo (un tentativo non è una soluzione).
function fiscInfo(c) {
  const f = c.fisc || {};
  const salvato = window.byupReadFisc()[c.id] || {};
  const gestito = salvato.gestito || f.gestito || null;
  const ritento = salvato.ritento || null;
  let tipo;
  if (!f.scarto) tipo = f.esito === 'ritrasmissione' ? 'ritrasmissione' : 'ok';
  else if (gestito) tipo = 'gestita';
  else tipo = ritento ? 'ritrasmissione' : 'scartata';
  return { ...f, tipo, gestito, ritento, visto: salvato.visto || null, aperto: !!f.scarto && !gestito };
}

window.byupScartiAperti = function () {
  return CASH_CLOSURES.filter(c => fiscInfo(c).aperto).length;
};

// La ritrasmissione manuale NON chiude lo scarto: mette in volo un tentativo.
// Il pallino resta finché l'esito non c'è — mentire qui sarebbe peggio che
// non avere il pallino.
// La nota si conserva su ENTRAMBE le azioni: chi la scrive e poi riprova non
// deve ritrovarsela cancellata.
window.byupFiscRiprova = function (id, nota) {
  const s = window.byupReadFisc();
  const prec = s[id] || {};
  const n = Math.min((prec.ritento ? prec.ritento.tentativo : 1) + 1, 5);
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

// ─── Chip di stato della trasmissione ──────────────────────────────────────
// Stessa pill di StatusPill (Costi): piena, radius pill, 12.5/700. Le coppie
// colore sono le sue — verde pagato, ambra da pagare, rosso scaduto — più un
// grigio neutro per lo scarto già gestito, che non deve più chiamare.
const FISC_CHIP = {
  ok:             { label:'Trasmessa',          color:'#065F46', bg:'#D1FAE5' },
  ritrasmissione: { label:'In ritrasmissione',  color:'#92400E', bg:'#FEF3C7' },
  scartata:       { label:'Scartata',           color:'#991B1B', bg:'#FEE2E2' },
  // Inchiostro pieno, non muted: su C.SURF_ALT il grigio PN.MUTED sta sotto
  // il 4.5:1 richiesto a questa dimensione. Senza tinta resta comunque quieto.
  gestita:        { label:'Gestita',            color: PN.TEXT,  bg: C.SURF_ALT },
};

function FiscChip({ info, onOpen }) {
  const s = FISC_CHIP[info.tipo] || FISC_CHIP.ok;
  // Il dettaglio esiste solo dove c'è uno scarto: sulle altre righe la pill
  // resta una pill, senza fingere un click che non porta da nessuna parte.
  const apribile = !!info.scarto;
  // Il conto dei tentativi si mostra solo mentre un invio è davvero in volo:
  // su una riga gestita resterebbe un countdown verso niente.
  const rit = info.tipo === 'ritrasmissione'
    ? (info.ritento || { tentativo: info.tentativo, prossimo: info.prossimo })
    : null;
  const titolo = info.tipo === 'ok' && info.ricevuta
    ? `Identificativo di ricezione ${info.ricevuta} · inviata il ${info.inviata}`
    : (apribile ? 'Apri il dettaglio dello scarto' : undefined);

  const pill = (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius: C.R_PILL,
      background: s.bg, color: s.color, fontSize: 12.5, fontWeight: 700,
      width:'fit-content', whiteSpace:'nowrap',
    }}>{s.label}</span>
  );

  const sotto = rit && rit.tentativo ? (
    <span style={{fontSize: 12, color: PN.MUTED, marginTop: 3, whiteSpace:'nowrap'}}>
      tentativo {rit.tentativo} di 5 · prossimo alle {rit.prossimo}
    </span>
  ) : null;

  if (!apribile) {
    return (
      <span title={titolo} style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
        {pill}{sotto}
      </span>
    );
  }
  return (
    <button onClick={onOpen} title={titolo}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
      style={{
        display:'flex', flexDirection:'column', alignItems:'flex-start',
        background:'transparent', border:'none', padding: 0,
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
        transition:'filter 140ms ease',
      }}>{pill}{sotto}</button>
  );
}

// ─── Dettaglio di uno scarto ───────────────────────────────────────────────
// Stesso scheletro delle modali della sezione (ContNuovoCosto): overlay
// velato, foglio bianco pieno, header con badge icona. Qui il bianco serve
// davvero — c'è un campo da compilare e del testo da leggere con calma.
function ScartoSheet({ closure, onClose }) {
  useFiscTick();
  // La nota si ripesca da quello che l'utente aveva già scritto.
  const [nota, setNota] = React.useState(() => (window.byupReadFisc()[closure.id] || {}).nota || '');

  const info = fiscInfo(closure);
  const sc = closure.fisc.scarto;
  const chiuso = !!info.gestito;

  // "Aperto il …" si scrive solo finché lo scarto è vivo: segnarlo su uno già
  // chiuso metterebbe nel log un evento successivo alla gestione.
  React.useEffect(() => { if (!chiuso) window.byupFiscVisto(closure.id); }, [closure.id, chiuso]);

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
        width: 620, maxWidth:'100%', maxHeight:'100%', background: PN.WHITE,
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
          <div style={{display:'flex', alignItems:'center', gap: 14}}>
            {/* Niente prop `stroke` sulle Ic.*: in questa pagina finirebbe
                nell'attributo COLORE dell'SVG e l'icona sparirebbe — il
                `_excluded` generato da Babel per IcSvg è sovrascritto da
                quello di panoramica-sf-icons, caricato dopo. */}
            <div style={{
              width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
              background: chiuso ? C.SURF_ALT : '#FEE2E2',
              color: chiuso ? PN.MUTED : '#991B1B',
              display:'grid', placeItems:'center',
              boxShadow: PN.INSET_HIGHLIGHT,
            }}>{chiuso ? <Ic.check size={20}/> : <Ic.warn size={19}/>}</div>
            <div>
              <div style={{fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>
                {chiuso ? 'Scarto gestito' : 'Corrispettivo scartato'}
              </div>
              <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>
                Chiusura del {closure.date} · € {(closure.contanti + closure.nonContanti).toFixed(2)}
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

        {/* Corpo */}
        <div className="pn-scroll" style={{padding:'20px 26px 22px', overflowY:'auto'}}>
          {/* Il motivo per esteso, in italiano: il codice errore dell'Agenzia
              non dice niente a chi deve rimediare. */}
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

          {/* Nota già scritta quando lo scarto è chiuso, campo quando è vivo */}
          {chiuso ? (
            info.gestito.nota && <Blocco titolo="Nota">{info.gestito.nota}</Blocco>
          ) : (
            <div style={{marginTop: 18}}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: PN.MUTED,
                textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
              }}>Nota (facoltativa)</div>
              <textarea value={nota} onChange={e => setNota(e.target.value)}
                placeholder="Cosa hai fatto per sistemarlo — resta nel log della giornata"
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding:'11px 13px', border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                  fontSize: C.T_SM, fontFamily:'inherit', color: PN.TEXT,
                  outline:'none', resize:'vertical', minHeight: 78,
                  transition:'border-color 130ms ease, box-shadow 150ms ease',
                }}/>
            </div>
          )}

          {/* Log dei passaggi */}
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
        </div>

        {/* Piede: le due azioni. Spariscono quando non c'è più niente da fare. */}
        {!chiuso && (
          <div style={{
            padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
            background: PN.WHITE_OFF,
            display:'flex', alignItems:'center', gap: 10,
          }}>
            <div style={{flex: 1, fontSize: C.T_XS, color: PN.MUTED_SOFT}}>
              Finché lo scarto è aperto resta segnalato in Contabilità.
            </div>
            <button onClick={() => { window.byupFiscSegnaGestita(closure.id, nota); onClose(); }}
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
              }}><Ic.check size={14}/> Segna come gestita</button>
            <button onClick={() => { window.byupFiscRiprova(closure.id, nota); onClose(); }}
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

function ContCassa({ cassaOpen = false, setCassaOpen }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [selDate, setSelDate] = React.useState(null); // 'gg/mm/aaaa' o null
  const pickerRef = React.useRef(null);
  const [scartoId, setScartoId] = React.useState(null); // chiusura aperta nel dettaglio
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

  const allRows = CASH_CLOSURES.map(c => ({ ...c, totale: c.contanti + c.nonContanti, fiscInfo: fiscInfo(c) }));
  const rows = selDate ? allRows.filter(r => r.date === selDate) : allRows;
  const totIncassato = rows.reduce((s,r)=>s+r.totale,0);
  // Il conteggio è su TUTTE le chiusure, non su quelle filtrate: uno scarto
  // non smette di esistere perché stai guardando un altro giorno.
  const scartiAperti = allRows.filter(r => r.fiscInfo.aperto).length;
  const scartoAperto = scartoId ? CASH_CLOSURES.find(c => c.id === scartoId) : null;

  // minmax e non fr puri: con le sole frazioni, alla larghezza minima del
  // frame (1280) "Totale incassato" andava a capo e "Contanti" si attaccava a
  // "Carta e digitale". Il minimo di ogni colonna è la sua intestazione;
  // l'ultima tiene "tentativo N di 5 · prossimo alle HH:MM" per intero.
  const cols = 'minmax(96px, 0.9fr) minmax(152px, 1fr) minmax(74px, 0.72fr) minmax(74px, 0.72fr) minmax(88px, 0.85fr) minmax(140px, 0.95fr) minmax(216px, 1.56fr)';

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
                  {scartiAperti} {scartiAperti === 1 ? 'corrispettivo scartato' : 'corrispettivi scartati'}
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
            <span style={{paddingLeft: 14, whiteSpace:'nowrap'}}>Trasmissione AE</span>
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
              <span style={{paddingLeft: 14, minWidth: 0}}>
                <FiscChip info={r.fiscInfo} onOpen={() => setScartoId(r.id)}/>
              </span>
            </div>
          ))}
          </MaxRowsScroll>
        </div>
      </div>

      {/* Dettaglio dello scarto — si ancora al <main> come le altre modali
          della sezione, quindi copre la pagina e non la card. */}
      {scartoAperto && (
        <ScartoSheet closure={scartoAperto} onClose={() => setScartoId(null)}/>
      )}
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
window.FiscChip = FiscChip;
window.ScartoSheet = ScartoSheet;
window.useFiscTick = useFiscTick;

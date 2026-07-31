// Conformità — guscio, primitive condivise e Cruscotto degli adempimenti.
// Le singole tab vivono in admin-conformita-registri / -eventi / -riesami.

const { useState: useStateConf } = React;

// ─── Primitive condivise ───────────────────────────────────────────────────
const cfFmt = (d) => d ? d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const cfGiorniA = (d) => d ? Math.ceil((d.getTime() - Date.now()) / 86400000) : null;

// Stato di un adempimento. Tre casi, non uno:
//  - non applicabile: dichiarato con motivo, esce dal conteggio ma resta a vista
//  - tipo 'data': la scadenza è imposta da fuori (sorveglianza dell'ente)
//  - tipo 'cadenza': la scadenza si calcola da ultima + cadenza, così cambiando
//    la cadenza si aggiorna tutto senza riscrivere date a mano
function cfStatoAdempimento(a) {
  if (a.nonApplicabile) {
    return { prossima:null, giorni:null, stato:'na', label:'Non applicabile', tono:'NEUTRAL', imposta:false };
  }
  const imposta = a.tipo === 'data';
  const prossima = imposta ? a.prossimaImposta : (a.ultima ? cfMesi(a.ultima, a.cadenzaMesi) : null);
  if (!prossima) {
    return { prossima:null, giorni:null, stato:'mai',
      label: imposta ? 'Data non fissata' : 'Mai eseguito', tono:'DANGER', imposta };
  }
  const g = cfGiorniA(prossima);
  if (g < 0)   return { prossima, giorni:g, stato:'scaduto', label:`Scaduto da ${-g} giorni`, tono:'DANGER', imposta };
  if (g <= 30) return { prossima, giorni:g, stato:'vicino',  label:`Fra ${g} giorni`, tono:'WARN', imposta };
  return { prossima, giorni:g, stato:'ok', label:`Fra ${g} giorni`, tono:'OK', imposta };
}

const CF_TONO = (t) => ({ DANGER:ADM.DANGER, WARN:ADM.WARN, OK:ADM.OK, INFO:ADM.INFO, NEUTRAL:ADM.MUTED }[t] || ADM.MUTED);
const CF_TONO_BG = (t) => ({ DANGER:ADM.DANGER_SOFT, WARN:ADM.WARN_SOFT, OK:ADM.OK_SOFT, INFO:'#E7F0FE', NEUTRAL:ADM.NEUTRAL_SOFT }[t] || ADM.NEUTRAL_SOFT);

// Chip della norma: dice a colpo d'occhio quale certificazione serve quel dato.
function CfNorma({ norme }) {
  return (
    <span style={{display:'inline-flex', gap:4}}>
      {(norme || []).map(n => (
        <span key={n} style={{
          fontSize:10.5, fontWeight:800, letterSpacing:'0.03em',
          padding:'2px 6px', borderRadius:5, whiteSpace:'nowrap',
          background: n === '27001' ? '#EDE9FE' : '#DBEAFE',
          color: n === '27001' ? '#5B21B6' : '#1D4ED8',
        }}>{n}</span>
      ))}
    </span>
  );
}

function CfPill({ tono, children }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:5, padding:'2px 9px', borderRadius:99,
      background:CF_TONO_BG(tono), color:CF_TONO(tono), fontSize:11.4, fontWeight:700, whiteSpace:'nowrap'}}>
      <span style={{width:6, height:6, borderRadius:'50%', background:CF_TONO(tono), flexShrink:0}}/>
      {children}
    </span>
  );
}

const CF_H = { fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 };
const CF_GRID_ST = '104px minmax(0,1.5fr) minmax(0,1.7fr) minmax(0,1.2fr) minmax(0,1.3fr)';
const CF_GRID_AD = 'minmax(0,2.7fr) 0.85fr 0.8fr 1.45fr minmax(0,1.15fr) 22px';
const CF_INP = { width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8,
  fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box' };
const CF_LAB = { fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.05em', display:'block', marginBottom:5 };
const CF_CARD = { border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden', background:'#fff' };
const CF_TH = { padding:'9px 16px', background:'#FAFAFB', borderBottom:`1px solid ${ADM.BORDER}`,
  fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em' };

// Riquadro "documento su Drive": i documenti non vivono in Spot, i registri ci
// puntano. Se manca il collegamento è un buco da colmare, non un dettaglio.
// `breve` mostra il solo nome del file: dentro una colonna di tabella il
// percorso intero manda la cella a tre righe e la cartella non aggiunge nulla
// che il titolo non dica già. Il percorso completo resta nel tooltip.
function CfDoc({ doc, breve }) {
  if (!doc) return <span style={{fontSize:12, color:ADM.WARN, fontWeight:700}}>documento mancante</span>;
  const testo = breve ? String(doc).split('/').pop() : doc;
  return (
    <span title={doc} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12,
      color:ADM.MUTED, minWidth:0, maxWidth:'100%'}}>
      <BuIcons.paperclip size={13} color={ADM.MUTED_SOFT}/>
      <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{testo}</span>
    </span>
  );
}

// ─── Storico di un adempimento ─────────────────────────────────────────────
// «Quando l'avete fatto la volta prima? E quella prima ancora?» è la domanda
// con cui un auditor smonta un adempimento che sulla carta è in regola: una
// data sola non dimostra una cadenza, dimostra un episodio. Lo storico non è
// un dato nuovo — vive già nei registri delle sezioni — ma andava letto in
// quattro posti diversi, ognuno con la sua forma. Qui si normalizza e si legge
// dove si guarda la scadenza, che è dove nasce la domanda.
//
// Gli adempimenti senza un registro dedicato hanno solo la data dell'ultima
// esecuzione: si mostra quella, dichiarando che è l'unica cosa registrata.
// Fingere una storia che non c'è sarebbe peggio di ammetterlo.
function cfStorico(a) {
  const arr = (x) => (typeof x !== 'undefined' && x) ? x : [];
  if (a.id === 'acc') {
    return arr(window.RIESAMI_CHIUSI).map(c => {
      const rev = c.esiti.filter(e => e.decisione === 'revocato').length;
      return { data:c.chiusaIl, titolo:c.periodo, rif:c.id, chi:c.revisore,
        esito:`${c.esiti.length} utenze esaminate · ${rev ? `${rev} revocate` : 'nessuna revoca'}`,
        tono: rev ? 'WARN' : 'OK', evidenza:'attestazione firmata · CSV', tipo:'acc', raw:c };
    });
  }
  if (a.id === 'dir') {
    return arr(window.RIESAMI_DIREZIONE).map(r => ({
      data:r.data, titolo:'Riesame di direzione', rif:r.id, chi:r.partecipanti,
      esito:`${(r.decisioni || []).length} ${(r.decisioni || []).length === 1 ? 'decisione presa' : 'decisioni prese'}`,
      tono:'OK', doc:r.doc, tipo:'dir', raw:r }));
  }
  if (a.id === 'audit') {
    return arr(window.AUDIT_INTERNI).map(x => ({
      data:x.data, titolo:x.aree, rif:x.id, chi:x.auditor,
      esito:`${x.rilievi} ${x.rilievi === 1 ? 'rilievo' : 'rilievi'} · ${x.maggiori} ${x.maggiori === 1 ? 'maggiore' : 'maggiori'}, ${x.minori} ${x.minori === 1 ? 'minore' : 'minori'}, ${x.osservazioni} oss.`,
      tono: x.maggiori ? 'DANGER' : 'OK', doc:x.doc, tipo:'audit', raw:x }));
  }
  if (a.id === 'rest') {
    return arr(window.RIPRISTINI).slice().sort((x, y) => y.data - x.data).map(r => ({
      data:r.data, titolo:r.oggetto, rif:null, chi:r.chi,
      esito:`${r.esito} in ${r.tempoMin} minuti`,
      tono: r.esito === 'riuscito' ? 'OK' : r.esito === 'riuscito con osservazioni' ? 'WARN' : 'DANGER',
      evidenza:'registro dei ripristini', nota:r.note, tipo:'rest', raw:r }));
  }
  if (a.ultima) {
    return [{ data:a.ultima, titolo:'Eseguito', rif:null, chi:a.responsabile,
      esito:'registrata solo la data', tono:'NEUTRAL', evidenza:'—', sola:true }];
  }
  return [];
}

// ─── Dettaglio di un singolo esame passato ─────────────────────────────────
// Lo storico dice CHE l'esame è stato fatto; questo dice che cosa ci è stato
// deciso dentro, riga per riga. È il secondo livello della stessa domanda: un
// auditor parte da «ogni quanto lo fate», passa a «e la volta prima?», e finisce
// su «fammi vedere quel riesame lì». Il contenuto è quello che prima viveva
// sparso nelle sezioni — le decisioni di una campagna accessi, quelle di un
// riesame di direzione — e che da lì è stato tolto: qui torna, ma appeso
// all'adempimento invece che alla schermata che lo produce.
const CF_GRID_DEC = 'minmax(0,1.25fr) 0.9fr 0.85fr 125px 0.95fr minmax(0,1.9fr)';

function CfEsame({ r }) {
  const T = { fontSize:11, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em' };
  const riga = (k, v) => (
    <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
      <span style={{color:ADM.MUTED, width:150, flexShrink:0}}>{k}</span>
      <span style={{color:ADM.TEXT, fontWeight:600, minWidth:0}}>{v}</span>
    </div>
  );

  if (r.tipo === 'acc') {
    const c = r.raw;
    return (
      <React.Fragment>
        <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
          {riga('Campagna', c.id)}
          {riga('Periodo', c.periodo)}
          {riga('Chiusa il', cfFmt(c.chiusaIl))}
          {riga('Revisore', c.revisore)}
        </div>
        <div style={{...CF_H, marginBottom:8}}>Decisione per ogni utenza · {c.esiti.length}</div>
        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:CF_GRID_DEC, gap:10}}>
            <div>Soggetto</div><div>Ruolo allora</div><div>Decisione</div><div>Decisa il</div><div>Da</div><div>Motivo</div>
          </div>
          {c.esiti.map((e, i) => {
            const sog = (typeof TEAM !== 'undefined' ? TEAM : []).find(t => t.id === e.soggettoId);
            const nome = sog ? (sog.nomeCompleto || sog.nome) : (e.nomeStorico || e.soggettoId);
            const revocato = e.decisione === 'revocato';
            return (
              <div key={e.soggettoId} style={{display:'grid', gridTemplateColumns:CF_GRID_DEC, gap:10,
                alignItems:'baseline', padding:'9px 16px', fontSize:12.4,
                borderBottom: i < c.esiti.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                background: revocato ? '#FFF7F7' : '#fff'}}>
                <span style={{fontWeight:700, color:ADM.TEXT}}>{nome}</span>
                <span style={{color:ADM.MUTED}}>{(RUOLI[e.ruoloAllora] && RUOLI[e.ruoloAllora].label) || e.ruoloAllora}</span>
                <span style={{fontWeight:700, color: revocato ? ADM.DANGER : ADM.OK}}>
                  {revocato ? 'Revocato' : 'Confermato'}
                </span>
                <span style={{color:ADM.MUTED, whiteSpace:'nowrap'}}>{cfFmt(e.quando)}</span>
                <span style={{color:ADM.MUTED}}>{e.chi}</span>
                <span style={{color: e.motivo ? ADM.TEXT : ADM.MUTED_SOFT, lineHeight:1.4}}>{e.motivo || '—'}</span>
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  if (r.tipo === 'dir') {
    const d = r.raw;
    const testo = (x) => (typeof x === 'string' ? x : (x && x.testo) || '');
    const tipoDi = (x) => (typeof x === 'string' ? null : (x && x.tipo) || null);
    const ETICHETTE = { miglioramento:'Opportunità di miglioramento', modifiche:'Modifiche al sistema di gestione',
      risorse:'Risorse necessarie', _:'Altre decisioni' };
    const dec = d.decisioni || [];
    const gruppi = ['miglioramento','modifiche','risorse','_']
      .map(k => ({ k, righe: dec.filter(x => (tipoDi(x) || '_') === k) })).filter(g => g.righe.length);
    return (
      <React.Fragment>
        <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
          {riga('Riesame', d.id)}
          {riga('Svolto il', cfFmt(d.data))}
          {riga('Partecipanti', d.partecipanti)}
          {riga('Verbale', d.doc || 'documento mancante')}
        </div>
        <div style={{...CF_H, marginBottom:8}}>Decisioni prese · {dec.length}</div>
        {/* Raggruppate per le tre uscite della §9.3.3, che è come l'auditor le
            cerca: in un elenco piatto la terza — le risorse — si confonde. */}
        {gruppi.map((g, gi) => (
          <div key={g.k} style={{marginTop: gi ? 14 : 0}}>
            <div style={{...T, marginBottom:5}}>{ETICHETTE[g.k]}</div>
            {g.righe.map((x, i) => (
              <div key={i} style={{fontSize:12.8, color:ADM.TEXT, lineHeight:1.5, padding:'6px 0',
                borderBottom: i < g.righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                {testo(x)}
              </div>
            ))}
          </div>
        ))}
      </React.Fragment>
    );
  }

  if (r.tipo === 'audit') {
    const x = r.raw;
    return (
      <React.Fragment>
        <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
          {riga('Audit', x.id)}
          {riga('Svolto il', cfFmt(x.data))}
          {riga('Auditor', x.auditor)}
          {riga('Ambito', <CfNorma norme={x.ambito}/>)}
          {riga('Aree coperte', x.aree)}
          {riga('Rapporto', x.doc || 'documento mancante')}
        </div>
        <div style={{...CF_H, marginBottom:8}}>Rilievi · {x.rilievi}</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10}}>
          {[['Maggiori', x.maggiori, x.maggiori ? 'DANGER' : 'OK'],
            ['Minori', x.minori, x.minori ? 'WARN' : 'OK'],
            ['Osservazioni', x.osservazioni, 'NEUTRAL']].map(([k, n, tono]) => (
            <div key={k} style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, padding:'12px 14px'}}>
              <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', color: n ? CF_TONO(tono) : ADM.INK}}>{n}</div>
              <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:2}}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:12, lineHeight:1.55}}>
          Una non conformità maggiore è quella che blocca il certificato finché non è
          chiusa; una minore va risolta ma non ferma nulla; un'osservazione è un
          suggerimento. Il dettaglio di ognuna sta nel rapporto dell'auditor.
        </div>
      </React.Fragment>
    );
  }

  if (r.tipo === 'rest') {
    const t = r.raw;
    const oltre = t.tempoMin > 45;
    return (
      <React.Fragment>
        <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
          {riga('Svolto il', cfFmt(t.data))}
          {riga('Che cosa', t.oggetto)}
          {riga('Eseguito da', t.chi)}
          {riga('Esito', t.esito)}
        </div>
        <div style={{...CF_H, marginBottom:8}}>Tempo contro l’obiettivo</div>
        <div style={{display:'flex', alignItems:'baseline', gap:10}}>
          <span style={{fontSize:28, fontWeight:800, letterSpacing:'-0.02em',
            color: oltre ? ADM.WARN : ADM.INK}}>{t.tempoMin} min</span>
          <span style={{fontSize:12.8, color:ADM.MUTED}}>
            {oltre ? `oltre l’obiettivo dichiarato di 45 minuti` : 'entro l’obiettivo dichiarato di 45 minuti'}
          </span>
        </div>
        {t.note && <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:12, lineHeight:1.55}}>{t.note}</div>}
        <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:12, lineHeight:1.55}}>
          «Riuscito» da solo non dice se saresti arrivato in tempo: il numero che conta
          è il tempo impiegato contro l’obiettivo dichiarato.
        </div>
      </React.Fragment>
    );
  }

  return (
    <div style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.6, padding:'14px 16px',
      borderRadius:10, background:ADM.NEUTRAL_SOFT}}>
      Di questa esecuzione è registrata solo la data: non esiste un registro che ne
      conservi il contenuto. Un adempimento che si dimostra con una data e nient’altro
      regge finché nessuno chiede che cosa è stato fatto.
    </div>
  );
}

// ─── Cruscotto degli adempimenti ───────────────────────────────────────────
function CfCruscotto({ onNav }) {
  const [modifica, setModifica] = useStateConf(null);   // adempimento in modifica
  const [bozza, setBozza] = useStateConf(null);
  const [, forzaCf] = useStateConf(0);
  const [storico, setStorico] = useStateConf(null);   // adempimento aperto sullo storico
  const [esame, setEsame] = useStateConf(null);       // singola esecuzione aperta dentro lo storico
  const [gruppo, setGruppo] = useStateConf(null);     // filtro per stato

  // I non applicabili scendono in fondo: restano a vista come evidenza, ma non
  // devono competere con le scadenze vere per l'attenzione.
  const tutte = ADEMPIMENTI
    .map(a => ({ a, s: cfStatoAdempimento(a) }))
    .sort((x, y) => {
      if ((x.s.stato === 'na') !== (y.s.stato === 'na')) return x.s.stato === 'na' ? 1 : -1;
      return (x.s.giorni == null ? -1e9 : x.s.giorni) - (y.s.giorni == null ? -1e9 : y.s.giorni);
    });

  // Ventidue righe tutte uguali non dicono a che punto sei. I gruppi sono i
  // quattro stati in cui può stare un obbligo, e il conteggio si vede prima di
  // cliccare: «dieci scaduti» è la prima cosa da sapere aprendo la pagina.
  const GRUPPI = [
    { id:'fuori',  label:'Da fare',      test:(s) => s.stato === 'scaduto' || s.stato === 'mai', tono:'DANGER' },
    { id:'vicino', label:'In scadenza',  test:(s) => s.stato === 'vicino',  tono:'WARN' },
    { id:'ok',     label:'In regola',    test:(s) => s.stato === 'ok',      tono:'OK' },
    { id:'na',     label:'Non applicabili', test:(s) => s.stato === 'na',   tono:'NEUTRAL' },
  ].map(g => Object.assign({}, g, { n: tutte.filter(r => g.test(r.s)).length }))
   .filter(g => g.n > 0);
  const righe = gruppo ? tutte.filter(r => (GRUPPI.find(g => g.id === gruppo) || { test:() => true }).test(r.s)) : tutte;

  const apriModifica = (a) => {
    setModifica(a);
    setBozza({
      cadenzaMesi: String(a.cadenzaMesi || ''),
      prossimaImposta: a.prossimaImposta ? a.prossimaImposta.toISOString().slice(0, 10) : '',
      responsabile: a.responsabile || '',
      nonApplicabile: a.nonApplicabile || '',
      applicabile: !a.nonApplicabile,
    });
  };

  const salvaModifica = () => {
    if (!modifica || !bozza) return;
    if (bozza.applicabile) {
      delete modifica.nonApplicabile;
      if (modifica.tipo === 'data') {
        modifica.prossimaImposta = bozza.prossimaImposta ? new Date(bozza.prossimaImposta + 'T12:00:00') : null;
      } else {
        const n = parseInt(bozza.cadenzaMesi, 10);
        if (n > 0) modifica.cadenzaMesi = n;
      }
    } else {
      modifica.nonApplicabile = bozza.nonApplicabile.trim() || 'Non applicabile al perimetro dichiarato.';
    }
    modifica.responsabile = bozza.responsabile.trim() || '—';
    setModifica(null); setBozza(null); forzaCf(n => n + 1);
  };

  return (
    <div style={{padding:'18px 22px 22px', display:'flex', flexDirection:'column', flex:1, minHeight:0}}>
      {/* Prima della tabella, i quattro stati in cui può stare un obbligo, con
          quanti ne stanno dentro. È il colpo d'occhio che a ventidue righe tutte
          uguali mancava, ed è anche il filtro: «da fare» è la vista con cui si
          apre questa pagina il 90% delle volte. */}
      <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:12, flexShrink:0}}>
        {[{ id:null, label:'Tutti', n:tutte.length, tono:null }].concat(GRUPPI).map(g => {
          const attivo = gruppo === g.id;
          return (
            <button key={g.id || 'tutti'} onClick={()=>setGruppo(g.id)}
              style={{padding:'5px 11px', borderRadius:999, fontFamily:'inherit', fontSize:12.4,
                fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6,
                border:`1px solid ${attivo ? ADM.TEXT : ADM.BORDER}`,
                background: attivo ? ADM.TEXT : '#fff', color: attivo ? '#fff' : ADM.TEXT}}>
              {g.tono && !attivo && (
                <span style={{width:6, height:6, borderRadius:'50%', background:CF_TONO(g.tono)}}/>
              )}
              {g.label}
              <span style={{fontSize:11.2, fontWeight:700, opacity: attivo ? 0.75 : 0.5}}>{g.n}</span>
            </button>
          );
        })}
      </div>

      {/* La tabella riempie la pagina e scorre da dentro: l'intestazione resta
          ferma, così su ventidue righe non si perde di vista quale colonna si
          sta leggendo. */}
      <div style={{...CF_CARD, display:'flex', flexDirection:'column', flex:1, minHeight:0}}>
        <div style={{...CF_TH, display:'grid', gridTemplateColumns:CF_GRID_AD, gap:12, flexShrink:0}}>
          <div>Adempimento</div><div>Norma</div><div>Ogni</div><div>Prossima scadenza</div><div>Responsabile</div><div/>
        </div>
        <div style={{flex:1, minHeight:0, overflowY:'auto'}}>
          {righe.map(({ a, s }, i) => {
            const na = s.stato === 'na';
            const fuori = s.stato === 'scaduto' || s.stato === 'mai';
            return (
              /* Due righe per adempimento, non quattro: la nota che lo spiega e
                 la data dell'ultima esecuzione sono passate nel dettaglio, dove
                 c'è lo spazio per leggerle. Su ventidue righe la differenza è fra
                 una pagina che si scorre e una che si scansiona.
                 Via anche «Modifica» e «Apri» da ogni riga — quarantaquattro
                 bottoni in una schermata — che ora stanno nel dettaglio. */
              <div key={a.id} className="adm-row-open" onClick={()=>{ setEsame(null); setStorico(a); }}
                style={{display:'grid', gridTemplateColumns:CF_GRID_AD, gap:12,
                  alignItems:'center', padding:'11px 16px', cursor:'pointer',
                  borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                  background: na ? '#FCFCFD' : fuori ? '#FFFBFB' : '#fff',
                  opacity: na ? 0.7 : 1}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis'}}>{a.nome}</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2}}>{a.rif}</div>
                </div>
                <div><CfNorma norme={a.norme}/></div>
                <div style={{fontSize:12.6, color:ADM.MUTED}}>
                  {na ? '—' : s.imposta
                    ? <span style={{color:ADM.TEXT, fontWeight:700}}>data imposta</span>
                    : `${a.cadenzaMesi} mesi`}
                </div>
                <div style={{minWidth:0}}>
                  {na ? <CfPill tono="NEUTRAL">Non applicabile</CfPill> : (
                    <React.Fragment>
                      <CfPill tono={s.tono}>{s.label}</CfPill>
                      {s.prossima && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:3}}>{cfFmt(s.prossima)}</div>}
                    </React.Fragment>
                  )}
                </div>
                <div style={{fontSize:12.6, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.responsabile}</div>
                <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
              </div>
            );
          })}
        </div>
      </div>


      {/* Modifica: cambia forma secondo la natura dell'adempimento */}
      {modifica && bozza && (
        <div onClick={()=>{setModifica(null); setBozza(null);}} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:520, maxWidth:'92%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:4}}>{modifica.nome}</div>
            <div style={{fontSize:12.4, color:ADM.MUTED, marginBottom:16}}>{modifica.rif}</div>

            <div style={{display:'flex', gap:8, marginBottom:16}}>
              {[{ v:true, l:'Applicabile' }, { v:false, l:'Non applicabile' }].map(o => (
                <button key={o.l} onClick={()=>setBozza(b => ({ ...b, applicabile:o.v }))}
                  style={{flex:1, padding:'9px 12px', borderRadius:9, fontFamily:'inherit', fontSize:13, fontWeight:700,
                    cursor:'pointer', border:`1.5px solid ${bozza.applicabile === o.v ? ADM.PINK : ADM.BORDER}`,
                    background: bozza.applicabile === o.v ? ADM.PINK_SOFT : '#fff',
                    color: bozza.applicabile === o.v ? ADM.PINK_DARK : ADM.MUTED}}>{o.l}</button>
              ))}
            </div>

            {bozza.applicabile ? (
              <React.Fragment>
                {modifica.tipo === 'data' ? (
                  <div style={{marginBottom:14}}>
                    <label style={CF_LAB}>Prossima verifica · data fissata dall'ente</label>
                    <input type="date" value={bozza.prossimaImposta}
                      onChange={e=>setBozza(b => ({ ...b, prossimaImposta:e.target.value }))} style={CF_INP}/>
                    <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:6, lineHeight:1.45}}>
                      Qui non c'è una cadenza da impostare: la data arriva dall'ente di certificazione
                      e si trascrive.
                    </div>
                  </div>
                ) : (
                  <div style={{marginBottom:14}}>
                    <label style={CF_LAB}>Ogni quanti mesi</label>
                    <input type="number" min="1" max="60" value={bozza.cadenzaMesi}
                      onChange={e=>setBozza(b => ({ ...b, cadenzaMesi:e.target.value }))} style={CF_INP}/>
                    <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:6, lineHeight:1.45}}>
                      {modifica.ultima && parseInt(bozza.cadenzaMesi, 10) > 0
                        ? `Con questa cadenza la prossima scadenza è il ${cfFmt(cfMesi(modifica.ultima, parseInt(bozza.cadenzaMesi, 10)))}.`
                        : 'Mai eseguito: la prima scadenza partirà dalla prima esecuzione registrata.'}
                    </div>
                  </div>
                )}
                <div style={{marginBottom:16}}>
                  <label style={CF_LAB}>Responsabile</label>
                  <input value={bozza.responsabile}
                    onChange={e=>setBozza(b => ({ ...b, responsabile:e.target.value }))} style={CF_INP}/>
                </div>
              </React.Fragment>
            ) : (
              <div style={{marginBottom:16}}>
                <label style={CF_LAB}>Perché non si applica</label>
                <textarea value={bozza.nonApplicabile} rows={3}
                  onChange={e=>setBozza(b => ({ ...b, nonApplicabile:e.target.value }))}
                  placeholder="Es. Byup non impiega strumenti di misura fisici: il prodotto è software."
                  style={{...CF_INP, minHeight:76, resize:'vertical'}}/>
                <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:6, lineHeight:1.45}}>
                  La motivazione è la parte che conta: un requisito dichiarato non applicabile
                  <strong> con il perché</strong> è evidenza, senza è un buco.
                </div>
              </div>
            )}

            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>{setModifica(null); setBozza(null);}}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={salvaModifica}>Salva</AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* Storico dell'adempimento — è la schermata che si gira all'auditor
          quando chiede «e la volta prima?». */}
      {storico && (() => {
        const a = storico, s = cfStatoAdempimento(a), righeSt = cfStorico(a);
        return (
        <div onClick={()=>setStorico(null)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:820, maxWidth:'94%', maxHeight:'88%', background:'#fff',
            borderRadius:14, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
            display:'flex', flexDirection:'column'}}>

            <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
              {esame && (
                <div onClick={()=>setEsame(null)} className="adm-textlink"
                  style={{display:'inline-flex', alignItems:'center', gap:5, cursor:'pointer', marginBottom:8,
                    fontSize:12.4, fontWeight:700, color:ADM.PINK}}>
                  <span style={{transform:'rotate(180deg)', display:'inline-flex'}}><BuIcons.chevronRight size={13}/></span>
                  Torna alle esecuzioni
                </div>
              )}
              <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>
                    {esame ? `${a.nome} · ${cfFmt(esame.data)}` : a.nome}
                  </div>
                  <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:3, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                    <CfNorma norme={a.norme}/>{a.rif}
                    <span style={{color:ADM.MUTED_SOFT}}>·</span>
                    {s.stato === 'na' ? 'non applicabile' : s.imposta ? 'data imposta dall’ente' : `ogni ${a.cadenzaMesi} mesi`}
                    <span style={{color:ADM.MUTED_SOFT}}>·</span>
                    {a.responsabile}
                  </div>
                </div>
                {s.stato !== 'na' && (
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <CfPill tono={s.tono}>{s.label}</CfPill>
                    {s.prossima && <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:4}}>prossima {cfFmt(s.prossima)}</div>}
                  </div>
                )}
              </div>
              {a.nonApplicabile && (
                <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:10, lineHeight:1.5}}>{a.nonApplicabile}</div>
              )}
            </div>

            <div style={{padding:'16px 22px 20px', overflowY:'auto', flex:1, minHeight:0}}>
              {esame ? <CfEsame r={esame}/> : (
              <React.Fragment>
              <div style={{...CF_H, marginBottom:8}}>
                {righeSt.length ? `Esecuzioni registrate · ${righeSt.length}` : 'Esecuzioni registrate'}
              </div>

              {righeSt.length === 0 ? (
                <div style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.6, padding:'14px 16px',
                  borderRadius:10, background:ADM.NEUTRAL_SOFT}}>
                  {a.nonApplicabile
                    ? 'Dichiarato non applicabile: non ci sono esecuzioni da registrare, e la motivazione qui sopra è l’evidenza.'
                    : 'Mai eseguito. Per l’auditor un adempimento dichiarato con una cadenza e senza nemmeno una esecuzione è un rilievo aperto: la prima volta che lo si svolge, la data registrata qui fa partire la scadenza.'}
                </div>
              ) : (
                <React.Fragment>
                  <div style={CF_CARD}>
                    <div style={{...CF_TH, display:'grid', gridTemplateColumns:CF_GRID_ST, gap:10}}>
                      <div>Quando</div><div>Che cosa</div><div>Esito</div><div>Chi</div><div>Evidenza</div>
                    </div>
                    {righeSt.map((r, i) => (
                      <div key={i} className="adm-row-open" onClick={()=>setEsame(r)}
                        style={{display:'grid', gridTemplateColumns:CF_GRID_ST, gap:10, alignItems:'baseline',
                        padding:'11px 16px', cursor:'pointer',
                        borderBottom: i < righeSt.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                        <div style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap'}}>{cfFmt(r.data)}</div>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:12.6, color:ADM.TEXT, lineHeight:1.35}}>{r.titolo}</div>
                          {r.rif && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>{r.rif}</div>}
                        </div>
                        <div style={{fontSize:12.4, lineHeight:1.35,
                          color: r.tono === 'DANGER' ? ADM.DANGER : r.tono === 'WARN' ? ADM.WARN : ADM.TEXT,
                          fontWeight: r.tono === 'DANGER' || r.tono === 'WARN' ? 700 : 500}}>
                          {r.esito}
                          {r.nota && <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:2, fontWeight:400}}>{r.nota}</div>}
                        </div>
                        <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.35}}>{r.chi}</div>
                        <div style={{minWidth:0, overflow:'hidden'}}>
                          {r.evidenza
                            ? <span style={{fontSize:12, color:ADM.MUTED_SOFT}}>{r.evidenza}</span>
                            : <CfDoc doc={r.doc} breve/>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {righeSt.length === 1 && righeSt[0].sola && (
                    <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:10, lineHeight:1.55}}>
                      Di questo adempimento è registrata solo la data dell’ultima esecuzione: non c’è
                      un registro dedicato che ne conservi le volte precedenti. Una data sola non
                      dimostra una cadenza, dimostra un episodio — e «e la volta prima?» è la domanda
                      con cui un auditor smonta un adempimento che sulla carta è in regola.
                    </div>
                  )}
                </React.Fragment>
              )}
              </React.Fragment>
              )}
            </div>

            {/* I due comandi che erano su ogni riga della tabella — quarantaquattro
                bottoni in una schermata — vivono qui, sull'adempimento che stai
                guardando. */}
            <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
              alignItems:'center', gap:8, flexShrink:0, flexWrap:'wrap'}}>
              <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, minWidth:120}}>
                {a.ultima ? `Ultima esecuzione ${cfFmt(a.ultima)}` : 'Nessuna esecuzione registrata'}
              </span>
              {!esame && (
                <AdmButton variant="ghost" size="sm" onClick={()=>{ setStorico(null); apriModifica(a); }}>
                  Modifica cadenza
                </AdmButton>
              )}
              <AdmButton variant="secondary" size="sm" onClick={()=>{ setEsame(null); setStorico(null); }}>Chiudi</AdmButton>
              {a.vaiA && s.stato !== 'na' && !esame && (
                <AdmButton variant="primary" size="sm" onClick={()=>{ setEsame(null); setStorico(null); onNav && onNav(a.vaiA); }}>
                  Apri il registro
                </AdmButton>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

// ─── Guscio ────────────────────────────────────────────────────────────────
function AdmConformitaPage({ initialTab, onNavRoute }) {
  const [tab, setTab] = useStateConf(initialTab || 'cruscotto');
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  // Accetta sia una tab di Conformita (stringa) sia una destinazione altrove
  // (oggetto con route): da quando formazione e ripristino vivono in
  // Piattaforma, un link del cruscotto puo uscire da questa sezione.
  const vai = (dest) => {
    if (!dest) return;
    if (typeof dest === 'string') { setTab(dest); return; }
    if (dest.route && dest.route !== 'conformita') { onNavRoute && onNavRoute(dest.route, dest.tab); return; }
    setTab(dest.tab || 'cruscotto');
  };

  // Le tab vivono in file separati: se uno non è ancora caricato la pagina non
  // deve rompersi, mostra un segnaposto.
  const manca = (nome) => (
    <div style={{padding:'40px 22px', textAlign:'center', color:ADM.MUTED, fontSize:13}}>
      Sezione «{nome}» non caricata.
    </div>
  );

  // Il Cruscotto occupa tutta la pagina e scorre da dentro la tabella: le altre
  // tab restano a flusso normale, hanno contenuti di altezze molto diverse e
  // vincolarle qui le taglierebbe.
  const pieno = tab === 'cruscotto';

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16,
      ...(pieno ? {height:'100%', boxSizing:'border-box'} : {})}}>
      <AdmCard padding={0} style={pieno ? {flex:1, minHeight:0, display:'flex', flexDirection:'column'} : undefined}>
        <div style={{padding:'0 22px 0 8px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <AdmTabBar tabs={[
            { id:'cruscotto', label:'Cruscotto' },
            { id:'rischi',    label:'Rischi' },
            { id:'fornitori', label:'Fornitori' },
            { id:'incidenti', label:'Incidenti' },
            { id:'nc',        label:'Non conformità' },
            { id:'audit',     label:'Audit e riesami' },
            // Il registro della formazione stava in Risorse Umane, che non
            // esiste più come sezione. La sua casa naturale è questa: il
            // componente vive già qui (CfFormazione è in conformita-riesami),
            // l'obbligo è la A.6.3 e gli adempimenti che ci puntano partono
            // dal Cruscotto qui accanto.
            { id:'formazione', label:'Formazione' },
          ]} active={tab} onChange={setTab}/>
        </div>

        {tab === 'cruscotto' && <CfCruscotto onNav={vai}/>}
        {tab === 'rischi'    && (window.CfRischi        ? <CfRischi/>        : manca('Rischi'))}
        {tab === 'fornitori' && (window.CfFornitori     ? <CfFornitori/>     : manca('Fornitori'))}
        {tab === 'incidenti' && (window.CfIncidenti     ? <CfIncidenti/>     : manca('Incidenti'))}
        {tab === 'nc'        && (window.CfNonConformita ? <CfNonConformita/> : manca('Non conformità'))}
        {/* onVai accende i collegamenti del pacchetto di input verso i registri:
            senza, il riesame di direzione elenca i numeri ma non ci porta. */}
        {tab === 'audit'     && (window.CfAudit         ? <CfAudit onVai={vai}/> : manca('Audit e riesami'))}
        {tab === 'formazione'&& (window.CfFormazione    ? <CfFormazione/>    : manca('Formazione'))}
      </AdmCard>
    </div>
  );
}

window.cfFmt = cfFmt;
window.cfGiorniA = cfGiorniA;
window.cfStatoAdempimento = cfStatoAdempimento;
window.CF_TONO = CF_TONO;
window.CF_TONO_BG = CF_TONO_BG;
window.CfNorma = CfNorma;
window.CfPill = CfPill;
window.CfDoc = CfDoc;
window.CF_H = CF_H;
window.CF_CARD = CF_CARD;
window.CF_INP = CF_INP;
window.CF_LAB = CF_LAB;
window.CF_TH = CF_TH;
window.AdmConformitaPage = AdmConformitaPage;

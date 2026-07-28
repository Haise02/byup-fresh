// Conformità — guscio, primitive condivise e Cruscotto degli adempimenti.
// Le singole tab vivono in admin-conformita-registri / -eventi / -riesami.

const { useState: useStateConf } = React;

// ─── Primitive condivise ───────────────────────────────────────────────────
const cfFmt = (d) => d ? d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const cfGiorniA = (d) => d ? Math.ceil((d.getTime() - Date.now()) / 86400000) : null;

// Stato di un adempimento ricorrente: la scadenza si calcola dalla cadenza,
// non si scrive a mano — così cambiando la cadenza si aggiorna tutto.
function cfStatoAdempimento(a) {
  if (!a.ultima) return { prossima:null, giorni:null, stato:'mai', label:'Mai eseguito', tono:'DANGER' };
  const prossima = cfMesi(a.ultima, a.cadenzaMesi);
  const g = cfGiorniA(prossima);
  if (g < 0)  return { prossima, giorni:g, stato:'scaduto',  label:`Scaduto da ${-g} giorni`, tono:'DANGER' };
  if (g <= 30) return { prossima, giorni:g, stato:'vicino',  label:`Scade fra ${g} giorni`,   tono:'WARN' };
  return { prossima, giorni:g, stato:'ok', label:`Fra ${g} giorni`, tono:'OK' };
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
const CF_CARD = { border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden', background:'#fff' };
const CF_TH = { padding:'9px 16px', background:'#FAFAFB', borderBottom:`1px solid ${ADM.BORDER}`,
  fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em' };

// Riquadro "documento su Drive": i documenti non vivono in Spot, i registri ci
// puntano. Se manca il collegamento è un buco da colmare, non un dettaglio.
function CfDoc({ doc }) {
  if (!doc) return <span style={{fontSize:12, color:ADM.WARN, fontWeight:700}}>documento mancante</span>;
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:ADM.MUTED}}>
      <BuIcons.paperclip size={13} color={ADM.MUTED_SOFT}/>{doc}
    </span>
  );
}

// ─── Cruscotto degli adempimenti ───────────────────────────────────────────
function CfCruscotto({ onNav }) {
  const righe = ADEMPIMENTI
    .map(a => ({ a, s: cfStatoAdempimento(a) }))
    .sort((x, y) => (x.s.giorni == null ? -1e9 : x.s.giorni) - (y.s.giorni == null ? -1e9 : y.s.giorni));

  const scaduti = righe.filter(r => r.s.stato === 'scaduto' || r.s.stato === 'mai').length;
  const vicini  = righe.filter(r => r.s.stato === 'vicino').length;

  // Stato sintetico dei registri: non è il dettaglio, è "c'è qualcosa di aperto?"
  const rischiAperti = RISCHI.filter(r => r.stato === 'aperto' || r.stato === 'nuovo').length;
  const ncAperte = NON_CONFORMITA.filter(n => n.stato !== 'chiusa').length;
  const incAperti = INCIDENTI.filter(i => i.stato !== 'chiuso').length;
  const formScaduta = FORMAZIONE.filter(f => !f.completatoIl || cfGiorniA(cfMesi(f.completatoIl, f.validitaMesi)) < 0).length;
  const fornSenzaRiesame = FORNITORI.filter(f => !f.ultimoRiesame).length;

  const sintesi = [
    { n:rischiAperti,      label:'rischi da trattare',        tab:'rischi',    tono: rischiAperti ? 'WARN' : 'OK' },
    { n:ncAperte,          label:'non conformità aperte',      tab:'nc',        tono: ncAperte ? 'WARN' : 'OK' },
    { n:incAperti,         label:'incidenti aperti',           tab:'incidenti', tono: incAperti ? 'WARN' : 'OK' },
    { n:fornSenzaRiesame,  label:'fornitori mai riesaminati',  tab:'fornitori', tono: fornSenzaRiesame ? 'DANGER' : 'OK' },
    { n:formScaduta,       label:'formazioni scadute o mancanti', tab:'registri', tono: formScaduta ? 'WARN' : 'OK' },
  ];

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20}}>
      <div style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10,
        background: scaduti ? ADM.DANGER_SOFT : vicini ? '#FFF7E6' : ADM.OK_SOFT,
        border:`1px solid ${scaduti ? '#FECACA' : vicini ? '#FDE68A' : '#BBF7D0'}`}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14.5, fontWeight:800, color: scaduti ? '#7F1D1D' : vicini ? '#78350F' : '#065F46'}}>
            {scaduti
              ? `${scaduti} ${scaduti === 1 ? 'adempimento scaduto' : 'adempimenti scaduti'}`
              : vicini
                ? `${vicini} ${vicini === 1 ? 'adempimento in scadenza' : 'adempimenti in scadenza'}`
                : 'Tutti gli adempimenti in regola'}
          </div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
            {righe.length} obblighi ricorrenti fra ISO 27001 e ISO 9001 · la scadenza si calcola dall'ultima esecuzione più la cadenza
          </div>
        </div>
      </div>

      <div>
        <div style={CF_H}>Adempimenti ricorrenti</div>
        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:'minmax(0,2.4fr) 1fr 1fr 1fr 1.3fr 1.3fr 34px', gap:10}}>
            <div>Adempimento</div><div>Norma</div><div>Cadenza</div><div>Ultima</div><div>Prossima</div><div>Responsabile</div><div/>
          </div>
          {righe.map(({ a, s }, i) => (
            <div key={a.id} className="adm-row-open" onClick={()=>onNav && onNav(a.vaiA)}
              style={{display:'grid', gridTemplateColumns:'minmax(0,2.4fr) 1fr 1fr 1fr 1.3fr 1.3fr 34px', gap:10,
                alignItems:'center', padding:'12px 16px', cursor:'pointer',
                borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                background: s.stato === 'scaduto' || s.stato === 'mai' ? '#FFFBFB' : '#fff'}}>
              <div>
                <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{a.nome}</div>
                <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2}}>{a.rif}</div>
              </div>
              <div><CfNorma norme={a.norme}/></div>
              <div style={{fontSize:12.6, color:ADM.MUTED}}>ogni {a.cadenzaMesi} mesi</div>
              <div style={{fontSize:12.6, color:ADM.TEXT}}>{cfFmt(a.ultima)}</div>
              <div><CfPill tono={s.tono}>{s.label}</CfPill></div>
              <div style={{fontSize:12.6, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.responsabile}</div>
              <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={CF_H}>Stato dei registri</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:10}}>
          {sintesi.map(s => (
            <div key={s.label} className="adm-card-interactive" onClick={()=>onNav && onNav({ route:'conformita', tab:s.tab })}
              style={{...CF_CARD, padding:'14px 16px', cursor:'pointer'}}>
              <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1,
                color: s.n ? CF_TONO(s.tono) : ADM.TEXT}}>{s.n}</div>
              <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:6, lineHeight:1.35}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.6, padding:'12px 14px',
        background:ADM.NEUTRAL_SOFT, borderRadius:10}}>
        Qui stanno solo i registri la cui evidenza nasce dall'operatività. Politiche, procedure,
        Dichiarazione di Applicabilità e metodologia di valutazione del rischio sono <strong>documenti</strong>:
        vivono nel gestore documentale e i registri li richiamano, non li duplicano.
      </div>
    </div>
  );
}

// ─── Guscio ────────────────────────────────────────────────────────────────
function AdmConformitaPage({ initialTab, onNavRoute }) {
  const [tab, setTab] = useStateConf(initialTab || 'cruscotto');
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  const vai = (dest) => {
    if (!dest) return;
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

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      <AdmCard padding={0}>
        <div style={{padding:'0 22px 0 8px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:12}}>
          <AdmTabBar tabs={[
            { id:'cruscotto', label:'Cruscotto' },
            { id:'rischi',    label:'Rischi' },
            { id:'fornitori', label:'Fornitori' },
            { id:'incidenti', label:'Incidenti' },
            { id:'nc',        label:'Non conformità' },
            { id:'audit',     label:'Audit e riesami' },
            { id:'registri',  label:'Registri' },
          ]} active={tab} onChange={setTab}/>
        </div>

        {tab === 'cruscotto' && <CfCruscotto onNav={vai}/>}
        {tab === 'rischi'    && (window.CfRischi        ? <CfRischi/>        : manca('Rischi'))}
        {tab === 'fornitori' && (window.CfFornitori     ? <CfFornitori/>     : manca('Fornitori'))}
        {tab === 'incidenti' && (window.CfIncidenti     ? <CfIncidenti/>     : manca('Incidenti'))}
        {tab === 'nc'        && (window.CfNonConformita ? <CfNonConformita/> : manca('Non conformità'))}
        {/* onVai accende i collegamenti del pacchetto di input verso i registri:
            senza, il riesame di direzione elenca i numeri ma non ci porta. */}
        {tab === 'audit'     && (window.CfAudit         ? <CfAudit onVai={setTab}/> : manca('Audit e riesami'))}
        {tab === 'registri'  && (window.CfRegistri      ? <CfRegistri/>      : manca('Registri'))}
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
window.CF_TH = CF_TH;
window.AdmConformitaPage = AdmConformitaPage;

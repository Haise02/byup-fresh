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
const CF_GRID_AD = 'minmax(0,2.6fr) 0.9fr 0.85fr 1fr 1.25fr 1.15fr 150px';
const CF_INP = { width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8,
  fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box' };
const CF_LAB = { fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.05em', display:'block', marginBottom:5 };
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
  const [modifica, setModifica] = useStateConf(null);   // adempimento in modifica
  const [bozza, setBozza] = useStateConf(null);
  const [, forzaCf] = useStateConf(0);

  // I non applicabili scendono in fondo: restano a vista come evidenza, ma non
  // devono competere con le scadenze vere per l'attenzione.
  const righe = ADEMPIMENTI
    .map(a => ({ a, s: cfStatoAdempimento(a) }))
    .sort((x, y) => {
      if ((x.s.stato === 'na') !== (y.s.stato === 'na')) return x.s.stato === 'na' ? 1 : -1;
      return (x.s.giorni == null ? -1e9 : x.s.giorni) - (y.s.giorni == null ? -1e9 : y.s.giorni);
    });

  const attivi  = righe.filter(r => r.s.stato !== 'na');
  const scaduti = attivi.filter(r => r.s.stato === 'scaduto' || r.s.stato === 'mai').length;
  const vicini  = attivi.filter(r => r.s.stato === 'vicino').length;

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

  // Stato sintetico dei registri: non è il dettaglio, è "c'è qualcosa di aperto?"
  const rischiAperti = RISCHI.filter(r => r.stato === 'aperto' || r.stato === 'nuovo').length;
  const ncAperte = NON_CONFORMITA.filter(n => n.stato !== 'chiusa').length;
  const incAperti = INCIDENTI.filter(i => i.stato !== 'chiuso').length;
  const formScaduta = FORMAZIONE.filter(f => !f.completatoIl || cfGiorniA(cfMesi(f.completatoIl, f.validitaMesi)) < 0).length;
  const fornSenzaRiesame = FORNITORI.filter(f => !f.ultimoRiesame).length;

  const sintesi = [
    { n:rischiAperti,      uno:'rischio da trattare',         label:'rischi da trattare',        tab:'rischi',    tono: rischiAperti ? 'WARN' : 'OK' },
    { n:ncAperte,          uno:'non conformità aperta',       label:'non conformità aperte',      tab:'nc',        tono: ncAperte ? 'WARN' : 'OK' },
    { n:incAperti,         uno:'incidente aperto',            label:'incidenti aperti',           tab:'incidenti', tono: incAperti ? 'WARN' : 'OK' },
    { n:fornSenzaRiesame,  uno:'fornitore mai riesaminato',   label:'fornitori mai riesaminati',  tab:'fornitori', tono: fornSenzaRiesame ? 'DANGER' : 'OK' },
    { n:formScaduta,       uno:'formazione scaduta o mancante', label:'formazioni scadute o mancanti', tab:'registri', tono: formScaduta ? 'WARN' : 'OK' },
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
            {attivi.length} obblighi applicabili fra ISO 27001 e ISO 9001
            {righe.length - attivi.length > 0 && (righe.length - attivi.length === 1
              ? ', 1 dichiarato non applicabile'
              : `, ${righe.length - attivi.length} dichiarati non applicabili`)}
            {' · '}la scadenza si calcola dalla cadenza, tranne le verifiche dell'ente che hanno una data imposta
          </div>
        </div>
      </div>

      <div>
        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:CF_GRID_AD, gap:10}}>
            <div>Adempimento</div><div>Norma</div><div>Ogni</div><div>Ultima</div><div>Prossima</div><div>Responsabile</div><div/>
          </div>
          {righe.map(({ a, s }, i) => {
            const na = s.stato === 'na';
            return (
              <div key={a.id}
                style={{display:'grid', gridTemplateColumns:CF_GRID_AD, gap:10,
                  alignItems:'center', padding:'12px 16px',
                  borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                  background: na ? '#FCFCFD' : (s.stato === 'scaduto' || s.stato === 'mai') ? '#FFFBFB' : '#fff',
                  opacity: na ? 0.72 : 1}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{a.nome}</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2}}>{a.rif}</div>
                  {na && <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:4, lineHeight:1.4}}>{a.nonApplicabile}</div>}
                  {!na && a.nota && <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:4, lineHeight:1.4}}>{a.nota}</div>}
                </div>
                <div><CfNorma norme={a.norme}/></div>
                <div style={{fontSize:12.6, color:ADM.MUTED}}>
                  {na ? '—' : s.imposta
                    ? <span style={{color:ADM.TEXT, fontWeight:700}}>data imposta</span>
                    : `${a.cadenzaMesi} mesi`}
                </div>
                <div style={{fontSize:12.6, color:ADM.TEXT}}>{cfFmt(a.ultima)}</div>
                <div>
                  {na ? <CfPill tono="NEUTRAL">Non applicabile</CfPill> : (
                    <React.Fragment>
                      <CfPill tono={s.tono}>{s.label}</CfPill>
                      {s.prossima && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:3}}>{cfFmt(s.prossima)}</div>}
                    </React.Fragment>
                  )}
                </div>
                <div style={{fontSize:12.6, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.responsabile}</div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:4}}>
                  <AdmButton variant="ghost" size="sm" onClick={()=>apriModifica(a)} style={{fontSize:12}}>Modifica</AdmButton>
                  {a.vaiA && !na && (
                    <AdmButton variant="ghost" size="sm" onClick={()=>onNav && onNav(a.vaiA)} style={{fontSize:12}}>Apri</AdmButton>
                  )}
                </div>
              </div>
            );
          })}
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
              <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:6, lineHeight:1.35}}>{s.n === 1 ? s.uno : s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.6, padding:'12px 14px',
        background:ADM.NEUTRAL_SOFT, borderRadius:10}}>
        La cadenza la scegli tu: le norme chiedono «a intervalli pianificati», non ogni quanto.
        Ma una volta scritta ti vincola — meglio una cadenza sostenibile e rispettata che una
        ambiziosa e mancata. Fanno eccezione le verifiche dell'ente, la cui data non decidi.
      </div>

      {/* Modifica: cambia forma secondo la natura dell'adempimento */}
      {modifica && bozza && (
        <div onClick={()=>{setModifica(null); setBozza(null);}} style={{position:'absolute', inset:0, zIndex:60,
          background:'rgba(15,17,21,0.42)', display:'flex', alignItems:'flex-start', justifyContent:'center',
          backdropFilter:'blur(3px)', overflowY:'auto', padding:'60px 0'}}>
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

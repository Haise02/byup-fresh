// Certificazioni — queue moderna con viewer + approva/rifiuta

const { useState: useStateCert } = React;

// Icone/colori per tipologia certificazione
const CERT_THEMES = {
  aic:        { color:'OK',     glyph:'GF' },
  halal:      { color:'INFO',   glyph:'H'  },
  kosher:     { color:'PURPLE', glyph:'K'  },
  vegan_eve:  { color:'OK',     glyph:'V'  },
  vegetarian: { color:'OK',     glyph:'Ve' },
  bio:        { color:'OK',     glyph:'B'  },
  km0:        { color:'WARN',   glyph:'K0' },
  dop_igp:    { color:'PINK',   glyph:'D'  },
  lactose:    { color:'INFO',   glyph:'L'  },
};

function AdmCertificazioniPage({ search }) {
  const [tab, setTab] = useStateCert('pending');
  const [selectedId, setSelectedId] = useStateCert(null);
  const [decision, setDecision] = useStateCert(null);
  const [motivo, setMotivo] = useStateCert('');
  const [tipoFilter, setTipoFilter] = useStateCert('all');

  const filtered = CERTIFICAZIONI.filter(c => {
    if (tab === 'pending' && c.stato !== 'pending')       return false;
    if (tab === 'approvata' && c.stato !== 'approvata')   return false;
    if (tab === 'rifiutata' && c.stato !== 'rifiutata')   return false;
    if (tipoFilter !== 'all' && c.tipo !== tipoFilter)    return false;
    return true;
  }).sort((a,b) => b.dataInvio - a.dataInvio);

  const sel = filtered.find(c => c.id === selectedId) || filtered[0];

  // KPI header
  const pendingCount = CERTIFICAZIONI.filter(c => c.stato === 'pending').length;
  const approvedCount = CERTIFICAZIONI.filter(c => c.stato === 'approvata').length;
  const rejectedCount = CERTIFICAZIONI.filter(c => c.stato === 'rifiutata').length;
  const oldestPending = CERTIFICAZIONI.filter(c => c.stato === 'pending').reduce((o, c) => !o || c.dataInvio < o.dataInvio ? c : o, null);
  const oldestH = oldestPending ? Math.floor((Date.now() - oldestPending.dataInvio.getTime()) / 3600000) : 0;

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
      {/* Master strip */}
      <div style={{background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, padding:'12px 28px 0', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', gap:24, marginBottom:8, flexWrap:'wrap'}}>
          <CertKpi icon="shield"        color="WARN"   label="In revisione"        value={pendingCount}/>
          <CertKpi icon="check"         color="OK"     label="Approvate"           value={approvedCount}/>
          <CertKpi icon="x"             color="DANGER" label="Rifiutate"           value={rejectedCount}/>
          <CertKpi icon="clock"         color="INFO"   label="Più vecchia in attesa" value={`${oldestH}h`}/>
        </div>
        <AdmTabBar tabs={[
          { id:'pending',   label:'In attesa',  badge: pendingCount },
          { id:'approvata', label:'Approvate',  badge: approvedCount },
          { id:'rifiutata', label:'Rifiutate',  badge: rejectedCount },
        ]} active={tab} onChange={(t)=>{ setTab(t); setSelectedId(null); setDecision(null); }}/>
      </div>

      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {/* List */}
        <div style={{width:360, flexShrink:0, background:'#fff', borderRight:`1px solid ${ADM.BORDER}`, display:'flex', flexDirection:'column'}}>
          <div style={{padding:'12px 16px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:8}}>
            <FilterDropdown label="" value={tipoFilter} onChange={setTipoFilter} options={[
              {value:'all', label:'Tutte le certificazioni'},
              ...Object.entries(CERT_TIPI).map(([k,v]) => ({value:k, label:v.label})),
            ]}/>
            <div style={{flex:1}}/>
            <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>{filtered.length}</span>
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {filtered.length === 0 && <AdmEmpty title="Nessun documento" desc="In questo stato"/>}
            {filtered.map(c => <CertListCard key={c.id} cert={c} active={sel?.id === c.id} onClick={()=>{ setSelectedId(c.id); setDecision(null); setMotivo(''); }}/>)}
          </div>
        </div>

        {sel ? <CertDetail cert={sel} decision={decision} setDecision={setDecision} motivo={motivo} setMotivo={setMotivo}/>
             : <div style={{flex:1, display:'grid', placeItems:'center'}}><AdmEmpty title="Seleziona un documento" desc="Per visualizzarlo e revisionarlo"/></div>}
      </div>
    </div>
  );
}

function CertKpi({ icon, color, label, value }) {
  const Icon = BuIcons[icon];
  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:10}}>
      <div style={{width:30, height:30, borderRadius:8, background:ADM[color+'_SOFT'], color:ADM[color], display:'grid', placeItems:'center'}}>
        <Icon size={14}/>
      </div>
      <div>
        <div style={{fontSize:12.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', lineHeight:1}}>{label}</div>
        <div style={{fontSize:19, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.2, marginTop:3}}>{value}</div>
      </div>
    </div>
  );
}

function CertListCard({ cert: c, active, onClick }) {
  const loc = LOCALI.find(l => l.id === c.localeId);
  const tipo = CERT_TIPI[c.tipo];
  const theme = CERT_THEMES[c.tipo] || { color:'PLAN_FREE', glyph:'?' };
  const ageH = (Date.now() - c.dataInvio.getTime()) / 3600000;
  const aging = c.stato === 'pending' && ageH > 48;
  const [hover, setHover] = React.useState(false);

  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        padding:'14px 16px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: active ? ADM.PINK_BG_SOFT : (hover ? '#FAFBFC' : 'transparent'),
        cursor:'pointer', position:'relative',
        transition:'background 0.1s',
      }}>
      {/* Left rail for aging */}
      <div style={{position:'absolute', left:0, top:8, bottom:8, width:3, borderRadius:'0 2px 2px 0', background: active ? ADM.PINK : (aging ? ADM.WARN : 'transparent')}}/>

      <div style={{display:'flex', alignItems:'center', gap:11}}>
        {/* Type glyph */}
        <div style={{
          width:38, height:38, borderRadius:9,
          background: ADM[theme.color+'_SOFT'], color: ADM[theme.color],
          display:'grid', placeItems:'center', flexShrink:0,
          fontSize:15, fontWeight:800, letterSpacing:'-0.01em',
        }}>{theme.glyph}</div>

        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
            <span style={{fontSize:15, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{tipo.label}</span>
            {aging && <span style={{fontSize:11, fontWeight:700, color:ADM.WARN, padding:'1px 5px', background:ADM.WARN_SOFT, borderRadius:3, textTransform:'uppercase', letterSpacing:'0.04em'}}>SLA</span>}
          </div>
          <div style={{fontSize:13.5, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{loc?.nome} · {loc?.citta}</div>
          <div style={{display:'flex', alignItems:'center', gap:7, marginTop:6}}>
            {c.stato === 'pending' && <span style={{fontSize:12, fontWeight:700, color:ADM.WARN, padding:'2px 7px', borderRadius:4, background:ADM.WARN_SOFT}}>In revisione</span>}
            {c.stato === 'approvata' && <span style={{fontSize:12, fontWeight:700, color:ADM.OK, padding:'2px 7px', borderRadius:4, background:ADM.OK_SOFT}}>Approvata</span>}
            {c.stato === 'rifiutata' && <span style={{fontSize:12, fontWeight:700, color:ADM.DANGER, padding:'2px 7px', borderRadius:4, background:ADM.DANGER_SOFT}}>Rifiutata</span>}
            <span style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>· {fmtRelative(c.dataInvio)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertDetail({ cert: c, decision, setDecision, motivo, setMotivo }) {
  const loc = LOCALI.find(l => l.id === c.localeId);
  const tipo = CERT_TIPI[c.tipo];
  const theme = CERT_THEMES[c.tipo] || { color:'PLAN_FREE', glyph:'?' };

  return (
    <div style={{flex:1, display:'flex', overflow:'hidden'}}>
      {/* Document viewer */}
      <div style={{flex:1, background:'#EFEFF1', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{padding:'12px 18px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:24, height:24, borderRadius:5, background:'#DC2626', color:'#fff', display:'grid', placeItems:'center', fontSize:11, fontWeight:800, letterSpacing:'0.04em'}}>PDF</div>
          <div style={{fontSize:14.5, fontWeight:700, color:ADM.TEXT}}>{c.file}</div>
          <span style={{fontSize:13, color:ADM.MUTED}}>· {c.size}</span>
          <div style={{flex:1}}/>
          <AdmIconBtn icon="search" label="Zoom"/>
          <AdmButton variant="secondary" size="sm" icon="download">Scarica</AdmButton>
          <AdmButton variant="ghost" size="sm" icon="eye">Apri</AdmButton>
        </div>
        <div style={{flex:1, overflow:'auto', padding:'28px', display:'flex', justifyContent:'center'}}>
          <div style={{
            width:580, minHeight:760, background:'#fff',
            boxShadow:'0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)',
            padding:'56px 64px',
            fontFamily:'Times, serif',
            color:'#333',
            position:'relative',
          }}>
            <div style={{position:'absolute', top:24, right:24, padding:'4px 9px', background:'#F3F4F6', color:'#6B7280', fontSize:11, fontWeight:700, letterSpacing:'0.05em', borderRadius:4, textTransform:'uppercase', fontFamily:'system-ui'}}>Anteprima</div>

            <div style={{textAlign:'center', borderBottom:'2px solid #999', paddingBottom:18, marginBottom:26}}>
              <div style={{fontSize:13, color:'#666', letterSpacing:'0.18em', textTransform:'uppercase'}}>{tipo.ente}</div>
              <div style={{fontSize:22, fontWeight:700, marginTop:10, letterSpacing:'-0.01em'}}>{tipo.label}</div>
              <div style={{fontSize:13, color:'#666', marginTop:6, fontStyle:'italic'}}>{tipo.desc}</div>
              <div style={{fontSize:12, color:'#888', marginTop:8, fontFamily:'monospace'}}>Documento n° {c.id} / 2025</div>
            </div>
            <div style={{fontSize:14, lineHeight:1.8}}>
              <p><strong>Intestatario:</strong> {loc?.nome}</p>
              <p><strong>P. IVA:</strong> {loc?.piva}</p>
              <p><strong>Indirizzo:</strong> {loc?.indirizzo}, {loc?.citta}</p>
              <p style={{marginTop:26}}>Il presente documento attesta la conformità dell'attività ai requisiti previsti per la certificazione <strong>{tipo.label}</strong>.</p>
              {c.scadenzaCert && <p style={{marginTop:16}}>Validità: fino al <strong>{fmtDate(c.scadenzaCert)}</strong></p>}
              <div style={{marginTop:56, display:'flex', justifyContent:'space-between'}}>
                <div>
                  <div style={{borderTop:'1px solid #666', paddingTop:6, width:180, fontSize:12, color:'#666'}}>Data di emissione</div>
                  <div style={{marginTop:5, fontSize:13}}>{fmtDate(c.dataInvio)}</div>
                </div>
                <div>
                  <div style={{borderTop:'1px solid #666', paddingTop:6, width:180, fontSize:12, color:'#666'}}>Firma ente certificatore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side review panel */}
      <div style={{width:380, background:'#fff', borderLeft:`1px solid ${ADM.BORDER}`, overflow:'auto', display:'flex', flexDirection:'column'}}>
        {/* Header */}
        <div style={{padding:'22px 22px 18px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'flex-start', gap:13}}>
          <div style={{
            width:44, height:44, borderRadius:10,
            background: ADM[theme.color+'_SOFT'], color: ADM[theme.color],
            display:'grid', placeItems:'center', flexShrink:0,
            fontSize:17, fontWeight:800,
          }}>{theme.glyph}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em'}}>{tipo.ente}</div>
            <div style={{fontSize:18, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em', marginTop:2, lineHeight:1.25}}>{tipo.label}</div>
          </div>
        </div>

        {/* Locale info */}
        <div style={{padding:'16px 22px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, background:ADM.PANEL_SOFT}}>
          <div style={{fontSize:12.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5}}>Locale richiedente</div>
          <div style={{fontSize:16, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em'}}>{loc?.nome}</div>
          <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:2}}>{loc?.tipo} · {loc?.citta} ({loc?.regione})</div>
          <div style={{fontSize:13, color:ADM.MUTED_SOFT, marginTop:5, fontFamily:'ui-monospace,monospace'}}>P.IVA {loc?.piva}</div>
        </div>

        {/* Doc data */}
        <div style={{padding:'16px 22px', flex:1}}>
          <DataRow label="ID Documento" value={c.id} mono/>
          <DataRow label="Inviato" value={fmtDateTime(c.dataInvio)}/>
          {c.scadenzaCert && <DataRow label="Scadenza" value={fmtDate(c.scadenzaCert)}/>}
          <DataRow label="Stato" value={
            c.stato === 'pending' ? 'In attesa di revisione' :
            c.stato === 'approvata' ? `Approvata da ${TEAM.find(t=>t.id===c.revisedBy)?.nome}` :
            `Rifiutata da ${TEAM.find(t=>t.id===c.revisedBy)?.nome}`
          } last/>

          {c.stato === 'rifiutata' && (
            <div style={{marginTop:16, padding:'12px 14px', background:ADM.DANGER_SOFT, border:`1px solid #FECACA`, borderRadius:8}}>
              <div style={{fontSize:13, fontWeight:700, color:ADM.DANGER, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5, display:'flex', alignItems:'center', gap:5}}>
                <BuIcons.x size={11}/> Motivo del rifiuto
              </div>
              <div style={{fontSize:14.5, color:'#7F1D1D', lineHeight:1.5}}>{c.motivo}</div>
            </div>
          )}
        </div>

        {/* Decision panel */}
        {c.stato === 'pending' && (
          <div style={{padding:'18px 22px', background:ADM.PANEL_SOFT, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
            {!decision && (
              <>
                <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12}}>Revisione documento</div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  <button onClick={()=>setDecision('approva')} style={{
                    padding:'13px 14px', background:`linear-gradient(135deg, ${ADM.OK}, #15803D)`,
                    color:'#fff', border:'none', borderRadius:9,
                    fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    boxShadow:`0 4px 14px -4px ${ADM.OK}80`,
                    letterSpacing:'-0.005em',
                    transition:'transform 0.1s',
                  }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
                    <BuIcons.check size={15}/> Approva
                  </button>
                  <button onClick={()=>setDecision('rifiuta')} style={{
                    padding:'12px 14px', background:'#fff', color:ADM.DANGER,
                    border:`1.5px solid ${ADM.DANGER}`, borderRadius:9, fontSize:15, fontWeight:700,
                    cursor:'pointer', fontFamily:'inherit',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    letterSpacing:'-0.005em',
                  }}>
                    <BuIcons.x size={15}/> Rifiuta
                  </button>
                  <button style={{
                    padding:'10px 14px', background:'transparent', color:ADM.MUTED,
                    border:'none', borderRadius:8, fontSize:14, fontWeight:600,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>
                    Richiedi maggiori informazioni
                  </button>
                </div>
              </>
            )}

            {decision === 'approva' && (
              <>
                <div style={{fontSize:15, fontWeight:700, color:ADM.OK, marginBottom:6, display:'flex', alignItems:'center', gap:7}}>
                  <BuIcons.check size={15}/> Confermare approvazione?
                </div>
                <div style={{fontSize:13.5, color:ADM.MUTED, marginBottom:12, lineHeight:1.5}}>Il documento verrà marcato come valido e il locale riceverà una notifica.</div>
                <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Nota interna (opzionale)" style={{
                  width:'100%', minHeight:60, padding:'10px 12px',
                  border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:14.5, fontFamily:'inherit', resize:'vertical', outline:'none',
                  marginBottom:10, boxSizing:'border-box',
                }}/>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={()=>setDecision(null)} style={{flex:1, padding:'9px 12px', background:'#fff', color:ADM.MUTED, border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
                  <button style={{flex:1, padding:'9px 12px', background:`linear-gradient(135deg, ${ADM.OK}, #15803D)`, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow:`0 4px 12px -4px ${ADM.OK}80`}}>
                    <BuIcons.check size={13}/> Conferma
                  </button>
                </div>
              </>
            )}

            {decision === 'rifiuta' && (
              <>
                <div style={{fontSize:15, fontWeight:700, color:ADM.DANGER, marginBottom:6, display:'flex', alignItems:'center', gap:7}}>
                  <BuIcons.x size={15}/> Motivo del rifiuto
                </div>
                <div style={{fontSize:13.5, color:ADM.MUTED, marginBottom:10, lineHeight:1.5}}>Sarà inviato al locale. Sii specifico così sa cosa correggere.</div>
                <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Es. Documento illeggibile, ricaricare a 300 DPI…" style={{
                  width:'100%', minHeight:90, padding:'10px 12px',
                  border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:14.5, fontFamily:'inherit', resize:'vertical', outline:'none',
                  marginBottom:10, boxSizing:'border-box',
                }}/>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12.5, color:ADM.MUTED, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em'}}>Motivi rapidi</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                    {['Documento illeggibile','Scaduto','Dati non corrispondenti','Tipo sbagliato','Firma mancante','Ente non riconosciuto'].map(t => (
                      <button key={t} onClick={()=>setMotivo(motivo ? motivo+' · '+t : t)} style={{
                        padding:'5px 10px', background:'#fff', border:`1px solid ${ADM.BORDER}`,
                        borderRadius:99, fontSize:13, cursor:'pointer', fontFamily:'inherit', color:ADM.TEXT,
                      }}>+ {t}</button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={()=>setDecision(null)} style={{flex:1, padding:'9px 12px', background:'#fff', color:ADM.MUTED, border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
                  <button disabled={!motivo.trim()} style={{
                    flex:1, padding:'9px 12px',
                    background: motivo.trim() ? ADM.DANGER : '#E5E7EB',
                    color:'#fff', border:'none', borderRadius:8,
                    fontSize:14, fontWeight:700,
                    cursor: motivo.trim() ? 'pointer' : 'not-allowed',
                    fontFamily:'inherit',
                    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                    boxShadow: motivo.trim() ? `0 4px 12px -4px ${ADM.DANGER}80` : 'none',
                  }}>
                    <BuIcons.send size={12}/> Rifiuta
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

window.AdmCertificazioniPage = AdmCertificazioniPage;

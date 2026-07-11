// Drawer dettaglio locale: anagrafica, funnel, attività, fatturazione

const { useState: useStateDrw } = React;

function LocaleDrawer({ locale: l, onClose }) {
  const [tab, setTab] = useStateDrw('panoramica');

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', justifyContent:'flex-end',
      background:'rgba(15,17,21,0.45)',
      animation:'fadeIn 0.15s ease',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width: 820, maxWidth:'95%',
        background:'#fff',
        height:'100%',
        display:'flex', flexDirection:'column',
        boxShadow:'-12px 0 32px rgba(0,0,0,0.12)',
        animation:'slideIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{padding:'20px 24px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:14}}>
          <div style={{
            width:48, height:48, borderRadius:10,
            background: `hsl(${(l.id.charCodeAt(1)+l.id.charCodeAt(3))*3 % 360}, 35%, 55%)`,
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:700, fontSize:23, flexShrink:0,
          }}>{l.nome.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
              <div style={{fontSize:25, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{l.nome}</div>
              <AdmPlanBadge piano={l.piano}/>
              <AdmStatoBadge stato={l.stato}/>
            </div>
            <div style={{fontSize:19, color:ADM.MUTED, display:'flex', gap:10}}>
              <span style={{fontFamily:'ui-monospace,monospace'}}>{l.id}</span>
              <span style={{color:ADM.MUTED_LIGHT}}>·</span>
              <span>{l.tipo}, {l.citta}</span>
              <span style={{color:ADM.MUTED_LIGHT}}>·</span>
              <span>Iscritto {fmtDate(l.dataIscrizione)}</span>
            </div>
          </div>
          <AdmButton variant="secondary" icon="eye" size="sm">Visualizza come</AdmButton>
          <AdmIconBtn icon="x" onClick={onClose} label="Chiudi"/>
        </div>

        <AdmTabBar tabs={[
          { id:'panoramica', label:'Panoramica' },
          { id:'anagrafica', label:'Anagrafica & Fiscali' },
          { id:'attivita', label:'Attività' },
          { id:'fatturazione', label:'Fatturazione & Piano' },
        ]} active={tab} onChange={setTab}/>

        <div style={{flex:1, overflow:'auto', background: ADM.PANEL_SOFT}}>
          {tab==='panoramica' && <DrwPanoramica locale={l}/>}
          {tab==='anagrafica' && <DrwAnagrafica locale={l}/>}
          {tab==='attivita' && <DrwAttivita locale={l}/>}
          {tab==='fatturazione' && <DrwFatturazione locale={l}/>}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
}

function DrwPanoramica({ locale: l }) {
  const stoppedStep = l.stoppedAt ? ONB_STEPS.find(s => s.id === l.stoppedAt) : null;
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:16}}>
      {/* Alert se bloccato */}
      {l.stato === 'onboarding' && stoppedStep && (
        <div style={{padding:'14px 16px', background: ADM.WARN_SOFT, border:`1px solid #FCD34D`, borderRadius:10, display:'flex', gap:12, alignItems:'flex-start'}}>
          <div style={{color: ADM.WARN, marginTop:1}}><BuIcons.pause size={23}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:20, fontWeight:700, color:ADM.TEXT}}>Fermo da {fmtRelative(l.lastLogin)} su "{stoppedStep.label}"</div>
            <div style={{fontSize:19, color:'#92400E', marginTop:3}}>Considera di inviare un reminder o assistenza dedicata per sbloccarlo.</div>
          </div>
          <AdmButton variant="secondary" size="sm" icon="mail">Invia reminder</AdmButton>
        </div>
      )}
      {l.stato === 'skipped' && (
        <div style={{padding:'14px 16px', background: ADM.INFO_SOFT, border:`1px solid #BFDBFE`, borderRadius:10, display:'flex', gap:12, alignItems:'flex-start'}}>
          <div style={{color: ADM.INFO, marginTop:1}}><BuIcons.info size={23}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:20, fontWeight:700, color:ADM.TEXT}}>Onboarding saltato</div>
            <div style={{fontSize:19, color:'#1E40AF', marginTop:3}}>Il locale è andato direttamente in Panoramica senza completare il setup guidato.</div>
          </div>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
        <MiniStat label="Ordini/giorno" value={l.ordiniGiorno} sub={`${fmtNum(l.ordiniMese)}/mese`}/>
        <MiniStat label="Prenotaz./giorno" value={l.prenotazioniGiorno} sub={`${l.copertura}% copertura`}/>
        <MiniStat label="Scontrino medio" value={fmtEur(l.ticketMedio)} sub="per ordine"/>
        <MiniStat label="Ultimo login" value={fmtRelative(l.lastLogin)} sub={fmtDate(l.lastLogin)}/>
      </div>

      <AdmCard padding={18}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:12}}>Andamento ordini · 14 giorni</div>
        <AdmBarChart data={[12,18,14,22,28,32,24,30,38,42,36,44,48,52].map(x=>x*(l.ordiniGiorno/30))} labels={Array(14).fill('')} color={ADM.PINK} height={140}/>
      </AdmCard>

      <DrwAdozioneDigitale locale={l}/>

      <DrwScanOrdini locale={l}/>

      <DrwFunnelCompact locale={l}/>
    </div>
  );
}

function MiniStat({ label, value, sub }) {
  return (
    <AdmCard padding={14}>
      <div style={{fontSize:17.5, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em'}}>{label}</div>
      <div style={{fontSize:27, fontWeight:700, color:ADM.TEXT, marginTop:4, letterSpacing:'-0.01em'}}>{value}</div>
      {sub && <div style={{fontSize:18, color:ADM.MUTED, marginTop:2}}>{sub}</div>}
    </AdmCard>
  );
}

function DrwAdozioneDigitale({ locale: l }) {
  const qr = l.qrAdoption;
  const band = bandOf(qr);
  const stato = l.stato;

  // Caso: non rilevante (pending / onboarding / churned)
  if (qr == null) {
    return (
      <AdmCard padding={18}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>Adozione digitale</div>
        <div style={{fontSize:19, color:ADM.MUTED, lineHeight:1.5}}>
          {stato === 'pending' || stato === 'onboarding'
            ? 'Il locale non ha ancora completato l\'onboarding: il tasso QR sarà disponibile dal Go-live.'
            : 'Locale non più operativo: tasso QR non rilevato.'}
        </div>
      </AdmCard>
    );
  }

  // Posizione sulla scala 0-50%+ (clamp visivo a 50% per tenere proporzioni leggibili)
  const scaleMax = 50;
  const markerPct = Math.min(100, (qr / scaleMax) * 100);

  return (
    <AdmCard padding={18}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:12}}>
        <div>
          <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT}}>Adozione digitale</div>
          <div style={{fontSize:18.5, color:ADM.MUTED, marginTop:2}}>% di ordini/coperti che passano dal QR byup · ultimi 30 giorni</div>
        </div>
        <span style={{
          padding:'4px 10px', borderRadius:99,
          background: band.color, color: band.textOn,
          fontSize:18, fontWeight:800, whiteSpace:'nowrap',
          textTransform:'uppercase', letterSpacing:'0.04em',
        }}>{band.label}</span>
      </div>

      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:12}}>
        <div style={{fontSize:41, fontWeight:800, color: band.color, letterSpacing:'-0.02em', lineHeight:1}}>
          {qr === 0 ? '0%' : `${qr.toFixed(1)}%`}
        </div>
        <div style={{fontSize:19, color:ADM.MUTED, lineHeight:1.4}}>fascia <strong style={{color:ADM.TEXT}}>{band.range}</strong></div>
      </div>

      {/* Scala segmentata con marker */}
      <div style={{position:'relative', marginBottom:6}}>
        <div style={{display:'flex', height:10, borderRadius:5, overflow:'hidden', background:'#F0F1F3'}}>
          {ADOPTION_BANDS.map((b, i) => {
            // Larghezza proporzionale al range effettivo, ma 0% è puntuale → tiny segment
            const widths = [4, 10, 20, 30, 36]; // somma = 100
            return (
              <div key={b.id} style={{
                width:`${widths[i]}%`, height:'100%',
                background: b.color, opacity: b.id === band.id ? 1 : 0.28,
                borderRight: i < ADOPTION_BANDS.length - 1 ? '1px solid #fff' : 'none',
              }}/>
            );
          })}
        </div>
        {/* Marker triangle */}
        <div style={{
          position:'absolute', top:-4, left:`calc(${markerPct}% - 6px)`,
          width:0, height:0,
          borderLeft:'6px solid transparent', borderRight:'6px solid transparent',
          borderTop:`7px solid ${ADM.TEXT}`,
        }}/>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:17, color:ADM.MUTED_SOFT, fontFamily:'ui-monospace, monospace'}}>
        <span>0%</span><span>5%</span><span>15%</span><span>30%</span><span>50%+</span>
      </div>

      {/* Significato */}
      <div style={{
        marginTop:14, padding:'10px 12px',
        background: `${band.color}10`, border:`1px solid ${band.color}40`, borderRadius:8,
        fontSize:19, color:ADM.TEXT, lineHeight:1.5,
      }}>
        <strong style={{color:band.color}}>{band.label}.</strong> {band.hint}
      </div>
    </AdmCard>
  );
}

function DrwScanOrdini({ locale: l }) {
  const [periodo, setPeriodo] = useStateDrw('mese');
  const [hoverInfo, setHoverInfo] = useStateDrw(false);
  const isAnno = periodo === 'anno';

  // Calcoli per locale (mese + anno) + confronto con la media piattaforma
  const scan = isAnno ? l.scanQRAnno : l.scanQRMese;
  const ord  = isAnno ? l.ordiniAnno : l.ordiniMese;
  const ratio = scan > 0 ? ord / scan : 0;

  // Media piattaforma (locali live con scan > 0)
  const eligible = LOCALI.filter(x =>
    (x.stato === 'active' || x.stato === 'inactive' || x.stato === 'skipped') &&
    (isAnno ? x.scanQRAnno : x.scanQRMese) > 0
  );
  const totScan = eligible.reduce((s,x)=> s + (isAnno ? x.scanQRAnno : x.scanQRMese), 0);
  const totOrd  = eligible.reduce((s,x)=> s + (isAnno ? x.ordiniAnno : x.ordiniMese), 0);
  const ratioAvg = totScan > 0 ? totOrd / totScan : 0;
  const gap = ratioAvg > 0 ? ((ratio - ratioAvg) / ratioAvg) * 100 : 0;
  const aboveAvg = ratio >= ratioAvg;
  const accent = aboveAvg ? ADM.OK : ADM.DANGER;

  // Versione opposta per il tooltip "anche annuale"
  const opp = {
    label: isAnno ? '30 giorni' : '12 mesi',
    scan: isAnno ? l.scanQRMese : l.scanQRAnno,
    ord:  isAnno ? l.ordiniMese : l.ordiniAnno,
  };
  const oppRatio = opp.scan > 0 ? opp.ord / opp.scan : 0;

  const fmtP = (r) => `${(r * 100).toFixed(1).replace('.', ',')}%`;

  if (l.qrAdoption == null) {
    return (
      <AdmCard padding={18}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>Ordini · Scan QR</div>
        <div style={{fontSize:19, color:ADM.MUTED, lineHeight:1.5}}>
          Disponibile dopo il Go-live, quando il locale inizia a tracciare scan e ordini.
        </div>
      </AdmCard>
    );
  }

  return (
    <AdmCard padding={18}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:12}}>
        <div style={{minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT}}>Ordini · Scan QR</div>
            <span
              onMouseEnter={()=>setHoverInfo(true)}
              onMouseLeave={()=>setHoverInfo(false)}
              style={{
                position:'relative',
                width:15, height:15, borderRadius:'50%',
                background: hoverInfo ? ADM.TEXT : '#F0F1F3',
                color: hoverInfo ? '#fff' : ADM.MUTED,
                display:'inline-grid', placeItems:'center',
                fontSize:18, fontWeight:700, cursor:'help',
                transition:'all 0.15s',
              }}>i
              {hoverInfo && (
                <span style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:240,
                  background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:10,
                  boxShadow:'0 12px 28px -8px rgba(15,17,21,0.18)',
                  padding:'12px 14px', zIndex:30, textAlign:'left',
                  fontFamily:'inherit',
                }}>
                  <div style={{fontSize:17, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6}}>
                    Ultimi {opp.label}
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:18.5, color:ADM.TEXT, marginBottom:3}}>
                    <span style={{color:ADM.MUTED}}>Ordini</span>
                    <span style={{fontWeight:700}}>{fmtNum(opp.ord)}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:18.5, color:ADM.TEXT, marginBottom:6}}>
                    <span style={{color:ADM.MUTED}}>Scan QR</span>
                    <span style={{fontWeight:700}}>{fmtNum(opp.scan)}</span>
                  </div>
                  <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`, paddingTop:6, display:'flex', justifyContent:'space-between', fontSize:19.5, color:ADM.TEXT, fontWeight:700}}>
                    <span>Conversione</span>
                    <span>{opp.scan > 0 ? fmtP(oppRatio) : '—'}</span>
                  </div>
                </span>
              )}
            </span>
          </div>
          <div style={{fontSize:18.5, color:ADM.MUTED, marginTop:2}}>
            Filtra per mese · hover sull'icona per vedere il dato annuale
          </div>
        </div>

        {/* Toggle */}
        <div style={{display:'inline-flex', padding:2, borderRadius:8, background:'#F0F1F3', flexShrink:0}}>
          {[
            { id:'mese', label:'Mese' },
            { id:'anno', label:'Anno' },
          ].map(p => (
            <button key={p.id} onClick={()=>setPeriodo(p.id)} style={{
              padding:'4px 11px', border:'none',
              background: periodo === p.id ? '#fff' : 'transparent',
              color: periodo === p.id ? ADM.TEXT : ADM.MUTED,
              fontSize:18.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              borderRadius:6,
              boxShadow: periodo === p.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition:'all 0.15s',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Numeri principali */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14}}>
        <DrwMetricBox label="Ordini"      value={fmtNum(ord)}  tone={ADM.TEXT}/>
        <DrwMetricBox label="Scan QR"     value={fmtNum(scan)} tone={ADM.PINK}/>
        <DrwMetricBox label="Conversione" value={scan > 0 ? fmtP(ratio) : '—'} tone={accent}/>
      </div>

      {/* Confronto con la media */}
      <div style={{
        padding:'10px 14px', borderRadius:8,
        background: aboveAvg ? ADM.OK_SOFT : '#FEE2E2',
        border:`1px solid ${aboveAvg ? '#86EFAC' : '#FCA5A5'}`,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
      }}>
        <div style={{fontSize:19, color: aboveAvg ? '#065F46' : '#7F1D1D', lineHeight:1.4, minWidth:0}}>
          <strong>Media piattaforma:</strong> {fmtP(ratioAvg)} ({isAnno ? '12 mesi' : '30 giorni'}).{' '}
          {scan > 0
            ? aboveAvg
              ? <>Questo locale è <strong>+{gap.toFixed(0)}%</strong> sopra la media.</>
              : <>Questo locale è <strong>{gap.toFixed(0)}%</strong> sotto la media.</>
            : <>Nessun ordine nel periodo.</>}
        </div>
        <span style={{
          padding:'3px 9px', borderRadius:99,
          background: accent, color:'#fff',
          fontSize:17.5, fontWeight:700, whiteSpace:'nowrap',
          textTransform:'uppercase', letterSpacing:'0.04em',
        }}>{aboveAvg ? 'Sopra' : 'Sotto'} media</span>
      </div>
    </AdmCard>
  );
}

function DrwMetricBox({ label, value, tone }) {
  return (
    <div style={{padding:'10px 12px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:8}}>
      <div style={{fontSize:17, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3}}>{label}</div>
      <div style={{fontSize:25, fontWeight:800, color: tone || ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.1, fontFamily:'ui-monospace, monospace'}}>{value}</div>
    </div>
  );
}

function DrwFunnelCompact({ locale: l }) {
  return (
    <AdmCard padding={18}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT}}>Funnel onboarding</div>
        <div style={{fontSize:18.5, color:ADM.MUTED}}>{l.completedSteps.length} di {ONB_STEPS.length} step completati</div>
      </div>
      <FunnelStepper locale={l} variant="compact"/>
    </AdmCard>
  );
}

function FunnelStepper({ locale: l, variant = 'full' }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:0}}>
      {ONB_STEPS.map((s, i) => {
        const done = l.completedSteps.includes(s.id);
        const stuck = l.stoppedAt === s.id;
        const future = !done && !stuck;
        const time = l.stepTimes && l.stepTimes[s.id];
        return (
          <React.Fragment key={s.id}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:0, flex: variant==='compact' ? 1 : 'none'}}>
              <div style={{
                width: stuck ? 32 : 28, height: stuck ? 32 : 28,
                borderRadius:'50%',
                background: done ? ADM.OK : stuck ? '#fff' : '#fff',
                border: stuck ? `2.5px solid ${ADM.WARN}` : done ? 'none' : `2px solid ${ADM.BORDER}`,
                color: done ? '#fff' : stuck ? ADM.WARN : ADM.MUTED_LIGHT,
                display:'grid', placeItems:'center',
                fontSize:19, fontWeight:700,
                flexShrink:0,
                boxShadow: stuck ? `0 0 0 5px ${ADM.WARN_SOFT}` : 'none',
              }}>
                {done ? <BuIcons.check size={19}/> : stuck ? <BuIcons.clock size={19}/> : i+1}
              </div>
              <div style={{textAlign:'center', minWidth:0}}>
                <div style={{
                  fontSize:18, fontWeight: stuck ? 700 : 500,
                  color: stuck ? ADM.WARN : done ? ADM.TEXT : ADM.MUTED,
                  whiteSpace:'nowrap',
                }}>{s.label}</div>
                {time && variant !== 'compact' && (
                  <div style={{fontSize:17, color:ADM.MUTED_SOFT, marginTop:1}}>{fmtDate(time)}</div>
                )}
                {stuck && variant !== 'compact' && (
                  <div style={{fontSize:17, color:ADM.WARN, marginTop:1, fontWeight:600}}>Fermo qui</div>
                )}
              </div>
            </div>
            {i < ONB_STEPS.length - 1 && (
              <div style={{flex:1, height:2, background: l.completedSteps.includes(ONB_STEPS[i+1].id) || stuck ? (l.completedSteps.includes(ONB_STEPS[i+1].id) ? ADM.OK : ADM.WARN) : '#E5E7EB', margin:'0 4px', marginBottom:24}}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DrwFunnel({ locale: l }) {
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:16}}>
      <AdmCard padding={24}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
          <div>
            <div style={{fontSize:21, fontWeight:600, color:ADM.TEXT}}>Stato del funnel di onboarding</div>
            <div style={{fontSize:19, color:ADM.MUTED, marginTop:2}}>Timeline da iscrizione a Go-live</div>
          </div>
          <AdmBadge color={l.stato === 'active' ? 'OK' : l.stato === 'onboarding' ? 'WARN' : l.stato === 'skipped' ? 'INFO' : 'PLAN_FREE'} size="md">
            {l.stato === 'active' ? 'Completato' : l.stato === 'onboarding' ? 'In corso' : l.stato === 'skipped' ? 'Saltato' : l.stato === 'pending' ? 'Non iniziato' : 'Completato'}
          </AdmBadge>
        </div>
        <FunnelStepper locale={l} variant="full"/>
      </AdmCard>

      {/* Timeline verticale */}
      <AdmCard padding={20}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Cronologia step</div>
        <div style={{display:'flex', flexDirection:'column'}}>
          {ONB_STEPS.map((s, i) => {
            const done = l.completedSteps.includes(s.id);
            const stuck = l.stoppedAt === s.id;
            const time = l.stepTimes && l.stepTimes[s.id];
            return (
              <div key={s.id} style={{display:'flex', gap:14, paddingBottom: i === ONB_STEPS.length-1 ? 0 : 18, position:'relative'}}>
                {i < ONB_STEPS.length-1 && <div style={{position:'absolute', left:11, top:24, bottom:0, width:2, background: done && l.completedSteps.includes(ONB_STEPS[i+1].id) ? ADM.OK : '#E5E7EB'}}/>}
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: done ? ADM.OK : stuck ? ADM.WARN_SOFT : '#F3F4F6',
                  border: stuck ? `2px solid ${ADM.WARN}` : 'none',
                  color: done ? '#fff' : stuck ? ADM.WARN : ADM.MUTED_LIGHT,
                  display:'grid', placeItems:'center',
                  fontSize:18, fontWeight:700,
                  flexShrink:0, position:'relative', zIndex:1,
                }}>{done ? <BuIcons.check size={17}/> : i+1}</div>
                <div style={{flex:1, paddingTop:1}}>
                  <div style={{fontSize:20.5, fontWeight:600, color:ADM.TEXT}}>{s.label}</div>
                  <div style={{fontSize:18.5, color: stuck ? ADM.WARN : ADM.MUTED, marginTop:2, fontWeight: stuck ? 600 : 400}}>
                    {done && time ? `Completato ${fmtDateTime(time)}` :
                     stuck ? `In attesa da ${fmtRelative(l.lastLogin)}` :
                     'In attesa'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AdmCard>
    </div>
  );
}

function DrwAnagrafica({ locale: l }) {
  return (
    <div style={{padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
      <AdmCard padding={20}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Anagrafica locale</div>
        <DataRow label="Ragione sociale" value={l.nome}/>
        <DataRow label="Tipologia" value={l.tipo}/>
        <DataRow label="Indirizzo" value={`${l.indirizzo}, ${l.cap} ${l.citta} (${l.regione})`}/>
        <DataRow label="Titolare" value={l.titolare}/>
        <DataRow label="Email" value={l.email} mono/>
        <DataRow label="Telefono" value={l.tel} mono/>
        <DataRow label="Coperti" value={`${l.coperti} posti`} last/>
      </AdmCard>

      <AdmCard padding={20}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Dati fiscali</div>
        <DataRow label="P. IVA" value={l.piva} mono/>
        <DataRow label="Codice fiscale" value={l.cf} mono/>
        <DataRow label="Codice SDI / PEC" value={l.sdi} mono/>
        <DataRow label="Regime fiscale" value="Ordinario"/>
        <DataRow label="IBAN" value="IT60 X054 2811 1010 0000 ******78" mono/>
        <DataRow label="Iscritto dal" value={fmtDate(l.dataIscrizione)} last/>
      </AdmCard>

      <AdmCard padding={20} style={{gridColumn:'span 2'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT}}>Certificazioni</div>
          <AdmButton variant="secondary" size="sm" icon="plus">Richiedi documento</AdmButton>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {[
            { tipo: 'Senza glutine · AIC', stato: 'approvata', data: '15 ott 2024' },
            { tipo: 'Vegetariano · V-Label', stato: 'approvata', data: '02 set 2024' },
            { tipo: 'Biologico · ICEA', stato: 'pending', data: 'In revisione' },
          ].map((c, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:ADM.PANEL_SOFT, borderRadius:8, border:`1px solid ${ADM.BORDER_SOFT}`}}>
              <BuIcons.filePdf size={21} color={ADM.MUTED}/>
              <div style={{flex:1, fontSize:19.5, color:ADM.TEXT, fontWeight:500}}>{c.tipo}</div>
              <div style={{fontSize:18.5, color:ADM.MUTED}}>{c.data}</div>
              <AdmBadge color={c.stato==='approvata' ? 'OK' : 'WARN'} size="xs">
                {c.stato === 'approvata' ? 'Approvata' : 'In revisione'}
              </AdmBadge>
            </div>
          ))}
        </div>
      </AdmCard>
    </div>
  );
}

function DataRow({ label, value, mono, last }) {
  return (
    <div style={{display:'flex', padding:'10px 0', borderBottom: last ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
      <div style={{width:140, fontSize:18.5, color:ADM.MUTED, fontWeight:500}}>{label}</div>
      <div style={{flex:1, fontSize:19.5, color:ADM.TEXT, fontWeight:500, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit'}}>{value}</div>
    </div>
  );
}

function DrwAttivita({ locale: l }) {
  const events = [
    { type:'order', text:'Nuovo ordine #2841 · €42,50', when: new Date(Date.now() - 600000) },
    { type:'reservation', text:'Prenotazione confermata · 4 persone · 20:30', when: new Date(Date.now() - 1800000) },
    { type:'login', text:`Login da ${l.titolare}`, when: l.lastLogin },
    { type:'menu', text:'Aggiornato menu · 3 nuovi piatti', when: new Date(Date.now() - 86400000 * 2) },
    { type:'order', text:'Nuovo ordine #2840 · €28,00', when: new Date(Date.now() - 86400000 * 2 - 3600000) },
    { type:'support', text:'Richiesta supporto · Stampante scontrini', when: new Date(Date.now() - 86400000 * 3) },
    { type:'plan', text:`Sottoscritto piano ${PIANI.find(p=>p.id===l.piano).label}`, when: l.dataIscrizione },
  ];
  const icons = { order:'receipt', reservation:'calendar', login:'user', menu:'utensils', support:'chat', plan:'card' };
  return (
    <div style={{padding:'20px 24px'}}>
      <AdmCard padding={20}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Log attività</div>
        <div style={{display:'flex', flexDirection:'column'}}>
          {events.map((e, i) => {
            const Icon = BuIcons[icons[e.type]];
            return (
              <div key={i} style={{display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom: i === events.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{width:30, height:30, borderRadius:7, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>
                  <Icon size={19}/>
                </div>
                <div style={{flex:1, fontSize:19.5, color:ADM.TEXT}}>{e.text}</div>
                <div style={{fontSize:18, color:ADM.MUTED_SOFT}}>{fmtRelative(e.when)}</div>
              </div>
            );
          })}
        </div>
      </AdmCard>
    </div>
  );
}

function DrwFatturazione({ locale: l }) {
  const piano = PIANI.find(p => p.id === l.piano);
  const fatture = [
    { num: '2025-0142', data: new Date(Date.now() - 86400000 * 5), importo: l.mrr, stato: 'paid' },
    { num: '2024-0118', data: new Date(Date.now() - 86400000 * 35), importo: l.mrr, stato: 'paid' },
    { num: '2024-0094', data: new Date(Date.now() - 86400000 * 65), importo: l.mrr, stato: 'paid' },
    { num: '2024-0071', data: new Date(Date.now() - 86400000 * 95), importo: l.mrr, stato: 'paid' },
  ];
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
      <AdmCard padding={20}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <div style={{
            width:54, height:54, borderRadius:11,
            background: ADM[piano.color + '_SOFT'],
            color: ADM[piano.color],
            display:'grid', placeItems:'center',
          }}><BuIcons.crown size={27}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:18, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Piano attivo</div>
            <div style={{fontSize:27, fontWeight:700, color:ADM.TEXT, marginTop:2}}>{piano.label} · {fmtEur(piano.price)}/mese</div>
            {l.extras > 0 && <div style={{fontSize:19, color:ADM.PURPLE, marginTop:3, fontWeight:600}}>+ {fmtEur(l.extras)}/mese in extra</div>}
          </div>
          <AdmButton variant="secondary" size="sm">Cambia piano</AdmButton>
          <AdmButton variant="ghost" size="sm">Sospendi</AdmButton>
        </div>
      </AdmCard>

      <AdmCard padding={20}>
        <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Ultime fatture</div>
        <div>
          {fatture.map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i === fatture.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
              <BuIcons.receipt size={20} color={ADM.MUTED}/>
              <div style={{flex:1}}>
                <div style={{fontSize:19.5, fontWeight:600, color:ADM.TEXT}}>Fattura #{f.num}</div>
                <div style={{fontSize:18.5, color:ADM.MUTED}}>{fmtDate(f.data)}</div>
              </div>
              <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT}}>{fmtEur(f.importo)}</div>
              <AdmBadge color="OK" size="xs">Pagata</AdmBadge>
              <AdmIconBtn icon="download" label="Scarica"/>
            </div>
          ))}
        </div>
      </AdmCard>
    </div>
  );
}

window.LocaleDrawer = LocaleDrawer;

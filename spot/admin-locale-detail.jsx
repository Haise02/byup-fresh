// Drawer dettaglio locale: anagrafica, funnel, attività, fatturazione

const { useState: useStateDrw } = React;

function LocaleDrawer({ locale: l, onClose }) {
  const [tab, setTab] = useStateDrw('anagrafica');

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
      animation:'fadeIn 0.15s ease',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        // Largo come una scheda contatto di un CRM, non come una finestra di
        // servizio: dentro ci vivono sei tab e le card a due colonne
        // respirano solo se la riga non le schiaccia.
        width: 1060, maxWidth:'96%',
        background:'#fff',
        maxHeight:'88%',
        borderRadius:18, overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.22s cubic-bezier(0.22,0.9,0.35,1)',
        position:'relative',
      }}>
        {/* Header */}
        <div style={{padding:'16px 24px 14px', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
          <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Dettaglio locale</span>
          <AdmIconBtn icon="x" onClick={onClose} label="Chiudi"/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={{
            width:48, height:48, borderRadius:10,
            background: `hsl(${(l.id.charCodeAt(1)+l.id.charCodeAt(3))*3 % 360}, 35%, 55%)`,
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:700, fontSize:16.6, flexShrink:0,
          }}>{l.nome.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
              <div style={{fontSize:18, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{l.nome}</div>
              <AdmPlanBadge piano={l.piano}/>
              {/* Lo stato è BINARIO: o il rapporto è in piedi o non lo è. Il
                  gradino commerciale (lead, onboarding, piano) sta nella
                  colonna «Ciclo di vita» della rubrica, non qui. */}
              <AdmBadge color={l.stato === 'active' ? 'OK' : 'PLAN_FREE'} size="xs">
                {l.stato === 'active' ? 'Attivo' : 'Inattivo'}
              </AdmBadge>
            </div>
            <div style={{fontSize:13.7, color:ADM.MUTED, display:'flex', gap:10}}>
              <span style={{fontFamily:'ui-monospace,monospace'}}>{l.id}</span>
              <span style={{color:ADM.MUTED_LIGHT}}>·</span>
              <span>{l.tipo}, {l.citta}</span>
              <span style={{color:ADM.MUTED_LIGHT}}>·</span>
              <span>Iscritto {fmtDate(l.dataIscrizione)}</span>
            </div>
          </div>
        </div>
        </div>

        {/* La scheda si legge come un contatto di CRM: prima chi è
            (anagrafica e proprietà libere), poi come va, poi i fascicoli.
            Le certificazioni hanno la LORO tab: prima si andavano a cercare
            dentro i ticket dell'Assistenza. */}
        <AdmTabBar tabs={[
          { id:'anagrafica', label:'Anagrafica' },
          { id:'proprieta', label:'Proprietà' },
          { id:'panoramica', label:'Panoramica' },
          { id:'attivita', label:'Attività' },
          { id:'certificazioni', label:'Certificazioni',
            ...(CERTIFICAZIONI.filter(c=>c.localeId===l.id).length
              ? { badge: CERTIFICAZIONI.filter(c=>c.localeId===l.id).length } : {}) },
          { id:'fatturazione', label:'Fatturazione & Piano' },
        ]} active={tab} onChange={setTab}/>

        <div style={{flex:1, overflow:'auto', background: ADM.PANEL_SOFT}}>
          {tab==='panoramica' && <DrwPanoramica locale={l}/>}
          {tab==='anagrafica' && <DrwAnagrafica locale={l}/>}
          {tab==='proprieta' && <DrwProprieta locale={l}/>}
          {tab==='attivita' && <DrwAttivita locale={l}/>}
          {tab==='certificazioni' && <DrwCertificazioni locale={l}/>}
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
            <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Fermo da {fmtRelative(l.lastLogin)} su "{stoppedStep.label}"</div>
            <div style={{fontSize:13.7, color:'#92400E', marginTop:3}}>Considera di inviare un reminder o assistenza dedicata per sbloccarlo.</div>
          </div>
          <AdmButton variant="secondary" size="sm" icon="mail">Invia reminder</AdmButton>
        </div>
      )}
      {l.stato === 'skipped' && (
        <div style={{padding:'14px 16px', background: ADM.INFO_SOFT, border:`1px solid #BFDBFE`, borderRadius:10, display:'flex', gap:12, alignItems:'flex-start'}}>
          <div style={{color: ADM.INFO, marginTop:1}}><BuIcons.info size={23}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Onboarding saltato</div>
            <div style={{fontSize:13.7, color:'#1E40AF', marginTop:3}}>Il locale è andato direttamente in Panoramica senza completare il setup guidato.</div>
          </div>
        </div>
      )}

      <AdmCard padding={0}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
          <MiniStat first label="Ordini/giorno" value={l.ordiniGiorno} sub={`${fmtNum(l.ordiniMese)}/mese`}/>
          <MiniStat label="Prenotaz./giorno" value={l.prenotazioniGiorno} sub={`${l.copertura}% copertura`}/>
          <MiniStat label="Scontrino medio" value={fmtEur(l.ticketMedio)} sub="per ordine"/>
          <MiniStat label="Ultimo login" value={fmtRelative(l.lastLogin)} sub={fmtDate(l.lastLogin)}/>
        </div>
      </AdmCard>

      <AdmCard padding={18}>
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:12}}>Andamento ordini · 14 giorni</div>
        <AdmBarChart data={[12,18,14,22,28,32,24,30,38,42,36,44,48,52].map(x=>x*(l.ordiniGiorno/30))} labels={Array(14).fill('')} height={140}/>
      </AdmCard>

      <DrwAdozioneDigitale locale={l}/>

      <DrwScanOrdini locale={l}/>

      <DrwFunnelCompact locale={l}/>
    </div>
  );
}

function MiniStat({ label, value, sub, first }) {
  // Cella di una striscia KPI unificata: hairline tra le colonne, non box.
  return (
    <div style={{padding:'14px 18px', borderLeft: first ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
      <div style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
      <div style={{fontSize:22, fontWeight:800, color:ADM.TEXT, marginTop:5, letterSpacing:'-0.02em', lineHeight:1.1}}>{value}</div>
      {sub && <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:3}}>{sub}</div>}
    </div>
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
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>Adozione digitale</div>
        <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.5}}>
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
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Adozione digitale</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>% di ordini/coperti che passano dal QR byup · ultimi 30 giorni</div>
        </div>
        <span style={{
          padding:'4px 10px', borderRadius:99,
          background: band.color, color: band.textOn,
          fontSize:13, fontWeight:800, whiteSpace:'nowrap',
          textTransform:'uppercase', letterSpacing:'0.04em',
        }}>{band.label}</span>
      </div>

      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:12}}>
        <div style={{fontSize:29.5, fontWeight:800, color: band.color, letterSpacing:'-0.02em', lineHeight:1}}>
          {qr === 0 ? '0%' : `${qr.toFixed(1)}%`}
        </div>
        <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.4}}>fascia <strong style={{color:ADM.TEXT}}>{band.range}</strong></div>
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
      <div style={{display:'flex', justifyContent:'space-between', fontSize:12.2, color:ADM.MUTED_SOFT, fontFamily:'ui-monospace, monospace'}}>
        <span>0%</span><span>5%</span><span>15%</span><span>30%</span><span>50%+</span>
      </div>

      {/* Significato */}
      <div style={{
        marginTop:14, padding:'10px 12px',
        background: `${band.color}10`, border:`1px solid ${band.color}40`, borderRadius:8,
        fontSize:13.7, color:ADM.TEXT, lineHeight:1.5,
      }}>
        <strong style={{color:band.color}}>{band.label}.</strong> {band.hint}
      </div>
    </AdmCard>
  );
}

function DrwScanOrdini({ locale: l }) {
  const [periodo, setPeriodo] = useStateDrw('mese');
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

  const fmtP = (r) => `${(r * 100).toFixed(1).replace('.', ',')}%`;

  if (l.qrAdoption == null) {
    return (
      <AdmCard padding={18}>
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>Ordini · Scan QR</div>
        <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.5}}>
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
            <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Ordini · Scan QR</div>
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>
            Ordini completati partendo da uno scan QR · usa il selettore per il periodo
          </div>
        </div>

        {/* Toggle */}
        <div style={{display:'inline-flex', padding:2, borderRadius:8, background:'#F0F1F3', flexShrink:0}}>
          {[
            { id:'mese', label:'Mese' },
            { id:'anno', label:'Anno' },
          ].map(p => (
            <button key={p.id} className="adm-pill" onClick={()=>setPeriodo(p.id)} style={{
              padding:'4px 11px', border:'none',
              background: periodo === p.id ? '#fff' : 'transparent',
              color: periodo === p.id ? ADM.TEXT : ADM.MUTED,
              fontSize:13.3, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
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
        <div style={{fontSize:13.7, color: aboveAvg ? '#065F46' : '#7F1D1D', lineHeight:1.4, minWidth:0}}>
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
          fontSize:12.6, fontWeight:700, whiteSpace:'nowrap',
          textTransform:'uppercase', letterSpacing:'0.04em',
        }}>{aboveAvg ? 'Sopra' : 'Sotto'} media</span>
      </div>
    </AdmCard>
  );
}

function DrwMetricBox({ label, value, tone }) {
  return (
    <div style={{padding:'10px 12px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:8}}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3}}>{label}</div>
      <div style={{fontSize:18, fontWeight:800, color: tone || ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.1, fontFamily:'ui-monospace, monospace'}}>{value}</div>
    </div>
  );
}

function DrwFunnelCompact({ locale: l }) {
  return (
    <AdmCard padding={18}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Funnel onboarding</div>
        <div style={{fontSize:13.3, color:ADM.MUTED}}>{l.completedSteps.length} di {ONB_STEPS.length} step completati</div>
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
                fontSize:13.7, fontWeight:700,
                flexShrink:0,
                boxShadow: stuck ? `0 0 0 5px ${ADM.WARN_SOFT}` : 'none',
              }}>
                {done ? <BuIcons.check size={19}/> : stuck ? <BuIcons.clock size={19}/> : i+1}
              </div>
              <div style={{textAlign:'center', minWidth:0}}>
                <div style={{
                  fontSize:13, fontWeight: stuck ? 700 : 500,
                  color: stuck ? ADM.WARN : done ? ADM.TEXT : ADM.MUTED,
                  whiteSpace:'nowrap',
                }}>{s.label}</div>
                {time && variant !== 'compact' && (
                  <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, marginTop:1}}>{fmtDate(time)}</div>
                )}
                {stuck && variant !== 'compact' && (
                  <div style={{fontSize:12.2, color:ADM.WARN, marginTop:1, fontWeight:600}}>Fermo qui</div>
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

function DrwAnagrafica({ locale: l }) {
  const FIELDS = ['nome','tipo','indirizzo','cap','citta','regione','titolare','email','tel','coperti','piva','cf','sdi'];
  const [form, setForm] = useStateDrw(Object.fromEntries(FIELDS.map(k => [k, l[k] ?? ''])));
  const dirty = FIELDS.some(k => String(form[k]) !== String(l[k] ?? ''));
  const [saved, setSaved] = useStateDrw(false);
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target.value })); };
  const saveForm = () => {
    Object.assign(l, { ...form, coperti: Number(form.coperti) || l.coperti });
    setSaved(true); setTimeout(()=>setSaved(false), 2200);
  };
  const inp = {width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
  const mono = {...inp, fontFamily:'ui-monospace,monospace', fontSize:12.5};
  const lab = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};
  const Fld = ({k, label, span, monoStyle, type}) => (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={lab}>{label}</label>
      <input type={type || 'text'} value={form[k]} onChange={F(k)} style={monoStyle ? mono : inp}/>
    </div>
  );
  return (
    <div style={{padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Anagrafica locale</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
          {Fld({k:'nome', label:'Ragione sociale', span:true})}
          {Fld({k:'tipo', label:'Tipologia'})}
          {Fld({k:'titolare', label:'Titolare'})}
          {Fld({k:'indirizzo', label:'Indirizzo', span:true})}
          {Fld({k:'cap', label:'CAP', monoStyle:true})}
          {Fld({k:'citta', label:'Città'})}
          {Fld({k:'regione', label:'Regione'})}
          {Fld({k:'coperti', label:'Coperti', type:'number'})}
          {Fld({k:'email', label:'Email', monoStyle:true, span:true})}
          {Fld({k:'tel', label:'Telefono', monoStyle:true})}
        </div>
      </AdmCard>

      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Dati fiscali</div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {Fld({k:'piva', label:'Partita IVA', monoStyle:true})}
          {Fld({k:'cf', label:'Codice fiscale', monoStyle:true})}
          <Fld k="sdi" label="Codice SDI / PEC" monoStyle/>
          <div>
            <label style={lab}>Regime fiscale</label>
            <div style={{...inp, background:ADM.PANEL_SOFT, color:ADM.MUTED}}>Ordinario</div>
          </div>
          <div>
            <label style={lab}>IBAN</label>
            <div style={{...mono, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              IT60 X054 2811 1010 0000 ******78
              <span style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:ADM.MUTED_SOFT}}>gestito da Stripe</span>
            </div>
          </div>
          <div>
            <label style={lab}>Iscritto dal</label>
            <div style={{...inp, background:ADM.PANEL_SOFT, color:ADM.MUTED}}>{fmtDate(l.dataIscrizione)}</div>
          </div>
        </div>
      </AdmCard>

      <div style={{gridColumn:'span 2', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:10}}>
        {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
        <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={saveForm}>Salva modifiche</AdmButton>
      </div>

      <AdmCard padding={20} style={{gridColumn:'span 2'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Certificazioni</div>
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
              <div style={{flex:1, fontSize:14, color:ADM.TEXT, fontWeight:500}}>{c.tipo}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED}}>{c.data}</div>
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
      <div style={{width:140, fontSize:13.3, color:ADM.MUTED, fontWeight:500}}>{label}</div>
      <div style={{flex:1, fontSize:14, color:ADM.TEXT, fontWeight:500, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit'}}>{value}</div>
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
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Log attività</div>
        <div style={{display:'flex', flexDirection:'column'}}>
          {events.map((e, i) => {
            const Icon = BuIcons[icons[e.type]];
            return (
              <div key={i} style={{display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom: i === events.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{width:30, height:30, borderRadius:7, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>
                  <Icon size={19}/>
                </div>
                <div style={{flex:1, fontSize:14, color:ADM.TEXT}}>{e.text}</div>
                <div style={{fontSize:13, color:ADM.MUTED_SOFT}}>{fmtRelative(e.when)}</div>
              </div>
            );
          })}
        </div>
      </AdmCard>
    </div>
  );
}

function DrwFatturazione({ locale: l }) {
  const [, forceRender] = useStateDrw(0);
  const piano = PIANI.find(p => p.id === l.piano);
  // Azioni di fatturazione: rimborso / accredito ordini extra / cambio piano.
  const [popup, setPopup] = useStateDrw(null); // 'rimborso' | 'accredito' | 'piano' | null
  const [amount, setAmount] = useStateDrw('');
  const [reason, setReason] = useStateDrw('');
  const [planSel, setPlanSel] = useStateDrw(l.piano);
  const [feedback, setFeedback] = useStateDrw(null);
  const flash = (msg) => { setFeedback(msg); setTimeout(()=>setFeedback(null), 3000); };
  const closePopup = () => { setPopup(null); setAmount(''); setReason(''); setPlanSel(l.piano); };
  const confirmRimborso = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    flash(`Rimborso di ${fmtEur(n)} emesso verso ${l.nome}`);
    closePopup();
  };
  const confirmAccredito = () => {
    const n = parseInt(amount, 10);
    if (!n || n <= 0) return;
    flash(`${fmtNum(n)} ordini extra accreditati senza addebito`);
    closePopup();
  };
  const confirmPiano = () => {
    const nuovo = PIANI.find(p => p.id === planSel);
    if (!nuovo || nuovo.id === l.piano) return;
    l.piano = nuovo.id; l.mrr = nuovo.price;
    flash(`Piano aggiornato a ${nuovo.label}`);
    closePopup(); forceRender(x => x + 1);
  };
  const inp = {width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
  const lab = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};
  const fatture = [
    { num: '2025-0142', data: new Date(Date.now() - 86400000 * 5), importo: l.mrr, stato: 'paid' },
    { num: '2024-0118', data: new Date(Date.now() - 86400000 * 35), importo: l.mrr, stato: 'paid' },
    { num: '2024-0094', data: new Date(Date.now() - 86400000 * 65), importo: l.mrr, stato: 'paid' },
    { num: '2024-0071', data: new Date(Date.now() - 86400000 * 95), importo: l.mrr, stato: 'paid' },
  ];
  const [dunningFeedback, setDunningFeedback] = useStateDrw(null);
  const pf = l.pagamentoFallito;
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
      {pf && (
        <div style={{padding:'14px 16px', background:ADM.DANGER_SOFT, border:`1px solid ${ADM.DANGER}40`, borderRadius:12, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
          <div style={{width:34, height:34, borderRadius:9, background:ADM.DANGER, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.alertTriangle size={19}/></div>
          <div style={{flex:1, minWidth:200}}>
            <div style={{fontSize:14, fontWeight:700, color:'#7F1D1D'}}>Ultimo addebito fallito · {pf.motivo}</div>
            <div style={{fontSize:12.5, color:'#7F1D1D', marginTop:2, opacity:0.85}}>{pf.tentativi} {pf.tentativi === 1 ? 'tentativo' : 'tentativi'} · dal {fmtDate(pf.data)} · rischio sospensione tra {14 - Math.floor((Date.now()-pf.data.getTime())/86400000)} giorni</div>
            {dunningFeedback && <div style={{fontSize:12.5, color:ADM.OK, fontWeight:700, marginTop:4}}>✓ {dunningFeedback}</div>}
          </div>
          <AdmButton variant="danger" size="sm" icon="card" onClick={()=>setDunningFeedback('Nuovo tentativo di addebito avviato via Stripe')}>Riprova addebito</AdmButton>
          <AdmButton variant="secondary" size="sm" icon="mail" onClick={()=>setDunningFeedback(`Promemoria inviato a ${l.email}`)}>Invia promemoria</AdmButton>
        </div>
      )}
      <AdmCard padding={20}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <div style={{
            width:54, height:54, borderRadius:11,
            background: ADM[piano.color + '_SOFT'],
            color: ADM[piano.color],
            display:'grid', placeItems:'center',
          }}><BuIcons.crown size={27}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Piano attivo</div>
            <div style={{fontSize:19.4, fontWeight:700, color:ADM.TEXT, marginTop:2}}>{piano.label} · {fmtEur(piano.price)}/mese</div>
            {l.extras > 0 && <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:3, fontWeight:600}}>+ {fmtEur(l.extras)}/mese in extra</div>}
          </div>
          <AdmButton variant="secondary" size="sm" onClick={()=>setPopup('piano')}>Cambia piano</AdmButton>
          <AdmButton variant="ghost" size="sm">Sospendi</AdmButton>
        </div>
        {feedback && <div style={{marginTop:12, padding:'9px 12px', background:ADM.OK_SOFT, borderRadius:8, fontSize:13, color:'#065F46', fontWeight:600}}>✓ {feedback}</div>}
      </AdmCard>

      {/* Azioni di fatturazione — rimborso / accredito ordini extra */}
      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Azioni di fatturazione</div>
        <div style={{fontSize:12.5, color:ADM.MUTED, marginBottom:14}}>Operazioni manuali sul conto del locale · richiedono conferma</div>
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <AdmButton variant="secondary" size="md" icon="money" onClick={()=>setPopup('rimborso')}>Emetti rimborso</AdmButton>
          <AdmButton variant="secondary" size="md" icon="plus" onClick={()=>setPopup('accredito')}>Accredita ordini extra</AdmButton>
        </div>
      </AdmCard>

      {/* ═══ Popup: rimborso ═══ */}
      {popup === 'rimborso' && (
        <div style={{position:'fixed', inset:0, zIndex:60, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={closePopup}>
          <div onClick={e=>e.stopPropagation()} style={{width:400, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Emetti rimborso</div>
            <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>Rimborso manuale a {l.nome} via Stripe · ultimo addebito {fmtEur(l.mrr)}</div>
            <label style={lab}>Importo (€)</label>
            <input type="number" min="1" step="0.01" autoFocus value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Es. 49,00" style={{...inp, marginBottom:12}}/>
            <label style={lab}>Motivo (obbligatorio)</label>
            <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Es. disservizio del 12/07, doppio addebito…" style={{...inp, marginBottom:14}}/>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="ghost" size="md" onClick={closePopup}>Annulla</AdmButton>
              <AdmButton variant="danger" size="md" icon="check" disabled={!(parseFloat(amount) > 0) || !reason.trim()} onClick={confirmRimborso}>Conferma rimborso</AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Popup: accredito ordini extra ═══ */}
      {popup === 'accredito' && (
        <div style={{position:'fixed', inset:0, zIndex:60, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={closePopup}>
          <div onClick={e=>e.stopPropagation()} style={{width:400, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Accredita ordini extra</div>
            <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>Ordini aggiuntivi senza addebito per {l.nome} (piano {piano.label}, extra correnti {fmtEur(l.extras)}/mese)</div>
            <label style={lab}>Numero di ordini da accreditare</label>
            <input type="number" min="1" autoFocus value={amount} onChange={e=>setAmount(e.target.value)}
              onKeyDown={e=>{ if (e.key === 'Enter') confirmAccredito(); }}
              placeholder="Es. 200" style={{...inp, marginBottom:14}}/>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="ghost" size="md" onClick={closePopup}>Annulla</AdmButton>
              <AdmButton variant="primary" size="md" icon="check" disabled={!(parseInt(amount,10) > 0)} onClick={confirmAccredito}>Conferma accredito</AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Popup: cambio piano ═══ */}
      {popup === 'piano' && (
        <div style={{position:'fixed', inset:0, zIndex:60, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={closePopup}>
          <div onClick={e=>e.stopPropagation()} style={{width:560, maxWidth:'92%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Cambia piano</div>
            <div style={{fontSize:13, color:ADM.MUTED, marginBottom:16}}>Il nuovo piano si applica dal prossimo ciclo di fatturazione di {l.nome}</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:10, marginBottom:16}}>
              {PIANI.map(p => {
                const sel = planSel === p.id;
                const current = l.piano === p.id;
                return (
                  <button key={p.id} className="adm-pill" onClick={()=>setPlanSel(p.id)} style={{
                    textAlign:'left', padding:'14px 16px', borderRadius:12, cursor:'pointer', fontFamily:'inherit',
                    background: sel ? ADM.PINK_BG_SOFT : '#fff',
                    border: sel ? `2px solid ${ADM.PINK}` : `1px solid ${ADM.BORDER}`,
                    position:'relative',
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
                      <span style={{fontSize:14.4, fontWeight:800, color:ADM.TEXT}}>{p.label}</span>
                      {current && <span style={{fontSize:10.5, fontWeight:800, color:ADM.MUTED, background:ADM.NEUTRAL_SOFT, padding:'2px 7px', borderRadius:99, textTransform:'uppercase', letterSpacing:'0.05em'}}>attuale</span>}
                    </div>
                    <div style={{fontSize:13, color:ADM.MUTED}}>{p.price > 0 ? `${fmtEur(p.price)}/mese` : 'Gratuito'}</div>
                  </button>
                );
              })}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="ghost" size="md" onClick={closePopup}>Annulla</AdmButton>
              <AdmButton variant="primary" size="md" icon="check" disabled={planSel === l.piano} onClick={confirmPiano}>Conferma cambio piano</AdmButton>
            </div>
          </div>
        </div>
      )}

      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Ultime fatture</div>
        <div>
          {fatture.map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i === fatture.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
              <BuIcons.receipt size={20} color={ADM.MUTED}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>Fattura #{f.num}</div>
                <div style={{fontSize:13.3, color:ADM.MUTED}}>{fmtDate(f.data)}</div>
              </div>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{fmtEur(f.importo)}</div>
              <AdmBadge color="OK" size="xs">Pagata</AdmBadge>
              <AdmIconBtn icon="download" label="Scarica"/>
            </div>
          ))}
        </div>
      </AdmCard>
    </div>
  );
}

// ─── Certificazioni — la tab dedicata ───────────────────────────────────────
// Prima le certificazioni di un locale si andavano a cercare in Assistenza →
// Ticket (tag «Certificazione alimentare»): dal suo dettaglio non si vedevano.
// Questa tab è il suo FASCICOLO — cosa ha inviato, cosa è approvato, cosa è
// stato rifiutato e perché. La revisione resta in Assistenza: qui si legge,
// là si lavora.
const CERT_STATI_DRW = {
  pending:   { label: 'In revisione', color: 'WARN' },
  approvata: { label: 'Approvata',    color: 'OK' },
  rifiutata: { label: 'Rifiutata',    color: 'DANGER' },
};

function DrwCertificazioni({ locale: l }) {
  const certs = CERTIFICAZIONI.filter(c => c.localeId === l.id)
    .slice().sort((a, b) => b.dataInvio - a.dataInvio);

  if (certs.length === 0) return (
    <div style={{padding:20}}>
      <AdmCard padding={0}>
        <AdmEmpty icon="shield" title="Nessuna certificazione"
          desc="Questo locale non ha ancora inviato certificazioni alimentari. Quando ne invia una, la richiesta arriva in Assistenza → Ticket e il fascicolo compare qui."/>
      </AdmCard>
    </div>
  );

  return (
    <div style={{padding:20, display:'flex', flexDirection:'column', gap:14}}>
      {certs.map(c => {
        const tipo = CERT_TIPI[c.tipo] || { label: c.tipo, ente: '—' };
        const st = CERT_STATI_DRW[c.stato] || { label: c.stato, color: 'PLAN_FREE' };
        return (
          <AdmCard key={c.id} padding={20}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
              <span style={{width:36, height:36, borderRadius:9, background:ADM[st.color+'_SOFT'], color:ADM[st.color], display:'grid', placeItems:'center', flexShrink:0}}>
                <BuIcons.shield size={19}/>
              </span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14.6, fontWeight:700, color:ADM.TEXT}}>{tipo.label}</div>
                <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1}}>Ente {tipo.ente} · {c.id}</div>
              </div>
              <AdmBadge color={st.color} size="xs">{st.label}</AdmBadge>
            </div>
            <DataRow label="Documento" value={`${c.file} (${c.size})`} mono/>
            <DataRow label="Inviata il" value={fmtDate(c.dataInvio)}/>
            {c.scadenzaCert && <DataRow label="Scade il" value={fmtDate(c.scadenzaCert)}/>}
            {c.revisedAt && <DataRow label="Revisionata il" value={`${fmtDate(c.revisedAt)} · ${c.revisedBy}`} last={!c.motivo}/>}
            {/* Il motivo del rifiuto per esteso: è la risposta alla domanda
                con cui si apre questo fascicolo — «perché non è passata?» */}
            {c.motivo && (
              <div style={{marginTop:12, padding:'10px 13px', borderRadius:9, background:ADM.DANGER_SOFT, color:ADM.DANGER, fontSize:12.8, lineHeight:1.5, fontWeight:500}}>
                {c.motivo}
              </div>
            )}
          </AdmCard>
        );
      })}
    </div>
  );
}

// ─── Proprietà — il locale come contatto di CRM ────────────────────────────
// Campi LIBERI per contatto, in stile CRM: il marketing aggiunge «Canale di
// acquisizione», il commerciale il suo referente, senza chiedere una colonna
// nuova a nessuno. Il nome della proprietà è la chiave: riaggiungerla con lo
// stesso nome la sovrascrive, non la duplica. Nel mock vivono in localStorage
// per locale; due proprietà nascono già compilate per far vedere che cosa
// sono — un pannello vuoto insegnerebbe solo che è vuoto.
const PROP_CANALI = ['Passaparola', 'Fiera Host Milano', 'Campagna Meta', 'Outbound commerciale', 'Sito web'];
const PROP_REFERENTI = ['Fabio M.', 'Marco D.', 'Sara P.'];

function drwPropSeed(l) {
  const seed = l.id.charCodeAt(1) * 7 + l.id.charCodeAt(3) * 3;
  return [
    { k: 'Canale di acquisizione', v: PROP_CANALI[seed % PROP_CANALI.length] },
    { k: 'Referente commerciale',  v: PROP_REFERENTI[seed % PROP_REFERENTI.length] },
  ];
}

function DrwProprieta({ locale: l }) {
  const KEY = 'adm_prop_' + l.id;
  const [props, setProps] = useStateDrw(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(s)) return s;
    } catch(e) {}
    return drwPropSeed(l);
  });
  const [nome, setNome] = useStateDrw('');
  const [valore, setValore] = useStateDrw('');

  const salva = (next) => {
    setProps(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch(e) {}
  };
  const aggiungi = () => {
    const k = nome.trim();
    if (!k) return;
    salva([...props.filter(p => p.k.toLowerCase() !== k.toLowerCase()), { k, v: valore.trim() }]);
    setNome(''); setValore('');
  };
  const cambia = (k, v) => salva(props.map(p => p.k === k ? { k, v } : p));
  const togli = (k) => salva(props.filter(p => p.k !== k));

  const inputStyle = {
    width:'100%', boxSizing:'border-box', padding:'8px 11px',
    border:`1px solid ${ADM.BORDER}`, borderRadius:8,
    fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, outline:'none', background:'#fff',
  };

  return (
    <div style={{padding:20, display:'flex', flexDirection:'column', gap:14}}>
      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Proprietà del contatto</div>
        <div style={{fontSize:12.6, color:ADM.MUTED, marginBottom:16, lineHeight:1.5}}>
          Campi liberi, come su un CRM: ogni team aggiunge i suoi — il marketing il canale, il commerciale il referente — e valgono solo per questo locale.
        </div>

        {props.length === 0 && (
          <div style={{fontSize:13, color:ADM.MUTED_SOFT, padding:'10px 0 16px'}}>Nessuna proprietà: aggiungi la prima qui sotto.</div>
        )}
        {props.map(p => (
          <div key={p.k} style={{
            display:'grid', gridTemplateColumns:'240px 1fr 34px', gap:10,
            alignItems:'center', padding:'8px 0',
            borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
          }}>
            <div style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={p.k}>{p.k}</div>
            <input value={p.v} onChange={e=>cambia(p.k, e.target.value)} placeholder="—" style={inputStyle}/>
            <button onClick={()=>togli(p.k)} title={`Rimuovi «${p.k}»`} style={{
              width:30, height:30, borderRadius:7, border:'none', background:'transparent',
              color:ADM.MUTED_SOFT, cursor:'pointer', display:'grid', placeItems:'center',
            }}><BuIcons.trash size={15}/></button>
          </div>
        ))}

        <div style={{
          display:'grid', gridTemplateColumns:'240px 1fr auto', gap:10,
          alignItems:'center', marginTop:16,
        }}>
          <input value={nome} onChange={e=>setNome(e.target.value)}
            onKeyDown={e=>{ if (e.key === 'Enter') aggiungi(); }}
            placeholder="Nuova proprietà (es. Segmento)" style={inputStyle}/>
          <input value={valore} onChange={e=>setValore(e.target.value)}
            onKeyDown={e=>{ if (e.key === 'Enter') aggiungi(); }}
            placeholder="Valore" style={inputStyle}/>
          <AdmButton variant="secondary" size="sm" icon="plus" disabled={!nome.trim()} onClick={aggiungi}>Aggiungi proprietà</AdmButton>
        </div>
      </AdmCard>
    </div>
  );
}

window.LocaleDrawer = LocaleDrawer;

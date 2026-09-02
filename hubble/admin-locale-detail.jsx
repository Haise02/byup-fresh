// Drawer dettaglio locale: anagrafica, funnel, attività, fatturazione

const { useState: useStateDrw } = React;

// `pieno`: la stessa scheda, ma A PAGINA INTERA — niente velo, niente
// finestra centrata: riempie il posto che il chiamante le dà (la rotta
// Contatti), e a chiudere ci pensa la barra «torna» del chiamante.
function LocaleDrawer({ locale: l, onClose, pieno }) {
  const [tab, setTab] = useStateDrw('anagrafica');
  // Il tick dei conteggi: quando una tab cambia i dati che la BARRA mostra
  // (eliminare una certificazione ne muove il badge), lo dice al drawer —
  // altrimenti il badge resta stantio fino al prossimo cambio tab.
  const [, aggiornaConteggi] = useStateDrw(0);
  const contaCambio = () => aggiornaConteggi(x => x + 1);

  return (
    <div onClick={pieno ? undefined : onClose} style={pieno ? {} : {
      position:'fixed', inset:0, zIndex:50,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
      animation:'fadeIn 0.15s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={pieno ? {
        width:'100%', background:'#fff',
        display:'flex', flexDirection:'column', position:'relative',
      } : {
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
          {!pieno && <AdmIconBtn icon="x" onClick={onClose} label="Chiudi"/>}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={{
            width:48, height:48, borderRadius:10,
            background: `hsl(${(l.id.charCodeAt(1)+l.id.charCodeAt(3))*3 % 360}, 35%, 55%)`,
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:700, fontSize:16.6, flexShrink:0,
          }}>{l.nome.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}</div>
          {/* SOLO il nome: piano, stato, codice e data d'iscrizione sono
              anagrafe e vivono nella tab Anagrafica — la testata presenta il
              locale, non lo riassume. */}
          <div style={{
            flex:1, minWidth:0,
            fontSize:19, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{l.nome}</div>
        </div>
        </div>

        {/* La scheda si legge come un contatto di CRM: prima chi è
            (anagrafica, dati fiscali, proprietà libere), poi come va
            (Statistiche — che dentro distingue i dati del LOCALE, l'ex
            Panoramica, dai dati da CAMERIERE del titolare — e il log), poi
            i fascicoli (certificazioni, contratti e consensi, fatturazione),
            e per ultima la gestione (Account, dove vive la sospensione). */}
        <AdmTabBar tabs={[
          { id:'anagrafica', label:'Anagrafica' },
          { id:'fiscale', label:'Dati fiscali' },
          { id:'proprieta', label:'Proprietà' },
          { id:'statistiche', label:'Statistiche' },
          { id:'attivita', label:'Log' },
          { id:'certificazioni', label:'Certificazioni',
            ...(CERTIFICAZIONI.filter(c=>c.localeId===l.id).length
              ? { badge: CERTIFICAZIONI.filter(c=>c.localeId===l.id).length } : {}) },
          { id:'contratti', label:'Contratti e consensi' },
          { id:'fatturazione', label:'Fatturazione' },
          { id:'account', label:'Account' },
        ]} active={tab} onChange={setTab}/>

        <div style={{flex:1, overflow:'auto', background: ADM.PANEL_SOFT}}>
          {tab==='anagrafica' && <DrwAnagrafica locale={l}/>}
          {tab==='fiscale' && <DrwFiscali locale={l}/>}
          {tab==='statistiche' && <DrwStatisticheLocale locale={l}/>}
          {tab==='proprieta' && <DrwProprieta locale={l}/>}
          {tab==='attivita' && <DrwAttivita locale={l}/>}
          {tab==='certificazioni' && <DrwCertificazioni locale={l} onCambia={contaCambio}/>}
          {tab==='contratti' && <DrwContratti locale={l}/>}
          {tab==='fatturazione' && <DrwFatturazione locale={l}/>}
          {tab==='account' && <DrwAccount locale={l}/>}
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

  // Il reminder del banner «fermo»: come il reset password in Account — il
  // gesto parte una volta verso l'email dell'anagrafica, la conferma prende
  // il posto del suggerimento e il bottone si spegne.
  const [reminderInviato, setReminderInviato] = useStateDrw(false);

  // ── Gli andamenti: UN periodo, scelto col filtro, comanda tutti e due i
  // grafici (ordini e fatturato) — e sotto le barre ci sono i riferimenti
  // temporali veri: i mesi per gli orizzonti lunghi, i giorni per i corti.
  const [periodo, setPeriodo] = useStateDrw('12m');
  const PERIODI = [
    { id: '12m',  label: '12 mesi' },
    { id: '6m',   label: '6 mesi' },
    { id: 'mese', label: 'Ultimo mese' },
    { id: 'sett', label: 'Settimana' },
  ];
  const serie = (() => {
    const s = hubSeme('trend-' + l.id) % 1000;
    const r = (n) => ((s * (n + 1) * 9301 + 49297) % 233280) / 233280;
    const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
    const GG = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
    if (periodo === 'sett') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        return { v: l.ordiniGiorno * (0.55 + r(i) * 0.9), label: GG[d.getDay()] };
      });
    }
    if (periodo === 'mese') {
      // Trenta barre: l'etichetta ogni cinque giorni, o sarebbe un muro.
      return Array.from({ length: 30 }).map((_, i) => {
        const d = new Date(Date.now() - (29 - i) * 86400000);
        return { v: l.ordiniGiorno * (0.55 + r(10 + i) * 0.9), label: (i % 5 === 0 || i === 29) ? String(d.getDate()) : '' };
      });
    }
    const n = periodo === '6m' ? 6 : 12;
    const oggi = new Date();
    return Array.from({ length: n }).map((_, i) => {
      const d = new Date(oggi.getFullYear(), oggi.getMonth() - (n - 1 - i), 1);
      // I mesi vecchi pesano meno: la curva cresce verso oggi, come il locale.
      const f = 0.55 + 0.45 * (i / (n - 1));
      return { v: l.ordiniMese * f * (0.75 + r(40 + i) * 0.5), label: MESI[d.getMonth()] };
    });
  })();
  const etichette = serie.map(x => x.label);
  const ordiniSerie = serie.map(x => x.v);
  const fattSerie = serie.map(x => x.v * l.ticketMedio);
  const periodoLabel = { '12m': 'ultimi 12 mesi', '6m': 'ultimi 6 mesi', mese: 'ultimo mese', sett: 'ultima settimana' }[periodo];
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:16}}>
      {/* Alert se bloccato */}
      {l.stato === 'onboarding' && stoppedStep && (
        <div style={{padding:'14px 16px', background: ADM.WARN_SOFT, border:`1px solid #FCD34D`, borderRadius:10, display:'flex', gap:12, alignItems:'flex-start'}}>
          <div style={{color: ADM.WARN, marginTop:1}}><BuIcons.pause size={23}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Fermo da {fmtRelative(l.lastLogin)} su "{stoppedStep.label}"</div>
            <div style={{fontSize:13.7, color:'#92400E', marginTop:3}}>
              {reminderInviato
                ? <span style={{color:ADM.OK, fontWeight:700}}>✓ Reminder inviato a {l.email}</span>
                : 'Considera di inviare un reminder o assistenza dedicata per sbloccarlo.'}
            </div>
          </div>
          <AdmButton variant="secondary" size="sm" icon="mail" disabled={reminderInviato} onClick={()=>setReminderInviato(true)}>Invia reminder</AdmButton>
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

      {/* La striscia in alto: TRE numeri e basta — ordini medi al mese,
          tasso di coperti occupati, scontrino medio. Prenotazioni e ultimo
          login stavano qui a fare rumore. */}
      <AdmCard padding={0}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
          <MiniStat first label="Ordini medi al mese" value={fmtNum(l.ordiniMese)} sub={`${l.ordiniGiorno} al giorno`}/>
          <MiniStat label="Tasso di coperti occupati" value={(42 + hubSeme('occ-' + l.id) % 46) + '%'} sub={`Su ${fmtNum(l.coperti)} coperti in sala`}/>
          <MiniStat label="Scontrino medio" value={fmtEur(l.ticketMedio)} sub="Per ordine"/>
        </div>
      </AdmCard>

      {/* I due andamenti, uno sotto l'altro: gli ordini e il fatturato che
          ne discende (ordini × scontrino — stessa curva, altra unità). Il
          filtro del periodo è UNO e comanda entrambi. */}
      <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
        <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Periodo</span>
        <div style={{display:'flex', gap:4}}>
          {PERIODI.map(pp => (
            <button key={pp.id} className="adm-pill" onClick={()=>setPeriodo(pp.id)} style={{
              padding:'6px 12px',
              background: periodo === pp.id ? ADM.TEXT : '#fff',
              color: periodo === pp.id ? '#fff' : ADM.MUTED,
              border: periodo === pp.id ? '1px solid transparent' : `1px solid ${ADM.BORDER}`,
              borderRadius:7, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}>{pp.label}</button>
          ))}
        </div>
      </div>

      <AdmCard padding={18}>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:12}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Andamento ordini</div>
          <div style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>{periodoLabel} · {fmtNum(Math.round(ordiniSerie.reduce((a, b) => a + b, 0)))} ordini</div>
        </div>
        <AdmBarChart data={ordiniSerie} labels={etichette} height={140}/>
      </AdmCard>

      <AdmCard padding={18}>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:12}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Andamento fatturato</div>
          <div style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>{periodoLabel} · {fmtEur(fattSerie.reduce((a, b) => a + b, 0))} totali</div>
        </div>
        <AdmBarChart data={fattSerie} labels={etichette} height={140}/>
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

  // La barra è fatta di segmenti a larghezze NON proporzionali alla scala
  // (0% è puntuale, le fasce basse pesano di più): il marker non può essere
  // lineare su 0–50 — si posiziona A TRATTI, dentro il segmento della SUA
  // fascia, o il triangolo punta una fascia diversa da quella evidenziata.
  // Etichette e marker derivano dagli stessi inizi cumulati: un sistema di
  // coordinate solo, per tutta la barra.
  const SEG_WIDTHS = [4, 10, 20, 30, 36]; // una per fascia, somma = 100
  const SEG_START = SEG_WIDTHS.map((_, i) => SEG_WIDTHS.slice(0, i).reduce((a, b) => a + b, 0));
  const scaleMax = 50; // clamp visivo dell'ultima fascia (30–50+)
  const bandIdx = ADOPTION_BANDS.findIndex(b => b.id === band.id);
  const lo = ADOPTION_BANDS[bandIdx].min;
  const hi = Math.min(ADOPTION_BANDS[bandIdx].max, scaleMax);
  // La fascia puntuale (0%) non ha un range: il marker sta al centro del suo segmento.
  const fraz = hi > lo ? Math.min(1, Math.max(0, (qr - lo) / (hi - lo))) : 0.5;
  const markerPct = SEG_START[bandIdx] + fraz * SEG_WIDTHS[bandIdx];

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
          {ADOPTION_BANDS.map((b, i) => (
            <div key={b.id} style={{
              width:`${SEG_WIDTHS[i]}%`, height:'100%',
              background: b.color, opacity: b.id === band.id ? 1 : 0.28,
              borderRight: i < ADOPTION_BANDS.length - 1 ? '1px solid #fff' : 'none',
            }}/>
          ))}
        </div>
        {/* Marker triangle */}
        <div style={{
          position:'absolute', top:-4, left:`calc(${markerPct}% - 6px)`,
          width:0, height:0,
          borderLeft:'6px solid transparent', borderRight:'6px solid transparent',
          borderTop:`7px solid ${ADM.TEXT}`,
        }}/>
      </div>
      {/* Le etichette stanno sui CONFINI reali dei segmenti, non equidistanti:
          tre sistemi di coordinate sulla stessa barra erano due di troppo. */}
      <div style={{position:'relative', height:16, fontSize:12.2, color:ADM.MUTED_SOFT, fontFamily:'ui-monospace, monospace'}}>
        <span style={{position:'absolute', left:0}}>0%</span>
        {[['5%', SEG_START[2]], ['15%', SEG_START[3]], ['30%', SEG_START[4]]].map(([t, x]) => (
          <span key={t} style={{position:'absolute', left:`${x}%`, transform:'translateX(-50%)'}}>{t}</span>
        ))}
        <span style={{position:'absolute', right:0}}>50%+</span>
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

// Gli stati «live»: chi lavora (active), chi ha saltato il setup ma ordina
// (skipped), chi ha rallentato senza cessare (inactive). UNA lista sola —
// la media piattaforma, le cifre da sala e il log operativo devono contare
// gli stessi locali, o la stessa tab si contraddice da sola.
const DRW_STATI_LIVE = ['active', 'inactive', 'skipped'];

function DrwScanOrdini({ locale: l }) {
  const [periodo, setPeriodo] = useStateDrw('mese');
  const isAnno = periodo === 'anno';

  // Calcoli per locale (mese + anno) + confronto con la media piattaforma
  const scan = isAnno ? l.scanQRAnno : l.scanQRMese;
  const ord  = isAnno ? l.ordiniAnno : l.ordiniMese;
  const ratio = scan > 0 ? ord / scan : 0;

  // Media piattaforma (locali live con scan > 0)
  const eligible = LOCALI.filter(x =>
    DRW_STATI_LIVE.includes(x.stato) &&
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

// Gli stili condivisi dei form del dettaglio locale.
const drwInp = {width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
const drwMono = {...drwInp, fontFamily:'ui-monospace,monospace', fontSize:12.5};
const drwLab = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};

// I locali associati all'UTENZA del titolare: l'utenza e il locale sono due
// cose distinte — questo fascicolo riguarda QUESTO locale, ma chi lo
// amministra può averne altri. Derivazione stabile: un titolare su quattro.
function drwLocaliAssociati(l) {
  const out = [{ id: l.id, nome: l.nome, citta: l.citta }];
  const s = hubSeme('grp-' + l.id);
  if (s % 4 === 0) {
    const attivi = LOCALI.filter(x => x.stato === 'active' && x.id !== l.id);
    const n = 1 + (s % 2);
    for (let k = 0; k < n; k++) {
      const alt = attivi[(s >> (3 + k * 4)) % Math.max(attivi.length, 1)];
      if (alt && !out.some(x => x.id === alt.id)) out.push({ id: alt.id, nome: alt.nome, citta: alt.citta });
    }
  }
  return out;
}

function DrwAnagrafica({ locale: l }) {
  // I campi sono QUELLI dell'onboarding (Nome del locale, indirizzo con
  // civico, CAP, città, telefono) più il profilo: quello che il locale ha
  // compilato di là si legge e si corregge qui. Il fiscale ha la SUA tab.
  // Titolare ed email NON si modificano da qui (P-73 · D-57): cambiando
  // l'email e mandando il reset l'assistenza sostituiva il titolare in due
  // gesti. Le due vie giuste: il ripristino assistito (Assistenza →
  // Ripristini accesso) restituisce l'accesso alla stessa persona; il cambio
  // di chi sta dietro il locale passa solo dal percorso di titolarità in
  // Account del titolare (restaurant_holder_changes).
  const FIELDS = ['nome','tipo','indirizzo','cap','citta','regione','tel','coperti'];
  const [form, setForm] = useStateDrw(Object.fromEntries(FIELDS.map(k => [k, l[k] ?? ''])));
  const dirty = FIELDS.some(k => String(form[k]) !== String(l[k] ?? ''));
  const [saved, setSaved] = useStateDrw(false);
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target.value })); };
  const saveForm = () => {
    Object.assign(l, { ...form, coperti: Number(form.coperti) || l.coperti });
    setSaved(true); setTimeout(()=>setSaved(false), 2200);
  };
  const Fld = ({k, label, span, monoStyle, type}) => (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={drwLab}>{label}</label>
      <input type={type || 'text'} value={form[k]} onChange={F(k)} style={monoStyle ? drwMono : drwInp}/>
    </div>
  );
  const locali = drwLocaliAssociati(l);
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
      <AdmCard padding={20}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
          <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Anagrafica locale</div>
          {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
        </div>
        {/* La carta d'identità del rapporto — codice, piano, stato, data di
            iscrizione — INCORPORATA in testa alla stessa card dei campi: è
            anagrafe anche lei, non merita una card a parte. */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div>
            <label style={drwLab}>Codice locale</label>
            <div style={{...drwMono, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              {l.id}
              <span style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:ADM.MUTED_SOFT}}>non modificabile</span>
            </div>
          </div>
          <div>
            <label style={drwLab}>Piano</label>
            <div style={{display:'flex', alignItems:'center', minHeight:36}}><AdmPlanBadge piano={l.piano}/></div>
          </div>
          <div>
            <label style={drwLab}>Stato</label>
            {/* La sospensione È lo stato, non un dettaglio di un'altra tab:
                un locale sospeso che qui si presenta «Attivo» mente. */}
            <div style={{display:'flex', alignItems:'center', minHeight:36}}>
              {(() => {
                const sosp = SOSPENSIONI.find(x => x.soggettoId === l.id && !x.revoca);
                if (sosp && sosp.sospesa) return <AdmBadge color="DANGER" size="xs">Sospeso</AdmBadge>;
                if (sosp) return <AdmBadge color="WARN" size="xs">Diffidato</AdmBadge>;
                return (
                  <AdmBadge color={l.stato === 'active' ? 'OK' : 'PLAN_FREE'} size="xs">
                    {l.stato === 'active' ? 'Attivo' : 'Inattivo'}
                  </AdmBadge>
                );
              })()}
            </div>
          </div>
          <div>
            <label style={drwLab}>Iscritto dal</label>
            <div style={{...drwInp, background:ADM.PANEL_SOFT, color:ADM.MUTED}}>{fmtDate(l.dataIscrizione)}</div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
          {Fld({k:'nome', label:'Nome del locale (insegna)', span:true})}
          {Fld({k:'tipo', label:'Tipologia'})}
          <div>
            <label style={drwLab}>Titolare</label>
            <div style={{...drwInp, background:ADM.PANEL_SOFT, color:ADM.MUTED}}>{l.titolare}</div>
          </div>
          {Fld({k:'indirizzo', label:'Indirizzo e civico', span:true})}
          {Fld({k:'cap', label:'CAP', monoStyle:true})}
          {Fld({k:'citta', label:'Città'})}
          {Fld({k:'regione', label:'Regione'})}
          {Fld({k:'coperti', label:'Coperti', type:'number'})}
          <div style={{gridColumn:'1 / -1'}}>
            <label style={drwLab}>Email del titolare</label>
            <div style={{...drwMono, background:ADM.PANEL_SOFT, color:ADM.MUTED}}>{l.email}</div>
            <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.5}}>
              Titolare ed email non si modificano da qui. Chi ha perso l'accesso passa dal ripristino assistito (Assistenza → Ripristini accesso), che restituisce l'accesso alla stessa persona; chi cambia dietro il locale passa solo dal percorso di titolarità in Account del titolare.
            </div>
          </div>
          {Fld({k:'tel', label:'Telefono', monoStyle:true})}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:14, paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
          <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={saveForm}>Salva modifiche</AdmButton>
        </div>
      </AdmCard>

      {/* L'utenza del titolare e il locale sono DUE cose: qui si dice su
          quali altri locali vale la stessa utenza — come nella scheda staff. */}
      <AdmCard padding={20}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Locali associati all'utenza</div>
          <span style={{padding:'1px 8px', borderRadius:999, background:ADM.TEAL_SOFT, color:ADM.TEAL, fontSize:12.5, fontWeight:800}}>{locali.length}</span>
        </div>
        <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, marginBottom:12}}>
          L'utenza del titolare e il locale sono due cose distinte: questo fascicolo riguarda solo {l.nome},
          ma le stesse credenziali {locali.length > 1 ? 'amministrano anche i locali qui sotto' : 'potrebbero amministrare più locali'}.
        </div>
        {locali.map((x, i) => (
          <div key={x.id} style={{
            display:'flex', alignItems:'center', gap:12, padding:'10px 0',
            borderBottom: i === locali.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
          }}>
            <div style={{width:34, height:34, borderRadius:8, background:ADM.PINK_SOFT, color:ADM.PINK, display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.store size={20}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, display:'flex', alignItems:'center', gap:7}}>
                <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{x.nome}</span>
                {i === 0 && (
                  <span style={{padding:'1px 7px', borderRadius:4, background:ADM.PINK_BG_SOFT, color:ADM.PINK_DARK, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0}}>Questo fascicolo</span>
                )}
              </div>
              <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{x.citta}</div>
            </div>
            <span style={{fontFamily:'ui-monospace,monospace', fontSize:12.6, color:ADM.MUTED}}>{x.id}</span>
          </div>
        ))}
      </AdmCard>
    </div>
  );
}

// ─── Dati fiscali — la tab dedicata ─────────────────────────────────────────
// Gli stessi campi di Impostazioni → Dati fiscali del gestionale: identità
// fiscale (P.IVA verificata AdE, regime, ATECO), fatturazione elettronica
// (SDI, PEC, REA) e incassi (IBAN gestito da Stripe). Prima vivevano in una
// mezza card dentro l'anagrafica; il fiscale è un mestiere a parte.
function DrwFiscali({ locale: l }) {
  // I campi che il mock del locale non porta si derivano stabili dall'id,
  // ricalcando i default del gestionale.
  const s = hubSeme('fis-' + l.id);
  if (l.regime === undefined) l.regime = ['Ordinario', 'Ordinario', 'Ordinario', 'Forfettario', 'Agricolo / Speciale'][s % 5];
  if (l.ateco === undefined) l.ateco = '56.10.' + String(11 + (s % 9)).padStart(2, '0');
  if (l.pec === undefined) l.pec = 'fatture@pec.' + (l.email || 'locale@x.it').split('@')[1];
  if (l.rea === undefined) l.rea = (l.citta || 'RM').slice(0, 2).toUpperCase() + '-' + (1000000 + s % 900000);
  // La sede LEGALE è un campo suo: nasce uguale all'operativa (per i più
  // coincidono) ma da qui in poi vive di vita propria — il gestionale le
  // distingue, l'operativa va sullo scontrino e la legale in fattura.
  if (l.sedeLegale === undefined) l.sedeLegale = `${l.indirizzo}, ${l.cap} ${l.citta}`;

  const FIELDS = ['piva', 'cf', 'regime', 'ateco', 'sdi', 'pec', 'rea', 'sedeLegale'];
  const [form, setForm] = useStateDrw(Object.fromEntries(FIELDS.map(k => [k, l[k] ?? ''])));
  const dirty = FIELDS.some(k => String(form[k]) !== String(l[k] ?? ''));
  const [saved, setSaved] = useStateDrw(false);
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target && e.target.value !== undefined ? e.target.value : e })); };
  const saveForm = () => { Object.assign(l, form); setSaved(true); setTimeout(()=>setSaved(false), 2200); };

  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
      <AdmCard padding={20}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
          <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Identità fiscale</div>
          {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
          <div style={{gridColumn:'1 / -1'}}>
            <label style={drwLab}>Ragione sociale</label>
            <div style={{...drwInp, background:ADM.PANEL_SOFT, color:ADM.MUTED}}>{l.nome} S.r.l.</div>
          </div>
          <div>
            <label style={drwLab}>Partita IVA</label>
            <div style={{position:'relative'}}>
              <input value={form.piva} onChange={F('piva')} style={{...drwMono, paddingRight:110}}/>
              {/* La spunta del gestionale: la P.IVA è passata dal controllo AdE. */}
              <span style={{position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:ADM.OK_SOFT, color:ADM.OK, fontSize:11, fontWeight:800}}>
                <BuIcons.check size={12}/> Verificata (AdE)
              </span>
            </div>
          </div>
          <div>
            <label style={drwLab}>Codice fiscale</label>
            <input value={form.cf} onChange={F('cf')} style={drwMono}/>
          </div>
          <div>
            <label style={drwLab}>Regime fiscale</label>
            <AdmSelect value={form.regime} onChange={F('regime')} block
              buttonStyle={{padding:'8px 11px', borderRadius:8, fontSize:13.5}}
              options={[
                {value:'Ordinario', label:'Ordinario'},
                {value:'Forfettario', label:'Forfettario'},
                {value:'Agricolo / Speciale', label:'Agricolo / Speciale'},
              ]}/>
          </div>
          <div>
            <label style={drwLab}>Codice ATECO</label>
            <input value={form.ateco} onChange={F('ateco')} style={drwMono}/>
          </div>
        </div>
      </AdmCard>

      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Fatturazione elettronica</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
          <div>
            <label style={drwLab}>Codice SDI</label>
            <input value={form.sdi} onChange={F('sdi')} style={drwMono}/>
          </div>
          <div>
            <label style={drwLab}>PEC</label>
            <input value={form.pec} onChange={F('pec')} style={drwMono}/>
          </div>
          <div>
            <label style={drwLab}>REA</label>
            <input value={form.rea} onChange={F('rea')} style={drwMono}/>
          </div>
          <div>
            <label style={drwLab}>Sede operativa</label>
            {/* Derivata dall'anagrafica: è quella stampata sullo scontrino,
                si corregge di là. */}
            <div style={{...drwInp, background:ADM.PANEL_SOFT, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title="Dall'anagrafica · stampata sullo scontrino">{l.indirizzo}, {l.cap} {l.citta}</div>
          </div>
          <div style={{gridColumn:'1 / -1'}}>
            <label style={drwLab}>Sede legale</label>
            <input value={form.sedeLegale} onChange={F('sedeLegale')} style={drwInp}/>
          </div>
        </div>
      </AdmCard>

      <AdmCard padding={20}>
        <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Incassi</div>
        <div style={{fontSize:12.5, color:ADM.MUTED, marginBottom:14}}>Le coordinate di accredito vivono su Stripe: qui si leggono, non si toccano.</div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div>
            <label style={drwLab}>IBAN</label>
            <div style={{...drwMono, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              IT60 X054 2811 1010 0000 ******78
              <span style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:ADM.MUTED_SOFT}}>gestito da Stripe</span>
            </div>
          </div>
        </div>
      </AdmCard>

      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={saveForm}>Salva modifiche</AdmButton>
      </div>
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

// ─── Statistiche — le cifre da sala del TITOLARE ────────────────────────────
// Anche l'utenza del locale prende ordini al tavolo, come un cameriere: le
// sue statistiche sono le STESSE della scheda staff — mesi di lavoro,
// scontrino medio, mancia media, e sotto l'operatività del mese.

// La mediana accanto al numero: un metro, non un giudizio. La usa questa
// scheda e la usa quella dello staff — una veste sola.
function drwVsMediana(v, m, fmt) {
  if (m == null || v == null) return null;
  return (
    <React.Fragment>
      {' · '}
      <span style={{fontWeight:700, color: v >= m ? ADM.OK : ADM.MUTED_SOFT}}>{v >= m ? '↑' : '↓'}</span>
      {' mediana ' + fmt(m)}
    </React.Fragment>
  );
}

// Le derivate da sala di un locale ATTIVO: lo scontrino è quello VERO del
// business (l.ticketMedio, lo stesso numero della Panoramica — due
// «scontrini medi» diversi nella stessa scheda erano una contraddizione),
// il resto è stabile sul seme. Una formula sola: la usano la scheda e le
// mediane qui sotto.
function drwStatSala(l) {
  const s = hubSeme('sta-' + l.id) % 1000;
  const r = (n) => ((s * (n + 1) * 9301 + 49297) % 233280) / 233280;
  return {
    scontrino: l.ticketMedio || 14 + Math.round(r(1) * 52) / 2,
    mancia: Math.round((0.8 + r(2) * 3.4) * 10) / 10,
    ordiniMese: 40 + Math.floor(r(3) * 280),
    coperti: 60 + Math.floor(r(4) * 380),
  };
}
const DRW_STA_MEDIANE = (() => {
  const med = (a) => {
    const v = a.filter(x => x != null).sort((x, y) => x - y);
    if (!v.length) return null;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  };
  const righe = LOCALI.filter(x => x.stato === 'active').map(drwStatSala);
  return {
    scontrino: med(righe.map(x => x.scontrino)),
    mancia: med(righe.map(x => x.mancia)),
    ordiniMese: med(righe.map(x => x.ordiniMese)),
    coperti: med(righe.map(x => x.coperti)),
  };
})();

function DrwStatisticheLocale({ locale: l }) {
  // La tab tiene INSIEME due cose che non vanno confuse, e le etichetta:
  // i dati del LOCALE (l'ex tab Panoramica: il business) e i dati da
  // CAMERIERE dell'utenza del titolare (la persona al tavolo, le stesse
  // cifre della scheda staff).
  const sezione = (titolo, sub) => (
    <div>
      <div style={{fontSize:11.5, fontWeight:800, letterSpacing:'0.07em', textTransform:'uppercase', color:ADM.MUTED_SOFT}}>{titolo}</div>
      <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:2}}>{sub}</div>
    </div>
  );
  const st = drwStatSala(l);
  const mesi = Math.max(1, Math.floor((Date.now() - l.dataIscrizione.getTime()) / (30.44 * 86400000)));
  // camEur2 è il formatter delle cifre da sala (admin-camerieri): al centesimo.
  return (
    <div>
      <div style={{padding:'20px 24px 0'}}>
        {sezione('Dati del locale', 'Come va il business: volumi, adozione digitale, funnel.')}
      </div>
      {/* L'ex Panoramica, per intero: vive qui dentro, non in una tab sua. */}
      <DrwPanoramica locale={l}/>

      <div style={{padding:'0 24px 14px'}}>
        {sezione('Dati da cameriere', 'L\'utenza del titolare al tavolo — le stesse cifre della scheda staff: la persona, non il business.')}
      </div>
      {!DRW_STATI_LIVE.includes(l.stato) ? (
        // Un locale che non ha mai lavorato non prende ordini: la sezione
        // dice perché è vuota invece di inventare un titolare che serve
        // tavoli. Gli stati live invece le cifre le HANNO — anche skipped e
        // inactive: i grafici qui sopra ne mostrano ordini e fatturato, e
        // una sezione che li dichiara «non operativi» li smentirebbe.
        <div style={{padding:'0 24px 24px'}}>
          <AdmCard padding={0}>
            <AdmEmpty icon="receipt" title="Nessuna cifra da sala"
              desc={l.stato === 'churned'
                ? 'Il contratto è cessato: le cifre da sala si sono fermate con il servizio.'
                : 'Il locale non è ancora operativo: quando comincerà a lavorare, qui compariranno scontrino, mance e ordini del titolare.'}/>
          </AdmCard>
        </div>
      ) : (
        <div style={{padding:'0 24px 24px', display:'flex', flexDirection:'column', gap:14}}>
          <AdmCard padding={0}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
              <MiniStat first label="Mesi di lavoro" value={fmtNum(mesi)} sub={'Dal ' + fmtDate(l.dataIscrizione)}/>
              <MiniStat label="Scontrino medio" value={camEur2(st.scontrino)}
                sub={<React.Fragment>Per ordine preso{drwVsMediana(st.scontrino, DRW_STA_MEDIANE.scontrino, camEur2)}</React.Fragment>}/>
              <MiniStat label="Mancia media" value={camEur2(st.mancia)}
                sub={<React.Fragment>Per conto chiuso{drwVsMediana(st.mancia, DRW_STA_MEDIANE.mancia, camEur2)}</React.Fragment>}/>
            </div>
          </AdmCard>
          <AdmCard padding={0}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
              <MiniStat first label="Ordini mese" value={fmtNum(st.ordiniMese)}
                sub={<React.Fragment>Presi al tavolo{drwVsMediana(st.ordiniMese, DRW_STA_MEDIANE.ordiniMese, fmtNum)}</React.Fragment>}/>
              <MiniStat label="Coperti gestiti" value={fmtNum(st.coperti)}
                sub={<React.Fragment>Mese corrente{drwVsMediana(st.coperti, DRW_STA_MEDIANE.coperti, fmtNum)}</React.Fragment>}/>
            </div>
          </AdmCard>
        </div>
      )}
    </div>
  );
}

// ─── Consensi — la card e il pannello condivisi ─────────────────────────────
// Lo stesso vestito della scheda utente app. La CARD da sola la monta la tab
// «Contratti e consensi» del locale (i documenti li elenca già il fascicolo);
// il PANNELLO completo (card + documenti) lo usa lo staff.
// Righe {id, label, desc, deciso, ok, quando, versione}.
function DrwConsensiCard({ righe, nota }) {
  return (
    <AdmCard padding={0}>
      <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Consensi espressi</div>
        <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Lo stato corrente per ciascun codice, con la versione dell'informativa contro cui vale.</div>
      </div>
      {righe.map((c) => (
        <div key={c.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
          <span style={{fontFamily:'ui-monospace,monospace', fontSize:12.5, fontWeight:700, color:ADM.TEXT, width:52, flexShrink:0}}>{c.id}</span>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{c.label}</div>
            <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{c.desc}</div>
          </div>
          <div style={{textAlign:'right', flexShrink:0}}>
            {c.deciso
              ? <span style={{padding:'3px 10px', borderRadius:5, background: c.ok ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: c.ok ? ADM.OK : ADM.MUTED, fontSize:13, fontWeight:700}}>{c.ok ? 'Sì' : 'No'}</span>
              : <span style={{padding:'3px 10px', borderRadius:5, background:ADM.NEUTRAL_SOFT, color:ADM.MUTED_SOFT, fontSize:13, fontWeight:700}}>Mai chiesto</span>}
            {c.deciso && <div style={{fontSize:12, color:ADM.MUTED, marginTop:3}}>{fmtDate(c.quando)} · Informativa v{c.versione}</div>}
          </div>
        </div>
      ))}
      {nota && (
        <div style={{padding:'11px 20px', fontSize:12.5, color:ADM.MUTED_SOFT, lineHeight:1.5}}>{nota}</div>
      )}
    </AdmCard>
  );
}

function DrwConsensiPannello({ righe, documenti, nota }) {
  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
      <DrwConsensiCard righe={righe} nota={nota}/>

      <AdmCard padding={0}>
        <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Documenti sottoscritti</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Le versioni contro cui valgono i consensi qui sopra.</div>
        </div>
        {documenti.map((d, i, arr) => (
          <div key={d.nome} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{width:34, height:34, borderRadius:8, background:ADM.PINK_SOFT, color:ADM.PINK, display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.filePdf size={18}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{d.nome} <span style={{fontFamily:'ui-monospace,monospace', fontSize:12, color:ADM.MUTED, fontWeight:600}}>v{d.versione}</span></div>
              <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{d.nota}</div>
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div style={{fontSize:12.6, color:ADM.MUTED}}>{fmtDate(d.quando)}</div>
              {d.rif && <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:2}}>{d.rif}</div>}
            </div>
          </div>
        ))}
      </AdmCard>
    </div>
  );
}

// ─── Consensi del locale ────────────────────────────────────────────────────
// Lo stato di email e SMS è LO STESSO delle proprietà CRM della rubrica
// (stesse formule di hubArricchisci sul seme della riga 'loc-…'): il filtro
// «Consenso email è sì» e la scheda non possono raccontare due cose diverse.
// La card vive DENTRO «Contratti e consensi»: consensi e contratti sono lo
// stesso fascicolo — che cosa ha firmato, a che cosa ha detto sì.
function drwConsensiLocale(l) {
  const s = hubSeme('loc-' + l.id);
  const giorno = (k, max) => new Date(Math.min(Date.now() - 86400000,
    l.dataIscrizione.getTime() + ((s >> k) % max) * 86400000));
  return [
    { id: 'M-EM',  label: 'Comunicazioni commerciali via email',
      desc: 'Novità di prodotto, promozioni e newsletter ai referenti del locale',
      deciso: true, ok: s % 5 !== 0, quando: giorno(2, 120), versione: '1.0' },
    { id: 'M-SMS', label: 'Comunicazioni via SMS',
      desc: 'Avvisi commerciali sul numero del locale',
      deciso: true, ok: s % 3 === 0, quando: giorno(4, 120), versione: '1.0' },
    { id: 'M-REF', label: 'Nome e logo come referenza',
      desc: 'Uso del locale nei materiali marketing di byup (case study, sito)',
      deciso: s % 7 !== 0, ok: s % 7 !== 0 && s % 4 === 0, quando: giorno(6, 200), versione: '1.0' },
  ];
}
const DRW_CONSENSI_NOTA = 'Le comunicazioni di servizio (fatture, avvisi tecnici, sicurezza) viaggiano senza consenso: sono esecuzione del contratto.';

// ─── Account — la gestione del rapporto ─────────────────────────────────────
// La sospensione del servizio stava dentro Contratti, ma quella tab è un
// fascicolo che si LEGGE: l'azione di gestione vive qui, con il suo popup
// (motivo tipizzato art. 13, nota obbligatoria) e la scrittura nell'audit.
function DrwAccount({ locale: l }) {
  const [, ridisegna] = useStateDrw(0);
  const [popup, setPopup] = useStateDrw(false);        // 'sospendi' | 'revoca' | false
  const [motivo, setMotivo] = useStateDrw('morosita');
  const [nota, setNota] = useStateDrw('');
  const [resetInviato, setResetInviato] = useStateDrw(false);
  const [exportAvviato, setExportAvviato] = useStateDrw(false);
  const sospAttiva = SOSPENSIONI.find(x => x.soggettoId === l.id && !x.revoca);

  const scrivi = (action, target, icon, color, tipo = 'contratto') => {
    AUDIT_EVENTS.unshift({
      who: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu',
      action, target, icon, color, tipo, when: new Date(),
    });
  };
  const attivaVetrina = () => {
    l.vetrinaSpeciale = { dal: new Date(), decisaDa: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu' };
    scrivi('ha messo in vetrina speciale', l.nome, 'sparkles', 'PURPLE', 'locale');
    ridisegna(x => x + 1);
  };
  const spegniVetrina = () => {
    l.vetrinaSpeciale = null;
    scrivi('ha tolto dalla vetrina speciale', l.nome, 'x', 'WARN', 'locale');
    ridisegna(x => x + 1);
  };
  const confermaSospensione = () => {
    if (!nota.trim()) return;
    // Art. 4 contro art. 13: la morosità passa dalla diffida (la sospensione
    // scatta da sola 15 giorni dopo), gli altri motivi sono immediati.
    const ora = new Date();
    SOSPENSIONI.unshift(motivo === 'morosita'
      ? { soggettoId:l.id, motivo, nota:nota.trim(), diffida:ora, sospesa:null, decisaDa:(TEAM.find(t=>t.isYou)||{}).nomeCompleto || 'Tu', revoca:null }
      : { soggettoId:l.id, motivo, nota:nota.trim(), diffida:null, sospesa:ora, decisaDa:(TEAM.find(t=>t.isYou)||{}).nomeCompleto || 'Tu', revoca:null });
    scrivi(motivo === 'morosita' ? 'ha inviato la diffida a' : 'ha sospeso il servizio di',
      `${l.nome} · ${ctrMotivoLabel(motivo)}`, 'lock', 'DANGER');
    setPopup(false); setNota(''); ridisegna(x => x + 1);
  };
  const confermaRevoca = () => {
    if (!nota.trim() || !sospAttiva) return;
    sospAttiva.revoca = { quando:new Date(), who:(TEAM.find(t=>t.isYou)||{}).nomeCompleto || 'Tu', nota:nota.trim() };
    scrivi('ha revocato la sospensione di', l.nome, 'check', 'OK');
    setPopup(false); setNota(''); ridisegna(x => x + 1);
  };

  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
      {/* Le credenziali del titolare: il reset parte verso il recapito CENSITO,
          che da qui non si modifica (P-73 · D-57) — è la frase della voce
          applicata dove il pulsante esisteva davvero. */}
      <AdmCard padding={18}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220}}>
            <div style={{fontSize:14.2, fontWeight:700, color:ADM.TEXT}}>Reset password del titolare</div>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2}}>
              {resetInviato
                ? <span style={{color:ADM.OK, fontWeight:700}}>✓ Email di reset inviata a {l.email}</span>
                : `Invia un link di reimpostazione a ${l.email} · recapito censito, non modificabile da qui`}
            </div>
          </div>
          <AdmButton variant="secondary" size="sm" icon="mail" disabled={resetInviato} onClick={()=>setResetInviato(true)}>Invia email di reset</AdmButton>
        </div>
      </AdmCard>

      {/* L'esportazione: la portabilità non aspetta la cessazione — e a
          contratto cessato è la finestra dei 60 giorni dell'art. 5. */}
      <AdmCard padding={18}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220}}>
            <div style={{fontSize:14.2, fontWeight:700, color:ADM.TEXT}}>Esportazione dati</div>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2, lineHeight:1.5}}>
              {exportAvviato
                ? <span style={{color:ADM.OK, fontWeight:700}}>✓ Export in preparazione: il link arriva a {l.email}</span>
                : 'Menu, ordini e anagrafiche del locale in un archivio. A contratto cessato resta la finestra di 60 giorni (art. 5).'}
            </div>
          </div>
          <AdmButton variant="secondary" size="sm" icon="download" disabled={exportAvviato} onClick={()=>setExportAvviato(true)}>Genera export</AdmButton>
        </div>
      </AdmCard>

      {/* La vetrina speciale: il posto in evidenza nella scoperta dell'app
          consumer. È una leva NOSTRA, non un'opzione del gestionale — si
          accende e si spegne solo da qui, e ogni cambio resta a registro
          come le altre decisioni sul locale. */}
      <AdmCard padding={18}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{fontSize:14.2, fontWeight:700, color:ADM.TEXT}}>Vetrina speciale</div>
              {l.vetrinaSpeciale && (
                <span style={{fontSize:10.5, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase',
                  color:ADM.PURPLE, background:ADM.PURPLE_SOFT, padding:'3px 8px', borderRadius:20}}>Attiva</span>
              )}
            </div>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2, lineHeight:1.5}}>
              {l.vetrinaSpeciale
                ? <span>In evidenza nell'app dal <b style={{color:ADM.TEXT}}>{fmtDate(l.vetrinaSpeciale.dal)}</b> · attivata da {l.vetrinaSpeciale.decisaDa}</span>
                : 'Mette il locale in evidenza nella scoperta dell\'app consumer. Si decide da Hubble, non dal gestionale, e resta accesa finché qualcuno di noi non la spegne.'}
            </div>
          </div>
          {l.vetrinaSpeciale
            ? <AdmButton variant="secondary" size="sm" icon="x" onClick={spegniVetrina}>Togli dalla vetrina</AdmButton>
            : <AdmButton variant="primary" size="sm" icon="sparkles" onClick={attivaVetrina}>Metti in vetrina</AdmButton>}
        </div>
      </AdmCard>

      <AdmCard padding={18}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220}}>
            <div style={{fontSize:14.2, fontWeight:700, color:ADM.TEXT}}>Sospensione del servizio</div>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2, lineHeight:1.5}}>
              {sospAttiva
                ? (sospAttiva.sospesa
                    ? `In corso dal ${fmtDate(sospAttiva.sospesa)} · ${ctrMotivoLabel(sospAttiva.motivo)} · decisa da ${sospAttiva.decisaDa}`
                    : `Diffida del ${fmtDate(sospAttiva.diffida)} · la sospensione scatta il ${fmtDate(new Date(sospAttiva.diffida.getTime() + 15 * 86400000))}`)
                : 'Nessuna sospensione in corso. Motivi tipizzati dall\'art. 13; la morosità passa dalla diffida dell\'art. 4. Ogni decisione resta a registro nei Contratti.'}
            </div>
          </div>
          {sospAttiva
            ? <AdmButton variant="secondary" size="sm" icon="check" onClick={() => { setPopup('revoca'); setNota(''); }}>Revoca sospensione</AdmButton>
            : <AdmButton variant="danger" size="sm" icon="lock" onClick={() => { setPopup('sospendi'); setNota(''); setMotivo('morosita'); }}>Sospendi</AdmButton>}
        </div>
      </AdmCard>

      {/* Sospensione / revoca: motivo da elenco CHIUSO e nota OBBLIGATORIA —
          un'azione che tocca un contratto senza una ragione scritta non è
          auditabile. */}
      {popup && (
        <div onClick={() => setPopup(false)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e => e.stopPropagation()} style={{width:460, maxWidth:'94%', background:'#fff', borderRadius:14,
            boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease', padding:22}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>
              {popup === 'revoca' ? 'Revoca la sospensione' : 'Sospendi il servizio'}
            </div>
            <div style={{fontSize:12.8, color:ADM.MUTED, marginBottom:14, lineHeight:1.5}}>
              {popup === 'revoca'
                ? 'La revoca riattiva il servizio e resta a registro con la sua motivazione.'
                : 'Per la morosità parte la diffida: la sospensione scatta da sola dopo 15 giorni (art. 4). Gli altri motivi sospendono con effetto immediato (art. 13).'}
            </div>
            {popup === 'sospendi' && (
              <div style={{marginBottom:12}}>
                <span style={drwLab}>Motivo (art. 13)</span>
                <AdmSelect value={motivo} onChange={setMotivo} options={CTR_MOTIVI} block/>
              </div>
            )}
            <div style={{marginBottom:14}}>
              <span style={drwLab}>Nota obbligatoria</span>
              <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3}
                placeholder={popup === 'revoca' ? 'Perché il motivo è rientrato' : 'I fatti che motivano la decisione'}
                style={Object.assign({}, drwInp, {resize:'vertical'})}/>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="ghost" size="sm" onClick={() => setPopup(false)}>Annulla</AdmButton>
              {popup === 'revoca'
                ? <AdmButton variant="primary" size="sm" icon="check" disabled={!nota.trim()} onClick={confermaRevoca}>Revoca</AdmButton>
                : <AdmButton variant="danger" size="sm" icon="lock" disabled={!nota.trim()} onClick={confermaSospensione}>
                    {motivo === 'morosita' ? 'Invia diffida' : 'Sospendi ora'}
                  </AdmButton>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
window.DrwConsensiPannello = DrwConsensiPannello;

// ─── Log — gli eventi del locale, nella veste della scheda utente app ───────
// Niente icone: un log si scandisce per testo e data, con la chiave tecnica
// in chiaro — la stessa che si ritrova negli export — e il filtro per data.
const DRW_EVENTI = {
  order_received:        'Ordine ricevuto',
  reservation_confirmed: 'Prenotazione confermata',
  staff_login:           'Accesso al gestionale',
  menu_updated:          'Menu aggiornato',
  support_request:       'Richiesta di assistenza',
  plan_subscribed:       'Piano sottoscritto',
  payout_sent:           'Accredito incassi',
};

function DrwAttivita({ locale: l }) {
  // Deterministico sul seme del locale, con i due eventi VERI in mezzo:
  // l'ultimo login del titolare e la sottoscrizione del piano. Gli eventi
  // OPERATIVI (ordini, prenotazioni, accrediti) esistono per gli stati live
  // che ordinano davvero — anche skipped e inactive, le stesse Statistiche
  // ne graficano i volumi — ma non per un pending o un cessato: «ordine
  // ricevuto 3 ore fa» lì contraddirebbe lo stato che il log deve provare.
  // Il gate sugli ordini copre il live a volume zero: grafici piatti e log
  // pieno di ordini sarebbero la stessa contraddizione al contrario.
  const eventi = (() => {
    const s = hubSeme('log-' + l.id) % 1000;
    const r = (n) => ((s * (n + 1) * 9301 + 49297) % 233280) / 233280;
    const out = [];
    const push = (tipo, quando, dettaglio) => out.push({ id: l.id + '-E' + out.length, tipo, quando, dettaglio });
    if (DRW_STATI_LIVE.includes(l.stato) && l.ordiniGiorno > 0) {
      let ore = 1 + Math.floor(r(1) * 12);
      const n = 9 + Math.floor(r(2) * 6);
      for (let i = 0; i < n; i++) {
        const rr = r(10 + i * 3);
        const tipo = ['order_received', 'order_received', 'order_received', 'reservation_confirmed', 'menu_updated', 'staff_login', 'payout_sent'][Math.floor(rr * 6.999)];
        const dett = {
          order_received:        `#${2800 + Math.floor(rr * 90)} · € ${(14 + rr * 52).toFixed(2).replace('.', ',')}`,
          reservation_confirmed: `${2 + Math.floor(rr * 6)} persone · ${19 + Math.floor(rr * 3)}:${rr < 0.5 ? '30' : '00'}`,
          menu_updated:          `${1 + Math.floor(rr * 4)} piatti nuovi`,
          staff_login:           `${l.titolare}`,
          payout_sent:           `€ ${(180 + rr * 900).toFixed(2).replace('.', ',')} · Stripe`,
        }[tipo];
        push(tipo, new Date(Date.now() - ore * 3600000), dett);
        ore += 3 + Math.floor(r(11 + i * 3) * 40);
      }
      if (r(90) < 0.4) push('support_request', new Date(Date.now() - (40 + Math.floor(r(91) * 400)) * 3600000), 'Stampante scontrini');
    }
    push('staff_login', l.lastLogin, l.titolare);
    push('plan_subscribed', l.dataIscrizione, (PIANI.find(p => p.id === l.piano) || {}).label || l.piano);
    return out.sort((a, b) => b.quando - a.quando);
  })();

  const [dal, setDal] = useStateDrw('');
  const [al, setAl] = useStateDrw('');
  const filtrati = eventi.filter(e =>
    (!dal || e.quando >= new Date(dal)) &&
    (!al || e.quando < new Date(new Date(al).getTime() + 86400000)));

  return (
    <div style={{padding:'20px 24px'}}>
      <AdmCard padding={0}>
        <div style={{padding:'14px 20px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Eventi tracciati</div>
          <div style={{fontSize:13, color:ADM.MUTED}}>
            {(dal || al) ? `${filtrati.length} di ${eventi.length}` : `${eventi.length} eventi dal ${fmtDate(eventi[eventi.length - 1].quando)}`}
          </div>
          <div style={{flex:1}}/>
          <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Dal</span>
          <input type="date" value={dal} onChange={e=>setDal(e.target.value)} style={{
            padding:'6px 9px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
            fontSize:12.8, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
          }}/>
          <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Al</span>
          <input type="date" value={al} onChange={e=>setAl(e.target.value)} style={{
            padding:'6px 9px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
            fontSize:12.8, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
          }}/>
          {(dal || al) && (
            <button className="adm-textlink" onClick={()=>{ setDal(''); setAl(''); }} style={{
              background:'transparent', border:'none', color:ADM.PINK_DARK, fontSize:12.5, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
            }}>Azzera</button>
          )}
        </div>
        {filtrati.length === 0 && (
          <div style={{padding:'26px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>Nessun evento tra le date scelte.</div>
        )}
        {filtrati.map((e, i) => (
          <div key={e.id} style={{
            display:'flex', alignItems:'center', gap:12, padding:'11px 20px',
            borderBottom: i === filtrati.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            background: i % 2 === 1 ? ADM.ROW_STRIPE : 'transparent',
          }}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{DRW_EVENTI[e.tipo] || e.tipo}</div>
              <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.dettaglio}</div>
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT}}>{e.tipo}</div>
              <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2}}>{fmtDateTime(e.quando)}</div>
            </div>
          </div>
        ))}
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
    // mrr = canone + extra correnti (così nasce in admin-data): cambiare
    // piano non azzera gli extra, o la card sotto li dichiarerebbe ancora.
    l.piano = nuovo.id; l.mrr = nuovo.price + (l.extras || 0);
    flash(`Piano aggiornato a ${nuovo.label}`);
    closePopup(); forceRender(x => x + 1);
  };
  const inp = {width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
  const lab = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};
  // Lo storico è storico: importi congelati al primo render — se seguissero
  // l.mrr, un cambio piano riprezzerebbe all'istante fatture di tre mesi fa,
  // smentendo la modale che promette «dal prossimo ciclo». E il prefisso del
  // numero segue l'anno della data ri-ancorata a runtime: scritto a mano,
  // dichiarerebbe un anno mentre la data accanto ne mostra un altro.
  const [fatture] = useStateDrw(() => [
    { prog: 142, gg: 5 }, { prog: 118, gg: 35 }, { prog: 94, gg: 65 }, { prog: 71, gg: 95 },
  ].map(({ prog, gg }) => {
    const data = new Date(Date.now() - 86400000 * gg);
    return { num: `${data.getFullYear()}-${String(prog).padStart(4, '0')}`, data, importo: l.mrr, stato: 'paid' };
  }));
  // Il PDF nel mock non esiste: come per le certificazioni, il download
  // consegna un segnaposto nominato dalla fattura — il gesto è completo
  // senza fingere il contenuto.
  const scaricaFattura = (f) => {
    const blob = new Blob([`Fattura ${f.num} · ${l.nome} · ${fmtDate(f.data)} · ${fmtEur(f.importo)} (mock Hubble)`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fattura-${f.num}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
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
          {/* La sospensione non sta più qui: è gestione del rapporto e vive
              nella tab Account, col suo motivo tipizzato e la nota. */}
          <AdmButton variant="secondary" size="sm" onClick={()=>setPopup('piano')}>Cambia piano</AdmButton>
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
            {/* L'ultimo addebito è quello della fattura più recente, non il
                mrr corrente: dopo un cambio piano i due divergono. */}
            <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>Rimborso manuale a {l.nome} via Stripe · ultimo addebito {fmtEur(fatture[0].importo)}</div>
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
              <AdmIconBtn icon="download" label="Scarica" onClick={() => scaricaFattura(f)}/>
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

function DrwCertificazioni({ locale: l, onCambia }) {
  const [, tick] = useStateDrw(0);
  // Ogni scrittura ridisegna QUI e avvisa il drawer (il badge della tab
  // conta le certificazioni: se ne elimini una deve muoversi subito).
  const ridisegna = () => { tick(x => x + 1); onCambia && onCambia(); };
  // 'rifiuta' | 'elimina' | 'scadenza' — sempre con la certificazione dentro.
  const [popup, setPopup] = useStateDrw(null);
  const [motivo, setMotivo] = useStateDrw('');
  const [dataScad, setDataScad] = useStateDrw('');
  const [feedback, setFeedback] = useStateDrw(null);
  const flash = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(null), 2600); };
  const chiudi = () => { setPopup(null); setMotivo(''); setDataScad(''); };
  const io = () => (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu';
  const oggi = new Date().toISOString().slice(0, 10);

  // La stessa pratica vive anche come ticket in Assistenza (stesso id):
  // una decisione presa QUI deve arrivare anche là, o le due superfici
  // raccontano due storie. (Il verso opposto lo fa updateItem dei Ticket.)
  const sincronizzaTicket = (c, patch) => {
    if (typeof COMUNICAZIONI === 'undefined') return;
    const t = COMUNICAZIONI.find(x => x.id === c.id);
    if (t) Object.assign(t, patch);
  };

  // «Scaduta» non è uno stato che qualcuno scrive: è l'orologio. Si deriva,
  // così una cert approvata col certificato scaduto non si presenta valida.
  const scaduta = (c) => c.stato === 'approvata' && c.scadenzaCert && c.scadenzaCert.getTime() < Date.now();

  const certs = CERTIFICAZIONI.filter(c => c.localeId === l.id)
    .slice().sort((a, b) => b.dataInvio - a.dataInvio);

  // Il PDF nel mock non esiste: il download consegna un segnaposto col nome
  // vero del file, così il gesto è completo senza fingere il contenuto.
  const scarica = (c) => {
    const blob = new Blob([`Copia del documento ${c.file} · certificazione ${c.id} di ${l.nome} (mock Hubble)`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = c.file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const approva = (c) => {
    c.stato = 'approvata'; c.revisedAt = new Date(); c.revisedBy = io(); c.motivo = null;
    sincronizzaTicket(c, { stato: 'approvata', revisedAt: c.revisedAt, revisedBy: c.revisedBy, motivo: null });
    flash(`${c.file} approvata — anche il ticket in Assistenza si chiude`); ridisegna();
  };
  const confermaRifiuto = () => {
    if (!motivo.trim() || !popup) return;
    const c = popup.cert;
    c.stato = 'rifiutata'; c.revisedAt = new Date(); c.revisedBy = io(); c.motivo = motivo.trim();
    sincronizzaTicket(c, { stato: 'rifiutata', revisedAt: c.revisedAt, revisedBy: c.revisedBy, motivo: c.motivo });
    flash(`${c.file} rifiutata — anche il ticket in Assistenza si chiude`); chiudi(); ridisegna();
  };
  const confermaElimina = () => {
    if (!popup) return;
    const i = CERTIFICAZIONI.indexOf(popup.cert);
    if (i >= 0) CERTIFICAZIONI.splice(i, 1);
    if (typeof COMUNICAZIONI !== 'undefined') {
      const j = COMUNICAZIONI.findIndex(x => x.id === popup.cert.id);
      if (j >= 0) COMUNICAZIONI.splice(j, 1);
    }
    flash('Certificazione eliminata dal fascicolo e dai Ticket'); chiudi(); ridisegna();
  };
  const confermaScadenza = () => {
    // Una scadenza nel passato non si «imposta»: al massimo si constata.
    if (!dataScad || dataScad < oggi || !popup) return;
    popup.cert.scadenzaCert = new Date(dataScad);
    sincronizzaTicket(popup.cert, { scadenzaCert: popup.cert.scadenzaCert });
    flash(`Scadenza impostata al ${fmtDate(new Date(dataScad))}`); chiudi(); ridisegna();
  };

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
      {feedback && (
        <div style={{padding:'9px 14px', background:ADM.OK_SOFT, borderRadius:9, fontSize:13, color:'#065F46', fontWeight:600}}>✓ {feedback}</div>
      )}
      {certs.map(c => {
        const tipo = CERT_TIPI[c.tipo] || { label: c.tipo, ente: '—' };
        const st = scaduta(c)
          ? { label: 'Scaduta', color: 'WARN' }
          : CERT_STATI_DRW[c.stato] || { label: c.stato, color: 'PLAN_FREE' };
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
            {/* Il documento SI SCARICA: la riga porta il suo bottone. */}
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:ADM.PANEL_SOFT, borderRadius:9, marginBottom:4}}>
              <BuIcons.filePdf size={18} color={ADM.PINK}/>
              <span style={{flex:1, minWidth:0, fontFamily:'ui-monospace,monospace', fontSize:12.6, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.file} <span style={{color:ADM.MUTED_SOFT}}>({c.size})</span></span>
              <AdmButton variant="ghost" size="sm" icon="download" onClick={() => scarica(c)}>Scarica</AdmButton>
            </div>
            <DataRow label="Inviata il" value={fmtDate(c.dataInvio)}/>
            {c.scadenzaCert && <DataRow label="Scade il" value={
              scaduta(c)
                ? <span style={{color:ADM.DANGER, fontWeight:700}}>{fmtDate(c.scadenzaCert)} — scaduta</span>
                : fmtDate(c.scadenzaCert)
            }/>}
            {c.revisedAt && <DataRow label="Revisionata il" value={`${fmtDate(c.revisedAt)} · ${c.revisedBy}`} last={!c.motivo}/>}
            {/* Il motivo del rifiuto per esteso: è la risposta alla domanda
                con cui si apre questo fascicolo — «perché non è passata?» */}
            {c.motivo && (
              <div style={{marginTop:12, padding:'10px 13px', borderRadius:9, background:ADM.DANGER_SOFT, color:ADM.DANGER, fontSize:12.8, lineHeight:1.5, fontWeight:500}}>
                {c.motivo}
              </div>
            )}
            {/* Le azioni: in revisione si decide (approva / rifiuta con
                motivo); in QUALUNQUE stato si può impostare la scadenza o
                eliminare la certificazione dal fascicolo. */}
            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:14, paddingTop:12, borderTop:`1px solid ${ADM.BORDER_SOFT}`, flexWrap:'wrap'}}>
              {c.stato === 'pending' && (
                <React.Fragment>
                  <AdmButton variant="primary" size="sm" icon="check" onClick={() => approva(c)}>Approva</AdmButton>
                  <AdmButton variant="danger" size="sm" icon="x" onClick={() => { setPopup({ tipo: 'rifiuta', cert: c }); setMotivo(''); }}>Rifiuta…</AdmButton>
                </React.Fragment>
              )}
              <div style={{flex:1}}/>
              <AdmButton variant="ghost" size="sm" icon="calendar" onClick={() => { setPopup({ tipo: 'scadenza', cert: c }); setDataScad(c.scadenzaCert ? c.scadenzaCert.toISOString().slice(0, 10) : ''); }}>Imposta scadenza…</AdmButton>
              <AdmButton variant="ghost" size="sm" icon="trash" onClick={() => setPopup({ tipo: 'elimina', cert: c })}>Elimina…</AdmButton>
            </div>
          </AdmCard>
        );
      })}

      {/* ═══ Popup: rifiuto (motivo obbligatorio) / eliminazione / scadenza ═══ */}
      {popup && (
        <div onClick={chiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e => e.stopPropagation()} style={{width:440, maxWidth:'94%', background:'#fff', borderRadius:14,
            boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease', padding:22}}>
            {popup.tipo === 'rifiuta' && (
              <React.Fragment>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rifiuta la certificazione</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginBottom:14, lineHeight:1.5}}>
                  {popup.cert.file} · il locale riceve una notifica col motivo, che resta scritto nel fascicolo.
                </div>
                <span style={drwLab}>Motivo (obbligatorio)</span>
                <textarea autoFocus value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
                  placeholder="Es. documento scaduto, ente non riconosciuto, file illeggibile…"
                  style={{...drwInp, resize:'vertical', marginBottom:14}}/>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={chiudi}>Annulla</AdmButton>
                  <AdmButton variant="danger" size="md" icon="x" disabled={!motivo.trim()} onClick={confermaRifiuto}>Rifiuta certificazione</AdmButton>
                </div>
              </React.Fragment>
            )}
            {popup.tipo === 'elimina' && (
              <React.Fragment>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Eliminare la certificazione?</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginBottom:16, lineHeight:1.5}}>
                  {popup.cert.file} sparisce dal fascicolo di {l.nome} e dai badge sulle superfici pubbliche. L'azione non si annulla.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={chiudi}>Annulla</AdmButton>
                  <AdmButton variant="danger" size="md" icon="trash" onClick={confermaElimina}>Elimina</AdmButton>
                </div>
              </React.Fragment>
            )}
            {popup.tipo === 'scadenza' && (
              <React.Fragment>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Imposta la data di scadenza</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginBottom:14, lineHeight:1.5}}>
                  {popup.cert.file} · alla scadenza il workflow «Certificazioni» avvisa il locale 15 giorni prima.
                </div>
                <span style={drwLab}>Scade il</span>
                {/* min = oggi: una scadenza nel passato non si imposta. */}
                <input type="date" autoFocus min={oggi} value={dataScad} onChange={e => setDataScad(e.target.value)} style={{...drwInp, marginBottom: dataScad && dataScad < oggi ? 6 : 14}}/>
                {dataScad && dataScad < oggi && (
                  <div style={{fontSize:12.5, color:ADM.DANGER, fontWeight:600, marginBottom:10}}>La data è nel passato: scegli una scadenza da oggi in avanti.</div>
                )}
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={chiudi}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" disabled={!dataScad || dataScad < oggi} onClick={confermaScadenza}>Imposta scadenza</AdmButton>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      )}
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

// ─── Contratti — il fascicolo contrattuale ──────────────────────────────────
// L'evidenza che si esibisce in un contenzioso o a un auditor P2B: che cosa
// questo contatto aveva accettato, in quale versione, e se il preavviso
// dovuto è stato dato nei termini. Da qui NON si accetta niente:
// un'accettazione nasce dal gesto del cliente, non da un operatore interno.
// L'unica azione scrivibile è la sospensione (o la sua revoca).
//
// Il pannello interno lavora su (soggetto, codici): quando arriveranno le tab
// di staff e utenti app basterà passare CONTRATTI_PER_TIPO.staff / .utente.

// Art. 13: elenco CHIUSO. Il motivo tipizzato è ciò che rende la sospensione
// difendibile — un testo libero non si audita.
const CTR_MOTIVI = [
  { value:'morosita',          label:'Morosità (art. 4)' },
  { value:'uso-illecito',      label:'Uso illecito o pregiudizievole' },
  { value:'ordine-autorita',   label:'Ordine dell\'autorità' },
  { value:'rischio-sicurezza', label:'Rischio di sicurezza' },
];
const ctrMotivoLabel = (v) => (CTR_MOTIVI.find(m => m.value === v) || { label: v }).label;

const ctrDoc = (codice) => DOCUMENTI.find(d => d.codice === codice);
const ctrCorrente = (doc) => doc.versioni ? doc.versioni[doc.versioni.length - 1] : null;
const ctrGiorni = (d) => Math.ceil((d.getTime() - Date.now()) / 86400000);

// L'ultima accettazione per documento: è LEI la versione che vincola.
function ctrAccettazione(sogId, codice) {
  return ACCETTAZIONI.filter(a => a.soggettoId === sogId && a.codice === codice)
    .sort((a, b) => b.quando - a.quando)[0] || null;
}

// «Scaduto senza risposta» non è un evento, è l'assenza di uno: si deriva
// dall'orologio, mai dai mock — un «in corso» con la data passata mentirebbe
// alla prima ricarica.
function ctrEsito(p) {
  if (p.esito !== 'in-corso') return p.esito;
  return Date.now() < p.efficace.getTime() ? 'in-corso' : 'scaduto';
}
// Lo stato in cima: i problemi attivi in ordine di gravità. Il banner prende
// colore e frase dal PEGGIORE; gli altri diventano chip. Funzione pura: la
// stessa servirà a un badge di tab o a una colonna in rubrica.
function ctrProblemi(sog, codici) {
  const out = [];
  const sospAttiva = SOSPENSIONI.find(s => s.soggettoId === sog.id && !s.revoca);
  if (sospAttiva) {
    const ris = sospAttiva.sospesa ? new Date(sospAttiva.sospesa.getTime() + 15 * 86400000) : null;
    const scatto = !sospAttiva.sospesa && sospAttiva.diffida ? new Date(sospAttiva.diffida.getTime() + 15 * 86400000) : null;
    out.push({ sev:0, color:'DANGER', icona:'lock',
      testo: sospAttiva.sospesa
        ? `Sospeso per ${ctrMotivoLabel(sospAttiva.motivo).toLowerCase()} dal ${fmtDate(sospAttiva.sospesa)} — risoluzione contrattuale il ${fmtDate(ris)}. I canoni continuano a maturare (art. 4).`
        : `Diffida inviata il ${fmtDate(sospAttiva.diffida)} — sospensione dal ${fmtDate(scatto)} (art. 4).`,
      chip: 'Sospensione' });
  }
  if (sog.stato === 'churned') {
    const cess = ctrCessazione(sog);
    const ggExport = 60 + ctrGiorni(cess), ggBackup = 35 + ctrGiorni(cess);
    out.push({ sev:1, color: ggExport > 0 ? 'WARN' : 'PLAN_FREE', icona:'clock',
      testo: `Contratto cessato il ${fmtDate(cess)} (art. 5). Esportazione dati: ${ggExport > 0 ? `ancora ${ggExport} giorni` : 'finestra chiusa'} · backup: ${ggBackup > 0 ? `si estinguono fra ${ggBackup} giorni` : 'estinti'} (DPA art. 11).`,
      chip: 'Post-cessazione' });
  }
  codici.map(ctrDoc).filter(d => d && d.versioni && !d.informativa).forEach(doc => {
    const a = ctrAccettazione(sog.id, doc.codice);
    const corrente = ctrCorrente(doc);
    const vAcc = a ? doc.versioni.find(x => x.v === a.v) : null;
    if (a && a.tipo === 'tacita' && vAcc && vAcc.peggiorativa) {
      out.push({ sev:2, color:'WARN', icona:'alertTriangle',
        testo: `${doc.codice} v${a.v}: modifica peggiorativa mai accettata esplicitamente — vale solo l'uso successivo (art. 15). Il recesso era esercitabile fino al ${fmtDate(vAcc.efficace)}.`,
        chip: `${doc.codice} tacita` });
    }
    // «Scaduto senza risposta» vale solo finché la risposta non c'è: se poi
    // è arrivata una tacita per condotta, il problema è QUELLA (già sopra),
    // non il silenzio che l'ha preceduta.
    PREAVVISI.filter(p => p.soggettoId === sog.id && p.codice === doc.codice && ctrEsito(p) === 'scaduto'
      && !ACCETTAZIONI.some(x => x.soggettoId === sog.id && x.codice === doc.codice && x.v === p.v)).forEach(p => {
      out.push({ sev:2, color:'WARN', icona:'alertTriangle',
        testo: `Preavviso ${doc.codice} ${p.v ? 'v' + p.v : ''} scaduto senza risposta: efficace dal ${fmtDate(p.efficace)}, nessuna accettazione registrata.`,
        chip: `${doc.codice} senza risposta` });
    });
    if (a && a.v !== corrente.v && sog.stato !== 'churned') {
      const pCorr = PREAVVISI.find(p => p.soggettoId === sog.id && p.codice === doc.codice && p.v === corrente.v);
      if (!pCorr) {
        // Il buco è NOSTRO: la versione corrente non gli è mai stata
        // notificata. Più grave di una finestra che corre regolare.
        out.push({ sev:2, color:'WARN', icona:'alertTriangle',
          testo: `${doc.codice} fermo alla v${a.v}: la v${corrente.v} non risulta mai notificata — il preavviso dell'art. 15 è dovuto.`,
          chip: `${doc.codice} non notificato` });
      } else if (ctrEsito(pCorr) === 'in-corso') {
        out.push({ sev:4, color:'INFO', icona:'clock',
          testo: `Finestra ${doc.codice} v${corrente.v} aperta: efficace il ${fmtDate(pCorr.efficace)}, fra ${ctrGiorni(pCorr.efficace)} giorni.`,
          chip: `${doc.codice} in finestra` });
      }
    }
  });
  return out.sort((a, b) => a.sev - b.sev);
}

// La riga di un documento contrattuale: versione accettata contro corrente,
// chi e da dove, e in fondo la RIGA DEL DOCUMENTO — nome e versione
// accettata, come nella scheda utente (art. 3: copia conservata da Byup).
// Prima c'era un bottone «Apri le condizioni accettate» con una modale
// dietro: un giro in più per dire quello che una riga dice da ferma.
function CtrRigaDoc({ sog, codice }) {
  const doc = ctrDoc(codice);
  if (!doc) return null;
  const a = ctrAccettazione(sog.id, codice);
  const fotoPiano = doc.particolare;
  const corrente = fotoPiano ? null : ctrCorrente(doc);
  const allineato = fotoPiano || (a && corrente && a.v === corrente.v);
  const vAcc = a && doc.versioni ? doc.versioni.find(x => x.v === a.v) : null;
  const tacita = a && a.tipo === 'tacita';
  const visione = a && a.tipo === 'presa-visione';
  const pRel = !fotoPiano && a && corrente && a.v !== corrente.v
    ? PREAVVISI.find(p => p.soggettoId === sog.id && p.codice === codice && p.v === corrente.v) : null;

  return (
    <AdmCard padding={18}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <span style={{width:36, height:36, borderRadius:9, flexShrink:0, display:'grid', placeItems:'center',
          background: ADM[(a ? (tacita ? 'WARN' : 'OK') : 'PLAN_FREE') + '_SOFT'],
          color: ADM[a ? (tacita ? 'WARN' : 'OK') : 'MUTED']}}>
          <BuIcons.filePdf size={18}/>
        </span>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>
            {doc.nome} <span style={{fontWeight:600, color:ADM.MUTED_SOFT}}>· {doc.codice}</span>
          </div>
          <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:1}}>
            {fotoPiano
              ? 'Condizioni del piano attivo'
              : `Versione corrente v${corrente.v} · efficace ${fmtDate(corrente.efficace)}`}
          </div>
        </div>
        {a
          ? (visione
              ? <AdmBadge color="INFO" size="xs">Presa visione</AdmBadge>
              : tacita
                ? <AdmBadge color="WARN" size="xs">Tacita · art. 15</AdmBadge>
                : <AdmBadge color="OK" size="xs">Esplicita</AdmBadge>)
          : <AdmBadge color="PLAN_FREE" size="xs">Mai accettato</AdmBadge>}
      </div>

      {/* Niente più «chi», «da dove» e IP in scheda: la data e la versione
          (nel rimando al documento qui sotto) bastano a leggere il
          fascicolo — il dettaglio di chi ha cliccato e da quale indirizzo
          resta nel registro accettazioni, dove un audit va comunque a
          guardare. Qui restano solo gli AVVISI, che sono la parte che pesa. */}
      {a && (
        <div>
          {tacita && vAcc && (
            <div style={{marginTop:10, padding:'9px 12px', borderRadius:9, background:ADM.WARN_SOFT, color:'#92400E', fontSize:12.6, lineHeight:1.5}}>
              Nessuna dichiarazione di poteri (art. 3): vale il solo uso successivo all'efficacia
              {vAcc.peggiorativa && <> — su una <b>modifica peggiorativa</b>, con recesso esercitabile fino al {fmtDate(vAcc.efficace)}</>}.
            </div>
          )}
          {/* A contratto cessato la versione corrente non gli è dovuta:
              niente allarme di disallineamento su un churned. E su
              un'INFORMATIVA niente art. 15: si riceve, non si accetta — la
              versione nuova si segnala senza suonare nessun allarme. */}
          {!allineato && sog.stato !== 'churned' && (doc.informativa ? (
            <div style={{marginTop:10, padding:'9px 12px', borderRadius:9, background:ADM.NEUTRAL_SOFT,
              color:ADM.MUTED, fontSize:12.6, lineHeight:1.5}}>
              Pubblicata la v{corrente.v}: la presa visione si registra al prossimo accesso. Nessun preavviso dovuto.
            </div>
          ) : (
            <div style={{marginTop:10, padding:'9px 12px', borderRadius:9,
              background: pRel && ctrEsito(pRel) === 'in-corso' ? ADM.INFO_SOFT : ADM.WARN_SOFT,
              color: pRel && ctrEsito(pRel) === 'in-corso' ? ADM.INFO : '#92400E', fontSize:12.6, lineHeight:1.5}}>
              {pRel
                ? (ctrEsito(pRel) === 'in-corso'
                    ? <>Non allineato alla v{corrente.v}: preavviso inviato il {fmtDate(pRel.inviato)}, finestra aperta fino al {fmtDate(pRel.efficace)} ({ctrGiorni(pRel.efficace)} giorni).</>
                    : <>Non allineato alla v{corrente.v}: preavviso del {fmtDate(pRel.inviato)} <b>scaduto senza risposta</b> il {fmtDate(pRel.efficace)}.</>)
                : <>Non allineato alla v{corrente.v}: <b>nessun preavviso risulta inviato</b> — l'art. 15 lo dovrebbe.</>}
            </div>
          ))}
        </div>
      )}

      {/* Il rimando al documento, nome e versione accettata: come i
          «Documenti sottoscritti» della scheda utente. */}
      {a && (
        <div style={{marginTop:12, display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:ADM.PANEL_SOFT, borderRadius:9}}>
          <BuIcons.filePdf size={18} color={ADM.PINK}/>
          <span style={{flex:1, minWidth:0, fontSize:13, color:ADM.TEXT, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
            {doc.nome}{' '}
            <span style={{fontFamily:'ui-monospace,monospace', fontSize:12, color:ADM.MUTED, fontWeight:600}}>
              {fotoPiano ? (PIANI.find(x => x.id === a.v) || {label:a.v}).label : 'v' + a.v}
            </span>
          </span>
          <span style={{fontSize:12.4, color:ADM.MUTED, flexShrink:0}}>
            {a.tipo === 'presa-visione' ? 'presa visione' : 'accettata'} {fmtDate(a.quando)}
          </span>
        </div>
      )}
    </AdmCard>
  );
}

function DrwContratti({ locale: l }) {
  const codici = CONTRATTI_PER_TIPO.locale;
  const contrattuali = codici.filter(c => { const d = ctrDoc(c); return d && !d.informativa; });
  const informative  = codici.filter(c => { const d = ctrDoc(c); return d && d.informativa; });

  // Un pending non ha firmato niente: fascicolo legittimamente vuoto.
  if (!ACCETTAZIONI.some(a => a.soggettoId === l.id)) return (
    <div style={{padding:20}}>
      <AdmCard padding={0}>
        <AdmEmpty icon="filePdf" title="Nessun contratto"
          desc="Il locale non ha completato l'attivazione: la firma del pacchetto contrattuale (Piano, TC-01, DPA-01) avviene in onboarding."/>
      </AdmCard>
    </div>
  );

  const problemi = ctrProblemi(l, codici);
  const peggiore = problemi[0] || null;

  return (
    <div style={{padding:20, display:'flex', flexDirection:'column', gap:14}}>

      {/* Lo stato in cima: il caso peggiore per esteso, gli altri come chip.
          Un elenco piatto qui costringerebbe a leggere per capire se c'è un
          problema: il colore deve bastare. */}
      {peggiore ? (
        <div style={{padding:'14px 16px', borderRadius:12, display:'flex', gap:12, alignItems:'flex-start',
          background: ADM[peggiore.color + '_SOFT'], border:`1px solid ${ADM[peggiore.color]}40`}}>
          <div style={{width:34, height:34, borderRadius:9, background:ADM[peggiore.color], color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}>
            {React.createElement(BuIcons[peggiore.icona] || BuIcons.alertTriangle, { size: 19 })}
          </div>
          <div style={{flex:1, minWidth:200}}>
            <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT, lineHeight:1.5}}>{peggiore.testo}</div>
            {problemi.length > 1 && (
              <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:8}}>
                {problemi.slice(1).map((p, i) => <AdmBadge key={i} color={p.color} size="xs">{p.chip}</AdmBadge>)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{padding:'12px 16px', borderRadius:12, display:'flex', gap:10, alignItems:'center',
          background:ADM.OK_SOFT, border:`1px solid ${ADM.OK}40`, fontSize:13.4, fontWeight:600, color:ADM.TEXT}}>
          <BuIcons.check size={17} color={ADM.OK}/> Tutte le versioni correnti risultano accettate esplicitamente.
        </div>
      )}

      {/* I documenti nell'ordine di PREVALENZA dell'art. 1 — Piano, TC, DPA —
          non in quello alfabetico: in un conflitto fra clausole vince chi
          sta più in alto in questa lista. */}
      {contrattuali
        .map(ctrDoc).sort((a, b) => a.prevalenza - b.prevalenza)
        .map(d => <CtrRigaDoc key={d.codice} sog={l} codice={d.codice}/>)}

      {/* Le informative, a parte: si RICEVONO, non si accettano — niente
          prevalenza, niente finestre di recesso, etichetta «presa visione». */}
      <div style={{fontSize:11.5, fontWeight:800, letterSpacing:'0.07em', textTransform:'uppercase', color:ADM.MUTED_SOFT, marginTop:4}}>Informative</div>
      {informative.map(c => <CtrRigaDoc key={c} sog={l} codice={c}/>)}

      {/* La sospensione vive in Account; lo storico contrattuale che stava
          qui in fondo è andato: raccontava per la terza volta cose che i
          documenti qui sopra dicono già, e l'audit completo vive nel
          registro. Al suo posto, i CONSENSI: contratti e consensi sono lo
          stesso fascicolo — che cosa ha firmato, a che cosa ha detto sì. */}
      <div style={{fontSize:11.5, fontWeight:800, letterSpacing:'0.07em', textTransform:'uppercase', color:ADM.MUTED_SOFT, marginTop:4}}>Consensi</div>
      <DrwConsensiCard righe={drwConsensiLocale(l)} nota={DRW_CONSENSI_NOTA}/>
    </div>
  );
}

window.LocaleDrawer = LocaleDrawer;
window.DrwContratti = DrwContratti;

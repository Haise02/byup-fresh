// Marketing · Promozioni — 2 tab: Campagne di acquisizione + Broadcast

const { useState: useStatePromo, useMemo: useMemoPromo } = React;

// ═════════════════════════ MOCK DATA ═════════════════════════════════════════
// Modello per campagna:
// - budgetMensile: tetto mensile pianificato (€)
// - speso: importo speso effettivo (inserito a mano dall'admin)
// - click: tracciati dal link
// - iscritti: tracciati al signup
// - paganti: tracciati al primo pagamento
// - mrr: MRR mensile generato dai paganti della campagna (€/mese)
// CAC derivato = speso / paganti
const CAMPAGNE = [
  { id:'cmp_lc01', nome:'LinkedIn Q4 Ristoratori',     tipo:'paid',     creata: new Date(Date.now()-86400000*45),  budgetMensile: 1500, speso: 1280, click: 1840,  iscritti: 412,  paganti: 280,  mrr: 23800, locale:'IT' },
  { id:'cmp_mt02', nome:'Meta · Ads Milano Roma',      tipo:'paid',     creata: new Date(Date.now()-86400000*38),  budgetMensile: 4000, speso: 3420, click: 8240,  iscritti: 1280, paganti: 820,  mrr: 69700, locale:'IT' },
  { id:'cmp_gg03', nome:'Google · Brand Search',       tipo:'paid',     creata: new Date(Date.now()-86400000*60),  budgetMensile: 5000, speso: 4180, click: 12840, iscritti: 2104, paganti: 1450, mrr: 123250, locale:'IT' },
  { id:'cmp_tk04', nome:'TikTok · Gen-Z Foodies',      tipo:'paid',     creata: new Date(Date.now()-86400000*15),  budgetMensile: 1200, speso: 980,  click: 4220,  iscritti: 318,  paganti: 142,  mrr: 12070, locale:'IT' },
  { id:'cmp_rf01', nome:'Referral standard',           tipo:'referral', creata: new Date(Date.now()-86400000*120), budgetMensile: 0,    speso: 9200, click: 4810,  iscritti: 1840, paganti: 1340, mrr: 113900 },
  { id:'cmp_rf02', nome:'Referral · ambasciatori top', tipo:'referral', creata: new Date(Date.now()-86400000*70),  budgetMensile: 0,    speso: 4896, click: 1820,  iscritti: 612,  paganti: 480,  mrr: 40800 },
  { id:'cmp_rf03', nome:'Referral · settembre 2x',     tipo:'referral', creata: new Date(Date.now()-86400000*40),  budgetMensile: 0,    speso: 9200, click: 2410,  iscritti: 920,  paganti: 690,  mrr: 58650 },
];

// Helper derivati
const cacOf = (c) => (c.paganti > 0 ? c.speso / c.paganti : 0);
const convOf = (c) => (c.click > 0 ? c.iscritti / c.click : 0);
// Compat: vecchio nome "utentiAcquisiti" mappato su "iscritti"
CAMPAGNE.forEach(c => { c.utentiAcquisiti = c.iscritti; c.conv = convOf(c); c.costo = c.speso; });

// Costruisci il link tracciato
const buildLink = (campId) => `https://byup.it/r/${campId}?utm_source=admin&utm_medium=campaign&utm_campaign=${encodeURIComponent(campId)}`;

// Acquisizione totale ultimi 30g (mock)
const ACQ_30G = {
  totale: 6420,
  organico: 3180,
  // paid = sum across paid campaigns proporzionata a finestra 30g
  paid:     CAMPAGNE.filter(c=>c.tipo==='paid').reduce((s,c)=>s+Math.round(c.utentiAcquisiti*0.5), 0),
  referral: CAMPAGNE.filter(c=>c.tipo==='referral').reduce((s,c)=>s+Math.round(c.utentiAcquisiti*0.35), 0),
};

const BROADCAST_ITEMS = [
  { id:'BC-014', titolo:'Aggiornamento gestionale v2.4', canali:['push','email'],   audience:'Tutti i locali attivi',         destinatari: 48,   aperti: 0.78, click: 0.34, conv: 0.18, unsub: 0.002, data: new Date(Date.now()-86400000*1) },
  { id:'BC-013', titolo:'Sconto -20% sui ristoranti di Milano', canali:['push','in_app'], audience:'Utenti Milano · F 26-35',  destinatari: 1284, aperti: 0.62, click: 0.19, conv: 0.06, unsub: 0.008, data: new Date(Date.now()-86400000*4) },
  { id:'BC-012', titolo:'Riattiva il tuo locale',        canali:['email'],          audience:'Locali inattivi 30+ gg',          destinatari: 6,    aperti: 0.66, click: 0.33, conv: 0.16, unsub: 0.000, data: new Date(Date.now()-86400000*8) },
  { id:'BC-011', titolo:'Festa di apertura · Genova',    canali:['push','sms'],     audience:'Utenti Liguria',                  destinatari: 412,  aperti: 0.74, click: 0.22, conv: 0.09, unsub: 0.005, data: new Date(Date.now()-86400000*14) },
  { id:'BC-010', titolo:'Brunch domenicale · Roma',      canali:['push','email'],   audience:'Utenti Roma · attivi 14gg',       destinatari: 2840, aperti: 0.58, click: 0.16, conv: 0.04, unsub: 0.011, data: new Date(Date.now()-86400000*22) },
  { id:'BC-009', titolo:'Programma fedeltà: 2x punti',   canali:['push','in_app','email'], audience:'Tutti gli utenti attivi',  destinatari: 8420, aperti: 0.71, click: 0.28, conv: 0.12, unsub: 0.004, data: new Date(Date.now()-86400000*30) },
  { id:'BC-008', titolo:'San Valentino · Cena per due',  canali:['push','email'],   audience:'Coppie 25-45 · capoluoghi',        destinatari: 3120, aperti: 0.68, click: 0.24, conv: 0.10, unsub: 0.007, data: new Date(Date.now()-86400000*42) },
];

// ═════════════════════════ MAIN PAGE ═════════════════════════════════════════
function AdmPromozioniPage({ onNew }) {
  const [tab, setTab] = useStatePromo('campagne');

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{padding:'0 28px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, position:'sticky', top:0, zIndex:5}}>
        <AdmTabBar tabs={[
          { id:'campagne',  label:'Campagne di acquisizione' },
          { id:'broadcast', label:'Broadcast push & email' },
          { id:'workflow',  label:'Workflow email' },
        ]} active={tab} onChange={setTab}/>
      </div>
      {tab === 'campagne'  && <CampagnePane onNew={onNew}/>}
      {tab === 'broadcast' && <BroadcastPane onNew={onNew}/>}
      {tab === 'workflow'  && <WorkflowEmailPane/>}
    </div>
  );
}

// ═════════════════════════ TAB 1 · CAMPAGNE ══════════════════════════════════
function CampagnePane({ onNew }) {
  const [creating, setCreating] = useStatePromo(false);
  const [openCamp, setOpenCamp] = useStatePromo(null);
  const [paidExpanded, setPaidExpanded] = useStatePromo(true);
  const [campList, setCampList] = useStatePromo(CAMPAGNE);

  const paid     = campList.filter(c => c.tipo === 'paid');
  const referral = campList.filter(c => c.tipo === 'referral');

  const totPaid = paid.reduce((s,c)=>s+c.utentiAcquisiti, 0);
  const totRef  = referral.reduce((s,c)=>s+c.utentiAcquisiti, 0);
  const totOrg  = ACQ_30G.organico;
  const tot     = totPaid + totRef + totOrg;
  const totSpeso   = paid.reduce((s,c)=>s+(c.speso||0), 0);
  const totPaganti = paid.reduce((s,c)=>s+(c.paganti||0), 0);
  const totMrr     = paid.reduce((s,c)=>s+(c.mrr||0), 0) + referral.reduce((s,c)=>s+(c.mrr||0), 0);
  const cac = totPaganti > 0 ? Math.round(totSpeso / totPaganti) : 0;

  const addCampagna = (nome, tipo, budgetMensile) => {
    const newC = {
      id: `cmp_${tipo.slice(0,2)}${String(campList.length+1).padStart(2,'0')}`,
      nome, tipo,
      creata: new Date(),
      budgetMensile: budgetMensile || 0,
      speso: 0,
      click: 0,
      iscritti: 0,
      paganti: 0,
      mrr: 0,
      utentiAcquisiti: 0,
      conv: 0,
      costo: 0,
    };
    setCampList([newC, ...campList]);
    return newC;
  };

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:18}}>
      {/* ───── HEADER STRIP ───── */}
      <div style={{display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1fr', gap:14}}>
        {/* Totale */}
        <AdmCard padding={20}>
          {/* Hero di pagina — stile sistema: bianco, numero grande, dettagli a vista */}
          <div style={{fontSize:12.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Nuovi utenti · ultimi 30 giorni</div>
          <div style={{display:'flex', alignItems:'baseline', gap:12, marginTop:8}}>
            <div style={{fontSize:40, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>{fmtNum(tot)}</div>
            <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>aggregato dei 3 canali</span>
          </div>
          <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:10}}>CAC medio Paid <strong style={{color:ADM.TEXT}}>{fmtEur(cac)}</strong> · MRR generato <strong style={{color:ADM.TEXT}}>{fmtEur(totMrr)}/mese</strong> · Payback <strong style={{color:ADM.TEXT}}>{totMrr > 0 ? fmtPaybackMonths(totSpeso/totMrr) : '—'}</strong></div>
        </AdmCard>
        <ChannelKpi label="Paid"     value={totPaid} pct={tot ? Math.round(totPaid/tot*100) : 0} trend={-2.8} color={ADM.PINK}    icon="megaphone"/>
        <ChannelKpi label="Organico" value={totOrg}  pct={tot ? Math.round(totOrg/tot*100) : 0}  trend={+6.4} color={ADM.INK}     icon="trendUp"/>
        <ChannelKpi label="Referral" value={totRef}  pct={tot ? Math.round(totRef/tot*100) : 0}  trend={+12.1} color={ADM.MUTED}   icon="users"/>
      </div>

      {/* ───── BREAKDOWN BAR ───── */}
      <AdmCard padding={22}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Distribuzione utenti acquisiti</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Clicca sul segmento Paid per esplodere le singole campagne</div>
          </div>
        </div>

        <div style={{display:'flex', height:34, borderRadius:8, overflow:'hidden', background:'#F0F1F3', cursor:'default'}}>
          <div onClick={()=>setPaidExpanded(!paidExpanded)} style={{
            width:`${tot ? totPaid/tot*100 : 0}%`,
            background:ADM.PINK,
            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:700, cursor:'pointer', position:'relative',
            transition:'opacity 0.15s', userSelect:'none',
          }} onMouseEnter={e=>e.currentTarget.style.opacity='0.9'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <BuIcons.megaphone size={17} color="#fff"/>
            <span style={{marginLeft:6}}>Paid · {fmtNum(totPaid)}</span>
            <span style={{marginLeft:6, fontSize:12.2, opacity:0.85}}>{paidExpanded ? '▾' : '▸'}</span>
          </div>
          <div style={{
            width:`${tot ? totOrg/tot*100 : 0}%`,
            background:ADM.INK, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:700,
          }}>Organico · {fmtNum(totOrg)}</div>
          <div style={{
            width:`${tot ? totRef/tot*100 : 0}%`,
            background:ADM.MUTED, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:700,
          }}>Referral · {fmtNum(totRef)}</div>
        </div>

        {/* Sub-breakdown Paid */}
        {paidExpanded && totPaid > 0 && (
          <div style={{marginTop:14, padding:'14px 16px', background:ADM.PINK_BG_SOFT, border:`1px solid ${ADM.PINK_SOFT}`, borderRadius:10}}>
            <div style={{fontSize:13, fontWeight:700, color:ADM.PINK_DARK, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10, display:'flex', alignItems:'center', gap:6}}>
              <BuIcons.megaphone size={17}/>
              Composizione Paid · {paid.length} campagne attive
            </div>
            <div style={{display:'flex', height:14, borderRadius:6, overflow:'hidden', background:'rgba(255,255,255,0.5)', marginBottom:10}}>
              {paid.map((c, i) => {
                const w = (c.utentiAcquisiti / totPaid) * 100;
                const alpha = Math.max(0.35, 1 - i * 0.2);
                return <div key={c.id} title={`${c.nome} · ${c.utentiAcquisiti}`}
                  style={{width:`${w}%`, background:`rgba(255,90,95,${alpha.toFixed(2)})`}}/>;
              })}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:8}}>
              {paid.map((c, i) => {
                const pct = Math.round((c.utentiAcquisiti / totPaid) * 100);
                const alpha = Math.max(0.35, 1 - i * 0.2);
                return (
                  <div key={c.id} onClick={()=>setOpenCamp(c)} style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'7px 10px', background:'#fff', borderRadius:7,
                    cursor:'pointer', border:`1px solid transparent`,
                    transition:'border-color 0.15s',
                  }} onMouseEnter={e=>e.currentTarget.style.borderColor=ADM.PINK} onMouseLeave={e=>e.currentTarget.style.borderColor='transparent'}>
                    <span style={{width:8, height:8, borderRadius:2, background:`rgba(255,90,95,${alpha.toFixed(2)})`, flexShrink:0}}/>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:500, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.nome}</span>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700}}>{fmtNum(c.utentiAcquisiti)}</span>
                    <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, width:30, textAlign:'right'}}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AdmCard>

      {/* ───── LIST: Campagne + Organico ───── */}
      <AdmCard padding={0}>
        <div style={{padding:'16px 22px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Le tue campagne</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Clicca su una riga per recuperare il link tracciato</div>
          </div>
          <button onClick={()=>setCreating(true)} style={{
            display:'inline-flex', alignItems:'center', gap:7,
            padding:'9px 16px',
            background:'linear-gradient(135deg, #FF5A5F, #E04347)',
            color:'#fff', border:'none', borderRadius:9,
            fontSize:14.4, fontWeight:700, cursor:'pointer',
            fontFamily:'inherit', letterSpacing:'-0.005em',
            boxShadow:'0 6px 18px -6px rgba(255,90,95,0.55)',
            whiteSpace:'nowrap',
          }}>
            <BuIcons.plus size={19}/>
            Nuova campagna
          </button>
        </div>

        {/* Paid section */}
        <CampSection
          title="Paid"
          desc="Campagne con investimento media"
          color={ADM.PINK}
          campaigns={paid}
          onOpen={setOpenCamp}
        />
        {/* Referral section */}
        <CampSection
          title="Referral"
          desc="Link condivisibili per programmi di passaparola"
          color={ADM.MUTED}
          campaigns={referral}
          onOpen={setOpenCamp}
        />
        {/* Organico (generico, non-cliccabile, niente link da copiare) */}
        <div style={{padding:'18px 22px', display:'flex', alignItems:'center', gap:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{width:38, height:38, borderRadius:9, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center'}}>
            <BuIcons.trendUp size={22}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT}}>Organico</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Traffico spontaneo: store, ricerca, passaparola non tracciato</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:19.4, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{fmtNum(totOrg)}</div>
            <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>utenti acquisiti · 30g</div>
          </div>
        </div>
      </AdmCard>

      {creating && <NewCampaignModal onClose={()=>setCreating(false)} onCreate={(nome, tipo, budgetMensile)=>{
        const c = addCampagna(nome, tipo, budgetMensile);
        setCreating(false);
        setOpenCamp(c);
      }}/>}
      {openCamp && <CampaignLinkModal camp={openCamp} onClose={()=>setOpenCamp(null)}/>}
    </div>
  );
}

function ChannelKpi({ label, value, pct, trend, color, icon }) {
  const Icon = BuIcons[icon];
  const hasTrend = typeof trend === 'number';
  const trendUp = hasTrend && trend >= 0;
  const trendCol = !hasTrend ? null : trendUp ? ADM.OK : ADM.DANGER;
  return (
    <AdmCard padding={18}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
        <div style={{width:36, height:36, borderRadius:9, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}>
          <Icon size={21}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>{label}</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:4, flexWrap:'wrap'}}>
            <div style={{fontSize:22.3, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>{fmtNum(value)}</div>
            {hasTrend && (
              <span style={{
                display:'inline-flex', alignItems:'center', gap:3,
                padding:'2px 6px', borderRadius:5,
                background:`${trendCol}1A`, color:trendCol,
                fontSize:13, fontWeight:700, letterSpacing:'-0.005em',
              }}>
                {(() => { const I = BuIcons[trendUp ? 'trendUp' : 'trendDown']; return <I size={15}/>; })()}
                {trendUp ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:6}}>
            <span style={{color:ADM.TEXT, fontWeight:700}}>{pct}%</span> del totale · ultimi 30g
          </div>
        </div>
      </div>
    </AdmCard>
  );
}

// Layout colonne uniforme per header e riga
const CAMP_COLS = 'minmax(0,1.35fr) 1.1fr 0.6fr 0.65fr 0.65fr 0.8fr 0.95fr 0.8fr 24px';

// Helper payback: Speso ÷ MRR (in mesi); formattato dinamicamente
// in giorni / settimane / mesi a seconda della scala.
const fmtPaybackMonths = (m) => {
  if (!isFinite(m) || m <= 0) return '—';
  const days = m * 30;
  if (days < 1) {
    // recupero sub-giornaliero → mostra in ore
    const hrs = Math.max(1, Math.round(days * 24));
    return `${hrs} h`;
  }
  if (days < 7) {
    const d = Math.round(days);
    return `${d} ${d === 1 ? 'giorno' : 'giorni'}`;
  }
  if (days < 60) {
    const w = days / 7;
    const wTxt = w < 10 ? w.toFixed(1).replace('.', ',') : String(Math.round(w));
    return `${wTxt} sett.`;
  }
  if (m < 10) return `${m.toFixed(1).replace('.', ',')} mesi`;
  return `${Math.round(m)} mesi`;
};

function CampHeaderRow() {
  const cellStyle = {fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'right'};
  return (
    <div style={{
      padding:'8px 22px 10px',
      display:'grid', gridTemplateColumns: CAMP_COLS, gap:14, alignItems:'center',
      background:'#FAFBFC', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
    }}>
      <div style={{...cellStyle, textAlign:'left'}}>Campagna</div>
      <div style={{...cellStyle, textAlign:'left'}}>Speso / Budget mensile</div>
      <div style={cellStyle}>Click</div>
      <div style={cellStyle}>Iscritti</div>
      <div style={cellStyle}>Paganti</div>
      <div style={cellStyle}>CAC</div>
      <div style={cellStyle}>MRR generato</div>
      <div style={cellStyle}>Payback</div>
      <div/>
    </div>
  );
}

function CampSection({ title, desc, color, campaigns, onOpen }) {
  return (
    <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
      <div style={{padding:'14px 22px 8px', display:'flex', alignItems:'center', gap:10}}>
        <span style={{width:6, height:18, borderRadius:3, background:color}}/>
        <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{title}</div>
        <span style={{fontSize:12.6, color:ADM.MUTED}}>· {desc}</span>
        <div style={{flex:1}}/>
        <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, padding:'2px 8px', background:'#F0F1F3', borderRadius:99}}>{campaigns.length}</span>
      </div>
      {campaigns.length === 0 && (
        <div style={{padding:'18px 22px 24px', fontSize:13.7, color:ADM.MUTED_SOFT, fontStyle:'italic'}}>Nessuna campagna ancora. Creane una col pulsante in alto.</div>
      )}
      {campaigns.length > 0 && <CampHeaderRow/>}
      {campaigns.map((c, i, arr) => (
        <CampRow key={c.id} camp={c} color={color} onClick={()=>onOpen(c)} last={i === arr.length - 1}/>
      ))}
    </div>
  );
}

function MetricCell({ value, sub, tone }) {
  return (
    <div style={{textAlign:'right', minWidth:0}}>
      <div style={{fontSize:14.8, fontWeight:700, color: tone || ADM.TEXT, lineHeight:1, letterSpacing:'-0.01em'}}>{value}</div>
      {sub && <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:3, fontWeight:600}}>{sub}</div>}
    </div>
  );
}

function CampRow({ camp: c, color, onClick, last }) {
  const [hover, setHover] = useStatePromo(false);
  const cac = c.paganti > 0 ? c.speso / c.paganti : 0;
  const budget = c.budgetMensile || 0;
  const speso = c.speso || 0;
  const pctBudget = budget > 0 ? Math.min(1, speso / budget) : 0;
  const overBudget = budget > 0 && speso > budget;
  const barColor = overBudget ? ADM.WARN : (pctBudget > 0.85 ? ADM.WARN : color);

  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        padding:'14px 22px',
        borderBottom: last ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.PINK_BG_SOFT : 'transparent',
        cursor:'pointer',
        display:'grid', gridTemplateColumns: CAMP_COLS,
        alignItems:'center', gap:14,
        transition:'background 0.12s',
      }}>
      {/* Nome + id */}
      <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
        <div style={{width:32, height:32, borderRadius:8, background:`${color}1A`, color, display:'grid', placeItems:'center', flexShrink:0}}>
          <BuIcons.link size={19}/>
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14.8, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.nome}</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:1, fontFamily:'ui-monospace,monospace'}}>{c.id}</div>
        </div>
      </div>

      {/* Speso / Budget mensile */}
      <div style={{minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:5}}>
          <span style={{fontSize:14.8, fontWeight:700, color: overBudget ? ADM.WARN : ADM.TEXT, letterSpacing:'-0.01em'}}>{fmtEur(speso)}</span>
          {budget > 0 ? (
            <span style={{fontSize:13, color:ADM.MUTED, fontWeight:500}}>/ {fmtEur(budget)}</span>
          ) : (
            <span style={{fontSize:12.6, color:ADM.MUTED_SOFT, fontWeight:500, fontStyle:'italic'}}>· nessun budget</span>
          )}
        </div>
        {budget > 0 ? (
          <div style={{height:5, background:'#F0F1F3', borderRadius:99, overflow:'hidden'}}>
            <div style={{
              width:`${pctBudget*100}%`, height:'100%',
              background: barColor, borderRadius:99,
              transition:'width 0.3s',
            }}/>
          </div>
        ) : (
          <div style={{height:5}}/>
        )}
      </div>

      {/* Click */}
      <MetricCell value={fmtNum(c.click)}/>
      {/* Iscritti */}
      <MetricCell value={fmtNum(c.iscritti)} sub={c.click > 0 ? `${(c.iscritti/c.click*100).toFixed(1)}% conv.` : null}/>
      {/* Paganti */}
      <MetricCell value={fmtNum(c.paganti)} sub={c.iscritti > 0 ? `${(c.paganti/c.iscritti*100).toFixed(0)}% iscritti` : null} tone={c.paganti > 0 ? ADM.TEXT : ADM.MUTED}/>
      {/* CAC */}
      <MetricCell value={c.paganti > 0 ? fmtEur(Math.round(cac)) : '—'} tone={ADM.TEXT}/>
      {/* MRR */}
      <div style={{textAlign:'right', minWidth:0}}>
        <div style={{fontSize:14.8, fontWeight:800, color: ADM.TEXT, lineHeight:1, letterSpacing:'-0.01em'}}>{fmtEur(c.mrr||0)}</div>
        <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:3, fontWeight:600}}>/ mese</div>
      </div>

      {/* Payback (Speso ÷ MRR mensile) */}
      {(() => {
        const pb = (c.mrr || 0) > 0 ? (c.speso || 0) / c.mrr : 0;
        const fast = pb > 0 && pb < 1;
        const slow = pb >= 6;
        const tone = fast ? ADM.OK : slow ? ADM.WARN : ADM.TEXT;
        return (
          <div style={{textAlign:'right', minWidth:0}}>
            <div style={{fontSize:14.8, fontWeight:700, color: tone, lineHeight:1, letterSpacing:'-0.01em'}}>{fmtPaybackMonths(pb)}</div>
            <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:3, fontWeight:600}}>
              {pb === 0 ? '' : fast ? 'recupero rapido' : slow ? 'lento' : 'a rientro'}
            </div>
          </div>
        );
      })()}

      <div style={{textAlign:'right', color: hover ? ADM.PINK : ADM.MUTED}}><BuIcons.chevronRight size={21}/></div>
    </div>
  );
}

// ─── Modale: nuova campagna ──────────────────────────────────────────────────
function NewCampaignModal({ onClose, onCreate }) {
  const [nome, setNome] = useStatePromo('');
  const [tipo, setTipo] = useStatePromo('paid');
  const [budget, setBudget] = useStatePromo('');
  const budgetNum = parseInt((budget||'').toString().replace(/[^0-9]/g, ''), 10) || 0;
  const canCreate = nome.trim().length >= 3;

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{padding:'22px 26px'}}>
        <div style={{display:'flex', alignItems:'center', gap:11, marginBottom:18}}>
          <div style={{width:42, height:42, borderRadius:10, background:'linear-gradient(135deg, #FF5A5F, #E04347)', color:'#fff', display:'grid', placeItems:'center', boxShadow:'0 4px 12px -4px rgba(255,90,95,0.5)'}}>
            <BuIcons.plus size={23}/>
          </div>
          <div>
            <div style={{fontSize:16.6, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Nuova campagna</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Genera un link tracciato da condividere</div>
          </div>
        </div>

        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:13.3, color:ADM.TEXT, fontWeight:700, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em'}}>Nome campagna</label>
          <input
            autoFocus
            value={nome}
            onChange={e=>setNome(e.target.value)}
            placeholder='Es. "LinkedIn Q1 Trattorie Roma"'
            style={{
              width:'100%', padding:'12px 14px',
              fontSize:15.1, fontFamily:'inherit',
              border:`1.5px solid ${ADM.BORDER}`, borderRadius:9,
              outline:'none', boxSizing:'border-box',
              transition:'border-color 0.15s',
            }}
            onFocus={e=>e.target.style.borderColor=ADM.PINK}
            onBlur={e=>e.target.style.borderColor=ADM.BORDER}
            onKeyDown={e=>{ if (e.key === 'Enter' && canCreate) onCreate(nome.trim(), tipo, budgetNum); }}
          />
          <div style={{fontSize:13, color:ADM.MUTED_SOFT, marginTop:6}}>Minimo 3 caratteri. Sarà visibile nel link e nelle analitiche.</div>
        </div>

        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:13.3, color:ADM.TEXT, fontWeight:700, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em'}}>
            Budget mensile {tipo === 'referral' && <span style={{textTransform:'none', color:ADM.MUTED_SOFT, fontWeight:500, letterSpacing:0}}>· opzionale per i referral</span>}
          </label>
          <div style={{position:'relative'}}>
            <span style={{
              position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
              fontSize:15.1, fontWeight:700, color: budgetNum > 0 ? ADM.TEXT : ADM.MUTED_SOFT,
              pointerEvents:'none',
            }}>€</span>
            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={e=>setBudget(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Es. 1500"
              style={{
                width:'100%', padding:'12px 14px 12px 30px',
                fontSize:15.1, fontFamily:'inherit', fontWeight: budgetNum > 0 ? 700 : 400,
                border:`1.5px solid ${ADM.BORDER}`, borderRadius:9,
                outline:'none', boxSizing:'border-box',
                transition:'border-color 0.15s',
              }}
              onFocus={e=>e.target.style.borderColor=ADM.PINK}
              onBlur={e=>e.target.style.borderColor=ADM.BORDER}
              onKeyDown={e=>{ if (e.key === 'Enter' && canCreate) onCreate(nome.trim(), tipo, budgetNum); }}
            />
            {budgetNum > 0 && (
              <span style={{
                position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                fontSize:13, fontWeight:600, color:ADM.MUTED, pointerEvents:'none',
              }}>/ mese</span>
            )}
          </div>
          <div style={{fontSize:13, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.5}}>
            Tetto di spesa mensile pianificato. Lo speso effettivo lo inserirai a mano dal dettaglio campagna; CAC e altre derivate sono calcolate da lì.
          </div>
        </div>

        <div style={{marginBottom:22}}>
          <label style={{display:'block', fontSize:13.3, color:ADM.TEXT, fontWeight:700, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em'}}>Tipo</label>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <TipoTile id="paid" label="Paid" desc="Investimento media (ads, sponsored)" icon="megaphone" color={ADM.PINK} active={tipo==='paid'} onClick={()=>setTipo('paid')}/>
            <TipoTile id="referral" label="Referral" desc="Programma passaparola, ambassador" icon="users" color={ADM.MUTED} active={tipo==='referral'} onClick={()=>setTipo('referral')}/>
          </div>
        </div>

        <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{
            padding:'10px 16px', background:'transparent', color:ADM.MUTED,
            border:`1px solid ${ADM.BORDER}`, borderRadius:9,
            fontSize:14.4, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          }}>Annulla</button>
          <button
            disabled={!canCreate}
            onClick={()=>onCreate(nome.trim(), tipo, budgetNum)}
            style={{
              padding:'10px 18px',
              background: canCreate ? 'linear-gradient(135deg, #FF5A5F, #E04347)' : '#E5E7EB',
              color:'#fff', border:'none', borderRadius:9,
              fontSize:14.4, fontWeight:700, cursor: canCreate ? 'pointer' : 'not-allowed',
              fontFamily:'inherit', letterSpacing:'-0.005em',
              boxShadow: canCreate ? '0 6px 18px -6px rgba(255,90,95,0.55)' : 'none',
              transition:'all 0.15s',
            }}>
            Genera link →
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function TipoTile({ label, desc, icon, color, active, onClick }) {
  const Icon = BuIcons[icon];
  return (
    <button onClick={onClick} style={{
      padding:'14px 14px', textAlign:'left',
      background: active ? `${color}10` : '#fff',
      border:`1.5px solid ${active ? color : ADM.BORDER}`,
      borderRadius:10, cursor:'pointer', fontFamily:'inherit',
      display:'flex', gap:11, alignItems:'flex-start',
      transition:'all 0.15s',
    }}>
      <span style={{width:30, height:30, borderRadius:7, background: active ? color : '#F0F1F3', color: active ? '#fff' : ADM.MUTED, display:'grid', placeItems:'center', flexShrink:0}}><Icon size={19}/></span>
      <div>
        <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>{label}</div>
        <div style={{fontSize:13, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{desc}</div>
      </div>
    </button>
  );
}

// ─── Modale: link generato / recupero link ───────────────────────────────────
function CampaignLinkModal({ camp, onClose }) {
  const link = buildLink(camp.id);
  const [copied, setCopied] = useStatePromo(false);
  const [speso, setSpeso] = useStatePromo(camp.speso || 0);
  const [editingSpeso, setEditingSpeso] = useStatePromo(false);
  const isNew = (Date.now() - camp.creata.getTime()) < 5000;

  const budget = camp.budgetMensile || 0;
  const click = camp.click || 0;
  const iscritti = camp.iscritti || 0;
  const paganti = camp.paganti || 0;
  const mrr = camp.mrr || 0;
  const cac = paganti > 0 ? speso / paganti : 0;
  const pctBudget = budget > 0 ? Math.min(1, speso / budget) : 0;
  const overBudget = budget > 0 && speso > budget;
  const hasActivity = click > 0 || iscritti > 0 || paganti > 0 || speso > 0;

  const copy = () => {
    try { navigator.clipboard?.writeText(link); } catch (_) {}
    setCopied(true);
    setTimeout(()=>setCopied(false), 1800);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{padding:'22px 26px', maxHeight:'88vh', overflow:'auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:11, marginBottom:18}}>
          <div style={{
            width:42, height:42, borderRadius:10,
            background: camp.tipo === 'paid' ? 'linear-gradient(135deg, #FF5A5F, #E04347)' : 'linear-gradient(135deg, #A78BFA, #7C3AED)',
            color:'#fff', display:'grid', placeItems:'center',
            boxShadow: `0 4px 12px -4px ${camp.tipo === 'paid' ? 'rgba(255,90,95,0.5)' : 'rgba(124,58,237,0.5)'}`,
          }}>
            <BuIcons.link size={23}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{fontSize:16.6, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{camp.nome}</div>
              {isNew && <span style={{fontSize:13, fontWeight:700, color:ADM.OK, padding:'2px 7px', borderRadius:99, background:ADM.OK_SOFT, textTransform:'uppercase', letterSpacing:'0.04em'}}>Appena creata</span>}
            </div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:3}}>
              {camp.tipo === 'paid' ? 'Campagna Paid' : 'Campagna Referral'} · creata {fmtDateTime(camp.creata)}
            </div>
          </div>
        </div>

        {/* Link */}
        <div style={{
          padding:'14px 16px',
          background: copied ? ADM.OK_SOFT : ADM.PANEL_SOFT,
          border:`1.5px solid ${copied ? ADM.OK : ADM.BORDER}`,
          borderRadius:10,
          marginBottom:18,
          transition:'all 0.2s',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <BuIcons.link size={17} color={copied ? ADM.OK : ADM.MUTED}/>
            <span style={{fontSize:12.6, fontWeight:700, color: copied ? ADM.OK : ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>
              {copied ? 'Link copiato negli appunti' : 'Link tracciato'}
            </span>
            <div style={{flex:1}}/>
          </div>
          <div style={{
            fontFamily:'ui-monospace,monospace',
            fontSize:14, color:ADM.TEXT,
            wordBreak:'break-all', lineHeight:1.5,
          }}>{link}</div>
        </div>

        {/* Performance card */}
        <div style={{
          padding:'16px 18px',
          border:`1px solid ${ADM.BORDER}`,
          borderRadius:12,
          marginBottom:18,
          background:'#fff',
        }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
            <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>Performance</div>
            <div style={{fontSize:13, color:ADM.MUTED}}>Click, iscritti e paganti sono tracciati automaticamente</div>
          </div>

          {/* Budget vs Speso */}
          <div style={{
            padding:'12px 14px',
            background: overBudget ? '#FFF7ED' : ADM.PANEL_SOFT,
            border:`1px solid ${overBudget ? '#FDBA74' : ADM.BORDER_SOFT}`,
            borderRadius:10, marginBottom:14,
          }}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8, gap:10}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8, minWidth:0, flexWrap:'wrap'}}>
                <span style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Speso</span>
                {editingSpeso ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                    <span style={{fontSize:18, fontWeight:800, color:ADM.TEXT}}>€</span>
                    <input
                      autoFocus
                      type="text"
                      inputMode="numeric"
                      value={speso}
                      onChange={e=>setSpeso(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                      onBlur={()=>setEditingSpeso(false)}
                      onKeyDown={e=>{ if (e.key === 'Enter' || e.key === 'Escape') setEditingSpeso(false); }}
                      style={{
                        width:90, padding:'2px 6px',
                        fontSize:18, fontWeight:800, fontFamily:'inherit', color:ADM.TEXT,
                        border:`1.5px solid ${ADM.PINK}`, borderRadius:6,
                        outline:'none', background:'#fff',
                      }}
                    />
                  </span>
                ) : (
                  <button onClick={()=>setEditingSpeso(true)} style={{
                    all:'unset', cursor:'pointer',
                    fontSize:19.4, fontWeight:800, color: overBudget ? ADM.WARN : ADM.TEXT, letterSpacing:'-0.02em',
                    borderBottom:`1px dashed ${ADM.MUTED_SOFT}`,
                  }} title="Clicca per modificare">{fmtEur(speso)}</button>
                )}
                {budget > 0 && <span style={{fontSize:13.7, color:ADM.MUTED, fontWeight:600}}>/ {fmtEur(budget)} budget</span>}
              </div>
              {budget > 0 && (
                <span style={{
                  fontSize:13, fontWeight:700,
                  color: overBudget ? ADM.WARN : (pctBudget > 0.85 ? ADM.WARN : ADM.OK),
                  padding:'2px 8px', borderRadius:99,
                  background: overBudget ? '#FED7AA' : (pctBudget > 0.85 ? '#FEF3C7' : ADM.OK_SOFT),
                  whiteSpace:'nowrap',
                }}>
                  {overBudget ? `+${Math.round((speso-budget)/budget*100)}% over` : `${Math.round(pctBudget*100)}% del budget`}
                </span>
              )}
            </div>
            {budget > 0 && (
              <div style={{height:6, background:'#FFF', borderRadius:99, overflow:'hidden', border:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{
                  width:`${Math.min(100, pctBudget*100)}%`, height:'100%',
                  background: overBudget ? ADM.WARN : (pctBudget > 0.85 ? ADM.WARN : ADM.PINK),
                  borderRadius:99, transition:'width 0.3s',
                }}/>
              </div>
            )}
            <div style={{fontSize:13, color:ADM.MUTED_SOFT, marginTop:8, lineHeight:1.5}}>
              <BuIcons.info size={15}/> Lo speso è inserito a mano: clicca sul valore per aggiornarlo.
            </div>
          </div>

          {/* Funnel metriche */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8, marginBottom:10}}>
            <PromoMiniStat label="Click" value={fmtNum(click)} hint="tracciati dal link"/>
            <PromoMiniStat label="Iscritti" value={fmtNum(iscritti)} hint={click > 0 ? `${(iscritti/click*100).toFixed(1)}% dei click` : 'al signup'}/>
            <PromoMiniStat label="Paganti" value={fmtNum(paganti)} hint={iscritti > 0 ? `${(paganti/iscritti*100).toFixed(0)}% degli iscritti` : 'al 1° pagamento'} tone={ADM.OK}/>
          </div>

          {/* Derivate */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8}}>
            <div style={{padding:'12px 14px', background:'linear-gradient(135deg, #FEE2E2, #FECACA)', border:`1px solid #FCA5A5`, borderRadius:10}}>
              <div style={{fontSize:12.2, fontWeight:700, color:'#991B1B', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4}}>CAC</div>
              <div style={{fontSize:19.4, fontWeight:800, color:'#7F1D1D', letterSpacing:'-0.02em', lineHeight:1.1}}>
                {paganti > 0 ? fmtEur(Math.round(cac * 100) / 100) : '—'}
              </div>
              <div style={{fontSize:12.6, color:'#991B1B', marginTop:4, fontWeight:500}}>Speso ÷ Paganti</div>
            </div>
            <div style={{padding:'12px 14px', background:'linear-gradient(135deg, #D1FAE5, #A7F3D0)', border:`1px solid #6EE7B7`, borderRadius:10}}>
              <div style={{fontSize:12.2, fontWeight:700, color:'#065F46', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4}}>MRR generato</div>
              <div style={{fontSize:19.4, fontWeight:800, color:'#064E3B', letterSpacing:'-0.02em', lineHeight:1.1}}>
                {fmtEur(mrr)}<span style={{fontSize:13.7, fontWeight:600, color:'#047857'}}> /mese</span>
              </div>
              <div style={{fontSize:12.6, color:'#065F46', marginTop:4, fontWeight:500}}>Da {fmtNum(paganti)} {paganti === 1 ? 'pagante' : 'paganti'}</div>
            </div>
            {(() => {
              const pb = mrr > 0 ? speso / mrr : 0;
              const fast = pb > 0 && pb < 1;
              const slow = pb >= 6;
              return (
                <div style={{padding:'12px 14px', background:'linear-gradient(135deg, #DBEAFE, #BFDBFE)', border:`1px solid #93C5FD`, borderRadius:10}}>
                  <div style={{fontSize:12.2, fontWeight:700, color:'#1E3A8A', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4}}>Payback period</div>
                  <div style={{fontSize:19.4, fontWeight:800, color:'#1E40AF', letterSpacing:'-0.02em', lineHeight:1.1}}>
                    {mrr > 0 ? fmtPaybackMonths(pb) : '—'}
                  </div>
                  <div style={{fontSize:12.6, color:'#1E3A8A', marginTop:4, fontWeight:500}}>
                    Speso ÷ MRR{mrr > 0 && (fast ? ' · ottimo' : slow ? ' · lento' : '')}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {!hasActivity && (
          <div style={{padding:'14px 16px', background:ADM.INFO_SOFT, border:`1px solid #BFDBFE`, borderRadius:8, fontSize:14, color:'#1E40AF', marginBottom:18, lineHeight:1.5}}>
            <BuIcons.info size={18}/> Condividi il link per iniziare a raccogliere acquisizioni. Click, iscritti e paganti appariranno qui automaticamente.
          </div>
        )}

        <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{
            padding:'10px 16px', background:'transparent', color:ADM.MUTED,
            border:`1px solid ${ADM.BORDER}`, borderRadius:9,
            fontSize:14.4, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          }}>Chiudi</button>
          <button onClick={copy} style={{
            padding:'10px 18px',
            background: copied ? ADM.OK : 'linear-gradient(135deg, #FF5A5F, #E04347)',
            color:'#fff', border:'none', borderRadius:9,
            fontSize:14.4, fontWeight:700, cursor:'pointer',
            fontFamily:'inherit', letterSpacing:'-0.005em',
            boxShadow: copied ? '0 6px 18px -6px rgba(22,163,74,0.5)' : '0 6px 18px -6px rgba(255,90,95,0.55)',
            display:'inline-flex', alignItems:'center', gap:7,
            transition:'all 0.18s',
          }}>
            {copied ? <BuIcons.check size={19}/> : <BuIcons.copy size={19}/>}
            {copied ? 'Copiato!' : 'Copia link'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:80,
      background:'rgba(15,17,21,0.55)',
      display:'grid', placeItems:'center', padding:24,
      animation:'fadeIn 0.15s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'min(560px, 100%)',
        background:'#fff', borderRadius:14,
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
        animation:'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>{children}</div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform: translateY(8px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

// ═════════════════════════ TAB 2 · BROADCAST ═════════════════════════════════
function BroadcastPane({ onNew }) {
  const [chan, setChan] = useStatePromo('all');
  const [openId, setOpenId] = useStatePromo(null);

  const filtered = useMemoPromo(() => {
    if (chan === 'all') return BROADCAST_ITEMS;
    return BROADCAST_ITEMS.filter(i => i.canali.includes(chan));
  }, [chan]);

  const recent = BROADCAST_ITEMS.filter(i => i.data > new Date(Date.now() - 86400000 * 30));
  const totDest = recent.reduce((s,i)=>s+i.destinatari, 0);
  const avgOpen = recent.reduce((s,i)=>s+i.aperti*i.destinatari, 0) / (totDest || 1);
  const avgClick = recent.reduce((s,i)=>s+i.click*i.destinatari, 0) / (totDest || 1);
  const avgConv = recent.reduce((s,i)=>s+i.conv*i.destinatari, 0) / (totDest || 1);

  const open = BROADCAST_ITEMS.find(i => i.id === openId);

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:18}}>
      {/* KPI strip */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <BroadKpi label="Broadcast (30g)" value={recent.length} hint={`${BROADCAST_ITEMS.length} totali`} color={ADM.PINK}/>
        <BroadKpi label="Utenti raggiunti" value={fmtNum(totDest)} hint="Ultimi 30 giorni" color={ADM.INFO}/>
        <BroadKpi label="Tasso di apertura medio" value={`${Math.round(avgOpen*100)}%`} hint={`Click ${Math.round(avgClick*100)}%`} color={ADM.OK}/>
        <BroadKpi label="Tasso di conversione medio" value={`${Math.round(avgConv*100)}%`} hint="Azione completata" color={ADM.PURPLE}/>
      </div>

      {/* Toolbar */}
      <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
        <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Cronologia broadcast</div>
        <span style={{fontSize:13.3, color:ADM.MUTED}}>· filtra per canale</span>
        <div style={{flex:'0 0 14px'}}/>
        <PromoChip label="Tutti" active={chan==='all'} onClick={()=>setChan('all')}/>
        <PromoChip label="Push" icon="bell" active={chan==='push'} onClick={()=>setChan('push')}/>
        <PromoChip label="Email" icon="mail" active={chan==='email'} onClick={()=>setChan('email')}/>
        <PromoChip label="In-app" icon="phone" active={chan==='in_app'} onClick={()=>setChan('in_app')}/>
        <PromoChip label="SMS" icon="chat" active={chan==='sms'} onClick={()=>setChan('sms')}/>
        <div style={{flex:1}}/>
        <button onClick={onNew} style={{
          display:'inline-flex', alignItems:'center', gap:7,
          padding:'9px 16px',
          background:'linear-gradient(135deg, #FF5A5F, #E04347)',
          color:'#fff', border:'none', borderRadius:9,
          fontSize:14.4, fontWeight:700, cursor:'pointer',
          fontFamily:'inherit', boxShadow:'0 6px 18px -6px rgba(255,90,95,0.55)',
        }}>
          <BuIcons.plus size={18}/>
          Nuovo broadcast
        </button>
      </div>

      {/* Cards grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14}}>
        {filtered.map(it => <BroadCard key={it.id} item={it} onOpen={()=>setOpenId(it.id)}/>)}
      </div>

      {open && <BroadDetailDrawer item={open} onClose={()=>setOpenId(null)}/>}
    </div>
  );
}

function BroadKpi({ label, value, hint, color }) {
  return (
    <AdmCard padding={16}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
        <span style={{width:6, height:18, borderRadius:3, background:ADM.MUTED_LIGHT}}/>
        <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>{label}</div>
      </div>
      <div style={{fontSize:22.3, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{value}</div>
      <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>{hint}</div>
    </AdmCard>
  );
}

function PromoChip({ label, icon, active, onClick }) {
  const Icon = icon ? BuIcons[icon] : null;
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'6px 12px',
      background: active ? ADM.TEXT : '#fff',
      color: active ? '#fff' : ADM.TEXT,
      border: `1px solid ${active ? ADM.TEXT : ADM.BORDER}`,
      borderRadius: 999, fontSize:13.7, fontWeight:600,
      cursor:'pointer', fontFamily:'inherit',
    }}>
      {Icon && <Icon size={17} color={active ? '#fff' : ADM.MUTED}/>}
      {label}
    </button>
  );
}

function BroadCard({ item, onOpen }) {
  const [hover, setHover] = useStatePromo(false);
  const opens = Math.round(item.destinatari * item.aperti);
  const clicks = Math.round(item.destinatari * item.click);
  const convs = Math.round(item.destinatari * item.conv);

  // intensità engagement
  const engagement = item.aperti > 0.7 ? 'hot' : item.aperti > 0.5 ? 'good' : 'low';
  const engagementColor = engagement === 'hot' ? ADM.OK : engagement === 'good' ? ADM.WARN : ADM.MUTED;
  const engagementLabel = engagement === 'hot' ? 'Coinvolgimento alto' : engagement === 'good' ? 'Coinvolgimento medio' : 'Coinvolgimento basso';

  return (
    <button onClick={onOpen}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        all:'unset', cursor:'pointer', display:'block',
        padding:18, borderRadius:12,
        background:'#fff',
        border:`1px solid ${hover ? ADM.PINK : ADM.BORDER}`,
        boxShadow: hover ? `0 12px 28px -10px rgba(255,90,95,0.25)` : 'none',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition:'all 0.18s',
      }}>
      {/* Header */}
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:12}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap'}}>
            {item.canali.map(c => {
              const icons = {push:'bell', email:'mail', in_app:'phone', sms:'chat'};
              const Icon = BuIcons[icons[c]];
              const colors = {push:ADM.PINK, email:ADM.INFO, in_app:ADM.PURPLE, sms:ADM.WARN};
              return (
                <span key={c} style={{
                  width:22, height:22, borderRadius:5,
                  background:`${colors[c]}1A`, color:colors[c],
                  display:'grid', placeItems:'center',
                }}><Icon size={16}/></span>
              );
            })}
            <span style={{fontSize:12.6, color:ADM.MUTED}}>· {fmtRelative(item.data)}</span>
          </div>
          <div style={{fontSize:15.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em', lineHeight:1.3, marginBottom:4}}>{item.titolo}</div>
          <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.4}}>{item.audience}</div>
        </div>
        <span style={{
          padding:'4px 9px', borderRadius:99,
          background:`${engagementColor}15`, color:engagementColor,
          fontSize:12.6, fontWeight:700, whiteSpace:'nowrap',
          textTransform:'uppercase', letterSpacing:'0.04em',
        }}>{engagementLabel}</span>
      </div>

      {/* Stats grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:10, paddingTop:12, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
        <BroadStat label="Inviati"  value={fmtNum(item.destinatari)} color={ADM.MUTED}/>
        <BroadStat label="Aperti"   value={fmtNum(opens)}    color={ADM.OK}      pct={item.aperti}/>
        <BroadStat label="Click"    value={fmtNum(clicks)}   color={ADM.INFO}    pct={item.click}/>
        <BroadStat label="Conv."    value={fmtNum(convs)}    color={ADM.PURPLE}  pct={item.conv}/>
      </div>
    </button>
  );
}

function BroadStat({ label, value, color, pct }) {
  return (
    <div>
      <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3}}>{label}</div>
      <div style={{fontSize:16.6, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>{value}</div>
      {pct !== undefined && (
        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:4}}>
          <div style={{flex:1, height:3, background:'#F0F1F3', borderRadius:99, overflow:'hidden'}}>
            <div style={{width:`${Math.round(pct*100)}%`, height:'100%', background:color, borderRadius:99}}/>
          </div>
          <span style={{fontSize:12.2, fontWeight:700, color, minWidth:28, textAlign:'right'}}>{Math.round(pct*100)}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Drawer dettaglio broadcast ──────────────────────────────────────────────
function BroadDetailDrawer({ item, onClose }) {
  const opens = Math.round(item.destinatari * item.aperti);
  const clicks = Math.round(item.destinatari * item.click);
  const convs = Math.round(item.destinatari * item.conv);
  const unsubs = Math.round(item.destinatari * item.unsub);

  const funnel = [
    { label:'Inviati',     count: item.destinatari, color: ADM.MUTED },
    { label:'Aperti',      count: opens,             color: ADM.OK },
    { label:'Click',       count: clicks,            color: ADM.INFO },
    { label:'Conversioni', count: convs,             color: ADM.PURPLE },
  ];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', justifyContent:'flex-end',
      background:'rgba(15,17,21,0.45)', animation:'fadeIn 0.15s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:680, maxWidth:'95%', background:'#fff', height:'100%',
        display:'flex', flexDirection:'column',
        animation:'slideIn 0.2s ease',
        boxShadow:'-12px 0 32px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{padding:'20px 24px', borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap'}}>
            {item.canali.map(c => {
              const icons = {push:'bell', email:'mail', in_app:'phone', sms:'chat'};
              const labels = {push:'Push', email:'Email', in_app:'In-app', sms:'SMS'};
              const Icon = BuIcons[icons[c]];
              return (
                <span key={c} style={{display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:5, background:'#F0F1F3', fontSize:13, fontWeight:600, color:ADM.TEXT}}>
                  <Icon size={16}/>{labels[c]}
                </span>
              );
            })}
            <span style={{fontSize:13, color:ADM.MUTED, fontFamily:'ui-monospace,monospace'}}>{item.id}</span>
            <div style={{flex:1}}/>
            <AdmIconBtn icon="x" onClick={onClose}/>
          </div>
          <div style={{fontSize:19.4, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em', marginBottom:6}}>{item.titolo}</div>
          <div style={{fontSize:14, color:ADM.MUTED}}>{item.audience} · inviata {fmtDateTime(item.data)}</div>

          <div style={{display:'flex', gap:8, marginTop:14}}>
            <AdmButton variant="secondary" size="sm" icon="copy">Duplica</AdmButton>
            <AdmButton variant="secondary" size="sm" icon="download">Esporta report</AdmButton>
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1, overflow:'auto', padding:'22px 24px', background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:14}}>
          {/* Funnel */}
          <AdmCard padding={20}>
            <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Funnel campagna</div>
            <div style={{display:'flex', flexDirection:'column', gap:11}}>
              {funnel.map(f => {
                const pct = funnel[0].count ? f.count / funnel[0].count : 0;
                return (
                  <div key={f.label}>
                    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:5}}>
                      <span style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{f.label}</span>
                      <span style={{fontSize:13.3, color:ADM.MUTED}}>
                        <strong style={{color: f.color, fontWeight:700}}>{fmtNum(f.count)}</strong> · {Math.round(pct*100)}%
                      </span>
                    </div>
                    <div style={{height:10, borderRadius:5, background:'#F0F1F3', overflow:'hidden'}}>
                      <div style={{width:`${pct*100}%`, height:'100%', background:f.color, borderRadius:5}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </AdmCard>

          {/* Dettagli */}
          <AdmCard padding={20}>
            <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Dettagli</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <DetailStat label="Tasso di apertura" value={`${Math.round(item.aperti*100)}%`}/>
              <DetailStat label="Tasso di click"    value={`${Math.round(item.click*100)}%`}/>
              <DetailStat label="Tasso di conversione" value={`${Math.round(item.conv*100)}%`}/>
              <DetailStat label="Disiscritti"  value={`${unsubs} · ${(item.unsub*100).toFixed(1)}%`}/>
              <DetailStat label="Canali"  value={item.canali.map(c=>({push:'Push',email:'Email',in_app:'In-app',sms:'SMS'}[c])).join(' · ')}/>
              <DetailStat label="ID broadcast" value={item.id} mono/>
            </div>
            <div style={{marginTop:14, padding:'12px 14px', background: ADM.PANEL_SOFT, borderRadius:8, fontSize:13.7, color: ADM.MUTED, lineHeight:1.5}}>
              <strong style={{color: ADM.TEXT}}>Insight.</strong> {item.aperti > 0.7 ? 'Eccellente coinvolgimento: i destinatari sono altamente partecipi.' : item.aperti > 0.5 ? 'Buon coinvolgimento, ma c\'è margine sul testo dell\'oggetto.' : 'Tasso di apertura sotto la media: rivedere la selezione del pubblico o il testo dell\'oggetto.'}
            </div>
          </AdmCard>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value, mono }) {
  return (
    <div style={{padding:'10px 12px', background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:8}}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3}}>{label}</div>
      <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT, fontFamily: mono ? 'ui-monospace,monospace' : 'inherit'}}>{value}</div>
    </div>
  );
}

function PromoMiniStat({ label, value, hint, tone }) {
  return (
    <div style={{padding:'10px 12px', background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:8}}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3}}>{label}</div>
      <div style={{fontSize:16.6, fontWeight:800, color: tone || ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.1}}>{value}</div>
      {hint && <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:3, fontWeight:500}}>{hint}</div>}
    </div>
  );
}

window.AdmPromozioniPage = AdmPromozioniPage;

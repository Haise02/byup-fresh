// Marketing · Promozioni — tre tab, una sola impalcatura.
//
// Le tre tab rispondono alla stessa domanda in tre tempi: da dove arrivano gli
// utenti (campagne), che cosa gli abbiamo mandato una volta (broadcast), che
// cosa gli mandiamo da soli e per sempre (workflow). Prima ognuna aveva la sua
// forma — una tabella a nove colonne, una griglia di card, una lista — e
// passando da una all'altra sembrava di cambiare prodotto. Ora condividono tre
// pezzi: PromoHead (una frase e l'azione), PromoSummary (la striscia di misure)
// e PromoTable (il guscio della lista). A cambiare sono solo le colonne.
//
// Il colore segue il token: l'inchiostro porta i dati, il coral resta alla UI
// di brand e all'azione primaria, i colori semantici dicono uno stato e basta.

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

const BC_CANALI = { push:{icona:'bell', label:'Push'}, email:{icona:'mail', label:'Email'}, in_app:{icona:'phone', label:'In-app'}, sms:{icona:'chat', label:'SMS'} };

// ═════════════════════════ IMPALCATURA CONDIVISA ═════════════════════════════
// I tre pezzi che rendono le tab riconoscibili come la stessa pagina. Vivono
// qui e la tab Workflow (altro file) li importa dal window: sono la definizione
// di «come si legge una lista in Promozioni».

const PROMO_SHELL = { padding:'22px 28px 28px', display:'flex', flexDirection:'column', gap:16 };
const PROMO_LAB   = { fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em' };

// Capo pagina: una frase che dice che cosa si sta guardando, e l'azione.
// Nessun titolo — lo dice già la tab attiva venti pixel più su.
function PromoHead({ testo, azione }) {
  return (
    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20}}>
      <div style={{fontSize:13.6, color:ADM.MUTED, lineHeight:1.55, maxWidth:720}}>{testo}</div>
      {azione}
    </div>
  );
}

function PromoTrend({ v }) {
  if (typeof v !== 'number') return null;
  const su = v >= 0;
  const col = su ? ADM.OK : ADM.DANGER;
  const I = BuIcons[su ? 'trendUp' : 'trendDown'];
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:2, color:col, fontSize:12, fontWeight:700}}>
      <I size={13}/>{su ? '+' : ''}{String(v).replace('.', ',')}%
    </span>
  );
}

// Striscia di sintesi: una card sola al posto di quattro. Le misure si leggono
// in fila, separate da un filo; la ripartizione, quando c'è, sta nella stessa
// card invece che in un grafico a parte che ripete gli stessi numeri.
function PromoSummary({ voci, quote, notaQuote }) {
  return (
    <AdmCard padding={0} style={{overflow:'hidden'}}>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${voci.length}, minmax(0,1fr))`}}>
        {voci.map((v, i) => (
          <div key={v.label} style={{padding:'15px 20px 16px', borderLeft: i ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
            <div style={PROMO_LAB}>{v.label}</div>
            <div style={{display:'flex', alignItems:'baseline', gap:7, marginTop:7, flexWrap:'wrap'}}>
              <span style={{fontSize:27, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>{v.valore}</span>
              {v.unita && <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>{v.unita}</span>}
            </div>
            <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:7, lineHeight:1.45}}>{v.sotto}</div>
          </div>
        ))}
      </div>
      {quote && quote.length > 0 && <PromoQuote quote={quote} nota={notaQuote}/>}
    </AdmCard>
  );
}

function PromoQuote({ quote, nota }) {
  const tot = quote.reduce((s, q) => s + q.valore, 0) || 1;
  return (
    <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`, background:ADM.PANEL_SOFT, padding:'13px 20px 15px'}}>
      {nota && <div style={{...PROMO_LAB, marginBottom:9}}>{nota}</div>}
      <div style={{display:'flex', height:9, borderRadius:99, overflow:'hidden', background:'#EAEBEE'}}>
        {quote.map(q => (
          <div key={q.label} title={`${q.label} · ${fmtNum(q.valore)}`}
            style={{width:`${q.valore / tot * 100}%`, background:q.colore}}/>
        ))}
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:'7px 24px', marginTop:11}}>
        {quote.map(q => (
          <span key={q.label} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12.8, color:ADM.MUTED, whiteSpace:'nowrap'}}>
            <span style={{width:9, height:9, borderRadius:3, background:q.colore, flexShrink:0}}/>
            <span style={{color:ADM.TEXT, fontWeight:600}}>{q.label}</span>
            <span style={{color:ADM.TEXT, fontWeight:700}}>{fmtNum(q.valore)}</span>
            <span>· {Math.round(q.valore / tot * 100)}%</span>
            <PromoTrend v={q.trend}/>
          </span>
        ))}
      </div>
    </div>
  );
}

// Guscio della lista. `teste` sono le intestazioni: { label, num, key }.
// Passando `ordine`/`onOrdina` le colonne con una `key` diventano ordinabili.
function PromoTable({ cols, teste, ordine, onOrdina, children }) {
  return (
    <AdmCard padding={0} style={{overflow:'hidden'}}>
      <div style={{display:'grid', gridTemplateColumns:cols, gap:12, alignItems:'center',
        padding:'9px 18px', background:'#FAFAFB', borderBottom:`1px solid ${ADM.BORDER}`}}>
        {teste.map((t, i) => {
          const base = {...PROMO_LAB, textAlign: t.num ? 'right' : 'left', minWidth:0,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'};
          if (!t.key || !onOrdina) return <div key={i} style={base}>{t.label}</div>;
          const attiva = ordine && ordine.key === t.key;
          return (
            // `justifySelf`: in griglia il bottone si allargava per tutta la
            // cella anche con padding zero, quindi la manina e lo sbiadire di
            // `.adm-textlink:hover` prendevano l'intera colonna invece del
            // nome. Si stringe restando dov'era — a destra le numeriche,
            // a sinistra le altre.
            <button key={i} onClick={()=>onOrdina(t.key)} className="adm-textlink"
              style={{...base, background:'none', border:'none', padding:0, margin:0,
                fontFamily:'inherit', cursor:'pointer',
                color: attiva ? ADM.TEXT : ADM.MUTED,
                display:'inline-flex', gap:3, alignItems:'center', overflow:'visible',
                justifySelf: t.num ? 'end' : 'start', alignSelf:'center',
                justifyContent: t.num ? 'flex-end' : 'flex-start'}}>
              {t.label}
              {attiva && (
                <span style={{display:'inline-flex', transform: ordine.asc ? 'rotate(180deg)' : 'none'}}>
                  <BuIcons.chevronDown size={13}/>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {children}
    </AdmCard>
  );
}

// Intestazione di gruppo dentro la tabella: separa Paid da Referral senza
// ripetere la riga delle colonne.
function PromoGroup({ titolo, conta, desc }) {
  return (
    <div style={{padding:'11px 18px 9px', display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap',
      background:'#FCFCFD', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
      <span style={{fontSize:12.8, fontWeight:800, color:ADM.TEXT}}>{titolo}</span>
      <span style={{fontSize:12.4, color:ADM.MUTED}}>{conta} · {desc}</span>
    </div>
  );
}

// Cella numerica: il valore, e sotto il contesto che lo rende leggibile.
function PromoNum({ v, sotto, tono, sottoTono }) {
  return (
    <div style={{textAlign:'right', minWidth:0}}>
      <div style={{fontSize:14.4, fontWeight:700, color: tono || ADM.TEXT, lineHeight:1.15, letterSpacing:'-0.015em',
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v}</div>
      {sotto && <div style={{fontSize:11.8, color: sottoTono || ADM.MUTED, marginTop:3,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{sotto}</div>}
    </div>
  );
}

function PromoVuoto({ testo }) {
  return <div style={{padding:'26px 18px', fontSize:13.4, color:ADM.MUTED_SOFT, textAlign:'center'}}>{testo}</div>;
}

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
// Sette colonne dimensionate sul contenuto invece di nove schiacciate: il nome
// della campagna — l'unica cosa che serve per riconoscerla — non si tronca più.
// Click, conversione e payback non sono spariti: sono passati sotto il numero
// che spiegano, dove si leggono meglio di quanto facessero da colonna a sé.
const CAMP_COLS = 'minmax(0,1.9fr) 1.15fr 0.62fr 0.82fr 0.82fr 0.6fr 1.05fr 16px';

const CAMP_TESTE = [
  { label:'Campagna' },
  { label:'Spesa / tetto' },
  { label:'Click', num:true },
  { label:'Iscritti', num:true },
  { label:'Paganti', num:true },
  { label:'CAC', num:true },
  { label:'MRR generato', num:true },
  { label:'' },
];

// Payback: Speso ÷ MRR (in mesi), formattato dinamicamente in ore / giorni /
// settimane / mesi a seconda della scala.
const fmtPaybackMonths = (m) => {
  if (!isFinite(m) || m <= 0) return '—';
  const days = m * 30;
  if (days < 1) {
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

function CampagnePane({ onNew }) {
  const [creating, setCreating] = useStatePromo(false);
  const [openCamp, setOpenCamp] = useStatePromo(null);
  const [campList, setCampList] = useStatePromo(CAMPAGNE);

  const paid     = campList.filter(c => c.tipo === 'paid');
  const referral = campList.filter(c => c.tipo === 'referral');

  const totPaid = paid.reduce((s,c)=>s+c.utentiAcquisiti, 0);
  const totRef  = referral.reduce((s,c)=>s+c.utentiAcquisiti, 0);
  const totOrg  = ACQ_30G.organico;
  const tot     = totPaid + totRef + totOrg;

  const spesoPaid  = paid.reduce((s,c)=>s+(c.speso||0), 0);
  const totPaganti = paid.reduce((s,c)=>s+(c.paganti||0), 0);
  const totMrr     = paid.reduce((s,c)=>s+(c.mrr||0), 0) + referral.reduce((s,c)=>s+(c.mrr||0), 0);
  const cac        = totPaganti > 0 ? Math.round(spesoPaid / totPaganti) : 0;
  // Il payback si calcola sulla stessa base del MRR che sta al denominatore:
  // prima al numeratore c'era la sola spesa Paid contro l'MRR di tutte le
  // campagne, e il risultato — «16 h» — misurava due insiemi diversi.
  const spesoTot = campList.reduce((s,c)=>s+(c.speso||0), 0);
  const payback  = totMrr > 0 ? spesoTot / totMrr : 0;

  const addCampagna = (nome, tipo, budgetMensile) => {
    const newC = {
      id: `cmp_${tipo.slice(0,2)}${String(campList.length+1).padStart(2,'0')}`,
      nome, tipo,
      creata: new Date(),
      budgetMensile: budgetMensile || 0,
      speso: 0, click: 0, iscritti: 0, paganti: 0, mrr: 0,
      utentiAcquisiti: 0, conv: 0, costo: 0,
    };
    setCampList([newC, ...campList]);
    return newC;
  };

  return (
    <div style={PROMO_SHELL}>
      <PromoHead
        testo={<>Ogni campagna ha un link tracciato: da lì contiamo click, iscritti e paganti. Apri una riga per copiare il link o aggiornare lo speso.</>}
        azione={<AdmButton variant="cta" icon="plus" style={{whiteSpace:'nowrap', flexShrink:0}} onClick={()=>setCreating(true)}>Nuova campagna</AdmButton>}
      />

      <PromoSummary
        voci={[
          { label:'Nuovi utenti · 30 giorni', valore: fmtNum(tot), sotto:'Somma dei tre canali di acquisizione' },
          { label:'CAC medio · Paid', valore: fmtEur(cac), sotto:`${fmtEur(spesoPaid)} spesi ÷ ${fmtNum(totPaganti)} paganti` },
          { label:'MRR generato', valore: fmtEur(totMrr), unita:'/ mese', sotto:'Da tutte le campagne tracciate' },
          { label:'Payback', valore: fmtPaybackMonths(payback), sotto:`${fmtEur(spesoTot)} spesi ÷ MRR generato` },
        ]}
        notaQuote="Ripartizione dei nuovi utenti"
        quote={[
          { label:'Paid',     valore: totPaid, colore: ADM.INK,               trend: -2.8 },
          { label:'Organico', valore: totOrg,  colore: 'rgba(49,53,61,0.52)', trend: 6.4 },
          { label:'Referral', valore: totRef,  colore: 'rgba(49,53,61,0.24)', trend: 12.1 },
        ]}
      />

      <PromoTable cols={CAMP_COLS} teste={CAMP_TESTE}>
        <PromoGroup titolo="Paid" conta={`${paid.length} campagne`} desc="investimento in media a pagamento"/>
        {paid.length === 0 && <PromoVuoto testo="Nessuna campagna Paid. Creane una col pulsante in alto."/>}
        {paid.map(c => <CampRow key={c.id} camp={c} onClick={()=>setOpenCamp(c)}/>)}

        <PromoGroup titolo="Referral" conta={`${referral.length} campagne`} desc="link condivisibili per il passaparola"/>
        {referral.length === 0 && <PromoVuoto testo="Nessuna campagna Referral."/>}
        {referral.map(c => <CampRow key={c.id} camp={c} onClick={()=>setOpenCamp(c)}/>)}

        {/* Organico non ha una riga di campagna perché non ha un link da
            tracciare: sta in coda, con la sua sola misura, così è chiaro
            perché non compare nella lista sopra. */}
        <div style={{padding:'13px 18px', display:'flex', alignItems:'center', gap:12,
          borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT}}>
          <div style={{width:30, height:30, borderRadius:8, background:'#EDEEF0', color:ADM.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>
            <BuIcons.trendUp size={18}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>Organico</div>
            <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:1}}>Traffico spontaneo: store, ricerca, passaparola non tracciato — nessun link, nessun costo attribuito</div>
          </div>
          <div style={{textAlign:'right', flexShrink:0}}>
            <div style={{fontSize:16.6, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{fmtNum(totOrg)}</div>
            <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:2}}>utenti · 30 giorni</div>
          </div>
        </div>
      </PromoTable>

      {creating && <NewCampaignModal onClose={()=>setCreating(false)} onCreate={(nome, tipo, budgetMensile)=>{
        const c = addCampagna(nome, tipo, budgetMensile);
        setCreating(false);
        setOpenCamp(c);
      }}/>}
      {openCamp && <CampaignLinkModal camp={openCamp} onClose={()=>setOpenCamp(null)}/>}
    </div>
  );
}

function CampRow({ camp: c, onClick }) {
  const cac    = c.paganti > 0 ? c.speso / c.paganti : 0;
  const budget = c.budgetMensile || 0;
  const speso  = c.speso || 0;
  const pct    = budget > 0 ? Math.min(1, speso / budget) : 0;
  const over   = budget > 0 && speso > budget;
  const pb     = (c.mrr || 0) > 0 ? speso / c.mrr : 0;
  const lento  = pb >= 6;

  return (
    <div className="adm-row-open" onClick={onClick} style={{
      display:'grid', gridTemplateColumns:CAMP_COLS, gap:12, alignItems:'center',
      padding:'12px 18px', background:'#fff',
      // la freccia eredita da qui: così `.adm-row-open:hover .adm-row-chev`
      // può accenderla, cosa che uno stile inline sulla freccia impedirebbe
      color: ADM.MUTED_LIGHT,
      borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
    }}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.nome}</div>
        <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, fontFamily:'ui-monospace,monospace'}}>{c.id}</div>
      </div>

      <div style={{minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', gap:5, whiteSpace:'nowrap'}}>
          <span style={{fontSize:14, fontWeight:700, color: over ? ADM.WARN : ADM.TEXT, letterSpacing:'-0.015em'}}>{fmtEur(speso)}</span>
          <span style={{fontSize:11.6, color:ADM.MUTED}}>{budget > 0 ? `di ${fmtEur(budget)}` : 'senza tetto'}</span>
        </div>
        {budget > 0 ? (
          <div style={{height:4, background:'#EDEEF0', borderRadius:99, overflow:'hidden', marginTop:6}}>
            <div style={{width:`${pct*100}%`, height:'100%', borderRadius:99,
              background: over ? ADM.DANGER : (pct > 0.85 ? ADM.WARN : ADM.INK)}}/>
          </div>
        ) : <div style={{height:4, marginTop:6}}/>}
      </div>

      <PromoNum v={fmtNum(c.click)}/>
      <PromoNum v={fmtNum(c.iscritti)} sotto={c.click > 0 ? `${(c.iscritti/c.click*100).toFixed(1).replace('.', ',')}% dei click` : null}/>
      <PromoNum v={fmtNum(c.paganti)} sotto={c.iscritti > 0 ? `${Math.round(c.paganti/c.iscritti*100)}% iscritti` : null}/>
      <PromoNum v={c.paganti > 0 ? fmtEur(Math.round(cac)) : '—'}/>
      <PromoNum
        v={fmtEur(c.mrr || 0)}
        sotto={pb > 0 ? `rientro in ${fmtPaybackMonths(pb)}` : '/ mese'}
        sottoTono={lento ? ADM.WARN : undefined}
      />

      <span className="adm-row-chev" style={{justifySelf:'end'}}><BuIcons.chevronRight size={16}/></span>
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
      <ModalTestata
        icona="plus"
        titolo="Nuova campagna"
        sotto="Genera un link tracciato da condividere"
      />
      <div style={{padding:'20px 24px 22px'}}>
        <div style={{marginBottom:18}}>
          <label style={PROMO_CAMPO_LAB}>Nome campagna</label>
          <input
            autoFocus
            value={nome}
            onChange={e=>setNome(e.target.value)}
            placeholder='Es. "LinkedIn Q1 Trattorie Roma"'
            style={PROMO_INPUT}
            onKeyDown={e=>{ if (e.key === 'Enter' && canCreate) onCreate(nome.trim(), tipo, budgetNum); }}
          />
          <div style={PROMO_AIUTO}>Minimo 3 caratteri. Sarà visibile nel link e nelle analitiche.</div>
        </div>

        <div style={{marginBottom:18}}>
          <label style={PROMO_CAMPO_LAB}>
            Budget mensile {tipo === 'referral' && <span style={{textTransform:'none', color:ADM.MUTED_SOFT, fontWeight:500, letterSpacing:0}}>· opzionale per i referral</span>}
          </label>
          <div style={{position:'relative'}}>
            <span style={{
              position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
              fontSize:14.4, fontWeight:700, color: budgetNum > 0 ? ADM.TEXT : ADM.MUTED_SOFT,
              pointerEvents:'none',
            }}>€</span>
            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={e=>setBudget(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Es. 1500"
              style={{...PROMO_INPUT, padding:'11px 13px 11px 28px', fontWeight: budgetNum > 0 ? 700 : 400}}
              onKeyDown={e=>{ if (e.key === 'Enter' && canCreate) onCreate(nome.trim(), tipo, budgetNum); }}
            />
            {budgetNum > 0 && (
              <span style={{
                position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                fontSize:12.4, fontWeight:600, color:ADM.MUTED, pointerEvents:'none',
              }}>/ mese</span>
            )}
          </div>
          <div style={PROMO_AIUTO}>
            Tetto di spesa mensile pianificato. Lo speso effettivo si inserisce a mano dal dettaglio campagna; CAC e payback si calcolano da lì.
          </div>
        </div>

        <div style={{marginBottom:22}}>
          <label style={PROMO_CAMPO_LAB}>Tipo</label>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <TipoTile label="Paid" desc="Investimento media: ads, sponsorizzate" icon="megaphone" active={tipo==='paid'} onClick={()=>setTipo('paid')}/>
            <TipoTile label="Referral" desc="Passaparola, programmi ambassador" icon="users" active={tipo==='referral'} onClick={()=>setTipo('referral')}/>
          </div>
        </div>

        <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
          <AdmButton variant="secondary" onClick={onClose}>Annulla</AdmButton>
          <AdmButton variant="cta" disabled={!canCreate} icon="link"
            onClick={()=>canCreate && onCreate(nome.trim(), tipo, budgetNum)}>Genera link</AdmButton>
        </div>
      </div>
    </ModalOverlay>
  );
}

const PROMO_CAMPO_LAB = { display:'block', fontSize:11.6, color:ADM.MUTED, fontWeight:700, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.06em' };
const PROMO_INPUT = {
  width:'100%', padding:'11px 13px',
  fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
  border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  outline:'none', boxSizing:'border-box', background:'#fff',
};
const PROMO_AIUTO = { fontSize:12.4, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.5 };

function TipoTile({ label, desc, icon, active, onClick }) {
  const Icon = BuIcons[icon];
  return (
    <button onClick={onClick} className="adm-btn" style={{
      padding:'13px 14px', textAlign:'left',
      background: active ? ADM.PINK_BG_SOFT : '#fff',
      border:`1px solid ${active ? ADM.PINK : ADM.BORDER}`,
      borderRadius:10, cursor:'pointer', fontFamily:'inherit',
      display:'flex', gap:11, alignItems:'flex-start',
      boxShadow: active ? `0 0 0 3px rgba(255,90,95,0.12)` : 'none',
    }}>
      <span style={{width:28, height:28, borderRadius:7, flexShrink:0, display:'grid', placeItems:'center',
        background: active ? ADM.PINK : '#F0F1F3', color: active ? '#fff' : ADM.MUTED}}><Icon size={17}/></span>
      <span style={{minWidth:0}}>
        <span style={{display:'block', fontSize:14, fontWeight:700, color:ADM.TEXT}}>{label}</span>
        <span style={{display:'block', fontSize:12.4, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{desc}</span>
      </span>
    </button>
  );
}

// ─── Modale: link generato / recupero link ───────────────────────────────────
// Le tre derivate non sono più tre tessere rosso-verde-blu: un semaforo dove
// non c'è nessuno stato da segnalare. Sono tre misure con la stessa forma delle
// tre sopra; il colore compare solo quando il payback è davvero lento.
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
  const pb = mrr > 0 ? speso / mrr : 0;
  const pbLento = pb >= 6;

  const copy = () => {
    try { navigator.clipboard?.writeText(link); } catch (_) {}
    setCopied(true);
    setTimeout(()=>setCopied(false), 1800);
  };

  return (
    <ModalOverlay onClose={onClose} width={600}>
      <ModalTestata
        icona="link"
        titolo={camp.nome}
        sotto={`${camp.tipo === 'paid' ? 'Campagna Paid' : 'Campagna Referral'} · creata ${fmtDateTime(camp.creata)}`}
        badge={isNew ? 'Appena creata' : null}
        onClose={onClose}
      />

      <div style={{padding:'18px 24px 22px', maxHeight:'72vh', overflow:'auto', display:'flex', flexDirection:'column', gap:16}}>
        {/* Link */}
        <div style={{
          padding:'13px 15px',
          background: copied ? ADM.OK_SOFT : ADM.PANEL_SOFT,
          border:`1px solid ${copied ? ADM.OK : ADM.BORDER}`,
          borderRadius:10, transition:'all 0.2s',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:7}}>
            <BuIcons.link size={15} color={copied ? ADM.OK : ADM.MUTED}/>
            <span style={{...PROMO_LAB, color: copied ? ADM.OK : ADM.MUTED}}>
              {copied ? 'Link copiato negli appunti' : 'Link tracciato'}
            </span>
          </div>
          <div style={{fontFamily:'ui-monospace,monospace', fontSize:13, color:ADM.TEXT, wordBreak:'break-all', lineHeight:1.55}}>{link}</div>
        </div>

        {/* Spesa */}
        <div>
          <div style={{...PROMO_LAB, marginBottom:9}}>Spesa</div>
          <div style={{
            padding:'13px 15px', borderRadius:10,
            background: overBudget ? ADM.WARN_SOFT : ADM.PANEL_SOFT,
            border:`1px solid ${overBudget ? '#EBD9B4' : ADM.BORDER_SOFT}`,
          }}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10, flexWrap:'wrap'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8, minWidth:0, flexWrap:'wrap'}}>
                {editingSpeso ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                    <span style={{fontSize:18, fontWeight:800, color:ADM.TEXT}}>€</span>
                    <input
                      autoFocus type="text" inputMode="numeric"
                      value={speso}
                      onChange={e=>setSpeso(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                      onBlur={()=>setEditingSpeso(false)}
                      onKeyDown={e=>{ if (e.key === 'Enter' || e.key === 'Escape') setEditingSpeso(false); }}
                      style={{width:96, padding:'2px 6px', fontSize:18, fontWeight:800, fontFamily:'inherit',
                        color:ADM.TEXT, border:`1px solid ${ADM.PINK}`, borderRadius:6, outline:'none', background:'#fff'}}
                    />
                  </span>
                ) : (
                  <button onClick={()=>setEditingSpeso(true)} title="Clicca per modificare" style={{
                    all:'unset', cursor:'pointer',
                    fontSize:19.4, fontWeight:800, letterSpacing:'-0.025em',
                    color: overBudget ? ADM.WARN : ADM.TEXT,
                    borderBottom:`1px dashed ${ADM.MUTED_LIGHT}`,
                  }}>{fmtEur(speso)}</button>
                )}
                {budget > 0 && <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>di {fmtEur(budget)} di tetto mensile</span>}
              </div>
              {budget > 0 && (
                <span style={{fontSize:12.4, fontWeight:700, whiteSpace:'nowrap',
                  color: (overBudget || pctBudget > 0.85) ? ADM.WARN : ADM.MUTED}}>
                  {overBudget ? `+${Math.round((speso-budget)/budget*100)}% oltre il tetto` : `${Math.round(pctBudget*100)}% del tetto`}
                </span>
              )}
            </div>
            {budget > 0 && (
              <div style={{height:5, background:'#EAEBEE', borderRadius:99, overflow:'hidden', marginTop:10}}>
                <div style={{width:`${Math.min(100, pctBudget*100)}%`, height:'100%', borderRadius:99,
                  background: (overBudget || pctBudget > 0.85) ? ADM.WARN : ADM.INK, transition:'width 0.3s'}}/>
              </div>
            )}
            <div style={{fontSize:12.4, color:ADM.MUTED_SOFT, marginTop:9, display:'flex', alignItems:'center', gap:5}}>
              <BuIcons.info size={14}/> Lo speso è inserito a mano: clicca sul valore per aggiornarlo.
            </div>
          </div>
        </div>

        {/* Funnel + derivate, stessa forma */}
        <div>
          <div style={{...PROMO_LAB, marginBottom:9}}>Risultati · tracciati dal link</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8, marginBottom:8}}>
            <PromoMiniStat label="Click" value={fmtNum(click)} hint="aperture del link"/>
            <PromoMiniStat label="Iscritti" value={fmtNum(iscritti)} hint={click > 0 ? `${(iscritti/click*100).toFixed(1).replace('.', ',')}% dei click` : 'al signup'}/>
            <PromoMiniStat label="Paganti" value={fmtNum(paganti)} hint={iscritti > 0 ? `${Math.round(paganti/iscritti*100)}% degli iscritti` : 'al 1° pagamento'}/>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8}}>
            <PromoMiniStat label="CAC" value={paganti > 0 ? fmtEur(Math.round(cac * 100) / 100) : '—'} hint="speso ÷ paganti"/>
            <PromoMiniStat label="MRR generato" value={fmtEur(mrr)} hint={`da ${fmtNum(paganti)} ${paganti === 1 ? 'pagante' : 'paganti'} · al mese`}/>
            <PromoMiniStat label="Payback" value={mrr > 0 ? fmtPaybackMonths(pb) : '—'}
              hint={mrr > 0 ? (pbLento ? 'speso ÷ MRR · lento' : 'speso ÷ MRR') : 'speso ÷ MRR'}
              tono={pbLento ? ADM.WARN : null}/>
          </div>
        </div>

        {!hasActivity && (
          <div style={{padding:'12px 14px', background:ADM.INFO_SOFT, border:`1px solid #C9DBF8`, borderRadius:9,
            fontSize:13.4, color:'#1E40AF', lineHeight:1.5, display:'flex', gap:8, alignItems:'flex-start'}}>
            <BuIcons.info size={16}/>
            <span>Condividi il link per iniziare a raccogliere acquisizioni. Click, iscritti e paganti appariranno qui automaticamente.</span>
          </div>
        )}

        <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
          <AdmButton variant="secondary" onClick={onClose}>Chiudi</AdmButton>
          <AdmButton variant={copied ? 'success' : 'cta'} icon={copied ? 'check' : 'copy'} onClick={copy}>
            {copied ? 'Copiato' : 'Copia link'}
          </AdmButton>
        </div>
      </div>
    </ModalOverlay>
  );
}

// Testata di modale condivisa: stessa forma per «nuova campagna» e «dettaglio».
function ModalTestata({ icona, titolo, sotto, badge, onClose }) {
  const Icon = BuIcons[icona];
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'20px 24px 18px', borderBottom:`1px solid ${ADM.BORDER}`}}>
      <div style={{width:38, height:38, borderRadius:10, flexShrink:0, display:'grid', placeItems:'center',
        background:ADM.NEUTRAL_SOFT, color:ADM.TEXT}}>
        <Icon size={20}/>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
          <span style={{fontSize:16.6, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.015em',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{titolo}</span>
          {badge && <span style={{fontSize:11.6, fontWeight:700, color:ADM.OK, padding:'2px 7px', borderRadius:99,
            background:ADM.OK_SOFT, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap'}}>{badge}</span>}
        </div>
        <div style={{fontSize:13, color:ADM.MUTED, marginTop:3}}>{sotto}</div>
      </div>
      {onClose && <AdmIconBtn icon="x" onClick={onClose}/>}
    </div>
  );
}

function ModalOverlay({ onClose, children, width = 560 }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:80,
      background:'rgba(15,17,21,0.5)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
      display:'grid', placeItems:'center', padding:24,
      animation:'fadeIn 0.15s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:`min(${width}px, 100%)`,
        background:'#fff', borderRadius:16,
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow:'hidden',
      }}>{children}</div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform: translateY(8px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

// ═════════════════════════ TAB 2 · BROADCAST ═════════════════════════════════
// Le card sono diventate righe. Sette card a due colonne non si confrontavano:
// altezze diverse, nessun ordine, e per sapere quale broadcast ha reso di più
// bisognava leggerle tutte. In tabella si ordinano per la colonna che interessa.
// La pastiglia «coinvolgimento alto/medio» è sparita perché era un giudizio
// ricavato dal solo tasso di apertura, urlato accanto al tasso stesso: adesso
// il confronto con la media del periodo si legge sul numero, dove nasce.
const BC_COLS = 'minmax(0,1.75fr) minmax(0,1.35fr) 0.68fr 0.95fr 0.78fr 0.85fr 16px';

function BroadcastPane({ onNew }) {
  const [chan, setChan] = useStatePromo('all');
  const [openId, setOpenId] = useStatePromo(null);
  const [ordine, setOrdine] = useStatePromo({ key:'data', asc:false });

  const recent = BROADCAST_ITEMS.filter(i => i.data > new Date(Date.now() - 86400000 * 30));
  const totDest  = recent.reduce((s,i)=>s+i.destinatari, 0);
  const avgOpen  = recent.reduce((s,i)=>s+i.aperti*i.destinatari, 0) / (totDest || 1);
  const avgClick = recent.reduce((s,i)=>s+i.click*i.destinatari, 0) / (totDest || 1);
  const avgConv  = recent.reduce((s,i)=>s+i.conv*i.destinatari, 0) / (totDest || 1);

  const conta = (c) => BROADCAST_ITEMS.filter(i => i.canali.includes(c)).length;

  const filtered = useMemoPromo(() => {
    const base = chan === 'all' ? BROADCAST_ITEMS : BROADCAST_ITEMS.filter(i => i.canali.includes(chan));
    const val = (i) => ({
      data: i.data.getTime(), destinatari: i.destinatari,
      aperti: i.aperti, click: i.click, conv: i.conv,
    }[ordine.key]);
    return [...base].sort((a,b) => (val(a) - val(b)) * (ordine.asc ? 1 : -1));
  }, [chan, ordine]);

  const ordina = (key) => setOrdine(o => o.key === key ? { key, asc: !o.asc } : { key, asc: false });
  const open = BROADCAST_ITEMS.find(i => i.id === openId);

  return (
    <div style={PROMO_SHELL}>
      <PromoHead
        testo={<>Invii una tantum verso un pubblico scelto. Ordina per una colonna per confrontarli; in arancio i tassi sotto la media degli ultimi 30 giorni. Apri una riga per il funnel completo.</>}
        azione={<AdmButton variant="cta" icon="plus" style={{whiteSpace:'nowrap', flexShrink:0}} onClick={onNew}>Nuovo broadcast</AdmButton>}
      />

      <PromoSummary voci={[
        { label:'Broadcast · 30 giorni', valore: String(recent.length), sotto:`${BROADCAST_ITEMS.length} in tutto nello storico` },
        { label:'Utenti raggiunti', valore: fmtNum(totDest), sotto:'Somma dei destinatari · 30 giorni' },
        { label:'Apertura media', valore: `${Math.round(avgOpen*100)}%`, sotto:'Ponderata sui destinatari' },
        { label:'Conversione media', valore: `${Math.round(avgConv*100)}%`, sotto:`Ha completato l'azione · click ${Math.round(avgClick*100)}%` },
      ]}/>

      <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
        <span style={{...PROMO_LAB, marginRight:2}}>Canale</span>
        <PromoChip label="Tutti" n={BROADCAST_ITEMS.length} active={chan==='all'} onClick={()=>setChan('all')}/>
        {Object.keys(BC_CANALI).map(k => (
          <PromoChip key={k} label={BC_CANALI[k].label} icon={BC_CANALI[k].icona} n={conta(k)}
            active={chan===k} onClick={()=>setChan(k)}/>
        ))}
      </div>

      <PromoTable
        cols={BC_COLS}
        ordine={ordine}
        onOrdina={ordina}
        teste={[
          { label:'Broadcast', key:'data' },
          { label:'Pubblico' },
          { label:'Inviati', num:true, key:'destinatari' },
          { label:'Aperti', num:true, key:'aperti' },
          { label:'Click', num:true, key:'click' },
          { label:'Conversioni', num:true, key:'conv' },
          { label:'' },
        ]}>
        {filtered.length === 0 && <PromoVuoto testo="Nessun broadcast su questo canale."/>}
        {filtered.map((it, i) => (
          <BroadRow key={it.id} item={it} media={{open:avgOpen, click:avgClick, conv:avgConv}}
            last={i === filtered.length - 1} onOpen={()=>setOpenId(it.id)}/>
        ))}
      </PromoTable>

      {open && <BroadDetailDrawer item={open} onClose={()=>setOpenId(null)}/>}
    </div>
  );
}

function PromoChip({ label, icon, n, active, onClick }) {
  const Icon = icon ? BuIcons[icon] : null;
  return (
    <button className="adm-pill" onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'5px 11px',
      background: active ? ADM.TEXT : '#fff',
      color: active ? '#fff' : ADM.TEXT,
      border: `1px solid ${active ? ADM.TEXT : ADM.BORDER}`,
      borderRadius: 999, fontSize:13, fontWeight:600,
      cursor:'pointer', fontFamily:'inherit',
    }}>
      {Icon && <Icon size={15} color={active ? '#fff' : ADM.MUTED}/>}
      {label}
      <span style={{fontSize:11.8, fontWeight:700, color: active ? 'rgba(255,255,255,0.7)' : ADM.MUTED_SOFT}}>{n}</span>
    </button>
  );
}

function BroadRow({ item, media, last, onOpen }) {
  const opens  = Math.round(item.destinatari * item.aperti);
  const clicks = Math.round(item.destinatari * item.click);
  const convs  = Math.round(item.destinatari * item.conv);
  const sotto = (v, m) => v < m * 0.95;

  return (
    <div className="adm-row-open" onClick={onOpen} style={{
      display:'grid', gridTemplateColumns:BC_COLS, gap:12, alignItems:'center',
      padding:'12px 18px', background:'#fff', color: ADM.MUTED_LIGHT,
      borderBottom: last ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
    }}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.titolo}</div>
        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3}}>
          {item.canali.map(c => {
            const Icon = BuIcons[BC_CANALI[c].icona];
            return <span key={c} title={BC_CANALI[c].label} style={{color:ADM.MUTED_SOFT, display:'inline-flex'}}><Icon size={13}/></span>;
          })}
          <span style={{fontSize:11.6, color:ADM.MUTED_SOFT, fontFamily:'ui-monospace,monospace', marginLeft:2}}>{item.id}</span>
        </div>
      </div>

      <div style={{minWidth:0}}>
        <div style={{fontSize:13, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.audience}</div>
        <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:3}}>{fmtRelative(item.data)}</div>
      </div>

      <PromoNum v={fmtNum(item.destinatari)}/>
      <BroadTasso n={opens}  pct={item.aperti} basso={sotto(item.aperti, media.open)} barra/>
      <BroadTasso n={clicks} pct={item.click}  basso={sotto(item.click, media.click)}/>
      <BroadTasso n={convs}  pct={item.conv}   basso={sotto(item.conv, media.conv)}/>

      <span className="adm-row-chev" style={{justifySelf:'end'}}><BuIcons.chevronRight size={16}/></span>
    </div>
  );
}

function BroadTasso({ n, pct, basso, barra }) {
  const p = Math.round(pct * 100);
  return (
    <div style={{textAlign:'right', minWidth:0}}>
      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, lineHeight:1.15, letterSpacing:'-0.015em'}}>{fmtNum(n)}</div>
      {barra ? (
        <div style={{display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', marginTop:5}}>
          <div style={{flex:'1 1 auto', maxWidth:46, height:3, background:'#EAEBEE', borderRadius:99, overflow:'hidden'}}>
            <div style={{width:`${p}%`, height:'100%', background: basso ? ADM.WARN : ADM.INK, borderRadius:99}}/>
          </div>
          <span style={{fontSize:11.8, fontWeight:700, color: basso ? ADM.WARN : ADM.MUTED}}>{p}%</span>
        </div>
      ) : (
        <div style={{fontSize:11.8, fontWeight:700, color: basso ? ADM.WARN : ADM.MUTED, marginTop:3}}>{p}%</div>
      )}
    </div>
  );
}

// ─── Drawer dettaglio broadcast ──────────────────────────────────────────────
function BroadDetailDrawer({ item, onClose }) {
  const opens  = Math.round(item.destinatari * item.aperti);
  const clicks = Math.round(item.destinatari * item.click);
  const convs  = Math.round(item.destinatari * item.conv);
  const unsubs = Math.round(item.destinatari * item.unsub);

  // Funnel mono-hue: la profondità la dice l'intensità dell'inchiostro, non un
  // colore per riga (le righe sono già etichettate).
  const funnel = [
    { label:'Inviati',     count: item.destinatari, color: ADM.MUTED_LIGHT },
    { label:'Aperti',      count: opens,            color: 'rgba(49,53,61,0.45)' },
    { label:'Click',       count: clicks,           color: 'rgba(49,53,61,0.70)' },
    { label:'Conversioni', count: convs,            color: ADM.INK },
  ];

  return (
    <ModalOverlay onClose={onClose} width={720}>
      <div style={{display:'flex', flexDirection:'column', maxHeight:'86vh'}}>
        <div style={{flexShrink:0}}>
          <ModalTestata
            icona="send"
            titolo={item.titolo}
            sotto={`${item.audience} · inviata ${fmtDateTime(item.data)}`}
            onClose={onClose}
          />
          <div style={{padding:'12px 24px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
            {item.canali.map(c => {
              const Icon = BuIcons[BC_CANALI[c].icona];
              return (
                <span key={c} style={{display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6,
                  background:'#F0F1F3', fontSize:12.4, fontWeight:600, color:ADM.TEXT}}>
                  <Icon size={14}/>{BC_CANALI[c].label}
                </span>
              );
            })}
            <span style={{fontSize:12, color:ADM.MUTED_SOFT, fontFamily:'ui-monospace,monospace'}}>{item.id}</span>
            <div style={{flex:1}}/>
            <AdmButton variant="secondary" size="sm" icon="copy">Duplica</AdmButton>
            <AdmButton variant="secondary" size="sm" icon="download">Esporta report</AdmButton>
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'20px 24px 24px', background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:14}}>
          <AdmCard padding={18}>
            <div style={{...PROMO_LAB, marginBottom:14}}>Funnel dell'invio</div>
            <div style={{display:'flex', flexDirection:'column', gap:11}}>
              {funnel.map(f => {
                const pct = funnel[0].count ? f.count / funnel[0].count : 0;
                return (
                  <div key={f.label}>
                    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:5}}>
                      <span style={{fontSize:13.4, fontWeight:600, color:ADM.TEXT}}>{f.label}</span>
                      <span style={{fontSize:12.8, color:ADM.MUTED}}>
                        <strong style={{color:ADM.TEXT, fontWeight:700}}>{fmtNum(f.count)}</strong> · {Math.round(pct*100)}%
                      </span>
                    </div>
                    <div style={{height:9, borderRadius:5, background:'#EAEBEE', overflow:'hidden'}}>
                      <div style={{width:`${pct*100}%`, height:'100%', background:f.color, borderRadius:5}}/>
                    </div>
                  </div>
                );
              })}
              {/* La coda del funnel: chi ha lasciato la lista per colpa di
                  questo invio. Non sta nelle barre perché non è uno stadio
                  del percorso, ma è il costo dell'invio e va letto qui. */}
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between',
                paddingTop:12, marginTop:2, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                <span style={{fontSize:13.4, fontWeight:600, color:ADM.MUTED}}>Disiscritti</span>
                <span style={{fontSize:12.8, color:ADM.MUTED}}>
                  <strong style={{color: item.unsub > 0.01 ? ADM.WARN : ADM.TEXT, fontWeight:700}}>{fmtNum(unsubs)}</strong>
                  {' · '}{(item.unsub*100).toFixed(1).replace('.', ',')}% dei destinatari
                </span>
              </div>
            </div>
          </AdmCard>

          {/* Niente scheda «Dettagli» con tasso di apertura, click e conversione:
              erano gli stessi tre numeri del funnel qui sopra, riscritti in
              percentuale. Resta quello che il funnel non dice — chi se ne è
              andato — e la lettura. */}
          <AdmCard padding={18}>
            <div style={{...PROMO_LAB, marginBottom:12}}>Lettura</div>
            <div style={{fontSize:13.4, color:ADM.MUTED, lineHeight:1.6}}>
              {item.aperti > 0.7
                ? 'Eccellente coinvolgimento: i destinatari sono altamente partecipi.'
                : item.aperti > 0.5
                  ? 'Buon coinvolgimento, ma c\'è margine sul testo dell\'oggetto.'
                  : 'Tasso di apertura sotto la media: rivedere la selezione del pubblico o il testo dell\'oggetto.'}
            </div>
          </AdmCard>
        </div>
      </div>
    </ModalOverlay>
  );
}

// Misura secca dentro le modali: stessa forma di PromoNum, ma in tessera.
function PromoMiniStat({ label, value, hint, tono }) {
  return (
    <div style={{padding:'10px 12px', background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:9}}>
      <div style={{fontSize:11.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>{label}</div>
      <div style={{fontSize:17.5, fontWeight:800, color: tono || ADM.TEXT, letterSpacing:'-0.025em', lineHeight:1.15, marginTop:5}}>{value}</div>
      {hint && <div style={{fontSize:12, color:ADM.MUTED, marginTop:3}}>{hint}</div>}
    </div>
  );
}

window.AdmPromozioniPage = AdmPromozioniPage;
// Impalcatura condivisa — la tab Workflow (admin-workflow-email.jsx) la usa per
// avere la stessa forma delle altre due.
window.PromoHead    = PromoHead;
window.PromoSummary = PromoSummary;
window.PromoTable   = PromoTable;
window.PromoGroup   = PromoGroup;
window.PromoNum     = PromoNum;
window.PromoVuoto   = PromoVuoto;
window.PromoChip    = PromoChip;
window.PROMO_SHELL  = PROMO_SHELL;
window.PROMO_LAB    = PROMO_LAB;

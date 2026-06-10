// Sezione Utenti App: lista + drawer dettaglio

const { useState: useStateUtn, useMemo: useMemoUtn } = React;

function AdmUtentiPage({ search: searchProp }) {
  const [search, setSearch] = useStateUtn(searchProp || '');
  const [sesso, setSesso] = useStateUtn('all');
  const [fascia, setFascia] = useStateUtn('all');
  const [regione, setRegione] = useStateUtn('all');
  const [statoFiltro, setStatoFiltro] = useStateUtn('all');
  const [selected, setSelected] = useStateUtn(null);

  const filtered = useMemoUtn(() => {
    let r = UTENTI;
    if (sesso !== 'all') r = r.filter(u => u.sesso === sesso);
    if (fascia !== 'all') {
      const [a, b] = fascia.split('-').map(Number);
      r = r.filter(u => u.eta >= a && u.eta <= b);
    }
    if (regione !== 'all') r = r.filter(u => u.regione === regione);
    if (statoFiltro === 'attivi')    r = r.filter(u => u.attivo);
    if (statoFiltro === 'inattivi')  r = r.filter(u => !u.attivo);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(u => u.nome.toLowerCase().includes(q) || u.citta.toLowerCase().includes(q));
    }
    return r;
  }, [sesso, fascia, regione, statoFiltro, search]);

  const totUtenti = UTENTI.length;
  const attiviN = UTENTI.filter(u => u.attivo).length;
  const totalSpesa = UTENTI.reduce((s, u) => s + u.spesaTotale, 0);
  const spesaMediaLifetime = Math.round(totalSpesa / totUtenti);
  // Orizzonte medio per utente (dalla registrazione ad oggi) → consente di
  // annualizzare e proiettare a 30gg in modo statisticamente coerente.
  const avgHorizonDays = UTENTI.reduce((s, u) =>
    s + Math.max(1, Math.floor((Date.now() - new Date(u.dataRegistrazione).getTime()) / 86400000)), 0
  ) / totUtenti;
  const spesaMediaAnno = Math.round(spesaMediaLifetime * (365 / avgHorizonDays));
  const spesaMedia30g  = Math.round(spesaMediaLifetime * (30  / avgHorizonDays));
  const mediaEta = Math.round(UTENTI.reduce((s,u)=>s+u.eta,0)/totUtenti);

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
        <AdmKpiCard label="Utenti totali" value={fmtNum(totUtenti * 312)} sub={`${fmtNum(totUtenti*8)} questa settimana`} trend={+18} icon="users" accent="INFO"/>
        <AdmKpiCard label="Utenti attivi" value={fmtNum(attiviN * 312)} sub={`${Math.round(attiviN/totUtenti*100)}% del totale (30g)`} icon="fire" accent="PINK"/>
        <SpesaMediaCard
          lifetime={spesaMediaLifetime}
          anno={spesaMediaAnno}
          mese={spesaMedia30g}
          horizonDays={Math.round(avgHorizonDays)}
        />
        <AdmKpiCard label="Età media" value={`${mediaEta} anni`} sub={`${Math.round(UTENTI.filter(u=>u.sesso==='F').length/totUtenti*100)}% F · ${Math.round(UTENTI.filter(u=>u.sesso==='M').length/totUtenti*100)}% M`} icon="user" accent="PURPLE"/>
      </div>

      <AdmCard padding={0}>
        <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, flexWrap:'wrap'}}>
          <div style={{position:'relative', flex:'0 0 240px'}}>
            <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o città…" style={{
              width:'100%', padding:'7px 10px 7px 32px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
              fontSize:14.5, fontFamily:'inherit', outline:'none', background:'#fff',
            }}/>
          </div>
          <FilterDropdown label="Stato" value={statoFiltro} onChange={setStatoFiltro} options={[
            {value:'all', label:'Tutti gli stati'}, {value:'attivi', label:'Attivi'}, {value:'inattivi', label:'Inattivi'},
          ]}/>
          <FilterDropdown label="Sesso" value={sesso} onChange={setSesso} options={[
            {value:'all', label:'Tutti'}, {value:'F', label:'Donne'}, {value:'M', label:'Uomini'},
          ]}/>
          <FilterDropdown label="Età" value={fascia} onChange={setFascia} options={[
            {value:'all', label:'Tutte le età'}, {value:'18-25', label:'18-25'}, {value:'26-35', label:'26-35'}, {value:'36-45', label:'36-45'}, {value:'46-60', label:'46-60'}, {value:'61-99', label:'60+'},
          ]}/>
          <FilterDropdown label="Regione" value={regione} onChange={setRegione} options={[
            {value:'all', label:'Tutte le regioni'},
            ...REGIONI.map(r => ({value:r, label:r})),
          ]}/>
          <div style={{flex:1}}/>
          <span style={{fontSize:14, color:ADM.MUTED}}>{filtered.length} di {totUtenti}</span>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'minmax(0,2.4fr) 0.7fr 0.6fr 1.3fr 1.1fr 60px',
          padding:'10px 18px',
          borderBottom:`1px solid ${ADM.BORDER}`,
          fontSize:12.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em',
        }}>
          <div>Utente</div>
          <div>Sesso</div>
          <div>Età</div>
          <div>Geografia</div>
          <div>Stato</div>
          <div></div>
        </div>

        <div>
          {filtered.length === 0 && <AdmEmpty title="Nessun utente trovato" desc="Modifica i filtri di ricerca"/>}
          {filtered.map((u, i) => <UtenteRow key={u.id} utente={u} onClick={()=>setSelected(u)} striped={i%2===1}/>)}
        </div>
      </AdmCard>

      {selected && <UtenteDrawer utente={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ─── Spesa media card · period-aware ────────────────────────────────────────
// Risolve l'ambiguità: ogni KPI di spesa ha un orizzonte temporale esplicito.
// Lifetime = somma totale dall'iscrizione; 12 mesi = annualizzata; 30 giorni =
// proiezione mensile basata sull'orizzonte medio dei dati raccolti.
function SpesaMediaCard({ lifetime, anno, mese, horizonDays }) {
  const [periodo, setPeriodo] = useStateUtn('lifetime');
  const opts = [
    { id:'lifetime', label:'Lifetime', shortHelp:`dall'iscrizione (Ø ${horizonDays}gg)`, value:lifetime },
    { id:'anno',     label:'12 mesi',  shortHelp:'annualizzata',                          value:anno },
    { id:'mese',     label:'30 gg',    shortHelp:'mensile media',                          value:mese },
  ];
  const cur = opts.find(o => o.id === periodo) || opts[0];

  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
        <div style={{minWidth:0, flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
            <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em'}}>Spesa media / utente</div>
            <span style={{
              fontSize:13, fontWeight:800, color:ADM.OK, background:ADM.OK_SOFT,
              padding:'2px 6px', borderRadius:4, letterSpacing:'0.06em', textTransform:'uppercase',
            }}>{cur.label}</span>
          </div>
          <div style={{fontSize:32, fontWeight:700, color:ADM.TEXT, marginTop:8, letterSpacing:'-0.03em', lineHeight:1.05}}>
            {fmtEur(cur.value)}
          </div>
          <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:8}}>Da ordini in app · {cur.shortHelp}</div>
        </div>
        <div style={{
          width:38, height:38, borderRadius:11,
          background: ADM.OK_SOFT, color: ADM.OK,
          display:'grid', placeItems:'center',
          boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.4)', flexShrink:0,
        }}>
          <BuIcons.card size={18}/>
        </div>
      </div>

      {/* Period switcher · Apple segmented control */}
      <div style={{
        display:'inline-flex', marginTop:12, padding:2,
        background:'#F0F1F3', borderRadius:7,
      }}>
        {opts.map(o => {
          const active = o.id === periodo;
          return (
            <button key={o.id} onClick={()=>setPeriodo(o.id)} style={{
              padding:'4px 10px', fontSize:12.5, fontWeight:700,
              background: active ? '#fff' : 'transparent',
              color: active ? ADM.OK : ADM.MUTED,
              border:'none', borderRadius:5, cursor:'pointer',
              fontFamily:'inherit', letterSpacing:'0.02em',
              boxShadow: active ? '0 1px 2px rgba(15,17,21,0.08)' : 'none',
              transition:'all 0.15s',
            }}>{o.label}</button>
          );
        })}
      </div>
    </AdmCard>
  );
}

function UtenteRow({ utente: u, onClick, striped }) {
  const [hover, setHover] = useStateUtn(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'minmax(0,2.4fr) 0.7fr 0.6fr 1.3fr 1.1fr 60px',
        padding:'12px 18px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.ROW_HOVER : (striped ? ADM.ROW_STRIPE : 'transparent'),
        cursor:'pointer',
        alignItems:'center',
      }}>
      <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
        <AdmAvatar name={u.nome} size={34} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:15, fontWeight:600, color:ADM.TEXT}}>{u.nome}</div>
          <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:1}}>{u.email}</div>
        </div>
      </div>
      <div style={{fontSize:14.5, color:ADM.TEXT}}>{u.sesso === 'F' ? 'Donna' : 'Uomo'}</div>
      <div style={{fontSize:14.5, color:ADM.TEXT}}>{u.eta}</div>
      <div>
        <div style={{fontSize:14.5, color:ADM.TEXT, fontWeight:500}}>{u.citta}</div>
        <div style={{fontSize:13, color:ADM.MUTED}}>{u.regione}</div>
      </div>
      <div>
        {u.attivo
          ? <AdmBadge color="OK" size="xs">● Attivo</AdmBadge>
          : (
            <div>
              <AdmBadge color="PLAN_FREE" size="xs">○ Inattivo</AdmBadge>
              <div style={{fontSize:12.5, color:ADM.MUTED_SOFT, marginTop:3}}>Ultima: {fmtRelative(u.lastSession)}</div>
            </div>
          )}
      </div>
      <div style={{textAlign:'right', color:ADM.MUTED}}><BuIcons.chevronRight size={15}/></div>
    </div>
  );
}

function UtenteDrawer({ utente: u, onClose }) {
  const [period, setPeriod] = useStateUtn('total');

  // Mock: spesa storica per locale (basata su id utente per essere stabile)
  const seed = (u.id.charCodeAt(1) * 31 + u.id.charCodeAt(3)) % 1000;
  const rnd = (n) => ((seed * (n+1) * 9301 + 49297) % 233280) / 233280;
  const localiPreferiti = LOCALI.filter(l => l.stato === 'active').slice(0, 6).map((l, i) => {
    const baseSpesa = Math.round(u.spesaTotale * (0.3 - i*0.04) * (0.7 + rnd(i)*0.6));
    return {
      id: l.id, nome: l.nome, citta: l.citta, tipo: l.tipo,
      spesaTotale: Math.max(baseSpesa, 12),
      ordini: 3 + Math.floor(rnd(i+10) * 12),
      ultimoOrdine: new Date(Date.now() - Math.floor(rnd(i+20) * 90) * 86400000),
    };
  }).sort((a,b) => b.spesaTotale - a.spesaTotale);

  const periodFactors = { '30d': 0.18, '90d': 0.35, '12m': 0.78, 'total': 1.0 };
  const periodLabels = { '30d': 'Ultimi 30g', '90d': 'Ultimi 90g', '12m': 'Ultimi 12 mesi', 'total': 'Totale' };
  const factor = periodFactors[period];

  const spesaP = Math.round(u.spesaTotale * factor);
  const ordiniP = Math.round(u.ordini * factor);
  const prenP = Math.round(u.prenotazioni * factor);
  const localiP = localiPreferiti.map(l => ({...l, spesaTotale: Math.round(l.spesaTotale * factor), ordini: Math.max(1, Math.round(l.ordini * factor))})).filter(l => l.ordini > 0);
  const maxSpesa = Math.max(...localiP.map(l => l.spesaTotale), 1);

  const cluster = UTILIZZO_CLUSTER[u.utilizzo];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', justifyContent:'flex-end',
      background:'rgba(15,17,21,0.45)',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:660, maxWidth:'95%', background:'#fff', height:'100%',
        display:'flex', flexDirection:'column',
        animation:'slideIn 0.2s ease',
      }}>
        <div style={{padding:'20px 24px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:14}}>
          <AdmAvatar name={u.nome} size={48} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
              <div style={{fontSize:20, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{u.nome}</div>
              {u.attivo
                ? <AdmBadge color="OK" size="xs">● Attivo</AdmBadge>
                : <AdmBadge color="PLAN_FREE" size="xs">○ Inattivo</AdmBadge>}
              {cluster && <AdmBadge color={cluster.color} size="xs">{cluster.label}</AdmBadge>}
            </div>
            <div style={{fontSize:14, color:ADM.MUTED, display:'flex', gap:8}}>
              <span style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</span>
              <span>·</span><span>{u.sesso === 'F' ? 'Donna' : 'Uomo'}, {u.eta} anni</span>
              <span>·</span><span>{u.citta}</span>
            </div>
          </div>
          <AdmIconBtn icon="x" onClick={onClose}/>
        </div>

        <div style={{padding:'14px 24px 0', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, background:'#fff'}}>
          <span style={{fontSize:13.5, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em'}}>Periodo</span>
          <div style={{display:'flex', gap:4, paddingBottom:14}}>
            {Object.entries(periodLabels).map(([k, label]) => (
              <button key={k} onClick={()=>setPeriod(k)} style={{
                padding:'6px 12px',
                background: period === k ? ADM.TEXT : 'transparent',
                color: period === k ? '#fff' : ADM.MUTED,
                border: period === k ? 'none' : `1px solid ${ADM.BORDER}`,
                borderRadius:7, fontSize:13.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
            <MiniStat label="Spesa" value={fmtEur(spesaP)} sub={periodLabels[period]}/>
            <MiniStat label="Ordini delivery" value={ordiniP} sub={periodLabels[period]}/>
            <MiniStat label="Asporto" value={Math.round(ordiniP*0.42)} sub={periodLabels[period]}/>
            <MiniStat label="Prenotazioni" value={prenP} sub={periodLabels[period]}/>
          </div>

          <AdmCard padding={20}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
              <div>
                <div style={{fontSize:15, fontWeight:600, color:ADM.TEXT}}>Spesa storica per locale</div>
                <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:2}}>{periodLabels[period]} · ordinato per spesa</div>
              </div>
              <div style={{fontSize:13.5, color:ADM.MUTED}}>Totale: <span style={{fontWeight:700, color:ADM.TEXT}}>{fmtEur(spesaP)}</span></div>
            </div>
            {localiP.length === 0 && <div style={{fontSize:14, color:ADM.MUTED, padding:'18px 0', textAlign:'center'}}>Nessuna spesa registrata nel periodo selezionato</div>}
            <div style={{display:'flex', flexDirection:'column', gap:11}}>
              {localiP.map((l, i) => {
                const pct = (l.spesaTotale / maxSpesa) * 100;
                return (
                  <div key={l.id}>
                    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:5}}>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:14.5, color:ADM.TEXT, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</div>
                        <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{l.tipo} · {l.citta} · ultimo ordine {fmtRelative(l.ultimoOrdine)}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:15, color:ADM.TEXT, fontWeight:700}}>{fmtEur(l.spesaTotale)}</div>
                        <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{l.ordini} ordini</div>
                      </div>
                    </div>
                    <div style={{height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                      <div style={{width:`${pct}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})`, borderRadius:99}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </AdmCard>

          <AdmCard padding={20}>
            <div style={{fontSize:15, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Dati anagrafici</div>
            <DataRow label="Email" value={u.email} mono/>
            <DataRow label="Telefono" value={u.tel} mono/>
            <DataRow label="Indirizzo" value={`${u.citta}, ${u.regione}`}/>
            <DataRow label="Registrato il" value={fmtDate(u.dataRegistrazione)}/>
            <DataRow label="Ultima sessione" value={fmtRelative(u.lastSession)} last/>
          </AdmCard>
        </div>
      </div>
    </div>
  );
}

window.AdmUtentiPage = AdmUtentiPage;

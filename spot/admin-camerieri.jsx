// Sezione Camerieri — staff registrato sui locali, lista filtrabile

const { useState: useStateCam, useMemo: useMemoCam } = React;

// ─── Mock data: staff per locale ────────────────────────────────────────────
const RUOLI_STAFF = [
  { id: 'cameriere',     label: 'Cameriere',      color: 'INFO',      pct: 0.50 },
  { id: 'cassa',         label: 'Cassa',          color: 'PURPLE',    pct: 0.20 },
  { id: 'proprietario',  label: 'Proprietario',   color: 'PINK',      pct: 0.10 },
  { id: 'personalizzato',label: 'Personalizzato', color: 'WARN',      pct: 0.10 },
  { id: 'dispositivo',   label: 'Dispositivo',    color: 'PLAN_FREE', pct: 0.10 },
];

// Modelli dispositivo (cassa / tablet sala) per i record di tipo "Dispositivo"
const DEVICE_MODELS = ['iPad 10.9"', 'iPad mini', 'Sunmi T2', 'Samsung Galaxy Tab A9', 'Elo PayPoint', 'iPad Air'];

// Aree del gestionale (per i ruoli di tipo "Personalizzato")
const AREE_GESTIONALE = ['Sala', 'Vendita diretta', 'Prenotazioni', 'Panoramica', 'Impostazioni', 'Supporto', 'Statistiche', 'Contabilità'];

const STAFF = (() => {
  const nomi = [
    'Luca Bianchi','Sara Conti','Alessandro Romano','Giulia Russo','Federico Marino',
    'Martina Greco','Davide Esposito','Chiara Costa','Andrea Bruno','Elena Galli',
    'Marco Ferrari','Sofia Lombardi','Stefano Moretti','Valentina Barbieri','Tommaso Mancini',
    'Beatrice Rizzo','Filippo Caruso','Aurora Pellegrini','Riccardo Negri','Camilla Serra',
    'Lorenzo Sala','Vittoria Donati','Edoardo Caputo','Ludovica Battaglia','Gabriele Leone',
    'Anna Bellini','Simone Villa','Cristian Vitale','Greta Marini','Diego Bianco',
    'Asia Coppola','Pietro Fontana','Federica Rinaldi','Matteo Santoro','Maria Palumbo',
    'Alberto Giordano','Bianca Ricci','Tommaso Pellegrini','Aurora Marini','Filippo De Luca',
    'Ginevra Romano','Lorenzo Mancini','Beatrice Esposito','Marco Costa','Sara Galli',
    'Davide Bruno','Elena Ferrari','Andrea Lombardi','Giulia Moretti','Stefano Barbieri',
  ];
  const r = (seed) => { let x = (seed * 9301 + 49297) % 233280; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  return nomi.map((n, i) => {
    const rnd = r(i + 500);
    const localeIdx = Math.floor(rnd() * 25) + 17; // assegna a locali attivi (idx 17-41)
    const localeId = 'L' + (1000 + localeIdx);
    const local = LOCALI.find(l => l.id === localeId);
    // Distribuzione ruoli ponderata
    const rRoll = rnd();
    let ruolo;
    let cumulative = 0;
    for (const r of RUOLI_STAFF) { cumulative += r.pct; if (rRoll <= cumulative) { ruolo = r.id; break; } }
    if (!ruolo) ruolo = 'cameriere';
    const lastDays = Math.floor(rnd() * 14);
    const isDevice = ruolo === 'dispositivo';
    const modello = DEVICE_MODELS[Math.floor(rnd() * DEVICE_MODELS.length)];
    const deviceCode = 'POS-' + localeIdx + '-' + String(11 + (i % 9)); // es. POS-23-14
    // Per i ruoli personalizzati: sottoinsieme di aree del gestionale (2-4)
    const aree = ruolo === 'personalizzato'
      ? [...AREE_GESTIONALE].sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 3))
      : null;
    return {
      id: 'S' + String(3000 + i),
      // Per i dispositivi il "nome" è il codice del dispositivo (non una persona)
      nome: isDevice ? deviceCode : n,
      modello: isDevice ? modello : null,
      aree,
      ruolo,
      localeId,
      localeNome: local?.nome || '—',
      localeCitta: local?.citta || '—',
      ordiniMese: Math.floor(rnd() * 280) + 40,
      coperti: Math.floor(rnd() * 380) + 60,
      lastActive: new Date(Date.now() - lastDays * 86400000),
      attivoOggi: lastDays === 0,
      dataAssunzione: new Date(Date.now() - (60 + Math.floor(rnd() * 700)) * 86400000),
    };
  });
})();

function AdmCamerieriPage({ search: searchProp }) {
  const [search, setSearch] = useStateCam(searchProp || '');
  const [ruolo, setRuolo] = useStateCam('all');
  const [locale, setLocale] = useStateCam('all');
  const [statoFiltro, setStatoFiltro] = useStateCam('all');
  const [selected, setSelected] = useStateCam(null);
  const [sort, setSort] = useStateCam('lastActive_desc');
  const [viewMode, setViewMode] = useStateCam('flat'); // 'flat' | 'byLocale'

  const filtered = useMemoCam(() => {
    let r = STAFF;
    if (ruolo !== 'all') r = r.filter(s => s.ruolo === ruolo);
    if (locale !== 'all') r = r.filter(s => s.localeId === locale);
    if (statoFiltro === 'attivi') r = r.filter(s => s.attivoOggi);
    if (statoFiltro === 'inattivi') r = r.filter(s => !s.attivoOggi);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(s => s.nome.toLowerCase().includes(q) || s.localeNome.toLowerCase().includes(q) || s.localeCitta.toLowerCase().includes(q));
    }
    const sorts = {
      lastActive_desc: (a,b) => b.lastActive - a.lastActive,
      ordini_desc:     (a,b) => b.ordiniMese - a.ordiniMese,
      nome_asc:        (a,b) => a.nome.localeCompare(b.nome),
    };
    return [...r].sort(sorts[sort]);
  }, [search, ruolo, locale, statoFiltro, sort]);

  const localiList = useMemoCam(() => {
    const ids = [...new Set(STAFF.map(s => s.localeId))];
    return ids.map(id => ({ id, nome: LOCALI.find(l => l.id === id)?.nome || id })).sort((a,b)=>a.nome.localeCompare(b.nome));
  }, []);

  // Raggruppamento per locale, sui risultati filtrati. Ordina i locali per
  // attività (locali con più attivi oggi prima) → priorità operativa.
  const grouped = useMemoCam(() => {
    const map = new Map();
    filtered.forEach(s => {
      if (!map.has(s.localeId)) {
        const loc = LOCALI.find(l => l.id === s.localeId);
        map.set(s.localeId, {
          id: s.localeId,
          nome: s.localeNome,
          citta: s.localeCitta,
          tipo: loc?.tipo,
          stato: loc?.stato,
          piano: loc?.piano,
          members: [],
        });
      }
      map.get(s.localeId).members.push(s);
    });
    const groups = Array.from(map.values()).map(g => ({
      ...g,
      attiviOggi: g.members.filter(m => m.attivoOggi).length,
      ordiniMese: g.members.reduce((s, m) => s + m.ordiniMese, 0),
    }));
    // Ordina: prima i locali con 0 attivi (necessitano intervento), poi per nome
    return groups.sort((a, b) => {
      if (a.attiviOggi === 0 && b.attiviOggi > 0) return -1;
      if (b.attiviOggi === 0 && a.attiviOggi > 0) return 1;
      return a.nome.localeCompare(b.nome);
    });
  }, [filtered]);

  const totStaff = STAFF.length;
  const attiviOggi = STAFF.filter(s => s.attivoOggi).length;
  const localiCoperti = new Set(STAFF.map(s => s.localeId)).size;

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      {/* Quick stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
        <AdmKpiCard label="Staff registrati" value={fmtNum(totStaff)} sub="Su tutti i locali" icon="users" accent="PINK"/>
        <AdmKpiCard label="Attivi oggi" value={fmtNum(attiviOggi)} sub={`${Math.round(attiviOggi/totStaff*100)}% del totale`} icon="check" accent="OK"/>
        <AdmKpiCard label="Locali coperti" value={fmtNum(localiCoperti)} sub="Con almeno 1 membro staff" icon="store" accent="PURPLE"/>
      </div>

      <AdmCard padding={0}>
        <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, flexWrap:'wrap'}}>
          <div style={{position:'relative', flex:'0 0 240px'}}>
            <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={19}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o locale…" style={{
              width:'100%', padding:'7px 10px 7px 32px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
              fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff',
            }}/>
          </div>
          <FilterDropdown label="Tipo" value={ruolo} onChange={setRuolo} options={[
            {value:'all', label:'Tutti i tipi'},
            ...RUOLI_STAFF.map(r => ({value:r.id, label:r.label})),
          ]}/>
          <FilterDropdown label="Locale" value={locale} onChange={setLocale} options={[
            {value:'all', label:'Tutti i locali'},
            ...localiList.map(l => ({value:l.id, label:l.nome})),
          ]}/>
          <FilterDropdown label="Stato" value={statoFiltro} onChange={setStatoFiltro} options={[
            {value:'all', label:'Tutti'},
            {value:'attivi', label:'Attivi oggi'},
            {value:'inattivi', label:'Non attivi oggi'},
          ]}/>
          <div style={{flex:1}}/>
          <span style={{fontSize:13.7, color:ADM.MUTED}}>
            {filtered.length} di {totStaff}
            {viewMode === 'byLocale' && <> · {grouped.length} locali</>}
          </span>
          <ViewModeToggle value={viewMode} onChange={setViewMode}/>
          {viewMode === 'flat' && (
            <FilterDropdown label="Ordina" value={sort} onChange={setSort} options={[
              {value:'lastActive_desc', label:'Ultima attività'},
              {value:'nome_asc',        label:'Nome A→Z'},
            ]}/>
          )}
        </div>

        {viewMode === 'flat' ? (
          <>
            <div style={{
              display:'grid',
              gridTemplateColumns:'minmax(0,2fr) 1fr 1.6fr 1fr 60px',
              padding:'10px 18px',
              borderBottom:`1px solid ${ADM.BORDER}`,
              fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em',
            }}>
              <div>Membro</div>
              <div>Tipo</div>
              <div>Locale</div>
              <div>Ultima attività</div>
              <div></div>
            </div>

            <div>
              {filtered.length === 0 && <AdmEmpty title="Nessun membro trovato" desc="Modifica i filtri"/>}
              {filtered.map((s, i) => <StaffRow key={s.id} staff={s} onClick={()=>setSelected(s)} striped={i%2===1}/>)}
            </div>
          </>
        ) : (
          <div>
            {grouped.length === 0 && <AdmEmpty title="Nessun locale trovato" desc="Modifica i filtri"/>}
            {grouped.map((g) => <LocaleGroup key={g.id} group={g} onSelectStaff={setSelected}/>)}
          </div>
        )}
      </AdmCard>

      {selected && <StaffDrawer staff={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ─── View mode toggle · Lista vs Per locale ─────────────────────────────────
function ViewModeToggle({ value, onChange }) {
  const opts = [
    { id:'flat',     label:'Lista',      icon:'list' },
    { id:'byLocale', label:'Per locale', icon:'store' },
  ];
  return (
    <div style={{display:'inline-flex', background:'#F0F1F3', borderRadius:7, padding:2}}>
      {opts.map(o => {
        const active = value === o.id;
        const Icon = BuIcons[o.icon];
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} title={o.label} style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding:'5px 10px', fontSize:13.3, fontWeight:700,
            background: active ? '#fff' : 'transparent',
            color: active ? ADM.TEXT : ADM.MUTED,
            border:'none', borderRadius:5, cursor:'pointer', fontFamily:'inherit',
            boxShadow: active ? '0 1px 2px rgba(15,17,21,0.08)' : 'none',
            transition:'all 0.15s',
          }}>
            <Icon size={17}/>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Locale group · cluster di staff con header riassuntivo ────────────────
// Header data-driven: stato (verde/ambra/rosso) in base a presenza attivi.
// Espandi/comprimi animato. I locali "0 attivi" stanno in cima all'ordine.
function LocaleGroup({ group, onSelectStaff }) {
  const [open, setOpen] = useStateCam(group.attiviOggi === 0); // apri di default i critici
  const total = group.members.length;
  const att = group.attiviOggi;
  const ratio = total > 0 ? att / total : 0;
  // Health: 0 attivi = rosso, < 33% = ambra, altrimenti verde
  const health = att === 0 ? 'DANGER' : ratio < 0.34 ? 'WARN' : 'OK';
  const healthLabel = att === 0 ? 'Nessuno attivo' : ratio < 0.34 ? 'Pochi attivi' : 'Operativo';
  const c = ADM[health];
  const cSoft = ADM[health+'_SOFT'];

  // Composizione per ruolo
  const ruoliCount = {};
  group.members.forEach(m => { ruoliCount[m.ruolo] = (ruoliCount[m.ruolo] || 0) + 1; });
  const ruoliBreakdown = Object.entries(ruoliCount).map(([id, n]) => {
    const def = RUOLI_STAFF.find(r => r.id === id);
    return { id, n, def };
  }).sort((a,b)=>b.n - a.n);

  return (
    <div style={{borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        all:'unset', cursor:'pointer', width:'100%', boxSizing:'border-box',
        display:'flex', alignItems:'center', gap:14,
        padding:'14px 18px',
        background: open ? ADM.PANEL_SOFT : 'transparent',
        transition:'background 0.12s',
      }}
      onMouseEnter={e=>{ if (!open) e.currentTarget.style.background = ADM.ROW_HOVER; }}
      onMouseLeave={e=>{ if (!open) e.currentTarget.style.background = 'transparent'; }}>
        {/* Chevron */}
        <span style={{
          display:'inline-flex', color:ADM.MUTED, flexShrink:0,
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition:'transform 0.18s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}>
          <BuIcons.chevronRight size={19}/>
        </span>
        {/* Health dot */}
        <span className={att === 0 ? 'cam-pulse' : ''} style={{
          width:9, height:9, borderRadius:'50%', background:c, flexShrink:0,
          boxShadow: att > 0 ? `0 0 0 3px ${cSoft}` : 'none',
        }}/>
        {/* Locale icon */}
        <div style={{
          width:34, height:34, borderRadius:8,
          background:ADM.PINK_SOFT, color:ADM.PINK,
          display:'grid', placeItems:'center', flexShrink:0,
        }}>
          <BuIcons.store size={20}/>
        </div>
        {/* Nome + città */}
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <span style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{group.nome}</span>
            <span style={{
              fontSize:13, fontWeight:800, color:c, background:cSoft,
              padding:'2px 7px', borderRadius:4, letterSpacing:'0.05em', textTransform:'uppercase',
            }}>{healthLabel}</span>
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
            <span>{group.citta}</span>
            {group.tipo && <><span style={{color:ADM.MUTED_LIGHT}}>·</span><span>{group.tipo}</span></>}
            <span style={{color:ADM.MUTED_LIGHT}}>·</span>
            <span style={{fontFamily:'ui-monospace,monospace', fontSize:12.6}}>{group.id}</span>
          </div>
        </div>
        {/* Breakdown ruoli (compatto) */}
        <div style={{display:'flex', gap:5, flexShrink:0}}>
          {ruoliBreakdown.map(r => (
            <span key={r.id} title={`${r.n} ${r.def.label}`} style={{
              display:'inline-flex', alignItems:'center', gap:4,
              padding:'2px 7px', borderRadius:5,
              background: ADM[r.def.color+'_SOFT'], color: ADM[r.def.color],
              fontSize:12.6, fontWeight:700,
            }}>
              <span>{r.n}</span>
              <span style={{opacity:0.7, fontWeight:600}}>{r.def.label.slice(0,3).toLowerCase()}</span>
            </span>
          ))}
        </div>
        {/* Conteggio attivi/totale */}
        <div style={{textAlign:'right', flexShrink:0, minWidth:84}}>
          <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Attivi oggi</div>
          <div style={{fontSize:15.8, fontWeight:800, color:c, letterSpacing:'-0.015em', marginTop:2}}>
            {att}<span style={{color:ADM.MUTED_SOFT, fontWeight:600}}>/{total}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="cam-group-expand" style={{
          background:'#fff', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
        }}>
          {group.members.map((s, i) => (
            <StaffRow key={s.id} staff={s} onClick={()=>onSelectStaff(s)} striped={i%2===1} indented/>
          ))}
        </div>
      )}

      <style>{`
        @keyframes camGroupExpand {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes camPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.55; }
        }
        .cam-group-expand { animation: camGroupExpand 0.22s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
        .cam-pulse { animation: camPulse 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function StaffRow({ staff: s, onClick, striped, indented }) {
  const [hover, setHover] = useStateCam(false);
  const ruoloDef = RUOLI_STAFF.find(r => r.id === s.ruolo);
  return (
    <div onClick={onClick} className="adm-row-open"
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'minmax(0,2fr) 1fr 1.6fr 1fr 60px',
        padding: indented ? '11px 18px 11px 46px' : '12px 18px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.ROW_HOVER : (striped ? ADM.ROW_STRIPE : 'transparent'),
        cursor:'pointer', alignItems:'center',
        position:'relative',
      }}>
      {indented && (
        <span style={{
          position:'absolute', left:30, top:'50%', width:8, height:1,
          background:ADM.BORDER, transform:'translateY(-50%)',
        }}/>
      )}
      <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
        {s.ruolo === 'dispositivo'
          ? <div style={{width:34, height:34, borderRadius:8, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.monitor size={21}/></div>
          : <AdmAvatar name={s.nome} size={39} bg={`hsl(${(s.id.charCodeAt(2)+s.id.charCodeAt(3))*7 % 360}, 45%, 55%)`}/>}
        <div style={{minWidth:0}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, fontFamily: s.ruolo === 'dispositivo' ? 'ui-monospace,monospace' : 'inherit'}}>{s.nome}</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:1, fontFamily: s.ruolo === 'dispositivo' ? 'inherit' : 'ui-monospace,monospace'}}>{s.ruolo === 'dispositivo' ? s.modello : s.id}</div>
        </div>
      </div>
      <div>
        <span style={{
          padding:'3px 9px', borderRadius:5,
          background: ADM[ruoloDef.color+'_SOFT'], color: ADM[ruoloDef.color],
          fontSize:13, fontWeight:700,
        }}>{ruoloDef.label}</span>
      </div>
      <div>
        <div style={{fontSize:14, color:ADM.TEXT, fontWeight:500}}>{s.localeNome}</div>
        <div style={{fontSize:13, color:ADM.MUTED}}>{s.localeCitta}</div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <span style={{width:7, height:7, borderRadius:'50%', background: s.attivoOggi ? ADM.OK : ADM.MUTED_LIGHT}}/>
        <span style={{fontSize:13.3, color:ADM.MUTED}}>{fmtRelative(s.lastActive)}</span>
      </div>
      <div style={{textAlign:'right', color:ADM.MUTED}}><span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span></div>
    </div>
  );
}

function StaffDrawer({ staff: s, onClose }) {
  const ruoloDef = RUOLI_STAFF.find(r => r.id === s.ruolo);
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', justifyContent:'flex-end',
      background:'rgba(15,17,21,0.45)',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:560, maxWidth:'95%', background:'#fff', height:'100%',
        display:'flex', flexDirection:'column', animation:'slideIn 0.2s ease',
      }}>
        <div style={{padding:'20px 24px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:14}}>
          {s.ruolo === 'dispositivo'
            ? <div style={{width:48, height:48, borderRadius:10, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.monitor size={27}/></div>
            : <AdmAvatar name={s.nome} size={53} bg={`hsl(${(s.id.charCodeAt(2)+s.id.charCodeAt(3))*7 % 360}, 45%, 55%)`}/>}
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
              <div style={{fontSize:18, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em', fontFamily: s.ruolo === 'dispositivo' ? 'ui-monospace,monospace' : 'inherit'}}>{s.nome}</div>
              <span style={{padding:'3px 9px', borderRadius:5, background: ADM[ruoloDef.color+'_SOFT'], color: ADM[ruoloDef.color], fontSize:13, fontWeight:700}}>{ruoloDef.label}</span>
            </div>
            <div style={{fontSize:13.7, color:ADM.MUTED, display:'flex', gap:8}}>
              <span style={{fontFamily: s.ruolo === 'dispositivo' ? 'inherit' : 'ui-monospace,monospace'}}>{s.ruolo === 'dispositivo' ? s.modello : s.id}</span>
              <span>·</span>
              <span>{s.localeNome}, {s.localeCitta}</span>
            </div>
          </div>
          <AdmIconBtn icon="x" onClick={onClose}/>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
          {/* Statistiche operative solo per i camerieri (prendono ordini al tavolo) */}
          {s.ruolo === 'cameriere' && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10}}>
              <MiniStat label="Ordini mese" value={fmtNum(s.ordiniMese)} sub="Presi al tavolo"/>
              <MiniStat label="Coperti gestiti" value={fmtNum(s.coperti)} sub="Mese corrente"/>
              <MiniStat label="Scontrino medio" value={fmtEur(Math.round(s.ordiniMese * 0.6))} sub="Per ordine"/>
            </div>
          )}

          {/* Aree del gestionale coperte — solo per i ruoli personalizzati */}
          {s.ruolo === 'personalizzato' && s.aree && (
            <AdmCard padding={20}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Aree del gestionale</div>
              <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>Questo ruolo personalizzato ha accesso a {s.aree.length} aree su {AREE_GESTIONALE.length}</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {AREE_GESTIONALE.map(area => {
                  const on = s.aree.includes(area);
                  return (
                    <span key={area} style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      padding:'6px 11px', borderRadius:8,
                      background: on ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT,
                      color: on ? ADM.OK : ADM.MUTED_SOFT,
                      fontSize:13, fontWeight:600,
                      border:`1px solid ${on ? ADM.OK + '33' : 'transparent'}`,
                    }}>
                      <BuIcons.check size={17} color={on ? ADM.OK : ADM.MUTED_LIGHT}/>
                      {area}
                    </span>
                  );
                })}
              </div>
            </AdmCard>
          )}

          <AdmCard padding={20}>
            <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>{s.ruolo === 'dispositivo' ? 'Dettagli dispositivo' : 'Dati anagrafici'}</div>
            <DataRow label="Tipo" value={ruoloDef.label}/>
            {s.ruolo === 'dispositivo' && <DataRow label="Codice" value={s.nome} mono/>}
            {s.ruolo === 'dispositivo' && <DataRow label="Modello" value={s.modello}/>}
            <DataRow label="Locale" value={`${s.localeNome} (${s.localeCitta})`}/>
            <DataRow label="ID Locale" value={s.localeId} mono/>
            <DataRow label={s.ruolo === 'dispositivo' ? 'Registrato il' : 'Assunto il'} value={fmtDate(s.dataAssunzione)}/>
            <DataRow label="Ultima attività" value={fmtRelative(s.lastActive)}/>
            <DataRow label="Stato" value={s.attivoOggi ? 'Attivo oggi' : 'Non attivo oggi'} last/>
          </AdmCard>
        </div>
      </div>
    </div>
  );
}

window.AdmCamerieriPage = AdmCamerieriPage;

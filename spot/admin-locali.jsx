// Sezione Locali: lista filtrata + drawer dettaglio

const { useState: useStateLoc, useMemo: useMemoLoc, useEffect: useEffectLoc } = React;

function AdmLocaliPage({ search, openLocale }) {
  const [stato, setStato] = useStateLoc('active'); // default → Attivi
  const [piano, setPiano] = useStateLoc('all');
  const [regione, setRegione] = useStateLoc('all');
  const [citta, setCitta] = useStateLoc('all');
  const [selected, setSelected] = useStateLoc(null);
  const [sort, setSort] = useStateLoc('mrr_desc');
  const [localSearch, setLocalSearch] = useStateLoc('');

  // Apertura diretta del drawer dalla Dashboard (sezione Adozione digitale, ecc.)
  useEffectLoc(() => {
    if (openLocale) setSelected(openLocale);
  }, [openLocale && openLocale.id]);

  const effectiveSearch = (localSearch || search || '').trim();

  // Gruppi di stato secondo richiesta:
  // attivi = stato 'active'
  // onboarding = pending + onboarding + skipped
  // inattivi = inactive + churned
  const inGroup = (l, g) => {
    if (g === 'active')     return l.stato === 'active';
    if (g === 'onboarding') return l.stato === 'pending' || l.stato === 'onboarding' || l.stato === 'skipped';
    if (g === 'inactive')   return l.stato === 'inactive' || l.stato === 'churned';
    return true;
  };

  const filtered = useMemoLoc(() => {
    let r = LOCALI.filter(l => inGroup(l, stato));
    if (piano !== 'all')   r = r.filter(l => l.piano === piano);
    if (regione !== 'all') r = r.filter(l => l.regione === regione);
    if (citta !== 'all')   r = r.filter(l => l.citta === citta);
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      r = r.filter(l =>
        l.nome.toLowerCase().includes(q) ||
        l.citta.toLowerCase().includes(q) ||
        l.titolare.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }
    const sorts = {
      iscrizione_desc: (a,b) => b.dataIscrizione - a.dataIscrizione,
      iscrizione_asc:  (a,b) => a.dataIscrizione - b.dataIscrizione,
      ordini_desc:     (a,b) => b.ordiniGiorno - a.ordiniGiorno,
      mrr_desc:        (a,b) => (b.mrr + b.extras) - (a.mrr + a.extras),
      citta_asc:       (a,b) => a.citta.localeCompare(b.citta),
      nome_asc:        (a,b) => a.nome.localeCompare(b.nome),
    };
    return [...r].sort(sorts[sort]);
  }, [stato, piano, regione, citta, effectiveSearch, sort]);

  const counts = {
    active:     LOCALI.filter(l => inGroup(l, 'active')).length,
    onboarding: LOCALI.filter(l => inGroup(l, 'onboarding')).length,
    inactive:   LOCALI.filter(l => inGroup(l, 'inactive')).length,
  };

  const tabsList = [
    { id: 'active',     label: 'Attivi',         badge: counts.active },
    { id: 'onboarding', label: 'In onboarding',  badge: counts.onboarding },
    { id: 'inactive',   label: 'Inattivi',       badge: counts.inactive },
  ];

  const cittaList = useMemoLoc(() => [...new Set(LOCALI.map(l => l.citta))].sort(), []);

  // CSV export — solo schermata Locali (Operatività)
  const downloadCSV = () => {
    const cols = [
      { k: 'id',           label: 'ID' },
      { k: 'nome',         label: 'Nome' },
      { k: 'tipo',         label: 'Tipo' },
      { k: 'citta',        label: 'Città' },
      { k: 'regione',      label: 'Regione' },
      { k: 'titolare',     label: 'Titolare' },
      { k: 'email',        label: 'Email' },
      { k: 'telefono',     label: 'Telefono' },
      { k: 'stato',        label: 'Stato' },
      { k: 'piano',        label: 'Piano' },
      { k: 'mrr',          label: 'MRR (€)' },
      { k: 'extras',       label: 'Extras mese (€)' },
      { k: 'totMese',      label: 'Totale mese (€)' },
      { k: 'ticketMedio',  label: 'Scontrino medio (€)' },
      { k: 'ordiniGiorno', label: 'Ordini/giorno' },
      { k: 'ordiniMese',   label: 'Ordini ultimo mese' },
      { k: 'scanQRMese',   label: 'Scan QR ultimo mese' },
      { k: 'qrAdoption',   label: 'Adozione QR' },
      { k: 'copertura',    label: 'Copertura (%)' },
      { k: 'dataIscrizione', label: 'Data iscrizione' },
      { k: 'lastLogin',    label: 'Ultimo login' },
    ];
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const fmtDate = (d) => d ? new Date(d).toISOString().slice(0,10) : '';
    const rows = filtered.map(l => {
      const tot = (l.mrr || 0) + (l.extras || 0);
      const map = {
        ...l,
        totMese: tot,
        dataIscrizione: fmtDate(l.dataIscrizione),
        lastLogin:      fmtDate(l.lastLogin),
      };
      return cols.map(c => esc(map[c.k])).join(';');
    });
    const csv = '\uFEFF' + cols.map(c => esc(c.label)).join(';') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0,10);
    a.download = `byup-locali-${stato}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };

  const activeLocali = LOCALI.filter(l => l.stato === 'active');
  const mrrTot = activeLocali.reduce((s,l)=>s+l.mrr+l.extras,0);
  const ticketMedio = activeLocali.length ? Math.round(activeLocali.reduce((s,l)=>s+l.ticketMedio,0)/activeLocali.length) : 0;
  const copertura = activeLocali.length ? Math.round(activeLocali.reduce((s,l)=>s+l.copertura,0)/activeLocali.length) : 0;
  const onbCompletati = LOCALI.filter(l => l.stato === 'active' || l.stato === 'inactive' || l.stato === 'churned').length;
  const onbTentati = LOCALI.length - LOCALI.filter(l => l.stato === 'pending').length;
  const convRate = onbTentati > 0 ? Math.round((onbCompletati/onbTentati)*100) : 0;

  return (
    <div style={{padding: 28, display:'flex', flexDirection:'column', gap: 16}}>
      {/* Quick stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
        <AdmKpiCard label="Conversion onboarding" value={`${convRate}%`} sub={`${onbCompletati} su ${onbTentati}`} icon="trendUp" accent="OK"/>
        <AdmKpiCard label="MRR totale" value={fmtEur(mrrTot)} sub="Locali attivi (piano + extra)" icon="money" accent="PURPLE"/>
        <AdmKpiCard label="Scontrino medio" value={fmtEur(ticketMedio)} sub="Per ordine, media attivi" icon="receipt" accent="INFO"/>
        <AdmKpiCard label="Copertura media" value={`${copertura}%`} sub="Tavoli occupati" icon="table" accent="PINK"/>
      </div>

      {/* Filters bar */}
      <AdmCard padding={0}>
        <AdmTabBar tabs={tabsList} active={stato} onChange={setStato}/>

        <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, flexWrap:'wrap'}}>
          {/* Local search */}
          <div style={{position:'relative', display:'flex', alignItems:'center'}}>
            <span style={{position:'absolute', left:10, color:ADM.MUTED, pointerEvents:'none', display:'inline-flex'}}>
              <BuIcons.search size={18}/>
            </span>
            <input
              value={localSearch}
              onChange={e=>setLocalSearch(e.target.value)}
              placeholder="Cerca nome, città, titolare, ID…"
              style={{
                padding:'7px 12px 7px 30px',
                border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                fontSize:19.5, fontFamily:'inherit',
                width: 260, color: ADM.TEXT, background:'#fff',
                outline:'none',
              }}
            />
            {localSearch && (
              <button onClick={()=>setLocalSearch('')} style={{
                position:'absolute', right:6, background:'transparent', border:'none', cursor:'pointer',
                color:ADM.MUTED, padding:4, display:'inline-flex', borderRadius:4,
              }}><BuIcons.x size={17}/></button>
            )}
          </div>

          <FilterDropdown label="Piano" value={piano} onChange={setPiano} options={[
            {value:'all', label:'Tutti i piani'},
            ...PIANI.map(p => ({value:p.id, label:p.label})),
          ]}/>
          <FilterDropdown label="Città" value={citta} onChange={setCitta} options={[
            {value:'all', label:'Tutte le città'},
            ...cittaList.map(c => ({value:c, label:c})),
          ]}/>
          <FilterDropdown label="Regione" value={regione} onChange={setRegione} options={[
            {value:'all', label:'Tutte le regioni'},
            ...REGIONI.map(r => ({value:r, label:r})),
          ]}/>
          <div style={{flex:1}}/>
          <span style={{fontSize:19, color:ADM.MUTED}}>{filtered.length} risultati</span>
          <FilterDropdown label="Ordina" value={sort} onChange={setSort} options={[
            {value:'mrr_desc',        label:'MRR maggiore'},
            {value:'ordini_desc',     label:'Più ordini/giorno'},
            {value:'iscrizione_desc', label:'Più recenti'},
            {value:'iscrizione_asc',  label:'Meno recenti'},
            {value:'nome_asc',        label:'Nome A→Z'},
            {value:'citta_asc',       label:'Città A→Z'},
          ]}/>
          <AdmButton variant="secondary" icon="download" size="sm" onClick={downloadCSV}>Scarica CSV</AdmButton>
        </div>

        {/* Table */}
        <div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'minmax(0,2.4fr) 1.2fr 1.2fr 1.1fr 1.2fr 60px',
            gap:0,
            padding:'10px 18px',
            borderBottom:`1px solid ${ADM.BORDER}`,
            fontSize:17.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em',
          }}>
            <div>Locale</div>
            <div>Città</div>
            <div>Stato</div>
            <div>Piano</div>
            <div>Prezzo mensile</div>
            <div></div>
          </div>
          <div>
            {filtered.length === 0 && <AdmEmpty title="Nessun locale trovato" desc="Modifica i filtri o cancella la ricerca"/>}
            {filtered.map((l, i) => <LocaleRow key={l.id} locale={l} onClick={()=>setSelected(l)} striped={i%2===1}/>)}
          </div>
        </div>
      </AdmCard>

      {selected && <LocaleDrawer locale={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }) {
  return (
    <div style={{position:'relative', display:'inline-flex', alignItems:'center'}}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        padding:'7px 30px 7px 12px',
        border:`1px solid ${ADM.BORDER}`,
        borderRadius:7,
        fontSize:19, fontWeight:500, color:ADM.TEXT,
        background:'#fff',
        appearance:'none',
        cursor:'pointer',
        fontFamily:'inherit',
        minWidth: 140,
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:'absolute', right:8, pointerEvents:'none', color:ADM.MUTED}}>
        <BuIcons.chevronDown size={18}/>
      </span>
    </div>
  );
}

function LocaleRow({ locale: l, onClick, striped }) {
  const [hover, setHover] = useStateLoc(false);
  const piano = PIANI.find(p => p.id === l.piano);
  const totMese = l.mrr + l.extras;

  const tipText = `Piano ${piano.label}: ${fmtEur(l.mrr)}\nExtras ordini: ${fmtEur(l.extras)}\n────────────\nTotale mese: ${fmtEur(totMese)}`;

  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'minmax(0,2.4fr) 1.2fr 1.2fr 1.1fr 1.2fr 60px',
        gap:0,
        padding:'13px 18px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.ROW_HOVER : (striped ? ADM.ROW_STRIPE : 'transparent'),
        cursor:'pointer',
        alignItems:'center',
        transition:'background 0.08s',
      }}>
      <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
        <div style={{
          width:34, height:34, borderRadius:8,
          background: `hsl(${(l.id.charCodeAt(1)+l.id.charCodeAt(3))*3 % 360}, 35%, 55%)`,
          color:'#fff', display:'grid', placeItems:'center',
          fontWeight:700, fontSize:19, flexShrink:0,
        }}>{l.nome.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</div>
          <div style={{fontSize:18.5, color:ADM.MUTED, marginTop:1, display:'flex', gap:6, alignItems:'center'}}>
            <span>{l.tipo}</span>
            <span style={{color:ADM.MUTED_LIGHT}}>·</span>
            <span style={{fontFamily:'ui-monospace,monospace', fontSize:17.5}}>{l.id}</span>
          </div>
        </div>
      </div>

      <div>
        <div style={{fontSize:20, color:ADM.TEXT, fontWeight:500}}>{l.citta}</div>
        <div style={{fontSize:18, color:ADM.MUTED, marginTop:1}}>{l.regione}</div>
      </div>

      <div><AdmStatoBadge stato={l.stato}/></div>

      <div><AdmPlanBadge piano={l.piano}/></div>

      <div data-tip={tipText} data-tip-pos="below" style={{cursor:'help'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:20.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{fmtEur(totMese)}</div>
        {l.extras > 0 && <div style={{fontSize:18, color:ADM.MUTED, marginTop:1}}>{fmtEur(l.mrr)} + <span style={{color:ADM.PURPLE, fontWeight:600}}>{fmtEur(l.extras)}</span></div>}
        {l.extras === 0 && <div style={{fontSize:18, color:ADM.MUTED_LIGHT, marginTop:1}}>nessun extra</div>}
      </div>

      <div style={{textAlign:'right', color:ADM.MUTED}}>
        <BuIcons.chevronRight size={20}/>
      </div>
    </div>
  );
}

function FunnelDots({ locale: l }) {
  return (
    <div style={{display:'flex', gap:3}}>
      {ONB_STEPS.map((s) => {
        const done = l.completedSteps.includes(s.id);
        const stuck = l.stoppedAt === s.id;
        return (
          <span key={s.id} title={s.label} style={{
            width: stuck ? 14 : 8, height:6, borderRadius: 2,
            background: stuck ? ADM.WARN : done ? ADM.OK : '#E5E7EB',
            transition:'all 0.15s',
          }}/>
        );
      })}
    </div>
  );
}

window.AdmLocaliPage = AdmLocaliPage;
window.FilterDropdown = FilterDropdown;
window.FunnelDots = FunnelDots;

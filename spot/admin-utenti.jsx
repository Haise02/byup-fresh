// Sezione Utenti App: lista + drawer dettaglio

const { useState: useStateUtn, useMemo: useMemoUtn } = React;

function AdmUtentiPage({ search: searchProp, openUtente }) {
  const [search, setSearch] = useStateUtn(searchProp || '');
  const [sesso, setSesso] = useStateUtn('all');
  const [fascia, setFascia] = useStateUtn('all');
  const [regione, setRegione] = useStateUtn('all');
  const [statoFiltro, setStatoFiltro] = useStateUtn('all');
  const [selected, setSelected] = useStateUtn(null);
  React.useEffect(() => { if (openUtente) setSelected(openUtente); }, [openUtente && openUtente.id]);

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

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      <AdmCard padding={0}>
        <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, flexWrap:'wrap'}}>
          <div style={{position:'relative', flex:'0 0 240px'}}>
            <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={19}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o città…" style={{
              width:'100%', padding:'7px 10px 7px 32px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
              fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff',
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
          <span style={{fontSize:13.7, color:ADM.MUTED}}>{filtered.length} di {totUtenti}</span>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'minmax(0,2.4fr) 0.7fr 0.6fr 1.3fr 1.1fr 60px',
          padding:'10px 18px',
          borderBottom:`1px solid ${ADM.BORDER}`,
          fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em',
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
          <div style={{fontSize:26.6, fontWeight:700, color:ADM.TEXT, marginTop:8, letterSpacing:'-0.03em', lineHeight:1.05}}>
            {fmtEur(cur.value)}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:8}}>Da ordini in app · {cur.shortHelp}</div>
        </div>
        <div style={{
          width:38, height:38, borderRadius:11,
          background: ADM.OK_SOFT, color: ADM.OK,
          display:'grid', placeItems:'center',
          boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.4)', flexShrink:0,
        }}>
          <BuIcons.card size={23}/>
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
              padding:'4px 10px', fontSize:12.6, fontWeight:700,
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
    <div onClick={onClick} className="adm-row-open"
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
        <AdmAvatar name={u.nome} size={39} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{u.nome}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1}}>{u.email}</div>
        </div>
      </div>
      <div style={{fontSize:14, color:ADM.TEXT}}>{u.sesso === 'F' ? 'Donna' : 'Uomo'}</div>
      <div style={{fontSize:14, color:ADM.TEXT}}>{u.eta}</div>
      <div>
        <div style={{fontSize:14, color:ADM.TEXT, fontWeight:500}}>{u.citta}</div>
        <div style={{fontSize:13, color:ADM.MUTED}}>{u.regione}</div>
      </div>
      <div>
        {u.attivo
          ? <AdmBadge color="OK" size="xs">● Attivo</AdmBadge>
          : (
            <div>
              <AdmBadge color="PLAN_FREE" size="xs">○ Inattivo</AdmBadge>
              <div style={{fontSize:12.6, color:ADM.MUTED_SOFT, marginTop:3}}>Ultima: {fmtRelative(u.lastSession)}</div>
            </div>
          )}
      </div>
      <div style={{textAlign:'right', color:ADM.MUTED}}><span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span></div>
    </div>
  );
}

function UtenteDrawer({ utente: u, onClose }) {
  const [tab, setTab] = useStateUtn('anagrafica');
  const [period, setPeriod] = useStateUtn('total');

  // ── Mock stabili derivati dal seed utente (campi non ancora nel dataset) ──
  const seed = (u.id.charCodeAt(1) * 31 + u.id.charCodeAt(3)) % 1000;
  const rnd = (n) => ((seed * (n+1) * 9301 + 49297) % 233280) / 233280;
  const PREF_OPTS = ['Nessuna', 'Vegetariano', 'Vegano', 'Senza glutine', 'Senza lattosio', 'Pescetariano'];
  if (u.preferenze === undefined) u.preferenze = PREF_OPTS[seed % PREF_OPTS.length];
  if (u.byuppini === undefined) u.byuppini = 20 + (seed % 380);
  if (u.dataNascita === undefined) {
    const y = new Date().getFullYear() - u.eta;
    u.dataNascita = `${y}-${String(1 + (seed % 12)).padStart(2,'0')}-${String(1 + (seed % 28)).padStart(2,'0')}`;
  }
  if (u.verificato === undefined) u.verificato = seed % 3 !== 0;

  // ── Form anagrafica (editabile con salvataggio) ──
  const [form, setForm] = useStateUtn({
    nome: u.nome, email: u.email, tel: u.tel, citta: u.citta, regione: u.regione,
    dataNascita: u.dataNascita, sesso: u.sesso, preferenze: u.preferenze, verificato: u.verificato,
  });
  const dirty = form.nome !== u.nome || form.email !== u.email || form.tel !== u.tel
    || form.citta !== u.citta || form.regione !== u.regione || form.dataNascita !== u.dataNascita
    || form.sesso !== u.sesso || form.preferenze !== u.preferenze || form.verificato !== u.verificato;
  const [saved, setSaved] = useStateUtn(false);
  const etaCalcolata = (() => {
    const d = new Date(form.dataNascita);
    if (isNaN(d)) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 86400000)));
  })();
  const saveForm = () => {
    // L'età resta il campo derivato usato da lista e filtri: la teniamo in sync.
    Object.assign(u, { ...form, eta: etaCalcolata ?? u.eta });
    setSaved(true); setTimeout(()=>setSaved(false), 2200);
  };
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target ? e.target.value : e })); };

  // ── Azioni sensibili / byuppini / reset password ──
  const [resetSent, setResetSent] = useStateUtn(false);
  const [byupPopup, setByupPopup] = useStateUtn(null); // 'add' | 'sub' | null
  const [byupAmount, setByupAmount] = useStateUtn('');
  const [byupFeedback, setByupFeedback] = useStateUtn(null);
  const [deletePopup, setDeletePopup] = useStateUtn(false);
  const [banPopup, setBanPopup] = useStateUtn(null); // 'ban' | 'unban' | 'shadow' | 'unshadow' | null
  const [banned, setBanned] = useStateUtn(!!u.bannato);
  const [shadow, setShadow] = useStateUtn(!!u.shadowban);
  React.useEffect(() => { setBanned(!!u.bannato); setShadow(!!u.shadowban); setBanPopup(null); }, [u.id]);
  const confirmBan = () => {
    if (banPopup === 'ban' || banPopup === 'unban') { u.bannato = banPopup === 'ban'; setBanned(u.bannato); }
    if (banPopup === 'shadow' || banPopup === 'unshadow') { u.shadowban = banPopup === 'shadow'; setShadow(u.shadowban); }
    setBanPopup(null);
  };

  // ── Recensioni dell'utente (mock deterministico) + rimozione con motivo ──
  const REV_TESTI = [
    'Esperienza ottima, servizio veloce e piatti curati. Torneremo di sicuro!',
    'Buono ma non eccezionale: attesa un po\' lunga, però la qualità c\'è.',
    'Location carina e personale gentile. Prezzi onesti per la zona.',
    'Deludente: ordine sbagliato e tavolo prenotato non pronto all\'arrivo.',
    'Il migliore della città per rapporto qualità/prezzo. Consigliato!',
    'Menu ricco e ben spiegato nell\'app, il QR al tavolo funziona benissimo.',
  ];
  const [recensioni, setRecensioni] = useStateUtn([]);
  React.useEffect(() => {
    const attivi = LOCALI.filter(l => l.stato === 'active');
    const n = 2 + Math.floor(rnd(31) * 3); // 2-4 recensioni
    setRecensioni(Array.from({length: n}).map((_, i) => {
      const l = attivi[Math.floor(rnd(40 + i) * attivi.length)] || attivi[0];
      return {
        id: u.id + '-R' + i,
        locale: l,
        rating: 2 + Math.floor(rnd(50 + i) * 4),
        testo: REV_TESTI[Math.floor(rnd(60 + i) * REV_TESTI.length)],
        data: new Date(Date.now() - Math.floor(rnd(70 + i) * 200 + 3) * 86400000),
        rimossa: null,
      };
    }));
  }, [u.id]);
  const [revPopup, setRevPopup] = useStateUtn(null); // recensione da rimuovere
  const [revMotivo, setRevMotivo] = useStateUtn('');
  const confirmRimuoviRev = () => {
    if (!revMotivo.trim()) return;
    setRecensioni(prev => prev.map(r => r.id === revPopup.id ? { ...r, rimossa: revMotivo.trim() } : r));
    setRevPopup(null); setRevMotivo('');
  };
  const byupN = parseInt(byupAmount, 10) || 0;
  const byupValid = byupPopup === 'sub' ? (byupN > 0 && byupN <= u.byuppini) : byupN > 0;
  const confirmByup = () => {
    if (!byupValid) return;
    if (byupPopup === 'sub') {
      u.byuppini -= byupN;
      setByupFeedback(`−${byupN} byuppini stornati`);
    } else {
      u.byuppini += byupN;
      setByupFeedback(`+${byupN} byuppini caricati`);
    }
    setByupPopup(null); setByupAmount('');
    setTimeout(()=>setByupFeedback(null), 2500);
  };

  // ── Spese (tab 2) ──
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

  const inputStyle = {
    width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8,
    fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:760, maxWidth:'94%', background:'#fff', maxHeight:'88%',
        borderRadius:18, overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.22s cubic-bezier(0.22,0.9,0.35,1)',
        position:'relative',
      }}>
        {/* Header — titolo popup + identità essenziale (la meta vive in Anagrafica) */}
        <div style={{padding:'16px 24px 0', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Dettaglio utente</span>
            <AdmIconBtn icon="x" onClick={onClose}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
            <AdmAvatar name={form.nome} size={46} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
            <div style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <span style={{fontSize:18, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{form.nome}</span>
              {banned
                ? <AdmBadge color="DANGER" size="xs">⊘ Bannato</AdmBadge>
                : shadow
                ? <AdmBadge color="WARN" size="xs">◐ Shadowban</AdmBadge>
                : u.attivo
                ? <AdmBadge color="OK" size="xs">● Attivo</AdmBadge>
                : <AdmBadge color="PLAN_FREE" size="xs">○ Inattivo</AdmBadge>}
              {form.verificato && (
                <span style={{display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:99, background:ADM.INFO_SOFT, color:ADM.INFO, fontSize:12, fontWeight:700}}>
                  <BuIcons.check size={13}/> Verificato
                </span>
              )}
            </div>
          </div>
          {/* Tabs */}
          <div style={{display:'flex', gap:2}}>
            {[{id:'anagrafica', label:'Anagrafica'},{id:'spese', label:'Spese e abitudini'},{id:'recensioni', label:`Recensioni (${recensioni.length})`}].map(t => (
              <button key={t.id} className="adm-pill" onClick={()=>setTab(t.id)} style={{
                padding:'9px 14px', background:'transparent', border:'none',
                borderBottom:`2px solid ${tab === t.id ? ADM.PINK : 'transparent'}`,
                color: tab === t.id ? ADM.TEXT : ADM.MUTED,
                fontSize:13.5, fontWeight: tab === t.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit', marginBottom:-1,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ═══ TAB ANAGRAFICA ═══ */}
        {tab === 'anagrafica' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
                <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Informazioni account</div>
                {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
                <div style={{gridColumn:'1 / -1'}}>
                  <label style={labelStyle}>Nome e cognome</label>
                  <input value={form.nome} onChange={F('nome')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={form.email} onChange={F('email')} style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input value={form.tel} onChange={F('tel')} style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                <div>
                  <label style={labelStyle}>Luogo principale</label>
                  <input value={form.citta} onChange={F('citta')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Regione</label>
                  <input value={form.regione} onChange={F('regione')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Data di nascita</label>
                  <input type="date" value={form.dataNascita} onChange={F('dataNascita')} style={inputStyle}/>
                  {etaCalcolata !== null && <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:4}}>{etaCalcolata} anni</div>}
                </div>
                <div>
                  <label style={labelStyle}>Genere</label>
                  <select value={form.sesso} onChange={F('sesso')} style={{...inputStyle, cursor:'pointer'}}>
                    <option value="F">Donna</option>
                    <option value="M">Uomo</option>
                    <option value="X">Altro / N.D.</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Preferenze alimentari</label>
                  <select value={form.preferenze} onChange={F('preferenze')} style={{...inputStyle, cursor:'pointer'}}>
                    {PREF_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Codice utente</label>
                  <div style={{...inputStyle, background:ADM.PANEL_SOFT, color:ADM.MUTED, fontFamily:'ui-monospace,monospace', fontSize:12.5, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    {u.id}
                    <span style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:ADM.MUTED_SOFT}}>non modificabile</span>
                  </div>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10, marginTop:14, paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5, fontWeight:600, color:ADM.TEXT}}>Account verificato</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:1}}>Identità confermata via documento o pagamento</div>
                </div>
                <AdmSwitch checked={form.verificato} onChange={(v)=>{ setSaved(false); setForm(prev=>({...prev, verificato:v})); }}/>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:14}}>
                <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={saveForm}>Salva modifiche</AdmButton>
              </div>
            </AdmCard>

            {/* Byuppini */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Byuppini</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>Saldo attuale del programma fedeltà</div>
                  {byupFeedback && <div style={{fontSize:12.5, color: byupFeedback.startsWith('−') ? ADM.DANGER : ADM.OK, fontWeight:700, marginTop:4}}>✓ {byupFeedback}</div>}
                </div>
                <div style={{fontSize:26, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{fmtNum(u.byuppini)}</div>
                <AdmButton variant="secondary" size="md" icon="plus" onClick={()=>setByupPopup('add')}>Carica</AdmButton>
                <AdmButton variant="ghost" size="md" onClick={()=>setByupPopup('sub')}>Storna…</AdmButton>
              </div>
            </AdmCard>

            {/* Sicurezza */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Reset password</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>
                    {resetSent ? <span style={{color:ADM.OK, fontWeight:700}}>✓ Email di reset inviata a {form.email}</span> : `Invia un link di reimpostazione a ${form.email}`}
                  </div>
                </div>
                <AdmButton variant="secondary" size="md" icon="mail" disabled={resetSent} onClick={()=>setResetSent(true)}>Invia email di reset</AdmButton>
              </div>
            </AdmCard>

            {/* Zona sensibile — volutamente sobria e in fondo */}
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 6px 10px'}}>
              <span style={{fontSize:12, color:ADM.MUTED_SOFT, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Zona sensibile</span>
              <div style={{flex:1, height:1, background:ADM.BORDER_SOFT}}/>
              <button className="adm-textlink" onClick={()=>setBanPopup(shadow ? 'unshadow' : 'shadow')} style={{
                background:'transparent', border:'none', color: shadow ? ADM.MUTED : ADM.WARN, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>{shadow ? 'Rimuovi shadowban…' : 'Shadowban…'}</button>
              <button className="adm-textlink" onClick={()=>setBanPopup(banned ? 'unban' : 'ban')} style={{
                background:'transparent', border:'none', color: banned ? ADM.MUTED : ADM.DANGER, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>{banned ? 'Rimuovi ban…' : 'Banna utente…'}</button>
              <button className="adm-textlink" onClick={()=>setDeletePopup(true)} style={{
                background:'transparent', border:'none', color:ADM.DANGER, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>Elimina account…</button>
            </div>
          </div>
        )}

        {/* ═══ TAB SPESE E ABITUDINI ═══ */}
        {tab === 'spese' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Periodo</span>
              <div style={{display:'flex', gap:4}}>
                {Object.entries(periodLabels).map(([k, label]) => (
                  <button key={k} className="adm-pill" onClick={()=>setPeriod(k)} style={{
                    padding:'6px 12px',
                    background: period === k ? ADM.TEXT : '#fff',
                    color: period === k ? '#fff' : ADM.MUTED,
                    border: period === k ? 'none' : `1px solid ${ADM.BORDER}`,
                    borderRadius:7, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                  }}>{label}</button>
                ))}
              </div>
            </div>

            <AdmCard padding={0}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
                <MiniStat first label="Spesa" value={fmtEur(spesaP)} sub={periodLabels[period]}/>
                <MiniStat label="Ordini delivery" value={ordiniP} sub={periodLabels[period]}/>
                <MiniStat label="Asporto" value={Math.round(ordiniP*0.42)} sub={periodLabels[period]}/>
                <MiniStat label="Prenotazioni" value={prenP} sub={periodLabels[period]}/>
              </div>
            </AdmCard>

            <AdmCard padding={20}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
                <div>
                  <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Spesa storica per locale</div>
                  <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>{periodLabels[period]} · ordinato per spesa</div>
                </div>
                <div style={{fontSize:13.3, color:ADM.MUTED}}>Totale: <span style={{fontWeight:700, color:ADM.TEXT}}>{fmtEur(spesaP)}</span></div>
              </div>
              {localiP.length === 0 && <div style={{fontSize:13.7, color:ADM.MUTED, padding:'18px 0', textAlign:'center'}}>Nessuna spesa registrata nel periodo selezionato</div>}
              <div style={{display:'flex', flexDirection:'column', gap:11}}>
                {localiP.map((l, i) => {
                  const pct = (l.spesaTotale / maxSpesa) * 100;
                  return (
                    <div key={l.id}>
                      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:5}}>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontSize:14, color:ADM.TEXT, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</div>
                          <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{l.tipo} · {l.citta} · ultimo ordine {fmtRelative(l.ultimoOrdine)}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:14.4, color:ADM.TEXT, fontWeight:700}}>{fmtEur(l.spesaTotale)}</div>
                          <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{l.ordini} ordini</div>
                        </div>
                      </div>
                      <div style={{height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                        <div style={{width:`${pct}%`, height:'100%', background: i === 0 ? ADM.PINK : ADM.INK, opacity: i === 0 ? 1 : 0.55, borderRadius:99}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdmCard>

            <AdmCard padding={20}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Attività account</div>
              <DataRow label="Registrato il" value={fmtDate(u.dataRegistrazione)}/>
              <DataRow label="Ultima sessione" value={fmtRelative(u.lastSession)} last/>
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB RECENSIONI ═══ */}
        {tab === 'recensioni' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12, background:ADM.PANEL_SOFT}}>
            {shadow && (
              <div style={{padding:'11px 14px', background:'#FFF7E6', border:'1px solid #FDE68A', borderRadius:10, fontSize:13, color:'#78350F', display:'flex', alignItems:'center', gap:8}}>
                <BuIcons.shield size={17}/>
                <span><strong>Shadowban attivo</strong> — queste recensioni sono visibili solo all'utente, non compaiono sulle schede dei locali.</span>
              </div>
            )}
            {recensioni.map(r => (
              <AdmCard key={r.id} padding={16}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:9, flexWrap:'wrap'}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{r.locale.nome}</div>
                    <div style={{fontSize:12.3, color:ADM.MUTED}}>{r.locale.citta} · {fmtDate(r.data)}</div>
                  </div>
                  <div style={{flex:1}}/>
                  <span style={{fontSize:14.4, letterSpacing:1, color:'#F5A623'}}>{'★'.repeat(r.rating)}<span style={{color:ADM.BORDER}}>{'★'.repeat(5 - r.rating)}</span></span>
                  {!r.rimossa && (
                    <button className="adm-textlink" onClick={()=>{ setRevPopup(r); setRevMotivo(''); }} style={{
                      background:'transparent', border:'none', color:ADM.DANGER, fontSize:12.5, fontWeight:600,
                      cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
                    }}>Rimuovi…</button>
                  )}
                </div>
                {r.rimossa ? (
                  <div style={{padding:'10px 13px', background:ADM.DANGER_SOFT, borderRadius:8, fontSize:13, color:'#7F1D1D', display:'flex', alignItems:'center', gap:8}}>
                    <BuIcons.x size={16}/>
                    <span><strong>Recensione rimossa</strong> · “{r.rimossa}” · registrata nell'audit log</span>
                  </div>
                ) : (
                  <div style={{padding:'10px 13px', background:ADM.PANEL_SOFT, borderLeft:`3px solid ${ADM.INK_SOFT}`, borderRadius:'0 8px 8px 0', fontSize:13.5, color:ADM.TEXT, lineHeight:1.5, fontStyle:'italic'}}>
                    “{r.testo}”
                  </div>
                )}
              </AdmCard>
            ))}
            {recensioni.length === 0 && (
              <div style={{padding:'30px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>Nessuna recensione pubblicata da questo utente.</div>
            )}
          </div>
        )}

        {/* ═══ Popup conferma: rimozione recensione ═══ */}
        {revPopup && (
          <div style={{position:'absolute', inset:0, zIndex:20, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setRevPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:430, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere la recensione su {revPopup.locale.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>La recensione sparisce dalla scheda del locale. {form.nome} riceve una notifica con il motivo. L'azione viene registrata nell'audit log.</div>
              <textarea autoFocus value={revMotivo} onChange={e=>setRevMotivo(e.target.value)} placeholder="Motivo della rimozione (obbligatorio) — es. viola le linee guida della community"
                style={{width:'100%', minHeight:74, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.3, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:12}}/>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setRevPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" disabled={!revMotivo.trim()} onClick={confirmRimuoviRev}>Rimuovi recensione</AdmButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: carica / storna byuppini ═══ */}
        {byupPopup && (
          <div style={{position:'absolute', inset:0, zIndex:20, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setByupPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:380, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>{byupPopup === 'sub' ? 'Storna byuppini' : 'Carica byuppini'}</div>
              <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>
                {byupPopup === 'sub' ? 'Storno manuale dal saldo di ' : 'Accredito manuale sul saldo di '}{form.nome} (attuale: <strong style={{color:ADM.TEXT}}>{fmtNum(u.byuppini)}</strong>)
              </div>
              <label style={labelStyle}>{byupPopup === 'sub' ? 'Quantità da stornare' : 'Quantità da accreditare'}</label>
              <input type="number" min="1" max={byupPopup === 'sub' ? u.byuppini : undefined} autoFocus value={byupAmount} onChange={e=>setByupAmount(e.target.value)}
                onKeyDown={e=>{ if (e.key === 'Enter') confirmByup(); }}
                placeholder="Es. 100" style={{...inputStyle, marginBottom: byupPopup === 'sub' && byupN > u.byuppini ? 6 : 14}}/>
              {byupPopup === 'sub' && byupN > u.byuppini && (
                <div style={{fontSize:12.5, color:ADM.DANGER, fontWeight:600, marginBottom:10}}>Massimo stornabile: {fmtNum(u.byuppini)} (il saldo non può andare sotto zero)</div>
              )}
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>{ setByupPopup(null); setByupAmount(''); }}>Annulla</AdmButton>
                {byupPopup === 'sub'
                  ? <AdmButton variant="danger" size="md" icon="x" disabled={!byupValid} onClick={confirmByup}>Conferma storno</AdmButton>
                  : <AdmButton variant="primary" size="md" icon="check" disabled={!byupValid} onClick={confirmByup}>Conferma accredito</AdmButton>}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: ban / rimozione ban ═══ */}
        {banPopup && (
          <div style={{position:'absolute', inset:0, zIndex:20, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setBanPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:410, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              {banPopup === 'shadow' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Shadowban per {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  Le sue recensioni diventano <strong>invisibili a tutti tranne che a lui</strong>: non riceve notifiche e non se ne accorge. Reversibile in qualsiasi momento. L'azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="shield" onClick={confirmBan}>Attiva shadowban</AdmButton>
                </div>
              </>) : banPopup === 'unshadow' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere lo shadowban a {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  Le sue recensioni tornano visibili a tutti. Anche questa azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" onClick={confirmBan}>Rimuovi shadowban</AdmButton>
                </div>
              </>) : banPopup === 'ban' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Bannare {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</strong> viene <strong style={{color:ADM.DANGER}}>bloccato</strong>: niente più accesso all'app, ordini, prenotazioni o recensioni. L'azione è reversibile e viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="danger" size="md" icon="lock" onClick={confirmBan}>Banna utente</AdmButton>
                </div>
              </>) : (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere il ban a {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  L'account torna pienamente operativo: accesso, ordini e recensioni. Anche questa azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" onClick={confirmBan}>Rimuovi ban</AdmButton>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: eliminazione account ═══ */}
        {deletePopup && (
          <div style={{position:'absolute', inset:0, zIndex:20, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setDeletePopup(false)}>
            <div onClick={e=>e.stopPropagation()} style={{width:400, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Eliminare l'account di {form.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</strong> e tutti i suoi dati (ordini, byuppini, preferenze) verranno rimossi in modo <strong style={{color:ADM.DANGER}}>irreversibile</strong>.
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setDeletePopup(false)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" onClick={()=>{ setDeletePopup(false); onClose(); }}>Elimina definitivamente</AdmButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.AdmUtentiPage = AdmUtentiPage;

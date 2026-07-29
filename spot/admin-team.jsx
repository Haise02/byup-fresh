// Admin Team: gestione utenti dello staff con ruoli e permessi

const { useState: useStateTeam } = React;

// Tre sezioni diverse condividono questo componente perche condividono le tab:
// tenerle in tre file avrebbe voluto dire tre copie della stessa lista membri.
// `sezione` decide quali tab mostrare, non quali esistono.
const ADM_SEZIONI = {
  sicurezza:    { pred:'accessi',     tabs:['accessi','audit','diagnostica'] },
  hr:           { pred:'formazione',  tabs:['formazione'] },
  impostazioni: { pred:'piattaforma', tabs:['piattaforma'] },
};

function AdmTeamPage({ search, initialTab, sezione = 'sicurezza' }) {
  const sez = ADM_SEZIONI[sezione] || ADM_SEZIONI.sicurezza;
  const [tab, setTab] = useStateTeam(initialTab || sez.pred);
  // Un link da un'altra sezione — «Apri» su un adempimento del cruscotto — deve
  // poter arrivare sulla tab giusta, non sulla prima.
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  const [invitiOpen, setInvitiOpen] = useStateTeam(false);
  const [members, setMembers] = useStateTeam(TEAM);
  const [inviteOpen, setInviteOpen] = useStateTeam(false);


  const handleInvite = (nuovo) => {
    setMembers(prev => [
      {
        id: 'm' + Date.now(),
        nome: nuovo.nome.trim(),
        email: nuovo.email.trim(),
        ruolo: nuovo.ruolo,
        lastActive: null,
        due_fa: false,
        attivo: true,
        pending: true,
        addedBy: 'Tu',
        addedOn: new Date(),
      },
      ...prev,
    ]);
    setInviteOpen(false);
    setTab('membri');
  };

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      <AdmCard padding={0}>
        {/* Con una sola tab la barra non offre nessuna scelta: mostrarla
            sarebbe un comando che non comanda niente. */}
        <div style={{padding:'0 22px 0 8px', borderBottom:`1px solid ${ADM.BORDER}`,
          display: sez.tabs.length > 1 ? 'flex' : 'none', alignItems:'center', gap:12}}>
          <AdmTabBar tabs={[
            // Team e Riesame erano la stessa anagrafica in due tab: gli stessi
            // nomi, le stesse email, gli stessi ruoli, con due colonne diverse in
            // fondo. Ora la lista e una e il riesame e uno stato in cui si trova.
            { id:'accessi',     label:'Accessi',         badge:members.length },
            { id:'formazione',  label:'Formazione' },
            { id:'audit',       label:'Audit log' },
            { id:'piattaforma', label:'Piattaforma' },
            { id:'diagnostica', label:'Diagnostica' },
          ].filter(t => sez.tabs.indexOf(t.id) !== -1)} active={tab} onChange={setTab}/>
          <div style={{flex:1}}/>
          {tab === 'accessi' && <AdmButton variant="primary" size="sm" icon="plus" className="adm-btn-invite" onClick={()=>setInviteOpen(true)}>Invita membro</AdmButton>}
        </div>

        {tab === 'accessi' && (
          <React.Fragment>
            {/* La lista sta qui dentro: il riesame la porta gia con nome, email,
                ruolo, aree e ultimo accesso. Sotto restano le due cose che erano
                solo del Team — chi e stato invitato e cosa puo fare ogni ruolo. */}
            <AccessReview/>

            <div className="adm-row-open" onClick={()=>setInvitiOpen(o=>!o)} style={{padding:'16px 22px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none'}}>
              <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Inviti pendenti</span>
              <span style={{fontSize:12.2, fontWeight:700, background:'rgba(120,120,128,0.15)', color:ADM.MUTED, padding:'1px 7px', borderRadius:999}}>2</span>
              <span className="adm-row-chev" style={{display:'inline-flex', color:ADM.MUTED_SOFT, transform:invitiOpen?'rotate(90deg)':'none', transition:'transform 0.15s ease'}}><BuIcons.chevronRight size={16}/></span>
              {!invitiOpen && <span style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>Sara Greco, Davide Conti · clicca per espandere</span>}
            </div>
            {invitiOpen && <InvitiPending/>}

            <div style={{padding:'20px 22px 0', borderTop:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Ruoli & permessi</span>
            </div>
            <RuoliMatrix/>
          </React.Fragment>
        )}
        {tab === 'formazione' && (window.CfFormazione ? <CfFormazione/> : null)}
        {tab === 'piattaforma' && <PlatformConfig/>}
        {tab === 'diagnostica' && <PlatformDiagnostica/>}
        {tab === 'audit' && <AuditLog/>}
      </AdmCard>

      <InviteMemberModal open={inviteOpen} onClose={()=>setInviteOpen(false)} onInvite={handleInvite}/>
    </div>
  );
}

function InviteMemberModal({ open, onClose, onInvite }) {
  const [nome, setNome] = useStateTeam('');
  const [email, setEmail] = useStateTeam('');
  const [ruolo, setRuolo] = useStateTeam('support');

  // Reset dei campi ogni volta che il modale si apre
  React.useEffect(() => {
    if (open) { setNome(''); setEmail(''); setRuolo('support'); }
  }, [open]);

  // Chiusura con Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nomeOk = nome.trim().length >= 2;
  const canSend = nomeOk && emailOk;

  const submit = () => { if (canSend) onInvite({ nome, email, ruolo }); };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:60,
      background:'rgba(15,17,21,0.55)',
      display:'grid', placeItems:'center', padding:24,
      animation:'fadeIn 0.15s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Invita un membro" style={{
        width:'min(520px, 100%)',
        background:'#fff', borderRadius:14,
        boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
        overflow:'hidden', animation:'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:36, height:36, borderRadius:9, background:ADM.PINK_BG_SOFT, color:ADM.PINK, display:'grid', placeItems:'center'}}>
            <BuIcons.users size={22}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16.2, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Invita un membro</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Riceverà un'email per impostare la password e accedere</div>
          </div>
          <AdmIconBtn icon="x" onClick={onClose} label="Chiudi"/>
        </div>

        {/* Body */}
        <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:16}}>
          {/* Anteprima avatar + nome */}
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <AdmAvatar name={nome.trim() || '?'} size={49}/>
            <div style={{minWidth:0}}>
              <div style={{fontSize:14.8, fontWeight:600, color: nome.trim() ? ADM.TEXT : ADM.MUTED_LIGHT}}>{nome.trim() || 'Nuovo membro'}</div>
              <div style={{fontSize:13.7, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{email.trim() || 'email@byup.it'}</div>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <TeamField label="Nome e cognome">
              <input autoFocus value={nome} onChange={e=>setNome(e.target.value)} placeholder="Es. Giulia Romano" style={teamInputStyle}/>
            </TeamField>
            <TeamField label="Email aziendale" hint={email && !emailOk ? 'Email non valida' : ''}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') submit(); }} placeholder="nome@byup.it" style={{...teamInputStyle, borderColor: email && !emailOk ? ADM.DANGER : ADM.BORDER}}/>
            </TeamField>
          </div>

          <div>
            <div style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT, marginBottom:8}}>Ruolo</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {Object.entries(RUOLI).map(([id, r]) => {
                const sel = ruolo === id;
                return (
                  <button key={id} onClick={()=>setRuolo(id)} style={{
                    textAlign:'left', padding:'10px 12px', cursor:'pointer', fontFamily:'inherit',
                    background: sel ? ADM.PINK_BG_SOFT : '#fff',
                    border:`1.5px solid ${sel ? ADM.PINK : ADM.BORDER}`,
                    borderRadius:10, display:'flex', flexDirection:'column', gap:3,
                    transition:'border-color 0.15s, background 0.15s',
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap:7}}>
                      <span style={{width:8, height:8, borderRadius:'50%', background:ADM[r.color], flexShrink:0}}/>
                      <span style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{r.label}</span>
                    </div>
                    <span style={{fontSize:12.6, color:ADM.MUTED, lineHeight:1.35}}>{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10, background:ADM.PANEL_SOFT}}>
          <div style={{fontSize:13.3, color:ADM.MUTED, display:'flex', alignItems:'center', gap:6}}>
            <BuIcons.shield size={18} color={ADM.MUTED}/> L'invito scade dopo 7 giorni
          </div>
          <div style={{flex:1}}/>
          <AdmButton variant="secondary" size="sm" onClick={onClose}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" icon="send" disabled={!canSend} onClick={submit}>Invia invito</AdmButton>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}

const teamInputStyle = {
  width:'100%', padding:'9px 12px',
  border:`1px solid ${ADM.BORDER}`, borderRadius:8,
  fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
  outline:'none', boxSizing:'border-box',
};

function TeamField({ label, hint, children }) {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6, gap:8}}>
        <label style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>{label}</label>
        {hint && <span style={{fontSize:13, color:ADM.DANGER, fontWeight:500}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function RuoliMatrix() {
  return (
    <div style={{padding:'20px 22px'}}>
      <div style={{fontSize:13.7, color:ADM.MUTED, marginBottom:14}}>Matrice di permessi per ogni ruolo. Le modifiche si applicano a tutti i membri con quel ruolo.</div>
      <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
        <div style={{
          display:'grid',
          gridTemplateColumns:`220px repeat(${Object.keys(RUOLI).length}, 1fr)`,
          background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`,
        }}>
          <div style={{padding:'12px 14px', fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Permesso</div>
          {Object.entries(RUOLI).map(([id, r]) => (
            <div key={id} style={{padding:'12px 8px', textAlign:'center', borderLeft:`1px solid ${ADM.BORDER}`}}>
              <AdmBadge color={r.color} size="xs">{r.label}</AdmBadge>
            </div>
          ))}
        </div>
        {PERMESSI.map((p, i) => (
          <div key={p.id} style={{
            display:'grid',
            gridTemplateColumns:`220px repeat(${Object.keys(RUOLI).length}, 1fr)`,
            borderBottom: i === PERMESSI.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            background: i%2===1 ? ADM.ROW_STRIPE : '#fff',
          }}>
            <div style={{padding:'12px 14px'}}>
              <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{p.label}</div>
              <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>{p.desc}</div>
            </div>
            {Object.entries(RUOLI).map(([rid, r]) => {
              const has = r.permessi.includes(p.id);
              return (
                <div key={rid} style={{padding:'12px 8px', textAlign:'center', borderLeft:`1px solid ${ADM.BORDER_SOFT}`, display:'grid', placeItems:'center'}}>
                  {has ? (
                    <div style={{width:22, height:22, borderRadius:5, background:ADM.OK, color:'#fff', display:'grid', placeItems:'center'}}>
                      <BuIcons.check size={18}/>
                    </div>
                  ) : (
                    <div style={{width:22, height:22, borderRadius:5, border:`1.5px dashed ${ADM.BORDER}`, color:ADM.MUTED_LIGHT}}/>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function InvitiPending() {
  const inviti = [
    { nome:'Sara Greco', email:'sara.greco@byup.it', ruolo:'support', inviato: new Date(Date.now()-86400000*2), scade: new Date(Date.now()+86400000*5) },
    { nome:'Davide Conti', email:'davide.c@byup.it', ruolo:'operations', inviato: new Date(Date.now()-86400000*4), scade: new Date(Date.now()+86400000*3) },
  ];
  return (
    <div>
      {inviti.map((inv, i) => (
        <div key={i} style={{display:'grid', gridTemplateColumns:'minmax(0,2fr) 1.2fr 1.2fr 1.2fr 160px', padding:'14px 22px', borderBottom: i === inviti.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`, alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:11}}>
            <div style={{width:34, height:34, borderRadius:'50%', background:'#F0F1F3', display:'grid', placeItems:'center', color:ADM.MUTED}}><BuIcons.mail size={20}/></div>
            <div>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{inv.nome}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED}}>{inv.email}</div>
            </div>
          </div>
          <div><AdmBadge color={RUOLI[inv.ruolo].color} size="xs">{RUOLI[inv.ruolo].label}</AdmBadge></div>
          <div style={{fontSize:13.7, color:ADM.MUTED}}>Inviato {fmtRelative(inv.inviato)}</div>
          <div style={{fontSize:13.7, color:ADM.WARN, fontWeight:500}}>Scade tra {Math.max(1, Math.round((inv.scade - Date.now()) / 86400000))} giorni</div>
          <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
            <AdmButton variant="ghost" size="sm">Rinvia</AdmButton>
            <AdmButton variant="ghost" size="sm">Revoca</AdmButton>
          </div>
        </div>
      ))}
    </div>
  );
}

const AUDIT_TIPI = [
  { value:'cert',         label:'Certificazioni' },
  { value:'team',         label:'Ruoli & team' },
  { value:'accessi',      label:'Riesame accessi' },
  { value:'segnalazione', label:'Segnalazioni' },
  { value:'locale',       label:'Locali' },
  { value:'piano',        label:'Piani' },
  { value:'broadcast',    label:'Broadcast' },
];

const AUDIT_EVENTS = [
  { who:'Marco Rinaldi', action:'ha approvato la certificazione', target:'HACCP · Trattoria del Borgo', icon:'check', color:'OK', tipo:'cert', when: new Date(Date.now()-3600000) },
  { who:'Federica Bianchi', action:'ha modificato il ruolo di', target:'Andrea Conte → Operations', icon:'shield', color:'INFO', tipo:'team', when: new Date(Date.now()-86400000) },
  { who:'Luca Marini', action:'ha risolto la segnalazione', target:'SEG-002 · Stampa scontrini non funziona', icon:'check', color:'OK', tipo:'segnalazione', when: new Date(Date.now()-86400000*1.2) },
  { who:'Giulia Romano', action:'ha disattivato il locale', target:'Da Mario', icon:'lock', color:'WARN', tipo:'locale', when: new Date(Date.now()-86400000*2) },
  { who:'Marco Rinaldi', action:'ha rifiutato la certificazione', target:'Licenza commerciale · Vicolo Stretto', icon:'x', color:'DANGER', tipo:'cert', when: new Date(Date.now()-86400000*3) },
  { who:'Sistema', action:'ha aggiornato il piano di', target:'Osteria Le Querce → Plus', icon:'crown', color:'PURPLE', tipo:'piano', when: new Date(Date.now()-86400000*4) },
  { who:'Federica Bianchi', action:'ha inviato un broadcast a', target:'127 utenti (filtro: Milano, donne 26-35)', icon:'send', color:'PINK', tipo:'broadcast', when: new Date(Date.now()-86400000*5) },
];

function AuditLog() {
  const [query, setQuery] = useStateTeam('');
  const [autore, setAutore] = useStateTeam('all');
  const [tipo, setTipo] = useStateTeam('all');

  const autori = [...new Set(AUDIT_EVENTS.map(e => e.who))].sort();

  const filtered = AUDIT_EVENTS.filter(e => {
    if (autore !== 'all' && e.who !== autore) return false;
    if (tipo !== 'all' && e.tipo !== tipo) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!(`${e.who} ${e.action} ${e.target}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const hasFilters = query.trim() || autore !== 'all' || tipo !== 'all';

  return (
    <div>
      {/* Barra ricerca + filtri */}
      <div style={{padding:'14px 22px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, flexWrap:'wrap'}}>
        <div style={{position:'relative', display:'flex', alignItems:'center'}}>
          <span style={{position:'absolute', left:10, color:ADM.MUTED, pointerEvents:'none', display:'inline-flex'}}>
            <BuIcons.search size={18}/>
          </span>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Cerca autore, azione, oggetto…"
            style={{
              padding:'7px 12px 7px 30px',
              border:`1px solid ${ADM.BORDER}`, borderRadius:7,
              fontSize:14, fontFamily:'inherit',
              width:280, color:ADM.TEXT, background:'#fff', outline:'none',
            }}
          />
          {query && (
            <button onClick={()=>setQuery('')} style={{
              position:'absolute', right:6, background:'transparent', border:'none', cursor:'pointer',
              color:ADM.MUTED, padding:4, display:'inline-flex', borderRadius:4,
            }} aria-label="Cancella ricerca"><BuIcons.x size={17}/></button>
          )}
        </div>

        <FilterDropdown label="Autore" value={autore} onChange={setAutore} options={[
          {value:'all', label:'Tutti gli autori'},
          ...autori.map(a => ({value:a, label:a})),
        ]}/>
        <FilterDropdown label="Tipo" value={tipo} onChange={setTipo} options={[
          {value:'all', label:'Tutti i tipi'},
          ...AUDIT_TIPI,
        ]}/>

        <div style={{flex:1}}/>
        <span style={{fontSize:13.7, color:ADM.MUTED}}>{filtered.length} eventi</span>
        {hasFilters && (
          <button onClick={()=>{ setQuery(''); setAutore('all'); setTipo('all'); }} style={{
            background:'transparent', border:'none', color:ADM.PINK, fontSize:13.7, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5,
          }}><BuIcons.x size={17}/> Azzera filtri</button>
        )}
      </div>

      {/* Lista eventi */}
      <div style={{padding:'8px 0'}}>
        {filtered.length === 0 && (
          <AdmEmpty title="Nessun evento trovato" desc="Modifica la ricerca o azzera i filtri"/>
        )}
        {filtered.map((e, i) => {
          const Icon = BuIcons[e.icon];
          return (
            <div key={i} style={{display:'flex', gap:14, padding:'14px 22px', borderBottom: i === filtered.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`, alignItems:'center'}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM[e.color+'_SOFT'], color:ADM[e.color], display:'grid', placeItems:'center', flexShrink:0}}>
                <Icon size={19}/>
              </div>
              <div style={{flex:1, fontSize:14.4, color:ADM.TEXT}}>
                <span style={{fontWeight:600}}>{e.who}</span>
                <span style={{color:ADM.MUTED}}> {e.action} </span>
                <span style={{fontWeight:600}}>{e.target}</span>
              </div>
              <div style={{fontSize:13, color:ADM.MUTED_SOFT}}>{fmtRelative(e.when)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Configurazione piattaforma — le leve commerciali, senza deploy ─────────
// Solo Super Admin · ogni salvataggio richiede conferma e finisce in audit.
function PlatformConfig() {
  // Tre durate: il mensile è il riferimento, annuale e triennale sono le leve
  // di sconto. Il risparmio non si scrive a mano — si calcola dal mensile, così
  // cambiando un prezzo si vede subito che sconto si sta davvero offrendo.
  const DEFAULTS = {
    free:     { label:'Gratuito', prezzo:0,      anno:0,       triennio:0,      ordini:550,   extra:0.45 },
    starter:  { label:'Starter',  prezzo:46.99,  anno:469.90,  triennio:1269.00, ordini:1850,  extra:0.34 },
    plus:     { label:'Plus',     prezzo:134.99, anno:1349.90, triennio:3644.00, ordini:7500,  extra:0.23 },
    business: { label:'Business', prezzo:250,    anno:2500.00, triennio:6750.00, ordini:15000, extra:0.12 },
  };
  const [cfg, setCfg] = React.useState(() => JSON.parse(JSON.stringify(DEFAULTS)));
  // Peso dell'ordine per canale. L'app pesa meno per incentivarne l'adozione:
  // è il meccanismo del flywheel. Gli altri partono da 1 ma sono leve, non
  // costanti — domani si può voler spingere la webapp o frenare la cassa.
  const [pesi, setPesi] = React.useState({ app:'0.5', webapp:'1', cameriere:'1', cassa:'1' });
  // Discovery: la soglia dice QUANTI locali servono, il raggio dice ENTRO CHE
  // DISTANZA contarli. Senza il raggio la soglia non è definita.
  const [disc, setDisc] = React.useState({ raggioCitta:'6', sogliaCitta:'125', raggioRegione:'50', sogliaRegione:'150' });
  const [confirm, setConfirm] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const set = (piano, k) => (e) => { setSaved(false); setCfg(prev => ({ ...prev, [piano]: { ...prev[piano], [k]: e.target.value } })); };
  const setPeso = (k) => (e) => { setSaved(false); setPesi(prev => ({ ...prev, [k]: e.target.value })); };
  const setDisco = (k) => (e) => { setSaved(false); setDisc(prev => ({ ...prev, [k]: e.target.value })); };
  // Sconto implicito rispetto al mensile pagato per la stessa durata.
  const sconto = (mese, totale, mesi) => {
    const m = parseFloat(mese), t = parseFloat(totale);
    if (!m || !t) return null;
    const pieno = m * mesi;
    return Math.round((1 - t / pieno) * 100);
  };
  const inp = {width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
  const lab = {fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};
  const doSave = () => { setConfirm(false); setSaved(true); setTimeout(()=>setSaved(false), 3000); };
  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:14, position:'relative'}}>
      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Piani e prezzi</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {Object.entries(cfg).map(([id, p]) => (
          <div key={id} style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
            <div style={{fontSize:13.5, fontWeight:800, color:ADM.TEXT, marginBottom:12}}>{p.label}</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <div><label style={lab}>Prezzo €/mese</label><input type="number" step="0.01" value={p.prezzo} onChange={set(id,'prezzo')} style={inp} disabled={id==='free'}/></div>
              <div>
                <label style={lab}>€ /anno {(() => { const s = sconto(p.prezzo, p.anno, 12); return s ? <span style={{color:ADM.OK, marginLeft:4}}>−{s}%</span> : null; })()}</label>
                <input type="number" step="0.01" value={p.anno} onChange={set(id,'anno')} style={inp} disabled={id==='free'}/>
              </div>
              <div>
                <label style={lab}>€ /triennio {(() => { const s = sconto(p.prezzo, p.triennio, 36); return s ? <span style={{color:ADM.OK, marginLeft:4}}>−{s}%</span> : null; })()}</label>
                <input type="number" step="0.01" value={p.triennio} onChange={set(id,'triennio')} style={inp} disabled={id==='free'}/>
              </div>
              <div><label style={lab}>Ordini inclusi</label><input type="number" value={p.ordini} onChange={set(id,'ordini')} style={inp}/></div>
              <div><label style={lab}>€ / ordine extra</label><input type="number" step="0.01" value={p.extra} onChange={set(id,'extra')} style={inp}/></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginTop:6}}>Peso dell'ordine per canale</div>
      <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:-6, lineHeight:1.5}}>
        Quanto ogni ordine consuma del pacchetto incluso nel piano. L'app pesa meno per
        incentivarne l'adozione — è il meccanismo che tiene insieme locale e cliente finale.
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {[
          { k:'app',       label:'Byup App',   nota:'Ordine dal telefono del cliente, con account' },
          { k:'webapp',    label:'Webapp QR',  nota:'Ordine da QR senza app, ospite non registrato' },
          { k:'cameriere', label:'Cameriere',  nota:'Comanda presa in sala dallo staff' },
          { k:'cassa',     label:'Cassa',      nota:'Ordine battuto al banco o alla cassa' },
        ].map(c => {
          const v = parseFloat(pesi[c.k]);
          return (
            <div key={c.k} style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
              <label style={lab}>{c.label}</label>
              <input type="number" step="0.05" min="0" max="5" value={pesi[c.k]} onChange={setPeso(c.k)} style={inp}/>
              <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.4}}>{c.nota}</div>
              <div style={{fontSize:11.8, color: v === 1 ? ADM.MUTED : v < 1 ? ADM.OK : ADM.WARN, fontWeight:700, marginTop:6}}>
                {!v && v !== 0 ? '—' : v === 1 ? 'Peso pieno' : v === 0 ? 'Non conteggiato' : v < 1 ? `Sconta il ${Math.round((1-v)*100)}%` : `Conta ${v}×`}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginTop:6}}>Discovery nell'app</div>
      <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:-6, lineHeight:1.5}}>
        Il <strong>raggio</strong> definisce entro che distanza dal GPS dell'utente cercare i locali;
        la <strong>soglia</strong> quanti devono essercene perché la ricerca si accenda. Sotto soglia
        l'app non mostra la discovery: meglio niente che una mappa vuota.
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:12}}>
        {[
          { id:'citta',   titolo:'Vicino a te', rk:'raggioCitta',   sk:'sogliaCitta',
            nota:'È la home dell\'app: i locali nei dintorni dell\'utente.' },
          { id:'regione', titolo:'Regionale',   rk:'raggioRegione', sk:'sogliaRegione',
            nota:'Fallback quando intorno all\'utente non si raggiunge la soglia.' },
        ].map(b => (
          <div key={b.id} style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
            <div style={{fontSize:13.5, fontWeight:800, color:ADM.TEXT, marginBottom:12}}>{b.titolo}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div>
                <label style={lab}>Raggio · km</label>
                <input type="number" step="1" min="1" value={disc[b.rk]} onChange={setDisco(b.rk)} style={inp}/>
              </div>
              <div>
                <label style={lab}>Soglia · locali</label>
                <input type="number" step="5" min="1" value={disc[b.sk]} onChange={setDisco(b.sk)} style={inp}/>
              </div>
            </div>
            <div style={{fontSize:11.8, color:ADM.TEXT, marginTop:10, lineHeight:1.45}}>
              Si accende con almeno <strong>{disc[b.sk] || '—'} locali</strong> entro <strong>{disc[b.rk] || '—'} km</strong> dall'utente.
            </div>
            <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:4, lineHeight:1.4}}>{b.nota}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:10}}>
        {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Configurazione salvata e registrata in audit</span>}
        <AdmButton variant="primary" size="md" icon="check" onClick={()=>setConfirm(true)}>Salva configurazione</AdmButton>
      </div>

      {confirm && (
        <div style={{position:'fixed', inset:0, zIndex:80, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setConfirm(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:420, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Applicare la nuova configurazione?</div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
              Prezzi, soglie e pesi verranno applicati a <strong style={{color:ADM.TEXT}}>tutti i locali</strong> dal prossimo ciclo di fatturazione. L'azione viene registrata nell'audit log con il tuo nome.
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="ghost" size="md" onClick={()=>setConfirm(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="md" icon="check" onClick={doSave}>Conferma e applica</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Diagnostica piattaforma ─────────────────────────────────────────────────
// Salute tecnica trasversale: uptime dei servizi, errori di pagamento aggregati,
// code di elaborazione, ultimi incidenti. Dati mock. Colore solo per gli stati.
function PlatformDiagnostica() {
  const SERVIZI = [
    { nome:'App cliente',       uptime:'99,98%', latenza:'142 ms', stato:'ok' },
    { nome:'Gestionale',        uptime:'99,95%', latenza:'188 ms', stato:'ok' },
    { nome:'API ordini',        uptime:'99,99%', latenza:'96 ms',  stato:'ok' },
    { nome:'Pagamenti (Stripe)',uptime:'99,71%', latenza:'310 ms', stato:'warn', nota:'errori 3DS sopra la media da 2 giorni' },
    { nome:'Notifiche push',    uptime:'99,92%', latenza:'—',      stato:'ok' },
  ];
  const ERRORI_PAG = [
    { motivo:'Carta scaduta',          n:18 },
    { motivo:'Fondi insufficienti',    n:14 },
    { motivo:'3DS non completato',     n:9 },
    { motivo:'Carta bloccata',         n:6 },
  ];
  const totErr = ERRORI_PAG.reduce((a,e)=>a+e.n,0);
  const maxErr = Math.max(...ERRORI_PAG.map(e=>e.n));
  const CODE = [
    { nome:'Notifiche push',      inCoda:214, fallite:3 },
    { nome:'Email transazionali', inCoda:12,  fallite:0 },
    { nome:'Webhook gestionale',  inCoda:45,  fallite:1 },
    { nome:'Export CSV',          inCoda:2,   fallite:0 },
  ];
  const INCIDENTI = [
    { data:'14 lug 2026', servizio:'Pagamenti (Stripe)', durata:'23 min', desc:'Timeout sugli addebiti ricorrenti — riprocessati automaticamente' },
    { data:'02 lug 2026', servizio:'Notifiche push',     durata:'1h 10m', desc:'Ritardo consegna su Android — coda smaltita' },
    { data:'18 giu 2026', servizio:'API ordini',         durata:'8 min',  desc:'Picco 5xx durante il deploy — rollback immediato' },
  ];
  const dot = (stato) => (
    <span style={{width:9, height:9, borderRadius:'50%', background: stato==='ok' ? ADM.OK : ADM.WARN, display:'inline-block', flexShrink:0}}/>
  );
  const degradati = SERVIZI.filter(x=>x.stato!=='ok').length;
  const H = {fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10};

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20}}>
      {/* Stato complessivo */}
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'13px 16px', borderRadius:10,
        background: degradati ? '#FFF7E6' : ADM.OK_SOFT, border:`1px solid ${degradati ? '#FDE68A' : '#BBF7D0'}`}}>
        {dot(degradati ? 'warn' : 'ok')}
        <span style={{fontSize:14, fontWeight:700, color: degradati ? '#78350F' : '#065F46'}}>
          {degradati ? `${degradati} servizio degradato` : 'Tutti i sistemi operativi'}
        </span>
        <span style={{fontSize:12.5, color:ADM.MUTED}}>· ultimo controllo 2 min fa · uptime rete ultimi 90 giorni</span>
      </div>

      {/* Servizi */}
      <div>
        <div style={H}>Servizi</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:10}}>
          {SERVIZI.map(sv => (
            <div key={sv.nome} style={{border:`1px solid ${sv.stato==='ok' ? ADM.BORDER : '#FDE68A'}`, borderRadius:10, padding:'12px 14px', background: sv.stato==='ok' ? '#fff' : '#FFFBEB'}}>
              <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:8}}>
                {dot(sv.stato)}
                <span style={{fontSize:12.7, fontWeight:700, color:ADM.TEXT, lineHeight:1.2}}>{sv.nome}</span>
              </div>
              <div style={{fontSize:21, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{sv.uptime}</div>
              <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:3}}>latenza media {sv.latenza}</div>
              {sv.nota && <div style={{fontSize:11.5, color:'#B45309', marginTop:6, lineHeight:1.35}}>{sv.nota}</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14}}>
        {/* Errori di pagamento aggregati */}
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, padding:'14px 16px'}}>
          <div style={H}>Errori di pagamento · ultimi 30 giorni</div>
          <div style={{fontSize:24, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', marginBottom:10}}>{totErr} <span style={{fontSize:13, fontWeight:600, color:ADM.MUTED}}>addebiti falliti</span></div>
          {ERRORI_PAG.map(e => (
            <div key={e.motivo} style={{display:'flex', alignItems:'center', gap:10, marginBottom:7}}>
              <span style={{fontSize:12.8, color:ADM.TEXT, width:150, flexShrink:0}}>{e.motivo}</span>
              <div style={{flex:1, height:8, background:ADM.PANEL_SOFT, borderRadius:99, overflow:'hidden'}}>
                <div style={{width:`${(e.n/maxErr)*100}%`, height:'100%', background:ADM.INK, borderRadius:99}}/>
              </div>
              <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, width:24, textAlign:'right'}}>{e.n}</span>
            </div>
          ))}
          <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, paddingTop:9, borderTop:`1px dashed ${ADM.BORDER_SOFT}`}}>
            3 locali hanno ancora un addebito da recuperare — li trovi nella sezione <strong>Locali</strong> con il badge rosso.
          </div>
        </div>

        {/* Code di elaborazione */}
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, padding:'14px 16px'}}>
          <div style={H}>Code di elaborazione</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 90px 80px', padding:'6px 0', fontSize:11.8, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em'}}>
            <div>Coda</div><div style={{textAlign:'right'}}>In coda</div><div style={{textAlign:'right'}}>Fallite</div>
          </div>
          {CODE.map((c,i) => (
            <div key={c.nome} style={{display:'grid', gridTemplateColumns:'1fr 90px 80px', padding:'9px 0', borderTop:`1px solid ${ADM.BORDER_SOFT}`, fontSize:13.3, alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:7, color:ADM.TEXT, fontWeight:600}}>{dot(c.fallite ? 'warn' : 'ok')}{c.nome}</div>
              <div style={{textAlign:'right', color:ADM.TEXT}}>{c.inCoda}</div>
              <div style={{textAlign:'right', fontWeight:700, color: c.fallite ? ADM.WARN : ADM.MUTED_SOFT}}>{c.fallite}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ultimi incidenti */}
      <div>
        <div style={H}>Ultimi incidenti</div>
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
          {INCIDENTI.map((inc, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:14, padding:'11px 16px', borderTop: i ? `1px solid ${ADM.BORDER_SOFT}` : 'none', flexWrap:'wrap'}}>
              <span style={{fontSize:12.7, color:ADM.MUTED, width:88, flexShrink:0}}>{inc.data}</span>
              <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, width:170, flexShrink:0}}>{inc.servizio}</span>
              <span style={{fontSize:12.5, color:ADM.MUTED, flex:1, minWidth:200}}>{inc.desc}</span>
              <span style={{fontSize:12.3, color:ADM.MUTED, fontWeight:600}}>{inc.durata}</span>
              <AdmBadge color="OK" size="xs">Risolto</AdmBadge>
            </div>
          ))}
        </div>
      </div>

      {/* Test di ripristino — sta qui e non fra i registri di Conformita: chi
          apre Diagnostica sta chiedendo se la piattaforma regge, e «l'ultimo
          restore ha funzionato?» e la stessa domanda degli incidenti qui sopra.
          Il componente vive nei file di conformita perche li stanno i suoi dati
          e i suoi stili; l'obbligo A.8.13 resta tracciato dal cruscotto. */}
      {window.CfTestRipristino ? <CfTestRipristino/> : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RIESAME PERIODICO DEGLI ACCESSI — ISO/IEC 27001 A.5.18
   Il controllo non è "esiste una lista di chi ha accesso": è poter dimostrare
   che a una certa data una persona ha guardato, ha deciso riga per riga, e che
   le revoche sono state eseguite. Ambito: il team admin di Byup.
   Le funzioni di classificazione stanno FUORI dal componente: definirle dentro
   farebbe rimontare le righe a ogni battitura nel campo motivo.
   ═══════════════════════════════════════════════════════════════════════════ */
const RA_DORMIENTE_GG = 90;

const raFmtData = (d) => d ? d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const raFmtDataOra = (d) => d ? d.toLocaleString('it-IT', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
const raGiorniFa = (d) => d ? Math.floor((Date.now() - d.getTime()) / 86400000) : null;

// L'ultima campagna CHIUSA in cui questo soggetto compare: è la "data
// dell'ultima verifica" e il termine di paragone per capire cosa è cambiato.
function raUltimoRiesame(soggettoId) {
  for (const c of RIESAMI_CHIUSI) {
    const e = c.esiti.find(x => x.soggettoId === soggettoId);
    if (e) return { campagna: c, esito: e };
  }
  return null;
}

// Ordina per RISCHIO, non per nome: un riesame si guarda dall'anomalia in giù,
// altrimenti si timbra dall'alto senza leggere.
function raClassifica(m) {
  const prec = raUltimoRiesame(m.id);
  // L'uscita batte tutto il resto, e non e un dettaglio di ordinamento: «non
  // lavora piu qui e ha ancora l'account» e il rilievo piu comune di un audit
  // 27001, e finora lo si intercettava solo di rimbalzo, quando l'utenza restava
  // ferma 90 giorni. Dormiente non vuol dire uscito: si puo essere in congedo
  // senza essere usciti, e usciti ieri con l'account usato ancora oggi.
  if (m.uscitaIl) {
    const g = Math.ceil((m.uscitaIl.getTime() - Date.now()) / 86400000);
    return g < 0
      ? { rank:-1, key:'uscito', tono:'DANGER', label:`Uscito il ${raFmtData(m.uscitaIl)}`,
          nota:`Ha lasciato il team ${-g} giorni fa: l'accesso andava revocato allora` }
      : { rank:-1, key:'in-uscita', tono:'WARN', label:`Esce il ${raFmtData(m.uscitaIl)}`,
          nota:`Ultimo giorno fra ${g} ${g === 1 ? 'giorno' : 'giorni'}: l'accesso va revocato quel giorno` };
  }
  const gg = raGiorniFa(m.lastActive);
  const permOra = (RUOLI[m.ruolo] && RUOLI[m.ruolo].permessi || []).length;
  const permPrima = prec ? (RUOLI[prec.esito.ruoloAllora] && RUOLI[prec.esito.ruoloAllora].permessi || []).length : null;
  const lbl = (r) => (RUOLI[r] && RUOLI[r].label) || r;

  if (!m.lastActive) return { rank:0, key:'mai', tono:'DANGER', label:'Mai acceduto',
    nota:`Invitato ${raGiorniFa(m.addedOn)} giorni fa, non ha mai effettuato l'accesso` };
  if (gg >= RA_DORMIENTE_GG) return { rank:1, key:'dormiente', tono:'DANGER', label:'Dormiente',
    nota:`Nessun accesso da ${gg} giorni, ma l'utenza è ancora abilitata` };
  if (prec && permOra > permPrima) return { rank:2, key:'escalation', tono:'WARN', label:'Permessi aumentati',
    nota:`Era ${lbl(prec.esito.ruoloAllora)}, oggi è ${lbl(m.ruolo)}` };
  if (!prec) return { rank:3, key:'nuovo', tono:'WARN', label:'Mai riesaminato',
    nota:`Aggiunto il ${raFmtData(m.addedOn)}, dopo l'ultima campagna` };
  if (prec.esito.ruoloAllora !== m.ruolo) return { rank:4, key:'cambiato', tono:'INFO', label:'Ruolo cambiato',
    nota:`Era ${lbl(prec.esito.ruoloAllora)}, oggi è ${lbl(m.ruolo)}` };
  return { rank:5, key:'invariato', tono:'NEUTRAL', label:'Invariato',
    nota:'Nessuna variazione dall\'ultima campagna' };
}

/* ─── Catena di integrità ────────────────────────────────────────────────────
   Ogni attestazione chiusa porta l'impronta del proprio contenuto concatenata
   a quella del record precedente. Toccare un record vecchio cambia la sua
   impronta e spezza tutte quelle successive: la manomissione si vede.
   Le impronte sono SHA-256 VERE, calcolate dal browser sul contenuto reale —
   nel mock è l'unica parte che deve funzionare sul serio, altrimenti il
   bottone "Verifica integrità" sarebbe teatro.                                */

// Serializzazione canonica: stesso contenuto ⇒ stessa stringa, sempre.
const raCanonico = (c) => [
  c.id, c.periodo, c.chiusaIl.toISOString(), c.revisore,
  ...c.esiti.map(e => `${e.soggettoId}:${e.decisione}:${e.chi}:${e.quando.toISOString()}:${e.motivo || ''}`),
].join('|');

async function raSha256(testo) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testo));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const RA_GENESI = '0'.repeat(64);

// Le campagne arrivano dalla più recente: la catena si costruisce dalla più
// vecchia, com'è stata scritta nel tempo.
async function raCalcolaCatena(campagne) {
  const ordinate = [...campagne].reverse();
  const out = {};
  let prec = RA_GENESI;
  for (const c of ordinate) {
    const h = await raSha256(prec + '|' + raCanonico(c));
    out[c.id] = { impronta: h, improntaPrec: prec };
    prec = h;
  }
  return out;
}

// Le impronte "come scritte alla firma": si calcolano una volta sola sul dato
// integro. La verifica poi ricalcola dal contenuto attuale e confronta.
let RA_SIGILLO = null;
let RA_MANOMISSIONE = null;   // ricordo dell'originale, per poter ripristinare

const raImpronta = (h) => h ? `${h.slice(0, 4)}…${h.slice(-4)}` : '—';

function raScaricaCSV(campagna, righeEsito) {
  const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const head = ['Campagna','Periodo','Soggetto','Email','Ruolo','Ultimo accesso','Decisione','Motivo','Deciso da','Data decisione'];
  const body = righeEsito.map(r => [
    campagna.id, campagna.periodo, r.nome, r.email, r.ruolo,
    r.lastActive ? raFmtDataOra(r.lastActive) : 'mai',
    r.decisione, r.motivo || '', r.chi, raFmtDataOra(r.quando),
  ]);
  const csv = [head, ...body].map(row => row.map(esc).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `riesame-accessi-${campagna.id}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function AccessReview() {
  const [esiti, setEsiti] = useStateTeam({});
  const [chiusa, setChiusa] = useStateTeam(null);        // attestazione prodotta
  const [confermaChiusura, setConfermaChiusura] = useStateTeam(false);
  const [revoca, setRevoca] = useStateTeam(null);        // { id, nome }
  const [motivo, setMotivo] = useStateTeam('');
  const [conferma, setConferma] = useStateTeam(null);    // singola conferma da confermare
  const [confermaBlocco, setConfermaBlocco] = useStateTeam(false);
  const [storico, setStorico] = useStateTeam(null);      // campagna chiusa aperta in dettaglio
  const [sigillo, setSigillo] = useStateTeam(RA_SIGILLO);
  const [verifica, setVerifica] = useStateTeam(null);    // esito del controllo integrità
  const [manomesso, setManomesso] = useStateTeam(!!RA_MANOMISSIONE);

  const camp = RIESAME_CORRENTE;
  // Firma con il nome vero, non con 'Tu': l'attestazione è un documento.
  const IO = (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu';
  const ggScadenza = Math.ceil((camp.scadenza.getTime() - Date.now()) / 86400000);
  const scaduta = ggScadenza < 0;

  const membri = TEAM.filter(m => m.attivo !== false);
  const righe = membri
    .map(m => ({ m, cls: raClassifica(m), prec: raUltimoRiesame(m.id) }))
    .sort((a, b) => a.cls.rank - b.cls.rank || a.m.nome.localeCompare(b.m.nome));

  const decisi = Object.keys(esiti).length;
  const totale = righe.length;
  const tuttiDecisi = decisi === totale;
  const revocati = Object.values(esiti).filter(e => e.decisione === 'revocato').length;
  const daGuardare = righe.filter(r => r.cls.rank <= 4 && !esiti[r.m.id]).length;
  const invariatiAperti = righe.filter(r => r.cls.key === 'invariato' && !esiti[r.m.id] && !r.m.isYou);

  // Il Super Admin titolare non si conferma né si revoca da solo: l'accesso gli
  // viene dal ruolo, e il ruolo cambia fuori da qui. Confermato d'ufficio, con
  // il motivo scritto — nell'attestazione si deve leggere perché.
  React.useEffect(() => {
    const io = membri.find(m => m.isYou);
    if (!io || esiti[io.id]) return;
    setEsiti(prev => ({ ...prev, [io.id]: {
      decisione: 'confermato',
      motivo: 'Super Admin titolare — accesso per definizione del ruolo, cambia solo al cambio di ruolo',
      chi: 'd\'ufficio', quando: new Date(), automatico: true,
    } }));
  }, []);

  // Il sigillo si calcola una volta sola, sul dato integro, e resta il termine
  // di paragone per tutte le verifiche successive.
  React.useEffect(() => {
    if (RA_SIGILLO) { setSigillo(RA_SIGILLO); return; }
    raCalcolaCatena(RIESAMI_CHIUSI).then(c => { RA_SIGILLO = c; setSigillo(c); });
  }, []);

  const verificaIntegrita = async () => {
    setVerifica({ stato: 'corso' });
    const ora = await raCalcolaCatena(RIESAMI_CHIUSI);
    const ordinate = [...RIESAMI_CHIUSI].reverse();
    const rotto = ordinate.find(c => !sigillo || !sigillo[c.id] || sigillo[c.id].impronta !== ora[c.id].impronta);
    setVerifica(rotto
      ? { stato: 'rotta', da: rotto.periodo, id: rotto.id, quando: new Date() }
      : { stato: 'integra', n: ordinate.length, quando: new Date() });
  };

  // ⚠️ SOLO DEMO — DA RIMUOVERE PRIMA DELLA PRODUZIONE (spot/Riesame-Accessi.md).
  // Altera davvero il contenuto di un record chiuso, così la verifica fallisce
  // sul serio invece di fingere. In produzione non deve esistere nessun modo di
  // toccare un record firmato.
  const toggleManomissione = () => {
    if (RA_MANOMISSIONE) {
      RA_MANOMISSIONE.esito.decisione = RA_MANOMISSIONE.originale;
      RA_MANOMISSIONE = null;
      setManomesso(false);
    } else {
      const camp = RIESAMI_CHIUSI.find(c => c.esiti.some(e => e.decisione === 'revocato'));
      const es = camp && camp.esiti.find(e => e.decisione === 'revocato');
      if (!es) return;
      RA_MANOMISSIONE = { esito: es, originale: es.decisione };
      es.decisione = 'confermato';
      setManomesso(true);
    }
    setVerifica(null);
  };

  // Ogni decisione lascia traccia nell'audit log: è lì che l'auditor va a
  // guardare, e deve combaciare con l'attestazione.
  const registra = (m, decisione, motivoTxt, chi) => {
    const quando = new Date();
    setEsiti(prev => ({ ...prev, [m.id]: { decisione, motivo: motivoTxt || '', chi: chi || IO, quando } }));
    AUDIT_EVENTS.unshift({
      who: chi || IO,
      action: decisione === 'revocato' ? 'ha revocato l\'accesso di' : 'ha confermato l\'accesso di',
      target: `${m.nome} · ${(RUOLI[m.ruolo] && RUOLI[m.ruolo].label) || m.ruolo} · riesame ${camp.periodo}`,
      icon: decisione === 'revocato' ? 'lock' : 'check',
      color: decisione === 'revocato' ? 'DANGER' : 'OK',
      tipo: 'accessi', when: quando,
    });
  };

  const confermaInvariati = () => {
    const quando = new Date();
    setEsiti(prev => {
      const next = { ...prev };
      invariatiAperti.forEach(r => { next[r.m.id] = { decisione:'confermato', motivo:'Nessuna variazione dall\'ultima campagna', chi:IO, quando }; });
      return next;
    });
    AUDIT_EVENTS.unshift({
      who:IO, action:'ha confermato in blocco gli accessi invariati',
      target:`${invariatiAperti.length} utenze · riesame ${camp.periodo}`,
      icon:'check', color:'OK', tipo:'accessi', when: quando,
    });
  };

  const chiudiCampagna = () => {
    const quando = new Date();
    const dettaglio = righe.map(r => ({
      nome: r.m.nomeCompleto || r.m.nome, email: r.m.email, ruolo: (RUOLI[r.m.ruolo] && RUOLI[r.m.ruolo].label) || r.m.ruolo,
      lastActive: r.m.lastActive, ...esiti[r.m.id],
    }));
    const att = {
      id: camp.id, periodo: camp.periodo, revisore: IO,
      chiusaIl: quando, totale, confermati: totale - revocati, revocati, dettaglio,
    };
    setChiusa(att);
    setConfermaChiusura(false);
    AUDIT_EVENTS.unshift({
      who:IO, action:'ha chiuso e firmato il riesame accessi',
      target:`${camp.id} · ${totale} utenze · ${revocati} revoche`,
      icon:'shield', color:'INFO', tipo:'accessi', when: quando,
    });
  };

  const H = { fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 };
  const GRID = 'minmax(0,2.6fr) 1.15fr 1fr 1fr 176px';
  const tonoCol = { DANGER: ADM.DANGER, WARN: ADM.WARN, INFO: ADM.INFO, NEUTRAL: ADM.MUTED };
  const tonoBg  = { DANGER: ADM.DANGER_SOFT, WARN: ADM.WARN_SOFT, INFO: ADM.INFO_SOFT || '#E7F0FE', NEUTRAL: ADM.NEUTRAL_SOFT };

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Stato della campagna — la scadenza è la cosa che fa slittare il controllo */}
      <div style={{
        display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10,
        background: chiusa ? ADM.OK_SOFT : scaduta ? ADM.DANGER_SOFT : '#FFF7E6',
        border:`1px solid ${chiusa ? '#BBF7D0' : scaduta ? '#FECACA' : '#FDE68A'}`,
      }}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.5, fontWeight:800, color: chiusa ? '#065F46' : scaduta ? '#7F1D1D' : '#78350F'}}>
            {chiusa
              ? `Riesame ${camp.periodo} chiuso e firmato`
              : `Riesame ${camp.periodo} · ${scaduta ? `scaduto da ${-ggScadenza} giorni` : `scade fra ${ggScadenza} giorni`}`}
          </div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
            {chiusa
              ? `Firmato da ${chiusa.revisore} il ${raFmtDataOra(chiusa.chiusaIl)} · ${chiusa.confermati} confermati, ${chiusa.revocati} revocati`
              : `Aperto il ${raFmtData(camp.apertaIl)} · scadenza ${raFmtData(camp.scadenza)} · cadenza ogni ${RIESAME_CADENZA_MESI} mesi · revisore ${camp.revisore}`}
          </div>
        </div>
        {!chiusa && (
          <div style={{textAlign:'right', flexShrink:0}}>
            <div style={{fontSize:22, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>
              {decisi}<span style={{fontSize:14, fontWeight:600, color:ADM.MUTED}}> / {totale}</span>
            </div>
            <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:3}}>utenze esaminate</div>
          </div>
        )}
        {!chiusa && (
          <div style={{width:150, height:8, borderRadius:99, background:'#fff', overflow:'hidden', flexShrink:0, border:`1px solid ${ADM.BORDER}`}}>
            <div style={{width:`${totale ? (decisi/totale)*100 : 0}%`, height:'100%', background:ADM.INK, borderRadius:99, transition:'width 220ms ease'}}/>
          </div>
        )}
        {chiusa
          ? <AdmButton variant="secondary" size="sm" icon="download" onClick={()=>raScaricaCSV(camp, chiusa.dettaglio)}>Scarica evidenza</AdmButton>
          : <AdmButton variant="primary" size="sm" disabled={!tuttiDecisi} onClick={()=>setConfermaChiusura(true)}>
              {tuttiDecisi ? 'Chiudi e firma' : `Mancano ${totale - decisi}`}
            </AdmButton>}
      </div>

      {/* Elenco degli accessi */}
      {!chiusa && (
        <div>
          <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
            <div style={{...H, marginBottom:0}}>Chi ha accesso a cosa</div>
            <span style={{fontSize:12.4, color:ADM.MUTED}}>
              {daGuardare > 0 ? `${daGuardare} da guardare con attenzione, in cima` : 'nessuna anomalia aperta'}
            </span>
            <div style={{flex:1}}/>
            {invariatiAperti.length > 1 && (
              <AdmButton variant="secondary" size="sm" onClick={()=>setConfermaBlocco(true)}>
                Conferma i {invariatiAperti.length} invariati
              </AdmButton>
            )}
          </div>

          <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{display:'grid', gridTemplateColumns:GRID, padding:'9px 16px', background:ADM.PANEL_SOFT || '#FAFAFB',
              borderBottom:`1px solid ${ADM.BORDER}`, fontSize:11.8, fontWeight:700, color:ADM.MUTED,
              textTransform:'uppercase', letterSpacing:'0.06em'}}>
              <div>Soggetto</div><div>Ruolo e aree</div><div>Ultimo accesso</div><div>Ultima verifica</div><div style={{textAlign:'right'}}>Decisione</div>
            </div>

            {righe.map(({ m, cls, prec }, i) => {
              const dec = esiti[m.id];
              const gg = raGiorniFa(m.lastActive);
              const nAree = (RUOLI[m.ruolo] && RUOLI[m.ruolo].permessi || []).length;
              return (
                <div key={m.id} style={{
                  display:'grid', gridTemplateColumns:GRID, alignItems:'center', gap:8,
                  padding:'12px 16px',
                  borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                  background: dec ? (dec.decisione === 'revocato' ? '#FFF7F7' : '#FBFDFB') : '#fff',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
                    <AdmAvatar name={m.nome} bg={m.avatarBg} size={34}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.nomeCompleto || m.nome}</div>
                      <div style={{fontSize:12, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.email}</div>
                      {/* 2FA e stato erano le due sole colonne che la vecchia tab
                          Team aveva in piu: qui stanno accanto al nome, dove si
                          leggono insieme alla persona invece che a due colonne
                          di distanza. */}
                      <div style={{display:'flex', alignItems:'center', gap:6, marginTop:5, flexWrap:'wrap'}}>
                      {!m.due_fa && (
                        <span style={{display:'inline-flex', alignItems:'center', gap:4, padding:'2px 7px',
                          borderRadius:99, background:ADM.WARN_SOFT}}>
                          <BuIcons.shield size={12} color={ADM.WARN}/>
                          <span style={{fontSize:11.2, fontWeight:700, color:ADM.WARN}}>2FA off</span>
                        </span>
                      )}
                      {m.pending && (
                        <span style={{padding:'2px 7px', borderRadius:99, background:ADM.WARN_SOFT,
                          fontSize:11.2, fontWeight:700, color:ADM.WARN}}>Invitato</span>
                      )}
                      <div style={{display:'inline-flex', alignItems:'center', gap:6,
                        padding:'2px 8px', borderRadius:99, background: tonoBg[cls.tono], maxWidth:'100%'}}>
                        <span style={{width:6, height:6, borderRadius:'50%', background: tonoCol[cls.tono], flexShrink:0}}/>
                        <span style={{fontSize:11.4, fontWeight:700, color: tonoCol[cls.tono], whiteSpace:'nowrap'}}>{cls.label}</span>
                      </div>
                      </div>
                      <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:4, lineHeight:1.35}}>{cls.nota}</div>
                    </div>
                  </div>

                  <div>
                    <AdmBadge color={(RUOLI[m.ruolo] && RUOLI[m.ruolo].color) || 'PLAN_FREE'}>{(RUOLI[m.ruolo] && RUOLI[m.ruolo].label) || m.ruolo}</AdmBadge>
                    <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:5}}>{nAree} {nAree === 1 ? 'area' : 'aree'} su {PERMESSI.length}</div>
                  </div>

                  <div style={{fontSize:12.8, color: cls.key === 'dormiente' || cls.key === 'mai' ? ADM.DANGER : ADM.TEXT, fontWeight: cls.key === 'dormiente' || cls.key === 'mai' ? 700 : 500}}>
                    {m.lastActive ? (gg === 0 ? 'oggi' : gg === 1 ? 'ieri' : `${gg} giorni fa`) : 'mai'}
                  </div>

                  <div style={{fontSize:12.8, color:ADM.TEXT}}>
                    {prec ? raFmtData(prec.campagna.chiusaIl) : <span style={{color:ADM.WARN, fontWeight:700}}>mai</span>}
                    {prec && <div style={{fontSize:11.4, color:ADM.MUTED, marginTop:2}}>{prec.campagna.periodo}</div>}
                  </div>

                  <div style={{display:'flex', justifyContent:'flex-end', gap:6}}>
                    {dec ? (
                      <div style={{textAlign:'right'}}>
                        <div style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12.6, fontWeight:700,
                          color: dec.decisione === 'revocato' ? ADM.DANGER : dec.automatico ? ADM.MUTED : ADM.OK}}>
                          {dec.decisione === 'revocato' ? 'Revocato' : dec.automatico ? 'Confermato d\'ufficio' : 'Confermato'}
                        </div>
                        <div style={{fontSize:11.2, color:ADM.MUTED, marginTop:2, lineHeight:1.35}}>
                          {dec.automatico ? 'Titolare — cambia solo al cambio di ruolo' : `da ${dec.chi}`}
                        </div>
                      </div>
                    ) : (
                      <>
                        <AdmButton variant="secondary" size="sm" onClick={()=>setConferma({ m, cls })}>Conferma</AdmButton>
                        <AdmButton variant="ghost" size="sm" onClick={()=>{ setRevoca(m); setMotivo(''); }}
                          style={{color:ADM.DANGER, borderColor:'rgba(220,38,38,0.28)'}}>Revoca</AdmButton>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.5}}>
            Ogni decisione finisce nell'audit log con autore e orario. Alla chiusura la campagna
            diventa un'attestazione non più modificabile: una correzione è una campagna nuova.
          </div>
        </div>
      )}

      {/* Attestazione prodotta */}
      {chiusa && (
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, padding:'18px 20px'}}>
          <div style={H}>Attestazione</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14, marginBottom:16}}>
            {[
              ['Campagna', chiusa.id],
              ['Periodo', chiusa.periodo],
              ['Revisore', chiusa.revisore],
              ['Chiusa il', raFmtDataOra(chiusa.chiusaIl)],
              ['Utenze esaminate', String(chiusa.totale)],
              ['Confermate', String(chiusa.confermati)],
              ['Revocate', String(chiusa.revocati)],
              ['Controllo', 'ISO/IEC 27001 A.5.18'],
              ['Impronta', raImpronta(sigillo && sigillo[RIESAMI_CHIUSI[0] && RIESAMI_CHIUSI[0].id] && sigillo[RIESAMI_CHIUSI[0].id].impronta)],
              ['Segue', RIESAMI_CHIUSI[0] ? RIESAMI_CHIUSI[0].periodo : 'genesi'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{fontSize:11.6, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700}}>{k}</div>
                <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, marginTop:3}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.55, paddingTop:12, borderTop:`1px dashed ${ADM.BORDER_SOFT}`}}>
            Le revoche sono state applicate alle utenze e le relative sessioni terminate.
            Il dettaglio riga per riga è scaricabile in CSV e replicato nell'audit log.
          </div>
        </div>
      )}

      {/* Integrità della catena */}
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...H, marginBottom:0}}>Integrità delle attestazioni</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>ogni record è agganciato al precedente</span>
          <div style={{flex:1}}/>
          <AdmButton variant="secondary" size="sm" onClick={verificaIntegrita}>Verifica integrità</AdmButton>
        </div>

        {verifica && (
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, marginBottom:10,
            background: verifica.stato === 'rotta' ? ADM.DANGER_SOFT : verifica.stato === 'integra' ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT,
            border:`1px solid ${verifica.stato === 'rotta' ? '#FECACA' : verifica.stato === 'integra' ? '#BBF7D0' : ADM.BORDER}`}}>
            <span style={{width:9, height:9, borderRadius:'50%', flexShrink:0,
              background: verifica.stato === 'rotta' ? ADM.DANGER : verifica.stato === 'integra' ? ADM.OK : ADM.MUTED}}/>
            <span style={{fontSize:13.4, fontWeight:700, color: verifica.stato === 'rotta' ? '#7F1D1D' : verifica.stato === 'integra' ? '#065F46' : ADM.TEXT}}>
              {verifica.stato === 'corso' ? 'Verifica in corso…'
                : verifica.stato === 'integra' ? `Catena integra · ${verifica.n} record verificati`
                : `Catena interrotta a partire da ${verifica.da}`}
            </span>
            {verifica.stato !== 'corso' && (
              <span style={{fontSize:12.4, color:ADM.MUTED}}>
                {verifica.stato === 'rotta'
                  ? `Il contenuto di ${verifica.id} non corrisponde più alla sua impronta: è stato modificato dopo la firma.`
                  : `controllo eseguito ${raFmtDataOra(verifica.quando)}`}
              </span>
            )}
          </div>
        )}

        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.55, marginBottom:10}}>
          L'impronta è lo SHA-256 del contenuto del record concatenato all'impronta di quello
          prima. Modificare una campagna già firmata ne cambia l'impronta e spezza tutte le
          successive — per questo una correzione è una campagna nuova, non una riscrittura.
        </div>

        {/* ⚠️ SOLO DEMO — DA RIMUOVERE PRIMA DELLA PRODUZIONE.
            Serve a mostrare dal vivo che il controllo di integrità funziona
            davvero: altera un record già firmato, così la verifica fallisce
            invece di dare sempre verde. In produzione un comando che modifica
            un record firmato è esattamente ciò che il controllo esiste per
            impedire. Vedi spot/Riesame-Accessi.md.
            Marcato con data-demo-only: `grep -r "data-demo-only" spot/`. */}
        <div data-demo-only="simula-manomissione"
          style={{display:'inline-flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10,
          border:`1px dashed ${manomesso ? ADM.DANGER : ADM.BORDER_STRONG || ADM.BORDER}`,
          background: manomesso ? ADM.DANGER_SOFT : 'transparent'}}>
          <span style={{fontSize:11.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Demo</span>
          <span style={{fontSize:12.6, color:ADM.TEXT}}>
            {manomesso
              ? 'Un record chiuso è stato alterato: premi Verifica integrità'
              : 'Altera un record già firmato per vedere il controllo fallire'}
          </span>
          <AdmButton variant="ghost" size="sm" onClick={toggleManomissione}>
            {manomesso ? 'Ripristina' : 'Simula manomissione'}
          </AdmButton>
        </div>
      </div>

      {/* Storico: è quello che si mostra all'auditor */}
      <div>
        <div style={H}>Campagne precedenti</div>
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
          {RIESAMI_CHIUSI.map((c, i) => {
            const rev = c.esiti.filter(e => e.decisione === 'revocato').length;
            return (
              <div key={c.id} className="adm-row-open" onClick={()=>setStorico(storico === c.id ? null : c.id)}
                style={{display:'grid', gridTemplateColumns:'1.1fr 1fr 1.5fr 1.4fr 30px', alignItems:'center', gap:10,
                  padding:'12px 16px', cursor:'pointer',
                  borderBottom: i < RIESAMI_CHIUSI.length - 1 || storico === c.id ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{c.periodo}</div>
                <div style={{fontSize:12.6, color:ADM.MUTED}}>{c.id}</div>
                <div style={{fontSize:12.8, color:ADM.TEXT}}>Chiusa il {raFmtData(c.chiusaIl)} da {c.revisore}</div>
                <div style={{fontSize:12.6, color:ADM.MUTED}}>
                  {c.esiti.length} esaminate · {rev > 0 ? <span style={{color:ADM.DANGER, fontWeight:700}}>{rev} revocate</span> : 'nessuna revoca'}
                  <span style={{marginLeft:8, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:11.6,
                    color: verifica && verifica.stato === 'rotta' ? ADM.DANGER : ADM.MUTED_SOFT}}>
                    {raImpronta(sigillo && sigillo[c.id] && sigillo[c.id].impronta)}
                  </span>
                </div>
                <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
              </div>
            );
          })}
          {storico && (() => {
            const c = RIESAMI_CHIUSI.find(x => x.id === storico);
            return (
              <div style={{padding:'14px 16px', background:ADM.PANEL_SOFT || '#FAFAFB'}}>
                {c.esiti.map(e => {
                  const sog = TEAM.find(t => t.id === e.soggettoId);
                  const nome = sog ? (sog.nomeCompleto || sog.nome) : (e.nomeStorico || e.soggettoId);
                  return (
                    <div key={e.soggettoId} style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 2fr', gap:10,
                      padding:'7px 0', fontSize:12.6, borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                      <span style={{fontWeight:600, color:ADM.TEXT}}>{nome}</span>
                      <span style={{color:ADM.MUTED}}>{(RUOLI[e.ruoloAllora] && RUOLI[e.ruoloAllora].label) || e.ruoloAllora}</span>
                      <span style={{fontWeight:700, color: e.decisione === 'revocato' ? ADM.DANGER : ADM.OK}}>
                        {e.decisione === 'revocato' ? 'Revocato' : 'Confermato'}
                      </span>
                      <span style={{color:ADM.MUTED}}>{e.motivo || `da ${e.chi}`}</span>
                    </div>
                  );
                })}
                <div style={{marginTop:12}}>
                  <AdmButton variant="secondary" size="sm" icon="download"
                    onClick={()=>raScaricaCSV(c, c.esiti.map(e => {
                      const sog = TEAM.find(t => t.id === e.soggettoId);
                      return { nome: sog ? (sog.nomeCompleto || sog.nome) : (e.nomeStorico || e.soggettoId), email: sog ? sog.email : '—',
                        ruolo: (RUOLI[e.ruoloAllora] && RUOLI[e.ruoloAllora].label) || e.ruoloAllora,
                        lastActive: sog ? sog.lastActive : null, decisione: e.decisione, motivo: e.motivo, chi: e.chi, quando: e.quando };
                    }))}>Scarica evidenza {c.periodo}</AdmButton>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Popup revoca — il motivo è obbligatorio, senza non è evidenza */}
      {revoca && (
        <div onClick={()=>setRevoca(null)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:460, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>Revocare l'accesso a {revoca.nome}?</div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:14}}>
              L'utenza viene disabilitata e le sessioni attive terminate. Il motivo finisce
              nell'attestazione: è quello che l'auditor legge per capire la decisione.
            </div>
            <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} autoFocus
              placeholder="Es. Collaborazione terminata il 30/06/2026 — accesso non più necessario"
              style={{width:'100%', minHeight:78, padding:'10px 12px', borderRadius:10, border:`1px solid ${ADM.BORDER}`,
                fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT, resize:'vertical', boxSizing:'border-box', outline:'none'}}/>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setRevoca(null)}>Annulla</AdmButton>
              <AdmButton variant="danger" size="sm" disabled={motivo.trim().length < 8}
                onClick={()=>{ registra(revoca, 'revocato', motivo.trim(), IO); setRevoca(null); }}>
                Revoca accesso
              </AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* Popup conferma — confermare un accesso è un'attestazione, non un click */}
      {conferma && (
        <div onClick={()=>setConferma(null)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:480, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Confermare l'accesso di {conferma.m.nomeCompleto || conferma.m.nome}?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Stai attestando che questa persona deve continuare ad avere questi permessi.
              La conferma finisce nell'attestazione e nell'audit log con il tuo nome e l'orario.
            </div>
            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16}}>
              {[
                ['Ruolo', (RUOLI[conferma.m.ruolo] && RUOLI[conferma.m.ruolo].label) || conferma.m.ruolo],
                ['Aree accessibili', `${(RUOLI[conferma.m.ruolo] && RUOLI[conferma.m.ruolo].permessi || []).length} su ${PERMESSI.length}`],
                ['Ultimo accesso', conferma.m.lastActive ? `${raGiorniFa(conferma.m.lastActive)} giorni fa` : 'mai'],
                ['Rilievo', conferma.cls.nota],
              ].map(([k, v]) => (
                <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
                  <span style={{color:ADM.MUTED, width:126, flexShrink:0}}>{k}</span>
                  <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(null)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm"
                onClick={()=>{ registra(conferma.m, 'confermato', '', IO); setConferma(null); }}>
                Conferma accesso
              </AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* Popup conferma in blocco */}
      {confermaBlocco && (
        <div onClick={()=>setConfermaBlocco(false)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:500, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Confermare {invariatiAperti.length} accessi invariati?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Sono le utenze senza variazioni dall'ultima campagna e con accesso recente.
              Confermarle in blocco è legittimo proprio perché il confronto è stato calcolato:
              stai attestando che non è cambiato nulla, non stai timbrando alla cieca.
            </div>
            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16,
              fontSize:12.8, color:ADM.TEXT, lineHeight:1.7}}>
              {invariatiAperti.map(r => (r.m.nomeCompleto || r.m.nome)).join(' · ')}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConfermaBlocco(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={()=>{ confermaInvariati(); setConfermaBlocco(false); }}>
                Conferma le {invariatiAperti.length} utenze
              </AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* Popup chiusura — la firma */}
      {confermaChiusura && (
        <div onClick={()=>setConfermaChiusura(false)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:500, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>Chiudere e firmare il riesame {camp.periodo}?</div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Stai attestando di aver esaminato <strong style={{color:ADM.TEXT}}>{totale} utenze</strong> e
              di aver deciso su ciascuna: <strong style={{color:ADM.TEXT}}>{totale - revocati} confermate</strong>,{' '}
              <strong style={{color:ADM.TEXT}}>{revocati} revocate</strong>. Una volta chiusa,
              la campagna non è più modificabile.
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConfermaChiusura(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={chiudiCampagna}>Firma il riesame</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AdmTeamPage = AdmTeamPage;

// Admin Team: gestione utenti dello staff con ruoli e permessi

const { useState: useStateTeam } = React;

function AdmTeamPage({ search }) {
  const [tab, setTab] = useStateTeam('membri');
  const [selectedId, setSelectedId] = useStateTeam(null);
  const [members, setMembers] = useStateTeam(TEAM);
  const [inviteOpen, setInviteOpen] = useStateTeam(false);

  const filtered = members.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.nome.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

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
        <div style={{padding:'0 22px 0 8px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:12}}>
          <AdmTabBar tabs={[
            { id:'membri',      label:'Team',            badge:members.length },
            { id:'audit',       label:'Audit log' },
            { id:'piattaforma', label:'Piattaforma' },
          ]} active={tab} onChange={setTab}/>
          <div style={{flex:1}}/>
          {tab === 'membri' && <AdmButton variant="primary" size="sm" icon="plus" className="adm-btn-invite" onClick={()=>setInviteOpen(true)}>Invita membro</AdmButton>}
        </div>

        {tab === 'membri' && (
          <>
            <div style={{
              display:'grid',
              gridTemplateColumns:'minmax(0,2fr) 1.2fr 1.2fr 1fr 1fr 60px',
              padding:'10px 22px',
              borderBottom:`1px solid ${ADM.BORDER}`,
              fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em',
            }}>
              <div>Membro</div><div>Ruolo</div><div>Ultimo accesso</div><div>2FA</div><div>Stato</div><div></div>
            </div>
            {filtered.map((m, i) => {
              const ruolo = RUOLI[m.ruolo];
              return (
                <div key={m.id} onClick={()=>setSelectedId(selectedId===m.id?null:m.id)} style={{
                  display:'grid', gridTemplateColumns:'minmax(0,2fr) 1.2fr 1.2fr 1fr 1fr 60px',
                  padding:'13px 22px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
                  alignItems:'center', cursor:'pointer',
                  background: i%2===1 ? ADM.ROW_STRIPE : 'transparent',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:11}}>
                    <AdmAvatar name={m.nome} size={39}/>
                    <div>
                      <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{m.nome}</div>
                      <div style={{fontSize:13.3, color:ADM.MUTED}}>{m.email}</div>
                    </div>
                  </div>
                  <div><AdmBadge color={ruolo.color} size="xs">{ruolo.label}</AdmBadge></div>
                  <div style={{fontSize:13.7, color:ADM.TEXT}}>{fmtRelative(m.lastActive)}</div>
                  <div>{m.due_fa
                    ? <span style={{color:ADM.OK, display:'inline-flex', alignItems:'center', gap:5, fontSize:13.3, fontWeight:600}}><BuIcons.shield size={18}/> Attiva</span>
                    : <span style={{color:ADM.WARN, display:'inline-flex', alignItems:'center', gap:5, fontSize:13.3, fontWeight:600}}><BuIcons.shield size={18}/> Disattiva</span>}</div>
                  <div>{m.pending
                    ? <AdmBadge color="WARN" size="xs">Invitato</AdmBadge>
                    : m.attivo
                    ? <AdmBadge color="OK" size="xs">Attivo</AdmBadge>
                    : <AdmBadge color="PLAN_FREE" size="xs">Sospeso</AdmBadge>}</div>
                  <div style={{textAlign:'right', color:ADM.MUTED}}><BuIcons.more size={20}/></div>
                </div>
              );
            })}

            <div style={{padding:'20px 22px 10px', borderTop:`1px solid ${ADM.BORDER}`, marginTop:-1, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Inviti pendenti</span>
              <span style={{fontSize:12.2, fontWeight:700, background:'rgba(120,120,128,0.15)', color:ADM.MUTED, padding:'1px 7px', borderRadius:999}}>2</span>
            </div>
            <InvitiPending/>

            <div style={{padding:'20px 22px 0', borderTop:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Ruoli & permessi</span>
            </div>
            <RuoliMatrix/>
          </>
        )}
        {tab === 'piattaforma' && <PlatformConfig/>}
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
  const ini = nome.trim() ? nome.trim().split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase() : '?';

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
  const DEFAULTS = {
    free:     { label:'Gratuito', prezzo:0,      ordini:550,   extra:0.45 },
    starter:  { label:'Starter',  prezzo:46.99,  ordini:1850,  extra:0.34 },
    plus:     { label:'Plus',     prezzo:134.99, ordini:7500,  extra:0.23 },
    business: { label:'Business', prezzo:250,    ordini:15000, extra:0.12 },
  };
  const [cfg, setCfg] = React.useState(() => JSON.parse(JSON.stringify(DEFAULTS)));
  const [pesoApp, setPesoApp] = React.useState('0.5');
  const [sogliaCitta, setSogliaCitta] = React.useState('125');
  const [sogliaRegione, setSogliaRegione] = React.useState('150');
  const [confirm, setConfirm] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const set = (piano, k) => (e) => { setSaved(false); setCfg(prev => ({ ...prev, [piano]: { ...prev[piano], [k]: e.target.value } })); };
  const inp = {width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
  const lab = {fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};
  const doSave = () => { setConfirm(false); setSaved(true); setTimeout(()=>setSaved(false), 3000); };
  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:14, position:'relative'}}>
      <div style={{padding:'10px 14px', background:ADM.WARN_SOFT, border:`1px solid ${ADM.WARN}33`, borderRadius:10, fontSize:12.5, color:'#7A4A0C', lineHeight:1.5}}>
        Queste sono le <strong>leve commerciali della piattaforma</strong>: le modifiche si applicano dal prossimo ciclo di fatturazione, sono riservate ai Super Admin e vengono registrate nell'audit log.
      </div>

      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Piani e prezzi</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {Object.entries(cfg).map(([id, p]) => (
          <div key={id} style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
            <div style={{fontSize:13.5, fontWeight:800, color:ADM.TEXT, marginBottom:12}}>{p.label}</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <div><label style={lab}>Prezzo €/mese</label><input type="number" step="0.01" value={p.prezzo} onChange={set(id,'prezzo')} style={inp} disabled={id==='free'}/></div>
              <div><label style={lab}>Ordini inclusi</label><input type="number" value={p.ordini} onChange={set(id,'ordini')} style={inp}/></div>
              <div><label style={lab}>€ / ordine extra</label><input type="number" step="0.01" value={p.extra} onChange={set(id,'extra')} style={inp}/></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, marginTop:6}}>Pesi e soglie</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <div style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
          <label style={lab}>Peso ordine da app</label>
          <input type="number" step="0.1" min="0.1" max="1" value={pesoApp} onChange={e=>{setSaved(false); setPesoApp(e.target.value);}} style={inp}/>
          <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:6}}>Cassa e cameriere pesano sempre 1 · l'app pesa meno per incentivarne l'adozione</div>
        </div>
        <div style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
          <label style={lab}>Soglia discovery · città</label>
          <input type="number" value={sogliaCitta} onChange={e=>{setSaved(false); setSogliaCitta(e.target.value);}} style={inp}/>
          <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:6}}>Locali minimi in città per attivare la discovery nell'app</div>
        </div>
        <div style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
          <label style={lab}>Soglia discovery · regione</label>
          <input type="number" value={sogliaRegione} onChange={e=>{setSaved(false); setSogliaRegione(e.target.value);}} style={inp}/>
          <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:6}}>Fallback regionale quando la città non raggiunge la soglia</div>
        </div>
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

window.AdmTeamPage = AdmTeamPage;

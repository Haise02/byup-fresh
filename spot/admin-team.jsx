                  {/* Lo stato della riga non ha più una colonna: si legge dal
                      fondo — verde tenue confermata, rosso tenue revocata,
                      bianco da decidere — e per esteso nel dettaglio, che è
                      dove si decide. Resta il chevron, perché una riga
                      cliccabile deve dire di esserlo. */}
                  <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
// Admin Team: gestione utenti dello staff con ruoli e permessi

const { useState: useStateTeam } = React;

// Tre sezioni diverse condividono questo componente perche condividono le tab:
// tenerle in tre file avrebbe voluto dire tre copie della stessa lista membri.
// `sezione` decide quali tab mostrare, non quali esistono.
const ADM_SEZIONI = {
  sicurezza:    { pred:'accessi',     tabs:['accessi','audit','diagnostica'] },
  // Niente `hr`: Risorse Umane non esiste più come sezione e il registro
  // della formazione è passato sotto Risk Management, dove il componente
  // (CfFormazione) già viveva e dove punta l'adempimento della A.6.3.
  impostazioni: { pred:'piattaforma', tabs:['piattaforma'] },
};

function AdmTeamPage({ search, initialTab, sezione = 'sicurezza', onNavRoute }) {
  const sez = ADM_SEZIONI[sezione] || ADM_SEZIONI.sicurezza;
  const [tab, setTab] = useStateTeam(initialTab || sez.pred);
  // Un link da un'altra sezione — «Apri» su un adempimento del cruscotto — deve
  // poter arrivare sulla tab giusta, non sulla prima.
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  const [ruoliOpen, setRuoliOpen] = useStateTeam(false);
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
            { id:'audit',       label:'Audit log' },
            { id:'piattaforma', label:'Piattaforma' },
            { id:'diagnostica', label:'Diagnostica' },
          ].filter(t => sez.tabs.indexOf(t.id) !== -1)} active={tab} onChange={setTab}/>
          <div style={{flex:1}}/>
          {/* La matrice ruoli è materiale di consultazione: non cambia mai e non
              si agisce su di lei. Come sezione in fondo alla pagina occupava
              mezzo schermo per non essere quasi mai letta; come tab avrebbe
              promesso un posto dove si fa qualcosa. È un bottone. */}
          {tab === 'accessi' && (
            <AdmButton variant="secondary" size="sm" onClick={()=>setRuoliOpen(true)}>Ruoli &amp; permessi</AdmButton>
          )}
          {tab === 'accessi' && <AdmButton variant="primary" size="sm" icon="plus" className="adm-btn-invite" onClick={()=>setInviteOpen(true)}>Invita membro</AdmButton>}
        </div>

        {/* Il riesame rende anche gli inviti in attesa, subito sotto la banda
            della scadenza: sono roba da sbrigare, non una nota a piè di pagina. */}
        {tab === 'accessi' && <AccessReview onNavRoute={onNavRoute}/>}
        {tab === 'piattaforma' && <PlatformConfig/>}
        {tab === 'diagnostica' && <PlatformDiagnostica/>}
        {tab === 'audit' && <AuditLog/>}
      </AdmCard>

      <InviteMemberModal open={inviteOpen} onClose={()=>setInviteOpen(false)} onInvite={handleInvite}/>
      {ruoliOpen && (
        <div onClick={()=>setRuoliOpen(false)} style={{position:'fixed', inset:0, zIndex:60,
          background:'rgba(15,17,21,0.42)', display:'flex', alignItems:'center', justifyContent:'center',
          padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:1040, maxWidth:'95%', maxHeight:'88%',
            background:'#fff', borderRadius:14, boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
            animation:'admModalIn 0.18s ease', display:'flex', flexDirection:'column'}}>
            <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex',
              alignItems:'center', gap:12, flexShrink:0}}>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>Ruoli &amp; permessi</div>
              </div>
              <AdmIconBtn icon="x" onClick={()=>setRuoliOpen(false)} label="Chiudi"/>
            </div>
            <div style={{overflow:'auto', flex:1, minHeight:0}}><RuoliMatrix/></div>
          </div>
        </div>
      )}
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

// Contratto di default: sta in alto perché si veda, non perché occupi spazio.
// L'intestazione da sola dice già tutto quello che serve per decidere se aprirlo
// — quanti sono, se ce n'è uno scaduto, e i nomi.
function InvitiPending() {
  const [aperto, setAperto] = useStateTeam(false);
  const inviti = (typeof INVITI_PENDENTI !== 'undefined' ? INVITI_PENDENTI : []);
  if (!inviti.length) return null;
  const gg = (d) => Math.round((d.getTime() - Date.now()) / 86400000);
  const fermi = inviti.filter(i => gg(i.scade) < 0).length;
  return (
    <div style={{border:`1px solid ${fermi ? '#FDE68A' : ADM.BORDER}`, borderRadius:10, overflow:'hidden',
      background: fermi ? '#FFFDF7' : '#fff'}}>
      <div className="adm-row-open" onClick={()=>setAperto(a => !a)}
        style={{display:'flex', alignItems:'center', gap:9, padding:'10px 16px', cursor:'pointer',
        userSelect:'none', borderBottom: aperto ? `1px solid ${ADM.BORDER_SOFT}` : 'none', flexWrap:'wrap'}}>
        <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
          letterSpacing:'0.06em'}}>Inviti in attesa</span>
        <span style={{fontSize:12.2, fontWeight:700, background:'rgba(120,120,128,0.15)', color:ADM.MUTED,
          padding:'1px 7px', borderRadius:999}}>{inviti.length}</span>
        <span className="adm-row-chev" style={{display:'inline-flex', color:ADM.MUTED_SOFT,
          transform: aperto ? 'rotate(90deg)' : 'none', transition:'transform 0.15s ease'}}>
          <BuIcons.chevronRight size={15}/></span>
        <span style={{fontSize:12.4, color: fermi ? ADM.WARN : ADM.MUTED, fontWeight: fermi ? 700 : 400}}>
          {fermi
            ? `${fermi} ${fermi === 1 ? 'invito scaduto' : 'inviti scaduti'}: permessi già assegnati a chi non è mai entrato`
            : 'non hanno ancora accettato, quindi non sono nel riesame degli accessi'}
        </span>
        {!aperto && (
          <span style={{fontSize:12.4, color:ADM.MUTED_SOFT}}>
            · {inviti.map(i => i.nome).join(', ')}
          </span>
        )}
      </div>
      {aperto && inviti.map((inv, i) => {
        const g = gg(inv.scade);
        return (
          <div key={inv.email} style={{display:'grid', gridTemplateColumns:'minmax(0,1.9fr) 1.1fr 1fr 1.2fr 265px',
            gap:10, padding:'10px 16px', alignItems:'center',
            borderBottom: i === inviti.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
              <div style={{width:28, height:28, borderRadius:'50%', background:'#F0F1F3', display:'grid',
                placeItems:'center', color:ADM.MUTED, flexShrink:0}}><BuIcons.mail size={15}/></div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{inv.nome}</div>
                <div style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>{inv.email}</div>
              </div>
            </div>
            <div><AdmBadge color={RUOLI[inv.ruolo].color} size="xs">{RUOLI[inv.ruolo].label}</AdmBadge></div>
            <div style={{fontSize:12.4, color:ADM.MUTED}}>Inviato {fmtRelative(inv.inviato)}</div>
            <div style={{fontSize:12.4, fontWeight:700, color: g < 0 ? ADM.DANGER : ADM.WARN}}>
              {g < 0 ? `Scaduto da ${-g} ${-g === 1 ? 'giorno' : 'giorni'}` : `Scade fra ${Math.max(1, g)} giorni`}
            </div>
            <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
              <AdmButton variant="ghost" size="sm">Invia di nuovo</AdmButton>
              <AdmButton variant="ghost" size="sm">Revoca</AdmButton>
            </div>
          </div>
        );
      })}
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

  // Tre leve diverse in tre tab. Erano tre titoli uno sotto l'altro in una
  // pagina che si scorreva tutta per arrivare al fondo, e chi entrava per
  // cambiare un raggio della discovery passava comunque davanti ai prezzi.
  //
  // Il salvataggio invece resta FUORI dalle tab e sempre visibile: la
  // configurazione è una sola e si applica tutta insieme: metterlo dentro
  // farebbe credere che ogni tab si salvi per conto suo, e uno che tocca i
  // prezzi e poi passa a Discovery penserebbe di aver già salvato.
  const [vista, setVista] = React.useState('piani');
  const viste = [
    { id:'piani',     label:'Piani e prezzi' },
    { id:'pesi',      label:'Peso ordini' },
    { id:'discovery', label:'Discovery' },
  ];

  return (
    <div style={{padding:'16px 22px 20px', display:'flex', flexDirection:'column', gap:14, position:'relative'}}>
      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {viste.map(v => {
          const attiva = vista === v.id;
          return (
            <button key={v.id} className="adm-pill" onClick={()=>setVista(v.id)} style={{
              padding:'7px 14px', borderRadius:99,
              background: attiva ? ADM.TEXT : '#fff', color: attiva ? '#fff' : ADM.TEXT,
              border:`1px solid ${attiva ? ADM.TEXT : ADM.BORDER}`,
              fontSize:13.2, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
            }}>{v.label}</button>
          );
        })}
      </div>

      {vista === 'piani' && (
      <React.Fragment>
      <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.5}}>
        Prezzo, ordini inclusi e costo dell'ordine fuori pacchetto, per ciascun piano.
      </div>
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
      </React.Fragment>
      )}

      {vista === 'pesi' && (
      <React.Fragment>
      <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.5}}>
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
      </React.Fragment>
      )}

      {vista === 'discovery' && (
      <React.Fragment>
      <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.5}}>
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
      </React.Fragment>
      )}

      {/* Fuori dalle tab: si salva tutto, non la tab aperta. */}
      <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:10,
        paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
        {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Configurazione salvata e registrata in audit</span>}
        <span style={{flex:1, fontSize:12.2, color:ADM.MUTED_SOFT}}>
          Il salvataggio applica tutte e tre le sezioni, non solo quella aperta.
        </span>
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

// ─── Affidabilità · le cinque cose che fanno perdere un locale ──────────────
//
// Vive in Diagnostica, non in Dashboard: chi apre questa pagina sta chiedendo
// se la piattaforma regge, ed è la stessa domanda. In Dashboard resta solo il
// richiamo nella fascia degli avvisi, e solo quando c'è qualcosa che non va.
//
// Non si perde un locale per un voto basso: lo si perde il sabato sera in cui
// il conto non si chiude, o il giorno in cui i corrispettivi non arrivano
// all'Agenzia. Tutti i numeri sono sulla finestra in cui il danno succede, non
// sulla media dell'anno.
function DashAffidabilita({ a }) {
  const box = (tono, titolo, valore, sotto, allarme) => (
    <AdmCard padding={0} style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
      <div style={{padding:'15px 16px 14px', display:'flex', flexDirection:'column', gap:7, flex:1}}>
        <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.04em'}}>{titolo}</span>
        <div style={{display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap'}}>
          <span style={{fontSize:26.6, fontWeight:800, color: tono ? ADM[tono] : ADM.TEXT,
            letterSpacing:'-0.02em', lineHeight:1}}>{valore}</span>
        </div>
        <span style={{fontSize:12.5, color:ADM.MUTED, lineHeight:1.45}}>{sotto}</span>
        {allarme && (
          <span style={{fontSize:12.3, fontWeight:700, color:ADM.WARN, display:'inline-flex',
            alignItems:'center', gap:6, marginTop:'auto', paddingTop:4}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:ADM.WARN, flexShrink:0}}/>
            {allarme}
          </span>
        )}
      </div>
    </AdmCard>
  );
  const c = a.corrispettivi, p = a.pagamenti, u = a.uptime;
  return (
    <React.Fragment>
      {/* Tre card, non quattro: i rimborsi sono passati in Dashboard →
          Servizio Clienti, che è dove si guarda cosa è andato storto col
          cliente. Qui restano i soldi che non entrano e i sistemi che li
          fanno non entrare. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14}}>
        {box(c.pct >= 2 ? 'DANGER' : 'WARN', 'Corrispettivi rifiutati dall\'AdE',
          `${c.pct}%`,
          `${fmtNum(c.rifiutati30g)} su ${fmtNum(c.trasmessi30g)} trasmessi in 30 giorni · ${c.localiCoinvolti} locali coinvolti`,
          `Il più vecchio non risolto da ${c.piuVecchioOre}h · ${c.causaPrima}`)}
        {box(p.pct >= 2 ? 'DANGER' : 'WARN', 'Pagamenti falliti',
          `${p.pct}%`,
          `${fmtNum(p.falliti30g)} transazioni su ${fmtNum(p.transazioni30g)} · ${fmtEur(p.importoFallito)} non incassati`,
          `Il retry ne recupera il ${p.pctRecuperati}% da solo · ${fmtNum(p.falliti30g - p.recuperati30g)} restano persi`)}
        {/* L'uptime a 24 ore è una media che le notti tranquille tengono alta:
            quello che conta è il servizio, pranzo e cena. */}
        {box(u.picco < 99.9 ? 'WARN' : 'OK', 'Uptime nelle fasce di picco',
          `${u.picco}%`,
          `${u.minutiGiuPicco30g} minuti giù nel servizio, su ${u.minutiGiuTotali30g} totali del mese`,
          `Sulle 24 ore sarebbe ${u.globale}% · peggior finestra ${u.peggiorGiorno}`)}
      </div>

      {/* La coda di retry è lo stato ADESSO, non una media: se invecchia, è un
          incidente che sta maturando mentre lo guardiamo. */}
      <AdmCard padding={0} style={{overflow:'hidden'}}>
        <div style={{padding:'13px 18px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
          <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.04em'}}>Coda di retry, adesso</span>
          <span style={{fontSize:20, fontWeight:800, color: a.retry.piuVecchioMin > 30 ? ADM.WARN : ADM.TEXT,
            letterSpacing:'-0.02em'}}>{a.retry.inCoda}</span>
          <span style={{fontSize:12.8, color:ADM.MUTED}}>
            elementi · il più vecchio da <b style={{color: a.retry.piuVecchioMin > 30 ? ADM.WARN : ADM.TEXT}}>{a.retry.piuVecchioMin} min</b>
          </span>
          <span style={{flex:1}}/>
          {a.retry.composizione.map(x => (
            <span key={x.tipo} style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:12.5, color:ADM.MUTED}}>
              <b style={{color:ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>{x.n}</b> {x.tipo}
            </span>
          ))}
        </div>
      </AdmCard>
    </React.Fragment>
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
  // I motivi dei pagamenti falliti dei CLIENTI nei locali: stessa popolazione
  // della card «Pagamenti falliti» qui sopra, quindi il totale è quello — non
  // un altro numero che sembra la stessa cosa e non torna. Le quote sono
  // quelle tipiche di un circuito carte italiano.
  const totFalliti = (typeof AFFIDABILITA !== 'undefined' ? AFFIDABILITA.pagamenti.falliti30g : 47);
  const ERRORI_PAG = [
    { motivo:'Carta scaduta',          quota:0.38 },
    { motivo:'Fondi insufficienti',    quota:0.30 },
    { motivo:'3DS non completato',     quota:0.19 },
    { motivo:'Carta bloccata',         quota:0.13 },
  ].map(x => ({ ...x, n: Math.round(totFalliti * x.quota) }));
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

      {/* Soldi e adempimenti prima dei servizi: un uptime del 99,9% con i
          corrispettivi che rimbalzano non è una piattaforma che regge. */}
      <div>
        <div style={H}>Affidabilità · ultimi 30 giorni</div>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <DashAffidabilita a={AFFIDABILITA}/>
        </div>
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
          <div style={H}>Perché falliscono i pagamenti · ultimi 30 giorni</div>
          <div style={{fontSize:24, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', marginBottom:10}}>{fmtNum(totErr)} <span style={{fontSize:13, fontWeight:600, color:ADM.MUTED}}>pagamenti falliti nei locali</span></div>
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
            Il canone di byup è un'altra cosa e si conta a parte: {LOCALI.filter(l=>l.pagamentoFallito).length} locali
            hanno un addebito <strong>nostro</strong> da recuperare — li trovi in <strong>Locali</strong> col badge rosso.
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
const RA_PREAVVISO_GG = 14;   // da quanti giorni prima la scadenza chiama all'azione
const RA_GRID_STORICO = 'minmax(0,1.3fr) 0.95fr 0.9fr 130px 1fr minmax(0,2.1fr)';

// Un esempio per ogni tipo di anomalia: davanti a una casella vuota si scrive
// «ok», davanti a un esempio si scrive una frase che vale come evidenza.
const RA_ESEMPI_MOTIVO = {
  mai:        'Es. Ha accettato l\'invito ieri, primo accesso previsto lunedì con l\'onboarding',
  dormiente:  'Es. In congedo parentale fino a ottobre, accesso mantenuto d\'accordo con Operations',
  escalation: 'Es. Passata a Support a giugno, i permessi in più sono quelli del nuovo ruolo',
  nuovo:      'Es. Entrata dopo la campagna di aprile, ruolo e permessi verificati all\'ingresso',
  cambiato:   'Es. Cambio di ruolo approvato a maggio, i permessi corrispondono al nuovo incarico',
};

// La cadenza del riesame è UNA e vive nell'adempimento `acc` del Cruscotto di
// Risk Management, insieme agli altri obblighi ricorrenti: è lì che si cambia,
// con lo stesso comando con cui si cambiano gli altri ventidue. Qui si legge e
// basta. Averla anche in admin-data.jsx voleva dire due numeri da tenere
// allineati a mano, e infatti si erano già disallineati: la costante non la
// leggeva nessuno e la scadenza era una data scritta a mano che non si muoveva.
function raAdempimento() {
  return (typeof ADEMPIMENTI !== 'undefined' ? ADEMPIMENTI : []).find(a => a.id === 'acc') || null;
}
const raCadenzaMesi = () => { const a = raAdempimento(); return (a && a.cadenzaMesi) || 3; };

// Scadenza della campagna in corso: ultima esecuzione + cadenza. Cambiare la
// cadenza nel Cruscotto sposta davvero questa data, invece di lasciarla ferma.
function raScadenza() {
  const a = raAdempimento();
  if (a && a.ultima && typeof cfMesi === 'function') return cfMesi(a.ultima, raCadenzaMesi());
  const d = new Date(RIESAME_CORRENTE.apertaIl);
  d.setMonth(d.getMonth() + raCadenzaMesi());
  return d;
}

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
  const gg = raGiorniFa(m.lastActive);
  const permOra = (RUOLI[m.ruolo] && RUOLI[m.ruolo].permessi || []).length;
  const permPrima = prec ? (RUOLI[prec.esito.ruoloAllora] && RUOLI[prec.esito.ruoloAllora].permessi || []).length : null;
  const lbl = (r) => (RUOLI[r] && RUOLI[r].label) || r;

  if (!m.lastActive) return { rank:0, key:'mai', tono:'DANGER', label:'Mai acceduto',
    nota:`Nel team dal ${raFmtData(m.addedOn)}, non ha mai effettuato l'accesso` };
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

/* C'era qui una catena di impronte SHA-256 fra le attestazioni chiuse, con una
   sezione «Integrità delle attestazioni» e un bottone «Verifica integrità».
   Tolta: il sigillo si calcolava nel browser al caricamento, sugli stessi dati
   che avrebbe dovuto proteggere, e viveva in memoria — bastava ricaricare la
   pagina dopo una modifica perché la verifica tornasse verde. Una catena di
   hash vale qualcosa solo se il capo è ancorato dove chi tocca il database non
   arriva (storage WORM, marca temporale, log esterno): senza quello è un
   checksum calcolato contro se stessi. Quello che protegge davvero il record è
   l'archiviazione in sola aggiunta, che è lavoro di backend e non di questa
   pagina — e quello che l'auditor chiede è l'attestazione firmata più l'audit
   log che la conferma, entrambi già qui.                                      */

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

function AccessReview({ onNavRoute }) {
  const [esiti, setEsiti] = useStateTeam({});
  const [chiusa, setChiusa] = useStateTeam(null);        // attestazione prodotta
  const [confermaChiusura, setConfermaChiusura] = useStateTeam(false);
  const [revoca, setRevoca] = useStateTeam(null);        // { id, nome }
  const [motivo, setMotivo] = useStateTeam('');
  const [motivoConferma, setMotivoConferma] = useStateTeam('');
  const [dettaglio, setDettaglio] = useStateTeam(null);  // riga aperta: { m, cls, prec }
  const [confermaBlocco, setConfermaBlocco] = useStateTeam(false);
  const [storico, setStorico] = useStateTeam(null);      // campagna chiusa aperta in dettaglio
  // Revoca multipla. `selezione` è null quando la modalità è spenta e un array
  // di id quando è accesa: null e [] sono due stati diversi — «non sto
  // selezionando» e «sto selezionando, non ho ancora scelto nessuno».
  const [selezione, setSelezione] = useStateTeam(null);
  const [revocaMulti, setRevocaMulti] = useStateTeam(false);

  const camp = RIESAME_CORRENTE;
  // Firma con il nome vero, non con 'Tu': l'attestazione è un documento.
  const IO = (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu';
  const scadenza = raScadenza();
  const ggScadenza = Math.ceil((scadenza.getTime() - Date.now()) / 86400000);
  const scaduta = ggScadenza < 0;
  const cadenza = raCadenzaMesi();
  const inScadenza = ggScadenza <= RA_PREAVVISO_GG;   // da qui in poi la banda chiama all'azione

  // Chi non ha ancora accettato l'invito non ha accesso: sta negli inviti in
  // attesa, non in un riesame che guarda chi l'accesso ce l'ha già.
  const membri = TEAM.filter(m => m.attivo !== false && !m.pending);
  const righe = membri
    .map(m => ({ m, cls: raClassifica(m), prec: raUltimoRiesame(m.id) }))
    .sort((a, b) => a.cls.rank - b.cls.rank || a.m.nome.localeCompare(b.m.nome));

  const decisi = Object.keys(esiti).length;
  const totale = righe.length;
  const tuttiDecisi = decisi === totale;
  const revocati = Object.values(esiti).filter(e => e.decisione === 'revocato').length;
  const daGuardare = righe.filter(r => r.cls.rank <= 4 && !esiti[r.m.id]).length;
  const invariatiAperti = righe.filter(r => r.cls.key === 'invariato' && !esiti[r.m.id] && !r.m.isYou);

  // Nessuna utenza si conferma da sola all'apertura della pagina. Una conferma
  // decisa dal codice al primo render porta un orario che dice quando hai
  // aperto la pagina, non quando hai guardato: nell'attestazione è indistin-
  // guibile dal non aver guardato affatto, ed è il rilievo che svuota questo
  // controllo. Le invariate si confermano in blocco, che è un atto del revisore
  // con un'ora e un nome — vedi confermaInvariati.
  //
  // L'unica eccezione resta il Super Admin titolare, e non è una scorciatoia: è
  // che l'accesso gli viene dal ruolo e il ruolo cambia fuori da qui, quindi non
  // c'è niente da decidere. Il buco di segregazione dei compiti che ne deriva si
  // dichiara nella valutazione del rischio, non si tappa con un clic.
  React.useEffect(() => {
    const io = membri.find(m => m.isYou);
    if (!io || esiti[io.id]) return;
    setEsiti(prev => ({ ...prev, [io.id]: {
      decisione:'confermato', automatico:true, chi:'d\'ufficio', quando:new Date(),
      nota:'titolare — cambia solo al cambio di ruolo',
      motivo:'Super Admin titolare — accesso per definizione del ruolo, cambia solo al cambio di ruolo',
    } }));
  }, []);

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

  // Confermare in blocco le invariate è legittimo proprio perché il confronto
  // con la campagna precedente l'ha fatto il codice: si attesta che non è
  // cambiato nulla, non si timbra alla cieca. La modale elenca i nomi prima di
  // chiedere il consenso, e ogni riga esce con il suo motivo, il revisore e
  // l'ora — quindi nello storico si può puntare il dito su una qualsiasi e dire
  // chi l'ha guardata e quando.
  const confermaInvariati = () => {
    const quando = new Date();
    setEsiti(prev => {
      const next = { ...prev };
      invariatiAperti.forEach(r => { next[r.m.id] = { decisione:'confermato', chi:IO, quando,
        motivo:'Nessuna variazione rispetto alla campagna precedente, verificata sul confronto di ruolo e permessi' }; });
      return next;
    });
    AUDIT_EVENTS.unshift({
      who:IO, action:'ha confermato in blocco gli accessi invariati',
      target:`${invariatiAperti.length} utenze · riesame ${camp.periodo}`,
      icon:'check', color:'OK', tipo:'accessi', when: quando,
    });
  };

  // Revoca multipla: un motivo solo per più persone regge quando il motivo È
  // davvero uno — «chiusura del progetto X, tre collaboratori esterni». Se le
  // ragioni sono diverse vanno revocate una per una, e la modale lo dice.
  const aperte = righe.filter(r => !esiti[r.m.id] && !r.m.isYou);
  const selNomi = (selezione || []).map(id => {
    const r = righe.find(x => x.m.id === id);
    return r ? (r.m.nomeCompleto || r.m.nome) : id;
  });
  const toggleSel = (m) => {
    if (esiti[m.id] || m.isYou) return;   // già decisa, o il titolare: non selezionabile
    setSelezione(s => (s || []).includes(m.id) ? s.filter(x => x !== m.id) : [...(s || []), m.id]);
  };
  const revocaSelezionate = () => {
    const quando = new Date();
    const testo = motivo.trim();
    setEsiti(prev => {
      const next = { ...prev };
      (selezione || []).forEach(id => { next[id] = { decisione:'revocato', motivo:testo, chi:IO, quando }; });
      return next;
    });
    AUDIT_EVENTS.unshift({
      who:IO, action:'ha revocato in blocco gli accessi di',
      target:`${selNomi.join(', ')} · riesame ${camp.periodo}`,
      icon:'lock', color:'DANGER', tipo:'accessi', when: quando,
    });
    setRevocaMulti(false); setSelezione(null); setMotivo('');
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
  const GRID = 'minmax(0,2.6fr) 1.15fr 1fr 1fr 26px';
  const tonoCol = { DANGER: ADM.DANGER, WARN: ADM.WARN, INFO: ADM.INFO, NEUTRAL: ADM.MUTED };
  const tonoBg  = { DANGER: ADM.DANGER_SOFT, WARN: ADM.WARN_SOFT, INFO: ADM.INFO_SOFT || '#E7F0FE', NEUTRAL: ADM.NEUTRAL_SOFT };

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Una banda sola, che cambia mestiere. Finché ci sono utenze da decidere
          dice che il riesame è dovuto e porta i due comandi che sbrigano il
          grosso; quando sono tutte decise diventa la firma. «Chiudi e firma»
          non ha più un posto fisso nell'intestazione, dove stava grigio e
          inerte per tutto il tempo in cui non si poteva premere: compare qui,
          acceso, nel momento esatto in cui serve. */}
      {!chiusa && (inScadenza || tuttiDecisi) && (
        <div style={{display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10,
          background: tuttiDecisi ? ADM.OK_SOFT : scaduta ? ADM.DANGER_SOFT : '#FFF7E6',
          border:`1px solid ${tuttiDecisi ? '#BBF7D0' : scaduta ? '#FECACA' : '#FDE68A'}`, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:260}}>
            <div style={{fontSize:14.5, fontWeight:800,
              color: tuttiDecisi ? '#065F46' : scaduta ? '#7F1D1D' : '#78350F'}}>
              {tuttiDecisi
                ? `Il riesame ${camp.periodo} è pronto da firmare`
                : scaduta
                  ? `Il riesame ${camp.periodo} è scaduto da ${-ggScadenza} ${-ggScadenza === 1 ? 'giorno' : 'giorni'}`
                  : ggScadenza === 0
                    ? `Il riesame ${camp.periodo} scade oggi`
                    : `Il riesame ${camp.periodo} scade fra ${ggScadenza} ${ggScadenza === 1 ? 'giorno' : 'giorni'}`}
            </div>
            <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
              {tuttiDecisi
                ? `${totale} utenze esaminate · ${totale - revocati} confermate, ${revocati} ${revocati === 1 ? 'revocata' : 'revocate'}`
                : `${totale - decisi} ${totale - decisi === 1 ? 'utenza' : 'utenze'} da confermare o revocare${daGuardare > 0 ? `, di cui ${daGuardare} con un'anomalia` : ''}`}
              {' · A.5.18, ogni '}{cadenza} mesi
              {typeof onNavRoute === 'function' && (
                <React.Fragment>{' · '}
                  <span onClick={()=>onNavRoute('conformita', 'cruscotto')}
                    style={{color:ADM.PINK, fontWeight:700, cursor:'pointer'}}>cambia cadenza</span>
                </React.Fragment>
              )}
            </div>
          </div>
          {/* Quando la banda c'è, l'intestazione qui sotto non ripete questi
              comandi: lo stesso bottone due volte nella stessa schermata è un
              bottone di troppo. */}
          {!tuttiDecisi && invariatiAperti.length > 1 && (
            <AdmButton variant="secondary" size="sm" onClick={()=>setConfermaBlocco(true)}>
              Conferma le {invariatiAperti.length} invariate
            </AdmButton>
          )}
          {!tuttiDecisi && aperte.length > 1 && (
            <AdmButton variant="secondary" size="sm" onClick={()=>{ setSelezione([]); setMotivo(''); }}>
              Revoca più utenze
            </AdmButton>
          )}
          {tuttiDecisi && (
            <AdmButton variant="primary" size="sm" onClick={()=>setConfermaChiusura(true)}>
              Chiudi e firma
            </AdmButton>
          )}
        </div>
      )}

      <InvitiPending/>

      {chiusa && (
        <div style={{display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10,
          background:ADM.OK_SOFT, border:'1px solid #BBF7D0'}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:14.5, fontWeight:800, color:'#065F46'}}>
              Riesame {camp.periodo} chiuso e firmato
            </div>
            <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
              Firmato da {chiusa.revisore} il {raFmtDataOra(chiusa.chiusaIl)} · {chiusa.confermati} confermati, {chiusa.revocati} revocati
            </div>
          </div>
          <AdmButton variant="secondary" size="sm" icon="download" onClick={()=>raScaricaCSV(camp, chiusa.dettaglio)}>Scarica evidenza</AdmButton>
        </div>
      )}

      {/* Elenco degli accessi */}
      {!chiusa && (
        <div>
          {/* In modalità selezione l'intestazione cede il posto alla barra: due
              serie di comandi contemporaneamente sulla stessa tabella si
              pestano i piedi, e non è chiaro su cosa agiscono. */}
          {selezione ? (
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap',
            padding:'10px 14px', borderRadius:10, background:ADM.DANGER_SOFT, border:'1px solid #FECACA'}}>
            <span style={{fontSize:13.4, fontWeight:800, color:'#7F1D1D'}}>
              {selezione.length === 0
                ? 'Scegli le utenze da revocare'
                : `${selezione.length} ${selezione.length === 1 ? 'utenza selezionata' : 'utenze selezionate'}`}
            </span>
            <span style={{fontSize:12.4, color:ADM.MUTED, flex:1, minWidth:180}}>
              {selezione.length ? selNomi.join(' · ') : 'clicca le righe · le già decise non sono selezionabili'}
            </span>
            <AdmButton variant="secondary" size="sm" onClick={()=>{ setSelezione(null); setMotivo(''); }}>Annulla</AdmButton>
            <AdmButton variant="danger" size="sm" disabled={!selezione.length}
              onClick={()=>{ setMotivo(''); setRevocaMulti(true); }}>
              Revoca {selezione.length || ''}
            </AdmButton>
          </div>
          ) : (
          <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10, flexWrap:'wrap'}}>
            <div style={{...H, marginBottom:0}}>Chi ha accesso a cosa</div>
            {/* Quando il banner è a video ha già detto scadenza e cadenza: qui
                resta solo quello che il banner non dice, altrimenti la stessa
                riga si legge due volte a dieci centimetri di distanza. */}
            <span style={{fontSize:12.4, color:ADM.MUTED, flex:1, minWidth:170}}>
              {daGuardare > 0 ? `${daGuardare} da guardare con attenzione` : 'nessuna anomalia aperta'}
              {tuttiDecisi ? ` · tutte e ${totale} esaminate` : ` · ${totale - decisi} da esaminare`}
              {!inScadenza && (
                <React.Fragment>
                  {' · '}<span>entro il {raFmtData(scadenza)}</span>
                  {' · ogni '}{cadenza} mesi
                  {typeof onNavRoute === 'function' && (
                    <React.Fragment>{' · '}
                      <span onClick={()=>onNavRoute('conformita', 'cruscotto')}
                        style={{color:ADM.PINK, fontWeight:700, cursor:'pointer'}}>cambia cadenza</span>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </span>
            {/* I comandi restano insieme: o stanno in riga col titolo, o vanno a
                capo tutti e tre, mai uno solo spaiato sotto agli altri. */}
            <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
              {!inScadenza && invariatiAperti.length > 1 && (
                <AdmButton variant="secondary" size="sm" onClick={()=>setConfermaBlocco(true)}>
                  Conferma le {invariatiAperti.length} invariate
                </AdmButton>
              )}
              {/* Compare solo se c'è più di una riga su cui potrebbe servire:
                  per revocare una persona sola basta aprirla. */}
              {!inScadenza && aperte.length > 1 && (
                <AdmButton variant="quiet" size="sm" onClick={()=>{ setSelezione([]); setMotivo(''); }}>
                  Revoca più utenze
                </AdmButton>
              )}
            </div>
          </div>
          )}

          <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{display:'grid', gridTemplateColumns:GRID, padding:'9px 16px', background:ADM.PANEL_SOFT || '#FAFAFB',
              borderBottom:`1px solid ${ADM.BORDER}`, fontSize:11.8, fontWeight:700, color:ADM.MUTED,
              textTransform:'uppercase', letterSpacing:'0.06em'}}>
              <div>Soggetto</div><div>Ruolo</div><div>Ultimo accesso</div><div>Ultima verifica</div><div/>
            </div>

            {righe.map(({ m, cls, prec }, i) => {
              const dec = esiti[m.id];
              const gg = raGiorniFa(m.lastActive);
              const selezionabile = !!selezione && !dec && !m.isYou;
              const selezionata = !!selezione && selezione.includes(m.id);
              return (
                <div key={m.id} className={selezione && !selezionabile ? undefined : 'adm-row-open'}
                  onClick={()=>{ if (selezione) { toggleSel(m); return; } setMotivoConferma(''); setDettaglio({ m, cls, prec }); }}
                  style={{
                  display:'grid', gridTemplateColumns:GRID, alignItems:'center', gap:8,
                  padding:'12px 16px', cursor: selezione && !selezionabile ? 'default' : 'pointer',
                  opacity: selezione && !selezionabile ? 0.5 : 1,
                  borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                  background: selezionata ? ADM.DANGER_SOFT
                    : dec ? (dec.decisione === 'revocato' ? '#FFF7F7' : '#FBFDFB') : '#fff',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
                    {selezione && (
                      <span style={{width:18, height:18, borderRadius:5, flexShrink:0, display:'inline-flex',
                        alignItems:'center', justifyContent:'center',
                        border:`1.5px solid ${selezionata ? ADM.DANGER : ADM.BORDER}`,
                        background: selezionata ? ADM.DANGER : '#fff'}}>
                        {selezionata && <BuIcons.check size={12} color="#fff"/>}
                      </span>
                    )}
                    <AdmAvatar name={m.nome} bg={m.avatarBg} size={34}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.nomeCompleto || m.nome}</div>
                      <div style={{fontSize:12, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.email}</div>
                      {/* La pastiglia dello stato e la riga di dettaglio sotto
                          — «nessun accesso da 142 giorni», «aggiunto il …» —
                          stavano qui e facevano tre righe per persona. Il
                          rilievo per esteso vive nel dettaglio, che è dove si
                          decide. Qui resta il 2FA, che è un fatto sulla
                          persona e non un giudizio del riesame. */}
                      {!m.due_fa && (
                        <span style={{display:'inline-flex', alignItems:'center', gap:4, padding:'2px 7px',
                          borderRadius:99, background:ADM.WARN_SOFT, marginTop:5}}>
                          <BuIcons.shield size={12} color={ADM.WARN}/>
                          <span style={{fontSize:11.2, fontWeight:700, color:ADM.WARN}}>2FA off</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <AdmBadge color={(RUOLI[m.ruolo] && RUOLI[m.ruolo].color) || 'PLAN_FREE'}>{(RUOLI[m.ruolo] && RUOLI[m.ruolo].label) || m.ruolo}</AdmBadge>
                  </div>

                  <div style={{fontSize:12.8, color: cls.key === 'dormiente' || cls.key === 'mai' ? ADM.DANGER : ADM.TEXT, fontWeight: cls.key === 'dormiente' || cls.key === 'mai' ? 700 : 500}}>
                    {m.lastActive ? (gg === 0 ? 'oggi' : gg === 1 ? 'ieri' : `${gg} giorni fa`) : 'mai'}
                  </div>

                  <div style={{fontSize:12.8, color:ADM.TEXT}}>
                    {prec ? raFmtData(prec.campagna.chiusaIl) : <span style={{color:ADM.WARN, fontWeight:700}}>mai</span>}
                  </div>

                  {/* Lo stato della riga non ha più una colonna: si legge dal
                      fondo — verde tenue confermata, rosso tenue revocata,
                      bianco da decidere — e per esteso nel dettaglio, che è
                      dove si decide. Resta il chevron, perché una riga
                      cliccabile deve dire di esserlo. */}
                  <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
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
              ['Segue', RIESAMI_CHIUSI[0] ? RIESAMI_CHIUSI[0].periodo : 'prima campagna'],
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

      {/* Storico: è quello che si mostra all'auditor */}
      <div>
        <div style={H}>Esami accessi precedenti</div>
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
                </div>
                <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
              </div>
            );
          })}
          {storico && (() => {
            const c = RIESAMI_CHIUSI.find(x => x.id === storico);
            return (
              <div style={{padding:'14px 16px', background:ADM.PANEL_SOFT || '#FAFAFB'}}>
                {/* È la schermata che si gira all'auditor. Su ogni riga devono
                    esserci tutte e quattro le cose insieme — chi, che decisione,
                    quando, e perché — non «o il motivo o il responsabile» come
                    prima: senza il quando non si dimostra che qualcuno ha
                    guardato in quella data, e senza il chi non c'è un
                    responsabile a cui l'attestazione risale. */}
                <div style={{display:'grid', gridTemplateColumns:RA_GRID_STORICO, gap:10, padding:'0 0 7px',
                  fontSize:11, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase',
                  letterSpacing:'0.06em', borderBottom:`1px solid ${ADM.BORDER}`}}>
                  <span>Soggetto</span><span>Ruolo allora</span><span>Decisione</span>
                  <span>Decisa il</span><span>Da</span><span>Motivo</span>
                </div>
                {c.esiti.map(e => {
                  const sog = TEAM.find(t => t.id === e.soggettoId);
                  const nome = sog ? (sog.nomeCompleto || sog.nome) : (e.nomeStorico || e.soggettoId);
                  return (
                    <div key={e.soggettoId} style={{display:'grid', gridTemplateColumns:RA_GRID_STORICO, gap:10,
                      padding:'8px 0', fontSize:12.4, alignItems:'baseline', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                      <span style={{fontWeight:600, color:ADM.TEXT}}>{nome}</span>
                      <span style={{color:ADM.MUTED}}>{(RUOLI[e.ruoloAllora] && RUOLI[e.ruoloAllora].label) || e.ruoloAllora}</span>
                      <span style={{fontWeight:700, color: e.decisione === 'revocato' ? ADM.DANGER : ADM.OK}}>
                        {e.decisione === 'revocato' ? 'Revocato' : 'Confermato'}
                      </span>
                      <span style={{color:ADM.MUTED, whiteSpace:'nowrap'}}>{raFmtDataOra(e.quando)}</span>
                      <span style={{color:ADM.MUTED}}>{e.chi}</span>
                      <span style={{color: e.motivo ? ADM.TEXT : ADM.MUTED_SOFT, lineHeight:1.4}}>
                        {e.motivo || '—'}
                      </span>
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

      {/* Dettaglio della riga — è qui che si decide. Confermare un accesso è
          un'attestazione firmata col proprio nome, non un click di passaggio in
          un elenco: prima si guarda chi è, che cosa può raggiungere e da quanto
          non entra, poi si sceglie. Le due decisioni vivono solo qui dentro. */}
      {dettaglio && (() => {
        const m = dettaglio.m, cls = dettaglio.cls, prec = dettaglio.prec;
        const dec = esiti[m.id];
        const nAree = (RUOLI[m.ruolo] && RUOLI[m.ruolo].permessi || []).length;
        const ggM = raGiorniFa(m.lastActive);
        const anomalia = cls.rank <= 4;
        return (
        <div onClick={()=>setDettaglio(null)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:520, maxWidth:'92%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>

            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
              <AdmAvatar name={m.nome} bg={m.avatarBg} size={40}/>
              <div style={{minWidth:0, flex:1}}>
                <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT}}>{m.nomeCompleto || m.nome}</div>
                <div style={{fontSize:12.6, color:ADM.MUTED}}>{m.email}</div>
              </div>
              <div style={{display:'inline-flex', alignItems:'center', gap:6, flexShrink:0,
                padding:'3px 9px', borderRadius:99, background: tonoBg[cls.tono]}}>
                <span style={{width:6, height:6, borderRadius:'50%', background: tonoCol[cls.tono]}}/>
                <span style={{fontSize:11.4, fontWeight:700, color: tonoCol[cls.tono], whiteSpace:'nowrap'}}>{cls.label}</span>
              </div>
            </div>

            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
              {[
                ['Ruolo', (RUOLI[m.ruolo] && RUOLI[m.ruolo].label) || m.ruolo],
                ['Aree accessibili', `${nAree} su ${PERMESSI.length}`],
                ['Nel team dal', raFmtData(m.addedOn)],
                ['Ultimo accesso', m.lastActive ? (ggM === 0 ? 'oggi' : ggM === 1 ? 'ieri' : `${ggM} giorni fa`) : 'mai'],
                ['Ultima verifica', prec ? `${raFmtData(prec.campagna.chiusaIl)} · ${prec.campagna.periodo}` : 'mai riesaminato'],
                ['Secondo fattore', m.due_fa ? 'attivo' : 'non attivo'],
                ['Rilievo', cls.nota],
              ].map(([k, v]) => (
                <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
                  <span style={{color:ADM.MUTED, width:126, flexShrink:0}}>{k}</span>
                  <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>

            {dec ? (
              <React.Fragment>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:16}}>
                  {dec.automatico
                    ? <span>Confermato d'ufficio: <strong style={{color:ADM.TEXT}}>{dec.motivo}</strong>.
                        Il Super Admin titolare non si conferma né si revoca da solo — l'accesso gli viene
                        dal ruolo, e il ruolo cambia fuori da qui.</span>
                    : <span><strong style={{color: dec.decisione === 'revocato' ? ADM.DANGER : ADM.OK}}>
                        {dec.decisione === 'revocato' ? 'Accesso revocato' : 'Accesso confermato'}</strong> da {dec.chi} il {raFmtDataOra(dec.quando)}.
                        {dec.motivo ? ` Motivo: ${dec.motivo}` : ''} La decisione è già nell'audit log: per cambiarla serve una campagna nuova.</span>}
                </div>
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <AdmButton variant="secondary" size="sm" onClick={()=>setDettaglio(null)}>Chiudi</AdmButton>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom: anomalia ? 12 : 16}}>
                  Decidendo attesti che questa persona deve — o non deve — continuare ad avere
                  questi permessi. La decisione finisce nell'attestazione e nell'audit log con il
                  tuo nome e l'orario.
                </div>

                {/* Confermare un'ANOMALIA senza scrivere perché è il punto in
                    cui un riesame con zero revoche non si difende più: nel
                    verbale resta «dormiente da 142 giorni — confermata», e la
                    domanda successiva è «su quale base?». Sulle utenze
                    invariate non serve: il perché l'ha già scritto il confronto
                    con la campagna precedente. */}
                {anomalia && (
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
                      letterSpacing:'0.05em', marginBottom:6}}>
                      Perché l'accesso resta · obbligatorio
                    </div>
                    <textarea value={motivoConferma} onChange={e=>setMotivoConferma(e.target.value)} autoFocus
                      placeholder={RA_ESEMPI_MOTIVO[cls.key] || 'Su quale base questo accesso può restare com\'è'}
                      style={{width:'100%', minHeight:70, padding:'10px 12px', borderRadius:10,
                        border:`1px solid ${ADM.BORDER}`, fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT,
                        resize:'vertical', boxSizing:'border-box', outline:'none'}}/>
                    <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.45}}>
                      È il contenuto del riesame: senza, il verbale dice che l'anomalia
                      l'hai vista ma non che cosa ne hai concluso.
                    </div>
                  </div>
                )}

                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <AdmButton variant="ghost" size="sm" style={{color:ADM.DANGER, borderColor:'rgba(220,38,38,0.28)'}}
                    onClick={()=>{ setRevoca(m); setMotivo(''); setDettaglio(null); }}>Revoca</AdmButton>
                  <div style={{flex:1}}/>
                  <AdmButton variant="secondary" size="sm" onClick={()=>setDettaglio(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="sm" disabled={anomalia && motivoConferma.trim().length < 8}
                    onClick={()=>{ registra(m, 'confermato', anomalia ? motivoConferma.trim() : '', IO); setDettaglio(null); }}>
                    Conferma
                  </AdmButton>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        );
      })()}

      {/* Revoca multipla — un motivo per tutte, ed è il limite della cosa */}
      {revocaMulti && (
        <div onClick={()=>setRevocaMulti(false)} style={{position:'fixed', inset:0, zIndex:61, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:500, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Revocare l'accesso a {selNomi.length} {selNomi.length === 1 ? 'persona' : 'persone'}?
            </div>
            <div style={{padding:'11px 13px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14,
              fontSize:12.8, color:ADM.TEXT, lineHeight:1.7}}>
              {selNomi.join(' · ')}
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>
              Le utenze vengono disabilitate e le sessioni attive terminate. Il motivo che scrivi
              qui finisce nell'attestazione di <strong style={{color:ADM.TEXT}}>tutte</strong> le
              righe selezionate: ha senso se la ragione è una sola. Se sono diverse, conviene
              revocarle una per una — l'auditor legge il motivo riga per riga.
            </div>
            <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} autoFocus
              placeholder="Es. Chiusura del progetto Delivery al 30/06/2026 — accessi dei collaboratori esterni non più necessari"
              style={{width:'100%', minHeight:78, padding:'10px 12px', borderRadius:10, border:`1px solid ${ADM.BORDER}`,
                fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT, resize:'vertical', boxSizing:'border-box', outline:'none'}}/>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setRevocaMulti(false)}>Annulla</AdmButton>
              <AdmButton variant="danger" size="sm" disabled={motivo.trim().length < 8} onClick={revocaSelezionate}>
                Revoca {selNomi.length} {selNomi.length === 1 ? 'accesso' : 'accessi'}
              </AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* Popup conferma in blocco — i nomi si vedono prima di attestare */}
      {confermaBlocco && (
        <div onClick={()=>setConfermaBlocco(false)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:500, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Confermare {invariatiAperti.length} accessi invariati?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Sono le utenze senza variazioni di ruolo o permessi dall'ultima campagna.
              Confermarle in blocco è legittimo proprio perché il confronto è stato calcolato:
              stai attestando che non è cambiato nulla, non stai timbrando alla cieca. Ognuna
              esce con il tuo nome e l'ora, e nello storico si legge riga per riga.
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

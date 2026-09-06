// Admin Team: gestione utenti dello staff con ruoli e permessi

const { useState: useStateTeam } = React;

// Tre sezioni diverse condividono questo componente perche condividono le tab:
// tenerle in tre file avrebbe voluto dire tre copie della stessa lista membri.
// `sezione` decide quali tab mostrare, non quali esistono.
const ADM_SEZIONI = {
  // Niente `hr`: Risorse Umane non esiste più come sezione, e il registro della
  // formazione se n'è andato con Risk Management.
  // Le testate alla maniera di Hubble: entrambe le sezioni si presentano da
  // sole nel contenuto — da quando la governance è una voce sola, il titolone
  // di pagina non arriva più dall'header della shell.
  sicurezza:    { pred:'accessi',     tabs:['accessi','audit','diagnostica','limiti'],
    testata: { titolo:'Sicurezza e sistemi',
      sotto:'Team, permessi, accessi, tracce e salute della piattaforma.' } },
  // Niente tab «Incaricati Fisconline» (P-116 · D-103): l'incaricato è della
  // società, non di Byup, e si legge nella scheda del locale.
  impostazioni: { pred:'piattaforma', tabs:['piattaforma','deleghe'],
    testata: { titolo:'Piattaforma',
      sotto:'Le leve commerciali di byup: piani e prezzi, coefficienti del piano, discovery nell\'app — e il registro delle deleghe degli esercenti.' } },
};

function AdmTeamPage({ search, initialTab, sezione = 'sicurezza' }) {
  const sez = ADM_SEZIONI[sezione] || ADM_SEZIONI.sicurezza;
  const [tab, setTab] = useStateTeam(initialTab || sez.pred);
  // Un link da un'altra sezione — un avviso, una notifica — deve poter arrivare
  // sulla tab giusta, non sulla prima.
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  const [ruoliOpen, setRuoliOpen] = useStateTeam(false);
  const [inviteOpen, setInviteOpen] = useStateTeam(false);

  // Chi non ha ancora accettato non è nel team: l'invito nasce dove gli altri
  // già vivono — INVITI_PENDENTI, che è quello che «Inviti in attesa» legge —
  // e come ogni azione che parte verso un'email lascia traccia nell'audit log.
  // Si torna su Accessi, che è dove il nuovo nome compare.
  const handleInvite = (nuovo) => {
    INVITI_PENDENTI.unshift({
      nome: nuovo.nome.trim(), email: nuovo.email.trim(), ruolo: nuovo.ruolo,
      // Un invito personalizzato porta con sé le celle regolate: sono permessi
      // già assegnati che aspettano solo l'accettazione, e il riesame li deve
      // poter leggere come legge quelli di un membro.
      permessiCustom: nuovo.permessiCustom || undefined,
      inviato: new Date(), scade: new Date(Date.now() + 86400000 * 7),
    });
    AUDIT_EVENTS.unshift({
      who: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu',
      action: 'ha invitato',
      target: `${nuovo.nome.trim()} · ${admLabelRuolo(nuovo.ruolo)}${nuovo.base ? ' (da preset ' + admLabelRuolo(nuovo.base) + ')' : ''}`,
      icon: 'send', color: 'INFO', tipo: 'team', when: new Date(),
    });
    setInviteOpen(false);
    setTab('accessi');
  };

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      {sez.testata && <HubTestata titolo={sez.testata.titolo} sotto={sez.testata.sotto}/>}
      <AdmCard padding={0}>
        {/* Con una sola tab la barra non offre nessuna scelta: mostrarla
            sarebbe un comando che non comanda niente. */}
        <div style={{padding:'0 22px 0 8px', borderBottom:`1px solid ${ADM.BORDER}`,
          display: sez.tabs.length > 1 ? 'flex' : 'none', alignItems:'center', gap:12}}>
          <AdmTabBar tabs={[
            // Team e Riesame erano la stessa anagrafica in due tab: gli stessi
            // nomi, le stesse email, gli stessi ruoli, con due colonne diverse in
            // fondo. Ora la lista e una e il riesame e uno stato in cui si trova.
            // Il badge conta le righe che il riesame mostra davvero: gli
            // inviti in attesa hanno già il loro contatore dentro la lista.
            { id:'accessi',     label:'Accessi',         badge:TEAM.filter(m => m.attivo !== false && !m.pending).length },
            { id:'audit',       label:'Audit log' },
            { id:'piattaforma', label:'Piattaforma' },
            { id:'deleghe',     label:'Deleghe', badge: (typeof delInAvvicinamento === 'function' ? delInAvvicinamento().length : 0) },
            { id:'diagnostica', label:'Diagnostica' },
            // I limiti dei canali cliente (P-168 · D-118): tre parametri e i rifiuti del giorno.
            { id:'limiti',      label:'Limiti' },
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

        {/* Chi ha accesso, gli inviti in attesa e la revoca: nient'altro. Il
            riesame periodico (A.5.18) si fa fuori dal prodotto (D-44, P-56). */}
        {tab === 'accessi' && <AccessiList/>}
        {tab === 'piattaforma' && <PlatformConfig/>}
        {tab === 'deleghe' && <HubDeleghePage/>}
        {tab === 'diagnostica' && <PlatformDiagnostica/>}
        {tab === 'audit' && <AuditLog/>}
        {tab === 'limiti' && <TeamLimiti/>}
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
  // La personalizzazione: null = fedele al preset. Aprendo «Regola le aree» i
  // livelli si copiano dal preset e ogni cella diventa sua; se alla fine
  // coincidono ancora col preset, l'account resta col ruolo — personalizzato
  // è chi DIFFERISCE, non chi ha aperto l'editor.
  const [livelli, setLivelli] = useStateTeam(null);
  const [regola, setRegola] = useStateTeam(false);

  // Reset dei campi ogni volta che il modale si apre
  React.useEffect(() => {
    if (open) { setNome(''); setEmail(''); setRuolo('support'); setLivelli(null); setRegola(false); }
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

  const base = (RUOLI[ruolo] && RUOLI[ruolo].livelli) || {};
  const celle = livelli || base;
  const aree = AREE.filter(a => !a.riservata);
  const personalizzato = !!livelli && aree.some(a => (livelli[a.id] || 'nessuno') !== (base[a.id] || 'nessuno'));

  const scegliPreset = (id) => { setRuolo(id); setLivelli(null); };
  const cambiaCella = (areaId, v) => setLivelli({ ...celle, [areaId]: v });

  const submit = () => {
    if (!canSend) return;
    onInvite(personalizzato
      ? { nome, email, ruolo: 'custom', permessiCustom: livelli, base: ruolo }
      : { nome, email, ruolo });
  };

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
            <div style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT, marginBottom:8}}>Ruolo di partenza</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
              {Object.entries(RUOLI).filter(([, r]) => !r.personalizzato).map(([id, r]) => {
                const sel = ruolo === id;
                return (
                  <button key={id} onClick={()=>scegliPreset(id)} style={{
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

            {/* La personalizzazione: il preset è il punto di partenza, non una
                gabbia. Le celle si regolano qui, area per area; Piattaforma
                non c'è e non ci sarà — è riservata al Super Admin. */}
            <button onClick={()=>{ if (!regola && !livelli) setLivelli({ ...base }); setRegola(r => !r); }} style={{
              marginTop:10, display:'flex', alignItems:'center', gap:7, padding:'7px 10px',
              background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit',
              fontSize:13.3, fontWeight:700, color: regola || personalizzato ? ADM.PINK_DARK : ADM.MUTED,
            }}>
              <span style={{display:'inline-flex', transform: regola ? 'rotate(90deg)' : 'none', transition:'transform 0.15s ease'}}>
                <BuIcons.chevronRight size={14}/>
              </span>
              Regola le aree
              {personalizzato && <AdmBadge color={RUOLI.custom.color} size="xs">Personalizzato</AdmBadge>}
            </button>
            {regola && (
              <div style={{marginTop:6, border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
                {aree.map((a, i) => {
                  const val = celle[a.id] || 'nessuno';
                  const opzioni = a.soloLettura ? ['nessuno', 'lettura'] : ['nessuno', 'lettura', 'scrittura'];
                  const diversa = (celle[a.id] || 'nessuno') !== (base[a.id] || 'nessuno');
                  return (
                    <div key={a.id} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                      borderBottom: i === aree.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                      background: i%2===1 ? ADM.ROW_STRIPE : '#fff',
                    }}>
                      <div style={{flex:1, minWidth:0}}>
                        <span style={{fontSize:13.4, fontWeight:600, color:ADM.TEXT}}>{a.label}</span>
                        {a.predisposta && <span style={{fontSize:11, fontWeight:700, color:ADM.WARN, marginLeft:6, textTransform:'uppercase', letterSpacing:'0.04em'}}>predisposta</span>}
                        {/* Il pallino dice quali celle si sono staccate dal
                            preset: è la differenza, non l'elenco, che il
                            revisore vorrà guardare. */}
                        {diversa && <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:ADM.PINK, marginLeft:7, verticalAlign:'middle'}}/>}
                      </div>
                      <div style={{display:'flex', gap:4}}>
                        {opzioni.map(op => {
                          const sel = val === op;
                          const c = LIVELLI[op];
                          return (
                            <button key={op} onClick={()=>cambiaCella(a.id, op)} style={{
                              padding:'4px 10px', borderRadius:7, cursor:'pointer', fontFamily:'inherit',
                              fontSize:12.3, fontWeight:700,
                              background: sel ? (ADM[c.color + '_SOFT'] || ADM.PANEL_SOFT) : 'transparent',
                              color: sel ? ADM[c.color] : ADM.MUTED_SOFT,
                              border:`1.5px solid ${sel ? ADM[c.color] : 'transparent'}`,
                              transition:'background 0.12s ease, color 0.12s ease, border-color 0.12s ease',
                            }}>{c.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

// La cella della matrice: il livello si LEGGE, non si decifra da un'icona.
// «—» è l'assenza, e non ha bisogno di una parola.
function RpCella({ livello }) {
  if (!livello || livello === 'nessuno')
    return <span style={{fontSize:13.5, color:ADM.MUTED_LIGHT, fontWeight:600}}>—</span>;
  const l = LIVELLI[livello];
  return <AdmBadge color={l.color} size="xs">{l.label}</AdmBadge>;
}

function RuoliMatrix() {
  // Piattaforma non è una riga: è riservata al Super Admin e non deve comparire
  // nemmeno qui, dove i permessi si consultano per assegnarli.
  const preset = Object.entries(RUOLI).filter(([, r]) => !r.personalizzato);
  const righe = AREE.filter(a => !a.riservata);
  return (
    <div style={{padding:'20px 22px'}}>
      <div style={{fontSize:13.7, color:ADM.MUTED, marginBottom:14, lineHeight:1.5}}>
        Ogni area della console ha tre livelli: <b>Nessuno</b> (non si vede), <b>Lettura</b> (si consulta), <b>Scrittura</b> (si agisce — le azioni pesanti chiedono comunque il motivo).
        Questi sono i preset, e valgono per tutti i membri col ruolo; un account <b>Personalizzato</b> parte da un preset e regola le celle una per una, dall'invito.
      </div>
      <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden'}}>
        <div style={{
          display:'grid',
          gridTemplateColumns:`250px repeat(${preset.length}, 1fr)`,
          background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`,
        }}>
          <div style={{padding:'12px 14px', fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Area</div>
          {preset.map(([id, r]) => (
            <div key={id} style={{padding:'12px 8px', textAlign:'center', borderLeft:`1px solid ${ADM.BORDER}`}}>
              <AdmBadge color={r.color} size="xs">{r.label}</AdmBadge>
            </div>
          ))}
        </div>
        {righe.map((a, i) => (
          <div key={a.id} style={{
            display:'grid',
            gridTemplateColumns:`250px repeat(${preset.length}, 1fr)`,
            borderBottom: i === righe.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            background: i%2===1 ? ADM.ROW_STRIPE : '#fff',
          }}>
            <div style={{padding:'12px 14px'}}>
              <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>
                {a.label}
                {a.soloLettura && <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, marginLeft:7, textTransform:'uppercase', letterSpacing:'0.04em'}}>solo consultazione</span>}
                {/* P-110: la funzione non è ancora nella console, il permesso
                    sì — si assegna oggi, così quando la funzione arriva non
                    si riaprono i preset. */}
                {a.predisposta && <span style={{fontSize:11.5, fontWeight:700, color:ADM.WARN, marginLeft:7, textTransform:'uppercase', letterSpacing:'0.04em'}}>predisposta</span>}
              </div>
              <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>{a.desc}</div>
            </div>
            {preset.map(([rid, r]) => (
              <div key={rid} style={{padding:'12px 8px', borderLeft:`1px solid ${ADM.BORDER_SOFT}`, display:'grid', placeItems:'center'}}>
                <RpCella livello={(r.livelli || {})[a.id]}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Contratto di default: sta in alto perché si veda, non perché occupi spazio.
// Un invito scaduto si annulla da solo — non esiste una lista di inviti morti da
// guardare, e il filtro qui sotto è la regola: se la scadenza è passata, quello
// non è più un invito in attesa. Per questo l'intestazione non ha niente da
// segnalare oltre a quanti sono e chi sono.
function InvitiPending() {
  const [aperto, setAperto] = useStateTeam(false);
  const [conferma, setConferma] = useStateTeam(null);   // { inv, azione: 'invia' | 'annulla' }
  const [, ridisegna] = useStateTeam(0);
  const gg = (d) => Math.round((d.getTime() - Date.now()) / 86400000);
  const tutti = (typeof INVITI_PENDENTI !== 'undefined' ? INVITI_PENDENTI : []);
  const inviti = tutti.filter(i => !i.annullato && gg(i.scade) >= 0);
  if (!inviti.length) return null;

  const esegui = () => {
    const { inv, azione } = conferma;
    if (azione === 'annulla') {
      inv.annullato = true;
    } else {
      inv.inviato = new Date();
      inv.scade = new Date(Date.now() + 86400000 * 7);
    }
    AUDIT_EVENTS.unshift({
      who: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu',
      action: azione === 'annulla' ? "ha annullato l'invito di" : "ha inviato di nuovo l'invito a",
      target: `${inv.nome} · ${(RUOLI[inv.ruolo] && RUOLI[inv.ruolo].label) || inv.ruolo}`,
      icon: azione === 'annulla' ? 'lock' : 'send',
      color: azione === 'annulla' ? 'DANGER' : 'INFO',
      tipo: 'team', when: new Date(),
    });
    setConferma(null); ridisegna(x => x + 1);
  };

  return (
    <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:10, overflow:'hidden', background:'#fff'}}>
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
        {!aperto && (
          <span style={{fontSize:12.4, color:ADM.MUTED_SOFT}}>{inviti.map(i => i.nome).join(', ')}</span>
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
            <div style={{fontSize:12.4, fontWeight:700, color:ADM.WARN}}>
              Scade fra {Math.max(1, g)} {Math.max(1, g) === 1 ? 'giorno' : 'giorni'}
            </div>
            <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
              <AdmButton variant="ghost" size="sm" onClick={()=>setConferma({ inv, azione:'invia' })}>Invia di nuovo</AdmButton>
              <AdmButton variant="ghost" size="sm" onClick={()=>setConferma({ inv, azione:'annulla' })}>Annulla</AdmButton>
            </div>
          </div>
        );
      })}

      {/* Rimandare un invito e annullarlo sono due cose che partono da un
          indirizzo email e non si possono disfare: la prima manda una mail a una
          persona vera, la seconda chiude una porta che qualcuno sta aspettando
          di varcare. Nessuna delle due si fa con un clic di passaggio. */}
      {conferma && (() => {
        const annulla = conferma.azione === 'annulla';
        return (
        <div onClick={()=>setConferma(null)} style={{position:'fixed', inset:0, zIndex:60,
          background:'rgba(15,17,21,0.42)', display:'flex', alignItems:'center', justifyContent:'center',
          padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:460, maxWidth:'90%', background:'#fff',
            borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
            animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              {annulla
                ? `Annullare l'invito di ${conferma.inv.nome}?`
                : `Inviare di nuovo l'invito a ${conferma.inv.nome}?`}
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:16}}>
              {annulla
                ? <span>Il collegamento smette di funzionare subito e <strong style={{color:ADM.TEXT}}>{conferma.inv.email}</strong> non potrà più accedere con quell'invito. Per farlo entrare servirà invitarlo di nuovo.</span>
                : <span>Parte una mail a <strong style={{color:ADM.TEXT}}>{conferma.inv.email}</strong> con un collegamento nuovo, valido altri sette giorni. Il precedente smette di funzionare.</span>}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(null)}>Lascia stare</AdmButton>
              <AdmButton variant={annulla ? 'danger' : 'primary'} size="sm" onClick={esegui}>
                {annulla ? "Annulla l'invito" : 'Invia di nuovo'}
              </AdmButton>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// ALIQUOTE DEGLI ARTICOLI (P-164 · D-112 e il suo emendamento)
// ═══════════════════════════════════════════════════════════════════════════
// Le tipologie dell'articolo (item_kinds) con i loro trattamenti IVA
// (vat_rate_profiles): l'unico dizionario che il modello dice governato da
// Hubble. Il registro è condiviso sullo stesso dominio (byup_tipologie_articolo)
// e il gestionale lo LEGGE quando si crea un articolo o si batte un fuori
// menù: le tipologie proposte sono queste, in quest'ordine, con questa
// spiegazione. Regole: etichetta, spiegazione e ordine valgono subito (sono
// parole); il trattamento puntato si cambia con una data, perché sposta
// l'aliquota su ogni cassa; un trattamento in vigore NON si modifica — si
// chiude la sua vigenza e se ne apre uno nuovo — perché la riga d'ordine ha
// congelato il profilo risolto e i documenti già emessi restano leggibili col
// diritto del loro tempo. Tutto riservato al Super Admin, con conferma
// esplicita e traccia in audit (chi, quando, che cosa, da quando). I semi sono
// la copia guardata di panoramica-tokens.jsx (altro bundle).
const HUB_TRATTAMENTI_SEME = [
  { id: 'somministrazione_10',       aliquota: 10, modalita: 'somministrazione',    fondamento: 'voce 121',              citazione: 'Tab. A parte III n. 121 DPR 633/1972: somministrazione di alimenti e bevande, al banco o al tavolo', valida_dal: '2026-01-01', valida_al: null },
  { id: 'asporto_preparato_10',      aliquota: 10, modalita: 'asporto_preparato',   fondamento: 'L. 178/2020 e voce 80', citazione: 'L. 178/2020 art. 1 co. 40, che interpreta il n. 80 della Tab. A parte III: piatti pronti e pasti preparati, anche da asporto', valida_dal: '2026-01-01', valida_al: null },
  { id: 'asporto_acqua_birra_10',    aliquota: 10, modalita: 'asporto_confezionato', fondamento: 'voci 81 e 82',         citazione: 'Tab. A parte III nn. 81 e 82 DPR 633/1972: acqua e birra, anche in bottiglia o lattina', valida_dal: '2026-01-01', valida_al: null },
  { id: 'asporto_confezionato_22',   aliquota: 22, modalita: 'asporto_confezionato', fondamento: 'aliquota ordinaria',   citazione: 'art. 16 DPR 633/1972: bibite, vino, superalcolici e dolciumi in confezione ceduti da asporto', valida_dal: '2026-01-01', valida_al: null },
  { id: 'asporto_alimentari_base_4', aliquota: 4,  modalita: 'asporto_confezionato', fondamento: 'Tabella A parte II',   citazione: 'Tab. A parte II nn. 3, 5, 6, 8, 15 DPR 633/1972: latte fresco non concentrato né zuccherato, frutta e ortaggi freschi o surgelati, pane comune', valida_dal: '2026-01-01', valida_al: null },
  { id: 'cessione_generica_22',              aliquota: 22, modalita: 'cessione',            fondamento: 'aliquota ordinaria',    citazione: 'art. 16 DPR 633/1972: cessione di beni non alimentari', valida_dal: '2026-01-01', valida_al: null },
];
const HUB_TIPOLOGIE_SEME = [
  { id: 'piatti_preparati', ordine: 1, label: 'Piatti, panini, caffè, dolci e pasticceria', spiegazione: 'Quello che il locale prepara o serve.', locale: { profilo: 'somministrazione_10' }, asporto: { profilo: 'asporto_preparato_10' }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'acqua_birra', ordine: 2, label: 'Acqua e birra', spiegazione: 'Anche in bottiglia o lattina sigillata.', locale: { profilo: 'somministrazione_10' }, asporto: { profilo: 'asporto_acqua_birra_10' }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'bibite_alcolici_confezionati', ordine: 3, label: 'Bibite, vino, alcolici, dolciumi confezionati', spiegazione: 'Bibite gassate, vino, superalcolici, cioccolato e dolciumi in confezione.', locale: { profilo: 'somministrazione_10' }, asporto: { profilo: 'asporto_confezionato_22' }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'alimentari_base', ordine: 4, label: 'Pane, pasta, latte, formaggi, frutta e verdura', spiegazione: 'Alimentari di base venduti così come sono: pane comune senza zuccheri, miele, uova o formaggio; latte fresco non concentrato né zuccherato; frutta e ortaggi freschi o surgelati. Non ci stanno dolci da forno, latte zuccherato, frutta e verdura conservate o candite, che da asporto vanno al 10%.', locale: { profilo: 'somministrazione_10' }, asporto: { profilo: 'asporto_alimentari_base_4' }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'non_alimentari', ordine: 5, label: 'Oggetti non alimentari', spiegazione: 'Gadget, tazze, magliette e tutto ciò che non si mangia né si beve.', locale: { profilo: 'cessione_generica_22' }, asporto: { profilo: 'cessione_generica_22' }, valida_dal: '2026-01-01', valida_al: null },
];
const HUB_MODALITA_TRATTAMENTO = {
  somministrazione: 'Somministrazione (al banco o al tavolo)', asporto_preparato: 'Asporto di alimenti preparati',
  asporto_confezionato: 'Asporto di alimenti confezionati', cessione: 'Cessione di beni non alimentari',
};
const HUB_TIPOLOGIE_KEY = 'byup_tipologie_articolo';
const hubOggiIso = (piu) => { const d = new Date(); d.setDate(d.getDate() + (piu || 0)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const hubInVigore = (x, g) => (!x.valida_dal || x.valida_dal <= g) && (!x.valida_al || x.valida_al > g);
function hubTipologieRegistro() {
  try { const s = localStorage.getItem(HUB_TIPOLOGIE_KEY); if (s) { const v = JSON.parse(s); if (v && Array.isArray(v.tipologie) && Array.isArray(v.trattamenti)) return v; } } catch (e) {}
  return { tipologie: HUB_TIPOLOGIE_SEME.map(t => ({ ...t, locale: { ...t.locale }, asporto: { ...t.asporto } })), trattamenti: HUB_TRATTAMENTI_SEME.map(t => ({ ...t })), versione: 0 };
}
function hubTipologieScrivi(reg, action, target, daQuando) {
  const nuovo = { ...reg, versione: (reg.versione || 0) + 1, aggiornato: new Date().toISOString() };
  try { localStorage.setItem(HUB_TIPOLOGIE_KEY, JSON.stringify(nuovo)); } catch (e) {}
  try { window.dispatchEvent(new Event('byup-tipologie-change')); } catch (e) {}
  const me = hubUtenteCorrente();
  if (typeof AUDIT_EVENTS !== 'undefined') AUDIT_EVENTS.unshift({ who: me.nomeCompleto || me.nome, action, target: `${target}${daQuando ? ` · dal ${daQuando}` : ''}`, icon: 'tag', color: 'INFO', tipo: 'piattaforma', when: new Date() });
  return nuovo;
}
window.hubTipologieRegistro = hubTipologieRegistro;

// ─── Aliquote degli articoli: la vista (ridisegno del 6 settembre 2026) ──────
// Prima era un foglio di calcolo: campi, tendine e aree di testo accesi su
// ogni riga, una seconda tabella dei trattamenti sotto, un banner di regole in
// testa. Ora è una LISTA DI CARD che si legge, e DUE DIMENSIONI che si
// modificano separatamente, perché sono due cose diverse:
//   · le PAROLE della tipologia — etichetta, spiegazione, ordine — valgono
//     subito e si cambiano dal pannello «Modifica»;
//   · le ALIQUOTE — sul posto, da asporto — cambiano nel tempo perché cambia
//     la legge, non perché si riscrive una spiegazione: si toccano dal loro
//     chip, ognuna con la propria cronologia (com'era, com'è, come sarà) e con
//     «Nuova aliquota da una data», che sceglie un trattamento in vigore o ne
//     apre uno nuovo — aliquota, modalità, fondamento — senza mai riscrivere
//     quello di oggi, così i documenti già emessi restano leggibili col
//     diritto del loro tempo (D-112).
// La sezione «Trattamenti IVA» non c'è più: i trattamenti restano nel
// registro e nascono dal chip, quando servono. Le regole stanno in una «i».
// Ogni lato porta `profilo` (oggi), `dal`, `prossimo` (il cambio programmato,
// uno per volta: il gestionale lo risolve per data) e `storico` (i profili
// passati, con dal e al); quando la data del programmato arriva, il registro
// lo promuove a oggi e sposta il vecchio nello storico.
const hubAliquotaFmt = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
function hubTipologieNormalizza(reg) {
  const g = hubOggiIso(0); let cambiato = false;
  const tipologie = reg.tipologie.map(t => {
    const n = { ...t };
    ['locale', 'asporto'].forEach(k => {
      const l = n[k];
      if (l && l.prossimo && l.prossimo.dal <= g) {
        n[k] = { profilo: l.prossimo.profilo, dal: l.prossimo.dal, storico: [...(l.storico || []), { profilo: l.profilo, dal: l.dal || t.valida_dal || null, al: l.prossimo.dal }] };
        cambiato = true;
      }
    });
    return n;
  });
  if (!cambiato) return reg;
  const nuovo = { ...reg, tipologie, versione: (reg.versione || 0) + 1, aggiornato: new Date().toISOString() };
  try { localStorage.setItem(HUB_TIPOLOGIE_KEY, JSON.stringify(nuovo)); } catch (e) {}
  return nuovo;
}
// La cronologia di un lato: i profili passati, quello di oggi, il programmato.
function hubAliquotaCronologia(t, k) {
  const l = t[k] || {};
  return [
    ...(l.storico || []).map(s => ({ ...s, stato: 'passata' })),
    { profilo: l.profilo, dal: l.dal || t.valida_dal || null, al: l.prossimo ? l.prossimo.dal : null, stato: 'oggi' },
    ...(l.prossimo ? [{ profilo: l.prossimo.profilo, dal: l.prossimo.dal, al: null, stato: 'programmata' }] : []),
  ];
}

// Il chip dell'aliquota: il numero grande, il fondamento e la modalità
// accanto, «dal quando»; se c'è un cambio programmato, la pillola ambra. Per
// il Super Admin è un pulsante: apre la cronologia e il cambio.
function HubAliquotaFatto({ etichetta, t, k, tr, onApri }) {
  const lato = t[k];
  const cur = tr(lato.profilo);
  const pross = lato.prossimo ? tr(lato.prossimo.profilo) : null;
  const passate = (lato.storico || []).length;
  const Tag = onApri ? 'button' : 'div';
  return (
    <Tag type={onApri ? 'button' : undefined} onClick={onApri} data-fatto={k} className={onApri ? 'hub-card' : undefined} title={onApri ? 'Cronologia e cambio da una data' : undefined}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 13px 9px 12px', borderRadius:11, border:`1px solid ${ADM.BORDER}`, background:'#fff', minWidth:0, textAlign:'left', fontFamily:'inherit', cursor: onApri ? 'pointer' : 'default' }}>
      <div style={{ flexShrink:0 }}>
        <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:ADM.MUTED_SOFT }}>{etichetta}</div>
        <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.05, color:ADM.TEXT, marginTop:2, fontVariantNumeric:'tabular-nums' }}>{cur.aliquota}%</div>
      </div>
      <div style={{ borderLeft:`1px solid ${ADM.BORDER_SOFT}`, paddingLeft:12, fontSize:12, color:ADM.MUTED, lineHeight:1.4, minWidth:0 }}>
        <div style={{ color:ADM.TEXT, fontWeight:700 }}>{cur.fondamento}</div>
        <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{HUB_MODALITA_TRATTAMENTO[cur.modalita] || ''}</div>
        <div style={{ fontSize:11.2, color:ADM.MUTED_SOFT }}>dal {hubAliquotaFmt(lato.dal || t.valida_dal)}{passate ? ` · prima ${passate === 1 ? 'un\'altra' : passate + ' altre'}` : ''}</div>
      </div>
      {pross && <HubPillola color="WARN" size="sm">dal {hubAliquotaFmt(lato.prossimo.dal)} → {pross.aliquota}%</HubPillola>}
      {onApri && <span style={{ color:ADM.MUTED_LIGHT, display:'grid', placeItems:'center', marginLeft:2 }}><BuIcons.pencil size={13}/></span>}
    </Tag>
  );
}

function HubAliquoteArticoli() {
  const [, ridisegna] = useStateTeam(0);
  const me = hubUtenteCorrente();
  const puo = me.ruolo === 'super_admin';
  const reg = hubTipologieNormalizza(hubTipologieRegistro());
  const oggi = hubOggiIso(0), domani = hubOggiIso(1);
  const trVivi = reg.trattamenti.filter(t => hubInVigore(t, oggi));
  const tr = (id) => reg.trattamenti.find(t => t.id === id) || { id, aliquota: '?', fondamento: '—', modalita: '' };
  const tipVive = reg.tipologie.filter(t => hubInVigore(t, oggi)).slice().sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
  const uso = (() => { try { return JSON.parse(localStorage.getItem('byup_tipologie_uso') || '{}') || {}; } catch (e) { return {}; } })();
  const salva = (nuovo, action, target, daQuando) => { hubTipologieScrivi(nuovo, action, target, daQuando); ridisegna(x => x + 1); };
  const optTr = trVivi.map(t => ({ value: t.id, label: `${t.aliquota}% · ${HUB_MODALITA_TRATTAMENTO[t.modalita] || t.modalita} · ${t.fondamento}` }));
  const LATI = { locale: { tit: 'Sul posto', nota: 'al consumo al banco o al tavolo' }, asporto: { tit: 'Da asporto', nota: 'quando l\'articolo esce dal locale' } };

  // I due pannelli: le PAROLE di una tipologia (o una tipologia nuova), e
  // l'ALIQUOTA di un lato con la sua cronologia.
  const [pan, setPan] = useStateTeam(null);
  const apriParole = (t) => setPan({ modo: 'parole', id: t.id, label: t.label, spiegazione: t.spiegazione, ritiro: null });
  const apriNuova = () => setPan({ modo: 'parole', id: null, label: '', spiegazione: '', locale: trVivi[0] ? trVivi[0].id : '', asporto: trVivi[0] ? trVivi[0].id : '', dal: domani, ritiro: null });
  const apriAliquota = (t, k) => setPan({ modo: 'aliquota', id: t.id, lato: k, scelta: '', nuovo: { aliquota: '', modalita: k === 'locale' ? 'somministrazione' : 'asporto_preparato', fondamento: '', citazione: '' }, dal: domani });
  const set = (k, v) => setPan(p => ({ ...p, [k]: v }));
  const originale = pan && pan.id ? reg.tipologie.find(x => x.id === pan.id) : null;

  const sposta = (t, verso) => {
    const idx = tipVive.findIndex(x => x.id === t.id); const j = idx + verso; if (j < 0 || j >= tipVive.length) return;
    const ordine = tipVive.map(x => x.id); [ordine[idx], ordine[j]] = [ordine[j], ordine[idx]];
    const nuovo = { ...reg, tipologie: reg.tipologie.map(x => ordine.includes(x.id) ? { ...x, ordine: ordine.indexOf(x.id) + 1 } : x) };
    salva(nuovo, 'ha riordinato le tipologie', `${t.label} ${verso < 0 ? 'sale' : 'scende'} · prima proposta: ${(reg.tipologie.find(x => x.id === ordine[0]) || {}).label}`);
  };

  // ── Le parole ──
  const paroleValide = !!pan && pan.modo === 'parole' && pan.label.trim().length > 1 && pan.spiegazione.trim().length > 3 && (pan.id || (!!pan.locale && !!pan.asporto && !!pan.dal));
  const salvaParole = () => {
    if (!paroleValide) return;
    const lab = pan.label.trim(), spi = pan.spiegazione.trim();
    if (!pan.id) {
      const id = lab.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || ('tipologia_' + Date.now());
      const nuovo = { ...reg, tipologie: [...reg.tipologie, { id, ordine: tipVive.length + 1, label: lab, spiegazione: spi, locale: { profilo: pan.locale, dal: pan.dal }, asporto: { profilo: pan.asporto, dal: pan.dal }, valida_dal: pan.dal, valida_al: null }] };
      salva(nuovo, 'ha aggiunto una tipologia', `${lab} · ${pan.locale} / ${pan.asporto}`, pan.dal);
    } else if (lab !== originale.label || spi !== originale.spiegazione) {
      const nuovo = { ...reg, tipologie: reg.tipologie.map(x => x.id === originale.id ? { ...x, label: lab, spiegazione: spi } : x) };
      salva(nuovo, lab !== originale.label ? 'ha rinominato la tipologia' : 'ha riscritto la spiegazione della tipologia', `${originale.label} → ${(lab !== originale.label ? lab : spi).slice(0, 80)}`);
    }
    setPan(null);
  };
  const ritira = () => {
    const r = pan && pan.ritiro; if (!r || !r.dal || !r.verso || !originale) return;
    const nuovo = { ...reg, tipologie: reg.tipologie.map(x => x.id === originale.id ? { ...x, valida_al: r.dal, passata_a: r.verso } : x) };
    salva(nuovo, 'ha ritirato una tipologia', `${originale.label} · gli articoli passano a ${(reg.tipologie.find(x => x.id === r.verso) || {}).label || r.verso}`, r.dal);
    setPan(null);
  };

  // ── L'aliquota ──
  const nuovoAl = pan && pan.modo === 'aliquota' ? parseFloat(String(pan.nuovo.aliquota).replace(',', '.')) : NaN;
  const nuovoValido = !!pan && pan.scelta === '__nuovo' && isFinite(nuovoAl) && nuovoAl >= 0 && nuovoAl <= 100 && !!pan.nuovo.modalita && pan.nuovo.fondamento.trim().length > 1;
  const aliquotaValida = !!pan && pan.modo === 'aliquota' && !!pan.dal && ((pan.scelta && pan.scelta !== '__nuovo' && pan.scelta !== originale[pan.lato].profilo) || nuovoValido);
  const programma = () => {
    if (!aliquotaValida) return;
    let cur = reg; let profilo = pan.scelta;
    if (pan.scelta === '__nuovo') {
      profilo = `${pan.nuovo.modalita}_${String(nuovoAl).replace('.', '_')}_${pan.dal.replace(/-/g, '')}`;
      cur = { ...cur, trattamenti: [...cur.trattamenti, { id: profilo, aliquota: nuovoAl, modalita: pan.nuovo.modalita, fondamento: pan.nuovo.fondamento.trim(), citazione: (pan.nuovo.citazione || '').trim(), valida_dal: pan.dal, valida_al: null }] };
      cur = hubTipologieScrivi(cur, 'ha aperto un trattamento', `${profilo} · ${nuovoAl}% · ${HUB_MODALITA_TRATTAMENTO[pan.nuovo.modalita]} · ${pan.nuovo.fondamento.trim()}`, pan.dal);
    }
    const t = originale, k = pan.lato, l = t[k];
    const nuovoLato = pan.dal <= oggi
      ? { profilo, dal: pan.dal, storico: [...(l.storico || []), { profilo: l.profilo, dal: l.dal || t.valida_dal || null, al: pan.dal }] }
      : { ...l, prossimo: { profilo, dal: pan.dal } };
    cur = { ...cur, tipologie: cur.tipologie.map(x => x.id === t.id ? { ...x, [k]: nuovoLato } : x) };
    hubTipologieScrivi(cur, 'ha cambiato il trattamento di una tipologia', `${t.label} · ${k === 'locale' ? 'al consumo sul posto' : 'da asporto'} → ${profilo} (${tr(profilo).aliquota || nuovoAl}%)`, pan.dal);
    ridisegna(x => x + 1); setPan(null);
  };
  const annullaProgrammato = () => {
    const t = originale, k = pan.lato; const l = { ...t[k] }; if (!l.prossimo) return;
    const era = l.prossimo; delete l.prossimo;
    const nuovo = { ...reg, tipologie: reg.tipologie.map(x => x.id === t.id ? { ...x, [k]: l } : x) };
    salva(nuovo, 'ha annullato un cambio di trattamento programmato', `${t.label} · ${k === 'locale' ? 'al consumo sul posto' : 'da asporto'} · era ${era.profilo} dal ${era.dal}`);
    setPan(null);
  };

  const H2 = { fontSize:11.5, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:ADM.MUTED_SOFT };
  const frecciaStile = (spenta) => ({ width:22, height:18, border:'none', background:'transparent', padding:0, cursor: spenta ? 'default' : 'pointer', color: spenta ? ADM.MUTED_LIGHT : ADM.MUTED, display:'grid', placeItems:'center' });
  const campoStile = { width:'100%', padding:'9px 11px', borderRadius:9, border:`1px solid ${ADM.BORDER}`, fontFamily:'inherit', fontSize:13, color:ADM.TEXT, background:'#fff', boxSizing:'border-box' };
  const linkStile = (colore) => ({ background:'transparent', border:'none', padding:0, cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:600, color: colore || ADM.MUTED, textDecoration:'underline', textUnderlineOffset:3 });

  return (
    <div data-aliquote style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:280 }}>
          <div style={{ fontSize:17, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em' }}>Aliquote degli articoli</div>
          <div style={{ fontSize:13.2, color:ADM.MUTED, marginTop:3, lineHeight:1.5, maxWidth:720 }}>
            Le tipologie che il ristoratore sceglie creando un articolo, nell'ordine in cui il gestionale le propone. Le parole si cambiano da «Modifica»; le aliquote dal loro chip, da una data, con la cronologia.{' '}
            {typeof DocInfo === 'function' && (
              <DocInfo largo={390}>
                <b>Etichetta, spiegazione e ordine valgono subito</b>: sono le parole che il ristoratore legge, e la prima tipologia è quella proposta a tutti.
                <b> Le aliquote sono un'altra cosa</b>: cambiano nel tempo perché cambia la legge, si programmano da una data — spostano l'aliquota su ogni cassa dalla mezzanotte scelta — e non riscrivono mai quella di oggi, così i documenti già emessi restano leggibili col diritto del loro tempo (D-112). Ogni aliquota tiene la sua cronologia.
                {' '}Registro condiviso con il gestionale: <span style={{ fontFamily:'ui-monospace,monospace' }}>byup_tipologie_articolo</span>, versione {reg.versione || 0}.
              </DocInfo>
            )}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, paddingTop:2 }}>
          <HubPillola color="PLAN_FREE" size="sm">{tipVive.length} tipologie · {trVivi.length} trattamenti in vigore</HubPillola>
          {puo
            ? <AdmButton variant="primary" size="sm" icon="plus" onClick={apriNuova}>Aggiungi tipologia</AdmButton>
            : <HubPillola color="WARN" size="sm">Sola lettura · modifica il Super Admin</HubPillola>}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {tipVive.map((t, i) => (
          <div key={t.id} data-tipologia={t.id} style={{ background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:14, boxShadow:ADM.CARD_SHADOW, padding:'15px 18px 15px 14px', display:'grid', gridTemplateColumns:'40px minmax(0,1fr) auto', gap:14, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <span style={{ width:32, height:32, borderRadius:10, background: i === 0 ? ADM.PINK_SOFT : ADM.PANEL_SOFT, border:`1px solid ${i === 0 ? ADM.PINK_HOVER : ADM.BORDER_SOFT}`, color: i === 0 ? ADM.PINK_DARK : ADM.TEXT, display:'grid', placeItems:'center', fontFamily:'ui-monospace,monospace', fontWeight:800, fontSize:13 }}>{i + 1}</span>
              {puo && (
                <div style={{ display:'flex', flexDirection:'column', marginTop:2 }}>
                  <button title="Sale" disabled={i === 0} onClick={() => sposta(t, -1)} style={frecciaStile(i === 0)}><BuIcons.chevronUp size={13}/></button>
                  <button title="Scende" disabled={i === tipVive.length - 1} onClick={() => sposta(t, 1)} style={frecciaStile(i === tipVive.length - 1)}><BuIcons.chevronDown size={13}/></button>
                </div>
              )}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:15.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em' }}>{t.label}</span>
                {i === 0 && <HubPillola color="PINK" size="sm">Proposta a tutti</HubPillola>}
                <span style={{ fontFamily:'ui-monospace,monospace', fontSize:11, color:ADM.MUTED_SOFT }}>{t.id}</span>
              </div>
              <div style={{ fontSize:13.2, color:ADM.MUTED, marginTop:4, lineHeight:1.5, maxWidth:640 }}>{t.spiegazione}</div>
              <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap', alignItems:'center' }}>
                <HubAliquotaFatto etichetta="Sul posto" t={t} k="locale" tr={tr} onApri={puo ? () => apriAliquota(t, 'locale') : null}/>
                <HubAliquotaFatto etichetta="Da asporto" t={t} k="asporto" tr={tr} onApri={puo ? () => apriAliquota(t, 'asporto') : null}/>
                {uso[t.id] != null && <span style={{ fontSize:12, color:ADM.MUTED_SOFT, paddingLeft:4 }}>{uso[t.id]} articoli di menù la indicano</span>}
              </div>
            </div>
            <div style={{ paddingTop:2 }}>
              {puo && <AdmButton variant="ghost" size="sm" icon="pencil" onClick={() => apriParole(t)}>Modifica</AdmButton>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:ADM.MUTED_SOFT, lineHeight:1.5 }}>
        Il gestionale legge queste tipologie, in quest'ordine, con questa spiegazione, e le aliquote risolte alla data. Un trattamento in vigore non si modifica: se ne apre uno nuovo, da una data.
      </div>

      {/* ── Il pannello delle parole ── */}
      <HubPannello open={!!pan && pan.modo === 'parole'} onClose={() => setPan(null)} larghezza={460} icona="tag"
        titolo={pan && pan.modo === 'parole' ? (pan.id ? originale.label : 'Nuova tipologia') : ''}
        sotto={pan && pan.modo === 'parole' ? (pan.id ? 'Le parole che il ristoratore legge: valgono subito. Le aliquote si cambiano dal loro chip.' : 'Nasce in fondo all\'elenco, da una data; le aliquote poi si cambiano dal loro chip.') : ''}
        footer={pan && pan.modo === 'parole' && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {pan.id && !pan.ritiro && <button onClick={() => set('ritiro', { verso: (tipVive.find(x => x.id !== pan.id) || {}).id || '', dal: domani })} style={linkStile(ADM.DANGER)}>Ritira la tipologia…</button>}
            <div style={{ flex:1 }}/>
            <AdmButton variant="secondary" size="sm" onClick={() => setPan(null)}>Annulla</AdmButton>
            <AdmButton variant="primary" size="sm" icon="check" disabled={!paroleValide} onClick={salvaParole}>{pan.id ? 'Salva' : 'Aggiungi'}</AdmButton>
          </div>
        )}>
        {pan && pan.modo === 'parole' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div style={{ ...H2, marginBottom:6 }}>Etichetta</div>
              <HubInput valore={pan.label} onCambia={v => set('label', v)} placeholder="Come la legge il ristoratore" autoFocus/>
            </div>
            <div>
              <div style={{ ...H2, marginBottom:6 }}>Spiegazione</div>
              <HubArea valore={pan.spiegazione} onCambia={v => set('spiegazione', v)} righe={4} placeholder="Che cosa entra e che cosa cade fuori"/>
              <div style={{ fontSize:12, color:ADM.MUTED_SOFT, marginTop:4 }}>Sta sotto l'etichetta quando il ristoratore crea un articolo.</div>
            </div>
            {!pan.id && (
              <div style={{ padding:'12px 13px', borderRadius:12, border:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:12.5, color:ADM.MUTED, lineHeight:1.45 }}>Le aliquote con cui nasce. Cambiarle dopo si fa dal chip, da una data.</div>
                {['locale', 'asporto'].map(k => (
                  <div key={k}>
                    <div style={{ ...H2, marginBottom:6 }}>{LATI[k].tit}</div>
                    <select value={pan[k]} onChange={e => set(k, e.target.value)} style={{ ...campoStile, cursor:'pointer' }}>
                      {optTr.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <div style={{ ...H2, marginBottom:6 }}>Vale dal</div>
                  <input type="date" min={domani} value={pan.dal} onChange={e => set('dal', e.target.value)} style={{ ...campoStile, width:180 }}/>
                </div>
              </div>
            )}
            {pan.id && (
              <div style={{ fontSize:12.5, color:ADM.MUTED, lineHeight:1.5, padding:'10px 12px', borderRadius:10, background:ADM.PANEL_SOFT }}>
                Le aliquote di questa tipologia — sul posto {tr(originale.locale.profilo).aliquota}%, da asporto {tr(originale.asporto.profilo).aliquota}% — non si toccano da qui: si cambiano dal loro chip, da una data, con la cronologia.
              </div>
            )}
            {pan.ritiro && (
              <div data-ritiro style={{ padding:'12px 13px', borderRadius:12, background:ADM.DANGER_SOFT, border:`1px solid ${ADM.DANGER}40` }}>
                <div style={{ fontSize:13.2, fontWeight:700, color:'#7F1D1D' }}>Ritirare la tipologia</div>
                <div style={{ fontSize:12.4, color:'#7F1D1D', marginTop:3, lineHeight:1.45 }}>
                  Chiude la vigenza da una data. Articoli di menù che la indicano oggi: {uso[pan.id] != null ? uso[pan.id] : '— (il conteggio arriva dal gestionale)'}. A quale tipologia passano?
                </div>
                <select value={pan.ritiro.verso} onChange={e => set('ritiro', { ...pan.ritiro, verso: e.target.value })} style={{ ...campoStile, marginTop:8, cursor:'pointer' }}>
                  {tipVive.filter(x => x.id !== pan.id).map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                  <input type="date" min={domani} value={pan.ritiro.dal} onChange={e => set('ritiro', { ...pan.ritiro, dal: e.target.value })} style={{ ...campoStile, width:160 }}/>
                  <div style={{ flex:1 }}/>
                  <AdmButton variant="ghost" size="sm" onClick={() => set('ritiro', null)}>Annulla</AdmButton>
                  <AdmButton variant="danger" size="sm" icon="x" disabled={!pan.ritiro.verso || !pan.ritiro.dal} onClick={ritira}>Ritira</AdmButton>
                </div>
              </div>
            )}
          </div>
        )}
      </HubPannello>

      {/* ── Il pannello dell'aliquota: la cronologia e il cambio da una data ── */}
      <HubPannello open={!!pan && pan.modo === 'aliquota'} onClose={() => setPan(null)} larghezza={500} icona="receipt" colore="WARN"
        titolo={pan && pan.modo === 'aliquota' ? `${LATI[pan.lato].tit} · ${originale.label}` : ''}
        sotto={pan && pan.modo === 'aliquota' ? 'L\'aliquota cambia da una data, mai riscrivendo quella di oggi: i documenti già emessi restano leggibili col diritto del loro tempo.' : ''}
        footer={pan && pan.modo === 'aliquota' && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {originale[pan.lato].prossimo && <button onClick={annullaProgrammato} style={linkStile(ADM.DANGER)}>Annulla il cambio programmato</button>}
            <div style={{ flex:1 }}/>
            <AdmButton variant="secondary" size="sm" onClick={() => setPan(null)}>Chiudi</AdmButton>
            <AdmButton variant="primary" size="sm" icon="check" disabled={!aliquotaValida} onClick={programma}>{pan.dal <= oggi ? 'Applica' : 'Programma il cambio'}</AdmButton>
          </div>
        )}>
        {pan && pan.modo === 'aliquota' && (() => {
          const cron = hubAliquotaCronologia(originale, pan.lato);
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <div style={{ ...H2, marginBottom:8 }}>Cronologia</div>
                <div data-cronologia-aliquota style={{ position:'relative', paddingLeft:22 }}>
                  <div style={{ position:'absolute', left:6, top:10, bottom:10, width:2, background:ADM.BORDER, borderRadius:2 }}/>
                  {cron.map((c, i) => {
                    const x = tr(c.profilo); const oggiSi = c.stato === 'oggi'; const prog = c.stato === 'programmata';
                    return (
                      <div key={i} data-stato={c.stato} style={{ position:'relative', marginBottom: i === cron.length - 1 ? 0 : 8 }}>
                        <span style={{ position:'absolute', left:-21, top:13, width:12, height:12, borderRadius:'50%', boxSizing:'border-box', background: oggiSi ? ADM.PINK : '#fff', border:`2.5px solid ${oggiSi ? ADM.PINK : prog ? ADM.WARN : ADM.INK_SOFT}`, boxShadow: oggiSi ? `0 0 0 4px ${ADM.PINK_SOFT}` : 'none' }}/>
                        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:`1px solid ${oggiSi ? ADM.PINK_HOVER : prog ? '#F0DCB4' : ADM.BORDER}`, background: prog ? ADM.WARN_SOFT : '#fff', opacity: c.stato === 'passata' ? 0.7 : 1 }}>
                          <span style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.03em', color:ADM.TEXT, fontVariantNumeric:'tabular-nums', minWidth:46 }}>{x.aliquota}%</span>
                          <span style={{ flex:1, minWidth:0, fontSize:12.2, color:ADM.MUTED, lineHeight:1.4 }}>
                            <span style={{ color:ADM.TEXT, fontWeight:700 }}>{x.fondamento}</span> · {HUB_MODALITA_TRATTAMENTO[x.modalita] || x.modalita}
                            <span style={{ display:'block', fontSize:11.5, color:ADM.MUTED_SOFT }}>{c.stato === 'passata' ? `dal ${hubAliquotaFmt(c.dal)} al ${hubAliquotaFmt(c.al)}` : c.stato === 'oggi' ? `dal ${hubAliquotaFmt(c.dal)}${c.al ? ` al ${hubAliquotaFmt(c.al)}` : ''}` : `dal ${hubAliquotaFmt(c.dal)}`}</span>
                          </span>
                          {oggiSi && <HubPillola color="PINK" size="sm" forte>Oggi</HubPillola>}
                          {prog && <HubPillola color="WARN" size="sm">Programmata</HubPillola>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding:'13px 14px', borderRadius:12, border:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:10 }}>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:ADM.TEXT }}>Nuova aliquota da una data</div>
                  <div style={{ fontSize:12.2, color:ADM.MUTED, marginTop:2, lineHeight:1.45 }}>Un trattamento in vigore, oppure uno nuovo se la legge è cambiata: aliquota, modalità e fondamento. {originale[pan.lato].prossimo ? 'Sostituisce il cambio già programmato.' : ''}</div>
                </div>
                <select value={pan.scelta} onChange={e => set('scelta', e.target.value)} style={{ ...campoStile, cursor:'pointer' }}>
                  <option value="">Scegli il trattamento…</option>
                  {optTr.filter(o => o.value !== originale[pan.lato].profilo).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value="__nuovo">Nuovo trattamento… (la legge è cambiata)</option>
                </select>
                {pan.scelta === '__nuovo' && (
                  <div data-nuovo-trattamento style={{ display:'grid', gridTemplateColumns:'90px minmax(0,1fr)', gap:10 }}>
                    <div><div style={{ ...H2, marginBottom:6 }}>Aliquota</div><input placeholder="%" value={pan.nuovo.aliquota} onChange={e => set('nuovo', { ...pan.nuovo, aliquota: e.target.value })} style={{ ...campoStile, fontVariantNumeric:'tabular-nums' }}/></div>
                    <div><div style={{ ...H2, marginBottom:6 }}>Modalità</div>
                      <select value={pan.nuovo.modalita} onChange={e => set('nuovo', { ...pan.nuovo, modalita: e.target.value })} style={{ ...campoStile, cursor:'pointer' }}>
                        {Object.entries(HUB_MODALITA_TRATTAMENTO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select></div>
                    <div style={{ gridColumn:'1 / -1' }}><div style={{ ...H2, marginBottom:6 }}>Fondamento</div><input placeholder="es. voce 121, L. 178/2020" value={pan.nuovo.fondamento} onChange={e => set('nuovo', { ...pan.nuovo, fondamento: e.target.value })} style={campoStile}/></div>
                    <div style={{ gridColumn:'1 / -1' }}><div style={{ ...H2, marginBottom:6 }}>Citazione della norma</div><textarea rows={2} placeholder="Il testo o gli estremi che reggono l'aliquota" value={pan.nuovo.citazione} onChange={e => set('nuovo', { ...pan.nuovo, citazione: e.target.value })} style={{ ...campoStile, resize:'vertical', lineHeight:1.4 }}/></div>
                  </div>
                )}
                <div style={{ padding:'9px 11px', borderRadius:9, background:ADM.WARN_SOFT, border:'1px solid #F0DCB4' }}>
                  <div style={{ fontSize:12, color:'#7A4A0B', fontWeight:700, marginBottom:6 }}>Vale dal — sposta l'aliquota su ogni cassa dalla mezzanotte scelta.</div>
                  <input type="date" min={domani} value={pan.dal} onChange={e => set('dal', e.target.value)} style={{ ...campoStile, width:170 }}/>
                </div>
              </div>
            </div>
          );
        })()}
      </HubPannello>
    </div>
  );
}

const AUDIT_TIPI = [
  { value:'cert',         label:'Certificazioni' },
  { value:'contratto',    label:'Contratti' },
  { value:'team',         label:'Ruoli & team' },
  { value:'accessi',      label:'Accessi' },
  { value:'segnalazione', label:'Segnalazioni' },
  { value:'locale',       label:'Locali' },
  { value:'piano',        label:'Piani' },
  { value:'fatturazione', label:'Fatturazione' },
  { value:'estrazione',   label:'Estrazioni' },
  { value:'broadcast',    label:'Broadcast' },
  // Le azioni della scheda utente (P-144): blocco e sblocco dell'account,
  // movimenti manuali sul saldo fedeltà; e la rimozione di una recensione.
  { value:'utenti',       label:'Utenti app' },
  { value:'moderazione',  label:'Moderazione' },
  // I limiti dei canali cliente (P-168): ogni cambio porta il motivo.
  { value:'limiti',       label:'Limiti dei canali' },
  { value:'piattaforma',  label:'Piattaforma' },
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
  // I coefficienti del piano (P-13/P-14): si edita la BOZZA del listino
  // versionato, mai la versione corrente. Il salvataggio comune persiste la
  // bozza come bozza; pubblicarla è un gesto a parte, che crea la versione
  // nuova efficace dal ciclo successivo e lascia la vecchia nello storico.
  const [pesi, setPesi] = React.useState(() => {
    const b = pesiBozza() || pesiCorrenti();
    return { origine: { ...b.origine }, saldo: { ...b.saldo } };
  });
  const [pubblica, setPubblica] = React.useState(false);
  const [, ridisegnaListino] = React.useState(0);
  // Discovery: la soglia dice QUANTI locali servono, il raggio dice ENTRO CHE
  // DISTANZA contarli. Senza il raggio la soglia non è definita.
  const [disc, setDisc] = React.useState({ raggioCitta:'6', sogliaCitta:'125', raggioRegione:'50', sogliaRegione:'150' });
  // Il tetto degli accrediti (P-69): sotto l'operatore conferma, sopra
  // approva un Super Admin diverso da chi ha disposto. Parte dal registro
  // HUB_LEVE, che Fatturazione legge, e ci torna al salvataggio.
  const [tetto, setTetto] = React.useState(String(HUB_LEVE.accreditoTetto));
  const [, ridisegnaCoda] = React.useState(0);
  const [confirm, setConfirm] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const set = (piano, k) => (e) => { setSaved(false); setCfg(prev => ({ ...prev, [piano]: { ...prev[piano], [k]: e.target.value } })); };
  const setPeso = (dim, k) => (e) => { setSaved(false); setPesi(prev => ({ ...prev, [dim]: { ...prev[dim], [k]: e.target.value } })); };
  const pesoNum = (v) => { const n = parseFloat(v); return isNaN(n) ? null : Math.max(0, Math.min(5, Math.round(n * 20) / 20)); };
  const salvaBozzaPesi = () => {
    const c = pesiCorrenti();
    const origine = {}, saldo = {};
    PESI_SUPERFICI.forEach(sf => { origine[sf.id] = pesoNum(pesi.origine[sf.id]) ?? c.origine[sf.id]; if (sf.saldo) saldo[sf.id] = pesoNum(pesi.saldo[sf.id]) ?? c.saldo[sf.id]; });
    let b = pesiBozza();
    if (!b) { b = { versione: 'v' + (HUB_LISTINO_PESI.length + 1), stato: 'bozza', pubblicata: null, efficace: null, decisaDa: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu', origine, saldo, nota: 'Bozza in lavorazione.' }; HUB_LISTINO_PESI.push(b); }
    else { b.origine = origine; b.saldo = saldo; }
    return b;
  };
  // Pubblicare: la bozza diventa la versione corrente, efficace dal prossimo
  // ciclo; la corrente di prima resta come storica. Nessuna riscrittura.
  const pubblicaBozza = () => {
    const b = salvaBozzaPesi();
    const c = pesiCorrenti();
    const oggi = new Date();
    const efficace = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 1);
    if (c) c.stato = 'storica';
    b.stato = 'corrente'; b.pubblicata = oggi; b.efficace = efficace; b.decisaDa = (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu';
    AUDIT_EVENTS.unshift({ who: b.decisaDa, action: 'ha pubblicato i coefficienti del piano', target: `${b.versione} · efficace dal ${fmtDate(efficace)} · saldo: app ${b.saldo.byup_app}, sala ${b.saldo.staff_hall}, cassa ${b.saldo.staff_counter}`, icon: 'crown', color: 'PURPLE', tipo: 'piano', when: oggi });
    setPubblica(false); ridisegnaListino(x => x + 1);
  };
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
  // «Registrata in audit» lo promettono sia la conferma sia il messaggio di
  // successo: il salvataggio scrive l'evento come ogni altra azione del file.
  const doSave = () => {
    setConfirm(false); setSaved(true);
    HUB_LEVE.accreditoTetto = Math.max(1, parseInt(tetto, 10) || HUB_LEVE.accreditoTetto);
    salvaBozzaPesi();
    AUDIT_EVENTS.unshift({
      who: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu',
      action: 'ha aggiornato la configurazione piattaforma',
      target: `piani e prezzi, bozza dei coefficienti del piano, discovery, tetto accrediti ${HUB_LEVE.accreditoTetto} unità`,
      icon: 'crown', color: 'PURPLE', tipo: 'piano', when: new Date(),
    });
    setTimeout(()=>setSaved(false), 3000);
  };

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
    { id:'pesi',      label:'Coefficienti del piano' },
    { id:'discovery', label:'Discovery' },
    { id:'accrediti', label:'Accrediti', badge: ACCREDITI.filter(a => a.stato === 'in_attesa').length },
    // «Aliquote degli articoli» (P-164 · D-112) al posto della pillola
    // «Dizionari»: l'unico dizionario che il modello dice governato da Hubble
    // — le tipologie dell'articolo con i loro trattamenti IVA — si cura da qui,
    // con il proprio gesto per ogni cambiamento, fuori dal salvataggio comune.
    // Gli altri dizionari (gusti, servizi, certificazioni, allergeni) sono
    // fissi e li servirà il backend: le loro costanti restano nel codice
    // perché le usano altre schermate; è uscita solo la resa in sola lettura.
    { id:'aliquote', label:'Aliquote degli articoli' },
    // I documenti contrattuali e informativi. Stanno in Piattaforma e non
    // altrove perché pubblicare una versione tocca tutti i locali, tutto lo
    // staff e tutti gli utenti insieme: è il peso che questa sezione già
    // porta. Fuori dal salvataggio comune, come le Aliquote — una versione si
    // pubblica con il suo gesto, non con «Salva».
    { id:'documenti', label:'Documenti' },
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
            }}>{v.label}{v.badge ? <span style={{marginLeft:6, padding:'1px 6px', borderRadius:99, background: attiva ? 'rgba(255,255,255,0.22)' : ADM.WARN_SOFT, color: attiva ? '#fff' : ADM.WARN, fontSize:11.5, fontWeight:800}}>{v.badge}</span> : null}</button>
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

      {vista === 'pesi' && (() => {
        const corrente = pesiCorrenti();
        const storiche = HUB_LISTINO_PESI.filter(v => v.stato === 'storica');
        const lettura = (v) => { const n = pesoNum(v); return n == null ? '—' : n === 1 ? 'Peso pieno' : n === 0 ? 'Non conteggiata' : n < 1 ? `Sconta il ${Math.round((1 - n) * 100)}%` : `Conta ${n}×`; };
        const colonna = (dim, titolo, sotto) => (
          <div style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
            <div style={{fontSize:13.5, fontWeight:800, color:ADM.TEXT}}>{titolo}</div>
            <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:2, marginBottom:12, lineHeight:1.45}}>{sotto}</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {PESI_SUPERFICI.filter(sf => dim === 'origine' || sf.saldo).map(sf => {
                const v = pesi[dim][sf.id];
                return (
                  <div key={sf.id} style={{display:'grid', gridTemplateColumns:'minmax(0,1.4fr) 92px minmax(0,1fr)', gap:10, alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{sf.label} <span style={{fontFamily:'ui-monospace,monospace', fontSize:11, color:ADM.MUTED_SOFT}}>{sf.id}</span></div>
                      <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, lineHeight:1.4}}>{sf.nota}</div>
                    </div>
                    <input type="number" step="0.05" min="0" max="5" value={v} onChange={setPeso(dim, sf.id)} style={inp}/>
                    <div style={{fontSize:11.8, fontWeight:700, color: pesoNum(v) === 1 ? ADM.MUTED : pesoNum(v) < 1 ? ADM.OK : ADM.WARN}}>
                      {lettura(v)}{corrente && corrente[dim][sf.id] !== pesoNum(v) && pesoNum(v) != null && <span style={{color:ADM.MUTED_SOFT, fontWeight:600}}> · corrente {corrente[dim][sf.id]}</span>}
                    </div>
                  </div>
                );
              })}
              {dim === 'saldo' && (
                <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, lineHeight:1.45, paddingTop:6, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                  La webapp non è una superficie di saldo (orders.settlement_surface, nota v0.15 della Scheda): la comanda nata da QR si salda in app, in sala o alla cassa, e prende quel coefficiente.
                </div>
              )}
            </div>
          </div>
        );
        return (
      <React.Fragment>
      <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.5}}>
        Quanto ogni <strong>comanda</strong> consuma del pacchetto incluso nel piano. L'<strong>origine</strong> dà il peso provvisorio; la <strong>superficie di saldo</strong> dà quello definitivo, che prevale ed è quello che fa la fattura (D-11). I coefficienti sono un listino versionato (D-12): qui si lavora la <strong>bozza</strong>, e pubblicarla crea una versione nuova efficace dal ciclo successivo — la storia non si riscrive.
      </div>
      {corrente && (
        <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', fontSize:12.6, color:ADM.TEXT}}>
          <span style={{padding:'3px 9px', borderRadius:999, background:ADM.OK_SOFT, color:ADM.OK, fontWeight:800, fontSize:11.5, textTransform:'uppercase', letterSpacing:'0.05em'}}>Corrente {corrente.versione}</span>
          <span>efficace dal {fmtDate(corrente.efficace)} · decisa da {corrente.decisaDa} · saldo: app {corrente.saldo.byup_app} · sala {corrente.saldo.staff_hall} · cassa {corrente.saldo.staff_counter}</span>
          <span style={{flex:1}}/>
          <span style={{padding:'3px 9px', borderRadius:999, background:ADM.WARN_SOFT, color:ADM.WARN, fontWeight:800, fontSize:11.5, textTransform:'uppercase', letterSpacing:'0.05em'}}>{(pesiBozza() || {}).versione || 'bozza'} · bozza non pubblicata</span>
        </div>
      )}
      {pesiBozza() && pesiBozza().nota && (
        <div style={{fontSize:12.2, color:'#7A4A0B', background:ADM.WARN_SOFT, border:'1px solid #F0DCB4', borderRadius:10, padding:'9px 12px', lineHeight:1.5}}>{pesiBozza().nota}</div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:12}}>
        {colonna('origine', 'Origine · peso provvisorio', 'Le quattro superfici da cui una comanda nasce. Vale finché la comanda non è saldata, e resta se non lo è mai.')}
        {colonna('saldo', 'Saldo · peso definitivo', 'Le tre superfici su cui una comanda si salda. Prevale sull\'origine: è il coefficiente che fa la fattura.')}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
        <span style={{fontSize:12.2, color:ADM.MUTED_SOFT, flex:1}}>Pubblicare non riscrive la versione corrente: ne crea una nuova, efficace dal primo del mese prossimo, e la corrente resta nello storico.</span>
        <AdmButton variant="secondary" size="sm" icon="crown" onClick={() => setPubblica(true)}>Pubblica la bozza…</AdmButton>
      </div>
      {storiche.length > 0 && (
        <div style={{padding:'12px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
          <div style={{fontSize:11.2, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:ADM.MUTED_SOFT, marginBottom:6}}>Versioni precedenti</div>
          {storiche.map(v => (
            <div key={v.versione} style={{fontSize:12.5, color:ADM.MUTED, padding:'5px 0', borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
              <b style={{color:ADM.TEXT}}>{v.versione}</b> · efficace dal {fmtDate(v.efficace)} · {v.decisaDa} · origine app {v.origine.byup_app}, webapp {v.origine.webapp_guest}, sala {v.origine.staff_hall}, cassa {v.origine.staff_counter} · saldo app {v.saldo.byup_app}, sala {v.saldo.staff_hall}, cassa {v.saldo.staff_counter}
            </div>
          ))}
        </div>
      )}
      {pubblica && (
        <div style={{position:'fixed', inset:0, zIndex:80, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setPubblica(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:440, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Pubblicare la bozza dei coefficienti?</div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
              Diventa la versione corrente, efficace dal primo del mese prossimo, per tutti i locali. La versione di oggi resta nello storico: le fatture già emesse non cambiano. L'azione va in audit col tuo nome.
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="ghost" size="md" onClick={()=>setPubblica(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="md" icon="check" onClick={pubblicaBozza}>Pubblica</AdmButton>
            </div>
          </div>
        </div>
      )}
      </React.Fragment>
        );
      })()}

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

      {vista === 'accrediti' && (
      <React.Fragment>
      <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.5}}>
        L'unità è la comanda. Sotto il <strong>tetto</strong> l'operatore conferma l'accredito da solo; sopra, l'accredito resta in attesa e lo approva un Super Admin <strong>diverso da chi l'ha disposto</strong>: il controllo lo fa il codice sul membro collegato, non la disciplina.
      </div>
      <div style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12, maxWidth:360}}>
        <label style={lab}>Tetto per accredito senza approvazione · unità</label>
        <input type="number" step="50" min="1" value={tetto} onChange={e => { setSaved(false); setTetto(e.target.value); }} style={inp}/>
        <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.4}}>Oggi vale {fmtNum(HUB_LEVE.accreditoTetto)}: si applica al salvataggio, come le altre leve.</div>
      </div>
      {/* La coda del Super Admin: gli accrediti in attesa di tutti i locali,
          con la stessa riga di Fatturazione — e il «L'hai disposto tu» sul
          seme di Marco. Sotto, gli ultimi decisi. */}
      <div style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12}}>
        <div style={{fontSize:13.5, fontWeight:800, color:ADM.TEXT}}>In attesa di approvazione</div>
        {ACCREDITI.filter(a => a.stato === 'in_attesa').length === 0 && <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:6}}>Nessun accredito in attesa.</div>}
        {ACCREDITI.filter(a => a.stato === 'in_attesa').map(a => <AdmAccreditoRiga key={a.id} a={a} conLocale onCambia={() => ridisegnaCoda(x => x + 1)}/>)}
        {ACCREDITI.some(a => a.stato === 'approvato' || a.stato === 'rifiutato') && (
          <React.Fragment>
            <div style={{fontSize:11.5, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:ADM.MUTED_SOFT, marginTop:14}}>Decisi</div>
            {ACCREDITI.filter(a => a.stato === 'approvato' || a.stato === 'rifiutato').map(a => <AdmAccreditoRiga key={a.id} a={a} conLocale/>)}
          </React.Fragment>
        )}
      </div>
      </React.Fragment>
      )}

      {vista === 'aliquote' && <HubAliquoteArticoli/>}

      {/* I documenti hanno il loro gesto — «Pubblica…» — e stanno fuori dal
          salvataggio comune: una versione contrattuale non si salva insieme ai
          prezzi e al raggio della discovery. La pagina si monta da sé. */}
      {vista === 'documenti' && window.HubDocumentiPage && <window.HubDocumentiPage/>}

      {/* Fuori dalle tab: si salva tutto, non la tab aperta. Ma non quando si
          sta guardando qualcosa che il salvataggio non tocca. */}
      {vista !== 'aliquote' && vista !== 'documenti' && (
      <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:10,
        paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
        {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Configurazione salvata e registrata in audit</span>}
        <span style={{flex:1, fontSize:12.2, color:ADM.MUTED_SOFT}}>
          Il salvataggio applica le quattro sezioni di leve, non solo quella aperta.
        </span>
        <AdmButton variant="primary" size="md" icon="check" onClick={()=>setConfirm(true)}>Salva configurazione</AdmButton>
      </div>
      )}

      {confirm && (
        <div style={{position:'fixed', inset:0, zIndex:80, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setConfirm(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:420, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Applicare la nuova configurazione?</div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
              Prezzi e soglie verranno applicati a <strong style={{color:ADM.TEXT}}>tutti i locali</strong> dal prossimo ciclo di fatturazione; i coefficienti del piano restano in bozza finché non li pubblichi dalla loro tab. L'azione viene registrata nell'audit log con il tuo nome.
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
// code di elaborazione. Dati mock. Colore solo per gli stati.
// ─── Limiti dei canali cliente (P-168 · D-118) ──────────────────────────────
// I tre parametri che frenano il VOLUME degli invii da app e webapp: invii
// per sessione nella finestra, righe per invio, tavoli diversi per
// dispositivo nell'ora. Fermano il volume, non il cliente onesto; oltre il
// limite l'invio è respinto con l'attesa scritta, e il tavolo passa a «da
// verificare» in sala. Vivono nel registro condiviso byup_limiti che app e
// webapp leggono; qui si cambiano uno alla volta, con il motivo scritto, e il
// cambio finisce nell'audit log come i parametri di Piattaforma. Sotto, i
// rifiuti del giorno per limite: quante volte, non chi — niente nomi, niente
// tavoli, niente dispositivi. Niente verifica d'identità oltre il telefono
// dell'app, niente ban sul dispositivo, niente blocco per indirizzo di rete.
function TeamLimiti() {
  const [, ridisegna] = React.useState(0);
  React.useEffect(() => {
    const f = () => ridisegna(x => x + 1);
    ['byup-limiti-change', 'byup-limiti-rifiuti-change', 'storage'].forEach(e => window.addEventListener(e, f));
    return () => ['byup-limiti-change', 'byup-limiti-rifiuti-change', 'storage'].forEach(e => window.removeEventListener(e, f));
  }, []);
  const limiti = window.byupReadLimiti ? window.byupReadLimiti() : { invii: { n: 3, minuti: 2 }, righe: 30, tavoli: { n: 5, minuti: 60 } };
  const rifiutiOggi = window.byupReadRifiuti ? window.byupReadRifiuti() : { invii: 0, righe: 0, tavoli: 0 };
  // La giornata del mockup parte da un fondo plausibile; i rifiuti veri che
  // app e webapp scrivono nel registro si sommano sopra.
  const FONDO = { invii: 4, righe: 1, tavoli: 0 };
  const PARAMETRI = [
    { id: 'invii',  label: 'Invii per sessione nella finestra', nota: 'Quante comande può mandare lo stesso tavolo in pochi minuti. Oltre, il cliente legge quanti secondi aspettare.',
      valore: `${limiti.invii.n} in ${limiti.invii.minuti} min`, campi: [{ k: 'n', label: 'Invii', v: limiti.invii.n }, { k: 'minuti', label: 'Minuti', v: limiti.invii.minuti }] },
    { id: 'righe',  label: 'Righe per invio', nota: 'Quante righe può portare una comanda sola. Oltre, il cliente manda quello che c\'è e il resto dopo.',
      valore: `${limiti.righe}`, campi: [{ k: 'righe', label: 'Righe', v: limiti.righe }] },
    { id: 'tavoli', label: 'Tavoli per dispositivo nell\'ora', nota: 'A quanti tavoli diversi può ordinare lo stesso telefono in un\'ora. Le reti mobili condividono l\'indirizzo fra molti: si conta il dispositivo, non la rete.',
      valore: `${limiti.tavoli.n} in ${limiti.tavoli.minuti} min`, campi: [{ k: 'n', label: 'Tavoli', v: limiti.tavoli.n }, { k: 'minuti', label: 'Minuti', v: limiti.tavoli.minuti }] },
  ];
  const [edit, setEdit] = useStateTeam(null); // { id, valori:{k:v}, motivo }
  const [salvato, setSalvato] = useStateTeam(null);
  const apri = (p) => setEdit({ id: p.id, valori: Object.fromEntries(p.campi.map(c => [c.k, String(c.v)])), motivo: '' });
  const numOk = (v) => Number.isInteger(parseInt(v, 10)) && parseInt(v, 10) >= 1;
  const editOk = edit && Object.values(edit.valori).every(numOk) && edit.motivo.trim().length >= 3;
  const salva = () => {
    if (!editOk || !window.byupWriteLimiti) return;
    const p = PARAMETRI.find(x => x.id === edit.id);
    const n = (k) => parseInt(edit.valori[k], 10);
    const nuovo = edit.id === 'righe' ? { righe: n('righe') } : { [edit.id]: { n: n('n'), minuti: n('minuti') } };
    const prima = p.valore;
    window.byupWriteLimiti(nuovo);
    const dopo = edit.id === 'righe' ? `${n('righe')}` : `${n('n')} in ${n('minuti')} min`;
    AUDIT_EVENTS.unshift({
      who: (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu',
      action: 'ha cambiato un limite dei canali cliente',
      target: `${p.label}: ${prima} → ${dopo} · ${edit.motivo.trim()}`,
      icon: 'lock', color: 'PURPLE', tipo: 'limiti', when: new Date(),
    });
    setSalvato(p.id); setEdit(null); ridisegna(x => x + 1);
    setTimeout(() => setSalvato(null), 3000);
  };
  const inp = {width: 90, padding:'7px 10px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none', boxSizing:'border-box'};
  const lab = {fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};
  const totRifiuti = PARAMETRI.reduce((a, p) => a + FONDO[p.id] + (rifiutiOggi[p.id] || 0), 0);
  return (
    <div style={{padding:'18px 22px 22px'}}>
      <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:16, maxWidth:720}}>
        I limiti fermano il volume degli invii dall'app e dalla webapp, non il cliente: oltre il limite l'invio è respinto con l'attesa scritta e il tavolo passa a «da verificare» in sala. Ogni modifica chiede un motivo e finisce nell'audit log. Nessuna verifica d'identità, nessun ban sul dispositivo, nessun blocco per indirizzo di rete.
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:12, marginBottom:22}}>
        {PARAMETRI.map(p => {
          const inEdit = edit && edit.id === p.id;
          return (
            <div key={p.id} data-limite={p.id} style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, padding:'14px 16px', background:'#fff'}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:700, color:ADM.TEXT}}>{p.label}</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, lineHeight:1.5, marginTop:3}}>{p.nota}</div>
                </div>
                <div style={{fontSize:20, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>{p.valore}</div>
              </div>
              {!inEdit && (
                <div style={{display:'flex', alignItems:'center', gap:10, marginTop:12}}>
                  <AdmButton variant="secondary" size="sm" onClick={() => apri(p)}>Modifica</AdmButton>
                  {salvato === p.id && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:600}}>Salvato e registrato in audit</span>}
                </div>
              )}
              {inEdit && (
                <div style={{marginTop:12, paddingTop:12, borderTop:`1px solid ${ADM.BORDER}`}}>
                  <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:10}}>
                    {p.campi.map(c => (
                      <div key={c.k}>
                        <label style={lab}>{c.label}</label>
                        <input type="number" min="1" step="1" value={edit.valori[c.k]} style={inp}
                          onChange={e => setEdit({ ...edit, valori: { ...edit.valori, [c.k]: e.target.value } })}/>
                      </div>
                    ))}
                  </div>
                  <label style={lab}>Motivo</label>
                  <textarea value={edit.motivo} onChange={e => setEdit({ ...edit, motivo: e.target.value })} placeholder="Perché cambia: senza motivo non è evidenza" rows={2}
                    style={{width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13, fontFamily:'inherit', color:ADM.TEXT, resize:'vertical', boxSizing:'border-box', outline:'none'}}/>
                  <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:10}}>
                    <AdmButton variant="secondary" size="sm" onClick={() => setEdit(null)}>Annulla</AdmButton>
                    <AdmButton variant="primary" size="sm" disabled={!editOk} onClick={salva}>Salva</AdmButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rifiuti di oggi</div>
      <div style={{fontSize:12.5, color:ADM.MUTED, marginBottom:12}}>Quante volte un invio è stato respinto, per limite. Quante, non chi: qui non ci sono nomi, tavoli né dispositivi.</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, maxWidth:720}}>
        {PARAMETRI.map(p => (
          <div key={p.id} data-rifiuti={p.id} style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, padding:'12px 14px', background:ADM.PANEL_SOFT}}>
            <div style={{fontSize:24, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{FONDO[p.id] + (rifiutiOggi[p.id] || 0)}</div>
            <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>{p.label}</div>
          </div>
        ))}
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, padding:'12px 14px', background:'#fff'}}>
          <div style={{fontSize:24, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{totRifiuti}</div>
          <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>In tutto</div>
        </div>
      </div>
    </div>
  );
}

function PlatformDiagnostica() {
  const SERVIZI = [
    { nome:'App cliente',       uptime:'99,98%', latenza:'142 ms', stato:'ok' },
    { nome:'Gestionale',        uptime:'99,95%', latenza:'188 ms', stato:'ok' },
    { nome:'API ordini',        uptime:'99,99%', latenza:'96 ms',  stato:'ok' },
    { nome:'Pagamenti (Stripe)',uptime:'99,71%', latenza:'310 ms', stato:'warn', nota:'uptime sotto la soglia interna del 99,9%' },
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
  const dot = (stato) => (
    <span style={{width:9, height:9, borderRadius:'50%', background: stato==='ok' ? ADM.OK : ADM.WARN, display:'inline-block', flexShrink:0}}/>
  );
  // Lo stato dei servizi è quello scritto sopra e basta: il registro degli
  // incidenti, che lo correggeva quando ce n'era uno aperto, se n'è andato con
  // Risk Management.
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
    </div>
  );
}

// ─── Accessi: chi ha accesso, gli inviti, la revoca (D-44 · P-56) ────────────
// Il riesame periodico dei diritti di accesso (ISO/IEC 27001 A.5.18) non è
// più un rito dentro il prodotto: si svolge su foglio di calcolo, e il rito
// è nel documento tecnico 12.2 (D-44). Qui resta ciò che il prodotto fa davvero:
// mostrare chi ha accesso e con quale ruolo, gli inviti in attesa, e revocare
// un accesso con un motivo, che è evidenza e finisce nell'audit log. Niente
// conferme, niente campagne, niente firma, niente revoca multipla.
const acFmtData = (d) => d ? d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const acGiorniFa = (d) => d ? Math.floor((Date.now() - d.getTime()) / 86400000) : null;

function AccessiList() {
  const [revocati, setRevocati] = useStateTeam({});      // id → { quando, motivo }
  const [dettaglio, setDettaglio] = useStateTeam(null);
  const [revoca, setRevoca] = useStateTeam(null);
  const [motivo, setMotivo] = useStateTeam('');
  const me = hubUtenteCorrente();
  const IO = (TEAM.find(t => t.isYou) || {}).nomeCompleto || 'Tu';
  const membri = TEAM.filter(m => m.attivo !== false && !m.pending && !revocati[m.id]);
  const puoRevocare = hubPuo('sicurezza', 'scrittura');

  const confermaRevoca = () => {
    if (!revoca || !motivo.trim()) return;
    const quando = new Date();
    setRevocati(prev => ({ ...prev, [revoca.id]: { quando, motivo: motivo.trim() } }));
    AUDIT_EVENTS.unshift({ who: IO, action: 'ha revocato l\'accesso di', target: `${revoca.nome} · ${admLabelRuolo(revoca.ruolo)} · ${motivo.trim()}`, icon: 'lock', color: 'DANGER', tipo: 'accessi', when: quando });
    setRevoca(null); setMotivo(''); setDettaglio(null);
  };

  // L'esportazione promessa (P-156.3): l'elenco in CSV, una riga per persona,
  // con le colonne che la scheda mostra. Il riesame periodico si fa fuori dal
  // prodotto su foglio (A.5.18, D-44): senza questo file la frase prometteva
  // un lavoro che non si poteva fare. L'estrazione lascia traccia nell'audit.
  const esportaCsv = () => {
    const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const oggi = new Date();
    const righe = membri.map(m => {
      const gg = acGiorniFa(m.lastActive);
      return [m.nomeCompleto || m.nome, m.email || '', admLabelRuolo(m.ruolo), m.lastActive ? new Date(m.lastActive).toLocaleDateString('it-IT') : '', gg == null ? '' : gg, gg != null && gg >= 90 ? 'sì' : 'no'].map(q).join(';');
    });
    const csv = '\ufeff' + ['Persona;Email;Ruolo;Ultimo accesso;Giorni dall\'ultimo accesso;Dormiente (90+ giorni)', ...righe].join('\n');
    try {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = `hubble-accessi-${oggi.toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {}
    AUDIT_EVENTS.unshift({ who: IO, action: 'ha esportato l\'elenco degli accessi', target: `${membri.length} persone · riesame periodico`, icon: 'download', color: 'INFO', tipo: 'estrazione', when: oggi });
  };

  const H = { fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 };
  const GRID = 'minmax(0,2.6fr) 1.15fr 1fr 26px';
  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>
      {me.demo && (
        <div style={{padding:'10px 14px', borderRadius:10, background:ADM.PINK_BG_SOFT, border:`1px solid #FFA9BF`, fontSize:13, color:ADM.TEXT}}>
          Stai guardando Hubble come <b>{admLabelRuolo(me.ruolo)}</b> (demo, <code>?ruolo=</code>): i gesti che questo preset non può fare sono spenti, col perché.
        </div>
      )}

      <InvitiPending/>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={H}>Chi ha accesso · {membri.length}</div>
          <div style={{flex:1}}/>
          <div style={{fontSize:12.5, color:ADM.MUTED}}>Il riesame periodico si fa fuori dal prodotto, su foglio (A.5.18, D-44): da qui si esporta l'elenco e si revoca.</div>
          <AdmButton variant="secondary" size="sm" icon="download" onClick={esportaCsv}>Esporta CSV</AdmButton>
        </div>
        <div style={{display:'grid', gridTemplateColumns:GRID, gap:12, padding:'0 12px 8px', fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em'}}>
          <span>Persona</span><span>Ruolo</span><span>Ultimo accesso</span><span/>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          {membri.map(m => {
            const gg = acGiorniFa(m.lastActive);
            const dormiente = gg != null && gg >= 90;
            return (
              <div key={m.id} className="adm-row" onClick={() => setDettaglio(m)} style={{
                display:'grid', gridTemplateColumns:GRID, gap:12, alignItems:'center', padding:'11px 12px', borderRadius:10, cursor:'pointer',
                background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`,
              }}>
                <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
                  <AdmAvatar name={m.nome} bg={m.avatarBg} size={34}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.nomeCompleto || m.nome}{m.isYou ? ' (tu)' : ''}</div>
                    <div style={{fontSize:12, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.email}</div>
                    {!m.due_fa && (
                      <span style={{display:'inline-flex', alignItems:'center', gap:4, padding:'2px 7px', borderRadius:99, background:ADM.WARN_SOFT, marginTop:5}}>
                        <BuIcons.shield size={12} color={ADM.WARN}/><span style={{fontSize:11.2, fontWeight:700, color:ADM.WARN}}>2FA off</span>
                      </span>
                    )}
                  </div>
                </div>
                <div><AdmBadge color={(RUOLI[m.ruolo] && RUOLI[m.ruolo].color) || 'PLAN_FREE'}>{admLabelRuolo(m.ruolo)}</AdmBadge></div>
                <div style={{fontSize:12.8, color: dormiente ? ADM.DANGER : ADM.TEXT, fontWeight: dormiente ? 700 : 500}}>
                  {m.lastActive ? (gg === 0 ? 'oggi' : gg === 1 ? 'ieri' : `${gg} giorni fa`) : 'mai'}
                </div>
                <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.5}}>
          La revoca chiede un motivo e finisce nell'audit log con autore e orario. Le utenze da tempo inattive sono in rosso: sono un fatto sull'ultimo accesso, non un giudizio.
        </div>
      </div>

      {dettaglio && (() => {
        const m = dettaglio; const gg = acGiorniFa(m.lastActive);
        const liv = admLivelliDi(m.ruolo, m);
        const scrive = AREE.filter(a => liv[a.id] === 'scrittura' && !a.riservata).map(a => a.label);
        const legge = AREE.filter(a => liv[a.id] === 'lettura' && !a.riservata).map(a => a.label);
        return (
          <div onClick={() => setDettaglio(null)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
            <div onClick={e => e.stopPropagation()} style={{width:520, maxWidth:'92%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
                <AdmAvatar name={m.nome} bg={m.avatarBg} size={40}/>
                <div style={{minWidth:0, flex:1}}>
                  <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT}}>{m.nomeCompleto || m.nome}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED}}>{m.email}</div>
                </div>
              </div>
              <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
                {[
                  ['Ruolo', admLabelRuolo(m.ruolo)],
                  ['Nel team dal', acFmtData(m.addedOn)],
                  ['Ultimo accesso', m.lastActive ? (gg === 0 ? 'oggi' : gg === 1 ? 'ieri' : `${gg} giorni fa`) : 'mai'],
                  ['Secondo fattore', m.due_fa ? 'attivo' : 'non attivo'],
                  ['Scrive su', scrive.length ? scrive.join(', ') : '—'],
                  ['Legge', legge.length ? legge.join(', ') : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
                    <span style={{color:ADM.MUTED, width:126, flexShrink:0}}>{k}</span>
                    <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                {!m.isYou && (
                  <AdmButton variant="ghost" size="sm" style={{color:ADM.DANGER, borderColor:'rgba(220,38,38,0.28)'}} disabled={!puoRevocare}
                    title={puoRevocare ? undefined : 'Serve Scrittura su Sicurezza e sistemi'}
                    onClick={() => { setRevoca(m); setMotivo(''); }}>Revoca l'accesso</AdmButton>
                )}
                {m.isYou && <span style={{fontSize:12.5, color:ADM.MUTED}}>Il tuo accesso viene dal ruolo: si cambia fuori da qui.</span>}
                <div style={{flex:1}}/>
                <AdmButton variant="secondary" size="sm" onClick={() => setDettaglio(null)}>Chiudi</AdmButton>
              </div>
            </div>
          </div>
        );
      })()}

      {revoca && (
        <div onClick={() => setRevoca(null)} style={{position:'fixed', inset:0, zIndex:61, background:'rgba(15,17,21,0.42)', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
          <div onClick={e => e.stopPropagation()} style={{width:480, maxWidth:'92%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>Revocare l'accesso di {revoca.nomeCompleto || revoca.nome}?</div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:12}}>Le sue sessioni vengono terminate e l'utenza esce dall'elenco. Il motivo è obbligatorio: senza motivo non è evidenza.</div>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo della revoca" rows={3}
              style={{width:'100%', boxSizing:'border-box', padding:'9px 11px', borderRadius:8, border:`1px solid ${ADM.BORDER}`, fontSize:13.5, fontFamily:'inherit', resize:'vertical'}}/>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
              <AdmButton variant="secondary" size="sm" onClick={() => setRevoca(null)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" disabled={!motivo.trim()} onClick={confermaRevoca}>Revoca</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AdmTeamPage = AdmTeamPage;

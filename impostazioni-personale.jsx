// Impostazioni → Personale (rifatto: ruoli predefiniti + custom, permessi area-based, no dispositivi)

const ROLES = [
  {
    id: 'proprietario',
    label: 'Proprietario',
    desc: 'Vede tutto · uno solo, è chi ha creato il gestionale',
    color: PN.WINE, bg: PN.WINE_SOFT,
    icon: 'crown',
    locked: true,
    areas: ['panoramica','sala','cucina','app','statistiche','contabilita','supporto','impostazioni'],
  },
  {
    id: 'manager',
    label: 'Manager',
    desc: 'Vede Sala & Prenotazioni e Panoramica',
    color: PN.BLUE, bg: PN.BLUE_SOFT,
    icon: 'user',
    areas: ['panoramica','sala'],
  },
  {
    id: 'cameriere',
    label: 'Cameriere',
    desc: 'Visibilità solo dall\'app cameriere',
    color: PN.PINK_DARK, bg: PN.PINK_SOFT,
    icon: 'user',
    areas: ['app'],
  },
];

// Dispositivi senza credenziali email — accesso con username/password locali
const DEVICE_TYPES = [
  {
    id: 'kitchen-monitor',
    label: 'Monitor cucina',
    desc: 'Tablet/iPad/schermo che mostra gli ordini in cucina',
    color: PN.GREEN, bg: PN.GREEN_SOFT,
    icon: 'chef',
    placeholder: 'Monitor cucina',
  },
];

const ALL_AREAS = [
  { id: 'panoramica', label: 'Panoramica', icon: 'stats' },
  { id: 'sala', label: 'Sala & prenotazioni', icon: 'utensils' },
  { id: 'cucina', label: 'Cucina', icon: 'chef' },
  { id: 'app', label: 'App cameriere', icon: 'phone' },
  { id: 'statistiche', label: 'Statistiche', icon: 'stats' },
  { id: 'contabilita', label: 'Contabilità', icon: 'money' },
  { id: 'supporto', label: 'Supporto', icon: 'chat' },
  { id: 'impostazioni', label: 'Impostazioni', icon: 'settings' },
];

const SETTINGS_PAGES = [
  { id: 'vetrina', label: 'Vetrina', icon: 'storefront' },
  { id: 'menu-cucina', label: 'Menù', icon: 'utensils' },
  { id: 'sala', label: 'Sala e tavoli', icon: 'utensils' },
  { id: 'personale', label: 'Personale', icon: 'users' },
  { id: 'flussi', label: 'Operazioni', icon: 'bolt' },
  { id: 'fiscali', label: 'Dati fiscali locale', icon: 'doc' },
  { id: 'integrazioni', label: 'POS e integrazioni', icon: 'plug' },
];

const PERSONS = [
  { name: 'Marco Silvestri', email: 'marco@delborgo.it', role: 'proprietario', last: 'ora', online: true, color: '#7c2436' },
  { name: 'Davide Rossi', email: 'davide@delborgo.it', role: 'manager', last: 'ieri', online: false, color: '#85B8CB' },
  { name: 'Giovanni Rana', email: 'giovanni@delborgo.it', role: 'cameriere', last: '2 min fa', online: true, color: '#E8A87C' },
  { name: 'Sara Conti', email: 'sara@delborgo.it', role: 'cameriere', last: '1 ora fa', online: false, color: '#FFC09F' },
];

const DEVICES = [
  { name: 'Monitor cucina principale', username: 'PG1-cucina', deviceType: 'kitchen-monitor', last: 'ora', online: true },
  { name: 'Monitor pizza', username: 'PG1-pizza', deviceType: 'kitchen-monitor', last: '5 min fa', online: true },
];

const PENDING = [
  { email: 'andrea@delborgo.it', role: 'cameriere', sent: '3 giorni fa' },
  { email: 'francesca@delborgo.it', role: 'cameriere', sent: '1 giorno fa' },
];

// Ruoli custom creati dall'utente — appaiono insieme ai ruoli standard
const CUSTOM_ROLES = [
  {
    id: 'sommelier',
    label: 'Sommelier',
    desc: 'Gestisce la carta dei vini e vede le prenotazioni',
    color: '#7c2436', bg: '#F5E5EA',
    icon: 'user',
    custom: true,
    areas: ['sala','app'],
  },
];

function ImpPersonale() {
  const [section, setSection] = React.useState('persone');
  const [openMenu, setOpenMenu] = React.useState(null);
  const [showCreateRole, setShowCreateRole] = React.useState(false);
  const [showInvite, setShowInvite] = React.useState(false);
  const [pulseRole, setPulseRole] = React.useState(false);

  // Auto-pulse ogni 6s sul bottone "Crea ruolo"
  React.useEffect(() => {
    if (section !== 'ruoli') return;
    const tick = () => { setPulseRole(true); setTimeout(()=>setPulseRole(false), 1400); };
    tick();
    const id = setInterval(tick, 6000);
    return () => clearInterval(id);
  }, [section]);

  // Click outside per chiudere menu
  React.useEffect(() => {
    if (openMenu === null) return;
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenu]);

  const sections = [
    { id: 'persone', label: 'Persone e dispositivi', count: PERSONS.length + DEVICES.length, icon: 'users' },
    { id: 'inviti', label: 'Inviti pendenti', count: PENDING.length, icon: 'mail' },
    { id: 'ruoli', label: 'Ruoli e permessi', count: ROLES.length + CUSTOM_ROLES.length, icon: 'shield' },
  ];

  return (
    <div>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,79,139,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(239,79,139,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <ImpCard
        title="Persone del team"
        sub="Chi può accedere al gestionale e con quale ruolo"
        action={
          section === 'ruoli'
            ? <ImpButton
                variant="primary"
                icon={<PnI.Plus size={13}/>}
                onClick={() => setShowCreateRole(true)}
                style={{
                  animation: pulseRole ? 'pulseGlow 1.4s ease-out' : 'none',
                  position:'relative', overflow:'hidden',
                }}
              >Crea ruolo personalizzato</ImpButton>
            : <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => setShowInvite(true)}>Aggiungi membro/dispositivo</ImpButton>
        }
      >
        <div style={{display:'flex', gap: 7, flexWrap:'wrap', marginBottom: 18}}>
          {sections.map(s => {
            const on = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                padding: '8px 14px', borderRadius: 999,
                border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                background: on ? PN.TEXT : PN.WHITE,
                color: on ? PN.WHITE : PN.TEXT,
                fontSize: 12.5, fontWeight: 600,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 7,
              }}>
                {(BuIcons[s.icon]||BuIcons.doc)({size: 13, color: 'currentColor'})}
                {s.label}
                <span style={{
                  fontSize: 11, padding:'1px 7px', borderRadius: 999,
                  background: on ? 'rgba(255,255,255,0.2)' : '#F4F5F7',
                  color: on ? PN.WHITE : PN.MUTED,
                }}>{s.count}</span>
              </button>
            );
          })}
        </div>

        {section === 'persone' && <PersonsList openMenu={openMenu} setOpenMenu={setOpenMenu}/>}
        {section === 'inviti' && <PendingList/>}
        {section === 'ruoli' && <RolesList onCreate={() => setShowCreateRole(true)} pulse={pulseRole}/>}
      </ImpCard>

      {showCreateRole && <CreateRoleModal onClose={() => setShowCreateRole(false)}/>}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)}/>}
    </div>
  );
}

function InviteModal({ onClose }) {
  const [kind, setKind] = React.useState('person'); // 'person' | 'device'

  // Persona
  const [email, setEmail] = React.useState('');
  const [roleId, setRoleId] = React.useState('cameriere');
  const [msg, setMsg] = React.useState('');
  const role = ROLES.find(r => r.id === roleId);
  const personValid = /\S+@\S+\.\S+/.test(email);

  // Dispositivo
  const [deviceTypeId, setDeviceTypeId] = React.useState('kitchen-monitor');
  const [deviceName, setDeviceName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [openTypeMenu, setOpenTypeMenu] = React.useState(false);
  const deviceType = DEVICE_TYPES.find(t => t.id === deviceTypeId) || DEVICE_TYPES[0];
  const deviceValid = username.trim().length > 0 && password.length >= 4;

  const generatePwd = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p = '';
    for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random()*chars.length)];
    setPassword(p);
    setShowPwd(true);
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16,
        width: 540, maxWidth:'100%', position:'relative',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{padding: '20px 24px', borderBottom: `1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize: 17, fontWeight: 800, marginBottom: 3}}>Aggiungi un membro / dispositivo</div>
          <div style={{fontSize: 12.5, color: PN.MUTED}}>
            {kind === 'person'
              ? 'Invia un invito email per attivare l\'accesso al gestionale'
              : 'Crea credenziali locali (username/password) per il dispositivo'}
          </div>
          <button onClick={onClose} style={{
            position:'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 8,
            background:'#F4F5F7', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={14}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow:'auto', flex: 1}}>
          {/* Type switcher: Persona | Dispositivo */}
          <ImpField label="Tipo">
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8,
              padding: 4, background:'#F4F5F7', borderRadius: 10,
            }}>
              {[
                { id:'person', label:'Persona con email', sub:'cameriere, manager…', icon:'user' },
                { id:'device', label:'Dispositivo', sub:'monitor cucina', icon:'monitor' },
              ].map(opt => {
                const on = kind === opt.id;
                return (
                  <button key={opt.id} onClick={() => setKind(opt.id)} style={{
                    padding:'10px 12px', textAlign:'left',
                    background: on ? PN.WHITE : 'transparent',
                    border: on ? `1.5px solid ${PN.PINK}` : '1.5px solid transparent',
                    borderRadius: 8, cursor:'pointer', fontFamily:'inherit',
                    boxShadow: on ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    display:'flex', alignItems:'center', gap: 10,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7,
                      background: on ? PN.PINK_SOFT : PN.WHITE,
                      color: on ? PN.PINK_DARK : PN.MUTED,
                      display:'grid', placeItems:'center', flexShrink: 0,
                    }}>{(BuIcons[opt.icon]||BuIcons.user)({size: 14, color:'currentColor'})}</div>
                    <div style={{minWidth: 0}}>
                      <div style={{fontSize: 12.5, fontWeight: 700, color: on ? PN.TEXT : PN.MUTED}}>{opt.label}</div>
                      <div style={{fontSize: 10.5, color: PN.MUTED, marginTop: 1}}>{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ImpField>

          {kind === 'person' && (
            <>
              <ImpField label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@delborgo.it"
                  style={{
                    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                    borderRadius:9, fontSize:13.5, fontFamily:'inherit', outline:'none',
                  }}
                />
              </ImpField>

              <div style={{fontSize: 12.5, fontWeight: 700, marginBottom: 8, marginTop: 4}}>
                Ruolo
              </div>
              <div style={{fontSize: 11.5, color: PN.MUTED, marginBottom: 10}}>
                Determina cosa potrà vedere e fare nel gestionale
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 6, marginBottom: 16}}>
                {ROLES.filter(r => !r.locked).map(r => {
                  const on = roleId === r.id;
                  return (
                    <label key={r.id} style={{
                      display:'flex', alignItems:'center', gap: 12,
                      padding: '10px 14px',
                      border: `1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                      background: on ? PN.PINK_SOFT : PN.WHITE,
                      borderRadius: 10, cursor:'pointer', transition:'all 0.15s',
                    }}>
                      <input type="radio" name="role" checked={on} onChange={() => setRoleId(r.id)} style={{accentColor: PN.PINK}}/>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: r.bg, color: r.color,
                        display:'grid', placeItems:'center'
                      }}>{(BuIcons[r.icon]||BuIcons.user)({size: 16, color: 'currentColor'})}</div>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: 13, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{r.label}</div>
                        <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 1}}>{r.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <ImpField label="Messaggio (opzionale)">
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Ciao! Ti invito ad entrare nel gestionale del nostro ristorante…"
                  rows={3}
                  style={{
                    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                    borderRadius:9, fontSize:13.5, fontFamily:'inherit', outline:'none', resize:'vertical',
                  }}
                />
              </ImpField>
            </>
          )}

          {kind === 'device' && (
            <>
              {/* Tipo dispositivo come dropdown nativo */}
              <ImpField label="Tipo dispositivo">
                <div style={{position:'relative'}}>
                  <button
                    onClick={() => setOpenTypeMenu(o => !o)}
                    style={{
                      width:'100%', padding:'10px 14px',
                      border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                      background: PN.WHITE, cursor:'pointer', fontFamily:'inherit',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      fontSize: 13.5, color: PN.TEXT,
                    }}
                  >
                    <span style={{display:'inline-flex', alignItems:'center', gap: 10}}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: deviceType.bg, color: deviceType.color,
                        display:'grid', placeItems:'center',
                      }}>{(BuIcons.monitor||BuIcons.phone)({size: 13, color:'currentColor'})}</span>
                      <span>Tablet/iPad/Schermo ({deviceType.label})</span>
                    </span>
                    <PnI.ChevronDown size={14}/>
                  </button>
                  {openTypeMenu && DEVICE_TYPES.length > 1 && (
                    <div style={{
                      position:'absolute', top:'calc(100% + 4px)', left: 0, right: 0,
                      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                      borderRadius: 10, padding: 4, zIndex: 5,
                      boxShadow:'0 8px 24px rgba(0,0,0,0.08)',
                    }}>
                      {DEVICE_TYPES.map(t => (
                        <button key={t.id} onClick={() => { setDeviceTypeId(t.id); setOpenTypeMenu(false); }}
                          style={{
                            display:'flex', width:'100%', alignItems:'center', gap: 10,
                            padding:'8px 10px', background:'transparent', border:'none',
                            borderRadius: 7, fontSize:13, fontFamily:'inherit', cursor:'pointer', textAlign:'left',
                          }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: t.bg, color: t.color,
                            display:'grid', placeItems:'center',
                          }}>{(BuIcons.monitor||BuIcons.phone)({size: 12, color:'currentColor'})}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ImpField>

              <ImpField label="Nome dispositivo" hint="Come lo riconoscerete in lista (es. Monitor pizza, Monitor sushi)">
                <input
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  placeholder={deviceType.placeholder}
                  style={{
                    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                    borderRadius:9, fontSize:13.5, fontFamily:'inherit', outline:'none',
                  }}
                />
              </ImpField>

              <ImpField label="Username" required>
                <div style={{display:'flex', alignItems:'stretch', gap: 0}}>
                  <span style={{
                    padding:'10px 12px',
                    background:'#F4F5F7', border:`1px solid ${PN.BORDER}`, borderRight:'none',
                    borderRadius:'9px 0 0 9px',
                    fontSize: 13, fontWeight: 700, color: PN.MUTED,
                    display:'inline-flex', alignItems:'center',
                    fontFamily:'ui-monospace, Menlo, monospace',
                  }}>PG1-</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/\s/g,'').toLowerCase())}
                    placeholder="cucina"
                    style={{
                      flex: 1, padding:'10px 12px',
                      border:`1px solid ${PN.BORDER}`, borderLeft:'none',
                      borderRadius:'0 9px 9px 0',
                      fontSize:13.5, fontFamily:'ui-monospace, Menlo, monospace',
                      outline:'none',
                    }}
                  />
                </div>
              </ImpField>

              <ImpField label="Password" required>
                <div style={{display:'flex', gap: 8, alignItems:'stretch'}}>
                  <div style={{position:'relative', flex: 1}}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Inserisci password"
                      style={{
                        width:'100%', padding:'10px 40px 10px 12px',
                        border:`1px solid ${PN.BORDER}`, borderRadius:9,
                        fontSize:13.5, fontFamily:'inherit', outline:'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      aria-label="Mostra/nascondi password"
                      style={{
                        position:'absolute', right: 8, top: '50%',
                        transform:'translateY(-50%)',
                        width: 28, height: 28, borderRadius: 6,
                        background:'transparent', border:'none', cursor:'pointer',
                        display:'grid', placeItems:'center', color: PN.MUTED,
                      }}
                    >{(BuIcons.eye||BuIcons.user)({size: 16, color:'currentColor'})}</button>
                  </div>
                  <button
                    type="button"
                    onClick={generatePwd}
                    style={{
                      padding:'0 14px',
                      background:'#F4F5F7', border:`1px solid ${PN.BORDER}`,
                      borderRadius: 9, cursor:'pointer', fontFamily:'inherit',
                      fontSize: 12, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap',
                    }}
                  >Genera</button>
                </div>
                <div style={{fontSize: 11, color: PN.MUTED, marginTop: 6}}>
                  Salvala in un posto sicuro — la password resta locale al dispositivo.
                </div>
              </ImpField>
            </>
          )}
        </div>

        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          display:'flex', gap: 10, justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{fontSize: 11.5, color: PN.MUTED}}>
            {kind === 'person'
              ? (personValid
                  ? <>Invierà invito a <b style={{color: PN.TEXT}}>{email}</b> come <b style={{color: role.color}}>{role.label}</b></>
                  : 'Inserisci un\'email valida')
              : (deviceValid
                  ? <>Username: <b style={{color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace'}}>PG1-{username}</b></>
                  : 'Compila username e password (min. 4 caratteri)')}
          </div>
          <div style={{display:'flex', gap: 8}}>
            <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            <ImpButton variant="primary" onClick={onClose} disabled={kind === 'person' ? !personValid : !deviceValid}>
              {kind === 'person' ? 'Invia invito' : 'Associa dispositivo'}
            </ImpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonsList({ openMenu, setOpenMenu }) {
  const [filter, setFilter] = React.useState('all');

  // Items unificati: persone (kind='person') + dispositivi (kind='device')
  const allPersons = PERSONS.map(p => ({ ...p, kind:'person' }));
  const allDevices = DEVICES.map(d => ({ ...d, kind:'device' }));
  const all = [...allPersons, ...allDevices];

  const filterChips = [
    { id: 'all', label: 'Tutti', count: all.length },
    ...ROLES.map(r => ({ id: r.id, label: r.label, count: allPersons.filter(p => p.role === r.id).length })),
    { id: 'devices', label: 'Dispositivi', count: allDevices.length },
    { id: 'online', label: 'Online ora', count: all.filter(p => p.online).length },
  ];

  let visible = all;
  if (filter === 'online') visible = visible.filter(p => p.online);
  else if (filter === 'devices') visible = visible.filter(p => p.kind === 'device');
  else if (filter !== 'all') visible = visible.filter(p => p.role === filter);

  return (
    <div>
      <div style={{display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 14}}>
        {filterChips.map(c => {
          const on = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              padding: '6px 12px', borderRadius: 999,
              border: `1px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
              background: on ? PN.PINK_SOFT : PN.WHITE,
              color: on ? PN.PINK_DARK : PN.MUTED,
              fontSize: 12, fontWeight: 600,
              cursor:'pointer', fontFamily:'inherit',
            }}>
              {c.label} <span style={{opacity: 0.7}}>· {c.count}</span>
            </button>
          );
        })}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        {visible.map((p, i) => p.kind === 'device'
          ? <DeviceRow key={i} d={p} idx={i} openMenu={openMenu} setOpenMenu={setOpenMenu}/>
          : <PersonRow key={i} p={p} idx={i} openMenu={openMenu} setOpenMenu={setOpenMenu}/>
        )}
      </div>
    </div>
  );
}

function DeviceRow({ d, idx, openMenu, setOpenMenu }) {
  const t = DEVICE_TYPES.find(x => x.id === d.deviceType) || DEVICE_TYPES[0];
  const isOpen = openMenu === `dev-${idx}`;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14,
      padding:'14px 16px',
      border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 11,
      background: PN.WHITE,
      position:'relative',
    }}>
      <div style={{position:'relative', flexShrink: 0}}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: t.bg, color: t.color,
          display:'grid', placeItems:'center',
        }}>{(BuIcons.monitor||BuIcons.phone||BuIcons.chef)({size: 20, color:'currentColor'})}</div>
        {d.online && (
          <span style={{
            position:'absolute', bottom: -1, right: -1,
            width: 11, height: 11, borderRadius:'50%',
            background: PN.GREEN, border: `2.5px solid ${PN.WHITE}`,
          }}/>
        )}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
          <span style={{fontSize: 14, fontWeight: 700}}>{d.name}</span>
          <span style={{
            fontSize: 10.5, fontWeight: 700,
            padding:'2px 8px', borderRadius: 999,
            background: t.bg, color: t.color,
            display:'inline-flex', alignItems:'center', gap: 4,
          }}>
            {(BuIcons.monitor||BuIcons.phone)({size: 11, color:'currentColor'})} {t.label}
          </span>
        </div>
        <div style={{fontSize: 12, color: PN.MUTED, fontFamily:'ui-monospace, Menlo, monospace'}}>{d.username}</div>
        <div style={{fontSize: 11, color: d.online ? PN.GREEN : PN.MUTED, marginTop: 2, fontWeight: 500}}>
          {d.online ? '● Connesso ora' : `Ultimo accesso · ${d.last}`}
        </div>
      </div>

      <ImpButton variant="ghost" style={{padding:'7px 12px', fontSize: 12}}>Resetta password</ImpButton>
      <button
        onClick={(e) => { e.stopPropagation(); setOpenMenu(isOpen ? null : `dev-${idx}`); }}
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: isOpen ? '#F4F5F7' : 'transparent',
          border:'none', cursor:'pointer', color: PN.MUTED,
          display:'grid', placeItems:'center', fontSize: 18,
        }}
        aria-label="Altre azioni"
      >⋯</button>
      {isOpen && (
        <div onClick={e => e.stopPropagation()} style={{
          position:'absolute', top: 'calc(100% - 8px)', right: 12,
          minWidth: 190, background: PN.WHITE,
          border: `1px solid ${PN.BORDER}`, borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: 6, zIndex: 10,
        }}>
          <MenuItem icon="✏">Rinomina</MenuItem>
          <MenuItem icon="🔑">Genera nuova password</MenuItem>
          <MenuItem icon="⏸">Sospendi accesso</MenuItem>
          <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
          <MenuItem icon="🗑" danger>Scollega dispositivo</MenuItem>
        </div>
      )}
    </div>
  );
}

function PersonRow({ p, idx, openMenu, setOpenMenu }) {
  const role = ROLES.find(r => r.id === p.role) || ROLES[2];
  const initials = p.name.split(' ').map(s => s[0]).join('').slice(0, 2);
  const isOpen = openMenu === idx;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14,
      padding:'14px 16px',
      border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 11,
      background: PN.WHITE,
      position:'relative',
    }}>
      <div style={{position:'relative', flexShrink: 0}}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: p.color, color: PN.WHITE,
          display:'grid', placeItems:'center',
          fontSize: 13.5, fontWeight: 800,
        }}>{initials}</div>
        {p.online && (
          <span style={{
            position:'absolute', bottom: -1, right: -1,
            width: 11, height: 11, borderRadius:'50%',
            background: PN.GREEN, border: `2.5px solid ${PN.WHITE}`,
          }}/>
        )}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
          <span style={{fontSize: 14, fontWeight: 700}}>{p.name}</span>
          <span style={{
            fontSize: 10.5, fontWeight: 700,
            padding:'2px 8px', borderRadius: 999,
            background: role.bg, color: role.color,
            display:'inline-flex', alignItems:'center', gap: 4,
          }}>
            {(BuIcons[role.icon]||BuIcons.user)({size: 11, color: 'currentColor'})} {role.label}
          </span>
        </div>
        <div style={{fontSize: 12, color: PN.MUTED}}>{p.email}</div>
        <div style={{fontSize: 11, color: p.online ? PN.GREEN : PN.MUTED, marginTop: 2, fontWeight: 500}}>
          {p.online ? '● Online ora' : `Ultimo accesso · ${p.last}`}
        </div>
      </div>

      {!role.locked && (
        <>
          <ImpButton variant="ghost" style={{padding:'7px 12px', fontSize: 12}}>Modifica ruolo</ImpButton>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(isOpen ? null : idx); }}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: isOpen ? '#F4F5F7' : 'transparent',
              border:'none', cursor:'pointer', color: PN.MUTED,
              display:'grid', placeItems:'center', fontSize: 18,
            }}
            aria-label="Altre azioni"
          >⋯</button>
          {isOpen && (
            <div onClick={e => e.stopPropagation()} style={{
              position:'absolute', top: 'calc(100% - 8px)', right: 12,
              minWidth: 190, background: PN.WHITE,
              border: `1px solid ${PN.BORDER}`, borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              padding: 6, zIndex: 10,
            }}>
              <MenuItem icon="✉">Invia messaggio</MenuItem>
              <MenuItem icon="🔑">Resetta password</MenuItem>
              <MenuItem icon="⏸">Sospendi accesso</MenuItem>
              <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
              <MenuItem icon="🗑" danger>Rimuovi dal team</MenuItem>
            </div>
          )}
        </>
      )}
      {role.locked && (
        <span style={{
          fontSize: 11, fontWeight: 600, color: PN.MUTED,
          padding:'5px 10px', background: '#F4F5F7', borderRadius: 7,
          display:'inline-flex', alignItems:'center', gap: 5,
        }}>🔒 Non modificabile</span>
      )}
    </div>
  );
}

function MenuItem({ icon, children, danger }) {
  return (
    <button style={{
      display:'flex', alignItems:'center', gap: 9, width:'100%',
      padding:'8px 10px', background:'transparent', border:'none',
      borderRadius: 7, fontSize: 13, fontFamily:'inherit',
      color: danger ? PN.PINK_DARK : PN.TEXT,
      cursor:'pointer', textAlign:'left',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? PN.PINK_SOFT : '#F4F5F7'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{fontSize: 14, width: 16}}>{icon}</span>
      {children}
    </button>
  );
}

function PendingList() {
  if (PENDING.length === 0) {
    return <div style={{padding: 40, textAlign:'center', color: PN.MUTED}}>Nessun invito in attesa</div>;
  }
  return (
    <div>
      <div style={{
        padding:'10px 14px', marginBottom: 12,
        background: PN.AMBER_SOFT, borderRadius: 9,
        fontSize: 12.5, color: '#92400E',
        display:'flex', alignItems:'center', gap: 8,
      }}>
        <span>⏳</span>
        <span>Gli inviti scadono dopo 7 giorni. Puoi rinviarli o revocarli in qualsiasi momento.</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        {PENDING.map((p, i) => {
          const role = ROLES.find(r => r.id === p.role);
          return (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 12,
              padding:'12px 16px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius:'50%',
                background: PN.AMBER_SOFT, color: '#92400E',
                display:'grid', placeItems:'center', fontSize: 16,
              }}>✉</div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 13.5, fontWeight: 700}}>{p.email}</div>
                <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 1}}>
                  Invitato come <b>{role?.label}</b> · {p.sent}
                </div>
              </div>
              <ImpButton variant="ghost" style={{padding:'6px 10px', fontSize: 12}}>Rinvia</ImpButton>
              <button style={{
                padding:'6px 10px',
                background: PN.PINK_SOFT, color: PN.PINK_DARK,
                border:'none', borderRadius: 7,
                fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>Revoca</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RolesList({ onCreate, pulse }) {
  return (
    <div>
      <div style={{
        padding:'12px 14px', marginBottom: 14,
        background: PN.BLUE_SOFT, borderRadius: 9,
        fontSize: 12.5, color: '#1E40AF',
        display:'flex', alignItems:'center', gap: 8,
      }}>
        <span style={{fontSize: 16}}>💡</span>
        <span>I ruoli standard non sono modificabili. Per controlli più granulari, crea un <b>ruolo personalizzato</b>.</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 10}}>
        {[...ROLES, ...CUSTOM_ROLES].map(r => {
          const count = PERSONS.filter(p => p.role === r.id).length;
          return (
            <div key={r.id} style={{
              padding: '14px 16px', borderRadius: 12,
              border: `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
            }}>
              <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10}}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: r.bg, color: r.color,
                  display:'grid', placeItems:'center'
                }}>{(BuIcons[r.icon]||BuIcons.user)({size: 18, color: 'currentColor'})}</div>
                <div style={{flex: 1}}>
                  <div style={{display:'flex', alignItems:'center', gap: 7}}>
                    <span style={{fontSize: 14, fontWeight: 700}}>{r.label}</span>
                    {r.locked && <span style={{fontSize: 11}}>🔒</span>}
                    {r.custom && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3,
                        padding:'2px 6px', borderRadius: 4,
                        background: PN.PINK_SOFT, color: PN.PINK_DARK,
                        textTransform:'uppercase',
                      }}>Personalizzato</span>
                    )}
                  </div>
                  <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 1}}>
                    {count} {count === 1 ? 'persona' : 'persone'}
                  </div>
                </div>
              </div>
              <div style={{fontSize: 12, color: PN.TEXT, opacity: 0.8, marginBottom: 10, lineHeight: 1.4}}>
                {r.desc}
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap: 4}}>
                {ALL_AREAS.map(a => {
                  const has = r.areas.includes(a.id);
                  return has ? (
                    <span key={a.id} style={{
                      fontSize: 10.5, fontWeight: 600,
                      padding:'2px 8px', borderRadius: 999,
                      background: PN.GREEN_SOFT, color: PN.GREEN,
                      display:'inline-flex', alignItems:'center', gap: 4,
                    }}>{(BuIcons[a.icon]||BuIcons.doc)({size: 12, color: 'currentColor'})} {a.label}</span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottone "Crea ruolo" è ora solo nell'header in alto a destra */}
    </div>
  );
}

function CreateRoleModal({ onClose }) {
  const [name, setName] = React.useState('');
  const [areas, setAreas] = React.useState([]);
  const [settingsMode, setSettingsMode] = React.useState('all'); // 'all' | 'custom'
  const [settingsPages, setSettingsPages] = React.useState([]);

  const toggle = (id) => {
    setAreas(areas.includes(id) ? areas.filter(a => a !== id) : [...areas, id]);
  };
  const togglePage = (id) => {
    setSettingsPages(settingsPages.includes(id) ? settingsPages.filter(p => p !== id) : [...settingsPages, id]);
  };
  const settingsSelected = areas.includes('impostazioni');

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16,
        width: 520, maxWidth:'100%', position:'relative',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div style={{fontSize: 17, fontWeight: 800, marginBottom: 3}}>Crea ruolo personalizzato</div>
          <div style={{fontSize: 12.5, color: PN.MUTED}}>Definisci nome e aree visibili</div>
          <button onClick={onClose} style={{
            position:'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 8,
            background:'#F4F5F7', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={14}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow:'auto', flex: 1}}>
          <ImpField label="Nome del ruolo">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Es. Sommelier, Assistente sala, Aiuto cuoco…"
              style={{
                width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                borderRadius:9, fontSize:13.5, fontFamily:'inherit', outline:'none',
              }}
            />
          </ImpField>

          <div style={{fontSize: 12.5, fontWeight: 700, marginBottom: 8, marginTop: 6}}>
            Aree visibili a questo ruolo
          </div>
          <div style={{fontSize: 11.5, color: PN.MUTED, marginBottom: 12}}>
            Seleziona quali aree del gestionale può vedere chi ha questo ruolo
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 6}}>
            {ALL_AREAS.map(a => {
              const on = areas.includes(a.id);
              const isSettings = a.id === 'impostazioni';
              return (
                <React.Fragment key={a.id}>
                  <label style={{
                    display:'flex', alignItems:'center', gap: 12,
                    padding: '10px 14px',
                    border: `1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                    background: on ? PN.PINK_SOFT : PN.WHITE,
                    borderRadius: 10, cursor:'pointer',
                    transition: 'all 0.15s',
                  }}>
                    <input type="checkbox" checked={on} onChange={() => toggle(a.id)} style={{accentColor: PN.PINK, width: 16, height: 16}}/>
                    <span style={{display:'inline-flex'}}>{(BuIcons[a.icon]||BuIcons.doc)({size: 16, color: 'currentColor'})}</span>
                    <span style={{fontSize: 13, fontWeight: 600, color: on ? PN.PINK_DARK : PN.TEXT, flex: 1}}>{a.label}</span>
                    {isSettings && on && (
                      <span style={{fontSize: 11, color: PN.PINK_DARK, fontWeight: 600}}>
                        {settingsMode === 'all' ? 'tutte le pagine' : `${settingsPages.length} pagine`}
                      </span>
                    )}
                  </label>
                  {isSettings && on && (
                    <div style={{
                      marginLeft: 22, marginTop: -2, marginBottom: 4,
                      padding: '12px 14px',
                      background: '#FAFBFC', borderRadius: 10,
                      border: `1px solid ${PN.BORDER_SOFT}`,
                    }}>
                      <div style={{display:'flex', gap: 6, marginBottom: settingsMode === 'custom' ? 12 : 0}}>
                        {[
                          { id: 'all', label: 'Tutte le pagine' },
                          { id: 'custom', label: 'Solo alcune pagine' },
                        ].map(opt => {
                          const sel = settingsMode === opt.id;
                          return (
                            <button key={opt.id} onClick={() => setSettingsMode(opt.id)} style={{
                              padding: '6px 12px', borderRadius: 7,
                              border: `1.5px solid ${sel ? PN.PINK : PN.BORDER}`,
                              background: sel ? PN.WHITE : 'transparent',
                              color: sel ? PN.PINK_DARK : PN.MUTED,
                              fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                            }}>{opt.label}</button>
                          );
                        })}
                      </div>
                      {settingsMode === 'custom' && (
                        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 6}}>
                          {SETTINGS_PAGES.map(p => {
                            const pOn = settingsPages.includes(p.id);
                            return (
                              <label key={p.id} style={{
                                display:'flex', alignItems:'center', gap: 8,
                                padding: '7px 10px',
                                border: `1px solid ${pOn ? PN.PINK : PN.BORDER_SOFT}`,
                                background: pOn ? PN.WHITE : 'transparent',
                                borderRadius: 7, cursor:'pointer',
                              }}>
                                <input type="checkbox" checked={pOn} onChange={() => togglePage(p.id)} style={{accentColor: PN.PINK, width: 13, height: 13}}/>
                                <span style={{display:'inline-flex'}}>{(BuIcons[p.icon]||BuIcons.doc)({size: 13, color: 'currentColor'})}</span>
                                <span style={{fontSize: 11.5, fontWeight: 600, color: pOn ? PN.PINK_DARK : PN.TEXT}}>{p.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          display:'flex', gap: 10, justifyContent:'flex-end',
        }}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" onClick={onClose}>Crea ruolo</ImpButton>
        </div>
      </div>
    </div>
  );
}

window.ImpPersonale = ImpPersonale;

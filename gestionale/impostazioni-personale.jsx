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
    color: '#475569', bg: '#F1F5F9',
    icon: 'chef',
    placeholder: 'Monitor cucina',
  },
];

// Stampanti scoperte sulla rete via ePOS SDK
const AVAILABLE_PRINTERS = [
  { id: 'printer-epson-1',  model: 'Epson TM-T20III',   ip: '192.168.1.101' },
  { id: 'printer-cube-1',   model: 'Cube Custom 12',     ip: '192.168.1.102' },
];

const MENUS = [
  {
    id: 'principale',
    label: 'Menù principale',
    categories: [
      { id: 'antipasti', label: 'Antipasti' },
      { id: 'primi', label: 'Primi' },
      { id: 'secondi', label: 'Secondi' },
      { id: 'dolci', label: 'Dolci' },
      { id: 'bevande', label: 'Bevande' },
    ],
  },
  {
    id: 'pizzeria',
    label: 'Menù pizzeria',
    categories: [
      { id: 'pizze', label: 'Pizze' },
      { id: 'fritti', label: 'Fritti' },
      { id: 'dolci-p', label: 'Dolci' },
      { id: 'bevande-p', label: 'Bevande' },
    ],
  },
  {
    id: 'bar',
    label: 'Carta bar',
    categories: [
      { id: 'cocktail', label: 'Cocktail' },
      { id: 'analcolici', label: 'Analcolici' },
      { id: 'caffetteria', label: 'Caffetteria' },
      { id: 'snack', label: 'Snack' },
    ],
  },
];

// Manteniamo MENU_CATEGORIES per compatibilità con il modal aggiungi
const MENU_CATEGORIES = MENUS[0].categories;

const ALL_AREAS = [
  { id: 'panoramica', label: 'Panoramica', icon: 'stats' },
  { id: 'sala', label: 'Sala e prenotazioni', icon: 'utensils' },
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
  { id: 'fiscali', label: 'Dati fiscali', icon: 'doc' },
  { id: 'integrazioni', label: 'POS e integrazioni', icon: 'plug' },
];

const PERSONS = [
  { name: 'Marco Silvestri', email: 'marco@delborgo.it', role: 'proprietario', last: 'ora', online: true, color: '#7c2436' },
  { name: 'Davide Rossi', email: 'davide@delborgo.it', role: 'manager', last: 'ieri', online: false, color: '#85B8CB' },
  { name: 'Giovanni Rana', email: 'giovanni@delborgo.it', role: 'cameriere', last: '2 min fa', online: true, color: '#E8A87C' },
  { name: 'Sara Conti', email: 'sara@delborgo.it', role: 'cameriere', last: '1 ora fa', online: false, color: '#FFC09F' },
  { name: 'Luca Ferretti', email: 'luca@delborgo.it', role: 'sommelier', last: '3 ore fa', online: false, color: '#7C3AED' },
];

const DEVICES = [
  { name: 'Monitor cucina principale', username: 'PG1-cucina', deviceType: 'kitchen-monitor', last: 'ora', online: true },
  { name: 'Monitor pizza', username: 'PG1-pizza', deviceType: 'kitchen-monitor', last: '5 min fa', online: true },
  { name: 'Cassa principale', printerModel: 'Epson TM-T20III', ip: '192.168.1.101', deviceType: 'printer', last: '2 min fa', online: true, menuId: 'principale', cats: ['antipasti','primi','dolci'] },
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
  const [openMenu, setOpenMenu] = React.useState(null);
  const [showCreateRole, setShowCreateRole] = React.useState(false);
  const [editRole, setEditRole] = React.useState(null);
  const [invite, setInvite] = React.useState(null); // null | { roleId, kind }
  const [showPending, setShowPending] = React.useState(false);
  const [expanded, setExpanded] = React.useState(() => new Set());

  // Click outside per chiudere menu
  React.useEffect(() => {
    if (openMenu === null) return;
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenu]);

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const allRoles = [...ROLES, ...CUSTOM_ROLES];

  return (
    <div>
      <ImpCard
        title="Personale"
        sub="Vedi chi accede al gestionale e con quali permessi, e gestisci persone e dispositivi"
        action={
          <div style={{display:'flex', gap: 8, alignItems:'center'}}>
            <ImpButton
              variant="ghost"
              icon={(BuIcons.mail||BuIcons.doc)({size: 13, color:'currentColor'})}
              onClick={() => setShowPending(true)}
            >Inviti in sospeso ({PENDING.length})</ImpButton>
            <ImpButton
              variant="ghost"
              icon={<PnI.Plus size={13}/>}
              onClick={() => setShowCreateRole(true)}
            >Crea ruolo</ImpButton>
            <ImpButton
              variant="primary"
              icon={<PnI.Plus size={13}/>}
              onClick={() => setInvite({ roleId: null, kind: 'person' })}
            >Aggiungi persona</ImpButton>
          </div>
        }
      >
        <div style={{display:'flex', flexDirection:'column', gap: 10}}>
          <DevicesSection
            expanded={expanded.has('_devices')}
            onToggle={() => toggleExpand('_devices')}
            onAddNew={() => setInvite({ roleId: null, kind: 'device' })}
            onEditDevice={d => setInvite({ kind: 'device', editDevice: d })}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
          {allRoles.filter(role => PERSONS.some(p => p.role === role.id)).map(role => (
            <RoleSection
              key={role.id}
              role={role}
              expanded={expanded.has(role.id)}
              onToggle={() => toggleExpand(role.id)}
              onAddNew={() => setInvite({ roleId: role.id, kind: 'person' })}
              onEditPermissions={() => setEditRole(role)}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          ))}
        </div>
      </ImpCard>

      {showCreateRole && <CreateRoleModal onClose={() => setShowCreateRole(false)}/>}
      {editRole && <CreateRoleModal role={editRole} onClose={() => setEditRole(null)}/>}
      {invite && <InviteModal prefill={invite} onClose={() => setInvite(null)}/>}
      {showPending && <PendingModal onClose={() => setShowPending(false)}/>}
    </div>
  );
}

function RoleSection({ role, expanded, onToggle, onAddNew, onEditPermissions, openMenu, setOpenMenu }) {
  const people = PERSONS.filter(p => p.role === role.id);
  const count = people.length;
  const countLabel = count === 1 ? 'persona' : 'persone';
  const isMenuOpen = openMenu === `role-${role.id}`;

  return (
    <div style={{
      border: `1px solid ${role.custom ? '#EDE9FE' : PN.BORDER_SOFT}`,
      borderLeft: `4px solid ${role.color}`,
      borderRadius: 12,
      background: role.custom ? 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 70%)' : PN.WHITE,
      position: 'relative',
    }}>
      <div
        onClick={count > 0 ? onToggle : undefined}
        style={{display:'flex', alignItems:'flex-start', gap: 14, padding:'14px 16px', cursor: count > 0 ? 'pointer' : 'default'}}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: role.bg, color: role.color,
          display:'grid', placeItems:'center', flexShrink: 0,
        }}>{(BuIcons[role.icon]||BuIcons.user)({size: 19, color:'currentColor'})}</div>

        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:'flex', alignItems:'center', gap: 7, marginBottom: 3}}>
            <span
              style={{fontSize: 16.5, fontWeight: 700, position:'relative', cursor:'default'}}
              onMouseEnter={e => {
                const t = e.currentTarget.querySelector('.role-tip');
                if (t) { const r = e.currentTarget.getBoundingClientRect(); t.style.top = (r.bottom + 6) + 'px'; t.style.left = r.left + 'px'; t.style.display = 'block'; }
              }}
              onMouseLeave={e => { const t = e.currentTarget.querySelector('.role-tip'); if (t) t.style.display = 'none'; }}
            >
              {role.label}
              <span className="role-tip" style={{
                display:'none', position:'fixed', zIndex:9999,
                background: PN.TEXT, color: '#fff',
                borderRadius: 9, padding: '10px 12px',
                fontSize: 14, fontWeight: 500, lineHeight: 1.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                minWidth: 180, maxWidth: 260,
                pointerEvents: 'none',
              }}>
                <div style={{fontWeight: 700, marginBottom: 6, fontSize: 13.5, opacity: 0.7, textTransform:'uppercase', letterSpacing: 0.4}}>Aree accessibili</div>
                <div style={{display:'flex', flexWrap:'wrap', gap: 4}}>
                  {ALL_AREAS.filter(a => role.areas.includes(a.id)).map(a => (
                    <span key={a.id} style={{
                      padding:'2px 8px', borderRadius: 999,
                      background:'rgba(255,255,255,0.15)',
                      fontSize: 13.5, fontWeight: 600,
                    }}>{a.label}</span>
                  ))}
                </div>
              </span>
            </span>
            <span style={{
              fontSize: 13.5, fontWeight: 600,
              color: count === 0 ? PN.MUTED : PN.TEXT,
              opacity: count === 0 ? 0.55 : 1,
              padding: '2px 8px', borderRadius: 999,
              background: count === 0 ? '#F4F5F7' : '#EEF2F6',
              whiteSpace: 'nowrap',
            }}>{count} {countLabel}</span>
            {role.locked && <span style={{fontSize: 13}}>🔒</span>}
          </div>
          <div style={{fontSize: 14, color: PN.MUTED, lineHeight: 1.4}}>
            {role.desc}
          </div>
        </div>

        {role.custom && (
          <div style={{flexShrink: 0}}>
            <button
              onClick={e => { e.stopPropagation(); onEditPermissions?.(); }}
              aria-label="Modifica ruolo"
              style={{
                display:'inline-flex', alignItems:'center', gap: 6,
                height: 30, padding: '0 12px', borderRadius: 8,
                background: 'transparent', border: `1px solid ${PN.BORDER}`,
                cursor: 'pointer', color: PN.TEXT,
                fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {BuIcons.edit({size: 13, color: 'currentColor'})}
              Modifica
            </button>
          </div>
        )}
        {count > 0 && (
          <div style={{display:'inline-flex', alignItems:'center', flexShrink: 0, padding:'7px 0', color: PN.MUTED}}>
            <span style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s', display:'inline-flex',
            }}><PnI.ChevronDown size={12}/></span>
          </div>
        )}
      </div>

      {expanded && count > 0 && (
        <div style={{
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          background: '#FAFBFC',
          padding: '12px 16px',
          borderRadius: '0 0 12px 12px',
          display:'flex', flexDirection:'column', gap: 8,
        }}>
          {people.map((p, i) => (
            <PersonRow
              key={`${role.id}-${i}`}
              p={p}
              idx={`${role.id}-${i}`}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DevicesSection({ expanded, onToggle, onAddNew, onEditDevice, openMenu, setOpenMenu }) {
  const count = DEVICES.length;
  const countLabel = count === 1 ? 'dispositivo' : 'dispositivi';

  return (
    <div style={{
      border: `1px solid ${PN.BORDER_SOFT}`,
      borderLeft: '4px solid #475569',
      borderRadius: 12,
      background: PN.WHITE,
      position: 'relative',
    }}>
      <div
        onClick={count > 0 ? onToggle : undefined}
        style={{display:'flex', alignItems:'flex-start', gap: 14, padding:'14px 16px', cursor: count > 0 ? 'pointer' : 'default'}}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: '#F1F5F9', color: '#475569',
          display:'grid', placeItems:'center', flexShrink: 0,
        }}>{(BuIcons.monitor||BuIcons.phone)({size: 19, color:'currentColor'})}</div>

        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:'flex', alignItems:'center', gap: 7, marginBottom: 3}}>
            <span style={{fontSize: 16.5, fontWeight: 700}}>Dispositivi</span>
            <span style={{
              fontSize: 13.5, fontWeight: 600,
              color: count === 0 ? PN.MUTED : PN.TEXT,
              opacity: count === 0 ? 0.55 : 1,
              padding: '2px 8px', borderRadius: 999,
              background: count === 0 ? '#F4F5F7' : '#EEF2F6',
              whiteSpace: 'nowrap',
            }}>{count} {countLabel}</span>
          </div>
          <div style={{fontSize: 14, color: PN.MUTED, lineHeight: 1.4}}>
            Monitor cucina e schermi KDS — accesso con username/password locali, senza email
          </div>
        </div>

        {count > 0 && (
          <div style={{display:'inline-flex', alignItems:'center', flexShrink: 0, padding:'7px 0', color: PN.MUTED}}>
            <span style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s', display:'inline-flex',
            }}><PnI.ChevronDown size={12}/></span>
          </div>
        )}
      </div>

      {expanded && count > 0 && (
        <div style={{
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          background: '#FAFBFC',
          padding: '12px 16px',
          borderRadius: '0 0 12px 12px',
          display:'flex', flexDirection:'column', gap: 8,
        }}>
          {DEVICES.map((d, i) => (
            <DeviceRow
              key={i}
              d={d}
              idx={`dev-${i}`}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              onEdit={() => onEditDevice?.(d)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InviteModal({ onClose, prefill }) {
  const initialKind = prefill?.kind === 'device' ? 'device' : 'person';
  // Se prefill.roleId è quello di un ruolo selezionabile, usa quello; altrimenti default
  const prefillRoleSelectable = prefill?.roleId
    && [...ROLES, ...CUSTOM_ROLES].some(r => r.id === prefill.roleId && !r.locked);
  const [kind, setKind] = React.useState(initialKind);

  // Persona
  const [email, setEmail] = React.useState('');
  const [roleId, setRoleId] = React.useState(prefillRoleSelectable ? prefill.roleId : 'cameriere');
  const [msg, setMsg] = React.useState('');
  const allRolesForInvite = [...ROLES, ...CUSTOM_ROLES];
  const role = allRolesForInvite.find(r => r.id === roleId) || ROLES[0];
  const personValid = /\S+@\S+\.\S+/.test(email);

  // Dispositivo
  const [deviceTypeId, setDeviceTypeId] = React.useState('kitchen-monitor');
  const [deviceName, setDeviceName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [openTypeMenu, setOpenTypeMenu] = React.useState(false);
  // printerCats: Set di chiavi composite "menuId:catId" — permette selezione tra menu diversi
  const [printerCats, setPrinterCats] = React.useState(new Set());
  const allCatsCount = MENUS.reduce((n, m) => n + m.categories.length, 0);

  // Pre-popola da editDevice se presente
  const editDevice = prefill?.editDevice;
  React.useEffect(() => {
    if (!editDevice) return;
    if (editDevice.deviceType === 'printer') {
      const matchedPrinter = AVAILABLE_PRINTERS.find(p => p.model === editDevice.printerModel);
      if (matchedPrinter) setDeviceTypeId(matchedPrinter.id);
    } else {
      setDeviceTypeId(editDevice.deviceType || 'kitchen-monitor');
      if (editDevice.username) setUsername(editDevice.username.replace('PG1-', ''));
    }
    if (editDevice.name) setDeviceName(editDevice.name);
  }, []);

  const isPrinter = deviceTypeId.startsWith('printer-');
  const selectedPrinter = AVAILABLE_PRINTERS.find(p => p.id === deviceTypeId);
  const deviceType = isPrinter
    ? { id: deviceTypeId, label: 'Stampante', color: PN.BLUE, bg: PN.BLUE_SOFT, icon: 'doc', noCredentials: true }
    : (DEVICE_TYPES.find(t => t.id === deviceTypeId) || DEVICE_TYPES[0]);
  const deviceValid = isPrinter ? deviceName.trim().length > 0 && printerCats.size > 0 : (username.trim().length > 0 && password.length >= 4);

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
          <div style={{fontSize: 19, fontWeight: 800, marginBottom: 3}}>Aggiungi un membro / dispositivo</div>
          <div style={{fontSize: 14.5, color: PN.MUTED}}>
            {kind === 'person'
              ? 'Invia un invito email per attivare l\'accesso al gestionale'
              : 'Crea username e password per il dispositivo — non serve un\'email'}
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
                      <div style={{fontSize: 14.5, fontWeight: 700, color: on ? PN.TEXT : PN.MUTED}}>{opt.label}</div>
                      <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 1}}>{opt.sub}</div>
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
                    borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                  }}
                />
              </ImpField>

              <div style={{fontSize: 14.5, fontWeight: 700, marginBottom: 8, marginTop: 4}}>
                Ruolo
              </div>
              <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 10}}>
                Determina cosa potrà vedere e fare nel gestionale
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 6, marginBottom: 16}}>
                {allRolesForInvite.filter(r => !r.locked).map(r => {
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
                        <div style={{fontSize: 15, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{r.label}</div>
                        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1, marginBottom: 6}}>{r.desc}</div>
                        <div style={{display:'flex', flexWrap:'wrap', gap: 4}}>
                          {ALL_AREAS.filter(a => r.areas.includes(a.id)).map(a => (
                            <span key={a.id} style={{
                              fontSize: 12, fontWeight: 600,
                              padding:'1px 7px', borderRadius: 999,
                              background: on ? 'rgba(255,255,255,0.6)' : '#F4F5F7',
                              color: on ? PN.PINK_DARK : '#6B7280',
                            }}>{a.label}</span>
                          ))}
                        </div>
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
                    borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none', resize:'vertical',
                  }}
                />
              </ImpField>
            </>
          )}

          {kind === 'device' && (
            <>
              {/* Selettore tipo dispositivo */}
              <ImpField label="Tipo dispositivo">
                <div style={{position:'relative'}}>
                  <button
                    onClick={() => setOpenTypeMenu(o => !o)}
                    style={{
                      width:'100%', padding:'10px 14px',
                      border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                      background: PN.WHITE, cursor:'pointer', fontFamily:'inherit',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      fontSize: 15.5, color: PN.TEXT,
                    }}
                  >
                    <span style={{display:'inline-flex', alignItems:'center', gap: 10}}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: deviceType.bg, color: deviceType.color,
                        display:'grid', placeItems:'center',
                      }}>{isPrinter
                        ? (BuIcons.doc||BuIcons.phone)({size: 13, color:'currentColor'})
                        : (BuIcons.monitor||BuIcons.chef)({size: 13, color:'currentColor'})
                      }</span>
                      <span style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1}}>
                        <span style={{fontSize:15.5}}>
                          {isPrinter ? `Stampante (${selectedPrinter?.model})` : 'Tablet/iPad/Schermo (Monitor cucina)'}
                        </span>
                        {isPrinter && selectedPrinter && (
                          <span style={{fontSize:13, color:PN.MUTED}}>{selectedPrinter.ip}</span>
                        )}
                      </span>
                    </span>
                    <PnI.ChevronDown size={14}/>
                  </button>

                  {openTypeMenu && (
                    <div style={{
                      position:'absolute', top:'calc(100% + 4px)', left: 0, right: 0,
                      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                      borderRadius: 10, padding: 4, zIndex: 5,
                      boxShadow:'0 8px 24px rgba(0,0,0,0.08)',
                    }}>
                      {/* Monitor cucina */}
                      {DEVICE_TYPES.map(t => (
                        <button key={t.id} onClick={() => { setDeviceTypeId(t.id); setOpenTypeMenu(false); }}
                          style={{
                            display:'flex', width:'100%', alignItems:'center', gap: 10,
                            padding:'8px 10px', background: deviceTypeId === t.id ? PN.PINK_SOFT : 'transparent',
                            border:'none', borderRadius: 7, fontFamily:'inherit', cursor:'pointer', textAlign:'left',
                          }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: t.bg, color: t.color,
                            display:'grid', placeItems:'center', flexShrink:0,
                          }}>{(BuIcons.monitor||BuIcons.chef)({size: 13, color:'currentColor'})}</span>
                          <div>
                            <div style={{fontSize:15, fontWeight:600, color: deviceTypeId === t.id ? PN.PINK_DARK : PN.TEXT}}>
                              Tablet/iPad/Schermo
                            </div>
                            <div style={{fontSize:13.5, color:PN.MUTED}}>Monitor cucina</div>
                          </div>
                        </button>
                      ))}

                      {/* Separatore */}
                      {AVAILABLE_PRINTERS.length > 0 && (
                        <div style={{height:1, background:PN.BORDER_SOFT, margin:'4px 0'}}/>
                      )}

                      {/* Stampanti scoperte */}
                      {AVAILABLE_PRINTERS.map(p => (
                        <button key={p.id} onClick={() => { setDeviceTypeId(p.id); setOpenTypeMenu(false); }}
                          style={{
                            display:'flex', width:'100%', alignItems:'center', gap: 10,
                            padding:'8px 10px', background: deviceTypeId === p.id ? PN.PINK_SOFT : 'transparent',
                            border:'none', borderRadius: 7, fontFamily:'inherit', cursor:'pointer', textAlign:'left',
                          }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: PN.BLUE_SOFT, color: PN.BLUE,
                            display:'grid', placeItems:'center', flexShrink:0,
                          }}>{(BuIcons.doc||BuIcons.phone)({size: 13, color:'currentColor'})}</span>
                          <div>
                            <div style={{fontSize:15, fontWeight:600, color: deviceTypeId === p.id ? PN.PINK_DARK : PN.TEXT}}>
                              Stampante ({p.model})
                            </div>
                            <div style={{fontSize:13.5, color:PN.MUTED}}>{p.ip}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ImpField>

              {/* Etichetta — solo per stampanti */}
              {isPrinter && (
                <ImpField label="Etichetta" hint="Come la chiamerete in lista (es. Cassa, Cucina, Bar)">
                  <input
                    type="text"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    placeholder="es. Cassa principale"
                    style={{
                      width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                      borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                    }}
                  />
                </ImpField>
              )}

              {/* Nome dispositivo — solo per monitor cucina */}
              {!isPrinter && (
                <ImpField label="Nome dispositivo" hint="Come lo riconoscerete in lista (es. Monitor pizza, Monitor sushi)">
                  <input
                    type="text"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    placeholder="Monitor cucina"
                    style={{
                      width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                      borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                    }}
                  />
                </ImpField>
              )}

              {deviceType.noCredentials && (
                <div style={{marginBottom: 16}}>
                  <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 4}}>
                    <div style={{fontSize: 14.5, fontWeight: 700}}>Categorie stampate</div>
                    <button onClick={() => {
                      const allSelected = printerCats.size === allCatsCount;
                      if (allSelected) setPrinterCats(new Set());
                      else {
                        const s = new Set();
                        MENUS.forEach(m => m.categories.forEach(c => s.add(`${m.id}:${c.id}`)));
                        setPrinterCats(s);
                      }
                    }} style={{
                      fontSize: 13.5, fontWeight: 600,
                      color: PN.BLUE, background:'none', border:'none',
                      cursor:'pointer', padding: 0, fontFamily:'inherit',
                    }}>
                      {printerCats.size === allCatsCount ? 'Deseleziona tutte' : 'Seleziona tutte'}
                    </button>
                  </div>
                  <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 12}}>
                    Seleziona categorie da uno o più menu — questa stampante riceverà solo gli ordini di queste categorie
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap: 12}}>
                    {MENUS.map(m => {
                      const menuKeys = m.categories.map(c => `${m.id}:${c.id}`);
                      const menuSelectedCount = menuKeys.filter(k => printerCats.has(k)).length;
                      const allMenuSelected = menuSelectedCount === m.categories.length;
                      return (
                        <div key={m.id} style={{
                          border:`1px solid ${menuSelectedCount > 0 ? '#DBEAFE' : PN.BORDER_SOFT}`,
                          borderRadius: 10,
                          background: menuSelectedCount > 0 ? '#F0F7FF' : '#FAFBFC',
                          padding:'10px 12px',
                          transition:'background 0.15s, border-color 0.15s',
                        }}>
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8}}>
                            <div style={{display:'flex', alignItems:'center', gap: 8}}>
                              <span style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>{m.label}</span>
                              {menuSelectedCount > 0 && (
                                <span style={{
                                  fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
                                  padding:'1px 7px', borderRadius: 999,
                                  background: '#F1F3F5', color: PN.MUTED,
                                }}>{menuSelectedCount}/{m.categories.length}</span>
                              )}
                            </div>
                            <button onClick={() => setPrinterCats(prev => {
                              const s = new Set(prev);
                              if (allMenuSelected) menuKeys.forEach(k => s.delete(k));
                              else menuKeys.forEach(k => s.add(k));
                              return s;
                            })} style={{
                              fontSize: 13, fontWeight: 600,
                              color: PN.MUTED, background:'none', border:'none',
                              cursor:'pointer', padding: 0, fontFamily:'inherit',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = PN.TEXT}
                            onMouseLeave={e => e.currentTarget.style.color = PN.MUTED}
                            >{allMenuSelected ? 'Deseleziona' : 'Tutte'}</button>
                          </div>
                          <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
                            {m.categories.map(c => {
                              const key = `${m.id}:${c.id}`;
                              const on = printerCats.has(key);
                              return (
                                <button key={c.id} onClick={() => setPrinterCats(prev => {
                                  const s = new Set(prev);
                                  on ? s.delete(key) : s.add(key);
                                  return s;
                                })} style={{
                                  padding:'5px 11px', borderRadius: 999,
                                  border: `1.5px solid ${on ? PN.BLUE : PN.BORDER_SOFT}`,
                                  background: on ? PN.BLUE_SOFT : PN.WHITE,
                                  color: on ? PN.BLUE : '#6B7280',
                                  fontSize: 14, fontWeight: 600,
                                  cursor:'pointer', fontFamily:'inherit',
                                  transition:'background 0.12s',
                                }}>{c.label}</button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!deviceType.noCredentials && <ImpField label="Username" required>
                <div style={{display:'flex', alignItems:'stretch', gap: 0}}>
                  <span style={{
                    padding:'10px 12px',
                    background:'#F4F5F7', border:`1px solid ${PN.BORDER}`, borderRight:'none',
                    borderRadius:'9px 0 0 9px',
                    fontSize: 15, fontWeight: 700, color: PN.MUTED,
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
                      fontSize:15.5, fontFamily:'ui-monospace, Menlo, monospace',
                      outline:'none',
                    }}
                  />
                </div>
              </ImpField>}

              {!deviceType.noCredentials && <ImpField label="Password" required>
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
                        fontSize:15.5, fontFamily:'inherit', outline:'none',
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
                      fontSize: 14, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap',
                    }}
                  >Genera</button>
                </div>
                <div style={{fontSize: 13, color: PN.MUTED, marginTop: 6}}>
                  Salvala in un posto sicuro — vale solo per questo dispositivo.
                </div>
              </ImpField>}
            </>
          )}
        </div>

        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          display:'flex', gap: 10, justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{fontSize: 13.5, color: PN.MUTED}}>
            {kind === 'person'
              ? (personValid
                  ? <>Invierà invito a <b style={{color: PN.TEXT}}>{email}</b> come <b style={{color: role.color}}>{role.label}</b></>
                  : 'Inserisci un\'email valida')
              : (deviceType.noCredentials
                  ? <>{deviceName.trim() ? <>Aggiungerà <b style={{color: PN.TEXT}}>{deviceName}</b></> : 'Inserisci un nome per il dispositivo'}</>
                  : deviceValid
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

function DeviceRow({ d, idx, openMenu, setOpenMenu, onEdit }) {
  const isPrinter = d.deviceType === 'printer';
  const t = isPrinter
    ? { label: 'Stampante', color: PN.BLUE, bg: PN.BLUE_SOFT }
    : (DEVICE_TYPES.find(x => x.id === d.deviceType) || DEVICE_TYPES[0]);
  const isOpen = openMenu === `dev-${idx}`;
  const [confirmScollega, setConfirmScollega] = React.useState(false);

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
        }}>{isPrinter
          ? (BuIcons.doc||BuIcons.phone)({size: 20, color:'currentColor'})
          : (BuIcons.monitor||BuIcons.chef)({size: 20, color:'currentColor'})
        }</div>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
          <span style={{fontSize: 16, fontWeight: 700}}>{d.name}</span>
          <span style={{
            fontSize: 12.5, fontWeight: 700,
            padding:'2px 8px', borderRadius: 999,
            background: t.bg, color: t.color,
            display:'inline-flex', alignItems:'center', gap: 4,
          }}>
            {isPrinter
              ? (BuIcons.doc||BuIcons.phone)({size: 11, color:'currentColor'})
              : (BuIcons.monitor||BuIcons.chef)({size: 11, color:'currentColor'})
            } {isPrinter ? `${t.label} · ${d.printerModel}` : t.label}
          </span>
        </div>
        {isPrinter
          ? <div style={{fontSize: 14, color: PN.MUTED, fontFamily:'ui-monospace, Menlo, monospace'}}>{d.ip}</div>
          : <div style={{fontSize: 14, color: PN.MUTED, fontFamily:'ui-monospace, Menlo, monospace'}}>{d.username}</div>
        }
        {isPrinter && d.cats && d.cats.length > 0 && (
          <div style={{display:'flex', flexWrap:'wrap', gap: 4, marginTop: 6}}>
            {d.cats.map(cid => {
              const cat = MENUS.flatMap(m => m.categories).find(c => c.id === cid);
              return cat ? (
                <span key={cid} style={{
                  fontSize: 12.5, fontWeight: 600,
                  padding:'2px 8px', borderRadius: 999,
                  background: '#F1F5F9', color: '#475569',
                }}>{cat.label}</span>
              ) : null;
            })}
          </div>
        )}
      </div>


      <button
        onClick={(e) => { e.stopPropagation(); setOpenMenu(isOpen ? null : `dev-${idx}`); }}
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: isOpen ? '#F4F5F7' : 'transparent',
          border:'none', cursor:'pointer', color: PN.MUTED,
          display:'grid', placeItems:'center', fontSize: 20,
        }}
        aria-label="Altre azioni"
      >⋯</button>
      {isOpen && (
        <div onClick={e => e.stopPropagation()} style={{
          position:'absolute', bottom: 'calc(100% - 8px)', right: 12,
          minWidth: 190, background: PN.WHITE,
          border: `1px solid ${PN.BORDER}`, borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: 6, zIndex: 50,
        }}>
          <MenuItem icon={BuIcons.edit({size: 14, color: 'currentColor'})} onClick={() => { setOpenMenu(null); onEdit?.(); }}>Modifica</MenuItem>
          {!isPrinter && <MenuItem icon={<PnI.Key size={14}/>}>Genera nuova password</MenuItem>}
          {!isPrinter && <MenuItem icon={BuIcons.pause({size: 14, color: 'currentColor'})}>Sospendi accesso</MenuItem>}
          <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
          <MenuItem icon={BuIcons.trash({size: 14, color: 'currentColor'})} danger onClick={() => { setOpenMenu(null); setConfirmScollega(true); }}>Scollega dispositivo</MenuItem>
        </div>
      )}

      {confirmScollega && (
        <div onClick={() => setConfirmScollega(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
          display:'grid', placeItems:'center', zIndex:200,
          backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: PN.WHITE, borderRadius: 14,
            width: 380, maxWidth:'90%',
            padding: '24px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
          }}>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>
              Scollega dispositivo
            </div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, marginBottom: 22}}>
              Sei sicuro di voler scollegare <b style={{color: PN.TEXT}}>{d.name}</b>? Il dispositivo perderà immediatamente l'accesso.
            </div>
            <div style={{display:'flex', gap: 8, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setConfirmScollega(false)}>Annulla</ImpButton>
              <ImpButton variant="danger" onClick={() => setConfirmScollega(false)}>Scollega</ImpButton>
            </div>
          </div>
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
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{marginBottom: 2}}>
          <span style={{fontSize: 16, fontWeight: 700}}>{p.name}</span>
        </div>
        <div style={{fontSize: 14, color: PN.MUTED}}>{p.email}</div>
      </div>

      {!role.locked && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(isOpen ? null : idx); }}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: isOpen ? '#F4F5F7' : 'transparent',
              border:'none', cursor:'pointer', color: PN.MUTED,
              display:'grid', placeItems:'center', fontSize: 20,
            }}
            aria-label="Altre azioni"
          >⋯</button>
          {isOpen && (
            <div onClick={e => e.stopPropagation()} style={{
              position:'absolute', bottom: 'calc(100% - 8px)', right: 12,
              minWidth: 190, background: PN.WHITE,
              border: `1px solid ${PN.BORDER}`, borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              padding: 6, zIndex: 10,
            }}>
              <MenuItem icon={BuIcons.user({size: 14, color: 'currentColor'})}>Modifica ruolo</MenuItem>
              <MenuItem icon={<PnI.Key size={14}/>}>Resetta password</MenuItem>
              <MenuItem icon={BuIcons.pause({size: 14, color: 'currentColor'})}>Sospendi accesso</MenuItem>
              <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
              <MenuItem icon={BuIcons.trash({size: 14, color: 'currentColor'})} danger>Rimuovi dal team</MenuItem>
            </div>
          )}
        </>
      )}
      {role.locked && (
        <span style={{
          fontSize: 13, fontWeight: 600, color: PN.MUTED,
          padding:'5px 10px', background: '#F4F5F7', borderRadius: 7,
          display:'inline-flex', alignItems:'center', gap: 5,
        }}>🔒 Non modificabile</span>
      )}
    </div>
  );
}

function PendingModal({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16,
        width: 540, maxWidth:'100%', position:'relative',
        maxHeight:'90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{padding:'20px 24px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize: 19, fontWeight: 800, marginBottom: 3}}>Inviti in sospeso</div>
          <div style={{fontSize: 14.5, color: PN.MUTED}}>
            {PENDING.length === 0
              ? 'Nessun invito in attesa'
              : `${PENDING.length} ${PENDING.length === 1 ? 'invito in attesa' : 'inviti in attesa'} di conferma`}
          </div>
          <button onClick={onClose} style={{
            position:'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 8,
            background:'#F4F5F7', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={14}/></button>
        </div>

        <div style={{padding:'20px 24px', overflow:'auto', flex: 1}}>
          {PENDING.length === 0 ? (
            <div style={{padding: 30, textAlign:'center', color: PN.MUTED, fontSize: 15}}>
              Quando inviterai una persona, l'invito comparirà qui finché non viene accettato.
            </div>
          ) : (
            <>
              <div style={{
                padding:'10px 14px', marginBottom: 14,
                background: PN.AMBER_SOFT, borderRadius: 9,
                fontSize: 14.5, color: '#92400E',
                display:'flex', alignItems:'center', gap: 8,
              }}>
                <span>⏳</span>
                <span>Gli inviti scadono dopo 7 giorni. Puoi rinviarli o revocarli in qualsiasi momento.</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                {PENDING.map((p, i) => {
                  const role = [...ROLES, ...CUSTOM_ROLES].find(r => r.id === p.role);
                  return (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap: 12,
                      padding:'12px 16px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius:'50%',
                        background: PN.AMBER_SOFT, color: '#92400E',
                        display:'grid', placeItems:'center', fontSize: 18,
                      }}>✉</div>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: 15.5, fontWeight: 700}}>{p.email}</div>
                        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>
                          Invitato come <b>{role?.label}</b> · {p.sent}
                        </div>
                      </div>
                      <ImpButton variant="ghost" style={{padding:'6px 10px', fontSize: 14}}>Invita di nuovo</ImpButton>
                      <button style={{
                        padding:'6px 10px',
                        background: PN.PINK_SOFT, color: PN.PINK_DARK,
                        border:'none', borderRadius: 7,
                        fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                      }}>Revoca invito</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{
          padding:'14px 24px',
          borderTop:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', justifyContent:'flex-end',
        }}>
          <ImpButton variant="ghost" onClick={onClose}>Chiudi</ImpButton>
        </div>
      </div>
    </div>
  );
}

function CreateRoleModal({ onClose, role }) {
  const isEdit = !!role;
  const [name, setName] = React.useState(role?.label || '');
  const [areas, setAreas] = React.useState(role?.areas || []);
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
          <div style={{fontSize: 19, fontWeight: 800, marginBottom: 3}}>
            {isEdit ? `Modifica permessi · ${role.label}` : 'Crea ruolo personalizzato'}
          </div>
          <div style={{fontSize: 14.5, color: PN.MUTED}}>
            {isEdit ? 'Aggiorna nome e aree visibili a questo ruolo' : 'Definisci nome e aree visibili'}
          </div>
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
                borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
              }}
            />
          </ImpField>

          <div style={{fontSize: 14.5, fontWeight: 700, marginBottom: 8, marginTop: 6}}>
            Aree visibili a questo ruolo
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 12}}>
            Scegli cosa può vedere e fare chi ha questo ruolo
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
                    <span style={{fontSize: 15, fontWeight: 600, color: on ? PN.PINK_DARK : PN.TEXT, flex: 1}}>{a.label}</span>
                    {isSettings && on && (
                      <span style={{fontSize: 13, color: PN.PINK_DARK, fontWeight: 600}}>
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
                              fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
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
                                <span style={{fontSize: 13.5, fontWeight: 600, color: pOn ? PN.PINK_DARK : PN.TEXT}}>{p.label}</span>
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
          <ImpButton variant="primary" onClick={onClose}>{isEdit ? 'Salva modifiche' : 'Crea ruolo'}</ImpButton>
        </div>
      </div>
    </div>
  );
}

window.ImpPersonale = ImpPersonale;

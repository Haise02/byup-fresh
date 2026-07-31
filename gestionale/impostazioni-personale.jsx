// Impostazioni → Personale (rifatto: ruoli predefiniti + custom, permessi area-based, no dispositivi)

// Superficie dei menu a comparsa: vetro, come in Sala e tavoli.
const GLASS_MENU_PERSONALE = {
  background: 'rgba(255, 255, 255, 0.82)',
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.85)',
  outline: '1px solid rgba(15, 17, 21, 0.06)',
  outlineOffset: -1,
  borderRadius: 10,
};

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
  { name: 'Luca Ferretti', email: 'luca@delborgo.it', role: 'sommelier', last: '3 ore fa', online: false, color: '#7C3AED', active: false },
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
  const [gruppo, setGruppo] = React.useState('all');   // filtro per ruolo (colonna sinistra)
  const [query, setQuery] = React.useState('');
  const [statoFiltro, setStatoFiltro] = React.useState('all');

  // Deep-link "Invita membro del team" (Azioni rapide): ?invita=1 apre
  // subito l'invito persona.
  React.useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('invita') === '1') {
        setInvite({ roleId: null, kind: 'person' });
      }
    } catch (e) {}
  }, []);

  // Click outside per chiudere menu
  React.useEffect(() => {
    if (openMenu === null) return;
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenu]);

  const allRoles = [...ROLES, ...CUSTOM_ROLES];

  // Persone e dispositivi in un elenco solo: la domanda della pagina è «chi
  // entra nel gestionale», e un monitor di cucina che legge le comande entra
  // esattamente come ci entra un cameriere. Tenerli in due liste separate
  // costringeva a guardare in due posti per rispondere.
  const righe = [
    ...PERSONS.map(p => {
      const ruolo = allRoles.find(r => r.id === p.role) || CUCINA_ROLE;
      return {
        key: `p-${p.email}`, tipo: 'persona', dato: p,
        nome: p.name, sotto: p.email, colore: p.color,
        ruolo, gruppo: ruolo.custom ? '_custom' : ruolo.id,
        accesso: accessoDelRuolo(ruolo),
        attivo: p.active !== false,
        quando: p.online ? 'Online ora' : p.last,
        online: p.online,
      };
    }),
    ...DEVICES.map((d, i) => {
      const stampante = d.deviceType === 'printer';
      return {
        key: `d-${i}`, tipo: 'dispositivo', dato: d, idx: i,
        nome: d.name, sotto: stampante ? d.ip : d.username,
        ruolo: DEVICE_ROLE, gruppo: '_devices',
        accesso: stampante
          ? { titolo: 'Cassa', sotto: 'Scontrini e comande' }
          : { titolo: 'Cucina', sotto: 'Schermo comande' },
        attivo: d.active !== false,
        quando: d.online ? 'Online ora' : d.last,
        online: d.online,
        stampante,
      };
    }),
  ];

  const conta = (id) => id === 'all' ? righe.length : righe.filter(r => r.gruppo === id).length;
  const gruppi = [
    { id: 'all', label: 'Tutti i ruoli', icon: 'users', color: PN.PINK_DARK, bg: PN.PINK_SOFT },
    ...ROLES.map(r => ({ id: r.id, label: r.label, icon: r.icon, color: r.color, bg: r.bg })),
    { id: '_devices', label: 'Dispositivi', icon: 'monitor', color: DEVICE_ROLE.color, bg: DEVICE_ROLE.bg },
    ...(CUSTOM_ROLES.length
      ? [{ id: '_custom', label: 'Personalizzati', icon: 'sparkle', color: '#6D28D9', bg: '#EDE9FE' }]
      : []),
  ];

  const q = query.trim().toLowerCase();
  const visibili = righe.filter(r => {
    if (gruppo !== 'all' && r.gruppo !== gruppo) return false;
    if (statoFiltro === 'attivi' && !r.attivo) return false;
    if (statoFiltro === 'disattivati' && r.attivo) return false;
    if (!q) return true;
    return [r.nome, r.sotto, r.ruolo.label].some(v => String(v).toLowerCase().includes(q));
  });

  const PANNELLO = {
    background: PN.WHITE,
    border: `1px solid ${PN.BORDER_SOFT}`,
    borderRadius: 14,
  };

  return (
    <div>
      {/* Testata invariata: titolo, sottotitolo e le tre azioni di sempre */}
      <section style={{...PANNELLO, marginBottom: 14, padding: '18px 22px', display:'flex', alignItems:'flex-start', gap: 16}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>Personale</div>
          <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.4}}>
            Vedi chi accede al gestionale e con quali permessi, e gestisci persone e dispositivi
          </div>
        </div>
        <div style={{display:'flex', gap: 8, alignItems:'center', flexShrink: 0}}>
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
      </section>

      <div style={{display:'grid', gridTemplateColumns:'248px minmax(0, 1fr)', gap: 14, alignItems:'start'}}>
        <aside style={{display:'flex', flexDirection:'column', gap: 14}}>
          <section style={PANNELLO}>
            <div style={{padding:'16px 18px 12px'}}>
              <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT}}>Ruoli</div>
              <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>Filtra le persone per ruolo</div>
            </div>
            <div style={{padding:'0 10px 12px', display:'flex', flexDirection:'column', gap: 2}}>
              {gruppi.map(g => {
                const on = gruppo === g.id;
                const n = conta(g.id);
                // I ruoli standard non avevano nessun punto da cui aprire i
                // loro permessi: solo i custom mostravano «Modifica». La
                // matita al passaggio vale per tutti.
                const ruoloVero = allRoles.find(r => r.id === g.id && !r.locked);
                return (
                  <div key={g.id} style={{position:'relative'}}
                    onMouseEnter={e => { const m = e.currentTarget.querySelector('.ruolo-matita'); if (m) m.style.opacity = 1; }}
                    onMouseLeave={e => { const m = e.currentTarget.querySelector('.ruolo-matita'); if (m) m.style.opacity = 0; }}
                  >
                    <button
                      onClick={() => setGruppo(g.id)}
                      className="pn-btn-feedback"
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap: 10,
                        padding:'9px 10px', borderRadius: 10,
                        border: `1.5px solid ${on ? 'rgba(255, 90, 95, 0.55)' : 'transparent'}`,
                        background: on ? '#FFF7F6' : 'transparent',
                        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                        transition:'background .14s, border-color .14s',
                      }}
                      onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#F7F8FA'; }}
                      onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: g.bg, color: g.color,
                        display:'grid', placeItems:'center',
                      }}>{(BuIcons[g.icon]||BuIcons.user)({size: 14, color:'currentColor'})}</span>
                      <span style={{
                        flex: 1, minWidth: 0, fontSize: 15, fontWeight: on ? 700 : 600,
                        color: on ? PN.PINK_DARK : PN.TEXT,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>{g.label}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                        color: on ? PN.PINK_DARK : PN.MUTED,
                        marginRight: ruoloVero ? 24 : 0,
                      }}>{n}</span>
                    </button>
                    {ruoloVero && (
                      <button
                        className="ruolo-matita"
                        onClick={(e) => { e.stopPropagation(); setEditRole(ruoloVero); }}
                        title={`Permessi di ${ruoloVero.label}`}
                        aria-label={`Permessi di ${ruoloVero.label}`}
                        style={{
                          position:'absolute', top: '50%', right: 8, transform:'translateY(-50%)',
                          width: 24, height: 24, borderRadius: 7,
                          border:'none', background:'transparent', color: PN.MUTED,
                          display:'grid', placeItems:'center', cursor:'pointer',
                          opacity: 0, transition:'opacity .14s',
                        }}
                      >{BuIcons.edit({size: 13, color:'currentColor'})}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Accessi rapidi: le due cose che da qui non si possono fare in
              nessun altro modo. Collegare un dispositivo non ha un bottone in
              testata — lassù si aggiungono persone — e gli inviti in sospeso
              qui non ripetono il bottone, dicono chi sta aspettando. */}
          <section style={PANNELLO}>
            <div style={{padding:'16px 18px 12px'}}>
              <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT}}>Accessi rapidi</div>
            </div>
            <div style={{padding:'0 12px 14px', display:'flex', flexDirection:'column', gap: 8}}>
              <ScorciatoiaAccesso
                icona={(BuIcons.monitor||BuIcons.phone)({size: 17, color:'currentColor'})}
                colore={DEVICE_ROLE.color} sfondo={DEVICE_ROLE.bg}
                titolo="Collega un dispositivo"
                sotto="Monitor cucina, cassa o stampante"
                onClick={() => setInvite({ roleId: null, kind: 'device' })}
              />
              <ScorciatoiaAccesso
                icona={(BuIcons.mail||BuIcons.doc)({size: 17, color:'currentColor'})}
                colore={PENDING.length ? '#B45309' : PN.MUTED}
                sfondo={PENDING.length ? PN.AMBER_SOFT : '#F4F5F7'}
                titolo={PENDING.length ? `${PENDING.length} inviti in attesa` : 'Nessun invito in sospeso'}
                sotto={PENDING.length
                  ? `${PENDING.map(p => p.email.split('@')[0]).join(', ')} non hanno ancora accettato`
                  : 'Chi inviti comparirà qui finché non accetta'}
                onClick={PENDING.length ? () => setShowPending(true) : undefined}
              />
            </div>
          </section>
        </aside>

        <section style={PANNELLO}>
          <div style={{display:'flex', gap: 10, padding: 16, borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
            <div style={{position:'relative', flex: 1, minWidth: 0}}>
              <span style={{
                position:'absolute', left: 13, top:'50%', transform:'translateY(-50%)',
                color: PN.MUTED_LIGHT, display:'inline-flex', pointerEvents:'none',
              }}><PnI.Search size={15}/></span>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Cerca per nome, email o ruolo…"
                style={{
                  width:'100%', padding:'11px 12px 11px 38px',
                  border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                  fontSize: 15, fontFamily:'inherit', outline:'none',
                  background: PN.WHITE, color: PN.TEXT,
                }}
              />
            </div>
            <select
              value={statoFiltro} onChange={e => setStatoFiltro(e.target.value)}
              style={{
                padding:'11px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                fontSize: 15, fontFamily:'inherit', background: PN.WHITE, cursor:'pointer',
                color: PN.TEXT, flexShrink: 0,
              }}
            >
              <option value="all">Tutti gli stati</option>
              <option value="attivi">Attivi</option>
              <option value="disattivati">Disattivati</option>
            </select>
          </div>

          <div style={{
            display:'grid', gridTemplateColumns: GRIGLIA_ACCESSI,
            gap: 10, padding:'11px 14px',
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
            fontSize: 13.5, fontWeight: 600, color: PN.MUTED,
          }}>
            <span>Persona</span><span>Ruolo</span><span>Accesso</span><span>Stato</span><span/>
          </div>

          {visibili.length === 0 ? (
            <div style={{padding:'46px 20px', textAlign:'center', color: PN.MUTED, fontSize: 15}}>
              Nessuno corrisponde a questa ricerca
            </div>
          ) : visibili.map((r, i) => (
            <RigaAccesso
              key={r.key} r={r} ultima={i === visibili.length - 1}
              openMenu={openMenu} setOpenMenu={setOpenMenu}
              onEditDevice={() => setInvite({ kind: 'device', editDevice: r.dato })}
            />
          ))}
        </section>
      </div>

      {/* Chiusura della pagina: il ruolo su misura è la cosa che quasi nessuno
          scopre da solo, ed è l'unica risposta a «questa persona non deve
          vedere la contabilità». */}
      <section style={{
        ...PANNELLO, marginTop: 14, padding:'14px 18px',
        display:'flex', alignItems:'center', gap: 12,
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: PN.AMBER_SOFT, color: '#B45309',
          display:'grid', placeItems:'center',
        }}>{BuIcons.bulb ? BuIcons.bulb({size: 15, color:'currentColor'}) : '💡'}</span>
        <span style={{flex: 1, minWidth: 0, fontSize: 14.5, color: PN.MUTED, lineHeight: 1.45}}>
          <strong style={{color: PN.TEXT, fontWeight: 700}}>Suggerimento:</strong> con un ruolo su misura dai
          a ciascuno solo le sezioni che gli servono — un cameriere non deve vedere la contabilità.
        </span>
        <ImpButton variant="ghost" icon={<PnI.Plus size={13}/>} onClick={() => setShowCreateRole(true)}>Crea ruolo</ImpButton>
      </section>

      {showCreateRole && <CreateRoleModal onClose={() => setShowCreateRole(false)}/>}
      {editRole && <CreateRoleModal role={editRole} onClose={() => setEditRole(null)}/>}
      {invite && <InviteModal prefill={invite} onClose={() => setInvite(null)}/>}
      {showPending && <PendingModal onClose={() => setShowPending(false)}/>}
    </div>
  );
}

// Colonne della tabella accessi — una sola definizione per testata e righe,
// così non possono scivolare l'una rispetto all'altra.
const GRIGLIA_ACCESSI = 'minmax(0, 2.2fr) 126px minmax(0, 1.7fr) 112px 34px';

const DEVICE_ROLE = {
  id: '_device', label: 'Dispositivo', icon: 'monitor',
  color: '#475569', bg: '#F1F5F9',
};

// Che cosa vede davvero un ruolo, detto in due righe: la prima le sezioni,
// la seconda quante sono sul totale. Si ricava dalle aree, non si scrive a
// mano: se domani un ruolo guadagna una sezione, qui cambia da solo.
function accessoDelRuolo(role) {
  const aree = ALL_AREAS.filter(a => (role.areas || []).includes(a.id));
  if (aree.length === ALL_AREAS.length) return { titolo: 'Accesso completo', sotto: 'Tutte le sezioni', tutte: 'Tutte le sezioni' };
  if (aree.length === 0) return { titolo: 'Nessuna sezione', sotto: 'Solo il proprio profilo', tutte: 'Nessuna sezione' };
  return {
    titolo: aree.length > 1 ? `${aree[0].label} +${aree.length - 1}` : aree[0].label,
    sotto: `${aree.length} ${aree.length === 1 ? 'sezione' : 'sezioni'} su ${ALL_AREAS.length}`,
    tutte: aree.map(a => a.label).join(', '),
  };
}

function ScorciatoiaAccesso({ icona, colore, sfondo, titolo, sotto, onClick }) {
  const spento = !onClick;
  return (
    <button
      onClick={onClick}
      disabled={spento}
      className={spento ? undefined : 'pn-btn-feedback'}
      style={{
        display:'flex', alignItems:'center', gap: 11, width:'100%', textAlign:'left',
        padding:'11px 12px', borderRadius: 11,
        border:`1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE,
        cursor: spento ? 'default' : 'pointer', fontFamily:'inherit',
        transition:'background .14s, border-color .14s',
      }}
      onMouseEnter={e => { if (!spento) { e.currentTarget.style.background = '#F7F8FA'; e.currentTarget.style.borderColor = PN.BORDER; } }}
      onMouseLeave={e => { if (!spento) { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER_SOFT; } }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: sfondo, color: colore,
        display:'grid', placeItems:'center',
      }}>{icona}</span>
      <span style={{flex: 1, minWidth: 0}}>
        <span style={{display:'block', fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>{titolo}</span>
        <span style={{
          display:'block', fontSize: 13, color: PN.MUTED, marginTop: 1, lineHeight: 1.35,
        }}>{sotto}</span>
      </span>
      {!spento && <span style={{display:'inline-flex', color: PN.MUTED_LIGHT, flexShrink: 0}}><BuIcons.chevronRight size={13}/></span>}
    </button>
  );
}

function RigaAccesso({ r, ultima, openMenu, setOpenMenu, onEditDevice }) {
  const [confermaRimozione, setConfermaRimozione] = React.useState(false);
  const aperto = openMenu === r.key;
  const iniziali = r.tipo === 'persona'
    ? r.nome.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()
    : null;
  const bloccato = r.ruolo.locked;

  return (
    <div style={{
      display:'grid', gridTemplateColumns: GRIGLIA_ACCESSI,
      gap: 10, alignItems:'center', padding:'12px 14px',
      borderBottom: ultima ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
      position:'relative',
      background: r.attivo ? 'transparent' : '#FCFCFD',
    }}>
      {/* Persona */}
      <div style={{display:'flex', alignItems:'center', gap: 11, minWidth: 0}}>
        <div style={{
          width: 38, height: 38, borderRadius: r.tipo === 'persona' ? '50%' : 10, flexShrink: 0,
          background: r.tipo === 'persona' ? (r.colore || PN.MUTED) : r.ruolo.bg,
          color: r.tipo === 'persona' ? PN.WHITE : r.ruolo.color,
          display:'grid', placeItems:'center',
          fontSize: 13.5, fontWeight: 800, letterSpacing: 0.3,
          opacity: r.attivo ? 1 : 0.55,
        }}>
          {iniziali || (r.stampante
            ? (BuIcons.doc||BuIcons.phone)({size: 18, color:'currentColor'})
            : (BuIcons.monitor||BuIcons.chef)({size: 18, color:'currentColor'}))}
        </div>
        <div style={{minWidth: 0}}>
          <div title={r.nome} style={{
            fontSize: 15.5, fontWeight: 700, color: PN.TEXT,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{r.nome}</div>
          <div style={{
            fontSize: 13.5, color: PN.MUTED, marginTop: 1,
            fontFamily: r.tipo === 'dispositivo' ? 'ui-monospace, Menlo, monospace' : 'inherit',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{r.sotto}</div>
        </div>
      </div>

      {/* Ruolo */}
      <div style={{minWidth: 0}}>
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 5, maxWidth:'100%',
          padding:'4px 10px', borderRadius: 999,
          background: r.ruolo.bg, color: r.ruolo.color,
          fontSize: 13.5, fontWeight: 700,
        }}>
          {(BuIcons[r.ruolo.icon]||BuIcons.user)({size: 12, color:'currentColor'})}
          <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.ruolo.label}</span>
        </span>
      </div>

      {/* Accesso */}
      <div style={{minWidth: 0}}>
        <div title={r.accesso.tutte} style={{
          fontSize: 14.5, fontWeight: 600, color: PN.TEXT,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{r.accesso.titolo}</div>
        <div style={{
          fontSize: 13.5, color: PN.MUTED, marginTop: 1,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{r.accesso.sotto}</div>
      </div>

      {/* Stato: la pastiglia dice se l'accesso è acceso, la riga sotto quando
          è stato usato l'ultima volta — due domande diverse. */}
      <div>
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 5,
          padding:'3px 10px', borderRadius: 999,
          background: r.attivo ? PN.GREEN_SOFT : '#F1F3F5',
          color: r.attivo ? PN.GREEN : PN.MUTED,
          fontSize: 13, fontWeight: 700,
        }}>
          <span style={{width: 6, height: 6, borderRadius:'50%', background: r.attivo ? PN.GREEN : '#9CA3AF'}}/>
          {r.attivo ? 'Attivo' : 'Disattivato'}
        </span>
        <div style={{fontSize: 12.5, color: r.online ? PN.GREEN : PN.MUTED, marginTop: 3, paddingLeft: 2}}>
          {r.quando}
        </div>
      </div>

      {/* Azioni */}
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        {bloccato ? (
          <span title="Il proprietario non si modifica" style={{fontSize: 13, opacity: 0.5}}>🔒</span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(aperto ? null : r.key); }}
            aria-label="Altre azioni"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: aperto ? '#F4F5F7' : 'transparent',
              border:'none', cursor:'pointer', color: PN.MUTED,
              display:'grid', placeItems:'center', fontSize: 19,
            }}
          >⋯</button>
        )}
      </div>

      {aperto && (
        <div onClick={e => e.stopPropagation()} style={{
          position:'absolute', top: 44, right: 14, zIndex: 60,
          minWidth: 208, ...GLASS_MENU_PERSONALE,
          boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 6,
        }}>
          {r.tipo === 'persona' ? (
            <>
              <MenuItem icon={BuIcons.user({size: 14, color: 'currentColor'})}>Modifica ruolo</MenuItem>
              <MenuItem icon={<PnI.Key size={14}/>}>Resetta password</MenuItem>
              <MenuItem icon={BuIcons.pause({size: 14, color: 'currentColor'})}>
                {r.attivo ? 'Disattiva accesso' : 'Attiva accesso'}
              </MenuItem>
              <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
              <MenuItem icon={BuIcons.trash({size: 14, color: 'currentColor'})} danger
                onClick={() => { setOpenMenu(null); setConfermaRimozione(true); }}>Rimuovi dal team</MenuItem>
            </>
          ) : (
            <>
              <MenuItem icon={BuIcons.edit({size: 14, color: 'currentColor'})}
                onClick={() => { setOpenMenu(null); onEditDevice?.(); }}>Modifica</MenuItem>
              {!r.stampante && <MenuItem icon={<PnI.Key size={14}/>}>Genera nuova password</MenuItem>}
              <MenuItem icon={BuIcons.pause({size: 14, color: 'currentColor'})}>
                {r.attivo ? 'Disattiva accesso' : 'Attiva accesso'}
              </MenuItem>
              <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
              <MenuItem icon={BuIcons.trash({size: 14, color: 'currentColor'})} danger
                onClick={() => { setOpenMenu(null); setConfermaRimozione(true); }}>Scollega dispositivo</MenuItem>
            </>
          )}
        </div>
      )}

      {confermaRimozione && (
        <div onClick={() => setConfermaRimozione(false)} style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex:200,
          backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG, borderRadius: 20,
            width: 380, maxWidth:'90%', padding: 24,
          }}>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>
              {r.tipo === 'persona' ? 'Rimuovi dal team' : 'Scollega dispositivo'}
            </div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, marginBottom: 22}}>
              Sei sicuro di voler {r.tipo === 'persona' ? 'rimuovere' : 'scollegare'} <b style={{color: PN.TEXT}}>{r.nome}</b>?
              {' '}L'accesso viene revocato subito.
            </div>
            <div style={{display:'flex', gap: 8, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setConfermaRimozione(false)}>Annulla</ImpButton>
              <ImpButton variant="danger" onClick={() => setConfermaRimozione(false)}>
                {r.tipo === 'persona' ? 'Rimuovi' : 'Scollega'}
              </ImpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ruolo "Cucina": selezionabile negli inviti (persona che guarda le comande),
// non è una sezione del Personale finché nessuno lo ricopre.
const CUCINA_ROLE = {
  id: 'cucina',
  label: 'Cucina',
  desc: 'Visualizza le comande in cucina',
  color: '#475569', bg: '#F1F5F9',
  icon: 'chef',
  areas: ['cucina'],
};

// Etichette leggibili dei permessi mostrati nel riquadro del ruolo.
const PERM_LABELS = {
  panoramica: 'Panoramica', sala: 'Sala e prenotazioni', cucina: 'Comande in cucina',
  app: 'App staff', statistiche: 'Statistiche', contabilita: 'Contabilità',
  supporto: 'Supporto', impostazioni: 'Impostazioni',
};
const PERM_ICONS = {
  panoramica: 'stats', sala: 'utensils', cucina: 'chef', app: 'phone',
  statistiche: 'stats', contabilita: 'money', supporto: 'chat', impostazioni: 'settings',
};

// ─── Modulo del dispositivo ────────────────────────────────────────────────
// Estratto dalla modale perche ora vive in due posti: dentro «Aggiungi membro /
// dispositivo» e in pagina, nel passo Personale. Duplicarlo avrebbe voluto dire
// due moduli che divergono al primo campo aggiunto. Lo stato sta in
// useDeviceState e si passa in blocco: dieci setter come dieci prop erano una
// firma che nessuno avrebbe letto.
const allCatsCount = MENUS.reduce((n, m) => n + m.categories.length, 0);

function useDeviceState(tipoIniziale) {
  const [deviceTypeId, setDeviceTypeId] = React.useState(tipoIniziale || 'kitchen-monitor');
  const [deviceName, setDeviceName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [openTypeMenu, setOpenTypeMenu] = React.useState(false);
  // printerCats: Set di chiavi composite "menuId:catId" — permette selezione tra menu diversi
  const [printerCats, setPrinterCats] = React.useState(new Set());
  const isPrinter = deviceTypeId.startsWith('printer-');
  const selectedPrinter = AVAILABLE_PRINTERS.find(p => p.id === deviceTypeId);
  const deviceType = isPrinter
    ? { id: deviceTypeId, label: 'Stampante', color: PN.BLUE, bg: PN.BLUE_SOFT, icon: 'doc', noCredentials: true }
    : (DEVICE_TYPES.find(t => t.id === deviceTypeId) || DEVICE_TYPES[0]);
  const deviceValid = isPrinter
    ? deviceName.trim().length > 0 && printerCats.size > 0
    : (username.trim().length > 0 && password.length >= 4);
  const generatePwd = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p = '';
    for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPassword(p); setShowPwd(true);
  };
  const reset = () => { setDeviceName(''); setUsername(''); setPassword(''); setShowPwd(false); setPrinterCats(new Set()); };
  return { deviceTypeId, setDeviceTypeId, deviceName, setDeviceName, username, setUsername,
    password, setPassword, showPwd, setShowPwd, openTypeMenu, setOpenTypeMenu,
    printerCats, setPrinterCats, isPrinter, selectedPrinter, deviceType, deviceValid,
    generatePwd, reset };
}

function DeviceForm({ st }) {
  const { deviceTypeId, setDeviceTypeId, deviceName, setDeviceName, username, setUsername,
    password, setPassword, showPwd, setShowPwd, openTypeMenu, setOpenTypeMenu,
    printerCats, setPrinterCats, isPrinter, selectedPrinter, deviceType, generatePwd } = st;
  return (
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
                      background:'rgba(255,255,255,0.8)',
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
                      background:'rgba(255,255,255,0.8)',
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
                      outline:'none', background:'rgba(255,255,255,0.8)',
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
                        background:'rgba(255,255,255,0.8)',
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
  );
}

function InviteModal({ onClose, prefill }) {
  const initialKind = prefill?.kind === 'device' ? 'device' : 'person';
  // Se prefill.roleId è quello di un ruolo selezionabile, usa quello; altrimenti default
  const prefillRoleSelectable = prefill?.roleId
    && [...ROLES, CUCINA_ROLE, ...CUSTOM_ROLES].some(r => r.id === prefill.roleId && !r.locked);
  const [kind, setKind] = React.useState(initialKind);

  // Persona
  const [pname, setPname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roleId, setRoleId] = React.useState(prefillRoleSelectable ? prefill.roleId : 'cameriere');
  const [msg, setMsg] = React.useState('');
  const allRolesForInvite = [...ROLES, CUCINA_ROLE, ...CUSTOM_ROLES];
  const role = allRolesForInvite.find(r => r.id === roleId) || ROLES[0];
  const personValid = /\S+@\S+\.\S+/.test(email);
  // Riquadro permessi del ruolo selezionato
  const perms = role.areas.filter(a => PERM_LABELS[a]).map(a => ({ icon: PERM_ICONS[a] || 'doc', label: PERM_LABELS[a] }));
  if (role.id === 'cameriere') perms.splice(1, 0, { icon: 'utensils', label: 'Gestione tavoli e ordini' });
  const noSettings = !role.areas.includes('impostazioni');

  // Dispositivo
  // prefill.deviceTypeId: chi arriva dalle tessere «Stampante» / «Kitchen
  // Monitor» ha gia scelto, e ritrovarsi il menu sul valore sbagliato sarebbe
  // chiedergli la stessa cosa due volte.
  const dev = useDeviceState(prefill?.deviceTypeId);
  const { deviceTypeId, setDeviceTypeId, deviceName, setDeviceName, username,
    setUsername, password, isPrinter, deviceType, deviceValid } = dev;

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

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20,
        width: kind === 'person' ? 620 : 480, maxWidth:'100%', position:'relative',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{padding: '20px 24px', borderBottom: `1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize: 17, fontWeight: 700, marginBottom: 3}}>
            {kind === 'person' ? 'Invita una persona' : 'Aggiungi un membro / dispositivo'}
          </div>
          <div style={{fontSize: 14.5, color: PN.MUTED}}>
            {kind === 'person'
              ? 'Invia un accesso al gestionale o all\'app staff.'
              : 'Crea username e password per il dispositivo. Non serve un\'email'}
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
              {/* Due colonne: campi a sinistra, riquadro del ruolo a destra */}
              <div style={{display:'grid', gridTemplateColumns:'minmax(0, 1fr) 210px', gap: 16, alignItems:'start'}}>
                <div style={{minWidth: 0}}>
                  <ImpField label="Nome e cognome">
                    <input
                      type="text"
                      value={pname}
                      onChange={e => setPname(e.target.value)}
                      placeholder="Es. Mario Rossi"
                      style={{
                        width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                        borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                        background:'rgba(255,255,255,0.8)',
                      }}
                    />
                  </ImpField>
                  <ImpField label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="es. mario.rossi@email.it"
                      style={{
                        width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                        borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                        background:'rgba(255,255,255,0.8)',
                      }}
                    />
                  </ImpField>
                  <ImpField label="Ruolo">
                    <div style={{position:'relative'}}>
                      <select
                        value={roleId}
                        onChange={e => setRoleId(e.target.value)}
                        style={{
                          width:'100%', padding:'10px 34px 10px 12px',
                          border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                          fontSize: 15.5, fontFamily:'inherit', outline:'none',
                          background:'rgba(255,255,255,0.8)', color: PN.TEXT,
                          appearance:'none', WebkitAppearance:'none', cursor:'pointer',
                        }}>
                        {allRolesForInvite.filter(r => !r.locked).map(r => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                      <span style={{position:'absolute', right: 12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color: PN.MUTED, display:'inline-flex'}}>
                        <PnI.ChevronDown size={12}/>
                      </span>
                    </div>
                  </ImpField>
                  <ImpField label="Messaggio opzionale">
                    <div style={{position:'relative'}}>
                      <textarea
                        value={msg}
                        maxLength={200}
                        onChange={e => setMsg(e.target.value)}
                        placeholder="Scrivi un messaggio per il tuo nuovo collaboratore…"
                        rows={3}
                        style={{
                          width:'100%', padding:'10px 12px 24px', border:`1px solid ${PN.BORDER}`,
                          borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none', resize:'vertical',
                          background:'rgba(255,255,255,0.8)',
                        }}
                      />
                      <span style={{position:'absolute', right: 10, bottom: 10, fontSize: 12, color: PN.MUTED}}>
                        {msg.length}/200
                      </span>
                    </div>
                  </ImpField>
                </div>

                {/* Riquadro ruolo: cosa potrà fare chi accetta l'invito */}
                <div style={{
                  background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`,
                  borderRadius: 12, padding: '14px 14px 12px',
                }}>
                  <div style={{fontSize: 12.5, color: PN.MUTED, marginBottom: 2}}>Ruolo selezionato:</div>
                  <div style={{fontSize: 15.5, fontWeight: 700, color: PN.PINK_DARK, marginBottom: 12}}>{role.label}</div>
                  <div style={{display:'flex', flexDirection:'column', gap: 10}}>
                    {perms.map((p, i) => (
                      <div key={i} style={{display:'flex', alignItems:'center', gap: 9}}>
                        <span style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`,
                          display:'grid', placeItems:'center', color:'#475569',
                        }}>{(BuIcons[p.icon]||BuIcons.doc)({size: 13, color:'currentColor'})}</span>
                        <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, lineHeight: 1.35}}>{p.label}</span>
                      </div>
                    ))}
                    {noSettings && (
                      <div style={{display:'flex', alignItems:'center', gap: 9}}>
                        <span style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`,
                          display:'grid', placeItems:'center', color:'#475569',
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                          </svg>
                        </span>
                        <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, lineHeight: 1.35}}>Nessun accesso alle impostazioni</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 2, padding:'10px 12px',
                background:'#F4F5F7', borderRadius: 9,
                fontSize: 13, color: PN.MUTED,
                display:'flex', alignItems:'center', gap: 8,
              }}>
                {(BuIcons.info||BuIcons.doc)({size: 14, color:'currentColor'})}
                L'invitato riceverà un'email con il link per attivare l'accesso.
              </div>
            </>
          )}

          {kind === 'device' && <DeviceForm st={dev}/>}
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

function PendingModal({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20,
        width: 480, maxWidth:'100%', position:'relative',
        maxHeight:'90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{padding:'20px 24px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize: 17, fontWeight: 700, marginBottom: 3}}>Inviti in sospeso</div>
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

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20,
        width: 480, maxWidth:'100%', position:'relative',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div style={{fontSize: 17, fontWeight: 700, marginBottom: 3}}>
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
                background:'rgba(255,255,255,0.8)',
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

// ─── Step "Personale" della Configurazione completa ─────────────────────────
// Layout onboarding: card-ruolo selezionabili, invito rapido in riga, elenco
// unificato "Inviti e accessi". Dispositivi, ruoli custom e invito completo
// con messaggio restano raggiungibili da qui (stesse modali del Personale).

// Le due sole cose che un locale collega il primo giorno. Il resto — seconda
// stampante, monitor pizza — si aggiunge dopo, e dirlo evita di far scegliere
// adesso qualcosa che non serve adesso.
const STEP_DEVICES = [
  { id: 'printer', label: 'Stampante',      desc: 'Stampa gli ordini da inviare in cucina o al bar', icon: 'doc' },
  { id: 'monitor', label: 'Kitchen Monitor', desc: 'Mostra le comande in tempo reale in cucina',      icon: 'monitor' },
];
// Due passi e non tre: il terzo — «conferma il collegamento» — descriveva quello
// che succede DOPO aver premuto la CTA, cioe una cosa che l'utente non deve fare.
// Ognuno e una riga sola: le descrizioni ripetevano il titolo con altre parole
// («Scegli il dispositivo» / «Seleziona il dispositivo che vuoi configurare»).
const DEVICE_STEPS = [
  'Scegli il dispositivo',
  'Collegalo alla rete Wi-Fi o all\'alimentazione',
];

// I ruoli del personale sono due, e sono i due modi in cui si prende un ordine:
// dalla cassa del locale o dall'app in sala. «Manager» non era un ruolo del
// personale — chi gestisce il locale è il proprietario, che il gestionale ce
// l'ha già; e «Cucina» non era una persona da invitare ma il Kitchen Monitor,
// che si collega come dispositivo nella sezione qui sotto.
// Cameriere per primo, ed è il ruolo da cui parte l'invito: è quello che un
// locale invita in numero, e la cassa la tiene spesso chi il gestionale ce
// l'ha già.
const STEP_ROLES = [
  { id: 'cameriere', label: 'Cameriere', desc: 'Usa l\'app staff per tavoli, ordini e conto',    icon: 'waiter' },
  { id: 'cassa',     label: 'Cassa',     desc: 'Prende ordini e incassa dalla cassa del locale', icon: 'receipt' },
];

window.PERSONALE_TEAM_INITIAL = [
  { id: 't1', kind: 'person', name: 'Marco Rossi',    email: 'marco@delborgo.it',  role: 'Cassa',              status: 'active' },
  { id: 't2', kind: 'person', name: 'Giulia Bianchi', email: 'giulia@delborgo.it', role: 'Cameriere',          status: 'invited' },
  { id: 't3', kind: 'person', name: 'Luca Verdi',     email: 'luca@delborgo.it',   role: 'Cameriere',          status: 'active' },
  { id: 't4', kind: 'device', name: 'Monitor cucina', email: 'PG1-cucina',         role: 'Dispositivo cucina', status: 'active' },
];

// Configurare un dispositivo e l'altra meta del passo: le persone si invitano, i
// dispositivi si collegano. Vive in una SEZIONE SUA e non sotto lo stesso titolo
// — sono due lavori diversi, e nella stessa card sembravano un elenco di campi
// che continua.
function DispositivoStep({ setTeam }) {
  const [selDevice, setSelDevice] = React.useState('printer');
  const dev = useDeviceState(AVAILABLE_PRINTERS[0].id);

  // Il dispositivo entra nell'elenco e il modulo si svuota: la CTA e la fine di
  // un'operazione, non l'apertura di un'altra schermata.
  const aggiungiDispositivo = () => {
    if (!dev.deviceValid) return;
    const nome = dev.deviceName.trim() || (dev.isPrinter ? 'Stampante' : 'Monitor cucina');
    setTeam(t => [...t, {
      id: `d${Date.now()}`, kind: 'device', name: nome,
      email: dev.isPrinter ? (dev.selectedPrinter ? dev.selectedPrinter.ip : '—') : `PG1-${dev.username.trim()}`,
      role: dev.isPrinter ? 'Stampante' : 'Kitchen Monitor', status: 'active',
    }]);
    dev.reset();
  };

  return (
    <div>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Configura un dispositivo</div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, marginBottom: 14}}>
          Collega solo i dispositivi che ti servono per iniziare. Potrai aggiungerne altri in seguito.
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap: 12}}>
          {STEP_DEVICES.map(d => (
            <StepDeviceCard key={d.id} d={d} on={selDevice === d.id}
              onClick={() => { setSelDevice(d.id);
                dev.setDeviceTypeId(d.id === 'printer' ? AVAILABLE_PRINTERS[0].id : 'kitchen-monitor'); }}/>
          ))}
        </div>

        {/* Suggerimento, non un passo dell'interfaccia. Con bordo, fondo bianco e
            pastiglie rosa pesava quanto le card selezionabili qui sopra, e la
            gerarchia diceva il falso: li si sceglie, qui si legge e basta.
            Fondo incassato, niente bordo, una riga sola. */}
        <div style={{
          marginTop: 10, padding: '9px 12px', borderRadius: 10, background: PN.BG,
          display:'flex', alignItems:'center', justifyContent:'center',
          gap: 8, flexWrap:'wrap', rowGap: 5,
        }}>
          <span style={{display:'inline-flex', color: PN.MUTED, flexShrink: 0}}>
            {BuIcons.bulb({size: 14, color:'currentColor'})}
          </span>
          {/* Freccia disegnata a mano: le icone di PnI non inoltrano `style`,
              quindi ruotare una chevron non funziona. */}
          {DEVICE_STEPS.map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && (
                <span style={{display:'inline-flex', alignItems:'center', color: PN.BORDER, flexShrink: 0}}>
                  <svg width="26" height="8" viewBox="0 0 26 8" fill="none" stroke="currentColor"
                    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="4" x2="18" y2="4" strokeDasharray="3 3"/>
                    <polyline points="21,1.2 24,4 21,6.8"/>
                  </svg>
                </span>
              )}
              <span style={{fontSize: 12.5, color: PN.MUTED, lineHeight: 1.45}}>
                <span style={{fontWeight: 700, marginRight: 2}}>{i + 1}</span>{' '}{t}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* La configurazione sta in pagina: era una modale, e una modale sopra un
            passo di onboarding e una finestra sopra una finestra. */}
        <div style={{
          marginTop: 12, padding:'16px 18px', borderRadius: 12,
          border:`1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE,
        }}>
          <DeviceForm st={dev}/>
        </div>

        <div style={{display:'flex', alignItems:'center', gap: 12, marginTop: 14, flexWrap:'wrap'}}>
          <span style={{color: PN.GREEN || '#16A34A', display:'inline-flex', flexShrink: 0}}>
            {BuIcons.shield({size: 15, color:'currentColor'})}
          </span>
          <span style={{fontSize: 13, color: PN.MUTED, flex: 1, minWidth: 180}}>
            Potrai aggiungere altri dispositivi in qualsiasi momento.
          </span>
          {/* CTA finale: si accende quando il dispositivo e configurato davvero,
              come faceva il piede della modale che ha sostituito. */}
          <ImpButton variant="pink" disabled={!dev.deviceValid} onClick={aggiungiDispositivo}>
            Configura dispositivo
          </ImpButton>
        </div>
    </div>
  );
}

function PersonaleStep({ team, setTeam }) {
  const [selRole, setSelRole] = React.useState('cameriere');
  const [invName, setInvName] = React.useState('');
  const [invEmail, setInvEmail] = React.useState('');
  const [showCreateRole, setShowCreateRole] = React.useState(false);
  const emailValid = /\S+@\S+\.\S+/.test(invEmail);

  const roleLabel = (STEP_ROLES.find(r => r.id === selRole) || STEP_ROLES[0]).label;
  const addInvite = () => {
    if (!emailValid) return;
    const name = invName.trim() || invEmail.split('@')[0];
    setTeam(t => [...t, { id: `t${Date.now()}`, kind: 'person', name, email: invEmail.trim(), role: roleLabel, status: 'invited' }]);
    setInvName(''); setInvEmail('');
  };
  const removeMember = (id) => setTeam(t => t.filter(m => m.id !== id));


  return (
    <div>
      {/* Card-ruolo: selezionano il ruolo dell'invito rapido qui sotto */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap: 12}}>
        {STEP_ROLES.map(r => (
          <StepRoleCard key={r.id} r={r} on={selRole === r.id} onClick={() => setSelRole(r.id)}/>
        ))}
      </div>

      {/* Invito rapido in riga */}
      <div style={{marginTop: 20}}>
        {/* Niente select del ruolo: lo scelgono le tre tessere qui sopra, e
            chiederlo di nuovo nella stessa schermata faceva due comandi per una
            decisione sola — con il rischio che dicessero cose diverse. Qui il
            ruolo scelto si LEGGE, accanto al titolo. */}
        <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 10}}>
          <span style={{fontSize: 14.5, fontWeight: 700}}>Invita il team</span>
          <span style={{fontSize: 13, color: PN.MUTED}}>
            come <b style={{color: PN.PINK_DARK, fontWeight: 700}}>{roleLabel}</b>
          </span>
        </div>
        <div style={{display:'flex', gap: 10, alignItems:'stretch'}}>
          <input value={invName} onChange={e => setInvName(e.target.value)} placeholder="Nome e cognome"
            style={{flex: 1, minWidth: 0, padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 9, fontSize: 14.5, fontFamily:'inherit', outline:'none', background: PN.WHITE}}/>
          <input value={invEmail} onChange={e => setInvEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addInvite(); }} placeholder="Email" type="email"
            style={{flex: 1, minWidth: 0, padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 9, fontSize: 14.5, fontFamily:'inherit', outline:'none', background: PN.WHITE}}/>
          <AddInviteBtn disabled={!emailValid} onClick={addInvite}/>
        </div>
      </div>

      {/* Configurare un dispositivo e il secondo mezzo passo del Personale: le
          persone si invitano, i dispositivi si collegano. Sta qui e non in fondo
          all'elenco perche e un'azione, non una riga da aggiungere a una lista. */}
      {showCreateRole && <CreateRoleModal onClose={() => setShowCreateRole(false)}/>}
    </div>
  );
}

// Tessera dispositivo: orizzontale — icona a sinistra, testo a destra — perche
// i dispositivi sono due e non tre, e in orizzontale riempiono la riga invece di
// lasciare due colonne mezze vuote.
function StepDeviceCard({ d, on, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position:'relative', textAlign:'left', fontFamily:'inherit', cursor:'pointer',
        display:'flex', alignItems:'center', gap: 14,
        padding:'14px 44px 14px 14px', borderRadius: 12,
        border:`1.5px solid ${on ? PN.PINK : hover ? PN.BORDER : PN.BORDER_SOFT}`,
        background: on ? '#FFF7F7' : PN.WHITE,
        boxShadow: hover && !on ? '0 6px 16px rgba(15, 17, 21, 0.06)' : 'none',
        transform: hover && !on ? 'translateY(-1px)' : 'none',
        transition:'border-color 150ms ease, background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
      }}>
      <span style={{
        position:'absolute', top: 14, right: 14,
        width: 16, height: 16, borderRadius:'50%',
        border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center', transition:'border-color 150ms ease',
      }}>
        {on && <span style={{width: 8, height: 8, borderRadius:'50%', background: PN.PINK}}/>}
      </span>
      <span style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0, display:'grid', placeItems:'center',
        background: on ? PN.PINK_SOFT : '#F4F5F7', color: on ? PN.PINK_DARK : '#475569',
        transition:'background 150ms ease, color 150ms ease',
      }}>{(BuIcons[d.icon]||BuIcons.monitor)({size: 20, color:'currentColor'})}</span>
      <span style={{minWidth: 0}}>
        <span style={{display:'block', fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>{d.label}</span>
        <span style={{display:'block', fontSize: 13, color: PN.MUTED, lineHeight: 1.4}}>{d.desc}</span>
      </span>
    </button>
  );
}

// Card-ruolo con radio in alto a destra: feedback in hover, brand da selezionata.
function StepRoleCard({ r, on, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position:'relative', textAlign:'left', fontFamily:'inherit', cursor:'pointer',
        padding:'16px 16px 14px', borderRadius: 12,
        border:`1.5px solid ${on ? PN.PINK : hover ? PN.BORDER : PN.BORDER_SOFT}`,
        background: on ? '#FFF7F7' : PN.WHITE,
        boxShadow: hover && !on ? '0 6px 16px rgba(15, 17, 21, 0.06)' : 'none',
        transform: hover && !on ? 'translateY(-1px)' : 'none',
        transition:'border-color 150ms ease, background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
      }}>
      {/* Radio */}
      <span style={{
        position:'absolute', top: 12, right: 12,
        width: 16, height: 16, borderRadius:'50%',
        border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center',
        transition:'border-color 150ms ease',
      }}>
        {on && <span style={{width: 8, height: 8, borderRadius:'50%', background: PN.PINK}}/>}
      </span>
      <span style={{
        width: 40, height: 40, borderRadius:'50%', display:'grid', placeItems:'center',
        background: on ? PN.PINK_SOFT : '#F4F5F7', color: on ? PN.PINK_DARK : '#475569',
        marginBottom: 10, transition:'background 150ms ease, color 150ms ease',
      }}>{(BuIcons[r.icon]||BuIcons.user)({size: 18, color:'currentColor'})}</span>
      <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginBottom: 3}}>{r.label}</div>
      <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.45}}>{r.desc}</div>
    </button>
  );
}

// "+ Aggiungi invito": chip corallo tenue con feedback hover/pressione.
function AddInviteBtn({ disabled, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        flexShrink: 0, padding:'10px 16px', borderRadius: 9,
        border:`1.5px solid ${hover && !disabled ? PN.PINK : '#FFD5D6'}`,
        background: PN.PINK_SOFT, color: PN.PINK_DARK,
        fontSize: 14, fontWeight: 700, fontFamily:'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transform: pressed && !disabled ? 'scale(0.96)' : 'none',
        transition:'border-color 150ms ease, transform 130ms ease, opacity 150ms ease',
        display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
      }}>
      <PnI.Plus size={12}/> Invita
    </button>
  );
}
window.ImpPersonale = ImpPersonale;
window.PersonaleStep = PersonaleStep;
window.DispositivoStep = DispositivoStep;

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

// I ruoli del personale sono tre: chi incassa, chi possiede il locale, chi
// serve ai tavoli. «Manager» non c'era fra questi — chi gestisce il locale è il
// titolare, che il gestionale ce l'ha già — e «Cucina» non era una persona da
// invitare ma il Kitchen Monitor, che entra come dispositivo.
// Oltre a questi ci sono i dispositivi e, se il locale se li è creati, i ruoli
// personalizzati: sono le altre due voci della colonna a sinistra.
const ROLES = [
  {
    id: 'cassa',
    label: 'Cassa',
    desc: 'Prende ordini e incassa al bancone',
    color: PN.BLUE, bg: PN.BLUE_SOFT,
    icon: 'receipt',
    areas: ['vendita','sala'],
  },
  {
    id: 'titolare',
    label: 'Titolare',
    desc: 'Vede tutto · uno solo, è chi ha creato il gestionale',
    // Ambra e non vinaccia: in elenco il titolare finiva in mezzo a Cassa e
    // Cameriere, tre pastiglie rosse che di lontano erano la stessa cosa. È il
    // ruolo che sta a sé — uno solo, vede tutto — e la corona d'oro lo dice
    // meglio di un rosso in più.
    color: '#B45309', bg: PN.AMBER_SOFT,
    icon: 'crown',
    locked: true,
    areas: ['panoramica','sala','vendita','cucina','app','statistiche','contabilita','supporto','impostazioni'],
  },
  {
    id: 'cameriere',
    label: 'Cameriere',
    desc: 'Visibilità solo dall\'app cameriere',
    color: PN.PINK_DARK, bg: PN.PINK_SOFT,
    icon: 'waiter',
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

// Come la cucina vede e manda gli ordini. È la sola cosa che cambia davvero
// fra due monitor identici, e si chiede al collegamento perché cambia il modo
// di lavorare in cucina, non un colore: il ticket del KDS porta già `course`
// (1 antipasto, 2 primo, 3 secondo, 4 dessert, null = portata unica), e le due
// visualizzazioni sono i due modi di leggerlo. Resta modificabile in
// Impostazioni → Operazioni: chi apre come pub e poi mette il servizio al
// tavolo non deve ricollegare il monitor.
// Le icone dicono il comportamento e non il tipo di locale: quello lo dice già
// il nome, mentre la differenza che conta è tutto-insieme contro diviso.
// `short`: in elenco la pastiglia sta accanto a «Kitchen Monitor», e «Visualizza-
// zione» lì è la parola che si capisce da sé — resta «Pub» / «Ristorante».
const KDS_VIEWS = [
  { id: 'pub', label: 'Visualizzazione Pub', short: 'Pub', icon: 'bolt',
    desc: 'Tutte le righe escono insieme' },
  { id: 'ristorante', label: 'Visualizzazione Ristorante', short: 'Ristorante', icon: 'split',
    desc: 'Le righe partono una portata alla volta' },
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

// «Vendita diretta» è la cassa del locale: era una sezione del gestionale che
// nel modello dei permessi non esisteva, e senza di lei il ruolo Cassa non
// avrebbe avuto niente da vedere.
const ALL_AREAS = [
  { id: 'panoramica', label: 'Panoramica', icon: 'stats' },
  { id: 'sala', label: 'Sala e prenotazioni', icon: 'utensils' },
  { id: 'vendita', label: 'Vendita diretta', icon: 'receipt' },
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
  { name: 'Marco Silvestri', email: 'marco@delborgo.it', role: 'titolare', last: 'ora', online: true, color: '#7c2436' },
  { name: 'Davide Rossi', email: 'davide@delborgo.it', role: 'cassa', last: 'ieri', online: false, color: '#85B8CB' },
  { name: 'Giovanni Rana', email: 'giovanni@delborgo.it', role: 'cameriere', last: '2 min fa', online: true, color: '#E8A87C' },
  { name: 'Sara Conti', email: 'sara@delborgo.it', role: 'cameriere', last: '1 ora fa', online: false, color: '#FFC09F' },
  { name: 'Luca Ferretti', email: 'luca@delborgo.it', role: 'sommelier', last: '3 ore fa', online: false, color: '#7C3AED', active: false },
];

// kdsView: la visualizzazione scelta al collegamento (vedi KDS_VIEWS). Sta sul
// dispositivo e non sul locale perché due monitor dello stesso locale possono
// lavorare in due modi — la pizza esce tutta insieme, la sala va per portate.
const DEVICES = [
  { name: 'Monitor cucina principale', username: 'PG1-cucina', deviceType: 'kitchen-monitor', kdsView: 'ristorante', last: 'ora', online: true },
  { name: 'Monitor pizza', username: 'PG1-pizza', deviceType: 'kitchen-monitor', kdsView: 'pub', last: '5 min fa', online: true },
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
      const ruolo = allRoles.find(r => r.id === p.role) || RUOLO_IGNOTO;
      return {
        key: `p-${p.email}`, tipo: 'persona', dato: p,
        nome: p.name, sotto: p.email, colore: p.color,
        ruolo, gruppo: ruolo.custom ? '_custom' : ruolo.id,
        accesso: accessoDelRuolo(ruolo),
        attivo: p.active !== false,
      };
    }),
    ...DEVICES.map((d, i) => {
      const stampante = d.deviceType === 'printer';
      return {
        key: `d-${i}`, tipo: 'dispositivo', dato: d, idx: i,
        nome: d.name, sotto: stampante ? d.ip : d.username,
        ruolo: DEVICE_ROLES[d.deviceType] || DEVICE_ROLE, gruppo: '_devices',
        accesso: stampante
          ? { titolo: 'Cassa', sotto: 'Scontrini e comande' }
          : { titolo: 'Cucina', sotto: 'Schermo comande' },
        attivo: d.active !== false,
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
      {/* Testata: titolo, sottotitolo e le tre azioni di sempre. STICKY sul
          contenitore che scrolla (il .pn-scroll della shell): le azioni della
          pagina restano a portata anche in fondo alla tabella. L'ombra stacca
          il box dalle righe che gli passano sotto. */}
      <section style={{
        ...PANNELLO, marginBottom: 14, padding: '18px 22px',
        display:'flex', alignItems:'flex-start', gap: 16,
        position:'sticky', top: 0, zIndex: 30,
        boxShadow: '0 10px 24px -18px rgba(15,17,21,0.28)',
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>Personale</div>
          <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.4}}>
            Vedi chi accede al gestionale e con quali permessi, e gestisci persone e dispositivi
          </div>
        </div>
        {/* Una sola azione in testata: aggiungere una persona. Inviti in
            sospeso e Crea ruolo vivono già nella colonna destra. */}
        <div style={{display:'flex', gap: 8, alignItems:'center', flexShrink: 0}}>
          <ImpButton
            variant="primary"
            icon={<PnI.Plus size={13}/>}
            onClick={() => setInvite({ roleId: null, kind: 'person' })}
          >Aggiungi persona</ImpButton>
        </div>
      </section>

      {/* Tre colonne: ruoli a sinistra, elenco al centro (più stretto),
          e a destra gli accessi rapidi col ruolo su misura sotto. */}
      <div style={{display:'grid', gridTemplateColumns:'248px minmax(0, 1fr) 248px', gap: 14, alignItems:'start'}}>
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

          {/* Il ruolo su misura: quasi nessuno lo scopre da solo, ed è
              l'unica risposta a «questa persona non deve vedere la
              contabilità». Sta sotto i Ruoli, che è dove si parla di ruoli. */}
          <section style={{...PANNELLO, padding:'14px 16px', display:'flex', flexDirection:'column', gap: 11}}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 10}}>
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: PN.AMBER_SOFT, color: '#B45309',
                display:'grid', placeItems:'center',
              }}>{BuIcons.bulb ? BuIcons.bulb({size: 15, color:'currentColor'}) : '💡'}</span>
              <span style={{flex: 1, minWidth: 0, fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45}}>
                <strong style={{color: PN.TEXT, fontWeight: 700}}>Suggerimento:</strong> con un ruolo su misura
                dai a ciascuno solo le sezioni che gli servono.
              </span>
            </div>
            <ImpButton
              variant="ghost"
              icon={<PnI.Plus size={13}/>}
              onClick={() => setShowCreateRole(true)}
              style={{width:'100%', justifyContent:'center'}}
            >Crea ruolo</ImpButton>
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
            <span>Persona</span><span>Ruolo</span><span>Stato</span><span/>
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

        <aside style={{display:'flex', flexDirection:'column', gap: 14}}>
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

      </div>

      {showCreateRole && <CreateRoleModal onClose={() => setShowCreateRole(false)}/>}
      {editRole && <CreateRoleModal role={editRole} onClose={() => setEditRole(null)}/>}
      {invite && <InviteModal prefill={invite} onClose={() => setInvite(null)}/>}
      {showPending && <PendingModal onClose={() => setShowPending(false)}/>}
    </div>
  );
}

// Colonne della tabella accessi — una sola definizione per testata e righe,
// così non possono scivolare l'una rispetto all'altra.
const GRIGLIA_ACCESSI = 'minmax(0, 2.2fr) minmax(0, 1.2fr) 112px 34px';

const DEVICE_ROLE = {
  id: '_device', label: 'Dispositivo', icon: 'monitor',
  color: '#475569', bg: '#F1F5F9',
};

// In riga il ruolo dice che cosa È il dispositivo, non che è un dispositivo:
// «Dispositivo» su tre righe su tre nascondeva l'unica cosa che si vuole sapere
// a colpo d'occhio, se quello è un monitor o una stampante. La stampante prende
// il blu che ha già nel modulo di collegamento. Il filtro a sinistra resta uno
// solo — «Dispositivi» — perché lì si cerca la famiglia, non il pezzo.
const DEVICE_ROLES = {
  'kitchen-monitor': { id: '_device_monitor', label: 'Kitchen Monitor', icon: 'monitor',
    color: '#475569', bg: '#F1F5F9' },
  'printer':         { id: '_device_printer', label: 'Stampante', icon: 'doc',
    color: PN.BLUE, bg: PN.BLUE_SOFT },
};

// Che cosa vede davvero un ruolo, detto in due righe: la prima le sezioni,
// la seconda quante sono sul totale. Si ricava dalle aree, non si scrive a
// mano: se domani un ruolo guadagna una sezione, qui cambia da solo.
// L'ordine è quello dichiarato dal ruolo, non quello del menu: il titolo mostra
// la prima area, e per la Cassa deve essere «Vendita diretta» — che è il suo
// mestiere — non «Sala e prenotazioni» solo perché la sala viene prima nel menu.
function accessoDelRuolo(role) {
  const aree = (role.areas || []).map(id => ALL_AREAS.find(a => a.id === id)).filter(Boolean);
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

      {/* Ruolo. La visualizzazione del monitor (Pub / Ristorante) non sta qui:
          in questa colonna una seconda pastiglia costa più di quello che dice,
          e chi la vuole sapere apre «Modifica», dov'è la scelta vera. */}
      <div style={{minWidth: 0}}>
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 5, maxWidth:'100%',
          padding:'4px 10px', borderRadius: 999,
          background: r.ruolo.bg, color: r.ruolo.color,
          fontSize: 13.5, fontWeight: 700,
        }}>
          {/* Nella riga di un dispositivo l'icona qui ripeteva quella del
              riquadro a sinistra, che per le persone sono invece le iniziali:
              toglierla libera i 17px che servono a tenere la visualizzazione
              sulla stessa riga. */}
          {r.tipo !== 'dispositivo' && (BuIcons[r.ruolo.icon]||BuIcons.user)({size: 12, color:'currentColor'})}
          <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.ruolo.label}</span>
        </span>
      </div>

      {/* Stato: solo la pastiglia — l'ultimo accesso («Online ora», «ieri»)
          è stato tolto, ripeteva verde su quasi ogni riga senza dire nulla.
          Per il titolare non c'è: è l'unico che non si può disattivare, quindi
          «Attivo» non era un'informazione ma una casella sempre uguale. */}
      <div>
        {!bloccato && <span style={{
          display:'inline-flex', alignItems:'center', gap: 5,
          padding:'3px 10px', borderRadius: 999,
          background: r.attivo ? PN.GREEN_SOFT : '#F1F3F5',
          color: r.attivo ? PN.GREEN : PN.MUTED,
          fontSize: 13, fontWeight: 700,
        }}>
          <span style={{width: 6, height: 6, borderRadius:'50%', background: r.attivo ? PN.GREEN : '#9CA3AF'}}/>
          {r.attivo ? 'Attivo' : 'Disattivato'}
        </span>}
      </div>

      {/* Azioni */}
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        {bloccato ? (
          // Stessa impronta del bottone «⋯» delle altre righe, così il segno
          // cade dove cade il menu invece di penzolare più piccolo e più in su.
          // Icona e non emoji: l'emoji cambia disegno da un sistema all'altro e
          // qui dentro era l'unica cosa colorata di giallo.
          <span title="Il titolare non si modifica" style={{
            width: 32, height: 32, borderRadius: 8,
            display:'grid', placeItems:'center', color: PN.MUTED,
          }}>{BuIcons.lock({size: 17, color:'currentColor'})}</span>
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
            ...IMP_MODAL_PANEL,
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

// Ripiego per una persona il cui ruolo non esiste più — un ruolo personalizzato
// cancellato, per dire. Prima al suo posto c'era un ruolo «Cucina» invitabile
// per email: ma chi guarda le comande è il Kitchen Monitor, che si collega come
// dispositivo con username e password locali, non con un invito.
const RUOLO_IGNOTO = {
  id: '_ignoto',
  label: 'Ruolo rimosso',
  desc: 'Il ruolo di questa persona non esiste più: riassegnalo',
  color: '#475569', bg: '#F1F5F9',
  icon: 'user',
  areas: [],
};

// Etichette leggibili dei permessi mostrati nel riquadro del ruolo.
const PERM_LABELS = {
  panoramica: 'Panoramica', sala: 'Sala e prenotazioni', vendita: 'Vendita diretta',
  cucina: 'Comande in cucina',
  app: 'App staff', statistiche: 'Statistiche', contabilita: 'Contabilità',
  supporto: 'Supporto', impostazioni: 'Impostazioni',
};
const PERM_ICONS = {
  panoramica: 'stats', sala: 'utensils', vendita: 'receipt', cucina: 'chef', app: 'phone',
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
  // Pub di default: è il locale a cui Fresh si rivolge per primo — alta
  // rotazione, portata unica. Chi lavora per portate lo dice cambiando qui.
  const [kdsView, setKdsView] = React.useState('pub');
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
  const reset = () => { setDeviceName(''); setUsername(''); setPassword(''); setShowPwd(false); setPrinterCats(new Set()); setKdsView('pub'); };
  return { deviceTypeId, setDeviceTypeId, deviceName, setDeviceName, username, setUsername,
    password, setPassword, showPwd, setShowPwd, openTypeMenu, setOpenTypeMenu,
    printerCats, setPrinterCats, kdsView, setKdsView, isPrinter, selectedPrinter,
    deviceType, deviceValid, generatePwd, reset };
}

function DeviceForm({ st, tipoFisso, azione }) {
  const { deviceTypeId, setDeviceTypeId, deviceName, setDeviceName, username, setUsername,
    password, setPassword, showPwd, setShowPwd, openTypeMenu, setOpenTypeMenu,
    printerCats, setPrinterCats, kdsView, setKdsView, isPrinter, selectedPrinter,
    deviceType, generatePwd } = st;

  // `tipoFisso`: nel passo Personale la tessera qui sopra ha già detto se si
  // collega una stampante o un monitor, e il menu non deve riproporre l'altra
  // famiglia — scegliendola da qui la tessera accesa e il modulo dicevano due
  // cose diverse. Con la famiglia già decisa il menu risponde a «quale
  // stampante», non a «che cosa collego»: per questo cambia etichetta e mostra
  // i soli modelli trovati in rete. Senza la prop — la modale «Aggiungi
  // dispositivo», dove il menu È la scelta — resta il selettore completo.
  const soloStampanti = tipoFisso === 'printer';
  const soloMonitor = tipoFisso === 'monitor';
  const vociMonitor = soloStampanti ? [] : DEVICE_TYPES;
  const vociStampanti = soloMonitor ? [] : AVAILABLE_PRINTERS;

  // In pagina la card è larga: due campi per riga stanno larghi il giusto e la
  // riga dice a occhio che vanno insieme. Nella modale, che è una colonna
  // stretta, restano impilati a piena larghezza.
  const inRiga = !!tipoFisso;
  const RIGA_2 = {
    display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14,
    alignItems:'start', marginBottom: 16,
  };

  const campoTipo = (
              <ImpField label={soloStampanti ? 'Scegli stampante' : 'Tipo dispositivo'}
                style={soloStampanti ? {marginBottom: 0} : undefined}>
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
                          {soloStampanti ? selectedPrinter?.model
                            : isPrinter ? `Stampante (${selectedPrinter?.model})` : 'Tablet/iPad/Schermo (Monitor cucina)'}
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
                      {vociMonitor.map(t => (
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

                      {/* Separatore — solo se sopra c'è davvero un'altra famiglia */}
                      {vociMonitor.length > 0 && vociStampanti.length > 0 && (
                        <div style={{height:1, background:PN.BORDER_SOFT, margin:'4px 0'}}/>
                      )}

                      {/* Stampanti scoperte */}
                      {vociStampanti.map(p => (
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
                              {soloStampanti ? p.model : `Stampante (${p.model})`}
                            </div>
                            <div style={{fontSize:13.5, color:PN.MUTED}}>{p.ip}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ImpField>
  );

  // «Etichetta» non diceva di che cosa: il monitor qui sotto ha «Nome
  // dispositivo», e la stampante chiede la stessa cosa. Sta in riga col menu
  // perché sono le due metà di una frase sola — quale stampante, e come la
  // chiamiamo.
  const campoNomeStampante = (
                <ImpField label="Nome stampante" hint="Come la chiamerete in lista (es. Cassa, Cucina, Bar)"
                  style={soloStampanti ? {marginBottom: 0} : undefined}>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    placeholder="es. Cassa principale"
                    style={{
                      width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                      borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                      background: PN.WHITE,
                    }}
                  />
                </ImpField>
  );

  // Nome dispositivo — solo per monitor cucina
  const campoNomeDispositivo = (
                <ImpField label="Nome dispositivo" hint="Come lo riconoscerete in lista (es. Monitor pizza)"
                  style={inRiga ? {marginBottom: 0} : undefined}>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    placeholder="Monitor cucina"
                    style={{
                      width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                      borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none',
                      background: PN.WHITE,
                    }}
                  />
                </ImpField>
  );

  // La visualizzazione non è un'impostazione fra le altre: è il modo in cui la
  // cucina lavorerà. Sta in cima al modulo, prima del nome e delle credenziali,
  // e si sceglie come si è scelto il dispositivo — due tessere, non un menu.
  const campoVisualizzazione = (
                <div style={{marginBottom: 16}}>
                  {/* Niente etichetta «Visualizzazione» sopra: la dicono già le
                      due tessere, e ripeterla faceva leggere la stessa parola
                      tre volte in due centimetri. */}
                  {/* Affiancate in pagina, impilate nella modale: a 265px il
                      titolo si spezzava a metà («Visualizzazione / Pub») e due
                      tessere storte costano più di una riga in più. */}
                  <div style={{
                    display:'grid', gap: 12,
                    gridTemplateColumns: inRiga ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                  }}>
                    {KDS_VIEWS.map(v => (
                      <KdsViewCard key={v.id} v={v} on={kdsView === v.id}
                        onClick={() => setKdsView(v.id)}/>
                    ))}
                  </div>
                  <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6}}>
                    Cambia come si vedono e si gestiscono gli ordini in cucina. Potrai
                    modificarla in Impostazioni → Operazioni.
                  </div>
                </div>
  );

  const campoUsername = deviceType.noCredentials ? null : (
                <ImpField label="Username" required
                  style={inRiga ? {marginBottom: 0} : undefined}>
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
                      outline:'none', background: PN.WHITE,
                    }}
                  />
                </div>
              </ImpField>
  );

  const campoPassword = deviceType.noCredentials ? null : (
                <ImpField label="Password" required
                  style={inRiga ? {marginBottom: 0} : undefined}>
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
                        background: PN.WHITE,
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
              </ImpField>
  );

  return (
    <>
              {soloStampanti && (
                <div style={RIGA_2}>
                  {campoTipo}
                  {campoNomeStampante}
                </div>
              )}

              {/* Nella modale il menu È la scelta e resta. Nel passo Personale
                  no: con la famiglia già fissa dalla tessera, per il monitor
                  restava un menu con una voce sola — una domanda con una sola
                  risposta possibile. */}
              {!tipoFisso && (
                <>
                  {campoTipo}
                  {isPrinter && campoNomeStampante}
                </>
              )}

              {!isPrinter && campoVisualizzazione}

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

              {!isPrinter && (inRiga ? (
                <>
                  {/* Nome e username in riga: l'uno è come lo chiamiamo noi,
                      l'altro come si chiama lui quando entra. A piena larghezza
                      erano tre campi da 900px per scriverci dentro «cucina». */}
                  <div style={RIGA_2}>
                    {campoNomeDispositivo}
                    {campoUsername}
                  </div>
                  {/* La password sta in mezza riga come le altre: allargarla
                      perché sotto non c'è niente l'avrebbe fatta sembrare più
                      importante di quello che è. E nella metà che resta va la
                      CTA — l'ultimo campo e il bottone che lo chiude sulla
                      stessa riga, invece di una mezza riga vuota e un bottone
                      sospeso sotto la card. */}
                  <div style={RIGA_2}>
                    {campoPassword}
                    {azione && (
                      <div style={{display:'flex', flexDirection:'column'}}>
                        {/* Etichetta vuota, alta come le altre: allinea il
                            bottone al campo accanto senza indovinare un
                            padding che si scolla al primo cambio di corpo. */}
                        <span aria-hidden="true" style={{
                          display:'block', fontSize: 14, fontWeight: 600,
                          marginBottom: 6, visibility:'hidden',
                        }}>&nbsp;</span>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>{azione}</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {campoNomeDispositivo}
                  {campoUsername}
                  {campoPassword}
                </>
              ))}
    </>
  );
}

// Tessera della visualizzazione del KDS: stessa grammatica delle tessere
// dispositivo — radio in alto a destra, icona, titolo, una riga di spiegazione —
// ma di un corpo sotto, perché è una scelta dentro il modulo e non la domanda
// che apre il passo.
function KdsViewCard({ v, on, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position:'relative', textAlign:'left', fontFamily:'inherit', cursor:'pointer',
        display:'flex', alignItems:'flex-start', gap: 11,
        padding:'12px 38px 12px 12px', borderRadius: 11,
        border:`1.5px solid ${on ? PN.PINK : hover ? PN.BORDER : PN.BORDER_SOFT}`,
        background: on ? '#FFF7F7' : PN.WHITE,
        transform: hover && !on ? 'translateY(-1px)' : 'none',
        transition:'border-color 150ms ease, background 150ms ease, transform 150ms ease',
      }}>
      <span style={{
        position:'absolute', top: 12, right: 12,
        width: 15, height: 15, borderRadius:'50%',
        border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center', transition:'border-color 150ms ease',
      }}>
        {on && <span style={{width: 7, height: 7, borderRadius:'50%', background: PN.PINK}}/>}
      </span>
      <span style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0, display:'grid', placeItems:'center',
        background: on ? PN.PINK_SOFT : '#F4F5F7', color: on ? PN.PINK_DARK : '#475569',
        transition:'background 150ms ease, color 150ms ease',
      }}>{(BuIcons[v.icon]||BuIcons.monitor)({size: 17, color:'currentColor'})}</span>
      <span style={{minWidth: 0}}>
        <span style={{display:'block', fontSize: 15, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>{v.label}</span>
        <span style={{display:'block', fontSize: 13, color: PN.MUTED, lineHeight: 1.4}}>{v.desc}</span>
      </span>
    </button>
  );
}


// ─── Foglio modale del Personale ────────────────────────────────────────────
// BIANCO pieno, non GLASS_STRONG: il vetro al 68% sopra l'overlay scuro legge
// grigio — qui dentro si compilano campi e si leggono elenchi, serve una
// superficie che si veda tutta. Stessa ricetta delle finestre di Sala e tavoli.
const IMP_MODAL_PANEL = {
  background: PN.WHITE, borderRadius: 22,
  boxShadow: '0 32px 80px -24px rgba(15, 17, 21, 0.38), 0 0 0 1px rgba(15, 17, 21, 0.05)',
};
const IMP_MODAL_HEAD  = { padding: '22px 26px 18px', borderBottom: `1px solid ${PN.BORDER_SOFT}` };
const IMP_MODAL_TITLE = { fontSize: 19, fontWeight: 800, letterSpacing: -0.3, color: PN.TEXT, marginBottom: 3, paddingRight: 44 };
const IMP_MODAL_SUB   = { fontSize: 14.5, color: PN.MUTED, paddingRight: 44 };
const IMP_MODAL_X = {
  position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: '50%',
  background: PN.WHITE, border: `1px solid ${PN.BORDER}`, color: PN.TEXT,
  cursor: 'pointer', display: 'grid', placeItems: 'center',
};

function InviteModal({ onClose, prefill }) {
  const initialKind = prefill?.kind === 'device' ? 'device' : 'person';
  // Se prefill.roleId è quello di un ruolo selezionabile, usa quello; altrimenti default
  const prefillRoleSelectable = prefill?.roleId
    && [...ROLES, ...CUSTOM_ROLES].some(r => r.id === prefill.roleId && !r.locked);
  const [kind, setKind] = React.useState(initialKind);

  // Persona
  const [pname, setPname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roleId, setRoleId] = React.useState(prefillRoleSelectable ? prefill.roleId : 'cameriere');
  const [msg, setMsg] = React.useState('');
  const allRolesForInvite = [...ROLES, ...CUSTOM_ROLES];
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
      // Aprire la modifica di un monitor su «Pub» quando lavora per portate
      // avrebbe cambiato la cucina a chi era entrato per cambiare il nome.
      if (editDevice.kdsView) dev.setKdsView(editDevice.kdsView);
    }
    if (editDevice.name) setDeviceName(editDevice.name);
  }, []);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...IMP_MODAL_PANEL,
        width: kind === 'person' ? 620 : 480, maxWidth:'100%', position:'relative',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>
            {kind === 'person' ? 'Invita una persona' : 'Collega un dispositivo'}
          </div>
          {/* La subhead racconta il flusso vero: il monitor accede con
              credenziali locali, la stampante vuole nome e categorie —
              niente username per lei, e niente email per nessuno. */}
          <div style={IMP_MODAL_SUB}>
            {kind === 'person'
              ? 'Invia un accesso al gestionale o all\'app staff.'
              : 'Scegli il tipo e configuralo: credenziali locali per il monitor, nome e categorie per la stampante.'}
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow:'auto', flex: 1}}>
          {/* Type switcher: Persona | Dispositivo */}
          <ImpField label="Tipo">
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8,
              padding: 4, background:'#F4F5F7', borderRadius: 10,
            }}>
              {[
                { id:'person', label:'Persona con email', sub:'cameriere, cassa…', icon:'user' },
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
                        background: PN.WHITE,
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
                        background: PN.WHITE,
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
                          background: PN.WHITE, color: PN.TEXT,
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
                          background: PN.WHITE,
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
        ...IMP_MODAL_PANEL,
        width: 500, maxWidth:'100%', position:'relative',
        maxHeight:'90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>Inviti in sospeso</div>
          <div style={IMP_MODAL_SUB}>
            {PENDING.length === 0
              ? 'Nessun invito in attesa'
              : `${PENDING.length} ${PENDING.length === 1 ? 'invito in attesa' : 'inviti in attesa'} di conferma`}
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{padding:'18px 26px 20px', overflow:'auto', flex: 1}}>
          {PENDING.length === 0 ? (
            <div style={{padding: 30, textAlign:'center', color: PN.MUTED, fontSize: 15}}>
              Quando inviterai una persona, l'invito comparirà qui finché non viene accettato.
            </div>
          ) : (
            <>
              <div style={{
                padding:'10px 14px', marginBottom: 14,
                background: '#FFFBEB', border: '1px solid #FDE9C0', borderRadius: 11,
                fontSize: 13.5, color: '#92400E', lineHeight: 1.45,
                display:'flex', alignItems:'flex-start', gap: 9,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: 2}}>
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>
                </svg>
                <span>Gli inviti scadono dopo 7 giorni. Puoi rinviarli o revocarli in qualsiasi momento.</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 10}}>
                {PENDING.map((p, i) => {
                  const role = [...ROLES, ...CUSTOM_ROLES].find(r => r.id === p.role);
                  return (
                    <div key={i} style={{
                      padding:'14px 16px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 13,
                      background: PN.WHITE,
                      boxShadow: '0 1px 3px rgba(15,17,21,0.04)',
                    }}>
                      <div style={{display:'flex', alignItems:'center', gap: 12}}>
                        <div style={{
                          width: 38, height: 38, borderRadius:'50%', flexShrink: 0,
                          background: PN.AMBER_SOFT, color: '#B45309',
                          display:'grid', placeItems:'center',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>
                          </svg>
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.email}</div>
                          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>
                            Invitato come <b style={{color: PN.TEXT}}>{role?.label}</b> · {p.sent}
                          </div>
                        </div>
                      </div>
                      {/* Le azioni sotto, non schiacciate accanto all'email:
                          la riga respira e i bottoni hanno il loro spazio. */}
                      <div style={{display:'flex', gap: 8, marginTop: 12, paddingLeft: 50}}>
                        <ImpButton variant="ghost" style={{padding:'7px 12px', fontSize: 14}}>Invita di nuovo</ImpButton>
                        <button className="pn-btn-feedback" style={{
                          padding:'7px 12px',
                          background: PN.WHITE, color: PN.PINK_DARK,
                          border:`1px solid rgba(224, 67, 71, 0.35)`, borderRadius: 9,
                          fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                        }}>Revoca invito</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{
          padding:'14px 26px',
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
        ...IMP_MODAL_PANEL,
        width: 480, maxWidth:'100%', position:'relative',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>
            {isEdit ? `Modifica permessi · ${role.label}` : 'Crea ruolo personalizzato'}
          </div>
          <div style={IMP_MODAL_SUB}>
            {isEdit ? 'Aggiorna nome e aree visibili a questo ruolo' : 'Definisci nome e aree visibili'}
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
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
                background: PN.WHITE,
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
// Una riga a testa anche col corpo cresciuto: «da inviare» e il secondo «in
// cucina» erano parole che non aggiungevano niente, e mandavano la descrizione
// a capo su una parola orfana.
const STEP_DEVICES = [
  { id: 'printer', label: 'Stampante',      desc: 'Stampa gli ordini in cucina o al bar', icon: 'doc' },
  { id: 'monitor', label: 'Kitchen Monitor', desc: 'Mostra le comande in tempo reale',     icon: 'monitor' },
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
// personale — chi gestisce il locale è il titolare, che il gestionale ce
// l'ha già; e «Cucina» non era una persona da invitare ma il Kitchen Monitor,
// che si collega come dispositivo nella sezione qui sotto.
// Cameriere per primo, ed è il ruolo da cui parte l'invito: è quello che un
// locale invita in numero, e la cassa la tiene spesso chi il gestionale ce
// l'ha già.
const STEP_ROLES = [
  { id: 'cameriere', label: 'Cameriere', desc: 'Usa l\'app staff per tavoli, ordini e conto',    icon: 'waiter' },
  { id: 'cassa',     label: 'Cassa',     desc: 'Prende ordini e incassa al bancone', icon: 'receipt' },
];

window.PERSONALE_TEAM_INITIAL = [
  { id: 't1', kind: 'person', name: 'Marco Rossi',    email: 'marco@delborgo.it',  role: 'Cassa',              status: 'active' },
  { id: 't2', kind: 'person', name: 'Giulia Bianchi', email: 'giulia@delborgo.it', role: 'Cameriere',          status: 'invited' },
  { id: 't3', kind: 'person', name: 'Luca Verdi',     email: 'luca@delborgo.it',   role: 'Cameriere',          status: 'active' },
  // «Kitchen Monitor» e non «Dispositivo cucina»: è quello che scrive
  // aggiungiDispositivo qui sotto, e la riga di partenza non può chiamare la
  // stessa cosa con un altro nome.
  { id: 't4', kind: 'device', name: 'Monitor cucina', email: 'PG1-cucina',         role: 'Kitchen Monitor', status: 'active' },
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

  // CTA finale: si accende quando il dispositivo è configurato davvero, come
  // faceva il piede della modale che ha sostituito. Vive qui e non nel modulo
  // perché il posto in cui compare cambia col dispositivo, l'azione no.
  const ctaConfigura = (
    <ImpButton variant="pink" disabled={!dev.deviceValid} onClick={aggiungiDispositivo}>
      Configura dispositivo
    </ImpButton>
  );

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
          <DeviceForm st={dev} tipoFisso={selDevice} azione={ctaConfigura}/>
        </div>

        {/* Il monitor si porta la CTA dentro, in riga con la password: la sua
            ultima riga era mezza vuota. La stampante finisce con l'elenco delle
            categorie, che è a piena larghezza e non lascia posto: là il bottone
            resta sotto la card. */}
        {dev.isPrinter && (
          <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', marginTop: 14}}>
            {ctaConfigura}
          </div>
        )}
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
// Il corpo del testo e quello delle tessere-ruolo qui sotto: sono la stessa
// scelta fatta due volte nella stessa schermata, e a due misure diverse una
// delle due sembrava una nota a margine dell'altra.
function StepDeviceCard({ d, on, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position:'relative', textAlign:'left', fontFamily:'inherit', cursor:'pointer',
        display:'flex', alignItems:'center', gap: 14,
        padding:'16px 46px 16px 16px', borderRadius: 12,
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
        width: 48, height: 48, borderRadius: 12, flexShrink: 0, display:'grid', placeItems:'center',
        background: on ? PN.PINK_SOFT : '#F4F5F7', color: on ? PN.PINK_DARK : '#475569',
        transition:'background 150ms ease, color 150ms ease',
      }}>{(BuIcons[d.icon]||BuIcons.monitor)({size: 22, color:'currentColor'})}</span>
      <span style={{minWidth: 0}}>
        <span style={{display:'block', fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 3}}>{d.label}</span>
        <span style={{display:'block', fontSize: 14, color: PN.MUTED, lineHeight: 1.4}}>{d.desc}</span>
      </span>
    </button>
  );
}

// Card-ruolo con radio in alto a destra: feedback in hover, brand da selezionata.
// Orizzontale come le tessere dispositivo qui sotto — icona a sinistra, nome e
// spiegazione a destra. Il nome sotto l'icona faceva leggere la tessera in due
// tempi (guarda il segno, poi scendi a capire cosa vuol dire) e la stessa
// scelta, due riquadri più in basso, si leggeva in uno.
function StepRoleCard({ r, on, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position:'relative', textAlign:'left', fontFamily:'inherit', cursor:'pointer',
        display:'flex', alignItems:'center', gap: 14,
        padding:'16px 46px 16px 16px', borderRadius: 12,
        border:`1.5px solid ${on ? PN.PINK : hover ? PN.BORDER : PN.BORDER_SOFT}`,
        background: on ? '#FFF7F7' : PN.WHITE,
        boxShadow: hover && !on ? '0 6px 16px rgba(15, 17, 21, 0.06)' : 'none',
        transform: hover && !on ? 'translateY(-1px)' : 'none',
        transition:'border-color 150ms ease, background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
      }}>
      {/* Radio */}
      <span style={{
        position:'absolute', top: 14, right: 14,
        width: 16, height: 16, borderRadius:'50%',
        border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center',
        transition:'border-color 150ms ease',
      }}>
        {on && <span style={{width: 8, height: 8, borderRadius:'50%', background: PN.PINK}}/>}
      </span>
      {/* Tondo e non riquadro: le persone restano tonde, i dispositivi
          squadrati — è l'unico segno che distingue le due coppie ora che hanno
          la stessa forma. */}
      <span style={{
        width: 46, height: 46, borderRadius:'50%', flexShrink: 0, display:'grid', placeItems:'center',
        background: on ? PN.PINK_SOFT : '#F4F5F7', color: on ? PN.PINK_DARK : '#475569',
        transition:'background 150ms ease, color 150ms ease',
      }}>{(BuIcons[r.icon]||BuIcons.user)({size: 21, color:'currentColor'})}</span>
      <span style={{minWidth: 0}}>
        <span style={{display:'block', fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 3}}>{r.label}</span>
        <span style={{display:'block', fontSize: 14, color: PN.MUTED, lineHeight: 1.4}}>{r.desc}</span>
      </span>
    </button>
  );
}

// «Invita» è la CTA del mezzo passo delle persone, come «Configura dispositivo»
// lo è di quello dei dispositivi: stesso lavoro, stesso colore acceso — corallo
// pieno, gli stessi token della variante pink di ImpButton. Da chip tenue le due
// azioni gemelle avevano due pesi diversi, e quella delle persone sembrava
// facoltativa. Non riusa ImpButton perché l'altezza è tarata sui campi della
// riga d'invito accanto, non sul piede di una card.
function AddInviteBtn({ disabled, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => { if (!disabled) setHover(true); }}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        flexShrink: 0, padding:'10px 16px', borderRadius: 9,
        border:'1px solid rgba(180, 30, 35, 0.40)',
        background: hover && !disabled ? PN.BTN_BRAND_HOVER : PN.BTN_BRAND,
        color: '#fff',
        boxShadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)`,
        fontSize: 14, fontWeight: 700, fontFamily:'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? 'scale(0.96)' : 'none',
        transition:'background 150ms ease-out, box-shadow 150ms ease-out, transform 130ms ease, opacity 150ms ease-out',
        display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
      }}>
      <PnI.Plus size={12}/> Invita
    </button>
  );
}
window.ImpPersonale = ImpPersonale;
window.PersonaleStep = PersonaleStep;
window.DispositivoStep = DispositivoStep;

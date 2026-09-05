// Impostazioni → Personale: ruoli predefiniti + custom, permessi area-based, e
// chi entra nel gestionale — le persone, il monitor di cucina che entra come
// loro, e i telefoni di Byup Staff. La domanda della pagina è «chi entra».
//
// LE STAMPANTI NON STANNO PIÙ QUI (P-134). Una stampante non entra da nessuna
// parte: riceve fogli e li stampa. Non ha un accesso, non vede niente, non ha
// permessi. Vivono nel blocco Stampanti di Impostazioni → Integrazioni, dove
// P-128 le ha messe, e da lì si assegnano anche le categorie da instradare —
// che prima si potevano assegnare da due posti, e adesso da uno solo.
//
// IL MONITOR NON HA PIÙ NOME UTENTE E PASSWORD (P-134). Si collega con un
// codice che il titolare approva: chi è in cucina apre `byup.it/cucina` sullo
// schermo, legge il codice, e dal gestionale lo si conferma dandogli nome e
// visualizzazione. Non è solo una semplificazione: prima chiunque conoscesse
// `PG1-cucina` e la sua password apriva la cucina di quel locale da qualunque
// browser del mondo, e su quello schermo passano i nomi dei tavoli e le
// allergie dichiarate dai clienti, che sono dati sulla salute.
// Il collegamento dura finché non lo si revoca: nessuna scadenza e nessuna
// sessione che finisce da sola — lo schermo della cucina resta acceso tutto il
// servizio e nessuno lo guarda per accertarsi che sia ancora collegato.

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
// invitare ma il monitor di cucina, che entra come dispositivo.
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
    // D-57: uno solo per volta, e cambia solo dal percorso di titolarità in
    // Account (P-62); non «chi ha creato il gestionale», che dopo un
    // avvicendamento non è più vero.
    desc: 'Vede tutto · è uno solo per volta; la persona cambia da Account, il soggetto fiscale da Dati fiscali',
    // Teal, che è l'unica famiglia libera di questa pagina: il rosso è di
    // Cameriere e Cassa, il blu della cassa e delle stampanti, lo slate dei
    // dispositivi, il verde dello stato, il viola dei ruoli personalizzati e
    // l'ambra degli inviti in attesa. Vinaccia com'era prima si confondeva con
    // le altre due pastiglie rosse; il titolare è il ruolo che sta a sé — uno
    // solo, vede tutto — e va letto come tale a colpo d'occhio.
    color: '#0F766E', bg: '#CCFBF1',
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

// L'unico dispositivo che ENTRA nel gestionale: il monitor di cucina. Ha una
// sua vista, legge le comande della sua stazione e ne cambia lo stato, come
// farebbe una persona. Si collega con un codice, non con credenziali.
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

// Come la cucina vede e manda gli ordini. È la sola cosa che cambia davvero
// fra due monitor identici, e si chiede al collegamento perché cambia il modo
// di lavorare in cucina, non un colore: il ticket del KDS porta già `course`
// (1 antipasto, 2 primo, 3 secondo, 4 dessert, null = portata unica), e le due
// visualizzazioni sono i due modi di leggerlo. Resta modificabile in
// Impostazioni → Operazioni: chi apre come pub e poi mette il servizio al
// tavolo non deve ricollegare il monitor.
// Le icone dicono il comportamento e non il tipo di locale: quello lo dice già
// il nome, mentre la differenza che conta è tutto-insieme contro diviso.
// `short`: in elenco la pastiglia sta accanto a «Monitor cucina», e «Visualizza-
// zione» lì è la parola che si capisce da sé — resta «Pub» / «Ristorante».
const KDS_VIEWS = [
  { id: 'pub', label: 'Visualizzazione Pub', short: 'Pub', icon: 'bolt',
    desc: 'Tutte le righe escono insieme' },
  { id: 'ristorante', label: 'Visualizzazione Ristorante', short: 'Ristorante', icon: 'split',
    desc: 'Le righe partono una portata alla volta' },
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
  { id: 'flussi', label: 'Servizio', icon: 'bolt' },
  { id: 'fiscali', label: 'Dati fiscali', icon: 'doc' },
  { id: 'integrazioni', label: 'Integrazioni', icon: 'plug' },
];

const PERSONS = [
  { name: 'Marco Silvestri', email: 'marco@delborgo.it', role: 'titolare', last: 'ora', online: true, color: '#7c2436' },
  { name: 'Davide Rossi', email: 'davide@delborgo.it', role: 'cassa', last: 'ieri', online: false, color: '#85B8CB' },
  { name: 'Giovanni Rana', email: 'giovanni@delborgo.it', role: 'cameriere', last: '2 min fa', online: true, color: '#E8A87C' },
  { name: 'Sara Conti', email: 'sara@delborgo.it', role: 'cameriere', last: '1 ora fa', online: false, color: '#FFC09F' },
  { name: 'Luca Ferretti', email: 'luca@delborgo.it', role: 'sommelier', last: '3 ore fa', online: false, color: '#7C3AED', active: false },
];

// I monitor collegati vengono dal registro condiviso (panoramica-sidebar.jsx,
// byup_kds_monitor): è lo stesso elenco che legge la sezione Cucina per sapere
// quale schermo guardare, e la verità sta lì, non in una lista scritta a mano
// che invecchierebbe per conto suo.
// kdsView: la visualizzazione scelta al collegamento (vedi KDS_VIEWS). Sta sul
// dispositivo e non sul locale perché due monitor dello stesso locale possono
// lavorare in due modi — la pizza esce tutta insieme, la sala va per portate.
const monitorCollegati = () => (window.byupReadMonitorsKds ? window.byupReadMonitorsKds() : []).map(m => ({
  name: m.nome, monitorId: m.id, deviceType: 'kitchen-monitor', kdsView: m.vista,
  collegatoIl: m.collegato_il || null,
}));

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

  // Quello che il menu «⋯» cambia davvero. I dati di partenza sono finti e
  // fermi; queste tre mappe sono la memoria di ciò che l'utente ha fatto in
  // questa sessione, così un accesso disattivato resta disattivato e un ruolo
  // cambiato si vede in riga — altrimenti il menu è un elenco di bottoni che
  // non fanno niente, che è peggio di non averli.
  const [attivazioni, setAttivazioni] = React.useState({});   // key → attivo
  const [ruoliCambiati, setRuoliCambiati] = React.useState({}); // key → roleId
  const [cambiaRuolo, setCambiaRuolo] = React.useState(null); // riga in cambio
  const [collegaMonitor, setCollegaMonitor] = React.useState(null);  // null | { codice }
  const [monitorAperto, setMonitorAperto] = React.useState(null);    // riga del monitor da modificare
  const [toast, setToast] = React.useState(null);
  const avvisa = (t) => { setToast(t); setTimeout(() => setToast(null), 2800); };
  // I monitor collegati vengono dal registro condiviso e si riascoltano: uno
  // schermo approvato da un'altra scheda deve comparire qui senza ricaricare.
  const [monitors, setMonitors] = React.useState(() => monitorCollegati());
  React.useEffect(() => {
    const agg = () => setMonitors(monitorCollegati());
    const ev = ['byup-kds-vista-change', 'byup-monitor-richieste', 'storage'];
    ev.forEach(e => window.addEventListener(e, agg));
    return () => { ev.forEach(e => window.removeEventListener(e, agg)); };
  }, []);
  // Il QR sullo schermo della cucina porta qui, col codice già dentro: chi ha
  // inquadrato non deve ricopiare niente.
  React.useEffect(() => {
    try {
      const c = new URLSearchParams(window.location.search).get('collega');
      if (c) setCollegaMonitor({ codice: c.toUpperCase() });
    } catch (e) {}
  }, []);

  // I ruoli personalizzati sono gli unici che cambiano: Cassa, Cameriere e
  // Titolare sono di sistema e restano quelli. Modificarne i permessi non li
  // smonta — ne nasce uno personalizzato nuovo (vedi CreateRoleModal).
  const [customRoles, setCustomRoles] = React.useState(CUSTOM_ROLES);
  const allRoles = [...ROLES, ...customRoles];

  // Il censimento dei POS (P-105). I telefoni di Byup Staff NON sono righe di
  // questo elenco: «Byup Staff» non è un ruolo — i ruoli sono Cassa,
  // Cameriere, Titolare, quelli che il locale si crea, e il monitor di cucina
  // — e un telefono non entra nel gestionale: ci entra la persona che lo porta
  // in tasca, che in questo elenco c'è già col suo ruolo. La riga del telefono
  // era quella persona scritta due volte.
  // Quello che NON si perde è la comunicazione all'Agenzia, che è un obbligo
  // di legge con una sanzione: la pastiglia si attacca alla PERSONA che quel
  // telefono lo usa — che è anche chi deve agire — e porta al foglio
  // precompilato dello strumento.
  const [posCens, setPosCens] = React.useState(() => window.byupReadPosCensimento ? window.byupReadPosCensimento() : []);
  React.useEffect(() => {
    const agg = () => setPosCens(window.byupReadPosCensimento ? window.byupReadPosCensimento() : []);
    window.addEventListener('byup-pos-censimento', agg);
    window.addEventListener('storage', agg);
    return () => { window.removeEventListener('byup-pos-censimento', agg); window.removeEventListener('storage', agg); };
  }, []);

  // Persone e dispositivi in un elenco solo: la domanda della pagina è «chi
  // entra nel gestionale», e un monitor di cucina che legge le comande entra
  // esattamente come ci entra un cameriere. Tenerli in due liste separate
  // costringeva a guardare in due posti per rispondere.
  // Lo strumento di pagamento che una persona ha in mano, se c'è e se
  // all'Agenzia non è ancora stato comunicato.
  const censimentoDi = (nome) => {
    const r = posCens.find(d => d.nature === 'tap_to_pay' && d.user === nome && d.fiscal_link_status !== 'unlinked');
    if (!r || !window.pnPosPromemoria) return null;
    const p = window.pnPosPromemoria(r);
    if (p.fase === 'ok') return null;
    return { id: r.id, fase: p.fase, sotto: `${r.name} · ${p.testo}`,
      label: `${(PN_POS_STATI[r.fiscal_link_status] || PN_POS_STATI.pending_census).label} all'Agenzia` };
  };

  const righe = [
    ...PERSONS.map(p => {
      const key = `p-${p.email}`;
      const ruolo = allRoles.find(r => r.id === (ruoliCambiati[key] || p.role)) || RUOLO_IGNOTO;
      return {
        key, tipo: 'persona', dato: p,
        nome: p.name, sotto: p.email, colore: p.color,
        ruolo, gruppo: ruolo.custom ? '_custom' : ruolo.id,
        accesso: accessoDelRuolo(ruolo),
        attivo: attivazioni[key] !== undefined ? attivazioni[key] : p.active !== false,
        censimento: censimentoDi(p.name),
      };
    }),
    ...monitors.map((d) => {
      const key = `d-${d.monitorId}`;
      const vista = (KDS_VIEWS.find(v => v.id === d.kdsView) || KDS_VIEWS[0]).short;
      return {
        key, tipo: 'dispositivo', dato: d,
        // Niente nome utente sotto il nome: non c'è più (P-134). Al suo posto
        // la cosa che di uno schermo si vuole sapere — come mostra le comande.
        nome: d.name, sotto: `Visualizzazione ${vista}`,
        ruolo: DEVICE_ROLES[d.deviceType] || DEVICE_ROLE, gruppo: '_monitor',
        accesso: { titolo: 'Cucina', sotto: 'Schermo comande' },
        attivo: attivazioni[key] !== undefined ? attivazioni[key] : true,
        monitor: true,
      };
    }),
  ];

  const conta = (id) => id === 'all' ? righe.length : righe.filter(r => r.gruppo === id).length;
  const gruppi = [
    { id: 'all', label: 'Tutti i ruoli', icon: 'users', color: PN.PINK_DARK, bg: PN.PINK_SOFT },
    ...ROLES.map(r => ({ id: r.id, label: r.label, icon: r.icon, color: r.color, bg: r.bg })),
    { id: '_monitor', label: 'Monitor cucina', icon: 'monitor', color: DEVICE_ROLE.color, bg: DEVICE_ROLE.bg },
    ...(customRoles.length
      ? [{ id: '_custom', label: 'Personalizzati', icon: 'sparkle', color: '#6D28D9', bg: '#EDE9FE' }]
      : []),
  ];

  const q = query.trim().toLowerCase();
  // Il ruolo e la ricerca prima, lo stato dopo: così il conteggio sulle
  // pillole dice quante righe si vedrebbero premendole, e non un totale che
  // con un ruolo selezionato sarebbe falso.
  const perStato = righe.filter(r => {
    if (gruppo !== 'all' && r.gruppo !== gruppo) return false;
    if (!q) return true;
    return [r.nome, r.sotto, r.ruolo.label].some(v => String(v).toLowerCase().includes(q));
  });
  const contaStato = {
    all: perStato.length,
    attivi: perStato.filter(r => r.attivo).length,
    disattivati: perStato.filter(r => !r.attivo).length,
  };
  const visibili = perStato.filter(r => statoFiltro === 'all'
    || (statoFiltro === 'attivi' ? r.attivo : !r.attivo));

  // Lo stato si filtra a PILLOLE, non con un menù di sistema. In questo
  // gestionale le pillole sono il linguaggio dei filtri — le linguette
  // sottolineate sono le sezioni — e un `<select>` nativo apriva l'elenco del
  // sistema operativo: un'altra tipografia, un'altra forma, i colori del
  // sistema, e su Windows un rettangolo grigio in mezzo a una schermata che
  // di rettangoli grigi non ne ha. È la stessa ragione per cui il ruolo, in
  // questa pagina, non è un `<select>` ma SelettoreRuolo.
  // Con tre risposte in tutto le pillole dicono anche quante righe ha
  // ciascuna, che un menù chiuso non può dire.
  const FiltroStato = ({ id, label }) => {
    const on = statoFiltro === id;
    return (
      <button onClick={() => setStatoFiltro(id)} data-filtro-stato={id} className="pn-btn-feedback" style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding:'6px 13px', borderRadius: 999,
        background: on ? PN.SIDE_ACTIVE_BG : PN.WHITE,
        color: on ? PN.PINK_DARK : PN.MUTED,
        border: `1px solid ${on ? 'rgba(255, 90, 95, 0.30)' : PN.BORDER}`,
        fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
        transition:'background 150ms ease, color 150ms ease, border-color 150ms ease',
      }}>
        {label}
        <span style={{
          fontSize: 12.5, fontWeight: 800, fontVariantNumeric:'tabular-nums',
          color: on ? PN.PINK_DARK : '#9CA3AF',
        }}>{contaStato[id]}</span>
      </button>
    );
  };

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
        {/* Le due cose che si aggiungono da questa pagina, una accanto
            all'altra: una persona e il monitor di cucina — che entra come una
            persona, con una sua vista. Il monitor sta in secondo piano perché
            si collega una volta e poi non ci si torna, ma sta qui e non in
            fondo alla colonna destra, perché è un'azione della pagina. */}
        <div style={{display:'flex', gap: 8, alignItems:'center', flexShrink: 0}}>
          <ImpButton
            variant="ghost"
            icon={(BuIcons.monitor||BuIcons.chef)({size: 14, color:'currentColor'})}
            onClick={() => setCollegaMonitor({ codice: '' })}
          >Collega monitor cucina</ImpButton>
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
              {/* Queste righe filtrano l'elenco e basta: i permessi si toccano
                  da «Crea ruolo» qui sotto. La matita al passaggio è stata
                  tolta — due modi per arrivare alla stessa modale, e uno dei
                  due nascosto finché non ci passavi sopra. */}
              {gruppi.map(g => {
                const on = gruppo === g.id;
                const n = conta(g.id);
                return (
                    <button
                      key={g.id}
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
                      {/* Niente margine destro: senza la matita da scansare i
                          conteggi si incolonnano da soli sul bordo della riga. */}
                      <span style={{
                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                        color: on ? PN.PINK_DARK : PN.MUTED,
                      }}>{n}</span>
                    </button>
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
            <div style={{display:'flex', alignItems:'center', gap: 7, flexShrink: 0}}>
              <FiltroStato id="all" label="Tutti"/>
              <FiltroStato id="attivi" label="Attivi"/>
              <FiltroStato id="disattivati" label="Disattivati"/>
            </div>
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
              onEditDevice={() => setMonitorAperto(r.dato)}
              onToggleAttivo={() => setAttivazioni(a => ({...a, [r.key]: !r.attivo}))}
              onCambiaRuolo={() => setCambiaRuolo(r)}
            />
          ))}
        </section>

        <aside style={{display:'flex', flexDirection:'column', gap: 14}}>
          {/* Chi sta aspettando. Collegare il monitor non è più qui: è un
              pulsante in testata, accanto ad «Aggiungi persona», perché è una
              cosa che si aggiunge e non una scorciatoia. Gli inviti in sospeso
              restano, e non ripetono un bottone: dicono chi non ha ancora
              accettato. */}
          <section style={PANNELLO}>
            <div style={{padding:'16px 18px 12px'}}>
              <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT}}>Inviti in attesa</div>
            </div>
            <div style={{padding:'0 12px 14px', display:'flex', flexDirection:'column', gap: 8}}>
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

          {/* L'app dei telefoni che incassano: sta accanto a «Collega un
              dispositivo», che è il gesto che la presuppone. */}
          <PersStaffPromo/>
        </aside>

      </div>

      {collegaMonitor && (
        <CollegaMonitorModal
          codiceIniziale={collegaMonitor.codice}
          onClose={() => setCollegaMonitor(null)}
          onFatto={(m) => { setMonitors(monitorCollegati()); avvisa(`«${m.nome}» collegato`); }}/>
      )}
      {monitorAperto && (
        <MonitorModal dispositivo={monitorAperto}
          onClose={() => setMonitorAperto(null)}
          onFatto={(t) => { setMonitors(monitorCollegati()); avvisa(t); }}/>
      )}
      {toast && (
        <div style={{position:'fixed', bottom: 84, left:'50%', transform:'translateX(-50%)', background: PN.TEXT, color:'#fff', padding:'10px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, zIndex: 300, boxShadow:'0 10px 30px rgba(0,0,0,0.25)'}}>{toast}</div>
      )}
      {cambiaRuolo && (
        <CambiaRuoloModal
          r={cambiaRuolo} ruoli={allRoles.filter(x => !x.locked)}
          onConferma={(roleId) => {
            setRuoliCambiati(m => ({...m, [cambiaRuolo.key]: roleId}));
            setCambiaRuolo(null);
          }}
          onClose={() => setCambiaRuolo(null)}/>
      )}
      {showCreateRole && (
        <CreateRoleModal
          roles={allRoles}
          onSave={(nuovo) => setCustomRoles(prev => [...prev, nuovo])}
          onClose={() => setShowCreateRole(false)}/>
      )}
      {invite && <InviteModal prefill={invite} ruoli={allRoles} onClose={() => setInvite(null)}/>}
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

// I ruoli sono cinque e non uno di più: Cassa, Cameriere, Titolare, quelli
// che il locale si crea, e il MONITOR DI CUCINA — che è l'unica macchina che
// entra nel gestionale, con una sua vista, e che quindi un ruolo ce l'ha.
// «Byup Staff» non è fra questi, e non è una dimenticanza: un telefono che
// incassa non entra da nessuna parte, ci entra la persona che lo porta in
// tasca, col ruolo che ha già. La stampante nemmeno (P-134): riceve fogli e
// li stampa, non ha un accesso e non ha permessi, e sta in Integrazioni.
const DEVICE_ROLES = {
  'kitchen-monitor': { id: '_device_monitor', label: 'Monitor cucina', icon: 'monitor',
    color: '#475569', bg: '#F1F5F9' },
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

// ─── «Scarica Byup Staff» (arrivata dall'onboarding, 4 settembre 2026) ─────
// Stava nello step 2 dell'onboarding, sotto i pagamenti, e chiedeva di
// portarsi via l'app mentre il locale non aveva ancora né menù né tavoli: il
// telefono che incassa non serve prima di aprire. Qui invece è a casa — questa
// è la pagina di chi entra e con che cosa, e il vicino di colonna è «Collega
// un dispositivo»: chi collega un telefono a Byup Staff l'app deve averla.
// Il QR non è scansionabile e non finge di esserlo (non c'è un URL da
// codificare finché le schede store non esistono); i due link sono segnaposto.
const PERS_STORE = { play: '#', app: '#' };

function PersStaffPromo() {
  const cream = PN.STAFF_CREAM;
  const link = { color: cream, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' };
  return (
    <section style={{
      borderRadius: 14, overflow: 'hidden',
      background: PN.GRAD_STAFF,
      boxShadow: '0 12px 32px -14px rgba(229, 68, 110, 0.50)',
      padding: '16px 16px 0',
    }}>
      <div style={{fontSize: 16.5, fontWeight: 800, color: cream, letterSpacing: -0.2, lineHeight: 1.3}}>
        Scarica Byup Staff
      </div>
      <div style={{fontSize: 14, color: cream, opacity: 0.92, lineHeight: 1.45, marginTop: 4}}>
        Il POS digitale e gratuito: incassi dal telefono di chi è in sala, senza altro hardware.
      </div>

      {/* L'istruzione sta SOPRA il codice e non sotto: sotto non c'è più posto,
          perché il fondo del riquadro è della mascotte. Con la riga in mezzo,
          la mascotte le finiva coi piedi addosso e l'ombra le tagliava le
          parole — era il difetto da correggere. */}
      <div style={{fontSize: 13.5, color: cream, opacity: 0.92, lineHeight: 1.45, marginTop: 10}}>
        Inquadra il codice, oppure vai su <a href={PERS_STORE.play} style={link}>Play Store</a> o <a href={PERS_STORE.app} style={link}>App Store</a>.
      </div>

      {/* Il codice e la mascotte, fianco a fianco sul fondo: il QR staccato dal
          bordo, la mascotte all'estremità opposta che ci poggia sopra e viene
          tagliata a filo dall'overflow — come nel banner da cui viene. */}
      <div style={{display:'flex', alignItems:'flex-end', gap: 10, marginTop: 12}}>
        <div style={{background: PN.WHITE, borderRadius: 10, padding: 7, flexShrink: 0, marginBottom: 16}}>
          <PersQrMock size={96}/>
        </div>
        <img
          src="mascot-staff.png?v=2"
          alt="La mascotte di Byup Staff con l'app aperta sul telefono"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{width: 104, flexShrink: 0, marginLeft: 'auto', marginBottom: -3, filter: 'drop-shadow(0 10px 20px rgba(120, 15, 45, 0.30))'}}
        />
      </div>
    </section>
  );
}

// QR decorativo in SVG — moduli e finder arrotondati, trama deterministica
// (nessun Math.random: la stessa a ogni render). Copia di quello che stava
// nell'onboarding, che è l'unico posto da cui questa tessera è passata.
function PersQrMock({ size = 96 }) {
  const N = 25;
  const cell = size / N;
  const r = cell * 0.34;
  const FG = '#17181C';
  const inFinder = (row, col) => (row < 8 && col < 8) || (row < 8 && col >= N - 8) || (row >= N - 8 && col < 8);
  const inLogo = (row, col) => row >= N / 2 - 3 && row <= N / 2 + 2 && col >= N / 2 - 3 && col <= N / 2 + 2;
  const acceso = (row, col) => {
    const h = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
    return (h - Math.floor(h)) > 0.47;
  };
  const moduli = [];
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      if (inFinder(row, col) || inLogo(row, col) || !acceso(row, col)) continue;
      moduli.push(<rect key={`${row}-${col}`} x={col * cell + cell * 0.1} y={row * cell + cell * 0.1}
        width={cell * 0.8} height={cell * 0.8} rx={r} fill={FG}/>);
    }
  }
  const Finder = ({ row, col }) => (
    <g transform={`translate(${col * cell}, ${row * cell})`}>
      <rect x={cell * 0.35} y={cell * 0.35} width={cell * 6.3} height={cell * 6.3} rx={cell * 1.9} fill="none" stroke={FG} strokeWidth={cell * 0.9}/>
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} rx={cell} fill={FG}/>
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Codice QR per scaricare Byup Staff">
      {moduli}
      <Finder row={0} col={0}/>
      <Finder row={0} col={N - 7}/>
      <Finder row={N - 7} col={0}/>
      {/* Il marchio al centro, sul gradiente dell'app */}
      <rect x={size / 2 - cell * 3} y={size / 2 - cell * 3} width={cell * 6} height={cell * 6} rx={cell * 1.6} fill={PN.GRAD_STAFF_FROM}/>
      <circle cx={size / 2} cy={size / 2} r={cell * 1.5} fill={PN.STAFF_CREAM}/>
    </svg>
  );
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

function RigaAccesso({ r, ultima, openMenu, setOpenMenu, onEditDevice,
  onToggleAttivo, onCambiaRuolo }) {
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
          {iniziali || (BuIcons.monitor||BuIcons.chef)({size: 18, color:'currentColor'})}
        </div>
        <div style={{minWidth: 0}}>
          <div title={r.nome} style={{
            fontSize: 15.5, fontWeight: 700, color: PN.TEXT,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{r.nome}</div>
          <div style={{
            fontSize: 13.5, color: PN.MUTED, marginTop: 1,
            fontFamily: 'inherit',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{r.sotto}</div>
          {/* Censimento POS (P-105): un asse diverso dall'accesso. Sta sotto
              il nome e non nella colonna Stato, che dice se il dispositivo
              entra — questa dice se l'Agenzia lo sa. Cliccarla porta al
              foglio precompilato dello strumento. */}
          {r.censimento && (
            <button
              onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('byup-imp-goto', { detail: { id: 'fiscali', anchor: 'pos-censimento', da: 'personale', strumento: r.censimento.id } })); }}
              title={r.censimento.sotto}
              className="pn-btn-feedback"
              style={{
                display:'inline-flex', alignItems:'center', gap: 5, marginTop: 4,
                padding:'2px 9px', borderRadius: 999, border:'none', cursor:'pointer', fontFamily:'inherit',
                background: r.censimento.fase === 'scaduta' ? '#FEF2F2' : PN.AMBER_SOFT,
                color: r.censimento.fase === 'scaduta' ? '#991B1B' : PN.AMBER,
                fontSize: 12.5, fontWeight: 700,
              }}>
              <span style={{width: 6, height: 6, borderRadius:'50%', background:'currentColor'}}/>
              {r.censimento.label} →
            </button>
          )}
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
          <span title="Il titolare cambia solo dai percorsi di titolarità: la persona da Account, il soggetto fiscale da Dati fiscali" style={{
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
              <MenuItem icon={BuIcons.user({size: 14, color: 'currentColor'})}
                onClick={() => { setOpenMenu(null); onCambiaRuolo?.(); }}>Modifica ruolo</MenuItem>
              {/* Lo strumento con cui incassa: la comunicazione all'Agenzia è
                  un obbligo di legge con una sanzione, e la strada verso il
                  foglio precompilato deve restare a portata anche da qui. */}
              {r.censimento && (
                <MenuItem icon={BuIcons.doc({size: 14, color: 'currentColor'})}
                  onClick={() => { setOpenMenu(null); window.dispatchEvent(new CustomEvent('byup-imp-goto', { detail: { id: 'fiscali', anchor: 'pos-censimento', da: 'personale', strumento: r.censimento.id } })); }}>Collegamento all'Agenzia</MenuItem>
              )}
              {/* Niente «Resetta password» su una persona: la sua password è
                  sua, la reimposta lei dal link che le arriva per email. Il
                  titolare le toglie l'accesso, non le sceglie le credenziali —
                  quelle le decide il titolare solo per i dispositivi, che una
                  casella di posta non ce l'hanno. */}
              <MenuItem icon={BuIcons.pause({size: 14, color: 'currentColor'})}
                onClick={() => { setOpenMenu(null); onToggleAttivo?.(); }}>
                {r.attivo ? 'Disattiva accesso' : 'Attiva accesso'}
              </MenuItem>
              <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
              <MenuItem icon={BuIcons.trash({size: 14, color: 'currentColor'})} danger
                onClick={() => { setOpenMenu(null); setConfermaRimozione(true); }}>Rimuovi dal team</MenuItem>
            </>
          ) : (
            /* Le tre cose che si fanno a uno schermo collegato (P-134): il
               nome, perché «Monitor pizza» oggi può diventare «Monitor
               secondi» domani; la visualizzazione, perché la stazione può
               cambiare senza che lo schermo si sposti; e la disconnessione,
               che è la revoca. Niente password da rigenerare: non c'è più. */
            <>
              <MenuItem icon={BuIcons.edit({size: 14, color: 'currentColor'})}
                onClick={() => { setOpenMenu(null); onEditDevice?.(); }}>Nome e visualizzazione</MenuItem>
              <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
              <MenuItem icon={BuIcons.trash({size: 14, color: 'currentColor'})} danger
                onClick={() => { setOpenMenu(null); onEditDevice?.(); }}>Disconnetti</MenuItem>
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
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Rimuovi dal team</div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, marginBottom: 22}}>
              Sei sicuro di voler rimuovere <b style={{color: PN.TEXT}}>{r.nome}</b>?
              {' '}L'accesso viene revocato subito.
            </div>
            <div style={{display:'flex', gap: 8, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setConfermaRimozione(false)}>Annulla</ImpButton>
              <ImpButton variant="danger" onClick={() => setConfermaRimozione(false)}>Rimuovi</ImpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ripiego per una persona il cui ruolo non esiste più — un ruolo personalizzato
// cancellato, per dire. Prima al suo posto c'era un ruolo «Cucina» invitabile
// per email: ma chi guarda le comande è il monitor di cucina, che si collega come
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

// ─── Il monitor di cucina: nome e visualizzazione ───────────────────────────
// È tutto quello che c'è da chiedere a uno schermo. Le categorie non si
// assegnano più da qui (P-134): il monitor non riceve categorie, vede TUTTE le
// comande e chi ci lavora restringe con i filtri della schermata Cucina. Le
// categorie sono una cosa delle stampanti, e si assegnano dal foglio della
// stampante, in Impostazioni → Integrazioni — che è un posto solo, invece dei
// due di prima.
// Niente nome utente e niente password: il monitor si collega con un codice
// che il titolare approva.

// La visualizzazione scelta va detta alla sezione Cucina, che sta su un'altra
// pagina: passa dal registro condiviso (panoramica-sidebar.jsx). Qui non si
// decide niente — si riferisce quello che ha scelto chi collega.
function salvaMonitorKds({ id, nome, vista }) {
  if (window.byupUpsertMonitorKds) window.byupUpsertMonitorKds({ id, nome, vista });
}

function useMonitorState(iniziale) {
  const [nome, setNome] = React.useState((iniziale && iniziale.name) || '');
  // Pub di default: è il locale a cui Fresh si rivolge per primo — alta
  // rotazione, portata unica. Chi lavora per portate lo dice cambiando qui.
  const [vista, setVista] = React.useState((iniziale && iniziale.kdsView) || 'pub');
  const valido = nome.trim().length > 0;
  const reset = () => { setNome(''); setVista('pub'); };
  return { nome, setNome, vista, setVista, valido, reset };
}

// `inRiga`: in pagina la card è larga e le due tessere della visualizzazione
// stanno affiancate; nella colonna stretta di una modale si impilano — a 265px
// il titolo si spezzava a metà («Visualizza- / zione Pub»).
function MonitorForm({ st, inRiga }) {
  const { nome, setNome, vista, setVista } = st;
  return (
    <React.Fragment>
      <ImpField label="Nome del monitor" hint="Come lo riconoscerete in elenco (es. Monitor pizza)">
        <input
          type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Monitor cucina"
          style={{
            width: '100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`,
            borderRadius: 9, fontSize: 15.5, fontFamily: 'inherit', outline: 'none', background: PN.WHITE,
          }}
        />
      </ImpField>
      <div style={{marginBottom: 16}}>
        {/* Niente etichetta «Visualizzazione» sopra: la dicono già le due
            tessere, e ripeterla faceva leggere la stessa parola tre volte in
            due centimetri. */}
        <div style={{display: 'grid', gap: 12, gridTemplateColumns: inRiga ? 'repeat(2, minmax(0, 1fr))' : '1fr'}}>
          {KDS_VIEWS.map(v => (
            <KdsViewCard key={v.id} v={v} on={vista === v.id} onClick={() => setVista(v.id)}/>
          ))}
        </div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6}}>
          Cambia come si vedono e si gestiscono gli ordini in cucina. Potrai modificarla da qui, sulla riga del monitor.
        </div>
      </div>
    </React.Fragment>
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

// `ruoli`: l'elenco vivo di chi apre la modale — un ruolo personalizzato appena
// creato dev'essere invitabile subito, e la costante di modulo non lo conosce.
// SOLO PERSONE (P-134). Il selettore «Persona | Dispositivo» non c'è più:
// l'unico dispositivo che entra è il monitor di cucina, e non si compila da
// qui — si collega con un codice, e ha il suo foglio.
function InviteModal({ onClose, prefill, ruoli }) {
  const allRolesForInvite = ruoli || [...ROLES, ...CUSTOM_ROLES];
  // Se prefill.roleId è quello di un ruolo selezionabile, usa quello; altrimenti default
  const prefillRoleSelectable = prefill?.roleId
    && allRolesForInvite.some(r => r.id === prefill.roleId && !r.locked);

  const [pname, setPname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roleId, setRoleId] = React.useState(prefillRoleSelectable ? prefill.roleId : 'cameriere');
  const [msg, setMsg] = React.useState('');
  const role = allRolesForInvite.find(r => r.id === roleId) || ROLES[0];
  const personValid = /\S+@\S+\.\S+/.test(email);
  // Riquadro permessi del ruolo selezionato
  const perms = role.areas.filter(a => PERM_LABELS[a]).map(a => ({ icon: PERM_ICONS[a] || 'doc', label: PERM_LABELS[a] }));
  if (role.id === 'cameriere') perms.splice(1, 0, { icon: 'utensils', label: 'Gestione tavoli e ordini' });
  const noSettings = !role.areas.includes('impostazioni');

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...IMP_MODAL_PANEL,
        width: 620, maxWidth:'100%', position:'relative',
        maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display:'flex', flexDirection:'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>Invita una persona</div>
          <div style={IMP_MODAL_SUB}>Invia un accesso al gestionale o all'app staff.</div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow:'auto', flex: 1}}>
          {/* Due colonne: campi a sinistra, riquadro del ruolo a destra */}
          <div style={{display:'grid', gridTemplateColumns:'minmax(0, 1fr) 210px', gap: 16, alignItems:'start'}}>
            <div style={{minWidth: 0}}>
              <ImpField label="Nome e cognome">
                <input
                  type="text" value={pname} onChange={e => setPname(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  style={{
                    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                    borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none', background: PN.WHITE,
                  }}
                />
              </ImpField>
              <ImpField label="Email">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="es. mario.rossi@email.it"
                  style={{
                    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                    borderRadius:9, fontSize:15.5, fontFamily:'inherit', outline:'none', background: PN.WHITE,
                  }}
                />
              </ImpField>
              {/* Stesso selettore del cambio ruolo: è la stessa scelta, e
                  farla in due modi diversi in due finestre gemelle è il modo
                  migliore per far sembrare due prodotti lo stesso. */}
              <ImpField label="Ruolo">
                <SelettoreRuolo
                  ruoli={allRolesForInvite.filter(r => !r.locked)}
                  valore={roleId} onScegli={setRoleId}/>
              </ImpField>
              <ImpField label="Messaggio opzionale">
                <div style={{position:'relative'}}>
                  <textarea
                    value={msg} maxLength={200} onChange={e => setMsg(e.target.value)}
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
        </div>

        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          display:'flex', gap: 10, justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{fontSize: 13.5, color: PN.MUTED}}>
            {personValid
              ? <>Invierà invito a <b style={{color: PN.TEXT}}>{email}</b> come <b style={{color: role.color}}>{role.label}</b></>
              : 'Inserisci un\'email valida'}
          </div>
          {/* Niente «Annulla»: uscire senza fare niente è la X in alto, che
              chiude questa come ogni altra finestra. */}
          <ImpButton variant="primary" onClick={onClose} style={{whiteSpace:'nowrap'}} disabled={!personValid}>
            Invia invito
          </ImpButton>
        </div>
      </div>
    </div>
  );
}

// ─── Collegare il monitor di cucina, per approvazione (P-134) ───────────────
// Il gesto non si compie da qui: si compie sullo schermo della cucina, che
// mostra un codice. Questo foglio dice dove andare, prende il codice e chiede
// le due sole cose che restano — come si chiama quello schermo e come deve
// mostrare le comande.
// Può confermare il SOLO Titolare: è un permesso, e per ora sta lì. Se un
// giorno servirà darlo a un ruolo personalizzato si darà, ma non nasce
// distribuito.
const MONITOR_ISTRUZIONI = [
  <>Vai al monitor della cucina e apri <b>byup.it/cucina</b>.</>,
  <>Sullo schermo compare un QR con sotto un codice.</>,
  <>Inquadra il QR con il telefono, oppure scrivi il codice qui.</>,
  <>Entra con il tuo account e conferma: poi dai un nome al monitor e scegli come deve mostrare le comande.</>,
];

function CollegaMonitorModal({ onClose, codiceIniziale, onFatto }) {
  const [codice, setCodice] = React.useState((codiceIniziale || '').toUpperCase());
  const [passo, setPasso] = React.useState(codiceIniziale ? 'dati' : 'codice');
  const [errore, setErrore] = React.useState('');
  const st = useMonitorState(null);
  const puo = PN_UTENTE.ruolo === 'titolare';

  // Un codice qualunque passa, ed è FINZIONE DICHIARATA: nel prodotto il
  // codice lo tiene il server e uno che non corrisponde a nessuno schermo non
  // apre niente. Qui il collegamento si guarda anche senza avere davvero
  // aperto `byup.it/cucina` in un'altra scheda — che è il solo modo in cui, in
  // un prototipo senza backend, quel codice può esistere. Se invece uno
  // schermo lo sta davvero mostrando, il collegamento è quello vero: si
  // approva quella richiesta, e lo schermo passa a «Collegato» da sé.
  const richiesta = () => (window.byupMonitorRichiestaPerCodice ? window.byupMonitorRichiestaPerCodice(codice) : null);
  const verifica = () => { setErrore(''); setPasso('dati'); };
  const conferma = () => {
    const dati = { nome: st.nome.trim(), vista: st.vista };
    const m = richiesta() ? window.byupMonitorApprova(codice, dati) : null;
    // Nessuno schermo sta mostrando questo codice: il monitor entra lo stesso
    // in elenco, così nome e visualizzazione si vedono all'opera.
    const finale = m || Object.assign({ id: 'mon-' + Date.now().toString(36), collegato_il: new Date().toISOString() }, dati);
    if (!m) salvaMonitorKds(finale);
    onFatto && onFatto(finale);
    onClose();
  };

  const inp = {
    width: '100%', padding: '14px 16px', border: `1px solid ${PN.BORDER}`, borderRadius: 10,
    fontSize: 30, fontWeight: 800, letterSpacing: 10, textAlign: 'center',
    fontFamily: 'ui-monospace, Menlo, monospace', textTransform: 'uppercase',
    outline: 'none', background: PN.WHITE, boxSizing: 'border-box',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} data-collega-monitor={passo} style={{
        ...IMP_MODAL_PANEL, width: 520, maxWidth: '100%', position: 'relative',
        maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>Collega il monitor di cucina</div>
          <div style={IMP_MODAL_SUB}>
            {passo === 'codice'
              ? 'Lo schermo mostra un codice: scrivilo qui e confermalo.'
              : 'Dai un nome a questo schermo e scegli come deve mostrare le comande.'}
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow: 'auto', flex: 1}}>
          {passo === 'codice' ? (
            <React.Fragment>
              <ol style={{margin: '0 0 18px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6}}>
                {MONITOR_ISTRUZIONI.map((t, i) => (
                  <li key={i} style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>{t}</li>
                ))}
              </ol>
              <ImpField label="Codice mostrato sullo schermo" hint="Quattro caratteri. Dura pochi minuti, poi lo schermo ne mostra un altro.">
                <input value={codice} maxLength={4} autoFocus
                  onChange={e => { setCodice(e.target.value.replace(/\s/g, '').toUpperCase()); setErrore(''); }}
                  onKeyDown={e => { if (e.key === 'Enter' && codice.length === 4) verifica(); }}
                  placeholder="4KP2" style={inp}/>
              </ImpField>
              {errore && (
                <div style={{marginTop: 4, padding: '10px 12px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13.5, color: '#991B1B', lineHeight: 1.5}}>{errore}</div>
              )}
              <div style={{marginTop: 14, fontSize: 13, color: PN.MUTED, lineHeight: 1.5}}>
                Nel prototipo lo schermo della cucina è <a href="byup Cucina Collega.html" target="_blank" rel="noopener" style={{color: PN.TEXT, fontWeight: 700}}>questa pagina</a>: aprila in un'altra scheda per vedere il codice vero.
                Qui va bene <b>qualunque codice di quattro caratteri</b> — nel prodotto no, ma senza server è l'unico modo di far vedere che cosa si chiede dopo.
              </div>
            </React.Fragment>
          ) : (
            <MonitorForm st={st}/>
          )}
        </div>

        <div style={{
          padding: '14px 24px', borderTop: `1px solid ${PN.BORDER_SOFT}`,
          display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{fontSize: 13.5, color: PN.MUTED, maxWidth: 280, lineHeight: 1.4}}>
            {!puo
              ? 'Solo il titolare può approvare uno schermo: su quel monitor passano i nomi dei tavoli e le allergie dichiarate dai clienti.'
              : passo === 'codice' ? 'Il collegamento dura finché non lo togli da qui.' : 'Potrai cambiare nome e visualizzazione quando vuoi.'}
          </div>
          {passo === 'codice' ? (
            <ImpButton variant="primary" disabled={codice.length !== 4 || !puo} onClick={verifica} style={{whiteSpace: 'nowrap'}}>Continua</ImpButton>
          ) : (
            <ImpButton variant="primary" disabled={!st.valido || !puo} onClick={conferma} style={{whiteSpace: 'nowrap'}}>Collega il monitor</ImpButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Il monitor già collegato: nome, visualizzazione, disconnessione ────────
// Uno schermo collegato non è chiuso a chiave. Le prime due sono modifiche e
// valgono subito; la terza è una revoca — toglie l'accesso a quello schermo
// esattamente come lo si toglie a una persona — e come tutte le revoche
// finisce nel registro delle attività.
function MonitorModal({ dispositivo, onClose, onFatto }) {
  const st = useMonitorState(dispositivo);
  const [conferma, setConferma] = React.useState(false);
  const puo = PN_UTENTE.ruolo === 'titolare';

  const salva = () => {
    salvaMonitorKds({ id: dispositivo.monitorId, nome: st.nome.trim() || dispositivo.name, vista: st.vista });
    onFatto && onFatto(`«${st.nome.trim() || dispositivo.name}» aggiornato`);
    onClose();
  };
  const disconnetti = () => {
    if (window.byupRimuoviMonitorKds) window.byupRimuoviMonitorKds(dispositivo.monitorId);
    if (window.byupScriviAuditEvento) window.byupScriviAuditEvento('device_revoked', dispositivo.name, 'disconnesso');
    onFatto && onFatto(`«${dispositivo.name}» disconnesso`);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} data-monitor-modale={dispositivo.monitorId} style={{
        ...IMP_MODAL_PANEL, width: 520, maxWidth: '100%', position: 'relative',
        maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>Monitor di cucina</div>
          <div style={IMP_MODAL_SUB}>
            Stai modificando <b style={{color: PN.TEXT}}>{dispositivo.name}</b>. Nome e visualizzazione valgono subito, su quello schermo.
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow: 'auto', flex: 1}}>
          <MonitorForm st={st}/>
        </div>

        <div style={{
          padding: '14px 24px', borderTop: `1px solid ${PN.BORDER_SOFT}`,
          display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center',
        }}>
          <ImpButton variant="danger" disabled={!puo} onClick={() => setConferma(true)}
            style={{whiteSpace: 'nowrap'}} icon={BuIcons.trash({size: 14, color: 'currentColor'})}>
            Disconnetti
          </ImpButton>
          <ImpButton variant="primary" disabled={!st.valido} onClick={salva} style={{whiteSpace: 'nowrap'}}>Salva modifiche</ImpButton>
        </div>
      </div>

      {conferma && (
        <div onClick={e => { e.stopPropagation(); setConferma(false); }} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)',
          display: 'grid', placeItems: 'center', zIndex: 200,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{...IMP_MODAL_PANEL, width: 400, maxWidth: '90%', padding: 24}}>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Disconnettere questo schermo?</div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, marginBottom: 22}}>
              <b style={{color: PN.TEXT}}>{dispositivo.name}</b> smette subito di vedere le comande e torna a mostrare il codice di collegamento. Per farlo rientrare dovrai approvarlo di nuovo.
            </div>
            <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setConferma(false)}>Annulla</ImpButton>
              <ImpButton variant="danger" onClick={disconnetti}>Disconnetti</ImpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Selettore di ruolo ─────────────────────────────────────────────────────
// Un <select> nativo apre l'elenco del sistema operativo: nessun colore, nessuna
// descrizione, e su Windows un'altra tipografia. Ma soprattutto un ruolo non è
// una parola in una lista — è un segno colorato e una frase che dice che cosa
// vede chi lo ha, e sono proprio quelle due cose che servono per scegliere.
// Stessa grammatica del menu «Tipo dispositivo»: bottone con il valore attuale,
// elenco che si apre sotto, voce accesa in rosa.
function SelettoreRuolo({ ruoli, valore, onScegli }) {
  const [aperto, setAperto] = React.useState(false);
  const box = React.useRef(null);
  const sel = ruoli.find(r => r.id === valore) || ruoli[0];

  // Click fuori: un menu che resta aperto dopo che si è guardato altrove è un
  // menu che va chiuso a mano, e nessuno lo fa.
  React.useEffect(() => {
    if (!aperto) return;
    const fuori = (e) => { if (box.current && !box.current.contains(e.target)) setAperto(false); };
    document.addEventListener('pointerdown', fuori);
    return () => document.removeEventListener('pointerdown', fuori);
  }, [aperto]);

  const Voce = ({ r, on, onClick }) => (
    <button onClick={onClick} style={{
      display:'flex', width:'100%', alignItems:'center', gap: 10,
      padding:'9px 10px', background: on ? PN.PINK_SOFT : 'transparent',
      border:'none', borderRadius: 8, fontFamily:'inherit', cursor:'pointer', textAlign:'left',
    }}
      onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#F7F8FA'; }}
      onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: r.bg, color: r.color, display:'grid', placeItems:'center',
      }}>{(BuIcons[r.icon]||BuIcons.user)({size: 14, color:'currentColor'})}</span>
      <span style={{minWidth: 0}}>
        <span style={{
          display:'block', fontSize: 15, fontWeight: 700,
          color: on ? PN.PINK_DARK : PN.TEXT,
        }}>{r.label}</span>
        <span style={{
          display:'block', fontSize: 13, color: PN.MUTED, lineHeight: 1.35,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{r.desc}</span>
      </span>
    </button>
  );

  return (
    <div ref={box} style={{position:'relative'}}>
      <button onClick={() => setAperto(a => !a)} style={{
        width:'100%', padding:'9px 12px', borderRadius: 9,
        border:`1px solid ${aperto ? PN.PINK : PN.BORDER}`, background: PN.WHITE,
        cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap: 10, textAlign:'left',
        transition:'border-color 140ms ease',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: sel.bg, color: sel.color, display:'grid', placeItems:'center',
        }}>{(BuIcons[sel.icon]||BuIcons.user)({size: 14, color:'currentColor'})}</span>
        <span style={{flex: 1, minWidth: 0}}>
          <span style={{display:'block', fontSize: 15.5, fontWeight: 600, color: PN.TEXT}}>{sel.label}</span>
        </span>
        <span style={{
          display:'inline-flex', color: PN.MUTED, flexShrink: 0,
          transform: aperto ? 'rotate(180deg)' : 'none', transition:'transform 140ms ease',
        }}><PnI.ChevronDown size={14}/></span>
      </button>

      {aperto && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left: 0, right: 0, zIndex: 5,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 10,
          padding: 4, boxShadow:'0 10px 28px rgba(15, 17, 21, 0.12)',
          maxHeight: 260, overflowY:'auto',
        }} className="pn-scroll">
          {ruoli.map(r => (
            <Voce key={r.id} r={r} on={r.id === valore}
              onClick={() => { onScegli(r.id); setAperto(false); }}/>
          ))}
        </div>
      )}
    </div>
  );
}

// La password di un dispositivo non esiste più (P-134), e con lei se n'è
// andato «Genera nuova password»: il monitor di cucina non entra con nome
// utente e password, si collega con un codice che il titolare approva. Il
// telefono che incassa non le ha mai usate — entra con le credenziali
// personali della persona che lo porta in tasca.
// ─── Modifica ruolo (dal menu «⋯» della riga) ───────────────────────────────
// Il ruolo non è un'etichetta: sono le sezioni che una persona vede. Si sceglie
// e poi si conferma, con davanti quello che cambia — chi tocca questa voce per
// sbaglio se ne accorge prima e non dopo.
function CambiaRuoloModal({ r, ruoli, onConferma, onClose }) {
  const [scelto, setScelto] = React.useState(r.ruolo.id);
  const [conferma, setConferma] = React.useState(false);
  const nuovo = ruoli.find(x => x.id === scelto) || r.ruolo;
  const cambiato = scelto !== r.ruolo.id;
  const acc = accessoDelRuolo(nuovo);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...IMP_MODAL_PANEL, width: 420, maxWidth:'100%', position:'relative',
      }}>
        {!conferma ? (
          <>
            <div style={IMP_MODAL_HEAD}>
              <div style={IMP_MODAL_TITLE}>Modifica ruolo</div>
              <div style={IMP_MODAL_SUB}>
                <b style={{color: PN.TEXT}}>{r.nome}</b> è {r.ruolo.label}. Il ruolo decide che
                cosa vede nel gestionale.
              </div>
              <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
            </div>
            <div style={{padding:'20px 24px'}}>
              <ImpField label="Ruolo" hint={acc.tutte}>
                <SelettoreRuolo ruoli={ruoli} valore={scelto} onScegli={setScelto}/>
              </ImpField>
            </div>
            <div style={{
              padding:'14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
              display:'flex', justifyContent:'flex-end',
            }}>
              <ImpButton variant="primary" disabled={!cambiato}
                style={{whiteSpace:'nowrap'}} onClick={() => setConferma(true)}>
                Salva ruolo
              </ImpButton>
            </div>
          </>
        ) : (
          <div style={{padding: 24}}>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 8}}>
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: PN.AMBER_SOFT, color: '#B45309',
                display:'grid', placeItems:'center',
              }}>{(BuIcons.alert||BuIcons.bulb)({size: 15, color:'currentColor'})}</span>
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Sei sicuro?</div>
            </div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, marginBottom: 22}}>
              <b style={{color: PN.TEXT}}>{r.nome}</b> passa da <b style={{color: r.ruolo.color}}>{r.ruolo.label}</b>
              {' '}a <b style={{color: nuovo.color}}>{nuovo.label}</b>, e da quel momento accede a:
              {' '}<b style={{color: PN.TEXT}}>{acc.tutte}</b>. Il cambio vale subito, anche se è già dentro.
            </div>
            <div style={{display:'flex', gap: 8, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setConferma(false)}>Indietro</ImpButton>
              <ImpButton variant="primary" style={{whiteSpace:'nowrap'}}
                onClick={() => onConferma(scelto)}>
                Cambia ruolo
              </ImpButton>
            </div>
          </div>
        )}
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
        maxHeight:'calc(var(--pn-vh, 100vh) * 0.9)', display:'flex', flexDirection:'column',
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

// La descrizione di un ruolo personalizzato è l'elenco di quello che vede: è
// l'unica cosa che distingue due ruoli su misura quando li si sceglie da un
// menu, dove il nome da solo non dice cosa può fare chi lo ha.
function descrizioneAree(areas) {
  if (!areas.length) return 'Nessuna area visibile';
  return 'Vede ' + ALL_AREAS.filter(a => areas.includes(a.id)).map(a => a.label).join(' · ');
}

// Id ricavato dal nome — che è unico per costruzione — con una coda numerica
// se per qualche motivo lo fosse già.
function idLibero(nome, elenco) {
  const base = 'custom-' + (nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ruolo');
  let id = base;
  for (let n = 2; elenco.some(r => r.id === id); n++) id = `${base}-${n}`;
  return id;
}

// Cassa, Cameriere e Titolare sono i ruoli di sistema: hanno permessi di
// partenza e non si smontano. Aprirne i permessi e salvare non li cambia — si
// esce con un ruolo PERSONALIZZATO nuovo, che quindi ha bisogno di un nome suo,
// perché due ruoli con lo stesso nome sarebbero indistinguibili nel momento in
// cui li si assegna a qualcuno. Il ruolo di sistema resta dov'era, intatto.
//
// Oggi l'unica porta d'ingresso è «Crea ruolo», che apre la modale senza
// `role`: il ramo `role` — modifica di un personalizzato, ruolo nuovo a partire
// da uno di sistema — resta qui perché è la regola del prodotto, pronto per
// quando ci sarà di nuovo un punto da cui aprire i permessi di un ruolo.
function CreateRoleModal({ onClose, role, roles, onSave }) {
  const isEdit = !!role;
  // Da un ruolo di sistema si esce sempre con un ruolo nuovo; un ruolo
  // personalizzato invece si modifica sul posto.
  const daStandard = isEdit && !role.custom;
  const [name, setName] = React.useState(role?.label || '');
  const [areas, setAreas] = React.useState(role?.areas || []);
  const [settingsMode, setSettingsMode] = React.useState(role?.settingsPages ? 'custom' : 'all');
  const [settingsPages, setSettingsPages] = React.useState(role?.settingsPages || []);
  const [errore, setErrore] = React.useState(null); // { titolo, msg }

  const elenco = roles || [...ROLES, ...CUSTOM_ROLES];

  const toggle = (id) => {
    setAreas(areas.includes(id) ? areas.filter(a => a !== id) : [...areas, id]);
  };
  const togglePage = (id) => {
    setSettingsPages(settingsPages.includes(id) ? settingsPages.filter(p => p !== id) : [...settingsPages, id]);
  };

  const salva = () => {
    const nome = name.trim();
    if (!nome) {
      setErrore({ titolo: 'Manca il nome', msg: 'Dai un nome al ruolo prima di salvarlo.' });
      return;
    }
    // Confronto senza maiuscole e senza spazi ai bordi: «Cassa » e «cassa»
    // sono lo stesso nome per chi legge l'elenco, ed è l'elenco che conta.
    // Il ruolo che si sta modificando non fa concorrenza a se stesso.
    const collide = elenco.some(r =>
      r.label.trim().toLowerCase() === nome.toLowerCase() &&
      !(isEdit && !daStandard && r.id === role.id)
    );
    if (collide) {
      setErrore({
        titolo: 'Nome già in uso',
        msg: daStandard
          ? `«${role.label}» è un ruolo di sistema e resta com'è: quello che stai salvando è un ruolo personalizzato, e gli serve un nome suo.`
          : `C'è già un ruolo che si chiama «${nome}». Scegline un altro.`,
      });
      return;
    }
    const dati = {
      label: nome,
      desc: descrizioneAree(areas),
      areas,
      settingsPages: areas.includes('impostazioni') && settingsMode === 'custom' ? settingsPages : undefined,
    };
    if (onSave) {
      onSave(isEdit && !daStandard
        ? { ...role, ...dati }
        : { ...dati, id: idLibero(nome, elenco), color: '#6D28D9', bg: '#EDE9FE', icon: 'sparkle', custom: true });
    }
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...IMP_MODAL_PANEL,
        width: 480, maxWidth:'100%', position:'relative',
        maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display:'flex', flexDirection:'column',
      }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>
            {isEdit ? `Permessi · ${role.label}` : 'Crea ruolo personalizzato'}
          </div>
          <div style={IMP_MODAL_SUB}>
            {daStandard
              ? 'Da qui esce un ruolo personalizzato: il ruolo di sistema resta com’è'
              : isEdit ? 'Aggiorna nome e aree visibili a questo ruolo' : 'Definisci nome e aree visibili'}
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{padding: '20px 24px', overflow:'auto', flex: 1}}>
          {/* Detto prima, non dopo: chi apre i permessi di Cassa si aspetta di
              cambiare Cassa, e invece esce con un ruolo nuovo. Scoprirlo dal
              popup d'errore sul nome sarebbe scoprirlo troppo tardi. */}
          {daStandard && (
            <div style={{
              display:'flex', gap: 10, alignItems:'flex-start',
              padding: '11px 13px', marginBottom: 16,
              background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10,
            }}>
              <span style={{display:'inline-flex', color:'#6D28D9', flexShrink: 0, marginTop: 1}}>
                {BuIcons.sparkle({size: 15, color:'currentColor'})}
              </span>
              <div style={{fontSize: 13.5, color: PN.TEXT, lineHeight: 1.45}}>
                <b>{role.label}</b> è un ruolo di sistema e non si modifica. Salvando crei un
                ruolo personalizzato con questi permessi, quindi dagli un nome tuo.
              </div>
            </div>
          )}
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
          <ImpButton variant="primary" onClick={salva}>
            {daStandard ? 'Crea ruolo personalizzato' : isEdit ? 'Salva modifiche' : 'Crea ruolo'}
          </ImpButton>
        </div>

        {/* L'errore ferma il salvataggio e rimanda al modulo con dentro quello
            che c'era: chi ha appena scelto otto aree non deve rifarlo perché il
            nome era occupato. */}
        {errore && (
          <div style={{
            position:'absolute', inset: 0, zIndex: 5, borderRadius: 22,
            background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', padding: 22,
          }}>
            <div style={{...IMP_MODAL_PANEL, width: 330, padding: '20px 22px'}}>
              <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 8}}>
                <span style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: PN.PINK_SOFT, color: PN.PINK_DARK,
                  display:'grid', placeItems:'center',
                }}>{BuIcons.alert({size: 15, color:'currentColor'})}</span>
                <div style={{fontSize: 16.5, fontWeight: 800, color: PN.TEXT}}>{errore.titolo}</div>
              </div>
              <div style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.45}}>{errore.msg}</div>
              <div style={{display:'flex', justifyContent:'flex-end', marginTop: 16}}>
                <ImpButton variant="primary" onClick={() => setErrore(null)}>Torna indietro</ImpButton>
              </div>
            </div>
          </div>
        )}
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
  { id: 'monitor', label: 'Monitor cucina', desc: 'Mostra le comande in tempo reale',      icon: 'monitor' },
];
// I ruoli del personale sono due, e sono i due modi in cui si prende un ordine:
// dalla cassa del locale o dall'app in sala. «Manager» non era un ruolo del
// personale — chi gestisce il locale è il titolare, che il gestionale ce
// l'ha già; e «Cucina» non era una persona da invitare ma il monitor di cucina,
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
  // «Monitor cucina» e non «Dispositivo cucina»: è quello che scrive la
  // sincronizzazione col registro qui sotto, e la riga di partenza non può
  // chiamare la stessa cosa con un altro nome. Al posto dell'email c'è la
  // visualizzazione: un monitor non ha né email né nome utente (P-134).
  { id: 't4', kind: 'device', name: 'Monitor cucina', email: 'Ristorante',       role: 'Monitor cucina', status: 'active' },
];

// Configurare un dispositivo è l'altra metà del passo: le persone si invitano,
// i dispositivi si collegano. Vive in una SEZIONE SUA e non sotto lo stesso
// titolo — sono due lavori diversi, e nella stessa card sembravano un elenco
// di campi che continua.
//
// LE DUE TESSERE RESTANO TUTTE E DUE (P-134), e la differenza con Personale va
// capita bene perché sembra una contraddizione e non lo è. La configurazione
// completa è il percorso che si fa UNA VOLTA SOLA, all'apertura, e serve a non
// lasciare fuori niente: lì la stampante va ricordata, perché chi apre un
// ristorante non sa ancora che le stampanti stanno in Integrazioni. Quello che
// esce da Personale è l'ELENCO PERMANENTE delle stampanti, che è un'altra
// cosa: una volta collegate si gestiscono da Integrazioni e non compaiono più
// fra chi entra nel gestionale.
//   — la tessera della STAMPANTE apre lo stesso blocco di Integrazioni, non
//     una copia: stesso foglio, stesso registro, aperto da un altro punto;
//   — la tessera del MONITOR non apre un modulo da compilare, apre le
//     ISTRUZIONI, perché il gesto non si compie da qui: si compie sullo
//     schermo della cucina, che mostra un codice. Chi in quel momento non ha
//     il monitor sottomano salta il passo e lo fa dopo da Personale — è la
//     stessa cosa, e non va rifatta due volte.
function DispositivoStep({ setTeam }) {
  const [selDevice, setSelDevice] = React.useState('printer');
  const [collega, setCollega] = React.useState(false);
  const stampante = selDevice === 'printer';

  // Una stampante collegata dal popup finisce anche in «Membri e
  // dispositivi», che è l'elenco di questo passo: il registro è la verità, e
  // l'elenco gli va dietro invece di essere riempito a mano dalla CTA. Lo
  // stesso vale per un monitor approvato.
  React.useEffect(() => {
    const sincronizza = () => {
      const devices = (window.byupReadStampanti ? window.byupReadStampanti().devices : []) || [];
      const monitors = window.byupReadMonitorsKds ? window.byupReadMonitorsKds() : [];
      setTeam(t => {
        const gia = new Set(t.filter(x => x.regId).map(x => x.regId));
        const nuove = [
          ...devices.filter(d => !gia.has(d.id)).map(d => ({
            id: `d-${d.id}`, regId: d.id, kind: 'device', name: d.name,
            email: (window.PN_PRINTER_PROTOCOLLI && window.PN_PRINTER_PROTOCOLLI[d.printer_protocol] || {}).breve || '—',
            role: 'Stampante', status: 'active',
          })),
          ...monitors.filter(m => !gia.has(m.id)).map(m => ({
            id: `d-${m.id}`, regId: m.id, kind: 'device', name: m.nome,
            email: (KDS_VIEWS.find(v => v.id === m.vista) || KDS_VIEWS[0]).short,
            role: 'Monitor cucina', status: 'active',
          })),
        ];
        return nuove.length ? [...t, ...nuove] : t;
      });
    };
    sincronizza();
    window.addEventListener('byup-stampanti-change', sincronizza);
    window.addEventListener('byup-kds-vista-change', sincronizza);
    return () => {
      window.removeEventListener('byup-stampanti-change', sincronizza);
      window.removeEventListener('byup-kds-vista-change', sincronizza);
    };
  }, []);

  return (
    <div>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Configura un dispositivo</div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, marginBottom: 14}}>
          Collega solo i dispositivi che ti servono per iniziare. Potrai aggiungerne altri in seguito.
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap: 12}}>
          {STEP_DEVICES.map(d => (
            <StepDeviceCard key={d.id} d={d} on={selDevice === d.id}
              onClick={() => setSelDevice(d.id)}/>
          ))}
        </div>

        {/* La stampante: il blocco di Integrazioni, senza la sua card e su due
            colonne, perché questa è la colonna del modulo. È lo stesso blocco,
            non una copia che invecchia per conto suo. */}
        {stampante && window.ImpStampantiBlocco && (
          <div style={{ marginTop: 16 }}>
            <window.ImpStampantiBlocco inline colonne={2}/>
          </div>
        )}

        {/* Il monitor: le istruzioni, non un modulo. Il gesto si compie sullo
            schermo della cucina. */}
        {!stampante && (
          <div style={{
            marginTop: 16, padding:'16px 18px', borderRadius: 12,
            border:`1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE,
          }}>
            <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>
              Il monitor si collega dallo schermo della cucina
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.5, marginBottom: 12}}>
              Non c'è niente da compilare qui: lo schermo mostra un codice, e tu lo confermi.
            </div>
            <ol style={{margin: '0 0 14px', paddingLeft: 20, display:'flex', flexDirection:'column', gap: 6}}>
              {MONITOR_ISTRUZIONI.map((t, i) => (
                <li key={i} style={{fontSize: 14, color: PN.TEXT, lineHeight: 1.5}}>{t}</li>
              ))}
            </ol>
            <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
              <ImpButton variant="pink" onClick={() => setCollega(true)}>Ho il codice, collega</ImpButton>
              <span style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.45, flex: 1, minWidth: 200}}>
                Se il monitor non ce l'hai sottomano adesso, salta: lo colleghi dopo da Impostazioni → Personale, ed è la stessa cosa.
              </span>
            </div>
          </div>
        )}

        {collega && (
          <CollegaMonitorModal onClose={() => setCollega(false)} onFatto={() => {}}/>
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

// La tessera «Scarica Byup Staff» serve anche alla Configurazione completa,
// che è l'altro posto in cui si mette in piedi il personale.
window.PersStaffPromo = PersStaffPromo;

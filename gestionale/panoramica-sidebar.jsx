// Sidebar — primary nav

const PN_PAGES = {
  panoramica: 'byup Panoramica.html',
  sala: 'byup Sala.html?tab=tavoli',
  vendita: 'byup Sala.html?tab=vendita',
  prenotazioni: 'byup Sala.html?tab=calendar',
  cucina: 'byup Cucina.html',
  statistiche: 'byup Statistiche.html',
  contabilita: 'byup Contabilita.html',
  impostazioni: 'byup Impostazioni.html',
  supporto: 'byup Supporto.html',
  profilo: 'byup Profilo.html',
};

// Moduli abilitati — condivisi via localStorage tra pagine.
// `asporto` decide se il locale prepara ordini da portar via: da spento
// spariscono le code del banco in Vendita diretta e il conto non può essere
// segnato da asporto. Si sceglie in onboarding e si cambia da Impostazioni →
// Operazioni. Default acceso: un locale che non fa asporto lo spegne, uno che
// lo fa non deve accorgersi di doverlo accendere.
const BYUP_MODULES_KEY = 'byup_modules_enabled';
const BYUP_MODULES_DEFAULT = {sala:true, prenotazioni:true, asporto:true};
window.byupReadModules = function() {
  try {
    const s = localStorage.getItem(BYUP_MODULES_KEY);
    return s ? Object.assign({}, BYUP_MODULES_DEFAULT, JSON.parse(s)) : {...BYUP_MODULES_DEFAULT};
  } catch(e) { return {...BYUP_MODULES_DEFAULT}; }
};
window.byupWriteModules = function(m) {
  try {
    localStorage.setItem(BYUP_MODULES_KEY, JSON.stringify(m));
    // Notifica i listener della stessa pagina (storage event nativo fira solo per altre tab)
    window.dispatchEvent(new Event('byup-modules-change'));
  } catch(e) {}
};

// Visualizzazione del Kitchen Monitor — «pub» o «ristorante». Si sceglie dove si
// collega il monitor (onboarding · Configurazione completa) e si cambia dove lo
// si modifica (Impostazioni → Personale): è un attributo del dispositivo, non
// un'impostazione del locale, e non ha un terzo interruttore da nessuna parte.
// Vive qui, con gli altri stati condivisi fra pagine, perché la sezione Cucina
// deve saperla pur stando su un'altra pagina.
// Default «ristorante»: è la cucina che il gestionale ha sempre avuto, e chi non
// ha ancora collegato un monitor non deve vedersela cambiare sotto i piedi.
// I Kitchen Monitor collegati, condivisi fra pagine. Ognuno porta la sua
// visualizzazione — «pub» o «ristorante» — che si sceglie DOVE SI COLLEGA il
// dispositivo (onboarding · Impostazioni → Personale) e in nessun altro posto:
// è una proprietà di quello schermo, come il nome.
// La sezione Cucina non la sceglie, sceglie QUALE MONITOR guardare; la vista
// viene dietro. Così i due punti non possono contraddirsi: c'è una sola cosa
// scritta in un solo posto, e la Cucina la legge.
const BYUP_KDS_LISTA_KEY  = 'byup_kds_monitor';
const BYUP_KDS_ATTIVO_KEY = 'byup_kds_attivo';
// Default: i due monitor del locale d'esempio. Servono perché la Cucina si può
// aprire senza essere mai passati da Impostazioni, e uno schermo di cucina
// vuoto non dice niente a nessuno.
const BYUP_KDS_DEFAULT = [
  { id: 'PG1-cucina', nome: 'Monitor cucina principale', vista: 'ristorante' },
  { id: 'PG1-pizza',  nome: 'Monitor pizza',             vista: 'pub' },
];
function _byupKdsNormalizza(m) {
  return {
    id: String(m && m.id || '').trim() || 'monitor',
    nome: String(m && m.nome || '').trim() || 'Kitchen Monitor',
    vista: m && m.vista === 'pub' ? 'pub' : 'ristorante',
  };
}
window.byupReadMonitorsKds = function() {
  try {
    const s = localStorage.getItem(BYUP_KDS_LISTA_KEY);
    const v = s ? JSON.parse(s) : null;
    if (Array.isArray(v) && v.length) return v.map(_byupKdsNormalizza);
  } catch(e) {}
  return BYUP_KDS_DEFAULT.slice();
};
window.byupReadMonitorAttivoKds = function() {
  const lista = window.byupReadMonitorsKds();
  let id = '';
  try { id = localStorage.getItem(BYUP_KDS_ATTIVO_KEY) || ''; } catch(e) {}
  return lista.find(m => m.id === id) || lista[0];
};
window.byupSetMonitorAttivoKds = function(id) {
  try {
    localStorage.setItem(BYUP_KDS_ATTIVO_KEY, String(id || ''));
    window.dispatchEvent(new Event('byup-kds-vista-change'));
  } catch(e) {}
};
// Collegando o modificando un monitor: entra in elenco se è nuovo, si aggiorna
// se c'era già. Diventa anche quello attivo, perché chi lo ha appena
// configurato è lì per vedere l'effetto.
window.byupUpsertMonitorKds = function(m) {
  try {
    const nuovo = _byupKdsNormalizza(m);
    const lista = window.byupReadMonitorsKds();
    const i = lista.findIndex(x => x.id === nuovo.id);
    if (i >= 0) lista[i] = nuovo; else lista.push(nuovo);
    localStorage.setItem(BYUP_KDS_LISTA_KEY, JSON.stringify(lista));
    localStorage.setItem(BYUP_KDS_ATTIVO_KEY, nuovo.id);
    window.dispatchEvent(new Event('byup-kds-vista-change'));
  } catch(e) {}
};

// Locale attivo — quello su cui opera il gestionale; condiviso via localStorage.
// Si cambia da Profilo → I tuoi locali; la sidebar lo mostra sotto il nome utente.
const BYUP_LOCALE_KEY = 'byup_locale_attivo';
window.byupReadLocale = function() {
  try {
    const s = localStorage.getItem(BYUP_LOCALE_KEY);
    if (s) { const v = JSON.parse(s); if (v && v.id && v.nome) return v; }
  } catch(e) {}
  return { id: 'cp', nome: 'Cacio e Pepe' };
};
window.byupWriteLocale = function(l) {
  try {
    localStorage.setItem(BYUP_LOCALE_KEY, JSON.stringify(l));
    window.dispatchEvent(new Event('byup-locale-change'));
  } catch(e) {}
};

// Fatture elettroniche emesse — condivise via localStorage tra Vendita
// diretta (che le crea, all'incasso) e Contabilità (che le elenca). Vivono
// qui e non nei file di Sala perché Contabilità non carica quei file: questo
// è l'unico script incluso da entrambe le pagine.
const BYUP_FATTURE_KEY = 'byup_fatture_emesse';
window.byupReadFatture = function() {
  try {
    const s = localStorage.getItem(BYUP_FATTURE_KEY);
    return s ? JSON.parse(s) : [];
  } catch(e) { return []; }
};
function byupWriteFattureRaw(list) {
  try {
    localStorage.setItem(BYUP_FATTURE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('byup-fatture-change'));
  } catch(e) {}
}
// Registra la fattura appena inviata e simula la risposta dello SdI: la
// consegna reale arriva via webhook nei giorni successivi (fino a 5), qui
// arriva in pochi secondi perché la finestra Fatture non resti bloccata su
// "In attesa" per tutta la demo. 9 su 10 va a buon fine — lo scarto è raro
// ma va mostrato, è la ragione per cui questa lista esiste.
// Upsert e non solo insert: una fattura scartata e ritrasmessa NON è un
// documento nuovo — la circolare 13/E/2018 vuole stesso numero e stessa data
// entro 5 giorni dallo scarto. Quindi la riga è la stessa e riparte da capo.
window.byupSaveFattura = function(f) {
  const list = window.byupReadFatture();
  const i = list.findIndex(x => x.id === f.id);
  if (i >= 0) list[i] = f; else list.unshift(f);
  byupWriteFattureRaw(list);
  const esito = Math.random() < 0.9 ? 'consegnata' : 'scartata';
  setTimeout(() => {
    const cur = window.byupReadFatture();
    const k = cur.findIndex(x => x.id === f.id);
    if (k === -1) return;
    // Sullo scarto si segna QUANDO: i 5 giorni per ritrasmettere decorrono da
    // lì, non dalla data del documento, e senza questo il conto alla rovescia
    // sarebbe inventato.
    cur[k] = { ...cur[k], stato: esito, scartataIl: esito === 'scartata' ? new Date().toISOString() : undefined };
    byupWriteFattureRaw(cur);
  }, 4000 + Math.random() * 5000);
};

// Nota di credito. NON è una modifica della fattura: quella, una volta partita,
// non si tocca più — l'API di OpenAPI su /IT-invoices/{id} espone solo GET,
// mentre sugli scontrini ha PATCH e DELETE. È un documento NUOVO (TD04) che
// storna l'originale, con una sua numerazione e un suo giro allo SdI, e per
// questo passa dallo stesso byupSaveFattura di tutti gli altri.
window.byupCreaNotaCredito = function(f) {
  // Il progressivo conta anche i mock di Contabilità: sono documenti come gli
  // altri nella lista, e ripartire da 1 ignorandoli darebbe due NC 1/26.
  const tutte = [...(window.BYUP_FATTURE_MOCK || []), ...window.byupReadFatture()];
  const n = tutte.filter(x => x.tipo === 'nota_credito').length + 1;
  window.byupSaveFattura({
    ...f,
    id: `nc-${n}-${f.id}`,
    numero: `NC ${n}/${String(new Date().getFullYear()).slice(2)}`,
    data: new Date().toISOString(),
    stato: 'in_attesa',
    tipo: 'nota_credito',
    storna: { id: f.id, numero: f.numero },
  });
};

// `badges`: mappa opzionale id-voce → numero, per le sezioni che hanno
// qualcosa di non gestito da segnalare (es. {contabilita: 1}). Assente o 0
// = nessun pallino, così le pagine che non la passano non cambiano.
function PnSidebar({ active = 'panoramica', onNav, badges }) {
  const [profHover, setProfHover] = React.useState(false);
  const [profPress, setProfPress] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return localStorage.getItem('pn_sidebar_collapsed') === '1'; } catch(e) { return false; }
  });

  const toggle = () => setCollapsed(c => {
    const next = !c;
    try { localStorage.setItem('pn_sidebar_collapsed', next ? '1' : '0'); } catch(e) {}
    return next;
  });

  // Moduli abilitati — reattivi a cambi di localStorage (stessa pagina + cross-tab)
  const [modules, setModulesState] = React.useState(() => window.byupReadModules());
  React.useEffect(() => {
    const update = () => setModulesState(window.byupReadModules());
    window.addEventListener('byup-modules-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-modules-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  // Locale attivo — mostrato sotto il nome utente, reattivo al cambio da Profilo
  const [localeAttivo, setLocaleAttivo] = React.useState(() => window.byupReadLocale());

  React.useEffect(() => {
    const update = () => setLocaleAttivo(window.byupReadLocale());
    window.addEventListener('byup-locale-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-locale-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const items = [
    { id: 'panoramica',   label: 'Panoramica',        icon: 'grid' },
    modules.sala         && { id: 'sala',         label: 'Sala',              icon: 'place-table' },
    { id: 'vendita',      label: 'Vendita diretta',   icon: 'commerce-register' },
    modules.prenotazioni && { id: 'prenotazioni', label: 'Prenotazioni',      icon: 'time-calendar' },
    { id: 'cucina',       label: 'Cucina',             icon: 'food-flame' },
    { id: 'statistiche',  label: 'Statistiche',        icon: 'chart-bar' },
    { id: 'contabilita',  label: 'Contabilità',        icon: 'commerce-piggy-bank' },
  ].filter(Boolean);

  const sys = [
    { id: 'supporto',     label: 'Supporto',    icon: 'headphones' },
    { id: 'impostazioni', label: 'Impostazioni', icon: 'gear' },
  ];

  const navTo = (id) => {
    if (onNav) return onNav(id);
    const url = PN_PAGES[id];
    if (url) window.location.href = url;
  };

  return (
    <aside style={{
      width: collapsed ? 68 : 272,
      flexShrink: 0,
      ...PN.GLASS_VIBRANT,
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '20px 10px' : '20px 14px',
      height: '100%',
      position: 'relative',
      transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), padding 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      // overflow visibile + zIndex: il menu notifiche (in basso) deve potersi
      // distendere sopra il contenuto principale senza essere clippato.
      overflow: 'visible',
      zIndex: 60,
    }}>
      <GlassMeshSubstrate/>

      {/* Logo row — doppio click: demo stati connessione (online → instabile → offline) */}
      <div
        onDoubleClick={() => window.dispatchEvent(new Event('byup-conn-demo'))}
        style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        paddingBottom: 24, flexShrink: 0, position: 'relative',
      }}>
        {!collapsed && (
          <div style={{paddingLeft: 6}}>
            <PnI.Logo />
          </div>
        )}
        {collapsed && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            {/* Il segno del logo, non una "B": da chiusa la sidebar mostra
                lo stesso disegno del logo esteso, solo senza lettering. */}
            <PnI.LogoMark size={32}/>
            <button onClick={toggle} title="Espandi menu" style={{
              width: 26, height: 26, borderRadius: 7,
              border: `1px solid ${PN.BORDER_LIGHT}`,
              background: PN.WHITE_HUSH,
              color: PN.MUTED, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
        {!collapsed && (
          <button onClick={toggle} title="Comprimi menu" style={{
            width: 26, height: 26, borderRadius: 7,
            border: `1px solid ${PN.BORDER_LIGHT}`,
            background: PN.WHITE_HUSH,
            color: PN.MUTED, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
        minHeight: 0, overflowY: 'auto',
      }}>
        {items.map(it => (
          <PnNavItem key={it.id} {...it}
            badge={badges && badges[it.id] ? badges[it.id] : undefined}
            collapsed={collapsed} active={active === it.id} onClick={() => navTo(it.id)} />
        ))}
      </div>

      {/* Stato connessione — event-driven, sopra la plan card: quando compare
          ruba spazio solo alla nav scrollabile, tutto ciò che sta sotto
          (piano, Supporto, Impostazioni, Notifiche, profilo) resta immobile. */}
      {window.PnConnectionStatus && <window.PnConnectionStatus variant="mini" collapsed={collapsed}/>}

      {/* Piano: card completa a menu esteso; a menu contratto resta il 77%
          leggibile su chip coral, e il click riespande il menu */}
      {collapsed ? <PnSidebarPlanCardMini onExpand={toggle}/> : <PnSidebarPlanCard/>}

      {/* System actions */}
      <div style={{
        display: 'flex', gap: collapsed ? 0 : 2,
        flexDirection: 'column',
        paddingTop: 10, marginBottom: 10,
      }}>
        {sys.map(it => (
          <PnSysItem key={it.id} {...it} collapsed={collapsed} active={active === it.id} onClick={() => navTo(it.id)} />
        ))}
      </div>

      {/* Notifiche — voce di sistema con badge (l'header è stato eliminato). */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        marginBottom: 10,
        position: 'relative',
      }}>
        {window.PnNotifBell && <window.PnNotifBell sidebar collapsed={collapsed}/>}
      </div>

      {/* Profilo — card a tutta larghezza, come in Spot: a riposo e una scheda
          bianca posata sul fondo, in hover si solleva di due pixel e prende il
          bordo coral con l'ombra della stessa tinta. La freccia e un chip che si
          riempie e scivola: e il segnale che la card porta da qualche parte.
          Hover in stato React e non in CSS perche il chip deve reagire al passaggio
          sul PADRE, e le pagine del gestionale non condividono un foglio di stile
          dove mettere una regola discendente. */}
      <div style={{borderTop: `1px solid ${PN.BORDER}`, paddingTop: 12, marginTop: 4}}>
        <div title="Profilo" onClick={() => navTo('profilo')}
          onMouseEnter={() => setProfHover(true)}
          onMouseLeave={() => setProfHover(false)}
          onMouseDown={() => setProfPress(true)}
          onMouseUp={() => setProfPress(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px 0' : '9px 10px',
            cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left', width: '100%', boxSizing: 'border-box',
            borderRadius: 12,
            background: '#fff',
            // #FFB3B5 e la stessa tinta di bordo che usa Spot: PINK_SOFT (#FFE0DD)
            // e troppo chiara e il contorno non si accende, che e proprio l'effetto
            // per cui quel bottone piace.
            border: `1px solid ${profHover ? '#FFB3B5' : 'rgba(15, 17, 21, 0.07)'}`,
            boxShadow: profHover
              ? '0 12px 28px -12px rgba(255,90,95,0.28), 0 2px 6px -2px rgba(15,17,21,0.05)'
              : '0 1px 2px rgba(15,17,21,0.04)',
            transform: profPress ? 'translateY(0) scale(0.99)' : profHover ? 'translateY(-2px)' : 'none',
            transition: 'box-shadow 180ms ease, transform 180ms cubic-bezier(0.34,1.2,0.64,1), border-color 180ms ease',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF5A5F, #B53338)',
            color: '#fff', display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: 15, flexShrink: 0,
          }}>MR</div>
          {!collapsed && (
            <React.Fragment>
              <div style={{minWidth: 0, flex: 1}}>
                <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Mario Rossi</div>
                <div style={{fontSize: 13, color: PN.MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{localeAttivo.nome}</div>
              </div>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'inline-grid', placeItems: 'center',
                background: profHover ? PN.PINK : '#F1F2F4',
                color: profHover ? '#fff' : '#8A8A90',
                transform: profHover ? 'translateX(2px)' : 'none',
                transition: 'background 160ms ease, color 160ms ease, transform 160ms ease',
              }}><Icon name="chevron-right" size={13}/></span>
            </React.Fragment>
          )}
        </div>
      </div>
    </aside>
  );
}

function PnNavItem({ label, icon, badge, active, onClick, collapsed }) {
  // Attivo = tinta brand piatta. Niente gloss verticale, bevel o shimmer:
  // il 2.5D sui bottoni è fuori dal design system.
  const activeStyle = active ? {
    background: PN.SIDE_ACTIVE_BG,
  } : {};

  return (
    <button onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px' : '9px 10px',
        borderRadius: 10,
        border: 'none',
        // Base esplicita: senza, i <button> mostrano il grigio UA al load
        background: 'transparent',
        color: active ? PN.PINK_DARK : PN.TEXT,
        fontWeight: active ? 600 : 500,
        fontSize: 19.5,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        width: '100%',
        position: 'relative',
        transition: 'background 160ms ease, transform 160ms ease',
        ...activeStyle,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)';
        else e.currentTarget.style.transform = 'translateX(1px)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'transparent';
        else e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span style={{display: 'inline-flex', color: active ? PN.PINK : PN.MUTED, position: 'relative', zIndex: 3}}>
        {/* Icone più grandi a menu esteso; 22px quando è contratto */}
        <Icon name={icon} size={collapsed ? 22 : 26}/>
      </span>
      {!collapsed && <span style={{flex: 1, position: 'relative', zIndex: 3}}>{label}</span>}
      {!collapsed && badge != null && (
        <span className={active ? 'glass-pulse-glow' : ''} style={{
          fontSize: 12.5, fontWeight: 700,
          color: PN.WHITE, background: PN.PINK,
          padding: '2px 7px', borderRadius: 999,
          minWidth: 18, textAlign: 'center',
          position: 'relative', zIndex: 3,
        }}>{badge}</span>
      )}
      {collapsed && badge != null && (
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7, borderRadius: '50%',
          background: PN.PINK,
          boxShadow: '0 0 0 1.5px white',
        }}/>
      )}
    </button>
  );
}

function PnSysItem({ label, icon, active, onClick, collapsed }) {
  // Flat come i nav item principali.
  const activeStyle = active ? {
    background: PN.SIDE_ACTIVE_BG,
  } : {};

  return (
    <button onClick={onClick} title={label}
      style={{
        flex: 'unset',
        width: '100%',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '8px' : '9px 10px',
        borderRadius: 10,
        border: 'none',
        background: 'transparent',
        color: active ? PN.PINK_DARK : PN.MUTED,
        fontWeight: active ? 600 : 500,
        fontSize: 17.5,
        cursor: 'pointer',
        fontFamily: 'inherit',
        position: 'relative',
        transition: 'background 160ms ease, color 160ms ease',
        ...activeStyle,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)'; e.currentTarget.style.color = PN.TEXT; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; } }}
    >
      <Icon name={icon} size={collapsed ? 18 : 21}/>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

window.PnSidebar = PnSidebar;

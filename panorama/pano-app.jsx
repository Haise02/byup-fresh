// ═══════════════════════════════════════════════════════════════════════
// Panorama · app: due «gusci» (A Atlante e C Diorama; la B Notte è stata
// tolta il 24 ottobre), percorsi con link condivisibili (#atlante.campagne,
// #diorama.wallet…), tema chiaro/scuro con passaggio circolare (variante A),
// selettore delle varianti.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useEffect, useRef } = React;
  const { Icon, Btn, IconBtn, Popover, Ring, cx } = Pano;
  const act = Pano.act;

  const ROUTES = [
    { id: 'panorama', label: 'Panorama', icon: 'panorama' },
    { id: 'campagne', label: 'Campagne', icon: 'megaphone' },
    { id: 'notifiche', label: 'Notifiche', icon: 'push' },
    { id: 'pubblico', label: 'Pubblico', icon: 'users' },
    { id: 'risultati', label: 'Risultati', icon: 'chart' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];
  const ALL_ROUTES = ROUTES.map((r) => r.id).concat(['accesso']);
  const VARIANTS = [
    { id: 'atlante', k: 'A', label: 'Atlante', desc: 'Chiaro o scuro · il mondo in una grande card' },
    { id: 'diorama', k: 'C', label: 'Diorama', desc: 'Bento chiaro · isola pastello e Byuppino' },
  ];

  // ─── Percorsi: #variante.sezione ────────────────────────────────────────
  function readHash() {
    const h = (location.hash || '').replace('#', '');
    const [v, r, x] = h.split('.');
    const out = {};
    // #atlante.accesso.inizio: il percorso dalla home di byup, dal primo passo (accesso non ancora richiesto)
    if (r === 'accesso' && x === 'inizio') out.access = 'non-richiesto';
    if (VARIANTS.some((x) => x.id === v)) out.variant = v;
    else if (v === 'notte') out.variant = 'atlante'; // la B non c'è più: i vecchi link aprono la A
    if (ALL_ROUTES.includes(r)) out.route = r;
    else if (ALL_ROUTES.includes(v)) out.route = v;
    return out;
  }
  function useHashSync() {
    useEffect(() => {
      const apply = () => { const h = readHash(); if (h.variant || h.route) Pano.store.set(Object.assign({ overlay: null }, h)); };
      apply();
      window.addEventListener('hashchange', apply);
      return () => window.removeEventListener('hashchange', apply);
    }, []);
  }
  const setVariant = (v) => {
    Pano.store.set({ variant: v, overlay: null });
    try { history.replaceState(null, '', '#' + v + '.' + Pano.store.get().route); } catch (e) { /* niente */ }
    Pano.safeStorage.set('panorama.variant', v);
    window.scrollTo(0, 0);
  };

  // ─── Tema (solo variante A: chiaro e scuro) ─────────────────────────────
  function initialTheme() {
    const saved = Pano.safeStorage.get('panorama.theme', null);
    if (saved) return saved;
    const host = document.documentElement.getAttribute('data-theme');
    if (host === 'dark' || host === 'light') return host;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function ThemeToggle({ glass }) {
    const theme = Pano.useStore((s) => s.theme);
    const flip = (e) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      const apply = () => { Pano.store.set({ theme: next }); root.setAttribute('data-theme', next); Pano.safeStorage.set('panorama.theme', next); };
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || reduce) { apply(); return; }
      const r = e.currentTarget.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      // Durante il cambio si fermano transizioni CSS, gradient vivi e mondo 3D: la nuova
      // immagine resta ferma e il cerchio scorre liscio fino in fondo. Il cerchio parte
      // già chiuso (--vt-x/--vt-y nel CSS), così il primo fotogramma non lampeggia.
      root.style.setProperty('--vt-x', x + 'px');
      root.style.setProperty('--vt-y', y + 'px');
      root.classList.add('vt-theme');
      Pano.worldHold = true;
      const t = document.startViewTransition(() => { ReactDOM.flushSync(apply); });
      t.ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad + 2}px at ${x}px ${y}px)`] }, { duration: 680, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both', pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
      t.finished.finally(() => { root.classList.remove('vt-theme'); Pano.worldHold = false; });
    };
    return <IconBtn icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'} onClick={flip} className={glass ? 'glass-btn' : ''} />;
  }

  // ─── Pezzi della barra ──────────────────────────────────────────────────
  function WalletChip({ className }) {
    const w = Pano.useStore((s) => s.wallet);
    return (
      <button type="button" className={cx('p-wallet-chip', className)} onClick={() => act.go('wallet')} aria-label={`Wallet: ${Pano.eur(w.balance, true)}`}>
        <Ring v={Math.min(1, w.balance / (w.auto.amount + 20))} size={32} />
        <span className="lbl"><small>Wallet</small><b>{Pano.eur(w.balance, true)}</b></span>
      </button>
    );
  }
  function Bell({ className }) {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ position: 'relative' }}>
        <IconBtn icon="bell" label="Avvisi" dot className={className} onClick={() => setOpen(!open)} aria-expanded={open} />
        <Popover open={open} onClose={() => setOpen(false)} width={380}><Pano.AlertsList onPick={() => setOpen(false)} /></Popover>
      </div>
    );
  }
  function VenueMenu({ className, compact, up }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const btn = useRef(null);
    const D = Pano.DATA;
    // «up»: il menù si apre verso l'alto, fuori dalla barra laterale (che scorre e lo taglierebbe)
    const toggle = () => {
      if (!open && up && btn.current) {
        const r = btn.current.getBoundingClientRect();
        setPos({ left: Math.max(12, Math.min(r.left - 8, window.innerWidth - 332)), bottom: window.innerHeight - r.top + 8 });
      }
      setOpen(!open);
    };
    const upStyle = up && pos ? { position: 'fixed', top: 'auto', right: 'auto', left: pos.left, bottom: pos.bottom, transformOrigin: 'bottom left' } : undefined;
    const menu = (
        <Popover open={open} onClose={() => setOpen(false)} width={320} style={upStyle}>
          <div className="menu-label"><span className="t-micro">I tuoi locali</span></div>
          {D.venues.map((v) => (
            <button key={v.id + v.sede} type="button" className="menu-item" disabled={!v.access} onClick={() => { setOpen(false); if (v.id !== 'cp') Pano.toast(`Passi a ${v.name} · ${v.sede}: stesso account, altri dati`); }}>
              <span className="av av-ring" style={{ width: 30, height: 30, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{v.ini}</span>
              <span className="col" style={{ gap: 1, minWidth: 0 }}><b style={{ color: 'var(--ink)' }}>{v.name} · {v.sede}</b><span className="sub">{v.access ? v.role : 'Sei cameriere: Panorama è per titolari e manager'}</span></span>
              {v.id === 'cp' && <Icon n="check" style={{ marginLeft: 'auto', color: 'var(--ink)' }} />}
            </button>
          ))}
          <div className="menu-sep" />
          <button type="button" className="menu-item" onClick={() => { setOpen(false); act.go('accesso'); }}><Icon n="lock" />Stati dell'accesso <span className="sub" style={{ marginLeft: 'auto' }}>prototipo</span></button>
          <button type="button" className="menu-item" onClick={() => { setOpen(false); act.open('onboarding'); }}><Icon n="shield" />Regole dei contenuti</button>
          <button type="button" className="menu-item" onClick={() => { setOpen(false); Pano.toast('Fresh si apre nella sua scheda, con lo stesso account'); }}><Icon n="external" />Torna a Fresh</button>
          <button type="button" className="menu-item" onClick={() => { setOpen(false); Pano.toast('Uscita simulata'); }}><Icon n="logout" />Esci</button>
        </Popover>
    );
    return (
      <div style={{ position: 'relative' }}>
        <button ref={btn} type="button" className={cx('p-venue-chip', className)} onClick={toggle} aria-expanded={open} aria-label="Locale e profilo">
          <span className="av">CP</span>
          {!compact && <span className="lbl"><b>Cacio e Pepe</b><small>Trastevere · Mario Rossi</small></span>}
          {!compact && <Icon n="chevD" size={16} style={{ color: 'var(--muted)' }} />}
        </button>
        {up ? ReactDOM.createPortal(menu, document.body) : menu}
      </div>
    );
  }
  function Brand({ dark, onClick }) {
    return (
      <a className="p-brand" href="#" onClick={(e) => { e.preventDefault(); act.go('panorama'); }} aria-label="Panorama · home">
        {dark ? <img src={Pano.IMG.logoIride} alt="Panorama" /> : <>
          <img className="logo-light" src={Pano.IMG.logoInk} alt="Panorama" />
          <img className="logo-dark" src={Pano.IMG.logoIride} alt="" aria-hidden="true" />
        </>}
      </a>
    );
  }
  function Nav({ route, className }) {
    const camps = Pano.useStore((s) => s.campaigns);
    const fix = camps.filter((c) => c.status === 'correggere').length;
    return (
      <nav className={cx('p-nav', className)} aria-label="Sezioni">
        {ROUTES.map((r) => (
          <button key={r.id} type="button" className={cx('p-nav-item', route === r.id && 'is-active')} aria-current={route === r.id ? 'page' : undefined} onClick={() => act.go(r.id)}>
            <Icon n={r.icon} />{r.label}{r.id === 'campagne' && fix > 0 && <span className="count" aria-label={`${fix} da correggere`}>{fix}</span>}
          </button>
        ))}
      </nav>
    );
  }
  function MobileTabs({ route }) {
    const [more, setMore] = useState(false);
    const items = [ROUTES[0], ROUTES[1], null, ROUTES[4]];
    return (
      <nav className="p-tabbar" aria-label="Sezioni">
        {items.map((r, i) => r ? (
          <button key={r.id} type="button" className={cx('p-tab', route === r.id && 'on')} onClick={() => act.go(r.id)} aria-current={route === r.id ? 'page' : undefined}><Icon n={r.icon} />{r.label}</button>
        ) : (
          <button key="plus" type="button" className="p-tab-plus" onClick={() => act.open('promuovi')} aria-label="Promuovi in un tap"><Icon n="sparkle" /></button>
        ))}
        <div style={{ position: 'relative' }}>
          <button type="button" className={cx('p-tab', ['notifiche', 'pubblico', 'wallet', 'accesso'].includes(route) && 'on')} onClick={() => setMore(!more)} aria-expanded={more}><Icon n="grid" />Altro</button>
          <Popover open={more} onClose={() => setMore(false)} width={240} style={{ top: 'auto', bottom: 'calc(100% + 12px)' }}>
            {[ROUTES[2], ROUTES[3], ROUTES[5], { id: 'accesso', label: 'Stati dell’accesso', icon: 'lock' }].map((r) => (
              <button key={r.id} type="button" className="menu-item" onClick={() => { setMore(false); act.go(r.id); }}><Icon n={r.icon} />{r.label}</button>
            ))}
          </Popover>
        </div>
      </nav>
    );
  }
  function useScrolled(el) {
    const [s, setS] = useState(false);
    useEffect(() => {
      const target = el ? el.current : window;
      if (!target) return;
      const f = () => setS((el ? target.scrollTop : window.scrollY) > 8);
      target.addEventListener('scroll', f, { passive: true });
      return () => target.removeEventListener('scroll', f);
    }, []);
    return s;
  }

  function Page({ route, variant }) {
    if (route === 'panorama') return variant === 'diorama' ? <Pano.HomeDiorama /> : <Pano.HomeAtlante />;
    const P = { campagne: Pano.Campagne, notifiche: Pano.Notifiche, pubblico: Pano.Pubblico, risultati: Pano.Risultati, wallet: Pano.Wallet, accesso: Pano.Accesso }[route] || Pano.Campagne;
    return <P key={route} />;
  }

  // ─── A · Atlante ────────────────────────────────────────────────────────
  function ShellAtlante({ route }) {
    const scrolled = useScrolled();
    return (
      <div className="p-app v-atlante">
        <header className={cx('p-top', scrolled && 'is-scrolled')}>
          <Brand />
          <Nav route={route} />
          <div className="p-top-right">
            <span className="hide-sm"><WalletChip /></span>
            <Btn kind="iride" icon="sparkle" className="hide-sm" onClick={() => act.open('promuovi')}><span className="lbl-long">Promuovi</span></Btn>
            <Bell />
            <ThemeToggle />
            <VenueMenu />
          </div>
        </header>
        <main className="p-main" id="contenuto"><Page route={route} variant="atlante" /></main>
        <MobileTabs route={route} />
      </div>
    );
  }

  // ─── C · Diorama ────────────────────────────────────────────────────────
  function ShellDiorama({ route }) {
    const w = Pano.useStore((s) => s.wallet);
    const camps = Pano.useStore((s) => s.campaigns);
    const fix = camps.filter((c) => c.status === 'correggere').length;
    return (
      <div className="p-app v-diorama">
        <aside className="dio-side" aria-label="Navigazione">
          <Brand />
          <div className="dio-venue">
            <img src={Pano.IMG.venueTrattoria} alt="" />
            <div className="col" style={{ gap: 1, minWidth: 0 }}><b>Cacio e Pepe</b><span className="t-small">Trastevere · titolare</span></div>
          </div>
          <nav className="dio-nav">
            {ROUTES.map((r) => (
              <button key={r.id} type="button" className={cx('dio-item', route === r.id && 'on')} onClick={() => act.go(r.id)} aria-current={route === r.id ? 'page' : undefined}>
                <span className="di-ico"><Icon n={r.icon} /></span>{r.label}
                {r.id === 'campagne' && fix > 0 && <span className="count">{fix}</span>}
              </button>
            ))}
          </nav>
          <Btn kind="iride" icon="sparkle" block onClick={() => act.open('promuovi')}>Promuovi in un tap</Btn>
          <div className="spacer" />
          <button type="button" className="dio-wallet" onClick={() => act.go('wallet')}>
            <span className="row between"><span className="t-micro" style={{ color: '#3A3355' }}>Wallet</span><img src={Pano.IMG.markInk} alt="" style={{ width: 14 }} /></span>
            <b>{Pano.eur(w.balance, true)}</b>
            <span className="t-small" style={{ color: '#4A4560' }}>ricarica automatica {w.auto.on ? 'attiva' : 'spenta'}</span>
          </button>
          <div className="row" style={{ gap: 10, padding: '4px 6px' }}>
            <Pano.Avatar name="Mario Rossi" size={34} />
            <div className="col" style={{ gap: 0, minWidth: 0, flex: 1 }}><b style={{ fontSize: 13 }}>Mario Rossi</b><span className="t-small">stesso account di Fresh</span></div>
            <VenueMenu compact up />
          </div>
        </aside>
        <div className="dio-main">
          <header className="dio-top">
            <div className="input-wrap dio-search"><Icon n="search" /><input className="input" placeholder="Cerca campagne, eventi, piatti…" aria-label="Cerca" /></div>
            <div className="row" style={{ gap: 10, marginLeft: 'auto' }}>
              <span className="only-mobile"><Brand /></span>
              <Bell />
              <Btn kind="primary" icon="plus" className="hide-sm" onClick={() => act.open('wizard')}>Nuova campagna</Btn>
            </div>
          </header>
          <main className="p-main dio-content" id="contenuto"><Page route={route} variant="diorama" /></main>
        </div>
        <MobileTabs route={route} />
      </div>
    );
  }

  // ─── Selettore delle varianti (strumento del prototipo) ─────────────────
  function VariantSwitch() {
    const v = Pano.useStore((s) => s.variant);
    const [open, setOpen] = useState(() => !Pano.safeStorage.get('panorama.switchSeen', false));
    useEffect(() => { const t = setTimeout(() => { setOpen(false); Pano.safeStorage.set('panorama.switchSeen', true); }, 6000); return () => clearTimeout(t); }, []);
    return (
      <div className={cx('vswitch', open && 'open')} role="group" aria-label="Varianti di design">
        <button type="button" className="vs-toggle" onClick={() => setOpen(!open)} aria-expanded={open}><Icon n="layers" size={16} /><span>Variante</span><b>{VARIANTS.find((x) => x.id === v).k}</b></button>
        {open && (
          <div className="vs-list">
            {VARIANTS.map((x) => (
              <button key={x.id} type="button" className={cx('vs-item', v === x.id && 'on')} onClick={() => setVariant(x.id)} aria-pressed={v === x.id}>
                <span className="vs-k">{x.k}</span>
                <span className="col" style={{ gap: 1, textAlign: 'left' }}><b>{x.label}{x.id === 'atlante' ? ' · la mia scelta' : ''}</b><small>{x.desc}</small></span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function App() {
    useHashSync();
    const variant = Pano.useStore((s) => s.variant);
    const route = Pano.useStore((s) => s.route);
    const theme = Pano.useStore((s) => s.theme);
    useEffect(() => {
      const t = variant === 'diorama' ? 'light' : theme;
      document.documentElement.setAttribute('data-theme', t);
      document.body.className = 'body-' + variant;
    }, [variant, theme]);
    useEffect(() => { document.title = `${(ROUTES.find((r) => r.id === route) || { label: 'Accesso' }).label} · Panorama`; }, [route]);
    const Shell = variant === 'diorama' ? ShellDiorama : ShellAtlante;
    return (
      <>
        <a className="sr-only" href="#contenuto">Vai al contenuto</a>
        <Shell route={route} />
        <Pano.Overlays />
        <Pano.Toasts />
        <VariantSwitch />
      </>
    );
  }

  // Avvio: variante e tema ricordati, poi il link (hash) vince
  const savedVariant = Pano.safeStorage.get('panorama.variant', 'atlante');
  Pano.store.set({ theme: initialTheme(), variant: VARIANTS.some((x) => x.id === savedVariant) ? savedVariant : 'atlante' });
  const h = readHash();
  if (h.variant || h.route) Pano.store.set(h);
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();

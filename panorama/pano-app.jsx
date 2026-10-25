// ═══════════════════════════════════════════════════════════════════════
// Panorama · app: il guscio della A (Atlante), percorsi con link condivisibili
// (#atlante.campagne, #atlante.push…), tema chiaro/scuro con passaggio circolare.
// Le altre varianti non ci sono più: la B tolta il 24 ottobre, la C il 25 (Nilo);
// i loro vecchi link aprono la A.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useEffect, useRef } = React;
  const { Icon, Btn, IconBtn, Popover, Ring, cx } = Pano;
  const act = Pano.act;

  // Le notifiche sono due schermate (Nilo, 25 ottobre): la push sul telefono, all'asta,
  // e la notifica dentro l'app, nella Posta, a prezzo fisso.
  const ROUTES = [
    { id: 'panorama', label: 'Panorama', icon: 'panorama' },
    { id: 'campagne', label: 'Campagne', icon: 'megaphone' },
    { id: 'push', label: 'Push', title: 'Notifiche push', icon: 'push' },
    { id: 'inapp', label: 'In app', title: 'Notifiche in app', icon: 'inbox' },
    { id: 'pubblico', label: 'Pubblico', icon: 'users' },
    { id: 'risultati', label: 'Risultati', icon: 'chart' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];
  const R = (id) => ROUTES.find((r) => r.id === id);
  // nella barra della A il wallet ha già il suo anello a destra: niente secondo «Wallet»
  const NAV_A = ROUTES.filter((r) => r.id !== 'wallet');
  const ALL_ROUTES = ROUTES.map((r) => r.id);

  // ─── Percorsi: #variante.sezione ────────────────────────────────────────
  function readHash() {
    const h = (location.hash || '').replace('#', '');
    const [v, r] = h.split('.');
    const out = {};
    if (v === 'atlante' || v === 'diorama' || v === 'notte') out.variant = 'atlante'; // c'è solo la A
    if (r === 'notifiche' || v === 'notifiche') out.route = 'push'; // i vecchi link di «Notifiche»
    // L'accesso si chiede da Fresh (Nilo, 25 ottobre): i vecchi link della pagina degli stati aprono la home
    if (r === 'accesso' || v === 'accesso') out.route = 'panorama';
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
        {NAV_A.map((r) => (
          <button key={r.id} type="button" className={cx('p-nav-item', route === r.id && 'is-active')} aria-current={route === r.id ? 'page' : undefined} onClick={() => act.go(r.id)}>
            <Icon n={r.icon} />{r.label}{r.id === 'campagne' && fix > 0 && <span className="count" aria-label={`${fix} da correggere`}>{fix}</span>}
          </button>
        ))}
      </nav>
    );
  }
  function MobileTabs({ route }) {
    const [openMore, setOpenMore] = useState(false);
    const items = [R('panorama'), R('campagne'), null, R('risultati')];
    const more = ['push', 'inapp', 'pubblico', 'wallet'];
    return (
      <nav className="p-tabbar" aria-label="Sezioni">
        {items.map((r, i) => r ? (
          <button key={r.id} type="button" className={cx('p-tab', route === r.id && 'on')} onClick={() => act.go(r.id)} aria-current={route === r.id ? 'page' : undefined}><Icon n={r.icon} />{r.label}</button>
        ) : (
          <button key="plus" type="button" className="p-tab-plus" onClick={() => act.open('promuovi')} aria-label="Promuovi in un tap"><Icon n="sparkle" /></button>
        ))}
        <div style={{ position: 'relative' }}>
          <button type="button" className={cx('p-tab', more.includes(route) && 'on')} onClick={() => setOpenMore(!openMore)} aria-expanded={openMore}><Icon n="grid" />Altro</button>
          <Popover open={openMore} onClose={() => setOpenMore(false)} width={240} style={{ top: 'auto', bottom: 'calc(100% + 12px)' }}>
            {more.map(R).map((r) => (
              <button key={r.id} type="button" className="menu-item" onClick={() => { setOpenMore(false); act.go(r.id); }}><Icon n={r.icon} />{r.title || r.label}</button>
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

  function Page({ route }) {
    if (route === 'panorama') return <Pano.HomeAtlante />;
    const P = { campagne: Pano.Campagne, push: Pano.NotifichePush, inapp: Pano.NotificheInApp, pubblico: Pano.Pubblico, risultati: Pano.Risultati, wallet: Pano.Wallet }[route] || Pano.Campagne;
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
        <main className="p-main" id="contenuto"><Page route={route} /></main>
        <MobileTabs route={route} />
      </div>
    );
  }

  function App() {
    useHashSync();
    const route = Pano.useStore((s) => s.route);
    const theme = Pano.useStore((s) => s.theme);
    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.className = 'body-atlante';
    }, [theme]);
    useEffect(() => { const r = R(route) || { label: 'Panorama' }; document.title = `${r.title || r.label} · Panorama`; }, [route]);
    return (
      <>
        <a className="sr-only" href="#contenuto">Vai al contenuto</a>
        <ShellAtlante route={route} />
        <Pano.Overlays />
        <Pano.Toasts />
      </>
    );
  }

  // Avvio: tema ricordato, poi il link (hash) vince
  Pano.store.set({ theme: initialTheme(), variant: 'atlante' });
  const h = readHash();
  if (h.variant || h.route) Pano.store.set(h);
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();

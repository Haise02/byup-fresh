// byup Staff — App shell, navigation, bottom nav

const { useState: useStateA, useMemo: useMemoA, useEffect: useEffectA } = React;

function StaffApp() {
  // Stack di navigazione
  const [stack, setStack] = useStateA([{ s: 'sala' }]);
  const [modal, setModal] = useStateA(null);
  const [cart, setCart] = useStateA([]);  // carrello globale

  const top = stack[stack.length - 1];

  const nav = useMemoA(() => ({
    push: s => setStack(p => [...p, s]),
    pop: () => setStack(p => p.length > 1 ? p.slice(0, -1) : p),
    replace: s => setStack(p => [...p.slice(0, -1), s]),
    reset: s => { setStack([s]); setCart([]); },
    setTab: tab => { setStack([{ s: tab }]); setCart([]); },
  }), []);

  const openModal = m => setModal(m);
  const closeModal = () => setModal(null);

  // ESC chiude modale
  useEffectA(() => {
    const h = e => { if (e.key === 'Escape' && modal) closeModal(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [modal]);

  // Determina se la bottom nav va mostrata (sulla schermata del conto no)
  const hideNav = ['pagamento-split'].includes(top.s);
  const activeTab = (() => {
    if (['sala', 'tavolo', 'menu', 'pagamento-split'].includes(top.s)) return 'sala';
    if (top.s === 'ordini') return 'ordini';
    if (['profilo', 'account', 'account-password'].includes(top.s)) return 'profilo';
    return 'sala';
  })();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: ST.BG, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {top.s === 'sala' && <ScreenSala nav={nav} openModal={openModal}/>}
        {top.s === 'profilo' && <ScreenProfilo nav={nav}/>}
        {top.s === 'account' && <ScreenGestioneAccount nav={nav}/>}
        {top.s === 'account-password' && <ScreenAccountPassword nav={nav}/>}
        {top.s === 'tavolo' && <ScreenTavolo nav={nav} openModal={openModal} tavoloId={top.id}/>}
        {top.s === 'menu' && <ScreenMenu nav={nav} openModal={openModal} tavoloId={top.tavoloId} cart={cart} setCart={setCart}/>}
        {top.s === 'ordini' && <ScreenDaPortare nav={nav} openModal={openModal}/>}
        {top.s === 'pagamento-split' && <ScreenPagamentoSplit nav={nav} openModal={openModal} tavoloId={top.id}/>}
      </div>

      {/* Bottom nav */}
      {!hideNav && <BottomNav active={activeTab} setTab={nav.setTab}/>}

      {/* Modali */}
      <StaffModals modal={modal} closeModal={closeModal} openModal={openModal} nav={nav}/>
    </div>
  );
}

function BottomNav({ active, setTab }) {
  // Badge "Da portare" = numero di tavoli con piatti pronti da consegnare.
  const daPortare = CODA_CUCINA.filter(o => o.stato === 'pronto').length;
  const items = [
    { id: 'sala', label: 'Sala', icon: I.Tables },
    { id: 'ordini', label: 'Da consegnare', icon: I.Walk, badge: daPortare || null },
    { id: 'profilo', label: 'Profilo', icon: I.Profile },
  ];
  return (
    // Vetro: la tab bar sta sopra contenuto che scorre, quindi ha qualcosa da
    // rifrangere. Stesso materiale delle barre del gestionale (PN.GLASS_BAR),
    // ruotato verso l'alto — il bordo e il light-catch vanno sul lato superiore.
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: ST.GLASS_BAR.background,
      backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0) 100%)',
      backdropFilter: ST.GLASS_BAR.backdropFilter,
      WebkitBackdropFilter: ST.GLASS_BAR.WebkitBackdropFilter,
      borderTop: `1px solid ${ST.BORDER_SOFT}`,
      boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.70)',
      padding: '8px 8px max(28px, calc(8px + env(safe-area-inset-bottom)))',
      display: 'flex',
    }}>
      {items.map(it => {
        const isA = active === it.id;
        const Ic = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            flex: 1, padding: '6px 4px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            position: 'relative',
          }}>
            <div style={{
              width: 44, height: 28, borderRadius: ST.R_PILL,
              background: isA ? ST.PINK_SOFT : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 200ms',
              position: 'relative',
            }}>
              <Ic s={20} c={isA ? ST.PINK_DARK : ST.MUTED}/>
              {it.badge && (
                <span style={{
                  position: 'absolute', top: 0, right: 4,
                  minWidth: 14, height: 14, padding: '0 4px', borderRadius: ST.R_PILL,
                  background: ST.PINK, color: '#fff',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #fff',
                }}>{it.badge}</span>
              )}
            </div>
            <span style={{
              fontSize: 10.5, fontWeight: isA ? 700 : 600,
              color: isA ? ST.PINK_DARK : ST.MUTED,
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Mount gestito da cameriereweb.html: <StaffApp/> riempie la finestra del browser
// e si adatta fino a mini iPad; oltre 1180px compare il messaggio di blocco.

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

  // Determina se la bottom nav va mostrata (sulle schermate di pagamento carta no)
  const hideNav = ['piatto', 'pagamento-carta', 'pagamento-qr', 'pagamento-metodo'].includes(top.s);
  const activeTab = (() => {
    if (['sala', 'tavolo', 'menu', 'pagamento-split', 'pagamento-metodo', 'pagamento-carta', 'pagamento-qr'].includes(top.s)) return 'sala';
    if (['ordini', 'ordini-passati'].includes(top.s)) return 'ordini';
    if (['catalogo'].includes(top.s)) return 'catalogo';
    if (top.s === 'profilo') return 'profilo';
    return 'sala';
  })();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: ST.BG, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {top.s === 'sala' && <ScreenSala nav={nav} openModal={openModal}/>}
        {top.s === 'profilo' && <ScreenProfilo nav={nav}/>}
        {top.s === 'tavolo' && <ScreenTavolo nav={nav} openModal={openModal} tavoloId={top.id}/>}
        {top.s === 'menu' && <ScreenMenu nav={nav} openModal={openModal} tavoloId={top.tavoloId} cart={cart} setCart={setCart}/>}
        {top.s === 'piatto' && <ScreenPiatto nav={nav} tavoloId={top.tavoloId} piattoId={top.piattoId} cart={cart} setCart={setCart}/>}
        {top.s === 'ordini' && <ScreenOrdini nav={nav} openModal={openModal}/>}
        {top.s === 'ordini-passati' && <ScreenOrdiniPassati nav={nav} openModal={openModal}/>}
        {top.s === 'catalogo' && <ScreenMenu nav={nav} openModal={openModal} tavoloId={null} cart={cart} setCart={setCart}/>}
        {top.s === 'pagamento-split' && <ScreenPagamentoSplit nav={nav} openModal={openModal} tavoloId={top.id}/>}
        {top.s === 'pagamento-metodo' && <ScreenPagamentoMetodo nav={nav} importo={top.importo} tavoloId={top.tavoloId}/>}
        {top.s === 'pagamento-carta' && <ScreenPagamentoCarta nav={nav} openModal={openModal} importo={top.importo} tavoloId={top.tavoloId}/>}
        {top.s === 'pagamento-qr' && <ScreenPagamentoQR nav={nav} importo={top.importo} tavoloId={top.tavoloId}/>}
      </div>

      {/* Bottom nav */}
      {!hideNav && <BottomNav active={activeTab} setTab={nav.setTab}/>}

      {/* Modali */}
      <StaffModals modal={modal} closeModal={closeModal} openModal={openModal} nav={nav}/>
    </div>
  );
}

function BottomNav({ active, setTab }) {
  const items = [
    { id: 'sala', label: 'Sala', icon: I.Tables },
    { id: 'ordini', label: 'Ordini', icon: I.Kitchen, badge: 3 },
    { id: 'catalogo', label: 'Menu', icon: I.Menu },
    { id: 'profilo', label: 'Profilo', icon: I.Profile },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${ST.BORDER_SOFT}`,
      padding: '8px 8px 28px',
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
                  background: ST.PINK_DARK, color: '#fff',
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

// Mount handled by byup Staff.html (renders <StaffApp/> inside <IOSDevice/>)

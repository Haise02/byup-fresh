// Cucina — App shell
// Focus mode (kitchen-only): nasconde sidebar + page header + tabs + KPI

function CucinaApp() {
  const [focus, setFocus] = React.useState(false);

  // Come questa cucina guarda gli ordini lo decide il Kitchen Monitor, non
  // questa pagina: la scelta si fa dove il monitor si collega (onboarding) e
  // dove lo si modifica (Impostazioni → Personale), e arriva fin qui via
  // localStorage. Cambiandola da un'altra tab lo schermo si adegua da solo —
  // un monitor appeso in cucina non lo si va a ricaricare a mano.
  const [vista, setVista] = React.useState(
    () => (window.byupReadVistaKds ? window.byupReadVistaKds() : 'ristorante'));
  React.useEffect(() => {
    const agg = () => setVista(window.byupReadVistaKds ? window.byupReadVistaKds() : 'ristorante');
    window.addEventListener('byup-kds-vista-change', agg);
    window.addEventListener('storage', agg);
    return () => {
      window.removeEventListener('byup-kds-vista-change', agg);
      window.removeEventListener('storage', agg);
    };
  }, []);
  const pub = vista === 'pub' && typeof Kds2Board === 'function';

  // Esc per uscire da focus
  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && focus) setFocus(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  // Deep-link dalla Panoramica: ?tavolo=N scorre al ticket di quel tavolo e
  // lo accende per un attimo.
  React.useEffect(() => {
    let flashTimer;
    try {
      const t = new URLSearchParams(window.location.search).get('tavolo');
      if (!t) return;
      const timer = setTimeout(() => {
        const el = document.querySelector(`[data-kds-table="${t}"]`);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        const prev = el.style.boxShadow;
        el.style.transition = 'box-shadow 300ms ease';
        el.style.borderRadius = '14px';
        el.style.boxShadow = '0 0 0 3px #FF5A5F, 0 14px 34px rgba(255, 90, 95, 0.35)';
        flashTimer = setTimeout(() => { el.style.boxShadow = prev; }, 1900);
      }, 400);
      return () => { clearTimeout(timer); clearTimeout(flashTimer); };
    } catch (e) {}
  }, []);

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      {!focus && <PnSidebar active="cucina"/>}

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        {/* Pub: al posto della board a colonne va quella del KDS v2, che si
            porta dietro la sua testata — orologio, filtri, schermo intero — e
            scorre da sé. Niente contenitore che scorre e niente margini
            intorno: è uno schermo appeso in cucina, non un documento. */}
        {pub ? (
          <div style={{flex: 1, minHeight: 0, display: 'flex'}}>
            {/* Gli stessi ordini della vista a colonne, riraggruppati per
                piatto: cambiando visualizzazione cambia il modo di guardare il
                servizio, non il servizio. */}
            <Kds2Board porzioni={window.kds2PorzioniDelServizio
              ? window.kds2PorzioniDelServizio() : undefined}/>
          </div>
        ) : (
          <div className="pn-scroll" style={{
            flex: 1, overflow: 'auto',
            padding: focus ? 0 : '22px 32px 32px',
            background: PN.BG,
          }}>
            <CucinaInSala focus={focus} onToggleFocus={() => setFocus(f => !f)}/>
          </div>
        )}
      </main>
    </div>
  );
}

const cucRoot = ReactDOM.createRoot(document.getElementById('root'));
cucRoot.render(
  <div className="frame" data-screen-label="Cucina">
    <GlassMeshSubstrate tone="cool"/>
    <CucinaApp/>
  </div>
);

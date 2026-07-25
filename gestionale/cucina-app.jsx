// Cucina — App shell
// Focus mode (kitchen-only): nasconde sidebar + page header + tabs + KPI

function CucinaApp() {
  const [focus, setFocus] = React.useState(false);

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
        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: focus ? 0 : '22px 32px 32px',
          background: PN.BG,
        }}>
          <CucinaInSala focus={focus} onToggleFocus={() => setFocus(f => !f)}/>
        </div>
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

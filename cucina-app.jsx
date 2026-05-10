// Cucina — App shell
// Focus mode (kitchen-only): nasconde sidebar + page header + tabs + KPI

function CucinaApp() {
  const [tab, setTab] = React.useState('ordini');
  const [focus, setFocus] = React.useState(false);
  const tabs = [
    { id: 'ordini', label: 'Ordini' },
    { id: 'storico', label: 'Storico ordini' },
  ];

  // Esc per uscire da focus
  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && focus) setFocus(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      {!focus && <PnSidebar active="cucina"/>}

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        {!focus && (
          <React.Fragment>
            <PnPageHeader
              title="Cucina"
              subtitle="Martedì 9 Dicembre 2025"
            />
            <PnUnderlineTabs tabs={tabs} active={tab} onChange={setTab}/>
          </React.Fragment>
        )}

        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: focus ? 0 : '22px 32px 32px',
          background: PN.BG,
        }}>
          {tab === 'ordini'  && <CucinaInSala focus={focus} onToggleFocus={() => setFocus(f => !f)}/>}
          {tab === 'storico' && <CucinaStorico/>}
        </div>
      </main>
    </div>
  );
}

const cucRoot = ReactDOM.createRoot(document.getElementById('root'));
cucRoot.render(
  <div className="frame" data-screen-label="Cucina">
    <CucinaApp/>
  </div>
);

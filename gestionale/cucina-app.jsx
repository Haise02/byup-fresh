// Cucina — App shell
// Focus mode (kitchen-only): nasconde sidebar + page header + tabs + KPI

// Interruttore della visualizzazione, in testata alla Cucina.
// La scelta resta quella del monitor — scrive la stessa preferenza che scrivono
// il collegamento e la modifica del dispositivo, non una seconda verità — ma da
// qui si cambia guardando l'effetto, che è l'unico posto in cui si vede.
// `kds`: la board del v2 ha una palette sua e bersagli più grandi, perché è uno
// schermo che si guarda da lontano e si tocca con i guanti.
function SwitchVista({ vista, onVista, kds }) {
  const VISTE = [
    { id: 'ristorante', label: 'Ristorante' },
    { id: 'pub',        label: 'Pub' },
  ];
  const alt = kds ? 40 : 34;
  return (
    <span title="Come questa cucina vede gli ordini" style={{
      display:'inline-flex', alignItems:'center', gap: 2, flexShrink: 0,
      padding: 3, borderRadius: 10,
      background: kds ? '#FFFFFF' : 'rgba(15, 17, 21, 0.04)',
      border: kds ? '1px solid #E5E7EB' : 'none',
    }}>
      {VISTE.map(v => {
        const on = vista === v.id;
        return (
          <button key={v.id} type="button" data-kds2-interattivo=""
            onClick={() => { if (!on) onVista(v.id); }}
            style={{
              height: alt - 6, padding: '0 12px', borderRadius: 8, border: 'none',
              background: on ? (kds ? '#FFF1EF' : PN.WHITE) : 'transparent',
              boxShadow: on && !kds ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
              color: on ? (kds ? '#B53338' : PN.TEXT) : (kds ? '#5C6372' : PN.MUTED),
              fontSize: kds ? 15 : 13.5, fontWeight: on ? 700 : 600,
              fontFamily: 'inherit', cursor: on ? 'default' : 'pointer',
              whiteSpace: 'nowrap', transition: 'background 140ms ease, color 140ms ease',
            }}>{v.label}</button>
        );
      })}
    </span>
  );
}

function CucinaApp() {
  const [focus, setFocus] = React.useState(false);

  // Come questa cucina guarda gli ordini lo decide il Kitchen Monitor, non
  // questa pagina: la scelta si fa dove il monitor si collega (onboarding) e
  // dove lo si modifica (Impostazioni → Personale), e arriva fin qui via
  // localStorage. Cambiandola da un'altra tab lo schermo si adegua da solo —
  // un monitor appeso in cucina non lo si va a ricaricare a mano.
  const [vista, setVista] = React.useState(
    () => (window.byupReadVistaKds ? window.byupReadVistaKds() : 'ristorante'));
  // Il nome del monitor: in un locale con due schermi — pizza e sala — chi ci
  // sta davanti deve sapere quale dei due sta guardando.
  const [nomeMonitor, setNomeMonitor] = React.useState(
    () => (window.byupReadNomeKds ? window.byupReadNomeKds() : ''));
  React.useEffect(() => {
    const agg = () => {
      setVista(window.byupReadVistaKds ? window.byupReadVistaKds() : 'ristorante');
      setNomeMonitor(window.byupReadNomeKds ? window.byupReadNomeKds() : '');
    };
    window.addEventListener('byup-kds-vista-change', agg);
    window.addEventListener('storage', agg);
    return () => {
      window.removeEventListener('byup-kds-vista-change', agg);
      window.removeEventListener('storage', agg);
    };
  }, []);
  const pub = vista === 'pub' && typeof Kds2Board === 'function';
  // Cambiando da qui si scrive la stessa preferenza del dispositivo: la Cucina
  // e il monitor appeso in cucina restano d'accordo su come si guarda.
  const cambiaVista = (v) => {
    if (window.byupWriteVistaKds) window.byupWriteVistaKds(v, nomeMonitor);
    else setVista(v);
  };

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
    <div style={{display:'flex', flex:1, minWidth:0, minHeight:0}}>
      {!focus && <PnSidebar active="cucina"/>}

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        {/* Pub: al posto della board a colonne va quella del KDS v2, che si
            porta dietro la sua testata — orologio, filtri, schermo intero — e
            scorre da sé. Niente contenitore che scorre e niente margini
            intorno: è uno schermo appeso in cucina, non un documento. */}
        {/* minWidth 0 sul contenitore: senza, un figlio flex non si stringe
            sotto il suo contenuto e la board sbordava a destra, portandosi via
            la coda della testata — nome del monitor e schermo intero. */}
        {pub ? (
          <div style={{flex: 1, minWidth: 0, minHeight: 0, display: 'flex'}}>
            {/* Gli stessi ordini della vista a colonne, riraggruppati per
                piatto: cambiando visualizzazione cambia il modo di guardare il
                servizio, non il servizio. */}
            <Kds2Board nomeMonitor={nomeMonitor}
              switchVista={<SwitchVista vista={vista} onVista={cambiaVista} kds/>}
              porzioni={window.kds2PorzioniDelServizio
                ? window.kds2PorzioniDelServizio() : undefined}/>
          </div>
        ) : (
          <div className="pn-scroll" style={{
            flex: 1, overflow: 'auto',
            padding: focus ? 0 : '22px 32px 32px',
            background: PN.BG,
          }}>
            <CucinaInSala focus={focus} nomeMonitor={nomeMonitor}
              switchVista={<SwitchVista vista={vista} onVista={cambiaVista}/>}
              onToggleFocus={() => setFocus(f => !f)}/>
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

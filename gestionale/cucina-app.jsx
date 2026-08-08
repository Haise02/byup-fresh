// Cucina — App shell
// Focus mode (kitchen-only): nasconde sidebar + page header + tabs + KPI

// Selettore del monitor, in testata alla Cucina.
// Qui si sceglie QUALE schermo si sta guardando, non come guarda: la
// visualizzazione è del monitor e si decide dove lo si collega (Impostazioni →
// Personale). Cambiando monitor la vista cambia da sé, perché è sua.
// `kds`: la board del v2 ha palette e bersagli suoi, si guarda da lontano e si
// tocca con i guanti.
const VISTA_ETICHETTA = { pub: 'Visualizzazione Pub', ristorante: 'Visualizzazione Ristorante' };

function SelettoreMonitor({ monitors, attivo, onScegli, kds }) {
  const [aperto, setAperto] = React.useState(false);
  const box = React.useRef(null);
  React.useEffect(() => {
    if (!aperto) return;
    const fuori = (e) => { if (box.current && !box.current.contains(e.target)) setAperto(false); };
    document.addEventListener('pointerdown', fuori);
    return () => document.removeEventListener('pointerdown', fuori);
  }, [aperto]);

  const solo = monitors.length < 2;
  const ink   = kds ? '#0F1115' : PN.TEXT;
  const ink2  = kds ? '#5C6372' : PN.MUTED;
  const bordo = kds ? '#E5E7EB' : PN.BORDER;

  const Icona = () => (
    <svg width={kds ? 16 : 14} height={kds ? 16 : 14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink: 0}}>
      <rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );

  // Con un monitor solo non c'è niente da scegliere: resta la targa, che dice
  // quale schermo è. Un menu con una voce sola è una domanda con una risposta.
  if (solo) {
    return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap: 7, flexShrink: 0,
        maxWidth: 260, color: ink2,
      }}>
        <Icona/>
        <span style={{
          fontSize: kds ? 17 : 14.5, fontWeight: 600, letterSpacing: '-0.01em',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{attivo.nome}</span>
      </span>
    );
  }

  return (
    <span ref={box} style={{position:'relative', flexShrink: 0}}>
      <button type="button" data-kds2-interattivo=""
        onClick={() => setAperto(a => !a)}
        title="Quale Kitchen Monitor stai guardando"
        style={{
          display:'inline-flex', alignItems:'center', gap: 8,
          height: kds ? 40 : 34, padding:'0 10px', borderRadius: 10,
          background: kds ? '#FFFFFF' : 'rgba(15, 17, 21, 0.04)',
          border: kds ? ('1px solid ' + bordo) : 'none',
          color: ink2, cursor:'pointer', fontFamily:'inherit', maxWidth: 300,
        }}>
        <Icona/>
        <span style={{
          fontSize: kds ? 16 : 14, fontWeight: 700, color: ink,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{attivo.nome}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          style={{flexShrink: 0, transform: aperto ? 'rotate(180deg)' : 'none', transition:'transform 140ms ease'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {aperto && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right: 0, zIndex: 90,
          minWidth: 260, padding: 4, borderRadius: 12,
          background: '#FFFFFF', border: '1px solid ' + bordo,
          boxShadow:'0 12px 30px rgba(15, 17, 21, 0.14)',
        }}>
          {monitors.map(m => {
            const on = m.id === attivo.id;
            return (
              <button key={m.id} type="button" data-kds2-interattivo=""
                onClick={() => { onScegli(m.id); setAperto(false); }}
                style={{
                  display:'flex', width:'100%', alignItems:'center', gap: 10,
                  padding:'9px 10px', borderRadius: 8, border:'none', textAlign:'left',
                  background: on ? '#FFF1EF' : 'transparent',
                  cursor:'pointer', fontFamily:'inherit',
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#F7F8FA'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{color: on ? '#B53338' : ink2, display:'inline-flex'}}><Icona/></span>
                <span style={{minWidth: 0}}>
                  <span style={{
                    display:'block', fontSize: 15, fontWeight: 700,
                    color: on ? '#B53338' : ink,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  }}>{m.nome}</span>
                  {/* La visualizzazione si legge, non si sceglie: è di quel
                      monitor, e si cambia da Impostazioni → Personale. */}
                  <span style={{display:'block', fontSize: 13, color: ink2}}>
                    {VISTA_ETICHETTA[m.vista] || m.vista}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}

function CucinaApp() {
  const [focus, setFocus] = React.useState(false);

  // Questa pagina sceglie QUALE monitor guardare. Come lo guarda non è affar
  // suo: la visualizzazione è del dispositivo e si decide dove lo si collega
  // (onboarding) o si modifica (Impostazioni → Personale). Cambiando monitor
  // cambia anche la vista, perché viene con lui.
  // Tutto arriva da localStorage e si aggiorna a schermo acceso: un monitor
  // appeso in cucina non lo si va a ricaricare a mano.
  const leggi = () => (window.byupReadMonitorsKds ? window.byupReadMonitorsKds() : []);
  const leggiAttivo = () => (window.byupReadMonitorAttivoKds
    ? window.byupReadMonitorAttivoKds() : { id: '', nome: '', vista: 'ristorante' });
  const [monitors, setMonitors] = React.useState(leggi);
  const [attivo, setAttivo] = React.useState(leggiAttivo);
  React.useEffect(() => {
    const agg = () => { setMonitors(leggi()); setAttivo(leggiAttivo()); };
    window.addEventListener('byup-kds-vista-change', agg);
    window.addEventListener('storage', agg);
    return () => {
      window.removeEventListener('byup-kds-vista-change', agg);
      window.removeEventListener('storage', agg);
    };
  }, []);
  const pub = attivo.vista === 'pub' && typeof Kds2Board === 'function';
  const scegliMonitor = (id) => {
    if (window.byupSetMonitorAttivoKds) window.byupSetMonitorAttivoKds(id);
  };
  const selettore = (kds) => (
    <SelettoreMonitor monitors={monitors} attivo={attivo} onScegli={scegliMonitor} kds={kds}/>
  );

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
            {/* «Schermo intero» toglie di mezzo il gestionale, sidebar
                compresa, come nella vista Ristorante: la board è già senza
                margini, quello che resta da togliere è la navigazione. */}
            <Kds2Board selettoreMonitor={selettore(true)}
              focus={focus} onToggleFocus={() => setFocus(f => !f)}
              porzioni={window.kds2PorzioniDelServizio
                ? window.kds2PorzioniDelServizio() : undefined}/>
          </div>
        ) : (
          <div className="pn-scroll" style={{
            flex: 1, overflow: 'auto',
            padding: focus ? 0 : '22px 32px 32px',
            background: PN.BG,
          }}>
            <CucinaInSala focus={focus} selettoreMonitor={selettore(false)}
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

// Statistiche — main app shell

const { useState } = React;

function StatisticheApp() {
  // Deep-link dalla Panoramica: ?tab=economici|operazioni|app e ?sub=…
  // Operazioni: prenotazioni|ordini|staff · App: conversione|clienti.
  // Senza parametri si atterra su Economici: è la domanda con cui un
  // ristoratore apre le statistiche — quanto ho incassato, quanto ho speso.
  const urlInit = (() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const sub = p.get('sub');
      let tab = ['economici', 'operazioni', 'app'].includes(p.get('tab')) ? p.get('tab') : 'economici';
      // I clienti stavano in Operazioni e sono passati sotto App: i vecchi
      // link `?tab=operazioni&sub=clienti` continuano ad arrivare a
      // destinazione invece di atterrare sulle prenotazioni.
      if (sub === 'clienti') tab = 'app';
      return {
        tab,
        sub: ['prenotazioni', 'ordini', 'staff'].includes(sub) ? sub : 'prenotazioni',
        appSub: sub === 'clienti' ? 'clienti' : 'conversione',
      };
    } catch (e) { return { tab: 'economici', sub: 'prenotazioni', appSub: 'conversione' }; }
  })();
  const [tab, setTab] = useState(urlInit.tab);
  const [opSub, setOpSub] = useState(urlInit.sub);
  const [appSub, setAppSub] = useState(urlInit.appSub);
  const [period, setPeriod] = useState('mese');

  // L'altezza della barra principale finisce in una variabile CSS: le sub-tab
  // ci si agganciano sotto senza che nessuno debba scriverla a mano (e senza
  // rompersi se un giorno cambia il corpo del testo).
  const barraRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = barraRef.current;
    if (!el) return;
    const applica = () => document.documentElement.style.setProperty('--stat-barra', el.offsetHeight + 'px');
    applica();
    const ro = new ResizeObserver(applica);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="statistiche"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'0 28px 32px', background:'#fafafa'}}>
          {/* Macro tabs — underline rosa su filo, period picker a destra.
              Restano incollate in alto mentre si scorre: le pagine di
              Statistiche sono lunghe, e senza questa barra a metà lettura non
              si sa più in che sezione si è né su che periodo.
              Il respiro in alto sta DENTRO la barra e non nel contenitore:
              con un margine negativo l'aggancio slittava di quei pixel e sopra
              filtrava il contenuto. I margini laterali negativi la fanno
              arrivare ai bordi della colonna, così niente le passa di lato. */}
          <div ref={barraRef} style={{
            position:'sticky', top: 0, zIndex: 20,
            background:'#fafafa',
            margin:'0 -28px 18px',
            padding:'18px 28px 0',
          }}>
            <StatTabs
              tabs={[
                { id: 'economici', label: 'Economici', icon: 'commerce-coins' },
                { id: 'operazioni', label: 'Operazioni', icon: 'chart-workflow' },
                { id: 'app', label: 'App', icon: 'chart-area' },
              ]}
              active={tab} onChange={setTab}
              action={<StatPeriodPicker period={period} setPeriod={setPeriod}/>}/>
          </div>

          {/* Operazioni sub-tabs — card a tutta riga */}
          {tab === 'operazioni' && (
            <>
              <div style={{
                position:'sticky', top:'var(--stat-barra, 63px)', zIndex: 19,
                background:'#fafafa',
                margin:'0 -28px 0',
                padding:'0 28px 18px',
                display:'flex', gap: 14,
              }}>
                <StatSubTab active={opSub==='prenotazioni'} onClick={() => setOpSub('prenotazioni')} label="Prenotazioni" icon="time-calendar"/>
                <StatSubTab active={opSub==='ordini'} onClick={() => setOpSub('ordini')} label="Ordini" icon="commerce-cart"/>
                <StatSubTab active={opSub==='staff'} onClick={() => setOpSub('staff')} label="Team" icon="people-staff-group"/>
              </div>
              {opSub === 'prenotazioni' && <StatPrenotazioni/>}
              {opSub === 'ordini' && <StatOrdini/>}
              {opSub === 'staff' && <StatStaff/>}
            </>
          )}
          {tab === 'economici' && <StatEconomici/>}

          {/* App sub-tabs — stessa barra appiccicata di Operazioni. I clienti
              stanno qui: chi torna, quanto vale e che voto lascia sono cose
              che nascono dall'app, non dal turno di sala. */}
          {tab === 'app' && (
            <>
              <div style={{
                position:'sticky', top:'var(--stat-barra, 63px)', zIndex: 19,
                background:'#fafafa',
                margin:'0 -28px 0',
                padding:'0 28px 18px',
                display:'flex', gap: 14,
              }}>
                <StatSubTab active={appSub==='conversione'} onClick={() => setAppSub('conversione')} label="Conversione" icon="chart-positive-dynamic"/>
                <StatSubTab active={appSub==='clienti'} onClick={() => setAppSub('clienti')} label="Clienti" icon="people-customer"/>
              </div>
              {appSub === 'conversione' && <StatApp/>}
              {appSub === 'clienti' && <StatClienti/>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<StatisticheApp/>);

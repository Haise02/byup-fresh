// Statistiche — main app shell

const { useState } = React;

function StatisticheApp() {
  // Deep-link dalla Panoramica: ?tab=operazioni|economici|app e, per
  // Operazioni, ?sub=prenotazioni|ordini|staff|clienti.
  const urlInit = (() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return {
        tab: ['operazioni', 'economici', 'app'].includes(p.get('tab')) ? p.get('tab') : 'operazioni',
        sub: ['prenotazioni', 'ordini', 'staff', 'clienti'].includes(p.get('sub')) ? p.get('sub') : 'prenotazioni',
      };
    } catch (e) { return { tab: 'operazioni', sub: 'prenotazioni' }; }
  })();
  const [tab, setTab] = useState(urlInit.tab);
  const [opSub, setOpSub] = useState(urlInit.sub);
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
                { id: 'operazioni', label: 'Operazioni', icon: 'chart-workflow' },
                { id: 'economici', label: 'Economici', icon: 'commerce-coins' },
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
                <StatSubTab active={opSub==='clienti'} onClick={() => setOpSub('clienti')} label="Clienti" icon="people-customer"/>
              </div>
              {opSub === 'prenotazioni' && <StatPrenotazioni/>}
              {opSub === 'ordini' && <StatOrdini/>}
              {opSub === 'staff' && <StatStaff/>}
              {opSub === 'clienti' && <StatClienti/>}
            </>
          )}
          {tab === 'economici' && <StatEconomici/>}
          {tab === 'app' && <StatApp/>}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<StatisticheApp/>);

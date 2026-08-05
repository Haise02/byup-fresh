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

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="statistiche"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'18px 28px 32px', background:'#fafafa'}}>
          {/* Macro tabs — underline rosa su filo, period picker a destra */}
          <div style={{marginBottom: 18}}>
            <StatTabs
              tabs={[
                { id: 'operazioni', label: 'Operazioni', icon: 'chart-workflow' },
                { id: 'economici', label: 'Economici', icon: 'commerce-coins' },
                { id: 'app', label: 'App', icon: 'chart-area' },
              ]}
              active={tab} onChange={setTab}
              action={<StatPeriodPicker period={period} setPeriod={setPeriod}/>}/>
          </div>

          {/* Operazioni sub-tabs — underline nera su filo */}
          {tab === 'operazioni' && (
            <>
              <div style={{display:'flex', gap: 22, borderBottom: `1px solid ${PN.BORDER}`, marginBottom: 18}}>
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

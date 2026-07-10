// Statistiche — main app shell

const { useState } = React;

function StatisticheApp() {
  const [tab, setTab] = useState('operazioni');
  const [opSub, setOpSub] = useState('prenotazioni');
  const [period, setPeriod] = useState('mese');

  const today = new Date();
  const dateStr = today.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="statistiche"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'18px 28px 32px', background:'#fafafa'}}>
          {/* Macro tabs + period picker — barra underline come Contabilità */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 16, borderBottom: `1px solid ${PN.BORDER}`, marginBottom: 18}}>
            <div style={{display:'flex', gap: 4}}>
              <StatTab id="operazioni" active={tab==='operazioni'} onClick={setTab} label="Operazioni" icon="chart-workflow"/>
              <StatTab id="economici" active={tab==='economici'} onClick={setTab} label="Economici" icon="commerce-coins"/>
              <StatTab id="app" active={tab==='app'} onClick={setTab} label="App" icon="chart-area"/>
            </div>
            <div style={{paddingBottom: 6}}>
              <StatPeriodPicker period={period} setPeriod={setPeriod}/>
            </div>
          </div>

          {/* Operazioni sub-tabs */}
          {tab === 'operazioni' && (
            <>
              <div style={{display:'flex', gap: 22, borderBottom:`1px solid ${PN.BORDER_SOFT}`, marginBottom: 16}}>
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

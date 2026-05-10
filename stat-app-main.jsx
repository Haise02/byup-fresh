// Statistiche — main app shell

const { useState } = React;

function StatisticheApp() {
  const [tab, setTab] = useState('operazioni');
  const [opSub, setOpSub] = useState('prenotazioni');
  const [period, setPeriod] = useState('mese');

  const today = new Date();
  const dateStr = today.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

  return (
    <div className="frame">
      <PnSidebar active="statistiche"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <header style={{
          display:'flex', alignItems:'flex-start', gap: 16,
          padding:'18px 28px 14px',
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE,
        }}>
          <div style={{flex:1}}>
            <h1 style={{margin:0, fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>Statistiche</h1>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, textTransform:'capitalize'}}>{dateStr}</div>
          </div>
          <PnNotifBell/>
        </header>

        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'18px 28px 32px', background:'#fafafa'}}>
          {/* Macro tabs + period picker */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 18, gap: 16}}>
            <div style={{display:'flex', gap: 8}}>
              <StatTab id="operazioni" active={tab==='operazioni'} onClick={setTab} label="Operazioni"/>
              <StatTab id="economici" active={tab==='economici'} onClick={setTab} label="Economici"/>
              <StatTab id="app" active={tab==='app'} onClick={setTab} label="App"/>
            </div>
            <StatPeriodPicker period={period} setPeriod={setPeriod}/>
          </div>

          {/* Operazioni sub-tabs */}
          {tab === 'operazioni' && (
            <>
              <div style={{display:'flex', gap: 22, borderBottom:`1px solid ${PN.BORDER_SOFT}`, marginBottom: 16}}>
                <StatSubTab active={opSub==='prenotazioni'} onClick={() => setOpSub('prenotazioni')} label="Prenotazioni"/>
                <StatSubTab active={opSub==='ordini'} onClick={() => setOpSub('ordini')} label="Ordini"/>
                <StatSubTab active={opSub==='staff'} onClick={() => setOpSub('staff')} label="Staff"/>
                <StatSubTab active={opSub==='clienti'} onClick={() => setOpSub('clienti')} label="Clienti"/>
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

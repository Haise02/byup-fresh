// App shell for Impostazioni

function ImpApp() {
  const [active, setActive] = React.useState('vetrina');

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      <PnSidebar active="impostazioni-shadow"/>

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0}}>
        <ImpHeader active={active}/>
        <ImpTabs active={active} onChange={setActive}/>

        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: '22px 32px 32px',
          background: PN.BG,
        }}>
          {active === 'vetrina' && <ImpVetrina/>}
          {active === 'menu-cucina' && <ImpMenuCucina/>}
          {active === 'sala' && <ImpSalaTavoli/>}
          {active === 'personale' && <ImpPersonale/>}
          {active === 'flussi' && <ImpFlussi/>}
          {active === 'fiscali' && <ImpDatiFiscali/>}
          {active === 'integrazioni' && <ImpIntegrazioni/>}
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className="frame" data-screen-label="Impostazioni">
    <GlassMeshSubstrate tone="neutral"/>
    <ImpApp/>
  </div>
);

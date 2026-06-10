// Account — App shell

function AccountApp() {
  // Leggi tab iniziale da ?tab=...
  const initialTab = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (['dati','password','piani','fatturazione'].includes(p)) return p;
    } catch(e) {}
    return 'dati';
  })();
  const [tab, setTab] = React.useState(initialTab);
  const tabs = [
    { id: 'dati', label: 'Dati generali', icon: 'people-customer' },
    { id: 'password', label: 'Password e sicurezza', icon: 'gear' },
    { id: 'piani', label: 'Piani e abbonamenti', icon: 'commerce-coins' },
    { id: 'fatturazione', label: 'Account e fatturazione', icon: 'commerce-bank-cards' },
  ];

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      <PnSidebar active="account"/>

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        <PnPageHeader title="Profilo" subtitle="Gestisci il tuo profilo personale e l'abbonamento." icon="people-user-circle"/>
        <PnUnderlineTabs tabs={tabs} active={tab} onChange={setTab}/>

        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: '22px 32px 32px',
          background: PN.BG,
        }}>
          {tab === 'dati' && <AccDatiGenerali/>}
          {tab === 'password' && <AccPasswordSicurezza/>}
          {tab === 'piani' && <AccPianiAbbonamenti/>}
          {tab === 'fatturazione' && <AccFatturazione/>}
        </div>
      </main>
    </div>
  );
}

const accRoot = ReactDOM.createRoot(document.getElementById('root'));
accRoot.render(
  <div className="frame" data-screen-label="Profilo">
    <GlassMeshSubstrate/>
    <AccountApp/>
  </div>
);

// App principale Supporto

const { useState } = React;

function SupportoApp() {
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState('config');
  const [chatOpen, setChatOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState(null);

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate/>
      <PnSidebar active="supporto"/>

      <main style={{flex: 1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        {/* Body */}
        <div className="pn-scroll" style={{flex: 1, overflowY:'auto', padding: '20px 28px 32px', background:'#fafafa'}}>
          <div style={{display:'flex', flexDirection:'column', gap: 20}}>
            <SupChannelCards
              onChat={() => setChatOpen(true)}
              onEmail={() => setEmailOpen(true)}
              onCall={() => setCallOpen(true)}
            />
            <SupSearch value={search} onChange={setSearch}/>
            <SupTutorials
              openCat={openCat}
              setOpenCat={setOpenCat}
              onOpenTutorial={setActiveTutorial}
              search={search}
            />
            <SupFAQ search={search}/>
          </div>
        </div>

        {/* Chat widget */}
        <SupChatWidget open={chatOpen} onClose={() => setChatOpen(false)}/>

        {/* FAB bottom-right per riaprire la chat */}
        {!chatOpen && (
          <button onClick={() => setChatOpen(true)} title="Apri assistente"
            style={{
              position:'absolute', right: 24, bottom: 24,
              width: 56, height: 56, borderRadius:'50%',
              background: PN.PINK, color: '#fff', border: 'none',
              boxShadow: '0 8px 24px rgba(233, 30, 99, 0.36)',
              cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              zIndex: 40,
            }}
          ><PnI.Chat size={22} color="#fff"/></button>
        )}
      </main>

      <SupEmailModal open={emailOpen} onClose={() => setEmailOpen(false)}/>
      <SupCallScheduler open={callOpen} onClose={() => setCallOpen(false)}/>
      <SupTutorialPlayer tutorial={activeTutorial} onClose={() => setActiveTutorial(null)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SupportoApp/>);

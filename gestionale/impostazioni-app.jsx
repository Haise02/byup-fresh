// App shell for Impostazioni
//
// Le impostazioni non sono una pagina come le altre: ci si entra per sistemare
// una cosa e si torna al lavoro. Per questo sono un popup grande sopra il
// gestionale — la sidebar dell'app resta lì sotto, velata, a dire da dove sei
// venuto — e non una schermata che sostituisce tutto e da cui bisogna trovare
// la strada per uscire.

function ImpApp() {
  // Deep-link: ?page=<tab> apre direttamente la pagina di impostazioni.
  const [active, setActive] = React.useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('page');
      if (['vetrina', 'menu-cucina', 'sala', 'personale', 'flussi', 'fiscali', 'integrazioni'].includes(p)) return p;
    } catch (e) {}
    return 'vetrina';
  });

  // Salto tra sezioni richiesto dall'interno di una sezione
  // (es. CTA "Attiva ora" in Operazioni → Sala e tavoli)
  React.useEffect(() => {
    const go = (e) => setActive(e.detail);
    window.addEventListener('byup-imp-goto', go);
    return () => window.removeEventListener('byup-imp-goto', go);
  }, []);

  // Quante modifiche non salvate ci sono in giro: lo dicono le pagine
  // registrandosi (impostazioni-shared.jsx), non un indovino sugli eventi.
  const [modifiche, setModifiche] = React.useState(false);
  React.useEffect(() => {
    const agg = () => setModifiche(v => {
      const n = window.byupImpHaModifiche();
      return n === v ? v : n;
    });
    window.addEventListener('byup-imp-modifiche', agg);
    return () => window.removeEventListener('byup-imp-modifiche', agg);
  }, []);

  const [chiedi, setChiedi] = React.useState(false);   // conferma di uscita
  const [salvato, setSalvato] = React.useState(false); // conferma di salvataggio

  // Uscire dal popup vuol dire tornare da dove si è arrivati: il gestionale.
  const esci = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'byup Panoramica.html';
  };
  const chiudi = () => { if (modifiche) setChiedi(true); else esci(); };
  const salva = () => {
    window.byupImpSalva();
    setSalvato(true);
    setTimeout(() => setSalvato(false), 2200);
  };

  // Esc chiude prima la domanda, poi il popup — e se ci sono modifiche il
  // popup non se ne va zitto, chiede.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (chiedi) setChiedi(false);
      else chiudi();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [chiedi, modifiche]);

  const sezione = IMP_SEZIONI.find(s => s.id === active) || {};

  return (
    <div style={{display: 'flex', flex: 1, minHeight: 0, position: 'relative'}}>
      {/* Dietro al velo non c'è una pagina finta: il menù dell'app tagliato a
          metà dal bordo del popup e un'area contenuti vuota si leggevano come
          un layout rotto, non come «il gestionale è là sotto». Resta il fondo
          della shell, velato — il popup è la schermata. */}
      <div style={{flex: 1, minWidth: 0}}/>

      <div
        onClick={chiudi}
        style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: 'rgba(15,17,21,0.46)',
          display: 'grid', placeItems: 'center',
          animation: 'impPopupVelo 0.18s ease-out',
        }}>
        <style>{`
          @keyframes impPopupVelo { from {opacity: 0;} to {opacity: 1;} }
          @keyframes impPopupSu {
            from {opacity: 0; transform: scale(0.975) translateY(14px);}
            to   {opacity: 1; transform: none;}
          }
        `}</style>

        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '90%', height: '90%',
            display: 'flex', minHeight: 0, overflow: 'hidden',
            background: PN.WHITE, borderRadius: 22,
            border: `1px solid ${PN.BORDER_HAIR}`,
            boxShadow: '0 40px 100px -20px rgba(15,17,21,0.42), 0 2px 8px rgba(15,17,21,0.10)',
            animation: 'impPopupSu 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>

          <ImpNavSidebar active={active} onChange={setActive} onClose={chiudi}/>

          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: PN.BG, position: 'relative'}}>
            {/* Niente testata: il nome della sezione lo dice già la colonna a
                sinistra, in grande e col segno di dove sei. Una fascia bianca
                che lo ripeteva rubava l'altezza alla cosa per cui si è entrati
                e spingeva le sotto-sezioni a metà schermo. La chiusura è
                salita accanto al titolo «Impostazioni», nella colonna. */}
            <div className="pn-scroll" style={{
              flex: 1, overflow: 'auto', minHeight: 0,
              padding: '18px 26px 26px',
            }}>
              {active === 'vetrina' && <ImpVetrina/>}
              {active === 'menu-cucina' && <ImpMenuCucina/>}
              {active === 'sala' && <ImpSalaTavoli/>}
              {active === 'personale' && <ImpPersonale/>}
              {active === 'flussi' && <ImpFlussi/>}
              {active === 'fiscali' && <ImpDatiFiscali/>}
              {active === 'integrazioni' && <ImpIntegrazioni/>}
            </div>

            {/* Piede: una CTA sola, in basso a destra, per tutto il popup */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
              padding: '13px 26px', background: PN.WHITE,
              borderTop: `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <div style={{flex: 1, minWidth: 0, fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 8}}>
                {modifiche ? (
                  <React.Fragment>
                    <span style={{width: 8, height: 8, borderRadius: '50%', background: PN.AMBER, flexShrink: 0}}/>
                    <span style={{color: PN.TEXT, fontWeight: 600}}>Hai modifiche non salvate</span>
                  </React.Fragment>
                ) : salvato ? (
                  <React.Fragment>
                    <span style={{color: PN.GREEN, display: 'inline-flex'}}><PnI.Check size={14}/></span>
                    <span style={{color: PN.GREEN, fontWeight: 600}}>Modifiche salvate</span>
                  </React.Fragment>
                ) : (
                  <span style={{color: PN.MUTED_SOFT}}>Tutto salvato</span>
                )}
              </div>
              <ImpButton variant="ghost" onClick={chiudi}>Chiudi</ImpButton>
              <ImpButton variant="pink" onClick={salva} disabled={!modifiche}>Salva modifiche</ImpButton>
            </div>
          </div>
        </div>
      </div>

      {/* Uscire buttando via il lavoro non deve poter succedere per sbaglio */}
      {chiedi && (
        <div
          onClick={() => setChiedi(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 300,
            background: 'rgba(15,17,21,0.42)', display: 'grid', placeItems: 'center', padding: 20,
            animation: 'impOverlayIn 0.18s ease-out',
          }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...MODAL_PANEL, width: 460,
            animation: 'impPopIn 0.28s cubic-bezier(0.34, 1.45, 0.64, 1)',
          }}>
            <div style={{padding: '24px 26px 0', display: 'flex', alignItems: 'flex-start', gap: 14}}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                background: PN.AMBER_SOFT, color: PN.AMBER,
              }}><PnI.Alert size={19}/></div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 19, fontWeight: 800, letterSpacing: -0.2, color: PN.TEXT, lineHeight: 1.3}}>
                  Vuoi salvare le modifiche?
                </div>
                <div style={{fontSize: 15, color: PN.MUTED, marginTop: 6, lineHeight: 1.5}}>
                  In <strong style={{color: PN.TEXT}}>{sezione.label || 'questa sezione'}</strong> c'è qualcosa che non hai
                  ancora salvato. Uscendo senza salvare lo perdi.
                </div>
              </div>
            </div>
            <div style={{...MODAL_FOOT, justifyContent: 'flex-end', marginTop: 22, borderTop: 'none'}}>
              <ImpButton variant="ghost" onClick={() => { setChiedi(false); esci(); }} style={{padding: '10px 20px'}}>
                Esci senza salvare
              </ImpButton>
              <ImpButton variant="pink" onClick={() => { window.byupImpSalva(); setChiedi(false); esci(); }} style={{padding: '10px 20px'}}>
                Salva ed esci
              </ImpButton>
            </div>
          </div>
        </div>
      )}
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

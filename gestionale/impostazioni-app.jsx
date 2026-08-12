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

  // Da dove sei arrivato, quando ci sei arrivato da un rimando e non dal menù.
  // Serve solo a offrire la strada del ritorno: chi viene mandato altrove per
  // sistemare una cosa vuole tornare a quella che stava facendo.
  const [ritorno, setRitorno] = React.useState(null);

  // Salto tra sezioni richiesto dall'interno di una sezione (es. «Modifica
  // visibilità» in Menù → Servizio). Il rimando può portare tre cose: dove
  // andare, su quale scheda posarsi e da dove si è partiti.
  React.useEffect(() => {
    const go = (e) => {
      const d = e.detail;
      const id = typeof d === 'string' ? d : d.id;
      const da = (d && typeof d === 'object') ? d.da : null;
      if (!id) return;
      setActive(id);
      setRitorno(da ? { id: da, label: (IMP_SEZIONI.find(s => s.id === da) || {}).label || 'indietro' } : null);
      if (d && typeof d === 'object' && d.anchor) {
        // Dopo il cambio di sezione: la scheda si accende e si porta in vista,
        // altrimenti si atterra in cima a una pagina lunga senza sapere dove.
        setTimeout(() => {
          const el = window.impAccendiSezione && window.impAccendiSezione(d.anchor);
          if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 140);
      }
    };
    window.addEventListener('byup-imp-goto', go);
    return () => window.removeEventListener('byup-imp-goto', go);
  }, []);

  // Scegliendo una sezione dal menù il rimando è finito: non c'è più un
  // «indietro» che voglia dire qualcosa.
  const vaiA = (id) => { setActive(id); setRitorno(null); };

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
      {/* Dietro al velo c'è il gestionale, non un fondo grigio: è da lì che si
          arriva ed è lì che si torna. Un popup ordinario lascia intravedere la
          pagina sotto — toglierla faceva sembrare le impostazioni un'altra
          finestra aperta per conto suo. */}
      <PnSidebar active="impostazioni"/>
      <main style={{flex: 1, minWidth: 0, background: PN.BG}}/>

      <div
        onClick={chiudi}
        style={{
          position: 'absolute', inset: 0, zIndex: 200,
          // Velo più leggero: deve oscurare quanto basta a mandare indietro
          // la pagina, non cancellarla.
          background: 'rgba(15,17,21,0.34)',
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
            // 16 come il frame e come le card: il 22 di prima era il raggio
            // delle modali piccole e su un box di questa misura si leggeva
            // come un'altra geometria.
            background: PN.WHITE, borderRadius: 16,
            border: `1px solid ${PN.BORDER_HAIR}`,
            boxShadow: '0 40px 100px -20px rgba(15,17,21,0.42), 0 2px 8px rgba(15,17,21,0.10)',
            animation: 'impPopupSu 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>

          <ImpNavSidebar active={active} onChange={vaiA}/>

          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: PN.BG, position: 'relative'}}>
            {/* Non è una testata: è la riga della cornice — da dove torni a
                sinistra, come esci a destra — alta quanto il pulsante e
                senza titoli, che il nome della sezione lo dice già la colonna.
                Sta fuori dal contenuto e non sopra: appoggiata sull'angolo
                finiva addosso alla prima cosa in alto a destra della pagina,
                che in Sala è «Aggiungi tavolo» e in Vetrina l'anteprima. */}
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px 0 26px', background: PN.BG,
            }}>
              <div style={{flex: 1, minWidth: 0}}>
                {ritorno && (
                  <button
                    onClick={() => { setActive(ritorno.id); setRitorno(null); }}
                    onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; }}
                    onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.borderColor = PN.BORDER_SOFT; }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '7px 13px 7px 10px', borderRadius: 9,
                      border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE_HUSH,
                      color: PN.TEXT, fontSize: 14.5, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 140ms ease, border-color 140ms ease',
                    }}>
                    <span style={{display: 'inline-flex', color: PN.MUTED, transform: 'rotate(180deg)'}}><PnI.ChevronRight size={12}/></span>
                    Torna a {ritorno.label}
                  </button>
                )}
              </div>
              <button onClick={chiudi} title="Chiudi le impostazioni"
                onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
                onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.color = PN.MUTED; }}
                style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE,
                  color: PN.MUTED, cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                  boxShadow: '0 1px 2px rgba(15,17,21,0.05)',
                  transition: 'background 130ms ease, color 130ms ease',
                }}><PnI.X size={15}/></button>
            </div>

            <div className="pn-scroll" style={{
              flex: 1, overflow: 'auto', minHeight: 0,
              padding: '14px 26px 26px',
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

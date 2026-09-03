// App shell for Impostazioni
//
// Le impostazioni non sono una pagina come le altre: ci si entra per sistemare
// una cosa e si torna al lavoro. Per questo il gestionale non sparisce — il suo
// menù resta a sinistra, stretto a barretta, e le sezioni delle impostazioni si
// aprono in una seconda colonna accanto. Non si è usciti da nessuna parte: si è
// aperto un cassetto, e per tornare al lavoro si clicca dove si sarebbe
// cliccato comunque.

function ImpApp() {
  // Classe dispositivo: rirenderizza al cambio (rotazione compresa); lo
  // «stretto» decide rail e colonne — vedi panoramica-tokens.
  const pnDevice = window.PnDevice ? window.PnDevice.use() : 'desktop';
  const stretto = window.statStretto ? window.statStretto() : false;
  void pnDevice;

  // Deep-link: ?page=<tab> apre direttamente la pagina di impostazioni.
  const [active, setActive] = React.useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('page');
      if (['vetrina', 'menu-cucina', 'sala', 'personale', 'stampanti', 'flussi', 'fiscali', 'integrazioni'].includes(p)) return p;
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

  const [chiedi, setChiedi] = React.useState(null);    // dove si sta andando, in attesa di conferma
  const [salvato, setSalvato] = React.useState(false); // conferma di salvataggio

  // Uscire da qui è cliccare un'altra voce del gestionale: la via d'uscita è il
  // menù accanto, non un pulsante «indietro» che non saprebbe dove riportare.
  // Il guardiano delle modifiche non salvate viveva su quel pulsante e ora vive
  // qui: si chiede prima di lasciare la pagina, perché lasciarla è ricaricare.
  const vaiPagina = (id) => {
    if (id === 'impostazioni') return;   // ci sei già
    const url = PN_PAGES[id];
    if (!url) return;
    if (modifiche) setChiedi(url);
    else window.location.href = url;
  };

  const salva = () => {
    window.byupImpSalva();
    setSalvato(true);
    setTimeout(() => setSalvato(false), 2200);
  };

  // Esc chiude la domanda. Non chiude le impostazioni: non sono più una
  // finestra posata sopra a qualcosa, sono la schermata su cui stai lavorando.
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && chiedi) setChiedi(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [chiedi]);

  // ─── Le due colonne di menù ────────────────────────────────────────────────
  // Impostazioni non sostituisce il menù del gestionale, gli si apre accanto.
  // Ma due menù larghi affiancati sono 544px di sola navigazione: si danno il
  // cambio, uno solo per volta porta le parole e l'altro resta la sua fila di
  // icone. Il comando è uno — la freccetta del gestionale, dov'è sempre stata:
  // è lei a dire quale dei due è aperto.
  // Lo stato iniziale è quello con cui hai lasciato la schermata precedente,
  // così la riduzione si vede accadere: è il gesto che racconta da dove arriva
  // questa colonna. Non si salva da nessuna parte — vale qui, e uscendo il
  // menù del gestionale è come l'avevi lasciato.
  const [menuLargo, setMenuLargo] = React.useState(() => {
    try { return localStorage.getItem('pn_sidebar_collapsed') === '1' ? 'impostazioni' : 'gestionale'; }
    catch (e) { return 'impostazioni'; }
  });
  React.useEffect(() => {
    if (menuLargo !== 'gestionale') return;
    const t = setTimeout(() => setMenuLargo('impostazioni'), 140);
    return () => clearTimeout(t);
  }, []);

  const sezione = IMP_SEZIONI.find(s => s.id === active) || {};

  return (
    // Schermata piena, non finestra: le impostazioni sono un'applicazione
    // intera — sette sezioni, sotto-sezioni, un salvataggio, dei rimandi con
    // ritorno — e una finestra dentro la finestra le stringeva proprio dove
    // servono larghe (la mappa dei tavoli, il compositore dei menù, il
    // telefono dell'anteprima).
    // Piena, però, non vuol dire sola: il gestionale resta a sinistra. Prima
    // spariva del tutto e per tornare al lavoro bisognava ricordarsi di un
    // pulsante; ora la strada di casa è sempre in vista.
    <div style={{
      display: 'flex', flex: 1, minHeight: 0, position: 'relative',
      background: PN.BG,
    }}>
      <style>{`
        @keyframes impEntra {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Il menù del gestionale, in modalità controllata: la larghezza la
          decide questa schermata, e non finisce in memoria. */}
      <PnSidebar active="impostazioni" onNav={vaiPagina}
        collapsed={stretto || menuLargo !== 'gestionale'}
        onToggle={() => setMenuLargo(m => m === 'gestionale' ? 'impostazioni' : 'gestionale')}/>

      <ImpNavSidebar active={active} onChange={vaiA} collapsed={stretto || menuLargo !== 'impostazioni'}/>

      {/* Solo il contenuto entra scorrendo dal basso: le due colonne di menù
          devono sembrare già lì — una perché c'era davvero, l'altra perché la
          sua entrata è la larghezza che prende, non uno scivolamento. */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        background: PN.BG, position: 'relative',
        animation: 'impEntra 0.30s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Quando ci si è arrivati da un rimando, la strada per tornare a
            quello che si stava facendo. È un'altra cosa dall'uscire dalle
            impostazioni, che sta in cima alla colonna: questa riporta alla
            sezione di prima, e c'è solo se una sezione di prima esiste. */}
        {ritorno && (
          <div style={{flexShrink: 0, padding: '14px 26px 0', background: PN.BG}}>
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
          </div>
        )}

        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto', minHeight: 0,
          padding: '14px 26px 26px',
        }}>
          {active === 'vetrina' && <ImpVetrina/>}
          {active === 'menu-cucina' && <ImpMenuCucina/>}
          {active === 'sala' && <ImpSalaTavoli/>}
          {active === 'personale' && <ImpPersonale/>}
          {active === 'stampanti' && <ImpStampanti/>}
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
          {/* Una sola cosa da fare qui: salvare. Uscire non è un'azione del
              piede — è tornare indietro, e sta in cima alla colonna. */}
          <ImpButton variant="pink" onClick={salva} disabled={!modifiche}>Salva modifiche</ImpButton>
        </div>
      </div>

      {/* Andarsene buttando via il lavoro non deve poter succedere per sbaglio */}
      {chiedi && (
        <div
          onClick={() => setChiedi(null)}
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
                  ancora salvato. Andando via senza salvare lo perdi.
                </div>
              </div>
            </div>
            <div style={{...MODAL_FOOT, justifyContent: 'flex-end', marginTop: 22, borderTop: 'none'}}>
              <ImpButton variant="ghost" onClick={() => { window.location.href = chiedi; }} style={{padding: '10px 20px'}}>
                Esci senza salvare
              </ImpButton>
              <ImpButton variant="pink" onClick={() => { window.byupImpSalva(); window.location.href = chiedi; }} style={{padding: '10px 20px'}}>
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

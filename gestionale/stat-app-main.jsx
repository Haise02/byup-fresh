// Statistiche — main app shell

const { useState } = React;

function StatisticheApp() {
  // Deep-link dalla Panoramica: ?tab=economici|operazioni|clienti e ?sub=…
  // Operazioni: prenotazioni|ordini|staff · Clienti: conversione|fidelizzazione.
  // Senza parametri si atterra su Economici: è la domanda con cui un
  // ristoratore apre le statistiche — quanto ho incassato, quanto ho speso.
  const urlInit = (() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const sub = p.get('sub');
      const grezzo = p.get('tab');
      // La scheda si è chiamata «App» finché parlava del canale invece che di
      // chi lo usa; i link vecchi restano buoni.
      const tabChiesto = grezzo === 'app' ? 'clienti' : grezzo;
      let tab = ['economici', 'operazioni', 'clienti'].includes(tabChiesto) ? tabChiesto : 'economici';
      // La sotto-scheda si è chiamata «clienti» quando stava in Operazioni e
      // poi sotto App: entrambe le forme continuano ad arrivare a destinazione
      // invece di atterrare sulle prenotazioni.
      const fidelizzazione = sub === 'fidelizzazione' || sub === 'clienti';
      if (fidelizzazione) tab = 'clienti';
      return {
        tab,
        sub: ['prenotazioni', 'ordini', 'staff'].includes(sub) ? sub : 'prenotazioni',
        cliSub: fidelizzazione ? 'fidelizzazione' : 'conversione',
      };
    } catch (e) { return { tab: 'economici', sub: 'prenotazioni', cliSub: 'conversione' }; }
  })();
  const [tab, setTab] = useState(urlInit.tab);
  const [opSub, setOpSub] = useState(urlInit.sub);
  const [cliSub, setCliSub] = useState(urlInit.cliSub);
  const [period, setPeriod] = useState('mese');

  const device = window.PnDevice ? window.PnDevice.use() : 'desktop';
  const phone = device === 'phone';
  // Stretto = telefono o tablet in portrait: definito negli atomi (statStretto).
  const stretto = window.statStretto ? window.statStretto() : phone;
  // Sul telefono la colonna respira di meno; i margini negativi delle barre
  // appiccicate seguono lo stesso numero, così arrivano comunque ai bordi.
  const pad = phone ? 14 : 28;

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

  // ── I pezzi, condivisi dalle due vesti (desktop con sidebar, telefono a shell).
  // Macro tabs — underline rosa su filo, period picker a destra (sul telefono
  // scende su una riga sua: accanto alle tre tab non ci sta). Restano incollate
  // in alto mentre si scorre: le pagine di Statistiche sono lunghe, e senza
  // questa barra a metà lettura non si sa più in che sezione si è né su che
  // periodo. Il respiro in alto sta DENTRO la barra e non nel contenitore:
  // con un margine negativo l'aggancio slittava di quei pixel e sopra
  // filtrava il contenuto. I margini laterali negativi la fanno arrivare ai
  // bordi della colonna, così niente le passa di lato.
  const barra = (
    <div ref={barraRef} style={{
      position:'sticky', top: 0, zIndex: 20,
      background:'#fafafa',
      margin:`0 -${pad}px 18px`,
      padding:`18px ${pad}px 0`,
    }}>
      <div style={phone ? {overflowX:'auto', WebkitOverflowScrolling:'touch'} : null}>
        <StatTabs
          tabs={[
            { id: 'economici', label: 'Economici', icon: 'commerce-coins' },
            { id: 'operazioni', label: 'Operazioni', icon: 'screen-gear' },
            { id: 'clienti', label: 'Clienti', icon: 'people-customer' },
          ]}
          active={tab} onChange={setTab}
          action={stretto ? null : <StatPeriodPicker period={period} setPeriod={setPeriod}/>}/>
      </div>
      {stretto && (
        <div style={{display:'flex', padding:'10px 0'}}>
          <StatPeriodPicker period={period} setPeriod={setPeriod}/>
        </div>
      )}
    </div>
  );

  // Operazioni sub-tabs — card a tutta riga (scorrono in orizzontale dove non
  // ci stanno)
  const subOperazioni = tab === 'operazioni' && (
    <div style={{
      position:'sticky', top:'var(--stat-barra, 63px)', zIndex: 19,
      background:'#fafafa',
      margin:`0 -${pad}px 0`,
      padding:`0 ${pad}px 18px`,
      display:'flex', gap: phone ? 10 : 14,
      overflowX:'auto', WebkitOverflowScrolling:'touch',
    }}>
      <StatSubTab active={opSub==='prenotazioni'} onClick={() => setOpSub('prenotazioni')} label="Prenotazioni" icon="time-calendar"/>
      <StatSubTab active={opSub==='ordini'} onClick={() => setOpSub('ordini')} label="Ordini" icon="commerce-cart"/>
      <StatSubTab active={opSub==='staff'} onClick={() => setOpSub('staff')} label="Team" icon="people-staff-group"/>
    </div>
  );

  // Sub-tab di Clienti — stessa barra appiccicata di Operazioni. Le due metà
  // del rapporto: prima come arrivano al pagamento, poi se tornano e che voto
  // lasciano.
  const subClienti = tab === 'clienti' && (
    <div style={{
      position:'sticky', top:'var(--stat-barra, 63px)', zIndex: 19,
      background:'#fafafa',
      margin:`0 -${pad}px 0`,
      padding:`0 ${pad}px 18px`,
      display:'flex', gap: phone ? 10 : 14,
      overflowX:'auto', WebkitOverflowScrolling:'touch',
    }}>
      <StatSubTab active={cliSub==='conversione'} onClick={() => setCliSub('conversione')} label="Conversione" icon="chart-funnel-conversion"/>
      <StatSubTab active={cliSub==='fidelizzazione'} onClick={() => setCliSub('fidelizzazione')} label="Fidelizzazione" icon="card-loyalty"/>
    </div>
  );

  const corpo = (
    <React.Fragment>
      {tab === 'operazioni' && (
        <React.Fragment>
          {opSub === 'prenotazioni' && <StatPrenotazioni/>}
          {opSub === 'ordini' && <StatOrdini/>}
          {opSub === 'staff' && <StatStaff/>}
        </React.Fragment>
      )}
      {tab === 'economici' && <StatEconomici/>}
      {tab === 'clienti' && (
        <React.Fragment>
          {cliSub === 'conversione' && <StatApp/>}
          {cliSub === 'fidelizzazione' && <StatClienti/>}
        </React.Fragment>
      )}
    </React.Fragment>
  );

  // ── Telefono: shell a due tab, stesse barre appiccicate, corpo identico.
  if (phone) {
    return (
      <div className="frame" style={{position:'relative'}}>
        <GlassMeshSubstrate tone="neutral"/>
        <PnMobileShell active="statistiche" title="Statistiche">
          <div style={{padding:`0 ${pad}px 28px`, background:'#fafafa', minHeight:'100%'}}>
            {barra}
            {subOperazioni}
            {subClienti}
            {corpo}
          </div>
        </PnMobileShell>
      </div>
    );
  }

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="statistiche"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:`0 ${pad}px 32px`, background:'#fafafa'}}>
          {barra}
          {subOperazioni}
          {subClienti}
          {corpo}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<StatisticheApp/>);

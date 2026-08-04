// ════════════════════════════════════════════════════════════════════════════
// MAPPA DELLA RETE · una mappa vera, con due strati
// ════════════════════════════════════════════════════════════════════════════
//
// Le tabelle dicono quanti locali ci sono a Milano. Non dicono che la Puglia è
// un buco, che la dorsale adriatica è vuota, che due locali si fanno
// concorrenza a quattrocento metri. Quella è una domanda di forma, e la forma
// si guarda — potendo avvicinarsi fino alla via.
//
// Sotto c'è una mappa vera (Leaflet, tile CARTO su dati OpenStreetMap): si
// zooma, si trascina, e il mondo continua oltre l'Italia. Non è un vezzo: il
// giorno in cui apre il primo locale a Barcellona la mappa non va rifatta, si
// sposta la vista.
//
// Lo switch cambia strato, non filtro:
//   Locali   → dov'è la rete (un punto per locale, grande quanto il suo volume)
//   Accessi  → dove la usano (calore per intensità di sessioni)
//
// Le due mappe non coincidono, ed è il motivo per cui stanno insieme: dove c'è
// calore senza punti c'è domanda scoperta; dove ci sono punti senza calore c'è
// rete che non viene usata.

const MAP_STATI = {
  active:     { label: 'Attivo',      colore: ADM.OK },
  onboarding: { label: 'In apertura', colore: ADM.WARN },
  inactive:   { label: 'Fermo',       colore: ADM.MUTED_LIGHT },
  churned:    { label: 'Uscito',      colore: ADM.DANGER },
};

// Scala del calore: un solo colore che si satura. Due tinte direbbero "due
// cose diverse", e qui la cosa è una sola misurata di più o di meno.
const MAP_GRADIENTE = {
  0.15: 'rgba(255,90,95,0.20)',
  0.40: 'rgba(255,90,95,0.45)',
  0.70: 'rgba(224,67,71,0.75)',
  1.00: 'rgba(181,51,56,0.92)',
};

const admNumIt = (v, dec = 0) =>
  Number(v || 0).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const admPctIt = (v, dec = 0) => admNumIt(v, dec) + '%';

function AnMappa() {
  const [strato, setStrato] = React.useState('locali');
  const [pronta, setPronta] = React.useState(!!window.L);

  const boxRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const stratoRef = React.useRef(null);   // il layer attualmente a video

  const locali = window.GEO_LOCALI || [];
  const accessi = window.GEO_ACCESSI || [];
  const perRegione = window.GEO_PER_REGIONE || {};

  const perCitta = React.useMemo(() => {
    const m = {};
    locali.forEach(l => {
      if (!m[l.citta]) m[l.citta] = { citta: l.citta, n: 0, attivi: 0, ordini: 0 };
      m[l.citta].n += 1;
      m[l.citta].ordini += l.ordiniMese;
      if (l.stato === 'active') m[l.citta].attivi += 1;
    });
    return Object.values(m).sort((a, b) => b.n - a.n);
  }, [locali]);

  const totAccessi = accessi.reduce((s, a) => s + a.accessi, 0);
  const cittaTot = new Set([...perCitta.map(c => c.citta), ...accessi.map(a => a.citta)]).size;
  const regioniConRete = new Set(Object.values(perRegione).filter(r => r.locali > 0).map(r => r.chiave)).size;

  // Leaflet arriva da CDN: se tarda, si aspetta invece di rinunciare.
  React.useEffect(() => {
    if (window.L) { setPronta(true); return; }
    const id = setInterval(() => { if (window.L) { setPronta(true); clearInterval(id); } }, 120);
    return () => clearInterval(id);
  }, []);

  // La mappa si crea una volta sola e resta: ricrearla a ogni switch di strato
  // butterebbe via la vista che l'operatore si è scelto.
  React.useEffect(() => {
    if (!pronta || !boxRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(boxRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
      minZoom: 2,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Vista d'apertura: tutti i locali dentro lo schermo. Da lì si allarga fino
    // al mondo o si scende fino alla via.
    if (locali.length) {
      map.fitBounds(L.latLngBounds(locali.map(l => [l.lat, l.lon])), { padding: [30, 30] });
    } else {
      map.setView([42.5, 12.5], 5);
    }
    mapRef.current = map;
    // La card può nascere mentre la tab è ancora in transizione: senza questo
    // la mappa misura zero e resta grigia.
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);
  }, [pronta, locali]);

  // Lo strato: si smonta il precedente e si monta il nuovo, sulla stessa vista.
  React.useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    if (stratoRef.current) { map.removeLayer(stratoRef.current); stratoRef.current = null; }

    if (strato === 'locali') {
      const gruppo = L.layerGroup();
      locali.forEach(l => {
        const s = MAP_STATI[l.stato] || MAP_STATI.inactive;
        const r = 5 + Math.min(1, (l.ordiniMese || 0) / 900) * 8;
        L.circleMarker([l.lat, l.lon], {
          radius: r,
          color: '#fff', weight: 1.5,
          fillColor: s.colore, fillOpacity: 0.85,
        }).bindTooltip(
          `<b>${l.nome}</b><br>${l.tipo} · ${l.citta}<br>${s.label} · piano ${l.piano}<br>${admNumIt(l.ordiniMese)} ordini nel mese`,
          { direction: 'top', offset: [0, -4] },
        ).addTo(gruppo);
      });
      gruppo.addTo(map);
      stratoRef.current = gruppo;
      return;
    }

    // Calore: il plugin disegna la densità, i pallini restano per poterci
    // leggere sopra i numeri della città.
    const gruppo = L.layerGroup();
    const max = accessi.reduce((m, a) => Math.max(m, a.accessi), 0) || 1;
    if (L.heatLayer) {
      L.heatLayer(accessi.map(a => [a.lat, a.lon, a.accessi / max]), {
        radius: 34, blur: 26, minOpacity: 0.25, max: 1, gradient: MAP_GRADIENTE,
      }).addTo(gruppo);
    }
    accessi.forEach(a => {
      L.circleMarker([a.lat, a.lon], {
        radius: 4 + a.intensita * 7,
        color: '#fff', weight: 1.2,
        fillColor: ADM.PINK_DARK, fillOpacity: 0.55 + a.intensita * 0.4,
      }).bindTooltip(
        `<b>${a.citta}</b><br>${admNumIt(a.accessi)} accessi · ${admPctIt(a.accessi / (totAccessi || 1) * 100)} del totale<br>` +
        `${a.utenti} utenti registrati qui, ${a.attivi} attivi<br>` +
        (a.localiQui === 0 ? 'Nessun locale in città' : `${a.localiQui} ${a.localiQui === 1 ? 'locale' : 'locali'} in città`),
        { direction: 'top', offset: [0, -4] },
      ).addTo(gruppo);
    });
    gruppo.addTo(map);
    stratoRef.current = gruppo;
  }, [strato, pronta, locali, accessi, totAccessi]);

  const classifica = strato === 'locali'
    ? perCitta.slice(0, 6).map(c => ({
        k: c.citta, primo: c.citta,
        secondo: `${c.n} ${c.n === 1 ? 'locale' : 'locali'} · ${c.attivi} attivi`,
        valore: admNumIt(c.ordini) + ' ord/mese',
      }))
    : accessi.slice(0, 6).map(a => ({
        k: a.citta, primo: a.citta,
        secondo: `${a.localiQui} ${a.localiQui === 1 ? 'locale' : 'locali'} · ${a.utenti} ${a.utenti === 1 ? 'utente registrato' : 'utenti registrati'}`,
        valore: admNumIt(a.accessi) + ' accessi',
      }));

  // Click su una città della classifica: la mappa ci va sopra. Leggere un nome
  // e doverlo cercare a mano sulla carta è lavoro inutile.
  const vaiA = (citta) => {
    const map = mapRef.current;
    const c = (window.GEO_CITTA || {})[citta];
    if (map && c) map.flyTo([c[0], c[1]], 11, { duration: 0.6 });
  };

  return (
    <AnCard
      titolo="Mappa della rete"
      sotto={strato === 'locali'
        ? 'Un punto per locale, dove si trova. Il diametro è il volume di ordini del mese.'
        : 'Dove gli utenti aprono l’app: più l’area è calda, più sessioni ci sono state.'}
      destra={
        <div style={{display:'flex', gap:6, background:ADM.NEUTRAL_SOFT, padding:3, borderRadius:9}}>
          {[['locali', 'Locali'], ['accessi', 'Accessi utenti']].map(([id, label]) => {
            const on = strato === id;
            return (
              <button key={id} onClick={() => setStrato(id)} style={{
                padding:'6px 13px', borderRadius:7, border:'none',
                background: on ? ADM.WHITE : 'transparent',
                color: on ? ADM.TEXT : ADM.MUTED,
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                boxShadow: on ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
                transition:'background 150ms ease-out, color 150ms ease-out',
              }}>{label}</button>
            );
          })}
        </div>
      }
    >
      <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start'}}>

        <div>
          <div ref={boxRef} style={{
            height:440, borderRadius:12, overflow:'hidden',
            border:`1px solid ${ADM.BORDER}`, background:ADM.NEUTRAL_SOFT,
          }}>
            {!pronta && (
              <div style={{height:'100%', display:'grid', placeItems:'center', fontSize:13, color:ADM.MUTED}}>
                Carico la mappa…
              </div>
            )}
          </div>

          <div style={{display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', marginTop:10}}>
            {strato === 'locali' ? (
              Object.keys(MAP_STATI).map(k => (
                <span key={k} style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:12.4, color:ADM.MUTED}}>
                  <span style={{width:9, height:9, borderRadius:'50%', background:MAP_STATI[k].colore}}/>
                  {MAP_STATI[k].label}
                </span>
              ))
            ) : (
              <span style={{display:'inline-flex', alignItems:'center', gap:9, fontSize:12.4, color:ADM.MUTED}}>
                Pochi accessi
                <span style={{
                  width:96, height:9, borderRadius:999,
                  background:'linear-gradient(90deg, rgba(255,90,95,0.20), rgba(255,90,95,0.55), rgba(181,51,56,0.92))',
                }}/>
                Molti
              </span>
            )}
            <span style={{fontSize:12.4, color:ADM.MUTED_SOFT, marginLeft:'auto'}}>
              Trascina per spostarti, rotella per zoomare
            </span>
          </div>
        </div>

        <div>
          <div style={{fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10}}>
            {strato === 'locali' ? 'Città per numero di locali' : 'Città per accessi'}
          </div>
          <div style={{display:'flex', flexDirection:'column'}}>
            {classifica.map((r, i) => (
              <button key={r.k} onClick={() => vaiA(r.k)} title={`Porta la mappa su ${r.primo}`} style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 0', width:'100%',
                background:'transparent', border:'none', textAlign:'left', cursor:'pointer', fontFamily:'inherit',
                borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
              }}>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:'block', fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{r.primo}</span>
                  <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:1}}>{r.secondo}</span>
                </span>
                <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap'}}>{r.valore}</span>
              </button>
            ))}
          </div>

          <div style={{
            marginTop:14, padding:'11px 13px', borderRadius:10,
            background:ADM.NEUTRAL_SOFT, fontSize:12.6, color:ADM.TEXT, lineHeight:1.5,
          }}>
            {strato === 'locali'
              ? <>{perCitta.length} città con almeno un locale su {cittaTot} in cui c’è vita, in {regioniConRete} regioni su 20: la rete è un arcipelago di piazze, non una copertura.</>
              : <>Il calore cade dove la rete c’è già: gran parte degli accessi arriva dal QR al tavolo, quindi una piazza si scalda quando i suoi locali lavorano — non quando ci abitano utenti registrati.</>}
          </div>
        </div>
      </div>
    </AnCard>
  );
}

window.AnMappa = AnMappa;

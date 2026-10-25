// ═══════════════════════════════════════════════════════════════════════
// Panorama · il mondo in React: etichette ancorate al 3D, contatori vivi,
// feed anonimo, simulazione della push e comandi. Il motore sta in
// pano-world.js; qui c'è tutto quello che si legge e si tocca.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useEffect, useRef, useCallback, useContext, createContext, useMemo } = React;
  const { Icon, cx } = Pano;
  const WorldCtx = createContext(null);
  Pano.useWorld = () => useContext(WorldCtx);

  const FASCE_INFO = {
    pranzo: { label: 'Pranzo', icon: 'sun', time: '12:15', inApp: 1140, digest: 'Inviato · eri 3°', digestShort: '3° · inviato', mine: true, sent: true },
    aperitivo: { label: 'Aperitivo', icon: 'sunset', time: '18:30', inApp: 1860, digest: 'Asta aperta · chiude alle 18:15', digestShort: 'asta aperta', mine: false },
    cena: { label: 'Cena', icon: 'moon', time: '20:00', inApp: 2940, digest: 'All’asta sei 2° · chiude 19:45', digestShort: '2° all’asta', mine: true },
  };
  Pano.FASCE_INFO = FASCE_INFO;
  const nowPreset = () => { const h = new Date().getHours() + new Date().getMinutes() / 60; return h >= 11 && h < 16 ? 'pranzo' : h >= 16 && h < 19.5 ? 'aperitivo' : 'cena'; };
  Pano.nowPreset = nowPreset;
  const hhmm = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  // Disegno di riserva quando il 3D non è disponibile
  function Fallback({ variant }) {
    const night = variant !== 'diorama';
    return (
      <div className="w-fallback" aria-hidden="true">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="fbg" cx="50%" cy="55%" r="60%"><stop offset="0" stopColor={night ? '#3A2E6E' : '#FFFFFF'} /><stop offset="1" stopColor={night ? '#0E0B22' : '#EFEAFB'} /></radialGradient>
            <linearGradient id="fir" x1="0" x2="1"><stop offset="0" stopColor="#CFE8FC" /><stop offset="0.4" stopColor="#FCBBF8" /><stop offset="1" stopColor="#ACACF8" /></linearGradient>
          </defs>
          <rect width="1200" height="600" fill="url(#fbg)" />
          <path d="M840 -20 C 760 180, 900 380, 820 640" stroke={night ? '#2B3770' : '#BFE3FA'} strokeWidth="70" fill="none" />
          {Array.from({ length: 90 }).map((_, i) => { const x = (i * 137) % 1180, y = 60 + ((i * 89) % 520); return <rect key={i} x={x} y={y} width={34 + (i % 4) * 8} height={22 + (i % 3) * 8} rx="5" fill={night ? '#2A2350' : '#FFFFFF'} stroke={night ? '#3F3570' : '#E6DFF5'} />; })}
          {[90, 170, 250].map((r, i) => <circle key={i} cx="560" cy="320" r={r} fill="none" stroke="url(#fir)" strokeWidth="2" opacity={0.8 - i * 0.2} />)}
          <rect x="535" y="290" width="50" height="50" rx="6" fill="#fff" />
        </svg>
      </div>
    );
  }

  function WorldView({ variant = 'atlante', mode = 'card', paused, className, style, children, initialPreset, showLabels = true, labelSet = 'full' }) {
    const hostRef = useRef(null);
    const worldRef = useRef(null);
    const [ok, setOk] = useState(true);
    const [ready, setReady] = useState(false);
    const [preset, setPresetS] = useState(initialPreset || nowPreset());
    const [stats, setStats] = useState({ reached: 0, taps: 0, arrivals: 0, covers: 0 });
    const [feed, setFeed] = useState(() => Pano.DATA.FEED.slice(0, 3).map((f, i) => Object.assign({ id: 'f' + i, at: i === 0 ? 'ora' : i + ' min' }, f)));
    const [pops, setPops] = useState([]);
    const [digest, setDigest] = useState(null); // null | 'live' | {reached}
    const [layers, setLayers] = useState({ people: true, rings: true, zone: true, rivals: false });
    const coversRef = useRef(0);
    const evRef = useRef(null);

    evRef.current = (ev) => {
      if (ev.type === 'tap' && Math.random() < 0.6) {
        setFeed((f) => [{ id: 't' + Date.now(), icon: 'tap', t: 'Tocco sul tuo annuncio', s: `a ${ev.d} m da te`, at: 'ora' }, ...f].slice(0, 5));
      }
      if (ev.type === 'arrive') {
        coversRef.current += ev.covers;
        const id = 'p' + Date.now() + Math.random();
        setPops((p) => [...p, { id, covers: ev.covers }]);
        setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1900);
        const ore = ['20:00', '20:30', '21:00', '21:15'][Math.floor(Math.random() * 4)];
        setFeed((f) => [{ id: 'a' + Date.now(), icon: 'calendar', t: `Prenotazione per ${ev.covers} alle ${ore}`, s: 'arriva dall’app', at: 'ora' }, ...f].slice(0, 5));
      }
      if (ev.type === 'digest-start') setDigest('live');
      if (ev.type === 'digest-end') {
        setDigest({ reached: ev.reached });
        setTimeout(() => setDigest(null), 4200);
      }
    };

    useEffect(() => {
      if (!Pano.World || !Pano.World.supported()) { setOk(false); return; }
      let w;
      try {
        w = new Pano.World(hostRef.current, {
          look: variant,
          onEvent: (e) => evRef.current && evRef.current(e),
          onStats: (s) => setStats({ reached: s.reached, taps: s.taps, arrivals: s.arrivals, covers: coversRef.current }),
        });
      } catch (e) { console.warn('Panorama: 3D non disponibile', e); setOk(false); return; }
      worldRef.current = w;
      w.setPreset(preset, true);
      setReady(true);
      (window.__panoWorlds = window.__panoWorlds || []).push(w); // per i test automatici
      return () => { w.dispose(); worldRef.current = null; window.__panoWorlds = (window.__panoWorlds || []).filter((x) => x !== w); };
    }, [variant]);

    useEffect(() => { if (worldRef.current) worldRef.current.setPaused(!!paused); }, [paused, ready]);

    const setPreset = useCallback((p) => { setPresetS(p); worldRef.current && worldRef.current.setPreset(p); }, []);
    const runDigest = useCallback(() => { if (worldRef.current) worldRef.current.digest(); else { setDigest('live'); setTimeout(() => { setDigest({ reached: 3214 }); setTimeout(() => setDigest(null), 4200); }, 4800); } }, []);
    const setLayer = useCallback((k, v) => { setLayers((l) => Object.assign({}, l, { [k]: v })); worldRef.current && worldRef.current.setLayer(k, v); }, []);
    const zoom = (d) => worldRef.current && worldRef.current.zoom(d);
    const recenter = () => worldRef.current && worldRef.current.recenter();

    // etichette: registrate nel motore una volta pronte
    const reg = useCallback((anchor, opts) => (el) => {
      const w = worldRef.current;
      if (!w) return;
      if (el) w.addLabel(el, anchor, opts);
    }, [ready]);

    const night = preset === 'cena' || (preset === 'aperitivo' && variant !== 'diorama');
    const ctx = { world: worldRef.current, ok, ready, preset, setPreset, stats, feed, digest, runDigest, layers, setLayer, zoom, recenter, variant, night };
    const rivals = useMemo(() => {
      const c = (Pano.store.get().digest || []).find((x) => x.id === '0-cena');
      if (!c) return [];
      const st = Pano.settleAuction(c.auction, c.auction.my && c.auction.my.max);
      return st.win.filter((w) => !w.me).map((w) => ({ pos: w.pos, name: w.who, cat: w.cat }));
    }, []);
    const showRivals = layers.rivals || !!digest;

    return (
      <WorldCtx.Provider value={ctx}>
        <div className={cx('world', 'world-' + variant, 'mode-' + mode, night ? 'is-night' : 'is-day', className)} style={style}>
          <div className={cx('world-sky', 'sky-' + preset)} />
          <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
          {!ok && <Fallback variant={variant} />}
          {variant !== 'diorama' && <div className="world-vignette" style={{ opacity: night ? 1 : 0.35 }} />}
          {variant === 'atlante' && <div className="w-scrim" />}
          {showLabels && ready && (
            <div className="world-labels">
              <div className="wl me" ref={reg('venue')}>
                <span className="tag">
                  <span className="mk"><img src={Pano.IMG.markInk} alt="" /></span>
                  <span className="col" style={{ gap: 0, lineHeight: 1.15 }}>
                    <span>Cacio e Pepe</span>
                    <small>{FASCE_INFO[preset].mine ? `Push ${FASCE_INFO[preset].time} · ${FASCE_INFO[preset].digestShort}` : 'Ricerca in cima · attiva'}</small>
                  </span>
                  <span className="live"><i />LIVE</span>
                </span>
                <span className="stem" />
                <span className="stem-dot" />
              </div>
              {labelSet === 'full' && rivals.slice(0, 3).map((r, i) => (
                <div key={i} className="wl rival" ref={reg('rival' + i)} style={{ opacity: 0 }}>
                  <span className="tag" style={{ opacity: showRivals ? 1 : 0, transition: 'opacity .4s' }}><span className="pos">{r.pos}</span>{r.name}<small>{r.cat}</small></span>
                </div>
              ))}
              {labelSet === 'full' && layers.zone && <div className="wl zone" ref={reg('zone')}><span className="tag"><Icon n="push" size={14} />Zona della push · Trastevere</span></div>}
              <div className="wl place" ref={reg('tevere')}><span className="tag">Tevere</span></div>
              {variant !== 'diorama' && <div className="wl place" ref={reg('gianicolo')}><span className="tag">Gianicolo</span></div>}
              {pops.map((p) => (
                <div key={p.id} className="wl pop" ref={(el) => { if (el && worldRef.current) { const a = worldRef.current.anchor('door'); a.y += 4; a.z += (Math.random() - 0.5) * 16; worldRef.current.addLabel(el, a); } }}>
                  <span className="tag"><Icon n="checkCircle" />+{p.covers} {p.covers === 1 ? 'coperto' : 'coperti'}</span>
                </div>
              ))}
            </div>
          )}
          {digest === 'live' && (
            <div className="w-push" role="status">
              <div className="app"><Pano.ByupGlyph size={18} /></div>
              <div style={{ minWidth: 0 }}>
                <div className="hd"><span>BYUP · push di zona</span><span>adesso</span></div>
                <div className="bd"><b>Stasera a Trastevere</b> · 3 posti scelti per te: La Fiamma, <b>Cacio e Pepe</b>, Sushi Hanami.</div>
              </div>
            </div>
          )}
          <div className="world-ui">{children}</div>
        </div>
      </WorldCtx.Provider>
    );
  }

  // ─── Pezzi di interfaccia sopra il mondo ────────────────────────────────
  function TimeSeg({ compact }) {
    const w = Pano.useWorld();
    const now = nowPreset();
    return (
      <div className="w-seg" role="tablist" aria-label="Fascia oraria">
        {['pranzo', 'aperitivo', 'cena'].map((p) => (
          <button key={p} type="button" role="tab" aria-selected={w.preset === p} className={w.preset === p ? 'on' : ''} onClick={() => w.setPreset(p)}>
            <Icon n={FASCE_INFO[p].icon} />{FASCE_INFO[p].label}{p === now && !compact && <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.6 }}>· ora</span>}
          </button>
        ))}
      </div>
    );
  }
  function DigestButton({ label }) {
    const w = Pano.useWorld();
    const info = FASCE_INFO[w.preset];
    return (
      <button type="button" className="w-digest-btn" onClick={w.runDigest} disabled={w.digest === 'live'} aria-label={`Simula la push delle ${info.time}`}>
        <span className="ic"><Icon n="push" /></span>
        <span className="lbl">{w.digest === 'live' ? 'Push in consegna…' : (label || `Simula la push delle ${info.time}`)}</span>
      </button>
    );
  }
  function Tools() {
    const w = Pano.useWorld();
    const [open, setOpen] = useState(false);
    const L = [['people', 'Persone con l’app', 'users'], ['rings', 'Onde di reach', 'target'], ['zone', 'Zona della push', 'push'], ['rivals', 'Gli altri nella push', 'store']];
    return (
      <>
        <div className="w-tools">
          <button type="button" className={cx('w-tool', open && 'on')} onClick={() => setOpen(!open)} aria-label="Livelli" aria-expanded={open}><Icon n="layers" /></button>
          <button type="button" className="w-tool" onClick={() => w.zoom(1)} aria-label="Avvicina"><Icon n="plus" /></button>
          <button type="button" className="w-tool" onClick={() => w.zoom(-1)} aria-label="Allontana"><Icon n="minus" /></button>
          <button type="button" className="w-tool" onClick={w.recenter} aria-label="Torna al locale"><Icon n="target" /></button>
        </div>
        {open && (
          <div className="wpanel w-layers" role="group" aria-label="Livelli della mappa">
            {L.map(([k, l, ic]) => (
              <button key={k} type="button" className={cx('w-layer', w.layers[k] && 'on')} onClick={() => w.setLayer(k, !w.layers[k])} aria-pressed={!!w.layers[k]}>
                <Icon n={ic} size={16} />{l}<span className="sw" />
              </button>
            ))}
          </div>
        )}
      </>
    );
  }
  // Contatori di oggi: base dimostrativa + quello che succede nel mondo
  function useLiveNumbers() {
    const w = Pano.useWorld();
    const s = w.stats;
    const reached = 1284 + s.reached * 3 + (w.digest && w.digest.reached ? 0 : 0);
    return { reached, taps: 96 + s.taps, bookings: 11 + s.arrivals, covers: 27 + s.covers };
  }
  Pano.useLiveNumbers = useLiveNumbers;

  function CountPanel({ title = 'Persone raggiunte oggi', showSplit = true, withWhere }) {
    const n = useLiveNumbers();
    return (
      <div className="wpanel">
        <div className="w-count-row">
          <span className="t-micro">{title}</span>
          <span className="pill sm" style={{ background: 'rgba(92,227,154,.16)', color: '#7DF0B2', boxShadow: 'none' }}><Icon n="up" strokeWidth={2.4} />+14% vs sabato</span>
        </div>
        <div className="w-count" style={{ marginTop: 8 }} aria-live="off">{Pano.n(n.reached)}</div>
        {showSplit && (
          <div className="w-split">
            <div><b>{Pano.n(n.taps)}</b><small>Tocchi</small></div>
            <div><b>{Pano.n(n.bookings)}</b><small>Prenotazioni</small></div>
            <div><b>{Pano.n(n.covers)}</b><small>Coperti</small></div>
          </div>
        )}
        {withWhere && (
          <div className="w-bars" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.12)' }}>
            {[['Ricerca', 0.61], ['Notifiche', 0.27], ['Eventi', 0.12]].map(([k, v]) => (
              <div className="w-bar" key={k}><span>{k}</span><span className="trk"><i style={{ width: v * 100 + '%' }} /></span><span>{Pano.pct(v * 100)}</span></div>
            ))}
          </div>
        )}
      </div>
    );
  }
  function WherePanel() {
    return (
      <div className="wpanel w-bars-panel">
        <span className="t-micro">Dove ti vedono oggi</span>
        <div className="w-bars" style={{ marginTop: 10 }}>
          {[['Ricerca', 0.61], ['Notifiche', 0.27], ['Eventi', 0.12]].map(([k, v]) => (
            <div className="w-bar" key={k}><span>{k}</span><span className="trk"><i style={{ width: v * 100 + '%' }} /></span><span>{Pano.pct(v * 100)}</span></div>
          ))}
        </div>
      </div>
    );
  }
  function FeedPanel({ max = 3 }) {
    const w = Pano.useWorld();
    return (
      <div className="wpanel w-feed-panel">
        <div className="row between"><span className="t-micro">Adesso</span><span className="t-micro" style={{ opacity: 0.7 }}>anonimo</span></div>
        <div className="w-feed" style={{ marginTop: 10 }} aria-live="polite">
          {w.feed.slice(0, max).map((f) => (
            <div className="w-feed-item" key={f.id}>
              <span className="fi"><Icon n={f.icon} /></span>
              <span className="fi-txt"><b>{f.t}</b><span className="wmuted">{f.s}</span></span>
              <time>{f.at}</time>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // «mini»: la stessa scheda in piccolo, sotto il contatore (home A dal 25 ottobre)
  function ZonePanel({ mini }) {
    const w = Pano.useWorld();
    const info = FASCE_INFO[w.preset];
    return (
      <div className={cx('wpanel w-zone', mini && 'mini')}>
        <div className="row between">
          <span className="t-micro">Zona attiva</span>
          <span className="pill sm" style={{ background: 'rgba(255,255,255,.14)', color: '#fff', boxShadow: 'none' }}><Icon n="pin" />Trastevere</span>
        </div>
        <dl>
          <dt>Raggio della push</dt><dd>1,2 km</dd>
          <dt>Con l’app aperta</dt><dd>{Pano.n(info.inApp)}</dd>
          <dt>Push delle {info.time}</dt><dd>{mini ? info.digestShort : info.digest}</dd>
          <dt>Locali attivi in zona</dt><dd>38</dd>
        </dl>
      </div>
    );
  }
  function DigestDone() {
    const w = Pano.useWorld();
    if (!w.digest || w.digest === 'live') return null;
    return (
      <div className="w-push" role="status" style={{ background: 'rgba(255,255,255,.94)' }}>
        <div className="app av-ring"><Icon n="checkCircle" style={{ color: '#2B2340' }} /></div>
        <div>
          <div className="hd"><span>Push consegnata</span><span>simulazione</span></div>
          <div className="bd"><b>{Pano.n(Math.max(2600, w.digest.reached * 9))} persone</b> l'hanno ricevuta. Eri 2° dei 3 nella push, uno per categoria.</div>
        </div>
      </div>
    );
  }

  Object.assign(Pano, { WorldView, TimeSeg, DigestButton, Tools, CountPanel, WherePanel, FeedPanel, ZonePanel, DigestDone, hhmm });
})();

// Panorama · la candidatura da Fresh (25 ottobre 2026, richiesta di Nilo)
//
// Panorama, il business manager di advertising di byup, si chiede da qui e non da
// Panorama: nella barra laterale, sotto le sezioni, c'è il suo bannerino. Tre stati,
// condivisi fra le pagine e tenuti per locale (localStorage):
//   nessuna   → «Candidati»: a destra si apre la schermata della candidatura
//   inviata   → in valutazione da byup, di solito entro 48 ore; si può ritirare
//   approvata → «Apri Panorama» apre Panorama in un'altra scheda, senza schermate
// Il bannerino lo vede solo il titolare: Panorama è per chi decide le spese.
// Nel prototipo l'approvazione si simula dalla schermata della candidatura; un doppio
// clic sul marchio del bannerino riporta il locale all'inizio.
//
// La schermata vive in una radice React sua, posata nel `.frame`: così resta aperta
// anche quando il menù è nel cassetto (tela stretta) e il cassetto si chiude.

// Tutto dentro una funzione: i nomi restano qui e non si scontrano con gli altri
// script del gestionale; fuori escono solo quelli appesi a `window`.
(function () {
  const PANO_CAND_KEY = 'byup_panorama_candidature';
  const PANO_URL = '../panorama/byup-panorama.html';
  const PANO_LOGO = 'panorama-logo-iride.png';
  const PANO_MARK = 'panorama-mark-iride.png';
  const PANO_INK = '#0E0D13';

  function _panoLocale() {
    const l = window.byupReadLocale ? window.byupReadLocale() : null;
    return l && l.id ? l : { id: 'cp', nome: 'Cacio e Pepe' };
  }
  window.byupReadPanorama = function () {
    try {
      const all = JSON.parse(localStorage.getItem(PANO_CAND_KEY) || '{}');
      return all[_panoLocale().id] || { stato: 'nessuna' };
    } catch (e) { return { stato: 'nessuna' }; }
  };
  window.byupWritePanorama = function (v) {
    try {
      const all = JSON.parse(localStorage.getItem(PANO_CAND_KEY) || '{}');
      const id = _panoLocale().id;
      if (v) all[id] = v; else delete all[id];
      localStorage.setItem(PANO_CAND_KEY, JSON.stringify(all));
    } catch (e) {}
    try { window.dispatchEvent(new Event('byup-panorama-change')); } catch (e) {}
  };
  function usePanoramaCandidatura() {
    const [c, setC] = React.useState(() => window.byupReadPanorama());
    React.useEffect(() => {
      const ev = ['byup-panorama-change', 'storage', 'byup-locale-change'];
      const u = () => setC(window.byupReadPanorama());
      ev.forEach((e) => window.addEventListener(e, u));
      return () => ev.forEach((e) => window.removeEventListener(e, u));
    }, []);
    return c;
  }

  // Le animazioni della schermata, una volta per pagina
  (function () {
    if (document.getElementById('pn-pano-css')) return;
    const st = document.createElement('style');
    st.id = 'pn-pano-css';
    st.textContent = '@keyframes pnPanoIn{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}'
      + '@keyframes pnPanoFade{from{opacity:0}to{opacity:1}}'
      + '@keyframes pnPanoPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.55)}50%{box-shadow:0 0 0 5px rgba(245,158,11,0)}}';
    document.head.appendChild(st);
  })();

  // ─── Apertura: una radice sua dentro il frame ───────────────────────────────
  let _panoRoot = null;
  function _panoSinistra() {
    // dove finisce la barra laterale (in fila): la schermata copre solo la pagina
    const sb = document.querySelector('[data-pn-sidebar]');
    return sb ? sb.offsetWidth : 0;
  }
  window.byupApriCandidatura = function () {
    try { window.dispatchEvent(new Event('pn-cassetto-chiudi')); } catch (e) {}
    const frame = document.querySelector('.frame') || document.body;
    let host = document.getElementById('pn-panorama-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'pn-panorama-host';
      frame.appendChild(host);
      _panoRoot = ReactDOM.createRoot(host);
    }
    const chiudi = () => _panoRoot && _panoRoot.render(null);
    // un attimo dopo: il cassetto si è chiuso e la barra in fila ha la sua misura
    setTimeout(() => _panoRoot.render(<PnPanoramaCandidatura sinistra={_panoSinistra()} onClose={chiudi} />), 0);
  };
  window.byupApriPanorama = function () {
    window.open(PANO_URL, '_blank', 'noopener');
  };

  // ─── Il bannerino nella barra laterale ──────────────────────────────────────
  function PnPanoramaBanner({ collapsed }) {
    const c = usePanoramaCandidatura();
    const [hover, setHover] = React.useState(false);
    if (window.PN_UTENTE && window.PN_UTENTE.ruolo !== 'titolare') return null;
    const st = c.stato;
    const azione = () => (st === 'approvata' ? window.byupApriPanorama() : window.byupApriCandidatura());
    const ricomincia = (e) => { e.stopPropagation(); window.byupWritePanorama(null); };
    const titolo = st === 'approvata' ? 'Apri Panorama in un’altra scheda'
      : st === 'inviata' ? 'Panorama · candidatura in valutazione' : 'Panorama · candidati';
    const puntino = st === 'inviata' ? '#F59E0B' : st === 'approvata' ? '#22C55E' : null;

    if (collapsed) {
      return (
        <button onClick={azione} title={titolo} aria-label={titolo} style={{
          position: 'relative', width: 48, height: 48, margin: '10px auto 0', flexShrink: 0,
          borderRadius: 14, border: 'none', cursor: 'pointer', background: PANO_INK,
          display: 'grid', placeItems: 'center',
          boxShadow: '0 10px 22px -12px rgba(14,13,19,0.6)',
        }}>
          <img src={PANO_MARK} alt="" style={{ height: 24, width: 'auto', display: 'block' }} />
          {puntino && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: puntino, boxShadow: '0 0 0 2px ' + PANO_INK }} />}
        </button>
      );
    }

    const cta = st === 'approvata' ? 'Apri Panorama' : st === 'inviata' ? 'Vedi la candidatura' : 'Candidati';
    return (
      <div style={{
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        margin: '12px 0 4px', padding: '14px 12px 12px', borderRadius: 14,
        background: PANO_INK,
        boxShadow: '0 12px 26px -14px rgba(14,13,19,0.65), inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        {/* la luce del marchio, come nelle schede di Panorama */}
        <span aria-hidden="true" style={{ position: 'absolute', right: -40, top: -46, width: 150, height: 120, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,150,236,0.34), transparent)', pointerEvents: 'none' }} />
        <span aria-hidden="true" style={{ position: 'absolute', left: -30, bottom: -60, width: 140, height: 110, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(150,170,255,0.22), transparent)', pointerEvents: 'none' }} />
        <img src={PANO_LOGO} alt="Panorama" onDoubleClick={ricomincia} title="Panorama"
          style={{ position: 'relative', height: 22, width: 'auto', display: 'block' }} />
        {st !== 'nessuna' && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.78)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: puntino, flexShrink: 0, animation: st === 'inviata' ? 'pnPanoPulse 1.8s ease-in-out infinite' : 'none' }} />
            {st === 'inviata' ? 'In valutazione · entro 48 ore' : 'Accesso attivo'}
          </div>
        )}
        <button onClick={azione}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          style={{
            position: 'relative', width: '100%', height: 34, marginTop: 12,
            borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: st === 'inviata' ? 'rgba(255,255,255,0.12)' : (hover ? '#F3F0FF' : '#FFFFFF'),
            color: st === 'inviata' ? '#FFFFFF' : PANO_INK,
            boxShadow: st === 'inviata' ? 'inset 0 0 0 1px rgba(255,255,255,0.16)' : '0 2px 8px -2px rgba(0,0,0,0.35)',
            fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 160ms ease',
          }}>
          {cta}
          {st === 'approvata'
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
            : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ transform: hover ? 'translateX(2px)' : 'none', transition: 'transform 160ms ease' }}><path d="M7 4.5v15l12-7.5z" /></svg>}
        </button>
      </div>
    );
  }
  window.PnPanoramaBanner = PnPanoramaBanner;

  // ─── La schermata della candidatura ─────────────────────────────────────────
  const PANO_IDONEITA = [
    { t: 'Usi Fresh da almeno 30 giorni', v: 'da 8 mesi', ok: true },
    { t: 'Giorni di apertura registrati', v: '26 negli ultimi 30', ok: true },
    { t: 'Voto medio in app', v: '4,6 su 5', ok: true },
    { t: 'Ordini e prenotazioni da byup', v: '148 nell’ultimo mese', ok: true },
    { t: 'Profilo completo', v: '92% · manca il menù delle bevande', ok: false, link: { label: 'Completalo', href: 'byup Impostazioni.html?page=menu-cucina' } },
  ];
  const PANO_OBIETTIVI = ['Più prenotazioni', 'Riempire le sere', 'Più pranzi', 'Far conoscere gli eventi', 'Spingere le offerte'];
  const PANO_BUDGET = ['Fino a 100 €', '100–300 €', 'Oltre 300 €', 'Non lo so ancora'];
  const PANO_REGOLE = [
    'Foto vere del locale e dei piatti, senza scritte sopra oltre un quinto dell’immagine.',
    'Prezzi uguali al menù di Fresh: offerte e prezzi barrati si controllano sul menù.',
    'Niente superlativi che non si possono verificare.',
    'L’etichetta «Sponsorizzato» la mette byup e non si toglie.',
    'Niente marchi di altri né contenuti per adulti: squadre e sponsor passano da un controllo a mano.',
    'Eventi chiari: data, ora e condizioni scritte per intero.',
  ];
  const PANO_SPAZI = ['Ricerca in cima', 'Eventi in evidenza', 'Push all’asta', 'Notifiche in app', 'Vetrina in un tocco'];
  const _hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  function _PanoIcon({ d, size = 16, color = 'currentColor', w = 2.2 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{d}</svg>;
  }
  const _ic = {
    check: <path d="M5 12.5 10 17l9-10" />,
    alert: <><path d="M12 8v5" /><path d="M12 16.5v.01" /><circle cx="12" cy="12" r="9" /></>,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    ext: <path d="M7 17 17 7M8 7h9v9" />,
  };

  function _PanoCard({ titolo, sotto, children, style }) {
    return (
      <section style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: PN.CARD_SHADOW, border: `1px solid ${PN.BORDER_HAIR}`, minWidth: 0, ...style }}>
        {titolo && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.2, color: PN.TEXT }}>{titolo}</div>
            {sotto && <div style={{ fontSize: 13.5, color: PN.MUTED, marginTop: 3 }}>{sotto}</div>}
          </div>
        )}
        {children}
      </section>
    );
  }
  function _PanoChip({ on, children, onClick }) {
    return (
      <button type="button" onClick={onClick} aria-pressed={on} style={{
        height: 34, padding: '0 13px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 13.5, fontWeight: 600,
        border: `1px solid ${on ? PN.PINK : PN.BORDER}`,
        background: on ? PN.PINK_BG_SOFT : '#fff',
        color: on ? PN.BRAND_TEXT : PN.TEXT,
        transition: 'background 140ms ease, border-color 140ms ease',
      }}>{children}</button>
    );
  }
  function _PanoLabel({ children }) {
    return <div style={{ fontSize: 13, fontWeight: 700, color: PN.TEXT, marginBottom: 7 }}>{children}</div>;
  }
  function _PanoStatico({ children, sotto }) {
    return (
      <div style={{ padding: '10px 12px', borderRadius: 10, background: PN.WHITE_OFF, border: `1px solid ${PN.BORDER}`, fontSize: 15, fontWeight: 600, color: PN.TEXT }}>
        {children}
        {sotto && <div style={{ fontSize: 12.5, fontWeight: 500, color: PN.MUTED, marginTop: 2 }}>{sotto}</div>}
      </div>
    );
  }

  function PnPanoramaCandidatura({ sinistra = 0, onClose }) {
    const c = usePanoramaCandidatura();
    const locale = _panoLocale();
    const utente = window.PN_UTENTE || { nome: 'Mario Rossi', ruoloLabel: 'Titolare' };
    const [email, setEmail] = React.useState((typeof ACC_DATI !== 'undefined' && ACC_DATI.email) || 'mario.rossi@email.com');
    const [obiettivi, setObiettivi] = React.useState(['Più prenotazioni']);
    const [budget, setBudget] = React.useState(null);
    const [regole, setRegole] = React.useState(false);
    const [leggi, setLeggi] = React.useState(false);
    const chiudiRef = React.useRef(null);
    React.useEffect(() => {
      const k = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', k);
      if (chiudiRef.current) chiudiRef.current.focus();
      return () => window.removeEventListener('keydown', k);
    }, []);
    // approvata mentre la schermata è aperta: si chiude, d'ora in poi apre Panorama il bannerino
    React.useEffect(() => { if (c.stato === 'approvata') onClose(); }, [c.stato]);

    const inviata = c.stato === 'inviata';
    const puoInviare = regole && obiettivi.length > 0 && /.+@.+\..+/.test(email);
    const invia = () => {
      if (!puoInviare) return;
      window.byupWritePanorama({ stato: 'inviata', il: new Date().toISOString(), email, obiettivi, budget, locale: locale.nome });
    };
    const toggle = (o) => setObiettivi((a) => (a.includes(o) ? a.filter((x) => x !== o) : [...a, o]));
    const quando = c.il ? new Date(c.il) : new Date();

    const passi = [
      { t: 'Ti candidi', s: inviata ? `oggi alle ${_hhmm(quando)}` : 'da qui, in un minuto', fatto: inviata },
      { t: 'byup valuta', s: 'di solito entro 48 ore', ora: inviata },
      { t: 'Apri Panorama', s: 'in un’altra scheda, con lo stesso account' },
    ];

    return (
      // sopra la fascia delle attivazioni (440) e agli avvisi (400), sotto i loro fogli (460)
      <div style={{ position: 'absolute', inset: 0, zIndex: 450 }}>
        <div onClick={onClose} aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,17,21,0.34)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
          animation: 'pnPanoFade 200ms ease both',
        }} />
        <section role="dialog" aria-modal="true" aria-label="Candidatura a Panorama" style={{
          position: 'absolute', top: 14, bottom: 14, right: 14, left: sinistra + 14,
          background: PN.BG, borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 30px 80px -24px rgba(15,17,21,0.5), 0 0 0 1px rgba(15,17,21,0.06)',
          display: 'flex', flexDirection: 'column',
          animation: 'pnPanoIn 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}>
          <div className="pn-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 18 }}>
            {/* testata scura, il marchio a colori */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: PANO_INK, color: '#fff', padding: '24px 26px 22px' }}>
              <span aria-hidden="true" style={{ position: 'absolute', right: -80, top: -120, width: 420, height: 320, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,140,232,0.32), transparent)' }} />
              <span aria-hidden="true" style={{ position: 'absolute', right: 160, bottom: -170, width: 380, height: 300, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(130,160,255,0.24), transparent)' }} />
              <span aria-hidden="true" style={{ position: 'absolute', left: -120, top: -60, width: 300, height: 240, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(170,230,255,0.14), transparent)' }} />
              <button ref={chiudiRef} onClick={onClose} aria-label="Chiudi" title="Chiudi" style={{
                position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', display: 'grid', placeItems: 'center',
              }}><_PanoIcon d={_ic.x} size={16} /></button>
              <img src={PANO_LOGO} alt="Panorama" style={{ position: 'relative', height: 30, width: 'auto', display: 'block' }} />
              <h2 style={{ position: 'relative', margin: '18px 0 8px', fontSize: 30, lineHeight: 1.12, fontWeight: 800, letterSpacing: -0.6, maxWidth: 680 }}>
                {inviata ? 'Candidatura inviata' : `Porta ${locale.nome} in cima all’app byup, quando ti serve.`}
              </h2>
              <p style={{ position: 'relative', margin: 0, fontSize: 15.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.74)', maxWidth: 700 }}>
                {inviata
                  ? <>La sta guardando il team byup: di solito rispondiamo entro 48 ore, qui in Fresh e per email a <b style={{ color: '#fff' }}>{c.email}</b>. Appena è approvata, questo bannerino apre Panorama.</>
                  : 'Panorama è il business manager di byup: compri spazi nell’app, in cima alla ricerca, tra gli eventi e nelle notifiche, e vedi quanto rendono, contati sui conti di Fresh. È su invito: ci si candida da qui.'}
              </p>
              <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {PANO_SPAZI.map((s) => (
                  <span key={s} style={{ height: 30, padding: '0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.09)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* come va da qui: i tre passi */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              {passi.map((p, i) => (
                <div key={p.t} style={{
                  flex: '1 1 220px', minWidth: 0,
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                  background: p.ora ? '#FFFBEB' : '#fff', border: `1px solid ${p.ora ? '#FDE68A' : PN.BORDER_HAIR}`, boxShadow: PN.CARD_SHADOW,
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                    fontSize: 13.5, fontWeight: 800,
                    background: p.fatto ? PN.GREEN : p.ora ? '#F59E0B' : PN.WHITE_FROST,
                    color: p.fatto || p.ora ? '#fff' : PN.MUTED,
                    animation: p.ora ? 'pnPanoPulse 1.8s ease-in-out infinite' : 'none',
                  }}>{p.fatto ? <_PanoIcon d={_ic.check} size={15} w={2.8} /> : i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700, color: PN.TEXT }}>{p.t}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: PN.MUTED }}>{p.s}</span>
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14, marginTop: 14, alignItems: 'start' }}>
              <_PanoCard titolo="Cosa guardiamo" sotto="Lo leggiamo dai dati di Fresh: non devi mandarci niente.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PANO_IDONEITA.map((r) => (
                    <div key={r.t} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
                      background: r.ok ? PN.WHITE_OFF : '#FFFBEB', border: `1px solid ${r.ok ? PN.BORDER_SOFT : '#FDE68A'}`,
                    }}>
                      <span style={{ color: r.ok ? PN.GREEN : PN.AMBER, display: 'inline-flex' }}><_PanoIcon d={r.ok ? _ic.check : _ic.alert} size={17} w={2.4} /></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: PN.TEXT }}>{r.t}</span>
                        <span style={{ display: 'block', fontSize: 12.5, color: r.ok ? PN.MUTED : PN.AMBER_TEXT }}>{r.v}</span>
                      </span>
                      {r.link && <a href={r.link.href} style={{ fontSize: 13, fontWeight: 700, color: PN.BRAND_TEXT, textDecoration: 'none', whiteSpace: 'nowrap' }}>{r.link.label} ›</a>}
                    </div>
                  ))}
                </div>
                <p style={{ margin: '12px 2px 0', fontSize: 13, color: PN.MUTED, lineHeight: 1.5 }}>Non ci sono soglie segrete: più usi Fresh e più il locale va bene in app, prima entri. Il profilo completo aiuta.</p>
              </_PanoCard>

              {!inviata ? (
                <_PanoCard titolo="La tua candidatura" sotto="Un minuto. La risposta arriva qui e per email.">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                      <div><_PanoLabel>Locale</_PanoLabel><_PanoStatico sotto="si cambia da Profilo → I tuoi locali">{locale.nome}</_PanoStatico></div>
                      <div><_PanoLabel>Chi segue Panorama</_PanoLabel><_PanoStatico sotto={(utente.ruoloLabel || 'Titolare').toLowerCase()}>{utente.nome || 'Mario Rossi'}</_PanoStatico></div>
                    </div>
                    <div>
                      <_PanoLabel>Email per la risposta</_PanoLabel>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email per la risposta" style={{
                        width: '100%', boxSizing: 'border-box', height: 42, padding: '0 12px', borderRadius: 10,
                        border: `1px solid ${PN.BORDER}`, fontSize: 15, fontFamily: 'inherit', color: PN.TEXT, outline: 'none', background: '#fff',
                      }} />
                    </div>
                    <div>
                      <_PanoLabel>Cosa vuoi ottenere</_PanoLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {PANO_OBIETTIVI.map((o) => <_PanoChip key={o} on={obiettivi.includes(o)} onClick={() => toggle(o)}>{o}</_PanoChip>)}
                      </div>
                    </div>
                    <div>
                      <_PanoLabel>Quanto pensi di spendere al mese</_PanoLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {PANO_BUDGET.map((o) => <_PanoChip key={o} on={budget === o} onClick={() => setBudget(budget === o ? null : o)}>{o}</_PanoChip>)}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 12, background: PN.WHITE_OFF, border: `1px solid ${PN.BORDER_SOFT}` }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: PN.TEXT }}>
                        <input type="checkbox" checked={regole} onChange={(e) => setRegole(e.target.checked)} style={{ width: 18, height: 18, accentColor: PN.PINK, margin: 0 }} />
                        <span style={{ flex: 1 }}>Ho letto le regole dei contenuti</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); setLeggi(!leggi); }} style={{ border: 'none', background: 'transparent', color: PN.BRAND_TEXT, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>{leggi ? 'Chiudi' : 'Leggile'}</button>
                      </label>
                      {leggi && (
                        <ol style={{ margin: '10px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: PN.MUTED, lineHeight: 1.45 }}>
                          {PANO_REGOLE.map((r) => <li key={r}>{r}</li>)}
                        </ol>
                      )}
                    </div>
                    <button type="button" onClick={invia} disabled={!puoInviare} style={{
                      height: 46, borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700,
                      cursor: puoInviare ? 'pointer' : 'not-allowed',
                      background: puoInviare ? PN.BTN_BRAND : PN.WHITE_FROST, color: puoInviare ? '#fff' : PN.MUTED_SOFT,
                      boxShadow: puoInviare ? '0 8px 18px -8px rgba(255,90,95,0.6), ' + PN.INSET_HIGHLIGHT_BRAND : 'none',
                    }}>Invia la candidatura</button>
                    <div style={{ fontSize: 12.5, color: PN.MUTED, textAlign: 'center', marginTop: -4 }}>Candidarsi è gratis. Se entri, paghi solo quello che compri, da un wallet prepagato.</div>
                  </div>
                </_PanoCard>
              ) : (
                <_PanoCard titolo="Cosa ci hai mandato" sotto={`Inviata oggi alle ${_hhmm(quando)}`}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[['Locale', c.locale || locale.nome], ['Chi segue Panorama', `${utente.nome || 'Mario Rossi'} · ${(utente.ruoloLabel || 'Titolare').toLowerCase()}`], ['Email', c.email], ['Cosa vuoi ottenere', (c.obiettivi || []).join(', ')], ['Al mese', c.budget || 'non indicato']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: `1px solid ${PN.BORDER_SOFT}`, fontSize: 14 }}>
                        <span style={{ color: PN.MUTED }}>{k}</span>
                        <span style={{ color: PN.TEXT, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                    <button type="button" onClick={() => window.byupWritePanorama(null)} style={{
                      height: 40, padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                      border: `1px solid ${PN.BORDER}`, background: PN.BTN_NEUTRAL, color: PN.TEXT,
                    }}>Ritira la candidatura</button>
                  </div>
                  <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, border: `1.5px dashed ${PN.BORDER_MED}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 180, fontSize: 13, color: PN.MUTED, lineHeight: 1.45 }}><b style={{ color: PN.TEXT }}>Prototipo.</b> Qui non c’è il team byup: salta le 48 ore e guarda cosa succede dopo.</span>
                    <button type="button" onClick={() => window.byupWritePanorama(Object.assign({}, c, { stato: 'approvata', approvataIl: new Date().toISOString() }))} style={{
                      height: 38, padding: '0 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                      background: PN.BTN_DARK, color: '#fff', boxShadow: PN.INSET_HIGHLIGHT_DARK,
                    }}>Simula l’approvazione</button>
                  </div>
                </_PanoCard>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }
  window.PnPanoramaCandidatura = PnPanoramaCandidatura;
})();

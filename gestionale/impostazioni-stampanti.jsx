// POS e integrazioni → Stampanti (P-124 · D-108).
//
// La sezione Impostazioni → Stampanti di P-101 non esiste più: le stampanti
// stanno qui, in POS e integrazioni, in un box come gli altri. Dentro: le
// stampanti collegate con il loro USO, il pulsante «Cerca stampante», e —
// quando le stampanti dei documenti sono più d'una — l'associazione dei POS.
//
// CHE COSA SI PUÒ DAVVERO CERCARE. Da una pagina web non esiste alcuna
// scansione della rete locale, e il browser non espone a JavaScript l'elenco
// delle stampanti che il sistema conosce: nessuna API lo permette, e la
// chiamata diretta a una stampante in LAN è bloccata dal contenuto misto.
// «Cerca stampante» quindi guarda CHI SI È PRESENTATO AL NOSTRO SERVER: una
// stampante che lo interroga (CloudPRNT, Server Direct Print) si annuncia da
// sé al primo sondaggio, col suo identificativo e il suo modello, e quella la
// troviamo davvero. La stampante di sistema della postazione non si cerca
// perché non si può elencare: c'è sempre, e si aggiunge senza cercarla.
// Fingere una scansione sarebbe una promessa che il primo sabato sera si
// scopre falsa: la schermata dice come si cerca e come far comparire una
// stampante che non si è ancora fatta viva.
//
// I DUE USI. Comande (e allora si assegnano le categorie, come in «Collega un
// dispositivo» di Personale: una categoria sta su una stampante sola) oppure
// documenti per il cliente — documento commerciale e scontrino di cortesia.
// Con una sola stampante per i documenti non c'è nulla da chiedere; da due in
// poi nasce la domanda «quale cassa stampa dove», e la risposta è
// un'associazione: un POS su una stampante sola, altrimenti lo stesso
// documento potrebbe uscire due volte in due punti del locale.
// Registro, coda e layout stanno in stampa.jsx.

function ImpStampantiBlocco() {
  const [reg, setReg] = React.useState(() => window.byupReadStampanti());
  const [toast, setToast] = React.useState(null);
  const [collega, setCollega] = React.useState(false);
  const [inProva, setInProva] = React.useState(null);
  React.useEffect(() => {
    const agg = () => setReg(window.byupReadStampanti());
    window.addEventListener('byup-stampanti-change', agg);
    window.addEventListener('storage', agg);
    return () => { window.removeEventListener('byup-stampanti-change', agg); window.removeEventListener('storage', agg); };
  }, []);
  const avvisa = (t) => { setToast(t); setTimeout(() => setToast(null), 2800); };
  const uso = (d) => d.use || 'comande';
  const comande = reg.devices.filter(d => uso(d) === 'comande');
  const documenti = reg.devices.filter(d => uso(d) === 'documenti');

  const prova = (d) => {
    if (d.connection_mode === 'browser') {
      const r = window.byupProvaStampaDocumenti();
      avvisa(r.esito === 'stampata' ? 'Documento di prova inviato alla stampa del browser' : 'Il browser ha bloccato la finestra di stampa');
      return;
    }
    setInProva(d.id);
    const r = window.byupProvaStampa(d, (esito) => {
      setInProva(null);
      avvisa(esito === 'ok' ? `Prova stampata da «${d.name}»` : esito === 'failed' ? `«${d.name}» non ha risposto: prova fallita` : 'Il browser ha bloccato la finestra di anteprima');
    });
    if (r.esito === 'bloccata') setInProva(null);
  };
  const scollega = (d) => { window.byupStampanteRimuovi(d.id); avvisa(`«${d.name}» scollegata`); };
  const autoPrint = (on) => {
    const next = { ...reg, venue_delivery_integrations: { ...reg.venue_delivery_integrations, auto_print_courtesy: on } };
    window.byupWriteStampanti(next); setReg(window.byupReadStampanti());
  };

  const Pill = ({ children, tono }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
      background: tono === 'ok' ? PN.GREEN_SOFT : tono === 'attesa' ? PN.AMBER_SOFT : tono === 'errore' ? '#FEF2F2' : '#F4F5F7',
      color: tono === 'ok' ? '#065F46' : tono === 'attesa' ? '#8A5A00' : tono === 'errore' ? '#991B1B' : PN.MUTED }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}/>{children}</span>
  );
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
  const relativo = (iso) => {
    if (!iso) return 'mai';
    const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s} s fa`;
    const m = Math.round(s / 60); if (m < 60) return `${m} min fa`;
    const h = Math.round(m / 60); if (h < 24) return `${h} ${h === 1 ? 'ora' : 'ore'} fa`;
    return fmt(iso);
  };

  // Una riga di stampante: che cos'è, com'è collegata, che cosa riceve.
  const Riga = ({ d }) => {
    const browser = d.connection_mode === 'browser';
    const st = window.PN_PRINT_STATI[d.connection_status] || window.PN_PRINT_STATI.never_configured;
    const proto = window.PN_PRINTER_PROTOCOLLI[d.printer_protocol] || {};
    const marca = (window.PN_PRINTER_MODELLI[d.printer_vendor] || {}).nome || '';
    const posAssociati = (d.pos_ids || []).map(id => (window.byupReadPosCensimento ? byupReadPosCensimento() : []).find(p => p.id === id)).filter(Boolean);
    return (
      <div data-stampante={d.id} data-uso={uso(d)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}`, background: browser ? '#FAFBFC' : PN.WHITE, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>
            {d.name} <span style={{ fontWeight: 500, color: PN.MUTED }}>· {marca ? `${marca} ` : ''}{d.device_model}</span>
          </div>
          <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 2, lineHeight: 1.5 }}>
            {browser
              ? 'Dal browser di questa postazione, sulla stampante che scegli nella finestra di stampa — di qualunque marca.'
              : <>{proto.label} · ultimo contatto {relativo(d.connection_checked_at)}</>}
            {uso(d) === 'comande'
              ? ((d.routing || []).length ? ` · comande: ${d.routing.map(window.pnRoutingLabel).join(', ')}` : ' · nessuna categoria instradata')
              : (posAssociati.length ? ` · POS: ${posAssociati.map(p => p.name).join(', ')}` : '')}
          </div>
          {!browser && (
            <div style={{ fontSize: 12, color: PN.MUTED, marginTop: 2 }}>
              {d.last_test_print_at ? <>Ultima prova {fmt(d.last_test_print_at)} · {d.last_test_print_result === 'ok' ? 'riuscita' : 'fallita'}</> : 'Nessuna prova di stampa'}
            </div>
          )}
        </div>
        {browser ? <Pill tono="ok">Sempre disponibile</Pill> : <Pill tono={st.tono}>{st.label}</Pill>}
        <ImpButton variant="secondary" disabled={inProva === d.id} onClick={() => prova(d)}>{inProva === d.id ? 'In coda…' : 'Prova di stampa'}</ImpButton>
        {!d.fisso && <button onClick={() => scollega(d)} className="pn-btn-feedback" title="Scollega" style={{ background: 'transparent', border: 'none', color: PN.MUTED, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>Scollega</button>}
      </div>
    );
  };
  const Gruppo = ({ titolo, nota, righe }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: PN.MUTED }}>{titolo}</span>
        <span style={{ fontSize: 12.5, color: PN.MUTED_SOFT }}>{nota}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{righe}</div>
    </div>
  );

  return (
    <ImpCard title="Stampanti"
      sub="Le comande escono dalle stampanti che interrogano il nostro server o compaiono sul monitor di cucina; i documenti per il cliente dal browser della postazione o da una stampante collegata."
      action={<ImpButton onClick={() => setCollega(true)}>Cerca stampante</ImpButton>}>

      <Gruppo titolo="Comande" nota={comande.length ? 'ricevono le categorie che assegni' : ''}
        righe={comande.length
          ? comande.map(d => <Riga key={d.id} d={d}/>)
          : [<div key="v" style={{ padding: '16px', borderRadius: 11, border: `1px dashed ${PN.BORDER}`, background: '#FAFBFC', fontSize: 14, color: PN.MUTED, lineHeight: 1.5 }}>
              Nessuna stampante per le comande: escono sul monitor di cucina. Con «Cerca stampante» ne aggiungi una.
            </div>]}/>

      <Gruppo titolo="Documenti per il cliente" nota="documento commerciale e scontrino di cortesia"
        righe={documenti.map(d => <Riga key={d.id} d={d}/>)}/>

      {/* Da due stampanti per i documenti in su: quale cassa stampa dove. */}
      {documenti.length > 1 && <ImpPosStampanti documenti={documenti} onFatto={avvisa}/>}

      <div style={{ marginTop: 4, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}` }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: comande.length ? 'pointer' : 'not-allowed', opacity: comande.length ? 1 : 0.6 }}>
          <input type="checkbox" data-auto-print checked={!!reg.venue_delivery_integrations.auto_print_courtesy} disabled={!comande.length}
            onChange={e => autoPrint(e.target.checked)} style={{ marginTop: 3, accentColor: PN.PINK_DARK }}/>
          <span>
            <span style={{ fontSize: 14, fontWeight: 700, color: PN.TEXT }}>Ordini da piattaforma: documento di cortesia in coda alla comanda</span>
            <span style={{ display: 'block', fontSize: 12.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5 }}>
              Per Glovo, Deliveroo e Uber Eats il documento esce sulla stampante di cucina collegata al server, subito dopo la comanda: dal browser non può avvenire, perché la stampa dal browser vuole una persona che conferma. Le piattaforme sono predisposte, non attive: la casella vale quando entreranno con gli accordi{comande.length ? '' : ' — si accende quando c\'è una stampante di cucina collegata'}.
            </span>
          </span>
        </label>
      </div>

      <div style={{ marginTop: 12, padding: '10px 13px', borderRadius: 9, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5 }}>
        Nessuna via passa dalla pagina web alla stampante in rete locale, e il ponte Bluetooth attraverso l'App Staff è rinviato oltre l'MVP. Le stampanti che passano dal cloud di un terzo (Sunmi e simili) non sono compatibili finché quel terzo non è valutato come responsabile del trattamento. Nel prototipo la stampa dal browser è vera; il rilevamento, lo stato in linea e l'esito della prova sono simulati.
      </div>

      {collega && <ImpCollegaStampanteModal onClose={() => setCollega(false)} onCollegata={(d) => { setCollega(false); avvisa(`«${d.name}» collegata`); }}/>}
      {toast && (
        <div style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: PN.TEXT, color: '#fff', padding: '10px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, zIndex: 90, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>{toast}</div>
      )}
    </ImpCard>
  );
}

// ─── Quale POS stampa dove ──────────────────────────────────────────────────
// Compare solo quando le stampanti per i documenti sono più d'una, perché
// prima la domanda non esiste. Ogni POS censito (P-105) sceglie la sua
// stampante, e ne ha UNA: assegnarlo a un'altra lo toglie dalla precedente,
// che è il modo in cui il vincolo si fa rispettare senza spiegarlo.
function ImpPosStampanti({ documenti, onFatto }) {
  const [, ridisegna] = React.useState(0);
  React.useEffect(() => {
    const ri = () => ridisegna(x => x + 1);
    window.addEventListener('byup-stampanti-change', ri);
    window.addEventListener('byup-pos-censimento', ri);
    return () => { window.removeEventListener('byup-stampanti-change', ri); window.removeEventListener('byup-pos-censimento', ri); };
  }, []);
  const pos = window.byupReadPosCensimento ? byupReadPosCensimento().filter(p => p.fiscal_link_status !== 'unlinked') : [];
  if (!pos.length) return null;
  const associa = (p, printerId) => {
    window.byupAssociaPos(p.id, printerId);
    const st = documenti.find(d => d.id === printerId);
    onFatto && onFatto(`${p.name} stampa su «${st ? st.name : ''}»`);
  };
  return (
    <div data-pos-stampanti style={{ marginBottom: 14, padding: '13px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER}`, borderLeft: `3px solid ${PN.PINK}`, background: PN.WHITE }}>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: PN.TEXT }}>Quale POS stampa dove</div>
      <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 2, marginBottom: 12, lineHeight: 1.5 }}>
        Hai più di una stampante per i documenti: ogni strumento di pagamento stampa sulla sua, e su una sola — altrimenti lo stesso scontrino uscirebbe due volte, in due punti del locale. Assegnandone uno a una stampante lo togli dalla precedente.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pos.map(p => {
          const nat = (window.PN_POS_NATURE || {})[p.nature] || {};
          const scelta = window.byupPosStampante(p.id);
          return (
            <div key={p.id} data-pos={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: PN.TEXT }}>{p.name}</span>
                <span style={{ fontSize: 12.5, color: PN.MUTED }}> · {nat.label || p.nature}{p.user ? ` · ${p.user}` : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {documenti.map(d => {
                  const on = !!scelta && scelta.id === d.id;
                  return (
                    <button key={d.id} data-associa={`${p.id}:${d.id}`} onClick={() => associa(p, d.id)} style={{
                      padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                      background: on ? PN.TEXT : PN.WHITE, color: on ? PN.WHITE : PN.TEXT,
                      fontSize: 13.5, fontWeight: on ? 700 : 600, whiteSpace: 'nowrap',
                      transition: 'background 150ms ease-out, border-color 150ms ease-out',
                    }}>{d.name}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── «Cerca stampante»: il popup ────────────────────────────────────────────
// Quattro passi. (1) La ricerca, che guarda chi si è presentato al nostro
// server, e la postazione, che c'è sempre. (2) Il nome, proposto dal modello e
// riscrivibile. (3) L'uso: comande o documenti. (4) Le categorie, se è per le
// comande — le stesse di «Collega un dispositivo» in Personale, con quelle già
// prese da un'altra stampante spente e col nome di chi le tiene.
function ImpCollegaStampanteModal({ onClose, onCollegata }) {
  const SEDI = [{ id: 'cp', label: 'Cacio e Pepe · Trastevere' }, { id: 'co', label: 'Cacio e Pepe · Ostiense' }];
  const [passo, setPasso] = React.useState(1);
  const [cerca, setCerca] = React.useState('idle');       // idle | cerco | fatto
  const [trovate, setTrovate] = React.useState([]);
  const [scelta, setScelta] = React.useState(null);       // candidata | { browser: true }
  const [nome, setNome] = React.useState('');
  const [uso, setUso] = React.useState('comande');
  const [sede, setSede] = React.useState('cp');
  const [routing, setRouting] = React.useState(() => new Set());

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  // La ricerca parte da sola all'apertura: chi ha premuto «Cerca stampante»
  // ha già detto che cosa vuole, e fargli premere un secondo pulsante uguale
  // sarebbe chiedergli la stessa cosa due volte.
  React.useEffect(() => { avviaRicerca(); }, []);
  const avviaRicerca = () => {
    setCerca('cerco'); setTrovate([]);
    setTimeout(() => { setTrovate(window.byupStampantiRilevate()); setCerca('fatto'); }, 1600);
  };

  const occupate = window.byupRoutingOccupato(null);
  const proto = (c) => (window.PN_PRINTER_PROTOCOLLI[c.printer_protocol] || {});
  const marca = (c) => (window.PN_PRINTER_MODELLI[c.printer_vendor] || {}).nome || c.printer_vendor;
  const relativo = (iso) => {
    const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s} s fa`;
    const m = Math.round(s / 60); return m < 60 ? `${m} min fa` : `${Math.round(m / 60)} ore fa`;
  };
  const scegli = (c) => {
    setScelta(c);
    setNome(c.browser ? 'Questa postazione' : (c.nome_proposto || c.device_model));
    setUso(c.browser ? 'documenti' : 'comande');
    setPasso(2);
  };
  const conferma = () => {
    const d = scelta.browser
      ? { id: 'prn-' + Date.now().toString(36), type: 'printer', name: nome.trim() || 'Postazione', device_model: 'Stampante di sistema',
          printer_vendor: 'other', connection_mode: 'browser', printer_protocol: null, cloud_client_id: null,
          connection_status: null, connection_checked_at: null, use: 'documenti', pos_ids: [], routing: [], venue_id: sede,
          last_test_print_at: null, last_test_print_result: null }
      : { id: 'prn-' + Date.now().toString(36), type: 'printer', name: nome.trim() || scelta.device_model, device_model: scelta.device_model,
          printer_vendor: scelta.printer_vendor, connection_mode: 'server_polling', printer_protocol: scelta.printer_protocol,
          cloud_client_id: scelta.cloud_client_id, poll_interval_seconds: 5, connection_status: 'online',
          connection_checked_at: new Date().toISOString(), venue_id: sede, use: uso,
          pos_ids: [], routing: uso === 'comande' ? [...routing] : [], last_test_print_at: null, last_test_print_result: null };
    window.byupStampanteAggiungi(d, scelta.browser ? null : scelta.id);
    onCollegata(d);
  };
  const prontoPasso2 = !!nome.trim() && (uso === 'documenti' || routing.size > 0 || scelta.browser);

  const inp = { width: '100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 9, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: PN.WHITE };
  const url = (c) => (proto(c).url || '') + sede;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} data-collega-stampante style={{ ...IMP_MODAL_PANEL, width: 620, maxWidth: '100%', position: 'relative', maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display: 'flex', flexDirection: 'column' }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>{passo === 1 ? 'Cerca stampante' : 'Aggiungi la stampante'}</div>
          <div style={IMP_MODAL_SUB}>
            {passo === 1
              ? 'Cerchiamo le stampanti che si sono presentate al nostro server, e la stampante di questa postazione.'
              : `${scelta && scelta.browser ? 'Stampante di sistema di questa postazione' : `${marca(scelta)} ${scelta.device_model}`} · dalle il nome che vuoi e dille che cosa deve stampare.`}
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>

        <div style={{ padding: '18px 24px 22px', overflow: 'auto', flex: 1 }}>
          {passo === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cerca === 'cerco' && (
                <div data-cerca="cerco" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 11, background: PN.AMBER_SOFT, color: '#8A5A00', fontSize: 14, fontWeight: 600 }}>
                  <style>{`@keyframes impCercaSpin { to { transform: rotate(360deg); } }`}</style>
                  <span style={{ width: 14, height: 14, borderRadius: 999, border: '2px solid rgba(138,90,0,0.3)', borderTopColor: '#8A5A00', animation: 'impCercaSpin 0.7s linear infinite', flexShrink: 0 }}/>
                  Sto cercando le stampanti che hanno contattato il server…
                </div>
              )}

              {cerca === 'fatto' && (
                <React.Fragment>
                  <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: PN.MUTED }}>
                    {trovate.length ? `${trovate.length} stampant${trovate.length === 1 ? 'e trovata' : 'i trovate'}` : 'Nessuna stampante nuova'}
                  </div>
                  {trovate.map(c => (
                    <button key={c.id} data-trovata={c.id} onClick={() => scegli(c)} className="pn-btn-feedback" style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                      padding: '13px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER}`, background: PN.WHITE,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F4F5F7', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 18 }}>🖨</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>{marca(c)} {c.device_model}</div>
                        <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 2 }}>
                          {proto(c).label} · si è presentata {relativo(c.visto_at)} · <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{c.cloud_client_id}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: PN.PINK_DARK, flexShrink: 0 }}>Aggiungi →</span>
                    </button>
                  ))}

                  {/* La postazione non si cerca: c'è sempre. */}
                  <button data-trovata="browser" onClick={() => scegli({ browser: true })} className="pn-btn-feedback" style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                    padding: '13px 14px', borderRadius: 11, border: `1px dashed ${PN.BORDER}`, background: '#FAFBFC',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 17 }}>💻</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>Questa postazione</div>
                      <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 2 }}>Stampa dal browser sulla stampante che scegli nella finestra di stampa, di qualunque marca. Solo documenti.</div>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: PN.PINK_DARK, flexShrink: 0 }}>Aggiungi →</span>
                  </button>

                  {/* Come si cerca, detto per intero: è il punto dove si mente
                      più facilmente, promettendo una scansione che non esiste. */}
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.55 }}>
                    <b style={{ color: PN.TEXT }}>Non trovi la tua stampante?</b> Da una pagina web non esiste una scansione della rete: quello che si può fare — e che facciamo — è vedere <b>chi ha contattato il nostro server</b>. Una stampante compare qui appena le scrivi il nostro indirizzo nella sua pagina di configurazione (Star con CloudPRNT, Epson con Server Direct Print):
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {Object.entries(window.PN_PRINTER_PROTOCOLLI).map(([k, p]) => (
                        <span key={k} style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, padding: '5px 9px', borderRadius: 7, background: '#F4F5F7', border: `1px solid ${PN.BORDER_SOFT}`, color: PN.TEXT }}>{p.breve}: {p.url}{sede}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <ImpButton variant="secondary" onClick={avviaRicerca} style={{ padding: '7px 14px', fontSize: 13.5 }}>Cerca di nuovo</ImpButton>
                    </div>
                    <div style={{ marginTop: 8 }}>Qualunque altra stampante — di qualunque marca, USB o di rete — stampa i documenti dal browser: si aggiunge come «Questa postazione», e la scegli nella finestra di stampa.</div>
                  </div>
                </React.Fragment>
              )}
            </div>
          )}

          {passo === 2 && scelta && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ImpField label="Nome della stampante" hint="Come la chiamerete: Cucina, Pizzeria, Bar, Cassa 2…">
                <input value={nome} onChange={e => setNome(e.target.value)} style={inp} autoFocus/>
              </ImpField>

              <ImpField label="Che cosa stampa">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(window.PN_PRINT_USI).map(([k, u]) => {
                    const on = uso === k;
                    // La postazione non stampa comande: la stampa dal browser
                    // vuole una persona che conferma, e una comanda deve poter
                    // uscire mentre nessuno guarda uno schermo.
                    const vietato = scelta.browser && k === 'comande';
                    return (
                      <button key={k} data-uso={k} disabled={vietato} onClick={() => setUso(k)} style={{
                        padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: vietato ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`, background: on ? '#F4F5F7' : PN.WHITE, opacity: vietato ? 0.5 : 1,
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>{u.label}</div>
                        <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45 }}>
                          {vietato ? 'Non da qui: una comanda deve uscire anche quando nessuno guarda uno schermo.' : u.nota}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ImpField>

              {!scelta.browser && (
                <ImpField label="Sede">
                  <select value={sede} onChange={e => setSede(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {SEDI.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </ImpField>
              )}

              {uso === 'comande' && !scelta.browser && (
                <ImpField label="Categorie da instradare" hint="Questa stampante riceve le comande di queste categorie. Una categoria sta su una stampante sola: quelle già assegnate sono spente e dicono dove stanno.">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {window.PN_MENU_CATEGORIE.map(m => {
                      const chiavi = m.categories.map(c => `${m.id}:${c.id}`);
                      const libere = chiavi.filter(k => !occupate.has(k));
                      const tutte = libere.length > 0 && libere.every(k => routing.has(k));
                      return (
                        <div key={m.id} style={{ border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, padding: '10px 12px', background: '#FAFBFC' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: PN.TEXT }}>{m.label}</span>
                            {libere.length > 0 && (
                              <button onClick={() => setRouting(prev => { const s = new Set(prev); tutte ? libere.forEach(k => s.delete(k)) : libere.forEach(k => s.add(k)); return s; })}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: PN.MUTED }}>
                                {tutte ? 'Deseleziona' : 'Tutte'}
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {m.categories.map(c => {
                              const k = `${m.id}:${c.id}`; const da = occupate.get(k); const on = routing.has(k);
                              return (
                                <button key={k} disabled={!!da} title={da ? `Già assegnata a «${da}»` : undefined}
                                  onClick={() => setRouting(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; })}
                                  style={{
                                    padding: '5px 11px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: da ? 'default' : 'pointer',
                                    border: `1.5px solid ${on ? PN.TEXT : PN.BORDER_SOFT}`, background: on ? PN.TEXT : da ? PN.BG : PN.WHITE,
                                    color: on ? PN.WHITE : da ? PN.MUTED_SOFT : PN.TEXT,
                                  }}>{c.label}</button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ImpField>
              )}

              {uso === 'documenti' && (
                <div style={{ padding: '11px 13px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 13, color: PN.MUTED, lineHeight: 1.55 }}>
                  {window.byupStampantiDocumenti().length >= 1
                    ? <>Avrai <b style={{ color: PN.TEXT }}>{window.byupStampantiDocumenti().length + 1} stampanti</b> per i documenti: alla fine ti chiediamo quale POS stampa su quale, perché uno scontrino deve uscire in un punto solo.</>
                    : 'Documento commerciale e scontrino di cortesia usciranno da qui dopo il pagamento.'}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <ImpButton variant="ghost" onClick={() => { setScelta(null); setPasso(1); }}>Indietro</ImpButton>
                <ImpButton variant="primary" disabled={!prontoPasso2} onClick={conferma}>Aggiungi la stampante</ImpButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.ImpStampantiBlocco = ImpStampantiBlocco;
window.ImpCollegaStampanteModal = ImpCollegaStampanteModal;

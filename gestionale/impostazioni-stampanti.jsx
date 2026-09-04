// POS e integrazioni → Stampanti (P-124 · D-108).
//
// La sezione Impostazioni → Stampanti di P-101 non esiste più: le stampanti
// stanno qui, in POS e integrazioni, come blocco con il popup «Collega
// stampante». Il blocco elenca le stampanti delle comande — quelle che
// interrogano il nostro server: Star con CloudPRNT, Epson con Server Direct
// Print — con stato del collegamento, ultimo contatto, categorie instradate e
// ultima prova; la riga dei documenti, che escono dal browser di qualunque
// postazione su qualunque stampante del sistema, con la loro prova; e la
// casella della stampa automatica del documento di cortesia per gli ordini da
// piattaforma, riscritta come documento in coda alla comanda sulla stampante
// di cucina (dal browser non può avvenire: window.print() vuole una persona).
// Nessuna ricerca automatica di stampanti in rete: da una pagina web non
// esiste, e con questo disegno non serve — è la stampante a presentarsi.
// Registro, coda e layout stanno in stampa.jsx.

function ImpStampantiBlocco() {
  const [reg, setReg] = React.useState(() => window.byupReadStampanti());
  const [toast, setToast] = React.useState(null);
  const [collega, setCollega] = React.useState(false);
  const [inProva, setInProva] = React.useState(null); // id della stampante con la prova in corso
  React.useEffect(() => {
    const agg = () => setReg(window.byupReadStampanti());
    window.addEventListener('byup-stampanti-change', agg);
    window.addEventListener('storage', agg);
    return () => { window.removeEventListener('byup-stampanti-change', agg); window.removeEventListener('storage', agg); };
  }, []);
  const avvisa = (t) => { setToast(t); setTimeout(() => setToast(null), 2800); };
  const comande = reg.devices.filter(d => d.connection_mode === 'server_polling');

  const prova = (d) => {
    setInProva(d.id);
    const r = window.byupProvaStampa(d, (esito) => {
      setInProva(null);
      avvisa(esito === 'ok' ? `Comanda di prova stampata da «${d.name}»` : esito === 'failed' ? `«${d.name}» non ha risposto: prova fallita` : 'Il browser ha bloccato la finestra di anteprima');
    });
    if (r.esito === 'bloccata') setInProva(null);
  };
  const provaDocumenti = () => {
    const r = window.byupProvaStampaDocumenti();
    avvisa(r.esito === 'stampata' ? 'Pre-conto di prova inviato alla stampa del browser' : 'Il browser ha bloccato la finestra di stampa');
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

  return (
    <ImpCard title="Stampanti"
      sub="Le comande escono dalle stampanti che interrogano il nostro server (Star CloudPRNT, Epson Server Direct Print) o compaiono sul monitor di cucina. Pre-conto e documento di cortesia escono dal browser della postazione, su qualunque stampante del dispositivo."
      action={<ImpButton onClick={() => setCollega(true)}>Collega stampante</ImpButton>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {comande.length === 0 && (
          <div style={{ padding: '18px 16px', borderRadius: 11, border: `1px dashed ${PN.BORDER}`, background: '#FAFBFC', fontSize: 14, color: PN.MUTED, lineHeight: 1.5 }}>
            Nessuna stampante di cucina collegata: le comande compaiono sul monitor di cucina. Con «Collega stampante» aggiungi una Star o una Epson dei modelli ammessi.
          </div>
        )}
        {comande.map(d => {
          const st = window.PN_PRINT_STATI[d.connection_status] || window.PN_PRINT_STATI.never_configured;
          const proto = window.PN_PRINTER_PROTOCOLLI[d.printer_protocol] || {};
          const marca = (window.PN_PRINTER_MODELLI[d.printer_vendor] || {}).nome || d.printer_vendor;
          return (
            <div key={d.id} data-stampante={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>{d.name} <span style={{ fontWeight: 500, color: PN.MUTED }}>· {marca} {d.device_model}</span></div>
                <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 2, lineHeight: 1.5 }}>
                  {proto.label} · ultimo contatto {relativo(d.connection_checked_at)}
                  {(d.routing || []).length ? ` · comande: ${d.routing.map(window.pnRoutingLabel).join(', ')}` : ' · nessuna categoria instradata'}
                </div>
                <div style={{ fontSize: 12, color: PN.MUTED, marginTop: 2 }}>
                  {d.last_test_print_at ? <>Ultima prova {fmt(d.last_test_print_at)} · {d.last_test_print_result === 'ok' ? 'riuscita' : 'fallita'}</> : 'Nessuna prova di stampa'}
                </div>
              </div>
              <Pill tono={st.tono}>{st.label}</Pill>
              <ImpButton variant="secondary" disabled={inProva === d.id} onClick={() => prova(d)}>{inProva === d.id ? 'In coda…' : 'Prova di stampa'}</ImpButton>
              <button onClick={() => scollega(d)} className="pn-btn-feedback" title="Scollega" style={{ background: 'transparent', border: 'none', color: PN.MUTED, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>Scollega</button>
            </div>
          );
        })}

        {/* I documenti: dal browser, qualunque stampante. Nessun registro. */}
        <div data-stampante="browser" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}`, background: '#FAFBFC', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>Pre-conto e documento di cortesia</div>
            <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 2, lineHeight: 1.5 }}>
              Dal browser della postazione, sulla stampante che scegli nella finestra di stampa: USB, di rete o Bluetooth accoppiata al sistema, di qualunque marca (Epson, Star, Custom, Bixolon, Citizen, le ESC/POS economiche). Al tavolo, dal telefono, il cliente riceve la ricevuta elettronica o ritira il foglio al banco.
            </div>
          </div>
          <Pill tono="ok">Sempre disponibile</Pill>
          <ImpButton variant="secondary" onClick={provaDocumenti}>Prova la stampa dei documenti</ImpButton>
        </div>
      </div>

      {/* La stampa automatica per le piattaforme: non dal browser. */}
      <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}` }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: comande.length ? 'pointer' : 'not-allowed', opacity: comande.length ? 1 : 0.6 }}>
          <input type="checkbox" data-auto-print checked={!!reg.venue_delivery_integrations.auto_print_courtesy} disabled={!comande.length}
            onChange={e => autoPrint(e.target.checked)} style={{ marginTop: 3, accentColor: PN.PINK_DARK }}/>
          <span>
            <span style={{ fontSize: 14, fontWeight: 700, color: PN.TEXT }}>Ordini da piattaforma: documento di cortesia in coda alla comanda</span>
            <span style={{ display: 'block', fontSize: 12.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5 }}>
              Per Glovo, Deliveroo e Uber Eats il documento di cortesia esce sulla stampante di cucina collegata al server, subito dopo la comanda: dal browser non può avvenire, perché la stampa dal browser vuole una persona che conferma. Le piattaforme sono predisposte, non attive: la casella vale quando entreranno con gli accordi. È venue_delivery_integrations.auto_print_courtesy, una per piattaforma{comande.length ? '' : ' — si accende quando c\'è una stampante di cucina collegata'}.
            </span>
          </span>
        </label>
      </div>

      <div style={{ marginTop: 12, padding: '10px 13px', borderRadius: 9, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5 }}>
        Nessuna via passa dalla pagina web alla stampante in rete locale, e il ponte Bluetooth attraverso l'App Staff è rinviato oltre l'MVP. Le stampanti che passano dal cloud di un terzo (Sunmi e simili) non sono compatibili finché quel terzo non è valutato come responsabile del trattamento. Nel prototipo la stampa dal browser è vera; il primo contatto della stampante, lo stato in linea e l'esito della prova sono simulati.
      </div>

      {collega && <ImpCollegaStampanteModal onClose={() => setCollega(false)} onCollegata={(d) => { setCollega(false); avvisa(`«${d.name}» collegata: le comande delle sue categorie escono da lì`); }}/>}
      {toast && (
        <div style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: PN.TEXT, color: '#fff', padding: '10px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, zIndex: 90, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>{toast}</div>
      )}
    </ImpCard>
  );
}

// Il popup «Collega stampante», solo per le comande. Quattro passi: marca e
// modello; l'indirizzo del nostro server e la chiave da copiare nella pagina
// di configurazione della stampante, con l'attesa del primo contatto; le
// categorie da instradare e la sede; la prova di stampa con l'esito.
function ImpCollegaStampanteModal({ onClose, onCollegata }) {
  const SEDI = [{ id: 'cp', label: 'Cacio e Pepe · Trastevere' }, { id: 'co', label: 'Cacio e Pepe · Ostiense' }];
  const [passo, setPasso] = React.useState(1);
  const [marca, setMarca] = React.useState('star');
  const [modello, setModello] = React.useState(window.PN_PRINTER_MODELLI.star.modelli[0]);
  const [nome, setNome] = React.useState('');
  const [sede, setSede] = React.useState('cp');
  const [contatto, setContatto] = React.useState('attesa'); // 'attesa' | 'ok'
  const [dev, setDev] = React.useState(null);
  const [routing, setRouting] = React.useState(() => new Set());
  const [prova, setProva] = React.useState(null); // null | 'incorso' | 'ok' | 'failed' | 'bloccata'
  const proto = window.PN_PRINTER_PROTOCOLLI[window.PN_PRINTER_MODELLI[marca].protocollo];
  const protocollo = window.PN_PRINTER_MODELLI[marca].protocollo;
  // La chiave con cui la stampante si presenta: per CloudPRNT è il MAC, che
  // arriva da lei al primo sondaggio; per SDP è l'identificativo che si
  // imposta sulla stampante. Nel mock si genera qui.
  const chiave = React.useMemo(() => protocollo === 'cloudprnt'
    ? '00:11:62:' + [0, 0, 0].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':')
    : `${sede}-${(nome || modello).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.floor(10 + Math.random() * 89)}`, [protocollo, sede, nome, modello]);
  const url = proto.url + sede;

  React.useEffect(() => { const c = () => {}; document.addEventListener('keydown', c); return () => document.removeEventListener('keydown', c); }, []);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Il primo contatto, simulato: nel prodotto è il primo POST (CloudPRNT) o la
  // prima richiesta (SDP) della stampante al nostro server.
  React.useEffect(() => {
    if (passo !== 2 || contatto === 'ok') return;
    const t = setTimeout(() => {
      const d = window.byupStampanteAggiungi({
        id: 'prn-' + Date.now().toString(36), type: 'printer', name: (nome || modello).trim(), device_model: modello, printer_vendor: marca,
        connection_mode: 'server_polling', printer_protocol: protocollo, cloud_client_id: chiave, poll_interval_seconds: 5,
        connection_status: 'online', connection_checked_at: new Date().toISOString(), venue_id: sede,
        routing: [], last_test_print_at: null, last_test_print_result: null,
      });
      setDev(d); setContatto('ok');
    }, 2200);
    return () => clearTimeout(t);
  }, [passo]);

  const occupate = window.byupRoutingOccupato(dev && dev.id);
  const salvaRouting = () => { if (dev) window.byupStampantePatch(dev.id, { routing: [...routing], venue_id: sede }); setPasso(4); };
  const lanciaProva = () => {
    if (!dev) return;
    setProva('incorso');
    const r = window.byupProvaStampa(window.byupReadStampanti().devices.find(d => d.id === dev.id) || dev, (esito) => setProva(esito));
    if (r.esito === 'bloccata') setProva('bloccata');
  };
  const copia = (t) => { try { navigator.clipboard && navigator.clipboard.writeText(t); } catch (e) {} };

  const inp = { width: '100%', padding: '9px 11px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: PN.WHITE };
  const Passi = () => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {['Marca e modello', 'Configurazione', 'Categorie e sede', 'Prova di stampa'].map((l, i) => (
        <div key={l} style={{ flex: 1, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: passo === i + 1 ? PN.TEXT : passo > i + 1 ? PN.GREEN : PN.MUTED_SOFT, borderTop: `3px solid ${passo === i + 1 ? PN.PINK : passo > i + 1 ? PN.GREEN : PN.BORDER_SOFT}`, paddingTop: 6 }}>{l}</div>
      ))}
    </div>
  );
  const mono = { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13.5, padding: '8px 10px', borderRadius: 8, background: '#F4F5F7', border: `1px solid ${PN.BORDER_SOFT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} data-collega-stampante style={{ ...IMP_MODAL_PANEL, width: 560, maxWidth: '100%', position: 'relative', maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display: 'flex', flexDirection: 'column' }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>Collega stampante</div>
          <div style={IMP_MODAL_SUB}>Per le comande: una stampante che interroga il nostro server. I documenti non hanno bisogno di nulla.</div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>
        <div style={{ padding: '18px 24px 22px', overflow: 'auto', flex: 1 }}>
          <Passi/>

          {passo === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ImpField label="Marca">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(window.PN_PRINTER_MODELLI).map(([k, m]) => (
                    <button key={k} onClick={() => { setMarca(k); setModello(m.modelli[0]); }} style={{ padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${marca === k ? PN.TEXT : PN.BORDER}`, background: marca === k ? '#F4F5F7' : PN.WHITE }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>{m.nome}</div>
                      <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 2 }}>{window.PN_PRINTER_PROTOCOLLI[m.protocollo].label}</div>
                    </button>
                  ))}
                </div>
              </ImpField>
              <ImpField label="Modello">
                <select value={modello} onChange={e => setModello(e.target.value)} style={inp}>
                  {window.PN_PRINTER_MODELLI[marca].modelli.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </ImpField>
              <ImpField label="Nome in Byup" hint="Come la chiamerete: Cucina, Pizzeria, Bar…">
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder={modello} style={inp}/>
              </ImpField>
              <div style={{ fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5, padding: '10px 12px', borderRadius: 9, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}` }}>
                Solo i modelli degli elenchi ufficiali dei due protocolli. Non in elenco: la Epson TM-T20III (non ha Server Direct Print), le stampanti Bluetooth e quelle che passano dal cloud di un terzo (Sunmi e simili). Qualunque stampante può comunque stampare pre-conto e documento di cortesia dal browser.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ImpButton variant="primary" onClick={() => setPasso(2)}>Avanti</ImpButton></div>
            </div>
          )}

          {passo === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, color: PN.TEXT, lineHeight: 1.55 }}>
                Apri la pagina di configurazione della stampante ({proto.label}) e inserisci l'indirizzo del nostro server{protocollo === 'server_direct_print' ? ' e l\'identificativo' : ''}. Con {proto.label} la stampante interroga il server ogni pochi secondi: è lei a chiamare noi, mai il contrario, e non serve nessun indirizzo di rete.
              </div>
              <ImpField label="Indirizzo del server">
                <div style={mono}><span>{url}</span><button onClick={() => copia(url)} className="pn-btn-feedback" style={{ border: 'none', background: 'transparent', color: PN.PINK_DARK, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5 }}>Copia</button></div>
              </ImpField>
              <ImpField label={protocollo === 'cloudprnt' ? 'Identificativo (indirizzo MAC)' : 'Identificativo da impostare'} hint={protocollo === 'cloudprnt' ? 'Con CloudPRNT è l\'indirizzo MAC della stampante, che lei presenta da sé al primo sondaggio: qui compare quello atteso.' : 'Con Server Direct Print è l\'ID del server che scrivi nella pagina di configurazione della stampante.'}>
                <div style={mono}><span>{chiave}</span><button onClick={() => copia(chiave)} className="pn-btn-feedback" style={{ border: 'none', background: 'transparent', color: PN.PINK_DARK, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5 }}>Copia</button></div>
              </ImpField>
              <div data-contatto={contatto} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 10, background: contatto === 'ok' ? PN.GREEN_SOFT : PN.AMBER_SOFT, color: contatto === 'ok' ? '#065F46' : '#8A5A00', fontSize: 13.5, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}/>
                {contatto === 'ok' ? `In linea: «${dev.name}» ha contattato il server.` : 'In attesa del primo contatto della stampante…'}
                {contatto !== 'ok' && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500 }}>nel prototipo arriva da solo</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <ImpButton variant="ghost" onClick={() => setPasso(1)} disabled={contatto === 'ok'}>Indietro</ImpButton>
                <ImpButton variant="primary" onClick={() => setPasso(3)} disabled={contatto !== 'ok'}>Avanti</ImpButton>
              </div>
            </div>
          )}

          {passo === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ImpField label="Sede">
                <select value={sede} onChange={e => setSede(e.target.value)} style={inp}>{SEDI.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </ImpField>
              <ImpField label="Categorie da instradare" hint="Le comande di queste categorie escono da questa stampante. Una categoria sta su una stampante sola: quelle già assegnate sono spente e dicono dove stanno.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {window.PN_MENU_CATEGORIE.map(m => (
                    <div key={m.id}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: PN.MUTED, marginBottom: 6 }}>{m.label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {m.categories.map(c => {
                          const k = `${m.id}:${c.id}`; const da = occupate.get(k); const on = routing.has(k);
                          return (
                            <button key={k} disabled={!!da} title={da ? `Già assegnata a «${da}»` : undefined}
                              onClick={() => setRouting(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; })}
                              style={{ padding: '5px 11px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: da ? 'default' : 'pointer',
                                border: `1.5px solid ${on ? PN.TEXT : PN.BORDER_SOFT}`, background: on ? PN.TEXT : da ? PN.BG : PN.WHITE, color: on ? PN.WHITE : da ? PN.MUTED_SOFT : PN.TEXT }}>{c.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ImpField>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <ImpButton variant="ghost" onClick={() => setPasso(2)}>Indietro</ImpButton>
                <ImpButton variant="primary" onClick={salvaRouting} disabled={routing.size === 0}>Avanti</ImpButton>
              </div>
            </div>
          )}

          {passo === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, color: PN.TEXT, lineHeight: 1.55 }}>
                Una comanda di prova va in coda per «{dev && dev.name}»: la stampante la ritira al prossimo sondaggio e conferma. L'esito resta a registro (last_test_print_at, last_test_print_result).
              </div>
              <div data-prova={prova || 'no'} style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${PN.BORDER_SOFT}`, background: prova === 'ok' ? PN.GREEN_SOFT : prova === 'failed' ? '#FEF2F2' : '#FAFBFC', fontSize: 13.5, fontWeight: 600, color: prova === 'ok' ? '#065F46' : prova === 'failed' ? '#991B1B' : PN.MUTED }}>
                {prova === 'incorso' ? 'In coda… la stampante sta ritirando il lavoro' : prova === 'ok' ? 'Stampata: la stampante ha confermato il lavoro.' : prova === 'failed' ? 'Fallita: la stampante non ha ritirato il lavoro. Controlla che sia accesa e in rete.' : prova === 'bloccata' ? 'Il browser ha bloccato la finestra di anteprima.' : 'Nessuna prova ancora.'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <ImpButton variant="secondary" onClick={lanciaProva} disabled={prova === 'incorso'}>{prova === 'ok' || prova === 'failed' ? 'Ripeti la prova' : 'Stampa la comanda di prova'}</ImpButton>
                <ImpButton variant="primary" onClick={() => onCollegata(window.byupReadStampanti().devices.find(d => d.id === dev.id) || dev)}>Fatto</ImpButton>
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

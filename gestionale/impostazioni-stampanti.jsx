// POS e integrazioni → Stampanti (P-124 · D-108).
//
// La sezione Impostazioni → Stampanti di P-101 non esiste più: le stampanti
// stanno qui, in POS e integrazioni, in un box come gli altri. Dentro: le
// stampanti collegate con il loro USO, il pulsante «Aggiungi stampante» e —
// quando le stampanti dei documenti sono più d'una — l'associazione dei POS.
//
// DUE POPUP, NON UN PERCORSO A PASSI (4 settembre 2026).
//   «Aggiungi stampante» si apre subito: in cima dice come si configura la
//   stampante — i due indirizzi del nostro server, uno per protocollo — e
//   sotto elenca quelle che si sono presentate. Il caricamento vive DENTRO
//   quell'elenco: non si aspetta davanti a una schermata vuota per vedere una
//   spiegazione che è già scritta e non cambia.
//   «Imposta stampante» è il secondo foglio: nome, uso, e ciò che l'uso porta
//   con sé — le categorie per le comande, i POS per i documenti. Lo stesso
//   foglio si riapre da «Configura» sulla tessera, ed è lì che vive la prova
//   di stampa: provare serve a sapere se la stampante risponde davvero, e
//   quella domanda si fa quando la si imposta, non da un pulsante in vetrina.
//
// CHE COSA SI PUÒ DAVVERO TROVARE. Da una pagina web non esiste alcuna
// scansione della rete locale, e il browser non espone a JavaScript l'elenco
// delle stampanti che il sistema conosce: nessuna API lo permette, e la
// chiamata diretta a una stampante in LAN è bloccata dal contenuto misto.
// Quindi si guarda CHI SI È PRESENTATO AL NOSTRO SERVER: una stampante che lo
// interroga (CloudPRNT, Server Direct Print) si annuncia da sé al primo
// sondaggio, col suo identificativo e il suo modello. Per questo la prima
// cosa che il popup dice è l'indirizzo da scrivere nella pagina di
// configurazione della stampante: senza quello non si presenta nessuno.
// «Questa postazione» non è più in elenco: la stampa dal browser non si
// collega e non si scollega — c'è sempre, ed è la strada che il documento
// prende quando per quel POS non risponde nessuna stampante del server.
//
// I DUE USI. Comande (e allora si assegnano le categorie: una categoria sta su
// una stampante sola) oppure scontrini di cortesia. Con una sola stampante per
// i documenti non c'è nulla da chiedere; da due in poi nasce la domanda «quale
// cassa stampa dove», e la risposta è un'associazione: un POS su una stampante
// sola, altrimenti lo stesso documento uscirebbe due volte in due punti del
// locale. Registro, coda e layout stanno in stampa.jsx.

// La sede di questo gestionale. Non si sceglie più nel foglio della stampante:
// una stampante appartiene alla sede in cui la stai collegando, e un menù a
// tendina con dentro una sola risposta giusta è una domanda finta.
const IMP_PRN_SEDE = 'cp';

function ImpStampantiBlocco() {
  const [reg, setReg] = React.useState(() => window.byupReadStampanti());
  const [toast, setToast] = React.useState(null);
  const [aggiungi, setAggiungi] = React.useState(false);
  const [imposta, setImposta] = React.useState(null);   // { candidata } | { device }
  React.useEffect(() => {
    const agg = () => setReg(window.byupReadStampanti());
    window.addEventListener('byup-stampanti-change', agg);
    window.addEventListener('storage', agg);
    return () => { window.removeEventListener('byup-stampanti-change', agg); window.removeEventListener('storage', agg); };
  }, []);
  const avvisa = (t) => { setToast(t); setTimeout(() => setToast(null), 2800); };
  const uso = (d) => d.use || 'comande';
  const documenti = reg.devices.filter(d => uso(d) === 'documenti');
  const scollega = (d) => { window.byupStampanteRimuovi(d.id); avvisa(`«${d.name}» scollegata`); };

  // Le tessere hanno la misura delle altre della pagina — Stripe, Glovo,
  // Zapier: stessa griglia a tre colonne, stessa altezza minima, logo in alto
  // e azione appoggiata in fondo. Una tessera per stampante collegata, più la
  // tessera d'ingresso che apre il popup.
  const griglia = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 };

  return (
    <ImpCard title="Stampanti"
      sub="Le comande escono dalle stampanti che interrogano il nostro server o compaiono sul monitor di cucina; i documenti per il cliente da una stampante collegata o, in mancanza, dal browser della postazione.">
      <div style={griglia}>
        {reg.devices.map(d => (
          <TesseraStampante key={d.id} d={d} uso={uso(d)}
            onConfigura={() => setImposta({ device: d })} onScollega={() => scollega(d)}/>
        ))}
        {/* La tessera d'ingresso: stessa misura, tratteggiata perché è
            un'azione e non una cosa collegata. */}
        <button data-aggiungi-stampante onClick={() => setAggiungi(true)} className="pn-btn-feedback" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          minHeight: 236, padding: 18, borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
          border: `1.5px dashed ${PN.BORDER}`, background: '#FAFBFC', textAlign: 'center',
        }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, display: 'grid', placeItems: 'center', fontSize: 24, color: PN.MUTED }}>+</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2 }}>Aggiungi stampante</div>
          <div style={{ fontSize: 14, color: PN.MUTED, lineHeight: 1.45, maxWidth: 220 }}>
            Scrivi il nostro indirizzo nella stampante e comparirà qui.
          </div>
        </button>
      </div>

      {/* Da due stampanti per i documenti in su: quale cassa stampa dove. La
          scelta si fa anche quando si imposta la stampante; qui si cambia. */}
      {documenti.length > 1 && <ImpPosStampanti documenti={documenti} onFatto={avvisa}/>}

      {aggiungi && (
        <ImpAggiungiStampanteModal
          onClose={() => setAggiungi(false)}
          onScelta={(c) => { setAggiungi(false); setImposta({ candidata: c }); }}/>
      )}
      {imposta && (
        <ImpImpostaStampanteModal
          candidata={imposta.candidata} device={imposta.device}
          onClose={() => setImposta(null)}
          onFatto={(nome, nuova) => { setImposta(null); avvisa(nuova ? `«${nome}» collegata` : `«${nome}» aggiornata`); }}/>
      )}
      {toast && (
        <div style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: PN.TEXT, color: '#fff', padding: '10px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, zIndex: 90, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>{toast}</div>
      )}
    </ImpCard>
  );
}

// ─── La tessera di una stampante ────────────────────────────────────────────
// Stessa cassa delle tessere del catalogo: logo in alto, nome, che cosa fa, lo
// stato in fondo e l'azione appoggiata al bordo inferiore. L'azione è
// «Configura», che riapre il foglio dov'è tutto — nome, uso, categorie, POS e
// la prova di stampa. La prova non sta qui: da sola non dice che cosa fare se
// va male, e chi la preme sta già cercando le impostazioni.
function TesseraStampante({ d, uso, onConfigura, onScollega }) {
  const browser = d.connection_mode === 'browser';
  const st = (window.PN_PRINT_STATI || {})[d.connection_status] || {};
  const proto = (window.PN_PRINTER_PROTOCOLLI || {})[d.printer_protocol] || {};
  const marca = ((window.PN_PRINTER_MODELLI || {})[d.printer_vendor] || {}).nome || '';
  const posAssociati = (d.pos_ids || []).map(id => (window.byupReadPosCensimento ? byupReadPosCensimento() : []).find(p => p.id === id)).filter(Boolean);
  const comande = uso === 'comande';
  const tono = browser ? 'ok' : (st.tono || 'muto');
  const colore = tono === 'ok' ? PN.GREEN : tono === 'attesa' ? PN.AMBER : tono === 'errore' ? PN.RED : PN.MUTED;
  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : null;
  return (
    <div data-stampante={d.id} data-uso={uso} style={{
      display: 'flex', flexDirection: 'column', minHeight: 236, padding: 18, borderRadius: 16,
      border: `1.5px solid ${tono === 'ok' ? PN.GREEN_SOFT : PN.BORDER_SOFT}`,
      background: tono === 'ok' ? '#F0FDF4' : PN.WHITE,
    }}>
      <div style={{ width: 54, height: 54, borderRadius: 14, background: browser ? PN.WHITE : '#1F2937', border: browser ? `1px solid ${PN.BORDER}` : 'none', display: 'grid', placeItems: 'center', fontSize: 24, flexShrink: 0 }}>
        {browser ? '💻' : '🖨'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>{d.name}</span>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 0.4, padding: '1px 6px', borderRadius: 3,
          background: comande ? '#EEF2FF' : PN.PINK_SOFT, color: comande ? '#3730A3' : PN.PINK_DARK,
        }}>{comande ? 'COMANDE' : 'CORTESIA'}</span>
      </div>
      <div style={{ fontSize: 14.5, color: PN.MUTED, marginTop: 4, lineHeight: 1.45 }}>
        {marca ? `${marca} ` : ''}{d.device_model}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontSize: 13.5, fontWeight: 600, color: colore }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colore, flexShrink: 0, alignSelf: 'center' }}/>
          <span style={{ flexShrink: 0 }}>{browser ? 'Sempre disponibile' : st.label}</span>
          {!browser && d.last_test_print_at && <span style={{ color: PN.MUTED, fontWeight: 500 }}>· prova {fmt(d.last_test_print_at)}</span>}
        </div>
        <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 4, lineHeight: 1.4, minHeight: 32 }}>
          {comande
            ? ((d.routing || []).length ? `${proto.label} · ${d.routing.map(window.pnRoutingLabel).join(', ')}` : `${proto.label} · nessuna categoria instradata`)
            : (posAssociati.length ? `POS: ${posAssociati.map(p => p.name).join(', ')}` : (browser ? 'Dal browser, sulla stampante che scegli nella finestra di stampa' : proto.label))}
        </div>
        <div style={{ marginTop: 10 }}>
          <ImpButton variant="ghost" onClick={onConfigura} style={{ width: '100%', justifyContent: 'center', padding: '9px 14px', fontSize: 14.5 }}>
            Configura
          </ImpButton>
          {!d.fisso && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <button onClick={onScollega} className="pn-btn-feedback" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: PN.MUTED, textDecoration: 'underline', textUnderlineOffset: 3 }}>Scollega</button>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div data-pos-stampanti style={{ marginTop: 14, padding: '13px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER}`, borderLeft: `3px solid ${PN.PINK}`, background: PN.WHITE }}>
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

// ─── Il guscio dei due fogli ────────────────────────────────────────────────
function ImpPrnModal({ titolo, sub, onClose, children, piede }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...IMP_MODAL_PANEL, width: 620, maxWidth: '100%', position: 'relative', maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', display: 'flex', flexDirection: 'column' }}>
        <div style={IMP_MODAL_HEAD}>
          <div style={IMP_MODAL_TITLE}>{titolo}</div>
          <div style={IMP_MODAL_SUB}>{sub}</div>
          <button onClick={onClose} aria-label="Chiudi" style={IMP_MODAL_X}><PnI.X size={13}/></button>
        </div>
        <div style={{ padding: '18px 24px 22px', overflow: 'auto', flex: 1 }}>{children}</div>
        {piede && (
          <div style={{ padding: '14px 24px 18px', borderTop: `1px solid ${PN.BORDER_SOFT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{piede}</div>
        )}
      </div>
    </div>
  );
}

// Il tasto che copia un indirizzo: l'indirizzo va incollato altrove — nella
// pagina di configurazione della stampante — e ricopiarlo a mano è il modo più
// facile di sbagliarlo.
function ImpPrnCopia({ valore }) {
  const [fatto, setFatto] = React.useState(false);
  const copia = () => {
    const p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(valore) : Promise.reject();
    p.catch(() => {}).then(() => { setFatto(true); setTimeout(() => setFatto(false), 1600); });
  };
  return (
    <button onClick={copia} className="pn-btn-feedback" style={{
      flexShrink: 0, padding: '6px 11px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
      background: fatto ? PN.GREEN_SOFT : PN.WHITE, color: fatto ? PN.GREEN : PN.TEXT,
      border: `1px solid ${fatto ? PN.GREEN_SOFT : PN.BORDER}`, fontSize: 13, fontWeight: 600,
    }}>{fatto ? 'Copiato' : 'Copia'}</button>
  );
}

// ─── Primo foglio: «Aggiungi stampante» ─────────────────────────────────────
// Si apre e dice subito la cosa che serve: l'indirizzo da scrivere nella
// stampante, uno per protocollo. L'elenco di chi si è presentato sta sotto, e
// il caricamento è suo — nessuno deve guardare una schermata vuota per due
// secondi prima di poter leggere l'indirizzo, che è già lì e non cambia.
function ImpAggiungiStampanteModal({ onClose, onScelta }) {
  const [cerca, setCerca] = React.useState('cerco');   // cerco | fatto
  const [trovate, setTrovate] = React.useState([]);
  const cercaTimer = React.useRef(null);
  const avviaRicerca = () => {
    setCerca('cerco'); setTrovate([]);
    clearTimeout(cercaTimer.current);
    cercaTimer.current = setTimeout(() => { setTrovate(window.byupStampantiRilevate()); setCerca('fatto'); }, 1600);
  };
  React.useEffect(() => { avviaRicerca(); return () => clearTimeout(cercaTimer.current); }, []);

  const proto = (c) => (window.PN_PRINTER_PROTOCOLLI[c.printer_protocol] || {});
  const marca = (c) => (window.PN_PRINTER_MODELLI[c.printer_vendor] || {}).nome || c.printer_vendor;
  const relativo = (iso) => {
    const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s} s fa`;
    const m = Math.round(s / 60); return m < 60 ? `${m} min fa` : `${Math.round(m / 60)} ore fa`;
  };
  // I due protocolli, con l'indirizzo per intero: è quello che va scritto
  // nella pagina di configurazione della stampante, e da lì in poi è lei a
  // chiamare noi — che è l'unico verso che funziona da un locale.
  const SPIEGA = {
    cloudprnt: 'Star, dalla pagina di configurazione della stampante (CloudPRNT → Server URL).',
    server_direct_print: 'Epson, da Web Config → Server Direct Print → URL del server.',
  };

  return (
    <ImpPrnModal titolo="Aggiungi stampante"
      sub="Prima si dice alla stampante dove chiamare, poi lei compare qui sotto."
      onClose={onClose}>
      <div data-collega-stampante style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 1 · Configura la stampante */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: PN.MUTED, marginBottom: 8 }}>
            1 · Configura la stampante
          </div>
          <div style={{ fontSize: 14, color: PN.TEXT, lineHeight: 1.55, marginBottom: 10 }}>
            Nella pagina di configurazione della stampante scrivi l'indirizzo del nostro server: è lei a interrogarci, e per questo stampa senza che nessuno confermi nulla. Scegli la riga del tuo protocollo.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(window.PN_PRINTER_PROTOCOLLI).map(([k, p]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '11px 13px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}` }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: PN.TEXT }}>{p.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: PN.TEXT, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 0.2, userSelect: 'all', marginTop: 2, wordBreak: 'break-all' }}>
                    {p.url}{IMP_PRN_SEDE}
                  </div>
                  <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.45 }}>{SPIEGA[k]}</div>
                </div>
                <ImpPrnCopia valore={`${p.url}${IMP_PRN_SEDE}`}/>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5, marginTop: 8 }}>
            Da una pagina web non esiste una scansione della rete: quello che possiamo vedere — e vediamo — è chi ha contattato il server. Le stampanti che non parlano questi due protocolli stampano lo stesso i documenti, dal browser della postazione, e non c'è niente da collegare.
          </div>
        </div>

        {/* 2 · Stampanti trovate — il caricamento sta qui dentro */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: PN.MUTED }}>
              2 · Stampanti trovate dal server
            </div>
            <ImpButton variant="secondary" onClick={avviaRicerca} style={{ padding: '6px 12px', fontSize: 13 }}>Cerca di nuovo</ImpButton>
          </div>

          {cerca === 'cerco' ? (
            <div data-cerca="cerco" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE, fontSize: 14, color: PN.MUTED, fontWeight: 600 }}>
              <style>{`@keyframes impCercaSpin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ width: 15, height: 15, borderRadius: 999, border: `2px solid ${PN.BORDER}`, borderTopColor: PN.PINK, animation: 'impCercaSpin 0.7s linear infinite', flexShrink: 0 }}/>
              Sto guardando chi ha contattato il server…
            </div>
          ) : trovate.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trovate.map(c => (
                <button key={c.id} data-trovata={c.id} onClick={() => onScelta(c)} className="pn-btn-feedback" style={{
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
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: PN.PINK_DARK, flexShrink: 0 }}>Imposta →</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', borderRadius: 11, border: `1px dashed ${PN.BORDER}`, background: '#FAFBFC', fontSize: 13.5, color: PN.MUTED, lineHeight: 1.55 }}>
              <b style={{ color: PN.TEXT }}>Nessuna stampante nuova.</b> Se l'hai appena configurata aspetta qualche secondo e premi «Cerca di nuovo»: si annuncia al primo sondaggio, che parte da sé.
            </div>
          )}
        </div>
      </div>
    </ImpPrnModal>
  );
}

// ─── Secondo foglio: «Imposta stampante» ────────────────────────────────────
// Lo stesso foglio per la stampante nuova e per quella già collegata (da
// «Configura» sulla tessera): nome, uso, e ciò che l'uso porta con sé. Qui c'è
// la prova di stampa, che è la domanda «risponde davvero?» — e si fa dove si
// può rimediare, non da un pulsante in vetrina.
function ImpImpostaStampanteModal({ candidata, device, onClose, onFatto }) {
  const nuova = !device;
  const base = device || candidata;
  const [nome, setNome] = React.useState(() => device ? device.name : (candidata.nome_proposto || candidata.device_model));
  const [uso, setUso] = React.useState(() => (device ? (device.use || 'comande') : 'comande'));
  const [routing, setRouting] = React.useState(() => new Set(device ? (device.routing || []) : []));
  const [posScelti, setPosScelti] = React.useState(() => new Set(device ? (device.pos_ids || []) : []));
  const [autoPrint, setAutoPrint] = React.useState(() => !!window.byupAutoPrintRicevuta());
  const [prova, setProva] = React.useState('idle');     // idle | corso | ok | ko
  const marca = (window.PN_PRINTER_MODELLI[base.printer_vendor] || {}).nome || base.printer_vendor;
  const proto = (window.PN_PRINTER_PROTOCOLLI[base.printer_protocol] || {});

  // Le categorie già prese da un'altra stampante restano spente e dicono da
  // chi: l'instradamento è uno solo (category_routings).
  const occupate = window.byupRoutingOccupato(device ? device.id : null);
  // I POS censiti e la stampante su cui stampano adesso. Un POS su una
  // stampante sola: spuntarlo qui lo toglie dall'altra, e la riga lo dice.
  const posLista = window.byupReadPosCensimento ? byupReadPosCensimento().filter(p => p.fiscal_link_status !== 'unlinked') : [];
  // Le altre stampanti dei documenti: con nessun'altra non c'è niente da
  // chiedere — tutto esce da qui e la domanda non esiste.
  const altreDocumenti = window.byupStampantiDocumenti().filter(d => !device || d.id !== device.id);

  const provaStampa = () => {
    if (prova === 'corso') return;
    setProva('corso');
    // Su una stampante già collegata la prova è quella vera del registro
    // (accoda, sonda, scrive l'esito). Su una candidata non ancora salvata si
    // verifica il collegamento con lo stesso ritardo: si è presentata al
    // server poco fa, ed è quello che stiamo controllando.
    if (device) {
      window.byupProvaStampa(device, (esito) => setProva(esito === 'ok' ? 'ok' : 'ko'));
      return;
    }
    setTimeout(() => setProva('ok'), 1400);
  };

  const salva = () => {
    const n = nome.trim() || base.device_model;
    if (device) {
      window.byupStampantePatch(device.id, {
        name: n, use: uso,
        routing: uso === 'comande' ? [...routing] : [],
        pos_ids: uso === 'documenti' ? [...posScelti] : [],
      });
      if (uso === 'documenti') [...posScelti].forEach(id => window.byupAssociaPos(id, device.id));
    } else {
      const id = 'prn-' + Date.now().toString(36);
      window.byupStampanteAggiungi({
        id, type: 'printer', name: n, device_model: candidata.device_model, printer_vendor: candidata.printer_vendor,
        connection_mode: 'server_polling', printer_protocol: candidata.printer_protocol, cloud_client_id: candidata.cloud_client_id,
        poll_interval_seconds: 5, connection_status: 'online', connection_checked_at: new Date().toISOString(),
        venue_id: IMP_PRN_SEDE, use: uso, pos_ids: [], routing: uso === 'comande' ? [...routing] : [],
        last_test_print_at: prova === 'ok' ? new Date().toISOString() : null, last_test_print_result: prova === 'ok' ? 'ok' : null,
      }, candidata.id);
      if (uso === 'documenti') [...posScelti].forEach(pid => window.byupAssociaPos(pid, id));
    }
    // «Stampa da sola a incasso avvenuto» è di sede: la decisione riguarda il
    // comportamento della cassa, non una singola stampante.
    if (uso === 'documenti') {
      const reg = window.byupReadStampanti();
      window.byupWriteStampanti({ ...reg, venue_settings: { ...(reg.venue_settings || {}), auto_print_receipt: autoPrint } });
    }
    onFatto(n, nuova);
  };

  const pronto = !!nome.trim() && (uso === 'documenti' || routing.size > 0);
  const inp = { width: '100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 9, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: PN.WHITE };

  return (
    <ImpPrnModal
      titolo="Imposta stampante"
      sub={`${marca} ${base.device_model}${proto.label ? ` · ${proto.label}` : ''} · dalle il nome che vuoi e dille che cosa deve stampare.`}
      onClose={onClose}
      piede={
        <React.Fragment>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <ImpButton variant="ghost" disabled={prova === 'corso'} onClick={provaStampa} style={{ padding: '9px 15px', fontSize: 14 }}>
              {prova === 'corso' ? 'Prova in corso…' : 'Prova di stampa'}
            </ImpButton>
            <span data-prova={prova} style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, maxWidth: 280, color: prova === 'ok' ? PN.GREEN : prova === 'ko' ? PN.RED : PN.MUTED }}>
              {prova === 'ok' ? 'Ha risposto: è collegata, il foglio di prova è uscito.'
                : prova === 'ko' ? 'Non ha risposto: controlla che sia accesa e che l\'indirizzo sia quello giusto.'
                : prova === 'corso' ? 'Sto aspettando il suo prossimo sondaggio…'
                : 'Manda un foglio e aspetta la risposta.'}
            </span>
          </div>
          <ImpButton variant="primary" disabled={!pronto} onClick={salva}>{nuova ? 'Aggiungi la stampante' : 'Salva'}</ImpButton>
        </React.Fragment>
      }>
      <div data-imposta-stampante style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ImpField label="Nome della stampante" hint="Come la chiamerete: Cucina, Pizzeria, Bar, Cassa 2…">
          <input value={nome} onChange={e => setNome(e.target.value)} style={inp} autoFocus/>
        </ImpField>

        <ImpField label="Che cosa stampa">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(window.PN_PRINT_USI).map(([k, u]) => {
              const on = uso === k;
              return (
                <button key={k} data-uso={k} onClick={() => setUso(k)} style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`, background: on ? '#F4F5F7' : PN.WHITE,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>{u.label}</div>
                  <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45 }}>{u.nota}</div>
                </button>
              );
            })}
          </div>
        </ImpField>

        {uso === 'comande' && (
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
          <React.Fragment>
            {/* I POS si chiedono solo da due stampanti in su: con una sola,
                tutto esce da lì e la domanda non esiste. */}
            {altreDocumenti.length > 0 ? (
              <ImpField label="Quali POS stampano qui" hint="Un POS stampa su una stampante sola: spuntandolo qui lo togli da quella di prima, altrimenti lo stesso scontrino uscirebbe due volte.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {posLista.map(p => {
                    const on = posScelti.has(p.id);
                    const attuale = window.byupPosStampante(p.id);
                    const altrove = attuale && (!device || attuale.id !== device.id) ? attuale.name : null;
                    const nat = (window.PN_POS_NATURE || {})[p.nature] || {};
                    return (
                      <label key={p.id} data-pos-scelta={p.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`, background: PN.WHITE,
                      }}>
                        <input type="checkbox" checked={on} onChange={() => setPosScelti(prev => { const s = new Set(prev); s.has(p.id) ? s.delete(p.id) : s.add(p.id); return s; })} style={{ marginTop: 3, accentColor: PN.PINK_DARK }}/>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700, color: PN.TEXT }}>{p.name}</span>
                          <span style={{ display: 'block', fontSize: 12.5, color: PN.MUTED, marginTop: 1 }}>
                            {nat.label || p.nature}{p.user ? ` · ${p.user}` : ''}{altrove ? ` · ora stampa su «${altrove}»` : ''}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                  {!posLista.length && (
                    <div style={{ fontSize: 13, color: PN.MUTED, lineHeight: 1.5 }}>Nessun POS censito: quando ne nasce uno lo assegni da qui o dal riquadro «Quale POS stampa dove».</div>
                  )}
                </div>
              </ImpField>
            ) : (
              <div style={{ padding: '11px 13px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 13, color: PN.MUTED, lineHeight: 1.55 }}>
                È l'unica stampante per i documenti: tutto esce da qui, e non c'è altro da scegliere. Se ne colleghi una seconda ti chiediamo quale POS stampa dove.
              </div>
            )}

            {/* Il documento a incasso chiuso: al tocco (predefinito) o da solo.
                Spento di default perché l'automatico stampa anche quando il
                cliente il foglio non lo vuole, e quelli sono fogli buttati. */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}`, cursor: 'pointer' }}>
              <input type="checkbox" data-auto-ricevuta checked={autoPrint} onChange={e => setAutoPrint(e.target.checked)} style={{ marginTop: 3, accentColor: PN.PINK_DARK }}/>
              <span>
                <span style={{ fontSize: 14, fontWeight: 700, color: PN.TEXT }}>Stampa da sola a incasso avvenuto</span>
                <span style={{ display: 'block', fontSize: 12.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5 }}>
                  Il foglio esce mentre dai il resto, senza toccare niente: in cassa il pulsante dice che è già uscito e serve solo a ristamparlo. Spenta, il documento esce quando lo chiedi.
                </span>
              </span>
            </label>
          </React.Fragment>
        )}
      </div>
    </ImpPrnModal>
  );
}

window.ImpStampantiBlocco = ImpStampantiBlocco;
window.ImpAggiungiStampanteModal = ImpAggiungiStampanteModal;
window.ImpImpostaStampanteModal = ImpImpostaStampanteModal;

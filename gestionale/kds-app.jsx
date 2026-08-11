// ══════════════════════════════════════════════════════════════════════════
// byup · KDS — guscio: barre, stato, annullamento, comandi di prova
//
// Niente sidebar e niente navigazione. Questo non è una pagina che un
// ristoratore visita: è un dispositivo appeso al muro che fa una cosa sola, per
// cinque ore di fila, toccato con i guanti. Ogni voce di menu in più è
// superficie da colpire per sbaglio.
//
// UN SOLO SCHERMO. Il routing delle comande è per categoria di menu
// (`menu_categories.kds_device_id`) e ogni categoria va a UN solo KDS: questo
// device vede le sue comande e nient'altro, quindi non esiste un secondo punto
// di vista da cui guardarle. Niente scambio di vista, niente selettore di
// reparto — la board aggregata per piatto è un'altra route (KDS v2).
//
// In barra alta ci sono solo cose che si LEGGONO: chi è questo device, che ora
// è, se la linea c'è. Gli unici comandi sono il silenziatore e la paginazione.
// ══════════════════════════════════════════════════════════════════════════

// Un solo suono per comanda nuova. Due note e finisce. Un loop, su uno schermo
// acceso cinque ore in un ambiente già rumoroso, viene silenziato il secondo
// giorno — e da lì in poi non c'è più nessun segnale acustico.
function kdsSuono() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = kdsSuono._ctx || (kdsSuono._ctx = new Ctx());
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    [784, 1046].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const s = t + i * 0.11;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.16, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.18);
      o.connect(g); g.connect(ctx.destination);
      o.start(s); o.stop(s + 0.22);
    });
  } catch (e) { /* nessun audio: non è un guasto che debba fermare la cucina */ }
}

// ══════════════════════════════════════════════════════════════════════════
function KdsApp() {
  const primo = React.useMemo(() => kdsScenario('normale'), []);

  const [S, setS] = React.useState(primo.S);
  const [slots, setSlots] = React.useState([]);
  const [scenario, setScenario] = React.useState('normale');
  const [pagina, setPagina] = React.useState(0);
  const [undo, setUndo] = React.useState(null);
  const [aperta, setAperta] = React.useState(null);
  const [suono, setSuono] = React.useState(true);
  const [velocita, setVelocita] = React.useState(1);
  const [devAperto, setDevAperto] = React.useState(true);

  // ─── Orologio virtuale ──────────────────────────────────────────────────
  // Lo scenario parte alle 20:52 e da lì avanza. `velocita` moltiplica il tempo
  // che passa, non lo salta: le transizioni di colore si vedono avvenire
  // invece di comparire già avvenute.
  const [ora, setOra] = React.useState(primo.ora);
  const [reale, setReale] = React.useState(() => Date.now());
  const orologio = React.useRef({ virt: primo.ora, reale: Date.now(), vel: 1 });
  // Due orologi per lo stesso istante: il REALE misura da quanti secondi manca
  // la linea, il VIRTUALE è l'ora da mostrare. Dire «ultimo contatto 12:36» su
  // una board che segna 20:52 farebbe dubitare di entrambi i numeri.
  const contatto = React.useRef({ reale: Date.now(), virt: primo.ora });
  orologio.current.vel = velocita;

  React.useEffect(() => {
    const id = setInterval(() => {
      const o = orologio.current, adesso = Date.now();
      o.virt += (adesso - o.reale) * o.vel;
      o.reale = adesso;
      setOra(o.virt); setReale(adesso);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (S.connesso) contatto.current = { reale, virt: orologio.current.virt };
  }, [reale, S.connesso]);
  const daContatto = Math.max(0, Math.floor((reale - contatto.current.reale) / 1000));

  // In secondo piano il browser strozza i timer fino a un battito al minuto, e
  // il contatore dichiarerebbe una disconnessione che non c'è. Su un monitor
  // appeso non succede mai; su un portatile durante una demo succede a ogni
  // cambio di scheda, e un falso allarme rosso costa più di quanto renda.
  React.useEffect(() => {
    function tornati() {
      if (document.visibilityState !== 'visible') return;
      const adesso = Date.now();
      orologio.current.reale = adesso;
      if (S.connesso) contatto.current = { reale: adesso, virt: orologio.current.virt };
      setReale(adesso);
    }
    document.addEventListener('visibilitychange', tornati);
    return () => document.removeEventListener('visibilitychange', tornati);
  }, [S.connesso]);

  // ─── Slot ───────────────────────────────────────────────────────────────
  // Riassegnati solo quando cambiano le comande, mai al battito dell'orologio:
  // è il motivo per cui nessuna card si sposta mentre i minuti scorrono.
  const aperteKey = S.comande.filter(kdsAperta).map(c => c.id).join(',');
  React.useEffect(() => {
    setSlots(prec => {
      const nuovi = kdsAssegnaSlot(prec, S.comande.filter(kdsAperta));
      return nuovi.join(',') === prec.join(',') ? prec : nuovi;
    });
  }, [aperteKey]);

  // ─── Suono: uno per comanda nuova ───────────────────────────────────────
  const quante = React.useRef(null);
  React.useEffect(() => {
    const n = S.comande.length;
    if (quante.current != null && n > quante.current && suono) kdsSuono();
    quante.current = n;
  }, [S.comande.length, suono]);

  // ─── Azioni e annullamento ──────────────────────────────────────────────
  // Lo stato è immutabile, quindi lo stato PRECEDENTE è già l'annullamento: non
  // c'è niente da ricostruire al contrario. Una sola voce alla volta, sei
  // secondi, sempre nello stesso punto in basso a sinistra — mai sulla card,
  // dove sarebbe un bersaglio che compare sotto il dito che ha appena premuto.
  function agisci(testo, fn) {
    const next = fn(S);
    if (next === S) return;
    setUndo({ testo, prima: S, scadenza: Date.now() + KDS_UNDO_MS });
    setS(next);
  }
  React.useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), Math.max(0, undo.scadenza - Date.now()) + 30);
    return () => clearTimeout(t);
  }, [undo]);

  const trova = id => S.comande.find(c => c.id === id);
  const etichetta = { da_fare: 'da fare', in_corso: 'in corso', pronto: 'pronto' };

  function riga(comandaId, rigaId) {
    const c = trova(comandaId); if (!c) return;
    const r = c.righe.find(x => x.id === rigaId); if (!r) return;
    agisci(r.prodotto + ' · tav ' + c.tavolo + ' → ' + etichetta[KDS_CICLO[r.stato]],
      st => kdsCiclaRiga(st, comandaId, rigaId));
  }
  function pronta(comandaId) {
    const c = trova(comandaId); if (!c) return;
    const n = kdsConta(c);
    agisci('Tav ' + c.tavolo + ' pronta' + (n.pronte < n.totale ? ' · ' + (n.totale - n.pronte) + ' righe chiuse insieme' : ''),
      st => kdsComandaPronta(st, comandaId, ora));
  }
  function consegnata(comandaId) {
    const c = trova(comandaId); if (!c) return;
    agisci('Tav ' + c.tavolo + ' consegnata', st => kdsConsegnata(st, comandaId, ora));
  }
  function visto(comandaId) {
    const c = trova(comandaId); if (!c) return;
    agisci('Annullamento visto · tav ' + c.tavolo, st => kdsVisto(st, comandaId));
  }

  function caricaScenario(nome) {
    const s = kdsScenario(nome);
    setScenario(nome); setS(s.S); setSlots([]);
    orologio.current = { virt: s.ora, reale: Date.now(), vel: velocita };
    contatto.current = { reale: Date.now(), virt: s.ora };
    setOra(s.ora); setPagina(0); setUndo(null); setAperta(null);
    quante.current = null;
  }

  const pagine = Math.max(1, Math.ceil(slots.length / G.SLOT));
  const p = Math.min(pagina, pagine - 1);
  const comandaAperta = aperta ? trova(aperta) : null;

  return (
    <div style={{
      width: G.W, height: G.H, position: 'relative', overflow: 'hidden',
      background: K.FONDO, color: K.TESTO, display: 'flex', flexDirection: 'column',
    }}>

      <KdsBarraAlta ora={ora} daContatto={daContatto} connesso={S.connesso}
        suono={suono} setSuono={setSuono} velocita={velocita}/>

      <KdsBoard S={S} slots={slots} ora={ora} pagina={p}
        onRiga={riga} onPronta={pronta} onConsegnata={consegnata} onVisto={visto}
        onApri={setAperta}/>

      <KdsBarraBassa undo={undo} reale={reale}
        onAnnulla={() => { if (undo) { setS(undo.prima); setUndo(null); } }}
        slots={slots} comande={S.comande} ora={ora}
        pagina={p} pagine={pagine} setPagina={setPagina}/>

      {comandaAperta && (
        <KdsApertura comanda={comandaAperta} ora={ora} onChiudi={() => setAperta(null)}
          onRiga={riga} onPronta={pronta} onConsegnata={consegnata}/>
      )}

      <KdsDev aperto={devAperto} setAperto={setDevAperto}
        scenario={scenario} onScenario={caricaScenario}
        velocita={velocita} setVelocita={setVelocita}
        connesso={S.connesso}
        onForza={q => agisci('scenario: ' + q, st => kdsForza(st, q, ora))}
        onNuova={() => agisci('nuova comanda arrivata', st => kdsNuovaComanda(st, ora))}/>

      {/* Lo scollegamento non è una pastiglia in un angolo: blocca lo schermo.
          Un KDS che mostra dati vecchi senza dirlo è più pericoloso di un KDS
          spento — spento si vede, vecchio no. */}
      {!S.connesso && (
        <KdsScollegato daContatto={daContatto} ultimo={contatto.current.virt}
          onRiprova={() => {
            setS(st => Object.assign({}, st, { connesso: true }));
            contatto.current = { reale: Date.now(), virt: orologio.current.virt };
          }}/>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
function KdsBarraAlta({ ora, daContatto, connesso, suono, setSuono, velocita }) {
  const vivo = connesso && daContatto <= KDS_HEARTBEAT_ALLARME_S;
  return (
    <div style={{
      height: G.BARRA_ALTA, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 62px 0 ' + G.PAD + 'px', background: K.CARD, borderBottom: '1px solid ' + K.BORDO,
    }}>
      <img src="Fresh-mark.png" alt="byup" style={{ height: 30, display: 'block' }}/>
      <div>
        <div style={Object.assign({}, T.etich, { color: K.TESTO_3 })}>kitchen display</div>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', color: K.TESTO, marginTop: 3 }}>
          Cucina
        </div>
      </div>

      <span style={{ flex: 1 }}/>

      {velocita !== 1 && (
        <span style={Object.assign({}, T.etich, { color: K.TESTO_3 })}>tempo ×{velocita}</span>
      )}

      <button type="button" onClick={() => setSuono(!suono)} title="Suono all'arrivo di una comanda"
        style={{
          width: 52, height: 52, borderRadius: 11, display: 'grid', placeItems: 'center',
          background: 'transparent', border: '2px solid ' + (suono ? K.BORDO_ALTO : K.BORDO),
          color: suono ? K.TESTO_2 : K.TESTO_3, cursor: 'pointer',
        }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1z"/>
          {suono ? <path d="M16 8.5a5 5 0 0 1 0 7"/> : <path d="M16.5 9.5l4 5M20.5 9.5l-4 5"/>}
        </svg>
      </button>

      {/* Battito: l'unico posto, col marchio, dove compare il corallo del brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9, height: 52, padding: '0 14px',
        borderRadius: 11, border: '2px solid ' + (vivo ? K.BORDO : K.ROSSO),
        background: vivo ? 'transparent' : 'rgba(220,38,38,0.10)',
      }}>
        <span style={{
          width: 11, height: 11, borderRadius: 99, background: vivo ? K.BRAND : K.ROSSO,
          boxShadow: vivo ? '0 0 0 4px rgba(255,90,95,0.18)' : 'none',
        }}/>
        <span style={Object.assign({}, T.etich, { color: vivo ? K.TESTO_2 : K.ROSSO, fontSize: 12 })}>
          {vivo ? 'aggiornato ' + daContatto + 's fa' : 'nessun contatto da ' + daContatto + 's'}
        </span>
      </div>

      <div style={{
        fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums', minWidth: 96, textAlign: 'right',
      }}>{kdsOrario(ora)}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
function KdsBarraBassa({ undo, reale, onAnnulla, slots, comande, ora, pagina, pagine, setPagina }) {
  return (
    <div style={{
      height: G.BARRA_BASSA, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14,
      padding: '0 ' + G.PAD + 'px', background: K.CARD, borderTop: '1px solid ' + K.BORDO,
    }}>
      {/* Slot dell'annullamento: larghezza riservata sempre, anche vuoto. Se
          comparisse e sparisse, tutto il resto della barra si sposterebbe
          proprio quando serve premere qualcosa in fretta. */}
      <div style={{ width: 400, flexShrink: 0 }}>
        {undo ? (
          <button type="button" onClick={onAnnulla} style={{
            width: '100%', height: 56, borderRadius: 11, display: 'flex', alignItems: 'center',
            gap: 12, padding: '0 14px', textAlign: 'left',
            background: K.RIGA, border: '2px solid ' + K.BORDO_ALTO, color: K.TESTO, cursor: 'pointer',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={K.TESTO} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="9,14 4,9 9,4"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>
            </svg>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={Object.assign({}, T.etich, { color: K.TESTO_2, display: 'block' })}>annulla</span>
              <span style={{
                display: 'block', fontSize: 15, fontWeight: 700, marginTop: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{undo.testo}</span>
            </span>
            {/* Il conto alla rovescia si disegna al battito, e se il battito
                resta indietro (scheda in secondo piano) la differenza grezza
                supera la finestra: si è visto un «13s» su un annullamento che
                dura sei secondi. Il numero non può promettere più della
                finestra, quindi si taglia. */}
            <span style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: K.TESTO_2 }}>
              {Math.min(KDS_UNDO_MS / 1000, Math.max(0, Math.ceil((undo.scadenza - reale) / 1000)))}s
            </span>
          </button>
        ) : (
          <div style={{
            height: 56, borderRadius: 11, border: '1.5px dashed ' + K.BORDO,
            display: 'flex', alignItems: 'center', padding: '0 14px',
          }}>
            <span style={Object.assign({}, T.etich, { color: K.TESTO_3 })}>niente da annullare</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <KdsSegnalatore slots={slots} comande={comande} pagina={pagina} ora={ora}/>
      </div>

      {/* Paginazione: nessuno scroll, mai. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <KdsBottone disabilitato={pagina === 0} onClick={() => setPagina(Math.max(0, pagina - 1))} titolo="Pagina precedente">‹</KdsBottone>
        <span style={{
          minWidth: 84, textAlign: 'center', fontSize: 21, fontWeight: 800,
          fontVariantNumeric: 'tabular-nums', color: pagine > 1 ? K.TESTO : K.TESTO_3,
        }}>{pagina + 1} / {pagine}</span>
        <KdsBottone disabilitato={pagina >= pagine - 1} onClick={() => setPagina(Math.min(pagine - 1, pagina + 1))} titolo="Pagina successiva">›</KdsBottone>
      </div>
    </div>
  );
}

// ─── Banner di scollegamento ──────────────────────────────────────────────
// L'UNICO schermo scuro di tutto il prototipo, ed è voluto: il resto del KDS è
// chiaro, quindi se lo schermo diventa nero lo si nota nella visione
// periferica, da dall'altra parte della cucina, prima ancora di leggere una
// parola — è esattamente la reazione che uno scollegamento deve provocare.
// Per questo qui dentro NON si usano i token K (che nel resto del file sono
// ormai chiari): userebbero inchiostro scuro su un fondo scuro e sparirebbero.
// I valori sono scritti a mano, e sono gli stessi del tema scuro che il KDS
// aveva prima — funzionavano già, e restano gli unici usati qui.
const KDS_INV = { TESTO: '#F2F5F9', TESTO_2: '#A7B0BE', ROSSO: '#FF3B30' };

function KdsScollegato({ daContatto, ultimo, onRiprova }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90, background: 'rgba(11,14,18,0.96)',
      display: 'grid', placeItems: 'center', padding: 60,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 900 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 28,
          padding: '10px 18px', borderRadius: 999,
          background: 'rgba(255,59,48,0.16)', border: '2px solid ' + KDS_INV.ROSSO,
        }}>
          <KdsGlifo tipo="allergene" colore={KDS_INV.ROSSO} size={26}/>
          <span style={Object.assign({}, T.etich, { color: KDS_INV.ROSSO, fontSize: 15 })}>connessione persa</span>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: KDS_INV.TESTO }}>
          Quello che vedi non è aggiornato
        </div>
        <div style={{ fontSize: 23, fontWeight: 600, color: KDS_INV.TESTO_2, marginTop: 20, lineHeight: 1.45 }}>
          Ultimo contatto {kdsOrario(ultimo)}, {daContatto} secondi fa. Le comande inviate da allora non
          sono su questo schermo. <b style={{ color: KDS_INV.TESTO }}>Coordinatevi a voce</b> finché non torna la linea.
        </div>
        <div style={{ marginTop: 34, display: 'inline-flex' }}>
          <button type="button" onClick={onRiprova} style={{
            height: 64, padding: '0 26px', borderRadius: 11, border: 'none',
            background: KDS_INV.TESTO, color: '#12151A',
            fontFamily: 'inherit', fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', cursor: 'pointer',
          }}>Riprova adesso</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Comandi di prova — fuori dall'interfaccia di cucina
// ══════════════════════════════════════════════════════════════════════════
function KdsDev({ aperto, setAperto, scenario, onScenario, velocita, setVelocita, connesso, onForza, onNuova }) {
  // Sotto la barra alta: l'orologio e il battito sono due delle cose che questo
  // pannello serve a verificare, e coprirli non aiuterebbe.
  const ancora = { position: 'absolute', top: G.BARRA_ALTA + 12, right: 12, zIndex: 80 };

  // Chiuso, sta NELL'angolo della barra alta — che gli riserva lo spazio — e non
  // sopra la board: copriva il timer del quarto tavolo, cioè l'unica cosa che
  // su questo schermo deve essere sempre leggibile.
  if (!aperto) return (
    <button type="button" data-demo-only onClick={() => setAperto(true)} style={Object.assign({
      height: 40, padding: '0 14px', borderRadius: 10, background: K.RIGA,
      border: '1px solid ' + K.BORDO_ALTO, color: K.TESTO_2,
      fontFamily: 'inherit', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.08em', cursor: 'pointer',
    }, ancora, { top: 18, right: 12 })}>DEV</button>
  );

  const eti = t => <div style={Object.assign({}, T.etich, { color: K.TESTO_3, margin: '14px 0 7px' })}>{t}</div>;
  const seg = (voci, val, set) => (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {voci.map(v => (
        <button key={String(v.id)} type="button" onClick={() => set(v.id)} style={{
          height: 34, padding: '0 11px', borderRadius: 8,
          background: v.id === val ? K.TESTO : 'transparent',
          border: '1px solid ' + (v.id === val ? K.TESTO : K.BORDO),
          color: v.id === val ? K.SU_PIENO : K.TESTO_2,
          fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        }}>{v.label}</button>
      ))}
    </div>
  );
  const btn = (label, on, colore) => (
    <button type="button" onClick={on} style={{
      width: '100%', height: 36, padding: '0 11px', borderRadius: 8, background: 'transparent',
      border: '1px solid ' + (colore || K.BORDO), color: colore || K.TESTO_2,
      fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
    }}>{label}</button>
  );

  return (
    <div data-demo-only style={Object.assign({
      width: 300, padding: 14, borderRadius: 14,
      background: 'rgba(255,255,255,0.97)', border: '1px solid ' + K.BORDO_ALTO,
      boxShadow: '0 24px 60px rgba(15,17,21,0.16), 0 2px 8px rgba(15,17,21,0.08)',
    }, ancora)}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={Object.assign({}, T.etich, { color: K.TESTO_2, flex: 1 })}>comandi di prova</span>
        <button type="button" onClick={() => setAperto(false)} style={{
          width: 32, height: 32, borderRadius: 8, background: 'transparent',
          border: '1px solid ' + K.BORDO, color: K.TESTO_2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16,
        }}>×</button>
      </div>

      {eti('servizio')}
      {seg([
        { id: 'vuoto', label: 'vuoto · 11:30' },
        { id: 'normale', label: 'normale · 6' },
        { id: 'picco', label: 'picco · 18' },
      ], scenario, onScenario)}

      {eti('velocità del tempo')}
      {seg([{ id: 1, label: '×1' }, { id: 10, label: '×10' }, { id: 60, label: '×60' }], velocita, setVelocita)}

      {eti('eventi')}
      <div style={{ display: 'grid', gap: 6 }}>
        {btn('arriva una comanda nuova', onNuova)}
        {btn('la sala annulla una riga', () => onForza('annullamento'))}
        {btn('tavolo con allergia', () => onForza('allergia'))}
        {btn('pronta da 8′, non ritirata', () => onForza('non_ritirato'))}
        {btn('disconnessione', () => onForza('disconnessione'), connesso ? K.BORDO : K.ROSSO)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
const kdsRoot = ReactDOM.createRoot(document.getElementById('root'));
kdsRoot.render(<div className="frame" data-screen-label="KDS"><KdsApp/></div>);

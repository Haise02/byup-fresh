// Hubble · Workflow — le automazioni.
//
// Un workflow è una frase lunga: «quando succede questo, aspetta tanto, se
// vale quest'altra cosa fai A, altrimenti fai B». Si legge dall'alto in basso
// come una ricetta, e per questo il canvas è VERTICALE e non un grafo libero:
// un grafo libero è più potente e diventa illeggibile alla quinta scatola.
//
// I workflow semplici creati insieme ai form finiscono qui dentro insieme a
// quelli scritti a mano. Sono la stessa cosa: quello del form ha tre passi e
// nessuno l'ha disegnato, ma se serve lo si apre e gliene si aggiunge un quarto.

const { useState: useStateWf, useMemo: useMemoWf, useRef: useRefWf } = React;

const WF_STATI = {
  attivo:  { label: 'Attivo',  color: 'OK' },
  sospeso: { label: 'Sospeso', color: 'WARN' },
  bozza:   { label: 'Bozza',   color: 'PLAN_FREE' },
};

// Il nodo disegnato, l'albero dei rami e l'ispettore del ramo stanno in
// hub-workflow-canvas.jsx: qui resta l'elenco, il canvas e gli agenti.

function HubWorkflowPage() {
  const [cerca, setCerca] = useStateWf('');
  const [vista, setVista] = useStateWf('tutti');
  const [aperto, setAperto] = useStateWf(null);
  const [nuovo, setNuovo] = useStateWf(false);

  if (nuovo) return <HubWorkflowCanvas wf={{
    id: 'nuovo', nome: '', stato: 'bozza', origine: 'custom', descrizione: '',
    iscritti: 0, inCorso: 0, completati: 0, autore: 'Marco Rinaldi', modificato: new Date(),
    nodi: [{ tipo: 'trigger', testo: 'Scegli che cosa lo fa partire' }, { tipo: 'fine', testo: '' }],
  }} nuovo onChiudi={() => setNuovo(false)}/>;
  if (aperto) return <HubWorkflowCanvas wf={aperto} onChiudi={() => setAperto(null)}/>;

  const lista = HUB_WORKFLOW.filter(w =>
    (vista === 'tutti' || (vista === 'form' ? w.origine === 'form' : w.origine === 'custom')) &&
    (!cerca || (w.nome + ' ' + w.descrizione).toLowerCase().includes(cerca.toLowerCase())));

  const inCorso = HUB_WORKFLOW.reduce((s, w) => s + w.inCorso, 0);
  const completati = HUB_WORKFLOW.reduce((s, w) => s + w.completati, 0);

  const colonne = [
    { id: 'nome',       label: 'Workflow',   w: 'minmax(0,2.6fr)' },
    { id: 'stato',      label: 'Stato',      w: '1fr' },
    { id: 'passi',      label: 'Passi',      w: '0.75fr', destra: true },
    { id: 'iscritti',   label: 'Iscritti',   w: '0.9fr', destra: true },
    { id: 'inCorso',    label: 'In corso',   w: '0.9fr', destra: true },
    { id: 'modificato', label: 'Modificato', w: '1.1fr' },
  ];
  const cella = (id, w) => {
    if (id === 'nome') return (
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14.3, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.nome}</span>
          {w.origine === 'form' && <HubPillola color="HUB_MAGENTA" size="sm">da un form</HubPillola>}
        </div>
        <div style={{ fontSize: 12.5, color: ADM.MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.descrizione}</div>
      </div>
    );
    if (id === 'stato') return <HubStato stato={w.stato} mappa={WF_STATI}/>;
    if (id === 'passi') return <span style={{ fontSize: 13.6, fontWeight: 600 }}>{hubContaNodi(w.nodi)}</span>;
    if (id === 'iscritti') return <span style={{ fontSize: 13.6, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(w.iscritti)}</span>;
    if (id === 'inCorso') return w.inCorso
      ? <span style={{ fontSize: 13.6, fontWeight: 700, color: ADM.WARN, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(w.inCorso)}</span>
      : <span style={{ color: ADM.MUTED_LIGHT }}>—</span>;
    return <span style={{ fontSize: 13.2, color: ADM.MUTED }}>{fmtDate(w.modificato)}</span>;
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata occhiello="Automazioni" titolo="Workflow" colore="HUB_VIOLA"
        sotto="Quello che la piattaforma fa da sola: mail di conferma, promemoria, escalation, arricchimento dei contatti. Anche i workflow nati insieme a un form stanno qui."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo(true)}>Crea workflow</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Workflow attivi" valore={HUB_WORKFLOW.filter(w => w.stato === 'attivo').length}
          icona="flow" tono="OK" sotto={`su ${HUB_WORKFLOW.length} totali`}/>
        <HubTile etichetta="Contatti in corso" valore={fmtNum(inCorso)} icona="hourglass" tono="WARN"
          sotto="Sono dentro un'automazione adesso"/>
        <HubTile etichetta="Percorsi completati" valore={fmtNum(completati)} icona="check"/>
        <HubTile etichetta="Nati da un form" valore={HUB_WORKFLOW.filter(w => w.origine === 'form').length}
          icona="formFill" tono="HUB_MAGENTA" sotto="Creati in automatico, modificabili"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}`, flexWrap: 'wrap' }}>
          <HubSegmenti attivo={vista} onCambia={setVista} voci={[
            { id: 'tutti', label: 'Tutti', conteggio: HUB_WORKFLOW.length },
            { id: 'custom', label: 'Scritti a mano', conteggio: HUB_WORKFLOW.filter(w => w.origine === 'custom').length },
            { id: 'form', label: 'Dai form', conteggio: HUB_WORKFLOW.filter(w => w.origine === 'form').length },
          ]}/>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca un workflow…" larghezza={250}/>
        </div>
        <HubTabella colonne={colonne} righe={lista} chiave={w => w.id} cella={cella} onRiga={setAperto}
          vuoto={<HubVuoto icona="flow" titolo="Nessun workflow" desc="Creane uno: si parte sempre da che cosa lo fa partire."/>}/>
      </AdmCard>
    </div>
  );
}

// ─── Il canvas ──────────────────────────────────────────────────────────────
// ─── I campi di un passo ────────────────────────────────────────────────────
//
// Prima quasi ogni passo era una casella di testo libero: «Ciclo di vita →
// Returning» lo si scriveva a mano, virgola compresa. Funzionava per finta —
// il canvas mostrava una frase giusta e sotto non c'era niente da eseguire.
//
// Adesso ogni passo ha i suoi campi veri e la frase sul canvas la GENERA il
// passo. Il processo resta complesso quanto prima (un invio ha il messaggio,
// il consenso e la finestra oraria; una scrittura ha proprietà, modo e valore):
// quello che cambia è che non bisogna più indovinare come si scrive.

// Il valore da scrivere in una proprietà, con il controllo giusto per il tipo.
function WfValoreProp({ p, valore, onCambia }) {
  if (!p) return null;
  const opzioni = hubOpzioni(p, CONTATTI);
  if (p.tipo === 'bool') {
    return <WrSegmento attivo={valore ? 'si' : 'no'} onCambia={v => onCambia(v === 'si')}
      voci={[{ id: 'si', l: 'Sì' }, { id: 'no', l: 'No' }]}/>;
  }
  if (p.tipo === 'elenco') return <AdmSelect block value={valore} onChange={onCambia} options={opzioni}/>;
  if (p.tipo === 'multi')  return <HubScelteMultiple opzioni={opzioni} scelte={valore} onCambia={onCambia}/>;
  if (p.tipo === 'data')   return <HubData valore={valore} onCambia={onCambia}/>;
  if (p.tipo === 'numero' || p.tipo === 'valuta') return <HubInput tipo="number" valore={valore} onCambia={onCambia} placeholder="0"/>;
  return <HubInput valore={valore} onCambia={onCambia} placeholder="Il valore da scrivere"/>;
}

const WF_MODI_PROP = [
  { id: 'imposta',   l: 'Imposta' },
  { id: 'svuota',    l: 'Svuota' },
  { id: 'daAgente',  l: 'Dalla risposta dell\'agente' },
];

function WfScriviProprieta({ nodo, onCambia }) {
  const [scelta, setScelta] = useStateWf(false);
  const p = HUB_PROP[nodo.prop];
  const modo = nodo.modo || 'imposta';
  const frase = (np, nmodo, nval) => {
    const pp = HUB_PROP[np];
    if (!pp) return 'Scrivi una proprietà';
    if (nmodo === 'svuota')   return pp.label + ' → svuota';
    if (nmodo === 'daAgente') return pp.label + ' ← risposta dell\'agente';
    const v = Array.isArray(nval) ? nval.map(x => hubEtichettaOpzione(pp, x)).join(', ')
      : pp.tipo === 'bool' ? (nval ? 'sì' : 'no')
      : pp.tipo === 'data' ? (nval ? fmtDate(nval) : '…')
      : (nval == null || nval === '') ? '…' : hubEtichettaOpzione(pp, nval);
    return pp.label + ' → ' + v;
  };
  const set = (patch) => {
    const np = Object.assign({ prop: nodo.prop, modo, valore: nodo.valore }, patch);
    onCambia('__molti', { prop: np.prop, modo: np.modo, valore: np.valore, testo: frase(np.prop, np.modo, np.valore) });
  };

  return (
    <React.Fragment>
      <HubCampo label="Quale proprietà" nota="È così che «Ciclo di vita» e «Referral» si riempiono da soli.">
        {scelta || !p ? (
          <div style={{ padding: 8, border: `1px solid ${ADM.PINK}`, borderRadius: 10, background: '#fff' }}>
            <HubSceltaProprieta altezza={220} onScegli={np => { set({ prop: np.id, valore: null }); setScelta(false); }}/>
            {p && <button onClick={() => setScelta(false)} style={{
              marginTop: 6, width: '100%', padding: '6px 10px', borderRadius: 7, border: 'none',
              background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, fontSize: 12.6, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Annulla</button>}
          </div>
        ) : (
          <button onClick={() => setScelta(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7, width: '100%', textAlign: 'left',
            padding: '8px 10px', borderRadius: 9, border: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.4, fontWeight: 700, color: ADM.TEXT,
          }}>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
            <BuIcons.pencil size={13} color={ADM.MUTED_LIGHT}/>
          </button>
        )}
      </HubCampo>
      {p && (
        <React.Fragment>
          <HubCampo label="Che cosa ci scrive">
            <WrSegmento attivo={modo} onCambia={v => set({ modo: v })} voci={WF_MODI_PROP} piccolo/>
          </HubCampo>
          {modo === 'imposta' && (
            <HubCampo label="Il valore">
              <WfValoreProp p={p} valore={nodo.valore} onCambia={v => set({ valore: v })}/>
            </HubCampo>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

function WfInvio({ nodo, onCambia }) {
  const cat = nodo.tipo === 'mail' ? HUB_MAIL : nodo.tipo === 'sms' ? HUB_SMS : HUB_PUSH;
  const scelto = cat.find(x => x.id === nodo.rif) || cat.find(x => x.nome === nodo.testo);
  const consenso = nodo.tipo === 'mail' ? 'consensoMail' : nodo.tipo === 'sms' ? 'consensoSms' : 'consensoPush';
  return (
    <React.Fragment>
      <HubCampo label="Che cosa manda">
        <AdmSelect block value={scelto ? scelto.id : ''} onChange={v => {
          const m = cat.find(x => x.id === v);
          onCambia('__molti', { rif: v, testo: m ? m.nome : nodo.testo });
        }} options={cat.map(x => ({ value: x.id, label: x.nome }))}/>
      </HubCampo>
      {scelto && (
        <div style={{ padding: '10px 11px', borderRadius: 10, background: ADM.HUB_MAGENTA_SOFT }}>
          <div style={{ fontSize: 10.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.HUB_MAGENTA_DARK, marginBottom: 4 }}>Anteprima</div>
          <div style={{ fontSize: 12.6, color: ADM.TEXT, lineHeight: 1.45, fontWeight: 600 }}>{scelto.oggetto || scelto.titolo || scelto.nome}</div>
          <div style={{ fontSize: 12, color: ADM.MUTED, lineHeight: 1.45, marginTop: 2 }}>{scelto.anteprima || scelto.corpo || scelto.testo || ''}</div>
        </div>
      )}
      {/* Il consenso non è una spunta di cortesia: senza, il passo va saltato,
          e chi costruisce il workflow deve poterlo vedere qui. */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 11, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`, cursor: 'pointer' }}>
        <AdmSwitch size="sm" checked={nodo.rispettaConsenso !== false} onChange={v => onCambia('rispettaConsenso', v)}/>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 13.2, fontWeight: 700, color: ADM.TEXT }}>Salta chi non ha il consenso</span>
          <span style={{ display: 'block', fontSize: 12, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>
            Controlla «{(HUB_PROP[consenso] || {}).label || consenso}». Chi non ce l'ha prosegue al passo dopo senza ricevere niente.
          </span>
        </span>
      </label>
    </React.Fragment>
  );
}

function WfElenco({ nodo, onCambia }) {
  const statici = HUB_ELENCHI.filter(e => e.tipo === 'statico');
  const scelto = statici.find(e => e.id === nodo.rif) || statici.find(e => e.nome === nodo.testo);
  const azione = nodo.azione || 'aggiungi';
  const frase = (e, a) => (a === 'togli' ? 'Togli da ' : 'Aggiungi a ') + '«' + (e ? e.nome : '—') + '»';
  return (
    <React.Fragment>
      <HubCampo label="Che cosa fa">
        <WrSegmento attivo={azione} onCambia={v => onCambia('__molti', { azione: v, testo: frase(scelto, v) })}
          voci={[{ id: 'aggiungi', l: 'Aggiungi' }, { id: 'togli', l: 'Togli' }]}/>
      </HubCampo>
      <HubCampo label="In quale elenco" nota="Solo elenchi statici: uno attivo si calcola da sé, e scriverci dentro non vorrebbe dire niente.">
        <AdmSelect block value={scelto ? scelto.id : ''} onChange={v => {
          const e = statici.find(x => x.id === v);
          onCambia('__molti', { rif: v, testo: frase(e, azione) });
        }} options={statici.map(e => ({ value: e.id, label: e.nome }))}/>
      </HubCampo>
    </React.Fragment>
  );
}

function WfAgente({ nodo, onCambia }) {
  const a = HUB_AGENTI.find(x => x.id === nodo.rif) || HUB_AGENTI.find(x => nodo.testo && nodo.testo.startsWith(x.nome));
  return (
    <React.Fragment>
      <HubCampo label="Quale agente">
        <AdmSelect block value={a ? a.id : ''} onChange={v => {
          const na = HUB_AGENTI.find(x => x.id === v);
          onCambia('__molti', { rif: v, testo: na ? na.nome + (nodo.compito ? ' → ' + nodo.compito : '') : nodo.testo });
        }} options={HUB_AGENTI.map(x => ({ value: x.id, label: x.nome + ' · ' + x.ruolo }))}/>
      </HubCampo>
      {a && <div style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.5, padding: '0 2px' }}>{a.obiettivo}</div>}
      <HubCampo label="Che cosa deve fare qui" nota="L'obiettivo dell'agente vale sempre; questo è il compito di questo passo.">
        <HubArea righe={2} valore={nodo.compito} onCambia={v => onCambia('__molti', { compito: v, testo: (a ? a.nome : 'Agente') + (v ? ' → ' + v : '') })}
          placeholder="es. stima coperti e scontrino dal sito"/>
      </HubCampo>
      <HubCampo label="Quanto può aspettare" nota="Oltre questo tempo il passo si chiude con «l'agente non ha concluso», e i rami possono prenderlo.">
        <WrDurata n={(nodo.tetto || {}).n || 10} unita={(nodo.tetto || {}).unita || 'minuti'} onCambia={(n, u) => onCambia('tetto', { n, unita: u })}/>
      </HubCampo>
    </React.Fragment>
  );
}

const WF_METODI = [{ id: 'GET', l: 'GET' }, { id: 'POST', l: 'POST' }, { id: 'PUT', l: 'PUT' }, { id: 'DELETE', l: 'DEL' }];

function WfWebhook({ nodo, onCambia }) {
  const metodo = nodo.metodo || 'POST';
  const url = nodo.url || (nodo.testo || '').replace(/^(GET|POST|PUT|DELETE)\s+/, '');
  return (
    <React.Fragment>
      <HubCampo label="Chiamata">
        <div style={{ display: 'flex', gap: 7 }}>
          <WrSegmento piccolo attivo={metodo} onCambia={v => onCambia('__molti', { metodo: v, testo: v + ' ' + url })} voci={WF_METODI}/>
        </div>
      </HubCampo>
      <HubCampo label="Indirizzo">
        <HubInput valore={url} onCambia={v => onCambia('__molti', { url: v, testo: metodo + ' ' + v })} placeholder="https://…"/>
      </HubCampo>
      <HubCampo label="Corpo della richiesta" nota="Le doppie graffe prendono i valori del contatto: {{nome}}, {{email}}.">
        <HubArea righe={3} valore={nodo.corpo} onCambia={v => onCambia('corpo', v)} placeholder={'{ "locale": "{{nome}}", "piano": "{{piano}}" }'}/>
      </HubCampo>
      <HubCampo label="Se non risponde">
        <WrSegmento attivo={nodo.seErrore || 'prosegui'} onCambia={v => onCambia('seErrore', v)}
          voci={[{ id: 'prosegui', l: 'Prosegue' }, { id: 'ferma', l: 'Ferma il contatto' }, { id: 'riprova', l: 'Riprova 3 volte' }]} piccolo/>
      </HubCampo>
    </React.Fragment>
  );
}

function HubWorkflowCanvas({ wf, nuovo, onChiudi }) {
  const [nodi, setNodi] = useStateWf(wf.nodi);
  const [sel, setSel] = useStateWf(null);   // percorso: [2] oppure [2,'r3',1]
  const [nome, setNome] = useStateWf(wf.nome);
  const [attivo, setAttivo] = useStateWf(wf.stato === 'attivo');

  // Il selezionato può essere un NODO (percorso che finisce con un numero) o
  // un RAMO (percorso che finisce con l'id del ramo): sono due cose diverse e
  // l'ispettore mostra due pannelli diversi.
  const suRamo = !!sel && typeof sel[sel.length - 1] === 'string';
  const scelto = sel ? wcLeggi(nodi, sel) : null;

  // `'__molti'` cambia più campi in un colpo solo: quasi tutti i passi
  // riscrivono `testo` insieme al campo vero, e farlo in due `setNodi` di
  // fila fa vincere l'ultimo — la frase restava indietro di una modifica.
  const cambiaNodo = (k, v) => setNodi(ns => wcMappa(ns, sel, n =>
    k === '__molti' ? Object.assign({}, n, v) : Object.assign({}, n, { [k]: v })));
  const cambiaRamo = (r) => setNodi(ns => wcMappa(ns, sel, () => r));

  // Aggiungere un passo: se è selezionato un nodo, entra subito dopo di lui,
  // nella SUA corsia. Se è selezionato un ramo, entra in fondo a quel ramo.
  const aggiungi = (tipo) => {
    const n = { tipo, testo: HUB_WF_NODI[tipo].label };
    if (tipo === 'condizione') {
      n.testo = 'Che cosa vale per questo contatto?';
      n.rami = [
        { id: 'r' + Date.now(), label: 'Primo caso', quando: hubQuandoVuoto(), nodi: [] },
        { id: 'a' + (Date.now() + 1), label: 'Tutti gli altri', altrimenti: true,
          quando: { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] }, nodi: [] },
      ];
    }
    // Un'attesa nasce già configurata («2 giorni»): un passo che appare vuoto e
    // va aperto per dire qualcosa di ovvio è un giro a vuoto per tutti.
    if (tipo === 'attesa') { n.attesa = hubAttesaVuota(); n.testo = hubDescriviAttesa(n.attesa); }
    if (!sel) {
      setNodi(ns => { const c = ns.slice(); c.splice(Math.max(1, c.length - 1), 0, n); return c; });
      return;
    }
    if (suRamo) {
      setNodi(ns => wcMappa(ns, sel, r => Object.assign({}, r, { nodi: [...(r.nodi || []), n] })));
      return;
    }
    const dove = sel.slice(0, -1), i = sel[sel.length - 1];
    setNodi(ns => dove.length === 0
      ? (() => { const c = ns.slice(); c.splice(i + 1, 0, n); return c; })()
      : wcMappa(ns, dove, r => { const c = (r.nodi || []).slice(); c.splice(i + 1, 0, n); return Object.assign({}, r, { nodi: c }); }));
  };

  // Aggiungere un ramo lo SELEZIONA: chi lo crea vuole scriverne le regole
  // adesso, e un ramo nuovo senza regole se le prende tutte.
  const aggiungiRamo = (path) => {
    const id = 'r' + Date.now();
    setNodi(ns => wcMappa(ns, path, n => Object.assign({}, n, {
      rami: (() => {
        const r = (n.rami || []).slice();
        const nuovoR = { id, label: 'Nuovo caso', quando: hubQuandoVuoto(), nodi: [] };
        const i = r.findIndex(x => x.altrimenti);
        if (i >= 0) r.splice(i, 0, nuovoR); else r.push(nuovoR);
        return r;
      })(),
    })));
    setSel([...path, id]);
  };

  const eliminaSelezionato = () => {
    if (!sel) return;
    if (suRamo) {
      const dove = sel.slice(0, -1), id = sel[sel.length - 1];
      setNodi(ns => wcMappa(ns, dove, n => Object.assign({}, n, { rami: (n.rami || []).filter(r => r.id !== id) })));
    } else {
      const dove = sel.slice(0, -1), i = sel[sel.length - 1];
      setNodi(ns => dove.length === 0
        ? ns.filter((_, j) => j !== i)
        : wcMappa(ns, dove, r => Object.assign({}, r, { nodi: (r.nodi || []).filter((_, j) => j !== i) })));
    }
    setSel(null);
  };

  const passi = hubContaNodi(nodi);

  // L'albero è più largo della colonna appena c'è una condizione con tre rami:
  // il contenitore scorre, ma parte da sinistra e il tronco — che sta in mezzo
  // — si vede tagliato. Alla prima resa lo si centra, così si apre su quello
  // che conta e i rami laterali si raggiungono scorrendo.
  const telaRef = useRefWf(null);
  React.useLayoutEffect(() => {
    const el = telaRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [nodi]);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Workflow</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{nome || 'Nuovo workflow'}</span>
      </div>

      <HubTestata occhiello={nuovo ? 'Automazioni' : `Automazioni · ${WF_STATI[wf.stato].label}`}
        titolo={nuovo ? 'Crea un workflow' : wf.nome} colore="HUB_VIOLA"
        sotto={nuovo ? 'Si parte dall\'innesco. Dove serve decidere, si mette una condizione: apre più rami, e ogni ramo dice a quali contatti tocca.' : wf.descrizione}
        azioni={
          <React.Fragment>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginRight: 4 }}>
              <AdmSwitch size="sm" checked={attivo} onChange={setAttivo}/>
              <span style={{ fontSize: 13.4, fontWeight: 700, color: attivo ? ADM.OK : ADM.MUTED }}>{attivo ? 'Attivo' : 'In pausa'}</span>
            </label>
            <HubStrumento icona="eye">Prova a secco</HubStrumento>
            <HubStrumento forte icona="check" onClick={onChiudi}>Salva</HubStrumento>
          </React.Fragment>
        }/>

      {!nuovo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
          <HubTile etichetta="Iscritti in tutto" valore={fmtNum(wf.iscritti)} icona="users3"/>
          <HubTile etichetta="In corso adesso" valore={fmtNum(wf.inCorso)} tono="WARN" icona="hourglass"/>
          <HubTile etichetta="Completati" valore={fmtNum(wf.completati)} tono="OK" icona="check"/>
          <HubTile etichetta="Passi, rami compresi" valore={passi} icona="flow" sotto={`Ultima modifica ${fmtDate(wf.modificato)}`}/>
        </div>
      )}

      {/* L'ispettore è la colonna larga: è lì che si scrive la logica, e una
          regola con proprietà, operatore e valore in 306px si impila male. */}
      <div style={{ display: 'grid', gridTemplateColumns: '196px minmax(0,1fr) 350px', gap: 12, alignItems: 'start' }}>
        {/* La cassetta degli attrezzi, divisa per mestiere */}
        <AdmCard padding={14}>
          {nuovo && (
            <HubCampo label="Nome del workflow">
              <HubInput valore={nome} onCambia={setNome} placeholder="es. Onboarding nuovo locale"/>
            </HubCampo>
          )}
          <div style={{ fontSize: 12.2, color: ADM.MUTED, margin: nuovo ? '14px 0 10px' : '0 0 10px', lineHeight: 1.45 }}>
            {sel ? (suRamo ? 'Il passo entra in fondo al ramo selezionato.' : 'Il passo entra subito dopo quello selezionato.')
                 : 'Seleziona un passo per scegliere dove inserire; altrimenti va in fondo.'}
          </div>
          {HUB_WF_FAMIGLIE.map(fam => {
            const voci = Object.keys(HUB_WF_NODI).filter(t => HUB_WF_NODI[t].famiglia === fam.id && t !== 'trigger' && t !== 'fine');
            if (!voci.length) return null;
            return (
              <div key={fam.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10.8, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 5 }}>{fam.label}</div>
                {voci.map(t => {
                  const d = HUB_WF_NODI[t];
                  const Ic = BuIcons[d.icona];
                  return (
                    <button key={t} onClick={() => aggiungi(t)} className="adm-actionrow" style={{
                      display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                      padding: '7px 8px', marginBottom: 2, borderRadius: 9, border: 'none',
                      background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', flexShrink: 0,
                        background: ADM[d.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[d.color] || ADM.INK,
                      }}><Ic size={13}/></span>
                      <span style={{ flex: 1, fontSize: 13.1, fontWeight: 600, color: ADM.TEXT }}>{d.label}</span>
                      <BuIcons.plus size={12} color={ADM.MUTED_LIGHT}/>
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div style={{ padding: 11, borderRadius: 10, background: ADM.HUB_VIOLA_SOFT, fontSize: 12.2, color: ADM.HUB_VIOLA_DARK, lineHeight: 1.5 }}>
            <strong>Se / allora</strong> apre due rami: il primo con i suoi criteri, e l'«altrimenti» che raccoglie tutti gli altri.
          </div>
        </AdmCard>

        {/* Il flusso */}
        <AdmCard padding={0} style={{ overflow: 'hidden' }}>
          <div ref={telaRef} onClick={() => setSel(null)} className="hub-scroll" style={{
            background: `radial-gradient(circle at 1px 1px, ${ADM.BORDER} 1px, transparent 0)`,
            backgroundSize: '18px 18px', backgroundColor: ADM.PANEL_SOFT,
            padding: '26px 22px 34px', overflowX: 'auto',
          }}>
            {/* L'albero si allarga a ogni ramo. Il contenitore scorre in
                orizzontale e il contenuto si CENTRA solo quando ci sta:
                con `align-items: center` in un contenitore che scorre, quello
                che esce a sinistra non si raggiunge più. */}
            <div style={{ width: 'max-content', minWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {nodi.map((n, i) => (
                n.tipo === 'condizione'
                  ? <WcCondizione key={i} nodo={n} path={[i]} sel={sel} onSel={setSel} onAggiungiRamo={aggiungiRamo}/>
                  : <WcNodo key={i} nodo={n} path={[i]} primo={i === 0} selezionato={wcUguali(sel, [i])} onClick={setSel}/>
              ))}
            </div>
          </div>
        </AdmCard>

        {/* L'ispettore */}
        <AdmCard padding={16}>
          {suRamo && scelto ? (
            <WcIspettoreRamo ramo={scelto} onCambia={cambiaRamo} onElimina={eliminaSelezionato}/>
          ) : scelto ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center',
                  background: ADM[HUB_WF_NODI[scelto.tipo].color + '_SOFT'] || ADM.NEUTRAL_SOFT,
                  color: ADM[HUB_WF_NODI[scelto.tipo].color] || ADM.INK,
                }}>{React.createElement(BuIcons[HUB_WF_NODI[scelto.tipo].icona], { size: 14 })}</span>
                <span style={{ flex: 1, fontSize: 14.2, fontWeight: 700, color: ADM.TEXT }}>{HUB_WF_NODI[scelto.tipo].label}</span>
              </div>

              {scelto.tipo === 'trigger' && (
                <HubCampo label="Che cosa lo fa partire" nota="Un innesco solo per workflow: se ne servono due, si fanno due workflow.">
                  <AdmSelect block value={scelto.testo} onChange={v => cambiaNodo('testo', v)} options={[
                    { value: scelto.testo, label: scelto.testo },
                    ...HUB_FORM.map(f => ({ value: 'Submission form «' + f.nome + '»', label: 'Submission form · ' + f.nome })),
                    ...HUB_ELENCHI.map(e => ({ value: 'Entra nell\'elenco «' + e.nome + '»', label: 'Entra nell\'elenco · ' + e.nome })),
                    { value: 'Una proprietà cambia valore', label: 'Una proprietà cambia valore' },
                    { value: 'Ogni giorno a un\'ora fissa', label: 'Ogni giorno a un\'ora fissa' },
                  ]}/>
                </HubCampo>
              )}
              {scelto.tipo === 'attesa' && (
                <WrAttesa attesa={hubNodoAttesa(scelto) || hubAttesaVuota()} onCambia={a => {
                  // Il testo della scatola si riscrive da solo dalla
                  // configurazione: due sorgenti di verità e sul canvas
                  // resta scritto «2 giorni» mentre l'attesa aspetta un click.
                  setNodi(ns => wcMappa(ns, sel, n => Object.assign({}, n, { attesa: a, testo: hubDescriviAttesa(a) })));
                }}/>
              )}
              {scelto.tipo === 'condizione' && (
                <React.Fragment>
                  <HubCampo label="La domanda" nota="Il titolo del bivio. La logica vera sta sui rami: clicca un ramo per scrivere le sue regole.">
                    <HubInput valore={scelto.testo} onCambia={v => cambiaNodo('testo', v)} placeholder="es. Ha aperto la mail?"/>
                  </HubCampo>
                  <div style={{ padding: 12, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>I rami</div>
                    {(scelto.rami || []).map((r, i) => {
                      const q = hubRamoQuando(r), n = hubConteggioRegole(q);
                      return (
                        <button key={r.id} onClick={() => setSel([...sel, r.id])} className="adm-actionrow" style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 5px', width: '100%',
                          textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
                          fontFamily: 'inherit', borderRadius: 7,
                        }}>
                          <span style={{ fontSize: 9.6, fontWeight: 800, color: ADM.MUTED_SOFT, minWidth: 62, flexShrink: 0 }}>
                            {r.altrimenti ? 'ALTRIMENTI' : i === 0 ? 'SE' : 'ALTR. SE'}
                          </span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                          {!r.altrimenti && <HubPillola size="sm" color={n ? 'OK' : 'DANGER'}>{n || '0'}</HubPillola>}
                        </button>
                      );
                    })}
                    <button onClick={() => aggiungiRamo(sel)} style={{
                      marginTop: 8, width: '100%', padding: '7px 10px', borderRadius: 8,
                      border: `1px dashed ${ADM.HUB_VIOLA}`, background: '#fff', color: ADM.HUB_VIOLA_DARK,
                      fontSize: 12.8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}>+ Aggiungi un ramo</button>
                  </div>
                </React.Fragment>
              )}
              {(scelto.tipo === 'mail' || scelto.tipo === 'sms' || scelto.tipo === 'push') && (
                <WfInvio nodo={scelto} onCambia={cambiaNodo}/>
              )}
              {scelto.tipo === 'proprieta' && <WfScriviProprieta nodo={scelto} onCambia={cambiaNodo}/>}
              {scelto.tipo === 'elenco' && <WfElenco nodo={scelto} onCambia={cambiaNodo}/>}
              {scelto.tipo === 'agente' && <WfAgente nodo={scelto} onCambia={cambiaNodo}/>}
              {scelto.tipo === 'webhook' && <WfWebhook nodo={scelto} onCambia={cambiaNodo}/>}
              {scelto.tipo === 'script' && (
                <HubCampo label="Che cosa esegue"
                  nota="Nel prototipo è una descrizione; in produzione qui ci va il codice.">
                  <HubArea valore={scelto.testo} onCambia={v => cambiaNodo('testo', v)} righe={3}/>
                </HubCampo>
              )}

              {scelto.tipo !== 'trigger' && scelto.tipo !== 'fine' && (
                <button onClick={eliminaSelezionato} style={{
                  marginTop: 2, padding: '8px 10px', borderRadius: 9, border: `1px solid ${ADM.BORDER}`,
                  background: '#fff', color: ADM.DANGER, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>Elimina il passo</button>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: ADM.MUTED, lineHeight: 1.6, padding: '8px 2px' }}>
              Clicca un <strong>passo</strong> per modificarlo, o l'etichetta di un <strong>ramo</strong> per scrivere quando si prende — proprietà, operatore, valore, esattamente come nei filtri della rubrica.
            </div>
          )}
        </AdmCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT
// ═══════════════════════════════════════════════════════════════════════════
//
// Un agente non è un workflow con dentro l'intelligenza artificiale: un
// workflow sa in anticipo tutti i passi, un agente no. Gli si dà un obiettivo,
// le fonti su cui può guardare e quando svegliarsi; che cosa fa, lo decide.
//
// Per questo la scheda di un agente è fatta di frasi e non di scatole, e
// la cosa più importante della pagina è il CRUSCOTTO: chi è acceso, chi è
// fermo, e che cosa ha prodotto l'ultimo giro. Un team di agenti che nessuno
// guarda è un modo caro di sbagliare in silenzio.

const AG_STATI = {
  attivo:   { label: 'Attivo',   color: 'OK' },
  inattivo: { label: 'Inattivo', color: 'PLAN_FREE' },
  errore:   { label: 'In errore', color: 'DANGER' },
};

function HubAgentPage() {
  const [aperto, setAperto] = useStateWf(null);
  const [nuovo, setNuovo] = useStateWf(false);
  // Due schermate, e la seconda non è un dettaglio della prima: «Squadra» sono
  // gli agenti uno per uno, «Ambiente» è quello che fanno insieme.
  const [vistaAg, setVistaAg] = useStateWf('squadra');
  if (nuovo) return <HubAgentEditor onChiudi={() => setNuovo(false)}/>;
  if (aperto) return <HubAgentDettaglio agente={aperto} onChiudi={() => setAperto(null)}/>;

  const attivi = HUB_AGENTI.filter(a => a.stato === 'attivo').length;
  const inErrore = HUB_AGENTI.filter(a => a.stato === 'errore').length;
  const giri = HUB_AGENTI.reduce((s, a) => s + a.esecuzioni, 0);
  const esiti = HUB_AGENTI.reduce((s, a) => s + a.esiti, 0);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata occhiello="Intelligenza" titolo="Agent" colore="HUB_VIOLA"
        sotto={vistaAg === 'squadra'
          ? 'Agenti costruiti su quello che Hubble già sa dei tuoi clienti. Gli dai un obiettivo e delle fonti; il resto lo decidono loro, e qui vedi che cosa hanno prodotto.'
          : 'Dove gli agenti lavorano insieme. Non si chiamano fra loro: scrivono su una lavagna per argomento, e chi è iscritto si sveglia.'}
        colore="HUB_VIOLA"
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo(true)}>Crea agente</HubStrumento>}/>

      <HubSegmenti attivo={vistaAg} onCambia={setVistaAg} voci={[
        { id: 'squadra',  label: 'La squadra', conteggio: HUB_AGENTI.length },
        { id: 'ambiente', label: 'Ambiente',   conteggio: HUB_AMB_CATENE.length },
      ]}/>

      {vistaAg === 'ambiente' ? <HubAmbientePage/> : (
      <React.Fragment>
      {/* Il cruscotto del team IA */}
      <div style={{
        borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(120deg, #2A0E3D 0%, #5B0D6B 45%, #8E0C9E 100%)',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, opacity: 0.30,
          background: 'radial-gradient(700px 240px at 82% -30%, rgba(255,31,90,0.85), transparent 70%)',
        }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <BuIcons.sparkles size={17} color="#fff"/>
            <span style={{ fontSize: 11.6, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>Il team IA, adesso</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 18 }}>
            {[
              { l: 'Agenti attivi', v: attivi, s: `su ${HUB_AGENTI.length} configurati` },
              { l: 'In errore', v: inErrore, s: inErrore ? 'da guardare subito' : 'nessuno, per ora' },
              { l: 'Esecuzioni', v: fmtNum(giri), s: 'da quando sono accesi' },
              { l: 'Con un esito utile', v: mkPc(esiti, giri), s: `${fmtNum(esiti)} risultati prodotti` },
            ].map(x => (
              <div key={x.l}>
                <div style={{ fontSize: 11.4, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.72 }}>{x.l}</div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 4, lineHeight: 1 }}>{x.v}</div>
                <div style={{ fontSize: 12.4, opacity: 0.78, marginTop: 4 }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 13 }}>
        {HUB_AGENTI.map(a => {
          const st = AG_STATI[a.stato];
          return (
            <div key={a.id} className="hub-card" onClick={() => setAperto(a)} style={{
              background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 14, padding: 17,
              boxShadow: ADM.CARD_SHADOW, display: 'flex', flexDirection: 'column', gap: 11,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                <span style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: a.stato === 'errore' ? ADM.DANGER_SOFT : ADM.HUB_VIOLA_SOFT,
                  color: a.stato === 'errore' ? ADM.DANGER : ADM.HUB_VIOLA_DARK,
                }}><BuIcons.sparkles size={19}/></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.2, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                  <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 2 }}>{a.ruolo}</div>
                </div>
                <HubStato stato={a.stato} mappa={AG_STATI}/>
              </div>

              <div style={{ fontSize: 13.2, color: ADM.TEXT, lineHeight: 1.55 }}>{a.obiettivo}</div>

              <div style={{
                padding: 11, borderRadius: 10, fontSize: 12.6, lineHeight: 1.5,
                background: a.stato === 'errore' ? ADM.DANGER_SOFT : ADM.PANEL_SOFT,
                color: a.stato === 'errore' ? '#8B1A1A' : ADM.MUTED,
                border: `1px solid ${a.stato === 'errore' ? '#F3C9C9' : ADM.BORDER_SOFT}`,
              }}>
                <div style={{ fontSize: 10.8, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4, opacity: 0.75 }}>
                  Ultimo giro · {fmtRelative(a.ultimoGiro)}
                </div>
                {a.ultimoEsito}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 2 }}>
                <span style={{ fontSize: 12.2, color: ADM.MUTED }}><strong style={{ color: ADM.TEXT, fontWeight: 700 }}>{fmtNum(a.esecuzioni)}</strong> esecuzioni</span>
                <span style={{ fontSize: 12.2, color: ADM.MUTED }}><strong style={{ color: ADM.TEXT, fontWeight: 700 }}>{mkPc(a.esiti, a.esecuzioni)}</strong> con esito</span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 12.2, fontWeight: 600, color: ADM.MUTED_SOFT }}>{a.innesco}</span>
              </div>
            </div>
          );
        })}
      </div>
      </React.Fragment>
      )}
    </div>
  );
}

function HubAgentDettaglio({ agente: a, onChiudi }) {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Agent</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{a.nome}</span>
      </div>
      <HubTestata occhiello={`Agente · ${AG_STATI[a.stato].label}`} titolo={a.nome} colore="HUB_VIOLA" sotto={a.obiettivo}
        azioni={
          <React.Fragment>
            <HubStrumento icona="play">Esegui adesso</HubStrumento>
            <HubStrumento icona="pencil" forte>Modifica</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Esecuzioni" valore={fmtNum(a.esecuzioni)} icona="refresh"/>
        <HubTile etichetta="Con esito utile" valore={mkPc(a.esiti, a.esecuzioni)} tono="OK" icona="check" sotto={`${fmtNum(a.esiti)} risultati`}/>
        <HubTile etichetta="Ultimo giro" valore={fmtRelative(a.ultimoGiro)} icona="clock" sotto={a.innesco}/>
        <HubTile etichetta="Modello" valore={a.modello} icona="sparkles" tono="HUB_VIOLA"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
        <AdmCard padding={18}>
          <HubSezione titolo="Che cosa ha prodotto l'ultimo giro">
            <div style={{
              padding: 15, borderRadius: 12, fontSize: 14, lineHeight: 1.6,
              background: a.stato === 'errore' ? ADM.DANGER_SOFT : ADM.HUB_VIOLA_SOFT,
              color: a.stato === 'errore' ? '#8B1A1A' : ADM.TEXT,
              border: `1px solid ${a.stato === 'errore' ? '#F3C9C9' : '#EBD3F5'}`,
            }}>{a.ultimoEsito}</div>
          </HubSezione>
          <div style={{ marginTop: 18 }}>
            <HubSezione titolo="Gli ultimi giri">
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0',
                  borderBottom: i < 3 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 && a.stato === 'errore' ? ADM.DANGER : ADM.OK,
                  }}/>
                  <span style={{ flex: 1, fontSize: 13.4, color: ADM.TEXT }}>
                    {i === 0 && a.stato === 'errore' ? 'Interrotto: quota del fornitore esaurita' : 'Completato — ' + (2 + i * 3) + ' elementi esaminati'}
                  </span>
                  <span style={{ fontSize: 12.6, color: ADM.MUTED }}>{fmtRelative(new Date(a.ultimoGiro.getTime() - i * 86400000))}</span>
                </div>
              ))}
            </HubSezione>
          </div>
        </AdmCard>

        <AdmCard padding={18}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>Com'è configurato</div>
          {[['Ruolo', a.ruolo], ['Innesco', a.innesco], ['Modello', a.modello]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
              <span style={{ fontSize: 12.6, color: ADM.MUTED, width: 74, flexShrink: 0, fontWeight: 600 }}>{k}</span>
              <span style={{ fontSize: 13.2, color: ADM.TEXT, flex: 1 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12.6, color: ADM.MUTED, fontWeight: 600, marginBottom: 8 }}>Fonti su cui può guardare</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {a.fonti.map(f => <HubPillola key={f} color="HUB_VIOLA">{f}</HubPillola>)}
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`, fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.55 }}>
            L'agente vede solo queste fonti. Aggiungerne una gli dà più contesto e gli costa di più a ogni giro.
          </div>
        </AdmCard>
      </div>
    </div>
  );
}

function HubAgentEditor({ onChiudi }) {
  const [nome, setNome] = useStateWf('');
  const [obiettivo, setObiettivo] = useStateWf('');
  const [fonti, setFonti] = useStateWf(['Contatti']);
  const [modello, setModello] = useStateWf('veloce');
  const [innesco, setInnesco] = useStateWf('Ogni giorno alle 7:00');

  const FONTI = ['Contatti', 'Elenchi', 'Ordini', 'Ticket di assistenza', 'FAQ', 'Guide', 'Analisi Dati', 'Marketing', 'Storico invii', 'Web'];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Agent</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{nome || 'Nuovo agente'}</span>
      </div>
      <HubTestata occhiello="Intelligenza" titolo="Crea un agente" colore="HUB_VIOLA"
        sotto="Un obiettivo scritto come lo diresti a una persona, le fonti che può leggere, e quando deve svegliarsi."
        azioni={
          <React.Fragment>
            <HubStrumento onClick={onChiudi}>Annulla</HubStrumento>
            <HubStrumento forte icona="check" onClick={onChiudi}>Crea agente</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 330px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <HubCampo label="Nome"><HubInput valore={nome} onCambia={setNome} placeholder="es. Analista della retention"/></HubCampo>
              <HubCampo label="Obiettivo"
                nota="Scrivilo come lo diresti a una persona il primo giorno. «Trova i locali che stanno per andarsene, e dimmi perché» funziona meglio di un elenco di regole.">
                <HubArea valore={obiettivo} onCambia={setObiettivo} righe={4}
                  placeholder="Trova i locali che stanno per andarsene prima che lo facciano, e dimmi perché."/>
              </HubCampo>
            </div>
          </AdmCard>

          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 5 }}>Su che cosa può guardare</div>
            <div style={{ fontSize: 13, color: ADM.MUTED, marginBottom: 13, lineHeight: 1.5 }}>
              Più fonti gli dai, più contesto ha — e più costa ogni esecuzione. Dagli quello che gli serve, non tutto.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {FONTI.map(f => {
                const on = fonti.includes(f);
                return (
                  <button key={f} onClick={() => setFonti(fs => on ? fs.filter(x => x !== f) : [...fs, f])} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999,
                    border: `1px solid ${on ? ADM.HUB_VIOLA : ADM.BORDER}`, cursor: 'pointer', fontFamily: 'inherit',
                    background: on ? ADM.HUB_VIOLA_SOFT : '#fff',
                    color: on ? ADM.HUB_VIOLA_DARK : ADM.TEXT, fontSize: 13, fontWeight: 600,
                  }}>
                    {on && <BuIcons.check size={12}/>}{f}
                  </button>
                );
              })}
            </div>
          </AdmCard>

          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 12 }}>Il motore</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
              {HUB_AGENTI_MODELLI.map(m => {
                const on = modello === m.id;
                return (
                  <button key={m.id} onClick={() => setModello(m.id)} style={{
                    textAlign: 'left', padding: 13, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${on ? ADM.HUB_VIOLA : ADM.BORDER}`, background: on ? ADM.HUB_VIOLA_SOFT : '#fff',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: on ? ADM.HUB_VIOLA_DARK : ADM.TEXT }}>{m.label}</div>
                    <div style={{ fontSize: 12.3, color: ADM.MUTED, marginTop: 4, lineHeight: 1.45 }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <HubCampo label="Quando si sveglia">
                <AdmSelect block value={innesco} onChange={setInnesco} options={[
                  { value: 'Ogni giorno alle 7:00', label: 'Ogni giorno alle 7:00' },
                  { value: 'Ogni lunedì alle 8:00', label: 'Ogni lunedì alle 8:00' },
                  { value: 'Quando entra un lead', label: 'Quando entra un lead' },
                  { value: 'Quando arriva un ticket', label: 'Quando arriva un ticket' },
                  { value: 'Chiamato da un workflow', label: 'Chiamato da un workflow' },
                  { value: 'A richiesta', label: 'Solo quando lo chiedo io' },
                ]}/>
              </HubCampo>
            </div>
          </AdmCard>
        </div>

        <AdmCard padding={0} style={{ overflow: 'hidden', position: 'sticky', top: 0 }}>
          <div style={{ padding: 18, background: 'linear-gradient(130deg, #2A0E3D 0%, #7A0C8C 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <BuIcons.sparkles size={17} color="#fff"/>
              <span style={{ fontSize: 11.4, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', opacity: 0.85 }}>L'agente, in una frase</span>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>
              {nome ? <strong>{nome}</strong> : <em style={{ opacity: 0.6 }}>Un agente senza nome</em>}
              {' '}si sveglia <strong>{innesco.toLowerCase()}</strong>, guarda {fonti.length ? <strong>{fonti.join(', ').toLowerCase()}</strong> : <em style={{ opacity: 0.6 }}>niente</em>},
              {' '}e prova a: {obiettivo ? <strong>{obiettivo}</strong> : <em style={{ opacity: 0.6 }}>fare qualcosa che non hai ancora scritto.</em>}
            </div>
          </div>
          <div style={{ padding: 16, fontSize: 12.6, color: ADM.MUTED, lineHeight: 1.6 }}>
            Se questa frase non sta in piedi, non starà in piedi nemmeno l'agente. È la prova più rapida che si può fare prima di accenderlo.
          </div>
        </AdmCard>
      </div>
    </div>
  );
}

window.HubWorkflowPage = HubWorkflowPage;
window.HubAgentPage = HubAgentPage;
window.WF_STATI = WF_STATI;
window.AG_STATI = AG_STATI;

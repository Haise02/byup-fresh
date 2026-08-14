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

const { useState: useStateWf, useMemo: useMemoWf } = React;

const WF_STATI = {
  attivo:  { label: 'Attivo',  color: 'OK' },
  sospeso: { label: 'Sospeso', color: 'WARN' },
  bozza:   { label: 'Bozza',   color: 'PLAN_FREE' },
};

// ─── Il nodo disegnato ──────────────────────────────────────────────────────
function WfNodo({ nodo, primo, ultimo, selezionato, onClick }) {
  const d = HUB_WF_NODI[nodo.tipo] || HUB_WF_NODI.script;
  const Ic = BuIcons[d.icona];
  const tinta = ADM[d.color] || ADM.INK;
  const soft = ADM[d.color + '_SOFT'] || ADM.NEUTRAL_SOFT;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {!primo && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 2, height: 18, background: ADM.BORDER }}/>
          {nodo.ramo && (
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
              background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 999,
              padding: '2px 9px', color: ADM.MUTED, margin: '-1px 0',
            }}>ramo «{nodo.ramo}»</span>
          )}
          {nodo.ramo && <div style={{ width: 2, height: 18, background: ADM.BORDER }}/>}
        </div>
      )}
      <button onClick={onClick} className="hub-card" style={{
        width: '100%', maxWidth: 460, display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '13px 15px', textAlign: 'left', fontFamily: 'inherit',
        border: `1.5px solid ${selezionato ? ADM.PINK : ADM.BORDER}`,
        borderRadius: 13, background: '#fff',
        boxShadow: selezionato ? `0 10px 26px -12px ${ADM.HUB_GLOW}` : ADM.CARD_SHADOW,
      }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: soft, color: tinta }}>
          <Ic size={17}/>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 11.4, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: tinta }}>{d.label}</span>
          <span style={{ display: 'block', fontSize: 14.2, fontWeight: 600, color: ADM.TEXT, marginTop: 3, lineHeight: 1.4 }}>{nodo.testo || '—'}</span>
        </span>
      </button>
      {nodo.rami && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          {nodo.rami.map(r => (
            <span key={r} style={{
              fontSize: 11.5, fontWeight: 800, padding: '3px 11px', borderRadius: 999,
              background: r === 'Sì' ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT,
              color: r === 'Sì' ? ADM.OK : ADM.MUTED,
            }}>{r}</span>
          ))}
        </div>
      )}
      {ultimo && <div style={{ width: 2, height: 14, background: 'transparent' }}/>}
    </div>
  );
}

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
    { id: 'passi',      label: 'Passi',      w: '0.7fr', destra: true },
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
    if (id === 'passi') return <span style={{ fontSize: 13.6, fontWeight: 600 }}>{w.nodi.length}</span>;
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
function HubWorkflowCanvas({ wf, nuovo, onChiudi }) {
  const [nodi, setNodi] = useStateWf(wf.nodi);
  const [sel, setSel] = useStateWf(null);
  const [nome, setNome] = useStateWf(wf.nome);
  const [attivo, setAttivo] = useStateWf(wf.stato === 'attivo');

  const aggiungi = (tipo) => {
    const n = { tipo, testo: HUB_WF_NODI[tipo].label };
    const i = sel != null ? sel : nodi.length - 2;
    const ns = nodi.slice();
    ns.splice(Math.max(1, i + 1), 0, n);
    setNodi(ns); setSel(Math.max(1, i + 1));
  };
  const elimina = (i) => { setNodi(nodi.filter((_, j) => j !== i)); setSel(null); };
  const muovi = (i, d) => {
    const j = i + d;
    if (j < 1 || j >= nodi.length - 1 || i < 1 || i >= nodi.length - 1) return;
    const ns = nodi.slice(); [ns[i], ns[j]] = [ns[j], ns[i]]; setNodi(ns); setSel(j);
  };
  const cambia = (i, k, v) => setNodi(nodi.map((n, j) => j === i ? Object.assign({}, n, { [k]: v }) : n));

  const nodo = sel != null ? nodi[sel] : null;

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
        sotto={nuovo ? 'Si parte dall\'innesco, si aggiungono i passi in mezzo, si finisce.' : wf.descrizione}
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
          <HubTile etichetta="Ultima modifica" valore={fmtDate(wf.modificato)} icona="clock" sotto={`da ${wf.autore}`}/>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '232px minmax(0,1fr) 300px', gap: 14, alignItems: 'start' }}>
        {/* Palette dei passi */}
        <AdmCard padding={14}>
          {nuovo && (
            <HubCampo label="Nome del workflow">
              <HubInput valore={nome} onCambia={setNome} placeholder="es. Onboarding nuovo locale"/>
            </HubCampo>
          )}
          <div style={{ fontSize: 11.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, margin: nuovo ? '16px 0 9px' : '0 0 9px' }}>
            Aggiungi un passo
          </div>
          {Object.keys(HUB_WF_NODI).filter(t => t !== 'trigger' && t !== 'fine').map(t => {
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
                <span style={{ flex: 1, fontSize: 13.2, fontWeight: 600, color: ADM.TEXT }}>{d.label}</span>
                <BuIcons.plus size={12} color={ADM.MUTED_LIGHT}/>
              </button>
            );
          })}
          <div style={{
            marginTop: 12, padding: 11, borderRadius: 10, background: ADM.HUB_VIOLA_SOFT,
            fontSize: 12.2, color: ADM.HUB_VIOLA_DARK, lineHeight: 1.5,
          }}>
            <strong>Script custom</strong> e <strong>webhook</strong> sono la via d'uscita: quando serve una cosa che qui non c'è, la si chiama fuori.
          </div>
        </AdmCard>

        {/* Il flusso */}
        <AdmCard padding={0} style={{ overflow: 'hidden' }}>
          <div style={{
            background: `radial-gradient(circle at 1px 1px, ${ADM.BORDER} 1px, transparent 0)`,
            backgroundSize: '18px 18px', backgroundColor: ADM.PANEL_SOFT,
            padding: '26px 24px 34px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            {nodi.map((n, i) => (
              <WfNodo key={i} nodo={n} primo={i === 0} ultimo={i === nodi.length - 1}
                selezionato={sel === i} onClick={() => setSel(i)}/>
            ))}
          </div>
        </AdmCard>

        {/* Ispettore del passo */}
        <AdmCard padding={16}>
          {nodo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center',
                  background: ADM[HUB_WF_NODI[nodo.tipo].color + '_SOFT'] || ADM.NEUTRAL_SOFT,
                  color: ADM[HUB_WF_NODI[nodo.tipo].color] || ADM.INK,
                }}>{React.createElement(BuIcons[HUB_WF_NODI[nodo.tipo].icona], { size: 14 })}</span>
                <span style={{ flex: 1, fontSize: 14.2, fontWeight: 700, color: ADM.TEXT }}>{HUB_WF_NODI[nodo.tipo].label}</span>
                <span style={{ fontSize: 11.5, color: ADM.MUTED_SOFT, fontWeight: 700 }}>passo {sel + 1}</span>
              </div>

              {nodo.tipo === 'trigger' && (
                <HubCampo label="Che cosa lo fa partire" nota="Un innesco solo per workflow: se ne servono due, si fanno due workflow.">
                  <AdmSelect block value={nodo.testo} onChange={v => cambia(sel, 'testo', v)} options={[
                    { value: nodo.testo, label: nodo.testo },
                    ...HUB_FORM.map(f => ({ value: 'Submission form «' + f.nome + '»', label: 'Submission form · ' + f.nome })),
                    ...HUB_ELENCHI.map(e => ({ value: 'Entra nell\'elenco «' + e.nome + '»', label: 'Entra nell\'elenco · ' + e.nome })),
                    { value: 'Una proprietà cambia valore', label: 'Una proprietà cambia valore' },
                    { value: 'Ogni giorno a un\'ora fissa', label: 'Ogni giorno a un\'ora fissa' },
                  ]}/>
                </HubCampo>
              )}
              {nodo.tipo === 'attesa' && (
                <HubCampo label="Quanto aspetta"><HubInput valore={nodo.testo} onCambia={v => cambia(sel, 'testo', v)} placeholder="es. 2 giorni"/></HubCampo>
              )}
              {nodo.tipo === 'condizione' && (
                <React.Fragment>
                  <HubCampo label="La domanda"><HubInput valore={nodo.testo} onCambia={v => cambia(sel, 'testo', v)} placeholder="es. Ha aperto la mail?"/></HubCampo>
                  <div style={{ fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5 }}>
                    I passi che vengono dopo possono essere legati a un ramo: si sceglie qui sotto, sul passo.
                  </div>
                </React.Fragment>
              )}
              {(nodo.tipo === 'mail' || nodo.tipo === 'sms' || nodo.tipo === 'push') && (
                <HubCampo label="Che cosa manda">
                  <AdmSelect block value={nodo.testo} onChange={v => cambia(sel, 'testo', v)}
                    options={[{ value: nodo.testo, label: nodo.testo },
                      ...(nodo.tipo === 'mail' ? HUB_MAIL : nodo.tipo === 'sms' ? HUB_SMS : HUB_PUSH).map(x => ({ value: x.nome, label: x.nome }))]}/>
                </HubCampo>
              )}
              {nodo.tipo === 'proprieta' && (
                <HubCampo label="Che cosa scrive" nota="È così che «ID campagna» e «Referral» si riempiono da soli.">
                  <HubInput valore={nodo.testo} onCambia={v => cambia(sel, 'testo', v)} placeholder="es. Ciclo di vita → In onboarding"/>
                </HubCampo>
              )}
              {nodo.tipo === 'elenco' && (
                <HubCampo label="In quale elenco">
                  <AdmSelect block value={nodo.testo} onChange={v => cambia(sel, 'testo', v)}
                    options={[{ value: nodo.testo, label: nodo.testo }, ...HUB_ELENCHI.filter(e => e.tipo === 'statico').map(e => ({ value: e.nome, label: e.nome }))]}/>
                </HubCampo>
              )}
              {nodo.tipo === 'agente' && (
                <HubCampo label="Quale agente e per fare cosa">
                  <AdmSelect block value={nodo.testo} onChange={v => cambia(sel, 'testo', v)}
                    options={[{ value: nodo.testo, label: nodo.testo }, ...HUB_AGENTI.map(a => ({ value: a.nome, label: a.nome + ' · ' + a.ruolo }))]}/>
                </HubCampo>
              )}
              {(nodo.tipo === 'script' || nodo.tipo === 'webhook') && (
                <HubCampo label={nodo.tipo === 'script' ? 'Che cosa esegue' : 'Indirizzo da chiamare'}
                  nota="Nel prototipo è una descrizione; in produzione qui ci va il codice o l'endpoint.">
                  <HubArea valore={nodo.testo} onCambia={v => cambia(sel, 'testo', v)} righe={3}/>
                </HubCampo>
              )}

              {sel > 0 && sel < nodi.length - 1 && (
                <React.Fragment>
                  <HubCampo label="Sta su un ramo?" nota="Solo se sopra c'è una condizione.">
                    <AdmSelect block value={nodo.ramo || ''} onChange={v => cambia(sel, 'ramo', v || undefined)}
                      options={[{ value: '', label: 'No, è nel flusso principale' }, { value: 'Sì', label: 'Ramo «Sì»' }, { value: 'No', label: 'Ramo «No»' }]}/>
                  </HubCampo>
                  <div style={{ display: 'flex', gap: 7, paddingTop: 4 }}>
                    <HubStrumento icona="chevronUp" onClick={() => muovi(sel, -1)}>Su</HubStrumento>
                    <HubStrumento icona="chevronDown" onClick={() => muovi(sel, 1)}>Giù</HubStrumento>
                    <div style={{ flex: 1 }}/>
                    <HubStrumento icona="trash" onClick={() => elimina(sel)}>Elimina</HubStrumento>
                  </div>
                </React.Fragment>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: ADM.MUTED, lineHeight: 1.55, padding: '8px 2px' }}>
              Clicca un passo nel flusso per modificarlo, o aggiungine uno dalla colonna di sinistra.
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
        sotto="Agenti costruiti su quello che Hubble già sa dei tuoi clienti. Gli dai un obiettivo e delle fonti; il resto lo decidono loro, e qui vedi che cosa hanno prodotto."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo(true)}>Crea agente</HubStrumento>}/>

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

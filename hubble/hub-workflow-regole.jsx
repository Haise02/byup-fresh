// Hubble · Workflow — l'editor delle condizioni e delle attese.
//
// Un ramo prima sapeva chiedere una cosa sola: com'È il contatto. Bastava per
// «i clienti Business», non bastava per l'unica domanda che i workflow fanno
// davvero — «ha aperto la mail che gli ho appena mandato?». Quella non è una
// proprietà: è un fatto successo dopo il passo precedente.
//
// Quindi una regola ha un GENERE:
//   · proprietà — com'è fatto il contatto (le stesse frasi dei filtri)
//   · evento    — che cosa ha fatto, con una finestra di tempo e un NON
//   · elenco    — dov'è finito
//   · esito     — com'è andato il passo prima (consegnata, rimbalzata, errore)
//
// Le regole stanno in GRUPPI. Dentro un gruppo si legano con E oppure con O;
// fra i gruppi con un'altra E/O scelta a parte. Due soli livelli, di proposito:
// bastano a scrivere (A e B) oppure (C e D), e restano leggibili senza che
// nessuno debba contare le parentesi. Un editor di espressioni booleane
// annidate all'infinito è più potente e non lo usa nessuno.

const { useState: useStateWr } = React;

// ─── Pezzi comuni ───────────────────────────────────────────────────────────

// Il selettore a due o tre voci che si usa ovunque qui dentro. Piccolo, ma
// ripetuto tante volte da meritare un nome.
function WrSegmento({ voci, attivo, onCambia, piccolo }) {
  return (
    <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'rgba(120,120,128,0.12)', borderRadius: piccolo ? 8 : 9 }}>
      {voci.map(o => {
        const on = attivo === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onCambia(o.id)} title={o.nota} style={{
            padding: piccolo ? '4px 9px' : '6px 12px', border: 'none', borderRadius: piccolo ? 6 : 7,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: piccolo ? 11.8 : 12.8, fontWeight: 700,
            background: on ? '#fff' : 'transparent', color: on ? ADM.TEXT : ADM.MUTED,
            boxShadow: on ? '0 1px 3px rgba(15,17,21,0.10)' : 'none', whiteSpace: 'nowrap',
          }}>{o.l}</button>
        );
      })}
    </div>
  );
}

// Il numero + unità: «entro 3 giorni», «aspetta 2 ore». Una riga sola.
function WrDurata({ n, unita, onCambia, prefisso }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {prefisso && <span style={{ fontSize: 13, color: ADM.MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>{prefisso}</span>}
      <div style={{ width: 78, flexShrink: 0 }}>
        <HubInput tipo="number" valore={n} onCambia={v => onCambia(Math.max(0, parseInt(v, 10) || 0), unita)}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <AdmSelect block value={unita} onChange={u => onCambia(n, u)} options={HUB_UNITA.map(u => ({ value: u.id, label: u.label }))}/>
      </div>
    </div>
  );
}

// A che cosa si riferisce un evento. «Ha aperto l'email» senza dire QUALE email
// è una domanda a cui non si può rispondere; per gli eventi che ne hanno una,
// il riferimento è obbligatorio, e «una qualsiasi» è una scelta esplicita.
function WrRif({ rif, valore, onCambia }) {
  const elenchi = {
    mail:   HUB_MAIL.map(x => ({ value: x.id, label: x.nome })),
    sms:    HUB_SMS.map(x => ({ value: x.id, label: x.nome })),
    push:   HUB_PUSH.map(x => ({ value: x.id, label: x.nome })),
    form:   HUB_FORM.map(x => ({ value: x.id, label: x.nome })),
    elenco: HUB_ELENCHI.map(x => ({ value: x.id, label: x.nome })),
    prop:   HUB_PROPRIETA.map(x => ({ value: x.id, label: x.label })),
  };
  if (rif === 'url') return <HubInput valore={valore} onCambia={onCambia} placeholder="es. /prezzi o byup.it/demo"/>;
  const opzioni = elenchi[rif];
  if (!opzioni) return null;
  return (
    <AdmSelect block value={valore || '*'} onChange={v => onCambia(v === '*' ? null : v)}
      options={[{ value: '*', label: 'Una qualsiasi' }, ...opzioni]}/>
  );
}

const WR_GENERI = [
  { id: 'proprieta', label: 'Una proprietà',   desc: 'Com\'è fatto il contatto', icona: 'tag',    color: 'TEAL' },
  { id: 'evento',    label: 'Una cosa fatta',  desc: 'Aperture, click, form, ticket…', icona: 'cursorClick', color: 'HUB_MAGENTA' },
  { id: 'elenco',    label: 'Un elenco',       desc: 'È dentro o fuori da un elenco', icona: 'listFill', color: 'INFO' },
  { id: 'esito',     label: 'L\'esito prima',  desc: 'Com\'è andato il passo precedente', icona: 'check', color: 'WARN' },
];

// ─── Una regola ─────────────────────────────────────────────────────────────

function WrRegolaCard({ regola: r, onCambia, onElimina, legame, righe }) {
  const [cambiaProp, setCambiaProp] = useStateWr(false);
  const g = WR_GENERI.find(x => x.id === r.genere) || WR_GENERI[0];
  const Ic = BuIcons[g.icona];
  const set = (patch) => onCambia(Object.assign({}, r, patch));

  const corpo = () => {
    if (r.genere === 'proprieta') {
      const p = HUB_PROP[r.prop];
      const operatori = p ? (HUB_OPERATORI[p.tipo] || []) : [];
      const op = operatori.find(o => o.id === r.op) || operatori[0];
      if (cambiaProp || !p) {
        return (
          <div style={{ padding: 8, border: `1px solid ${ADM.PINK}`, borderRadius: 9, background: '#fff' }}>
            <HubSceltaProprieta altezza={210} onScegli={np => {
              const nop = (HUB_OPERATORI[np.tipo] || [])[0];
              set({ prop: np.id, op: nop.id, valore: hubValoreIniziale(nop, null, null) });
              setCambiaProp(false);
            }}/>
            {p && (
              <button onClick={() => setCambiaProp(false)} style={{
                marginTop: 6, width: '100%', padding: '6px 10px', borderRadius: 7, border: 'none',
                background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, fontSize: 12.6, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Annulla</button>
            )}
          </div>
        );
      }
      return (
        <React.Fragment>
          <button onClick={() => setCambiaProp(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7, width: '100%', textAlign: 'left',
            padding: '7px 9px', borderRadius: 8, border: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.2, fontWeight: 700, color: ADM.TEXT,
          }}>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
            <BuIcons.pencil size={12} color={ADM.MUTED_LIGHT}/>
          </button>
          <AdmSelect block value={op.id} onChange={id => {
            const nuovo = operatori.find(o => o.id === id);
            set({ op: id, valore: hubValoreIniziale(nuovo, op, r.valore) });
          }} options={operatori.map(o => ({ value: o.id, label: o.label }))}/>
          <HubValore prop={p} op={op} valore={r.valore} onCambia={v => set({ valore: v })} righe={righe}/>
        </React.Fragment>
      );
    }

    if (r.genere === 'evento') {
      const d = HUB_WF_EVENTI[r.evento] || {};
      return (
        <React.Fragment>
          {/* Impilati e non affiancati: in una colonna da 300px il segmentato
              e la tendina si dividono lo spazio e la tendina resta larga come
              la sua freccia — l'etichetta dell'evento non si legge più. */}
          <AdmSelect block value={r.evento} onChange={v => set({ evento: v, rif: null, link: null })}
            options={Object.keys(HUB_WF_EVENTI).map(k => ({ value: k, label: HUB_WF_EVENTI[k].label }))}/>
          <WrSegmento piccolo attivo={r.negato ? 'no' : 'si'} onCambia={v => set({ negato: v === 'no' })}
            voci={[{ id: 'si', l: 'L\'ha fatto' }, { id: 'no', l: 'NON l\'ha fatto' }]}/>
          {d.rif && <WrRif rif={d.rif} valore={r.rif} onCambia={v => set({ rif: v })}/>}
          {d.conLink && (
            <HubInput valore={r.link} onCambia={v => set({ link: v })} placeholder="Un link in particolare (facoltativo)"/>
          )}
          {/* La finestra è la metà che si dimentica sempre: «non ha aperto»
              senza un «entro quando» è vera per tutti fino alla fine dei tempi. */}
          <WrDurata prefisso="entro" n={(r.finestra || {}).n} unita={(r.finestra || {}).unita}
            onCambia={(n, u) => set({ finestra: { n, unita: u } })}/>
        </React.Fragment>
      );
    }

    if (r.genere === 'elenco') {
      return (
        <React.Fragment>
          <WrSegmento attivo={r.dentro === false ? 'fuori' : 'dentro'} onCambia={v => set({ dentro: v === 'dentro' })}
            voci={[{ id: 'dentro', l: 'È nell\'elenco' }, { id: 'fuori', l: 'NON c\'è' }]}/>
          <AdmSelect block value={r.elencoId} onChange={v => set({ elencoId: v })}
            options={HUB_ELENCHI.map(e => ({ value: e.id, label: e.nome }))}/>
        </React.Fragment>
      );
    }

    return (
      <AdmSelect block value={r.esito} onChange={v => set({ esito: v })}
        options={Object.keys(HUB_WF_ESITI).map(k => ({ value: k, label: HUB_WF_ESITI[k].label }))}/>
    );
  };

  return (
    <div>
      {legame && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5px 0' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em', padding: '2px 9px', borderRadius: 999,
            background: legame === 'O' ? ADM.INFO_SOFT : ADM.OK_SOFT, color: legame === 'O' ? ADM.INFO : ADM.OK,
          }}>{legame === 'O' ? 'OPPURE' : 'E'}</span>
        </div>
      )}
      {/* Niente overflow:hidden: dentro ci sono tendine in posizione assoluta. */}
      <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 10, background: '#fff', boxShadow: '0 1px 2px rgba(15,17,21,0.04)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px 7px 10px',
          background: ADM.PANEL_SOFT, borderBottom: `1px solid ${ADM.BORDER_SOFT}`, borderRadius: '9px 9px 0 0',
        }}>
          <span style={{ width: 19, height: 19, borderRadius: 5, display: 'grid', placeItems: 'center', flexShrink: 0,
            background: ADM[g.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[g.color] }}><Ic size={11}/></span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.4, fontWeight: 700, color: ADM.MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.label}</span>
          <button onClick={onElimina} title="Togli questa regola" className="adm-iconbtn" style={{
            width: 22, height: 22, borderRadius: 6, border: 'none', background: 'transparent',
            color: ADM.MUTED_SOFT, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}><BuIcons.x size={14}/></button>
        </div>
        <div style={{ padding: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>{corpo()}</div>
      </div>
    </div>
  );
}

// ─── Il menu «aggiungi una regola» ──────────────────────────────────────────

function WrAggiungi({ onScegli, etichetta = 'Aggiungi una regola' }) {
  const [aperto, setAperto] = useStateWr(false);
  if (!aperto) {
    return (
      <button onClick={() => setAperto(true)} style={{
        width: '100%', padding: '8px 10px', borderRadius: 9, border: `1px dashed ${ADM.BORDER}`,
        background: '#fff', color: ADM.TEXT, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      }}><BuIcons.plus size={14} color={ADM.MUTED}/> {etichetta}</button>
    );
  }
  return (
    <div style={{ padding: 7, border: `1px solid ${ADM.PINK}`, borderRadius: 10, background: '#fff', boxShadow: `0 10px 26px -12px ${ADM.HUB_GLOW}` }}>
      {WR_GENERI.map(g => {
        const Ic = BuIcons[g.icona];
        return (
          <button key={g.id} onClick={() => { onScegli(g.id); setAperto(false); }} className="adm-actionrow" style={{
            display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
            padding: '8px 9px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center', flexShrink: 0,
              background: ADM[g.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[g.color] }}><Ic size={12}/></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.2, fontWeight: 700, color: ADM.TEXT }}>{g.label}</span>
              <span style={{ display: 'block', fontSize: 11.6, color: ADM.MUTED_SOFT, marginTop: 1 }}>{g.desc}</span>
            </span>
          </button>
        );
      })}
      <button onClick={() => setAperto(false)} style={{
        marginTop: 5, width: '100%', padding: '6px 10px', borderRadius: 7, border: 'none',
        background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, fontSize: 12.6, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>Annulla</button>
    </div>
  );
}

// ─── La condizione intera ───────────────────────────────────────────────────

function WrQuando({ quando, onCambia, righe }) {
  const q = quando && quando.gruppi ? quando : hubQuandoVuoto();
  const gruppi = q.gruppi;
  const setG = (i, ng) => onCambia(Object.assign({}, q, { gruppi: gruppi.map((g, j) => j === i ? ng : g) }));
  const togliG = (i) => onCambia(Object.assign({}, q, {
    gruppi: gruppi.length === 1 ? [{ id: 'g' + Date.now(), congiunzione: 'E', regole: [] }] : gruppi.filter((_, j) => j !== i),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {gruppi.map((g, i) => {
        const regole = g.regole || [];
        return (
          <React.Fragment key={g.id || i}>
            {i > 0 && (
              // Il legame FRA i gruppi si cambia da qui: è l'unico punto in cui
              // si decide se le parentesi si sommano o si alternano.
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                <span style={{ flex: 1, height: 1, background: ADM.BORDER }}/>
                <WrSegmento piccolo attivo={q.congiunzione || 'E'} onCambia={v => onCambia(Object.assign({}, q, { congiunzione: v }))}
                  voci={[{ id: 'E', l: 'E anche' }, { id: 'O', l: 'OPPURE' }]}/>
                <span style={{ flex: 1, height: 1, background: ADM.BORDER }}/>
              </div>
            )}
            <div style={{
              border: `1px solid ${ADM.BORDER}`, borderRadius: 12, padding: 10,
              background: gruppi.length > 1 ? ADM.PANEL_SOFT : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: regole.length ? 8 : 6 }}>
                <span style={{ fontSize: 10.6, fontWeight: 800, letterSpacing: '0.08em', color: ADM.MUTED_SOFT, textTransform: 'uppercase' }}>
                  {gruppi.length > 1 ? `Gruppo ${i + 1}` : 'Le regole'}
                </span>
                <span style={{ flex: 1 }}/>
                {regole.length > 1 && (
                  <WrSegmento piccolo attivo={g.congiunzione || 'E'} onCambia={v => setG(i, Object.assign({}, g, { congiunzione: v }))}
                    voci={[{ id: 'E', l: 'Tutte' }, { id: 'O', l: 'Basta una' }]}/>
                )}
                {gruppi.length > 1 && (
                  <button onClick={() => togliG(i)} title="Togli il gruppo" className="adm-iconbtn" style={{
                    width: 22, height: 22, borderRadius: 6, border: 'none', background: 'transparent',
                    color: ADM.MUTED_SOFT, cursor: 'pointer', display: 'grid', placeItems: 'center',
                  }}><BuIcons.trash size={13}/></button>
                )}
              </div>
              {regole.map((r, j) => (
                <WrRegolaCard key={j} regola={r} righe={righe} legame={j === 0 ? null : (g.congiunzione || 'E')}
                  onCambia={nr => setG(i, Object.assign({}, g, { regole: regole.map((x, k) => k === j ? nr : x) }))}
                  onElimina={() => setG(i, Object.assign({}, g, { regole: regole.filter((_, k) => k !== j) }))}/>
              ))}
              <div style={{ marginTop: regole.length ? 9 : 0 }}>
                <WrAggiungi onScegli={gen => setG(i, Object.assign({}, g, { regole: [...regole, hubRegolaVuota(gen)] }))}/>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      <button onClick={() => onCambia(Object.assign({}, q, {
        gruppi: [...gruppi, { id: 'g' + Date.now(), congiunzione: 'E', regole: [] }],
      }))} style={{
        marginTop: 10, width: '100%', padding: '7px 10px', borderRadius: 9, border: `1px dashed ${ADM.BORDER}`,
        background: ADM.PANEL_SOFT, color: ADM.MUTED, fontSize: 12.6, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>+ Aggiungi un gruppo di regole</button>

      {/* La frase finale: se non si legge in italiano, la condizione è
          sbagliata anche quando l'albero degli oggetti è giusto. */}
      <div style={{ marginTop: 11, padding: '10px 11px', borderRadius: 10, background: ADM.HUB_VIOLA_SOFT }}>
        <div style={{ fontSize: 10.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.HUB_VIOLA_DARK, marginBottom: 4 }}>Si legge così</div>
        <div style={{ fontSize: 12.6, color: ADM.HUB_VIOLA_DARK, lineHeight: 1.5 }}>{hubDescriviQuando(q)}</div>
      </div>
    </div>
  );
}

// ─── L'attesa ───────────────────────────────────────────────────────────────
//
// «Aspetta 2 giorni» è il caso facile e non è quasi mai quello giusto. Serve
// aspettare fino a lunedì mattina (per non spedire di sabato sera), fino a una
// data (la scadenza di un documento), oppure — la più utile — finché il
// contatto non fa qualcosa, con un tetto oltre il quale si va avanti comunque.

function WrAttesa({ attesa, onCambia }) {
  // Sempre completa: vedi hubAttesaPiena. Un'attesa a metà crolla al
  // primo cambio di modo, ed è il caso normale quando arriva dai mock.
  const a = hubAttesaPiena(attesa);
  const set = (patch) => onCambia(Object.assign({}, a, patch));
  const modi = Object.keys(HUB_ATTESA_MODI);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <HubCampo label="Come aspetta">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {modi.map(k => {
            const m = HUB_ATTESA_MODI[k];
            const Ic = BuIcons[m.icona];
            const on = a.modo === k;
            return (
              <button key={k} onClick={() => set({ modo: k })} style={{
                display: 'flex', alignItems: 'flex-start', gap: 9, width: '100%', textAlign: 'left',
                padding: '8px 9px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${on ? ADM.INFO : ADM.BORDER}`,
                background: on ? ADM.INFO_SOFT : '#fff',
              }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0,
                  background: on ? '#fff' : ADM.NEUTRAL_SOFT, color: on ? ADM.INFO : ADM.MUTED }}><Ic size={12}/></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: ADM.TEXT }}>{m.label}</span>
                  <span style={{ display: 'block', fontSize: 11.6, color: ADM.MUTED, marginTop: 1, lineHeight: 1.4 }}>{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </HubCampo>

      {a.modo === 'durata' && (
        <HubCampo label="Quanto">
          <WrDurata n={a.n} unita={a.unita} onCambia={(n, u) => set({ n, unita: u })}/>
        </HubCampo>
      )}

      {a.modo === 'data' && (
        <HubCampo label="Fino a quando" nota="Chi arriva dopo questa data va avanti subito.">
          <HubData valore={a.data} onCambia={v => set({ data: v })}/>
        </HubCampo>
      )}

      {a.modo === 'giornoOra' && (
        <HubCampo label="Il prossimo…">
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <AdmSelect block value={a.giorno} onChange={v => set({ giorno: v })} options={HUB_GIORNI.map(g => ({ value: g.id, label: g.label }))}/>
            </div>
            <div style={{ width: 106, flexShrink: 0 }}>
              <HubInput tipo="time" valore={a.ora} onCambia={v => set({ ora: v })}/>
            </div>
          </div>
        </HubCampo>
      )}

      {a.modo === 'evento' && (
        <React.Fragment>
          <HubCampo label="Che cosa aspetta">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <AdmSelect block value={a.evento.evento} onChange={v => set({ evento: Object.assign({}, a.evento, { evento: v, rif: null }) })}
                options={Object.keys(HUB_WF_EVENTI).map(k => ({ value: k, label: HUB_WF_EVENTI[k].label }))}/>
              {HUB_WF_EVENTI[a.evento.evento] && HUB_WF_EVENTI[a.evento.evento].rif && (
                <WrRif rif={HUB_WF_EVENTI[a.evento.evento].rif} valore={a.evento.rif}
                  onCambia={v => set({ evento: Object.assign({}, a.evento, { rif: v }) })}/>
              )}
            </div>
          </HubCampo>
          <HubCampo label="Il tetto" nota="Se non succede entro questo tempo si va avanti lo stesso: un'attesa senza tetto è un workflow che non finisce.">
            <WrDurata prefisso="al massimo" n={a.tetto.n} unita={a.tetto.unita} onCambia={(n, u) => set({ tetto: { n, unita: u } })}/>
          </HubCampo>
        </React.Fragment>
      )}

      {a.modo === 'finestra' && (
        <React.Fragment>
          <HubCampo label="In quali giorni">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {HUB_GIORNI.map(g => {
                const on = (a.finestra.giorni || []).includes(g.id);
                return (
                  <button key={g.id} onClick={() => set({ finestra: Object.assign({}, a.finestra, {
                    giorni: on ? a.finestra.giorni.filter(x => x !== g.id) : [...a.finestra.giorni, g.id],
                  }) })} style={{
                    padding: '5px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12.2, fontWeight: 700, textTransform: 'capitalize',
                    border: `1px solid ${on ? ADM.INFO : ADM.BORDER}`,
                    background: on ? ADM.INFO_SOFT : '#fff', color: on ? ADM.INFO : ADM.MUTED,
                  }}>{g.label.slice(0, 3)}</button>
                );
              })}
            </div>
          </HubCampo>
          <HubCampo label="Fra che ore">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}><HubInput tipo="time" valore={a.finestra.da} onCambia={v => set({ finestra: Object.assign({}, a.finestra, { da: v }) })}/></div>
              <span style={{ fontSize: 13, color: ADM.MUTED_SOFT, fontWeight: 700 }}>e</span>
              <div style={{ flex: 1, minWidth: 0 }}><HubInput tipo="time" valore={a.finestra.a} onCambia={v => set({ finestra: Object.assign({}, a.finestra, { a: v }) })}/></div>
            </div>
          </HubCampo>
        </React.Fragment>
      )}

      <div style={{ padding: '10px 11px', borderRadius: 10, background: ADM.INFO_SOFT }}>
        <div style={{ fontSize: 10.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.INFO, marginBottom: 4 }}>Si legge così</div>
        <div style={{ fontSize: 12.6, color: '#1E3A8A', lineHeight: 1.5 }}>{hubDescriviAttesa(a)}</div>
      </div>
    </div>
  );
}

window.WrSegmento = WrSegmento;
window.WrDurata = WrDurata;
window.WrRif = WrRif;
window.WrRegolaCard = WrRegolaCard;
window.WrAggiungi = WrAggiungi;
window.WrQuando = WrQuando;
window.WrAttesa = WrAttesa;
window.WR_GENERI = WR_GENERI;

// Hubble · Agent — l'Ambiente.
//
// La pagina Agent elencava agenti. Uno per uno funzionano; insieme non
// esistevano. L'Ambiente è il posto dove esistono insieme, e la scelta di
// fondo è che **gli agenti non si chiamano a vicenda**: scrivono su una
// LAVAGNA, per argomento, e chi è iscritto a quell'argomento si sveglia.
//
// È la differenza fra un grafo di chiamate e una redazione. Nel grafo, il
// quinto agente sono venti collegamenti nuovi e il primo cambio di formato ne
// rompe tre in silenzio. Nella redazione, il quinto agente è un'iscrizione: gli
// altri quattro non lo sanno e non gli serve saperlo.
//
// Quattro meccanismi sopra la lavagna, e sono la parte inventata:
//   · il PATTO — ogni consegna dichiara i campi che passa. Mancano? La
//     consegna fallisce e si vede, invece di far lavorare il secondo agente
//     su una nota mezza vuota (che risponderebbe lo stesso, benissimo, a caso).
//   · il SECONDO PARERE — prima che qualcosa tocchi il CRM o esca verso un
//     cliente, un altro agente deve confermare. Se non conferma, non vince la
//     maggioranza: sale a una persona.
//   · il TETTO — budget al giorno e profondità massima per catena.
//   · la CODA — i compiti non si assegnano tutti subito: uno per volta, con
//     priorità, e dopo due tentativi falliti il compito passa a una persona.
//
// Quattro schede, e l'ordine è quello delle domande che uno si fa: chi lavora
// con chi (Catene), che cosa si sono detti (Lavagna), che cosa aspetta
// (Coda), che cosa è successo davvero (Registro).

const { useState: useStateAmb, useMemo: useMemoAmb } = React;

const ambAgente = (id) => HUB_AGENTI.find(a => a.id === id) || null;
const ambNomeAgente = (id) => (ambAgente(id) || {}).nome || 'Una persona';
const ambArgomento = (id) => HUB_AMB_ARGOMENTI.find(a => a.id === id) || HUB_AMB_ARGOMENTI[0];
// Le catene sono stato della pagina (si ritoccano, se ne costruiscono): chi
// ha la lista viva la passa, la costante resta come rete per chi non ce l'ha.
const ambCatena = (id, lista) => (lista || HUB_AMB_CATENE).find(c => c.id === id) || null;

// La pastiglia di un argomento della lavagna: stesso colore ovunque compaia,
// perché è l'unica cosa che tiene insieme quattro schede diverse.
function AmbArgomento({ id, size = 'md' }) {
  const a = ambArgomento(id);
  const Ic = BuIcons[a.icona];
  const p = size === 'sm' ? { f: 11, pad: '2px 7px', i: 10 } : { f: 12, pad: '3px 9px', i: 12 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: p.pad, borderRadius: 999,
      background: ADM[a.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[a.color + '_DARK'] || ADM[a.color],
      fontSize: p.f, fontWeight: 700, whiteSpace: 'nowrap',
    }}><Ic size={p.i}/> {a.label}</span>
  );
}

// L'avatar di un agente — o della persona, quando la catena si ferma e chiede.
function AmbFaccia({ id, size = 32 }) {
  const a = ambAgente(id);
  const persona = !a;
  return (
    <span title={persona ? 'Una persona' : a.nome} style={{
      width: size, height: size, borderRadius: size / 3, flexShrink: 0, display: 'grid', placeItems: 'center',
      background: persona ? ADM.OK_SOFT : a.stato === 'errore' ? ADM.DANGER_SOFT : ADM.HUB_VIOLA_SOFT,
      color: persona ? ADM.OK : a.stato === 'errore' ? ADM.DANGER : ADM.HUB_VIOLA_DARK,
    }}>{persona ? <BuIcons.user size={size * 0.5}/> : <BuIcons.sparkles size={size * 0.5}/>}</span>
  );
}

// ─── 1 · Le catene ──────────────────────────────────────────────────────────

function AmbTappa({ tappa, ultima, indice }) {
  const r = HUB_AMB_RUOLI[tappa.ruolo] || HUB_AMB_RUOLI.esecutore;
  return (
    <React.Fragment>
      <div style={{ flex: '0 0 auto', width: 196 }}>
        <div style={{
          border: `1.5px solid ${tappa.ruolo === 'persona' ? ADM.OK_SOFT : ADM.BORDER}`,
          background: tappa.ruolo === 'persona' ? '#F4FBF6' : '#fff',
          borderRadius: 12, padding: 11, height: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <AmbFaccia id={tappa.agente} size={28}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.8, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ambNomeAgente(tappa.agente)}</div>
              <div style={{ fontSize: 10.4, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM[r.color] }}>{r.label}</div>
            </div>
          </div>
          <div style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.45 }}>{tappa.fa}</div>
          {/* Il patto: che cosa promette di consegnare. Visibile qui e non in
              un pannello — è il contratto, non un dettaglio. */}
          {tappa.patto && tappa.patto.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${ADM.BORDER}` }}>
              <div style={{ fontSize: 9.6, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 4 }}>Consegna</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tappa.patto.map(c => (
                  <span key={c} style={{
                    fontSize: 10.8, fontWeight: 600, padding: '2px 6px', borderRadius: 5,
                    background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {!ultima && (
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 22 }}>
          <BuIcons.arrowRight size={15} color={ADM.MUTED_LIGHT}/>
          <span style={{ fontSize: 9.4, fontWeight: 800, color: ADM.MUTED_LIGHT, letterSpacing: '0.05em' }}>{indice + 1}</span>
        </div>
      )}
    </React.Fragment>
  );
}

function AmbCatene({ catene, onCambia }) {
  // La bozza del modale: con un id ritocca una catena che esiste, senza id ne
  // costruisce una nuova. Un modale solo, perché i campi sono gli stessi —
  // cambia soltanto che cosa promette il pulsante in fondo.
  const [bozza, setBozza] = useStateAmb(null);

  const salva = () => {
    const nome = bozza.nome.trim();
    if (!nome) return;
    const tetto = Math.max(1, Number(bozza.tetto) || 8);
    if (bozza.id) {
      onCambia(prev => prev.map(c => c.id === bozza.id
        ? Object.assign({}, c, { nome, argomento: bozza.argomento, descrizione: bozza.descrizione.trim(), tetto })
        : c));
    } else {
      // L'id prosegue la numerazione, e la catena nasce «in prova»: zero
      // giri, zero spesa, e la persona già come ultima tappa — il punto in
      // cui si ferma e chiede non è un'aggiunta, c'è dalla nascita.
      const id = 'CT-' + String(catene.reduce((m, c) => Math.max(m, parseInt(c.id.slice(3), 10) || 0), 0) + 1).padStart(3, '0');
      onCambia(prev => [...prev, {
        id, nome, stato: 'in prova', argomento: bozza.argomento,
        descrizione: bozza.descrizione.trim() || 'Appena costruita: il primo giro deve ancora partire.',
        girati: 0, conclusi: 0, aPersona: 0, costoGiorno: 0, tetto, profondita: 1,
        tappe: bozza.tappe,
      }]);
    }
    setBozza(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {catene.map(c => {
        const consegna = c.girati ? Math.round(c.conclusi / c.girati * 100) : 0;
        return (
          <AdmCard key={c.id} padding={16}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
                  <span style={{ fontSize: 15.4, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{c.nome}</span>
                  <HubStato stato={c.stato} mappa={HUB_AMB_STATI_CATENA}/>
                  <AmbArgomento id={c.argomento} size="sm"/>
                </div>
                <div style={{ fontSize: 13, color: ADM.MUTED, lineHeight: 1.5 }}>{c.descrizione}</div>
              </div>
              <HubStrumento icona="pencil" onClick={() => setBozza({
                id: c.id, nome: c.nome, argomento: c.argomento,
                descrizione: c.descrizione, tetto: c.tetto, tappe: c.tappe,
              })}>Modifica</HubStrumento>
            </div>

            {/* Il flusso, da sinistra a destra. Orizzontale e non verticale
                perché una catena è corta per costruzione — il tetto sulla
                profondità è lì apposta. */}
            <div className="hub-scroll" style={{
              display: 'flex', alignItems: 'stretch', gap: 8, overflowX: 'auto', padding: '4px 2px 10px',
            }}>
              {c.tappe.map((t, i) => <AmbTappa key={i} tappa={t} indice={i} ultima={i === c.tappe.length - 1}/>)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 11, borderTop: `1px solid ${ADM.BORDER_SOFT}`, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.2, color: ADM.MUTED }}><strong style={{ color: ADM.TEXT, fontWeight: 700 }}>{fmtNum(c.girati)}</strong> giri</span>
              <span style={{ fontSize: 12.2, color: ADM.MUTED }}><strong style={{ color: ADM.TEXT, fontWeight: 700 }}>{consegna}%</strong> conclusi da soli</span>
              <span style={{ fontSize: 12.2, color: ADM.MUTED }}><strong style={{ color: ADM.WARN, fontWeight: 700 }}>{fmtNum(c.aPersona)}</strong> saliti a una persona</span>
              <div style={{ flex: 1 }}/>
              {/* Il tetto, con la barra: è la cosa che si guarda prima di
                  lasciare acceso qualcosa che costa da solo. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 190 }}>
                <span style={{ fontSize: 11.8, color: ADM.MUTED_SOFT, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  €{c.costoGiorno.toFixed(2)} / €{c.tetto} oggi
                </span>
                <div style={{ flex: 1 }}>
                  <HubBarra valore={c.costoGiorno} max={c.tetto} color={c.costoGiorno / c.tetto > 0.8 ? 'DANGER' : 'HUB_VIOLA'} altezza={5}/>
                </div>
              </div>
            </div>
          </AdmCard>
        );
      })}

      <button className="hub-card" onClick={() => setBozza({
        id: null, nome: '', argomento: 'rischio', descrizione: '', tetto: 8,
        tappe: [{ agente: null, ruolo: 'persona', fa: 'Guarda e conferma prima che esca qualcosa', patto: [] }],
      })} style={{
        padding: '16px 14px', borderRadius: 14, border: `1.5px dashed ${ADM.HUB_VIOLA}`, background: '#fff',
        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        fontSize: 13.6, fontWeight: 700, color: ADM.HUB_VIOLA_DARK,
      }}><BuIcons.plus size={16}/> Costruisci una catena</button>

      {bozza && (
        <HubModale open onClose={() => setBozza(null)} larghezza={620}
          titolo={bozza.id ? 'Modifica la catena' : 'Costruisci una catena'}
          sotto={bozza.id
            ? bozza.id + ' · qui si ritoccano nome, argomento e tetto: le tappe sono i patti, e si leggono.'
            : 'Nasce in prova, a zero giri: prima si guarda lavorare, poi si accende.'}
          footer={
            <React.Fragment>
              <div style={{ flex: 1 }}/>
              <HubStrumento onClick={() => setBozza(null)}>Annulla</HubStrumento>
              <HubStrumento forte icona="check" onClick={salva}>{bozza.id ? 'Salva la catena' : 'Costruisci la catena'}</HubStrumento>
            </React.Fragment>
          }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1.1fr)', gap: 12 }}>
              <HubCampo label="Nome">
                <HubInput valore={bozza.nome} onCambia={v => setBozza(b => Object.assign({}, b, { nome: v }))}
                  placeholder="es. Dal segnale alla telefonata"/>
              </HubCampo>
              <HubCampo label="Argomento">
                <AdmSelect block value={bozza.argomento} onChange={v => setBozza(b => Object.assign({}, b, { argomento: v }))}
                  options={HUB_AMB_ARGOMENTI.map(a => ({ value: a.id, label: a.label }))}/>
              </HubCampo>
            </div>
            <HubCampo label="Che cosa fa" nota="Compare sotto il nome, nella lista delle catene.">
              <HubArea valore={bozza.descrizione} onCambia={v => setBozza(b => Object.assign({}, b, { descrizione: v }))} righe={2}
                placeholder="es. Quando un locale mostra segnali di abbandono, l'ambiente prepara la chiamata."/>
            </HubCampo>
            <HubCampo label="Tetto al giorno" larghezza={220}
              nota="In euro. Al tetto la catena si ferma da sola: è il motivo per cui si può lasciare accesa.">
              <HubInput tipo="number" valore={bozza.tetto} onCambia={v => setBozza(b => Object.assign({}, b, { tetto: v }))}/>
            </HubCampo>
            <HubCampo label="Le tappe" nota={bozza.id
              ? 'Da qui si leggono soltanto: cambiare una tappa cambia un patto di consegna, non è un ritocco da modale.'
              : 'Si parte dalla fine: la persona che conferma c\'è già. Gli agenti si aggiungono dopo, una tappa e un patto per volta.'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {bozza.tappe.map((t, i) => {
                  const r = HUB_AMB_RUOLI[t.ruolo] || HUB_AMB_RUOLI.esecutore;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px',
                      borderRadius: 9, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER_SOFT}`,
                    }}>
                      <AmbFaccia id={t.agente} size={24}/>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.8, lineHeight: 1.4 }}>
                        <strong style={{ fontWeight: 700, color: ADM.TEXT }}>{ambNomeAgente(t.agente)}</strong>
                        <span style={{ color: ADM.MUTED }}> — {t.fa}</span>
                      </span>
                      <span style={{ fontSize: 10.4, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM[r.color], flexShrink: 0 }}>{r.label}</span>
                    </div>
                  );
                })}
              </div>
            </HubCampo>
          </div>
        </HubModale>
      )}
    </div>
  );
}

// ─── 2 · La lavagna ─────────────────────────────────────────────────────────

function AmbLavagna({ catene }) {
  const [filtro, setFiltro] = useStateAmb('tutti');
  const note = HUB_AMB_NOTE.filter(n => filtro === 'tutti' || n.argomento === filtro);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px minmax(0,1fr)', gap: 13, alignItems: 'start' }}>
      {/* Gli argomenti, con chi ci è iscritto. È qui che si vede il
          meccanismo: nessuno nomina nessuno, si iscrivono a un argomento. */}
      <AdmCard padding={13}>
        <div style={{ fontSize: 10.8, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>Argomenti</div>
        <button onClick={() => setFiltro('tutti')} className="adm-actionrow" style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 9px',
          borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 3,
          background: filtro === 'tutti' ? ADM.NEUTRAL_SOFT : 'transparent',
          fontSize: 13.2, fontWeight: 700, color: ADM.TEXT,
        }}>Tutti gli argomenti</button>
        {HUB_AMB_ARGOMENTI.map(a => {
          const Ic = BuIcons[a.icona];
          const iscritti = catene.filter(c => c.argomento === a.id)
            .flatMap(c => c.tappe.map(t => t.agente)).filter(Boolean);
          const unici = [...new Set(iscritti)];
          return (
            <button key={a.id} onClick={() => setFiltro(a.id)} className="adm-actionrow" style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', textAlign: 'left', padding: '8px 9px',
              borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 2,
              background: filtro === a.id ? ADM.NEUTRAL_SOFT : 'transparent',
            }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center',
                background: ADM[a.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[a.color] }}><Ic size={12}/></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: ADM.TEXT }}>{a.label}</span>
                <span style={{ display: 'block', fontSize: 11.4, color: ADM.MUTED_SOFT, marginTop: 1 }}>
                  {unici.length ? `${unici.length} iscritti` : 'nessun iscritto'}
                </span>
              </span>
            </button>
          );
        })}
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: ADM.HUB_VIOLA_SOFT, fontSize: 11.8, color: ADM.HUB_VIOLA_DARK, lineHeight: 1.5 }}>
          Gli agenti non si chiamano fra loro: <strong>scrivono su un argomento</strong> e chi è iscritto si sveglia. Aggiungerne uno è iscriverlo, non ricablare gli altri.
        </div>
      </AdmCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {note.map(n => {
          const a = ambArgomento(n.argomento);
          const c = ambCatena(n.catena, catene);
          const tinta = n.allarme ? ADM.DANGER : n.disaccordo ? ADM.WARN : ADM.BORDER;
          return (
            <div key={n.id} style={{
              background: '#fff', border: `1px solid ${n.allarme || n.disaccordo ? tinta : ADM.BORDER}`,
              borderLeft: `3px solid ${ADM[a.color]}`, borderRadius: 12, padding: 14, boxShadow: ADM.CARD_SHADOW,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <AmbFaccia id={n.agente} size={28}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ADM.TEXT }}>{ambNomeAgente(n.agente)}</div>
                  <div style={{ fontSize: 11.6, color: ADM.MUTED_SOFT }}>{fmtRelative(n.quando)}{c ? ' · ' + c.nome : ''}</div>
                </div>
                <AmbArgomento id={n.argomento} size="sm"/>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: ADM.TEXT, marginBottom: 4, letterSpacing: '-0.01em' }}>{n.titolo}</div>
              <div style={{ fontSize: 13, color: ADM.MUTED, lineHeight: 1.55 }}>{n.corpo}</div>

              {/* I campi del patto, consegnati davvero. Se una consegna
                  fallisce è perché uno di questi manca. */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {Object.keys(n.campi || {}).map(k => (
                  <span key={k} style={{
                    display: 'inline-flex', alignItems: 'baseline', gap: 5, padding: '3px 8px', borderRadius: 6,
                    background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER_SOFT}`,
                  }}>
                    <span style={{ fontSize: 10.6, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>{k}</span>
                    <span style={{ fontSize: 12.4, fontWeight: 700, color: ADM.TEXT }}>{String(n.campi[k])}</span>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 9, borderTop: `1px solid ${ADM.BORDER_SOFT}` }}>
                {n.disaccordo && <HubPillola color="WARN" size="sm" forte>secondo parere negativo</HubPillola>}
                {n.allarme && <HubPillola color="DANGER" size="sm" forte>allarme</HubPillola>}
                <span style={{ fontSize: 11.8, color: ADM.MUTED_SOFT }}>
                  {(n.letta || []).length
                    ? 'Ha svegliato ' + n.letta.map(ambNomeAgente).join(', ')
                    : 'Nessuno si è ancora svegliato per questa nota'}
                </span>
              </div>
            </div>
          );
        })}
        {note.length === 0 && <HubVuoto icona="chat" titolo="Niente su questo argomento" desc="Nessun agente ci ha ancora scritto sopra."/>}
      </div>
    </div>
  );
}

// ─── 3 · La coda ────────────────────────────────────────────────────────────
//
// L'assegnazione progressiva: i compiti non piovono tutti addosso a tutti. Uno
// per volta, per priorità, e chi fallisce due volte non ritenta all'infinito.

const AMB_PRIORITA = { alta: { l: 'Alta', c: 'DANGER' }, media: { l: 'Media', c: 'WARN' }, bassa: { l: 'Bassa', c: 'PLAN_FREE' } };

function AmbCoda({ catene }) {
  const colonne = ['coda', 'preso', 'fatto', 'persona'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 11, alignItems: 'start' }}>
        {colonne.map(st => {
          const s = HUB_AMB_STATI_COMPITO[st];
          const voci = HUB_AMB_COMPITI.filter(c => c.stato === st);
          const Ic = BuIcons[s.icona];
          return (
            <div key={st} style={{ background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`, borderRadius: 13, padding: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, display: 'grid', placeItems: 'center',
                  background: ADM[s.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[s.color] }}><Ic size={11}/></span>
                <span style={{ flex: 1, fontSize: 12.6, fontWeight: 800, color: ADM.TEXT }}>{s.label}</span>
                <span style={{ fontSize: 11.4, fontWeight: 800, color: ADM.MUTED_SOFT, background: '#fff', borderRadius: 99, padding: '1px 7px' }}>{voci.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {voci.map(c => {
                  const p = AMB_PRIORITA[c.priorita] || AMB_PRIORITA.media;
                  const cat = ambCatena(c.catena, catene);
                  return (
                    <div key={c.id} style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 10, padding: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: ADM[p.c], flexShrink: 0 }}/>
                        <span style={{ fontSize: 10.4, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: ADM[p.c] }}>{p.l}</span>
                        <span style={{ flex: 1 }}/>
                        <span style={{ fontSize: 10.8, color: ADM.MUTED_LIGHT, fontWeight: 600 }}>{c.id}</span>
                      </div>
                      <div style={{ fontSize: 12.8, fontWeight: 700, color: ADM.TEXT, lineHeight: 1.4 }}>{c.titolo}</div>
                      {cat && <div style={{ fontSize: 11.4, color: ADM.MUTED_SOFT, marginTop: 3 }}>{cat.nome}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        {c.agente ? <AmbFaccia id={c.agente} size={20}/> : null}
                        <span style={{ flex: 1, fontSize: 11.4, color: ADM.MUTED, lineHeight: 1.4 }}>{c.nota}</span>
                      </div>
                      {c.tentativi >= 2 && (
                        <div style={{ marginTop: 7, fontSize: 11, fontWeight: 700, color: ADM.WARN }}>
                          {c.tentativi} tentativi — non si ritenta più
                        </div>
                      )}
                    </div>
                  );
                })}
                {voci.length === 0 && (
                  <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 11.8, color: ADM.MUTED_LIGHT }}>Vuota</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 13, padding: 13, borderRadius: 12, background: ADM.WARN_SOFT, border: `1px solid #F0DFB8` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
          <BuIcons.info size={15} color="#8A5205"/>
          <div style={{ flex: 1, fontSize: 12.6, color: '#7A4A05', lineHeight: 1.55 }}>
            <strong>Come si assegna.</strong> Un agente prende <strong>un compito per volta</strong>, il più
            urgente fra quelli della sua catena. Se fallisce, il compito torna in coda con un tentativo in
            più; al secondo fallimento non si ritenta: passa a una persona con scritto che cosa non ha
            funzionato. È il motivo per cui la colonna «A una persona» è una colonna e non un errore.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4 · Il registro ────────────────────────────────────────────────────────

function AmbRegistro({ catene }) {
  const [catena, setCatena] = useStateAmb('tutte');
  const righe = HUB_AMB_TRACCIA.filter(t => catena === 'tutte' || t.catena === catena)
    .slice().sort((a, b) => b.t - a.t);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 12.6, fontWeight: 700, color: ADM.MUTED }}>Catena</span>
        <div style={{ width: 280 }}>
          <AdmSelect block value={catena} onChange={setCatena}
            options={[{ value: 'tutte', label: 'Tutte le catene' }, ...catene.map(c => ({ value: c.id, label: c.nome }))]}/>
        </div>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '4px 0' }}>
          {righe.map((t, i) => {
            const az = HUB_AMB_AZIONI[t.cosa] || HUB_AMB_AZIONI.legge;
            const Ic = BuIcons[az.icona];
            const c = ambCatena(t.catena, catene);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 15px',
                borderBottom: i === righe.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
              }}>
                <span style={{ fontSize: 11.6, color: ADM.MUTED_LIGHT, fontWeight: 700, width: 76, flexShrink: 0, paddingTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtRelative(t.t)}
                </span>
                <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: ADM[az.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[az.color] }}><Ic size={12}/></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.2, color: ADM.TEXT, lineHeight: 1.45 }}>
                    <strong style={{ fontWeight: 700 }}>{ambNomeAgente(t.chi)}</strong>
                    <span style={{ color: ADM[az.color], fontWeight: 700 }}> {az.label}</span>
                    <span style={{ color: ADM.MUTED }}> — {t.dettaglio}</span>
                  </div>
                  {c && <div style={{ fontSize: 11.4, color: ADM.MUTED_LIGHT, marginTop: 2 }}>{c.nome}</div>}
                </div>
              </div>
            );
          })}
          {righe.length === 0 && <div style={{ padding: 26 }}><HubVuoto icona="list" titolo="Niente da mostrare" desc="Questa catena non ha ancora girato."/></div>}
        </div>
      </AdmCard>
    </div>
  );
}

// ─── Le guardie ─────────────────────────────────────────────────────────────

function AmbGuardie() {
  const [stato, setStato] = useStateAmb(() => {
    const s = {}; HUB_AMB_GUARDIE.forEach(g => { s[g.id] = g.acceso; }); return s;
  });
  return (
    <AdmCard padding={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: ADM.OK_SOFT, color: ADM.OK }}>
          <BuIcons.shield size={14}/>
        </span>
        <span style={{ fontSize: 14.6, fontWeight: 700, color: ADM.TEXT }}>Le guardie dell'ambiente</span>
      </div>
      <div style={{ fontSize: 12.6, color: ADM.MUTED, lineHeight: 1.5, marginBottom: 13 }}>
        Valgono per tutte le catene. Sono il motivo per cui un ambiente si può lasciare acceso di notte.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HUB_AMB_GUARDIE.map(g => (
          <label key={g.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: 11, borderRadius: 10, cursor: 'pointer',
            background: stato[g.id] ? '#F4FBF6' : ADM.PANEL_SOFT,
            border: `1px solid ${stato[g.id] ? '#CDEBD8' : ADM.BORDER}`,
          }}>
            <AdmSwitch size="sm" checked={!!stato[g.id]} onChange={v => setStato(s => Object.assign({}, s, { [g.id]: v }))}/>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 13.2, fontWeight: 700, color: ADM.TEXT }}>{g.label}</span>
              <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>{g.desc}</span>
            </span>
          </label>
        ))}
      </div>
    </AdmCard>
  );
}

// ─── La pagina ──────────────────────────────────────────────────────────────

function HubAmbientePage({ catene, setCatene }) {
  const [tab, setTab] = useStateAmb('catene');
  // Le catene arrivano dal padre (HubAgentPage): «Costruisci una catena» deve
  // costruire davvero, e se ne devono accorgere cruscotto, filtri E il
  // conteggio della tab «Ambiente» — che vive fuori da questa pagina. Una
  // fonte per ogni fatto, anche attraverso lo smontaggio del cambio scheda.

  const inCoda = HUB_AMB_COMPITI.filter(c => c.stato === 'coda').length;
  const aPersona = HUB_AMB_COMPITI.filter(c => c.stato === 'persona').length;
  const speso = catene.reduce((s, c) => s + c.costoGiorno, 0);
  const tetto = catene.reduce((s, c) => s + c.tetto, 0);
  const ferme = catene.filter(c => c.stato === 'ferma').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Il cruscotto dell'ambiente: le quattro cose che dicono se sta
          lavorando o se sta girando a vuoto. */}
      <div style={{
        borderRadius: 16, padding: 18, color: '#fff', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(120deg, #1B0B2E 0%, #45106B 48%, #7C0C9E 100%)',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, opacity: 0.28,
          background: 'radial-gradient(640px 220px at 88% -30%, rgba(237,25,153,0.9), transparent 70%)',
        }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
            <BuIcons.flow size={16} color="#fff"/>
            <span style={{ fontSize: 11.4, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>L'ambiente, adesso</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 18 }}>
            {[
              { l: 'Catene attive', v: catene.filter(c => c.stato === 'attiva').length, s: ferme ? `${ferme} ferma da guardare` : `su ${catene.length} costruite` },
              { l: 'Compiti in coda', v: inCoda, s: inCoda ? 'in attesa di essere presi' : 'niente arretrato' },
              { l: 'Saliti a una persona', v: aPersona, s: 'aspettano una decisione' },
              { l: 'Speso oggi', v: '€' + speso.toFixed(2), s: `su un tetto di €${tetto}` },
            ].map(x => (
              <div key={x.l}>
                <div style={{ fontSize: 11.2, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.72 }}>{x.l}</div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 4, lineHeight: 1 }}>{x.v}</div>
                <div style={{ fontSize: 12.2, opacity: 0.78, marginTop: 4 }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HubSegmenti attivo={tab} onCambia={setTab} voci={[
        { id: 'catene',   label: 'Catene',   conteggio: catene.length },
        { id: 'lavagna',  label: 'Lavagna',  conteggio: HUB_AMB_NOTE.length },
        { id: 'coda',     label: 'Coda',     conteggio: inCoda || null },
        { id: 'registro', label: 'Registro' },
        { id: 'guardie',  label: 'Guardie' },
      ]}/>

      {tab === 'catene' && <AmbCatene catene={catene} onCambia={setCatene}/>}
      {tab === 'lavagna' && <AmbLavagna catene={catene}/>}
      {tab === 'coda' && <AmbCoda catene={catene}/>}
      {tab === 'registro' && <AmbRegistro catene={catene}/>}
      {tab === 'guardie' && <AmbGuardie/>}
    </div>
  );
}

window.HubAmbientePage = HubAmbientePage;
window.AmbArgomento = AmbArgomento;
window.AmbFaccia = AmbFaccia;

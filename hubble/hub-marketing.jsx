// Hubble · Marketing — Mail, SMS, Push, Form.
//
// «Promozioni» era una sezione sola con tre tab dentro: broadcast, workflow
// email, campagne di acquisizione. Andava bene finché il marketing era una
// cosa che si faceva ogni tanto. Ora i canali sono quattro, ognuno con il suo
// storico, le sue statistiche e il suo modo di costruire un materiale — e
// stanno a pari livello nel menu, raggiungibili in un colpo dal flyout.
//
// Ogni pagina fa le stesse quattro cose, nello stesso ordine: dice come sta
// andando il canale (i riquadri in cima), elenca quello che è già stato fatto,
// lascia aprire un pezzo per vederne i numeri, e lascia crearne uno nuovo.

const { useState: useStateMk, useMemo: useMemoMk } = React;

// ─── Pezzi condivisi ────────────────────────────────────────────────────────

// La percentuale di un tasso, scritta come si legge: «56,1%».
const mkPc = (a, b) => b > 0 ? (a / b * 100).toFixed(1).replace('.', ',') + '%' : '—';

// Il nome dell'elenco usato come pubblico, o la frase che dice che non ce n'è.
function mkPubblicoLabel(id) {
  if (!id) return 'Nessun pubblico scelto';
  const e = HUB_ELENCHI.find(x => x.id === id);
  return e ? e.nome : id;
}
function mkPubblicoConta(id) {
  const e = HUB_ELENCHI.find(x => x.id === id);
  return e ? elMembri(e) : 0;
}

// Dal valore del selettore d'innesco («form:FR-005») alla frase che lo
// storico mostra — la stessa forma dei trigger già nei dati.
function mkTriggerLabel(v) {
  const [k, id] = String(v).split(':');
  if (k === 'form') { const f = HUB_FORM.find(x => x.id === id); return f ? 'Submission form · ' + f.nome : v; }
  const w = HUB_WORKFLOW.find(x => x.id === id); return w ? 'Workflow · ' + w.nome : v;
}

// Il selettore del pubblico: o un elenco già fatto, o dei criteri scritti al
// volo. Sono la stessa cosa — la seconda è la prima senza il nome — e infatti
// il pannello dei filtri è lo stesso di Contatti.
function MktPubblico({ elencoId, onElenco, filtri, onFiltri }) {
  const [modo, setModo] = useStateMk(filtri && filtri.length ? 'filtri' : 'elenco');
  const conta = modo === 'elenco' ? mkPubblicoConta(elencoId) : hubApplica(CONTATTI, filtri, null).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13, flexWrap: 'wrap' }}>
        <HubSegmenti attivo={modo} onCambia={setModo} voci={[
          { id: 'elenco', label: 'Un elenco' }, { id: 'filtri', label: 'Criteri al volo' },
        ]}/>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 13.6, color: ADM.MUTED }}>
          <strong style={{ color: ADM.TEXT, fontWeight: 800, fontSize: 15 }}>{fmtNum(conta)}</strong> destinatari
        </span>
      </div>
      {/* Segmentare non è comunicare (P-30 · D-28): i gusti filtrano il
          pubblico, non lo autorizzano. La riga si accende quando il pubblico
          li usa, in tutti e tre i compositori. */}
      {hubUsaGusti(filtri, modo === 'elenco' ? elencoId : null) && (
        <div style={{ marginBottom: 12, padding: '10px 13px', borderRadius: 10, background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', fontSize: 12.8, color: '#7A4A0B', lineHeight: 1.5 }}>
          Il pubblico è filtrato per gusti. Segmentare non è comunicare: partirà solo a chi ha il consenso di marketing di questo canale, e chi non ce l'ha è escluso al momento dell'invio.
        </div>
      )}

      {modo === 'elenco' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 9 }}>
          {HUB_ELENCHI.map(e => {
            const on = elencoId === e.id;
            const t = EL_TIPI[e.tipo];
            return (
              <button key={e.id} onClick={() => onElenco(e.id)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', padding: 12,
                borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`,
                background: on ? ADM.PINK_BG_SOFT : '#fff',
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK : ADM[t.color],
                }}>{React.createElement(BuIcons[t.icona], { size: 14 })}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.6, fontWeight: 700, color: on ? ADM.PINK_DARK : ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nome}</span>
                  <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED, marginTop: 2 }}>{fmtNum(elMembri(e))} contatti · {t.label.toLowerCase()}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 14, border: `1px solid ${ADM.BORDER}`, borderRadius: 12, background: ADM.PANEL_SOFT }}>
          <HubFiltri righe={CONTATTI} includi={filtri || []} onIncludi={onFiltri}/>
        </div>
      )}
    </div>
  );
}

// La barra dei passi in cima a una creazione. Numerata: dice quanti sono, a
// che punto siamo, e lascia tornare indietro senza perdere quello che si è
// scritto — un percorso a senso unico si abbandona alla prima esitazione.
function MktPassi({ passi, attivo, onVai }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {passi.map((p, i) => {
        const fatto = i < attivo, on = i === attivo;
        return (
          <React.Fragment key={p}>
            {i > 0 && <span style={{ width: 22, height: 1.5, background: fatto || on ? ADM.PINK_SOFT : ADM.BORDER, flexShrink: 0 }}/>}
            <button onClick={() => onVai(i)} disabled={i > attivo} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 7px',
              borderRadius: 999, border: `1px solid ${on ? ADM.PINK : 'transparent'}`,
              background: on ? ADM.PINK_BG_SOFT : fatto ? '#fff' : 'transparent',
              cursor: i > attivo ? 'default' : 'pointer', fontFamily: 'inherit',
              opacity: i > attivo ? 0.5 : 1,
            }}>
              <span style={{
                width: 21, height: 21, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
                background: on ? ADM.PINK : fatto ? ADM.OK : ADM.NEUTRAL_SOFT,
                color: on || fatto ? '#fff' : ADM.MUTED, fontSize: 11.5, fontWeight: 800,
              }}>{fatto ? <BuIcons.check size={12}/> : i + 1}</span>
              <span style={{ fontSize: 13.4, fontWeight: on ? 700 : 600, color: on ? ADM.PINK_DARK : ADM.TEXT }}>{p}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Un riquadro di statistica con la barra sotto: valore assoluto, percentuale
// sul consegnato, e quanto pesa rispetto al massimo della riga.
function MktStat({ label, valore, base, color = 'PINK', sotto }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 12, padding: '13px 15px', boxShadow: ADM.CARD_SHADOW }}>
      <div style={{ fontSize: 11.3, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '7px 0 9px' }}>
        <span style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.03em', color: ADM.TEXT, lineHeight: 1 }}>{fmtNum(valore)}</span>
        {base > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: ADM[color] }}>{mkPc(valore, base)}</span>}
      </div>
      <HubBarra valore={valore} max={base || 1} color={color} altezza={5}/>
      {sotto && <div style={{ fontSize: 12.2, color: ADM.MUTED, marginTop: 7 }}>{sotto}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIL
// ═══════════════════════════════════════════════════════════════════════════

function HubMailPage() {
  const [vista, setVista] = useStateMk('tutte');
  const [cerca, setCerca] = useStateMk('');
  const [aperta, setAperta] = useStateMk(null);
  const [nuova, setNuova] = useStateMk(false);
  // Le bozze salvate e le copie entrano nel mock condiviso: `ver` avvisa la
  // lista memoizzata che HUB_MAIL è cambiato sotto i suoi piedi.
  const [ver, setVer] = useStateMk(0);

  const lista = useMemoMk(() => {
    let r = HUB_MAIL.slice();
    if (vista === 'normale') r = r.filter(m => m.tipo === 'normale');
    if (vista === 'automatica') r = r.filter(m => m.tipo === 'automatica');
    const q = cerca.trim().toLowerCase();
    if (q) r = r.filter(m => (m.nome + ' ' + m.oggetto).toLowerCase().includes(q));
    return r;
  }, [vista, cerca, ver]);

  // Un record nuovo — la bozza dal composer, la copia dal dettaglio — si
  // infila in testa allo storico e si torna alla lista: l'esito del click
  // è la riga che compare.
  const aggiungi = (m) => { HUB_MAIL.unshift(m); setVer(v => v + 1); setNuova(false); setAperta(null); };

  if (nuova) return <HubMailComposer onChiudi={() => setNuova(false)} onBozza={aggiungi}/>;
  if (aperta) return <HubMailDettaglio mail={aperta} onChiudi={() => setAperta(null)} onAggiungi={aggiungi}/>;

  const inviate = HUB_MAIL.filter(m => m.stato === 'inviata');
  const totDest = inviate.reduce((s, m) => s + m.consegnate, 0);
  const totAperte = inviate.reduce((s, m) => s + m.aperte, 0);
  const totClick = inviate.reduce((s, m) => s + m.click, 0);

  const colonne = [
    { id: 'nome',      label: 'Campagna',    w: 'minmax(0,2.4fr)' },
    { id: 'stato',     label: 'Stato',       w: '1.05fr' },
    { id: 'pubblico',  label: 'Pubblico',    w: '1.5fr', ordinabile: false },
    { id: 'dest',      label: 'Inviate',     w: '0.85fr', destra: true },
    { id: 'aperture',  label: 'Aperture',    w: '0.9fr',  destra: true },
    { id: 'click',     label: 'Click',       w: '0.9fr',  destra: true },
    { id: 'quando',    label: 'Quando',      w: '1.15fr' },
  ];

  const cella = (id, m) => {
    if (id === 'nome') return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.3, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nome}</div>
        <div style={{ fontSize: 12.5, color: ADM.MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ color: ADM.MUTED_SOFT }}>Oggetto:</span> {m.oggetto}
        </div>
      </div>
    );
    if (id === 'stato') return <HubStato stato={m.stato} mappa={HUB_STATI_INVIO}/>;
    if (id === 'pubblico') return m.trigger
      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <BuIcons.bolt size={13} color={ADM.HUB_VIOLA}/>
          <span style={{ fontSize: 12.8, color: ADM.MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.trigger}</span>
        </span>
      : <span style={{ fontSize: 13.2, color: m.pubblico ? ADM.TEXT : ADM.MUTED_LIGHT }}>{mkPubblicoLabel(m.pubblico)}</span>;
    if (id === 'dest') return <span style={{ fontSize: 13.8, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{m.consegnate ? fmtNum(m.consegnate) : '—'}</span>;
    if (id === 'aperture') return m.consegnate
      ? <span style={{ fontSize: 13.8, fontWeight: 700, color: ADM.OK, fontVariantNumeric: 'tabular-nums' }}>{mkPc(m.aperte, m.consegnate)}</span>
      : <span style={{ color: ADM.MUTED_LIGHT }}>—</span>;
    if (id === 'click') return m.consegnate
      ? <span style={{ fontSize: 13.8, fontWeight: 700, color: ADM.HUB_MAGENTA_DARK, fontVariantNumeric: 'tabular-nums' }}>{mkPc(m.click, m.consegnate)}</span>
      : <span style={{ color: ADM.MUTED_LIGHT }}>—</span>;
    const q = m.inviata || m.programmata;
    return <span style={{ fontSize: 13.2, color: ADM.MUTED }}>{q ? fmtDateTime(q) : m.trigger ? 'A ogni innesco' : '—'}</span>;
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="Mail"
        sotto="Le campagne una tantum e i modelli che partono da soli — conferme, ritardi, sequenze. Stesso costruttore, innesco diverso."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuova(true)}>Crea email</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Email consegnate" valore={fmtNum(totDest)} icona="mail" sotto="Sulle campagne già partite"/>
        <HubTile etichetta="Tasso di apertura" valore={mkPc(totAperte, totDest)} tono="OK" icona="eye" sotto={`${fmtNum(totAperte)} aperture`}/>
        <HubTile etichetta="Tasso di click" valore={mkPc(totClick, totDest)} tono="HUB_MAGENTA" icona="cursorClick" sotto={`${fmtNum(totClick)} click`}/>
        <HubTile etichetta="Modelli automatici" valore={HUB_MAIL.filter(m => m.tipo === 'automatica').length} icona="bolt" tono="HUB_VIOLA"
          sotto="Legati a form e workflow"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}`, flexWrap: 'wrap' }}>
          <HubSegmenti attivo={vista} onCambia={setVista} voci={[
            { id: 'tutte', label: 'Tutte', conteggio: HUB_MAIL.length },
            { id: 'normale', label: 'Una tantum', conteggio: HUB_MAIL.filter(m => m.tipo === 'normale').length },
            { id: 'automatica', label: 'Automatiche', conteggio: HUB_MAIL.filter(m => m.tipo === 'automatica').length },
          ]}/>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca per nome o oggetto…" larghezza={260}/>
        </div>
        <HubTabella colonne={colonne} righe={lista} chiave={m => m.id} cella={cella} onRiga={setAperta}
          vuoto={<HubVuoto icona="mail" titolo="Nessuna email qui" desc="Cambia vista o crea la prima campagna."/>}/>
      </AdmCard>
    </div>
  );
}

function HubMailDettaglio({ mail, onChiudi, onAggiungi }) {
  const [tab, setTab] = useStateMk('numeri');
  const [doc] = useStateMk(mbDocIniziale);
  const [modifica, setModifica] = useStateMk(false);
  const inviata = mail.consegnate > 0;

  // «Modifica» apre il composer precompilato con questa campagna e si torna
  // qui alla chiusura; «Duplica» costruisce la copia in bozza — contenuto
  // sì, numeri no — e riporta alla lista, dove la riga nuova è l'esito
  // visibile del click.
  if (modifica) return <HubMailComposer iniziale={mail} onChiudi={() => setModifica(false)} onBozza={onAggiungi}/>;
  const duplica = () => onAggiungi(Object.assign({}, mail, {
    id: mail.id + '-C' + (HUB_MAIL.length + 1), nome: mail.nome + ' — copia', stato: 'bozza',
    inviata: null, programmata: null, dest: 0, consegnate: 0, aperte: 0, click: 0, disiscritti: 0, rimbalzi: 0,
  }));

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Mail</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{mail.nome}</span>
      </div>

      <HubTestata titolo={mail.nome}
        sotto={`Oggetto: «${mail.oggetto}» · Anteprima: «${mail.anteprima}»`}
        azioni={
          <React.Fragment>
            {/* Lo stato stava nell'occhiello sopra il titolo: l'occhiello è
                morto, lo stato no — è una pillola accanto alle azioni. */}
            <HubPillola color={HUB_STATI_INVIO[mail.stato].color}>{HUB_STATI_INVIO[mail.stato].label}</HubPillola>
            <HubStrumento icona="copy" onClick={duplica}>Duplica</HubStrumento>
            <HubStrumento icona="pencil" forte onClick={() => setModifica(true)}>Modifica</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <HubSegmenti attivo={tab} onCambia={setTab} voci={[
              { id: 'numeri', label: 'Andamento' }, { id: 'contenuto', label: 'Contenuto' },
            ]}/>
          </div>

          {tab === 'numeri' && (inviata ? (
            <React.Fragment>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
                <MktStat label="Consegnate" valore={mail.consegnate} base={mail.dest} color="INFO" sotto={`${mail.rimbalzi} rimbalzi su ${fmtNum(mail.dest)} inviate`}/>
                <MktStat label="Aperte" valore={mail.aperte} base={mail.consegnate} color="OK" sotto="Sul consegnato, non sull'inviato"/>
                <MktStat label="Click" valore={mail.click} base={mail.consegnate} color="HUB_MAGENTA" sotto={`${mkPc(mail.click, mail.aperte)} di chi ha aperto`}/>
              </div>
              <AdmCard padding={18}>
                <HubSezione titolo="Che cosa dicono questi numeri">
                  <div style={{ fontSize: 14, color: ADM.TEXT, lineHeight: 1.65 }}>
                    {mail.aperte / Math.max(1, mail.consegnate) > 0.5
                      ? 'Apertura sopra la media del settore: l\'oggetto funziona. Se il click resta basso rispetto alle aperture, il problema è dentro la mail, non nell\'oggetto.'
                      : 'Apertura sotto la metà: prima di riscrivere la mail conviene provare due oggetti diversi sullo stesso pubblico.'}
                    {mail.disiscritti > 3 && ' Attenzione alle disiscrizioni: ' + mail.disiscritti + ' su questo invio, sopra la soglia che ci siamo dati.'}
                  </div>
                </HubSezione>
              </AdmCard>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
                <HubTile etichetta="Disiscritti" valore={mail.disiscritti} tono={mail.disiscritti > 3 ? 'DANGER' : 'TEXT'} icona="x"/>
                <HubTile etichetta="Rimbalzi" valore={mail.rimbalzi} icona="alertTriangle" tono={mail.rimbalzi > 10 ? 'WARN' : undefined}/>
                <HubTile etichetta="Mittente" valore={mail.mittente} icona="user" sotto={mail.mittenteMail}/>
              </div>
            </React.Fragment>
          ) : (
            <HubVuoto icona="clock" titolo="Non è ancora partita"
              desc={mail.stato === 'programmata' ? `Parte il ${fmtDateTime(mail.programmata)}. I numeri compaiono qui appena finisce l'invio.` : 'È una bozza: scegli il pubblico e programmala per vedere i numeri.'}/>
          ))}

          {tab === 'contenuto' && (
            <AdmCard padding={0} style={{ overflow: 'hidden' }}>
              <div style={{ background: ADM.PANEL_SOFT, padding: 24, display: 'flex', justifyContent: 'center' }}>
                {/* È il corpo di una campagna già confezionata, non un editor:
                    i pointer events sono spenti così i blocchi non promettono
                    hover e comandi, e il contentEditable non raccoglie mai
                    battute che nessuno salverebbe. L'onTesto muto è la
                    cintura per il fuoco che arrivasse da tastiera. */}
                <div style={{ width: 520, maxWidth: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 12px 30px -14px rgba(15,17,21,0.24)', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' }}>
                  {doc.blocchi.map(b => (
                    <MbBlocco key={b.id} b={b} doc={doc} selezionato={false} onSeleziona={() => {}}
                      onSu={() => {}} onGiu={() => {}} onElimina={() => {}} onDuplica={() => {}} onTesto={() => {}}/>
                  ))}
                </div>
              </div>
            </AdmCard>
          )}
        </div>

        <AdmCard padding={18}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>La scheda</div>
          {[
            ['Tipo', mail.tipo === 'automatica' ? 'Automatica' : 'Una tantum'],
            ['Stato', HUB_STATI_INVIO[mail.stato].label],
            [mail.trigger ? 'Innesco' : 'Pubblico', mail.trigger || mkPubblicoLabel(mail.pubblico)],
            ['Mittente', `${mail.mittente} · ${mail.mittenteMail}`],
            ['Oggetto', mail.oggetto],
            ['Anteprima', mail.anteprima],
            ['Quando', mail.inviata ? fmtDateTime(mail.inviata) : mail.programmata ? fmtDateTime(mail.programmata) : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
              <span style={{ fontSize: 12.6, color: ADM.MUTED, width: 92, flexShrink: 0, fontWeight: 600 }}>{k}</span>
              <span style={{ fontSize: 13.2, color: ADM.TEXT, flex: 1, minWidth: 0, lineHeight: 1.45 }}>{v}</span>
            </div>
          ))}
        </AdmCard>
      </div>
    </div>
  );
}

function HubMailComposer({ onChiudi, iniziale, onBozza }) {
  const [passo, setPasso] = useStateMk(0);
  const [tipo, setTipo] = useStateMk(iniziale ? iniziale.tipo : 'normale');
  const [nome, setNome] = useStateMk(iniziale ? iniziale.nome : '');
  const [oggetto, setOggetto] = useStateMk(iniziale ? iniziale.oggetto : '');
  const [anteprima, setAnteprima] = useStateMk(iniziale ? iniziale.anteprima : '');
  // Con `iniziale` (il «Modifica» del dettaglio) si riparte dal mittente di
  // quella campagna, riconosciuto per indirizzo.
  const [mittente, setMittente] = useStateMk(() => {
    const m = iniziale && HUB_MITTENTI.find(x => x.indirizzo === iniziale.mittenteMail);
    return m ? m.id : 'MT-1';
  });
  const [elencoId, setElencoId] = useStateMk(iniziale ? iniziale.pubblico || null : null);
  const [filtri, setFiltri] = useStateMk([]);
  const [trigger, setTrigger] = useStateMk('');
  const [doc, setDoc] = useStateMk(mbDocIniziale);
  const [quando, setQuando] = useStateMk('subito');
  const [data, setData] = useStateMk(null);
  const [ora, setOra] = useStateMk('09:00');
  const [prova, setProva] = useStateMk(false);

  const mt = HUB_MITTENTI.find(m => m.id === mittente) || HUB_MITTENTI[0];
  const passi = ['Tipo e destinatari', 'Oggetto e mittente', 'Grafica', 'Invio'];

  // La bozza che finisce nello storico: il contenuto c'è, i numeri no.
  const bozza = () => ({
    id: 'ML-B' + (HUB_MAIL.length + 1), nome: nome || 'Bozza senza nome', tipo, stato: 'bozza',
    oggetto: oggetto || '—', anteprima: anteprima || '', mittente: mt.nome, mittenteMail: mt.indirizzo,
    pubblico: tipo === 'normale' ? elencoId : null,
    trigger: tipo === 'automatica' && trigger ? mkTriggerLabel(trigger) : null,
    dest: 0, consegnate: 0, aperte: 0, click: 0, disiscritti: 0, rimbalzi: 0,
  });

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>{iniziale ? iniziale.nome : 'Mail'}</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{iniziale ? 'Modifica' : nome || 'Nuova email'}</span>
      </div>

      <HubTestata titolo={iniziale ? 'Modifica l\'email' : 'Crea un\'email'}
        sotto="Quattro passi. Si può tornare indietro in qualunque momento senza perdere niente."
        azioni={
          <React.Fragment>
            <HubStrumento icona="save" onClick={() => onBozza ? onBozza(bozza()) : onChiudi()}>Salva bozza</HubStrumento>
            {passo > 0 && <HubStrumento icona="arrowLeft" onClick={() => setPasso(p => p - 1)}>Indietro</HubStrumento>}
            {passo < passi.length - 1
              ? <HubStrumento forte icona="arrowRight" onClick={() => setPasso(p => p + 1)}>Avanti</HubStrumento>
              : <HubStrumento forte icona="send" onClick={onChiudi}>{quando === 'subito' ? 'Invia adesso' : 'Programma'}</HubStrumento>}
          </React.Fragment>
        }/>

      <MktPassi passi={passi} attivo={passo} onVai={setPasso}/>

      {passo === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 11 }}>Che email è</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'normale', l: 'Una tantum', d: 'La mandi tu, una volta, a un pubblico che scegli adesso.', i: 'send' },
                { id: 'automatica', l: 'Automatica', d: 'Diventa un modello: la manda un form o un workflow, ogni volta che serve.', i: 'bolt' },
              ].map(o => {
                const on = tipo === o.id;
                const Ic = BuIcons[o.i];
                return (
                  <button key={o.id} onClick={() => setTipo(o.id)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11, textAlign: 'left', padding: 14, borderRadius: 12,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK_BG_SOFT : '#fff',
                  }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK : ADM.MUTED }}><Ic size={17}/></span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 14.4, fontWeight: 700, color: on ? ADM.PINK_DARK : ADM.TEXT }}>{o.l}</span>
                      <span style={{ display: 'block', fontSize: 12.6, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>{o.d}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </AdmCard>
          <AdmCard padding={18}>
            <HubCampo label="Nome della campagna" nota="Serve a te, non a chi la riceve: è il nome con cui la ritrovi nello storico.">
              <HubInput valore={nome} onCambia={setNome} placeholder="es. Novità di primavera · rilascio 4.2"/>
            </HubCampo>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>
              {tipo === 'normale' ? 'A chi la mandiamo' : 'Che cosa la fa partire'}
            </div>
            {tipo === 'normale'
              ? <MktPubblico elencoId={elencoId} onElenco={setElencoId} filtri={filtri} onFiltri={setFiltri}/>
              : <HubCampo label="Innesco" nota="Il modello resta fermo finché un form o un workflow non lo chiama.">
                  <AdmSelect block value={trigger} onChange={setTrigger} options={[
                    { value: '', label: 'Scegli l\'innesco…' },
                    ...HUB_FORM.map(f => ({ value: 'form:' + f.id, label: 'Submission form · ' + f.nome })),
                    ...HUB_WORKFLOW.map(w => ({ value: 'wf:' + w.id, label: 'Workflow · ' + w.nome })),
                  ]}/>
                </HubCampo>}
          </AdmCard>
        </div>
      )}

      {passo === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14, alignItems: 'start' }}>
          <AdmCard padding={18}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <HubCampo label="Oggetto" nota="È la sola cosa che decide se la mail viene aperta. Sotto i 50 caratteri non viene tagliato sul telefono.">
                <HubInput valore={oggetto} onCambia={setOggetto} placeholder="es. Le prenotazioni ora si gestiscono da sole"/>
              </HubCampo>
              <HubCampo label="Testo di anteprima" nota="La riga grigia sotto l'oggetto nella lista della posta. Se la lasci vuota, le app ci mettono la prima riga della mail — che spesso è «Se non vedi bene questa email…».">
                <HubInput valore={anteprima} onCambia={setAnteprima} placeholder="es. Tre cose nuove che ti tolgono lavoro dalle mani"/>
              </HubCampo>
              <HubCampo label="Mittente" nota="Solo gli indirizzi su domini verificati possono spedire: gli altri finiscono nello spam.">
                <AdmSelect block value={mittente} onChange={setMittente}
                  options={HUB_MITTENTI.filter(m => m.stato === 'verificato').map(m => ({ value: m.id, label: `${m.nome} · ${m.indirizzo}` }))}/>
              </HubCampo>
            </div>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 12 }}>Come si vedrà nella posta</div>
            <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 12, padding: 14, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: ADM.HUB_GRAD_DIAG, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                  {mt.nome.slice(0, 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.6, fontWeight: 700, color: ADM.TEXT }}>{mt.nome}</div>
                  <div style={{ fontSize: 11.8, color: ADM.MUTED_SOFT }}>{mt.indirizzo}</div>
                </div>
                <span style={{ fontSize: 11.8, color: ADM.MUTED_SOFT }}>ora</span>
              </div>
              <div style={{ fontSize: 14.2, fontWeight: 700, color: ADM.TEXT, lineHeight: 1.35 }}>
                {oggetto || <span style={{ color: ADM.MUTED_LIGHT, fontWeight: 500 }}>(oggetto vuoto)</span>}
              </div>
              <div style={{ fontSize: 13, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>
                {anteprima || <span style={{ color: ADM.MUTED_LIGHT }}>(nessun testo di anteprima)</span>}
              </div>
            </div>
            <div style={{ fontSize: 12.2, color: ADM.MUTED, marginTop: 11, lineHeight: 1.5 }}>
              {oggetto.length > 50
                ? `L'oggetto è di ${oggetto.length} caratteri: su iPhone se ne leggono circa 40.`
                : `Oggetto di ${oggetto.length} caratteri — sta dentro il taglio dei telefoni.`}
            </div>
          </AdmCard>
        </div>
      )}

      {passo === 2 && <HubMailBuilder doc={doc} onDoc={setDoc} meta={{ oggetto, anteprima }}/>}

      {passo === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14, alignItems: 'start' }}>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 12 }}>Quando parte</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { id: 'subito', l: 'Adesso', d: 'Parte appena confermi.', i: 'send' },
                { id: 'programmato', l: 'A una data', d: 'Scegli giorno e ora: puoi ancora fermarla prima.', i: 'calendar' },
              ].map(o => {
                const on = quando === o.id;
                const Ic = BuIcons[o.i];
                return (
                  <button key={o.id} onClick={() => setQuando(o.id)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11, textAlign: 'left', padding: 14, borderRadius: 12,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK_BG_SOFT : '#fff',
                  }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK : ADM.MUTED }}><Ic size={16}/></span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 14.2, fontWeight: 700, color: on ? ADM.PINK_DARK : ADM.TEXT }}>{o.l}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: ADM.MUTED, marginTop: 3 }}>{o.d}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {quando === 'programmato' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
                <HubCampo label="Giorno"><HubData valore={data} onCambia={setData}/></HubCampo>
                <HubCampo label="Ora"><HubInput valore={ora} onCambia={setOra} placeholder="09:00"/></HubCampo>
              </div>
            )}
            <div style={{ marginTop: 16, padding: 14, borderRadius: 11, background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', display: 'flex', gap: 10 }}>
              <BuIcons.alertTriangle size={17} color="#92400E"/>
              <div style={{ fontSize: 13, color: '#7A4A0B', lineHeight: 1.55 }}>
                Chi ha il consenso email spento non riceve questa mail, anche se è dentro il pubblico. È la regola, non un'opzione — e vale anche se il pubblico è filtrato per gusti: segmentare non è comunicare.
              </div>
            </div>
          </AdmCard>

          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>Prima di partire</div>
            {[
              ['Nome', nome || '—'],
              ['Tipo', tipo === 'normale' ? 'Una tantum' : 'Automatica'],
              ['Destinatari', tipo === 'normale' ? fmtNum(elencoId ? mkPubblicoConta(elencoId) : hubApplica(CONTATTI, filtri, null).length) : 'A ogni innesco'],
              ['Oggetto', oggetto || '—'],
              ['Mittente', `${mt.nome} · ${mt.indirizzo}`],
              ['Blocchi', doc.blocchi.length + ' nella grafica'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
                <span style={{ fontSize: 12.6, color: ADM.MUTED, width: 96, flexShrink: 0, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13.2, color: ADM.TEXT, flex: 1, minWidth: 0 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              {/* La prova è finta ma l'esito si vede: il bottone conferma
                  a chi è arrivata — me@byup.it è l'operatore loggato — e
                  poi torna com'era. */}
              <HubStrumento icona={prova ? 'check' : 'send'} acceso={prova}
                onClick={() => { if (!prova) { setProva(true); setTimeout(() => setProva(false), 2600); } }}>
                {prova ? 'Inviata a me@byup.it' : 'Mandami una prova'}
              </HubStrumento>
            </div>
          </AdmCard>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SMS
// ═══════════════════════════════════════════════════════════════════════════

// Un SMS si conta in segmenti da 160 caratteri, e ogni segmento si paga. Il
// contatore va scritto in chiaro mentre si scrive: scoprire il costo dopo è
// il modo più veloce per mandare mille messaggi in doppio.
function smsSegmenti(t) {
  const n = (t || '').length;
  if (n === 0) return 0;
  return n <= 160 ? 1 : Math.ceil(n / 153);
}

function HubSmsPage() {
  const [cerca, setCerca] = useStateMk('');
  const [aperto, setAperto] = useStateMk(null);
  const [nuovo, setNuovo] = useStateMk(false);
  // Come per le mail: le bozze salvate entrano nel mock, `ver` ricalcola.
  const [ver, setVer] = useStateMk(0);

  const lista = useMemoMk(() => {
    const q = cerca.trim().toLowerCase();
    return HUB_SMS.filter(s => !q || (s.nome + ' ' + s.testo).toLowerCase().includes(q));
  }, [cerca, ver]);

  const salvaBozza = (b) => { HUB_SMS.unshift(b); setVer(v => v + 1); setNuovo(false); };

  if (nuovo) return <HubSmsComposer onChiudi={() => setNuovo(false)} onBozza={salvaBozza}/>;
  if (aperto) return <HubSmsDettaglio sms={aperto} onChiudi={() => setAperto(null)}/>;

  const spesa = HUB_SMS.reduce((s, x) => s + x.costo, 0);
  const consegnati = HUB_SMS.reduce((s, x) => s + x.consegnati, 0);
  const inviati = HUB_SMS.reduce((s, x) => s + (x.consegnati ? x.dest : 0), 0);

  const colonne = [
    { id: 'nome',   label: 'Messaggio',  w: 'minmax(0,2.6fr)' },
    { id: 'stato',  label: 'Stato',      w: '1.05fr' },
    { id: 'segm',   label: 'Segmenti',   w: '0.85fr', destra: true },
    { id: 'dest',   label: 'Destinatari',w: '0.95fr', destra: true },
    { id: 'resa',   label: 'Consegna',   w: '0.9fr',  destra: true },
    { id: 'costo',  label: 'Costo',      w: '0.9fr',  destra: true },
    { id: 'quando', label: 'Quando',     w: '1.15fr' },
  ];

  const cella = (id, s) => {
    if (id === 'nome') return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.3, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nome}</div>
        <div style={{ fontSize: 12.5, color: ADM.MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.testo || '(vuoto)'}</div>
      </div>
    );
    if (id === 'stato') return <HubStato stato={s.stato} mappa={HUB_STATI_INVIO}/>;
    if (id === 'segm') return <span style={{ fontSize: 13.6, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{smsSegmenti(s.testo) || '—'}</span>;
    if (id === 'dest') return <span style={{ fontSize: 13.6, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(s.dest)}</span>;
    if (id === 'resa') return s.consegnati
      ? <span style={{ fontSize: 13.6, fontWeight: 700, color: ADM.OK, fontVariantNumeric: 'tabular-nums' }}>{mkPc(s.consegnati, s.dest)}</span>
      : <span style={{ color: ADM.MUTED_LIGHT }}>—</span>;
    if (id === 'costo') return <span style={{ fontSize: 13.6, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.costo ? fmtEur(s.costo) : '—'}</span>;
    const q = s.inviata || s.programmata;
    return <span style={{ fontSize: 13.2, color: ADM.MUTED }}>{q ? fmtDateTime(q) : s.trigger ? 'A ogni innesco' : '—'}</span>;
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="SMS"
        sotto="Centosessanta caratteri arrivano ovunque e li legge quasi chiunque. Costano a segmento, quindi il contatore sta sempre in vista."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo(true)}>Crea SMS</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="SMS inviati" valore={fmtNum(inviati)} icona="smartphone" sotto="Su tutte le campagne"/>
        <HubTile etichetta="Tasso di consegna" valore={mkPc(consegnati, inviati)} tono="OK" icona="check" sotto="Il resto sono numeri non validi"/>
        <HubTile etichetta="Spesa complessiva" valore={fmtEur(spesa)} icona="money" sotto="A €0,07 per segmento"/>
        <HubTile etichetta="Mittenti attivi" valore={HUB_NUMERI.filter(n => n.stato === 'attivo').length} icona="tag" sotto="Registrati e approvati" tono="HUB_MAGENTA"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}` }}>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca fra gli SMS…" larghezza={260}/>
        </div>
        <HubTabella colonne={colonne} righe={lista} chiave={s => s.id} cella={cella} onRiga={setAperto}
          vuoto={<HubVuoto icona="smartphone" titolo="Nessun SMS" desc="Creane uno: si scrive in un minuto."/>}/>
      </AdmCard>
    </div>
  );
}

// L'anteprima su schermo di telefono: il testo va guardato dentro una bolla,
// non dentro una textarea, perché è lì che finirà.
function MktTelefono({ mittente, testo, ora = 'ora' }) {
  return (
    <div style={{
      width: 268, margin: '0 auto', background: '#0F1115', borderRadius: 30, padding: 10,
      boxShadow: '0 20px 44px -18px rgba(15,17,21,0.5)',
    }}>
      <div style={{ background: '#F5F5F7', borderRadius: 22, overflow: 'hidden', minHeight: 340, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 14px 10px', borderBottom: '1px solid rgba(0,0,0,0.07)', textAlign: 'center', background: 'rgba(255,255,255,0.8)' }}>
          <div style={{ fontSize: 13.4, fontWeight: 700, color: '#16181D' }}>{mittente}</div>
          <div style={{ fontSize: 11, color: '#8A8A90', marginTop: 1 }}>SMS · {ora}</div>
        </div>
        <div style={{ flex: 1, padding: 12 }}>
          <div style={{
            background: '#E9E9EB', color: '#16181D', borderRadius: '16px 16px 16px 5px',
            padding: '9px 12px', fontSize: 13.2, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{testo || <span style={{ color: '#A0A0A6' }}>Il messaggio comparirà qui.</span>}</div>
        </div>
      </div>
    </div>
  );
}

// Il dettaglio di un SMS: gli stessi numeri della riga ma leggibili, e il
// messaggio dentro la bolla — un SMS si giudica com'è arrivato, non in
// tabella. È il gemello di HubMailDettaglio, in piccolo.
function HubSmsDettaglio({ sms, onChiudi }) {
  const inviato = sms.consegnati > 0;
  const seg = smsSegmenti(sms.testo);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>SMS</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{sms.nome}</span>
      </div>

      <HubTestata titolo={sms.nome}
        sotto={sms.trigger ? `Parte da solo: ${sms.trigger}.` : sms.testo ? `«${sms.testo}»` : 'Ancora senza testo.'}
        azioni={<HubPillola color={HUB_STATI_INVIO[sms.stato].color}>{HUB_STATI_INVIO[sms.stato].label}</HubPillola>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {inviato ? (
            <React.Fragment>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                <MktStat label="Consegnati" valore={sms.consegnati} base={sms.dest} color="OK"
                  sotto={`${fmtNum(sms.dest - sms.consegnati)} non recapitati su ${fmtNum(sms.dest)} inviati`}/>
                <MktStat label="Click sul link" valore={sms.click} base={sms.consegnati} color="HUB_MAGENTA"
                  sotto={sms.click ? 'Sul consegnato' : 'Nessun link nel messaggio'}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
                <HubTile etichetta="Costo" valore={fmtEur(sms.costo)} icona="money" sotto="A €0,07 per segmento"/>
                <HubTile etichetta="Segmenti a testa" valore={seg || '—'} icona="smartphone"/>
                <HubTile etichetta="Mittente" valore={sms.numero} icona="tag"/>
              </div>
            </React.Fragment>
          ) : (
            <HubVuoto icona="clock" titolo="Non è ancora partito"
              desc={sms.stato === 'programmata' ? `Parte il ${fmtDateTime(sms.programmata)}. I numeri compaiono qui a invio finito.` : 'È una bozza: scrivi il testo e scegli il pubblico per vedere i numeri.'}/>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <MktTelefono mittente={sms.numero} testo={sms.testo}/>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>La scheda</div>
            {[
              ['Stato', HUB_STATI_INVIO[sms.stato].label],
              [sms.trigger ? 'Innesco' : 'Pubblico', sms.trigger || mkPubblicoLabel(sms.pubblico)],
              ['Mittente', sms.numero],
              ['Segmenti', seg ? String(seg) : '—'],
              ['Costo', sms.costo ? fmtEur(sms.costo) : '—'],
              ['Quando', sms.inviata ? fmtDateTime(sms.inviata) : sms.programmata ? fmtDateTime(sms.programmata) : sms.trigger ? 'A ogni innesco' : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
                <span style={{ fontSize: 12.6, color: ADM.MUTED, width: 92, flexShrink: 0, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13.2, color: ADM.TEXT, flex: 1, minWidth: 0, lineHeight: 1.45 }}>{v}</span>
              </div>
            ))}
          </AdmCard>
        </div>
      </div>
    </div>
  );
}

function HubSmsComposer({ onChiudi, onBozza }) {
  const [nome, setNome] = useStateMk('');
  const [testo, setTesto] = useStateMk('');
  const [numero, setNumero] = useStateMk('NM-1');
  const [elencoId, setElencoId] = useStateMk(null);
  const [filtri, setFiltri] = useStateMk([]);
  const [quando, setQuando] = useStateMk('subito');
  const [data, setData] = useStateMk(null);
  const [ora, setOra] = useStateMk('10:00');

  const seg = smsSegmenti(testo);
  const dest = elencoId ? mkPubblicoConta(elencoId) : hubApplica(CONTATTI, filtri, null).length;
  const costo = seg * dest * 0.07;
  const num = HUB_NUMERI.find(n => n.id === numero) || HUB_NUMERI[0];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>SMS</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{nome || 'Nuovo SMS'}</span>
      </div>
      <HubTestata titolo="Crea un SMS"
        sotto="Un messaggio, un pubblico, un orario. Il costo si aggiorna mentre scrivi."
        azioni={
          <React.Fragment>
            {/* La bozza entra nello storico e si torna alla lista: la riga
                nuova è l'esito del click. */}
            <HubStrumento icona="save" onClick={() => onBozza({
              id: 'SM-B' + (HUB_SMS.length + 1), nome: nome || 'Bozza senza nome', stato: 'bozza',
              testo, numero: num.etichetta, dest: 0, consegnati: 0, click: 0, costo: 0,
            })}>Salva bozza</HubStrumento>
            <HubStrumento forte icona="send" onClick={onChiudi}>{quando === 'subito' ? 'Invia adesso' : 'Programma'}</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 12, marginBottom: 14 }}>
              <HubCampo label="Nome"><HubInput valore={nome} onCambia={setNome} placeholder="es. Promemoria rinnovo Plus"/></HubCampo>
              <HubCampo label="Mittente">
                <AdmSelect block value={numero} onChange={setNumero}
                  options={HUB_NUMERI.filter(n => n.stato === 'attivo').map(n => ({ value: n.id, label: n.etichetta }))}/>
              </HubCampo>
            </div>
            <HubCampo label="Testo"
              nota={`${testo.length} caratteri · ${seg || 0} ${seg === 1 ? 'segmento' : 'segmenti'} · usa {{nome}} per il nome del contatto`}>
              <HubArea valore={testo} onCambia={setTesto} righe={5}
                placeholder="Ciao {{nome}}, il tuo piano byup Plus si rinnova domani…"/>
            </HubCampo>
            {testo.length > 160 && (
              <div style={{ marginTop: 10, padding: 11, borderRadius: 10, background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', fontSize: 12.8, color: '#7A4A0B', lineHeight: 1.5 }}>
                Oltre 160 caratteri il messaggio si spezza in più segmenti e il costo si moltiplica. Con {seg} segmenti stai pagando {seg} volte ogni destinatario.
              </div>
            )}
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>A chi</div>
            <MktPubblico elencoId={elencoId} onElenco={setElencoId} filtri={filtri} onFiltri={setFiltri}/>
            <div style={{ marginTop: 12, fontSize: 12.6, color: '#7A4A0B', background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', borderRadius: 10, padding: '9px 12px', lineHeight: 1.5 }}>
              Chi ha il consenso SMS spento non riceve questo messaggio, anche se è dentro il pubblico. È la regola, non un'opzione.
            </div>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>Quando</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <HubSegmenti attivo={quando} onCambia={setQuando} voci={[
                { id: 'subito', label: 'Adesso' }, { id: 'programmato', label: 'A una data' },
              ]}/>
              {quando === 'programmato' && (
                <React.Fragment>
                  <HubCampo label="Giorno" larghezza={170}><HubData valore={data} onCambia={setData}/></HubCampo>
                  <HubCampo label="Ora" larghezza={110}><HubInput valore={ora} onCambia={setOra}/></HubCampo>
                </React.Fragment>
              )}
            </div>
          </AdmCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <MktTelefono mittente={num.etichetta} testo={testo}/>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 12 }}>Il conto</div>
            {[
              ['Destinatari', fmtNum(dest)],
              ['Segmenti a testa', String(seg)],
              ['Prezzo al segmento', '€ 0,07'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13.2 }}>
                <span style={{ color: ADM.MUTED }}>{k}</span><span style={{ fontWeight: 600, color: ADM.TEXT }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 11, marginTop: 6, borderTop: `1px solid ${ADM.BORDER}` }}>
              <span style={{ fontSize: 13.6, fontWeight: 700, color: ADM.TEXT }}>Totale stimato</span>
              <span style={{ fontSize: 19, fontWeight: 800, color: ADM.PINK_DARK, letterSpacing: '-0.02em' }}>{fmtEur(costo)}</span>
            </div>
          </AdmCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PUSH
// ═══════════════════════════════════════════════════════════════════════════

function HubPushPage() {
  const [cerca, setCerca] = useStateMk('');
  const [aperta, setAperta] = useStateMk(null);
  const [nuovo, setNuovo] = useStateMk(false);
  if (nuovo) return <HubPushComposer onChiudi={() => setNuovo(false)}/>;
  if (aperta) return <HubPushDettaglio push={aperta} onChiudi={() => setAperta(null)}/>;

  const lista = HUB_PUSH.filter(p => !cerca || (p.nome + p.titolo + p.corpo).toLowerCase().includes(cerca.toLowerCase()));
  const ricevute = HUB_PUSH.reduce((s, p) => s + p.ricevute, 0);
  const aperte = HUB_PUSH.reduce((s, p) => s + p.aperte, 0);

  const colonne = [
    { id: 'nome',    label: 'Notifica',   w: 'minmax(0,2.6fr)' },
    { id: 'dove',    label: 'Dove',       w: '1.1fr' },
    { id: 'stato',   label: 'Stato',      w: '1fr' },
    { id: 'dest',    label: 'Inviate',    w: '0.9fr', destra: true },
    { id: 'aperte',  label: 'Aperture',   w: '0.9fr', destra: true },
    { id: 'quando',  label: 'Quando',     w: '1.15fr' },
  ];
  const cella = (id, p) => {
    if (id === 'nome') return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.3, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</div>
        <div style={{ fontSize: 12.5, color: ADM.MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titolo || '(senza titolo)'}</div>
      </div>
    );
    if (id === 'dove') return <HubPillola color={p.dove === 'app' ? 'PURPLE' : 'TEAL'}>{p.dove === 'app' ? 'App byup' : 'Gestionale'}</HubPillola>;
    if (id === 'stato') return <HubStato stato={p.stato} mappa={HUB_STATI_INVIO}/>;
    if (id === 'dest') return <span style={{ fontSize: 13.6, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{p.dest ? fmtNum(p.dest) : '—'}</span>;
    if (id === 'aperte') return p.ricevute
      ? <span style={{ fontSize: 13.6, fontWeight: 700, color: ADM.OK, fontVariantNumeric: 'tabular-nums' }}>{mkPc(p.aperte, p.ricevute)}</span>
      : <span style={{ color: ADM.MUTED_LIGHT }}>—</span>;
    return <span style={{ fontSize: 13.2, color: ADM.MUTED }}>{p.inviata ? fmtDateTime(p.inviata) : p.trigger ? 'A ogni innesco' : '—'}</span>;
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="Push"
        sotto="Due destinazioni diverse: l'app dei clienti finali e il gestionale dei ristoratori. Stesso strumento, tono opposto."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo(true)}>Crea notifica</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Notifiche recapitate" valore={fmtNum(ricevute)} icona="bell"/>
        <HubTile etichetta="Tasso di apertura" valore={mkPc(aperte, ricevute)} tono="OK" icona="eye" sotto={`${fmtNum(aperte)} toccate`}/>
        <HubTile etichetta="Nell'app" valore={HUB_PUSH.filter(p => p.dove === 'app').length} icona="smartphone" tono="PURPLE"/>
        <HubTile etichetta="Nel gestionale" valore={HUB_PUSH.filter(p => p.dove === 'gestionale').length} icona="monitor" tono="TEAL"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${ADM.BORDER}` }}>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca fra le notifiche…" larghezza={260}/>
        </div>
        <HubTabella colonne={colonne} righe={lista} chiave={p => p.id} cella={cella} onRiga={setAperta}
          vuoto={<HubVuoto icona="bell" titolo="Nessuna notifica" desc="Creane una e guardala nell'anteprima prima di mandarla."/>}/>
      </AdmCard>
    </div>
  );
}

// Lo schermo bloccato con la notifica dentro: serve al composer mentre si
// scrive e al dettaglio per rivedere com'era arrivata — è la stessa scena.
function MktPushSchermo({ dove, titolo, corpo }) {
  return (
    <div style={{
      background: dove === 'app'
        ? 'linear-gradient(160deg, #2A1B3D 0%, #44107A 60%, #7A1E8C 100%)'
        : 'linear-gradient(160deg, #1D2430 0%, #2B3646 100%)',
      borderRadius: 20, padding: '38px 14px 20px', minHeight: 240,
    }}>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>
        <div style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em' }}>09:41</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>venerdì 14 agosto</div>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(14px)',
        borderRadius: 15, padding: '11px 12px', boxShadow: '0 8px 22px -8px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <img src="hubble-mark.png" alt="" style={{ width: 15, height: 'auto', borderRadius: 3 }}/>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#3A3D45', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {dove === 'app' ? 'byup' : 'byup gestionale'}
          </span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 10.5, color: '#8A8A90' }}>ora</span>
        </div>
        <div style={{ fontSize: 13.4, fontWeight: 700, color: '#16181D', lineHeight: 1.3 }}>
          {titolo || <span style={{ color: '#A0A0A6', fontWeight: 500 }}>Titolo della notifica</span>}
        </div>
        <div style={{ fontSize: 12.8, color: '#3A3D45', marginTop: 2, lineHeight: 1.4 }}>
          {corpo || <span style={{ color: '#A0A0A6' }}>Il corpo del messaggio, due righe al massimo.</span>}
        </div>
      </div>
    </div>
  );
}

// Il dettaglio di una notifica: i numeri del recapito e la stessa scena
// dello schermo bloccato del composer — si rivede quello che è arrivato.
function HubPushDettaglio({ push, onChiudi }) {
  const inviata = push.ricevute > 0;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Push</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{push.nome}</span>
      </div>

      <HubTestata titolo={push.nome}
        sotto={push.dove === 'app' ? 'Arriva sull\'app dei clienti finali.' : 'Arriva sul gestionale dei ristoratori.'}
        azioni={<HubPillola color={HUB_STATI_INVIO[push.stato].color}>{HUB_STATI_INVIO[push.stato].label}</HubPillola>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {inviata ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
              <MktStat label="Recapitate" valore={push.ricevute} base={push.dest} color="INFO"
                sotto={`${fmtNum(push.dest - push.ricevute)} dispositivi irraggiungibili su ${fmtNum(push.dest)}`}/>
              <MktStat label="Aperte" valore={push.aperte} base={push.ricevute} color="OK"
                sotto="Chi l'ha toccata, sul recapitato"/>
            </div>
          ) : (
            <HubVuoto icona="clock" titolo="Non è ancora partita"
              desc="È una bozza: scrivi titolo e corpo e mandala per vedere i numeri."/>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <MktPushSchermo dove={push.dove} titolo={push.titolo} corpo={push.corpo}/>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>La scheda</div>
            {[
              ['Dove', push.dove === 'app' ? 'App byup' : 'Gestionale'],
              ['Stato', HUB_STATI_INVIO[push.stato].label],
              [push.trigger ? 'Innesco' : 'Pubblico', push.trigger || (push.pubblico ? mkPubblicoLabel(push.pubblico) : 'Tutta la base installata')],
              ['Titolo', push.titolo || '—'],
              ['Quando', push.inviata ? fmtDateTime(push.inviata) : push.trigger ? 'A ogni innesco' : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
                <span style={{ fontSize: 12.6, color: ADM.MUTED, width: 92, flexShrink: 0, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13.2, color: ADM.TEXT, flex: 1, minWidth: 0, lineHeight: 1.45 }}>{v}</span>
              </div>
            ))}
          </AdmCard>
        </div>
      </div>
    </div>
  );
}

function HubPushComposer({ onChiudi }) {
  const [nome, setNome] = useStateMk('');
  const [dove, setDove] = useStateMk('app');
  const [titolo, setTitolo] = useStateMk('');
  const [corpo, setCorpo] = useStateMk('');
  const [elencoId, setElencoId] = useStateMk(null);
  const [filtri, setFiltri] = useStateMk([]);
  const [prova, setProva] = useStateMk(false);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Push</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{nome || 'Nuova notifica'}</span>
      </div>
      <HubTestata titolo="Crea una notifica push"
        sotto="Titolo corto, corpo che sta in due righe. Sul telefono si legge solo quello."
        azioni={
          <React.Fragment>
            {/* Prova finta, esito vero: il bottone conferma e poi torna
                com'era — stesso patto del «Mandami una prova» delle mail. */}
            <HubStrumento icona={prova ? 'check' : 'send'} acceso={prova}
              onClick={() => { if (!prova) { setProva(true); setTimeout(() => setProva(false), 2600); } }}>
              {prova ? 'Inviata sul tuo telefono' : 'Prova su di me'}
            </HubStrumento>
            <HubStrumento forte icona="send" onClick={onChiudi}>Invia</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <HubCampo label="Nome"><HubInput valore={nome} onCambia={setNome} placeholder="es. Beta prenotazioni"/></HubCampo>
            <div style={{ marginTop: 14 }}>
              <HubCampo label="Dove arriva">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { id: 'app', l: 'App byup', d: 'I clienti finali. Tono da consumatore.', i: 'smartphone' },
                    { id: 'gestionale', l: 'Gestionale', d: 'Titolari e staff. Tono operativo.', i: 'monitor' },
                  ].map(o => {
                    const on = dove === o.id;
                    const Ic = BuIcons[o.i];
                    return (
                      <button key={o.id} onClick={() => setDove(o.id)} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', padding: 13, borderRadius: 11,
                        cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK_BG_SOFT : '#fff',
                      }}>
                        <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center', background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK : ADM.MUTED }}><Ic size={15}/></span>
                        <span style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: 13.8, fontWeight: 700, color: on ? ADM.PINK_DARK : ADM.TEXT }}>{o.l}</span>
                          <span style={{ display: 'block', fontSize: 12.3, color: ADM.MUTED, marginTop: 2 }}>{o.d}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </HubCampo>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <HubCampo label="Titolo" nota={`${titolo.length}/40 caratteri — oltre viene tagliato`}>
                <HubInput valore={titolo} onCambia={setTitolo} placeholder="es. Sei tra i primi"/>
              </HubCampo>
              <HubCampo label="Corpo" nota={`${corpo.length}/120 caratteri`}>
                <HubArea valore={corpo} onCambia={setCorpo} righe={3}
                  placeholder="es. Le prenotazioni intelligenti sono in prova sul tuo account."/>
              </HubCampo>
            </div>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>A chi</div>
            <MktPubblico elencoId={elencoId} onElenco={setElencoId} filtri={filtri} onFiltri={setFiltri}/>
            <div style={{ marginTop: 12, fontSize: 12.6, color: '#7A4A0B', background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', borderRadius: 10, padding: '9px 12px', lineHeight: 1.5 }}>
              Chi ha il consenso push spento non riceve questa notifica, anche se è dentro il pubblico. È la regola, non un'opzione.
            </div>
          </AdmCard>
        </div>

        <AdmCard padding={18}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 14 }}>Anteprima</div>
          <MktPushSchermo dove={dove} titolo={titolo} corpo={corpo}/>
          <div style={{ fontSize: 12.3, color: ADM.MUTED, marginTop: 12, lineHeight: 1.5 }}>
            Sul telefono bloccato si vedono due righe di corpo. Quello che scrivi dopo esiste solo per chi apre la notifica.
          </div>
        </AdmCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FORM
// ═══════════════════════════════════════════════════════════════════════════

// Due famiglie e non una lista sola: c'è quello che CHIEDE qualcosa a chi
// compila, e quello che gli DICE qualcosa. Un'immagine e un paragrafo non
// sono campi — non producono un valore — ma stanno nello stesso modulo, e
// tenerli fuori vuol dire farli aggiungere «dal sito» a qualcun altro.
const FRM_CAMPI = {
  testo:    { label: 'Testo breve',   icona: 'type' },
  email:    { label: 'Email',         icona: 'mail' },
  telefono: { label: 'Telefono',      icona: 'phone' },
  area:     { label: 'Testo lungo',   icona: 'list' },
  scelta:   { label: 'Menu a tendina',icona: 'chevronDown' },
  spunta:   { label: 'Spunta',        icona: 'check' },
  consenso: { label: 'Consenso',      icona: 'shield' },
  paragrafo:{ label: 'Paragrafo',     icona: 'pencil',  decorativo: true },
  immagine: { label: 'Immagine o GIF',icona: 'image',   decorativo: true },
  separa:   { label: 'Separatore',    icona: 'sliders', decorativo: true },
};

function HubFormPage() {
  const [cerca, setCerca] = useStateMk('');
  const [aperto, setAperto] = useStateMk(null);
  const [nuovo, setNuovo] = useStateMk(false);
  if (nuovo) return <HubFormEditor onChiudi={() => setNuovo(false)}/>;
  if (aperto) return <HubFormDettaglio form={aperto} onChiudi={() => setAperto(null)}/>;

  const lista = HUB_FORM.filter(f => !cerca || f.nome.toLowerCase().includes(cerca.toLowerCase()));
  const sub = HUB_FORM.reduce((s, f) => s + f.submission, 0);
  const viste = HUB_FORM.reduce((s, f) => s + f.viste, 0);

  const colonne = [
    { id: 'nome',   label: 'Form',        w: 'minmax(0,2.4fr)' },
    { id: 'stato',  label: 'Stato',       w: '1fr' },
    { id: 'campi',  label: 'Campi',       w: '0.7fr', destra: true },
    { id: 'viste',  label: 'Viste',       w: '0.9fr', destra: true },
    { id: 'sub',    label: 'Invii',       w: '0.9fr', destra: true },
    { id: 'tasso',  label: 'Conversione', w: '1.05fr', destra: true },
    { id: 'auto',   label: 'Automazione', w: '1.5fr', ordinabile: false },
  ];
  const cella = (id, f) => {
    if (id === 'nome') return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.3, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.nome}</div>
        <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 2 }}>{f.pagina}</div>
      </div>
    );
    if (id === 'stato') return <HubPillola color={f.stato === 'pubblicato' ? 'OK' : 'PLAN_FREE'}>{f.stato === 'pubblicato' ? 'Pubblicato' : 'Bozza'}</HubPillola>;
    if (id === 'campi') return <span style={{ fontSize: 13.6, fontWeight: 600 }}>{f.campi}</span>;
    if (id === 'viste') return <span style={{ fontSize: 13.6, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(f.viste)}</span>;
    if (id === 'sub') return <span style={{ fontSize: 13.6, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(f.submission)}</span>;
    if (id === 'tasso') return f.viste
      ? <span style={{ fontSize: 13.6, fontWeight: 700, color: f.tasso >= 10 ? ADM.OK : ADM.TEXT }}>{String(f.tasso).replace('.', ',')}%</span>
      : <span style={{ color: ADM.MUTED_LIGHT }}>—</span>;
    const a = f.automazione;
    const pezzi = [a.mail && 'email di conferma', a.redirect && 'redirect', a.proprieta && 'scrive ' + (HUB_PROP[a.proprieta] || {}).label].filter(Boolean);
    return pezzi.length
      ? <span style={{ fontSize: 12.8, color: ADM.MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{pezzi.join(' · ')}</span>
      : <span style={{ fontSize: 13.2, color: ADM.MUTED_LIGHT }}>Nessuna</span>;
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="Form"
        sotto="Moduli da mettere sul sito. Ogni submission crea o aggiorna un contatto, e può far partire una mail, un redirect o un workflow."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo(true)}>Crea form</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Invii raccolti" valore={fmtNum(sub)} icona="formFill" sotto="Su tutti i form pubblicati"/>
        <HubTile etichetta="Conversione media" valore={mkPc(sub, viste)} tono="OK" icona="target" sotto={`${fmtNum(viste)} visualizzazioni`}/>
        <HubTile etichetta="Form pubblicati" valore={HUB_FORM.filter(f => f.stato === 'pubblicato').length} icona="globe"/>
        {/* Stesso criterio della colonna Automazione qui sotto: anche
            scrivere una proprietà È un'automazione, non solo mail e
            redirect — sennò il tile smentisce la tabella. */}
        <HubTile etichetta="Con automazione" valore={HUB_FORM.filter(f => f.automazione.mail || f.automazione.redirect || f.automazione.proprieta).length}
          icona="bolt" tono="HUB_VIOLA" sotto="Gli altri raccolgono e basta"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${ADM.BORDER}` }}>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca fra i form…" larghezza={260}/>
        </div>
        <HubTabella colonne={colonne} righe={lista} chiave={f => f.id} cella={cella} onRiga={setAperto}
          vuoto={<HubVuoto icona="formFill" titolo="Nessun form" desc="Creane uno: campi, grafica e automazione stanno nella stessa schermata."/>}/>
      </AdmCard>
    </div>
  );
}

// Il dettaglio di un form: il funnel viste → invii e che cosa scatta dopo
// l'invio. I campi si toccano nell'editor; qui si giudicano i numeri — è
// la promessa della pagina: aprire un pezzo per vederne i numeri.
function HubFormDettaglio({ form, onChiudi }) {
  const pubblicato = form.stato === 'pubblicato';
  const a = form.automazione;
  const pezzi = [
    a.mail && ('Email di conferma · ' + ((HUB_MAIL.find(m => m.id === a.mail) || {}).nome || a.mail)),
    a.redirect && ('Redirect a ' + a.redirect),
    a.proprieta && ('Scrive la proprietà ' + ((HUB_PROP[a.proprieta] || {}).label || a.proprieta)),
  ].filter(Boolean);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Form</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{form.nome}</span>
      </div>

      <HubTestata titolo={form.nome}
        sotto={pubblicato ? `Vive su ${form.pagina}, con ${form.campi} campi.` : 'È una bozza: non è ancora su nessuna pagina.'}
        azioni={<HubPillola color={pubblicato ? 'OK' : 'PLAN_FREE'}>{pubblicato ? 'Pubblicato' : 'Bozza'}</HubPillola>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {form.viste > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
              <HubTile etichetta="Viste" valore={fmtNum(form.viste)} icona="eye" sotto="Da quando è pubblicato"/>
              <MktStat label="Invii" valore={form.submission} base={form.viste} color="OK" sotto="Chi ha visto il form e l'ha compilato"/>
              <HubTile etichetta="Conversione" valore={String(form.tasso).replace('.', ',') + '%'} icona="target"
                tono={form.tasso >= 10 ? 'OK' : undefined}
                sotto={form.tasso >= 10 ? 'Sopra il 10%: funziona' : 'Sotto il 10%: prova con meno campi'}/>
            </div>
          ) : (
            <HubVuoto icona="clock" titolo="Ancora nessun numero"
              desc="È una bozza: pubblicalo per vedere viste, invii e conversione."/>
          )}

          <AdmCard padding={18}>
            <HubSezione titolo="Che cosa succede dopo l'invio">
              {pezzi.length ? pezzi.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', fontSize: 13.4, color: ADM.TEXT }}>
                  <BuIcons.bolt size={14} color={ADM.HUB_VIOLA}/>{p}
                </div>
              )) : (
                <div style={{ fontSize: 13.4, color: ADM.MUTED, lineHeight: 1.55 }}>
                  Nessuna automazione: le submission creano o aggiornano il contatto, e basta.
                </div>
              )}
            </HubSezione>
          </AdmCard>
        </div>

        <AdmCard padding={18}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 13 }}>La scheda</div>
          {[
            ['Stato', pubblicato ? 'Pubblicato' : 'Bozza'],
            ['Pagina', form.pagina],
            ['Campi', String(form.campi)],
            ['Automazione', pezzi.length ? `${pezzi.length} ${pezzi.length === 1 ? 'passo' : 'passi'}` : 'Nessuna'],
            ['Creato', fmtDate(form.creato)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
              <span style={{ fontSize: 12.6, color: ADM.MUTED, width: 92, flexShrink: 0, fontWeight: 600 }}>{k}</span>
              <span style={{ fontSize: 13.2, color: ADM.TEXT, flex: 1, minWidth: 0, lineHeight: 1.45 }}>{v}</span>
            </div>
          ))}
        </AdmCard>
      </div>
    </div>
  );
}

function HubFormEditor({ onChiudi }) {
  const [nome, setNome] = useStateMk('');
  const [campi, setCampi] = useStateMk([
    { id: 'c1', tipo: 'testo', label: 'Nome del locale', obbligatorio: true },
    { id: 'c2', tipo: 'email', label: 'Email', obbligatorio: true },
    { id: 'c3', tipo: 'scelta', label: 'Come ci hai conosciuto', obbligatorio: false, opzioni: 'Passaparola\nGoogle\nFiera\nSocial', mappa: 'referral' },
    { id: 'c4', tipo: 'consenso', label: 'Acconsento a ricevere comunicazioni da byup', obbligatorio: true, mappa: 'consensoMail' },
  ]);
  const [sel, setSel] = useStateMk(null);
  const [testa, setTesta] = useStateMk({
    titolo: 'Richiedi una <span style="color: #FF1F5A">demo</span>',
    sotto: 'Compila e ti ricontattiamo entro <b>un giorno lavorativo</b>.',
  });
  const [stile, setStile] = useStateMk({
    accento: '#FF1F5A', raggio: 10, sfondo: '#FFFFFF', bottone: 'Invia la richiesta',
    fondo: mbFondoVuoto(),                                              // il modulo
    pagina: { tipo: 'tinta', colore: '#FAFAFB', da: '#FF1F5A', a: '#D410F1', angolo: 135 }, // la pagina attorno
    bottoneFondo: { tipo: 'gradiente', colore: '#FF1F5A', da: '#FF1F5A', a: '#D410F1', angolo: 90 },
  });
  const [auto, setAuto] = useStateMk({ mail: 'ML-010', redirect: 'byup.it/grazie', messaggio: 'Grazie! Ti ricontattiamo entro un giorno lavorativo.', esito: 'messaggio' });
  const [tab, setTab] = useStateMk('campi');
  const [codice, setCodice] = useStateMk(false);

  // Lo snippet da incollare nel sito: il form si aggancia per slug, come le
  // pagine su hubble.byup.it. Il tag script è spezzato in due pezzi per non
  // chiudere lo <script> che ci ospita se questo file venisse mai inlinato.
  const slug = (nome || 'nuovo-form').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nuovo-form';
  const snippet = '<!-- Incolla dove vuoi che compaia il form -->\n'
    + '<div data-hubble-form="' + slug + '"></div>\n'
    + '<script src="https://hubble.byup.it/embed.js" async></' + 'script>';

  const campo = campi.find(c => c.id === sel) || null;
  const setCampo = (k, v) => setCampi(cs => cs.map(c => c.id === sel ? Object.assign({}, c, { [k]: v }) : c));
  const setCampoId = (id, k, v) => setCampi(cs => cs.map(c => c.id === id ? Object.assign({}, c, { [k]: v }) : c));
  const aggiungi = (tipo) => {
    const n = { id: 'c' + Date.now(), tipo, label: FRM_CAMPI[tipo].label, obbligatorio: false };
    if (tipo === 'paragrafo') n.html = 'Scrivi qui. Serve a spiegare <b>perché</b> vale la pena compilare — non a riempire spazio.';
    if (tipo === 'immagine') { n.src = ''; n.raggio = 10; }
    setCampi(cs => [...cs, n]); setSel(n.id); setTab('campi');
  };
  const muovi = (i, d) => {
    const j = i + d; if (j < 0 || j >= campi.length) return;
    const cs = campi.slice(); [cs[i], cs[j]] = [cs[j], cs[i]]; setCampi(cs);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Form</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{nome || 'Nuovo form'}</span>
      </div>
      <HubTestata titolo="Crea un form"
        sotto="I campi a sinistra, l'aspetto reale al centro, e sotto quello che succede dopo l'invio."
        azioni={
          <React.Fragment>
            {/* Stesso gesto del «Codice HTML» del builder mail: il codice
                prende il posto dell'anteprima finché il bottone è acceso. */}
            <HubStrumento icona="code" acceso={codice} onClick={() => setCodice(c => !c)}>Codice da incorporare</HubStrumento>
            <HubStrumento forte icona="check" onClick={onChiudi}>Pubblica</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: '272px minmax(0,1fr) 300px', gap: 14, alignItems: 'start' }}>
        {/* Campi e struttura */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={16}>
            <HubCampo label="Nome del form"><HubInput valore={nome} onCambia={setNome} placeholder="es. Richiedi una demo"/></HubCampo>
          </AdmCard>
          <AdmCard padding={16}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 10 }}>I campi</div>
            {campi.map((c, i) => {
              const on = sel === c.id;
              const Ic = BuIcons[FRM_CAMPI[c.tipo].icona];
              return (
                <div key={c.id} onClick={() => setSel(c.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', marginBottom: 5, borderRadius: 9,
                  cursor: 'pointer', border: `1px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK_BG_SOFT : '#fff',
                }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, display: 'grid', placeItems: 'center', background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK : ADM.MUTED, flexShrink: 0 }}><Ic size={13}/></span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                  <button onClick={e => { e.stopPropagation(); muovi(i, -1); }} title="Su" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: ADM.MUTED_LIGHT, padding: 1 }}><BuIcons.chevronUp size={13}/></button>
                  <button onClick={e => { e.stopPropagation(); muovi(i, 1); }} title="Giù" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: ADM.MUTED_LIGHT, padding: 1 }}><BuIcons.chevronDown size={13}/></button>
                  <button onClick={e => { e.stopPropagation(); setCampi(cs => cs.filter(x => x.id !== c.id)); }} title="Elimina" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: ADM.MUTED_LIGHT, padding: 1 }}><BuIcons.x size={13}/></button>
                </div>
              );
            })}
            <div style={{ borderTop: `1px solid ${ADM.BORDER_SOFT}`, marginTop: 10, paddingTop: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>Aggiungi</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {Object.keys(FRM_CAMPI).map(t => (
                  <button key={t} onClick={() => aggiungi(t)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 999,
                    border: `1px solid ${ADM.BORDER}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12.2, fontWeight: 600, color: ADM.TEXT,
                  }}>
                    <BuIcons.plus size={11} color={ADM.MUTED}/>{FRM_CAMPI[t].label}
                  </button>
                ))}
              </div>
            </div>
          </AdmCard>
        </div>

        {/* Anteprima + automazione */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${ADM.BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <HubSegmenti attivo={tab} onCambia={setTab} voci={[
                { id: 'campi', label: 'Anteprima' }, { id: 'stile', label: 'Aspetto' },
              ]}/>
            </div>
            <div style={{ background: mbFondoCss(stile.pagina) || ADM.PANEL_SOFT, padding: 26 }}>
              {codice ? (
              <pre style={{
                margin: 0, padding: 16, background: '#0F1115', color: '#D5D8DE', borderRadius: 12,
                fontSize: 11.4, lineHeight: 1.6, overflow: 'auto', fontFamily: 'ui-monospace, monospace',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{snippet}</pre>
              ) : (
              <div style={{
                maxWidth: 440, margin: '0 auto', background: mbFondoCss(stile.fondo) || stile.sfondo, borderRadius: 16, padding: 26,
                boxShadow: '0 14px 34px -16px rgba(15,17,21,0.26)', border: `1px solid ${ADM.BORDER}`,
              }}>
                {/* Titolo e sottotitolo si scrivono qui dentro, con la stessa
                    barra di formattazione della mail: una parola colorata nel
                    titolo di un form fa lo stesso lavoro che fa in una mail. */}
                <MbRicco chiave="frm-titolo" valore={testa.titolo} onFuoco={() => { setSel('__testa'); setTab('campi'); }}
                  onCambia={v => setTesta(t => ({ ...t, titolo: v }))}
                  stile={{ fontSize: 19, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.02em', marginBottom: 4 }}/>
                <MbRicco chiave="frm-sotto" valore={testa.sotto} onFuoco={() => { setSel('__testa'); setTab('campi'); }}
                  onCambia={v => setTesta(t => ({ ...t, sotto: v }))}
                  stile={{ fontSize: 13.4, color: ADM.MUTED, marginBottom: 18, lineHeight: 1.5 }}/>
                {campi.map(c => (
                  <div key={c.id} onClick={() => setSel(c.id)} style={{
                    marginBottom: 13, padding: sel === c.id ? 8 : 0, margin: sel === c.id ? '-8px -8px 5px' : undefined,
                    borderRadius: 9, background: sel === c.id ? ADM.PINK_BG_SOFT : 'transparent', cursor: 'pointer',
                  }}>
                    {c.tipo === 'paragrafo' ? (
                      <MbRicco chiave={'frm-' + c.id} valore={c.html} onFuoco={() => setSel(c.id)}
                        onCambia={v => setCampoId(c.id, 'html', v)}
                        stile={{ fontSize: 13.4, color: ADM.MUTED, lineHeight: 1.55 }}/>
                    ) : c.tipo === 'immagine' ? (
                      c.src
                        ? <img src={c.src} alt="" style={{ width: '100%', display: 'block', borderRadius: c.raggio || 10 }}/>
                        : <div style={{ background: ADM.NEUTRAL_SOFT, borderRadius: 10, padding: '30px 0', textAlign: 'center', fontSize: 12.4, color: ADM.MUTED_SOFT }}>Nessuna immagine — caricala a destra</div>
                    ) : c.tipo === 'separa' ? (
                      <div style={{ borderTop: `1px solid ${ADM.BORDER}`, margin: '4px 0' }}/>
                    ) : c.tipo === 'consenso' || c.tipo === 'spunta' ? (
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: ADM.TEXT, lineHeight: 1.45 }}>
                        <span style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${ADM.BORDER}`, flexShrink: 0, marginTop: 1 }}/>
                        <span>{c.label}{c.obbligatorio && <span style={{ color: stile.accento }}> *</span>}</span>
                      </label>
                    ) : (
                      <React.Fragment>
                        <label style={{ display: 'block', fontSize: 12.6, fontWeight: 700, color: ADM.TEXT, marginBottom: 6 }}>
                          {c.label}{c.obbligatorio && <span style={{ color: stile.accento }}> *</span>}
                        </label>
                        {c.tipo === 'area'
                          ? <div style={{ minHeight: 74, border: `1px solid ${ADM.BORDER}`, borderRadius: stile.raggio, background: '#fff', padding: '10px 12px', fontSize: 13.4, color: ADM.MUTED_LIGHT }}>{c.segnaposto || ''}</div>
                          : c.tipo === 'scelta'
                          ? <div style={{ height: 40, border: `1px solid ${ADM.BORDER}`, borderRadius: stile.raggio, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', fontSize: 13.4, color: ADM.MUTED_SOFT }}>
                              <span>{c.segnaposto || 'Scegli…'}</span><BuIcons.chevronDown size={15} color={ADM.MUTED}/>
                            </div>
                          : <div style={{ height: 40, border: `1px solid ${ADM.BORDER}`, borderRadius: stile.raggio, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13.4, color: ADM.MUTED_LIGHT }}>{c.segnaposto || ''}</div>}
                      </React.Fragment>
                    )}
                  </div>
                ))}
                <button style={{
                  width: '100%', marginTop: 6, padding: '12px 18px', border: 'none', borderRadius: stile.raggio,
                  background: mbFondoCss(stile.bottoneFondo) || stile.accento,
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>{stile.bottone}</button>
              </div>
              )}
            </div>
          </AdmCard>

          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 4 }}>Che cosa succede dopo l'invio</div>
            <div style={{ fontSize: 13.2, color: ADM.MUTED, marginBottom: 14, lineHeight: 1.5 }}>
              È il workflow semplice del form: si crea insieme al form e lo trovi anche in Workflow, dove puoi complicarlo quanto vuoi.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <HubCampo label="Email di conferma" nota="Parte subito, al contatto che ha compilato.">
                <AdmSelect block value={auto.mail || ''} onChange={v => setAuto(a => ({ ...a, mail: v || null }))}
                  options={[{ value: '', label: 'Nessuna email' }, ...HUB_MAIL.filter(m => m.tipo === 'automatica').map(m => ({ value: m.id, label: m.nome }))]}/>
              </HubCampo>
              <HubCampo label="Dopo l'invio">
                <AdmSelect block value={auto.esito} onChange={v => setAuto(a => ({ ...a, esito: v }))} options={[
                  { value: 'messaggio', label: 'Mostra un messaggio di ringraziamento' },
                  { value: 'redirect', label: 'Manda a un altro indirizzo' },
                ]}/>
              </HubCampo>
              {auto.esito === 'redirect'
                ? <HubCampo label="Indirizzo di destinazione"><HubInput valore={auto.redirect} onCambia={v => setAuto(a => ({ ...a, redirect: v }))} placeholder="https://byup.it/grazie"/></HubCampo>
                : <HubCampo label="Messaggio"><HubInput valore={auto.messaggio} onCambia={v => setAuto(a => ({ ...a, messaggio: v }))}/></HubCampo>}
              <HubCampo label="Aggiungi a un elenco">
                <AdmSelect block value={auto.elenco || ''} onChange={v => setAuto(a => ({ ...a, elenco: v || null }))}
                  options={[{ value: '', label: 'Nessuno' }, ...HUB_ELENCHI.filter(e => e.tipo === 'statico').map(e => ({ value: e.id, label: e.nome }))]}/>
              </HubCampo>
            </div>
          </AdmCard>
        </div>

        {/* Ispettore del campo / dello stile */}
        <AdmCard padding={16}>
          {tab === 'stile' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Aspetto</div>
              <MbFondo titolo="Fondo del modulo" valore={stile.fondo} onCambia={v => setStile(s => ({ ...s, fondo: v }))}/>
              {(!stile.fondo || stile.fondo.tipo === 'nessuno') &&
                <MbColore label="…o una tinta semplice" valore={stile.sfondo} onCambia={v => setStile(s => ({ ...s, sfondo: v }))}/>}
              <MbFondo titolo="Fondo della pagina attorno" valore={stile.pagina} onCambia={v => setStile(s => ({ ...s, pagina: v }))}/>
              <MbFondo titolo="Fondo del pulsante" valore={stile.bottoneFondo} onCambia={v => setStile(s => ({ ...s, bottoneFondo: v }))}/>
              <MbColore label="Colore d'accento" valore={stile.accento} onCambia={v => setStile(s => ({ ...s, accento: v }))}/>
              <MbCursore label="Angoli" valore={stile.raggio} onCambia={v => setStile(s => ({ ...s, raggio: v }))} min={0} max={22}/>
              <HubCampo label="Testo del pulsante"><HubInput valore={stile.bottone} onCambia={v => setStile(s => ({ ...s, bottone: v }))}/></HubCampo>
            </div>
          ) : sel === '__testa' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Titolo e introduzione</div>
              <MbBarraTesto/>
              <div style={{ fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5 }}>
                Si scrivono direttamente nell'anteprima. Vale la stessa barra della mail: grassetto, corsivo, colore su una parola sola, link, simboli e campi dinamici.
              </div>
            </div>
          ) : campo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>
                {FRM_CAMPI[campo.tipo].decorativo ? 'Il blocco' : 'Il campo'}
              </div>
              <HubCampo label="Tipo">
                <AdmSelect block value={campo.tipo} onChange={v => setCampo('tipo', v)}
                  options={Object.keys(FRM_CAMPI).map(t => ({ value: t, label: FRM_CAMPI[t].label }))}/>
              </HubCampo>

              {campo.tipo === 'paragrafo' && (
                <React.Fragment>
                  <MbBarraTesto/>
                  <div style={{ fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5 }}>Il testo si scrive nell'anteprima.</div>
                </React.Fragment>
              )}
              {campo.tipo === 'immagine' && (
                <React.Fragment>
                  <MbCarica valore={campo.src} onCambia={v => setCampo('src', v)}/>
                  <MbCursore label="Angoli" valore={campo.raggio || 10} onCambia={v => setCampo('raggio', v)} min={0} max={24}/>
                </React.Fragment>
              )}

              {!FRM_CAMPI[campo.tipo].decorativo && (
                <React.Fragment>
                  <HubCampo label="Etichetta"><HubInput valore={campo.label} onCambia={v => setCampo('label', v)}/></HubCampo>
                  <HubCampo label="Segnaposto" nota="Il testo grigio dentro al campo. Non sostituisce l'etichetta: sparisce appena si scrive.">
                    <HubInput valore={campo.segnaposto || ''} onCambia={v => setCampo('segnaposto', v)} placeholder="es. mario@osteria.it"/>
                  </HubCampo>
                  {campo.tipo === 'scelta' && (
                    <HubCampo label="Voci" nota="Una per riga."><HubArea valore={campo.opzioni || ''} onCambia={v => setCampo('opzioni', v)} righe={4}/></HubCampo>
                  )}
                  <HubCampo label="Dove finisce il valore"
                    nota="La proprietà del contatto che questa risposta riempie. È così che «Come ci hai conosciuto» diventa il campo Referral su cui poi filtri.">
                    <AdmSelect block value={campo.mappa || ''} onChange={v => setCampo('mappa', v || null)}
                      options={[{ value: '', label: 'Non salvare' }, ...HUB_PROPRIETA.filter(p => !p.leggi).map(p => ({ value: p.id, label: p.label }))]}/>
                  </HubCampo>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                    <AdmSwitch size="sm" checked={campo.obbligatorio} onChange={v => setCampo('obbligatorio', v)}/>
                    <span style={{ fontSize: 13.4, fontWeight: 600, color: ADM.TEXT }}>Campo obbligatorio</span>
                  </label>
                </React.Fragment>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: ADM.MUTED, lineHeight: 1.55, padding: '10px 2px' }}>
              Clicca un campo — nell'elenco a sinistra o direttamente nell'anteprima — per modificarlo.
              Titolo, introduzione e paragrafi si scrivono direttamente dentro il modulo.
            </div>
          )}
        </AdmCard>
      </div>
    </div>
  );
}

window.HubMailPage = HubMailPage;
window.HubSmsPage = HubSmsPage;
window.HubPushPage = HubPushPage;
window.HubFormPage = HubFormPage;
window.MktPubblico = MktPubblico;
window.MktStat = MktStat;
window.MktPassi = MktPassi;
window.mkPc = mkPc;
window.mkPubblicoConta = mkPubblicoConta;

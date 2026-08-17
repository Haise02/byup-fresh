// Hubble · Elenchi — segmenti che si aggiornano da soli e liste fisse.
//
// Un elenco ATTIVO è una domanda: «i locali Plus e Business che lavorano».
// Chi risponde a quella domanda ci entra da solo, chi smette di rispondere ne
// esce da solo. Un elenco STATICO è una fotografia: i contatti che ci sono
// dentro ci restano finché non li si toglie a mano.
//
// La differenza non è un dettaglio tecnico: è quello che succede la settimana
// dopo. Un elenco attivo usato come pubblico di una campagna ricorrente è
// sempre giusto; una lista statica invecchia dal giorno in cui la si importa.
// Per questo la distinzione è la prima cosa che si vede in lista, e la prima
// domanda che si fa quando se ne crea uno.

const { useState: useStateEl, useMemo: useMemoEl } = React;

const EL_TIPI = {
  attivo:  { label: 'Attivo',  color: 'OK',        icona: 'refresh',
             spiega: 'Si aggiorna da solo: chi risponde ai criteri entra, chi smette esce.' },
  statico: { label: 'Statico', color: 'PLAN_FREE', icona: 'bookmark',
             spiega: 'Una fotografia: i contatti restano quelli, finché non li cambi tu.' },
};

// Quanti contatti ci sono dentro adesso. Per gli attivi si calcola davvero
// applicando i criteri alla rubrica — è il senso di un elenco attivo, e un
// numero finto qui renderebbe la schermata una bugia.
function elMembri(el) {
  if (el.tipo === 'statico') return el.membriFissi || 0;
  return hubApplica(CONTATTI, el.includi, el.escludi).length;
}

function HubElenchiPage() {
  const [vista, setVista] = useStateEl('tutti');
  const [cerca, setCerca] = useStateEl('');
  const [cartella, setCartella] = useStateEl(null);
  const [aperto, setAperto] = useStateEl(null);   // elenco in dettaglio
  const [nuovo, setNuovo] = useStateEl(null);     // bozza in creazione
  const [sort, setSort] = useStateEl({ campo: 'aggiornato', verso: 'desc' });

  const conteggi = useMemoEl(() => {
    const m = {};
    HUB_ELENCHI.forEach(e => { m[e.id] = elMembri(e); });
    return m;
  }, []);

  const lista = useMemoEl(() => {
    let r = HUB_ELENCHI.slice();
    if (vista !== 'tutti') r = r.filter(e => e.tipo === vista);
    if (cartella) r = r.filter(e => e.cartella === cartella);
    const q = cerca.trim().toLowerCase();
    if (q) r = r.filter(e => (e.nome + ' ' + e.descrizione + ' ' + e.cartella).toLowerCase().includes(q));
    const segno = sort.verso === 'asc' ? 1 : -1;
    const val = (e) => sort.campo === 'membri' ? conteggi[e.id]
      : sort.campo === 'nome' ? e.nome
      : e[sort.campo];
    return r.sort((a, b) => {
      const va = val(a), vb = val(b);
      const c = typeof va === 'string' ? va.localeCompare(vb) : (new Date(va) - new Date(vb));
      return segno * c;
    });
  }, [vista, cerca, cartella, sort, conteggi]);

  // L'editor vince sul dettaglio: «Modifica criteri» lo monta sopra la scheda
  // aperta, e chiuderlo riporta lì, non alla lista.
  if (nuovo) return <HubElencoEditor bozza={nuovo} onChiudi={() => setNuovo(null)}/>;
  if (aperto) return <HubElencoDettaglio elenco={aperto} onChiudi={() => setAperto(null)} membri={conteggi[aperto.id]}
    onModifica={() => setNuovo(Object.assign({}, aperto))}/>;

  const ordina = (campo) => setSort(s => s.campo === campo
    ? { campo, verso: s.verso === 'asc' ? 'desc' : 'asc' }
    : { campo, verso: campo === 'nome' ? 'asc' : 'desc' });

  const colonne = [
    { id: 'nome',       label: 'Elenco',        w: 'minmax(0,2.6fr)' },
    { id: 'tipo',       label: 'Tipo',          w: '1fr' },
    { id: 'membri',     label: 'Contatti',      w: '0.9fr', destra: true },
    { id: 'usatoIn',    label: 'Usato in',      w: '1.5fr', ordinabile: false },
    { id: 'autore',     label: 'Creato da',     w: '1.1fr', ordinabile: false },
    { id: 'aggiornato', label: 'Aggiornato',    w: '1.15fr' },
  ];

  const cella = (id, e) => {
    if (id === 'nome') return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.4, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nome}</div>
        <div style={{ fontSize: 12.6, color: ADM.MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.descrizione}</div>
      </div>
    );
    if (id === 'tipo') {
      const t = EL_TIPI[e.tipo];
      const Ic = BuIcons[t.icona];
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Ic size={14} color={ADM[t.color]}/>
          <span style={{ fontSize: 13.4, fontWeight: 600, color: ADM.TEXT }}>{t.label}</span>
        </span>
      );
    }
    if (id === 'membri') return (
      <span style={{ fontSize: 14.4, fontWeight: 700, color: ADM.TEXT, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(conteggi[e.id])}</span>
    );
    if (id === 'usatoIn') {
      if (!e.usatoIn || !e.usatoIn.length) return <span style={{ fontSize: 13.4, color: ADM.MUTED_LIGHT }}>—</span>;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <HubPillola color="HUB_MAGENTA" size="sm">{e.usatoIn[0]}</HubPillola>
          {e.usatoIn.length > 1 && <span style={{ fontSize: 12.4, fontWeight: 700, color: ADM.MUTED_SOFT }}>+{e.usatoIn.length - 1}</span>}
        </div>
      );
    }
    if (id === 'autore') return <span style={{ fontSize: 13.4, color: ADM.TEXT }}>{e.autore}</span>;
    return <span style={{ fontSize: 13.4, color: ADM.MUTED }}>{fmtRelative(e.aggiornato)}</span>;
  };

  const attivi = HUB_ELENCHI.filter(e => e.tipo === 'attivo').length;
  const statici = HUB_ELENCHI.length - attivi;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata occhiello="CRM · Segmentazione" titolo="Elenchi"
        sotto="Gruppi di contatti da usare come pubblico di una campagna o come innesco di un workflow. Gli attivi si tengono aggiornati da soli."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuovo({
          nome: '', descrizione: '', tipo: 'attivo', cartella: 'Commerciale', includi: [], escludi: [],
        })}>Crea elenco</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Elenchi totali" valore={HUB_ELENCHI.length} icona="layers"
          sotto={`${attivi} attivi · ${statici} statici`}/>
        <HubTile etichetta="In almeno un elenco" valore={fmtNum(
          // Anche gli statici, con la stessa convenzione del dettaglio (i primi
          // membriFissi della rubrica): un membro visibile lì deve contare qui.
          new Set(HUB_ELENCHI.flatMap(e => e.tipo === 'attivo'
            ? hubApplica(CONTATTI, e.includi, e.escludi).map(c => c.key)
            : CONTATTI.slice(0, e.membriFissi || 0).map(c => c.key))).size
        )} icona="users3" sotto={`su ${fmtNum(CONTATTI.length)} in rubrica`}/>
        <HubTile etichetta="Usati davvero" valore={HUB_ELENCHI.filter(e => e.usatoIn && e.usatoIn.length).length}
          icona="megaphone" sotto="Gli altri esistono ma non lavorano" tono="HUB_MAGENTA"/>
        <HubTile etichetta="Ultimo aggiornamento" valore={fmtRelative(
          HUB_ELENCHI.map(e => e.aggiornato).sort((a, b) => b - a)[0]
        )} icona="refresh" sotto="Gli attivi si ricalcolano a ogni cambiamento"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}`, flexWrap: 'wrap' }}>
          <HubSegmenti attivo={vista} onCambia={setVista} voci={[
            { id: 'tutti', label: 'Tutti', conteggio: HUB_ELENCHI.length },
            { id: 'attivo', label: 'Attivi', conteggio: attivi },
            { id: 'statico', label: 'Statici', conteggio: statici },
          ]}/>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca un elenco…" larghezza={240}/>
          <div style={{ flex: 1 }}/>
          <AdmSelect value={cartella || ''} onChange={v => setCartella(v || null)}
            options={[{ value: '', label: 'Tutte le cartelle' }, ...HUB_CARTELLE.map(c => ({ value: c, label: c }))]}/>
        </div>
        <HubTabella colonne={colonne} righe={lista} chiave={e => e.id} cella={cella}
          sort={sort} onSort={ordina} onRiga={setAperto}
          vuoto={<HubVuoto icona="layers" titolo="Nessun elenco con questi criteri"
            desc="Cambia vista o cartella. Oppure creane uno nuovo: parte dai filtri della rubrica."/>}/>
      </AdmCard>
    </div>
  );
}

// ─── Il dettaglio di un elenco ──────────────────────────────────────────────
// I criteri in chiaro, l'anteprima dei membri che ci sono ADESSO, e dove
// questo elenco viene usato: prima di cambiare un criterio bisogna sapere
// quali campagne si stanno spostando sotto i piedi.
function HubElencoDettaglio({ elenco, onChiudi, membri, onModifica }) {
  const [tab, setTab] = useStateEl('membri');
  const [scegli, setScegli] = useStateEl(false);       // modale «Scegli la campagna»
  const [collegata, setCollegata] = useStateEl(null);  // il nome appena collegato, per il lampo di conferma
  const [usatoIn, setUsatoIn] = useStateEl(elenco.usatoIn || []);
  const t = EL_TIPI[elenco.tipo];
  const dentro = useMemoEl(() =>
    elenco.tipo === 'statico' ? CONTATTI.slice(0, elenco.membriFissi || 0) : hubApplica(CONTATTI, elenco.includi, elenco.escludi),
    [elenco]);

  // Il collegamento è finto ma coerente: la campagna scelta compare subito in
  // «Dove è usato», che è dove la si andrebbe a cercare domani.
  const collega = (m) => {
    setScegli(false);
    setUsatoIn(u => u.includes(m.nome) ? u : u.concat(m.nome));
    setTab('uso');
    setCollegata(m.nome);
    setTimeout(() => setCollegata(null), 2600);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>Elenchi</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{elenco.nome}</span>
      </div>

      <HubTestata occhiello={`${t.label} · ${elenco.cartella}`} titolo={elenco.nome} sotto={elenco.descrizione}
        azioni={
          <React.Fragment>
            <HubStrumento icona="megaphone" onClick={() => setScegli(true)}>Usa in una campagna</HubStrumento>
            <HubStrumento icona="pencil" forte onClick={onModifica}>Modifica criteri</HubStrumento>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Contatti dentro ora" valore={fmtNum(membri != null ? membri : dentro.length)} icona="users3"
          sotto={elenco.tipo === 'attivo' ? 'Ricalcolato a ogni apertura' : 'Fisso finché non lo cambi'}/>
        <HubTile etichetta="Tipo" valore={t.label} tono={t.color} icona={t.icona} sotto={t.spiega}/>
        <HubTile etichetta="Creato" valore={fmtDate(elenco.creato)} icona="calendar" sotto={`da ${elenco.autore}`}/>
        <HubTile etichetta="Ultimo aggiornamento" valore={fmtRelative(elenco.aggiornato)} icona="clock"
          sotto={elenco.origine || 'Automatico'}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
        <AdmCard padding={0}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${ADM.BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HubSegmenti attivo={tab} onCambia={setTab} voci={[
              { id: 'membri', label: 'Contatti', conteggio: dentro.length },
              { id: 'uso', label: 'Dove è usato', conteggio: usatoIn.length },
            ]}/>
          </div>
          {tab === 'membri' && (
            <div>
              {dentro.slice(0, 12).map((c, i) => (
                <div key={c.key} style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '10px 18px',
                  borderBottom: `1px solid ${ADM.BORDER_SOFT}`, background: i % 2 ? ADM.ROW_STRIPE : 'transparent',
                }}>
                  <AdmAvatar name={c.nome} size={32}
                    bg={`hsl(${(c.ref.id.charCodeAt(1) + c.ref.id.charCodeAt(c.ref.id.length - 1)) * 5 % 360}, 42%, 55%)`}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.9, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</div>
                    <div style={{ fontSize: 12.4, color: ADM.MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || c.ref.id}</div>
                  </div>
                  <HubPillola color={CNT_TIPI[c.tipo].color} size="sm">{CNT_TIPI[c.tipo].label}</HubPillola>
                </div>
              ))}
              {dentro.length > 12 && (
                <div style={{ padding: '13px 18px', fontSize: 13.4, color: ADM.MUTED, textAlign: 'center' }}>
                  e altri {fmtNum(dentro.length - 12)} contatti
                </div>
              )}
              {dentro.length === 0 && <HubVuoto icona="users3" titolo="Nessun contatto risponde a questi criteri"
                desc="Non è un errore: un elenco attivo può essere vuoto oggi e pieno domani. Ma se non si riempie mai, i criteri sono troppo stretti."/>}
            </div>
          )}
          {tab === 'uso' && (
            <div style={{ padding: 18 }}>
              {usatoIn.length === 0 && <HubVuoto icona="megaphone" titolo="Non è ancora usato da niente"
                desc="Un elenco serve quando qualcosa lo legge: una campagna che gli manda una mail, un workflow che parte quando qualcuno ci entra."/>}
              {/* Niente chevron: `usatoIn` è solo un nome, non c'è una scheda da
                  aprire — il glifo prometterebbe un click che non esiste. */}
              {usatoIn.map(u => (
                <div key={u} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', marginBottom: 8,
                  border: `1px solid ${ADM.BORDER}`, borderRadius: 10, background: '#fff',
                }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: ADM.HUB_MAGENTA_SOFT, color: ADM.HUB_MAGENTA_DARK, flexShrink: 0 }}>
                    <BuIcons.megaphone size={15}/>
                  </span>
                  <span style={{ flex: 1, fontSize: 13.8, fontWeight: 600, color: ADM.TEXT }}>{u}</span>
                  {u === collegata && <HubPillola color="OK" size="sm">Collegata ora</HubPillola>}
                </div>
              ))}
            </div>
          )}
        </AdmCard>

        <AdmCard padding={18}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 12 }}>I criteri</div>
          {elenco.tipo === 'statico' ? (
            <div style={{ padding: 14, background: ADM.PANEL_SOFT, borderRadius: 10, border: `1px solid ${ADM.BORDER}`, fontSize: 13.5, color: ADM.MUTED, lineHeight: 1.55 }}>
              È un elenco statico: non ha criteri. I contatti ci sono entrati da <strong style={{ color: ADM.TEXT }}>{elenco.origine}</strong> e ci restano finché non li togli.
            </div>
          ) : (
            <React.Fragment>
              <HubCriteriLettura titolo="Include chi…" filtri={elenco.includi} colore="OK"/>
              {(elenco.escludi || []).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <HubCriteriLettura titolo="Ma toglie chi…" filtri={elenco.escludi} colore="DANGER"/>
                </div>
              )}
            </React.Fragment>
          )}
        </AdmCard>
      </div>

      {/* Solo le campagne dove un pubblico si può ancora cambiare: una mail
          già inviata non riprende un pubblico nuovo. */}
      <HubModale open={scegli} onClose={() => setScegli(false)} titolo="Scegli la campagna" larghezza={560}
        sotto={`«${elenco.nome}» diventerà il pubblico della campagna che scegli.`}>
        {HUB_MAIL.filter(m => m.stato === 'bozza' || m.stato === 'programmata').map(m => {
          const s = HUB_STATI_INVIO[m.stato];
          return (
            <div key={m.id} className="hub-riga" onClick={() => collega(m)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', marginBottom: 8,
              border: `1px solid ${ADM.BORDER}`, borderRadius: 10, background: '#fff',
            }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: ADM.HUB_MAGENTA_SOFT, color: ADM.HUB_MAGENTA_DARK, flexShrink: 0 }}>
                <BuIcons.megaphone size={15}/>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.8, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nome}</div>
                <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.oggetto}</div>
              </div>
              <HubPillola color={s.color} size="sm">{s.label}</HubPillola>
              <span className="hub-chev" style={{ color: ADM.MUTED_LIGHT }}><BuIcons.chevronRight size={16}/></span>
            </div>
          );
        })}
      </HubModale>
    </div>
  );
}

// I criteri in sola lettura: una riga per condizione, con la congiunzione
// scritta a sinistra. Un elenco di frasi si legge; una struttura ad albero
// con parentesi no.
function HubCriteriLettura({ titolo, filtri, colore }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: ADM[colore] }}/>
        <span style={{ fontSize: 12.8, fontWeight: 800, color: ADM.TEXT }}>{titolo}</span>
      </div>
      {(filtri || []).length === 0 && (
        <div style={{ fontSize: 13.2, color: ADM.MUTED_SOFT, paddingLeft: 13 }}>Nessuna condizione — ci entrano tutti.</div>
      )}
      {(filtri || []).map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: ADM.MUTED_SOFT,
            background: ADM.NEUTRAL_SOFT, borderRadius: 4, padding: '3px 5px', minWidth: 30,
            textAlign: 'center', flexShrink: 0, marginTop: 1,
          }}>{i === 0 ? 'SE' : 'E'}</span>
          <span style={{ fontSize: 13.4, color: ADM.TEXT, lineHeight: 1.5 }}>{hubDescriviFiltro(f)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Creazione ──────────────────────────────────────────────────────────────
// La schermata di creazione tiene il conteggio LIVE accanto ai criteri: si
// vede quanti contatti si stanno prendendo mentre li si sceglie, non dopo aver
// salvato. È la differenza tra comporre un segmento e indovinarlo.
function HubElencoEditor({ bozza, onChiudi }) {
  const [el, setEl] = useStateEl(bozza);
  const set = (k, v) => setEl(e => Object.assign({}, e, { [k]: v }));
  const esistente = !!bozza.id;  // arrivati da «Modifica criteri»: la bozza è un elenco che esiste già
  // Per gli statici la stessa convenzione del dettaglio: i primi membriFissi
  // della rubrica. Così l'anteprima si muove anche quando si importa un CSV.
  const dentro = useMemoEl(() => el.tipo === 'attivo'
    ? hubApplica(CONTATTI, el.includi, el.escludi)
    : CONTATTI.slice(0, el.membriFissi || 0), [el]);
  const pronto = el.nome.trim().length > 1 && (el.tipo === 'statico' || el.includi.length > 0);

  // L'import è finto ma deterministico: stesso file, stesso numero. Basta a
  // far passare l'anteprima da 0 a un numero, che è la promessa del pulsante.
  const importaCsv = () => setEl(e => Object.assign({}, e, {
    membriFissi: 42, origine: 'Import CSV · contatti-importati.csv',
  }));

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubStrumento icona="arrowLeft" onClick={onChiudi}>{esistente ? bozza.nome : 'Elenchi'}</HubStrumento>
        <span style={{ fontSize: 13.5, color: ADM.MUTED_LIGHT }}>/</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: ADM.TEXT }}>{esistente ? 'Modifica criteri' : 'Nuovo elenco'}</span>
      </div>

      <HubTestata occhiello="CRM · Segmentazione" titolo={esistente ? 'Modifica i criteri' : 'Crea un elenco'}
        sotto={esistente
          ? 'Cambi i criteri e il conteggio a destra si muove: si vede chi entra e chi esce prima di salvare.'
          : 'Dagli un nome, scegli se deve aggiornarsi da solo, e componi i criteri. Il conteggio a destra si muove mentre scegli.'}
        azioni={
          <React.Fragment>
            <HubStrumento onClick={onChiudi}>Annulla</HubStrumento>
            {/* HubStrumento non sa essere disabled: il blocco sta nel guard sul
                click, l'opacità sul wrapper dice che manca qualcosa, il title
                spiega cosa. */}
            <span style={{ opacity: pronto ? 1 : 0.5, transition: 'opacity 0.15s ease' }}>
              <HubStrumento forte icona="check" onClick={() => { if (pronto) onChiudi(); }}
                title={pronto ? undefined : 'Serve almeno un nome e una condizione'}>Salva elenco</HubStrumento>
            </span>
          </React.Fragment>
        }/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AdmCard padding={18}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 12, marginBottom: 12 }}>
              <HubCampo label="Nome dell'elenco">
                <HubInput valore={el.nome} onCambia={v => set('nome', v)} placeholder="es. Locali Plus e Business attivi"/>
              </HubCampo>
              <HubCampo label="Cartella">
                <AdmSelect block value={el.cartella} onChange={v => set('cartella', v)}
                  options={HUB_CARTELLE.map(c => ({ value: c, label: c }))}/>
              </HubCampo>
            </div>
            <HubCampo label="A che serve" nota="Una riga: chi lo trova fra sei mesi deve capire perché esiste.">
              <HubInput valore={el.descrizione} onCambia={v => set('descrizione', v)} placeholder="es. La base installata dei piani alti"/>
            </HubCampo>
          </AdmCard>

          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 11 }}>Come si popola</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.keys(EL_TIPI).map(k => {
                const t = EL_TIPI[k];
                const on = el.tipo === k;
                const Ic = BuIcons[t.icona];
                return (
                  <button key={k} onClick={() => set('tipo', k)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11, textAlign: 'left', padding: 14,
                    borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`,
                    background: on ? ADM.PINK_BG_SOFT : '#fff',
                    boxShadow: on ? `0 6px 18px -10px ${ADM.HUB_GLOW}` : 'none',
                  }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center',
                      background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK : ADM.MUTED,
                    }}><Ic size={17}/></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.4, fontWeight: 700, color: on ? ADM.PINK_DARK : ADM.TEXT }}>{t.label}</span>
                      <span style={{ display: 'block', fontSize: 12.6, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>{t.spiega}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </AdmCard>

          <AdmCard padding={18}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 14 }}>I criteri</div>
            {el.tipo === 'statico' ? (
              el.membriFissi ? (
                // L'import è avvenuto: la riga dice da dove vengono i contatti
                // e quanti sono — lo stato vuoto qui sarebbe una bugia.
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', border: `1px solid ${ADM.BORDER}`, borderRadius: 10, background: ADM.PANEL_SOFT }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', background: ADM.OK_SOFT, color: ADM.OK, flexShrink: 0 }}>
                    <BuIcons.check size={17}/>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.9, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.origine || 'Import CSV'}</div>
                    <div style={{ fontSize: 12.6, color: ADM.MUTED, marginTop: 2 }}>{fmtNum(el.membriFissi)} contatti dentro — fissi finché non li cambi</div>
                  </div>
                  <HubStrumento icona="upload" onClick={importaCsv}>Reimporta</HubStrumento>
                </div>
              ) : (
                <HubVuoto icona="upload" titolo="Un elenco statico non ha criteri"
                  desc="Si riempie importando un CSV o aggiungendo contatti a mano dalla rubrica."
                  azione={<HubStrumento icona="upload" onClick={importaCsv}>Importa un CSV</HubStrumento>}/>
              )
            ) : (
              <HubFiltri righe={CONTATTI} conEscludi
                includi={el.includi} onIncludi={v => set('includi', v)}
                escludi={el.escludi} onEscludi={v => set('escludi', v)}/>
            )}
          </AdmCard>
        </div>

        {/* Il contatore vivo */}
        <AdmCard padding={0} style={{ position: 'sticky', top: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 18px 16px', background: ADM.HUB_GRAD_SOFT, borderBottom: `1px solid ${ADM.BORDER}` }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.HUB_MAGENTA_DARK }}>Anteprima</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.035em', color: ADM.TEXT, marginTop: 6, lineHeight: 1 }}>
              {fmtNum(dentro.length)}
            </div>
            <div style={{ fontSize: 13.4, color: ADM.MUTED, marginTop: 5 }}>
              {el.tipo !== 'statico' ? `contatti su ${fmtNum(CONTATTI.length)} in rubrica`
                : el.membriFissi ? 'contatti dal CSV — fissi finché non li cambi'
                : 'contatti — li aggiungi tu'}
            </div>
          </div>
          <div style={{ padding: 14 }}>
            {el.tipo === 'attivo' && el.includi.length === 0 && (
              <div style={{ fontSize: 13, color: ADM.MUTED, lineHeight: 1.55 }}>
                Senza condizioni ci entrerebbero tutti. Aggiungine almeno una a sinistra.
              </div>
            )}
            {dentro.slice(0, 6).map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0' }}>
                <AdmAvatar name={c.nome} size={26}
                  bg={`hsl(${(c.ref.id.charCodeAt(1) + c.ref.id.charCodeAt(c.ref.id.length - 1)) * 5 % 360}, 42%, 55%)`}/>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.2, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
              </div>
            ))}
            {dentro.length > 6 && (
              <div style={{ fontSize: 12.6, color: ADM.MUTED_SOFT, paddingTop: 6 }}>e altri {fmtNum(dentro.length - 6)}…</div>
            )}
          </div>
        </AdmCard>
      </div>
    </div>
  );
}

window.HubElenchiPage = HubElenchiPage;
window.HubCriteriLettura = HubCriteriLettura;
window.EL_TIPI = EL_TIPI;
window.elMembri = elMembri;

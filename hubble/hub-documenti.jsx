// Piattaforma → Documenti: il catalogo delle versioni contrattuali e
// informative, e il punto da cui ne nasce una nuova.
//
// PUBBLICARE, COMUNICARE E FAR ACCETTARE SONO TRE FATTI DISTINTI, e il modello
// li tiene in tre posti apposta: `policy_versions.published_at` è la
// pubblicazione, `policy_change_notices` è la comunicazione — «un fatto
// distinto dalla pubblicazione: senza registro degli invii resta
// indimostrabile» — e `consent_events` con action accepted è l'accettazione.
// Questa schermata fa il PRIMO. Il preavviso e il quadro degli allineamenti
// vengono dopo e si appoggiano a quello che nasce qui.
//
// L'ACCETTAZIONE IN HUBBLE NON SI COMPIE MAI, e non è una svista. Vuole
// `auth_context` — metodo di autenticazione, sessione, indirizzo, momento,
// cioè «ciò che rende opponibile l'accettazione» — e `document_hash`, che
// prova quale testo. Nessuna delle due può nascere dal click di un operatore:
// nascono dove la persona è, nel gestionale, nell'app di sala, nella Byup App.
// Hubble pubblica, comunica e guarda. Il giorno che qui comparisse un
// «segna come accettato», il fascicolo smetterebbe di valere qualcosa.
//
// IL TESTO SI CARICA, NON SI SCRIVE QUI. Il testo autorevole nasce altrove —
// nel corpus, in markdown, scritto e rivisto da chi di dovere — e un editor in
// Hubble creerebbe un secondo posto dove quel testo vive, libero di divergere:
// su un contratto. E l'impronta dev'essere di un artefatto solo e
// indiscutibile: di un testo battuto in un editor non si saprebbe che cosa
// impronta, se l'HTML o il markdown, e uno spazio in più cambierebbe l'hash
// senza cambiare il contratto. Markdown e non PDF, perché è il testo che la
// finestra di accettazione SCORRE: un PDF diventa un visualizzatore dentro un
// popup, illeggibile su un telefono, senza sapere se uno è arrivato in fondo
// né come estrarne le clausole vessatorie per la seconda firma.
// Qui dentro si scrive solo il CONTORNO, che il documento non può contenere:
// che cosa cambia in una riga, se è peggiorativa, se richiede un nuovo
// consenso, da quando vale.

const { useState: useStateDoc } = React;

const DOC_PUBBLICO = { locale: 'Esercenti', staff: 'Utenze staff', utente: 'Utenti app' };
// I destinatari come li chiama il modello (`policy_change_notices.audience`).
const DOC_AUDIENCE = { locale: 'restaurant', staff: 'staff', utente: 'consumer' };

function HubDocumentiPage() {
  const [aperto, setAperto] = useStateDoc(null);   // codice del documento aperto
  const [, ridisegna] = useStateDoc(0);
  const tocca = () => ridisegna(x => x + 1);
  if (aperto) return <HubDocDettaglio codice={aperto} onChiudi={() => { setAperto(null); tocca(); }}/>;

  const perPubblico = ['locale', 'staff', 'utente'];
  return (
    <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.55 }}>
        Le versioni dei documenti contrattuali e informativi, con la loro pubblicazione e la loro
        decorrenza. Una versione pubblicata non si corregge: se ne pubblica un'altra. L'accettazione
        non si compie da qui — si raccoglie dove la persona è, ed è l'unica cosa che la rende
        opponibile.
      </div>

      {perPubblico.map(dest => {
        const docs = DOCUMENTI.filter(d => d.destinatario === dest && d.versioni);
        if (!docs.length) return null;
        return (
          <div key={dest}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>
              {DOC_PUBBLICO[dest]} <span style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 600, letterSpacing: 0 }}>· {DOC_AUDIENCE[dest]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
              {docs.map(d => <HubDocTessera key={d.codice} doc={d} onApri={() => setAperto(d.codice)}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HubDocTessera({ doc, onApri }) {
  const ultima = docUltima(doc.codice);
  const bozza = docBozza(doc.codice);
  const futura = ultima && ultima.efficace.getTime() > Date.now();
  return (
    <button onClick={onApri} className="adm-pill" style={{
      textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', width: '100%',
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      background: '#fff', border: `1px solid ${bozza ? ADM.WARN : ADM.BORDER}`, borderRadius: 12,
    }}>
      <span style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: ADM.PINK_SOFT, color: ADM.PINK }}>
        <BuIcons.filePdf size={18}/>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.2, fontWeight: 700, color: ADM.TEXT }}>
          {doc.nome} <span style={{ fontWeight: 600, color: ADM.MUTED_SOFT }}>· {doc.codice}</span>
        </span>
        <span style={{ display: 'block', fontSize: 12.4, color: ADM.MUTED, marginTop: 2 }}>
          {ultima
            ? <>v{ultima.v} · {futura ? 'efficace dal' : 'efficace dal'} {fmtDate(ultima.efficace)} · {docPubblicate(doc.codice).length} version{docPubblicate(doc.codice).length === 1 ? 'e' : 'i'}</>
            : 'Nessuna versione'}
          {doc.informativa && ' · si riceve, non si accetta'}
        </span>
      </span>
      {bozza && <AdmBadge color="WARN" size="xs">Bozza</AdmBadge>}
    </button>
  );
}

// ─── Il dettaglio: le versioni, e la bozza in lavorazione ───────────────────
function HubDocDettaglio({ codice, onChiudi }) {
  const doc = DOCUMENTI.find(d => d.codice === codice);
  const [, ridisegna] = useStateDoc(0);
  const tocca = () => ridisegna(x => x + 1);
  const [conferma, setConferma] = useStateDoc(false);
  const bozza = docBozza(codice);
  const ultima = docUltima(codice);
  const puo = hubPuo('piattaforma', 'scrittura');

  const nuova = () => {
    // Il numero si propone incrementando l'ultimo: si può riscrivere, ma
    // partire da zero su un campo che ha una regola è una domanda inutile.
    const pezzi = String((ultima && ultima.v) || '0.0').split('.');
    const prop = pezzi.length > 1 ? `${pezzi[0]}.${Number(pezzi[1]) + 1}` : String(Number(pezzi[0]) + 1);
    docCreaBozza(codice, { v: prop, testo: (ultima && ultima.testo) || '', efficace: docEfficaciaMinima(codice) });
    tocca();
  };

  return (
    <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <AdmButton variant="secondary" size="sm" icon="chevronLeft" onClick={onChiudi}>Documenti</AdmButton>
        <span style={{ fontSize: 15, fontWeight: 800, color: ADM.TEXT }}>{doc.nome}</span>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12.5, color: ADM.MUTED }}>{doc.codice}</span>
        <AdmBadge color={doc.informativa ? 'INFO' : 'PURPLE'} size="xs">
          {doc.informativa ? 'Informativa' : 'Contratto'}
        </AdmBadge>
        <div style={{ flex: 1 }}/>
        {!bozza && <AdmButton variant="primary" size="sm" icon="plus" disabled={!puo} onClick={nuova}
          title={puo ? undefined : 'Pubblicare una versione tocca tutti insieme: serve Scrittura su Piattaforma'}>Nuova versione</AdmButton>}
      </div>

      {/* La regola, detta una volta e qui, che è dove si sta per agire. */}
      <div style={{ padding: '10px 13px', borderRadius: 10, background: ADM.PANEL_SOFT, fontSize: 12.5, color: ADM.MUTED, lineHeight: 1.55 }}>
        {doc.informativa
          ? <>Un'informativa <b style={{ color: ADM.TEXT }}>si riceve, non si accetta</b>: vale dalla pubblicazione, senza preavviso e senza recesso. A registro si scrive una presa visione.</>
          : <>Una modifica contrattuale va comunicata almeno <b style={{ color: ADM.TEXT }}>{DOC_PREAVVISO_GG} giorni</b> prima della decorrenza: applicata senza preavviso è nulla. Nel termine il destinatario può opporsi, e il silenzio vale accettazione tacita — che in una contestazione è un fatto diverso dall'accettazione esplicita.</>}
      </div>

      {bozza && <HubDocBozza codice={codice} bozza={bozza} ultima={ultima} doc={doc} onCambio={tocca}
        onPubblica={() => setConferma(true)} puo={puo}/>}

      <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginTop: 4 }}>Versioni pubblicate</div>
      {docPubblicate(codice).slice().reverse().map(v => (
        <AdmCard key={v.v} padding={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13.5, fontWeight: 800, color: ADM.TEXT }}>v{v.v}</span>
            {v === ultima && <AdmBadge color="OK" size="xs">Corrente</AdmBadge>}
            {v.peggiorativa && <AdmBadge color="WARN" size="xs">Peggiorativa</AdmBadge>}
            {v.nuovoConsenso && <AdmBadge color="DANGER" size="xs">Richiede nuovo consenso</AdmBadge>}
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 12.4, color: ADM.MUTED }}>
              pubblicata {fmtDate(v.pubblicata)} · efficace {fmtDate(v.efficace)}
            </span>
            {window.CtrLinkVersione && <CtrLinkVersione codice={codice} v={v.v} impronta={!doc.informativa} testo="Copia archiviata"/>}
          </div>
          <div style={{ fontSize: 12.6, color: ADM.MUTED, marginTop: 6, lineHeight: 1.5 }}>{v.cambiamento || '—'}</div>
        </AdmCard>
      ))}

      {conferma && (
        <HubDocConferma doc={doc} bozza={bozza} onAnnulla={() => setConferma(false)}
          onFatto={() => { docPubblicaBozza(codice); setConferma(false); tocca(); }}/>
      )}
    </div>
  );
}

// ─── La bozza: il file, il contorno, il confronto ───────────────────────────
function HubDocBozza({ codice, bozza, ultima, doc, onCambio, onPubblica, puo }) {
  const [nomeFile, setNomeFile] = useStateDoc(null);
  const [vediDiff, setVediDiff] = useStateDoc(true);
  const set = (k, v) => { docSalvaBozza(codice, { [k]: v }); onCambio(); };

  const carica = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setNomeFile(f.name); set('testo', String(r.result || '')); };
    r.readAsText(f);
  };

  const minima = docEfficaciaMinima(codice);
  const troppoPresto = !doc.informativa && bozza.efficace && docMezzanotte(bozza.efficace).getTime() < minima.getTime();
  const diff = docDiff((ultima && ultima.testo) || '', bozza.testo || '');
  const cambiate = diff.filter(r => r.t !== 'uguale').length;
  // Una versione identica alla precedente non si pubblica. Non cambierebbe
  // niente per nessuno, ma farebbe partire un preavviso, riaprirebbe le
  // accettazioni di tutti e sposterebbe una data di efficacia: tutto il costo
  // di una modifica, nessuna modifica. Nove volte su dieci vuol dire che il
  // file caricato è quello vecchio.
  const identica = !!ultima && !!ultima.testo && !!bozza.testo && cambiate === 0;
  const pronta = !!(bozza.v || '').trim() && !!(bozza.testo || '').trim() && !!(bozza.cambiamento || '').trim() && !troppoPresto && !identica;
  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${ADM.BORDER}`, borderRadius: 8, fontSize: 13.2, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' };
  const lab = { display: 'block', fontSize: 12.2, fontWeight: 700, color: ADM.MUTED, marginBottom: 5 };

  return (
    <AdmCard padding={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <AdmBadge color="WARN" size="xs">Bozza</AdmBadge>
        <span style={{ fontSize: 13.4, fontWeight: 700, color: ADM.TEXT }}>Non l'ha vista nessuno: si riscrive quante volte serve.</span>
        <div style={{ flex: 1 }}/>
        <AdmButton variant="secondary" size="sm" onClick={() => { docEliminaBozza(codice); onCambio(); }}>Scarta</AdmButton>
        <AdmButton variant="primary" size="sm" icon="check" disabled={!pronta || !puo} onClick={onPubblica}
          title={identica ? 'Il testo è identico alla versione precedente: non c\'è niente da pubblicare' : undefined}>Pubblica…</AdmButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={lab}>Versione</label>
          <input value={bozza.v} onChange={e => set('v', e.target.value)} placeholder="0.25" style={inp}/>
        </div>
        <div>
          <label style={lab}>Efficace dal</label>
          <input type="date" value={bozza.efficace ? new Date(bozza.efficace.getTime() - bozza.efficace.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ''}
            onChange={e => set('efficace', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)} style={inp}/>
          <div style={{ fontSize: 11.8, color: troppoPresto ? ADM.DANGER : ADM.MUTED_SOFT, marginTop: 4, lineHeight: 1.45 }}>
            {doc.informativa
              ? 'Un\'informativa vale dalla pubblicazione.'
              : troppoPresto
                ? `Troppo presto: non prima del ${fmtDate(minima)}.`
                : `Non prima del ${fmtDate(minima)} — ${DOC_PREAVVISO_GG} giorni di preavviso.`}
          </div>
        </div>
        <div>
          <label style={lab}>Testo della versione</label>
          <label className="adm-pill" style={{ ...inp, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: ADM.TEXT }}>
            <BuIcons.filePdf size={15} color={ADM.PINK}/>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nomeFile || (bozza.testo ? 'Testo presente · sostituisci' : 'Carica il markdown…')}
            </span>
            <input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={carica} style={{ display: 'none' }}/>
          </label>
          <div style={{ fontSize: 11.8, color: ADM.MUTED_SOFT, marginTop: 4, lineHeight: 1.45 }}>
            Markdown, non PDF: è il testo che la finestra di accettazione scorre.
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lab}>Che cosa cambia, in una riga</label>
        <input value={bozza.cambiamento} onChange={e => set('cambiamento', e.target.value)}
          placeholder="es. Ridotti i massimali di responsabilità; finestra di contestazione da 60 a 30 giorni" style={inp}/>
        <div style={{ fontSize: 11.8, color: ADM.MUTED_SOFT, marginTop: 4 }}>È la riga che finisce nel preavviso: si scrive guardando il confronto qui sotto.</div>
      </div>

      {!doc.informativa && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', maxWidth: 380 }}>
            <input type="checkbox" checked={!!bozza.peggiorativa} onChange={e => set('peggiorativa', e.target.checked)} style={{ marginTop: 3 }}/>
            <span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: ADM.TEXT }}>Modifica peggiorativa</span>
              <span style={{ display: 'block', fontSize: 12, color: ADM.MUTED, lineHeight: 1.45 }}>
                Peggiora la posizione di chi sta dall'altra parte: meno diritti, più obblighi, termini accorciati a suo danno, responsabilità più limitata.
                {doc.destinatario === 'utente'
                  ? ' Verso i consumatori apre trenta giorni di recesso, e solo se le conseguenze non sono trascurabili.'
                  : ' Verso gli esercenti non apre una finestra in più — il recesso nel preavviso c\'è comunque — ma è quello che il preavviso deve dire per primo.'}
                {' '}È un giudizio: si dà davanti alle righe cambiate, non alla mail di chi ha redatto il testo.
              </span>
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', maxWidth: 380 }}>
            <input type="checkbox" checked={!!bozza.nuovoConsenso} onChange={e => set('nuovoConsenso', e.target.checked)} style={{ marginTop: 3 }}/>
            <span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: ADM.TEXT }}>Richiede un nuovo consenso</span>
              <span style={{ display: 'block', fontSize: 12, color: ADM.MUTED, lineHeight: 1.45 }}>La modifica tocca finalità coperte da consenso: quello prestato prima non si estende, e finché il nuovo non arriva quella finalità si ferma. Non è una riaccettazione.</span>
            </span>
          </label>
        </div>
      )}

      {/* Il confronto con la versione precedente. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 12.2, fontWeight: 700, color: identica ? ADM.WARN : ADM.MUTED }}>
          Confronto con la v{ultima ? ultima.v : '—'}
          {ultima && <span style={{ fontWeight: 500 }}>
            {' · '}{identica ? 'testo identico: non c\'è niente da pubblicare' : `${cambiate} righ${cambiate === 1 ? 'a cambiata' : 'e cambiate'}`}
          </span>}
        </span>
        <div style={{ flex: 1 }}/>
        <AdmButton variant="secondary" size="sm" onClick={() => setVediDiff(v => !v)}>{vediDiff ? 'Nascondi' : 'Mostra'}</AdmButton>
      </div>
      {vediDiff && (
        <div className="adm-scroll" style={{ marginTop: 8, maxHeight: 300, overflow: 'auto', border: `1px solid ${ADM.BORDER}`, borderRadius: 9, background: '#fff' }}>
          {!ultima || !ultima.testo ? (
            <div style={{ padding: '14px 16px', fontSize: 12.6, color: ADM.MUTED, lineHeight: 1.5 }}>
              Della versione precedente non abbiamo il testo in archivio: il confronto arriva dalla prossima. Meglio nessun confronto che uno inventato.
            </div>
          ) : !bozza.testo ? (
            <div style={{ padding: '14px 16px', fontSize: 12.6, color: ADM.MUTED }}>Carica il markdown per vedere che cosa cambia.</div>
          ) : identica ? (
            <div style={{ padding: '14px 16px', fontSize: 12.6, color: ADM.MUTED, lineHeight: 1.5 }}>
              La bozza parte con una copia del testo della v{ultima.v}, così il confronto si vede crescere man mano.
              Finché non carichi il file nuovo le due sono <b style={{ color: ADM.TEXT }}>identiche</b>, e una versione che non cambia niente
              non si pubblica: farebbe partire un preavviso e riaprirebbe le accettazioni di tutti per nulla.
            </div>
          ) : docDiff(ultima.testo, bozza.testo).map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '2px 12px',
              fontFamily: 'ui-monospace,monospace', fontSize: 12, lineHeight: 1.5,
              background: r.t === 'nuova' ? ADM.OK_SOFT : r.t === 'via' ? ADM.DANGER_SOFT : 'transparent',
              color: r.t === 'uguale' ? ADM.MUTED_SOFT : ADM.TEXT,
            }}>
              <span style={{ width: 10, flexShrink: 0, color: r.t === 'nuova' ? ADM.OK : r.t === 'via' ? ADM.DANGER : ADM.MUTED_LIGHT }}>
                {r.t === 'nuova' ? '+' : r.t === 'via' ? '−' : ''}
              </span>
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.riga || ' '}</span>
            </div>
          ))}
        </div>
      )}
    </AdmCard>
  );
}

// ─── La conferma: che cosa succede davvero premendo ─────────────────────────
// Non «sei sicuro?»: l'elenco di ciò che quella pubblicazione mette in moto.
// È l'ultimo momento in cui si può accorgersi che la spunta «peggiorativa» è
// nel posto sbagliato, e la finestra di recesso di trenta giorni non si chiude
// più una volta aperta.
function HubDocConferma({ doc, bozza, onAnnulla, onFatto }) {
  const pubblico = DOC_PUBBLICO[doc.destinatario] || doc.destinatario;
  return (
    <div onClick={onAnnulla} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.45)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '94%', background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 32px 80px rgba(15,17,21,0.30)' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: ADM.TEXT, marginBottom: 4 }}>Pubblicare {doc.codice} v{bozza.v}</div>
        <div style={{ fontSize: 13, color: ADM.MUTED, marginBottom: 14, lineHeight: 1.5 }}>
          Da qui in avanti questa versione non si tocca più: correggerla vorrebbe dire spezzare
          l'impronta e invalidare le accettazioni già raccolte. Una correzione è una versione nuova.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            ['Chi riguarda', `${pubblico} · audience ${DOC_AUDIENCE[doc.destinatario]}`],
            ['Efficace dal', fmtDate(bozza.efficace)],
            [doc.informativa ? 'Come si registra' : 'Come si accetta',
              doc.informativa ? 'Presa visione: si riceve, non si accetta' : 'Esplicita, oppure tacita per decorso del termine'],
            ...(bozza.peggiorativa ? [['Recesso', doc.destinatario === 'utente'
              ? 'Peggiorativa: trenta giorni di recesso dal ricevimento, se le conseguenze non sono trascurabili'
              : 'Peggiorativa: il recesso resta quello esercitabile entro il preavviso, e il preavviso deve dirlo']] : []),
            ...(bozza.nuovoConsenso ? [['Consensi', 'Il consenso prestato prima non si estende: quella finalità si ferma finché non arriva il nuovo']] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, fontSize: 12.8, lineHeight: 1.5 }}>
              <span style={{ width: 130, flexShrink: 0, color: ADM.MUTED, fontWeight: 600 }}>{k}</span>
              <span style={{ color: ADM.TEXT }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '9px 12px', borderRadius: 9, background: ADM.PANEL_SOFT, fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5, marginBottom: 16 }}>
          Pubblicare non comunica: la comunicazione è un fatto a parte, con la sua prova di invio, e
          si fa dopo. Finché non parte, il termine di preavviso non comincia a correre.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <AdmButton variant="secondary" size="sm" onClick={onAnnulla}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" icon="check" onClick={onFatto}>Pubblica la versione</AdmButton>
        </div>
      </div>
    </div>
  );
}

window.HubDocumentiPage = HubDocumentiPage;

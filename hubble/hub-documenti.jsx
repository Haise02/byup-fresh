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
// consenso, da quando vale. ALLA PUBBLICAZIONE NASCE LA COPIA PDF/A della
// versione — intestazione, data e impronta PROPRIA — che è la resa d'archivio
// da esibire, come fanno le piattaforme serie: la sorgente resta il markdown,
// il testo che si accetta resta l'HTML. Le impronte sono DUE e dicono due cose
// diverse (P-177 · D-129): quella del testo prova che il testo accettato è
// questo, quella della copia che la copia è quella nata alla pubblicazione.

const { useState: useStateDoc } = React;

const DOC_PUBBLICO = { locale: 'Esercenti', staff: 'Utenze staff', utente: 'Utenti app' };
// I destinatari come li chiama il modello (`policy_change_notices.audience`).
const DOC_AUDIENCE = { locale: 'restaurant', staff: 'staff', utente: 'consumer' };

function HubDocumentiPage() {
  const [aperto, setAperto] = useStateDoc(null);   // codice del documento aperto
  const [, ridisegna] = useStateDoc(0);
  const tocca = () => ridisegna(x => x + 1);
  if (aperto) return <HubDocDettaglio codice={aperto} onChiudi={() => { setAperto(null); tocca(); }}/>;

  // Ridisegno del 6 settembre 2026: prima una griglia di tessere piccole a
  // due colonne, con tutto in un rigo minuto. Ora una LISTA per destinatario
  // — esercenti, utenze staff, utenti app — dove ogni riga dice il documento,
  // che cos'è, la versione corrente e da quando vale, e se c'è una bozza in
  // lavorazione; in testa tre numeri e la «i» con le regole.
  const perPubblico = ['locale', 'staff', 'utente'];
  const tutti = DOCUMENTI.filter(d => d.versioni);
  const bozze = tutti.filter(d => docBozza(d.codice)).length;
  const inArrivo = tutti.filter(d => { const u = docUltima(d.codice); return u && u.efficace.getTime() > Date.now(); }).length;
  const Numero = ({ etichetta, valore, tono }) => (
    <div style={{ padding:'10px 14px', borderRadius:11, background:'#fff', border:`1px solid ${ADM.BORDER}`, minWidth:96 }}>
      <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:ADM.MUTED_SOFT }}>{etichetta}</div>
      <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color: tono ? ADM[tono] : ADM.TEXT, lineHeight:1.1, marginTop:2 }}>{valore}</div>
    </div>
  );
  return (
    <div data-documenti style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:280 }}>
          <div style={{ fontSize:17, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em' }}>Documenti</div>
          <div style={{ fontSize:13.2, color:ADM.MUTED, marginTop:3, lineHeight:1.5, maxWidth:720 }}>
            Le versioni dei documenti contrattuali e informativi: chi le riceve, da quando valgono, che cosa è in lavorazione.{' '}
            <DocInfo largo={380}>
              <b>Una versione pubblicata non si corregge</b>: se ne pubblica un'altra. <b>L'accettazione non si compie da qui</b>: si raccoglie dove la persona è — gestionale, app di sala, Byup App — ed è l'unica cosa che la rende opponibile.
              {' '}Una modifica contrattuale va comunicata almeno <b>{DOC_PREAVVISO_GG} giorni</b> prima della decorrenza; un'informativa si riceve, non si accetta.
            </DocInfo>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          <Numero etichetta="Documenti" valore={tutti.length}/>
          <Numero etichetta="Bozze" valore={bozze} tono={bozze ? 'WARN' : null}/>
          <Numero etichetta="In arrivo" valore={inArrivo} tono={inArrivo ? 'INFO' : null}/>
        </div>
      </div>

      <HubDocPacchetto onFatto={tocca}/>

      {perPubblico.map(dest => {
        const docs = DOCUMENTI.filter(d => d.destinatario === dest && d.versioni);
        if (!docs.length) return null;
        return (
          <div key={dest} data-pubblico={dest}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>{DOC_PUBBLICO[dest]}</span>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize:11, color: ADM.MUTED_LIGHT }}>audience {DOC_AUDIENCE[dest]}</span>
              <span style={{ fontSize:11.5, color:ADM.MUTED_SOFT }}>· {docs.length}</span>
            </div>
            <div style={{ background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:14, overflow:'hidden', boxShadow:ADM.CARD_SHADOW }}>
              {docs.map((d, i) => <HubDocRiga key={d.codice} doc={d} prima={i === 0} onApri={() => setAperto(d.codice)}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Una riga per documento: icona, nome e natura; la versione corrente e da
// quando vale; lo stato. Tutto quello che serve per decidere se aprirla.
function HubDocRiga({ doc, prima, onApri }) {
  const ultima = docUltima(doc.codice);
  const bozza = docBozza(doc.codice);
  const n = docPubblicate(doc.codice).length;
  const futura = !!ultima && ultima.efficace.getTime() > Date.now();
  const Icona = bozza ? BuIcons.pencil : BuIcons.filePdf;
  return (
    <button data-doc={doc.codice} onClick={onApri} className="adm-actionrow" style={{
      display:'grid', gridTemplateColumns:'40px minmax(0,1.7fr) 150px minmax(0,1.1fr) 140px 24px', gap:14, alignItems:'center',
      width:'100%', textAlign:'left', fontFamily:'inherit', cursor:'pointer', padding:'13px 16px', border:'none', background:'transparent',
      borderTop: prima ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
    }}>
      <span style={{ width:36, height:36, borderRadius:10, display:'grid', placeItems:'center', background: bozza ? ADM.WARN_SOFT : ADM.PINK_SOFT, color: bozza ? ADM.WARN : ADM.PINK }}>
        <Icona size={17}/>
      </span>
      <span style={{ minWidth:0 }}>
        <span style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
          <span style={{ fontSize:14.4, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.nome}</span>
          <span style={{ fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT, flexShrink:0 }}>{doc.codice}</span>
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
          <AdmBadge color={doc.informativa ? 'INFO' : 'PURPLE'} size="xs">{doc.informativa ? 'Informativa' : 'Contratto'}</AdmBadge>
          <span style={{ fontSize:12, color:ADM.MUTED_SOFT }}>{doc.informativa ? 'si riceve, non si accetta' : `preavviso ${DOC_PREAVVISO_GG} giorni`}</span>
        </span>
      </span>
      <span>
        <span style={{ display:'block', fontFamily:'ui-monospace,monospace', fontSize:14, fontWeight:800, color: ultima ? ADM.TEXT : ADM.MUTED_SOFT }}>{ultima ? `v${ultima.v}` : '—'}</span>
        <span style={{ display:'block', fontSize:12, color:ADM.MUTED_SOFT, marginTop:2 }}>{n} {n === 1 ? 'versione' : 'versioni'}</span>
      </span>
      <span style={{ fontSize:12.8, color:ADM.MUTED, lineHeight:1.4 }}>
        {ultima ? <><span style={{ color: futura ? ADM.INFO : ADM.TEXT, fontWeight:600 }}>{futura ? 'In arrivo' : 'Efficace'}</span> dal {fmtDate(ultima.efficace)}<br/><span style={{ color:ADM.MUTED_SOFT }}>pubblicata {fmtDate(ultima.pubblicata)}</span></> : 'Nessuna versione'}
      </span>
      <span>
        {bozza
          ? <HubPillola color="WARN" size="sm">Bozza v{bozza.v || '…'}</HubPillola>
          : ultima ? <HubStato stato="corrente" mappa={{ corrente: { label: futura ? 'Pubblicata' : 'Corrente', color: futura ? 'INFO' : 'OK' } }}/> : null}
      </span>
      <span style={{ color:ADM.MUTED_LIGHT, display:'grid', placeItems:'center' }}><BuIcons.chevronRight size={16}/></span>
    </button>
  );
}


// ─── Il pacchetto: due bozze pronte si pubblicano insieme ───────────────────
// TC-01 e DPA-01 cambiano spesso insieme, perché una modifica contrattuale
// tocca il riparto privacy. Pubblicandoli uno alla volta partono due
// comunicazioni a due settimane di distanza, con due decorrenze sfasate: chi
// le riceve non capisce se sono la stessa cosa, e chi le manda si ritrova due
// orologi da guardare. La data del pacchetto è la più lontana fra i minimi —
// se uno dei documenti ha bisogno di quindici giorni, li aspettano tutti — e
// l'atto a registro è uno.
function HubDocPacchetto({ onFatto }) {
  const [conferma, setConferma] = useStateDoc(false);
  const pronte = DOCUMENTI.filter(d => d.versioni).map(d => docBozza(d.codice))
    .filter(b => b && (b.v || '').trim() && (b.testo || '').trim() && (b.cambiamento || '').trim());
  if (pronte.length < 2) return null;
  const codici = DOCUMENTI.filter(d => d.versioni && pronte.includes(docBozza(d.codice))).map(d => d.codice);
  const eff = docEfficaciaPacchetto(codici);
  return (
    <div style={{ padding: '12px 14px', borderRadius: 11, background: ADM.INFO_SOFT, border: `1px solid ${ADM.INFO}33`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: ADM.INFO, color: '#fff', display: 'grid', placeItems: 'center' }}>
        <BuIcons.layers size={17}/>
      </span>
      <span style={{ flex: 1, minWidth: 240 }}>
        <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700, color: ADM.TEXT }}>
          {pronte.length} bozze pronte: {codici.join(', ')}
        </span>
        <span style={{ display: 'block', fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.45 }}>
          Pubblicandole insieme partono una comunicazione sola e una decorrenza sola, dal {fmtDate(eff)} — la più lontana fra i minimi, perché se uno dei documenti ha bisogno del preavviso lo aspettano tutti.
        </span>
      </span>
      <AdmButton variant="primary" size="sm" icon="layers" onClick={() => setConferma(true)}>Pubblica insieme</AdmButton>
      {conferma && (
        <div onClick={() => setConferma(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.45)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 540, maxWidth: '94%', background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 32px 80px rgba(15,17,21,0.30)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: ADM.TEXT, marginBottom: 4 }}>Pubblicare {codici.length} documenti insieme</div>
            <div style={{ fontSize: 13, color: ADM.MUTED, marginBottom: 14, lineHeight: 1.5 }}>
              Un rilascio solo: stessa decorrenza, una comunicazione, un atto a registro. Le versioni restano
              distinte e ognuna conserva la sua impronta — è il preavviso a essere uno.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {codici.map(c => {
                const b = docBozza(c);
                return (
                  <div key={c} style={{ display: 'flex', gap: 10, fontSize: 12.8, lineHeight: 1.5 }}>
                    <span style={{ width: 90, flexShrink: 0, fontFamily: 'ui-monospace,monospace', fontWeight: 700, color: ADM.TEXT }}>{c} v{b.v}</span>
                    <span style={{ color: ADM.MUTED }}>{b.cambiamento}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 10, fontSize: 12.8, marginTop: 4 }}>
                <span style={{ width: 90, flexShrink: 0, color: ADM.MUTED, fontWeight: 600 }}>Efficace dal</span>
                <span style={{ color: ADM.TEXT }}>{fmtDate(eff)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <AdmButton variant="secondary" size="sm" onClick={() => setConferma(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" icon="check" onClick={() => { docPubblicaPacchetto(codici); setConferma(false); onFatto(); }}>Pubblica il pacchetto</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Il dettaglio: la bozza, la cronologia, la scheda a fianco ──────────────
// A sinistra quello che si fa: la bozza in lavorazione e, sotto, le versioni
// pubblicate come CRONOLOGIA — una linea, un punto per versione, la corrente
// accesa — con numero, date, che cosa cambia e la copia archiviata. A destra,
// fissa, la scheda del documento: chi lo riceve, la versione corrente e da
// quando, la prossima, la regola che vale per questo tipo di documento.
function HubDocDettaglio({ codice, onChiudi }) {
  const doc = DOCUMENTI.find(d => d.codice === codice);
  const [, ridisegna] = useStateDoc(0);
  const tocca = () => ridisegna(x => x + 1);
  const [conferma, setConferma] = useStateDoc(false);
  const bozza = docBozza(codice);
  const ultima = docUltima(codice);
  const puo = hubPuo('piattaforma', 'scrittura');
  const versioni = docPubblicate(codice).slice().reverse();
  const futura = !!ultima && ultima.efficace.getTime() > Date.now();

  const nuova = () => {
    // Il numero si propone incrementando l'ultimo: si può riscrivere, ma
    // partire da zero su un campo che ha una regola è una domanda inutile.
    const pezzi = String((ultima && ultima.v) || '0.0').split('.');
    const prop = pezzi.length > 1 ? `${pezzi[0]}.${Number(pezzi[1]) + 1}` : String(Number(pezzi[0]) + 1);
    docCreaBozza(codice, { v: prop, testo: (ultima && ultima.testo) || '', efficace: docEfficaciaMinima(codice) });
    tocca();
  };
  const voce = (k, v) => (
    <div style={{ display:'flex', flexDirection:'column', gap:2, padding:'9px 0', borderTop:`1px solid ${ADM.BORDER_SOFT}` }}>
      <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:ADM.MUTED_SOFT }}>{k}</span>
      <span style={{ fontSize:13.2, color:ADM.TEXT, lineHeight:1.45 }}>{v}</span>
    </div>
  );

  return (
    <div data-documento={codice} style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <AdmButton variant="secondary" size="sm" icon="chevronLeft" onClick={onChiudi}>Documenti</AdmButton>
        <span style={{ width:34, height:34, borderRadius:10, display:'grid', placeItems:'center', background:ADM.PINK_SOFT, color:ADM.PINK, marginLeft:4 }}><BuIcons.filePdf size={17}/></span>
        <span style={{ fontSize: 17, fontWeight: 800, color: ADM.TEXT, letterSpacing:'-0.02em' }}>{doc.nome}</span>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12.5, color: ADM.MUTED }}>{doc.codice}</span>
        <AdmBadge color={doc.informativa ? 'INFO' : 'PURPLE'} size="xs">{doc.informativa ? 'Informativa' : 'Contratto'}</AdmBadge>
        <div style={{ flex: 1 }}/>
        {!bozza && <AdmButton variant="primary" size="sm" icon="plus" disabled={!puo} onClick={nuova}
          title={puo ? undefined : 'Pubblicare una versione tocca tutti insieme: serve Scrittura su Piattaforma'}>Nuova versione</AdmButton>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 296px', gap:16, alignItems:'start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
          {bozza && <HubDocBozza codice={codice} bozza={bozza} ultima={ultima} doc={doc} onCambio={tocca}
            onPubblica={() => setConferma(true)} puo={puo}/>}
          {/* Il pacchetto si vede anche da qui, che è dove uno sta mentre prepara
              la bozza: nel catalogo lo troverebbe solo tornando indietro. */}
          {bozza && <HubDocPacchetto onFatto={tocca}/>}

          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Versioni pubblicate</span>
              <span style={{ fontSize:11.5, color:ADM.MUTED_SOFT }}>· {versioni.length}</span>
            </div>
            {versioni.length === 0 && <div style={{ fontSize:13, color:ADM.MUTED }}>Nessuna versione pubblicata.</div>}
            <div data-cronologia style={{ position:'relative', paddingLeft:26 }}>
              <div style={{ position:'absolute', left:8, top:14, bottom:14, width:2, background:ADM.BORDER, borderRadius:2 }}/>
              {versioni.map((v, i) => {
                const corrente = v === ultima;
                return (
                  <div key={v.v} data-versione={v.v} style={{ position:'relative', marginBottom: i === versioni.length - 1 ? 0 : 10 }}>
                    <span style={{ position:'absolute', left:-24, top:16, width:14, height:14, borderRadius:'50%', background: corrente ? ADM.PINK : '#fff', border:`2.5px solid ${corrente ? ADM.PINK : ADM.INK_SOFT}`, boxSizing:'border-box', boxShadow: corrente ? `0 0 0 4px ${ADM.PINK_SOFT}` : 'none' }}/>
                    <div style={{ background:'#fff', border:`1px solid ${corrente ? ADM.PINK_HOVER : ADM.BORDER}`, borderRadius:12, padding:'12px 14px', boxShadow: corrente ? ADM.CARD_SHADOW_HOVER : ADM.CARD_SHADOW }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <HubPillola color={corrente ? 'PINK' : 'PLAN_FREE'} forte={corrente} size="sm">v{v.v}</HubPillola>
                        {corrente && <span style={{ fontSize:12.5, fontWeight:700, color: futura ? ADM.INFO : ADM.OK }}>{futura ? 'In arrivo' : 'Corrente'}</span>}
                        {v.editoriale && <span title="Correzione editoriale: non è una versione da accettare e non cambia l'impronta del testo già accettato"><AdmBadge color="INFO" size="xs">Editoriale</AdmBadge></span>}
                        {v.peggiorativa && <AdmBadge color="WARN" size="xs">Peggiorativa</AdmBadge>}
                        {v.nuovoConsenso && <AdmBadge color="DANGER" size="xs">Nuovo consenso</AdmBadge>}
                        {v.rilascio && <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11.5, color: ADM.MUTED_SOFT }}>{v.rilascio}</span>}
                        <div style={{ flex: 1 }}/>
                        <span style={{ fontSize: 12.2, color: ADM.MUTED, whiteSpace:'nowrap' }}>
                          pubblicata {fmtDate(v.pubblicata)} <span style={{ color:ADM.MUTED_LIGHT }}>→</span> efficace {fmtDate(v.efficace)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: ADM.TEXT, marginTop: 8, lineHeight: 1.5 }}>{v.cambiamento || '—'}</div>
                      {window.CtrLinkVersione && (
                        <div style={{ marginTop:8, display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                          <CtrLinkVersione codice={codice} v={v.v} testo="Copia archiviata · PDF/A"/>
                          <span style={{ fontSize:11.5, color:ADM.MUTED_SOFT }}>generata alla pubblicazione, {fmtDate(v.copia && v.copia.generata ? new Date(v.copia.generata) : v.pubblicata)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div data-scheda style={{ position:'sticky', top:12, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:14, padding:'14px 16px', boxShadow:ADM.CARD_SHADOW }}>
          <div style={{ fontSize:13.5, fontWeight:800, color:ADM.TEXT, marginBottom:4 }}>La scheda</div>
          {voce('Chi lo riceve', <>{DOC_PUBBLICO[doc.destinatario]} <span style={{ fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT }}>· {DOC_AUDIENCE[doc.destinatario]}</span></>)}
          {voce('Versione corrente', ultima ? <><b>v{ultima.v}</b> · {futura ? 'in arrivo' : 'efficace'} dal {fmtDate(ultima.efficace)}</> : '—')}
          {voce('Prossima', bozza ? <><HubPillola color="WARN" size="sm">Bozza v{bozza.v || '…'}</HubPillola> <span style={{ color:ADM.MUTED }}>non l'ha vista nessuno</span></> : <span style={{ color:ADM.MUTED }}>nessuna bozza</span>)}
          {voce('Regola', doc.informativa
            ? <>Si <b>riceve</b>, non si accetta: vale dalla pubblicazione, senza preavviso e senza recesso. A registro resta una presa visione.</>
            : <>Una modifica si comunica almeno <b>{DOC_PREAVVISO_GG} giorni</b> prima della decorrenza; nel termine il destinatario può opporsi, e il silenzio vale accettazione tacita.</>)}
          {voce('Accettazione', <span style={{ color:ADM.MUTED }}>Non si compie da qui: si raccoglie dove la persona è, ed è ciò che la rende opponibile.</span>)}
          {/* I tre artefatti di una versione, detti una volta (P-177 · D-129). */}
          {voce('Artefatti', <span style={{ color:ADM.MUTED }}>Markdown sorgente con impronta · HTML reso · copia PDF/A con impronta propria. <b style={{ color:ADM.TEXT }}>Si esibisce la copia</b>.</span>)}
        </div>
      </div>

      {conferma && (
        <HubDocConferma doc={doc} bozza={bozza} onAnnulla={() => setConferma(false)}
          onFatto={() => { docPubblicaBozza(codice); setConferma(false); tocca(); }}/>
      )}
    </div>
  );
}

// ─── La «i»: la spiegazione dove serve, non sotto ogni riga ─────────────────
// Le tre scelte di una versione hanno bisogno di essere spiegate, ma il
// paragrafo sotto ognuna non lo legge nessuno: sporca la lettura e allunga la
// colonna, e chi sa già che cosa sta facendo lo scavalca ogni volta. La
// spiegazione sta dentro una «i»: si apre passandoci sopra, e cliccando RESTA
// aperta — perché una spiegazione che sparisce mentre la leggi non è una
// spiegazione.
function DocInfo({ children, largo }) {
  const [fisso, setFisso] = useStateDoc(false);
  const [sopra, setSopra] = useStateDoc(false);
  const aperto = fisso || sopra;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}
      onMouseEnter={() => setSopra(true)} onMouseLeave={() => setSopra(false)}>
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); setFisso(v => !v); }}
        aria-label="Che cosa vuol dire" style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: `1px solid ${aperto ? ADM.TEXT : ADM.BORDER}`, background: aperto ? ADM.TEXT : '#fff',
          color: aperto ? '#fff' : ADM.MUTED, fontFamily: 'inherit', fontSize: 10.5, fontWeight: 800,
          lineHeight: 1, padding: 0, display: 'grid', placeItems: 'center',
        }}>i</button>
      {aperto && (
        <span style={{
          position: 'absolute', left: 22, top: -6, zIndex: 40, width: largo || 320,
          background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 10,
          boxShadow: '0 14px 34px rgba(15,17,21,0.16)', padding: '10px 12px',
          fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5, fontWeight: 400, textAlign: 'left',
        }}>{children}</span>
      )}
    </span>
  );
}

function HubDocBozza({ codice, bozza, ultima, doc, onCambio, onPubblica, puo }) {
  // La bozza si scrive QUI e si salva con un pulsante. Prima si salvava a ogni
  // tasto e nessuno se ne accorgeva: un salvataggio che non si vede non
  // rassicura nessuno, e chi usciva dalla pagina non sapeva se aveva perso il
  // lavoro. Ora quello che si batte sta nello stato di questa schermata finché
  // non si preme «Salva in bozza».
  const [b, setB] = useStateDoc(() => Object.assign({}, bozza));
  const [sporca, setSporca] = useStateDoc(false);
  const [nomeFile, setNomeFile] = useStateDoc(null);
  const [vediDiff, setVediDiff] = useStateDoc(false);
  const set = (k, v) => { setB(x => Object.assign({}, x, { [k]: v })); setSporca(true); };

  const carica = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setNomeFile(f.name); set('testo', String(r.result || '')); };
    r.readAsText(f);
  };

  // La spunta è UNA: questa versione chiede qualcosa a chi la riceve, oppure
  // no. Di base NO — è una correzione, vale dalla pubblicazione e non muove
  // niente. Spuntandola parte il preavviso e la richiesta di accettazione (o
  // di consenso, se è un'informativa: un'informativa non si accetta).
  const informativa = !!doc.informativa;
  const chiede = informativa ? !!b.nuovoConsenso : !b.editoriale;
  const setChiede = (on) => {
    if (informativa) { set('nuovoConsenso', on); return; }
    setB(x => Object.assign({}, x, { editoriale: !on, peggiorativa: on ? x.peggiorativa : false }));
    setSporca(true);
  };

  const minima = docEfficaciaMinima(codice, new Date(), !chiede);
  const troppoPresto = chiede && !informativa && b.efficace && docMezzanotte(b.efficace).getTime() < minima.getTime();
  const diff = docDiff((ultima && ultima.testo) || '', b.testo || '');
  const cambiate = diff.filter(r => r.t !== 'uguale').length;
  const identica = !!ultima && !!ultima.testo && !!b.testo && cambiate === 0;
  const completa = !!(b.v || '').trim() && !!(b.testo || '').trim() && !!(b.cambiamento || '').trim() && !troppoPresto && !identica;
  const pronta = completa && !sporca;

  const salva = () => {
    docSalvaBozza(codice, { v: b.v, testo: b.testo, cambiamento: b.cambiamento,
      peggiorativa: b.peggiorativa, nuovoConsenso: b.nuovoConsenso, editoriale: b.editoriale,
      efficace: chiede && !informativa ? b.efficace : docEfficaciaMinima(codice, new Date(), true) });
    setSporca(false); onCambio();
  };

  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${ADM.BORDER}`, borderRadius: 8, fontSize: 13.2, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' };
  const lab = { display: 'block', fontSize: 12.2, fontWeight: 700, color: ADM.MUTED, marginBottom: 5 };
  const linkino = { background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.2, fontWeight: 600, color: ADM.MUTED, textDecoration: 'underline', textUnderlineOffset: 3 };

  return (
    <AdmCard padding={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <AdmBadge color="WARN" size="xs">Bozza</AdmBadge>
        <span style={{ fontSize: 13.4, fontWeight: 700, color: ADM.TEXT }}>Non l'ha vista nessuno: si riscrive quante volte serve.</span>
        <div style={{ flex: 1 }}/>
        {sporca
          ? <span style={{ fontSize: 12.2, color: ADM.WARN, fontWeight: 700 }}>Modifiche non salvate</span>
          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.2, color: ADM.MUTED, fontWeight: 600 }}>
              <BuIcons.check size={13} color={ADM.OK}/> Salvata{bozza.salvata ? ` alle ${bozza.salvata.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>}
        <AdmButton variant="secondary" size="sm" disabled={!sporca} onClick={salva}>Salva in bozza</AdmButton>
        <AdmButton variant="primary" size="sm" icon="check" disabled={!pronta || !puo} onClick={onPubblica}
          title={sporca ? 'Salva la bozza prima di pubblicarla' : identica ? 'Il testo è identico alla versione precedente' : undefined}>Pubblica…</AdmButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={lab}>Versione</label>
          <input value={b.v} onChange={e => set('v', e.target.value)} placeholder="0.25" style={inp}/>
        </div>
        <div>
          <label style={lab}>Efficace dal</label>
          <input type="date" disabled={!chiede || informativa}
            value={b.efficace ? new Date(b.efficace.getTime() - b.efficace.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ''}
            onChange={e => set('efficace', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            style={Object.assign({}, inp, (!chiede || informativa) ? { background: ADM.PANEL_SOFT, color: ADM.MUTED } : {})}/>
          <div style={{ fontSize: 11.8, color: troppoPresto ? ADM.DANGER : ADM.MUTED_SOFT, marginTop: 4, lineHeight: 1.45 }}>
            {!chiede || informativa
              ? 'Vale dalla pubblicazione.'
              : troppoPresto ? `Non prima del ${fmtDate(minima)}.` : `Non prima del ${fmtDate(minima)} — ${DOC_PREAVVISO_GG} giorni di preavviso.`}
          </div>
        </div>
        <div>
          <label style={lab}>Testo della versione</label>
          <label className="adm-pill" style={{ ...inp, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: ADM.TEXT }}>
            <BuIcons.filePdf size={15} color={ADM.PINK}/>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nomeFile || (b.testo ? 'Testo presente · sostituisci' : 'Carica il markdown…')}
            </span>
            <input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={carica} style={{ display: 'none' }}/>
          </label>
          <div style={{ fontSize: 11.8, color: ADM.MUTED_SOFT, marginTop: 4 }}>Markdown: è il testo che la finestra di accettazione scorre.</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lab}>Che cosa cambia, in una riga</label>
        <input value={b.cambiamento} onChange={e => set('cambiamento', e.target.value)}
          placeholder="es. Ridotti i massimali di responsabilità; finestra di contestazione da 60 a 30 giorni" style={inp}/>
      </div>

      {/* UNA scelta, non tre. Di base la versione non chiede niente a nessuno:
          è una correzione, vale dalla pubblicazione e chi aveva accettato resta
          allineato. Spuntando, parte il preavviso e la richiesta. La
          «peggiorativa» non è allo stesso livello — non decide che cosa
          succede, aggiunge una conseguenza al caso in cui qualcosa succede
          già — e infatti compare solo dentro. */}
      <div style={{ padding: '11px 13px', borderRadius: 10, background: chiede ? ADM.WARN_SOFT : ADM.PANEL_SOFT, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <input type="checkbox" data-chiede checked={chiede} onChange={e => setChiede(e.target.checked)}/>
          <span style={{ fontSize: 13.2, fontWeight: 700, color: ADM.TEXT }}>
            {informativa ? 'Richiede un nuovo consenso' : 'Richiede una nuova accettazione'}
          </span>
          <DocInfo>
            {informativa
              ? <>Spuntata, la modifica tocca finalità coperte da consenso: quello prestato prima <b>non si estende</b>, e finché il nuovo non arriva quella finalità si ferma. Non spuntata, la nuova versione si pubblica e basta: un'informativa si riceve, non si accetta.</>
              : <>Non spuntata, è una <b>correzione</b> — un refuso, una rinumerazione, un rimando sbagliato: vale dalla pubblicazione, senza preavviso, e chi aveva accettato la versione prima resta allineato. Spuntata, parte il preavviso di {DOC_PREAVVISO_GG} giorni e la richiesta di accettazione arriva a chi riceve il documento.</>}
          </DocInfo>
          <span style={{ fontSize: 12.4, color: ADM.MUTED }}>
            {chiede ? '' : informativa ? '· si pubblica e basta' : '· correzione: non muove niente'}
          </span>
        </label>

        {chiede && !informativa && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginTop: 9, paddingLeft: 24, borderLeft: `2px solid ${ADM.BORDER}`, marginLeft: 6 }}>
            <input type="checkbox" data-peggiorativa checked={!!b.peggiorativa} onChange={e => set('peggiorativa', e.target.checked)}/>
            <span style={{ fontSize: 12.6, fontWeight: 600, color: ADM.MUTED }}>e peggiora la posizione di chi la riceve</span>
            <DocInfo>
              Meno diritti, più obblighi, termini accorciati a suo danno, responsabilità più limitata.
              {doc.destinatario === 'utente'
                ? <> Verso i consumatori apre <b>trenta giorni di recesso</b> dal ricevimento, e solo se le conseguenze non sono trascurabili.</>
                : <> Verso gli esercenti non apre una finestra in più — il recesso entro il preavviso c'è comunque — ma è la prima cosa che il preavviso deve dire.</>}
            </DocInfo>
          </label>
        )}
      </div>

      {/* Il confronto: un collegamento, non un pulsante. Serve a chi pubblica e
          non esce da qui — non lo vede né il ristoratore né il cliente. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setVediDiff(v => !v)} style={linkino}>
          {vediDiff ? 'Nascondi il confronto' : 'Confronta con la versione precedente'}
        </button>
        {ultima && (
          <span style={{ fontSize: 12.2, color: identica ? ADM.WARN : ADM.MUTED_SOFT }}>
            {identica ? '· testo identico alla v' + ultima.v : `· ${cambiate} righ${cambiate === 1 ? 'a cambiata' : 'e cambiate'} rispetto alla v${ultima.v}`}
          </span>
        )}
        <div style={{ flex: 1 }}/>
        <button onClick={() => { docEliminaBozza(codice); onCambio(); }} style={Object.assign({}, linkino, { color: ADM.DANGER })}>Scarta la bozza</button>
      </div>
      {vediDiff && (
        <div className="adm-scroll" style={{ marginTop: 8, maxHeight: 300, overflow: 'auto', border: `1px solid ${ADM.BORDER}`, borderRadius: 9, background: '#fff' }}>
          {!ultima || !ultima.testo ? (
            <div style={{ padding: '14px 16px', fontSize: 12.6, color: ADM.MUTED, lineHeight: 1.5 }}>
              Della versione precedente non abbiamo il testo in archivio: il confronto arriva dalla prossima. Meglio nessun confronto che uno inventato.
            </div>
          ) : !b.testo ? (
            <div style={{ padding: '14px 16px', fontSize: 12.6, color: ADM.MUTED }}>Carica il markdown per vedere che cosa cambia.</div>
          ) : identica ? (
            <div style={{ padding: '14px 16px', fontSize: 12.6, color: ADM.MUTED, lineHeight: 1.5 }}>
              La bozza parte con una copia del testo della v{ultima.v}: finché non carichi il file nuovo le due sono <b style={{ color: ADM.TEXT }}>identiche</b>,
              e una versione che non cambia niente non si pubblica.
            </div>
          ) : diff.map((r, i) => (
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
              doc.informativa ? 'Presa visione: si riceve, non si accetta'
                : bozza.editoriale ? 'Niente da accettare: chi aveva accettato la versione prima resta allineato'
                : 'Esplicita, oppure tacita per decorso del termine'],
            ...(bozza.editoriale && !doc.informativa ? [['Preavviso', 'Nessuno: è una correzione, non fa ripartire l\'orologio']] : []),
            ...(bozza.peggiorativa ? [['Recesso', doc.destinatario === 'utente'
              ? 'Peggiorativa: trenta giorni di recesso dal ricevimento, se le conseguenze non sono trascurabili'
              : 'Peggiorativa: il recesso resta quello esercitabile entro il preavviso, e il preavviso deve dirlo']] : []),
            ...(bozza.nuovoConsenso ? [['Consensi', 'Il consenso prestato prima non si estende: quella finalità si ferma finché non arriva il nuovo']] : []),
            ['Copia archiviata', 'Nasce ora, in PDF/A, dal markdown depositato: intestazione, data e impronta propria, accanto a quella del testo. È quella che si esibisce; il markdown resta la sorgente'],
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

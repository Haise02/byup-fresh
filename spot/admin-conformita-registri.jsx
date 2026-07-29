// Conformità — i due registri "anagrafici": rischi (§6.1) e fornitori (A.5.19–5.23 · §8.4).
//
// Sono i primi due documenti che un auditor apre. Il registro dei rischi dice se
// l'azienda sa dove può farsi male e cosa ha fatto per rimediare; il registro dei
// fornitori dice a chi ha messo in mano i propri dati e con quale contratto.
// In entrambi la domanda non è "esiste il registro?" ma "è vivo?": la data di
// riesame è la prova, e dove manca il registro vale meno di zero.

const { useState: useStateCfr } = React;

// ─── Scala del rischio ─────────────────────────────────────────────────────
// Livello = probabilità × impatto su scala 1-5. Le soglie sono quelle della
// metodologia dichiarata: 1-6 basso, 8-12 medio, 15-25 alto.
const CFR_PROB = ['Raro', 'Improbabile', 'Possibile', 'Probabile', 'Quasi certo'];
const CFR_IMP  = ['Trascurabile', 'Minore', 'Moderato', 'Grave', 'Critico'];

const cfrLiv    = (p, i) => (p || 0) * (i || 0);
const cfrFascia = (n) => (n >= 15 ? 'alto' : n >= 8 ? 'medio' : 'basso');
const cfrCoord  = (r, vista) => (vista === 'residuo'
  ? { p: r.residuoProb, i: r.residuoImpatto }
  : { p: r.prob, i: r.impatto });

// Rampa monocromatica: lo sfondo della cella dice quanto è severa quella
// posizione, non a quale categoria appartiene. Il coral è riservato alla fascia
// alta — un accento solo, non un arcobaleno. La rampa si distende su 1-12
// perché sopra il 12 il colore lo prende il coral: usare tutta la scala 1-25
// renderebbe indistinguibili basso e medio.
const cfrRampa = (liv) => `rgba(49,53,61,${(0.04 + (Math.min(liv, 12) / 12) * 0.16).toFixed(3)})`;

// ─── Categorie di rischio ──────────────────────────────────────────────────
// Tassonomia chiusa: un rischio deve poter cadere in una sola casella, e ogni
// rischio futuro deve trovare la sua. Sono otto perché sotto si finisce a
// mettere tutto in «informatico», sopra si ottengono categorie da un elemento
// che come filtro non servono a niente.
//
// «Reputazionale» è deliberatamente assente: la perdita di reputazione è quasi
// sempre la CONSEGUENZA di uno di questi otto, non un rischio a sé. Tenerla
// come categoria porta a censire due volte lo stesso evento.
const CFR_CATEGORIE = [
  { id:'informatico',   label:'Informatico',   nota:'Guasti, indisponibilità, difetti del software' },
  { id:'accessi',       label:'Accessi',       nota:'Credenziali, privilegi, identità' },
  { id:'dati',          label:'Dati personali',nota:'Violazioni e trattamenti non conformi' },
  { id:'fornitori',     label:'Fornitori',     nota:'Dipendenza da terze parti e sub-responsabili' },
  { id:'organizzativo', label:'Organizzativo', nota:'Persone, ruoli, competenze, continuità del presidio' },
  { id:'operativo',     label:'Operativo',     nota:'Erogazione del servizio nei locali' },
  { id:'conformita',    label:'Conformità',    nota:'Obblighi legali, fiscali, contrattuali' },
  { id:'economico',     label:'Economico',     nota:'Ricavi, incassi, sostenibilità' },
];
const cfrCatLabel = (id) => (CFR_CATEGORIE.find(c => c.id === id) || {}).label || id;

const CFR_TRATT = { mitigare:'Mitigare', accettare:'Accettare', trasferire:'Trasferire', evitare:'Evitare' };
const CFR_STATO = {
  nuovo:     { tono:'WARN',    label:'Nuovo' },
  aperto:    { tono:'WARN',    label:'Aperto' },
  trattato:  { tono:'OK',      label:'Trattato' },
  accettato: { tono:'NEUTRAL', label:'Accettato' },
};

const cfrMesiFa = (d) => (d ? Math.max(0, Math.round((Date.now() - d.getTime()) / 2629800000)) : null);
const cfrQuandoFa = (d) => {
  const m = cfrMesiFa(d);
  if (m == null) return '';
  if (m === 0) return 'questo mese';
  if (m === 1) return '1 mese fa';
  return `${m} mesi fa`;
};

// ─── Chip riusabili ────────────────────────────────────────────────────────
// Definiti a livello di modulo, mai dentro un componente: un sotto-componente
// dichiarato nel corpo di un altro viene rimontato a ogni render.

function CfrChips({ items, titolo }) {
  if (!items || !items.length) return <span style={{fontSize:12, color:ADM.MUTED_SOFT}}>—</span>;
  return (
    <span style={{display:'flex', flexWrap:'wrap', gap:4}} title={titolo}>
      {items.map(c => (
        <span key={c} style={{fontSize:11, fontWeight:700, color:ADM.INK, background:'rgba(49,53,61,0.07)',
          padding:'2px 6px', borderRadius:5, whiteSpace:'nowrap', letterSpacing:'0.01em'}}>{c}</span>
      ))}
    </span>
  );
}

// Blocco livello: la pastiglia con il livello e la fascia, e sotto i due nomi
// che lo generano. Non «3 × 4»: quello è il punteggio, e un punteggio non si
// legge. «Possibile × Grave» si legge, e rende la pastiglia verificabile a
// occhio invece che un voto calato dall'alto.
function CfrLivello({ p, i, forte, nota, notaTono }) {
  const liv = cfrLiv(p, i);
  const alta = cfrFascia(liv) === 'alto';
  return (
    <span style={{display:'inline-flex', flexDirection:'column', alignItems:'flex-start', gap:3}}>
      {/* La nota sta accanto alla pastiglia, non sotto: così inerente e residuo
          restano alti uguali e le pastiglie si allineano fra loro. */}
      <span style={{display:'inline-flex', alignItems:'baseline', gap:6}}>
        <span style={{display:'inline-flex', alignItems:'baseline', gap:5, padding:'2px 8px', borderRadius:6,
          background: alta ? ADM.PINK : forte ? 'rgba(49,53,61,0.10)' : 'rgba(49,53,61,0.05)',
          color: alta ? '#fff' : ADM.INK}}>
          <span style={{fontSize:14.5, fontWeight:800, letterSpacing:'-0.01em'}}>{liv}</span>
          <span style={{fontSize:10.5, fontWeight:700, opacity:0.7}}>{cfrFascia(liv)}</span>
        </span>
        {nota && <span style={{fontSize:11, fontWeight:700, color: notaTono || ADM.MUTED_SOFT}}>{nota}</span>}
      </span>
      <span style={{fontSize:10.8, color:ADM.MUTED_SOFT, lineHeight:1.3}}>
        {CFR_PROB[p-1]} × {CFR_IMP[i-1]}
      </span>
    </span>
  );
}

// Coppia etichetta/valore per le fasce di dettaglio in linea.
function CfrVoce({ k, v, tono, span }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <div style={{fontSize:11.2, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700}}>{k}</div>
      <div style={{fontSize:12.8, fontWeight:600, color: tono ? CF_TONO(tono) : ADM.TEXT, marginTop:3, lineHeight:1.4}}>{v}</div>
    </div>
  );
}

// ─── Matrice probabilità × impatto ─────────────────────────────────────────
// Non è decorazione: è il modo in cui la norma chiede di mostrare che i rischi
// sono stati pesati con un criterio unico. Le celle contano, e cliccandole
// filtrano l'elenco sotto — la matrice e la tabella sono la stessa cosa.
function CfrMatrice({ celle, sel, onSel }) {
  const cella = (p, i) => {
    const dentro = celle[p + '-' + i] || [];
    const n = dentro.length;
    const liv = cfrLiv(p, i);
    const alta = cfrFascia(liv) === 'alto';
    const attiva = !!sel && sel.p === p && sel.i === i;
    const cliccabile = n > 0;
    return (
      <div key={p + '-' + i}
        className={cliccabile ? 'adm-card-interactive' : undefined}
        onClick={cliccabile ? () => onSel(attiva ? null : { p, i }) : undefined}
        title={cliccabile ? `${n} ${n === 1 ? 'rischio' : 'rischi'} · ${CFR_PROB[p-1]} × ${CFR_IMP[i-1]} · livello ${liv}` : undefined}
        style={{
          height:50, borderRadius:8, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:1,
          border:`1px solid ${alta && !n ? 'rgba(255,90,95,0.22)' : 'transparent'}`,
          background: alta ? (n ? ADM.PINK : 'rgba(255,90,95,0.09)') : cfrRampa(liv),
          boxShadow: attiva ? `inset 0 0 0 2px ${ADM.TEXT}` : 'none',
        }}>
        <span style={{fontSize: n ? 16 : 12.5, fontWeight: n ? 800 : 600, lineHeight:1,
          color: n ? (alta ? '#fff' : ADM.TEXT) : ADM.MUTED_LIGHT}}>{n || '·'}</span>
        {n > 0 && (
          <span style={{fontSize:10, fontWeight:700, letterSpacing:'0.02em',
            color: alta ? 'rgba(255,255,255,0.82)' : ADM.MUTED_SOFT}}>liv {liv}</span>
        )}
      </div>
    );
  };

  const GRIGLIA = { display:'grid', gridTemplateColumns:'128px repeat(5, minmax(0,1fr))', gap:5, alignItems:'center' };

  // Gli assi si dichiarano una volta, in testa alla loro fila. I numeri di scala
  // sotto ogni nome erano rumore: la posizione nella griglia dice già dove sta
  // «Critico» rispetto a «Grave», e il livello si legge nella cella.
  const ASSE = { fontSize:10.8, color:ADM.MUTED_SOFT, textTransform:'uppercase',
    letterSpacing:'0.06em', fontWeight:700 };

  return (
    <div>
      <div style={{...GRIGLIA, marginBottom:7}}>
        <div style={{...ASSE, textAlign:'right', paddingRight:8}}>↑ impatto</div>
      </div>
      {[5, 4, 3, 2, 1].map(i => (
        <div key={i} style={{...GRIGLIA, marginBottom:5}}>
          <div style={{textAlign:'right', paddingRight:8, fontSize:12.2, fontWeight:700, color:ADM.TEXT}}>
            {CFR_IMP[i-1]}
          </div>
          {[1, 2, 3, 4, 5].map(p => cella(p, i))}
        </div>
      ))}
      <div style={{...GRIGLIA, marginTop:2}}>
        <div style={{...ASSE, textAlign:'right', paddingRight:8}}>probabilità →</div>
        {[1, 2, 3, 4, 5].map(p => (
          <div key={p} style={{textAlign:'center', fontSize:11.8, fontWeight:700, color:ADM.TEXT}}>
            {CFR_PROB[p-1]}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Metodologia di valutazione del rischio ────────────────────────────────
// §6.1.2 chiede che il processo produca risultati «coerenti, validi e
// comparabili»: comparabili significa che due persone diverse, in due momenti
// diversi, davanti allo stesso rischio devono arrivare allo stesso numero. È
// possibile solo se le scale sono DEFINITE, non lasciate al buon senso.
//
// Il documento controllato vive nel gestore documentale; qui c'è la versione in
// vigore, leggibile nel punto in cui la si applica. Se le due divergono, vale
// quella firmata su Drive.
const CFR_MET = {
  versione: 'Versione 2',
  approvata: '10 febbraio 2026',
  approvatore: 'Marco Rinaldi, responsabile del sistema di gestione',
  prossimo: '10 febbraio 2027',
};

const CFR_SCALA_PROB = [
  { n:1, def:'Mai osservato in Byup né riportato da fornitori o dal settore. Atteso meno di una volta ogni cinque anni.' },
  { n:2, def:'Plausibile ma mai verificatosi. Atteso al più una volta ogni due o tre anni.' },
  { n:3, def:'Già verificatosi almeno una volta nel settore, o una volta in Byup. Atteso circa una volta l’anno.' },
  { n:4, def:'Già verificatosi in Byup o ricorrente nel settore. Atteso più volte l’anno.' },
  { n:5, def:'La condizione che lo produce è già presente. Atteso entro pochi mesi se non si interviene.' },
];

const CFR_SCALA_IMP = [
  { n:1, def:'Disservizio risolto entro l’ora su un solo locale. Nessun dato coinvolto, nessun costo rilevante.' },
  { n:2, def:'Disservizio di poche ore su un locale. Nessun dato personale esposto, costo sotto i mille euro.' },
  { n:3, def:'Disservizio di una giornata o esteso a più locali. Dati non personali esposti, costo fino a diecimila euro, reclami isolati.' },
  { n:4, def:'Servizio interrotto oltre la giornata. Violazione di dati personali con notifica al Garante, sanzione possibile, perdita di clienti.' },
  { n:5, def:'Interruzione prolungata o perdita di dati non recuperabile. Violazione estesa con notifica agli interessati, sanzione rilevante, danno di immagine pubblico.' },
];

// Le cinque dimensioni che l'impatto misura. Sono elencate perché la domanda
// «questo quanto vale?» ha risposta solo se si sa che cosa si sta pesando — ed
// è qui che entra il danno di immagine, che non è una categoria di rischio ma
// una delle facce del danno.
const CFR_DIMENSIONI = [
  ['Continuità', 'per quanto tempo il servizio resta degradato o fermo'],
  ['Dati personali', 'se sono coinvolti, di chi, e se scatta la notifica'],
  ['Costo', 'esborso diretto, rimborsi, ore di lavoro per rimediare'],
  ['Obblighi', 'sanzioni, inadempienze contrattuali verso i locali'],
  ['Immagine', 'quanto diventa pubblico e quanto pesa sulla fiducia dei ristoratori'],
];

const CFR_FASCE = [
  { fascia:'Basso', range:'1 – 6', tono:'ok',
    criterio:'Accettabile. Si registra e si riesamina alla cadenza ordinaria, senza azioni obbligatorie.' },
  { fascia:'Medio', range:'8 – 12', tono:'warn',
    criterio:'Da trattare. Il piano va definito entro il riesame successivo, con un responsabile e una data.' },
  { fascia:'Alto', range:'15 – 25', tono:'alto',
    criterio:'Trattamento obbligatorio. Il residuo va portato sotto 15, oppure accettato con delibera del riesame di direzione.' },
];

function CfrRigaScala({ n, nome, def }) {
  const forte = n >= 4;
  return (
    <div style={{display:'grid', gridTemplateColumns:'168px minmax(0,1fr)', gap:16, alignItems:'baseline',
      padding:'10px 0', borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
      <div style={{display:'flex', alignItems:'baseline', gap:8}}>
        <span style={{fontSize:11.6, fontWeight:800, color:ADM.MUTED_SOFT, minWidth:12,
          fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{n}</span>
        <span style={{fontSize:13.4, fontWeight:700, color: forte ? ADM.TEXT : ADM.INK}}>{nome}</span>
      </div>
      <div style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.55}}>{def}</div>
    </div>
  );
}

function CfrSezioneMet({ n, titolo, sottotitolo, children }) {
  return (
    <section style={{marginBottom:30}}>
      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:3}}>
        <span style={{fontSize:11.6, fontWeight:800, color:ADM.PINK, letterSpacing:'0.04em',
          fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{String(n).padStart(2, '0')}</span>
        <h3 style={{fontSize:15.5, fontWeight:800, color:ADM.TEXT, margin:0, letterSpacing:'-0.01em'}}>{titolo}</h3>
      </div>
      {sottotitolo && (
        <div style={{fontSize:12.6, color:ADM.MUTED_SOFT, marginBottom:12, marginLeft:26, lineHeight:1.5}}>{sottotitolo}</div>
      )}
      <div style={{marginLeft:26}}>{children}</div>
    </section>
  );
}

const CFR_P = { fontSize:13.4, color:ADM.TEXT, lineHeight:1.68, margin:'0 0 12px' };

function CfrMetodologia({ onChiudi }) {
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="metodologia" onClick={e=>e.stopPropagation()} style={{width:820, maxWidth:'94%', background:'#fff', borderRadius:16,
        boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>

        {/* Frontespizio: versione, approvazione e prossimo riesame stanno in
            testa perché una metodologia è un documento controllato, e la prima
            cosa che un auditor chiede è quale versione stavate applicando. */}
        <div style={{padding:'22px 34px 18px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:16}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:11.4, fontWeight:800, color:ADM.MUTED, textTransform:'uppercase',
                letterSpacing:'0.07em'}}>ISO/IEC 27001 §6.1.2 · ISO 9001 §6.1</div>
              <h2 style={{fontSize:21, fontWeight:800, color:ADM.TEXT, margin:'6px 0 0', letterSpacing:'-0.02em'}}>
                Metodologia di valutazione del rischio
              </h2>
              <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:5, lineHeight:1.5}}>
                {CFR_MET.versione} · approvata il {CFR_MET.approvata} da {CFR_MET.approvatore} · prossimo riesame {CFR_MET.prossimo}
              </div>
            </div>
            <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Chiudi</AdmButton>
          </div>
        </div>

        <div style={{padding:'26px 34px 34px', overflowY:'auto', flex:1, minHeight:0}}>

          <CfrSezioneMet n={1} titolo="A che cosa si applica">
            <p style={CFR_P}>
              Questa metodologia copre tutti i rischi che possono compromettere la riservatezza,
              l’integrità o la disponibilità delle informazioni trattate da Byup, e la capacità di
              erogare il servizio ai locali convenzionati. Il perimetro comprende la piattaforma nelle
              sue quattro superfici — l’app per i clienti finali, il gestionale per i ristoratori,
              l’app di sala per il personale e Spot per l’amministrazione — l’infrastruttura su cui
              gira e la catena che porta un ordine fino all’incasso e alla trasmissione fiscale.
            </p>
            <p style={{...CFR_P, marginBottom:0}}>
              Sono inclusi i rischi che nascono presso i fornitori, perché Byup resta responsabile
              verso i propri clienti anche quando la causa è a monte. Sono esclusi i rischi propri
              del locale che non dipendono dal servizio, come la gestione del personale di sala.
            </p>
          </CfrSezioneMet>

          <CfrSezioneMet n={2} titolo="Chi fa che cosa">
            <p style={CFR_P}>
              Ogni rischio ha un <strong>responsabile</strong>: è la persona che risponde del suo
              trattamento e che ne conferma la valutazione al riesame. Non è chi lo ha scritto per
              primo, ed è una persona sola — un rischio in capo a un gruppo non è in capo a nessuno.
            </p>
            <p style={{...CFR_P, marginBottom:0}}>
              Il responsabile del sistema di gestione mantiene il registro, convoca i riesami e porta
              al riesame di direzione i rischi che restano alti dopo il trattamento. L’accettazione di
              un rischio residuo alto non è una decisione sua: è della direzione, e resta a verbale.
            </p>
          </CfrSezioneMet>

          <CfrSezioneMet n={3} titolo="Come si identificano"
            sottotitolo="Un registro alimentato solo da una riunione annuale invecchia fra una riunione e l’altra.">
            <p style={CFR_P}>
              I rischi entrano nel registro da sette fonti, tutte già presenti in Spot: gli incidenti
              registrati, i rilievi degli audit interni, le non conformità aperte, i reclami e le
              segnalazioni dei locali, l’ingresso di un nuovo fornitore che tratta dati per conto di
              Byup, ogni rilascio che tocca i pagamenti o la trasmissione fiscale, e gli aggiornamenti
              normativi rilevati nel riesame degli obblighi legali.
            </p>
            <p style={{...CFR_P, marginBottom:0}}>
              Un rischio si descrive per <strong>causa</strong>, non per conseguenza: «compromissione
              delle credenziali di un amministratore» e non «violazione di dati». Due rischi con lo
              stesso esito ma cause diverse richiedono controlli diversi, e se si classificano per
              esito finiscono nella stessa riga perdendo proprio l’informazione che serve a trattarli.
            </p>
          </CfrSezioneMet>

          <CfrSezioneMet n={4} titolo="La scala di probabilità"
            sottotitolo="Ancorata alla frequenza attesa, non alla sensazione di chi valuta.">
            <div style={{marginTop:4}}>
              {CFR_SCALA_PROB.map(v => <CfrRigaScala key={v.n} n={v.n} nome={CFR_PROB[v.n-1]} def={v.def}/>)}
            </div>
          </CfrSezioneMet>

          <CfrSezioneMet n={5} titolo="La scala di impatto"
            sottotitolo="Si assegna il valore della dimensione messa peggio, non la media fra le cinque.">
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:14}}>
              {CFR_DIMENSIONI.map(([k, v]) => (
                <span key={k} title={v} style={{fontSize:11.6, fontWeight:700, color:ADM.INK,
                  background:'rgba(49,53,61,0.07)', padding:'4px 9px', borderRadius:6}}>{k}</span>
              ))}
            </div>
            <div style={{fontSize:12.6, color:ADM.MUTED, lineHeight:1.6, marginBottom:12}}>
              {CFR_DIMENSIONI.map(([k, v]) => <div key={k}><strong style={{color:ADM.TEXT}}>{k}</strong> — {v}</div>)}
            </div>
            <div style={{marginTop:4}}>
              {CFR_SCALA_IMP.map(v => <CfrRigaScala key={v.n} n={v.n} nome={CFR_IMP[v.n-1]} def={v.def}/>)}
            </div>
          </CfrSezioneMet>

          <CfrSezioneMet n={6} titolo="Il livello e le fasce"
            sottotitolo="Livello = probabilità × impatto. Un numero che si può rifare a mano, non un voto.">
            <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden'}}>
              {CFR_FASCE.map((f, k) => (
                <div key={f.fascia} style={{display:'grid', gridTemplateColumns:'150px minmax(0,1fr)', gap:16,
                  padding:'13px 16px', alignItems:'baseline',
                  borderTop: k ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                  background: f.tono === 'alto' ? 'rgba(255,90,95,0.05)' : '#fff'}}>
                  <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                    <span style={{display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:6,
                      fontSize:11.8, fontWeight:800,
                      background: f.tono === 'alto' ? ADM.PINK : 'rgba(49,53,61,0.09)',
                      color: f.tono === 'alto' ? '#fff' : ADM.INK}}>{f.fascia}</span>
                    <span style={{fontSize:12.2, color:ADM.MUTED_SOFT, fontWeight:700,
                      fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{f.range}</span>
                  </div>
                  <div style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.55}}>{f.criterio}</div>
                </div>
              ))}
            </div>
            <p style={{...CFR_P, fontSize:12.6, color:ADM.MUTED_SOFT, margin:'10px 0 0'}}>
              I salti fra le soglie non sono arbitrari: su una scala 1-5 moltiplicata, i valori 7, 11,
              13 e 14 non esistono. Le fasce cadono negli spazi vuoti, così nessun livello resta a
              cavallo fra due giudizi.
            </p>
          </CfrSezioneMet>

          <CfrSezioneMet n={7} titolo="Trattamento e accettazione">
            <p style={CFR_P}>
              Per ogni rischio si sceglie una delle quattro strategie. <strong>Mitigare</strong>:
              introdurre controlli che abbassano probabilità o impatto. <strong>Trasferire</strong>:
              spostare l’onere su un terzo, con un contratto o una polizza — l’obbligo verso i propri
              clienti però non si trasferisce mai. <strong>Evitare</strong>: rinunciare all’attività
              che lo genera. <strong>Accettare</strong>: tenerlo così com’è, con una motivazione scritta.
            </p>
            <p style={{...CFR_P, marginBottom:0}}>
              Dopo il trattamento si rivaluta il <strong>rischio residuo</strong> con le stesse due
              scale. Il residuo non può superare l’inerente: se accade, una delle due valutazioni è
              sbagliata. Un residuo identico all’inerente è ammesso solo dichiarando che il rischio è
              accettato, non che è stato trattato. Chi accetta dipende dalla fascia, secondo la tabella
              del punto 6.
            </p>
          </CfrSezioneMet>

          <CfrSezioneMet n={8} titolo="Quando si riesamina">
            <p style={CFR_P}>
              Alla cadenza ordinaria di <strong>sei mesi</strong>, e fuori cadenza ogni volta che
              accade una di queste cose: un incidente che coinvolge il rischio, l’ingresso o
              l’uscita di un fornitore che tratta dati, una modifica architetturale rilevante, una
              non conformità che lo riguarda, un cambiamento normativo.
            </p>
            <p style={{...CFR_P, marginBottom:0}}>
              Il riesame richiede un <strong>esito scritto</strong>: che cosa è stato verificato e che
              cosa è cambiato. Una data che avanza senza una riga di motivazione non è evidenza di
              riesame, è evidenza che qualcuno ha premuto un pulsante.
            </p>
          </CfrSezioneMet>

          <CfrSezioneMet n={9} titolo="Legame con la Dichiarazione di Applicabilità">
            <p style={{...CFR_P, marginBottom:0}}>
              I controlli Annex A associati a ciascun rischio sono la giustificazione della loro
              inclusione nella Dichiarazione di Applicabilità: un controllo è applicabile perché
              tratta un rischio censito, ed è escluso perché nessun rischio lo richiede. Lo scarto fra
              livello inerente e residuo è la misura di quanto quel controllo sta effettivamente
              producendo — ed è la prima cosa che viene chiesta quando si difende una scelta di
              esclusione.
            </p>
          </CfrSezioneMet>

          <div style={{padding:'14px 16px', borderRadius:10, background:ADM.NEUTRAL_SOFT,
            fontSize:12.4, color:ADM.MUTED, lineHeight:1.6}}>
            La copia controllata e firmata di questo documento vive nel gestore documentale, insieme
            alla Dichiarazione di Applicabilità e alle politiche. Quella che stai leggendo è la
            versione in vigore, riportata qui perché si applica in questa schermata: se le due
            divergono, vale quella firmata.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modale del rischio ────────────────────────────────────────────────────
// Un solo componente per due gesti, perché i campi sono gli stessi: rilevare un
// rischio è compilare la valutazione la prima volta, riesaminarlo è rimetterci
// mano. Cambia cosa è obbligatorio e cosa resta scritto nello storico.
// ─── Modale del rischio ────────────────────────────────────────────────────
// Un solo componente per due gesti, perché i campi sono gli stessi: rilevare un
// rischio è compilare la valutazione la prima volta, riesaminarlo è rimetterci
// mano. Cambia cosa è obbligatorio e cosa resta scritto nello storico.
//
// I NUMERI NON SI SCELGONO, SI LEGGONO. Probabilità e impatto si scelgono per
// nome — «Possibile», «Critico» — perché è così che si ragiona e si discute in
// riunione. Il numero resta, ma come RISULTATO: compare nella pastiglia del
// livello, che è la stessa che si vede nella tabella e nella matrice.
const CFR_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };

// La freccia è disegnata a mano: la select di sistema ne mette una diversa per
// piattaforma e spezza l'allineamento con gli input accanto.
const CFR_SEL = { ...CFR_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };

const CFR_LAB  = { fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.05em', display:'block', marginBottom:6 };
const CFR_SEZ  = { fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:12 };
const CFR_AIUTO = { fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45 };

function CfrCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={CFR_LAB}>{etichetta}</label>
      {children}
      {aiuto && <div style={CFR_AIUTO}>{aiuto}</div>}
    </div>
  );
}

// Select su scala 1-5 che mostra i nomi. Il valore resta il numero.
function CfrScelta({ etichetta, voci, valore, onChange }) {
  return (
    <div style={{marginBottom:10}}>
      <label style={{...CFR_LAB, marginBottom:5}}>{etichetta}</label>
      <select value={valore} onChange={e=>onChange(parseInt(e.target.value, 10))} style={CFR_SEL}>
        {voci.map((v, k) => <option key={v} value={k + 1}>{v}</option>)}
      </select>
    </div>
  );
}

// Il livello calcolato, nella stessa veste che ha nella tabella e nella matrice.
function CfrEsito({ p, i }) {
  const liv = cfrLiv(p, i);
  const alta = cfrFascia(liv) === 'alto';
  return (
    <div style={{display:'flex', alignItems:'center', gap:9, marginTop:12, paddingTop:12,
      borderTop:`1px dashed ${ADM.BORDER}`}}>
      <span style={{display:'inline-flex', alignItems:'baseline', gap:6, padding:'4px 11px', borderRadius:8,
        background: alta ? ADM.PINK : 'rgba(49,53,61,0.09)', color: alta ? '#fff' : ADM.INK, flexShrink:0}}>
        <span style={{fontSize:19, fontWeight:800, letterSpacing:'-0.02em'}}>{liv}</span>
        <span style={{fontSize:11.5, fontWeight:700, opacity:0.75}}>{cfrFascia(liv)}</span>
      </span>
      <span style={{fontSize:11.6, color:ADM.MUTED_SOFT, lineHeight:1.35}}>
        {CFR_PROB[p-1]} × {CFR_IMP[i-1]}
      </span>
    </div>
  );
}

function CfrModaleRischio({ modo, rischio, onChiudi, onSalva }) {
  const nuovo = modo === 'nuovo';
  const [b, setB] = useStateCfr(() => ({
    titolo:        rischio ? rischio.titolo : '',
    categoria:     rischio ? rischio.categoria : 'informatico',
    responsabile:  rischio ? rischio.responsabile : '',
    prob:          rischio ? rischio.prob : 3,
    impatto:       rischio ? rischio.impatto : 3,
    residuoProb:   rischio ? rischio.residuoProb : 3,
    residuoImpatto:rischio ? rischio.residuoImpatto : 3,
    trattamento:   rischio ? rischio.trattamento : 'mitigare',
    stato:         rischio ? rischio.stato : 'nuovo',
    controlli:     rischio ? (rischio.controlli || []).join(', ') : '',
    misure:        rischio ? rischio.misure : '',
    nota:          '',
  }));
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));

  const livI = cfrLiv(b.prob, b.impatto);
  const livR = cfrLiv(b.residuoProb, b.residuoImpatto);
  // Nel riesame la nota è obbligatoria: un riesame senza una riga di esito è la
  // firma di cortesia che la norma non accetta come evidenza.
  const puoSalvare = nuovo
    ? b.titolo.trim().length > 2 && b.misure.trim().length > 2 && b.responsabile.trim().length > 1
    : b.nota.trim().length > 2;

  const storico = (rischio && rischio.riesami) || [];
  const cat = CFR_CATEGORIE.find(c => c.id === b.categoria) || {};

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="rischio" onClick={e=>e.stopPropagation()} style={{width:740, maxWidth:'92%', background:'#fff', borderRadius:16,
        boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>

        <div style={{padding:'20px 26px 16px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:17, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em'}}>
            {nuovo ? 'Rilevare un nuovo rischio' : `Riesame di ${rischio.id}`}
          </div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            {nuovo
              ? 'La valutazione va compilata adesso: un rischio censito senza probabilità, impatto e misure non è un rischio valutato.'
              : 'Correggi ciò che è cambiato e scrivi l’esito. La data di oggi diventa l’ultimo riesame e la nota resta nello storico.'}
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'flex', flexDirection:'column', gap:24}}>

          {/* 1 — che cosa può andare storto */}
          <div>
            <div style={CFR_SEZ}>Il rischio</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
              <CfrCampo etichetta="Descrizione" span>
                <input value={b.titolo} onChange={e=>agg('titolo', e.target.value)} style={CFR_INP}
                  placeholder="Che cosa può andare storto, in una riga"/>
              </CfrCampo>
              <CfrCampo etichetta="Categoria" aiuto={cat.nota}>
                <select value={b.categoria} onChange={e=>agg('categoria', e.target.value)} style={CFR_SEL}>
                  {CFR_CATEGORIE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </CfrCampo>
              <CfrCampo etichetta="Responsabile" aiuto="Chi risponde di questo rischio, non chi lo ha scritto">
                <input value={b.responsabile} onChange={e=>agg('responsabile', e.target.value)} style={CFR_INP}
                  placeholder="Nome e cognome"/>
              </CfrCampo>
            </div>
          </div>

          {/* 2 — la valutazione, per nome */}
          <div>
            <div style={CFR_SEZ}>Valutazione</div>
            <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, padding:'16px 18px', background:'#FCFCFD'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0}}>
                <div style={{paddingRight:20}}>
                  <div style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT}}>Inerente</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, marginBottom:12}}>
                    prima del trattamento
                  </div>
                  <CfrScelta etichetta="Probabilità" voci={CFR_PROB} valore={b.prob} onChange={v=>agg('prob', v)}/>
                  <CfrScelta etichetta="Impatto" voci={CFR_IMP} valore={b.impatto} onChange={v=>agg('impatto', v)}/>
                  <CfrEsito p={b.prob} i={b.impatto}/>
                </div>
                <div style={{paddingLeft:20, borderLeft:`1px solid ${ADM.BORDER}`}}>
                  <div style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT}}>Residuo</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, marginBottom:12}}>
                    dopo le misure attuate
                  </div>
                  <CfrScelta etichetta="Probabilità" voci={CFR_PROB} valore={b.residuoProb} onChange={v=>agg('residuoProb', v)}/>
                  <CfrScelta etichetta="Impatto" voci={CFR_IMP} valore={b.residuoImpatto} onChange={v=>agg('residuoImpatto', v)}/>
                  <CfrEsito p={b.residuoProb} i={b.residuoImpatto}/>
                </div>
              </div>

              <div style={{marginTop:14, paddingTop:12, borderTop:`1px solid ${ADM.BORDER}`,
                fontSize:12.4, lineHeight:1.5, color: livR > livI ? ADM.DANGER : ADM.MUTED}}>
                {livR > livI
                  ? 'Il residuo è più alto dell’inerente: un trattamento non aggrava un rischio. Uno dei due valori è sbagliato.'
                  : livR === livI
                    ? 'Livello invariato: se il trattamento non sposta nulla va spiegato nelle misure, oppure il rischio va accettato formalmente.'
                    : `Il trattamento vale −${livI - livR}: è questo scarto a rendere giustificabili i controlli nella Dichiarazione di Applicabilità.`}
              </div>
            </div>
          </div>

          {/* 3 — che cosa si fa */}
          <div>
            <div style={CFR_SEZ}>Trattamento</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
              <CfrCampo etichetta="Strategia">
                <select value={b.trattamento} onChange={e=>agg('trattamento', e.target.value)} style={CFR_SEL}>
                  {Object.entries(CFR_TRATT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </CfrCampo>
              <CfrCampo etichetta="Stato">
                <select value={b.stato} onChange={e=>agg('stato', e.target.value)} style={CFR_SEL}>
                  {Object.entries(CFR_STATO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </CfrCampo>
              <CfrCampo etichetta="Controlli Annex A" span
                aiuto="Separati da virgola. Sono i controlli che giustificherai nella Dichiarazione di Applicabilità.">
                <input value={b.controlli} onChange={e=>agg('controlli', e.target.value)} style={CFR_INP}
                  placeholder="A.5.15, A.8.13"/>
              </CfrCampo>
              <CfrCampo etichetta="Misure attuate" span>
                <textarea value={b.misure} onChange={e=>agg('misure', e.target.value)} rows={3}
                  style={{...CFR_INP, resize:'vertical'}}
                  placeholder="Che cosa è stato fatto concretamente per abbassare il livello"/>
              </CfrCampo>
            </div>
          </div>

          {/* 4 — solo nel riesame */}
          {!nuovo && (
            <div>
              <div style={CFR_SEZ}>Esito del riesame</div>
              <textarea value={b.nota} onChange={e=>agg('nota', e.target.value)} rows={3}
                style={{...CFR_INP, resize:'vertical'}}
                placeholder="Che cosa hai verificato e che cosa è cambiato dall’ultima volta"/>

              {storico.length > 0 && (
                <div style={{marginTop:18}}>
                  <div style={CFR_SEZ}>Riesami precedenti</div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {storico.slice().reverse().map((v, k) => (
                      <div key={k} style={{padding:'11px 13px', borderRadius:10, background:ADM.NEUTRAL_SOFT}}>
                        <div style={{display:'flex', alignItems:'baseline', gap:9, flexWrap:'wrap'}}>
                          <span style={{fontSize:12.6, fontWeight:700, color:ADM.TEXT}}>{cfFmt(v.data)}</span>
                          <span style={{fontSize:12.2, color:ADM.MUTED}}>{v.chi}</span>
                          <span style={{fontSize:11.4, color:ADM.MUTED_SOFT}}>
                            {CFR_PROB[v.prob-1]} × {CFR_IMP[v.impatto-1]} · residuo {cfrLiv(v.residuoProb, v.residuoImpatto)}
                          </span>
                        </div>
                        <div style={{fontSize:12.6, color:ADM.TEXT, marginTop:5, lineHeight:1.5}}>{v.nota}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{padding:'15px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:12, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {puoSalvare
              ? (nuovo ? 'Il rischio entra nel registro con la data di oggi come prima valutazione.'
                       : 'La data di oggi diventa l’ultimo riesame.')
              : (nuovo ? 'Servono almeno descrizione, responsabile e misure attuate.'
                       : 'Serve l’esito del riesame: senza, non è evidenza.')}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!puoSalvare} onClick={()=>onSalva(b)}>
            {nuovo ? 'Aggiungi al registro' : 'Registra il riesame'}
          </AdmButton>
        </div>
      </div>
    </div>
  );
}


// ─── Registro dei rischi ───────────────────────────────────────────────────
function CfRischi() {
  const [vista, setVista]     = useStateCfr('inerente');  // la matrice mostra prima o dopo il trattamento
  const [sel, setSel]         = useStateCfr(null);        // cella selezionata { p, i }
  const [cat, setCat]         = useStateCfr(null);        // categoria filtrata
  const [aperto, setAperto]   = useStateCfr(null);        // riga espansa
  const [modale, setModale]   = useStateCfr(null);        // { modo, rischio }
  const [metodo, setMetodo]   = useStateCfr(false);       // metodologia aperta
  const [, forza]             = useStateCfr(0);           // i dati sono mutati in place: qui si forza il render

  // La matrice conta sempre TUTTI i rischi: se contasse solo la categoria
  // filtrata, il filtro nasconderebbe proprio il quadro d'insieme che la
  // matrice esiste per dare.
  const celle = {};
  RISCHI.forEach(r => {
    const c = cfrCoord(r, vista);
    const k = c.p + '-' + c.i;
    (celle[k] = celle[k] || []).push(r);
  });

  // Solo le categorie che hanno almeno un rischio: un filtro che porta a zero
  // risultati è una promessa non mantenuta.
  const categorieVive = CFR_CATEGORIE
    .map(c => ({ ...c, n: RISCHI.filter(r => r.categoria === c.id).length }))
    .filter(c => c.n > 0);

  // Ordinamento per livello inerente decrescente: l'elenco deve aprirsi su ciò
  // che fa più male, non sull'ordine in cui i rischi sono stati scritti.
  const righe = RISCHI
    .filter(r => {
      if (cat && r.categoria !== cat) return false;
      if (!sel) return true;
      const c = cfrCoord(r, vista);
      return c.p === sel.p && c.i === sel.i;
    })
    .slice()
    .sort((a, b) => cfrLiv(b.prob, b.impatto) - cfrLiv(a.prob, a.impatto)
      || cfrLiv(b.residuoProb, b.residuoImpatto) - cfrLiv(a.residuoProb, a.residuoImpatto)
      || a.id.localeCompare(b.id));

  const salva = (b) => {
    const controlli = b.controlli.split(',').map(s => s.trim()).filter(Boolean);
    const oggi = new Date();
    if (modale.modo === 'nuovo') {
      const num = RISCHI.reduce((m, r) => Math.max(m, parseInt(r.id.slice(1), 10) || 0), 0) + 1;
      RISCHI.push({
        id: 'R' + String(num).padStart(2, '0'),
        titolo:b.titolo.trim(), categoria:b.categoria, responsabile:b.responsabile.trim(),
        prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto,
        trattamento:b.trattamento, stato:b.stato, controlli, misure:b.misure.trim(),
        // La rilevazione È la prima valutazione: datarla oggi è corretto, ed
        // evita che un rischio appena censito compaia subito come mai riesaminato.
        ultimoRiesame: oggi,
        riesami:[{ data:oggi, chi:'Marco Rinaldi', esito:'rilevato',
          nota:'Rischio rilevato e valutato per la prima volta.',
          prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto }],
      });
    } else {
      const r = modale.rischio;
      Object.assign(r, {
        titolo:b.titolo.trim(), categoria:b.categoria, responsabile:b.responsabile.trim(),
        prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto,
        trattamento:b.trattamento, stato:b.stato, controlli, misure:b.misure.trim(),
        ultimoRiesame: oggi,
      });
      r.riesami = (r.riesami || []).concat([{
        data:oggi, chi:'Marco Rinaldi', esito:'riesaminato', nota:b.nota.trim(),
        prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto,
      }]);
    }
    setModale(null);
    forza(n => n + 1);
  };

  // Niente colonna Annex A: la mappatura dei controlli è già nel dettaglio della
  // riga, e un registro non si scorre cercando «A.5.18» a occhio. La larghezza
  // recuperata va alla descrizione, che invece si legge.
  const GRID = 'minmax(0,2.2fr) 124px 148px 0.95fr 1.15fr 1.3fr 30px';

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Matrice */}
      <div>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
          <div style={{...CF_H, marginBottom:0}}>Matrice probabilità × impatto</div>
          {/* Solo lo stato del filtro, non l'istruzione per attivarlo: le celle
              piene sono già interattive al passaggio del mouse. */}
          {sel && (
            <span style={{fontSize:12.4, color:ADM.MUTED}}>
              filtro attivo: {CFR_PROB[sel.p-1]} × {CFR_IMP[sel.i-1]}
            </span>
          )}
          <div style={{flex:1}}/>
          {sel && <AdmButton variant="ghost" size="sm" onClick={()=>setSel(null)}>Togli il filtro</AdmButton>}
          {/* La metodologia sta qui e non in una tab propria: è il documento che
              spiega che cosa significano gli assi che si stanno guardando. */}
          <AdmButton variant="ghost" size="sm" onClick={()=>setMetodo(true)}>Metodologia</AdmButton>
          <AdmTabBar variant="segmented" active={vista} onChange={(v)=>{ setVista(v); setSel(null); }}
            tabs={[{ id:'inerente', label:'Inerente' }, { id:'residuo', label:'Residuo' }]}/>
        </div>

        <div style={{...CF_CARD, padding:'16px 18px'}}>
          <CfrMatrice celle={celle} sel={sel} onSel={setSel}/>
          <div style={{display:'flex', alignItems:'center', gap:16, marginTop:14, paddingTop:12,
            borderTop:`1px dashed ${ADM.BORDER_SOFT}`, flexWrap:'wrap'}}>
            {[['1-6 basso', cfrRampa(4)], ['8-12 medio', cfrRampa(10)], ['15-25 alto', ADM.PINK]].map(([lab, bg]) => (
              <span key={lab} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:11.8, color:ADM.MUTED}}>
                <span style={{width:22, height:12, borderRadius:3, background:bg, border:`1px solid ${ADM.BORDER}`}}/>{lab}
              </span>
            ))}
            <span style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>
              {vista === 'inerente'
                ? 'Posizione prima del trattamento: è la fotografia grezza, quella da cui discende la Dichiarazione di Applicabilità.'
                : 'Posizione dopo le misure attuate: lo scarto fra le due viste è la prova che il trattamento ha prodotto un effetto.'}
            </span>
          </div>
        </div>
      </div>

      {/* Elenco */}
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...CF_H, marginBottom:0}}>Registro dei rischi</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            {righe.length === RISCHI.length ? 'ordinati per livello inerente decrescente' : `${righe.length} su ${RISCHI.length} rischi`}
          </span>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setModale({ modo:'nuovo', rischio:null })}>
            Rileva un rischio
          </AdmButton>
        </div>

        {/* Filtro per categoria. Le pastiglie portano il conteggio: si vede
            quanto pesa una categoria prima ancora di cliccarla. */}
        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:10}}>
          {[{ id:null, label:'Tutte', n:RISCHI.length }].concat(categorieVive).map(c => {
            const attiva = cat === c.id;
            return (
              <button key={c.id || 'tutte'} onClick={()=>setCat(c.id)}
                style={{padding:'5px 11px', borderRadius:999, fontFamily:'inherit', fontSize:12.4,
                  fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6,
                  border:`1px solid ${attiva ? ADM.TEXT : ADM.BORDER}`,
                  background: attiva ? ADM.TEXT : '#fff', color: attiva ? '#fff' : ADM.TEXT}}
                title={c.nota || undefined}>
                {c.label}
                <span style={{fontSize:11.2, fontWeight:700, opacity: attiva ? 0.75 : 0.5}}>{c.n}</span>
              </button>
            );
          })}
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:GRID, gap:10}}>
            <div>Rischio</div><div>Inerente</div><div>Residuo</div><div>Trattamento</div>
            <div>Responsabile</div><div>Stato</div><div/>
          </div>

          {/* I due filtri si sommano: categoria e cella possono non avere
              intersezione, e allora va detto quale dei due togliere. */}
          {righe.length === 0 && (
            <div style={{padding:'26px 16px', textAlign:'center'}}>
              <div style={{fontSize:13.4, color:ADM.TEXT, fontWeight:600}}>Nessun rischio con questi filtri</div>
              <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:4}}>
                {cat && sel
                  ? `Nessun rischio della categoria ${cfrCatLabel(cat)} sta nella cella ${CFR_PROB[sel.p-1]} × ${CFR_IMP[sel.i-1]}.`
                  : cat ? `La categoria ${cfrCatLabel(cat)} non ha rischi.` : 'La cella selezionata è vuota.'}
              </div>
            </div>
          )}

          {righe.map((r, idx) => {
            const livI = cfrLiv(r.prob, r.impatto);
            const livR = cfrLiv(r.residuoProb, r.residuoImpatto);
            const delta = livI - livR;
            const st = CFR_STATO[r.stato] || { tono:'NEUTRAL', label:r.stato };
            const espanso = aperto === r.id;
            const ultimo = idx === righe.length - 1;
            return (
              <div key={r.id} style={{borderBottom: !ultimo || espanso ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div className="adm-row-open" onClick={()=>setAperto(espanso ? null : r.id)}
                  style={{display:'grid', gridTemplateColumns:GRID, gap:10, alignItems:'center',
                    padding:'12px 16px', cursor:'pointer',
                    background: espanso ? ADM.PANEL_SOFT : !r.ultimoRiesame ? '#FFFBFB' : '#fff'}}>
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex', alignItems:'baseline', gap:7}}>
                      <span style={{fontSize:11.2, fontWeight:700, color:ADM.MUTED_SOFT,
                        fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{r.id}</span>
                      <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, lineHeight:1.3}}>{r.titolo}</span>
                    </div>
                    <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:3}}>{cfrCatLabel(r.categoria)}</div>
                  </div>

                  <div><CfrLivello p={r.prob} i={r.impatto} forte/></div>

                  <div>
                    <CfrLivello p={r.residuoProb} i={r.residuoImpatto}
                      nota={delta > 0 ? `−${delta}` : r.trattamento === 'accettare' ? 'accettato' : 'invariato'}
                      notaTono={delta > 0 ? ADM.OK : r.trattamento === 'accettare' ? ADM.MUTED_SOFT : ADM.WARN}/>
                  </div>

                  <div style={{fontSize:12.8, color:ADM.TEXT, fontWeight:600}}>{CFR_TRATT[r.trattamento] || r.trattamento}</div>

                  <div style={{fontSize:12.6, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.responsabile}</div>

                  <div>
                    <CfPill tono={st.tono}>{st.label}</CfPill>
                    <div style={{fontSize:11.4, marginTop:4, whiteSpace:'nowrap',
                      color: r.ultimoRiesame ? ADM.MUTED : ADM.DANGER, fontWeight: r.ultimoRiesame ? 500 : 700}}>
                      {r.ultimoRiesame ? `riesame ${cfFmt(r.ultimoRiesame)}` : 'mai riesaminato'}
                    </div>
                  </div>

                  <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
                </div>

                {espanso && (
                  <div style={{padding:'16px 18px', background:ADM.PANEL_SOFT}}>
                    <div style={{display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(0,1.25fr)', gap:24}}>
                      <div>
                        <div style={{fontSize:11.2, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700}}>
                          Misure attuate
                        </div>
                        <div style={{fontSize:13.2, color:ADM.TEXT, lineHeight:1.6, marginTop:5}}>{r.misure}</div>

                        <div style={{fontSize:11.2, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em',
                          fontWeight:700, marginTop:14}}>Controlli Annex A applicati</div>
                        <div style={{marginTop:6}}><CfrChips items={r.controlli}/></div>

                        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.55, marginTop:14,
                          paddingTop:12, borderTop:`1px dashed ${ADM.BORDER}`}}>
                          {delta > 0
                            ? `Il trattamento porta il livello da ${livI} a ${livR}: è questo scarto che rende il controllo giustificabile nella Dichiarazione di Applicabilità.`
                            : r.trattamento === 'accettare'
                              ? `Livello invariato a ${livI} per scelta: il rischio è accettato formalmente, con il razionale scritto sopra e il responsabile che lo sottoscrive.`
                              : `Livello invariato a ${livI} nonostante il trattamento dichiarato: o le misure non sono ancora efficaci, o la valutazione va rifatta.`}
                        </div>
                      </div>

                      <div>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:12}}>
                          <CfrVoce k="Categoria" v={cfrCatLabel(r.categoria)}/>
                          <CfrVoce k="Trattamento" v={CFR_TRATT[r.trattamento] || r.trattamento}/>
                          <CfrVoce k="Responsabile" v={r.responsabile}/>
                          <CfrVoce k="Stato" v={st.label}/>
                          <CfrVoce k="Inerente" v={`${livI} · ${r.prob} × ${r.impatto}`}/>
                          <CfrVoce k="Residuo" v={`${livR} · ${r.residuoProb} × ${r.residuoImpatto}`}/>
                          <CfrVoce k="Ultimo riesame"
                            v={r.ultimoRiesame ? `${cfFmt(r.ultimoRiesame)} · ${cfrQuandoFa(r.ultimoRiesame)}` : 'mai riesaminato'}
                            tono={r.ultimoRiesame ? null : 'DANGER'}/>
                          <CfrVoce k="Cadenza" v="ogni 6 mesi"/>
                        </div>
                        <div style={{display:'flex', justifyContent:'flex-end', marginTop:16}}>
                          <AdmButton variant="secondary" size="sm" onClick={()=>setModale({ modo:'riesame', rischio:r })}>Riesamina</AdmButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.55}}>
          Il riesame non è una firma di cortesia: è la verifica che probabilità, impatto e misure
          siano ancora quelli di sei mesi fa. Un rischio senza data di riesame vale come non valutato.
        </div>
      </div>

      {/* La chiave forza il rimontaggio a ogni apertura: la bozza della modale
          nasce da useState(init), che gira SOLO al mount. Senza, passare da un
          rischio all'altro riproporrebbe i valori del precedente. */}
      {modale && (
        <CfrModaleRischio key={`${modale.modo}:${modale.rischio ? modale.rischio.id : 'nuovo'}`}
          modo={modale.modo} rischio={modale.rischio}
          onChiudi={()=>setModale(null)} onSalva={salva}/>
      )}

      {metodo && <CfrMetodologia onChiudi={()=>setMetodo(false)}/>}
    </div>
  );
}

// ─── Registro dei fornitori ────────────────────────────────────────────────
// Ridotto a ciò che un auditor chiede davvero: chi è, che servizio rende, se
// esiste il contratto sul trattamento e da quando, e quando l'avete riguardato.
// Dati trattati, paese e certificazioni restano nel dettaglio della riga: sono
// informazioni che si leggono quando si apre un fornitore, non che si scorrono.
// La criticità è sparita del tutto — era un giudizio nostro su una scala
// inventata, e non alimentava nessuna decisione.

const CFR_DPA_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };

// Modale del DPA: una sola, due modi. Se il documento c'è si legge, se manca si
// carica — è lo stesso oggetto visto da due stati diversi.
function CfrModaleDpa({ fornitore, modo, onChiudi, onSalva }) {
  const vedi = modo === 'vedi';
  const [file, setFile] = useStateCfr(null);
  const [data, setData] = useStateCfr('');
  const puoSalvare = !!file && !!data;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="dpa" onClick={e=>e.stopPropagation()} style={{width:560, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>

        <div style={{padding:'20px 24px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>
            {vedi ? 'Accordo sul trattamento dei dati' : `Caricare il DPA di ${fornitore.nome}`}
          </div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            {vedi
              ? `${fornitore.nome} · ${fornitore.id}`
              : 'L’art. 28 del GDPR lo pretende per chiunque tratti dati personali per conto di Byup, e A.5.20 chiede che i requisiti di sicurezza siano scritti nel contratto.'}
          </div>
        </div>

        <div style={{padding:'20px 24px 22px', overflowY:'auto', flex:1, minHeight:0}}>
          {vedi ? (
            <React.Fragment>
              <div style={{display:'flex', alignItems:'center', gap:13, padding:'15px 16px', borderRadius:12,
                border:`1px solid ${ADM.BORDER}`, background:'#FCFCFD'}}>
                <div style={{width:38, height:46, borderRadius:5, background:'#fff', flexShrink:0,
                  border:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <BuIcons.paperclip size={17} color={ADM.MUTED_SOFT}/>
                </div>
                <div style={{minWidth:0, flex:1}}>
                  <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, wordBreak:'break-all'}}>
                    {String(fornitore.doc).split('/').pop()}
                  </div>
                  <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:3, wordBreak:'break-all'}}>{fornitore.doc}</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16, marginTop:18}}>
                <CfrVoce k="Firmato il" v={cfFmt(fornitore.dpaFirmatoIl)}/>
                <CfrVoce k="Ultimo riesame"
                  v={fornitore.ultimoRiesame ? cfFmt(fornitore.ultimoRiesame) : 'mai riesaminato'}
                  tono={fornitore.ultimoRiesame ? null : 'WARN'}/>
              </div>
              <div style={{marginTop:18, padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT,
                fontSize:12.4, color:ADM.MUTED, lineHeight:1.6}}>
                Il file vive nel gestore documentale, non in Spot: qui c’è il riferimento e la data,
                che è ciò che il registro deve dimostrare. La copia firmata si apre su Drive.
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <label style={{display:'block', marginBottom:16}}>
                <span style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.05em', display:'block', marginBottom:6}}>Documento firmato</span>
                <div className="adm-card-interactive" style={{border:`1.5px dashed ${file ? ADM.OK : ADM.BORDER}`,
                  borderRadius:11, padding:'20px 16px', textAlign:'center', cursor:'pointer',
                  background: file ? ADM.OK_SOFT : '#FCFCFD'}}>
                  <div style={{fontSize:13.4, fontWeight:700, color: file ? ADM.OK : ADM.TEXT}}>
                    {file ? file : 'Scegli il file del DPA'}
                  </div>
                  <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:4}}>
                    {file ? 'verrà archiviato in Fornitori/' + fornitore.nome : 'PDF firmato dalle due parti'}
                  </div>
                  <input type="file" style={{display:'none'}}
                    onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0].name : null)}/>
                </div>
              </label>

              <label style={{display:'block'}}>
                <span style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.05em', display:'block', marginBottom:6}}>Data della firma</span>
                <input type="date" value={data} onChange={e=>setData(e.target.value)} style={CFR_DPA_INP}/>
                <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>
                  È la data che conta in sede di verifica: dice da quando il trattamento è coperto.
                </div>
              </label>
            </React.Fragment>
          )}
        </div>

        <div style={{padding:'14px 24px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {vedi ? '' : puoSalvare ? 'Il fornitore risulterà coperto da accordo.' : 'Servono il file e la data della firma.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>{vedi ? 'Chiudi' : 'Annulla'}</AdmButton>
          {vedi
            ? <AdmButton variant="primary" size="sm" onClick={onChiudi}>Apri su Drive</AdmButton>
            : <AdmButton variant="primary" size="sm" disabled={!puoSalvare}
                onClick={()=>onSalva({ file, data })}>Registra il DPA</AdmButton>}
        </div>
      </div>
    </div>
  );
}

// Campo etichettato della scheda fornitore. A livello di MODULO, mai dentro il
// componente: un sotto-componente dichiarato nel corpo di un altro è una
// funzione nuova a ogni render, React lo rimonta e l'input perde il fuoco a
// ogni carattere digitato.
function CfrCampoF({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.05em', display:'block', marginBottom:6}}>{etichetta}</label>
      {children}
      {aiuto && <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{aiuto}</div>}
    </div>
  );
}

// Nuovo fornitore. Chiede tutto quello che il registro deve poter mostrare: se
// si potesse aggiungere un nome e basta, il registro nascerebbe già incompleto.
function CfrModaleFornitore({ onChiudi, onSalva }) {
  const [b, setB] = useStateCfr({
    nome:'', servizio:'', dati:'', paese:'', certificazioni:'',
    dpa:false, doc:'', dpaFirmatoIl:'',
  });
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const puoSalvare = b.nome.trim().length > 1 && b.servizio.trim().length > 2 && b.dati.trim().length > 2;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="fornitore" onClick={e=>e.stopPropagation()} style={{width:680, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>

        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>Aggiungere un fornitore</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            Va censito chiunque tratti dati per conto di Byup, anche quando il servizio sembra
            marginale: è l’elenco che dimostra di sapere a chi sono stati dati i dati.
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16, alignContent:'start'}}>
          <CfrCampoF etichetta="Fornitore">
            <input value={b.nome} onChange={e=>agg('nome', e.target.value)} style={CFR_DPA_INP}
              placeholder="Ragione sociale o nome del servizio"/>
          </CfrCampoF>
          <CfrCampoF etichetta="Paese di elaborazione" aiuto="Fuori dall’Unione serve una base per il trasferimento">
            <input value={b.paese} onChange={e=>agg('paese', e.target.value)} style={CFR_DPA_INP}
              placeholder="Italia · UE, oppure USA · SCC"/>
          </CfrCampoF>
          <CfrCampoF etichetta="Servizio reso" span>
            <input value={b.servizio} onChange={e=>agg('servizio', e.target.value)} style={CFR_DPA_INP}
              placeholder="Che cosa fa per Byup"/>
          </CfrCampoF>
          <CfrCampoF etichetta="Dati trattati" span
            aiuto="Di chi sono e di che tipo: è la domanda da cui parte ogni verifica sui fornitori.">
            <input value={b.dati} onChange={e=>agg('dati', e.target.value)} style={CFR_DPA_INP}
              placeholder="Quali dati passano da lui"/>
          </CfrCampoF>
          <CfrCampoF etichetta="Certificazioni" span aiuto="Separate da virgola. Lasciare vuoto se non ne dichiara.">
            <input value={b.certificazioni} onChange={e=>agg('certificazioni', e.target.value)} style={CFR_DPA_INP}
              placeholder="ISO 27001, SOC 2 Type II"/>
          </CfrCampoF>

          <div style={{gridColumn:'1 / -1', border:`1px solid ${ADM.BORDER}`, borderRadius:12,
            padding:'14px 16px', background:'#FCFCFD'}}>
            <label style={{display:'flex', alignItems:'center', gap:9, cursor:'pointer'}}>
              <input type="checkbox" checked={b.dpa} onChange={e=>agg('dpa', e.target.checked)}
                style={{width:16, height:16, accentColor:ADM.PINK, cursor:'pointer'}}/>
              <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>Il DPA è già firmato</span>
            </label>
            {b.dpa ? (
              <div style={{display:'grid', gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)', gap:12, marginTop:13}}>
                <input value={b.doc} onChange={e=>agg('doc', e.target.value)} style={CFR_DPA_INP}
                  placeholder="Nome del file, es. DPA-2026.pdf"/>
                <input type="date" value={b.dpaFirmatoIl} onChange={e=>agg('dpaFirmatoIl', e.target.value)} style={CFR_DPA_INP}/>
              </div>
            ) : (
              <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:9, lineHeight:1.5}}>
                Il fornitore entra segnalato in rosso e in cima all’elenco, e ci resta finché il
                documento non viene caricato. È corretto così: senza accordo il trattamento è scoperto.
              </div>
            )}
          </div>
        </div>

        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {puoSalvare ? 'Entra nel registro come mai riesaminato.' : 'Servono fornitore, servizio e dati trattati.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!puoSalvare} onClick={()=>onSalva(b)}>
            Aggiungi al registro
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

function CfFornitori() {
  const [aperto, setAperto]     = useStateCfr(null);
  const [conferma, setConferma] = useStateCfr(null);
  const [dpa, setDpa]           = useStateCfr(null);   // { fornitore, modo }
  const [nuovo, setNuovo]       = useStateCfr(false);
  const [, forza]               = useStateCfr(0);

  // I problemi vanno in cima: un fornitore senza contratto non può stare in
  // fondo alla lista solo perché la lista è in ordine alfabetico.
  const peso = (f) => (f.dpa ? 0 : 2) + (f.ultimoRiesame ? 0 : 1);
  const righe = FORNITORI.slice().sort((a, b) => peso(b) - peso(a) || a.nome.localeCompare(b.nome));

  const confermaFornitore = () => {
    if (!conferma) return;
    conferma.ultimoRiesame = new Date();
    conferma.esito = 'confermato';
    setConferma(null);
    forza(n => n + 1);
  };

  const salvaDpa = ({ file, data }) => {
    const f = dpa.fornitore;
    f.dpa = true;
    f.doc = `Drive · Fornitori/${f.nome}/${file}`;
    f.dpaFirmatoIl = new Date(data + 'T12:00:00');
    setDpa(null);
    forza(n => n + 1);
  };

  const salvaFornitore = (b) => {
    const num = FORNITORI.reduce((m, f) => Math.max(m, parseInt(f.id.slice(1), 10) || 0), 0) + 1;
    FORNITORI.push({
      id: 'F' + String(num).padStart(2, '0'),
      nome:b.nome.trim(), servizio:b.servizio.trim(), dati:b.dati.trim(),
      paese:b.paese.trim() || '—',
      certificazioni: b.certificazioni.split(',').map(s => s.trim()).filter(Boolean),
      dpa: b.dpa,
      dpaFirmatoIl: b.dpa && b.dpaFirmatoIl ? new Date(b.dpaFirmatoIl + 'T12:00:00') : null,
      doc: b.dpa && b.doc.trim() ? `Drive · Fornitori/${b.nome.trim()}/${b.doc.trim()}` : null,
      ultimoRiesame:null, esito:null,
    });
    setNuovo(false);
    forza(n => n + 1);
  };

  const GRID = 'minmax(0,1.5fr) minmax(0,2fr) minmax(0,1.75fr) 1fr 1.15fr 30px';

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:12, position:'relative'}}>

      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <AdmButton variant="primary" size="sm" onClick={()=>setNuovo(true)}>Aggiungi un fornitore</AdmButton>
      </div>

      <div>
        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:GRID, gap:10}}>
            <div>Fornitore</div><div>Servizio</div><div>DPA</div><div>Firmato il</div>
            <div>Ultimo riesame</div><div/>
          </div>

          {righe.map((f, idx) => {
            const espanso = aperto === f.id;
            const ultimo = idx === righe.length - 1;
            const extraUe = /SCC/.test(f.paese || '');
            const problema = !f.dpa || !f.ultimoRiesame;
            const nota = !f.dpa && !f.ultimoRiesame
              ? 'Nessun accordo sul trattamento e nessun riesame: oggi questo fornitore è fuori controllo sulla carta, qualunque cosa faccia in pratica.'
              : !f.dpa
                ? 'Nessun accordo sul trattamento dei dati: l’art. 28 GDPR lo pretende per chiunque tratti dati per conto di Byup, e A.5.20 chiede che i requisiti di sicurezza siano scritti nel contratto.'
                : 'Mai riesaminato: A.5.22 chiede di verificare periodicamente che servizio, dati trattati e certificazioni siano ancora quelli concordati.';
            return (
              <div key={f.id} style={{borderBottom: !ultimo || espanso ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div className="adm-row-open" onClick={()=>setAperto(espanso ? null : f.id)}
                  style={{padding:'12px 16px', cursor:'pointer',
                    background: espanso ? ADM.PANEL_SOFT : problema ? '#FFFBFB' : '#fff'}}>
                  <div style={{display:'grid', gridTemplateColumns:GRID, gap:10, alignItems:'center'}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{f.nome}</div>
                      <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2,
                        fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{f.id}</div>
                    </div>

                    <div style={{fontSize:12.4, color:ADM.TEXT, lineHeight:1.4}}>{f.servizio}</div>

                    {/* Il documento è l'oggetto della colonna, non uno stato da
                        leggere: se c'è si apre, se manca si carica. */}
                    <div style={{minWidth:0}} onClick={e=>e.stopPropagation()}>
                      {f.dpa && f.doc ? (
                        <button onClick={()=>setDpa({ fornitore:f, modo:'vedi' })}
                          className="adm-card-interactive"
                          style={{display:'inline-flex', alignItems:'center', gap:7, maxWidth:'100%',
                            padding:'5px 10px', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                            border:`1px solid ${ADM.BORDER}`, background:'#fff'}}>
                          <BuIcons.paperclip size={13} color={ADM.MUTED_SOFT}/>
                          <span style={{fontSize:12.2, fontWeight:600, color:ADM.TEXT, overflow:'hidden',
                            whiteSpace:'nowrap', textOverflow:'ellipsis'}}>
                            {String(f.doc).split('/').pop()}
                          </span>
                        </button>
                      ) : (
                        <AdmButton variant="secondary" size="sm"
                          onClick={()=>setDpa({ fornitore:f, modo:'carica' })} style={{fontSize:12}}>
                          Carica il DPA
                        </AdmButton>
                      )}
                    </div>

                    <div style={{fontSize:12.6, color: f.dpaFirmatoIl ? ADM.TEXT : ADM.DANGER,
                      fontWeight: f.dpaFirmatoIl ? 500 : 700}}>
                      {f.dpaFirmatoIl ? cfFmt(f.dpaFirmatoIl) : 'assente'}
                    </div>

                    <div>
                      {f.ultimoRiesame ? (
                        <React.Fragment>
                          <div style={{fontSize:12.6, color:ADM.TEXT}}>{cfFmt(f.ultimoRiesame)}</div>
                          <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2}}>{cfrQuandoFa(f.ultimoRiesame)}</div>
                        </React.Fragment>
                      ) : (
                        <div style={{fontSize:12.6, color:ADM.WARN, fontWeight:700}}>mai</div>
                      )}
                    </div>

                    <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
                  </div>

                  {problema && (
                    <div style={{display:'flex', alignItems:'flex-start', gap:8, marginTop:9, padding:'8px 11px',
                      borderRadius:8, background: !f.dpa ? ADM.DANGER_SOFT : ADM.WARN_SOFT}}>
                      <span style={{width:6, height:6, borderRadius:'50%', marginTop:5, flexShrink:0,
                        background: !f.dpa ? ADM.DANGER : ADM.WARN}}/>
                      <span style={{fontSize:12, lineHeight:1.5, color: !f.dpa ? '#7F1D1D' : '#78350F'}}>{nota}</span>
                    </div>
                  )}
                </div>

                {espanso && (
                  <div style={{padding:'16px 18px', background:ADM.PANEL_SOFT}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
                      <CfrVoce k="Fornitore" v={`${f.nome} · ${f.id}`}/>
                      <CfrVoce k="Servizio" v={f.servizio}/>
                      <CfrVoce k="Paese di elaborazione" v={extraUe ? `${f.paese} · trasferimento extra-UE` : f.paese}/>
                      <CfrVoce k="Certificazioni" v={(f.certificazioni || []).join(' · ') || '—'}/>
                      <CfrVoce k="Dati trattati" v={f.dati} span/>
                      <CfrVoce k="Accordo sul trattamento"
                        v={f.dpa ? `firmato il ${cfFmt(f.dpaFirmatoIl)}` : 'assente'}
                        tono={f.dpa ? null : 'DANGER'}/>
                      <CfrVoce k="Documento" v={f.doc || 'nessun documento collegato'} tono={f.doc ? null : 'WARN'}/>
                      <CfrVoce k="Ultimo riesame"
                        v={f.ultimoRiesame ? `${cfFmt(f.ultimoRiesame)} · esito ${f.esito || '—'}` : 'mai riesaminato'}
                        tono={f.ultimoRiesame ? null : 'WARN'}/>
                    </div>
                    <div style={{display:'flex', justifyContent:'flex-end', marginTop:16}}>
                      <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(f)}>Riesamina</AdmButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.55}}>
          Il registro dei fornitori non serve a elencare chi vi fattura: serve a dimostrare di sapere
          a chi sono stati affidati i dati, con quale contratto e da quando.
        </div>
      </div>

      {nuovo && <CfrModaleFornitore onChiudi={()=>setNuovo(false)} onSalva={salvaFornitore}/>}
      {dpa && <CfrModaleDpa key={dpa.fornitore.id + dpa.modo} fornitore={dpa.fornitore} modo={dpa.modo}
        onChiudi={()=>setDpa(null)} onSalva={salvaDpa}/>}

      {/* Popup conferma fornitore */}
      {conferma && (
        <div onClick={()=>setConferma(null)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:500, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Confermare {conferma.nome} come fornitore?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Stai attestando che servizio, dati trattati, certificazioni e paese di elaborazione
              sono ancora quelli scritti nel registro. La data di oggi diventa l&rsquo;ultimo riesame e
              fa ripartire la cadenza annuale.
            </div>
            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16}}>
              {[
                ['Servizio', conferma.servizio],
                ['Dati trattati', conferma.dati],
                ['Accordo', conferma.dpa ? `firmato il ${cfFmt(conferma.dpaFirmatoIl)}` : 'assente'],
                ['Riesame precedente', conferma.ultimoRiesame ? cfFmt(conferma.ultimoRiesame) : 'mai eseguito'],
              ].map(([k, v]) => (
                <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
                  <span style={{color:ADM.MUTED, width:132, flexShrink:0}}>{k}</span>
                  <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(null)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={confermaFornitore}>Registra il riesame</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CfRischi = CfRischi;
window.CfFornitori = CfFornitori;

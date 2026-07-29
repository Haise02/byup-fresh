// Conformità · eventi — incidenti (ISO/IEC 27001 A.5.24–5.28) e non conformità
// con azioni correttive (ISO 9001 §10.2).
//
// Due registri, due orologi:
//  · l'incidente diventa un obbligo di legge quando è una violazione di dati
//    personali: da quel momento corrono 72 ore verso il Garante (art. 33 GDPR).
//  · la non conformità non si chiude con l'azione correttiva, si chiude con la
//    VERIFICA DI EFFICACIA. È il passaggio che quasi tutti saltano ed è il
//    rilievo più frequente sulla §10.2.
//
// Le primitive (cfFmt, CfPill, CF_CARD, …) arrivano da admin-conformita.jsx,
// i dati da admin-conformita-data.jsx: qui non si duplica niente.

const { useState: useStateEv, useEffect: useEffectEv } = React;

// ─── Primitive locali ──────────────────────────────────────────────────────
const CF_EV_LBL = { fontSize:11.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
  letterSpacing:'0.05em', marginBottom:4 };
const CF_EV_VAL = { fontSize:13, color:ADM.TEXT, lineHeight:1.5 };
const CF_EV_VUOTO = { fontSize:13, color:ADM.WARN, fontWeight:700 };
// Un bottone dentro una riga di tabella deve stare nella densità della riga:
// l'atomo nasce per le barre azioni, qui va riportato alla scala del corpo.
const CF_EV_BTN = { fontSize:12.6, padding:'5px 11px' };

function CfEvStat({ n, label, nota, tono }) {
  const col = (!n || !tono || tono === 'INK') ? ADM.TEXT : CF_TONO(tono);
  return (
    <div style={{...CF_CARD, padding:'14px 16px'}}>
      <div style={{fontSize:24, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1, color:col}}>{n}</div>
      <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:6, lineHeight:1.35}}>{label}</div>
      {nota && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:4, lineHeight:1.4}}>{nota}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INCIDENTI — ISO/IEC 27001 A.5.24–5.28
   ═══════════════════════════════════════════════════════════════════════════ */

const CF_EV_ORE_BREACH = 72;

// Durata leggibile: sotto la giornata i minuti contano davvero, perché è la
// differenza fra notificare in tempo e dover motivare il ritardo.
function cfEvOre(h) {
  const t = Math.max(0, Math.abs(h || 0));
  const ore = Math.floor(t);
  const min = Math.floor((t - ore) * 60);
  if (ore === 0) return `${min} min`;
  return min > 0 ? `${ore} h ${min} min` : `${ore} h`;
}

// L'orologio delle 72 ore. Parte dalla SCOPERTA, non dalla chiusura: è il
// momento in cui il titolare viene a conoscenza della violazione.
// Se la notifica è già partita si guarda quanto ci è voluto; se non è partita
// si guarda quanto resta — ed è un countdown vero, non un'etichetta.
function cfEvBreach(inc) {
  if (!inc || !inc.dataBreach) return null;
  const scoperta = inc.data;
  const limite = new Date(scoperta.getTime() + CF_EV_ORE_BREACH * 3600000);

  if (inc.breachNotificato && inc.breachNotificaIl) {
    const ore = (inc.breachNotificaIl.getTime() - scoperta.getTime()) / 3600000;
    const inTempo = ore <= CF_EV_ORE_BREACH;
    return { notificato:true, inTempo, limite, ore, margine: CF_EV_ORE_BREACH - ore,
      pct: Math.max(2, Math.min(100, (ore / CF_EV_ORE_BREACH) * 100)),
      tono: inTempo ? 'OK' : 'DANGER' };
  }

  const trascorse = (Date.now() - scoperta.getTime()) / 3600000;
  const restanti = CF_EV_ORE_BREACH - trascorse;
  return { notificato:false, limite, ore:trascorse, restanti, scaduto: restanti < 0,
    pct: Math.max(2, Math.min(100, (trascorse / CF_EV_ORE_BREACH) * 100)),
    tono: restanti <= 24 ? 'DANGER' : 'WARN' };
}

function CfEvBadgeBreach() {
  return (
    <span style={{display:'inline-flex', alignItems:'center', fontSize:10.5, fontWeight:800,
      letterSpacing:'0.04em', padding:'2px 6px', borderRadius:5, whiteSpace:'nowrap',
      background:ADM.DANGER_SOFT, color:ADM.DANGER}}>DATA BREACH</span>
  );
}

// Un incidente aperto senza causa radice o senza azione correttiva è un buco:
// sono esattamente i due campi che l'auditor cerca in A.5.27.
function cfEvMancanti(i) {
  if (!i || i.stato === 'chiuso') return [];
  const out = [];
  if (!i.causaRadice) out.push('causa radice');
  if (!i.azione) out.push('azione correttiva');
  return out;
}

const cfEvTonoGravita = (g) => g === 'alta' ? 'DANGER' : g === 'media' ? 'WARN' : 'NEUTRAL';

const CF_EV_GRID_INC = '96px 88px minmax(0,2.3fr) minmax(0,1.25fr) 76px 100px 98px minmax(0,1.15fr) 26px';

// ─── Tipologia degli incidenti ─────────────────────────────────────────────
// NON coincide con le categorie del registro dei rischi, ed è giusto così: un
// rischio si classifica per CAUSA («compromissione delle credenziali»), un
// incidente per CIÒ CHE È SUCCESSO («accesso non autorizzato»). Lo stesso
// evento può nascere da cause diverse, e le stesse cause producono eventi
// diversi: forzare una tassonomia sola farebbe perdere l'una o l'altra lettura.
const CF_EV_CAT = [
  { id:'dati',           label:'Violazione di dati personali', nota:'Dati personali visti, persi o esposti a chi non doveva' },
  { id:'accesso',        label:'Accesso non autorizzato',      nota:'Qualcuno è entrato, o ci ha provato, dove non poteva' },
  { id:'indisponibilita',label:'Indisponibilità del servizio', nota:'Il servizio si è fermato o degradato' },
  { id:'errore',         label:'Errore umano o di configurazione', nota:'Una persona ha sbagliato, o una configurazione era errata' },
  { id:'guasto',         label:'Guasto tecnico',               nota:'Un componente ha smesso di funzionare' },
  { id:'malware',        label:'Codice malevolo',              nota:'Malware, ransomware, dipendenza compromessa' },
  { id:'phishing',       label:'Phishing o ingegneria sociale',nota:'Tentativo di farsi consegnare credenziali o denaro' },
  { id:'dispositivo',    label:'Perdita o furto di dispositivo', nota:'Portatile, telefono o supporto smarrito' },
  { id:'fornitore',      label:'Incidente presso un fornitore',nota:'È successo da loro, ma i dati o il servizio sono tuoi' },
  { id:'policy',         label:'Violazione di policy interna', nota:'Una regola interna non è stata rispettata' },
];
const cfEvCatLabel = (id) => (CF_EV_CAT.find(c => c.id === id) || {}).label || '—';

const CF_EV_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };
const CF_EV_SEL = { ...CF_EV_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };
const CF_EV_SEZ = { fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:12 };

// A livello di modulo: dentro il componente verrebbe rimontato a ogni render e
// gli input perderebbero il fuoco a ogni carattere.
function CfEvCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.05em', display:'block', marginBottom:6}}>{etichetta}</label>
      {children}
      {aiuto && <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{aiuto}</div>}
    </div>
  );
}

const cfEvIso = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';

function CfEvModale({ incidente, onChiudi, onSalva }) {
  const nuovo = !incidente;
  const [b, setB] = useStateEv(() => ({
    titolo:        incidente ? incidente.titolo : '',
    categoria:     incidente ? incidente.categoria : 'indisponibilita',
    servizio:      incidente ? incidente.servizio : '',
    data:          cfEvIso(incidente ? incidente.data : new Date()),
    gravita:       incidente ? incidente.gravita : 'media',
    stato:         incidente ? incidente.stato : 'in corso',
    chiusuraIl:    cfEvIso(incidente && incidente.chiusuraIl),
    responsabile:  incidente ? incidente.responsabile : '',
    causaRadice:   incidente ? (incidente.causaRadice || '') : '',
    azione:        incidente ? (incidente.azione || '') : '',
    rischioCollegato: incidente ? (incidente.rischioCollegato || '') : '',
    origine:       incidente ? incidente.origine : 'manuale',
    dataBreach:    incidente ? !!incidente.dataBreach : false,
    breachNotificato: incidente ? !!incidente.breachNotificato : false,
    breachNotificaIl: cfEvIso(incidente && incidente.breachNotificaIl),
    breachInteressati: incidente && incidente.breachInteressati != null ? String(incidente.breachInteressati) : '',
    breachValutazione: incidente ? (incidente.breachValutazione || '') : '',
  }));
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const puoSalvare = b.titolo.trim().length > 3 && b.servizio.trim().length > 1 && !!b.data
    && b.responsabile.trim().length > 1;
  const cat = CF_EV_CAT.find(c => c.id === b.categoria) || {};

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="incidente" onClick={e=>e.stopPropagation()} style={{width:760, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>

        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>
            {nuovo ? 'Registrare un incidente' : `Modifica di ${incidente.id}`}
          </div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            {nuovo
              ? 'La data che conta è quella della SCOPERTA, non quella in cui il fatto è avvenuto: da lì partono le 72 ore della notifica.'
              : 'Anche gli incidenti rilevati dal monitoraggio vanno completati a mano: gravità, causa e valutazione sono giudizi, non misure.'}
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'flex', flexDirection:'column', gap:22}}>

          <div>
            <div style={CF_EV_SEZ}>Che cosa è successo</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
              <CfEvCampo etichetta="Incidente" span>
                <input value={b.titolo} onChange={e=>agg('titolo', e.target.value)} style={CF_EV_INP}
                  placeholder="Che cosa è accaduto, in una riga"/>
              </CfEvCampo>
              <CfEvCampo etichetta="Tipo di evento" aiuto={cat.nota}>
                <select value={b.categoria} onChange={e=>agg('categoria', e.target.value)} style={CF_EV_SEL}>
                  {CF_EV_CAT.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </CfEvCampo>
              <CfEvCampo etichetta="Servizio interessato">
                <input value={b.servizio} onChange={e=>agg('servizio', e.target.value)} style={CF_EV_INP}
                  placeholder="Pagamenti, Notifiche push, Gestionale…"/>
              </CfEvCampo>
              <CfEvCampo etichetta="Data della scoperta"
                aiuto="Quando ve ne siete accorti, non quando è successo.">
                <input type="date" value={b.data} onChange={e=>agg('data', e.target.value)} style={CF_EV_INP}/>
              </CfEvCampo>
              <CfEvCampo etichetta="Come è emerso">
                <select value={b.origine} onChange={e=>agg('origine', e.target.value)} style={CF_EV_SEL}>
                  <option value="manuale">Segnalazione di una persona</option>
                  <option value="automatico">Rilevato dal monitoraggio</option>
                </select>
              </CfEvCampo>
              <CfEvCampo etichetta="Gravità">
                <select value={b.gravita} onChange={e=>agg('gravita', e.target.value)} style={CF_EV_SEL}>
                  <option value="bassa">Bassa</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </CfEvCampo>
              <CfEvCampo etichetta="Responsabile">
                <input value={b.responsabile} onChange={e=>agg('responsabile', e.target.value)} style={CF_EV_INP}
                  placeholder="Chi lo sta gestendo"/>
              </CfEvCampo>
            </div>
          </div>

          {/* Il blocco che fa scattare gli obblighi: si apre solo se serve. */}
          <div style={{border:`1px solid ${b.dataBreach ? '#F0A9AC' : ADM.BORDER}`, borderRadius:12,
            padding:'15px 17px', background: b.dataBreach ? ADM.DANGER_SOFT : '#FCFCFD'}}>
            <label style={{display:'flex', alignItems:'flex-start', gap:9, cursor:'pointer'}}>
              <input type="checkbox" checked={b.dataBreach} onChange={e=>agg('dataBreach', e.target.checked)}
                style={{width:16, height:16, marginTop:2, accentColor:ADM.PINK, cursor:'pointer'}}/>
              <span>
                <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, display:'block'}}>
                  Ha coinvolto dati personali
                </span>
                <span style={{fontSize:11.8, color:ADM.MUTED, lineHeight:1.5, display:'block', marginTop:3}}>
                  Se sì diventa una violazione ai sensi dell’art. 33: va documentata comunque, e notificata al
                  Garante entro 72 ore dalla scoperta a meno che sia improbabile un rischio per gli interessati.
                </span>
              </span>
            </label>

            {b.dataBreach && (
              <div style={{marginTop:15, paddingTop:15, borderTop:'1px solid rgba(220,38,38,0.18)',
                display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
                <CfEvCampo etichetta="Interessati coinvolti">
                  <input value={b.breachInteressati} onChange={e=>agg('breachInteressati', e.target.value.replace(/\D/g, ''))}
                    style={CF_EV_INP} placeholder="quante persone"/>
                </CfEvCampo>
                <CfEvCampo etichetta="Notifica al Garante">
                  <select value={b.breachNotificato ? 'si' : 'no'}
                    onChange={e=>agg('breachNotificato', e.target.value === 'si')} style={CF_EV_SEL}>
                    <option value="no">Non notificata</option>
                    <option value="si">Notificata</option>
                  </select>
                </CfEvCampo>
                {b.breachNotificato && (
                  <CfEvCampo etichetta="Data della notifica"
                    aiuto="Oltre le 72 ore dalla scoperta la notifica si fa lo stesso, motivando il ritardo.">
                    <input type="date" value={b.breachNotificaIl}
                      onChange={e=>agg('breachNotificaIl', e.target.value)} style={CF_EV_INP}/>
                  </CfEvCampo>
                )}
                <CfEvCampo etichetta="Valutazione del rischio per gli interessati" span
                  aiuto="Obbligatoria in entrambi i casi: se non notificate, è questa la motivazione che vi copre.">
                  <textarea value={b.breachValutazione} onChange={e=>agg('breachValutazione', e.target.value)}
                    rows={2} style={{...CF_EV_INP, resize:'vertical'}}
                    placeholder="Quali dati, quante persone, che conseguenze possono subire"/>
                </CfEvCampo>
              </div>
            )}
          </div>

          <div>
            <div style={CF_EV_SEZ}>Analisi e chiusura</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
              <CfEvCampo etichetta="Causa radice" span
                aiuto="Non il sintomo: la ragione per cui è potuto succedere. Senza, l’azione è un rattoppo.">
                <textarea value={b.causaRadice} onChange={e=>agg('causaRadice', e.target.value)} rows={2}
                  style={{...CF_EV_INP, resize:'vertical'}} placeholder="Perché è successo"/>
              </CfEvCampo>
              <CfEvCampo etichetta="Azione correttiva" span>
                <textarea value={b.azione} onChange={e=>agg('azione', e.target.value)} rows={2}
                  style={{...CF_EV_INP, resize:'vertical'}} placeholder="Che cosa è stato cambiato perché non si ripeta"/>
              </CfEvCampo>
              <CfEvCampo etichetta="Rischio collegato"
                aiuto={b.rischioCollegato
                  ? 'L’incidente conferma un rischio già censito: al prossimo riesame va verificato se il trattamento regge.'
                  : 'Se nessun rischio lo copre, il registro dei rischi ha un buco: è così che A.5.27 chiede di imparare dagli incidenti.'}>
                <select value={b.rischioCollegato} onChange={e=>agg('rischioCollegato', e.target.value)} style={CF_EV_SEL}>
                  <option value="">Nessuno — rischio non censito</option>
                  {(typeof RISCHI !== 'undefined' ? RISCHI : []).map(r =>
                    <option key={r.id} value={r.id}>{r.id} · {r.titolo}</option>)}
                </select>
              </CfEvCampo>
              <CfEvCampo etichetta="Stato">
                <select value={b.stato} onChange={e=>agg('stato', e.target.value)} style={CF_EV_SEL}>
                  <option value="in corso">In corso</option>
                  <option value="chiuso">Chiuso</option>
                </select>
              </CfEvCampo>
              {b.stato === 'chiuso' && (
                <CfEvCampo etichetta="Data di chiusura">
                  <input type="date" value={b.chiusuraIl} onChange={e=>agg('chiusuraIl', e.target.value)} style={CF_EV_INP}/>
                </CfEvCampo>
              )}
            </div>
          </div>
        </div>

        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {puoSalvare
              ? (b.dataBreach && !b.breachNotificato
                  ? 'Violazione non notificata: il conto delle 72 ore parte dalla data di scoperta.'
                  : 'Entra nel registro con i campi compilati.')
              : 'Servono incidente, servizio, data della scoperta e responsabile.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!puoSalvare} onClick={()=>onSalva(b)}>
            {nuovo ? 'Registra l’incidente' : 'Salva le modifiche'}
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

// Conferma della notifica al Garante. È un atto verso un'autorità, quindi non
// parte da un click: prima si legge che cosa si sta dichiarando e con quale
// tempistica, poi si conferma.
function CfEvConfermaNotifica({ incidente, onChiudi, onConferma }) {
  const b = cfEvBreach(incidente);
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="notifica" onClick={e=>e.stopPropagation()} style={{width:540, maxWidth:'92%', background:'#fff',
        borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.18s ease', maxHeight:'100%', overflowY:'auto'}}>

        <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
          Registrare la notifica al Garante?
        </div>
        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:15}}>
          Stai dichiarando che la notifica dell’art. 33 è stata inviata oggi. La notifica vera si
          deposita sul portale del Garante: qui resta la data, che è ciò che il registro deve provare.
        </div>

        <div style={{padding:'13px 15px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:15}}>
          {[
            ['Incidente', `${incidente.id} · ${incidente.titolo}`],
            ['Scoperta il', cfFmt(incidente.data)],
            ['Interessati', incidente.breachInteressati != null ? String(incidente.breachInteressati) : 'non indicati'],
            ['Termine delle 72 ore', b ? cfFmt(b.limite) : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
              <span style={{color:ADM.MUTED, width:150, flexShrink:0}}>{k}</span>
              <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Il ritardo non impedisce la notifica: cambia cosa va scritto dentro. */}
        <div style={{padding:'12px 14px', borderRadius:10, marginBottom:18, fontSize:12.4, lineHeight:1.55,
          background: b && b.scaduto ? ADM.DANGER_SOFT : ADM.OK_SOFT,
          color: b && b.scaduto ? '#7F1D1D' : '#065F46'}}>
          {b && b.scaduto
            ? `Il termine è superato da ${cfEvOre(-b.restanti)}. La notifica si invia lo stesso, ma il ritardo va motivato dentro la notifica stessa: è la prima cosa che il Garante legge.`
            : `Sei entro il termine, con ${cfEvOre(b ? b.restanti : 0)} di margine.`}
        </div>

        {!incidente.breachValutazione && (
          <div style={{padding:'12px 14px', borderRadius:10, background:ADM.WARN_SOFT, color:'#78350F',
            fontSize:12.4, lineHeight:1.55, marginBottom:18}}>
            Manca la valutazione del rischio per gli interessati. Va scritta comunque: è ciò che
            giustifica la notifica e che decide se vanno avvisate anche le persone coinvolte.
          </div>
        )}

        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" onClick={onConferma}>Registra la notifica</AdmButton>
        </div>
      </div>
    </div>
  );
}

function CfIncidenti() {
  const [apri, setApri] = useStateEv(null);
  const [modale, setModale] = useStateEv(null);   // { incidente } — null = chiusa, {incidente:null} = nuovo
  const [notifica, setNotifica] = useStateEv(null);  // incidente in attesa di conferma della notifica
  const [, setTick] = useStateEv(0);

  const breachAperti = INCIDENTI.filter(i => i.dataBreach && !i.breachNotificato);

  // Se c'è una violazione non ancora notificata il countdown deve scorrere per
  // davvero: si aggiorna da solo ogni 30 secondi. Altrimenti nessun timer.
  useEffectEv(() => {
    if (!breachAperti.length) return;
    const t = setInterval(() => setTick(x => x + 1), 30000);
    return () => clearInterval(t);
  }, [breachAperti.length]);

  // Aperti in cima, poi per data decrescente: un registro si legge da ciò che
  // è ancora scoperto, non dall'ordine cronologico puro.
  const righe = [...INCIDENTI].sort((a, b) =>
    (a.stato === 'chiuso' ? 1 : 0) - (b.stato === 'chiuso' ? 1 : 0) ||
    b.data.getTime() - a.data.getTime());

  const salva = (b) => {
    const dato = (v) => v ? new Date(v + 'T12:00:00') : null;
    const campi = {
      titolo:b.titolo.trim(), categoria:b.categoria, servizio:b.servizio.trim(),
      data:dato(b.data), gravita:b.gravita, stato:b.stato,
      chiusuraIl: b.stato === 'chiuso' ? dato(b.chiusuraIl) : null,
      responsabile:b.responsabile.trim(), origine:b.origine,
      causaRadice:b.causaRadice.trim(), azione:b.azione.trim(),
      rischioCollegato: b.rischioCollegato || null,
      dataBreach:b.dataBreach,
      breachNotificato: b.dataBreach ? b.breachNotificato : false,
      breachNotificaIl: b.dataBreach && b.breachNotificato ? dato(b.breachNotificaIl) : null,
      breachInteressati: b.dataBreach && b.breachInteressati ? parseInt(b.breachInteressati, 10) : null,
      breachValutazione: b.dataBreach ? b.breachValutazione.trim() : '',
    };
    if (modale.incidente) {
      Object.assign(modale.incidente, campi);
    } else {
      const anno = new Date().getFullYear();
      const n = INCIDENTI.filter(i => i.id.includes(String(anno)))
        .reduce((m, i) => Math.max(m, parseInt(i.id.split('-').pop(), 10) || 0), 0) + 1;
      INCIDENTI.push({ id:`INC-${anno}-${String(n).padStart(3, '0')}`, ...campi });
    }
    setModale(null);
    setTick(x => x + 1);
  };

  const aperti = INCIDENTI.filter(i => i.stato !== 'chiuso').length;
  const da12 = cfMesi(new Date(), -12);
  const breach12 = INCIDENTI.filter(i => i.dataBreach && i.data >= da12).length;
  const incompleti = INCIDENTI.filter(i => cfEvMancanti(i).length > 0).length;

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Numeri in testa */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10}}>
        <CfEvStat n={aperti} tono={aperti ? 'WARN' : 'OK'} label="incidenti aperti"
          nota="in corso o in analisi: finché sono aperti non hanno una chiusura da mostrare"/>
        <CfEvStat n={breach12} tono={breach12 ? 'DANGER' : 'OK'} label="violazioni di dati negli ultimi 12 mesi"
          nota="ognuna fa scattare l'obbligo di notifica al Garante entro 72 ore"/>
        <CfEvStat n={incompleti} tono={incompleti ? 'WARN' : 'OK'} label="incidenti aperti senza causa radice o azione"
          nota="sono i due campi che l'auditor cerca per primi in A.5.27"/>
      </div>

      {/* Registro */}
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...CF_H, marginBottom:0}}>Registro degli incidenti</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>A.5.24–5.28 · aperti in cima, poi dal più recente</span>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setModale({ incidente:null })}>
            Registra un incidente
          </AdmButton>
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:CF_EV_GRID_INC, gap:9}}>
            <div>ID</div><div>Data</div><div>Incidente</div><div>Servizio</div>
            <div>Gravità</div><div>Data breach</div><div>Stato</div><div>Responsabile</div><div/>
          </div>

          {righe.map((i, idx) => {
            const aperto = apri === i.id;
            const mancanti = cfEvMancanti(i);
            const bi = cfEvBreach(i);
            const gravitaCol = i.gravita === 'alta' ? ADM.DANGER : ADM.MUTED;
            return (
              <React.Fragment key={i.id}>
                <div className="adm-row-open" onClick={()=>setApri(aperto ? null : i.id)}
                  style={{display:'grid', gridTemplateColumns:CF_EV_GRID_INC, gap:9, alignItems:'center',
                    padding:'12px 16px', cursor:'pointer',
                    borderBottom: (idx < righe.length - 1 || aperto) ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                    background: aperto ? ADM.PANEL_SOFT
                      : (bi && !bi.notificato) || mancanti.length ? '#FFFBFB' : '#fff'}}>

                  <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED,
                    fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace:'nowrap'}}>{i.id}</div>

                  <div style={{fontSize:12.4, color:ADM.TEXT, whiteSpace:'nowrap'}}>{cfFmt(i.data)}</div>

                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, lineHeight:1.35}}>{i.titolo}</div>
                    <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>
                      {cfEvCatLabel(i.categoria)}
                      {i.origine === 'automatico' ? ' · dal monitoraggio' : ' · segnalato'}
                    </div>
                    {mancanti.length > 0 && (
                      <div style={{fontSize:11.4, color:ADM.WARN, fontWeight:700, marginTop:3}}>
                        manca {mancanti.join(' e ')}
                      </div>
                    )}
                  </div>

                  <div style={{fontSize:12.4, color:ADM.MUTED, whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis'}}>{i.servizio}</div>

                  <div style={{fontSize:12.4, fontWeight: i.gravita === 'alta' ? 700 : 500,
                    color:gravitaCol, textTransform:'capitalize'}}>{i.gravita}</div>

                  <div>{i.dataBreach ? <CfEvBadgeBreach/> : <span style={{fontSize:12.4, color:ADM.MUTED_LIGHT}}>—</span>}</div>

                  <div>
                    <CfPill tono={i.stato === 'chiuso' ? 'NEUTRAL' : 'WARN'}>
                      {i.stato === 'chiuso' ? 'Chiuso' : 'In corso'}
                    </CfPill>
                  </div>

                  <div style={{fontSize:12.4, color:ADM.MUTED, whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis'}}>{i.responsabile}</div>

                  <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
                </div>

                {aperto && (
                  <div style={{padding:'16px', background:ADM.PANEL_SOFT,
                    borderBottom: idx < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
                      <div>
                        <div style={CF_EV_LBL}>Causa radice</div>
                        <div style={CF_EV_VAL}>
                          {i.causaRadice || <span style={CF_EV_VUOTO}>non ancora individuata — senza causa radice l'azione è un rattoppo</span>}
                        </div>
                      </div>
                      <div>
                        <div style={CF_EV_LBL}>Azione correttiva</div>
                        <div style={CF_EV_VAL}>
                          {i.azione || <span style={CF_EV_VUOTO}>non ancora definita</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{display:'flex', alignItems:'center', gap:26, marginTop:14, paddingTop:12,
                      borderTop:`1px dashed ${ADM.BORDER}`, fontSize:12.4, color:ADM.MUTED, flexWrap:'wrap'}}>
                      <span>Responsabile <strong style={{color:ADM.TEXT, fontWeight:700}}>{i.responsabile}</strong></span>
                      <span>Rilevato il <strong style={{color:ADM.TEXT, fontWeight:700}}>{cfFmt(i.data)}</strong></span>
                      <span>Chiuso il <strong style={{color:ADM.TEXT, fontWeight:700}}>{cfFmt(i.chiusuraIl)}</strong></span>
                      {/* A.5.27: un incidente o conferma un rischio censito, o ne
                          rivela uno che manca. Il secondo caso va detto. */}
                      <span>Rischio collegato{' '}
                        {i.rischioCollegato
                          ? <strong style={{color:ADM.TEXT, fontWeight:700}}>{i.rischioCollegato}</strong>
                          : <strong style={{color:ADM.WARN, fontWeight:700}}>nessuno — da censire</strong>}
                      </span>
                      <div style={{flex:1}}/>
                      <AdmButton variant="secondary" size="sm" onClick={()=>setModale({ incidente:i })}>Modifica</AdmButton>
                    </div>

                    {i.dataBreach && bi && (
                      <div style={{marginTop:14, padding:'14px 16px', borderRadius:10, background:'#fff',
                        border:`1px solid ${ADM.BORDER}`}}>
                        <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:12}}>
                          <CfEvBadgeBreach/>
                          <span style={{fontSize:12.4, color:ADM.MUTED}}>
                            Violazione di dati personali · art. 33 GDPR: notifica al Garante entro 72 ore dalla scoperta
                          </span>
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'120px 150px 1fr', gap:20, alignItems:'start'}}>
                          <div>
                            <div style={CF_EV_LBL}>Interessati</div>
                            <div style={{fontSize:21, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.1}}>
                              {i.breachInteressati != null ? i.breachInteressati : '—'}
                            </div>
                            <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:3}}>persone coinvolte</div>
                          </div>
                          <div>
                            <div style={CF_EV_LBL}>Notifica</div>
                            <div style={{...CF_EV_VAL, fontWeight:700}}>
                              {bi.notificato ? cfFmt(i.breachNotificaIl) : 'non ancora inviata'}
                            </div>
                            <div style={{fontSize:11.6, marginTop:3,
                              color: CF_TONO(bi.notificato ? (bi.inTempo ? 'OK' : 'DANGER') : bi.tono), fontWeight:700}}>
                              {bi.notificato
                                ? `${cfEvOre(bi.ore)} dalla scoperta`
                                : bi.scaduto ? `termine superato da ${cfEvOre(-bi.restanti)}` : `restano ${cfEvOre(bi.restanti)}`}
                            </div>
                          </div>
                          {/* L'azione sta dentro l'incidente, non in una striscia in
                              testa alla pagina: si notifica una violazione precisa,
                              dopo averne letto i dati, non un contatore generico. */}
                          <div style={{paddingTop:14, display:'flex', justifyContent:'flex-end'}}>
                            {!bi.notificato && (
                              <AdmButton variant="primary" size="sm" onClick={()=>setNotifica(i)}>
                                Notifica al Garante
                              </AdmButton>
                            )}
                          </div>
                        </div>

                        <div style={{marginTop:14}}>
                          <div style={CF_EV_LBL}>Valutazione del rischio per gli interessati</div>
                          <div style={CF_EV_VAL}>
                            {i.breachValutazione || <span style={CF_EV_VUOTO}>mancante — è ciò che giustifica sia la notifica sia la mancata comunicazione agli interessati</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.6, marginTop:12, padding:'12px 14px',
          background:ADM.NEUTRAL_SOFT, borderRadius:10}}>
          Un incidente è un disservizio finché non tocca dati personali: da quel momento è una
          <strong> violazione</strong> e le 72 ore corrono dalla <strong>scoperta</strong>, non dalla
          chiusura. Notificare oltre il termine non è vietato, ma il ritardo va motivato nella notifica
          stessa — ed è la prima cosa che il Garante legge.
        </div>
      </div>

      {modale && <CfEvModale key={modale.incidente ? modale.incidente.id : 'nuovo'}
        incidente={modale.incidente} onChiudi={()=>setModale(null)} onSalva={salva}/>}

      {notifica && <CfEvConfermaNotifica incidente={notifica} onChiudi={()=>setNotifica(null)}
        onConferma={()=>{
          notifica.breachNotificato = true;
          notifica.breachNotificaIl = new Date();
          setNotifica(null); setTick(x => x + 1);
        }}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NON CONFORMITÀ E AZIONI CORRETTIVE — ISO 9001 §10.2
   ═══════════════════════════════════════════════════════════════════════════ */

// Il ciclo di vita è ciò che l'auditor segue riga per riga. Il passo che quasi
// tutti saltano è il terzo: senza verifica di efficacia l'azione correttiva è
// solo un'intenzione scritta.
const CF_EV_PASSI = [
  { id:'aperta',        label:'Aperta',          nota:'rilevata e registrata' },
  { id:'in corso',      label:'Azione in corso', nota:'causa radice individuata, azione avviata' },
  { id:'da verificare', label:'Da verificare',   nota:'azione conclusa, efficacia da provare' },
  { id:'chiusa',        label:'Chiusa',          nota:'efficacia verificata' },
];

function cfEvStep(stato) {
  const i = CF_EV_PASSI.findIndex(p => p.id === stato);
  return i < 0 ? 0 : i;
}

// Avanzamento a passi: quattro segmenti, quelli raggiunti pieni. Inchiostro di
// default; rosso solo quando la scadenza è passata davvero.
function CfEvPassi({ step, ritardo }) {
  const pieno = ritardo ? ADM.DANGER : ADM.INK;
  return (
    <div>
      <div style={{display:'flex', gap:3}}>
        {CF_EV_PASSI.map((p, i) => (
          <div key={p.id} style={{flex:1, height:5, borderRadius:99,
            background: i <= step ? pieno : ADM.INK_SOFT,
            transition:'background 220ms ease'}}/>
        ))}
      </div>
      <div style={{fontSize:11.6, fontWeight:700, marginTop:5,
        color: ritardo ? ADM.DANGER : step === 3 ? ADM.MUTED : ADM.TEXT}}>
        {CF_EV_PASSI[step].label}
      </div>
      <div style={{fontSize:11, color:ADM.MUTED_SOFT, marginTop:1, lineHeight:1.3}}>{CF_EV_PASSI[step].nota}</div>
    </div>
  );
}

// Popup di conferma della verifica. Componente a livello di modulo con stato
// tenuto dal padre: definirlo dentro CfNonConformita farebbe perdere il focus
// alla textarea a ogni battitura.
function CfEvVerificaModal({ nc, scelta, onScelta, nota, onNota, onAnnulla, onConferma }) {
  if (!nc) return null;
  const pronto = !!scelta && nota.trim().length >= 8;
  const opzioni = [
    { id:'efficace',     titolo:'Efficace',     desc:'la causa radice non si ripresenta: la NC si chiude', tono:'OK' },
    { id:'non efficace', titolo:'Non efficace', desc:'il problema si è ripresentato o l\'azione non ha inciso', tono:'DANGER' },
  ];
  return (
    <div onClick={onAnnulla} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:540, maxWidth:'92%', background:'#fff', borderRadius:14,
        padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>

        <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
          Verifica di efficacia · {nc.id}
        </div>
        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:14}}>
          {nc.descrizione}. L'azione registrata è <em>{nc.azione}</em>. La domanda non è se
          l'azione è stata fatta, ma se ha funzionato: è questo che chiude la non conformità.
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
          {opzioni.map(o => {
            const sel = scelta === o.id;
            return (
              <div key={o.id} className="adm-card-interactive" onClick={()=>onScelta(o.id)}
                style={{border:`${sel ? 2 : 1}px solid ${sel ? ADM.INK : ADM.BORDER}`, borderRadius:10,
                  padding: sel ? '11px 13px' : '12px 14px', cursor:'pointer',
                  background: sel ? ADM.NEUTRAL_SOFT : '#fff'}}>
                <div style={{display:'flex', alignItems:'center', gap:7}}>
                  <span style={{width:8, height:8, borderRadius:'50%', background:CF_TONO(o.tono), flexShrink:0}}/>
                  <span style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>{o.titolo}</span>
                </div>
                <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:5, lineHeight:1.4}}>{o.desc}</div>
              </div>
            );
          })}
        </div>

        {scelta === 'non efficace' && (
          <div style={{padding:'11px 13px', borderRadius:10, background:ADM.DANGER_SOFT,
            border:'1px solid #FECACA', marginBottom:14, fontSize:12.6, color:'#7F1D1D', lineHeight:1.5}}>
            La non conformità <strong>non si chiude</strong>: torna in «Azione in corso» e serve una
            nuova azione correttiva su una causa radice riesaminata. Chiuderla lo stesso è il rilievo
            più comune sulla §10.2 — l'esito negativo resta agli atti, ed è giusto così.
          </div>
        )}

        <div style={CF_EV_LBL}>Come l'hai verificata</div>
        <textarea value={nota} onChange={e=>onNota(e.target.value)} autoFocus
          placeholder="Es. Nessuna segnalazione dello stesso tipo negli ultimi 60 giorni, controllati i 14 ticket ad alta priorità"
          style={{width:'100%', minHeight:78, padding:'10px 12px', borderRadius:10, border:`1px solid ${ADM.BORDER}`,
            fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT, resize:'vertical', boxSizing:'border-box', outline:'none'}}/>
        <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.45}}>
          Scrivi l'evidenza, non il giudizio: la verifica vale quanto il dato su cui poggia.
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
          <AdmButton variant="secondary" size="sm" onClick={onAnnulla}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!pronto} onClick={onConferma}>
            {scelta === 'non efficace' ? 'Registra esito negativo' : 'Registra e chiudi la NC'}
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

// Responsabile a 1.35fr: a 1.05 l'intestazione «RESPONSABILE», che in maiuscolo
// con la spaziatura è più larga di qualunque nome, sconfinava su «SCADENZA».
const CF_EV_GRID_NC = '108px minmax(0,2.15fr) minmax(0,1.35fr) 118px 168px 120px 26px';

// ─── Registrare una non conformità ─────────────────────────────────────────
// L'origine non è un'etichetta di comodo: dice se il sistema si accorge da solo
// dei propri difetti. Una §10.2 alimentata solo dagli audit interni descrive
// un'azienda che scopre i problemi una volta l'anno.
const CF_NC_ORIGINI = ['Audit interno', 'Reclamo cliente', 'Segnalazione locale', 'Incidente',
  'Riesame di direzione', 'Verifica dell\'ente', 'Controllo interno'];
const CF_NC_TIPI = [
  { id:'processo',    label:'Processo',    nota:'Il modo in cui lavoriamo non ha funzionato' },
  { id:'prodotto',    label:'Prodotto',    nota:'Il servizio erogato non era conforme' },
  { id:'documentale', label:'Documentale', nota:'Un registro o un documento mancava o era vecchio' },
];

function CfEvModaleNc({ onChiudi, onSalva }) {
  const [b, setB] = useStateEv({
    descrizione:'', origine:'Segnalazione locale', tipo:'processo',
    responsabile:'', scadenza:'', causaRadice:'', azione:'',
  });
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const puoSalvare = b.descrizione.trim().length > 5 && b.responsabile.trim().length > 1 && !!b.scadenza;
  const tipo = CF_NC_TIPI.find(t => t.id === b.tipo) || {};

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="nc" onClick={e=>e.stopPropagation()} style={{width:700, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>

        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>Registrare una non conformità</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            Nasce aperta. Causa radice e azione si possono scrivere adesso o dopo, ma finché mancano
            resta una segnalazione: la §10.2 chiede di rimuovere la causa, non di annotare il sintomo.
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16, alignContent:'start'}}>
          <CfEvCampo etichetta="Non conformità" span>
            <textarea value={b.descrizione} onChange={e=>agg('descrizione', e.target.value)} rows={2}
              style={{...CF_EV_INP, resize:'vertical'}}
              placeholder="Che cosa non è conforme, e rispetto a quale requisito"/>
          </CfEvCampo>
          <CfEvCampo etichetta="Come è emersa">
            <select value={b.origine} onChange={e=>agg('origine', e.target.value)} style={CF_EV_SEL}>
              {CF_NC_ORIGINI.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </CfEvCampo>
          <CfEvCampo etichetta="Tipo" aiuto={tipo.nota}>
            <select value={b.tipo} onChange={e=>agg('tipo', e.target.value)} style={CF_EV_SEL}>
              {CF_NC_TIPI.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </CfEvCampo>
          <CfEvCampo etichetta="Responsabile">
            <input value={b.responsabile} onChange={e=>agg('responsabile', e.target.value)} style={CF_EV_INP}
              placeholder="Chi risponde della chiusura"/>
          </CfEvCampo>
          <CfEvCampo etichetta="Scadenza dell’azione"
            aiuto="Una non conformità senza data di chiusura resta aperta per sempre.">
            <input type="date" value={b.scadenza} onChange={e=>agg('scadenza', e.target.value)} style={CF_EV_INP}/>
          </CfEvCampo>
          <CfEvCampo etichetta="Causa radice" span
            aiuto="Se non è ancora chiara si lascia vuota: scriverne una falsa è peggio che ammettere di non saperla.">
            <textarea value={b.causaRadice} onChange={e=>agg('causaRadice', e.target.value)} rows={2}
              style={{...CF_EV_INP, resize:'vertical'}} placeholder="Perché è potuto succedere"/>
          </CfEvCampo>
          <CfEvCampo etichetta="Azione correttiva" span>
            <textarea value={b.azione} onChange={e=>agg('azione', e.target.value)} rows={2}
              style={{...CF_EV_INP, resize:'vertical'}} placeholder="Che cosa si cambia perché non si ripeta"/>
          </CfEvCampo>
        </div>

        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {puoSalvare
              ? 'Entra aperta. La verifica di efficacia si registra quando l’azione è conclusa.'
              : 'Servono descrizione, responsabile e scadenza.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!puoSalvare} onClick={()=>onSalva(b)}>
            Registra la non conformità
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

function CfNonConformita() {
  const [apri, setApri] = useStateEv(null);
  const [esiti, setEsiti] = useStateEv({});      // verifiche registrate in sessione
  const [verifica, setVerifica] = useStateEv(null);
  const [scelta, setScelta] = useStateEv(null);
  const [nota, setNota] = useStateEv('');
  const [nuova, setNuova] = useStateEv(false);
  const [, setTickNc] = useStateEv(0);

  const salvaNc = (b) => {
    const anno = new Date().getFullYear();
    const n = NON_CONFORMITA.filter(x => x.id.includes(String(anno)))
      .reduce((m, x) => Math.max(m, parseInt(x.id.split('-').pop(), 10) || 0), 0) + 1;
    NON_CONFORMITA.push({
      id:`NC-${anno}-${String(n).padStart(3, '0')}`, data:new Date(),
      origine:b.origine, tipo:b.tipo, descrizione:b.descrizione.trim(),
      causaRadice:b.causaRadice.trim(), azione:b.azione.trim(),
      responsabile:b.responsabile.trim(),
      scadenza: b.scadenza ? new Date(b.scadenza + 'T12:00:00') : null,
      efficacia:null, stato:'in corso',
    });
    setNuova(false); setTickNc(x => x + 1);
  };

  // Vista = dato di partenza + verifiche registrate qui dentro.
  const righe = NON_CONFORMITA
    .map(n => ({ ...n, ...(esiti[n.id] || {}) }))
    .sort((a, b) =>
      (a.stato === 'chiusa' ? 1 : 0) - (b.stato === 'chiusa' ? 1 : 0) ||
      b.data.getTime() - a.data.getTime());


  const apriVerifica = (n) => { setVerifica(n); setScelta(null); setNota(''); };

  const registra = () => {
    if (!verifica || !scelta) return;
    const efficace = scelta === 'efficace';
    setEsiti(prev => ({ ...prev, [verifica.id]: {
      efficacia: scelta,
      verificaIl: new Date(),
      notaVerifica: nota.trim(),
      // Non efficace ⇒ la NC torna aperta: non si chiude una non conformità
      // con un'azione che non ha funzionato.
      stato: efficace ? 'chiusa' : 'in corso',
      riaperta: !efficace,
    } }));
    setVerifica(null); setScelta(null); setNota('');
  };


  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Ciclo di vita — la mappa che l'auditor segue */}
      <div>
        <div style={CF_H}>Il ciclo</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:10}}>
          {CF_EV_PASSI.map((p, i) => (
            <div key={p.id} style={{...CF_CARD, padding:'12px 14px'}}>
              <div style={{height:4, borderRadius:99, background:ADM.INK, marginBottom:9,
                width: `${(i + 1) * 25}%`}}/>
              <div style={{fontSize:13, fontWeight:700, color:ADM.TEXT}}>{i + 1}. {p.label}</div>
              <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:3, lineHeight:1.4}}>{p.nota}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Registro */}
      <div>
        {/* Senza il sottotitolo la riga e titolo + pulsante: allineati al centro,
            perche con baseline un pulsante alto sale sopra la riga del titolo. */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
          <div style={{...CF_H, marginBottom:0}}>Non conformità e azioni correttive</div>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setNuova(true)}>
            Registra una non conformità
          </AdmButton>
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:CF_EV_GRID_NC, gap:10}}>
            <div>ID</div><div>Non conformità</div><div>Responsabile</div>
            <div>Scadenza</div><div>Ciclo di vita</div><div>Verifica</div><div/>
          </div>

          {righe.map((n, idx) => {
            const aperto = apri === n.id;
            const gg = n.scadenza ? cfGiorniA(n.scadenza) : null;
            const ritardo = n.stato !== 'chiusa' && gg != null && gg < 0;
            const step = cfEvStep(n.stato);
            return (
              <React.Fragment key={n.id}>
                <div className="adm-row-open" onClick={()=>setApri(aperto ? null : n.id)}
                  style={{display:'grid', gridTemplateColumns:CF_EV_GRID_NC, gap:10, alignItems:'center',
                    padding:'12px 16px', cursor:'pointer',
                    borderBottom: (idx < righe.length - 1 || aperto) ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
                    background: aperto ? ADM.PANEL_SOFT : ritardo ? '#FFFBFB' : '#fff'}}>

                  <div>
                    <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED,
                      fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace:'nowrap'}}>{n.id}</div>
                    <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, whiteSpace:'nowrap'}}>{cfFmt(n.data)}</div>
                  </div>

                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, lineHeight:1.35}}>{n.descrizione}</div>
                    <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:3}}>
                      {n.origine} · {n.tipo}
                      {n.riaperta && <span style={{color:ADM.DANGER, fontWeight:700}}> · riaperta dopo verifica non efficace</span>}
                    </div>
                  </div>

                  <div style={{fontSize:12.4, color:ADM.MUTED, whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis'}}>{n.responsabile}</div>

                  <div>
                    <div style={{fontSize:12.4, color: ritardo ? ADM.DANGER : ADM.TEXT,
                      fontWeight: ritardo ? 700 : 500, whiteSpace:'nowrap'}}>{cfFmt(n.scadenza)}</div>
                    {n.stato !== 'chiusa' && gg != null && (
                      <div style={{fontSize:11.4, marginTop:2, whiteSpace:'nowrap',
                        color: ritardo ? ADM.DANGER : ADM.MUTED_SOFT, fontWeight: ritardo ? 700 : 500}}>
                        {ritardo ? `in ritardo di ${-gg} giorni` : `fra ${gg} giorni`}
                      </div>
                    )}
                  </div>

                  <div><CfEvPassi step={step} ritardo={ritardo}/></div>

                  <div>
                    {n.efficacia
                      ? <CfPill tono={n.efficacia === 'efficace' ? 'OK' : 'DANGER'}>
                          {n.efficacia === 'efficace' ? 'Efficace' : 'Non efficace'}
                        </CfPill>
                      : n.stato === 'da verificare'
                        ? <AdmButton variant="secondary" size="sm" style={CF_EV_BTN}
                            onClick={e=>{ e.stopPropagation(); apriVerifica(n); }}>Verifica</AdmButton>
                        : <span style={{fontSize:12.4, color:ADM.MUTED_LIGHT}}>—</span>}
                  </div>

                  <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
                </div>

                {aperto && (
                  <div style={{padding:'16px', background:ADM.PANEL_SOFT,
                    borderBottom: idx < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
                      <div>
                        <div style={CF_EV_LBL}>Causa radice</div>
                        <div style={CF_EV_VAL}>
                          {n.causaRadice || <span style={CF_EV_VUOTO}>non ancora individuata — l'azione correttiva agisce sulla causa, non sul sintomo</span>}
                        </div>
                      </div>
                      <div>
                        <div style={CF_EV_LBL}>Azione correttiva</div>
                        <div style={CF_EV_VAL}>
                          {n.azione || <span style={CF_EV_VUOTO}>non ancora definita</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{marginTop:14, padding:'14px 16px', borderRadius:10, background:'#fff',
                      border:`1px solid ${ADM.BORDER}`}}>
                      <div style={{display:'flex', alignItems:'flex-start', gap:20}}>
                        <div style={{minWidth:150}}>
                          <div style={CF_EV_LBL}>Verifica di efficacia</div>
                          {n.efficacia ? (
                            <>
                              <CfPill tono={n.efficacia === 'efficace' ? 'OK' : 'DANGER'}>
                                {n.efficacia === 'efficace' ? 'Efficace' : 'Non efficace'}
                              </CfPill>
                              <div style={{fontSize:12, color:ADM.MUTED, marginTop:6}}>
                                verificata il {cfFmt(n.verificaIl)}
                              </div>
                            </>
                          ) : (
                            <div style={{fontSize:13, color: n.stato === 'da verificare' ? ADM.WARN : ADM.MUTED,
                              fontWeight: n.stato === 'da verificare' ? 700 : 500}}>
                              {n.stato === 'da verificare' ? 'in attesa' : 'non ancora prevista'}
                            </div>
                          )}
                        </div>

                        <div style={{flex:1, minWidth:0, fontSize:12.6, color:ADM.MUTED, lineHeight:1.55}}>
                          {n.notaVerifica
                            ? <span style={{color:ADM.TEXT, fontSize:13}}>{n.notaVerifica}</span>
                            : n.efficacia
                              ? 'Esito registrato prima dell\'apertura di questa sessione: il dettaglio è nel rapporto di verifica su Drive.'
                              : 'Senza verifica di efficacia l\'azione correttiva resta un\'intenzione: la §10.2 chiede di dimostrare che il problema non si ripresenta.'}
                          {n.riaperta && (
                            <div style={{marginTop:8, color:ADM.DANGER, fontWeight:700, fontSize:12.4}}>
                              Verifica negativa: la NC è tornata aperta e serve una nuova azione correttiva.
                            </div>
                          )}
                        </div>

                        {n.stato === 'da verificare' && (
                          <AdmButton variant="primary" size="sm" style={CF_EV_BTN}
                            onClick={e=>{ e.stopPropagation(); apriVerifica(n); }}>
                            Registra verifica di efficacia
                          </AdmButton>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>

      <CfEvVerificaModal
        nc={verifica}
        scelta={scelta}
        onScelta={setScelta}
        nota={nota}
        onNota={setNota}
        onAnnulla={()=>{ setVerifica(null); setScelta(null); setNota(''); }}
        onConferma={registra}/>

      {nuova && <CfEvModaleNc onChiudi={()=>setNuova(false)} onSalva={salvaNc}/>}
    </div>
  );
}

window.CfIncidenti = CfIncidenti;
window.CfNonConformita = CfNonConformita;

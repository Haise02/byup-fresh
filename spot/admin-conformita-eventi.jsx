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

// La finestra delle 72 ore disegnata: dove siamo rispetto al termine.
function CfEvBarra72({ b }) {
  if (!b) return null;
  const col = CF_TONO(b.tono);
  return (
    <div style={{width:'100%'}}>
      <div style={{position:'relative', height:8, borderRadius:99, background:'#fff',
        border:`1px solid ${ADM.BORDER}`, overflow:'hidden'}}>
        <div style={{width:`${b.pct}%`, height:'100%', background:col, borderRadius:99,
          transition:'width 400ms ease'}}/>
        <div style={{position:'absolute', left:'33.33%', top:0, bottom:0, width:1, background:'rgba(15,17,21,0.10)'}}/>
        <div style={{position:'absolute', left:'66.66%', top:0, bottom:0, width:1, background:'rgba(15,17,21,0.10)'}}/>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:4,
        fontSize:11, fontWeight:600, color:ADM.MUTED_SOFT}}>
        <span>scoperta</span><span>24 h</span><span>48 h</span><span>72 h · termine</span>
      </div>
    </div>
  );
}

// Badge della violazione: non è decorativo, dice che quell'incidente ha fatto
// scattare un obbligo di legge.
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

function CfIncidenti() {
  const [apri, setApri] = useStateEv(null);
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

  const aperti = INCIDENTI.filter(i => i.stato !== 'chiuso').length;
  const da12 = cfMesi(new Date(), -12);
  const breach12 = INCIDENTI.filter(i => i.dataBreach && i.data >= da12).length;
  const incompleti = INCIDENTI.filter(i => cfEvMancanti(i).length > 0).length;

  // La striscia in testa segue la violazione che conta: quella ancora da
  // notificare se esiste, altrimenti l'ultima trattata.
  const breachRif =
    [...breachAperti].sort((a, b) => b.data.getTime() - a.data.getTime())[0] ||
    INCIDENTI.filter(i => i.dataBreach).sort((a, b) => b.data.getTime() - a.data.getTime())[0] ||
    null;
  const b = cfEvBreach(breachRif);

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Striscia delle 72 ore — è il fulcro della schermata, non un dettaglio */}
      {b && (
        <div style={{display:'flex', alignItems:'center', gap:20, padding:'15px 18px', borderRadius:10,
          background: b.notificato ? (b.inTempo ? ADM.OK_SOFT : ADM.DANGER_SOFT) : CF_TONO_BG(b.tono),
          border:`1px solid ${b.notificato ? (b.inTempo ? '#BBF7D0' : '#FECACA') : (b.tono === 'DANGER' ? '#FECACA' : '#FDE68A')}`}}>

          <div style={{textAlign:'center', flexShrink:0, minWidth:132}}>
            <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1,
              color: CF_TONO(b.notificato ? (b.inTempo ? 'OK' : 'DANGER') : b.tono)}}>
              {b.notificato ? cfEvOre(b.ore) : cfEvOre(Math.abs(b.restanti))}
            </div>
            <div style={{fontSize:11.4, fontWeight:700, color:ADM.MUTED, marginTop:4,
              textTransform:'uppercase', letterSpacing:'0.05em'}}>
              {b.notificato ? 'dalla scoperta' : b.scaduto ? 'oltre il termine' : 'al termine'}
            </div>
          </div>

          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:14.5, fontWeight:800,
              color: b.notificato ? (b.inTempo ? '#065F46' : '#7F1D1D') : (b.tono === 'DANGER' ? '#7F1D1D' : '#78350F')}}>
              {b.notificato
                ? `Violazione notificata al Garante il ${cfFmt(breachRif.breachNotificaIl)}`
                : b.scaduto
                  ? 'Violazione non notificata · termine delle 72 ore superato'
                  : 'Violazione di dati personali da notificare al Garante'}
            </div>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>
              {breachRif.id} · {breachRif.titolo} · scoperta il {cfFmt(breachRif.data)}
              {b.notificato
                ? ` · ${b.inTempo ? `entro il limite, con ${cfEvOre(b.margine)} di margine` : 'oltre il limite: il ritardo va motivato nella notifica'}`
                : ` · termine ${cfFmt(b.limite)}`}
            </div>
            <div style={{marginTop:10}}><CfEvBarra72 b={b}/></div>
          </div>
        </div>
      )}

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

                    <div style={{display:'flex', gap:26, marginTop:14, paddingTop:12,
                      borderTop:`1px dashed ${ADM.BORDER}`, fontSize:12.4, color:ADM.MUTED}}>
                      <span>Responsabile <strong style={{color:ADM.TEXT, fontWeight:700}}>{i.responsabile}</strong></span>
                      <span>Rilevato il <strong style={{color:ADM.TEXT, fontWeight:700}}>{cfFmt(i.data)}</strong></span>
                      <span>Chiuso il <strong style={{color:ADM.TEXT, fontWeight:700}}>{cfFmt(i.chiusuraIl)}</strong></span>
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
                          <div style={{paddingTop:16}}><CfEvBarra72 b={bi}/></div>
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
    <div onClick={onAnnulla} style={{position:'absolute', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)'}}>
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

const CF_EV_GRID_NC = '108px minmax(0,2.4fr) minmax(0,1.05fr) 118px 176px 124px 26px';

function CfNonConformita() {
  const [apri, setApri] = useStateEv(null);
  const [esiti, setEsiti] = useStateEv({});      // verifiche registrate in sessione
  const [verifica, setVerifica] = useStateEv(null);
  const [scelta, setScelta] = useStateEv(null);
  const [nota, setNota] = useStateEv('');

  // Vista = dato di partenza + verifiche registrate qui dentro.
  const righe = NON_CONFORMITA
    .map(n => ({ ...n, ...(esiti[n.id] || {}) }))
    .sort((a, b) =>
      (a.stato === 'chiusa' ? 1 : 0) - (b.stato === 'chiusa' ? 1 : 0) ||
      b.data.getTime() - a.data.getTime());

  const aperte = righe.filter(n => n.stato !== 'chiusa').length;
  const daVerificare = righe.filter(n => n.stato === 'da verificare').length;
  const chiuse = righe.filter(n => n.stato === 'chiusa').length;
  const ritardi = righe.filter(n => n.stato !== 'chiusa' && n.scadenza && cfGiorniA(n.scadenza) < 0).length;

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

  const tonoBanda = ritardi ? 'DANGER' : daVerificare ? 'WARN' : 'OK';

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Dove si inceppa il ciclo */}
      <div style={{padding:'14px 16px', borderRadius:10,
        background: CF_TONO_BG(tonoBanda),
        border:`1px solid ${ritardi ? '#FECACA' : daVerificare ? '#FDE68A' : '#BBF7D0'}`}}>
        <div style={{fontSize:14.5, fontWeight:800,
          color: ritardi ? '#7F1D1D' : daVerificare ? '#78350F' : '#065F46'}}>
          {ritardi
            ? `${ritardi} ${ritardi === 1 ? 'azione correttiva oltre la scadenza' : 'azioni correttive oltre la scadenza'}`
            : daVerificare
              ? `${daVerificare} ${daVerificare === 1 ? 'non conformità aspetta la verifica di efficacia' : 'non conformità aspettano la verifica di efficacia'}`
              : 'Nessuna non conformità aperta'}
        </div>
        <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>
          {daVerificare > 0
            ? 'L\'azione correttiva è conclusa ma non ancora provata: finché la verifica non è registrata la non conformità resta aperta.'
            : 'Una non conformità si chiude con la verifica di efficacia, non con l\'azione correttiva.'}
        </div>
      </div>

      {/* Numeri in testa */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:10}}>
        <CfEvStat n={aperte} tono={aperte ? 'WARN' : 'OK'} label="non conformità aperte"
          nota="registrate e non ancora chiuse con esito"/>
        <CfEvStat n={daVerificare} tono={daVerificare ? 'WARN' : 'OK'} label="in attesa di verifica di efficacia"
          nota="il passaggio che chiude davvero il ciclo §10.2"/>
        <CfEvStat n={chiuse} tono="INK" label="chiuse con efficacia verificata"
          nota="hanno un esito e una data di verifica agli atti"/>
        <CfEvStat n={ritardi} tono={ritardi ? 'DANGER' : 'OK'} label="oltre la scadenza dell'azione"
          nota="il ritardo è di per sé un rilievo: la scadenza l'abbiamo scelta noi"/>
      </div>

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
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...CF_H, marginBottom:0}}>Non conformità e azioni correttive</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>ISO 9001 §10.2 · aperte in cima, poi dalla più recente</span>
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

        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.6, marginTop:12, padding:'12px 14px',
          background:ADM.NEUTRAL_SOFT, borderRadius:10}}>
          L'origine dice da dove è arrivata la non conformità — segnalazione, audit, reclamo, incidente —
          e serve a capire se il sistema le trova da solo o le scopre sempre qualcun altro.
          La chiusura non è la fine dell'azione: è la <strong>verifica di efficacia</strong>, con la sua data
          e il suo esito. Se l'esito è negativo la non conformità resta aperta.
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
    </div>
  );
}

window.CfIncidenti = CfIncidenti;
window.CfNonConformita = CfNonConformita;

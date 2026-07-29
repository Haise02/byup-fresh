// Economix — dove vanno i soldi di Byup e dove andranno.
const { useState: useStateEco } = React;

const ECO_CARD = { border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden', background:'#fff' };
const ECO_TH = { padding:'9px 16px', background:'#FAFAFB', borderBottom:`1px solid ${ADM.BORDER}`,
  fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em' };
const ECO_H = { fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:10 };
const ECO_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };
const ECO_SEL = { ...ECO_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };
const ECO_NUM = { fontVariantNumeric:'tabular-nums' };
const ECO_GRID_VAR = 'minmax(0,1.65fr) 1.15fr 1.2fr 108px 108px minmax(0,1.05fr)';
const ECO_GRID_FIS = 'minmax(0,1.9fr) 1fr 1.15fr 108px 112px 112px minmax(0,1.1fr)';
const ECO_MESI_LUNGHI = ['gennaio','febbraio','marzo','aprile','maggio','giugno',
  'luglio','agosto','settembre','ottobre','novembre','dicembre'];

// «26 minuti fa» dice piu di un orario: la domanda e quanto e fresca la lettura.
function ecoQuando(d) {
  if (!d) return 'mai';
  const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (min < 1) return 'adesso';
  if (min < 60) return `${min} ${min === 1 ? 'minuto' : 'minuti'} fa`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ${h === 1 ? 'ora' : 'ore'} fa`;
  const g = Math.round(h / 24);
  return `${g} ${g === 1 ? 'giorno' : 'giorni'} fa`;
}

// Conferma del collegamento: si sta dando a Byup una credenziale su un sistema
// che costa denaro, quindi prima si legge che cosa verrebbe letto e con quali
// permessi. Staccare non cancella nulla: si torna alla stima.
function EcoModaleConnessione({ conn, onChiudi, onLettura }) {
  const met = ECO_METODI[conn.metodo] || ECO_METODI.chiave;
  const manuale = conn.stato === 'manuale';
  const [importo, setImporto] = useStateEco('');
  const ok = parseFloat(String(importo).replace(',', '.')) > 0;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="connessione" onClick={e=>e.stopPropagation()} style={{width:580, maxWidth:'92%', background:'#fff',
        borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.18s ease', maxHeight:'100%', overflowY:'auto'}}>

        <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom:6}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, flex:1}}>
            {manuale ? `Lettura di ${conn.nome}` : conn.nome}
          </div>
          <CfPill tono={ECO_STATO_CONN[conn.stato].tono}>{ECO_STATO_CONN[conn.stato].label}</CfPill>
        </div>
        <div style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.55, marginBottom:16}}>{conn.legge}</div>

        {conn.stato === 'errore' && (
          <div style={{padding:'13px 15px', borderRadius:10, background:ADM.DANGER_SOFT, color:'#7F1D1D',
            fontSize:12.8, lineHeight:1.55, marginBottom:16}}>
            <strong>{conn.errore}.</strong> Da {ecoGiorniInErrore(conn)} giorni queste righe sono
            tornate a essere stimate dal modello senza che nulla lo segnalasse altrove.
          </div>
        )}

        {manuale ? (
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em', display:'block', marginBottom:6}}>Importo del mese</label>
            <input value={importo} onChange={e=>setImporto(e.target.value.replace(/[^\d.,]/g, ''))}
              style={ECO_INP} placeholder="0,00" autoFocus/>
            <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>
              Prende il posto della stima per il mese in corso. Ultima immissione {ecoQuando(conn.ultimaLettura)}.
            </div>
          </div>
        ) : (
          <React.Fragment>
            {/* Istruzioni, non un modulo: la credenziale non si incolla qui. */}
            <div style={{padding:'14px 16px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
              <div style={{display:'flex', gap:22, marginBottom:12, flexWrap:'wrap'}}>
                {[['Metodo', met.label], ['Chi lo fa', met.chi], ['Quanto richiede', met.durata]].map(([k, v]) => (
                  <div key={k} style={{minWidth:0}}>
                    <div style={{fontSize:10.8, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                      letterSpacing:'0.05em'}}>{k}</div>
                    <div style={{fontSize:12.6, color:ADM.TEXT, fontWeight:600, marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              {conn.passi.map((t, k) => (
                <div key={k} style={{display:'flex', gap:10, marginBottom: k < conn.passi.length - 1 ? 8 : 0}}>
                  <span style={{fontSize:11, fontWeight:800, color:ADM.PINK, flexShrink:0, marginTop:2,
                    fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{k + 1}</span>
                  <span style={{fontSize:12.6, color:ADM.TEXT, lineHeight:1.5}}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.55, marginBottom:18}}>
              Questa schermata non chiede la credenziale e non la conserva: vive nel gestore dei
              segreti dell’infrastruttura. Un backoffice che la accettasse in un campo la
              scriverebbe nel proprio database, dove chiunque vi abbia accesso potrebbe leggerla.
            </div>
          </React.Fragment>
        )}

        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
          Righe interessate:{' '}
          <strong style={{color:ADM.TEXT}}>
            {conn.fatture ? 'le fatture ricevute'
              : conn.servizi.map(id => (ECO_SERVIZI.find(x => x.id === id) || {}).nome).join(', ')}
          </strong>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Chiudi</AdmButton>
          {manuale && (
            <AdmButton variant="primary" size="sm" disabled={!ok}
              onClick={()=>onLettura(parseFloat(String(importo).replace(',', '.')))}>
              Registra la lettura
            </AdmButton>
          )}
        </div>
      </div>
    </div>
  );
}

function EcoCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.05em', display:'block', marginBottom:6}}>{etichetta}</label>
      {children}
      {aiuto && <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{aiuto}</div>}
    </div>
  );
}

// Barra di riempimento: quanto pesa una voce sul totale.
function EcoBarra({ quota, tono }) {
  return (
    <div style={{height:5, borderRadius:99, background:'rgba(49,53,61,0.08)', overflow:'hidden'}}>
      <div style={{height:'100%', width:`${Math.min(100, quota * 100)}%`, borderRadius:99,
        background: tono || ADM.INK, transition:'width 0.25s ease'}}/>
    </div>
  );
}

// La fonte di una riga: letta da una connessione attiva o da una fattura
// elettronica, oppure scritta da una persona. Non e un dettaglio tecnico —
// dice quanto ci si puo fidare del numero.
function EcoFonte({ automatica, da }) {
  return (
    <span title={da} style={{fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:6,
      background: automatica ? 'rgba(22,163,74,0.12)' : 'rgba(49,53,61,0.08)',
      color: automatica ? ADM.OK : ADM.INK}}>
      {automatica ? 'Automatica' : 'Manuale'}
    </span>
  );
}

const ECO_PERIODICITA = { mensile:'Mensile', annuale:'Annuale', 'una-tantum':'Una tantum' };

/* ═══ NUOVO COSTO — con la fattura, se c'e ═══════════════════════════════ */
function EcoModaleCosto({ onChiudi, onSalva }) {
  const [b, setB] = useStateEco({ voce:'', categoria:'Software', importo:'', periodicita:'mensile',
    dal: new Date().toISOString().slice(0, 10), fornitore:'', piva:'', numero:'', aliquota:'22' });
  const [file, setFile] = useStateEco(null);
  // Si scrive l'imponibile OPPURE il totale: sono le due cifre che stanno sulla
  // fattura. L'IVA non e un terzo dato da inserire, e il prodotto dei due — e un
  // campo scrivibile inviterebbe a metterci dentro un numero incoerente.
  const [totaleRaw, setTotaleRaw] = useStateEco(null);   // non null solo mentre si scrive nel totale
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const num = (v) => parseFloat(String(v).replace(',', '.')) || 0;
  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');

  const aggImponibile = (v) => { setTotaleRaw(null); agg('importo', v); };
  // Prefisso diverso da IT su una partita europea: reverse charge, quindi
  // aliquota a zero. Se poi non e cosi si rimette a mano, ma il caso normale
  // non deve essere quello da correggere.
  const aggPiva = (v) => {
    const est = /^[A-Z]{2}/.test(v) && !/^IT/.test(v);
    setTotaleRaw(null);
    setB(x => ({ ...x, piva:v, aliquota: est ? '0' : (/^IT/.test(v) && x.aliquota === '0' ? '22' : x.aliquota) }));
  };
  const aggTotale = (v) => {
    setTotaleRaw(v);
    const a = num(b.aliquota) / 100;
    agg('importo', num(v) > 0 ? fmt(num(v) / (1 + a)) : '');
  };
  const xml = !!file && /\.xml$/i.test(file);
  const imponibile = parseFloat(String(b.importo).replace(',', '.')) || 0;
  const iva = imponibile * (parseFloat(b.aliquota) || 0) / 100;
  const totale = imponibile + iva;
  const ivaZero = (parseFloat(b.aliquota) || 0) === 0;
  const estera = /^[A-Z]{2}/.test(b.piva) && !/^IT/.test(b.piva);
  const ok = b.voce.trim().length > 2 && imponibile > 0;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="costo" onClick={e=>e.stopPropagation()} style={{width:700, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>Aggiungere un costo</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            La data puo essere di un mese passato: il costo entra nel mese a cui appartiene, non in
            quello in cui lo registri. Allegando la fattura la voce risulta documentata.
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'flex', flexDirection:'column', gap:20}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
            <EcoCampo etichetta="Voce di costo" span>
              <input value={b.voce} onChange={e=>agg('voce', e.target.value)} style={ECO_INP}
                placeholder="Che cosa si paga"/>
            </EcoCampo>
            <EcoCampo etichetta="Categoria">
              <select value={b.categoria} onChange={e=>agg('categoria', e.target.value)} style={ECO_SEL}>
                {['Personale','Consulenze','Software','Marketing','Assicurazioni','Cloud','API','Altro'].map(c =>
                  <option key={c} value={c}>{c}</option>)}
              </select>
            </EcoCampo>
            <EcoCampo etichetta="Fornitore">
              <input value={b.fornitore} onChange={e=>agg('fornitore', e.target.value)} style={ECO_INP}
                placeholder="Chi emette la fattura"/>
            </EcoCampo>
            {/* La partita IVA non e un dato anagrafico e basta: il prefisso dice
                il paese, e da li discende se l'operazione e in reverse charge.
                Scrivendo una partita estera l'aliquota si azzera da sola. */}
            <EcoCampo etichetta="Partita IVA"
              aiuto={estera ? 'Partita IVA estera: operazione in reverse charge, aliquota azzerata.' : null}>
              <input value={b.piva} onChange={e=>aggPiva(e.target.value.toUpperCase())} style={ECO_INP}
                placeholder="IT12345678901"/>
            </EcoCampo>
            {/* Nel conto economico entra l'IMPONIBILE: l'IVA non e un costo, la
                paghi al fornitore e la recuperi in liquidazione. Dalla cassa pero
                esce il totale, ed e per questo che servono tutti e tre. */}
            <div style={{gridColumn:'1 / -1'}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14, alignItems:'end'}}>
                <EcoCampo etichetta="Imponibile">
                  <input value={b.importo} onChange={e=>aggImponibile(e.target.value.replace(/[^\d.,]/g, ''))}
                    style={ECO_INP} placeholder="0,00"/>
                </EcoCampo>
                {/* Sola lettura: mostra a quanto corrisponde, non chiede un numero.
                    L'aliquota si sceglie, l'importo si legge. */}
                <EcoCampo etichetta="IVA">
                  <div style={{display:'flex', gap:8, alignItems:'stretch'}}>
                    <select value={b.aliquota} onChange={e=>{ setTotaleRaw(null); agg('aliquota', e.target.value); }}
                      style={{...ECO_SEL, width:96, flexShrink:0}}>
                      {['22','10','5','4','0'].map(a => <option key={a} value={a}>{a}%</option>)}
                    </select>
                    <div style={{flex:1, minWidth:0, display:'flex', alignItems:'center', padding:'0 12px',
                      borderRadius:9, background:'rgba(49,53,61,0.05)', border:`1px solid ${ADM.BORDER_SOFT}`,
                      fontSize:13.6, color: iva > 0 ? ADM.TEXT : ADM.MUTED_SOFT, ...ECO_NUM}}>
                      {iva > 0 ? fmt(iva) : '—'}
                    </div>
                  </div>
                </EcoCampo>
                <EcoCampo etichetta="Totale">
                  <input value={totaleRaw != null ? totaleRaw : (imponibile > 0 ? fmt(totale) : '')}
                    onChange={e=>aggTotale(e.target.value.replace(/[^\d.,]/g, ''))}
                    onBlur={()=>setTotaleRaw(null)}
                    style={{...ECO_INP, fontWeight:700}} placeholder="0,00"/>
                </EcoCampo>
              </div>
              <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.45}}>
                {ivaZero
                  ? 'Aliquota a zero: reverse charge o operazione non imponibile, come sui fornitori esteri. Imponibile e totale coincidono.'
                  : 'Scrivi l’imponibile oppure il totale, l’altro si ricalcola. Nel conto economico entra l’imponibile, dalla cassa esce il totale.'}
              </div>
            </div>
            <EcoCampo etichetta="Periodicita"
              aiuto={b.periodicita === 'annuale' ? 'Nel conto economico entra in dodicesimi.'
                : b.periodicita === 'una-tantum' ? 'Pesa solo sul mese della data.' : null}>
              <select value={b.periodicita} onChange={e=>agg('periodicita', e.target.value)} style={ECO_SEL}>
                {Object.entries(ECO_PERIODICITA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </EcoCampo>
            <EcoCampo etichetta="Data" span aiuto="Anche di un mese gia chiuso.">
              <input type="date" value={b.dal} onChange={e=>agg('dal', e.target.value)} style={ECO_INP}/>
            </EcoCampo>
          </div>

          <div>
            <div style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em', marginBottom:8}}>Fattura, se c'e</div>
            <label style={{display:'block'}}>
              <div className="adm-card-interactive" style={{border:`1.5px dashed ${file ? ADM.OK : ADM.BORDER}`,
                borderRadius:11, padding:'18px 16px', textAlign:'center', cursor:'pointer',
                background: file ? ADM.OK_SOFT : '#FCFCFD'}}>
                <div style={{fontSize:13.4, fontWeight:700, color: file ? ADM.OK : ADM.TEXT}}>
                  {file || 'Allega il documento'}
                </div>
                <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:4}}>
                  {file
                    ? (xml ? 'XML dallo SDI: la voce risulta automatica' : 'PDF: la voce resta manuale')
                    : 'XML dallo SDI oppure PDF · senza documento la voce resta manuale'}
                </div>
                <input type="file" style={{display:'none'}}
                  onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0].name : null)}/>
              </div>
            </label>
            {file && (
              <div style={{marginTop:14}}>
                <EcoCampo etichetta="Numero documento">
                  <input value={b.numero} onChange={e=>agg('numero', e.target.value)} style={ECO_INP}
                    placeholder="es. 118/2026"/>
                </EcoCampo>
              </div>
            )}
          </div>
        </div>

        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1}}>
            {ok
              ? `Nel conto economico ${ecoEur2(imponibile)}${iva > 0 ? `, dalla cassa ${ecoEur2(imponibile + iva)}` : ''}.`
              : 'Servono voce e imponibile.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!ok} onClick={()=>onSalva({ ...b, file })}>
            Aggiungi
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

// Allegare la fattura a un costo gia registrato. Stessa forma della modale di
// creazione, ridotta a cio che manca: il documento e i suoi due dati.
function EcoModaleAllega({ voce, onChiudi, onSalva }) {
  const [file, setFile] = useStateEco(null);
  const [b, setB] = useStateEco({ numero:'', iva:'' });
  const xml = !!file && /\.xml$/i.test(file);
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="allega" onClick={e=>e.stopPropagation()} style={{width:560, maxWidth:'92%', background:'#fff',
        borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.18s ease', maxHeight:'100%', overflowY:'auto'}}>
        <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, marginBottom:5}}>Allegare la fattura</div>
        <div style={{fontSize:12.6, color:ADM.MUTED, marginBottom:16, lineHeight:1.5}}>
          {voce.nome} · {ecoEur2(voce.importo)}. Senza documento questa voce resta manuale: e un
          numero che qualcuno ha scritto, non uno che si puo verificare.
        </div>
        <label style={{display:'block', marginBottom:16}}>
          <div className="adm-card-interactive" style={{border:`1.5px dashed ${file ? ADM.OK : ADM.BORDER}`,
            borderRadius:11, padding:'20px 16px', textAlign:'center', cursor:'pointer',
            background: file ? ADM.OK_SOFT : '#FCFCFD'}}>
            <div style={{fontSize:13.4, fontWeight:700, color: file ? ADM.OK : ADM.TEXT}}>
              {file || 'Scegli il documento'}
            </div>
            <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:4}}>
              {file ? (xml ? 'XML dallo SDI: la voce diventa automatica' : 'PDF: la voce resta manuale')
                    : 'XML dallo SDI oppure PDF'}
            </div>
            <input type="file" style={{display:'none'}}
              onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0].name : null)}/>
          </div>
        </label>
        {file && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16, marginBottom:18}}>
            <EcoCampo etichetta="Numero documento">
              <input value={b.numero} onChange={e=>setB(x=>({...x, numero:e.target.value}))} style={ECO_INP}
                placeholder="es. 118/2026"/>
            </EcoCampo>
            <EcoCampo etichetta="IVA" aiuto="Zero in reverse charge.">
              <input value={b.iva} onChange={e=>setB(x=>({...x, iva:e.target.value.replace(/[^\d.,]/g,'')}))}
                style={ECO_INP} placeholder="0,00"/>
            </EcoCampo>
          </div>
        )}
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!file} onClick={()=>onSalva({ ...b, file })}>
            Allega
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

// La casella del documento: stessa sagoma piena o vuota, come per i DPA dei
// fornitori — cambia il riempimento, non la forma.
function EcoDoc({ fattura }) {
  if (fattura) return (
    <span style={{display:'inline-flex', alignItems:'center', gap:6, maxWidth:'100%',
      padding:'3px 10px 3px 8px', borderRadius:8, border:`1px solid ${ADM.BORDER}`, background:'#fff'}}>
      <BuIcons.paperclip size={12} color={ADM.MUTED_SOFT}/>
      <span style={{fontSize:12, color:ADM.TEXT, overflow:'hidden', whiteSpace:'nowrap',
        textOverflow:'ellipsis'}}>{fattura.file}</span>
    </span>
  );
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:8,
      border:`1px dashed #F0A9AC`, background:ADM.DANGER_SOFT, color:ADM.DANGER,
      fontSize:12, fontWeight:700}}>carica</span>
  );
}

/* ═══ COSTI ══════════════════════════════════════════════════════════════ */
function EcoCosti({ mix, forza }) {
  const [nuovo, setNuovo] = useStateEco(false);
  const [doc, setDoc] = useStateEco(null);
  const [allega, setAllega] = useStateEco(null);
  const [modo, setModo] = useStateEco('mese');            // 'mese' | 'anno'
  const [k, setK] = useStateEco(ECO_STORICO.length - 1);  // mese selezionato
  const [anno, setAnno] = useStateEco(ECO_OGGI.getFullYear());

  const anni = [...new Set(ECO_STORICO.map(m => m.anno))].sort();
  const frazioneDi = (m) => m.corrente ? ECO_OGGI.getDate() / ecoGiorniNelMese(ECO_OGGI) : 1;

  // Il periodo e un INSIEME di mesi: uno solo, o tutti quelli di un anno fino a
  // oggi. Tenerlo cosi evita di scrivere due volte gli stessi conti.
  const mesi = modo === 'mese' ? [ECO_STORICO[k]] : ECO_STORICO.filter(m => m.anno === anno);
  const ultimo = mesi[mesi.length - 1];
  const primo = mesi[0];
  const etichetta = modo === 'mese'
    ? `${ECO_MESI_LUNGHI[primo.data.getMonth()]} ${primo.data.getFullYear()}`
    : String(anno);
  // Etichetta breve per le schede che seguono la prima: il mese da solo quando
  // si guarda un mese, l'anno quando si guarda un anno. L'anno per esteso lo
  // dice gia la scheda del totale, e ripeterlo tre volte e rumore.
  const periodoBreve = modo === 'mese' ? ECO_MESI_LUNGHI[primo.data.getMonth()] : String(anno);
  const sottoPeriodo = modo === 'mese'
    ? (primo.corrente ? `al giorno ${ECO_OGGI.getDate()} di ${ecoGiorniNelMese(ECO_OGGI)}` : 'mese chiuso')
    : (anno === ECO_OGGI.getFullYear()
        ? `dal 1° gennaio a oggi · ${mesi.length} ${mesi.length === 1 ? 'mese' : 'mesi'}`
        : `anno intero · ${mesi.length} ${mesi.length === 1 ? 'mese' : 'mesi'}`);

  const righeVar = ECO_SERVIZI.map(s => {
    const c = ecoConnessioneDi(s.id);
    const auto = !!c && c.stato === 'attivo';
    const consumo = mesi.reduce((t, m) => t + ecoConsumo(s, m) * frazioneDi(m), 0);
    const costo = mesi.reduce((t, m) => t + ecoCostoServizio(s, m) * (auto ? (s.scarto || 1) : 1) * frazioneDi(m), 0);
    const ft = ECO_FATTURE.find(x => x.voce === s.id) || null;
    return { s, c, ft, auto, consumo, costo };
  }).sort((a, b) => b.costo - a.costo);

  const dentro = (f, m) => {
    const dm = new Date(m.data.getFullYear(), m.data.getMonth(), 1);
    if (f.dal && dm < new Date(f.dal.getFullYear(), f.dal.getMonth(), 1)) return false;
    if (f.a && dm > f.a) return false;
    if (f.periodicita === 'una-tantum')
      return f.dal.getFullYear() === dm.getFullYear() && f.dal.getMonth() === dm.getMonth();
    return true;
  };
  const righeFisse = ECO_FISSI.map(f => {
    const mesiVal = mesi.filter(m => dentro(f, m));
    if (!mesiVal.length) return null;
    const perMese = f.periodicita === 'annuale' ? f.importo / 12 : f.importo;
    const quota = f.periodicita === 'una-tantum' ? f.importo : perMese * mesiVal.length;
    const ft = f.fattura ? ECO_FATTURE.find(x => x.id === f.fattura) : null;
    return { f, ft, auto: !!ft && ft.origine === 'sdi', quota, mesiVal:mesiVal.length };
  }).filter(Boolean).sort((a, b) => b.quota - a.quota);

  const totVar = righeVar.reduce((t, r) => t + r.costo, 0);
  const totFissi = righeFisse.reduce((t, r) => t + r.quota, 0);
  const unaTantum = righeFisse.filter(r => r.f.periodicita === 'una-tantum').reduce((t, r) => t + r.quota, 0);
  const maxVar = righeVar[0] ? righeVar[0].costo : 1;

  // La serie segue la granularita scelta: mesi o anni.
  const serie = modo === 'mese'
    ? ECO_STORICO.map((m, i) => ({ id:m.mese, i, sel: i === k, onSel: ()=>setK(i),
        tot: ecoCostiVariabili(m) * frazioneDi(m) + ecoFissiDelMese(new Date(m.data.getFullYear(), m.data.getMonth(), 1)) }))
    : anni.map(a => ({ id:String(a), sel: a === anno, onSel: ()=>setAnno(a),
        tot: ECO_STORICO.filter(m => m.anno === a).reduce((t, m) =>
          t + ecoCostiVariabili(m) * frazioneDi(m) + ecoFissiDelMese(new Date(m.data.getFullYear(), m.data.getMonth(), 1)), 0) }));
  const maxSerie = Math.max.apply(null, serie.map(x => x.tot)) || 1;

  const salva = (b) => {
    const quando = new Date(b.dal + 'T12:00:00');
    const imp = parseFloat(String(b.importo).replace(',', '.')) || 0;
    const ivaCalc = Math.round(imp * (parseFloat(b.aliquota) || 0)) / 100;
    let idFattura = null;
    if (b.file) {
      const iva = ivaCalc;
      idFattura = `FT-${quando.getFullYear()}-${String(ECO_FATTURE.length + 1).padStart(3, '0')}`;
      ECO_FATTURE.push({ id:idFattura, fornitore:b.fornitore.trim() || '—', piva:b.piva.trim(),
        numero:b.numero.trim() || '—',
        data:quando, imponibile:imp, iva, totale:imp + iva, categoria:b.categoria, voce:null,
        origine: /\.xml$/i.test(b.file) ? 'sdi' : 'manuale', file:b.file, stato:'riconciliata' });
    }
    ECO_FISSI.push({ id:'F-' + String(ECO_FISSI.length + 1).padStart(2, '0'),
      voce:b.voce.trim(), categoria:b.categoria, importo:imp,
      // L'IVA sta sul costo e non solo sulla fattura: serve alla cassa anche
      // quando il documento non e ancora stato allegato.
      iva: ivaCalc,
      periodicita:b.periodicita,
      dal:quando, a:null, fornitore:b.fornitore.trim() || '—', piva:b.piva.trim(), fattura:idFattura });
    setNuovo(false); forza();
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {[
          { et:`Costi ${etichetta}`, v:ecoEur(totVar + totFissi), n:sottoPeriodo },
          { et:`Costi a consumo ${periodoBreve}`, v:ecoEur(totVar),
            n:`${(totVar / (totVar + totFissi) * 100).toFixed(0)}% del totale` },
          { et:`Costi fissi ${periodoBreve}`, v:ecoEur(totFissi),
            n: unaTantum > 0 ? `di cui ${ecoEur(unaTantum)} una tantum` : 'nessuna voce una tantum' },
          // Anche qui il periodo, altrimenti 218 al mese e 2.138 all'anno finiscono
          // sotto la stessa dicitura e sembrano lo stesso numero sbagliato.
          { et:`Per locale attivo ${periodoBreve}`, v:ecoEur2((totVar + totFissi) / (modo === 'mese' ? ultimo.localiAttivi : mesi.reduce((t,m)=>t+m.localiAttivi,0) / mesi.length)),
            n: modo === 'mese' ? `su ${ultimo.localiAttivi} locali attivi` : `su ${Math.round(mesi.reduce((t,m)=>t+m.localiAttivi,0) / mesi.length)} locali attivi in media` },
        ].map(c => (
          <div key={c.et} style={{...ECO_CARD, padding:'15px 17px'}}>
            <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em'}}>{c.et}</div>
            <div style={{fontSize:25, fontWeight:800, letterSpacing:'-0.02em', color:ADM.TEXT,
              marginTop:7, ...ECO_NUM}}>{c.v}</div>
            <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.4}}>{c.n}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Andamento</div>
          <AdmTabBar variant="segmented" active={modo} onChange={setModo}
            tabs={[{ id:'mese', label:'Per mese' }, { id:'anno', label:'Per anno' }]}/>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setNuovo(true)}>Aggiungi un costo</AdmButton>
        </div>
        <div style={{...ECO_CARD, padding:'14px 16px', display:'flex', alignItems:'flex-end',
          gap: modo === 'mese' ? 6 : 14}}>
          {serie.map(x => (
            <button key={x.id} onClick={x.onSel} className="adm-card-interactive"
              title={`${x.id} · ${ecoEur(x.tot)}`}
              style={{flex:1, minWidth:0, border:'none', background:'transparent', cursor:'pointer',
                fontFamily:'inherit', padding:'4px 2px', borderRadius:8,
                display:'flex', flexDirection:'column', alignItems:'center', gap:5}}>
              <span style={{fontSize: modo === 'mese' ? 10.8 : 12.4, fontWeight:700,
                color: x.sel ? ADM.TEXT : ADM.MUTED_SOFT, ...ECO_NUM}}>
                {x.tot >= 1000 ? `${(Math.round(x.tot / 100) / 10).toString().replace('.', ',')}k` : Math.round(x.tot)}
              </span>
              <span style={{width:'100%', height:Math.max(6, Math.round(x.tot / maxSerie * 54)), borderRadius:5,
                background: x.sel ? ADM.PINK : 'rgba(49,53,61,0.14)'}}/>
              <span style={{fontSize: modo === 'mese' ? 10.6 : 12.2, color: x.sel ? ADM.TEXT : ADM.MUTED_SOFT,
                fontWeight: x.sel ? 700 : 500}}>{x.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={ECO_H}>Costi a consumo</div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:ECO_GRID_VAR, gap:11}}>
            <div>Servizio</div><div>Dipende da</div><div>Consumo</div><div>Costo</div><div>Fonte</div><div>Documento</div>
          </div>
          {righeVar.map((r, i) => (
            <div key={r.s.id} className="adm-row-open"
              onClick={()=> r.ft ? setDoc(r.ft) : setAllega({ id:r.s.id, tipo:'servizio', nome:r.s.nome, importo:r.costo })}
              style={{display:'grid', gridTemplateColumns:ECO_GRID_VAR, gap:11,
              alignItems:'center', padding:'12px 16px', cursor:'pointer',
              borderBottom: i < righeVar.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{r.s.nome}</div>
                <div style={{marginTop:5}}><EcoBarra quota={r.costo / maxVar} tono={r.auto ? ADM.OK : ADM.INK}/></div>
              </div>
              <div style={{fontSize:12, color:ADM.MUTED, lineHeight:1.4}}>{ECO_DRIVER_LABEL[r.s.driver]}</div>
              <div style={{fontSize:12.4, color:ADM.MUTED, ...ECO_NUM}}>
                {Math.round(r.consumo).toLocaleString('it-IT', {useGrouping:true})}
                <span style={{color:ADM.MUTED_SOFT}}> {r.s.unita}</span>
              </div>
              <div style={{fontSize:13.8, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur(r.costo)}</div>
              <div><EcoFonte automatica={r.auto}
                da={r.auto ? `Letta da ${r.c.nome}` : r.c ? `${r.c.nome}: ${ECO_STATO_CONN[r.c.stato].label}` : 'Stima del modello'}/></div>
              <div style={{minWidth:0}}><EcoDoc fattura={r.ft}/></div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Costi fissi e una tantum</div>
          {unaTantum > 0 && (
            <span style={{fontSize:12.4, color:ADM.WARN, fontWeight:700}}>
              {ecoEur(unaTantum)} una tantum nel periodo
            </span>
          )}
        </div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:ECO_GRID_FIS, gap:11}}>
            <div>Voce</div><div>Categoria</div><div>Fornitore</div><div>Periodicità</div>
            <div>Importo</div><div>Fonte</div><div>Documento</div>
          </div>
          {righeFisse.map((r, i) => (
            <div key={r.f.id} className="adm-row-open"
              onClick={()=> r.ft ? setDoc(r.ft) : setAllega({ id:r.f.id, tipo:'fisso', nome:r.f.voce, importo:r.f.importo })}
              style={{display:'grid', gridTemplateColumns:ECO_GRID_FIS, gap:11,
              alignItems:'center', padding:'12px 16px', cursor:'pointer',
              borderBottom: i < righeFisse.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{r.f.voce}</div>
                {modo === 'anno' && r.f.periodicita !== 'una-tantum' && (
                  <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>
                    {ecoEur2(r.f.periodicita === 'annuale' ? r.f.importo / 12 : r.f.importo)} × {r.mesiVal} mesi
                  </div>
                )}
              </div>
              <div style={{fontSize:12.4, color:ADM.MUTED}}>{r.f.categoria}</div>
              <div style={{fontSize:12.4, color:ADM.MUTED, minWidth:0, overflow:'hidden',
                whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{r.f.fornitore}</div>
              <div style={{fontSize:12.2, color: r.f.periodicita === 'una-tantum' ? ADM.WARN : ADM.MUTED,
                fontWeight: r.f.periodicita === 'una-tantum' ? 700 : 500}}>
                {ECO_PERIODICITA[r.f.periodicita]}
              </div>
              <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur2(r.quota)}</div>
              <div><EcoFonte automatica={r.auto} da={r.auto ? 'Letta dalla fattura elettronica' : 'Inserita a mano'}/></div>
              <div style={{minWidth:0}}><EcoDoc fattura={r.ft}/></div>
            </div>
          ))}
        </div>
      </div>

      {nuovo && <EcoModaleCosto onChiudi={()=>setNuovo(false)} onSalva={salva}/>}
      {allega && <EcoModaleAllega voce={allega} onChiudi={()=>setAllega(null)} onSalva={(b)=>{
        const iva = parseFloat(String(b.iva).replace(',', '.')) || 0;
        const id = `FT-${ultimo.data.getFullYear()}-${String(ECO_FATTURE.length + 1).padStart(3, '0')}`;
        const fisso = allega.tipo === 'fisso' ? ECO_FISSI.find(f => f.id === allega.id) : null;
        ECO_FATTURE.push({ id, fornitore: fisso ? fisso.fornitore : (ECO_SERVIZI.find(x => x.id === allega.id) || {}).fornitore || '—',
          numero:b.numero.trim() || '—', data:new Date(ultimo.data.getFullYear(), ultimo.data.getMonth(), 1),
          imponibile:allega.importo, iva, totale:allega.importo + iva,
          categoria: fisso ? fisso.categoria : 'Cloud', voce: fisso ? null : allega.id,
          origine: /\.xml$/i.test(b.file) ? 'sdi' : 'manuale', file:b.file, stato:'riconciliata' });
        if (fisso) fisso.fattura = id;
        setAllega(null); forza();
      }}/>}
      {doc && <EcoModaleDocumento fattura={doc} onChiudi={()=>setDoc(null)}/>}
    </div>
  );
}

const ECO_DRIVER_LABEL = {
  localiAttivi:'Locali attivi',
  nuoviLocali:'Nuovi locali attivati nel mese',
  utentiApp:'Utenti app attivi',
  transazioni:'Transazioni (pagamenti)',
  fisso:'Niente — canone fisso',
};

window.EcoCosti = EcoCosti;
window.ECO_CARD = ECO_CARD;
window.ECO_TH = ECO_TH;
window.ECO_H = ECO_H;
window.ECO_INP = ECO_INP;
window.ECO_SEL = ECO_SEL;
window.ECO_NUM = ECO_NUM;
window.ECO_MESI_LUNGHI = ECO_MESI_LUNGHI;
window.ECO_PERIODICITA = ECO_PERIODICITA;
window.ECO_DRIVER_LABEL = ECO_DRIVER_LABEL;
window.EcoCampo = EcoCampo;
window.EcoBarra = EcoBarra;
window.EcoFonte = EcoFonte;
window.EcoDoc = EcoDoc;

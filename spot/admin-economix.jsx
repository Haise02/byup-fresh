// Economix — dove vanno i soldi di Byup e dove andranno.
const { useState: useStateEco } = React;

const ECO_CARD = { border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden', background:'#fff' };
const ECO_TH = { padding:'9px 16px', background:'#FAFAFB', borderBottom:`1px solid ${ADM.BORDER}`,
  fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em' };
const ECO_H = { fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:10 };
// Titolo di blocco: sta sopra piu tabelle e ne comanda i controlli, quindi pesa
// piu delle intestazioni delle singole tabelle invece di confondersi con loro.
const ECO_TITOLO = { fontSize:13.4, fontWeight:800, color:ADM.TEXT, textTransform:'uppercase',
  letterSpacing:'0.08em' };
const ECO_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };
const ECO_SEL = { ...ECO_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };
const ECO_NUM = { fontVariantNumeric:'tabular-nums' };
const ECO_GRID_VAR = 'minmax(0,1.65fr) 1.15fr 1.2fr 108px 108px minmax(0,1.05fr)';
const ECO_GRID_CESP = 'minmax(0,1.5fr) 1fr 1fr 1fr 1.1fr 1fr 1.15fr';
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
// Una modale sola per creare e per modificare: i campi sono gli stessi, e
// averne due avrebbe voluto dire tenerle allineate a mano per sempre.
function EcoModaleCosto({ costo, onChiudi, onSalva, onElimina, onDoc }) {
  const modifica = !!costo;
  const fmtN = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
  // IVA non registrata non e IVA a zero: sulle voci nate prima che il campo
  // esistesse si riparte dal 22%, altrimenti aprire una riga per guardarla le
  // azzererebbe l'aliquota al primo salvataggio.
  // Un cespite non ha periodicita: e quello che lo distingue da un costo.
  const eraCespite = !!(costo && !costo.periodicita);
  const aliquotaDi = (imp, iva) => {
    if (!imp || iva == null) return '22';
    const a = Math.round(iva / imp * 100);
    return ['22','10','5','4','0'].indexOf(String(a)) !== -1 ? String(a) : '22';
  };
  const [b, setB] = useStateEco(() => costo ? {
    tipo: eraCespite ? 'cespite' : 'costo',
    voce:costo.voce, categoria:costo.categoria,
    importo: fmtN(eraCespite ? costo.costo : costo.importo),
    periodicita: costo.periodicita || 'una-tantum',
    dal: (eraCespite ? costo.data : costo.dal).toISOString().slice(0, 10),
    fornitore:costo.fornitore === '—' ? '' : costo.fornitore, piva:costo.piva || '',
    numero:'', aliquota:aliquotaDi(eraCespite ? costo.costo : costo.importo, costo.iva),
    amm: String(eraCespite ? costo.aliquota : 20), ammScelto: eraCespite,
  } : { tipo:'costo', voce:'', categoria:'Software', importo:'', periodicita:'mensile',
    dal: new Date().toISOString().slice(0, 10), fornitore:'', piva:'', numero:'',
    aliquota:'22', amm:'20', ammScelto:false });
  const cespite = b.tipo === 'cespite';
  // Scegliere «Attrezzature» dice gia che si sta comprando qualcosa che dura:
  // la natura si sposta da sola, altrimenti un macchinario entrerebbe come spesa
  // del mese solo perche nessuno ha toccato un secondo menu.
  const cambiaCategoria = (c) => setB(x => ({ ...x, categoria:c,
    tipo: !modifica && ECO_CAT_DUREVOLI.indexOf(c) !== -1 ? 'cespite' : x.tipo,
    periodicita: ECO_CAT_DUREVOLI.indexOf(c) !== -1 ? 'una-tantum' : x.periodicita }));
  const [file, setFile] = useStateEco(null);
  const allegata = modifica && costo.fattura ? ECO_FATTURE.find(x => x.id === costo.fattura) : null;
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
  // Chi sceglie «bene strumentale» sta quasi sempre comprando attrezzatura:
  // lasciare «Software» costringerebbe a correggere la categoria ogni volta.
  const cambiaTipo = (t) => setB(x => ({ ...x, tipo:t,
    periodicita: t === 'cespite' ? 'una-tantum' : x.periodicita,
    categoria: t === 'cespite' && x.categoria === 'Software' ? 'Attrezzature'
      : t === 'costo' && x.categoria === 'Attrezzature' ? 'Software' : x.categoria }));
  const xml = !!file && /\.xml$/i.test(file);
  const imponibile = parseFloat(String(b.importo).replace(',', '.')) || 0;
  const iva = imponibile * (parseFloat(b.aliquota) || 0) / 100;
  const totale = imponibile + iva;
  const ivaZero = (parseFloat(b.aliquota) || 0) === 0;
  const estera = /^[A-Z]{2}/.test(b.piva) && !/^IT/.test(b.piva);
  // Sotto la soglia di legge il bene si deduce tutto nell'anno. La proposta deve
  // seguire l'importo mentre lo si scrive: fissarla all'apertura della modale la
  // lasciava al 100% anche dopo aver digitato 2.400 euro, perche quando il tipo
  // e stato scelto il campo era ancora vuoto.
  const ammProposta = imponibile > 0 && imponibile < ECO_SOGLIA_CESPITE ? '100' : '20';
  const durata = ECO_DURATE_AMM.find(x => String(x.v) === String(b.ammScelto ? b.amm : ammProposta));
  const amm = b.ammScelto ? b.amm : ammProposta;
  const quotaAnnua = imponibile * (parseFloat(amm) || 0) / 100;
  const ok = b.voce.trim().length > 2 && imponibile > 0;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="costo" onClick={e=>e.stopPropagation()} style={{width:700, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>
            {modifica ? costo.voce : cespite ? 'Registrare un bene strumentale' : 'Aggiungere un costo'}
          </div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            {modifica
              ? `${ECO_PERIODICITA[costo.periodicita]} · dal ${cfFmt(costo.dal)}${costo.fornitore && costo.fornitore !== '—' ? ` · ${costo.fornitore}` : ''}`
              : cespite
                ? 'Un bene non è un costo: la cassa esce tutta il giorno dell’acquisto, il conto economico lo assorbe a quote e il valore residuo resta fra le immobilizzazioni.'
                : 'La data può essere di un mese passato: il costo entra nel mese a cui appartiene, non in quello in cui lo registri. Allegando la fattura la voce risulta documentata.'}
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'flex', flexDirection:'column', gap:20}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
            {/* Prima domanda, perche cambia dove finisce tutto il resto: una
                spesa si consuma nel mese, un bene resta e si ammortizza. */}
            <EcoCampo etichetta="Natura" span
              aiuto={cespite
                ? 'Esce dalla cassa tutto oggi, ma nel conto economico entra un dodicesimo alla volta. Il valore residuo resta nello stato patrimoniale.'
                : 'Pesa sul conto economico del periodo a cui appartiene.'}>
              <select value={b.tipo} onChange={e=>cambiaTipo(e.target.value)} disabled={modifica}
                style={{...ECO_SEL, opacity: modifica ? 0.6 : 1}}>
                <option value="costo">Spesa d’esercizio</option>
                <option value="cespite">Bene strumentale · si ammortizza</option>
              </select>
            </EcoCampo>
            <EcoCampo etichetta={cespite ? 'Che cosa si compra' : 'Voce di costo'} span>
              <input value={b.voce} onChange={e=>agg('voce', e.target.value)} style={ECO_INP}
                placeholder={cespite ? 'es. MacBook Pro 14”' : 'Che cosa si paga'}/>
            </EcoCampo>
            <EcoCampo etichetta="Categoria">
              <select value={b.categoria} onChange={e=>cambiaCategoria(e.target.value)} style={ECO_SEL}>
                {ECO_CATEGORIE.map(g => (
                  <optgroup key={g.g} label={g.g}>
                    {g.voci.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                ))}
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
            {cespite ? (
              <EcoCampo etichetta="In quanto tempo si ammortizza"
                aiuto={imponibile > 0 && quotaAnnua > 0
                  ? `${ecoEur2(quotaAnnua / 12)} al mese${durata && durata.anni ? ` per ${durata.anni} anni` : ''} · il primo esercizio a metà aliquota, come prevede la norma`
                  : null}>
                <select value={amm} onChange={e=>setB(x => ({ ...x, amm:e.target.value, ammScelto:true }))}
                  style={ECO_SEL}>
                  {ECO_DURATE_AMM.map(a => <option key={a.v} value={a.v}>{a.label}</option>)}
                </select>
              </EcoCampo>
            ) : (
              <EcoCampo etichetta="Periodicita"
                aiuto={b.periodicita === 'annuale' ? 'Nel conto economico entra in dodicesimi.'
                  : b.periodicita === 'una-tantum' ? 'Pesa solo sul mese della data.' : null}>
                <select value={b.periodicita} onChange={e=>agg('periodicita', e.target.value)} style={ECO_SEL}>
                  {Object.entries(ECO_PERIODICITA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </EcoCampo>
            )}
            <EcoCampo etichetta={cespite ? 'Data d’acquisto' : 'Data'} span
              aiuto={cespite ? 'Da qui parte l’ammortamento.' : 'Anche di un mese gia chiuso.'}>
              <input type="date" value={b.dal} onChange={e=>agg('dal', e.target.value)} style={ECO_INP}/>
            </EcoCampo>
          </div>

          <div>
            <div style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em', marginBottom:8}}>Fattura, se c'è</div>
            {allegata ? (
              <button onClick={()=>onDoc(allegata)} className="adm-card-interactive"
                style={{display:'flex', alignItems:'center', gap:12, width:'100%', textAlign:'left',
                  padding:'13px 15px', borderRadius:11, cursor:'pointer', fontFamily:'inherit',
                  border:`1px solid ${ADM.BORDER}`, background:'#FCFCFD'}}>
                <BuIcons.paperclip size={15} color={ADM.MUTED_SOFT}/>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:'block', fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{allegata.file}</span>
                  <span style={{display:'block', fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>
                    {allegata.numero} · {ecoEur2(allegata.totale)} · apri il documento
                  </span>
                </span>
              </button>
            ) : (
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
            )}
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
          {modifica && (
            <AdmButton variant="ghost" size="sm" style={{color:ADM.DANGER, flexShrink:0}}
              onClick={()=>onElimina(costo)}>Elimina</AdmButton>
          )}
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1}}>
            {!ok ? (cespite ? 'Servono il bene e l’imponibile.' : 'Servono voce e imponibile.')
              : cespite
                ? `Dalla cassa ${ecoEur2(imponibile + iva)} oggi, nel conto economico ${ecoEur2(quotaAnnua / 12)} al mese.`
                : `Nel conto economico ${ecoEur2(imponibile)}${iva > 0 ? `, dalla cassa ${ecoEur2(imponibile + iva)}` : ''}.`}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!ok} onClick={()=>onSalva({ ...b, amm, file })}>
            {modifica ? 'Salva' : 'Aggiungi'}
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

// Eliminare un costo ricorrente non tocca un mese: li tocca tutti, passati
// compresi. Va detto prima, con i numeri, perche l'effetto non e visibile dal
// punto in cui si preme.
function EcoConfermaElimina({ costo, daQuando, onChiudi, onConferma }) {
  // Un cespite non ha periodicita e non si chiude da una data: o l'hai comprato
  // o non l'hai comprato, quindi si toglie tutto insieme all'ammortamento che ha
  // gia prodotto.
  const cespite = !costo.periodicita;
  const imp = cespite ? { restano:0, spariscono:0 } : ecoImpattoEliminazione(costo, daQuando);
  const unaTantum = cespite || costo.periodicita === 'una-tantum';
  const daMese = `${ECO_MESI_LUNGHI[daQuando.getMonth()]} ${daQuando.getFullYear()}`;
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:61, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="elimina" onClick={e=>e.stopPropagation()} style={{width:520, maxWidth:'92%', background:'#fff',
        borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.18s ease'}}>
        <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
          Eliminare {costo.voce}?
        </div>
        {/* Il passato non si riscrive: i mesi gia trascorsi quel costo l'hanno
            avuto davvero, e toglierlo anche da li cambierebbe consuntivi chiusi. */}
        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:15}}>
          {cespite
            ? `È un bene strumentale acquistato il ${cfFmt(costo.data)}: sparisce dallo stato patrimoniale e con lui l’ammortamento già maturato.`
            : unaTantum
            ? `È una voce una tantum: sparisce dal mese di ${cfFmt(costo.dal)} e dal conto economico.`
            : imp.restano === 0
              ? `È una voce ${ECO_PERIODICITA[costo.periodicita].toLowerCase()} che non ha mesi precedenti: sparisce del tutto.`
              : `È una voce ${ECO_PERIODICITA[costo.periodicita].toLowerCase()}: sparisce da ${daMese} in poi. I mesi precedenti restano come sono — quel costo l’hanno avuto davvero.`}
        </div>
        <div style={{padding:'13px 15px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16}}>
          {/* «Mesi che spariscono» sarebbe una mezza verita su un ricorrente: nello
              storico ne trova uno, ma la voce sarebbe andata avanti all'infinito.
              Si dice invece cosa resta a consuntivo e da quando smette di contare. */}
          {[['Importo', `${ecoEur2(cespite ? costo.costo : costo.importo)}${costo.iva ? ` più ${ecoEur2(costo.iva)} di IVA` : ''}`],
            ...(cespite ? [['Ammortizzato finora', ecoEur2(ecoAmmortamento(costo, ECO_OGGI).fondo)],
              ['Valore residuo', ecoEur2(ecoAmmortamento(costo, ECO_OGGI).residuo)]] : []),
            ...(unaTantum || imp.restano === 0 ? [] : [
              ['Resta a consuntivo', imp.restano === 1 ? '1 mese' : `${imp.restano} mesi`],
              ['Non conteggiato da', daMese]]),
            ['Documento', costo.fattura ? 'una fattura resta collegata' : 'nessuno']].map(([k, v]) => (
            <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
              <span style={{color:ADM.MUTED, width:150, flexShrink:0}}>{k}</span>
              <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" onClick={onConferma}>
            {unaTantum || imp.restano === 0 ? 'Elimina' : `Elimina da ${ECO_MESI[daQuando.getMonth()]}`}
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

/* ═══ COSTI ══════════════════════════════════════════════════════════════ */
function EcoCosti({ mix, forza }) {
  const [nuovo, setNuovo] = useStateEco(false);
  const [doc, setDoc] = useStateEco(null);
  const [allega, setAllega] = useStateEco(null);
  const [modifica, setModifica] = useStateEco(null);
  const [elimina, setElimina] = useStateEco(null);
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

  // Un cespite compare da quando e stato comprato: la quota e l'ammortamento
  // maturato nei mesi del periodo scelto, il residuo e il valore a fine periodo.
  const righeCesp = ECO_CESPITI.map(c => {
    const acq = new Date(c.data.getFullYear(), c.data.getMonth(), 1);
    if (acq > new Date(ultimo.data.getFullYear(), ultimo.data.getMonth(), 1)) return null;
    const quota = mesi.reduce((t, m) => t + ecoAmmortamento(c, m.data).quota, 0);
    const fine = ecoAmmortamento(c, ultimo.data);
    return { c, quota, residuo:fine.residuo, ft: c.fattura ? ECO_FATTURE.find(x => x.id === c.fattura) : null };
  }).filter(Boolean).sort((a, b) => b.c.costo - a.c.costo);
  const quotaCesp = righeCesp.reduce((t, r) => t + r.quota, 0);
  const residuoCesp = righeCesp.reduce((t, r) => t + r.residuo, 0);

  const tagliaDa = modo === 'mese' ? primo.data : ECO_OGGI;

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
    // Un bene strumentale non entra fra i costi: entra fra i cespiti, e nel
    // conto economico ci arriva dopo, un dodicesimo alla volta.
    if (b.tipo === 'cespite') {
      ECO_CESPITI.push({ id:'C-' + String(ECO_CESPITI.length + 1).padStart(2, '0'),
        voce:b.voce.trim(), categoria:b.categoria, costo:imp, iva:ivaCalc, data:quando,
        aliquota: parseFloat(b.amm) || 20,
        fornitore:b.fornitore.trim() || '—', piva:b.piva.trim(), fattura:idFattura });
    } else {
      ECO_FISSI.push({ id:'F-' + String(ECO_FISSI.length + 1).padStart(2, '0'),
        voce:b.voce.trim(), categoria:b.categoria, importo:imp,
        // L'IVA sta sul costo e non solo sulla fattura: serve alla cassa anche
        // quando il documento non e ancora stato allegato.
        iva: ivaCalc,
        periodicita:b.periodicita,
        dal:quando, a:null, fornitore:b.fornitore.trim() || '—', piva:b.piva.trim(), fattura:idFattura });
    }
    setNuovo(false); forza();
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:26}}>
      {/* L'andamento comincia qui: il titolo e la granularita comandano sia le
          schede sia il grafico, quindi stanno sopra entrambi e non in mezzo. */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={ECO_TITOLO}>Andamento</div>
        <div style={{flex:1}}/>
        <AdmTabBar variant="segmented" active={modo} onChange={setModo}
          tabs={[{ id:'mese', label:'Per mese' }, { id:'anno', label:'Per anno' }]}/>
      </div>
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

        <div style={{...ECO_CARD, padding:'16px 16px 14px', display:'flex', alignItems:'flex-end',
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
              <span style={{width:'100%', height:Math.max(8, Math.round(x.tot / maxSerie * 78)), borderRadius:5,
                background: x.sel ? ADM.PINK : 'rgba(49,53,61,0.14)'}}/>
              {/* Senza nowrap «mag 25» va a capo e «gen 25» no: le etichette
                  perdono la linea comune e le barre sembrano di altezze diverse. */}
              <span style={{fontSize: modo === 'mese' ? 10.6 : 12.2, color: x.sel ? ADM.TEXT : ADM.MUTED_SOFT,
                fontWeight: x.sel ? 700 : 500, whiteSpace:'nowrap'}}>{x.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Le due tabelle sono un blocco solo — «Costi» — e il pulsante che ne
          aggiunge uno sta li, non appeso al grafico che non c'entra. */}
      <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={ECO_TITOLO}>Costi</div>
        <div style={{flex:1}}/>
        <AdmButton variant="primary" size="sm" onClick={()=>setNuovo(true)}>Aggiungi un costo</AdmButton>
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
            <div key={r.f.id} className="adm-row-open" onClick={()=>setModifica(r.f)}
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
              <div style={{minWidth:0}} onClick={e=>e.stopPropagation()}>
                <span onClick={()=> r.ft ? setDoc(r.ft) : setAllega({ id:r.f.id, tipo:'fisso', nome:r.f.voce, importo:r.f.importo })}
                  className="adm-card-interactive" style={{display:'inline-block', cursor:'pointer'}}>
                  <EcoDoc fattura={r.ft}/>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Non sono costi e non stanno fra i costi: escono dalla cassa in un colpo
          solo e nel conto economico entrano a quote. Senza una tabella loro un
          acquisto registrato sembrerebbe non essere stato salvato. */}
      {righeCesp.length > 0 && (
        <div>
          <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
            <div style={{...ECO_H, marginBottom:0}}>Beni strumentali</div>
            <span style={{fontSize:12.4, color:ADM.MUTED}}>
              {ecoEur(quotaCesp)} di ammortamento nel periodo · {ecoEur(residuoCesp)} di valore residuo
            </span>
          </div>
          <div style={ECO_CARD}>
            <div style={{...ECO_TH, display:'grid', gridTemplateColumns:ECO_GRID_CESP, gap:11}}>
              <div>Bene</div><div>Categoria</div><div>Acquistato il</div><div>Costo</div>
              <div>Quota del periodo</div><div>Residuo</div><div>Documento</div>
            </div>
            {righeCesp.map((r, i) => (
              <div key={r.c.id} className="adm-row-open" onClick={()=>setModifica(r.c)}
                style={{display:'grid', gridTemplateColumns:ECO_GRID_CESP, gap:11,
                alignItems:'center', padding:'12px 16px', cursor:'pointer',
                borderBottom: i < righeCesp.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT, overflow:'hidden',
                    whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{r.c.voce}</div>
                  <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>
                    {(ECO_DURATE_AMM.find(x => x.v === r.c.aliquota) || {}).label || `${r.c.aliquota}% l’anno`}
                  </div>
                </div>
                <div style={{fontSize:12.4, color:ADM.MUTED}}>{r.c.categoria}</div>
                <div style={{fontSize:12.4, color:ADM.MUTED}}>{cfFmt(r.c.data)}</div>
                <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur2(r.c.costo)}</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, ...ECO_NUM}}>{ecoEur2(r.quota)}</div>
                <div style={{fontSize:13, fontWeight:600, color: r.residuo > 0 ? ADM.TEXT : ADM.MUTED_SOFT, ...ECO_NUM}}>
                  {r.residuo > 0 ? ecoEur2(r.residuo) : 'ammortizzato'}
                </div>
                <div style={{minWidth:0}} onClick={e=>e.stopPropagation()}>
                  <span onClick={()=> r.ft ? setDoc(r.ft) : setAllega({ id:r.c.id, tipo:'cespite', nome:r.c.voce, importo:r.c.costo })}
                    className="adm-card-interactive" style={{display:'inline-block', cursor:'pointer'}}>
                    <EcoDoc fattura={r.ft}/>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nuovo && <EcoModaleCosto onChiudi={()=>setNuovo(false)} onSalva={salva}/>}
      {modifica && <EcoModaleCosto key={modifica.id} costo={modifica}
        onChiudi={()=>setModifica(null)} onDoc={(f)=>{ setModifica(null); setDoc(f); }}
        onElimina={(c)=>setElimina(c)}
        onSalva={(b)=>{
          const imp = parseFloat(String(b.importo).replace(',', '.')) || 0;
          const iva = Math.round(imp * (parseFloat(b.aliquota) || 0)) / 100;
          const comune = { voce:b.voce.trim(), categoria:b.categoria, iva,
            fornitore:b.fornitore.trim() || '—', piva:b.piva.trim() };
          Object.assign(modifica, b.tipo === 'cespite'
            ? { ...comune, costo:imp, aliquota: parseFloat(b.amm) || 20, data:new Date(b.dal + 'T12:00:00') }
            : { ...comune, importo:imp, periodicita:b.periodicita, dal:new Date(b.dal + 'T12:00:00') });
          setModifica(null); forza();
        }}/>}
      {/* Si taglia dal mese che si sta guardando. Su un anno intero non esiste
          un mese solo, e tagliare da gennaio cancellerebbe dodici mesi gia
          consuntivati: in quel caso si chiude da oggi. */}
      {elimina && <EcoConfermaElimina costo={elimina} daQuando={tagliaDa}
        onChiudi={()=>setElimina(null)}
        onConferma={()=>{ ecoEliminaCosto(elimina, tagliaDa); setElimina(null); setModifica(null); forza(); }}/>}
      {allega && <EcoModaleAllega voce={allega} onChiudi={()=>setAllega(null)} onSalva={(b)=>{
        const iva = parseFloat(String(b.iva).replace(',', '.')) || 0;
        const id = `FT-${ultimo.data.getFullYear()}-${String(ECO_FATTURE.length + 1).padStart(3, '0')}`;
        const fisso = allega.tipo === 'fisso' ? ECO_FISSI.find(f => f.id === allega.id)
          : allega.tipo === 'cespite' ? ECO_CESPITI.find(c => c.id === allega.id) : null;
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
window.EcoModaleCosto = EcoModaleCosto;
window.EcoConfermaElimina = EcoConfermaElimina;
window.ECO_CARD = ECO_CARD;
window.ECO_TH = ECO_TH;
window.ECO_H = ECO_H;
window.ECO_TITOLO = ECO_TITOLO;
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

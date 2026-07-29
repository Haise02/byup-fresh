// Economix — fatture, conto economico riclassificato e proiezione.

/* ═══ 3 · FATTURE ════════════════════════════════════════════════════════ */
function EcoModaleFattura({ onChiudi, onSalva }) {
  const [file, setFile] = useStateEco(null);
  const [b, setB] = useStateEco({ fornitore:'', numero:'', data:new Date().toISOString().slice(0,10),
    imponibile:'', iva:'', categoria:'Cloud' });
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const xml = !!file && /\.xml$/i.test(file);
  const ok = !!file && b.fornitore.trim().length > 1 && parseFloat(String(b.imponibile).replace(',', '.')) > 0;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="fattura" onClick={e=>e.stopPropagation()} style={{width:660, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>Caricare una fattura</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            La fattura elettronica italiana viaggia in XML dallo SDI: i dati si leggono, non si
            estraggono a indovinare da un PDF. Caricando un XML i campi qui sotto arriverebbero
            compilati; da un PDF vanno scritti.
          </div>
        </div>
        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0}}>
          <label style={{display:'block', marginBottom:18}}>
            <div className="adm-card-interactive" style={{border:`1.5px dashed ${file ? ADM.OK : ADM.BORDER}`,
              borderRadius:11, padding:'20px 16px', textAlign:'center', cursor:'pointer',
              background: file ? ADM.OK_SOFT : '#FCFCFD'}}>
              <div style={{fontSize:13.4, fontWeight:700, color: file ? ADM.OK : ADM.TEXT}}>
                {file || 'Scegli il file della fattura'}
              </div>
              <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:4}}>
                {file
                  ? (xml ? 'XML dello SDI: i campi sarebbero già compilati' : 'PDF: i campi vanno inseriti a mano')
                  : 'XML dello SDI, oppure PDF'}
              </div>
              <input type="file" style={{display:'none'}}
                onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0].name : null)}/>
            </div>
          </label>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
            <EcoCampo etichetta="Fornitore">
              <input value={b.fornitore} onChange={e=>agg('fornitore', e.target.value)} style={ECO_INP}
                placeholder="Ragione sociale"/>
            </EcoCampo>
            <EcoCampo etichetta="Numero documento">
              <input value={b.numero} onChange={e=>agg('numero', e.target.value)} style={ECO_INP}
                placeholder="es. 118/2026"/>
            </EcoCampo>
            <EcoCampo etichetta="Data">
              <input type="date" value={b.data} onChange={e=>agg('data', e.target.value)} style={ECO_INP}/>
            </EcoCampo>
            <EcoCampo etichetta="Categoria">
              <select value={b.categoria} onChange={e=>agg('categoria', e.target.value)} style={ECO_SEL}>
                {['Cloud','API','Personale','Consulenze','Software','Marketing','Assicurazioni','Altro'].map(c =>
                  <option key={c} value={c}>{c}</option>)}
              </select>
            </EcoCampo>
            <EcoCampo etichetta="Imponibile">
              <input value={b.imponibile} onChange={e=>agg('imponibile', e.target.value.replace(/[^\d.,]/g,''))}
                style={ECO_INP} placeholder="0,00"/>
            </EcoCampo>
            <EcoCampo etichetta="IVA" aiuto="Zero sui fornitori esteri in reverse charge.">
              <input value={b.iva} onChange={e=>agg('iva', e.target.value.replace(/[^\d.,]/g,''))}
                style={ECO_INP} placeholder="0,00"/>
            </EcoCampo>
          </div>
        </div>
        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {ok ? 'Entra come da riconciliare: va abbinata alla voce di costo che copre.'
                : 'Servono il file, il fornitore e l’imponibile.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!ok} onClick={()=>onSalva({ ...b, file })}>
            Carica
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

function EcoFatture({ forza }) {
  const [nuova, setNuova] = useStateEco(false);
  const righe = ECO_FATTURE.slice().sort((a, b) => b.data - a.data);
  const daRic = righe.filter(f => f.stato === 'da-riconciliare').length;

  const salva = (b) => {
    const imp = parseFloat(String(b.imponibile).replace(',', '.')) || 0;
    const iva = parseFloat(String(b.iva).replace(',', '.')) || 0;
    ECO_FATTURE.push({
      id:`FT-${new Date().getFullYear()}-${String(ECO_FATTURE.length + 1).padStart(3,'0')}`,
      fornitore:b.fornitore.trim(), numero:b.numero.trim() || '—',
      data:new Date(b.data + 'T12:00:00'), imponibile:imp, iva, totale:imp + iva,
      categoria:b.categoria, voce:null,
      origine: /\.xml$/i.test(b.file) ? 'sdi' : 'manuale', file:b.file, stato:'da-riconciliare',
    });
    setNuova(false); forza();
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'flex', alignItems:'baseline', gap:10}}>
        <div style={{...ECO_H, marginBottom:0}}>Fatture ricevute</div>
        <span style={{fontSize:12.4, color: daRic ? ADM.WARN : ADM.MUTED, fontWeight: daRic ? 700 : 400}}>
          {daRic ? `${daRic} da riconciliare a una voce di costo` : 'tutte riconciliate'}
        </span>
        <div style={{flex:1}}/>
        <AdmButton variant="primary" size="sm" onClick={()=>setNuova(true)}>Carica una fattura</AdmButton>
      </div>

      <div style={ECO_CARD}>
        <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'minmax(0,1.5fr) 1.1fr 100px 108px 108px 130px', gap:12}}>
          <div>Fornitore</div><div>Documento</div><div>Data</div><div>Imponibile</div><div>Totale</div><div>Stato</div>
        </div>
        {righe.map((f, i) => (
          <div key={f.id} style={{display:'grid', gridTemplateColumns:'minmax(0,1.5fr) 1.1fr 100px 108px 108px 130px',
            gap:12, alignItems:'center', padding:'12px 16px',
            background: f.stato === 'da-riconciliare' ? '#FFFBFB' : '#fff',
            borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{f.fornitore}</div>
              <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>{f.categoria}</div>
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12.4, color:ADM.TEXT}}>{f.numero}</div>
              <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2, display:'flex', alignItems:'center', gap:5}}>
                <span style={{fontWeight:700, padding:'1px 5px', borderRadius:4,
                  background: f.origine === 'sdi' ? 'rgba(49,53,61,0.08)' : 'rgba(255,90,95,0.12)',
                  color: f.origine === 'sdi' ? ADM.INK : ADM.PINK}}>{f.origine === 'sdi' ? 'SDI' : 'manuale'}</span>
                {f.file}
              </div>
            </div>
            <div style={{fontSize:12.4, color:ADM.MUTED, ...ECO_NUM}}>{cfFmt(f.data)}</div>
            <div style={{fontSize:13, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur2(f.imponibile)}</div>
            <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur2(f.totale)}</div>
            <div>
              <CfPill tono={f.stato === 'riconciliata' ? 'OK' : 'WARN'}>
                {f.stato === 'riconciliata' ? 'Riconciliata' : 'Da riconciliare'}
              </CfPill>
            </div>
          </div>
        ))}
      </div>

      <div style={{padding:'13px 15px', borderRadius:10, background:ADM.NEUTRAL_SOFT,
        fontSize:12.4, color:ADM.MUTED, lineHeight:1.6}}>
        Riconciliare significa abbinare la fattura alla voce di costo che copre: finché non lo è,
        il conto economico usa la stima del modello e non il documento. Lo scarto fra i due è la
        cosa più utile da guardare — se una fattura si discosta molto dalla stima, o il prezzo
        unitario è cambiato o il consumo non è quello che credevi.
      </div>

      {nuova && <EcoModaleFattura onChiudi={()=>setNuova(false)} onSalva={salva}/>}
    </div>
  );
}

/* ═══ 4 · CONTO ECONOMICO RICLASSIFICATO ═════════════════════════════════ */
function EcoRiga({ etichetta, valore, sub, forte, tono, indent, percento, nota }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 140px 96px', gap:12, alignItems:'baseline',
      padding: forte ? '12px 18px' : '8px 18px', paddingLeft: 18 + (indent || 0) * 16,
      background: forte ? '#FAFAFB' : 'transparent',
      borderTop: forte ? `1px solid ${ADM.BORDER}` : 'none'}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize: forte ? 13.6 : 13, fontWeight: forte ? 800 : 500,
          color: forte ? ADM.TEXT : ADM.MUTED}}>{etichetta}</div>
        {sub && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.4}}>{sub}</div>}
      </div>
      <div style={{textAlign:'right', fontSize: forte ? 15 : 13.4, fontWeight: forte ? 800 : 600,
        color: tono || (valore < 0 ? ADM.DANGER : ADM.TEXT), ...ECO_NUM}}>{ecoEur(valore)}</div>
      <div style={{textAlign:'right', fontSize:11.8, color:ADM.MUTED_SOFT, ...ECO_NUM}}>
        {percento != null ? `${percento >= 0 ? '' : '−'}${ecoPct(Math.abs(percento))}` : nota || ''}
      </div>
    </div>
  );
}

function EcoBilancio({ mix, leve }) {
  const anno = ECO_OGGI.getFullYear();
  const chiusi = ECO_STORICO.filter(m => m.data.getFullYear() === anno && !m.corrente);
  const futuri = ecoProiettaDriver(leve);
  const ce = ecoContoEconomico(chiusi.concat(futuri), mix, ECO_REGIME);
  const ceChiusi = ecoContoEconomico(chiusi, mix, ECO_REGIME);
  const reg = ECO_REGIMI[ECO_REGIME.tipo];

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      <div style={{display:'flex', alignItems:'baseline', gap:10}}>
        <div style={{...ECO_H, marginBottom:0}}>Conto economico riclassificato {anno}</div>
        <span style={{fontSize:12.4, color:ADM.MUTED}}>
          {chiusi.length} mesi chiusi + {futuri.length} proiettati · a margine di contribuzione
        </span>
      </div>

      <div style={ECO_CARD}>
        <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'minmax(0,1fr) 140px 96px', gap:12}}>
          <div>Voce</div><div style={{textAlign:'right'}}>Anno {anno}</div><div style={{textAlign:'right'}}>Su ricavi</div>
        </div>

        <EcoRiga etichetta="Abbonamenti a Byup Fresh" valore={ce.sub} indent={1}
          sub="canoni dei locali attivi, per piano"/>
        <EcoRiga etichetta="Transazioni oltre la soglia" valore={ce.extra} indent={1}
          sub="quota consumata oltre quella inclusa nel piano"/>
        <EcoRiga etichetta="Ricavi" valore={ce.ricavi} forte percento={100}/>

        <EcoRiga etichetta="Costi a consumo" valore={-ce.variabili} indent={1}
          sub="cloud e API: crescono con locali, utenti e transazioni"/>
        <EcoRiga etichetta="Margine di contribuzione" valore={ce.margineContribuzione} forte
          percento={ce.mcPercento} tono={ce.margineContribuzione >= 0 ? ADM.OK : ADM.DANGER}/>

        <EcoRiga etichetta="Costi fissi" valore={-ce.fissi} indent={1}
          sub="personale, consulenze, software, marketing, assicurazioni"/>
        <EcoRiga etichetta="EBITDA" valore={ce.ebitda} forte percento={ce.ebitdaPercento}
          tono={ce.ebitda >= 0 ? ADM.OK : ADM.DANGER}/>

        <EcoRiga etichetta="Ammortamenti" valore={-ce.ammortamenti} indent={1}
          sub="nessun costo di sviluppo capitalizzato: tutto a conto economico"/>
        <EcoRiga etichetta="EBIT" valore={ce.ebit} forte/>
        <EcoRiga etichetta="Oneri finanziari" valore={-ce.oneriFinanziari} indent={1} sub="nessun debito oneroso"/>
        <EcoRiga etichetta="Risultato ante imposte" valore={ce.ante} forte/>

        <EcoRiga etichetta={`IRES ${ECO_REGIME.ires}%`} valore={-ce.imposte.ires} indent={1}
          sub={ce.imposte.usoPerdite > 0
            ? `imponibile azzerato usando ${ecoEur(ce.imposte.usoPerdite)} di perdite pregresse`
            : ce.ante < 0
              ? 'risultato negativo: nessuna imposta sul reddito, e la perdita dell’esercizio si somma a quelle riportabili'
              : 'nessuna perdita pregressa disponibile'}/>
        <EcoRiga etichetta={`IRAP ${ECO_REGIME.irap}%`} valore={-ce.imposte.irap} indent={1}
          sub="base imponibile propria, non assorbita dalle perdite IRES"/>
        <EcoRiga etichetta="Risultato netto" valore={ce.netto} forte
          tono={ce.netto >= 0 ? ADM.OK : ADM.DANGER}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <div style={{...ECO_CARD, padding:'14px 16px'}}>
          <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>
            Consuntivo dei mesi chiusi
          </div>
          <div style={{fontSize:22, fontWeight:800, marginTop:6, ...ECO_NUM,
            color: ceChiusi.netto >= 0 ? ADM.OK : ADM.DANGER}}>{ecoEur(ceChiusi.netto)}</div>
          <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.4}}>
            gennaio–{ECO_MESI[Math.max(0, ECO_OGGI.getMonth() - 1)]}, senza il mese in corso
          </div>
        </div>
        <div style={{...ECO_CARD, padding:'14px 16px'}}>
          <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>
            Perdite pregresse residue
          </div>
          <div style={{fontSize:22, fontWeight:800, color:ADM.TEXT, marginTop:6, ...ECO_NUM}}>
            {ecoEur(ce.imposte.perditeResidue)}
          </div>
          <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.4}}>
            finché ci sono, l’imposta sul reddito resta zero
          </div>
        </div>
        <div style={{...ECO_CARD, padding:'14px 16px'}}>
          <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>
            Regime
          </div>
          <div style={{fontSize:15.5, fontWeight:800, color:ADM.TEXT, marginTop:7}}>{reg.label}</div>
          <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{reg.nota}</div>
        </div>
      </div>
    </div>
  );
}

window.EcoFatture = EcoFatture;
window.EcoBilancio = EcoBilancio;
window.EcoRiga = EcoRiga;

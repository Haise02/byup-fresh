// Economix — fatture, conto economico riclassificato e proiezione.

/* ═══ DOCUMENTO DI UNA FATTURA ═══════════════════════════════════════════ */
function EcoModaleDocumento({ fattura, onChiudi }) {
  const percorso = `Drive · Fatture/${fattura.data.getFullYear()}/${fattura.fornitore}/${fattura.file}`;
  const xml = /\.xml$/i.test(fattura.file || '');
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="documento" onClick={e=>e.stopPropagation()} style={{width:560, maxWidth:'92%', background:'#fff',
        borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.18s ease', maxHeight:'100%', overflowY:'auto'}}>
        <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, marginBottom:5}}>{fattura.fornitore}</div>
        <div style={{fontSize:12.6, color:ADM.MUTED, marginBottom:16}}>
          {fattura.numero} · {cfFmt(fattura.data)} · {fattura.id}
        </div>

        <div style={{display:'flex', alignItems:'center', gap:13, padding:'15px 16px', borderRadius:12,
          border:`1px solid ${ADM.BORDER}`, background:'#FCFCFD', marginBottom:16}}>
          <div style={{width:38, height:46, borderRadius:5, background:'#fff', flexShrink:0,
            border:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <BuIcons.paperclip size={17} color={ADM.MUTED_SOFT}/>
          </div>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, wordBreak:'break-all'}}>{fattura.file}</div>
            <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:3, wordBreak:'break-all'}}>{percorso}</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14, marginBottom:16}}>
          <CfrVoce k="Imponibile" v={ecoEur2(fattura.imponibile)}/>
          <CfrVoce k="IVA" v={fattura.iva ? ecoEur2(fattura.iva) : 'reverse charge'}/>
          <CfrVoce k="Totale" v={ecoEur2(fattura.totale)}/>
        </div>
        {fattura.nota && (
          <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.55, marginBottom:16}}>{fattura.nota}</div>
        )}

        <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:18,
          fontSize:12.4, color:ADM.MUTED, lineHeight:1.6}}>
          {xml
            ? 'File XML dallo Sistema di Interscambio: i campi qui sopra sono stati letti dal documento, non trascritti.'
            : 'PDF caricato a mano: i campi qui sopra sono stati inseriti da una persona e non sono verificati contro il documento.'}
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Chiudi</AdmButton>
          <AdmButton variant="primary" size="sm" onClick={onChiudi}>Apri su Drive</AdmButton>
        </div>
      </div>
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

window.EcoBilancio = EcoBilancio;
window.EcoModaleDocumento = EcoModaleDocumento;
window.EcoRiga = EcoRiga;

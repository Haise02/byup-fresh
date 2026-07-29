// Economix — cassa e stato patrimoniale.

/* ═══ CASSA ══════════════════════════════════════════════════════════════ */
function EcoCassa({ mix, leve }) {
  const flussi = ecoProiezioneCassa(mix, leve);
  const run = ecoRunway(flussi);
  const saldoOggi = ECO_CASSA.saldoBanca + ECO_CASSA.saldoContanti;
  const bruciaMedio = flussi.length
    ? flussi.reduce((t, x) => t + x.netto, 0) / flussi.length : 0;

  // Scadenze future ordinate: e la lista che si guarda per sapere che cosa
  // arriva, non un archivio.
  const scadenze = ECO_SCADENZE
    .filter(x => x.quando >= new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), 1))
    .sort((a, b) => a.quando - b.quando);
  const prepagati = ecoPrepagati();
  const riacquisti = ecoRiacquisti(ecoProiettaDriver(leve));
  const minSaldo = Math.min.apply(null, flussi.map(x => x.saldo).concat([saldoOggi]));
  const maxSaldo = Math.max.apply(null, flussi.map(x => x.saldo).concat([saldoOggi]));

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {[
          { et:'Cassa oggi', v:ecoEur(saldoOggi), n:`aggiornata ${ecoQuando(ECO_CASSA.aggiornatoIl)}` },
          { et:'Flusso medio mensile', v:ecoEur(bruciaMedio),
            tono: bruciaMedio >= 0 ? ADM.OK : ADM.DANGER,
            n: bruciaMedio >= 0 ? 'la cassa cresce' : 'quanto esce, al netto di quanto entra' },
          { et:'Autonomia', tono: run.oltre ? ADM.TEXT : ADM.DANGER,
            v: run.oltre
              ? (run.mesi === Infinity ? 'illimitata' : `${Math.floor(run.mesi)} mesi`)
              : `${run.mesi} ${run.mesi === 1 ? 'mese' : 'mesi'}`,
            n: run.oltre ? 'oltre l’orizzonte di dicembre' : `la cassa va sotto zero a ${run.quando}` },
          { et:'Cassa a dicembre', v:ecoEur(flussi.length ? flussi[flussi.length - 1].saldo : saldoOggi),
            tono: (flussi.length ? flussi[flussi.length - 1].saldo : saldoOggi) >= 0 ? ADM.TEXT : ADM.DANGER,
            n:'alle ipotesi della proiezione' },
        ].map(c => (
          <div key={c.et} style={{...ECO_CARD, padding:'15px 17px'}}>
            <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em'}}>{c.et}</div>
            <div style={{fontSize:25, fontWeight:800, letterSpacing:'-0.02em', marginTop:7,
              color:c.tono || ADM.TEXT, ...ECO_NUM}}>{c.v}</div>
            <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.4}}>{c.n}</div>
          </div>
        ))}
      </div>

      {/* La curva del saldo: dove scende sotto zero e l'unica cosa da vedere. */}
      <div>
        <div style={ECO_H}>Saldo mese per mese</div>
        <div style={{...ECO_CARD, padding:'16px 18px'}}>
          <div style={{display:'flex', alignItems:'flex-end', gap:8, height:96, marginBottom:10}}>
            {flussi.map(x => {
              const alt = maxSaldo === minSaldo ? 50
                : Math.max(4, Math.round((x.saldo - Math.min(0, minSaldo)) / (maxSaldo - Math.min(0, minSaldo)) * 88));
              return (
                <div key={x.d.mese} style={{flex:1, minWidth:0, display:'flex', flexDirection:'column',
                  alignItems:'center', gap:5}}>
                  <span style={{fontSize:10.8, fontWeight:700, color: x.saldo < 0 ? ADM.DANGER : ADM.MUTED, ...ECO_NUM}}>
                    {Math.round(x.saldo / 1000)}k
                  </span>
                  <span style={{width:'100%', height:alt, borderRadius:5,
                    background: x.saldo < 0 ? ADM.PINK : 'rgba(49,53,61,0.16)'}}/>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', gap:8}}>
            {flussi.map(x => (
              <div key={x.d.mese} style={{flex:1, minWidth:0, textAlign:'center', fontSize:10.8,
                color:ADM.MUTED_SOFT}}>{x.d.mese}</div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div style={ECO_H}>Entrate e uscite</div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'96px 1fr 1fr 1fr 1fr 1.05fr 1.15fr', gap:11}}>
            <div>Mese</div><div>Incassi</div><div>Pagamenti</div><div>IVA versata</div>
            <div>Scadenze</div><div>Netto</div><div>Saldo</div>
          </div>
          {flussi.map((x, i) => (
            <div key={x.d.mese} style={{display:'grid', gridTemplateColumns:'96px 1fr 1fr 1fr 1fr 1.05fr 1.15fr',
              gap:11, alignItems:'center', padding:'11px 16px',
              background: x.saldo < 0 ? ADM.DANGER_SOFT : x.d.primo ? '#FAFAFB' : '#fff',
              borderBottom: i < flussi.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{fontSize:12.6, fontWeight:700, color:ADM.TEXT}}>
                {x.d.mese}{x.d.primo && <span style={{fontSize:10.4, color:ADM.MUTED_SOFT, fontWeight:500}}> in corso</span>}
              </div>
              <div style={{fontSize:12.8, color:ADM.OK, fontWeight:600, ...ECO_NUM}}>{ecoEur(x.ricavi)}</div>
              <div style={{fontSize:12.8, color:ADM.MUTED, ...ECO_NUM}}>−{ecoEur(x.costi).replace('€', '€')}</div>
              <div style={{fontSize:12.6, color:ADM.MUTED, ...ECO_NUM}}>{x.iva > 0 ? `−${ecoEur(x.iva)}` : '—'}</div>
              <div style={{fontSize:12.6, color: x.scadenze ? ADM.WARN : ADM.MUTED_SOFT, fontWeight: x.scadenze ? 700 : 400, ...ECO_NUM}}>
                {x.scadenze ? `−${ecoEur(x.scadenze)}` : '—'}
              </div>
              <div style={{fontSize:13, fontWeight:700, ...ECO_NUM,
                color: x.netto >= 0 ? ADM.OK : ADM.DANGER}}>{ecoEur(x.netto)}</div>
              <div style={{fontSize:13.6, fontWeight:800, ...ECO_NUM,
                color: x.saldo < 0 ? ADM.DANGER : ADM.TEXT}}>{ecoEur(x.saldo)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* I prepagati non hanno una scadenza, hanno un consumo: la data si calcola
          dal residuo, e per questo stanno qui e non nello scadenzario. */}
      {prepagati.length > 0 && (
        <div>
          <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
            <div style={{...ECO_H, marginBottom:0}}>Credito prepagato</div>
            <span style={{fontSize:12.4, color:ADM.MUTED}}>
              esce a blocchi, quando finisce · il quando dipende dai consumi, non dal calendario
            </span>
          </div>
          <div style={{...ECO_CARD, padding:'16px 18px'}}>
            {prepagati.map(x => (
              <div key={x.id} style={{display:'grid', gridTemplateColumns:'minmax(0,1.5fr) repeat(3, minmax(0,1fr))',
                gap:18, alignItems:'start'}}>
                <div>
                  <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{x.pk.fornitore}</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:3, lineHeight:1.45}}>
                    taglio da {x.taglio.quantita.toLocaleString('it-IT')} a {ecoEur(x.taglio.prezzo)}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                    letterSpacing:'0.05em'}}>Residuo</div>
                  <div style={{fontSize:19, fontWeight:800, color:ADM.TEXT, marginTop:4, ...ECO_NUM}}>
                    {x.pk.residuo.toLocaleString('it-IT')}
                  </div>
                  <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2}}>{x.pk.unita}</div>
                </div>
                <div>
                  <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                    letterSpacing:'0.05em'}}>Vale a bilancio</div>
                  <div style={{fontSize:19, fontWeight:800, color:ADM.TEXT, marginTop:4, ...ECO_NUM}}>
                    {ecoEur(x.valore)}
                  </div>
                  <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2}}>già pagato, non ancora costo</div>
                </div>
                <div>
                  <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                    letterSpacing:'0.05em'}}>Finisce fra</div>
                  <div style={{fontSize:19, fontWeight:800, marginTop:4, ...ECO_NUM,
                    color: x.giorniResidui < 30 ? ADM.DANGER : ADM.TEXT}}>
                    {x.giorniResidui < 1 ? 'oggi' : `${x.giorniResidui} giorni`}
                  </div>
                  <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2}}>
                    a {Math.round(x.consumoMese).toLocaleString('it-IT')} al mese
                  </div>
                </div>
              </div>
            ))}
            {riacquisti.length > 0 && (
              <div style={{marginTop:15, paddingTop:13, borderTop:`1px solid ${ADM.BORDER}`}}>
                <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.05em', marginBottom:8}}>Ricariche previste entro dicembre</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  {riacquisti.map((r, i) => (
                    <span key={i} style={{fontSize:12.2, fontWeight:700, color:ADM.INK,
                      background:'rgba(49,53,61,0.08)', padding:'5px 11px', borderRadius:7}}>
                      {r.mese} · {ecoEur(r.importo)}
                    </span>
                  ))}
                </div>
                <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.55}}>
                  {riacquisti.length} ricariche per {ecoEur(riacquisti.reduce((t, r) => t + r.importo, 0))}
                  {' '}complessivi. Con un taglio più grande sarebbero meno e costerebbero meno per unità,
                  ma ogni ricarica immobilizzerebbe più cassa in una volta sola.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Scadenzario</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            uscite con un calendario proprio, che non si deducono dai costi ricorrenti
          </span>
        </div>
        <div style={ECO_CARD}>
          {scadenze.map((x, i) => {
            const gg = Math.round((x.quando - ECO_OGGI) / 86400000);
            return (
              <div key={x.id} style={{display:'grid', gridTemplateColumns:'minmax(0,2fr) 130px 118px 120px', gap:12,
                alignItems:'center', padding:'13px 16px',
                borderBottom: i < scadenze.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{x.voce}</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.45}}>{x.nota}</div>
                </div>
                <div style={{fontSize:12.6, color:ADM.TEXT, ...ECO_NUM}}>{cfFmt(x.quando)}</div>
                <div style={{fontSize:12.2, color: gg < 30 ? ADM.WARN : ADM.MUTED, fontWeight: gg < 30 ? 700 : 400}}>
                  {gg < 0 ? `${-gg} giorni fa` : `fra ${gg} giorni`}
                </div>
                <div style={{fontSize:13.4, fontWeight:700, textAlign:'right', ...ECO_NUM,
                  color: x.importo ? ADM.TEXT : ADM.MUTED_SOFT}}>
                  {x.importo == null ? 'da calcolare' : x.importo === 0 ? '—' : ecoEur(x.importo)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ STATO PATRIMONIALE ═════════════════════════════════════════════════ */
function EcoPatrimonio({ mix }) {
  const sp = ecoStatoPatrimoniale(mix);
  const quadra = Math.abs(sp.sbilancio) < 1;

  const Colonna = ({ titolo, voci, totale, etichettaTot }) => (
    <div style={ECO_CARD}>
      <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'minmax(0,1fr) 130px', gap:12}}>
        <div>{titolo}</div><div style={{textAlign:'right'}}>Importo</div>
      </div>
      {voci.map((x, i) => (
        <div key={x.v} style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 130px', gap:12,
          alignItems:'baseline', padding:'11px 16px',
          borderBottom: i < voci.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:13, color:ADM.TEXT, fontWeight:500}}>{x.v}</div>
            {x.sub && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.4}}>{x.sub}</div>}
          </div>
          <div style={{textAlign:'right', fontSize:13.4, fontWeight:600, ...ECO_NUM,
            color: x.n < 0 ? ADM.DANGER : ADM.TEXT}}>{ecoEur(x.n)}</div>
        </div>
      ))}
      <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 130px', gap:12,
        padding:'13px 16px', background:'#FAFAFB', borderTop:`1px solid ${ADM.BORDER}`}}>
        <div style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT}}>{etichettaTot}</div>
        <div style={{textAlign:'right', fontSize:15, fontWeight:800, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur(totale)}</div>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      <div style={{display:'flex', alignItems:'baseline', gap:10}}>
        <div style={{...ECO_H, marginBottom:0}}>Stato patrimoniale al {cfFmt(ECO_OGGI)}</div>
        <span style={{fontSize:12.4, color:ADM.MUTED}}>
          consuntivo · non sostituisce il bilancio del commercialista, lo anticipa
        </span>
      </div>

      {/* La quadratura e' il controllo che rende leggibile il resto: se attivo e
          passivo non coincidono, una delle due colonne mente. */}
      <div style={{padding:'13px 16px', borderRadius:10, display:'flex', alignItems:'center', gap:12,
        background: quadra ? ADM.OK_SOFT : ADM.DANGER_SOFT,
        border:`1px solid ${quadra ? '#BBF7D0' : '#FECACA'}`}}>
        <span style={{fontSize:14, fontWeight:800, color: quadra ? '#065F46' : '#7F1D1D'}}>
          {quadra ? 'Attivo e passivo quadrano' : `Sbilancio di ${ecoEur(Math.abs(sp.sbilancio))}`}
        </span>
        <span style={{fontSize:12.4, color:ADM.MUTED, flex:1}}>
          {quadra
            ? 'Le due colonne coincidono: i saldi inseriti e quelli calcolati sono coerenti fra loro.'
            : 'Le due colonne non coincidono. Di solito significa che il saldo di banca o le perdite portate a nuovo sono aggiornati a una data diversa dal resto.'}
        </span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'start'}}>
        <Colonna titolo="Attivo" voci={sp.attivo} totale={sp.totAttivo} etichettaTot="Totale attivo"/>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <Colonna titolo="Patrimonio netto" voci={sp.passivo.filter(x => x.gruppo === 'pn')}
            totale={sp.pn} etichettaTot="Totale patrimonio netto"/>
          <Colonna titolo="Debiti" voci={sp.passivo.filter(x => x.gruppo === 'deb')}
            totale={sp.totPassivo - sp.pn} etichettaTot="Totale debiti"/>
        </div>
      </div>

      <div style={{padding:'14px 16px', borderRadius:10, background:ADM.NEUTRAL_SOFT,
        fontSize:12.4, color:ADM.MUTED, lineHeight:1.65}}>
        Le voci che non si deducono dal conto economico — capitale, versamenti dei soci, perdite
        portate a nuovo, cespiti — sono inserite e aggiornate al {cfFmt(ECO_PATRIMONIO.aggiornatoIl)}.
        Tutto il resto è calcolato: i crediti verso clienti dal fatturato non ancora incassato,
        i debiti verso fornitori dai costi non ancora pagati, il risultato dal conto economico a oggi.
        Se una voce inserita invecchia, la quadratura qui sopra è la prima cosa che se ne accorge.
      </div>
    </div>
  );
}

window.EcoCassa = EcoCassa;
window.EcoPatrimonio = EcoPatrimonio;

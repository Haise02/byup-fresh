// Economix — cassa e stato patrimoniale.

/* ═══ CASSA ══════════════════════════════════════════════════════════════ */
function EcoCassa({ mix, leve, forza }) {
  const flussi = ecoProiezioneCassa(mix, leve);
  const run = ecoRunway(flussi);
  const saldoOggi = ECO_CASSA.saldoBanca + ECO_CASSA.saldoContanti;

  const banca = ecoBanca();
  const ggConsenso = banca ? ecoGiorniConsenso(banca) : null;
  const ritardo = ecoRitardoRendiconto(banca);
  const senzaRicavi = ecoRunwaySenzaRicavi(flussi, saldoOggi);
  const [modifica, setModifica] = useStateEco(null);
  const [elimina, setElimina] = useStateEco(null);
  const [daScadenza, setDaScadenza] = useStateEco(ECO_OGGI);
  const [nuovaScad, setNuovaScad] = useStateEco(false);
  const [espansa, setEspansa] = useStateEco(false);
  // Dodici mesi e non sei: con sei le voci annuali — la polizza a gennaio, il
  // dominio a febbraio — non comparirebbero mai, e lo scadenzario sembrerebbe
  // averle dimenticate proprio mentre dichiara di mostrarle tutte.
  const storici = ecoFlussiStorici(mix);
  const iva = ecoSaldoIva(mix);
  const meseCorr = storici[storici.length - 1];
  const recenti = storici.slice().reverse();
  const scadenze = ecoScadenzario(12, mix);
  const inScadenza = scadenze.filter(x => x.giorni <= 0).length;
  // Uscite ancora da saldare nel mese in corso: quelle gia pagate non ci sono
  // piu, quindi e davvero "quanto manca", non "quanto costa il mese".
  // Fino a fine mese, non solo dentro il mese: una voce di giugno non pagata
  // e ancora denaro che deve uscire, e ometterla farebbe sembrare il mese piu
  // leggero di quanto sia.
  const fineMese = new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth() + 1, 0, 23, 59);
  const delMese = scadenze.filter(x => x.data <= fineMese);
  const scaduteMese = delMese.filter(x => x.giorni <= 0).length;
  const daPagare = delMese.reduce((t, x) => t + (x.importo || 0), 0);
  const senzaImporto = delMese.filter(x => x.importo == null).length;
  // Tutto cio che esce nel mese: fornitori al lordo, IVA versata, altre uscite.
  // pagamenti comprende gia le altre uscite del mese; l'IVA versata e a parte
  // perche esce solo alle scadenze di liquidazione.
  const usciteMese = meseCorr ? meseCorr.pagamenti + meseCorr.iva : 0;
  const riacquisti = ecoRiacquisti(ecoProiettaDriver(leve));
  const minSaldo = Math.min.apply(null, flussi.map(x => x.saldo).concat([saldoOggi]));
  const maxSaldo = Math.max.apply(null, flussi.map(x => x.saldo).concat([saldoOggi]));

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:11}}>
        {[
          { et:'Cassa', v:ecoEur(saldoOggi),
            tono: banca && banca.stato === 'errore' ? ADM.DANGER : null,
            n: !banca ? 'saldo inserito a mano'
              : banca.stato === 'attivo'
                ? `${banca.saldoAl || 'ultima lettura'} · rendiconto delle ${banca.ultimaLettura.getHours()}:${String(banca.ultimaLettura.getMinutes()).padStart(2,'0')}`
              : banca.stato === 'errore' ? `collegamento fermo: saldo di ${ecoQuando(banca.ultimaLettura)}`
              : 'saldo inserito a mano' },
          { et:`Entrate ${ECO_MESI_LUNGHI[ECO_OGGI.getMonth()]}`, v:ecoEur(meseCorr ? meseCorr.incassi : 0),
            tono:ADM.OK,
            n: meseCorr
              ? `${ecoEur(meseCorr.incassi)} di entrate totali, di cui ${ecoEur(meseCorr.ivaIncassata)} di IVA`
              : '—' },
          // Entrate e uscite del mese sono la stessa domanda letta nei due versi,
          // e vanno lette una accanto all'altra. Il «quanto manca ancora» resta
          // qui sotto: era una scheda a se, ma e un dettaglio di questa.
          { et:`Uscite ${ECO_MESI_LUNGHI[ECO_OGGI.getMonth()]}`, v:ecoEur(usciteMese),
            tono: usciteMese > (meseCorr ? meseCorr.incassi : 0) ? ADM.DANGER : ADM.TEXT,
            n: delMese.length === 0 ? 'tutto saldato entro fine mese'
              : `${ecoEur(daPagare)} ancora da saldare · ${delMese.length} ${
                  delMese.length === 1 ? 'voce' : 'voci'}${
                  scaduteMese ? `, ${scaduteMese} già ${scaduteMese === 1 ? 'scaduta' : 'scadute'}` : ''}${
                  senzaImporto ? ` · ${senzaImporto} da calcolare` : ''}` },
          // Il saldo IVA e denaro che sta in cassa ma non e tuo: incassato dai
          // ristoratori e dovuto allo Stato alla prossima scadenza. Guardare la
          // cassa senza sapere quanto ne e gia impegnato porta a spenderlo.
          { et:'Saldo IVA', v:ecoEur(iva.saldo),
            tono: iva.saldo > 0 ? ADM.WARN : ADM.OK,
            n: iva.saldo <= 0
              ? 'credito verso l’erario: si porta avanti, non si versa'
              : iva.prossima
                ? `da versare il ${cfFmt(iva.prossima.scadenza)} · ${iva.prossima.etichetta}`
                : 'nessun versamento in vista' },
          { et:'Autonomia', tono: run.oltre ? ADM.TEXT : ADM.DANGER,
            v: run.oltre
              ? (run.mesi === Infinity ? 'illimitata' : `${Math.floor(run.mesi)} mesi`)
              : `${run.mesi} ${run.mesi === 1 ? 'mese' : 'mesi'}`,
            // Il numero grande vale con i ricavi previsti; questo e l'altro
            // scenario, scritto come divisione perche si possa rifare a mente.
            n: senzaRicavi.mesi === Infinity
              ? 'nessuna uscita prevista: autonomia illimitata'
              : `${ecoEur(saldoOggi)} ÷ ${ecoEur(senzaRicavi.costiMedi)} di uscite medie mensili · senza incassi autonomia di ${Math.floor(senzaRicavi.mesi)} mesi` },
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

      {/* Il consenso PSD2 scade e nessuno se ne accorge finche la cassa non
          smette di aggiornarsi: allora l'avviso va qui, dove il saldo si legge. */}
      {ggConsenso != null && ggConsenso <= 30 && (
        <div style={{padding:'12px 15px', borderRadius:10, background:ADM.WARN_SOFT, color:'#78350F',
          fontSize:12.6, lineHeight:1.55}}>
          Il consenso al conto corrente scade fra <strong>{ggConsenso} giorni</strong>. Alla scadenza
          il saldo smette di aggiornarsi e resta l’ultimo letto — che sembra buono ma è vecchio.
          Rinnovarlo richiede una nuova autenticazione sull’home banking.
        </div>
      )}
      {ritardo > 1 && (
        <div style={{padding:'12px 15px', borderRadius:10, background:ADM.WARN_SOFT, color:'#78350F',
          fontSize:12.6, lineHeight:1.55}}>
          Il rendiconto della banca non arriva da <strong>{ritardo} giorni</strong>. Il saldo qui sopra
          è fermo all’ultimo file ricevuto: da controllare il deposito su SFTP.
        </div>
      )}

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Entrate e uscite</div>
          <span style={{fontSize:12.4, color:ADM.MUTED, minWidth:0}}>
            dal mese in corso all’indietro · il saldo è ricostruito partendo dal
            saldo di oggi, che è l’unico dato certo
          </span>
          <div style={{flex:1}}/>
          <AdmButton variant="ghost" size="sm" onClick={()=>setEspansa(!espansa)}>
            {espansa ? 'Comprimi' : `Espandi · ${storici.length} mesi`}
          </AdmButton>
        </div>
        <div style={{...ECO_CARD, display:'flex', flexDirection:'column'}}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:ECO_GRID_FLUSSI, gap:10}}>
            {/* «Di cui IVA» e non «IVA incassata»: le entrate ora comprendono
                l'IVA, e due colonne accostate senza dirlo si sommano da sole
                nella testa di chi legge. */}
            <div>Mese</div><div>Entrate</div><div>Di cui IVA</div><div>Uscite</div>
            <div>IVA versata</div><div>Saldo IVA</div><div>Netto</div><div>Saldo</div>
          </div>
          {/* Il mese in corso e quello che si guarda per primo: la tabella parte
              da li e scende all'indietro. Tre righe a vista, il resto scorrendo
              o aprendo tutto. */}
          <div ref={(el)=>ecoTagliaRighe(el, espansa ? 0 : 3)}
            style={{overflowY:'auto', minHeight:0}}>
          {recenti.map((x, i) => (
            <div key={x.d.mese} style={{display:'grid', gridTemplateColumns:ECO_GRID_FLUSSI,
              gap:10, alignItems:'center', padding:'11px 16px',
              background: x.saldo < 0 ? ADM.DANGER_SOFT : x.d.corrente ? '#FAFAFB' : '#fff',
              borderBottom: i < recenti.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{fontSize:12.6, fontWeight:700, color:ADM.TEXT}}>
                {x.d.mese}{x.d.corrente && <span style={{fontSize:10.4, color:ADM.MUTED_SOFT, fontWeight:500}}> in corso</span>}
              </div>
              <div style={{fontSize:12.8, color:ADM.OK, fontWeight:600, ...ECO_NUM}}>{ecoEur(x.incassi)}</div>
              <div style={{fontSize:12.6, color:ADM.MUTED, ...ECO_NUM}}>{ecoEur(x.ivaIncassata)}</div>
              <div style={{fontSize:12.8, color:ADM.MUTED, ...ECO_NUM}}>−{ecoEur(x.pagamenti)}</div>
              <div style={{fontSize:12.6, fontWeight: x.iva > 0 ? 700 : 400,
                color: x.iva > 0 ? ADM.TEXT : ADM.MUTED_SOFT, ...ECO_NUM}}>
                {x.iva > 0 ? `−${ecoEur(x.iva)}` : '—'}
              </div>
              <div style={{fontSize:12.6, ...ECO_NUM,
                color: x.saldoIva > 0 ? ADM.WARN : ADM.OK}}>{ecoEur(x.saldoIva)}</div>
              <div style={{fontSize:13, fontWeight:700, ...ECO_NUM,
                color: x.netto >= 0 ? ADM.OK : ADM.DANGER}}>{ecoEur(x.netto)}</div>
              <div style={{fontSize:13.6, fontWeight:800, ...ECO_NUM,
                color: x.saldo < 0 ? ADM.DANGER : ADM.TEXT}}>{ecoEur(x.saldo)}</div>
            </div>
          ))}
          </div>
        </div>

      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Scadenzario</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            tutto ciò che deve uscire nei prossimi dodici mesi · {inScadenza
              ? `${inScadenza} ${inScadenza === 1 ? 'voce da saldare' : 'voci da saldare'}`
              : 'nessuna voce scaduta'}
          </span>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setNuovaScad(true)}>Aggiungi una scadenza</AdmButton>
        </div>
        {/* Dieci righe a vista, poi scorre da dentro: su quarantacinque voci
            l'elenco intero spingerebbe fuori pagina tutto il resto, e lo
            scadenzario si guarda dalle prime — quelle vicine. */}
        <div style={{...ECO_CARD, display:'flex', flexDirection:'column'}}>
          {scadenze.length === 0 && (
            <div style={{padding:'22px 16px', textAlign:'center', fontSize:13, color:ADM.MUTED}}>
              Nessuna scadenza nei prossimi dodici mesi.
            </div>
          )}
          {/* L'altezza di dieci righe si MISURA, non si stima: le righe con la
              nota sono piu alte, e un tetto in pixel ne mostrava sei. */}
          <div ref={(el)=>ecoTagliaRighe(el, ECO_RIGHE_SCAD)} style={{overflowY:'auto', minHeight:0}}>
          {scadenze.map((x, i) => {
            const dovuta = x.giorni <= 0;
            // Solo le righe che sono davvero un costo si aprono: l'IVA, gli
            // acconti e le ricariche calcolate non hanno una scheda da mostrare,
            // e renderle cliccabili sarebbe una promessa vuota.
            const apribile = !!(x.rif && x.rif.periodicita);
            return (
              <div key={x.chiave} className={apribile ? 'adm-row-open' : undefined}
                onClick={apribile ? ()=>{ setModifica(x.rif); setDaScadenza(x.data); } : undefined}
                style={{display:'grid', gridTemplateColumns:ECO_GRID_SCAD, gap:12,
                alignItems:'center', padding:'12px 16px', cursor: apribile ? 'pointer' : 'default',
                background: dovuta ? '#FFFBFB' : '#fff',
                borderBottom: i < scadenze.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{x.voce}</div>
                  <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.45}}>
                    {x.fornitore || x.nota || '—'}
                  </div>
                </div>
                <div style={{fontSize:11.4, color:ADM.MUTED}}>{x.origine}</div>
                <div style={{fontSize:12.6, color:ADM.TEXT, ...ECO_NUM}}>{cfFmt(x.data)}</div>
                <div style={{fontSize:12.2, fontWeight: dovuta ? 700 : 400,
                  color: dovuta ? ADM.DANGER : x.giorni < 15 ? ADM.WARN : ADM.MUTED}}>
                  {x.giorni < 0 ? `${-x.giorni} giorni fa` : x.giorni === 0 ? 'oggi' : `fra ${x.giorni} giorni`}
                </div>
                <div style={{fontSize:13.4, fontWeight:700, textAlign:'right', ...ECO_NUM,
                  color: x.importo ? ADM.TEXT : ADM.MUTED_SOFT}}>
                  {x.importo == null ? 'da calcolare' : x.importo === 0 ? '—' : ecoEur2(x.importo)}
                </div>
                {/* I pulsanti compaiono il giorno della scadenza: prima non c'e
                    niente da decidere, e mostrarli invita a saldare in anticipo
                    cose che hanno una data per un motivo. */}
                <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}
                  onClick={e=>e.stopPropagation()}>
                  {dovuta ? (
                    <AdmButton variant="primary" size="sm" style={{fontSize:12}}
                      onClick={()=>{ ecoSegnaPagata(x); forza(); }}>Pagato</AdmButton>
                  ) : (
                    <span style={{fontSize:11.4, color:ADM.MUTED_LIGHT}}>—</span>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
        {scadenze.length > 10 && (
          <div style={{fontSize:12, color:ADM.MUTED, marginTop:9}}>
            {scadenze.length} voci in tutto · le altre scorrendo nella tabella
          </div>
        )}
      </div>

      {modifica && <EcoModaleCosto key={modifica.id} costo={modifica}
        onChiudi={()=>setModifica(null)} onDoc={()=>setModifica(null)}
        onElimina={(c)=>setElimina({ costo:c, da:daScadenza })}
        onSalva={(b)=>{
          const imp = parseFloat(String(b.importo).replace(',', '.')) || 0;
          Object.assign(modifica, {
            voce:b.voce.trim(), categoria:b.categoria, importo:imp,
            iva: Math.round(imp * (parseFloat(b.aliquota) || 0)) / 100,
            periodicita:b.periodicita, dal:new Date(b.dal + 'T12:00:00'),
            fornitore:b.fornitore.trim() || '—', piva:b.piva.trim(),
          });
          setModifica(null); forza();
        }}/>}
      {/* Dallo scadenzario si taglia dall'occorrenza cliccata: e la scadenza
          che si sta guardando, non il mese corrente. */}
      {elimina && <EcoConfermaElimina costo={elimina.costo} daQuando={elimina.da}
        onChiudi={()=>setElimina(null)}
        onConferma={()=>{ ecoEliminaCosto(elimina.costo, elimina.da); setElimina(null); setModifica(null); forza(); }}/>}
      {nuovaScad && <EcoModaleCosto onChiudi={()=>setNuovaScad(false)} onSalva={(b)=>{
        const quando = new Date(b.dal + 'T12:00:00');
        const imp = parseFloat(String(b.importo).replace(',', '.')) || 0;
        ECO_FISSI.push({ id:'F-' + String(ECO_FISSI.length + 1).padStart(2, '0'),
          voce:b.voce.trim(), categoria:b.categoria, importo:imp,
          iva: Math.round(imp * (parseFloat(b.aliquota) || 0)) / 100,
          periodicita:b.periodicita, dal:quando, a:null,
          fornitore:b.fornitore.trim() || '—', piva:b.piva.trim(), fattura:null });
        setNuovaScad(false); forza();
      }}/>}
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

const ECO_GRID_SCAD = 'minmax(0,2fr) 108px 108px 118px 120px 172px';

// Ref di misura: N righe esatte, poi si scorre; 0 significa nessun taglio.
// Si SOMMANO le altezze invece di leggere offsetTop della riga N+1, perche
// offsetTop si misura dall'antenato posizionato e non dal contenitore — con la
// card non posizionata restituiva un numero che non c'entrava nulla.
const ECO_RIGHE_SCAD = 10;
const ecoTagliaRighe = (el, n) => {
  if (!el) return;
  const f = Array.from(el.children);
  if (!(n > 0 && f.length > n)) { el.style.maxHeight = ''; return; }
  // Due trappole in due righe di codice. offsetHeight e arrotondato all'intero,
  // e su righe da 50,4px il taglio a tre ne perdeva 1,2 — quel tanto che
  // bastava a lasciare fuori la terza. getBoundingClientRect invece e preciso
  // ma restituisce pixel VISIVI, e il frame ha uno zoom di 1,25: usarlo cosi
  // dava un tetto di un quarto piu alto e faceva vedere dodici righe su dieci.
  // Si misura col rect e si divide per lo zoom, che e l'unico modo di avere
  // insieme la precisione e l'unita giusta.
  const fr = el.closest('.frame');
  const z = fr ? (parseFloat(getComputedStyle(fr).zoom) || 1) : 1;
  const h = f.slice(0, n).reduce((t, r) => t + r.getBoundingClientRect().height, 0);
  el.style.maxHeight = Math.ceil(h / z) + 'px';
};
const ECO_GRID_FLUSSI = '88px 1fr 1.05fr 1.05fr 1fr 1fr 1.05fr 1.15fr';

window.EcoCassa = EcoCassa;
window.EcoPatrimonio = EcoPatrimonio;

// Economix — la composizione dei costi e il guscio della sezione.

// ─── Dati: composizione dei costi ──────────────────────────────────────────
// Una torta risponde a una domanda sola — dove finiscono i soldi — e la risponde
// in un colpo d'occhio, che e cio che le tabelle di questa sezione non fanno.
// Le tabelle dicono quanto costa ogni voce; qui si vede quanto pesa.
const ECO_TORTA = ['#FF5A5F', '#0D9488', '#2563EB', '#7C3AED', '#C2710C',
                   '#16A34A', '#DB2777', '#0891B2', '#65A30D', '#57534E', '#9CA3AF'];

const ecoPolare = (cx, cy, r, gradi) => {
  const a = (gradi - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
// Settore di corona: arco esterno, taglio verso l'interno, arco interno di
// ritorno. Con una fetta sola l'arco degenera — 360 gradi partono e finiscono
// nello stesso punto — quindi quel caso si disegna come due mezzi archi.
function ecoFetta(cx, cy, rEst, rInt, da, a) {
  if (a - da >= 359.99) {
    return `M${cx - rEst} ${cy}A${rEst} ${rEst} 0 1 1 ${cx + rEst} ${cy}A${rEst} ${rEst} 0 1 1 ${cx - rEst} ${cy}Z`
         + `M${cx - rInt} ${cy}A${rInt} ${rInt} 0 1 0 ${cx + rInt} ${cy}A${rInt} ${rInt} 0 1 0 ${cx - rInt} ${cy}Z`;
  }
  const [x1, y1] = ecoPolare(cx, cy, rEst, da), [x2, y2] = ecoPolare(cx, cy, rEst, a);
  const [x3, y3] = ecoPolare(cx, cy, rInt, a), [x4, y4] = ecoPolare(cx, cy, rInt, da);
  const grande = a - da > 180 ? 1 : 0;
  return `M${x1} ${y1}A${rEst} ${rEst} 0 ${grande} 1 ${x2} ${y2}L${x3} ${y3}A${rInt} ${rInt} 0 ${grande} 0 ${x4} ${y4}Z`;
}

function EcoDati({ mix }) {
  const [modo, setModo] = useStateEco('mese');
  const [k, setK] = useStateEco(ECO_STORICO.length - 1);
  const [anno, setAnno] = useStateEco(ECO_OGGI.getFullYear());
  const [attiva, setAttiva] = useStateEco(null);

  const anni = [...new Set(ECO_STORICO.map(m => m.anno))].sort((a, b) => b - a);
  const mesi = modo === 'mese' ? [ECO_STORICO[k]] : ECO_STORICO.filter(m => m.anno === anno);
  const frazioneDi = (m) => m.corrente ? ECO_OGGI.getDate() / ecoGiorniNelMese(ECO_OGGI) : 1;
  const etichetta = modo === 'mese'
    ? `${ECO_MESI_LUNGHI[mesi[0].data.getMonth()]} ${mesi[0].data.getFullYear()}`
    : String(anno);

  // Ogni voce che pesa sul conto economico del periodo: consumo, fissi e quote
  // di ammortamento. I beni strumentali entrano per la quota, non per il prezzo
  // d'acquisto — quello e cassa, e in una torta dei COSTI non ci sta.
  const dentro = (f, m) => {
    const dm = new Date(m.data.getFullYear(), m.data.getMonth(), 1);
    if (f.dal && dm < new Date(f.dal.getFullYear(), f.dal.getMonth(), 1)) return false;
    if (f.a && dm > f.a) return false;
    if (f.periodicita === 'una-tantum')
      return f.dal.getFullYear() === dm.getFullYear() && f.dal.getMonth() === dm.getMonth();
    return true;
  };
  const voci = [];
  ECO_SERVIZI.forEach(s => {
    const imp = mesi.reduce((t, m) => t + ecoCostoServizio(s, m) * frazioneDi(m), 0);
    if (imp > 0) voci.push({ nome:s.nome, categoria:s.categoria, importo:imp });
  });
  ECO_FISSI.forEach(f => {
    const mv = mesi.filter(m => dentro(f, m));
    if (!mv.length) return;
    const perMese = f.periodicita === 'annuale' ? f.importo / 12 : f.importo;
    const imp = f.periodicita === 'una-tantum' ? f.importo : perMese * mv.length;
    if (imp > 0) voci.push({ nome:f.voce, categoria:f.categoria, importo:imp });
  });
  ECO_CESPITI.forEach(c => {
    const imp = mesi.reduce((t, m) => t + ecoAmmortamento(c, m.data).quota, 0);
    if (imp > 0) voci.push({ nome:`${c.voce} · ammortamento`, categoria:'Ammortamenti', importo:imp });
  });

  const perCat = {};
  voci.forEach(v => {
    if (!perCat[v.categoria]) perCat[v.categoria] = { categoria:v.categoria, importo:0, voci:[] };
    perCat[v.categoria].importo += v.importo;
    perCat[v.categoria].voci.push(v);
  });
  const gruppi = Object.values(perCat).sort((a, b) => b.importo - a.importo);
  gruppi.forEach((g, i) => { g.colore = ECO_TORTA[i % ECO_TORTA.length]; g.voci.sort((a, b) => b.importo - a.importo); });
  const totale = gruppi.reduce((t, g) => t + g.importo, 0) || 1;

  let cursore = 0;
  const fette = gruppi.map(g => {
    const ampiezza = g.importo / totale * 360;
    const f = { g, da:cursore, a:cursore + ampiezza };
    cursore += ampiezza;
    return f;
  });
  const sel = attiva != null ? gruppi[attiva] : null;
  const D = 300, C = D / 2;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={ECO_TITOLO}>Composizione dei costi</div>
        <div style={{flex:1}}/>
        <select value={modo === 'mese' ? `m${k}` : `a${anno}`}
          onChange={e=>{ const v = e.target.value;
            if (v[0] === 'm') { setModo('mese'); setK(Number(v.slice(1))); }
            else { setModo('anno'); setAnno(Number(v.slice(1))); } }}
          style={{...ECO_SEL, width:'auto', minWidth:190, paddingRight:32}}>
          <optgroup label="Anno intero">
            {anni.map(a => <option key={a} value={`a${a}`}>{a}</option>)}
          </optgroup>
          <optgroup label="Mese">
            {ECO_STORICO.map((m, i) => (
              <option key={m.mese} value={`m${i}`}>{ECO_MESI_LUNGHI[m.data.getMonth()]} {m.data.getFullYear()}</option>
            )).reverse()}
          </optgroup>
        </select>
      </div>

      <div style={{...ECO_CARD, padding:'22px 24px', display:'grid',
        gridTemplateColumns:`${D}px minmax(0,1fr)`, gap:28, alignItems:'center'}}>
        <div style={{position:'relative', width:D, height:D}}>
          <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`}>
            {fette.map((f, i) => {
              const on = attiva === i;
              return (
                <path key={f.g.categoria} d={ecoFetta(C, C, on ? 138 : 132, 84, f.da, f.a)}
                  fill={f.g.colore} opacity={attiva == null || on ? 1 : 0.32}
                  onMouseEnter={()=>setAttiva(i)} onMouseLeave={()=>setAttiva(null)}
                  style={{cursor:'pointer', transition:'opacity 140ms ease'}}/>
              );
            })}
          </svg>
          {/* Il centro non ripete la legenda: dice il totale quando non punti
              niente, e la fetta puntata quando ne punti una. */}
          <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center',
            pointerEvents:'none', textAlign:'center', padding:'0 54px'}}>
            <div>
              <div style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.05em', lineHeight:1.3}}>
                {sel ? sel.categoria : `Costi ${etichetta}`}
              </div>
              <div style={{fontSize:24, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em',
                marginTop:5, ...ECO_NUM}}>{ecoEur(sel ? sel.importo : totale)}</div>
              {sel && (
                <div style={{fontSize:13, fontWeight:700, color:sel.colore, marginTop:3, ...ECO_NUM}}>
                  {ecoPct(sel.importo / totale * 100)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {gruppi.map((g, i) => {
            const on = attiva === i;
            return (
              <div key={g.categoria} onMouseEnter={()=>setAttiva(i)} onMouseLeave={()=>setAttiva(null)}
                style={{padding:'8px 10px', borderRadius:8, cursor:'pointer',
                  background: on ? ADM.NEUTRAL_SOFT : 'transparent',
                  transition:'background 120ms ease'}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span style={{width:10, height:10, borderRadius:3, background:g.colore, flexShrink:0}}/>
                  <span style={{fontSize:13.2, fontWeight:on ? 800 : 600, color:ADM.TEXT, flex:1, minWidth:0}}>{g.categoria}</span>
                  <span style={{fontSize:12.6, color:ADM.MUTED, ...ECO_NUM}}>{ecoPct(g.importo / totale * 100)}</span>
                  <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, width:88, textAlign:'right', ...ECO_NUM}}>{ecoEur(g.importo)}</span>
                </div>
                {/* Lo spaccato compare sotto la fetta puntata, non in un riquadro
                    a parte: cosi si legge senza spostare lo sguardo. */}
                {on && (
                  <div style={{marginTop:7, paddingLeft:20, display:'flex', flexDirection:'column', gap:4}}>
                    {g.voci.map(v => (
                      <div key={v.nome} style={{display:'flex', alignItems:'baseline', gap:10, fontSize:12.2}}>
                        <span style={{color:ADM.MUTED, flex:1, minWidth:0, overflow:'hidden',
                          whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{v.nome}</span>
                        <span style={{color:ADM.MUTED_SOFT, ...ECO_NUM}}>{ecoPct(v.importo / totale * 100)}</span>
                        <span style={{color:ADM.TEXT, fontWeight:600, width:88, textAlign:'right', ...ECO_NUM}}>{ecoEur2(v.importo)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ GUSCIO ═════════════════════════════════════════════════════════════ */
function Economix() {
  const [tab, setTab] = useStateEco('costi');
  const [, forzaEco] = useStateEco(0);
  const forza = () => forzaEco(n => n + 1);
  // Le leve restano: non hanno piu una schermata, ma sono ancora quelle che
  // producono la proiezione di cassa da cui esce l'autonomia.
  const leve = ecoLeveIniziali();
  const mix = ecoMixPiani();

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      <AdmCard padding={0}>
        <div style={{padding:'0 22px 0 8px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center'}}>
          <AdmTabBar tabs={[
            { id:'costi',      label:'Costi' },
            { id:'bilancio',   label:'Conto economico' },
            { id:'cassa',      label:'Cassa' },
            { id:'patrimonio', label:'Stato patrimoniale' },
            { id:'dati',       label:'Dati' },
          ]} active={tab} onChange={setTab}/>
        </div>
        <div style={{padding:'20px 22px'}}>
          {tab === 'costi'      && <EcoCosti mix={mix} forza={forza}/>}
          {tab === 'bilancio'   && <EcoBilancio mix={mix}/>}
          {tab === 'cassa'      && <EcoCassa mix={mix} leve={leve} forza={forza}/>}
          {tab === 'patrimonio' && <EcoPatrimonio mix={mix}/>}
          {tab === 'dati'       && <EcoDati mix={mix}/>}
        </div>
      </AdmCard>
    </div>
  );
}

window.Economix = Economix;
window.EcoDati = EcoDati;

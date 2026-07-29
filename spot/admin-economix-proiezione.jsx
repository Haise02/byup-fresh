// Economix — la proiezione e il guscio della sezione.

function EcoLeva({ etichetta, valore, onChange, suffisso, passo, min, max, nota }) {
  return (
    <div>
      <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:5}}>
        <span style={{fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.05em', flex:1}}>{etichetta}</span>
        <span style={{fontSize:14.5, fontWeight:800, color:ADM.TEXT, ...ECO_NUM}}>
          {String(valore).replace('.', ',')}{suffisso || ''}
        </span>
      </div>
      <input type="range" value={valore} min={min} max={max} step={passo}
        onChange={e=>onChange(parseFloat(e.target.value))}
        style={{width:'100%', accentColor:ADM.PINK, cursor:'pointer'}}/>
      {nota && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:4, lineHeight:1.4}}>{nota}</div>}
    </div>
  );
}

function EcoProiezione({ mix, leve, setLeve, base }) {
  const mesi = ecoProiettaDriver(leve);
  const righe = mesi.map(d => {
    const ric = ecoRicavi(d, mix);
    const var_ = ecoCostiVariabili(d);
    const fis = ecoFissiDelMese(d.data);
    return { d, ric, var_, fis, margine: ric.totale - var_ - fis };
  });
  const ultimo = mesi[mesi.length - 1];
  const tot = righe.reduce((a, r) => ({
    ricavi:a.ricavi + r.ric.totale, var_:a.var_ + r.var_, fis:a.fis + r.fis, margine:a.margine + r.margine,
  }), { ricavi:0, var_:0, fis:0, margine:0 });
  const picco = Math.max(...righe.map(r => Math.abs(r.margine)), 1);
  const modificato = JSON.stringify(leve) !== JSON.stringify(base);

  // L'obiettivo di locali a fine anno risolve all'indietro l'acquisizione:
  // è il modo in cui la domanda viene posta davvero ("e se arrivo a 80?").
  const obiettivo = ultimo ? ultimo.localiAttivi : 0;
  const impostaObiettivo = (target) => {
    const partenza = ECO_STORICO[ECO_STORICO.length - 1].localiAttivi;
    const n = mesi.length - 1;
    if (n <= 0) return;
    const c = 1 - leve.churnMensile / 100;
    // target = partenza·cⁿ + nuovi·(cⁿ−1)/(c−1)  →  si risolve per nuovi
    const fatt = c === 1 ? n : (Math.pow(c, n) - 1) / (c - 1);
    const nuovi = Math.max(0, (target - partenza * Math.pow(c, n)) / fatt);
    setLeve(l => ({ ...l, nuoviLocaliMese: Math.round(nuovi * 10) / 10 }));
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      {/* Le leve. Sono la schermata: i numeri sotto sono una conseguenza. */}
      <div style={{...ECO_CARD, padding:'18px 20px'}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:16}}>
          <div style={{...ECO_H, marginBottom:0}}>Ipotesi</div>
          <span style={{fontSize:12.2, color:ADM.MUTED}}>
            ricavate dai tuoi dati · l’acquisizione da una regressione sui dodici mesi chiusi
            {base._r2 != null && ` (r² ${base._r2.toFixed(2).replace('.', ',')}${base._r2 < 0.6 ? ', la retta spiega poco: prendila con cautela' : ''})`}
          </span>
          <div style={{flex:1}}/>
          {modificato && <AdmButton variant="ghost" size="sm" onClick={()=>setLeve({ ...base })}>Torna alle stime</AdmButton>}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:22}}>
          <EcoLeva etichetta="Nuovi locali al mese" valore={leve.nuoviLocaliMese} min={0} max={200} passo={0.5}
            onChange={v=>setLeve(l=>({...l, nuoviLocaliMese:v}))}
            nota="quanti se ne attivano ogni mese, al netto di quelli che se ne vanno"/>
          <EcoLeva etichetta="Abbandono mensile" valore={leve.churnMensile} suffisso="%" min={0} max={100} passo={0.5}
            onChange={v=>setLeve(l=>({...l, churnMensile:v}))}
            nota="quota di locali attivi che chiude ogni mese"/>
          <EcoLeva etichetta="Transazioni per locale" valore={leve.ordiniPerLocale} min={0} max={20000} passo={50}
            onChange={v=>setLeve(l=>({...l, ordiniPerLocale:v}))}
            nota="pagamenti al mese in un locale medio"/>
          <EcoLeva etichetta="Pagamenti da app" valore={leve.quotaApp} suffisso="%" min={0} max={100} passo={1}
            onChange={v=>setLeve(l=>({...l, quotaApp:v}))}
            nota="pesano 0,5 invece di 1,0: più app significa meno quota consumata, e quindi MENO ricavo da transazioni extra"/>
          <EcoLeva etichetta="Utenti app per locale" valore={leve.utentiPerLocale} min={0} max={5000} passo={5}
            onChange={v=>setLeve(l=>({...l, utentiPerLocale:v}))}
            nota="guida Maps, notifiche e traffico immagini"/>
          <div>
            <div style={{fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em', marginBottom:6}}>Locali a fine anno</div>
            <input value={obiettivo} onChange={e=>impostaObiettivo(parseInt(e.target.value, 10) || 0)}
              style={{...ECO_INP, fontSize:15, fontWeight:800, ...ECO_NUM}}/>
            <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:4, lineHeight:1.4}}>
              scrivi il traguardo e l’acquisizione mensile si ricalcola all’indietro
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {[
          { et:`Ricavi ${ECO_OGGI.getMonth() === 11 ? 'del mese' : 'da qui a dicembre'}`, v:ecoEur(tot.ricavi) },
          { et:'Costi a consumo', v:ecoEur(tot.var_) },
          { et:'Costi fissi', v:ecoEur(tot.fis) },
          { et:'Margine', v:ecoEur(tot.margine), tono: tot.margine >= 0 ? ADM.OK : ADM.DANGER },
        ].map(c => (
          <div key={c.et} style={{...ECO_CARD, padding:'14px 16px'}}>
            <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em'}}>{c.et}</div>
            <div style={{fontSize:23, fontWeight:800, letterSpacing:'-0.02em', marginTop:6,
              color:c.tono || ADM.TEXT, ...ECO_NUM}}>{c.v}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={ECO_H}>Mese per mese</div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'92px 88px 108px 108px 108px 100px minmax(0,1fr)', gap:10}}>
            <div>Mese</div><div>Locali</div><div>Transazioni</div><div>Ricavi</div>
            <div>A consumo</div><div>Fissi</div><div>Margine</div>
          </div>
          {righe.map((r, i) => (
            <div key={r.d.mese} style={{display:'grid', gridTemplateColumns:'92px 88px 108px 108px 108px 100px minmax(0,1fr)',
              gap:10, alignItems:'center', padding:'10px 16px',
              background: r.d.primo ? '#FAFAFB' : '#fff',
              borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{fontSize:12.6, fontWeight:700, color:ADM.TEXT}}>
                {r.d.mese}{r.d.primo && <span style={{fontSize:10.6, color:ADM.MUTED_SOFT, fontWeight:500}}> in corso</span>}
              </div>
              <div style={{fontSize:12.6, color:ADM.TEXT, ...ECO_NUM}}>{r.d.localiAttivi}</div>
              <div style={{fontSize:12.4, color:ADM.MUTED, ...ECO_NUM}}>{r.d.transazioni.toLocaleString('it-IT')}</div>
              <div style={{fontSize:12.8, color:ADM.TEXT, fontWeight:600, ...ECO_NUM}}>{ecoEur(r.ric.totale)}</div>
              <div style={{fontSize:12.6, color:ADM.MUTED, ...ECO_NUM}}>{ecoEur(r.var_)}</div>
              <div style={{fontSize:12.6, color:ADM.MUTED, ...ECO_NUM}}>{ecoEur(r.fis)}</div>
              <div style={{display:'flex', alignItems:'center', gap:9}}>
                <span style={{fontSize:13, fontWeight:700, width:74, textAlign:'right', ...ECO_NUM,
                  color: r.margine >= 0 ? ADM.OK : ADM.DANGER}}>{ecoEur(r.margine)}</span>
                <span style={{flex:1, height:6, borderRadius:99, background:'rgba(49,53,61,0.06)', position:'relative'}}>
                  <span style={{position:'absolute', top:0, bottom:0, left:'50%', width:1, background:ADM.BORDER}}/>
                  <span style={{position:'absolute', top:0, bottom:0, borderRadius:99,
                    background: r.margine >= 0 ? ADM.OK : ADM.DANGER,
                    left: r.margine >= 0 ? '50%' : `${50 - Math.abs(r.margine) / picco * 50}%`,
                    width:`${Math.abs(r.margine) / picco * 50}%`}}/>
                </span>
              </div>
            </div>
          ))}
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
  const base = ecoLeveIniziali();
  const [leve, setLeve] = useStateEco(() => ecoLeveIniziali());
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
            { id:'proiezione', label:'Proiezione' },
          ]} active={tab} onChange={setTab}/>
        </div>
        <div style={{padding:'20px 22px'}}>
          {tab === 'costi'      && <EcoCosti mix={mix} forza={forza}/>}
          {tab === 'bilancio'   && <EcoBilancio mix={mix}/>}
          {tab === 'cassa'      && <EcoCassa mix={mix} leve={leve}/>}
          {tab === 'patrimonio' && <EcoPatrimonio mix={mix}/>}
          {tab === 'proiezione' && <EcoProiezione mix={mix} leve={leve} setLeve={setLeve} base={base}/>}
        </div>
      </AdmCard>
    </div>
  );
}

window.Economix = Economix;
window.EcoProiezione = EcoProiezione;

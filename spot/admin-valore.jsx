// ════════════════════════════════════════════════════════════════════════════
// VALORE PER IL LOCALE · la tab che dimostra il ritorno — le viste
// ════════════════════════════════════════════════════════════════════════════
//
// Una sola domanda, e in ordine: quanto vale, per chi, quanto è solido, e con
// chi bisogna parlarne domani mattina. Il modello sta in admin-valore-data.jsx.

const valNum = (v, dec = 0) => Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const valEur = (v, dec = 0) => '€ ' + valNum(v, dec);
const valSegno = (v, dec = 1) => (v >= 0 ? '+' : '') + valNum(v, dec) + '%';
// Un valore va scritto con la sua unità: 4,8 turni non è 4,8 euro.
const valConUnita = (v, ind) => ind.unita === '€' ? valEur(v, ind.dec)
  : ind.unita === '%' ? valNum(v, ind.dec) + '%'
  : ind.unita === '×' ? valNum(v, ind.dec) + '×'
  : ind.unita === 'min' ? valNum(v, ind.dec) + ' min'
  : valNum(v, ind.dec);
// «Meglio» non è sempre «di più»: sul tempo di servizio e sul costo di sala,
// il segno buono è quello negativo.
const valBuono = (delta, ind) => ind.verso === 'su' ? delta > 0 : delta < 0;
const valTono = (delta, ind) => Math.abs(delta) < 0.5 ? ADM.MUTED : valBuono(delta, ind) ? ADM.OK : ADM.DANGER;

function ValCifra({ label, valore, sotto, tono = 'TEXT', grande }) {
  return (
    <div style={{padding: grande ? '18px 20px' : '14px 16px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:10}}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
      <div style={{fontSize: grande ? 34 : 26, fontWeight:800, color:ADM[tono] || ADM.TEXT, letterSpacing:'-0.03em', marginTop:5, lineHeight:1}}>{valore}</div>
      {sotto && <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:6, lineHeight:1.45}}>{sotto}</div>}
    </div>
  );
}

function ValNota({ children, tono = 'neutro' }) {
  const c = tono === 'cauto' ? ADM.WARN : ADM.MUTED;
  return (
    <div style={{display:'flex', gap:8, alignItems:'flex-start', fontSize:12.8, color:c, lineHeight:1.5}}>
      <span style={{flexShrink:0, marginTop:2}}><BuIcons.info size={13} color={c}/></span>
      <span>{children}</span>
    </div>
  );
}

function ValTestata({ titolo, sotto, destra }) {
  return (
    <div style={{padding:'14px 22px 12px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap'}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{titolo}</div>
        {sotto && <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>{sotto}</div>}
      </div>
      {destra}
    </div>
  );
}

// ═══════════ 1 · Il numero ══════════════════════════════════════════════════
function ValIlNumero() {
  const ric = VAL_PREPOST.find(i => i.k === 'ricavoMese');
  const C = VAL_CONTO;
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="Quanto vale byup per un locale che lo usa"
        sotto={`Confronto prima/dopo dentro lo stesso locale, al netto della deriva di mercato · ${ric.n} locali che hanno superato il ${VAL_SOGLIA}% di ordini digitali`}
      />
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <ValCifra grande label="Ricavo mensile" valore={valSegno(ric.delta)} tono="OK"
          sotto={`Mediana · ${valEur(C.ricavoAggiuntivo)} in più al mese su ${valEur(C.ricavoMedianoBase)} di partenza`}/>
        <ValCifra grande label="Margine aggiuntivo" valore={valEur(C.margineAggiuntivo)}
          sotto={`Al netto del food cost · margine lordo di rete ${C.margineLordo}%`}/>
        <ValCifra grande label="Peso del canone" valore={valNum(C.canoneSuMargine, 1) + '%'} tono="PINK_DARK"
          sotto={`Il canone mediano (${valEur(C.canoneMediano, 2)}) è questa quota del margine aggiuntivo · ${valNum(C.ritornoPerEuro, 0)}€ di margine per ogni € speso`}/>
        <ValCifra grande label="Ci guadagnano" valore={`${ric.n - ric.senzaEffetto} su ${ric.n}`} tono="OK"
          sotto={`Locali che dopo la soglia hanno migliorato il ricavo · gli altri ${ric.senzaEffetto} no, ed è la coda che una media nasconderebbe`}/>
      </div>
      <div style={{padding:'0 22px 18px', display:'flex', flexDirection:'column', gap:8}}>
        <ValNota>
          <strong style={{color:ADM.TEXT}}>La frase, se serve dirla in una riga:</strong> un locale che porta gli ordini digitali sopra il {VAL_SOGLIA}% fa
          circa <strong style={{color:ADM.TEXT}}>{valSegno(ric.delta, 0)}</strong> di ricavo, che al margine sono {valEur(C.margineAggiuntivo)} al mese —
          contro un canone di {valEur(C.canoneMediano, 2)}. Il resto di questa pagina serve a difendere quel numero.
        </ValNota>
        <ValNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Non è una promessa.</strong> È la mediana di {ric.n} locali, {ric.senzaEffetto} dei quali non ne hanno tratto nulla,
          e {C.sottoCosto} non coprono nemmeno il canone. Chi vende deve dire la mediana <em>e</em> la coda.
        </ValNota>
        <ValNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Il moltiplicatore dipende da quanto è grande chi lo riceve.</strong> La rete di oggi è fatta di locali ad alto volume
          — il ricavo mediano di partenza è {valEur(C.ricavoMedianoBase)} al mese, che è ordini/giorno × scontrino medio del registro locali —
          e su quella taglia qualunque canone sparisce. Su un locale da {valEur(C.piccolo.ricavo)} al mese lo stesso effetto vale {valEur(C.piccolo.margine)} di margine
          contro {valEur(C.piccolo.canone, 2)} di Starter: {valNum(C.piccolo.volte, 1)}× invece di {valNum(C.ritornoPerEuro, 0)}×. Positivo lo stesso, ma è l'ordine di grandezza da usare
          quando si parla con un locale piccolo.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 2 · Le due popolazioni ═════════════════════════════════════════
function ValPopolazioni() {
  const gruppi = [
    { nome: `Adottanti · oltre il ${VAL_SOGLIA}%`, arr: VAL_ADOTTANTI, colore: ADM.OK },
    { nome: `Sotto soglia · fino al ${VAL_SOGLIA}%`, arr: VAL_SOTTO, colore: ADM.MUTED },
  ];
  const car = [
    { label:'Locali', f: (g) => valNum(g.length) },
    { label:'Adozione mediana', f: (g) => valNum(valMediana(g.map(l => l.adozione)), 1) + '%' },
    { label:'Posti a sedere (mediana)', f: (g) => valNum(valMediana(g.map(l => l.posti))) },
    { label:'Ordini/giorno (mediana)', f: (g) => valNum(valMediana(g.map(l => l.ordiniGiorno))) },
    { label:'Tipi prevalenti', f: (g) => {
        const c = {}; g.forEach(l => { c[l.tipo] = (c[l.tipo] || 0) + 1; });
        return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t, n]) => `${t} ${n}`).join(' · ');
      } },
  ];
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="I due gruppi, prima di confrontarli"
        sotto="Chi sono, e quanto si somigliano · se non si somigliano, la differenza grezza non misura byup"
      />
      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', columnGap:16, padding:'11px 22px', fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Caratteristica</div>
        {gruppi.map(g => <div key={g.nome} style={{textAlign:'right'}}>{g.nome}</div>)}
      </div>
      {car.map((c, i) => (
        <div key={c.label} style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', columnGap:16, padding:'11px 22px', alignItems:'center', borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{fontSize:13.4, color:ADM.TEXT, fontWeight:500}}>{c.label}</div>
          {gruppi.map(g => (
            <div key={g.nome} style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{c.f(g.arr)}</div>
          ))}
        </div>
      ))}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <ValNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Qui sta il trucco di tutti i confronti fatti male.</strong> Chi adotta è mediamente un locale più grande e gestito
          meglio: parte da più in alto <em>prima</em> di byup. Se ci si ferma alla colonna «grezza» della tabella qui sotto, si sta vendendo
          la bravura del ristoratore come se fosse merito nostro.
        </ValNota>
        <ValNota>
          Per questo le letture sono tre, e l'unica da portare fuori è la terza: lo stesso locale prima e dopo, con la deriva di mercato tolta.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 3 · Il confronto, tre letture ══════════════════════════════════
function ValConfronto() {
  const [aperto, setAperto] = useStateDash(null);
  const perK = (arr, k) => arr.find(x => x.k === k);
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="Gli otto indicatori, letti in tre modi"
        sotto="Grezzo (da non usare da solo) · appaiato sul volume di ordini · prima/dopo dentro lo stesso locale, netto deriva"
      />
      <div style={{display:'grid', gridTemplateColumns:'1.9fr 1.15fr 1.15fr 0.95fr 0.95fr 1.1fr', columnGap:14, padding:'11px 22px', fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Indicatore</div>
        <div style={{textAlign:'right'}}>Adottanti</div>
        <div style={{textAlign:'right'}}>Sotto soglia</div>
        <div style={{textAlign:'right'}}>Grezzo</div>
        <div style={{textAlign:'right'}}>Appaiato</div>
        <div style={{textAlign:'right'}}>Prima/dopo</div>
      </div>
      {VAL_GREZZA.map((g, i) => {
        const ap = perK(VAL_APPAIATA, g.k);
        const pp = perK(VAL_PREPOST, g.k);
        const isOpen = aperto === g.k;
        return (
          <div key={g.k} style={{borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div
              onClick={() => setAperto(isOpen ? null : g.k)}
              className="adm-row"
              style={{
                display:'grid', gridTemplateColumns:'1.9fr 1.15fr 1.15fr 0.95fr 0.95fr 1.1fr', columnGap:14,
                padding:'12px 22px', alignItems:'center', cursor:'pointer',
                background: isOpen ? ADM.PANEL_SOFT : 'transparent',
              }}>
              <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
                <span style={{transform: isOpen ? 'rotate(90deg)' : 'none', transition:'transform .15s', display:'inline-flex', color:ADM.MUTED_SOFT}}>
                  <BuIcons.chevronRight size={13}/>
                </span>
                <span style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{g.label}</span>
              </div>
              <div style={{fontSize:13.8, fontWeight:700, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valConUnita(g.adottanti, g)}</div>
              <div style={{fontSize:13.8, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valConUnita(g.sotto, g)}</div>
              <div style={{fontSize:13.4, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums', color: g.taglia ? ADM.WARN : ADM.MUTED_SOFT}}>
                {g.taglia && <BuIcons.info size={11} color={ADM.WARN}/>} {valSegno(g.delta)}
              </div>
              <div style={{fontSize:13.4, fontWeight:700, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valSegno(ap.delta)}</div>
              <div style={{fontSize:14.6, fontWeight:800, color: valTono(pp.delta, g), textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valSegno(pp.delta)}</div>
            </div>
            {isOpen && (
              <div style={{padding:'2px 22px 18px 44px', background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:10}}>
                <div style={{fontSize:13.2, color:ADM.MUTED, lineHeight:1.5}}>
                  <strong style={{color:ADM.TEXT}}>Perché è qui.</strong> {g.perche}.
                  {' '}Direzione buona: {g.verso === 'su' ? 'più alto' : 'più basso'}.
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10}}>
                  <div style={{padding:'10px 12px', background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:9}}>
                    <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em'}}>Grezzo</div>
                    <div style={{fontSize:17, fontWeight:800, color:ADM.MUTED, marginTop:3}}>{valSegno(g.delta)}</div>
                    <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:4, lineHeight:1.45}}>
                      Mediana dei {VAL_ADOTTANTI.length} adottanti contro i {VAL_SOTTO.length} sotto soglia.
                      {g.taglia
                        ? <> <strong style={{color:ADM.WARN}}>Da buttare via:</strong> è una grandezza di livello, e fra due locali diversi dice quanto sono grandi, non quanto funzionano.</>
                        : <> Dentro c'è la selezione: chi adotta parte già da più in alto.</>}
                    </div>
                  </div>
                  <div style={{padding:'10px 12px', background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:9}}>
                    <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em'}}>Appaiato</div>
                    <div style={{fontSize:17, fontWeight:800, color:ADM.TEXT, marginTop:3}}>{valSegno(ap.delta)}</div>
                    <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:4, lineHeight:1.45}}>
                      {ap.n} coppie appaiate sul volume di ordini — il confondente vero — e, dove possibile, sullo stesso mestiere.
                      Toglie la taglia, non la bravura.
                    </div>
                  </div>
                  <div style={{padding:'10px 12px', background:'#fff', border:`1px solid ${ADM.PINK_SOFT}`, borderRadius:9}}>
                    <div style={{fontSize:12, fontWeight:700, color:ADM.PINK_DARK, textTransform:'uppercase', letterSpacing:'0.05em'}}>Prima / dopo</div>
                    <div style={{fontSize:17, fontWeight:800, color: valTono(pp.delta, g), marginTop:3}}>{valSegno(pp.delta)}</div>
                    <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:4, lineHeight:1.45}}>
                      Variazione dentro lo stesso locale {valSegno(pp.lordo)}, meno la deriva di chi non ha superato la soglia ({valSegno(pp.deriva)}).
                      {pp.senzaEffetto > 0 && <> {pp.senzaEffetto} su {pp.n} non migliorano.</>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <ValNota>
          <strong style={{color:ADM.TEXT}}>Come leggere le tre colonne.</strong> La prima è il confronto che verrebbe naturale fare, e sulle righe segnate
          in arancione è proprio quello che non si deve fare: dicono <em>+{valNum(Math.abs(VAL_GREZZA.find(x => x.k === 'ricavoMese').delta), 0)}%</em> di ricavo perché
          chi adotta è un locale più grande, non perché byup moltiplichi il fatturato per tre. La seconda toglie la taglia appaiando sul volume.
          La terza è l'unica attribuibile a noi. Clicca una riga per il conto per esteso.
        </ValNota>
        <ValNota>
          <strong style={{color:ADM.TEXT}}>Perché sulla spesa per coperto il grezzo dice il contrario.</strong> Fra locali diversi lo scontrino dipende dal
          mestiere prima che dall'adozione: una pizzeria che adotta resta sotto una trattoria che non adotta, e la differenza fra gruppi finisce per misurare
          la composizione dei due insiemi. Dentro lo stesso locale quel problema non esiste — è l'altra faccia della stessa ragione per cui la terza colonna è quella buona.
        </ValNota>
        <ValNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Numeri piccoli.</strong> Le coppie appaiate sono {VAL_APPAIATA[0].n} e i locali con un prima/dopo sono {VAL_PREPOST[0].n}:
          bastano per orientare una scelta, non per un claim pubblicitario. Il modo per irrobustirlo esiste ed è noto: attivare la soglia
          a scaglioni su locali simili e confrontare chi parte prima con chi parte dopo.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 4 · Dose-risposta ══════════════════════════════════════════════
function ValDoseRisposta() {
  const colonne = [
    { k:'spesa', label:'Spesa/coperto' },
    { k:'coperti', label:'Coperti/giorno' },
    { k:'turni', label:'Coperti per posto' },
    { k:'tempo', label:'Servizio', giu:true },
    { k:'revpash', label:'RevPASH' },
    { k:'ricavoMese', label:'Ricavo/mese' },
  ];
  const fasce = VAL_FASCE.filter(f => f.n > 0);
  const mx = Math.max(...fasce.map(f => Math.abs(f.ricavoMese)), 1);
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="Più adozione, più risultato?"
        sotto="Variazione di ogni locale rispetto a sé stesso, mediana per fascia, netto deriva · se le fasce non fossero ordinate, sarebbe rumore"
      />
      <div style={{display:'grid', gridTemplateColumns:`1.3fr repeat(${colonne.length}, minmax(0,1fr)) 1.2fr`, columnGap:12, padding:'11px 22px', fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Fascia di adozione</div>
        {colonne.map(c => <div key={c.k} style={{textAlign:'right'}}>{c.label}</div>)}
        <div>Ricavo, in scala</div>
      </div>
      {fasce.map((f, i) => {
        const sopraSoglia = f.min >= VAL_SOGLIA;
        return (
          <div key={f.label} style={{
            display:'grid', gridTemplateColumns:`1.3fr repeat(${colonne.length}, minmax(0,1fr)) 1.2fr`, columnGap:12,
            padding:'12px 22px', alignItems:'center',
            borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            background: sopraSoglia ? ADM.PINK_BG_SOFT : 'transparent',
          }}>
            <div>
              <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>{f.label}</div>
              <div style={{fontSize:12.2, color:ADM.MUTED}}>{f.n} local{f.n === 1 ? 'e' : 'i'} · mediana {valNum(f.adozioneMediana, 1)}%</div>
            </div>
            {colonne.map(c => {
              const v = f[c.k];
              const buono = c.giu ? v < -0.5 : v > 0.5;
              const neutro = Math.abs(v) < 0.5;
              return (
                <div key={c.k} style={{fontSize:13.6, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums',
                  color: neutro ? ADM.MUTED_SOFT : buono ? ADM.OK : ADM.DANGER}}>
                  {valSegno(v, 1)}
                </div>
              );
            })}
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                <div style={{width:`${Math.min(100, (Math.abs(f.ricavoMese) / mx) * 100)}%`, height:'100%', background: f.ricavoMese >= 0 ? ADM.OK : ADM.DANGER, borderRadius:99}}/>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <ValNota>
          <strong style={{color:ADM.TEXT}}>Perché non ci sono i livelli.</strong> Mettere accanto la spesa media di due fasce direbbe soprattutto che in una
          ci sono locali più grandi che nell'altra: fra fasce cambiano i locali. Qui ogni locale è confrontato con sé stesso, quindi la taglia sparisce.
        </ValNota>
        <ValNota>
          L'effetto <strong style={{color:ADM.TEXT}}>satura</strong>: i primi punti di adozione valgono molto, dal 30% in su si guadagna poco altro.
          È il motivo per cui la soglia commerciale sta al {VAL_SOGLIA}% e non al 40%: è lì che il salto è quasi tutto fatto, ed è un obiettivo che un locale può davvero raggiungere.
        </ValNota>
        <ValNota tono="cauto">
          Le fasce alte hanno pochi locali dentro: l'ordine è coerente, ma un singolo locale può spostare una riga.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 5 · La distribuzione, non la media ═════════════════════════════
function ValDistribuzione() {
  const pp = VAL_PREPOST.find(i => i.k === 'ricavoMese');
  const dati = VAL_CROSSERS.map((l, i) => ({
    nome: l.nome, citta: l.citta, adozione: l.adozione,
    delta: l.ricavoMesePre ? ((l.ricavoMese - l.ricavoMesePre) / l.ricavoMesePre) * 100 - pp.deriva : 0,
    euro: (l.ricavoMese - l.ricavoMesePre) * (VAL_CONTO.margineLordo / 100),
    canone: l.canone,
  })).sort((a, b) => b.delta - a.delta);
  const mx = Math.max(...dati.map(d => Math.abs(d.delta)), 1);
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="Locale per locale, non in media"
        sotto="Variazione di ricavo dopo la soglia, netto deriva · e se copre il canone o no"
      />
      <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:8}}>
        {dati.map(d => {
          const copre = d.euro >= d.canone;
          return (
            <div key={d.nome} style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:13.2, color:ADM.TEXT, fontWeight:500, width:190, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.nome}</span>
              <span style={{fontSize:12.2, color:ADM.MUTED_SOFT, width:58, flexShrink:0, fontVariantNumeric:'tabular-nums'}}>{valNum(d.adozione, 1)}%</span>
              {/* Barra centrata sullo zero: chi sta a sinistra ha peggiorato */}
              <div style={{flex:1, height:14, position:'relative', background:'#F4F5F7', borderRadius:4}}>
                <div style={{position:'absolute', left:'50%', top:-2, bottom:-2, width:1.5, background:ADM.INK_SOFT}}/>
                <div style={{
                  position:'absolute', top:2, bottom:2, borderRadius:3,
                  background: d.delta >= 0 ? ADM.OK : ADM.DANGER,
                  left: d.delta >= 0 ? '50%' : `${50 - (Math.abs(d.delta) / mx) * 50}%`,
                  width: `${(Math.abs(d.delta) / mx) * 50}%`,
                }}/>
              </div>
              <span style={{fontSize:13.2, fontWeight:700, color: d.delta >= 0 ? ADM.OK : ADM.DANGER, width:52, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valSegno(d.delta, 0)}</span>
              <span style={{fontSize:12.6, color:ADM.MUTED, width:74, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valEur(d.euro)}</span>
              <span style={{
                fontSize:12, fontWeight:700, width:96, textAlign:'right',
                color: copre ? ADM.OK : ADM.WARN,
              }}>{copre ? 'copre il canone' : 'sotto il canone'}</span>
            </div>
          );
        })}
      </div>
      <div style={{padding:'0 22px 18px'}}>
        <ValNota>
          La colonna in euro è il <strong style={{color:ADM.TEXT}}>margine</strong> aggiuntivo mensile, non il ricavo: è la cifra da confrontare col canone.
          Mostrare questa lista invece della sola mediana è ciò che rende il numero difendibile davanti a chi lo contesta.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 6 · Il ponte col churn ═════════════════════════════════════════
function ValChurn() {
  const C = VAL_CHURN;
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="Perché questo numero è anche l'antidoto al churn"
        sotto="«Scarse prenotazioni / ordini» è il primo motivo di abbandono · e non è un problema di prodotto, è un problema di adozione"
      />
      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <ValCifra label="Abbandoni per «scarse prenotazioni»" valore={`${C.motivoPct}%`} tono="DANGER"
          sotto="Primo motivo dichiarato in uscita · exit interview, tab Locali"/>
        <ValCifra label="Adozione mediana · chi è attivo" valore={valNum(C.adozioneMedianaAttivi, 1) + '%'} tono="OK"
          sotto="Ordini digitali sul totale"/>
        <ValCifra label="Adozione mediana · chi si è fermato" valore={valNum(C.adozioneMedianaInattivi, 1) + '%'} tono="WARN"
          sotto={`${C.inattiviSottoSoglia} dei ${C.inattiviTot} locali fermi stanno sotto la soglia`}/>
        <ValCifra label="Disdette osservate" valore={valNum(C.churnedTot)}
          sotto="Poche: la relazione qui accanto è un indizio, non una prova"/>
      </div>
      <div style={{padding:'0 22px 18px', display:'flex', flexDirection:'column', gap:8}}>
        <ValNota>
          Il locale che se ne va dicendo «non mi ha portato ordini» quasi sempre non ha mai superato la soglia: non ha visto il ritorno
          perché non è mai arrivato al punto in cui il ritorno comincia. Fa dell'adozione una <strong style={{color:ADM.TEXT}}>metrica di
          sopravvivenza del cliente</strong>, non un vezzo di prodotto — e dà al servizio clienti una lista, non un'impressione.
        </ValNota>
        <ValNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>La freccia potrebbe puntare al contrario.</strong> Un locale che sta chiudendo smette anche di spingere il QR:
          bassa adozione e abbandono possono avere entrambi la stessa causa a monte. Per distinguerli serve guardare quale dei due si muove per primo,
          e con {C.churnedTot} disdette non si può ancora dire.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 7 · Con chi parlarne domani ════════════════════════════════════
function ValPotenziale() {
  const lista = VAL_POTENZIALE.filter(l => l.stato === 'active').slice(0, 12);
  const totale = VAL_POTENZIALE.filter(l => l.stato === 'active').reduce((s, l) => s + l.deltaMargine, 0);
  return (
    <AdmCard padding={0}>
      <ValTestata
        titolo="Chi sta lasciando valore sul tavolo"
        sotto={`Locali attivi sotto il ${VAL_SOGLIA}%, ordinati per quanto guadagnerebbero a superarlo · ${valEur(totale)}/mese di margine complessivo`}
      />
      <div style={{display:'grid', gridTemplateColumns:'2fr 0.9fr 1fr 1.1fr 1.1fr', columnGap:14, padding:'11px 22px', fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Locale</div>
        <div style={{textAlign:'right'}}>Adozione</div>
        <div style={{textAlign:'right'}}>Punti da fare</div>
        <div style={{textAlign:'right'}}>Ricavo in più</div>
        <div style={{textAlign:'right'}}>Margine in più</div>
      </div>
      {lista.map((l, i) => (
        <div key={l.id} style={{
          display:'grid', gridTemplateColumns:'2fr 0.9fr 1fr 1.1fr 1.1fr', columnGap:14,
          padding:'11px 22px', alignItems:'center',
          borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
        }}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{l.nome}</div>
            <div style={{fontSize:12.2, color:ADM.MUTED}}>{l.tipo} · {l.citta} · piano {l.piano}</div>
          </div>
          <div style={{fontSize:13.4, fontWeight:700, color: l.adozione < 5 ? ADM.DANGER : ADM.WARN, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valNum(l.adozione, 1)}%</div>
          <div style={{fontSize:13.4, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>+{valNum(l.puntiDaFare, 1)} pt</div>
          <div style={{fontSize:13.4, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valEur(l.deltaRicavo)}</div>
          <div style={{fontSize:13.8, fontWeight:800, color:ADM.OK, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valEur(l.deltaMargine)}</div>
        </div>
      ))}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <ValNota>
          La stima porta ciascuno al <strong style={{color:ADM.TEXT}}>18%</strong>, appena sopra soglia — non al 40%. È un obiettivo che si raggiunge con
          i QR sui tavoli e il personale che li nomina, non con un progetto.
        </ValNota>
        <ValNota tono="cauto">
          Vale se il locale è come i {VAL_CROSSERS.length} su cui l'effetto è misurato. Un locale che vive di asporto o di clientela di passaggio può non muoversi affatto:
          la cifra è una priorità di chiamata, non un impegno da mettere per iscritto al cliente.
        </ValNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 8 · Cosa non dimostriamo ═══════════════════════════════════════
function ValLimiti() {
  return (
    <AdmCard padding={0}>
      <ValTestata titolo="Cosa questa pagina non dimostra" sotto="Da leggere prima di portarla in una stanza dove qualcuno fa domande"/>
      <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:12}}>
        {[
          ['Non è un esperimento.', `Nessuno ha assegnato l'adozione a caso: i locali ci sono arrivati da soli. Il prima/dopo con la deriva tolta è la cosa più solida che si possa fare senza randomizzare, ma resta un'inferenza.`],
          ['I numeri sono piccoli.', `${VAL_CROSSERS.length} locali con un prima/dopo e ${VAL_COPPIE.length} coppie appaiate. Bastano a decidere dove spingere, non a stampare una percentuale su una brochure.`],
          ['La finestra è corta.', `Chi ha superato la soglia da meno di novanta giorni non entra nel conto: prima di allora si misura la novità, non l'abitudine.`],
          ['Il margine è una media.', `Il ricavo aggiuntivo è convertito in margine al 68%, che è la media di rete. Un locale con food cost al 42% ne vede meno, e va detto a lui, non nascosto nella media.`],
          ['Il passo successivo è noto.', `Attivare la soglia a scaglioni su locali simili — metà adesso, metà fra due mesi — e confrontare i due gruppi. Costa un trimestre e trasforma questa pagina da argomento in prova.`],
        ].map(([t, d]) => (
          <div key={t} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:ADM.MUTED_LIGHT, marginTop:7, flexShrink:0}}/>
            <div style={{fontSize:13.2, color:ADM.MUTED, lineHeight:1.55}}>
              <strong style={{color:ADM.TEXT}}>{t}</strong> {d}
            </div>
          </div>
        ))}
      </div>
    </AdmCard>
  );
}

// ═══════════ La tab ═════════════════════════════════════════════════════════
function DashValore() {
  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>
      <SectionLabel first title="Il ritorno, in una cifra"
        desc={`Chi porta gli ordini digitali oltre il ${VAL_SOGLIA}% guadagna di più? Di quanto, e rispetto a cosa`}/>
      <ValIlNumero/>

      <SectionLabel title="Chi confrontiamo con chi"
        desc="I due gruppi e quanto si somigliano · la parte che rende onesto tutto il resto"/>
      <ValPopolazioni/>

      <SectionLabel title="Il confronto"
        desc="Gli otto indicatori del conto economico del locale, in tre letture"/>
      <ValConfronto/>

      <SectionLabel title="La curva"
        desc="Come cambia il risultato al crescere dell'adozione"/>
      <ValDoseRisposta/>

      <SectionLabel title="La coda"
        desc="Locale per locale, perché una mediana da sola non si difende"/>
      <ValDistribuzione/>

      <SectionLabel title="Il legame con l'abbandono"
        desc="Lo stesso numero, letto come rischio di perdere il cliente"/>
      <ValChurn/>

      <SectionLabel title="Da fare"
        desc="La lista di chi chiamare, in ordine di valore"/>
      <ValPotenziale/>

      <SectionLabel title="Onestà"
        desc="I limiti, scritti prima che li trovi qualcun altro"/>
      <ValLimiti/>
    </div>
  );
}

window.DashValore = DashValore;

// Statistiche — sub-tab Dati economici

function StatEconomici() {
  const [sub, setSub] = React.useState('ricavi');
  const e = STAT_ECONOMICI;
  const v = STAT_VENDITE;
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Sticky come la barra principale, agganciata sotto di essa: il padding
          in basso e il margine negativo che lo compensa lasciano lo spazio di
          prima, ma quando è incollata il contenuto non le passa sotto al filo. */}
      <div style={{
        position:'sticky', top:'var(--stat-barra, 63px)', zIndex: 19,
        background:'#fafafa',
        margin:'0 -28px -16px',
        padding:'0 28px 16px',
        display:'flex', gap: 14,
      }}>
        <StatSubTab active={sub==='ricavi'} onClick={() => setSub('ricavi')} label="Ricavi e costi" icon="commerce-money"/>
        <StatSubTab active={sub==='vendite'} onClick={() => setSub('vendite')} label="Vendite piatti" icon="food-meal"/>
      </div>

      {sub === 'ricavi' && <RicaviCosti d={e} months={months} onVaiVendite={() => setSub('vendite')}/>}
      {sub === 'vendite' && <VenditePiatti v={v}/>}
    </div>
  );
}

// ─── KPI di testa ──────────────────────────────────────────────────────────
// Tre card affiancate, ognuna con la sua tinta: cerchio dell'icona a sinistra,
// etichetta e delta sulla prima riga, valore grande, sottotitolo, e la
// sparkline a destra a raccontare l'andamento senza occupare una card sua.
const ECON_TONI = {
  ricavi: { bg:'linear-gradient(115deg, #FDEBD9 0%, #FFF7EF 52%, #FFFFFF 100%)', bordo:'#F6DCC2', chip:'#FFFFFF', tinta: PN.AMBER },
  costi:  { bg:'linear-gradient(115deg, #FDE9E9 0%, #FFF6F6 52%, #FFFFFF 100%)', bordo:'#F7D4D4', chip:'#FFFFFF', tinta: PN.RED },
  utile:  { bg:'linear-gradient(115deg, #E6F6EC 0%, #F5FBF7 52%, #FFFFFF 100%)', bordo:'#CFEBD9', chip:'#FFFFFF', tinta: PN.GREEN },
};

// Hover dei box: crescono di un soffio e si staccano dal foglio. L'1,5% è
// deliberato — di più e a fianco si vede il box che spinge quello accanto,
// visto che stanno in griglia a filo. La transizione è corta perché sopra i
// 200ms il movimento sembra molle.
const BOX_TRANSITION = 'transform 150ms ease, box-shadow 150ms ease';
const boxHover = {
  onMouseEnter: e => {
    e.currentTarget.style.transform = 'scale(1.015)';
    e.currentTarget.style.boxShadow = PN.CARD_SHADOW_HOVER;
  },
  onMouseLeave: e => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
  },
};

function EconKpi({ tono, icona, label, valore, sub, delta, spark }) {
  const t = ECON_TONI[tono];
  return (
    <div {...boxHover} style={{
      display:'flex', alignItems:'center', gap: 12, minWidth: 0,
      padding: 15, borderRadius: 16,
      background: t.bg, border: `1px solid ${t.bordo}`,
      transition: BOX_TRANSITION,
    }}>
      <span style={{
        width: 44, height: 44, borderRadius:'50%', flexShrink: 0,
        background: t.chip, color: t.tinta,
        display:'grid', placeItems:'center',
        boxShadow:'0 1px 3px rgba(15,17,21,0.08)',
      }}><Icon name={icona} size={21}/></span>

      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8}}>
          <span style={{fontSize: 15, color: PN.MUTED, fontWeight: 500}}>{label}</span>
          <StatDelta value={delta}/>
        </div>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12, minWidth: 0}}>
          <div style={{minWidth: 0}}>
            <div style={{
              fontSize: 25, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.5,
              lineHeight: 1.15, marginTop: 1, whiteSpace:'nowrap',
            }}>{valore}</div>
            {/* Va a capo invece di troncarsi: al minimo del frame (1280)
                "Margine 39,6% sui ricavi" non ci sta su una riga sola. */}
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.3}}>{sub}</div>
          </div>
          {spark && <StatSpark data={spark} color={t.tinta} width={82} height={32}/>}
        </div>
      </div>
    </div>
  );
}

// Bottone di rimando in fondo a una card: pillola quieta, freccia a destra.
// Va SOLO dove porta davvero da qualche parte.
function EconVai({ label, onClick }) {
  return (
    <button onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_FROST; }}
      onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.transform = ''; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; }}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
        width:'100%', marginTop: 14, padding:'10px 16px',
        background: PN.WHITE_HUSH, border:'none', borderRadius: 999,
        fontSize: 14.5, fontWeight: 600, color: PN.TEXT,
        cursor:'pointer', fontFamily:'inherit',
        transition:'background 140ms ease, transform 120ms ease',
      }}>
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
    </button>
  );
}

// Le due tinte dei costi. Stanno qui perché le usano sia la legenda in testa
// alla card sia le barre delle righe: se divergono la legenda mente.
const COSTO_FISSO = '#FFC2BF';   // rosa chiaro, ma pieno abbastanza da staccarsi dal binario
const COSTO_VAR   = PN.PINK;
// Le colonne dell'elenco costi: dichiarate una volta perché intestazione e
// righe devono restare incolonnate, altrimenti la tabella si sfalsa.
const COSTI_COLS = 'minmax(190px, 2fr) minmax(110px, 1.5fr) 52px 96px 62px';

// Delta di un costo: qui il segno si legge al contrario di un ricavo — spendere
// meno è una buona notizia. Sotto il 5% in su resta grigio: un rialzo piccolo
// non è un allarme, e sette pillole rosse renderebbero illeggibile la card.
function CostoDelta({ value }) {
  const buono = value < 0, allarme = value > 5;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      padding:'2px 8px', borderRadius: 999,
      background: buono ? PN.GREEN_SOFT : (allarme ? PN.RED_SOFT : '#F3F4F6'),
      color: buono ? PN.GREEN : (allarme ? PN.RED : PN.MUTED),
      fontSize: 12.5, fontWeight: 700, whiteSpace:'nowrap',
      fontVariantNumeric:'tabular-nums',
    }}>{value > 0 ? '+' : ''}{value.toFixed(1).replace('.', ',')}%</span>
  );
}

// ─── Andamento a linee ────────────────────────────────────────────────────
// Un componente solo per i due andamenti di questa tab — ricavi vs costi e
// scontrino medio per canale. Prima erano due grafici scritti a mano: stesse
// griglie, stesse etichette in fondo alla linea, ma uno aveva il filo del
// mouse col riquadro del mese e l'altro no. Tenerne due significa che il
// giorno che si tocca l'uno, l'altro resta indietro.
const MESI_ESTESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

function StatAndamento({ serie, etichette, fmt, nota }) {
  const [hover, setHover] = React.useState(null);
  const fW = 720, fH = 234, fP = { l: 52, r: 62, t: 16, b: 28 };
  const massimo = Math.max(...serie.flatMap(s => s.dati));
  const maxF = Math.ceil(massimo / 10000) * 10000 || 10;
  const fStep = (fW - fP.l - fP.r) / (etichette.length - 1);
  const fx = (i) => fP.l + i * fStep;
  const fy = (val) => fH - fP.b - (val / maxF) * (fH - fP.t - fP.b);
  const linea = (arr) => arr.map((val, i) => `${i===0?'M':'L'}${fx(i)},${fy(val)}`).join(' ');
  const area = (arr) => `${linea(arr)} L ${fx(arr.length-1)},${fH-fP.b} L ${fP.l},${fH-fP.b} Z`;
  const id = React.useId();

  return (
    <>
      {/* Legenda sotto al titolo, col valore dell'ultimo mese accanto a ogni
          serie: il totale del periodo sta altrove e sarebbe un numero
          diverso da questo. */}
      <div style={{display:'flex', alignItems:'center', gap: 18, marginTop: -8, marginBottom: 12, flexWrap:'wrap'}}>
        {serie.map(s => (
          <span key={s.id} style={{display:'inline-flex', alignItems:'center', gap: 7, fontSize: 14.5}}>
            <span style={{width: 10, height: 10, borderRadius: 3, background: s.colore, flexShrink: 0}}/>
            <span style={{color: PN.MUTED}}>{s.label}</span>
            <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{fmt(s.dati[s.dati.length-1])}</strong>
          </span>
        ))}
        <span style={{fontSize: 14, color: PN.MUTED_SOFT}}>{nota || 'ultimo mese'}</span>
      </div>

      <div style={{position:'relative'}}
        onMouseMove={e => {
          const box = e.currentTarget.getBoundingClientRect();
          const scala = box.width / fW;
          const i = Math.round(((e.clientX - box.left) / scala - fP.l) / fStep);
          setHover(i >= 0 && i < etichette.length ? i : null);
        }}
        onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${fW} ${fH}`} style={{width:'100%', display:'block'}}>
          <defs>
            {serie.map(s => (
              <linearGradient key={s.id} id={`grad-${id}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.colore} stopOpacity="0.18"/>
                <stop offset="100%" stopColor={s.colore} stopOpacity="0"/>
              </linearGradient>
            ))}
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = fP.t + (fH - fP.t - fP.b) * t;
            const val = Math.round(maxF * (1 - t));
            return (
              <g key={i}>
                <line x1={fP.l} y1={y} x2={fW - fP.r} y2={y} stroke={PN.BORDER_SOFT}/>
                <text x={fP.l - 8} y={y + 4} fontSize="11" fill={PN.MUTED} textAnchor="end">
                  {val === 0 ? '€0' : `€${(val/1000).toFixed(0)}K`}
                </text>
              </g>
            );
          })}

          {/* Il filo verticale del punto sotto al mouse, sotto alle linee */}
          {hover != null && (
            <line x1={fx(hover)} y1={fP.t} x2={fx(hover)} y2={fH - fP.b}
              stroke={PN.MUTED_LIGHT} strokeWidth={1} strokeDasharray="4 4"/>
          )}

          {serie.map(s => (
            <g key={s.id}>
              <path d={area(s.dati)} fill={`url(#grad-${id}-${s.id})`}/>
              <path d={linea(s.dati)} fill="none" stroke={s.colore} strokeWidth={2.4}
                strokeLinecap="round" strokeLinejoin="round"/>
              {/* Etichetta diretta a fine linea: l'identità non dipende dal
                  solo colore, come chiede l'accessibilità. */}
              <text x={fx(etichette.length-1) + 10} y={fy(s.dati[s.dati.length-1]) + 4}
                fontSize="12.5" fontWeight="600" fill={s.colore}>{s.label}</text>
              <circle cx={fx(etichette.length-1)} cy={fy(s.dati[s.dati.length-1])} r={4}
                fill={s.colore} stroke={PN.WHITE} strokeWidth={2}/>
              {hover != null && (
                <circle cx={fx(hover)} cy={fy(s.dati[hover])} r={5}
                  fill={s.colore} stroke={PN.WHITE} strokeWidth={2.5}/>
              )}
            </g>
          ))}

          {etichette.map((m, i) => (
            <text key={i} x={fx(i)} y={fH - 8} fontSize="11"
              fill={hover === i ? PN.TEXT : PN.MUTED}
              fontWeight={hover === i ? 700 : 400} textAnchor="middle">{m}</text>
          ))}
        </svg>

        {/* Il riquadro col dettaglio del mese: si sposta a sinistra sugli
            ultimi punti, altrimenti uscirebbe dalla card. */}
        {hover != null && (
          <div style={{
            position:'absolute', top: 8, pointerEvents:'none',
            left: `${(fx(hover) / fW) * 100}%`,
            transform: hover > etichette.length - 4 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            background: PN.WHITE, borderRadius: 12, padding:'10px 13px',
            border:`1px solid ${PN.BORDER_SOFT}`,
            boxShadow:'0 10px 28px rgba(15,17,21,0.13)',
            minWidth: 168,
          }}>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>{MESI_ESTESI[hover] || etichette[hover]}</div>
            {serie.map(s => (
              <div key={s.id} style={{display:'flex', alignItems:'center', gap: 8, fontSize: 13.5, marginTop: 3}}>
                <span style={{width: 9, height: 9, borderRadius: 3, background: s.colore, flexShrink: 0}}/>
                <span style={{flex: 1, color: PN.MUTED}}>{s.label}</span>
                <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{fmt(s.dati[hover])}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function RicaviCosti({ d, months, onVaiVendite }) {
  const eur = (n) => `€ ${Math.round(n).toLocaleString('it-IT', {useGrouping: true})}`;

  // ── Origine incassi: i tre metodi di pagamento sommano ai ricavi ──────────
  const tr = d.totaleRicavi;
  const totRicavi = tr.byup + tr.contanti + tr.carte;
  const segs = [
    { label:'byup',     val: tr.byup,     color: PN.PINK },
    { label:'Contanti', val: tr.contanti, color: PN.GREEN },
    { label:'Carte',    val: tr.carte,    color: PN.BLUE },
  ];
  let cum = 0; const R = 68, CX = 78, CY = 78;
  const arcs = segs.map(s => {
    const start = cum; cum += s.val;
    const a0 = (start / totRicavi) * 2 * Math.PI - Math.PI/2;
    const a1 = (cum / totRicavi) * 2 * Math.PI - Math.PI/2;
    const x0 = CX + R*Math.cos(a0), y0 = CY + R*Math.sin(a0);
    const x1 = CX + R*Math.cos(a1), y1 = CY + R*Math.sin(a1);
    const big = (s.val / totRicavi) > 0.5 ? 1 : 0;
    return {
      ...s, quota: (s.val / totRicavi) * 100,
      path: `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${big} 1 ${x1} ${y1} Z`,
    };
  });
  // Lo spicchio sotto il mouse. Cresce con una scala CSS attorno al centro
  // invece di ricalcolare il path: l'attributo `d` non si può animare, la
  // trasformazione sì. Al 7% l'anello arriva a 151 di 156 del viewBox, quindi
  // resta dentro senza doverlo allargare.
  const [inc, setInc] = React.useState(null);

  // ── Ricavi per canale: le quote vengono dalle serie e si riportano ai
  //    ricavi del periodo, così i tre importi tornano al totale in testa.
  const CANALI = [
    { id:'sala',    label:'Sala',            icona:'place-table',     colore: PN.PINK,  serie: d.origine.sala },
    { id:'asporto', label:'Asporto',         icona:'commerce-bag',    colore: PN.GREEN, serie: d.origine.asporto },
    { id:'diretta', label:'Vendita diretta', icona:'commerce-cart',   colore: PN.BLUE,  serie: d.origine.diretta },
  ].map(c => ({ ...c, somma: c.serie.reduce((s, v) => s + v, 0) }));
  const sommaCanali = CANALI.reduce((s, c) => s + c.somma, 0);
  const canali = CANALI.map(c => ({
    ...c,
    quota: (c.somma / sommaCanali) * 100,
    valore: (c.somma / sommaCanali) * d.ricavi.val,
  }));

  // ── Andamento ricavi vs costi ─────────────────────────────────────────────
  // Due serie: la distanza fra le linee È il margine, e si legge a colpo
  // d'occhio senza calcolarlo. Verde scuro e rosso invece del verde e rosso
  // pieni: quella coppia sparisce col daltonismo (ΔE 5), questa regge (8,6),
  // e comunque ogni linea porta la sua etichetta in fondo.
  const etichette = months;
  const SERIE = [
    { id:'ricavi', label:'Ricavi', colore:'#15803D', dati: d.fatturatoTrend },
    { id:'costi',  label:'Costi',  colore: PN.RED,   dati: d.costiTrend },
  ];
  // ── Margine ───────────────────────────────────────────────────────────────
  const marginePct = (d.utile.val / d.ricavi.val) * 100;
  const anelloR = 58, anelloC = 2 * Math.PI * anelloR;

  // ── Totale costi ──────────────────────────────────────────────────────────
  // Le quote si calcolano sulla somma delle categorie, non su d.costi.val:
  // sono lo stesso numero, ma così i pesi tornano sempre a 100 anche se un
  // domani il breakdown non copre tutto.
  const sommaCosti = d.costiBreakdown.reduce((s, c) => s + c.tot, 0);
  const costiFissi = d.costiBreakdown.reduce((s, c) => s + c.tot * c.fissi / 100, 0);
  const quotaFissi = (costiFissi / sommaCosti) * 100;
  // In ordine di peso: una colonna di barre che scende si legge a colpo
  // d'occhio. "Altro" resta in fondo perché è il residuo, non una categoria.
  const costi = [...d.costiBreakdown].sort((a, b) =>
    (a.cat === 'Altro') - (b.cat === 'Altro') || b.tot - a.tot);
  // Le barre sono in scala sulla categoria più grossa, non sul totale:
  // rapportate al totale sarebbero tutte monconi (la maggiore è il 35%).
  const maxCosto = Math.max(...costi.map(c => c.tot));
  const mix = (c) => c.fissi === 100 ? 'Solo costi fissi'
    : c.var === 100 ? 'Solo costi variabili'
    : `${c.fissi}% fissi · ${c.var}% variabili`;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Riga 1 — i tre numeri del periodo */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        <EconKpi tono="ricavi" icona="commerce-money" label="Ricavi"
          valore={eur(d.ricavi.val)} sub="Entrate del periodo" delta={d.ricavi.delta}
          spark={d.fatturatoTrend}/>
        <EconKpi tono="costi" icona="commerce-wallet" label="Costi"
          valore={eur(d.costi.val)} sub="Uscite del periodo" delta={d.costi.delta}
          spark={d.costiTrend}/>
        <EconKpi tono="utile" icona="chart-bar" label="Utile"
          valore={eur(d.utile.val)} sub={`Margine ${marginePct.toFixed(1).replace('.', ',')}% sui ricavi`}
          delta={d.utile.delta}
          spark={d.fatturatoTrend.map((v, i) => v - d.costiTrend[i])}/>
      </div>

      {/* Riga 2 — andamento a sinistra, da dove arrivano i soldi a destra */}
      <div style={{display:'grid', gridTemplateColumns:'1.3fr 1fr', gap: 16}}>
        <StatCard title="Andamento ricavi vs costi" sub="Ultimi 12 mesi">
          <StatAndamento serie={SERIE} etichette={etichette} fmt={eur}/>
        </StatCard>

        <StatCard title="Origine incassi" sub="Distribuzione metodi di pagamento"
          style={{display:'flex', flexDirection:'column'}}>
          {/* Donut a sinistra e legenda a destra, come nel riferimento: in
              colonna il donut restava piccolo e la card sproporzionata. */}
          <div style={{flex: 1, display:'flex', alignItems:'center', gap: 18, minWidth: 0}}>
            {/* Il cerchio è una quota della card, non una misura fissa: così
                resta grande come nel riferimento anche quando la finestra
                cambia, senza mangiarsi la legenda al minimo. */}
            <svg viewBox="0 0 156 156" style={{
              width:'40%', minWidth: 128, maxWidth: 204, height:'auto', flexShrink: 0,
            }} onMouseLeave={() => setInc(null)}>
              {arcs.map((s, i) => (
                <path key={i} d={s.path} fill={s.color}
                  stroke={PN.WHITE} strokeWidth={2.5} strokeLinejoin="round"
                  onMouseEnter={() => setInc(i)}
                  style={{
                    transformOrigin: `${CX}px ${CY}px`,
                    transform: inc === i ? 'scale(1.07)' : 'scale(1)',
                    // Gli altri si spengono: lo spicchio sotto il mouse resta
                    // l'unico a colore pieno, e si stacca senza doverlo
                    // schiarire (schiarirlo cambierebbe la tinta del metodo).
                    opacity: inc == null || inc === i ? 1 : 0.4,
                    transition:'transform 160ms ease, opacity 160ms ease',
                  }}/>
              ))}
              <circle cx={CX} cy={CY} r={39} fill={PN.WHITE}/>
              {/* Al centro il totale, e sotto il mouse il metodo puntato: è il
                  posto dove l'occhio è già, e non serve un riquadro che entra
                  ed esce. */}
              <text x={CX} y={CY - 5} textAnchor="middle" fontSize="11.5"
                fill={inc == null ? PN.MUTED : arcs[inc].color}>
                {inc == null ? 'Totale' : arcs[inc].label}
              </text>
              <text x={CX} y={CY + 14} textAnchor="middle" fontSize="16" fontWeight="700" fill={PN.TEXT}>
                {eur(inc == null ? totRicavi : arcs[inc].val)}
              </text>
            </svg>
            <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 14}}>
              {arcs.map((s, i) => (
                <div key={i}
                  onMouseEnter={() => setInc(i)} onMouseLeave={() => setInc(null)}
                  style={{
                    display:'flex', alignItems:'center', gap: 9, fontSize: 14.5,
                    opacity: inc == null || inc === i ? 1 : 0.45,
                    transition:'opacity 160ms ease',
                  }}>
                  <span style={{width: 11, height: 11, background: s.color, borderRadius:'50%', flexShrink: 0}}/>
                  <span style={{flex: 1, color: PN.TEXT, minWidth: 0}}>{s.label}</span>
                  <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{Math.round(s.quota)}%</strong>
                  <span style={{color: PN.MUTED, fontVariantNumeric:'tabular-nums', textAlign:'right', whiteSpace:'nowrap'}}>{eur(s.val)}</span>
                </div>
              ))}
            </div>
          </div>
          <EconVai label="Vedi gli incassi in Contabilità"
            onClick={() => { window.location.href = 'byup Contabilita.html?tab=cassa'; }}/>
        </StatCard>
      </div>

      {/* Riga 3 — da quale canale arrivano i ricavi, e quanto margine resta */}
      <div style={{display:'grid', gridTemplateColumns:'1.55fr 1fr', gap: 16}}>
        <StatCard title="Ricavi per canale" sub="Quota di ogni canale sui ricavi del periodo"
          style={{display:'flex', flexDirection:'column'}}>
          <div style={{flex: 1, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
            {/* Bianco su bianco con bordo BORDER_SOFT i tre box sparivano
                dentro la card. Ora sono incavi: fondo del canvas e bordo
                pieno, così il perimetro si legge senza dover alzare il
                contrasto della linea. */}
            {canali.map(c => (
              <div key={c.id} {...boxHover} style={{
                padding: 14, borderRadius: 14, overflow:'hidden',
                background: PN.BG, border:`1px solid ${PN.BORDER}`,
                display:'flex', flexDirection:'column', gap: 2, minWidth: 0,
                transition: BOX_TRANSITION,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 8,
                  background: `${c.colore}1A`, color: c.colore,
                  display:'grid', placeItems:'center', flexShrink: 0,
                }}><Icon name={c.icona} size={17}/></span>
                <div style={{fontSize: 14.5, color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.label}</div>
                <div style={{fontSize: 26, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.5, lineHeight: 1.15}}>
                  {c.quota.toFixed(0)}%
                </div>
                <div style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>{eur(c.valore)}</div>
                {/* Il grafico va a filo dei bordi e prende tutto lo spazio che
                    resta: a misura fissa lasciava un vuoto a destra, e con
                    l'altezza bloccata restava un buco fra l'importo e il
                    grafico quando la card si allunga per stare al passo con
                    quella del margine. In altezza però è a misura: `auto` in
                    alto lo tiene incollato in fondo senza farlo diventare la
                    metà della card. */}
                <div style={{height: 48, margin:'0 -14px -14px', marginTop:'auto', display:'flex'}}>
                  <StatSpark data={c.serie} color={c.colore} width={150} height={54}
                    stretch padY={7} stroke={2}/>
                </div>
              </div>
            ))}
          </div>
          <EconVai label="Vedi gli ordini per canale"
            onClick={() => { window.location.href = 'byup Statistiche.html?tab=operazioni&sub=ordini'; }}/>
        </StatCard>

        <StatCard title="Margine medio" sub="Media del periodo"
          style={{display:'flex', flexDirection:'column'}}>
          <div style={{flex: 1, display:'flex', alignItems:'center', gap: 18, flexWrap:'wrap'}}>
            <svg width={144} height={144} viewBox="0 0 144 144" style={{flexShrink: 0}}>
              <circle cx="72" cy="72" r={anelloR} fill="none" stroke={PN.GREEN_SOFT} strokeWidth="14"/>
              <circle cx="72" cy="72" r={anelloR} fill="none" stroke={PN.GREEN} strokeWidth="14"
                strokeLinecap="round" transform="rotate(-90 72 72)"
                strokeDasharray={`${anelloC * marginePct / 100} ${anelloC}`}/>
              <text x="72" y="70" textAnchor="middle" fontSize="26" fontWeight="700" fill={PN.TEXT}>
                {marginePct.toFixed(1).replace('.', ',')}%
              </text>
              <text x="72" y="90" textAnchor="middle" fontSize="12.5" fill={PN.MUTED}>Margine</text>
            </svg>
            <div style={{flex: 1, minWidth: 150, display:'flex', flexDirection:'column', gap: 10}}>
              {[
                { et:'Ricavi', v: d.ricavi.val, col: PN.GREEN },
                { et:'Costi',  v: d.costi.val,  col: PN.RED },
              ].map((r, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, fontSize: 14.5}}>
                  <span style={{color: PN.TEXT}}>{r.et}</span>
                  <span style={{color: r.col, fontWeight: 600, fontVariantNumeric:'tabular-nums'}}>{eur(r.v)}</span>
                </div>
              ))}
              <div style={{height: 1, background: PN.BORDER_SOFT, margin:'2px 0'}}/>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, fontSize: 15}}>
                <strong style={{color: PN.TEXT}}>Margine lordo</strong>
                <strong style={{color: PN.GREEN, fontVariantNumeric:'tabular-nums'}}>{eur(d.utile.val)}</strong>
              </div>
            </div>
          </div>
          <EconVai label="Vedi il margine per piatto" onClick={() => onVaiVendite && onVaiVendite()}/>
        </StatCard>
      </div>

      {/* Riga 4 — il dettaglio dei costi. La card è larga tutta la pagina:
          a sinistra quanto si è speso e quanto di quella spesa è incomprimibile,
          a destra in cosa se n'è andata. Prima era una riga sola con il nome a
          sinistra, i numeri schiacciati a destra e mezzo metro di vuoto in
          mezzo — e le barre erano tutte lunghe uguale, quindi "Altro" a 1.580 €
          sembrava pesare come gli stipendi a 18.400 €. */}
      <StatCard title="Totale costi" sub="Suddivisi per tipologia e categoria" action={
        <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 14, color: PN.MUTED}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: COSTO_VAR}}/> variabili</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: COSTO_FISSO}}/> fissi</span>
        </span>
      }>
        <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap: 22, alignItems:'stretch'}}>

          {/* Colonna sinistra — il totale e di che pasta è fatto */}
          <div style={{
            padding: 16, borderRadius: 14, overflow:'hidden',
            background: PN.BG, border:`1px solid ${PN.BORDER}`,
            display:'flex', flexDirection:'column',
          }}>
            <div>
              <div style={{fontSize: 14.5, color: PN.MUTED}}>Costi totali del periodo</div>
              <div style={{display:'flex', alignItems:'center', gap: 10, marginTop: 3, flexWrap:'wrap'}}>
                <span style={{
                  fontSize: 30, fontWeight: 700, color: PN.TEXT,
                  letterSpacing: -0.6, lineHeight: 1.15, fontVariantNumeric:'tabular-nums',
                }}>{eur(d.costi.val)}</span>
                <CostoDelta value={d.costi.delta}/>
              </div>
              <div style={{fontSize: 13.5, color: PN.MUTED_SOFT, marginTop: 2}}>rispetto al mese scorso</div>
            </div>

            {/* Quanto dei ricavi se ne va in costi: è il numero che trasforma
                "52.180 €" in un giudizio, ed è il complemento del margine. */}
            <div>
              <div style={{height: 1, background: PN.BORDER, margin:'15px 0'}}/>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 10}}>
                <span style={{fontSize: 14.5, color: PN.MUTED}}>Incidenza sui ricavi</span>
                <strong style={{fontSize: 17, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
                  {((d.costi.val / d.ricavi.val) * 100).toFixed(1).replace('.', ',')}%
                </strong>
              </div>
              <div style={{fontSize: 13.5, color: PN.MUTED_SOFT, marginTop: 2}}>su {eur(d.ricavi.val)} di ricavi</div>
            </div>

            {/* Quanto della spesa è incomprimibile: è il numero che dice se il
                locale può reagire a un mese storto, e finora non c'era. */}
            <div>
              <div style={{height: 1, background: PN.BORDER, margin:'15px 0'}}/>
              <div style={{fontSize: 14.5, color: PN.MUTED, marginBottom: 9}}>Quanto pesa la parte fissa</div>
              <div style={{display:'flex', height: 10, borderRadius: 999, overflow:'hidden', background: PN.WHITE}}>
                <div style={{width: `${quotaFissi}%`, background: COSTO_FISSO}}/>
                <div style={{width: `${100 - quotaFissi}%`, background: COSTO_VAR}}/>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 9, marginTop: 13}}>
                {[
                  { et:'Fissi',     v: costiFissi,             q: quotaFissi,       col: COSTO_FISSO },
                  { et:'Variabili', v: sommaCosti - costiFissi, q: 100 - quotaFissi, col: COSTO_VAR },
                ].map(r => (
                  <div key={r.et} style={{display:'flex', alignItems:'center', gap: 9, fontSize: 14.5}}>
                    <span style={{width: 10, height: 10, borderRadius: 3, background: r.col, flexShrink: 0}}/>
                    <span style={{flex: 1, color: PN.TEXT, minWidth: 0}}>{r.et}</span>
                    <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{eur(r.v)}</strong>
                    <span style={{color: PN.MUTED, fontVariantNumeric:'tabular-nums', width: 34, textAlign:'right'}}>{Math.round(r.q)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* L'andamento chiude la colonna, a filo dei bordi come i grafici
                dei canali. Rosso perché è la tinta dei costi già usata dal
                grafico in testa alla pagina — il rosa qui dentro vuol dire
                fisso o variabile, non costo. */}
            <div style={{flex: 1, display:'flex', flexDirection:'column', marginTop: 18}}>
              <div style={{fontSize: 13.5, color: PN.MUTED}}>Andamento degli ultimi 12 mesi</div>
              <div style={{flex: 1, minHeight: 62, margin:'8px -16px -16px', display:'flex'}}>
                <StatSpark data={d.costiTrend} color={PN.RED} width={150} height={54}
                  stretch padY={7} stroke={2}/>
              </div>
            </div>
          </div>

          {/* Colonna destra — le categorie, in ordine di peso */}
          <div>
            <div style={{
              display:'grid', gridTemplateColumns: COSTI_COLS, gap: 14, alignItems:'center',
              padding:'0 0 8px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
              fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
              textTransform:'uppercase', letterSpacing: 0.5,
            }}>
              <span>Categoria</span>
              <span>Composizione</span>
              <span style={{textAlign:'right'}}>Quota</span>
              <span style={{textAlign:'right'}}>Totale</span>
              <span style={{textAlign:'right'}}>vs mese</span>
            </div>

            {costi.map((c, i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns: COSTI_COLS, gap: 14, alignItems:'center',
                padding:'11px 0',
                borderBottom: i === costi.length - 1 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              }}>
                <div style={{minWidth: 0}}>
                  {/* Sotto i 1300px "Attrezzature & ammortamento" non ci sta:
                      si tronca, ma il nome intero resta leggibile al passaggio. */}
                  <div title={c.cat} style={{
                    fontSize: 14.5, fontWeight: 600, color: PN.TEXT,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  }}>{c.cat}</div>
                  <div style={{fontSize: 12.5, color: PN.MUTED_SOFT, marginTop: 1}}>{mix(c)}</div>
                </div>

                {/* Lunghezza = quanto pesa la categoria, tinte = quanto di quel
                    peso è fisso. Il binario resta visibile per dare la scala. */}
                <div style={{height: 10, borderRadius: 999, background: PN.BORDER_SOFT, overflow:'hidden'}}>
                  <div style={{
                    width: `${(c.tot / maxCosto) * 100}%`, height:'100%',
                    display:'flex', borderRadius: 999, overflow:'hidden',
                  }}>
                    {c.fissi > 0 && <div style={{width: `${c.fissi}%`, background: COSTO_FISSO}}/>}
                    {c.var > 0 && <div style={{width: `${c.var}%`, background: COSTO_VAR}}/>}
                  </div>
                </div>

                <span style={{fontSize: 14.5, color: PN.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
                  {Math.round((c.tot / sommaCosti) * 100)}%
                </span>
                <strong style={{fontSize: 14.5, color: PN.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
                  {eur(c.tot)}
                </strong>
                <span style={{textAlign:'right'}}><CostoDelta value={c.delta}/></span>
              </div>
            ))}
          </div>
        </div>
      </StatCard>
    </div>
  );
}

// ─── KPI di Vendite piatti ────────────────────────────────────────────────
// Pastiglia tonda a sinistra e contenuto in colonna a destra, come i KPI di
// Ricavi e costi. Una differenza obbligata: là il delta sta in fondo alla riga
// dell'etichetta, qui no. Le card sono quattro invece di tre e i nomi sono
// lunghi: dentro 229px a 1280 l'etichetta e la pillola non ci stanno insieme —
// si troncava perfino «Margine medio». Il delta scende quindi accanto al
// numero, dove lo spazio c'è, e l'etichetta si prende tutta la riga.
// Le etichette restano comunque corte e la forma lunga sta nel sottotitolo,
// che prima le ripeteva: «Articoli totali venduti» compariva due volte nella
// stessa card.
// Stessa ricetta dei toni di Ricavi e costi: sfumatura a 115°, dalla tinta
// piena in alto a sinistra al bianco in basso a destra, bordo intonato, e il
// bollino dell'icona BIANCO — su un fondo colorato è il bianco a staccarsi,
// non il colore. Il verde è preso di peso da lì (era l'utile), gli altri tre
// sono costruiti allo stesso modo sulla loro tinta.
const VENDITE_TONI = {
  verde:  { forte: PN.GREEN, bg:'linear-gradient(115deg, #E6F6EC 0%, #F5FBF7 52%, #FFFFFF 100%)', bordo:'#CFEBD9' },
  rosa:   { forte: PN.PINK,  bg:'linear-gradient(115deg, #FFE6E5 0%, #FFF6F5 52%, #FFFFFF 100%)', bordo:'#FBD3D1' },
  blu:    { forte: PN.BLUE,  bg:'linear-gradient(115deg, #E3ECFC 0%, #F4F8FE 52%, #FFFFFF 100%)', bordo:'#CCDBF6' },
  // Giallo scritto a mano: PN ha solo AMBER (#D97706), che a schermo vira
  // all'arancio. Questo è un giallo pieno che resta leggibile anche a 2px
  // di linea.
  giallo: { forte: '#CA8A04', bg:'linear-gradient(115deg, #FAF0CD 0%, #FDF9EB 52%, #FFFFFF 100%)', bordo:'#EFDFAC' },
  viola:  { forte: PN.PURPLE, bg:'linear-gradient(115deg, #EDE9FE 0%, #F7F5FF 52%, #FFFFFF 100%)', bordo:'#DDD5FB' },
};

// `glifo` invece di `icona` dove il simbolo È il concetto: per «margine» e
// «ricavo» un % e un € si leggono all'istante, mentre il set non ha una
// percentuale e il ripiego (il cartellino sconto) diceva un'altra cosa.
function VenditeKpi({ tono, icona, glifo, label, valore, suffisso, sub, delta, trend }) {
  const t = VENDITE_TONI[tono];
  return (
    <div {...boxHover} style={{
      padding: 14, borderRadius: 16, minWidth: 0, overflow:'hidden',
      background: t.bg, border: `1px solid ${t.bordo}`,
      display:'flex', flexDirection:'column',
      transition: BOX_TRANSITION,
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
        <span style={{
          width: 38, height: 38, borderRadius:'50%', flexShrink: 0,
          background: PN.WHITE, color: t.forte,
          display:'grid', placeItems:'center',
          boxShadow:'0 1px 3px rgba(15,17,21,0.08)',
        }}>{glifo
          ? <span style={{fontSize: 19, fontWeight: 700, lineHeight: 1}}>{glifo}</span>
          : <Icon name={icona} size={19}/>}</span>

        <div style={{flex: 1, minWidth: 0}}>
          <div title={label} style={{
            fontSize: 13.5, color: PN.MUTED, fontWeight: 500,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{label}</div>
          <div style={{display:'flex', alignItems:'baseline', gap: 8, minWidth: 0, marginTop: 1}}>
            <span style={{
              fontSize: 25, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.5,
              lineHeight: 1.15, whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums',
            }}>
              {valore}{suffisso && <span style={{fontSize: 16, fontWeight: 600, color: PN.MUTED, marginLeft: 1}}>{suffisso}</span>}
            </span>
            <StatDelta value={delta}/>
          </div>
        </div>
      </div>

      <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 8, lineHeight: 1.3}}>{sub}</div>

      {/* L'andamento a tutta larghezza in fondo: di fianco al numero, in una
          card larga 229, non resterebbe spazio per nessuno dei due. `auto` in
          alto lo tiene sul fondo anche dove il sottotitolo va a capo. */}
      {trend && (
        <div style={{height: 34, marginTop:'auto', paddingTop: 10, display:'flex'}}>
          <StatSpark data={trend} color={t.forte} width={150} height={54}
            stretch padY={7} stroke={2}/>
        </div>
      )}
    </div>
  );
}

// Le colonne della tabella piatti: una sola dichiarazione perché intestazione
// e righe restino incolonnate.
const PIATTI_COLS = 'minmax(190px, 2.1fr) 1fr 0.9fr 1.25fr 0.8fr 1.05fr 1.05fr 0.9fr';

function VenditePiatti({ v }) {
  const [sortBy, setSortBy] = React.useState('ricavoTot');
  const [order, setOrder] = React.useState('desc');
  const [search, setSearch] = React.useState('');
  const sorted = [...v.piatti]
    .filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  const handleSort = (col) => {
    if (sortBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

  // Ricavo medio per piatto: ricavi del periodo diviso gli articoli venduti.
  // Ricavato invece che scritto nei dati, così non può contraddire i due
  // numeri da cui nasce — che stanno entrambi in questa stessa tab.
  const ricavoPerPiatto = STAT_ECONOMICI.ricavi.val / v.kpi.venduti.val;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        <VenditeKpi tono="blu" icona="commerce-bag" label="Articoli venduti"
          valore={v.kpi.venduti.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={v.kpi.venduti.delta} sub={v.kpi.venduti.sub} trend={v.kpi.venduti.trend}/>
        <VenditeKpi tono="rosa" glifo="€" label="Scontrino medio"
          valore={`€ ${v.kpi.scontrino.val.toFixed(2).replace('.', ',')}`}
          delta={v.kpi.scontrino.delta} sub={v.kpi.scontrino.sub} trend={v.kpi.scontrino.trend}/>
        <VenditeKpi tono="verde" glifo="€" label="Ricavo per articolo"
          valore={`€ ${ricavoPerPiatto.toFixed(2).replace('.', ',')}`}
          delta={v.kpi.ricavoPiatto.delta} sub={v.kpi.ricavoPiatto.sub} trend={v.kpi.ricavoPiatto.trend}/>
      </div>

      {/* Stesso grafico dell'andamento ricavi vs costi: stesso componente,
          quindi anche il filo del mouse col riquadro del mese, che qui prima
          non c'era. Tre canali invece di due serie. */}
      <StatCard title="Trend scontrino medio" sub="Visualizzato per canale negli ultimi 12 mesi">
        <StatAndamento
          serie={[
            { id:'sala',     label:'Sala',     colore: PN.PINK,  dati: v.scontrinoTrend.direta },
            { id:'asporto',  label:'Asporto',  colore: PN.GREEN, dati: v.scontrinoTrend.asporto },
            { id:'delivery', label:'Delivery', colore: PN.BLUE,  dati: v.scontrinoTrend.delivery },
          ]}
          etichette={['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']}
          fmt={(n) => `€ ${Math.round(n).toLocaleString('it-IT', {useGrouping: true})}`}/>
      </StatCard>

      <StatCard title="Performance piatti" sub="Ordina per qualsiasi colonna · margine, ricavo, n° venduti" action={
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          padding:'7px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, background: PN.WHITE,
        }}>
          <BuIcons.search size={13} color={PN.MUTED}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca piatto…" style={{border:'none', outline:'none', fontSize: 14.5, fontFamily:'inherit', width: 200}}/>
        </div>
      }>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns: PIATTI_COLS,
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <SortHead col="nome" cur={sortBy} order={order} onSort={handleSort}>Piatto</SortHead>
            <SortHead col="cat" cur={sortBy} order={order} onSort={handleSort}>Categoria</SortHead>
            <SortHead col="costo" cur={sortBy} order={order} onSort={handleSort}>Costo</SortHead>
            <SortHead col="margine" cur={sortBy} order={order} onSort={handleSort}>Margine per piatto</SortHead>
            <SortHead col="n" cur={sortBy} order={order} onSort={handleSort}>Venduti</SortHead>
            <SortHead col="costiTot" cur={sortBy} order={order} onSort={handleSort}>Costi tot.</SortHead>
            <SortHead col="ricavoTot" cur={sortBy} order={order} onSort={handleSort}>Ricavo</SortHead>
            <SortHead col="marginePct" cur={sortBy} order={order} onSort={handleSort}>Margine %</SortHead>
          </div>
          {sorted.map((p, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns: PIATTI_COLS,
              padding:'8px 16px', alignItems:'center',
              fontSize: 14.5, color: PN.TEXT,
              background: i % 2 === 1 ? '#FAFAFB' : PN.WHITE,
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              fontVariantNumeric:'tabular-nums',
            }}>
              <span style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
                {/* La tinta pastello resta sotto mentre la foto carica, così
                    la riga non sfarfalla da vuota a piena. */}
                <img src={p.foto} alt="" loading="lazy" style={{
                  width: 34, height: 34, borderRadius: 9, objectFit:'cover', flexShrink: 0,
                  background: PN.WHITE_HUSH, border:`1px solid ${PN.BORDER_SOFT}`,
                }}/>
                <span style={{fontWeight: 600, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.nome}</span>
              </span>
              <span>
                <span style={{
                  display:'inline-flex', alignItems:'center',
                  padding:'3px 9px', borderRadius: 999,
                  background: PN.WHITE_HUSH, color: PN.MUTED,
                  fontSize: 13, fontWeight: 600, whiteSpace:'nowrap',
                }}>{p.cat}</span>
              </span>
              <span style={{color: PN.MUTED}}>€ {p.costo.toFixed(2)}</span>
              <span style={{fontWeight: 600}}>€ {p.margine.toFixed(2)}</span>
              <span>{p.n}</span>
              <span style={{color: PN.MUTED}}>€ {p.costiTot.toFixed(0)}</span>
              <span style={{fontWeight: 600}}>€ {p.ricavoTot.toFixed(0)}</span>
              <span>
                <span style={{
                  display:'inline-flex', alignItems:'center',
                  padding:'3px 9px', borderRadius: 999,
                  background: p.marginePct >= 65 ? PN.GREEN_SOFT : (p.marginePct >= 55 ? PN.AMBER_SOFT : PN.RED_SOFT),
                  color: p.marginePct >= 65 ? PN.GREEN : (p.marginePct >= 55 ? PN.AMBER : PN.RED),
                  fontSize: 14, fontWeight: 700,
                }}>{p.marginePct}%</span>
              </span>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}

window.StatEconomici = StatEconomici;

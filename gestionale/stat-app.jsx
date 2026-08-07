// Statistiche — Clienti · sub-tab Conversione

// Le foto sono quelle della libreria piatti — le stesse di Economici → Vendite
// e del menù in Impostazioni — cercate per nome, non ricopiate: due elenchi
// della stessa cucina non devono poter mostrare due piatti diversi.
const convFoto = (nome) => (STAT_VENDITE.piatti.find(p => p.nome === nome) || {}).foto;

// Chi non è nella libreria — l'acqua, per dire — prende un segnaposto invece
// di un riquadro vuoto: bottiglia per ciò che si beve, piatto per il resto.
const convGlifo = (nome) => /acqua|bibit|birra|vino|caff|cola|succo/i.test(nome)
  ? 'drink-water-bottle' : 'food-meal';

function ConvFoto({ nome, lato = 38, raggio = 9 }) {
  const foto = convFoto(nome);
  return foto
    ? <img src={foto} alt="" width={lato} height={lato} loading="lazy" style={{
        width: lato, height: lato, borderRadius: raggio, objectFit:'cover',
        flexShrink: 0, background: PN.WHITE_HUSH,
      }}/>
    : <span style={{
        width: lato, height: lato, borderRadius: raggio, flexShrink: 0,
        background: PN.WHITE_HUSH, color: PN.MUTED_SOFT,
        display:'grid', placeItems:'center',
      }}><Icon name={convGlifo(nome)} size={Math.round(lato * 0.5)}/></span>;
}

// Il tasso ha tre fasce: sopra il 60 va bene, sotto il 40 no, in mezzo si
// guarda. Le stesse in tutta la tabella.
const convTono = (conv) => conv >= 60
  ? { bg: PN.GREEN_SOFT, fg:'#15803d' }
  : conv >= 40
    ? { bg: PN.AMBER_SOFT, fg:'#9a3412' }
    : { bg: PN.RED_SOFT, fg:'#991b1b' };

// ─── Il funnel ─────────────────────────────────────────────────
// Terzo tentativo, e il difetto era sempre lo stesso: un imbuto che scende in
// un riquadro largo e basso o si stira per tutta la card, o si stringe e lascia
// mezza card vuota. Allora scende in orizzontale, da sinistra a destra: quattro
// colonne uguali, la sezione che si assottiglia da 10.000 a 2.900, e il vuoto
// non c'è più perché la figura occupa la larghezza che ha.
// La perdita è dove la sezione si strozza — fra una colonna e l'altra — e il
// numero di chi si ferma sta lì sotto, in grigio.
// La percentuale è sempre sul primo passaggio: 42% vuol dire «42 su 100 di
// quelli entrati», non «42 di quelli del passo prima».
const FUN_H = 108;      // altezza del canale, in unità del viewBox
const FUN_STROZZ = 76;  // quanto è larga la strozzatura fra due colonne
const FUN_MIN = 16;     // sezione minima, perché l'ultimo passaggio si veda

function ConvFunnel({ passi, rimborsi }) {
  const totale = passi[0].val || 1;
  const n = passi.length;
  // Coordinate in un viewBox da 1000: l'SVG poi si stira in larghezza quanto
  // serve — dentro non ci sono testi né linee, solo pieni, quindi lo
  // stiramento non deforma niente di leggibile.
  const COL = 1000 / n;
  const sez = passi.map(s => Math.max(FUN_MIN, (s.val / totale) * FUN_H));
  const y = (h) => (FUN_H - h) / 2;

  return (
    <div>
      {/* I nomi in cima, una colonna per passaggio: stanno sopra la loro
          sezione perché le colonne qui e le fasce là sotto hanno la stessa
          larghezza e lo stesso centro. */}
      <div style={{display:'grid', gridTemplateColumns:`repeat(${n}, 1fr)`, gap: 12, marginBottom: 14}}>
        {passi.map((step, i) => (
          <div key={step.label} style={{textAlign:'center', minWidth: 0}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap: 7, marginBottom: 3}}>
              <span style={{
                width: 20, height: 20, borderRadius:'50%', flexShrink: 0,
                border:`1.5px solid ${PN.PINK}`, color: PN.PINK,
                display:'grid', placeItems:'center',
                fontSize: 11.5, fontWeight: 700,
              }}>{i + 1}</span>
              <span style={{
                fontSize: 14.5, fontWeight: 600, color: PN.TEXT,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{step.label}</span>
            </div>
            {/* Due righe fisse per la spiegazione, così i numeri sotto restano
                incolonnati anche quando una frase va a capo e le altre no. */}
            <div style={{
              fontSize: 12.5, color: PN.MUTED_SOFT, lineHeight: 1.3,
              height: 33, marginBottom: 6,
            }}>{step.sub}</div>
            <div style={{
              fontSize: 24, fontWeight: 700, color: PN.TEXT,
              letterSpacing:-0.5, lineHeight: 1.1, fontVariantNumeric:'tabular-nums',
            }}>{step.val.toLocaleString('it-IT', {useGrouping: true})}</div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap: 8, marginTop: 5}}>
              <StatDelta value={step.delta}/>
              {step.trend && <StatSpark data={step.trend} color={PN.PINK} width={48} height={18}/>}
            </div>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 1000 ${FUN_H}`} preserveAspectRatio="none"
        style={{display:'block', width:'100%', height: FUN_H}}>
        <defs>
          {/* Una sfumatura sola per tutto il canale, da sinistra a destra: le
              quattro sezioni non sono quattro pezzi dello stesso colore ma i
              tratti di un oggetto unico. */}
          <linearGradient id="fun-tinta" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={PN.WINE}/>
            <stop offset="100%" stopColor={PN.PINK}/>
          </linearGradient>
        </defs>
        {passi.map((step, i) => {
          const h = sez[i];
          const x0 = i * COL + (i === 0 ? 0 : FUN_STROZZ / 2);
          const x1 = (i + 1) * COL - (i === n - 1 ? 0 : FUN_STROZZ / 2);
          const succ = sez[i + 1];
          return (
            <React.Fragment key={i}>
              <rect x={x0} y={y(h)} width={x1 - x0} height={h} fill="url(#fun-tinta)"/>
              {succ != null && (
                // La strozzatura: entra alta quanto questa sezione ed esce alta
                // quanto la prossima. È lì che si perde la gente.
                // Sborda di mezza unità dentro le due sezioni che collega: a
                // filo esatto il motore lascia una cucitura chiara sul giunto.
                <polygon fill="url(#fun-tinta)" points={
                  `${x1 - 0.5},${y(h)} ${x1 + FUN_STROZZ + 0.5},${y(succ)} ${x1 + FUN_STROZZ + 0.5},${y(succ) + succ} ${x1 - 0.5},${y(h) + h}`
                }/>
              )}
            </React.Fragment>
          );
        })}
      </svg>

      {/* Sotto: la quota di ogni passaggio al centro della sua colonna, e chi
          si è perso sopra la strozzatura in cui si è perso. */}
      <div style={{position:'relative', height: 40, marginTop: 8}}>
        {passi.map((step, i) => (
          <span key={`q${i}`} style={{
            position:'absolute', top: 0, left: `${(i + 0.5) * (100 / n)}%`,
            transform:'translateX(-50%)', whiteSpace:'nowrap',
            fontSize: 13.5, fontWeight: 600, color: PN.MUTED, fontVariantNumeric:'tabular-nums',
          }}>{Math.round((step.val / totale) * 100)}% di chi entra</span>
        ))}
        {passi.slice(0, -1).map((step, i) => {
          const persi = step.val - passi[i + 1].val;
          const caloPct = (1 - passi[i + 1].val / step.val) * 100;
          return (
            <span key={`p${i}`} style={{
              position:'absolute', top: 21, left: `${(i + 1) * (100 / n)}%`,
              transform:'translateX(-50%)', whiteSpace:'nowrap',
              fontSize: 13, color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums',
            }}>
              <strong style={{fontWeight: 700, color: PN.MUTED}}>−{persi.toLocaleString('it-IT', {useGrouping: true})}</strong>
              {' '}si ferma qui, il {caloPct.toFixed(0)}%
            </span>
          );
        })}
      </div>

      {/* I rimborsi non sono un quinto passaggio — non è gente persa per
          strada, è denaro tornato indietro dopo un pagamento riuscito — quindi
          stanno sotto la riga, con la loro quota sull'ultimo passaggio. */}
      {rimborsi && (
        <div style={{
          marginTop: 16, paddingTop: 14, borderTop:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', alignItems:'flex-start', gap: 12,
        }}>
          <span style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: PN.WHITE_HUSH, color: PN.MUTED,
            display:'grid', placeItems:'center',
          }}><Icon name="arrow-down-right" size={15}/></span>
          {/* Una frase sola, col confronto dentro invece che in una pastiglia
              a destra: la pastiglia colora di rosso i cali, e un calo dei
              rimborsi è una buona notizia. */}
          <span style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.45, minWidth: 0}}>
            Dei {passi[n - 1].val.toLocaleString('it-IT', {useGrouping: true})} pagamenti riusciti,
            {' '}<strong style={{color: PN.TEXT, fontWeight: 700}}>{rimborsi.n}</strong> sono stati rimborsati —
            {' '}<strong style={{color: PN.TEXT, fontWeight: 700}}>€ {rimborsi.valore.toLocaleString('it-IT', {useGrouping: true})}</strong> restituiti,
            {' '}l'{(rimborsi.n / passi[n - 1].val * 100).toFixed(1).replace('.', ',')}% degli ordini,
            {' '}{rimborsi.delta <= 0 ? 'in calo' : 'in aumento'} dello {Math.abs(rimborsi.delta).toFixed(1).replace('.', ',')}% sul periodo prima.
          </span>
        </div>
      )}
    </div>
  );
}

// Piatto (con la miniatura) · le misure del percorso, nell'ordine in cui
// accadono — visto in elenco, scheda aperta, modificato, ordinato — e il tasso.
const CONV_COLONNE = '2.2fr 1.1fr 1.3fr 0.9fr 1.1fr 1.15fr';

function StatApp() {
  const d = STAT_APP;
  const [search, setSearch] = React.useState('');
  const [sortBy, setSortBy] = React.useState('conv');
  const [order, setOrder] = React.useState('desc');
  const sorted = [...d.conversionePiatti]
    .filter(p => p.piatto.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortBy] - b[sortBy]) * (order === 'asc' ? 1 : -1));
  const handleSort = (col) => {
    if (sortBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

  const primo = d.funnel[0].val;
  const ultimo = d.funnel[d.funnel.length - 1].val;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Niente riga di KPI sopra il funnel: i quattro numeri che mostrava —
          visite, pagamenti, tasso e abbandoni — erano il primo passaggio,
          l'ultimo, il loro rapporto e la loro differenza. Erano il funnel,
          scritto due volte. Quello che avevano di suo, il confronto col
          periodo prima e l'andamento, è finito dentro ogni passaggio. */}
      <StatCard title="Funnel di conversione"
        sub={`Dalla vetrina al pagamento: ${Math.round((ultimo / primo) * 100)}% di chi entra arriva in fondo`}>
        <ConvFunnel passi={d.funnel} rimborsi={d.rimborsi}/>
      </StatCard>

      <StatCard title="Conversione per piatto da canale digitale" sub="Dal primo sguardo all'ordine: viste in elenco, schede aperte, modifiche e ordini" action={
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          padding:'7px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, background: PN.WHITE,
        }}>
          <BuIcons.search size={13} color={PN.MUTED}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca piatto…" style={{border:'none', outline:'none', fontSize: 14.5, fontFamily:'inherit', width: 200}}/>
        </div>
      }>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          {/* Senza la barra il tasso è solo la pastiglia, quindi la sua colonna
              si stringe; quella del piatto si allarga per la miniatura. */}
          <div style={{
            display:'grid', gridTemplateColumns: CONV_COLONNE,
            padding:'12px 16px', background: PN.PINK_SOFT, columnGap: 10,
            fontSize: 13, fontWeight: 700, color: PN.WINE,
            textTransform:'uppercase', letterSpacing: 0.4,
          }}>
            <SortHead col="piatto" cur={sortBy} order={order} onSort={handleSort}>Piatto</SortHead>
            <SortHead col="view" cur={sortBy} order={order} onSort={handleSort}>Visualizzazioni</SortHead>
            <SortHead col="apri" cur={sortBy} order={order} onSort={handleSort}>Apertura dettaglio</SortHead>
            <SortHead col="mod" cur={sortBy} order={order} onSort={handleSort}>Modifiche</SortHead>
            {/* «Da app» perché è quello che questa tabella conta: il piatto lo
                si ordina anche al tavolo col cameriere e alla cassa, e quei
                passaggi qui dentro non ci sono. */}
            <SortHead col="ord" cur={sortBy} order={order} onSort={handleSort}>Ordini da App</SortHead>
            <SortHead col="conv" cur={sortBy} order={order} onSort={handleSort}>Tasso conversione</SortHead>
          </div>
          {sorted.map((p, i) => {
            const tono = convTono(p.conv);
            const sfondo = i % 2 === 1 ? '#FAFAFB' : PN.WHITE;
            return (
              <div key={i}
                onMouseEnter={e => { e.currentTarget.style.background = PN.PINK_BG_SOFT; e.currentTarget.style.transform = 'scale(1.006)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = sfondo; e.currentTarget.style.transform = ''; }}
                style={{
                  display:'grid', gridTemplateColumns: CONV_COLONNE,
                  padding:'10px 16px', alignItems:'center', columnGap: 10,
                  fontSize: 14.5, color: PN.TEXT, background: sfondo,
                  borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                  fontVariantNumeric:'tabular-nums',
                  transition:'background 140ms ease, transform 140ms ease',
                }}>
                <span style={{display:'flex', alignItems:'center', gap: 11, minWidth: 0}}>
                  <ConvFoto nome={p.piatto}/>
                  <span style={{fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.piatto}</span>
                </span>
                <span>{p.view.toLocaleString('it-IT', {useGrouping: true})}</span>
                <span>{p.apri.toLocaleString('it-IT', {useGrouping: true})}</span>
                {/* Lo zero resta scritto, ma in chiaro: «mai modificato» è una
                    risposta, non un buco. */}
                <span title={`${p.mod} ordini con ingredienti aggiunti o tolti`}
                  style={{color: p.mod ? PN.TEXT : PN.MUTED_LIGHT}}>
                  {p.mod.toLocaleString('it-IT', {useGrouping: true})}
                </span>
                <span>{p.ord.toLocaleString('it-IT', {useGrouping: true})}</span>
                <span>
                  <span style={{
                    display:'inline-block', padding:'3px 9px', borderRadius: 999,
                    background: tono.bg, color: tono.fg,
                    fontSize: 14, fontWeight: 700, minWidth: 56, textAlign:'center',
                  }}>{p.conv.toFixed(1).replace('.', ',')}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </StatCard>
    </div>
  );
}

window.StatApp = StatApp;

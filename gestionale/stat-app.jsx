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
// Erano quattro barre piene di gradiente, una sotto l'altra, con «↓25%
// abbandoni» in rosso su ognuna: un muro rosso dove tutto sembrava un allarme,
// e quattro riquadri staccati dove invece c'è un flusso solo che si stringe.
// Qui fra un passaggio e l'altro c'è il collegamento: una figura che parte
// larga quanto la barra sopra e arriva larga quanto quella sotto. La perdita
// non è più una scritta, è lo spicchio che si vede mancare — e il numero di
// chi si è perso lo dice, in grigio, a fianco.
// La percentuale è sempre sul primo passaggio: 42% vuol dire «42 su 100 di
// quelli entrati», non «42 di quelli del passo prima». Il confronto col
// passaggio precedente è il calo scritto nel collegamento.
function ConvFunnel({ passi, rimborsi }) {
  const totale = passi[0].val || 1;
  const quota = (v) => (v / totale) * 100;

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      {passi.map((step, i) => {
        const prossimo = passi[i + 1];
        const persi = prossimo ? step.val - prossimo.val : 0;
        const caloPct = prossimo ? (1 - prossimo.val / step.val) * 100 : 0;
        return (
          <React.Fragment key={step.label}>
            <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 16, marginBottom: 7}}>
              <div style={{display:'flex', alignItems:'center', gap: 11, minWidth: 0}}>
                {/* Il numero del passaggio: cerchio vuoto col filo sottile, non
                    una pastiglia piena — sono quattro, e piene facevano
                    quattro punti neri in colonna. */}
                <span style={{
                  width: 24, height: 24, borderRadius:'50%', flexShrink: 0,
                  border:`1.5px solid ${PN.PINK}`, color: PN.PINK,
                  display:'grid', placeItems:'center',
                  fontSize: 12.5, fontWeight: 700,
                }}>{i + 1}</span>
                <span style={{minWidth: 0}}>
                  <span style={{display:'block', fontSize: 15, fontWeight: 600, color: PN.TEXT, lineHeight: 1.25}}>{step.label}</span>
                  <span style={{display:'block', fontSize: 13, color: PN.MUTED_SOFT}}>{step.sub}</span>
                </span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 12, flexShrink: 0}}>
                <StatDelta value={step.delta}/>
                {step.trend && <StatSpark data={step.trend} color={PN.PINK} width={60} height={22}/>}
                <span style={{textAlign:'right'}}>
                  <span style={{
                    display:'block', fontSize: 20, fontWeight: 700, color: PN.TEXT,
                    letterSpacing:-0.4, lineHeight: 1.1, fontVariantNumeric:'tabular-nums',
                  }}>{step.val.toLocaleString('it-IT', {useGrouping: true})}</span>
                  <span style={{display:'block', fontSize: 13, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>
                    {Math.round(quota(step.val))}% degli entrati
                  </span>
                </span>
              </div>
            </div>

            <div style={{height: 12, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden'}}>
              <div style={{
                width: `${quota(step.val)}%`, height:'100%',
                background: PN.PINK, borderRadius: 999,
                transition:'width 500ms ease-out',
              }}/>
            </div>

            {prossimo && (
              // Il collegamento: parte largo quanto questa barra e arriva largo
              // quanto la prossima. La sbieca a destra è la gente che si perde.
              <div style={{position:'relative', height: 30, margin:'2px 0 4px'}}>
                <div style={{
                  position:'absolute', inset: 0,
                  background: `${PN.PINK}1F`,
                  clipPath: `polygon(0 0, ${quota(step.val)}% 0, ${quota(prossimo.val)}% 100%, 0 100%)`,
                }}/>
                <span style={{
                  position:'absolute', right: 0, top:'50%', transform:'translateY(-50%)',
                  fontSize: 13.5, color: PN.MUTED, whiteSpace:'nowrap',
                  fontVariantNumeric:'tabular-nums',
                }}>
                  <strong style={{fontWeight: 700, color: PN.TEXT}}>−{persi.toLocaleString('it-IT', {useGrouping: true})}</strong>
                  {' '}si ferma qui · {caloPct.toFixed(0)}%
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* I rimborsi non sono un quinto scalino — non è gente persa per strada,
          è denaro tornato indietro dopo un pagamento riuscito — quindi stanno
          sotto la riga, con la loro quota sull'ultimo passaggio. */}
      {rimborsi && (
        <div style={{
          marginTop: 16, paddingTop: 14, borderTop:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap',
        }}>
          <span style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: PN.WHITE_HUSH, color: PN.MUTED,
            display:'grid', placeItems:'center',
          }}><Icon name="arrow-down-right" size={15}/></span>
          <span style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.4}}>
            Dei {passi[passi.length - 1].val.toLocaleString('it-IT', {useGrouping: true})} pagamenti riusciti,
            {' '}<strong style={{color: PN.TEXT, fontWeight: 700}}>{rimborsi.n}</strong> sono stati rimborsati —
            {' '}<strong style={{color: PN.TEXT, fontWeight: 700}}>€ {rimborsi.valore.toLocaleString('it-IT', {useGrouping: true})}</strong> restituiti,
            {' '}l'{(rimborsi.n / passi[passi.length - 1].val * 100).toFixed(1).replace('.', ',')}% degli ordini.
          </span>
          {/* Scritto invece che in pastiglia: la pastiglia colora di rosso i
              cali, e un calo dei rimborsi è una buona notizia. */}
          <span style={{marginLeft:'auto', flexShrink: 0, fontSize: 13.5, color: PN.MUTED_SOFT, whiteSpace:'nowrap'}}>
            {rimborsi.delta <= 0 ? 'In calo' : 'In aumento'} dello {Math.abs(rimborsi.delta).toFixed(1).replace('.', ',')}% sul periodo prima
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

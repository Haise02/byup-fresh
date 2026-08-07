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

  // Funnel KPI riepilogo
  const totV = d.funnel[0].val;
  const last = d.funnel[d.funnel.length - 1].val;
  const dropTotal = totV - last;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI del funnel, nella card tinta delle altre sezioni. Sono quattro,
          quindi la variante compatta: etichette corte perché stiano accanto
          alla pillola, la forma per esteso nel sottotitolo che ha la riga
          intera. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        <StatKpiTinto compatto tono="rosso" icona="arrow-down-right" label="Abbandoni"
          valore={dropTotal.toLocaleString('it-IT', {useGrouping: true})}
          delta={-3.1} sub="Chi non arriva al pagamento" trend={d.trend.abbandoni}/>
        <StatKpiTinto compatto tono="giallo" icona="globe-web" label="Visite"
          valore={totV.toLocaleString('it-IT', {useGrouping: true})}
          delta={14.2} sub="Visualizzazioni della tua vetrina" trend={d.trend.visite}/>
        {/* Glifo e non icona: per un tasso il segno di percentuale è il
            concetto, e il set non ha una percentuale. */}
        <StatKpiTinto compatto tono="blu" glifo="%" label="Conversione"
          valore={((last / totV) * 100).toFixed(1).replace('.', ',')} suffisso="%"
          delta={2.4} sub="Dalla vetrina al pagamento" trend={d.trend.conversione}/>
        <StatKpiTinto compatto tono="verde" icona="commerce-bank-cards" label="Pagamenti"
          valore={last.toLocaleString('it-IT', {useGrouping: true})}
          delta={9.6} sub="Ordini conclusi con successo" trend={d.trend.pagamenti}/>
      </div>

      {/* Funnel viz */}
      <StatCard title="Funnel di conversione" sub="Quanti utenti completano ogni passaggio del percorso">
        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          {d.funnel.map((step, i) => {
            const prev = i > 0 ? d.funnel[i - 1].val : null;
            const dropPct = prev != null ? ((1 - step.val/prev) * 100) : 0;
            return (
              <div key={i}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6}}>
                  <div style={{display:'flex', alignItems:'center', gap: 10}}>
                    <span style={{
                      width: 24, height: 24, borderRadius:'50%',
                      background: PN.WINE, color:'#fff',
                      display:'grid', placeItems:'center',
                      fontSize: 13, fontWeight: 700,
                    }}>{i + 1}</span>
                    <span style={{fontSize: 15, fontWeight: 600, color: PN.TEXT}}>{step.label}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap: 12}}>
                    {prev != null && dropPct > 0 && (
                      <span style={{fontSize: 14, color: PN.RED, fontWeight: 600}}>↓ {dropPct.toFixed(0)}% abbandoni</span>
                    )}
                    <strong style={{fontSize: 16, color: PN.TEXT, fontVariantNumeric:'tabular-nums', minWidth: 80, textAlign:'right'}}>{step.val.toLocaleString('it-IT', {useGrouping: true})}</strong>
                    <span style={{fontSize: 14.5, color: PN.MUTED, fontWeight: 600, minWidth: 44, textAlign:'right'}}>{step.pct}%</span>
                  </div>
                </div>
                <div style={{height: 14, background:'#f3f4f6', borderRadius: 999, overflow:'hidden'}}>
                  <div style={{
                    width: `${step.pct}%`, height:'100%',
                    background: `linear-gradient(90deg, ${PN.WINE}, ${PN.PINK})`,
                    borderRadius: 999,
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </StatCard>

      <StatCard title="Conversione per piatto" sub="Dal primo sguardo all'ordine: viste in elenco, schede aperte, modifiche e ordini" action={
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

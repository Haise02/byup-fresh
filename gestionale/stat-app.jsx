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

// Il tasso ha tre fasce, e sono le stesse ovunque compaia: nella riga, nella
// pastiglia e nel dettaglio.
const convTono = (conv) => conv >= 60
  ? { bg: PN.GREEN_SOFT, fg:'#15803d' }
  : conv >= 40
    ? { bg: PN.AMBER_SOFT, fg:'#9a3412' }
    : { bg: PN.RED_SOFT, fg:'#991b1b' };

// ─── Dettaglio del piatto ──────────────────────────────────────
// Il pannello risponde a «e allora?»: la riga dice che un piatto converte poco,
// qui si vede quanto è guardato, quanto rende e quanto pesa sui ricavi — dati
// che stanno in Economici e che altrimenti si dovrebbe andare a cercare.
function ConvDettaglioPiatto({ piatto, onClose }) {
  React.useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const aperto = !!piatto;
  // I dati economici vivono nella scheda Vendite: qui si prendono per nome, e
  // se il piatto lì non c'è la sezione non si inventa niente, sparisce.
  const vend = aperto ? STAT_VENDITE.piatti.find(p => p.nome === piatto.piatto) : null;
  const tono = aperto ? convTono(piatto.conv) : null;

  const voce = (et, val, forte) => (
    <div key={et} style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 12, padding:'9px 0', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
      <span style={{fontSize: 14.5, color: PN.MUTED}}>{et}</span>
      <strong style={{fontSize: 15, fontWeight: 700, color: forte || PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{val}</strong>
    </div>
  );

  return (
    <>
      {/* Sopra tutto quello che galleggia in questa pagina: la sidebar sta a
          60 e l'assistente a 72, e sotto di loro il velo lasciava la sidebar
          accesa e il pallino dell'assistente sopra il pannello. */}
      <div onClick={onClose} style={{
        position:'absolute', inset: 0, background:'rgba(15,17,21,0.30)',
        opacity: aperto ? 1 : 0, pointerEvents: aperto ? 'auto' : 'none',
        transition:'opacity 0.2s', zIndex: 74,
      }}/>
      <div style={{
        position:'absolute', top: 0, right: 0, bottom: 0,
        width: 400, background: PN.WHITE,
        boxShadow:'-12px 0 32px rgba(15,17,21,0.10)',
        transform: aperto ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.25s cubic-bezier(.4,.0,.2,1)',
        zIndex: 75, display:'flex', flexDirection:'column',
        pointerEvents: aperto ? 'auto' : 'none',
      }}>
        {aperto && (
          <>
            <div style={{padding:'20px 22px 16px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
              <div style={{display:'flex', alignItems:'flex-start', gap: 13}}>
                <ConvFoto nome={piatto.piatto} lato={52} raggio={12}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.2}}>{piatto.piatto}</div>
                  <div style={{fontSize: 14, color: PN.MUTED}}>{vend ? vend.cat : 'Bevande'}</div>
                </div>
                <button onClick={onClose} aria-label="Chiudi" style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  border:'none', background: PN.WHITE_HUSH, color: PN.TEXT,
                  cursor:'pointer', display:'grid', placeItems:'center',
                }}><Icon name="xmark" size={14}/></button>
              </div>
            </div>

            <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding:'16px 22px 22px'}}>
              <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 4}}>
                Nel percorso d'acquisto
              </div>
              {voce('Visto in elenco', piatto.view.toLocaleString('it-IT', {useGrouping: true}))}
              {voce('Scheda aperta', piatto.apri.toLocaleString('it-IT', {useGrouping: true}))}
              {voce('Ordini da app', piatto.ord.toLocaleString('it-IT', {useGrouping: true}))}
              {/* Le modifiche si contano sugli ordini, non sulle viste: qui la
                  quota accanto al numero dice da sola se sono tante. */}
              {voce('Con modifiche', piatto.mod
                ? `${piatto.mod.toLocaleString('it-IT', {useGrouping: true})} · ${Math.round((piatto.mod / piatto.ord) * 100)}%`
                : 'nessuna')}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12, padding:'11px 0'}}>
                <span style={{fontSize: 14.5, color: PN.MUTED}}>Tasso di conversione</span>
                <span style={{
                  padding:'4px 11px', borderRadius: 999,
                  background: tono.bg, color: tono.fg,
                  fontSize: 15, fontWeight: 700, fontVariantNumeric:'tabular-nums',
                }}>{piatto.conv.toFixed(1).replace('.', ',')}%</span>
              </div>
              {/* La frase che la percentuale da sola non dice. Aprire la scheda
                  non è un passaggio obbligato — dall'elenco si aggiunge anche
                  senza — quindi ci sono due storie diverse e va detta quella
                  giusta: chi la scheda la apre e poi non ordina, o chi ordina
                  senza nemmeno aprirla. */}
              <div style={{
                padding:'11px 13px', borderRadius: 10, background: PN.WHITE_HUSH,
                fontSize: 14, color: PN.MUTED, lineHeight: 1.45,
              }}>
                {piatto.apri >= piatto.ord ? (
                  <>Su {piatto.apri.toLocaleString('it-IT', {useGrouping: true})} schede aperte,
                    {' '}<strong style={{color: PN.TEXT}}>{(piatto.apri - piatto.ord).toLocaleString('it-IT', {useGrouping: true})}</strong> non sono
                    diventate un ordine: chi si ferma qui, si ferma dopo aver letto.</>
                ) : (
                  <>Ordinato {piatto.ord.toLocaleString('it-IT', {useGrouping: true})} volte ma con appena
                    {' '}<strong style={{color: PN.TEXT}}>{piatto.apri.toLocaleString('it-IT', {useGrouping: true})}</strong> schede aperte:
                    lo si aggiunge dall'elenco, senza bisogno di leggerne la descrizione.</>
                )}
              </div>

              {/* Sopra un ordine su quattro toccato, la voce del menù non
                  descrive quello che la gente vuole: è un'indicazione da dare,
                  non un dato da lasciar leggere. */}
              {piatto.mod / piatto.ord >= 0.25 && (
                <div style={{
                  marginTop: 10, padding:'11px 13px', borderRadius: 10,
                  background: PN.AMBER_SOFT, color:'#7c4a03',
                  fontSize: 14, lineHeight: 1.45,
                }}>
                  Un ordine su {Math.round(piatto.ord / piatto.mod)} arriva con ingredienti aggiunti o tolti:
                  vale la pena vedere quali, e se conviene farne una variante a menù.
                </div>
              )}

              {vend ? (
                <>
                  <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, margin:'22px 0 4px'}}>
                    Quanto rende
                  </div>
                  {voce('Prezzo di vendita', `€ ${vend.ricavo.toFixed(2).replace('.', ',')}`)}
                  {voce('Costo ingredienti', `€ ${vend.costo.toFixed(2).replace('.', ',')}`)}
                  {voce('Margine per piatto', `€ ${vend.margine.toFixed(2).replace('.', ',')}`, PN.GREEN)}
                  {voce('Margine percentuale', `${vend.marginePct}%`)}
                  {voce('Venduti nel periodo', vend.n.toLocaleString('it-IT', {useGrouping: true}))}
                  {voce('Ricavo generato', `€ ${vend.ricavoTot.toLocaleString('it-IT', {useGrouping: true})}`)}
                </>
              ) : (
                <div style={{marginTop: 18, fontSize: 14, color: PN.MUTED_SOFT, lineHeight: 1.45}}>
                  Per questo articolo non ci sono costi a listino, quindi niente margine da mostrare.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
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
  const [dettaglio, setDettaglio] = React.useState(null);
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
                onClick={() => setDettaglio(p)}
                title={`Vedi il dettaglio di ${p.piatto}`}
                onMouseEnter={e => { e.currentTarget.style.background = PN.PINK_BG_SOFT; e.currentTarget.style.transform = 'scale(1.006)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = sfondo; e.currentTarget.style.transform = ''; }}
                style={{
                  display:'grid', gridTemplateColumns: CONV_COLONNE,
                  padding:'10px 16px', alignItems:'center', columnGap: 10,
                  fontSize: 14.5, color: PN.TEXT, background: sfondo,
                  borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                  fontVariantNumeric:'tabular-nums', cursor:'pointer',
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

      <ConvDettaglioPiatto piatto={dettaglio} onClose={() => setDettaglio(null)}/>
    </div>
  );
}

window.StatApp = StatApp;

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
// Quarto tentativo. I primi tre disegnavano l'imbuto come figura a sé — prima
// verticale, poi coricato da sinistra a destra — e il difetto era sempre lo
// stesso: la figura si prendeva metà card e alle scritte restavano i margini,
// coi nomi su una riga, i numeri su un'altra e gli andamenti ridotti a
// francobolli da 48×18 che non si leggevano e non si potevano ingrandire,
// perché sopra a ogni passaggio c'era solo un quarto di card.
//
// Qui la figura non c'è più: l'imbuto SONO le barre. Un passaggio per riga,
// ogni barra lunga quanto la sua quota su chi è entrato; impilate, il loro
// profilo è l'imbuto. E siccome ogni riga si prende la card intera, il nome
// sta in chiaro a sinistra, il numero grande a destra e l'andamento è una
// linea vera da 116×34 invece di un francobollo.
// Fra una riga e l'altra, agganciato al filo che unisce i passaggi, chi si
// perde: −2.500, e su quale scalino è caduto.
// La quota è sempre sul primo passaggio — «42% di chi entra» — mentre il calo
// fra due scalini è sul passaggio prima: sono due domande diverse e stanno in
// due posti diversi.
const FUN_RAIL = 26;   // colonna del pallino e del filo che unisce i passaggi
const FUN_BARRA = 12;  // spessore della barra

function ConvFunnel({ passi, rimborsi }) {
  const totale = passi[0].val || 1;
  const n = passi.length;
  const num = (v) => v.toLocaleString('it-IT', {useGrouping: true});

  // Le barre entrano da zero alla loro lunghezza, una dietro l'altra: è il
  // movimento che racconta il travaso, e chi guarda vede l'ordine dei
  // passaggi prima ancora di leggerne i nomi. Un frame dopo il montaggio,
  // perché a larghezza già scritta il browser non animerebbe niente.
  const [aperto, setAperto] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setAperto(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div>
      {passi.map((step, i) => {
        const quota = (step.val / totale) * 100;
        const ultimo = i === n - 1;
        const persi = ultimo ? 0 : step.val - passi[i + 1].val;
        const calo = ultimo ? 0 : (1 - passi[i + 1].val / step.val) * 100;
        return (
          <React.Fragment key={step.label}>
            <div style={{display:'grid', gridTemplateColumns:`${FUN_RAIL}px minmax(0, 1fr)`, columnGap: 14}}>
              {/* Il filo parte dal pallino e scende fino al passaggio dopo:
                  è una spina sola dalla vetrina al pagamento, non quattro
                  trattini staccati. L'ultimo pallino non ha coda. */}
              <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <span style={{
                  width: FUN_RAIL, height: FUN_RAIL, borderRadius:'50%', flexShrink: 0,
                  display:'grid', placeItems:'center',
                  fontSize: 12, fontWeight: 700, fontVariantNumeric:'tabular-nums',
                  // L'ultimo scalino è la meta, non un passaggio come gli altri:
                  // pieno di colore, gli altri nella sua velatura.
                  background: ultimo ? PN.BTN_BRAND : PN.PINK_SOFT,
                  color: ultimo ? PN.WHITE : PN.WINE,
                  boxShadow: ultimo ? `${PN.INSET_HIGHLIGHT_BRAND}, 0 2px 6px rgba(255,90,95,0.32)` : 'none',
                }}>{i + 1}</span>
                {!ultimo && <span style={{flex: 1, width: 2, background: PN.PINK_SOFT, borderRadius: 2}}/>}
              </div>

              <div style={{minWidth: 0}}>
                {/* Nome e spiegazione a sinistra, numero e quota a destra,
                    andamento all'estrema destra. Allineati in basso: così la
                    spiegazione e la quota cadono sulla stessa riga d'occhio,
                    appena sopra la barra. */}
                <div style={{
                  display:'grid', gridTemplateColumns:'minmax(0, 1fr) auto auto',
                  columnGap: 22, alignItems:'flex-end',
                }}>
                  <div style={{minWidth: 0}}>
                    <div style={{
                      fontSize: 15.5, fontWeight: 600, color: PN.TEXT, lineHeight: 1.25,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    }}>{step.label}</div>
                    <div style={{
                      fontSize: 13, color: PN.MUTED_SOFT, marginTop: 2, lineHeight: 1.3,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    }}>{step.sub}</div>
                  </div>

                  {/* Andamento in mezzo, non all'estrema destra: fra un nome
                      corto e un numero incolonnato resterebbe mezza riga di
                      vuoto, e questo è il posto giusto per riempirlo — la
                      linea sta accanto al numero di cui racconta la storia.
                      Pillola e linea in due colonne, la linea a misura fissa,
                      così restano incolonnate su tutte e quattro le righe
                      anche se le pillole sono larghe diverse. */}
                  <div style={{
                    display:'grid', gridTemplateColumns:'auto 112px',
                    columnGap: 12, alignItems:'center', justifyItems:'end',
                    paddingBottom: 3,
                  }}>
                    <StatDelta value={step.delta}/>
                    {step.trend
                      ? <StatSpark data={step.trend} color={PN.PINK} width={112} height={34} padY={4} stroke={1.8} dot/>
                      : <span/>}
                  </div>

                  {/* Il numero all'estrema destra, in cifre tabellari: i
                      quattro valori cadono sullo stesso filo del bordo della
                      card e si confrontano guardandoli in colonna. */}
                  <div style={{textAlign:'right', minWidth: 96}}>
                    <div style={{
                      fontSize: 26, fontWeight: 700, color: PN.TEXT,
                      letterSpacing:-0.6, lineHeight: 1.05, fontVariantNumeric:'tabular-nums',
                    }}>{num(step.val)}</div>
                    <div style={{
                      fontSize: 12.5, color: PN.MUTED, marginTop: 3,
                      fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap',
                    }}>{Math.round(quota)}% di chi entra</div>
                  </div>
                </div>

                <div style={{
                  marginTop: 11, height: FUN_BARRA, borderRadius: 999,
                  background: PN.WHITE_HUSH,
                  boxShadow:`inset 0 0 0 1px ${PN.BORDER_GHOST}`,
                }}>
                  <div style={{
                    width: aperto ? `${quota}%` : 0, height:'100%', borderRadius: 999,
                    background: PN.BTN_BRAND, boxShadow: PN.INSET_HIGHLIGHT_BRAND,
                    transition:'width 720ms cubic-bezier(0.22, 0.8, 0.28, 1)',
                    transitionDelay:`${i * 90}ms`,
                  }}/>
                </div>
              </div>
            </div>

            {/* La perdita sta fra i due scalini a cui appartiene, agganciata
                al filo: il numero in una pastiglia — è un fatto, si legge da
                solo — e accanto su quale scalino sono caduti. */}
            {!ultimo && (
              <div style={{display:'grid', gridTemplateColumns:`${FUN_RAIL}px minmax(0, 1fr)`, columnGap: 14}}>
                <div style={{display:'grid', placeItems:'center'}}>
                  <span style={{width: 2, height:'100%', background: PN.PINK_SOFT, borderRadius: 2}}/>
                </div>
                <div style={{
                  display:'flex', alignItems:'center', gap: 9, flexWrap:'wrap',
                  padding:'12px 0 14px',
                }}>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 5,
                    padding:'3px 10px 3px 7px', borderRadius: 999,
                    background: PN.WHITE_HUSH, color: PN.MUTED,
                    boxShadow:`inset 0 0 0 1px ${PN.BORDER_GHOST}`,
                    fontSize: 12.5, fontWeight: 700, whiteSpace:'nowrap',
                    fontVariantNumeric:'tabular-nums',
                  }}>
                    <Icon name="arrow-down-right" size={12}/>
                    {num(persi)}
                  </span>
                  <span style={{fontSize: 13.5, color: PN.MUTED_SOFT}}>
                    si fermano qui, il {calo.toFixed(0)}% di chi era arrivato
                  </span>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* I rimborsi non sono un quinto passaggio — non è gente persa per
          strada, è denaro tornato indietro dopo un pagamento riuscito — quindi
          stanno sotto la riga, con la loro quota sull'ultimo passaggio. */}
      {rimborsi && (
        <div style={{
          marginTop: 18, paddingTop: 15, borderTop:`1px solid ${PN.BORDER_SOFT}`,
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

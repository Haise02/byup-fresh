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
// una barra lunga in proporzione; impilate, il loro profilo è il percorso. E
// siccome ogni riga si prende la card intera, il nome sta in chiaro a
// sinistra, il numero grande a destra e l'andamento è una linea vera da
// 112×34 invece di un francobollo.
//
// Le barre sono in scala sul passaggio PIÙ ALTO, non sul primo: il menu si
// apre anche dal QR sul tavolo senza passare dalla vetrina, quindi può
// superarla, e col primo passaggio come metro quella barra uscirebbe dalla
// card. Sul massimo il disegno regge qualunque ordine di grandezza — e la
// barra piena resta comunque quella del passaggio più frequentato.
const FUN_RAIL = 26;   // colonna del pallino e del filo che unisce i passaggi
const FUN_BARRA = 12;  // spessore della barra

// ─── I tassi, in testa alla card ───────────────────────────────
// Erano una riga di sottotitolo grigia: la risposta alla domanda che porta un
// ristoratore qui dentro, scritta come una didascalia. Ora sono misure, con la
// materia delle KPI tinte del gestionale, nell'angolo in alto a destra della
// card — il posto dove si guarda per ultimo e ci si torna sempre.
// Non rimettono in piedi la riga di KPI che era stata tolta: quella ripeteva
// il primo e l'ultimo passaggio, questi sono gli unici numeri della card che
// nessuna barra dice, perché le barre contano teste e questi sono rapporti.
//
// Qui sta il tasso della RECENSIONE: quanti, fra quelli che hanno pagato,
// lasciano poi una recensione. È la reputazione — quello che porterà i
// prossimi ad affacciarsi — e nessuna barra lo dice, perché le barre contano
// teste e questo è un rapporto.
// C'era anche il tasso di conversione (pagamenti su chi apre la pagina):
// tolto su richiesta. Se un giorno lo si rivuole, è `misura(passi[0], meta)`.
// Il riquadro sparisce da solo se il percorso non arriva alla recensione.
//
// Il confronto è in PUNTI: il periodo prima si ricava dal valore di ogni
// passaggio e dalla sua variazione — 312/1,184 recensioni su 2.900/1,096
// pagamenti — e fra due percentuali la differenza si dice così. Recensioni su
// del 18% e tasso su di meno di un punto è esattamente la storia che questo
// numero deve poter raccontare: crescono perché cresce chi paga.
function ConvTasso({ passi }) {
  const meta = passi.find(s => s.meta) || passi[passi.length - 1];
  const ultimo = passi[passi.length - 1];
  if (ultimo === meta) return null;

  const prima = (s) => (s.delta == null ? null : s.val / (1 + s.delta / 100));
  const misura = (base, arrivo) => {
    const ora = (arrivo.val / base.val) * 100;
    const pb = prima(base), pa = prima(arrivo);
    return { ora, punti: (pb && pa) ? ora - (pa / pb) * 100 : null };
  };
  const t = misura(meta, ultimo);

  return (
    <div style={{
      flexShrink: 0, padding:'12px 18px', borderRadius: 16,
      background:'linear-gradient(115deg, #FFE6E5 0%, #FFF6F5 52%, #FFFFFF 100%)',
      border:'1px solid #FBD3D1',
    }}>
      <div style={{
        fontSize: 11.5, fontWeight: 700, color: PN.WINE,
        textTransform:'uppercase', letterSpacing: 0.6, whiteSpace:'nowrap',
      }}>Tasso di recensione</div>
      <div style={{display:'flex', alignItems:'center', gap: 9, marginTop: 2}}>
        <span style={{
          fontSize: 29, fontWeight: 800, color: PN.TEXT,
          letterSpacing:-1, lineHeight: 1.05, fontVariantNumeric:'tabular-nums',
        }}>{Math.round(t.ora)}%</span>
        {/* Qui il verde e il rosso dicono il vero — un tasso che scende è una
            cattiva notizia — al contrario dei rimborsi là sotto. */}
        <StatDelta value={t.punti == null ? null : Number(t.punti.toFixed(1))} unit=" pt"/>
      </div>
      <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 1, whiteSpace:'nowrap'}}>
        di chi ha pagato lascia una recensione
      </div>
    </div>
  );
}

function ConvFunnel({ passi, rimborsi }) {
  const n = passi.length;
  const massimo = Math.max(...passi.map(s => s.val)) || 1;
  // Il passaggio che conta per i rimborsi è il pagamento, dichiarato nel dato:
  // pescarlo per posizione — l'ultimo — vorrebbe dire contarli sulle recensioni.
  const pagati = passi.find(s => s.meta) || passi[n - 1];
  const num = (v) => v.toLocaleString('it-IT', {useGrouping: true});
  // La colonna dei numeri è larga quanto il più lungo di loro, uguale su tutte
  // le righe: così i valori cadono in colonna e — soprattutto — le linee
  // dell'andamento restano incolonnate anche accanto a un numero corto.
  const larghezzaNum = Math.max(...passi.map(s => num(s.val).length));

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
        const quota = (step.val / massimo) * 100;
        const ultimo = i === n - 1;
        return (
          <React.Fragment key={step.label}>
            <div style={{display:'grid', gridTemplateColumns:`${FUN_RAIL}px minmax(0, 1fr)`, columnGap: 14}}>
              {/* Il filo parte dal pallino e scende fino al passaggio dopo:
                  è una spina sola dalla vetrina alla recensione, non cinque
                  trattini staccati. L'ultimo pallino non ha coda. */}
              <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <span style={{
                  width: FUN_RAIL, height: FUN_RAIL, borderRadius:'50%', flexShrink: 0,
                  display:'grid', placeItems:'center',
                  fontSize: 12, fontWeight: 700, fontVariantNumeric:'tabular-nums',
                  // La meta è il pagamento, e non è l'ultimo della fila: dopo
                  // c'è la recensione, che è un regalo, non l'obiettivo. Il suo
                  // pallino è pieno di colore, gli altri nella sua velatura.
                  background: step.meta ? PN.BTN_BRAND : PN.PINK_SOFT,
                  color: step.meta ? PN.WHITE : PN.WINE,
                  boxShadow: step.meta ? `${PN.INSET_HIGHLIGHT_BRAND}, 0 2px 6px rgba(255,90,95,0.32)` : 'none',
                }}>{i + 1}</span>
                {!ultimo && <span style={{flex: 1, width: 2, background: PN.PINK_SOFT, borderRadius: 2}}/>}
              </div>

              <div style={{minWidth: 0, paddingBottom: ultimo ? 0 : 20}}>
                {/* Nome e spiegazione a sinistra, andamento in mezzo, numero
                    all'estrema destra, tutto centrato sulla stessa riga
                    d'occhio: sopra la barra c'è una riga sola. */}
                <div style={{
                  // Telefono: nome e numero sulla prima riga, andamento sotto —
                  // a tre colonne la colonna del nome collasserebbe a zero.
                  display:'grid', gridTemplateColumns: STG('minmax(0, 1fr) auto auto', 'minmax(0, 1fr) auto'),
                  columnGap: STG(22, 12), rowGap: 7, alignItems:'center',
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
                      così restano incolonnate su tutte le righe anche se le
                      pillole sono larghe diverse. */}
                  <div style={{
                    display:'grid', gridTemplateColumns:'auto 112px',
                    columnGap: 12, alignItems:'center', justifyItems:'end',
                    // Telefono: scende sotto, a tutta riga, allineato a sinistra
                    ...(statPhone() ? {gridColumn:'1 / -1', gridRow: 2, justifyContent:'start', justifyItems:'start'} : null),
                  }}>
                    <StatDelta value={step.delta}/>
                    {step.trend
                      ? <StatSpark data={step.trend} color={PN.PINK} width={112} height={34} padY={4} stroke={1.8} dot/>
                      : <span/>}
                  </div>

                  {/* Il numero all'estrema destra, in cifre tabellari e in una
                      colonna a misura fissa: i valori cadono sullo stesso filo
                      del bordo della card e si confrontano in colonna. */}
                  <div style={{
                    width:`${larghezzaNum}ch`, textAlign:'right',
                    fontSize: STG(26, 22), fontWeight: 700, color: PN.TEXT,
                    letterSpacing:-0.6, lineHeight: 1.05, fontVariantNumeric:'tabular-nums',
                    // Telefono: resta sulla prima riga, accanto al nome
                    ...(statPhone() ? {gridColumn: 2, gridRow: 1} : null),
                  }}>{num(step.val)}</div>
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
          </React.Fragment>
        );
      })}

      {/* I rimborsi non sono un passaggio del percorso — non è gente persa per
          strada, è denaro tornato indietro dopo un pagamento riuscito — quindi
          stanno sotto la riga, con la loro quota sul passaggio del pagamento.
          Sul pagamento e non sull'ultimo della fila: l'ultimo è la recensione,
          e i rimborsi non si contano su quella.
          Erano una frase in grigio in fondo alla card, e chi scorreva la
          saltava: sono soldi che tornano indietro, la sola cifra di questa
          pagina che esce dalla cassa. Ora sono un pannello a sé, coi tre
          numeri staccati e leggibili di sguardo. */}
      {rimborsi && (
        <div style={{
          marginTop: 22, padding:'14px 18px', borderRadius: 14,
          background: PN.WHITE_OFF, border:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', alignItems:'center', gap: 18, flexWrap:'wrap',
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: PN.WHITE, color: PN.MUTED,
            boxShadow:`inset 0 0 0 1px ${PN.BORDER_HAIR}`,
            display:'grid', placeItems:'center',
          }}><Icon name="hand-refund" size={17}/></span>

          <div style={{minWidth: 0}}>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Rimborsi</div>
            <div style={{fontSize: 12.5, color: PN.MUTED_SOFT, marginTop: 1, whiteSpace:'nowrap'}}>
              dopo un pagamento riuscito
            </div>
          </div>

          {/* Le misure, divise da un filo: quanti, e su quanti. */}
          {[
            { v: num(rimborsi.n), et:`su ${num(pagati.val)} pagamenti` },
            { v:`${(rimborsi.n / pagati.val * 100).toFixed(1).replace('.', ',')}%`, et:'degli ordini pagati' },
          ].map((m, i) => (
            <div key={i} style={{
              paddingLeft: 18, borderLeft:`1px solid ${PN.BORDER_SOFT}`, minWidth: 0,
            }}>
              <div style={{
                fontSize: 19, fontWeight: 700, color: PN.TEXT,
                letterSpacing:-0.3, lineHeight: 1.15, whiteSpace:'nowrap',
                fontVariantNumeric:'tabular-nums',
              }}>{m.v}</div>
              <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 1, whiteSpace:'nowrap'}}>{m.et}</div>
            </div>
          ))}

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

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Niente riga di KPI sopra il funnel: i quattro numeri che mostrava —
          visite, pagamenti, tasso e abbandoni — erano il primo passaggio,
          l'ultimo, il loro rapporto e la loro differenza. Erano il funnel,
          scritto due volte. Quello che avevano di suo, il confronto col
          periodo prima e l'andamento, è finito dentro ogni passaggio. */}
      <StatCard title="Funnel di conversione"
        sub="I passaggi del cliente, dalla vetrina alla recensione"
        action={<ConvTasso passi={d.funnel}/>}>
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
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`, ...STSCROLL()}}>
          {/* Senza la barra il tasso è solo la pastiglia, quindi la sua colonna
              si stringe; quella del piatto si allarga per la miniatura. */}
          <div style={{
            display:'grid', gridTemplateColumns: CONV_COLONNE, ...STMIN(640),
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
                  display:'grid', gridTemplateColumns: CONV_COLONNE, ...STMIN(640),
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

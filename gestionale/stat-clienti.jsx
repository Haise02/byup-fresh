// Statistiche — sub-tab Clienti

function StatClienti() {
  const d = STAT_CLIENTI;
  const totRev = d.starBreakdown.reduce((s, r) => s + r.count, 0);
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpi label="Clienti unici" value={d.unici.val.toLocaleString('it-IT', {useGrouping: true})} delta={d.unici.delta} sub="Visitatori unici nel periodo selezionato"/>
        <StatKpi label="Clienti abituali" value={d.abituali.val.toLocaleString('it-IT', {useGrouping: true})} delta={d.abituali.delta} sub="Visite multiple registrate negli ultimi 90 giorni"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16}}>
        <StatCard title="Valutazioni" sub="Riepilogo recensioni Google · byup">
          <div style={{display:'flex', gap: 24, alignItems:'flex-start'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap: 4, paddingRight: 24, borderRight:`1px solid ${PN.BORDER_SOFT}`}}>
              <div style={{fontSize: 40, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.8, lineHeight: 1}}>{d.rating}</div>
              <div style={{display:'flex', gap: 2, color: PN.AMBER, fontSize: 18}}>{'★'.repeat(5)}</div>
              <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>Sulla base di {d.recensioni} recensioni</div>
            </div>
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 6}}>
              {[5,4,3,2,1].map(stars => {
                const row = d.starBreakdown.find(r => r.stars === stars);
                const pct = (row.count / totRev) * 100;
                return (
                  <div key={stars} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 14.5}}>
                    <span style={{width: 36, color: PN.MUTED, fontWeight: 600}}>{stars} ★</span>
                    <div style={{flex: 1}}><StatBar pct={pct} color={stars >= 4 ? PN.AMBER : stars === 3 ? '#F59E0B' : PN.RED} height={10}/></div>
                    <span style={{width: 60, textAlign:'right', color: PN.TEXT, fontVariantNumeric:'tabular-nums', fontWeight: 600}}>{row.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </StatCard>

        <StatCard title="Trend valutazione" sub="Andamento ultimi 12 mesi">
          <svg viewBox="0 0 280 140" style={{width:'100%', height: 140}}>
            {[3.5, 4.0, 4.5, 5.0].map((v, i) => {
              const y = 130 - ((v - 3.5) / 1.5) * 110;
              return <g key={i}><line x1={20} y1={y} x2={280} y2={y} stroke={PN.BORDER_SOFT}/><text x={4} y={y+3} fontSize="9" fill={PN.MUTED}>{v}</text></g>;
            })}
            <path d={d.ratingTrend.map((v, i) => {
              const x = 20 + (i / (d.ratingTrend.length - 1)) * 250;
              const y = 130 - ((v - 3.5) / 1.5) * 110;
              return `${i===0?'M':'L'}${x},${y}`;
            }).join(' ')} fill="none" stroke={PN.PINK} strokeWidth={2.4}/>
            {d.ratingTrend.map((v, i) => {
              const x = 20 + (i / (d.ratingTrend.length - 1)) * 250;
              const y = 130 - ((v - 3.5) / 1.5) * 110;
              return <circle key={i} cx={x} cy={y} r={3} fill={PN.PINK}/>;
            })}
            {months.map((m, i) => {
              const x = 20 + (i / (months.length - 1)) * 250;
              return <text key={i} x={x} y={140} fontSize="9" fill={PN.MUTED} textAnchor="middle">{m}</text>;
            })}
          </svg>
        </StatCard>
      </div>

      <StatCard title="Ciclo di vita del cliente" sub="Distribuzione clienti per frequenza di ritorno">
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr 1fr',
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span>Stato cliente</span>
            <span style={{textAlign:'right'}}>N. clienti</span>
            <span>% sul totale</span>
            <span style={{textAlign:'right'}}>vs periodo prec.</span>
          </div>
          {d.ciclo.map((r, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr 1fr',
              padding:'10px 16px', alignItems:'center',
              fontSize: 15, color: PN.TEXT,
              background: i % 2 === 1 ? '#FAFAFB' : PN.WHITE,
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <span style={{fontWeight: 600}}>{r.stato}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700}}>{r.n}</span>
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <div style={{flex: 1}}><StatBar pct={r.pct} height={8}/></div>
                <span style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums', minWidth: 32, textAlign:'right'}}>{r.pct}%</span>
              </div>
              <span style={{textAlign:'right'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 4,
                  padding:'3px 9px', borderRadius: 999,
                  background: PN.GREEN_SOFT, color: PN.GREEN,
                  fontSize: 14, fontWeight: 700,
                }}>↑ {r.delta}%</span>
              </span>
            </div>
          ))}
        </div>
      </StatCard>

      <StatFuori/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUORI DA QUI · cosa ordinano i tuoi clienti negli altri locali byup
//
// Il dato che un gestionale da solo non può avere, e che la rete sì: la stessa
// persona ordina col suo account anche altrove. La domanda a cui risponde è
// una — cosa cercano i miei clienti che da me non trovano — quindi la riga più
// importante non è quella col numero più alto, è quella marcata "non ce l'hai".
function StatFuori() {
  const d = window.STAT_FUORI;
  if (!d) return null;
  const [soloMancanti, setSoloMancanti] = React.useState(false);

  const righe = soloMancanti ? d.prodotti.filter(p => !p.tuo) : d.prodotti;
  const max = d.prodotti.reduce((m, p) => Math.max(m, p.clienti), 0) || 1;
  const mancanti = d.prodotti.filter(p => !p.tuo);
  const primoMancante = mancanti[0];

  return (
    <StatCard
      title="I tuoi clienti fuori da qui"
      sub={`Cosa ordinano più spesso negli altri locali byup entro ${d.raggioKm} km`}
      action={
        <div style={{display:'flex', gap: 6, background: PN.WHITE_FROST, padding: 3, borderRadius: 9}}>
          {[[false, 'Tutti'], [true, 'Non nel tuo menù']].map(([val, label]) => {
            const on = soloMancanti === val;
            return (
              <button key={label} onClick={() => setSoloMancanti(val)} style={{
                padding:'6px 12px', borderRadius: 7, border:'none',
                background: on ? PN.WHITE : 'transparent',
                color: on ? PN.TEXT : PN.MUTED,
                fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                boxShadow: on ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
              }}>{label}</button>
            );
          })}
        </div>
      }
    >
      {/* La lettura prima della tabella: senza, sono dieci righe di piatti che
          non si capisce cosa c'entrino col proprio locale. */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
        padding:'12px 14px', borderRadius: 12, marginBottom: 14,
        background: PN.PINK_BG_SOFT, border: `1px solid ${PN.PINK_SOFT}`,
      }}>
        <span style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: PN.WHITE, color: PN.PINK,
          display:'grid', placeItems:'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
        </span>
        <span style={{flex: 1, minWidth: 240, fontSize: 15, color: PN.TEXT, lineHeight: 1.5}}>
          <b>{d.clientiTracciati} dei tuoi clienti</b> ({d.quotaSulTotale}% del totale) ordinano anche in altri
          {' '}{d.localiZona} locali byup qui intorno.
          {primoMancante && <> Il piatto che cercano di più e da te non trovano è <b>{primoMancante.nome}</b>.</>}
        </span>
      </div>

      <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
        <div style={{
          display:'grid', gridTemplateColumns:'26px minmax(0,2.4fr) 92px minmax(0,1.5fr) 104px',
          columnGap: 14, padding:'10px 16px', background:'#FAFAFB',
          fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
          textTransform:'uppercase', letterSpacing: 0.5,
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
        }}>
          <span/>
          <span>Prodotto</span>
          <span style={{textAlign:'right'}}>Tuoi clienti</span>
          <span>Quota</span>
          <span style={{textAlign:'right'}}>Nel tuo menù</span>
        </div>

        {righe.map((p, i) => (
          <div key={p.nome} style={{
            display:'grid', gridTemplateColumns:'26px minmax(0,2.4fr) 92px minmax(0,1.5fr) 104px',
            columnGap: 14, padding:'11px 16px', alignItems:'center',
            fontSize: 15, color: PN.TEXT,
            background: i % 2 === 1 ? '#FAFAFB' : PN.WHITE,
            borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span style={{fontSize: 14, fontWeight: 700, color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>
              {d.prodotti.indexOf(p) + 1}
            </span>
            <span style={{minWidth: 0}}>
              <span style={{display:'block', fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.nome}</span>
              <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>
                {p.cat} · {p.ordini} ordini · prezzo medio €{p.prezzo.toFixed(2).replace('.', ',')}
              </span>
            </span>
            <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700}}>{p.clienti}</span>
            <div style={{display:'flex', alignItems:'center', gap: 10}}>
              <div style={{flex: 1}}>
                <StatBar pct={(p.clienti / max) * 100} height={8} color={p.tuo ? PN.MUTED_LIGHT : PN.PINK}/>
              </div>
            </div>
            <span style={{textAlign:'right'}}>
              {p.tuo ? (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 5,
                  padding:'3px 10px', borderRadius: 999,
                  background: PN.GREEN_SOFT, color: PN.GREEN,
                  fontSize: 13.5, fontWeight: 700,
                }}>✓ Sì</span>
              ) : (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 5,
                  padding:'3px 10px', borderRadius: 999,
                  background: PN.PINK_SOFT, color: PN.PINK_DARK,
                  fontSize: 13.5, fontWeight: 700,
                }}>Manca</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Come è fatto il dato: chi lo legge deve sapere che non sta guardando
          le persone, e chi ci finisce dentro deve sapere di non essere
          riconoscibile. */}
      <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 12, lineHeight: 1.5}}>
        Dati aggregati e anonimi della rete byup: si contano le persone, non i loro nomi, e un prodotto
        compare solo sopra i {d.sogliaMinima} clienti. Nessun altro locale vede i tuoi.
      </div>
    </StatCard>
  );
}

window.StatClienti = StatClienti;
window.StatFuori = StatFuori;

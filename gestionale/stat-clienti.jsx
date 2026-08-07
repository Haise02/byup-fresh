// Statistiche — Clienti · sub-tab Fidelizzazione

function StatClienti() {
  const d = STAT_CLIENTI;
  const totRev = d.starBreakdown.reduce((s, r) => s + r.count, 0);
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI nella card tinta delle altre sezioni. Qui sono due, quindi c'è la
          larghezza per la variante piena — come in Ordini — e le etichette
          stanno per esteso. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpiTinto tono="blu" icona="people-customer" label="Clienti unici"
          valore={d.unici.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.unici.delta} sub="Persone diverse nel periodo" trend={d.unici.trend}/>
        <StatKpiTinto tono="viola" icona="time-history" label="Clienti abituali"
          valore={d.abituali.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.abituali.delta} sub="Tornati almeno due volte negli ultimi 90 giorni" trend={d.abituali.trend}/>
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
                    <div style={{flex: 1}}><StatBar pct={pct} color={PN.AMBER} height={8}/></div>
                    <span style={{width: 60, textAlign:'right', color: PN.TEXT, fontVariantNumeric:'tabular-nums', fontWeight: 600}}>{row.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </StatCard>

        <StatCard title="Trend valutazione" sub="Andamento ultimi 12 mesi">
          {(() => {
            // Serie unica: linea 2.4 con wash sotto, punto solo alla fine
            // col valore corrente; assi hairline, etichette 11px.
            const tW = 460, tH = 190, tP = { l: 30, r: 44, t: 14, b: 24 };
            const tx = (i) => tP.l + (i / (d.ratingTrend.length - 1)) * (tW - tP.l - tP.r);
            const ty = (v) => tH - tP.b - ((v - 3.5) / 1.5) * (tH - tP.t - tP.b);
            const line = d.ratingTrend.map((v, i) => `${i===0?'M':'L'}${tx(i)},${ty(v)}`).join(' ');
            const area = `${line} L ${tx(d.ratingTrend.length - 1)},${tH - tP.b} L ${tP.l},${tH - tP.b} Z`;
            const last = d.ratingTrend[d.ratingTrend.length - 1];
            return (
              <svg viewBox={`0 0 ${tW} ${tH}`} style={{width:'100%', display:'block'}}>
                {[3.5, 4.0, 4.5, 5.0].map((v, i) => (
                  <g key={i}>
                    <line x1={tP.l} y1={ty(v)} x2={tW - tP.r + 16} y2={ty(v)} stroke={PN.BORDER_SOFT} strokeWidth={1}/>
                    <text x={tP.l - 8} y={ty(v) + 4} fontSize="11" fill={PN.MUTED} textAnchor="end">{v.toFixed(1)}</text>
                  </g>
                ))}
                <path d={area} fill={PN.PINK} opacity={0.08}/>
                <path d={line} fill="none" stroke={PN.WHITE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/>
                <path d={line} fill="none" stroke={PN.PINK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx={tx(d.ratingTrend.length - 1)} cy={ty(last)} r={4.5} fill={PN.PINK} stroke={PN.WHITE} strokeWidth={2}/>
                <text x={tx(d.ratingTrend.length - 1) + 11} y={ty(last) + 4} fontSize="12.5" fontWeight="700" fill={PN.TEXT}>{last.toLocaleString('it-IT')}</text>
                {months.map((m, i) => i % 2 === 0 && (
                  <text key={i} x={tx(i)} y={tH - 6} fontSize="11" fill={PN.MUTED} textAnchor="middle">{m}</text>
                ))}
              </svg>
            );
          })()}
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
// persona ordina col suo account anche altrove. Una classifica e basta —
// leggerla e capire cosa farne è mestiere di chi ha il locale, non nostro.
function StatFuori() {
  const d = window.STAT_FUORI;
  if (!d) return null;

  // La classifica è sugli ordini, quindi l'ordine delle righe pure: una lista
  // ordinata su un numero che non si vede si legge come un errore.
  const righe = [...d.prodotti].sort((a, b) => b.ordini - a.ordini);

  return (
    <StatCard
      title="I tuoi clienti fuori da qui"
      sub={`Cosa ordinano più spesso negli altri locali byup entro ${d.raggioKm} km`}
    >
      {/* La lettura prima della classifica: senza, sono dieci righe di piatti
          che non si capisce cosa c'entrino col proprio locale. */}
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
        </span>
      </div>

      {/* Dieci righe di due dati soli, su una tabella larga mille pixel, sono
          un elenco perso nel bianco: due colonne da cinque riempiono la
          larghezza e accorciano la strada fra il nome e il suo numero. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', columnGap: 36}}>
        {[0, 1].map(col => (
          <div key={col}>
            <div style={{
              display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 10,
              padding:'0 4px 8px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
              fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
              textTransform:'uppercase', letterSpacing: 0.5,
            }}>
              <span>Prodotto</span>
              <span>Ordini</span>
            </div>

            {righe.slice(col * 5, col * 5 + 5).map((p, i) => {
              const pos = col * 5 + i + 1;
              const podio = pos <= 3;
              return (
                <div key={p.nome} style={{
                  display:'flex', alignItems:'center', gap: 12,
                  padding:'12px 4px',
                  borderBottom: i === 4 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                }}>
                  {/* La posizione è una pastiglia, non una colonna: i primi tre
                      si accendono, gli altri restano quieti. */}
                  <span style={{
                    width: 24, height: 24, borderRadius:'50%', flexShrink: 0,
                    display:'grid', placeItems:'center',
                    background: podio ? PN.PINK_SOFT : PN.WHITE_FROST,
                    color: podio ? PN.PINK_DARK : PN.MUTED,
                    fontSize: 12.5, fontWeight: 800, fontVariantNumeric:'tabular-nums',
                  }}>{pos}</span>

                  <span style={{flex: 1, minWidth: 0}}>
                    <span style={{
                      display:'block', fontSize: 15.5, fontWeight: 600, color: PN.TEXT,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight: 1.3,
                    }}>{p.nome}</span>
                    <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{p.cat}</span>
                  </span>

                  <span style={{
                    fontSize: 19, fontWeight: 700, color: PN.TEXT,
                    fontVariantNumeric:'tabular-nums', letterSpacing:-0.3,
                  }}>{p.ordini}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </StatCard>
  );
}

window.StatClienti = StatClienti;
window.StatFuori = StatFuori;

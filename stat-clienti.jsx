// Statistiche — sub-tab Clienti

function StatClienti() {
  const d = STAT_CLIENTI;
  const totRev = d.starBreakdown.reduce((s, r) => s + r.count, 0);
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpi label="Clienti unici" value={d.unici.val.toLocaleString('it-IT')} delta={d.unici.delta} sub="Visitatori unici nel periodo selezionato"/>
        <StatKpi label="Clienti abituali" value={d.abituali.val.toLocaleString('it-IT')} delta={d.abituali.delta} sub="Visite multiple registrate negli ultimi 90 giorni"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16}}>
        <StatCard title="Valutazioni" sub="Riepilogo recensioni Google · TripAdvisor · byup">
          <div style={{display:'flex', gap: 24, alignItems:'flex-start'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap: 4, paddingRight: 24, borderRight:`1px solid ${PN.BORDER_SOFT}`}}>
              <div style={{fontSize: 56, fontWeight: 700, color: PN.TEXT, letterSpacing:-2, lineHeight: 1}}>{d.rating}</div>
              <div style={{display:'flex', gap: 2, color: PN.AMBER, fontSize: 16}}>{'★'.repeat(5)}</div>
              <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>Sulla base di {d.recensioni} recensioni</div>
            </div>
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 6}}>
              {[5,4,3,2,1].map(stars => {
                const row = d.starBreakdown.find(r => r.stars === stars);
                const pct = (row.count / totRev) * 100;
                return (
                  <div key={stars} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 12}}>
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
            fontSize: 10.5, fontWeight: 700, color: PN.MUTED,
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
              fontSize: 13, color: PN.TEXT,
              background: i % 2 === 1 ? '#FAFAFB' : PN.WHITE,
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <span style={{fontWeight: 600}}>{r.stato}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700}}>{r.n}</span>
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <div style={{flex: 1}}><StatBar pct={r.pct} height={8}/></div>
                <span style={{fontSize: 12, color: PN.MUTED, fontVariantNumeric:'tabular-nums', minWidth: 32, textAlign:'right'}}>{r.pct}%</span>
              </div>
              <span style={{textAlign:'right'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 4,
                  padding:'3px 9px', borderRadius: 999,
                  background: PN.GREEN_SOFT, color: PN.GREEN,
                  fontSize: 11, fontWeight: 700,
                }}>↑ {r.delta}%</span>
              </span>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}

window.StatClienti = StatClienti;

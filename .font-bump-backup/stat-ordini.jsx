// Statistiche — sub-tab Ordini

function StatOrdini() {
  const d = STAT_ORDINI;
  const W = 740, H = 240, P = { l: 50, r: 16, t: 16, b: 28 };
  const all = [...d.scontrinoTrend.direta, ...d.scontrinoTrend.asporto, ...d.scontrinoTrend.delivery];
  const maxV = Math.ceil(Math.max(...all) / 10000) * 10000;
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const xStep = (W - P.l - P.r) / (months.length - 1);
  const yScale = (v) => H - P.b - (v / maxV) * (H - P.t - P.b);
  const xAt = (i) => P.l + i * xStep;
  const path = (arr) => arr.map((v, i) => `${i===0?'M':'L'}${xAt(i)},${yScale(v)}`).join(' ');

  // Heatmap max
  const allHeat = d.heatmap.flatMap(r => r.val);
  const maxHeat = Math.max(...allHeat);
  const heatBg = (v) => {
    const t = v / maxHeat;
    if (t < 0.18) return '#FFF1EF';
    if (t < 0.35) return '#FFC2C0';
    if (t < 0.55) return '#FF8E92';
    if (t < 0.75) return '#ff5a5f';
    return '#B53338';
  };
  const heatColor = (v) => v / maxHeat > 0.45 ? '#fff' : PN.TEXT;
  const days = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  const [channel, setChannel] = React.useState('Sala');

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpi label="Scontrino medio" value={`€ ${d.kpi.scontrino.val.toFixed(2)}`} delta={d.kpi.scontrino.delta} sub="Valore medio per ordine nel periodo selezionato"/>
        <StatKpi label="Ordini completati" value={d.kpi.completati.val.toLocaleString('it-IT')} delta={d.kpi.completati.delta} sub="Totale ordini completati nel periodo selezionato"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        <ChannelCard title="In sala" subtitle="Coperti seduti" data={d.sala} iconKey="table" color={PN.WINE}/>
        <ChannelCard title="Da asporto / delivery" subtitle="Ordini per ritiro o consegna" data={d.asporto} iconKey="storefront" color={PN.PINK}/>
      </div>

      {/* Trend scontrino */}
      <StatCard title="Trend scontrino medio" sub="Visualizzato per canale negli ultimi 12 mesi" action={
        <div style={{display:'inline-flex', alignItems:'center', gap: 14, fontSize: 11, color: PN.MUTED}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> sala</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.GREEN}}/> asporto</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.BLUE}}/> delivery</span>
        </div>
      }>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height: 240}}>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = P.t + (H - P.t - P.b) * t;
            const v = Math.round(maxV * (1 - t));
            return (
              <g key={i}>
                <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke={PN.BORDER_SOFT} strokeWidth={1}/>
                <text x={P.l - 8} y={y + 4} fontSize="10" fill={PN.MUTED} textAnchor="end">€{v >= 1000 ? (v/1000)+'k' : v}</text>
              </g>
            );
          })}
          {/* Lines */}
          <path d={path(d.scontrinoTrend.delivery)} fill="none" stroke={PN.BLUE} strokeWidth={2}/>
          <path d={path(d.scontrinoTrend.asporto)} fill="none" stroke={PN.GREEN} strokeWidth={2}/>
          <path d={path(d.scontrinoTrend.direta)} fill="none" stroke={PN.PINK} strokeWidth={2.4}/>
          {/* Points */}
          {d.scontrinoTrend.direta.map((v, i) => <circle key={'a'+i} cx={xAt(i)} cy={yScale(v)} r={3.5} fill={PN.PINK}/>)}
          {d.scontrinoTrend.asporto.map((v, i) => <circle key={'b'+i} cx={xAt(i)} cy={yScale(v)} r={3} fill={PN.GREEN}/>)}
          {d.scontrinoTrend.delivery.map((v, i) => <circle key={'c'+i} cx={xAt(i)} cy={yScale(v)} r={3} fill={PN.BLUE}/>)}
          {/* Months */}
          {months.map((m, i) => <text key={i} x={xAt(i)} y={H - 6} fontSize="11" fill={PN.MUTED} textAnchor="middle">{m}</text>)}
        </svg>
      </StatCard>

      {/* Heatmap */}
      <StatCard title="Heatmap oraria ordini" sub={`Ordini medi per fascia oraria · canale ${channel}`} action={
        <div style={{display:'inline-flex', gap: 6, padding: 4, background:'#f5f5f7', borderRadius: 999}}>
          {['Sala','Asporto','Delivery','App'].map(ch => (
            <button key={ch} onClick={() => setChannel(ch)} style={{
              padding:'5px 12px', fontSize: 11.5, fontWeight: 600,
              background: channel === ch ? PN.WHITE : 'transparent',
              border:'none', borderRadius: 999,
              color: channel === ch ? PN.PINK_DARK : PN.MUTED,
              cursor:'pointer', fontFamily:'inherit',
              boxShadow: channel === ch ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}>{ch}</button>
          ))}
        </div>
      }>
        <div style={{
          display:'grid',
          gridTemplateColumns:`80px repeat(7, 1fr)`,
          gap: 4,
        }}>
          <div></div>
          {days.map(day => (
            <div key={day} style={{
              padding:'8px 0', fontSize: 11, fontWeight: 700, color: PN.MUTED,
              textAlign:'center', textTransform:'uppercase', letterSpacing: 0.4,
            }}>{day}</div>
          ))}
          {d.heatmap.map((row, ri) => (
            <React.Fragment key={ri}>
              <div style={{
                padding:'10px 8px', fontSize: 11.5, fontWeight: 600, color: PN.MUTED,
                fontVariantNumeric:'tabular-nums',
              }}>{row.ora}</div>
              {row.val.map((v, i) => (
                <div key={i} style={{
                  height: 40, borderRadius: 6,
                  background: heatBg(v), color: heatColor(v),
                  display:'grid', placeItems:'center',
                  fontSize: 12, fontWeight: 700, fontVariantNumeric:'tabular-nums',
                }}>{v}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: 16, fontSize: 11, color: PN.MUTED}}>
          <span>Bassa attività</span>
          {['#FFF1EF','#FFC2C0','#FF8E92','#ff5a5f','#B53338'].map(c => (
            <span key={c} style={{width: 16, height: 16, background: c, borderRadius: 3}}/>
          ))}
          <span>Alta attività</span>
        </div>
      </StatCard>
    </div>
  );
}

function ChannelCard({ title, subtitle, data, iconKey, color }) {
  const Ico = BuIcons[iconKey];
  return (
    <StatCard padding={20}>
      <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 14}}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}15`, color,
          display:'grid', placeItems:'center',
        }}>{Ico ? <Ico size={18} color={color}/> : null}</div>
        <div>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>{title}</div>
          <div style={{fontSize: 12, color: PN.MUTED}}>{subtitle}</div>
        </div>
      </div>
      <div style={{display:'flex', gap: 10}}>
        <Pill iconKey="check" label="Completati" value={data.completati.toLocaleString('it-IT')}/>
        <Pill iconKey="clock" label="Tempo medio" value={data.tempoMedio}/>
      </div>
    </StatCard>
  );
}
function Pill({ iconKey, label, value }) {
  const Ico = BuIcons[iconKey];
  return (
    <div style={{
      flex:1, display:'flex', alignItems:'center', gap: 10,
      padding:'10px 12px', background:'#fafafa',
      border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
    }}>
      {Ico ? <Ico size={14} color={PN.MUTED}/> : null}
      <div style={{flex:1, minWidth: 0}}>
        <div style={{fontSize: 11, color: PN.MUTED}}>{label}</div>
        <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{value}</div>
      </div>
    </div>
  );
}

window.StatOrdini = StatOrdini;

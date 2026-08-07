// Statistiche — sub-tab Ordini

function StatOrdini() {
  const d = STAT_ORDINI;

  // Heatmap max
  const allHeat = d.heatmap.flatMap(r => r.val);
  const maxHeat = Math.max(...allHeat);
  // Rampa sequenziale a tinta unica: dal rosa chiarissimo al wine, chiaro→scuro
  const HEAT_RAMP = ['#FFF3F1', '#FFD9D7', '#FFACAF', '#FF5A5F', '#B53338'];
  const heatBg = (v) => {
    const t = v / maxHeat;
    if (t < 0.18) return HEAT_RAMP[0];
    if (t < 0.35) return HEAT_RAMP[1];
    if (t < 0.55) return HEAT_RAMP[2];
    if (t < 0.75) return HEAT_RAMP[3];
    return HEAT_RAMP[4];
  };
  const heatColor = (v) => v / maxHeat >= 0.55 ? '#fff' : PN.TEXT;
  const days = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  const [channel, setChannel] = React.useState('Sala');

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Lo scontrino medio è passato in Economici → Vendite piatti, fra gli
          altri KPI di valore. Qui resta il suo andamento per canale, che è
          un'altra domanda: non "quanto vale un ordine" ma "da dove arriva". */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpi label="Ordini completati" value={d.kpi.completati.val.toLocaleString('it-IT', {useGrouping: true})} delta={d.kpi.completati.delta} sub="Totale ordini completati nel periodo selezionato"/>
        <StatKpi label="Articoli per ordine" value={d.kpi.articoli.val.toString().replace('.', ',')} delta={d.kpi.articoli.delta} sub={d.kpi.articoli.sub}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        <ChannelCard title="In sala" subtitle="Coperti seduti" data={d.sala} iconKey="table" color={PN.WINE}/>
        <ChannelCard title="Da asporto / delivery" subtitle="Ordini per ritiro o consegna" data={d.asporto} iconKey="storefront" color={PN.PINK}/>
      </div>

      {/* Heatmap */}
      <StatCard title="Heatmap oraria ordini" sub={`Ordini medi per fascia oraria · canale ${channel}`} action={
        <div style={{display:'inline-flex', gap: 6, padding: 4, background:'#f5f5f7', borderRadius: 999}}>
          {['Sala','Asporto','Delivery','App clienti'].map(ch => (
            <button key={ch} onClick={() => setChannel(ch)} style={{
              padding:'5px 12px', fontSize: 14.5, fontWeight: 600,
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
          gridTemplateColumns:`64px repeat(7, 1fr)`,
          gap: 3,
        }}>
          <div></div>
          {days.map(day => (
            <div key={day} style={{
              padding:'6px 0', fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
              textAlign:'center', textTransform:'uppercase', letterSpacing: 0.4,
            }}>{day}</div>
          ))}
          {d.heatmap.map((row, ri) => (
            <React.Fragment key={ri}>
              <div style={{
                padding:'0 10px 0 0', fontSize: 13.5, fontWeight: 600, color: PN.MUTED,
                fontVariantNumeric:'tabular-nums', textAlign:'right', alignSelf:'center',
              }}>{row.ora}</div>
              {row.val.map((v, i) => (
                <div key={i} style={{
                  height: 40, borderRadius: 5,
                  background: heatBg(v), color: heatColor(v),
                  display:'grid', placeItems:'center',
                  fontSize: 13, fontWeight: 600, fontVariantNumeric:'tabular-nums',
                }}>{v}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 6, marginTop: 16, fontSize: 14, color: PN.MUTED}}>
          <span style={{marginRight: 4}}>Bassa attività</span>
          {HEAT_RAMP.map(c => (
            <span key={c} style={{width: 22, height: 10, background: c, borderRadius: 3}}/>
          ))}
          <span style={{marginLeft: 4}}>Alta attività</span>
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
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{title}</div>
          <div style={{fontSize: 14.5, color: PN.MUTED}}>{subtitle}</div>
        </div>
      </div>
      <div style={{display:'flex', gap: 10}}>
        <Pill iconKey="check" label="Completati" value={data.completati.toLocaleString('it-IT', {useGrouping: true})}/>
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
        <div style={{fontSize: 14, color: PN.MUTED}}>{label}</div>
        <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{value}</div>
      </div>
    </div>
  );
}

window.StatOrdini = StatOrdini;

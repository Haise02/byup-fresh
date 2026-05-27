// Tab Cassa: banner compatto + 4 stat + tabella movimenti

function ContCassa({ open, setOpen }) {
  const [tab, setTab] = React.useState('all');
  const filtered = CASH_MOVEMENTS.filter(m => tab==='all' || m.channel===tab);
  const total = CASH_MOVEMENTS.reduce((s,m)=>s+m.amount,0).toFixed(2);

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Banner stato compatto */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '12px 18px',
        background: open ? '#ecfdf5' : '#fef2f2',
        border: `1px solid ${open ? '#86efac' : '#fca5a5'}`,
        borderRadius: 12,
      }}>
        <span style={{
          width:8, height:8, borderRadius:'50%',
          background: open ? '#16a34a' : '#dc2626',
          boxShadow: `0 0 0 4px ${open ? '#16a34a22' : '#dc262622'}`,
        }}/>
        <div style={{flex:1}}>
          <div style={{fontSize: 13, fontWeight: 700, color: open ? '#15803d' : '#991b1b'}}>
            {open ? 'Cassa aperta' : 'Cassa chiusa'}
          </div>
          <div style={{fontSize: 11.5, color: open ? '#16a34a' : '#dc2626'}}>
            {open ? 'Apertura ore 09:30 · Operatore: Marco' : 'Quadratura di cassa eseguita correttamente'}
          </div>
        </div>
        <button onClick={() => setOpen(!open)} style={{
          padding:'8px 18px', borderRadius: 999,
          background:'#0F1115', color:'#fff', border:'none',
          fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        }}>{open ? 'Chiudi cassa' : 'Apri cassa'}</button>
      </div>

      {/* Tabella movimenti */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 18}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14}}>
          <div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Movimenti cassa</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>Oggi · {CASH_MOVEMENTS.length} transazioni · €{total} incassati</div>
          </div>
        </div>

        {/* Tabs canale */}
        <div style={{display:'flex', gap: 6, padding: 4, background:'#f5f5f7', borderRadius: 12, marginBottom: 14}}>
          {[
            {id:'all', label:'Tutte'},
            {id:'cassa', label:'Cassa fisica'},
            {id:'cameriere', label:'Da Cameriere'},
            {id:'app', label:'Da App'},
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:'8px 10px',
              background: tab===t.id ? PN.WHITE : 'transparent',
              border:'none', borderRadius: 8,
              fontSize: 12, fontWeight: 600,
              color: tab===t.id ? PN.PINK_DARK : PN.MUTED,
              cursor:'pointer', fontFamily:'inherit',
              boxShadow: tab===t.id ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Search + actions */}
        <div style={{display:'flex', gap: 10, marginBottom: 12}}>
          <div style={{
            flex:1, display:'flex', alignItems:'center', gap: 8,
            padding:'8px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10,
          }}>
            <span style={{color: PN.MUTED}}>🔍</span>
            <input placeholder="Cerca per ID, operatore, note…" style={{
              flex:1, border:'none', outline:'none', fontSize: 12.5, fontFamily:'inherit',
            }}/>
          </div>
          <button style={{padding:'8px 14px', background:PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 12, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}>📅 Periodo</button>
          <button style={{padding:'8px 14px', background:'#0F1115', border:'none', borderRadius: 10, fontSize: 12, fontWeight: 700, color:'#fff', cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}>⬆ Esporta</button>
        </div>

        {/* Table */}
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1fr 1.4fr 0.7fr', padding:'10px 14px', background: PN.PINK_BG_SOFT, fontSize: 11.5, fontWeight: 700, color: PN.TEXT, textTransform:'uppercase', letterSpacing: 0.4}}>
            <span>ID Transazione</span><span style={{textAlign:'right'}}>Importo</span><span>Data</span><span>Ora</span><span>Canale</span><span style={{textAlign:'right'}}>Scontrino</span>
          </div>
          {filtered.map((m,i) => (
            <div key={m.id+i} style={{
              display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1fr 1.4fr 0.7fr',
              padding:'12px 14px', alignItems:'center',
              fontSize: 12.5, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
            }}>
              <span style={{fontFamily:'ui-monospace, monospace', color: PN.MUTED}}>{m.id}</span>
              <span style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {m.amount.toFixed(2)}</span>
              <span style={{color: PN.MUTED}}>{m.date}</span>
              <span style={{color: PN.MUTED}}>{m.time}</span>
              <span style={{color: PN.PINK_DARK, fontWeight: 600}}>{m.channelLabel}</span>
              <span style={{textAlign:'right'}}>
                <button style={{background:'transparent', border:'none', cursor:'pointer', fontSize: 14, color: PN.TEXT}}>📄</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.ContCassa = ContCassa;

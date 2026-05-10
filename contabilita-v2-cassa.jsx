// Tab Cassa v2 — gerarchia importo > id, icone SVG, header tabella neutro

function ContCassa({ open, setOpen }) {
  const [ch, setCh] = React.useState('all');
  const filtered = CASH_MOVEMENTS.filter(m => ch==='all' || m.channel===ch);
  const total = CASH_MOVEMENTS.reduce((s,m)=>s+m.amount,0).toFixed(2);

  const channelMeta = {
    cassa:     { label:'Cassa fisica', icon: Ic.cash,       bg:'#EEF2FF', fg:'#4338CA' },
    cameriere: { label:'Cameriere',    icon: Ic.users,      bg:'#FEF3C7', fg:'#92400E' },
    app:       { label:'Byup App',     icon: Ic.smartphone, bg:'#FFE0DD', fg:'#B53338' },
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Banner stato cassa */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: open ? '#ECFDF5' : '#FEF2F2',
        border: `1px solid ${open ? '#A7F3D0' : '#FECACA'}`,
        borderRadius: C.R_MD,
      }}>
        <span style={{
          width:10, height:10, borderRadius:'50%',
          background: open ? PN.GREEN : PN.RED,
          boxShadow: `0 0 0 4px ${open ? '#A7F3D055' : '#FECACA55'}`,
        }}/>
        <div style={{flex:1}}>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: open ? '#065F46' : '#991B1B'}}>
            {open ? 'Cassa aperta' : 'Cassa chiusa'}
          </div>
          <div style={{fontSize: C.T_XS, color: open ? '#047857' : '#B91C1C', marginTop: 2}}>
            {open ? 'Apertura ore 09:30 · Operatore: Marco' : 'Quadratura di cassa eseguita correttamente'}
          </div>
        </div>
        <button onClick={() => setOpen(!open)} style={{
          padding:'9px 18px', borderRadius: C.R_PILL,
          background: PN.TEXT, color:'#fff', border:'none',
          fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        }}>{open ? 'Chiudi cassa' : 'Apri cassa'}</button>
      </div>

      {/* Card movimenti */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 16, flexWrap:'wrap', gap: 12}}>
          <div>
            <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Movimenti cassa</div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>Oggi · {CASH_MOVEMENTS.length} transazioni · €{total} incassati</div>
          </div>
        </div>

        {/* Secondary filters: chip pattern (riusato uguale altrove) */}
        <div style={{display:'flex', gap: 8, marginBottom: 14, flexWrap:'wrap'}}>
          {[
            {id:'all',       label:'Tutte'},
            {id:'cassa',     label:'Cassa fisica'},
            {id:'cameriere', label:'Cameriere'},
            {id:'app',       label:'Byup App'},
          ].map(t => (
            <FilterChip key={t.id} active={ch===t.id} onClick={() => setCh(t.id)} label={t.label}/>
          ))}
        </div>

        {/* Search + actions */}
        <div style={{display:'flex', gap: 10, marginBottom: 14, flexWrap:'wrap'}}>
          <div style={{
            flex:'1 1 240px', display:'flex', alignItems:'center', gap: 8,
            padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            background: PN.WHITE,
          }}>
            <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
            <input placeholder="Cerca per ID, operatore, note…" style={{
              flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit',
            }}/>
          </div>
          <button style={iconBtn}><Ic.calendar size={14}/> Periodo</button>
          <button style={primaryBtn}><Ic.upload size={14}/> Esporta</button>
        </div>

        {/* Tabella — Importo prominente a sx, ID secondario */}
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'0.9fr 1.1fr 1.2fr 0.8fr 0.8fr 0.5fr',
            padding:'10px 14px', background: C.TH_BG,
            fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
            textTransform:'uppercase', letterSpacing: 0.5,
          }}>
            <span>Importo</span>
            <span>Canale</span>
            <span>POS</span>
            <span>Data · Ora</span>
            <span>ID</span>
            <span style={{textAlign:'right'}}>Scontrino</span>
          </div>
          {filtered.map((m,i) => {
            const meta = channelMeta[m.channel] || channelMeta.cassa;
            const I = meta.icon;
            return (
              <div key={m.id+i} style={{
                display:'grid', gridTemplateColumns:'0.9fr 1.1fr 1.2fr 0.8fr 0.8fr 0.5fr',
                padding:'12px 14px', alignItems:'center',
                fontSize: C.T_SM, color: PN.TEXT,
                borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                background: PN.WHITE,
              }}>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, color: PN.TEXT, letterSpacing: -0.2}}>€ {m.amount.toFixed(2)}</span>
                <span>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 6,
                    padding:'4px 10px', borderRadius: C.R_PILL,
                    background: meta.bg, color: meta.fg,
                    fontSize: C.T_XS, fontWeight: 600,
                  }}><I size={12}/> {meta.label}</span>
                </span>
                <span style={{display:'flex', alignItems:'center', gap: 8, minWidth: 0}}>
                  {m.pos ? (
                    <>
                      <span style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: '#F3F4F6',
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        flexShrink: 0, color: PN.MUTED,
                      }}><Ic.smartphone size={12}/></span>
                      <span style={{minWidth: 0, overflow:'hidden'}}>
                        <span style={{display:'block', fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.pos.name}</span>
                        <span style={{display:'block', fontSize: C.T_XS, color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.pos.model} · {m.pos.user}</span>
                      </span>
                    </>
                  ) : (
                    <span style={{fontSize: C.T_XS, color: PN.MUTED_SOFT, fontStyle:'italic'}}>—</span>
                  )}
                </span>
                <span style={{color: PN.MUTED, fontSize: C.T_SM, fontVariantNumeric:'tabular-nums'}}>{m.date} · {m.time}</span>
                <span style={{fontFamily:'ui-monospace, monospace', color: PN.MUTED_SOFT, fontSize: C.T_XS}}>#{m.id}</span>
                <span style={{textAlign:'right'}}>
                  <button title="Vedi scontrino" style={iconOnlyBtn}><Ic.receipt size={14}/></button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable styles & components ───────────────────
const iconBtn = {
  padding:'9px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
  cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
};
const primaryBtn = {
  padding:'9px 14px', background: PN.TEXT, border:'none',
  borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#fff',
  cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
};
const iconOnlyBtn = {
  background:'transparent', border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, padding:'6px 9px', cursor:'pointer',
  color: PN.MUTED, display:'inline-flex', alignItems:'center', justifyContent:'center',
};
window.iconBtn = iconBtn;
window.primaryBtn = primaryBtn;
window.iconOnlyBtn = iconOnlyBtn;

function FilterChip({ active, onClick, label, count }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      padding:'7px 14px',
      background: active ? PN.TEXT : PN.WHITE,
      border: `1px solid ${active ? PN.TEXT : PN.BORDER}`,
      color: active ? '#fff' : PN.TEXT,
      borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 600,
      cursor:'pointer', fontFamily:'inherit',
    }}>
      {label}
      {count != null && <span style={{
        background: active ? 'rgba(255,255,255,0.2)' : C.SURF_ALT,
        color: active ? '#fff' : PN.MUTED,
        padding:'1px 8px', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700,
      }}>{count}</span>}
    </button>
  );
}
window.FilterChip = FilterChip;
window.ContCassa = ContCassa;

// Sala — selettore generico SaSelect (riusato da sala-modale-prenotazione e sala-tab-tavoli).

function SaSelect({ value, onChange, options }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding:'9px 14px', borderRadius: 8,
        border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
        fontSize: 13, color: PN.TEXT, fontWeight: 600,
        cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap: 8,
        minWidth: 170,
      }}>
        <span style={{flex:1, textAlign:'left'}}>{value}</span>
        <span style={{color: PN.MUTED}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left: 0,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          minWidth: 170, zIndex: 10, padding: 4,
        }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
              display:'block', width:'100%', textAlign:'left',
              padding:'7px 10px', borderRadius: 6,
              background:'transparent', border:'none',
              fontSize: 13, color: PN.TEXT, cursor:'pointer',
              fontFamily:'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

window.SaSelect = SaSelect;

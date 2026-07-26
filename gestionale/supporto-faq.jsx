// FAQ con tab filtri + accordion

function SupFAQ({ search }) {
  const [tab, setTab] = React.useState('all');
  const [open, setOpen] = React.useState(null);

  const filtered = SUP_FAQS.filter(f => {
    if (tab !== 'all' && f.cat !== tab) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!f.q.toLowerCase().includes(s) && !f.a.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div style={{
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{marginBottom: 16}}>
        <h2 style={{margin: '0 0 4px', fontSize: 19, fontWeight: 700, color: PN.TEXT}}>Domande frequenti</h2>
        <p style={{margin: 0, fontSize: 14.5, color: PN.MUTED}}>Le risposte alle domande più comuni dei nostri utenti</p>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', flexWrap:'wrap', gap: 8, marginBottom: 16}}>
        {SUP_FAQ_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '6px 14px',
            borderRadius: 999,
            background: tab === t.id ? PN.PINK_BG_SOFT : 'transparent',
            color: tab === t.id ? PN.PINK_DARK : PN.MUTED,
            border: `1px solid ${tab === t.id ? PN.PINK_BG_SOFT : PN.BORDER}`,
            fontSize: 14, fontWeight: 600, fontFamily:'inherit',
            cursor:'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{padding:'24px 12px', textAlign:'center', color: PN.MUTED, fontSize: 15}}>
          Nessuna domanda in questa categoria{search ? ` per "${search}"` : ''}.
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        {filtered.map(f => {
          const isOpen = open === f.id || !!search;
          return (
            <div key={f.id} style={{
              background: '#f8f8fa',
              borderRadius: 10,
              overflow:'hidden',
              transition:'transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), background 140ms ease, box-shadow 150ms ease',
            }}>
              <button onClick={() => setOpen(isOpen ? null : f.id)}
                onMouseEnter={e => { const c = e.currentTarget.parentElement; c.style.transform = 'scale(1.012)'; c.style.background = PN.PINK_BG_SOFT; c.style.boxShadow = '0 6px 16px rgba(15, 17, 21, 0.08)'; }}
                onMouseLeave={e => { const c = e.currentTarget.parentElement; c.style.transform = ''; c.style.background = '#f8f8fa'; c.style.boxShadow = ''; }}
                onMouseDown={e => { e.currentTarget.parentElement.style.transform = 'scale(0.99)'; }}
                onMouseUp={e => { e.currentTarget.parentElement.style.transform = 'scale(1.012)'; }}
                style={{
                width:'100%', display:'flex', alignItems:'center', gap: 12,
                padding: '12px 16px',
                background:'transparent', border:'none',
                cursor:'pointer', fontFamily:'inherit',
                color: PN.TEXT, textAlign:'left',
              }}>
                <span style={{
                  color: PN.MUTED, fontSize: 13,
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s', flexShrink: 0,
                }}>▶</span>
                <span style={{flex: 1, fontSize: 15, fontWeight: 600}}>{f.q}</span>
              </button>
              {isOpen && (
                <div style={{padding: '4px 16px 16px 36px', fontSize: 14.5, color: PN.MUTED, lineHeight: 1.6}}>
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.SupFAQ = SupFAQ;

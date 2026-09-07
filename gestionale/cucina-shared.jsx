// ══════════════════════════════════════════════════════════════════════════
// byup · Cucina — i pezzi condivisi dalle due visualizzazioni.
//
// Stavano dentro `cucina-tab-insala.jsx`, che era la vista «Ristorante» a
// colonne. Quando quella vista e' stata sostituita dalla board per tavolo il
// file e' uscito — ma questi quattro pezzi li usa anche il Pub, e due cucine
// dello stesso gestionale non possono avere due grammatiche:
//   CUC_CARD            la cornice bianca in cui vive la board, con e senza focus
//   KdsFilterChip       i chip «Canali» e «Categorie» della barra
//   Enter/ExitFullIcon  le due icone dello schermo intero
// ══════════════════════════════════════════════════════════════════════════

function EnterFullIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></svg>); }
function ExitFullIcon()  { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v4a1 1 0 0 1-1 1H4"/><path d="M15 4v4a1 1 0 0 0 1 1h4"/><path d="M9 20v-4a1 1 0 0 0-1-1H4"/><path d="M15 20v-4a1 1 0 0 1 1-1h4"/></svg>); }

function KdsFilterChip({ label, selected, defaultLabel, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const isActive = selected.length > 0;

  const displayValue = selected.length === 0 ? defaultLabel
    : selected.length === 1 ? selected[0]
    : `${selected.length} selezionate`;

  function toggle(opt) {
    if (selected.includes(opt)) {
      onChange(selected.filter(x => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{position: 'relative'}}>
      <button onClick={() => setOpen(o => !o)}
        onMouseEnter={e => {
          if (!isActive) { e.currentTarget.style.background = 'rgba(15, 17, 21, 0.10)'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(15, 17, 21, 0.18)'; }
          else e.currentTarget.style.filter = 'brightness(1.18)';
        }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = ''; }}
        style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 12px', borderRadius: 10, height: 36,
        background: isActive ? `
          radial-gradient(circle at 82% 18%, rgba(255, 96, 102, 0.32), transparent 62%),
          linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
        ` : 'rgba(15, 17, 21, 0.04)',
        border: 'none',
        boxShadow: isActive
          ? 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55)'
          : 'inset 0 0 0 1px rgba(15, 17, 21, 0.10)',
        color: isActive ? '#FFE9E6' : PN.TEXT,
        fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'background 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out, filter 140ms ease, transform 120ms ease',
      }}>
        <span style={{fontSize: 13, fontWeight: 500, opacity: isActive ? 0.65 : 0.5}}>{label}:</span>
        <span>{displayValue}</span>
        <span style={{fontSize: 11, opacity: 0.55, marginLeft: 1}}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: PN.WHITE, border: `1px solid ${PN.BORDER_HAIR}`,
          borderRadius: 10, padding: 4,
          boxShadow: '0 8px 24px rgba(15,17,21,0.12), 0 1px 4px rgba(15,17,21,0.06)',
          minWidth: 160,
        }}>
          {/* Voce "Tutti/Tutte" — resetta selezione */}
          <button onClick={() => { onChange([]); setOpen(false); }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEF0F4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = !isActive ? PN.BG : 'transparent'; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '9px 12px', borderRadius: 7,
            background: !isActive ? PN.BG : 'transparent',
            color: !isActive ? PN.TEXT : PN.MUTED,
            border: 'none', fontSize: 15, fontWeight: !isActive ? 700 : 500,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 120ms ease, transform 120ms ease',
          }}>
            {defaultLabel}
            {!isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>
          {/* Separatore */}
          <div style={{height: 1, background: PN.BORDER_SOFT, margin: '3px 4px'}}/>
          {options.map(o => {
            const checked = selected.includes(o);
            return (
              <button key={o} onClick={() => toggle(o)} 
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF0F4'; }}
                onMouseLeave={e => { e.currentTarget.style.background = checked ? PN.BG : 'transparent'; e.currentTarget.style.transform = ''; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 7,
                background: checked ? PN.BG : 'transparent',
                color: PN.TEXT,
                border: 'none', fontSize: 15, fontWeight: checked ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 120ms ease, transform 120ms ease',
              }}>
                {/* Checkbox */}
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${checked ? PN.TEXT : PN.BORDER}`,
                  background: checked ? PN.TEXT : 'transparent',
                  display: 'grid', placeItems: 'center',
                }}>
                  {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// L'animazione dei chip, che viaggiava con loro.
if (typeof document !== 'undefined' && !document.getElementById('kds-anims')) {
  const s = document.createElement('style');
  s.id = 'kds-anims';
  s.textContent = `
    @keyframes kdsBump { 0% { transform: scale(1); } 40% { transform: scale(1.22); } 100% { transform: scale(1); } }
  `;
  document.head.appendChild(s);
}

// La cornice: la board — quale che sia — vive dentro questa card. Stesso
// riquadro, stesso raggio, stessa ombra, stessa aria.
const CUC_CARD = (focus) => ({
  flex: 1, minWidth: 0,
  position: 'relative', isolation: 'isolate',
  background: PN.WHITE,
  borderRadius: focus ? 0 : 20,
  border: focus ? 'none' : `1px solid ${PN.BORDER_HAIR}`,
  boxShadow: focus ? 'none' : '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
  padding: focus ? '20px 28px' : 22,
  display: 'flex', flexDirection: 'column', minHeight: 0,
});

Object.assign(window, { CUC_CARD, KdsFilterChip, EnterFullIcon, ExitFullIcon });


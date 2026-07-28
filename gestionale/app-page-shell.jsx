// Shared page header for top-level operative pages (Sala, Cucina, Account)
// Design system 2.0: WHITE_OFF bg, hairline border, weight 600, letter-spacing tighter.

// Underline tab bar — pillola attiva con gradient sottile + inset highlight (Apple).
// Sostituisce il border-bottom 2px solid con un'underline più morbida + tonalità.
// Ogni tab può opzionalmente avere `icon` (nome registry SfIcons). Quando
// definita, viene resa a sinistra del label a 14px. Coerente con la regola
// "1 icona per tab nelle filter chips di categoria" (vedi dashboard-icon-mapping).
function PnUnderlineTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 28,
      padding: '0 32px',
      borderBottom: `1px solid ${PN.BORDER_HAIR}`,
      background: PN.WHITE_OFF,
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '14px 0',
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${on ? PN.TEXT : 'transparent'}`,
            color: on ? PN.TEXT : PN.MUTED,
            fontSize: 15.5, fontWeight: on ? 600 : 500,
            letterSpacing: on ? '-0.01em' : 0,
            cursor: 'pointer', fontFamily: 'inherit',
            marginBottom: -1,
            transition: 'color 150ms ease-out, border-color 150ms ease-out',
          }}>
            {t.icon && <Icon name={t.icon} size={14}/>}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// Modal shell — backdrop con blur + container glass strong (Apple Sonoma).
// sheet=true: FOGLIO che sale dal fondo (ancorato in basso, angoli 22px in
// alto, slide-up spring) — per i flussi di creazione, niente modal opaco.
function PnModal({ open, onClose, title, subtitle, width = 720, children, footer, surface, sheet }) {
  if (!open) return null;
  const solid = surface === 'solid';
  const surfaceStyle = solid
    ? {
        background: '#FFFFFF',
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 32px 80px rgba(15, 17, 21, 0.24), 0 2px 6px rgba(15, 17, 21, 0.08)',
      }
    : PN.GLASS_STRONG;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0,
      background: 'rgba(15, 17, 21, 0.42)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: sheet ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      {sheet && <style>{`@keyframes pnSheetUp {
        from { opacity: 0.4; transform: translateY(36px); }
        to   { opacity: 1;   transform: translateY(0); }
      }`}</style>}
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: '92%', maxHeight: sheet ? '90%' : '88%',
        ...surfaceStyle,
        borderRadius: sheet ? '22px 22px 0 0' : 14,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: sheet ? 'pnSheetUp 320ms cubic-bezier(0.32, 0.72, 0, 1)' : undefined,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
        }}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 17, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.01em'}}>{title}</div>
            {subtitle && <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'transparent', border: 'none',
            color: PN.MUTED, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}><PnI.X size={16}/></button>
        </div>

        <div className="pn-scroll" style={{flex: 1, overflow: 'auto', padding: 20}}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: '14px 20px',
            borderTop: `1px solid ${PN.BORDER_HAIR}`,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
            background: PN.WHITE_HUSH,
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// Generic CTA button — Apple-style: gradient sottile + inset highlight + border alpha.
// 5 varianti coordinate col design system 2.0 (BTN_DARK / BTN_NEUTRAL / BTN_BRAND).
function PnButton({ variant = 'primary', icon, children, onClick, style, disabled }) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    primary: {
      bg:     hover ? PN.BTN_DARK_HOVER : PN.BTN_DARK,
      color:  PN.WHITE,
      border: '1px solid rgba(0, 0, 0, 0.32)',
      shadow: PN.INSET_HIGHLIGHT_DARK,
    },
    secondary: {
      bg:     hover ? PN.BTN_NEUTRAL_HOVER : PN.BTN_NEUTRAL,
      color:  PN.TEXT,
      border: `1px solid ${PN.BORDER_LIGHT}`,
      shadow: PN.INSET_HIGHLIGHT,
    },
    ghost: {
      bg:     hover ? PN.WHITE_HUSH : 'transparent',
      color:  PN.TEXT,
      border: `1px solid ${PN.BORDER_LIGHT}`,
      shadow: 'none',
    },
    danger: {
      bg:     hover ? 'linear-gradient(180deg, #E94343 0%, #B91C1C 100%)' : 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)',
      color:  PN.WHITE,
      border: '1px solid rgba(124, 14, 14, 0.40)',
      shadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 1px 2px rgba(220, 38, 38, 0.18)',
    },
    pink: {
      bg:     hover ? PN.BTN_BRAND_HOVER : PN.BTN_BRAND,
      color:  PN.WHITE,
      border: '1px solid rgba(180, 30, 35, 0.40)',
      shadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)`,
    },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 16px', borderRadius: 9,
        fontSize: 15, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: disabled ? 0.5 : 1,
        background: v.bg, color: v.color, border: v.border,
        boxShadow: v.shadow,
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
        ...style,
      }}>
      {icon}{children}
    </button>
  );
}

window.PnUnderlineTabs = PnUnderlineTabs;
window.PnModal = PnModal;
window.PnButton = PnButton;

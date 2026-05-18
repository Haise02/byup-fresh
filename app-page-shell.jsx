// Shared page header for top-level operative pages (Sala, Cucina, Account)
// Design system 2.0: WHITE_OFF bg, hairline border, weight 600, letter-spacing tighter.

// `icon` accetta il nome di un'icona Content del registry SfIcons (es.
// 'food-meal', 'place-restaurant'). Quando passato, viene resa in un cerchio
// soft come ancora di sezione, accanto al titolo. Vedi `dashboard-icon-mapping.md`
// per il vincolo "1 sola Content icon per header".
function PnPageHeader({ title, subtitle, actions, icon }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '20px 32px 18px',
      borderBottom: `1px solid ${PN.BORDER_HAIR}`,
      background: PN.WHITE_OFF,
    }}>
      {icon && (
        <span style={{
          width: 40, height: 40, borderRadius: 11,
          background: PN.PINK_SOFT, color: PN.PINK_DARK,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name={icon} size={22}/>
        </span>
      )}
      <div style={{flex: 1, minWidth: 0}}>
        <h1 style={{margin: 0, fontSize: 22, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em'}}>
          {title}
        </h1>
        {subtitle && (
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 4}}>{subtitle}</div>
        )}
      </div>
      {actions}
      <PnNotifBell/>
    </header>
  );
}

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
            fontSize: 13.5, fontWeight: on ? 600 : 500,
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

// Status legend (libero, occupato, prenotato, ecc.)
function PnLegend({ items }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 16, fontSize: 12.5, color: PN.MUTED}}>
      <span style={{fontWeight: 700, color: PN.TEXT}}>Legenda:</span>
      {items.map(it => (
        <span key={it.label} style={{display:'flex', alignItems:'center', gap: 6}}>
          <span style={{
            width: 9, height: 9, borderRadius:'50%',
            background: it.color,
          }}/>
          <span style={{color: PN.TEXT, fontWeight: 600}}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

// Search input
function PnSearchInput({ placeholder = 'Cerca…', value, onChange, style }) {
  return (
    <div style={{
      flex: 1, position:'relative',
      ...style,
    }}>
      <input
        value={value || ''}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '11px 40px 11px 16px',
          borderRadius: 10,
          border: `1px solid ${PN.BORDER}`,
          background: PN.WHITE,
          fontSize: 13.5, color: PN.TEXT,
          outline: 'none', fontFamily: 'inherit',
        }}
      />
      <span style={{position:'absolute', right: 14, top:'50%', transform:'translateY(-50%)', color: PN.MUTED}}>
        <Icon name="magnifying-glass" size={16}/>
      </span>
    </div>
  );
}

// Modal shell — backdrop con blur + container glass strong (Apple Sonoma)
function PnModal({ open, onClose, title, subtitle, width = 720, children, footer }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0,
      background: 'rgba(15, 17, 21, 0.42)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center',
      zIndex: 50,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: '92%', maxHeight: '88%',
        ...PN.GLASS_STRONG,
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
        }}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.01em'}}>{title}</div>
            {subtitle && <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>{subtitle}</div>}
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

// Side-sheet — backdrop blur sul main, drawer Apple side-bar style
function PnSheet({ open, onClose, title, subtitle, width = 480, children, footer }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0,
      background: 'rgba(15, 17, 21, 0.42)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 50,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: '92%', height: '100%',
        background: PN.WHITE,
        boxShadow: '-16px 0 40px rgba(15, 17, 21, 0.14)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap: 12,
          padding: '16px 20px',
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>{title}</div>
            {subtitle && <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'transparent', border: 'none',
            color: PN.MUTED, cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={16}/></button>
        </div>

        <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: 20}}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: '14px 20px',
            borderTop: `1px solid ${PN.BORDER_SOFT}`,
            display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
            background: '#FAFBFC',
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// Pill button (small filter pill)
function PnPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'6px 14px', borderRadius: 999,
      border: 'none',
      background: active ? PN.PINK : PN.PINK_SOFT,
      color: active ? PN.WHITE : PN.PINK_DARK,
      fontSize: 12.5, fontWeight: 600,
      cursor:'pointer', fontFamily:'inherit',
      whiteSpace:'nowrap',
    }}>{children}</button>
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
        fontSize: 13, fontWeight: 600,
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

window.PnPageHeader = PnPageHeader;
window.PnUnderlineTabs = PnUnderlineTabs;
window.PnLegend = PnLegend;
window.PnSearchInput = PnSearchInput;
window.PnModal = PnModal;
window.PnSheet = PnSheet;
window.PnPill = PnPill;
window.PnButton = PnButton;

// byup — Standard AI Button
// Pattern condiviso per qualsiasi CTA che attiva una funzionalità AI.
// L'AI ha un proprio colore (viola) per distinguerla dalle azioni standard
// (rosa = brand). Sparkle + viola = "questa azione è assistita dall'AI".
//
// Varianti:
//   - primary  → viola pieno (default), per CTA principali
//   - dashed   → contorno tratteggiato viola, per inline/secondary
//   - subtle   → sfondo viola molto chiaro, per pannelli/card
//
// Uso:
//   <BuAiButton onClick={...}>Importa planimetria</BuAiButton>
//   <BuAiButton variant="dashed" hint="L'AI estrae piatti, prezzi, allergeni">Carica menu (PDF / foto)</BuAiButton>

function BuAiSparkle({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{flexShrink: 0, display:'inline-block'}}>
      <path d="M12 2 L13.6 8.4 L20 10 L13.6 11.6 L12 18 L10.4 11.6 L4 10 L10.4 8.4 Z"
        fill={color}/>
      <path d="M19 3 L19.7 5.3 L22 6 L19.7 6.7 L19 9 L18.3 6.7 L16 6 L18.3 5.3 Z"
        fill={color} opacity="0.7"/>
    </svg>
  );
}

function BuAiButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',         // 'sm' | 'md' | 'lg'
  hint,                 // testo grigio sotto al bottone
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  style: extraStyle = {},
}) {
  // AI palette — viola, distinto dal rosa brand
  const AI = '#7C3AED';
  const AI_DARK = '#6D28D9';
  const AI_BG_SOFT = '#F5F3FF';
  const AI_SOFT = '#EDE9FE';
  const MUTED = '#6B7280';

  const sizes = {
    sm: { pad:'7px 12px',  fs: 12,   gap: 5, icon: 13, radius: 8  },
    md: { pad:'11px 18px', fs: 13.5, gap: 7, icon: 15, radius: 10 },
    lg: { pad:'14px 24px', fs: 15,   gap: 8, icon: 17, radius: 12 },
  };
  const sz = sizes[size] || sizes.md;

  const variants = {
    primary: {
      background: AI,
      color: '#fff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(124,58,237,0.30)',
      iconColor: '#fff',
    },
    dashed: {
      background: AI_BG_SOFT,
      color: AI_DARK,
      border: `1.5px dashed ${AI}`,
      boxShadow: 'none',
      iconColor: AI_DARK,
    },
    subtle: {
      background: AI_SOFT,
      color: AI_DARK,
      border: `1px solid ${AI_SOFT}`,
      boxShadow: 'none',
      iconColor: AI_DARK,
    },
  };
  const v = variants[variant] || variants.primary;

  const button = (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        gap: sz.gap,
        padding: iconOnly ? `${sz.pad.split(' ')[0]}` : sz.pad,
        background: v.background,
        color: v.color,
        border: v.border,
        borderRadius: sz.radius,
        fontFamily: 'inherit',
        fontSize: sz.fs,
        fontWeight: 700,
        letterSpacing: 0.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: v.boxShadow,
        width: fullWidth ? '100%' : 'auto',
        transition: 'transform .12s ease, box-shadow .12s ease, background .12s ease',
        ...extraStyle,
      }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.background = AI_DARK;
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.40)';
        }
      }}
      onMouseLeave={e => {
        if (disabled) return;
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.boxShadow = v.boxShadow;
      }}
    >
      <BuAiSparkle size={sz.icon} color={v.iconColor}/>
      {!iconOnly && <span>{children}</span>}
    </button>
  );

  if (!hint) return button;
  return (
    <div style={{display:'inline-flex', flexDirection:'column', alignItems:'center', gap: 6, width: fullWidth ? '100%' : 'auto'}}>
      {button}
      <div style={{fontSize: 11, color: MUTED, textAlign:'center', lineHeight: 1.4}}>{hint}</div>
    </div>
  );
}

window.BuAiButton = BuAiButton;
window.BuAiSparkle = BuAiSparkle;

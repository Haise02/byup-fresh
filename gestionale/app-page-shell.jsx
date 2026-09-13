// Shared page header for top-level operative pages (Sala, Cucina, Account)
// Design system 2.0: WHITE_OFF bg, hairline border, weight 600, letter-spacing tighter.

// La tab bar di pagina è PnSectionTabs (panoramica-tokens.jsx): un solo
// linguaggio per tutte le sezioni. La vecchia PnUnderlineTabs (underline
// nera su fondo off-white) viveva qui ed è stata assorbita lì.

// Modal shell — backdrop con blur + container glass strong (Apple Sonoma).
// sheet=true: FOGLIO che sale dal fondo (ancorato in basso, angoli 22px in
// alto, slide-up spring) — per i flussi di creazione, niente modal opaco.
function PnModal({ open, onClose, title, subtitle, width = 720, children, footer, surface, sheet }) {
  // Gli hook stanno PRIMA del ritorno anticipato: l'ordine non può cambiare
  // fra un render e l'altro.
  const pannello = React.useRef(null);
  const { bp } = window.useA11y ? window.useA11y() : { bp: 'lg' };
  if (window.useTrappolaFocus) window.useTrappolaFocus(pannello, !!open, onClose);
  if (!open) return null;
  const solid = surface === 'solid';
  // Su una tela da 646 px una finestra da 720 è già più larga dello schermo, e
  // il `maxWidth: 92%` la lascia a 594 con dentro moduli pensati per 720. A
  // quel punto non è più una finestra posata sopra la pagina: è la pagina. Si
  // prende tutto lo spazio, il corpo scorre e il piede resta attaccato in
  // basso, così le CTA non finiscono mai fuori portata.
  const pieno = bp === 'sm' || bp === 'xs';
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
      <div
        ref={pannello}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={e => e.stopPropagation()}
        style={{
        width, maxWidth: '92%', maxHeight: sheet ? '90%' : '88%',
        ...surfaceStyle,
        borderRadius: sheet ? '22px 22px 0 0' : 14,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: sheet ? 'pnSheetUp 320ms cubic-bezier(0.32, 0.72, 0, 1)' : undefined,
        ...(pieno ? {
          width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%',
          borderRadius: 0, animation: undefined,
        } : null),
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
          {/* 44 × 44: cresce l'AREA, non il segno — la X resta di 16. Era 28,
              che passa il minimo di 2.5.8 ma non l'obiettivo di 2.5.5, ed è il
              bersaglio più ripetuto di tutto il gestionale. */}
          <button onClick={onClose} aria-label="Chiudi" title="Chiudi" style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
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
            // A tutto schermo il piede è l'unico posto da cui si conferma:
            // non deve poter scorrere via insieme al corpo, e su una tela
            // stretta le CTA vanno a capo invece di uscire dal bordo.
            flexShrink: 0, flexWrap: 'wrap',
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
        // ── Testo bianco sul corallo del marchio (C2, deciso il 13/09) ──────
        // #FF5A5F col bianco fa 3,05:1. Per 1.4.3 bastano 3:1 quando il testo
        // è GRANDE, e «grande» in bold vuol dire almeno 18,66 px — non 17,
        // come avevo scritto per errore in Fase 0. Quindi il pulsante di marca
        // porta il testo a 19/700: il corallo non si tocca, e il criterio è
        // soddisfatto. Le altre varianti restano 15/600, perché sul nero e sul
        // bianco il contrasto c'è già abbondante (13,75:1 e 18,90:1).
        fontSize: variant === 'pink' ? 19 : 15,
        fontWeight: variant === 'pink' ? 700 : 600,
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

window.PnModal = PnModal;
window.PnButton = PnButton;

// byup — AI Sparkle
// Icona condivisa che marca un'azione come "assistita dall'AI".
// Sparkle + viola = "questa azione è assistita dall'AI".
//
// Uso:
//   <BuAiSparkle size={13} color={PN.PINK_DARK}/>
//
// Al passaggio del mouse l'icona mostra il tooltip di trasparenza AI;
// si disattiva con tooltip={false} nei contesti dove è ridondante.

const BU_AI_TOOLTIP = 'Le azioni contrassegnate da questo simbolo sono assistite dall\'intelligenza artificiale.';

function BuAiSparkle({ size = 16, color = '#fff', tooltip = true }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'inline-flex', flexShrink: 0, lineHeight: 0,
        // L'icona è ~13px: senza un'area di hover più generosa il tooltip
        // è quasi impossibile da centrare. Il margin negativo pareggia il
        // padding, così il layout del bottone non si sposta.
        padding: 8, margin: -8, alignItems: 'center', justifyContent: 'center',
      }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{flexShrink: 0, display:'inline-block'}}>
        <path d="M12 2 L13.6 8.4 L20 10 L13.6 11.6 L12 18 L10.4 11.6 L4 10 L10.4 8.4 Z"
          fill={color}/>
        <path d="M19 3 L19.7 5.3 L22 6 L19.7 6.7 L19 9 L18.3 6.7 L16 6 L18.3 5.3 Z"
          fill={color} opacity="0.7"/>
      </svg>
      {tooltip && hover && (
        <span style={{
          position: 'absolute', top: size + 16, right: -14, zIndex: 90,
          width: 240, padding: '9px 12px', borderRadius: 9,
          background: '#1F2430', color: '#fff',
          fontSize: 12.5, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0,
          textAlign: 'left', whiteSpace: 'normal', textTransform: 'none',
          boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
          pointerEvents: 'none', fontFamily: 'inherit',
        }}>
          {BU_AI_TOOLTIP}
          <span style={{
            position: 'absolute', top: -4, right: 16,
            width: 8, height: 8, background: '#1F2430',
            transform: 'rotate(45deg)',
          }}/>
        </span>
      )}
    </span>
  );
}

window.BuAiSparkle = BuAiSparkle;

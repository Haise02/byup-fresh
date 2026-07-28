// byup — AI Sparkle
// Icona condivisa che marca un'azione come "assistita dall'AI".
// Sparkle + viola = "questa azione è assistita dall'AI".
//
// Uso:
//   <BuAiSparkle size={13} color={PN.PINK_DARK}/>

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

window.BuAiSparkle = BuAiSparkle;

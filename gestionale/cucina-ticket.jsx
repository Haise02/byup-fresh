// Cucina / KDS — ticket comanda in VETRO SCURO (ricetta D3 sunset).
// Priorità/ritardo = accento coral/ambra TRASLUCIDO + tempo trascorso,
// mai fondi rossi pieni. Piatti in tipografia grande leggibile a distanza,
// stati item come pill di vetro, avanzamento a barra sottile.

const KDS_C = {
  text: '#F5F5F7',
  sub:  'rgba(245, 245, 247, 0.62)',
  mut:  'rgba(245, 245, 247, 0.40)',
  hair: 'rgba(255, 255, 255, 0.08)',
};

// Palette LIGHT — board chiara, il dark resta solo sulle card in ritardo
const KDS_CL = {
  text: '#0F1115',
  sub:  'rgba(15, 17, 21, 0.62)',
  mut:  'rgba(15, 17, 21, 0.40)',
  hair: 'rgba(15, 17, 21, 0.07)',
};

// Toni traslucidi — l'urgenza è un accento, non un fondo
const KDS_TONE = {
  ok:    { tint: 'rgba(255, 255, 255, 0.07)', ring: 'rgba(255, 255, 255, 0.14)', ink: 'rgba(245,245,247,0.72)', dot: 'rgba(245,245,247,0.45)' },
  warn:  { tint: 'rgba(245, 158, 11, 0.16)',  ring: 'rgba(245, 158, 11, 0.42)',  ink: '#FFC964', dot: '#F59E0B' },
  late:  { tint: 'rgba(255, 90, 95, 0.18)',   ring: 'rgba(255, 90, 95, 0.48)',   ink: '#FF9A9E', dot: '#FF5A5F' },
  doing: { tint: 'rgba(245, 158, 11, 0.14)',  ring: 'rgba(245, 158, 11, 0.36)',  ink: '#FFC964', dot: '#F59E0B' },
  done:  { tint: 'rgba(52, 211, 153, 0.14)',  ring: 'rgba(52, 211, 153, 0.40)',  ink: '#6EE7B7', dot: '#34D399' },
};

// Toni per tema light — stessi ruoli, ink scuri leggibili su bianco
const KDS_TONE_L = {
  ok:    { tint: 'rgba(15, 17, 21, 0.05)',   ring: 'rgba(15, 17, 21, 0.10)',   ink: 'rgba(15,17,21,0.60)', dot: 'rgba(15,17,21,0.30)' },
  warn:  { tint: 'rgba(245, 158, 11, 0.12)', ring: 'rgba(245, 158, 11, 0.38)', ink: '#B45309', dot: '#F59E0B' },
  late:  { tint: 'rgba(220, 38, 38, 0.10)',  ring: 'rgba(220, 38, 38, 0.38)',  ink: '#DC2626', dot: '#DC2626' },
  doing: { tint: 'rgba(245, 158, 11, 0.10)', ring: 'rgba(245, 158, 11, 0.32)', ink: '#B45309', dot: '#F59E0B' },
  done:  { tint: 'rgba(16, 185, 129, 0.10)', ring: 'rgba(16, 185, 129, 0.35)', ink: '#059669', dot: '#10B981' },
};

// Pill di vetro — tinta traslucida + hairline ring (light per la board chiara)
function KdsPill({ tone = 'ok', light = false, children, style }) {
  const m = (light ? KDS_TONE_L : KDS_TONE)[tone] || (light ? KDS_TONE_L.ok : KDS_TONE.ok);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: m.tint,
      boxShadow: `inset 0 0 0 1px ${m.ring}`,
      color: m.ink,
      fontSize: 13, fontWeight: 700, lineHeight: 1.3,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
      maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
      ...style,
    }}>
      <span style={{width: 5.5, height: 5.5, borderRadius: '50%', background: m.dot, flexShrink: 0}}/>
      {children}
    </span>
  );
}

window.KdsPill = KdsPill;
window.KDS_TONE = KDS_TONE;
window.KDS_TONE_L = KDS_TONE_L;
window.KDS_C = KDS_C;
window.KDS_CL = KDS_CL;

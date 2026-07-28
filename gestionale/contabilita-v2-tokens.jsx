// Design tokens dedicati Contabilità v2
// Caricato PRIMA dei file componenti per essere disponibile in tutti gli scope Babel.

const C = {
  // Radius scale
  R_SM: 8,
  R_MD: 12,
  R_PILL: 999,
  // Type scale
  T_XS: 13,
  T_SM: 15,
  T_MD: 17,
  T_LG: 20,
  T_XL: 26,
  // Surfaces
  SURF: '#FAFAFB',
  SURF_ALT: '#F4F5F7',
  // Header tabella neutro
  TH_BG: '#F8F9FB',
  TH_TEXT: '#6B7280',
};

window.C = C;

// Contenitore che mostra al massimo `maxRows` righe, poi scrolla al suo
// interno. Le righe sono gli elementi marcati con data-row, oppure i figli
// diretti se nessun marker è presente (per liste senza pannelli espandibili).
// L'altezza è misurata sul DOM reale — bottom dell'ultima riga visibile —
// quindi funziona con altezze di riga diverse tra tabelle e si riadatta a
// resize, filtri ed espansioni senza costanti hardcoded.
function MaxRowsScroll({ maxRows = 10, className = '', style, children }) {
  const ref = React.useRef(null);
  const [maxH, setMaxH] = React.useState(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const marked = el.querySelectorAll('[data-row]');
      const items = marked.length ? marked : el.children;
      if (items.length <= maxRows) { setMaxH(null); return; }
      const last = items[maxRows - 1];
      setMaxH(prev => {
        const h = last.offsetTop + last.offsetHeight;
        return prev === h ? prev : h;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach(c => ro.observe(c));
    return () => ro.disconnect();
  });

  return (
    <div ref={ref} className={`pn-scroll ${className}`} style={{
      position: 'relative', // offsetTop delle righe relativo a questo box
      maxHeight: maxH == null ? 'none' : maxH,
      overflowY: maxH == null ? 'visible' : 'auto',
      ...style,
    }}>{children}</div>
  );
}
window.MaxRowsScroll = MaxRowsScroll;

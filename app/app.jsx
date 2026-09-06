// byup — Home screen prototype v2
const { useState, useRef, useEffect, useMemo } = React;

const __BYUP_DARK = (() => {
  try {
    const m = localStorage.getItem('byup.themeMode') || 'light';
    if (m === 'dark') return true;
    if (m === 'auto') return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return false;
  } catch { return false; }
})();
const PINK = '#E32459';
const PINK_DARK = '#B81C47';
const TEXT = __BYUP_DARK ? '#f6ece9' : '#1c0f15';
const MUTED = __BYUP_DARK ? 'rgba(246,236,233,.58)' : '#6d5a61';
const BORDER = __BYUP_DARK ? 'rgba(246,236,233,.13)' : '#eddfda';
const BG_GRAY = __BYUP_DARK ? '#262229' : '#f7ece8';
const BG_PAGE = __BYUP_DARK ? '#161514' : '#FBF4F1';
const SURF = __BYUP_DARK ? '#211f22' : '#fff';
const TINT = __BYUP_DARK ? '#2b272c' : '#f6f1ea';

// Design system condiviso — byup-app-kit.jsx DEVE essere caricato prima di questo file.
const BK = window.ByupKit;

// ─── Icons (coherent line set, stroke=1.7) ─────────────────
const Icon = {
  Coin: (p) => {
    const c = p.color || TEXT;
    const filled = p.fill && p.fill !== 'none';
    return (
      <svg width={p.size||23} height={p.size||23} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.4" stroke={c} strokeWidth="1.8" fill={filled ? c : 'none'}/>
        <text x="12" y="12.5" fontFamily="Fredoka, sans-serif" fontSize="11.5" fontWeight="700"
          fill={filled ? (BG_PAGE || '#fff') : c} textAnchor="middle" dominantBaseline="central">b</text>
      </svg>
    );
  },
  Map: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.3 4.3 5.5 5.6A2.1 2.1 0 0 0 4 7.6v9.5c0 1 1 1.7 1.9 1.3l3-1.1c.5-.2 1.1-.2 1.6 0l3 1.1c.5.2 1.1.2 1.6 0l3.4-1.2a2.1 2.1 0 0 0 1.5-2V5.7c0-1-1-1.7-1.9-1.3l-3 1.1c-.5.2-1.1.2-1.6 0l-3-1.1a2.1 2.1 0 0 0-1.2-.1z"/>
      <path d="M9.6 4.6v12.9M14.4 6.5v12.9" opacity=".5"/>
    </svg>
  ),
  Bell: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2a5.9 5.9 0 0 0-5.9 5.9c0 3.2-.75 4.5-1.55 5.5-.5.62-.06 1.6.74 1.6h13.42c.8 0 1.24-.98.74-1.6-.8-1-1.55-2.3-1.55-5.5A5.9 5.9 0 0 0 12 3.2z"/>
      <path d="M10.2 20.3a2 2 0 0 0 3.6 0"/>
    </svg>
  ),
  Search: (p) => {
    const filled = p.fill && p.fill !== 'none';
    return (
      <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||MUTED} strokeWidth={filled ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6.4" fill={filled ? p.fill : 'none'}/>
        {filled && <circle cx="11" cy="11" r="2.6" fill="#fff" stroke="none"/>}
        <path d="M20.3 20.3l-4-4"/>
      </svg>
    );
  },
  Sliders: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="9" cy="6" r="2.2" fill="#fff"/>
      <circle cx="15" cy="12" r="2.2" fill="#fff"/>
      <circle cx="8" cy="18" r="2.2" fill="#fff"/>
    </svg>
  ),
  Heart: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill={p.fill||'none'} stroke={p.color||'#fff'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-4.5-9-9.5C1.5 7.5 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 22.5 7.5 21 11.5c-2 5-9 9.5-9 9.5z"/>
    </svg>
  ),
  Pin: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||MUTED} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.2c4.1-3.9 6.6-7.4 6.6-10.5a6.6 6.6 0 1 0-13.2 0c0 3.1 2.5 6.6 6.6 10.5z"/>
      <circle cx="12" cy="10.5" r="2.3"/>
    </svg>
  ),
  Clock: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||MUTED} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M12 7.7V12l2.7 1.8"/>
    </svg>
  ),
  Star: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill={p.fill||PINK} stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  // Category icons — same family, filled bottom + stroke
  Fork: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4 L9 12 C9 13.5 10 14 11.5 14 L11.5 28"/>
      <path d="M13 4 L13 11"/>
      <path d="M7 4 L7 11"/>
      <path d="M22 4 C19.5 4 18.5 6.5 18.5 10 C18.5 13 19.5 14.5 22 14.5 L22 28"/>
    </svg>
  ),
  Pizza: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4 L28 24 C24 27 20 28 16 28 C12 28 8 27 4 24 Z"/>
      <circle cx="12" cy="18" r="1.6" fill={p.color||TEXT}/>
      <circle cx="19" cy="16" r="1.6" fill={p.color||TEXT}/>
      <circle cx="16" cy="22" r="1.6" fill={p.color||TEXT}/>
    </svg>
  ),
  Cocktail: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6 L27 6 L16 19 Z"/>
      <line x1="16" y1="19" x2="16" y2="27"/>
      <line x1="11" y1="27" x2="21" y2="27"/>
      <circle cx="22" cy="4" r="1.5" fill={p.color||TEXT}/>
    </svg>
  ),
  Beer: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="10" width="13" height="18" rx="1.5"/>
      <path d="M20 13 L25 13 C26 13 26.5 14 26.5 15 L26.5 22 C26.5 23 26 24 25 24 L20 24"/>
      <path d="M9 10 C7 7 10 4 12 5.5 C13 3 17 4 17 7 C19 6 21 8 19.5 10"/>
    </svg>
  ),
  Sushi: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="16" cy="20" rx="11" ry="3.2"/>
      <ellipse cx="16" cy="16" rx="11" ry="3.2"/>
      <circle cx="16" cy="13" r="3.5" fill={p.color||TEXT}/>
    </svg>
  ),
  Burger: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13 C4 8 9 5 16 5 C23 5 28 8 28 13 Z"/>
      <path d="M4 17 L28 17"/>
      <path d="M4 21 C5 22 7 22 8 21 C9 22 11 22 12 21 C13 22 15 22 16 21 C17 22 19 22 20 21 C21 22 23 22 24 21 C25 22 27 22 28 21 L28 24 C28 26 26 27 24 27 L8 27 C6 27 4 26 4 24 Z"/>
    </svg>
  ),
  Gelato: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 13 C9 7 13 4 16 4 C19 4 23 7 23 13 Z"/>
      <path d="M9 13 L16 28 L23 13 Z"/>
      <circle cx="13" cy="9" r="0.8" fill={p.color||TEXT}/>
      <circle cx="18" cy="11" r="0.8" fill={p.color||TEXT}/>
    </svg>
  ),
  Sandwich: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9 L27 9 L23 13 L9 13 Z"/>
      <path d="M9 13 L23 13 L25 17 L7 17 Z"/>
      <path d="M7 17 L25 17 L23 21 L9 21 Z"/>
      <path d="M9 21 L23 21 L26 25 L6 25 Z"/>
    </svg>
  ),
  Brunch: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14 L19 14 C19 18 16 21 12 21 C8 21 5 18 5 14 Z"/>
      <path d="M19 16 L23 16 C25 16 26 17 26 18.5 C26 20 25 21 23 21 L19 21"/>
      <path d="M9 6 C9 8 7 8 7 10 M13 6 C13 8 11 8 11 10 M17 6 C17 8 15 8 15 10"/>
    </svg>
  ),
  Leaf: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 26 C6 14 14 6 26 6 C26 18 18 26 6 26 Z"/>
      <path d="M6 26 L18 14"/>
    </svg>
  ),
  Wheat: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16" y1="4" x2="16" y2="28"/>
      <path d="M16 9 C13 9 11 11 11 14 C14 14 16 12 16 9 Z M16 9 C19 9 21 11 21 14 C18 14 16 12 16 9 Z"/>
      <path d="M16 16 C13 16 11 18 11 21 C14 21 16 19 16 16 Z M16 16 C19 16 21 18 21 21 C18 21 16 19 16 16 Z"/>
      <line x1="6" y1="28" x2="26" y2="28"/>
    </svg>
  ),
  Bowl: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14 L28 14 C28 21 23 27 16 27 C9 27 4 21 4 14 Z"/>
      <circle cx="11" cy="11" r="1.5" fill={p.color||TEXT}/>
      <circle cx="16" cy="9" r="1.5" fill={p.color||TEXT}/>
      <circle cx="21" cy="11" r="1.5" fill={p.color||TEXT}/>
    </svg>
  ),
  Home: (p) => (
    <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill={p.fill||'none'} stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 10.9c0-.95.45-1.85 1.21-2.42l4.5-3.38a3 3 0 0 1 3.58 0l4.5 3.38a3.03 3.03 0 0 1 1.21 2.42v5.6a3.5 3.5 0 0 1-3.5 3.5H8a3.5 3.5 0 0 1-3.5-3.5z"/>
      <path d="M12 15.1v2" stroke={p.fill && p.fill !== 'none' ? '#fff' : (p.color||TEXT)}/>
    </svg>
  ),
  User: (p) => {
    const filled = p.fill && p.fill !== 'none';
    return (
      <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill={p.fill||'none'} stroke={p.color||TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8.2" r="3.6"/>
        <path d="M5.3 20.2a6.9 6.9 0 0 1 13.4 0v.9H5.3z" fill={filled ? p.fill : 'none'}/>
      </svg>
    );
  },
  QR: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||'#fff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="8.6" height="8.6" rx="2.8"/>
      <rect x="18.9" y="4.5" width="8.6" height="8.6" rx="2.8"/>
      <rect x="4.5" y="18.9" width="8.6" height="8.6" rx="2.8"/>
      <rect x="7.6" y="7.6" width="2.4" height="2.4" rx="1.1" fill={p.color||'#fff'} stroke="none"/>
      <rect x="22" y="7.6" width="2.4" height="2.4" rx="1.1" fill={p.color||'#fff'} stroke="none"/>
      <rect x="7.6" y="22" width="2.4" height="2.4" rx="1.1" fill={p.color||'#fff'} stroke="none"/>
      <rect x="18.9" y="18.9" width="3.4" height="3.4" rx="1.4" fill={p.color||'#fff'} stroke="none"/>
      <rect x="24.1" y="18.9" width="3.4" height="3.4" rx="1.4" fill={p.color||'#fff'} stroke="none"/>
      <rect x="18.9" y="24.1" width="3.4" height="3.4" rx="1.4" fill={p.color||'#fff'} stroke="none"/>
      <rect x="24.1" y="24.1" width="3.4" height="3.4" rx="1.4" fill={p.color||'#fff'} stroke="none"/>
    </svg>
  ),
  Close: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/>
      <line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  ),
  Check: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||PINK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 10 18 20 6"/>
    </svg>
  ),
};

// ─── Real photo via Unsplash (keyed by image id) ──────────
const PHOTO_BY_TONE = {
  a: 'photo-1414235077428-338989a2e8c0', // restaurant interior
  b: 'photo-1517248135467-4c7edcad34c4', // restaurant terrace
  c: 'photo-1551024709-8f23befc6f87', // cocktail
  d: 'photo-1546069901-ba9599a7e63c', // food
  e: 'photo-1414235077428-338989a2e8c0',
};
// Foto originali + leggero overlay fade brand (wine) in basso: la foto resta protagonista.
function Photo({ src, label, tone = 'a', duotone = true }) {
  const fallback = PHOTO_BY_TONE[tone] || PHOTO_BY_TONE.a;
  const url = src || `https://images.unsplash.com/${fallback}?w=600&q=70&auto=format&fit=crop`;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} aria-label={label}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("${url}")`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#e8d9c9',
      }}/>
      {duotone && <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(77,18,46,0) 55%, rgba(77,18,46,.34) 100%)',
      }}/>}
    </div>
  );
}
const PhotoPlaceholder = Photo; // alias for back-compat

// ─── Category chip ──────────────────────────────────────────

// Rail categorie: icone kawaii brand (mai emoji). `id` deve matchare BK.ASSETS.cat.
function Category({ id, icon: I, art: Art, emoji, label, active, onClick }) {
  const [T] = BK.useByupTheme();
  const src = BK.ASSETS.cat[id];
  return (
    <button className="bk-press" onClick={() => { BK.haptic.selection(); onClick?.(); }} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      flex: '0 0 auto', width: 72, fontFamily: 'inherit',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 21,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active
          ? (T.dark ? 'linear-gradient(158deg, #4a2331 0%, #7d1d3f 100%)' : T.accentSoft)
          : (T.dark ? 'linear-gradient(158deg, #3b2530 0%, #5a1a30 52%, #7a1c3e 100%)' : T.surface),
        border: `1.5px solid ${active ? T.primary : (T.dark ? 'rgba(239,99,137,.42)' : T.line)}`,
        transition: `all 0.25s ${BK.SPRING}`,
        boxShadow: active
          ? (T.dark ? '0 10px 24px -10px rgba(239,99,137,.5)' : T.shadow)
          : (T.dark ? '0 8px 20px -12px rgba(122,28,62,.6)' : T.shadowSoft),
        transform: active ? 'scale(1.07)' : 'scale(1)',
      }}>
        {src
          ? <img src={src} width="44" height="44" alt="" loading="lazy" draggable={false}/>
          : emoji ? <span style={{ fontSize: 30, lineHeight: 1 }}>{emoji}</span>
          : Art ? <Art size={56}/> : I ? <I size={28} color={T.primary}/> : null}
      </div>
      <span style={{
        fontFamily: BK.TYPE.sans, fontSize: 12, fontWeight: active ? 700 : 600,
        color: active ? T.primary : T.textDim, whiteSpace: 'nowrap',
      }}>{label}</span>
    </button>
  );
}

// ─── Favorite card (compact, horizontal) ────────────────────
function FavoriteCard({ name, type, tone, photo, distance, hours, openHour, closeHour, open, premium, onClick, onUnfav }) {
  // hours can be 'HH:MM – HH:MM' format; split in two
  const [oh, ch] = (hours && hours.includes('–'))
    ? hours.split('–').map(s => s.trim())
    : [openHour || '–', closeHour || hours || '–'];
  const [T] = BK.useByupTheme();
  return (
    <button className="bk-press" onClick={() => { BK.haptic.light(); onClick?.(); }} style={{
      flex: '0 0 auto', width: 150, borderRadius: 20, overflow: 'hidden',
      position: 'relative', border: `1px solid ${T.line}`, padding: 0, cursor: 'pointer',
      background: T.surface, boxShadow: T.shadowSoft,
      fontFamily: BK.TYPE.sans, textAlign: 'left',
    }}>
      <div style={{ height: 100, position: 'relative' }}>
        <Photo src={photo} label={name} tone={tone}/>
        {premium && (
          <span style={{
            position: 'absolute', top: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 3,
            background: 'linear-gradient(180deg,#ffe27a,#f0c246)', color: '#3d2c00',
            fontSize: 9, fontWeight: 800, letterSpacing: .4, textTransform: 'uppercase',
            padding: '3.5px 8px', borderRadius: 999, boxShadow: '0 5px 12px -5px rgba(190,145,40,.7)',
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#3d2c00"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Premium
          </span>
        )}
        <span role="button" tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onUnfav?.(); }} style={{
          position: 'absolute', top: 8, right: 8, width: 28, height: 28,
          borderRadius: 999, background: 'rgba(227,36,89,0.78)',
          border: '1px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px) saturate(160%)', WebkitBackdropFilter: 'blur(8px) saturate(160%)',
          boxShadow: '0 4px 10px -2px rgba(227,36,89,.5)',
        }}>
          <Icon.Heart size={15} fill="rgba(255,255,255,0.92)" color="rgba(255,255,255,0.92)"/>
        </span>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontFamily: BK.TYPE.display, fontSize: 14.5, fontWeight: 600, color: T.text, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{type}</span>
          <span>·</span>
          <Icon.Pin size={10}/>
          <span>{distance}</span>
        </div>
        <div style={{ fontSize: 11, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: open ? '#0a8a3a' : T.primary,
            boxShadow: open ? '0 0 6px rgba(10,138,58,.5)' : 'none' }}/>
          <span style={{ color: open ? '#0a8a3a' : T.primary, fontWeight: 700 }}>{open ? (window.byupCucinaChiusaPer && window.byupCucinaChiusaPer(name) ? 'Aperto · cucina chiusa' : 'Aperto') : 'Chiuso'}</span>
        </div>
        <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>
          <span>{oh} – {ch}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Detail sheet (slide-up preview) ─────────────────────────
// Tap once on a card → opens this preview. Tap again on the photo (or
// the chevron in the photo) → go to the full venue screen.
// The two CTAs are Menù and Prenota, mirroring the venue screen.
function DetailSheet({ item, onClose, onOpenVenue, onMenu, onBook }) {
  if (!item) return null;
  const photo = item.photo;
  const tone = item.tone;
  const place = item.place || [item.cat, item.distance].filter(Boolean).join(' · ');
  const rating = item.rating || 4.7;
  const price = item.price || '€€';
  const distance = item.distance || '1.2 km';
  const open = item.open !== false;
  const closeAt = (item.hours && item.hours.includes('–'))
    ? item.hours.split('–')[1]?.trim() : '23:30';
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 50, animation: 'fade 0.25s ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 51,
        background: SURF, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '12px 20px 24px', animation: 'slideUp 0.3s cubic-bezier(.2,.8,.2,1)',
        maxHeight: '82%', overflow: 'hidden',
      }}>
        <div style={{ width: 40, height: 4, background: '#d0d0d0', borderRadius: 2, margin: '4px auto 14px' }}/>
        {/* Tap photo → go to venue */}
        <div onClick={onOpenVenue} style={{
          height: 170, borderRadius: 16, overflow: 'hidden', position: 'relative',
          marginBottom: 14, cursor: 'pointer',
        }}>
          {photo
            ? <img src={photo} alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            : <PhotoPlaceholder label={item.title?.toLowerCase() || 'locale'} tone={tone}/>}
          <div style={{
            position: 'absolute', right: 12, bottom: 12,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Apri vetrina
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 22, fontWeight: 600, color: TEXT }}>{item.title || item.name}</div>
          <button onClick={(e) => e.stopPropagation()} style={{
            width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${BORDER}`,
            background: SURF, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Icon.Heart color={PINK}/>
          </button>
        </div>
        <div style={{ fontSize: 14.5, color: MUTED, marginBottom: 12 }}>{place}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <Tag><Icon.Star size={12}/> {rating}</Tag>
          <Tag>{price}</Tag>
          <Tag><Icon.Pin size={12}/> {distance}</Tag>
          {open
            ? <Tag style={{ color: '#0a8a3a' }}>Aperto · chiude alle {closeAt}{window.byupCucinaChiusaPer && window.byupCucinaChiusaPer(item.title || item.name) ? ' · cucina chiusa' : ''}</Tag>
            : <Tag style={{ color: '#aa2222' }}>Chiuso</Tag>}
        </div>
        <div style={{ fontSize: 13.5, color: '#3a3a3a', lineHeight: 1.5, marginBottom: 16 }}>
          {item.date
            ? `Evento ${item.date.day} ${item.date.month}${item.time ? ` · ore ${item.time}` : ''}. Tap sulla foto per aprire la vetrina del locale.`
            : 'Tap sulla foto o sul pulsante per aprire la vetrina del locale.'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBook} className="bk-press" style={{
            flex: 1, height: 50, borderRadius: 999, border: '1.5px solid rgba(227,36,89,.25)',
            background: 'rgba(227,36,89,.08)', color: PINK, fontSize: 15, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>Prenota</button>
          <button onClick={onMenu} className="bk-press" style={{
            flex: 1.2, height: 50, borderRadius: 999, border: 'none',
            background: PINK, color: '#fff', fontSize: 15, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: '0 12px 26px -10px rgba(227,36,89,.55)',
          }}>Menù</button>
        </div>
      </div>
    </>
  );
}
function Tag({ children, style }) {
  return (
    <span style={{
      fontSize: 12.5, padding: '5px 10px', borderRadius: 999,
      background: BG_GRAY, color: TEXT, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      ...style,
    }}>{children}</span>
  );
}

// ─── Filter sheet (Tutti i filtri) ──────────────────────────
function FilterSheet({ open, onClose, filters, setFilters }) {
  if (!open) return null;
  const diets = ['Vegetariano', 'Vegano', 'Per celiaci'];
  const dists = ['0-3 km', '3-5 km', '5-10 km', '10-15 km', '30-50 km'];
  const slots = ['12 – 14', '14 – 16', '18 – 20', '20 – 22'];
  const prices = ['€', '€€', '€€€', '€€€€'];
  const minRating = filters.minRating || 0;
  const reset = () => setFilters({});
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 70,
        animation: 'fade 0.2s ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: SURF, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '12px 22px 24px', animation: 'slideUp 0.3s cubic-bezier(.2,.8,.2,1)',
        maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#d0d0d0', borderRadius: 2, margin: '4px auto 14px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={reset} style={{
            background: 'none', border: 'none', color: MUTED,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
          }}>Reset</button>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 17, fontWeight: 600, color: TEXT }}>Filtra per tipologia</div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontFamily: 'inherit',
            fontSize: 18, fontWeight: 700, color: TEXT,
          }}>×</button>
        </div>

        <FilterGroup title="Tipo dieta">
          {diets.map(d => (
            <SelectChip key={d} label={d} active={(filters.diets||[]).includes(d)}
              onClick={() => setFilters(f => {
                const cur = f.diets||[];
                return { ...f, diets: cur.includes(d) ? cur.filter(x=>x!==d) : [...cur, d] };
              })}/>
          ))}
        </FilterGroup>

        <FilterGroup title="Distanza da te">
          {dists.map(d => (
            <SelectChip key={d} label={d} active={filters.distance === d}
              onClick={() => setFilters(f => ({ ...f, distance: f.distance === d ? null : d }))}/>
          ))}
        </FilterGroup>

        <FilterGroup title="Valutazione minima">
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === n ? 0 : n }))}
                style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={n <= minRating ? PINK : '#e0d8db'}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Fascia oraria">
          {slots.map(s => (
            <SelectChip key={s} label={s} active={filters.slot === s}
              onClick={() => setFilters(f => ({ ...f, slot: f.slot === s ? null : s }))}/>
          ))}
        </FilterGroup>

        <FilterGroup title="Prezzo">
          {prices.map(p => (
            <SelectChip key={p} label={p} active={filters.price === p}
              onClick={() => setFilters(f => ({ ...f, price: f.price === p ? null : p }))}/>
          ))}
        </FilterGroup>

        <button onClick={onClose} style={{
          width: '100%', height: 52, borderRadius: 999, border: 'none',
          background: PINK, color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer', marginTop: 8,
        }}>Continua</button>
      </div>
    </>
  );
}
function FilterGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}
function SelectChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 38, padding: '0 16px', borderRadius: 999,
      border: `1.5px solid ${active ? PINK : '#e0e0e0'}`,
      background: active ? TINT : SURF,
      color: active ? PINK : TEXT,
      fontSize: 14, fontWeight: active ? 600 : 500,
      fontFamily: 'inherit', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {active && <Icon.Check size={14} color={PINK}/>}
      {label}
    </button>
  );
}

// ─── Notifications panel ────────────────────────────────────
function NotifSheet({ open, onClose }) {
  if (!open) return null;
  const items = [
    { icon: BK.ASSETS.cat.pizza,    title: 'Al Settembrini', text: 'Ha pubblicato un nuovo menu di stagione', time: '2h' },
    { icon: BK.ASSETS.hero.spritz,  title: 'Promo lampo', text: '-30% da Mario fino alle 22', time: '5h' },
    { icon: BK.ASSETS.hero.froyo,   title: 'Nuova recensione', text: 'Hai ricevuto una risposta', time: '1g' },
    { icon: BK.ASSETS.cat.brunch,   title: 'Promemoria', text: 'Cena prenotata domani alle 20:30', time: '1g' },
  ];
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 70,
        animation: 'fade 0.2s ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: SURF, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 20px', animation: 'slideUp 0.3s cubic-bezier(.2,.8,.2,1)',
        maxHeight: '70%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#d0d0d0', borderRadius: 2, margin: '4px auto 14px' }}/>
        <div style={{ padding: '0 20px 12px', fontFamily: BK.TYPE.display, fontSize: 20, fontWeight: 600, color: TEXT }}>Notifiche</div>
        {items.map((n, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '12px 20px', borderTop: `1px solid ${BORDER}`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14, background: BG_GRAY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}><img src={n.icon} width="26" height="26" alt=""/></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>{n.title}</div>
                <div style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>{n.time}</div>
              </div>
              <div style={{ fontSize: 13.5, color: MUTED, marginTop: 2 }}>{n.text}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Schermata categoria: tutti i locali della categoria, 2 per riga ───
const CAT_SCREEN_PHOTOS = {
  pizza:     ['1565299624946-b28f40a0ae38', '1593560708920-61dd98c46a4e'],
  burger:    ['1555949258-eb67b1ef0ceb', '1558030006-450675393462', '1504674900247-0877df9cc836'],
  aperitivo: ['1470337458703-46ad1756a187', '1551024709-8f23befc6f87', '1510812431401-41d2bd2722f3'],
  poke:      ['1546069901-ba9599a7e63c', '1504674900247-0877df9cc836', '1497034825429-c343d7c6a68f'],
  panini:    ['1555949258-eb67b1ef0ceb', '1529042410759-befb1204b468', '1550507992-eb63ffee0847'],
  birra:     ['1571877227200-a0d98ea607e9', '1546069901-ba9599a7e63c', '1470124182917-cc6e71b22ecc'],
  dolce:     ['1488477181946-6428a0291777', '1621506289937-a8e4df240d0b', '1572695157366-5e585ab2b69f'],
  vino:      ['1510812431401-41d2bd2722f3', '1414235077428-338989a2e8c0', '1555396273-367ea4eb4db5'],
  taco:      ['1504674900247-0877df9cc836', '1546833999-b9f581a1996d', '1497034825429-c343d7c6a68f'],
  brunch:    ['1621996346565-e3dbc646d9a9', '1572695157366-5e585ab2b69f', '1517248135467-4c7edcad34c4'],
  cocktail:  ['1579584425555-c3ce17fd4351', '1553621042-f6e147245754', '1563379926898-05f4575a45d8'],
  torta:     ['1621303837174-89787a7d4729', '1621506289937-a8e4df240d0b', '1488477181946-6428a0291777'],
};
const CAT_SCREEN_NAMES = {
  pizza:     ['Da Michele', "L'Angolo della Pizza", 'Forno 900', 'La Ruota', 'Margherita Lab', 'Napule'],
  burger:    ['Butcher & Bun', 'Smash Corner', 'Grill 22', 'Holy Burger', 'Officina Burger', 'Bun Appetit'],
  aperitivo: ['Lounge 22', 'Terrazza Fiore', 'Spritzeria', 'Bar Duomo', 'Giardino 8', 'Aperolandia'],
  poke:      ['Poke House', 'Aloha Bowl', 'Wave Poke', 'Isola Verde', 'Ohana', 'Tiki Bowl'],
  panini:    ['Pane & Co', 'Schiaccia', 'Il Paninaro', 'Morso', 'Bottega 12', 'StreetBread'],
  birra:     ['Hops & Co', 'Luppolo', 'Birrificio 21', 'La Spina', 'Craft Corner', 'Mastro Birraio'],
  dolce:     ['Dolce Vita', 'Pasticceria Rosa', 'Zucchero', 'Cannolo Bar', 'Frolla', 'Tiramisù Lab'],
  vino:      ['Vinaio', 'Enoteca 33', 'Calice', 'Barrique', 'Rosso di Sera', 'La Cantinetta'],
  taco:      ['Taco Loco', 'Cantina Roja', 'El Paso', 'Frida', 'Azteca', 'Picante'],
  brunch:    ['Morning Glory', 'Brunchetteria', 'Uovo', 'Le 11', 'Butter', 'Sunday Club'],
  cocktail:  ['Sushi Zen', 'Kanpai', 'Sakura', 'Umami', 'Kaiten', 'Hokkaido'],
  torta:     ['Torteria', 'La Fetta', 'Chiffon', 'Madame Gateau', 'Pan di Spagna', 'Crema & Cacao'],
};
function CategoryScreen({ cat, onBack, onOpenVenue }) {
  const [T] = BK.useByupTheme();
  const icon = BK.ASSETS.cat[cat.id];
  const [chip, setChip] = useState(null); // null | 'open' | 'top' | 'near'
  const names = CAT_SCREEN_NAMES[cat.id] || CAT_SCREEN_NAMES.pizza;
  const photos = (CAT_SCREEN_PHOTOS[cat.id] || CAT_SCREEN_PHOTOS.pizza)
    .map(id => `https://images.unsplash.com/photo-${id}?w=600&q=70&auto=format&fit=crop`);
  const venues = names.map((n, i) => ({
    name: n, photo: photos[i % photos.length], cuisine: cat.label,
    distance: (0.3 + i * 0.4).toFixed(1) + ' km',
    rating: (4.2 + ((i * 7) % 8) / 10).toFixed(1),
    price: ['€€', '€', '€€€'][i % 3],
    open: i % 4 !== 3,
  }));
  let list = venues;
  if (chip === 'open') list = venues.filter(v => v.open);
  if (chip === 'top') list = [...venues].sort((a, b) => b.rating - a.rating);
  if (chip === 'near') list = [...venues].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  const Card = ({ v, i, tall }) => (
    <button className="bk-press" onClick={() => { BK.haptic.light(); onOpenVenue(v); }} style={{
      position: 'relative', width: '100%', height: tall ? 236 : 188, borderRadius: 22, overflow: 'hidden',
      border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: BK.TYPE.sans,
      boxShadow: '0 16px 32px -18px rgba(227,36,89,.4)',
      animation: `bkFadeUp 520ms ${i * 70}ms cubic-bezier(.22,.9,.35,1) backwards`,
    }}>
      <Photo src={v.photo} label={v.name}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,6,16,.02) 35%, rgba(28,6,16,.82) 100%)' }}/>
      {/* rating pill */}
      <div style={{ position: 'absolute', top: 9, right: 9, display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,255,255,.92)', borderRadius: 999, padding: '4px 9px',
        fontSize: 11, fontWeight: 800, color: '#1c0f15' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFC839"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        {v.rating}
      </div>
      <div style={{ position: 'absolute', left: 11, right: 11, bottom: 10, color: '#fff' }}>
        <div style={{ fontFamily: BK.TYPE.display, fontSize: 16, fontWeight: 600, lineHeight: 1.12,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textShadow: '0 2px 8px rgba(20,8,12,.5)' }}>{v.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3.5, fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.92)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, flexShrink: 0,
            background: v.open ? '#3ddc7f' : '#ff6b6b', boxShadow: `0 0 6px ${v.open ? '#3ddc7f' : '#ff6b6b'}` }}/>
          <span style={{ flexShrink: 0 }}>{v.open ? (window.byupCucinaChiusaPer && window.byupCucinaChiusaPer(v.name) ? 'Aperto · cucina chiusa' : 'Aperto') : 'Chiuso'}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,.5)', flexShrink: 0 }}/>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.distance} · {v.price}</span>
        </div>
      </div>
    </button>
  );
  const colA = list.filter((_, i) => i % 2 === 0);
  const colB = list.filter((_, i) => i % 2 === 1);
  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, position: 'relative',
      display: 'flex', flexDirection: 'column', fontFamily: BK.TYPE.sans, color: T.text, overflow: 'hidden' }}>
      {/* blob decorativo */}
      <div aria-hidden style={{ position: 'absolute', right: '-25%', top: '-10%', width: '75%', aspectRatio: '1',
        background: 'radial-gradient(circle, rgba(227,36,89,.14) 0%, transparent 65%)', pointerEvents: 'none' }}/>
      <div style={{ padding: '0 18px', paddingTop: 'calc(var(--byup-sat, 54px) + 6px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} className="bk-press" style={{ width: 40, height: 40, borderRadius: 999,
            border: `1px solid ${T.line}`, background: T.surface, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: BK.TYPE.display, fontWeight: 600, fontSize: 24, margin: 0, lineHeight: 1.05,
              display: 'flex', alignItems: 'center', gap: 8 }}>
              {cat.label}
              {icon && <img src={icon} width="34" height="34" alt="" draggable={false}
                style={{ animation: 'bkFadeUp 600ms 150ms cubic-bezier(.22,.9,.35,1) backwards' }}/>}
            </h1>
            <div style={{ fontSize: 12, color: T.textDim, fontWeight: 700, marginTop: 2 }}>{list.length} locali vicino a te</div>
          </div>
        </div>
        {/* chips filtro */}
        <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
          {[['open', 'Aperti ora'], ['near', 'Più vicini'], ['top', 'Top rated']].map(([id, lb]) => (
            <button key={id} onClick={() => { BK.haptic.selection(); setChip(c => c === id ? null : id); }} style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', transition: 'all .25s',
              background: chip === id ? T.primary : T.surface,
              color: chip === id ? '#fff' : T.textDim,
              border: `1px solid ${chip === id ? T.primary : T.line}`,
            }}>{lb}</button>
          ))}
        </div>
      </div>
      {/* griglia 2 colonne sfalsate */}
      <div className="byp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px calc(120px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {colA.map((v, i) => <Card key={v.name} v={v} i={i * 2} tall={i % 2 === 0}/>)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
            {colB.map((v, i) => <Card key={v.name} v={v} i={i * 2 + 1} tall={i % 2 === 1}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home sections (shared body) ────────────────────────────
// The body of the Home: greeting, search, quick filters, categories,
// favourites, events, promos, suggestions. Used both by the standalone
// Home page (App) and by the "Home + active order" screen in menu.jsx.
//
// ─── Booking Home Card (rendered above the home greeting) ─────
// Mirrors the ActiveOrderCard pattern: collapsible banner with eyebrow,
// venue, date/time + covers pill, and CTAs. Uses a soft tonal background
// (warm sand) so a future booking reads as informative, not urgent.
function BookingHomeCard({ booking, onModify, onScanQr }) {
  if (!booking) return null;
  const [expanded, setExpanded] = React.useState(true);

  // Tone palette — warm sand / clay, pleasant on a busy home
  const SAND_BG = '#fae3de';      // cream brand
  const SAND_ACCENT = '#4d122e';  // wine brand
  const SAND_PILL_BG = '#f3cdc4';
  const SAND_BORDER = '#eebfb4';

  return (
    <div style={{
      margin: '0 12px 14px',
      borderRadius: 22, overflow: 'hidden',
      background: SAND_BG,
      border: `1px solid ${SAND_BORDER}`,
      position: 'relative',
    }}>
      {/* subtle sheen, copies ActiveOrderCard's visual rhythm but lighter */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 200, height: 200,
        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.55), transparent 60%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ padding: '14px 16px 14px', position: 'relative' }}>
        {/* Top row: eyebrow on left, covers + chevron on right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, letterSpacing: 0.5, color: SAND_ACCENT, textTransform: 'uppercase' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={SAND_ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Prenotazione · {booking.date}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: SAND_PILL_BG,
              padding: '5px 10px 5px 7px', borderRadius: 999,
              fontSize: 12, fontWeight: 700, color: SAND_ACCENT,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={SAND_ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {booking.people} coperti
            </div>
            <button onClick={() => setExpanded(!expanded)} style={{
              width: 30, height: 30, borderRadius: 999, background: SAND_PILL_BG,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SAND_ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {expanded ? <polyline points="6 9 12 15 18 9"/> : <polyline points="18 15 12 9 6 15"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Venue + meta */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: SAND_ACCENT, opacity: 0.85, fontWeight: 600 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={SAND_ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {booking.time}{booking.note ? ` · "${booking.note}"` : ''}
          </div>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 19, fontWeight: 600, marginTop: 2, color: '#4d122e' }}>{booking.venue}</div>
        </div>

        {expanded && (
          <>
            <div style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 14,
              background: 'rgba(255,255,255,0.55)',
              fontSize: 12.5, color: '#4d122e', lineHeight: 1.45,
            }}>
              <span style={{ fontWeight: 700 }}>Quando arrivi al locale</span>, scansiona il QR sul tavolo per associarti e ordinare dall'app insieme ai tuoi coperti.
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onModify && onModify()} style={{
                flex: 1, height: 42, borderRadius: 999, border: `1.5px solid ${SAND_BORDER}`,
                background: 'transparent', color: SAND_ACCENT,
                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}>Modifica</button>
              <button onClick={() => onScanQr && onScanQr()} style={{
                flex: 1.6, height: 42, borderRadius: 999, border: 'none',
                background: SAND_ACCENT, color: '#fff',
                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <path d="M14 14h2v2h-2zM18 14h3M14 18h3M18 18v3"/>
                </svg>
                Scansiona QR del tavolo
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

// ─── Moment-driven home data (the spine of the discovery) ──
const HERO_PHOTO = {
  ora:    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop',
  pranzo: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&q=80&auto=format&fit=crop',
  cena:   'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80&auto=format&fit=crop',
  notte:  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=80&auto=format&fit=crop',
};
const MOMENT_DATA = {
  ora: {
    eyebrow: 'Adesso',
    heroTitle: 'Cosa fare adesso',
    heroSubtitle: '8 locali aperti a piedi, tavolo libero nei prossimi 30 minuti',
    heroCta: 'Vedi disponibili',
    sectionTitle: 'Disponibili adesso',
    sectionSubtitle: 'Prenotabili entro mezz\'ora',
    quickChips: [
      { id: 'walk',  label: 'A piedi' },
      { id: 'promo', label: 'Promo' },
      { id: 'top',   label: '4.5+' },
    ],
    venues: [
      { premium: true, name: 'Al Settembrini', gusti: ['pasta', 'carne'],  cuisine: 'Ristorante',     distance: '0.4 km', rating: 4.5, price: '€€€',
        badge: 'A piedi · 5 min',  photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '20:00' }, { time: '20:30' }, { time: '21:00', last: true }] },
      { name: 'Trattoria Lucia', gusti: ['pasta', 'carne'], cuisine: 'Cucina romana',  distance: '0.6 km', rating: 4.8, price: '€€',
        badge: 'Top rated',        photo: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '20:30' }, { time: '21:00' }, { time: '21:30' }] },
      { name: 'Lounge 22', gusti: ['aperitivo'],       cuisine: 'Cocktail bar',   distance: '1.1 km', rating: 4.4, price: '€€',
        badge: 'Aperto fino tardi', photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=70&auto=format&fit=crop',
        slots: false },
    ],
  },
  pranzo: {
    eyebrow: 'Pranzo',
    heroTitle: 'Pausa pranzo perfetta',
    heroSubtitle: 'Locali aperti con menu del giorno, tavolo subito',
    heroCta: 'Trova tavolo',
    sectionTitle: 'Per pranzo',
    sectionSubtitle: 'Tavolo libero entro 30 minuti',
    quickChips: [
      { id: 'quick', label: 'Pranzo veloce' },
      { id: 'menu',  label: 'Menu fisso' },
      { id: 'near',  label: '< 1 km' },
    ],
    venues: [
      { name: 'Trattoria Lucia', gusti: ['pasta', 'carne'], cuisine: 'Menu del giorno · 15€', distance: '0.6 km', rating: 4.8, price: '€€',
        badge: 'Veloce',           photo: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '12:30' }, { time: '13:00' }, { time: '13:30' }] },
      { name: 'Vinaio', gusti: ['aperitivo', 'brunch'],          cuisine: 'Wine bar · panini',    distance: '0.9 km', rating: 4.7, price: '€',
        badge: 'A piedi',          photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70&auto=format&fit=crop',
        slots: false },
      { premium: true, name: 'Al Settembrini', gusti: ['pasta', 'carne'],  cuisine: 'Ristorante',           distance: '0.4 km', rating: 4.5, price: '€€€',
        badge: 'Top rated',        photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '13:00' }, { time: '13:30' }, { time: '14:00' }] },
    ],
  },
  cena: {
    eyebrow: 'Stasera',
    heroTitle: 'La cena giusta per stasera',
    heroSubtitle: 'I migliori della tua zona con tavolo libero',
    heroCta: 'Vedi disponibili',
    sectionTitle: 'Stasera per te',
    sectionSubtitle: 'Tavolo prenotabile subito',
    quickChips: [
      { id: 'book',     label: 'Prenotabile' },
      { id: 'romantic', label: 'Romantico' },
      { id: 'italian',  label: 'Cucina italiana' },
      { id: 'view',     label: 'Con vista' },
    ],
    venues: [
      { name: "All'Impronta", gusti: ['pesce', 'carne'],   cuisine: 'Ristorante creativo', distance: '0.8 km', rating: 4.6, price: '€€€',
        badge: 'Suggerito per te',  photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '20:00' }, { time: '20:30' }, { time: '21:00', last: true }] },
      { premium: true, name: 'Al Settembrini', gusti: ['pasta', 'carne'], cuisine: 'Ristorante',          distance: '0.4 km', rating: 4.5, price: '€€€',
        badge: 'Vicino a te',       photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '20:30' }, { time: '21:00' }, { time: '21:30' }] },
      { name: 'Trattoria Lucia', gusti: ['pasta', 'carne'],cuisine: 'Cucina romana',       distance: '0.6 km', rating: 4.8, price: '€€',
        badge: 'Top rated',         photo: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '21:00' }, { time: '21:30' }, { time: '22:00' }] },
    ],
  },
  notte: {
    eyebrow: 'Notte',
    heroTitle: 'Tarda serata',
    heroSubtitle: 'Cocktail bar e locali aperti dopo mezzanotte',
    heroCta: 'Apri esplora',
    sectionTitle: 'Stanotte',
    sectionSubtitle: 'Aperto fino a tardi',
    quickChips: [
      { id: 'cocktail', label: 'Cocktail' },
      { id: 'late',     label: 'Fino a tardi' },
      { id: 'live',     label: 'Live music' },
      { id: 'roof',     label: 'Terrazza' },
    ],
    venues: [
      { name: 'Lounge 22', gusti: ['aperitivo'], cuisine: 'Cocktail bar',           distance: '1.1 km', rating: 4.4, price: '€€',
        badge: 'Live music',          photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '22:00' }, { time: '22:30' }, { time: '23:00' }] },
      { name: 'Blue Note', gusti: ['aperitivo'], cuisine: 'Jazz club · cocktail',   distance: '1.0 km', rating: 4.7, price: '€€€',
        badge: 'Jazz live stasera',   photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '22:00' }, { time: '23:00', last: true }] },
      { name: 'Hops & Co', cuisine: 'Pub · birre artigianali', distance: '1.5 km', rating: 4.3, price: '€€',
        badge: 'Aperto fino 02:00',   photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=70&auto=format&fit=crop',
        slots: [{ time: '22:30' }, { time: '23:00' }, { time: '23:30' }] },
    ],
  },
};

// Segmented control that drives the entire home — the "spine".
// Icone byup (mai emoji) accanto alla label attiva.
const MOMENT_ICON = {
  ora:    () => 'assets/icon-watermelon.png',
  pranzo: () => BK.ASSETS.cat.panini,
  cena:   () => BK.ASSETS.cat.pizza,
  notte:  () => 'assets/icon-popcorn.png',
};
function MomentBar({ moment, setMoment }) {
  const [T] = BK.useByupTheme();
  const items = [
    { id: 'ora',    label: 'Ora' },
    { id: 'pranzo', label: 'Pranzo' },
    { id: 'cena',   label: 'Cena' },
    { id: 'notte',  label: 'Notte' },
  ];
  const idx = Math.max(0, items.findIndex(it => it.id === (moment || 'ora')));
  return (
    <div style={{ padding: '0 22px 14px' }}>
      <div style={{
        position: 'relative', display: 'flex',
        background: T.surface, border: `1px solid ${T.line}`,
        borderRadius: 999, padding: 4, boxShadow: T.shadowSoft,
      }}>
        {/* bolla che scivola — smooth & spring */}
        <div aria-hidden style={{
          position: 'absolute', top: 4, bottom: 4, left: 4,
          width: 'calc((100% - 8px) / 4)',
          transform: `translateX(${idx * 100}%)`,
          background: T.primary, borderRadius: 999,
          transition: `transform 460ms ${BK.SPRING}`,
          boxShadow: '0 8px 18px -6px rgba(227,36,89,.5)',
        }}/>
        {items.map(it => {
          const active = (moment || 'ora') === it.id;
          return (
            <button key={it.id}
              onClick={() => { BK.haptic.selection(); setMoment(it.id); }} style={{
              flex: 1, height: 36, borderRadius: 999, border: 'none',
              background: 'transparent', position: 'relative', zIndex: 1,
              color: active ? T.onPrimary : T.textDim,
              fontSize: 13, fontWeight: 700, fontFamily: BK.TYPE.sans, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              transition: 'color 260ms ease', whiteSpace: 'nowrap',
            }}>
              {active && <img src={MOMENT_ICON[it.id]?.()} width="18" height="18" alt="" draggable={false}
                style={{ animation: `bkPopIn 380ms ${BK.SPRING} backwards` }}/>}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Mini banner momento — icona · targhetta · copy · countdown · CTA "Scopri".
const HERO_COPY = { ora: 'Tavolo subito', pranzo: 'Pausa pranzo', cena: 'Stasera fuori?', notte: 'Dopo cena' };
const HERO_SUB = { ora: '8 locali liberi vicino a te', pranzo: 'Menu del giorno attivi', cena: 'I tavoli migliori volano', notte: 'Cocktail e live in corso' };
const HERO_END_HOUR = { ora: null, pranzo: 15, cena: 23, notte: 5 };
function useMomentCountdown(moment) {
  const target = useMemo(() => {
    const now = new Date();
    const endH = HERO_END_HOUR[moment];
    const t = new Date(now);
    if (endH == null) { t.setMinutes(now.getMinutes() + 45); }
    else { t.setHours(endH, 0, 0, 0); if (t <= now) t.setDate(t.getDate() + 1); }
    return t.getTime();
  }, [moment]);
  const [left, setLeft] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const tot = Math.max(0, Math.floor(left / 1000));
  const h = Math.floor(tot / 3600), m = Math.floor((tot % 3600) / 60), sec = tot % 60;
  const pad = (x) => String(x).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
function HeroIntentCard({ data, photo, moment, onCta }) {
  const [T] = BK.useByupTheme();
  const countdown = useMomentCountdown(moment);
  const icon = MOMENT_ICON[moment] ? MOMENT_ICON[moment]() : BK.ASSETS.hero.coffee;
  return (
    <div className="bk-press" onClick={() => { BK.haptic.light(); onCta?.(); }} style={{
      margin: '4px 18px 0', borderRadius: 20, cursor: 'pointer',
      background: T.surface, border: `1px solid ${T.line}`, boxShadow: T.shadowSoft,
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      animation: `bkFadeUp 420ms ${BK.EASE_OUT}`,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 15, background: T.accentSoft,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <img src={icon} width="32" height="32" alt="" draggable={false}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: .8,
          textTransform: 'uppercase', color: T.primary, background: T.accentSoft,
          border: `1px solid ${T.accentBorder}`, padding: '3px 8px', borderRadius: 999,
          fontFamily: BK.TYPE.sans,
        }}>{data.eyebrow}</span>
        <div style={{
          fontFamily: BK.TYPE.display, fontSize: 17, fontWeight: 600, color: T.text,
          marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{HERO_COPY[moment] || data.heroTitle}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, minWidth: 0 }}>
          <span style={{ fontSize: 11.5, color: T.textDim, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{HERO_SUB[moment]}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
            background: '#ceff00', color: '#141414', fontSize: 10.5, fontWeight: 800,
            padding: '2px 8px', borderRadius: 999, fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l2.8 1.8"/></svg>
            {countdown}
          </span>
        </div>
      </div>
      <div style={{
        background: T.primary, color: '#fff', fontFamily: BK.TYPE.sans,
        fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 999,
        boxShadow: T.shadow, flexShrink: 0,
      }}>Scopri</div>
    </div>
  );
}

// Dominant venue card — big photo, name, price, cuisine, inline bookable slots.
function RestaurantBigCard({ name, cuisine, distance, rating, price, photo, slots, badge, premium, onClick, onSlotClick }) {
  const [T] = BK.useByupTheme();
  if (premium) return <PremiumBigCard {...{ name, cuisine, distance, rating, price, photo, slots, onClick, onSlotClick }}/>;
  const hasSlots = slots && slots.length > 0;
  return (
    <button className="bk-press" onClick={() => { BK.haptic.light(); onClick?.(); }} style={{
      position: 'relative', display: 'block', width: '100%', height: hasSlots ? 272 : 236,
      borderRadius: BK.RADII.card, overflow: 'hidden', border: `1px solid ${T.line}`,
      padding: 0, boxShadow: T.shadowSoft, textAlign: 'left', cursor: 'pointer', fontFamily: BK.TYPE.sans,
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Photo src={photo} label={name}/>
      </div>
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(20,8,12,.34) 0%, rgba(20,8,12,0) 34%, rgba(20,8,12,.14) 66%, rgba(20,8,12,.4) 100%)' }}/>
      {/* alto: etichetta promo/badge come prima */}
      {badge && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(250,227,222,0.92)', color: '#4d122e',
          fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999,
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        }}>{badge}</div>
      )}
      {/* alto: rating come prima */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: 'rgba(28,6,16,0.55)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        color: '#fff', fontSize: 12, fontWeight: 700,
        padding: '5px 9px', borderRadius: 999,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#ffb3c4">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        {rating.toFixed(1)}
      </div>
      {/* basso: pannello glass con tutte le info */}
      <div style={{ position: 'absolute', left: 9, right: 9, bottom: 9, borderRadius: 20,
        background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(14px) saturate(170%)', WebkitBackdropFilter: 'blur(14px) saturate(170%)',
        padding: '12px 13px', boxShadow: '0 10px 26px -12px rgba(20,8,12,.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: BK.TYPE.display, fontSize: 20, fontWeight: 600, color: '#fff',
              letterSpacing: '-0.01em', lineHeight: 1.15, textShadow: '0 2px 10px rgba(20,8,12,.45)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5,
              fontSize: 12, color: 'rgba(255,255,255,.88)', fontWeight: 600 }}>
              <Icon.Pin size={11} color="#ffd3de"/>
              <span>{distance}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,.5)' }}/>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cuisine}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,.5)' }}/>
              <span style={{ fontFamily: BK.TYPE.display, fontWeight: 600, flexShrink: 0 }}>{price}</span>
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px -6px rgba(20,8,12,.5)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="18" x2="18" y2="6"/><polyline points="9 6 18 6 18 15"/></svg>
          </div>
        </div>
        {hasSlots ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {slots.map((s, i) => (
              <span key={i} className="bk-press"
                onClick={(e) => { e.stopPropagation(); BK.haptic.selection(); onSlotClick?.(s); }} style={{
                height: 32, padding: '0 13px', borderRadius: 999,
                background: 'rgba(255,255,255,0.94)', color: PINK,
                fontSize: 12.5, fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                boxShadow: '0 6px 14px -6px rgba(20,8,12,.45)',
              }}>{s.time}{s.last && <span style={{ marginLeft: 5, fontSize: 10, opacity: .7 }}>ultimo</span>}</span>
            ))}
          </div>
        ) : (slots === false || (slots && slots.length === 0)) ? (
          <div style={{ marginTop: 9, fontSize: 11.5, color: 'rgba(255,255,255,.78)', fontStyle: 'italic' }}>
            Solo walk-in, prenotazione non disponibile</div>
        ) : null}
      </div>
    </button>
  );
}

// Card premium — layout dedicato per i locali Selezione byup: scuro, oro,
// piatto firma in PNG flottante. Ben distinguibile dalle card normali.
function PremiumBigCard({ name, cuisine, distance, rating, price, photo, slots, onClick, onSlotClick }) {
  return (
    <button className="bk-press" onClick={() => { BK.haptic.light(); onClick?.(); }} style={{
      display: 'block', width: '100%', borderRadius: BK.RADII.card, overflow: 'hidden',
      position: 'relative', border: '1.5px solid rgba(214,172,60,.6)', padding: 0,
      background: 'linear-gradient(165deg, #231318 0%, #1a0e13 55%, #2b1608 100%)',
      boxShadow: '0 24px 48px -20px rgba(20,8,4,.65), 0 10px 26px -14px rgba(190,145,40,.4)',
      fontFamily: BK.TYPE.sans, textAlign: 'left', cursor: 'pointer',
    }}>
      <style>{`@keyframes pbcSheen{0%,55%{transform:translateX(-140%) skewX(-16deg)}100%{transform:translateX(280%) skewX(-16deg)}}`}</style>
      <div style={{ height: 152, position: 'relative' }}>
        <Photo src={photo} label={name}/>
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,8,10,.18) 0%, transparent 40%, rgba(26,14,19,.96) 100%)' }}/>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5,
          background: 'linear-gradient(180deg,#ffe27a,#f0c246)', color: '#3d2c00',
          fontSize: 10, fontWeight: 800, letterSpacing: .6, textTransform: 'uppercase',
          padding: '5px 11px', borderRadius: 999, boxShadow: '0 8px 18px -6px rgba(0,0,0,.55)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#3d2c00"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Selezione byup
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(20,8,10,.6)', color: '#ffe27a', fontSize: 12, fontWeight: 800,
          padding: '5px 9px', borderRadius: 999, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#ffe27a"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {rating.toFixed(1)}
        </div>
      </div>
      <div style={{ position: 'relative', padding: '12px 16px 15px', color: '#fff' }}>
        <span aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '34%', height: '100%',
          background: 'linear-gradient(100deg, transparent, rgba(255,226,122,.08), transparent)',
          animation: 'pbcSheen 4.2s ease-in-out infinite', pointerEvents: 'none' }}/>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{name}</div>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 13.5, color: '#ffe27a', fontWeight: 600, flexShrink: 0 }}>{price}</div>
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.62)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{cuisine}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,.35)' }}/>
          <span>{distance}</span>
        </div>
        {slots && slots.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {slots.map((s, i) => (
              <span key={i} className="bk-press"
                onClick={(e) => { e.stopPropagation(); BK.haptic.selection(); onSlotClick?.(s); }} style={{
                height: 34, padding: '0 13px', borderRadius: 999, border: 'none',
                background: 'linear-gradient(180deg,#ffe27a,#f0c246)', color: '#3d2c00',
                fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                boxShadow: '0 8px 18px -8px rgba(240,194,70,.7)',
              }}>{s.time}{s.last && <span style={{ marginLeft: 5, fontSize: 10, opacity: .75 }}>ultimo</span>}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// Drill-in screen for "Vedi disponibili" — full-screen list of moment venues
// with a hero header, sticky chips, and stagger-animated cards.
function DisponibiliScreen({ moment, quickFilters, setQuickFilters, onBack, onMap, onCardClick, onSlotClick }) {
  const md = MOMENT_DATA[moment] || MOMENT_DATA.ora;
  const heroPhoto = HERO_PHOTO[moment] || HERO_PHOTO.ora;
  const venues = md.venues;
  return (
    <div style={{
      width: '100%', height: '100%', background: BG_PAGE,
      position: 'relative', display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT, overflow: 'hidden',
      animation: 'dispoSlide 0.34s cubic-bezier(.2,.8,.2,1)',
    }}>
      <style>{`
        @keyframes dispoSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes dispoCard { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dispoHeroZoom { from { transform: scale(1.08); } to { transform: scale(1); } }
        @keyframes dispoChipIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 126 }}>
        {/* Hero header — photo, eyebrow, title, count */}
        <div style={{ height: 248, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(152deg, #ef5a7d 0%, #d1214f 46%, #8a1c40 100%)',
            animation: 'dispoHeroZoom 0.7s cubic-bezier(.2,.8,.2,1)',
          }}/>
          {/* trama byup leggera + fondo scuro per la leggibilità del testo */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, opacity: .5, mixBlendMode: 'soft-light',
            backgroundImage: `url("${BK.ASSETS.bg.coral}")`, backgroundSize: 'cover', backgroundPosition: 'center',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(28,6,16,0.12) 0%, rgba(28,6,16,0) 40%, rgba(28,6,16,0.55) 100%)',
          }}/>

          <button onClick={onBack} aria-label="Indietro" style={{
            position: 'absolute', top: 60, left: 16,
            width: 40, height: 40, borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button onClick={onMap} style={{
            position: 'absolute', top: 60, right: 16,
            height: 40, padding: '0 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            <Icon.Map size={16} color="#fff"/>
            Mappa
          </button>

          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22, color: '#fff', animation: 'dispoChipIn 0.4s 0.05s both' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8,
              padding: '5px 10px', borderRadius: 999, textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.25)', marginBottom: 10,
            }}>{md.eyebrow}</div>
            <div style={{ fontFamily: BK.TYPE.display, fontSize: 28, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
              {md.sectionTitle}
            </div>
            <div style={{ fontSize: 13.5, opacity: 0.94, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: '#4ade80' }}/>
                {venues.length} locali
              </span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span>{md.sectionSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Venue cards with stagger animation. «Per te» (P-27 · D-28): con
            l'interruttore di P-26 acceso e dei gusti dichiarati, le card si
            ordinano per intersezione fra gusti e tag del locale, e la prima
            riga dice perché; spento, o senza gusti, l'ordine è quello del
            momento. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 18px 0' }}>
          {(() => {
            const attivo = !window.ByupUso || window.ByupUso.suggerimenti();
            const gusti = attivo && window.ByupGusti ? window.ByupGusti.leggi() : [];
            const inter = (v) => (v.gusti || []).filter(g => gusti.includes(g)).length;
            const ordinati = gusti.length ? [...venues].sort((a, b) => inter(b) - inter(a)) : venues;
            return ordinati.map((v, i) => {
              const n = inter(v);
              const perTe = n > 0 ? { ...v, badge: 'Per te · ' + (v.gusti || []).filter(g => gusti.includes(g)).map(g => window.ByupGusti.label(g).toLowerCase()).join(', ') } : v;
              return (
            <div key={`${moment}-${i}`} style={{
              animation: `dispoCard 0.42s cubic-bezier(.2,.8,.2,1) ${0.08 + i * 0.08}s both`,
            }}>
              <RestaurantBigCard {...perTe}
                onClick={() => onCardClick?.({ ...v, title: v.name })}
                onSlotClick={(s) => onSlotClick?.({ ...v, title: v.name, slot: s.time })}/>
            </div>
              );
            });
          })()}

          {/* Footer hint */}
          <div style={{
            margin: '8px 4px 0', fontSize: 12, color: MUTED, textAlign: 'center',
            animation: `dispoCard 0.42s cubic-bezier(.2,.8,.2,1) ${0.08 + venues.length * 0.08}s both`,
          }}>
            Tocca uno slot per prenotare al volo.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Offerte in evidenza — slideshow auto + swipe manuale ───
const OFFER_SLIDES = [5, 1, 3, 4, 6].map(n => `assets/offerte/offer-${n}.webp`);
function OfferCarousel({ onTap }) {
  const [T] = BK.useByupTheme();
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  const pauseRef = useRef(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setInterval(() => {
      if (Date.now() < pauseRef.current) return;
      const slides = Array.from(el.children);
      if (!slides.length) return;
      const w = el.scrollWidth / slides.length;
      const cur = Math.round(el.scrollLeft / w);
      const next = slides[(cur + 1) % slides.length];
      // offset reale della slide: immune da arrotondamenti con zoom/DPR
      el.scrollTo({ left: next.offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    }, 3800);
    return () => clearInterval(t);
  }, []);
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const w = el.scrollWidth / Math.max(1, el.children.length);
    setIdx(Math.max(0, Math.min(OFFER_SLIDES.length - 1, Math.round(el.scrollLeft / w))));
  };
  const pause = () => { pauseRef.current = Date.now() + 5000; };
  return (
    <div style={{ padding: '14px 18px 0', animation: `bkFadeUp 420ms ${BK.EASE_OUT} backwards` }}>
      {/* box a proporzione fissa: niente tagli qualunque sia zoom/scaling */}
      <div ref={ref} className="hscroll" onScroll={onScroll}
        onPointerDown={pause} onTouchStart={pause} onWheel={pause}
        style={{
          display: 'flex', width: '100%', aspectRatio: '16 / 9',
          overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory',
          borderRadius: 14, boxShadow: T.shadowSoft, background: T.surfaceAlt,
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        }}>
        {OFFER_SLIDES.map((src, i) => (
          <div key={i} onClick={() => onTap?.()} style={{
            flex: '0 0 100%', width: '100%', minWidth: '100%', height: '100%',
            scrollSnapAlign: 'start', scrollSnapStop: 'always', position: 'relative', cursor: 'pointer',
          }}>
            <img src={src} alt={`Offerta ${i + 1}`} loading="eager" draggable={false}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
              }}/>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
        {OFFER_SLIDES.map((_, i) => (
          <span key={i} style={{
            width: i === idx ? 16 : 6, height: 6, borderRadius: 999,
            background: i === idx ? T.primary : T.textFaint,
            transition: `all .3s ${BK.SPRING}`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Rail in loop automatico lento — si ferma al tocco, scorrimento manuale ───
function AutoLoopScroll({ children, speed = 26, gap = 12 }) {
  // speed in px/secondo. Accumulatore float: scrollLeft arrotonda, pos no.
  const ref = useRef(null);
  const pausedUntil = useRef(0);
  const pos = useRef(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf; let last = performance.now();
    const step = (now) => {
      const dt = Math.min(64, now - last); last = now;
      const paused = Date.now() < pausedUntil.current;
      if (!paused && el.scrollWidth > el.clientWidth + 40) {
        pos.current += speed * dt / 1000;
        const half = el.scrollWidth / 2;
        if (pos.current >= half) pos.current -= half;
        el.scrollLeft = pos.current;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const pause = () => { pausedUntil.current = Date.now() + 3500; };
    // durante la pausa l'utente scorre: risincronizza l'accumulatore
    const onScroll = () => { if (Date.now() < pausedUntil.current) pos.current = el.scrollLeft; };
    el.addEventListener('pointerdown', pause);
    el.addEventListener('wheel', pause, { passive: true });
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('wheel', pause);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('scroll', onScroll);
    };
  }, [speed]);
  const kids = React.Children.toArray(children);
  return (
    <div ref={ref} className="hscroll" style={{
      display: 'flex', gap, padding: '8px 22px 14px', overflowX: 'auto',
      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
    }}>
      {kids}
      {kids.map((k, i) => React.cloneElement(k, { key: 'dup-' + i }))}
    </div>
  );
}

// ─── In evidenza — card promo con reveal allo scroll ───
function FeaturedCard({ onClick }) {
  // v2 "cinematic" (concept approvato): vino profondo, foto inclinata in cornice,
  // accento lime, marquee lento sul bordo basso.
  const [T] = BK.useByupTheme();
  return (
    <div className="bk-press" onClick={() => { BK.haptic.light(); onClick?.(); }} style={{
      margin: '0 18px', height: 200, borderRadius: BK.RADII.card, overflow: 'hidden',
      position: 'relative', cursor: 'pointer',
      background: 'linear-gradient(115deg, #2a0d1c 0%, #4d122e 60%, #6d1b3f 100%)',
      boxShadow: '0 22px 46px -20px rgba(28,6,16,.65)',
    }}>
      <style>{`@keyframes fcMarq{to{transform:translateX(-50%)}}
@keyframes fcKen{from{transform:scale(1)}to{transform:scale(1.09)}}`}</style>
      {/* foto inclinata in cornice */}
      <div style={{ position: 'absolute', right: -24, top: -24, width: '58%', height: '130%',
        borderRadius: 32, overflow: 'hidden', transform: 'rotate(6deg)',
        border: '3px solid rgba(255,255,255,.1)' }}>
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75&auto=format&fit=crop"
          alt="" style={{ width: '100%', height: '100%', objectFit: 'cover',
            animation: 'fcKen 12s ease-in-out infinite alternate' }}/>
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(115deg, rgba(77,18,46,.55), transparent 60%)' }}/>
      </div>
      {/* testo */}
      <div style={{ position: 'absolute', left: 18, top: 20, maxWidth: '48%', color: '#fff', zIndex: 2 }}>
        <span style={{ display: 'inline-block', background: '#ceff00', color: '#141414',
          fontFamily: BK.TYPE.sans, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4,
          textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, transform: 'rotate(-2deg)' }}>
          In evidenza</span>
        <div style={{ fontFamily: BK.TYPE.display, fontWeight: 600, fontSize: 24, lineHeight: 1.06,
          marginTop: 10, letterSpacing: '-0.01em' }}>
          Giovedì <span style={{ color: '#ceff00' }}>−30%</span> sul menù
        </div>
      </div>
      {/* CTA */}
      <div style={{ position: 'absolute', left: 18, bottom: 38, zIndex: 2,
        background: 'linear-gradient(122deg,#E32459,#B81C47)', color: '#fff',
        fontFamily: BK.TYPE.sans, fontSize: 12.5, fontWeight: 800,
        padding: '10px 18px', borderRadius: 999,
        animation: 'bkCtaPulse 2.2s ease-in-out infinite' }}>
        Scopri l'offerta
      </div>
      {/* marquee lento */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 26,
        background: 'rgba(20,8,12,.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', gap: 26, whiteSpace: 'nowrap', paddingLeft: 10,
          fontFamily: BK.TYPE.sans, fontSize: 9.5, fontWeight: 800, letterSpacing: 2,
          color: 'rgba(255,255,255,.85)', textTransform: 'uppercase',
          animation: 'fcMarq 30s linear infinite' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 26 }}>✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati ✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 26 }}>✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati ✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati</span>
        </div>
      </div>
    </div>
  );
}

// ─── Da scoprire — stack orizzontale stile Twitch ───
// Card centrale in primo piano, laterali dietro; auto-advance + drag manuale.
function StackCard({ item, dim }) {
  const [T] = BK.useByupTheme();
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden',
      boxShadow: dim ? '0 10px 24px -16px rgba(77,18,46,.4)' : '0 18px 40px -16px rgba(227,36,89,.42)',
      transition: 'box-shadow 400ms ease',
    }}>
      <Photo src={item.photo} label={item.title}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,6,16,.05) 0%, rgba(28,6,16,.8) 100%)' }}/>
      {item.kind === 'event' ? (
        <>
          {item.date && (
            <div style={{ position: 'absolute', top: 11, left: 11, background: SURF, borderRadius: 12, padding: '4px 9px', textAlign: 'center', minWidth: 38 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: PINK, letterSpacing: .6, lineHeight: 1.1 }}>{item.date.month}</div>
              <div style={{ fontFamily: BK.TYPE.display, fontSize: 18, fontWeight: 600, color: '#1c0f15', lineHeight: 1, marginTop: 1 }}>{item.date.day}</div>
            </div>
          )}
          <div style={{ position: 'absolute', top: 11, right: 11, background: 'rgba(250,227,222,.22)', backdropFilter: 'blur(8px)', border: '1px solid rgba(250,227,222,.35)', color: '#fff', fontSize: 9.5, fontWeight: 800, letterSpacing: 1, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase' }}>Evento</div>
        </>
      ) : (
        <div style={{ position: 'absolute', top: 11, left: 11, background: PINK, color: '#fff', padding: '6px 11px', borderRadius: 13, transform: 'rotate(-3deg)', boxShadow: '0 8px 18px -6px rgba(227,36,89,.6)' }}>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 19, fontWeight: 600, lineHeight: 1 }}>{item.discount}</div>
        </div>
      )}
      {(() => {
        const st = item.status || (item.kind === 'promo'
          ? { tone: 'live', label: 'Attiva ora' }
          : { tone: 'soon', label: item.time ? `Dalle ${item.time}` : 'In arrivo' });
        const dot = st.tone === 'live' ? '#3ddc7f' : st.tone === 'soon' ? '#ffc839' : '#ff6b6b';
        return (
          <div style={{
            position: 'absolute', left: 9, right: 9, bottom: 9, color: '#fff',
            borderRadius: 18, padding: '10px 12px 11px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.34)',
            backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)',
            boxShadow: '0 10px 26px -12px rgba(20,8,12,.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: BK.TYPE.display, fontSize: 18.5, fontWeight: 600,
                lineHeight: 1.12, textShadow: '0 2px 10px rgba(20,8,12,.35)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{
                width: 32, height: 32, borderRadius: 999, background: '#fff', flexShrink: 0,
                display: 'grid', placeItems: 'center', boxShadow: '0 6px 14px -6px rgba(20,8,12,.4)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/>
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
              fontFamily: BK.TYPE.sans, fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.95)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: dot, flexShrink: 0,
                boxShadow: `0 0 8px ${dot}` }}/>
              <span style={{ whiteSpace: 'nowrap' }}>{st.label}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,.5)', flexShrink: 0 }}/>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFC839" stroke="none" style={{ flexShrink: 0 }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span style={{ whiteSpace: 'nowrap', color: 'rgba(255,255,255,.9)' }}>{item.rating || '4.6'}{item.reviews ? ` (${item.reviews})` : ''}</span>
            </div>
          </div>
        );
      })()}
      {dim && <div style={{ position: 'absolute', inset: 0, background: 'rgba(251,244,241,.16)' }}/>}
    </div>
  );
}

function StackCarousel({ items, onCardClick }) {
  const n = items.length;
  const [cur, setCur] = useState(0);
  const [dx, setDx] = useState(0);
  const pauseRef = useRef(0);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() < pauseRef.current || dragRef.current) return;
      setCur(c => (c + 1) % n);
    }, 4200);
    return () => clearInterval(t);
  }, [n]);
  const pause = () => { pauseRef.current = Date.now() + 5200; };
  const getX = (e) => e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX) ?? 0;
  const onDown = (e) => { pause(); movedRef.current = false; dragRef.current = { x: getX(e) }; };
  const onMove = (e) => {
    if (!dragRef.current) return;
    const d = getX(e) - dragRef.current.x;
    if (Math.abs(d) > 6) movedRef.current = true;
    setDx(d);
  };
  const onUp = () => {
    if (!dragRef.current) return;
    const d = dx;
    dragRef.current = null;
    setDx(0);
    pause();
    if (d < -48) setCur(c => (c + 1) % n);
    else if (d > 48) setCur(c => (c - 1 + n) % n);
  };
  const rel = (i) => { let r = (i - cur) % n; if (r > n / 2) r -= n; if (r < -n / 2) r += n; return r; };
  return (
    <div
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
      onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      style={{ position: 'relative', height: 244, marginBottom: 0, touchAction: 'pan-y', overflow: 'hidden' }}>
      {items.map((it, i) => {
        const r = rel(i);
        if (Math.abs(r) > 2) return null;
        const dragging = dx !== 0;
        return (
          <div key={i}
            onClick={() => {
              if (movedRef.current) return;
              if (r === 0) onCardClick?.(it);
              else { pause(); setCur(i); BK.haptic.selection(); }
            }}
            style={{
              position: 'absolute', left: '50%', top: 4, width: '70%', height: 196,
              transform: `translateX(calc(-50% + ${r * 56}% + ${dx * .55}px)) scale(${r === 0 ? 1 : .85})`,
              zIndex: 10 - Math.abs(r),
              opacity: Math.abs(r) === 2 ? 0 : (r === 0 ? 1 : .62),
              transition: dragging ? 'none' : `transform 560ms ${BK.EASE_OUT}, opacity 480ms ease`,
              cursor: 'pointer', willChange: 'transform',
            }}>
            <StackCard item={it} dim={r !== 0}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tavolo aperto — card post-pagamento parziale in home ───
// Appare solo se in sessione c'è un conto con residuo (byup_table).
// Sparisce quando il tavolo è saldato del tutto.
function OpenTableCard() {
  let t = null;
  try { t = JSON.parse(sessionStorage.getItem('byup_table') || 'null'); } catch {}
  if (!t || !(t.remaining > 0.01)) return null;
  const go = (route) => {
    try { sessionStorage.setItem('byup_menu_route', route); sessionStorage.setItem('byup_menu_premium', '1'); } catch {}
    window.__byupNav && window.__byupNav.go('menu');
  };
  return (
    <div style={{ padding: '0 18px', marginBottom: 4 }}>
      <div style={{
        position: 'relative', borderRadius: 22, overflow: 'hidden',
        background: 'linear-gradient(115deg, #4d122e 0%, #ae3152 55%, #e32459 100%)',
        boxShadow: '0 22px 44px -18px rgba(77,18,46,.55)',
        color: '#fff', padding: '16px 16px 14px', fontFamily: BK.TYPE.sans,
      }}>
        <div aria-hidden style={{ position: 'absolute', right: '-15%', top: '-40%', width: '70%', aspectRatio: '1',
          background: 'radial-gradient(circle, rgba(250,227,222,.2) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', opacity: .85 }}>
          {t.table} · {t.venue}
        </div>
        <div style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(6px)', fontSize: 11.5, fontWeight: 700 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b9f6ca" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Hai saldato la tua parte
        </div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: .92 }}>Da pagare al tavolo</span>
          <span style={{ fontFamily: BK.TYPE.display, fontSize: 21, fontWeight: 600 }}>{t.remaining.toFixed(2)}€</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="bk-press" onClick={() => { BK.haptic.light(); go('menu'); }} style={{
            flex: 1, height: 40, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.55)',
            background: 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer' }}>Ordina ancora</button>
          <button className="bk-press" onClick={() => { BK.haptic.light(); go('pay'); }} style={{
            flex: 1.15, height: 40, borderRadius: 999, border: 'none',
            background: '#fff', color: '#7a1c3e', fontSize: 13.5, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer' }}>Salda il resto</button>
        </div>
      </div>
    </div>
  );
}

// ─── byup pay — carta di pagamento con CTA ───
function PaymentCard({ onClick }) {
  const [T] = BK.useByupTheme();
  return (
    <div style={{ padding: '0 18px' }}>
      <div className="bk-press" onClick={() => { BK.haptic.light(); onClick?.(); }} style={{
        position: 'relative', borderRadius: 22, overflow: 'hidden', cursor: 'pointer',
        background: 'linear-gradient(115deg, #4d122e 0%, #ae3152 52%, #e32459 100%)',
        boxShadow: '0 22px 44px -18px rgba(77,18,46,.55)',
        color: '#fff', padding: '18px 18px 16px',
      }}>
        {/* glow decorativo */}
        <div aria-hidden style={{ position: 'absolute', right: '-15%', top: '-40%', width: '70%', aspectRatio: '1', background: 'radial-gradient(circle, rgba(250,227,222,.22) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        {/* riga alta: brand + contactless */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: BK.TYPE.display, fontSize: 17, fontWeight: 600 }}>byup <span style={{ color: '#ceff00' }}>pay</span></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6.5 8.5a8 8 0 0 1 0 7"/>
            <path d="M9.8 7a11 11 0 0 1 0 10"/>
            <path d="M13.1 5.5a14 14 0 0 1 0 13"/>
          </svg>
        </div>
        {/* chip + numero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0 14px' }}>
          <svg width="34" height="26" viewBox="0 0 34 26">
            <rect x="1" y="1" width="32" height="24" rx="6" fill="rgba(250,227,222,.9)"/>
            <path d="M1 10h10M1 16h10M23 10h10M23 16h10M11 1v24M23 1v24" stroke="rgba(77,18,46,.4)" strokeWidth="1.4" fill="none"/>
          </svg>
          <div style={{ fontFamily: BK.TYPE.sans, fontSize: 16, fontWeight: 700, letterSpacing: 3, opacity: .95 }}>
            ••••  ••••  ••••  <span style={{ letterSpacing: 1 }}>byup</span>
          </div>
        </div>
        {/* copy + CTA */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: BK.TYPE.display, fontSize: 15.5, fontWeight: 600, lineHeight: 1.2 }}>La tua carta si sente sola.</div>
            <div style={{ fontFamily: BK.TYPE.sans, fontSize: 11.5, opacity: .85, marginTop: 3 }}>Apple Pay · Google Pay · Carte — 30 secondi e paghi in un tap.</div>
          </div>
          <div style={{
            background: '#ceff00', color: '#141414', flexShrink: 0,
            fontFamily: BK.TYPE.sans, fontSize: 12.5, fontWeight: 800,
            padding: '10px 16px', borderRadius: 999,
            boxShadow: '0 8px 18px -6px rgba(20,20,20,.4)',
            animation: 'bkCtaPulse 2.4s ease-in-out infinite',
          }}>Configura</div>
        </div>
      </div>
    </div>
  );
}

// ─── Mappa full-bleed — primo scroll si ferma a fine pagina, il secondo apre con zoom ───
function LeafletMini({ mapRef, zoom = 13 }) {
  useEffect(() => {
    const el = mapRef.current;
    if (!el || !window.L) return;
    const map = window.L.map(el, {
      center: [41.9028, 12.4964], zoom,
      zoomControl: false, attributionControl: false,
      dragging: false, scrollWheelZoom: false, touchZoom: false,
      doubleClickZoom: false, keyboard: false,
    });
    window.L.tileLayer(`https://{s}.basemaps.cartocdn.com/${__BYUP_DARK ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`, { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
    const mk = (lat, lng) => window.L.marker([lat, lng], {
      icon: window.L.divIcon({ className: '', html: '<div style="width:16px;height:16px;border-radius:50%;background:#E32459;border:3px solid #fff;box-shadow:0 2px 8px rgba(227,36,89,.55)"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
    }).addTo(map);
    mk(41.9065, 12.4642); mk(41.8986, 12.4768); mk(41.9109, 12.5);
    setTimeout(() => map.invalidateSize(), 80);
    return () => map.remove();
  }, []);
  return <div ref={mapRef} style={{ position: 'absolute', inset: 0 }}/>;
}

function MapExpandOverlay({ from, T }) {
  const mapRef = useRef(null);
  const [grown, setGrown] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setGrown(true)); return () => cancelAnimationFrame(r); }, []);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, zIndex: 900,
      top: grown ? 0 : from.top, height: grown ? '100%' : from.height,
      overflow: 'hidden', background: __BYUP_DARK ? '#141214' : '#e9e4dd',
      transition: 'top 560ms cubic-bezier(.22,.9,.35,1), height 560ms cubic-bezier(.22,.9,.35,1)',
    }}>
      <LeafletMini mapRef={mapRef} zoom={13}/>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 500, pointerEvents: 'none',
        background: T.dark ? 'rgba(24,22,20,.12)' : 'rgba(251,244,241,.08)',
        opacity: grown ? 0 : 1, transition: 'opacity 500ms ease',
      }}/>
    </div>
  );
}

function MapPreviewCard({ onOpen }) {
  const [T] = BK.useByupTheme();
  const wrapRef = useRef(null);
  const mapRef = useRef(null);
  const [expanding, setExpanding] = useState(null);
  const firedRef = useRef(false);
  const gestureRef = useRef({ last: 0, armed: false, touchY: null, touchArmed: false });
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const scroller = wrap.closest('[data-byup-scroll]');
    if (!scroller) return;
    const atBottom = () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
    const trigger = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      const root = scroller.closest('[data-byup-approot]') || scroller.parentElement;
      const rRect = root.getBoundingClientRect();
      const rect = wrap.getBoundingClientRect();
      setExpanding({ top: rect.top - rRect.top, height: rect.height, rootEl: root });
      BK.haptic.light();
      setTimeout(() => onOpen?.(), 600);
    };
    const g = gestureRef.current;
    const onWheel = (e) => {
      if (e.deltaY <= 10 || !atBottom()) return;
      const now = Date.now();
      // gesto nuovo = pausa di almeno 450ms dall'ultimo evento a fondo pagina
      if (g.armed && now - g.last > 450) trigger();
      g.armed = true;
      g.last = now;
    };
    const onTouchStart = (e) => {
      g.touchY = e.touches[0].clientY;
      g.touchArmed = atBottom(); // già a fine pagina PRIMA del nuovo gesto
    };
    const onTouchMove = (e) => {
      if (g.touchY == null) return;
      const dy = g.touchY - e.touches[0].clientY;
      if (dy > 26 && g.touchArmed && atBottom()) { trigger(); g.touchY = null; }
    };
    const onTouchEnd = () => { g.touchY = null; };
    scroller.addEventListener('wheel', onWheel, { passive: true });
    scroller.addEventListener('touchstart', onTouchStart, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: true });
    scroller.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      scroller.removeEventListener('wheel', onWheel);
      scroller.removeEventListener('touchstart', onTouchStart);
      scroller.removeEventListener('touchmove', onTouchMove);
      scroller.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
  return (
    <>
      {/* full-bleed: si fonde col tema in alto e SCENDE SOTTO la tab bar in basso
          (marginBottom negativo mangia il padding dello scroller → niente striscia di sfondo) */}
      <div ref={wrapRef} style={{ position: 'relative', height: 448, marginTop: 4, marginBottom: -126, isolation: 'isolate' }}>
        <LeafletMini mapRef={mapRef} zoom={13}/>
        {/* fusione con lo sfondo in alto */}
        <div aria-hidden style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: 100, zIndex: 500, pointerEvents: 'none',
          background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg}00 100%)`,
        }}/>
        {/* velo di blur diffuso sul fondo — la mappa prosegue sotto la tab bar, nessun fade-to-bg */}
        <div aria-hidden style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 190, zIndex: 500, pointerEvents: 'none',
          backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 80%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 80%)',
        }}/>
        {/* pill flottante NON cliccabile — sollevata SOPRA la tab bar e il QR */}
        <div aria-hidden style={{
          position: 'absolute', left: '50%', bottom: 152, transform: 'translateX(-50%)', zIndex: 502,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: T.dark ? 'rgba(32,30,28,.86)' : 'rgba(255,255,255,.86)',
          color: T.text, fontFamily: BK.TYPE.sans, fontSize: 12.5, fontWeight: 700,
          padding: '10px 18px', borderRadius: 999,
          border: `1px solid ${T.glassBorder}`,
          backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          boxShadow: T.shadowSoft,
          animation: 'bkBob 2.4s ease-in-out infinite',
        }}>
          Scorri per aprire la mappa
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      {expanding && ReactDOM.createPortal(<MapExpandOverlay from={expanding} T={T}/>, expanding.rootEl)}
    </>
  );
}

// Pure presentational — every action is a callback prop.
// `topBar`: rendered ABOVE the sticky header — for banners that should sit at
// the very top of the home (booking, alerts).
// `before`: rendered between the dominant section and the secondary lists.
// Sticky region now contains: header + search + moment bar (the spine).
function HomeSections({
  topBar,
  before,
  moment: extMoment,
  setMoment: extSetMoment,
  activeCat, setActiveCat,
  onCategory,
  quickFilters, setQuickFilters,
  activeFilterCount = 0,
  onMap, onPosta, onSearch, onFilters,
  onCardClick, onSlotClick, onDisponibili,
  noVenues = false,
}) {
  // Allow internal moment management when parent doesn't provide it (legacy callers).
  const [intMoment, intSetMoment] = useState('ora');
  const moment = extMoment ?? intMoment;
  const rawSetMoment = extSetMoment || intSetMoment;
  // Stato della richiesta "Avvisami quando disponibili" nella variante senza locali
  const [notifyState, setNotifyState] = useState('idle'); // 'idle' | 'confirmed'
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  // Switching moment resets quick filters (each moment has its own chip set).
  const setMoment = (m) => { rawSetMoment(m); setQuickFilters?.({}); };
  const md = MOMENT_DATA[moment] || MOMENT_DATA.ora;
  const heroPhoto = HERO_PHOTO[moment] || HERO_PHOTO.ora;

  // Le 12 categorie brand — id allineati a BK.ASSETS.cat (icone kawaii, mai emoji).
  const cats = [
    { id: 'pizza',     label: 'Pizza' },
    { id: 'burger',    label: 'Burger' },
    { id: 'aperitivo', label: 'Aperitivo' },
    { id: 'poke',      label: 'Poke' },
    { id: 'panini',    label: 'Panini' },
    { id: 'birra',     label: 'Birra' },
    { id: 'dolce',     label: 'Dolce' },
    { id: 'vino',      label: 'Vino' },
    { id: 'taco',      label: 'Taco' },
    { id: 'brunch',    label: 'Brunch' },
    { id: 'cocktail',  label: 'Sushi' },
    { id: 'torta',     label: 'Torta' },
  ];
  const favorites = [
    { premium: true, name: 'Al Settembrini', gusti: ['pasta', 'carne'], type: 'Ristorante', distance: '0.4 km', hours: '12:30 – 23:00', open: true,
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=70&auto=format&fit=crop' },
    { name: "All'Impronta", gusti: ['pesce', 'carne'], type: 'Ristorante', distance: '0.8 km', hours: '19:00 – 24:00', open: true,
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70&auto=format&fit=crop' },
    { name: 'Lounge 22', gusti: ['aperitivo'], type: 'Cocktail', distance: '1.1 km', hours: '18:00 – 02:00', open: true,
      photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=70&auto=format&fit=crop' },
    { name: 'Hops & Co', type: 'Pub', distance: '1.5 km', hours: 'Apre alle 18:00', open: false,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop' },
  ];
  // Eventi + promo fused into one carousel ("Da scoprire")
  const explore = [
    { kind: 'event', title: 'Live Jazz', place: 'Blue Note', date: { month: 'GEN', day: '07' }, time: '22:00',
      rating: 4.5, reviews: 78, status: { tone: 'soon', label: 'Stasera · 22:00' },
      photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70&auto=format&fit=crop' },
    { kind: 'promo', title: 'Aperitivo 2x1', place: 'Lounge 22', discount: '2x1', hours: 'Oggi · 18-21',
      rating: 4.6, reviews: 132, status: { tone: 'live', label: 'Attiva · fino alle 21' },
      photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=70&auto=format&fit=crop' },
    { kind: 'event', title: 'Veglione', place: "All'Impronta", date: { month: 'DIC', day: '31' }, time: '20:30',
      rating: 4.8, reviews: 210, status: { tone: 'soon', label: 'Il 31 · 20:30' },
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { kind: 'promo', title: 'Cena natalizia', place: 'Da Mario', discount: '-20%', hours: 'Oggi · 19-23:30',
      rating: 4.4, reviews: 96, status: { tone: 'live', label: 'Attiva · 19-23:30' },
      photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=70&auto=format&fit=crop' },
  ];
  const click = (item) => onCardClick?.(item);
  const slotClick = (item) => onSlotClick?.(item);
  const [T] = BK.useByupTheme();

  return (
    <>
      {topBar}
      {/* Header + search + moment bar — scorre col contenuto (niente clip) */}
      <div style={{
        position: 'relative', zIndex: 5,
        background: T.dark ? 'rgba(24,22,20,0.74)' : 'rgba(251,244,241,0.74)',
        backdropFilter: 'blur(22px) saturate(160%)', WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        paddingTop: topBar ? 12 : 24,
        marginTop: topBar ? 0 : -24,
        paddingBottom: noVenues ? 18 : 0,
        boxShadow: noVenues ? 'none' : `0 1px 0 ${T.line}`,
      }}>
        {/* Header — saluto umano in Fredoka + città */}
        <div style={{ padding: '8px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', animation: `bkFadeUp 420ms ${BK.EASE_OUT} backwards` }}>
          <div>
            {!noVenues && (
              <button onClick={onMap} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: BK.TYPE.sans,
                fontSize: 13, fontWeight: 700, color: T.textDim, lineHeight: 1.1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Icon.Pin size={12}/>
                Roma centro
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            )}
            <div style={{
              fontFamily: BK.TYPE.display, fontSize: 27, fontWeight: 600,
              color: T.text, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: noVenues ? 0 : 5,
            }}>
              {(() => {
                const h = new Date().getHours();
                if (h < 12) return <>Oggi, <span style={{ color: T.primary }}>Mario</span>?</>;
                if (h < 15) return <>Pranzo, <span style={{ color: T.primary }}>Mario</span>?</>;
                if (h < 23) return <>Stasera, <span style={{ color: T.primary }}>Mario</span>?</>;
                return <>Notte fonda, <span style={{ color: T.primary }}>Mario</span>?</>;
              })()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
            <button onClick={onPosta} className="bk-press" style={{
              ...iconBtn, position: 'relative',
              background: T.surface, border: `1px solid ${T.line}`, boxShadow: T.shadowSoft,
            }} title="Posta">
              <Icon.Bell/>
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: 999, background: T.primary,
                border: `2px solid ${T.surface}`,
              }}/>
            </button>
          </div>
        </div>

        {/* Search — nascosta quando non ci sono locali */}
        {!noVenues && (
          <div style={{ padding: '14px 22px 14px' }}>
            <div onClick={onSearch} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: 50, borderRadius: 999,
              border: `1px solid ${T.glassBorder}`,
              padding: '0 16px', background: T.glass, cursor: 'pointer',
              backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              boxShadow: T.shadowSoft,
            }}>
              <Icon.Search/>
              <span style={{ flex: 1, fontSize: 14.5, color: T.textDim, fontFamily: BK.TYPE.sans }}>
                Cerca un locale, un piatto...
              </span>
              <button onClick={(e) => { e.stopPropagation(); onFilters?.(); }} style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4, position: 'relative',
              }} title="Tutti i filtri">
                <Icon.Sliders/>
                {activeFilterCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
                    background: PINK, color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Moment segmented — the spine. Nascosta quando non ci sono locali. */}
        {!noVenues && <MomentBar moment={moment} setMoment={setMoment}/>}
      </div>
      {/* === END STICKY === */}

      {/* Offerte in evidenza — subito sotto la ricerca */}
      {!noVenues && <OfferCarousel onTap={() => (onDisponibili || onSearch)?.()}/>}

      {/* Hero contextual card + quick filter chips — nascosti quando non ci sono locali */}
      {!noVenues && (
        <>
          <div key={moment} style={{ paddingTop: 18 }}>
            <HeroIntentCard data={md} photo={heroPhoto} moment={moment} onCta={() => (onDisponibili || onSearch)?.()}/>
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: noVenues ? '64px 18px 0' : '0 18px' }}>
        {noVenues ? (
          <div style={{
            background: T.surface, border: `1px dashed ${T.accentBorder}`,
            borderRadius: BK.RADII.card, padding: '26px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10,
          }}>
            <BK.Mascot T={T} pose="sleep" size={130} style={{ padding: 0 }}/>
            <div style={{ fontFamily: BK.TYPE.display, fontSize: 19, fontWeight: 600, color: T.text }}>
              Qui ancora niente…
            </div>
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.45, maxWidth: 280 }}>
              Stiamo aggiungendo i primi locali nella tua zona — ci sto lavorando 👀 Ti avvisiamo appena potrai cercare e prenotare.
            </div>
            <button
              onClick={() => {
                if (notifyState === 'confirmed') return;
                setNotifyState('confirmed');
                setNotifyDialogOpen(true);
              }}
              disabled={notifyState === 'confirmed'}
              style={{
                marginTop: 10, padding: '12px 22px', borderRadius: 999, border: 'none',
                background: notifyState === 'confirmed' ? TINT : PINK,
                color: notifyState === 'confirmed' ? TEXT : '#fff',
                fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit',
                cursor: notifyState === 'confirmed' ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: notifyState === 'confirmed' ? 'none' : `0 4px 14px ${PINK}40`,
              }}>
              {notifyState === 'confirmed' ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Avviso attivo
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  Avvisami quando disponibili
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>

      {before}

      {!noVenues && (
        <>
          {/* Categories — secondary discovery (smaller, scrollable) */}
          <SectionHeader title="Esplora per categoria"/>
          <AutoLoopScroll speed={24}>
            {cats.map(c => (
              <Category key={c.id} id={c.id} emoji={c.emoji} label={c.label}
                active={activeCat === c.id}
                onClick={() => onCategory ? onCategory(c) : setActiveCat?.(activeCat === c.id ? null : c.id)}/>
            ))}
          </AutoLoopScroll>

          {/* In evidenza — promo del momento */}
          <OpenTableCard/>

          <SectionHeader title="In evidenza"/>
          <FeaturedCard onClick={() => click({ title: 'Trattoria Lucia', name: 'Trattoria Lucia' })}/>

          {/* Da scoprire — stack orizzontale stile Twitch */}
          <SectionHeader title="Da scoprire" action="Vedi tutto" onAction={() => (onDisponibili || onSearch)?.()}/>
          <StackCarousel items={explore} onCardClick={(e) => click(e)}/>

          {/* Preferiti — user's own list */}
          <SectionHeader title="I tuoi preferiti" action="Vedi tutti" onAction={() => onSearch?.()}/>
          <AutoLoopScroll speed={28}>
            {favorites.map((f, i) => (
              <FavoriteCard key={i} {...f}
                onClick={() => click({ ...f, title: f.name, place: [f.type, f.distance].filter(Boolean).join(' · ') })}/>
            ))}
          </AutoLoopScroll>

          {/* byup pay — metodo di pagamento */}
          <SectionHeader title="Paga in un tap"/>
          <PaymentCard onClick={() => { try { sessionStorage.setItem('byup_menu_route', 'paymethod'); sessionStorage.setItem('byup_menu_premium', '1'); } catch {} window.__byupNav && window.__byupNav.go('menu'); }}/>

          {/* Mappa full-bleed — il secondo scroll a fine pagina la apre */}
          <SectionHeader title="Qui intorno"/>
          <MapPreviewCard onOpen={() => onMap?.()}/>
        </>
      )}

      {/* Popup di conferma "avviso attivato" — variante senza locali */}
      {notifyDialogOpen && (
        <div onClick={() => setNotifyDialogOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 90, animation: 'fade 0.18s ease', padding: '0 28px',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: SURF, borderRadius: 22, padding: '26px 22px 18px',
            width: '100%', maxWidth: 320, textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            animation: 'slideUp 0.22s cubic-bezier(.2,.9,.3,1.05)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999, margin: '0 auto 14px',
              background: __BYUP_DARK ? 'rgba(20,130,64,.20)' : '#e8f5ec', color: '#1a7a3a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginBottom: 6 }}>
              Avviso attivato
            </div>
            <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5, marginBottom: 20 }}>
              Ti scriveremo non appena ci saranno locali da cercare nella tua zona.
            </div>
            <button onClick={() => setNotifyDialogOpen(false)} style={{
              width: '100%', height: 48, borderRadius: 999, border: 'none',
              background: PINK, color: '#fff', fontSize: 14, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Ok</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main app ───────────────────────────────────────────────
// Notifica di recupero ordine (webapp→app): parcheggiata in Posta → Novità.
// `action: 'recover'` → tap apre il popup di inserimento codice (vedi PostaScreen).
// P-88: la comunicazione sulla sospensione delle recensioni, derivata dal
// mock byup_sospensione — cosa, fino a quando, perché, cosa succede alle
// esistenti, come contestare. Compare una volta sola.
const sospensioneNews = (r) => {
  const fine = new Date(r.fine).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  const esistenti = r.esistenti === 'rimosse' ? `Le recensioni già pubblicate sono state rimosse: ${r.motivoRimozione || r.motivo}.` : 'Le recensioni già pubblicate restano visibili.';
  return { id: 'sospensione', kind: 'review', ago: 'Adesso',
    title: `Le tue recensioni sono sospese fino al ${fine}`,
    preview: `Motivo: ${r.motivo}. ${esistenti} Se pensi che la decisione sia sbagliata puoi contestarla rispondendo a questo messaggio: la riesaminiamo entro sette giorni.` };
};

const RECOVERY_NEWS = {
  id: 'recovery-order',
  title: 'Hai un ordine da pagare?',
  preview: 'Se hai ordinato dal browser senza pagare, recupera qui il tuo conto in sospeso.',
  ago: 'Adesso', kind: 'order', action: 'recover',
};

// D-102 (P-112, che rivede D-42 e chiude P-55): il recupero si difende
// fermando chi tenta, non chiudendo l'ordine — un tentativo fallito è per
// definizione un codice che non corrisponde ad alcun ordine, quindi non c'è
// un bersaglio da proteggere e l'unica leva è chi digita. La scala si dice
// in una frase: tre tentativi liberi, un minuto di blocco; altri tre, cinque
// minuti; altri tre, e al nono il recupero dall'app si chiude per questo
// dispositivo. Il conteggio NON decade col tempo: si azzera solo quando il
// recupero riesce, e il blocco definitivo lo toglie solo l'assistenza con
// motivazione scritta (order_claim_lockouts: lifted_at, lifted_by,
// lift_reason). Il prototipo aveva adottato una terza scala — attese in
// secondi dopo ogni fallimento e blocco che decadeva da solo — senza
// decisione: quella non si tiene. Il contatore rispecchia
// order_claim_attempts e order_claim_lockouts, qui in localStorage. Nel
// prototipo trovano l'ordine due codici: quello del placeholder, 483912, e
// il codice di ritiro dell'ordine composto dalla webapp sullo stesso dominio
// (byup_asporto_webapp, P-154), che è UN codice solo — lo stesso che il
// cliente detta al banco — finché la proposta non è scaduta. Niente
// identificativi del dispositivo a schermo. Demo: ?recupero=0 azzera il
// contatore — è il gesto dell'assistenza che toglie il blocco, non un
// decadimento.
const RECUPERO = { CODICE_DEMO: '483912', CIFRE: 6, PER_GRUPPO: 3, BLOCCHI_S: [60, 300], MAX_TENTATIVI: 9 };
function byupAsportoWebapp() {
  try {
    const o = JSON.parse(localStorage.getItem('byup_asporto_webapp') || 'null');
    if (o && o.codiceRitiro && (!o.scade || Date.now() <= new Date(o.scade).getTime())) return o;
  } catch {}
  return null;
}
const byupClaim = (() => {
  const K = 'byup_claim_attempts';
  const VUOTO = { n: 0, ultimo: null, bloccatoFino: null, chiuso: false };
  const leggi = () => { try { return Object.assign({}, VUOTO, JSON.parse(localStorage.getItem(K) || 'null') || {}); } catch { return { ...VUOTO }; } };
  const scrivi = (v) => { try { localStorage.setItem(K, JSON.stringify(v)); } catch {} return v; };
  // Lo stato com'è scritto: niente decade da solo. Un blocco intermedio
  // scaduto resta nel registro e attesa() lo legge come zero.
  const stato = () => leggi();
  return {
    stato,
    // Il blocco definitivo, dopo il nono fallimento: si esce solo con azzera().
    bloccato() { return !!stato().chiuso; },
    // Secondi da aspettare prima del prossimo tentativo, 0 se si può.
    attesa() { const s = stato(); if (!s.bloccatoFino) return 0; return Math.max(0, Math.ceil((s.bloccatoFino - Date.now()) / 1000)); },
    // Un fallimento in più: al terzo e al sesto parte il blocco a tempo del
    // suo gruppo (un minuto, cinque minuti); al nono la chiusura.
    fallimento() {
      const s = stato(); const n = s.n + 1; const ora = Date.now();
      if (n >= RECUPERO.MAX_TENTATIVI) return scrivi({ n, ultimo: ora, bloccatoFino: null, chiuso: true });
      const gruppo = n / RECUPERO.PER_GRUPPO;
      const blocco = Number.isInteger(gruppo) ? RECUPERO.BLOCCHI_S[gruppo - 1] : null;
      return scrivi({ n, ultimo: ora, bloccatoFino: blocco ? ora + blocco * 1000 : null, chiuso: false });
    },
    azzera() { return scrivi({ ...VUOTO }); },
  };
})();
try { if (new URLSearchParams(window.location.search).get('recupero') === '0') byupClaim.azzera(); } catch {}
// Il conto alla rovescia dei blocchi intermedi, «4:32» e non «272 s».
const byupAttesaTesto = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

// Popup centrale per inserire/incollare il codice ordine della web app.
function RecoveryOrderModal({ onClose, onSubmit }) {
  const [code, setCode] = useState('');
  const [errore, setErrore] = useState(false);
  const [attesa, setAttesa] = useState(() => byupClaim.attesa());
  const [bloccato, setBloccato] = useState(() => byupClaim.bloccato());
  const clean = (v) => v.replace(/\D/g, '').slice(0, RECUPERO.CIFRE);
  const pieno = code.length === RECUPERO.CIFRE;
  const valid = pieno && attesa === 0 && !bloccato;
  // Il conto alla rovescia: un tick al secondo finché l'attesa non scade.
  useEffect(() => {
    if (attesa <= 0) return;
    const t = setTimeout(() => setAttesa(byupClaim.attesa()), 1000);
    return () => clearTimeout(t);
  }, [attesa]);
  // Il tentativo: il codice demo trova l'ordine e azzera il contatore; ogni
  // altro codice è un fallimento — al terzo e al sesto il blocco a tempo, al
  // nono la chiusura (D-102).
  const tenta = (c) => {
    if (bloccato || byupClaim.attesa() > 0) return;
    const web = byupAsportoWebapp();
    if (c === RECUPERO.CODICE_DEMO || (web && c === web.codiceRitiro)) { byupClaim.azzera(); onSubmit(c); return; }
    byupClaim.fallimento();
    setCode(''); setErrore(true);
    if (byupClaim.bloccato()) setBloccato(true); else setAttesa(byupClaim.attesa());
  };
  // Digitazione: parte da solo solo a lunghezza piena, come un OTP.
  const handleChange = (v) => {
    const c = clean(v);
    setCode(c); setErrore(false);
    if (c.length === RECUPERO.CIFRE) setTimeout(() => tenta(c), 200);
  };
  // Incolla (tieni premuto sul campo → Incolla): accettazione automatica solo
  // se il codice incollato è pieno.
  const handlePaste = (e) => {
    const c = clean((e.clipboardData && e.clipboardData.getData('text')) || '');
    if (!c) return;
    e.preventDefault();
    setCode(c); setErrore(false);
    if (c.length === RECUPERO.CIFRE) setTimeout(() => tenta(c), 250);
  };
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320, background: SURF, borderRadius: 22,
        padding: '22px 20px 20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, margin: '0 auto 12px',
          background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 16px ${PINK}40`,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l3 3v17l-3-2-2 2-2-2-2 2-2-2-2 2V4a2 2 0 0 1 1-2z"/><path d="M9 8h6M9 12h6"/></svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, textAlign: 'center', letterSpacing: -0.3 }}>Recupera il tuo ordine</div>
        {bloccato ? (
          <>
            <div style={{ fontSize: 13.5, color: TEXT, textAlign: 'center', marginTop: 10, lineHeight: 1.45 }}>
              Troppi tentativi. Torna alla webapp del tavolo o salda in cassa: l'ordine non si perde.
            </div>
            <button onClick={onClose} style={{
              width: '100%', marginTop: 18, padding: '14px', borderRadius: 12, border: 'none',
              background: PINK, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Ho capito</button>
          </>
        ) : (
          <>
        <div style={{ fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 6, lineHeight: 1.4 }}>
          Inserisci il codice che trovi sulla schermata della web app.
        </div>

        {/* Niente autoComplete="one-time-code" (P-138): quel valore dice al
            telefono che il codice arriva per SMS e lo autorizza a leggerlo dai
            messaggi. Questo codice non viaggia da nessuna parte: si legge sulla
            schermata della webapp (D-42). Resta inputMode="numeric", che fa
            comparire il tastierino. */}
        <input
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          inputMode="numeric"
          disabled={attesa > 0}
          autoFocus
          placeholder="es. 48 39 12"
          style={{
            width: '100%', boxSizing: 'border-box', marginTop: 18, padding: '14px',
            borderRadius: 12, border: `1.5px solid ${errore ? '#D64545' : BORDER}`, fontSize: 18, fontWeight: 700,
            letterSpacing: 4, color: TEXT, fontFamily: 'inherit', outline: 'none',
            textAlign: 'center', opacity: attesa > 0 ? 0.5 : 1,
          }}/>
        <div style={{ fontSize: 11.5, color: errore ? '#D64545' : MUTED, textAlign: 'center', marginTop: 8, fontWeight: errore ? 700 : 400 }}>
          {attesa > 0 ? `Riprova fra ${byupAttesaTesto(attesa)}` : errore ? 'Codice riscatto ordine errato' : 'Sei cifre. Tieni premuto e incolla: verrà accettato da solo.'}
        </div>

        <button disabled={!valid} onClick={() => tenta(code)} style={{
          width: '100%', marginTop: 14, padding: '14px', borderRadius: 12, border: 'none',
          background: valid ? PINK : '#EDE7E9', color: valid ? '#fff' : MUTED,
          fontSize: 15.5, fontWeight: 700, cursor: valid ? 'pointer' : 'default', fontFamily: 'inherit',
        }}>Recupera ordine</button>
        <button onClick={onClose} style={{
          width: '100%', marginTop: 8, padding: '10px', borderRadius: 12, border: 'none',
          background: 'transparent', color: MUTED, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Annulla</button>
          </>
        )}
      </div>
    </div>
  );
}

// Overlay di caricamento simulato mentre "si cerca" l'ordine.
function RecoveryLoadingOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(2px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <img src={BK.ASSETS.mascot.phone} width="110" alt="" style={{ animation: 'bkBob 1.4s ease-in-out infinite', filter: 'drop-shadow(0 14px 22px rgba(77,18,46,.28))' }}/>
      <div style={{ fontFamily: BK.TYPE.display, fontWeight: 600, color: TEXT, fontSize: 17 }}>Cerco il tuo ordine…</div>
    </div>
  );
}

// Banner in alto mostrato al primo accesso dopo la registrazione (dopo i popup
// permessi). Si auto-rimuove dopo 5s; resta poi in Posta → Novità.
function RecoveryOrderBanner({ onOpen, onClose }) {
  return (
    <div onClick={onOpen} style={{
      margin: '0 0 12px', cursor: 'pointer',
      background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
      color: '#fff', borderRadius: 16, padding: '12px 12px 12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 6px 18px ${PINK}40`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l3 3v17l-3-2-2 2-2-2-2 2-2-2-2 2V4a2 2 0 0 1 1-2z"/><path d="M9 8h6M9 12h6"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: -0.2 }}>Hai un ordine da pagare?</div>
        <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 1, lineHeight: 1.35 }}>Se hai ordinato dal browser, recupera qui il conto in sospeso.</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Chiudi" style={{
        background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', cursor: 'pointer',
        width: 26, height: 26, borderRadius: 999, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}

function App({ recoveryArmed = false }) {
  // app_open (P-38): l'apertura dell'app, una volta per montaggio, solo con
  // l'interruttore di P-26 acceso — ByupUso non scrive altrimenti.
  useEffect(() => { if (window.ByupUso) window.ByupUso.emetti('app_open'); }, []);
  const [T] = BK.useByupTheme();
  const [activeCat, setActiveCat] = useState(null);
  const [catSel, setCatSel] = useState(null); // categoria aperta a schermo intero
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  // Navigation stack: every setPage pushes; goBack pops. The top-left back
  // arrow on every screen calls goBack() and always returns to the previous
  // page, regardless of how the user got there.
  const [navStack, setNavStack] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('page');
      if (p === 'venue' || p === 'profile' || p === 'map' || p === 'posta' || p === 'search') return ['home', p];
      if (p === 'menu') return ['home', 'menu'];
      if (p === 'home-empty') return ['home-empty'];
    } catch {}
    return ['home'];
  });
  const page = navStack[navStack.length - 1];
  const setPage = (newPage) => {
    setNavStack(s => s[s.length - 1] === newPage ? s : [...s, newPage]);
  };
  const goBack = () => {
    setNavStack(s => s.length > 1 ? s.slice(0, -1) : ['home']);
  };
  const resetToHome = () => setNavStack(['home']);
  // Router globale: le BottomTabBar renderizzate da altri file (profile, map)
  // navigano via setPage senza reload. Riassegnato a ogni render.
  useEffect(() => {
    window.__byupQR = () => setQrOpen(true);
    window.__byupNav = {
      go: setPage, home: resetToHome,
      venue: () => { setActiveVenue(v => v || { id: 'v_settembrini', premium: true, name: 'Al Settembrini', gusti: ['pasta', 'carne'], _from: 'menu' }); setPage('venue'); },
    };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [activeVenue, setActiveVenue] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).get('page') === 'venue') {
        return { premium: true, name: 'Al Settembrini', gusti: ['pasta', 'carne'], _from: 'home' };
      }
    } catch {}
    return null;
  });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [, setMenuTick] = useState(0); // retry render quando menu.jsx arriva
  // booking della sessione corrente: NON sopravvive al refresh.
  // Parte sempre da null e ripulisce eventuali residui in localStorage.
  const [savedBooking, setSavedBooking] = useState(null);
  const [bookingEdit, setBookingEdit] = useState(null); // prenotazione in modifica (apre BookingSheet precompilato)
  useEffect(() => {
    try { localStorage.removeItem('byup_booking'); } catch {}
  }, []);
  const refreshBooking = () => {
    try { const raw = localStorage.getItem('byup_booking'); setSavedBooking(raw ? JSON.parse(raw) : null); }
    catch { setSavedBooking(null); }
  };
  const cancelBooking = () => {
    try { localStorage.removeItem('byup_booking'); } catch {}
    setSavedBooking(null);
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  // Recupero ordine: armato da Root al primo accesso post-registrazione (dopo i
  // popup permessi). `recoveryBannerOpen` = banner in alto (auto-rimosso a 5s);
  // `recoveryActive` = la notifica resta in Posta → Novità.
  const [recoveryActive, setRecoveryActive] = useState(false);
  // P-88: la comunicazione sulla sospensione compare in Posta → Novità una
  // volta sola. Si legge all'avvio e si segna come comunicata quando la
  // persona apre Posta: alla prossima apertura dell'app non torna.
  const [sospensioneCard] = useState(() => { const S = window.ByupSospensione; const r = S && S.leggi(); return r && S.attiva() && !r.comunicataIl ? r : null; });
  useEffect(() => { if (page === 'posta' && sospensioneCard && window.ByupSospensione) window.ByupSospensione.segnaComunicata(); }, [page, sospensioneCard]);
  const [recoveryBannerOpen, setRecoveryBannerOpen] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  useEffect(() => {
    if (!recoveryArmed) return;
    setRecoveryActive(true);
    setRecoveryBannerOpen(true);
    const t = setTimeout(() => setRecoveryBannerOpen(false), 20000);
    return () => clearTimeout(t);
  }, [recoveryArmed]);
  // Codice demo confermato → chiudi popup, caricamento simulato, poi salta al
  // flusso "Home + ordine" della menu app (l'ordine webapp è stato trovato).
  const startRecovery = (code) => {
    setRecoveryModalOpen(false);
    setRecoveryLoading(true);
    setTimeout(() => { window.location.href = 'byup Menu.html#home'; }, 1600);
  };
  // Overlay condivisi (popup + caricamento): inseriti sia nel ramo Home sia in
  // quello Posta, perché App fa early-return per pagina.
  const recoveryOverlays = (
    <>
      {recoveryModalOpen && <RecoveryOrderModal onClose={() => setRecoveryModalOpen(false)} onSubmit={startRecovery}/>}
      {recoveryLoading && <RecoveryLoadingOverlay/>}
    </>
  );
  const [filters, setFilters] = useState({});
  const [quickFilters, setQuickFilters] = useState({ openNow: false, near: false, promo: false, top: false });
  const [scrolled, setScrolled] = useState(false);

  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 12);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const cats = null; // moved into <HomeSections>; kept here only as marker
  const [moment, setMoment] = useState('ora'); // 'ora' | 'pranzo' | 'cena' | 'notte'
  const [bookingSlot, setBookingSlot] = useState(null); // pre-fills time in BookingSheet

  const openBookingForVenue = (venue, slotTime) => {
    setActiveVenue({ ...venue, _from: 'home' });
    setBookingSlot(slotTime || null);
    setBookingOpen(true);
  };

  const activeFilterCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length;

  if (page === 'menu') {
    const MA = window.MenuApp;
    if (!MA) {
      // menu.jsx si carica dopo app.jsx: riprovo appena disponibile (deep-link)
      setTimeout(() => setMenuTick(t => t + 1), 150);
      return null;
    }
    let init = null;
    try { init = sessionStorage.getItem('byup_menu_route'); if (init) sessionStorage.removeItem('byup_menu_route'); } catch {}
    return <MA initial={init || undefined}/>;
  }
  if (page === 'category' && catSel) {
    return (
      <CategoryScreen cat={catSel} onBack={goBack}
        onOpenVenue={(v) => { setActiveVenue({ ...v, _from: 'category' }); setPage('venue'); }}/>
    );
  }
  if (page === 'profile') {
    const PS = window.ProfileScreen;
    return PS ? <PS onBack={goBack} onTabHome={resetToHome}
      onOpenVenue={(v) => { setActiveVenue({ ...v, _from: 'profile' }); setPage('venue'); }}/> : null;
  }
  if (page === 'map') {
    const MS = window.MapScreen;
    return (
      <>
        {MS && <MS
          onBack={goBack}
          onTabHome={resetToHome}
          onTabProfile={() => setPage('profile')}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          onOpenVenue={(v) => { setActiveVenue({ ...v, _from: 'map' }); setPage('venue'); }}
        />}
        <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}
          filters={filters} setFilters={setFilters}/>
        <BottomTabBar active="home" onHome={resetToHome} onProfile={() => setPage('profile')} onSearch={() => setPage('disponibili')} onQR={() => setQrOpen(true)}/>
      </>
    );
  }
  if (page === 'posta') {
    const PoS = window.PostaScreen;
    const isEmptyZone = navStack[0] === 'home-empty';
    return PoS ? <>
      <PoS onBack={goBack} onProfile={() => setPage('profile')} onlyNews={isEmptyZone}
        extraNews={[...(sospensioneCard ? [sospensioneNews(sospensioneCard)] : []), ...(recoveryActive ? [RECOVERY_NEWS] : [])]}
        onRecover={() => setRecoveryModalOpen(true)}/>
      {recoveryOverlays}
    </> : null;
  }
  if (page === 'venue') {
    const VS = window.VenueScreen;
    const BS = window.BookingSheet;
    return (
      <>
        {VS && <VS venue={activeVenue}
          onBack={goBack}
          onMenu={() => { try { sessionStorage.setItem('byup_menu_from', 'venue'); sessionStorage.setItem('byup_menu_premium', activeVenue && activeVenue.premium ? '1' : '0'); } catch {} setPage('menu'); }}
          onBook={() => setBookingOpen(true)}
          onHome={resetToHome}
          onProfile={() => setPage('profile')}
          onMap={() => { try { window.__byupMapFocus = (activeVenue && activeVenue.name) || null; } catch {} setPage('map'); }}/>}
        {BS && <BS open={bookingOpen} venue={activeVenue} defaultTime={bookingSlot}
          onClose={() => { setBookingOpen(false); setBookingSlot(null); }}
          onConfirm={() => { setBookingOpen(false); setBookingSlot(null); refreshBooking(); }}/>}
      </>
    );
  }
  if (page === 'disponibili') {
    const BS = window.BookingSheet;
    return (
      <div style={{
        width: '100%', height: '100%', background: SURF, position: 'relative',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <DisponibiliScreen
          moment={moment}
          quickFilters={quickFilters} setQuickFilters={setQuickFilters}
          onBack={goBack}
          onMap={() => setPage('map')}
          onCardClick={(item) => {
            const v = { ...item, name: item.name || item.title, _from: 'disponibili' };
            setActiveVenue(v);
            setPage('venue');
          }}
          onSlotClick={(item) => {
            const v = { ...item, name: item.name || item.title, _from: 'disponibili' };
            openBookingForVenue(v, item.slot);
          }}/>

        {/* Tab bar — concave notch around QR, shared with home */}
        <BottomTabBar active="home"
          onHome={resetToHome}
          onProfile={() => setPage('profile')}
          onSearch={() => setPage('disponibili')}
          onQR={() => setQrOpen(true)}/>

        {BS && <BS open={bookingOpen} venue={activeVenue} defaultTime={bookingSlot}
          onClose={() => { setBookingOpen(false); setBookingSlot(null); }}
          onConfirm={() => { setBookingOpen(false); setBookingSlot(null); refreshBooking(); }}/>}
      </div>
    );
  }

  return (
    <div data-byup-approot style={{
      width: '100%', height: '100%', background: T.bg, position: 'relative',
      fontFamily: BK.TYPE.sans,
      color: T.text, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Atmosfera — glow coral d'ambiente + grana (mai fondo piatto) */}
      <div aria-hidden style={{
        position: 'absolute', left: '50%', top: '-14%', width: '85%', aspectRatio: '1',
        transform: 'translateX(-50%)', pointerEvents: 'none',
        background: `radial-gradient(circle, ${T.glow} 0%, transparent 65%)`,
      }}/>
      <div aria-hidden style={{
        position: 'absolute', right: '-20%', bottom: '-8%', width: '60%', aspectRatio: '1',
        pointerEvents: 'none',
        background: `radial-gradient(circle, ${T.glow} 0%, transparent 68%)`, opacity: .7,
      }}/>
      <div aria-hidden style={{
        position: 'absolute', inset: '-2%', pointerEvents: 'none',
        backgroundImage: BK.GRAIN_URI, backgroundSize: 140,
        opacity: T.dark ? .05 : .035, mixBlendMode: T.dark ? 'screen' : 'multiply',
      }}/>

      {/* Sticky header (over status bar background) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15,
        height: 'calc(var(--byup-sat, 54px) + 6px)',
        background: scrolled ? (T.dark ? 'rgba(24,22,20,0.82)' : 'rgba(251,244,241,0.82)') : 'transparent',
        backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
        borderBottom: scrolled ? `1px solid ${T.line}` : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
        pointerEvents: 'none',
      }}/>

      {/* Scrollable content area */}
      <div ref={scrollRef} data-byup-scroll style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        paddingTop: 'calc(var(--byup-sat, 54px) + 6px)',
        paddingBottom: 'calc(126px + env(safe-area-inset-bottom, 0px))',
      }}>
        <HomeSections
          topBar={(recoveryBannerOpen || savedBooking) ? (
            <>
              {recoveryBannerOpen && (
                <RecoveryOrderBanner
                  onOpen={() => { setRecoveryBannerOpen(false); setRecoveryModalOpen(true); }}
                  onClose={() => setRecoveryBannerOpen(false)}/>
              )}
              {savedBooking && (
                <BookingHomeCard booking={savedBooking} onModify={() => { setBookingEdit(savedBooking); setBookingOpen(true); }} onScanQr={() => setQrOpen(true)}/>
              )}
            </>
          ) : null}
          moment={moment} setMoment={setMoment}
          activeCat={activeCat} setActiveCat={setActiveCat}
          onCategory={(c) => { setCatSel(c); setPage('category'); }}
          quickFilters={quickFilters} setQuickFilters={setQuickFilters}
          activeFilterCount={activeFilterCount}
          noVenues={page === 'home-empty'}
          onMap={() => setPage('map')}
          onPosta={() => setPage('posta')}
          onSearch={() => setPage('disponibili')}
          onFilters={() => setFiltersOpen(true)}
          onDisponibili={() => setPage('disponibili')}
          onCardClick={(item) => {
            const v = { ...item, name: item.name || item.title, _from: 'home' };
            setActiveVenue(v);
            setPage('venue');
          }}
          onSlotClick={(item) => {
            const v = { ...item, name: item.name || item.title, _from: 'home' };
            openBookingForVenue(v, item.slot);
          }}
        />
      </div>

      {/* Tab bar with concave notch around the QR */}
      <BottomTabBar active="home"
        onHome={resetToHome}
        onProfile={() => setPage('profile')}
        onSearch={() => setPage('disponibili')}
        onQR={() => setQrOpen(true)}/>

      {/* Mascotte — prima visita della Home */}
      {page === 'home' && (
        <BK.MascotMoment T={T} absolute pose="wink" pageKey="home"
          message="Stasera che si fa?" bottom={116} size={124}/>
      )}

      {/* Detail sheet */}
      <DetailSheet item={detail} onClose={() => setDetail(null)}
        onOpenVenue={() => {
          if (!detail) return;
          const v = { ...detail, name: detail.name || detail.title, _from: 'home' };
          setDetail(null);
          setActiveVenue(v);
          setPage('venue');
        }}
        onMenu={() => { setDetail(null); try { sessionStorage.setItem('byup_menu_from', 'venue'); } catch {} setPage('menu'); }}
        onBook={() => { setBookingOpen(true); }}/>

      {/* Booking sheet (shared with venue page) */}
      {(() => { const BS = window.BookingSheet;
        return BS ? <BS open={bookingOpen}
          venue={detail ? { ...detail, name: detail.name || detail.title } : activeVenue}
          defaultTime={bookingSlot}
          editBooking={bookingEdit}
          onClose={() => { setBookingOpen(false); setBookingSlot(null); setBookingEdit(null); }}
          onConfirm={() => { setBookingOpen(false); setBookingSlot(null); setBookingEdit(null); setDetail(null); refreshBooking(); }}
          onCancelBooking={() => { setBookingOpen(false); setBookingEdit(null); cancelBooking(); }}/> : null;
      })()}

      {/* Filter sheet */}
      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}
        filters={filters} setFilters={setFilters}/>

      {/* Notifications */}
      <NotifSheet open={notifOpen} onClose={() => setNotifOpen(false)}/>

      {/* Recupero ordine: popup codice + caricamento simulato */}
      {recoveryOverlays}

      {/* QR scanner overlay */}
      {qrOpen && (
        <QRScanOverlay
          onClose={() => setQrOpen(false)}
          onDone={() => {
            try { sessionStorage.removeItem('byup_menu_from'); } catch {}
            setQrOpen(false);
            try { sessionStorage.setItem('byup_menu_premium', '1'); } catch {}
            setPage('menu');
          }}/>
      )}
    </div>
  );
}

const iconBtn = {
  width: 40, height: 40, border: 'none', background: 'rgba(0,0,0,0.04)',
  borderRadius: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0,
};

function SectionHeader({ title, action, onAction }) {
  const [T] = BK.useByupTheme();
  return (
    <div style={{
      padding: '24px 22px 12px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'baseline',
    }}>
      <div style={{ fontFamily: BK.TYPE.display, fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: '-0.01em' }}>{title}</div>
      {action && (
        <button onClick={onAction} style={{
          background: 'none', border: 'none', color: T.primary,
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: BK.TYPE.sans,
        }}>{action}</button>
      )}
    </div>
  );
}

// ─── Overlay scan QR v2: scan → "trovato" → ti unisci al tavolo ───
// Fase 'scan' (~1.3s): mirino glass con scan line e angoli che respirano.
// Fase 'found': il mirino si morpha in una card col tavolo, check animato,
// avatar dei commensali che poppano e mascotte. Poi entra nel menu.
function QRScanOverlay({ onDone, onClose }) {
  const [phase, setPhase] = useState('scan');
  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('found'); BK.haptic.success(); }, 1350);
    // qr_scan (P-38): solo con l'interruttore acceso, con la città.
    // La sede scansionata viaggia con l'evento (P-161 · D-115): nel mock è il locale del menù demo.
    const t2 = setTimeout(() => { if (window.ByupUso) window.ByupUso.emetti('qr_scan', 'v_settembrini'); onDone && onDone(); }, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(14,8,11,0.93)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      animation: 'fade 0.25s ease', overflow: 'hidden', fontFamily: BK.TYPE.sans,
    }}>
      <style>{`
@keyframes qrScan{0%{top:20px;opacity:0}12%{opacity:1}50%{top:calc(100% - 22px)}88%{opacity:1}100%{top:20px;opacity:0}}
@keyframes qrCorner{0%,100%{opacity:.9}50%{opacity:.45}}
@keyframes qrMorph{0%{transform:scale(1)}40%{transform:scale(.92)}70%{transform:scale(1.04)}100%{transform:scale(1)}}
@keyframes qrPop{0%{opacity:0;transform:scale(.4) translateY(14px)}70%{transform:scale(1.08) translateY(-2px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes qrCheck{0%{stroke-dashoffset:34}100%{stroke-dashoffset:0}}
@keyframes qrRing{0%{transform:scale(.5);opacity:.8}100%{transform:scale(1.9);opacity:0}}
@keyframes qrGlow{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      {/* glow ambiente */}
      <div aria-hidden style={{ position: 'absolute', left: '50%', top: '38%', width: 380, height: 380,
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(227,36,89,.22) 0%, transparent 65%)',
        animation: 'qrGlow 2.6s ease-in-out infinite' }}/>

      <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 10.5, fontWeight: 800, letterSpacing: 2.4, marginBottom: 8 }}>
        BYUP · SCANNER
      </div>
      <div style={{ fontFamily: BK.TYPE.display, color: '#fff', fontSize: 22, fontWeight: 600, marginBottom: 26,
        transition: 'opacity .3s' }}>
        {phase === 'scan' ? 'Inquadra il QR del tavolo' : 'Tavolo trovato!'}
      </div>

      {/* mirino / card — morpha tra le due fasi */}
      <div style={{
        width: 250, borderRadius: 28, position: 'relative',
        height: phase === 'scan' ? 250 : 190,
        background: phase === 'scan' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${phase === 'scan' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.28)'}`,
        backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        overflow: 'hidden', transition: 'all .5s cubic-bezier(.3,1.05,.35,1)',
        animation: phase === 'found' ? 'qrMorph .55s cubic-bezier(.3,1.1,.35,1)' : 'none',
      }}>
        {phase === 'scan' ? (
          <>
            {[[0,0],[0,1],[1,0],[1,1]].map(([y,x]) => (
              <div key={`${y}${x}`} style={{
                position: 'absolute',
                top: y ? 'auto' : 14, bottom: y ? 14 : 'auto',
                left: x ? 'auto' : 14, right: x ? 14 : 'auto',
                width: 30, height: 30, animation: 'qrCorner 1.6s ease-in-out infinite',
                borderTop: !y ? `3.5px solid ${PINK}` : 'none',
                borderBottom: y ? `3.5px solid ${PINK}` : 'none',
                borderLeft: !x ? `3.5px solid ${PINK}` : 'none',
                borderRight: x ? `3.5px solid ${PINK}` : 'none',
                borderRadius: !y && !x ? '14px 0 0 0' : y && !x ? '0 0 0 14px' : !y && x ? '0 14px 0 0' : '0 0 14px 0',
              }}/>
            ))}
            <div style={{
              position: 'absolute', left: 22, right: 22, height: 3, borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`,
              boxShadow: `0 0 16px ${PINK}, 0 0 40px rgba(227,36,89,.5)`,
              animation: 'qrScan 2s cubic-bezier(.45,0,.55,1) infinite',
            }}/>
          </>
        ) : (
          <div style={{ padding: '18px 18px 16px', textAlign: 'center', color: '#fff' }}>
            {/* check con anello */}
            <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto' }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 999,
                border: `2.5px solid ${PINK}`, animation: 'qrRing .9s ease-out .1s both' }}/>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 999,
                background: 'linear-gradient(135deg, #E32459, #B81C47)',
                display: 'grid', placeItems: 'center', animation: 'qrPop .5s cubic-bezier(.3,1.3,.4,1) both',
                boxShadow: '0 12px 26px -8px rgba(227,36,89,.8)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" strokeDasharray="34" strokeDashoffset="34"
                    style={{ animation: 'qrCheck .45s ease-out .25s forwards' }}/>
                </svg>
              </span>
            </div>
            <div style={{ fontFamily: BK.TYPE.display, fontSize: 18, fontWeight: 600, marginTop: 12,
              animation: 'qrPop .5s cubic-bezier(.3,1.3,.4,1) .15s both' }}>Tavolo 23</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.75)', marginTop: 2,
              animation: 'qrPop .5s cubic-bezier(.3,1.3,.4,1) .22s both' }}>Ristorante Maria Grazia</div>
            {/* commensali che poppano */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              {['M', 'G', '?'].map((ch, i) => (
                <span key={i} style={{
                  width: 30, height: 30, borderRadius: 999, marginLeft: i ? -8 : 0,
                  background: ch === '?' ? 'rgba(255,255,255,.25)' : 'linear-gradient(135deg,#E32459,#B81C47)',
                  border: '2px solid rgba(255,255,255,.85)', color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11.5, fontWeight: 800,
                  animation: `qrPop .45s cubic-bezier(.3,1.4,.4,1) ${.35 + i * .09}s both`,
                }}>{ch}</span>
              ))}
              <span style={{ alignSelf: 'center', marginLeft: 8, fontSize: 11.5, fontWeight: 700,
                color: 'rgba(255,255,255,.8)', animation: 'qrPop .45s ease .6s both' }}>ti stanno aspettando</span>
            </div>
          </div>
        )}
      </div>

      {phase === 'scan' ? (
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, fontWeight: 600, marginTop: 22 }}>
          Lettura del QR del tavolo…
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20,
          animation: 'qrPop .5s cubic-bezier(.3,1.3,.4,1) .45s both' }}>
          <img src="assets/mascot-wave.png" alt="" style={{ width: 58,
            filter: 'drop-shadow(0 8px 14px rgba(227,36,89,.4))', animation: 'bkBob 2.6s ease-in-out infinite' }}/>
          <div style={{ background: 'rgba(255,255,255,.95)', color: '#1c0f15', fontSize: 12.5, fontWeight: 700,
            padding: '9px 14px', borderRadius: '16px 16px 16px 4px' }}>Ti porto al menù!</div>
        </div>
      )}
    </div>
  );
}

function BottomTabBar({ active = 'home', onHome, onProfile, onSearch, onByuppini, onQR, showQR = true, forceDark = false }) {
  const [T] = BK.useByupTheme();
  const dark = forceDark || T.dark;
  const islandStyle = {
    flex: 1, height: 60, borderRadius: 999, position: 'relative',
    background: dark ? 'rgba(32,30,28,.48)' : 'rgba(255,255,255,.34)',
    border: `1px solid ${dark ? 'rgba(246,236,233,.14)' : 'rgba(255,255,255,.65)'}`,
    backdropFilter: 'blur(13px) saturate(165%)', WebkitBackdropFilter: 'blur(13px) saturate(165%)',
    boxShadow: dark
      ? '0 16px 34px -14px rgba(0,0,0,.6), inset 0 1px 0 rgba(246,236,233,.08)'
      : '0 16px 34px -16px rgba(77,18,46,.32), inset 0 1px 0 rgba(255,255,255,.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
  };
  const inactive = dark ? 'rgba(246,236,233,.5)' : 'rgba(77,18,46,.42)';
  const coral = forceDark ? '#ff3d6e' : T.primary;
  // mattonella coral che scivola dentro l'isola (gooey, senza overshoot).
  // NB: funzioni render, NON componenti inline: un componente definito nel corpo
  // cambia identità a ogni render e React lo rimonterebbe (animazione in loop).
  const renderTile = (pos) => (
    <span aria-hidden style={{
      position: 'absolute', top: '50%', left: '50%',
      width: 48, height: 48, zIndex: 1,
      transform: 'translate(-50%,-50%)',
      transition: 'left .45s cubic-bezier(.3,.9,.3,1)',
    }}>
      <span key={pos} style={{
        position: 'absolute', inset: 0, borderRadius: 17,
        background: dark ? 'rgba(255,61,110,.16)' : 'rgba(227,36,89,.12)',
        border: `1px solid ${dark ? 'rgba(255,61,110,.3)' : 'rgba(227,36,89,.2)'}`,
        animation: 'tiGoo .45s cubic-bezier(.3,.9,.3,1)',
      }}/>
    </span>
  );
  const renderBtn = (I, act, onClick, size = 24) => (
    <button onClick={() => { BK.haptic.selection(); onClick?.(); }} style={{
      position: 'relative', zIndex: 2, width: 52, height: 52,
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform .4s cubic-bezier(.3,1.1,.35,1)',
      transform: act ? 'scale(1.06)' : 'scale(1)',
    }}>
      <I size={size} color={act ? coral : inactive} fill={act ? coral : 'none'}/>
    </button>
  );
  const leftPos = active === 'home' ? 0 : null;
  const rightPos = active === 'profile' ? 0 : null;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
      padding: '0 14px calc(env(safe-area-inset-bottom, 0px) + 10px)',
      pointerEvents: 'none',
    }}>
      <style>{`@keyframes tiGoo{0%{transform:scale(1)}45%{transform:scale(1.22,.84)}100%{transform:scale(1)}}
@keyframes tiBreath{0%,100%{box-shadow:0 14px 30px -10px rgba(227,36,89,.6), 0 0 0 4px ${dark ? 'rgba(32,30,28,.9)' : 'rgba(255,255,255,.9)'}}50%{box-shadow:0 18px 40px -8px rgba(227,36,89,.85), 0 0 0 6px ${dark ? 'rgba(32,30,28,.95)' : 'rgba(255,255,255,.95)'}}}`}</style>
      {/* fade dietro il dock: il contenuto sfuma senza barra piena */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 108, pointerEvents: 'none',
        background: `linear-gradient(180deg, transparent 0%, ${dark ? 'rgba(15,11,14,.55)' : 'rgba(251,244,241,.72)'} 62%, ${dark ? 'rgba(15,11,14,.92)' : 'rgba(251,244,241,.96)'} 100%)`,
      }}/>
      <div style={{ position: 'relative', display: 'flex', gap: showQR ? 64 : 14, pointerEvents: 'auto' }}>
        <div style={islandStyle}>
          {leftPos !== null && renderTile(leftPos)}
          {renderBtn(Icon.Home, active === 'home', onHome)}
        </div>
        {showQR && (
          <button className="bk-press" onClick={() => { BK.haptic.light(); (onQR || window.__byupQR)?.(); }} style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -56%)',
            width: 62, height: 62, borderRadius: 999, border: 'none', zIndex: 3,
            background: `linear-gradient(135deg, ${coral} 0%, ${PINK_DARK} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', animation: 'tiBreath 3.2s ease-in-out infinite',
          }}>
            <span style={{ display: 'flex', animation: 'bkBob 3.2s ease-in-out infinite' }}>
              <Icon.QR size={28}/>
            </span>
          </button>
        )}
        <div style={islandStyle}>
          {rightPos !== null && renderTile(rightPos)}
          {renderBtn(Icon.User, active === 'profile', onProfile)}
        </div>
      </div>
    </div>
  );
}
window.BottomTabBar = BottomTabBar;

// ─── Mount ─────────────────────────────────────────────────
function ShortcutsPanel() {
  const params = (() => { try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); } })();
  const cur = params.get('auth') || params.get('page') || 'home';
  const curVenue = params.get('venue') || 'original'; // allineato al default del dispatcher VenueScreen
  const homeItems = [
    { id: 'login',      label: 'Login',                 href: 'byup Home.html?auth=login' },
    { id: 'register',   label: 'Registrazione',         href: 'byup Home.html?auth=register' },
    { id: 'home',       label: 'Home',                  href: 'byup Home.html' },
    { id: 'home-empty', label: 'Home — nessun locale',  href: 'byup Home.html?page=home-empty' },
    { id: 'map',        label: 'Mappa',                 href: 'byup Home.html?page=map' },
    { id: 'posta',      label: 'Posta',                 href: 'byup Home.html?page=posta' },
  ];
  const menuItems = [
    { id: 'menu',      label: 'Menu',             href: 'byup Menu.html' },
    { id: 'pay',       label: 'Pagamento',        href: 'byup Menu.html#pay' },
    { id: 'paymethod', label: 'Metodo pagamento', href: 'byup Menu.html#paymethod' },
    { id: 'success',   label: 'Successo',         href: 'byup Menu.html#success' },
  ];
  // Stili di vetrina (in produzione li sceglie il ristoratore dal gestionale).
  const venueStyles = [
    { id: 'original', label: 'Classico',  desc: 'Classico (default)' },
    { id: 'a',        label: 'A',         desc: 'Editorial / Magazine' },
    { id: 'b',        label: 'B',         desc: 'Cinematic / Tasting' },
    { id: 'c',        label: 'C',         desc: 'Operativo / Resy' },
    { id: 'premium',  label: '★',         desc: 'Premium byup' },
  ];
  const row = (s) => {
    const active = s.id === cur;
    return (
      <a key={s.id} href={s.href} style={{
        padding: '6px 12px', fontSize: 12.5, borderRadius: 8,
        background: active ? '#E32459' : 'transparent',
        color: active ? '#fff' : '#1a1a1a',
        fontWeight: 600, textAlign: 'left', textDecoration: 'none',
        display: 'block',
      }}>{s.label}</a>
    );
  };
  return (
    <div className="byup-screen-nav" style={{
      position: 'fixed', top: 20, right: 20, zIndex: 100,
      background: SURF, borderRadius: 14, padding: 8,
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', gap: 4,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9a8f93', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Schermate</div>
      {homeItems.map(row)}

      {/* Toggle stile vetrina */}
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9a8f93', padding: '6px 8px 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Vetrina · stile</div>
      <div style={{ display: 'flex', gap: 4, padding: '0 4px 2px' }}>
        {venueStyles.map(v => {
          const active = cur === 'venue' && curVenue === v.id;
          return (
            <a key={v.id} href={`byup Home.html?page=venue&venue=${v.id}`} title={v.desc} style={{
              flex: v.id === 'original' ? 1.6 : 1,
              padding: '6px 4px', fontSize: 12, borderRadius: 8,
              background: active ? '#E32459' : TINT,
              color: active ? '#fff' : '#1a1a1a',
              fontWeight: 700, textAlign: 'center', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>{v.label}</a>
          );
        })}
      </div>

      {menuItems.map(row)}
    </div>
  );
}

function Root() {
  // Auth gate — mostra il flusso di login/registrazione PRIMA della Home.
  // Bypass: ?auth=login|register forza l'auth; un deep-link ?page=… (venue,
  // mappa, profilo…) o l'aver già completato l'onboarding saltano l'auth.
  const params = (() => { try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); } })();
  const forceAuth = params.get('auth'); // 'login' | 'register' | null
  const hasDeepLink = !!params.get('page');
  const stored = (() => { try { return localStorage.getItem('byup_auth') === '1'; } catch { return false; } })();

  const [authed, setAuthed] = useState(forceAuth ? false : (stored || hasDeepLink));
  const permsDecided = (() => { try { return localStorage.getItem('byup_perms') === '1'; } catch { return false; } })();
  const [permsPending, setPermsPending] = useState(false);
  const fromRegisterRef = useRef(false);
  const [recoveryArmed, setRecoveryArmed] = useState(false);
  const completeAuth = (opts = {}) => {
    try { localStorage.setItem('byup_auth', '1'); } catch {}
    setAuthed(true);
    fromRegisterRef.current = !!opts.fromRegister;
    if (opts.fromRegister) { try { localStorage.removeItem('byup_perms'); } catch {} }
    if (!permsDecided || opts.fromRegister) setPermsPending(true);
  };
  const finishPerms = () => {
    try { localStorage.setItem('byup_perms', '1'); } catch {}
    setPermsPending(false);
    if (fromRegisterRef.current) setRecoveryArmed(true);
  };
  const AF = window.AuthFlow;
  const AP = window.AuthPermissions;

  return (
    <div data-screen-label="byup Home" style={{
      minHeight: '100vh', background: __BYUP_DARK ? '#0e0d0f' : '#ececec',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <IOSDevice width={402} height={874}>
        {authed || !AF
          ? <App recoveryArmed={recoveryArmed}/>
          : <AF initial={forceAuth === 'register' ? 'register' : 'login'} onAuthenticated={completeAuth}/>}
        {authed && permsPending && AP && <AP onDone={finishPerms}/>}
      </IOSDevice>
      <ShortcutsPanel/>
    </div>
  );
}

Object.assign(window, { HomeSections, Icon, PINK, PINK_DARK, TEXT, MUTED, BORDER, BG_GRAY });

/* sync */
const __byupRoot = document.getElementById('root');
if (__byupRoot) ReactDOM.createRoot(__byupRoot).render(<Root/>);

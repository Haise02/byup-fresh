// byup — Home screen prototype v2
const { useState, useRef, useEffect } = React;

const PINK = '#FF5A5F';
const PINK_DARK = '#E04347';
const TEXT = '#1a1a1a';
const MUTED = '#6b6b6b';
const BORDER = '#e5e5e5';
const BG_GRAY = '#f5f5f5';
const BG_CHIP = '#f2f2f2';

// ─── Icons (coherent line set, stroke=1.7) ─────────────────
const Icon = {
  Map: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 4 15 6 21 4 21 18 15 20 9 18 3 20 3 6"/>
      <line x1="9" y1="4" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="20"/>
    </svg>
  ),
  Bell: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z"/>
      <path d="M10.3 21a1.94 1.94 0 003.4 0"/>
    </svg>
  ),
  Search: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="21" y1="21" x2="16.5" y2="16.5"/>
    </svg>
  ),
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
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  Clock: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15 14"/>
    </svg>
  ),
  Star: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill={p.fill||'#FFB400'} stroke="none">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/>
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
    <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill={p.fill||'none'} stroke={p.color||TEXT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 L12 4 L20 11 L20 20 L14 20 L14 14 L10 14 L10 20 L4 20 Z"/>
    </svg>
  ),
  User: (p) => (
    <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.color||TEXT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"/>
    </svg>
  ),
  QR: (p) => (
    <svg width={p.size||30} height={p.size||30} viewBox="0 0 32 32" fill="none" stroke={p.color||'#fff'} strokeWidth="2" strokeLinecap="square">
      <rect x="4" y="4" width="9" height="9"/>
      <rect x="19" y="4" width="9" height="9"/>
      <rect x="4" y="19" width="9" height="9"/>
      <rect x="7" y="7" width="3" height="3" fill={p.color||'#fff'}/>
      <rect x="22" y="7" width="3" height="3" fill={p.color||'#fff'}/>
      <rect x="7" y="22" width="3" height="3" fill={p.color||'#fff'}/>
      <rect x="19" y="19" width="3" height="3" fill={p.color||'#fff'}/>
      <rect x="25" y="25" width="3" height="3" fill={p.color||'#fff'}/>
      <rect x="19" y="25" width="3" height="3" fill={p.color||'#fff'}/>
      <rect x="25" y="19" width="3" height="3" fill={p.color||'#fff'}/>
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
function Photo({ src, label, tone = 'a' }) {
  const fallback = PHOTO_BY_TONE[tone] || PHOTO_BY_TONE.a;
  const url = src || `https://images.unsplash.com/${fallback}?w=600&q=70&auto=format&fit=crop`;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `url("${url}")`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: '#e8d9c9',
    }} aria-label={label}/>
  );
}
const PhotoPlaceholder = Photo; // alias for back-compat

// ─── Category chip ──────────────────────────────────────────
function Category({ icon: I, art: Art, emoji, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      flex: '0 0 auto', width: 78, fontFamily: 'inherit',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 0 0 3px ' + PINK + ', 0 6px 14px rgba(233,30,99,0.25)' : '0 4px 10px rgba(0,0,0,0.08)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f6f4f5 100%)',
      }}>
        {emoji ? (
          <div style={{ position: 'relative', lineHeight: 1 }}>
            <span style={{
              fontSize: 36, lineHeight: 1,
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))',
            }}>{emoji}</span>
            {label === 'Senza glutine' && (
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <line x1="10" y1="46" x2="46" y2="10" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
                <line x1="10" y1="46" x2="46" y2="10" stroke="#e63946" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        ) : Art ? <Art size={56}/> : <I size={28} color={TEXT}/>}
      </div>
      <span style={{
        fontSize: 12.5, fontWeight: active ? 700 : 500,
        color: active ? PINK : TEXT, whiteSpace: 'nowrap',
      }}>{label}</span>
    </button>
  );
}

// ─── Quick filter chip ──────────────────────────────────────
function FilterChip({ label, active, onClick, leading }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', height: 34, padding: '0 14px',
      borderRadius: 999, border: `1.5px solid ${active ? PINK : '#e0e0e0'}`,
      background: active ? '#fde8ef' : '#fff',
      color: active ? PINK : TEXT,
      fontSize: 13.5, fontWeight: active ? 600 : 500,
      fontFamily: 'inherit', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.15s',
    }}>
      {leading}
      {label}
    </button>
  );
}

// ─── Favorite card (compact, horizontal) ────────────────────
function FavoriteCard({ name, type, tone, photo, distance, hours, openHour, closeHour, open, onClick, onUnfav }) {
  // hours can be 'HH:MM – HH:MM' format; split in two
  const [oh, ch] = (hours && hours.includes('–'))
    ? hours.split('–').map(s => s.trim())
    : [openHour || '–', closeHour || hours || '–'];
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', width: 150, borderRadius: 16, overflow: 'hidden',
      position: 'relative', border: 'none', padding: 0, cursor: 'pointer',
      background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      fontFamily: 'inherit', textAlign: 'left',
    }}>
      <div style={{ height: 100, position: 'relative' }}>
        <Photo src={photo} label={name} tone={tone}/>
        <span role="button" tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onUnfav?.(); }} style={{
          position: 'absolute', top: 8, right: 8, width: 28, height: 28,
          borderRadius: 999, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>
          <Icon.Heart size={15} fill="#fff" color="#fff"/>
        </span>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{type}</span>
          <span>·</span>
          <Icon.Pin size={10}/>
          <span>{distance}</span>
        </div>
        <div style={{ fontSize: 11, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: open ? '#0a8a3a' : '#c44' }}/>
          <span style={{ color: open ? '#0a8a3a' : '#c44', fontWeight: 700 }}>{open ? 'Aperto' : 'Chiuso'}</span>
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
          <span>{oh} – {ch}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Event card (large with date badge) ─────────────────────
function EventCard({ title, place, tone, photo, date, time, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', width: 220, height: 160, borderRadius: 18, overflow: 'hidden',
      position: 'relative', border: 'none', padding: 0, cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
      fontFamily: 'inherit', textAlign: 'left',
    }}>
      <Photo src={photo} label={title} tone={tone}/>
      {/* gradient overlay for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)',
      }}/>
      {/* date pill */}
      {date && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(255,255,255,0.95)', borderRadius: 10,
          padding: '4px 9px', textAlign: 'center', minWidth: 38,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: PINK, letterSpacing: 0.6, lineHeight: 1.1 }}>{date.month}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1, marginTop: 1 }}>{date.day}</div>
        </div>
      )}
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 12, color: '#fff',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.95, marginTop: 2 }}>{place}</div>
        {time && <div style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.9, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.Clock size={11} color="#fff"/> {time}
        </div>}
      </div>
    </button>
  );
}

// ─── Promo card (highlight discount) ────────────────────────
function PromoCard({ title, place, tone, photo, discount, hours, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', width: 200, height: 180, borderRadius: 18, overflow: 'hidden',
      position: 'relative', border: 'none', padding: 0, cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
      fontFamily: 'inherit', textAlign: 'left',
    }}>
      <Photo src={photo} label={place} tone={tone}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)',
      }}/>
      {discount && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: PINK, color: '#fff',
          padding: '6px 10px', borderRadius: 10,
          boxShadow: '0 2px 8px rgba(233,30,99,0.35)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{discount}</div>
        </div>
      )}
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 12, color: '#fff',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 12.5, fontWeight: 400, opacity: 0.95, marginTop: 2 }}>{place}</div>
        {hours && <div style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.9, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.Clock size={11} color="#fff"/> {hours}
        </div>}
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
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
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
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>{item.title || item.name}</div>
          <button onClick={(e) => e.stopPropagation()} style={{
            width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${BORDER}`,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            ? <Tag style={{ color: '#0a8a3a' }}>Aperto · chiude alle {closeAt}</Tag>
            : <Tag style={{ color: '#aa2222' }}>Chiuso</Tag>}
        </div>
        <div style={{ fontSize: 13.5, color: '#3a3a3a', lineHeight: 1.5, marginBottom: 16 }}>
          {item.date
            ? `Evento ${item.date.day} ${item.date.month}${item.time ? ` · ore ${item.time}` : ''}. Tap sulla foto per aprire la vetrina del locale.`
            : 'Tap sulla foto o sul pulsante per aprire la vetrina del locale.'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onMenu} style={{
            flex: 1, height: 50, borderRadius: 14, border: `1.5px solid ${BORDER}`,
            background: '#fff', color: TEXT, fontSize: 15, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>Menù</button>
          <button onClick={onBook} style={{
            flex: 1.2, height: 50, borderRadius: 14, border: 'none',
            background: PINK, color: '#fff', fontSize: 15, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>Prenota</button>
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
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 22px 24px', animation: 'slideUp 0.3s cubic-bezier(.2,.8,.2,1)',
        maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#d0d0d0', borderRadius: 2, margin: '4px auto 14px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={reset} style={{
            background: 'none', border: 'none', color: MUTED,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
          }}>Reset</button>
          <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Filtra per tipologia</div>
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
                <svg width="32" height="32" viewBox="0 0 24 24"
                  fill={n <= minRating ? '#FFB400' : 'none'}
                  stroke={n <= minRating ? '#FFB400' : '#d0d0d0'} strokeWidth="1.6" strokeLinejoin="round">
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
      background: active ? '#fde8ef' : '#fff',
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
function Toggle({ label, value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: '100%', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '12px 0',
      borderBottom: `1px solid ${BORDER}`, cursor: 'pointer',
    }}>
      <span style={{ fontSize: 15, color: TEXT }}>{label}</span>
      <div style={{
        width: 44, height: 26, borderRadius: 999,
        background: value ? PINK : '#d8d8d8',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 999, background: '#fff',
          position: 'absolute', top: 2, left: value ? 20 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}/>
      </div>
    </div>
  );
}

// ─── Notifications panel ────────────────────────────────────
function NotifSheet({ open, onClose }) {
  if (!open) return null;
  const items = [
    { icon: '🎉', title: 'Al Settembrini', text: 'Ha pubblicato un nuovo menu di stagione', time: '2h' },
    { icon: '🔥', title: 'Promo lampo', text: '-30% da Mario fino alle 22', time: '5h' },
    { icon: '⭐', title: 'Nuova recensione', text: 'Hai ricevuto una risposta', time: '1g' },
    { icon: '📅', title: 'Promemoria', text: 'Cena prenotata domani alle 20:30', time: '1g' },
  ];
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 70,
        animation: 'fade 0.2s ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 20px', animation: 'slideUp 0.3s cubic-bezier(.2,.8,.2,1)',
        maxHeight: '70%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#d0d0d0', borderRadius: 2, margin: '4px auto 14px' }}/>
        <div style={{ padding: '0 20px 12px', fontSize: 20, fontWeight: 700, color: TEXT }}>Notifiche</div>
        {items.map((n, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '12px 20px', borderTop: `1px solid ${BORDER}`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999, background: BG_GRAY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{n.icon}</div>
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

// ─── Moment FAB (Pranzo / Cena / Notte) ─────────────────────
function MomentFab({ moment, setMoment, open, setOpen }) {
  const moments = [
    { id: 'pranzo', label: 'Pranzo', icon: <SunIcon/>, angle: -180 },
    { id: 'cena',   label: 'Cena',   icon: <DishIcon/>, angle: -135 },
    { id: 'notte',  label: 'Notte',  icon: <MoonIcon/>, angle:  -90 },
  ];
  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 28,
          background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(2px)',
          animation: 'fade 0.18s ease',
        }}/>
      )}
      <div style={{
        position: 'absolute', right: 22, bottom: 110, zIndex: 29,
        width: 56, height: 56,
      }}>
        {/* radial options */}
        {open && moments.map(m => {
          const r = 78;
          const rad = (m.angle * Math.PI) / 180;
          const dx = Math.cos(rad) * r;
          const dy = Math.sin(rad) * r;
          const active = moment === m.id;
          return (
            <button key={m.id} onClick={() => { setMoment(active ? null : m.id); setOpen(false); }} style={{
              position: 'absolute', left: 4, top: 4,
              width: 48, height: 48, borderRadius: 999,
              border: 'none',
              background: active ? PINK : '#fff',
              color: active ? '#fff' : PINK,
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 0,
              cursor: 'pointer',
              transform: `translate(${dx}px, ${dy}px)`,
              transition: 'transform 0.25s cubic-bezier(.2,.9,.3,1.3), background 0.15s',
              fontFamily: 'inherit', fontSize: 9, fontWeight: 600,
            }}>
              <div style={{ marginBottom: 2 }}>{React.cloneElement(m.icon, { color: active ? '#fff' : PINK })}</div>
              {m.label}
            </button>
          );
        })}
        <button onClick={() => setOpen(o => !o)} style={{
          width: 56, height: 56, borderRadius: 999,
          border: 'none',
          background: moment ? PINK : '#fff',
          boxShadow: moment
            ? '0 6px 16px rgba(233,30,99,0.45)'
            : '0 4px 14px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={moment ? '#fff' : PINK} strokeWidth="2.4" strokeLinecap="round"
            style={{ transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      {/* active moment label */}
      {moment && !open && (
        <div style={{
          position: 'absolute', right: 86, bottom: 124, zIndex: 27,
          background: PINK, color: '#fff', fontSize: 12, fontWeight: 600,
          padding: '5px 10px', borderRadius: 999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          animation: 'fade 0.2s ease',
        }}>
          {moment === 'pranzo' ? 'Pranzo' : moment === 'cena' ? 'Cena' : 'Notte'}
        </div>
      )}
    </>
  );
}
function SunIcon({ color = PINK }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="3" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="21"/>
      <line x1="3" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="21" y2="12"/>
      <line x1="5.6" y1="5.6" x2="7" y2="7"/>
      <line x1="17" y1="17" x2="18.4" y2="18.4"/>
      <line x1="5.6" y1="18.4" x2="7" y2="17"/>
      <line x1="17" y1="7" x2="18.4" y2="5.6"/>
    </svg>
  );
}
function DishIcon({ color = PINK }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h18a9 9 0 00-18 0z"/>
      <line x1="2" y1="17" x2="22" y2="17"/>
      <path d="M12 11V8"/>
    </svg>
  );
}
function MoonIcon({ color = PINK }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>
    </svg>
  );
}

// ─── Search overlay (recenti + popolari) ────────────────────
const SEARCH_RECENTS = [
  'Pizzeria napoletana',
  'Sushi all you can eat',
  'Aperitivo con vista',
  'Brunch domenicale',
  'Cocktail bar',
];
const SEARCH_POPULAR = [
  'Ristorante italiano',
  'Ristorante giapponese',
  'Ristorante messicano',
  'Ristorante indiano',
  'Ristorante cinese',
  'Ristorante francese',
  'Ristorante spagnolo',
  'Ristorante tailandese',
  'Ristorante greco',
  'Hamburger gourmet',
  'Pasticceria',
  'Vegan bowl',
];

function SearchScreen({ onBack, onSubmit, onOpenFilters, activeFilterCount }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = (term) => onSubmit(term);
  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT,
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 60, paddingBottom: 30 }}>
        <div style={{ padding: '8px 22px 0' }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 999, background: '#f3f3f3',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 6 9 12 15 18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '16px 22px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 50, borderRadius: 999, border: `1.5px solid #e0e0e0`,
            padding: '0 16px', background: '#fff',
          }}>
            <input ref={inputRef}
              value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) submit(q.trim()); }}
              placeholder="Cerca per tipologia"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 15, color: TEXT, fontFamily: 'inherit' }}
            />
            <button onClick={onOpenFilters} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4, position: 'relative',
            }}>
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

        {q.trim().length === 0 && (
          <>
            <div style={{ padding: '24px 22px 6px', fontSize: 15, fontWeight: 700, color: TEXT }}>
              Ricerche recenti
            </div>
            {SEARCH_RECENTS.map((r, i) => (
              <button key={i} onClick={() => submit(r)} style={{
                width: '100%', textAlign: 'left', padding: '14px 22px',
                background: 'none', border: 'none', borderBottom: `1px solid ${BORDER}`,
                fontSize: 14.5, color: TEXT, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Icon.Clock size={16} color={MUTED}/>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{r}</span>
              </button>
            ))}

            <div style={{ padding: '24px 22px 6px', fontSize: 15, fontWeight: 700, color: TEXT }}>
              Più cercati questa settimana
            </div>
            {SEARCH_POPULAR.map((r, i) => (
              <button key={i} onClick={() => submit(r)} style={{
                width: '100%', textAlign: 'left', padding: '14px 22px',
                background: 'none', border: 'none', borderBottom: `1px solid ${BORDER}`,
                fontSize: 14.5, color: TEXT, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, background: '#fde8ef',
                  color: PINK, fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i+1}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{r}</span>
              </button>
            ))}
          </>
        )}

        {q.trim().length > 0 && (
          <>
            <div style={{ padding: '20px 22px 6px', fontSize: 13, color: MUTED, fontWeight: 600 }}>
              Suggerimenti
            </div>
            {SEARCH_POPULAR.filter(r => r.toLowerCase().includes(q.toLowerCase())).slice(0, 6).map((r, i) => (
              <button key={i} onClick={() => submit(r)} style={{
                width: '100%', textAlign: 'left', padding: '14px 22px',
                background: 'none', border: 'none', borderBottom: `1px solid ${BORDER}`,
                fontSize: 14.5, color: TEXT, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Icon.Search size={16}/>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{r}</span>
              </button>
            ))}
            <button onClick={() => submit(q.trim())} style={{
              width: '100%', textAlign: 'left', padding: '14px 22px',
              background: 'none', border: 'none', fontSize: 14.5, color: PINK,
              fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Icon.Search size={16} color={PINK}/>
              <span>Cerca "{q.trim()}"</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Results screen (lista locali) ──────────────────────────
const RESULT_VENUES = [
  { name: 'Ristorante Cacio e Pepe', cuisine: 'Cucina italiana', city: 'Roma, Italia', distance: '3km',
    rating: 4.7, open: true, hours: 'chiude alle ore 23:00', topOffer: true,
    photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=70&auto=format&fit=crop' },
  { name: 'Ristorante da Cecio', cuisine: 'Cucina italiana', city: 'Roma, Italia', distance: '3km',
    rating: 4.5, open: true, hours: 'chiude alle ore 23:00', topOffer: true,
    photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70&auto=format&fit=crop' },
  { name: 'Da Michele Pizzeria', cuisine: 'Pizzeria', city: 'Roma, Italia', distance: '3km',
    rating: 4.8, open: true, hours: 'chiude alle ore 23:00', topOffer: true,
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=70&auto=format&fit=crop' },
  { name: 'Trattoria Lucia', cuisine: 'Cucina romana', city: 'Roma, Italia', distance: '0.6km',
    rating: 4.6, open: true, hours: 'chiude alle ore 23:30',
    photo: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop' },
  { name: 'Hops & Co', cuisine: 'Pub', city: 'Roma, Italia', distance: '1.5km',
    rating: 4.3, open: false, hours: 'apre alle 18:00',
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=70&auto=format&fit=crop' },
  { name: 'Lounge 22', cuisine: 'Cocktail bar', city: 'Roma, Italia', distance: '1.1km',
    rating: 4.4, open: true, hours: 'chiude alle ore 02:00',
    photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=70&auto=format&fit=crop' },
];

function ResultsScreen({ query, onBack, onOpenFilters, activeFilterCount, onOpenVenue }) {
  const [sort, setSort] = useState('Top offer');
  const [sortOpen, setSortOpen] = useState(false);
  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT,
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 60, paddingBottom: 100 }}>
        <div style={{ padding: '8px 22px 0' }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 999, background: '#f3f3f3',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 6 9 12 15 18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '14px 22px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: PINK, letterSpacing: -0.4 }}>
            Cosa fare oggi?
          </div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 2 }}>
            Scopri i locali suggeriti per te
          </div>
        </div>

        <div style={{ padding: '14px 22px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 48, borderRadius: 999, border: `1.5px solid #e0e0e0`,
            padding: '0 16px', background: '#fff',
          }}>
            <span style={{ flex: 1, fontSize: 14, color: TEXT }}>{query || 'Cerca…'}</span>
            <button onClick={onOpenFilters} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4, position: 'relative',
            }}>
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

        <div style={{ padding: '18px 22px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
            {RESULT_VENUES.length} Risultati
          </div>
          <button onClick={() => setSortOpen(o=>!o)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, color: TEXT, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>Ordina per</span>
            <span style={{ color: PINK, fontWeight: 600 }}>{sort}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={PINK} stroke="none">
              <polygon points="6 9 18 9 12 16"/>
            </svg>
          </button>
        </div>

        {sortOpen && (
          <div style={{ padding: '4px 22px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Top offer','Distanza','Valutazione','Prezzo'].map(s => (
              <button key={s} onClick={() => { setSort(s); setSortOpen(false); }} style={{
                padding: '6px 12px', borderRadius: 999,
                border: `1px solid ${sort === s ? PINK : BORDER}`,
                background: sort === s ? '#fde8ef' : '#fff',
                color: sort === s ? PINK : TEXT, fontSize: 12.5, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>{s}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 18px 0' }}>
          {RESULT_VENUES.map((v, i) => (
            <ResultCard key={i} {...v}
              onClick={() => onOpenVenue({ ...v, _from: 'results' })}
              onMenu={() => { window.location.href = 'byup Menu.html?from=venue'; }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ name, cuisine, city, distance, rating, open, hours, topOffer, photo, onClick, onMenu }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)', cursor: 'pointer',
    }}>
      <div style={{ height: 150, position: 'relative' }}>
        <Photo src={photo} label={name}/>
        {topOffer && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: PINK, color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(233,30,99,0.35)',
          }}>Top offer</div>
        )}
      </div>
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, flex: 1, lineHeight: 1.2 }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Icon.Star size={14}/>
            <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{rating.toFixed(1)}</span>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{cuisine}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: '#cfcfcf' }}/>
          <span>{city}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: '#cfcfcf' }}/>
          <span>{distance}</span>
        </div>
        <div style={{ fontSize: 12.5, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: open ? '#0a8a3a' : '#c44', fontWeight: 700 }}>
            {open ? 'Aperto' : 'Chiuso'}
          </span>
          <span style={{ width: 1, height: 12, background: '#dcdcdc' }}/>
          <span style={{ color: MUTED }}>{hours}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onMenu?.(); }} style={{
          marginTop: 12, width: '100%', height: 42, borderRadius: 999, border: 'none',
          background: '#3a0d1a', color: '#fff', fontSize: 14, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
        }}>Visualizza menù</button>
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
function BookingHomeCard({ booking, onCancel, onScanQr }) {
  if (!booking) return null;
  const [expanded, setExpanded] = React.useState(true);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  // Tone palette — warm sand / clay, pleasant on a busy home
  const SAND_BG = '#f6efe5';      // card bg
  const SAND_ACCENT = '#7a4a2a';  // dark warm for eyebrow / icon
  const SAND_PILL_BG = '#ecdfca';
  const SAND_BORDER = '#e8dac1';

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
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2, letterSpacing: -0.3, color: '#3a2410' }}>{booking.venue}</div>
        </div>

        {expanded && (
          <>
            <div style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 14,
              background: 'rgba(255,255,255,0.55)',
              fontSize: 12.5, color: '#3a2410', lineHeight: 1.45,
            }}>
              <span style={{ fontWeight: 700 }}>Quando arrivi al locale</span>, scansiona il QR sul tavolo per associarti e ordinare dall'app insieme ai tuoi coperti.
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setConfirmCancel(true)} style={{
                flex: 1, height: 42, borderRadius: 999, border: `1.5px solid ${SAND_BORDER}`,
                background: 'transparent', color: SAND_ACCENT,
                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}>Annulla</button>
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

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div onClick={() => setConfirmCancel(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 18, padding: 22,
            maxWidth: 320, width: '100%',
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 6 }}>Annullare la prenotazione?</div>
            <div style={{ fontSize: 13.5, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
              Stai per annullare la prenotazione da <b>{booking.venue}</b> del {booking.date} alle {booking.time}.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmCancel(false)} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: '#fff', border: `1px solid ${BORDER}`, color: TEXT,
                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}>Indietro</button>
              <button onClick={() => { setConfirmCancel(false); onCancel && onCancel(); }} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: '#c0392b', border: 'none', color: '#fff',
                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pure presentational — every action is a callback prop.
// `topBar`: rendered ABOVE the sticky header (greeting/search/chips) — for
// banners that should sit at the very top of the home (booking, alerts).
// `before`: rendered just below the sticky header, above "I tuoi preferiti".
function HomeSections({
  topBar,
  before,
  activeCat, setActiveCat,
  quickFilters, setQuickFilters,
  activeFilterCount = 0,
  onMap, onPosta, onSearch, onFilters,
  onCardClick,
}) {
  const cats = [
    { id: 'pizza',   label: 'Pizza',         emoji: '🍕' },
    { id: 'sushi',   label: 'Sushi',         emoji: '🍣' },
    { id: 'burger',  label: 'Burger',        emoji: '🍔' },
    { id: 'gelato',  label: 'Gelato',        emoji: '🍦' },
    { id: 'panini',  label: 'Panini',        emoji: '🥪' },
    { id: 'brunch',  label: 'Brunch',        emoji: '🥐' },
    { id: 'cock',    label: 'Cocktail',      emoji: '🍹' },
    { id: 'vegan',   label: 'Vegano',        emoji: '🥗' },
    { id: 'gf',      label: 'Senza glutine', emoji: '🌾' },
    { id: 'healthy', label: 'Healthy',       emoji: '🥑' },
  ];
  const favorites = [
    { name: 'Al Settembrini', type: 'Ristorante', distance: '0.4 km', hours: '12:30 – 23:00', open: true,
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=70&auto=format&fit=crop' },
    { name: "All'Impronta", type: 'Ristorante', distance: '0.8 km', hours: '19:00 – 24:00', open: true,
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70&auto=format&fit=crop' },
    { name: 'Lounge 22', type: 'Cocktail', distance: '1.1 km', hours: '18:00 – 02:00', open: true,
      photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=70&auto=format&fit=crop' },
    { name: 'Hops & Co', type: 'Pub', distance: '1.5 km', hours: 'Apre alle 18:00', open: false,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop' },
  ];
  const events = [
    { title: 'Capodanno', place: 'Al Settembrini', date: { month: 'DIC', day: '31' }, time: '21:00',
      photo: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=70&auto=format&fit=crop' },
    { title: 'Veglione', place: "All'Impronta", date: { month: 'DIC', day: '31' }, time: '20:30',
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { title: 'Live Jazz', place: 'Blue Note', date: { month: 'GEN', day: '07' }, time: '22:00',
      photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70&auto=format&fit=crop' },
  ];
  const promos = [
    { title: 'Veglione', place: 'Al Settembrini', discount: '-30%', hours: 'Oggi · fino 23:00',
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { title: 'Cena natalizia', place: 'Da Mario', discount: '-20%', hours: 'Oggi · 19:00 – 23:30',
      photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=70&auto=format&fit=crop' },
    { title: 'Aperitivo', place: 'Lounge 22', discount: '2x1', hours: 'Oggi · 18:00 – 21:00',
      photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=70&auto=format&fit=crop' },
  ];
  const suggested = [
    { title: 'Trattoria Lucia', place: 'Cucina romana · 0.6 km', tone: 'a', discount: '★ 4.8' },
    { title: 'Hops & Co', place: 'Pub · 1.5 km', tone: 'd', discount: '★ 4.6' },
    { title: 'Vinaio', place: 'Wine bar · 0.9 km', tone: 'e', discount: '★ 4.7' },
  ];
  const click = (item) => onCardClick?.(item);
  return (
    <>
      {topBar}
      {/* === STICKY TOP — only header + search stay fixed === */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: '#fff',
        paddingTop: topBar ? 12 : 24,
        marginTop: topBar ? 0 : -24,
        paddingBottom: 14,
        boxShadow: '0 1px 0 #f0f0f0',
      }}>
        {/* Header */}
        <div style={{ padding: '10px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Buonasera 👋</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: PINK, lineHeight: 1.1, letterSpacing: -0.5, marginTop: 2 }}>
              Cosa fare oggi?
            </div>
            <div style={{ fontSize: 14.5, color: MUTED, marginTop: 4 }}>
              Sabato sera · Roma centro
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
            <button onClick={onMap} style={iconBtn} title="Mappa"><Icon.Map/></button>
            <button onClick={onPosta} style={{ ...iconBtn, position: 'relative' }} title="Posta">
              <Icon.Bell/>
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: 999, background: PINK,
                border: '2px solid #fff',
              }}/>
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '18px 22px 0' }}>
          <div onClick={onSearch} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 50, borderRadius: 999,
            border: `1.5px solid #e0e0e0`,
            padding: '0 16px', background: '#fff', cursor: 'pointer',
          }}>
            <Icon.Search/>
            <span style={{ flex: 1, fontSize: 15, color: MUTED }}>
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
      </div>
      {/* === END STICKY TOP === */}

      {/* Quick filter chips — scroll away */}
      <div style={{
        display: 'flex', gap: 8, padding: '32px 22px 14px',
        overflowX: 'auto', scrollbarWidth: 'none', background: '#fff',
      }} className="hscroll">
        <FilterChip label="Aperto ora" active={quickFilters?.openNow}
          onClick={() => setQuickFilters?.(f => ({ ...f, openNow: !f.openNow }))}/>
        <FilterChip label="< 1 km" active={quickFilters?.near}
          onClick={() => setQuickFilters?.(f => ({ ...f, near: !f.near }))}/>
        <FilterChip label="Promo" active={quickFilters?.promo}
          onClick={() => setQuickFilters?.(f => ({ ...f, promo: !f.promo }))}/>
        <FilterChip label={<><Icon.Star size={11}/> 4.5+</>} active={quickFilters?.top}
          onClick={() => setQuickFilters?.(f => ({ ...f, top: !f.top }))}/>
        <FilterChip label="Prenotabile" active={false} onClick={onFilters}/>
      </div>

      {/* Categories — non sticky so they scroll away */}
      <div className="hscroll" style={{
        display: 'flex', padding: '16px 22px 4px', gap: 12,
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {cats.map(c => (
          <Category key={c.id} emoji={c.emoji} label={c.label}
            active={activeCat === c.id}
            onClick={() => setActiveCat?.(activeCat === c.id ? null : c.id)}/>
        ))}
      </div>

      {before}

      {/* I tuoi preferiti */}
      <SectionHeader title="I tuoi preferiti" action="Vedi tutti"/>
      <HScroll>
        {favorites.map((f, i) => (
          <FavoriteCard key={i} {...f}
            onClick={() => click({ ...f, title: f.name, place: [f.type, f.distance].filter(Boolean).join(' · ') })}/>
        ))}
      </HScroll>

      {/* Eventi */}
      <SectionHeader title="Eventi imperdibili" action="Vedi tutti"/>
      <HScroll>
        {events.map((e, i) => (
          <EventCard key={i} {...e} onClick={() => click(e)}/>
        ))}
      </HScroll>

      {/* Promo */}
      <SectionHeader title="Le promo di oggi" action="Vedi tutte"/>
      <HScroll>
        {promos.map((p, i) => (
          <PromoCard key={i} {...p} onClick={() => click(p)}/>
        ))}
      </HScroll>

      {/* Per te */}
      <SectionHeader title="Suggeriti per te" action="Vedi tutti"/>
      <HScroll>
        {suggested.map((p, i) => <PromoCard key={i} {...p} onClick={() => click(p)}/>)}
      </HScroll>
    </>
  );
}

// ─── Main app ───────────────────────────────────────────────
function App() {
  const [activeCat, setActiveCat] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [page, setPage] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('page');
      if (p === 'venue' || p === 'profile' || p === 'map' || p === 'posta') return p;
    } catch {}
    return 'home';
  }); // 'home' | 'search' | 'results' | 'profile' | 'venue'
  const [searchQuery, setSearchQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [activeVenue, setActiveVenue] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).get('page') === 'venue') {
        return { name: 'Al Settembrini', _from: 'home' };
      }
    } catch {}
    return null;
  });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  // booking salvato (sopravvive ai refresh)
  const [savedBooking, setSavedBooking] = useState(() => {
    try { const raw = localStorage.getItem('byup_booking'); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  });
  const refreshBooking = () => {
    try { const raw = localStorage.getItem('byup_booking'); setSavedBooking(raw ? JSON.parse(raw) : null); }
    catch { setSavedBooking(null); }
  };
  const cancelBooking = () => {
    try { localStorage.removeItem('byup_booking'); } catch {}
    setSavedBooking(null);
  };
  useEffect(() => {
    if (!qrOpen) return;
    const t = setTimeout(() => {
      try { sessionStorage.removeItem('byup_menu_from'); } catch {}
      window.location.href = 'byup Menu.html';
    }, 1400);
    return () => clearTimeout(t);
  }, [qrOpen]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
  const [moment, setMoment] = useState(null); // 'pranzo' | 'cena' | 'notte'
  const [momentOpen, setMomentOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length;

  if (page === 'search') {
    return (
      <>
        <SearchScreen
          onBack={() => setPage('home')}
          onSubmit={(q) => { setSearchQuery(q); setPage('results'); }}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />
        <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}
          filters={filters} setFilters={setFilters}/>
      </>
    );
  }
  if (page === 'results') {
    return (
      <>
        <ResultsScreen
          query={searchQuery}
          onBack={() => setPage('search')}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          onOpenVenue={(v) => { setActiveVenue(v); setPage('venue'); }}
        />
        <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}
          filters={filters} setFilters={setFilters}/>
      </>
    );
  }
  if (page === 'profile') {
    const PS = window.ProfileScreen;
    return PS ? <PS onBack={() => setPage('home')} onTabHome={() => setPage('home')}/> : null;
  }
  if (page === 'map') {
    const MS = window.MapScreen;
    return (
      <>
        {MS && <MS
          onBack={() => setPage('home')}
          onTabHome={() => setPage('home')}
          onTabProfile={() => setPage('profile')}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          onOpenVenue={(v) => { setActiveVenue({ ...v, _from: 'map' }); setPage('venue'); }}
        />}
        <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}
          filters={filters} setFilters={setFilters}/>
      </>
    );
  }
  if (page === 'posta') {
    const PoS = window.PostaScreen;
    return PoS ? <PoS onBack={() => setPage('home')} onProfile={() => setPage('profile')}/> : null;
  }
  if (page === 'venue') {
    const VS = window.VenueScreen;
    const BS = window.BookingSheet;
    return (
      <>
        {VS && <VS venue={activeVenue}
          onBack={() => setPage(activeVenue?._from || 'home')}
          onMenu={() => { window.location.href = 'byup Menu.html?from=venue'; }}
          onBook={() => setBookingOpen(true)}
          onHome={() => setPage('home')}
          onProfile={() => setPage('profile')}/>}
        {BS && <BS open={bookingOpen} venue={activeVenue}
          onClose={() => setBookingOpen(false)}
          onConfirm={() => { setBookingOpen(false); refreshBooking(); }}/>}
      </>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Sticky header (over status bar background) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15,
        height: 60, background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
        pointerEvents: 'none',
      }}/>

      {/* Scrollable content area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        paddingTop: 60,
        paddingBottom: 110,
      }}>
        <HomeSections
          topBar={savedBooking ? (
            <BookingHomeCard booking={savedBooking} onCancel={cancelBooking} onScanQr={() => setQrOpen(true)}/>
          ) : null}
          activeCat={activeCat} setActiveCat={setActiveCat}
          quickFilters={quickFilters} setQuickFilters={setQuickFilters}
          activeFilterCount={activeFilterCount}
          onMap={() => setPage('map')}
          onPosta={() => setPage('posta')}
          onSearch={() => setPage('search')}
          onFilters={() => setFiltersOpen(true)}
          onCardClick={(item) => setDetail(item)}
        />
      </div>

      {/* Tab bar */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 14, height: 72,
        background: '#fff', borderRadius: 26,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center',
        zIndex: 20,
      }}>
        <TabBtn label="Home" icon={Icon.Home} active={activeTab==='home'} onClick={() => setActiveTab('home')}/>
        <div style={{ width: 64 }}/> {/* spacer for QR */}
        <TabBtn label="Profilo" icon={Icon.User} active={activeTab==='profile'} onClick={() => setPage('profile')}/>
      </div>

      {/* QR center button (overlapping tab bar) */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        bottom: 56, zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <button onClick={() => setQrOpen(true)} style={{
          width: 60, height: 60, borderRadius: 999, border: '4px solid #fff',
          background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
          boxShadow: '0 6px 18px rgba(233,30,99,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Icon.QR size={28}/>
        </button>
      </div>

      {/* Floating + button — radial moment selector (Pranzo / Cena / Notte) */}
      <MomentFab moment={moment} setMoment={setMoment}
        open={momentOpen} setOpen={setMomentOpen}/>

      {/* Detail sheet */}
      <DetailSheet item={detail} onClose={() => setDetail(null)}
        onOpenVenue={() => {
          if (!detail) return;
          const v = { ...detail, name: detail.name || detail.title, _from: 'home' };
          setDetail(null);
          setActiveVenue(v);
          setPage('venue');
        }}
        onMenu={() => { setDetail(null); window.location.href = 'byup Menu.html?from=venue'; }}
        onBook={() => { setBookingOpen(true); }}/>

      {/* Booking sheet (shared with venue page) */}
      {(() => { const BS = window.BookingSheet;
        return BS ? <BS open={bookingOpen}
          venue={detail ? { ...detail, name: detail.name || detail.title } : activeVenue}
          onClose={() => setBookingOpen(false)}
          onConfirm={() => { setBookingOpen(false); setDetail(null); refreshBooking(); }}/> : null;
      })()}

      {/* Filter sheet */}
      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}
        filters={filters} setFilters={setFilters}/>

      {/* Notifications */}
      <NotifSheet open={notifOpen} onClose={() => setNotifOpen(false)}/>

      {/* QR scanner overlay */}
      {qrOpen && (
        <div onClick={() => setQrOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(10,10,10,0.92)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          animation: 'fade 0.2s ease',
        }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, marginBottom: 8, opacity: 0.7 }}>
            BYUP · MENU SCANNER
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 28 }}>
            Inquadra il menu del locale
          </div>
          <div style={{
            width: 240, height: 240, borderRadius: 24, position: 'relative',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            {/* corners */}
            {[[0,0,'tl'],[0,1,'tr'],[1,0,'bl'],[1,1,'br']].map(([y,x,k]) => (
              <div key={k} style={{
                position: 'absolute',
                top: y ? 'auto' : 12, bottom: y ? 12 : 'auto',
                left: x ? 'auto' : 12, right: x ? 12 : 'auto',
                width: 32, height: 32,
                borderTop: !y ? `3px solid ${PINK}` : 'none',
                borderBottom: y ? `3px solid ${PINK}` : 'none',
                borderLeft: !x ? `3px solid ${PINK}` : 'none',
                borderRight: x ? `3px solid ${PINK}` : 'none',
                borderRadius: !y && !x ? '12px 0 0 0' : y && !x ? '0 0 0 12px' : !y && x ? '0 12px 0 0' : '0 0 12px 0',
              }}/>
            ))}
            {/* scan line */}
            <div style={{
              position: 'absolute', left: 24, right: 24, height: 2,
              background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`,
              boxShadow: `0 0 12px ${PINK}`,
              animation: 'scanline 2.2s ease-in-out infinite',
            }}/>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 22 }}>
            Lettura del QR del tavolo…
          </div>
        </div>
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

function SectionHeader({ title, action }) {
  return (
    <div style={{
      padding: '24px 22px 12px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'baseline',
    }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: TEXT, letterSpacing: -0.2 }}>{title}</div>
      {action && (
        <button style={{
          background: 'none', border: 'none', color: PINK,
          fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>{action}</button>
      )}
    </div>
  );
}

// Reusable bottom tab bar with QR center button
function BottomTabBar({ active = 'home', onHome, onProfile, onQR, showQR = true }) {
  return (
    <>
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 14, height: 72,
        background: '#fff', borderRadius: 26,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center',
        zIndex: 20,
      }}>
        <TabBtn label="Home" icon={Icon.Home} active={active === 'home'} onClick={onHome}/>
        <div style={{ width: 64 }}/>
        <TabBtn label="Profilo" icon={Icon.User} active={active === 'profile'} onClick={onProfile}/>
      </div>
      {showQR && (
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          bottom: 56, zIndex: 25,
        }}>
          <button onClick={onQR} style={{
            width: 60, height: 60, borderRadius: 999, border: '4px solid #fff',
            background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
            boxShadow: '0 6px 18px rgba(233,30,99,0.45), 0 2px 6px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Icon.QR size={28}/>
          </button>
        </div>
      )}
    </>
  );
}
window.BottomTabBar = BottomTabBar;

function TabBtn({ label, icon: I, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, background: 'none', border: 'none', padding: '10px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      cursor: 'pointer', fontFamily: 'inherit',
    }}>
      <I color={active ? PINK : '#999'} fill={active ? PINK : 'none'}/>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? PINK : '#999' }}>{label}</span>
    </button>
  );
}

function HScroll({ children }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '0 22px', overflowX: 'auto',
      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
    }} className="hscroll">
      {children}
    </div>
  );
}

// ─── Mount ─────────────────────────────────────────────────
function ShortcutsPanel() {
  const cur = (() => {
    try { return new URLSearchParams(window.location.search).get('page') || 'home'; }
    catch { return 'home'; }
  })();
  const items = [
    { id: 'home',      label: 'Home',             href: 'byup Home.html' },
    { id: 'map',       label: 'Mappa',            href: 'byup Home.html?page=map' },
    { id: 'posta',     label: 'Posta',            href: 'byup Home.html?page=posta' },
    { id: 'venue-a',   label: 'Vetrina',          href: 'byup Home.html?page=venue',  group: 'venue' },
    { id: 'menu',      label: 'Menu',             href: 'byup Menu.html' },
    { id: 'pay',       label: 'Pagamento',        href: 'byup Menu.html#pay' },
    { id: 'paymethod', label: 'Metodo pagamento', href: 'byup Menu.html#paymethod' },
    { id: 'success',   label: 'Successo',         href: 'byup Menu.html#success' },
    { id: 'receipt',   label: 'Scontrino',        href: 'byup Menu.html#receipt' },
  ];
  const curVenue = (() => {
    try { return new URLSearchParams(window.location.search).get('venue') || 'a'; }
    catch { return 'a'; }
  })();
  return (
    <div className="byup-screen-nav" style={{
      position: 'fixed', top: 20, right: 20, zIndex: 100,
      background: '#fff', borderRadius: 14, padding: 8,
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', gap: 4,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9a8f93', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Schermate</div>
      {items.map(s => {
        const active = s.group === 'venue'
          ? (cur === 'venue' && curVenue === s.id.replace('venue-', ''))
          : s.id === cur;
        return (
          <a key={s.id} href={s.href} style={{
            padding: '6px 12px', fontSize: 12.5, borderRadius: 8,
            background: active ? '#FF5A5F' : 'transparent',
            color: active ? '#fff' : '#1a1a1a',
            fontWeight: 600, textAlign: 'left', textDecoration: 'none',
            display: 'block',
          }}>{s.label}</a>
        );
      })}
    </div>
  );
}

function Root() {
  return (
    <div data-screen-label="byup Home" style={{
      minHeight: '100vh', background: '#ececec',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <IOSDevice width={402} height={874}>
        <App/>
      </IOSDevice>
      <ShortcutsPanel/>
    </div>
  );
}

Object.assign(window, { HomeSections, Icon, PINK, PINK_DARK, TEXT, MUTED, BORDER, BG_GRAY });

const __byupRoot = document.getElementById('root');
if (__byupRoot) ReactDOM.createRoot(__byupRoot).render(<Root/>);

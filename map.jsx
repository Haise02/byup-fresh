// Mappa: 3 livelli di zoom (paese → città → strada), tap pin → tendina locale
const PINK = '#FF5A5F';
const PINK_DARK = '#E04347';
const PINK_LIGHT = '#FFE0DD';
const ORANGE = '#FF8C2B';
const PLUM = '#3a1d2c';
const TEXT = '#1a1a1a';
const MUTED = '#7d7d7d';

// venue dataset (subset usato sulla mappa con coords sintetiche per layout)
const VENUES_BY_CITY = {
  roma: [
    { id: 'set', name: 'Al Settembrini', cat: 'Ristorante romano', distance: '0.4 km',
      x: 0.55, y: 0.50, color: PINK, open: true, hours: '12:30 – 23:00', cuisine: 'Italiana', price: '20-30€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=70&auto=format&fit=crop' },
    { id: 'imp', name: "All'Impronta",   cat: 'Ristorante',         distance: '0.8 km',
      x: 0.70, y: 0.35, color: PLUM,   open: true, hours: '19:00 – 24:00', cuisine: 'Italiana', price: '25-35€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70&auto=format&fit=crop' },
    { id: 'lou', name: 'Lounge 22',      cat: 'Cocktail bar',       distance: '1.1 km',
      x: 0.30, y: 0.40, color: ORANGE, open: true, hours: '18:00 – 02:00', cuisine: 'Cocktail', price: '15-25€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=70&auto=format&fit=crop' },
    { id: 'hop', name: 'Hops & Co',      cat: 'Pub',                distance: '1.5 km',
      x: 0.20, y: 0.65, color: PLUM,   open: false, hours: 'Apre alle 18:00', cuisine: 'Pub', price: '15-25€', rating: 4.3,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop' },
    { id: 'mar', name: 'Da Mario',       cat: 'Trattoria',          distance: '2.1 km',
      x: 0.78, y: 0.62, color: PINK,   open: true, hours: '12:00 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=70&auto=format&fit=crop' },
    { id: 'jaz', name: 'Blue Note',      cat: 'Jazz bar',           distance: '2.8 km',
      x: 0.45, y: 0.75, color: ORANGE, open: true, hours: '20:00 – 02:00', cuisine: 'Cocktail', price: '20-30€', rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70&auto=format&fit=crop' },
    { id: 'piz', name: 'Sforno',         cat: 'Pizzeria',           distance: '3.2 km',
      x: 0.62, y: 0.20, color: PINK,   open: true, hours: '19:00 – 24:00', cuisine: 'Pizza', price: '10-20€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=70&auto=format&fit=crop' },
    { id: 'gel', name: 'Fatamorgana',    cat: 'Gelateria',          distance: '0.6 km',
      x: 0.40, y: 0.25, color: ORANGE, open: true, hours: '12:00 – 24:00', cuisine: 'Gelato', price: '5-10€', rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
  ],
};

const CITIES = [
  { id: 'roma',     name: 'Roma',     count: 86,  x: 0.51, y: 0.55 },
  { id: 'firenze',  name: 'Firenze',  count: 42,  x: 0.47, y: 0.40 },
  { id: 'venezia',  name: 'Venezia',  count: 38,  x: 0.55, y: 0.22 },
  { id: 'milano',   name: 'Milano',   count: 67,  x: 0.36, y: 0.18 },
  { id: 'napoli',   name: 'Napoli',   count: 36,  x: 0.62, y: 0.70 },
  { id: 'palermo',  name: 'Palermo',  count: 22,  x: 0.50, y: 0.92 },
];

const REGIONS = [
  { id: 'nord',    name: 'Nord',     count: 247, x: 0.42, y: 0.20 },
  { id: 'centro',  name: 'Centro',   count: 168, x: 0.50, y: 0.50 },
  { id: 'sud',     name: 'Sud',      count: 128, x: 0.58, y: 0.82 },
];

function MapScreen({ onBack, onTabHome, onTabProfile, onOpenFilters, activeFilterCount, onOpenVenue }) {
  // L'utente parte già localizzato a Roma (livello strada).
  const ROMA = CITIES.find(c => c.id === 'roma');
  const [city, setCity] = React.useState(ROMA);
  const [active, setActive] = React.useState(null); // selected venue → bottom sheet
  const [searchQ, setSearchQ] = React.useState('');

  const mapRef = React.useRef(null);

  function clickVenue(v) {
    setActive(v);
  }
  function recenter() {
    setActive(null);
    setCity(ROMA);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header — back + search */}
        <div style={{ padding: '60px 14px 10px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', zIndex: 10, flexShrink: 0 }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 999, border: 'none',
            background: '#1a1a1a', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} aria-label="Indietro">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{
            flex: 1, height: 42, borderRadius: 999, border: '1.5px solid #e0e0e0',
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: '#fff',
          }}>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={city ? city.name : 'Cerca per indirizzo o città'}
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 14.5, color: TEXT,
                background: 'transparent', minWidth: 0,
              }}
            />
            <button onClick={onOpenFilters} style={{
              width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }} aria-label="Filtri">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h18M6 12h12M10 17h4" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {activeFilterCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, padding: '0 4px',
                  background: PINK, color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Map area */}
        <div ref={mapRef} style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: '#ece6db',
        }}>
          {/* Street-level map (Roma) */}
          {city && <StreetView city={city} onVenue={clickVenue}/>}

          {/* Locate-me button (recenter on Roma) */}
          <button style={{
            position: 'absolute', top: 12, right: 12,
            width: 40, height: 40, borderRadius: 8, background: '#fff',
            border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }} onClick={recenter} aria-label="La mia posizione">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L19 21 L12 17 L5 21 Z" fill="#1a1a1a"/>
              <path d="M12 2 L19 21 L12 17 Z" fill="#444"/>
            </svg>
          </button>
        </div>

        {/* Bottom nav */}
        <div style={{
          height: 72, paddingBottom: 18, background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          flexShrink: 0,
        }}>
          <NavBtn label="Home" active onClick={onTabHome} icon={(
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" stroke={PINK} strokeWidth="1.8" strokeLinejoin="round"/></svg>
          )}/>
          <NavBtn label="Profilo" onClick={onTabProfile} icon={(
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#666" strokeWidth="1.8"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" stroke="#666" strokeWidth="1.8" strokeLinecap="round"/></svg>
          )}/>
        </div>

        {/* Bottom sheet — venue card */}
        {active && (
          <VenueSheet
            venue={active}
            onClose={() => setActive(null)}
            onOpenVenue={() => onOpenVenue(active)}
            onOpenMenu={() => { window.location.href = 'byup Menu.html?from=venue'; }}
          />
        )}
      </div>
  );
}

function NavBtn({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      {icon}
      <span style={{ fontSize: 11, color: active ? PINK : '#666', fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
  );
}

// ─── Italy map (zoom level 0): full-bleed silhouette dominant ──
function ItalyMap({ onRegion }) {
  // Region clusters positioned over the silhouette in viewport % (left, top)
  const clusters = [
    { id: 'nord',   name: 'Nord',   count: 247, left: '46%', top: '20%' },
    { id: 'centro', name: 'Centro', count: 168, left: '54%', top: '50%' },
    { id: 'sud',    name: 'Sud',    count: 128, left: '50%', top: '78%' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#cfe6f7' }}>
      {/* faint sea hatching */}
      <svg viewBox="0 0 100 140" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
        {Array.from({length: 10}).map((_, i) => (
          <path key={i} d={`M0 ${10 + i*14} Q 50 ${4 + i*14} 100 ${10 + i*14}`}
            stroke="#a8cce4" strokeWidth="0.6" fill="none"/>
        ))}
      </svg>

      {/* Italy silhouette — full-bleed, recognizable boot */}
      <svg viewBox="0 0 160 240" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Mainland Italy — simplified but recognizable boot shape.
            ViewBox 160w × 240h. North at top, boot toe and heel at bottom. */}
        <path d="
          M 30 28
          C 38 22, 50 20, 60 22
          C 72 18, 86 18, 100 22
          C 114 20, 126 26, 134 36
          C 132 42, 124 42, 116 42
          C 106 42, 96 46, 90 52
          C 86 60, 90 70, 94 78
          C 100 88, 106 96, 108 106
          C 110 118, 108 130, 104 140
          C 100 152, 94 162, 92 174
          C 92 184, 96 192, 100 200
          C 102 206, 98 212, 92 214
          C 84 216, 76 212, 72 206
          C 70 200, 74 196, 80 194
          C 86 190, 88 184, 86 178
          C 82 172, 76 170, 70 172
          C 64 174, 58 178, 52 178
          C 46 176, 44 170, 48 166
          C 54 162, 60 158, 62 152
          C 62 144, 56 138, 50 134
          C 42 128, 36 122, 34 114
          C 30 104, 28 92, 26 80
          C 24 68, 24 56, 26 44
          C 26 38, 28 32, 30 28 Z
        " fill="#e8dfc4" stroke="#c9b988" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* Sicily — triangle SW of toe */}
        <path d="
          M 40 224
          C 50 218, 64 218, 76 220
          C 86 222, 92 226, 90 230
          C 86 234, 76 236, 64 234
          C 52 234, 42 232, 38 228
          C 36 226, 38 224, 40 224 Z
        " fill="#e8dfc4" stroke="#c9b988" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* Sardinia — west island */}
        <path d="
          M 8 116
          C 14 108, 20 108, 24 114
          C 26 120, 26 128, 24 138
          C 22 148, 18 158, 14 160
          C 8 160, 4 154, 4 146
          C 4 134, 6 124, 8 116 Z
        " fill="#e8dfc4" stroke="#c9b988" strokeWidth="1.5" strokeLinejoin="round"/>

        {/* Apennines spine */}
        <path d="M 70 30 Q 90 60 100 100 Q 102 140 92 180 Q 88 196 84 208"
          stroke="#c9b988" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round"/>
        {/* Alps */}
        <path d="M 32 28 Q 70 18 130 32"
          stroke="#c9b988" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round"/>

        {/* City labels */}
        {[
          { x: 56,  y: 38,  t: 'Milano' },
          { x: 116, y: 36,  t: 'Venezia' },
          { x: 90,  y: 90,  t: 'Firenze' },
          { x: 92,  y: 158, t: 'Roma' },
          { x: 102, y: 196, t: 'Napoli' },
          { x: 64,  y: 230, t: 'Palermo' },
        ].map((c, i) => (
          <text key={i} x={c.x} y={c.y} fill="#2a2a2a" fontSize="6.5"
            fontWeight="700" textAnchor="middle"
            stroke="#fff" strokeWidth="1.4" paintOrder="stroke">{c.t}</text>
        ))}
      </svg>

      {/* Region clusters as DOM (clickable) */}
      {clusters.map(r => (
        <button key={r.id} onClick={() => onRegion(r)} style={{
          position: 'absolute', left: r.left, top: r.top,
          transform: 'translate(-50%, -50%)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: 999,
            background: 'rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClusterPin count={`+${r.count}`}/>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#1a1a1a',
            background: 'rgba(255,255,255,0.85)', padding: '1px 8px', borderRadius: 999,
          }}>{r.name}</div>
        </button>
      ))}

      {/* User location dot — central Italy */}
      <div style={{
        position: 'absolute', left: '54%', top: '57%',
        transform: 'translate(-50%, -50%)',
      }}>
        <UserDot pulse/>
      </div>
    </div>
  );
}

// ─── Country view (zoom 1): cities scattered on a wider map ──
function CountryView({ cities, onCity }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="100" height="140" fill="#e8f0f8"/>
        {/* Land masses + roads suggestion */}
        <path d="M0 0 L100 0 L100 140 L0 140 Z" fill="#efe8d8"/>
        <path d="M-5 60 L110 50" stroke="#fff" strokeWidth="1.2" opacity="0.7"/>
        <path d="M-5 75 L110 80" stroke="#fff" strokeWidth="1" opacity="0.5"/>
        <path d="M30 -5 L40 145" stroke="#fff" strokeWidth="0.8" opacity="0.4"/>
        <path d="M70 -5 L60 145" stroke="#fff" strokeWidth="0.8" opacity="0.4"/>
        {/* Green areas */}
        <ellipse cx="20" cy="40" rx="14" ry="10" fill="#cfe0c0" opacity="0.7"/>
        <ellipse cx="80" cy="100" rx="16" ry="12" fill="#cfe0c0" opacity="0.7"/>
        <ellipse cx="55" cy="20" rx="10" ry="8" fill="#cfe0c0" opacity="0.6"/>
        {/* Water */}
        <path d="M0 130 Q 50 120 100 130 L100 140 L0 140 Z" fill="#cfe6f7"/>
      </svg>
      {cities.map(c => (
        <button key={c.id} onClick={() => onCity(c)} style={{
          position: 'absolute',
          left: `${c.x * 100}%`, top: `${c.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 999,
            background: 'rgba(255,255,255,0.55)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClusterPin count={`+${c.count}`}/>
          </div>
          <div style={{
            marginTop: 4, fontSize: 12, fontWeight: 700, color: '#1a1a1a',
            textShadow: '0 0 4px rgba(255,255,255,0.9)',
          }}>{c.name}</div>
        </button>
      ))}
      <div style={{ position: 'absolute', left: '51%', top: '56%', transform: 'translate(-50%, -50%)' }}>
        <UserDot/>
      </div>
    </div>
  );
}

// ─── Street view (zoom 2): individual venue pins on a city map ──
function StreetView({ city, onVenue }) {
  const venues = VENUES_BY_CITY[city.id] || VENUES_BY_CITY.roma;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* base */}
        <rect x="0" y="0" width="100" height="140" fill="#f3ede0"/>
        {/* parks */}
        <path d="M5 18 Q 18 14 28 22 Q 22 32 12 30 Z" fill="#cfe0bd"/>
        <path d="M75 95 Q 90 92 95 105 Q 88 115 78 110 Z" fill="#cfe0bd"/>
        <ellipse cx="68" cy="40" rx="6" ry="4" fill="#cfe0bd"/>
        {/* river */}
        <path d="M-5 70 Q 30 60 50 75 Q 70 90 110 80 L110 86 Q 70 96 50 81 Q 30 66 -5 76 Z"
          fill="#bdd9ee"/>
        {/* roads — diagonal grid suggestion */}
        {[20, 40, 60, 80, 100, 120].map((y, i) => (
          <path key={'h'+i} d={`M-5 ${y} L110 ${y - 5}`} stroke="#fff" strokeWidth={i % 2 ? 1.8 : 1} opacity="0.95"/>
        ))}
        {[15, 35, 55, 75, 95].map((x, i) => (
          <path key={'v'+i} d={`M${x} -5 L${x + 4} 145`} stroke="#fff" strokeWidth={i % 2 ? 1.6 : 0.9} opacity="0.9"/>
        ))}
        {/* small road labels */}
        <text x="22" y="50" fill="#7a6f55" fontSize="2.6" fontStyle="italic">Via dei Fori</text>
        <text x="60" y="58" fill="#7a6f55" fontSize="2.6" fontStyle="italic">Via Veneto</text>
        <text x="36" y="105" fill="#7a6f55" fontSize="2.6" fontStyle="italic">Trastevere</text>
        <text x="68" y="118" fill="#7a6f55" fontSize="2.6" fontStyle="italic">San Giovanni</text>
        {/* poi labels */}
        <text x="50" y="78" fill="#3a3a3a" fontSize="3.4" fontWeight="700" textAnchor="middle">{city.name}</text>
        <text x="70" y="62" fill="#5a5a5a" fontSize="2.4" textAnchor="middle">Trevi</text>
        <text x="56" y="92" fill="#5a5a5a" fontSize="2.4" textAnchor="middle">Colosseum</text>
      </svg>
      {/* Venue pins */}
      {venues.map(v => (
        <button key={v.id} onClick={() => onVenue(v)} style={{
          position: 'absolute',
          left: `${v.x * 100}%`, top: `${v.y * 100}%`,
          transform: 'translate(-50%, -100%)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0,
        }}>
          <VenuePin color={v.color} cuisine={v.cuisine}/>
        </button>
      ))}
      {/* User location */}
      <div style={{ position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)' }}>
        <UserDot pulse/>
      </div>
    </div>
  );
}

// ─── Pins ──
function ClusterPin({ count }) {
  return (
    <div style={{
      background: PINK, color: '#fff', padding: '6px 10px',
      borderRadius: 8, fontSize: 12, fontWeight: 700,
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      <span>{count} locali</span>
    </div>
  );
}

function VenuePin({ color, cuisine }) {
  // teardrop pin with an icon
  return (
    <div style={{ position: 'relative', width: 38, height: 50, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))' }}>
      <svg width="38" height="50" viewBox="0 0 38 50" fill="none">
        <path d="M19 49 C 12 38, 2 30, 2 19 A 17 17 0 1 1 36 19 C 36 30, 26 38, 19 49 Z"
          fill={color}/>
      </svg>
      <div style={{
        position: 'absolute', top: 5, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CuisineGlyph cuisine={cuisine}/>
      </div>
    </div>
  );
}

function CuisineGlyph({ cuisine }) {
  // pick glyph by cuisine
  const map = {
    Pizza:    <path d="M12 3 L21 21 L3 21 Z" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    Italiana: <path d="M5 14 c0-3 3-5 7-5s7 2 7 5 v3 H5z M9 9 V6 M12 9 V5 M15 9 V6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>,
    Cocktail: <path d="M5 5 H19 L13 14 V19 H17 M13 19 H9 M13 14 L7 5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    Pub:      <path d="M7 5 H17 V18 a3 3 0 0 1 -3 3 H10 a3 3 0 0 1 -3 -3 V5z M17 8 H20 V14 H17" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>,
    Gelato:   <path d="M8 9 a4 4 0 0 1 8 0 M9 9 L12 21 L15 9" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      {map[cuisine] || map.Italiana}
    </svg>
  );
}

function UserDot({ pulse }) {
  return (
    <div style={{ position: 'relative', width: 22, height: 22 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(40,108,255,0.25)', borderRadius: 999,
        animation: pulse ? 'mapPulse 2s ease-in-out infinite' : 'none',
      }}/>
      <div style={{
        position: 'absolute', inset: 4,
        background: '#286cff', borderRadius: 999,
        border: '2px solid #fff',
      }}/>
      <style>{`@keyframes mapPulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.6); opacity: 0; }
      }`}</style>
    </div>
  );
}

// ─── Bottom sheet for selected venue ──
function VenueSheet({ venue, onClose, onOpenVenue, onOpenMenu }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', zIndex: 20,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 72,
        background: '#fff', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        zIndex: 21,
        animation: 'sheetUp 280ms ease-out',
        padding: '10px 18px 18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: '#d8d8d8' }}/>
        </div>
        {/* Tap area → venue */}
        <div onClick={onOpenVenue} style={{ cursor: 'pointer' }}>
          <img src={venue.photo} alt={venue.name} style={{
            width: '100%', height: 130, objectFit: 'cover', borderRadius: 14,
            background: '#eee', display: 'block',
          }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>
                {venue.name} <span style={{ fontWeight: 500, color: MUTED }}>· Roma</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 13.5 }}>
                <span style={{ color: '#1c8a3a', fontWeight: 700 }}>
                  {venue.open ? 'Aperto ora' : 'Chiuso'}
                </span>
                <span style={{ color: MUTED }}> Chiude alle ore {venue.hours.split('–')[1]?.trim() || venue.hours}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={PINK}>
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
              </svg>
              <b style={{ color: PINK }}>{venue.rating}</b>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 13.5, color: MUTED, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
          <div onClick={onOpenVenue} style={{ cursor: 'pointer' }}>
            {venue.cat} · {venue.distance}<br/>
            {venue.cuisine} · {venue.price}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }} style={{
            background: PINK, color: '#fff', border: 'none',
            padding: '12px 22px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>Menù</button>
        </div>
      </div>
      <style>{`@keyframes sheetUp {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }`}</style>
    </>
  );
}

window.MapScreen = MapScreen;

// ─── Posta (notifiche) screen ───────────────────────────────
function PostaScreen({ onBack, onProfile }) {
  const [tab, setTab] = React.useState('news'); // 'news' | 'promo'

  // Novità: SOLO da Byup (sistema, punti, novità prodotto, FAQ, ecc.)
  const news = [
    { id: 1, title: 'Benvenuto in byup',
      preview: 'Esplora i locali sopra di te, ordina al tavolo o take away, ricevi offerte personalizzate.',
      ago: 'Un\'ora fa', kind: 'welcome' },
    { id: 2, title: 'Hai guadagnato 50 punti',
      preview: 'Per il tuo ultimo ordine da Ristorante Maria Grazia. Usali subito su un nuovo locale.',
      ago: '3 ore fa', kind: 'points' },
    { id: 3, title: 'Novità: ora puoi prenotare',
      preview: 'Da oggi puoi prenotare un tavolo direttamente dalla scheda del locale. Provalo!',
      ago: 'Ieri', kind: 'feature' },
    { id: 4, title: 'Recensione richiesta',
      preview: 'Com\'è andata la cena da Al Settembrini? Lascia un voto in 5 secondi.',
      ago: '2 giorni fa', kind: 'review' },
  ];

  // Promo: SOLO offerte dai locali. Card minimal stile "messaggio".
  const promo = [
    { id: 1, venue: 'Ristorante YX',
      preview: 'Hai un nuovo ristorante vicino a te. Provalo con il 20% di sconto entro venerdì.',
      ago: 'Un\'ora fa' },
    { id: 2, venue: 'Lounge 22',
      preview: 'Aperitivo 2x1 stasera dalle 18 alle 21. Mostra questa promo al bancone.',
      ago: '5 ore fa' },
    { id: 3, venue: 'Sforno Pizzeria',
      preview: 'Con qualsiasi pizza prenotata sabato sera ricevi una margherita in omaggio.',
      ago: 'Ieri' },
    { id: 4, venue: 'Caffè Centrale',
      preview: 'Da lunedì colazione a 3,50€ con cornetto e cappuccino. Solo per gli iscritti byup.',
      ago: '2 giorni fa' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      color: TEXT,
    }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 0', flexShrink: 0 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: '#1a1a1a', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-label="Indietro">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{
          fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 14,
        }}>Posta</div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>
          {tab === 'news' ? 'Aggiornamenti dal team byup' : 'Offerte dai tuoi locali preferiti'}
        </div>
      </div>

      {/* Tabs - segmented */}
      <div style={{
        margin: '14px 20px 4px', flexShrink: 0,
        background: '#f4f4f5', borderRadius: 12, padding: 4,
        display: 'flex', gap: 4,
      }}>
        {[
          { id: 'news',  label: 'Novità', count: news.length },
          { id: 'promo', label: 'Promo per te', count: promo.length },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '9px 10px',
              background: active ? '#fff' : 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 700,
              color: active ? TEXT : '#7a7a7a',
              borderRadius: 9,
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}>
              {t.label}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                background: active ? (t.id === 'news' ? PINK : '#FF6B35') : '#e0e0e0',
                color: active ? '#fff' : '#7a7a7a',
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 100px' }}>
        {tab === 'news' && news.map(n => <ByupNewsCard key={n.id} item={n}/>)}
        {tab === 'promo' && promo.map(p => <PromoMessageCard key={p.id} item={p}/>)}
      </div>

      {/* Bottom nav */}
      <div style={{
        height: 72, paddingBottom: 18, background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        flexShrink: 0,
      }}>
        <NavBtn label="Home" active onClick={onBack} icon={(
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" stroke={PINK} strokeWidth="1.8" strokeLinejoin="round"/></svg>
        )}/>
        <NavBtn label="Profilo" onClick={() => onProfile && onProfile()} icon={(
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#666" strokeWidth="1.8"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" stroke="#666" strokeWidth="1.8" strokeLinecap="round"/></svg>
        )}/>
      </div>
    </div>
  );
}

// Card Novità Byup: avatar Byup uniforme, layout pulito, no foto, no badge "Ufficiale"
function ByupNewsCard({ item }) {
  const iconByKind = {
    welcome: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
    points:  (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>),
    feature: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L13.5 9 L21 10 L15.5 14.5 L17 21 L12 17 L7 21 L8.5 14.5 L3 10 L10.5 9 Z"/></svg>),
    review:  (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  };
  return (
    <div style={{
      background: '#fff', border: '1px solid #ececec',
      borderRadius: 16, padding: 14,
      marginBottom: 10, display: 'flex', gap: 12,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 3px 10px ${PINK}40`,
      }}>
        {iconByKind[item.kind] || iconByKind.feature}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: TEXT, letterSpacing: -0.2 }}>byup</div>
          <div style={{ fontSize: 11.5, color: MUTED, flexShrink: 0 }}>{item.ago}</div>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, marginTop: 4, letterSpacing: -0.2 }}>
          {item.title}
        </div>
        <div style={{
          marginTop: 3, fontSize: 13, color: '#5a5a5a', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.preview}</div>
      </div>
    </div>
  );
}

// Card Promo locali: stile messaggio minimal, niente foto / niente badge
function PromoMessageCard({ item }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #ececec',
      borderRadius: 14, padding: '14px 16px',
      marginBottom: 10, cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: TEXT, letterSpacing: -0.2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.venue}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, flexShrink: 0 }}>{item.ago}</div>
      </div>
      <div style={{
        marginTop: 4, fontSize: 13.5, color: '#3a3a3a', lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{item.preview}</div>
    </div>
  );
}

window.PostaScreen = PostaScreen;

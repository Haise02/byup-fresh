// ─── Venue Variants ─────────────────────────────────────────
// 3 design directions for the venue screen, all sharing the same data shape.
// Variant A: Editorial / Magazine
// Variant B: Cinematic / Tasting Menu
// Variant C: Operativo / Resy-style

const { useState: useStateV, useEffect: useEffectV, useRef: useRefV } = React;

const PINK_V = '#FF5A5F';
const TEXT_V = '#1F1A1B';
const MUTED_V = '#7A7176';
const BG_V = '#F5F5F5';
const BORDER_V = '#EAE6E7';
const CREAM_V = '#F4EFE6';
const FOREST_V = '#2C4A3E';

// ─── Shared data ─────────────────────────────────────────────
const VENUE_DATA = {
  name: 'Al Settembrini',
  cuisine: 'Cucina Romana',
  price: '€€',
  address: 'Via dei Gracchi 56, 00187 Roma',
  hours: 'Lun – Ven · 11:00 – 23:00',
  rating: 4.8,
  reviews: 320,
  photos: [
    window.__R('u_22'),
    window.__R('u_23'),
    window.__R('u_24'),
    window.__R('u_25'),
  ],
  signature: {
    name: 'Cacio e Pepe',
    desc: 'Tonnarelli fatti in casa, pecorino romano DOP stagionato 12 mesi, pepe nero del Sarawak.',
    price: '14€',
    photo: window.__R('u_26'),
  },
  chef: {
    name: 'Marco De Santis',
    title: 'Chef e proprietario',
    bio: 'Cresciuto tra i fornelli della trattoria di famiglia in Trastevere. Una stella Michelin nel 2022.',
    photo: window.__R('u_27'),
  },
  awards: ['Top 10 Roma 2025', 'Gambero Rosso', 'Tripadvisor Excellence'],
  events: ['Aperitivo 2x1', 'Karaoke venerdì', 'Brunch domenica'],
  topReview: {
    name: 'Giulia M.',
    initial: 'G',
    when: '2 giorni fa',
    rating: 5,
    text: 'Atmosfera incredibile e cucina autentica. La cacio e pepe è la migliore di Roma — e ne ho provate tante.',
    dish: 'Cacio e Pepe',
  },
  reviews_list: [
    { name: 'Marco R.', initial: 'M', rating: 5, when: '1 sett. fa', text: 'Servizio impeccabile, vino consigliato dal cameriere perfetto.' },
    { name: 'Sara D.', initial: 'S', rating: 4, when: '2 sett. fa', text: 'Ottima esperienza, tornerò sicuramente con amici.' },
    { name: 'Luca B.', initial: 'L', rating: 5, when: '3 sett. fa', text: 'Locale autentico, niente turistate. Pasta fatta in casa che si sente.' },
  ],
  slots: ['19:30', '20:00', '20:30', '21:30', '22:00'],
  bio: 'Cucina romana di tradizione in un palazzo di fine \'800. Pasta tirata a mano ogni mattina, materie prime selezionate dai mercati di Testaccio e Campagna Amica. Carta dei vini con 200 etichette del Lazio.',
};

// ─── Shared utilities ────────────────────────────────────────
// HeroNav è da renderizzare come SIBLING dello scroller, dentro il root con position:relative.
// I tre bottoni (back / heart / more) restano sempre visibili anche durante lo scroll.
function HeroNav({ onBack, onMore, dark = true }) {
  const bg = dark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.55)';
  const fg = dark ? TEXT_V : '#fff';
  return (
    <div style={{
      position: 'absolute', top: 50, left: 16, right: 16, zIndex: 30,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      pointerEvents: 'none',
    }}>
      <button onClick={onBack} style={{
        width: 38, height: 38, borderRadius: 999,
        background: bg, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'auto',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
        <button style={{
          width: 38, height: 38, borderRadius: 999, background: bg, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61 a 5.5 5.5 0 0 0 -7.78 0 L 12 5.67 l -1.06 -1.06 a 5.5 5.5 0 0 0 -7.78 7.78 l 1.06 1.06 L 12 21.23 l 7.78 -7.78 1.06 -1.06 a 5.5 5.5 0 0 0 0 -7.78 z"/></svg>
        </button>
        <button onClick={onMore} style={{
          width: 38, height: 38, borderRadius: 999, background: bg, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={fg}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    </div>
  );
}

function StarsRow({ rating = 5, size = 14, color = '#f5b400' }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? color : 'none'} stroke={n <= rating ? color : '#d4cfc4'} strokeWidth="1.5" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function StickyBar({ onBook, primaryLabel = 'Prenota un tavolo', secondary, onSecondary, secondaryLabel = 'Vedi menù' }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: `1px solid ${BORDER_V}`,
      padding: '14px 20px 22px', display: 'flex', gap: 10, zIndex: 30,
    }}>
      {secondary && (
        <button onClick={onSecondary} style={{
          flex: '0 0 auto', height: 50, padding: '0 18px', borderRadius: 999, border: `1.5px solid ${BORDER_V}`,
          background: '#fff', color: TEXT_V, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        }}>{secondaryLabel}</button>
      )}
      <button onClick={onBook} style={{
        flex: 1, height: 50, borderRadius: 999, border: 'none',
        background: PINK_V, color: '#fff', fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(233,30,99,0.3)',
      }}>{primaryLabel}</button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIANT A — EDITORIAL / MAGAZINE
// ═════════════════════════════════════════════════════════════
function VenueA({ onBack, onMenu, onBook }) {
  const v = VENUE_DATA;
  const [photoIdx, setPhotoIdx] = useStateV(0);
  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      color: TEXT_V, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        {/* Eyebrow + Title (no photo first — magazine vibe) */}
        <div style={{ padding: '70px 24px 24px', borderBottom: `1px solid ${BORDER_V}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: PINK_V, textTransform: 'uppercase', marginBottom: 12 }}>
            CUCINA ROMANA · ROMA
          </div>
          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 38, fontWeight: 700, lineHeight: 1.05,
            letterSpacing: -1, color: TEXT_V, marginBottom: 14,
          }}>
            {v.name}
          </div>
          <div style={{ fontSize: 14.5, color: MUTED_V, lineHeight: 1.5, fontStyle: 'italic' }}>
            "Una stella Michelin, due generazioni di famiglia, e la migliore cacio e pepe di Roma."
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <StarsRow rating={5} size={14} color={TEXT_V}/>
            <span style={{ fontSize: 13, color: TEXT_V, fontWeight: 600 }}>{v.rating}</span>
            <span style={{ fontSize: 13, color: MUTED_V }}>· {v.reviews} recensioni</span>
          </div>
        </div>

        {/* Hero image full-bleed */}
        <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
          <img src={v.photos[photoIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 6,
          }}>
            {v.photos.map((_, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)} style={{
                width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 99,
                background: '#fff', opacity: i === photoIdx ? 1 : 0.6, border: 'none', cursor: 'pointer',
                transition: 'width 0.2s',
              }}/>
            ))}
          </div>
        </div>

        {/* Pull quote — top review as editorial */}
        <div style={{ padding: '32px 24px', background: CREAM_V }}>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 60, lineHeight: 0.5,
            color: PINK_V, marginBottom: 4,
          }}>"</div>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 19, lineHeight: 1.4,
            color: TEXT_V, fontStyle: 'italic', marginBottom: 14,
          }}>
            {v.topReview.text}
          </div>
          <div style={{ fontSize: 12, color: MUTED_V, fontWeight: 600, letterSpacing: 0.5 }}>
            — {v.topReview.name.toUpperCase()}, {v.topReview.when.toUpperCase()}
          </div>
        </div>

        {/* Storia */}
        <div style={{ padding: '32px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK_V, textTransform: 'uppercase', marginBottom: 8 }}>La storia</div>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: TEXT_V, fontFamily: 'Georgia, serif' }}>
            {v.bio}
          </div>
        </div>

        {/* Signature dish */}
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK_V, textTransform: 'uppercase', marginBottom: 12 }}>Il piatto firma</div>
          <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', height: 280, marginBottom: 14 }}>
            <img src={v.signature.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: TEXT_V }}>{v.signature.name}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: PINK_V }}>{v.signature.price}</div>
          </div>
          <div style={{ fontSize: 14, color: MUTED_V, lineHeight: 1.55 }}>{v.signature.desc}</div>
        </div>

        {/* Lo Chef */}
        <div style={{ padding: '24px 24px 32px', borderTop: `1px solid ${BORDER_V}`, borderBottom: `1px solid ${BORDER_V}`, background: '#fafaf8' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK_V, textTransform: 'uppercase', marginBottom: 16 }}>Lo chef</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <img src={v.chef.photo} alt="" style={{ width: 80, height: 80, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700, color: TEXT_V, marginBottom: 2 }}>{v.chef.name}</div>
              <div style={{ fontSize: 12, color: MUTED_V, fontWeight: 500, marginBottom: 8 }}>{v.chef.title}</div>
              <div style={{ fontSize: 13, color: TEXT_V, lineHeight: 1.5 }}>{v.chef.bio}</div>
            </div>
          </div>
        </div>

        {/* Premi — riga semplice */}
        <div style={{ padding: '24px 24px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK_V, textTransform: 'uppercase', marginBottom: 14 }}>Riconoscimenti</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {v.awards.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: TEXT_V }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_V} strokeWidth="2"><path d="M6 9 a 6 6 0 0 0 12 0 V3 H6 z M12 15 v 6 M8 21 h 8"/></svg>
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Indirizzo */}
        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK_V, textTransform: 'uppercase', marginBottom: 10 }}>Vieni a trovarci</div>
          <div style={{ fontSize: 14, color: TEXT_V, marginBottom: 4 }}>{v.address}</div>
          <div style={{ fontSize: 13, color: MUTED_V }}>{v.hours}</div>
        </div>
      </div>

      <HeroNav onBack={onBack} dark={true}/>
      <StickyBar onBook={onBook} secondary onSecondary={onMenu}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIANT B — CINEMATIC / TASTING MENU
// ═════════════════════════════════════════════════════════════
function VenueB({ onBack, onMenu, onBook }) {
  const v = VENUE_DATA;
  const [photoIdx, setPhotoIdx] = useStateV(0);
  // Auto-advance hero photos
  useEffectV(() => {
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % v.photos.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      width: '100%', height: '100%', background: '#0e0c0d', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        {/* Full-height cinematic hero */}
        <div style={{ position: 'relative', height: 560, overflow: 'hidden', background: '#111' }}>
          {v.photos.map((p, i) => (
            <img key={i} src={p} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: i === photoIdx ? 1 : 0,
              transition: 'opacity 1.2s ease',
              transform: i === photoIdx ? 'scale(1.04)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '1.2s, 5s',
            }}/>
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.2) 60%, rgba(14,12,13,0.95) 100%)',
          }}/>
          {/* Hero content */}
          <div style={{ position: 'absolute', left: 24, right: 24, bottom: 32, color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, opacity: 0.85, textTransform: 'uppercase', marginBottom: 14 }}>
              {v.cuisine} · ROMA
            </div>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: 46, fontWeight: 700, lineHeight: 1,
              letterSpacing: -1.5, marginBottom: 18, textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}>{v.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StarsRow rating={5} size={13} color="#FFD75C"/>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v.rating}</span>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.5)' }}/>
              <span style={{ fontSize: 13, opacity: 0.85 }}>{v.reviews} rec.</span>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.5)' }}/>
              <span style={{ fontSize: 13, opacity: 0.85 }}>{v.price}</span>
            </div>
            {/* Photo dots */}
            <div style={{ display: 'flex', gap: 6, marginTop: 22 }}>
              {v.photos.map((_, i) => (
                <div key={i} style={{
                  width: i === photoIdx ? 22 : 6, height: 3, borderRadius: 99,
                  background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'width 0.3s',
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Signature dish — gigante */}
        <div style={{ padding: '36px 24px 32px', background: '#0e0c0d' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: '#FFD75C', textTransform: 'uppercase', marginBottom: 14, opacity: 0.9 }}>
            Il piatto del momento
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 18, height: 320, position: 'relative' }}>
            <img src={v.signature.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{v.signature.name}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FFD75C' }}>{v.signature.price}</div>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{v.signature.desc}</div>
        </div>

        {/* Lo Chef — ritratto editoriale */}
        <div style={{ padding: '36px 24px', background: '#1a1617' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: '#FFD75C', textTransform: 'uppercase', marginBottom: 18, opacity: 0.9 }}>
            Lo chef
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 18, height: 240, position: 'relative' }}>
            <img src={v.chef.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{v.chef.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>{v.chef.title}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{v.chef.bio}</div>
        </div>

        {/* Esperienza/Storia + premi inline */}
        <div style={{ padding: '36px 24px 24px', background: '#0e0c0d' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: '#FFD75C', textTransform: 'uppercase', marginBottom: 14, opacity: 0.9 }}>
            L'esperienza
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, marginBottom: 24 }}>
            {v.bio}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {v.awards.map((a, i) => (
              <div key={i} style={{
                fontSize: 11.5, fontWeight: 600, color: '#FFD75C',
                padding: '6px 12px', borderRadius: 999,
                border: '1px solid rgba(255,215,92,0.3)',
                letterSpacing: 0.3,
              }}>{a}</div>
            ))}
          </div>
        </div>

        {/* Recensione hero */}
        <div style={{ padding: '24px 24px 36px', background: '#0e0c0d' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 22,
          }}>
            <StarsRow rating={5} size={14} color="#FFD75C"/>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#fff', lineHeight: 1.5, fontStyle: 'italic', margin: '14px 0 16px' }}>
              "{v.topReview.text}"
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: 0.5 }}>
              {v.topReview.name.toUpperCase()} · {v.topReview.when.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Indirizzo */}
        <div style={{ padding: '0 24px 36px', background: '#0e0c0d' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: '#FFD75C', textTransform: 'uppercase', marginBottom: 12, opacity: 0.9 }}>Vieni a trovarci</div>
          <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>{v.address}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{v.hours}</div>
        </div>
      </div>

      <StickyBar onBook={onBook} secondary onSecondary={onMenu}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIANT C — OPERATIVO / RESY-STYLE
// ═════════════════════════════════════════════════════════════
function VenueC({ onBack, onMenu, onBook }) {
  const v = VENUE_DATA;
  const [photoIdx, setPhotoIdx] = useStateV(0);
  const [selectedSlot, setSelectedSlot] = useStateV('20:00');
  const [people, setPeople] = useStateV(2);
  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      color: TEXT_V, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
        {/* Compact hero */}
        <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
          <img src={v.photos[photoIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%)',
          }}/>
          {/* Photo dots */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {v.photos.map((_, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)} style={{
                width: 6, height: 6, borderRadius: 99,
                background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer',
              }}/>
            ))}
          </div>
        </div>

        {/* Title block */}
        <div style={{ padding: '20px 22px 18px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: TEXT_V, letterSpacing: -0.3, marginBottom: 6 }}>{v.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: TEXT_V, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5b400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {v.rating}
            </span>
            <span style={{ fontSize: 13, color: MUTED_V }}>({v.reviews})</span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: BORDER_V }}/>
            <span style={{ fontSize: 13, color: MUTED_V }}>{v.cuisine}</span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: BORDER_V }}/>
            <span style={{ fontSize: 13, color: MUTED_V }}>{v.price}</span>
          </div>
          <div style={{ fontSize: 13, color: MUTED_V, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_V} strokeWidth="2" strokeLinecap="round"><path d="M21 10 c 0 7 -9 13 -9 13 s -9 -6 -9 -13 a 9 9 0 0 1 18 0 z"/><circle cx="12" cy="10" r="3"/></svg>
            {v.address}
          </div>
          <div style={{ fontSize: 13, color: '#0a8a3a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: '#0a8a3a' }}/>
            Aperto ora · chiude alle 23:00
          </div>
        </div>

        {/* Booking widget — IL CUORE */}
        <div style={{
          margin: '0 18px 20px', padding: 18, borderRadius: 16,
          background: FOREST_V, color: '#fff',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#a8d8b6', textTransform: 'uppercase', marginBottom: 12 }}>
            Disponibilità stasera
          </div>
          {/* People selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Coperti:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[2,3,4,6].map(n => (
                <button key={n} onClick={() => setPeople(n)} style={{
                  width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: people === n ? '#fff' : 'rgba(255,255,255,0.12)',
                  color: people === n ? FOREST_V : '#fff',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                }}>{n}</button>
              ))}
            </div>
          </div>
          {/* Time slots */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {v.slots.map(t => {
              const sel = selectedSlot === t;
              return (
                <button key={t} onClick={() => setSelectedSlot(t)} style={{
                  flex: '1 1 0', minWidth: 60, padding: '12px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: sel ? '#fff' : 'rgba(255,255,255,0.12)',
                  color: sel ? FOREST_V : '#fff',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                }}>{t}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 12, textAlign: 'center' }}>
            Conferma istantanea · Cancellazione gratuita fino a 2h prima
          </div>
        </div>

        {/* Top review compact */}
        <div style={{ padding: '0 22px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_V, marginBottom: 12 }}>Recensioni recenti</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[v.topReview, ...v.reviews_list.slice(0,1)].map((r, i) => (
              <div key={i} style={{ background: BG_V, borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999, background: PINK_V, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                  }}>{r.initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_V }}>{r.name}</div>
                    <div style={{ fontSize: 11.5, color: MUTED_V }}>{r.when}</div>
                  </div>
                  <StarsRow rating={r.rating} size={12}/>
                </div>
                <div style={{ fontSize: 13, color: TEXT_V, lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
          <button style={{
            width: '100%', marginTop: 12, padding: '12px', borderRadius: 10,
            background: '#fff', border: `1.5px solid ${BORDER_V}`,
            fontSize: 13, fontWeight: 600, color: TEXT_V, fontFamily: 'inherit', cursor: 'pointer',
          }}>Vedi tutte le {v.reviews} recensioni</button>
        </div>

        {/* Signature compact */}
        <div style={{ padding: '0 22px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_V, marginBottom: 12 }}>Piatti di punta</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 4px' }}>
            {[v.signature, v.signature, v.signature].map((d, i) => (
              <div key={i} style={{ flex: '0 0 160px', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <img src={d.photo} alt="" style={{ width: '100%', height: 110, objectFit: 'cover' }}/>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_V }}>{['Cacio e Pepe','Carbonara','Amatriciana'][i]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: PINK_V, marginTop: 2 }}>{['14€','16€','15€'][i]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premi compact */}
        <div style={{ padding: '0 22px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_V, marginBottom: 10 }}>Riconoscimenti</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {v.awards.map((a, i) => (
              <span key={i} style={{
                fontSize: 12, fontWeight: 600, color: TEXT_V, background: BG_V,
                padding: '6px 11px', borderRadius: 999,
              }}>{a}</span>
            ))}
          </div>
        </div>

        {/* Storia compact */}
        <div style={{ padding: '0 22px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_V, marginBottom: 10 }}>Info</div>
          <div style={{ fontSize: 13, color: TEXT_V, lineHeight: 1.55 }}>{v.bio}</div>
        </div>
      </div>

      {/* Sticky CTA — single primary */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: `1px solid ${BORDER_V}`,
        padding: '12px 18px 22px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 30,
      }}>
        <div style={{ fontSize: 11.5, color: MUTED_V, textAlign: 'center' }}>
          {selectedSlot} · {people} {people === 1 ? 'persona' : 'persone'} · stasera
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onMenu} style={{
            flex: '0 0 auto', height: 50, padding: '0 18px', borderRadius: 999, border: `1.5px solid ${BORDER_V}`,
            background: '#fff', color: TEXT_V, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          }}>Menù</button>
          <button onClick={onBook} style={{
            flex: 1, height: 50, borderRadius: 999, border: 'none',
            background: PINK_V, color: '#fff', fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(233,30,99,0.3)',
          }}>Prenota a {selectedSlot}</button>
        </div>
      </div>
    </div>
  );
}

// Export to window
Object.assign(window, { VenueA, VenueB, VenueC });

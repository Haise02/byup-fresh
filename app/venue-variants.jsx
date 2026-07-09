// ─── Venue Variants — STILI DI VETRINA selezionabili ────────
// Stili alternativi della vetrina locale. NON sono dead code né A/B test:
// in produzione il ristoratore sceglierà lo stile dal GESTIONALE e il backend
// lo invierà coi dati del locale. Qui (prototipo) lo stile si forza via
// ?venue=a|b|c o window.__venueVariant — vedi il dispatcher VenueScreen in
// extras.jsx e Contesto-App.md §3.1.
//
// Gli stili:
//   a → Editorial / Magazine   (qui sotto, VenueA)
//   b → Cinematic / Tasting     (qui sotto, VenueB)
//   c → Operativo / Resy-style  (qui sotto, VenueC)
//   original → Classico (DEFAULT) — vive in extras.jsx come VenueOriginal,
//              perché è la vetrina storica e riusa helper locali (es. VenueMapThumbnail).
//
// NB: A/B/C usano i dati hardcoded di VENUE_DATA qui sotto; VenueOriginal usa
// invece la prop `venue` passata dall'app. Tenerne conto se si allineano i dati.

const { useState: useStateV, useEffect: useEffectV, useRef: useRefV } = React;

const PINK_V = '#E32459';
const TEXT_V = '#1c0f15';
const MUTED_V = '#6d5a61';
const BG_V = '#FBF4F1';
const BORDER_V = '#eddfda';
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
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=900&q=75&auto=format&fit=crop',
  ],
  signature: {
    name: 'Cacio e Pepe',
    desc: 'Tonnarelli fatti in casa, pecorino romano DOP stagionato 12 mesi, pepe nero del Sarawak.',
    price: '14€',
    photo: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=75&auto=format&fit=crop',
  },
  chef: {
    name: 'Marco De Santis',
    title: 'Chef e proprietario',
    bio: 'Cresciuto tra i fornelli della trattoria di famiglia in Trastevere. Una stella Michelin nel 2022.',
    photo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=75&auto=format&fit=crop',
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
  const [saved, setSaved] = useStateV(false);
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
        <button onClick={() => setSaved(s => !s)} style={{
          width: 38, height: 38, borderRadius: 999,
          background: saved ? PINK_V : bg, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          transition: 'background 0.18s',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#fff' : 'none'} stroke={saved ? '#fff' : fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61 a 5.5 5.5 0 0 0 -7.78 0 L 12 5.67 l -1.06 -1.06 a 5.5 5.5 0 0 0 -7.78 7.78 l 1.06 1.06 L 12 21.23 l 7.78 -7.78 1.06 -1.06 a 5.5 5.5 0 0 0 0 -7.78 z"/></svg>
        </button>
        <button onClick={() => onMore && onMore()} style={{
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
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '28px 28px 0 0',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      padding: '20px 20px 36px', display: 'flex', gap: 12, zIndex: 30,
    }}>
      <button onClick={onBook} style={{
        flex: 1, height: 58, borderRadius: 999, border: `1.5px solid ${BORDER_V}`,
        background: '#fff', color: TEXT_V, fontSize: 17, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
      }}>{primaryLabel}</button>
      {secondary && (
        <button onClick={onSecondary} style={{
          flex: 1, height: 58, borderRadius: 999, border: 'none',
          background: PINK_V, color: '#fff', fontSize: 17, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(227,36,89,0.3)',
        }}>{secondaryLabel}</button>
      )}
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
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
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
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
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
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
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
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        padding: '20px 20px 36px', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 30,
      }}>
        <div style={{ fontSize: 12, color: MUTED_V, textAlign: 'center' }}>
          {selectedSlot} · {people} {people === 1 ? 'persona' : 'persone'} · stasera
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBook} style={{
            flex: 1, height: 58, borderRadius: 999, border: `1.5px solid ${BORDER_V}`,
            background: '#fff', color: TEXT_V, fontSize: 17, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          }}>Prenota a {selectedSlot}</button>
          <button onClick={onMenu} style={{
            flex: 1, height: 58, borderRadius: 999, border: 'none',
            background: PINK_V, color: '#fff', fontSize: 17, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(227,36,89,0.3)',
          }}>Menù</button>
        </div>
      </div>
    </div>
  );
}

// Export to window
Object.assign(window, { VenueA, VenueB, VenueC });

// ─────────────────────────────────────────────────────────────
// PREMIUM — Vetrina per i locali selezionati byup.
// Food render su fondo crema (stile "floating dish"), menu per categorie
// con immagini a trasparenza, perks premium, CTA prenotazione sticky.
// Attivata dal flag `premium` sui dati del locale o via ?venue=premium.
// ─────────────────────────────────────────────────────────────
const GOLD_P = '#C9A227';
const GOLD_GRAD_P = 'linear-gradient(180deg,#ffe27a,#f0c246)';
const INK_P = '#1c0f15';
const CREAM_P = '#FDF9F3';
const CREAM2_P = '#F6EDDF';

const PREMIUM_MENU = {
  'Antipasti': [
    ['dish-bruschette', 'Bruschette al pomodoro', 'Pane di Lariano, datterini, basilico', '8€'],
    ['dish-tagliere', 'Tagliere della casa', 'Salumi laziali e pecorino DOP', '16€'],
    ['dish-fritto', "Fritto all'italiana", 'Supplì, fiori di zucca, baccalà', '12€'],
    ['dish-insalata', 'Insalata del mercato', 'Verdure di stagione, agrumi e semi', '9€'],
  ],
  'Primi': [
    ['dish-carbonara', 'Carbonara', 'Guanciale croccante, pecorino 24 mesi', '14€'],
    ['dish-risotto', 'Risotto ai funghi', 'Porcini, parmigiano, timo fresco', '16€'],
    ['dish-lasagna', 'Lasagna al forno', 'Ragù di manzo cotto 8 ore', '13€'],
  ],
  'Secondi': [
    ['dish-tagliata', 'Tagliata di manzo', 'Rucola, grana, riduzione al balsamico', '22€'],
    ['dish-branzino', 'Branzino al forno', 'Patate, olive taggiasche, datterini', '24€'],
    ['dish-polpo', 'Polpo alla brace', 'Crema di ceci, paprika affumicata', '21€'],
    ['dish-pollo', 'Pollo al mattone', 'Limone arrosto, rosmarino', '18€'],
    ['dish-verdure', 'Verdure alla griglia', "Dall'orto, olio EVO e basilico", '10€'],
  ],
  'Dolci': [
    ['dessert-tiramisu', 'Tiramisù', 'Mascarpone, savoiardi, caffè', '7€'],
    ['dessert-tortino', 'Tortino al cioccolato', 'Cuore fondente, lamponi e gelato', '8€'],
  ],
  'Drink': [
    ['drink-spritz', 'Spritz', 'Prosecco, bitter, arancia', '8€'],
    ['drink-negroni', 'Negroni', 'Gin, vermouth rosso, bitter', '9€'],
    ['drink-mojito', 'Mojito', 'Rum, lime, menta fresca', '9€'],
    ['drink-vino', 'Vino al calice', 'Selezione del sommelier', '7€'],
    ['drink-birra', 'Birra artigianale', 'Del birrificio locale', '6€'],
    ['drink-arancia', 'Spremuta', 'Arance di Ribera', '4€'],
  ],
};

function VenuePremium({ venue, onBack, onMenu, onBook, onHome, onProfile, onMap }) {
  const v = venue || {};
  const name = v.name || 'Al Settembrini';
  const [cat, setCat] = useStateV('Antipasti');
  const [saved, setSaved] = useStateV(false);
  const cats = Object.keys(PREMIUM_MENU);
  const photos = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=75&auto=format&fit=crop',
  ];
  const P = (f) => `assets/premium/${f}.webp`;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: CREAM_P, color: INK_P,
      fontFamily: "'Hanken Grotesk', -apple-system, system-ui, sans-serif",
    }}>
      <style>{`
        .vpz-hscroll{scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .vpz-hscroll::-webkit-scrollbar{display:none}
        @keyframes vpzFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes vpzFloatS{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(-2deg)}}
        @keyframes vpzIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      `}</style>

      {/* Topbar flottante */}
      <div style={{ position: 'absolute', top: 'calc(var(--byup-sat, 54px) + 6px)', left: 14, right: 14, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <button onClick={onBack} style={{ pointerEvents: 'auto', width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,.85)', border: '1px solid rgba(28,15,21,.08)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 6px 18px -8px rgba(77,18,46,.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK_P} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={() => setSaved(s => !s)} style={{ pointerEvents: 'auto', width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,.85)', border: '1px solid rgba(28,15,21,.08)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 6px 18px -8px rgba(77,18,46,.3)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#E32459' : 'none'} stroke={saved ? '#E32459' : INK_P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.6s-6.8-4.3-8.7-9.1C1.9 7.9 4.3 4.6 7.7 4.6c1.9 0 3.3.9 4.3 2.3 1-1.4 2.4-2.3 4.3-2.3 3.4 0 5.8 3.3 4.4 6.9-1.9 4.8-8.7 9.1-8.7 9.1z"/>
          </svg>
        </button>
      </div>

      <div className="vpz-hscroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden',
        paddingTop: 'calc(var(--byup-sat, 54px) + 6px)',
        paddingBottom: 'calc(170px + env(safe-area-inset-bottom, 0px))' }}>

        {/* ── HERO: composizione food render come la reference ── */}
        <div style={{ position: 'relative', padding: '46px 22px 0', textAlign: 'center',
          background: `radial-gradient(120% 70% at 50% 0%, ${CREAM2_P} 0%, ${CREAM_P} 70%)` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GOLD_GRAD_P,
            color: '#3d2c00', fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 999, boxShadow: '0 8px 20px -8px rgba(190,145,40,.7)',
            animation: 'vpzIn .4s ease both' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#3d2c00"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Selezione byup
          </span>
          <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 32, margin: '12px 0 4px',
            letterSpacing: '-0.5px', animation: 'vpzIn .4s .05s ease both' }}>{name}</h1>
          <div style={{ fontSize: 13.5, color: '#6d5a61', fontWeight: 600, animation: 'vpzIn .4s .1s ease both' }}>
            Cucina romana · €€€ · 0.4 km
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
            fontSize: 13, fontWeight: 800, color: INK_P, animation: 'vpzIn .4s .15s ease both' }}>
            {[0,1,2,3,4].map(i => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < 5 ? GOLD_P : 'none'} stroke={GOLD_P} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
            4.8 <span style={{ color: '#9a8a90', fontWeight: 600 }}>(320)</span>
          </div>

          {/* Composizione: piatto firma al centro, contorni ai lati */}
          <div style={{ position: 'relative', height: 250, marginTop: 6 }}>
            <div aria-hidden style={{ position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)',
              width: '68%', height: 30, borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(77,18,46,.22), transparent 75%)' }}/>
            <img src={P('dish-insalata')} alt="" style={{ position: 'absolute', left: '2%', bottom: 26, width: 118,
              animation: 'vpzFloatS 4.2s .3s ease-in-out infinite', filter: 'drop-shadow(0 14px 16px rgba(77,18,46,.25))' }}/>
            <img src={P('dish-verdure')} alt="" style={{ position: 'absolute', right: '2%', bottom: 24, width: 124,
              animation: 'vpzFloatS 4.6s .1s ease-in-out infinite', filter: 'drop-shadow(0 14px 16px rgba(77,18,46,.25))' }}/>
            <img src={P('dish-carbonara')} alt="La nostra carbonara" style={{ position: 'absolute', left: '50%', bottom: 30,
              transform: 'translateX(-50%)', width: 216, animation: 'vpzFloat 4s ease-in-out infinite',
              filter: 'drop-shadow(0 22px 22px rgba(77,18,46,.3))' }}/>
            <span style={{ position: 'absolute', left: '50%', bottom: -4, transform: 'translateX(-50%)',
              fontSize: 11.5, fontWeight: 700, color: '#6d5a61', whiteSpace: 'nowrap' }}>
              Piatto firma · <b style={{ color: INK_P }}>Carbonara</b> · dello chef De Santis
            </span>
          </div>
        </div>

        {/* ── Perks premium ── */}
        <div className="vpz-hscroll" style={{ display: 'flex', gap: 9, overflowX: 'auto', padding: '22px 22px 4px' }}>
          {[
            ['⚡', 'Prenotazione prioritaria'],
            ['🪙', 'Byuppini ×2 qui'],
            ['🥂', 'Benvenuto dello chef'],
          ].map(([e, t]) => (
            <span key={t} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#fff', border: '1px solid rgba(201,162,39,.4)', color: INK_P,
              fontSize: 12, fontWeight: 700, padding: '9px 14px', borderRadius: 999,
              boxShadow: '0 6px 16px -10px rgba(190,145,40,.5)' }}>
              <span>{e}</span>{t}
            </span>
          ))}
        </div>

        {/* ── IL MENU — categorie + piatti flottanti ── */}
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 21, margin: 0 }}>Il menu</h2>
            <button onClick={onMenu} style={{ background: 'none', border: 'none', color: '#E32459',
              fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}>
              Menu completo →</button>
          </div>
        </div>
        <div className="vpz-hscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 22px 6px' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flex: 'none', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, transition: 'all .15s',
              background: cat === c ? INK_P : '#fff', color: cat === c ? '#fff' : '#6d5a61',
              border: cat === c ? '1.5px solid ' + INK_P : '1.5px solid rgba(28,15,21,.1)' }}>{c}</button>
          ))}
        </div>
        <div key={cat} className="vpz-hscroll" style={{ display: 'flex', gap: 14, overflowX: 'auto',
          padding: '18px 22px 8px', scrollSnapType: 'x proximity' }}>
          {PREMIUM_MENU[cat].map(([img, title, desc, price], i) => (
            <div key={title} style={{ flex: 'none', width: 172, scrollSnapAlign: 'start',
              background: '#fff', borderRadius: 22, padding: '14px 14px 14px', textAlign: 'center',
              border: '1px solid rgba(28,15,21,.06)', boxShadow: '0 16px 34px -20px rgba(77,18,46,.35)',
              animation: `vpzIn .35s ${i * 60}ms ease both` }}>
              <div style={{ position: 'relative', height: 120, marginTop: -34 }}>
                <div aria-hidden style={{ position: 'absolute', left: '50%', bottom: 2, transform: 'translateX(-50%)',
                  width: '70%', height: 16, borderRadius: '50%',
                  background: 'radial-gradient(closest-side, rgba(77,18,46,.2), transparent 75%)' }}/>
                <img src={P(img)} alt={title} loading="lazy" style={{ position: 'absolute', left: '50%', bottom: 8,
                  transform: 'translateX(-50%)', maxWidth: 128, maxHeight: 116,
                  filter: 'drop-shadow(0 14px 14px rgba(77,18,46,.22))' }}/>
              </div>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 14.5, lineHeight: 1.15 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#8d7c83', marginTop: 3, lineHeight: 1.3, minHeight: 28 }}>{desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 15.5 }}>{price}</span>
                <button onClick={onMenu} aria-label={`Ordina ${title}`} style={{ width: 30, height: 30, borderRadius: 999,
                  border: 'none', cursor: 'pointer', background: 'linear-gradient(122deg,#E32459,#B81C47)',
                  color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', boxShadow: '0 8px 16px -8px rgba(227,36,89,.7)' }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sala & atmosfera ── */}
        <div style={{ padding: '22px 22px 0' }}>
          <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 21, margin: '0 0 12px' }}>Sala & atmosfera</h2>
        </div>
        <div className="vpz-hscroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 22px' }}>
          {photos.map((ph, i) => (
            <img key={i} src={ph} alt="" loading="lazy" style={{ flex: 'none', width: i === 0 ? 250 : 180, height: 150,
              objectFit: 'cover', borderRadius: 18, border: '1px solid rgba(28,15,21,.06)' }}/>
          ))}
        </div>

        {/* ── Recensione + riconoscimenti ── */}
        <div style={{ margin: '20px 22px 0', background: '#fff', borderRadius: 22, padding: 16,
          border: '1px solid rgba(28,15,21,.06)', boxShadow: '0 16px 34px -22px rgba(77,18,46,.35)' }}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            {[0,1,2,3,4].map(i => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={GOLD_P}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.45, color: INK_P }}>
            «Atmosfera incredibile e cucina autentica. La carbonara è la migliore di Roma.»
          </div>
          <div style={{ fontSize: 12, color: '#8d7c83', marginTop: 8, fontWeight: 600 }}>Giulia M. · 2 giorni fa · 320 recensioni</div>
          <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
            {['Top 10 Roma 2025', 'Gambero Rosso', 'Stella byup'].map(a => (
              <span key={a} style={{ fontSize: 10.5, fontWeight: 800, color: '#3d2c00', background: 'rgba(240,194,70,.25)',
                border: '1px solid rgba(201,162,39,.45)', padding: '4px 10px', borderRadius: 999 }}>{a}</span>
            ))}
          </div>
        </div>

        {/* ── Info ── */}
        <div style={{ margin: '14px 22px 0', background: '#fff', borderRadius: 22, padding: '6px 16px',
          border: '1px solid rgba(28,15,21,.06)' }}>
          {[
            ['Via dei Gracchi 56, Roma', 'Indicazioni', onMap],
            ['Aperto · 12:30 – 23:00', 'Orari', null],
          ].map(([t, a, fn], i, arr) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(28,15,21,.07)' : 'none' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</span>
              {fn
                ? <button onClick={fn} style={{ background: 'none', border: 'none', color: '#E32459', fontSize: 12.5,
                    fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{a} →</button>
                : <span style={{ fontSize: 12.5, color: '#8d7c83', fontWeight: 700 }}>{a}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA sticky: Prenota + Menu ── */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
        zIndex: 25, display: 'flex', gap: 10 }}>
        <button className="bk-press" onClick={onBook} style={{ flex: 1.6, height: 54, border: 'none', borderRadius: 999,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: '#fff',
          background: 'linear-gradient(122deg,#E32459,#B81C47)',
          boxShadow: '0 18px 36px -12px rgba(227,36,89,.6), inset 0 1px 0 rgba(255,255,255,.3)' }}>
          Prenota un tavolo</button>
        <button className="bk-press" onClick={onMenu} style={{ flex: 1, height: 54, borderRadius: 999,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: INK_P,
          background: 'rgba(255,255,255,.92)', border: '1.5px solid rgba(28,15,21,.12)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 12px 28px -14px rgba(77,18,46,.4)' }}>Menu</button>
      </div>

      {(() => { const B = window.BottomTabBar; return B ? <B active="home" onHome={onHome} onProfile={onProfile} showQR={false}/> : null; })()}
    </div>
  );
}

window.VenuePremium = VenuePremium;

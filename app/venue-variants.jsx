// ─── Venue Variants — STILI DI VETRINA selezionabili ────────
// Stili alternativi della vetrina locale. NON sono dead code né A/B test:
// in produzione il ristoratore sceglierà lo stile dal GESTIONALE e il backend
// lo invierà coi dati del locale. Qui (prototipo) lo stile si forza via
// ?venue=premium o window.__venueVariant — vedi il dispatcher VenueScreen in
// extras.jsx e Contesto-App.md §3.1.
//
// Gli stili:
//   premium  → Vetrina dei locali selezionati byup (qui sotto, VenuePremium).
//              Si attiva anche da sola col flag `premium` sui dati del locale.
//   original → Classico (DEFAULT) — vive in extras.jsx come VenueOriginal,
//              perché è la vetrina storica e riusa helper locali (es. VenueMapThumbnail).

const { useState: useStateV, useEffect: useEffectV } = React;

// ─────────────────────────────────────────────────────────────
// PREMIUM v2 — Vetrina per i locali selezionati byup.
// Hero con box-carousel foto/video, menu stile reel con food render PNG,
// orari espandibili, sedi, recensioni, reel, social, evento animato,
// headline finale con widget di prenotazione rapida (solo oggi/domani).
// Attivata dal flag `premium` sui dati del locale o via ?venue=premium.
// ─────────────────────────────────────────────────────────────
const GOLD_P = '#C9A227';
const GOLD_GRAD_P = 'linear-gradient(180deg,#ffe27a,#f0c246)';
const INK_P = '#1c0f15';
const CREAM_P = '#FDF9F3';
const CREAM2_P = '#F6EDDF';

const PREMIUM_MENU = {
  'Antipasti': [
    ['dish-bruschette', 'Bruschette', 'Pane di Lariano, datterini, basilico', '8€'],
    ['dish-tagliere', 'Tagliere della casa', 'Salumi laziali e pecorino DOP', '16€'],
    ['dish-fritto', "Fritto all'italiana", 'Supplì, fiori di zucca, baccalà', '12€'],
    ['dish-insalata', 'Insalata del mercato', 'Verdure di stagione e agrumi', '9€'],
  ],
  'Primi': [
    ['dish-carbonara', 'Carbonara', 'Guanciale croccante, pecorino 24 mesi', '14€'],
    ['dish-risotto', 'Risotto ai funghi', 'Porcini, parmigiano, timo fresco', '16€'],
    ['dish-lasagna', 'Lasagna al forno', 'Ragù di manzo cotto 8 ore', '13€'],
  ],
  'Secondi': [
    ['dish-tagliata', 'Tagliata di manzo', 'Rucola, grana, balsamico', '22€'],
    ['dish-branzino', 'Branzino al forno', 'Patate, olive, datterini', '24€'],
    ['dish-polpo', 'Polpo alla brace', 'Crema di ceci, paprika', '21€'],
    ['dish-pollo', 'Pollo al mattone', 'Limone arrosto, rosmarino', '18€'],
    ['dish-verdure', 'Verdure alla griglia', "Dall'orto, olio EVO", '10€'],
  ],
  'Dolci': [
    ['dessert-tiramisu', 'Tiramisù', 'Mascarpone, savoiardi, caffè', '7€'],
    ['dessert-tortino', 'Tortino al cioccolato', 'Cuore fondente e lamponi', '8€'],
  ],
  'Drink': [
    ['drink-spritz', 'Spritz', '', '8€'],
    ['drink-negroni', 'Negroni', '', '9€'],
    ['drink-mojito', 'Mojito', '', '9€'],
    ['drink-vino', 'Vino al calice', '', '7€'],
    ['drink-birra', 'Birra artigianale', '', '6€'],
    ['drink-arancia', 'Spremuta', '', '4€'],
  ],
};

const PREMIUM_HOURS = [
  ['Lunedì', '12:30 – 23:00'], ['Martedì', '12:30 – 23:00'], ['Mercoledì', '12:30 – 23:00'],
  ['Giovedì', '12:30 – 23:00'], ['Venerdì', '12:30 – 24:00'], ['Sabato', '12:30 – 24:00'],
  ['Domenica', 'Chiuso'],
];
const PREMIUM_REVIEWS = [
  { name: 'Giulia M.', initial: 'G', rating: 5, when: '2 giorni fa', text: 'Atmosfera incredibile e cucina autentica. La carbonara è la migliore di Roma.' },
  { name: 'Marco R.', initial: 'M', rating: 5, when: '1 settimana fa', text: 'Servizio impeccabile, vino consigliato dal cameriere perfetto.' },
  { name: 'Sara D.', initial: 'S', rating: 4, when: '2 settimane fa', text: 'Ottima esperienza, tornerò sicuramente con amici.' },
  { name: 'Luca P.', initial: 'L', rating: 5, when: '3 settimane fa', text: 'Il tavolo prioritario byup è una svolta: zero attesa il sabato sera.' },
];

// Stelle — stesso stile della vetrina originale (quadratini brand)
function PremStars({ rating = 4.8, reviews = 320 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {[1,2,3,4,5].map(n => {
        const filled = n <= Math.round(rating);
        return (
          <div key={n} style={{ width: 26, height: 26, borderRadius: 6,
            background: filled ? '#E32459' : '#f0e7dc',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        );
      })}
      <span style={{ marginLeft: 6, fontSize: 19, fontWeight: 800, color: INK_P, letterSpacing: -.4 }}>{rating}</span>
      <span style={{ fontSize: 12.5, color: '#8d7c83', fontWeight: 600 }}>· {reviews} recensioni</span>
    </div>
  );
}

function VenuePremium({ venue, onBack, onMenu, onBook, onHome, onProfile, onMap }) {
  const v = venue || {};
  const name = v.name || 'Al Settembrini';
  const isOpen = true; // demo: aperto ora
  const [cat, setCat] = useStateV('Antipasti');
  const [saved, setSaved] = useStateV(false);
  const [slide, setSlide] = useStateV(0);
  const [hoursOpen, setHoursOpen] = useStateV(false);
  const [reviewsOpen, setReviewsOpen] = useStateV(false);
  const [qbTime, setQbTime] = useStateV('20:30');
  const [qbPeople, setQbPeople] = useStateV(2);
  const [qbDone, setQbDone] = useStateV(false);
  // Il menu digitale eredita la veste premium
  const openMenu = () => { try { sessionStorage.setItem('byup_menu_premium', '1'); } catch {} onMenu && onMenu(); };
  const cats = Object.keys(PREMIUM_MENU);
  const photos = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=75&auto=format&fit=crop',
  ];
  const P = (f) => `assets/premium/${f}.webp`;
  const today = new Date().getDay(); // 0 dom
  const qbDay = (isOpen && today !== 0) ? 'oggi' : 'domani';

  // autoplay carousel hero
  useEffectV(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % photos.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: CREAM_P, color: INK_P,
      fontFamily: "'Hanken Grotesk', -apple-system, system-ui, sans-serif",
    }}>
      <style>{`
        .vpz-hscroll{scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .vpz-hscroll::-webkit-scrollbar{display:none}
        @keyframes vpzIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes vpzSheen{0%,60%{transform:translateX(-130%) skewX(-16deg)}100%{transform:translateX(260%) skewX(-16deg)}}
        @keyframes vpzPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.55)}50%{box-shadow:0 0 0 12px rgba(255,255,255,0)}}
        @keyframes vpzBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      `}</style>

      {/* Topbar flottante */}
      <div style={{ position: 'absolute', top: 'calc(var(--byup-sat, 54px) + 6px)', left: 14, right: 14, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <button onClick={onBack} style={{ pointerEvents: 'auto', width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,.88)', border: '1px solid rgba(28,15,21,.08)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 6px 18px -8px rgba(77,18,46,.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK_P} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={() => setSaved(s => !s)} style={{ pointerEvents: 'auto', width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,.88)', border: '1px solid rgba(28,15,21,.08)', cursor: 'pointer',
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

        {/* ── HERO ── */}
        <div style={{ position: 'relative', padding: '44px 22px 0', textAlign: 'center',
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
          <div style={{ fontSize: 13.5, color: '#6d5a61', fontWeight: 600, marginBottom: 10, animation: 'vpzIn .4s .1s ease both' }}>
            Cucina romana · €€€ · 0.4 km
          </div>
          <div style={{ animation: 'vpzIn .4s .15s ease both' }}>
            <PremStars/>
          </div>

          {/* Box carousel — foto/video del locale, avanzamento automatico */}
          <div style={{ position: 'relative', height: 210, marginTop: 16, borderRadius: 24, overflow: 'hidden',
            border: '1px solid rgba(28,15,21,.08)', boxShadow: '0 24px 48px -22px rgba(77,18,46,.45)',
            animation: 'vpzIn .45s .2s ease both' }}>
            <div style={{ display: 'flex', height: '100%', transform: `translateX(-${slide * 100}%)`,
              transition: 'transform .55s cubic-bezier(.4,0,.2,1)' }}>
              {photos.map((ph, i) => (
                <div key={i} style={{ position: 'relative', width: '100%', height: '100%', flexShrink: 0 }}>
                  <img src={ph} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                  {i === 0 && (
                    <>
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,8,10,.22)' }}/>
                      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                        width: 54, height: 54, borderRadius: 999, background: 'rgba(255,255,255,.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'vpzPulse 2.2s ease-in-out infinite', cursor: 'pointer' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={INK_P}><polygon points="8 5 20 12 8 19"/></svg>
                      </span>
                      <span style={{ position: 'absolute', left: 12, top: 12, background: 'rgba(15,8,10,.55)', color: '#fff',
                        fontSize: 10, fontWeight: 800, letterSpacing: .6, padding: '4px 9px', borderRadius: 999,
                        textTransform: 'uppercase', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>Video tour</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
              {photos.map((_, i) => (
                <span key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 99,
                  background: '#fff', opacity: i === slide ? 1 : .5, transition: 'width .25s, opacity .25s', cursor: 'pointer' }}/>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stato + orari espandibili ── */}
        <div style={{ margin: '14px 22px 0', background: '#fff', borderRadius: 20, border: '1px solid rgba(28,15,21,.06)',
          overflow: 'hidden' }}>
          <button onClick={() => setHoursOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', width: '100%',
            gap: 9, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: isOpen ? '#0a8a3a' : '#d21e50',
              boxShadow: isOpen ? '0 0 8px rgba(10,138,58,.55)' : '0 0 8px rgba(210,30,80,.55)' }}/>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: isOpen ? '#0a8a3a' : '#d21e50' }}>{isOpen ? 'Aperto ora' : 'Chiuso'}</span>
            <span style={{ fontSize: 13, color: '#8d7c83', fontWeight: 600 }}>· chiude alle 23:00</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8d7c83" strokeWidth="2.4" strokeLinecap="round"
              style={{ marginLeft: 'auto', transform: hoursOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {hoursOpen && (
            <div style={{ padding: '2px 16px 12px', animation: 'vpzIn .25s ease' }}>
              {PREMIUM_HOURS.map(([d, h], i) => {
                const isToday = i === ((today + 6) % 7);
                return (
                  <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                    fontSize: 13, fontWeight: isToday ? 800 : 600,
                    color: h === 'Chiuso' ? '#d21e50' : (isToday ? INK_P : '#6d5a61'),
                    borderBottom: i < PREMIUM_HOURS.length - 1 ? '1px solid rgba(28,15,21,.05)' : 'none' }}>
                    <span>{d}{isToday ? ' · oggi' : ''}</span><span>{h}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Perks (tutte visibili, niente scroll) ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '14px 22px 0' }}>
          {[['⚡', 'Prenotazione prioritaria'], ['🪙', 'Byuppini ×2 qui'], ['🥂', 'Benvenuto dello chef']].map(([e, t]) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1px solid rgba(201,162,39,.4)', color: INK_P,
              fontSize: 11.5, fontWeight: 700, padding: '8px 12px', borderRadius: 999,
              boxShadow: '0 6px 16px -10px rgba(190,145,40,.5)' }}>
              <span>{e}</span>{t}
            </span>
          ))}
        </div>

        {/* ── IL MENU — stile reel con food render ── */}
        <div style={{ padding: '22px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 21, margin: 0 }}>Il menu</h2>
            <button onClick={openMenu} style={{ background: 'none', border: 'none', color: '#E32459',
              fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}>Menu completo →</button>
          </div>
        </div>
        <div className="vpz-hscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 22px 4px' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flex: 'none', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, transition: 'all .15s',
              background: cat === c ? INK_P : '#fff', color: cat === c ? '#fff' : '#6d5a61',
              border: cat === c ? '1.5px solid ' + INK_P : '1.5px solid rgba(28,15,21,.1)' }}>{c}</button>
          ))}
        </div>
        <div key={cat} className="vpz-hscroll" style={{ display: 'flex', gap: 12, overflowX: 'auto',
          padding: '14px 22px 8px', scrollSnapType: 'x proximity' }}>
          {PREMIUM_MENU[cat].map(([img, title, desc, price], i) => {
            const drink = !desc;
            return (
              <div key={title} style={{ position: 'relative', flex: 'none', width: drink ? 128 : 158,
                height: drink ? 190 : 236, borderRadius: 20, overflow: 'hidden', scrollSnapAlign: 'start',
                background: 'radial-gradient(120% 90% at 50% 0%, #fffdf8 0%, #f3e8d8 100%)',
                border: '1px solid rgba(28,15,21,.07)', boxShadow: '0 18px 36px -20px rgba(77,18,46,.4)',
                animation: `vpzIn .35s ${i * 55}ms ease both` }}>
                {/* Ombra fissa + piatto ANCORATO AL BASSO sull'ombra: tutti allineati */}
                <div aria-hidden style={{ position: 'absolute', left: '50%', top: drink ? 96 : 108, transform: 'translateX(-50%)',
                  width: '62%', height: 14, borderRadius: '50%',
                  background: 'radial-gradient(closest-side, rgba(77,18,46,.22), transparent 75%)' }}/>
                <img src={P(img)} alt={title} loading="lazy" style={{ position: 'absolute', left: '50%',
                  bottom: drink ? 88 : 122, transform: 'translateX(-50%)',
                  maxWidth: drink ? 84 : 122, maxHeight: drink ? 92 : 104,
                  filter: 'drop-shadow(0 12px 12px rgba(77,18,46,.25))' }}/>
                {/* gradiente scuro in basso, stile reel */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: drink ? '46%' : '52%',
                  background: 'linear-gradient(180deg, transparent, rgba(26,12,18,.78) 55%, rgba(26,12,18,.94))' }}/>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 11px 11px', color: '#fff' }}>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: drink ? 13 : 14.5, lineHeight: 1.15 }}>{title}</div>
                  {!drink && <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.75)', marginTop: 3, lineHeight: 1.3 }}>{desc}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: drink ? 6 : 9 }}>
                    <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 15 }}>{price}</span>
                    {!drink && (
                      <button onClick={openMenu} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: 'linear-gradient(122deg,#E32459,#B81C47)', color: '#fff', fontSize: 11,
                        fontWeight: 800, padding: '6px 12px', borderRadius: 999,
                        boxShadow: '0 8px 16px -8px rgba(227,36,89,.8)' }}>Ordina</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Dalla cucina — reel/video preview ── */}
        <div style={{ padding: '20px 22px 0' }}>
          <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 21, margin: '0 0 12px' }}>Dalla cucina</h2>
        </div>
        <div className="vpz-hscroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 22px' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ position: 'relative', flex: 'none', width: 118, height: 176, borderRadius: 16,
              overflow: 'hidden', border: '1px solid rgba(28,15,21,.07)', cursor: 'pointer' }}>
              <img src={`assets/reels/reel-${n}.webp`} alt="" loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(15,8,10,.55))' }}/>
              <span style={{ position: 'absolute', left: 9, bottom: 8, color: '#fff', fontSize: 10.5, fontWeight: 800 }}>0:{20 + n * 7}</span>
            </div>
          ))}
        </div>

        {/* ── Evento — card animata ── */}
        <div style={{ position: 'relative', margin: '20px 22px 0', borderRadius: 22, overflow: 'hidden',
          background: 'linear-gradient(140deg,#2a1208,#4a2508 55%,#6b3a05)',
          border: '1px solid rgba(255,207,74,.5)', padding: '16px 16px 15px', color: '#fff',
          boxShadow: '0 22px 44px -20px rgba(107,58,5,.65)' }}>
          <span aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '38%', height: '100%',
            background: 'linear-gradient(100deg, transparent, rgba(255,226,122,.22), transparent)',
            animation: 'vpzSheen 3.6s ease-in-out infinite', pointerEvents: 'none' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ flex: 'none', width: 52, height: 56, borderRadius: 14, background: GOLD_GRAD_P, color: '#3d2c00',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              animation: 'vpzBob 3.2s ease-in-out infinite', boxShadow: '0 10px 20px -8px rgba(0,0,0,.5)' }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5 }}>Gio</span>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 21, lineHeight: 1 }}>16</span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 800,
                letterSpacing: .6, textTransform: 'uppercase', color: '#ffe27a' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#ffe27a', animation: 'vpzPulse 2s ease-in-out infinite' }}/>
                Evento · posti limitati
              </span>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 17, marginTop: 3 }}>Cena degli chef · 5 portate</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>Con vini in abbinamento · 65€ a persona</div>
            </div>
            <button onClick={onBook} style={{ flex: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid rgba(255,255,255,.35)',
              fontSize: 11.5, fontWeight: 800, padding: '9px 13px', borderRadius: 999,
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>Riserva</button>
          </div>
        </div>

        {/* ── Recensioni ── */}
        <div style={{ padding: '22px 22px 0' }}>
          <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 21, margin: '0 0 12px' }}>Cosa dicono di noi</h2>
          {PREMIUM_REVIEWS.slice(0, 2).map((r) => (
            <div key={r.name} style={{ background: '#fff', borderRadius: 18, padding: '13px 14px', marginBottom: 10,
              border: '1px solid rgba(28,15,21,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: '#E32459', flexShrink: 0,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{r.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: '#8d7c83' }}>{r.when}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= r.rating ? '#E32459' : '#e8dfe2'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>{r.text}</div>
            </div>
          ))}
          <button onClick={() => setReviewsOpen(true)} style={{ display: 'block', width: '100%', padding: '13px 0',
            background: '#fff', border: '1.5px solid rgba(28,15,21,.1)', borderRadius: 999, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: INK_P }}>Vedi tutte le 320 recensioni</button>
        </div>

        {/* ── Sedi + social ── */}
        <div style={{ margin: '18px 22px 0', background: '#fff', borderRadius: 20, padding: '4px 16px',
          border: '1px solid rgba(28,15,21,.06)' }}>
          {[['Roma · Via dei Gracchi 56', 'Sede principale', onMap], ['Milano · Corso Venezia 50', 'Altra sede', null], ['Firenze · Via dei Calzaiuoli 12', 'Altra sede', null]].map(([t, sub, fn], i, arr) => (
            <button key={t} onClick={fn || undefined} style={{ display: 'flex', alignItems: 'center', width: '100%',
              gap: 11, padding: '13px 0', background: 'none', border: 'none', cursor: fn ? 'pointer' : 'default',
              fontFamily: 'inherit', textAlign: 'left',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(28,15,21,.06)' : 'none' }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: CREAM2_P,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD_P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700 }}>{t}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#8d7c83', fontWeight: 600 }}>{sub}</span>
              </span>
              {fn && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8d7c83" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18"/></svg>}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '16px 22px 0' }}>
          {[
            ['Instagram', <svg key="ig" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={INK_P} strokeWidth="1.9" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.2" fill={INK_P} stroke="none"/></svg>],
            ['Facebook', <svg key="fb" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={INK_P} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.7v-7.5h2.6l.6-3.5h-3.2V8c0-.9.5-1.5 1.5-1.5H15z"/></svg>],
            ['TikTok', <svg key="tt" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK_P} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 3v10.8a3.9 3.9 0 1 1-3.4-3.87"/><path d="M14.5 5.2c.8 2.3 2.6 3.8 5 4"/></svg>],
          ].map(([label, icon]) => (
            <button key={label} aria-label={label} style={{ width: 44, height: 44, borderRadius: 999, cursor: 'pointer',
              background: '#fff', border: '1px solid rgba(28,15,21,.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 8px 18px -12px rgba(77,18,46,.4)' }}>{icon}</button>
          ))}
        </div>

        {/* ── Headline finale + prenotazione rapida ── */}
        <div style={{ margin: '26px 22px 0', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 25, lineHeight: 1.15, margin: 0 }}>
            Il tavolo migliore di Roma<br/>ti sta aspettando</h2>
          <p style={{ fontSize: 13, color: '#6d5a61', fontWeight: 600, margin: '8px 0 14px' }}>
            Prenotazione prioritaria per i membri byup · conferma immediata</p>
          <div style={{ background: '#fff', borderRadius: 22, padding: 16, border: '1px solid rgba(201,162,39,.45)',
            boxShadow: '0 20px 42px -22px rgba(190,145,40,.55)' }}>
            {!qbDone ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', color: GOLD_P, marginBottom: 10 }}>
                  Prenotazione rapida · {qbDay}
                </div>
                <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                  {['19:30', '20:00', '20:30', '21:00'].map(t => (
                    <button key={t} onClick={() => setQbTime(t)} style={{ padding: '9px 14px', borderRadius: 999,
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, transition: 'all .15s',
                      background: qbTime === t ? INK_P : CREAM_P, color: qbTime === t ? '#fff' : '#6d5a61',
                      border: qbTime === t ? '1.5px solid ' + INK_P : '1.5px solid rgba(28,15,21,.1)' }}>{t}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 13 }}>
                  {[2, 3, 4, 6].map(n => (
                    <button key={n} onClick={() => setQbPeople(n)} style={{ width: 40, height: 40, borderRadius: 999,
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, transition: 'all .15s',
                      background: qbPeople === n ? INK_P : CREAM_P, color: qbPeople === n ? '#fff' : '#6d5a61',
                      border: qbPeople === n ? '1.5px solid ' + INK_P : '1.5px solid rgba(28,15,21,.1)' }}>{n}</button>
                  ))}
                  <span style={{ alignSelf: 'center', fontSize: 11.5, color: '#8d7c83', fontWeight: 700 }}>persone</span>
                </div>
                <button className="bk-press" onClick={() => setQbDone(true)} style={{ width: '100%', height: 52, border: 'none',
                  borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: '#fff',
                  background: 'linear-gradient(122deg,#E32459,#B81C47)',
                  boxShadow: '0 16px 32px -12px rgba(227,36,89,.6)' }}>
                  Prenota {qbDay} alle {qbTime}</button>
                <button onClick={onBook} style={{ display: 'block', width: '100%', marginTop: 9, background: 'none',
                  border: 'none', color: '#8d7c83', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', padding: 6 }}>Altre date e opzioni →</button>
              </>
            ) : (
              <div style={{ animation: 'vpzIn .3s ease' }}>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: '#E8F5E9', margin: '2px auto 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a8a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 18 }}>Tavolo riservato</div>
                <div style={{ fontSize: 13, color: '#6d5a61', fontWeight: 600, margin: '4px 0 10px' }}>
                  {qbDay.charAt(0).toUpperCase() + qbDay.slice(1)} alle {qbTime} · {qbPeople} persone · a nome Mario</div>
                <button onClick={() => setQbDone(false)} style={{ background: 'none', border: 'none', color: '#E32459',
                  fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', padding: 6 }}>Modifica</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sheet: tutte le recensioni */}
      {reviewsOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setReviewsOpen(false); }} style={{
          position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(15,8,10,.5)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxHeight: '78%', background: CREAM_P, borderRadius: '24px 24px 0 0',
            padding: '12px 20px calc(24px + env(safe-area-inset-bottom, 0px))', overflowY: 'auto',
            animation: 'slideUp .28s cubic-bezier(.2,.9,.3,1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 38, height: 4, borderRadius: 999, background: 'rgba(28,15,21,.15)' }}/>
            </div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 600, marginBottom: 4 }}>Recensioni</div>
            <div style={{ marginBottom: 14 }}><PremStars/></div>
            {PREMIUM_REVIEWS.map((r) => (
              <div key={r.name} style={{ background: '#fff', borderRadius: 16, padding: '12px 13px', marginBottom: 9,
                border: '1px solid rgba(28,15,21,.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: '#8d7c83' }}>{r.when}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= r.rating ? '#E32459' : '#e8dfe2'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA sticky — su box glass come la vetrina classica */}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
        zIndex: 25, display: 'flex', gap: 8, padding: 8, borderRadius: 999,
        background: 'rgba(253,249,243,.62)', border: '1px solid rgba(28,15,21,.09)',
        backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        boxShadow: '0 16px 38px -18px rgba(77,18,46,.45)' }}>
        <button className="bk-press" onClick={onBook} style={{ flex: 1.6, height: 54, border: 'none', borderRadius: 999,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: '#fff',
          background: 'linear-gradient(122deg,#E32459,#B81C47)',
          boxShadow: '0 18px 36px -12px rgba(227,36,89,.6), inset 0 1px 0 rgba(255,255,255,.3)' }}>Prenota un tavolo</button>
        <button className="bk-press" onClick={openMenu} style={{ flex: 1, height: 54, borderRadius: 999,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: INK_P,
          background: 'rgba(255,255,255,.92)', border: '1.5px solid rgba(28,15,21,.12)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 12px 28px -14px rgba(77,18,46,.4)' }}>Menu</button>
      </div>

      {(() => { const B = window.BottomTabBar; return B ? <B active="home" onHome={onHome} onProfile={onProfile}/> : null; })()}
    </div>
  );
}

window.VenuePremium = VenuePremium;

// byup — Vetrina del locale (ripristinata dall'originale byup-App/extras.jsx)
// VenueOriginal + helper, esposta come window.VenueScreen. Usata dalla web app
// (menu.jsx): header del menu -> vetrina; back -> menu; Prenota -> popup app.
const { useState, useEffect, useRef } = React;

const PINK_X = '#E32459';
const TEXT_X = '#1F1A1B';
const MUTED_X = '#7A7176';
const BG_X = '#F5F5F5';
const BORDER_X = '#EAE6E7';

// ─── La valutazione del locale (P-157) ──────────────────────────────
// Copia guardata di byupReadValutazione / byupStelle (gestionale/panoramica-
// tokens.jsx): stesso registro byup_valutazione sullo stesso dominio, stesso
// seme (312 recensioni Byup, media 4,6), stesse stelle.
function byupValutazioneLeggi() {
  const SEME = { media: 4.6, n: 312 };
  try { const s = localStorage.getItem('byup_valutazione'); if (s) { const v = JSON.parse(s); if (v && isFinite(v.media)) return Object.assign({}, SEME, v); } } catch {}
  return { ...SEME };
}
function byupStelle(media) {
  const m = Number(media) || 0, intera = Math.floor(m), resto = m - intera;
  return [1, 2, 3, 4, 5].map(n => n <= intera ? 'piena' : (n === intera + 1 && resto >= 0.25) ? 'mezza' : 'vuota');
}

function VenueMapThumbnail({ lat, lng }) {
  const divRef = useRef(null);
  useEffect(() => {
    if (!window.L || !divRef.current) return;
    const map = window.L.map(divRef.current, {
      center: [lat, lng], zoom: 15,
      zoomControl: false, attributionControl: false,
      dragging: false, scrollWheelZoom: false,
      touchZoom: false, doubleClickZoom: false, keyboard: false,
    });
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
    const pin = `<div style="width:14px;height:14px;border-radius:50%;background:#E32459;border:3px solid #fff;box-shadow:0 2px 8px rgba(227,36,89,0.55)"></div>`;
    window.L.marker([lat, lng], {
      icon: window.L.divIcon({ className: '', html: pin, iconSize: [14,14], iconAnchor: [7,7] }),
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 60);
    return () => map.remove();
  }, [lat, lng]);
  return <div ref={divRef} style={{ width: '100%', height: '100%' }}/>;
}

function VenueOriginal({ venue, onBack, onMenu, onBook, onMap }) {
  const v = venue || {};
  const photos = v.photos || [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70&auto=format&fit=crop',
  ];
  const dishes = v.dishes || [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=70&auto=format&fit=crop',
  ];
  const [faqOpen, setFaqOpen] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreClosing, setMoreClosing] = useState(false);
  function closeMore() { setMoreClosing(true); }
  function onMoreAnimEnd() { if (moreClosing) { setMoreOpen(false); setMoreClosing(false); } }
  const [bioExpanded, setBioExpanded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [heroExpanded, setHeroExpanded] = useState(false);
  const HERO_SHORT = 220;
  const HERO_TALL  = 370;
  const dragStart = useRef(null);
  const autoTimer = useRef(null);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);

  const resetAutoTimer = () => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => setPhotoIdx(i => (i + 1) % photos.length), 8000);
  };

  useEffect(() => {
    resetAutoTimer();
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y > lastScrollY.current + 8)  setHeroExpanded(false); // scorre giù → chiude
      if (y < lastScrollY.current - 8 && y < 30) setHeroExpanded(true);  // torna in cima → apre
      lastScrollY.current = y;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const onDragStart = (x, y) => { dragStart.current = { x, y }; };
  const onDragEnd = (x, y) => {
    if (!dragStart.current) return;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    dragStart.current = null;
    // click (nessun drag) → toggle espandi/collassa
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      setHeroExpanded(e => !e);
      return;
    }
    if (Math.abs(dy) > Math.abs(dx)) {
      // swipe verticale → espandi / collassa
      if (dy > 40) setHeroExpanded(true);
      if (dy < -40) setHeroExpanded(false);
    } else {
      // swipe orizzontale → cambia foto
      if (Math.abs(dx) < 40) return;
      if (dx < 0) setPhotoIdx(i => Math.min(i + 1, photos.length - 1));
      else        setPhotoIdx(i => Math.max(i - 1, 0));
      resetAutoTimer();
    }
  };
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(null);
  const [reportSent, setReportSent] = useState(false);
  const faqs = [
    { q: 'Siete aperti il sabato?', a: 'Sì, dalle 12:00 alle 23:00 con orario continuato.' },
    { q: 'Avete opzioni vegane?', a: 'Certo, almeno 5 piatti vegani sono sempre disponibili.' },
    { q: 'Posso prenotare per gruppi?', a: 'Sì, fino a 30 persone con preavviso di 24 ore.' },
  ];
  const reviews = [
    { name: 'Giulia M.', initial: 'G', rating: 5, when: '2 giorni fa', text: 'Atmosfera incredibile e cucina autentica. La cacio e pepe è la migliore di Roma.', dish: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop' },
    { name: 'Marco R.', initial: 'M', rating: 5, when: '1 settimana fa', text: 'Servizio impeccabile, vino consigliato dal cameriere perfetto.', dish: 'https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=400&q=70&auto=format&fit=crop' },
    { name: 'Sara D.', initial: 'S', rating: 4, when: '2 settimane fa', text: 'Ottima esperienza, tornerò sicuramente con amici.', dish: null },
  ];
  const reportReasons = [
    'Cibo o ambiente non sicuri',
    'Comportamento del personale',
    'Truffa o prezzi scorretti',
    'Discriminazione',
    'Foto o info ingannevoli',
    'Altro motivo',
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT_X, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Floating top buttons (sticky over scroll) */}
      <div style={{
        position: 'absolute', top: 50, left: 16, right: 16, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button onClick={() => moreOpen ? closeMore() : setMoreOpen(true)} style={{
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={TEXT_X}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Hero — swipeable gallery */}
        <div
          style={{
            position: 'relative',
            height: heroExpanded ? HERO_TALL : HERO_SHORT,
            background: '#222', cursor: 'grab', userSelect: 'none',
            transition: 'height 0.38s cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseDown={e => onDragStart(e.clientX, e.clientY)}
          onMouseUp={e => onDragEnd(e.clientX, e.clientY)}
          onMouseLeave={() => { dragStart.current = null; }}
          onTouchStart={e => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
        >
          {/* Sliding strip */}
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
          }}>
          <div style={{
            display: 'flex', height: '100%',
            transform: `translateX(-${photoIdx * 100}%)`,
            transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0,
                pointerEvents: 'none',
              }}/>
            ))}
          </div>
          </div>
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.72) 100%)',
            pointerEvents: 'none',
          }}/>
          {/* Title */}
          <div style={{ position: 'absolute', left: 20, right: 96, bottom: 44, color: '#fff', pointerEvents: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85, textTransform: 'uppercase', marginBottom: 5 }}>
              Cucina Romana
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}>
              {v.name || 'Ristorante Cacio e Pepe'}
            </div>
          </div>
          {/* Expand hint */}
          {!heroExpanded && (
            <div style={{
              position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                <path d="M2 2l7 6 7-6" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {/* Dot indicators */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5, pointerEvents: 'none',
          }}>
            {photos.map((_, i) => (
              <div key={i} style={{
                width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 99,
                background: '#fff', opacity: i === photoIdx ? 1 : 0.45,
                transition: 'width 0.25s, opacity 0.25s',
              }}/>
            ))}
          </div>
          {/* Logo — straddles hero bottom edge */}
          <div style={{
            position: 'absolute', right: 20, bottom: -40, zIndex: 5,
            width: 80, height: 80, borderRadius: 999,
            background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '3px solid rgba(255,255,255,0.95)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: 999,
              background: 'linear-gradient(135deg, #FFD3DC 0%, #FFB0C0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: PINK_X, fontFamily: 'Georgia, serif',
            }}>CP</div>
          </div>
        </div>

        {/* Status badges row */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 20px 0 20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: '#0a8a3a', background: '#e6f5e9',
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>APERTO</span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: TEXT_X, background: '#FFE8B0',
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>🏆 TOP 10 ROMA</span>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          {/* Address + hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10 c 0 7 -9 13 -9 13 s -9 -6 -9 -13 a 9 9 0 0 1 18 0 z"/><circle cx="12" cy="10" r="3"/></svg>
              Via dei Gracchi 56, 00187 Roma
            </div>
            <div style={{ fontSize: 13.5, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Lun – Ven · 11:00 – 23:00
            </div>
          </div>

          {/* Recensione media */}
          <div style={{ marginTop: 18, marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 10 }}>
              Recensione media
            </div>
            {/* Un valore solo, dal registro condiviso byup_valutazione (P-157):
                lo stesso della Panoramica e dell'anteprima in Impostazioni.
                Le stelle seguono il numero. */}
            {(() => { const val = byupValutazioneLeggi(); const stelle = byupStelle(val.media); return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {stelle.map((st, i) => {
                const n = i + 1;
                return (
                  <div key={n} style={{
                    width: 30, height: 30, borderRadius: 7,
                    background: st === 'piena' ? PINK_X : st === 'mezza' ? `linear-gradient(90deg, ${PINK_X} 50%, #f0e6e9 50%)` : '#f0e6e9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                );
              })}
              <div style={{ marginLeft: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: TEXT_X, letterSpacing: -0.5 }}>{val.media.toFixed(1).replace('.', ',')}</span>
                <span style={{ fontSize: 14, color: MUTED_X, fontWeight: 500 }}>· {val.n} recensioni</span>
              </div>
            </div>
            ); })()}
          </div>

          {/* Promo / Eventi */}
          <Section title="Promo / Eventi">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <PromoTag info="Ogni giorno · 18:00 – 21:00">Aperitivo 2x1</PromoTag>
              <PromoTag info="Tutti i venerdì · dalle 21:00">Karaoke venerdì</PromoTag>
              <PromoTag info="Ogni domenica · 11:00 – 15:00">Brunch domenica</PromoTag>
            </div>
          </Section>

          {/* Premi */}
          <Section title="Premi e riconoscimenti">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <AwardTag>Top 10 Roma 2025</AwardTag>
              <AwardTag>Gambero Rosso</AwardTag>
              <AwardTag>Tripadvisor Excellence</AwardTag>
            </div>
          </Section>

          {/* Bio */}
          <Section title="La nostra storia">
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: TEXT_X }}>
              {bioExpanded
                ? <>Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno. Pasta tirata a mano ogni mattina, materie prime dai mercati di Testaccio e Campagna Amica. Carta dei vini con 200 etichette del Lazio. Una stella Michelin nel 2022. {' '}<span onClick={() => setBioExpanded(false)} style={{ color: PINK_X, fontWeight: 600, cursor: 'pointer' }}>Meno ↑</span></>
                : <>Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno.{' '}<span onClick={() => setBioExpanded(true)} style={{ color: PINK_X, fontWeight: 600, cursor: 'pointer' }}>...Altro</span></>
              }
            </div>
          </Section>

          {/* Piatti in evidenza */}
          <Section title="Chef consiglia">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {dishes.map((p, i) => {
                const names = ['Cacio e Pepe', 'Carbonara', 'Amatriciana', 'Tonnarello', 'Supplì', 'Tiramisù'];
                return (
                  <div key={i} style={{
                    borderRadius: 16, overflow: 'hidden',
                    background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                  }}>
                    <div style={{ height: 140, overflow: 'hidden' }}>
                      <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_X }}>{names[i]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Recensioni */}
          <Section title="Cosa dicono di noi">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r, i) => (
                <div key={i} style={{
                  padding: '13px 14px', borderRadius: 14,
                  background: BG_X,
                  display: 'flex', flexDirection: 'column', gap: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 999, background: PINK_X, flexShrink: 0,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13,
                    }}>{r.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT_X }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: MUTED_X }}>{r.when}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= r.rating ? '#f5b400' : '#e0d8db'}><polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9"/></svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: TEXT_X }}>{r.text}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Mappa */}
          <Section title="Dove siamo">
            <div style={{ height: 160, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
              <VenueMapThumbnail lat={v.lat || 41.9065} lng={v.lng || 12.4642}/>
              <button onClick={onMap} style={{
                position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
                background: '#fff', border: 'none', borderRadius: 999,
                padding: '8px 16px', fontSize: 12.5, fontWeight: 700, color: TEXT_X,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}>Vedi mappa →</button>
            </div>
          </Section>

          {/* Altre info */}
          <Section title="Altre info">
            <div style={{ background: BG_X, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow icon="P" label="Parcheggio custodito Via Giulia"/>
              <InfoRow icon="M" label="Metro Tiburtina linea B · Bus 54, 60, 12, 40"/>
            </div>
          </Section>

          {/* Altre sedi */}
          <Section title="Altre sedi">
            <SedeRow city="Milano" addr="Corso Venezia 50"/>
            <div style={{ height: 8 }}/>
            <SedeRow city="Firenze" addr="Via dei Calzaiuoli 12"/>
          </Section>

          {/* FAQ */}
          <Section title="Domande frequenti">
            {faqs.map((f, i) => (
              <div key={i} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} style={{
                borderBottom: `1px solid ${BORDER_X}`, padding: '12px 0', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: TEXT_X }}>{f.q}</span>
                  <span style={{ color: MUTED_X, transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>⌄</span>
                </div>
                {faqOpen === i && <div style={{ fontSize: 13, color: MUTED_X, marginTop: 8, lineHeight: 1.5 }}>{f.a}</div>}
              </div>
            ))}
          </Section>

          {/* Galleria */}
          <Section title="Galleria fotografica">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ gridRow: 'span 2', borderRadius: 12, overflow: 'hidden', height: 200 }}>
                <img src={photos[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 96 }}>
                <img src={photos[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 96 }}>
                <img src={photos[3]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            </div>
          </Section>

          {/* Social */}
          <Section title="Canali Social">
            <div style={{ display: 'flex', gap: 12 }}>
              <SocialDot label="f"/>
              <SocialDot label="ig"/>
              <SocialDot label="yt"/>
            </div>
          </Section>

          <LegalFooter/>
        </div>
      </div>

      {/* More menu (kebab) */}
      {moreOpen && (
        <>
          <style>{`
            @keyframes moreSheetUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
            @keyframes moreSheetDown { from { transform: translateY(0); }    to { transform: translateY(100%); } }
            @keyframes moreBackIn    { from { opacity: 0; } to { opacity: 1; } }
            @keyframes moreBackOut   { from { opacity: 1; } to { opacity: 0; } }
          `}</style>
          <div onClick={closeMore} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 20,
            animation: moreClosing ? 'moreBackOut 0.25s ease forwards' : 'moreBackIn 0.22s ease',
          }}/>
          <div onClick={(e) => e.stopPropagation()} onAnimationEnd={onMoreAnimEnd} style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 0 34px', zIndex: 21,
            animation: moreClosing
              ? 'moreSheetDown 0.28s cubic-bezier(0.32,0.72,0,1) forwards'
              : 'moreSheetUp 0.30s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8db', borderRadius: 999, margin: '8px auto 16px' }}/>
            <MoreRow label="Condividi" icon="↗"/>
            <div style={{ height: 1, background: BORDER_X, margin: '6px 20px' }}/>
            <MoreRow label="Segnala questo locale" icon="⚠" danger
              onClick={() => { closeMore(); setReportOpen(true); setReportSent(false); setReportReason(null); }}/>
          </div>
        </>
      )}

      {/* Report sheet */}
      {reportOpen && (
        <div onClick={() => setReportOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 25,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 20px 30px', maxHeight: '80%', overflowY: 'auto',
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8db', borderRadius: 999, margin: '8px auto 16px' }}/>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Segnalazione inviata</div>
                <div style={{ fontSize: 13.5, color: MUTED_X, lineHeight: 1.5, marginBottom: 20 }}>
                  Il team byup la esaminerà entro 48 ore. Ti aggiorneremo via email.
                </div>
                <button onClick={() => setReportOpen(false)} style={{
                  width: '100%', height: 50, background: TEXT_X, color: '#fff',
                  border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Chiudi</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Segnala questo locale</div>
                <div style={{ fontSize: 13, color: MUTED_X, lineHeight: 1.5, marginBottom: 16 }}>
                  Aiutaci a mantenere byup sicuro. Le tue segnalazioni sono anonime per il locale e revisionate dal nostro team.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {reportReasons.map(r => (
                    <button key={r} onClick={() => setReportReason(r)} style={{
                      textAlign: 'left', padding: '14px 16px', borderRadius: 12,
                      border: `1.5px solid ${reportReason === r ? PINK_X : BORDER_X}`,
                      background: reportReason === r ? '#FCE9EE' : '#fff',
                      fontSize: 14, color: TEXT_X, fontWeight: reportReason === r ? 600 : 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{r}</span>
                      {reportReason === r && <span style={{ color: PINK_X, fontWeight: 700 }}>✓</span>}
                    </button>
                  ))}
                </div>
                <textarea placeholder="Vuoi aggiungere dettagli? (opzionale)" style={{
                  width: '100%', minHeight: 80, padding: 12, borderRadius: 12,
                  border: `1px solid ${BORDER_X}`, fontSize: 13.5, fontFamily: 'inherit',
                  resize: 'none', marginBottom: 16, boxSizing: 'border-box',
                }}/>
                <button disabled={!reportReason} onClick={() => setReportSent(true)} style={{
                  width: '100%', height: 50,
                  background: reportReason ? PINK_X : '#f0e8ea',
                  color: reportReason ? '#fff' : MUTED_X,
                  border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: reportReason ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                }}>Invia segnalazione</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sticky CTA — sits above tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        opacity: moreOpen ? 0 : 1, pointerEvents: moreOpen ? 'none' : 'auto',
        transition: 'opacity 0.2s',
        padding: '16px 16px 32px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        display: 'flex', gap: 12, zIndex: 1000,
      }}>
        <button onClick={onBook} style={{
          flex: 1, height: 58, background: '#fff', color: TEXT_X,
          border: `1.5px solid ${BORDER_X}`, borderRadius: 999, fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Prenota</button>
        <button onClick={onMenu} style={{
          flex: 1, height: 58, background: PINK_X, color: '#fff',
          border: 'none', borderRadius: 999, fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(227,36,89,0.3)',
        }}>Menù</button>
      </div>

    </div>
  );
}

function MoreRow({ label, icon, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 22px', background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left',
      color: danger ? '#c44' : TEXT_X, fontSize: 14.5, fontWeight: 500,
    }}>
      <span style={{ fontSize: 18, width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function PromoTag({ children, info }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <span onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: open ? PINK_X : '#FFF4E8',
        color: open ? '#fff' : TEXT_X,
        padding: '6px 14px', borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
        cursor: 'pointer', transition: 'all 0.15s',
        userSelect: 'none',
      }}>
        {children}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {open && info && (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#fff', border: `1px solid ${BORDER_X}`,
          borderRadius: 12, padding: '6px 12px',
          fontSize: 12, color: MUTED_X, fontWeight: 500,
          whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        }}>{info}</span>
      )}
    </div>
  );
}
// Premi: outline minimal con icona alloro
function AwardTag({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#fff', color: TEXT_X, padding: '6px 12px 6px 10px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
      border: `1px solid ${BORDER_X}`,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9 a 6 6 0 0 0 12 0 V3 H6 z M12 15 v 6 M8 21 h 8"/>
      </svg>
      {children}
    </span>
  );
}
function InfoRow({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: '#fff', border: `1px solid ${BORDER_X}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: TEXT_X }}>{icon}</div>
      <div style={{ fontSize: 13, color: TEXT_X, flex: 1 }}>{label}</div>
    </div>
  );
}
function SedeRow({ city, addr }) {
  return (
    <div style={{ background: BG_X, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{city}</div>
      <div style={{ fontSize: 12.5, color: MUTED_X }}>{addr}</div>
    </div>
  );
}
function SocialDot({ label }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 999, background: TEXT_X, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, fontFamily: 'serif',
    }}>{label}</div>
  );
}

// La web app non ha varianti: esponiamo direttamente l'originale come VenueScreen.
window.VenueScreen = VenueOriginal;

// ─── Footer legale ──────────────────────────────────────────────────────────
// Piccolo e quieto di proposito: i link a Termini e Privacy devono esserci
// (obbligo informativo), non farsi notare. Colore del testo più muto della
// pagina, sottolineatura al 50% — riconoscibili come link senza alzare la
// voce. Vive qui (venue.jsx si carica prima di menu.jsx) e serve entrambe
// le schermate via window.
function LegalFooter() {
  const link = {
    color: '#b3a8ac', textDecoration: 'underline',
    textDecorationColor: 'rgba(179, 168, 172, 0.5)', textUnderlineOffset: 2,
  };
  return (
    <div style={{
      textAlign: 'center', padding: '22px 16px 6px',
      fontSize: 11, lineHeight: 1.6, color: '#b3a8ac',
    }}>
      <a href="https://byup.it/termini" target="_blank" rel="noopener" style={link}>Termini e condizioni</a>
      {' · '}
      <a href="https://byup.it/privacy" target="_blank" rel="noopener" style={link}>Informativa sulla privacy</a>
    </div>
  );
}
window.LegalFooter = LegalFooter;

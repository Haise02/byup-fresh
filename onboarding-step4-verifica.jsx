// Step 4 — Verifica menu (thank-you celebrativa).
//
// LAYOUT 55/45: contenuto sx (confetti + headline + checklist + accordion)
// e phone mockup dx con menu auto-scroll. Footer CTAs full-width.
//
// MOMENTI CELEBRAZIONE:
//   • Confetti canvas one-shot 3s al mount
//   • Checklist con micro-bounce sequenziale (delay 150ms × item)
//   • Accordion con primo item sempre visibile + reveal prezzo on hover
//   • CTA primaria con freccia che si sposta on hover (translate 4px)

const MENU_PREVIEW = [
  {id: 'antipasti', name: 'Antipasti', count: 3, dishes: [
    {name: 'Bruschetta al pomodoro',          price: 6.00,  color: '#F4B860'},
    {name: 'Tagliere misto',                  price: 14.00, color: '#A87B5C'},
    {name: 'Burrata pugliese',                price: 10.00, color: '#F5F0E8'},
  ]},
  {id: 'primi', name: 'Primi piatti', count: 5, dishes: [
    {name: 'Cacio e Pepe',                    price: 14.00, color: '#E8D58E'},
    {name: 'Carbonara',                       price: 15.00, color: '#D9B26F'},
    {name: 'Amatriciana',                     price: 14.00, color: '#C75D4B'},
    {name: 'Gricia',                          price: 13.00, color: '#D5C8A8'},
    {name: 'Ravioli ricotta e spinaci',       price: 13.50, color: '#A8C09B'},
  ]},
  {id: 'secondi', name: 'Secondi piatti', count: 3, dishes: [
    {name: 'Saltimbocca alla romana',         price: 18.00, color: '#B57563'},
    {name: 'Coda alla vaccinara',             price: 22.00, color: '#7B4634'},
    {name: 'Trippa alla romana',              price: 16.00, color: '#C8856B'},
  ]},
  {id: 'dolci', name: 'Dolci', count: 2, dishes: [
    {name: 'Tiramisù',                        price: 7.00,  color: '#7B5C45'},
    {name: 'Panna cotta',                     price: 6.00,  color: '#F5EBDC'},
  ]},
  {id: 'bevande', name: 'Bevande', count: 2, dishes: [
    {name: 'Acqua naturale 75cl',             price: 3.00,  color: '#BFD7E5'},
    {name: 'Vino della casa (1/2 lt)',        price: 8.00,  color: '#7B2230'},
  ]},
];

function Step4Verifica({venue, rooms, onBack, onComplete}) {
  const totalDishes = MENU_PREVIEW.reduce((s, c) => s + c.count, 0);
  const totalTables = rooms.reduce((s, r) => s + r.tables, 0);

  return (
    <div style={{
      padding: '40px 48px 64px',
      background: ONB.BG_SOFT,
      minHeight: 760,
    }}>
      <div style={{maxWidth: 1080, margin: '0 auto'}}>

        {/* Two-column split 55/45 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.22fr 1fr',  /* ≈55/45 */
          gap: 48, alignItems: 'flex-start',
        }}>
          {/* LEFT — celebration + content */}
          <div style={{position: 'relative', minWidth: 0}}>
            {/* Confetti — canvas absolutely positioned su top dell'area sinistra */}
            <ConfettiCanvas/>

            {/* Eyebrow */}
            <div style={{
              fontSize: 12, fontWeight: 500, color: ONB.MUTED,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              marginBottom: 12, position: 'relative', zIndex: 1,
            }}>
              Step 4 di 4
            </div>

            <h1 style={{
              fontSize: 40, fontWeight: 600, lineHeight: 1.2,
              letterSpacing: '-0.02em', margin: '0 0 12px', color: ONB.TEXT,
              position: 'relative', zIndex: 1,
            }}>
              Il tuo locale è online.
            </h1>
            <p style={{
              fontSize: 16, fontWeight: 400, lineHeight: 1.4,
              color: ONB.MUTED, margin: '0 0 32px', maxWidth: 540,
              position: 'relative', zIndex: 1,
            }}>
              {/* Bold + italic combinato sulla parte clickable concettuale.
                  La frase chiude il percorso onboarding e rassicura: "il setup
                  non è una gabbia, modifichi quando vuoi". */}
              Puoi modificare il tuo menù <b><i>dalle impostazioni locale</i></b> quando vuoi.
            </p>

            {/* Checklist */}
            <CompletionChecklist
              venue={venue}
              rooms={rooms}
              totalDishes={totalDishes}
              totalTables={totalTables}
            />

            {/* Anteprima menu accordion */}
            <div style={{marginTop: 24}}>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <h2 style={{
                  fontSize: 16, fontWeight: 600, color: ONB.TEXT,
                  letterSpacing: '-0.01em', margin: 0,
                }}>
                  Anteprima del menù
                </h2>
                <span style={{fontSize: 13, color: ONB.MUTED, fontWeight: 500}}>
                  {totalDishes} piatti · {MENU_PREVIEW.length} categorie
                </span>
              </div>

              <div style={{
                background: '#fff',
                border: '1px solid rgba(15, 17, 21, 0.08)',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(15, 17, 21, 0.04)',
              }}>
                {MENU_PREVIEW.map((cat, i) => (
                  <MenuCategoryRow
                    key={cat.id}
                    cat={cat}
                    isLast={i === MENU_PREVIEW.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — phone mockup */}
          <div style={{position: 'sticky', top: 24}}>
            <PhoneMockup/>
          </div>
        </div>

        {/* Footer CTAs — full width sotto le due colonne */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 40, paddingTop: 24,
          borderTop: '1px solid rgba(15, 17, 21, 0.08)',
        }}>
          <SecondaryCta onClick={onBack}>
            <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
            Indietro
          </SecondaryCta>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            {/* Inversione gerarchia: l'azione consigliata è ora entrare subito nel
                prodotto ("Inizia a gestire il locale" → Panoramica). La configurazione
                avanzata resta accessibile come alternativa, separata da un "oppure"
                discreto per chiarire che è un bivio, non una sequenza. */}
            <PrimaryCtaArrow onClick={() => onComplete && onComplete('panoramica')}>
              Inizia a gestire il locale
            </PrimaryCtaArrow>
            <span style={{
              fontSize: 12, fontWeight: 500, color: ONB.MUTED_LIGHT,
              letterSpacing: '0.04em',
            }}>
              oppure
            </span>
            <SecondaryCta onClick={() => onComplete && onComplete('config')}>
              Completa la configurazione
            </SecondaryCta>
          </div>
        </div>
      </div>

      <style>{`
        /* Bounce sequenziale checklist — 4 item con delay 150ms */
        @keyframes check-bounce {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes row-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Phone auto-scroll: translateY 0 → -50% (lista duplicata) */
        @keyframes phone-scroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        .phone-mockup:hover .phone-scroll-content { animation-play-state: paused; }

        /* Menu accordion item hover state — reveal prezzo + tinted bg */
        .accordion-dish-item:hover {
          background: ${ONB.BG_SOFT};
        }
        .accordion-dish-item:hover .dish-price {
          color: ${ONB.TEXT};
          opacity: 1;
        }

        /* CTA arrow — translate on hover del wrapper */
        .cta-with-arrow .cta-arrow {
          transition: transform 200ms ease-out;
        }
        .cta-with-arrow:hover .cta-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ConfettiCanvas — particle field one-shot 3s.
// 50 particelle che cadono dall'alto con gravità + drift orizzontale + rotazione.
// Colori brand + complementari. pointer-events:none così non intercetta click.
// ─────────────────────────────────────────────────────────────────────────

function ConfettiCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Palette mista: brand + green + amber + AI viola + saffron + sage
    const COLORS = [
      ONB.BRAND, ONB.GREEN, ONB.AMBER, ONB.AI,
      '#C7882B', '#5B8270',
    ];

    const w = () => canvas.clientWidth, h = () => canvas.clientHeight;
    const particles = Array.from({length: 50}, () => ({
      x: Math.random() * w(),
      y: -10 - Math.random() * 240,                 // start sopra l'area visibile, staggered
      vx: (Math.random() - 0.5) * 1.2,              // drift orizzontale leggero
      vy: 1.2 + Math.random() * 2.4,                // velocità verticale base
      ax: 0,                                         // accelerazione (gravità)
      ay: 0.04,                                      // gravity tick
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.18,
      size: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() < 0.55 ? 'rect' : 'circle',
    }));

    const start = performance.now();
    let raf = 0;

    const loop = () => {
      const elapsed = performance.now() - start;
      ctx.clearRect(0, 0, w(), h());

      particles.forEach(p => {
        p.vx += p.ax;
        p.vy += p.ay;
        p.x  += p.vx;
        p.y  += p.vy;
        p.rot += p.vRot;

        // Fade out negli ultimi 600ms (2400 → 3000ms)
        const opacity = elapsed > 2400 ? Math.max(0, 1 - (elapsed - 2400) / 600) : 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          // Rettangolino sottile (3:1) — coriandolo
          ctx.fillRect(-p.size, -p.size / 3, p.size * 2, (p.size * 2) / 3);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < 3000) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute', top: -20, left: 0, right: 0,
        width: '100%', height: 360,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CompletionChecklist — 4 item, ognuno con bounce sequenziale 150ms stagger.
// Check verde 20×20.
// ─────────────────────────────────────────────────────────────────────────

function CompletionChecklist({venue, rooms, totalDishes, totalTables}) {
  const items = [
    {label: 'Menù',      value: `${totalDishes} piatti in ${MENU_PREVIEW.length} categorie`},
    {label: 'Locale',    value: [venue.name, venue.city].filter(Boolean).join(' · ') || 'Da completare'},
    {label: 'Pagamenti', value: 'Stripe connesso'},
    {label: 'Sale',      value: `${rooms.length} ${rooms.length === 1 ? 'sala' : 'sale'} · ${totalTables} tavoli`},
  ];
  // L2 Aurora soft wash multi-color — pink + lavender + cream mesh su base
  // sfumata pink→lavender. La checklist celebrativa vive sullo stesso wash
  // dell'Anagrafica in Step 2: aurora L2 = momento warm celebrativo del flow.
  return (
    <div className="glass-lift-hover" style={{
      position: 'relative', zIndex: 1,
      background:
        'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
        'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
        'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
        'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)',
      border: '1px solid rgba(190, 175, 220, 0.14)',
      borderRadius: 12,
      padding: 4,
      boxShadow: '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 16px rgba(15, 17, 21, 0.03)',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          borderBottom: i < items.length - 1
            ? '1px solid rgba(15, 17, 21, 0.06)'
            : 'none',
          animation: `row-rise 320ms ease-out ${i * 150}ms both`,
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: 999,
            background: '#10B981',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.18)',
            animation: `check-bounce 380ms ease-out ${i * 150}ms both`,
          }}>
            <OnbIcon.Check size={12}/>
          </span>
          <span style={{
            fontSize: 13, fontWeight: 500, color: ONB.MUTED,
            width: 100, flexShrink: 0,
          }}>
            {it.label}
          </span>
          <span style={{
            fontSize: 14, fontWeight: 500, color: ONB.TEXT, flex: 1,
            lineHeight: 1.4,
          }}>
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MenuCategoryRow — accordion compatto, tutto chiuso default.
// Click sull'header espande l'intera lista piatti. Compattezza prima.
// ─────────────────────────────────────────────────────────────────────────

function MenuCategoryRow({cat, isLast}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid rgba(15, 17, 21, 0.04)',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
          textAlign: 'left',
          transition: 'background 150ms ease-out',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = ONB.BG_SOFT}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          transform: expanded ? 'rotate(0)' : 'rotate(-90deg)',
          transition: 'transform 150ms ease-out',
          color: ONB.MUTED,
          display: 'flex', alignItems: 'center',
        }}>
          <OnbIcon.ChevronDown size={14} color={ONB.MUTED}/>
        </div>
        <span style={{
          fontSize: 14, fontWeight: 600, color: ONB.TEXT, flex: 1,
          letterSpacing: '-0.01em',
        }}>
          {cat.name}
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: 999,
          background: ONB.BG, color: ONB.MUTED,
          fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
        }}>
          {cat.count} {cat.count === 1 ? 'piatto' : 'piatti'}
        </span>
      </button>

      {/* Lista piatti — visibile solo on expand. Default chiuso → schermata
          compatta, l'utente decide cosa esplodere. */}
      {expanded && cat.dishes.map((d, i) => (
        <DishItem key={i} dish={d}/>
      ))}
    </div>
  );
}

function DishItem({dish}) {
  return (
    <div className="accordion-dish-item" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '8px 20px 8px 46px',
      transition: 'background 150ms ease-out',
      cursor: 'default',
    }}>
      <span style={{fontSize: 14, fontWeight: 400, color: ONB.TEXT, lineHeight: 1.4}}>
        {dish.name}
      </span>
      {/* Prezzo: opacità 0.5 a riposo, opacità 1 + colore TEXT su hover.
          "Reveal prezzo" interpretato come emphasis-on-hover: la lista
          a riposo legge come scansione veloce di nomi, l'hover comunica
          dettaglio commerciale. */}
      <span className="dish-price" style={{
        fontSize: 14, fontWeight: 500, color: ONB.MUTED, opacity: 0.55,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 16,
        transition: 'opacity 150ms ease-out, color 150ms ease-out',
      }}>
        € {dish.price.toFixed(2)}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PhoneMockup — frame iPhone-like + auto-scroll del menu (30px/s, pausa hover).
// La lista è duplicata 2x per loop seamless con translateY 0 → -50%.
// ─────────────────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="phone-mockup" style={{
      width: 280, height: 570, background: '#1a1a1a',
      borderRadius: 38, padding: 8,
      boxShadow: '0 12px 36px rgba(15, 17, 21, 0.16), 0 1px 2px rgba(15, 17, 21, 0.04)',
      margin: '0 auto',
      position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: ONB.BG_SOFT,
        borderRadius: 30, overflow: 'hidden',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 86, height: 22,
          background: '#1a1a1a',
          borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
          zIndex: 3,
        }}/>

        {/* Status bar */}
        <div style={{
          padding: '8px 22px 4px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, fontWeight: 600, color: ONB.TEXT,
          flexShrink: 0, position: 'relative', zIndex: 2,
        }}>
          <span style={{fontVariantNumeric: 'tabular-nums'}}>9:41</span>
          <span style={{
            width: 22, height: 10,
            border: '1.2px solid currentColor', borderRadius: 2,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', inset: 1, width: 16,
              background: 'currentColor', borderRadius: 1,
            }}/>
          </span>
        </div>

        {/* Venue header — pinned top */}
        <div style={{
          padding: '14px 16px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(15, 17, 21, 0.06)',
          background: ONB.BG_SOFT,
          flexShrink: 0, zIndex: 2,
        }}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{
              fontSize: 11, fontWeight: 500, color: ONB.MUTED, lineHeight: 1.2,
            }}>
              Tavolo 7
            </div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: ONB.TEXT,
              letterSpacing: '-0.01em', marginTop: 2,
            }}>
              Cacio e Pepe
            </div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: '#fff', boxShadow: '0 1px 2px rgba(15,17,21,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ONB.TEXT} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="20" y1="20" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        {/* Scrolling menu area */}
        <div className="phone-scroll-area" style={{
          flex: 1, overflow: 'hidden', position: 'relative',
        }}>
          <div className="phone-scroll-content" style={{
            // 30px/s su ~750px (lista singola) → ~25s per giro completo (×2 → translateY -50%)
            animation: 'phone-scroll 25s linear infinite',
            willChange: 'transform',
          }}>
            <PhoneMenuList/>
            <PhoneMenuList/> {/* duplicata per loop seamless */}
          </div>
        </div>

        {/* Cart bar pinned bottom */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: '#fff',
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          boxShadow: '0 -4px 16px rgba(15, 17, 21, 0.06)',
          padding: '10px 14px 14px',
          zIndex: 2,
        }}>
          <div style={{
            width: 36, height: 4, background: 'rgba(15, 17, 21, 0.12)',
            borderRadius: 999, margin: '0 auto 8px',
          }}/>
          <button style={{
            width: '100%', height: 40, borderRadius: 999, border: 'none',
            background: ONB.ACTION_SECONDARY, color: '#fff',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Apri ordine
            <span style={{opacity: 0.5}}>·</span>
            <span style={{fontWeight: 500, opacity: 0.8}}>15 piatti</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PhoneMenuList() {
  return (
    <div>
      {MENU_PREVIEW.map(cat => (
        <div key={cat.id}>
          {/* Categoria header dentro la lista scrollante */}
          <div style={{
            padding: '14px 16px 6px',
            fontSize: 11, fontWeight: 600, color: ONB.MUTED,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {cat.name}
          </div>
          {cat.dishes.map((d, i) => (
            <div key={i} style={{
              margin: '0 12px 8px', padding: 10, gap: 10,
              background: '#fff', borderRadius: 12,
              boxShadow: '0 1px 2px rgba(15, 17, 21, 0.04)',
              display: 'flex', alignItems: 'center',
            }}>
              {/* Image placeholder — colored swatch (no foto AI generata) */}
              <div style={{
                width: 56, height: 56, borderRadius: 10,
                background: d.color, flexShrink: 0,
              }}/>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{
                  fontSize: 12.5, fontWeight: 600, color: ONB.TEXT,
                  lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {d.name}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: ONB.TEXT,
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 6,
                }}>
                  € {d.price.toFixed(2)}
                </div>
              </div>
              {/* Add button */}
              <button style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: ONB.ACTION_SECONDARY, border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <OnbIcon.Plus size={12} color="#fff"/>
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PrimaryCtaArrow — variante di PrimaryCta con freccia animata on hover.
// Translate 0→4px su 200ms ease-out come da brief.
// ─────────────────────────────────────────────────────────────────────────

function PrimaryCtaArrow({onClick, disabled, children}) {
  const [hover, setHover] = React.useState(false);
  const bg = disabled
    ? 'rgba(15, 17, 21, 0.08)'
    : hover ? ONB.ACTION_PRIMARY_HOVER : ONB.ACTION_PRIMARY;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cta-with-arrow"
      style={{
        height: 44, padding: '0 20px',
        background: bg,
        color: disabled ? ONB.MUTED_LIGHT : '#fff',
        border: 'none', borderRadius: 8,
        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 150ms ease-out',
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      {children}
      <span className="cta-arrow" style={{display: 'inline-flex', alignItems: 'center'}}>
        <OnbIcon.ArrowRight size={14} color="#fff"/>
      </span>
    </button>
  );
}

window.Step4Verifica = Step4Verifica;

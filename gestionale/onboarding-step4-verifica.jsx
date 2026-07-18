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

const MENU_INIZIALE = [
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
  // Il menù è stato, non più una costante: nomi, prezzi e categorie si
  // modificano qui. MENU_INIZIALE resta il seed dell'import AI.
  const [menu, setMenu] = React.useState(MENU_INIZIALE);

  const totalDishes = menu.reduce((s, c) => s + c.dishes.length, 0);
  const totalTables = rooms.reduce((s, r) => s + r.tables, 0);

  const updateDish = (catId, idx, patch) =>
    setMenu(m => m.map(c => c.id !== catId ? c : {
      ...c, dishes: c.dishes.map((d, i) => i === idx ? {...d, ...patch} : d),
    }));

  const removeDish = (catId, idx) =>
    setMenu(m => m.map(c => c.id !== catId ? c : {
      ...c, dishes: c.dishes.filter((_, i) => i !== idx),
    }));

  const addDish = (catId) =>
    setMenu(m => m.map(c => c.id !== catId ? c : {
      ...c, dishes: [...c.dishes, {name: '', price: 0, color: '#E4E7EB'}],
    }));

  const renameCategory = (catId, name) =>
    setMenu(m => m.map(c => c.id === catId ? {...c, name} : c));

  const removeCategory = (catId) => setMenu(m => m.filter(c => c.id !== catId));

  const addCategory = () =>
    setMenu(m => [...m, {id: `cat-${Date.now()}`, name: '', dishes: []}]);

  return (
    <div style={{
      minHeight: '100%',
      background: ONB.BG_SOFT,
      padding: '32px 80px 28px',
      display: 'flex', alignItems: 'flex-start',
    }}>
      <div style={{width: '100%', maxWidth: 1240, margin: '0 auto'}}>

        {/* Stessa griglia degli altri step. La colonna stretta tiene il telefono
            e, sotto, il riepilogo di quanto configurato. */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 72, alignItems: 'start',
        }}>

          {/* ─── Colonna sinistra — chiusura + editor del menù ─────────── */}
          <div style={{position: 'relative', minWidth: 0}}>
            {/* Confetti — canvas absolutely positioned su top dell'area sinistra */}
            <ConfettiCanvas/>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: ONB.BRAND_TINT, color: ONB.BRAND_DARK,
              fontSize: 14, fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              marginBottom: 20, position: 'relative', zIndex: 1,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: 999, background: ONB.BRAND, display: 'inline-block',
              }}/>
              Step 4 di 4
            </div>

            <h1 style={{
              fontSize: 40, fontWeight: 600, lineHeight: 1.15,
              letterSpacing: '-0.025em', margin: '0 0 16px', color: ONB.TEXT,
              position: 'relative', zIndex: 1,
            }}>
              Il tuo locale è online.
            </h1>
            <p style={{
              fontSize: 18, fontWeight: 400, lineHeight: 1.5,
              color: ONB.MUTED, margin: '0 0 28px', maxWidth: 520,
              position: 'relative', zIndex: 1,
            }}>
              {/* Bold + italic combinato sulla parte clickable concettuale.
                  La frase chiude il percorso onboarding e rassicura: "il setup
                  non è una gabbia, modifichi quando vuoi". */}
              Puoi modificare il tuo menù <b><i>dalle impostazioni locale</i></b> quando vuoi.
            </p>

            {/* ── Anteprima del menù — editabile ── */}
            <div style={{position: 'relative', zIndex: 1}}>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <h2 style={{
                  fontSize: 20, fontWeight: 600, color: ONB.TEXT,
                  letterSpacing: '-0.01em', margin: 0,
                }}>
                  Anteprima del menù
                </h2>
                <span style={{fontSize: 15, color: ONB.MUTED, fontWeight: 500}}>
                  {totalDishes} piatti · {menu.length} categorie
                </span>
              </div>

              <div style={{
                background: '#fff',
                border: '1px solid rgba(15, 17, 21, 0.08)',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(15, 17, 21, 0.04)',
              }}>
                {menu.map((cat, i) => (
                  <MenuCategoryRow
                    key={cat.id}
                    cat={cat}
                    isLast={i === menu.length - 1}
                    onRename={(name) => renameCategory(cat.id, name)}
                    onRemove={() => removeCategory(cat.id)}
                    onUpdateDish={(idx, patch) => updateDish(cat.id, idx, patch)}
                    onRemoveDish={(idx) => removeDish(cat.id, idx)}
                    onAddDish={() => addDish(cat.id)}
                  />
                ))}
              </div>

              <button onClick={addCategory} style={{
                marginTop: 10, width: '100%', padding: '11px 16px',
                background: 'transparent',
                border: '1.5px dashed rgba(15, 17, 21, 0.16)',
                borderRadius: 10,
                fontSize: 15, fontWeight: 500, color: ONB.TEXT, fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'border-color 150ms ease-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(15, 17, 21, 0.32)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(15, 17, 21, 0.16)'}
              >
                <OnbIcon.Plus size={14} color={ONB.TEXT}/>
                Aggiungi categoria
              </button>

              {/* Ribadito accanto all'editor e non solo nell'headline: è qui che
                  l'utente si chiede se deve sistemare tutto adesso. */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                fontSize: 14, lineHeight: 1.45, color: ONB.MUTED, marginTop: 12,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 999, flexShrink: 0, marginTop: 1,
                  background: 'rgba(15, 17, 21, 0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: ONB.MUTED,
                }}>i</span>
                Qui puoi correggere al volo nomi e prezzi. Il menù completo —
                foto, descrizioni, allergeni e disponibilità — si gestisce in
                qualsiasi momento da Impostazioni → Menù.
              </div>
            </div>
          </div>

          {/* ─── Colonna destra — telefono, e sotto il riepilogo ────────── */}
          <div>
            <PhoneMockup menu={menu} height={430}/>
            <div style={{marginTop: 16}}>
              <CompletionChecklist
                venue={venue}
                rooms={rooms}
                totalDishes={totalDishes}
                totalCategories={menu.length}
                totalTables={totalTables}
              />
            </div>
          </div>
        </div>

        {/* Footer CTAs — full width sotto le due colonne, sticky perché
            l'editor del menù può far crescere la colonna oltre il canvas. */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', bottom: 0, zIndex: 6,
          marginTop: 20, paddingTop: 18, paddingBottom: 4,
          borderTop: '1px solid rgba(15, 17, 21, 0.08)',
          background: ONB.BG_SOFT,
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
              fontSize: 14, fontWeight: 500, color: ONB.MUTED_LIGHT,
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

        .accordion-dish-item:hover { background: ${ONB.BG_SOFT}; }
        /* Il pulsante elimina compare solo sulla riga sotto il cursore: la lista
           a riposo resta pulita e non sembra un pannello di amministrazione. */
        .accordion-dish-item .dish-remove { opacity: 0; transition: opacity 150ms ease-out; }
        .accordion-dish-item:hover .dish-remove { opacity: 1; }

        /* Campi inline: invisibili finché non li tocchi, così la lista si legge
           come un menù e non come un form. */
        .inline-edit {
          font-family: inherit;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 3px 6px;
          margin: -3px -6px;
          outline: none;
          transition: background 120ms ease-out, border-color 120ms ease-out;
        }
        .inline-edit:hover { background: rgba(15, 17, 21, 0.04); }
        .inline-edit:focus {
          background: #fff;
          border-color: ${ONB.BRAND};
          box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.12);
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

function CompletionChecklist({venue, rooms, totalDishes, totalCategories, totalTables}) {
  const items = [
    {label: 'Menù',      value: `${totalDishes} piatti in ${totalCategories} categorie`},
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
            fontSize: 15, fontWeight: 500, color: ONB.MUTED,
            width: 100, flexShrink: 0,
          }}>
            {it.label}
          </span>
          <span style={{
            fontSize: 16, fontWeight: 500, color: ONB.TEXT, flex: 1,
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

function MenuCategoryRow({cat, isLast, onRename, onRemove, onUpdateDish, onRemoveDish, onAddDish}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid rgba(15, 17, 21, 0.04)',
    }}>
      {/* Header: non piu' un <button> unico, perche' il nome della categoria e'
          un campo di testo e un input dentro un button non e' valido. Il toggle
          resta sulla freccia e sul badge. */}
      <div className="accordion-dish-item" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 16px',
        transition: 'background 150ms ease-out',
      }}>
        <button
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Comprimi categoria' : 'Espandi categoria'}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0,
            transform: expanded ? 'rotate(0)' : 'rotate(-90deg)',
            transition: 'transform 150ms ease-out',
          }}
        >
          <OnbIcon.ChevronDown size={14} color={ONB.MUTED}/>
        </button>

        <input
          className="inline-edit"
          value={cat.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Nome categoria"
          aria-label="Nome categoria"
          style={{
            flex: 1, minWidth: 0,
            fontSize: 16, fontWeight: 600, color: ONB.TEXT,
            letterSpacing: '-0.01em',
          }}
        />

        <span
          onClick={() => setExpanded(e => !e)}
          style={{
            padding: '2px 8px', borderRadius: 999, cursor: 'pointer',
            background: ONB.BG, color: ONB.MUTED,
            fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}>
          {cat.dishes.length} {cat.dishes.length === 1 ? 'piatto' : 'piatti'}
        </span>

        <button
          className="dish-remove"
          onClick={onRemove}
          aria-label={`Elimina categoria ${cat.name}`}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0,
          }}
        >
          <OnbIcon.Trash size={14} color={ONB.MUTED}/>
        </button>
      </div>

      {/* Lista piatti — visibile solo on expand. Default chiuso -> schermata
          compatta, l'utente decide cosa esplodere. */}
      {expanded && <>
        {cat.dishes.map((d, i) => (
          <DishItem
            key={i}
            dish={d}
            onUpdate={(patch) => onUpdateDish(i, patch)}
            onRemove={() => onRemoveDish(i)}
          />
        ))}
        <button onClick={onAddDish} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          margin: '2px 0 10px 40px', padding: '4px 8px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: ONB.MUTED,
          borderRadius: 6,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = ONB.TEXT}
        onMouseLeave={(e) => e.currentTarget.style.color = ONB.MUTED}
        >
          <OnbIcon.Plus size={12} color="currentColor"/>
          Aggiungi piatto
        </button>
      </>}
    </div>
  );
}

function DishItem({dish, onUpdate, onRemove}) {
  // Il prezzo vive come stringa mentre lo si digita (stati intermedi come "12,"
  // non sono numeri validi) e viene normalizzato a numero sul blur.
  const [price, setPrice] = React.useState(dish.price.toFixed(2));

  const commitPrice = () => {
    const n = parseFloat(price.replace(',', '.'));
    const val = isNaN(n) || n < 0 ? 0 : n;
    onUpdate({price: val});
    setPrice(val.toFixed(2));
  };

  return (
    <div className="accordion-dish-item" style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 16px 5px 40px',
      transition: 'background 150ms ease-out',
    }}>
      <input
        className="inline-edit"
        value={dish.name}
        onChange={(e) => onUpdate({name: e.target.value})}
        placeholder="Nome del piatto"
        aria-label="Nome del piatto"
        style={{
          flex: 1, minWidth: 0,
          fontSize: 16, fontWeight: 400, color: ONB.TEXT, lineHeight: 1.4,
        }}
      />
      <span style={{fontSize: 15, color: ONB.MUTED, flexShrink: 0}}>€</span>
      <input
        className="inline-edit"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={commitPrice}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        inputMode="decimal"
        aria-label="Prezzo del piatto"
        style={{
          width: 68, textAlign: 'right', flexShrink: 0,
          fontSize: 16, fontWeight: 500, color: ONB.TEXT,
          fontVariantNumeric: 'tabular-nums',
        }}
      />
      <button
        className="dish-remove"
        onClick={onRemove}
        aria-label={`Elimina ${dish.name || 'piatto'}`}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0,
        }}
      >
        <OnbIcon.Trash size={14} color={ONB.MUTED}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PhoneMockup — frame iPhone-like + auto-scroll del menu (30px/s, pausa hover).
// La lista è duplicata 2x per loop seamless con translateY 0 → -50%.
// ─────────────────────────────────────────────────────────────────────────

function PhoneMockup({menu, height = 570}) {
  return (
    <div className="phone-mockup" style={{
      width: 280, height, background: '#1a1a1a',
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
          fontSize: 13, fontWeight: 600, color: ONB.TEXT,
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
              fontSize: 13, fontWeight: 500, color: ONB.MUTED, lineHeight: 1.2,
            }}>
              Tavolo 7
            </div>
            <div style={{
              fontSize: 16, fontWeight: 600, color: ONB.TEXT,
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
            <PhoneMenuList menu={menu}/>
            <PhoneMenuList menu={menu}/> {/* duplicata per loop seamless */}
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
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Apri ordine
            <span style={{opacity: 0.5}}>·</span>
            <span style={{fontWeight: 500, opacity: 0.8}}>
              {menu.reduce((n, c) => n + c.dishes.length, 0)} piatti
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PhoneMenuList({menu}) {
  return (
    <div>
      {menu.map(cat => (
        <div key={cat.id}>
          {/* Categoria header dentro la lista scrollante */}
          <div style={{
            padding: '14px 16px 6px',
            fontSize: 13, fontWeight: 600, color: ONB.MUTED,
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
                  fontSize: 14.5, fontWeight: 600, color: ONB.TEXT,
                  lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {d.name}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: ONB.TEXT,
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
        border: 'none', borderRadius: 999,
        fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
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

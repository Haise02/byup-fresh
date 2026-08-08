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

function Step4Verifica({ onBack, onComplete}) {
  // Il menù è stato, non più una costante: nomi, prezzi e categorie si
  // modificano qui. MENU_INIZIALE resta il seed dell'import AI.
  const [menu, setMenu] = React.useState(MENU_INIZIALE);

  // ─── Contratto ─────────────────────────────────────────────────────────
  // L'attivazione È la conclusione del contratto: al click su una delle due
  // uscite si apre il modale dedicato alla firma (ContrattoModal), e solo
  // l'accettazione lì dentro fa proseguire verso la destinazione scelta.
  const [contrattoModal, setContrattoModal] = React.useState(null); // null | 'panoramica' | 'config'
  const completa = (dest) => {
    if (!onComplete) return;
    // La prova dell'accettazione: versione e momento. In demo resta locale;
    // in produzione è un campo del backend accanto all'account.
    try {
      localStorage.setItem('byup_contratto_accettato', JSON.stringify({
        versione: CONTRATTO_VERSIONE, quando: new Date().toISOString(),
      }));
    } catch (e) {}
    onComplete(dest);
  };

  const totalDishes = menu.reduce((s, c) => s + c.dishes.length, 0);

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
      /* niente alignItems: l'inner si stira a tutta altezza (stretch), così
         il footer col marginTop auto arriva davvero al fondo del canvas */
      display: 'flex',
    }}>
      {/* flex column a tutta altezza: il footer CTA si aggancia al fondo del
          canvas via marginTop auto invece di galleggiare a mezz'aria. */}
      <div style={{
        width: '100%', maxWidth: 1240, margin: '0 auto',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Stessa griglia degli altri step; flex 1 così la riga occupa tutta
            l'altezza fino al footer e il telefono può centrarsi in verticale. */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 72, alignItems: 'start', flex: 1, minHeight: 0,
        }}>

          {/* ─── Colonna sinistra — chiusura + editor del menù ─────────── */}
          <div style={{position: 'relative', minWidth: 0}}>
            {/* Confetti — canvas absolutely positioned su top dell'area sinistra */}
            <ConfettiCanvas/>

            <h1 style={{
              fontSize: 40, fontWeight: 600, lineHeight: 1.15,
              letterSpacing: '-0.025em', margin: '0 0 16px', color: ONB.TEXT,
              position: 'relative', zIndex: 1,
            }}>
              Il tuo locale è online.
            </h1>
            <p style={{
              fontSize: 18, fontWeight: 400, lineHeight: 1.5,
              color: ONB.MUTED, margin: '0 0 22px', maxWidth: 520,
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
                fontSize: 14, lineHeight: 1.45, color: ONB.MUTED, marginTop: 10,
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

          {/* ─── Colonna destra — solo il telefono ──────────────────────── */}
          {/* La colonna si stira a tutta l'altezza della riga e centra il
              telefono in verticale: margini uguali sopra e sotto. */}
          <div style={{
            alignSelf: 'stretch', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <PhoneMockup menu={menu} height={640}/>
          </div>
        </div>

        {/* Footer CTAs — full width sotto le due colonne, sticky perché
            l'editor del menù può far crescere la colonna oltre il canvas.
            Le due uscite non attivano direttamente: aprono il modale del
            contratto, che è il vero punto di firma. */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', bottom: 0, zIndex: 6,
          marginTop: 'auto', paddingTop: 18, paddingBottom: 4,
          borderTop: '1px solid rgba(15, 17, 21, 0.08)',
          background: ONB.BG_SOFT,
        }}>
          <SecondaryCta onClick={onBack}>
            <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
            Indietro
          </SecondaryCta>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            {/* Gerarchia: l'azione consigliata è chiudere il setup ("Completa la
                configurazione") — rossa e a pillola. Entrare subito nel prodotto
                resta possibile ma anonimo, separato da un "oppure" discreto per
                chiarire che è un bivio, non una sequenza. */}
            <SecondaryCta onClick={() => setContrattoModal('panoramica')}>
              Inizia a gestire il locale
            </SecondaryCta>
            <span style={{
              fontSize: 14, fontWeight: 500, color: ONB.MUTED_LIGHT,
              letterSpacing: '0.04em',
            }}>
              oppure
            </span>
            <PrimaryCtaArrow onClick={() => setContrattoModal('config')}>
              Completa la configurazione
            </PrimaryCtaArrow>
          </div>
        </div>

        {contrattoModal && (
          <ContrattoModal
            onClose={() => setContrattoModal(null)}
            onAccept={() => { const dest = contrattoModal; setContrattoModal(null); completa(dest); }}/>
        )}
      </div>

      <style>{`
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
// MenuCategoryRow — accordion compatto, tutto chiuso default.
// Click sull'header espande l'intera lista piatti. Compattezza prima.
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
// AutoWidthInput — campo inline largo quanto il testo che contiene.
// Uno span gemello (stesso font, fuori flusso) misura il contenuto e detta la
// width: senza, l'input si prende tutta la riga e il box di modifica arriva
// fino al prezzo, ben oltre le lettere della voce.
// ─────────────────────────────────────────────────────────────────────────

// Ingombro orizzontale della classe .inline-edit da sommare alla larghezza
// misurata: padding 6px + bordo 1px per lato.
const PAD_INLINE_EDIT = 14;

function AutoWidthInput({value, onChange, placeholder, font, maxWidth, ...rest}) {
  const ghost = React.useRef(null);
  const [w, setW] = React.useState(0);

  const misura = React.useCallback(() => {
    if (ghost.current) setW(ghost.current.offsetWidth);
  }, []);

  React.useLayoutEffect(misura, [value, placeholder, font, misura]);

  // I webfont arrivano dopo il primo layout: senza una seconda misura a font
  // pronti, la width resta quella calcolata col fallback e il testo viene tagliato.
  React.useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(misura);
  }, [misura]);

  return (
    /* flexShrink:0 — lo span e' un flex item accanto allo spaziatore elastico:
       senza, il flex lo comprimeva sotto la width calcolata e il nome veniva
       tagliato comunque, indipendentemente dalla misura. */
    <span style={{display: 'inline-flex', position: 'relative', flexShrink: 0}}>
      <span ref={ghost} aria-hidden="true" style={{
        ...font,
        // width:max-content è il punto chiave: in posizione assoluta la larghezza
        // sarebbe shrink-to-fit sullo spazio disponibile — che dipende a sua volta
        // dall'input — e collassava, tagliando il nome a metà.
        position: 'absolute', visibility: 'hidden', whiteSpace: 'pre',
        width: 'max-content', maxWidth: 'none',
        pointerEvents: 'none', left: 0, top: 0,
      }}>
        {value || placeholder || ''}
      </span>
      <input
        {...rest}
        className="inline-edit"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        /* +PAD_INLINE_EDIT: box-sizing è border-box su tutta la pagina, quindi la
           width deve includere il padding della .inline-edit, altrimenti mangia
           spazio al testo e il nome viene tagliato. */
        style={{...font, width: Math.min(w + PAD_INLINE_EDIT + 4, maxWidth || 9999)}}
      />
    </span>
  );
}

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

        <AutoWidthInput
          value={cat.name}
          onChange={onRename}
          placeholder="Nome categoria"
          aria-label="Nome categoria"
          maxWidth={340}
          font={{
            fontSize: 16, fontWeight: 700, color: ONB.TEXT,
            letterSpacing: '-0.01em', fontFamily: 'inherit',
          }}
        />

        {/* Lo spazio fra il nome e il conteggio e' la zona di click piu' ampia
            della riga: cliccandolo si apre/chiude la categoria. */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{flex: 1, alignSelf: 'stretch', cursor: 'pointer', minWidth: 12}}
          aria-hidden="true"
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
      <AutoWidthInput
        value={dish.name}
        onChange={(name) => onUpdate({name})}
        placeholder="Nome del piatto"
        aria-label="Nome del piatto"
        maxWidth={420}
        font={{
          fontSize: 16, fontWeight: 400, color: ONB.TEXT,
          lineHeight: 1.4, fontFamily: 'inherit',
        }}
      />
      <div style={{flex: 1, minWidth: 12}}/>
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

// Proporzioni reali di un iPhone moderno (9:19.5). La larghezza si ricava
// dall'altezza invece di essere fissa: prima erano 272x430, cioè un rapporto
// 0.63 contro lo 0.46 reale — da qui la sagoma schiacciata.
const PHONE_RATIO = 9 / 19.5;

// Design token dell'app consumer (tema chiaro): il mockup replica 1:1 la
// schermata menu di app/menu.jsx. Il contenuto è renderizzato a 390px (la
// larghezza di progetto dell'app) e scalato per stare nello schermo.
const APP_M = {
  BG: '#FBF4F1', SURF: '#fff', WINE: '#8B1A3A', TEXT: '#1c0f15',
  MUTED: '#6d5a61', TINT: '#f6f1ea', PINK: '#E32459', BORDER: '#eddfda',
  FONT: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
};
const APP_CAT_TINTS = {
  'Antipasti': '#fae3de', 'Primi piatti': '#FCE9EE', 'Secondi piatti': '#FEF0E3',
  'Dolci': '#F9E3EE', 'Bevande': '#f4e5ef',
};
// Foto reali dei piatti: gli stessi asset premium dell'app consumer.
const APP_IMG_BASE = '../app/assets/premium/';
const APP_IMGS = {
  'Bruschetta al pomodoro':    'dish-bruschette.webp',
  'Tagliere misto':            'dish-tagliere.webp',
  'Burrata pugliese':          'dish-insalata.webp',
  'Cacio e Pepe':              'dish-risotto.webp',
  'Carbonara':                 'dish-carbonara.webp',
  'Amatriciana':               'dish-lasagna.webp',
  'Gricia':                    'dish-carbonara.webp',
  'Ravioli ricotta e spinaci': 'dish-verdure.webp',
  'Saltimbocca alla romana':   'dish-tagliata.webp',
  'Coda alla vaccinara':       'dish-pollo.webp',
  'Trippa alla romana':        'dish-polpo.webp',
  'Tiramisù':                  'dessert-tiramisu.webp',
  'Panna cotta':               'dessert-tortino.webp',
  'Acqua naturale 75cl':       'drink-soda.webp',
  'Vino della casa (1/2 lt)':  'drink-vino.webp',
};
const APP_DESCS = {
  'Bruschetta al pomodoro':    "Pane tostato, pomodorini freschi, basilico e olio evo.",
  'Tagliere misto':            "Affettati, formaggi, sott'oli e focaccia calda.",
  'Burrata pugliese':          "Burrata cremosa con pomodorini confit e basilico.",
  'Cacio e Pepe':              "Tonnarelli, pecorino romano DOP e pepe nero tostato.",
  'Carbonara':                 "Guanciale croccante, uova, pecorino e pepe nero.",
  'Amatriciana':               "Bucatini, guanciale, pomodoro e pecorino romano.",
  'Gricia':                    "La carbonara bianca: guanciale e pecorino romano.",
  'Ravioli ricotta e spinaci': "Fatti in casa, burro, salvia e parmigiano.",
  'Saltimbocca alla romana':   "Vitello, prosciutto crudo e salvia, sfumati al vino.",
  'Coda alla vaccinara':       "Stufata lentamente con sedano, cacao e pinoli.",
  'Trippa alla romana':        "Con sugo di pomodoro, mentuccia e pecorino.",
  'Tiramisù':                  "Savoiardi, mascarpone e caffè, come tradizione.",
  'Panna cotta':               "Con coulis di frutti di bosco di stagione.",
  'Acqua naturale 75cl':       "Naturale o frizzante, in vetro.",
  'Vino della casa (1/2 lt)':  "Rosso o bianco della cantina del locale.",
};

function PhoneMockup({menu, height = 570}) {
  const width = Math.round(height * PHONE_RATIO);
  // Larghezza utile dello schermo (scocca 3+3 + cornice 6+6) → fattore di
  // scala rispetto ai 390px a cui è disegnata l'app.
  const screenW = width - 18;
  const k = screenW / 390;

  // Le tab seguono lo scroll, come nell'app: leggo la posizione corrente
  // dell'animazione CSS (translateY del contenuto), ricavo la sezione in
  // vista e faccio scorrere la riga delle categorie sull'attiva.
  const scrollRef = React.useRef(null);  // .phone-scroll-content (animato)
  const listRef = React.useRef(null);    // prima copia della lista
  const tabsRef = React.useRef(null);    // riga tab traslabile
  const [activeCat, setActiveCat] = React.useState(0);
  const [tabTx, setTabTx] = React.useState(0);

  React.useEffect(() => {
    const iv = setInterval(() => {
      const sc = scrollRef.current, list = listRef.current, tabs = tabsRef.current;
      if (!sc || !list || !tabs) return;
      const tr = getComputedStyle(sc).transform;
      let ty = 0;
      if (tr && tr !== 'none') {
        const m = tr.match(/matrix\(([^)]+)\)/);
        if (m) ty = parseFloat(m[1].split(',')[5]) || 0;
      }
      const H = list.offsetHeight || 1;
      const off = ((-ty) % H + H) % H;
      const listTop = list.offsetTop;
      let idx = 0;
      list.querySelectorAll('[data-sec]').forEach((s, i) => {
        if (s.offsetTop - listTop <= off + 160) idx = i;
      });
      setActiveCat(idx);
      const t = tabs.children[idx];
      if (t) {
        const maxTx = Math.max(0, tabs.scrollWidth - 390);
        setTabTx(Math.min(Math.max(0, t.offsetLeft - 16), maxTx));
      }
    }, 250);
    return () => clearInterval(iv);
  }, [menu]);
  return (
    /* Scocca: bordo scuro spesso + anello chiaro esterno (il riflesso del
       telaio) + tasti laterali. Prima era un rettangolo nero con gli angoli
       tondi, e infatti non leggeva come un telefono. */
    <div className="phone-mockup" style={{
      width, height, borderRadius: Math.round(width * 0.155),
      background: 'linear-gradient(150deg, #43464D 0%, #1B1D22 42%, #303338 100%)',
      padding: 3,
      boxShadow: [
        '0 22px 50px -18px rgba(15, 17, 21, 0.42)',
        '0 4px 12px -4px rgba(15, 17, 21, 0.20)',
        'inset 0 0 0 1px rgba(255,255,255,0.16)',
      ].join(', '),
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Tasti laterali */}
      <span aria-hidden="true" style={{
        position: 'absolute', left: -2, top: 96, width: 3, height: 26,
        borderRadius: 3, background: '#2A2D33',
      }}/>
      <span aria-hidden="true" style={{
        position: 'absolute', left: -2, top: 132, width: 3, height: 44,
        borderRadius: 3, background: '#2A2D33',
      }}/>
      <span aria-hidden="true" style={{
        position: 'absolute', right: -2, top: 118, width: 3, height: 60,
        borderRadius: 3, background: '#2A2D33',
      }}/>

      {/* Cornice nera fra scocca e schermo */}
      <div style={{
        width: '100%', height: '100%',
        background: '#0B0C0E',
        borderRadius: Math.round(width * 0.145), padding: 6,
      }}>
      <div style={{
        width: '100%', height: '100%',
        background: APP_M.BG,
        borderRadius: Math.round(width * 0.125), overflow: 'hidden',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Dynamic Island — pillola staccata dal bordo, non un notch attaccato */}
        <div style={{
          position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)',
          width: 74, height: 20, borderRadius: 999,
          background: '#0B0C0E',
          zIndex: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 7,
        }}>
          {/* fotocamera */}
          <span style={{
            width: 8, height: 8, borderRadius: 999,
            background: 'radial-gradient(circle at 32% 30%, #3A4150 0%, #0E1013 70%)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.20)',
          }}/>
        </div>

        {/* Home indicator */}
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 92, height: 4, borderRadius: 999,
          background: 'rgba(15, 17, 21, 0.30)',
          zIndex: 5,
        }}/>

        {/* Status bar */}
        <div style={{
          padding: '11px 20px 6px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, fontWeight: 600, color: ONB.TEXT,
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

        {/* Tabs categorie — pinned top, come nell'app (il menu parte da qui) */}
        <div style={{
          flexShrink: 0, position: 'relative', zIndex: 2, background: APP_M.BG,
          height: Math.round(56 * k), overflow: 'hidden',
        }}>
          <div style={{width: 390, transform: `scale(${k})`, transformOrigin: 'top left', fontFamily: APP_M.FONT}}>
            <div style={{overflow: 'hidden'}}>
              <div ref={tabsRef} style={{
                display: 'flex', gap: 4, padding: '12px 16px 0', width: 'max-content',
                transform: `translateX(${-tabTx}px)`,
                transition: 'transform 650ms cubic-bezier(.22,.9,.32,1)',
              }}>
                {menu.map((c, i) => {
                  const active = i === activeCat;
                  return (
                    <div key={c.id} style={{
                      padding: '10px 16px 12px', flex: '0 0 auto',
                      borderBottom: `2.5px solid ${active ? APP_M.WINE : 'transparent'}`,
                      fontSize: 16, fontWeight: active ? 700 : 500,
                      color: active ? APP_M.WINE : APP_M.MUTED,
                      letterSpacing: -0.1, whiteSpace: 'nowrap',
                      transition: 'color 250ms ease, border-bottom-color 250ms ease',
                    }}>{c.name || 'Categoria'}</div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling menu area — contenuto app a 390px, scalato */}
        <div className="phone-scroll-area" style={{
          flex: 1, overflow: 'hidden', position: 'relative', background: APP_M.BG,
        }}>
          <div style={{width: 390, transform: `scale(${k})`, transformOrigin: 'top left', fontFamily: APP_M.FONT}}>
            <div ref={scrollRef} className="phone-scroll-content" style={{
              animation: 'phone-scroll 48s linear infinite',
              willChange: 'transform',
            }}>
              <PhoneMenuList menu={menu} innerRef={listRef}/>
              <PhoneMenuList menu={menu}/> {/* duplicata per loop seamless */}
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}

// Replica 1:1 della lista menu dell'app (app/menu.jsx): banda-capitolo per
// categoria (numero fantasma, "Sezione n/N" coi dots, titolo Fredoka) e card
// piatto identiche — foto a sinistra (qui swatch colore), nome, descrizione,
// prezzo e bottone + wine. Statico: niente interazioni, è una vetrina.
function PhoneMenuList({menu, innerRef}) {
  const total = menu.length;
  return (
    <div ref={innerRef}>
      {menu.map((cat, ci) => (
        <div key={cat.id} data-sec={ci} style={{padding: '0 18px', marginBottom: 8}}>
          <div style={{
            margin: ci === 0 ? '10px -18px 18px' : '32px -18px 18px',
            padding: '24px 18px 20px', position: 'relative', overflow: 'hidden',
            background: `linear-gradient(115deg, ${APP_CAT_TINTS[cat.name] || '#fae3de'} 0%, rgba(255,255,255,0) 82%)`,
          }}>
            <div aria-hidden style={{
              position: 'absolute', left: 8, top: -20, fontFamily: "'Fredoka', sans-serif",
              fontSize: 104, fontWeight: 600, lineHeight: 1, color: APP_M.PINK,
              letterSpacing: -5, opacity: 0.09, pointerEvents: 'none',
            }}>{String(ci + 1).padStart(2, '0')}</div>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7}}>
              <span style={{fontSize: 10.5, fontWeight: 800, color: APP_M.PINK, letterSpacing: 1.2, textTransform: 'uppercase'}}>
                Sezione {ci + 1}<span style={{color: APP_M.MUTED, fontWeight: 700}}>/{total}</span>
              </span>
              <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
                {menu.map((_, i) => (
                  <div key={i} style={{
                    width: i === ci ? 16 : 5, height: 5, borderRadius: 999,
                    background: i === ci ? APP_M.PINK : (i < ci ? '#e79fb4' : '#e6d2d9'),
                  }}/>
                ))}
              </div>
            </div>
            <div style={{
              position: 'relative', fontFamily: "'Fredoka', sans-serif",
              fontSize: 27, fontWeight: 600, color: APP_M.TEXT, lineHeight: 1.05,
            }}>
              {cat.name || 'Nuova categoria'}
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28}}>
            {cat.dishes.map((d, di) => (
              <div key={di} style={{
                background: APP_M.SURF, borderRadius: 18, padding: 14, height: 166, overflow: 'hidden',
                display: 'flex', gap: 14,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1.5px solid transparent',
              }}>
                <div style={{
                  width: 130, height: '100%', borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                  background: `linear-gradient(150deg, ${d.color} 0%, ${d.color} 58%, rgba(0,0,0,0.10) 145%)`,
                }}>
                  {APP_IMGS[d.name] && (
                    <img src={APP_IMG_BASE + APP_IMGS[d.name]} alt=""
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                  )}
                </div>
                <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
                  <div style={{
                    fontSize: 16, fontWeight: 700, color: APP_M.TEXT, lineHeight: 1.25,
                    letterSpacing: -0.2, marginBottom: 5,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{d.name || 'Nuovo piatto'}</div>
                  <div style={{
                    fontSize: 13, color: APP_M.MUTED, lineHeight: 1.45, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', marginBottom: 10,
                  }}>
                    {APP_DESCS[d.name] || 'Preparato ogni giorno con ingredienti freschi.'}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
                    <div style={{fontSize: 16, fontWeight: 800, color: APP_M.TEXT, flexShrink: 0}}>
                      {+(d.price || 0)}€
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                      background: APP_M.WINE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(90,26,46,0.25)',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

// ─── Contratto di servizio Byup Fresh ───────────────────────────────────────
// BOZZA v1.0 — struttura e clausole pensate per il B2B di Fresh; il testo va
// validato da un legale prima del lancio. CLAUSOLE_VESSATORIE elenca i numeri
// delle clausole che richiedono la seconda approvazione ex artt. 1341-1342
// c.c.: se una clausola cambia numero, va aggiornato anche qui.
const CONTRATTO_VERSIONE = '1.1';
const CONTRATTO_TESTO = [
  { n: 1, h: 'Oggetto del servizio', p: 'Byup S.r.l. concede in licenza d\'uso, in modalità cloud (SaaS), il gestionale Byup Fresh: cassa, ordinazione al tavolo, menù digitali, vetrina, statistiche e trasmissione dei corrispettivi. Il servizio è riservato a operatori professionali del settore Food & Beverage.' },
  { n: 2, h: 'Attivazione e account', p: 'L\'account è riferito al locale e gestito dal titolare o da un suo delegato. Le credenziali sono personali; il titolare risponde dell\'uso fatto dagli utenti che autorizza (staff, dispositivi).' },
  { n: 3, h: 'Corrispettivi e fatturazione', p: 'Il servizio è offerto in abbonamento con soglie di ordini incluse e costo per ordine extra secondo il piano scelto. I corrispettivi sono fatturati elettronicamente e i pagamenti gestiti tramite il fornitore Stripe.' },
  { n: 4, h: 'Sospensione del servizio', p: 'Byup può sospendere il servizio in caso di mancato pagamento, uso illecito o rischio per la sicurezza della piattaforma, dandone comunicazione. La sospensione non estingue i corrispettivi maturati.' },
  { n: 5, h: 'Modifica delle condizioni', p: 'Byup può modificare i presenti Termini e i listini con preavviso di almeno 30 giorni tramite il gestionale o email. In caso di disaccordo il ristoratore può recedere prima dell\'efficacia delle modifiche, senza penali.' },
  { n: 6, h: 'Limitazione di responsabilità', p: 'Nei limiti consentiti dalla legge, Byup non risponde dei danni indiretti o del lucro cessante derivanti da interruzioni del servizio, e la responsabilità complessiva è limitata ai corrispettivi versati nei 12 mesi precedenti l\'evento. Restano ferme le responsabilità inderogabili di legge.' },
  { n: 7, h: 'Manleva', p: 'Il ristoratore manleva Byup da pretese di terzi derivanti da dati inseriti nel gestionale (menù, prezzi, allergeni), da violazioni di legge nella conduzione dell\'attività o dall\'uso non autorizzato dell\'account a lui riferibile.' },
  { n: 8, h: 'Recesso e chiusura dell\'account', p: 'Il ristoratore può recedere in ogni momento con effetto dalla fine del periodo di fatturazione in corso. Byup può recedere con preavviso di 30 giorni, o chiudere l\'account senza preavviso nei casi gravi di cui alla clausola 4. I dati sono esportabili prima della chiusura.' },
  { n: 9, h: 'Durata e rinnovo automatico', p: 'L\'abbonamento si rinnova tacitamente alla scadenza di ciascun periodo di fatturazione, salvo disdetta comunicata prima del rinnovo. Il piano Gratuito non ha scadenza e non si converte mai da solo in un piano a pagamento.' },
  { n: 10, h: 'Obblighi del ristoratore', p: 'Il ristoratore garantisce la correttezza dei dati inseriti (menù, prezzi, allergeni, dati fiscali) e il rispetto delle norme applicabili alla propria attività, incluse quelle igienico-sanitarie e di informazione al consumatore.' },
  { n: 11, h: 'Trattamento dei dati personali', p: 'Byup tratta i dati secondo l\'informativa privacy disponibile nel gestionale. Per i dati dei clienti finali trattati per conto del locale, Byup opera quale responsabile del trattamento ai sensi dell\'art. 28 GDPR.' },
  { n: 12, h: 'Divieto di cessione', p: 'Il ristoratore non può cedere il contratto né i diritti che ne derivano senza il consenso scritto di Byup. Byup può cedere il contratto nell\'ambito di operazioni societarie, dandone comunicazione.' },
  { n: 13, h: 'Clausola risolutiva espressa', p: 'Il contratto si risolve di diritto, previa comunicazione, in caso di violazione delle clausole 2 (uso dell\'account), 3 (pagamenti) e 10 (obblighi del ristoratore), ferma la debenza dei corrispettivi maturati.' },
  { n: 14, h: 'Decadenze e reclami', p: 'Eventuali contestazioni su fatture o malfunzionamenti vanno comunicate entro 30 giorni da quando il ristoratore ne ha avuto conoscenza; decorso il termine, la prestazione si intende accettata.' },
  { n: 15, h: 'Esclusione di garanzie', p: 'Il servizio è fornito "così com\'è": nei limiti di legge Byup non garantisce l\'assenza di errori o l\'idoneità a scopi specifici, fermo l\'impegno a correggere i difetti segnalati e i livelli di servizio pubblicati.' },
  { n: 16, h: 'Modifica o dismissione di funzionalità', p: 'Byup può evolvere, sostituire o dismettere singole funzionalità del gestionale, dandone preavviso ragionevole quando la modifica riduce in modo apprezzabile le capacità del piano sottoscritto.' },
  { n: 17, h: 'Pagamenti e facoltà di opporre eccezioni', p: 'Il ristoratore non può sospendere o ritardare i pagamenti dovuti eccependo contestazioni sul servizio; le eccezioni si fanno valere nelle forme della clausola 14, salvo quanto inderogabilmente previsto dalla legge.' },
  { n: 18, h: 'Mediazione preventiva', p: 'Prima di adire il giudice, le parti si impegnano a esperire un tentativo di mediazione presso un organismo accreditato nel luogo del foro competente. Il tentativo non pregiudica i provvedimenti urgenti.' },
  { n: 19, h: 'Legge applicabile e foro esclusivo', p: 'I presenti Termini sono regolati dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di Roma.' },
];
const CLAUSOLE_VESSATORIE = [4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19];

// ─── ContrattoModal — il punto di firma, da solo sulla scena ────────────────
// Si apre da entrambe le uscite dello step 4: la schermata resta celebrativa
// e la firma ha un momento tutto suo. Foglio bianco, testo integrale
// scorrevole, copia scaricabile, e le due firme distinte che chiede la legge:
// accettazione integrale + approvazione specifica delle vessatorie ex artt.
// 1341-1342 c.c. (valida solo se le clausole sono elencate, non citate in
// blocco). La CTA di accettazione si accende solo con entrambe le spunte.
function ContrattoModal({ onClose, onAccept }) {
  const [accTerms, setAccTerms] = React.useState(false);
  const [accVessatorie, setAccVessatorie] = React.useState(false);
  const ok = accTerms && accVessatorie;

  // Copia su supporto durevole: il testo versionato scaricato com'è, non un
  // link a una pagina che domani può cambiare.
  const scarica = () => {
    const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Termini e Condizioni Byup Fresh · v${CONTRATTO_VERSIONE}</title></head><body style="font-family:Georgia,serif;max-width:720px;margin:40px auto;line-height:1.6"><h1>Termini e Condizioni di Byup Fresh</h1><p><i>Versione ${CONTRATTO_VERSIONE} · scaricata il ${new Date().toLocaleDateString('it-IT')}</i></p>${CONTRATTO_TESTO.map(c => `<h3>${c.n}. ${c.h}</h3><p>${c.p}</p>`).join('')}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], {type: 'text/html'}));
    const a = document.createElement('a');
    a.href = url; a.download = `Byup-Fresh-Termini-v${CONTRATTO_VERSIONE}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15, 17, 21, 0.45)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'contratto-fade 180ms ease both',
    }}>
      <style>{`
        @keyframes contratto-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes contratto-pop { 0% { opacity: 0; transform: scale(0.94) translateY(12px); } 100% { opacity: 1; transform: none; } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: 600, maxWidth: '100%', maxHeight: '92vh',
        background: '#fff', borderRadius: 22,
        boxShadow: '0 32px 80px -24px rgba(15, 17, 21, 0.40), 0 0 0 1px rgba(15, 17, 21, 0.05)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'contratto-pop 300ms cubic-bezier(.2,.8,.25,1) both',
      }}>
        {/* Testata */}
        <div style={{padding: '24px 28px 16px', borderBottom: '1px solid rgba(15, 17, 21, 0.07)', position: 'relative'}}>
          <div style={{fontSize: 22, fontWeight: 700, color: ONB.TEXT, letterSpacing: '-0.02em', paddingRight: 44}}>
            Un'ultima firma
          </div>
          <div style={{fontSize: 15, color: ONB.MUTED, marginTop: 3, lineHeight: 1.45, paddingRight: 44}}>
            Per attivare Byup Fresh serve la tua accettazione del contratto di servizio.
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={{
            position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: '50%',
            background: '#fff', border: '1px solid rgba(15, 17, 21, 0.12)', color: ONB.TEXT,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        {/* Corpo: il testo integrale, protagonista e scorrevole */}
        <div style={{padding: '18px 28px 0', display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8}}>
            <div style={{fontSize: 13, fontWeight: 700, color: ONB.MUTED, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
              Termini e Condizioni · v{CONTRATTO_VERSIONE}
            </div>
            <button onClick={scarica} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: 0, background: 'transparent', border: 'none',
              fontSize: 13.5, fontWeight: 600, color: ONB.MUTED,
              cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
              textUnderlineOffset: 2, whiteSpace: 'nowrap',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></svg>
              Scarica copia
            </button>
          </div>
          <div className="pn-scroll" style={{
            flex: 1, minHeight: 120, maxHeight: 300, overflowY: 'auto',
            padding: '14px 16px', borderRadius: 12,
            background: ONB.BG_SOFT, border: '1px solid rgba(15, 17, 21, 0.06)',
            fontSize: 13.5, lineHeight: 1.6, color: ONB.MUTED,
          }}>
            {CONTRATTO_TESTO.map(c => (
              <div key={c.n} style={{marginBottom: 12}}>
                <div style={{fontWeight: 700, color: ONB.TEXT, marginBottom: 2}}>{c.n}. {c.h}</div>
                <div>{c.p}</div>
              </div>
            ))}
          </div>

          <label style={{display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, cursor: 'pointer'}}>
            <input type="checkbox" checked={accTerms} onChange={e => setAccTerms(e.target.checked)}
              style={{accentColor: ONB.BRAND, width: 16, height: 16, marginTop: 2, flexShrink: 0}}/>
            <span style={{fontSize: 14, color: ONB.TEXT, lineHeight: 1.5}}>
              Ho letto e accetto integralmente i <b>Termini e Condizioni di Byup Fresh</b> e ho preso visione dell'informativa privacy.
            </span>
          </label>

          {/* La seconda firma: valida solo se le clausole sono ELENCATE. */}
          <label style={{display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 8, cursor: 'pointer'}}>
            <input type="checkbox" checked={accVessatorie} onChange={e => setAccVessatorie(e.target.checked)}
              style={{accentColor: ONB.BRAND, width: 16, height: 16, marginTop: 2, flexShrink: 0}}/>
            <span style={{fontSize: 14, color: ONB.TEXT, lineHeight: 1.5}}>
              Ai sensi degli <b>artt. 1341 e 1342 c.c.</b> approvo specificamente le clausole:{' '}
              {CLAUSOLE_VESSATORIE.map((n, i) => {
                const c = CONTRATTO_TESTO.find(x => x.n === n);
                return <span key={n}><b>{n}</b> ({c.h}){i < CLAUSOLE_VESSATORIE.length - 1 ? ', ' : '.'}</span>;
              })}
            </span>
          </label>
        </div>

        {/* Piede: annulla + la firma vera e propria */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 12,
          padding: '18px 28px 22px',
        }}>
          <button onClick={onClose} style={{
            padding: '12px 20px', borderRadius: 999,
            background: '#fff', color: ONB.TEXT,
            border: '1px solid rgba(15, 17, 21, 0.14)',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Annulla</button>
          <button onClick={() => { if (ok) onAccept(); }} disabled={!ok} style={{
            padding: '12px 26px', borderRadius: 999,
            background: ok ? ONB.BRAND : 'rgba(15, 17, 21, 0.08)',
            color: ok ? '#fff' : 'rgba(15, 17, 21, 0.35)',
            border: 'none', fontSize: 15, fontWeight: 700,
            cursor: ok ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            boxShadow: ok ? '0 8px 20px -8px rgba(255, 90, 95, 0.55)' : 'none',
            transition: 'background 160ms ease, color 160ms ease, box-shadow 160ms ease',
          }}>Accetta e attiva Byup Fresh</button>
        </div>
      </div>
    </div>
  );
}

// Shared building blocks for Impostazioni pages

// Il chip della checklist porta alla sezione che lo risolve: portarci non
// basta, perche chi arriva in fondo a uno scorrimento non sa dove si e
// fermato l'occhio. La sezione si accende per un attimo — un anello corallo
// che si spegne da solo — cosi il chip e il punto d'arrivo sono la stessa cosa.
function impAccendiSezione(anchor) {
  const el = document.querySelector(`[data-cfg-anchor="${anchor}"]`);
  if (!el) return null;
  el.classList.remove('imp-atterraggio');
  void el.offsetWidth;   // riavvia l'animazione se si riclicca lo stesso chip
  el.classList.add('imp-atterraggio');
  setTimeout(() => el.classList.remove('imp-atterraggio'), 2000);
  return el;
}

function ImpAtterraggioStyle() {
  return (
    <style>{`
      .imp-atterraggio { animation: impAtterraggio 1.9s cubic-bezier(.2,.8,.2,1); }
      @keyframes impAtterraggio {
        0%   { box-shadow: 0 0 0 0 rgba(255, 90, 95, 0); }
        12%  { box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.30), 0 10px 28px -12px rgba(255, 90, 95, 0.55); }
        70%  { box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.18), 0 10px 28px -12px rgba(255, 90, 95, 0.30); }
        100% { box-shadow: 0 0 0 0 rgba(255, 90, 95, 0); }
      }
    `}</style>
  );
}

function ImpTabs({ active, onChange }) {
  const tabs = [
    { id: 'vetrina', label: 'Vetrina', icon: 'place-restaurant' },
    { id: 'menu-cucina', label: 'Menù', icon: 'food-meal' },
    { id: 'sala', label: 'Sala e tavoli', icon: 'place-table' },
    { id: 'personale', label: 'Personale', icon: 'people-staff-group' },
    { id: 'flussi', label: 'Operazioni', icon: 'chart-workflow' },
    { id: 'fiscali', label: 'Dati fiscali', icon: 'commerce-receipt' },
    { id: 'integrazioni', label: 'POS e integrazioni', icon: 'commerce-bank-cards' },
  ];

  return (
    <div style={{
      display:'flex', gap: 8, padding: '14px 32px',
      borderBottom: `1px solid ${PN.BORDER_SOFT}`,
      background: PN.WHITE,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            display:'inline-flex', alignItems:'center', gap: 7,
            padding: '8px 16px',
            borderRadius: 999,
            border: `1px solid ${isActive ? PN.PINK : PN.BORDER}`,
            background: isActive ? PN.PINK_SOFT : PN.WHITE,
            color: isActive ? PN.PINK_DARK : PN.TEXT,
            fontSize: 15.5, fontWeight: 600,
            cursor:'pointer', fontFamily:'inherit',
          }}>
            <Icon name={t.icon} size={14}/>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ImpSubTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display:'flex', gap: 22,
      borderBottom: `1px solid ${PN.BORDER}`,
      marginBottom: 22,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: '12px 2px',
            background:'transparent', border:'none',
            borderBottom: `2px solid ${isActive ? PN.TEXT : 'transparent'}`,
            marginBottom: -1,
            color: isActive ? PN.TEXT : PN.MUTED,
            fontSize: 15.5, fontWeight: isActive ? 700 : 500,
            cursor:'pointer', fontFamily:'inherit',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

// `style`: override del contenitore — la coppia Dati anagrafici / Sede
// operativa lo usa per pareggiare le altezze dentro la griglia.
function ImpCard({ title, sub, children, action, aurora, anchor, style }) {
  // L2 Aurora soft wash multi-color — pink + lavender + cream mesh su base
  // sfumata pink→lavender. Stesso DNA della variant L2 nella preview themes.
  // Sistema 75/15/10.
  const auroraBg =
    'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
    'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
    'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
    'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)';
  return (
    <section data-cfg-anchor={anchor} style={{
      background: aurora ? auroraBg : PN.WHITE,
      border: `1px solid ${aurora ? 'rgba(190, 175, 220, 0.14)' : PN.BORDER_SOFT}`,
      borderRadius: 14,
      marginBottom: 16,
      ...style,
    }}>
      {(title || action) && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap: 16,
          padding: '18px 22px',
          borderBottom: `1px solid ${aurora ? 'rgba(190, 175, 220, 0.12)' : PN.BORDER_SOFT}`,
        }}>
          <div style={{flex:1, minWidth: 0}}>
            {title && <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.2}}>{title}</div>}
            {sub && <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.4}}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={{padding: '20px 22px'}}>
        {children}
      </div>
    </section>
  );
}

// `style`: serve a chi deve far crescere il campo fino a un'altezza data —
// la descrizione della vetrina si allunga fino al fondo della colonna accanto.
function ImpField({ label, hint, children, style }) {
  return (
    <div style={{marginBottom: 16, ...style}}>
      <label style={{
        display:'block', fontSize: 14, fontWeight: 600, color: PN.TEXT,
        marginBottom: 6,
      }}>{label}</label>
      {children}
      {hint && <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6}}>{hint}</div>}
    </div>
  );
}

// `icona`: segno a sinistra dentro il campo. Serve a dire di che cosa si parla
// senza una riga di testo sotto — su un URL o un indirizzo l'icona fa il lavoro
// che faceva la didascalia, occupando zero righe.
function ImpInput({ icona, ...props }) {
  const base = {
    width: '100%',
    padding: icona ? '10px 12px 10px 37px' : '10px 12px',
    border: `1px solid ${PN.BORDER}`,
    borderRadius: 9,
    fontSize: 15.5,
    background: PN.WHITE,
    outline: 'none',
    ...props.style,
  };
  if (!icona) return <input {...props} style={base}/>;
  return (
    <div style={{position: 'relative'}}>
      {/* pointerEvents none: il clic sull'icona deve dare il fuoco al campo,
          non fermarsi sull'icona. */}
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', color: PN.MUTED, pointerEvents: 'none',
      }}>{icona}</span>
      <input {...props} style={base}/>
    </div>
  );
}

function ImpTextarea(props) {
  return (
    <textarea {...props} style={{
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 9,
      fontSize: 15.5,
      background: PN.WHITE,
      outline: 'none',
      resize: 'vertical',
      minHeight: 80,
      ...props.style,
    }}/>
  );
}

function ImpToggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange?.(!checked)} style={{
      width: 38, height: 22, borderRadius: 999,
      border: 'none',
      background: checked ? PN.GREEN : PN.BORDER,
      position:'relative', cursor:'pointer',
      transition: 'background .15s',
    }}>
      <span style={{
        position:'absolute', top: 2, left: checked ? 18 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: PN.WHITE,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left .15s',
      }}/>
    </button>
  );
}

// ImpButton — Apple-style: tutte le varianti hanno gradient sottile + inset highlight.
// Mai background piatto. Mai bianco-su-bianco: la ghost variant usa il gradient
// neutro (#FFF → #F5F5F7) invece del piatto #FFF.
function ImpButton({ variant = 'primary', icon, children, onClick, style = {}, disabled = false }) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    primary: {
      bg:     hover ? PN.BTN_DARK_HOVER : PN.BTN_DARK,
      color:  '#fff',
      border: '1px solid rgba(0, 0, 0, 0.32)',
      shadow: PN.INSET_HIGHLIGHT_DARK,
    },
    pink: {
      bg:     hover ? PN.BTN_BRAND_HOVER : PN.BTN_BRAND,
      color:  '#fff',
      border: '1px solid rgba(180, 30, 35, 0.40)',
      shadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)`,
    },
    ghost: {
      bg:     hover ? PN.BTN_NEUTRAL_HOVER : PN.BTN_NEUTRAL,
      color:  PN.TEXT,
      border: `1px solid ${PN.BORDER_LIGHT}`,
      shadow: PN.INSET_HIGHLIGHT,
    },
    // Azioni distruttive (scollega, elimina): devono leggersi come tali,
    // non cadere sul primary scuro.
    danger: {
      bg:     hover ? PN.BTN_DANGER_HOVER : PN.BTN_DANGER,
      color:  '#fff',
      border: '1px solid rgba(150, 25, 25, 0.42)',
      shadow: PN.INSET_HIGHLIGHT_BRAND,
    },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => { if (!disabled) setHover(true); }}
      onMouseLeave={() => setHover(false)}
      style={{
        display:'inline-flex', alignItems:'center', gap: 7,
        padding: '9px 16px',
        borderRadius: 9,
        fontSize: 15, fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
        background: v.bg, color: v.color, border: v.border,
        boxShadow: v.shadow,
        opacity: disabled ? 0.45 : 1,
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out, opacity 150ms ease-out',
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}

function MenuItem({ icon, children, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: 9, width:'100%',
      padding:'8px 10px', background:'transparent', border:'none',
      borderRadius: 7, fontSize: 15, fontFamily:'inherit',
      color: danger ? PN.PINK_DARK : PN.TEXT,
      cursor:'pointer', textAlign:'left',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? PN.PINK_SOFT : '#F4F5F7'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width: 16, fontSize: 16, color: 'currentColor'}}>{icon}</span>
      {children}
    </button>
  );
}

window.ImpTabs = ImpTabs;
window.ImpSubTabs = ImpSubTabs;
window.ImpCard = ImpCard;
window.ImpField = ImpField;
window.ImpInput = ImpInput;
window.ImpTextarea = ImpTextarea;
window.ImpToggle = ImpToggle;
window.ImpButton = ImpButton;
window.MenuItem = MenuItem;

// Layout: main content on left, optional vetrina preview on right
function ImpWithPreview({ children, preview }) {
  const [open, setOpen] = React.useState(true);
  const asideRef = React.useRef(null);
  const phoneRef = React.useRef(null);

  // Il pannello resta fermo solo se ci sta nella finestra: `sticky` non ancora
  // in cima gli elementi piu alti del viewport — li lascia scorrere finche non
  // arriva il loro fondo, ed e esattamente il movimento che si vedeva (aside
  // 1040px, viewport 997). Col banner sotto il telefono sfora di poco, quindi
  // si restringe il telefono quel tanto che serve: l'aspect ratio 9/19,4 resta,
  // cambia solo la larghezza, e la scocca non si deforma.
  // offsetHeight/clientHeight sono px di LAYOUT: con lo zoom del .frame
  // getBoundingClientRect() darebbe px visivi e il conto sarebbe sbagliato.
  const adattaRef = React.useRef(() => {});
  React.useLayoutEffect(() => {
    if (!open) return;
    const adatta = () => {
      const aside = asideRef.current, box = phoneRef.current;
      if (!aside || !box) return;
      const scroller = aside.parentElement.closest('.pn-scroll');   // NON aside.closest: l'aside ha la stessa classe
      if (!scroller) return;
      // Azzerare PRIMA di misurare: se il maxHeight del giro precedente e ancora
      // applicato, aside.offsetHeight arriva gia tagliato e il contorno risulta
      // piu piccolo del vero — il telefono cresce, il pannello sfora, e al giro
      // dopo cresce ancora.
      aside.style.maxHeight = 'none';
      const piena = box.parentElement.clientWidth;
      box.style.width = piena + 'px';
      // Lo sticky si ferma dove finisce il suo contenitore — la griglia — ma la
      // pagina scorre ancora per il padding che viene dopo: senza toglierlo dal
      // conto il pannello scattava in su nell'ultimo tratto di scroll.
      // I rect sono px visivi per via dello zoom del .frame, scrollTop e
      // offsetHeight sono px di layout: il delta va diviso per lo zoom.
      const griglia = aside.parentElement;
      const frame = aside.closest('.frame');
      const z = frame ? (parseFloat(getComputedStyle(frame).zoom) || 1) : 1;
      const topGriglia = (griglia.getBoundingClientRect().top - scroller.getBoundingClientRect().top) / z + scroller.scrollTop;
      const coda = Math.max(0, scroller.scrollHeight - (topGriglia + griglia.offsetHeight));
      const disponibile = scroller.clientHeight - 36 - coda;     // 18 sopra + 18 sotto
      const contorno = aside.offsetHeight - box.offsetHeight;    // tutto tranne il telefono
      const maxTel = disponibile - contorno;
      box.style.width = Math.max(180, Math.min(piena, Math.floor(maxTel * 9 / 19.4))) + 'px';
      // Rete per le finestre molto basse: sotto i 180px di telefono si smette di
      // rimpicciolire e a scorrere e il pannello, che comunque resta fermo.
      aside.style.maxHeight = Math.max(240, disponibile) + 'px';
    };
    adattaRef.current = adatta;
    adatta();
    // Lo zoom del .frame lo applica uno script DOPO il mount: misurare una volta
    // sola al montaggio significa calcolare su un viewport che non esiste
    // ancora. Il ResizeObserver riparte quando il contenitore cambia davvero,
    // zoom compreso.
    const scroller = asideRef.current && asideRef.current.parentElement.closest('.pn-scroll');
    const ro = scroller ? new ResizeObserver(adatta) : null;
    if (ro) ro.observe(scroller);
    window.addEventListener('resize', adatta);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', adatta); };
  }, [open]);

  if (!preview) return <div>{children}</div>;
  return (
    // 348px e non 320: con l'anteprima che parte dalla cima, l'altezza
    // disponibile ammette un telefono da ~313px — la colonna vecchia lo
    // strozzava in larghezza e lasciava 50px vuoti sul fondo del pannello.
    <div style={{display:'grid', gridTemplateColumns: open ? '1fr 348px' : '1fr', gap: 18, alignItems:'flex-start'}}>
      <div style={{minWidth: 0}}>
        {/* A destra e non a sinistra: e il pulsante che riapre il pannello di
            destra, e sta dove ricompare quello che riapre. A sinistra sembrava
            l'intestazione del contenuto. */}
        {!open && (
          <button onClick={() => setOpen(true)} style={{
            display:'flex', alignItems:'center', gap: 8,
            marginLeft:'auto', marginBottom: 14,
            padding:'10px 14px', borderRadius: 10,
            background: PN.WHITE, color: PN.TEXT,
            border:`1px solid ${PN.BORDER}`,
            fontSize: 14.5, fontWeight: 600,
            cursor:'pointer', fontFamily:'inherit',
          }}>
            <PnI.Eye size={14}/> Mostra anteprima vetrina
          </button>
        )}
        {children}
      </div>
      {open && (
        // Sticky top: il phone preview rimane fisso a destra mentre il pn-scroll
        // a sinistra scorre il contenuto. alignSelf:start blocca lo stretching
        // verticale del grid item — sticky funziona solo se l'item non si
        // estende a tutta l'altezza del row.
        <aside ref={asideRef} className="pn-scroll" style={{
          position: 'sticky', top: 18, alignSelf: 'start',
          ...PN.GLASS_LIGHT,
          borderRadius: 14,
          padding: '14px 14px 18px',
          overflowY: 'auto',
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 12}}>
            <div style={{flex: 1}}>
              <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT}}>Anteprima vetrina</div>
              <div style={{fontSize:13.5, color:PN.MUTED, marginTop:1}}>Come appare ai clienti</div>
            </div>
            <button onClick={() => setOpen(false)} title="Nascondi anteprima" style={{
              width: 26, height: 26, borderRadius: 7,
              background:'transparent', border:'none',
              cursor:'pointer', color: PN.MUTED,
              display:'grid', placeItems:'center',
            }}><PnI.X size={14}/></button>
          </div>

          {/* Solo il telefono: la pubblicazione e scesa nella barra in fondo
              alla pagina, dove sta la modifica appena fatta, e il banner del
              piano Plus non e cosa che si guarda mentre si compila. */}
          <div ref={phoneRef} data-imp-telefono style={{margin: '0 auto'}}>{preview}</div>
        </aside>
      )}
    </div>
  );
}

// Sticky save bar
function ImpSaveBar({ dirty, onCancel, onSave }) {
  // La barra copre una striscia in fondo allo scroller: il telefono deve
  // ricalcolarsi quando lei compare o sparisce, e l'adattamento ascolta gia
  // il resize della finestra — glielo si fa credere.
  React.useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [dirty]);
  if (!dirty) return null;
  return (
    <div style={{
      position:'sticky', bottom: 0, left: 0, right: 0,
      marginTop: 14, marginLeft: -32, marginRight: -32, marginBottom: -32,
      padding: '14px 32px',
      background: PN.WHITE,
      borderTop: `1px solid ${PN.BORDER}`,
      boxShadow: '0 -4px 20px rgba(15,17,21,0.06)',
      display:'flex', alignItems:'center', gap: 14,
      zIndex: 10,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius:'50%', background: PN.AMBER, flexShrink: 0,
      }}/>
      <span style={{fontSize: 15, color: PN.TEXT, fontWeight: 600}}>Hai modifiche non salvate</span>
      <span style={{flex:1}}/>
      {onCancel && <ImpButton variant="ghost" onClick={onCancel}>Annulla</ImpButton>}
      <ImpButton variant="pink" onClick={onSave}>Salva modifiche</ImpButton>
    </div>
  );
}

// Phone preview della vetrina — iPhone con la replica 1:1 e COMPLETA di
// VenueOriginal (la vetrina dell'app consumer, app/extras.jsx), nello stesso
// ordine: hero a carosello (avanza da solo ogni 8s con Ken Burns, trascinabile
// col mouse), badge, indirizzo, recensione media, promo, premi, storia, i piu
// ordinati, reel dalla cucina, recensioni con velo e «Leggi tutte», mappa,
// altre info, altre sedi, FAQ apribili, galleria e social, con CTA sticky.
// Il contenuto (390px di design, zoom scalato) scorre con la rotella
// passandoci sopra col mouse; `focusSection` ('info' | 'gallery' | 'faq')
// lo porta alla sezione corrispondente.
function VetrinaMiniPreview({ tags = [], social = ['ig'], categoria = 'Ristorante', focusSection = null }) {
  const A = { PINK:'#E32459', TEXT:'#1c0f15', MUTED:'#6d5a61', BG:'#FBF4F1', TINT:'#f6f1ea', SURF:'#fff', BORDER:'#eddfda' };
  const ref = React.useRef(null);
  const scrollRef = React.useRef(null);
  const [w, setW] = React.useState(340);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const m = () => el.offsetWidth && setW(el.offsetWidth);
    m();
    const ro = new ResizeObserver(m); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // La sezione attiva a sinistra posiziona la vetrina sul punto giusto.
  React.useEffect(() => {
    const cont = scrollRef.current;
    if (!cont || !focusSection) return;
    const el = cont.querySelector(`[data-psec="${focusSection}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top - cont.getBoundingClientRect().top + cont.scrollTop - 6;
    cont.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [focusSection]);

  const k = (w - 18) / 390; // scocca 3+3 + cornice 6+6

  // Hero a carosello, identico alla vetrina vera: avanza da solo ogni 8
  // secondi, il trascinamento orizzontale cambia foto e azzera il timer,
  // la foto corrente respira col Ken Burns.
  const PHOTOS = [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70&auto=format&fit=crop',
  ];
  const [photoIdx, setPhotoIdx] = React.useState(0);
  const heroTimer = React.useRef(null);
  const heroDrag = React.useRef(null);
  const riparteHero = React.useCallback(() => {
    if (heroTimer.current) clearInterval(heroTimer.current);
    heroTimer.current = setInterval(() => setPhotoIdx(i => (i + 1) % 5), 8000);
  }, []);
  React.useEffect(() => {
    riparteHero();
    return () => { if (heroTimer.current) clearInterval(heroTimer.current); };
  }, [riparteHero]);
  const heroGiu = (e) => { heroDrag.current = e.clientX; };
  const heroSu = (e) => {
    if (heroDrag.current == null) return;
    const dx = e.clientX - heroDrag.current;
    heroDrag.current = null;
    if (Math.abs(dx) < 40) return;
    setPhotoIdx(i => dx < 0 ? Math.min(i + 1, PHOTOS.length - 1) : Math.max(i - 1, 0));
    riparteHero();
  };

  // Le sezioni vive della vetrina vera restano vive anche qui: FAQ apribili,
  // storia espandibile, promo col dettaglio, reel che avanzano da soli.
  const [faqOpen, setFaqOpen] = React.useState(0);
  const [bioExp, setBioExp] = React.useState(false);
  const [promoOpen, setPromoOpen] = React.useState(null);
  const [reelCur, setReelCur] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setReelCur(c => (c + 1) % 4), 1500);
    return () => clearInterval(t);
  }, []);

  const DISHES = [
    ['Cacio e Pepe',  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop'],
    ['Carbonara',     'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=70&auto=format&fit=crop'],
    ['Amatriciana',   'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=70&auto=format&fit=crop'],
  ];
  const rowIcon = (d) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A.MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  );
  const secTitle = (t) => (
    <div style={{fontSize: 15, fontWeight: 700, marginBottom: 10}}>{t}</div>
  );

  return (
    /* Scocca iPhone: anello metallico + tasti laterali + cornice nera,
       stesso linguaggio del mockup dell'onboarding. */
    <div ref={ref} style={{
      width: '100%', aspectRatio: '9/19.4', position: 'relative',
      borderRadius: Math.round(w * 0.155),
      background: 'linear-gradient(150deg, #43464D 0%, #1B1D22 42%, #303338 100%)',
      padding: 3,
      boxShadow: '0 22px 50px -18px rgba(15, 17, 21, 0.42), 0 4px 12px -4px rgba(15, 17, 21, 0.20), inset 0 0 0 1px rgba(255,255,255,0.16)',
    }}>
      <span aria-hidden="true" style={{position: 'absolute', left: -2, top: '14%', width: 3, height: 26, borderRadius: 3, background: '#2A2D33'}}/>
      <span aria-hidden="true" style={{position: 'absolute', left: -2, top: '20%', width: 3, height: 44, borderRadius: 3, background: '#2A2D33'}}/>
      <span aria-hidden="true" style={{position: 'absolute', right: -2, top: '17%', width: 3, height: 60, borderRadius: 3, background: '#2A2D33'}}/>

      <div style={{width: '100%', height: '100%', background: '#0B0C0E', borderRadius: Math.round(w * 0.145), padding: 6}}>
        <div style={{
          width: '100%', height: '100%', borderRadius: Math.round(w * 0.125),
          overflow: 'hidden', position: 'relative', background: A.BG,
          fontFamily: "'Hanken Grotesk', -apple-system, 'SF Pro Text', system-ui, sans-serif",
          color: A.TEXT,
        }}>
          {/* Contenuto scrollabile: rotella del mouse sopra il telefono */}
          <div ref={scrollRef} className="vetp-scroll" style={{position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden'}}>
            <div style={{zoom: k, width: 390, position: 'relative'}}>

              {/* Hero — carosello scorrevole come nella vetrina vera */}
              <div data-psec="hero"
                onMouseDown={heroGiu} onMouseUp={heroSu}
                onMouseLeave={() => { heroDrag.current = null; }}
                style={{height: 220, position: 'relative', background: '#222', cursor: 'grab', userSelect: 'none'}}
              >
                <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
                  <div style={{
                    display: 'flex', height: '100%',
                    transform: `translateX(-${photoIdx * 100}%)`,
                    transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    {PHOTOS.map((p, i) => (
                      <img key={i} src={p} alt="" draggable={false} style={{
                        width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0, pointerEvents: 'none',
                        animation: i === photoIdx ? 'vetpKenBurns 11s ease-in-out infinite alternate' : 'none',
                      }}/>
                    ))}
                  </div>
                </div>
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.72) 100%)', pointerEvents: 'none'}}/>
                <div style={{position: 'absolute', left: 20, right: 96, bottom: 44, color: '#fff', pointerEvents: 'none'}}>
                  <div style={{fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85, textTransform: 'uppercase', marginBottom: 5}}>
                    {categoria}
                  </div>
                  <div style={{fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 600, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.45)'}}>
                    Ristorante Cacio e Pepe
                  </div>
                </div>
                <div style={{position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, pointerEvents: 'none'}}>
                  {PHOTOS.map((_, i) => (
                    <span key={i} style={{
                      width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 99,
                      background: '#fff', opacity: i === photoIdx ? 1 : 0.45,
                      transition: 'width 0.25s, opacity 0.25s',
                    }}/>
                  ))}
                </div>
                <div style={{
                  position: 'absolute', right: 20, bottom: -40, zIndex: 5,
                  width: 80, height: 80, borderRadius: 999,
                  background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
                  border: '3px solid rgba(255,255,255,0.95)', overflow: 'hidden', pointerEvents: 'none',
                }}>
                  <div style={{width: '100%', height: '100%', borderRadius: 999, background: 'linear-gradient(135deg, #FFD3DC 0%, #FFB0C0 100%)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800, color: A.PINK, fontFamily: 'Georgia, serif'}}>CP</div>
                </div>
              </div>

              {/* Badge + tag scelti nel gestionale */}
              <div data-psec="tags" style={{display: 'flex', gap: 6, padding: '14px 20px 0', flexWrap: 'wrap'}}>
                <span style={{fontSize: 10.5, fontWeight: 700, color: '#0a8a3a', background: '#e6f5e9', padding: '4px 9px', borderRadius: 999}}>APERTO</span>
                <span style={{fontSize: 10.5, fontWeight: 700, color: A.TEXT, background: A.TINT, padding: '4px 9px', borderRadius: 999}}>🏆 TOP 10 ROMA</span>
                {tags.slice(0, 3).map(t => (
                  <span key={t} style={{fontSize: 10.5, fontWeight: 700, color: A.PINK, background: '#FCE9EE', padding: '4px 9px', borderRadius: 999}}>{t.toUpperCase()}</span>
                ))}
              </div>

              {/* Indirizzo + orari */}
              <div data-psec="info" style={{display: 'flex', flexDirection: 'column', gap: 5, padding: '14px 20px 0'}}>
                <div style={{fontSize: 13.5, color: A.MUTED, display: 'flex', alignItems: 'center', gap: 6}}>
                  {rowIcon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>)}
                  Via dei Gracchi 56, 00187 Roma
                </div>
                <div style={{fontSize: 13.5, color: A.MUTED, display: 'flex', alignItems: 'center', gap: 6}}>
                  {rowIcon(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}
                  Lun – Ven · 11:00 – 23:00
                </div>
              </div>

              {/* Recensione media */}
              <div style={{padding: '18px 20px 0'}}>
                {secTitle('Recensione media')}
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{width: 30, height: 30, borderRadius: 7, background: A.PINK, display: 'grid', placeItems: 'center'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                  ))}
                  <span style={{marginLeft: 8, display: 'flex', alignItems: 'baseline', gap: 6}}>
                    <span style={{fontSize: 28, fontWeight: 800, letterSpacing: -0.5}}>4.8</span>
                    <span style={{fontSize: 14, color: A.MUTED, fontWeight: 500}}>· 320 recensioni</span>
                  </span>
                </div>
              </div>

              {/* Promo / Eventi — pillole col dettaglio a scomparsa, come in app */}
              <div data-psec="promo" style={{padding: '20px 20px 0'}}>
                {secTitle('Promo / Eventi')}
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  {[['Aperitivo 2x1','Ogni giorno · 18:00 – 21:00'], ['Karaoke venerdì','Tutti i venerdì · dalle 21:00'], ['Brunch domenica','Ogni domenica · 11:00 – 15:00']].map(([p, info]) => (
                    <span key={p} style={{display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start'}}>
                      <span onClick={() => setPromoOpen(o => o === p ? null : p)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: promoOpen === p ? A.PINK : '#F8F5F6',
                        color: promoOpen === p ? '#fff' : A.TEXT,
                        padding: '6px 14px', borderRadius: 999,
                        fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
                        cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none',
                      }}>
                        {p}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{opacity: 0.6, transform: promoOpen === p ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s'}}>
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {promoOpen === p && (
                        <span style={{background: '#fff', border: `1px solid ${A.BORDER}`, borderRadius: 12, padding: '6px 12px', fontSize: 12, color: A.MUTED, fontWeight: 500, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>{info}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Premi — pillole outline con alloro, a livelli come in app */}
              <div style={{padding: '20px 20px 0'}}>
                {secTitle('Premi e riconoscimenti')}
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  {[['Top 10 Roma 2025', '#c9930a', '#fdf6e0', '#efd98a'], ['Gambero Rosso', '#7b8494', '#f3f5f8', '#ccd3dd'], ['Tripadvisor Excellence', '#a3652f', '#f9ede1', '#e2c3a2']].map(([p, c, bg, bd]) => (
                    <span key={p} style={{display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color: A.TEXT, padding: '6px 12px 6px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${bd}`}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9 a 6 6 0 0 0 12 0 V3 H6 z"/>
                        <path d="M12 15 v 4 M8.5 21 h 7" fill="none"/>
                        <path d="M6 5H3.5a4.5 4.5 0 0 0 4 4.4M18 5h2.5a4.5 4.5 0 0 1-4 4.4" fill="none"/>
                      </svg>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Storia — espandibile come in app */}
              <div data-psec="story" style={{padding: '20px 20px 0'}}>
                {secTitle('La nostra storia')}
                <div style={{fontSize: 13.5, lineHeight: 1.55}}>
                  {bioExp
                    ? <>Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno. Pasta tirata a mano ogni mattina, materie prime dai mercati di Testaccio e Campagna Amica. Carta dei vini con 200 etichette del Lazio. Una stella Michelin nel 2022. <span onClick={() => setBioExp(false)} style={{color: A.PINK, fontWeight: 600, cursor: 'pointer'}}>Meno ↑</span></>
                    : <>Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno. <span onClick={() => setBioExp(true)} style={{color: A.PINK, fontWeight: 600, cursor: 'pointer'}}>...Altro</span></>
                  }
                </div>
              </div>

              {/* I più ordinati */}
              <div data-psec="dishes" style={{padding: '20px 20px 0'}}>
                {secTitle('I più ordinati')}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
                  {DISHES.map(([n, src]) => (
                    <div key={n} style={{borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 20px -14px rgba(77,18,46,.4)', border: '1px solid rgba(77,18,46,.06)'}}>
                      <div style={{height: 88, overflow: 'hidden'}}>
                        <img src={src} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                      </div>
                      <div style={{padding: '8px 10px 10px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dalla cucina — stack di reel 9:16 che avanza da solo, come in app */}
              <div style={{padding: '20px 20px 0'}}>
                {secTitle('Dalla cucina')}
                <div style={{position: 'relative', height: 348, overflow: 'hidden'}}>
                  {[1, 2, 3, 4].map((n, i) => {
                    let r = (i - reelCur) % 4; if (r > 2) r -= 4; if (r < -2) r += 4;
                    if (Math.abs(r) > 2) return null;
                    return (
                      <div key={n}
                        onClick={() => { if (r !== 0) setReelCur(i); }}
                        style={{
                          position: 'absolute', left: '50%', top: 8, width: 172, height: 306,
                          transform: `translateX(calc(-50% + ${r * 118}px)) scale(${r === 0 ? 1 : .84})`,
                          zIndex: 10 - Math.abs(r),
                          opacity: Math.abs(r) === 2 ? 0 : (r === 0 ? 1 : .55),
                          transition: 'transform 520ms cubic-bezier(.22,.9,.35,1), opacity 420ms ease',
                          cursor: 'pointer', willChange: 'transform',
                        }}>
                        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: r === 0 ? '0 18px 36px -14px rgba(227,36,89,.45)' : '0 10px 22px -14px rgba(77,18,46,.4)'}}>
                          <img src={`../app/assets/reels/reel-${n}.webp`} alt="" draggable={false} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recensioni — due visibili, velo e rimando, come in app */}
              <div style={{padding: '22px 20px 0'}}>
                {secTitle('Cosa dicono di noi')}
                <div style={{position: 'relative'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 238, overflow: 'hidden'}}>
                    {[
                      ['G', 'Giulia M.', '2 giorni fa', 5, 'Atmosfera incredibile e cucina autentica. La cacio e pepe è la migliore di Roma.'],
                      ['M', 'Marco R.', '1 settimana fa', 5, 'Servizio impeccabile, vino consigliato dal cameriere perfetto.'],
                    ].map(([ini, name, when, rating, text]) => (
                      <div key={name} style={{padding: '13px 14px', borderRadius: 14, background: '#fff', border: `1px solid ${A.BORDER}`, display: 'flex', flexDirection: 'column', gap: 7}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                          <span style={{width: 34, height: 34, borderRadius: 999, background: A.PINK, flexShrink: 0, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13}}>{ini}</span>
                          <span style={{flex: 1, minWidth: 0}}>
                            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                              <span style={{fontSize: 13.5, fontWeight: 700}}>{name}</span>
                              <span style={{fontSize: 11, color: A.MUTED}}>{when}</span>
                            </span>
                            <span style={{display: 'flex', gap: 2, marginTop: 3}}>
                              {[1,2,3,4,5].map(st => (
                                <svg key={st} width="11" height="11" viewBox="0 0 24 24" fill={st <= rating ? A.PINK : '#e0d8db'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              ))}
                            </span>
                          </span>
                        </div>
                        <div style={{fontSize: 13, lineHeight: 1.55}}>{text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0, height: 120,
                    background: 'linear-gradient(180deg, rgba(251,244,241,0) 0%, rgba(251,244,241,.92) 70%, #FBF4F1 100%)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 2,
                  }}>
                    <span style={{color: A.PINK, fontSize: 14, fontWeight: 700, padding: '10px 16px'}}>Leggi tutte le recensioni ↓</span>
                  </div>
                </div>
              </div>

              {/* Mappa — tile finta (niente Leaflet qui) con pin e pillola */}
              <div style={{padding: '22px 20px 0'}}>
                {secTitle('Dove siamo')}
                <div style={{
                  height: 160, borderRadius: 14, overflow: 'hidden', position: 'relative',
                  background: `
                    linear-gradient(90deg, transparent 48%, #fff 48%, #fff 54%, transparent 54%),
                    linear-gradient(0deg, transparent 30%, #fff 30%, #fff 35%, transparent 35%),
                    linear-gradient(58deg, transparent 62%, #fff 62%, #fff 66%, transparent 66%),
                    linear-gradient(0deg, #E8ECEA, #EEF1EF)`,
                }}>
                  <span style={{position: 'absolute', left: '18%', top: '12%', width: '26%', height: '30%', borderRadius: 10, background: '#DCE8DB'}}/>
                  <span style={{position: 'absolute', right: '8%', bottom: '38%', width: '20%', height: '24%', borderRadius: 8, background: '#DDE3E8'}}/>
                  <span style={{
                    position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%, -50%)',
                    width: 14, height: 14, borderRadius: '50%', background: A.PINK,
                    border: '3px solid #fff', boxShadow: '0 2px 8px rgba(227,36,89,0.55)',
                  }}/>
                  <span style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: '#fff', borderRadius: 999, padding: '8px 16px',
                    fontSize: 12.5, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}>Vedi mappa →</span>
                </div>
              </div>

              {/* Altre info */}
              <div style={{padding: '22px 20px 0'}}>
                {secTitle('Altre info')}
                <div style={{background: '#fff', border: `1px solid ${A.BORDER}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10}}>
                  {[['P', 'Parcheggio custodito Via Giulia'], ['M', 'Metro Tiburtina linea B · Bus 54, 60, 12, 40']].map(([ic, label]) => (
                    <div key={ic} style={{display: 'flex', alignItems: 'center', gap: 12}}>
                      <span style={{width: 28, height: 28, borderRadius: 999, background: '#FBF4F1', border: `1px solid ${A.BORDER}`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700}}>{ic}</span>
                      <span style={{fontSize: 13, flex: 1}}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Altre sedi */}
              <div style={{padding: '22px 20px 0'}}>
                {secTitle('Altre sedi')}
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {[['Milano', 'Corso Venezia 50'], ['Firenze', 'Via dei Calzaiuoli 12']].map(([city, addr]) => (
                    <div key={city} style={{background: '#fff', border: `1px solid ${A.BORDER}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12}}>
                      <span style={{width: 38, height: 38, borderRadius: 13, background: '#FCE9EE', flexShrink: 0, display: 'grid', placeItems: 'center'}}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={A.PINK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10.4 5 5.2A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.2l1 5.2"/>
                          <path d="M4 10.4a2.6 2.6 0 0 0 5.2 0 2.6 2.6 0 0 0 5.3 0 2.6 2.6 0 0 0 5.3 0"/>
                          <path d="M5.3 12.8V19a1.5 1.5 0 0 0 1.5 1.5h10.4A1.5 1.5 0 0 0 18.7 19v-6.2"/>
                          <path d="M9.8 20.3v-4.6a1.3 1.3 0 0 1 1.3-1.3h1.8a1.3 1.3 0 0 1 1.3 1.3v4.6"/>
                        </svg>
                      </span>
                      <span>
                        <span style={{display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 2}}>{city}</span>
                        <span style={{display: 'block', fontSize: 12.5, color: A.MUTED}}>{addr}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ — apribili come in app */}
              <div data-psec="faq" style={{padding: '22px 20px 0'}}>
                {secTitle('Domande frequenti')}
                <div>
                  {[
                    ['Siete aperti il sabato?', 'Sì, dalle 12:00 alle 23:00 con orario continuato.'],
                    ['Avete opzioni vegane?', 'Certo, almeno 5 piatti vegani sono sempre disponibili.'],
                    ['Posso prenotare per gruppi?', 'Sì, fino a 30 persone con preavviso di 24 ore.'],
                  ].map(([q, a], i) => (
                    <div key={q} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} style={{borderBottom: `1px solid ${A.BORDER}`, padding: '12px 0', cursor: 'pointer'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{fontSize: 14}}>{q}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A.MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s'}}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      {faqOpen === i && <div style={{fontSize: 13, color: A.MUTED, marginTop: 8, lineHeight: 1.5}}>{a}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Galleria fotografica — qui atterra la tab Aspetto */}
              <div data-psec="gallery" style={{padding: '22px 20px 0'}}>
                {secTitle('Galleria fotografica')}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
                  <div style={{gridRow: 'span 2', borderRadius: 12, overflow: 'hidden', height: 200}}>
                    <img src={PHOTOS[1]} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                  </div>
                  <div style={{borderRadius: 12, overflow: 'hidden', height: 96}}>
                    <img src={PHOTOS[2]} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                  </div>
                  <div style={{borderRadius: 12, overflow: 'hidden', height: 96}}>
                    <img src={PHOTOS[3]} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                  </div>
                </div>
              </div>

              {/* Canali social — i collegati nel gestionale */}
              <div data-psec="social" style={{padding: '22px 20px 100px'}}>
                {secTitle('Canali Social')}
                <div style={{display: 'flex', gap: 12}}>
                  {(social.length ? social : ['ig']).map(sc => (
                    <span key={sc} style={{width: 36, height: 36, borderRadius: 999, background: A.PINK, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'serif'}}>
                      {sc === 'fb' ? 'f' : sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Overlay fissi: island, CTA, indicator. Niente ora ne batteria:
              sono la cornice del sistema, non la vetrina — qui si guarda il
              contenuto, non un'istantanea di iOS. */}
          <div style={{position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: Math.round(74 * k), height: Math.round(20 * k), borderRadius: 999, background: '#0B0C0E', zIndex: 7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7}}>
            <span style={{width: Math.round(8 * k), height: Math.round(8 * k), borderRadius: 999, background: 'radial-gradient(circle at 32% 30%, #3A4150 0%, #0E1013 70%)', boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.20)'}}/>
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
            padding: `${Math.round(30 * k)}px ${Math.round(16 * k)}px ${Math.round(20 * k)}px`,
            display: 'flex', gap: Math.round(10 * k),
            background: 'linear-gradient(180deg, rgba(251,244,241,0) 0%, rgba(251,244,241,0.96) 45%)',
            pointerEvents: 'none',
          }}>
            <span style={{flex: 1, padding: `${Math.round(12 * k)}px 0`, borderRadius: 999, background: '#fff', border: '1.5px solid #eddfda', fontSize: Math.max(10, Math.round(14.5 * k)), fontWeight: 700, color: A.TEXT, textAlign: 'center'}}>Vedi menù</span>
            <span style={{flex: 1.5, padding: `${Math.round(12 * k)}px 0`, borderRadius: 999, background: A.PINK, fontSize: Math.max(10, Math.round(14.5 * k)), fontWeight: 700, color: '#fff', textAlign: 'center', boxShadow: '0 6px 16px rgba(227,36,89,0.35)'}}>Prenota un tavolo</span>
          </div>
          <div aria-hidden="true" style={{position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: Math.round(92 * k), height: 4, borderRadius: 999, background: 'rgba(15, 17, 21, 0.30)', zIndex: 7}}/>
        </div>
      </div>
      <style>{`.vetp-scroll::-webkit-scrollbar{display:none}.vetp-scroll{scrollbar-width:none}@keyframes vetpKenBurns{0%{transform:scale(1)}100%{transform:scale(1.09)}}`}</style>
    </div>
  );
}

window.ImpWithPreview = ImpWithPreview;
window.ImpSaveBar = ImpSaveBar;
window.VetrinaMiniPreview = VetrinaMiniPreview;
window.impAccendiSezione = impAccendiSezione;
window.ImpAtterraggioStyle = ImpAtterraggioStyle;

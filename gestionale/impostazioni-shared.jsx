// Shared building blocks for Impostazioni pages

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

function ImpCard({ title, sub, children, action, aurora, anchor }) {
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

function ImpField({ label, hint, children }) {
  return (
    <div style={{marginBottom: 16}}>
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
function ImpWithPreview({ children, preview, dirty, onPublish }) {
  const [open, setOpen] = React.useState(true);
  if (!preview) return <div>{children}</div>;
  return (
    <div style={{display:'grid', gridTemplateColumns: open ? '1fr 320px' : '1fr', gap: 18, alignItems:'flex-start'}}>
      <div style={{minWidth: 0}}>
        {!open && (
          <button onClick={() => setOpen(true)} style={{
            display:'flex', alignItems:'center', gap: 8,
            marginBottom: 14,
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
        <aside style={{
          position: 'sticky', top: 18, alignSelf: 'start',
          ...PN.GLASS_LIGHT,
          borderRadius: 14,
          padding: '14px 14px 18px',
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

          {/* CTA Pubblica modifiche — sopra al phone preview. Disattivato finché
              dirty=false. Sostituisce ImpSaveBar (rimossa): l'azione di pubblicazione
              vive accanto all'oggetto modificato (la vetrina = il phone preview). */}
          <PublishButton dirty={dirty} onPublish={onPublish}/>

          {preview}
        </aside>
      )}
    </div>
  );
}

// Pubblica modifiche — Apple-style button con gradient sottile + inset highlight.
// State enabled = BRAND gradient + shadow tinted. State disabled = sfumatura
// di bianco neutra (no bianco-su-bianco piatto).
function PublishButton({ dirty, onPublish }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={dirty ? onPublish : undefined}
      disabled={!dirty}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', height: 38,
        marginBottom: 14,
        border: dirty
          ? '1px solid rgba(0, 0, 0, 0.10)'
          : '1px solid rgba(15, 17, 21, 0.08)',
        borderRadius: 9,
        cursor: dirty ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit',
        fontSize: 15, fontWeight: 600,
        // Gradient sottile dall'alto al basso — pattern macOS button.
        // Inset highlight bianco simula il riflesso vetroso, comune nei
        // button macOS Big Sur/Sonoma.
        background: dirty
          ? (hover
              ? 'linear-gradient(180deg, #FF6E73 0%, #F04A4F 100%)'
              : 'linear-gradient(180deg, #FF6A6F 0%, #FF5A5F 100%)')
          : 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        color: dirty ? '#fff' : PN.MUTED_SOFT,
        boxShadow: dirty
          ? 'inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 2px rgba(255, 90, 95, 0.18)'
          : 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 1px rgba(15,17,21,0.03)',
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: dirty ? '#fff' : PN.MUTED_LIGHT,
        opacity: dirty ? 0.9 : 1,
      }}/>
      {dirty ? 'Pubblica modifiche' : 'Nessuna modifica da pubblicare'}
    </button>
  );
}

// Sticky save bar
function ImpSaveBar({ dirty, onCancel, onSave }) {
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
      <ImpButton variant="ghost" onClick={onCancel}>Annulla</ImpButton>
      <ImpButton variant="primary" onClick={onSave}>Salva e pubblica</ImpButton>
    </div>
  );
}

// Mini phone preview rendering vetrina mock content — same design language as onboarding
// Phone preview della vetrina — iPhone con la replica 1:1 e COMPLETA di
// VenueOriginal (la vetrina dell'app consumer, app/extras.jsx): hero, badge,
// indirizzo, recensione media, promo, premi, storia, chef consiglia, FAQ e
// recensioni, con CTA sticky. Il contenuto (390px di design, zoom scalato)
// scorre con la rotella passandoci sopra col mouse; `focusSection`
// ('info' | 'gallery' | 'faq') lo porta alla sezione corrispondente.
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
  const HERO = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=70&auto=format&fit=crop';
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

              {/* Hero */}
              <div data-psec="hero" style={{height: 220, position: 'relative', background: '#222'}}>
                <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
                  <img src={HERO} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                </div>
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.72) 100%)'}}/>
                <div style={{position: 'absolute', left: 20, right: 96, bottom: 44, color: '#fff'}}>
                  <div style={{fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85, textTransform: 'uppercase', marginBottom: 5}}>
                    {categoria}
                  </div>
                  <div style={{fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 600, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.45)'}}>
                    Ristorante Cacio e Pepe
                  </div>
                </div>
                <div style={{position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5}}>
                  {[0,1,2,3,4].map(i => (
                    <span key={i} style={{width: i === 0 ? 18 : 6, height: 6, borderRadius: 99, background: '#fff', opacity: i === 0 ? 1 : 0.45}}/>
                  ))}
                </div>
                <div style={{
                  position: 'absolute', right: 20, bottom: -40, zIndex: 5,
                  width: 80, height: 80, borderRadius: 999,
                  background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
                  border: '3px solid rgba(255,255,255,0.95)', overflow: 'hidden',
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

              {/* Promo / Eventi */}
              <div data-psec="promo" style={{padding: '20px 20px 0'}}>
                {secTitle('Promo / Eventi')}
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  {['Aperitivo 2x1', 'Karaoke venerdì', 'Brunch domenica'].map(p => (
                    <span key={p} style={{fontSize: 12.5, fontWeight: 700, color: A.PINK, background: '#FCE9EE', padding: '7px 12px', borderRadius: 999}}>{p}</span>
                  ))}
                </div>
              </div>

              {/* Premi */}
              <div style={{padding: '20px 20px 0'}}>
                {secTitle('Premi e riconoscimenti')}
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  {[['🥇','Top 10 Roma 2025'], ['🥈','Gambero Rosso'], ['🥉','Tripadvisor Excellence']].map(([m, p]) => (
                    <span key={p} style={{fontSize: 12.5, fontWeight: 700, color: A.TEXT, background: A.TINT, padding: '7px 12px', borderRadius: 999}}>{m} {p}</span>
                  ))}
                </div>
              </div>

              {/* Storia */}
              <div data-psec="story" style={{padding: '20px 20px 0'}}>
                {secTitle('La nostra storia')}
                <div style={{fontSize: 13.5, lineHeight: 1.55}}>
                  Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti
                  tradizionali della cucina romana, ingredienti freschi e selezionati ogni
                  giorno. <span style={{color: A.PINK, fontWeight: 600}}>...Altro</span>
                </div>
              </div>

              {/* I più ordinati */}
              <div data-psec="gallery" style={{padding: '20px 20px 0'}}>
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

              {/* FAQ */}
              <div data-psec="faq" style={{padding: '22px 20px 0'}}>
                {secTitle('Domande frequenti')}
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {[
                    ['Siete aperti il sabato?', 'Sì, dalle 12:00 alle 23:00 con orario continuato.', true],
                    ['Avete opzioni vegane?', null, false],
                    ['Posso prenotare per gruppi?', null, false],
                  ].map(([q, a, open]) => (
                    <div key={q} style={{background: '#fff', borderRadius: 12, padding: '11px 14px', border: `1px solid ${A.BORDER}`}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <span style={{flex: 1, fontSize: 13.5, fontWeight: 700}}>{q}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A.MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{transform: open ? 'rotate(180deg)' : 'none'}}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      {a && <div style={{fontSize: 12.5, color: A.MUTED, marginTop: 6, lineHeight: 1.45}}>{a}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recensioni */}
              <div style={{padding: '22px 20px 120px'}}>
                {secTitle('Le recensioni')}
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {[
                    ['G', 'Giulia M.', '2 giorni fa', 'Atmosfera incredibile e cucina autentica. La cacio e pepe è la migliore di Roma.'],
                    ['M', 'Marco R.', '1 settimana fa', 'Servizio impeccabile, vino consigliato dal cameriere perfetto.'],
                  ].map(([ini, name, when, text]) => (
                    <div key={name} style={{background: '#fff', borderRadius: 14, padding: '12px 14px', border: `1px solid ${A.BORDER}`}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
                        <span style={{width: 28, height: 28, borderRadius: 999, background: A.TINT, color: A.PINK, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 800}}>{ini}</span>
                        <span style={{fontSize: 13, fontWeight: 700}}>{name}</span>
                        <span style={{fontSize: 11.5, color: A.MUTED}}>· {when}</span>
                        <span style={{marginLeft: 'auto', fontSize: 11.5, color: '#f5b400'}}>★★★★★</span>
                      </div>
                      <div style={{fontSize: 12.5, color: A.TEXT, lineHeight: 1.5}}>{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Overlay fissi: status bar, island, bottoni flottanti, CTA, indicator */}
          <div style={{position: 'absolute', top: Math.round(34 * k), left: Math.round(22 * k), right: Math.round(22 * k), zIndex: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', pointerEvents: 'none'}}>
            <span style={{fontSize: Math.max(10, Math.round(13 * k)), fontWeight: 700, fontVariantNumeric: 'tabular-nums', textShadow: '0 1px 4px rgba(0,0,0,0.4)'}}>9:41</span>
            <span style={{width: Math.round(22 * k), height: Math.round(10 * k), border: '1.2px solid #fff', borderRadius: 2, position: 'relative', opacity: 0.95}}>
              <span style={{position: 'absolute', inset: 1, width: '68%', background: '#fff', borderRadius: 1}}/>
            </span>
          </div>
          <div style={{position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: Math.round(74 * k), height: Math.round(20 * k), borderRadius: 999, background: '#0B0C0E', zIndex: 7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7}}>
            <span style={{width: Math.round(8 * k), height: Math.round(8 * k), borderRadius: 999, background: 'radial-gradient(circle at 32% 30%, #3A4150 0%, #0E1013 70%)', boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.20)'}}/>
          </div>
          <div style={{position: 'absolute', top: Math.round(64 * k), left: Math.round(16 * k), right: Math.round(16 * k), zIndex: 6, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none'}}>
            {[0, 1].map(side => side === 0 ? (
              <span key="b" style={{width: Math.round(38 * k), height: Math.round(38 * k), borderRadius: 999, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', display: 'grid', placeItems: 'center'}}>
                <svg width={Math.round(16 * k)} height={Math.round(16 * k)} viewBox="0 0 24 24" fill="none" stroke={A.TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </span>
            ) : (
              <span key="r" style={{display: 'flex', gap: Math.round(8 * k)}}>
                <span style={{width: Math.round(38 * k), height: Math.round(38 * k), borderRadius: 999, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', display: 'grid', placeItems: 'center'}}>
                  <svg width={Math.round(18 * k)} height={Math.round(18 * k)} viewBox="0 0 24 24" fill="none" stroke={A.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </span>
                <span style={{width: Math.round(38 * k), height: Math.round(38 * k), borderRadius: 999, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', display: 'grid', placeItems: 'center'}}>
                  <svg width={Math.round(18 * k)} height={Math.round(18 * k)} viewBox="0 0 24 24" fill={A.TEXT}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </span>
              </span>
            ))}
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
      <style>{`.vetp-scroll::-webkit-scrollbar{display:none}.vetp-scroll{scrollbar-width:none}`}</style>
    </div>
  );
}

window.ImpWithPreview = ImpWithPreview;
window.ImpSaveBar = ImpSaveBar;
window.VetrinaMiniPreview = VetrinaMiniPreview;

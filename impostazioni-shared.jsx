// Shared building blocks for Impostazioni pages

function ImpHeader({ active }) {
  const SUBTITLES = {
    vetrina: 'Vetrina · come appare il locale ai clienti',
    'menu-cucina': 'Menù · catalogo, allergeni, regole IVA',
    sala: 'Sala e tavoli · sale, tavoli e coperti',
    personale: 'Personale · staff e dispositivi connessi',
    flussi: 'Operazioni · come arrivano e vengono gestiti gli ordini',
    fiscali: 'Dati fiscali locale · P.IVA, SDI, sede legale, IBAN',
    integrazioni: 'POS e integrazioni · pagamenti e software esterni',
  };

  return (
    <header style={{
      display:'flex', alignItems:'center', gap: 16,
      padding: '20px 32px 18px',
      borderBottom: `1px solid ${PN.BORDER_SOFT}`,
      background: PN.WHITE,
    }}>
      <span style={{
        width: 40, height: 40, borderRadius: 11,
        background: PN.PINK_SOFT, color: PN.PINK_DARK,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Icon name="gear" size={22}/>
      </span>
      <div style={{flex:1}}>
        <h1 style={{margin:0, fontSize: 22, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.4}}>
          Impostazioni
        </h1>
        <div style={{fontSize: 13, color: PN.MUTED, marginTop: 4}}>
          {SUBTITLES[active] || ''}
        </div>
      </div>

      <PnNotifBell/>
    </header>
  );
}

function ImpTabs({ active, onChange }) {
  const tabs = [
    { id: 'vetrina', label: 'Vetrina', icon: 'place-restaurant' },
    { id: 'menu-cucina', label: 'Menù', icon: 'food-meal' },
    { id: 'sala', label: 'Sala e tavoli', icon: 'place-table' },
    { id: 'personale', label: 'Personale', icon: 'people-staff-group' },
    { id: 'flussi', label: 'Operazioni', icon: 'chart-workflow' },
    { id: 'fiscali', label: 'Dati fiscali locale', icon: 'commerce-receipt' },
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
            fontSize: 13.5, fontWeight: 600,
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
            fontSize: 13.5, fontWeight: isActive ? 700 : 500,
            cursor:'pointer', fontFamily:'inherit',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

function ImpCard({ title, sub, children, action, aurora }) {
  // L2 Aurora soft wash multi-color — pink + lavender + cream mesh su base
  // sfumata pink→lavender. Stesso DNA della variant L2 nella preview themes.
  // Sistema 75/15/10.
  const auroraBg =
    'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
    'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
    'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
    'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)';
  return (
    <section style={{
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
            {title && <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.2}}>{title}</div>}
            {sub && <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.4}}>{sub}</div>}
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
        display:'block', fontSize: 12, fontWeight: 600, color: PN.TEXT,
        marginBottom: 6,
      }}>{label}</label>
      {children}
      {hint && <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 6}}>{hint}</div>}
    </div>
  );
}

function ImpInput(props) {
  return (
    <input {...props} style={{
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 9,
      fontSize: 13.5,
      background: PN.WHITE,
      outline: 'none',
      ...props.style,
    }}/>
  );
}

function ImpTextarea(props) {
  return (
    <textarea {...props} style={{
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 9,
      fontSize: 13.5,
      background: PN.WHITE,
      outline: 'none',
      resize: 'vertical',
      minHeight: 80,
      ...props.style,
    }}/>
  );
}

function ImpCheckbox({ label, checked, onChange }) {
  return (
    <label style={{
      display:'inline-flex', alignItems:'center', gap: 8,
      cursor:'pointer', fontSize: 13, color: PN.TEXT,
      padding: '7px 0',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5,
        border: `1.5px solid ${checked ? PN.TEXT : PN.BORDER}`,
        background: checked ? PN.TEXT : PN.WHITE,
        display:'grid', placeItems:'center',
        transition: 'all .12s',
      }}>
        {checked && <PnI.Check size={11} color={PN.WHITE}/>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{display:'none'}}/>
      {label}
    </label>
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
function ImpButton({ variant = 'primary', icon, children, onClick, style = {} }) {
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
    text: {
      bg: 'transparent',
      color: PN.TEXT,
      border: 'none',
      shadow: 'none',
    },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:'inline-flex', alignItems:'center', gap: 7,
        padding: '9px 16px',
        borderRadius: 9,
        fontSize: 13, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        background: v.bg, color: v.color, border: v.border,
        boxShadow: v.shadow,
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}

window.ImpHeader = ImpHeader;
window.ImpTabs = ImpTabs;
window.ImpSubTabs = ImpSubTabs;
window.ImpCard = ImpCard;
window.ImpField = ImpField;
window.ImpInput = ImpInput;
window.ImpTextarea = ImpTextarea;
window.ImpCheckbox = ImpCheckbox;
window.ImpToggle = ImpToggle;
window.ImpButton = ImpButton;

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
            fontSize: 12.5, fontWeight: 600,
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
              <div style={{fontSize:13.5, fontWeight:700, color:PN.TEXT}}>Anteprima vetrina</div>
              <div style={{fontSize:11.5, color:PN.MUTED, marginTop:1}}>Come appare ai clienti</div>
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
        fontSize: 13, fontWeight: 600,
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
      <span style={{fontSize: 13, color: PN.TEXT, fontWeight: 600}}>Hai modifiche non salvate</span>
      <span style={{flex:1}}/>
      <ImpButton variant="ghost" onClick={onCancel}>Annulla</ImpButton>
      <ImpButton variant="primary" onClick={onSave}>Salva e pubblica</ImpButton>
    </div>
  );
}

// Mini phone preview rendering vetrina mock content — same design language as onboarding
function VetrinaMiniPreview({ tags = [], social = ['ig'], categoria = 'Ristorante' }) {
  const WINE = '#B53338';
  const TEXT = '#1a1a1a';
  const MUTED = '#6b6b6b';
  const BG_PAGE = '#fafafa';
  return (
    <div style={{
      width: '100%', aspectRatio:'9/19',
      background:'#1a1a1a', borderRadius: 28, padding: 6,
      boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
    }}>
      <div style={{
        width:'100%', height:'100%', background: BG_PAGE, borderRadius: 22,
        overflow:'hidden', position:'relative', display:'flex', flexDirection:'column',
      }}>
        {/* Status bar */}
        <div style={{
          padding:'8px 16px 2px', display:'flex', justifyContent:'space-between',
          fontSize: 9, fontWeight: 700, color: TEXT, flexShrink: 0,
        }}>
          <span>9:41</span>
          <span style={{display:'flex', gap:2, alignItems:'center'}}>
            <span style={{width:11, height:6, border:`1px solid ${TEXT}`, borderRadius:1.5, position:'relative'}}>
              <span style={{position:'absolute', inset:1, background:TEXT, width:7, borderRadius:0.5}}/>
            </span>
          </span>
        </div>

        {/* Hero photo */}
        <div style={{
          margin:'8px 10px 0', borderRadius: 14, overflow:'hidden',
          aspectRatio:'16/10', position:'relative',
          background:'linear-gradient(135deg, #8B4513, #D2691E)',
          flexShrink: 0,
        }}>
          {/* top chips on photo */}
          <div style={{
            position:'absolute', top:6, left:6, right:6,
            display:'flex', justifyContent:'space-between', gap:4,
          }}>
            <span style={{
              padding:'2px 6px', borderRadius:999,
              background:'rgba(255,255,255,0.9)', backdropFilter:'blur(4px)',
              fontSize:7, fontWeight:700, color:TEXT,
            }}>● Aperto</span>
            <span style={{
              padding:'2px 6px', borderRadius:999,
              background:'rgba(0,0,0,0.45)', color:'#fff',
              fontSize:7, fontWeight:700,
            }}>4.8 ★ · 312</span>
          </div>
        </div>

        {/* Logo straddling the photo */}
        <div style={{
          margin:'-18px 0 0 14px', width: 36, height: 36,
          borderRadius: 9, background: PN.WHITE, padding: 3,
          boxShadow:'0 2px 8px rgba(0,0,0,0.18)', flexShrink: 0, position:'relative', zIndex: 2,
        }}>
          <div style={{
            width:'100%', height:'100%', borderRadius: 6,
            background:'linear-gradient(135deg, #FF5A5F, #E04347)',
            display:'grid', placeItems:'center',
            color:'#fff', fontSize: 9, fontWeight: 800,
          }}>CP</div>
        </div>

        {/* Body */}
        <div style={{padding:'4px 14px 0', flexShrink: 0}}>
          <div style={{fontSize: 12.5, fontWeight: 800, color: TEXT, letterSpacing:-0.2}}>Cacio e Pepe</div>
          <div style={{fontSize: 9, color: MUTED, marginTop: 1}}>{categoria} · Via Roma 13, Roma</div>

          {tags.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap: 3, marginTop: 8}}>
              {tags.slice(0, 4).map(t => (
                <span key={t} style={{
                  fontSize: 7.5, fontWeight: 600, padding:'2px 6px',
                  borderRadius: 999, background: PN.PINK_SOFT, color: PN.PINK_DARK,
                }}>{t}</span>
              ))}
            </div>
          )}

          <div style={{fontSize: 8, color: MUTED, lineHeight: 1.4, marginTop: 8}}>
            Benvenuti al Cacio e Pepe! Cucina romana tradizionale con un tocco contemporaneo…
          </div>

          {/* Section header */}
          <div style={{
            marginTop: 12, fontSize: 9.5, fontWeight: 700, color: TEXT, letterSpacing: 0.2,
          }}>CHEF CONSIGLIA</div>
        </div>

        {/* Dish cards */}
        <div style={{flex:1, overflow:'hidden', padding:'8px 14px 0', display:'flex', flexDirection:'column', gap: 6}}>
          {[
            {n:'Cacio e Pepe', p:'14,00', c:'#F4D9A0'},
            {n:'Carbonara', p:'15,00', c:'#E8C28A'},
          ].map((d,i)=>(
            <div key={i} style={{
              background: PN.WHITE, borderRadius: 10, padding: 6,
              display:'flex', gap: 8, boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{width: 38, height: 38, borderRadius: 7, background: d.c, flexShrink: 0}}/>
              <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', justifyContent:'center'}}>
                <div style={{fontSize: 9.5, fontWeight: 700, color: TEXT}}>{d.n}</div>
                <div style={{fontSize: 9.5, fontWeight: 800, color: TEXT, marginTop: 1}}>€ {d.p}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div style={{
          margin:'8px 10px 10px', display:'flex', gap: 5, flexShrink: 0,
        }}>
          <button style={{
            flex: 1, padding:'7px 0', borderRadius: 999,
            background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
            fontSize: 9, fontWeight: 700, color: TEXT, cursor:'pointer',
          }}>Menu</button>
          <button style={{
            flex: 1.4, padding:'7px 0', borderRadius: 999,
            background: WINE, border:'none',
            fontSize: 9, fontWeight: 700, color:'#fff', cursor:'pointer',
          }}>Prenota</button>
        </div>

        {/* Social row (only if any) */}
        {social.length > 0 && (
          <div style={{
            position:'absolute', top: 4, right: 26,
            display:'flex', gap: 3,
          }}>
            {social.includes('ig') && <span style={{width:8,height:8,borderRadius:2,background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)'}}/>}
            {social.includes('fb') && <span style={{width:8,height:8,borderRadius:2,background:'#1877F2'}}/>}
            {social.includes('tt') && <span style={{width:8,height:8,borderRadius:2,background:'#000'}}/>}
            {social.includes('yt') && <span style={{width:8,height:8,borderRadius:2,background:'#FF0000'}}/>}
            {social.includes('tw') && <span style={{width:8,height:8,borderRadius:2,background:'#000'}}/>}
            {social.includes('li') && <span style={{width:8,height:8,borderRadius:2,background:'#0A66C2'}}/>}
          </div>
        )}
      </div>
    </div>
  );
}

window.ImpWithPreview = ImpWithPreview;
window.ImpSaveBar = ImpSaveBar;
window.VetrinaMiniPreview = VetrinaMiniPreview;

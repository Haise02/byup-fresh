// Step 1 — Carica menu.
//
// Il header (stepper + logo) è in onboarding-app.jsx. Qui solo il contenuto.
// L'overlay di processing è renderizzato dall'app, attivato da onAnalyze().

function Step1Upload({onAnalyze}) {
  const [file, setFile] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [url, setUrl] = React.useState('');

  const pickMockFile = () => {
    setFile({name: 'menu-cacioepepe.pdf', size: '1.4 MB', type: 'pdf'});
  };

  const canSubmit = !!file || url.length > 6;

  return (
    <div style={{
      padding: '48px 48px 64px',
      background: ONB.BG_SOFT,
      minHeight: 760,
    }}>
      <div style={{maxWidth: 720, margin: '0 auto'}}>

        {/* Eyebrow chip BRAND_TINT — è il punto di "vivacità identitaria":
            mantiene il pattern small-caps Linear-style ma comunica brand subito.
            Coerente con i numbered badge nelle sezioni dei sub-step. */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: ONB.BRAND_TINT, color: ONB.BRAND_DARK,
          fontSize: 12, fontWeight: 600,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: 999, background: ONB.BRAND, display: 'inline-block',
          }}/>
          Step 1 di 4
        </div>

        {/* Hero — left-aligned. Headline 32px coerente con scala. */}
        <h1 style={{
          fontSize: 32, fontWeight: 600, lineHeight: 1.2,
          letterSpacing: '-0.02em', margin: '0 0 12px', color: ONB.TEXT,
        }}>
          Carica il menù del tuo locale. Al resto ci pensiamo noi.
        </h1>
        <p style={{
          fontSize: 16, fontWeight: 400, lineHeight: 1.4,
          color: ONB.MUTED, margin: '0 0 32px', maxWidth: 560,
        }}>
          Bastano un PDF, delle foto o il link al sito.
          Importeremo automaticamente piatti, prezzi, allergeni e sezioni:
          potrai sempre modificare tutto prima di pubblicare.
        </p>

        {/* Dropzone — singolo file slot. Stato "vuoto" usa un'animazione continua
            in loop (glass-shimmer = sweep di luce orizzontale ogni 5.2s) per
            comunicare che la zona è "viva e in attesa". L'icona dentro respira
            (scale +1.2% ogni 4.8s) ed è circondata da un pulse-glow espansivo
            che invita visivamente al click senza essere intrusivo.
            Lift on hover preservato per feedback diretto. */}
        <div
          className={!file ? 'glass-shimmer' : ''}
          onDragOver={(e) => {e.preventDefault(); setDragOver(true);}}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {e.preventDefault(); setDragOver(false); pickMockFile();}}
          onClick={!file ? pickMockFile : undefined}
          onMouseEnter={(e) => {
            if (file) return;
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(15, 17, 21, 0.10), 0 4px 12px -4px rgba(190, 24, 93, 0.08)';
            e.currentTarget.style.borderColor = ONB.BRAND;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 0 rgba(15, 17, 21, 0.04)';
            e.currentTarget.style.borderColor = dragOver ? ONB.BRAND : 'rgba(15, 17, 21, 0.16)';
          }}
          style={{
            background: '#fff',
            border: `1.5px dashed ${dragOver ? ONB.BRAND : 'rgba(15, 17, 21, 0.16)'}`,
            borderRadius: 12,
            padding: file ? 20 : 44,
            cursor: file ? 'default' : 'pointer',
            boxShadow: '0 1px 0 rgba(15, 17, 21, 0.04)',
            transition: 'border-color 200ms ease-out, transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease-out',
          }}
        >
          {!file ? (
            <div style={{textAlign: 'center', position: 'relative', zIndex: 3}}>
              {/* Icon container BRAND_TINT 64×64 — più presente del 48 grigio di prima.
                  Il colore BRAND comunica "questo è il punto di azione" senza essere CTA.
                  glass-breathe + glass-float-soft (sfasate) creano un movimento
                  vivo ma calmo; il pulse-glow nello pseudo-elemento è il "richiamo". */}
              <div
                className="glass-breathe glass-float-soft"
                style={{
                  width: 64, height: 64, borderRadius: 12,
                  background: ONB.BRAND_TINT, color: ONB.BRAND,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 8px 20px -6px rgba(242, 107, 122, 0.35)',
                }}>
                {/* Ring espansivo dietro l'icona, animato con glass-pulse-glow.
                    Posizionato come absolute con z-index 0 così non altera il layout. */}
                <span aria-hidden="true" className="glass-pulse-glow" style={{
                  position:'absolute', inset: -6, borderRadius: 16,
                  pointerEvents: 'none', zIndex: -1,
                }}/>
                <OnbIcon.Upload size={26} color={ONB.BRAND}/>
              </div>
              <div style={{
                fontSize: 17, fontWeight: 600, color: ONB.TEXT,
                marginBottom: 4, lineHeight: 1.4, letterSpacing: '-0.01em',
              }}>
                Trascina o carica qui PDF / foto del menù
              </div>
              <div style={{fontSize: 14, color: ONB.MUTED, lineHeight: 1.4}}>
                Oppure clicca e carica il file
              </div>

              {/* Format tags — sotto, sobri, no pill colorati */}
              <div style={{
                display: 'flex', gap: 16, justifyContent: 'center',
                marginTop: 20, paddingTop: 20,
                borderTop: '1px solid rgba(15, 17, 21, 0.06)',
              }}>
                {[
                  {Icon: OnbIcon.PDF,    label: 'PDF'},
                  {Icon: OnbIcon.Image,  label: 'Foto / Screenshot'},
                  {Icon: OnbIcon.Camera, label: 'Scatta foto'},
                ].map(({Icon, label}) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 500, color: ONB.MUTED,
                  }}>
                    <Icon size={14} color={ONB.MUTED}/>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <FilePreview file={file} onRemove={() => setFile(null)}/>
          )}
        </div>

        {/* Divider — thin, label all-lower per non urlare */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '24px 0',
        }}>
          <div style={{flex: 1, height: 1, background: 'rgba(15, 17, 21, 0.08)'}}/>
          <span style={{fontSize: 12, color: ONB.MUTED, fontWeight: 500}}>oppure</span>
          <div style={{flex: 1, height: 1, background: 'rgba(15, 17, 21, 0.08)'}}/>
        </div>

        {/* Link import — row compatta */}
        <div style={{
          background: '#fff', border: '1px solid rgba(15, 17, 21, 0.08)',
          borderRadius: 10, padding: 20,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: ONB.TEXT, marginBottom: 4,
          }}>
            Hai una pagina web?
          </div>
          <div style={{
            fontSize: 13, color: ONB.MUTED, marginBottom: 16, lineHeight: 1.4,
          }}>
            Incolla il link: importeremo menù, orari e info del locale.
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <UrlInput value={url} onChange={setUrl}/>
            <button
              onClick={url.length > 6 ? pickMockFile : undefined}
              disabled={url.length <= 6}
              style={{
                height: 44, padding: '0 20px',
                background: url.length > 6 ? ONB.ACTION_SECONDARY : 'rgba(15, 17, 21, 0.08)',
                color: url.length > 6 ? '#fff' : ONB.MUTED_LIGHT,
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                cursor: url.length > 6 ? 'pointer' : 'not-allowed',
                transition: 'background 150ms ease-out',
              }}
            >
              Importa
            </button>
          </div>
        </div>

        {/* Footer — solo CTA primaria centrata.
            Niente link "configurazione manuale" né "salva e riprendi dopo": lo step 1
            ha una sola decisione da prendere (carica e analizza), non distraibile. */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          marginTop: 32,
        }}>
          <PrimaryCta
            onClick={canSubmit ? onAnalyze : undefined}
            disabled={!canSubmit}
          >
            Continua
            <OnbIcon.ArrowRight size={14} color="#fff"/>
          </PrimaryCta>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// File preview row dentro la dropzone — appare dopo selezione del file
// ─────────────────────────────────────────────────────────────────────────

function FilePreview({file, onRemove}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      {/* File-type tag — colore brand tint per coordinarsi con la dropzone empty state */}
      <div style={{
        width: 40, height: 48, borderRadius: 6,
        background: ONB.BRAND_TINT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 600, color: ONB.BRAND_DARK, flexShrink: 0,
        letterSpacing: '0.04em',
      }}>
        {file.type.toUpperCase()}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: ONB.TEXT,
          marginBottom: 2, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {file.name}
        </div>
        <div style={{fontSize: 12, color: ONB.MUTED, lineHeight: 1.4}}>
          {file.size} · pronto per l'analisi
        </div>
      </div>
      <button
        onClick={(e) => {e.stopPropagation(); onRemove();}}
        aria-label="Rimuovi file"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ONB.MUTED, borderRadius: 6,
          transition: 'background 150ms ease-out',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = ONB.BG}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <OnbIcon.Trash size={16} color={ONB.MUTED}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Reusable URL input — height/border/padding allineati allo standard form
// ─────────────────────────────────────────────────────────────────────────

function UrlInput({value, onChange}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = focused ? ONB.BRAND : 'rgba(15, 17, 21, 0.12)';
  const borderWidth = focused ? 1.5 : 1;
  return (
    <input
      type="url"
      placeholder="https://..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        flex: 1, height: 44,
        padding: focused ? '0 13.5px' : '0 14px',
        background: '#fff',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: 8,
        fontSize: 16, fontWeight: 400, fontFamily: 'inherit',
        color: ONB.TEXT, outline: 'none',
        transition: 'border-color 150ms ease-out',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PrimaryCta — riutilizzato in tutti gli step. Definito qui perché step 1
// è il primo a caricarsi e serve a tutti i successivi via window.PrimaryCta.
// ─────────────────────────────────────────────────────────────────────────

function PrimaryCta({onClick, disabled, children}) {
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
    </button>
  );
}

// SecondaryCta — outline, neutro, utilizzato per "Indietro" o azioni alternate
function SecondaryCta({onClick, disabled, children}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 44, padding: '0 20px',
        background: '#fff',
        color: ONB.TEXT,
        border: `1px solid ${hover ? 'rgba(15, 17, 21, 0.18)' : 'rgba(15, 17, 21, 0.10)'}`,
        borderRadius: 8,
        fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color 150ms ease-out',
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      {children}
    </button>
  );
}

// Field reusabile — etichetta sopra, input 44px allineato standard form
function OnbField({label, value, onChange, placeholder, type = 'text', wide, optional}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = focused ? ONB.BRAND : 'rgba(15, 17, 21, 0.12)';
  const borderWidth = focused ? 1.5 : 1;
  return (
    <div style={wide ? {gridColumn: '1 / -1'} : {}}>
      <label style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        fontSize: 13, fontWeight: 500, color: ONB.TEXT,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        <span>{label}</span>
        {optional && (
          <span style={{fontSize: 12, color: ONB.MUTED_LIGHT, fontWeight: 400}}>
            opzionale
          </span>
        )}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%', height: 44,
          padding: focused ? '0 13.5px' : '0 14px',
          background: '#fff',
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: 8,
          fontSize: 16, fontWeight: 400, fontFamily: 'inherit',
          color: ONB.TEXT, outline: 'none',
          transition: 'border-color 150ms ease-out',
        }}
      />
    </div>
  );
}

// Textarea reusabile — stessa logica di OnbField, multiline
function OnbTextarea({label, value, onChange, placeholder, rows = 3, wide, optional}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = focused ? ONB.BRAND : 'rgba(15, 17, 21, 0.12)';
  const borderWidth = focused ? 1.5 : 1;
  return (
    <div style={wide ? {gridColumn: '1 / -1'} : {}}>
      <label style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        fontSize: 13, fontWeight: 500, color: ONB.TEXT,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        <span>{label}</span>
        {optional && (
          <span style={{fontSize: 12, color: ONB.MUTED_LIGHT, fontWeight: 400}}>
            opzionale
          </span>
        )}
      </label>
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: focused ? '11.5px 13.5px' : '12px 14px',
          background: '#fff',
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: 8,
          fontSize: 16, fontWeight: 400, fontFamily: 'inherit',
          color: ONB.TEXT, outline: 'none', lineHeight: 1.4, resize: 'vertical',
          transition: 'border-color 150ms ease-out',
        }}
      />
    </div>
  );
}

// Card section reusabile — pattern Byup: radius 12, shadow doppia (resting + lift
// soft 4px), border tenue 0.06. Più "moderna" del 10/0.08 precedente: la card
// staccata dal canvas, ma senza la pesantezza della shadow elevated del modal.
//
// variant="glass" → soft glass tipo B (vedi byup-glass.jsx): tint warm
// semitrasparente + specular highlight + ring sottile + lift on hover.
// Usare per card "hero" di sezione, non per ogni card della pagina —
// rompe la pace tipografica se applicato ovunque.
// OnbCard — 3 varianti del sistema 80/10/10:
//   • default / "classic" → W1 White Classic (workhorse, ~80% delle card)
//   • "aurora"            → L2 Aurora glass warm-pink (~10%, momenti caldi/celebrativi)
//   • "sunset"            → D3 Sunset glass dark warm (~10%, momenti drammatici/AI)
//
// "glass" è mantenuto come alias di "aurora" per le card esistenti che lo usano.
function OnbCard({children, padding, variant}) {
  const isAurora = variant === 'aurora' || variant === 'glass';
  const isSunset = variant === 'sunset';

  let surface;
  if (isSunset) {
    surface = {
      background: 'linear-gradient(180deg, rgba(58, 28, 22, 0.62) 0%, rgba(30, 12, 10, 0.70) 100%)',
      backdropFilter: 'blur(22px) saturate(170%)',
      WebkitBackdropFilter: 'blur(22px) saturate(170%)',
      boxShadow:
        'inset 0 1px 0 rgba(255, 200, 170, 0.22), ' +
        'inset 0 0 0 1px rgba(255, 150, 110, 0.16), ' +
        '0 14px 36px -10px rgba(120, 50, 15, 0.55), ' +
        '0 4px 10px -4px rgba(120, 50, 15, 0.30)',
      border: 'none',
      color: '#F3F4F6',
    };
  } else if (isAurora) {
    // L2 Aurora soft wash multi-color — pink + lavender + cream mesh su base
    // sfumata pink→lavender. Stesso DNA della variant L2 nella preview themes.
    surface = {
      background:
        'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
        'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
        'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
        'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)',
      border: '1px solid rgba(190, 175, 220, 0.14)',
      boxShadow: '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 16px rgba(15, 17, 21, 0.03)',
    };
  } else {
    surface = {
      background: '#fff',
      border: '1px solid rgba(15, 17, 21, 0.06)',
      boxShadow: '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 16px rgba(15, 17, 21, 0.03)',
    };
  }

  return (
    <div className="glass-lift-hover" style={{
      ...surface,
      borderRadius: 12,
      padding: padding ?? 24,
    }}>
      {children}
    </div>
  );
}

// Card section header — badge numerico in BRAND_TINT/BRAND_DARK = "tocco identità Byup"
// applicato a un elemento ricorrente. Sostituisce il badge grigio neutro precedente
// senza rompere la regola "una sola pennellata brand per schermata": il numero è
// sempre dentro una card di sezione (≠ CTA), quindi non compete col CTA primario.
function OnbSectionHeader({number, title, subtitle}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      marginBottom: 20,
    }}>
      {number != null && (
        <div style={{
          width: 24, height: 24, borderRadius: 999,
          background: ONB.BRAND_TINT, color: ONB.BRAND_DARK,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, flexShrink: 0,
        }}>
          {number}
        </div>
      )}
      <div>
        <div style={{
          fontSize: 16, fontWeight: 600, color: ONB.TEXT,
          letterSpacing: '-0.01em', lineHeight: 1.4,
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontSize: 13, fontWeight: 400, color: ONB.MUTED,
            marginTop: 2, lineHeight: 1.4,
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

window.Step1Upload = Step1Upload;
window.PrimaryCta = PrimaryCta;
window.SecondaryCta = SecondaryCta;
window.OnbField = OnbField;
window.OnbTextarea = OnbTextarea;
window.OnbCard = OnbCard;
window.OnbSectionHeader = OnbSectionHeader;

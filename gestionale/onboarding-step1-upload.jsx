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
      minHeight: '100%',
      background: ONB.BG_SOFT,
      /* Stesso padding-top e stesso ancoraggio in alto dello step 2, così i due
         blocchi di testo partono esattamente alla stessa quota dello stage. */
      padding: '32px 80px',
      display: 'flex', alignItems: 'flex-start',
    }}>
      {/* Griglia a due colonne: a sinistra la promessa, a destra il pannello
          d'azione. Sostituisce la colonna centrata stretta, che dentro un frame
          da 1440 lasciava vuoti larghi ai lati e un blocco di spazio morto sotto
          la CTA. Le colonne sono centrate fra loro sull'asse verticale e il
          pannello detta l'altezza del blocco. */}
      <div style={{
        width: '100%', maxWidth: 1240, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 560px',
        gap: 72, alignItems: 'start',
      }}>

        {/* ─── Colonna sinistra — la promessa ─────────────────────────── */}
        <div>
          <h1 style={{
            /* 46 è la misura massima a cui "Carica il menù del tuo locale."
               resta su una riga nella colonna: sopra, il <br/> non basta e
               "locale." resta orfano su una terza riga. */
            fontSize: 46, fontWeight: 600, lineHeight: 1.14,
            letterSpacing: '-0.025em', margin: '0 0 18px', color: ONB.TEXT,
          }}>
            Carica il menù del tuo locale.<br/>Al resto ci pensiamo noi.
          </h1>

          <p style={{
            fontSize: 19, fontWeight: 400, lineHeight: 1.5,
            color: ONB.MUTED, margin: '0 0 32px', maxWidth: 480,
          }}>
            Bastano un PDF, delle foto o il link al tuo sito.
          </p>

          {/* I dettagli dell'import stanno in lista, non nel sottotitolo: sono
              tre promesse distinte e in elenco si leggono come garanzie, oltre a
              dare alla colonna l'altezza necessaria a reggere il pannello. */}
          <ul style={{listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 18}}>
            {[
              'Piatti, prezzi e sezioni estratti dal documento',
              'Allergeni e ingredienti riconosciuti in automatico',
              'Rivedi e modifichi tutto prima di pubblicare',
            ].map((t) => (
              <li key={t} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                fontSize: 17, lineHeight: 1.45, color: ONB.TEXT,
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999, flexShrink: 0, marginTop: 1,
                  background: ONB.GREEN_SOFT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <OnbIcon.Check size={13} color={ONB.GREEN}/>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ─── Colonna destra — pannello d'azione ─────────────────────── */}
        {/* Un'unica superficie bianca raccoglie le tre cose che l'utente può
            fare qui (file, link, continua): prima erano tre blocchi slegati su
            canvas, ed è ciò che faceva leggere la schermata come disallineata. */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(15, 17, 21, 0.08)',
          borderRadius: 18,
          padding: 32,
          boxShadow: '0 1px 2px rgba(15, 17, 21, 0.04), 0 16px 40px -20px rgba(15, 17, 21, 0.14)',
        }}>

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
              e.currentTarget.style.borderColor = ONB.BRAND;
              e.currentTarget.style.background = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = dragOver ? ONB.BRAND : 'rgba(15, 17, 21, 0.16)';
              e.currentTarget.style.background = file ? '#fff' : ONB.BG_SOFT;
            }}
            style={{
              /* Dentro il pannello bianco la dropzone si distingue per fondo, non
                 per ombra: niente lift on hover, che dentro una card sembrerebbe
                 staccare un pezzo di pannello. */
              background: file ? '#fff' : ONB.BG_SOFT,
              border: `1.5px dashed ${dragOver ? ONB.BRAND : 'rgba(15, 17, 21, 0.16)'}`,
              borderRadius: 12,
              padding: file ? 18 : '48px 24px',
              /* Altezza costante fra stato vuoto e file caricato: senza, il
                 pannello si accorciava di ~200px al drop e l'intero blocco
                 saltava (è centrato verticalmente). */
              minHeight: 268,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              cursor: file ? 'default' : 'pointer',
              transition: 'border-color 200ms ease-out, background 200ms ease-out',
            }}
          >
            {!file ? (
              <div style={{textAlign: 'center', position: 'relative', zIndex: 3}}>
                {/* Icon container BRAND_TINT — il colore BRAND comunica "questo è il
                    punto di azione" senza essere CTA. glass-breathe + glass-float-soft
                    (sfasate) creano un movimento vivo ma calmo; il pulse-glow nello
                    pseudo-elemento è il "richiamo". */}
                <div
                  className="glass-breathe glass-float-soft"
                  style={{
                    width: 68, height: 68, borderRadius: 16,
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
                    position:'absolute', inset: -6, borderRadius: 18,
                    pointerEvents: 'none', zIndex: -1,
                  }}/>
                  <OnbIcon.Upload size={28} color={ONB.BRAND}/>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 600, color: ONB.TEXT,
                  marginBottom: 5, lineHeight: 1.4, letterSpacing: '-0.01em',
                }}>
                  Trascina qui il menù, o clicca per caricarlo
                </div>
                <div style={{fontSize: 16, color: ONB.MUTED, lineHeight: 1.4}}>
                  Un PDF o le foto delle pagine
                </div>

                {/* Format tags — sotto, sobri, no pill colorati */}
                <div style={{
                  display: 'flex', gap: 18, justifyContent: 'center',
                  marginTop: 22, paddingTop: 22,
                  borderTop: '1px solid rgba(15, 17, 21, 0.06)',
                }}>
                  {[
                    {Icon: OnbIcon.PDF,    label: 'PDF'},
                    {Icon: OnbIcon.Image,  label: 'Foto'},
                    {Icon: OnbIcon.Camera, label: 'Scatta foto'},
                  ].map(({Icon, label}) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 15, fontWeight: 500, color: ONB.MUTED,
                    }}>
                      <Icon size={15} color={ONB.MUTED}/>
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
            <span style={{fontSize: 14, color: ONB.MUTED, fontWeight: 500}}>oppure</span>
            <div style={{flex: 1, height: 1, background: 'rgba(15, 17, 21, 0.08)'}}/>
          </div>

          {/* Import da link — riga singola: dentro un pannello da 520 l'input e il
              bottone stanno comodi affiancati. */}
          <label style={{
            display: 'block',
            fontSize: 16, fontWeight: 500, color: ONB.TEXT, marginBottom: 10,
          }}>
            Incolla il link della tua pagina web
          </label>
          <div style={{display: 'flex', gap: 8}}>
            <UrlInput value={url} onChange={setUrl}/>
            <button
              onClick={url.length > 6 ? pickMockFile : undefined}
              disabled={url.length <= 6}
              style={{
                height: 44, padding: '0 20px', flexShrink: 0,
                background: url.length > 6 ? ONB.ACTION_SECONDARY : 'rgba(15, 17, 21, 0.08)',
                color: url.length > 6 ? '#fff' : ONB.MUTED_LIGHT,
                border: 'none', borderRadius: 8,
                fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
                cursor: url.length > 6 ? 'pointer' : 'not-allowed',
                transition: 'background 150ms ease-out',
              }}
            >
              Importa
            </button>
          </div>

          {/* CTA a piena larghezza del pannello: chiude la card come submit del
              blocco, invece di fluttuare centrata su canvas.
              Niente link "configurazione manuale" né "salva e riprendi dopo": lo
              step 1 ha una sola decisione da prendere, non distraibile. */}
          <div style={{
            marginTop: 28, paddingTop: 28,
            borderTop: '1px solid rgba(15, 17, 21, 0.06)',
          }}>
            <PrimaryCta
              onClick={canSubmit ? onAnalyze : undefined}
              disabled={!canSubmit}
              full
            >
              Continua
              <OnbIcon.ArrowRight size={14} color="#fff"/>
            </PrimaryCta>
          </div>
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
        fontSize: 12, fontWeight: 600, color: ONB.BRAND_DARK, flexShrink: 0,
        letterSpacing: '0.04em',
      }}>
        {file.type.toUpperCase()}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          fontSize: 16, fontWeight: 600, color: ONB.TEXT,
          marginBottom: 2, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {file.name}
        </div>
        <div style={{fontSize: 14, color: ONB.MUTED, lineHeight: 1.4}}>
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
        fontSize: 18, fontWeight: 400, fontFamily: 'inherit',
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

// `full` = larghezza piena del contenitore, per le CTA che chiudono un pannello
// (step 1). Omesso, il bottone resta hug-content come in tutti gli altri step.
function PrimaryCta({onClick, disabled, children, full}) {
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
        height: full ? 48 : 44, padding: '0 20px',
        width: full ? '100%' : undefined,
        background: bg,
        color: disabled ? ONB.MUTED_LIGHT : '#fff',
        border: 'none', borderRadius: 999,
        fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 150ms ease-out',
        display: 'flex', alignItems: 'center', gap: 8,
        justifyContent: full ? 'center' : 'flex-start',
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
        fontSize: 16, fontWeight: 500, fontFamily: 'inherit',
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
        fontSize: 15, fontWeight: 500, color: ONB.TEXT,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        <span>{label}</span>
        {optional && (
          <span style={{fontSize: 14, color: ONB.MUTED_LIGHT, fontWeight: 400}}>
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
          fontSize: 18, fontWeight: 400, fontFamily: 'inherit',
          color: ONB.TEXT, outline: 'none',
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
      marginBottom: 16,
    }}>
      {number != null && (
        <div style={{
          width: 24, height: 24, borderRadius: 999,
          background: ONB.BRAND_TINT, color: ONB.BRAND_DARK,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, flexShrink: 0,
        }}>
          {number}
        </div>
      )}
      <div>
        <div style={{
          fontSize: 18, fontWeight: 600, color: ONB.TEXT,
          letterSpacing: '-0.01em', lineHeight: 1.4,
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontSize: 15, fontWeight: 400, color: ONB.MUTED,
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
window.OnbCard = OnbCard;
window.OnbSectionHeader = OnbSectionHeader;

// Config completa — post-onboarding wizard for vetrina + personale

function ConfigCompletaApp() {
  const [step, setStep] = React.useState('vetrina'); // 'vetrina' | 'personale' | 'done'

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      <PnSidebar active="impostazioni-shadow"/>

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0}}>

        {/* Header — Apple tone: white-off bg, hairline border 0.06 alpha,
            niente font-weight 800 (sostituito con 600 + letter-spacing tighter). */}
        <div style={{
          padding: '24px 32px 18px',
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
          background: PN.WHITE_OFF,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <div style={{flex:1, minWidth:0}}>
            {/* Eyebrow chip BRAND_TINT con dot — pattern coerente con onboarding */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: PN.PINK_BG_SOFT, color: PN.PINK_DARK,
              padding: '4px 10px', borderRadius: 999,
              fontSize: 11, fontWeight: 600, marginBottom: 10, letterSpacing: 0.4,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: 999, background: PN.PINK,
                display: 'inline-block',
              }}/>
              CONFIGURAZIONE COMPLETA · OPZIONALE
            </div>
            <h1 style={{
              fontWeight: 600,
              fontSize: 30, margin: '0 0 6px', letterSpacing: '-0.02em', color: PN.TEXT,
            }}>
              Completa la tua presenza su byup.
            </h1>
            <p style={{fontSize: 13.5, color: PN.MUTED, margin: 0, maxWidth: 680, lineHeight: 1.5}}>
              Aggiungi le foto, descrivi l'atmosfera del locale e invita il tuo staff. Puoi compilare adesso o tornare qui in un secondo momento dalle Impostazioni.
            </p>
          </div>

          <div style={{display:'flex', gap:10, flexShrink:0}}>
            {/* Apple-style neutral button — gradient sottile + inset highlight,
                NON bianco-su-bianco piatto. Hover gestito via :hover attr. */}
            <a href="byup Panoramica.html" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              border: `1px solid ${PN.BORDER_LIGHT}`,
              borderRadius: 9,
              fontSize: 13, fontWeight: 600, color: PN.TEXT,
              textDecoration: 'none',
              background: PN.BTN_NEUTRAL,
              boxShadow: PN.INSET_HIGHLIGHT,
              transition: 'background 150ms ease-out',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER}
            onMouseLeave={(e) => e.currentTarget.style.background = PN.BTN_NEUTRAL}
            >
              Salta e vai alla Panoramica →
            </a>
          </div>
        </div>

        {/* Stepper — bg coerente col header (off-white) */}
        <div style={{
          display: 'flex', gap: 0, padding: '14px 32px',
          background: PN.WHITE_OFF,
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
        }}>
          <Stepper
            num="1" label="Vetrina pubblica"
            sub="Foto, descrizione, atmosfera"
            active={step==='vetrina'} done={step!=='vetrina'}
            onClick={()=>setStep('vetrina')}
          />
          <StepperConnector done={step!=='vetrina'}/>
          <Stepper
            num="2" label="Personale"
            sub="Invita il tuo staff"
            active={step==='personale'} done={step==='done'}
            onClick={()=>setStep('personale')}
          />
        </div>

        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: '24px 32px 40px',
          background: PN.BG,
        }}>
          {step === 'vetrina' && (
            <>
              <ImpVetrina/>
              <FooterBar
                onBack={null}
                onNext={()=>setStep('personale')}
                nextLabel="Continua a Personale"
              />
            </>
          )}
          {step === 'personale' && (
            <>
              <ImpPersonale/>
              <FooterBar
                onBack={()=>setStep('vetrina')}
                onNext={()=>{ window.location.href = 'byup Panoramica.html'; }}
                nextLabel="Completa e vai alla Panoramica"
                primary
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Stepper({num, label, sub, active, done, onClick}){
  const tone = done ? '#16A34A' : active ? '#C2185B' : PN.MUTED;
  const bg = done ? '#DCFCE7' : active ? '#FFE5EC' : PN.BG;
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'8px 14px 8px 8px', border:'none',
      background: active ? bg : 'transparent', borderRadius:10,
      cursor:'pointer', fontFamily:'inherit',
    }}>
      <div style={{
        width:30, height:30, borderRadius:'50%',
        background: bg, color: tone,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:800, flexShrink:0,
        border: `1.5px solid ${tone}`,
      }}>{done ? '✓' : num}</div>
      <div style={{textAlign:'left'}}>
        <div style={{fontSize:13, fontWeight:700, color: tone}}>{label}</div>
        <div style={{fontSize:11, color: PN.MUTED, marginTop:1}}>{sub}</div>
      </div>
    </button>
  );
}

function StepperConnector({done}){
  return (
    <div style={{
      flex:'0 0 60px', height:1, alignSelf:'center',
      background: done ? '#16A34A' : PN.BORDER, margin:'0 6px',
    }}/>
  );
}

function FooterBar({onBack, onNext, nextLabel, primary}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 24, paddingTop: 18, borderTop: `1px solid ${PN.BORDER_HAIR}`,
    }}>
      {onBack ? (
        <ApBtn variant="neutral" onClick={onBack}>← Indietro</ApBtn>
      ) : <div/>}
      <ApBtn variant={primary ? 'brand' : 'dark'} onClick={onNext}>
        {nextLabel} →
      </ApBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ApBtn — bottone Apple-style (gradient sottile + inset highlight + border alpha).
// 3 varianti: neutral (sfumature di bianco), dark (top→bottom 2A→15), brand (BRAND).
// Niente background piatto: il gradient è il "lente" macOS. Niente shadow tinted
// pesante: solo un inset highlight di 1px + ombra base 1px sub-pixel.
// ─────────────────────────────────────────────────────────────────────────

function ApBtn({variant = 'neutral', onClick, children}) {
  const [hover, setHover] = React.useState(false);
  const styles = {
    neutral: {
      bg:    hover ? PN.BTN_NEUTRAL_HOVER : PN.BTN_NEUTRAL,
      color: PN.TEXT,
      border: `1px solid ${PN.BORDER_LIGHT}`,
      shadow: PN.INSET_HIGHLIGHT,
    },
    dark: {
      bg:    hover ? PN.BTN_DARK_HOVER : PN.BTN_DARK,
      color: '#fff',
      border: '1px solid rgba(0, 0, 0, 0.32)',
      shadow: PN.INSET_HIGHLIGHT_DARK,
    },
    brand: {
      bg:    hover ? PN.BTN_BRAND_HOVER : PN.BTN_BRAND,
      color: '#fff',
      border: '1px solid rgba(180, 30, 35, 0.40)',
      shadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)`,
    },
  }[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: styles.bg, color: styles.color, border: styles.border,
        boxShadow: styles.shadow,
        padding: '10px 20px', borderRadius: 9,
        fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
        display: 'flex', alignItems: 'center', gap: 7,
      }}
    >
      {children}
    </button>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className="frame" data-screen-label="Configurazione completa">
    <ConfigCompletaApp/>
  </div>
);

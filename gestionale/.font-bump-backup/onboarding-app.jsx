// Onboarding orchestratore.
//
// FLOW
//   Step 1 — Carica menu (overlay processing in-page durante l'elaborazione)
//   Step 2 — Il tuo locale (sub-step: info → pagamenti → fiscale)
//   Step 3 — Sale e tavoli
//   Step 4 — Verifica menu (schermata finale di conferma + 2 CTA)
//
// PERCHÉ COSÌ
// • L'overlay di processing è in-page e non un "step" autonomo: il processing è uno
//   stato transitorio, non una tappa che vale uno slot nello stepper.
// • I sub-step di "Il tuo locale" stanno sotto un solo nodo nello stepper principale;
//   la sub-progress è un secondario sottile, non gerarchico col main stepper.

const STEPS = [
  { id: 1, label: 'Carica menù' },
  { id: 2, label: 'Il tuo locale' },
  { id: 3, label: 'Sale e tavoli' },
  { id: 4, label: 'Verifica menù' },
];

const LOCALE_SUBSTEPS = [
  { id: 'info',      label: 'Informazioni' },
  { id: 'pagamenti', label: 'Pagamenti' },
];

function OnboardingApp() {
  const [step, setStep] = React.useState(1);
  const [subStep, setSubStep] = React.useState('info');
  const [processing, setProcessing] = React.useState(false);

  // Stato condiviso fra step (mock — sufficient per demo statica).
  // Anagrafica + regime fiscale vivono qui dentro: una sola card "Il tuo locale"
  // assorbe sia i dati commerciali sia il regime IVA, senza un sub-step dedicato.
  const [venue, setVenue] = React.useState({
    name: 'Cacio e Pepe',
    piva: '',
    address: '',
    civico: '',
    cap: '',
    city: 'Roma',
    phone: '',
    regime: 'ordinario',
  });
  const [payments, setPayments] = React.useState({
    stripeStatus: 'disconnected',
  });
  const [rooms, setRooms] = React.useState([
    { id: 'r1', name: 'Sala principale', tables: 12, isDefault: true },
  ]);

  const startProcessing = () => setProcessing(true);
  const finishProcessing = () => {
    setProcessing(false);
    setStep(2);
    setSubStep('info');
  };

  const goNextLocale = () => {
    const idx = LOCALE_SUBSTEPS.findIndex(s => s.id === subStep);
    if (idx < LOCALE_SUBSTEPS.length - 1) setSubStep(LOCALE_SUBSTEPS[idx + 1].id);
    else setStep(3);
  };
  const goBackLocale = () => {
    const idx = LOCALE_SUBSTEPS.findIndex(s => s.id === subStep);
    if (idx > 0) setSubStep(LOCALE_SUBSTEPS[idx - 1].id);
    else setStep(1);
  };

  return (
    <>
      <div className="frame" data-screen-label={`Step ${step}${step === 2 ? ' · ' + subStep : ''}`}>
        <GlassMeshSubstrate/>
        <OnbHeader step={step} subStep={subStep}/>

        {/* Banner floating "menù in elaborazione" — visibile solo in step 2 e 3.
            Sparisce quando arriva su step 4 (anteprima menu): la promessa è mantenuta. */}
        {step >= 2 && step < 4 && <ProcessingBanner step={step}/>}

        {/* step-stage wrapper con key={step}: forza remount alla cambio step,
            facendo ripartire la CSS animation di entrata (scale-up + fade) —
            è la "dissoluzione modal con scale-up del contenuto sottostante"
            richiesta dal brief al termine del processing overlay. */}
        <div className="step-stage" key={step}>
          {step === 1 && <Step1Upload onAnalyze={startProcessing}/>}

          {step === 2 && (
            <Step2Locale
              subStep={subStep}
              setSubStep={setSubStep}
              venue={venue} setVenue={setVenue}
              payments={payments} setPayments={setPayments}
              onNext={goNextLocale}
              onBack={goBackLocale}
            />
          )}

          {step === 3 && (
            <Step3SaleTavoli
              rooms={rooms} setRooms={setRooms}
              onNext={() => setStep(4)}
              onBack={() => { setStep(2); setSubStep('pagamenti'); }}
            />
          )}

          {step === 4 && (
            <Step4Verifica
              venue={venue}
              rooms={rooms}
              onBack={() => setStep(3)}
              onComplete={(dest) => {
                if (dest === 'config')     window.location.href = 'byup Configurazione Completa.html';
                else if (dest === 'panoramica') window.location.href = 'byup Panoramica.html';
              }}
            />
          )}
        </div>

        {processing && <ProcessingOverlay onComplete={finishProcessing}/>}
      </div>

      <StageNav
        step={step} subStep={subStep}
        setStep={setStep} setSubStep={setSubStep}
        setProcessing={setProcessing}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HEADER — stepper principale + sub-step indicator
// ─────────────────────────────────────────────────────────────────────────

function OnbHeader({step, subStep}) {
  return (
    <header style={{
      borderBottom: '1px solid rgba(15, 17, 21, 0.08)',
      background: '#fff',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
      }}>
        {/* Logo Fresh — fontSize 18 → height 36px (più presente del precedente 28px) */}
        <OnbIcon.Logo fontSize={18}/>

        {/* Stepper */}
        <Stepper step={step}/>

        {/* Spacer placeholder — bilancia il flex-between con logo a sx (medesimo
            ingombro indicativo) ora che "Salva e riprendi dopo" è stato rimosso. */}
        <div style={{width: 56, height: 28}} aria-hidden="true"/>
      </div>

      {/* Sub-step bar visibile solo dentro step 2 — non occupa spazio negli altri */}
      {step === 2 && <LocaleSubStepBar subStep={subStep}/>}
    </header>
  );
}

function Stepper({step}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 0}}>
      {STEPS.map((s, i) => {
        const done = s.id < step;
        const active = s.id === step;
        return (
          <React.Fragment key={s.id}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <div style={{
                width: 24, height: 24, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? ONB.GREEN : active ? ONB.TEXT : '#fff',
                border: done ? 'none' : active ? 'none' : '1px solid rgba(15, 17, 21, 0.16)',
                color: done || active ? '#fff' : ONB.MUTED_LIGHT,
                fontSize: 12, fontWeight: 600,
                transition: 'all 150ms ease-out',
              }}>
                {done ? <OnbIcon.Check size={11}/> : s.id}
              </div>
              <span style={{
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? ONB.TEXT : done ? ONB.TEXT : ONB.MUTED_LIGHT,
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 32, height: 1, margin: '0 16px',
                background: s.id < step ? ONB.GREEN : 'rgba(15, 17, 21, 0.08)',
                transition: 'background 150ms ease-out',
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function LocaleSubStepBar({subStep}) {
  const idx = LOCALE_SUBSTEPS.findIndex(s => s.id === subStep);
  return (
    <div style={{
      padding: '12px 48px',
      borderTop: '1px solid rgba(15, 17, 21, 0.04)',
      background: ONB.BG_SOFT,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <span style={{
        fontSize: 12, fontWeight: 500, color: ONB.MUTED,
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {idx + 1} di {LOCALE_SUBSTEPS.length}
      </span>
      <div style={{display: 'flex', gap: 6}}>
        {LOCALE_SUBSTEPS.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 10px', borderRadius: 999,
            fontSize: 12, fontWeight: 500,
            color: i === idx ? ONB.TEXT : i < idx ? ONB.GREEN : ONB.MUTED_LIGHT,
            background: i === idx ? '#fff' : 'transparent',
            border: i === idx ? '1px solid rgba(15, 17, 21, 0.08)' : '1px solid transparent',
          }}>
            {i < idx && <OnbIcon.Check size={10} color={ONB.GREEN}/>}
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PROCESSING OVERLAY — sostituisce lo step "Processing" autonomo.
// In-page modal, non un altro screen. Animazione: progress bar lineare + check
// per task completati. Niente sparkle, niente conic gradient, niente pulse dot.
// ─────────────────────────────────────────────────────────────────────────

const PROCESSING_TASKS = [
  'Lettura del file',
  'Riconoscimento sezioni',
  'Estrazione piatti',
  'Identificazione prezzi',
  'Allergeni e ingredienti',
  'Generazione descrizioni',
  'Verifica finale',
];

function ProcessingOverlay({onComplete}) {
  const [doneCount, setDoneCount] = React.useState(0);
  const [dots, setDots]           = React.useState(0);   // typewriter 0..3 sui puntini del titolo

  // Avanza la lista task: ~380ms × 7 = ~2.7s + 800ms hold finale = ~3.5s totali
  React.useEffect(() => {
    if (doneCount >= PROCESSING_TASKS.length) {
      const t = setTimeout(() => onComplete && onComplete(), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDoneCount(c => c + 1), 380);
    return () => clearTimeout(t);
  }, [doneCount]);

  // Typewriter dei dots — animation indipendente dal task ticker. Tocco "AI giocoso":
  // simula il sistema che "sta pensando", senza disco-ball né sparkle.
  React.useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);

  const finished = doneCount >= PROCESSING_TASKS.length;
  const progress = (doneCount / PROCESSING_TASKS.length) * 100;
  const currentTask = doneCount < PROCESSING_TASKS.length ? PROCESSING_TASKS[doneCount] : '';

  // Stima dei secondi rimanenti: task residui × 380ms (durata fissa per tick) + 800ms
  // di hold pre-close. Il valore decrementa visibilmente a ogni task completato — è il
  // sostituto della vecchia rassicurazione statica "circa 30 secondi, prenditi un caffè".
  const remainingMs = finished
    ? 800
    : (PROCESSING_TASKS.length - doneCount) * 380 + 800;
  const secondsLeft = Math.max(1, Math.ceil(remainingMs / 1000));

  return (
    <div role="dialog" aria-label="Analisi del menù in corso" style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 17, 21, 0.55)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{`
        @keyframes proc-spin   { to { transform: rotate(360deg); } }
        /* Orbit reverse rispetto al ring — crea contrasto direzionale, lettura
           "atomo / sistema in calcolo" senza usare nulla di esplicito. */
        @keyframes proc-orbit  { to { transform: rotate(-360deg); } }
        @keyframes proc-shimmer{
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        @keyframes proc-check-pop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes proc-task-rise {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Hero composer — node pulse: scale 1↔1.18 + opacity 0.55↔1, stagger
           via animation-delay sui 4 nodi (0/350/700/1050ms). Il delay 1050
           è il "core" centrale: pulsa contro-fase ai periferici per evitare
           che tutto sia uniforme. */
        @keyframes proc-hc-node {
          0%, 100% { transform: scale(1);    opacity: 0.55; }
          50%      { transform: scale(1.18); opacity: 1; }
        }
        @keyframes proc-hc-glow {
          0%, 100% { box-shadow: 0 0 24px rgba(255, 90, 95, 0.16); }
          50%      { box-shadow: 0 0 36px rgba(255, 90, 95, 0.28); }
        }
      `}</style>

      {/* D3 Sunset Glass — peak AI moment. Variant assegnata dal sistema 80/10/10:
          il processing è uno dei due picchi drammatici (insieme al login).
          Card warm-dark con doppio inset ring caldo + ombra burnt orange.
          Tutto il contenuto interno passa a colorazione chiara. */}
      <div style={{
        width: 460,
        background: 'linear-gradient(180deg, rgba(58, 28, 22, 0.88) 0%, rgba(30, 12, 10, 0.92) 100%)',
        backdropFilter: 'blur(22px) saturate(170%)',
        WebkitBackdropFilter: 'blur(22px) saturate(170%)',
        borderRadius: 14,
        boxShadow:
          'inset 0 1px 0 rgba(255, 200, 170, 0.22), ' +
          'inset 0 0 0 1px rgba(255, 150, 110, 0.16), ' +
          '0 18px 48px -12px rgba(120, 50, 15, 0.55), ' +
          '0 4px 14px -4px rgba(120, 50, 15, 0.30)',
        padding: 32,
        textAlign: 'center',
        color: '#F3F4F6',
      }}>
        {/* Hero icon — composer che disegna il menù riga per riga.
            88×88 container BRAND_TINT con glow soft, dentro un SVG che simula
            la "compilazione" di sezioni e piatti in cascata. Il colore è il
            tocco caldo che la card chiede. */}
        <HeroComposer finished={finished}/>

        {/* Header — loader (o check finale) + title con typewriter dots */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, marginBottom: 6,
        }}>
          {finished ? <DoneCheck/> : <AILoader/>}
          <h2 style={{
            margin: 0, fontSize: 17, fontWeight: 600, color: '#F3F4F6',
            letterSpacing: '-0.01em',
          }}>
            {finished
              ? 'Ci siamo quasi'
              : <>Stiamo ricreando il tuo menù<DotsTrail count={dots}/></>}
          </h2>
        </div>

        {/* Countdown: conferma viva del tempo residuo. tabular-nums per non far
            "saltare" il layout quando la cifra cambia (1→2 digit). */}
        <div style={{
          fontSize: 13, fontWeight: 400, color: 'rgba(255, 255, 255, 0.65)',
          marginBottom: 18, lineHeight: 1.4,
        }}>
          {finished
            ? 'Apertura anteprima…'
            : <>Pronto in: <span style={{
                fontWeight: 600, color: '#F3F4F6', fontVariantNumeric: 'tabular-nums',
              }}>{secondsLeft}s</span></>}
        </div>

        {/* Progress bar 2px BRAND fill + shimmer.
            Il fill cresce in step 380ms; lo shimmer scorre indipendentemente
            sopra il fill — comunica "elaborazione viva". BRAND in fill (non TEXT)
            per dare colore alla card senza renderla pesante.
            Track più chiaro per stagliare su sunset glass. */}
        <div style={{
          position: 'relative',
          height: 3, width: '100%', background: 'rgba(255, 255, 255, 0.16)',
          borderRadius: 999, overflow: 'hidden', marginBottom: 22,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            height: '100%', width: `${finished ? 100 : progress}%`,
            background: finished ? ONB.GREEN : ONB.BRAND,
            transition: 'width 380ms ease-out, background 200ms ease-out',
          }}/>
          {!finished && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 0,
              width: '40%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
              animation: 'proc-shimmer 1.6s ease-in-out infinite',
            }}/>
          )}
        </div>

        {/* Lista task — solo i completati + il corrente (pattern Linear/Stripe).
            text-align: left esplicito per non ereditare il center della card. */}
        <ul style={{listStyle: 'none', padding: 0, margin: 0, textAlign: 'left'}}>
          {PROCESSING_TASKS.slice(0, doneCount).map((label, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 0', fontSize: 13, color: 'rgba(255, 255, 255, 0.62)', fontWeight: 400,
              animation: 'proc-task-rise 220ms ease-out',
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 999,
                background: ONB.GREEN, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <OnbIcon.Check size={9}/>
              </span>
              {label}
            </li>
          ))}
          {!finished && (
            <li style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 0', fontSize: 13, color: '#F3F4F6', fontWeight: 500,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 999,
                border: '1px dashed rgba(255, 255, 255, 0.40)',
                flexShrink: 0,
              }}/>
              {currentTask}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AILoader — ring 1.5px che ruota + dot BRAND che orbita in direzione opposta.
// Il dot è il "tocco AI giocoso": minimal, ma comunica "sistema attivo / qualcosa
// gira intorno al processo". Niente sparkle, niente conic gradient.
// ─────────────────────────────────────────────────────────────────────────

function AILoader() {
  return (
    <div style={{position: 'relative', width: 18, height: 18, flexShrink: 0}}>
      {/* Ring base — quarter-arc TEXT su anello neutro */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '1.5px solid rgba(15, 17, 21, 0.10)',
        borderTopColor: ONB.TEXT,
        borderRadius: 999,
        animation: 'proc-spin 0.9s linear infinite',
      }}/>
      {/* Orbit BRAND — rotation reverse, dot che gira fuori dalla circonferenza.
          inset:-3 estende la "cassa" rotante 3px oltre il ring → il dot vive sul bordo. */}
      <div style={{
        position: 'absolute', inset: -3,
        animation: 'proc-orbit 1.4s linear infinite',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 4, height: 4, borderRadius: 999,
          background: ONB.BRAND,
        }}/>
      </div>
    </div>
  );
}

// DotsTrail — typewriter dei tre puntini sul titolo.
// 4 stati (0/1/2/3 dots) ciclati ogni 400ms → "automatico, sta lavorando".
// non-breaking-space inserito dopo il titolo per evitare il jump di width.
function DotsTrail({count}) {
  return (
    <span aria-hidden="true" style={{display: 'inline-block', minWidth: 18, color: ONB.TEXT}}>
      {'.'.repeat(count)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HeroComposer — icona grande animata: rete neurale astratta a 4 nodi.
// 1 nodo centrale grande pulsante + 3 nodi periferici staggered + connessioni
// 1px che pulsano insieme ai nodi. Comunica "AI compute" senza disegnare un
// brain o un robot — astrazione geometrica, leggibile a colpo d'occhio.
// ─────────────────────────────────────────────────────────────────────────

function HeroComposer({finished}) {
  const accentFg   = finished ? ONB.GREEN : ONB.BRAND;
  const accentSoft = finished ? ONB.GREEN_SOFT : ONB.BRAND_TINT;

  return (
    <div style={{
      width: 88, height: 88, borderRadius: 16,
      background: accentSoft,
      margin: '0 auto 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 300ms ease-out',
      animation: finished ? 'none' : 'proc-hc-glow 2.4s ease-in-out infinite',
    }}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        {/* Connessioni — disegnate prima così i nodi le sovrappongono.
            Stroke con opacity bassa, per non competere con i nodi pulsanti. */}
        <g stroke={accentFg} strokeWidth="1" opacity="0.4">
          <line x1="14" y1="14" x2="42" y2="14"/>
          <line x1="14" y1="14" x2="28" y2="42"/>
          <line x1="42" y1="14" x2="28" y2="42"/>
          {/* Nodo centrale — connessioni dal core ai 3 nodi periferici */}
          <line x1="28" y1="28" x2="14" y2="14"/>
          <line x1="28" y1="28" x2="42" y2="14"/>
          <line x1="28" y1="28" x2="28" y2="42"/>
        </g>

        {/* 3 nodi periferici — pulse stagger 0/350/700ms */}
        <circle cx="14" cy="14" r="3.5" fill={accentFg}
          style={{animation: 'proc-hc-node 1.8s ease-in-out 0ms infinite', transformOrigin: '14px 14px'}}/>
        <circle cx="42" cy="14" r="3.5" fill={accentFg}
          style={{animation: 'proc-hc-node 1.8s ease-in-out 350ms infinite', transformOrigin: '42px 14px'}}/>
        <circle cx="28" cy="42" r="3.5" fill={accentFg}
          style={{animation: 'proc-hc-node 1.8s ease-in-out 700ms infinite', transformOrigin: '28px 42px'}}/>

        {/* Nodo centrale — più grande, ring esterno bianco per "core",
            pulsazione contro-stagger (1050ms) → tutto il sistema mai in fase */}
        <circle cx="28" cy="28" r="6.5" fill="#fff" stroke={accentFg} strokeWidth="1.5"
          style={{animation: 'proc-hc-node 1.8s ease-in-out 1050ms infinite', transformOrigin: '28px 28px'}}/>
        <circle cx="28" cy="28" r="2.8" fill={accentFg}
          style={{animation: 'proc-hc-node 1.8s ease-in-out 1050ms infinite', transformOrigin: '28px 28px'}}/>
      </svg>
    </div>
  );
}

// DoneCheck — checkmark verde scale-in al completamento. Sostituisce il loader.
// "Ci siamo quasi" ≠ "Tutto pronto": il completamento vero della pipeline AI
// avviene poi nel banner persistente (Step 2/3/4) → qui solo il bridge.
function DoneCheck() {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: 999,
      background: ONB.GREEN,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      animation: 'proc-check-pop 320ms ease-out',
    }}>
      <OnbIcon.Check size={11}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STAGE NAV — aiuto demo per navigare gli step. Posizione: floating bottom-right.
// Non è production UI: rimane sobrio, neutro, fuori dal flusso visivo principale.
// ─────────────────────────────────────────────────────────────────────────

function StageNav({step, subStep, setStep, setSubStep, setProcessing}) {
  const stepLabel = step === 2 ? `Step 2 · ${subStep}` : `Step ${step}`;
  const idx = LOCALE_SUBSTEPS.findIndex(s => s.id === subStep);

  const goPrev = () => {
    setProcessing(false);
    if (step === 2 && idx > 0) setSubStep(LOCALE_SUBSTEPS[idx - 1].id);
    else if (step === 2 && idx === 0) { setStep(1); }
    else if (step === 3) { setStep(2); setSubStep('fiscale'); }
    else if (step === 4) setStep(3);
  };
  const goNext = () => {
    setProcessing(false);
    if (step === 1) setStep(2);
    else if (step === 2 && idx < LOCALE_SUBSTEPS.length - 1) setSubStep(LOCALE_SUBSTEPS[idx + 1].id);
    else if (step === 2 && idx === LOCALE_SUBSTEPS.length - 1) setStep(3);
    else if (step === 3) setStep(4);
  };

  return (
    <div className="stage-controls">
      <button onClick={goPrev} disabled={step === 1}>‹</button>
      {stepLabel}
      <button onClick={goNext} disabled={step === 4}>›</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PROCESSING BANNER — pillola floating, top-right del frame (step 2/3).
// Comunica che il menù è ancora in elaborazione in background, senza occupare
// spazio nel flow. Sparisce su step 4 (anteprima menu = consegna fatta).
//
// Animazione "leggera": dot pulse 1.5s + entrance scale-in 280ms al mount.
// Niente progress bar (richiesta esplicita): la promessa è la copy stessa.
// ─────────────────────────────────────────────────────────────────────────

function ProcessingBanner({step}) {
  // Top dipende dalla presenza della sub-step bar dell'header (visibile solo in step 2).
  // La banda sub-step aggiunge ~50px → spostiamo il banner più in basso lì,
  // così resta sempre fuori dall'overlap col header.
  const top = step === 2 ? 156 : 100;

  return (
    <div role="status" aria-live="polite" style={{
      position: 'absolute',
      top, right: 32,
      maxWidth: 360,
      zIndex: 20,
      background: 'rgba(255, 245, 244, 0.96)',  // BRAND_TINT semi-traslucido
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid rgba(255, 90, 95, 0.20)`,
      borderRadius: 12,
      padding: '12px 16px',
      // Shadow leggera tinted brand — eccezione documentata: un floating element
      // su canvas ha bisogno di "lift" e il tint lo lega al copy del banner.
      boxShadow: '0 8px 24px rgba(255, 90, 95, 0.10), 0 1px 2px rgba(15, 17, 21, 0.04)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'banner-float-in 280ms ease-out',
    }}>
      <span aria-hidden="true" style={{
        width: 8, height: 8, borderRadius: 999,
        background: ONB.BRAND,
        flexShrink: 0,
        animation: 'banner-dot-pulse 1.5s ease-in-out infinite',
      }}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: ONB.BRAND_DARK,
          letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          Il tuo menù è in elaborazione
        </div>
        <div style={{
          fontSize: 12, fontWeight: 400, color: ONB.BRAND_DARK,
          opacity: 0.72, lineHeight: 1.4, marginTop: 2,
        }}>
          Completa la configurazione per visualizzarlo
        </div>
      </div>

      <style>{`
        @keyframes banner-dot-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes banner-float-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<OnboardingApp/>);

// Login — pagina pre-onboarding, full-viewport responsive.
//
// LAYOUT
// Card centrata su canvas off-white, con animazione SVG F&B confinata negli angoli
// del viewport (la zona centrale resta pulita: il form non compete con lo sfondo).
// Le shape SVG vivono dietro il logo+card (z-index 0) e usano stroke neutro
// rgba(15,17,21,0.06–0.10) — visibili ma non leggibili come "decorazione".
//
// CREDENZIALI DEMO: admin / admin → reindirizza a "byup Restaurant Onboarding.html"

const LOGIN_REDIRECT = 'byup Restaurant Onboarding.html';
const VALID_USER = 'admin';
const VALID_PASS = 'admin';

function LoginApp() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [touched, setTouched] = React.useState({email: false, password: false});
  const [authError, setAuthError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Email regex applicata solo se l'utente digita "@" — il demo "admin" senza @ deve passare.
  const emailLooksLikeMail = email.includes('@');
  const emailValid = email.length >= 3 && (!emailLooksLikeMail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordValid = password.length >= 1;
  const formValid = emailValid && passwordValid;

  const showEmailError = touched.email && !emailValid;
  const showPasswordError = touched.password && !passwordValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({email: true, password: true});
    if (!formValid) return;
    setSubmitting(true);
    setAuthError('');
    setTimeout(() => {
      if (email.trim() === VALID_USER && password === VALID_PASS) {
        window.location.href = LOGIN_REDIRECT;
      } else {
        setAuthError('Credenziali non valide. Per la demo: admin / admin.');
        setSubmitting(false);
      }
    }, 250);
  };

  return (
    <>
      <FoodMotionBackdrop/>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        padding: '40px 24px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Logo Fresh sopra la card — height 44px (più presente del precedente 32) */}
        <div style={{marginBottom: 28}}>
          <OnbIcon.Logo fontSize={22}/>
        </div>

        {/* Card login — profondità reale via shadow elevated + border sottile */}
        <div style={{
          width: '100%', maxWidth: 440,
          background: '#fff',
          border: '1px solid rgba(15, 17, 21, 0.06)',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 8px 24px rgba(15, 17, 21, 0.08)',
        }}>
          <h1 style={{
            fontSize: 24, fontWeight: 600, lineHeight: 1.2,
            letterSpacing: '-0.02em', margin: '0 0 6px', color: ONB.TEXT,
          }}>
            Accedi al tuo account
          </h1>
          <p style={{
            fontSize: 14, fontWeight: 400, lineHeight: 1.4,
            margin: '0 0 24px', color: ONB.MUTED,
          }}>
            Continua a gestire il tuo locale da dove l'hai lasciato.
          </p>

          {/* Social — solo Google */}
          <SocialButton provider="google" label="Continua con Google"/>

          <Divider label="oppure"/>

          <form onSubmit={handleSubmit} style={{marginTop: 20}}>
            <FormField
              label="Email o nome utente"
              id="email"
              type="text"
              value={email}
              onChange={setEmail}
              onBlur={() => setTouched(t => ({...t, email: true}))}
              placeholder="nome@locale.it"
              autoComplete="username"
              invalid={showEmailError}
              errorText="Inserisci un'email valida o il tuo nome utente."
            />
            <FormField
              label="Password"
              id="password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              onBlur={() => setTouched(t => ({...t, password: true}))}
              placeholder="••••••••"
              autoComplete="current-password"
              invalid={showPasswordError}
              errorText="Inserisci la password."
              adornment={
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Nascondi password' : 'Mostra password'}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: 8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: ONB.MUTED,
                  }}
                >
                  {showPwd ? <OnbIcon.EyeOff size={16} color={ONB.MUTED}/> : <OnbIcon.Eye size={16} color={ONB.MUTED}/>}
                </button>
              }
            />

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 20}}>
              <a href="#" style={{
                fontSize: 13, color: ONB.TEXT, fontWeight: 500,
                textDecoration: 'none',
                borderBottom: '1px solid rgba(15, 17, 21, 0.12)', paddingBottom: 1,
              }}>
                Password dimenticata?
              </a>
            </div>

            {authError && (
              <div role="alert" style={{
                padding: '10px 12px', background: '#FEF2F2',
                border: '1px solid rgba(220, 38, 38, 0.16)',
                borderRadius: 8, marginBottom: 16,
                fontSize: 13, color: ONB.RED, fontWeight: 500,
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', height: 44, padding: '0 20px',
                background: submitting ? ONB.MUTED_LIGHT : ONB.ACTION_PRIMARY,
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'background 150ms ease-out',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = ONB.ACTION_PRIMARY_HOVER; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = ONB.ACTION_PRIMARY; }}
            >
              {submitting ? 'Accesso in corso...' : 'Accedi'}
              {!submitting && <OnbIcon.ArrowRight size={14} color="#fff"/>}
            </button>
          </form>

          <p style={{
            marginTop: 20, fontSize: 13, color: ONB.MUTED,
            textAlign: 'center', lineHeight: 1.4,
          }}>
            Non hai un account?{' '}
            <a href="#" style={{
              color: ONB.TEXT, fontWeight: 600, textDecoration: 'none',
              borderBottom: '1px solid rgba(15, 17, 21, 0.12)', paddingBottom: 1,
            }}>
              Registra il tuo locale
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Backdrop F&B — shape solo lungo i bordi del viewport, lasciando il centro
// (dove sta la card) pulito. Stroke neutro su canvas chiaro, opacità 0.06–0.10.
// Animazioni di pura traslazione su 80–110s — percepibili solo dopo lunga
// permanenza, mai distrattivi.
// ─────────────────────────────────────────────────────────────────────────

function FoodMotionBackdrop() {
  return (
    <>
      <style>{`
        @keyframes lg-drift-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(28px, -22px); } }
        @keyframes lg-drift-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-32px, 18px); } }
        @keyframes lg-drift-c { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, 30px); } }
        @keyframes lg-drift-d { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-18px, -28px); } }
        @keyframes lg-drift-e { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(36px, 14px); } }
        @keyframes lg-drift-f { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-22px, -12px); } }
        .lg-drift-a { animation: lg-drift-a 80s ease-in-out infinite; transform-origin: center; }
        .lg-drift-b { animation: lg-drift-b 110s ease-in-out infinite; transform-origin: center; }
        .lg-drift-c { animation: lg-drift-c 95s ease-in-out infinite; transform-origin: center; }
        .lg-drift-d { animation: lg-drift-d 88s ease-in-out infinite; transform-origin: center; }
        .lg-drift-e { animation: lg-drift-e 105s ease-in-out infinite; transform-origin: center; }
        .lg-drift-f { animation: lg-drift-f 92s ease-in-out infinite; transform-origin: center; }
      `}</style>

      {/* Wrapper full-viewport. preserveAspectRatio="xMidYMid slice" tiene le proporzioni
          riempiendo lo schermo; le shape sono posizionate in viewBox 1440×900 ma scalano
          col viewport mantenendole sempre verso i bordi. */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {/* Top-left — piatto grande (cerchio doppio, rim). La parte destra del piatto
            sborda fuori dal viewport: aiuta a non leggerlo come "elemento decorativo
            posato lì" ma come pattern continuo. */}
        <g className="lg-drift-a" stroke="rgba(15, 17, 21, 0.07)" fill="none" strokeWidth="1">
          <circle cx="80"  cy="120" r="180"/>
          <circle cx="80"  cy="120" r="140"/>
        </g>

        {/* Top-right — vapore astratto (3 linee curve verticali) */}
        <g className="lg-drift-c" stroke="rgba(15, 17, 21, 0.10)" fill="none" strokeWidth="1" strokeLinecap="round">
          <path d="M 1280 120 Q 1270 100, 1280 80 Q 1290 60, 1280 40"/>
          <path d="M 1300 130 Q 1290 110, 1300 90 Q 1310 70, 1300 50"/>
          <path d="M 1320 120 Q 1310 100, 1320 80 Q 1330 60, 1320 40"/>
        </g>

        {/* Top-right secondario — posata astratta (linea + ellisse cucchiaio) */}
        <g className="lg-drift-d" stroke="rgba(15, 17, 21, 0.06)" fill="none" strokeWidth="1">
          <line x1="1180" y1="200" x2="1280" y2="140"/>
          <ellipse cx="1178" cy="203" rx="18" ry="14" transform="rotate(-30 1178 203)"/>
        </g>

        {/* Bottom-left — oliva astratta, unico accento brand. Una sola "macchia di colore"
            decorativa in tutta la pagina — la regola "una sola pennellata brand" è applicata
            anche allo sfondo. */}
        <g className="lg-drift-e" stroke={ONB.BRAND} fill="none" strokeWidth="1.2" opacity="0.22">
          <ellipse cx="120" cy="780" rx="14" ry="22" transform="rotate(-20 120 780)"/>
        </g>

        {/* Bottom-right — scodella (semicerchio aperto verso l'alto + linea base) */}
        <g className="lg-drift-b" stroke="rgba(15, 17, 21, 0.08)" fill="none" strokeWidth="1">
          <path d="M 1200 780 Q 1290 880, 1380 780"/>
          <path d="M 1185 780 L 1395 780"/>
        </g>

        {/* Linea sottile diagonale a tutta larghezza — tagli grandi che organizzano il pattern */}
        <g className="lg-drift-f" stroke="rgba(15, 17, 21, 0.05)" fill="none" strokeWidth="1">
          <line x1="0" y1="650" x2="1440" y2="600"/>
        </g>

        {/* Punti pepe/sale — micro dots sparsi, fissi (non animati per non vibrare) */}
        <g fill="rgba(15, 17, 21, 0.10)">
          <circle cx="240" cy="400" r="1.5"/>
          <circle cx="280" cy="420" r="1"/>
          <circle cx="220" cy="450" r="1"/>
          <circle cx="1180" cy="500" r="1.2"/>
          <circle cx="1220" cy="530" r="1"/>
          <circle cx="1160" cy="560" r="1"/>
        </g>
      </svg>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sotto-componenti del form
// ─────────────────────────────────────────────────────────────────────────

function FormField({label, id, type, value, onChange, onBlur, placeholder, autoComplete, invalid, errorText, adornment}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = invalid ? ONB.RED : focused ? ONB.BRAND : 'rgba(15, 17, 21, 0.12)';
  const borderWidth = focused || invalid ? 1.5 : 1;
  return (
    <div style={{marginBottom: 16}}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 13, fontWeight: 500, color: ONB.TEXT,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        {label}
      </label>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        height: 44, background: '#fff',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: 8,
        transition: 'border-color 150ms ease-out',
        padding: focused || invalid ? '0 14px' : '0 14.5px',
      }}>
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            flex: 1, height: '100%', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 16, fontWeight: 400,
            fontFamily: 'inherit', color: ONB.TEXT,
            paddingRight: adornment ? 4 : 0,
          }}
        />
        {adornment}
      </div>
      {invalid && errorText && (
        <div style={{fontSize: 12, color: ONB.RED, marginTop: 6, lineHeight: 1.4, fontWeight: 500}}>
          {errorText}
        </div>
      )}
    </div>
  );
}

function SocialButton({provider, label}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', height: 44, padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        background: '#fff',
        border: `1px solid ${hover ? 'rgba(15, 17, 21, 0.18)' : 'rgba(15, 17, 21, 0.10)'}`,
        borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 14, fontWeight: 500, color: ONB.TEXT,
        transition: 'border-color 150ms ease-out',
      }}
    >
      <SocialGlyph provider={provider}/>
      <span>{label}</span>
    </button>
  );
}

function SocialGlyph({provider}) {
  if (provider === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }
  return null;
}

function Divider({label}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0'}}>
      <div style={{flex: 1, height: 1, background: 'rgba(15, 17, 21, 0.08)'}}/>
      <span style={{fontSize: 12, color: ONB.MUTED, fontWeight: 500}}>{label}</span>
      <div style={{flex: 1, height: 1, background: 'rgba(15, 17, 21, 0.08)'}}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LoginApp/>);

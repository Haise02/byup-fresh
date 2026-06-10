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

  // Placeholder color sui input invertiti (D3 sunset glass card).
  // Non posso fare ::placeholder inline → un'unica injection a mount.
  React.useEffect(() => {
    if (document.getElementById('login-inverted-styles')) return;
    const s = document.createElement('style');
    s.id = 'login-inverted-styles';
    s.textContent = `
      .login-inverted-field::placeholder { color: rgba(255, 255, 255, 0.40); }
      .login-inverted-field::-webkit-input-placeholder { color: rgba(255, 255, 255, 0.40); }
      .login-inverted-field { caret-color: #FF8A85; }
      .login-inverted-field:-webkit-autofill {
        -webkit-text-fill-color: #F3F4F6;
        -webkit-box-shadow: 0 0 0 1000px rgba(58, 28, 22, 0.95) inset;
        caret-color: #FF8A85;
      }
    `;
    document.head.appendChild(s);
  }, []);

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
      <VideoBackdrop/>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        padding: '40px 24px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Logo Fresh sopra la card. Drop-shadow scura sotto il PNG: contro il video
            di raso rosso il logo coral rischia di sciogliersi col background — la shadow
            gli ricostruisce un proprio "piano" senza dover invertire il colore brand. */}
        <div style={{
          marginBottom: 28,
          filter: 'drop-shadow(0 4px 24px rgba(15, 17, 21, 0.45))',
        }}>
          <OnbIcon.Logo fontSize={22}/>
        </div>

        {/* Card login — variante D3 "Sunset Glass" (gradient coral→fanta→salmon su
            base wood-burnt). Dark warm glass scelta dalla preview themes. Tutto il
            form interno passa attraverso il flag `inverted` per virare a chiaro. */}
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'linear-gradient(180deg, rgba(58, 28, 22, 0.62) 0%, rgba(30, 12, 10, 0.70) 100%)',
          backdropFilter: 'blur(22px) saturate(170%)',
          WebkitBackdropFilter: 'blur(22px) saturate(170%)',
          borderRadius: 14,
          padding: 32,
          boxShadow:
            'inset 0 1px 0 rgba(255, 200, 170, 0.22), ' +
            'inset 0 0 0 1px rgba(255, 150, 110, 0.16), ' +
            '0 18px 48px -12px rgba(120, 50, 15, 0.55), ' +
            '0 4px 14px -4px rgba(120, 50, 15, 0.30)',
        }}>
          <h1 style={{
            fontSize: 24, fontWeight: 600, lineHeight: 1.2,
            letterSpacing: '-0.02em', margin: '0 0 6px', color: '#F3F4F6',
          }}>
            Accedi al tuo account
          </h1>
          <p style={{
            fontSize: 14, fontWeight: 400, lineHeight: 1.4,
            margin: '0 0 24px', color: 'rgba(255, 255, 255, 0.65)',
          }}>
            Continua a gestire il tuo locale da dove l'hai lasciato.
          </p>

          {/* Social — solo Google */}
          <SocialButton provider="google" label="Continua con Google" inverted/>

          <Divider label="oppure" inverted/>

          <form onSubmit={handleSubmit} style={{marginTop: 20}}>
            <FormField
              inverted
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
              inverted
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
                    color: 'rgba(255, 255, 255, 0.60)',
                  }}
                >
                  {showPwd
                    ? <OnbIcon.EyeOff size={16} color="rgba(255, 255, 255, 0.75)"/>
                    : <OnbIcon.Eye    size={16} color="rgba(255, 255, 255, 0.75)"/>}
                </button>
              }
            />

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 20}}>
              <a href="#" style={{
                fontSize: 13, color: '#F3F4F6', fontWeight: 500,
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255, 255, 255, 0.22)', paddingBottom: 1,
              }}>
                Password dimenticata?
              </a>
            </div>

            {authError && (
              <div role="alert" style={{
                padding: '10px 12px',
                background: 'rgba(220, 38, 38, 0.18)',
                border: '1px solid rgba(252, 165, 165, 0.32)',
                borderRadius: 8, marginBottom: 16,
                fontSize: 13, color: '#FCA5A5', fontWeight: 500,
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', height: 44, padding: '0 20px',
                background: submitting ? 'rgba(255, 255, 255, 0.20)' : ONB.ACTION_PRIMARY,
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'background 150ms ease-out',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: submitting ? 'none' : '0 4px 14px -4px rgba(255, 90, 95, 0.45)',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = ONB.ACTION_PRIMARY_HOVER; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = ONB.ACTION_PRIMARY; }}
            >
              {submitting ? 'Accesso in corso...' : 'Accedi'}
              {!submitting && <OnbIcon.ArrowRight size={14} color="#fff"/>}
            </button>
          </form>

          <p style={{
            marginTop: 20, fontSize: 13, color: 'rgba(255, 255, 255, 0.65)',
            textAlign: 'center', lineHeight: 1.4,
          }}>
            Non hai un account?{' '}
            <a href="#" style={{
              color: '#F3F4F6', fontWeight: 600, textDecoration: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.22)', paddingBottom: 1,
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
// VideoBackdrop — raso rosso full-viewport, muto + loop + autoplay.
//
// PERCHÉ
// La schermata pubblica del login è l'unico touchpoint marketing del prodotto:
// qui ci si concede un'apertura più "premium" del resto dell'app (che resta
// neutra/funzionale). Il video è puro mood: muto, loop, no audio.
//
// READABILITY
// Sopra il video viaggia un overlay scuro a gradiente radiale: scurisce il centro
// dove vive la card così logo+form leggono nitidi anche su fotogrammi rosso saturo.
//
// ACCESSIBILITÀ / PERF
// • muted + playsInline + autoplay → autoplay regolare anche su iOS
// • aria-hidden: lo screen reader ignora la decorazione
// • prefers-reduced-motion: il video viene messo in pausa, il fermo-immagine resta
// • poster opzionale (omesso: il primo frame del webm copre il caso "non ancora caricato")
// ─────────────────────────────────────────────────────────────────────────

// Background video servito da GitHub raw (commit eb37d25). Push esplicito per
// avere un URL stabile linkabile in preview e demo senza commitare il binario
// in ogni iterazione locale.
const LOGIN_BG_VIDEO = 'https://raw.githubusercontent.com/Haise02/byup-fresh/main/login-bg-0518.mp4';

function VideoBackdrop() {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (mq.matches) {
        v.pause();
      } else {
        // play() può rifiutarsi (es. policy autoplay) → ignoriamo silenziosamente
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay loop muted playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 0, pointerEvents: 'none',
        }}
      >
        <source src={LOGIN_BG_VIDEO} type="video/mp4"/>
      </video>

      {/* Overlay scuro a gradiente radiale — più denso al centro per dare base solida
          al gruppo logo+card, più trasparente ai bordi per non "spegnere" il raso.
          Mix-blend-mode no: con un raso rosso porterebbe a viraggi imprevedibili. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(15, 17, 21, 0.55) 0%, rgba(15, 17, 21, 0.40) 45%, rgba(15, 17, 21, 0.25) 100%)',
          zIndex: 0, pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sotto-componenti del form
// ─────────────────────────────────────────────────────────────────────────

function FormField({label, id, type, value, onChange, onBlur, placeholder, autoComplete, invalid, errorText, adornment, inverted}) {
  const [focused, setFocused] = React.useState(false);

  // Theme tokens — light (default) vs inverted (D3 sunset glass card on dark)
  const T = inverted ? {
    label: 'rgba(255, 255, 255, 0.85)',
    wrapBg: 'rgba(255, 255, 255, 0.06)',
    wrapBorder: invalid ? '#FCA5A5' : focused ? '#FF8A85' : 'rgba(255, 255, 255, 0.14)',
    inputColor: '#F3F4F6',
    errColor: '#FCA5A5',
    placeholder: 'rgba(255, 255, 255, 0.40)',
  } : {
    label: ONB.TEXT,
    wrapBg: '#fff',
    wrapBorder: invalid ? ONB.RED : focused ? ONB.BRAND : 'rgba(15, 17, 21, 0.12)',
    inputColor: ONB.TEXT,
    errColor: ONB.RED,
    placeholder: undefined,
  };
  const borderWidth = focused || invalid ? 1.5 : 1;

  return (
    <div style={{marginBottom: 16}}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 13, fontWeight: 500, color: T.label,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        {label}
      </label>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        height: 44, background: T.wrapBg,
        border: `${borderWidth}px solid ${T.wrapBorder}`,
        borderRadius: 8,
        transition: 'border-color 150ms ease-out',
        padding: focused || invalid ? '0 14px' : '0 14.5px',
        backdropFilter: inverted ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: inverted ? 'blur(8px)' : 'none',
      }}>
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inverted ? 'login-inverted-field' : undefined}
          style={{
            flex: 1, height: '100%', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 16, fontWeight: 400,
            fontFamily: 'inherit', color: T.inputColor,
            paddingRight: adornment ? 4 : 0,
          }}
        />
        {adornment}
      </div>
      {invalid && errorText && (
        <div style={{fontSize: 12, color: T.errColor, marginTop: 6, lineHeight: 1.4, fontWeight: 500}}>
          {errorText}
        </div>
      )}
    </div>
  );
}

function SocialButton({provider, label, inverted}) {
  const [hover, setHover] = React.useState(false);
  const T = inverted ? {
    bg: hover ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.06)',
    border: hover ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.16)',
    color: '#F3F4F6',
  } : {
    bg: '#fff',
    border: hover ? 'rgba(15, 17, 21, 0.18)' : 'rgba(15, 17, 21, 0.10)',
    color: ONB.TEXT,
  };
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', height: 44, padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 14, fontWeight: 500, color: T.color,
        transition: 'border-color 150ms ease-out, background 150ms ease-out',
        backdropFilter: inverted ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: inverted ? 'blur(8px)' : 'none',
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

function Divider({label, inverted}) {
  const line  = inverted ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 17, 21, 0.08)';
  const text  = inverted ? 'rgba(255, 255, 255, 0.55)' : ONB.MUTED;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0'}}>
      <div style={{flex: 1, height: 1, background: line}}/>
      <span style={{fontSize: 12, color: text, fontWeight: 500}}>{label}</span>
      <div style={{flex: 1, height: 1, background: line}}/>
    </div>
  );
}

// Substrato mesh montato come SIBLING del LoginApp dentro un fragment.
// Il root container (#root) ha già position:relative + overflow:hidden
// dall'HTML, quindi il substrate absolute inset:0 lo riempie correttamente
// e clippa entro i bordi viewport. Tono warm per la pagina di accesso —
// l'unica pagina pubblica del prodotto, deve avere il "premium first impression".
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <GlassMeshSubstrate/>
    <LoginApp/>
  </>
);

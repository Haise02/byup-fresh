/* global React */
// auth.jsx — Onboarding & auth flow that runs BEFORE the Home.
// Screens: Login (matches the shared mockup) → recupero password,
// and a multi-step registration (dati → credenziali → telefono → OTP →
// preferenze → successo). On completion it calls onAuthenticated().
// Exposed to the rest of the app via window.AuthFlow.

const { useState: useStateA, useRef: useRefA, useEffect: useEffectA } = React;

// ─── Tokens (mirror app.jsx / extras.jsx) ───────────────────
const A_PINK = '#E32459';
const A_PINK_DARK = '#B81C47';
const A_TEXT = '#1c0f15';
const A_MUTED = '#6d5a61';
const A_FIELD = '#f9efeb';
const A_LINK = '#7FB4FF';        // azzurro dei link ("recupera qui")
const A_CREAM = '#F7E2E6';       // panna/rosa chiaro del logo + bottone

// ─── Icons ──────────────────────────────────────────────────
const EyeOff = ({ c = '#fff' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const EyeOn = ({ c = '#fff' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const BackArrow = ({ c = A_TEXT }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const AppleGlyph = () => (
  <svg width="17" height="20" viewBox="0 0 17 20" fill="#fff"><path d="M14.06 10.6c-.02-2.07 1.69-3.06 1.77-3.11-0.97-1.41-2.47-1.6-3-1.62-1.28-.13-2.5.75-3.15.75-.65 0-1.65-.73-2.71-.71-1.4.02-2.69.81-3.41 2.06-1.45 2.52-.37 6.25 1.04 8.3.69 1 1.51 2.13 2.58 2.09 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.71.65 1.12-.02 1.83-1.02 2.51-2.03.79-1.16 1.12-2.29 1.14-2.35-.03-.01-2.18-.84-2.2-3.33zM11.98 3.46c.57-.69.96-1.65.85-2.61-.82.03-1.82.55-2.41 1.24-.53.61-1 1.59-.87 2.53.91.07 1.85-.47 2.43-1.16z" /></svg>
);
const GoogleGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.5 29.4 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5 45.5 35.9 45.5 24c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M5.3 14.7l6.6 4.8C13.7 15.1 18.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6 29.4 4 24 4 16 4 9.1 8.5 5.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2.1 1.6-4.8 2.6-7.4 2.6-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9 39.4 15.9 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3C41.4 36 45.5 30.6 45.5 24c0-1.2-.1-2.3-.4-3.5z" /></svg>
);
const CheckBig = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
// Icona Face ID (stile iOS: cornice ad angoli + volto)
const FaceIDGlyph = ({ size = 26, c = A_TEXT, sw = 2.1 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 17v-4a5 5 0 0 1 5-5h4" />
    <path d="M31 8h4a5 5 0 0 1 5 5v4" />
    <path d="M40 31v4a5 5 0 0 1-5 5h-4" />
    <path d="M17 40h-4a5 5 0 0 1-5-5v-4" />
    <path d="M18 19v3" /><path d="M30 19v3" />
    <path d="M24 19v6h-2.5" />
    <path d="M18 30c2 2.2 10 2.2 12 0" />
  </svg>
);

// ─── Pink food-collage background (per il Login immersivo) ───
function AuthBackground() {
  const photos = [
    'photo-1513104890138-7c749659a591', // pizza
    'photo-1565299624946-b28f40a0ae38', // pizza top
    'photo-1574071318508-1cdbab80d002', // pasta
    'photo-1551183053-bf91a1d81141',     // bowl
    'photo-1571091718767-18b5b1457add', // burger
    'photo-1546069901-ba9599a7e63c',     // salad
  ];
  const cells = Array.from({ length: 12 }, (_, i) => photos[i % photos.length]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* collage in alto, sfumato */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, opacity: 0.5,
      }}>
        {cells.map((id, i) => (
          <div key={i} style={{
            paddingTop: '100%', backgroundImage: `url(https://images.unsplash.com/${id}?w=200&q=70&auto=format&fit=crop)`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        ))}
      </div>
      {/* overlay rosa + scurimento verso il basso */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${A_PINK} 0%, rgba(200,28,71,0.86) 38%, ${A_PINK_DARK} 60%, #5C0E25 100%)`,
      }} />
    </div>
  );
}

// ─── Campo input "immersivo" (su sfondo rosa) ───────────────
function GlassField({ label, value, onChange, type = 'text', placeholder, rightSlot, ...rest }) {
  const [focus, setFocus] = useStateA(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#FBF6F7', borderRadius: 14,
        border: `1.5px solid ${focus ? '#fff' : 'transparent'}`,
        transition: 'border-color .15s',
      }}>
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, padding: '15px 16px', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 15.5, color: A_TEXT, fontFamily: 'inherit',
            borderRadius: 14,
          }}
          {...rest}
        />
        {rightSlot && <div style={{ padding: '0 14px 0 6px', display: 'flex' }}>{rightSlot}</div>}
      </div>
    </div>
  );
}

// ─── Overlay Face ID ────────────────────────────────────────
// firstOutcome: esito del 1° tentativo; retryOutcome: esito dei tentativi
// successivi ("Riprova"). Sul login: primo 'fail' (così navighi il login),
// poi 'ok' al Riprova → entra. 'ok' → onSuccess; 'fail' → errore.
function AuthFaceID({ firstOutcome = 'ok', retryOutcome, onSuccess, onClose }) {
  const [phase, setPhase] = useStateA('scan'); // 'scan' | 'ok' | 'fail'
  const [tries, setTries] = useStateA(0);
  const retry = retryOutcome === undefined ? firstOutcome : retryOutcome;

  useEffectA(() => {
    if (phase !== 'scan') return;
    const outcome = tries === 0 ? firstOutcome : retry;
    const t1 = setTimeout(() => setPhase(outcome), 1500);
    return () => clearTimeout(t1);
  }, [phase, tries]);

  useEffectA(() => {
    if (phase !== 'ok') return;
    const t = setTimeout(() => onSuccess && onSuccess(), 800);
    return () => clearTimeout(t);
  }, [phase]);

  const ok = phase === 'ok';
  const fail = phase === 'fail';
  const accent = ok ? '#34C759' : fail ? '#FF453A' : '#fff';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(8,8,10,0.94)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fade .25s ease', color: '#fff',
    }}>
      <div style={{
        width: 116, height: 116, borderRadius: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: ok ? 'rgba(52,199,89,0.16)' : fail ? 'rgba(255,69,58,0.16)' : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${ok ? 'rgba(52,199,89,0.5)' : fail ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.12)'}`,
        transition: 'background .3s, border-color .3s',
      }}>
        <div style={{ animation: phase === 'scan' ? 'scan 1.2s ease-in-out infinite' : 'none', display: 'flex' }}>
          <FaceIDGlyph size={60} c={accent} sw={ok || fail ? 2.4 : 2.2} />
        </div>
      </div>

      <div style={{ marginTop: 26, fontSize: 17, fontWeight: 600 }}>
        {ok ? 'Volto riconosciuto' : fail ? 'Volto non riconosciuto' : 'Face ID'}
      </div>
      <div style={{ marginTop: 6, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', textAlign: 'center', padding: '0 40px' }}>
        {ok ? 'Accesso in corso…' : fail ? 'Face ID non ti ha riconosciuto. Riprova o accedi con la password.' : 'Guarda lo schermo per accedere'}
      </div>

      {fail && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 30 }}>
          <button onClick={() => { setTries(t => t + 1); setPhase('scan'); }} style={{
            padding: '12px 28px', background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: 14, cursor: 'pointer', color: '#fff', fontSize: 15.5, fontWeight: 600, fontFamily: 'inherit',
          }}>Riprova</button>
          <button onClick={onClose} style={{
            padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          }}>Inserisci password</button>
        </div>
      )}

      {phase === 'scan' && (
        <button onClick={onClose} style={{
          position: 'absolute', bottom: 46, background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.85)', fontSize: 15.5, fontWeight: 500, fontFamily: 'inherit',
        }}>Annulla</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
function AuthLogin({ onLogin, onRegister, onForgot, onSocial }) {
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');
  const [show, setShow] = useStateA(false);
  const [faceOpen, setFaceOpen] = useStateA(false);

  // All'apertura del login il Face ID parte da solo: il 1° tentativo
  // fallisce (così puoi osservare/navigare il login), il "Riprova" riesce.
  useEffectA(() => {
    const t = setTimeout(() => setFaceOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, color: '#fff', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <AuthBackground />
      <div style={{
        position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
        padding: '0 24px', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ flex: '1 1 auto', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img src="byup-logo.png" alt="byup" width={168} style={{ height: 'auto', display: 'block' }} />
        </div>

        {/* Form */}
        <div style={{ flex: '0 0 auto', paddingBottom: 28 }}>
          <GlassField label="Email" value={email} onChange={setEmail}
            type="email" placeholder="mario.rossi@gmail.com" autoComplete="email"
            autoCapitalize="none" autoCorrect="off" spellCheck={false} />
          <GlassField label="Password" value={pw} onChange={setPw}
            type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
            rightSlot={
              <button onClick={() => setShow(s => !s)} aria-label="Mostra password"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                {show ? <EyeOn c={A_MUTED} /> : <EyeOff c={A_MUTED} />}
              </button>
            } />

          <div style={{ fontSize: 13.5, marginTop: -2, marginBottom: 20 }}>
            <span style={{ color: '#F2D7DD' }}>Hai dimenticato la password? </span>
            <button onClick={onForgot} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: A_LINK, fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit' }}>recuperala qui</button>
          </div>

          <button onClick={onLogin} style={{
            width: '100%', padding: '16px', background: A_CREAM, color: A_TEXT,
            border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>Accedi</button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.35)' }} />
            <div style={{ fontSize: 13, color: '#F2D7DD' }}>Oppure continua con</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.35)' }} />
          </div>

          {/* Social */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onSocial('apple')} style={{
              flex: 1, padding: '14px', background: '#1a1a1a', color: '#fff', border: 'none',
              borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}><AppleGlyph /> Accedi</button>
            <button onClick={() => onSocial('google')} style={{
              flex: 1, padding: '14px', background: '#fff', color: A_TEXT, border: 'none',
              borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}><GoogleGlyph /> Accedi</button>
          </div>

          <div style={{ fontSize: 13.5, marginTop: 22, textAlign: 'left' }}>
            <span style={{ color: '#F2D7DD' }}>Non hai un account? </span>
            <button onClick={onRegister} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: A_LINK, fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit' }}>registrati qui</button>
          </div>
        </div>
      </div>

      {faceOpen && <AuthFaceID
        firstOutcome="fail" retryOutcome="ok"
        onSuccess={onLogin}
        onClose={() => setFaceOpen(false)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// RECUPERO PASSWORD
// ════════════════════════════════════════════════════════════
function AuthForgot({ onBack }) {
  const [email, setEmail] = useStateA('');
  const [sent, setSent] = useStateA(false);
  return (
    <div style={{ position: 'absolute', inset: 0, color: '#fff' }}>
      <AuthBackground />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 70, overflowY: 'auto' }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.18)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 24,
        }}><BackArrow c="#fff" /></button>

        {!sent ? (
          <>
            <div style={{ fontSize: 26, fontWeight: 800 }}>Recupera password</div>
            <div style={{ fontSize: 14.5, color: '#F2D7DD', marginTop: 10, marginBottom: 28, lineHeight: 1.5 }}>
              Inserisci l'email del tuo account: ti invieremo un link per reimpostare la password.
            </div>
            <GlassField label="Email" value={email} onChange={setEmail} type="email" placeholder="mario.rossi@gmail.com" />
            <button disabled={!email} onClick={() => setSent(true)} style={{
              width: '100%', padding: '16px', marginTop: 8, border: 'none', borderRadius: 16,
              background: email ? A_CREAM : 'rgba(255,255,255,0.35)', color: email ? A_TEXT : 'rgba(255,255,255,0.7)',
              fontSize: 16, fontWeight: 700, cursor: email ? 'pointer' : 'default', fontFamily: 'inherit',
            }}>Invia link</button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 30 }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}><CheckBig /></div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Controlla la posta</div>
            <div style={{ fontSize: 14.5, color: '#F2D7DD', marginTop: 10, lineHeight: 1.5 }}>
              Abbiamo inviato un link per il reset a<br /><b style={{ color: '#fff' }}>{email}</b>
            </div>
            <button onClick={onBack} style={{
              width: '100%', padding: '16px', marginTop: 32, border: 'none', borderRadius: 16,
              background: A_CREAM, color: A_TEXT, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Torna al login</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// REGISTRAZIONE (multi-step, sfondo chiaro)
// ════════════════════════════════════════════════════════════

// Campo input chiaro (stile coerente con i form dell'app)
function LightField({ label, value, onChange, type = 'text', placeholder, rightSlot, ...rest }) {
  const [focus, setFocus] = useStateA(false);
  const inputRef = useRefA(null);
  // Su Chrome desktop l'input date mostra ANCHE l'indicatore nativo accanto
  // alla nostra icona (su iOS no): lo nascondiamo e apriamo il picker dal
  // nostro slot, dove showPicker è disponibile.
  const isDate = type === 'date';
  return (
    <div style={{ marginBottom: 16 }}>
      {isDate && <style>{`input[type="date"]::-webkit-calendar-picker-indicator{ display:none; -webkit-appearance:none; }`}</style>}
      <div style={{ fontSize: 11, fontWeight: 600, color: A_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 2 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', background: A_FIELD, borderRadius: 12,
        border: `1.5px solid ${focus ? A_PINK : 'transparent'}`, transition: 'border-color .15s',
      }}>
        <input ref={inputRef} type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, padding: '13px 14px', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: A_TEXT, fontFamily: 'inherit', borderRadius: 12 }}
          {...rest} />
        {rightSlot && (
          <div
            onClick={isDate ? () => { try { inputRef.current?.showPicker?.(); } catch {} } : undefined}
            style={{ padding: '0 12px 0 4px', display: 'flex', cursor: isDate ? 'pointer' : undefined }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

const CUISINES = ['Pizza', 'Sushi', 'Italiana', 'Burger', 'Vegetariana', 'Cocktail', 'Pesce', 'Dolci', 'Messicana', 'Ramen', 'Brunch', 'Vino'];

// Contenuti legali (allineati a quelli del profilo in extras.jsx)
const A_TERMS = [
  { h: 'Accettazione dei termini', p: 'Utilizzando byup accetti integralmente i presenti Termini e Condizioni. Se non li accetti, ti preghiamo di non utilizzare il servizio. byup si riserva il diritto di modificarli in qualsiasi momento; le modifiche saranno efficaci dalla pubblicazione sull\'app.' },
  { h: 'Descrizione del servizio', p: 'byup è una piattaforma digitale che consente agli utenti di scoprire ristoranti, consultare menu e effettuare prenotazioni. Il servizio è disponibile per utenti che hanno compiuto 14 anni, registrati con un account personale.' },
  { h: 'Prenotazioni e cancellazioni', p: 'Le prenotazioni effettuate tramite byup sono vincolanti. La cancellazione è gratuita fino a 2 ore prima dell\'orario prenotato. Cancellazioni tardive o mancata presentazione (no-show) ripetuti possono comportare la sospensione temporanea del servizio di prenotazione.' },
  { h: 'Responsabilità', p: 'byup funge da intermediario tra utente e ristoratore. Non siamo responsabili di variazioni di menu, prezzi, orari o qualità del servizio reso dai locali partner. In caso di problemi con una prenotazione, contatta il supporto entro 24 ore.' },
  { h: 'Proprietà intellettuale', p: 'Tutti i contenuti presenti su byup (logo, testi, immagini, interfaccia) sono di proprietà di byup S.r.l. o dei rispettivi titolari. È vietata qualsiasi riproduzione o utilizzo non autorizzato.' },
  { h: 'Legge applicabile', p: 'I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente in via esclusiva il Foro di Roma.' },
];
const A_PRIVACY = [
  { h: 'Titolare del trattamento', p: 'byup S.r.l., con sede legale in Via del Corso 10, 00186 Roma (RM), C.F. / P.IVA 12345678901, è il titolare del trattamento dei dati personali raccolti tramite questa applicazione. Contatto DPO: privacy@byup.it' },
  { h: 'Dati raccolti', p: 'Raccogliamo i dati che fornisci durante la registrazione (nome, cognome, e-mail, numero di telefono), i dati di navigazione e utilizzo dell\'app (pagine visitate, preferenze, ricerche), i dati delle prenotazioni e le preferenze alimentari (allergeni, diete) che scegli di inserire volontariamente.' },
  { h: 'Finalità e base giuridica', p: 'I dati sono trattati per: (a) eseguire il contratto di servizio (art. 6.1.b GDPR); (b) adempiere a obblighi legali (art. 6.1.c GDPR); (c) inviarti comunicazioni promozionali, anche personalizzate sul tuo storico ordini su byup, solo previo tuo consenso (art. 6.1.a GDPR); le offerte basate sulle preferenze alimentari richiedono un consenso separato ed esplicito (art. 9.2.a GDPR).' },
  { h: 'Preferenze alimentari e allergeni', p: 'Allergeni, diete e preferenze alimentari possono rivelare dati su salute o convinzioni religiose (art. 9 GDPR): li trattiamo solo con il tuo consenso esplicito (art. 9.2.a) e solo per filtrare i menù. Con un consenso separato e facoltativo possiamo usarli anche per proporti offerte in linea (es. proposte senza glutine): in quel caso le notifiche hanno testo generico e il dettaglio dell\'offerta è visibile solo in app. Puoi revocare entrambi i consensi da “I miei dati”: alla revoca del primo, le preferenze salvate vengono cancellate.' },
  { h: 'Conservazione', p: 'I dati dell\'account sono conservati per tutta la durata del rapporto contrattuale e per i successivi 10 anni per obblighi fiscali. I dati di navigazione sono conservati per un massimo di 13 mesi.' },
  { h: 'I tuoi diritti', p: 'Hai diritto di accedere, rettificare, cancellare e portare i tuoi dati (artt. 15-20 GDPR). Puoi opporti al trattamento o chiedere la limitazione in qualsiasi momento scrivendo a privacy@byup.it. Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).' },
  { h: 'Suggerimenti personalizzati', p: 'Per proporti locali e piatti in linea con i tuoi gusti usiamo, sulla base del nostro legittimo interesse (art. 6.1.f GDPR), i gusti che dichiari nel profilo, il tuo storico ordini su byup e la città del tuo contesto d\'uso corrente (posizione usata al volo o città selezionata). Non usiamo mai allergeni o preferenze alimentari, né i log di accesso registrati per sicurezza. Puoi disattivare i suggerimenti personalizzati in qualsiasi momento scrivendo all\'assistenza: torneranno proposte generiche.' },
  { h: 'Cookie e tecnologie simili', p: 'L\'app non utilizza cookie di terze parti né strumenti di analisi esterni. Le statistiche su come usi l\'app sono elaborate internamente da byup, come descritto nell\'informativa privacy e, se sei autenticato, restano collegate al tuo profilo: puoi opporti in qualsiasi momento scrivendo all\'assistenza.' },
  { h: 'Trasferimenti internazionali', p: 'Alcuni fornitori di servizi (es. infrastruttura cloud) potrebbero trattare dati al di fuori dell\'UE. In tal caso garantiamo adeguate salvaguardie tramite Clausole Contrattuali Standard approvate dalla Commissione Europea.' },
];

// Pagina legale a tutto schermo, con back
function AuthLegal({ title, content, onBack }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', color: A_TEXT, display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, system-ui, sans-serif', animation: 'fade .2s ease' }}>
      <div style={{ padding: '60px 24px 0' }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 999, background: A_FIELD, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 18,
        }}><BackArrow /></button>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: -0.4 }}>{title}</div>
        <div style={{ fontSize: 12, color: A_MUTED, marginTop: 6 }}>Aggiornato il 1 gennaio 2025</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 40px' }}>
        {content.map((b, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>{b.h}</div>
            <div style={{ fontSize: 13.5, color: A_MUTED, lineHeight: 1.65 }}>{b.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthRegister({ onBack, onDone }) {
  const STEPS = 5;
  const [step, setStep] = useStateA(0);

  // dati
  const [nome, setNome] = useStateA('');
  const [cognome, setCognome] = useStateA('');
  const [dob, setDob] = useStateA(''); // data di nascita (YYYY-MM-DD)
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');
  const [pw2, setPw2] = useStateA('');
  const [showPw, setShowPw] = useStateA(false);
  const [phone, setPhone] = useStateA('');
  const [otp, setOtp] = useStateA(['', '', '', '', '']);
  const [prefs, setPrefs] = useStateA([]);
  const [terms, setTerms] = useStateA(false);
  // A6 — marketing byup: facoltativa e NON preselezionata. La decisione
  // (sì o no) si registra alla creazione dell'account, nel registro consensi.
  const [mkt, setMkt] = useStateA(false);
  const [legal, setLegal] = useStateA(null); // null | 'terms' | 'privacy'
  const [resend, setResend] = useStateA(30); // countdown "Invia di nuovo"

  // Avvia/riavvia il countdown quando si entra nello step OTP
  useEffectA(() => {
    if (step !== 3) return;
    setResend(30);
    const id = setInterval(() => setResend(r => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(id);
  }, [step]);

  const otpRefs = useRefA([]);
  const back = () => (step === 0 ? onBack() : setStep(s => s - 1));
  const next = () => setStep(s => Math.min(STEPS - 1, s + 1));

  const pwStrength = (() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0..4
  })();

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const phoneOk = phone.replace(/\D/g, '').length >= 8;
  const otpOk = otp.every(d => d !== '');

  // Età minima 14 e non 18: l'app è aperta ai minorenni, e 14 anni è l'età
  // in cui in Italia si può prestare da soli il consenso al trattamento dei
  // dati per i servizi online (art. 2-quinquies del Codice Privacy). Sotto,
  // servirebbe il consenso di chi esercita la responsabilità genitoriale, che
  // l'app oggi non raccoglie: per questo lì il blocco resta.
  const age = (() => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d)) return null;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  })();
  const dobOk = age !== null && age >= 14 && age < 120;
  const pwMatch = pw.length > 0 && pw === pw2;

  const stepValid = [
    nome.trim() && cognome.trim() && dobOk,
    emailOk && pw.length >= 8 && pwMatch,
    phoneOk,
    otpOk,
    terms, // preferenze opzionali, ma serve il consenso
  ][step];

  const ctaLabel = step === 3 ? 'Verifica' : step === STEPS - 1 ? 'Crea account' : 'Continua';

  const handleOtp = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    setOtp(prev => { const n = [...prev]; n[i] = d; return n; });
    if (d && i < 4 && otpRefs.current[i + 1]) otpRefs.current[i + 1].focus();
  };
  const otpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0 && otpRefs.current[i - 1]) otpRefs.current[i - 1].focus();
  };

  const togglePref = (c) => setPrefs(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const titles = [
    { t: 'Come ti chiami?', s: 'Useremo il tuo nome per le prenotazioni.' },
    { t: 'Crea le credenziali', s: 'Servono per accedere al tuo account byup.' },
    { t: 'Il tuo numero', s: 'Ti invieremo un codice di verifica via SMS.' },
    { t: 'Verifica il numero', s: `Inserisci il codice a 5 cifre inviato al ${phone || 'tuo numero'}.` },
    { t: 'I tuoi gusti', s: 'Scegli cosa ami: personalizzeremo i consigli. (Opzionale)' },
  ];

  // Pagina legale a tutto schermo (lo stato del form resta intatto al ritorno)
  if (legal) {
    return <AuthLegal
      title={legal === 'terms' ? 'Termini di servizio' : 'Informativa sulla privacy'}
      content={legal === 'terms' ? A_TERMS : A_PRIVACY}
      onBack={() => setLegal(null)} />;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', color: A_TEXT, fontFamily: '-apple-system, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header: back + progress */}
      <div style={{ padding: '60px 24px 0' }}>
        <button onClick={back} style={{
          width: 40, height: 40, borderRadius: 999, background: A_FIELD, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 18,
        }}><BackArrow /></button>
        <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? A_PINK : '#EFEAEB', transition: 'background .25s' }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: -0.4 }}>{titles[step].t}</div>
        <div style={{ fontSize: 14, color: A_MUTED, marginTop: 8, marginBottom: 26, lineHeight: 1.5 }}>{titles[step].s}</div>

        {step === 0 && (
          <>
            <LightField label="Nome" value={nome} onChange={setNome} placeholder="Mario" autoComplete="given-name" />
            <LightField label="Cognome" value={cognome} onChange={setCognome} placeholder="Rossi" autoComplete="family-name" />
            <LightField label="Data di nascita" value={dob} onChange={setDob} type="date" max="2025-12-31" autoComplete="bday"
              rightSlot={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={A_MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
                  <rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>
                </svg>
              } />
            {dob && !dobOk && (
              <div style={{ fontSize: 12.5, color: '#E5484D', marginTop: -8, paddingLeft: 2 }}>
                Devi avere almeno 14 anni per registrarti.
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <LightField label="Email" value={email} onChange={setEmail} type="email" placeholder="mario.rossi@gmail.com" autoComplete="email" />
            <LightField label="Password" value={pw} onChange={setPw} type={showPw ? 'text' : 'password'} placeholder="Almeno 8 caratteri"
              rightSlot={<button onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>{showPw ? <EyeOn c={A_MUTED} /> : <EyeOff c={A_MUTED} />}</button>} />
            {/* indicatore robustezza */}
            <div style={{ display: 'flex', gap: 6, marginTop: -4 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < pwStrength ? (pwStrength <= 1 ? '#E5484D' : pwStrength <= 2 ? '#F5A623' : '#3CB371') : '#EFEAEB' }} />
              ))}
            </div>
            {pw && <div style={{ fontSize: 12, color: A_MUTED, marginTop: 8 }}>{pwStrength <= 1 ? 'Password debole' : pwStrength <= 2 ? 'Password media' : 'Password robusta'}</div>}
            <div style={{ marginTop: 16 }}>
              <LightField label="Conferma password" value={pw2} onChange={setPw2} type={showPw ? 'text' : 'password'} placeholder="Ripeti la password"
                rightSlot={<button onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>{showPw ? <EyeOn c={A_MUTED} /> : <EyeOff c={A_MUTED} />}</button>} />
            </div>
            {pw2 && pw !== pw2 && (
              <div style={{ fontSize: 12.5, color: '#E5484D', marginTop: -8, paddingLeft: 2 }}>
                Le password non coincidono.
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 96px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: A_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 2 }}>Prefisso</div>
              <div style={{ padding: '13px 14px', background: A_FIELD, border: '1.5px solid transparent', borderRadius: 12, fontSize: 15, fontWeight: 600, lineHeight: '20px' }}>🇮🇹 +39</div>
            </div>
            <div style={{ flex: 1 }}>
              <LightField label="Telefono" value={phone} onChange={v => setPhone(v.replace(/[^\d ]/g, ''))} type="tel" placeholder="333 123 4567" autoComplete="tel" />
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => (otpRefs.current[i] = el)} value={d} inputMode="numeric" maxLength={1}
                  onChange={e => handleOtp(i, e.target.value)} onKeyDown={e => otpKey(i, e)}
                  style={{
                    width: 54, height: 64, textAlign: 'center', fontSize: 26, fontWeight: 700,
                    border: `1.5px solid ${d ? A_PINK : '#EAE6E7'}`, borderRadius: 14, outline: 'none',
                    background: A_FIELD, color: A_TEXT, fontFamily: 'inherit',
                  }} />
              ))}
            </div>
            {resend > 0 ? (
              <div style={{ color: A_MUTED, fontSize: 13.5, marginTop: 18 }}>
                Invia di nuovo il codice tra 0:{String(resend).padStart(2, '0')}
              </div>
            ) : (
              <button onClick={() => { setOtp(['', '', '', '', '']); setResend(30); }} style={{ background: 'none', border: 'none', color: A_PINK, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', marginTop: 18, padding: 0, fontFamily: 'inherit' }}>Non hai ricevuto il codice? Invia di nuovo</button>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CUISINES.map(c => {
                const on = prefs.includes(c);
                return (
                  <button key={c} onClick={() => togglePref(c)} style={{
                    padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 14, fontWeight: 600,
                    border: `1.5px solid ${on ? A_PINK : '#EAE6E7'}`,
                    background: on ? A_PINK : '#fff', color: on ? '#fff' : A_TEXT,
                    transition: 'all .15s',
                  }}>{c}</button>
                );
              })}
            </div>

            {/* A6 — marketing: mai preselezionata (obbligo di legge), ma
                progettata per l'opt-in e SEMPRE SOPRA la spunta obbligatoria
                (scelta di Fabio): si vende il BENEFICIO (sconti dei
                locali che ami), non il trattamento; la rassicurazione
                anti-spam abbassa il costo percepito del sì. Il toggle è
                l'unico elemento colorato della card: l'occhio ci arriva. */}
            <button onClick={() => setMkt(m => !m)} aria-label="Consenso marketing" style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              marginTop: 28, padding: '13px 14px', borderRadius: 16, textAlign: 'left',
              background: mkt ? '#FDF0F4' : '#FAF7F8',
              border: `1.5px solid ${mkt ? A_PINK : '#EFE9EB'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s',
            }}>
              <span style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: mkt ? A_PINK : '#F3EBEE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, transition: 'background .18s',
              }}>🎁</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: A_TEXT }}>
                  Non perderti le offerte dei locali
                </span>
                <span style={{ display: 'block', fontSize: 12, color: A_MUTED, marginTop: 2, lineHeight: 1.4 }}>
                  Sconti riservati e novità, anche su misura sui tuoi ordini,
                  via email e notifica. Niente spam: ti disiscrivi in un tocco.
                </span>
              </span>
              {/* checkbox: il consenso si SPUNTA — il segno resta quello
                  della firma, la card intorno fa il lavoro di convincere */}
              <span style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                border: `1.5px solid ${mkt ? A_PINK : '#CFC8CB'}`,
                background: mkt ? A_PINK : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .18s',
              }}>
                {mkt && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
            </button>

            {/* Consenso Termini & Privacy (obbligatorio) — link cliccabili */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16 }}>
              <button onClick={() => setTerms(t => !t)} aria-label="Accetto i termini" style={{
                flex: '0 0 22px', width: 22, height: 22, borderRadius: 7, marginTop: 1, padding: 0,
                border: `1.5px solid ${terms ? A_PINK : '#CFC8CB'}`, background: terms ? A_PINK : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', cursor: 'pointer',
              }}>
                {terms && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </button>
              <div style={{ fontSize: 13.5, color: A_MUTED, lineHeight: 1.45 }}>
                Accetto i <span role="button" tabIndex={0} onClick={() => setLegal('terms')} style={{ color: A_PINK, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Termini di servizio</span> e l'<span role="button" tabIndex={0} onClick={() => setLegal('privacy')} style={{ color: A_PINK, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Informativa sulla privacy</span> di byup.
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 24px 34px' }}>
        <button disabled={!stepValid} onClick={() => (step === STEPS - 1 ? (ByupConsensi.set('A6', mkt), onDone({ nome, cognome, dob, email, prefs, terms })) : next())} style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: 16,
          background: stepValid ? A_PINK : '#EDE7E9', color: stepValid ? '#fff' : A_MUTED,
          fontSize: 16, fontWeight: 700, cursor: stepValid ? 'pointer' : 'default', fontFamily: 'inherit',
          transition: 'background .2s',
        }}>{ctaLabel}</button>
        {step === 4 && (
          <button disabled={!terms} onClick={() => { ByupConsensi.set('A6', mkt); onDone({ nome, cognome, dob, email, prefs: [], terms }); }} style={{
            width: '100%', padding: '12px', marginTop: 8, background: 'none', border: 'none',
            color: terms ? A_MUTED : '#C9C2C5', fontSize: 14.5, fontWeight: 600,
            cursor: terms ? 'pointer' : 'default', fontFamily: 'inherit',
          }}>Salta le preferenze</button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ATTIVAZIONE FACE ID (a fine registrazione)
// ════════════════════════════════════════════════════════════
function AuthEnroll({ onEnable, onSkip }) {
  return (
    <div style={{ position: 'absolute', inset: 0, color: '#fff' }}>
      <AuthBackground />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{
          width: 104, height: 104, borderRadius: 28, marginBottom: 28,
          background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fade .4s ease',
        }}><FaceIDGlyph size={54} c="#fff" sw={2.2} /></div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Accedi con Face ID</div>
        <div style={{ fontSize: 15, color: '#F2D7DD', marginTop: 12, lineHeight: 1.55 }}>
          Vuoi usare il Face ID per i prossimi accessi? Entrerai in byup senza digitare la password.
        </div>
        <button onClick={onEnable} style={{
          width: '100%', padding: '16px', marginTop: 38, border: 'none', borderRadius: 16,
          background: A_CREAM, color: A_TEXT, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}>Attiva Face ID</button>
        <button onClick={onSkip} style={{
          width: '100%', padding: '14px', marginTop: 8, background: 'none', border: 'none',
          color: '#F2D7DD', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>Non ora</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SUCCESSO
// ════════════════════════════════════════════════════════════
function AuthSuccess({ name, onStart }) {
  return (
    <div style={{ position: 'absolute', inset: 0, color: '#fff' }}>
      <AuthBackground />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <img src="assets/mascot-wave.png" width="150" alt="" style={{ marginBottom: 20, animation: 'bkMascotIn 700ms cubic-bezier(.34,1.45,.64,1) backwards, bkBob 2.6s .8s ease-in-out infinite', filter: 'drop-shadow(0 16px 26px rgba(0,0,0,.3))' }}/>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 600 }}>Benvenuto{name ? `, ${name}` : ''}!</div>
        <div style={{ fontSize: 15, color: '#F2D7DD', marginTop: 12, lineHeight: 1.55 }}>
          Il tuo account è pronto. Scopri i migliori locali vicino a te e prenota in pochi tap.
        </div>
        <button onClick={onStart} style={{
          width: '100%', padding: '16px', marginTop: 40, border: 'none', borderRadius: 16,
          background: A_CREAM, color: A_TEXT, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}>Inizia ad esplorare</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SPLASH — gradiente pulito + logo, prima del login
// ════════════════════════════════════════════════════════════
function AuthSplash({ onDone }) {
  useEffectA(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div onClick={onDone} style={{
      position: 'absolute', inset: 0, cursor: 'pointer',
      background: `radial-gradient(120% 70% at 50% 12%, #E51A50 0%, #CC163F 34%, #8E1234 64%, #4E0C20 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src="byup-logo.png" alt="byup" width={132}
        style={{ height: 'auto', display: 'block', animation: 'fade 0.6s ease' }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// FLOW ORCHESTRATOR
// ════════════════════════════════════════════════════════════
function AuthFlow({ initial = 'login', onAuthenticated }) {
  // La splash precede il login solo all'ingresso normale (non sui deep-link).
  const [screen, setScreen] = useStateA(initial === 'login' ? 'splash' : initial);
  const [name, setName] = useStateA('');

  if (screen === 'splash') {
    return <AuthSplash onDone={() => setScreen('login')} />;
  }

  if (screen === 'login') {
    return <AuthLogin
      onLogin={() => onAuthenticated({ fromRegister: false })}
      onSocial={() => onAuthenticated({ fromRegister: false })}
      onRegister={() => setScreen('register')}
      onForgot={() => setScreen('forgot')}
    />;
  }
  if (screen === 'forgot') {
    return <AuthForgot onBack={() => setScreen('login')} />;
  }
  if (screen === 'register') {
    return <AuthRegister
      onBack={() => setScreen('login')}
      onDone={(data) => { setName(data.nome || ''); setScreen('enroll'); }}
    />;
  }
  if (screen === 'enroll') {
    return <AuthEnroll
      onEnable={() => { try { localStorage.setItem('byup_faceid', '1'); } catch {} setScreen('success'); }}
      onSkip={() => { try { localStorage.removeItem('byup_faceid'); } catch {} setScreen('success'); }}
    />;
  }
  if (screen === 'success') {
    return <AuthSuccess name={name} onStart={() => onAuthenticated({ fromRegister: true })} />;
  }
  return null;
}

// ════════════════════════════════════════════════════════════
// PERMESSI iOS (notifiche + posizione) — alert di sistema sopra l'app
// ════════════════════════════════════════════════════════════
function IOSAlert({ icon, title, message, actions }) {
  // actions: [{ label, bold, onPress }] — verticale se > 2
  const vertical = actions.length > 2;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.28)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fade .2s ease', fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <div style={{
        width: 270, borderRadius: 14, overflow: 'hidden',
        background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{ padding: '19px 16px 16px', textAlign: 'center' }}>
          {icon && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>{icon}</div>}
          <div style={{ fontSize: 17, fontWeight: 600, color: '#000', letterSpacing: -0.2 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#1a1a1a', marginTop: 4, lineHeight: 1.35 }}>{message}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', borderTop: '0.5px solid rgba(0,0,0,0.18)' }}>
          {actions.map((a, i) => (
            <button key={i} onClick={a.onPress} style={{
              flex: 1, padding: '12px 8px', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
              border: 'none',
              borderTop: vertical && i > 0 ? '0.5px solid rgba(0,0,0,0.18)' : 'none',
              borderLeft: !vertical && i > 0 ? '0.5px solid rgba(0,0,0,0.18)' : 'none',
              color: '#0a84ff', fontSize: 17, fontWeight: a.bold ? 600 : 400,
            }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthPermissions({ onDone }) {
  const [stepP, setStepP] = useStateA('loc'); // 'loc' → 'notif' → done
  const nextP = () => setStepP(s => (s === 'loc' ? 'notif' : (onDone(), s)));

  if (stepP === 'loc') {
    return <IOSAlert
      title={'Consentire a "byup" di usare la tua posizione?'}
      message="La useremo per mostrarti i locali vicini e le distanze. La posizione appare sulla mappa."
      actions={[
        { label: 'Consenti una volta', onPress: nextP },
        { label: "Consenti mentre usi l'app", bold: true, onPress: nextP },
        { label: 'Non consentire', onPress: nextP },
      ]}
    />;
  }
  return <IOSAlert
    title={'"byup" desidera inviarti notifiche'}
    message="Le notifiche possono includere avvisi, suoni e badge. Configurabili in Impostazioni."
    actions={[
      { label: 'Non consentire', onPress: nextP },
      { label: 'Consenti', bold: true, onPress: nextP },
    ]}
  />;
}

window.AuthFlow = AuthFlow;
window.AuthPermissions = AuthPermissions;

// Byup Staff — Login esercente + recupero password (prime schermate)

const { useState: useStateL, useEffect: useEffectL } = React;

// ─── Stili condivisi (tema scuro) ─────────────────────────────
// Resta un tema SCURO: il login è tutto testo bianco su fondo pieno, e le
// sfumature brand chiare non reggono il bianco (2,1:1). Qui il brand entra
// come tinta dei due aloni radiali: in alto il rosa profondo del logo
// (#E5446E), in basso il vinaccia che tiene giù il fondo scuro.
const LOGIN_BG = `
  radial-gradient(110% 55% at 50% -8%, rgba(229,68,110,0.34), transparent 60%),
  radial-gradient(130% 80% at 50% 112%, rgba(181,51,56,0.55), transparent 62%),
  linear-gradient(180deg, #1e1216 0%, #150d10 100%)`;

const dkLabel = { display: 'block', fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 8 };
const dkField = {
  display: 'flex', alignItems: 'center', gap: 10,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: ST.R_LG, padding: '0 14px', height: 54,
};
const dkInput = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  color: '#fff', fontSize: 15.5, fontFamily: 'inherit', height: '100%',
};
const dkPlaceholder = <style>{`.login-input::placeholder { color: rgba(255,255,255,0.38); }`}</style>;

const eyeIcon = (off) => off
  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 11s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;

// CTA piena (pink) riusabile
const PinkBtn = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    height: 56, width: '100%', borderRadius: ST.R_LG, border: 'none',
    background: ST.PINK, color: '#fff', fontSize: 16.5, fontWeight: 700, fontFamily: 'inherit',
    cursor: 'pointer', boxShadow: ST.SH_FAB,  // ombra neutra: il gestionale vieta le ombre tinte di brand
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...style,
  }}>{children}</button>
);

// ═══════════════════════════════════════════════════════════
// FACE ID GATE — sblocco al rientro (il 1° tentativo fallisce sempre)
// ═══════════════════════════════════════════════════════════
function FaceIdGate({ onSuccess, onCancel }) {
  const [phase, setPhase] = useStateL('scan');   // 'scan' | 'fail' | 'ok'
  const [tries, setTries] = useStateL(0);

  useEffectL(() => {
    if (phase === 'scan') {
      // Primo tentativo: fallisce sempre. Dal secondo in poi: sblocca.
      const t = setTimeout(() => setPhase(tries === 0 ? 'fail' : 'ok'), tries === 0 ? 1600 : 1300);
      return () => clearTimeout(t);
    }
    if (phase === 'ok') {
      const t = setTimeout(onSuccess, 650);
      return () => clearTimeout(t);
    }
  }, [phase, tries]);

  const retry = () => { setTries(t => t + 1); setPhase('scan'); };

  const accent = phase === 'ok' ? ST.OK : phase === 'fail' ? '#F87171' : ST.PINK;
  const titolo = phase === 'ok' ? 'Sbloccato'
               : phase === 'fail' ? 'Volto non riconosciuto'
               : 'Guarda lo schermo';
  const sotto  = phase === 'ok' ? ''
               : phase === 'fail' ? 'Non siamo riusciti a verificare il tuo volto. Riprova o usa la password.'
               : `Sblocco di Byup Staff · ${MERCHANT.nome}`;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 120, background: LOGIN_BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 32px', textAlign: 'center', animation: 'fidFade 200ms ease',
    }}>
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 32, border: `2px solid ${accent}`,
          boxShadow: `0 0 40px ${accent}55`,
          animation: phase === 'scan' ? 'fidPulse 1.4s ease-in-out infinite'
                   : phase === 'fail' ? 'fidShake 0.45s ease' : 'none',
        }}/>
        {phase === 'ok' ? <I.Check s={56} c={accent}/> : <I.FaceID s={64} c={accent}/>}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{titolo}</div>
      {sotto && <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: 300 }}>{sotto}</div>}

      {phase === 'fail' && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PinkBtn onClick={retry}><I.FaceID s={20} c="#fff"/> Riprova con Face ID</PinkBtn>
          <button onClick={onCancel} style={{
            height: 50, borderRadius: ST.R_LG, background: 'transparent',
            border: '1px solid rgba(255,255,255,0.18)', color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          }}>Usa la password</button>
        </div>
      )}

      <style>{`
        @keyframes fidFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fidPulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.06); opacity: 0.6 } }
        @keyframes fidShake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-8px) } 40% { transform: translateX(8px) } 60% { transform: translateX(-5px) } 80% { transform: translateX(5px) } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
function ScreenLogin({ nav, entraIn, faceIdOn = false }) {
  const [email, setEmail] = useStateL('');
  const [pw, setPw] = useStateL('');
  const [showPw, setShowPw] = useStateL(false);
  // Se il Face ID è attivo, al rientro parti dalla schermata di sblocco.
  const [gate, setGate] = useStateL(!!faceIdOn);

  // D-41 (P-53): dopo il login, gli ambienti in cui la persona può entrare
  // (staffAmbienti: appartenenze attive, per sede — P-145: decidono solo
  // loro). Con uno solo si entra dritti, altrimenti la lista.
  const entra = () => {
    const amb = staffAmbienti();
    if (amb.length === 1) entraIn(amb[0]); else nav.reset({ s: 'locali' });
  };

  // Il Face ID riprende l'ultimo ambiente: SESSIONE tiene il contesto come
  // sessions.active_* sul server, e la lista non si ripassa. Se non c'è un
  // contesto (primo accesso su questo telefono) si sceglie; se nel frattempo
  // l'appartenenza è stata spenta, la prossima azione lo dirà.
  if (gate) return <FaceIdGate onSuccess={() => SESSIONE.membership_id ? nav.reset({ s: 'incassa' }) : entra()} onCancel={() => setGate(false)}/>;

  return (
    <div style={{ minHeight: '100%', background: LOGIN_BG, padding: '64px 24px 32px', display: 'flex', flexDirection: 'column' }}>
      <Logo size={46} radius={ST.R_MD}/>

      <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.6, margin: '24px 0 8px', lineHeight: 1.1 }}>
        Accedi al tuo account
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, margin: 0 }}>
        Continua a gestire il tuo locale da dove l'hai lasciato.
      </p>

      {/* Continua con Google */}
      <button onClick={entra} style={{
        marginTop: 28, height: 54, width: '100%', borderRadius: ST.R_LG, cursor: 'pointer',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)',
        color: '#fff', fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.08H42V20H24v8h11.3c-1.65 4.66-6.08 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20c0-1.34-.14-2.65-.4-3.92z"/>
          <path fill="#FF3D00" d="M6.31 14.69l6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 16.32 4 9.66 8.34 6.31 14.69z"/>
          <path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.98 13.41-5.19l-6.19-5.24C29.21 35.09 26.72 36 24 36c-5.2 0-9.62-3.32-11.28-7.95l-6.52 5.03C9.5 39.56 16.23 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.08H42V20H24v8h11.3c-.79 2.24-2.23 4.17-4.09 5.57l6.19 5.24C36.97 39.2 44 34 44 24c0-1.34-.14-2.65-.4-3.92z"/>
        </svg>
        Continua con Google
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.14)' }}/>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>oppure</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.14)' }}/>
      </div>

      {/* Email */}
      <label style={dkLabel}>Email o nome utente</label>
      <div style={dkField}>
        <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="nome@locale.it" style={dkInput}/>
      </div>

      {/* Password */}
      <label style={{ ...dkLabel, marginTop: 18 }}>Password</label>
      <div style={dkField}>
        <input className="login-input" type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
          placeholder="Inserisci la password" onKeyDown={e => { if (e.key === 'Enter') entra(); }} style={dkInput}/>
        <button onClick={() => setShowPw(s => !s)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
        }}>{eyeIcon(showPw)}</button>
      </div>

      {/* Password dimenticata */}
      <button onClick={() => nav.push({ s: 'recupero' })} style={{
        alignSelf: 'flex-end', marginTop: 12, background: 'transparent', border: 'none',
        color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        textDecoration: 'underline', textUnderlineOffset: 3,
      }}>Password dimenticata?</button>

      <PinkBtn onClick={entra} style={{ marginTop: 22 }}>Accedi →</PinkBtn>

      {/* D-41: l'invito aggiunge un'appartenenza, l'utenza nasce solo se
          manca. Niente registrazione da qui, niente account creato dal locale. */}
      <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
        Ti ha invitato un locale?<br/>
        Accetta l'invito: se non hai ancora un'utenza, nasce lì.
      </div>

      {dkPlaceholder}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCELTA DEL LOCALE (D-41 · P-53) — dove entra la persona
// ═══════════════════════════════════════════════════════════
// Sul telefono personale: i locali che l'hanno invitata, sede per sede, col
// ruolo che vale in ciascuno. Con zero ambienti — tutte le appartenenze
// spente — lo dice e rimanda al login.
function ScreenLocali({ nav, entraIn }) {
  const amb = staffAmbienti();
  const gruppi = [];
  amb.forEach(a => { let g = gruppi.find(x => x.id === a.restaurant_id); if (!g) { g = { id: a.restaurant_id, nome: a.ristorante, voci: [] }; gruppi.push(g); } g.voci.push(a); });
  return (
    <div style={{ minHeight: '100%', background: LOGIN_BG, padding: '64px 24px 32px', display: 'flex', flexDirection: 'column' }}>
      <Logo size={46} radius={ST.R_MD}/>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.6, margin: '24px 0 8px', lineHeight: 1.1 }}>
        {amb.length === 0 ? 'Nessun locale ti ha invitato' : 'Dove entri?'}
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, margin: '0 0 24px' }}>
        {amb.length === 0
          ? 'Le tue appartenenze sono state disattivate: rivolgiti al titolare del locale.'
          : `Ciao ${PERSONA.nome.split(' ')[0]}, questi sono i locali che ti hanno invitato.`}
      </p>

      {gruppi.map(g => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          {!sede && g.voci.length > 1 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>{g.nome}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {g.voci.map(a => (
              <button key={a.venue_id} onClick={() => entraIn(a)} style={{
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: ST.R_LG, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{a.sede}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{a.citta} · {a.ruolo}</div>
                </div>
                <I.ChevRight s={18} c="rgba(255,255,255,0.5)"/>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }}/>
      <button onClick={() => nav.reset({ s: 'login' })} style={{
        alignSelf: 'center', background: 'transparent', border: 'none',
        color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>{amb.length === 0 ? 'Torna al login' : 'Esci'}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACCESSO DISATTIVATO (D-41 · P-53) — a sessione aperta
// ═══════════════════════════════════════════════════════════
// Il titolare ha spento l'appartenenza mentre la persona era dentro: la
// sessione si è chiusa alla sua prima azione e qui glielo si dice senza
// drammi. L'approdo è la lista se restano appartenenze attive, il login se
// era l'unica — evoluzione rispetto alla voce, che diceva solo login: con
// altri locali vivi rimandare al login farebbe rifare un accesso che c'è già.
function ScreenDisattivato({ nav, locale }) {
  const restano = staffAmbienti().length > 0;
  return (
    <div style={{ minHeight: '100%', background: LOGIN_BG, padding: '64px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{
        width: 76, height: 76, borderRadius: ST.R_PILL,
        background: 'rgba(255,90,95,0.18)', border: '1px solid rgba(255,90,95,0.40)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
      }}><I.Logout s={32} c={ST.PINK}/></div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.4, margin: '0 0 10px', lineHeight: 1.15 }}>Accesso disattivato</h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: '0 0 30px', maxWidth: 300 }}>
        Il tuo accesso a <b style={{ color: '#fff' }}>{locale}</b> è stato disattivato: rivolgiti al titolare.
      </p>
      <PinkBtn onClick={() => nav.reset({ s: restano ? 'locali' : 'login' })} style={{ maxWidth: 300 }}>
        {restano ? 'Vai ai tuoi locali' : 'Torna al login'}
      </PinkBtn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RECUPERO PASSWORD — email → conferma invio
// ═══════════════════════════════════════════════════════════
function ScreenRecupero({ nav }) {
  const [email, setEmail] = useStateL('');
  const [sent, setSent] = useStateL(false);

  const invia = () => { if (email.trim()) setSent(true); };

  return (
    <div style={{ minHeight: '100%', background: LOGIN_BG, padding: '64px 24px 32px', display: 'flex', flexDirection: 'column' }}>
      {/* Back */}
      <button onClick={() => nav.pop()} style={{
        width: 44, height: 44, borderRadius: ST.R_PILL, border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.07)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
      }}><I.Back s={20} c="#fff"/></button>

      {!sent ? (
        <>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5, margin: '0 0 8px', lineHeight: 1.15 }}>
            Recupera password
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, margin: '0 0 28px' }}>
            Inserisci l'email del tuo account: ti invieremo un link per reimpostare la password.
          </p>

          <label style={dkLabel}>Email</label>
          <div style={dkField}>
            <I.Mail s={18} c="rgba(255,255,255,0.6)"/>
            <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nome@locale.it" onKeyDown={e => { if (e.key === 'Enter') invia(); }} style={dkInput}/>
          </div>

          <PinkBtn onClick={invia} style={{ marginTop: 24, opacity: email.trim() ? 1 : 0.5 }}>
            Invia link di recupero
          </PinkBtn>

          <button onClick={() => nav.pop()} style={{
            marginTop: 18, alignSelf: 'center', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Torna al login</button>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 60 }}>
          <div style={{
            width: 76, height: 76, borderRadius: ST.R_PILL,
            background: 'rgba(255,90,95,0.18)', border: '1px solid rgba(255,90,95,0.40)',  // corallo brand
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
          }}><I.Mail s={34} c={ST.PINK}/></div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.4, margin: '0 0 10px' }}>
            Controlla la tua email
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: '0 0 30px', maxWidth: 300 }}>
            Abbiamo inviato un link per reimpostare la password a <b style={{ color: '#fff' }}>{email}</b>. Controlla anche lo spam.
          </p>

          <PinkBtn onClick={() => nav.reset({ s: 'login' })} style={{ maxWidth: 300 }}>Torna al login</PinkBtn>

          <button onClick={() => setSent(false)} style={{
            marginTop: 18, background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Non hai ricevuto nulla? Reinvia</button>
        </div>
      )}

      {dkPlaceholder}
    </div>
  );
}

Object.assign(window, { ScreenLogin, ScreenLocali, ScreenDisattivato, ScreenRecupero });

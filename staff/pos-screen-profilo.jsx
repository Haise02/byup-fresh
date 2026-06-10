// Byup Staff — Profilo esercente + impostazioni

const { useState: useStatePr } = React;

function ScreenProfilo({ nav, openModal, faceIdOn = false, setFaceIdOn = () => {} }) {
  // Interruttore stile iOS
  const Toggle = ({ on, onChange }) => (
    <button onClick={() => onChange(!on)} style={{
      width: 50, height: 30, borderRadius: ST.R_PILL, border: 'none', cursor: 'pointer', padding: 2,
      background: on ? ST.PINK_DARK : ST.MUTED_3, transition: 'background 200ms', flexShrink: 0,
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', alignItems: 'center',
    }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
    </button>
  );

  const ToggleRow = ({ icon, label, sub, on, onChange, last }) => {
    const Ic = icon;
    return (
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
        borderBottom: last ? 'none' : `1px solid ${ST.BORDER_SOFT}`,
      }}>
        {Ic && <div style={{
          width: 32, height: 32, borderRadius: ST.R_SM, background: ST.SURF_ALT,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Ic s={17} c={ST.TEXT}/></div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: ST.TEXT }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
        </div>
        <Toggle on={on} onChange={onChange}/>
      </div>
    );
  };

  const Row = ({ icon, label, value, onClick, last, danger }) => {
    const Ic = icon;
    return (
      <button onClick={onClick} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
        background: 'transparent', border: 'none', cursor: onClick ? 'pointer' : 'default',
        borderBottom: last ? 'none' : `1px solid ${ST.BORDER_SOFT}`, fontFamily: 'inherit', textAlign: 'left',
      }}>
        {Ic && <div style={{
          width: 32, height: 32, borderRadius: ST.R_SM, background: ST.SURF_ALT,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Ic s={17} c={danger ? ST.FAIL : ST.TEXT}/></div>}
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: danger ? ST.FAIL : ST.TEXT }}>{label}</span>
        {value && <span style={{ fontSize: 13, color: ST.MUTED, fontWeight: 600 }}>{value}</span>}
        {onClick && !danger && <I.ChevRight s={16} c={ST.MUTED_2}/>}
      </button>
    );
  };

  const Group = ({ header, children }) => (
    <div style={{ padding: '14px 16px 0' }}>
      {header && <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>{header}</div>}
      <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>{children}</div>
    </div>
  );

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 100 }}>
      {/* Header esercente */}
      <div style={{ padding: '54px 20px 20px', background: '#fff', borderBottom: `1px solid ${ST.BORDER_SOFT}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo size={56} radius={ST.R_LG}/>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT }}>{MERCHANT.nome}</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 2 }}>{MERCHANT.operatore}</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 2 }}>{MERCHANT.email}</div>
        </div>
      </div>

      {/* Account */}
      <Group header="Account">
        <Row icon={I.Shield} label="Modifica password" onClick={() => nav.push({ s: 'password' })}/>
        <ToggleRow
          icon={I.FaceID}
          label="Sblocco con Face ID"
          sub="Accedi con il riconoscimento del volto, senza password"
          on={faceIdOn}
          onChange={next => next
            ? setFaceIdOn(true)
            : openModal({ kind: 'faceid-off', onConfirm: () => setFaceIdOn(false) })}
          last
        />
      </Group>

      {/* Legale */}
      <Group header="Legale">
        <Row icon={I.Doc} label="Termini e condizioni" onClick={() => openModal({ kind: 'legal', which: 'termini' })}/>
        <Row icon={I.Shield} label="Privacy" onClick={() => openModal({ kind: 'legal', which: 'privacy' })} last/>
      </Group>

      {/* Logout */}
      <Group>
        <Row icon={I.Logout} label="Esci" onClick={() => openModal({ kind: 'logout', onConfirm: () => nav.reset({ s: 'login' }) })} danger last/>
      </Group>

      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: ST.MUTED_2, fontWeight: 600 }}>
        Byup Staff · v1.0
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MODIFICA PASSWORD — attuale → nuova → conferma → esito
// ═══════════════════════════════════════════════════════════
function ScreenPassword({ nav }) {
  const [attuale, setAttuale] = useStatePr('');
  const [nuova, setNuova] = useStatePr('');
  const [conferma, setConferma] = useStatePr('');
  const [showAtt, setShowAtt] = useStatePr(false);
  const [showNuova, setShowNuova] = useStatePr(false);
  const [showConf, setShowConf] = useStatePr(false);
  const [salvato, setSalvato] = useStatePr(false);
  const [errore, setErrore] = useStatePr('');

  // occhietto mostra/nascondi (tema chiaro) — funzione che ritorna JSX, niente rimontaggio
  const eye = (visible, toggle) => (
    <button type="button" onClick={toggle} style={{
      background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
      display: 'flex', alignItems: 'center',
    }}>
      {visible
        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 11s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>}
    </button>
  );

  const salva = () => {
    if (!attuale) return setErrore('Inserisci la password attuale');
    if (nuova.length < 8) return setErrore('La nuova password deve avere almeno 8 caratteri');
    if (nuova === attuale) return setErrore('La nuova password deve essere diversa da quella attuale');
    if (nuova !== conferma) return setErrore('Le due password non coincidono');
    setErrore('');
    setSalvato(true);
  };

  const fld = {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff', border: `1px solid ${ST.BORDER}`,
    borderRadius: ST.R_LG, padding: '0 14px', height: 52,
  };
  const inp = {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    color: ST.TEXT, fontSize: 15.5, fontFamily: 'inherit', height: '100%',
  };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: ST.TEXT, margin: '18px 0 8px' };

  return (
    <div style={{ background: ST.BG, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con back */}
      <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav.pop()} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
          background: ST.SURF_ALT, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Back s={20}/></button>
        <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Modifica password</div>
      </div>

      {salvato ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px 60px' }}>
          <div style={{
            width: 76, height: 76, borderRadius: ST.R_PILL, background: ST.PINK_SOFT,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}><I.Check s={36} c={ST.PINK_DARK}/></div>
          <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, marginBottom: 8 }}>Password aggiornata</div>
          <div style={{ fontSize: 14.5, color: ST.MUTED, lineHeight: 1.5, maxWidth: 280 }}>
            La tua password è stata modificata. Usala al prossimo accesso.
          </div>
          <button onClick={() => nav.pop()} style={{
            marginTop: 28, height: 52, width: '100%', maxWidth: 300, borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: ST.SH_FAB,
          }}>Fatto</button>
        </div>
      ) : (
        <div style={{ padding: '8px 20px 32px' }}>
          <p style={{ fontSize: 14.5, color: ST.MUTED, lineHeight: 1.5, margin: '4px 0 8px' }}>
            Scegli una nuova password di almeno 8 caratteri.
          </p>

          <label style={lbl}>Password attuale</label>
          <div style={fld}>
            <input type={showAtt ? 'text' : 'password'} value={attuale} onChange={e => setAttuale(e.target.value)}
              placeholder="Inserisci la password attuale" style={inp}/>
            {eye(showAtt, () => setShowAtt(s => !s))}
          </div>

          <label style={lbl}>Nuova password</label>
          <div style={fld}>
            <input type={showNuova ? 'text' : 'password'} value={nuova} onChange={e => setNuova(e.target.value)}
              placeholder="Almeno 8 caratteri" style={inp}/>
            {eye(showNuova, () => setShowNuova(s => !s))}
          </div>

          <label style={lbl}>Conferma nuova password</label>
          <div style={fld}>
            <input type={showConf ? 'text' : 'password'} value={conferma} onChange={e => setConferma(e.target.value)}
              placeholder="Ripeti la nuova password" onKeyDown={e => { if (e.key === 'Enter') salva(); }} style={inp}/>
            {eye(showConf, () => setShowConf(s => !s))}
          </div>

          {errore && (
            <div style={{ marginTop: 14, fontSize: 13.5, fontWeight: 600, color: ST.FAIL }}>{errore}</div>
          )}

          <button onClick={salva} style={{
            marginTop: 24, height: 56, width: '100%', borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: ST.SH_FAB,
          }}>Aggiorna password</button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ScreenProfilo, ScreenPassword });

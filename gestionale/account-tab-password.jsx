// Account — Tab Password e sicurezza

function AccPasswordSicurezza() {
  // Logout: vive qui, tra le sessioni — azione rara, contesto di sicurezza.
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <AcCard title="Password" subtitle="Aggiorna la password dell'account.">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginBottom: 18}}>
          <AcInput label="Password attuale" type="password" placeholder="••••••••"/>
          <div/>
          <AcInput label="Nuova password" type="password" placeholder="Almeno 8 caratteri"/>
          <AcInput label="Conferma nuova password" type="password" placeholder="Ripeti la password"/>
        </div>
        <button style={{
          padding:'11px 20px', borderRadius: 999,
          background: PN.TEXT, color: PN.WHITE, border:'none',
          fontSize: 15, fontWeight: 600, cursor:'pointer',
          fontFamily:'inherit',
        }}>Aggiorna password</button>
      </AcCard>

      <AcCard title="Autenticazione a due fattori" subtitle="Aggiungi un secondo livello di sicurezza.">
        <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 12}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>App di autenticazione</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>
              Usa Authy, Google Authenticator o 1Password.
            </div>
          </div>
          <AcToggle initial={true}/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>SMS al telefono</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>
              Codice via SMS al +39 333 12•••67.
            </div>
          </div>
          <AcToggle initial={false}/>
        </div>
      </AcCard>

      <AcCard title="Sessioni attive" subtitle="Dispositivi e browser collegati.">
        <div style={{display:'flex', flexDirection:'column', gap: 0}}>
          {ACC_SESSIONI.map((s,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 14,
              padding:'14px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 8,
                background: PN.PINK_SOFT, color: PN.PINK_DARK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </span>
              <div style={{flex:1}}>
                <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, display:'flex', alignItems:'center', gap: 8}}>
                  {s.device}
                  {s.current && (
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      padding:'2px 8px', borderRadius: 999,
                      background: PN.GREEN_SOFT, color: PN.GREEN,
                    }}>Questa sessione</span>
                  )}
                </div>
                <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>{s.loc} · {s.when}</div>
              </div>
              {s.current ? (
                <button
                  onClick={() => setLogoutConfirm(true)}
                  style={{
                  padding:'7px 14px', borderRadius: 999,
                  background:'transparent', color: PN.TEXT,
                  border:`1px solid ${PN.BORDER}`,
                  fontSize: 14, fontWeight: 600, cursor:'pointer',
                  fontFamily:'inherit',
                  display:'inline-flex', alignItems:'center', gap: 6,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Esci dall'account
                </button>
              ) : (
                <button style={{
                  padding:'7px 14px', borderRadius: 999,
                  background:'transparent', color: PN.RED,
                  border:`1px solid ${PN.BORDER}`,
                  fontSize: 14, fontWeight: 600, cursor:'pointer',
                  fontFamily:'inherit',
                }}>Termina</button>
              )}
            </div>
          ))}
        </div>
        <button style={{
          marginTop: 14,
          padding:'10px 18px', borderRadius: 999,
          background: PN.WHITE, color: PN.RED,
          border:`1px solid ${PN.RED}`,
          fontSize: 14.5, fontWeight: 700, cursor:'pointer',
          fontFamily:'inherit',
        }}>Termina tutte le altre sessioni</button>
      </AcCard>

      {/* Popup conferma logout */}
      {logoutConfirm && (
        <div onClick={() => setLogoutConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 380, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: PN.PINK_SOFT, color: PN.PINK_DARK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Esci dall'account?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  La sessione su questo dispositivo verrà terminata.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { window.location.href = 'byup Login.html'; }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: PN.BTN_DARK, color: PN.WHITE,
                  border: '1px solid rgba(0,0,0,0.32)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Esci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AcInput({ label, type='text', placeholder }) {
  return (
    <div>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <input type={type} placeholder={placeholder} style={{
        width:'100%',
        padding:'10px 12px', borderRadius: 10,
        border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
        fontSize: 15.5, color: PN.TEXT, fontFamily:'inherit',
        outline:'none',
      }}/>
    </div>
  );
}

function AcToggle({ initial }) {
  const [on, setOn] = React.useState(!!initial);
  return (
    <button onClick={() => setOn(o => !o)} style={{
      width: 44, height: 24, borderRadius: 999,
      background: on ? PN.PINK_DARK : '#D4D4D8',
      border:'none', cursor:'pointer',
      position:'relative', transition:'background 0.15s',
    }}>
      <span style={{
        position:'absolute', top: 2, left: on ? 22 : 2,
        width: 20, height: 20, borderRadius:'50%',
        background: PN.WHITE, transition:'left 0.15s',
      }}/>
    </button>
  );
}

window.AccPasswordSicurezza = AccPasswordSicurezza;
window.AcInput = AcInput;
window.AcToggle = AcToggle;

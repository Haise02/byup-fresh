// Account — Tab Password e sicurezza

function AccPasswordSicurezza() {
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
          fontSize: 13, fontWeight: 600, cursor:'pointer',
          fontFamily:'inherit',
        }}>Aggiorna password</button>
      </AcCard>

      <AcCard title="Autenticazione a due fattori" subtitle="Aggiungi un secondo livello di sicurezza.">
        <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 12}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>App di autenticazione</div>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2}}>
              Usa Authy, Google Authenticator o 1Password.
            </div>
          </div>
          <AcToggle initial={true}/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>SMS al telefono</div>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2}}>
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
                <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT, display:'flex', alignItems:'center', gap: 8}}>
                  {s.device}
                  {s.current && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding:'2px 8px', borderRadius: 999,
                      background: PN.GREEN_SOFT, color: PN.GREEN,
                    }}>Questa sessione</span>
                  )}
                </div>
                <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>{s.loc} · {s.when}</div>
              </div>
              {!s.current && (
                <button style={{
                  padding:'7px 14px', borderRadius: 999,
                  background:'transparent', color: PN.RED,
                  border:`1px solid ${PN.BORDER}`,
                  fontSize: 12, fontWeight: 600, cursor:'pointer',
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
          fontSize: 12.5, fontWeight: 700, cursor:'pointer',
          fontFamily:'inherit',
        }}>Termina tutte le altre sessioni</button>
      </AcCard>
    </div>
  );
}

function AcInput({ label, type='text', placeholder }) {
  return (
    <div>
      <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <input type={type} placeholder={placeholder} style={{
        width:'100%',
        padding:'10px 12px', borderRadius: 10,
        border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
        fontSize: 13.5, color: PN.TEXT, fontFamily:'inherit',
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

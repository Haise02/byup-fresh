// Account — Tab Password e sicurezza

// Hover dei pulsanti "Termina". A riposo restano spenti; il rosso compare
// solo quando ci passi sopra, cioe' nel momento in cui l'informazione serve
// davvero — invece di gridare a ogni apertura della pagina.
// scale(1.04) e' lo stesso ingrandimento dei pulsanti piano in
// account-tab-piani.jsx, non un'animazione inventata qui.
// L'inchiostro hover e' #B91C1C e non PN.RED: su RED_SOFT il PN.RED si ferma
// a 3,95:1, questo tiene 5,30:1.
const AC_TERM_REST  = { bg: PN.WHITE,    ink: PN.MUTED, bd: PN.BORDER };
const AC_TERM_HOVER = { bg: PN.RED_SOFT, ink: '#B91C1C', bd: '#FCA5A5' };
const AC_TERM_TRANSITION = 'color 150ms, border-color 150ms, background 150ms, transform 150ms ease-out';

const acTerminaHover = {
  onMouseEnter: e => {
    const s = e.currentTarget.style;
    s.background = AC_TERM_HOVER.bg; s.color = AC_TERM_HOVER.ink;
    s.borderColor = AC_TERM_HOVER.bd; s.transform = 'scale(1.04)';
  },
  onMouseLeave: e => {
    const s = e.currentTarget.style;
    s.background = AC_TERM_REST.bg; s.color = AC_TERM_REST.ink;
    s.borderColor = AC_TERM_REST.bd; s.transform = 'scale(1)';
  },
};

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
              {/* Bianco e nero, non rosa brand: un dispositivo collegato e'
                  un dato neutro. Il rosa qui accendeva ogni riga come se
                  fosse notevole, e rubava l'occhio al badge verde della
                  sessione corrente, che invece l'informazione ce l'ha. */}
              <span style={{
                width: 36, height: 36, borderRadius: 8,
                background: PN.WHITE_HUSH, color: PN.TEXT,
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
              {/* Spento, non rosso: chiudere una sessione e' manutenzione
                  ordinaria, non un'emergenza. Stesso trattamento del logout
                  in account-tab-dati.jsx, che e' la stessa azione. */}
              {!s.current && (
                <button {...acTerminaHover} style={{
                  padding:'7px 14px', borderRadius: 999,
                  background: AC_TERM_REST.bg, color: AC_TERM_REST.ink,
                  border:`1px solid ${AC_TERM_REST.bd}`,
                  fontSize: 14, fontWeight: 600, cursor:'pointer',
                  fontFamily:'inherit',
                  transform:'scale(1)',   // esplicito: cosi' riposo e post-hover sono lo stesso stato
                  transition: AC_TERM_TRANSITION,
                }}>Termina</button>
              )}
            </div>
          ))}
        </div>
        <button {...acTerminaHover} style={{
          marginTop: 14,
          padding:'10px 18px', borderRadius: 999,
          background: AC_TERM_REST.bg, color: AC_TERM_REST.ink,
          border:`1px solid ${AC_TERM_REST.bd}`,
          fontSize: 14.5, fontWeight: 700, cursor:'pointer',
          fontFamily:'inherit',
          transform:'scale(1)',
          transformOrigin: 'left center',   // e' allineato a sinistra: cresce verso destra, non "salta"
          transition: AC_TERM_TRANSITION,
        }}>Termina tutte le altre sessioni</button>
      </AcCard>

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

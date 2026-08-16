// Step 3: Integrazioni, info locale, fatturazione, referente

function Step3SalesIntegrations({ onNext, onBack }) {
  // Integrazioni
  const [stripeStatus, setStripeStatus] = React.useState('disconnected');
  const [openapiStatus, setOpenapiStatus] = React.useState('disconnected');
  // Info locale
  const [businessName, setBusinessName] = React.useState('Cacio e Pepe');
  const [city, setCity] = React.useState('Roma');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  // Fatturazione
  const [piva, setPiva] = React.useState('');
  const [ragSoc, setRagSoc] = React.useState('');
  const [iban, setIban] = React.useState('');
  // Referente
  const [refFirstName, setRefFirstName] = React.useState('');
  const [refLastName, setRefLastName] = React.useState('');
  const [refEmail, setRefEmail] = React.useState('');

  const required = stripeStatus === 'connected' && openapiStatus === 'connected';

  return (
    <div style={{padding:'40px 48px 64px', background:ONB.BG_SOFT, minHeight:760}}>
      <div style={{maxWidth:1080, margin:'0 auto'}}>

        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7,
            background:ONB.PINK_SOFT, color:ONB.PINK_DARK,
            padding:'6px 12px', borderRadius:999,
            fontSize:11.5, fontWeight:700, marginBottom:14, letterSpacing:0.3,
          }}>
            STEP 3 · 3 MINUTI
          </div>
          <h1 style={{fontSize:36, fontWeight:800, margin:'0 0 8px', letterSpacing:-0.8}}>
            Collega i sistemi di pagamento e dicci chi sei.
          </h1>
          <p style={{fontSize:15, color:ONB.MUTED, margin:0}}>
            Collega i servizi per ricevere pagamenti e fatturare, poi inserisci i dati del tuo locale.
          </p>
        </div>

        {/* Integrazioni */}
        <Card3>
          <CardHeader3 num="1" title="Pagamenti e fatturazione" sub="Servizi necessari per accettare pagamenti e emettere ricevute."/>
          <div style={{padding:'8px 24px 22px'}}>
            <IntegrationCard
              logo="stripe"
              name="Stripe"
              tag="OBBLIGATORIO"
              desc="Per accettare pagamenti dai clienti al tavolo e dall'app. Commissioni standard Stripe: (1.5% + 0.25€ per transazione in Europa)."
              status={stripeStatus}
              setStatus={setStripeStatus}
              accountInfo="acct_••••dE3v · Cacio e Pepe S.r.l."
            />
            <div style={{height:12}}/>
            <IntegrationCard
              logo="openapi"
              name="Sistema di Fatturazione Elettronica"
              tag="OBBLIGATORIO"
              desc="Per emettere ricevute e fatture elettroniche tramite SDI. Conforme alla normativa italiana."
              status={openapiStatus}
              setStatus={setOpenapiStatus}
              accountInfo="API key configurata · Cacio e Pepe S.r.l."
            />
          </div>
        </Card3>

        <div style={{height:18}}/>

        {/* Info locale */}
        <Card3>
          <CardHeader3 num="2" title="Informazioni del locale" sub="Quello che vedono i clienti sulla tua vetrina"/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'18px 24px 22px'}}>
            <Field4 label="Nome del locale" value={businessName} onChange={setBusinessName}/>
            <Field4 label="Città" value={city} onChange={setCity}/>
            <Field4 label="Indirizzo" value={address} onChange={setAddress} placeholder="es. Via dei Giubbonari 27"/>
            <Field4 label="Telefono" value={phone} onChange={setPhone} placeholder="06 1234 5678"/>
          </div>
          <div style={{
            margin:'4px 24px 0', padding:'14px 0 0',
            borderTop:`1px dashed ${ONB.BORDER_SOFT}`,
          }}>
            <div style={{
              fontSize:11, fontWeight:700, color: ONB.PINK_DARK, letterSpacing:0.4,
              textTransform:'uppercase', marginBottom:10,
            }}>Referente — chi contattare per le comunicazioni sul tuo account</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, paddingBottom:22}}>
              <Field4 label="Nome" value={refFirstName} onChange={setRefFirstName} placeholder="Marco"/>
              <Field4 label="Cognome" value={refLastName} onChange={setRefLastName} placeholder="Rossi"/>
              <Field4 label="Email" value={refEmail} onChange={setRefEmail} placeholder="marco@cacioepepe.it"/>
            </div>
          </div>
        </Card3>

        <div style={{height:18}}/>

        {/* Fatturazione */}
        <Card3>
          <CardHeader3 num="3" title="Fatturazione" sub="Per emettere ricevute · Puoi completare i dettagli più tardi"/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'18px 24px 14px'}}>
            <Field4 label="Partita IVA" value={piva} onChange={setPiva} placeholder="IT00000000000"/>
            <Field4 label="Ragione sociale" value={ragSoc} onChange={setRagSoc} placeholder="es. Cacio e Pepe S.r.l."/>
            <Field4 label="IBAN per gli incassi" value={iban} onChange={setIban} placeholder="IT00 X000 0000 0000 0000 0000 000" wide/>
          </div>
          <div style={{
            margin:'0 24px 22px', padding:'10px 14px',
            background:ONB.BG, borderRadius:8, fontSize:12, color:ONB.MUTED,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <OnbIcon.Sparkle size={13} color={ONB.PINK}/>
            Puoi aggiungere REA, codice SDI e regime fiscale in seguito dalle impostazioni.
          </div>
        </Card3>

        {/* Footer */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          marginTop:32, paddingTop:24, borderTop:`1px solid ${ONB.BORDER_SOFT}`,
        }}>
          <button onClick={onBack} style={{
            background:'transparent', border:`1px solid ${ONB.BORDER}`, color:ONB.TEXT,
            padding:'12px 22px', borderRadius:10, fontSize:14, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit',
          }}>← Indietro</button>

          <div style={{display:'flex', alignItems:'center', gap:14}}>
            {!required && (
              <div style={{fontSize:12.5, color:ONB.MUTED, fontWeight:600}}>
                Collega Stripe e Fatturazione per continuare
              </div>
            )}
            <button onClick={required ? onNext : undefined} disabled={!required} style={{
              background: required ? ONB.PINK : ONB.BORDER, color:'#fff', border:'none',
              padding:'14px 28px', borderRadius:12, fontSize:15, fontWeight:700,
              cursor: required ? 'pointer' : 'not-allowed', fontFamily:'inherit',
              boxShadow: required ? '0 4px 14px rgba(233,30,99,0.3)' : 'none',
              display:'flex', alignItems:'center', gap:8,
            }}>
              Continua <OnbIcon.ChevronRight size={14} color="#fff"/>
            </button>
          </div>
        </div>
      </div>

      {/* Stripe redirect modal */}
      {stripeStatus === 'redirecting' && (
        <RedirectModal
          provider="Stripe"
          url="connect.stripe.com/oauth"
          onDone={()=>setStripeStatus('connected')}
          onCancel={()=>setStripeStatus('disconnected')}
        />
      )}
      {openapiStatus === 'redirecting' && (
        <RedirectModal
          provider="OpenAPI"
          url="oauth2.openapi.com/authorize"
          onDone={()=>setOpenapiStatus('connected')}
          onCancel={()=>setOpenapiStatus('disconnected')}
        />
      )}
    </div>
  );
}

function Card3({children}){
  return <div style={{
    background:'#fff', border:`1px solid ${ONB.BORDER_SOFT}`,
    borderRadius:14, overflow:'hidden',
  }}>{children}</div>;
}

function CardHeader3({num, title, sub}){
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:14,
      padding:'18px 24px', borderBottom:`1px solid ${ONB.BORDER_SOFT}`,
    }}>
      <div style={{
        width:28, height:28, borderRadius:'50%',
        background:ONB.ACCENT_WARM, color:ONB.ACCENT_WARM_TEXT,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:800, flexShrink:0, marginTop:1,
        border:`1px solid ${ONB.BORDER_SOFT}`,
      }}>{num}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15.5, fontWeight:800, letterSpacing:-0.2}}>{title}</div>
        <div style={{fontSize:12.5, color:ONB.MUTED, marginTop:3, lineHeight:1.45}}>{sub}</div>
      </div>
    </div>
  );
}

const stepBtn3 = {
  width:36, height:36, borderRadius:'50%',
  background:'#fff', border:`1px solid ${ONB.BORDER}`,
  color:ONB.TEXT, fontSize:18, fontWeight:700, cursor:'pointer',
  fontFamily:'inherit',
};

function IntegrationCard({logo, name, tag, desc, status, setStatus, accountInfo}){
  const connected = status === 'connected';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:16,
      padding:'18px 18px',
      border:`1.5px solid ${connected ? ONB.GREEN : ONB.BORDER}`,
      borderRadius:12, background: connected ? ONB.GREEN_SOFT : '#fff',
    }}>
      <ProviderLogo logo={logo} size={48}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
          <span style={{fontSize:15, fontWeight:800, letterSpacing:-0.2}}>{name}</span>
          {tag && (
            <span style={{
              fontSize:9.5, fontWeight:800, letterSpacing:0.4,
              background: connected ? ONB.GREEN : ONB.PINK_DARK, color:'#fff',
              padding:'2px 7px', borderRadius:4,
            }}>{connected ? 'CONNESSO' : tag}</span>
          )}
        </div>
        <div style={{fontSize:12.5, color: connected ? ONB.GREEN : ONB.MUTED, lineHeight:1.45}}>
          {connected ? accountInfo : desc}
        </div>
      </div>
      {connected ? (
        <button onClick={()=>setStatus('disconnected')} style={{
          background:'transparent', color: ONB.MUTED, border:'none',
          padding:'8px 12px', borderRadius:7, fontSize:12, fontWeight:600,
          cursor:'pointer', fontFamily:'inherit',
        }}>Disconnetti</button>
      ) : (
        <button onClick={()=>setStatus('redirecting')} style={{
          background: ONB.TEXT, color:'#fff', border:'none',
          padding:'10px 18px', borderRadius:8, fontSize:13, fontWeight:700,
          cursor:'pointer', fontFamily:'inherit',
          display:'flex', alignItems:'center', gap:6,
        }}>
          Collega <OnbIcon.ChevronRight size={11} color="#fff"/>
        </button>
      )}
    </div>
  );
}

function ProviderLogo({logo, size=36}){
  const styles = {
    width: size, height: size, borderRadius: 10,
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize: size * 0.42, fontWeight: 800, color:'#fff', flexShrink: 0,
  };
  if (logo === 'stripe') return <div style={{...styles, background:'#635BFF'}}>S</div>;
  if (logo === 'openapi') return <div style={{...styles, background:'#0EA5E9'}}>API</div>;
  if (logo === 'gmb') return <div style={{...styles, background:'#fff', border:`1px solid ${ONB.BORDER}`, color:'#4285F4'}}>G</div>;
  if (logo === 'thefork') return <div style={{...styles, background:'#00A887'}}>F</div>;
  if (logo === 'cassa') return <div style={{...styles, background:'#1a1a1a'}}>€</div>;
  if (logo === 'brevo') return <div style={{...styles, background:'#0B996E'}}>B</div>;
  return <div style={{...styles, background:ONB.MUTED}}>?</div>;
}

function RedirectModal({provider, url, onDone, onCancel}){
  React.useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, backdropFilter:'blur(4px)',
    }}>
      <div style={{
        background:'#fff', borderRadius:14, padding:'28px 32px', maxWidth:420,
        textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width:48, height:48, margin:'0 auto 14px',
          border:`3px solid ${ONB.PINK_SOFT}`, borderTopColor: ONB.PINK,
          borderRadius:'50%', animation:'spin 0.8s linear infinite',
        }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{fontSize:17, fontWeight:800, marginBottom:6}}>Connessione a {provider}…</div>
        <div style={{fontSize:13, color:ONB.MUTED, marginBottom:18}}>
          Reindirizzamento a <code style={{fontSize:11.5, background:ONB.BG, padding:'1px 6px', borderRadius:4}}>{url}</code>
        </div>
        <button onClick={onCancel} style={{
          background:'transparent', border:`1px solid ${ONB.BORDER}`,
          color:ONB.MUTED, padding:'8px 18px', borderRadius:8,
          fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        }}>Annulla</button>
      </div>
    </div>
  );
}

// Note: Field4 is defined here AND in onboarding-step4-go-live.jsx (loaded after).
// Defining locally so step 3 works regardless of script load order.
function Field4({label, value, onChange, placeholder, wide}){
  return (
    <div style={wide?{gridColumn:'1 / -1'}:{}}>
      <label style={{
        fontSize:11.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
        textTransform:'uppercase', marginBottom:6, display:'block',
      }}>{label}</label>
      <input
        value={value||''}
        onChange={e=>onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', padding:'10px 12px', border:`1px solid ${ONB.BORDER}`,
          borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
        }}/>
    </div>
  );
}

window.Step3SalesIntegrations = Step3SalesIntegrations;

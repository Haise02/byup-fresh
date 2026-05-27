// Impostazioni → POS e integrazioni (rifatto: filtri chip, stato chiaro, suggeriti)

const BYUP_PAY_DEVICES = [
  { id: 'bp-01', name: 'iPhone 14 Pro', os: 'iOS 17.4', user: 'Marco Silvestri', email: 'marco@delborgo.it', linkedAt: '12 mar 2024', lastUse: '2 min fa', online: true },
  { id: 'bp-02', name: 'Samsung Galaxy S23', os: 'Android 14', user: 'Sara Conti', email: 'sara@delborgo.it', linkedAt: '5 apr 2024', lastUse: '1 ora fa', online: false },
];

const INTEGRATIONS = [
  // Pagamenti & fatturazione (obbligatori)
  { id:'stripe', name:'Stripe', cat:'pagamenti', logo:'S', bg:'#635BFF', desc:'Pagamenti online & checkout', status:'connected', detail:'acct_••••dE3v · sync ora', required: true },
  { id:'openapi', name:'OpenAPI', cat:'pagamenti', logo:'API', bg:'#0EA5E9', desc:'Fatturazione elettronica SDI', status:'connected', detail:'API key configurata', required: true },
  { id:'aruba', name:'Aruba Fatturazione', cat:'pagamenti', logo:'A', bg:'#00A651', desc:'Emetti e ricevi fatture elettroniche in modo smart', status:'available', detail:'Fattura B2B/B2C, conservazione a norma' },
  // Periferiche — stampante unica con scelta di connessione
  { id:'printer', name:'Stampante scontrino di cortesia', cat:'periferiche', logo:'🖨', bg:'#1F2937', desc:'Connessione Bluetooth, USB o Wi-Fi', status:'available' },
  // Delivery
  { id:'justeat', name:'Just Eat', cat:'delivery', logo:'JE', bg:'#FF8000', desc:'Delivery & ordini', status:'connected', detail:'sync 5 min fa' },
  { id:'deliveroo', name:'Deliveroo', cat:'delivery', logo:'D', bg:'#00CCBC', desc:'Delivery & ordini', status:'available' },
  { id:'glovo', name:'Glovo', cat:'delivery', logo:'G', bg:'#FFC244', color:'#0A1929', desc:'Delivery & quick commerce', status:'available' },
  // Marketing
  { id:'gmb', name:'Google My Business', cat:'marketing', logo:'G', bg:'#fff', borderless:true, color:'#4285F4', desc:'Recensioni & orari Maps', status:'todo', detail:'Da configurare · richiesto' },
  { id:'brevo', name:'Brevo', cat:'marketing', logo:'B', bg:'#0B996E', desc:'Email marketing & newsletter', status:'available' },
  { id:'mailchimp', name:'Mailchimp', cat:'marketing', logo:'M', bg:'#FFE01B', color:'#241C15', desc:'Email marketing', status:'available' },
  // Automazione
  { id:'zapier', name:'Zapier', cat:'automazione', logo:'Z', bg:'#FF4F00', desc:'Automazioni e flussi', status:'available' },
];

const STATUS_LABEL = {
  connected: { label: 'Connesso', color: PN.GREEN, bg: PN.GREEN_SOFT, dot: PN.GREEN },
  todo: { label: 'Da configurare', color: '#D97706', bg: PN.AMBER_SOFT, dot: '#F59E0B' },
  available: { label: 'Disponibile', color: PN.MUTED, bg: '#F4F5F7', dot: PN.MUTED_LIGHT },
  disconnected: { label: 'Non connesso', color: PN.MUTED, bg: '#F4F5F7', dot: PN.MUTED_LIGHT },
};

function ImpIntegrazioni() {
  const [filter, setFilter] = React.useState('all');
  const [qrApp, setQrApp] = React.useState(false);
  const counts = {
    all: INTEGRATIONS.length,
    connected: INTEGRATIONS.filter(i => i.status === 'connected').length,
    todo: INTEGRATIONS.filter(i => i.status === 'todo').length,
    available: INTEGRATIONS.filter(i => i.status === 'available' || i.status === 'disconnected').length,
  };

  const filterChips = [
    { id: 'all', label: 'Tutti', count: counts.all },
    { id: 'connected', label: 'Connessi', count: counts.connected },
    { id: 'todo', label: 'Da configurare', count: counts.todo },
    { id: 'available', label: 'Disponibili', count: counts.available },
  ];

  const visible = INTEGRATIONS.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'available') return i.status === 'available' || i.status === 'disconnected';
    return i.status === filter;
  });

  // raggruppamento
  const byCategory = visible.reduce((acc, i) => {
    (acc[i.cat] = acc[i.cat] || []).push(i);
    return acc;
  }, {});
  const catLabels = {
    pagamenti: 'Pagamenti & fatturazione',
    periferiche: 'Periferiche · scontrino di cortesia',
    delivery: 'Delivery',
    marketing: 'Marketing',
    automazione: 'Automazione',
  };
  const catOrder = ['pagamenti','periferiche','delivery','marketing','automazione'];

  // Suggested: 4 popolari non connessi
  const suggested = INTEGRATIONS
    .filter(i => i.status === 'available')
    .slice(0, 4);

  return (
    <div>
      {/* PRIMA — Hero "byup Pay" come sistema di incasso (stato operativo) */}
      <ByupPayHero devices={BYUP_PAY_DEVICES} onAdd={() => setQrApp(true)}/>

      <ImpCard title="Altre integrazioni" sub="Pagamenti, periferiche, delivery e marketing">
        <div style={{display:'flex', gap: 7, flexWrap:'wrap', marginBottom: 18}}>
          {filterChips.map(c => {
            const on = filter === c.id;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)} style={{
                padding: '7px 14px', borderRadius: 999,
                border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                background: on ? PN.TEXT : PN.WHITE,
                color: on ? PN.WHITE : PN.TEXT,
                fontSize: 12.5, fontWeight: 600,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 6,
              }}>
                {c.label}
                <span style={{
                  fontSize: 11, padding:'1px 7px', borderRadius: 999,
                  background: on ? 'rgba(255,255,255,0.2)' : '#F4F5F7',
                  color: on ? PN.WHITE : PN.MUTED,
                }}>{c.count}</span>
              </button>
            );
          })}
        </div>

        {catOrder.filter(c => byCategory[c]).map(c => (
          <div key={c} style={{marginBottom: 22}}>
            <div style={{
              fontSize: 11.5, fontWeight: 700, color: PN.MUTED,
              letterSpacing: 0.4, textTransform:'uppercase',
              marginBottom: 10, paddingLeft: 2,
            }}>{catLabels[c]}</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 10}}>
              {byCategory[c].map(i => <IntegrationCard key={i.id} item={i} onMobileQr={() => setQrApp(true)}/>)}
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div style={{padding: 40, textAlign:'center', color: PN.MUTED, fontSize: 13}}>
            Nessuna integrazione corrisponde al filtro
          </div>
        )}
      </ImpCard>

      {/* Pannello rimosso — ora in cima come ByupPayHero */}

      {/* Suggested */}
      {filter === 'all' && suggested.length > 0 && (
        <ImpCard aurora title="✨ Suggeriti per te" sub="Integrazioni popolari per ristoranti come il tuo">
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 10}}>
            {suggested.map(i => <IntegrationCard key={i.id} item={i} suggested onMobileQr={() => setQrApp(true)}/>)}
          </div>
        </ImpCard>
      )}

      {qrApp && <ByupPayQrModal onClose={() => setQrApp(false)}/>}
    </div>
  );
}

function ByupPayHero({ devices, onAdd }) {
  const [list, setList] = React.useState(devices);
  const onlineCount = list.filter(d => d.online).length;

  const handleUnlink = (id) => {
    if (window.confirm('Scollegare questo dispositivo? L\'app non potrà più accettare pagamenti finché non viene ricollegata.')) {
      setList(list.filter(d => d.id !== id));
    }
  };

  return (
    <section style={{
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 14,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* Hero header con accent */}
      <div style={{
        padding: '18px 22px',
        background: `linear-gradient(135deg, ${PN.PINK_SOFT} 0%, ${PN.WHITE} 100%)`,
        borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        display:'flex', alignItems:'center', gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: PN.PINK, color: PN.WHITE,
          display:'grid', placeItems:'center',
          fontSize: 24, fontWeight: 800, fontStyle:'italic',
          boxShadow: '0 4px 12px rgba(239,79,139,0.3)',
          flexShrink: 0,
        }}>b</div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 3}}>
            <span style={{fontSize: 17, fontWeight: 800, color: PN.TEXT}}>byup Pay</span>
            <span style={{
              fontSize: 9.5, fontWeight: 800, color: PN.WINE, letterSpacing: 0.5,
              padding: '2px 7px', borderRadius: 4, background: PN.WINE_SOFT,
            }}>POS DIGITALE</span>
          </div>
          <div style={{fontSize: 12.5, color: PN.MUTED}}>
            {list.length === 0
              ? 'Nessun dispositivo collegato — collega uno smartphone per accettare pagamenti'
              : <>{list.length} dispositiv{list.length===1?'o':'i'} collegat{list.length===1?'o':'i'} · <span style={{color: PN.GREEN, fontWeight:600}}>● {onlineCount} online ora</span></>
            }
          </div>
        </div>
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={onAdd}>Collega dispositivo</ImpButton>
      </div>

      <div style={{padding: '18px 22px'}}>
        {list.length === 0 ? (
          <div style={{
            padding: '32px 20px', textAlign:'center',
            background:'#FAFBFC', borderRadius: 11,
            border: `1px dashed ${PN.BORDER}`,
          }}>
            <div style={{fontSize: 32, marginBottom: 8}}>📱</div>
            <div style={{fontSize: 13.5, fontWeight: 700, marginBottom: 4}}>Nessun dispositivo collegato</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginBottom: 14, maxWidth: 380, margin:'0 auto 14px'}}>
              Collega uno smartphone o tablet per iniziare ad accettare pagamenti dal palmo della tua mano.
            </div>
            <ImpButton variant="primary" onClick={onAdd}>Collega il primo dispositivo</ImpButton>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            {list.map(d => (
              <div key={d.id} style={{
                display:'flex', alignItems:'center', gap: 14,
                padding:'14px 16px', borderRadius: 11,
                border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE,
              }}>
                <div style={{position:'relative', flexShrink: 0}}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 11,
                    background: d.os.startsWith('iOS') ? '#F4F5F7' : '#E8F4EA',
                    display:'grid', placeItems:'center', fontSize: 22,
                  }}>📱</div>
                  <span style={{
                    position:'absolute', bottom: -2, right: -2,
                    width: 12, height: 12, borderRadius:'50%',
                    background: d.online ? PN.GREEN : PN.MUTED_LIGHT,
                    border: `2.5px solid ${PN.WHITE}`,
                  }}/>
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
                    <span style={{fontSize: 13.5, fontWeight: 700}}>{d.name}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600, color: PN.MUTED,
                      padding:'1px 7px', borderRadius: 999, background: '#F4F5F7',
                    }}>{d.os}</span>
                  </div>
                  <div style={{fontSize: 12, color: PN.TEXT, marginBottom: 2}}>
                    <b>{d.user}</b> <span style={{color: PN.MUTED}}>· {d.email}</span>
                  </div>
                  <div style={{fontSize: 11, color: d.online ? PN.GREEN : PN.MUTED, fontWeight: 500}}>
                    {d.online ? '● Online ora' : `Ultimo utilizzo · ${d.lastUse}`}
                    <span style={{color: PN.MUTED, fontWeight: 400}}> · collegato il {d.linkedAt}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(d.id)}
                  style={{
                    padding:'7px 14px',
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    border:'none', borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  }}
                >Scollega</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ByupPayQrModal({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16,
        width: 420, padding: 28, position:'relative',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top: 14, right: 14,
          width: 32, height: 32, borderRadius: 8,
          background:'#F4F5F7', border:'none', cursor:'pointer',
          display:'grid', placeItems:'center',
        }}><PnI.X size={14}/></button>

        <div style={{textAlign:'center', marginBottom: 18}}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: PN.PINK, color: PN.WHITE,
            display:'inline-grid', placeItems:'center',
            fontSize: 26, fontWeight: 800,
            marginBottom: 12, fontStyle:'italic',
          }}>b</div>
          <div style={{fontSize: 18, fontWeight: 800, marginBottom: 4}}>Collega un dispositivo</div>
          <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.5}}>
            Scansiona il QR con il dispositivo che vuoi collegare a byup Pay
          </div>
        </div>

        {/* QR mock */}
        <div style={{
          width: 220, height: 220, margin:'0 auto 18px',
          background: `repeating-conic-gradient(${PN.TEXT} 0% 25%, transparent 0% 50%) 0 0/14px 14px`,
          border: `4px solid ${PN.WHITE}`,
          boxShadow: `0 0 0 2px ${PN.BORDER}, 0 8px 24px rgba(0,0,0,0.08)`,
          borderRadius: 12,
          position:'relative',
        }}>
          {/* finder corner mocks */}
          {[
            {top: 8, left: 8},
            {top: 8, right: 8},
            {bottom: 8, left: 8},
          ].map((pos, i) => (
            <div key={i} style={{
              position:'absolute', ...pos,
              width: 36, height: 36,
              border: `4px solid ${PN.TEXT}`,
              background: PN.WHITE,
              borderRadius: 4,
            }}>
              <div style={{
                position:'absolute', inset: 4,
                background: PN.TEXT, borderRadius: 1,
              }}/>
            </div>
          ))}
          {/* center b */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width: 44, height: 44, borderRadius: 10,
            background: PN.PINK, color: PN.WHITE,
            display:'grid', placeItems:'center',
            fontSize: 22, fontWeight: 800, fontStyle:'italic',
            border: `3px solid ${PN.WHITE}`,
          }}>b</div>
        </div>

        {/* Store badges */}
        <div style={{display:'flex', gap: 10}}>
          <div style={{
            flex: 1,
            padding:'10px 14px', borderRadius: 9,
            background: PN.TEXT, color: PN.WHITE,
            display:'flex', alignItems:'center', gap: 9,
            cursor:'pointer',
          }}>
            <span style={{fontSize: 22}}></span>
            <div>
              <div style={{fontSize: 9, opacity: 0.7, lineHeight: 1}}>Disponibile su</div>
              <div style={{fontSize: 13, fontWeight: 700, lineHeight: 1.2}}>App Store</div>
            </div>
          </div>
          <div style={{
            flex: 1,
            padding:'10px 14px', borderRadius: 9,
            background: PN.TEXT, color: PN.WHITE,
            display:'flex', alignItems:'center', gap: 9,
            cursor:'pointer',
          }}>
            <span style={{fontSize: 22}}>▶</span>
            <div>
              <div style={{fontSize: 9, opacity: 0.7, lineHeight: 1}}>Disponibile su</div>
              <div style={{fontSize: 13, fontWeight: 700, lineHeight: 1.2}}>Google Play</div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 14, padding:'10px 14px',
          background:'#FAFBFC', borderRadius: 9,
          fontSize: 11.5, color: PN.MUTED, textAlign:'center',
        }}>
          Se l'app non è ancora installata, scaricala dallo store. Poi accedi con le credenziali del gestionale per completare il collegamento.
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({ item, suggested, onMobileQr }) {
  const s = STATUS_LABEL[item.status];
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 12,
      padding: '14px 16px', borderRadius: 12,
      border: `1.5px solid ${item.status === 'connected' ? PN.GREEN_SOFT : item.status === 'todo' ? '#FCD34D' : PN.BORDER_SOFT}`,
      background: item.status === 'connected' ? '#F0FDF4' : item.status === 'todo' ? '#FFFBEB' : PN.WHITE,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: item.bg,
        border: item.borderless ? `1px solid ${PN.BORDER}` : 'none',
        color: item.color || '#fff',
        display:'grid', placeItems:'center',
        fontSize: item.logo.length > 1 ? 11.5 : 16, fontWeight: 800,
        flexShrink: 0,
      }}>{item.logo}</div>

      <div style={{flex:1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 7, marginBottom: 1}}>
          <span style={{fontSize:13.5, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.name}</span>
          {item.required && (
            <span style={{
              fontSize: 9, fontWeight: 800, color: PN.WINE, letterSpacing: 0.4,
              padding: '1px 6px', borderRadius: 3, background: PN.WINE_SOFT,
            }}>RICHIESTO</span>
          )}
          {suggested && (
            <span style={{
              fontSize: 9, fontWeight: 800, color: PN.PINK_DARK, letterSpacing: 0.4,
              padding: '1px 6px', borderRadius: 3, background: PN.PINK_SOFT,
            }}>POPOLARE</span>
          )}
        </div>
        <div style={{fontSize:11.5, color:PN.MUTED, marginBottom: 3}}>{item.desc}</div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 5,
          fontSize: 11, fontWeight: 600, color: s.color,
        }}>
          <span style={{width:6, height:6, borderRadius:'50%', background: s.dot}}/>
          {s.label}
          {item.detail && <span style={{color:PN.MUTED, fontWeight: 500}}>· {item.detail}</span>}
        </div>
      </div>

      {item.status === 'connected' && (
        <ImpButton variant="ghost" style={{padding:'6px 12px', fontSize: 12}}>Configura</ImpButton>
      )}
      {item.status === 'todo' && (
        <ImpButton
          variant="primary"
          style={{padding:'6px 14px', fontSize: 12}}
          onClick={item.mobile ? onMobileQr : undefined}
        >{item.cta || 'Configura ora'}</ImpButton>
      )}
      {(item.status === 'available' || item.status === 'disconnected') && (
        <ImpButton variant="ghost" style={{padding:'6px 14px', fontSize: 12}}>Connetti</ImpButton>
      )}
    </div>
  );
}

window.ImpIntegrazioni = ImpIntegrazioni;

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
  // Periferiche
  { id:'printer', name:'Stampante scontrino', cat:'periferiche', logo:'🖨', bg:'#1F2937', desc:'Scontrino di cortesia post-pagamento', status:'available', printerType:true },
  { id:'printer-comande', name:'Stampante comande', cat:'periferiche', logo:'🖨', bg:'#374151', desc:'Stampa automatica delle comande in cucina', status:'available', printerType:true },
  // Delivery
  { id:'justeat', name:'Just Eat', cat:'delivery', logo:'JE', bg:'#FF8000', desc:'Delivery & ordini', status:'connected', detail:'sync 5 min fa' },
  { id:'deliveroo', name:'Deliveroo', cat:'delivery', logo:'D', bg:'#00CCBC', desc:'Delivery & ordini', status:'available' },
  { id:'glovo', name:'Glovo', cat:'delivery', logo:'G', bg:'#FFC244', color:'#0A1929', desc:'Delivery & quick commerce', status:'available' },
  // Marketing
  { id:'gmb', name:'Google My Business', cat:'marketing', logo:'G', bg:'#fff', borderless:true, color:'#4285F4', desc:'Recensioni & orari Maps', status:'available' },
  { id:'brevo', name:'Brevo', cat:'marketing', logo:'B', bg:'#0B996E', desc:'Email marketing & newsletter', status:'available' },
  { id:'mailchimp', name:'Mailchimp', cat:'marketing', logo:'M', bg:'#FFE01B', color:'#241C15', desc:'Email marketing', status:'available' },
  // Automazione
  { id:'zapier', name:'Zapier', cat:'automazione', logo:'Z', bg:'#FF4F00', desc:'Automazioni e flussi', status:'available' },
];

// Il gradiente del logo Byup Staff. Non vive più qui: da quando lo portano
// anche il banner in onboarding, il POS e la webapp cameriere è salito nei
// token, che è dove stava scritto di metterlo appena servisse una seconda
// superficie.
const GRAD_STAFF = PN.GRAD_STAFF;

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
    available: INTEGRATIONS.filter(i => i.status === 'available' || i.status === 'disconnected').length,
  };

  const filterChips = [
    { id: 'all', label: 'Tutti', count: counts.all },
    { id: 'connected', label: 'Connessi', count: counts.connected },
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
    pagamenti: 'Pagamenti e fatturazione',
    periferiche: 'Periferiche',
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
                fontSize: 14.5, fontWeight: 600,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 6,
              }}>
                {c.label}
                <span style={{
                  fontSize: 13, padding:'1px 7px', borderRadius: 999,
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
              fontSize: 13.5, fontWeight: 700, color: PN.MUTED,
              letterSpacing: 0.4, textTransform:'uppercase',
              marginBottom: 10, paddingLeft: 2,
            }}>{catLabels[c]}</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
              {byCategory[c].map(i => i.printerType
                ? <PrinterCard key={i.id} item={i}/>
                : <IntegrationCard key={i.id} item={i} onMobileQr={() => setQrApp(true)}/>
              )}
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div style={{padding: 40, textAlign:'center', color: PN.MUTED, fontSize: 15}}>
            Nessuna integrazione corrisponde al filtro
          </div>
        )}
      </ImpCard>

      {/* Pannello rimosso — ora in cima come ByupPayHero */}

      {/* Suggested */}
      {filter === 'all' && suggested.length > 0 && (
        <ImpCard title="Suggeriti per te" sub="Integrazioni popolari per ristoranti come il tuo">
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
            {suggested.map(i => <IntegrationCard key={i.id} item={i} suggested onMobileQr={() => setQrApp(true)}/>)}
          </div>
        </ImpCard>
      )}

      {qrApp && <ByupPayQrModal onClose={() => setQrApp(false)}/>}
    </div>
  );
}

// Marchio Byup Staff in tessera: la panna del logo sul gradiente della
// fascia — lo stesso pezzo, a qualsiasi taglia serva.
function MarkStaffTile({ size = 44, radius = 12, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: GRAD_STAFF,
      display:'grid', placeItems:'center', flexShrink: 0, ...style,
    }}>
      <img src="Fresh-mark.png" alt="" style={{
        width: Math.round(size * 0.62), height: Math.round(size * 0.62),
        objectFit:'contain', filter:'brightness(0) invert(1)', opacity: 0.96,
      }}/>
    </div>
  );
}

function ByupPayHero({ devices, onAdd }) {
  const [list, setList] = React.useState(devices);
  // Conferma di scollegamento su foglio nostro, non sul confirm del browser:
  // stessa ricetta MODAL_* dei fogli di Sala e tavoli.
  const [daScollegare, setDaScollegare] = React.useState(null);
  const dev = list.find(d => d.id === daScollegare);
  const onlineCount = list.filter(d => d.online).length;

  const handleUnlink = (id) => setDaScollegare(id);

  return (
    <section style={{
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 14,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* Testata col gradiente del logo Byup Staff: la fascia porta il marchio,
          quindi porta anche i suoi colori — il rosa acceso a sinistra che si
          apre nel salmone a destra, e il segno in panna sopra, come sul logo.
          Il marchio e il PNG corallo ricolorato: brightness(0) lo appiattisce
          a nero pieno tenendo l'alfa, invert(1) lo porta a bianco. */}
      <div style={{
        padding: '20px 22px',
        background: GRAD_STAFF,
        borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
        display:'flex', alignItems:'center', gap: 14,
      }}>
        <img src="Fresh-mark.png" alt="" style={{
          width: 44, height: 44, objectFit:'contain', flexShrink: 0,
          filter: 'brightness(0) invert(1)', opacity: 0.96,
        }}/>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 3}}>
            <span style={{fontSize: 19, fontWeight: 800, color: PN.STAFF_CREAM, letterSpacing: -0.2}}>Byup Staff</span>
          </div>
          <div style={{fontSize: 14.5, color: 'rgba(255, 255, 255, 0.88)'}}>
            {list.length === 0
              ? 'Nessun dispositivo collegato. Collega uno smartphone per accettare pagamenti'
              : <>{list.length} dispositiv{list.length===1?'o':'i'} collegat{list.length===1?'o':'i'} · <span style={{color:'#FFFFFF', fontWeight:700}}>● {onlineCount} online ora</span></>
            }
          </div>
        </div>
        {/* Sul corallo pieno il bottone scuro pesava e quello di brand
            sparirebbe: resta la panna del marchio, con la scritta rossa. */}
        <ImpButton
          variant="ghost"
          icon={<PnI.Plus size={13}/>}
          onClick={onAdd}
          style={{color: PN.PINK_DARK, border:'1px solid rgba(255,255,255,0.55)', fontWeight: 700}}
        >Collega dispositivo</ImpButton>
      </div>

      <div style={{padding: '18px 22px'}}>
        {list.length === 0 ? (
          <div style={{
            padding: '32px 20px', textAlign:'center',
            background:'#FAFBFC', borderRadius: 11,
            border: `1px dashed ${PN.BORDER}`,
          }}>
            <div style={{fontSize: 34, marginBottom: 8}}>📱</div>
            <div style={{fontSize: 15.5, fontWeight: 700, marginBottom: 4}}>Nessun dispositivo collegato</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginBottom: 14, maxWidth: 380, margin:'0 auto 14px'}}>
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
                    display:'grid', placeItems:'center', fontSize: 24,
                  }}>📱</div>
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
                    <span style={{fontSize: 15.5, fontWeight: 700}}>{d.name}</span>
                    <span style={{
                      fontSize: 12.5, fontWeight: 600, color: PN.MUTED,
                      padding:'1px 7px', borderRadius: 999, background: '#F4F5F7',
                    }}>{d.os}</span>
                  </div>
                  <div style={{fontSize: 14, color: PN.TEXT, marginBottom: 2}}>
                    <b>{d.user}</b> <span style={{color: PN.MUTED}}>· {d.email}</span>
                  </div>
                  {/* Niente stato sulla riga: chi e online lo dice gia la
                      fascia in alto («N online ora») — qui bastano il
                      telefono e la persona che lo porta in tasca. */}
                </div>
                <button
                  onClick={() => handleUnlink(d.id)}
                  style={{
                    padding:'7px 14px',
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    border:'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  }}
                >Scollega</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {dev && (
        <div onClick={() => setDaScollegare(null)} style={{
          position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 150, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 460}}>
            <div style={MODAL_HEAD}>
              <div style={MODAL_TITLE}>Scollegare il dispositivo?</div>
              <div style={MODAL_SUB}>
                <strong style={{color: PN.TEXT}}>{dev.name}</strong> di {dev.user} non potrà più accettare pagamenti finché non viene ricollegato.
              </div>
              <button onClick={() => setDaScollegare(null)} style={MODAL_X}><PnI.X size={14}/></button>
            </div>
            <div style={{...MODAL_FOOT, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setDaScollegare(null)} style={{padding:'11px 22px', borderRadius: 11, fontSize: 16}}>Annulla</ImpButton>
              <ImpButton variant="danger" onClick={() => { setList(l => l.filter(x => x.id !== daScollegare)); setDaScollegare(null); }} style={{padding:'11px 26px', borderRadius: 11, fontSize: 16}}>Scollega</ImpButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ByupPayQrModal({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      {/* Stesso foglio bianco dei modali di Sala e tavoli; il marchio in
          testa e al centro del QR e quello della fascia Byup Staff. */}
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 480}}>
        <div style={{...MODAL_HEAD, display:'flex', alignItems:'center', gap: 14}}>
          <MarkStaffTile size={48} radius={13}/>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{...MODAL_TITLE, fontSize: 22, paddingRight: 40}}>Collega un dispositivo</div>
            <div style={{...MODAL_SUB, marginTop: 2, paddingRight: 40}}>
              Scansiona il QR con il dispositivo che vuoi collegare a Byup Staff
            </div>
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>

        <div style={MODAL_BODY}>
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
            {/* marchio Staff al centro del codice */}
            <MarkStaffTile size={46} radius={11} style={{
              position:'absolute', top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              border: `3px solid ${PN.WHITE}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            }}/>
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
              <span style={{fontSize: 24}}></span>
              <div>
                <div style={{fontSize: 11, opacity: 0.7, lineHeight: 1}}>Disponibile su</div>
                <div style={{fontSize: 15, fontWeight: 700, lineHeight: 1.2}}>App Store</div>
              </div>
            </div>
            <div style={{
              flex: 1,
              padding:'10px 14px', borderRadius: 9,
              background: PN.TEXT, color: PN.WHITE,
              display:'flex', alignItems:'center', gap: 9,
              cursor:'pointer',
            }}>
              <span style={{fontSize: 24}}>▶</span>
              <div>
                <div style={{fontSize: 11, opacity: 0.7, lineHeight: 1}}>Disponibile su</div>
                <div style={{fontSize: 15, fontWeight: 700, lineHeight: 1.2}}>Google Play</div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 14, padding:'10px 14px',
            background:'#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 9,
            fontSize: 13.5, color: PN.MUTED, textAlign:'center',
          }}>
            Se l'app non è ancora installata, scaricala dallo store. Poi accedi con le credenziali del gestionale per completare il collegamento.
          </div>
        </div>
      </div>
    </div>
  );
}

function PrinterCard({ item }) {
  const [conn, setConn] = React.useState(null);
  const [linked, setLinked] = React.useState(item.status === 'connected');
  const s = linked ? STATUS_LABEL['connected'] : STATUS_LABEL[item.status];

  const conns = [
    { id:'bt',   label:'Bluetooth' },
    { id:'wifi', label:'Wi-Fi' },
    { id:'usb',  label:'USB' },
  ];

  // Stessa tessera in piedi delle altre integrazioni: la stampante occupava
  // una riga intera solo perche i tre modi di collegarla stavano in fila, e
  // in colonna ci stanno lo stesso — sopra il bottone, dove sono la scelta
  // da fare prima di premerlo.
  const azione = { width:'100%', justifyContent:'center', padding:'9px 14px', fontSize: 14.5 };
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      minHeight: 236, padding: 18, borderRadius: 16,
      border:`1.5px solid ${linked ? PN.GREEN_SOFT : PN.BORDER_SOFT}`,
      background: linked ? '#F0FDF4' : PN.WHITE,
    }}>
      <div style={{
        width:54, height:54, borderRadius:14,
        background: linked ? '#065F46' : item.bg,
        color:'#fff', display:'grid', placeItems:'center',
        fontSize:28, flexShrink:0,
      }}>{item.logo}</div>

      <div style={{fontSize:17, fontWeight:700, letterSpacing:-0.2, marginTop:14}}>{item.name}</div>
      <div style={{fontSize:14.5, color:PN.MUTED, marginTop:4, lineHeight:1.45}}>{item.desc}</div>

      <div style={{marginTop:'auto', paddingTop:14}}>
        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
          <span style={{fontSize:13.5, color:PN.MUTED, fontWeight:500, marginRight:2}}>Connessione:</span>
          {conns.map(c => {
            const active = conn === c.id;
            return (
              <button key={c.id}
                onClick={() => !linked && setConn(active ? null : c.id)}
                style={{
                  padding:'3px 10px', borderRadius:999,
                  border:`1.5px solid ${active ? PN.TEXT : PN.BORDER}`,
                  background: active ? PN.TEXT : '#F9FAFB',
                  color: active ? '#fff' : PN.TEXT,
                  fontSize:13.5, fontWeight:600,
                  cursor: linked ? 'default' : 'pointer',
                  fontFamily:'inherit',
                }}
              >{c.label}</button>
            );
          })}
        </div>

        <div style={{display:'flex', alignItems:'center', gap:5, fontSize:13.5, fontWeight:600, color:s.color, marginTop:10}}>
          <span style={{width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0}}/>
          {s.label}
          {linked && conn && (
            <span style={{color:PN.MUTED, fontWeight:400}}>
              · {conns.find(c => c.id === conn)?.label}
            </span>
          )}
        </div>

        <div style={{marginTop:12}}>
          {linked ? (
            <ImpButton variant="ghost" style={azione}
              onClick={() => { setLinked(false); setConn(null); }}>
              Disconnetti
            </ImpButton>
          ) : (
            <ImpButton
              variant={conn ? 'primary' : 'ghost'}
              style={{...azione, opacity: conn ? 1 : 0.55}}
              onClick={() => conn && setLinked(true)}
            >Connetti</ImpButton>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({ item, suggested, onMobileQr }) {
  const s = STATUS_LABEL[item.status];
  // Tessera in piedi invece che riga sdraiata: logo in alto, nome e
  // descrizione sotto, e il bottone appoggiato al fondo. Cosi il bottone sta
  // sempre nello stesso punto — a destra, in fondo a una riga larga, ogni
  // card lo teneva a un'altezza diversa a seconda di quanto era lungo il
  // testo. Il margine automatico prima dello stato tiene i fondi allineati
  // anche quando una descrizione va a capo e l'altra no.
  const azione = { width:'100%', justifyContent:'center', padding:'9px 14px', fontSize: 14.5 };
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      minHeight: 236, padding: 18, borderRadius: 16,
      border: `1.5px solid ${item.status === 'connected' ? PN.GREEN_SOFT : item.status === 'todo' ? '#FCD34D' : PN.BORDER_SOFT}`,
      background: item.status === 'connected' ? '#F0FDF4' : item.status === 'todo' ? '#FFFBEB' : PN.WHITE,
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 14,
        background: item.bg,
        border: item.borderless ? `1px solid ${PN.BORDER}` : 'none',
        color: item.color || '#fff',
        display:'grid', placeItems:'center',
        fontSize: item.logo.length > 1 ? 17 : 24, fontWeight: 800,
        flexShrink: 0,
      }}>{item.logo}</div>

      <div style={{display:'flex', alignItems:'center', gap: 7, flexWrap:'wrap', marginTop: 14}}>
        <span style={{fontSize:17, fontWeight:700, letterSpacing:-0.2}}>{item.name}</span>
        {item.required && (
          <span style={{
            fontSize: 11, fontWeight: 800, color: PN.WINE, letterSpacing: 0.4,
            padding: '1px 6px', borderRadius: 3, background: PN.WINE_SOFT,
          }}>RICHIESTO</span>
        )}
        {suggested && (
          <span style={{
            fontSize: 11, fontWeight: 800, color: PN.PINK_DARK, letterSpacing: 0.4,
            padding: '1px 6px', borderRadius: 3, background: PN.PINK_SOFT,
          }}>POPOLARE</span>
        )}
      </div>
      <div style={{fontSize:14.5, color:PN.MUTED, marginTop: 4, lineHeight: 1.45}}>{item.desc}</div>

      <div style={{marginTop:'auto', paddingTop: 14}}>
        <div style={{
          display:'flex', alignItems:'baseline', gap: 5,
          fontSize: 13.5, fontWeight: 600, color: s.color,
        }}>
          <span style={{width:6, height:6, borderRadius:'50%', background: s.dot, flexShrink: 0, alignSelf:'center'}}/>
          <span style={{flexShrink: 0}}>{s.label}</span>
          {item.detail && <span style={{color:PN.MUTED, fontWeight: 500, minWidth: 0}}>· {item.detail}</span>}
        </div>

        <div style={{marginTop: 12}}>
          {item.status === 'connected' && (
            <ImpButton variant="ghost" style={azione}>Configura</ImpButton>
          )}
          {item.status === 'todo' && (
            <ImpButton
              variant="primary"
              style={azione}
              onClick={item.mobile ? onMobileQr : undefined}
            >{item.cta || 'Configura ora'}</ImpButton>
          )}
          {(item.status === 'available' || item.status === 'disconnected') && (
            <ImpButton variant="ghost" style={azione}>Connetti</ImpButton>
          )}
        </div>
      </div>
    </div>
  );
}

window.ImpIntegrazioni = ImpIntegrazioni;

// Impostazioni → POS e integrazioni (P-125: tre blocchi — POS e strumenti di
// pagamento, Stampanti, Piattaforme e app esterne; via «Suggeriti per te»,
// che non faceva nulla e presupponeva una profilazione dei locali che non
// esiste e che nessuna decisione prevede).

const BYUP_PAY_DEVICES = [
  { id: 'bp-01', name: 'iPhone 14 Pro', os: 'iOS 17.4', user: 'Marco Silvestri', email: 'marco@delborgo.it', linkedAt: '12 mar 2024', lastUse: '2 min fa', online: true },
  { id: 'bp-02', name: 'Samsung Galaxy S23', os: 'Android 14', user: 'Sara Conti', email: 'sara@delborgo.it', linkedAt: '5 apr 2024', lastUse: '1 ora fa', online: false },
];

const INTEGRATIONS = [
  // Gli incassi. Il canale FISCALE non è più qui: un catalogo è il posto dove
  // si sceglie, e sul canale non c'è niente da scegliere — è uno solo, è
  // incluso nell'abbonamento (D-38), non si collega e non si scollega, e la
  // tessera «Connesso · API key configurata» col pulsante «Configura» che non
  // configurava nulla era un doppione che non portava da nessuna parte. Chi
  // trasmette gli scontrini e le fatture si legge dove il fiscale vive, cioè
  // in Dati fiscali, accanto a credenziali, delega, POS e codice
  // destinatario. Stripe invece resta: quello è un collegamento vero, che si
  // apre, si ricollega e col cambio di soggetto si disabilita.
  { id:'stripe', name:'Stripe', cat:'pagamenti', logo:'S', bg:'#635BFF', desc:'Pagamenti online & checkout', status:'connected', detail:'acct_••••dE3v · sync ora', required: true },
  // Piattaforme di consegna PREDISPOSTE (P-119 · D-106): Glovo, Deliveroo e
  // Uber Eats, con le specifiche in raccolta; l'add-on resta spento nell'MVP e
  // le tessere lo dicono. Just Eat è uscita: la sua documentazione non è
  // acquisibile, e ciò che non è riscontrabile non si progetta. Sigle e
  // colori da PN_PARTNER (panoramica-tokens.jsx), la stessa fonte di cucina e
  // Vendita diretta. `scheda` è che cosa faranno, letto dalle specifiche.
  { id:'glovo', name: PN_PARTNER.glovo.nome, cat:'delivery', logo: PN_PARTNER.glovo.sigla, bg: PN_PARTNER.glovo.bg, color: PN_PARTNER.glovo.ink, desc:'Ordini in coda e in cucina, menù pubblicato', status:'predisposta',
    scheda:'Gli ordini Glovo entrano già pagati nella coda «Da consegnare» di Vendita diretta e sul monitor di cucina, con il codice della piattaforma che il rider pronuncia al banco. Il menù si pubblica su Glovo con un identificativo di transazione e l\'esito arriva dopo. Il collegamento usa il token di partner di Glovo nell\'intestazione Authorization: lo stesso token con cui Glovo firma i webhook. Si accende con l\'add-on, quando ci saranno gli accordi.' },
  { id:'deliveroo', name: PN_PARTNER.deliveroo.nome, cat:'delivery', logo: PN_PARTNER.deliveroo.sigla, bg: PN_PARTNER.deliveroo.bg, color: PN_PARTNER.deliveroo.ink, desc:'Ordini in coda e in cucina, menù pubblicato', status:'predisposta',
    scheda:'Gli ordini Deliveroo entrano già pagati nella coda «Da consegnare» e sul monitor di cucina, con dieci minuti per accettarli. Il menù si pubblica intero, con scorte, prezzi, codici e allergeni mappati sul dizionario. Il collegamento è fra macchine, con le credenziali dell\'integratore (OAuth 2.0 client credentials) e il locale collegato dal portale Deliveroo. Si accende con l\'add-on, quando ci saranno gli accordi.' },
  { id:'ubereats', name: PN_PARTNER.ubereats.nome, cat:'delivery', logo: PN_PARTNER.ubereats.sigla, bg: PN_PARTNER.ubereats.bg, color: PN_PARTNER.ubereats.ink, desc:'Ordini in coda e in cucina, menù pubblicato', status:'predisposta',
    scheda:'Il collegamento del locale avviene autorizzando l\'app di Byup su Uber (scope eats.pos_provisioning): nessuna credenziale da digitare. Gli ordini arrivano firmati (HMAC SHA-256) con il codice di cinque caratteri che il rider legge al banco, con 11,5 minuti per accettarli, ed entrano già pagati in coda e in cucina. Il menù si pubblica intero con allergeni e valori nutrizionali mappati sui dizionari. Si accende con l\'add-on, quando ci saranno gli accordi.' },
  // IL COLLEGAMENTO CON LE APP ESTERNE È USCITO dal prototipo (4 settembre
  // 2026, per decisione del titolare; ribalta P-125, che lo teneva).
  // La ragione è lo stesso criterio con cui è uscito Google Business Profile
  // (P-118): un'integrazione che non è stata studiata non si promette. Qui il
  // «come» c'è — il modello lo predispone (tenant_api_connections,
  // api_webhook_subscriptions, D-29) e la documentazione di Zapier è in
  // raccolta — ma il «che cosa» no: l'elenco degli eventi che il ristoratore
  // può automatizzare e dei dati che escono con ciascuno non è scritto in
  // alcun documento, e P-125 stessa lo dichiarava da definire PRIMA di
  // attivarlo. Una tessera che genera una credenziale verso un terzo senza
  // che sia scritto che cosa esce è la promessa più rischiosa del catalogo.
  // Rientrerà quando quel catalogo di eventi esisterà: il modello lo aspetta,
  // e la scheda che diceva che cosa esce, che cosa non esce e chi risponde è
  // scritta e si ritrova nella storia del repository.
];

// Le costanti del collegamento con le app esterne — che cosa esce, che cosa
// non esce mai, chi risponde del flusso, le sedi, il registro delle
// connessioni — sono uscite di qui insieme alla funzione: non le teniamo in
// vita orfane, e il testo che vale (il perimetro dichiarato, la presa d'atto
// del titolare, la revoca che chiude la riga senza cancellarla) si ritrova
// nella storia del repository, al commit che lo ha rimosso.

// Il gradiente del logo Byup Staff. Non vive più qui: da quando lo portano
// anche il banner in onboarding, il POS e la webapp cameriere è salito nei
// token, che è dove stava scritto di metterlo appena servisse una seconda
// superficie.
const GRAD_STAFF = PN.GRAD_STAFF;

const STATUS_LABEL = {
  connected: { label: 'Connesso', color: PN.GREEN, bg: PN.GREEN_SOFT, dot: PN.GREEN },
  predisposta: { label: 'Predisposta', color: PN.AMBER, bg: PN.AMBER_SOFT, dot: PN.AMBER },
  todo: { label: 'Da configurare', color: '#D97706', bg: PN.AMBER_SOFT, dot: '#F59E0B' },
  available: { label: 'Disponibile', color: PN.MUTED, bg: '#F4F5F7', dot: PN.MUTED_LIGHT },
  disconnected: { label: 'Non connesso', color: PN.MUTED, bg: '#F4F5F7', dot: PN.MUTED_LIGHT },
};

function ImpIntegrazioni() {
  const [qrApp, setQrApp] = React.useState(false);
  const per = (cat) => INTEGRATIONS.filter(i => i.cat === cat);
  const griglia = { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12 };
  const tessere = (lista) => lista.map(i => (
    <IntegrationCard key={i.id} item={i} onMobileQr={() => setQrApp(true)}/>
  ));
  // Il titolo di blocco: la pagina è tre blocchi (P-125), e ogni blocco lo
  // dice prima delle sue card.
  const Blocco = ({ children }) => (
    <div style={{ fontSize: 13.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', margin: '4px 2px 10px' }}>{children}</div>
  );

  return (
    <div>
      {/* BLOCCO 1 — POS e strumenti di pagamento: i dispositivi Byup Staff con
          il collegamento fiscale (P-105) e i due canali richiesti. */}
      <Blocco>POS e strumenti di pagamento</Blocco>
      <ByupPayHero devices={BYUP_PAY_DEVICES} onAdd={() => setQrApp(true)}/>
      <ImpCard title="Incassi" sub="Il conto su cui arrivano i pagamenti, con la verifica del prestatore.">
        <div style={griglia}>{tessere(per('pagamenti'))}</div>
        {/* Dove è finito il canale fiscale: detto qui, perché è qui che lo si
            cerca la prima volta. */}
        <div style={{marginTop: 14, padding: '11px 13px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 13, color: PN.MUTED, lineHeight: 1.55, display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
          <span style={{flex: 1, minWidth: 280}}>
            <b style={{color: PN.TEXT}}>Il canale fiscale non si configura qui.</b> Scontrini e fatture passano da un canale unico, incluso nell'abbonamento: non è un collegamento da attivare e non ci sono alternative da scegliere. Quello che c'è da fare — credenziali, delega, POS e codice destinatario — sta in Dati fiscali.
          </span>
          <ImpButton variant="secondary" onClick={() => window.dispatchEvent(new CustomEvent('byup-imp-goto', { detail: { id: 'fiscali', da: 'integrazioni' } }))}>Apri Dati fiscali</ImpButton>
        </div>
      </ImpCard>

      {/* BLOCCO 2 — Stampanti (P-124): il popup «Collega stampante»
          sostituisce la sezione Impostazioni → Stampanti. */}
      <Blocco>Stampanti</Blocco>
      {window.ImpStampantiBlocco && <window.ImpStampantiBlocco/>}

      {/* BLOCCO 3 — Le piattaforme di consegna predisposte (P-119). Il
          collegamento con le app esterne non è più qui: vedi il commento sul
          catalogo. */}
      <Blocco>Piattaforme di consegna</Blocco>
      <ImpCard title="Piattaforme di consegna" sub="Predisposte, non attive: Glovo, Deliveroo e Uber Eats entrano con l'add-on quando ci saranno gli accordi. Ogni tessera dice che cosa farà.">
        <div style={griglia}>{tessere(per('delivery'))}</div>
      </ImpCard>
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
                {' '}La dismissione va comunicata all'Agenzia: lo strumento passa a «da aggiornare» nel collegamento POS, con una nuova finestra da oggi.
              </div>
              <button onClick={() => setDaScollegare(null)} style={MODAL_X}><PnI.X size={14}/></button>
            </div>
            <div style={{...MODAL_FOOT, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setDaScollegare(null)} style={{padding:'11px 22px', borderRadius: 11, fontSize: 16}}>Annulla</ImpButton>
              {/* Scollegare è una variazione dovuta all'Agenzia (P-105): il
                  registro del censimento porta lo strumento a unlinked e la
                  finestra riparte da oggi. */}
              <ImpButton variant="danger" onClick={() => { if (window.byupPosVaria) window.byupPosVaria(daScollegare, 'unlinked'); setList(l => l.filter(x => x.id !== daScollegare)); setDaScollegare(null); }} style={{padding:'11px 26px', borderRadius: 11, fontSize: 16}}>Scollega</ImpButton>
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

// Il rimando: stessa tessera in piedi delle integrazioni, ma il bottone porta
// alla scheda che ha il registro. Nessun chip di connessione qui — la
// modalità si sceglie dove si registra la stampante.
function PosVirtualeRimando() {
  const [r, setR] = React.useState(() => (window.byupReadPosCensimento ? window.byupReadPosCensimento() : []).find(x => x.id === 'pos-virtuale') || null);
  React.useEffect(() => {
    const agg = () => setR((window.byupReadPosCensimento ? window.byupReadPosCensimento() : []).find(x => x.id === 'pos-virtuale') || null);
    window.addEventListener('byup-pos-censimento', agg);
    return () => window.removeEventListener('byup-pos-censimento', agg);
  }, []);
  if (!r) return null;
  const p = window.pnPosPromemoria(r);
  if (p.fase === 'ok') return <div style={{fontSize: 13, color: PN.MUTED, marginTop: 6}}>POS virtuale dichiarato all'Agenzia</div>;
  const scaduta = p.fase === 'scaduta';
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('byup-imp-goto', { detail: { id: 'fiscali', anchor: 'pos-censimento', da: 'integrazioni', strumento: 'pos-virtuale' } }))}
      title={p.testo} className="pn-btn-feedback"
      style={{
        display:'inline-flex', alignItems:'center', gap: 5, marginTop: 8,
        padding:'2px 9px', borderRadius: 999, border:'none', cursor:'pointer', fontFamily:'inherit',
        background: scaduta ? '#FEF2F2' : PN.AMBER_SOFT, color: scaduta ? '#991B1B' : PN.AMBER,
        fontSize: 12.5, fontWeight: 700,
      }}>
      <span style={{width: 6, height: 6, borderRadius:'50%', background:'currentColor'}}/>
      POS virtuale {(PN_POS_STATI[r.fiscal_link_status] || PN_POS_STATI.pending_census).label.toLowerCase()} all'Agenzia →
    </button>
  );
}

function IntegrationCard({ item, suggested, onMobileQr }) {
  // Predisposta (P-119): niente «Connetti», l'add-on è spento nell'MVP; al
  // suo posto «Che cosa farà», che apre la scheda letta dalle specifiche.
  const [scheda, setScheda] = React.useState(false);
  // Stripe: lo stato vero sta nel registro byup_stripe (panoramica-tokens) —
  // il cambio di soggetto fiscale lo disabilita, e da qui si ricollega con
  // l'onboarding Stripe (simulato) del nuovo soggetto.
  const [stripe, setStripe] = React.useState(() => window.byupReadStripe ? byupReadStripe() : { status: 'connected' });
  const [ricollegando, setRicollegando] = React.useState(false);
  React.useEffect(() => {
    const ri = () => setStripe(byupReadStripe());
    window.addEventListener('byup-stripe-change', ri);
    return () => window.removeEventListener('byup-stripe-change', ri);
  }, []);
  const stripeGiu = item.id === 'stripe' && stripe.status !== 'connected';
  if (stripeGiu) item = { ...item, status: 'todo', detail: 'Disabilitato: il soggetto fiscale è cambiato', cta: 'Ricollega Stripe', required: true };
  const ricollega = () => { setRicollegando(true); setTimeout(() => { setRicollegando(false); byupStripeRicollega(); }, 1800); };
  const s = stripeGiu ? { ...STATUS_LABEL.todo, label: 'Da ricollegare' } : STATUS_LABEL[item.status];
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
          {item.status === 'predisposta' && <span style={{color:PN.MUTED, fontWeight: 500, minWidth: 0}}>· add-on spento nell'MVP</span>}
        </div>
        {item.id === 'stripe' && <PosVirtualeRimando/>}

        <div style={{marginTop: 12}}>
          {item.status === 'connected' && (
            <ImpButton variant="ghost" style={azione}>Configura</ImpButton>
          )}
          {item.status === 'todo' && (
            <ImpButton
              variant="primary"
              style={azione}
              disabled={ricollegando}
              onClick={stripeGiu ? ricollega : item.mobile ? onMobileQr : undefined}
            >{ricollegando ? 'Collegamento in corso…' : (item.cta || 'Configura ora')}</ImpButton>
          )}
          {(item.status === 'available' || item.status === 'disconnected') && (
            <ImpButton variant="ghost" style={azione}>Connetti</ImpButton>
          )}
          {item.status === 'predisposta' && (
            <React.Fragment>
              <ImpButton variant="ghost" style={azione} onClick={() => setScheda(v => !v)}>{scheda ? 'Chiudi' : 'Che cosa farà'}</ImpButton>
              {scheda && (
                <div data-scheda-piattaforma style={{ marginTop: 10, fontSize: 13, color: PN.TEXT, lineHeight: 1.5, padding: '10px 12px', borderRadius: 9, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}` }}>{item.scheda}</div>
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

window.ImpIntegrazioni = ImpIntegrazioni;

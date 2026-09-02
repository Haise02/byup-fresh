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
  // Delivery — sigle e colori da PN_PARTNER (panoramica-tokens.jsx): era la
  // terza copia degli stessi valori, da P-03 la fonte è una con cucina e
  // Vendita diretta.
  { id:'justeat', name: PN_PARTNER.justeat.nome, cat:'delivery', logo: PN_PARTNER.justeat.sigla, bg: PN_PARTNER.justeat.bg, desc:'Delivery & ordini', status:'connected', detail:'sync 5 min fa' },
  { id:'deliveroo', name: PN_PARTNER.deliveroo.nome, cat:'delivery', logo: PN_PARTNER.deliveroo.sigla, bg: PN_PARTNER.deliveroo.bg, color: PN_PARTNER.deliveroo.ink, desc:'Delivery & ordini', status:'available' },
  { id:'glovo', name: PN_PARTNER.glovo.nome, cat:'delivery', logo: PN_PARTNER.glovo.sigla, bg: PN_PARTNER.glovo.bg, color: PN_PARTNER.glovo.ink, desc:'Delivery & quick commerce', status:'available' },
  // Presenza online. Qui stavano anche Brevo e Mailchimp (P-31 · D-29): via,
  // perché promettevano di lavorare su una base clienti che il ristoratore
  // non possiede — il marketing del locale verso i clienti è dismesso e Byup
  // è titolare unico del rapporto con il consumatore, che è il presupposto
  // dell'intero impianto privacy. Google My Business resta: è la scheda del
  // locale su Maps, non una lista di persone.
  { id:'gmb', name:'Google My Business', cat:'presenza', logo:'G', bg:'#fff', borderless:true, color:'#4285F4', desc:'Recensioni & orari Maps', status:'available' },
  // Collegamenti API — Zapier è la prima realizzazione del collegamento
  // generico (P-32 · D-29), a dominio aperto: la tessera apre il foglio
  // IntCollegaModal e il suo stato si RICAVA dall'elenco delle connessioni
  // (vedi ImpIntegrazioni), non sta scritto qui. Niente prezzo e niente
  // cancello sull'add-on api_third_party: il gating commerciale si decide al
  // lancio, e finché non è deciso la scheda non lo inventa.
  { id:'zapier', name:'Zapier', cat:'api', api:true, logo:'Z', bg:'#FF4F00', desc:'Automazioni e flussi verso le tue app', status:'available' },
];

// ─── Collegamenti API: la connessione con un'app esterna (P-32 · D-29) ─────
// Il modello è tenant_api_connections (GS-04), e la scheda lo segue alla
// lettera. Il perimetro non è una promessa ma un fatto tecnico: la credenziale
// appartiene a una connessione, la connessione a un esercente, il terzo vede
// quello e nient'altro. Una connessione vale per una sede o per tutte, e non
// attraversa mai il confine fra ristoranti.
//   Cosa esce — ciò che l'esercente detiene come venditore.
//   Cosa non esce mai — vincolo dichiarato, non configurabile.
//   Chi autorizza — il SOLO titolare del locale: il collegamento fa uscire
//     dati verso un terzo, non è un'impostazione operativa.
//   controller_ack_at — la presa d'atto: prima di generare la credenziale
//     l'esercente dichiara di agire come titolare del trattamento per il
//     flusso verso il terzo e di avere con esso un proprio accordo. Spunta
//     dedicata, mai preselezionata; si registra al momento della spunta.
//   authorized_at — alla generazione della credenziale.
//   last_used_at / revoked_at — la revoca chiude la riga, non la cancella:
//     la connessione revocata resta visibile come storia.
const INT_COSA_ESCE = 'Quello che possiedi come venditore: ordini, conti, documenti fiscali e incassi della sede; le prenotazioni che ricevi; le recensioni; il catalogo; il personale.';
const INT_COSA_NON_ESCE = 'I dati di altri locali. Allergeni, regimi alimentari e note sanitarie. Il profilo dell\'account Byup del cliente, con i suoi consensi e la sua storia in altri locali. I dati di carta oltre a circuito e ultime quattro cifre.';
const INT_CHI_RISPONDE = 'Dove vanno i dati lo scegli tu, e per quel flusso il titolare del trattamento sei tu. La credenziale appartiene a questa connessione, la connessione al tuo ristorante: l\'app vede quello e nient\'altro. È così che è costruita, non una promessa.';

// Chi guarda e le sedi fra cui scegliere. Nel bundle delle Impostazioni non
// ci sono account-data.jsx né account-tab-dati.jsx: questa è la copia di
// ACC_DATI e di ACC_LOCALI filtrata al ristorante corrente (Cacio e Pepe e
// la sua sede Ostiense). La Trattoria del Borgo, dove l'utente è «Manager»,
// NON compare: è un'altra insegna, e il confine non si attraversa nemmeno nel
// selettore. Le incoerenze del mock su ruoli (Owner/Manager contro
// Titolare) e sull'identità del locale sono code registrate, non si toccano
// qui.
const INT_UTENTE = { nome: 'Mario Rossi', titolare: true };
const INT_SEDI = [
  { id: 'cp', name: 'Cacio e Pepe',            city: 'Roma · Trastevere' },
  { id: 'co', name: 'Cacio e Pepe · Ostiense', city: 'Roma · Ostiense' },
];
const intSedeNome = (venueId) => venueId ? (INT_SEDI.find(x => x.id === venueId) || {}).name : 'Tutte le sedi';

// Date ancorate all'oggi reale a ogni caricamento, come i mock delle fatture.
const intGiorniFa = (g, ora) => {
  const d = new Date(); d.setDate(d.getDate() - g);
  const [h, m] = (ora || '10:00').split(':'); d.setHours(+h, +m, 0, 0);
  return d;
};
const intMinutiFa = (m) => new Date(Date.now() - m * 60000);
const intData = (d) => d ? d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const intRelativo = (d) => {
  if (!d) return 'mai';
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'adesso';
  if (m < 60) return `${m} min fa`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? 'ora' : 'ore'} fa`;
  const g = Math.round(h / 24);
  if (g === 1) return 'ieri';
  if (g < 30) return `${g} giorni fa`;
  return intData(d);
};

// Due righe: una viva su tutte le sedi, una limitata a Ostiense e revocata —
// resta, perché la revoca è storia e non cancellazione.
const INT_CONNESSIONI_MOCK = [
  { id: 'conn-2', application: 'zapier', venue_id: null, authorized_by: 'Mario Rossi',
    controller_ack_at: intGiorniFa(50, '10:19'), authorized_at: intGiorniFa(50, '10:20'),
    last_used_at: intMinutiFa(12), revoked_at: null, revoked_by: null },
  { id: 'conn-1', application: 'zapier', venue_id: 'co', authorized_by: 'Mario Rossi',
    controller_ack_at: intGiorniFa(182, '16:04'), authorized_at: intGiorniFa(182, '16:05'),
    last_used_at: intGiorniFa(92, '09:30'), revoked_at: intGiorniFa(91, '11:00'), revoked_by: 'Mario Rossi' },
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
  // Le connessioni con app esterne: in memoria, niente persistenza. La
  // tessera Zapier del catalogo si legge da qui, così tessera ed elenco non
  // possono dirsi due cose diverse.
  const [connessioni, setConnessioni] = React.useState(INT_CONNESSIONI_MOCK);
  const [collega, setCollega] = React.useState(false);
  // Lo stato è per app: connessa se ha almeno una connessione viva, con chi
  // l'ha autorizzata e quando sulla tessera. Prima bastava una connessione
  // qualunque perché tutte le app dell'API risultassero connesse.
  const catalogo = INTEGRATIONS.map(i => {
    if (!i.api) return i;
    const vive = connessioni.filter(c => c.application === i.id && !c.revoked_at);
    const una = vive.length === 1 ? vive[0] : null;
    return { ...i, status: vive.length ? 'connected' : 'available',
      detail: vive.length ? (una ? `da ${una.authorized_by} · ${intData(una.authorized_at)}` : `${vive.length} connessioni attive`) : undefined };
  });
  const aggiungiConnessione = (c) => setConnessioni(l => [c, ...l]);
  // La revoca chiude la riga, non la cancella.
  const revoca = (id) => setConnessioni(l => l.map(c => c.id === id
    ? { ...c, revoked_at: new Date(), revoked_by: INT_UTENTE.nome } : c));

  const counts = {
    all: catalogo.length,
    connected: catalogo.filter(i => i.status === 'connected').length,
    available: catalogo.filter(i => i.status === 'available' || i.status === 'disconnected').length,
  };

  const filterChips = [
    { id: 'all', label: 'Tutti', count: counts.all },
    { id: 'connected', label: 'Connessi', count: counts.connected },
    { id: 'available', label: 'Disponibili', count: counts.available },
  ];

  const visible = catalogo.filter(i => {
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
    presenza: 'Presenza online',
    api: 'Collegamenti API',
  };
  const catOrder = ['pagamenti','periferiche','delivery','presenza','api'];

  // Suggested: 4 popolari non connessi
  const suggested = catalogo
    .filter(i => i.status === 'available')
    .slice(0, 4);

  return (
    <div>
      {/* PRIMA — Hero "byup Pay" come sistema di incasso (stato operativo) */}
      <ByupPayHero devices={BYUP_PAY_DEVICES} onAdd={() => setQrApp(true)}/>

      <ImpCard title="Altre integrazioni" sub="Pagamenti, periferiche, delivery, presenza online e collegamenti API">
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
                : <IntegrationCard key={i.id} item={i} onMobileQr={() => setQrApp(true)} onApi={() => setCollega(true)}
                    connessioni={connessioni} onRevoca={revoca}/>
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

      {/* Le connessioni sono del ristorante, non della singola app: una card
          loro, dove si è aperto il collegamento. */}
      <IntConnessioniCard connessioni={connessioni} onRevoca={revoca}/>

      {/* Suggested */}
      {filter === 'all' && suggested.length > 0 && (
        <ImpCard title="Suggeriti per te" sub="Integrazioni popolari per ristoranti come il tuo">
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
            {suggested.map(i => <IntegrationCard key={i.id} item={i} suggested onMobileQr={() => setQrApp(true)} onApi={() => setCollega(true)}/>)}
          </div>
        </ImpCard>
      )}

      {qrApp && <ByupPayQrModal onClose={() => setQrApp(false)}/>}
      {collega && <IntCollegaModal onClose={() => setCollega(false)} onGenera={aggiungiConnessione}/>}
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

// Il POS virtuale nasce col collegamento a Stripe (P-105): la tessera lo
// dice e rimanda al foglio in Dati fiscali finché non è dichiarato.
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

function IntegrationCard({ item, suggested, onMobileQr, onApi, connessioni = [], onRevoca }) {
  // Sulla tessera di un'app connessa con UNA connessione viva l'azione è
  // «Revoca», con la conferma sul posto; «Nuova connessione» resta come
  // link. Con più connessioni la revoca si fa dall'elenco, che è il
  // registro: dice sede, chi, quando, e tiene le revocate come storia.
  const vive = connessioni.filter(c => c.application === item.id && !c.revoked_at);
  const [confermaRevoca, setConfermaRevoca] = React.useState(false);
  React.useEffect(() => { if (!confermaRevoca) return; const t = setTimeout(() => setConfermaRevoca(false), 4000); return () => clearTimeout(t); }, [confermaRevoca]);
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
        </div>
        {item.id === 'stripe' && <PosVirtualeRimando/>}

        <div style={{marginTop: 12}}>
          {item.status === 'connected' && item.api && (
            <React.Fragment>
              {/* Il pulsante è l'azione costruttiva; la revoca è discreta,
                  in grigio, e diventa rossa solo nel momento della conferma.
                  Con più connessioni vive si revoca dall'elenco. */}
              <ImpButton variant="ghost" style={azione} onClick={onApi}>Nuova connessione</ImpButton>
              {vive.length === 1 && (
                <div style={{marginTop: 8, minHeight: 20, display:'flex', justifyContent:'center', alignItems:'center', gap: 10, fontSize: 13, fontWeight: 600}}>
                  {confermaRevoca ? (
                    <React.Fragment>
                      <span style={{color: PN.RED}}>Revocare la connessione?</span>
                      <button onClick={() => { onRevoca && onRevoca(vive[0].id); setConfermaRevoca(false); }} style={{background: PN.RED, color: PN.WHITE, border:'none', borderRadius: 999, padding:'3px 10px', cursor:'pointer', fontFamily:'inherit', fontSize: 12.5, fontWeight: 700}}>Sì, revoca</button>
                      <button onClick={() => setConfermaRevoca(false)} style={{background:'transparent', color: PN.MUTED, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize: 12.5, fontWeight: 600}}>No</button>
                    </React.Fragment>
                  ) : (
                    <button onClick={() => setConfermaRevoca(true)} style={{background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize: 13, fontWeight: 600, color: PN.MUTED, textDecoration:'underline', textUnderlineOffset: 3}}>Revoca la connessione</button>
                  )}
                </div>
              )}
            </React.Fragment>
          )}
          {item.status === 'connected' && !item.api && (
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
            <ImpButton variant="ghost" style={azione} onClick={item.api ? onApi : undefined}>Connetti</ImpButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Connessioni con app esterne: l'elenco ──────────────────────────────────
// Applicazione, sede (o tutte), chi ha autorizzato e quando, ultimo utilizzo
// (last_used_at) e la revoca. La riga revocata resta in grigio con la data e
// chi l'ha chiusa: è storia, e la storia non si cancella.
function IntConnessioniCard({ connessioni, onRevoca }) {
  const [daRevocare, setDaRevocare] = React.useState(null); // id in conferma
  const col = '2.2fr 1.6fr 2fr 1.3fr 1.5fr';
  const th = { fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase' };
  return (
    <ImpCard title="Connessioni con app esterne" sub="Ogni connessione ha la sua credenziale e vale per una sede o per tutte. Revocarla la chiude subito.">
      {connessioni.length === 0 ? (
        <div style={{padding: '18px 0 6px', color: PN.MUTED, fontSize: 15}}>Nessuna app collegata.</div>
      ) : (
        <div>
          <div style={{display:'grid', gridTemplateColumns: col, gap: 12, padding: '0 6px 10px', ...th}}>
            <span>Applicazione</span><span>Sede</span><span>Autorizzata da</span><span>Ultimo utilizzo</span><span/>
          </div>
          {connessioni.map(c => {
            const app = INTEGRATIONS.find(i => i.id === c.application) || { name: c.application, logo: '?', bg: PN.MUTED };
            const revocata = !!c.revoked_at;
            const inConferma = daRevocare === c.id;
            return (
              <div key={c.id} style={{
                display:'grid', gridTemplateColumns: col, gap: 12, alignItems:'center',
                padding: '12px 6px', borderTop: `1px solid ${PN.BORDER_SOFT}`,
                opacity: revocata ? 0.55 : 1, fontSize: 14.5, color: PN.TEXT,
              }}>
                <div style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: revocata ? '#CBD5E1' : app.bg, color: app.color || '#fff',
                    display:'grid', placeItems:'center', fontSize: 15, fontWeight: 800,
                  }}>{app.logo}</span>
                  <div style={{minWidth: 0}}>
                    <div style={{fontWeight: 700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{app.name}</div>
                    <div style={{fontSize: 12.5, color: revocata ? PN.MUTED : PN.GREEN, fontWeight: 600}}>
                      {revocata ? `Revocata il ${intData(c.revoked_at)} da ${c.revoked_by}` : 'Attiva'}
                    </div>
                  </div>
                </div>
                <div>{intSedeNome(c.venue_id)}</div>
                <div>
                  <div>{c.authorized_by}</div>
                  <div style={{fontSize: 12.5, color: PN.MUTED}}>{intData(c.authorized_at)}</div>
                </div>
                <div style={{color: revocata ? PN.MUTED : PN.TEXT}}>{intRelativo(c.last_used_at)}</div>
                <div style={{display:'flex', justifyContent:'flex-end', gap: 6}}>
                  {!revocata && !inConferma && (
                    <ImpButton variant="ghost" style={{padding:'7px 12px', fontSize: 13.5}} onClick={() => setDaRevocare(c.id)}>Revoca</ImpButton>
                  )}
                  {/* La conferma sta nella riga: revocare chiude una porta verso
                      un terzo, e chi preme deve vederlo scritto un'ultima volta. */}
                  {!revocata && inConferma && (
                    <React.Fragment>
                      <ImpButton variant="ghost" style={{padding:'7px 10px', fontSize: 13.5}} onClick={() => setDaRevocare(null)}>Annulla</ImpButton>
                      <ImpButton variant="danger" style={{padding:'7px 12px', fontSize: 13.5}} onClick={() => { onRevoca(c.id); setDaRevocare(null); }}>Conferma revoca</ImpButton>
                    </React.Fragment>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ImpCard>
  );
}

// ─── Il foglio del collegamento: tre blocchi, la sede, la presa d'atto, la
// credenziale ────────────────────────────────────────────────────────────────
// Tre blocchi a tutta larghezza in testo piano, niente da aprire: chi collega
// un'app deve leggere cosa esce PRIMA di premere, e un testo dietro un
// «dettagli» non lo legge nessuno. Poi la sede, poi la spunta, poi il
// pulsante; la credenziale compare una volta sola e prende il posto del form.
function IntCollegaModal({ onClose, onGenera }) {
  const [scope, setScope] = React.useState('all');       // 'all' | id sede
  const [ack, setAck] = React.useState(false);            // mai preselezionata
  const [ackAt, setAckAt] = React.useState(null);         // controller_ack_at
  const [credenziale, setCredenziale] = React.useState(null);
  const [copiata, setCopiata] = React.useState(false);
  // Chi guarda è titolare? Nel mock sì, e questo ramo non si vede: resta
  // perché è la regola, non un dettaglio della demo — se il ruolo del mock
  // cambia, il pulsante si spegne e si spiega da solo.
  const puo = INT_UTENTE.titolare;
  const pronto = puo && ack;

  const spunta = () => {
    const v = !ack;
    setAck(v);
    setAckAt(v ? new Date() : null);
  };
  const genera = () => {
    if (!pronto) return;
    const token = 'byup_live_' + Array.from({ length: 28 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
    onGenera({
      id: 'conn-' + Date.now(), application: 'zapier',
      venue_id: scope === 'all' ? null : scope,
      authorized_by: INT_UTENTE.nome, controller_ack_at: ackAt, authorized_at: new Date(),
      last_used_at: null, revoked_at: null, revoked_by: null,
    });
    setCredenziale(token);
  };
  const copia = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(credenziale); } catch (e) {}
    setCopiata(true);
    setTimeout(() => setCopiata(false), 1600);
  };

  const blocco = (titolo, testo, tinta) => (
    <div style={{padding: '12px 14px 12px 16px', borderLeft: `3px solid ${tinta}`, background: '#FAFBFC', borderRadius: '0 10px 10px 0'}}>
      <div style={{fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: tinta, marginBottom: 4}}>{titolo}</div>
      <div style={{fontSize: 14.5, lineHeight: 1.5, color: PN.TEXT}}>{testo}</div>
    </div>
  );

  const pillola = (on, label, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '7px 13px', borderRadius: 999,
      border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
      background: on ? PN.TEXT : PN.WHITE, color: on ? PN.WHITE : PN.TEXT,
      fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>{label}</button>
  );

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 640, maxHeight: 'calc(var(--pn-vh, 100vh) * 0.92)', display:'flex', flexDirection:'column'}}>
        <div style={{...MODAL_HEAD, display:'flex', alignItems:'center', gap: 14}}>
          <span style={{width: 48, height: 48, borderRadius: 13, background: '#FF4F00', color: '#fff', display:'grid', placeItems:'center', fontSize: 22, fontWeight: 800, flexShrink: 0}}>Z</span>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{...MODAL_TITLE, fontSize: 22, paddingRight: 40}}>{credenziale ? 'Connessione creata' : 'Collega Zapier'}</div>
            <div style={{...MODAL_SUB, marginTop: 2, paddingRight: 40}}>
              {credenziale ? 'La credenziale la vedi solo adesso' : 'Prima di collegare, leggi cosa esce e chi risponde'}
            </div>
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>

        {credenziale ? (
          <div style={MODAL_BODY}>
            {/* Una volta sola: Byup non la conserva in chiaro, e non c'è un
                posto dove tornare a leggerla. Persa la credenziale, si revoca
                la connessione e se ne crea una nuova. */}
            <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
              Incollala in Zapier adesso. Byup non la conserva in chiaro: chiusa questa finestra non si può più leggere.
              Se la perdi, revoca la connessione e creane una nuova.
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap: 10, marginTop: 14,
              padding: '12px 14px', borderRadius: 10, background: '#F4F5F7', border: `1px solid ${PN.BORDER_SOFT}`,
              fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 14.5, letterSpacing: 0.3,
            }}>
              <span style={{flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{credenziale}</span>
              <ImpButton variant="ghost" style={{padding:'6px 12px', fontSize: 13.5}} onClick={copia}>{copiata ? 'Copiata' : 'Copia'}</ImpButton>
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 12}}>
              Vale per {intSedeNome(scope === 'all' ? null : scope)} · autorizzata da {INT_UTENTE.nome} · {intData(new Date())}
            </div>
            <div style={{marginTop: 20}}>
              <ImpButton variant="primary" style={{width:'100%', justifyContent:'center'}} onClick={onClose}>Fatto</ImpButton>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto', display:'flex', flexDirection:'column', gap: 10}}>
              {blocco('Cosa esce', INT_COSA_ESCE, PN.GREEN)}
              {blocco('Cosa non esce mai', INT_COSA_NON_ESCE, PN.WINE)}
              {blocco('Chi risponde', INT_CHI_RISPONDE, PN.TEXT)}

              {/* La sede: una o tutte. «Tutte» sono le sedi di QUESTO
                  ristorante; un'altra insegna qui non compare. */}
              <div style={{marginTop: 8}}>
                <div style={{fontSize: 13.5, fontWeight: 700, color: PN.MUTED, marginBottom: 8}}>Per quale sede</div>
                <div style={{display:'flex', gap: 7, flexWrap:'wrap'}}>
                  {pillola(scope === 'all', 'Tutte le sedi', () => setScope('all'))}
                  {INT_SEDI.map(sd => pillola(scope === sd.id, sd.name, () => setScope(sd.id)))}
                </div>
              </div>

              {/* La presa d'atto (controller_ack_at). Non è una formalità e
                  non è mai preselezionata: si registra quando si spunta. */}
              <button onClick={spunta} style={{
                display:'flex', alignItems:'flex-start', gap: 12, textAlign:'left', marginTop: 8,
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${ack ? PN.TEXT : PN.BORDER}`, background: PN.WHITE,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `1.5px solid ${ack ? PN.TEXT : PN.BORDER}`, background: ack ? PN.TEXT : PN.WHITE,
                  display:'grid', placeItems:'center',
                }}>
                  {ack && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                <span style={{fontSize: 14.5, lineHeight: 1.45, color: PN.TEXT}}>
                  Agisco come titolare del trattamento per i dati che escono verso Zapier, e ho con Zapier un mio accordo.
                </span>
              </button>
            </div>

            <div style={{...MODAL_FOOT, flexDirection:'column', gap: 8}}>
              <ImpButton variant="primary" disabled={!pronto} style={{width:'100%', justifyContent:'center'}} onClick={genera}>
                Genera la credenziale
              </ImpButton>
              {!puo && (
                <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45}}>
                  Solo il titolare del locale può collegare un'app esterna: il collegamento fa uscire dati verso un terzo, non è un'impostazione operativa.
                </div>
              )}
              {puo && !ack && (
                <div style={{fontSize: 13.5, color: PN.MUTED}}>Serve la presa d'atto qui sopra.</div>
              )}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

window.ImpIntegrazioni = ImpIntegrazioni;

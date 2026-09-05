// Impostazioni → Integrazioni (P-125 · P-134: tre blocchi — POS e strumenti di
// pagamento, Stampanti, Piattaforme e app esterne; via «Suggeriti per te»,
// che non faceva nulla e presupponeva una profilazione dei locali che non
// esiste e che nessuna decisione prevede).
//
// LA PAGINA SI CHIAMA «INTEGRAZIONI» (P-134). Il POS non si collega più da
// qui: uno smartphone che incassa non si appaia a niente — l'operatore apre
// Byup Staff, entra con le proprie credenziali personali, e il telefono si
// registra da solo al primo accesso. Quello che resta nella pagina è una cosa
// sola, gli oggetti esterni collegati a Byup: strumenti di pagamento,
// stampanti, piattaforme di consegna e applicazioni di terzi. Il nome lungo
// ne nominava uno e non gli altri tre.
// Il primo blocco però continua a chiamarsi «POS e strumenti di pagamento», e
// non è un residuo: lì dentro vive il censimento degli strumenti presso
// l'Agenzia delle Entrate, che è un obbligo di legge con una sanzione, e chi
// lo cerca lo cerca pensando «POS». Le notifiche fiscali e la pagina Dati
// fiscali ci portano dritto con un collegamento: se un giorno quei due rimandi
// si tolgono, il censimento diventa introvabile.

const INTEGRATIONS = [
  // Gli incassi. Il canale FISCALE non è più qui: un catalogo è il posto dove
  // si sceglie, e sul canale non c'è niente da scegliere — è uno solo, è
  // incluso nell'abbonamento (D-38), non si collega e non si scollega, e la
  // tessera «Connesso · API key configurata» col pulsante «Configura» che non
  // configurava nulla era un doppione che non portava da nessuna parte. Chi
  // trasmette gli scontrini e le fatture si legge dove il fiscale vive, cioè
  // in Dati fiscali, accanto a credenziali, delega, POS e codice destinatario.
  // Nemmeno il riquadro che lo spiegava sta più qui (4 settembre 2026): era la
  // risposta a una domanda che nessuno si pone davanti a un catalogo di
  // collegamenti — spiegava l'assenza di una tessera, e l'assenza non ha
  // bisogno di essere spiegata. Stripe invece resta: quello è un collegamento vero, che si
  // apre, si ricollega e col cambio di soggetto si disabilita.
  { id:'stripe', name:'Stripe', cat:'pagamenti', logo:'S', bg:'#635BFF', desc:'Pagamenti online & checkout', status:'connected', detail:'acct_••••dE3v · sync ora', required: true,
    // Non c'è nulla da «configurare» da questa parte: il conto, i versamenti e
    // i documenti dell'account vivono sulla dashboard di Stripe, e il pulsante
    // ci porta — fuori, in una scheda nuova, come dice la freccia.
    gestisci: 'https://dashboard.stripe.com/' },
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
  // Collegamenti API — Zapier è la prima realizzazione del collegamento
  // generico (P-32 · D-29), a dominio aperto: la tessera apre il foglio
  // IntCollegaModal e il suo stato si RICAVA dall'elenco delle connessioni
  // (vedi ImpIntegrazioni), non sta scritto qui. Niente prezzo e niente
  // cancello sull'add-on api_third_party: il gating commerciale si decide al
  // lancio, e finché non è deciso la scheda non lo inventa. Il catalogo degli
  // eventi che il ristoratore può automatizzare, e dei dati che escono con
  // ciascuno, non è ancora scritto: va definito prima di attivarlo.
  // Google Business Profile non c'è (P-118): lecito in principio (D-29), ma
  // non studiato — niente tessera «in arrivo», un'integrazione non studiata
  // non si promette. Aruba non c'è (D-38).
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
//     dati verso un terzo, non è un'impostazione operativa. Lo dice il
//     messaggio in fondo al foglio quando chi guarda non è il titolare.
//   controller_ack_at — la presa d'atto: prima di generare la credenziale
//     l'esercente dichiara di agire come titolare del trattamento per il
//     flusso verso il terzo e di avere con esso un proprio accordo. Spunta
//     dedicata, mai preselezionata; si registra al momento della spunta.
//   authorized_at — alla generazione della credenziale.
//   last_used_at / revoked_at — la revoca chiude la riga, non la cancella:
//     la connessione revocata resta visibile come storia.
// Due righe, non tre paragrafi (4 settembre 2026): che cosa esce e che cosa
// non esce sono l'unica cosa che il foglio DEVE dire, e la responsabilità del
// flusso la dichiara la spunta qui sotto, che è l'atto che conta. Il blocco
// «Chi risponde» ripeteva a parole quello che la spunta fa.
const INT_COSA_ESCE = 'Ordini, conti, documenti fiscali e incassi della sede; prenotazioni, recensioni, catalogo e personale.';
const INT_COSA_NON_ESCE = 'I dati di altri locali, allergeni e note sanitarie, il profilo Byup del cliente e i dati di carta.';

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

const STATUS_LABEL = {
  connected: { label: 'Connesso', color: PN.GREEN, bg: PN.GREEN_SOFT, dot: PN.GREEN },
  predisposta: { label: 'Predisposta', color: PN.AMBER, bg: PN.AMBER_SOFT, dot: PN.AMBER },
  // La piattaforma collegata dal foglio (P-157): stato letto dal registro
  // condiviso, lo stesso che il foglio scrive. L'add-on resta spento nell'MVP.
  collegata:   { label: 'Collegata', color: PN.GREEN, bg: PN.GREEN_SOFT, dot: PN.GREEN },
  todo: { label: 'Da configurare', color: '#D97706', bg: PN.AMBER_SOFT, dot: '#F59E0B' },
  available: { label: 'Disponibile', color: PN.MUTED, bg: '#F4F5F7', dot: PN.MUTED_LIGHT },
  disconnected: { label: 'Non connesso', color: PN.MUTED, bg: '#F4F5F7', dot: PN.MUTED_LIGHT },
};

function ImpIntegrazioni() {
  // Le connessioni con app esterne: in memoria, niente persistenza. La
  // SEZIONE «Connessioni con app esterne» non c'è più (4 settembre 2026, per
  // decisione del titolare): era un elenco a parte per una cosa che la
  // tessera dice già — se c'è una connessione viva, chi l'ha autorizzata e
  // quando — e la revoca vive sulla tessera stessa, dove uno la cerca. Il
  // collegamento con Zapier resta: quello si fa, ed è il collegamento
  // generico di P-32 (D-29).
  const [connessioni, setConnessioni] = React.useState(INT_CONNESSIONI_MOCK);
  const [collega, setCollega] = React.useState(false);
  // Le piattaforme di consegna collegate (P-157): lo stato è del registro
  // condiviso, non della tessera né del foglio.
  const [collegamenti, setCollegamenti] = React.useState(() => (window.byupReadDeliveryCollegamenti ? window.byupReadDeliveryCollegamenti() : {}));
  React.useEffect(() => {
    const ri = () => setCollegamenti(window.byupReadDeliveryCollegamenti ? window.byupReadDeliveryCollegamenti() : {});
    window.addEventListener('byup-delivery-change', ri); window.addEventListener('storage', ri);
    return () => { window.removeEventListener('byup-delivery-change', ri); window.removeEventListener('storage', ri); };
  }, []);
  const catalogo = INTEGRATIONS.map(i => {
    if (i.status === 'predisposta' && collegamenti[i.id]) {
      const c = collegamenti[i.id];
      return { ...i, status: 'collegata', detail: `${c.dettaglio ? c.dettaglio + ' · ' : ''}collegata il ${intData(new Date(c.quando))}` };
    }
    if (!i.api) return i;
    const vive = connessioni.filter(c => c.application === i.id && !c.revoked_at);
    const una = vive.length === 1 ? vive[0] : null;
    return { ...i, status: vive.length ? 'connected' : 'available',
      detail: vive.length ? (una ? `da ${una.authorized_by} · ${intData(una.authorized_at)}` : `${vive.length} connessioni attive`) : undefined };
  });
  const aggiungiConnessione = (c) => setConnessioni(l => [c, ...l]);
  // La revoca chiude la riga, non la cancella: la connessione revocata resta
  // nel registro come storia, anche se a schermo non c'è più l'elenco.
  const revoca = (id) => setConnessioni(l => l.map(c => c.id === id
    ? { ...c, revoked_at: new Date(), revoked_by: INT_UTENTE.nome } : c));
  const per = (cat) => catalogo.filter(i => i.cat === cat);
  const griglia = { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12 };
  const tessere = (lista) => lista.map(i => (
    <IntegrationCard key={i.id} item={i} onApi={() => setCollega(true)}
      connessioni={connessioni} onRevoca={revoca}/>
  ));
  // Il titolo di blocco: la pagina è tre blocchi (P-125), e ogni blocco lo
  // dice prima delle sue card.
  const Blocco = ({ children }) => (
    <div style={{ fontSize: 13.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', margin: '4px 2px 10px' }}>{children}</div>
  );

  return (
    <div>
      {/* BLOCCO 1 — POS e strumenti di pagamento. Il nome resta questo (P-134):
          qui dentro vive il rimando al censimento degli strumenti presso
          l'Agenzia, che è un obbligo di legge, e chi lo cerca lo cerca
          pensando «POS». Quello che è sparito è l'elenco dei telefoni: non si
          collegavano da qui e non si scollegano da qui, si registrano
          entrando in Byup Staff — e stanno in Personale, con la persona che
          li porta in tasca. */}
      <Blocco>POS e strumenti di pagamento</Blocco>
      <ImpCard title="Incassi" sub="Il conto su cui arrivano i pagamenti, con la verifica del prestatore. I telefoni che incassano si vedono in Impostazioni → Personale: si registrano da soli quando chi è in sala entra in Byup Staff.">
        <div style={griglia}>{tessere(per('pagamenti'))}</div>
      </ImpCard>

      {/* BLOCCO 2 — Stampanti (P-128): il popup «Aggiungi stampante»
          sostituisce la sezione Impostazioni → Stampanti. */}
      <Blocco>Stampanti</Blocco>
      {window.ImpStampantiBlocco && <window.ImpStampantiBlocco/>}

      {/* BLOCCO 3 — Le piattaforme di consegna predisposte (P-119) e il
          collegamento con le app esterne (P-32). */}
      <Blocco>Piattaforme e app esterne</Blocco>
      <ImpCard title="Piattaforme di consegna" sub="Predisposte, non attive: Glovo, Deliveroo e Uber Eats entrano con l'add-on quando ci saranno gli accordi. «Collega» percorre il collegamento che la piattaforma chiede, con dati di esempio.">
        <div style={griglia}>{tessere(per('delivery'))}</div>
      </ImpCard>
      <ImpCard title="App esterne" sub="Il collegamento con le tue app: la scheda dice che cosa esce e che cosa non esce, chi è titolare del flusso, e chiede la presa d'atto prima di generare la credenziale.">
        <div style={griglia}>{tessere(per('api'))}</div>
      </ImpCard>

      {collega && <IntCollegaModal onClose={() => setCollega(false)} onGenera={aggiungiConnessione}/>}
    </div>
  );
}
// Il riquadro «Byup Staff» con l'elenco dei telefoni non è più qui. Dopo
// P-134 non aveva più niente da far fare: il telefono non si collega — chi
// è in sala apre l'applicazione, entra con le sue credenziali e il telefono
// si registra da sé — e quindi quel riquadro elencava due apparecchi che
// compaiono e spariscono per conto loro, sotto un titolo che prometteva una
// cassa. Chi incassa si guarda dove si guarda chi entra, cioè in
// Impostazioni → Personale, dove ogni telefono porta la persona che ce l'ha
// in tasca e la sua pastiglia del censimento all'Agenzia.
// Quello che NON si è perso: lo scollegamento di un telefono era anche una
// variazione dovuta all'Agenzia (P-105), e quella strada resta — la riga del
// telefono in Personale porta al foglio precompilato dello strumento.

// Il foglio col QR di Byup Staff non è più qui (P-134). Si chiamava «Collega
// un dispositivo» e non collegava niente: mostrava il codice per SCARICARE
// l'applicazione. Lo stesso codice sta in Impostazioni → Personale, accanto
// alla persona che quel telefono lo userà, ed è il posto giusto: è lì che si
// aggiunge chi incassa.

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

function IntegrationCard({ item, suggested, onApi, connessioni = [], onRevoca }) {
  // Predisposta (P-119): «Collega» apre il foglio della piattaforma, che
  // percorre il collegamento vero — quello documentato dalla piattaforma — con
  // dati di esempio. L'add-on resta spento nell'MVP e il foglio lo dice in
  // fondo: si simula il percorso, non si finge che sia acceso.
  const [scheda, setScheda] = React.useState(false);
  // La revoca vive QUI, sulla tessera, da quando l'elenco a parte non c'è
  // più: con una connessione viva l'azione è «Revoca», con la conferma sul
  // posto; «Nuova connessione» resta il pulsante. Con più connessioni si
  // revoca dalla tessera una alla volta, l'ultima autorizzata per prima.
  const vive = connessioni.filter(c => c.application === item.id && !c.revoked_at);
  const [confermaRevoca, setConfermaRevoca] = React.useState(false);
  React.useEffect(() => { if (!confermaRevoca) return; const t = setTimeout(() => setConfermaRevoca(false), 4000); return () => clearTimeout(t); }, [confermaRevoca]);
  // Stripe: lo stato vero sta nel registro byup_stripe (panoramica-tokens) —
  // il cambio di soggetto fiscale lo disabilita, e da qui si ricollega con
  // l'onboarding Stripe (simulato) del nuovo soggetto.
  const [stripe, setStripe] = React.useState(() => window.byupReadStripe ? byupReadStripe() : { status: 'active' });
  const [ricollegando, setRicollegando] = React.useState(false);
  React.useEffect(() => {
    const ri = () => setStripe(byupReadStripe());
    window.addEventListener('byup-stripe-change', ri);
    window.addEventListener('storage', ri);
    return () => { window.removeEventListener('byup-stripe-change', ri); window.removeEventListener('storage', ri); };
  }, []);
  // I quattro stati del modello (P-130), e non sono la stessa cosa:
  //   pending    — il conto è aperto e Stripe lo sta ancora verificando; per
  //                il locale appena entrato è l'invito a collegarlo;
  //   restricted — il conto lavora a metà: Stripe ha fermato gli incassi
  //                oppure i versamenti finché non arriva quello che chiede;
  //   disabled   — il soggetto fiscale è cambiato e l'account era intestato al
  //                precedente: se ne apre uno nuovo.
  const stripeCard = item.id === 'stripe';
  const stripePrimo = stripeCard && stripe.status === 'pending';
  const stripeLimitato = stripeCard && stripe.status === 'restricted';
  const stripeGiu = stripeCard && stripe.status !== 'active';
  const stripeCarte = stripe.limite === 'charges';
  if (stripeGiu) item = { ...item, status: 'todo', required: true,
    detail: stripePrimo ? 'Serve per incassare: carte al tavolo, in app e online'
      : stripeLimitato ? (stripeCarte ? 'Incassi con la carta sospesi' : 'Versamenti fermi, incassi regolari')
      : 'Disabilitato: il soggetto fiscale è cambiato',
    cta: stripePrimo ? 'Collega Stripe' : stripeLimitato ? 'Completa la verifica su Stripe' : 'Ricollega Stripe' };
  const ricollega = () => {
    // Il conto limitato non si sblocca da qui: i documenti che Stripe chiede
    // al ristoratore non li raccogliamo e non li conserviamo noi, mai. Il
    // pulsante porta fuori, sulla sua dashboard.
    if (stripeLimitato) { window.open('https://dashboard.stripe.com/', '_blank', 'noopener'); return; }
    setRicollegando(true);
    setTimeout(() => { setRicollegando(false); if (stripePrimo) byupStripeCollega(); else byupStripeRicollega(); }, 1800);
  };
  const stStripe = (window.PN_STRIPE_STATI || {})[stripe.status] || {};
  const s = stripeGiu ? { ...STATUS_LABEL.todo, label: stStripe.label || 'Da collegare' } : STATUS_LABEL[item.status];
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
          {(item.status === 'predisposta' || item.status === 'collegata') && <span style={{color:PN.MUTED, fontWeight: 500, minWidth: 0}}>· add-on spento nell'MVP</span>}
        </div>
        {stripeCard && <PosVirtualeRimando/>}

        {/* Il conto limitato, detto per conseguenza e non per stato: «limitato»
            non vuol dire una cosa sola — Stripe può fermare i versamenti
            lasciando passare gli incassi, o fermare gli incassi — e quale
            delle due sia in corso lo sa solo lui. */}
        {stripeLimitato && (
          <div data-stripe-limite={stripe.limite || 'payouts'} style={{
            marginTop: 10, padding: '10px 12px', borderRadius: 10,
            background: PN.AMBER_SOFT, border: '1px solid #FCD34D',
            fontSize: 13, color: '#78350F', lineHeight: 1.5,
          }}>
            {(window.PN_STRIPE_LIMITI || {})[stripeCarte ? 'charges' : 'payouts']}
            <span style={{display: 'block', marginTop: 6, color: PN.MUTED}}>
              Nel prototipo scegliamo noi quale delle due cose è ferma: senza Stripe vero non c'è modo di saperlo, e non si salva — cambia da un'ora all'altra.
            </span>
          </div>
        )}

        {/* Finzione DICHIARATA (P-130): senza Stripe vero il conto non passa
            mai a «limitato», e quella schermata non si potrebbe guardare. Da
            qui si sceglie quale dei due casi mostrare. */}
        {stripeCard && (
          <div style={{marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: PN.MUTED_LIGHT, alignItems: 'baseline'}}>
            <span>Prototipo:</span>
            {[['payouts', 'versamenti fermi'], ['charges', 'incassi fermi']].map(([k, label]) => (
              <button key={k} data-stripe-simula={k} onClick={() => window.byupStripeLimita(k)} style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 600, color: PN.MUTED, textDecoration: 'underline', textUnderlineOffset: 2,
              }}>{label}</button>
            ))}
            {stripe.status !== 'active' && (
              <button data-stripe-simula="active" onClick={() => window.byupWriteStripe({ status: 'active' })} style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 600, color: PN.MUTED, textDecoration: 'underline', textUnderlineOffset: 2,
              }}>conto a posto</button>
            )}
          </div>
        )}

        <div style={{marginTop: 12}}>
          {item.status === 'connected' && item.api && (
            <React.Fragment>
              <ImpButton variant="ghost" style={azione} onClick={onApi}>Nuova connessione</ImpButton>
              {vive.length >= 1 && (
                <div style={{marginTop: 8, minHeight: 20, display:'flex', justifyContent:'center', alignItems:'center', gap: 10, fontSize: 13, fontWeight: 600, flexWrap:'wrap'}}>
                  {confermaRevoca ? (
                    <React.Fragment>
                      <span style={{color: PN.RED}}>Revocare la connessione?</span>
                      <button onClick={() => { onRevoca && onRevoca(vive[0].id); setConfermaRevoca(false); }} style={{background: PN.RED, color: PN.WHITE, border:'none', borderRadius: 999, padding:'3px 10px', cursor:'pointer', fontFamily:'inherit', fontSize: 12.5, fontWeight: 700}}>Sì, revoca</button>
                      <button onClick={() => setConfermaRevoca(false)} style={{background:'transparent', color: PN.MUTED, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize: 12.5, fontWeight: 600}}>No</button>
                    </React.Fragment>
                  ) : (
                    <button onClick={() => setConfermaRevoca(true)} style={{background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize: 13, fontWeight: 600, color: PN.MUTED, textDecoration:'underline', textUnderlineOffset: 3}}>{vive.length > 1 ? `Revoca l'ultima (${vive.length} attive)` : 'Revoca la connessione'}</button>
                  )}
                </div>
              )}
            </React.Fragment>
          )}
          {item.status === 'connected' && !item.api && (
            <ImpButton variant="ghost" style={azione}
              onClick={item.gestisci ? () => window.open(item.gestisci, '_blank', 'noopener') : undefined}>
              Gestisci su {item.name}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </ImpButton>
          )}
          {item.status === 'todo' && (
            <ImpButton
              variant="primary"
              style={azione}
              disabled={ricollegando}
              onClick={stripeGiu ? ricollega : undefined}
            >{ricollegando ? 'Collegamento in corso…' : (item.cta || 'Configura ora')}</ImpButton>
          )}
          {(item.status === 'available' || item.status === 'disconnected') && (
            <ImpButton variant="ghost" style={azione} onClick={item.api ? onApi : undefined}>Connetti</ImpButton>
          )}
          {(item.status === 'predisposta' || item.status === 'collegata') && (
            <React.Fragment>
              <ImpButton variant="ghost" style={azione} onClick={() => setScheda(true)}>{item.status === 'collegata' ? 'Rivedi il collegamento' : 'Collega'}</ImpButton>
              {scheda && <IntDeliveryModal item={item} onClose={() => setScheda(false)}/>}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Il collegamento di una piattaforma di consegna (P-119 · D-106) ────────
// Tre piattaforme, tre modi di collegarsi, e non sono intercambiabili: qui
// sono percorsi come li documentano loro, con dati di esempio.
//   GLOVO — collegamento fra macchine con il token di partner che Glovo
//     condivide con l'integratore (lo stesso con cui firma i webhook): non si
//     digitano credenziali di Glovo. Quello che serve a noi è l'identificativo
//     del punto vendita, lo Store ID, nella forma nome-partner__id-locale; i
//     punti vendita di produzione li crea Glovo alla messa in esercizio, ed è
//     lì che il primo controllo può non trovare nulla.
//   DELIVEROO — il locale si collega dal SUO Partner Hub: Integrazioni →
//     Collega sedi, dove incolla il codice di collegamento che gli diamo noi
//     nel campo «Site location ID», sceglie il marchio e dichiara che il menù
//     lo aggiorna dalla cassa. Byup non entra in quel portale: controlla che
//     la sede sia comparsa.
//   UBER EATS — autorizzazione OAuth dell'app di Byup sull'account del locale
//     (scope eats.pos_provisioning): nessuna credenziale digitata da noi.
//     Dopo l'autorizzazione si leggono i punti vendita dell'account e si
//     attivano quelli scelti; si può nominare Byup gestore degli ordini, cioè
//     chi li accetta e li rifiuta. Il negozio resta in pausa finché non lo si
//     mette online.
// Il primo controllo fallisce apposta, come in tutte le verifiche del
// prototipo: è il caso vero di chi torna qui prima che l'altra parte sia
// pronta, e la diagnosi dice dove guardare.
const INT_DELIVERY_SEDE = 'Cacio e Pepe · Ostiense';
const INT_DELIVERY = {
  glovo: {
    passi: ['Account Glovo Partners', 'Store ID della sede', 'Menù e ordini'],
    codice: 'cacioepepe__ostiense',
  },
  deliveroo: {
    passi: ['Codice di collegamento', 'Partner Hub di Deliveroo', 'Controllo'],
    codice: 'byup-cp-ostiense-7d3a',
    portale: 'https://partner-hub.deliveroo.com/',
    tap: [
      'Accedi a partner-hub.deliveroo.com con l\'account del locale',
      'Apri Integrazioni nella barra laterale',
      'Premi «Collega sedi» e spunta Cacio e Pepe · Ostiense',
      'Incolla il codice qui sopra nel campo «Site location ID»',
      'Alla domanda sul marchio scegli il Brand ID della sede',
      'Alla domanda sul menù rispondi «Sì, aggiorno il menù dalla cassa»',
      'Conferma',
    ],
    cause: [
      'Il codice è incollato per intero, senza spazi.',
      'La sede spuntata è quella giusta: il codice vale per una sede sola.',
      'Il marchio è stato scelto: senza Brand ID la sede resta a metà.',
      'Il collegamento può metterci qualche minuto a comparire: riprova.',
    ],
  },
  ubereats: {
    passi: ['Autorizza Byup su Uber', 'Punti vendita', 'Attivazione'],
    negozi: [
      { id: '8f2c1a4e-9b77-4d3a-88e1-2f5a7c9d0b12', nome: 'Cacio e Pepe · Ostiense', via: 'Via dei Giubbonari 27, Roma' },
      { id: 'a41d7b90-3c22-4f18-9ad6-6e0b4c8f1d55', nome: 'Cacio e Pepe · Trastevere', via: 'Vicolo del Cinque 8, Roma' },
    ],
  },
};

function IntDeliveryModal({ item, onClose }) {
  const cfg = INT_DELIVERY[item.id] || INT_DELIVERY.glovo;
  const [passo, setPasso] = React.useState(1);
  const [valore, setValore] = React.useState(item.id === 'glovo' ? cfg.codice : '');
  const [fase, setFase] = React.useState('idle');          // idle | corso | errore
  const [tentativi, setTentativi] = React.useState(0);
  const [scelti, setScelti] = React.useState(item.id === 'ubereats' ? [cfg.negozi[0].id] : []);
  const [gestore, setGestore] = React.useState(true);      // Byup accetta e rifiuta gli ordini
  const [copiato, setCopiato] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  // L'esito vive nel registro condiviso (P-157): riaprendo il foglio di una
  // piattaforma già collegata si riparte da lì, e la tessera dice lo stesso.
  const [fatto, setFatto] = React.useState(() => !!(window.byupReadDeliveryCollegamenti && window.byupReadDeliveryCollegamenti()[item.id]));
  const completa = () => {
    setFatto(true);
    if (window.byupCollegaDelivery) window.byupCollegaDelivery(item.id, item.id === 'glovo' ? `store ${valore}` : item.id === 'deliveroo' ? INT_DELIVERY_SEDE : `${scelti.length} punt${scelti.length === 1 ? 'o' : 'i'} vendita`);
  };
  // Il foglio nel sacchetto: la casella è per piattaforma, e nasce accesa (P-129).
  const [cortesia, setCortesia] = React.useState(() => (window.byupAutoPrintCortesiaPiattaforma ? window.byupAutoPrintCortesiaPiattaforma(item.id) : true));

  const copia = (testo) => {
    try { navigator.clipboard && navigator.clipboard.writeText(testo); } catch (e) {}
    setCopiato(true); setTimeout(() => setCopiato(false), 1600);
  };
  // Il controllo: primo giro a vuoto, secondo buono. Vale per lo Store ID di
  // Glovo, per la comparsa della sede su Deliveroo e per il consenso di Uber.
  const controlla = (avanti) => {
    if (fase === 'corso') return;
    setFase('corso');
    const t = tentativi + 1; setTentativi(t);
    setTimeout(() => {
      if (t === 1 && item.id !== 'ubereats') { setFase('errore'); return; }
      setFase('idle'); setTentativi(0); avanti();
    }, 1600);
  };

  const inp = { width: '100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 9, fontSize: 15, fontFamily: 'ui-monospace, Menlo, monospace', boxSizing: 'border-box', outline: 'none' };
  const nota = (testo) => <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.55, marginTop: 8}}>{testo}</div>;
  const errore = (titolo, cause) => fase === 'errore' && (
    <div style={{marginTop: 12, padding: '11px 13px', borderRadius: 10, background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.22)', fontSize: 14, color: PN.TEXT, lineHeight: 1.5}}>
      <b style={{color: '#991B1B'}}>{titolo}</b>
      <ol style={{margin: '6px 0 0', paddingLeft: 20, display:'flex', flexDirection:'column', gap: 3}}>{cause.map((c, i) => <li key={i}>{c}</li>)}</ol>
    </div>
  );
  const bloccoCodice = (testo, etichetta) => (
    <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap', padding:'11px 13px', borderRadius: 10, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`}}>
      <div style={{flex: 1, minWidth: 160}}>
        <div style={{fontSize: 12.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase'}}>{etichetta}</div>
        <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace', letterSpacing: 0.3, userSelect:'all', wordBreak:'break-all'}}>{testo}</div>
      </div>
      <ImpButton variant="ghost" style={{padding:'7px 13px', fontSize: 14}} onClick={() => copia(testo)}>{copiato ? 'Copiato' : 'Copia'}</ImpButton>
    </div>
  );

  // ── I tre percorsi ────────────────────────────────────────────────────────
  let corpo = null, azione = null;
  if (item.id === 'glovo') {
    if (passo === 1) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55}}>
            Serve un account <b>Glovo Partners</b> attivo per la sede che vuoi collegare. Il collegamento è fra macchine: Glovo condivide con Byup un token di partner, e con quello Byup chiama Glovo e riconosce i suoi avvisi. La tua password di Glovo non passa da qui e non te la chiediamo.
          </div>
          {nota('Se la sede non è ancora su Glovo Partners, aprila prima lì: senza account attivo non c\'è nulla da collegare.')}
        </div>
      );
      azione = <ImpButton variant="primary" style={{width:'100%', justifyContent:'center'}} onClick={() => setPasso(2)}>Ho l'account, continua</ImpButton>;
    } else if (passo === 2) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55, marginBottom: 12}}>
            Incolla lo <b>Store ID</b> del punto vendita: è l'identificativo con cui Glovo lo riconosce, nella forma <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>nome-partner__id-punto-vendita</span>. Lo trovi in Glovo Manager, oppure te lo dà il tuo account manager Glovo.
          </div>
          <input value={valore} onChange={e => { setValore(e.target.value); if (fase === 'errore') setFase('idle'); }} placeholder="cacioepepe__ostiense" style={inp}/>
          {nota(`Vale per ${INT_DELIVERY_SEDE}: uno Store ID è di una sede sola.`)}
          {errore('Punto vendita non trovato in produzione.', [
            'Lo Store ID è copiato per intero, con i due trattini bassi.',
            'I punti vendita di produzione li crea Glovo alla messa in esercizio: se il tuo non c\'è ancora, l\'account manager lo apre.',
            'Riprova fra qualche minuto: la creazione non è immediata.',
          ])}
        </div>
      );
      azione = <ImpButton variant="primary" disabled={!valore.trim() || fase === 'corso'} style={{width:'100%', justifyContent:'center'}} onClick={() => controlla(() => setPasso(3))}>{fase === 'corso' ? 'Controllo su Glovo…' : fase === 'errore' ? 'Riprova' : 'Verifica lo Store ID'}</ImpButton>;
    } else {
      corpo = (
        <div>
          <div style={{padding:'11px 13px', borderRadius: 10, background:'#F0FDF4', border:`1px solid ${PN.GREEN_SOFT}`, fontSize: 14.5, color:'#065F46', lineHeight: 1.5}}>
            Punto vendita <b style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{valore}</b> collegato a {INT_DELIVERY_SEDE}.
          </div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55, marginTop: 12}}>{item.scheda}</div>
          <label style={{display:'flex', alignItems:'flex-start', gap: 10, marginTop: 12, padding:'11px 13px', borderRadius: 10, border:`1.5px solid ${menu ? PN.TEXT : PN.BORDER}`, cursor:'pointer'}}>
            <input type="checkbox" checked={menu} onChange={() => setMenu(v => !v)} style={{marginTop: 2, accentColor: PN.PINK_DARK}}/>
            <span style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.45}}>Pubblica adesso il menù su Glovo. La pubblicazione riceve un identificativo di transazione e l'esito arriva dopo, non subito: te lo diciamo qui.</span>
          </label>
        </div>
      );
      azione = <ImpButton variant="primary" style={{width:'100%', justifyContent:'center'}} onClick={completa}>Fine</ImpButton>;
    }
  } else if (item.id === 'deliveroo') {
    if (passo === 1) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55, marginBottom: 12}}>
            Questo è il codice con cui Deliveroo riconosce {INT_DELIVERY_SEDE} come una sede collegata a Byup. Copialo: fra un momento va incollato sul tuo Partner Hub.
          </div>
          {bloccoCodice(cfg.codice, 'Codice di collegamento della sede')}
          {nota('Il collegamento è fra macchine, con le credenziali dell\'integratore: le tue di Deliveroo non passano da qui.')}
        </div>
      );
      azione = <ImpButton variant="primary" style={{width:'100%', justifyContent:'center'}} onClick={() => setPasso(2)}>Ho copiato il codice</ImpButton>;
    } else if (passo === 2) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55, marginBottom: 12}}>
            Il collegamento lo confermi tu sul <b>Partner Hub di Deliveroo</b>, con il tuo accesso. Byup non entra lì dentro.
          </div>
          <ol style={{margin: 0, paddingLeft: 20, display:'flex', flexDirection:'column', gap: 5}}>
            {cfg.tap.map((t, i) => <li key={i} style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.45}}>{t}</li>)}
          </ol>
          <div style={{marginTop: 12}}>
            <a href={cfg.portale} target="_blank" rel="noopener" style={{display:'inline-flex', alignItems:'center', gap: 7, padding:'9px 15px', borderRadius: 9, background: PN.TEXT, color: PN.WHITE, fontSize: 14.5, fontWeight: 600, textDecoration:'none'}}>
              Apri il Partner Hub
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </a>
          </div>
        </div>
      );
      azione = <ImpButton variant="primary" style={{width:'100%', justifyContent:'center'}} onClick={() => setPasso(3)}>Fatto, controlla</ImpButton>;
    } else if (passo === 3 && !fatto) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55}}>
            Controlliamo che la sede sia comparsa fra le integrazioni di Deliveroo, con il suo marchio e il menù dichiarato «dalla cassa».
          </div>
          {errore('Sede non collegata.', cfg.cause)}
        </div>
      );
      azione = <ImpButton variant="primary" disabled={fase === 'corso'} style={{width:'100%', justifyContent:'center'}} onClick={() => controlla(completa)}>{fase === 'corso' ? 'Controllo su Deliveroo…' : fase === 'errore' ? 'Riprova' : 'Controlla il collegamento'}</ImpButton>;
    }
  } else {
    if (passo === 1) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55}}>
            Ti portiamo sulla pagina di Uber: accedi con l'account del locale e autorizza Byup. Il permesso che chiediamo è uno solo, <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>eats.pos_provisioning</span>, quello che serve a collegare i punti vendita alla cassa. Nessuna credenziale passa da Byup.
          </div>
          {nota('Puoi revocare l\'autorizzazione quando vuoi dall\'account Uber Eats del locale.')}
        </div>
      );
      azione = <ImpButton variant="primary" disabled={fase === 'corso'} style={{width:'100%', justifyContent:'center'}} onClick={() => controlla(() => setPasso(2))}>{fase === 'corso' ? 'Attendo l\'autorizzazione…' : 'Accedi con Uber'}</ImpButton>;
    } else if (passo === 2) {
      corpo = (
        <div>
          <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55, marginBottom: 12}}>
            Questi sono i punti vendita dell'account. Scegli quelli da collegare: per ciascuno Byup registra l'integrazione presso Uber.
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            {cfg.negozi.map(n => {
              const on = scelti.includes(n.id);
              return (
                <label key={n.id} style={{display:'flex', alignItems:'flex-start', gap: 11, padding:'11px 13px', borderRadius: 10, cursor:'pointer', border:`1.5px solid ${on ? PN.TEXT : PN.BORDER}`, background: PN.WHITE}}>
                  <input type="checkbox" checked={on} onChange={() => setScelti(l => on ? l.filter(x => x !== n.id) : [...l, n.id])} style={{marginTop: 3, accentColor: PN.PINK_DARK}}/>
                  <span style={{minWidth: 0}}>
                    <span style={{display:'block', fontSize: 15, fontWeight: 700, color: PN.TEXT}}>{n.nome}</span>
                    <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{n.via}</span>
                    <span style={{display:'block', fontSize: 12.5, color: PN.MUTED, marginTop: 2, fontFamily:'ui-monospace, Menlo, monospace', wordBreak:'break-all'}}>store {n.id}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <label style={{display:'flex', alignItems:'flex-start', gap: 10, marginTop: 12, padding:'11px 13px', borderRadius: 10, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, cursor:'pointer'}}>
            <input type="checkbox" checked={gestore} onChange={() => setGestore(v => !v)} style={{marginTop: 2, accentColor: PN.PINK_DARK}}/>
            <span style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.45}}>Byup gestisce gli ordini: li accetta e li rifiuta per conto del locale, dalla coda e dal monitor di cucina. Senza questa spunta restano da accettare sull'app di Uber Eats.</span>
          </label>
        </div>
      );
      azione = <ImpButton variant="primary" disabled={!scelti.length || fase === 'corso'} style={{width:'100%', justifyContent:'center'}} onClick={() => controlla(completa)}>{fase === 'corso' ? 'Attivazione in corso…' : 'Attiva l\'integrazione'}</ImpButton>;
    }
  }

  // Il foglio nel sacchetto (P-129). Sta nella scheda della piattaforma perché
  // l'impostazione è per sede E per piattaforma: un locale può volerlo per
  // Glovo e non per Deliveroo, perché le piattaforme non stampano tutte la
  // stessa etichetta. Nasce ACCESA — un sacchetto che parte senza foglio è un
  // errore che il cliente scopre a casa, e nessuno va ad accendere
  // un'impostazione di cui ignora l'esistenza — e si spegne, perché chi stampa
  // già l'etichetta della piattaforma si ritroverebbe due fogli nello stesso
  // sacchetto.
  // Il foglio esce in coda alla COMANDA, sulla stampante di cucina, e non su
  // quella del banco: è lì che il sacchetto si chiude. È un'eccezione voluta
  // alla regola dei documenti (P-128, caso 3.7) e va scritta, altrimenti
  // qualcuno un giorno la «corregge».
  const cucinaCollegata = window.byupStampantiComande ? window.byupStampantiComande().length > 0 : false;
  const cortesiaAutomatica = (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12,
      padding: '11px 13px', borderRadius: 10,
      border: `1px solid ${PN.BORDER_SOFT}`, background: '#FAFBFC',
      cursor: cucinaCollegata ? 'pointer' : 'default', opacity: cucinaCollegata ? 1 : 0.85,
    }}>
      <input type="checkbox" data-auto-cortesia={item.id}
        checked={cucinaCollegata && cortesia} disabled={!cucinaCollegata}
        onChange={e => { setCortesia(e.target.checked); window.byupImpostaAutoPrintCortesia(item.id, e.target.checked); }}
        style={{marginTop: 3, accentColor: PN.PINK_DARK}}/>
      <span style={{minWidth: 0}}>
        <span style={{display: 'block', fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>Stampa il documento di cortesia da mettere nel sacchetto</span>
        <span style={{display: 'block', fontSize: 13, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
          {cucinaCollegata
            ? <>Esce in coda alla comanda, sulla stampante di cucina, perché è lì che il sacchetto si chiude. Spegnila se stampi già l'etichetta di {item.name}: sarebbero due fogli nello stesso sacchetto.</>
            : <>Serve una stampante di cucina collegata. Il foglio non può uscire da un browser, perché la finestra di stampa aspetta che una persona confermi e all'arrivo dell'ordine nessuno la sta guardando.</>}
        </span>
      </span>
    </label>
  );

  // La casella sta al primo passo — è la prima cosa che si vede riaprendo la
  // scheda di una piattaforma già collegata — e torna sull'esito, dove si
  // legge insieme a che cosa cambia in Byup.
  if (!fatto && passo === 1 && corpo) corpo = <React.Fragment>{corpo}{cortesiaAutomatica}</React.Fragment>;

  // L'esito, uguale per tutte: che cosa cambia in Byup, e che l'add-on è spento.
  if (fatto) {
    corpo = (
      <div>
        <div style={{padding:'12px 14px', borderRadius: 10, background:'#F0FDF4', border:`1px solid ${PN.GREEN_SOFT}`, fontSize: 14.5, color:'#065F46', lineHeight: 1.5}}>
          {item.id === 'ubereats'
            ? <>Integrazione attiva su {scelti.length} punt{scelti.length === 1 ? 'o' : 'i'} vendita. Il negozio resta <b>in pausa</b> finché non lo metti online: lo fai da qui o da Uber Eats Manager.</>
            : item.id === 'deliveroo'
              ? <>Sede collegata: <b>{INT_DELIVERY_SEDE}</b>. Il menù si pubblica da Byup; su Deliveroo lo stato si legge da Integrazioni → Controlla stato menù.</>
              : <>Punto vendita <b style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{valore}</b> collegato{menu ? ', menù in pubblicazione' : ''}.</>}
        </div>
        <div style={{fontSize: 15, color: PN.TEXT, lineHeight: 1.55, marginTop: 12}}>{item.scheda}</div>
        {cortesiaAutomatica}
      </div>
    );
    azione = <ImpButton variant="primary" style={{width:'100%', justifyContent:'center'}} onClick={onClose}>Fatto</ImpButton>;
  }

  const passoCorrente = fatto ? cfg.passi.length : passo;
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', zIndex: 120, padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 620, maxHeight: 'calc(var(--pn-vh, 100vh) * 0.92)', display:'flex', flexDirection:'column'}}>
        <div style={{...MODAL_HEAD, display:'flex', alignItems:'center', gap: 14}}>
          <span style={{width: 48, height: 48, borderRadius: 13, background: item.bg, color: item.color || '#fff', display:'grid', placeItems:'center', fontSize: item.logo.length > 1 ? 16 : 22, fontWeight: 800, flexShrink: 0}}>{item.logo}</span>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{...MODAL_TITLE, fontSize: 22, paddingRight: 40}}>Collega {item.name}</div>
            <div style={{...MODAL_SUB, marginTop: 2, paddingRight: 40}}>
              {fatto ? 'Collegamento completato' : `Passo ${passo} di ${cfg.passi.length} · ${cfg.passi[passo - 1]}`}
            </div>
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>

        {/* I passi, in fila: dove sono e quanto manca. */}
        <div style={{display:'flex', gap: 6, padding:'0 22px 4px'}}>
          {cfg.passi.map((_, i) => (
            <span key={i} style={{flex: 1, height: 4, borderRadius: 999, background: i < passoCorrente ? PN.PINK : PN.BORDER_SOFT}}/>
          ))}
        </div>

        <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto'}}>{corpo}</div>

        <div style={{...MODAL_FOOT, flexDirection:'column', gap: 8, alignItems:'stretch'}}>
          {azione}
          {/* Onesto fino in fondo: il percorso è quello vero, ma l'add-on è
              spento e i dati sono di esempio. */}
          <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.45}}>
            L'add-on delle piattaforme è spento nell'MVP: qui il collegamento è simulato con dati di esempio, e i passi sono quelli che {item.name} chiede davvero.
          </div>
        </div>
      </div>
    </div>
  );
}

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
              {credenziale ? 'La credenziale la vedi solo adesso' : 'Che cosa esce, e che cosa no'}
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

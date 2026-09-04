// Step 2 — Il tuo locale: anagrafica + P.IVA, un passo solo.
//
// Sub-step "Fiscale" rimosso: SDI/PEC sono completati nelle impostazioni
// post-onboarding. Sub-step "Pagamenti" rimosso (4 settembre 2026): Stripe si
// collega dal gestionale, in POS e integrazioni, e la campanella lo chiede
// appena si atterra. Con lui sono uscite le due schede fiscali — chi trasmette
// gli scontrini e le attivazioni con la delega — che ora vivono in
// Impostazioni → Dati fiscali, dove la seconda notifica dell'atterraggio
// porta. Motivo unico per tutte e tre: sono atti che si compiono su altri siti
// (la verifica di Stripe, la nomina sul portale, la delega con SPID), e
// metterli sulla porta d'ingresso voleva dire non far entrare nessuno. Qui il soggetto giuridico minimo è forma giuridica + P.IVA
// e — per ditta individuale e professionista — il codice fiscale del
// titolare, che NON è la P.IVA (P-86): il resto dell'anagrafica per forma
// (dati di nascita del titolare, registro imprese) sta in Impostazioni →
// Dati fiscali, che ripete la stessa enumerazione di legal_form (ERD v11).
// Sub-step "Carte e digital wallet" (Apple/Google Pay) rimosso: sono attivi via Stripe
// senza dover comunicare nulla all'utente in fase di onboarding.

function Step2Locale({
  venue, setVenue,
  onNext, onBack,
}) {
  const v = (k, val) => setVenue(prev => ({...prev, [k]: val}));

  // Un passo solo: le informazioni. La sezione «Pagamenti» non c'è più (4
  // settembre 2026) — il collegamento con Stripe passa dalla verifica
  // d'identità di Stripe, e chiederla prima di far entrare qualcuno voleva
  // dire non farlo entrare: si collega dal gestionale, da POS e integrazioni,
  // e la prima notifica dell'atterraggio lo chiede.
  const t = {title: 'Le informazioni del tuo locale.',
             sub: 'Queste informazioni verranno pubblicate e visualizzate dagli utenti dell’applicazione Byup.',
             note: 'Potrai modificarle in qualsiasi momento dalle Impostazioni.'};

  return (
    <div style={{
      minHeight: '100%',
      background: ONB.BG_SOFT,
      /* bottom 28 e non 32: compensa il padding del footer sticky */
      padding: '32px 80px 28px',
      display: 'flex', alignItems: 'flex-start',
    }}>
      {/* Stessa griglia dello step 1: promessa a sinistra, campi a destra.
          Spostare l'hero fuori dal flusso verticale libera ~140px ed è ciò che
          permette al form di stare nel canvas senza scroll. */}
      <div style={{
        width: '100%', maxWidth: 1240, margin: '0 auto',
        display: 'grid', gridTemplateColumns: STG('minmax(0, 1fr) 620px'),
        /* start, non center: il blocco di testo parte alla stessa quota della
           prima card, così le due colonne condividono la baseline superiore. */
        gap: 72, alignItems: 'start',
      }}>

        {/* ─── Colonna sinistra — contesto ────────────────────────────── */}
        <div>
          <h1 style={{
            fontSize: 40, fontWeight: 600, lineHeight: 1.15,
            letterSpacing: '-0.025em', margin: '0 0 16px', color: ONB.TEXT,
          }}>
            {t.title}
          </h1>
          <p style={{
            fontSize: 18, fontWeight: 400, lineHeight: 1.5,
            color: ONB.MUTED, margin: '0 0 20px', maxWidth: 460,
          }}>
            {t.sub}
          </p>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 15, lineHeight: 1.45, color: ONB.MUTED, maxWidth: 440,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: 999, flexShrink: 0, marginTop: 1,
              background: 'rgba(15, 17, 21, 0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: ONB.MUTED,
            }}>i</span>
            {t.note}
          </div>

          {/* Il banner "menù in elaborazione" vive qui, in flusso subito sotto
              il blocco di testo, invece che floating su un angolo del frame. */}
          <ProcessingBanner inline/>

        </div>

        {/* ─── Colonna destra — campi ─────────────────────────────────── */}
        <div>
          <SubStepInfo venue={venue} v={v}/>

          {/* Footer — 2 pulsanti, gerarchia chiara.
              Sticky: espandendo "Altri metodi" la colonna supera il canvas, e
              senza ancoraggio "Continua" finiva sotto il bordo. Resta agganciato
              al fondo mentre il contenuto scorre dietro. */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', bottom: 0, zIndex: 5,
            marginTop: 20, paddingTop: 18, paddingBottom: 4,
            borderTop: '1px solid rgba(15, 17, 21, 0.08)',
            background: ONB.BG_SOFT,
          }}>
            <SecondaryCta onClick={onBack}>
              <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
              Indietro
            </SecondaryCta>
            <PrimaryCta onClick={onNext}>
              Continua
              <OnbIcon.ArrowRight size={14} color="#fff"/>
            </PrimaryCta>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2a INFO LOCALE
// ─────────────────────────────────────────────────────────────────────────

function SubStepInfo({venue, v}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {/* Anagrafica del locale: W1 white classic standard. Era marcata "glass"
          (alias di aurora L2) in passato — riportata a default per richiesta. */}
      <OnbCard>
        <OnbSectionHeader
          title="Anagrafica del locale"
          subtitle="Forma giuridica, P.IVA e dove si trova il locale."
        />
        {/* La forma giuridica è la PRIMA domanda (P-86): decide quali dati
            fiscali esistono. Qui cambia solo il minimo — il CF del titolare
            per le persone fisiche — i campi completi per forma stanno in
            Impostazioni → Dati fiscali. */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 15, fontWeight: 600, color: ONB.TEXT, marginBottom: 9}}>
            Forma giuridica
          </div>
          <FormaGiuridicaGroup value={venue.legalForm} onChange={(x) => v('legalForm', x)}/>
          {/* Dentro la società, persone o capitali: cambia solo i dati per
              fatturazione (capitale sociale e socio unico esistono solo per
              le società di capitali), e si chiede qui per non chiederlo dopo. */}
          {venue.legalForm === 'societa' && (
            <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}>
              {[{id: 'capitali', label: 'Società di capitali (S.r.l., S.p.A.)'}, {id: 'persone', label: 'Società di persone (S.n.c., S.a.s.)'}].map(o => {
                const sel = (venue.societaTipo || 'capitali') === o.id;
                return (
                  <label key={o.id} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, cursor: 'pointer', background: sel ? ONB.BRAND_TINT : '#fff', border: `1px solid ${sel ? 'rgba(255, 90, 95, 0.35)' : 'rgba(15, 17, 21, 0.10)'}`}}>
                    <input type="radio" name="societa-tipo" checked={sel} onChange={() => v('societaTipo', o.id)} style={{margin: 0, accentColor: ONB.BRAND}}/>
                    <span style={{fontSize: 14, fontWeight: sel ? 600 : 500, color: sel ? ONB.TEXT : ONB.MUTED}}>{o.label}</span>
                  </label>
                );
              })}
            </div>
          )}
          {venue.legalForm === 'ente' && (
            <div style={{marginTop: 10, padding: '10px 13px', borderRadius: 10, background: ONB.BG, border: '1px solid rgba(15, 17, 21, 0.08)', fontSize: 14.5, color: ONB.MUTED, lineHeight: 1.5}}>
              {/* P-116 (D-103): l'ente non è più «in attesa». Ha i campi della
                  società e nessun percorso proprio: cooperative, consorzi,
                  associazioni e circoli con partita IVA. */}
              Cooperative, consorzi, associazioni e circoli con partita IVA: i dati richiesti sono quelli della società, e gli scontrini si trasmettono allo stesso modo, con le credenziali della persona che nomini incaricata sul portale.
            </div>
          )}
        </div>
        {/* Grid 12-col: composizione "indirizzo / civico / cap / città" su una sola
            riga visiva (80/20/20/40) — pattern italiano standard di un form indirizzi.
            Su 720px container abbiamo abbastanza spazio per tenerli in linea. */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16}}>
          <div style={{gridColumn: 'span 7'}}>
            <OnbField label="Nome del locale"
              value={venue.name} onChange={(x) => v('name', x)}
              placeholder="es. Cacio e Pepe"/>
          </div>
          <div style={{gridColumn: 'span 5'}}>
            <OnbField label="Partita IVA"
              value={venue.piva} onChange={(x) => v('piva', x)}
              placeholder="IT00000000000"/>
          </div>
          {/* Il CF della persona, distinto dalla P.IVA: è il dato che prima
              nasceva sbagliato. Solo per la ditta individuale. */}
          {venue.legalForm === 'ditta_individuale' && (
            <div style={{gridColumn: 'span 12'}}>
              <OnbField label="Codice fiscale del titolare"
                value={venue.titolareCf}
                onChange={(x) => v('titolareCf', x.toUpperCase())}
                placeholder="RSSMRA78C21H501X"/>
            </div>
          )}
          <div style={{gridColumn: 'span 8'}}>
            <OnbField label="Indirizzo"
              value={venue.address} onChange={(x) => v('address', x)}
              placeholder="Via dei Giubbonari"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Civico"
              value={venue.civico} onChange={(x) => v('civico', x)}
              placeholder="27"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="CAP"
              value={venue.cap} onChange={(x) => v('cap', x)}
              placeholder="00186"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Città"
              value={venue.city} onChange={(x) => v('city', x)}
              placeholder="Roma"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Telefono" type="tel"
              value={venue.phone} onChange={(x) => v('phone', x)}
              placeholder="06 1234 5678"/>
          </div>
          {/* Il capo che riceve l'invito. Senza questo campo il codice che un
              locale (o un cliente dall'app) condivide non ha dove atterrare:
              si promette un premio e non si dà modo di riscuoterlo.
              Sta qui, opzionale e in fondo, perché non deve rallentare chi
              arriva da solo. */}
          <div style={{gridColumn: 'span 8'}}>
            <OnbField label="Codice invito" optional
              value={venue.codiceInvito}
              onChange={(x) => v('codiceInvito', x.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="es. DAMARIO07"/>
          </div>
        </div>
        {/* Il regime sta dentro la stessa card e non in una sua: è un attributo
            dell'anagrafica come la P.IVA, non un capitolo a parte. Una riga di
            opzioni, senza le descrizioni che spiegavano l'IVA — chi compila il
            proprio regime lo sa già, e quel testo costava tre righe di canvas. */}
        <div style={{marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(15, 17, 21, 0.07)'}}>
          <div style={{fontSize: 15, fontWeight: 600, color: ONB.TEXT, marginBottom: 9}}>
            Seleziona regime fiscale
          </div>
          <RegimeRadioGroup value={venue.regime} onChange={(x) => v('regime', x)}/>
        </div>

        {venue.codiceInvito && venue.codiceInvito.length >= 4 && (
          <div style={{
            marginTop: 12, padding: '10px 13px', borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: 15, color: ONB.TEXT, lineHeight: 1.45,
          }}>
            Con questo codice hai <b>2 mesi gratis</b> quando attivi un abbonamento —
            e due vanno a chi te l'ha passato.
          </div>
        )}
      </OnbCard>

      {/* Gli scontrini e le attivazioni fiscali non si chiedono più qui (4
          settembre 2026): erano due atti che si compiono su un altro sito —
          la nomina dell'incaricato sul portale, la delega con SPID — e
          tenevano il locale fermo sulla porta. Ora entra, e la campanella
          glielo chiede dentro, con la notifica che porta in Dati fiscali. */}
      <StaffAppPromo/>
    </div>
  );
}
// Le attivazioni fiscali — delega all'Agenzia, conservazione,
// accreditamento come esercente — non si chiedono più qui (4 settembre
// 2026): la delega è un atto dell'esercente sul portale, con SPID, e
// tenerlo fermo sulla porta finché non l'aveva data voleva dire non farlo
// entrare. Ora la scheda vive in Impostazioni → Dati fiscali
// (AdeAttivazioniCard), dove la porta la notifica dell'atterraggio, e con
// lei ci sono il codice fiscale di Byup, i tap sul portale e il controllo.

// Regime fiscale — tre opzioni in riga, etichetta e basta. Le descrizioni
// ("IVA al 10% sui pasti…") spiegavano una cosa che chi ha un locale conosce
// già, e costavano più spazio della scelta stessa.
// Enumerazione di legal_form (ERD v11, FISC-01) ridotta a ciò che esiste nel
// nostro settore: chi somministra è un'impresa iscritta al Registro delle
// imprese, quindi ditta individuale o società (FIPE, Rapporto Ristorazione
// 2026: imprese individuali 46,5%, società 52,4%, altre forme 1,1%). Il
// professionista non c'è — partita IVA senza impresa, fatture e non
// scontrini — e l'ente (associazioni, cooperative: 0,8% dei ristoranti) è
// rimandato alla Soluzione Software, perché con il canale attuale richiede una
// configurazione dedicata del fornitore. Quel giorno rientra con le sue
// caratteristiche: persona giuridica come la società, incaricato e delega del
// rappresentante. Stessa definizione in Impostazioni → Dati fiscali.
function FormaGiuridicaGroup({value, onChange}) {
  const options = [
    {id: 'ditta_individuale', label: 'Ditta individuale'},
    {id: 'societa',           label: 'Società'},
    {id: 'ente',              label: 'Ente o cooperativa'},
  ];
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <label key={o.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
            background: selected ? ONB.BRAND_TINT : '#fff',
            border: `1px solid ${selected ? 'rgba(255, 90, 95, 0.35)' : 'rgba(15, 17, 21, 0.10)'}`,
            transition: 'background 150ms ease-out, border-color 150ms ease-out',
          }}>
            <input type="radio" name="forma-giuridica"
              checked={selected} onChange={() => onChange(o.id)}
              style={{margin: 0, accentColor: ONB.BRAND}}/>
            <span style={{
              fontSize: 15, fontWeight: selected ? 600 : 500,
              color: selected ? ONB.TEXT : ONB.MUTED, lineHeight: 1.2,
            }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function RegimeRadioGroup({value, onChange}) {
  const options = [
    {id: 'ordinario',   label: 'Ordinario'},
    {id: 'forfettario', label: 'Forfettario'},
    {id: 'agricolo',    label: 'Agricolo / Speciale'},
  ];
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <label key={o.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
            background: selected ? ONB.BRAND_TINT : '#fff',
            border: `1px solid ${selected ? 'rgba(255, 90, 95, 0.35)' : 'rgba(15, 17, 21, 0.10)'}`,
            transition: 'background 150ms ease-out, border-color 150ms ease-out',
          }}>
            <input type="radio" name="regime"
              checked={selected} onChange={() => onChange(o.id)}
              style={{margin: 0, accentColor: ONB.BRAND}}/>
            <span style={{
              fontSize: 15, fontWeight: selected ? 600 : 500,
              color: selected ? ONB.TEXT : ONB.MUTED, lineHeight: 1.2,
            }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Promo "byup Staff" — il POS mobile. Callout tinto brand e senza numero:
// non è un passo da completare come 1 e 2, è un suggerimento che l'utente può
// ignorare senza restare indietro.
// ─────────────────────────────────────────────────────────────────────────

// Palette del marchio byup Staff, presa dal logo: rosa profondo → corallo in
// diagonale, lettering crema appena rosato. Prima era rosso → arancio: un
// marchio che il logo non ha più, e nella schermata il blocco leggeva come
// un avviso invece che come byup.
// Gli stessi valori di PN.GRAD_STAFF*, scritti a mano: l'onboarding è l'unica
// pagina del gestionale che NON carica panoramica-tokens.jsx — ha un suo
// sistema (ONB) e nessun PN da cui leggere. Se il marchio cambia, cambia in
// tutti e due i posti.
const STAFF = {
  PINK:  '#E5446E',
  MID:   '#F4676F',
  CORAL: '#FF9083',
  CREAM: '#FDF3F0',
};

function StaffAppPromo() {
  // TODO: sostituire con gli URL reali delle schede store di byup Staff.
  const STORE_LINKS = {play: '#', app: '#'};

  const storeLink = {
    color: STAFF.CREAM, fontWeight: 700, textDecoration: 'underline',
    textUnderlineOffset: 2, cursor: 'pointer',
  };

  return (
    /* Palette del marchio byup Staff: lo stesso gradiente del logo, rosa
       profondo → corallo in diagonale, e lettering crema. È l'unico blocco
       pieno della schermata — è anche l'unico che non chiede di completare un
       passo, ma di portarsi via qualcosa. */
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 20px 0', borderRadius: 14,
      overflow: 'hidden',   /* la mascotte poggia sul bordo inferiore */
      background: `linear-gradient(115deg, ${STAFF.PINK} 0%, ${STAFF.MID} 52%, ${STAFF.CORAL} 100%)`,
      boxShadow: '0 12px 32px -14px rgba(229, 68, 110, 0.50)',
    }}>
      {/* Mascotte — poggia sul bordo inferiore del box (overflow:hidden la
          taglia netta a filo). Se il file manca si toglie da sola e il box
          resta impaginato, senza riquadro rotto in mezzo alla card. */}
      <img
        /* ?v=2 — il primo deploy referenziava questo file prima che esistesse:
           i client che hanno visitato allora si sono cachati il 404 (i .png
           hanno max-age 86400 in vercel.json) e continuavano a non vedere la
           mascotte. Cambiare l'URL aggira la cache negativa. */
        src="mascot-staff.png?v=2"
        alt="La mascotte di Byup Staff con l'app aperta sul telefono"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        style={{
          width: 152, alignSelf: 'flex-end', flexShrink: 0,
          marginBottom: -14,
          filter: 'drop-shadow(0 10px 20px rgba(120, 15, 45, 0.30))',
        }}
      />

      <div style={{flex: 1, minWidth: 0, paddingBottom: 18}}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: STAFF.CREAM,
          letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 6,
        }}>
          Scarica Byup Staff
        </div>
        <div style={{fontSize: 16, color: STAFF.CREAM, opacity: 0.92, lineHeight: 1.45}}>
          Il nuovo POS totalmente digitale e gratuito, utilizzabile
          su ogni dispositivo mobile.
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 15, fontWeight: 600, color: STAFF.CREAM, marginTop: 12,
        }}>
          <OnbIcon.Camera size={15} color={STAFF.CREAM}/>
          Inquadra il QR code per scaricare l’applicazione
        </div>
        <div style={{
          fontSize: 15, color: STAFF.CREAM, opacity: 0.92, lineHeight: 1.45, marginTop: 4,
        }}>
          oppure vai su <a href={STORE_LINKS.play} style={storeLink}>Play Store</a>
          {' '}o <a href={STORE_LINKS.app} style={storeLink}>App Store</a>
        </div>
      </div>

      <div style={{paddingBottom: 18, flexShrink: 0}}>
        <QrMock size={108}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// QR decorativo in SVG — moduli e finder arrotondati, trama deterministica.
// Sostituisce il repeating-conic-gradient a scacchiera: quello era una griglia
// regolare e si leggeva come una texture, non come un codice.
// Nel prototipo non c'è un URL reale da codificare, e un QR dichiaratamente
// finto è preferibile a uno scansionabile che porterebbe altrove.
// ─────────────────────────────────────────────────────────────────────────

function QrMock({size = 132}) {
  const N = 25;                          // moduli per lato
  const cell = size / N;
  const r = cell * 0.34;                 // raggio: moduli a "pillola", non quadrati
  const FG = '#17181C';

  const inFinder = (row, col) =>
    (row < 8 && col < 8) || (row < 8 && col >= N - 8) || (row >= N - 8 && col < 8);
  // Riquadro centrale lasciato libero per il logo
  const inLogo = (row, col) =>
    row >= N / 2 - 3 && row <= N / 2 + 2 && col >= N / 2 - 3 && col <= N / 2 + 2;

  // Rumore deterministico: stessa trama a ogni render, nessun Math.random
  const acceso = (row, col) => {
    const h = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
    return (h - Math.floor(h)) > 0.47;
  };

  const moduli = [];
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      if (inFinder(row, col) || inLogo(row, col) || !acceso(row, col)) continue;
      moduli.push(
        <rect key={`${row}-${col}`}
          x={col * cell + cell * 0.1} y={row * cell + cell * 0.1}
          width={cell * 0.8} height={cell * 0.8}
          rx={r} fill={FG}/>
      );
    }
  }

  const Finder = ({row, col}) => (
    <g transform={`translate(${col * cell}, ${row * cell})`}>
      <rect x={cell * 0.35} y={cell * 0.35} width={cell * 6.3} height={cell * 6.3}
        rx={cell * 2} fill="none" stroke={FG} strokeWidth={cell * 0.95}/>
      <rect x={cell * 2.1} y={cell * 2.1} width={cell * 2.8} height={cell * 2.8}
        rx={cell * 1} fill={FG}/>
    </g>
  );

  return (
    <div aria-label="QR code per scaricare Byup Staff" role="img" style={{
      width: size + 20, height: size + 20, flexShrink: 0,
      background: STAFF.CREAM,
      borderRadius: 14, padding: 10,
      boxShadow: '0 8px 20px -10px rgba(120, 20, 0, 0.45)',
      position: 'relative',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display: 'block'}}>
        {moduli}
        <Finder row={0} col={0}/>
        <Finder row={0} col={N - 7}/>
        <Finder row={N - 7} col={0}/>
      </svg>
      {/* Logo al centro, nel riquadro lasciato libero dai moduli */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.26, height: size * 0.26,
        borderRadius: size * 0.075,
        background: `linear-gradient(135deg, ${STAFF.PINK}, ${STAFF.CORAL})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `${Math.round(size * 0.028)}px solid ${STAFF.CREAM}`,
      }}>
        {/* Marchio byup in panna al centro del codice — img inline e non
            PnI.MarkWhite: questa pagina non carica panoramica-icons. */}
        <img src="Fresh-mark.png" alt="" style={{
          width: size * 0.15, height: size * 0.15, objectFit: 'contain',
          filter: 'brightness(0) invert(1)', opacity: 0.97,
          display: 'block', pointerEvents: 'none',
        }}/>
      </div>
    </div>
  );
}

window.Step2Locale = Step2Locale;

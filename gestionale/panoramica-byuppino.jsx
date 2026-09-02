// Byuppino AI — l'assistente di sala, dentro la Panoramica.
//
// Prende il posto delle Azioni rapide, ed è un cambio di natura, non di
// grafica: là c'erano otto scorciatoie decise da noi, qui si scrive quello che
// serve. Un launcher insegna otto cose e si ferma lì; una riga di testo non ha
// un elenco da imparare — e le cose che l'assistente sa fare (prenotazioni,
// menù, sala e tavoli, impostazioni di Servizio) sono già più di otto.
//
// LA REGOLA DELLA CARD. L'assistente non risponde a parole quello che ha fatto:
// lo mette in una scheda con dentro i dati che contano. Una frase in chat
// («ok, ho spostato Bianchi alle 21:30») bisogna crederla; una scheda con
// tavolo e orario scritti si verifica in un colpo d'occhio.
//
// DUE REGIMI, UNA SCHEDA (P-39 · D-32). Cambia il pulsante, non la scheda:
//   immediato — ciò che resta dentro il gestionale (sala e tavoli, impostazioni
//     di Servizio): l'assistente lo fa subito, la scheda nasce già «Fatto» e
//     si può annullare finché la finestra è aperta.
//   conferma  — ciò che esce: le prenotazioni, perché fanno partire una
//     notifica al cliente, e le modifiche al menù pubblicato, perché
//     l'annullamento non richiama ciò che è già uscito. La scheda aspetta
//     «Conferma», e dice perché aspetta.
// La partizione è di D-32 e non si reinterpreta qui. Il bollino delle altre
// pagine (byup-ai-fab.jsx) non ha una chat sua: rimanda a questo widget, e
// questa è l'unica regola che vale.

const BYU_BRAND = '#FC585D';
const BYU_VERDE = '#0F9D58';
const BYU_VERDE_BG = '#E8F6EE';

// La mascotte con cuffie e tablet — il byuppino che ASCOLTA, che è quello che
// fa questo widget.
//
// `?v=1` NON è superstizione. I .png qui escono con `max-age=86400`
// (vercel.json), e per un giorno intero il browser e la CDN tengono per buono
// quello che hanno preso la prima volta — 404 compreso. Questo nome è stato
// scritto nel codice PRIMA che il file esistesse: chi ha aperto la Panoramica
// in quella finestra si è portato a casa un 404 valido ventiquattr'ore, e da
// allora vedeva la mascotte vecchia per quanto ricaricasse. La query cambia
// l'indirizzo, e un indirizzo nuovo non ha passato da smaltire.
//
// E NIENTE RIPIEGO. C'era un onError che al posto dell'immagine mancante
// infilava il byuppino della chat AI: nato per non mostrare l'icona rotta
// mentre il file non c'era, si è trasformato in un bugiardo — l'immagine non
// arrivava e al suo posto compariva, con tutta naturalezza, la mascotte di
// prima. Un rimedio che nasconde il guasto è peggio del guasto: se il file non
// c'è, si deve vedere che non c'è.
const BYU_MASCOTTE = 'byuppino-assistente.png?v=2';

// Le animazioni vivono in un foglio e non negli stili in linea: servono
// keyframes e uno pseudo-elemento (l'anello che gira), e nessuno dei due si
// scrive in un oggetto style.
const BYU_CSS = `
/* IL GRADIENTE SI MUOVE, non cambia colore. Prima era una sola sfumatura larga
   il doppio della scheda, fatta scorrere: a schermo si vedeva una tinta sola
   per volta che virava — cioè un fondo che cambia colore, non un gradiente
   animato. Ora le tre tinte ci sono TUTTE INSIEME, ognuna in una macchia sua,
   e sono le macchie a spostarsi e respirare, ognuna con il suo tempo e il suo
   verso. Nessuna combacia con le altre: il disegno non si ripete mai uguale, e
   il movimento si vede senza che nulla lampeggi.
   Tempi lunghi e diversi fra loro (19-27s) apposta: su una dashboard che si
   guarda per ore, un moto veloce diventa la cosa che si guarda. */
@keyframes byu-macchia-1 {
  0%,100% { transform: translate(-6%, -4%) scale(1);    }
  33%     { transform: translate(12%,  6%) scale(1.22); }
  66%     { transform: translate(4%,  12%) scale(0.92); }
}
@keyframes byu-macchia-2 {
  0%,100% { transform: translate(8%,   6%) scale(1.1);  }
  40%     { transform: translate(-10%, -2%) scale(0.9); }
  70%     { transform: translate(2%,  10%) scale(1.25); }
}
@keyframes byu-macchia-3 {
  0%,100% { transform: translate(2%,   8%) scale(0.95); }
  45%     { transform: translate(14%, -8%) scale(1.2);  }
  75%     { transform: translate(-8%,  2%) scale(1.05); }
}
@keyframes byu-galla  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
/* Il fondo della scheda azione: stesso giro di tinte, in pastello. */
@keyframes byu-scheda { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
/* L'anello che corre sul bordo mentre l'azione è in corso. */
@keyframes byu-giro   { to { transform: rotate(360deg); } }
@keyframes byu-entra  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes byu-battito { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.22); opacity: 0.55; } }
@keyframes byu-punto  { 0%, 80%, 100% { opacity: 0.22; } 40% { opacity: 1; } }
/* L'annullamento non fa sparire la scheda: la fa sbiadire sul posto, così si
   vede CHE COSA si è annullato. */
@keyframes byu-sbiadisce { from { opacity: 1; } to { opacity: 0.55; } }
/* L'anello di benvenuto quando si arriva dal bollino delle altre pagine:
   due respiri di luce corallo lungo il bordo della tessera, poi niente.
   Inset e non alone esterno: la tessera ritaglia (overflow hidden) e una
   luce fuori bordo verrebbe tranciata. */
@keyframes byu-benvenuto {
  0%, 100% { box-shadow: inset 0 0 0 0 rgba(252,88,93,0); }
  16%, 58% { box-shadow: inset 0 0 0 3px rgba(252,88,93,0.9), inset 0 0 48px rgba(252,88,93,0.22); }
  36%      { box-shadow: inset 0 0 0 2px rgba(252,88,93,0.4), inset 0 0 20px rgba(252,88,93,0.1); }
}

.byu-thread::-webkit-scrollbar { width: 6px; }
.byu-thread::-webkit-scrollbar-thumb { background: rgba(15,17,21,0.14); border-radius: 999px; }
.byu-thread::-webkit-scrollbar-track { background: transparent; }

.byu-macchia { position: absolute; inset: -30%; pointer-events: none; will-change: transform; }

@media (prefers-reduced-motion: reduce) {
  .byu-macchia, .byu-scheda, .byu-anello, .byu-galleggia, .byu-benvenuto { animation: none !important; }
}
`;

// Le tre macchie del gradiente. Stanno tutte a schermo insieme — pesca in alto
// a sinistra, corallo al centro, lavanda in basso a destra — e ognuna si muove
// per conto suo.
const BYU_MACCHIE = [
  { c: 'rgba(255, 196, 150, 0.95)', pos: '22% 18%', anim: 'byu-macchia-1 21s ease-in-out infinite' },
  { c: 'rgba(255, 158, 170, 0.90)', pos: '68% 34%', anim: 'byu-macchia-2 27s ease-in-out infinite' },
  { c: 'rgba(196, 178, 255, 0.85)', pos: '44% 88%', anim: 'byu-macchia-3 19s ease-in-out infinite' },
];

// ─── Che cosa sa fare ──────────────────────────────────────────────────────
// Le stesse aree che l'assistente dichiara nel pannello grande: prenotazioni,
// menù, sala e tavoli, impostazioni di Servizio. Qui servono a due cose — a
// scegliere l'icona e il titolo della scheda, e a suggerire la FORMA di una
// richiesta dentro al campo, che è il solo modo di imparare cosa si può
// chiedere senza leggere un elenco.
const BYU_ESEMPI = [
  'Scrivi cosa vuoi fare…',
  'Es. sposta la prenotazione di Bianchi alle 21:30',
  'Es. togli la Carbonara dal menù di pranzo',
  'Es. unisci i tavoli 4 e 5',
  'Es. attiva l\'asporto',
];

// `regime` per area (P-39 · D-32): immediato = si fa subito e si annulla;
// conferma = si chiede prima, e `motivo` dice perché in una riga della scheda.
const BYU_AREE = [
  {
    prova: /preno|sposta|tavolo per|coperti|prenota/,
    icona: 'time-calendar',
    regime: 'conferma', motivo: 'Avvisa il cliente',
    componi: (t) => {
      const nome = (t.match(/(?:di|per)\s+([A-ZÀ-Ú][\wÀ-ÿ']+)/) || [])[1];
      const ora  = (t.match(/\b(\d{1,2}[:.]\d{2})\b/) || [])[1];
      const tav  = (t.match(/tavolo\s*(\d+)/i) || [])[1];
      const cop  = (t.match(/(\d+)\s*coperti/i) || [])[1];
      return {
        titolo: 'Prenotazione' + (nome ? ' ' + nome : ''),
        dettagli: [
          tav ? 'Tavolo ' + tav : (cop ? cop + ' coperti' : null),
          ora ? ora.replace('.', ':') : null,
        ].filter(Boolean),
        risposta: 'Ho preparato lo spostamento. Vuoi che parta? Il cliente riceve una notifica.',
      };
    },
  },
  {
    // Tutto il menù in conferma: la voce distingue il menù GIÀ PUBBLICATO, ma
    // il widget non sa se un menù è pubblicato o in bozza, e nei mock lo sono
    // tutti. Approssimazione dichiarata: meglio chiedere una volta di troppo
    // che far uscire una modifica che non si richiama.
    prova: /men[uù]|piatto|carbonara|aggiungi|togli|prezzo/,
    icona: 'food-meal',
    regime: 'conferma', motivo: 'Menù già pubblicato',
    componi: (t) => ({
      titolo: 'Modifica al menù',
      dettagli: [t.length > 46 ? t.slice(0, 46) + '…' : t],
      risposta: 'Ho preparato la modifica al menù. Vuoi che parta? Il menù è già pubblicato.',
    }),
  },
  {
    prova: /tavol|unisci|sala|sposta il tavolo/,
    icona: 'place-table',
    regime: 'immediato',
    componi: (t) => ({
      titolo: 'Sala aggiornata',
      dettagli: [t.length > 46 ? t.slice(0, 46) + '…' : t],
      risposta: 'Fatto in sala. Puoi annullare.',
    }),
  },
  {
    prova: /asporto|delivery|orari|impostazion|servizio|attiva|disattiva/,
    icona: 'gear',
    regime: 'immediato',
    componi: (t) => ({
      titolo: 'Impostazioni di Servizio',
      dettagli: [t.length > 46 ? t.slice(0, 46) + '…' : t],
      risposta: 'Fatto: ho cambiato l\'impostazione. Puoi annullare.',
    }),
  },
];

function byuInterpreta(testo) {
  const s = testo.toLowerCase();
  const area = BYU_AREE.find(a => a.prova.test(s));
  if (!area) {
    // Ciò che non si sa classificare non esce da solo: in conferma.
    return {
      icona: 'sparkles', regime: 'conferma', motivo: 'Te lo chiedo prima',
      titolo: 'Richiesta registrata',
      dettagli: [testo.length > 46 ? testo.slice(0, 46) + '…' : testo],
      risposta: 'Ho capito cosa vuoi. Vuoi che lo faccia?',
    };
  }
  return Object.assign({ icona: area.icona, regime: area.regime, motivo: area.motivo || null }, area.componi(testo));
}

// ─── Pezzi ─────────────────────────────────────────────────────────────────

// Qui vivevano ByuSegno (il marchio accanto alle bolle) e l'orario in coda a
// ogni messaggio. In colonna se ne vanno tutti e due: chi parla lo dicono già
// il lato e il colore della bolla — la mascotte è trenta pixel più su — e i
// minuti di una chat che vive sulla stessa schermata non decidono niente.
// Nella colonna stretta ogni etichetta in più è larghezza tolta alle parole.

// Il raggio è asimmetrico: l'angolo dal lato di chi parla resta quasi vivo. È
// la coda del fumetto senza disegnare la coda.
function ByuBolla({ da, testo }) {
  const mio = da === 'io';
  return (
    <div style={{
      display: 'flex',
      justifyContent: mio ? 'flex-end' : 'flex-start',
      animation: 'byu-entra 260ms cubic-bezier(0.34, 1.2, 0.64, 1)',
    }}>
      <div style={{
        // Nella tessera larga due colonne il testo può crescere: 16 e non
        // 14.5 — la chat è il contenuto, non una didascalia.
        maxWidth: '84%', padding: '11px 16px',
        borderRadius: mio ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
        background: mio ? BYU_BRAND : '#F4F5F7',
        color: mio ? '#fff' : PN.TEXT,
        fontSize: 16, fontWeight: 500, lineHeight: 1.45,
      }}>{testo}</div>
    </div>
  );
}

function ByuScrive() {
  return (
    <div style={{display: 'flex', alignItems: 'flex-end'}}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '12px 14px', borderRadius: '16px 16px 16px 5px', background: '#F4F5F7',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: PN.MUTED,
            animation: `byu-punto 1.1s ease-in-out ${i * 0.16}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// La scheda dell'azione. Quattro stati, e il regime decide da quale si esce
// dall'anello:
//   corso     — l'anello corre sul bordo, nessun tasto
//   pronta    — solo in regime conferma: «Annulla» e «Conferma», col motivo
//               scritto nella riga dei dettagli («Avvisa il cliente»)
//   fatta     — spunta verde. In regime immediato ci si arriva da soli e
//               resta «Annulla»; dopo una conferma non c'è più nulla da
//               premere, perché ciò che è uscito non si richiama
//   annullata — sbiadita sul posto con la pastiglia «Annullato»
function ByuAzione({ a, onFatto, onAnnulla }) {
  const corso = a.stato === 'corso';
  const annullata = a.stato === 'annullata';
  const fatta = a.stato === 'fatta';
  const immediato = a.regime === 'immediato';

  const dentro = (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: '13px 14px', borderRadius: 14,
      // Il fondo compie il giro di tinte del brand — corallo, lavanda, pesca —
      // ma in pastello: sopra ci sta del testo che deve restare nero su chiaro,
      // e un corallo pieno che passa sotto le lettere le cancellerebbe per tre
      // secondi ogni dodici.
      background: 'linear-gradient(135deg, #FFF0F0 0%, #FFF5EC 26%, #FBF1FF 52%, #FFEFF2 78%, #FFF0F0 100%)',
      backgroundSize: '320% 320%',
      animation: 'byu-scheda 12s ease-in-out infinite',
      border: '1px solid rgba(252, 88, 93, 0.16)',
    }} className="byu-scheda">
      {/* Testa: icona, titolo, e i dati su una riga loro — in colonna il
          titolo e i dettagli in fila unica si troncavano a metà orario. */}
      <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0}}>
        <span style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: 'rgba(252, 88, 93, 0.12)', color: BYU_BRAND,
        }}><Icon name={a.icona} size={24}/></span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{
            fontSize: 16.5, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{a.titolo}</div>
          <div style={{
            fontSize: 15, fontWeight: 600, color: PN.MUTED, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {corso ? 'Sto eseguendo…' : a.dettagli.join(' · ')}
            {a.stato === 'pronta' && a.motivo && (
              <span style={{color: BYU_BRAND}}> · {a.motivo}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sotto: che cosa si può ancora decidere, allineato a destra. Da
          annullata resta solo il verdetto, perché non c'è più niente da
          premere. */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0}}>
        {annullata && (
          <span style={{
            fontSize: 14.5, fontWeight: 700, color: PN.MUTED,
            background: 'rgba(15,17,21,0.06)', padding: '7px 13px', borderRadius: 999,
          }}>Annullato</span>
        )}
        {fatta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 15, fontWeight: 700, color: BYU_VERDE,
            background: BYU_VERDE_BG, padding: '7px 14px', borderRadius: 999,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="4 12.5 9.5 18 20 6"/>
            </svg>
            {immediato ? 'Fatto' : 'Confermata'}
          </span>
        )}
        {fatta && immediato && (
          /* Regime immediato: è già fatto, e l'unico gesto che resta è tornare
             indietro. Stessa pillola dell'«Annulla» del regime conferma. */
          <button type="button" onClick={onAnnulla} title="Annulla l'azione"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.06)'; }}
            style={{
              padding: '10px 18px', borderRadius: 999, border: 'none',
              background: 'rgba(15,17,21,0.06)', color: PN.TEXT,
              fontSize: 15, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'background 140ms ease',
            }}>Annulla</button>
        )}
        {a.stato === 'pronta' && (
          <React.Fragment>
            {/* Un pulsante pieno, non una pastiglia verde chiara: lì accanto c'è
                lo stesso verde chiaro che segna le azioni GIÀ confermate, e due
                cose identiche di cui una si preme e l'altra no sono un
                equivoco. E dice che cosa conferma — «Fatto» descriveva uno
                stato, non l'azione che stai per fare. */}
            {/* «Annulla» prima, «Conferma» ultima: la mano che scende
                lungo la scheda finisce sul gesto che chiude. Pillole piene,
                come nel resto del prodotto: qui il testo nudo si perdeva
                sotto la scheda colorata. */}
            <button type="button" onClick={onAnnulla} title="Annulla l'azione"
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.06)'; }}
              style={{
                padding: '10px 18px', borderRadius: 999, border: 'none',
                background: 'rgba(15,17,21,0.06)', color: PN.TEXT,
                fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 140ms ease',
              }}>Annulla</button>
            <button type="button" onClick={onFatto} title="Conferma la modifica"
              onMouseEnter={e => { e.currentTarget.style.background = '#0C8A4C'; }}
              onMouseLeave={e => { e.currentTarget.style.background = BYU_VERDE; }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 999, border: 'none',
                background: BYU_VERDE, color: '#fff',
                fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 4px 12px -5px rgba(15, 157, 88, 0.9)',
                transition: 'background 140ms ease',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="4 12.5 9.5 18 20 6"/>
              </svg>
              Conferma
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      animation: annullata
        ? 'byu-sbiadisce 320ms ease-out forwards'
        : 'byu-entra 300ms cubic-bezier(0.34, 1.2, 0.64, 1)',
    }}>
      {corso ? (
        // L'anello: un conico che gira dentro una cornice da 2 px. Sta qui e
        // non nel fondo perché sono due segnali diversi — il fondo dice «questa
        // è una scheda dell'assistente», l'anello dice «sto lavorando adesso» —
        // e devono poter finire in momenti diversi.
        <div style={{position: 'relative', padding: 2, borderRadius: 16, overflow: 'hidden'}}>
          <span aria-hidden="true" className="byu-anello" style={{
            position: 'absolute', left: '-60%', top: '-160%', width: '220%', height: '420%',
            background: 'conic-gradient(from 0deg, rgba(252,88,93,0) 0deg, rgba(252,88,93,0) 200deg, ' +
              '#FFB3B5 280deg, ' + BYU_BRAND + ' 330deg, rgba(252,88,93,0) 360deg)',
            animation: 'byu-giro 1.6s linear infinite',
          }}/>
          <div style={{position: 'relative'}}>{dentro}</div>
        </div>
      ) : dentro}
    </div>
  );
}

// ─── Il widget ─────────────────────────────────────────────────────────────

function WidgetByuppino() {
  // Il filo non parte vuoto. Un campo di testo e basta non dice che cosa si può
  // chiedere né che forma ha la risposta: lo scambio d'esempio insegna
  // entrambe le cose senza una riga di istruzioni, e le due schede seminate
  // mostrano i due regimi uno accanto all'altro — i tavoli uniti già fatti
  // con «Annulla», la prenotazione che aspetta «Conferma» perché avvisa il
  // cliente. Sono toccabili: i pulsanti fanno quello che dicono.
  const [messaggi, setMessaggi] = React.useState(() => ([
    { k: 'm0', tipo: 'bolla', da: 'ai',
      testo: 'Ciao Mario! Posso occuparmi io delle cose noiose?' },
    { k: 'm1', tipo: 'bolla', da: 'io', testo: 'Come siamo messi stasera?' },
    { k: 'm2', tipo: 'bolla', da: 'ai',
      testo: '23 prenotazioni, 6 tavoli occupati. Picco alle 20:45.' },
    { k: 'm3', tipo: 'bolla', da: 'io', testo: 'Unisci i tavoli 4 e 5' },
    { k: 'm4', tipo: 'bolla', da: 'ai', testo: 'Fatto in sala. Puoi annullare.' },
    { k: 'm5', tipo: 'azione', stato: 'fatta', regime: 'immediato',
      icona: 'place-table', titolo: 'Tavoli 4 e 5 uniti',
      dettagli: ['Sala', '8 coperti'] },
    { k: 'm6', tipo: 'bolla', da: 'io', testo: 'Sposta Bianchi alle 21:30' },
    { k: 'm7', tipo: 'bolla', da: 'ai',
      testo: 'Ho preparato lo spostamento. Vuoi che parta? Bianchi riceve una notifica.' },
    { k: 'm8', tipo: 'azione', stato: 'pronta', regime: 'conferma', motivo: 'Avvisa il cliente',
      icona: 'time-calendar', titolo: 'Prenotazione Bianchi',
      dettagli: ['Tavolo 12', '4 coperti', '21:00 → 21:30'] },
  ]));
  const [testo, setTesto] = React.useState('');
  const [scrive, setScrive] = React.useState(false);
  const [ascolta, setAscolta] = React.useState(false);
  const [esempio, setEsempio] = React.useState(0);
  const [fuoco, setFuoco] = React.useState(false);
  const [benvenuto, setBenvenuto] = React.useState(false);
  const seq = React.useRef(0);
  const filo = React.useRef(null);
  const campo = React.useRef(null);
  const orologi = React.useRef([]);

  // Arrivo dal bollino delle altre schermate (`?byuppino=1`, byup-ai-fab.jsx):
  // il campo si prende il fuoco e la tessera si accende per un paio di
  // secondi. Due segnali per due sguardi — il bordo rosa del campo dice
  // «scrivi qui» a chi è già sulla tessera, l'anello di luce dice «eccomi» a
  // chi atterra guardando altrove. Si legge una volta al montaggio: la
  // Panoramica non cambia URL da sola.
  React.useEffect(() => {
    try {
      if (!new URLSearchParams(window.location.search).has('byuppino')) return;
      if (campo.current) campo.current.focus();
      setBenvenuto(true);
      fra(2600, () => setBenvenuto(false));
    } catch (e) {}
  }, []);

  // I timer della finta esecuzione vanno spenti se il widget se ne va (basta
  // togliere la scheda dalla dashboard): altrimenti scrivono su un componente
  // che non c'è più.
  React.useEffect(() => () => orologi.current.forEach(clearTimeout), []);
  const fra = (ms, fn) => { orologi.current.push(setTimeout(fn, ms)); };

  // Gli esempi girano dentro al campo, e solo mentre è fermo e vuoto: col
  // cursore dentro, un testo che cambia da solo distrae proprio mentre stai
  // formulando la frase.
  React.useEffect(() => {
    if (fuoco || testo) return;
    const t = setInterval(() => setEsempio(i => (i + 1) % BYU_ESEMPI.length), 3600);
    return () => clearInterval(t);
  }, [fuoco, testo]);

  React.useEffect(() => {
    if (filo.current) filo.current.scrollTop = filo.current.scrollHeight;
  }, [messaggi, scrive]);

  const aggiorna = (k, cambio) => setMessaggi(m => m.map(x => x.k === k ? Object.assign({}, x, cambio) : x));

  const manda = () => {
    const t = testo.trim();
    if (!t) return;
    seq.current += 1;
    const n = seq.current;
    setMessaggi(m => m.concat({ k: 'u' + n, tipo: 'bolla', da: 'io', testo: t }));
    setTesto('');
    setAscolta(false);
    setScrive(true);

    const letta = byuInterpreta(t);
    fra(750, () => {
      setScrive(false);
      setMessaggi(m => m.concat(
        { k: 'a' + n, tipo: 'bolla', da: 'ai', testo: letta.risposta },
        { k: 'c' + n, tipo: 'azione', stato: 'corso',
          regime: letta.regime, motivo: letta.motivo,
          icona: letta.icona, titolo: letta.titolo, dettagli: letta.dettagli }
      ));
      // L'anello si ferma da solo: un'azione non può restare «in corso» per
      // sempre, e se resta ferma senza dirlo è peggio che se non fosse partita.
      // Dove finisce lo decide il regime: fatta (e annullabile) se resta
      // dentro il gestionale, pronta (in attesa di conferma) se esce.
      fra(1700, () => aggiorna('c' + n, { stato: letta.regime === 'immediato' ? 'fatta' : 'pronta' }));
    });
  };

  return (
    // IN VERTICALE: testata a gradiente sopra, conversazione sotto, campo in
    // fondo — la forma di una chat, perché è una chat. Prima era un nastro
    // orizzontale con la mascotte di fianco al filo: due colonne per un
    // dialogo che si legge dall'alto in basso.
    <div style={{
      // A filo della scheda: il widget È la scheda, come tutte le tessere del
      // bento — margini negativi contro il padding della cornice, raggio e
      // ombra glieli dà lei.
      margin: '-18px -18px -16px -18px', height: 'calc(100% + 34px)',
      display: 'flex', flexDirection: 'column', minWidth: 0,
      overflow: 'hidden', borderRadius: 14, position: 'relative',
      background: PN.WHITE,
    }}>
      <style>{BYU_CSS}</style>

      {/* L'anello di benvenuto: si accende quando si arriva dal bollino e
          respira un paio di volte prima di svanire. Sta sopra a tutto
          (la conversazione ha zIndex 2) e non si tocca: è un riflettore,
          non un contenuto. */}
      {benvenuto && (
        <span aria-hidden="true" className="byu-benvenuto" style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          borderRadius: 14,
          animation: 'byu-benvenuto 2.6s ease-out forwards',
        }}/>
      )}

      {/* ── Testata: il gradiente, sceso di tono pastello e salito di voce.
             Qui il testo è bianco, quindi le tinte sono piene — pesca che vira
             al corallo e poi alla lavanda — e le macchie animate ci girano
             sopra come luci, non come colori.
             COMPATTA: nella tessera 1×4 ogni riga di testata è una riga tolta
             alla conversazione, che è il lavoro vero del widget — la chat
             deve cominciare più in alto possibile. ── */}
      {/* IL GRADIENTE È VIVO: scorre con gli stop SPECCHIATI — pesca,
          corallo, lavanda, corallo, pesca — così a schermo le tinte ci sono
          sempre tutte insieme e il movimento si vede senza che il fondo
          «cambi colore». Il giro dura 16s, fuori fase con la scheda azione
          (12s): niente respira all'unisono. La classe byu-scheda è quella
          che prefers-reduced-motion sa già fermare.
          È LA TESTATA L'ELEMENTO FLESSIBILE della tessera (flex: 1 0 auto):
          l'aria che la chat non usa la assorbe il gradiente, non il bianco —
          il primo messaggio sta sempre subito sotto la cucitura. Quando la
          conversazione chiede spazio, la testata torna alla sua altezza
          naturale e il filo scrolla. */}
      <div className="byu-scheda" style={{
        // L'hero è un flex verticale: il blocco dei testi si centra da solo
        // nell'altezza che il gradiente si è preso, invece di restare
        // appiccicato in alto con il colore vuoto sotto.
        position: 'relative', flex: '1 0 auto', overflow: 'hidden',
        padding: '12px 20px 34px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: 'linear-gradient(120deg, #FF9159 0%, #FA4B6B 26%, #C05BD6 50%, #FA4B6B 74%, #FF9159 100%)',
        backgroundSize: '260% 260%',
        animation: 'byu-scheda 16s ease-in-out infinite',
      }}>
        {BYU_MACCHIE.map((m, i) => (
          <span key={i} aria-hidden="true" className="byu-macchia" style={{
            background: `radial-gradient(circle at ${m.pos}, rgba(255,255,255,0.30) 0%, transparent 58%)`,
            animation: m.anim,
          }}/>
        ))}

        {/* Il margine destro tiene libero il posto della mascotte, che
            nell'hero alto è cresciuta anche lei. */}
        <div style={{position: 'relative', zIndex: 1, paddingRight: 170}}>
          <div style={{
            fontSize: 13, fontWeight: 800, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
          }}>Assistente di sala</div>
          <div style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
            color: '#fff', marginTop: 4, whiteSpace: 'nowrap',
            textShadow: '0 2px 12px rgba(120, 30, 60, 0.18)',
          }}>Byuppino AI</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            marginTop: 12, padding: '6px 13px', borderRadius: 999,
            background: 'rgba(255,255,255,0.22)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.28)',
          }}>
            <span style={{width: 8, height: 8, borderRadius: '50%', background: '#7DF7B2'}}/>
            <span style={{fontSize: 13.5, fontWeight: 700, color: '#fff'}}>Online · risponde in 1s</span>
          </div>
        </div>

        {/* La mascotte abita l'angolo destro della testata e sborda un filo
            sotto la cucitura: è lei a tenere insieme i due piani. */}
        <img src={BYU_MASCOTTE} alt="Byuppino" className="byu-galleggia" style={{
          // Cresce con l'hero (il tetto è 178, non più 122) e si ritira con
          // lui quando la conversazione riprende spazio: l'altezza resta
          // agganciata alla testata, il tetto evita il gigante.
          position: 'absolute', right: 6, bottom: -10, zIndex: 1,
          height: 'calc(100% - 14px)', maxHeight: 178, width: 'auto',
          objectFit: 'contain', objectPosition: 'right bottom',
          filter: 'drop-shadow(0 10px 18px rgba(120, 30, 60, 0.35))',
          animation: 'byu-galla 5s ease-in-out infinite',
        }}/>
      </div>

      {/* ── La conversazione: il foglio bianco risale sul gradiente con la
             sua curva — è la cucitura del mock, non un bordo dritto. ── */}
      <div style={{
        // La cucitura sale (-26) e il foglio bianco è alto quanto i suoi
        // contenuti (flex: 0 1 auto): messaggi, scheda, campo e didascalia
        // chiudono sul fondo della tessera, e sopra di loro non c'è margine —
        // lo spazio che avanza è tutto del gradiente qui sopra.
        flex: '0 1 auto', minWidth: 0, minHeight: 0, position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        background: PN.WHITE, borderRadius: '22px 22px 0 0',
        marginTop: -26, padding: '14px 16px 12px',
      }}>
        {/* Il filo NON riempie a forza la scheda: è alto quanto i messaggi
            che porta, così il campo di scrittura segue l'ultima cosa detta —
            niente buco bianco tra la scheda in corso e la box del messaggio.
            Quando la conversazione cresce oltre lo spazio, si stringe al
            disponibile e si scrolla come prima. */}
        <div ref={filo} className="byu-thread pn-scroll" style={{
          flex: '0 1 auto', minHeight: 0, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 11, paddingRight: 4,
        }}>
          {messaggi.map(m => m.tipo === 'azione'
            ? <ByuAzione key={m.k} a={m}
                onFatto={() => aggiorna(m.k, { stato: 'fatta' })}
                onAnnulla={() => aggiorna(m.k, { stato: 'annullata' })}/>
            : <ByuBolla key={m.k} da={m.da} testo={m.testo}/>
          )}
          {scrive && <ByuScrive/>}
        </div>

        {/* ── Barra di scrittura — attaccata all'ultimo messaggio, non al
               fondo della scheda: 8px e basta. ── */}
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexShrink: 0}}>
          <div style={{
            flex: 1, minWidth: 0, position: 'relative',
            display: 'flex', alignItems: 'center',
            background: '#F4F5F7', borderRadius: 999,
            border: '1px solid ' + (fuoco ? 'rgba(252,88,93,0.45)' : 'transparent'),
            transition: 'border-color 160ms ease',
          }}>
            <input
              ref={campo}
              value={testo}
              onChange={e => setTesto(e.target.value)}
              onFocus={() => setFuoco(true)}
              onBlur={() => setFuoco(false)}
              onKeyDown={e => { if (e.key === 'Enter') manda(); }}
              placeholder={fuoco || testo ? 'Scrivi cosa vuoi fare…' : BYU_ESEMPI[esempio]}
              style={{
                flex: 1, minWidth: 0, padding: '12px 6px 12px 17px',
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 16, fontWeight: 500, color: PN.TEXT, fontFamily: 'inherit',
              }}/>
            {/* Il microfono sta DENTRO il campo: è un altro modo di riempire
                quella riga, non un'altra azione. In ascolto pulsa — senza, non
                si distingue da un'icona che non ha ricevuto il click. */}
            <button type="button" onClick={() => setAscolta(a => !a)}
              title={ascolta ? 'Smetti di ascoltare' : 'Detta il comando'}
              style={{
                width: 38, height: 38, marginRight: 3, borderRadius: '50%',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                background: 'transparent', border: 'none',
                color: ascolta ? BYU_BRAND : PN.MUTED, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <span style={{
                display: 'flex',
                animation: ascolta ? 'byu-battito 1.1s ease-in-out infinite' : 'none',
              }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3"/>
                  <path d="M5 11a7 7 0 0 0 14 0"/>
                  <line x1="12" y1="18" x2="12" y2="22"/>
                </svg>
              </span>
            </button>
          </div>

          {/* Pieno anche a campo vuoto: è il segno del posto dove si manda, e
              un cerchio spento accanto a un campo vuoto sembra rotto. A vuoto
              non fa niente, e non c'è niente da spiegare. */}
          <button type="button" onClick={manda} title="Invia"
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: BYU_BRAND, border: 'none', color: '#fff',
              boxShadow: '0 6px 16px -6px rgba(252, 88, 93, 0.75)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3.2 11.3 20 4.2c.7-.3 1.4.4 1.1 1.1l-7.1 16.8c-.3.7-1.3.7-1.5 0l-2.2-6.3a1 1 0 0 0-.6-.6l-6.3-2.2c-.7-.3-.7-1.3 0-1.6z"/>
            </svg>
          </button>
        </div>

        <div style={{
          fontSize: 13, fontWeight: 500, color: PN.MUTED_SOFT,
          marginTop: 7, flexShrink: 0,
        }}>
          Sala e impostazioni le cambia subito, e puoi annullare. Prenotazioni e menù: ti chiede prima.
        </div>
      </div>
    </div>
  );
}

// La griglia risolve i widget da questa mappa (panoramica-grid.jsx). Si
// estende invece di riscriverla: questo file viene dopo panoramica-widgets.jsx,
// che la crea, e sovrascriverla toglierebbe tutti gli altri.
window.PnWidgets = Object.assign(window.PnWidgets || {}, { WidgetByuppino: WidgetByuppino });
window.WidgetByuppino = WidgetByuppino;

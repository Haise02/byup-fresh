// Byuppino AI — l'assistente di sala, dentro la Panoramica.
//
// Prende il posto delle Azioni rapide, ed è un cambio di natura, non di
// grafica: là c'erano otto scorciatoie decise da noi, qui si scrive quello che
// serve. Un launcher insegna otto cose e si ferma lì; una riga di testo non ha
// un elenco da imparare — e le cose che l'assistente sa fare (prenotazioni,
// menù, sala e tavoli, impostazioni di Servizio) sono già più di otto.
//
// LA REGOLA DELLA CARD. L'assistente non risponde a parole quello che ha fatto:
// lo mette in una scheda con dentro i dati che contano e due modi di chiuderla,
// «Fatto» e «Annulla». Una frase in chat («ok, ho spostato Bianchi alle 21:30»)
// bisogna crederla; una scheda con tavolo e orario scritti si verifica in un
// colpo d'occhio. È la stessa promessa della doppia conferma che l'assistente
// fa nel pannello grande (byup-ai-fab.jsx): niente succede senza che tu lo
// veda, e finché la finestra è aperta si torna indietro.

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

.byu-thread::-webkit-scrollbar { width: 6px; }
.byu-thread::-webkit-scrollbar-thumb { background: rgba(15,17,21,0.14); border-radius: 999px; }
.byu-thread::-webkit-scrollbar-track { background: transparent; }

.byu-macchia { position: absolute; inset: -30%; pointer-events: none; will-change: transform; }

@media (prefers-reduced-motion: reduce) {
  .byu-macchia, .byu-scheda, .byu-anello, .byu-galleggia { animation: none !important; }
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

const BYU_AREE = [
  {
    prova: /preno|sposta|tavolo per|coperti|prenota/,
    icona: 'time-calendar',
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
        risposta: 'Fatto. Ho aggiornato la prenotazione: controlla e conferma.',
      };
    },
  },
  {
    prova: /men[uù]|piatto|carbonara|aggiungi|togli|prezzo/,
    icona: 'food-meal',
    componi: (t) => ({
      titolo: 'Menù aggiornato',
      dettagli: [t.length > 46 ? t.slice(0, 46) + '…' : t],
      risposta: 'Ho preparato la modifica al menù: controlla e conferma.',
    }),
  },
  {
    prova: /tavol|unisci|sala|sposta il tavolo/,
    icona: 'place-table',
    componi: (t) => ({
      titolo: 'Sala aggiornata',
      dettagli: [t.length > 46 ? t.slice(0, 46) + '…' : t],
      risposta: 'Fatto in sala: controlla e conferma.',
    }),
  },
  {
    prova: /asporto|delivery|orari|impostazion|servizio|attiva|disattiva/,
    icona: 'gear',
    componi: (t) => ({
      titolo: 'Impostazioni di Servizio',
      dettagli: [t.length > 46 ? t.slice(0, 46) + '…' : t],
      risposta: 'Ho cambiato l\'impostazione: controlla e conferma.',
    }),
  },
];

function byuInterpreta(testo) {
  const s = testo.toLowerCase();
  const area = BYU_AREE.find(a => a.prova.test(s));
  if (!area) {
    return {
      icona: 'sparkles',
      titolo: 'Richiesta registrata',
      dettagli: [testo.length > 46 ? testo.slice(0, 46) + '…' : testo],
      risposta: 'Ci penso io: controlla e conferma quando vuoi.',
    };
  }
  return Object.assign({ icona: area.icona }, area.componi(testo));
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
        maxWidth: '84%', padding: '10px 14px',
        borderRadius: mio ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
        background: mio ? BYU_BRAND : '#F4F5F7',
        color: mio ? '#fff' : PN.TEXT,
        fontSize: 14.5, fontWeight: 500, lineHeight: 1.45,
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

// La scheda dell'azione. Tre stati e tre vesti:
//   corso     — l'anello corre sul bordo, i due tasti non ci sono ancora
//   pronta    — fondo pastello che respira, «Fatto» e «Annulla»
//   fatta     — spunta verde, nessun tasto: non c'è più niente da decidere
//   annullata — sbiadita sul posto con la pastiglia «Annullato»
function ByuAzione({ a, onFatto, onAnnulla }) {
  const corso = a.stato === 'corso';
  const annullata = a.stato === 'annullata';
  const fatta = a.stato === 'fatta';

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
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: 'rgba(252, 88, 93, 0.12)', color: BYU_BRAND,
        }}><Icon name={a.icona} size={22}/></span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{a.titolo}</div>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: PN.MUTED, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {corso ? 'Sto eseguendo…' : a.dettagli.join(' · ')}
          </div>
        </div>
      </div>

      {/* Sotto: che cosa si può ancora decidere, allineato a destra. Da
          annullata resta solo il verdetto, perché non c'è più niente da
          premere. */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0}}>
        {annullata && (
          <span style={{
            fontSize: 13, fontWeight: 700, color: PN.MUTED,
            background: 'rgba(15,17,21,0.06)', padding: '6px 11px', borderRadius: 999,
          }}>Annullato</span>
        )}
        {fatta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13.5, fontWeight: 700, color: BYU_VERDE,
            background: BYU_VERDE_BG, padding: '6px 12px', borderRadius: 999,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="4 12.5 9.5 18 20 6"/>
            </svg>
            Confermata
          </span>
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
                padding: '9px 16px', borderRadius: 999, border: 'none',
                background: 'rgba(15,17,21,0.06)', color: PN.TEXT,
                fontSize: 13.5, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 140ms ease',
              }}>Annulla</button>
            <button type="button" onClick={onFatto} title="Conferma la modifica"
              onMouseEnter={e => { e.currentTarget.style.background = '#0C8A4C'; }}
              onMouseLeave={e => { e.currentTarget.style.background = BYU_VERDE; }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 999, border: 'none',
                background: BYU_VERDE, color: '#fff',
                fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em',
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
  // entrambe le cose senza una riga di istruzioni, e la scheda che ne esce è
  // già toccabile — «Fatto» e «Annulla» fanno quello che dicono.
  const [messaggi, setMessaggi] = React.useState(() => ([
    { k: 'm0', tipo: 'bolla', da: 'ai',
      testo: 'Ciao Mario! Posso occuparmi io delle cose noiose?' },
    { k: 'm1', tipo: 'bolla', da: 'io', testo: 'Come siamo messi stasera?' },
    { k: 'm2', tipo: 'bolla', da: 'ai',
      testo: '23 prenotazioni, 6 tavoli occupati. Picco alle 20:45.' },
    { k: 'm3', tipo: 'bolla', da: 'io', testo: 'Sposta Bianchi alle 21:30' },
    { k: 'm4', tipo: 'azione', stato: 'pronta',
      icona: 'time-calendar', titolo: 'Prenotazione Bianchi',
      dettagli: ['Tavolo 12', '4 coperti', '21:00 → 21:30'] },
  ]));
  const [testo, setTesto] = React.useState('');
  const [scrive, setScrive] = React.useState(false);
  const [ascolta, setAscolta] = React.useState(false);
  const [esempio, setEsempio] = React.useState(0);
  const [fuoco, setFuoco] = React.useState(false);
  const seq = React.useRef(0);
  const filo = React.useRef(null);
  const orologi = React.useRef([]);

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
          icona: letta.icona, titolo: letta.titolo, dettagli: letta.dettagli }
      ));
      // L'anello si ferma da solo: un'azione non può restare «in corso» per
      // sempre, e se resta ferma senza dirlo è peggio che se non fosse partita.
      fra(1700, () => aggiorna('c' + n, { stato: 'pronta' }));
    });
  };

  return (
    // IN VERTICALE: testata a gradiente sopra, conversazione sotto, campo in
    // fondo — la forma di una chat, perché è una chat. Prima era un nastro
    // orizzontale con la mascotte di fianco al filo: due colonne per un
    // dialogo che si legge dall'alto in basso.
    <div style={{
      height: '100%', minHeight: 0,
      display: 'flex', flexDirection: 'column', minWidth: 0,
      overflow: 'hidden', borderRadius: 18, position: 'relative',
      background: PN.WHITE,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 10px 30px -12px rgba(120, 60, 90, 0.28)',
    }}>
      <style>{BYU_CSS}</style>

      {/* ── Testata: il gradiente, sceso di tono pastello e salito di voce.
             Qui il testo è bianco, quindi le tinte sono piene — pesca che vira
             al corallo e poi alla lavanda — e le macchie animate ci girano
             sopra come luci, non come colori. ── */}
      <div style={{
        position: 'relative', flexShrink: 0, overflow: 'hidden',
        padding: '20px 22px 46px',
        background: 'linear-gradient(140deg, #FF9159 0%, #FA4B6B 52%, #C05BD6 100%)',
      }}>
        {BYU_MACCHIE.map((m, i) => (
          <span key={i} aria-hidden="true" className="byu-macchia" style={{
            background: `radial-gradient(circle at ${m.pos}, rgba(255,255,255,0.30) 0%, transparent 58%)`,
            animation: m.anim,
          }}/>
        ))}

        <div style={{position: 'relative', zIndex: 1, paddingRight: 150}}>
          <div style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
          }}>Assistente di sala</div>
          <div style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em',
            color: '#fff', marginTop: 3,
          }}>Byuppino AI</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            marginTop: 11, padding: '6px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.22)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.28)',
          }}>
            <span style={{width: 8, height: 8, borderRadius: '50%', background: '#7DF7B2'}}/>
            <span style={{fontSize: 12.5, fontWeight: 700, color: '#fff'}}>Online · risponde in 1s</span>
          </div>
        </div>

        {/* La mascotte abita l'angolo destro della testata e sborda un filo
            sotto la cucitura: è lei a tenere insieme i due piani. */}
        <img src={BYU_MASCOTTE} alt="Byuppino" className="byu-galleggia" style={{
          position: 'absolute', right: -4, bottom: -14, zIndex: 1,
          height: 'calc(100% - 4px)', maxHeight: 190, width: 'auto',
          objectFit: 'contain', objectPosition: 'right bottom',
          filter: 'drop-shadow(0 10px 18px rgba(120, 30, 60, 0.35))',
          animation: 'byu-galla 5s ease-in-out infinite',
        }}/>
      </div>

      {/* ── La conversazione: il foglio bianco risale sul gradiente con la
             sua curva — è la cucitura del mock, non un bordo dritto. ── */}
      <div style={{
        flex: 1, minWidth: 0, minHeight: 0, position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        background: PN.WHITE, borderRadius: '24px 24px 0 0',
        marginTop: -26, padding: '18px 16px 12px',
      }}>
        <div ref={filo} className="byu-thread pn-scroll" style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
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

        {/* ── Barra di scrittura ── */}
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 11, flexShrink: 0}}>
          <div style={{
            flex: 1, minWidth: 0, position: 'relative',
            display: 'flex', alignItems: 'center',
            background: '#F4F5F7', borderRadius: 999,
            border: '1px solid ' + (fuoco ? 'rgba(252,88,93,0.45)' : 'transparent'),
            transition: 'border-color 160ms ease',
          }}>
            <input
              value={testo}
              onChange={e => setTesto(e.target.value)}
              onFocus={() => setFuoco(true)}
              onBlur={() => setFuoco(false)}
              onKeyDown={e => { if (e.key === 'Enter') manda(); }}
              placeholder={fuoco || testo ? 'Scrivi cosa vuoi fare…' : BYU_ESEMPI[esempio]}
              style={{
                flex: 1, minWidth: 0, padding: '11px 6px 11px 16px',
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14.5, fontWeight: 500, color: PN.TEXT, fontFamily: 'inherit',
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
          fontSize: 11.5, fontWeight: 500, color: PN.MUTED_SOFT,
          marginTop: 7, flexShrink: 0,
        }}>
          Byuppino esegue le azioni per te — puoi sempre annullarle.
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

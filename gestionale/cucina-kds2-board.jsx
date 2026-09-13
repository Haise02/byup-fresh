// Cucina · KDS v2 — vista
//
// Board di produzione a CARTE: una carta è UN piatto fisico, non una comanda e
// non un cumulo — «2 Margherita» sono due carte identiche una sotto l'altra, e
// si tocca la carta del piatto che si ha in mano. Il destinatario («Tavolo 12»)
// è un indicatore piccolo dentro la carta: si legge, non si preme. Le regole
// delle righe stanno in `cucina-kds2-data.jsx`; qui c'è solo come si vede e
// come si tocca.
//
// ─── SISTEMA VISIVO ───────────────────────────────────────────────────────
//
//  1. TEMA CHIARO, materiali del gestionale. Canvas `PN.BG`, righe su superficie
//     bianca con il bordo `PN.BORDER`: è la coppia canvas/card di tutto il
//     prodotto, non una tavolozza inventata per questo schermo. Nessuna ombra —
//     a 2 m un'ombra è sporco, non profondità.
//
//  2. IL COLORE HA TRE COMPITI E BASTA.
//     · rosso  → soltanto allergene. Mai ritardo, mai priorità.
//     · ambra  → attesa oltre soglia.  · verde → in tempo.
//     · la rampa delle categorie sta tutta nella metà FREDDA della ruota
//       (ciano, blu, viola, fucsia, ardesia): serve a lasciare rosso, ambra e
//       verde liberi di significare qualcosa. La barra è un ancoraggio per
//       l'occhio, non una priorità — e infatti non tocca l'ordinamento.
//
//  2bis. SCALA DEI VALORI, dal più forte al più debole. Ogni gradino ha un solo
//     significato, e i due estremi sono i due soli momenti in cui lo schermo
//     alza la voce:
//       rosso pieno        → allergene (sicurezza)
//       inchiostro pieno   → la sorgente che hai appena toccato (selezione)
//       tratto grigio pieno→ porzione presa in carico
//       tratto spezzato    → porzione in attesa
//       grigio smorzato    → tutto ciò che il filtro esclude
//     L'inchiostro dentro il board dice UNA cosa sola: «questo è quello che hai
//     selezionato». Usarlo anche per marcare le porzioni non ancora partite —
//     come faceva la prima versione — dava il valore più forte dello schermo
//     allo stato meno azionabile, e svuotava di senso il marcatore della
//     selezione proprio mentre serviva.
//
//  3. IL COLORE NON È MAI L'UNICO CANALE. La priorità la porta la POSIZIONE:
//     la riga più vecchia è in cima, punto. Ambra e verde stanno sopra a un
//     numero che si legge comunque; l'allergene ha bordo, barra doppia, punto
//     esclamativo ed etichetta, cioè quattro canali di cui uno solo è tinta.
//
//     Il filtro per sorgente VINCE sul rosso. Una riga allergene che non
//     appartiene al tavolo evidenziato si smorza come tutte le altre: il rosso
//     deve dire «qui c'è un allergene da guardare ORA», e se restasse acceso
//     anche fuori selezione finirebbe per leggersi come «importante e basta»,
//     cioè la stessa confusione fra allergene e priorità che il resto del
//     sistema esiste per evitare.
//
//  4. CONTRASTO ≥ 4,5:1 SU TUTTO IL TESTO, stato smorzato compreso. Su fondo
//     chiaro il margine è molto più stretto che su fondo scuro: smorzare
//     significa schiarire, e a 4,5:1 si arriva già a un grigio medio. Per questo
//     ogni testo colorato sta su BIANCO PURO e non su una chip riempita di
//     grigio: quei due punti di luminanza in meno farebbero cadere verde e ambra
//     sotto soglia. I rapporti misurati sono annotati accanto a ogni token.
//
//  5. SCALA per una lettura a 2 m. Con il fit proporzionale della pagina, su un
//     monitor da 32" a 1080p questi corpi danno un'altezza delle maiuscole di
//     circa 10 mm, che è la regola pratica per quella distanza.

// ─── Colore ───────────────────────────────────────────────────────────────
// Dove i token PN reggono si usano (il canvas È PN.BG, l'inchiostro È PN.TEXT,
// il bordo È PN.BORDER, il rosso della riga allergene È PN.RED). Dove non
// reggono si dichiara l'alternativa e il perché, col rapporto misurato: PN è
// tarato per interfacce da scrivania, non per un testo colorato letto a due
// metri, e alcune di quelle tinte su bianco non arrivano a 4,5:1.
const K = {
  FONDO:      '#F5F6F8',   // = PN.BG — canvas del gestionale, mai bianco puro
  RIGA:       '#FFFFFF',   // = superficie card del sistema
  BORDO_RIGA: '#E5E7EB',   // = PN.BORDER

  TESTO:      '#0F1115',   // = PN.TEXT — 18,9:1 su bianco
  TESTO_2:    '#5C6372',   //  6,0:1 su bianco, 5,6:1 sul canvas — qualificatori.
                           //  PN.MUTED (#6B7280) si ferma a 4,47:1 sul canvas,
                           //  cioè sotto soglia proprio dove sta la rail.
  // Grigio di quiete. Due stati lo condividono, ed è giusto che sia lo stesso:
  // in entrambi la riga c'è ma non è roba su cui agire adesso.
  //   · comanda ordinata ma NON ancora inviata in cucina dal cameriere
  //   · tutto ciò che un filtro comanda lascia fuori
  // ⚠ 2,68:1 su bianco e 2,48:1 sul canvas: sotto il minimo di 4,5:1 che questa
  // schermata si era data. È una scelta esplicita del prodotto, non una svista.
  // Il grigio neutro più chiaro che passerebbe ovunque è #717171 (4,9:1 su
  // bianco, 4,5:1 sul canvas): basta cambiare questa riga per rientrare.
  TESTO_OFF:  '#9E9E9E',

  // PN.GREEN su bianco fa 3,3:1 e PN.AMBER 3,2:1: come inchiostro non passano
  // né l'uno né l'altro. Stesse famiglie, scese finché non tengono su OGNI
  // superficie su cui capitano — canvas, riga premuta, chip velata di
  // categoria, chip selezionata in corallo. È il fondo più chiaro fra questi
  // (la velatura viola) a fissare il limite, non il bianco.
  VERDE:      '#166534',   //  7,1:1 su bianco · 6,3:1 sulla velatura più chiara
  AMBRA:      '#C2410C',   //  5,2:1 su bianco · 4,6:1 sulla velatura più chiara

  // ─── Corallo byup ────────────────────────────────────────────────────────
  // È il colore dell'identità, e nel gestionale marca lo «stato attivo»
  // (DESIGN_DECISIONS: BRAND #FF5A5F). Qui fa esattamente quello: la sorgente
  // che stai guardando. Sostituisce l'inchiostro, che marcava la selezione ma
  // non diceva byup.
  //
  // Corallo e rosso d'allergene distano poco in tinta, ed è una tensione vera —
  // per questo non si distinguono MAI per la sola tinta: il corallo è sempre un
  // bordo con velatura chiarissima sotto, il rosso è sempre una pastiglia
  // PIENA con testo bianco e un punto esclamativo dentro. Forma e riempimento
  // separano i due segnali anche a due metri e anche in dicromia.
  BRAND:      '#FF5A5F',   // = PN.PINK — bordo della sorgente selezionata
  BRAND_BG:   '#FFF1EF',   // = PN.PINK_BG_SOFT — velatura sotto la selezione
  BRAND_INK:  '#B53338',   // = PN.WINE — 5,9:1 su bianco, per il testo su brand
  // Il filo che separa due cose entrambe posate sulla velatura corallo: il
  // grigio dei bordi normali, lì sopra, vira al verde e si vede.
  BRAND_BORDO: '#F7DAD7',

  // Rosso: solo allergene. Sta sul BORDO, sulla barra e dentro la pastiglia
  // dell'etichetta — non su tutta la superficie della riga. Una riga campita di
  // rosa larga quanto lo schermo pesa quanto il piatto stesso, e quando in
  // servizio ne compaiono tre il board diventa una bandiera: il segnale che
  // deve fermare la mano si consuma proprio perché è troppo grande.
  ROSSO:      '#DC2626',   // = PN.RED — bordo, barra, fondo della pastiglia.
                           //   Bianco sopra: 4,8:1. Contro il canvas: 4,5:1,
                           //   ben oltre il 3:1 che si chiede al non-testo.

  // Bordi delle chip. La chip è bianca su una riga bianca: il bordo NON è una
  // rifinitura, è il perimetro del bersaglio che un dito col guanto deve
  // trovare. Per questo la presa in carico — lo stato normale, quello su cui si
  // sta lavorando — ha un tratto pieno e presente, e l'attesa un tratto più
  // chiaro e spezzato.
  BORDO:      '#838C99',   //  3,4:1 su bianco — chip presa in carico, tratto pieno
  BORDO_ATTESA: '#C3C9D2', //  1,7:1 su bianco — chip in attesa, tratto spezzato
};

// ─── Tipografia ───────────────────────────────────────────────────────────
// Il dominante di ogni carta è il nome del piatto: la quantità non esiste più
// come numero — è il numero di carte.
const TY = {
  piatto:  { fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 },
  attesa:  { fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  // Dentro la chip la gerarchia è la stessa della riga: prima quanti, poi per
  // chi, poi da quando. Il tempo scende di corpo perché è l'unico dei tre che
  // non serve a produrre — serve a decidere l'ordine, che però lo dice già la
  // posizione in lista.
  chipQty: { fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  chipId:  { fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  chipOra: { fontSize: 20, fontWeight: 600, letterSpacing: 0,        lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  corpo:   { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  etich:   { fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1 },
};

// Margini di pagina stretti: su un monitor di cucina lo spazio bianco ai bordi
// non aggiunge respiro, toglie riga utile.
const PAD_X = 14;

// ─── Filtri ───────────────────────────────────────────────────────────────
// La prima voce di ogni tendina è sempre il «tutto»: è lo stato di riposo, ed è
// quello che dice al bottone di spegnersi (niente corallo, niente stato attivo).
const TUTTI_CANALI    = 'Tutti i canali';
const TUTTE_CATEGORIE = 'Tutte le categorie';
const CANALI = [TUTTI_CANALI, 'Sala', 'Asporto', 'Delivery'];
// I canali del filtro puntano al modo di consegna del modello (P-165).
const CANALE_TIPO = { 'Sala': 'al_tavolo', 'Asporto': 'asporto', 'Delivery': 'consegna' };

// Bersaglio dei pulsanti. 64 px su un tablet a parete sono circa 11 mm reali:
// sopra i 9 mm che si danno per un polpastrello col guanto, e sopra i 56 px
// che erano il minimo di partenza.
const H_BERSAGLIO = 64;

// ─── Categorie ────────────────────────────────────────────────────────────
// Ancoraggio visivo, nessuna semantica di priorità: due righe della stessa
// categoria non si attirano, e la categoria non entra nell'ordinamento.
// Ogni tinta ha il suo gemello smorzato — mescolato con il bianco della riga,
// non ottenuto con l'opacità, così anche la barra scende di contrasto insieme
// al resto senza diventare trasparente su un fondo che potrebbe cambiare.
//
// `tinta` è la velatura che la chip prende dentro quella riga: la stessa tinta
// della barra, portata a una manciata di punti di saturazione. Serve a legare
// la chip al piatto a cui appartiene — con le chip appoggiate al nome, senza
// velatura il board diventa una distesa di rettangoli bianchi tutti uguali — e
// costa zero al resto, perché non porta nessuna informazione che non sia già
// nella barra a sinistra. Chiarissima per una ragione precisa: sopra ci sta un
// testo colorato (ambra o verde) che deve restare sopra 4,5:1.
const CATEGORIE = {
  'Antipasti':  { viva: '#0E7490', smorta: '#B7D5DE', tinta: '#EEF7F9' },
  'Principali': { viva: '#6D28D9', smorta: '#D3BFF4', tinta: '#F5F1FD' },
  'Contorni':   { viva: '#475569', smorta: '#C8CCD2', tinta: '#F2F4F6' },
  'Dolci':      { viva: '#A21CAF', smorta: '#E3BBE7', tinta: '#FBF0FC' },
  'Bevande':    { viva: '#1D4ED8', smorta: '#BBCAF3', tinta: '#EFF4FE' },
};
const CATEGORIA_ALTRO = { viva: '#64748B', smorta: '#CBD0D7', tinta: '#F2F4F6' };

// Il colore dei tre gradini d'attesa, in un posto solo: lo usano il numero in
// fondo alla riga, la barra a sinistra e il tempo dentro le chip, e se vivesse
// in tre punti in due settimane sarebbero tre scale.
// Il rosso qui NON è quello dell'allergene: quello è una pastiglia PIENA col
// punto esclamativo dentro, questo è inchiostro e una barra da 6 px. Forma e
// riempimento li tengono distinti anche a due metri.
const kds2ColoreTono = t => t === 'critica' ? K.ROSSO : t === 'attesa' ? K.AMBRA : K.VERDE;
const kds2Categoria = nome => CATEGORIE[nome] || CATEGORIA_ALTRO;

// Note e allergeni arrivano scritti in minuscolo, come li digita chi prende
// l'ordine in sala. A schermo l'iniziale sale: è la regola del resto del
// prodotto, e su una riga di due parole la maiuscola è il segnale che lì
// comincia un'informazione e non la coda di quella sopra. Solo la prima
// lettera — «Senza Glutine» sarebbe inglese, non italiano.
const kds2Maiuscola = t => {
  const s = String(t || '').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

// Altezza comune a TUTTE le carte. Senza, una carta con una nota sotto il nome
// era mezza volta più alta di una senza, e la lista si leggeva a scalini: da
// due metri l'irregolarità si nota prima del contenuto, e l'occhio la scambia
// per una differenza di importanza che non c'è. È il valore che serve al caso
// più alto — nome grande più una riga di modificatore o la pastiglia
// dell'allergene — e le carte più corte lo raggiungono centrando il contenuto.
const H_CARTA = 85;

// Chi ha ridotto le animazioni di sistema non deve vedere nulla muoversi. Qui
// resta usata dall'anello dell'azione in corso e dal respiro delle schede: dove
// non si può animare, il riscontro è statico e basta.
const KDS2_MOTO_RIDOTTO = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Icone ────────────────────────────────────────────────────────────────
// Le stesse già in uso nel gestionale: `BagIcon` e `ScooterIcon` del KDS
// attuale (cucina-tab-insala.jsx). Tratto aperto a 2px, non le sagome piene
// della libreria SF — una borsa piena, a taglia piccola e a distanza, si
// chiude e si legge come un lucchetto.
// Il triangolo dell'allergene non è più qui: è diventato il punto esclamativo
// dentro la sua pastiglia, che è testo e non un disegno.
function Kds2Bag({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
}
function Kds2Scooter({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6M14 6h3l3 8M8 17l3-8h6"/></svg>);
}
// Lo scontrino: un ordine di cassa non ha un posto in sala né un nome da
// chiamare, ha un numero stampato — e l'icona mostra il pezzo di carta su cui
// sta scritto.
function Kds2Scontrino({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h14v20l-2.3-1.8L14.4 22l-2.4-1.8L9.6 22l-2.3-1.8L5 22Z"/><path d="M9 7h6M9 11h6"/></svg>);
}

// ─── Piattaforme di delivery ──────────────────────────────────────────────
// Uno scooter uguale per tutti diceva «arriva un rider» e si fermava lì. Ma i
// rider non sono intercambiabili: hanno borse diverse, tempi diversi e code
// diverse, e chi impiatta decide in che ordine mandare fuori anche in base a
// chi sta per arrivare. La piattaforma va vista, non dedotta dal nome.
//
// Le sigle e i colori vivono in PN_PARTNER (panoramica-tokens.jsx): da P-03 è
// la fonte unica condivisa con il contrassegno di Vendita diretta e la riga
// di Impostazioni → Integrazioni — se un giorno arrivano i loghi veri si
// sostituiscono LÀ, e restano una cosa sola. Un marchio disegnato a mano
// invece sarebbe un logo falso — meglio la sigla, che è vera.
const KDS2_PARTNER = window.PN_PARTNER;

function Kds2Partner({ id, size = 24, tono = 'normale' }) {
  const p = KDS2_PARTNER[id];
  if (!p) return null;
  // tre toni per tre stati della chip che lo ospita:
  //  · spento — fuori dal filtro o non ancora inviato: il marchio perde il
  //    colore come tutto il resto, o resterebbe l'unica cosa accesa proprio
  //    sulla riga che stiamo mettendo da parte;
  //  · inverso — chip selezionata, che è corallo pieno: il marchio si mette su
  //    fondo bianco, perché arancione su corallo sono due tinte che litigano
  //    invece di distinguersi;
  //  · normale — i suoi colori.
  const fondo = tono === 'spento' ? K.BORDO_RIGA : tono === 'inverso' ? K.RIGA : p.bg;
  const inchiostro = tono === 'spento' ? K.TESTO_OFF : tono === 'inverso' ? p.bg : p.ink;
  return (
    <span title={p.nome} aria-label={p.nome} style={{
      width: size, height: size, borderRadius: 7, flexShrink: 0,
      background: fondo, color: inchiostro,
      display:'grid', placeItems:'center',
      fontSize: p.sigla.length > 1 ? 11.5 : 14,
      fontWeight: 800, letterSpacing: p.sigla.length > 1 ? -0.2 : 0,
      lineHeight: 1, fontFamily:'inherit',
    }}>{p.sigla}</span>
  );
}
// verso: 1 → destra, -1 → sinistra, 0 → in giù (tendine)
function Kds2Chevron({ size = 24, verso = 1 }) {
  const giro = verso === 0 ? 'rotate(90deg)' : verso < 0 ? 'scaleX(-1)' : 'none';
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{transform: giro}}><polyline points="9 5 16 12 9 19"/></svg>);
}
// Un dito che preme, con l'onda del contatto. Non è il puntatore del mouse: qui
// si tocca uno schermo, e il glifo deve somigliare al gesto che si chiede.
function Kds2Dito({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 10.5V5a1.8 1.8 0 0 1 3.6 0v7.2"/>
      <path d="M13.6 11.4a1.7 1.7 0 0 1 3.4 0v1.1"/>
      <path d="M17 12.2a1.7 1.7 0 0 1 3.4 0v3.4a5.9 5.9 0 0 1-5.9 5.9h-2.2a5.6 5.6 0 0 1-4-1.7l-3-3a1.8 1.8 0 0 1 2.5-2.5l1.2 1.1"/>
      {/* L'onda del tocco: due archi che si aprono dal polpastrello */}
      <path d="M5.6 5.6a4.4 4.4 0 0 1 1.2-2.3" opacity="0.55"/>
      <path d="M3.2 8.4a7.4 7.4 0 0 1 2-5.2" opacity="0.35"/>
    </svg>
  );
}

// ─── L'istruzione ─────────────────────────────────────────────────────────
// Da quando ogni piatto ha il suo pulsante, il gesto ha un bersaglio disegnato
// e l'istruzione non deve più difendere un tocco invisibile: è un promemoria.
//
// STA FRA LA RAIL E LA PRIMA CARTA, su una riga sua. Nella banda in alto era
// finita in mezzo alle tendine dei filtri e al tasto dello schermo intero:
// cromo fra il cromo, che a due metri si legge come un'altra etichetta di
// comando invece che come una frase da leggere. Qui sotto è nel punto esatto in
// cui l'occhio scende dal filtro al lavoro, ed è l'ultima cosa che incontra
// prima del primo piatto da toccare — con lo stacco che le serve sopra e
// sotto, perché una riga di testo schiacciata fra due file di pastiglie non la
// legge nessuno.
function Kds2Istruzione({ compatta }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      color: K.TESTO_2, minWidth: 0,
    }}>
      <span style={{display: 'flex', flexShrink: 0}}><Kds2Dito size={compatta ? 18 : 22}/></span>
      <span style={{
        fontSize: compatta ? 14.5 : 17, fontWeight: 600, letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {/* Nella banda del gestionale lo spazio è conteso coi filtri e col
            selettore: la frase corta dice la stessa cosa senza farsi troncare
            — un'istruzione con i puntini insegna soprattutto che manca
            qualcosa. */}
        {compatta ? 'Tocca un piatto per avviarlo' : 'Tocca un piatto per avviare la preparazione'}
      </span>
    </span>
  );
}

// Schermo intero — stessa coppia di glifi della vista Banco.
function Kds2Espandi({ size = 24, chiudi = false }) {
  return chiudi
    ? (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v4a1 1 0 0 1-1 1H4"/><path d="M15 4v4a1 1 0 0 0 1 1h4"/><path d="M9 20v-4a1 1 0 0 0-1-1H4"/><path d="M15 20v-4a1 1 0 0 1 1-1h4"/></svg>)
    : (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></svg>);
}

// ─── La chip ──────────────────────────────────────────────────────────────
// UN SOLO componente, usato identico nell'header e dentro le righe: se la
// grammatica vivesse in due posti, in due settimane sarebbero due grammatiche.
//
// ORDINE FISSO, sempre: QUANTITÀ → IDENTITÀ → TEMPO.
//  · quantità — cifra nuda in testa, il corpo più grande della chip. Omessa
//    quando è 1: «1 Tavolo 3» è rumore, e in un elenco di chip una cifra in testa
//    diventa il segnale che lì ce n'è più di uno da fare. Niente prefisso '×':
//    davanti al numero non moltiplica niente, e toglierlo lascia parlare la
//    cifra, che è la cosa che si esegue.
//  · identità — «Tavolo »+numero per i tavoli, «Ordine »+numero per la cassa
//    (con lo scontrino davanti); per asporto e delivery il nome,
//    preceduto dall'icona di canale (borsa / scooter).
//  · tempo — minuti con apice per i tavoli, ORARIO DI RITIRO per asporto e
//    delivery. Sono due grandezze diverse e non si annotano: a distinguerle
//    bastano l'icona di canale e i due punti dell'orario.
//
// Quantità e identità non si confondono nemmeno quando sono due numeri vicini
// («4 Tavolo 3»): il peso le separa, e «Tavolo» sta in mezzo.
//
// DUE GUSCI, UNA GRAMMATICA. In testata la chip è un interruttore — «fammi
// vedere il tavolo 9» — e ha il peso di un pulsante: 64 px di bersaglio per un
// dito col guanto, e il bordo che lo dichiara. Dentro le carte non si tocca:
// il gesto è della carta, un tocco un piatto, e una pastiglia bordata che
// non fa niente è una promessa che il monitor non mantiene — la si prova, non
// succede nulla, e da lì in poi non ci si fida più nemmeno delle altre. Lì
// diventa un INDICATORE (`mini`): stesso ordine, ma corpi più piccoli, senza
// bordo pieno, più basso e più stretto — un dato accanto al nome, non un
// comando. Quello che cambia è il guscio, che è esattamente ciò che distingue
// un comando da un dato.
function Kds2Chip({
  source, quantity, tempo, status,
  spenta = false, selezionata = false, tinta = null,
  mostraQty = true, mostraTempo = true, mini = false,
  onTap, titolo,
}) {
  const identita = kds2Identita(source);
  // `incoming` = ordinata dal cameriere, non ancora inviata in cucina. La
  // cucina la VEDE — è la risposta a «devo sapere in anticipo cosa arriva» —
  // ma non è ancora lavoro: scritte e icone vanno tutte nel grigio di quiete,
  // tempo compreso. Un'attesa in ambra su una comanda non ancora partita
  // conterebbe minuti che non sono ancora cominciati.
  const presa = status !== 'incoming';
  const quieta = spenta || !presa;

  // La selezione RIEMPIE: corallo pieno, scritte bianche. La velatura rosa col
  // solo bordo acceso non reggeva il confronto con una fila di pastiglie
  // bianche tutte uguali — a due metri si vedeva un bordo, non uno stato.
  // Il prezzo lo paga il tempo: sul corallo pieno ambra e verde non passano
  // (2,1:1 e 2,4:1) e diventano bianchi, quindi la chip selezionata perde il
  // tono d'attesa. Perde poco: è UNA chip, quella che stai già guardando, e i
  // suoi minuti restano scritti — mentre il tono resta a colori su tutte le
  // righe del board, che è dove serve.
  const colTesto = selezionata ? K.RIGA : quieta ? K.TESTO_OFF : K.TESTO;
  const colQual  = selezionata ? 'rgba(255,255,255,0.80)' : quieta ? K.TESTO_OFF : K.TESTO_2;
  const colTempo = selezionata ? 'rgba(255,255,255,0.92)'
    : quieta ? K.TESTO_OFF
    : kds2ColoreTono(tempo.tono);

  const Canale = source.delivery_mode === 'asporto' ? Kds2Bag
    : source.delivery_mode === 'consegna' ? Kds2Scooter
    : source.delivery_mode === 'al_banco' ? Kds2Scontrino : null;

  // Il TEMPO su una chip di tavolo è un doppione: i minuti d'attesa stanno già
  // in fondo alla riga, grandi, con la loro etichetta — e ripetuti dentro ogni
  // chip diventavano una seconda fila di numeri da scartare con gli occhi. Su
  // asporto e delivery invece resta, perche li non e un'attesa ma un'ORA di
  // ritiro: quella non e scritta da nessun'altra parte.
  const conTempo = mostraTempo && (source.delivery_mode !== 'al_tavolo');

  // La taglia `mini` scala tutto insieme — corpi, icone, guscio: è la stessa
  // grammatica letta da più lontano, non una grammatica diversa.
  const misuraIcona = mini ? 17 : 24;
  const stileId  = mini
    ? { fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }
    : TY.chipId;
  const stileOra = mini
    ? { fontSize: 14.5, fontWeight: 600, letterSpacing: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }
    : TY.chipOra;

  const dentro = (
    <React.Fragment>
      {mostraQty && quantity > 1 && (
        <span style={Object.assign({}, TY.chipQty, {color: colTesto})}>{quantity}</span>
      )}
      {/* Se l'ordine arriva da una piattaforma, al posto dello scooter c'è la
          piattaforma: dice la stessa cosa — è un delivery — e in più dice
          quale, che è l'informazione che manca a chi impiatta. Lo scooter
          resta per i delivery del locale, quelli senza intermediario. */}
      {source.partner
        ? <Kds2Partner id={source.partner} size={misuraIcona}
            tono={quieta ? 'spento' : selezionata ? 'inverso' : 'normale'}/>
        : Canale && <span style={{color: colQual, display: 'flex', flexShrink: 0}}><Canale size={misuraIcona}/></span>}
      {/* Sotto l'etichetta, piccolo: «dal QR» se la sessione l'ha aperta un
          cliente, «da verificare» se ha superato un limite (P-168 · D-118).
          Un dato, non un allarme: stesso colore del testo, più leggero. */}
      {(() => {
        const seg = source.delivery_mode === 'al_tavolo' && window.byupSegnoCanale ? window.byupSegnoCanale(source.label, source) : null;
        return seg ? (
          <span style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05}}>
            <span style={Object.assign({}, stileId, {color: colTesto})}>{identita}</span>
            <span data-segno-canale={seg.livello} style={{fontSize: mini ? 9 : 10.5, fontWeight: 600, letterSpacing: 0.3, color: colTesto, opacity: seg.livello === 'verifica' ? 0.95 : 0.7, whiteSpace: 'nowrap'}}>{seg.testo}</span>
          </span>
        ) : <span style={Object.assign({}, stileId, {color: colTesto})}>{identita}</span>;
      })()}
      {conTempo && (
        <span style={Object.assign({}, stileOra, {color: colTempo})}>{tempo.testo}</span>
      )}
    </React.Fragment>
  );

  // Senza gesto è un'etichetta: si stringe. I 64 px erano la misura di un
  // bersaglio, e un bersaglio che non c'è non va occupato — quello spazio lo
  // prendono i destinatari, che su una riga con quattro tavoli è la cosa che
  // serve davvero.
  const etichetta = !onTap;

  const stile = {
    display: 'inline-flex', alignItems: 'center', gap: mini ? 6 : etichetta ? 8 : 10,
    height: mini ? 32 : etichetta ? 44 : H_BERSAGLIO,
    padding: mini ? '0 11px' : etichetta ? '0 13px' : '0 20px',
    borderRadius: mini ? 8 : etichetta ? 10 : 12,
    // Selezionata → velatura corallo. Non ancora inviata o filtrata fuori →
    // niente fondo: la chip si appiattisce sulla pagina, ed è questo che la fa
    // sparire come oggetto, non l'opacità. Altrimenti la velatura della sua
    // categoria (nulla nell'header, dove le chip non appartengono a un piatto).
    background: selezionata ? K.BRAND
      : quieta ? 'transparent'
      : (tinta || K.RIGA),
    // Presa in carico o no: la differenza è di VALORE e di TRATTO, mai di tinta
    // — un canale che sopravvive a qualunque dicromia e anche a una stampa in
    // bianco e nero, e che non cambia né la taglia né la posizione della chip.
    // In attesa il tratto è spezzato e più chiaro: RECEDE. È l'ordine giusto
    // della scala — quello su cui si sta lavorando è definito, quello che deve
    // ancora partire è provvisorio — ed è anche l'idioma che la vista Banco usa
    // già per «ordinato ma non ancora lanciato».
    //
    // Sull'etichetta il bordo pieno sparisce — è quello che diceva «premimi» —
    // ma il tratteggio dell'attesa resta: lì non sta disegnando un bordo, sta
    // dicendo «non è ancora partito», ed è l'unico posto in cui quella cosa si
    // può leggere. Trasparente e non assente, così la riga non balla di due
    // pixel quando la comanda parte.
    border: '2px '
      + (!selezionata && !presa ? 'dashed ' : 'solid ')
      + (!presa && !selezionata ? (spenta ? K.BORDO_RIGA : K.BORDO_ATTESA)
         : etichetta ? 'transparent'
         : selezionata ? K.BRAND
         : spenta ? K.BORDO_RIGA
         : K.BORDO),
    fontFamily: 'inherit', cursor: onTap ? 'pointer' : 'default',
    whiteSpace: 'nowrap', flexShrink: 0,
  };

  if (!onTap) return <span style={stile}>{dentro}</span>;

  return (
    <button type="button" onClick={onTap} aria-label={titolo} title={titolo}
      data-kds2-interattivo="" style={Object.assign({}, stile, {margin: 0})}>
      {dentro}
    </button>
  );
}

// ─── Modificatori ─────────────────────────────────────────────────────────
// Nessuna etichetta «standard» sulle righe senza modificatori: l'assenza è già
// l'informazione, e una riga su due che dice «standard» insegna a non leggere.
//
// «Aggiungi» e «togli» è la distinzione più costosa da sbagliare dopo gli
// allergeni: bacon in più e bacon in meno sono lo stesso piatto rifatto due
// volte. Il segno non è punteggiatura ma un OPERATORE — pastiglia propria,
// glifo pesante, corpo maggiore del testo che governa.
//
// IL SEGNO È PICCOLO E STA PER CONTO SUO: un «+» o un «−» nel corallo del
// brand, alto quanto la parola che governa, senza pastiglia intorno. Il
// riquadro pieno che lo conteneva pesava quanto il nome del piatto e faceva
// crescere la carta di mezza volta: un modificatore è una precisazione su un
// piatto, non un secondo titolo, e a due metri deve leggersi DOPO il nome, non
// insieme.
//
// Il terzo caso — la nota che non aggiunge e non toglie, «Al sangue», «Ben
// cotta», «Salsa a parte» — non ha un operatore da mostrare: prende il puntino
// di notifica del gestionale (`ImpPallinoNotifica`, impostazioni-shared.jsx),
// tondo e corallo, ridotto a 5 px e senza niente dentro. Dice «qui c'è una cosa
// in più da guardare» ed è esattamente ciò che una nota di cottura è.
//
// La tinta non porta la distinzione fra togliere e aggiungere: la porta il
// glifo. Rosso contro verde, che è come si distinguevano prima, è la coppia che
// circa un uomo su dodici in cucina non separa — e chiamava in causa il rosso,
// che su questa schermata significa allergene.
//
// LO SLOT DEL SEGNO È A LARGHEZZA FISSA, e serve solo a questo: «+», «−» e
// puntino sono larghi diversamente, e senza slot i copy partirebbero ognuno da
// un punto suo. Con lo slot cominciano tutti alla stessa x, carta dopo carta.
const W_SEGNO_MOD = 11;

function Kds2Modificatori({ modifiers, spenta }) {
  if (!modifiers || modifiers.length === 0) return null;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 3}}>
      {modifiers.map((m, i) => {
        const togli = m.type === 'remove';
        const metti = m.type === 'add';
        const tinta = spenta ? K.TESTO_OFF : K.BRAND;
        return (
          <span key={i} style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
            {/* Nascosto agli assistivi: il nome accessibile della riga dice già
                «senza cipolla» / «con bacon» a parole, che è più chiaro di un
                segno letto ad alta voce. */}
            <span aria-hidden="true" style={{
              width: W_SEGNO_MOD, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              color: tinta, fontSize: 17, fontWeight: 900, lineHeight: 1,
            }}>
              {togli ? '−' : metti ? '+' : (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: tinta,
                }}/>
              )}
            </span>
            {/* Il copy è inchiostro secondario, non corallo: il corallo è del
                segno, che è la parte che si riconosce di sfuggita. Dare la
                tinta anche alla parola raddoppiava il segnale e faceva
                sembrare la nota più importante del piatto. */}
            <span style={{
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2,
              color: spenta ? K.TESTO_OFF : K.TESTO_2,
            }}>{kds2Maiuscola(m.label)}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Carta ────────────────────────────────────────────────────────────────
// UNA CARTA, UN PIATTO FISICO. Prima la riga aggregava («8 Hamburger») e il
// bersaglio era la chip del destinatario, con «Avvia tutti» in coda per
// svuotare la riga intera. Con una carta per piatto non c'è più niente da
// scegliere col dito: IL BERSAGLIO È LA CARTA — un tocco, il piatto che hai
// in mano — e i due comandi di prima non hanno più ragione di esistere. Il
// destinatario resta come indicatore piccolo accanto al tempo: si legge, non
// si preme. La difesa dall'errore resta la fascia in fondo allo schermo, che
// tiene il piatto dieci secondi e lo rimette con un tocco.
function Kds2Riga({ riga, ora, spenta, evidenziata, sorgenteSelezionata, onBumpPorzione }) {
  // La porzione madre della carta: le righe di kds2Righe ne portano UNA.
  const p = riga.portions[0];
  const allergene = !!riga.allergen;
  // Rosso solo quando la carta È allergene E non è stata smorzata dal filtro:
  // la sostanza dell'allergene non cambia, ma il segnale visivo sì. Fuori
  // selezione la carta si comporta come qualunque altra carta smorzata — bordo
  // e barra tornano neutri, l'etichetta perde il fondo pieno.
  const allergeneVisibile = allergene && !spenta;
  const cat = kds2Categoria(riga.category);
  const attesaMin = kds2AttesaMin(riga.firedAt, ora);
  const tonoRiga = kds2TonoAttesa(attesaMin);

  // Nome lungo: si scende di gradino, non si tronca mai. «Insalata di mare» e
  // «Insalata di polpo» ridotte alla stessa stringa sono la ricetta sbagliata.
  const nome = riga.dishName;
  const nomeSize = nome.length <= 12 ? 32 : nome.length <= 18 ? 28 : nome.length <= 26 ? 24 : 20;

  // Carta non ancora inviata dalla sala: non è lavoro, è preavviso. Sta in
  // quiete e NON si tocca — non si avvia quello che la sala non ha mandato.
  const inArrivo = p.status === 'incoming';
  const quieta = spenta || inArrivo;
  const attivabile = !inArrivo && typeof onBumpPorzione === 'function';

  const suaSorgente = sorgenteSelezionata != null
    && kds2SorgenteId(p.source) === sorgenteSelezionata;
  const tempoChip = kds2ChipTempo(p.source, p.firedAt, p.dueAt, ora);

  const colNome  = quieta ? K.TESTO_OFF : K.TESTO;
  const colTempo = quieta ? K.TESTO_OFF : kds2ColoreTono(tonoRiga);

  // A voce, il segno «−» davanti a un modificatore si legge «meno», e la
  // barra rossa non si legge affatto: qui le eccezioni si scrivono per
  // esteso, perché è l'unico posto in cui possono passare.
  const ariaEtichetta = [
    nome,
    kds2Identita(p.source),
    riga.allergen ? riga.allergen.label : null,
  ].concat((riga.modifiers || []).map(m => (m.type === 'remove' ? 'senza ' : 'con ') + m.label))
    .filter(Boolean).join(' · ');

  return (
    <div
      // Attivabile, la carta è il pulsante: role, tastiera e title lo dicono.
      // In arrivo resta un gruppo — non c'è nessun gesto da promettere.
      role={attivabile ? 'button' : 'group'}
      tabIndex={attivabile ? 0 : undefined}
      // La carta passa SE STESSA insieme alla porzione: e' da qui che parte il
      // volo verso la fascia, e il board non ha altro modo di sapere quale
      // delle due carte gemelle e' stata toccata.
      onClick={attivabile ? (e => onBumpPorzione(p, e.currentTarget)) : undefined}
      onKeyDown={attivabile ? (e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBumpPorzione(p, e.currentTarget); }
      }) : undefined}
      data-kds2-volo={riga.id}
      title={attivabile ? ('Avvia · ' + nome + ' · ' + kds2Identita(p.source)) : undefined}
      aria-label={ariaEtichetta}
      data-kds2-interattivo=""
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'relative', display: 'flex', alignItems: 'stretch',
        // Raggio e ombra della card del gestionale: la riga è una card, e deve
        // essere la stessa card di Sala, Panoramica e Contabilità. L'ombra
        // sparisce quando la riga è premuta o smorzata — in entrambi i casi la
        // riga scende al livello della pagina, e un'ombra sotto qualcosa che
        // non è sollevato è la contraddizione che rende finto tutto il resto.
        // 13 px e non più 10: il passo verticale di una carta — la sua altezza
        // più lo stacco — cresce di circa il 3%, che è quanto basta perché due
        // carte identiche una sotto l'altra si contino a colpo d'occhio senza
        // che la lista perda righe utili.
        borderRadius: 16, overflow: 'hidden', marginBottom: 13,
        // Tutte le carte alte uguale, con o senza nota sotto il nome: vedi
        // H_CARTA. Il contenuto si centra, quindi su una carta senza note il
        // nome resta a metà altezza invece di appoggiarsi in alto.
        minHeight: H_CARTA, boxSizing: 'border-box',
        boxShadow: spenta ? 'none' : PN.CARD_SHADOW,
        // Smorzata, la riga «sprofonda» al livello della pagina: perdere la
        // superficie bianca la toglie dal piano delle card senza toccare il
        // contrasto del testo, ed è un cambiamento che si vede da due metri —
        // mentre uno scarto di grigio sul solo testo, da lontano, non si vede.
        background: spenta ? K.FONDO : K.RIGA,
        // Il bordo a inchiostro è il marcatore POSITIVO dell'evidenziazione:
        // dice «questi sono i piatti del tavolo che hai toccato». Smorzare gli
        // altri non basta a rispondere a quella domanda — indica dove NON
        // guardare, non dove guardare. Il rosso vince sul nero SOLO quando
        // l'allergene è ancora visibile (nessun filtro, o filtro che include
        // questo tavolo): filtrata fuori, la riga segue lo stesso destino di
        // una riga qualunque.
        border: '2px solid ' + (allergeneVisibile ? K.ROSSO : evidenziata ? K.TESTO : spenta ? 'transparent' : K.BORDO_RIGA),
        touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none',
        cursor: attivabile ? 'pointer' : 'default',
      }}>

      {/* Barra dell'ATTESA — 6 px. Portava la categoria del piatto, che era un
          ancoraggio e nient'altro: nessuna priorità, nessun ordinamento. Ora
          porta la stessa cosa che dice il tempo in fondo alla riga, e le due
          estremità della riga si rispondono — da lontano si legge la fascia di
          colore lungo il bordo sinistro senza mettere a fuoco un solo numero.
          Sull'allergene VISIBILE resta rossa e raddoppia: tolto il fondo
          campito, è la barra a dover reggere quel segnale, e lo fa con la
          geometria oltre che con la tinta. */}
      <span aria-hidden="true" style={{
        width: allergeneVisibile ? 10 : 6, flexShrink: 0, alignSelf: 'stretch',
        background: allergeneVisibile ? K.ROSSO
          : quieta ? K.BORDO_ATTESA
          : kds2ColoreTono(tonoRiga),
      }}/>

      {/* Cosa · per chi · da quando, tutto su una linea sola. NESSUNA CIFRA
          davanti al nome: la quantità è il numero di carte, e «2 Margherita»
          si legge scorrendo due carte uguali, non decifrando un numero. */}
      <div style={{
        flex: 1, minWidth: 0, padding: '12px 16px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{flexShrink: 0, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              {/* Il nome del piatto sta da solo: il triangolo che lo precedeva
                  è sceso dentro la pastiglia dell'allergene, qui sotto. Il
                  segnale non si è indebolito, si è raccolto — bordo, barra e
                  pastiglia dicono la stessa cosa in un punto solo dello
                  schermo, invece di due che si rincorrono su due righe. */}
              <span style={Object.assign({}, TY.piatto, {
                fontSize: nomeSize, color: colNome, whiteSpace: 'nowrap',
              })}>{nome}</span>

            </div>
            {allergene ? (
              // Solo l'etichetta, così com'è scritta sul menu. Nessun protocollo
              // a schermo: chi cucina lo conosce, e un paragrafo qui verrebbe
              // saltato proprio quando conta.
              // Visibile, il rosso pieno si concentra QUI — su poche decine di
              // centimetri quadrati invece che su tutta la riga — ed è anche il
              // modo in cui il KDS attuale segna la nota di allergene
              // (cucina-tab-insala.jsx). Filtrata fuori, la pastiglia perde il
              // fondo e diventa testo grigio: la stessa sorte di un modificatore
              // su una riga smorzata, non un trattamento speciale.
              //
              // IL PUNTO ESCLAMATIVO è quel che resta del triangolo, ed è il
              // canale non-tinta dell'allergene: un glifo di punteggiatura che
              // a due metri si legge quando il rosso non basta — o non c'è,
              // perché un filtro ha smorzato la riga. Sta attaccato alla parola
              // che qualifica, non a sei centimetri di distanza su un'altra
              // riga: «! Senza glutine» si legge in un colpo d'occhio solo.
              //
              // La pastiglia sta sulla stessa riga bassa dei modificatori e ne
              // ha la stessa statura — 20 px di altezza, copy da 15. Grande il
              // doppio, com'era, faceva due cose sbagliate insieme: alzava la
              // carta di mezza volta rispetto a tutte le altre, e metteva il
              // rosso in concorrenza col nome del piatto invece che al suo
              // servizio. Il segnale non sta nella taglia — stanno il bordo
              // della carta, la barra doppia e il fondo pieno a portarlo.
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 3,
                height: allergeneVisibile ? 20 : 'auto', padding: allergeneVisibile ? '0 8px' : 0,
                borderRadius: 6,
                background: allergeneVisibile ? K.ROSSO : 'transparent',
                color: allergeneVisibile ? K.RIGA : K.TESTO_OFF,
                fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2,
              }}>
                <span aria-hidden="true" style={{
                  fontSize: 16, fontWeight: 900, lineHeight: 1, flexShrink: 0,
                }}>!</span>
                {kds2Maiuscola(riga.allergen.label)}
              </span>
            ) : (
              <Kds2Modificatori modifiers={riga.modifiers} spenta={quieta}/>
            )}
          </div>

          <span style={{flex: 1}}/>

          {/* Il destinatario — «Tavolo 12» — è un INDICATORE, non un comando:
              taglia mini, nessun bordo che prometta un tocco, e i gesti sono
              tutti della carta. Sulla sorgente evidenziata si inverte in
              corallo, come la chip che l'ha accesa in alto: «dove sta il
              tavolo 12?» ha una risposta che si vede da lontano. */}
          <Kds2Chip
            source={p.source} quantity={1} status={p.status}
            tempo={tempoChip} mini
            selezionata={suaSorgente}
            tinta={cat.tinta}
            spenta={!allergene && sorgenteSelezionata != null && !suaSorgente}/>

          {/* Attesa della riga: quella della sua porzione più vecchia. È l'età
              della produzione, sempre in minuti — l'orario di ritiro è una
              proprietà del destinatario e vive nella sua chip.
              CIFRA E OROLOGIO, niente altro. Sotto c'erano due parole, «di
              attesa», a difendere il numero dall'equivoco col prezzo o con una
              quantità: ma l'apice dei minuti e il quadrante accanto dicono già
              che quello è un tempo, e ripeterlo a parole su ogni singola carta
              — trentotto volte a schermo — è la definizione di rumore. */}
          <div style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <span style={Object.assign({}, TY.attesa, {color: colTempo})}>{attesaMin}′</span>
            <span style={{color: colTempo, display: 'flex', flexShrink: 0}}>
              <Kds2Orologio size={21}/>
            </span>
          </div>
        </div>
      </div>

      {/* La barra che cresceva sul bordo basso se n'è andata con la pressione
          lunga: misurava un'attesa che non c'è più. Il riscontro del tocco è la
          riga che sprofonda, immediato e senza niente da aspettare. */}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────
// Orologio e recap delle sorgenti aperte. Le chip sono lo STESSO componente
// delle righe: stessa grammatica, stessa taglia, stesso bersaglio. Qui il tap
// non spegne niente, evidenzia.
//
// UNA RIGA SOLA, con carosello. Andando a capo, con venti sorgenti aperte la
// testata si mangiava un quarto dello schermo e il board scendeva a quattro
// righe: la lente secondaria toglieva spazio al lavoro. È l'unico posto della
// schermata dove si scorre in orizzontale — dentro le righe le chip vanno a
// capo, sempre, perché lì un destinatario nascosto è un piatto che non esce.
// Qui il rischio non c'è: l'ordine è per attesa decrescente, quindi ciò che
// resta fuori a destra è sempre ciò che è entrato per ultimo.
//
// Le frecce ci sono perché lo scorrimento si veda: su un monitor a parete non
// c'è un mouse che passa sopra a rivelare una barra, e nessuno prova a
// trascinare qualcosa che non sembra trascinabile.
//
// C'È SOLO LA FRECCIA CHE PORTA DA QUALCHE PARTE. Una freccia spenta è un
// bersaglio che invita e non risponde: da due metri il grigio chiaro non si
// legge come «disabilitata», si legge come «freccia», e la mano ci va.
//
// Toglierle quando non servono era però proprio ciò che aveva fatto sparire la
// schermata la prima volta: stando in fila con la rail, montarle e smontarle ne
// cambiava la larghezza, quindi il traboccamento che le aveva accese le
// spegneva, il che lo faceva tornare — «Maximum update depth exceeded», in
// cucina, nel mezzo del servizio. Il ciclo non si spezza tenendole sempre
// accese: si spezza TOGLIENDOLE DAL FLUSSO. Ora galleggiano sui due bordi della
// rail, in posizione assoluta, e la larghezza di ciò che si misura non dipende
// più da ciò che la misura decide. Coprono un pezzo della chip che sta sotto,
// ed è giusto così: l'ombra sotto la freccia dice «qui sotto continua».
const GAP_RAIL = 10;

function Kds2Rail({ children }) {
  const rif = React.useRef(null);
  const [stato, setStato] = React.useState({ inizio: true, fine: true });

  // Con le frecce sempre montate la larghezza della rail non cambia mai per
  // effetto di ciò che questa misura decide, quindi si può leggere direttamente
  // dalla rail senza rischio di rientri.
  const misura = React.useCallback(() => {
    const el = rif.current;
    if (!el) return;
    const scorribile = el.scrollWidth - el.clientWidth;
    const inizio = scorribile <= 1 || el.scrollLeft <= 1;
    const fine   = scorribile <= 1 || el.scrollLeft >= scorribile - 1;
    // Si torna lo stato precedente quando nulla è cambiato: senza, ogni misura
    // creerebbe un oggetto nuovo, React rirenderizzerebbe, e la misura
    // ripartirebbe all'infinito.
    setStato(p => (p.inizio === inizio && p.fine === fine)
      ? p : { inizio, fine });
  }, []);

  // Si misura quando cambia il NUMERO di sorgenti — l'unica cosa che sposta la
  // larghezza del contenuto — e mai «dopo ogni render». Misurare a ogni render
  // significa render → misura → stato → render: anche con la scappatoia che
  // salta l'aggiornamento a valori uguali, basta un arrotondamento sub-pixel
  // (qui c'è uno `zoom` sul frame) perché due letture consecutive differiscano
  // di uno e il giro non si chiuda più. È così che la schermata spariva
  // cambiando filtro.
  const nSorgenti = React.Children.count(children);
  React.useEffect(() => { misura(); }, [misura, nSorgenti]);

  React.useEffect(() => {
    const el = rif.current;
    if (!el) return;
    // Una misura per fotogramma, non una per callback. Quando lo schermo cambia
    // taglia davvero — rotazione del monitor, passaggio a schermo intero —
    // scroll, ResizeObserver e resize sparano insieme decine di volte, e
    // misurare a ogni colpo significa rirenderizzare a ogni colpo mentre il
    // layout è ancora in movimento. Con il raF la raffica collassa in una
    // misura sola, presa a layout ormai fermo.
    let atteso = 0;
    const chiedi = () => {
      if (atteso) return;
      atteso = requestAnimationFrame(() => { atteso = 0; misura(); });
    };
    el.addEventListener('scroll', chiedi, { passive: true });
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(chiedi) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', chiedi);
    return () => {
      if (atteso) cancelAnimationFrame(atteso);
      el.removeEventListener('scroll', chiedi);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', chiedi);
    };
  }, [misura]);

  function scorri(verso) {
    const el = rif.current;
    if (!el) return;
    el.scrollBy({
      left: verso * el.clientWidth * 0.8,
      behavior: KDS2_MOTO_RIDOTTO ? 'auto' : 'smooth',
    });
  }

  // Fuori dal flusso: la freccia si posa SOPRA il bordo della rail, non accanto.
  // È la sola forma in cui può andare e venire senza spostare di un pixel ciò
  // che la fa comparire.
  const freccia = (verso) => (
    <button type="button" data-kds2-interattivo=""
      onClick={() => scorri(verso)}
      aria-label={verso < 0 ? 'Sorgenti precedenti' : 'Altre sorgenti'}
      title={verso < 0 ? 'Sorgenti precedenti' : 'Altre sorgenti'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        left:  verso < 0 ? 0 : 'auto',
        right: verso < 0 ? 'auto' : 0,
        zIndex: 5,
        width: 56, height: H_BERSAGLIO, borderRadius: 12,
        display: 'grid', placeItems: 'center',
        background: K.RIGA, border: '2px solid ' + K.BORDO, color: K.TESTO,
        // L'ombra della card del gestionale: dice che la freccia sta SOPRA la
        // fila, e che la chip che sparisce sotto non è finita, è coperta.
        boxShadow: PN.CARD_SHADOW_HOVER,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
      <Kds2Chevron size={28} verso={verso}/>
    </button>
  );

  return (
    <div style={{position: 'relative'}}>
      <div ref={rif} className="kds2-rail" data-kds2-interattivo="" style={{
        display: 'flex', flexWrap: 'nowrap', gap: GAP_RAIL,
        overflowX: 'auto', overflowY: 'hidden',
      }}>
        {children}
      </div>
      {!stato.inizio && freccia(-1)}
      {!stato.fine   && freccia(1)}
    </div>
  );
}

// ─── Tutti ────────────────────────────────────────────────────────────────
// Prima chip della fila, e la sola che c'è sempre. Evidenziare una sorgente si
// disfaceva solo ritoccando la stessa chip — un gesto che bisogna sapere — o
// aspettando che l'evidenza scadesse da sé. Ora c'è il posto dove si torna, ed
// è dove la mano arriva per prima: in testa, prima di tutti i tavoli.
// Sta DENTRO la rail e non prima: è una scelta come le altre, e la fila deve
// leggersi come un elenco unico di stati fra cui uno solo è acceso.
// `totale`: quanti piatti ci sono in tutto in preparazione. Le altre chip
// portano la quantità della loro sorgente, questa porta la somma — così la fila
// si legge da sinistra come «in tutto ventiquattro, di cui otto al Tavolo 3».
function Kds2Tutti({ selezionata, totale, onTap }) {
  return (
    <button type="button" data-kds2-interattivo="" onClick={onTap}
      aria-label={'Mostra tutte le sorgenti · ' + totale + ' piatti in preparazione'}
      title="Mostra tutto"
      style={Object.assign({}, TY.chipId, {
        display: 'inline-flex', alignItems: 'center', gap: 12,
        height: H_BERSAGLIO, padding: '0 14px 0 22px', borderRadius: 12, flexShrink: 0,
        background: selezionata ? K.BRAND : 'transparent',
        border: '2px solid ' + (selezionata ? K.BRAND : K.BORDO),
        color: selezionata ? K.RIGA : K.TESTO,
        letterSpacing: '0.04em',
        fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
      })}>
      TUTTI
      <span style={{
        display: 'grid', placeItems: 'center', flexShrink: 0,
        minWidth: 38, height: 38, padding: '0 9px', borderRadius: 999,
        background: selezionata ? K.RIGA : K.BRAND_BG,
        color: selezionata ? K.BRAND_INK : K.BRAND_INK,
        fontSize: 20, fontWeight: 800, letterSpacing: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>{totale}</span>
    </button>
  );
}

// ─── Filtro a tendina ─────────────────────────────────────────────────────
// Stesso pattern del selettore condiviso della Sala (`SaSelect`): bottone,
// popover ancorato, voce attiva in rosa del brand. Non lo si riusa tale e quale
// perché è tarato per la scrivania — 9 px di padding e voci da 34 px, che col
// guanto non si centrano — quindi qui la stessa forma sta su bersagli da 64.
function Kds2Filtro({ etichetta, valore, opzioni, onScegli }) {
  const [aperto, setAperto] = React.useState(false);
  const attivo = valore !== opzioni[0];

  React.useEffect(() => {
    if (!aperto) return;
    const chiudi = () => setAperto(false);
    window.addEventListener('pointerdown', chiudi);
    return () => window.removeEventListener('pointerdown', chiudi);
  }, [aperto]);

  return (
    <div style={{position: 'relative', flexShrink: 0}}
      onPointerDown={e => e.stopPropagation()}>
      {/* A RIPOSO non è un pulsante: è un'etichetta. Niente bordo, niente
          fondo, testo quieto — pesa quanto una didascalia. Il bersaglio resta
          da 64 px, ma è tutto imbottitura invisibile: la mano col guanto lo
          trova lo stesso, l'occhio no. Per un servizio intero questi due
          controlli stanno sul loro valore di default, e un pulsante pieno
          pagherebbe pedaggio permanente per un'azione rara.
          ATTIVO diventa la pastiglia corallo. Non è vezzo: con un filtro acceso
          il board mostra un PEZZO del servizio, e non accorgersene significa
          non vedere piatti che esistono. Lì il peso visivo serve tutto. */}
      <button type="button" data-kds2-interattivo=""
        onClick={() => setAperto(a => !a)}
        aria-label={etichetta + ': ' + valore}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: H_BERSAGLIO, padding: attivo ? '0 18px' : '0 10px',
          borderRadius: 12,
          background: attivo ? K.BRAND_BG : 'transparent',
          border: '2px solid ' + (attivo ? K.BRAND : 'transparent'),
          fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
        <span style={{
          fontSize: attivo ? 20 : 18, fontWeight: attivo ? 700 : 600,
          letterSpacing: '-0.01em',
          color: attivo ? K.BRAND_INK : K.TESTO_2,
        }}>{valore}</span>
        <span style={{color: attivo ? K.BRAND_INK : K.TESTO_OFF, display: 'flex'}}>
          <Kds2Chevron size={16} verso={0}/>
        </span>
      </button>

      {aperto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 80,
          minWidth: '100%', padding: 6, borderRadius: 14,
          background: K.RIGA, border: '1px solid ' + K.BORDO_RIGA,
          boxShadow: PN.CARD_SHADOW_HOVER,
        }}>
          {/* La parola «Canali» esce dal pulsante e rientra qui: serve nel
              momento in cui si sceglie, non per tutto il resto del servizio. */}
          <span style={Object.assign({}, TY.etich, {
            color: K.TESTO_2, display: 'block', padding: '10px 16px 8px',
          })}>{etichetta.toUpperCase()}</span>
          {opzioni.map(o => (
            <button key={o} type="button" data-kds2-interattivo=""
              onClick={() => { onScegli(o); setAperto(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                height: 56, padding: '0 16px', borderRadius: 10, border: 'none',
                background: o === valore ? K.BRAND_BG : 'transparent',
                color: o === valore ? K.BRAND_INK : K.TESTO,
                fontSize: 20, fontWeight: o === valore ? 700 : 600,
                fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// `onToggle` / `attivo`: dentro il gestionale «schermo intero» vuol dire prima
// di tutto togliere di mezzo il gestionale — sidebar compresa — come già fa la
// vista Ristorante. Chi monta la board glielo dice passando questi due; da sola,
// nella route di anteprima, resta il fullscreen del browser.
function Kds2Fullscreen({ onToggle, attivo }) {
  const [pieno, setPieno] = React.useState(false);
  React.useEffect(() => {
    const agg = () => setPieno(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', agg);
    return () => document.removeEventListener('fullscreenchange', agg);
  }, []);
  const acceso = onToggle ? !!attivo : pieno;
  function commuta() {
    if (onToggle) { onToggle(); return; }
    // In anteprima dentro un iframe l'API è spesso negata: si ignora, il resto
    // della schermata non deve accorgersene.
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch (e) {}
  }
  return (
    <button type="button" data-kds2-interattivo="" onClick={commuta}
      aria-label={acceso ? 'Esci da schermo intero' : 'Schermo intero'}
      title={acceso ? 'Esci da schermo intero' : 'Schermo intero'}
      style={{
        width: H_BERSAGLIO, height: H_BERSAGLIO, flexShrink: 0, borderRadius: 12,
        display: 'grid', placeItems: 'center',
        background: K.RIGA, border: '2px solid ' + K.BORDO_RIGA,
        color: K.TESTO_2, cursor: 'pointer', fontFamily: 'inherit',
      }}>
      <Kds2Espandi size={24} chiudi={acceso}/>
    </button>
  );
}

function Kds2Header({
  sorgenti, totale, ora, selezione, onSeleziona, focus, onToggleFocus, barra,
  canale, onCanale, canali, categoria, onCategoria, categorie,
  mandati, onMandati,
}) {
  const orologio = kds2Orario(ora);
  // `barra`: dentro il gestionale la prima banda arriva da fuori, fatta con i
  // comandi della vista Ristorante — stessi filtri, stesso tasto schermo
  // intero, stesse misure. Due cucine dello stesso prodotto non possono avere
  // due grammatiche. Da sola, in anteprima, la board tiene la sua.
  return (
    <div style={{flexShrink: 0, background: barra ? 'transparent' : K.FONDO,
      padding: barra ? 0 : '16px ' + PAD_X + 'px 12px'}}>

      {barra ? barra({ ora, canale, onCanale, canali, categoria, onCategoria, categorie,
                       mandati, onMandati })
        : (
      /* Prima banda: cromo. Orologio, filtri, allarme, schermo intero — niente
         che si tocchi per cucinare, tutto ciò che serve a decidere COSA si
         guarda. Sta sopra la rail perché la rail è già contenuto. */
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12}}>
        <span style={{
          fontSize: 34, fontWeight: 800, color: K.TESTO, letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums', flexShrink: 0, paddingRight: 6,
        }}>{orologio}</span>

        <Kds2Filtro etichetta="Canali" valore={canale} opzioni={canali} onScegli={onCanale}/>
        <Kds2Filtro etichetta="Categorie" valore={categoria} opzioni={categorie} onScegli={onCategoria}/>

        <span style={{flex: 1}}/>

        <button type="button" data-kds2-interattivo="" onClick={onMandati}
          title="Ordini pronti"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9, flexShrink: 0,
            height: H_BERSAGLIO, padding: '0 18px', borderRadius: 12,
            background: K.RIGA, border: '2px solid ' + K.BORDO_RIGA,
            color: K.TESTO, fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em',
            fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
          Ordini pronti
          {mandati > 0 && (
            <span style={{
              minWidth: 30, height: 30, padding: '0 8px', borderRadius: 999,
              display: 'grid', placeItems: 'center',
              background: K.FONDO, color: K.TESTO_2,
              fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
            }}>{mandati}</span>
          )}
        </button>

        <Kds2Fullscreen onToggle={onToggleFocus} attivo={focus}/>
      </div>
      )}

      {sorgenti.length === 0 ? (
        <span style={Object.assign({}, TY.corpo, {color: K.TESTO_2, display: 'block', padding: '18px 4px'})}>
          Nessun ordine aperto
        </span>
      ) : (
        <>
        <Kds2Rail>
          <Kds2Tutti selezionata={selezione == null} totale={totale} onTap={() => onSeleziona(null)}/>
          {sorgenti.map(s => {
            const sel = selezione === s.id;
            return (
              // Quassù la chip porta SOLO il nome del destinatario. È un
              // interruttore — «fammi vedere il tavolo 9» — non un dato da
              // leggere: quante porzioni e da quanto aspettano sono scritti
              // nelle righe, dove si lavora. Con quantità e minuti addosso la
              // fila diventava una seconda tabella sopra alla tabella, e per
              // trovare un tavolo bisognava leggerla tutta invece di
              // riconoscerne il nome.
              <Kds2Chip key={s.id}
                source={s.source} quantity={s.quantity} status={s.status}
                tempo={kds2ChipTempo(s.source, s.firedAt, s.dueAt, ora)}
                mostraQty={false} mostraTempo={false}
                selezionata={sel}
                spenta={selezione != null && !sel}
                onTap={() => onSeleziona(sel ? null : s.id)}
                titolo={(sel ? 'Togli evidenza · ' : 'Evidenzia · ') + kds2Identita(s.source)}/>
            );
          })}
        </Kds2Rail>
        {/* Lo stacco è asimmetrico di proposito: 24 sopra e 22 sotto — contando
            i 12 di fondo che la banda ha già quando la board sta per conto suo —
            danno la stessa aria da entrambi i lati sia qui dentro sia dentro la
            card della Cucina, dove la banda arriva da fuori e non ha padding.
            È più aria di quanta ne serva a una riga di testo, ed è voluto: la
            frase deve staccarsi dalla fila di pastiglie sopra e dalla prima
            carta sotto, o torna a essere una terza fila di cose da scorrere.
            Compatta nel gestionale, dove tutto il cromo intorno è più piccolo. */}
        <div style={{paddingTop: 24, paddingBottom: barra ? 22 : 10}}>
          <Kds2Istruzione compatta={!!barra}/>
        </div>
        </>
      )}
    </div>
  );
}

// ─── Annulla ──────────────────────────────────────────────────────────────
// Questa fascia NON dice cosa è pronto. Dirlo sarebbe informazione morta: in
// cucina il piatto pronto è quello che hai in mano, non quello che leggi. Dice
// una cosa sola, ed è un'azione: «hai appena spento questo, hai dieci secondi
// per rimetterlo».
//
// Prima la reversibilità c'era ma era muta — pastiglie toccabili senza niente
// che annunciasse cosa succede toccandole. In cucina, con le mani sporche e
// dieci secondi di finestra, una funzione che non si annuncia non esiste.
//
// UNA SCHEDA PER PIATTO, tutte uguali. C'era una CTA scura che nominava il
// proprio bersaglio — «Annulla · 1 Hamburger · Tavolo 12» — e dietro le voci
// precedenti come pastiglie secondarie: una sola cosa per volta poteva essere
// «il prossimo tocco ovvio». Ora le schede si equivalgono, perché ognuna porta
// il proprio tempo e il tempo è la ragione per cui la si tocca: la più urgente
// non è l'ultima che hai premuto, è quella col numero più basso.
//
// L'ORDINE resta invertito: il più recente a SINISTRA. Le voci si accumulavano
// verso destra, così l'ultima azione — quella che si vuole annullare nel 90%
// dei casi — finiva in fondo alla fila e, con abbastanza voci, fuori schermo.
// Un annullamento che scorre via è un annullamento che non c'è.
//
// Il fondo è la velatura corallo del brand e non più il vetro: sotto passano
// righe bianche, e il vetro le lasciava intravedere sfocate proprio sotto ai
// numeri. La velatura stacca la fascia dal board senza spegnerlo, e le schede
// bianche tornano a essere l'unica cosa che si legge.
//
// Ogni voce vive dieci secondi, E IL CONTO ALLA ROVESCIA SI VEDE — `00:07`,
// come su un forno. Prima era nascosto di proposito: cinque timer che scorrono
// sono cinque cose che si muovono in una schermata dove ciò che conta è fermo.
// Ma quel ragionamento difendeva la quiete del board e lasciava scoperta la
// domanda vera: chi ha appena premuto non sa quanto tempo ha per tornare
// indietro, e senza saperlo non prova nemmeno. Il moto resta confinato qui, e
// solo mentre c'è una decisione aperta. La scritta a sinistra dice che cosa
// succede quando il tempo finisce, perché un conto alla rovescia senza
// conseguenza dichiarata fa più paura di quanta ne meriti.
function Kds2Undo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h11a5.5 5.5 0 0 1 0 11h-5"/>
      <polyline points="8 5 4 9 8 13"/>
    </svg>
  );
}

// ─── Ordini pronti ────────────────────────────────────────────────────────
// Quello che la cucina ha MANDATO. Non dice che sia arrivato al tavolo: il
// monitor sa che il piatto è finito, non che qualcuno l'ha portato (P-196 ·
// D-156), e il nome di prima — «Ordini consegnati» — dichiarava una cosa che
// da qui non si può sapere.
// Non è il board — non ci si lavora — ed è per questo
// che vive in un pannello e non in una colonna: si apre quando serve rispondere
// a una domanda sola, «questo l'ho già mandato?», e si chiude.
// UNA COSA però si può fare: RIPRISTINARE. Il piatto caduto, quello contestato,
// quello dato per uscito per sbaglio — si tocca la voce e si conferma. La
// conferma non è burocrazia: da qui si rimette un piatto IN PRODUZIONE, e un
// tocco di consultazione che cucina di nascosto sarebbe il peggior incidente
// del pannello.
function Kds2Pronti({ voci, onChiudi, onRipristina }) {
  // La voce in attesa di conferma. Vive qui e non nel board: è una domanda
  // aperta dentro il pannello, e chiudendo il pannello muore con lui.
  const [scelto, setScelto] = React.useState(null);
  return (
    <div data-kds2-interattivo="" onPointerDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', inset: 0, zIndex: 70,
        background: 'rgba(15,17,21,0.28)',
        display: 'flex', justifyContent: 'flex-end',
      }}
      onClick={onChiudi}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, maxWidth: '100%', height: '100%',
        background: K.RIGA, borderLeft: '1px solid ' + K.BORDO_RIGA,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-18px 0 40px -20px rgba(15,17,21,0.35)',
        // `relative`: il popup di conferma si stende su QUESTO pannello, non
        // su tutto lo schermo — la domanda riguarda una voce del pannello.
        position: 'relative',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 18px 14px', flexShrink: 0,
          borderBottom: '1px solid ' + K.BORDO_RIGA,
        }}>
          <span style={{flex: 1, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: K.TESTO}}>
            Ordini pronti
          </span>
          <button type="button" onClick={onChiudi} aria-label="Chiudi" title="Chiudi"
            style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: K.FONDO, border: '2px solid ' + K.BORDO_RIGA,
              color: K.TESTO, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 18px 18px'}}>
          {voci.length === 0 ? (
            <div style={Object.assign({}, TY.corpo, {color: K.TESTO_2, padding: '28px 2px'})}>
              Ancora niente. Qui finiscono i piatti quando il loro timer scade.
            </div>
          ) : voci.map(v => (
            // Ogni voce è un PULSANTE: tocco → domanda di ripristino. La
            // freccia dell'undo in coda è la promessa del gesto — senza, un
            // elenco di righe con la spunta verde si legge come sola lettura.
            <button key={v.id} type="button" data-kds2-interattivo=""
              onClick={() => setScelto(v)}
              title={'Ripristina · ' + v.testo}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', textAlign: 'left',
                padding: '13px 2px', borderBottom: '1px solid ' + K.BORDO_RIGA,
                background: 'transparent', border: 'none', borderRadius: 0,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <span style={{color: K.VERDE, display: 'flex', flexShrink: 0}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12.5 9.5 18 20 6"/></svg>
              </span>
              <span style={{flex: 1, minWidth: 0, fontSize: 19, fontWeight: 700, color: K.TESTO, letterSpacing: '-0.01em'}}>
                {v.testo}
              </span>
              <span style={{fontSize: 17, fontWeight: 600, color: K.TESTO_2, fontVariantNumeric: 'tabular-nums'}}>
                {kds2Orario(v.quando)}
              </span>
              <span style={{color: K.TESTO_OFF, display: 'flex', flexShrink: 0}}>
                <Kds2Undo size={18}/>
              </span>
            </button>
          ))}
        </div>

        {/* La domanda. Testo fisso e i due esiti, «Annulla» prima e il gesto
            che chiude per ultimo, come su tutte le conferme del prodotto.
            Il velo si tocca per dire no: la via d'uscita più larga è quella
            del non fare niente. */}
        {scelto && (
          <div onClick={() => setScelto(null)} style={{
            position: 'absolute', inset: 0, zIndex: 5,
            background: 'rgba(15,17,21,0.30)',
            display: 'grid', placeItems: 'center', padding: 24,
          }}>
            <div role="alertdialog" aria-label="Vuoi ripristinare il prodotto?"
              onClick={e => e.stopPropagation()} style={{
              width: '100%', maxWidth: 340,
              background: K.RIGA, borderRadius: 16, padding: '22px 20px 18px',
              boxShadow: PN.CARD_SHADOW_HOVER,
            }}>
              <div style={{
                fontSize: 22, fontWeight: 800, color: K.TESTO,
                letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>Vuoi ripristinare il prodotto?</div>
              {/* CHE COSA si sta per rimettere in produzione, scritto dentro
                  la domanda: una conferma che non nomina il suo oggetto si
                  preme alla cieca. */}
              <div style={{
                fontSize: 17, fontWeight: 600, color: K.TESTO_2,
                marginTop: 8, lineHeight: 1.35,
              }}>{scelto.testo}</div>
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18,
              }}>
                <button type="button" onClick={() => setScelto(null)}
                  style={{
                    height: 52, padding: '0 20px', borderRadius: 12,
                    background: K.FONDO, border: '2px solid ' + K.BORDO_RIGA,
                    color: K.TESTO, fontSize: 18, fontWeight: 700,
                    fontFamily: 'inherit', cursor: 'pointer',
                  }}>Annulla</button>
                <button type="button"
                  onClick={() => { onRipristina(scelto); setScelto(null); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 52, padding: '0 22px', borderRadius: 12,
                    background: K.TESTO, border: '2px solid transparent',
                    color: K.RIGA, fontSize: 18, fontWeight: 700,
                    fontFamily: 'inherit', cursor: 'pointer',
                  }}>
                  <Kds2Undo size={18}/>
                  Ripristina
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kds2Orologio({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
    </svg>
  );
}

// Minuti e secondi, come su un forno. La cifra secca («7») diceva un numero
// senza dire di che grandezza; `00:07` si legge come tempo anche di sfuggita e
// senza etichetta accanto.
// ── I TEMPI DEL VOLO ──────────────────────────────────────────────────────
// Un volo che dura meno di trecento millisecondi non si vede, uno che ne dura
// più di cinquecento si aspetta: in cucina il gesto successivo parte subito.
// `CONSEGNA` è il momento del passaggio di mano — il calco comincia a spegnersi
// e la scheda ad accendersi — e sta PRIMA della fine, così i due si
// sovrappongono per un quinto di secondo e l'occhio legge una cosa sola che si
// trasforma, non due che si danno il cambio.
const KDS2_VOLO_MS = 460;
const KDS2_CONSEGNA_MS = 300;
// Le carte sotto aspettano un soffio prima di richiudere il buco: prima
// partivano insieme al volo, e con trenta righe che si muovono nello stesso
// istante la carta che se ne va si perdeva dentro il movimento di tutte.
const KDS2_SEGUITO_MS = 80;

/** Chi ha chiesto meno animazioni al sistema non vede nessun volo: la carta
 *  sparisce e la scheda compare, come prima. */
const kds2Moto = () => !(typeof window !== 'undefined' && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/** Quanto e' rimpicciolita la pagina intorno. Dentro il gestionale il frame sta
 *  sotto uno `zoom`: i rettangoli si misurano in pixel di schermo e le
 *  trasformazioni si scrivono in pixel di layout, e senza dividere per questo
 *  numero il volo scavalca il bersaglio. */
const kds2Scala = el => (el && el.offsetWidth
  ? el.getBoundingClientRect().width / el.offsetWidth : 1);

function kds2MmSs(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function Kds2Annulla({ voci, onRipristina }) {
  // Un battito al secondo, e solo finché c'è qualcosa da annullare: la board
  // gira a trenta secondi e non deve accelerare per colpa di questa fascia.
  // Vive qui dentro perché qui dentro sta tutto ciò che si rinfresca — le righe
  // dei piatti non si rirenderizzano per un timer che non le riguarda.
  const [adesso, setAdesso] = React.useState(() => Date.now());
  const vive = voci.length > 0;
  React.useEffect(() => {
    if (!vive) return;
    setAdesso(Date.now());
    const id = setInterval(() => setAdesso(Date.now()), 1000);
    return () => clearInterval(id);
  }, [vive]);

  if (!vive) return null;
  return (
    // Fascia corallo chiarissimo, non più vetro: sotto ci passano righe bianche
    // e il vetro le lasciava intravedere sfocate proprio dove servono i numeri.
    // La velatura del brand la stacca dal board senza spegnerlo, e le schede
    // bianche dentro tornano a essere l'unica cosa che si legge.
    <div data-kds2-interattivo="" style={{
      position: 'sticky', bottom: 0, zIndex: 40,
      padding: '9px 16px 7px', borderRadius: 16, marginTop: 4,
      background: K.BRAND_BG, border: '1px solid ' + K.BRAND_BORDO,
      boxShadow: '0 -6px 20px -12px rgba(15,17,21,0.18)',
    }}>
      <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10}}>
      {/* Una scheda per piatto avviato, tutte uguali e tutte su UNA RIGA: nome,
          tempo, tasto per riportarlo in produzione. Prima il nome stava sopra e
          il resto sotto — due piani di scheda che alzavano la fascia di una
          trentina di pixel, e ogni pixel qui è tolto ai piatti da fare. In
          orizzontale la fascia si allunga, ma quello è spazio che c'era già. */}
      {voci.map(v => (
        /* `data-kds2-annulla`: e' l'indirizzo a cui atterra la carta che hai
           appena avviato, e il punto da cui riparte se la richiami. */
        <div key={v.id} data-kds2-annulla={v.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          padding: '6px 6px 6px 14px', borderRadius: 12,
          background: K.RIGA, border: '1px solid ' + K.BRAND_BORDO,
        }}>
          <span style={{
            fontSize: 15, fontWeight: 700, color: K.TESTO,
            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
          }}>{v.testo}</span>
          {/* Rosso: è il tempo che si consuma, l'unica cosa che sta scadendo
              in tutta la schermata. Nero era un dato come gli altri. */}
          <span style={{
            fontSize: 23, fontWeight: 800, color: K.ROSSO,
            letterSpacing: '-0.02em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{kds2MmSs(v.scadenza - adesso)}</span>
          <button type="button" onClick={() => onRipristina(v)}
            aria-label={'Annulla · ' + v.testo}
            title={'Annulla · ' + v.testo}
            style={{
              width: 40, height: 40, flexShrink: 0, borderRadius: 10,
              display: 'grid', placeItems: 'center',
              background: K.ROSSO, border: 'none', color: K.RIGA,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
            <Kds2Undo size={21}/>
          </button>
        </div>
      ))}
      </div>

      {/* Qui c'era la nota «Allo scadere del timer il piatto viene considerato
          pronto e scompare»: spiegava il meccanismo, ma il meccanismo si vede
          da solo — il cerchio si svuota e la scheda se ne va. Una regola che
          si dimostra ogni dieci secondi non ha bisogno di una didascalia. */}
    </div>
  );
}

// ─── Comandi dimostrativi ─────────────────────────────────────────────────
// Fuori dall'interfaccia di cucina: servono a vedere che il riordino avviene
// sull'evento e non sul tick, e a caricare il board oltre le trenta righe.
function Kds2Demo({ righe, onNuovo }) {
  const [aperto, setAperto] = React.useState(true);
  const btn = {
    height: 52, padding: '0 20px', borderRadius: 10, cursor: 'pointer',
    background: K.RIGA, border: '1px solid ' + K.BORDO_ATTESA,
    color: K.TESTO_2, fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
  };
  // Ancorato in basso a destra: la fascia «pronti» cresce da sinistra, quindi
  // le due cose non si incontrano mai.
  const ancora = { position: 'absolute', right: 20, bottom: 20, zIndex: 55 };
  if (!aperto) {
    return (
      <button type="button" data-demo-only data-kds2-interattivo="" onClick={() => setAperto(true)}
        style={Object.assign({}, btn, ancora)}>DEMO</button>
    );
  }
  return (
    <div data-demo-only data-kds2-interattivo="" style={Object.assign({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: 10, borderRadius: 14,
      background: K.RIGA, border: '1px solid ' + K.BORDO_RIGA,
    }, ancora)}>
      <span style={Object.assign({}, TY.etich, {color: K.TESTO_2, paddingLeft: 6})}>
        DEMO · {righe} righe
      </span>
      <button type="button" onClick={onNuovo} style={btn}>Nuovo ordine</button>
      <button type="button" onClick={() => setAperto(false)} title="Nascondi"
        style={Object.assign({}, btn, {padding: '0 14px'})}>×</button>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────
// `porzioni`: gli ordini da cui partire. Senza, la board prende i suoi dati
// finti — è il caso della route di anteprima. Dentro la Cucina del gestionale
// arrivano invece gli ordini veri del servizio, convertiti da
// cucina-kds2-da-cucina.jsx: la vista cambia, il servizio no.
function Kds2Board({ porzioni: porzioniIniziali, focus, onToggleFocus, barra }) {
  const [porzioni, setPorzioni] = React.useState(() => porzioniIniziali || KDS2_PORZIONI);
  const [ora, setOra]           = React.useState(() => Date.now());
  const [selezione, setSel]     = React.useState(null);
  const [pronti, setPronti]     = React.useState([]);
  // Quello che è uscito dalla fascia: piatti MANDATI dalla cucina. Non tornano
  // sul board — si guardano e basta. Non si chiamano «consegnati» perché il
  // monitor non sa se hanno raggiunto il tavolo (P-196 · D-156).
  const [mandati, setMandati] = React.useState([]);
  const [mandatiAperti, setMandatiAperti] = React.useState(false);
  const [tocchi, setTocchi]     = React.useState(0);
  const [canale, setCanale]       = React.useState(CANALI[0]);
  const [categoria, setCategoria] = React.useState(TUTTE_CATEGORIE);
  const seq = React.useRef(0);

  // Le categorie del filtro escono dal menu che c'è davvero in produzione, non
  // da un elenco fisso: un locale che non fa dolci non deve vedere «Dolci».
  const categorie = React.useMemo(() => [TUTTE_CATEGORIE].concat(
    Array.from(new Set(porzioni.map(p => p.category))).sort((a, b) => a.localeCompare(b, 'it'))
  ), [porzioni]);

  // I timer si riverniciano ogni 30 s. Questo `setOra` NON entra nelle memo
  // dell'aggregazione, quindi non può muovere niente.
  React.useEffect(() => {
    const id = setInterval(() => setOra(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Il riordino è un EVENTO, non un battito: le dipendenze sono le sole
  // porzioni, che cambiano quando arriva un ordine, si spegne una porzione o si
  // annulla. Finché scorrono solo i minuti, `righe` è letteralmente lo stesso
  // array di prima e nessuna riga si sposta sotto la mano di chi sta toccando.
  // I filtri entrano nelle memo, ed è corretto: cambiano su TOCCO, che è un
  // evento come l'arrivo di un ordine. È il tick dell'orologio a non doverci
  // entrare mai, e infatti `ora` resta fuori.
  const porzioniViste = React.useMemo(() => porzioni.filter(p =>
    (canale === TUTTI_CANALI || CANALE_TIPO[canale] === p.source.delivery_mode) &&
    (categoria === TUTTE_CATEGORIE || p.category === categoria)
  ), [porzioni, canale, categoria]);

  const righe    = React.useMemo(() => kds2Righe(porzioniViste), [porzioniViste]);
  // La rail segue il board: se sto guardando solo l'asporto, le sorgenti in
  // alto sono quelle dell'asporto. Un recap che continuasse a contare porzioni
  // non più a schermo direbbe numeri che non si possono verificare.
  const sorgenti = React.useMemo(() => kds2Sorgenti(porzioniViste), [porzioniViste]);
  // Quanti piatti in tutto: la somma delle porzioni a schermo, non il numero di
  // righe — «2 Pizza Diavola» sono due piatti da fare, non uno.
  const totale = React.useMemo(
    () => porzioniViste.reduce((s, p) => s + p.quantity, 0), [porzioniViste]);

  // Auto-deselezione: si azzera a ogni tocco, ovunque sullo schermo.
  React.useEffect(() => {
    if (!selezione) return;
    const t = setTimeout(() => setSel(null), HIGHLIGHT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [selezione, tocchi]);

  // La sorgente evidenziata può sparire (ultima porzione spenta): l'id resterebbe
  // appeso e il board smorzato per sempre, senza più la chip da cui uscire.
  React.useEffect(() => {
    if (selezione && !sorgenti.some(s => s.id === selezione)) setSel(null);
  }, [selezione, sorgenti]);

  // Scadenza delle voci annullabili. Hanno tutte la stessa durata e la fila è
  // ordinata dal più recente, quindi la prossima a scadere è l'ULTIMA: basta un
  // timer solo, puntato in fondo.
  //
  // Scadere non vuol dire sparire: la voce passa in CONSEGNATI. Finora un
  // piatto che usciva dalla fascia non esisteva più da nessuna parte, e
  // «l'avevo mandato o me lo sono immaginato?» era una domanda senza risposta —
  // in mezzo al servizio si finiva a rifarlo.
  React.useEffect(() => {
    if (pronti.length === 0) return;
    const t = setTimeout(() => {
      const ora = Date.now();
      setPronti(s => {
        const scadute = s.filter(v => v.scadenza <= ora);
        if (scadute.length) {
          // `tolte` viaggia anche qui: un piatto mandato si può RIPRISTINARE
          // (piatto caduto, contestato, rifatto), e senza le porzioni che
          // aveva tolto dal board il ripristino non avrebbe niente da rimettere.
          setMandati(c => scadute
            .map(v => ({ id: v.id, testo: v.testo, quando: v.scadenza, tolte: v.tolte }))
            .concat(c)
            .slice(0, 60));   // la memoria di un servizio, non un archivio
        }
        return s.filter(v => v.scadenza > ora);
      });
    }, Math.max(0, pronti[pronti.length - 1].scadenza - Date.now()) + 20);
    return () => clearTimeout(t);
  }, [pronti]);

  // Ogni voce di «pronti» porta con sé ESATTAMENTE ciò che ha tolto dal board,
  // non una fotografia dell'intero stato. Con più voci vive insieme è l'unico
  // modo perché ognuna sia annullabile per conto suo: ripristinare uno scatto
  // vecchio rimetterebbe in produzione anche i piatti usciti dopo.
  // In TESTA, non in coda: l'ultima azione fatta è la prima che si vuole
  // annullare, quindi deve stare dove la mano arriva per prima — a sinistra,
  // nella CTA — e non scorrere via a destra man mano che si lavora.
  function registra(testo, tolte) {
    seq.current += 1;
    const id = 'v' + seq.current;
    setPronti(s => [{ id, testo, tolte, scadenza: Date.now() + UNDO_MS }].concat(s));
    return id;   // chi l'ha chiamata deve sapere dove far atterrare la carta
  }

  // ══════════════════════════════════════════════════════════════════════
  // IL PIATTO CHE PARTE, E QUELLO CHE TORNA
  //
  // Toccare una carta la fa sparire dal board e comparire nella fascia in
  // fondo, quella col conto alla rovescia. Erano due fatti simultanei e
  // slegati: la carta svaniva sotto il dito e da qualche parte, in basso,
  // spuntava una scheda. Chi ha premuto non vedeva NIENTE andare da qui a li',
  // e la fascia — che e' l'unica via per tornare indietro, e dura dieci
  // secondi — la si scopriva solo se si stava gia' guardando in basso.
  //
  // Adesso il piatto SCENDE: il calco della carta che hai toccato si stacca,
  // scivola fino alla sua scheda nella fascia, si rimpicciolisce e ci entra
  // dentro. E' lo stesso gesto della mano che posa il piatto al passe, ed e'
  // anche il modo piu' economico per insegnare dove si va a riprenderlo.
  // Premendo «Annulla» il movimento si inverte: la carta risale dalla scheda
  // al suo posto in lista, che e' quello di prima perche' la sua attesa non si
  // e' mai fermata.
  // Le carte sotto, che si spostano perche' una se n'e' andata o e' tornata,
  // scivolano anche loro invece di saltare (tecnica FLIP).
  // Chi ha chiesto meno animazioni al sistema non vede niente di tutto questo.
  const pista = React.useRef(null);
  const volo = React.useRef(null);
  const [voli, setVoli] = React.useState(0);

  /** Si chiama PRIMA di cambiare i dati: dopo, dove stavano le carte non lo sa
   *  piu' nessuno. */
  function misuraVolo(dati) {
    if (!kds2Moto() || !pista.current) return;
    const righeRect = {};
    pista.current.querySelectorAll('[data-kds2-volo]').forEach(el => {
      righeRect[el.getAttribute('data-kds2-volo')] = el.getBoundingClientRect();
    });
    volo.current = Object.assign({ righe: righeRect }, dati);
    setVoli(n => n + 1);
  }

  React.useLayoutEffect(() => {
    const v = volo.current;
    volo.current = null;
    const p0 = pista.current;
    if (!v || !p0) return;
    const s = kds2Scala(p0) || 1;
    const cr = p0.getBoundingClientRect();
    // Da pixel di schermo a coordinate della lista, che e' l'unico sistema in
    // cui si puo' posare un calco: la pagina puo' essere zoomata e la lista
    // puo' essere scorsa.
    const qui = r => ({
      x: (r.left - cr.left) / s + p0.scrollLeft, y: (r.top - cr.top) / s + p0.scrollTop,
      w: r.width / s, h: r.height / s,
    });
    // Il volo si ancora al LATO SINISTRO, non al centro. La scheda d'arrivo sta
    // in fondo a sinistra, e una carta larga quanto lo schermo che punta il
    // proprio centro su quel punto esce dal bordo sinistro della lista e ci si
    // taglia contro per mezzo viaggio. Ancorata a sinistra, la carta si
    // rimpicciolisce verso il suo lato sinistro e quel lato non lascia mai la
    // pista: in verticale invece si allineano i centri, che e' quello che fa
    // sembrare la carta «entrata» nella scheda e non appoggiata sopra.
    const mira = (a, b) => ({
      dx: b.x - a.x,
      dy: (b.y + b.h / 2) - (a.y + a.h / 2),
    });
    const giro = voli;

    // ── 1. Le carte rimaste: scivolano dal posto di prima ──────────────────
    const nate = [];
    p0.querySelectorAll('[data-kds2-volo]').forEach(el => {
      const prima = v.righe[el.getAttribute('data-kds2-volo')];
      if (!prima) { nate.push(el); return; }
      const o = el.getBoundingClientRect();
      const dx = (prima.left - o.left) / s, dy = (prima.top - o.top) / s;
      if (!dx && !dy) return;
      el.__volo = giro;
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      requestAnimationFrame(() => {
        el.style.transition = 'transform 400ms cubic-bezier(.2,.8,.25,1) '
          + (v.verso === 'giu' ? KDS2_SEGUITO_MS : 0) + 'ms';
        el.style.transform = '';
        setTimeout(() => { if (el.__volo === giro) el.style.transition = ''; }, 520);
      });
    });

    // ── 2. GIU': il calco della carta toccata entra nella sua scheda ───────
    if (v.verso === 'giu' && v.calco && v.da) {
      const scheda = p0.querySelector('[data-kds2-annulla="' + v.id + '"]');
      const a = qui(v.da);
      const b = scheda ? qui(scheda.getBoundingClientRect())
                       : { x: a.x, y: a.y + 220, w: a.w, h: a.h };
      // La carta non si «sgonfia» a una misura decisa a tavolino: arriva LARGA
      // QUANTO LA SCHEDA che la riceve, e col suo stesso lato sinistro. Alla
      // fine del volo i due ingombri coincidono in orizzontale, ed è quello
      // che fa leggere la scheda come la carta arrivata a destinazione invece
      // che come una cosa nuova comparsa lì sotto. La larghezza e non
      // l'altezza perché è la larghezza a dare la silhouette: una carta larga
      // il triplo posata sopra una scheda stretta si vede che sono due
      // oggetti, per quanto le si faccia sfumare l'una nell'altra.
      const k = Math.max(0.18, Math.min(0.7, b.w / a.w));
      const c = v.calco;
      c.removeAttribute('data-kds2-volo');
      Object.assign(c.style, {
        position: 'absolute', left: a.x + 'px', top: a.y + 'px',
        width: a.w + 'px', height: a.h + 'px', margin: '0',
        pointerEvents: 'none', zIndex: '45', transformOrigin: 'left center',
        // In volo la carta è SOLLEVATA: ombra lunga e morbida, quella che una
        // cosa in mano proietta sul piano di lavoro. È il segnale che sta
        // sopra il board e non dentro, ed è anche quello che la distingue
        // dalle righe bianche su cui passa sopra.
        boxShadow: '0 22px 44px -18px rgba(15,17,21,0.45), 0 6px 14px -8px rgba(15,17,21,0.25)',
        transition: 'transform ' + KDS2_VOLO_MS + 'ms cubic-bezier(.45,.02,.2,1),'
                  + ' box-shadow ' + KDS2_VOLO_MS + 'ms ease-out',
      });
      p0.appendChild(c);
      // Lo stato di PARTENZA va calcolato prima di scrivere quello d'arrivo:
      // un elemento appena nato non ha ancora uno stile computato, e senza
      // questa lettura il browser fonde i due stati in uno solo — la carta si
      // ritrova arrivata senza aver attraversato niente. Vale per il calco
      // come per la carta che risale: sono tutti e due elementi nuovi.
      void c.offsetWidth;
      requestAnimationFrame(() => {
        const m = mira(a, b);
        c.style.transform = 'translate(' + m.dx + 'px,' + m.dy + 'px) scale(' + k + ')';
        // Atterrando l'ombra rientra: la carta si è posata.
        c.style.boxShadow = '0 4px 10px -6px rgba(15,17,21,0.30)';
      });
      // Lo spegnimento è un GESTO A SÉ e arriva tardi: la carta resta piena
      // per tre quarti di viaggio — una cosa che sbiadisce mentre viaggia
      // sembra sparire, non arrivare — e si spegne solo mentre la scheda si
      // accende sotto di lei.
      setTimeout(() => {
        c.style.transition = 'opacity 140ms ease-in';
        c.style.opacity = '0';
      }, KDS2_CONSEGNA_MS);
      setTimeout(() => { if (c.parentNode) c.parentNode.removeChild(c); }, KDS2_VOLO_MS + 40);

      // ── IL PASSAGGIO DI MANO ─────────────────────────────────────────────
      // La scheda non c'era già: si accende quando la carta arriva. Finché il
      // volo è in corso resta invisibile, e questo è il punto — prima il
      // bersaglio era lì dall'inizio, quindi il volo non consegnava niente e
      // si leggeva come una decorazione che passava davanti a un fatto già
      // avvenuto.
      if (scheda) {
        scheda.style.transition = 'none';
        scheda.style.transformOrigin = 'left center';
        scheda.style.transform = 'scale(' + (0.86) + ')';
        scheda.style.opacity = '0';
        void scheda.offsetWidth;
        setTimeout(() => {
          // Un soffio oltre l'uno e poi indietro: è il modo in cui una cosa si
          // posa davvero. Sotto i due centesimi non si vede, sopra i cinque
          // diventa un rimbalzo da giocattolo.
          scheda.style.transition = 'transform 300ms cubic-bezier(.2,1.25,.3,1), opacity 180ms ease-out';
          scheda.style.transform = '';
          scheda.style.opacity = '';
          setTimeout(() => {
            scheda.style.transition = ''; scheda.style.transformOrigin = '';
          }, 340);
        }, KDS2_CONSEGNA_MS);
      }
    }

    // ── 3. SU': la carta tornata risale dalla scheda che l'ha richiamata ───
    if (v.verso === 'su' && v.da && nate.length) {
      const a = qui(v.da);
      nate.forEach(el => {
        const r = el.getBoundingClientRect();
        const o = qui(r);
        const m = mira(o, a);   // al contrario: da dove viene, non dove va
        const k = Math.max(0.18, Math.min(0.7, a.w / o.w));
        el.__volo = giro;
        el.style.transition = 'none';
        el.style.transformOrigin = 'left center';
        el.style.transform = 'translate(' + m.dx + 'px,' + m.dy + 'px) scale(' + k + ')';
        el.style.opacity = '0';
        el.style.zIndex = '6';
        el.style.boxShadow = '0 22px 44px -18px rgba(15,17,21,0.45), 0 6px 14px -8px rgba(15,17,21,0.25)';
        void el.offsetWidth;
        requestAnimationFrame(() => {
          el.style.transition = 'transform ' + KDS2_VOLO_MS + 'ms cubic-bezier(.2,.85,.25,1),'
            + ' opacity 160ms ease-out, box-shadow ' + KDS2_VOLO_MS + 'ms ease-out';
          el.style.transform = '';
          el.style.opacity = '';
          el.style.boxShadow = '';
          setTimeout(() => {
            if (el.__volo !== giro) return;
            el.style.transition = ''; el.style.zIndex = '';
            el.style.transformOrigin = ''; el.style.boxShadow = '';
          }, KDS2_VOLO_MS + 60);
        });
      });
    }
  }, [voli]);

  function bumpPorzione(p, carta) {
    // Nessun «1» davanti al nome. Serviva a dire «una di quelle due», quando il
    // gesto poteva mandarne via anche più d'una; ora ne esce sempre uno, e la
    // cifra faceva solo sì che due tocchi sullo stesso piatto lasciassero in
    // fascia due voci scritte in modo diverso.
    const id = registra(
      p.dishName + ' · ' + kds2Identita(p.source),
      [Object.assign({}, p, { quantity: 1 })]
    );
    // Il calco si prende ADESSO, dalla carta che il dito ha toccato: fra un
    // istante quella carta non c'e' piu'. Di due gemelle sparisce l'ultima —
    // sono identiche, quindi a partire dev'essere quella che hai premuto.
    misuraVolo({
      verso: 'giu', id,
      da: carta ? carta.getBoundingClientRect() : null,
      calco: carta ? carta.cloneNode(true) : null,
    });
    setPorzioni(kds2BumpUna(porzioni, p.id));
  }

  // Rimette in produzione. Se la porzione è ancora viva (spenta a unità) le si
  // ridà la quantità tolta; se era uscita del tutto, rientra tale e quale.
  // L'ordine nell'array non conta: kds2Righe ordina per conto suo.
  function rimettiInProduzione(tolte) {
    setPorzioni(prev => {
      const perId = new Map(prev.map(p => [p.id, p]));
      tolte.forEach(t => {
        const viva = perId.get(t.id);
        perId.set(t.id, viva
          ? Object.assign({}, viva, { quantity: viva.quantity + t.quantity })
          : t);
      });
      return Array.from(perId.values());
    });
  }

  // Dalla fascia, entro i dieci secondi: torna con la SUA attesa — il piatto
  // non ha mai smesso di aspettare, il tocco era sbagliato lui.
  function ripristina(voce) {
    const scheda = pista.current
      && pista.current.querySelector('[data-kds2-annulla="' + voce.id + '"]');
    misuraVolo({ verso: 'su', da: scheda ? scheda.getBoundingClientRect() : null });
    rimettiInProduzione(voce.tolte);
    setPronti(s => s.filter(v => v.id !== voce.id));
  }

  // Dal pannello dei mandati, anche molto dopo. Qui l'attesa RIPARTE da
  // adesso: un piatto ripristinato a servizio inoltrato è un piatto da rifare,
  // e tornare in cima al board con quaranta minuti di «attesa» scavalcherebbe
  // tutta la coda vera.
  function ripristinaConsegnato(voce) {
    const adesso = Date.now();
    rimettiInProduzione((voce.tolte || []).map(t => Object.assign({}, t, { firedAt: adesso })));
    setMandati(c => c.filter(v => v.id !== voce.id));
  }

  function nuovoOrdine() {
    seq.current += 1;
    setPorzioni(p => p.concat(kds2NuovoOrdine(seq.current)));
  }

  // Ogni tocco riarma il timeout dell'evidenziazione; un tocco che non finisce
  // su qualcosa di interattivo la toglie del tutto.
  function tocco(e) {
    setTocchi(n => n + 1);
    if (selezione && e.target && !e.target.closest('[data-kds2-interattivo]')) setSel(null);
  }


  return (
    <div onPointerDown={tocco} style={{
      position: 'relative', flex: 1, minWidth: 0, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      // Ospitata nella card della Cucina la board non porta il proprio fondo:
      // ne uscirebbe un rettangolo grigio dentro il riquadro bianco, con i
      // filtri di sopra rimasti fuori. La superficie è una sola, quella della
      // card, e le righe si staccano lo stesso — hanno un bordo da 2px.
      background: barra ? 'transparent' : K.FONDO,
    }}>
      <Kds2Header
        sorgenti={sorgenti} totale={totale} ora={ora} selezione={selezione} onSeleziona={setSel}
        focus={focus} onToggleFocus={onToggleFocus} barra={barra}
        canale={canale} onCanale={setCanale} canali={CANALI}
        categoria={categoria} onCategoria={setCategoria} categorie={categorie}
        mandati={mandati.length} onMandati={() => setMandatiAperti(true)}/>

      {/* UN SOLO contenitore che scorre, per qualunque numero di righe: niente
          scroll annidato, niente colonne — la posizione in lista è la priorità,
          e con due colonne «più in alto» smetterebbe di voler dire «prima». */}
      <div className="pn-scroll" ref={pista} style={{
        flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        // Riferimento per i calchi che volano: sono posati dentro questo
        // riquadro, in coordinate sue, cosi' seguono lo scorrimento.
        position: 'relative',
        // Dentro la card della Cucina il margine laterale è già quello della
        // card: sommarci anche il proprio disallineerebbe le righe dalla barra
        // che le sovrasta.
        padding: barra ? '0 0 12px' : '0 ' + PAD_X + 'px 12px',
      }}>
        {righe.length === 0 && (
          <div style={{
            padding: '120px 0', textAlign: 'center',
            fontSize: 26, fontWeight: 700, color: K.TESTO_2,
          }}>Niente in produzione</div>
        )}
        {righe.map(r => {
          const sua = selezione != null
            && r.portions.some(p => kds2SorgenteId(p.source) === selezione);
          return (
            <Kds2Riga key={r.id} riga={r} ora={ora}
              // Il filtro smorza qualunque carta non appartenga alla sorgente
              // selezionata — allergene compreso: è Kds2Riga a decidere, con
              // `allergeneVisibile`, come si veste una carta allergene smorzata.
              spenta={selezione != null && !sua}
              evidenziata={sua}
              sorgenteSelezionata={selezione}
              onBumpPorzione={bumpPorzione}/>
          );
        })}

        {/* Dentro il contenitore che scorre, in coda alle righe e appiccicata
            in basso: quando la lista è corta si legge come una riga in più,
            quando è lunga si appoggia sull'ultima e la lascia intravedere. */}
        <Kds2Annulla voci={pronti} onRipristina={ripristina}/>
      </div>

      {/* Dalla cucina non si stampa (P-192 · D-151). Qui c'era il pulsante
          «Stampa comanda», che mandava alla stampa dal browser la comanda
          della sorgente selezionata: la comanda esce perché la stampante è
          configurata e l'ordine è stato inviato, e da nient'altro. Per le
          comande non esiste ripiego — la cucina lavora dal monitor, e se una
          stampante non risponde è il gestionale a dirlo in sala. */}

      {/* La barra demo genera ordini finti: ha senso nell'anteprima, non sopra
          il servizio vero di un locale. */}
      {!porzioniIniziali && <Kds2Demo righe={righe.length} onNuovo={nuovoOrdine}/>}

      {mandatiAperti && (
        <Kds2Pronti voci={mandati} onChiudi={() => setMandatiAperti(false)}
          onRipristina={ripristinaConsegnato}/>
      )}
    </div>
  );
}

window.Kds2Board = Kds2Board;
window.Kds2Chip  = Kds2Chip;
// La banda della vista Cucina (cucina-app) ospita la stessa istruzione della
// banda interna: un promemoria solo, scritto una volta.
window.Kds2Istruzione = Kds2Istruzione;

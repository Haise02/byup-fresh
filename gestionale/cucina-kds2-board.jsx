// Cucina · KDS v2 — vista
//
// Board di produzione aggregato per PIATTO. Una riga non è una comanda: è
// «quante porzioni della stessa cosa devo buttare adesso», e i destinatari sono
// le chip dentro la riga. Le regole di raggruppamento stanno in
// `cucina-kds2-data.jsx`; qui c'è solo come si vede e come si tocca.
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
//     numero che si legge comunque; l'allergene ha bordo, barra doppia, icona
//     ed etichetta, cioè quattro canali di cui uno solo è tinta.
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
  // PIENA con testo bianco e un triangolo accanto. Forma e riempimento
  // separano i due segnali anche a due metri e anche in dicromia.
  BRAND:      '#FF5A5F',   // = PN.PINK — bordo della sorgente selezionata
  BRAND_BG:   '#FFF1EF',   // = PN.PINK_BG_SOFT — velatura sotto la selezione
  BRAND_INK:  '#B53338',   // = PN.WINE — 5,9:1 su bianco, per il testo su brand

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
// Cinque gradini. Il dominante di ogni riga è il nome del piatto; la quantità
// vince per allineamento (colonna fissa, cifre tabulari) e non per taglia.
const TY = {
  piatto:  { fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 },
  qty:     { fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
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

// ─── Colonne ──────────────────────────────────────────────────────────────
// La QUANTITÀ resta incolonnata: è il numero che si scandisce dall'alto in
// basso con la visione periferica, e deve stare sempre alla stessa ascissa.
// Il NOME invece si adatta alla propria lunghezza, e le chip lo seguono da
// vicino. Una colonna fissa per il nome allineava sì le chip fra righe diverse,
// ma su «Nachos» lasciava un corridoio vuoto di 200 px fra il piatto e i suoi
// destinatari: due informazioni che si leggono insieme, separate da niente.
const COL_QTY = 56;

// Margini di pagina stretti: su un monitor di cucina lo spazio bianco ai bordi
// non aggiunge respiro, toglie riga utile.
const PAD_X = 14;

// ─── Filtri ───────────────────────────────────────────────────────────────
// La prima voce di ogni tendina è sempre il «tutto»: è lo stato di riposo, ed è
// quello che dice al bottone di spegnersi (niente corallo, niente stato attivo).
const TUTTI_CANALI    = 'Tutti i canali';
const TUTTE_CATEGORIE = 'Tutte le categorie';
const CANALI = [TUTTI_CANALI, 'Sala', 'Asporto', 'Delivery'];
const CANALE_TIPO = { 'Sala': 'table', 'Asporto': 'takeaway', 'Delivery': 'delivery' };

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
const kds2Categoria = nome => CATEGORIE[nome] || CATEGORIA_ALTRO;

// Chi ha ridotto le animazioni di sistema non deve vedere nulla muoversi — ma
// la barra che avanza durante la pressione lunga, azzerata la durata, scatta a
// pieno al primo istante e si legge come «fatto» quando non è successo niente.
// Lì l'animazione È l'informazione: dove non si può animare, la si toglie e
// resta il solo riscontro statico (il bordo della riga che va a inchiostro).
const KDS2_MOTO_RIDOTTO = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Icone ────────────────────────────────────────────────────────────────
// Le stesse già in uso nel gestionale: `BagIcon` e `ScooterIcon` del KDS attuale
// (cucina-tab-insala.jsx) e il triangolo della vista Banco. Tratto aperto a 2px,
// non le sagome piene della libreria SF — una borsa piena, a taglia piccola e a
// distanza, si chiude e si legge come un lucchetto.
function Kds2Bag({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
}
function Kds2Scooter({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6M14 6h3l3 8M8 17l3-8h6"/></svg>);
}
function Kds2Alert({ size = 26 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
}
// verso: 1 → destra, -1 → sinistra, 0 → in giù (tendine)
function Kds2Chevron({ size = 24, verso = 1 }) {
  const giro = verso === 0 ? 'rotate(90deg)' : verso < 0 ? 'scaleX(-1)' : 'none';
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{transform: giro}}><polyline points="9 5 16 12 9 19"/></svg>);
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
//    quando è 1: «1 tav. 3» è rumore, e in un elenco di chip una cifra in testa
//    diventa il segnale che lì ce n'è più di uno da fare. Niente prefisso '×':
//    davanti al numero non moltiplica niente, e toglierlo lascia parlare la
//    cifra, che è la cosa che si esegue.
//  · identità — «tav. »+numero per i tavoli; per asporto e delivery il nome,
//    preceduto dall'icona di canale (borsa / scooter).
//  · tempo — minuti con apice per i tavoli, ORARIO DI RITIRO per asporto e
//    delivery. Sono due grandezze diverse e non si annotano: a distinguerle
//    bastano l'icona di canale e i due punti dell'orario.
//
// Quantità e identità non si confondono nemmeno quando sono due numeri vicini
// («4 tav. 3»): il peso le separa, e «tav.» sta in mezzo.
//
// 56 px di altezza reale: è il bersaglio minimo per un dito col guanto.
function Kds2Chip({
  source, quantity, tempo, status,
  spenta = false, selezionata = false, tinta = null,
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

  // La selezione non inverte più: accende il bordo corallo e vela di rosa. Il
  // testo resta inchiostro su fondo chiaro, quindi ambra e verde sopravvivono
  // (invertendo sarebbero dovuti scendere a 3,2:1 su nero e cambiare tinta).
  const colTesto = quieta ? K.TESTO_OFF : K.TESTO;
  const colQual  = quieta ? K.TESTO_OFF : K.TESTO_2;
  const colTempo = quieta ? K.TESTO_OFF
    : (tempo.tono === 'attesa' ? K.AMBRA : K.VERDE);

  const Canale = source.type === 'takeaway' ? Kds2Bag
    : source.type === 'delivery' ? Kds2Scooter : null;

  const dentro = (
    <React.Fragment>
      {quantity > 1 && (
        <span style={Object.assign({}, TY.chipQty, {color: colTesto})}>{quantity}</span>
      )}
      {Canale && <span style={{color: colQual, display: 'flex', flexShrink: 0}}><Canale size={24}/></span>}
      <span style={Object.assign({}, TY.chipId, {color: colTesto})}>{identita}</span>
      <span style={Object.assign({}, TY.chipOra, {color: colTempo})}>{tempo.testo}</span>
    </React.Fragment>
  );

  const stile = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    height: H_BERSAGLIO, padding: '0 20px', borderRadius: 12,
    // Selezionata → velatura corallo. Non ancora inviata o filtrata fuori →
    // niente fondo: la chip si appiattisce sulla pagina, ed è questo che la fa
    // sparire come oggetto, non l'opacità. Altrimenti la velatura della sua
    // categoria (nulla nell'header, dove le chip non appartengono a un piatto).
    background: selezionata ? K.BRAND_BG
      : quieta ? 'transparent'
      : (tinta || K.RIGA),
    // Presa in carico o no: la differenza è di VALORE e di TRATTO, mai di tinta
    // — un canale che sopravvive a qualunque dicromia e anche a una stampa in
    // bianco e nero, e che non cambia né la taglia né la posizione della chip.
    // In attesa il tratto è spezzato e più chiaro: RECEDE. È l'ordine giusto
    // della scala — quello su cui si sta lavorando è definito, quello che deve
    // ancora partire è provvisorio — ed è anche l'idioma che la vista Banco usa
    // già per «ordinato ma non ancora lanciato».
    border: '2px '
      + (!selezionata && !presa ? 'dashed ' : 'solid ')
      + (selezionata ? K.BRAND
         : spenta ? K.BORDO_RIGA
         : presa ? K.BORDO : K.BORDO_ATTESA),
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
// Togliere e aggiungere si distinguono per segno e peso, non per tinta: una
// preferenza di gusto non entra nel canale della sicurezza alimentare.
// ─── Modificatori ─────────────────────────────────────────────────────────
// «Aggiungi» e «togli» è la distinzione più costosa da sbagliare dopo gli
// allergeni: bacon in più e bacon in meno sono lo stesso piatto rifatto due
// volte. Prima il segno era un carattere di punteggiatura alto come la parola —
// a due metri, un trattino di due pixel. Ora è un OPERATORE: riquadro proprio,
// glifo pesante, dimensione maggiore del testo che governa.
//
// Rosso per «togli», verde per «metti»: è la convenzione che chiunque legge
// senza impararla, ed è una scelta esplicita del committente.
//
// Il rosso però su questa schermata era già impegnato: significa allergene. Per
// non annacquare l'allarme, i due rossi non si somigliano MAI per forma —
// l'allergene è pastiglia larga, piena, con triangolo e parola dentro, più
// bordo e barra sulla riga; il modificatore è un quadratino da 24 px con un
// segno. Stessa tinta, due oggetti che non si confondono.
//
// Il colore resta comunque il canale in PIÙ, non l'unico: il glifo (+ contro −)
// e il riquadro pieno restano lì sotto intatti. Serve, perché rosso e verde è
// la coppia peggiore per chi ha un deficit sul rosso-verde — circa un uomo su
// dodici in cucina — e qui «aggiungi bacon» contro «togli bacon» è lo stesso
// piatto rifatto due volte. In dicromia il segno bianco su fondo saturo si
// legge uguale.
function Kds2Modificatori({ modifiers, spenta }) {
  if (!modifiers || modifiers.length === 0) return null;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 7}}>
      {modifiers.map((m, i) => {
        const togli = m.type === 'remove';
        const metti = m.type === 'add';
        // Terzo caso: la nota che non aggiunge e non toglie — «ben cotta»,
        // «al sangue», «salsa a parte». Nel mock non esisteva, negli ordini
        // veri sì, e darle un «+» verde direbbe una cosa falsa. Segno neutro,
        // stesso peso: in cucina è un'istruzione come le altre.
        const tinta = spenta ? K.TESTO_OFF : (togli ? K.ROSSO : metti ? K.VERDE : K.TESTO_2);
        return (
          <span key={i} style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            {/* Nascosto agli assistivi: il nome accessibile della riga dice già
                «senza cipolla» / «con bacon» a parole, che è più chiaro di un
                segno letto ad alta voce. */}
            {/* Smorzato il riquadro si SVUOTA invece di restare pieno: bianco
                su grigio quiete starebbe a 2,7:1, illeggibile. Vuoto, il segno
                rientra nella stessa famiglia grigia di tutto il resto della
                riga spenta, che è la convenzione già in uso qui. */}
            <span aria-hidden="true" style={{
              width: 24, height: 24, borderRadius: 7, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: spenta ? 'transparent' : tinta,
              border: spenta ? '2px solid ' + tinta : 'none',
              color: spenta ? tinta : K.RIGA,
              fontSize: 18, fontWeight: 900, lineHeight: 1,
            }}>{togli ? '−' : metti ? '+' : '·'}</span>
            <span style={{
              fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em',
              color: tinta,
            }}>{m.label}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Riga ─────────────────────────────────────────────────────────────────
// Tap su una chip = una porzione fatta. Pressione lunga ovunque sulla riga =
// riga intera. Il gesto lungo ha un riscontro che cresce sul bordo basso: 600 ms
// senza risposta sono 600 ms in cui sembra rotto.
function Kds2Riga({ riga, ora, spenta, evidenziata, sorgenteSelezionata, onBumpPorzione, onBumpRiga }) {
  const [premuta, setPremuta] = React.useState(false);
  const timer = React.useRef(null);
  const scattato = React.useRef(false);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const allergene = !!riga.allergen;
  // Rosso solo quando la riga È allergene E non è stata smorzata dal filtro:
  // la sostanza dell'allergene non cambia, ma il segnale visivo sì. Fuori
  // selezione la riga si comporta come qualunque altra riga smorzata — bordo
  // e barra tornano neutri, l'etichetta perde il fondo pieno.
  const allergeneVisibile = allergene && !spenta;
  const cat = kds2Categoria(riga.category);
  const attesaMin = kds2AttesaMin(riga.firedAt, ora);
  const tonoRiga = kds2TonoAttesa(attesaMin);

  function giu(e) {
    if (e.button != null && e.button !== 0) return;
    scattato.current = false;
    setPremuta(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      scattato.current = true;
      setPremuta(false);
      onBumpRiga(riga);
    }, LONG_PRESS_MS);
  }
  function su() { clearTimeout(timer.current); setPremuta(false); }

  // Il click sulla chip arriva DOPO il pointerup: se nel frattempo è scattata
  // la pressione lunga, la riga è già stata chiusa e il tap non deve valere una
  // seconda volta.
  function tapChip(p) {
    if (scattato.current) { scattato.current = false; return; }
    onBumpPorzione(p);
  }

  // Nome lungo: si scende di gradino, non si tronca mai. «Insalata di mare» e
  // «Insalata di polpo» ridotte alla stessa stringa sono la ricetta sbagliata.
  // Ora che il nome occupa la larghezza che gli serve, il gradino non serve più
  // a farlo stare in una colonna: serve a impedire che un nome chilometrico si
  // mangi lo spazio dei destinatari.
  const nome = riga.dishName;
  const nomeSize = nome.length <= 12 ? 32 : nome.length <= 18 ? 28 : nome.length <= 26 ? 24 : 20;

  // Riga interamente non ancora inviata dalla sala: nessuna delle sue porzioni
  // è lavoro, quindi anche la testata sta in quiete. Se invece la riga è MISTA
  // — qualcosa già in cucina e qualcosa in arrivo — la testata resta viva e a
  // spegnersi sono solo le chip che non sono ancora partite: il piatto si sta
  // producendo davvero, e il suo tempo conta.
  const tuttaInArrivo = riga.portions.every(p => p.status === 'incoming');
  const quieta = spenta || tuttaInArrivo;

  const colNome  = quieta ? K.TESTO_OFF : K.TESTO;
  const colQty   = colNome;
  const colTempo = quieta ? K.TESTO_OFF : (tonoRiga === 'attesa' ? K.AMBRA : K.VERDE);

  return (
    <div
      role="group"
      // A voce, il segno «−» davanti a un modificatore si legge «meno», e la
      // barra rossa non si legge affatto: qui le eccezioni si scrivono per
      // esteso, perché è l'unico posto in cui possono passare.
      aria-label={[
        riga.quantity + ' ' + nome,
        riga.allergen ? riga.allergen.label : null,
      ].concat((riga.modifiers || []).map(m => (m.type === 'remove' ? 'senza ' : 'con ') + m.label))
        .filter(Boolean).join(' · ')}
      data-kds2-interattivo=""
      onPointerDown={giu} onPointerUp={su} onPointerLeave={su} onPointerCancel={su}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'relative', display: 'flex', alignItems: 'stretch',
        // Raggio e ombra della card del gestionale: la riga è una card, e deve
        // essere la stessa card di Sala, Panoramica e Contabilità. L'ombra
        // sparisce quando la riga è premuta o smorzata — in entrambi i casi la
        // riga scende al livello della pagina, e un'ombra sotto qualcosa che
        // non è sollevato è la contraddizione che rende finto tutto il resto.
        borderRadius: 16, overflow: 'hidden', marginBottom: 10,
        boxShadow: (premuta || spenta) ? 'none' : PN.CARD_SHADOW,
        // Sotto il dito la riga «sprofonda» al livello della pagina. Lo stesso
        // fa quando è smorzata: perdere la superficie bianca la toglie dal
        // piano delle card senza toccare il contrasto del testo, ed è un
        // cambiamento che si vede da due metri — mentre uno scarto di grigio
        // sul solo testo, su fondo chiaro, da lontano non si vede affatto.
        background: (premuta || spenta) ? K.FONDO : K.RIGA,
        // Il bordo a inchiostro è il marcatore POSITIVO dell'evidenziazione:
        // dice «questi sono i piatti del tavolo che hai toccato». Smorzare gli
        // altri non basta a rispondere a quella domanda — indica dove NON
        // guardare, non dove guardare. Il rosso vince sul nero SOLO quando
        // l'allergene è ancora visibile (nessun filtro, o filtro che include
        // questo tavolo): filtrata fuori, la riga segue lo stesso destino di
        // una riga qualunque.
        border: '2px solid ' + (allergeneVisibile ? K.ROSSO : evidenziata ? K.TESTO : spenta ? 'transparent' : K.BORDO_RIGA),
        touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none',
      }}>

      {/* Barra di categoria — 4 px, ancoraggio e basta. Sulla riga allergene
          VISIBILE diventa rossa e raddoppia: tolto il fondo campito, è la
          barra a dover reggere il segnale a colpo d'occhio, e lo fa con la
          geometria oltre che con la tinta. Filtrata fuori, torna la barra di
          categoria smorzata come su qualunque altra riga spenta. */}
      <span aria-hidden="true" style={{
        width: allergeneVisibile ? 8 : 4, flexShrink: 0, alignSelf: 'stretch',
        background: allergeneVisibile ? K.ROSSO : (spenta ? cat.smorta : cat.viva),
      }}/>

      {/* Quanti · cosa · per chi · da quando, tutto su una linea sola. Le chip
          stanno a DESTRA del nome e non più sotto: la riga scende da ~150 px a
          ~90, sullo schermo ci stanno tre piatti in più, e la mano che tocca
          non deve scendere di mezzo palmo dopo aver letto il nome. */}
      <div style={{flex: 1, minWidth: 0, padding: '12px 16px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <span style={Object.assign({}, TY.qty, {
            width: COL_QTY, flexShrink: 0, textAlign: 'right', color: colQty,
          })}>{riga.quantity}</span>

          {/* Larghezza del nome: quella del nome. Le chip cominciano subito
              dopo, non a un'ascissa decisa una volta per tutte. */}
          <div style={{flexShrink: 0, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              {allergene && (
                // L'icona resta anche filtrata fuori — è il canale non-tinta
                // dell'allergene, e non deve sparire insieme al rosso — ma si
                // smorza con lo stesso grigio di tutto il resto della riga.
                <span style={{color: allergeneVisibile ? K.ROSSO : K.TESTO_OFF, display: 'flex', flexShrink: 0}}>
                  <Kds2Alert size={26}/>
                </span>
              )}
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
              <span style={{
                display: 'inline-flex', alignItems: 'center', marginTop: 8,
                height: allergeneVisibile ? 36 : 'auto', padding: allergeneVisibile ? '0 14px' : 0,
                borderRadius: 8,
                background: allergeneVisibile ? K.ROSSO : 'transparent',
                color: allergeneVisibile ? K.RIGA : K.TESTO_OFF,
                fontSize: 20, fontWeight: allergeneVisibile ? 800 : 700, letterSpacing: '-0.01em',
              }}>{riga.allergen.label}</span>
            ) : (
              <Kds2Modificatori modifiers={riga.modifiers} spenta={quieta}/>
            )}
          </div>

          {/* Chip delle porzioni, subito a destra del nome. Vanno a capo,
              sempre: uno scorrimento orizzontale dentro una riga nasconde
              destinatari, e un destinatario nascosto è un piatto che non esce.
              (Il carosello dell'header è un'altra cosa: lì fuori campo finisce
              solo ciò che è entrato per ultimo, qui finirebbe un tavolo.) */}
          <div style={{
            flex: 1, minWidth: 0,
            display: 'flex', flexWrap: 'wrap', gap: 10,
          }}>
            {riga.portions.map(p => {
              const suaSorgente = sorgenteSelezionata != null
                && kds2SorgenteId(p.source) === sorgenteSelezionata;
              return (
                <Kds2Chip key={p.id}
                  source={p.source} quantity={p.quantity} status={p.status}
                  tempo={kds2ChipTempo(p.source, p.firedAt, p.dueAt, ora)}
                  // La porzione della sorgente evidenziata si inverte, esattamente
                  // come la chip che l'ha accesa in alto: l'occhio segue il nero
                  // dell'header fino ai neri sparsi nel board, e la domanda «dove
                  // sta il tavolo 12?» ha una risposta che si vede da lontano
                  // senza leggere una sola etichetta.
                  selezionata={suaSorgente}
                  tinta={cat.tinta}
                  spenta={!allergene && sorgenteSelezionata != null && !suaSorgente}
                  onTap={() => tapChip(p)}
                  titolo={'Fatta 1 · ' + nome + ' · ' + kds2Identita(p.source)}/>
              );
            })}
          </div>

          {/* Attesa della riga: quella della sua porzione più vecchia. È l'età
              della produzione, sempre in minuti — l'orario di ritiro è una
              proprietà del destinatario e vive nella sua chip. */}
          <span style={Object.assign({}, TY.attesa, {color: colTempo, flexShrink: 0})}>
            {attesaMin}′
          </span>
        </div>
      </div>

      {/* Riscontro della pressione lunga: 600 ms senza risposta sono 600 ms in
          cui lo schermo sembra rotto, e il dito si stacca prima. */}
      {!KDS2_MOTO_RIDOTTO && (
        <span aria-hidden="true" style={{
          position: 'absolute', left: 0, bottom: 0, height: 5,
          width: premuta ? '100%' : 0,
          background: allergeneVisibile ? K.ROSSO : K.TESTO,
          transition: premuta
            ? 'width ' + LONG_PRESS_MS + 'ms linear'
            : 'width 140ms ease-out',
        }}/>
      )}
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
// Stanno SEMPRE a schermo, spente quando non portano da nessuna parte. La
// prima versione le montava solo in caso di traboccamento, ed era un cane che
// si morde la coda: le frecce occupano larghezza, quindi montarle poteva far
// rientrare il contenuto, che le smontava, che lo faceva traboccare di nuovo.
// React lo tronca con «Maximum update depth exceeded» e la schermata sparisce —
// in cucina, nel mezzo del servizio. Renderle permanenti toglie il ciclo alla
// radice invece che smorzarlo: la larghezza della rail non dipende più da ciò
// che si sta misurando. Costa due frecce spente quando tutto ci sta, che è un
// prezzo onesto — e per giunta dicono «qui si scorre» prima ancora che serva.
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

  const freccia = (verso, spento) => (
    <button type="button" data-kds2-interattivo=""
      onClick={() => scorri(verso)} disabled={spento}
      aria-label={verso < 0 ? 'Sorgenti precedenti' : 'Altre sorgenti'}
      title={verso < 0 ? 'Sorgenti precedenti' : 'Altre sorgenti'}
      style={{
        width: 56, height: H_BERSAGLIO, flexShrink: 0, borderRadius: 12,
        display: 'grid', placeItems: 'center',
        background: K.RIGA, border: '2px solid ' + (spento ? K.BORDO_ATTESA : K.BORDO),
        color: spento ? K.BORDO_ATTESA : K.TESTO,
        cursor: spento ? 'default' : 'pointer', fontFamily: 'inherit',
      }}>
      <Kds2Chevron size={28} verso={verso}/>
    </button>
  );

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: GAP_RAIL}}>
      {freccia(-1, stato.inizio)}
      <div ref={rif} className="kds2-rail" data-kds2-interattivo="" style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexWrap: 'nowrap', gap: GAP_RAIL,
        overflowX: 'auto', overflowY: 'hidden',
      }}>
        {children}
      </div>
      {freccia(1, stato.fine)}
    </div>
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

function Kds2Fullscreen() {
  const [pieno, setPieno] = React.useState(false);
  React.useEffect(() => {
    const agg = () => setPieno(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', agg);
    return () => document.removeEventListener('fullscreenchange', agg);
  }, []);
  function commuta() {
    // In anteprima dentro un iframe l'API è spesso negata: si ignora, il resto
    // della schermata non deve accorgersene.
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch (e) {}
  }
  return (
    <button type="button" data-kds2-interattivo="" onClick={commuta}
      aria-label={pieno ? 'Esci da schermo intero' : 'Schermo intero'}
      title={pieno ? 'Esci da schermo intero' : 'Schermo intero'}
      style={{
        width: H_BERSAGLIO, height: H_BERSAGLIO, flexShrink: 0, borderRadius: 12,
        display: 'grid', placeItems: 'center',
        background: K.RIGA, border: '2px solid ' + K.BORDO_RIGA,
        color: K.TESTO_2, cursor: 'pointer', fontFamily: 'inherit',
      }}>
      <Kds2Espandi size={24} chiudi={pieno}/>
    </button>
  );
}

function Kds2Header({
  sorgenti, ora, selezione, onSeleziona,
  canale, onCanale, canali, categoria, onCategoria, categorie,
}) {
  const orologio = kds2Orario(ora);
  return (
    <div style={{flexShrink: 0, background: K.FONDO, padding: '16px ' + PAD_X + 'px 12px'}}>

      {/* Prima banda: cromo. Orologio, filtri, allarme, schermo intero — niente
          che si tocchi per cucinare, tutto ciò che serve a decidere COSA si
          guarda. Sta sopra la rail perché la rail è già contenuto. */}
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12}}>
        <span style={{
          fontSize: 34, fontWeight: 800, color: K.TESTO, letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums', flexShrink: 0, paddingRight: 6,
        }}>{orologio}</span>

        <Kds2Filtro etichetta="Canali" valore={canale} opzioni={canali} onScegli={onCanale}/>
        <Kds2Filtro etichetta="Categorie" valore={categoria} opzioni={categorie} onScegli={onCategoria}/>

        <span style={{flex: 1}}/>
        <Kds2Fullscreen/>
      </div>

      {sorgenti.length === 0 ? (
        <span style={Object.assign({}, TY.corpo, {color: K.TESTO_2, display: 'block', padding: '18px 4px'})}>
          Nessun ordine aperto
        </span>
      ) : (
        <Kds2Rail>
          {sorgenti.map(s => {
            const sel = selezione === s.id;
            return (
              <Kds2Chip key={s.id}
                source={s.source} quantity={s.quantity} status={s.status}
                tempo={kds2ChipTempo(s.source, s.firedAt, s.dueAt, ora)}
                selezionata={sel}
                spenta={selezione != null && !sel}
                onTap={() => onSeleziona(sel ? null : s.id)}
                titolo={(sel ? 'Togli evidenza · ' : 'Evidenzia · ') + kds2Identita(s.source)}/>
            );
          })}
        </Kds2Rail>
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
// LA CTA. Scartate: «Ripristina» (parola da software, non da cucina),
// «Rimetti in produzione» (troppo lunga da leggere di sfuggita) e un pulsante
// generico «Annulla» separato dalle voci — perché avrebbe costretto a chiedersi
// «annulla cosa?» proprio nei secondi in cui non c'è tempo. Vince una CTA che
// NOMINA il proprio bersaglio: «Annulla · 1 Hamburger · tav. 12». Si legge e si
// tocca senza decidere niente, che è ciò che serve a un annullamento.
//
// L'ORDINE è invertito rispetto a prima: il più recente sta a SINISTRA. Le voci
// si accumulavano verso destra, così l'ultima azione — cioè quella che si vuole
// annullare nel 90% dei casi — finiva in fondo alla fila e, con abbastanza
// voci, fuori schermo. Un annullamento che scorre via è un annullamento che non
// c'è. Ora l'ultima azione è sempre la prima cosa a sinistra, ed è la CTA;
// quelle prima le seguono come pastiglie secondarie, ognuna annullabile per
// conto suo.
//
// Il materiale è il VETRO del gestionale (PN.GLASS_LIGHT, lo stesso di modali,
// dropdown e barre sticky): la riga sotto si intravede sfocata, e questo dice
// due cose insieme — «sono sopra il board, non dentro» e «sto coprendo qualcosa
// che è ancora lì». Un fondo pieno avrebbe detto solo la prima.
//
// Ogni voce vive dieci secondi. Il conto alla rovescia NON si vede: un timer
// che scorre su cinque pastiglie diventa la cosa che si muove sullo schermo,
// cioè l'unica che l'occhio guarda, in una schermata dove ciò che conta è fermo.
function Kds2Undo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h11a5.5 5.5 0 0 1 0 11h-5"/>
      <polyline points="8 5 4 9 8 13"/>
    </svg>
  );
}

function Kds2Annulla({ voci, onRipristina }) {
  if (voci.length === 0) return null;
  const ultima = voci[0], precedenti = voci.slice(1);
  return (
    <div data-kds2-interattivo="" style={Object.assign({
      position: 'sticky', bottom: 0, zIndex: 40,
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
      padding: '14px 20px', borderRadius: 16, marginTop: 4,
    }, PN.GLASS_LIGHT)}>
      <button type="button" onClick={() => onRipristina(ultima)}
        aria-label={'Annulla · ' + ultima.testo}
        title={'Annulla · ' + ultima.testo}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          height: H_BERSAGLIO, padding: '0 22px', borderRadius: 12,
          background: K.TESTO, border: '2px solid ' + K.TESTO, color: K.RIGA,
          fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
        <span style={{display: 'flex', flexShrink: 0}}><Kds2Undo size={23}/></span>
        <span style={{fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em'}}>Annulla</span>
        <span aria-hidden="true" style={{opacity: 0.55, fontSize: 20, fontWeight: 700}}>·</span>
        <span style={{fontSize: 20, fontWeight: 600}}>{ultima.testo}</span>
      </button>

      {/* Le azioni precedenti restano annullabili, ma non si travestono da CTA:
          una sola cosa per volta può essere «il prossimo tocco ovvio». */}
      {precedenti.map(v => (
        <button key={v.id} type="button" onClick={() => onRipristina(v)}
          aria-label={'Annulla · ' + v.testo}
          title={'Annulla · ' + v.testo}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            height: H_BERSAGLIO, padding: '0 18px', borderRadius: 12,
            background: K.RIGA, border: '2px solid ' + K.BORDO,
            fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
          <span style={{color: K.TESTO_2, display: 'flex', flexShrink: 0}}><Kds2Undo size={20}/></span>
          <span style={Object.assign({}, TY.chipId, {color: K.TESTO})}>{v.testo}</span>
        </button>
      ))}
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
function Kds2Board({ porzioni: porzioniIniziali }) {
  const [porzioni, setPorzioni] = React.useState(() => porzioniIniziali || KDS2_PORZIONI);
  const [ora, setOra]           = React.useState(() => Date.now());
  const [selezione, setSel]     = React.useState(null);
  const [pronti, setPronti]     = React.useState([]);
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
    (canale === TUTTI_CANALI || CANALE_TIPO[canale] === p.source.type) &&
    (categoria === TUTTE_CATEGORIE || p.category === categoria)
  ), [porzioni, canale, categoria]);

  const righe    = React.useMemo(() => kds2Aggrega(porzioniViste), [porzioniViste]);
  // La rail segue il board: se sto guardando solo l'asporto, le sorgenti in
  // alto sono quelle dell'asporto. Un recap che continuasse a contare porzioni
  // non più a schermo direbbe numeri che non si possono verificare.
  const sorgenti = React.useMemo(() => kds2Sorgenti(porzioniViste), [porzioniViste]);

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
  React.useEffect(() => {
    if (pronti.length === 0) return;
    const t = setTimeout(
      () => setPronti(s => s.filter(v => v.scadenza > Date.now())),
      Math.max(0, pronti[pronti.length - 1].scadenza - Date.now()) + 20
    );
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
    setPronti(s => [{
      id: 'v' + seq.current, testo, tolte, scadenza: Date.now() + UNDO_MS,
    }].concat(s));
  }

  function bumpPorzione(p) {
    registra(
      (p.quantity > 1 ? '1 ' : '') + p.dishName + ' · ' + kds2Identita(p.source),
      [Object.assign({}, p, { quantity: 1 })]
    );
    setPorzioni(kds2BumpUna(porzioni, p.id));
  }
  function bumpRiga(riga) {
    registra(riga.quantity + ' ' + riga.dishName, riga.portions.slice());
    setPorzioni(kds2BumpRiga(porzioni, riga));
  }

  // Rimette in produzione. Se la porzione è ancora viva (spenta a unità) le si
  // ridà la quantità tolta; se era uscita del tutto, rientra tale e quale.
  // L'ordine nell'array non conta: kds2Aggrega ordina per conto suo.
  function ripristina(voce) {
    setPorzioni(prev => {
      const perId = new Map(prev.map(p => [p.id, p]));
      voce.tolte.forEach(t => {
        const viva = perId.get(t.id);
        perId.set(t.id, viva
          ? Object.assign({}, viva, { quantity: viva.quantity + t.quantity })
          : t);
      });
      return Array.from(perId.values());
    });
    setPronti(s => s.filter(v => v.id !== voce.id));
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
      display: 'flex', flexDirection: 'column', background: K.FONDO,
    }}>
      <Kds2Header
        sorgenti={sorgenti} ora={ora} selezione={selezione} onSeleziona={setSel}
        canale={canale} onCanale={setCanale} canali={CANALI}
        categoria={categoria} onCategoria={setCategoria} categorie={categorie}/>

      {/* UN SOLO contenitore che scorre, per qualunque numero di righe: niente
          scroll annidato, niente colonne — la posizione in lista è la priorità,
          e con due colonne «più in alto» smetterebbe di voler dire «prima». */}
      <div className="pn-scroll" style={{
        flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        padding: '0 ' + PAD_X + 'px 12px',
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
              // Il filtro smorza qualunque riga non appartenga alla sorgente
              // selezionata — allergene compreso: è Kds2Riga a decidere, con
              // `allergeneVisibile`, come si veste una riga allergene smorzata.
              spenta={selezione != null && !sua}
              evidenziata={sua}
              sorgenteSelezionata={selezione}
              onBumpPorzione={bumpPorzione} onBumpRiga={bumpRiga}/>
          );
        })}

        {/* Dentro il contenitore che scorre, in coda alle righe e appiccicata
            in basso: quando la lista è corta si legge come una riga in più,
            quando è lunga si appoggia sull'ultima e la lascia intravedere. */}
        <Kds2Annulla voci={pronti} onRipristina={ripristina}/>
      </div>

      {/* La barra demo genera ordini finti: ha senso nell'anteprima, non sopra
          il servizio vero di un locale. */}
      {!porzioniIniziali && <Kds2Demo righe={righe.length} onNuovo={nuovoOrdine}/>}
    </div>
  );
}

window.Kds2Board = Kds2Board;
window.Kds2Chip  = Kds2Chip;

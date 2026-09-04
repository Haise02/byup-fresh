// Sala — Vendita diretta: menù con immagini, varianti, ingredienti, extras + categorie.

// Vendita diretta — menu reale con immagini, varianti, ingredienti, extras
const SALA_VENDITA_PIATTI = [
  { id: 1, name: 'Espresso', price: 1.50, cat: 'Bar', emoji: '☕', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop' },
  { id: 2, name: 'Cappuccino', price: 1.80, cat: 'Bar', emoji: '☕', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop',
    variants: [{ group: 'Latte', required: true, options: [{name:'Intero'},{name:'Scremato'},{name:'Soia',extra:0.50},{name:'Avena',extra:0.50}] }] },
  { id: 3, name: 'Cornetto', price: 2.00, cat: 'Bar', emoji: '🥐', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop',
    variants: [{ group: 'Tipo', required: true, options: [{name:'Vuoto'},{name:'Crema'},{name:'Cioccolato'},{name:'Marmellata'},{name:'Vegano',extra:0.30}] }] },
  // P-108 (D-105): ogni articolo porta la TIPOLOGIA dichiarata in
  // Impostazioni → Menù (PN_TIPOLOGIE_ARTICOLO), e l'aliquota IVA della riga
  // discende da tipologia × modo di consumo — non più da spunte. hasAlcohol
  // resta per il divieto ai minori e l'avviso al cliente, non governa l'IVA.
  { id: 4, name: 'Spritz', price: 6.50, cat: 'Bar', emoji: '🍹', tipologia: 'bibite_alcolici_confezionati', hasAlcohol: true,
    img: 'https://images.unsplash.com/photo-1605270012917-bf357a1fae9e?w=400&auto=format&fit=crop',
    variants: [{ group: 'Aperitivo', required: true, options: [{name:'Aperol'},{name:'Campari'},{name:'Hugo'},{name:'Cynar'}] }],
    extras: [{name:'Stuzzichini',price:2.00}] },
  { id: 5, name: 'Tagliere misto', price: 14.00, cat: 'Antipasti', emoji: '🧀', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&auto=format&fit=crop',
    extras: [{name:'Burrata',price:3.00},{name:'Bresaola',price:2.50}] },
  { id: 6, name: 'Bruschetta al pomodoro', price: 7.50, cat: 'Antipasti', emoji: '🍞', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&auto=format&fit=crop',
    ingredients: [{name:'Aglio',removable:true},{name:'Basilico',removable:true},{name:'Origano',removable:true}] },
  { id: 7, name: 'Pasta carbonara', price: 12.00, cat: 'Primi piatti', emoji: '🍝', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&auto=format&fit=crop',
    variants: [{ group: 'Cottura', required: true, options: [{name:'Al dente'},{name:'Cottura media'},{name:'Ben cotta'}] }],
    ingredients: [{name:'Pepe',removable:true},{name:'Guanciale',removable:true,allergen:true}],
    extras: [{name:'Pecorino extra',price:1.50}] },
  { id: 8, name: 'Lasagna', price: 13.50, cat: 'Primi piatti', emoji: '🍝', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=400&auto=format&fit=crop',
    ingredients: [{name:'Besciamella',removable:true},{name:'Parmigiano',removable:true,allergen:true},{name:'Noce moscata',removable:true}] },
  { id: 13, name: 'Tagliata di manzo', price: 18.00, cat: 'Secondi piatti', emoji: '🥩', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop',
    variants: [
      { group: 'Cottura', required: true, options: [{name:'Al sangue'},{name:'Media'},{name:'Ben cotta'}] },
      { group: 'Condimento', required: false, options: [{name:'Rucola e grana'},{name:'Salsa pepe verde'},{name:'Aceto balsamico'}] },
    ],
    ingredients: [{name:'Rosmarino',removable:true},{name:'Sale grosso',removable:true}],
    extras: [{name:'Patate al forno',price:3.50}] },
  { id: 14, name: 'Bistecca fiorentina', price: 32.00, cat: 'Secondi piatti', emoji: '🥩', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&auto=format&fit=crop',
    variants: [
      { group: 'Cottura', required: true, options: [{name:'Al sangue'},{name:'Media'}] },
      { group: 'Taglio', required: true, options: [{name:'Costata'},{name:'Filetto'}] },
    ],
    extras: [{name:'Contorno verdure',price:4.00}] },
  { id: 15, name: 'Branzino al forno', price: 22.00, cat: 'Secondi piatti', emoji: '🐟', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&auto=format&fit=crop',
    variants: [{ group: 'Preparazione', required: true, options: [{name:'In crosta di sale'},{name:'Al limone'},{name:'Mediterranea'}] }],
    ingredients: [{name:'Olive',removable:true},{name:'Capperi',removable:true},{name:'Pomodorini',removable:true}] },
  { id: 9, name: 'Margherita', price: 9.00, cat: 'Pizze', emoji: '🍕', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&auto=format&fit=crop',
    variants: [{ group: 'Impasto', required: true, options: [{name:'Classico'},{name:'Integrale',extra:1.00},{name:'Senza glutine',extra:2.00}] }],
    extras: [{name:'Mozzarella di bufala',price:2.00},{name:'Basilico fresco',price:0.50},{name:'Olio piccante',price:0.50}] },
  { id: 10, name: 'Diavola', price: 11.00, cat: 'Pizze', emoji: '🍕', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop',
    variants: [{ group: 'Impasto', required: true, options: [{name:'Classico'},{name:'Integrale',extra:1.00},{name:'Senza glutine',extra:2.00}] }],
    ingredients: [{name:'Salame piccante',removable:true},{name:'Origano',removable:true}] },
  { id: 11, name: 'Tiramisù', price: 6.00, cat: 'Dolci', emoji: '🍰', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop' },
  { id: 12, name: 'Panna cotta', price: 5.50, cat: 'Dolci', emoji: '🍮', tipologia: 'piatti_preparati',
    img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&auto=format&fit=crop',
    variants: [{ group: 'Topping', required: false, options: [{name:'Frutti di bosco'},{name:'Caramello'},{name:'Cioccolato'}] }] },
];

const SALA_VENDITA_CATS = {
  'Bar': { color: '#92400E', bg: '#FEF3C7', icon: 'coffee' },
  'Antipasti': { color: '#9A3412', bg: '#FFEDD5', icon: 'leaf' },
  'Primi piatti': { color: '#9D174D', bg: '#FCE7F3', icon: 'pasta' },
  'Pizze': { color: '#7C2D12', bg: '#FED7AA', icon: 'pizza' },
  'Secondi piatti': { color: '#7F1D1D', bg: '#FECACA', icon: 'meat' },
  'Dolci': { color: '#831843', bg: '#FBCFE8', icon: 'cake' },
};

// Ritiri asporto — ordini dei clienti in attesa al banco.
// pagato:true = saldato via Byup App; pagato:false = ordinato dalla webapp
// guest (che non permette il pagamento), da incassare al banco al ritiro.
// Un asporto si chiama sempre col nome di chi ritira: dall'app arriva
// dall'account, dalla webapp guest lo si chiede prima di chiudere l'ordine.
// È il nome che si urla al banco quando l'ordine è pronto, quindi non può
// mancare — il codice ordine (#A-1045) non lo grida nessuno.
// Il codiceRitiro è mostrato al cliente in app/webapp: dettarlo al banco
// è la prova di consegna, e resta il ripiego se il nome non c'è.
const SALA_ASPORTO_CONTI = [
  { id:'asp-1', codice:'#A-1042', cliente:'Simone De Luca', ritiro:'19:45', fonte:'byup', pagato:true, totale:64.50, codiceRitiro:'K4F7',
    items:[{nome:'Pizza Margherita',qty:1,prezzo:9.00},{nome:'Pizza Diavola',qty:1,prezzo:11.00},{nome:'Pizza Quattro stagioni',qty:1,prezzo:12.00},{nome:'Birra media',qty:2,prezzo:5.50,tipologia:'acqua_birra',hasAlcohol:true},{nome:'Supplì (4pz)',qty:1,prezzo:7.00},{nome:'Tiramisù',qty:1,prezzo:5.50},{nome:'Acqua minerale',qty:2,prezzo:2.50,tipologia:'acqua_birra'},{nome:'Patatine fritte',qty:1,prezzo:4.00}] },
  // Webapp SENZA nome (P-05 · D-14): la webapp guest non chiede più alcun
  // nome — l'ordine d'asporto è identificato dal SOLO codice di ritiro. Il
  // mock deve rifletterlo, o chi sviluppa il backend crede che il campo
  // esista.
  { id:'asp-4', codice:'#A-1045', cliente:null, ritiro:'20:00', fonte:'webapp', pagato:false, totale:37.00, codiceRitiro:'H5W8',
    items:[{nome:'Pizza Diavola',qty:2,prezzo:11.00},{nome:'Patatine fritte',qty:1,prezzo:4.00},{nome:'Birra media',qty:2,prezzo:5.50,tipologia:'acqua_birra',hasAlcohol:true}] },
  { id:'asp-2', codice:'#A-1043', cliente:'Elena Greco', ritiro:'20:15', fonte:'byup', pagato:true, totale:31.00, codiceRitiro:'B2N9',
    items:[{nome:'Carbonara di mare',qty:1,prezzo:16.00},{nome:'Tagliere salumi',qty:1,prezzo:13.00},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'asp-3', codice:'#A-1044', cliente:'Marta Ferri', ritiro:'20:30', fonte:'byup', pagato:true, totale:22.00, codiceRitiro:'Q7D3',
    items:[{nome:'Pizza Margherita',qty:2,prezzo:9.00},{nome:'Acqua minerale',qty:2,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'asp-5', codice:'#A-1046', cliente:null, ritiro:'20:45', fonte:'webapp', pagato:false, totale:29.00, codiceRitiro:'T9C2',
    items:[{nome:'Carbonara di mare',qty:1,prezzo:16.00},{nome:'Tiramisù',qty:2,prezzo:5.50},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  // Piattaforme in coda attiva (P-04 · D-15): entrano DIRETTE in «Da
  // consegnare» — pagate sulla piattaforma, il denaro non passa da Byup — e
  // `codice` è quello DELLA PIATTAFORMA: è ciò che il rider ha sul telefono
  // quando arriva al banco. Niente codiceRitiro: la prova di consegna è quel
  // codice. Formati veri: Uber Eats display_id a 5 caratteri, Deliveroo
  // order ID a 4 cifre (Glovo, collection code a 3 cifre, è nello storico).
  // P-119 (D-106): Just Eat è uscita — la sua specifica non è acquisibile —
  // e al suo posto c'è Uber Eats, la cui documentazione è in raccolta.
  { id:'asp-6', codice:'7K2F9', cliente:'Federica Colombo', ritiro:'20:20', fonte:'ubereats', pagato:true, totale:42.50,
    items:[{nome:'Pizza Margherita',qty:2,prezzo:9.00},{nome:'Lasagna',qty:1,prezzo:13.50},{nome:'Tiramisù',qty:1,prezzo:6.00},{nome:'Acqua minerale',qty:2,prezzo:2.50,tipologia:'acqua_birra'}] },
  { id:'asp-7', codice:'4821', cliente:'Andrea Fabbri', ritiro:'20:35', fonte:'deliveroo', pagato:true, totale:31.50,
    items:[{nome:'Pasta carbonara',qty:1,prezzo:12.00},{nome:'Bruschetta al pomodoro',qty:1,prezzo:7.50},{nome:'Spritz',qty:1,prezzo:6.50,tipologia:'bibite_alcolici_confezionati',hasAlcohol:true},{nome:'Panna cotta',qty:1,prezzo:5.50}] },
];

// Storico del servizio — ordini già chiusi: consegnati al banco o saldati e
// portati via. Non hanno più azioni, servono a rispondere alle domande che
// arrivano dopo ("l'ordine di prima quant'era?", "è già passato a ritirare?").
const SALA_ORDINI_STORICO = [
  // Piattaforme delivery (P-03/P-04 · D-15): pagato:true — incassa la
  // piattaforma, non il banco — e `codice` è il codice DELLA piattaforma nel
  // suo formato vero (Uber Eats display_id a 5 caratteri, Deliveroo 4 cifre,
  // Glovo collection code a 3).
  // Nota di prodotto: al lancio queste integrazioni non esistono — entrano
  // quando ci sono gli accordi.
  { id:'sto-9', codice:'3M8QA', cliente:'Paolo Grimaldi', ritiro:'19:48', fonte:'ubereats', pagato:true, totale:33.50, stato:'consegnato',
    items:[{nome:'Pizza Diavola',qty:2,prezzo:11.00},{nome:'Patatine fritte',qty:1,prezzo:4.00},{nome:'Tiramisù',qty:1,prezzo:5.50},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'sto-6', codice:'#A-1041', cliente:'Chiara Neri', ritiro:'19:38', fonte:'byup', pagato:true, totale:27.50, stato:'consegnato',
    items:[{nome:'Pizza Margherita',qty:1,prezzo:9.00},{nome:'Pizza Diavola',qty:1,prezzo:11.00},{nome:'Birra media',qty:1,prezzo:5.50,tipologia:'acqua_birra',hasAlcohol:true},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'sto-5', codice:'#1245', cliente:null, ritiro:'19:31', fonte:'banco', pagato:true, asporto:true, totale:19.50, stato:'consegnato',
    items:[{nome:'Lasagna',qty:1,prezzo:13.50},{nome:'Tiramisù',qty:1,prezzo:6.00}] },
  // Webapp senza nome anche in archivio (P-05 · D-14): l'identità è il
  // codice di ritiro, che risponde a «è già passato a ritirare?».
  { id:'sto-4', codice:'#A-1040', cliente:null, ritiro:'19:20', fonte:'webapp', pagato:true, totale:24.00, stato:'consegnato', codiceRitiro:'M3P6',
    items:[{nome:'Pizza Margherita',qty:2,prezzo:9.00},{nome:'Patatine fritte',qty:1,prezzo:4.00},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'sto-8', codice:'627', cliente:'Alessia Villa', ritiro:'19:15', fonte:'glovo', pagato:true, totale:25.00, stato:'consegnato',
    items:[{nome:'Lasagna',qty:1,prezzo:13.50},{nome:'Panna cotta',qty:1,prezzo:5.50},{nome:'Patatine fritte',qty:1,prezzo:4.00},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'sto-3', codice:'#1244', cliente:null, ritiro:'19:12', fonte:'banco', pagato:true, asporto:false, totale:9.50, stato:'consegnato',
    items:[{nome:'Bruschetta al pomodoro',qty:1,prezzo:7.50},{nome:'Acqua minerale',qty:1,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'sto-2', codice:'#A-1039', cliente:'Davide Sarti', ritiro:'19:05', fonte:'byup', pagato:true, totale:50.00, stato:'consegnato',
    items:[{nome:'Tagliere misto',qty:1,prezzo:14.00},{nome:'Bistecca fiorentina',qty:1,prezzo:32.00},{nome:'Acqua minerale',qty:2,prezzo:2.00,tipologia:'acqua_birra'}] },
  { id:'sto-7', codice:'9174', cliente:'Marco Leone', ritiro:'18:58', fonte:'deliveroo', pagato:true, totale:43.50, stato:'consegnato',
    items:[{nome:'Tagliata di manzo',qty:2,prezzo:18.00},{nome:'Bruschetta al pomodoro',qty:1,prezzo:7.50}] },
  { id:'sto-1', codice:'#1243', cliente:null, ritiro:'18:54', fonte:'banco', pagato:true, asporto:true, totale:12.00, stato:'consegnato',
    items:[{nome:'Pasta carbonara',qty:1,prezzo:12.00}] },
];

window.SALA_VENDITA_PIATTI = SALA_VENDITA_PIATTI;
window.SALA_VENDITA_CATS = SALA_VENDITA_CATS;
window.SALA_ASPORTO_CONTI = SALA_ASPORTO_CONTI;
window.SALA_ORDINI_STORICO = SALA_ORDINI_STORICO;

// ─────────────────────────────────────────────────────────────────────────────
// Un ordine chiuso al banco È un conto in Contabilità: stesso incasso, stesso
// scontrino, guardato dall'altra parte del locale. Qui c'è la traduzione fra
// le due forme, in un posto solo, perché il rimando dal dettaglio ordine
// ("Vai alle ricevute fiscali associate") deve atterrare su una riga vera —
// non su una lista in cui l'ordine non compare.
//
// L'id è derivato dall'id dell'ordine e non generato: è quello che viaggia
// nell'URL, quindi deve essere lo stesso ad ogni caricamento delle due pagine.
const svContoIdDiOrdine = (ordine) => `cnt-sv-${ordine.id}`;

function svOrdineAConto(ordine) {
  const oggi = new Date();
  const data = `${oggi.getFullYear()}-${String(oggi.getMonth()+1).padStart(2,'0')}-${String(oggi.getDate()).padStart(2,'0')}`;
  const asporto = ordine.fonte === 'banco' ? !!ordine.asporto : true;
  // Chi ha pagato con l'app lo dice l'origine dell'ordine; le piattaforme
  // hanno incassato LORO (P-04): metodo dedicato, fuori dai totali di
  // contanti e POS della cassa. Il documento fiscale però lo emettiamo NOI
  // (D-15 · emit_fiscal_document, ERD v11; SFA §8.5: l'ingestione emette il
  // documento), quindi lo scontrino SC resta. Per il resto l'incasso è
  // passato dal banco, e in cassa il default è la carta.
  const metodo = ordine.fonte === 'byup' ? 'byup'
    : (window.PN_PARTNER || {})[ordine.fonte] ? 'piattaforma'
    : 'carta';
  const rimborsi = ordine.rimborsi || [];
  const reso = rimborsi.reduce((s, r) => s + r.amount, 0);
  // Il numero dello scontrino ricalca quello dei conti di sala (SC-YYMM-…):
  // è il formato con cui il documento esiste nel resto della Contabilità.
  const serie = data.slice(2,4) + data.slice(5,7);
  // Ultime quattro cifre: i codici piattaforma arrivano anche a otto, e il
  // numero scontrino resta nel formato corto di tutti gli altri.
  const num = String(ordine.codice || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
  return {
    id: svContoIdDiOrdine(ordine),
    idOrdine: ordine.codice,
    dataOra: `${data} ${ordine.ritiro || '00:00'}`,
    tavolo: asporto ? 'Asporto' : 'Banco',
    canale: asporto ? 'asporto' : 'sala',
    // Webapp: niente nome (P-05) — l'identità è il codice di ritiro, e il
    // numero di registro resta l'ultima spiaggia.
    cliente: ordine.cliente || ordine.codiceRitiro || ordine.codice,
    // Il nome di chi ha ritirato è l'unica cosa che lega la riga all'ordine da
    // cui si arriva: senza, in lista restano solo un'ora e un totale. Chi ha
    // ordinato dall'app porta il suo bollino, come i conti di sala.
    riferimento: ordine.cliente
      ? { nome: ordine.cliente, tipo: ordine.fonte === 'byup' ? 'byup' : 'asporto' }
      : null,
    liberatoOre: 0,
    totaleConto: ordine.totale,
    daSaldare: 0,
    stato: 'saldato',
    metodoPagamento: metodo,
    operatore: 'Cassa',
    origine: 'vendita_diretta',
    ordini: (ordine.items || []).map((it, i) => ({
      id: `${ordine.id}-r${i}`, nome: it.nome, qty: it.qty, prezzo: it.prezzo,
    })),
    payments: [{
      id: `${ordine.id}-p1`, method: metodo,
      amount: Math.max(0, ordine.totale - reso),
      ora: `${data} ${ordine.ritiro || '00:00'}`,
      scontrinoNum: `SC-${serie}-${num}-1`,
    }],
  };
}

// I conti della vendita diretta di oggi. Si leggono dalla sessione perché è lì
// che il banco scrive man mano che consegna: un ordine battuto due minuti fa
// deve essere raggiungibile dal suo rimando, non solo quelli del seed.
function svContiVenditaDiretta() {
  let storico = SALA_ORDINI_STORICO;
  try {
    const grezzo = sessionStorage.getItem('byup.sala.storico');
    if (grezzo != null) storico = JSON.parse(grezzo);
  } catch (e) { /* storage negato o JSON illeggibile: vale il seed */ }
  return (storico || []).map(svOrdineAConto);
}

window.svContoIdDiOrdine = svContoIdDiOrdine;
window.svContiVenditaDiretta = svContiVenditaDiretta;

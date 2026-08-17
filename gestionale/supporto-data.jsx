// Dati statici per il supporto

// I tutorial qui non hanno un file dietro: i video li pubblica il team dalla
// console (Hubble → Assistenza → Guide) e senza server non arrivano fin qui. In
// mancanza il player suona questo, l'unico mp4 del repo, perché un tutorial
// che si apre deve potersi guardare. Un tutorial con `video` usa il suo.
const SUP_VIDEO_DEMO = 'login-bg-0518.mp4';

const SUP_TUTORIAL_CATS = [
  {
    id: 'config',
    icon: 'phone',
    title: 'Configurazione iniziale',
    tutorials: [
      { id:'c1', title: 'Come configurare il tuo account', desc: 'Imposta il tuo profilo e le preferenze iniziali per poter utilizzare la piattaforma byup.', mins: 8, read: 5 },
      { id:'c2', title: 'Verifica email e P.IVA', desc: 'Verifica i dati fiscali del ristorante per attivare i pagamenti.', mins: 4, read: 3 },
      { id:'c3', title: 'Aggiungere il primo membro del team', desc: 'Invita cuochi e camerieri assegnando ruoli e permessi.', mins: 6, read: 4 },
    ],
  },
  {
    id: 'menu',
    icon: 'utensils',
    title: 'Gestione menù e piatti',
    tutorials: [
      { id:'m1', title: 'Creare il menù del giorno', desc: 'Imposta orari di disponibilità e categorie.', mins: 7, read: 5 },
      { id:'m2', title: 'Aggiungere foto ai piatti', desc: 'Le foto aumentano gli ordini fino al 30%.', mins: 5, read: 3 },
      { id:'m3', title: 'Allergeni e diete speciali', desc: 'Gestisci segnalazioni di allergeni e opzioni veg/vegan/gluten-free.', mins: 9, read: 6 },
    ],
  },
  {
    id: 'pay',
    icon: 'card',
    title: 'Pagamenti e ordini',
    tutorials: [
      { id:'p1', title: 'Configurare Stripe Connect', desc: 'Collega il conto Stripe per ricevere i pagamenti.', mins: 6, read: 4 },
      { id:'p2', title: 'Gestire i rimborsi', desc: 'Come gestire un rimborso parziale o totale.', mins: 5, read: 3 },
      { id:'p3', title: 'Esportare le fatture', desc: 'Scarica le fatture mensili per il commercialista.', mins: 4, read: 2 },
    ],
  },
  {
    id: 'custom',
    icon: 'image',
    title: 'Personalizzazione',
    tutorials: [
      { id:'pe1', title: 'Personalizzare la vetrina', desc: 'Logo, colori, foto di copertina e descrizione.', mins: 8, read: 5 },
      { id:'pe2', title: 'Promozioni e codici sconto', desc: 'Crea promo a tempo che appaiono in vetrina.', mins: 6, read: 4 },
      { id:'pe3', title: 'Notifiche ai clienti', desc: 'Comunicazioni push e email automatizzate.', mins: 5, read: 3 },
    ],
  },
  {
    id: 'sala',
    icon: 'table',
    title: 'Gestione sala e tavoli',
    tutorials: [
      { id:'s1', title: 'Configurare la pianta della sala', desc: 'Disegna sale e tavoli con capienza.', mins: 10, read: 7 },
      { id:'s2', title: 'Calendario prenotazioni', desc: 'Imposta slot, capacità e regole per i clienti senza prenotazione.', mins: 8, read: 5 },
      { id:'s3', title: 'QR code per tavolo', desc: 'Stampa i QR code unici per ogni tavolo.', mins: 4, read: 3 },
    ],
  },
  {
    id: 'stats',
    icon: 'stats',
    title: 'Analytics e reportistica',
    tutorials: [
      { id:'st1', title: 'Dashboard panoramica', desc: 'Personalizza i widget della tua dashboard.', mins: 7, read: 4 },
      { id:'st2', title: 'Esportare i report', desc: 'CSV, PDF e integrazioni con Google Sheets.', mins: 5, read: 3 },
      { id:'st3', title: 'Previsioni AI', desc: 'Sfrutta i suggerimenti AI di byup.', mins: 9, read: 6 },
    ],
  },
  {
    id: 'integ',
    icon: 'plug',
    title: 'Integrazioni',
    tutorials: [
      { id:'i1', title: 'Incassare con Tap to Pay', desc: 'Lo smartphone dello staff diventa terminale con l\'App Staff POS.', mins: 8, read: 5 },
      { id:'i2', title: 'Delivery di terze parti', desc: 'Collega le app di delivery al gestionale (add-on 10€ + IVA).', mins: 6, read: 4 },
      { id:'i3', title: 'API e automazioni', desc: 'Zapier, Google, Claude e ChatGPT (add-on 22,90€ + IVA).', mins: 7, read: 5 },
    ],
  },
];

const SUP_FAQS = [
  { id:'f1', cat:'account', q:'Come resetto la password?', a:'Vai in Account → Password e sicurezza → Cambia password. Se non ricordi la password attuale, usa "Password dimenticata?" nella schermata di login: riceverai un link via email entro 2 minuti.' },
  { id:'f2', cat:'pagamenti', q:'Quali metodi di pagamento posso accettare?', a:'Tutti i pagamenti sono gestiti da Stripe: carte (Visa, Mastercard, Amex), Apple Pay e Google Pay. In presenza incassi con lo smartphone grazie a Tap to Pay (App Staff POS), dal tavolo i clienti pagano direttamente dalla Byup App con la carta salvata. byup non vede né conserva mai i dati delle carte: restano nel perimetro sicuro di Stripe.' },
  { id:'f3', cat:'account', q:'Come aggiungo membri del mio staff?', a:'Vai in Account → Staff e clicca "Invita membro". Scegli il ruolo (Admin, Cuoco, Cameriere, Sola lettura) e invia l\'invito via email. Il nuovo membro avrà accesso solo alle sezioni concesse dal suo ruolo.' },
  { id:'f4', cat:'generale', q:'Posso gestire più locali con un solo account?', a:'Sì: ogni locale ha la sua vetrina pubblica, il suo menù e le sue statistiche. Dal tuo account puoi creare un nuovo locale oppure collegarne uno già presente su byup inviando una richiesta al proprietario.' },
  { id:'f5', cat:'menu', q:'Come funziona il sistema di prenotazioni?', a:'Le prenotazioni arrivano in tempo reale dalla vetrina e dall\'app cliente. Le vedi in Sala & Prenotazioni → Calendario, e puoi confermare/rifiutare entro 30 minuti. byup invia automaticamente promemoria 24h e 2h prima al cliente.' },
  { id:'f6', cat:'pagamenti', q:'Quali sono i costi di commissione?', a:'byup non prende commissioni percentuali sugli ordini. Ogni piano include un numero di ordini al mese: 550 (Gratuito), 1.850 (Starter), 7.500 (Plus), 15.000 (Business). Oltre la soglia paghi solo l\'ordine extra: 0,45 / 0,34 / 0,23 / 0,12 € + IVA a seconda del piano. Gli ordini fatti dai clienti tramite app contano 0,5: più i clienti ordinano da soli, meno paghi. Sui pagamenti resta solo la commissione standard di Stripe.' },
  { id:'f7', cat:'menu', q:'Come modifico il menù del ristorante?', a:'Vai in Cucina → Menù. Puoi aggiungere/modificare/disattivare piatti in tempo reale. Le modifiche sono visibili in vetrina entro 30 secondi.' },
  { id:'f8', cat:'tecnico', q:'Come esporto i report delle vendite?', a:'In Statistiche → tasto Esporta in alto a destra. Puoi scegliere il periodo, il formato (CSV, PDF, XLSX) e le metriche da includere. Il file viene generato in 1-2 minuti e ti arriva via email.' },
  { id:'f9', cat:'tecnico', q:'La connessione del locale è instabile, cosa faccio?', a:'byup è interamente cloud: per ordini e incassi serve una connessione attiva. Se la linea del locale è debole, la soluzione consigliata è un hotspot 4G/5G dedicato. Non c\'è nulla da installare o sincronizzare in locale: i tuoi dati sono sempre al sicuro sui server.' },
  { id:'f10', cat:'tecnico', q:'Serve hardware dedicato (POS, stampanti)?', a:'No. Lo smartphone del personale è il terminale di pagamento (Tap to Pay), la cucina lavora da browser su tablet o monitor, e il gestionale gira su qualsiasi dispositivo con un browser. L\'unica stampa prevista è lo scontrino di cortesia, via Wi-Fi, browser o Bluetooth.' },
  { id:'f11', cat:'generale', q:'I miei clienti devono scaricare un\'app per ordinare?', a:'No: inquadrando il QR sul tavolo si apre la webapp e si ordina senza registrazione. Il pagamento dal tavolo però è esclusivo della Byup App. Conviene anche a te: gli ordini fatti dall\'app contano 0,5 nel conteggio del tuo piano.' },
];

const SUP_FAQ_TABS = [
  { id:'all', label:'Tutti' },
  { id:'generale', label:'Generale' },
  { id:'pagamenti', label:'Pagamenti' },
  { id:'menu', label:'Menù' },
  { id:'tecnico', label:'Tecnico' },
  { id:'account', label:'Account' },
];

window.SUP_TUTORIAL_CATS = SUP_TUTORIAL_CATS;
window.SUP_VIDEO_DEMO = SUP_VIDEO_DEMO;
window.SUP_FAQS = SUP_FAQS;
window.SUP_FAQ_TABS = SUP_FAQ_TABS;

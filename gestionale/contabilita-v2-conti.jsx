// Tab Conti v2 — gestione conti aperti e saldati, integrazione con sala

// Mock data: 20 conti — mix di non saldati (parziali, scoperti, in attesa) e saldati (carta/contanti, con e senza rimborso)
const CONTI_MOCK = [
  // ─── Non saldati ───────────────────────────────────────────────
  { id:'cnt-1',  idOrdine:'#2511-0042', dataOra:'2025-11-15 19:42', tavolo:'Tavolo 4',  cliente:'Mario Rossi',       riferimento:{nome:'Mario Rossi', tipo:'byup'}, liberatoOre:5.5,  totaleConto:85.00,   daSaldare:45.00,  stato:'non_saldato', note:'Ospiti morbidi', operatore:'Marco',
    ordini: [{id:'o1-1',nome:'Tagliere salumi',qty:2,prezzo:13.00},{id:'o1-2',nome:'Pasta amatriciana',qty:2,prezzo:14.00},{id:'o1-3',nome:'Birra artigianale',qty:3,prezzo:6.00},{id:'o1-4',nome:'Acqua minerale',qty:2,prezzo:2.50},{id:'o1-5',nome:'Tiramisù',qty:1,prezzo:6.50},{id:'o1-6',nome:'Caffè',qty:1,prezzo:1.50}],
    payments: [{id:'p1a', method:'contanti', amount:40.00, ora:'2025-11-15 19:55', scontrinoNum:'SC-2511-0042-1', fisc:{ esito:'ritrasmissione', tentativo: 3, prossimo:'15:10' }}] },
  { id:'cnt-3',  idOrdine:'#2511-0040', dataOra:'2025-11-15 22:30', tavolo:'Asporto', canale:'asporto', cliente:'Simone De Luca',    liberatoOre:2.0,  totaleConto:64.50,   daSaldare:64.50,  stato:'non_saldato', note:'Allergeni richiesti', operatore:'Marco',
    ordini: [{id:'o3-1',nome:'Pizza Margherita',qty:1,prezzo:9.00},{id:'o3-2',nome:'Pizza Diavola',qty:1,prezzo:11.00},{id:'o3-3',nome:'Pizza Quattro stagioni',qty:1,prezzo:12.00},{id:'o3-4',nome:'Birra media',qty:2,prezzo:5.50},{id:'o3-5',nome:'Supplì (4pz)',qty:1,prezzo:7.00},{id:'o3-6',nome:'Tiramisù',qty:1,prezzo:5.50},{id:'o3-7',nome:'Acqua minerale',qty:2,prezzo:2.50},{id:'o3-8',nome:'Patatine fritte',qty:1,prezzo:4.00}],
    payments: [] },
  { id:'cnt-11', idOrdine:'#2511-0036', dataOra:'2025-11-14 21:45', tavolo:'Tavolo 10', cliente:'Roberto Esposito',  liberatoOre:18,   totaleConto:128.00,  daSaldare:128.00, stato:'non_saldato', note:'Cliente uscito senza pagare', operatore:'Giulia',
    ordini: [{id:'o11-1',nome:'Antipasto misto',qty:3,prezzo:11.00},{id:'o11-2',nome:'Risotto ai funghi',qty:2,prezzo:16.00},{id:'o11-3',nome:'Tagliata di manzo',qty:1,prezzo:24.00},{id:'o11-4',nome:'Vino al bicchiere',qty:3,prezzo:7.00},{id:'o11-5',nome:'Acqua minerale',qty:2,prezzo:3.00},{id:'o11-6',nome:'Caffè',qty:3,prezzo:1.50},{id:'o11-7',nome:'Dolce del giorno',qty:1,prezzo:7.50}],
    payments: [] },
  { id:'cnt-20', idOrdine:'#2511-0046', dataOra:'2025-11-16 13:45', tavolo:'Tavolo 12', cliente:'Compleanno Russo (8 ospiti)', riferimento:{nome:'Giulia Russo', tipo:'prenotazione'}, liberatoOre:0.5, totaleConto:312.00, daSaldare:42.00, stato:'non_saldato', note:'Conto diviso', operatore:'Marco',
    ordini: [{id:'o20-1',nome:'Servizio',qty:8,prezzo:2.00},{id:'o20-2',nome:'Antipasto misto',qty:8,prezzo:12.00},{id:'o20-3',nome:'Pasta alla norma',qty:4,prezzo:13.00},{id:'o20-4',nome:'Pasta al ragù',qty:4,prezzo:13.00},{id:'o20-5',nome:'Secondo del giorno',qty:2,prezzo:22.00},{id:'o20-6',nome:'Bottiglia vino rosso',qty:2,prezzo:18.00},{id:'o20-7',nome:'Acqua minerale',qty:8,prezzo:2.00}],
    // D-20 nei dati: ogni documento è una quota di saldo e conosce le SUE
    // righe (`righe`, somma esatta all'importo) — il pagamento misto non
    // esiste. `conto.ordini` resta l'insieme del tavolo.
    payments: [
      {id:'p20a', method:'byup',     amount:45.00, ora:'2025-11-16 14:05', scontrinoNum:'SC-2511-0046-1',
        righe:[{id:'q20a-1',nome:'Antipasto misto',qty:1,prezzo:12.00},{id:'q20a-2',nome:'Pasta alla norma',qty:1,prezzo:13.00},{id:'q20a-3',nome:'Bottiglia vino rosso',qty:1,prezzo:18.00},{id:'q20a-4',nome:'Servizio',qty:1,prezzo:2.00}],
        // P-89: un reso di oggi, dentro le 48 ore dell'esibizione — documento
        // trasmesso a sua volta, con esito proprio.
        rett: { resi: [{ amount:12.00, porzioni:['q20a-1#0'], ora:'2025-11-16 15:30', motivo:'Antipasto non servito', fisc:{ esito:'ok' } }] }},
      {id:'p20b', method:'byup',     amount:45.00, ora:'2025-11-16 14:06', scontrinoNum:'SC-2511-0046-2',
        righe:[{id:'q20b-1',nome:'Antipasto misto',qty:1,prezzo:12.00},{id:'q20b-2',nome:'Pasta al ragù',qty:1,prezzo:13.00},{id:'q20b-3',nome:'Bottiglia vino rosso',qty:1,prezzo:18.00},{id:'q20b-4',nome:'Servizio',qty:1,prezzo:2.00}],
        // P-89: l'annullo di oggi — unico, totale, a documento intatto — con
        // il suo esito di trasmissione; quello di cnt-6 resta come storia.
        rett: { annullo: { amount:45.00, ora:'2025-11-16 15:40', motivo:'Quota battuta sul conto sbagliato', fisc:{ esito:'ok' } } }},
      // Conto diviso: uno dei documenti è stato scartato, gli altri no.
      // Lo stato sta QUI, sul pagamento: il conto non ne ha uno suo.
      {id:'p20c', method:'carta',    amount:90.00, ora:'2025-11-16 14:09', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0046-3', fisc:{ scarto:'aliquota', tentativi: 3 },
        righe:[{id:'q20c-1',nome:'Secondo del giorno',qty:1,prezzo:22.00},{id:'q20c-2',nome:'Antipasto misto',qty:3,prezzo:12.00},{id:'q20c-3',nome:'Pasta al ragù',qty:2,prezzo:13.00},{id:'q20c-4',nome:'Servizio',qty:2,prezzo:2.00},{id:'q20c-5',nome:'Acqua minerale',qty:1,prezzo:2.00}]},
      {id:'p20d', method:'contanti', amount:50.00, ora:'2025-11-16 14:11', scontrinoNum:'SC-2511-0046-4',
        righe:[{id:'q20d-1',nome:'Secondo del giorno',qty:1,prezzo:22.00},{id:'q20d-2',nome:'Pasta alla norma',qty:2,prezzo:13.00},{id:'q20d-3',nome:'Acqua minerale',qty:1,prezzo:2.00}]},
      {id:'p20e', method:'carta',    amount:40.00, ora:'2025-11-16 14:13', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0046-5',
        righe:[{id:'q20e-1',nome:'Antipasto misto',qty:1,prezzo:12.00},{id:'q20e-2',nome:'Pasta alla norma',qty:1,prezzo:13.00},{id:'q20e-3',nome:'Pasta al ragù',qty:1,prezzo:13.00},{id:'q20e-4',nome:'Acqua minerale',qty:1,prezzo:2.00}]},
    ] },

  // ─── Saldati ───────────────────────────────────────────────────
  // Incassato sul bordo della finestra di divieto (P-100): il canale l'aveva
  // già in mano alle 23:55 e l'ha accodato al giorno nuovo — stato waiting,
  // che docInfo mostra solo mentre la finestra è attiva (vera, o simulata con
  // ?notte=1). A mezzanotte parte davvero e torna un trasmesso qualunque.
  { id:'cnt-24', idOrdine:'#2511-0047', dataOra:'2025-11-16 23:38', tavolo:'Tavolo 2',  cliente:'Ultimo tavolo Ferri', liberatoOre:0.1, totaleConto:54.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p24a', method:'carta', amount:54.00, ora:'2025-11-16 23:54', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0047-1', fisc:{ esito:'waiting' }}] },
  { id:'cnt-5',  idOrdine:'#2511-0038', dataOra:'2025-11-13 20:30', tavolo:'Tavolo 1',  cliente:'Lucia Marchesi',    riferimento:{nome:'Lucia Marchesi', tipo:'byup'}, liberatoOre:48,    totaleConto:72.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p5a', method:'carta', amount:72.00, ora:'2025-11-13 21:15', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0038-1', fisc:{ scarto:'delega', tentativi: 3 }}] },
  { id:'cnt-6',  idOrdine:'#2511-0037', dataOra:'2025-11-08 21:00', tavolo:'Tavolo 3',  cliente:'Francesco Rossi',   liberatoOre:168,   totaleConto:95.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    // P-89: un annullo seminato — unico, totale, a documento intatto (P-17) —
    // col suo esito di trasmissione: il documento di annullo è trasmesso a sua
    // volta, e in esibizione ha identificativo ed esito propri.
    payments: [{id:'p6a', method:'contanti', amount:95.50, ora:'2025-11-08 21:45', scontrinoNum:'SC-2511-0037-1',
      rett: { annullo: { amount:95.50, ora:'2025-11-09 10:20', motivo:'Documento emesso per errore', fisc:{ esito:'ok' } } }}] },
  { id:'cnt-13', idOrdine:'#2511-0035', dataOra:'2025-11-13 13:15', tavolo:'Tavolo 4',  cliente:'Pellegrini',        liberatoOre:60,    totaleConto:64.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    // Unico conto saldato a pagamento singolo con righe: il reso — a
    // differenza dell'annullo — ha bisogno di sapere COSA si sta restituendo,
    // e lo scontrino non è itemizzato quando il conto si divide su più
    // pagamenti (le righe condivise finirebbero rese due volte).
    // Porta anche uno scarto SdI: è il conto su cui si vedono insieme le due
    // cose che possono capitare a un pagamento — un reso e un documento che
    // non è passato.
    ordini: [{id:'o13-1',nome:'Cotoletta alla milanese',qty:2,prezzo:18.00},{id:'o13-2',nome:'Patate al forno',qty:2,prezzo:5.00},{id:'o13-3',nome:'Vino al bicchiere',qty:2,prezzo:7.00},{id:'o13-4',nome:'Acqua minerale',qty:2,prezzo:2.00}],
    payments: [{id:'p13a', method:'carta', amount:64.00, ora:'2025-11-13 13:55', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0035-1', fisc:{ scarto:'dispositivo', tentativi: 2 }}] },
  { id:'cnt-14', idOrdine:'#2511-0034', dataOra:'2025-11-12 20:00', tavolo:'Tavolo 8',  cliente:'Carlo Russo',       liberatoOre:84,    totaleConto:215.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [
      {id:'p14a', method:'carta', amount:150.00, ora:'2025-11-12 22:30', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0034-1',
        righe:[{id:'q14a-1',nome:'Bistecca fiorentina',qty:1,prezzo:62.00},{id:'q14a-2',nome:'Bottiglia Barolo',qty:1,prezzo:48.00},{id:'q14a-3',nome:'Tagliere misto',qty:1,prezzo:14.00},{id:'q14a-4',nome:'Patate al forno',qty:2,prezzo:5.00},{id:'q14a-5',nome:'Acqua minerale',qty:2,prezzo:3.00},{id:'q14a-6',nome:'Dolce del giorno',qty:2,prezzo:5.00}]},
      {id:'p14b', method:'contanti', amount:65.00, ora:'2025-11-12 22:32', scontrinoNum:'SC-2511-0034-2',
        righe:[{id:'q14b-1',nome:'Branzino al forno',qty:1,prezzo:22.00},{id:'q14b-2',nome:'Antipasto di mare',qty:1,prezzo:14.00},{id:'q14b-3',nome:'Vino al bicchiere',qty:3,prezzo:7.00},{id:'q14b-4',nome:'Caffè',qty:2,prezzo:1.50},{id:'q14b-5',nome:'Sorbetto',qty:1,prezzo:5.00}]},
    ] },
  { id:'cnt-21', idOrdine:'#2511-0029', dataOra:'2025-11-09 20:15', tavolo:'Tavolo 7',  cliente:'Cena aziendale Mele', riferimento:{nome:'Andrea Mele', tipo:'prenotazione'}, liberatoOre:96,  totaleConto:485.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'carta',
    payments: [
      {id:'p21a', method:'byup',     amount:60.00, ora:'2025-11-09 22:40', scontrinoNum:'SC-2511-0029-1',
        righe:[{id:'q21a-1',nome:'Menu degustazione',qty:1,prezzo:48.00},{id:'q21a-2',nome:'Calice abbinato',qty:1,prezzo:9.00},{id:'q21a-3',nome:'Acqua minerale',qty:1,prezzo:3.00}]},
      {id:'p21b', method:'byup',     amount:60.00, ora:'2025-11-09 22:41', scontrinoNum:'SC-2511-0029-2',
        righe:[{id:'q21b-1',nome:'Menu degustazione',qty:1,prezzo:48.00},{id:'q21b-2',nome:'Calice abbinato',qty:1,prezzo:9.00},{id:'q21b-3',nome:'Acqua minerale',qty:1,prezzo:3.00}]},
      {id:'p21c', method:'byup',     amount:60.00, ora:'2025-11-09 22:42', scontrinoNum:'SC-2511-0029-3',
        righe:[{id:'q21c-1',nome:'Menu degustazione',qty:1,prezzo:48.00},{id:'q21c-2',nome:'Calice abbinato',qty:1,prezzo:9.00},{id:'q21c-3',nome:'Acqua minerale',qty:1,prezzo:3.00}]},
      {id:'p21d', method:'carta',    amount:200.00, ora:'2025-11-09 22:48', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0029-4', fisc:{ esito:'ritrasmissione', tentativo: 2, prossimo:'14:30' },
        righe:[{id:'q21d-1',nome:'Menu degustazione',qty:3,prezzo:48.00},{id:'q21d-2',nome:'Bottiglia Franciacorta',qty:1,prezzo:38.00},{id:'q21d-3',nome:'Calice abbinato',qty:2,prezzo:9.00}]},
      {id:'p21e', method:'contanti', amount:80.00, ora:'2025-11-09 22:50', scontrinoNum:'SC-2511-0029-5',
        righe:[{id:'q21e-1',nome:'Menu degustazione',qty:1,prezzo:48.00},{id:'q21e-2',nome:'Calice abbinato',qty:2,prezzo:9.00},{id:'q21e-3',nome:'Dolce al carrello',qty:2,prezzo:7.00}]},
      {id:'p21f', method:'carta',    amount:25.00, ora:'2025-11-09 22:52', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0029-6',
        righe:[{id:'q21f-1',nome:'Calice abbinato',qty:1,prezzo:9.00},{id:'q21f-2',nome:'Dolce al carrello',qty:1,prezzo:7.00},{id:'q21f-3',nome:'Caffè',qty:6,prezzo:1.50}]},
    ] },
  { id:'cnt-22', idOrdine:'#2511-0027', dataOra:'2025-11-08 13:00', tavolo:'Tavolo 5',  cliente:'Pranzo team',         liberatoOre:144,  totaleConto:156.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'byup',
    payments: [
      {id:'p22a', method:'byup', amount:35.00, ora:'2025-11-08 14:20', scontrinoNum:'SC-2511-0027-1',
        righe:[{id:'q22a-1',nome:'Poke del giorno',qty:1,prezzo:14.00},{id:'q22a-2',nome:'Club sandwich',qty:1,prezzo:12.00},{id:'q22a-3',nome:'Spremuta',qty:1,prezzo:5.00},{id:'q22a-4',nome:'Caffè',qty:2,prezzo:2.00}]},
      {id:'p22b', method:'byup', amount:42.00, ora:'2025-11-08 14:21', scontrinoNum:'SC-2511-0027-2', fisc:{ scarto:'dispositivo', tentativi: 2, gestito:{ come:'manuale', nota:'POS abbinato in Impostazioni e documento ritrasmesso.' } },
        righe:[{id:'q22b-1',nome:'Tagliata light',qty:1,prezzo:19.00},{id:'q22b-2',nome:'Poke del giorno',qty:1,prezzo:14.00},{id:'q22b-3',nome:'Acqua minerale',qty:1,prezzo:3.00},{id:'q22b-4',nome:'Caffè',qty:3,prezzo:2.00}]},
      {id:'p22c', method:'byup', amount:28.00, ora:'2025-11-08 14:22', scontrinoNum:'SC-2511-0027-3',
        righe:[{id:'q22c-1',nome:'Club sandwich',qty:1,prezzo:12.00},{id:'q22c-2',nome:'Insalatona',qty:1,prezzo:11.00},{id:'q22c-3',nome:'Spremuta',qty:1,prezzo:5.00}]},
      {id:'p22d', method:'byup', amount:51.00, ora:'2025-11-08 14:23', scontrinoNum:'SC-2511-0027-4',
        righe:[{id:'q22d-1',nome:'Tagliata light',qty:1,prezzo:19.00},{id:'q22d-2',nome:'Insalatona',qty:1,prezzo:11.00},{id:'q22d-3',nome:'Poke del giorno',qty:1,prezzo:14.00},{id:'q22d-4',nome:'Acqua minerale',qty:1,prezzo:3.00},{id:'q22d-5',nome:'Caffè',qty:2,prezzo:2.00}]},
    ] },
  { id:'cnt-23', idOrdine:'#2511-0025', dataOra:'2025-11-07 21:30', tavolo:'Tavolo 10', cliente:'Tavolata Conti (6 ospiti)', liberatoOre:168, totaleConto:267.00, daSaldare:0.00, stato:'saldato', metodoPagamento:'contanti',
    payments: [
      {id:'p23a', method:'contanti', amount:45.00, ora:'2025-11-07 23:10', scontrinoNum:'SC-2511-0025-1',
        righe:[{id:'q23a-1',nome:'Grigliata di carne',qty:1,prezzo:24.00},{id:'q23a-2',nome:'Contorno del giorno',qty:2,prezzo:4.00},{id:'q23a-3',nome:'Vino al bicchiere',qty:1,prezzo:7.00},{id:'q23a-4',nome:'Acqua minerale',qty:2,prezzo:3.00}]},
      {id:'p23b', method:'contanti', amount:50.00, ora:'2025-11-07 23:11', scontrinoNum:'SC-2511-0025-2',
        righe:[{id:'q23b-1',nome:'Grigliata di carne',qty:1,prezzo:24.00},{id:'q23b-2',nome:'Antipasto della casa',qty:1,prezzo:11.00},{id:'q23b-3',nome:'Vino al bicchiere',qty:1,prezzo:7.00},{id:'q23b-4',nome:'Contorno del giorno',qty:1,prezzo:4.00},{id:'q23b-5',nome:'Dolce della casa',qty:1,prezzo:4.00}]},
      {id:'p23c', method:'byup',     amount:42.00, ora:'2025-11-07 23:14', scontrinoNum:'SC-2511-0025-3', fisc:{ scarto:'aliquota', tentativi: 3, gestito:{ come:'manuale', nota:'Aliquota corretta nel catalogo e documento ritrasmesso a mano.' } },
        righe:[{id:'q23c-1',nome:'Antipasto della casa',qty:2,prezzo:11.00},{id:'q23c-2',nome:'Contorno del giorno',qty:2,prezzo:4.00},{id:'q23c-3',nome:'Vino al bicchiere',qty:1,prezzo:7.00},{id:'q23c-4',nome:'Acqua minerale',qty:1,prezzo:3.00},{id:'q23c-5',nome:'Caffè',qty:1,prezzo:2.00}]},
      {id:'p23d', method:'carta',    amount:75.00, ora:'2025-11-07 23:16', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0025-4',
        righe:[{id:'q23d-1',nome:'Grigliata di carne',qty:2,prezzo:24.00},{id:'q23d-2',nome:'Antipasto della casa',qty:1,prezzo:11.00},{id:'q23d-3',nome:'Vino al bicchiere',qty:2,prezzo:7.00},{id:'q23d-4',nome:'Caffè',qty:1,prezzo:2.00}]},
      {id:'p23e', method:'contanti', amount:55.00, ora:'2025-11-07 23:18', scontrinoNum:'SC-2511-0025-5',
        righe:[{id:'q23e-1',nome:'Grigliata di carne',qty:1,prezzo:24.00},{id:'q23e-2',nome:'Antipasto della casa',qty:1,prezzo:11.00},{id:'q23e-3',nome:'Vino al bicchiere',qty:2,prezzo:7.00},{id:'q23e-4',nome:'Contorno del giorno',qty:1,prezzo:4.00},{id:'q23e-5',nome:'Caffè',qty:1,prezzo:2.00}]},
    ] },
  { id:'cnt-15', idOrdine:'#2511-0033', dataOra:'2025-11-12 13:30', tavolo:'Asporto', canale:'asporto', cliente:'Anna Costa',        riferimento:{nome:'Anna Costa', tipo:'byup'}, liberatoOre:96,    totaleConto:38.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'byup',
    payments: [{id:'p15a', method:'byup', amount:38.50, ora:'2025-11-12 14:10', scontrinoNum:'SC-2511-0033-1'}] },
  { id:'cnt-16', idOrdine:'#2511-0032', dataOra:'2025-11-11 21:30', tavolo:'Tavolo 11', cliente:'Gallo (aziendale)', liberatoOre:120,   totaleConto:340.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    // P-89: scarto gestito DALLA ritrasmissione riuscita, non a mano — il
    // terzo modo di chiudere uno scarto, che nel seme mancava.
    payments: [{id:'p16a', method:'carta', amount:340.00, ora:'2025-11-11 23:00', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2511-0032-1', fisc:{ scarto:'aliquota', tentativi: 2, gestito:{ come:'ritrasmissione', nota:'Ritrasmissione riuscita al secondo tentativo.' } }}] },
  // I due vecchi `conto.rimborso` sono diventati RESI seminati sul pagamento
  // (P-17): erano rimborsi post-emissione — «piatto reso», il giorno dopo —
  // e la voce di conto senza documento duplicava i resi. Il seme non porta il
  // numero di documento: si deriva dal progressivo (-R1) a schermo.
  { id:'cnt-17', idOrdine:'#2511-0030', dataOra:'2025-11-10 12:45', tavolo:'Tavolo 6',  cliente:'Coppia Neri',       riferimento:{nome:'Francesca Neri', tipo:'prenotazione'}, liberatoOre:144,   totaleConto:58.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    ordini: [{id:'o17-1',nome:'Antipasto di mare',qty:1,prezzo:12.00},{id:'o17-2',nome:'Branzino al forno',qty:1,prezzo:22.00},{id:'o17-3',nome:'Vino al bicchiere',qty:2,prezzo:7.00},{id:'o17-4',nome:'Acqua minerale',qty:1,prezzo:3.00},{id:'o17-5',nome:'Dolce della casa',qty:1,prezzo:7.00}],
    payments: [{id:'p17a', method:'carta', amount:58.00, ora:'2025-11-10 13:50', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2511-0030-1',
      rett: { resi: [{ amount:12.00, porzioni:['o17-1#0'], ora:'2025-11-10 14:05', motivo:'Servizio contestato', fisc:{ esito:'ok' } }] }}] },
  { id:'cnt-7',  idOrdine:'#2509-0156', dataOra:'2025-08-17 22:15', tavolo:'Tavolo 6',  cliente:'Paolo Bianchi',     liberatoOre:2160,  totaleConto:110.00,  daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    ordini: [{id:'o7-1',nome:'Pasta allo scoglio',qty:1,prezzo:25.00},{id:'o7-2',nome:'Grigliata mista di pesce',qty:1,prezzo:38.00},{id:'o7-3',nome:'Bottiglia vermentino',qty:1,prezzo:26.00},{id:'o7-4',nome:'Antipasto di mare',qty:1,prezzo:14.00},{id:'o7-5',nome:'Acqua minerale',qty:1,prezzo:3.00},{id:'o7-6',nome:'Caffè',qty:2,prezzo:2.00}],
    payments: [{id:'p7a', method:'carta', amount:110.00, ora:'2025-08-17 22:45', posRef:{nome:'Marco Bianchi', email:'marco.bianchi@delborgo.it', device:'iPhone 14 Pro'}, scontrinoNum:'SC-2509-0156-1',
      rett: { resi: [{ amount:25.00, porzioni:['o7-1#0'], ora:'2025-08-18 10:12', motivo:'Piatto reso: pasta troppo cotta', fisc:{ esito:'ok' } }] }}] },
  { id:'cnt-18', idOrdine:'#2510-0089', dataOra:'2025-10-05 21:00', tavolo:'Asporto', canale:'asporto', cliente:'Sara Mancini',      liberatoOre:1032,  totaleConto:76.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p18a', method:'contanti', amount:76.00, ora:'2025-10-05 21:50', scontrinoNum:'SC-2510-0089-1'}] },
  { id:'cnt-19', idOrdine:'#2509-0143', dataOra:'2025-09-20 13:00', tavolo:'Tavolo 3',  cliente:'Luca Caruso',       liberatoOre:1380,  totaleConto:42.50,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'carta',
    payments: [{id:'p19a', method:'carta', amount:42.50, ora:'2025-09-20 13:55', posRef:{nome:'Laura Rossi', email:'laura.rossi@delborgo.it', device:'Samsung Galaxy S23'}, scontrinoNum:'SC-2509-0143-1'}] },
  { id:'cnt-8',  idOrdine:'#2411-0004', dataOra:'2024-11-14 19:00', tavolo:'Asporto', canale:'asporto', cliente:'Elena Greco',       liberatoOre:8760,  totaleConto:48.00,   daSaldare:0.00,   stato:'saldato', metodoPagamento:'contanti',
    payments: [{id:'p8a', method:'contanti', amount:48.00, ora:'2024-11-14 19:45', scontrinoNum:'SC-2411-0004-1'}] },
];

// Ri-ancoraggio date: il mock è scritto con "oggi" = 16 nov 2025. Trasliamo tutte
// le date (conto, pagamenti, rimborsi) dello scarto con l'oggi reale e rigeneriamo
// i codici ordine/scontrino (#YYMM-…): la storia resta coerente e sempre attuale.
(() => {
  const shiftDays = Math.floor((Date.now() - new Date('2025-11-16T12:00:00').getTime()) / 86400000);
  const shiftStr = (str) => {
    if (!str) return str;
    const [date, time] = str.split(' ');
    const d = new Date(date + 'T' + (time || '12:00') + ':00');
    d.setDate(d.getDate() + shiftDays);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return time ? `${iso} ${time}` : iso;
  };
  CONTI_MOCK.forEach(c => {
    c.dataOra = shiftStr(c.dataOra);
    const code = c.dataOra.slice(2,4) + c.dataOra.slice(5,7);
    c.idOrdine = c.idOrdine.replace(/#\d{4}-/, '#' + code + '-');
    (c.payments || []).forEach(p => {
      p.ora = shiftStr(p.ora);
      if (p.scontrinoNum) p.scontrinoNum = p.scontrinoNum.replace(/SC-\d{4}-/, 'SC-' + code + '-');
      // Anche le rettifiche seminate sul pagamento seguono lo scarto di date.
      if (p.rett) {
        (p.rett.resi || []).forEach(r => { r.ora = shiftStr(r.ora); });
        if (p.rett.annullo) p.rett.annullo.ora = shiftStr(p.rett.annullo.ora);
      }
    });
  });

  // Il conto della finestra di divieto (P-100) è per definizione DI STASERA
  // — ma solo quando la notte demo è accesa (`?notte=1`): allora sta a oggi
  // 23:54 ed è «in attesa di mezzanotte». Fuori dalla demo un documento delle
  // 23:54 di oggi sarebbe nel FUTURO e docInfo lo darebbe per trasmesso: i
  // due ancoraggi (lo scarto del mock e l'oggi vero di P-100) si sommavano
  // così. Riconciliati (P-89): senza demo il conto è di IERI sera, l'ultimo
  // documento della notte scorsa, partito a mezzanotte come tutti gli altri.
  const c24 = CONTI_MOCK.find(x => x.id === 'cnt-24');
  if (c24) {
    const d = new Date();
    if (!(window.byupNotteInfo && window.byupNotteInfo().dentro)) d.setDate(d.getDate() - 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const code = iso.slice(2,4) + iso.slice(5,7);
    c24.dataOra = `${iso} 23:38`;
    c24.idOrdine = '#' + code + '-0047';
    c24.payments[0].ora = `${iso} 23:54`;
    c24.payments[0].scontrinoNum = 'SC-' + code + '-0047-1';
  }
})();

// Gli incassi del banco sono conti come gli altri: la Vendita diretta li tiene
// nella sua forma (ordini in coda, consegnati) e qui entrano tradotti, in cima
// perché sono di oggi. Senza, il rimando "ricevute fiscali associate" dal
// dettaglio di un ordine consegnato porterebbe a una lista che non lo contiene.
// Il push, e non una lista a parte: Cassa, filtri e ricerca leggono tutti da
// qui, e una seconda lista parallela si sarebbe scordata metà di loro.
if (typeof svContiVenditaDiretta === 'function') {
  CONTI_MOCK.unshift(...svContiVenditaDiretta());
}

// ─── Registro delle rettifiche, per DOCUMENTO (P-16/P-17/P-18 · D-20, D-21) ─
// Stesso pattern di byupReadFisc: localStorage + evento — un reso che sparisce
// al ricarico è una finzione. Struttura per pagamento:
//   { annullo?: {amount, doc, ora}, resi: [{amount, porzioni:[id], doc, ora, motivo?}] }
// Le `porzioni` sono id derivati `rigaId#k`: nel modello vero quantity non
// esiste più — le porzioni si contano, un contatore memorizzato è una seconda
// verità — quindi l'esplosione a schermo è lo spirito dell'ERD, non un trucco.
const BYUP_RETT_KEY = 'byup_rett_documenti';
window.byupReadRett = function () {
  try { const s = localStorage.getItem(BYUP_RETT_KEY); return s ? JSON.parse(s) : {}; }
  catch (e) { return {}; }
};
window.byupWriteRett = function (v) {
  try { localStorage.setItem(BYUP_RETT_KEY, JSON.stringify(v)); } catch (e) {}
  window.dispatchEvent(new Event('byup-rett-change'));
};

// Lo stato effettivo delle rettifiche di un documento: il seme del mock
// (p.rett) più quello che l'operatore ha fatto qui. I resi si accumulano fino
// a concorrenza del totale; l'annullo — unico e totale, solo a documento
// intatto — chiude tutto.
function rettDi(p) {
  const salvato = window.byupReadRett()[p.id] || {};
  const seme = p.rett || {};
  const resi = [...(seme.resi || []), ...(salvato.resi || [])];
  const annullo = salvato.annullo || seme.annullo || null;
  if (!annullo && resi.length === 0) return null;
  const resoTot = Math.round(resi.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  return {
    annullo, resi, resoTot,
    residuo: Math.max(0, Math.round((p.amount - resoTot) * 100) / 100),
    porzioniRese: new Set(resi.flatMap(r => r.porzioni || [])),
  };
}
// Il documento di reso prende il progressivo: -R1, -R2… Il seme non porta un
// doc scritto a mano (il numero scontrino viene ri-ancorato a runtime), quindi
// il nome si deriva sempre dal documento com'è ADESSO.
const rettDocReso = (p, indice) => `${p.scontrinoNum}-R${indice + 1}`;
const rettDocAnnullo = (p) => `${p.scontrinoNum}-A`;
// P-89: nel regime attuale il documento di reso o annullo è a sua volta
// trasmesso, con esito e identificativo PROPRI. Nel mock l'esito sta nel seme
// (`fisc.esito`, di norma ok) e l'identificativo si deriva da quello del
// documento madre col progressivo — dichiarato come identificativo del
// canale, com'è quello del padre.
const rettFisc = (p, r, indice, annullo) => {
  const base = typeof docInfo === 'function' ? docInfo(p) : { idTrasm: null };
  const esito = (r && r.fisc && r.fisc.esito) || 'ok';
  const suffisso = annullo ? '-A' : `-R${indice + 1}`;
  return { esito, idTrasm: esito === 'ok' && base.idTrasm ? base.idTrasm + suffisso : null };
};
window.rettDi = rettDi;
window.rettDocReso = rettDocReso;
window.rettDocAnnullo = rettDocAnnullo;
window.rettFisc = rettFisc;

// I pagamenti sono i documenti commerciali: Cassa ci deriva le chiusure di
// giornata, quindi la lista deve essere raggiungibile da lì.
window.CONTI_MOCK = CONTI_MOCK;

// Format "2025-11-15 19:42" → "15 nov · 19:42"
function fmtDataOra(s) {
  if (!s) return '—';
  const [date, time] = s.split(' ');
  const [y, m, d] = date.split('-');
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  const mese = mesi[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} ${mese} · ${time}`;
}

// Format "2025-11-15 19:42" → "15 nov" (solo data)
function fmtData(s) {
  if (!s) return '—';
  const [date] = s.split(' ');
  const [y, m, d] = date.split('-');
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  const mese = mesi[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} ${mese}`;
}

// Format "2025-11-15 19:42" → "19:42" (solo ora)
function fmtOra(s) {
  if (!s) return '—';
  const [, time] = s.split(' ');
  return time || '—';
}

// Ora di chiusura del conto = ora dell'ultimo pagamento (quando è stato saldato).
// Conti ancora aperti (non saldati) non hanno ora di chiusura.
function oraChiusura(conto) {
  if (conto.stato !== 'saldato') return '—';
  const ps = conto.payments || [];
  if (!ps.length) return '—';
  return fmtOra(ps[ps.length - 1].ora);
}

// Logo Byup inline — gradiente brand col MARCHIO byup (stesso trattamento
// degli avatar app in sala e dei badge del calendario).
// Segnala che il riferimento è un utente loggato sulla Byup App.
function ByupMark({ size = 16 }) {
  return (
    <span title="Utente Byup App" style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width: size, height: size, borderRadius:'50%', flexShrink:0,
      background: 'linear-gradient(135deg, #FF5A5F, #B53338)',
    }}><PnI.MarkWhite size={Math.round(size * 0.6)}/></span>
  );
}

// ─── Stato di trasmissione del documento nato dal pagamento ───────────────
// Il chip vive sulla riga del pagamento perché è lì che il documento nasce:
// un conto diviso in tre pagamenti ha tre scontrini e tre esiti distinti.
function PagamentoFiscChip({ payment, onOpen }) {
  const info = docInfo(payment);
  const apribile = !!info.scarto;
  const pill = <FiscPill tipo={info.tipo} label={DOC_LABEL[info.tipo]}/>;
  const sotto = info.tipo === 'ritrasmissione' ? (
    <span style={{color: PN.MUTED, whiteSpace:'nowrap'}}>
      tentativo {info.tentativo} di 5 · prossimo alle {info.prossimo}
      <span title="Il piano dei tentativi è la politica di ritrasmissione di Byup, non un esito del canale"> · politica Byup</span>
    </span>
  ) : info.tipo === 'waiting' ? (
    // Accodato dal canale nella finestra di divieto: nessun id AE da mostrare
    // — non è ancora partito — e la giornata fiscale sarà quella di domani.
    <span style={{color: PN.MUTED, whiteSpace:'nowrap'}}>
      parte alle 00:00 · giornata fiscale di domani
    </span>
  ) : null;
  if (!apribile) {
    return (
      <span title={info.idTrasm ? `Identificativo del canale ${info.idTrasm}` : undefined}
        style={{display:'inline-flex', alignItems:'center', gap: 8}}>{pill}{sotto}</span>
    );
  }
  return (
    <button onClick={onOpen} title="Apri il dettaglio dello scarto"
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
      style={{
        display:'inline-flex', alignItems:'center', gap: 8,
        background:'transparent', border:'none', padding: 0,
        cursor:'pointer', fontFamily:'inherit', fontSize: C.T_XS,
        transition:'filter 140ms ease',
      }}>{pill}{sotto}</button>
  );
}

// ─── Dettaglio dello scarto di un documento ────────────────────────────────
// Stesso scheletro delle modali della sezione (ContNuovoCosto): overlay velato
// ancorato al <main>, foglio bianco pieno, header con badge icona. Riguarda UN
// pagamento: gli altri dello stesso conto restano quelli che erano.
function DocScartoSheet({ conto, payment, onClose }) {
  useFiscTick();
  const info = docInfo(payment);
  const sc = info.scarto;
  const chiuso = !!info.gestito;
  const [nota, setNota] = React.useState(() => info.nota || '');

  // "Aperto il …" si scrive solo finché lo scarto è vivo: segnarlo su uno già
  // chiuso metterebbe nel log un evento successivo alla gestione.
  React.useEffect(() => { if (!chiuso) window.byupFiscVisto(payment.id); }, [payment.id, chiuso]);

  // Il log in ordine di accadimento — ordinato sui timestamp, non sull'ordine
  // in cui capita di costruirlo.
  const passi = [
    { txt:'Scarto rilevato', t: sc.rilevato },
    info.visto && { txt:'Aperto', t: info.visto },
    info.ritento && { txt:`Ritrasmissione avviata · tentativo ${info.ritento.tentativo} di 5`, t: info.ritento.quando },
    info.gestito && { txt: info.gestito.come === 'ritrasmissione' ? 'Gestito · ritrasmissione riuscita' : 'Gestito', t: info.gestito.quando },
  ].filter(Boolean).sort((a, b) => fiscOrdine(a.t).localeCompare(fiscOrdine(b.t)));

  const Blocco = ({ titolo, children }) => (
    <div style={{marginTop: 18}}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: PN.MUTED,
        textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
      }}>{titolo}</div>
      <div style={{fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.55}}>{children}</div>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      zIndex: 60, display:'grid', placeItems:'center', padding: 28,
      animation:'scartoFade 0.16s ease',
    }}>
      <style>{`
        @keyframes scartoFade { from {opacity: 0;} to {opacity: 1;} }
        @keyframes scartoPop {
          from {opacity: 0; transform: scale(0.965) translateY(10px);}
          to   {opacity: 1; transform: none;}
        }
        .cont-scarto-sheet textarea:focus {
          border-color: ${PN.PINK};
          box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.14);
        }
      `}</style>
      <div className="cont-scarto-sheet" onClick={e => e.stopPropagation()} style={{
        width: 640, maxWidth:'100%', maxHeight:'100%', background: PN.WHITE,
        borderRadius: 22, border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24), 0 2px 6px rgba(15,17,21,0.08)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'scartoPop 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding:'20px 26px 18px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
            <div style={{
              width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
              background: chiuso ? C.SURF_ALT : '#FEE2E2',
              color: chiuso ? PN.MUTED : '#991B1B',
              display:'grid', placeItems:'center', boxShadow: PN.INSET_HIGHLIGHT,
            }}>{chiuso ? <Ic.check size={20}/> : <Ic.warn size={19}/>}</div>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>
                {chiuso ? 'Scarto gestito' : 'Documento scartato'}
              </div>
              <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2, fontVariantNumeric:'tabular-nums'}}>
                {payment.scontrinoNum} · {fiscTs(payment.ora)} · € {payment.amount.toFixed(2)}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
              background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer',
              display:'flex', padding: 8, borderRadius: 10,
              transition:'background 130ms ease, color 130ms ease, transform 120ms ease',
            }}><Ic.close size={17}/></button>
        </div>

        <div className="pn-scroll" style={{padding:'20px 26px 22px', overflowY:'auto'}}>
          <div style={{
            padding:'14px 16px', borderRadius: C.R_MD,
            background: chiuso ? C.SURF : PN.PINK_BG_SOFT,
            border: `1px solid ${chiuso ? PN.BORDER_SOFT : '#FFD9D7'}`,
            fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT, lineHeight: 1.4,
          }}>{sc.motivo}</div>

          <Blocco titolo="Causa probabile · lettura Byup del codice del canale">{sc.causa}</Blocco>

          <Blocco titolo="Cosa fare">
            {sc.azione}
            <div style={{marginTop: 10}}>
              <button onClick={() => { window.location.href = sc.vaiHref; }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = PN.WHITE; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_HAIR; e.currentTarget.style.background = PN.WHITE_HUSH; }}
                style={{
                  display:'inline-flex', alignItems:'center', gap: 7,
                  padding:'8px 13px', borderRadius: C.R_SM,
                  background: PN.WHITE_HUSH, border: `1px solid ${PN.BORDER_HAIR}`,
                  boxShadow:'inset 0 1px 1px rgba(15,17,21,0.04)',
                  fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
                  cursor:'pointer', fontFamily:'inherit',
                  transition:'border-color 150ms, background 150ms',
                }}>
                {sc.vaiLabel}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED}}><path d="M7 17 17 7M8 7h9v9"/></svg>
              </button>
            </div>
          </Blocco>

          {chiuso ? (
            info.gestito.nota && <Blocco titolo="Nota">{info.gestito.nota}</Blocco>
          ) : (
            <div style={{marginTop: 18}}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: PN.MUTED,
                textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
              }}>Nota (facoltativa)</div>
              <textarea value={nota} onChange={e => setNota(e.target.value)}
                placeholder="Cosa hai fatto per sistemarlo — resta nel log del documento"
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding:'11px 13px', border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                  fontSize: C.T_SM, fontFamily:'inherit', color: PN.TEXT,
                  outline:'none', resize:'vertical', minHeight: 78,
                  transition:'border-color 130ms ease, box-shadow 150ms ease',
                }}/>
            </div>
          )}

          <Blocco titolo="Cos'è successo">
            <div style={{position:'relative', paddingLeft: 2}}>
              {passi.map((p, i) => (
                <div key={i} style={{display:'flex', gap: 10, position:'relative', paddingBottom: i === passi.length - 1 ? 0 : 12}}>
                  {i < passi.length - 1 && (
                    <span style={{position:'absolute', left: 4.5, top: 14, bottom: -2, borderLeft:`1.5px dashed ${PN.BORDER}`}}/>
                  )}
                  <span style={{
                    width: 10, height: 10, borderRadius:'50%', flexShrink: 0, marginTop: 5,
                    background: PN.WHITE, position:'relative', zIndex: 1,
                    boxShadow: `inset 0 0 0 2px ${i === passi.length - 1 && chiuso ? PN.GREEN : (i === 0 ? '#991B1B' : 'rgba(15,17,21,0.22)')}`,
                  }}/>
                  <div style={{fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.5, minWidth: 0}}>
                    {p.txt} il <span style={{fontVariantNumeric:'tabular-nums', color: PN.MUTED}}>{p.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </Blocco>

          <div style={{fontSize: C.T_XS, color: PN.MUTED_SOFT, marginTop: 16, lineHeight: 1.5}}>
            Lo scarto riguarda solo questo documento: gli altri pagamenti del conto {conto.idOrdine} sono stati trasmessi regolarmente.
          </div>
        </div>

        {!chiuso && (
          <div style={{
            padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
            background: PN.WHITE_OFF,
            display:'flex', alignItems:'center', gap: 10,
          }}>
            <div style={{flex: 1, fontSize: C.T_XS, color: PN.MUTED_SOFT}}>
              Finché lo scarto è aperto resta segnalato in Contabilità.
            </div>
            <button onClick={() => { window.byupFiscSegnaGestita(payment.id, nota); onClose(); }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}
              style={{
                padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 6,
                transition:'background 130ms ease, border-color 130ms ease, transform 120ms ease',
              }}><Ic.check size={14}/> Segna come gestito</button>
            <button onClick={() => { window.byupFiscRiprova(payment.id, nota); onClose(); }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 90, 95, 0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}
              style={{
                padding:'10px 22px', background: PN.PINK, color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap: 6,
                transition:'filter 130ms ease, box-shadow 150ms ease, transform 120ms ease',
              }}><Ic.recurring size={13}/> Riprova ora</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dettaglio del conto ───────────────────────────────────────────────────
// Prima la riga si apriva in un pannello sotto e la tabella si spezzava in due:
// con più conti aperti insieme le colonne non si leggevano più. Il conto è un
// oggetto solo, e va guardato come tale — foglio sopra la lista, stesso
// scheletro di DocScartoSheet: in testa chi/quando/quanto, sotto i pagamenti.
//
// Due cose diverse possono succedere a un pagamento, e il foglio le mostra
// entrambe: il documento può non essere passato allo SdI (`onScarto`) e il
// denaro può tornare indietro (`onDettaglio`, `getStato`). Sono indipendenti —
// uno scontrino scartato resta scartato anche dopo un reso — quindi convivono
// sulla stessa riga invece di escludersi.
function ContoDettaglioSheet({ conto, saldato, getStato, onClose, onDettaglio, onScarto, onSalda }) {
  const payments = conto.payments || [];
  // Le rettifiche di un documento: annullo (totale) più i resi, che si
  // accumulano (P-17). getStato ora riceve il PAGAMENTO, non l'id: il seme
  // dei mock vive lì sopra.
  const rettificato = (p) => {
    const st = getStato ? getStato(p) : null;
    return st ? (st.annullo ? st.annullo.amount : st.resoTot) : 0;
  };
  const storni = payments.reduce((s, p) => s + rettificato(p), 0);
  // Quanto è davvero entrato: i pagamenti meno quello che è tornato indietro.
  // Al lordo sarebbe una cifra smentita dalle righe barrate lì sotto.
  const incassato = payments.reduce((s, p) => s + p.amount, 0) - storni;
  const isSaldato = conto.stato === 'saldato' || saldato;
  const daSaldare = isSaldato ? 0 : conto.daSaldare;
  const methodMeta = {
    contanti: { label:'Contanti', icon: PnI.Coin,       color:'#0F766E', bg:'#CCFBF1' },
    carta:    { label:'Carta',    icon: PnI.Card,       color:'#1D4ED8', bg:'#DBEAFE' },
    byup:     { label:'Byup app', icon: PnI.Smartphone, color:'#7C3AED', bg:'#EDE9FE' },
    // P-04: incasso avvenuto PRESSO la piattaforma delivery — il denaro non
    // passa da Byup, e in Cassa sta fuori da contanti e POS. Il documento
    // fiscale però lo emettiamo noi (D-15 · emit_fiscal_document).
    piattaforma: { label:'Piattaforma', icon: PnI.Bag,  color:'#9A3412', bg:'#FFEDD5' },
  };

  // Le celle del riepilogo: etichetta piccola sopra, valore sotto.
  const Cifra = ({ label, children, color }) => (
    <div style={{minWidth: 0}}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: PN.MUTED_SOFT,
        textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: C.T_MD, fontWeight: 800, color: color || PN.TEXT,
        fontVariantNumeric:'tabular-nums',
        display:'flex', alignItems:'center', gap: 6, minWidth: 0,
      }}>{children}</div>
    </div>
  );

  const Sep = () => <span style={{color: PN.MUTED_LIGHT}}>·</span>;
  const Titolo = ({ children }) => (
    <div style={{
      fontSize: 11, fontWeight: 700, color: PN.MUTED,
      textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 10,
      display:'flex', alignItems:'center', gap: 8,
    }}>{children}</div>
  );

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      zIndex: 60, display:'grid', placeItems:'center', padding: 28,
      animation:'scartoFade 0.16s ease',
    }}>
      {/* Le stesse keyframes del foglio scarto: qui possono aprirsi da sole,
          senza che quello sia montato. */}
      <style>{`
        @keyframes scartoFade { from {opacity: 0;} to {opacity: 1;} }
        @keyframes scartoPop {
          from {opacity: 0; transform: scale(0.965) translateY(10px);}
          to   {opacity: 1; transform: none;}
        }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: 760, maxWidth:'100%', maxHeight:'100%', background: PN.WHITE,
        borderRadius: 22, border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24), 0 2px 6px rgba(15,17,21,0.08)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'scartoPop 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Testata: di chi è il conto, quando è nato, com'è messo */}
        <div style={{
          padding:'20px 26px 18px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
            <div style={{
              width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
              background: C.SURF_ALT, color: PN.TEXT,
              display:'grid', placeItems:'center', boxShadow: PN.INSET_HIGHLIGHT,
            }}><Ic.receipt size={19}/></div>
            <div style={{minWidth: 0}}>
              <div style={{
                fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{conto.tavolo}</div>
              <div style={{
                fontSize: C.T_SM, color: PN.MUTED, marginTop: 2,
                display:'flex', alignItems:'center', gap: 7, flexWrap:'wrap',
              }}>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{fmtDataOra(conto.dataOra)}</span>
                {conto.idOrdine && (
                  <React.Fragment>
                    <Sep/>
                    <span style={{fontFamily:'ui-monospace, Menlo, monospace', color: PN.TEXT}}>{conto.idOrdine}</span>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 10, flexShrink: 0}}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'5px 12px', borderRadius: C.R_PILL,
              background: isSaldato ? '#D1FAE5' : '#FEF2F2',
              border: `1px solid ${isSaldato ? '#A7F3D0' : '#FECACA'}`,
              color: isSaldato ? '#065F46' : '#991B1B',
              fontSize: C.T_XS, fontWeight: 700, whiteSpace:'nowrap',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius:'50%',
                background: isSaldato ? '#065F46' : '#DC2626',
              }}/>
              {isSaldato ? 'Saldato' : 'Da saldare'}
            </span>
            <button onClick={onClose}
              onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
              style={{
                background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer',
                display:'flex', padding: 8, borderRadius: 10,
                transition:'background 130ms ease, color 130ms ease',
              }}><Ic.close size={17}/></button>
          </div>
        </div>

        {/* Riepilogo: i numeri del conto su una riga sola */}
        <div style={{
          display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr',
          gap: 18, padding:'14px 26px 16px',
          background: C.SURF,
          borderTop:`1px solid ${PN.BORDER_SOFT}`,
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
        }}>
          <Cifra label="Riferimento">
            {conto.riferimento ? (
              <React.Fragment>
                {conto.riferimento.tipo === 'byup' && <ByupMark size={16}/>}
                <span style={{
                  fontSize: C.T_SM, fontWeight: 700,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{conto.riferimento.nome}</span>
              </React.Fragment>
            ) : (
              <span style={{fontSize: C.T_SM, fontWeight: 600, color: PN.MUTED}}>{conto.cliente || '—'}</span>
            )}
          </Cifra>
          <Cifra label="Totale">€{conto.totaleConto.toFixed(2)}</Cifra>
          <Cifra label="Incassato" color={incassato > 0 ? PN.TEXT : PN.MUTED_SOFT}>
            €{incassato.toFixed(2)}
          </Cifra>
          <Cifra label="Da saldare" color={daSaldare > 0 ? '#B91C1C' : PN.MUTED_SOFT}>
            {daSaldare > 0 ? `€${daSaldare.toFixed(2)}` : '—'}
          </Cifra>
        </div>

        {/* Corpo: i pagamenti, uno per riga — ognuno col suo documento */}
        <div className="pn-scroll" style={{
          padding:'16px 26px 20px', overflowY:'auto', background: C.SURF,
        }}>
          <Titolo>
            Canali di pagamento
            {payments.length > 0 && (
              <span style={{
                padding:'1px 7px', borderRadius: C.R_PILL,
                background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`,
                color: PN.MUTED, fontVariantNumeric:'tabular-nums',
              }}>{payments.length}</span>
            )}
          </Titolo>

          {payments.length === 0 ? (
            <div style={{
              padding:'22px 14px', background: PN.WHITE,
              border:`1px dashed ${PN.BORDER}`, borderRadius: C.R_MD,
              fontSize: C.T_SM, color: PN.MUTED, textAlign:'center',
            }}>Nessun pagamento ancora registrato per questo conto</div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap: 8}}>
              {payments.map(p => {
                const meta = methodMeta[p.method] || methodMeta.contanti;
                const Icon = meta.icon;
                // Lo stato del documento si legge qui, non si tocca qui: annullo
                // e reso partono solo dal dettaglio, dove le righe si vedono
                // prima di decidere — un pulsante rapido su una riga di elenco
                // farebbe scegliere alla cieca.
                const st = getStato ? getStato(p) : null;
                // Reso parziale ≠ documento chiuso: la cifra si barra solo
                // quando non resta più niente (annullo o reso totale).
                const chiuso = st && (st.annullo || st.residuo <= 0.004);
                const device = p.posRef && [p.posRef.nome || p.posRef.device, p.posRef.email].filter(Boolean).join(' · ');
                return (
                  <div key={p.id} style={{
                    display:'grid',
                    gridTemplateColumns:'auto minmax(0, 1fr) auto',
                    columnGap: 12, rowGap: 8, alignItems:'center',
                    padding:'12px 14px', background: PN.WHITE,
                    border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: C.R_MD,
                    boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
                  }}>
                    <div style={{
                      gridRow:'1 / span 2',
                      width: 36, height: 36, borderRadius: 10,
                      background: meta.bg, color: meta.color,
                      display:'grid', placeItems:'center',
                    }}>{Icon ? <Icon size={16}/> : null}</div>

                    {/* Riga 1 — due stati indipendenti, in quest'ordine perché
                        rispondono a due domande diverse.
                        Prima cos'è successo ai SOLDI: il badge annullo/reso
                        cambia come si legge la cifra qui a destra, che infatti
                        va barrata — quindi va visto prima di leggerla.
                        Poi il DOCUMENTO, se è arrivato allo SdI.
                        Non si escludono: uno scontrino scartato resta scartato
                        anche dopo che il denaro è tornato indietro, e l'ufficio
                        deve poter vedere le due cose nello stesso colpo. */}
                    <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap', minWidth: 0}}>
                      <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT}}>{meta.label}</span>
                      {st && (
                        <span style={{
                          padding:'2px 8px', borderRadius: C.R_PILL, background:'#FEE2E2', color:'#B91C1C',
                          fontSize: 11.5, fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.3,
                          fontVariantNumeric:'tabular-nums',
                        }}>{st.annullo ? 'Annullato'
                          : st.residuo <= 0.004 ? 'Reso totale'
                          : `Reso −€${st.resoTot.toFixed(2)}`}</span>
                      )}
                      <PagamentoFiscChip payment={p} onOpen={() => onScarto && onScarto(p)}/>
                    </div>
                    <div style={{
                      fontWeight: 800, fontVariantNumeric:'tabular-nums',
                      fontSize: C.T_MD, textAlign:'right',
                      color: chiuso ? PN.MUTED_SOFT : PN.TEXT,
                      textDecoration: chiuso ? 'line-through' : 'none',
                    }}>€{p.amount.toFixed(2)}</div>

                    {/* Riga 2 — quando e quale scontrino; il dispositivo sotto,
                        su una riga sua: in linea mandava a capo il separatore
                        e restava un puntino appeso in fondo. */}
                    <div style={{
                      fontSize: C.T_XS, color: PN.MUTED, minWidth: 0,
                      display:'flex', flexDirection:'column', gap: 3,
                    }}>
                      <span style={{display:'flex', alignItems:'center', gap: 7, flexWrap:'wrap'}}>
                        <span style={{fontVariantNumeric:'tabular-nums'}}>{fmtDataOra(p.ora)}</span>
                        {p.scontrinoNum && (
                          <React.Fragment>
                            <Sep/>
                            <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{p.scontrinoNum}</span>
                          </React.Fragment>
                        )}
                      </span>
                      {device && (
                        <span style={{minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                          <span style={{fontWeight: 700}}>Dispositivo:</span> {device}
                        </span>
                      )}
                    </div>
                    <div style={{display:'inline-flex', alignItems:'center', gap: 6, justifySelf:'end'}}>
                      {p.scontrinoNum && (
                        <button onClick={() => onDettaglio && onDettaglio(conto, p)} style={{
                          padding:'6px 10px', background: PN.WHITE,
                          border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
                          fontSize: C.T_XS, fontWeight: 600, color: PN.TEXT,
                          cursor:'pointer', fontFamily:'inherit',
                          display:'inline-flex', alignItems:'center', gap: 5,
                        }}>
                          {PnI.FileText ? <PnI.FileText size={12}/> : null}
                          Scontrino
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Annulli e resi — con P-17 le rettifiche possono essere più di
              una per scontrino: una riga per OGNI reso, col suo documento
              progressivo (-R1, -R2), più l'annullo quando c'è. Il vecchio
              blocco «Rimborso» a livello di conto è confluito qui: erano resi
              post-emissione senza documento, ora seminati sul pagamento. */}
          {payments.some(p => getStato && getStato(p)) && (
            <div style={{marginTop: 18}}>
              <Titolo>Annulli e resi</Titolo>
              <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                {payments.flatMap(p => {
                  const st = getStato ? getStato(p) : null;
                  if (!st) return [];
                  const voci = [
                    ...(st.annullo ? [{ chiave:`${p.id}-A`, titolo:`Annullo scontrino ${p.scontrinoNum}`, doc:`${p.scontrinoNum}-A`, ora: st.annullo.ora, amount: st.annullo.amount }] : []),
                    ...st.resi.map((r, i) => ({ chiave:`${p.id}-R${i+1}`, titolo:`Reso scontrino ${p.scontrinoNum}`, doc: rettDocReso(p, i), ora: r.ora, amount: r.amount, motivo: r.motivo })),
                  ];
                  return voci.map(v => (
                    <div key={v.chiave} style={{
                      padding:'12px 14px',
                      background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius: C.R_MD,
                      display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 12, alignItems:'center',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background:'#FEE2E2', color:'#B91C1C',
                        display:'grid', placeItems:'center',
                      }}><PnI.RotateCcw size={16}/></div>
                      <div style={{minWidth: 0}}>
                        <div style={{fontSize: C.T_SM, fontWeight: 700, color:'#991B1B'}}>{v.titolo}</div>
                        <div style={{fontSize: C.T_XS, color:'#B91C1C', marginTop: 3}}>
                          <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{v.doc}</span>
                          {v.ora && <span style={{fontVariantNumeric:'tabular-nums'}}> · {fmtDataOra(v.ora)}</span>}
                          {v.motivo && ` · ${v.motivo}`}
                        </div>
                      </div>
                      <div style={{fontWeight: 800, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, color:'#991B1B'}}>
                        −€{v.amount.toFixed(2)}
                      </div>
                    </div>
                  ));
                })}
              </div>
            </div>
          )}
        </div>

        {/* Piede: la chiusura, e se il conto è aperto anche il modo di chiuderlo */}
        <div style={{
          padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE_OFF,
          display:'flex', alignItems:'center', justifyContent:'flex-end', gap: 10,
        }}>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; }}
            style={{
              padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
              cursor:'pointer', fontFamily:'inherit',
              transition:'background 130ms ease, border-color 130ms ease',
            }}>Chiudi</button>
          {!isSaldato && (
            <button onClick={() => onSalda && onSalda(conto)}
              style={{
                padding:'10px 22px', background: PN.TEXT, color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700,
                cursor:'pointer', fontFamily:'inherit',
              }}>Vai al conto</button>
          )}
        </div>
      </div>
    </div>
  );
}

// Dettaglio scontrino — il documento con le sue righe, e le tre sole cose che
// si possono fare su un corrispettivo: stamparlo, rendere alcune righe,
// annullarlo. Diverso dalla fattura apposta: qui annullo e reso SONO chiamate
// dirette dell'API (DELETE / PATCH su IT-e-receipts), non serve un documento
// esterno come la nota di credito.
//
// Il reso è a righe intere, non a quantità: "il cliente rimanda indietro una
// delle due cotolette" è un caso che al banco non capita mai abbastanza da
// giustificare un contatore per riga.
function ScontrinoDettaglioModal({ conto, payment, rett, onClose, onAnnulla, onReso }) {
  const [sel, setSel] = React.useState(null); // null = sola lettura · Set(idPorzione) = selezione reso
  const [stampato, setStampato] = React.useState(false);

  // P-16 (D-20): il documento conosce le SUE righe (la quota di saldo);
  // conto.ordini resta il ripiego del pagamento unico, dove coincidono.
  const righe = payment.righe || (conto.payments.length === 1 ? (conto.ordini || []) : []);
  // P-18 (D-13): la porzione è l'unità fisica — le quantità si sciolgono a
  // schermo, una riga spuntabile per porzione a prezzo unitario, id derivato
  // riga#k. Nel modello quantity non esiste più: niente contatori.
  const porzioni = righe.flatMap(r =>
    Array.from({ length: r.qty }, (_, k) => ({ id: `${r.id}#${k}`, nome: r.nome, prezzo: r.prezzo })));
  const rese = (rett && rett.porzioniRese) || new Set();
  const oraResa = (id) => {
    const reso = rett && rett.resi.find(r => (r.porzioni || []).includes(id));
    return reso ? reso.ora : null;
  };
  const annullato = !!(rett && rett.annullo);
  const resoTot = rett ? rett.resoTot : 0;
  const residuo = rett ? rett.residuo : payment.amount;
  const chiuso = annullato || (rett && residuo <= 0.004);
  // P-04: il denaro dei documenti piattaforma non è mai passato da noi —
  // nessuna rettifica si offre, e il perché sta scritto a schermo.
  const piattaforma = payment.method === 'piattaforma';

  const statoInfo = annullato ? { label: 'Annullato', bg: '#FEE2E2', fg: '#B91C1C' }
    : rett && residuo <= 0.004 ? { label: 'Reso totale', bg: '#FEE2E2', fg: '#B91C1C' }
    : rett ? { label: `Reso −€${resoTot.toFixed(2)}`, bg: '#FEE2E2', fg: '#B91C1C' }
    : { label: 'Attivo', bg: '#DCFCE7', fg: '#16A34A' };
  const metodoLabel = payment.method === 'byup' ? 'Byup app' : payment.method === 'carta' ? 'Carta' : payment.method === 'piattaforma' ? 'Piattaforma' : 'Contanti';
  const totaleSel = porzioni.filter(z => sel && sel.has(z.id)).reduce((s, z) => s + z.prezzo, 0);
  // «fino a concorrenza del totale» (P-17): la selezione non può superare il
  // residuo — con le quote esatte non succede, ma il limite è fiscale.
  const selValida = totaleSel > 0 && totaleSel <= residuo + 0.004;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex: 998,
      display:'flex', alignItems:'center', justifyContent:'center', padding: 20,
      fontFamily:'inherit',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, padding: 26,
        maxWidth: 440, width:'100%', maxHeight:'calc(var(--pn-vh, 100vh) * 0.86)', overflow:'auto',
      }}>
        <div style={{display:'flex', alignItems:'flex-start', gap: 10}}>
          <div style={{flex:1}}>
            <div style={{fontSize: C.T_LG, fontWeight: 800, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace'}}>
              {payment.scontrinoNum}
            </div>
            <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 3}}>
              {fmtDataOra(conto.dataOra.split(' ')[0] + ' ' + (payment.ora.split(' ')[1] || ''))} · {metodoLabel} · {conto.cliente}
            </div>
          </div>
          <span style={{
            padding:'4px 10px', borderRadius: 999, background: statoInfo.bg, color: statoInfo.fg,
            fontSize: C.T_XS, fontWeight: 700, flexShrink: 0,
          }}>{statoInfo.label}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: C.SURF_ALT, border:'none', color: PN.MUTED, cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={12}/></button>
        </div>

        {porzioni.length === 0 ? (
          <div style={{
            marginTop: 16, padding:'14px', background: C.SURF_ALT, borderRadius: C.R_SM,
            fontSize: C.T_SM, color: PN.MUTED, textAlign:'center',
          }}>Nessuna riga associata a questo scontrino — solo l'importo totale.</div>
        ) : (
          <div style={{marginTop: 16, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, overflow:'hidden'}}>
            {porzioni.map((z, i) => {
              const resa = rese.has(z.id);
              const on = sel && sel.has(z.id);
              const spenta = resa || annullato;
              return (
                <div key={z.id}
                  onClick={sel && !spenta ? () => setSel(s => { const n = new Set(s); n.has(z.id) ? n.delete(z.id) : n.add(z.id); return n; }) : undefined}
                  style={{
                    display:'flex', alignItems:'center', gap: 10, padding:'9px 12px',
                    borderTop: i ? `1px solid ${PN.BORDER_SOFT}` : 'none',
                    background: on ? '#FFFBEB' : PN.WHITE,
                    cursor: sel && !spenta ? 'pointer' : 'default',
                    opacity: spenta ? 0.55 : 1,
                  }}>
                  {sel && !spenta && (
                    <span style={{
                      width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                      border:`1.5px solid ${on ? '#B45309' : PN.BORDER}`,
                      background: on ? '#B45309' : PN.WHITE, color:'#fff',
                      display:'grid', placeItems:'center',
                    }}>{on && <PnI.Check size={10}/>}</span>
                  )}
                  <span style={{
                    flex:1, minWidth:0, fontSize: C.T_SM, color: PN.TEXT,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    textDecoration: spenta ? 'line-through' : 'none',
                  }}>{z.nome}</span>
                  {resa && (
                    <span style={{fontSize: 11.5, color:'#B91C1C', fontWeight: 600, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>
                      resa{oraResa(z.id) ? ` il ${fmtDataOra(oraResa(z.id))}` : ''}
                    </span>
                  )}
                  <span style={{
                    fontSize: C.T_SM, fontWeight: 700, color: spenta ? PN.MUTED_SOFT : PN.TEXT,
                    fontVariantNumeric:'tabular-nums',
                    textDecoration: spenta ? 'line-through' : 'none',
                  }}>€{z.prezzo.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          display:'flex', marginTop: 14, padding:'10px 14px', background: C.SURF_ALT, borderRadius: C.R_SM,
          fontSize: C.T_MD, fontWeight: 800, color: annullato ? '#B91C1C' : PN.TEXT,
        }}>
          <span style={{flex:1}}>{annullato ? 'Annullato' : 'Totale'}</span>
          <span style={{fontVariantNumeric:'tabular-nums'}}>
            {annullato ? '−' : ''}€{payment.amount.toFixed(2)}
          </span>
        </div>

        {/* Il residuo di P-17: quanto è già tornato indietro e quanto si può
            ancora rendere — detto in cifre, sotto il totale, non dedotto. */}
        {rett && !annullato && (
          <div style={{
            display:'flex', marginTop: 8, padding:'8px 14px',
            background:'#FEF2F2', border:'1px solid #FECACA', borderRadius: C.R_SM,
            fontSize: C.T_SM, fontWeight: 700, color:'#991B1B',
          }}>
            <span style={{flex:1}}>Già reso −€{resoTot.toFixed(2)}</span>
            <span style={{fontVariantNumeric:'tabular-nums'}}>
              {residuo <= 0.004 ? 'niente da rendere' : `resta da rendere €${residuo.toFixed(2)}`}
            </span>
          </div>
        )}

        {/* Storico delle rettifiche del documento, una riga per reso. */}
        {rett && rett.resi.length > 0 && (
          <div style={{marginTop: 8, display:'flex', flexDirection:'column', gap: 4}}>
            {rett.resi.map((r, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'baseline', gap: 8,
                padding:'5px 14px', fontSize: C.T_XS, color: PN.MUTED,
              }}>
                <span style={{fontFamily:'ui-monospace, Menlo, monospace', flexShrink: 0}}>{rettDocReso(payment, i)}</span>
                <span style={{flex:1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>
                  {fmtDataOra(r.ora)}{r.motivo ? ` · ${r.motivo}` : ''}
                  {/* P-89: il reso è un documento trasmesso, col suo esito e il suo identificativo del canale. */}
                  {(() => { const f = rettFisc(payment, r, i); return f.idTrasm ? ` · trasmesso · ${f.idTrasm}` : ` · ${f.esito}`; })()}
                </span>
                <span style={{fontWeight: 700, color:'#991B1B', fontVariantNumeric:'tabular-nums', flexShrink: 0}}>−€{r.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {piattaforma && (
          <div style={{
            marginTop: 12, padding:'10px 14px',
            background: C.SURF_ALT, borderRadius: C.R_SM,
            fontSize: C.T_XS, color: PN.MUTED, lineHeight: 1.5,
          }}>
            Il rimborso avviene sulla piattaforma; il trattamento fiscale del reso
            cross-canale è in definizione.
          </div>
        )}

        {sel ? (
          <div style={{display:'flex', gap: 10, marginTop: 16}}>
            <button onClick={() => setSel(null)} style={{
              flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            }}>Indietro</button>
            <button onClick={() => onReso(totaleSel, [...sel])} disabled={!selValida} style={{
              flex:2, padding:'11px 14px', border:'none', borderRadius: C.R_SM,
              background: selValida ? PN.TEXT : '#E5E7EB',
              color: selValida ? '#fff' : '#9CA3AF',
              fontSize: C.T_SM, fontWeight: 700, cursor: selValida ? 'pointer' : 'default', fontFamily:'inherit',
            }}>{selValida ? `Rendi €${totaleSel.toFixed(2)}` : 'Scegli cosa rendere'}</button>
          </div>
        ) : (
          <div style={{display:'flex', gap: 8, marginTop: 16}}>
            <button onClick={() => { setStampato(true); setTimeout(() => setStampato(false), 2000); }} style={{
              flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
            }}>{stampato ? 'Stampato ✓' : 'Stampa'}</button>
            {/* P-16: il reso per righe vale su OGNI documento saldato — resta
                finché c'è un residuo e delle porzioni ancora in piedi. */}
            {!piattaforma && !annullato && residuo > 0.004 && porzioni.length > 0 && (
              <button onClick={() => setSel(new Set())} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid #FCD34D`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#B45309', cursor:'pointer', fontFamily:'inherit',
              }}>Rendi</button>
            )}
            {/* L'annullo resta unico e totale — e solo a documento INTATTO:
                dopo un reso parziale coprirebbe due volte le porzioni rese,
                quindi a documento toccato la via è rendere il residuo. */}
            {!piattaforma && !rett && (
              <button onClick={onAnnulla} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid #FCA5A5`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#B91C1C', cursor:'pointer', fontFamily:'inherit',
              }}>Annulla</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Popup apertura cassa — chiede il fondo cassa iniziale
function ApriCassaModal({ open, onClose, onConfirm }) {
  const [amount, setAmount] = React.useState('');
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAmount('');
      const r = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(r);
    }
    setShow(false);
  }, [open]);

  if (!open) return null;

  const value = parseFloat(amount) || 0;
  const canConfirm = value > 0;
  const chips = [50, 100, 150, 200];

  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60,
          opacity: show ? 1 : 0, transition:'opacity .18s ease',
        }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        width:420, maxWidth:'92vw',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex:61, overflow:'hidden', fontFamily:'inherit',
        animation: show ? 'cassaPopIn .22s cubic-bezier(.16,1,.3,1) both' : 'none',
        transform:'translate(-50%, -50%)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{
              width:38, height:38, borderRadius:10,
              background:'#ECFDF5', color:'#059669',
              display:'grid', placeItems:'center', flexShrink:0,
            }}>{Ic.cash ? <Ic.cash size={20}/> : '€'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize: C.T_MD, fontWeight: 800, color: PN.TEXT}}>Apri cassa</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 1}}>Indica il fondo cassa iniziale</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{padding:'18px 22px 4px'}}>
          <div style={{fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8}}>
            Fondo cassa
          </div>
          <div style={{
            display:'flex', alignItems:'baseline', gap:6,
            background:'#fff', border:`1.5px solid ${PN.BORDER}`, borderRadius:10,
            padding:'12px 14px', marginBottom:12,
          }}>
            <span style={{fontSize:22, fontWeight:700, color: PN.MUTED}}>€</span>
            <input
              type="number" autoFocus value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              style={{
                border:'none', outline:'none', width:'100%', padding:0, background:'transparent',
                fontSize:26, fontWeight:800, color: PN.TEXT, fontFamily:'inherit',
                fontVariantNumeric:'tabular-nums',
              }}/>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:4}}>
            {chips.map(v => {
              const sel = value === v;
              return (
                <button key={v} onClick={() => setAmount(String(v))} style={{
                  padding:'9px 4px', borderRadius:8,
                  background: sel ? PN.TEXT : '#fff',
                  color: sel ? '#fff' : PN.TEXT,
                  border: sel ? `1px solid ${PN.TEXT}` : `1px solid ${PN.BORDER}`,
                  fontSize: C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                }}>€{v}</button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
          <button onClick={onClose} style={{
            flex:1, padding:'11px 16px', background: PN.WHITE,
            border:`1px solid ${PN.BORDER}`, borderRadius:9,
            fontSize: C.T_SM, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          }}>Annulla</button>
          <button
            onClick={canConfirm ? () => onConfirm(value) : undefined}
            className="cassa-btn"
            style={{
              flex:2, padding:'11px 16px',
              background: canConfirm ? '#059669' : '#E5E7EB',
              color: canConfirm ? '#fff' : '#9CA3AF',
              border:'none', borderRadius:9, fontSize: C.T_SM, fontWeight:700,
              cursor: canConfirm ? 'pointer' : 'default', fontFamily:'inherit',
            }}>
            Apri cassa con €{value.toFixed(2)}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

// Popup conferma chiusura cassa — riepilogo e conferma quadratura
// ─── Conteggio del fondo (P-20 · D-22) ─────────────────────────────────────
// Il gesto di UNA PERSONA, separato dalla chiusura di giornata: si registra
// anche dopo — il locale che chiude alle 2 non conta il cassetto a mezzanotte
// perché lo vuole il fisco — e lo scostamento nasce ADESSO, al conteggio,
// con ora e autore. L'IVA non c'entra col cassetto: sta nella chiusura di
// giornata (ChiudiGiornataModal).
function ContaFondoModal({ open, fondoCassa, onClose, onConfirm }) {
  const [show, setShow] = React.useState(false);
  const [finale, setFinale] = React.useState(''); // saldo cassa contato dall'operatore
  const [step, setStep] = React.useState('form'); // 'form' | 'warn'

  React.useEffect(() => {
    if (open) {
      setFinale('');
      setStep('form');
      const r = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(r);
    }
    setShow(false);
  }, [open]);

  if (!open) return null;

  // Contanti = incassi dalla cassa fisica (gli incassi via app sono carta, non entrano nel cassetto).
  const incassoContanti = CASH_MOVEMENTS.filter(m => m.channel === 'cassa').reduce((s, m) => s + m.amount, 0);

  // Saldo cassa (cassetto contanti)
  const saldoIniziale = fondoCassa || 0;
  const atteso = saldoIniziale + incassoContanti; // quanto dovrebbe esserci nel cassetto
  const finaleNum = parseFloat(String(finale).replace(',', '.')) || 0;
  // Differenza = atteso − contato (di quanto il contato si discosta dall'atteso).
  const differenza = atteso - finaleNum;
  const diffZero = Math.abs(differenza) < 0.01;
  const canConfirm = String(finale).trim() !== '';

  // Ora e autore si registrano COL GESTO: sono il fatto, non un contorno.
  const registra = () => {
    const d = new Date();
    onConfirm({
      contato: finaleNum, atteso: Math.round(atteso * 100) / 100,
      differenza: Math.round(differenza * 100) / 100,
      ora: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      autore: 'Mario Rossi',
    });
  };
  const handleConfirmClick = () => {
    if (!canConfirm) return;
    if (!diffZero) { setStep('warn'); return; }
    registra();
  };

  const rowStyle = (first) => ({
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'10px 14px', fontSize: C.T_SM, color: PN.TEXT,
    borderTop: first ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
  });
  const btnSecondary = { flex:1, padding:'11px 16px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius:9, fontSize: C.T_SM, fontWeight:600, cursor:'pointer', fontFamily:'inherit' };
  const btnPrimary = { flex:2, padding:'11px 16px', background: PN.TEXT, color:'#fff', border:'none', borderRadius:9, fontSize: C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit' };
  const btnDisabled = { ...btnPrimary, background:'#E5E7EB', color:'#9CA3AF', cursor:'default' };
  const btnWarn = { ...btnPrimary, background:'#D97706' };

  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60,
          opacity: show ? 1 : 0, transition:'opacity .18s ease',
        }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        width:420, maxWidth:'92vw',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex:61, overflow:'hidden', fontFamily:'inherit',
        animation: show ? 'cassaPopIn .22s cubic-bezier(.16,1,.3,1) both' : 'none',
        transform:'translate(-50%, -50%)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{
              width:38, height:38, borderRadius:10,
              background:'#FEF2F2', color:'#DC2626',
              display:'grid', placeItems:'center', flexShrink:0,
            }}>{Ic.cash ? <Ic.cash size={20}/> : '€'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize: C.T_MD, fontWeight: 800, color: PN.TEXT}}>Conta il fondo</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 1}}>Il gesto di chi ha il cassetto in mano — anche dopo la chiusura</div>
            </div>
          </div>
        </div>

        {step === 'form' ? (
          <>
            {/* Body */}
            <div style={{padding:'16px 22px 4px', display:'flex', flexDirection:'column', gap:16}}>
              {/* SALDO CASSA */}
              <div>
                <div style={{fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8}}>Saldo cassa</div>
                <div style={{border:`1px solid ${PN.BORDER}`, borderRadius:10, overflow:'hidden'}}>
                  <div style={rowStyle(true)}>
                    <span style={{color: PN.MUTED}}>Saldo cassa iniziale</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {saldoIniziale.toFixed(2)}</span>
                  </div>
                  <div style={rowStyle(false)}>
                    <span style={{color: PN.MUTED}}>Saldo cassa finale atteso</span>
                    <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}} title="Iniziale + contanti incassati">€ {atteso.toFixed(2)}</span>
                  </div>
                  {/* Saldo finale — input operatore */}
                  <div style={{...rowStyle(false), gap:12}}>
                    <span style={{color: PN.MUTED, whiteSpace:'nowrap'}}>Saldo cassa finale</span>
                    <div style={{display:'flex', alignItems:'center', gap:4, border:`1.5px solid ${PN.BORDER}`, borderRadius:8, padding:'6px 10px', background:'#fff'}}>
                      <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.MUTED}}>€</span>
                      <input
                        type="number" autoFocus value={finale}
                        onChange={e => setFinale(e.target.value)}
                        placeholder="0,00"
                        style={{border:'none', outline:'none', width:90, padding:0, background:'transparent',
                          fontSize: C.T_MD, fontWeight:800, color: PN.TEXT, fontFamily:'inherit',
                          textAlign:'right', fontVariantNumeric:'tabular-nums'}}/>
                    </div>
                  </div>
                  {/* Differenza */}
                  <div style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'12px 14px', borderTop:`1px solid ${PN.BORDER}`,
                    background: !canConfirm ? '#F8F9FB' : diffZero ? '#ECFDF5' : '#FFFBEB',
                  }}>
                    <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.TEXT}}>Differenza cassa</span>
                    <span style={{fontSize: C.T_MD, fontWeight:800, fontVariantNumeric:'tabular-nums',
                      color: !canConfirm ? PN.MUTED : diffZero ? '#059669' : '#B45309'}}>
                      {canConfirm ? `€ ${differenza.toFixed(2)}` : '—'}
                    </span>
                  </div>
                </div>
                {canConfirm && (
                  <div style={{fontSize: C.T_XS, color: diffZero ? '#059669' : '#B45309', marginTop:6}}>
                    {diffZero
                      ? 'Quadratura perfetta'
                      : `${differenza > 0 ? 'Mancano' : 'In eccesso'} € ${Math.abs(differenza).toFixed(2)} rispetto all'atteso (€ ${atteso.toFixed(2)})`}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
              <button onClick={onClose} style={btnSecondary}>Annulla</button>
              <button onClick={handleConfirmClick} style={canConfirm ? btnPrimary : btnDisabled}>
                Registra conteggio
              </button>
            </div>
          </>
        ) : (
          /* Step avviso — differenza cassa ≠ 0 */
          <>
            <div style={{padding:'18px 22px 4px', display:'flex', alignItems:'flex-start', gap:14}}>
              <span style={{width:42, height:42, borderRadius:'50%', background:'#FEF3C7', color:'#B45309',
                display:'grid', placeItems:'center', flexShrink:0}}><Ic.warn size={20}/></span>
              <div>
                <div style={{fontSize: C.T_MD, fontWeight:800, color: PN.TEXT}}>La cassa non è in pari</div>
                <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop:4}}>
                  Differenza rilevata: <strong style={{color:'#B45309', fontVariantNumeric:'tabular-nums'}}>€ {differenza.toFixed(2)}</strong>. Sei sicuro di voler continuare?
                </div>
              </div>
            </div>
            <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
              <button onClick={() => setStep('form')} style={btnSecondary}>Torna indietro</button>
              <button onClick={registra} style={btnWarn}>Registra comunque</button>
            </div>
          </>
        )}
      </div>
    </React.Fragment>
  );
}

// ─── Chiusura di giornata (P-20 · D-22) ────────────────────────────────────
// La chiusura CONTABILE, senza contante: può avvenire da sola all'ora del
// cambio giornata (P-19, byup_rollover_time) o in anticipo da qui. L'IVA nel
// riepilogo è il riparto 70/30 del mock — dichiaratamente finto, come docIva
// e le chiusure — e sta QUI perché è materia della giornata, non del
// cassetto: il fondo si conta a parte, anche dopo.
function ChiudiGiornataModal({ open, onClose, onConfirm }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      const r = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(r);
    }
    setShow(false);
  }, [open]);

  if (!open) return null;

  const incassoLordo = CASH_MOVEMENTS.reduce((s, m) => s + m.amount, 0);
  // IVA registrata, scorporata dal lordo per aliquota (riparto 70/30, mock).
  const lordo10 = incassoLordo * 0.7, lordo22 = incassoLordo * 0.3;
  const iva10 = lordo10 - lordo10 / 1.10;
  const iva22 = lordo22 - lordo22 / 1.22;
  const ivaTotale = iva10 + iva22;

  const rowStyle = (first) => ({
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'10px 14px', fontSize: C.T_SM, color: PN.TEXT,
    borderTop: first ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
  });
  const btnSecondary = { flex:1, padding:'11px 16px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius:9, fontSize: C.T_SM, fontWeight:600, cursor:'pointer', fontFamily:'inherit' };
  const btnPrimary = { flex:2, padding:'11px 16px', background: PN.TEXT, color:'#fff', border:'none', borderRadius:9, fontSize: C.T_SM, fontWeight:700, cursor:'pointer', fontFamily:'inherit' };

  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60,
          opacity: show ? 1 : 0, transition:'opacity .18s ease',
        }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        width:420, maxWidth:'92vw',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex:61, overflow:'hidden', fontFamily:'inherit',
        animation: show ? 'cassaPopIn .22s cubic-bezier(.16,1,.3,1) both' : 'none',
        transform:'translate(-50%, -50%)',
      }}>
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{
              width:38, height:38, borderRadius:10,
              background:'#FEF2F2', color:'#DC2626',
              display:'grid', placeItems:'center', flexShrink:0,
            }}>{Ic.cash ? <Ic.cash size={20}/> : '€'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize: C.T_MD, fontWeight: 800, color: PN.TEXT}}>Chiudi giornata</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 1}}>La chiusura contabile della giornata di servizio</div>
            </div>
          </div>
        </div>

        <div style={{padding:'16px 22px 4px', display:'flex', flexDirection:'column', gap:16}}>
          <div>
            <div style={{fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8}}>Incasso totale</div>
            <div style={{border:`1px solid ${PN.BORDER}`, borderRadius:10, overflow:'hidden'}}>
              <div style={rowStyle(true)}>
                <span style={{color: PN.MUTED}}>Importo lordo incassato</span>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {incassoLordo.toFixed(2)}</span>
              </div>
              <div style={rowStyle(false)}>
                <span style={{color: PN.MUTED}}>IVA registrata · 10%</span>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {iva10.toFixed(2)}</span>
              </div>
              <div style={rowStyle(false)}>
                <span style={{color: PN.MUTED}}>IVA registrata · 22%</span>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {iva22.toFixed(2)}</span>
              </div>
              <div style={{...rowStyle(false), background:'#F8F9FB', borderTop:`1px solid ${PN.BORDER}`}}>
                <span style={{fontWeight:700, color: PN.TEXT}}>IVA totale registrata</span>
                <span style={{fontWeight:800, fontVariantNumeric:'tabular-nums'}}>€ {ivaTotale.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{
            padding:'10px 14px', background:'#FFFBEB', border:'1px solid #FCD34D',
            borderRadius:10, fontSize: C.T_XS, color:'#92400E', lineHeight: 1.5,
          }}>
            Il fondo non si conta qui: è un gesto a parte, registrabile anche
            dopo — lo scostamento nascerà al conteggio, non adesso.
          </div>
        </div>

        <div style={{padding:'16px 22px 18px', display:'flex', gap:10}}>
          <button onClick={onClose} style={btnSecondary}>Annulla</button>
          <button onClick={onConfirm} style={btnPrimary}>Chiudi giornata</button>
        </div>
      </div>
    </React.Fragment>
  );
}

function ContConti({ filter = 'all', fisc = null, onFiscClear, apri = null, periodoIn = null }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(filter);
  const [scartoPay, setScartoPay] = React.useState(null); // {conto, payment}
  useFiscTick();
  const [canale, setCanale] = React.useState('all'); // 'all' | 'asporto' | 'sala'
  const [modalPagamento, setModalPagamento] = React.useState(null);
  const [saldati, setSaldati] = React.useState(new Set());

  // Le rettifiche vivono nel registro persistente (rettDi, in testa al file):
  // con D-20 ogni documento conosce le proprie righe, quindi il vecchio
  // vincolo «reso solo a pagamento unico» non esiste più (P-16). Il tick
  // ridisegna a ogni scrittura, come fa useFiscTick per gli scarti.
  const [, rettForza] = React.useState(0);
  React.useEffect(() => {
    const agg = () => rettForza(x => x + 1);
    window.addEventListener('byup-rett-change', agg);
    return () => window.removeEventListener('byup-rett-change', agg);
  }, []);

  const [modalRimborso, setModalRimborso] = React.useState(null); // {conto, payment, tipo:'annullo'|'reso', amount} | null
  const [rimborsoStep, setRimborsoStep] = React.useState('metodo'); // 'metodo' | 'conferma'
  const [dettaglioScontrino, setDettaglioScontrino] = React.useState(null); // {conto, payment} | null

  // Il conto che stai guardando: uno solo, perché il dettaglio è un foglio
  // sopra la lista e non un pannello che spezza la tabella.
  // Arrivando dal dettaglio di un ordine in Vendita diretta il conto è già
  // deciso — è quello che si stava guardando dall'altra parte del locale —
  // e il foglio si apre subito sui suoi documenti.
  const contoDaUrl = () => apri ? CONTI_MOCK.find(c => c.id === apri) || null : null;
  const [contoAperto, setContoAperto] = React.useState(contoDaUrl);
  // Arrivando da Cassa, se la giornata rimanda a un conto solo lo si apre
  // subito: è il documento su cui hai cliccato. Se ne rimanda più d'uno la
  // lista resta la lista — è già filtrata su quelli, e scegli tu.
  const fiscKey = fisc ? `${fisc.data}|${fisc.stato}` : '';
  React.useEffect(() => {
    if (!fisc) { setContoAperto(contoDaUrl()); return; }
    const attesi = CONTI_MOCK.filter(x => (x.payments || []).some(p =>
      (!fisc.data || String(p.ora || '').startsWith(fisc.data)) &&
      (!fisc.stato || docInfo(p).tipo === { scartato:'scartato', coda:'ritrasmissione', gestito:'gestito', ok:'ok', waiting:'waiting' }[fisc.stato])));
    setContoAperto(attesi.length === 1 ? attesi[0] : null);
  }, [fiscKey]);
  const [sortData, setSortData] = React.useState(null); // null | 'desc' (recenti) | 'asc' (meno recenti)

  // Filtro per periodo (P-106): stesso selettore della Cassa — CcPeriodoPicker
  // vive in contabilita-v2-cassa.jsx — applicato alla data di apertura del
  // conto. Convive col rimando `fisc` di Cassa, che filtra per giornata i
  // DOCUMENTI: sono due domande diverse e nessuna delle due spegne l'altra.
  // `periodoIn` è il periodo scelto nel foglio «In caso di controllo»: entra
  // come valore iniziale e torna a entrare a ogni nuovo rimando, ma da lì in
  // poi il selettore è di chi guarda la lista — il foglio non lo riscrive.
  const [periodo, setPeriodo] = React.useState(periodoIn);
  const periodoInKey = periodoIn ? `${periodoIn.da}|${periodoIn.a}` : '';
  React.useEffect(() => { if (periodoIn) setPeriodo(periodoIn); }, [periodoInKey]);
  const [periodoOpen, setPeriodoOpen] = React.useState(false);
  const periodoRef = React.useRef(null);
  React.useEffect(() => {
    if (!periodoOpen) return;
    const h = (e) => { if (periodoRef.current && !periodoRef.current.contains(e.target)) setPeriodoOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [periodoOpen]);

  // Cosa si restituisce l'ha già deciso il dettaglio scontrino; qui resta solo
  // il "come tornano i soldi".
  function apriRimborso(conto, payment, tipo, amount, porzioni) {
    setDettaglioScontrino(null);
    setModalRimborso({ conto, payment, tipo, amount, porzioni: porzioni || [] });
    setRimborsoStep('metodo');
  }
  function chiudiRimborso() {
    setModalRimborso(null);
    setRimborsoStep('metodo');
  }
  // Unico punto in cui lo stato del documento cambia. Il documento collegato
  // si deriva a schermo (-A, -R1, -R2…), come farebbe parent_receipt_id lato
  // SdI; qui si scrive solo il fatto: quanto, quali porzioni, quando.
  function confermaRimborso() {
    const { payment, tipo, amount, porzioni } = modalRimborso;
    const d = new Date();
    const ora = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const s = window.byupReadRett();
    const cur = s[payment.id] || {};
    if (tipo === 'annullo') {
      s[payment.id] = { ...cur, annullo: { amount, ora } };
    } else {
      s[payment.id] = { ...cur, resi: [...(cur.resi || []), { amount, porzioni, ora }] };
    }
    window.byupWriteRett(s);
    chiudiRimborso();
  }

  // KPI: tavoli in sospeso
  const nonSaldati = CONTI_MOCK.filter(c => c.stato === 'non_saldato');

  // L'alert "Da saldare" sparisce quando non ci sono conti aperti:
  // se era il filtro attivo, torna a "Tutti".
  React.useEffect(() => {
    if (activeFilter === 'da_saldare' && nonSaldati.length === 0) setActiveFilter('all');
  }, [activeFilter, nonSaldati.length]);

  // Filtro in arrivo da Cassa: la giornata e lo stato di trasmissione. È il
  // rimando del riepilogo, non una lista parallela — la lista è questa.
  const FISC_MAP = { scartato:'scartato', coda:'ritrasmissione', gestito:'gestito', ok:'ok', waiting:'waiting' };
  const fiscMatch = (p) => {
    if (!fisc) return true;
    if (fisc.data && !String(p.ora || '').startsWith(fisc.data)) return false;
    if (fisc.stato && docInfo(p).tipo !== FISC_MAP[fisc.stato]) return false;
    return true;
  };

  // Filtra per stato (alert da saldare) e per canale (sala / asporto)
  let filtered = CONTI_MOCK;
  if (fisc) {
    filtered = filtered.filter(c => (c.payments || []).some(fiscMatch));
  }
  if (activeFilter === 'da_saldare') {
    filtered = filtered.filter(c => c.stato === 'non_saldato');
  }
  if (canale !== 'all') {
    filtered = filtered.filter(c => (c.canale || 'sala') === canale);
  }
  if (periodo) {
    filtered = filtered.filter(c => {
      const g = String(c.dataOra || '').split(' ')[0];
      return g >= periodo.da && g <= periodo.a;
    });
  }

  // Filtra per ricerca (tavolo o cliente)
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      c.tavolo.toLowerCase().includes(q) ||
      c.cliente.toLowerCase().includes(q)
    );
  }

  // Ordina per data di apertura (toggle su click intestazione)
  if (sortData) {
    filtered = [...filtered].sort((a, b) => {
      const da = a.dataOra || '';
      const db = b.dataOra || '';
      return sortData === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
    });
  }

  // Ciclo a 3 stati: nessun ordinamento → più recenti → meno recenti → nessuno.
  // Permette di deselezionare l'ordinamento per Apertura tornando all'ordine originale.
  function toggleSortData() {
    setSortData(s => s === null ? 'desc' : s === 'desc' ? 'asc' : null);
  }

  const FISC_ETICHETTA = { scartato:'scartati', coda:'in ritrasmissione', gestito:'gestiti', ok:'trasmessi', waiting:'in attesa di mezzanotte' };
  // Il singolare serve dopo "Nessun documento …": il plurale ci stonava.
  const FISC_ETICHETTA_UNO = { scartato:'scartato', coda:'in ritrasmissione', gestito:'gestito', ok:'trasmesso', waiting:'in attesa di mezzanotte' };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Da dove arrivi: il filtro che Cassa ha impostato, e come toglierlo */}
      {fisc && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12,
          padding:'11px 16px', borderRadius: C.R_MD,
          background: PN.PINK_BG_SOFT, border:`1px solid ${PN.PINK_SOFT}`,
        }}>
          <span style={{color: PN.PINK_DARK, display:'flex'}}><Ic.receipt size={16}/></span>
          <span style={{flex:1, fontSize: C.T_SM, color: PN.TEXT}}>
            Documenti <b>{FISC_ETICHETTA[fisc.stato] || ''}</b> del{' '}
            <b>{fisc.data ? fisc.data.split('-').reverse().join('/') : ''}</b> — dal riepilogo di Cassa
          </span>
          <button onClick={() => onFiscClear && onFiscClear()}
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'6px 12px', borderRadius: C.R_SM,
              background:'transparent', border:`1px solid ${PN.PINK_SOFT}`,
              fontSize: C.T_XS, fontWeight: 600, color: PN.PINK_DARK,
              cursor:'pointer', fontFamily:'inherit',
              transition:'background 130ms ease',
            }}><Ic.close size={12}/> Mostra tutti i conti</button>
        </div>
      )}

      {/* Quando l'ultimo documento di quella giornata viene gestito la lista
          filtrata si svuota: senza una riga di spiegazione sembrerebbe un
          errore invece del lavoro finito. */}
      {fisc && filtered.length === 0 && (
        <div style={{
          padding:'22px 20px', borderRadius: C.R_MD, textAlign:'center',
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
        }}>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
            Nessun documento {FISC_ETICHETTA_UNO[fisc.stato] || ''} in questa giornata
          </div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 4}}>
            {fisc.stato === 'scartato'
              ? 'Gli scarti di quel giorno sono stati tutti gestiti.'
              : 'Non c\'è più niente con questo stato.'}
          </div>
        </div>
      )}

      {/* Card principale */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16, flexWrap:'wrap', gap: 12}}>
          <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Conti</div>
              <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{filtered.length} {filtered.length === 1 ? 'conto' : 'conti'} trovati</div>
            </div>
            {/* Filtri canale */}
            <div style={{display:'flex', gap: 8, flexWrap:'wrap'}}>
              {[
                {id:'all',     label:'Tutti'},
                {id:'asporto', label:'Asporto'},
                {id:'sala',    label:'Sala'},
              ].map(t => (
                <FilterChip key={t.id} active={canale===t.id} onClick={() => setCanale(t.id)} label={t.label}/>
              ))}
            </div>
          </div>
          {nonSaldati.length > 0 && (
            <button
              onClick={() => setActiveFilter(activeFilter==='da_saldare' ? 'all' : 'da_saldare')}
              style={{
                display:'inline-flex', alignItems:'center', gap: 8,
                padding:'7px 14px', borderRadius: C.R_PILL,
                background: activeFilter==='da_saldare' ? '#DC2626' : '#FEF2F2',
                border: `1px solid ${activeFilter==='da_saldare' ? '#DC2626' : '#FECACA'}`,
                color: activeFilter==='da_saldare' ? '#fff' : '#991B1B',
                fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>
              <span style={{
                width:8, height:8, borderRadius:'50%',
                background: activeFilter==='da_saldare' ? '#fff' : '#DC2626',
              }}/>
              {nonSaldati.length} da saldare
            </button>
          )}
        </div>

        {/* Ricerca */}
        <div style={{display:'flex', gap: 10, marginBottom: 14, flexWrap:'wrap'}}>
          <div style={{
            flex:'1 1 240px', display:'flex', alignItems:'center', gap: 8,
            padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            background: PN.WHITE,
          }}>
            <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
            <input
              type="text"
              placeholder="Cerca tavolo o cliente…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit',
              }}
            />
          </div>
          {/* Stesso bottone e stesso popover della Cassa, stessa posizione
              rispetto alla ricerca: chi ha imparato il gesto di là lo ritrova
              identico di qua. */}
          <div ref={periodoRef} style={{position:'relative'}}>
            <button onClick={() => setPeriodoOpen(o => !o)}
              style={{...iconBtn, transition: 'background 140ms ease, border-color 140ms ease, transform 130ms ease'}}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}>
              <Ic.calendar size={14}/> {ccPeriodoLabel(periodo)}
            </button>
            {periodoOpen && (
              <CcPeriodoPicker
                selected={periodo}
                onPick={(p) => { setPeriodo(p); setPeriodoOpen(false); }}
                onClear={() => { setPeriodo(null); setPeriodoOpen(false); }}
              />
            )}
          </div>
        </div>

        {/* Tabella o stato vuoto */}
        {filtered.length === 0 ? (
          <div style={{
            padding:'40px 20px', textAlign:'center',
            background: C.SURF, borderRadius: C.R_MD,
            color: PN.MUTED,
          }}>
            <div style={{fontSize: C.T_SM, fontWeight: 600}}>Nessun conto trovato</div>
            <div style={{fontSize: C.T_XS, marginTop: 6}}>Nessun conto corrisponde ai filtri</div>
          </div>
        ) : (
          <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`, ...STSCROLL()}}>
            <div style={{
              display:'grid',
              gridTemplateColumns:'0.7fr 0.7fr 0.7fr 1.1fr 0.9fr 0.8fr 110px', ...STMIN(640),
              padding:'10px 14px', background: C.TH_BG,
              fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
              textTransform:'uppercase', letterSpacing: 0.5,
            }}>
              {/* Cliccabile è il nome, non la cella: prima si allargava per
                  tutta la colonna — `alignSelf:'stretch'` più i margini
                  negativi a riempire il padding della testata — e a
                  ordinamento attivo si campiva l'intero riquadro. Che
                  l'ordinamento sia acceso lo dicono già il testo più scuro e
                  la freccia, senza colorare mezza intestazione. */}
              <span
                onClick={toggleSortData}
                style={{
                  cursor:'pointer', userSelect:'none',
                  justifySelf:'start', alignSelf:'center',
                  display:'inline-flex', alignItems:'center', gap:4,
                  color: sortData ? PN.TEXT : C.TH_TEXT,
                  transition:'color .15s',
                }}
                title="Ordina per data">
                Data
                <span style={{
                  display:'inline-flex',
                  opacity: sortData ? 1 : 0.35,
                  transform: sortData === 'asc' ? 'rotate(180deg)' : 'none',
                  transition:'transform .15s',
                }}><PnI.ChevronDown size={11}/></span>
              </span>
              <span>Ora</span>
              <span>Origine</span>
              <span>Riferimento</span>
              <span style={{textAlign:'center'}}>Totale</span>
              <span style={{textAlign:'center'}}>Da saldare</span>
              <span/>
            </div>
            <MaxRowsScroll maxRows={10}>
            {filtered.map((conto, i) => {
              // La riga aperta resta marcata sotto al foglio: chiudendolo si
              // vede subito da dove si è tornati.
              const isAperto = !!contoAperto && contoAperto.id === conto.id;
              return (
                <React.Fragment key={conto.id}>
                  <div
                    data-row
                    data-conto-id={conto.id}
                    onClick={() => setContoAperto(conto)}
                    onMouseEnter={e => { if (!isAperto) e.currentTarget.style.background = '#F7F8FA'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isAperto ? PN.PINK_SOFT : PN.WHITE; }}
                    style={{
                      display:'grid',
                      gridTemplateColumns:'0.7fr 0.7fr 0.7fr 1.1fr 0.9fr 0.8fr 110px', ...STMIN(640),
                      padding:'12px 14px', alignItems:'center',
                      fontSize: C.T_SM, color: PN.TEXT,
                      borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                      background: isAperto ? PN.PINK_SOFT : PN.WHITE,
                      boxShadow: isAperto ? `inset 3px 0 0 ${PN.PINK}` : 'none',
                      cursor:'pointer',
                      transition:'background 0.12s, box-shadow 0.12s',
                    }}>
                    <span style={{
                      fontWeight: 500,
                      color: sortData ? PN.TEXT : PN.MUTED,
                      fontVariantNumeric:'tabular-nums',
                      alignSelf:'stretch',
                      display:'flex', alignItems:'center',
                      margin:'-12px 0', padding:'12px 8px',
                      background: sortData ? C.SURF_ALT : 'transparent',
                      transition:'background .15s',
                    }}>{fmtData(conto.dataOra)}</span>
                    <span style={{
                      fontWeight: 500, color: PN.MUTED, fontSize: C.T_XS,
                      fontVariantNumeric:'tabular-nums',
                    }}>{oraChiusura(conto)}</span>
                    <span style={{fontWeight:600, color: PN.TEXT, display:'inline-flex', alignItems:'center', gap:6}}>
                      <span style={{
                        display:'inline-flex',
                        color: isAperto ? PN.PINK_DARK : PN.MUTED_LIGHT,
                        transition:'color .15s',
                      }}><PnI.ChevronRight size={11}/></span>
                      {conto.tavolo}
                    </span>
                    <span style={{display:'inline-flex', alignItems:'center', gap:6, minWidth:0}}>
                      {conto.riferimento ? (
                        <React.Fragment>
                          {conto.riferimento.tipo === 'byup' && <ByupMark size={14}/>}
                          <span style={{
                            fontWeight: 600, color: PN.TEXT,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                          }}>{conto.riferimento.nome}</span>
                        </React.Fragment>
                      ) : (
                        <span style={{color: PN.MUTED}}>—</span>
                      )}
                    </span>
                    <span style={{fontWeight:800, color: PN.TEXT, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, textAlign:'center'}}>
                      €{conto.totaleConto.toFixed(2)}
                    </span>
                    <span style={{
                      fontWeight: 600, fontSize: C.T_XS, fontVariantNumeric:'tabular-nums', textAlign:'center',
                      color: conto.stato === 'saldato' ? PN.MUTED_SOFT : PN.TEXT,
                    }}>
                      {conto.stato === 'saldato' ? '—' : `€${conto.daSaldare.toFixed(2)}`}
                    </span>
                    <span style={{textAlign:'right'}} onClick={e => e.stopPropagation()}>
                      {conto.stato === 'non_saldato' && !saldati.has(conto.id) && (
                        <button
                          onClick={() => setModalPagamento(conto)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#2E333C'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 17, 21, 0.30)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = PN.TEXT; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
                          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                          style={{
                            padding:'7px 12px', background: PN.TEXT, color:'#fff',
                            border:'none', borderRadius: 9, fontSize: C.T_XS,
                            fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                            transition:'background 130ms ease, box-shadow 150ms ease, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1)',
                          }}>
                          Vai al conto
                        </button>
                      )}
                      {conto.stato === 'non_saldato' && saldati.has(conto.id) && (
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          padding:'4px 10px', borderRadius: C.R_PILL,
                          background:'#D1FAE5', color:'#065F46',
                          fontSize: C.T_XS, fontWeight:600,
                        }}>✓ Saldato</span>
                      )}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            </MaxRowsScroll>
          </div>
        )}
      </div>

      {/* Dettaglio del conto — al posto del pannello che si apriva sotto la riga */}
      {contoAperto && (
        <ContoDettaglioSheet
          conto={contoAperto}
          saldato={saldati.has(contoAperto.id)}
          getStato={rettDi}
          onClose={() => setContoAperto(null)}
          onDettaglio={(c, p) => setDettaglioScontrino({ conto: c, payment: p })}
          onScarto={(p) => setScartoPay({ conto: contoAperto, payment: p })}
          onSalda={(c) => { setContoAperto(null); setModalPagamento(c); }}
        />
      )}

      {/* Dettaglio scontrino: il documento, le sue righe, e da lì Stampa/Rendi/Annulla */}
      {dettaglioScontrino && (
        <ScontrinoDettaglioModal
          conto={dettaglioScontrino.conto}
          payment={dettaglioScontrino.payment}
          rett={rettDi(dettaglioScontrino.payment)}
          onClose={() => setDettaglioScontrino(null)}
          onAnnulla={() => apriRimborso(dettaglioScontrino.conto, dettaglioScontrino.payment, 'annullo', dettaglioScontrino.payment.amount)}
          onReso={(amount, porzioni) => apriRimborso(dettaglioScontrino.conto, dettaglioScontrino.payment, 'reso', amount, porzioni)}
        />
      )}

      {/* Modal rimborso — SOLO il "come tornano i soldi": cosa si sta
          restituendo (tutto o alcune righe) l'ha già deciso il dettaglio
          scontrino. Il metodo dipende dal canale del pagamento originale. */}
      {modalRimborso && (() => {
        const { conto, payment, tipo, amount } = modalRimborso;
        // contanti → restituzione manuale in cassa; carta/byup/altro → rimborso Stripe
        const useStripe = payment.method !== 'contanti';
        const channelLabel = payment.method === 'byup' ? 'Byup app' : payment.method === 'carta' ? 'Carta' : payment.method === 'piattaforma' ? 'Piattaforma' : 'Contanti';
        const titolo = tipo === 'annullo' ? 'Annulla scontrino' : 'Reso';
        return (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0,
          background:'rgba(15,17,21,0.42)', zIndex: 999,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'inherit',
        }} onClick={chiudiRimborso}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...PN.GLASS_STRONG, borderRadius: 20,
              padding: 32, maxWidth: 440, width:'100%',
            }}>
            {rimborsoStep === 'metodo' ? (
              <React.Fragment>
                <h2 style={{margin:'0 0 4px 0', fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
                  {titolo}
                </h2>
                <p style={{margin:'0 0 24px 0', fontSize: C.T_SM, color: PN.MUTED}}>
                  {conto.cliente} · {channelLabel} · €{amount.toFixed(2)}
                </p>
                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:24}}>
                  {useStripe ? (
                    <button
                      onClick={() => setRimborsoStep('conferma')}
                      style={{
                        padding:'14px 16px', background:'#4F46E5', color:'#fff',
                        border:'none', borderRadius: C.R_SM,
                        fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        textAlign:'left',
                      }}>
                      Rimborsa tramite Stripe
                      <div style={{fontSize: C.T_XS, fontWeight:500, opacity:0.8, marginTop:3}}>
                        {payment.method === 'byup'
                          ? 'Il cliente riceverà il rimborso sul metodo collegato all\'app Byup'
                          : 'Il cliente riceverà il rimborso sulla carta originale'}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setRimborsoStep('conferma')}
                      style={{
                        padding:'14px 16px', background:'#F9FAFB', color: PN.TEXT,
                        border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
                        fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        textAlign:'left',
                      }}>
                      Rimborso con contanti
                      <div style={{fontSize: C.T_XS, fontWeight:500, color: PN.MUTED, marginTop:3}}>
                        Restituzione manuale in cassa
                      </div>
                    </button>
                  )}
                </div>
                <button
                  onClick={chiudiRimborso}
                  style={{
                    width:'100%', padding:'10px 16px', background: PN.WHITE,
                    border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                    fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  }}>
                  Annulla
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h2 style={{margin:'0 0 4px 0', fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>
                  {tipo === 'annullo' ? 'Confermi l\'annullo?' : 'Confermi il reso?'}
                </h2>
                <p style={{margin:'0 0 24px 0', fontSize: C.T_SM, color: PN.MUTED}}>
                  {useStripe ? 'Stripe' : 'Contanti'} · {conto.cliente} · €{amount.toFixed(2)}
                </p>
                <div style={{display:'flex', gap:10}}>
                  <button
                    onClick={() => setRimborsoStep('metodo')}
                    style={{
                      flex:1, padding:'10px 16px', background: PN.WHITE,
                      border:`1px solid ${PN.BORDER}`, borderRadius: 9,
                      fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                    }}>
                    Indietro
                  </button>
                  <button
                    onClick={confermaRimborso}
                    style={{
                      flex:1, padding:'10px 16px',
                      background: useStripe ? '#4F46E5' : PN.TEXT,
                      color:'#fff', border:'none', borderRadius: 9,
                      fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    }}>
                    Conferma
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        );
      })()}

      {/* Modal pagamento — SalaSaldaModal (sala-salda-modal.jsx è caricato prima in pagina) */}
      {modalPagamento && (
        <SalaSaldaModal
          open={true}
          tavolo={{
            id: (modalPagamento.tavolo.match(/\d+/) || [])[0],
            party: modalPagamento.cliente || '',
            coperti: 1,
            guests: [],
            ordini: modalPagamento.ordini || [{ id: modalPagamento.id + '-1', nome: 'Saldo conto', prezzo: modalPagamento.daSaldare, qty: 1 }],
          }}
          onClose={() => setModalPagamento(null)}
          onConfirm={(esito) => { if (!esito || esito.saldato !== false) setSaldati(s => new Set([...s, modalPagamento.id])); }}
        />
      )}

      {/* Dettaglio dello scarto del singolo documento */}
      {scartoPay && (
        <DocScartoSheet
          conto={scartoPay.conto}
          payment={scartoPay.payment}
          onClose={() => setScartoPay(null)}
        />
      )}
    </div>
  );
}

window.ContConti = ContConti;
window.PagamentoFiscChip = PagamentoFiscChip;
window.DocScartoSheet = DocScartoSheet;

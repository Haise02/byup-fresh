// Economix — costi, ricavi e proiezione di Byup.
//
// MODELLO DI RICAVO (app/Contesto-App.md §C): byup NON guadagna sull'app né sui
// pagamenti. Le commissioni Stripe sono riproiettate ai ristoratori e non
// toccano questo conto economico: compaiono come partita di giro, dichiarata,
// perché un auditor o un investitore la cerca e non trovarla è peggio.
// Il ricavo è l'abbonamento a Byup Fresh, a consumo di TRANSAZIONI PESATE:
// un pagamento in app pesa 0,5, uno in cassa 1,0. Spingere l'app dimezza la
// quota consumata dal locale — e quindi riduce il ricavo da ordini extra.
//
// MODELLO DI COSTO: guidato dai driver. Nessuna riga di costo è un numero
// scritto a mano nel futuro: ogni riga è una formula su un driver moltiplicata
// per un prezzo unitario. È l'unica forma di proiezione che si può difendere
// riga per riga, ed è per questo che si usa in ambito SaaS al posto dei modelli
// di serie storica: quelli proiettano la curva senza sapere perché sale.

const ECO_OGGI = new Date();
const ECO_MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const ecoEtichettaMese = (d) => `${ECO_MESI[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
const ecoGiorniNelMese = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
// Il segno sta PRIMA del simbolo: «€-6.309» si legge come un euro negativo,
// «-€6.309» come un importo negativo. E i prezzi unitari sotto il centesimo
// vogliono piu decimali, altrimenti una tariffa vera diventa «€0,00».
const ecoSegno = (n, corpo) => (n < 0 ? '−€' : '€') + corpo;
const ecoEur = (n) => (n == null ? '—' : ecoSegno(n, Math.abs(Math.round(n)).toLocaleString('it-IT', {useGrouping:true})));
const ecoEur2 = (n) => {
  if (n == null) return '—';
  const dec = Math.abs(n) > 0 && Math.abs(n) < 0.01 ? 5 : 2;
  return ecoSegno(n, Math.abs(n).toLocaleString('it-IT', {useGrouping:true, minimumFractionDigits:dec, maximumFractionDigits:dec}));
};

// ─── Regime fiscale ────────────────────────────────────────────────────────
// La startup innovativa NON paga meno IRES o IRAP: quel vantaggio non esiste,
// le agevolazioni vere sono per chi investe. Ciò che cambia davvero il conto
// economico sono le PERDITE PREGRESSE: quelle dei primi tre esercizi si usano
// al 100% del reddito, le successive fino all'80%. Con perdite accumulate
// l'imposta dovuta resta zero finché non vengono assorbite — mostrare IRES
// piena su una società in perdita darebbe un numero falso.
const ECO_REGIME = {
  tipo: 'innovativa',            // 'innovativa' | 'ordinaria'
  ires: 24,                      // %
  irap: 3.9,                     // % — aliquota ordinaria, varia per regione
  perditePregresse: 128400,      // € riportabili
  primiTreEsercizi: true,        // perdite utilizzabili al 100% invece che all'80%
};
const ECO_REGIMI = {
  innovativa: { label:'Startup innovativa',
    nota:'Nessuno sconto su IRES o IRAP: il vantaggio fiscale è per chi investe, non per la società. Qui contano le perdite pregresse.' },
  ordinaria:  { label:'Regime ordinario',
    nota:'Stesse aliquote. Cambiano gli obblighi societari e l’uso delle perdite oltre il terzo esercizio, limitate all’80% del reddito.' },
};

// ─── Servizi a consumo ─────────────────────────────────────────────────────
// `driver` dice DA COSA dipende il consumo, `perUnita` quanto se ne consuma per
// unità di driver, `prezzo` quanto costa l'unità di consumo. Il costo di un
// mese è driver × perUnita × prezzo — e quindi si proietta senza inventare.
//
// `fonte` distingue ciò che una connessione leggerebbe da sola da ciò che va
// caricato a mano. Oggi nessuna connessione è attiva: i valori sono plausibili
// e la riga lo dichiara, perché un costo "letto" che in realtà è inventato è la
// bugia più facile da raccontarsi.
const ECO_SERVIZI = [
  { id:'aws-compute', nome:'AWS · Fargate', categoria:'Cloud', fornitore:'Amazon Web Services',
    driver:'localiAttivi', perUnita:2.4, unita:'vCPU-ora', unitaSing:'vCPU-ora', prezzo:0.0445,
    fonte:'aws-cost-explorer', scarto:1.071, nota:'Il compute scala con i locali attivi, non con gli ordini: ogni locale tiene sessioni aperte anche a sala vuota.' },
  { id:'aws-rds', nome:'AWS · RDS PostgreSQL', categoria:'Cloud', fornitore:'Amazon Web Services',
    driver:'localiAttivi', perUnita:1, unita:'locali', unitaSing:'locale', prezzo:1.85,
    fonte:'aws-cost-explorer', scarto:0.964, nota:'Istanza condivisa: il costo per locale scende crescendo, qui tenuto lineare in via prudenziale.' },
  { id:'aws-s3', nome:'AWS · S3 e CloudFront', categoria:'Cloud', fornitore:'Amazon Web Services',
    driver:'utentiApp', perUnita:0.42, unita:'GB trasferiti', unitaSing:'GB', prezzo:0.085,
    fonte:'aws-cost-explorer', scarto:1.118, nota:'Immagini dei menu servite agli utenti app: è il driver che cresce più in fretta.' },
  { id:'vercel', nome:'Vercel · hosting statico', categoria:'Cloud', fornitore:'Vercel',
    driver:'fisso', perUnita:1, unita:'canone', unitaSing:'mese', prezzo:20,
    fonte:'manuale', nota:'Piano a canone, indipendente dal volume.' },
  { id:'anthropic', nome:'Anthropic · elaborazione menu', categoria:'API', fornitore:'Anthropic',
    driver:'nuoviLocali', perUnita:1, unita:'menu', unitaSing:'menu', prezzo:2.10,
    fonte:'manuale', nota:'Si paga una volta per locale in onboarding: il costo segue le ATTIVAZIONI, non la base installata. È l’unica riga che scende se la crescita rallenta.' },
  { id:'maps', nome:'Google Maps Platform', categoria:'API', fornitore:'Google',
    driver:'utentiApp', perUnita:11, unita:'richieste', unitaSing:'richiesta', prezzo:0.005,
    fonte:'manuale', nota:'Discovery e geolocalizzazione: circa undici richieste per utente attivo al mese.' },
  { id:'push', nome:'Firebase · notifiche push', categoria:'API', fornitore:'Google',
    driver:'utentiApp', perUnita:24, unita:'notifiche', unitaSing:'notifica', prezzo:0.00018,
    fonte:'manuale', nota:'Sotto la soglia del piano gratuito il costo è zero: qui è già oltre.' },
  { id:'openapi', nome:'OpenAPI · trasmissione fiscale', categoria:'API', fornitore:'OpenAPI',
    driver:'transazioni', perUnita:1, unita:'trasmissioni', unitaSing:'trasmissione', prezzo:0.019, pacchetti:'openapi',
    fonte:'manuale', nota:'Una trasmissione per ogni pagamento, indipendentemente da dove avviene. Si acquista a pacchetti prepagati: il prezzo unitario scende col taglio.' },
];

// ─── Collegamenti ai fornitori ─────────────────────────────────────────────
// Non si collega un servizio, si collega una CREDENZIALE: un solo ruolo di sola
// lettura su AWS Cost Explorer accende insieme le tre righe AWS, perché è da lì
// che arrivano tutte. Modellarlo per servizio darebbe l'idea sbagliata di dover
// fare la stessa procedura tre volte.
//
// `letturaMTD` è il consuntivo del mese in corso letto dal fornitore. Non
// coincide mai esattamente con la stima del modello, ed è giusto così: lo
// scarto fra i due è l'informazione più utile della schermata — se una lettura
// si discosta molto, o il prezzo unitario è cambiato o il consumo non è quello
// che credevi.
// I metodi sono quattro e non si equivalgono. «Collega» come pulsante unico
// esiste solo per l'OAuth; negli altri casi il lavoro vero avviene sulla console
// del fornitore e qui si incolla soltanto il risultato — o, per lo SDI, si
// aspettano giorni perche la delega e un atto amministrativo, non una chiamata.
// Quattro stati, non due. Il piu importante e ERRORE: un token scaduto o un
// ruolo cancellato non spegne niente in modo visibile — i costi tornano a essere
// stimati e nessuno se ne accorge finche non arriva la fattura. E' la ragione
// per cui questa schermata esiste.
const ECO_STATO_CONN = {
  attivo:  { label:'Attivo',         tono:'OK' },
  errore:  { label:'Non risponde',   tono:'DANGER' },
  assente: { label:'Non collegato',  tono:'WARN' },
  manuale: { label:'Lettura manuale',tono:'NEUTRAL' },
};

const ECO_CONNESSIONI = [
  // IL CONTO CORRENTE, via CAMT.053. Due strade esistono e non si equivalgono.
  //
  // PSD2 e' lo standard europeo aperto: un aggregatore con licenza AISP legge
  // saldo e movimenti quasi in tempo reale. Comodo, ma il consenso SCADE OGNI
  // 90 GIORNI e va rinnovato con una nuova autenticazione forte — ed e la
  // stessa forma di guasto silenzioso del token OAuth scaduto: nessuno se ne
  // accorge finche la cassa non smette di aggiornarsi.
  //
  // CAMT.053 e' il rendiconto ISO 20022 che la banca produce a fine giornata e
  // consegna via SFTP nel contratto di corporate banking. Non e in tempo reale
  // — il saldo e quello di chiusura — ma vince su due cose che contano di piu:
  //  - NON SCADE. E' un canale contrattuale, non un consenso da rinnovare.
  //  - RICONCILIA. Porta gli identificativi end-to-end, i riferimenti SEPA e
  //    l'IBAN della controparte, quindi un incasso si aggancia alla fattura da
  //    solo. PSD2 spesso da solo una descrizione libera, che si abbina a mano.
  //
  // Per Byup la riconciliazione conta piu del tempo reale: la domanda e "quanto
  // ho e quanto mi resta", non "questo bonifico e gia partito".
  { id:'banca', nome:'Conto corrente · CAMT.053', servizi:[], cassa:true,
    stato:'attivo', ultimaLettura:new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), ECO_OGGI.getDate(), 6, 40),
    metodo:'camt', cadenza:'ogni mattina', saldoAl:'chiusura di ieri',
    legge:'Rendiconto giornaliero: saldo di chiusura e movimenti con le causali strutturate',
    passi:['La banca deposita il file CAMT.053 su SFTP ogni mattina',
           'Si attiva dal contratto di corporate banking, di solito senza costi aggiuntivi',
           'Nessun consenso da rinnovare: e un canale contrattuale, non un permesso a scadenza'] },
  { id:'aws', nome:'AWS Cost Explorer', servizi:['aws-compute','aws-rds','aws-s3'],
    stato:'attivo', ultimaLettura:new Date(ECO_OGGI.getTime() - 26 * 60000), metodo:'ruolo',
    legge:'Costo maturato per servizio, aggiornato ogni sei ore',
    passi:['Un ruolo IAM con relazione di fiducia verso l’account di Byup e un ExternalId',
           'Policy ce:GetCostAndUsage soltanto — accesso agli importi, non ai dati',
           'L’ARN del ruolo sta nel gestore dei segreti, non in questa schermata'] },
  { id:'gcp', nome:'Google Cloud Billing', servizi:['maps','push'],
    stato:'errore', ultimaLettura:new Date(ECO_OGGI.getTime() - 4 * 86400000), metodo:'oauth',
    errore:'Token di aggiornamento scaduto', erroreDal:new Date(ECO_OGGI.getTime() - 4 * 86400000),
    legge:'Consumo di Maps Platform e Firebase, per SKU',
    passi:['Ripetere l’autorizzazione con l’account Google che possiede il progetto',
           'Verificare che l’esportazione della fatturazione su BigQuery sia ancora attiva',
           'I token OAuth di Google scadono se restano inutilizzati: succede, e va notato'] },
  { id:'anthropic', nome:'Anthropic Console', servizi:['anthropic'],
    stato:'assente', ultimaLettura:null, metodo:'chiave',
    legge:'Token consumati e costo per modello',
    passi:['Generare una chiave Admin di sola lettura dalla Console',
           'Depositarla nel gestore dei segreti con rotazione pianificata',
           'Il servizio la legge da lì all’avvio'] },
  { id:'openapi', nome:'OpenAPI', servizi:['openapi'],
    stato:'manuale', ultimaLettura:new Date('2026-07-04'), metodo:'chiave',
    legge:'Trasmissioni effettuate e credito residuo del pacchetto',
    passi:['Il pannello espone i consumi ma non un endpoint stabile',
           'Finché non c’è, la lettura mensile si inserisce a mano da qui'] },
  { id:'vercel', nome:'Vercel', servizi:['vercel'],
    stato:'manuale', ultimaLettura:new Date('2026-07-01'), metodo:'chiave',
    legge:'Canone del piano',
    passi:['Importo fisso: collegarlo non aggiunge nulla, si registra una volta'] },
  { id:'sdi', nome:'Sistema di Interscambio', servizi:[], fatture:true,
    stato:'assente', ultimaLettura:null, metodo:'delega',
    legge:'Fatture elettroniche ricevute, in XML',
    passi:['La delega alla consultazione si registra presso l’Agenzia delle Entrate',
           'Non è un collegamento tecnico e non dipende da noi: richiede giorni',
           'Da quel momento gli XML arrivano da soli e le fatture si compilano da sole'] },
];
const ecoConnessioneDi = (idServizio) =>
  ECO_CONNESSIONI.find(c => c.servizi.indexOf(idServizio) !== -1) || null;

// ─── Pacchetti prepagati ───────────────────────────────────────────────────
// OpenAPI non fattura a consumo: si comprano tagli prepagati e il prezzo
// unitario scende salendo di taglio. Il taglio scelto NON e una scelta di
// prezzo soltanto: e una scelta di cassa, perche il credito e denaro fermo.
const ECO_PACCHETTI = {
  openapi: {
    fornitore:'OpenAPI', unita:'trasmissioni',
    attivo:'p50', residuo:18400, scadenzaMesi:12,
    tagli:[
      { id:'p5',   quantita:5000,   prezzo:145 },
      { id:'p25',  quantita:25000,  prezzo:595 },
      { id:'p50',  quantita:50000,  prezzo:950 },
      { id:'p200', quantita:200000, prezzo:3180 },
      { id:'p500', quantita:500000, prezzo:7250 },
    ],
  },
};
const ecoTaglio = (pk, id) => pk.tagli.find(t => t.id === id) || pk.tagli[0];
const ecoPrezzoUnitario = (t) => t.prezzo / t.quantita;

// ─── Costi fissi ───────────────────────────────────────────────────────────
// `periodicita`: 'mensile' | 'annuale' | 'una-tantum'. Gli annuali entrano nel
// mese di competenza ma pesano sul dodicesimo nel riclassificato mensile.
// `fattura` collega la voce al documento che la prova. Da quel collegamento
// discende la FONTE: una voce che nasce da una fattura letta dallo SDI e
// automatica, una scritta a mano e manuale — e la differenza dice quanto vale.
const ECO_FISSI = [
  { id:'F-01', voce:'Compenso amministratore', categoria:'Personale', importo:2800, periodicita:'mensile',
    dal:new Date('2025-01-01'), a:null, fornitore:'—', nota:'Unico rapporto continuativo.' },
  { id:'F-02', voce:'Consulenti a partita IVA', categoria:'Personale', importo:6400, periodicita:'mensile',
    dal:new Date('2025-03-01'), a:null, fornitore:'Vari', nota:'Sviluppo, design e supporto. Variano di mese in mese: qui la media degli ultimi sei.' },
  { fattura:'FT-2026-038', id:'F-03', voce:'Commercialista', categoria:'Consulenze', importo:280, periodicita:'mensile',
    dal:new Date('2025-01-01'), a:null, fornitore:'Studio Marchetti' },
  { fattura:'FT-2026-040', id:'F-04', voce:'Consulenza ISO 27001 e 9001', categoria:'Consulenze', importo:9800, periodicita:'una-tantum',
    dal:new Date('2026-03-10'), a:null, fornitore:'Studio Bianchi & Associati',
    nota:'Percorso di certificazione: audit interno, metodologia, documentazione.' },
  { id:'F-05', voce:'Google Workspace', categoria:'Software', importo:11.5, periodicita:'mensile',
    dal:new Date('2025-01-01'), a:null, fornitore:'Google', nota:'Per utenza, 6 utenze attive.' },
  { id:'F-06', voce:'ClickUp', categoria:'Software', importo:38, periodicita:'mensile',
    dal:new Date('2025-06-01'), a:null, fornitore:'ClickUp' },
  { id:'F-07', voce:'Registrazione dominio e certificati', categoria:'Software', importo:96, periodicita:'annuale',
    dal:new Date('2026-02-01'), a:null, fornitore:'Registrar' },
  { id:'F-08', voce:'Assicurazione RC professionale', categoria:'Assicurazioni', importo:1450, periodicita:'annuale',
    dal:new Date('2026-01-15'), a:null, fornitore:'Generali' },
  { id:'F-09', voce:'Campagne di acquisizione locali', categoria:'Marketing', importo:1800, periodicita:'mensile',
    dal:new Date('2025-09-01'), a:null, fornitore:'Meta e Google Ads',
    nota:'È il costo che genera i nuovi locali: nel modello di proiezione è la leva su cui agire per cambiare la crescita.' },
  { id:'F-10', voce:'Notaio e costituzione', categoria:'Consulenze', importo:3200, periodicita:'una-tantum',
    dal:new Date('2024-11-20'), a:null, fornitore:'Notaio Ferri' },
];

// ─── Fatture caricate ──────────────────────────────────────────────────────
// In produzione la fattura elettronica arriva dallo SDI in XML strutturato:
// i dati si LEGGONO, non si indovinano con l'OCR. `origine` dice se la riga
// verrebbe da lì o da un caricamento manuale.
const ECO_FATTURE = [
  { id:'FT-2026-041', fornitore:'Amazon Web Services', numero:'EUINGB26-1180432', piva:'IE9827384L', data:new Date('2026-07-03'),
    imponibile:412.80, iva:0, totale:412.80, categoria:'Cloud', voce:'aws-compute',
    origine:'sdi', file:'AWS-2026-06.xml', stato:'riconciliata',
    nota:'Reverse charge: IVA assolta dal committente.' },
  { id:'FT-2026-040', fornitore:'Studio Bianchi & Associati', numero:'42/2026', piva:'IT04182730875', data:new Date('2026-06-28'),
    imponibile:3200, iva:704, totale:3904, categoria:'Consulenze', voce:'F-04',
    origine:'sdi', file:'Bianchi-42-2026.xml', stato:'riconciliata' },
  { id:'FT-2026-039', fornitore:'Google Cloud EMEA', numero:'IE-2026-77120', piva:'IE6388047V', data:new Date('2026-06-30'),
    imponibile:88.40, iva:0, totale:88.40, categoria:'API', voce:'maps',
    origine:'sdi', file:'Google-2026-06.xml', stato:'riconciliata' },
  { id:'FT-2026-038', fornitore:'Studio Marchetti', numero:'118/2026', piva:'IT03918260484', data:new Date('2026-06-30'),
    imponibile:280, iva:61.60, totale:341.60, categoria:'Consulenze', voce:'F-03',
    origine:'manuale', file:'Marchetti-118.pdf', stato:'da-riconciliare',
    nota:'Caricata a mano prima che il collegamento SDI fosse attivo.' },
];

// ─── Cassa ─────────────────────────────────────────────────────────────────
// La cassa non e il conto economico. Un costo di competenza di giugno pagato a
// settembre pesa sul risultato a giugno e sulla cassa a settembre: sono due
// verita diverse, ed e proprio nello scarto fra le due che le societa muoiono
// pur essendo redditizie sulla carta.
//
// `giorniIncasso` e `giorniPagamento` sono lo sfasamento medio: gli abbonamenti
// si incassano subito perche vanno su addebito, i fornitori si pagano a 30 giorni.
const ECO_CASSA = {
  saldoBanca: 84200,
  saldoContanti: 0,
  giorniIncasso: 2,          // addebito ricorrente: quasi immediato
  giorniPagamento: 30,       // termini medi verso fornitori
  fidoBancario: 0,
};

// Registro dei pagamenti effettuati e dei rinvii. La chiave identifica la
// SINGOLA occorrenza — "F-01@2026-08" — non la voce: un canone mensile pagato
// ad agosto deve restare da pagare a settembre.
const ECO_PAGATI = {};
const ECO_RINVII = {};

// Scadenze con un calendario proprio, che non si deducono dai costi ricorrenti.
// `costo:false` sulle voci che sono movimenti di cassa ma NON costi: l'IVA si
// versa, non si spende — e finita nel conto economico sarebbe un errore.
const ECO_SCADENZE = [
  { id:'S1', voce:'Liquidazione IVA del trimestre', tipo:'iva', costo:false,
    quando:new Date(ECO_OGGI.getFullYear(), 7, 16),
    importo:null, nota:'Si calcola dalla differenza fra IVA sulle vendite e IVA sugli acquisti del trimestre.' },
  { id:'S2', voce:'Primo acconto IRES e IRAP', tipo:'imposte', costo:false, quando:new Date(ECO_OGGI.getFullYear(), 5, 30),
    importo:0, nota:'Zero: si calcola sull\'imposta dell\'esercizio precedente, che era nulla per via delle perdite.' },
  { id:'S3', voce:'Secondo acconto IRES e IRAP', tipo:'imposte', costo:false, quando:new Date(ECO_OGGI.getFullYear(), 10, 30),
    importo:0, nota:'Come sopra: nessun acconto dovuto finche l\'imposta di riferimento resta zero.' },
  { id:'S4', voce:'Rinnovo assicurazione RC professionale', tipo:'fornitore', costo:true, quando:new Date(ECO_OGGI.getFullYear() + 1, 0, 15),
    importo:1450, nota:'Annuale, esce in un colpo solo.' },
];

// ─── Stato patrimoniale ────────────────────────────────────────────────────
// Le voci che NON si deducono dal conto economico e vanno inserite: capitale,
// riserve, perdite portate a nuovo, cespiti. Il resto — crediti, debiti, cassa,
// risultato d'esercizio — si calcola.
const ECO_PATRIMONIO = {
  capitaleSociale: 10000,
  riserve: 0,
  // Le perdite portate a nuovo NON sono un dato inserito: sono la somma dei
  // risultati degli esercizi precedenti, e calcolarle invece di scriverle
  // toglie l'unico numero che poteva invecchiare in silenzio.
  // Somma dei versamenti effettivamente fatti dai soci: non un numero tondo
  // perche non lo e mai — sono piu bonifici in momenti diversi.
  versamentiSoci: 218284,
  immobiliMateriali: 4800,       // portatili e attrezzatura
  fondoAmmortamento: -1920,
  creditiTributari: 3200,        // credito d'imposta R&S maturato
  debitiBanche: 0,
  aggiornatoIl: new Date('2026-06-30'),
};

// ─── Serie storica dei driver ──────────────────────────────────────────────
// Ancorata a OGGI: la serie che c'era finiva a dicembre 2025 e sarebbe partita
// da una base morta. Qui gli ultimi dodici mesi chiusi più quello in corso.
//
// I numeri sono coerenti con la base reale di Spot (25 locali attivi) e con la
// distribuzione per piano: non sono una curva disegnata a mano.
function ecoStoricoDriver() {
  // Dalla partenza operativa (gennaio 2025) al mese in corso, che e parziale.
  // Serve arrivare fin li per poter confrontare un anno con l'altro: con soli
  // tredici mesi il 2025 sarebbe un mezzo anno e il paragone direbbe il falso.
  const out = [];
  const inizio = new Date(2025, 0, 1);
  const fine = new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), 1);
  const n = (fine.getFullYear() - inizio.getFullYear()) * 12 + (fine.getMonth() - inizio.getMonth());
  for (let t = 0; t <= n; t++) {
    const d = new Date(inizio.getFullYear(), inizio.getMonth() + t, 1);
    const nuovi = Math.round(0.8 + t * 0.30);
    const attiviPrec = out.length ? out[out.length - 1].localiAttivi : 4;
    const churn = out.length ? Math.round(attiviPrec * 0.028) : 0;
    const attivi = Math.max(1, attiviPrec + nuovi - churn);
    const ordiniPerLocale = Math.round(560 + t * 17);
    const transazioni = Math.round(attivi * ordiniPerLocale);
    const quotaApp = Math.min(0.62, 0.20 + t * 0.024);
    out.push({
      mese: ecoEtichettaMese(d), data: d, indice: t, anno: d.getFullYear(),
      nuoviLocali: nuovi, churn, localiAttivi: attivi,
      ordiniPerLocale, transazioni, quotaApp,
      transazioniPesate: Math.round(transazioni * (quotaApp * 0.5 + (1 - quotaApp) * 1.0)),
      utentiApp: Math.round(attivi * (30 + t * 2.2)),
      fisso: 1,
      corrente: t === n,
    });
  }
  return out;
}
const ECO_STORICO = ecoStoricoDriver();

window.ECO_OGGI = ECO_OGGI;
window.ECO_MESI = ECO_MESI;
window.ecoEtichettaMese = ecoEtichettaMese;
window.ecoGiorniNelMese = ecoGiorniNelMese;
// toFixed produce sempre il punto: in italiano il separatore decimale e la virgola.
const ecoPct = (n, dec) => `${n.toFixed(dec == null ? 1 : dec).replace('.', ',')}%`;

window.ecoPct = ecoPct;
window.ecoSegno = ecoSegno;
window.ecoEur = ecoEur;
window.ecoEur2 = ecoEur2;
window.ECO_REGIME = ECO_REGIME;
window.ECO_REGIMI = ECO_REGIMI;
window.ECO_SERVIZI = ECO_SERVIZI;
window.ECO_CONNESSIONI = ECO_CONNESSIONI;
window.ECO_PACCHETTI = ECO_PACCHETTI;
window.ecoTaglio = ecoTaglio;
window.ecoPrezzoUnitario = ecoPrezzoUnitario;
window.ecoConnessioneDi = ecoConnessioneDi;
window.ECO_STATO_CONN = ECO_STATO_CONN;
window.ECO_FISSI = ECO_FISSI;
window.ECO_FATTURE = ECO_FATTURE;
window.ECO_STORICO = ECO_STORICO;
window.ECO_CASSA = ECO_CASSA;
window.ECO_SCADENZE = ECO_SCADENZE;
window.ECO_PAGATI = ECO_PAGATI;
window.ECO_RINVII = ECO_RINVII;
window.ECO_PATRIMONIO = ECO_PATRIMONIO;

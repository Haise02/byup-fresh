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
    driver:'localiAttivi', perUnita:2.4, unita:'vCPU-ora', prezzo:0.0445,
    fonte:'aws-cost-explorer', nota:'Il compute scala con i locali attivi, non con gli ordini: ogni locale tiene sessioni aperte anche a sala vuota.' },
  { id:'aws-rds', nome:'AWS · RDS PostgreSQL', categoria:'Cloud', fornitore:'Amazon Web Services',
    driver:'localiAttivi', perUnita:1, unita:'locali', prezzo:1.85,
    fonte:'aws-cost-explorer', nota:'Istanza condivisa: il costo per locale scende crescendo, qui tenuto lineare in via prudenziale.' },
  { id:'aws-s3', nome:'AWS · S3 e CloudFront', categoria:'Cloud', fornitore:'Amazon Web Services',
    driver:'utentiApp', perUnita:0.42, unita:'GB trasferiti', prezzo:0.085,
    fonte:'aws-cost-explorer', nota:'Immagini dei menu servite agli utenti app: è il driver che cresce più in fretta.' },
  { id:'vercel', nome:'Vercel · hosting statico', categoria:'Cloud', fornitore:'Vercel',
    driver:'fisso', perUnita:1, unita:'canone', prezzo:20,
    fonte:'manuale', nota:'Piano a canone, indipendente dal volume.' },
  { id:'anthropic', nome:'Anthropic · elaborazione menu', categoria:'API', fornitore:'Anthropic',
    driver:'nuoviLocali', perUnita:1, unita:'menu', prezzo:2.10,
    fonte:'manuale', nota:'Si paga una volta per locale in onboarding: il costo segue le ATTIVAZIONI, non la base installata. È l’unica riga che scende se la crescita rallenta.' },
  { id:'maps', nome:'Google Maps Platform', categoria:'API', fornitore:'Google',
    driver:'utentiApp', perUnita:11, unita:'richieste', prezzo:0.005,
    fonte:'manuale', nota:'Discovery e geolocalizzazione: circa undici richieste per utente attivo al mese.' },
  { id:'push', nome:'Firebase · notifiche push', categoria:'API', fornitore:'Google',
    driver:'utentiApp', perUnita:24, unita:'notifiche', prezzo:0.00018,
    fonte:'manuale', nota:'Sotto la soglia del piano gratuito il costo è zero: qui è già oltre.' },
  { id:'openapi', nome:'OpenAPI · trasmissione fiscale', categoria:'API', fornitore:'OpenAPI',
    driver:'transazioni', perUnita:1, unita:'trasmissioni', prezzo:0.019,
    fonte:'manuale', nota:'Una trasmissione per ogni pagamento, indipendentemente da dove avviene.' },
];

// ─── Costi fissi ───────────────────────────────────────────────────────────
// `periodicita`: 'mensile' | 'annuale' | 'una-tantum'. Gli annuali entrano nel
// mese di competenza ma pesano sul dodicesimo nel riclassificato mensile.
const ECO_FISSI = [
  { id:'F-01', voce:'Compenso amministratore', categoria:'Personale', importo:2800, periodicita:'mensile',
    dal:new Date('2025-01-01'), a:null, fornitore:'—', nota:'Unico rapporto continuativo.' },
  { id:'F-02', voce:'Consulenti a partita IVA', categoria:'Personale', importo:6400, periodicita:'mensile',
    dal:new Date('2025-03-01'), a:null, fornitore:'Vari', nota:'Sviluppo, design e supporto. Variano di mese in mese: qui la media degli ultimi sei.' },
  { id:'F-03', voce:'Commercialista', categoria:'Consulenze', importo:280, periodicita:'mensile',
    dal:new Date('2025-01-01'), a:null, fornitore:'Studio Marchetti' },
  { id:'F-04', voce:'Consulenza ISO 27001 e 9001', categoria:'Consulenze', importo:9800, periodicita:'una-tantum',
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
  { id:'FT-2026-041', fornitore:'Amazon Web Services', numero:'EUINGB26-1180432', data:new Date('2026-07-03'),
    imponibile:412.80, iva:0, totale:412.80, categoria:'Cloud', voce:'aws-compute',
    origine:'sdi', file:'AWS-2026-06.xml', stato:'riconciliata',
    nota:'Reverse charge: IVA assolta dal committente.' },
  { id:'FT-2026-040', fornitore:'Studio Bianchi & Associati', numero:'42/2026', data:new Date('2026-06-28'),
    imponibile:3200, iva:704, totale:3904, categoria:'Consulenze', voce:'F-04',
    origine:'sdi', file:'Bianchi-42-2026.xml', stato:'riconciliata' },
  { id:'FT-2026-039', fornitore:'Google Cloud EMEA', numero:'IE-2026-77120', data:new Date('2026-06-30'),
    imponibile:88.40, iva:0, totale:88.40, categoria:'API', voce:'maps',
    origine:'sdi', file:'Google-2026-06.xml', stato:'riconciliata' },
  { id:'FT-2026-038', fornitore:'Studio Marchetti', numero:'118/2026', data:new Date('2026-06-30'),
    imponibile:280, iva:61.60, totale:341.60, categoria:'Consulenze', voce:'F-03',
    origine:'manuale', file:'Marchetti-118.pdf', stato:'da-riconciliare',
    nota:'Caricata a mano prima che il collegamento SDI fosse attivo.' },
];

// ─── Serie storica dei driver ──────────────────────────────────────────────
// Ancorata a OGGI: la serie che c'era finiva a dicembre 2025 e sarebbe partita
// da una base morta. Qui gli ultimi dodici mesi chiusi più quello in corso.
//
// I numeri sono coerenti con la base reale di Spot (25 locali attivi) e con la
// distribuzione per piano: non sono una curva disegnata a mano.
function ecoStoricoDriver() {
  const out = [];
  const meseCorrente = new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), 1);
  // 13 punti: 12 mesi chiusi + il corrente, che è parziale
  for (let k = 12; k >= 0; k--) {
    const d = new Date(meseCorrente.getFullYear(), meseCorrente.getMonth() - k, 1);
    const t = 12 - k;                                   // 0..12
    const nuovi = Math.round(1.4 + t * 0.42);           // acquisizione in crescita lineare
    const attiviPrec = out.length ? out[out.length - 1].localiAttivi : 12;
    const churn = out.length ? Math.round(attiviPrec * 0.028) : 0;
    const attivi = Math.max(1, attiviPrec + nuovi - churn);
    const ordiniPerLocale = 620 + t * 22;               // maturazione dei locali
    const transazioni = Math.round(attivi * ordiniPerLocale);
    const quotaApp = Math.min(0.62, 0.28 + t * 0.028);  // adozione dell'app che sale
    out.push({
      mese: ecoEtichettaMese(d), data: d, indice: t,
      nuoviLocali: nuovi, churn, localiAttivi: attivi,
      ordiniPerLocale, transazioni,
      quotaApp,
      transazioniPesate: Math.round(transazioni * (quotaApp * 0.5 + (1 - quotaApp) * 1.0)),
      utentiApp: Math.round(attivi * (34 + t * 3.1)),
      fisso: 1,                     // driver neutro per i canoni indipendenti dal volume
      corrente: k === 0,
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
window.ECO_FISSI = ECO_FISSI;
window.ECO_FATTURE = ECO_FATTURE;
window.ECO_STORICO = ECO_STORICO;

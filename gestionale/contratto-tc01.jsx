// ─── TC-01 · proiezione del testo ufficiale (P-83) ─────────────────────────
//
// QUESTO FILE È UNA PROIEZIONE, NON UN TESTO. È la copia leggibile dal
// prototipo di TC-01, generata dal pacchetto legale (dove il testo vive
// davvero): non si modifica a mano, si rigenera. Nessuna copia del testo, nemmeno parziale, può vivere altrove nel
// prototipo: la schermata della firma (onboarding-step4-verifica.jsx) legge
// da qui, il download si costruisce da qui, la prova dell'accettazione
// registra versione e impronta di qui. Quando esisterà il backend, questa
// costante diventa una chiamata e nient'altro cambia.
//
// L'IMPRONTA si verifica al caricamento: è l'hash del testo delle clausole
// (numero, titolo, paragrafo, flag vessatoria) e sta scritta in testa. Se
// qualcuno ritocca una clausola a mano l'impronta non torna, e la finestra
// della firma lo dice invece di far firmare: un contratto firmato su un testo
// che non è quello depositato è un problema che si scopre nel momento
// peggiore, e qui non può succedere per costruzione. L'hash è FNV-1a a 32 bit,
// dichiaratamente un'impronta di prototipo: in produzione è quella del
// pacchetto legale (SHA-256 del documento depositato).
//
// REGOLA DEL SEGNAPOSTO (P-114 · D-107). Il prototipo è un mockup: questa
// finestra mostra COME FUNZIONA la firma, non riporta il TC-01 nella versione
// depositata. Il testo qui sotto è un segnaposto e resta tale; il testo vero
// sta in `T&C/Sorgenti markdown/`, fuori dal repository, nella versione
// corrente della cartella — il numero non si scrive qui, perché cambia a ogni
// revisione e il rimando si romperebbe di nuovo (è già successo con la 0.28,
// sostituita dalla 0.29 la notte fra il 3 e il 4 settembre 2026). Il segnaposto ha però
// un vincolo: non deve contraddire le decisioni né descrivere funzioni che il
// prodotto non ha. Per questo il 4 settembre 2026 sono cadute dall'art. 12 la
// ricezione delle fatture dei fornitori (il ciclo passivo è fuori dall'MVP e
// il modello non ha tabelle per le fatture ricevute) e la figura dell'
// incaricato indicato da Byup con rinnovo a suo carico (ritirata da D-103), e
// dall'art. 2 il «percorso di titolarità dell'Account», che D-104 dichiara
// inesistente nel prodotto.
//
// Nel merito il testo è un mock: clausole segnaposto fedeli nella SOSTANZA,
// che sanano le divergenze trovate nella rilettura del 28/08/2026 — Byup è
// TITOLARE autonomo per i clienti finali della Byup App e non responsabile
// ex art. 28; trasparenza P2B (Reg. UE 2019/1150); obblighi informativi
// fiscali; divieto di maggiorazioni per strumento di pagamento; cambio di
// fornitore — e riscrivono il prezzo sulle comande pesate e i coefficienti del
// piano (D-11/D-12) e l'account col lessico di D-57. La numerazione è
// allineata ai rimandi di Hubble (art. 1 prevalenza, art. 4 sospensione per
// morosità, art. 13 sospensione immediata per sicurezza, art. 15 accettazione
// tacita), che citano TC-01 per articolo: se cambia qui, cambia anche lì.
// Le clausole vessatorie ex artt. 1341-1342 c.c. sono segnate col flag
// `vessatoria` e l'elenco della seconda firma si RICAVA dai flag: niente
// array a parte da tenere allineato a mano.
// Code registrate, non risolte qui: le tre finestre di esportazione nel
// prototipo (60 giorni qui e in Hubble, 90 nella FAQ F-08) — i sessanta sono
// «da confermare alla rigenerazione»; il pacchetto di firma completo con
// DPA-01 e informativa in presa visione.

const TC01 = {
  codice: 'TC-01',
  nome: 'Termini e Condizioni di servizio di Byup Fresh',
  // La versione del SEGNAPOSTO, non del testo depositato (P-160): è
  // l'identificativo che la prova dell'accettazione registra insieme
  // all'impronta, e per questo esiste. Il numero del testo vero non si scrive
  // qui né nella testata: sta nella cartella dei sorgenti (`T&C/Sorgenti
  // markdown/`, fuori dal repository), nella versione corrente della cartella.
  versione: '0.24',
  pubblicata: '2026-09-03',
  efficace: '2026-10-03',
  generata: '2026-09-03',
  // Impronta dichiarata dalla generazione: si confronta con quella calcolata
  // sulle clausole qui sotto (tc01Verifica).
  impronta: '9bf2c708',
  // L'ordine di prevalenza dell'art. 1: Piano, TC, DPA; le informative si
  // ricevono e non si accettano.
  pacchetto: ['PIANO', 'TC-01', 'DPA-01', 'INF-02'],
  clausole: [
    { n: 1, h: 'Oggetto e documenti del contratto', vessatoria: false,
      p: 'Byup S.r.l. concede in licenza d\'uso, in modalità cloud (SaaS), il gestionale Byup Fresh: cassa, ordinazione al tavolo, menù digitali, vetrina nella Byup App, statistiche e strumenti per gli adempimenti fiscali. Il servizio è riservato a operatori professionali del settore Food & Beverage. Il contratto è formato, in ordine di prevalenza, dalle Condizioni particolari di attivazione (Piano), dai presenti Termini e dall\'Accordo sul trattamento dei dati (DPA-01); l\'informativa privacy business (INF-02) si riceve e non si accetta.' },
    { n: 2, h: 'Attivazione, account e titolare', vessatoria: false,
      p: 'L\'account è riferito al locale. Il titolare è uno solo per volta: chi lo rappresenta verso Byup e verso l\'Agenzia delle Entrate. Il titolare abilita collaboratori con i ruoli che sceglie e risponde dell\'uso che ne fanno; nessuna richiesta di collegamento attribuisce il ruolo di titolare. Non è prevista alcuna procedura di trasferimento dell\'account fra persone: chi ha l\'account modifica dal proprio profilo i propri recapiti e il proprio nome, e ogni modifica resta nel registro delle attività. Il mutamento del soggetto fiscale che esercita l\'attività si compie nella sezione dei dati fiscali e si conclude con la riaccettazione dei presenti Termini a nome del nuovo soggetto. Il ripristino dell\'accesso restituisce le credenziali alla stessa persona e non le trasferisce mai.' },
    { n: 3, h: 'Corrispettivi: comande pesate e coefficienti del piano', vessatoria: false,
      p: 'Il servizio è offerto in abbonamento. L\'unità di misura è la comanda, cioè il singolo invio; l\'origine della comanda le dà un peso provvisorio, la superficie di saldo quello definitivo, che prevale. Le unità fatturate sono, per ciascun gruppo di saldo, il maggiore fra le comande inviate e le transazioni saldate, moltiplicate per i coefficienti del piano, che sono un listino versionato e non un numero fisso. I corrispettivi sono fatturati elettronicamente; i pagamenti sono gestiti tramite Stripe.' },
    { n: 4, h: 'Sospensione per morosità', vessatoria: true,
      p: 'In caso di mancato pagamento Byup invia una diffida con un termine non inferiore a quindici giorni; decorso il termine può sospendere il servizio dandone comunicazione. La sospensione non estingue i corrispettivi maturati e cessa al saldo.' },
    { n: 5, h: 'Modifica delle condizioni e dei listini', vessatoria: true,
      p: 'Byup può modificare i presenti Termini e i listini con preavviso di almeno trenta giorni, comunicato nel gestionale e via email, indicando che cosa cambia. In caso di disaccordo il locale può recedere prima dell\'efficacia delle modifiche, senza penali. Gli aumenti di listino oltre l\'indice FOI sono comunicati con lo stesso preavviso e la stessa facoltà di recesso.' },
    { n: 6, h: 'Trasparenza verso il locale', vessatoria: false,
      p: 'Ai sensi del Regolamento (UE) 2019/1150, Byup dichiara i principali parametri che determinano il posizionamento del locale nella vetrina e nella discovery della Byup App e ogni trattamento differenziato; ogni restrizione, sospensione o cessazione è comunicata con la sua motivazione e, salvo i casi di legge, con preavviso; il locale dispone di un sistema interno di gestione dei reclami e di mediatori indicati da Byup.' },
    { n: 7, h: 'Limitazione di responsabilità', vessatoria: true,
      p: 'Nei limiti consentiti dalla legge, Byup non risponde dei danni indiretti o del lucro cessante derivanti da interruzioni del servizio, e la responsabilità complessiva è limitata ai corrispettivi versati nei dodici mesi precedenti l\'evento. Restano ferme le responsabilità inderogabili di legge.' },
    { n: 8, h: 'Manleva', vessatoria: true,
      p: 'Il locale manleva Byup da pretese di terzi derivanti dai dati che inserisce nel gestionale (menù, prezzi, allergeni), da violazioni di legge nella conduzione dell\'attività o dall\'uso non autorizzato dell\'account a lui riferibile.' },
    { n: 9, h: 'Recesso e cessazione', vessatoria: true,
      p: 'Il locale può recedere in ogni momento con effetto dalla fine del periodo di fatturazione in corso. Byup può recedere con preavviso di trenta giorni, o cessare il servizio senza preavviso nei casi dell\'art. 13. Alla cessazione si applica l\'art. 17 sull\'esportazione dei dati.' },
    { n: 10, h: 'Durata e rinnovo automatico', vessatoria: true,
      p: 'L\'abbonamento si rinnova tacitamente alla scadenza di ciascun periodo di fatturazione, salvo disdetta comunicata prima del rinnovo. Il piano Gratuito non ha scadenza e non si converte mai da solo in un piano a pagamento.' },
    { n: 11, h: 'Obblighi del locale', vessatoria: false,
      p: 'Il locale garantisce la correttezza dei dati inseriti (menù, prezzi, allergeni, dati fiscali) e il rispetto delle norme applicabili alla propria attività, incluse quelle igienico-sanitarie e di informazione al consumatore.' },
    { n: 12, h: 'Obblighi informativi fiscali', vessatoria: false,
      p: 'Byup mette a disposizione gli strumenti per gli adempimenti fiscali e non è intermediario fiscale. Il locale incarica Byup, e per essa il fornitore del canale, di trasmettere per suo conto all\'Agenzia delle Entrate i corrispettivi e le fatture elettroniche. I corrispettivi sono trasmessi con la procedura del documento commerciale online, con le credenziali dell\'esercente, che ne cura il rinnovo: quelle del titolare se il locale è una ditta individuale, quelle della persona fisica che il locale ha nominato incaricata sul portale dell\'Agenzia se è una società o un ente, secondo il paragrafo 2.9 delle specifiche tecniche. La nomina si compie sul portale e Byup non ne è parte: Byup non nomina incaricati propri e non rinnova credenziali per conto dell\'esercente. Le fatture elettroniche sono conservate presso l\'Agenzia in forza della delega che il titolare conferisce sul portale per i servizi «Fatturazione elettronica e conservazione delle fatture elettroniche» e «Accreditamento e censimento dispositivi», con cui Byup accredita il locale come esercente; il collegamento degli strumenti di pagamento resta una comunicazione dell\'esercente. Byup informa il locale di scadenze, scarti ed esiti nel gestionale; la correttezza dei dati trasmessi resta responsabilità del locale.' },
    { n: 13, h: 'Sospensione immediata per sicurezza', vessatoria: true,
      p: 'In caso di uso illecito o di rischio per la sicurezza della piattaforma o dei suoi utenti, Byup può sospendere immediatamente il servizio, dandone comunicazione motivata e revocando la sospensione al cessare del rischio.' },
    { n: 14, h: 'Dati personali: i ruoli di Byup e del locale', vessatoria: false,
      p: 'Per i dati dei clienti finali che usano la Byup App, Byup è titolare autonomo del trattamento: il rapporto con il consumatore è di Byup, e il locale non riceve né conserva i dati di account, i consensi o la storia del cliente presso altri locali. Per i dati che tratta per conto del locale — documenti fiscali, prenotazioni ricevute come servizio, operatività di sala e statistiche del personale — Byup opera come responsabile ai sensi dell\'art. 28 GDPR secondo l\'Accordo DPA-01. Il locale resta titolare dei trattamenti che compie sui propri dipendenti e collaboratori.' },
    { n: 15, h: 'Accettazione delle modifiche', vessatoria: true,
      p: 'Le modifiche comunicate ai sensi dell\'art. 5 si accettano con un atto espresso nel gestionale. Decorso il preavviso, l\'uso del servizio da parte di una persona autenticata vale accettazione; un accesso di solo dispositivo non vale accettazione.' },
    { n: 16, h: 'Pagamenti dei consumatori e divieto di maggiorazioni', vessatoria: false,
      p: 'Il locale non applica ai consumatori maggiorazioni o commissioni in ragione dello strumento di pagamento usato — pagamento in app, carta o altro — in conformità all\'art. 62 del Codice del consumo. Le mance sono liberalità e restano fuori dal documento fiscale.' },
    { n: 17, h: 'Cambio di fornitore ed esportazione dei dati', vessatoria: false,
      // I sessanta giorni sono la finestra citata anche da Hubble (art. 5 nel
      // suo mock): DA CONFERMARE ALLA RIGENERAZIONE dal pacchetto legale.
      p: 'Il locale può in ogni momento esportare menù, ordini, anagrafiche e contabilità in un formato leggibile e riutilizzabile, e passare a un altro fornitore senza penali. A contratto cessato l\'esportazione resta disponibile per sessanta giorni; Byup fornisce l\'assistenza ragionevolmente necessaria al passaggio.' },
    { n: 18, h: 'Divieto di cessione', vessatoria: true,
      p: 'Il locale non può cedere il contratto né i diritti che ne derivano senza il consenso scritto di Byup. Byup può cedere il contratto nell\'ambito di operazioni societarie, dandone comunicazione.' },
    { n: 19, h: 'Clausola risolutiva espressa', vessatoria: true,
      p: 'Il contratto si risolve di diritto, previa comunicazione, in caso di violazione degli artt. 2 (uso dell\'account), 3 (pagamenti) e 11 (obblighi del locale), ferma la debenza dei corrispettivi maturati.' },
    { n: 20, h: 'Decadenze e reclami', vessatoria: true,
      p: 'Eventuali contestazioni su fatture o malfunzionamenti vanno comunicate entro trenta giorni da quando il locale ne ha avuto conoscenza; decorso il termine, la prestazione si intende accettata.' },
    { n: 21, h: 'Esclusione di garanzie', vessatoria: true,
      p: 'Il servizio è fornito «così com\'è»: nei limiti di legge Byup non garantisce l\'assenza di errori o l\'idoneità a scopi specifici, fermo l\'impegno a correggere i difetti segnalati e i livelli di servizio pubblicati.' },
    { n: 22, h: 'Modifica o dismissione di funzionalità', vessatoria: true,
      p: 'Byup può evolvere, sostituire o dismettere singole funzionalità del gestionale, dandone preavviso ragionevole quando la modifica riduce in modo apprezzabile le capacità del piano sottoscritto.' },
    { n: 23, h: 'Pagamenti e facoltà di opporre eccezioni', vessatoria: true,
      p: 'Il locale non può sospendere o ritardare i pagamenti dovuti eccependo contestazioni sul servizio; le eccezioni si fanno valere nelle forme dell\'art. 20, salvo quanto inderogabilmente previsto dalla legge.' },
    { n: 24, h: 'Mediazione preventiva', vessatoria: true,
      p: 'Prima di adire il giudice, le parti si impegnano a esperire un tentativo di mediazione presso un organismo accreditato nel luogo del foro competente. Il tentativo non pregiudica i provvedimenti urgenti.' },
    { n: 25, h: 'Legge applicabile e foro esclusivo', vessatoria: true,
      p: 'I presenti Termini sono regolati dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di Roma.' },
  ],
};

// FNV-1a a 32 bit sul testo delle clausole, in esadecimale: l'impronta del
// prototipo. Stessa serializzazione alla generazione e alla verifica.
function tc01Impronta(clausole) {
  const testo = JSON.stringify(clausole.map(c => [c.n, c.h, c.p, !!c.vessatoria]));
  let h = 0x811c9dc5;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('00000000' + h.toString(16)).slice(-8);
}
// Torna {ok, dichiarata, calcolata}: se non tornano, la firma si blocca.
function tc01Verifica() {
  const calcolata = tc01Impronta(TC01.clausole);
  return { ok: calcolata === TC01.impronta, dichiarata: TC01.impronta, calcolata };
}
// Le clausole della seconda firma ex artt. 1341-1342 c.c., ricavate dai flag.
function tc01Vessatorie() { return TC01.clausole.filter(c => c.vessatoria); }

window.TC01 = TC01;
window.tc01Impronta = tc01Impronta;
window.tc01Verifica = tc01Verifica;
window.tc01Vessatorie = tc01Vessatorie;

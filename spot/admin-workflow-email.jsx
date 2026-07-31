// Marketing › Promozioni › Workflow Email
// Builder editabile e animato per workflow di email marketing automation.
// Pensato per locali (ristoranti, bar, bistrot): trigger dal gestionale Byup,
// filtri ricchi, sequenze multi-step con diramazione IF/ELSE, guardrails di sicurezza.

const { useState: useStateWf, useMemo: useMemoWf, useRef: useRefWf, useEffect: useEffectWf } = React;

// ════════════════════════════════════════════════════════════════════════════
// CATALOGO · TRIGGER
// Raccolti dai segnali che il gestionale Byup genera: ordini, prenotazioni,
// scan QR, recensioni, loyalty, geofencing, calendario, cassa.
// ════════════════════════════════════════════════════════════════════════════
const WF_TRIGGERS = [
  // ─── Ordini & cassa ───────────────────────────────────────────────────────
  { id:'primo_ordine',      label:'Primo ordine completato',           icon:'check',     color:'OK',     cat:'Ordini & cassa',   desc:'Quando un cliente chiude il suo primo scontrino in sala, asporto o delivery.', params:[] },
  { id:'ordine_n',          label:'N° ordini raggiunge soglia',        icon:'receipt',   color:'OK',     cat:'Ordini & cassa',   desc:'Festeggia il 5°, 10° o 25° ordine. Perfetto per milestone.', params:[{k:'n', label:'Soglia ordini', type:'number', def:5, unit:'ordini'}] },
  { id:'soglia_spesa',      label:'Spesa totale supera soglia',        icon:'money',     color:'PURPLE', cat:'Ordini & cassa',   desc:'Premia i clienti che superano €X di spesa lifetime.', params:[{k:'amount', label:'Soglia', type:'number', def:200, unit:'€'}] },
  { id:'scontrino_alto',    label:'Scontrino sopra soglia',            icon:'fire',      color:'PURPLE', cat:'Ordini & cassa',   desc:'Cliente con conto > €X in una singola visita: tipicamente cena importante.', params:[{k:'amount', label:'Importo', type:'number', def:60, unit:'€'}] },
  { id:'categoria_acq',     label:'Acquisto categoria specifica',      icon:'utensils',  color:'PINK',   cat:'Ordini & cassa',   desc:'Cliente che ordina pizza, dolci, vini, cocktail… per up-sell mirato.', params:[{k:'cat', label:'Categoria', type:'text', def:'pizza', unit:''}] },
  { id:'mancia_lasciata',   label:'Mancia lasciata',                   icon:'star',      color:'OK',     cat:'Ordini & cassa',   desc:'Segnale forte di soddisfazione: il momento giusto per chiedere una recensione.', params:[{k:'minPct', label:'Almeno', type:'number', def:5, unit:'%'}] },
  { id:'ordine_annullato',  label:'Ordine annullato dal cliente',      icon:'x',         color:'DANGER', cat:'Ordini & cassa',   desc:'Recupero: capire perché e fare un\'offerta personalizzata.', params:[] },

  // ─── Inattività & retention ───────────────────────────────────────────────
  { id:'inattivita',        label:'Cliente inattivo da N giorni',      icon:'clock',     color:'WARN',   cat:'Inattività',       desc:'Win-back: il cliente non ordina da troppo tempo, è ora di richiamarlo.', params:[{k:'days', label:'Giorni', type:'number', def:30, unit:'giorni'}] },
  { id:'freq_calata',       label:'Frequenza visite in calo',          icon:'trendDown', color:'WARN',   cat:'Inattività',       desc:'Cliente abituale che sta diradando le visite. Intervieni prima che esca.', params:[{k:'pct', label:'Calo ≥', type:'number', def:30, unit:'%'}] },
  { id:'carrello_abb',      label:'Carrello abbandonato (online)',     icon:'paperclip', color:'WARN',   cat:'Inattività',       desc:'Asporto o delivery: il cliente ha messo cose nel carrello ma non ha chiuso.', params:[{k:'minutes', label:'Dopo', type:'number', def:60, unit:'min'}] },
  { id:'email_disengage',   label:'Cliente non apre da N email',       icon:'mail',      color:'WARN',   cat:'Inattività',       desc:'Email ignorate: prova un canale diverso o un soggetto più potente.', params:[{k:'n', label:'Email senza apertura', type:'number', def:5, unit:''}] },

  // ─── Date & ricorrenze ────────────────────────────────────────────────────
  { id:'compleanno',        label:'Compleanno cliente',                icon:'star',      color:'PINK',   cat:'Date & ricorrenze',desc:'Auguri con regalo: massimo tasso di apertura dell\'anno.', params:[{k:'offset', label:'Anticipo', type:'number', def:0, unit:'giorni'}] },
  { id:'anniversario',      label:'Anniversario primo ordine',         icon:'crown',     color:'PINK',   cat:'Date & ricorrenze',desc:'Festeggia "1 anno con noi" e rafforza il legame.', params:[] },
  { id:'festivita',         label:'Festività ricorrente',              icon:'calendar',  color:'PINK',   cat:'Date & ricorrenze',desc:'San Valentino, Natale, Ferragosto, Halloween…', params:[{k:'evento', label:'Evento', type:'text', def:'San Valentino', unit:''}] },
  { id:'pre_evento',        label:'X giorni prima evento prenotato',   icon:'calendar',  color:'INFO',   cat:'Date & ricorrenze',desc:'Reminder pre-cena con menu e indicazioni.', params:[{k:'days', label:'Anticipo', type:'number', def:1, unit:'giorni'}] },

  // ─── Sala & prenotazioni ──────────────────────────────────────────────────
  { id:'prenot_creata',     label:'Nuova prenotazione confermata',     icon:'calendar',  color:'INFO',   cat:'Sala & prenotazioni',desc:'Conferma, regole della casa, menu in anteprima.', params:[] },
  { id:'prenot_modificata', label:'Prenotazione modificata',           icon:'calendar',  color:'INFO',   cat:'Sala & prenotazioni',desc:'Aggiorna il cliente con il nuovo dettaglio.', params:[] },
  { id:'prenot_cancellata', label:'Prenotazione cancellata',           icon:'x',         color:'WARN',   cat:'Sala & prenotazioni',desc:'Capire il motivo e proporre una nuova data.', params:[] },
  { id:'prenot_no_show',    label:'No-show prenotazione',              icon:'x',         color:'DANGER', cat:'Sala & prenotazioni',desc:'Recupero (o blocco) con messaggio cortese ma fermo.', params:[] },
  { id:'post_visita',       label:'Tavolo liberato (post-visita)',     icon:'check',     color:'OK',     cat:'Sala & prenotazioni',desc:'Subito dopo il pagamento: ringraziamento e richiesta feedback.', params:[{k:'minutes', label:'Dopo', type:'number', def:30, unit:'min'}] },
  { id:'lista_attesa',      label:'Inserito in lista d\'attesa',       icon:'clock',     color:'INFO',   cat:'Sala & prenotazioni',desc:'Status update e offerta alternativa.', params:[] },

  // ─── Feedback & recensioni ────────────────────────────────────────────────
  { id:'rec_positiva',      label:'Recensione 5 stelle',               icon:'star',      color:'OK',     cat:'Feedback',         desc:'Ringrazia e invita a condividere su Google/TripAdvisor.', params:[] },
  { id:'rec_negativa',      label:'Recensione bassa',                  icon:'alertTriangle',color:'DANGER',cat:'Feedback',      desc:'Recupero immediato: chiama il manager, offri ristoro.', params:[{k:'maxStars', label:'Stelle ≤', type:'number', def:3, unit:'★'}] },
  { id:'nps_promoter',      label:'NPS promoter (9-10)',               icon:'trendUp',   color:'OK',     cat:'Feedback',         desc:'Fan: candidato perfetto per referral o passaparola.', params:[] },
  { id:'nps_detractor',     label:'NPS detractor (0-6)',               icon:'trendDown', color:'DANGER', cat:'Feedback',         desc:'Cliente insoddisfatto: contatto umano prioritario.', params:[] },
  { id:'feedback_mancato',  label:'Nessun feedback dopo visita',       icon:'help',      color:'MUTED',  cat:'Feedback',         desc:'Reminder gentile a lasciare un commento.', params:[{k:'days', label:'Dopo', type:'number', def:2, unit:'giorni'}] },

  // ─── Acquisizione & onboarding ────────────────────────────────────────────
  { id:'iscrizione',        label:'Iscrizione newsletter',             icon:'mail',      color:'INFO',   cat:'Acquisizione',     desc:'Benvenuto, codice di benvenuto, presentazione del locale.', params:[] },
  { id:'qr_primo_scan',     label:'Primo scan QR al tavolo',           icon:'link',      color:'PINK',   cat:'Acquisizione',     desc:'Aggancio caldissimo: cliente al tavolo, telefono in mano.', params:[] },
  { id:'app_install',       label:'Download app Byup',                 icon:'phone',     color:'INFO',   cat:'Acquisizione',     desc:'Tutorial, primo vantaggio, push setup.', params:[] },
  { id:'profilo_compl',     label:'Profilo cliente completato',        icon:'user',      color:'INFO',   cat:'Acquisizione',     desc:'Cliente che condivide preferenze: dargli rilevanza extra.', params:[] },
  { id:'referral_attivo',   label:'Cliente porta un amico (referral)', icon:'users',     color:'PURPLE', cat:'Acquisizione',     desc:'Premio doppio: chi invita e chi accetta.', params:[] },

  // ─── Loyalty & fedeltà ────────────────────────────────────────────────────
  { id:'punti_soglia',      label:'Punti fedeltà sopra soglia',        icon:'crown',     color:'PURPLE', cat:'Loyalty',          desc:'"Hai abbastanza punti per…": stimola il riscatto.', params:[{k:'punti', label:'Punti', type:'number', def:500, unit:'pt'}] },
  { id:'livello_su',        label:'Livello loyalty avanza',            icon:'trendUp',   color:'PURPLE', cat:'Loyalty',          desc:'Bronzo → Argento → Oro: notifica e premio simbolico.', params:[] },
  { id:'punti_scadenza',    label:'Punti in scadenza',                 icon:'clock',     color:'WARN',   cat:'Loyalty',          desc:'Use-it-or-lose-it: forte CTA per rientro.', params:[{k:'days', label:'Tra', type:'number', def:14, unit:'giorni'}] },
  { id:'premio_sbloccato',  label:'Premio sbloccato non riscattato',   icon:'star',      color:'PINK',   cat:'Loyalty',          desc:'Reminder che c\'è un regalo da prendere.', params:[{k:'days', label:'Dopo', type:'number', def:7, unit:'giorni'}] },

  // ─── Geofencing & dispositivo ─────────────────────────────────────────────
  { id:'geofence_in',       label:'Cliente entra nell\'area locale',   icon:'home',      color:'INFO',   cat:'Geo & push',       desc:'Push live: "Sei qui vicino, vieni a trovarci".', params:[{k:'meters', label:'Raggio', type:'number', def:300, unit:'m'}] },
  { id:'zona_no_visita',    label:'Cliente in zona ma non entra',      icon:'eye',       color:'WARN',   cat:'Geo & push',       desc:'Lo vediamo passare ma non viene: spingere con un\'esca.', params:[{k:'days', label:'Per', type:'number', def:7, unit:'giorni'}] },

  // ─── Operativo (gestionale) ───────────────────────────────────────────────
  { id:'coupon_emesso',     label:'Coupon emesso al cliente',          icon:'card',      color:'INFO',   cat:'Operativo',        desc:'Spiegare come usarlo e dare urgenza.', params:[] },
  { id:'coupon_scadenza',   label:'Coupon non utilizzato in scadenza', icon:'clock',     color:'WARN',   cat:'Operativo',        desc:'Last-call sul coupon prima che scada.', params:[{k:'days', label:'Tra', type:'number', def:3, unit:'giorni'}] },
  { id:'voucher_ricevuto',  label:'Voucher regalo ricevuto',           icon:'star',      color:'PINK',   cat:'Operativo',        desc:'Onboarding di chi ha ricevuto un regalo dal locale.', params:[] },
];

// ════════════════════════════════════════════════════════════════════════════
// CATALOGO · CAMPI FILTRO (condizioni di ingresso)
// Tutti i campi che il CRM Byup espone, organizzati per area.
// ════════════════════════════════════════════════════════════════════════════
const WF_FIELDS = [
  // Profilo
  { id:'segmento',     label:'Segmento cliente',     kind:'select',  cat:'Profilo',    ops:['è','non è'],         values:['VIP','Affezionato','Occasionale','Nuovo','Dormiente'] },
  { id:'eta',          label:'Età',                  kind:'number',  cat:'Profilo',    ops:['>','<','=','tra'],   def:30, unit:'anni' },
  { id:'genere',       label:'Genere',               kind:'select',  cat:'Profilo',    ops:['è','non è'],         values:['F','M','Altro','Non dichiarato'] },
  { id:'lingua',       label:'Lingua preferita',     kind:'select',  cat:'Profilo',    ops:['è','non è'],         values:['IT','EN','FR','DE','ES'] },
  { id:'citta',        label:'Città',                kind:'text',    cat:'Profilo',    ops:['è','non è','contiene'] },
  { id:'distanza',     label:'Distanza dal locale',  kind:'number',  cat:'Profilo',    ops:['<','>','tra'],       def:5, unit:'km' },

  // Comportamento di acquisto
  { id:'spesa_tot',    label:'Spesa totale lifetime',kind:'number',  cat:'Acquisto',   ops:['>','<','=','tra'],   def:100, unit:'€' },
  { id:'spesa_media',  label:'Scontrino medio',      kind:'number',  cat:'Acquisto',   ops:['>','<','tra'],       def:35, unit:'€' },
  { id:'ordini_tot',   label:'Ordini totali',        kind:'number',  cat:'Acquisto',   ops:['>','<','='],         def:3, unit:'ordini' },
  { id:'ordini_30g',   label:'Ordini ultimi 30 gg',  kind:'number',  cat:'Acquisto',   ops:['>','<','='],         def:2, unit:'ordini' },
  { id:'ordini_90g',   label:'Ordini ultimi 90 gg',  kind:'number',  cat:'Acquisto',   ops:['>','<','='],         def:5, unit:'ordini' },
  { id:'gg_ultimo',    label:'Giorni dall\'ultima visita',kind:'number',cat:'Acquisto',ops:['>','<','tra'],       def:30, unit:'giorni' },
  { id:'gg_iscritto',  label:'Giorni dalla prima visita',kind:'number',cat:'Acquisto',ops:['>','<'],              def:90, unit:'giorni' },
  { id:'categoria_pref',label:'Categoria preferita', kind:'select',  cat:'Acquisto',   ops:['è','non è','contiene'], values:['Pizza','Pasta','Carne','Pesce','Vegetariano','Dolci','Bevande','Vini','Cocktail','Aperitivo','Brunch'] },
  { id:'fascia_oraria',label:'Fascia oraria abituale',kind:'select', cat:'Acquisto',   ops:['è','non è'],         values:['Pranzo','Aperitivo','Cena','Dopocena','Brunch weekend'] },
  { id:'giorni_pref',  label:'Giorno preferito',     kind:'select',  cat:'Acquisto',   ops:['è','non è'],         values:['Lun','Mar','Mer','Gio','Ven','Sab','Dom','Weekend','Infrasettimanale'] },
  { id:'coperti_med',  label:'Coperti medi/prenotaz.',kind:'number', cat:'Acquisto',   ops:['>','<','='],         def:2, unit:'persone' },

  // Canale & dispositivo
  { id:'canale',       label:'Canale preferito',     kind:'select',  cat:'Canale',     ops:['è','non è'],         values:['QR tavolo','App','Prenotazione web','Telefono','Asporto','Delivery'] },
  { id:'device',       label:'Dispositivo',          kind:'select',  cat:'Canale',     ops:['è','non è'],         values:['iOS','Android','Web desktop','Web mobile'] },
  { id:'origine',      label:'Origine acquisizione', kind:'select',  cat:'Canale',     ops:['è','non è'],         values:['Google','Instagram','TikTok','Friend referral','Walk-in','Volantino','Booking partner'] },

  // Marketing & consenso
  { id:'optin',        label:'Consenso marketing',   kind:'select',  cat:'Marketing',  ops:['è'],                 values:['Attivo','Soft opt-in','Solo transazionale'] },
  { id:'open_rate',    label:'Tasso di apertura ultime 10 email',kind:'number',cat:'Marketing',ops:['>','<','tra'], def:30, unit:'%' },
  { id:'click_rate',   label:'Tasso di click ultime 10 email',kind:'number',cat:'Marketing',ops:['>','<','tra'],   def:5, unit:'%' },
  { id:'engagement',   label:'Livello di coinvolgimento', kind:'select',  cat:'Marketing',  ops:['è'],             values:['Caldo','Tiepido','Freddo','Inerte'] },

  // Loyalty
  { id:'livello',      label:'Livello loyalty',      kind:'select',  cat:'Loyalty',    ops:['è','non è','≥'],     values:['Nessuno','Bronzo','Argento','Oro','Platino'] },
  { id:'punti',        label:'Punti disponibili',    kind:'number',  cat:'Loyalty',    ops:['>','<','tra'],       def:100, unit:'pt' },

  // Feedback
  { id:'rating_avg',   label:'Recensione media data',kind:'number',  cat:'Feedback',   ops:['>','<','tra'],       def:4, unit:'★' },
  { id:'rec_count',    label:'N° recensioni lasciate',kind:'number', cat:'Feedback',   ops:['>','<','='],         def:1, unit:'' },
  { id:'nps',          label:'NPS ultimo rilevato',  kind:'select',  cat:'Feedback',   ops:['è'],                 values:['Promoter','Passive','Detractor'] },

  // Tag
  { id:'tag',          label:'Tag cliente',          kind:'text',    cat:'Tag',        ops:['contiene','non contiene','è esattamente'] },
];

// Step disponibili nelle sequenze (azioni)
const STEP_KINDS = [
  { id:'email',  label:'Invia email',         icon:'mail',     color:'PINK',   hint:'Email transazionale o marketing con corpo, oggetto e variabili.' },
  { id:'push',   label:'Invia push',          icon:'bell',     color:'INFO',   hint:'Notifica mobile in tempo reale (app installata).' },
  { id:'sms',    label:'Invia SMS',           icon:'phone',    color:'PURPLE', hint:'Per messaggi urgenti o conferme. Costo extra.' },
  { id:'wait',   label:'Attendi',             icon:'clock',    color:'MUTED',  hint:'Pausa temporale prima del prossimo step.' },
  { id:'branch', label:'Diramazione if/else', icon:'filter',   color:'WARN',   hint:'Due rami in base a condizioni. Il cliente segue Sì o No.' },
  { id:'split',  label:'A/B split test',      icon:'list',     color:'PURPLE', hint:'Suddivisione casuale per testare due varianti.' },
  { id:'tag',    label:'Aggiungi tag',        icon:'paperclip',color:'INFO',   hint:'Etichetta interna per segmentazione futura.' },
  { id:'notify', label:'Notifica lo staff',   icon:'waiter',   color:'INFO',   hint:'Avvisa un membro del team via app/email.' },
  { id:'goal',   label:'Obiettivo raggiunto', icon:'check',    color:'OK',     hint:'Esce dal workflow come "successo".' },
  { id:'stop',   label:'Termina sequenza',    icon:'x',        color:'DANGER', hint:'Il cliente esce dal workflow senza obiettivo.' },
];

const TIME_UNITS = ['min','ore','giorni','settimane'];

// ════════════════════════════════════════════════════════════════════════════
// GUARDRAILS · valori di default
// Protezioni più ricche: frequency cap, quiet hours, smart send time,
// pausa automatica se rate negativi, modalità test, ecc.
// ════════════════════════════════════════════════════════════════════════════
const DEFAULT_GUARDRAILS = {
  maxPerMonth: 1,         // sequenze attive per mese per cliente
  cooldownDays: 30,       // cooldown fra entrate ripetute nello stesso workflow
  dayLimit: 2,            // max email/giorno per cliente (in TUTTI i workflow)
  weekLimit: 5,           // max email/settimana per cliente (frequency cap globale)
  skipIfRecent7g: true,   // salta se ha ricevuto email negli ultimi 7g
  skipIfDisengaged: true, // salta disinteressati (tasso di apertura < 10% ultime 10)
  timeFrom: '09:00',
  timeTo: '20:00',
  respectTz: true,        // rispetta fuso orario cliente
  weekdaysOnly: false,
  quietHours: true,       // niente invii 22:00–08:00 mai
  smartSendTime: true,    // best time per cliente (ML)
  pauseIfBounceAbove: 8,  // pausa auto se bounce > X%
  pauseIfUnsubAbove: 1.5, // pausa auto se unsub > X%
  respectClosed: true,    // niente invio se locale chiuso
  respectOptOut: true,    // required
  testMode: false,
  testRecipient: '',
  budgetCap: 0,           // 0 = nessun cap
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE · sequenze pronte per locali (curate da marketer)
// ════════════════════════════════════════════════════════════════════════════
const WF_TEMPLATES = [
  {
    key:'welcome',
    nome:'Benvenuto · nuovi clienti',
    accent:'PINK', icon:'star',
    pitch:'Trasforma il primo ordine in seconda visita entro 14 giorni.',
    benchmark:'+24% sulle visite di ritorno',
    trigger:{ id:'primo_ordine', params:{} },
    conditions:{ mode:'AND', items:[ { id:'c1', field:'optin', op:'è', value:'Attivo' } ] },
    steps:[
      { id:'s1', kind:'email', delay:{n:30,unit:'min'},    subject:'Grazie per esserci stato 🙏', preheader:'Un piccolo pensiero dentro', body:'Ciao {{cliente.nome}}, è stato un piacere accoglierti…' },
      { id:'s2', kind:'wait',  delay:{n:3,unit:'giorni'} },
      { id:'s3', kind:'email', delay:{n:3,unit:'giorni'},  subject:'-10% sul prossimo ordine, solo per te', preheader:'Codice valido 7 giorni', body:'Usa il codice WELCOME10 al checkout…' },
      { id:'s4', kind:'wait',  delay:{n:7,unit:'giorni'} },
      { id:'s5', kind:'email', delay:{n:10,unit:'giorni'}, subject:'Le novità del nostro menu', preheader:'Tre piatti appena entrati', body:'Abbiamo aggiunto…' },
    ],
  },
  {
    key:'winback',
    nome:'Win-back · clienti dormienti',
    accent:'WARN', icon:'clock',
    pitch:'Recupera chi non torna da 45+ giorni con una scaletta a 3 email.',
    benchmark:'+12% riattivazioni',
    trigger:{ id:'inattivita', params:{ days:45 } },
    conditions:{ mode:'AND', items:[
      { id:'c1', field:'spesa_tot',  op:'>', value:'80' },
      { id:'c2', field:'ordini_30g', op:'=', value:'0' },
    ]},
    steps:[
      { id:'s1', kind:'email', delay:{n:0,unit:'min'},     subject:'Ci manchi! Un caffè offerto se torni questa settimana', preheader:'', body:'' },
      { id:'s2', kind:'wait',  delay:{n:5,unit:'giorni'} },
      { id:'s3', kind:'branch', delay:{n:0,unit:'min'},
        conditions:{ mode:'AND', items:[ { id:'b1', field:'open_rate', op:'>', value:'20' } ] },
        yes:[
          { id:'sy1', kind:'email', delay:{n:0,unit:'min'},  subject:'I tuoi piatti preferiti sono ancora in menu', preheader:'', body:'' },
        ],
        no:[
          { id:'sn1', kind:'sms', delay:{n:0,unit:'min'}, body:'Hey {{cliente.nome}}, abbiamo qualcosa per te. Apri qui →' },
        ],
      },
      { id:'s4', kind:'wait',  delay:{n:10,unit:'giorni'} },
      { id:'s5', kind:'email', delay:{n:15,unit:'giorni'}, subject:'Ultimo invito · -15% sul prossimo ordine', preheader:'', body:'' },
    ],
  },
  {
    key:'birthday',
    nome:'Compleanno · regalo cliente',
    accent:'PINK', icon:'star',
    pitch:'Mail del compleanno: il singolo evento con tasso di apertura più alto.',
    benchmark:'63% tasso di apertura medio',
    trigger:{ id:'compleanno', params:{ offset:0 } },
    conditions:{ mode:'AND', items:[ { id:'c1', field:'optin', op:'è', value:'Attivo' } ]},
    steps:[
      { id:'s1', kind:'email', delay:{n:0,unit:'min'}, subject:'Buon compleanno! 🎂 Un dolce in regalo da noi', preheader:'Valido per tutta la settimana', body:'' },
    ],
  },
  {
    key:'feedback',
    nome:'Richiesta recensione post-visita',
    accent:'OK', icon:'star',
    pitch:'Cattura recensioni Google/TripAdvisor quando il ricordo è caldo.',
    benchmark:'+3.4× recensioni positive',
    trigger:{ id:'post_visita', params:{ minutes:60 } },
    conditions:{ mode:'AND', items:[ { id:'c1', field:'spesa_media', op:'>', value:'20' } ]},
    steps:[
      { id:'s1', kind:'email', delay:{n:60,unit:'min'}, subject:'Com\'è andata la cena di stasera?', preheader:'1 click per dircelo', body:'' },
      { id:'s2', kind:'wait',  delay:{n:1,unit:'giorni'} },
      { id:'s3', kind:'branch', delay:{n:0,unit:'min'},
        conditions:{ mode:'AND', items:[ { id:'b1', field:'rating_avg', op:'>', value:'4' } ] },
        yes:[
          { id:'sy1', kind:'email', delay:{n:0,unit:'min'}, subject:'Lo condivideresti su Google? 🌟', preheader:'Ci aiuti tantissimo', body:'' },
        ],
        no:[
          { id:'sn1', kind:'notify', delay:{n:0,unit:'min'}, body:'Recupero cliente: chiamare e ascoltare cosa non è andato.' },
        ],
      },
    ],
  },
  {
    key:'slow_lunch',
    nome:'Pranzo del martedì · riempi sala',
    accent:'INFO', icon:'utensils',
    pitch:'Spingere i giorni a bassa affluenza con offerta last-minute.',
    benchmark:'+18% prenotazioni martedì',
    trigger:{ id:'inattivita', params:{ days:14 } },
    conditions:{ mode:'AND', items:[
      { id:'c1', field:'fascia_oraria', op:'è', value:'Pranzo' },
      { id:'c2', field:'distanza',      op:'<', value:'3' },
    ]},
    steps:[
      { id:'s1', kind:'push', delay:{n:0,unit:'min'}, body:'Martedì pranzo: primo + dolce + caffè a 15€. Solo questa settimana.' },
    ],
  },
  {
    key:'noshow',
    nome:'No-show · recupero educato',
    accent:'DANGER', icon:'x',
    pitch:'Gestire le mancate presentazioni con tono cortese: dato + opportunità di tornare.',
    benchmark:'-22% mancate presentazioni ripetute',
    trigger:{ id:'prenot_no_show', params:{} },
    conditions:{ mode:'AND', items:[] },
    steps:[
      { id:'s1', kind:'email', delay:{n:30,unit:'min'}, subject:'Ti aspettavamo stasera', preheader:'Va tutto bene?', body:'' },
      { id:'s2', kind:'wait',  delay:{n:2,unit:'giorni'} },
      { id:'s3', kind:'email', delay:{n:2,unit:'giorni'}, subject:'Riprenotiamo? Ti tengo il tavolo che preferisci', preheader:'', body:'' },
    ],
  },
  {
    key:'vip',
    nome:'VIP · trattamento esclusivo',
    accent:'PURPLE', icon:'crown',
    pitch:'Inviti chiusi e novità in anteprima per i top spender.',
    benchmark:'8.6× LTV su segmento',
    trigger:{ id:'soglia_spesa', params:{ amount:500 } },
    conditions:{ mode:'AND', items:[ { id:'c1', field:'segmento', op:'è', value:'VIP' } ]},
    steps:[
      { id:'s1', kind:'email', delay:{n:0,unit:'min'}, subject:'Sei dei nostri · benvenuto nel club', preheader:'Inviti in anteprima e regali sorpresa', body:'' },
      { id:'s2', kind:'tag', tagName:'vip_club' },
    ],
  },
  {
    key:'referral',
    nome:'Referral · porta un amico',
    accent:'PURPLE', icon:'users',
    pitch:'Premia chi invita e chi accetta: motore di crescita organica.',
    benchmark:'1 cliente porta 1.4 amici',
    trigger:{ id:'referral_attivo', params:{} },
    conditions:{ mode:'AND', items:[] },
    steps:[
      { id:'s1', kind:'email', delay:{n:0,unit:'min'}, subject:'Grazie per la fiducia · regalo doppio dentro', preheader:'-15€ per te e -15€ per il tuo amico', body:'' },
    ],
  },
  {
    key:'blank',
    nome:'Workflow vuoto',
    accent:'MUTED', icon:'plus',
    pitch:'Parti da zero e progetta la tua sequenza personalizzata.',
    benchmark:'Massima libertà',
    trigger:{ id:'', params:{} },
    conditions:{ mode:'AND', items:[] },
    steps:[],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════
const uid = (prefix='id') => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
const findTrigger = (id) => WF_TRIGGERS.find(t => t.id === id);
const findField   = (id) => WF_FIELDS.find(f => f.id === id);

const templateToWorkflow = (tpl, overrides = {}) => ({
  id: uid('wf'),
  nome: tpl.nome,
  stato: 'draft',
  trigger: JSON.parse(JSON.stringify(tpl.trigger)),
  conditions: JSON.parse(JSON.stringify(tpl.conditions)),
  steps: JSON.parse(JSON.stringify(tpl.steps)),
  guardrails: { ...DEFAULT_GUARDRAILS },
  stats: { iscritti:0, inviate:0, open:0, ctr:0, ordini:0, ricavi:0 },
  templateKey: tpl.key,
  ...overrides,
});
// ════════════════════════════════════════════════════════════════════════════
// MOCK INIZIALE
// ════════════════════════════════════════════════════════════════════════════
const INITIAL_WORKFLOWS = [
  templateToWorkflow(WF_TEMPLATES[0], { stato:'active',
    stats:{ iscritti:312, inviate:1247, open:0.42, ctr:0.07, ordini:38, ricavi:1840 } }),
  templateToWorkflow(WF_TEMPLATES[1], { stato:'active',
    stats:{ iscritti:94, inviate:241, open:0.36, ctr:0.05, ordini:11, ricavi:620 },
    guardrails:{ ...DEFAULT_GUARDRAILS, maxPerMonth:1, cooldownDays:60 } }),
  templateToWorkflow(WF_TEMPLATES[2], { stato:'paused',
    stats:{ iscritti:58, inviate:112, open:0.61, ctr:0.18, ordini:22, ricavi:890 },
    guardrails:{ ...DEFAULT_GUARDRAILS, maxPerMonth:1, cooldownDays:350, timeFrom:'09:00', timeTo:'12:00' } }),
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN PANE
// ════════════════════════════════════════════════════════════════════════════
function WorkflowEmailPane() {
  const [workflows, setWorkflows] = useStateWf(INITIAL_WORKFLOWS);
  const [editingId, setEditingId] = useStateWf(null);
  const [transitioning, setTransitioning] = useStateWf(false);
  const [gallery, setGallery] = useStateWf(false);

  const editing = workflows.find(w => w.id === editingId);

  const open = (id) => {
    setTransitioning(true);
    setEditingId(id);
    setTimeout(()=>setTransitioning(false), 30);
  };
  const close = () => {
    setTransitioning(true);
    setTimeout(() => { setEditingId(null); setTransitioning(false); }, 220);
  };
  const startFromTemplate = (tpl) => {
    const wf = templateToWorkflow(tpl, { nome: tpl.key === 'blank' ? 'Workflow senza nome' : tpl.nome });
    setWorkflows([wf, ...workflows]);
    setGallery(false);
    open(wf.id);
  };
  const update = (id, patch) => {
    setWorkflows(ws => ws.map(w => w.id === id ? { ...w, ...patch } : w));
  };
  const remove = (id) => {
    setWorkflows(ws => ws.filter(w => w.id !== id));
    if (editingId === id) close();
  };

  return (
    <div style={{...PROMO_SHELL, minHeight:600, position:'relative'}}>
      <style>{WF_ANIMATIONS}</style>

      <div className={editing ? 'wf-fade-out' : 'wf-fade-in'} style={{display: editing ? 'none' : 'block'}}>
        <WorkflowList
          workflows={workflows}
          onOpen={open}
          onNew={() => setGallery(true)}
          onDuplicate={(w) => {
            const copy = { ...w, id:uid('wf'), nome:`${w.nome} (copia)`, stato:'draft' };
            setWorkflows([copy, ...workflows]);
          }}
          onToggleState={(w) => update(w.id, { stato: w.stato === 'active' ? 'paused' : 'active' })}
          onRemove={(w) => remove(w.id)}
        />
      </div>

      {editing && (
        <div className={transitioning ? 'wf-editor-leaving' : 'wf-editor-enter'}>
          <WorkflowEditor
            workflow={editing}
            onChange={(patch) => update(editing.id, patch)}
            onClose={close}
            onDelete={() => remove(editing.id)}
          />
        </div>
      )}

      {gallery && (
        <TemplateGallery
          onClose={() => setGallery(false)}
          onPick={startFromTemplate}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LISTA WORKFLOW
// ════════════════════════════════════════════════════════════════════════════
// Stessa impalcatura delle altre due tab di Promozioni: una frase e l'azione,
// la striscia di misure, la tabella. Il titolo «Workflow email» che stava qui
// dentro è sparito — lo diceva già la tab attiva quaranta pixel più su.
const WF_COLS = 'minmax(0,2.7fr) 0.7fr 0.75fr 0.6fr 1fr 96px';

function WorkflowList({ workflows, onOpen, onNew, onDuplicate, onToggleState, onRemove }) {
  const tot = workflows.reduce((a, w) => ({
    iscritti: a.iscritti + w.stats.iscritti,
    inviate:  a.inviate  + w.stats.inviate,
    ordini:   a.ordini   + w.stats.ordini,
    ricavi:   a.ricavi   + w.stats.ricavi,
  }), { iscritti:0, inviate:0, ordini:0, ricavi:0 });
  const attivi = workflows.filter(w => w.stato === 'active').length;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <PromoHead
        testo={<>Sequenze che partono da sole a un evento del cliente e proseguono nel tempo: trigger comportamentali, filtri di ingresso, diramazioni e guardrail di frequenza. Apri una riga per modificarne il percorso.</>}
        azione={<AdmButton variant="cta" icon="plus" style={{whiteSpace:'nowrap', flexShrink:0}} onClick={onNew}>Nuovo workflow</AdmButton>}
      />

      <PromoSummary voci={[
        { label:'Workflow attivi', valore: `${attivi}/${workflows.length}`, sotto:'Gli altri sono in pausa o in bozza' },
        { label:'Iscritti totali', valore: fmtNum(tot.iscritti), sotto:'Clienti dentro almeno un workflow' },
        { label:'Email inviate', valore: fmtNum(tot.inviate), sotto:'Ultimi 30 giorni' },
        { label:'Ordini generati', valore: fmtNum(tot.ordini), sotto:`${fmtEur(tot.ricavi)} attribuiti` },
      ]}/>

      <PromoTable cols={WF_COLS} teste={[
        { label:'Workflow' },
        { label:'Iscritti', num:true },
        { label:'Inviate', num:true },
        { label:'Open', num:true },
        { label:'Ordini', num:true },
        { label:'' },
      ]}>
        {workflows.length === 0 && (
          <div style={{padding:'44px 24px', textAlign:'center'}}>
            <div style={{width:48, height:48, borderRadius:12, background:ADM.NEUTRAL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center', margin:'0 auto 12px'}}>
              <BuIcons.mail size={24}/>
            </div>
            <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT}}>Ancora nessun workflow</div>
            <div style={{fontSize:13.4, color:ADM.MUTED, marginTop:4, marginBottom:14}}>Parti da un template curato per ristoratori o costruiscine uno da zero.</div>
            <AdmButton variant="cta" icon="plus" onClick={onNew}>Crea il primo workflow</AdmButton>
          </div>
        )}
        {workflows.map((w, i) => (
          <WorkflowRow key={w.id} wf={w}
            last={i===workflows.length-1}
            onOpen={()=>onOpen(w.id)}
            onDuplicate={()=>onDuplicate(w)}
            onToggle={()=>onToggleState(w)}
            onRemove={()=>onRemove(w)}
          />
        ))}
      </PromoTable>
    </div>
  );
}

function WorkflowRow({ wf, last, onOpen, onDuplicate, onToggle, onRemove }) {
  const trig = findTrigger(wf.trigger?.id) || { label:'Trigger non impostato', icon:'plus', color:'MUTED' };
  const TrigIcon = BuIcons[trig.icon || 'mail'];
  const nEmail = countStepKind(wf.steps, 'email') + countStepKind(wf.steps, 'push') + countStepKind(wf.steps, 'sms');

  return (
    <div className="adm-row-open" onClick={onOpen} style={{
      display:'grid', gridTemplateColumns:WF_COLS, gap:12, alignItems:'center',
      padding:'12px 18px', background:'#fff',
      borderBottom: last ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
        {/* La tile del trigger resta neutra: il colore, qui, non è un dato —
            lo stato del workflow lo dice già la pastiglia accanto al nome. */}
        <div style={{width:32, height:32, borderRadius:8, background:ADM.NEUTRAL_SOFT, color:ADM.MUTED,
          display:'grid', placeItems:'center', flexShrink:0}}>
          <TrigIcon size={18}/>
        </div>
        <div style={{minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7, minWidth:0}}>
            <span style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{wf.nome}</span>
            <WfStatoBadge stato={wf.stato}/>
          </div>
          <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
            {trig.label} · <strong style={{color:ADM.TEXT, fontWeight:700}}>{nEmail}</strong> msg
            {wf.conditions?.items?.length > 0 && <> · <strong style={{color:ADM.TEXT, fontWeight:700}}>{wf.conditions.items.length}</strong> filtri {wf.conditions.mode}</>}
          </div>
        </div>
      </div>

      <PromoNum v={fmtNum(wf.stats.iscritti)}/>
      <PromoNum v={fmtNum(wf.stats.inviate)}/>
      <PromoNum v={wf.stats.open ? `${Math.round(wf.stats.open*100)}%` : '—'}/>
      <PromoNum v={fmtNum(wf.stats.ordini)} sotto={wf.stats.ricavi ? `${fmtEur(wf.stats.ricavi)} attribuiti` : null}/>

      {/* Tre azioni quiete, non una croce rossa che è la cosa più visibile
          della riga: l'eliminazione resta protetta dalla conferma. */}
      <div style={{display:'flex', gap:2, justifyContent:'flex-end'}} onClick={e=>e.stopPropagation()}>
        <AdmIconBtn icon={wf.stato==='active' ? 'pause' : 'check'} size={28}
          label={wf.stato==='active' ? 'Metti in pausa' : 'Attiva'} onClick={onToggle}/>
        <AdmIconBtn icon="copy" size={28} label="Duplica" onClick={onDuplicate}/>
        <AdmIconBtn icon="trash" size={28} label="Elimina"
          onClick={() => { if (confirm(`Eliminare il workflow "${wf.nome}"?`)) onRemove(); }}/>
      </div>
    </div>
  );
}

function countStepKind(steps, kind) {
  let n = 0;
  for (const s of steps) {
    if (s.kind === kind) n++;
    if (s.kind === 'branch') {
      n += countStepKind(s.yes || [], kind) + countStepKind(s.no || [], kind);
    }
    if (s.kind === 'split') {
      n += countStepKind(s.a || [], kind) + countStepKind(s.b || [], kind);
    }
  }
  return n;
}

function WfStatoBadge({ stato }) {
  const map = {
    active: { label:'Attivo',   color: ADM.OK,    bg: ADM.OK_SOFT },
    paused: { label:'In pausa', color: ADM.WARN,  bg: ADM.WARN_SOFT },
    draft:  { label:'Bozza',    color: ADM.MUTED, bg: '#F0F1F3' },
  };
  const s = map[stato] || map.draft;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:11.4, fontWeight:800, color:s.color, background:s.bg,
      padding:'2px 6px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.05em',
      whiteSpace:'nowrap', flexShrink:0,
    }}>
      {stato==='active' && <span className="wf-pulse" style={{width:5, height:5, borderRadius:'50%', background:s.color}}/>}
      {s.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE GALLERY · scelta del workflow di partenza
// ════════════════════════════════════════════════════════════════════════════
function TemplateGallery({ onClose, onPick }) {
  return (
    <ModalShell title="Da dove parti?" subtitle="Template curati per ristoratori, o un workflow vuoto." onClose={onClose} width={820}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {WF_TEMPLATES.map(tpl => {
          const Icon = BuIcons[tpl.icon] || BuIcons.plus;
          const c = ADM[tpl.accent] || ADM.MUTED;
          const cSoft = ADM[tpl.accent+'_SOFT'] || '#F3F4F6';
          const nSteps = tpl.steps?.length || 0;
          const isBlank = tpl.key === 'blank';
          return (
            <button key={tpl.key} onClick={()=>onPick(tpl)} className="wf-tap" style={{
              textAlign:'left', cursor:'pointer', fontFamily:'inherit',
              padding:14,
              background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:11,
              display:'flex', flexDirection:'column', gap:9,
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.boxShadow = `0 4px 14px -4px ${c}30`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ADM.BORDER_SOFT; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:34, height:34, borderRadius:9, background:cSoft, color:c, display:'grid', placeItems:'center'}}>
                  <Icon size={20}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{tpl.nome}</div>
                  {!isBlank && (
                    <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2, fontWeight:600}}>
                      {nSteps} step · {findTrigger(tpl.trigger.id)?.label}
                    </div>
                  )}
                </div>
                {!isBlank && (
                  <span style={{fontSize:12.2, fontWeight:800, color:c, background:cSoft, padding:'3px 7px', borderRadius:5, letterSpacing:'0.03em', whiteSpace:'nowrap'}}>
                    {tpl.benchmark}
                  </span>
                )}
              </div>
              <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.5}}>{tpl.pitch}</div>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDITOR
// ════════════════════════════════════════════════════════════════════════════
function WorkflowEditor({ workflow, onChange, onClose, onDelete }) {
  const wf = workflow;
  const [nameEditing, setNameEditing] = useStateWf(false);
  const [picker, setPicker] = useStateWf(null);

  const setTrigger     = (trigger) => onChange({ trigger });
  const setConditions  = (conditions) => onChange({ conditions });
  const setSteps       = (steps) => onChange({ steps });
  const setGuardrails  = (guardrails) => onChange({ guardrails });

  const validation = useMemoWf(() => {
    const issues = [];
    if (!wf.trigger?.id) issues.push('Seleziona un trigger di partenza');
    if (wf.steps.length === 0) issues.push('Aggiungi almeno uno step alla sequenza');
    const allEmails = collectAllEmails(wf.steps);
    if (allEmails.some(s => !s.subject?.trim())) issues.push('Compila l\'oggetto di tutte le email');
    return issues;
  }, [wf]);

  return (
    <div style={{display:'flex', flexDirection:'column', gap:18}}>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
          <button onClick={onClose} className="wf-tap" style={{
            display:'inline-flex', alignItems:'center', gap:6,
            border:`1px solid ${ADM.BORDER}`, background:'#fff',
            padding:'7px 12px', borderRadius:8, color:ADM.TEXT,
            fontSize:14, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
            whiteSpace:'nowrap',
          }}>
            <BuIcons.chevronLeft size={18}/> Tutti i workflow
          </button>
          <WfStatoBadge stato={wf.stato}/>
          {validation.length > 0 && (
            <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.3, color:ADM.WARN, fontWeight:700, padding:'5px 10px', background:ADM.WARN_SOFT, borderRadius:7, whiteSpace:'nowrap'}}>
              <BuIcons.alertTriangle size={17}/>
              {validation.length} {validation.length === 1 ? 'cosa da sistemare' : 'cose da sistemare'}
            </span>
          )}
          <span style={{flex:1}}/>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
            <AdmButton variant="ghost" icon="x" onClick={()=>{ if(confirm('Eliminare definitivamente il workflow?')) onDelete(); }}>Elimina</AdmButton>
            <AdmButton variant="secondary" icon="copy" onClick={() => onChange({ stato: 'draft' })}>Salva come bozza</AdmButton>
            <AdmButton variant="cta" icon="check" disabled={validation.length > 0}
              onClick={()=> onChange({ stato: 'active' })}>
              {wf.stato==='active' ? 'Aggiorna' : 'Pubblica'}
            </AdmButton>
          </div>
        </div>
        <div>
          {nameEditing ? (
            <input
              autoFocus
              value={wf.nome}
              onChange={e => onChange({ nome: e.target.value })}
              onBlur={()=>setNameEditing(false)}
              onKeyDown={e => e.key==='Enter' && setNameEditing(false)}
              style={{
                fontSize:22.3, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.025em',
                border:`1px solid ${ADM.PINK}`, borderRadius:8,
                padding:'4px 10px', fontFamily:'inherit', outline:'none',
                width:'100%', maxWidth:640, background:'#fff',
              }}
            />
          ) : (
            <h2 onClick={()=>setNameEditing(true)} style={{
              fontSize:22.3, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.025em', margin:0,
              cursor:'text', padding:'4px 10px', borderRadius:8,
              border:'1px solid transparent',
              transition:'background 0.12s, border-color 0.12s',
              display:'inline-block', maxWidth:'100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = ADM.BORDER; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              {wf.nome}
            </h2>
          )}
        </div>
      </div>

      <div style={{display:'flex', flexWrap:'wrap', gap:20, alignItems:'flex-start'}}>
        <div style={{display:'flex', flexDirection:'column', gap:0, flex:'1 1 480px', minWidth:0}}>
          <TriggerSection trigger={wf.trigger} onChange={setTrigger} onPick={()=>setPicker({kind:'trigger'})}/>
          <Connector/>
          <ConditionsSection conditions={wf.conditions} onChange={setConditions} title="Filtri di ingresso"
            help="Solo i clienti che soddisfano questi filtri entreranno nella sequenza dopo l'attivazione del trigger."/>
          <Connector/>
          <StepsSection steps={wf.steps} onChange={setSteps}/>
          <EndNode/>
        </div>

        <div style={{flex:'1 1 300px', minWidth:300, maxWidth:360, display:'flex', flexDirection:'column', gap:14, position:'sticky', top:16}}>
          <SummaryCard wf={wf} validation={validation}/>
          <GuardrailsSection g={wf.guardrails} onChange={setGuardrails}/>
        </div>
      </div>

      {picker?.kind === 'trigger' && (
        <TriggerPicker
          current={wf.trigger}
          onClose={()=>setPicker(null)}
          onPick={(t) => { setTrigger(t); setPicker(null); }}
        />
      )}
    </div>
  );
}

function collectAllEmails(steps) {
  const out = [];
  for (const s of steps) {
    if (s.kind === 'email') out.push(s);
    if (s.kind === 'branch') { out.push(...collectAllEmails(s.yes||[]), ...collectAllEmails(s.no||[])); }
    if (s.kind === 'split')  { out.push(...collectAllEmails(s.a||[]),   ...collectAllEmails(s.b||[])); }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER
// ─────────────────────────────────────────────────────────────────────────────
function TriggerSection({ trigger, onChange, onPick }) {
  const t = findTrigger(trigger?.id);
  if (!t) {
    return (
      <SectionShell label="Trigger" sub="Quando deve partire il workflow" color={ADM.MUTED}
        help="Il trigger è l'evento che fa entrare un cliente nella sequenza. Ogni workflow ne ha esattamente uno.">
        <button onClick={onPick} className="wf-tap" style={emptyNodeStyle()}>
          <BuIcons.plus size={19}/>
          <span>Seleziona trigger…</span>
        </button>
      </SectionShell>
    );
  }
  const Icon = BuIcons[t.icon];
  const c = ADM[t.color];
  return (
    <SectionShell label="Trigger" sub={t.cat} color={c}
      help="Il trigger è l'evento che fa entrare un cliente nella sequenza. Cambialo in qualsiasi momento.">
      <div className="wf-tap" style={nodeStyle(c, ADM[t.color+'_SOFT'])}>
        <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
          <div style={iconBoxStyle(c, ADM[t.color+'_SOFT'])}><Icon size={21}/></div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em'}}>Trigger</div>
            <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginTop:2, letterSpacing:'-0.01em'}}>{t.label}</div>
            {t.desc && <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>{t.desc}</div>}
          </div>
          <button onClick={onPick} style={miniBtnStyle()}>Cambia</button>
        </div>
        {t.params.length > 0 && (
          <div style={{display:'flex', gap:8, marginTop:11, flexWrap:'wrap'}}>
            {t.params.map(p => (
              <ParamField key={p.k}
                label={p.label}
                unit={p.unit}
                value={trigger.params[p.k] ?? p.def}
                onChange={(v)=>onChange({ ...trigger, params:{ ...trigger.params, [p.k]: v } })}
                type={p.type}
              />
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function ParamField({ label, value, onChange, unit, type='number' }) {
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:7, padding:'5px 10px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:7}}>
      <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(type==='number' ? Number(e.target.value) : e.target.value)}
        style={{width:type==='number'?60:120, border:'none', outline:'none', fontSize:14.4, fontWeight:700, color:ADM.TEXT, fontFamily:'inherit', background:'transparent', padding:0}}
      />
      {unit && <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>{unit}</span>}
    </label>
  );
}

function TriggerPicker({ current, onPick, onClose }) {
  const [q, setQ] = useStateWf('');
  const grouped = useMemoWf(() => {
    const filt = q.trim().toLowerCase();
    const cats = {};
    WF_TRIGGERS.forEach(t => {
      if (filt && !(t.label.toLowerCase().includes(filt) || t.desc?.toLowerCase().includes(filt) || t.cat.toLowerCase().includes(filt))) return;
      (cats[t.cat] = cats[t.cat] || []).push(t);
    });
    return Object.entries(cats);
  }, [q]);
  return (
    <ModalShell title="Scegli il trigger di partenza" subtitle="Tutti i segnali che Byup raccoglie dal gestionale" onClose={onClose} width={720}>
      <div style={{position:'sticky', top:0, background:'#fff', paddingBottom:12, marginBottom:6, zIndex:2}}>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED}}>
            <BuIcons.search size={19}/>
          </span>
          <input
            value={q} onChange={e=>setQ(e.target.value)} autoFocus
            placeholder="Cerca tra trigger e categorie…"
            style={{
              width:'100%', padding:'10px 12px 10px 36px',
              border:`1px solid ${ADM.BORDER}`, borderRadius:9,
              fontSize:14.4, fontFamily:'inherit', outline:'none',
              background:'#FBFBFC',
            }}/>
        </div>
      </div>
      {grouped.length === 0 && (
        <div style={{padding:'40px 0', textAlign:'center', color:ADM.MUTED, fontSize:14}}>
          Nessun trigger corrisponde a "{q}"
        </div>
      )}
      {grouped.map(([cat, ts]) => (
        <div key={cat} style={{marginBottom:18}}>
          <div style={{fontSize:12.6, fontWeight:800, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8}}>{cat}</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            {ts.map(t => {
              const Icon = BuIcons[t.icon];
              const c = ADM[t.color];
              const sel = current?.id === t.id;
              return (
                <button key={t.id}
                  onClick={()=>{
                    const params = {};
                    t.params.forEach(p => params[p.k] = current?.id===t.id ? (current.params[p.k] ?? p.def) : p.def);
                    onPick({ id: t.id, params });
                  }}
                  className="wf-tap"
                  style={{
                    display:'flex', alignItems:'flex-start', gap:10,
                    padding:'11px 12px',
                    background: sel ? ADM[t.color+'_SOFT'] : '#fff',
                    border:`1px solid ${sel ? c : ADM.BORDER_SOFT}`,
                    borderRadius:9,
                    fontFamily:'inherit', cursor:'pointer',
                    textAlign:'left',
                  }}>
                  <div style={{width:32, height:32, borderRadius:8, background: ADM[t.color+'_SOFT'], color:c, display:'grid', placeItems:'center', flexShrink:0}}>
                    <Icon size={20}/>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em'}}>{t.label}</div>
                      {sel && <BuIcons.check size={18} color={c}/>}
                    </div>
                    {t.desc && <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>{t.desc}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDIZIONI · filtri di ingresso (riutilizzato anche dentro al BRANCH)
// ─────────────────────────────────────────────────────────────────────────────
function ConditionsSection({ conditions, onChange, title='Filtri di ingresso', help, compact, accent='WARN' }) {
  const c = ADM[accent];
  const cSoft = ADM[accent+'_SOFT'];

  const addCondition = (fieldId) => {
    const f = fieldId ? findField(fieldId) : WF_FIELDS[0];
    onChange({
      ...conditions,
      items: [...conditions.items, { id: uid('cnd'), field: f.id, op: f.ops[0], value: f.values?.[0] || (f.def != null ? String(f.def) : '') }]
    });
  };
  const updItem = (id, patch) => onChange({
    ...conditions,
    items: conditions.items.map(it => it.id===id ? { ...it, ...patch } : it),
  });
  const remItem = (id) => onChange({
    ...conditions,
    items: conditions.items.filter(it => it.id !== id),
  });

  const inner = (
    <div style={nodeStyle(c, cSoft)}>
      <div style={{display:'flex', flexDirection:'column', gap:7}}>
        {conditions.items.length === 0 && (
          <div style={{fontSize:13.7, color:ADM.MUTED, padding:'6px 0', lineHeight:1.55}}>
            Nessun filtro · {compact ? 'vero per chiunque' : <>la sequenza partirà per <strong style={{color:ADM.TEXT}}>tutti</strong> i clienti che attivano il trigger.</>}
          </div>
        )}
        {conditions.items.map((it, i) => (
          <div key={it.id} className="wf-step-enter" style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
            {i > 0 && (
              <span style={{
                fontSize:13, fontWeight:800, color: c, background:cSoft,
                padding:'3px 7px', borderRadius:4, letterSpacing:'0.06em',
              }}>{conditions.mode}</span>
            )}
            <ConditionRow item={it} onChange={(patch)=>updItem(it.id, patch)} onRemove={()=>remItem(it.id)}/>
          </div>
        ))}
        <FieldPickerBtn onPick={addCondition} accent={accent}/>
      </div>
    </div>
  );

  if (compact) return inner;

  return (
    <SectionShell
      label={title}
      sub={conditions.items.length ? `${conditions.items.length} condizioni in ${conditions.mode}` : 'Nessun filtro · tutti i clienti idonei'}
      color={c}
      help={help}
      right={
        conditions.items.length > 1 && (
          <ModeToggle mode={conditions.mode} onChange={(mode)=>onChange({...conditions, mode})} accent={accent}/>
        )
      }
    >
      {inner}
    </SectionShell>
  );
}

function FieldPickerBtn({ onPick, accent='WARN' }) {
  const [open, setOpen] = useStateWf(false);
  const [q, setQ] = useStateWf('');
  const c = ADM[accent];
  const grouped = useMemoWf(() => {
    const filt = q.trim().toLowerCase();
    const cats = {};
    WF_FIELDS.forEach(f => {
      if (filt && !f.label.toLowerCase().includes(filt) && !f.cat.toLowerCase().includes(filt)) return;
      (cats[f.cat] = cats[f.cat] || []).push(f);
    });
    return Object.entries(cats);
  }, [q]);

  return (
    <div style={{position:'relative', alignSelf:'flex-start', marginTop:4}}>
      <button onClick={()=>setOpen(o=>!o)} className="wf-tap" style={{
        display:'inline-flex', alignItems:'center', gap:6,
        padding:'7px 12px',
        background:'#fff', border:`1px dashed ${c}80`,
        color: c, fontSize:13.7, fontWeight:700,
        borderRadius:8, cursor:'pointer', fontFamily:'inherit',
      }}>
        <BuIcons.plus size={17}/> Aggiungi condizione
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:'fixed', inset:0, zIndex:20}}/>
          <div className="wf-popover-enter" style={{
            position:'absolute', top:'100%', left:0, marginTop:6, zIndex:25,
            background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:11,
            boxShadow:'0 14px 36px -10px rgba(15,17,21,0.22)',
            width:300, maxHeight:380, overflow:'auto', padding:8,
          }}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Cerca campo…"
              style={{
                width:'100%', padding:'7px 10px', marginBottom:7,
                border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:7,
                fontSize:13.7, fontFamily:'inherit', outline:'none',
                background:'#FBFBFC',
              }}/>
            {grouped.map(([cat, fs]) => (
              <div key={cat} style={{marginBottom:8}}>
                <div style={{fontSize:13, fontWeight:800, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.07em', padding:'5px 7px'}}>{cat}</div>
                {fs.map(f => (
                  <button key={f.id} onClick={()=>{ onPick(f.id); setOpen(false); setQ(''); }}
                    style={{
                      display:'block', width:'100%', textAlign:'left',
                      padding:'7px 9px', border:'none', background:'transparent',
                      fontSize:14, color:ADM.TEXT, fontFamily:'inherit',
                      borderRadius:6, cursor:'pointer',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background = ADM.PANEL_SOFT}
                    onMouseLeave={e=>e.currentTarget.style.background = 'transparent'}>
                    {f.label}
                  </button>
                ))}
              </div>
            ))}
            {grouped.length === 0 && (
              <div style={{padding:'14px 8px', textAlign:'center', color:ADM.MUTED, fontSize:13.3}}>
                Nessun campo per "{q}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ConditionRow({ item, onChange, onRemove }) {
  const f = findField(item.field) || WF_FIELDS[0];
  const c = ADM.WARN;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6, flexWrap:'wrap',
      padding:'5px 7px', background:'#fff',
      border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:8,
    }}>
      <span style={{fontSize:12.2, fontWeight:800, color:ADM.MUTED, background:'#F4F5F7', padding:'2px 6px', borderRadius:4, letterSpacing:'0.04em', textTransform:'uppercase'}}>{f.cat}</span>
      <SmallSelect value={item.field}
        onChange={(v) => {
          const nf = findField(v);
          onChange({ field: v, op: nf.ops[0], value: nf.values?.[0] || (nf.def != null ? String(nf.def) : '') });
        }}
        options={WF_FIELDS.map(x => ({value:x.id, label:x.label, group:x.cat}))}
        width={170}
      />
      <SmallSelect value={item.op} onChange={(v)=>onChange({op:v})}
        options={f.ops.map(o => ({value:o, label:o}))} width={f.ops.includes('tra')?80:70}/>
      {f.kind === 'select' ? (
        <SmallSelect value={item.value} onChange={(v)=>onChange({value:v})}
          options={f.values.map(o => ({value:o, label:o}))} width={140}/>
      ) : item.op === 'tra' ? (
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
          <SmallInput type={f.kind === 'number' ? 'number' : 'text'} value={item.value?.split('|')[0] || ''}
            onChange={(v)=>onChange({value: `${v}|${item.value?.split('|')[1] || ''}`})} width={70} placeholder="min"/>
          <span style={{fontSize:13, color:ADM.MUTED}}>e</span>
          <SmallInput type={f.kind === 'number' ? 'number' : 'text'} value={item.value?.split('|')[1] || ''}
            onChange={(v)=>onChange({value: `${item.value?.split('|')[0] || ''}|${v}`})} width={70} placeholder="max"/>
        </span>
      ) : (
        <SmallInput type={f.kind === 'number' ? 'number' : 'text'} value={item.value}
          onChange={(v)=>onChange({value:v})} width={f.kind==='number' ? 90 : 140}
          placeholder={f.kind==='number' ? '0' : 'valore…'}/>
      )}
      {f.unit && <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, marginLeft:-2}}>{f.unit}</span>}
      <button onClick={onRemove} title="Rimuovi" className="wf-tap" style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:22, height:22, borderRadius:6, border:'none', background:'transparent', color:ADM.MUTED,
        cursor:'pointer',
      }}>
        <BuIcons.x size={16}/>
      </button>
    </div>
  );
}

function ModeToggle({ mode, onChange, accent='WARN' }) {
  const c = ADM[accent];
  return (
    <div style={{display:'inline-flex', background:'#F4F5F7', borderRadius:8, padding:2}}>
      {['AND','OR'].map(m => (
        <button key={m} onClick={()=>onChange(m)} style={{
          padding:'4px 12px', fontSize:13, fontWeight:800,
          background: mode===m ? '#fff' : 'transparent',
          color: mode===m ? c : ADM.MUTED,
          border:'none', borderRadius:6, cursor:'pointer',
          fontFamily:'inherit', letterSpacing:'0.04em',
          boxShadow: mode===m ? '0 1px 2px rgba(15,17,21,0.08)' : 'none',
          transition:'all 0.15s',
        }}>{m}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEPS · sequenza azioni
// ─────────────────────────────────────────────────────────────────────────────
function StepsSection({ steps, onChange }) {
  const insertAt = (index, kind) => {
    const newStep = makeStep(kind);
    const next = [...steps.slice(0, index), newStep, ...steps.slice(index)];
    onChange(next);
  };
  const updateStep = (id, patch) => onChange(steps.map(s => s.id===id ? { ...s, ...patch } : s));
  const removeStep = (id) => onChange(steps.filter(s => s.id !== id));
  const moveStep = (id, dir) => {
    const i = steps.findIndex(s => s.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const emailCount = (upTo) => steps.slice(0, upTo+1).filter(s => s.kind === 'email').length;

  const summaryBits = [
    countStepKind(steps, 'email') > 0 && `${countStepKind(steps, 'email')} email`,
    countStepKind(steps, 'push')  > 0 && `${countStepKind(steps, 'push')} push`,
    countStepKind(steps, 'sms')   > 0 && `${countStepKind(steps, 'sms')} sms`,
    countStepKind(steps, 'branch')> 0 && `${countStepKind(steps, 'branch')} diramazione`,
  ].filter(Boolean).join(' · ');

  return (
    <SectionShell label="Sequenza azioni" sub={steps.length ? (summaryBits || `${steps.length} step`) : 'Aggiungi il primo step per iniziare'} color={ADM.PINK}
      help="Le azioni vengono eseguite in ordine, una dopo l'altra. Aggiungi attese per distanziare le comunicazioni nel tempo.">
      <div style={{display:'flex', flexDirection:'column', gap:0}}>
        {steps.length === 0 && (
          <div style={{padding:'14px 0'}}>
            <AddStepBar onAdd={(k) => insertAt(0, k)} primary/>
          </div>
        )}
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="wf-step-enter">
              <StepRenderer step={s} idxEmail={emailCount(i)}
                onChange={(patch)=>updateStep(s.id, patch)}
                onRemove={()=>removeStep(s.id)}
                onMove={(d)=>moveStep(s.id, d)}
                canUp={i > 0} canDown={i < steps.length-1}
              />
            </div>
            <AddStepBar onAdd={(k) => insertAt(i+1, k)}/>
          </React.Fragment>
        ))}
      </div>
    </SectionShell>
  );
}

function StepRenderer({ step, idxEmail, onChange, onRemove, onMove, canUp, canDown }) {
  if (step.kind === 'email')   return <EmailStepEditor  step={step} idx={idxEmail} onChange={onChange} onRemove={onRemove} onMove={onMove} canUp={canUp} canDown={canDown}/>;
  if (step.kind === 'push')    return <PushStepEditor   step={step} onChange={onChange} onRemove={onRemove} onMove={onMove} canUp={canUp} canDown={canDown}/>;
  if (step.kind === 'sms')     return <SmsStepEditor    step={step} onChange={onChange} onRemove={onRemove} onMove={onMove} canUp={canUp} canDown={canDown}/>;
  if (step.kind === 'wait')    return <WaitStepEditor   step={step} onChange={onChange} onRemove={onRemove} onMove={onMove} canUp={canUp} canDown={canDown}/>;
  if (step.kind === 'branch')  return <BranchStepEditor step={step} onChange={onChange} onRemove={onRemove} onMove={onMove} canUp={canUp} canDown={canDown}/>;
  if (step.kind === 'split')   return <SplitStepEditor  step={step} onChange={onChange} onRemove={onRemove} onMove={onMove} canUp={canUp} canDown={canDown}/>;
  if (step.kind === 'tag')     return <TagStepEditor    step={step} onChange={onChange} onRemove={onRemove}/>;
  if (step.kind === 'notify')  return <NotifyStepEditor step={step} onChange={onChange} onRemove={onRemove}/>;
  if (step.kind === 'goal')    return <GoalStepEditor   onRemove={onRemove}/>;
  if (step.kind === 'stop')    return <StopStepEditor   onRemove={onRemove}/>;
  return null;
}

function makeStep(kind) {
  const id = uid('s');
  if (kind === 'email')  return { id, kind:'email',  delay:{n:0,unit:'min'}, subject:'', preheader:'', body:'' };
  if (kind === 'push')   return { id, kind:'push',   delay:{n:0,unit:'min'}, title:'', body:'' };
  if (kind === 'sms')    return { id, kind:'sms',    delay:{n:0,unit:'min'}, body:'' };
  if (kind === 'wait')   return { id, kind:'wait',   delay:{n:3,unit:'giorni'} };
  if (kind === 'branch') return { id, kind:'branch', conditions:{mode:'AND', items:[]}, yes:[], no:[] };
  if (kind === 'split')  return { id, kind:'split',  ratio:50, a:[], b:[], labelA:'Variante A', labelB:'Variante B' };
  if (kind === 'tag')    return { id, kind:'tag',    tagName:'cliente_engaged' };
  if (kind === 'notify') return { id, kind:'notify', body:'', recipients:'manager' };
  if (kind === 'goal')   return { id, kind:'goal' };
  if (kind === 'stop')   return { id, kind:'stop' };
  return { id, kind };
}

function AddStepBar({ onAdd, primary }) {
  const [open, setOpen] = useStateWf(false);
  return (
    <div style={{display:'flex', justifyContent:'center', padding:'7px 0', position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)} className="wf-tap" style={{
        display:'inline-flex', alignItems:'center', gap:6,
        padding:'5px 14px',
        background: open ? ADM.PINK_SOFT : '#fff',
        border: `1px ${primary?'solid':'dashed'} ${open ? ADM.PINK : ADM.BORDER}`,
        color: open ? ADM.PINK : (primary ? ADM.PINK : ADM.MUTED),
        fontSize:13.3, fontWeight:700,
        borderRadius: 99, cursor:'pointer', fontFamily:'inherit',
        transition:'all 0.15s',
      }}>
        <BuIcons.plus size={16}/>
        {primary ? 'Aggiungi il primo step' : 'Aggiungi step'}
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:'fixed', inset:0, zIndex:5}}/>
          <div className="wf-popover-enter" style={{
            position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
            marginTop:6, zIndex:10,
            background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:11,
            boxShadow:'0 14px 32px -10px rgba(15,17,21,0.22)',
            padding:7, display:'grid', gap:2,
            minWidth:260,
          }}>
            {STEP_KINDS.map(k => {
              const Icon = BuIcons[k.icon] || BuIcons.plus;
              const c = ADM[k.color] || ADM.MUTED;
              return (
                <button key={k.id} onClick={()=>{ onAdd(k.id); setOpen(false); }} style={{
                  display:'flex', alignItems:'flex-start', gap:10,
                  padding:'8px 10px',
                  background:'transparent', border:'none',
                  borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                  textAlign:'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = ADM.PANEL_SOFT}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{width:24, height:24, borderRadius:7, background:`${c}1f`, color:c, display:'grid', placeItems:'center', flexShrink:0, marginTop:1}}>
                    <Icon size={17}/>
                  </span>
                  <span style={{minWidth:0, flex:1}}>
                    <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{k.label}</div>
                    <div style={{fontSize:13, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{k.hint}</div>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EmailStepEditor({ step, idx, onChange, onRemove, onMove, canUp, canDown }) {
  const c = ADM.PINK;
  const [open, setOpen] = useStateWf(true);
  return (
    <div style={nodeStyle(c, ADM.PINK_SOFT)}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
        <div style={{
          width:40, height:40, borderRadius:10,
          background:ADM.PINK_SOFT, color:c, flexShrink:0,
          display:'grid', placeItems:'center', position:'relative',
        }}>
          <BuIcons.mail size={22}/>
          <span style={{
            position:'absolute', top:-5, right:-5,
            width:18, height:18, borderRadius:'50%',
            background:c, color:'#fff',
            fontSize:12.2, fontWeight:800, display:'grid', placeItems:'center',
            border:'2px solid #fff',
          }}>{idx}</span>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
            <span style={{fontSize:13, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em'}}>Email #{idx}</span>
            <DelayEditor delay={step.delay} onChange={(d)=>onChange({delay:d})}/>
            <span style={{flex:1}}/>
            <button onClick={()=>setOpen(o=>!o)} style={miniBtnStyle()}>{open?'Comprimi':'Espandi'}</button>
          </div>
          <SmallInput
            value={step.subject}
            onChange={(v)=>onChange({subject:v})}
            placeholder="Oggetto della email…"
            style={{marginTop:9, fontSize:14.8, fontWeight:700}}
            block
          />
          {open && (<>
            <SmallInput
              value={step.preheader}
              onChange={(v)=>onChange({preheader:v})}
              placeholder="Preheader · testo di anteprima visibile nell'inbox"
              style={{marginTop:7, fontSize:13.7, color:ADM.MUTED}}
              block
            />
            <textarea
              value={step.body}
              onChange={(e)=>onChange({body:e.target.value})}
              placeholder="Anteprima del corpo · usa {{cliente.nome}}, {{locale.nome}}, {{codice}}…"
              rows={3}
              style={{
                marginTop:9, width:'100%',
                padding:'8px 10px',
                border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:7,
                fontFamily:'inherit', fontSize:13.3, color:ADM.TEXT,
                outline:'none', resize:'vertical', background:'#FBFBFC',
              }}
            />
            <div style={{display:'flex', gap:7, marginTop:9, flexWrap:'wrap'}}>
              <Chip color={ADM.PINK} dot>HTML + plain text</Chip>
              <Chip color={ADM.INFO} dot>{'{{cliente.nome}}'}</Chip>
              <Chip color={ADM.OK} dot>UTM auto</Chip>
              <Chip color={ADM.PURPLE} dot>A/B test pronto</Chip>
            </div>
          </>)}
        </div>
        <StepActions onMove={onMove} onRemove={onRemove} canUp={canUp} canDown={canDown}/>
      </div>
    </div>
  );
}

function PushStepEditor({ step, onChange, onRemove, onMove, canUp, canDown }) {
  const c = ADM.INFO;
  return (
    <div style={nodeStyle(c, ADM.INFO_SOFT)}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
        <div style={iconBoxStyle(c, ADM.INFO_SOFT, 38)}><BuIcons.bell size={20}/></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
            <span style={{fontSize:13, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em'}}>Push notification</span>
            <DelayEditor delay={step.delay} onChange={(d)=>onChange({delay:d})}/>
          </div>
          <SmallInput value={step.title} onChange={(v)=>onChange({title:v})}
            placeholder="Titolo della push (60 char)" style={{marginTop:9, fontWeight:700}} block/>
          <SmallInput value={step.body} onChange={(v)=>onChange({body:v})}
            placeholder="Corpo · breve, accattivante, max 100 caratteri" style={{marginTop:7, fontSize:13.7}} block/>
        </div>
        <StepActions onMove={onMove} onRemove={onRemove} canUp={canUp} canDown={canDown}/>
      </div>
    </div>
  );
}

function SmsStepEditor({ step, onChange, onRemove, onMove, canUp, canDown }) {
  const c = ADM.PURPLE;
  return (
    <div style={nodeStyle(c, ADM.PURPLE_SOFT)}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
        <div style={iconBoxStyle(c, ADM.PURPLE_SOFT, 38)}><BuIcons.phone size={20}/></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
            <span style={{fontSize:13, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em'}}>SMS</span>
            <DelayEditor delay={step.delay} onChange={(d)=>onChange({delay:d})}/>
            <Chip color={ADM.WARN} dot>Costo extra · ~€0.04/SMS</Chip>
          </div>
          <textarea value={step.body} onChange={(e)=>onChange({body:e.target.value})}
            placeholder="Testo SMS · max 160 caratteri, link incluso"
            rows={2}
            style={{
              marginTop:9, width:'100%',
              padding:'8px 10px',
              border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:7,
              fontFamily:'inherit', fontSize:13.7, color:ADM.TEXT,
              outline:'none', resize:'vertical', background:'#FBFBFC',
            }}/>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:5, fontWeight:600}}>
            {(step.body || '').length}/160 caratteri
          </div>
        </div>
        <StepActions onMove={onMove} onRemove={onRemove} canUp={canUp} canDown={canDown}/>
      </div>
    </div>
  );
}

function WaitStepEditor({ step, onChange, onRemove, onMove, canUp, canDown }) {
  return (
    <div style={{
      ...nodeStyle(ADM.MUTED, '#F4F5F7'),
      borderStyle:'dashed', padding:'10px 14px',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={iconBoxStyle(ADM.MUTED, '#F0F1F3', 32)}>
          <BuIcons.clock size={19}/>
        </div>
        <span style={{fontSize:13, fontWeight:800, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.07em'}}>Attendi</span>
        <DelayEditor delay={step.delay} onChange={(d)=>onChange({delay:d})}/>
        <span style={{flex:1}}/>
        <StepActions onMove={onMove} onRemove={onRemove} canUp={canUp} canDown={canDown}/>
      </div>
    </div>
  );
}

// ─── BRANCH IF/ELSE · implementazione completa con due rami visibili ─────────
function BranchStepEditor({ step, onChange, onRemove, onMove, canUp, canDown }) {
  const c = ADM.WARN;
  const cYes = ADM.OK;
  const cNo  = ADM.MUTED;
  const [expanded, setExpanded] = useStateWf(true);

  const updateYesSteps = (steps) => onChange({ yes: steps });
  const updateNoSteps  = (steps) => onChange({ no:  steps });
  const setBranchConditions = (conditions) => onChange({ conditions });

  const yesCount = (step.yes || []).length;
  const noCount  = (step.no  || []).length;

  return (
    <div style={{...nodeStyle(c, ADM.WARN_SOFT), padding:'14px 16px'}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom: expanded ? 12 : 0}}>
        <div style={iconBoxStyle(c, ADM.WARN_SOFT, 38)}>
          <BuIcons.filter size={20}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
            <span style={{fontSize:13, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em'}}>Diramazione if/else</span>
            <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>
              · il cliente segue il ramo <strong style={{color:cYes}}>Sì</strong> se le condizioni sono vere, altrimenti il ramo <strong style={{color:cNo}}>No</strong>
            </span>
          </div>
          <div style={{fontSize:14, color:ADM.TEXT, marginTop:5, lineHeight:1.5}}>
            {step.conditions?.items?.length > 0
              ? <>Valuta <strong>{step.conditions.items.length}</strong> {step.conditions.items.length === 1 ? 'condizione' : `condizioni in ${step.conditions.mode}`} per scegliere il ramo.</>
              : <span style={{color:ADM.MUTED}}>Aggiungi almeno una condizione · senza condizioni il branch è inutile.</span>
            }
          </div>
        </div>
        <button onClick={()=>setExpanded(e=>!e)} style={miniBtnStyle()}>{expanded?'Comprimi':'Espandi'}</button>
        <StepActions onMove={onMove} onRemove={onRemove} canUp={canUp} canDown={canDown}/>
      </div>

      {expanded && (
        <div className="wf-branch-enter">
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12.6, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8, display:'flex', alignItems:'center', gap:8}}>
              <span>Condizioni del branch</span>
              {step.conditions?.items?.length > 1 && (
                <ModeToggle mode={step.conditions.mode} onChange={(mode)=>setBranchConditions({...step.conditions, mode})} accent="WARN"/>
              )}
            </div>
            <ConditionsSection
              conditions={step.conditions || {mode:'AND', items:[]}}
              onChange={setBranchConditions}
              compact
              accent="WARN"
            />
          </div>

          {/* Visualizzazione del bivio con SVG animato */}
          <BranchSplitVisual yesCount={yesCount} noCount={noCount}/>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:4}}>
            <BranchColumn
              label="Sì · condizioni vere"
              color={cYes} colorSoft={ADM.OK_SOFT}
              icon="check"
              steps={step.yes || []}
              onChange={updateYesSteps}
            />
            <BranchColumn
              label="No · condizioni false"
              color={cNo} colorSoft="#F0F1F3"
              icon="x"
              steps={step.no || []}
              onChange={updateNoSteps}
            />
          </div>

          <div style={{
            marginTop:14, padding:'9px 12px',
            background:'#FBFBFC', border:`1px dashed ${ADM.BORDER}`, borderRadius:8,
            fontSize:13, color:ADM.MUTED, lineHeight:1.5, display:'flex', alignItems:'center', gap:8,
          }}>
            <BuIcons.info size={18} color={ADM.MUTED}/>
            Dopo il branch, entrambi i rami terminano: aggiungi step successivi sotto se vuoi una continuazione comune.
          </div>
        </div>
      )}
    </div>
  );
}

function BranchSplitVisual({ yesCount, noCount }) {
  return (
    <div style={{position:'relative', height:42, marginBottom:2}}>
      <svg viewBox="0 0 400 42" preserveAspectRatio="none" style={{width:'100%', height:'100%'}}>
        {/* linea entrante */}
        <path d="M200 0 L200 14" stroke={ADM.WARN} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* curva verso sinistra (Sì) */}
        <path d="M200 14 Q200 32 100 32 L100 42" stroke={ADM.OK} strokeWidth="2" fill="none" strokeLinecap="round"
          className="wf-branch-yes"/>
        {/* curva verso destra (No) */}
        <path d="M200 14 Q200 32 300 32 L300 42" stroke={ADM.MUTED} strokeWidth="2" fill="none" strokeLinecap="round"
          className="wf-branch-no"/>
        {/* dot incoming */}
        <circle cx="200" cy="2" r="2.5" fill={ADM.WARN}/>
        {/* etichette Sì/No */}
      </svg>
      <span style={{
        position:'absolute', left:'25%', top:18, transform:'translateX(-50%)',
        fontSize:12.2, fontWeight:800, color:ADM.OK, background:'#fff',
        padding:'1px 8px', borderRadius:99, border:`1px solid ${ADM.OK}40`,
        letterSpacing:'0.06em',
      }}>SÌ {yesCount > 0 && <span style={{color:ADM.MUTED, fontWeight:700}}>· {yesCount} step</span>}</span>
      <span style={{
        position:'absolute', right:'25%', top:18, transform:'translateX(50%)',
        fontSize:12.2, fontWeight:800, color:ADM.MUTED, background:'#fff',
        padding:'1px 8px', borderRadius:99, border:`1px solid ${ADM.BORDER}`,
        letterSpacing:'0.06em',
      }}>NO {noCount > 0 && <span style={{fontWeight:700}}>· {noCount} step</span>}</span>
    </div>
  );
}

function BranchColumn({ label, color, colorSoft, icon, steps, onChange }) {
  const Icon = BuIcons[icon];
  const insertAt = (index, kind) => {
    const newStep = makeStep(kind);
    onChange([...steps.slice(0, index), newStep, ...steps.slice(index)]);
  };
  const updateStep = (id, patch) => onChange(steps.map(s => s.id===id ? { ...s, ...patch } : s));
  const removeStep = (id) => onChange(steps.filter(s => s.id !== id));
  const moveStep = (id, dir) => {
    const i = steps.findIndex(s => s.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div style={{
      background:'#fff',
      border:`1px solid ${color}30`, borderTop:`3px solid ${color}`,
      borderRadius:9, padding:'10px 11px',
      display:'flex', flexDirection:'column', gap:6, minHeight:60,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:4}}>
        <div style={{width:20, height:20, borderRadius:5, background:colorSoft, color, display:'grid', placeItems:'center'}}>
          <Icon size={16}/>
        </div>
        <span style={{fontSize:12.2, fontWeight:800, color, textTransform:'uppercase', letterSpacing:'0.07em'}}>{label}</span>
      </div>

      {steps.length === 0 && (
        <div style={{fontSize:13.3, color:ADM.MUTED, padding:'8px 0', textAlign:'center', lineHeight:1.5}}>
          Nessuno step in questo ramo
        </div>
      )}
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="wf-step-enter">
            <BranchStepCompact step={s}
              onChange={(patch)=>updateStep(s.id, patch)}
              onRemove={()=>removeStep(s.id)}
              onMove={(d)=>moveStep(s.id, d)}
              canUp={i > 0} canDown={i < steps.length - 1}
            />
          </div>
        </React.Fragment>
      ))}
      <BranchAddBtn onAdd={(k)=>insertAt(steps.length, k)} color={color}/>
    </div>
  );
}

function BranchStepCompact({ step, onChange, onRemove, onMove, canUp, canDown }) {
  const kindDef = STEP_KINDS.find(k => k.id === step.kind);
  if (!kindDef) return null;
  const Icon = BuIcons[kindDef.icon] || BuIcons.plus;
  const c = ADM[kindDef.color] || ADM.MUTED;

  let titleLine = '';
  if (step.kind === 'email')  titleLine = step.subject || 'Email senza oggetto';
  else if (step.kind === 'push')  titleLine = step.title || 'Push senza titolo';
  else if (step.kind === 'sms')   titleLine = step.body  || 'SMS senza testo';
  else if (step.kind === 'wait')  titleLine = `Attendi +${step.delay?.n || 0} ${step.delay?.unit || 'min'}`;
  else if (step.kind === 'tag')   titleLine = `Tag: ${step.tagName || '—'}`;
  else if (step.kind === 'notify')titleLine = `Notifica staff`;
  else titleLine = kindDef.label;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:9,
      padding:'7px 9px',
      background:'#FBFBFC',
      border:`1px solid ${c}22`,
      borderLeft:`3px solid ${c}`,
      borderRadius:7,
    }}>
      <div style={{width:22, height:22, borderRadius:6, background:`${c}1f`, color:c, display:'grid', placeItems:'center', flexShrink:0}}>
        <Icon size={16}/>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{titleLine}</div>
        {step.kind === 'email' || step.kind === 'push' || step.kind === 'sms' ? (
          <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:1}}>+{step.delay?.n || 0} {step.delay?.unit}</div>
        ) : null}
      </div>
      {(step.kind === 'email' || step.kind === 'push' || step.kind === 'sms') && (
        <SmallInput
          value={step.kind === 'email' ? step.subject : step.kind === 'push' ? step.title : step.body}
          onChange={(v)=>onChange(step.kind === 'email' ? {subject:v} : step.kind === 'push' ? {title:v} : {body:v})}
          placeholder="Modifica…"
          width={120}
          style={{fontSize:13}}
        />
      )}
      <div style={{display:'flex', gap:2}}>
        {onMove && canUp && <AdmIconBtn icon="chevronUp" label="Su" onClick={()=>onMove(-1)} size={27}/>}
        {onMove && canDown && <AdmIconBtn icon="chevronDown" label="Giù" onClick={()=>onMove(+1)} size={27}/>}
        <AdmIconBtn icon="x" label="Rimuovi" onClick={onRemove} size={27}/>
      </div>
    </div>
  );
}

function BranchAddBtn({ onAdd, color }) {
  const [open, setOpen] = useStateWf(false);
  const allowed = ['email','push','sms','wait','tag','notify','stop'];
  const kinds = STEP_KINDS.filter(k => allowed.includes(k.id));
  return (
    <div style={{position:'relative', alignSelf:'center', marginTop:2}}>
      <button onClick={()=>setOpen(o=>!o)} className="wf-tap" style={{
        display:'inline-flex', alignItems:'center', gap:5,
        padding:'4px 10px',
        background:'#fff', border:`1px dashed ${color}60`,
        color, fontSize:12.6, fontWeight:700,
        borderRadius:99, cursor:'pointer', fontFamily:'inherit',
      }}>
        <BuIcons.plus size={15}/> Step
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:'fixed', inset:0, zIndex:5}}/>
          <div className="wf-popover-enter" style={{
            position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
            marginTop:5, zIndex:10,
            background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
            boxShadow:'0 10px 24px -8px rgba(15,17,21,0.18)',
            padding:5, display:'grid', gap:2, minWidth:180,
          }}>
            {kinds.map(k => {
              const Icon = BuIcons[k.icon] || BuIcons.plus;
              const c = ADM[k.color] || ADM.MUTED;
              return (
                <button key={k.id} onClick={()=>{ onAdd(k.id); setOpen(false); }} style={{
                  display:'inline-flex', alignItems:'center', gap:7,
                  padding:'6px 9px',
                  background:'transparent', border:'none',
                  borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                  textAlign:'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = ADM.PANEL_SOFT}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{width:18, height:18, borderRadius:5, background:`${c}1f`, color:c, display:'grid', placeItems:'center', flexShrink:0}}>
                    <Icon size={14}/>
                  </span>
                  <span style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>{k.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SPLIT A/B test ──────────────────────────────────────────────────────────
function SplitStepEditor({ step, onChange, onRemove, onMove, canUp, canDown }) {
  const c = ADM.PURPLE;
  return (
    <div style={nodeStyle(c, ADM.PURPLE_SOFT)}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom:10}}>
        <div style={iconBoxStyle(c, ADM.PURPLE_SOFT, 38)}><BuIcons.list size={20}/></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'0.07em'}}>A/B split test</div>
          <div style={{fontSize:14, color:ADM.TEXT, marginTop:4, lineHeight:1.5}}>
            Suddivisione casuale dei clienti su due varianti per misurare quale converte meglio.
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:8}}>
            <span style={{fontSize:13, fontWeight:600, color:ADM.MUTED}}>Distribuzione</span>
            <input type="range" min={10} max={90} value={step.ratio}
              onChange={e=>onChange({ratio: Number(e.target.value)})}
              style={{flex:1, accentColor:c}}/>
            <span style={{fontSize:13.7, fontWeight:800, color:c, minWidth:80, textAlign:'right'}}>
              {step.ratio}% / {100-step.ratio}%
            </span>
          </div>
        </div>
        <StepActions onMove={onMove} onRemove={onRemove} canUp={canUp} canDown={canDown}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        <BranchColumn
          label={`${step.labelA} · ${step.ratio}%`}
          color={c} colorSoft={ADM.PURPLE_SOFT}
          icon="check"
          steps={step.a || []}
          onChange={(s)=>onChange({a:s})}
        />
        <BranchColumn
          label={`${step.labelB} · ${100-step.ratio}%`}
          color={ADM.PINK} colorSoft={ADM.PINK_SOFT}
          icon="check"
          steps={step.b || []}
          onChange={(s)=>onChange({b:s})}
        />
      </div>
    </div>
  );
}

function TagStepEditor({ step, onChange, onRemove }) {
  return (
    <div style={nodeStyle(ADM.INFO, ADM.INFO_SOFT)}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={iconBoxStyle(ADM.INFO, ADM.INFO_SOFT)}>
          <BuIcons.paperclip size={19}/>
        </div>
        <span style={{fontSize:13, fontWeight:800, color:ADM.INFO, textTransform:'uppercase', letterSpacing:'0.07em'}}>Aggiungi tag</span>
        <SmallInput value={step.tagName} onChange={(v)=>onChange({tagName:v})} placeholder="es. cliente_engaged" width={220}/>
        <span style={{flex:1}}/>
        <StepActions onRemove={onRemove}/>
      </div>
    </div>
  );
}

function NotifyStepEditor({ step, onChange, onRemove }) {
  return (
    <div style={nodeStyle(ADM.INFO, ADM.INFO_SOFT)}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
        <div style={iconBoxStyle(ADM.INFO, ADM.INFO_SOFT)}><BuIcons.waiter size={19}/></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:800, color:ADM.INFO, textTransform:'uppercase', letterSpacing:'0.07em'}}>Notifica lo staff</div>
          <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginTop:6}}>
            <SmallSelect value={step.recipients} onChange={(v)=>onChange({recipients:v})}
              options={[
                {value:'manager', label:'Manager'},
                {value:'sala',    label:'Team sala'},
                {value:'cucina',  label:'Team cucina'},
                {value:'tutti',   label:'Tutto lo staff'},
              ]} width={150}/>
          </div>
          <SmallInput value={step.body} onChange={(v)=>onChange({body:v})}
            placeholder="Messaggio per lo staff (interno)" style={{marginTop:8}} block/>
        </div>
        <StepActions onRemove={onRemove}/>
      </div>
    </div>
  );
}

function GoalStepEditor({ onRemove }) {
  return (
    <div style={nodeStyle(ADM.OK, ADM.OK_SOFT)}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={iconBoxStyle(ADM.OK, ADM.OK_SOFT)}><BuIcons.check size={19}/></div>
        <span style={{fontSize:13, fontWeight:800, color:ADM.OK, textTransform:'uppercase', letterSpacing:'0.07em'}}>Obiettivo</span>
        <span style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Il cliente ha raggiunto l'obiettivo del workflow</span>
        <span style={{flex:1}}/>
        <StepActions onRemove={onRemove}/>
      </div>
    </div>
  );
}

function StopStepEditor({ onRemove }) {
  return (
    <div style={nodeStyle(ADM.DANGER, ADM.DANGER_SOFT)}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={iconBoxStyle(ADM.DANGER, ADM.DANGER_SOFT)}><BuIcons.x size={19}/></div>
        <span style={{fontSize:13, fontWeight:800, color:ADM.DANGER, textTransform:'uppercase', letterSpacing:'0.07em'}}>Termina</span>
        <span style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Il cliente esce dal workflow</span>
        <span style={{flex:1}}/>
        <StepActions onRemove={onRemove}/>
      </div>
    </div>
  );
}

function DelayEditor({ delay, onChange }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'2px 8px',
      background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:6,
    }}>
      <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>+</span>
      <input
        type="number" min={0} value={delay.n}
        onChange={e => onChange({...delay, n: Number(e.target.value)})}
        style={{width:42, border:'none', outline:'none', fontSize:14, fontWeight:700, color:ADM.PURPLE, fontFamily:'inherit', padding:0, background:'transparent'}}
      />
      <select value={delay.unit}
        onChange={e => onChange({...delay, unit: e.target.value})}
        style={{border:'none', outline:'none', fontSize:13.3, fontWeight:700, color:ADM.PURPLE, fontFamily:'inherit', background:'transparent', cursor:'pointer'}}>
        {TIME_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
    </span>
  );
}

function StepActions({ onMove, onRemove, canUp, canDown }) {
  return (
    <div style={{display:'flex', gap:4, flexShrink:0}}>
      {onMove && (
        <>
          <AdmIconBtn icon="chevronUp"   label="Sposta su" onClick={()=>onMove(-1)}/>
          <AdmIconBtn icon="chevronDown" label="Sposta giù" onClick={()=>onMove(+1)}/>
        </>
      )}
      <AdmIconBtn icon="x" label="Rimuovi" onClick={onRemove}/>
    </div>
  );
}

function Chip({ children, color, dot }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px', background:`${color}10`, color, borderRadius:99, fontSize:12.6, fontWeight:700}}>
      {dot && <span style={{width:5, height:5, borderRadius:'50%', background:color}}/>}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAILS · ridisegnati in 3 gruppi: Frequenza · Orario · Sicurezza
// ─────────────────────────────────────────────────────────────────────────────
function GuardrailsSection({ g, onChange }) {
  const set = (patch) => onChange({ ...g, ...patch });
  const [section, setSection] = useStateWf('frequenza');

  return (
    <AdmCard padding={0}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:8}}>
        <BuIcons.shield size={19} color={ADM.OK}/>
        <span style={{fontSize:13.3, fontWeight:800, color:ADM.TEXT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Guardrails</span>
        <span style={{flex:1}}/>
        <span style={{fontSize:12.2, fontWeight:800, color:ADM.OK, background:ADM.OK_SOFT, padding:'2px 7px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.05em'}}>Protetto</span>
      </div>

      <div style={{padding:'10px 14px 4px', display:'flex', gap:4, borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
        {[
          {id:'frequenza', label:'Frequenza', icon:'clock'},
          {id:'orario',    label:'Orario',    icon:'calendar'},
          {id:'sicurezza', label:'Sicurezza', icon:'shield'},
        ].map(t => {
          const active = section === t.id;
          const Icon = BuIcons[t.icon];
          return (
            <button key={t.id} onClick={()=>setSection(t.id)} className="wf-tap" style={{
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'5px 9px', fontSize:13, fontWeight:700,
              background: active ? ADM.OK_SOFT : 'transparent',
              color: active ? ADM.OK : ADM.MUTED,
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.15s',
            }}>
              <Icon size={16}/> {t.label}
            </button>
          );
        })}
      </div>

      <div style={{padding:'14px', display:'flex', flexDirection:'column', gap:12}}>
        {section === 'frequenza' && (<>
          <GuardrailRow label="Max sequenze al mese per cliente"
            hint="Quante volte uno stesso cliente può ri-entrare in questo workflow ogni mese.">
            <SmallInput type="number" width={56} value={g.maxPerMonth} onChange={(v)=>set({maxPerMonth: Number(v)})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>volte/mese</span>
          </GuardrailRow>

          <GuardrailRow label="Cooldown · non riavviare prima di"
            hint="Tempo minimo tra due entrate consecutive dello stesso cliente.">
            <SmallInput type="number" width={56} value={g.cooldownDays} onChange={(v)=>set({cooldownDays: Number(v)})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>giorni</span>
          </GuardrailRow>

          <GuardrailRow label="Max email totali · per cliente"
            hint="Frequency cap globale: sommando TUTTI i workflow attivi.">
            <SmallInput type="number" width={50} value={g.dayLimit} onChange={(v)=>set({dayLimit: Number(v)})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>/giorno</span>
            <SmallInput type="number" width={50} value={g.weekLimit} onChange={(v)=>set({weekLimit: Number(v)})} style={{marginLeft:6}}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>/settimana</span>
          </GuardrailRow>

          <ToggleRow checked={g.skipIfRecent7g} onChange={(v)=>set({skipIfRecent7g:v})}
            label="Salta se ha già ricevuto email negli ultimi 7 giorni"
            hint="Evita di sovrapporre comunicazioni quando un cliente è già stato contattato."/>

          <ToggleRow checked={g.skipIfDisengaged} onChange={(v)=>set({skipIfDisengaged:v})}
            label="Salta clienti disinteressati (tasso di apertura &lt; 10% su 10 email)"
            hint="Protegge la reputazione di consegna: evita di insistere su chi non legge."/>
        </>)}

        {section === 'orario' && (<>
          <GuardrailRow label="Finestra di invio"
            hint="Le comunicazioni non partono fuori da questo intervallo.">
            <SmallInput type="time" width={86} value={g.timeFrom} onChange={(v)=>set({timeFrom:v})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>–</span>
            <SmallInput type="time" width={86} value={g.timeTo} onChange={(v)=>set({timeTo:v})}/>
          </GuardrailRow>

          <ToggleRow checked={g.respectTz} onChange={(v)=>set({respectTz:v})}
            label="Rispetta il fuso orario del cliente"
            hint="L'orario locale del cliente, non quello del locale, viene rispettato."/>

          <ToggleRow checked={g.weekdaysOnly} onChange={(v)=>set({weekdaysOnly:v})}
            label="Solo giorni lavorativi (lun–ven)"/>

          <ToggleRow checked={g.quietHours} onChange={(v)=>set({quietHours:v})}
            label="Quiet hours · niente invii 22:00 – 08:00"
            hint="Hard cap notturno: nessun messaggio mai durante queste ore." required/>

          <ToggleRow checked={g.smartSendTime} onChange={(v)=>set({smartSendTime:v})}
            label="Smart send time · orario ottimale per ogni cliente"
            hint="Apprende dalle aperture passate e sceglie l'ora migliore per ciascuno."/>

          <ToggleRow checked={g.respectClosed} onChange={(v)=>set({respectClosed:v})}
            label="Non inviare se il locale è chiuso"
            hint="Sincronizzato con gli orari di apertura del locale nel gestionale."/>
        </>)}

        {section === 'sicurezza' && (<>
          <GuardrailRow label="Pausa automatica se bounce rate supera"
            hint="Il workflow si ferma automaticamente per proteggere il dominio.">
            <SmallInput type="number" width={60} value={g.pauseIfBounceAbove} onChange={(v)=>set({pauseIfBounceAbove: Number(v)})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>%</span>
          </GuardrailRow>

          <GuardrailRow label="Pausa automatica se unsubscribe rate supera"
            hint="Pausa di emergenza per evitare danni alla reputazione.">
            <SmallInput type="number" width={60} value={g.pauseIfUnsubAbove} onChange={(v)=>set({pauseIfUnsubAbove: Number(v)})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>%</span>
          </GuardrailRow>

          <GuardrailRow label="Cap di spesa (SMS + delivery)"
            hint="Budget massimo del workflow al mese · 0 = nessun cap.">
            <SmallInput type="number" width={70} value={g.budgetCap} onChange={(v)=>set({budgetCap: Number(v)})}/>
            <span style={{fontSize:13, color:ADM.MUTED}}>€/mese</span>
          </GuardrailRow>

          <ToggleRow checked={g.respectOptOut} onChange={(v)=>set({respectOptOut:v})}
            label="Rispetta opt-out e liste soppressioni" required
            hint="Obbligatorio per GDPR · non disattivabile."/>

          <div style={{padding:'10px 12px', background:ADM.WARN_SOFT, borderLeft:`3px solid ${ADM.WARN}`, borderRadius:'0 7px 7px 0'}}>
            <div style={{fontSize:13, fontWeight:800, color:ADM.WARN, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6}}>Modalità test</div>
            <ToggleRow checked={g.testMode} onChange={(v)=>set({testMode:v})}
              label="Manda solo a un destinatario di test"
              hint="Tutti i messaggi vanno a un singolo indirizzo per verifica."/>
            {g.testMode && (
              <SmallInput value={g.testRecipient} onChange={(v)=>set({testRecipient:v})}
                placeholder="email@di-test.it" style={{marginTop:8}} block/>
            )}
          </div>
        </>)}
      </div>
    </AdmCard>
  );
}

function GuardrailRow({ label, hint, children }) {
  return (
    <div>
      <div style={{fontSize:13.3, color:ADM.TEXT, fontWeight:600, marginBottom:5, lineHeight:1.4}}>{label}</div>
      {hint && <div style={{fontSize:12.6, color:ADM.MUTED, marginBottom:6, lineHeight:1.5}}>{hint}</div>}
      <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>{children}</div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange, required }) {
  return (
    <div>
      <label style={{display:'flex', alignItems:'flex-start', gap:9, cursor: required ? 'default' : 'pointer'}}>
        <Toggle checked={checked} onChange={onChange} disabled={required}/>
        <span style={{flex:1, minWidth:0}}>
          <span style={{display:'block', fontSize:13.3, color:ADM.TEXT, lineHeight:1.4, fontWeight:600}}
            dangerouslySetInnerHTML={{__html: label}}/>
          {hint && <span style={{display:'block', fontSize:12.6, color:ADM.MUTED, marginTop:2, lineHeight:1.45}}>{hint}</span>}
          {required && <span style={{display:'inline-block', marginTop:3, fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Obbligatorio per GDPR</span>}
        </span>
      </label>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button onClick={()=> !disabled && onChange(!checked)} style={{
      width:32, height:18, borderRadius:99,
      background: checked ? ADM.OK : '#D1D5DB',
      border:'none', cursor: disabled ? 'default' : 'pointer',
      position:'relative', padding:0, flexShrink:0, marginTop:1,
      transition:'background 0.2s cubic-bezier(0.2,0.7,0.3,1)',
      opacity: disabled ? 0.7 : 1,
    }}>
      <span style={{
        position:'absolute', top:2, left: checked ? 16 : 2,
        width:14, height:14, borderRadius:'50%',
        background:'#fff',
        boxShadow:'0 1px 3px rgba(15,17,21,0.18)',
        transition:'left 0.2s cubic-bezier(0.2,0.7,0.3,1)',
      }}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY · anteprima con audience live
// ─────────────────────────────────────────────────────────────────────────────
function SummaryCard({ wf, validation }) {
  const trig = findTrigger(wf.trigger?.id);
  const nEmail = countStepKind(wf.steps, 'email');
  const nPush  = countStepKind(wf.steps, 'push');
  const nSms   = countStepKind(wf.steps, 'sms');
  const nBranch= countStepKind(wf.steps, 'branch');
  const totDelay = computeTotalDelay(wf.steps);

  const audienceTarget = useMemoWf(() => {
    if (!trig) return 0;
    const baseByTrigger = {
      primo_ordine: 280, soglia_spesa: 140, inattivita: 360, compleanno: 95, carrello_abb: 210,
      post_visita: 420, prenot_creata: 180, qr_primo_scan: 240, rec_negativa: 18,
      anniversario: 120, referral_attivo: 60, nps_promoter: 92, freq_calata: 140,
    };
    let base = baseByTrigger[trig.id] ?? 180;
    base = Math.round(base * Math.max(0.15, 1 - wf.conditions.items.length * 0.18));
    return base;
  }, [trig?.id, wf.conditions.items.length]);

  const audienceDisplay = useAnimatedNumber(audienceTarget, 600);

  return (
    <AdmCard padding={0}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:8}}>
        <BuIcons.eye size={18} color={ADM.MUTED}/>
        <span style={{fontSize:13.3, fontWeight:800, color:ADM.TEXT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Anteprima</span>
      </div>
      <div style={{padding:'14px', display:'flex', flexDirection:'column', gap:9}}>
        <div style={{padding:'12px 14px', background:`linear-gradient(135deg, ${ADM.PINK_SOFT}, ${ADM.PINK_BG_SOFT})`, borderRadius:10, border:`1px solid ${ADM.PINK}30`}}>
          <div style={{fontSize:12.6, color:ADM.PINK_DARK, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em'}}>Audience stimata</div>
          <div style={{fontSize:28.1, fontWeight:800, color:ADM.PINK_DARK, letterSpacing:'-0.03em', marginTop:4, lineHeight:1}}>
            ≈ {fmtNum(audienceDisplay)}
          </div>
          <div style={{fontSize:12.6, color:ADM.PINK_DARK, opacity:0.7, marginTop:4, lineHeight:1.5}}>
            clienti idonei oggi · aggiornata in tempo reale al variare dei filtri
          </div>
        </div>

        <SumRow label="Trigger" value={trig?.label || '— non impostato'} tone={trig ? null : 'WARN'}/>
        <SumRow label="Filtri ingresso" value={wf.conditions.items.length === 0 ? 'Tutti' : `${wf.conditions.items.length} · ${wf.conditions.mode}`}/>
        <SumRow label="Email" value={nEmail}/>
        {nPush > 0 && <SumRow label="Push" value={nPush}/>}
        {nSms > 0  && <SumRow label="SMS"  value={nSms}/>}
        {nBranch> 0 && <SumRow label="Diramazioni" value={nBranch}/>}
        <SumRow label="Durata totale" value={totDelay > 0 ? `≈ ${formatDays(totDelay)}` : '—'}/>

        {validation.length > 0 && (
          <div style={{marginTop:4, padding:'10px 12px', background:ADM.WARN_SOFT, borderLeft:`3px solid ${ADM.WARN}`, borderRadius:'0 7px 7px 0'}}>
            <div style={{fontSize:12.6, fontWeight:800, color:ADM.WARN, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5}}>Da sistemare</div>
            <ul style={{margin:0, paddingLeft:16, fontSize:13.3, color:ADM.TEXT, lineHeight:1.6}}>
              {validation.map((v,i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        )}
      </div>
    </AdmCard>
  );
}

function SumRow({ label, value, tone }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10}}>
      <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>{label}</span>
      <span style={{fontSize:14, fontWeight:700, color: tone ? ADM[tone] : ADM.TEXT, textAlign:'right'}}>{value}</span>
    </div>
  );
}

function useAnimatedNumber(target, duration=400) {
  const [val, setVal] = useStateWf(target);
  const fromRef = useRefWf(target);
  useEffectWf(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - k, 3); // ease-out cubic
      setVal(Math.round(from + (target - from) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function computeTotalDelay(steps) {
  let total = 0;
  for (const s of steps) {
    if (s.kind === 'wait')   total += toDays(s.delay);
    if (s.kind === 'email' || s.kind === 'push' || s.kind === 'sms') total += toDays(s.delay || {n:0, unit:'min'});
    if (s.kind === 'branch') {
      const y = computeTotalDelay(s.yes || []);
      const n = computeTotalDelay(s.no  || []);
      total += Math.max(y, n);
    }
    if (s.kind === 'split') {
      total += Math.max(computeTotalDelay(s.a||[]), computeTotalDelay(s.b||[]));
    }
  }
  return total;
}

function formatDays(d) {
  if (d < 1) return `${Math.round(d * 24)} ore`;
  if (d < 14) return `${Math.round(d)} giorni`;
  return `${(d / 7).toFixed(1)} settimane`;
}

function toDays({n, unit}) {
  if (!n) return 0;
  if (unit === 'min')      return n / 1440;
  if (unit === 'ore')      return n / 24;
  if (unit === 'settimane')return n * 7;
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHELL / CONNECTOR / NODI BASE
// ─────────────────────────────────────────────────────────────────────────────
function SectionShell({ label, sub, color, right, children, help }) {
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:9}}>
        <span style={{width:7, height:7, borderRadius:'50%', background: color}}/>
        <span style={{fontSize:13, fontWeight:800, color, textTransform:'uppercase', letterSpacing:'0.08em'}}>{label}</span>
        {sub && <span style={{fontSize:13.3, color:ADM.MUTED}}>· {sub}</span>}
        {help && <Tooltip text={help}/>}
        <span style={{flex:1}}/>
        {right}
      </div>
      {children}
    </div>
  );
}

function Tooltip({ text }) {
  const [open, setOpen] = useStateWf(false);
  return (
    <span style={{position:'relative', display:'inline-flex'}}
      onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      <BuIcons.help size={17} color={ADM.MUTED_SOFT}/>
      {open && (
        <span className="wf-popover-enter" style={{
          position:'absolute', top:'140%', left:0, zIndex:30,
          background:'#0F1115', color:'#fff', padding:'8px 11px',
          fontSize:13.3, lineHeight:1.5, borderRadius:7,
          width:260, fontWeight:500, letterSpacing:'-0.005em',
          boxShadow:'0 10px 28px -8px rgba(15,17,21,0.40)',
        }}>{text}</span>
      )}
    </span>
  );
}

function Connector() {
  return (
    <div style={{display:'flex', justifyContent:'center', padding:'4px 0'}}>
      <div style={{width:2, height:20, background:`linear-gradient(180deg, ${ADM.BORDER} 0%, ${ADM.BORDER_SOFT} 100%)`, borderRadius:1}}/>
    </div>
  );
}

function EndNode() {
  return (
    <>
      <Connector/>
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'11px 14px',
        background:'#FBFBFC',
        border:`1px dashed ${ADM.BORDER}`, borderRadius:9,
        color:ADM.MUTED,
      }}>
        <div style={iconBoxStyle(ADM.MUTED, '#F0F1F3', 28)}><BuIcons.check size={17}/></div>
        <span style={{fontSize:13.3, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Fine sequenza</span>
        <span style={{fontSize:13, color:ADM.MUTED_SOFT}}>· il cliente esce dal workflow</span>
      </div>
    </>
  );
}

function nodeStyle(borderColor, bgTint) {
  return {
    padding:'12px 14px',
    background:'#fff',
    border:`1px solid ${borderColor}40`,
    borderLeft:`3px solid ${borderColor}`,
    borderRadius:10,
    boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
  };
}
function iconBoxStyle(color, bg, size=34) {
  return { width:size, height:size, borderRadius:9, background:bg, color, flexShrink:0, display:'grid', placeItems:'center' };
}
function emptyNodeStyle() {
  return {
    display:'flex', alignItems:'center', gap:10, justifyContent:'center',
    padding:'20px 14px',
    background:'#fff',
    border:`1.5px dashed ${ADM.BORDER}`,
    color:ADM.MUTED,
    fontSize:14.4, fontWeight:600, fontFamily:'inherit',
    borderRadius:10, cursor:'pointer', width:'100%',
  };
}
function miniBtnStyle() {
  return {
    fontSize:13, fontWeight:700, color:ADM.MUTED,
    background:'#fff', border:`1px solid ${ADM.BORDER}`,
    padding:'5px 10px', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLI BASE
// ─────────────────────────────────────────────────────────────────────────────
function SmallInput({ value, onChange, type='text', placeholder, width, block, style }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding:'5px 9px',
        border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:6,
        fontSize:14, fontFamily:'inherit', color:ADM.TEXT,
        outline:'none',
        width: block ? '100%' : (width || 'auto'),
        background:'#fff',
        transition:'border-color 0.15s',
        ...style,
      }}
      onFocus={e=>e.target.style.borderColor = ADM.PINK}
      onBlur={e=>e.target.style.borderColor = ADM.BORDER_SOFT}
    />
  );
}

function SmallSelect({ value, onChange, options, width }) {
  return (
    <div style={{position:'relative', display:'inline-flex'}}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding:'5px 24px 5px 9px',
        border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:6,
        fontSize:14, fontFamily:'inherit', color:ADM.TEXT,
        outline:'none', background:'#fff', appearance:'none',
        cursor:'pointer',
        width: width ? `${width}px` : 'auto',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}>
        <BuIcons.chevronDown size={16}/>
      </span>
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children, width=560 }) {
  return (
    <div onClick={onClose} className="wf-modal-overlay" style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.45)',
      display:'grid', placeItems:'center', zIndex:1000, padding:20,
    }}>
      <div onClick={e=>e.stopPropagation()} className="wf-modal-content" style={{
        width: '100%', maxWidth: width, maxHeight:'85vh', overflow:'auto',
        background:'#fff', borderRadius:16,
        boxShadow:'0 24px 64px -12px rgba(15,17,21,0.50)',
      }}>
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:15.8, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.015em'}}>{title}</div>
            {subtitle && <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:3, lineHeight:1.5}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background:'transparent', border:'none', color:ADM.MUTED,
            padding:6, borderRadius:6, cursor:'pointer', display:'inline-flex',
            flexShrink:0,
          }}><BuIcons.x size={20}/></button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANIMAZIONI · spring-like cubic-bezier alla Apple
// ════════════════════════════════════════════════════════════════════════════
const WF_ANIMATIONS = `
@keyframes wfStepIn {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wfBranchIn {
  0%   { opacity: 0; transform: translateY(-4px); max-height: 0; }
  60%  { opacity: 0.6; }
  100% { opacity: 1; transform: translateY(0); max-height: 2000px; }
}
@keyframes wfFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes wfFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-4px); }
}
@keyframes wfPopoverIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wfModalIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes wfModalContentIn {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wfPulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%      { transform: scale(1.4); opacity: 0.5; }
}
@keyframes wfBranchYes {
  from { stroke-dasharray: 100; stroke-dashoffset: 100; }
  to   { stroke-dasharray: 100; stroke-dashoffset: 0; }
}
@keyframes wfBranchNo {
  from { stroke-dasharray: 100; stroke-dashoffset: 100; }
  to   { stroke-dasharray: 100; stroke-dashoffset: 0; }
}
.wf-step-enter      { animation: wfStepIn 0.26s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
.wf-branch-enter    { animation: wfBranchIn 0.36s cubic-bezier(0.2, 0.7, 0.3, 1) both; overflow: hidden; }
.wf-fade-in         { animation: wfFadeIn 0.28s ease both; }
.wf-fade-out        { animation: wfFadeOut 0.2s ease both; }
.wf-editor-enter    { animation: wfFadeIn 0.30s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
.wf-editor-leaving  { animation: wfFadeOut 0.20s ease both; }
.wf-popover-enter   { animation: wfPopoverIn 0.16s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
.wf-modal-overlay   { animation: wfModalIn 0.20s ease both; }
.wf-modal-content   { animation: wfModalContentIn 0.26s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
.wf-pulse           { animation: wfPulse 2s ease-in-out infinite; }
.wf-branch-yes      { animation: wfBranchYes 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) 0.05s both; }
.wf-branch-no       { animation: wfBranchNo  0.5s cubic-bezier(0.2, 0.7, 0.3, 1) 0.05s both; }
.wf-tap             { transition: transform 0.10s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease; }
.wf-tap:active      { transform: scale(0.98); }
`;

window.WorkflowEmailPane = WorkflowEmailPane;

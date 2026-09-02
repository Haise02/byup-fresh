// Dati statici contabilità

const COST_CATEGORIES = [
  { id:'affitti', label:'Affitti & utenze', color:'#fde68a', dark:'#92400e', icon:'🏠' },
  { id:'personale', label:'Personale', color:'#bfdbfe', dark:'#1e40af', icon:'👥' },
  { id:'materie', label:'Materie prime', color:'#fecaca', dark:'#991b1b', icon:'🥩' },
  { id:'servizi', label:'Servizi', color:'#c7d2fe', dark:'#3730a3', icon:'🔧' },
  { id:'altro', label:'Altro', color:'#e5e7eb', dark:'#374151', icon:'📋' },
];

// La NATURA del costo (cost_entries.cost_nature, L1-34): fisso, variabile o
// misto, predefinito variabile. È cosa diversa dalla categoria merceologica,
// che dice a che cosa il costo si riferisce, e dalla ricorrenza, che dice ogni
// quanto torna — «l'affitto è fisso e le materie prime sono variabili, ma il
// personale può essere l'uno o l'altro e nessuna delle altre due colonne lo
// distingue». Per questo la natura si CHIEDE alla registrazione e non si
// deriva dalla categoria. Le statistiche economiche distinguevano fissi e
// variabili con due tinte senza che nessuno raccogliesse il dato: da qui in
// poi il dato c'è.
const COST_NATURES = [
  { id:'fixed',    label:'Fisso',     hint:'Non cambia col volume di lavoro: affitto, canoni, assicurazione' },
  { id:'variable', label:'Variabile', hint:'Cresce con l\'attività: materie prime, bevande, consumi' },
  { id:'mixed',    label:'Misto',     hint:'Una parte fissa e una che varia: utenze, personale a chiamata' },
];
const COST_NATURE_DEFAULT = 'variable';

// `nature` per voce, sensata caso per caso: le bollette hanno una quota fissa
// e una a consumo; il software gestionale è un canone più le comande oltre
// soglia, quindi misto; la manutenzione dei frigoriferi è chiamata a guasto.
const COSTS_DATA = [
  { id:1, name:'Affitto locale', cat:'affitti', amount:5000, nature:'fixed', type:'recurring', freq:'Mensile', next:'2026-02-01', status:'paid', supplier:'Immobiliare Rossi' },
  { id:2, name:'Bolletta luce',   cat:'affitti', amount:680, nature:'mixed',  type:'recurring', freq:'Bimestrale', next:'2026-01-28', status:'due', supplier:'Enel Energia' },
  { id:3, name:'Bolletta gas',    cat:'affitti', amount:340, nature:'mixed',  type:'recurring', freq:'Bimestrale', next:'2026-02-05', status:'due', supplier:'Eni Plenitude' },
  { id:4, name:'Internet & telefono', cat:'affitti', amount:79, nature:'fixed', type:'recurring', freq:'Mensile', next:'2026-01-15', status:'overdue', supplier:'TIM Business' },
  { id:5, name:'Stipendi staff',  cat:'personale', amount:8400, nature:'fixed', type:'recurring', freq:'Mensile', next:'2026-01-27', status:'due', supplier:'Buste paga' },
  { id:6, name:'Contributi INPS', cat:'personale', amount:2200, nature:'fixed', type:'recurring', freq:'Mensile', next:'2026-01-16', status:'due', supplier:'INPS' },
  { id:7, name:'Forniture macelleria', cat:'materie', amount:1850, nature:'variable', type:'recurring', freq:'Settimanale', next:'2026-01-13', status:'overdue', supplier:'Carni Fattoria' },
  { id:8, name:'Pesce fresco',    cat:'materie', amount:980, nature:'variable', type:'recurring', freq:'Settimanale', next:'2026-01-14', status:'due', supplier:'Mercato ittico' },
  { id:9, name:'Verdure & ortaggi', cat:'materie', amount:540, nature:'variable', type:'recurring', freq:'Settimanale', next:'2026-01-13', status:'overdue', supplier:'Bio Orto' },
  { id:10, name:'Vini & bevande', cat:'materie', amount:2300, nature:'variable', type:'one-off', freq:null, next:'2026-01-22', status:'due', supplier:'Cantina Verde' },
  { id:11, name:'Pulizie',        cat:'servizi', amount:420, nature:'fixed', type:'recurring', freq:'Mensile', next:'2026-01-30', status:'paid', supplier:'CleanPro' },
  { id:12, name:'Manutenzione frigoriferi', cat:'servizi', amount:280, nature:'mixed', type:'one-off', freq:null, next:'2026-02-12', status:'due', supplier:'Tecnocold srl' },
  { id:13, name:'Software gestionale', cat:'servizi', amount:49, nature:'mixed', type:'recurring', freq:'Mensile', next:'2026-01-20', status:'due', supplier:'byup' },
  { id:14, name:'Commercialista', cat:'servizi', amount:350, nature:'fixed', type:'recurring', freq:'Trimestrale', next:'2026-03-31', status:'paid', supplier:'Studio Bianchi' },
  { id:15, name:'Assicurazione attività', cat:'altro', amount:1200, nature:'fixed', type:'recurring', freq:'Annuale', next:'2026-09-01', status:'paid', supplier:'Generali' },
  { id:16, name:'Tassa rifiuti TARI', cat:'altro', amount:680, nature:'fixed', type:'recurring', freq:'Annuale', next:'2026-06-30', status:'paid', supplier:'Comune' },
  { id:17, name:'Materiale di consumo', cat:'altro', amount:120, nature:'variable', type:'one-off', freq:null, next:'2026-01-29', status:'due', supplier:'Metro' },
];

const POS_DEVICES = [
  { id:'pos-01', model:'iPad mini', name:'POS Bancone',   user:'Marco' },
  { id:'pos-02', model:'iPhone 14', name:'POS Sala 1',    user:'Giulia' },
  { id:'pos-03', model:'iPhone 13', name:'POS Sala 2',    user:'Luca' },
  { id:'pos-04', model:'iPad Air',  name:'POS Cassa',     user:'Marco' },
];

const CASH_MOVEMENTS = Array.from({length: 12}).map((_, i) => {
  const channel = i%3 === 0 ? 'cassa' : (i%3===1 ? 'cameriere' : 'app');
  // POS device: cassa fisica = iPad fisso al bancone, cameriere = iPhone in sala, app = nessun POS (ordine cliente)
  const posMap = {
    cassa: POS_DEVICES[3],
    cameriere: [POS_DEVICES[1], POS_DEVICES[2]][i % 2],
    app: null,
  };
  return {
    id: '0000'+(i+1).toString().padStart(2,'0'),
    amount: [54.20, 32.10, 78.40, 145.00, 28.50, 96.30, 42.00, 88.70, 12.50, 156.00, 64.30, 39.80][i] || 50,
    date: new Date().toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit', year:'numeric'}),
    time: ['11:42','12:08','12:34','13:02','13:18','13:45','14:12','14:30','14:48','15:02','15:20','15:48'][i],
    channel,
    channelLabel: channel === 'cassa' ? 'Cassa fisica' : (channel === 'cameriere' ? 'Da Cameriere' : 'Byup App'),
    pos: posMap[channel],
  };
});

const IVA_MONTHLY = [
  { m:'Gen', deb: 8420, cred: 6210 },
  { m:'Feb', deb: 7850, cred: 5980 },
  { m:'Mar', deb: 9120, cred: 7140 },
  { m:'Apr', deb: 8260, cred: 6420 },
  { m:'Mag', deb: 9450, cred: 7280 },
  { m:'Giu', deb: 10120, cred: 7900 },
  { m:'Lug', deb: 12380, cred: 8920 },
  { m:'Ago', deb: 11240, cred: 8410 },
  { m:'Set', deb: 9680, cred: 7320 },
  { m:'Ott', deb: 9046, cred: 6840 },
  { m:'Nov', deb: 9420, cred: 7120 },
  { m:'Dic', deb: 10800, cred: 8240 },
];

const IVA_RATES = [
  { rate:'10%', deb: 5840, cred: 4360 },
  { rate:'22%', deb: 1966, cred: 1500 },
];

// Export recenti: nomi e date derivano da "oggi", così la demo non invecchia mai.
const _EXP_MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const _expMonth = (back) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - back); return d; };
const _expDate = (d, day, hm) => `${String(day).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${hm}`;
const EXPORT_HISTORY = [
  { name:`incassi_${_EXP_MESI[_expMonth(1).getMonth()]}.csv`, size:'245KB', date:_expDate(_expMonth(0), 3, '14:30') },
  { name:`incassi_${_EXP_MESI[_expMonth(2).getMonth()]}.csv`, size:'238KB', date:_expDate(_expMonth(1), 3, '14:30') },
  { name:`incassi_${_EXP_MESI[_expMonth(3).getMonth()]}.csv`, size:'251KB', date:_expDate(_expMonth(2), 3, '14:30') },
  { name:`iva_q${Math.floor(_expMonth(1).getMonth()/3)+1}_${_expMonth(1).getFullYear()}.pdf`, size:'180KB', date:_expDate(_expMonth(0), 2, '09:12') },
  { name:`costi_${_EXP_MESI[_expMonth(1).getMonth()]}.xlsx`, size:'92KB', date:_expDate(_expMonth(0), 2, '08:50') },
];

// Ri-ancoraggio scadenze costi: il mock è stato scritto con "oggi" ≈ 15 gen 2026.
// Trasliamo ogni scadenza dello scarto con l'oggi reale: le distanze relative
// (in ritardo, in arrivo, tra un mese) restano identiche e la demo resta attuale.
(() => {
  const shift = Math.floor((Date.now() - new Date('2026-01-15T12:00:00').getTime()) / 86400000);
  COSTS_DATA.forEach(c => {
    const d = new Date(c.next + 'T12:00:00');
    d.setDate(d.getDate() + shift);
    c.next = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
})();

window.COST_CATEGORIES = COST_CATEGORIES;
window.COSTS_DATA = COSTS_DATA;
window.CASH_MOVEMENTS = CASH_MOVEMENTS;
window.IVA_MONTHLY = IVA_MONTHLY;
window.IVA_RATES = IVA_RATES;
window.EXPORT_HISTORY = EXPORT_HISTORY;

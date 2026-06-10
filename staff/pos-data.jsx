// Byup Staff — Dati mock (esercente + transazioni)

// Esercente / operatore loggato (account Stripe collegato)
const MERCHANT = {
  nome: 'Bar Centrale',
  operatore: 'Marco Rinaldi',
  email: 'barcentrale@byup.it',
};

// Coda di incasso — conti inviati dal gestionale, in attesa di pagamento sul POS.
// Il POS non sfoglia i tavoli aperti: pesca da questa coda. Il conto arriva già
// definito (tavolo, righe, split, sconti, importo) e qui è immutabile.
// `inviato` = ora di invio del conto alla coda di incasso.
// `inPagamentoAltrove` = MOCK visivo: conto preso in carico da un altro dispositivo
//   (in pagamento, bloccato). Nel prototipo è un flag statico; il lock reale è
//   logica backend (stato condiviso + presa in carico atomica + rilascio/timeout).
const CODA_INCASSO = [
  { id: 'c_12', tavolo: 12, importo: 27.00, coperti: 2, inviato: '19:42' },
  { id: 'c_05', tavolo: 5,  importo: 64.50, coperti: 4, inviato: '20:08', inPagamentoAltrove: true },
  { id: 'c_08', tavolo: 8,  importo: 12.00, coperti: 1, inviato: '20:31' },
  { id: 'c_03', tavolo: 3,  importo: 41.00, coperti: 3, inviato: '20:55' },
];

// Storico transazioni (più recente in cima) — tutte Tap to Pay
// stato: 'ok' | 'fail' | 'refund'
const TRANSAZIONI = [
  { id: 't_9f21', importo: 14.50, ora: '14:32', data: 'Oggi', stato: 'ok',     brand: 'Visa',       last4: '4242' },
  { id: 't_9f18', importo: 6.00,  ora: '14:05', data: 'Oggi', stato: 'ok',     brand: 'Mastercard', last4: '5555' },
  { id: 't_9f10', importo: 28.00, ora: '13:48', data: 'Oggi', stato: 'ok',     brand: 'Apple Pay',  last4: '——'   },
  { id: 't_9f02', importo: 9.50,  ora: '13:12', data: 'Oggi', stato: 'fail',   brand: 'Visa',       last4: '0341' },
  { id: 't_8e90', importo: 42.00, ora: '12:40', data: 'Oggi', stato: 'ok',     brand: 'Amex',       last4: '0005' },
  { id: 't_8e71', importo: 5.00,  ora: '12:08', data: 'Oggi', stato: 'ok',     brand: 'Google Pay', last4: '——'   },
  { id: 't_8d40', importo: 18.00, ora: '19:55', data: 'Ieri', stato: 'refund', brand: 'Mastercard', last4: '8210' },
  { id: 't_8d21', importo: 7.50,  ora: '19:20', data: 'Ieri', stato: 'ok',     brand: 'Visa',       last4: '4242' },
  { id: 't_8d05', importo: 33.00, ora: '18:44', data: 'Ieri', stato: 'ok',     brand: 'Visa',       last4: '1111' },
];

// Totale incassato oggi (solo transazioni riuscite)
const INCASSO_OGGI = TRANSAZIONI
  .filter(t => t.data === 'Oggi' && t.stato === 'ok')
  .reduce((s, t) => s + t.importo, 0);

const N_OGGI = TRANSAZIONI.filter(t => t.data === 'Oggi' && t.stato === 'ok').length;

Object.assign(window, { MERCHANT, CODA_INCASSO, TRANSAZIONI, INCASSO_OGGI, N_OGGI });

// Byup Staff — Dati mock (esercente + transazioni)

// ─── Utenza, appartenenze, contesto (D-41 · P-53) ────────────────────────────
// L'utenza è della persona, il locale è l'ambiente in cui entra. Le tre regole
// di D-41 come le legge il prototipo (D-41 non è nel repo: la formulazione è
// ricavata dalla voce): (1) una persona ha UNA utenza, con la sua email, per
// quanti siano i locali che l'hanno invitata; (2) ogni locale che la invita le
// aggiunge una riga in memberships, col ruolo che vale lì — l'invito aggiunge
// un'appartenenza, l'utenza nasce solo se manca; (3) il locale disattiva
// l'appartenenza, non l'utenza: memberships.deactivated_at con
// deactivated_reason, e la persona resta sé stessa negli altri locali.
// memberships.venue_id nullo = tutte le sedi del ristorante: è il dato che
// regge il selettore multi-sede.
// Il contesto scelto vive in sessions.active_restaurant_id / active_venue_id
// / context_switched_at (qui SESSIONE). MERCHANT resta la costante che tutte
// le schermate leggono (incasso, pagamento, profilo, Face ID, dettaglio
// transazione, presa d'atto): al momento della scelta la si DERIVA
// dall'appartenenza con Object.assign — dichiarato qui perché è l'unico punto
// in cui una costante cambia sotto i piedi ai suoi lettori.
// L'account-cassa condiviso fra persone (barcentrale@byup.it) non esiste più:
// nome ed email nel seme sono della persona.
const PERSONA = { id: 'u_marco', nome: 'Marco Rinaldi', email: 'marco.rinaldi@gmail.com' };
const RISTORANTI = [
  { id: 'r_centrale', nome: 'Bar Centrale', sedi: [{ id: 'v_centrale', nome: 'Bar Centrale', citta: 'Milano' }] },
  { id: 'r_borgo', nome: 'Trattoria del Borgo', sedi: [
    { id: 'v_borgo_centro', nome: 'Trattoria del Borgo · Centro', citta: 'Bologna' },
    { id: 'v_borgo_fiera',  nome: 'Trattoria del Borgo · Fiera',  citta: 'Bologna' },
  ] },
];
// memberships: una riga per locale che ha invitato la persona.
const APPARTENENZE = [
  { id: 'm_1', user_id: 'u_marco', restaurant_id: 'r_centrale', venue_id: 'v_centrale', ruolo: 'Cassa', invited_at: '2025-11-03', deactivated_at: null, deactivated_reason: null },
  // venue_id nullo = tutte le sedi della Trattoria del Borgo.
  { id: 'm_2', user_id: 'u_marco', restaurant_id: 'r_borgo',    venue_id: null,         ruolo: 'Cassa', invited_at: '2026-05-20', deactivated_at: null, deactivated_reason: null },
];
// sessions.*: il contesto scelto, vuoto finché la persona non entra.
const SESSIONE = { active_restaurant_id: null, active_venue_id: null, membership_id: null, context_switched_at: null };

// A decidere in quale sede si entra sono le APPARTENENZE, e solo quelle
// (P-145): l'account è della persona, e un locale che la invita in una sede
// compie l'atto che decide dove può entrare. Il «telefono della sede»
// (?dispositivo=locale) che filtrava gli ambienti sul ristorante del
// dispositivo era un secondo meccanismo per la stessa domanda, e rispondeva
// diversamente: dichiarava una sede precisa e poi le faceva scegliere tutte.
// È tolto. Il dispositivo censito presso l'Agenzia (Dati fiscali, nato col
// collegamento a Stripe) è un'altra cosa e non c'entra.

// Gli ambienti in cui la persona può entrare: le appartenenze attive, espanse
// per sede (venue_id nullo = tutte). Nessuno: non si entra; uno: si entra
// dritti; più d'uno: si sceglie.
function staffAmbienti() {
  const out = [];
  APPARTENENZE.filter(m => !m.deactivated_at).forEach(m => {
    const r = RISTORANTI.find(x => x.id === m.restaurant_id); if (!r) return;
    r.sedi.filter(sd => !m.venue_id || sd.id === m.venue_id).forEach(sd => out.push({
      membership_id: m.id, restaurant_id: r.id, ristorante: r.nome, venue_id: sd.id, sede: sd.nome, citta: sd.citta, ruolo: m.ruolo, multiSede: r.sedi.length > 1,
    }));
  });
  return out;
}

// La scelta: SESSIONE prende il contesto, MERCHANT si deriva.
function staffEntra(a) {
  Object.assign(SESSIONE, { active_restaurant_id: a.restaurant_id, active_venue_id: a.venue_id, membership_id: a.membership_id, context_switched_at: new Date() });
  Object.assign(MERCHANT, { nome: a.sede, ristorante: a.ristorante, ruolo: a.ruolo, operatore: PERSONA.nome, email: PERSONA.email });
}
// Il logout NON svuota SESSIONE: l'ultimo contesto resta, come
// sessions.active_* sul server, ed è quello che il Face ID riprende.
// Si svuota solo quando l'appartenenza viene spenta.
function staffEsci() { Object.assign(SESSIONE, { active_restaurant_id: null, active_venue_id: null, membership_id: null, context_switched_at: null }); }

// La persona disattivata a sessione aperta: il titolare la spegne da Personale
// mentre lei è dentro. Qui arriva dalla console (BYUP_STAFF_DISATTIVA()) o da
// ?disattiva=1, che la innesca alla prima azione dopo l'ingresso; la sessione
// se ne accorge alla prossima azione (nav e openModal in POSApp), non prima.
function staffDisattiva(reason) {
  const m = APPARTENENZE.find(x => x.id === SESSIONE.membership_id);
  if (!m || m.deactivated_at) return false;
  m.deactivated_at = new Date(); m.deactivated_reason = reason || 'owner_deactivated';
  return true;
}
function staffAccessoRevocato() { const m = APPARTENENZE.find(x => x.id === SESSIONE.membership_id); return !!(m && m.deactivated_at); }
const DISATTIVA_DEMO = (() => { try { return new URLSearchParams(window.location.search).get('disattiva') === '1'; } catch (e) { return false; } })();
window.BYUP_STAFF_DISATTIVA = (reason) => staffDisattiva(reason);

// Il contesto letto da tutte le schermate: derivato da staffEntra. Nome ed
// email sono della persona (D-41), il locale arriva dalla scelta.
const MERCHANT = { nome: '', ristorante: '', ruolo: '', operatore: PERSONA.nome, email: PERSONA.email };

// Coda di incasso — conti inviati dal gestionale, in attesa di pagamento sul POS.
// Il POS non sfoglia i tavoli aperti: pesca da questa coda. Il conto arriva già
// definito (tavolo, righe, split, sconti, importo) e qui è immutabile.
// `inviato` = ora di invio del conto alla coda di incasso.
// `inPagamentoAltrove` = MOCK visivo: conto preso in carico da un altro dispositivo
//   (in pagamento, bloccato). Nel prototipo è un flag statico; il lock reale è
//   logica backend (stato condiviso + presa in carico atomica + rilascio/timeout).
const CODA_INCASSO = [
  { id: 'c_12', tavolo: 12, importo: 27.00, inviato: '19:42' },
  { id: 'c_05', tavolo: 5,  importo: 64.50, inviato: '20:08', inPagamentoAltrove: true },
  { id: 'c_08', tavolo: 8,  importo: 12.00, inviato: '20:31' },
  { id: 'c_03', tavolo: 3,  importo: 41.00, inviato: '20:55' },
];

// Storico transazioni (più recente in cima) — tutte Tap to Pay
// stato: 'ok' | 'fail' | 'refund'
// ricevuta: 'sms' | 'email' | null — il solo canale, mai il recapito (D-23)
const TRANSAZIONI = [
  { id: 't_9f21', importo: 14.50, ora: '14:32', data: 'Oggi', stato: 'ok',     brand: 'Visa',       last4: '4242', ricevuta: 'email' },
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

// Finestra di divieto notturna (P-100 · scheda OpenAPI 31/08): fra le 23:55 e
// le 00:00 il canale fiscale non trasmette e accoderebbe lo scontrino al
// giorno nuovo, spostandone la giornata fiscale — quindi l'incasso si blocca
// e riprende da solo a mezzanotte. Copia guardata della definizione che sta
// in gestionale/sala-salda-modal.jsx: bundle diversi, stessa finestra.
// `?notte=1` sull'URL simula le 23:58:30 con l'orologio che corre.
if (!window.byupNotteInfo) {
  // `?notte=1` avvia la notte demo e la àncora ADESSO; le navigazioni interne
  // la perdono dall'URL (la sidebar riscrive ?tab=…), quindi l'ancora vive in
  // sessionStorage e l'orologio finto continua a correre invece di ripartire.
  // Passata la mezzanotte finta, la demo è semplicemente finita.
  let notteT0 = null;
  try {
    if (new URLSearchParams(window.location.search).get('notte') === '1') {
      notteT0 = Date.now();
      sessionStorage.setItem('byup_notte_t0', String(notteT0));
    } else {
      const salvato = sessionStorage.getItem('byup_notte_t0');
      if (salvato) notteT0 = parseInt(salvato, 10);
    }
  } catch (e) {}
  const notteBase = (() => { const d = new Date(); d.setHours(23, 58, 30, 0); return d.getTime(); })();
  const notteOra = () => notteT0 ? new Date(notteBase + (Date.now() - notteT0)) : new Date();
  window.byupNotteInfo = function () {
    const d = notteOra();
    const dentro = d.getHours() === 23 && d.getMinutes() >= 55;
    const mancano = dentro ? 86400 - (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) : 0;
    return { dentro, mancano };
  };
  window.byupNotteConta = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

Object.assign(window, { MERCHANT, PERSONA, RISTORANTI, APPARTENENZE, SESSIONE, DISATTIVA_DEMO, staffAmbienti, staffEntra, staffEsci, staffDisattiva, staffAccessoRevocato, CODA_INCASSO, TRANSAZIONI, INCASSO_OGGI, N_OGGI });

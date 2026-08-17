// ════════════════════════════════════════════════════════════════════════════
// PARAMETRI OPERATIVI · le costanti che più analisi si scambiano
// ════════════════════════════════════════════════════════════════════════════
//
// Stavano copiate in due file (Mercato e Valore) e coincidevano per fortuna,
// non per costruzione. Qui ce n'è una copia sola: se cambia il costo orario di
// sala, cambia in tutte le pagine che lo usano, nello stesso momento.

const PAR = {
  // Sala e servizio
  ORE_SERVIZIO: 6.5,          // ore di sala aperta al giorno (pranzo + cena)
  COSTO_ORA_SALA: 13.20,      // €/h lordo azienda · contratto pubblici esercizi
  GIORNI_MESE: 28,            // giorni di apertura al mese, prudenziale

  // Economia del piatto
  MARGINE_LORDO: 68,          // % · media pesata del food cost di rete (tab Mercato)

  // Quanti ordini finiscono davvero a un tavolo: il resto è asporto, e
  // l'asporto non occupa una sedia.
  QUOTA_SALA: {
    'Ristorante':0.88, 'Trattoria':0.86, 'Osteria':0.85, 'Enoteca':0.80,
    'Bistrot':0.72, 'Pub':0.74, 'Pizzeria':0.46, 'Bar':0.34,
  },
  // Persone per ordine · serve a passare da ordini a coperti
  COMMENSALI: { min: 1.7, span: 1.1 },

  // Tempo di servizio di partenza per mestiere (minuti, ordine → conto chiuso)
  TEMPO_SERVIZIO: {
    'Pizzeria':38, 'Pub':46, 'Bar':30, 'Bistrot':54, 'Enoteca':60,
    'Trattoria':68, 'Osteria':74, 'Ristorante':92,
  },
  // Minuti di sala per coperto di partenza
  MINUTI_SALA: {
    'Ristorante':6.8, 'Osteria':5.4, 'Trattoria':5.1, 'Bistrot':4.6,
    'Enoteca':4.2, 'Pizzeria':3.4, 'Pub':2.9, 'Bar':2.1,
  },

  // La soglia commerciale: sotto, il ritorno non si vede (tab Valore)
  SOGLIA_DIGITALE: 15,

  // ── I costi nostri per locale, usati dal margine di contribuzione ───────
  //
  // Le commissioni Stripe NON stanno qui: sull'abbonamento la commissione è
  // ribaltata al locale, quindi per byup non è un costo e non entra nel
  // margine. Metterla sarebbe contarsi addosso una spesa che paga un altro.
  //
  // ASSISTENZA · questo è il numero più debole della pagina, e va detto: il
  // tempo di lavorazione di un ticket OGGI NON È TRACCIATO. Non esiste un
  // cronometro fra apertura e chiusura al netto delle attese, quindi i minuti
  // qui sotto sono un'ipotesi dichiarata, non una misura. Per trasformarli in
  // un dato serve registrare il tempo che una persona passa davvero su un
  // ticket — è una riga di prodotto, non un calcolo diverso.
  MINUTI_TICKET: 23,          // ipotesi · da sostituire con il tempo tracciato
  COSTO_ORA_SUPPORTO: 22.00,  // €/h lordo azienda di chi risponde
  get COSTO_TICKET() { return (this.MINUTI_TICKET / 60) * this.COSTO_ORA_SUPPORTO; },

  // INFRASTRUTTURA · non è una costante inventata: sono i prezzi unitari di
  // listino dei fornitori, applicati ai driver del singolo locale.
  //   · compute e database seguono i LOCALI ATTIVI (un locale tiene sessioni
  //     aperte anche a sala vuota): Fargate 2,4 vCPU-ora × 0,0445 + RDS 1,85
  //   · la trasmissione fiscale segue i PAGAMENTI che passano da noi: 0,019 a
  //     trasmissione, e se il locale incassa dalla sua cassa non ne facciamo
  // Quello che dipende dagli utenti app — immagini dei menu, mappe, notifiche —
  // non è attribuibile a un locale: resta un costo di piattaforma.
  INFRA_PER_LOCALE: 2.4 * 0.0445 + 1.85,
  COSTO_TRASMISSIONE: 0.019,
};

// ── La lettura del numero ─────────────────────────────────────────────────
// Un numero da solo non dice se è una buona o una cattiva notizia. `parLettura`
// prende delle fasce dichiarate e restituisce quella giusta: è il modo per
// scrivere una volta sola cosa significa un valore, invece di lasciarlo
// interpretare a chi guarda.
//
//   fasce = [{ fino: 5, tono:'DANGER', testo:'…' }, { fino: 15, … }, { tono:'OK', … }]
//
// L'ultima fascia senza `fino` è il caso «tutto il resto».
function parLettura(valore, fasce) {
  for (const f of fasce) {
    if (f.fino === undefined || valore < f.fino) return f;
  }
  return fasce[fasce.length - 1];
}

// Mediana, che serve ovunque e non merita cinque implementazioni.
function parMediana(arr) {
  if (!arr || !arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

window.PAR = PAR;
window.parLettura = parLettura;
window.parMediana = parMediana;

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

  // Costi unitari nostri, usati dal margine di contribuzione
  COSTO_TICKET: 8.40,         // € · costo medio di gestione di un ticket
  COSTO_MILLE_ORDINI: 0.62,   // € · infrastruttura AWS ogni mille ordini
  FEE_STRIPE_FISSA: 0.25,     // € per addebito dell'abbonamento
  FEE_STRIPE_PCT: 1.5,        // % dell'abbonamento
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

// ══════════════════════════════════════════════════════════════════════════
// byup · KDS per tavolo — dal servizio vero alle comande della board.
//
// Fa per la board a TAVOLI quello che `cucina-kds2-da-cucina.jsx` fa per la
// board a piatti: legge i ticket della Cucina (`cucina-data.jsx`) e li
// riordina nella forma che la board sa leggere. Un file solo, che sparira'
// insieme ai mock quando arrivera' l'API.
//
// ── COSA C'E' E COSA MANCA ───────────────────────────────────────────────
// Il ticket porta lo stato per RIGA — todo | doing | done — e sono esattamente
// le tre sezioni della board: in attesa, in preparazione, pronti.
// Non porta pero' i due ISTANTI su cui la board costruisce i cronometri: non
// c'e' un `started_at` di quando lo chef ha messo sul fuoco, ne' un `ready_at`
// di quando ha mollato. Nel modello esistono (`kitchen_ticket_items`), nel
// mock del servizio no.
//
// Da qui in avanti l'avvio lo scrive IL MONITOR, nell'istante in cui si preme
// «Manda tutto»: e' l'unico momento in cui qualcuno sa davvero che quel piatto
// e' partito.
//
// Resta il caso dei piatti che erano GIA' in lavorazione quando il monitor si
// e' acceso — che non e' un caso di laboratorio: un turno comincia sempre a
// servizio iniziato. Per quelli si assume che siano partiti QUANDO SONO
// ARRIVATI, cioe' dall'orario del ticket. E' una stima pessimistica — il tempo
// mostrato e' il piu' lungo dei possibili — ed e' la direzione giusta in cui
// sbagliare: un piatto sembra piu' indietro di quanto sia, mai piu' avanti.
// ══════════════════════════════════════════════════════════════════════════

(function () {
  const oggiAlle = (hhmm) => {
    const [h, m] = String(hhmm || '0:0').split(':').map(Number);
    const d = new Date(); d.setHours(h || 0, m || 0, 0, 0);
    return d.getTime();
  };

  // Un ticket «sala» appartiene al TAVOLO: due ticket dello stesso tavolo per
  // due stazioni diverse sono la stessa comanda, e sulla board sono una card
  // sola. Tutto il resto — asporto, consegna, banco — e' una comanda a se',
  // perche' non c'e' niente a cui aggregarla.
  const chiave = (t) => (t.kind === 'sala' && t.table != null ? 'tav-' + t.table : 'com-' + t.id);

  window.kdsComandeDelServizio = function () {
    const tickets = [].concat(window.CUC_TICKETS_PREP || [], window.CUC_TICKETS_ATTIVI || []);
    const per = {};

    tickets.forEach(tk => {
      const k = chiave(tk);
      if (!per[k]) {
        per[k] = {
          id: k,
          n: tk.table,
          tipo: tk.kind === 'sala' ? null
              : tk.kind === 'delivery' ? 'delivery'
              : tk.kind === 'asporto' ? 'asporto' : 'banco',
          partner: tk.partner || null,
          cliente: tk.customer || null,
          ritiro: tk.pickup ? oggiAlle(tk.pickup) : null,
          // Senza sala e coperti nel servizio, il contesto del tavolo e' il
          // codice dell'ordine: e' quello che si cita quando si parla in sala.
          sala: tk.orderN, cop: null,
          arrivo: oggiAlle(tk.time),
          piatti: [], uscite: [],
        };
      }
      const c = per[k];
      const avvio = oggiAlle(tk.time);
      const inCorso = [], usciti = [];

      tk.items.forEach((it, i) => {
        const id = tk.id + '-' + i;
        c.piatti.push({
          id, nome: it.name, qty: it.qty,
          cat: tk.station || null,
          // La nota del servizio e' la variante del piatto: «senza basilico»,
          // «al sangue». Iniziale maiuscola, come sui ticket della Cucina.
          nota: it.note ? it.note.charAt(0).toUpperCase() + it.note.slice(1) : null,
        });
        if (it.state === 'doing') inCorso.push(id);
        else if (it.state === 'done') usciti.push(id);
      });

      // Tutte le righe che stanno cuocendo insieme fanno UN'uscita, e cosi'
      // quelle gia' uscite: e' la ricostruzione piu' fedele possibile senza i
      // due istanti veri.
      if (inCorso.length) c.uscite.push({ id: tk.id + '-c', ids: inCorso, avvio, pronta: null });
      if (usciti.length)  c.uscite.push({ id: tk.id + '-p', ids: usciti,  avvio, pronta: avvio });
    });

    // In ordine d'arrivo: la card piu' vecchia per prima, che e' l'ordine in
    // cui il servizio e' entrato in cucina.
    return Object.keys(per).map(k => per[k]).sort((a, b) => a.arrivo - b.arrivo);
  };
})();

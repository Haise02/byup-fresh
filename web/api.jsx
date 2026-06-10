/*
  byup — WebApp consumer · Layer di accesso al backend (window.ByupAPI)
  ─────────────────────────────────────────────────────────────────────
  UNICO punto da cui la webapp parla col backend. OGGI è tutto MOCK
  in-memory: nessuna chiamata di rete, le funzioni risolvono subito con
  dati finti e segnano il punto d'innesto con `TODO backend`. Sostituendo
  le implementazioni con vere chiamate HTTP/WebSocket la UI funziona
  identica, senza modifiche ai componenti.

  Contratto completo (cosa la webapp INVIA / RICEVE, forme dati, real-time,
  pagamento escluso): vedi byup-contratto-backend-webapp.md.

  Principi:
   • La divisione del conto è una funzione REAL-TIME anche da webapp.
   • La webapp NON incassa: pay() è volutamente bloccata (cassa o app).
   • Niente GPS/geofence: l'accesso si valida sul gate di sessione lato server.
*/
(function () {
  'use strict';

  // ── Pub/sub per la sessione tavolo real-time ──
  // Mock: nessun evento dal "server". Con il backend reale, subscribe() aprirà
  // un WebSocket/SSE e ogni update (piatti, claim/split altrui, saldo che scende
  // per pagamenti da app/cassa) verrà inoltrato ai callback registrati.
  const subscribers = {}; // sessionId -> Set<callback>
  function emit(sessionId, session) {
    (subscribers[sessionId] || new Set()).forEach(function (cb) { try { cb(session); } catch (e) {} });
  }

  function ok(extra) { return Promise.resolve(Object.assign({ ok: true }, extra || {})); }

  const ByupAPI = {
    // ════════ INBOUND — cosa la webapp RICEVE dal backend ════════

    // Menu del locale (categorie + piatti). TODO backend: GET /venues/:id/menu
    getMenu: function (venueId) { return Promise.resolve(null); },

    // Snapshot della sessione tavolo. TODO backend: GET /sessions/:id
    getSession: function (sessionId) { return Promise.resolve(null); },

    // Sottoscrizione real-time agli aggiornamenti di sessione.
    // TODO backend: WebSocket/SSE. cb riceve la sessione aggiornata.
    // Ritorna una funzione di unsubscribe.
    subscribe: function (sessionId, cb) {
      if (!sessionId || typeof cb !== 'function') return function () {};
      (subscribers[sessionId] = subscribers[sessionId] || new Set()).add(cb);
      return function () { if (subscribers[sessionId]) subscribers[sessionId].delete(cb); };
    },

    // ════════ OUTBOUND — cosa la webapp INVIA al backend ════════

    // Unione al tavolo via QR / link / codice. NIENTE GPS.
    // TODO backend: POST /sessions/join { tableId|code|qrPayload, joinMethod }
    // → il server verifica che esista una sessione tavolo APERTA e valida; se no,
    //   errore. Ritorna { session, guest } (il guest webapp ha kind 'isWebApp').
    joinTable: function (payload) { return ok(); },

    // Invio dei piatti del carrello alla sessione (ordine al tavolo → cucina).
    // TODO backend: POST /sessions/:id/items { ownerId, lines[] }
    // lines: [{ dishId, qty, variants{}, extras{ extraId:qty }, removed{ ingr:true } }]
    addItems: function (payload) { return ok(); },

    // DIVISIONE real-time di una riga del conto.
    // TODO backend: PATCH /sessions/:id/items/:lineId/split { kind, people[] }
    //  kind: 'me' | 'diviso' | 'tavolo' ; people: [guestId] (solo per 'diviso').
    //  Il server ricalcola le quote e fa broadcast agli altri partecipanti.
    updateSplit: function (payload) { return ok(); },

    // Un piatto "al tavolo" (ownerId 'table') viene preso in carico da un ospite.
    // TODO backend: POST /sessions/:id/items/:lineId/claim { guestId }
    claimItem: function (payload) { return ok(); },

    // Un ospite si accolla la quota di un altro ("offri").
    // TODO backend: POST /sessions/:id/items/:lineId/offer { toGuestId }
    offerItem: function (payload) { return ok(); },

    // Gestione commensali (per la divisione).
    // TODO backend: POST/DELETE /sessions/:id/guests
    addGuest: function (payload) { return ok(); },
    removeGuest: function (payload) { return ok(); },

    // Numero di coperti.
    // TODO backend: PATCH /sessions/:id/covers { covers }
    setCovers: function (payload) { return ok(); },

    // Codice di recupero ordine (5–6 cifre) per agganciare l'ordine anonimo
    // all'account in app. TODO backend: POST /sessions/:id/order-code
    // (vedi byup-spec-tecnica-recupero-ordine.md).
    requestOrderCode: function (payload) {
      return Promise.resolve({ code: String(Math.floor(100000 + Math.random() * 900000)) });
    },

    // ════════ PAGAMENTO — NON disponibile da webapp ════════
    // La webapp non incassa: il pagamento avviene in cassa (App Staff) o dall'app.
    // Esposta solo per rendere esplicito il confine: chiamarla è un errore.
    pay: function () { return Promise.reject(new Error('payment-app-only')); },

    // uso interno (mock): inietta un update di sessione verso i subscriber
    _emit: emit,
  };

  window.ByupAPI = ByupAPI;
})();

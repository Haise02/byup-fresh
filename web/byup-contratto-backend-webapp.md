# byup — Contratto Backend ↔ WebApp consumer

> **Scopo.** Elenca **tutti i comandi** che la webapp consumer si aspetta dal
> backend e **tutto ciò che la webapp invia**. È la specifica d'integrazione: oggi
> nel codice è tutto **mock** (`window.ByupAPI` in `api.jsx`), domani le stesse
> funzioni diventano chiamate HTTP/WebSocket **senza toccare la UI**.
>
> Vedi anche: `Contesto-WebApp.md` (§6 contratto dati), `byup-punto4-pagamenti-divisione.md`
> (divisione e saldo), `byup-spec-tecnica-recupero-ordine.md` (codice ordine),
> `byup-punto3-difesa-attacchi.md` (difese lato server — **decisione aperta**).

---

## 0. Principi che vincolano il contratto

1. **La webapp serve a ordinare al tavolo e a dividere il conto, in real-time.**
2. **La webapp NON incassa.** Nessun endpoint di pagamento è chiamabile dalla
   webapp: `ByupAPI.pay()` esiste solo per marcare il confine e **rifiuta sempre**.
   Il pagamento avviene in cassa (App Staff) o dall'app nativa.
3. **Niente GPS/geofence.** L'accesso non si valida sulla posizione ma sul
   **gate di sessione** lato server (vedi §3.1). Nessuna telemetria di posizione.
4. **Il tavolo è un conto unico con un saldo** condiviso fra tutti i canali
   (app, webapp, cassa). Ogni pagamento decrementa lo **stesso** saldo; il tavolo
   si libera solo a saldo zero. La webapp **legge** il saldo (real-time) ma non lo paga.
5. **`window.ByupAPI` è l'unico punto d'integrazione.** Nessun componente UI fa
   rete direttamente.

---

## 1. Modello dati real-time (forme attese)

```
Session = {
  id, venueId, table,                 // identità sessione/tavolo
  state,                              // Occupato | Libero | Prenotato | Da pulire
  startedAt, covers, currency,
  guests: [ Guest ],
  items:  [ Item ],
  balance: { total, paid, remaining } // saldo del conto unico (real-time)
}

Guest = { id, name, initial, kind }   // kind: isMe | isApp | isWebApp | isGuest

Item  = {                             // riga del conto
  lineId, dishId, name, qty, price,
  ownerId,                            // guestId | 'table' (piatto "al tavolo")
  split: { kind, people[] },          // kind: 'me'|'diviso'|'tavolo'; people: [guestId]
  claimedBy,                          // guestId che ha preso in carico un item 'table'
  paidBy: [ { guestId, amount } ]     // quote già pagate (da app/cassa) → real-time
}
```

> La chiusura della sessione (passaggio a "Da pulire") la decide Byup Fresh /
> webapp cameriere + backstop orario/inattività. **La webapp la subisce**, non la chiude.

---

## 2. INBOUND — cosa la webapp RICEVE (backend → webapp)

| Comando `ByupAPI` | Endpoint atteso | Ritorna | Note |
|---|---|---|---|
| `getMenu(venueId)` | `GET /venues/:id/menu` | `{ categories[], dishes[] }` | Forma piatti in §6.1 di `Contesto-WebApp.md`. |
| `getSession(sessionId)` | `GET /sessions/:id` | `Session` | Snapshot iniziale. |
| `subscribe(sessionId, cb)` | **WebSocket / SSE** | `() => void` (unsubscribe) | `cb(session)` ad **ogni** aggiornamento: piatti/claim/divisioni **altrui**, e **saldo che scende** per pagamenti da app/cassa. È il cuore del real-time. |

---

## 3. OUTBOUND — cosa la webapp INVIA (webapp → backend)

### 3.1 Accesso
| Comando | Endpoint | Payload | Note |
|---|---|---|---|
| `joinTable({ tableId\|code\|qrPayload, joinMethod })` | `POST /sessions/join` | `joinMethod: 'qr'\|'link'\|'code'` | **Niente GPS.** Il server verifica che esista una **sessione tavolo aperta e valida** in quel momento; se no → errore (il QR statico non autorizza, è solo un puntatore). Ritorna `{ session, guest }` (guest webapp = `kind:'isWebApp'`). |

### 3.2 Ordinazione
| Comando | Endpoint | Payload |
|---|---|---|
| `addItems({ sessionId, ownerId, lines })` | `POST /sessions/:id/items` | `lines: [{ dishId, qty, variants{}, extras{ extraId:qty }, removed{ ingr:true } }]` |

### 3.3 Divisione del conto (REAL-TIME) — pagamento escluso
| Comando | Endpoint | Payload | Effetto |
|---|---|---|---|
| `updateSplit({ sessionId, lineId, split })` | `PATCH /sessions/:id/items/:lineId/split` | `split:{ kind:'me'\|'diviso'\|'tavolo', people:[guestId] }` | Il server ricalcola le quote e fa **broadcast** agli altri partecipanti. |
| `claimItem({ sessionId, lineId, guestId })` | `POST .../items/:lineId/claim` | — | Un piatto `ownerId:'table'` viene preso in carico da un ospite. |
| `offerItem({ sessionId, lineId, toGuestId })` | `POST .../items/:lineId/offer` | — | Un ospite si accolla la quota di un altro ("offri"). |
| `addGuest({ sessionId, guest })` | `POST .../guests` | `guest:{ name, kind }` | |
| `removeGuest({ sessionId, guestId })` | `DELETE .../guests/:guestId` | — | |
| `setCovers({ sessionId, covers })` | `PATCH .../covers` | `{ covers }` | |

> **Quote frazionarie**: dividere un piatto genera arrotondamenti (20€/3 = 6,67…).
> La somma delle quote deve tornare **esatta** al centesimo: la gestione dello
> scarto è **lato server** (es. l'ultimo pagante copre la differenza). La webapp
> mostra solo le quote che il server le comunica.

### 3.4 Recupero ordine (webapp → app)
| Comando | Endpoint | Ritorna | Note |
|---|---|---|---|
| `requestOrderCode({ sessionId })` | `POST /sessions/:id/order-code` | `{ code }` | Codice 5–6 cifre, fonte di verità per agganciare l'ordine anonimo all'account in app. Dettagli (Install Referrer Android, codice iOS, banner) in `byup-spec-tecnica-recupero-ordine.md`. |

### 3.5 Pagamento — **NON disponibile**
| Comando | Comportamento |
|---|---|
| `pay(...)` | **Rifiuta sempre** (`payment-app-only`). La webapp non incassa: cassa o app. |

---

## 4. Mappa UI → comando (dove il codice chiama cosa, oggi)

| Azione utente nella webapp | Componente (`menu.jsx`) | Comando `ByupAPI` |
|---|---|---|
| Invia i piatti del carrello | `MenuScreen.handleSubmit` | `addItems` |
| Imposta la divisione di una riga | `SplitScreen.save` | `updateSplit` |
| (montaggio home/menu con ordine) | `Root` useEffect | `subscribe` (real-time) |
| "Paga ora" / "Scarica l'app" | `OrderRecoverySheet` | recupero via codice (`requestOrderCode` lato server) — **non** `pay` |
| Aggiungi/rimuovi commensale | `GuestsSheet` (helper) | `addGuest` / `removeGuest` *(da agganciare quando il backend è pronto)* |

> Già agganciati al mock: `addItems`, `updateSplit`, `subscribe`. Gli altri comandi
> sono **predisposti** in `ByupAPI` (firma + endpoint atteso) e si agganciano alla
> UI quando il backend esiste, senza riprogettare i componenti.

---

## 5. Stato attuale (mock) e cosa manca al backend

- ✅ **Predisposto in `api.jsx`**: tutte le funzioni sopra, con `TODO backend` sul
  punto d'innesto. Real-time via `subscribe` (pub/sub locale, oggi non emette).
- ⏳ **Manca (backend/app)**: persistenza sessione, broadcast real-time vero,
  ricalcolo quote/saldo, lock di pagamento (timeout, granularità di riga,
  centesimi — `punto4`), generazione codice ordine + Install Referrer + banner
  (`spec recupero`), e le difese anti-abuso lato server (`punto3`, **decisione aperta**).

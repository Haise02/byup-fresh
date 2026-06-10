# byup — Contratto dati (app consumer ⇄ ecosistema)

> 📍 **byup-Docs** › Contratto dati · [Indice](README.md)
>
> **Collegamenti**: contesto di prodotto → [Contesto-App.md](Contesto-App.md) ·
> dettagli tematici → [Pagamenti-Divisione.md](Pagamenti-Divisione.md),
> [Recupero-Ordine.md](Recupero-Ordine.md),
> [Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md) · prototipo →
> [Architettura-Prototipo.md](Architettura-Prototipo.md).

> **Scopo**: elencare, **rispetto ai requisiti funzionali noti** (vedi
> [Contesto-App.md](Contesto-App.md) §D e §G), **quali dati l'app deve RICEVERE dal
> backend** per funzionare e **quali dati l'app deve INVIARE** al gestionale
> **Byup Fresh** e alle altre superfici dell'ecosistema.
>
> I nomi dei campi qui sotto derivano dalle strutture realmente usate nel
> prototipo (dati demo cablati): sono la **forma** attesa, non un'API definitiva.
> `🧮 = calcolato client`, `🟠 = dipende da decisione aperta` (vedi §G.9).
>
> Convenzioni: **identità account = numero di telefono** (OTP/biometria);
> l'ecosistema è App consumer · Webapp consumer · **Byup Fresh** (gestionale) ·
> **App Staff** · **Webapp cameriere** · **Byup Spot** (backoffice).

---

## Parte 1 — Dati che l'app RICEVE dal backend (inbound)

### 1.1 Identità & sessione utente (req: onboarding/auth)
- `user`: `{ id, phone, name, cognome, genere, nascita, email, lang, faceIdEnabled, createdAt }`
- `session`: `{ token, refreshToken, expiresAt }`
- `permissions`: stato `{ notifiche, posizione }`
- `ordersCount` — n° ordini completati (serve al **gate "Per te" ≥3**, §D)

### 1.2 Profilo (req: profilo)
- `preferences`: `{ allergens: { glutine, lattosio, noci, uova, crostacei, pesce, soia, sedano }, diets: { veg, vegan, gf } }` (booleani)
- `paymentMethods[]`: `{ id, type (visa|mastercard|applepay|…), brand/label, last4, expiry, preferred }` — **token Stripe (`pm_…`), mai il PAN**
- `favorites[]`: `{ venueId, name, cuisine, zone, photo }`
- `loyaltyPoints` — saldo punti (Posta cita "hai guadagnato 50 punti")

### 1.3 Discovery & disponibilità locali (req: discovery, solo app)
- `discovery.eligible` 🧮/server: esito del **gate densità** → servono i conteggi
  `{ nearVenueCount, wideVenueCount }` = locali attivi entro **due raggi
  concentrici** dal GPS (~6 km / ~45 km, *da tarare*), con soglie **125 / 150**
  in OR (§D). Con **isteresi** (spegni sotto ~110) ed esito **cachato**. Se non
  eleggibile → schermo `home-empty`.
- `venues[]` (card discovery/mappa): `{ id, name, cuisine, cat, price, zone, lat, lng, hours, open, photo, rating, reviewsCount, color (pin) }`. `distance` 🧮 dal GPS.
- Solo locali con **onboarding vetrina completato** su Byup Fresh.

### 1.4 Vetrina locale (req: vetrina + stili §3.1)
- `venue` (scheda completa): `{ id, name, cuisine, price, address, zone, lat, lng, hours, open, rating, reviewsCount, photos[], bio, styleId (a|b|c|original), bookingEnabled }`
- contenuti vetrina: `signature { name, desc, price, photo }`, `chef { name, title, bio, photo }`, `awards[]`, `events[]`, `topReview { name, initial, when, rating, text, dish }`, `reviews[] { name, initial, rating, when, text }`, `slots[]` (orari prenotazione)
- **`styleId`** è scelto dal ristoratore nel gestionale → decide lo stile ([Architettura-Prototipo §3.1](Architettura-Prototipo.md)).

### 1.5 Menu (req: menu & ordine)
- `categories[]` (ordine di rendering) — es. Antipasti, Primi, Secondi, Dolci, Bevande
- `dishes[]`: `{ id, name, price, category, kind, photo, desc, longDesc, prep, allergens[], bestSeller, tone, ingredients[], extras[ {id,name,price} ], variants[ {id,label,options[]} ], cal, macros { carbo, grassi, prot, fibre }, available }`
- **`bestSeller`** alimenta **★ TOP**; in produzione meglio da **statistiche d'ordine aggregate** per locale.
- `recommendedForYou[]` (req: **✨ Per te**): lista `dishId` personalizzata lato backend (con il gate ≥3 ordini; sotto soglia si usano le preferenze dichiarate, §D).

### 1.6 Sessione tavolo — real-time (req: al tavolo §G.2, divisione conto §G.6, ciclo di vita §G.5)
- `tableSession`: `{ id, venueId, table, state (Occupato|Libero|Prenotato|Da pulire), startedAt, covers, balance, currency }`
  - **`balance`** = **saldo residuo** del tavolo, **fonte di verità unica** scritta in real-time da **app + cassa** (§G.6). Il tavolo si libera **solo quando `balance` è zero**.
- `guests[]`: `{ id, name, initial, kind (isMe|isApp|isWebApp|isGuest) }` — l'avatar di chi si è unito
- `items[]`: `{ lineId, dishId, name, qty, price, ownerId ('me'|guestId|'table'), splitWith[], claimedBy }`
  - `splitWith[]` = id dei commensali con cui la riga è divisa (quota = `prezzo·qty / (splitWith.length + 1)`); l'app mostra "diviso con {nomi}".
  - `claimedBy` = id di chi si è preso un item del tavolo. *(I piatti `'table'` nel prototipo sono righe singole `qty:1`; il vecchio flag `suggested:'share'` è stato rimosso.)*
- `paidLineIds`: `{ lineId: payerId }` — righe **saldate per intero**
- `settled` 🧮 (prototipo): `{ lineId: importoPagato }` — saldo **a quote parziali** per riga. Il residuo del tavolo è `Σ (prezzo·qty − importoPagato)` (`tableRemaining`); una riga è chiusa quando l'importo copre il totale. In produzione questa granularità è sintetizzata dal **`balance`** server (fonte unica); qui è simulata client.
- `locks`: `{ lineId | quotaId: { byPayerId, expiresAt } }` — righe/quote **congelate** dal lock all'avvio pagamento (§G.6). Granularità **a livello di riga/quota, non di tavolo** (più pagamenti paralleli). **Auto-rilascio** a `expiresAt`: se il pagante abbandona, la riga torna disponibile. *(Nel prototipo: `lockedLineIds: { lineId: payerId }`, senza scadenza.)*
- `coperto`: importo per coperto (config locale; demo `COVER=2€`)
- **Chiusura**: primaria quando il tavolo passa ad almeno **"Da pulire"** (§G.5); in più un **backstop** auto-chiude la **sessione consumer** a orario di chiusura locale / inattività (non tocca lo stato del tavolo). Stato e transizioni arrivano da **Byup Fresh / webapp cameriere**. Il **saldo zero** è il presupposto perché il tavolo si liberi.

### 1.7 Asporto (req: §G.4)
- `pickupSlots[]` — slot di ritiro **disponibili** (logica del backend Byup Fresh)
- `takeawayOrder`: `{ id, venueId, items[], total, pickupTime, status (preparing|ready), pickupCode }`
  - **`pickupCode`** = codice (demo 4 cifre) da dire a voce in cassa al ritiro
  - **`status → ready`** è ciò che l'app mostra ("ordine pronto")

### 1.8 Prenotazione (req: §G.3) — solo se `venue.bookingEnabled`
- `availability`: `{ dates[], slotsByDate{}, maxPeople }` (nuove disponibilità per la modifica)
- `booking`: `{ id, venueId, venueName, date, time, people, name, phone, note, assignedTable, status (active|cancelled) }`

### 1.9 Posta (req: Posta, da **Byup Spot**)
- `news[]`: `{ id, title, preview, ago, kind (welcome|points|feature|review) }`
- `promo[]`: `{ id, venueId, venueName, preview, ago, discount }`
- È un canale **editoriale/promozionale di byup**, non del locale.

### 1.10 Notifiche (req: notifiche/push)
- `notifications[]` (feed) + ack registrazione **push token**; eventi legati a
  **stato ordine** (asporto pronto), **Posta** e **tavolo**.

### 1.11 Config per scontrino/fiscale
- per locale: `{ piva, valuta, ivaRate }` (lo scontrino mostra subtotale, IVA, P.IVA)

---

## Parte 2 — Dati che l'app INVIA all'ecosistema (outbound)

### 2.1 → Byup Fresh / backend ordini (al tavolo)
- **Join al tavolo** (§G.2): `{ tableId | code | qrPayload, gps {lat,lng}, joinMethod (qr|link|code 🟠) }` → **dall'app** il backend valida il **geofence** (se incoerente, errore "non nei pressi"); la **webapp** non invia GPS e non è gated dal geofence — si difende col pagamento contestuale + gate di sessione (§G.8). In **entrambi** i canali vale il **gate di sessione** (no ordini senza sessione tavolo aperta).
- **Commensali (solo host)**: `{ tableSessionId, covers }` — chiesto solo a chi apre.
- **Aggiunta piatti**: `{ tableSessionId, ownerId, lines[ { dishId, qty, variants{}, extras{ extraId:qty }, removed{ ingrediente:true } } ] }` (la riga carrello del prototipo è `{ lineId, dishId, qty, variants, extras, removed }`).
- **Acquisizione lock** (§G.6, prima di pagare): `{ tableSessionId, lineIds[] | quotas[ { lineId, fraction } ] }` → il server **congela** le righe/quote selezionate e risponde con `expiresAt`. Rilascio **esplicito** a pagamento concluso o annullato, **auto-rilascio** a timeout se l'app abbandona.
- **Pagamento** (Architettura-Prototipo §9, [Pagamenti-Divisione.md](Pagamenti-Divisione.md)): `{ tableSessionId, mode (mine|all|selection 🟠), paidLineIds[], quotas[ { lineId, fraction, forPayerId? } ], coperto, tip { type (pct|round), pct?, amount }, total, method, channel:'app' }`
  - **`mode`**: `mine` (i miei) · `all` (tutto il tavolo) · `selection` 🟠 (righe/quote scelte). In `PaymentScreen` esistono `mine`/`all`; il pagamento **per selezione di righe** è di fatto già realizzato nella **`BalanceScreen`** (selezione multipla → per intero / diviso / per il tavolo), quindi `selection` è più un'etichetta che un buco di UX. `quotas` copre il **piatto diviso tra più commensali** e l'**offrire** un piatto (`forPayerId` = chi riceve la quota). Nota UX: in `PaymentScreen` la **divisione** è offerta **solo sui piatti del tavolo** (popup `tableSplits`); i piatti **offerti** ad altri si pagano per intero; nella `BalanceScreen` invece si può dividere qualsiasi riga residua.
  - Il pagamento **decrementa il `balance`** del tavolo (fonte unica, §G.6). Il server risponde col **saldo residuo** e con le **righe ancora scoperte** → l'app mostra la schermata post-pagamento parziale (utente resta nel flusso, §G.6). **La schermata di residuo è già nel prototipo** = `BalanceScreen` (route `balance`): "Manca al tavolo €X", piatti scoperti (tavolo + altri commensali, **lockati in fondo**, "diviso con" se condivisi), **selezione multipla** + secondo pagamento (per intero / diviso / per il tavolo) → a saldo zero va a **Successo**. Il modello a quote parziali è simulato con `settled` (vedi §1.6). Ciò che manca è solo il **backend**: il `balance` come **fonte unica condivisa app+cassa real-time** (qui locale) e il **lock** con `expiresAt` (qui `lockedLineIds` senza scadenza). Tavolo libero **solo a `balance` zero**.
  - **Scarto centesimi** (quote frazionarie, es. 20€/3): gestito server-side perché il saldo torni esatto a zero (es. l'ultimo pagante copre la differenza).
  - **`channel:'app'`** vale **0,5 transazioni** (vs 1,0 cassa, §C); il peso segue **dove si paga**, quindi un **ordine nato in webapp ma recuperato e pagato in app** (§G.7) conta **0,5**.

### 2.2 → Byup Fresh (asporto, §G.4)
- **App-only**: l'asporto da **webapp non esiste** (scan QR menu asporto → **redirect al download dell'app**, §G.4). Quanto sotto vale solo per l'app.
- **Ordine + pagamento contestuale**: `{ venueId, items[], total, pickupTime, payment{...}, channel:'app' }` → siccome pagato in app, va **dritto in cucina**.
- **Ritiro**: il `pickupCode` viene **detto in cassa** (lo inserisce il titolare nel gestionale per chiudere) — l'app non lo "consuma" da sola.

### 2.3 → Byup Fresh (prenotazione, §G.3)
- `create`: `{ venueId, date, time, people, name, phone, note }`
- `modify`: `{ bookingId, date?, time?, people?, … }` (verso le nuove disponibilità)
- `cancel`: `{ bookingId }`

### 2.4 → Backend recensioni (alimenta ★ TOP e rating vetrina)
- `{ venueId, orderId, rating (1–5), aspects[] (cibo/servizio/…), comment }`

### 2.5 → Team byup / Byup Spot (segnalazioni & feedback)
- **Segnala questo locale**: `{ venueId, reason, details }` (anonimo per il locale)
- **Segnala un problema** (profilo): `{ rating, description }` → **Byup Spot**

### 2.6 → Backend profilo (scritture)
- `preferences` allergeni/diete; `anagrafica` (nome, cognome, genere, nascita); `email`/`password` (gestione account); `lingua`; **preferiti** add/remove `{ venueId }`; **metodi di pagamento** (token dal gateway, set preferita, rimozione); **elimina account** (cancellazione irreversibile, GDPR).

### 2.7 → Payment gateway = **Stripe** (`flutter_stripe`)
- **PaymentSheet** per il pagamento (carte, **Apple Pay**, **Google Pay**, Klarna…),
  con **SCA/3D Secure** gestito da Stripe (obbligatorio UE/Italia).
- Aggiunta carta → **tokenizzazione** (`PaymentMethod` `pm_…`); il backend salva
  **solo il token** + `last4`/`expiry`, **mai il PAN**.
- Flusso tipico: backend crea il **PaymentIntent** (importo + valuta) → l'app lo
  conferma con la PaymentSheet → webhook Stripe conferma l'esito al backend, che
  registra l'ordine come pagato **da app** (`channel:'app'`, peso 0,5 — §C).

### 2.8 → Recupero ordine webapp → app (§G.7)
- L'ordine webapp nasce **`orfano`** lato server `{ orderId, locale_id, tavolo_id, createdAt, status:'orfano' }` con un **codice ordine** breve (5–6 cifre), univoco e a vita limitata → mostrato sulla schermata finale webapp (fonte di verità persistente).
- **Android (auto)**: il link allo store porta `referrer=byup_order_id%3D<ID|token>` (URL-encoded, payload compatto); al primo avvio l'app legge l'Install Referrer (lib `com.android.installreferrer`, dato valido **90 giorni**, lettura **una sola volta**) → `POST recover { orderId|token }` e aggancio all'account **già durante l'onboarding** → **dopo i popup iniziali l'ordine è già disponibile**, nessun banner.
- **iOS / fallback**: l'app chiede il **codice manuale** (banner → popup) → `POST recover { code }`.
- **Risposta `recover`**: ok → `{ order }` (l'app va a Home + ordine); ko → `{ error: 'invalid' | 'expired' | 'already_recovered' | 'rate_limited' }` → l'app mostra la **riga rossa** pertinente nel popup (*"Codice riscatto ordine errato"* / scaduto / già recuperato — vedi [Recupero-Ordine.md §3.bis](Recupero-Ordine.md)).
- **Rate limit sui tentativi di riscatto** (per device/account/IP): un codice di 5–6 cifre è forzabile → tetto tentativi + cooldown. Vedi [Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md). *(Soglia/durata da definire.)*
- **Identità account = telefono**: l'aggancio dell'ordine resta legato all'account (login OTP/biometria). Il **codice/referrer** è il meccanismo di matching dell'ordine orfano; il telefono serve da identità e da notifica (SMS "asporto pronto, codice X").
- Scadenza recupero legata allo **stato del tavolo** (tetto ~2h dalla creazione ordine). Codice perso → **pagamento in cassa** (nessun recupero per contesto, §G.7).

### 2.9 Telemetria di posizione (requisito hard **solo app**, §G.2/§G.8)
- `gps {lat,lng}` inviato dall'**app** per: **gate densità discovery** e **geofence** di accesso al tavolo. Senza posizione l'app non funziona correttamente.
- **Non vale per la webapp**: il canale anonimo **non** usa il GPS come difesa (falsificabile, §G.8). La webapp si protegge col **pagamento contestuale** + **gate di sessione** + rate limiting. Il geofence non è comunque l'anti-abuso principale neanche per l'app.

---

## Parte 3 — Cosa NON è responsabilità dell'app (per chiarezza di confine)
- **Conteggio transazioni / fatturazione abbonamento** → logica di **Byup Fresh** (l'app segnala solo `channel:'app'`, §C).
- **Stato del tavolo** (Occupato/Libero/Prenotato/Da pulire) e sua **chiusura** → gestiti da **Byup Fresh** + **webapp cameriere**; il **pagamento in cassa** (che porta a "Da pulire") passa da **App Staff** (§G.5).
- **Disponibilità slot** (asporto e prenotazione) → backend Byup Fresh.
- **Insoluti** a tavolo chiuso → sezione dedicata in **Byup Fresh**, riconciliati dal **titolare**; l'app fa solo l'**handoff** delle righe alla chiusura (§G.5).

> Questo file è il **contratto dati**; il *perché* dei flussi sta in
> `Contesto-App.md` §G, le decisioni di prodotto in §C/§E. Tenere allineati.

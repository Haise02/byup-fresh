# byup — Pagamenti dalla web app/app e divisione del conto

> 📍 **byup-Docs** › Pagamenti & divisione del conto · [Indice](README.md)
>
> **Stato: DECISO.** Era il nodo identificato come **il più grande del progetto**.
>
> **Collegamenti**
> - Sintesi nel contesto di prodotto → [Contesto-App.md §G.6](Contesto-App.md)
> - Ciclo di vita / chiusura sessione tavolo → [Contesto-App.md §G.5](Contesto-App.md)
> - Forme dati (saldo, lock, pagamento) → [Contratto-Dati.md §1.6 / §2.1](Contratto-Dati.md)
> - Modello prototipo (`activeOrder`, `splitWith`, `paidLineIds`) → [Architettura-Prototipo.md §9](Architettura-Prototipo.md)

---

## Il problema

Chi ordina dal cameriere fa associare l'ordine all'entità generica **"Al tavolo"**.
Se questa non viene divisa per commensale, due cose vanno storte:

- Chi paga in cassa può ritrovarsi piatti/bevande non divisi equamente, e su
  gruppi numerosi un conto enorme.
- Chi paga dall'app **si illude di aver già saldato il tavolo**, quando in realtà
  finché il tavolo non è chiuso nessuno è liberato.

## Il prerequisito tecnico (confermato presente)

- **Cassa e app scrivono sullo stesso saldo in tempo reale.** Esiste una sola
  fonte di verità del saldo del tavolo, letta e scritta da entrambi i canali.
  → L'illusione del doppio pagamento è strutturalmente impossibile: non ci sono
  due verità da riconciliare, ne esiste una sola.
- **Lock all'avvio del pagamento**: quando una serie di piatti sta per andare in
  pagamento, si attiva un lock che li congela. → Risolve la race condition (due
  persone che pagano gli stessi piatti nello stesso istante da canali diversi).

## Il principio cardine

**Il tavolo è un conto unico con un saldo. Ogni pagamento — da app o da cassa —
decrementa lo stesso saldo in tempo reale.**

Chi paga dall'app non "salda il tavolo": salda **una quota** del saldo. L'app non
dice "hai pagato il tavolo", dice in sostanza "hai pagato la tua parte, restano X€
al tavolo".

**Il tavolo si libera SOLO quando il saldo residuo è zero.** Finché c'è anche un
solo piatto non coperto, il tavolo resta aperto.

## Le modalità di divisione (decise)

Divisione flessibile, tutte supportate dal lock real-time:

- **Pagamento per singolo piatto/riga** — paghi esattamente ciò che selezioni.
- **Divisione di un singolo piatto tra più commensali** — es. un piatto da 20€
  diviso in 3.
- **Offrire un piatto** — un commensale si accolla la quota di un altro.
- **Pagare tutto** — saldo completo del tavolo.

## L'esperienza dopo il pagamento parziale (decisa)

Dopo aver pagato la propria parte, l'utente **non esce dal flusso**: vede una
schermata con

- il **saldo rimasto** al tavolo,
- **quali piatti** sono ancora scoperti,

e può **selezionare quelli rimasti e pagarli** (per sé, per altri, o saldando
tutto). → Nessuna illusione di aver liberato il tavolo; chi vuole può chiudere il
resto.

## Note tecniche essenziali sul lock

1. **Timeout di auto-rilascio**: se chi sta pagando abbandona (telefono morto, app
   chiusa), il lock si rilascia da solo dopo un tempo ragionevole e restituisce i
   piatti al saldo disponibile. Senza timeout, i piatti restano congelati e
   nessuno chiude il tavolo.
2. **Granularità a livello di riga/quota, non di tavolo**: si bloccano solo le
   righe in pagamento, così più persone pagano porzioni diverse contemporaneamente
   senza bloccarsi a vicenda.
3. **Gestione delle quote frazionarie**: dividere un piatto tra più commensali
   genera importi con arrotondamento (20€ / 3 = 6,67€...). Va gestita la differenza
   di centesimi (es. l'ultimo pagante copre lo scarto) perché il saldo torni
   esattamente a zero.

## Scelta di scope (orientamento MVP)

Il flusso del cameriere così com'è butta gli ordini sull'entità "Al tavolo" senza
assegnare per commensale. La divisione per piatto richiede che l'utente, dall'app,
selezioni le righe dal conto del tavolo. Su gruppi numerosi con piatti mescolati
questo può essere confuso — da testare nell'esperienza reale. L'**assegnazione dei
piatti al singolo commensale già in fase di ordine** (lato cameriere) resta
un'eventuale evoluzione futura, non richiesta per far funzionare la divisione lato
app.

---

## Come è realizzato nel prototipo

> Forme dati e schermate → [Architettura-Prototipo.md §9](Architettura-Prototipo.md).
> Il saldo unico è simulato con un modello a **importi parziali** per riga
> (`order.settled`), non solo "pagato sì/no".

**Saldo a quote.** Ogni riga ha un residuo `prezzo·qty − pagato`. Pagare una quota
(piatto diviso, oppure offerto in parte) **decrementa il residuo della riga**, non
la chiude: la riga resta scoperta per la parte altrui. Il tavolo è libero solo
quando la somma dei residui è 0.

**Due momenti di pagamento.**
1. **`PaymentScreen`** (primo pagamento): paghi i tuoi piatti + le tue quote +
   eventuali piatti del tavolo aggiunti col "+" + piatti altrui che **offri**.
   - Divisione disponibile **solo sui piatti presi dal tavolo** (popup "Dividi":
     per te / parti uguali tra tutti / con alcuni commensali). I piatti offerti
     agli altri si pagano per intero.
   - "Paga ora" → caricamento ~5s → se il saldo del tavolo è 0 → **Successo**,
     altrimenti → **schermata Saldo**.
2. **`BalanceScreen`** (saldo del tavolo): mostra **quanto manca** e i **piatti
   ancora scoperti** (esclusi i tuoi, già saldati), col proprietario o "Al tavolo",
   ed eventuale "diviso con". Selezioni le righe e fai un **secondo pagamento**
   (per intero / diviso con qualcuno / per il numero di commensali) → caricamento
   → torna al saldo aggiornato. Quando il saldo arriva a **0 → Successo**.

**Lock real-time** (`lockedLineIds`): le righe che un altro sta pagando in quel
momento sono **congelate** — non offribili in `PaymentScreen`, non selezionabili e
**in fondo** nell'elenco della `BalanceScreen` ("{nome} sta pagando…"). Quando
chiudi tutto ciò su cui puoi agire, i lock si considerano risolti in parallelo e il
tavolo va a zero. → Coerente col principio dell'**impossibilità del doppio
pagamento**: un solo saldo, decrementato da entrambi i canali.

---

## Punti aperti (da affrontare)

> Stato al 2026-06-03. Nessuno di questi rompe il flusso attuale.

**Prototipo — TODO**
1. **"Successo" mostra l'ultima tranche, non il totale pagato.** `SuccessScreen`
   legge `state.payTotal`, che dopo i pagamenti dalla `BalanceScreen` vale solo
   l'ultimo importo. Fix: accumulare il totale pagato dal tavolo. *(Cosmetico.)*
2. **Header fisso ~115px** in `PaymentScreen`/`BalanceScreen`: valutare il
   **collasso dello strip avatar** durante lo scroll (tenere solo back + titolo).

**Decisioni di prodotto da confermare**
3. **"Per il tavolo" divide per TUTTI i commensali** (`tableCount =
   order.guests.length`), non solo i loggati. Da confermare se la regola di
   business è "solo chi ha l'app paga la sua quota".
4. **Assunzione lock → saldo zero**: nella `BalanceScreen`, saldando tutto ciò su
   cui si può agire, i piatti lockati si considerano chiusi in parallelo e si va a
   Successo. Semplificazione del prototipo; nel reale il tavolo si libera solo a
   saldo davvero zero (esito effettivo dei pagamenti paralleli).

**Delta verso produzione (Flutter/backend) — già descritti sopra / in
[Contratto-Dati.md](Contratto-Dati.md)**
5. Backend del saldo unico: `balance` real-time condiviso app+cassa, `lock` con
   `expiresAt`/auto-rilascio, scarto centesimi server-side, Stripe reale.
6. **Ritorno guidato cross-app** (es. dopo "Aggiungi carta"): assente nel
   prototipo, previsto nell'app Flutter (vedi
   [Architettura-Prototipo.md §9.1](Architettura-Prototipo.md)).

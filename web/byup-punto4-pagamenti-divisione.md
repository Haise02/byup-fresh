# Byup — Punto 4: pagamenti dalla web app/app e divisione del conto

## Il problema

Chi ordina dal cameriere fa associare l'ordine all'entità generica **"Al tavolo"**. Se questa non viene divisa per commensale, due cose vanno storte:

- Chi paga in cassa può ritrovarsi piatti/bevande non divisi equamente, e su gruppi numerosi un conto enorme.
- Chi paga dall'app **si illude di aver già saldato il tavolo**, quando in realtà finché il tavolo non è chiuso nessuno è liberato.

Era il nodo identificato come **il più grande** del progetto.

## Il prerequisito tecnico (confermato presente)

- **Cassa e app scrivono sullo stesso saldo in tempo reale.** Esiste una sola fonte di verità del saldo del tavolo, letta e scritta da entrambi i canali. → L'illusione del doppio pagamento è strutturalmente impossibile: non ci sono due verità da riconciliare, ne esiste una sola.
- **Lock all'avvio del pagamento**: quando una serie di piatti sta per andare in pagamento, si attiva un lock che li congela. → Risolve la race condition (due persone che pagano gli stessi piatti nello stesso istante da canali diversi).

## Il principio cardine

**Il tavolo è un conto unico con un saldo. Ogni pagamento — da app o da cassa — decrementa lo stesso saldo in tempo reale.**

Chi paga dall'app non "salda il tavolo": salda **una quota** del saldo. L'app non dice "hai pagato il tavolo", dice in sostanza "hai pagato la tua parte, restano X€ al tavolo".

**Il tavolo si libera SOLO quando il saldo residuo è zero.** Finché c'è anche un solo piatto non coperto, il tavolo resta aperto.

## Le modalità di divisione (decise)

Divisione flessibile, tutte supportate dal lock real-time:

- **Pagamento per singolo piatto/riga** — paghi esattamente ciò che selezioni.
- **Divisione di un singolo piatto tra più commensali** — es. un piatto da 20€ diviso in 3.
- **Offrire un piatto** — un commensale si accolla la quota di un altro.
- **Pagare tutto** — saldo completo del tavolo.

## L'esperienza dopo il pagamento parziale (decisa)

Dopo aver pagato la propria parte, l'utente **non esce dal flusso**: vede una schermata con

- il **saldo rimasto** al tavolo,
- **quali piatti** sono ancora scoperti,

e può **selezionare quelli rimasti e pagarli** (per sé, per altri, o saldando tutto). → Nessuna illusione di aver liberato il tavolo; chi vuole può chiudere il resto.

## Note tecniche essenziali sul lock

1. **Timeout di auto-rilascio**: se chi sta pagando abbandona (telefono morto, app chiusa), il lock si rilascia da solo dopo un tempo ragionevole e restituisce i piatti al saldo disponibile. Senza timeout, i piatti restano congelati e nessuno chiude il tavolo.
2. **Granularità a livello di riga/quota, non di tavolo**: si bloccano solo le righe in pagamento, così più persone pagano porzioni diverse contemporaneamente senza bloccarsi a vicenda.
3. **Gestione delle quote frazionarie**: dividere un piatto tra più commensali genera importi con arrotondamento (20€ / 3 = 6,67€...). Va gestita la differenza di centesimi (es. l'ultimo pagante copre lo scarto) perché il saldo torni esattamente a zero.

## Scelta di scope (orientamento MVP)

Il flusso del cameriere così com'è butta gli ordini sull'entità "Al tavolo" senza assegnare per commensale. La divisione per piatto richiede che l'utente, dall'app, selezioni le righe dal conto del tavolo. Su gruppi numerosi con piatti mescolati questo può essere confuso — da testare nell'esperienza reale. L'**assegnazione dei piatti al singolo commensale già in fase di ordine** (lato cameriere) resta un'eventuale evoluzione futura, non richiesta per far funzionare la divisione lato app.

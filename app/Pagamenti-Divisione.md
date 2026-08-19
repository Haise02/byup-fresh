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

## Due livelli distinti: attribuzione e saldo

La divisione del conto vive su due piani che non vanno confusi.

**L'attribuzione** dice *di chi è* un piatto e in quali quote. Si decide **solo in
fase d'ordine**: chi ordina assegna il piatto a sé, a un altro commensale, a più
commensali insieme (prezzo diviso in parti uguali fra loro) o al tavolo. Chi
riceve un'assegnazione può **rifiutarla** — subito o più tardi, anche in fase di
pagamento — finché nessuno ha avviato un pagamento su quella riga o su quella
quota; il piatto rifiutato torna a chi lo ha ordinato, che lo riassegna. Se il
piatto contiene un allergene dichiarato dal destinatario, l'assegnazione è
bloccata e al destinatario **non compare nulla**: né il piatto né la notizia del
tentativo. L'attribuzione è disponibile su **app e webapp**.

**Il saldo** dice *chi mette i soldi*, e resta libero al pagamento: un commensale
può portare sul proprio conto piatti del tavolo, piatti di altri e singole quote
già divise. Questo **non cambia l'attribuzione** e **non crea nuove divisioni**:
al pagamento non si divide più niente. Il saldo è possibile **solo dall'app**;
da webapp si attribuisce ma non si paga.

Regola che tiene insieme i due livelli: le quote fissate all'assegnazione non si
ricalcolano al pagamento, e l'unica azione che le scioglie è il rifiuto.

**Escluso: alla romana.** Dividere il residuo del tavolo in 1/N fra chi deve
ancora pagare **non fa parte del prodotto**. Non è una funzione rimandata: è
fuori dal modello, perché genererebbe una divisione in fase di pagamento.

## L'esperienza dopo il pagamento parziale (decisa)

Dopo aver pagato la propria parte, l'utente **non esce dal flusso**: vede una
schermata con

- il **saldo rimasto** al tavolo,
- **quali piatti** sono ancora scoperti,

e può **prenderne in carico altri e pagarli** — piatti del tavolo, piatti altrui
o quote singole — fino a saldare tutto. Nessuna illusione di aver liberato il
tavolo; chi vuole può chiudere il resto. Quello che *non* può fare è ridividere:
le quote restano quelle decise all'ordine.

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

L'**assegnazione dei piatti al commensale in fase d'ordine** è **dentro l'MVP**
per i canali cliente, app e webapp: è il livello di attribuzione descritto sopra,
senza il quale il pagamento dovrebbe ricostruire a fine pasto chi ha preso cosa.
Resta invece fuori scope l'assegnazione per commensale **dal lato cameriere**: il
flusso staff continua a portare le righe sull'entità "Al tavolo", che i
commensali si ripartiscono dall'app.

Il numero di commensali su cui si divide è quello dei **presenti alla sessione**,
qualunque sia la superficie da cui sono entrati, inclusi i guest webapp. È
modificabile da app consumer, webapp guest, webapp cameriere e gestionale, con
priorità allo staff.

---

## Come è realizzato nel prototipo

> Forme dati e schermate → [Architettura-Prototipo.md §9](Architettura-Prototipo.md).
> Il saldo unico è simulato con un modello a **importi parziali per quota**
> (`order.settled` = `{ lineId: { payerId: importo } }`), non solo "pagato sì/no".

**Saldo a quote.** Ogni riga ha un residuo `prezzo·qty −` la somma di quanto ci
hanno versato i commensali. Pagare una quota (piatto diviso, oppure offerto in
parte) **decrementa il residuo della riga**, non la chiude: la riga resta scoperta
per la parte altrui. Il tavolo è libero solo quando la somma dei residui è 0.

Il conto si tiene **per quota e non per riga** dal 2026-08-19. Con un solo numero
per riga non si sapeva di chi fosse il pagamento, e le cifre divergevano: «paga
tutto il tavolo» chiedeva l'intero conto compreso quel che gli altri avevano già
saldato, e «Salda il resto» ripresentava la quota di un piatto diviso a chi
l'aveva già pagata. Ora il residuo esce da **una sola funzione**
(`lineRemaining`, per riga o per quota) e la stessa cifra vale per l'etichetta
della CTA, il popup di conferma, la card in home e l'importo effettivamente
addebitato.

**Due momenti di pagamento.**
1. **`PaymentScreen`** (primo pagamento): paghi i tuoi piatti + le tue quote +
   eventuali piatti del tavolo aggiunti col "+" + piatti altrui che **offri**.
   La CTA a scorrimento («Scorri per pagare») alterna due modalità: **i miei**
   (`mine`) e **paga tutto** (`all`, con popup di conferma esplicita).
   - **In pagamento non si divide** (allineato il 2026-08-19). Il piatto preso
     col "+" va sul proprio conto **per intero**: lo stato `tableSplits` e il
     popup "Dividi" — *per te / parti uguali / con alcuni* — sono stati
     **rimossi**, insieme a `extraShareFor` che ne calcolava la quota. Le
     uniche quote restano quelle fissate all'ordine (`splitWith` →
     `myShareOf`). Dell'**alla romana** (`split`) sopravvivono solo due voci di
     stile irraggiungibili nelle mappe di `SlideToPay`: la modalità non è nel
     ciclo e nessuno la imposta.
   - **`rejectSplit` resta**: rifiutare una divisione ricevuta, finché la quota
     non è pagata, è dentro il modello.
   - Pagamento → caricamento ~5s → **sempre Successo** (che elenca chi deve
     ancora pagare); se resta un residuo, la Home mostra la card «Da saldare al
     tavolo» e «Salda il resto» riapre la `PaymentScreen`, che è l'**unico**
     punto di pagamento dine-in.
2. **`BalanceScreen` — rimossa** il 2026-08-19, insieme alla route `balance`.
   Era una seconda schermata di saldo del tavolo raggiungibile solo dall'hash
   `#balance` e da nessun bottone: duplicava un flusso vivo, e la sua barra
   *[Pago io / Dividi con… / Per il tavolo]* generava divisioni in fase di
   saldo. Il residuo si chiude dalla Home, con «Salda il resto».

> ⚠️ **Quel che il prototipo ancora non fa.** L'attribuzione in fase d'ordine
> esiste nel carrello (swipe → tavolo, swipe ← «Con chi dividi?»), ma **non
> viene propagata** all'ordine: `submitTableOrder` scrive le righe con
> `ownerId: 'me'` e ignora `state.splits`. I piatti divisi che si vedono in
> pagamento vengono dai **dati demo**, dove `splitWith` è cablato a mano.
> Manca anche la **notifica di divisione ricevuta** con accetta/rifiuta: il
> prototipo parte da una divisione già accettata, e offre solo il rifiuto.
> Non c'è nemmeno l'**esclusione dei commensali allergici** dallo sheet «Con chi
> dividi?»: nel prototipo la lista dei partecipanti è cablata e senza allergeni,
> quindi li mostra tutti (il comportamento atteso è annotato nel codice, sopra
> `SplitPickSheet`).
> E manca la **divisione del piatto "per il tavolo" fra tutti i presenti**: la
> regola di prodotto è decisa, ma nel prototipo il "+" su una riga del tavolo
> se la prende **per intero**. La sottoriga della sezione "Il tavolo" tiene
> insieme le due cose e dice entrambe: *«I piatti messi a "tavolo" si dividono
> tra i N partecipanti; qui puoi comunque prenderne la parte di qualcun
> altro»* — la divisione per N è la regola, prendersi la parte altrui è
> l'azione che il "+" offre in pagamento.

**Lock real-time** (`lockedLineIds`): le righe che un altro sta pagando in quel
momento sono **congelate** — in `PaymentScreen` restano visibili col lucchetto ma
non si possono prendere in carico col "+" né offrire (`canAdd`). Quando chiudi
tutto ciò su cui puoi agire, i lock si considerano risolti in parallelo e il
tavolo va a zero. → Coerente col principio dell'**impossibilità del doppio
pagamento**: un solo saldo, decrementato da entrambi i canali.

---

## Punti aperti (da affrontare)

> Stato al 2026-07-28. Nessuno di questi rompe il flusso attuale.

**Prototipo — TODO**
1. **"Successo" mostra l'ultima tranche, non il totale pagato.** `SuccessScreen`
   legge `state.payTotal`, che dopo un secondo passaggio da «Salda il resto»
   vale solo l'ultimo importo. Fix: accumulare il totale pagato dal tavolo.
   *(Cosmetico.)*
2. ~~**Header fisso ~115px** in `PaymentScreen`~~ **Risolto**: l'header fisso
   oggi tiene solo back + titolo; lo strip avatar non è più nell'header.
3. **L'attribuzione del carrello non arriva all'ordine.** Le divisioni decise
   con lo swipe (`state.splits`) restano nel carrello: `submitTableOrder` le
   ignora e scrive tutte le righe con `ownerId: 'me'`. È il pezzo che tiene
   davvero insieme i due livelli del modello, e nel prototipo oggi non c'è.

**Decisioni di prodotto da confermare**
4. **Assunzione lock → saldo zero**: pagando in modalità «tutto il tavolo»,
   `proceed` salda **anche le righe lockate** da altri — i pagamenti paralleli
   si considerano chiusi e si va a Successo. Semplificazione del prototipo; nel
   reale il tavolo si libera solo a saldo davvero zero (esito effettivo dei
   pagamenti paralleli).

**Delta verso produzione (Flutter/backend) — già descritti sopra / in
[Contratto-Dati.md](Contratto-Dati.md)**
5. Backend del saldo unico: `balance` real-time condiviso app+cassa, `lock` con
   `expiresAt`/auto-rilascio, scarto centesimi server-side, Stripe reale.
6. **Ritorno guidato cross-app** (es. dopo "Aggiungi carta"): assente nel
   prototipo, previsto nell'app Flutter (vedi
   [Architettura-Prototipo.md §9.1](Architettura-Prototipo.md)).

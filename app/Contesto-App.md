# byup — Contesto di prodotto (il *perché*)

> 📍 **byup-Docs** › Contesto di prodotto · [Indice](README.md)

Questo documento è la **fonte di verità del contesto di prodotto** di byup: il
*perché* — visione, requisiti, scelte di backend/prodotto **non deducibili dal
codice**. Cattura tutte le logiche che non si capiscono leggendo un singolo file.

> App in italiano, prototipo/mockup ad alta fedeltà di un'app iOS per ordinare e
> pagare al ristorante (e da asporto). Tutto gira **nel browser, senza build**.
>
> **Questo è un prototipo.** Serve a validare UX/UI. Una volta validato verrà
> **riscritto in Flutter** — quindi il codice attuale è "usa e getta", ma le
> **scelte di prodotto e i requisiti** qui descritti sopravvivono alla riscrittura.
> Per questo questo file è la fonte di verità del **contesto**, non
> dell'implementazione.

**Collegamenti** (vedi [README.md](README.md) per la mappa completa):
- Il *come* del prototipo (React no-build) → [Architettura-Prototipo.md](Architettura-Prototipo.md)
- Forme dati app ⇄ backend → [Contratto-Dati.md](Contratto-Dati.md)
- Dettaglio **pagamenti & divisione** → [Pagamenti-Divisione.md](Pagamenti-Divisione.md) (sintesi §G.6)
- Dettaglio **recupero ordine webapp→app** → [Recupero-Ordine.md](Recupero-Ordine.md) (sintesi §G.7)
- Dettaglio **sicurezza & anti-abuso** (in discussione) → [Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md) (sintesi §G.8)

## A. Cos'è byup

byup è una piattaforma per **ordinare e pagare al ristorante** (al tavolo e
d'asporto) e per **scoprire** locali. Due attori:

- **Cliente** → usa l'**app consumer** (questo prototipo) o la **webapp consumer**.
- **Ristoratore** → usa **Byup Fresh**, il **gestionale web** (non in questo repo)
  dove configura locale, menu, stile di vetrina, promo, ecc. **Byup Fresh è la
  fonte dei dati** che app e webapp mostrano, ed è anche **dove byup guadagna**
  (vedi §C).

Fa parte di un **ecosistema di più prodotti** (app consumer, webapp consumer,
gestionale Byup Fresh, App Staff): il dettaglio è in §C.

## B. Stato e destino tecnico

- **Oggi**: prototipo ad alta fedeltà in React + Babel nel browser, **senza
  backend** (vedi §E per cosa è finto). Scopo: validazione UX/UI.
- **Dopo la validazione**: **riscrittura in Flutter**, **singolo codebase per
  iOS e Android**. Le decisioni di interazione qui prototipate sono il capitolato
  per quella riscrittura; l'attuale architettura "globali su `window`"
  ([Architettura-Prototipo §1](Architettura-Prototipo.md)) **non** va portata in
  Flutter, è solo un espediente da prototipo no-build.
- **Pagamenti = Stripe** (SDK ufficiale `flutter_stripe`: PaymentSheet, Apple Pay,
  Google Pay, carte). Due note importanti:
  - **Regole store**: cibo/asporto sono **beni del mondo reale** → Apple/Google
    **consentono** Stripe e **non** impongono in-app purchase né commissione (la
    quota store vale solo per beni *digitali*). Non vendere beni digitali in-app.
  - **SCA / 3D Secure (PSD2)** obbligatorio in UE/Italia → gestito da Stripe.

## C. Ecosistema Byup & modello di ricavo

### I prodotti dell'ecosistema

| Prodotto | Tipo | Chi lo usa | Ruolo |
|----------|------|-----------|-------|
| **Byup** (app consumer) | App nativa (**questo** prototipo → Flutter) | Cliente | Discovery + ordine + **pagamento** |
| **Webapp consumer** | Web (codice separato) | Cliente | **Solo ordine** (no pagamento, no discovery) |
| **Byup Fresh** | Gestionale web | Ristoratore | Configura locale/menu/vetrina; **fonte dati**; **dove byup incassa** (abbonamento) |
| **App Staff** | App nativa | Cassa del locale | **Solo cassa** (per ora): incassa i pagamenti **con carta** dei clienti che vanno al banco/cassa. **Non** gestisce gli ordini |
| **Webapp cameriere** | Web | Cameriere | **Presa ordini** (la parte ordini è qui). In **futuro** si fonderà con App Staff in un'unica app |
| **Byup Hubble** | Piattaforma web | Backoffice byup | Backoffice interno di byup; tra l'altro **alimenta "Posta"** (vedi §D) |

> Questo repo è **solo l'app consumer**. Gli altri cinque prodotti sono codebase
> separate, ma l'app dipende dai loro dati/comportamenti (Fresh = dati, Hubble =
> Posta, **App Staff = pagamenti in cassa**, **webapp cameriere = ordini**).

### App consumer vs WebApp consumer

Stesso accesso al tavolo, capacità diverse. **Non sono lo stesso prodotto**: la
webapp è volutamente **ridotta** (pensata per l'accesso rapido senza installare).

| Capacità | App consumer (questo) | WebApp consumer |
|----------|:--------------------:|:---------------:|
| **Accesso al tavolo** (codice condiviso o **scan QR**) | ✅ | ✅ |
| **Ordinazione** (menu, carrello) | ✅ | ✅ |
| **Pagamento** (in-app, conto diviso, coperti) | ✅ **differenziante** | ❌ |
| **Discovery** (home, mappa, posta, vetrine) | ✅ **differenziante** | ❌ |
| Menu evoluto (filtri, navigazione categorie, ricerca) | ✅ ricco | ⚠️ base |
| **Proposta piatti** (★ TOP / ✨ Per te) | ✅ | ⚠️ ridotta/assente |

In breve: **pagamento e discovery sono esclusive dell'app**; nel menu l'app ha
**più capacità** su filtri, navigazione e proposta dei piatti. La webapp serve a
**ordinare e basta**.

> **Accesso al tavolo**: sia app che webapp entrano in un tavolo con un **codice
> condiviso** oppure scansionando il **QR** del tavolo. Allo stesso tavolo
> possono quindi convivere utenti app e utenti webapp — riflesso nel codice dai
> flag ospite `isApp` / `isWebApp` (Architettura-Prototipo §9). La **webapp non processa
> pagamenti**: l'utente webapp ha due esiti — **paga in cassa** (coefficiente
> pieno) oppure **scarica l'app, recupera l'ordine e paga in app** (coefficiente
> ridotto, §G.7). Il peso segue sempre la superficie su cui si salda, non quella
> che ha originato l'ordine (vedi modello transazioni in §C).

### Modello di ricavo (dove byup guadagna)

**byup NON guadagna sull'app né sulla webapp.** Il ricavo è sull'**abbonamento al
gestionale Byup Fresh**, a consumo di **ordini/transazioni**.

Conteggio transazioni (chiave del modello): l'unità è la **comanda** (il
singolo invio). L'origine dà solo un peso provvisorio, che la superficie di
saldo sovrascrive: il definitivo prevale. I coefficienti non sono costanti ma
**listino versionato** (D-12): qui si citano come i coefficienti del piano —
ridotto per l'app, pieno per il resto — mai come numeri fissi. Per gruppo di
saldo vale la regola del maggiore: unità fatturate = max(comande inviate;
transazioni saldate). Una comanda mai saldata resta al peso d'origine; una
annullata esce dal conteggio. Regola completa nella Scheda del Database e
nell'SFA.

| Dove avviene il pagamento | Coefficiente | Perché |
|---------------------------|:----:|--------|
| Da **app consumer** | **ridotto** | Pagamento self-service in app |
| In **cassa** via **App Staff** | **pieno** | Passa dallo staff |
| **Ordine nato in webapp → recuperato e pagato in app** | **ridotto** | Conta come pagamento **da app**: a quel punto è lì che si salda (vedi §G.7) |
| **Ordine nato in webapp → pagato in cassa** | **pieno** | È rimasto su webapp e salda al banco |

→ Incentivo strategico: **far pagare il cliente dall'app "costa" meno** al
ristoratore in termini di conteggio. Spingere l'adozione dell'app consumer
conviene a tutti — **anche** convertendo l'ordine webapp in un pagamento in app
(scaricando l'app e recuperando l'ordine, §G.7): lo stesso ordine passa dal
coefficiente pieno a quello ridotto. È il razionale del recupero ordine (§G.7),
asporto webapp compreso (§G.4).

Piani di abbonamento **Byup Fresh** (prezzi netti, + IVA):

| Piano | Ordini inclusi/mese | Prezzo mensile | Ordine extra | Menu digitali | Collegamenti staff/monitor | Supporto |
|-------|:-------------------:|:--------------:|:------------:|:-------------:|:--------------------------:|----------|
| **Gratuito** | 550 | 0 € | 0,45 € | 1 | 1 | Chat bot, tutorial, ticket email |
| **Starter** | 1.850 | 46,99 € | 0,34 € | 3 | 3 | Chat bot, tutorial, ticket email |
| **Plus** | 7.500 | 134,99 € | 0,23 € | Illimitati | Illimitati | + telefonico lun-ven, fasce 12-16 e 18-22, richiamata entro 2 ore |
| **Business** | 15.000 | 250 € | 0,12 € | Illimitati | Illimitati | + telefonico H24, 7 su 7, richiamata entro 1 ora, canale prioritario |

Il livello di assistenza per piano è quello di D-59 (P-66): la fonte è
`ACC_PIANI` in `gestionale/account-data.jsx`; prima questa tabella prometteva a
Plus il telefono H24 con richiamata entro trenta minuti, più di quanto desse a
Business.

A un certo punto conviene salire di piano invece di pagare gli extra: ogni piano
alza il tetto incluso e **abbassa** il costo della transazione eccedente
(0,45 → 0,12 €).

## D. Requisiti funzionali (esplicitati)

Quello che il prodotto **deve** fare. ✅ = già prototipato qui; ◻️ = previsto ma
non (ancora) nel prototipo.

**Onboarding & account**
- ✅ Registrazione, login, login social, Face ID, gestione permessi iOS
  (notifiche + posizione).
- ✅ **Logout** (Profilo → "Esci", con conferma) e ✅ **elimina account**
  (irreversibile, cancella tutti i dati — rilevante GDPR).

**Profilo** (tutte le sotto-viste esistono già nel prototipo — ognuna è un
dominio backend, vedi §E)
- ✅ **Preferenze alimentari persistenti** (allergeni + diete) che influenzano la
  proposta dei piatti.
- ✅ **I miei dati**: nome, cognome, genere, data di nascita (anagrafica utente).
- ✅ **Gestione account**: cambia password, recupera password, modifica email.
- ✅ **Metodi di pagamento**: lista carte, aggiungi/rimuovi, imposta **carta
  preferita** (in produzione: token dal payment gateway, mai il PAN in chiaro).
- ✅ **Preferiti**: salva/rimuovi locali; tap su un preferito → apre la vetrina.
- ✅ **Storico ordini** (con scontrino dell'ordine, vedi Architettura-Prototipo §13).
- ✅ **Lingua** (it/en/es/fr/de): l'app è **multi-lingua** → serve i18n e
  localizzazione dei contenuti.
- ✅ **Segnala un problema**: valutazione + descrizione → **feedback a byup**
  (canale verso Byup Hubble, non verso il locale).
- ✅ **Notifiche** in-app (pannello `NotifSheet`) → in produzione **push** +
  centro notifiche (legate a Posta e allo stato ordini).
- ✅ **Termini & condizioni / Privacy** (testi legali).

**Recensioni**
- ✅ A fine pagamento l'utente può **lasciare una recensione**: voto a stelle,
  **aspetti** (cibo/servizio/…, positivi o negativi a seconda del voto) e
  commento. In produzione la recensione va **persistita** e **aggregata**: è ciò
  che alimenta **★ TOP** e il rating mostrato in vetrina.

**Discovery (solo app)**
- ✅ **Home** con sezioni editoriali, **Mappa** locali (cluster), **Posta**
  (canale byup→utente, vedi sotto), **Ricerca**.
- ✅ **Vetrina locale** con **stili selezionabili dal gestionale** (vedi
  [Architettura-Prototipo §3.1](Architettura-Prototipo.md)).
- ✅ **Prenotazione tavolo** (slot orari), **solo se il locale l'ha abilitata**;
  **annullabile/modificabile**; solo posto, no pre-ordine (futuro). Vedi §G.3.
- **GPS (solo app, solo discovery)**: serve **unicamente** al **gate densità**
  della discovery e al calcolo delle distanze, in foreground, senza storico di
  posizioni. **Non è una condizione per ordinare**: col permesso negato l'app
  resta usabile via QR/link, semplicemente senza discovery. **Non esiste alcun
  geofence** sull'accesso al tavolo, su nessun canale: il GPS è falsificabile e
  la difesa dagli abusi sta nel **gate di sessione**, nell'identità verificata
  e nel rate limiting (vedi §G.8).
- ✅ **Filtri di ricerca**: tipo dieta, distanza da te (GPS), valutazione minima,
  fascia oraria, prezzo → in produzione sono **parametri di query** lato backend
  (la ricerca non è solo client).
- **Quali locali compaiono**: solo quelli che hanno **adottato byup e completato
  l'onboarding sul gestionale Byup Fresh** (quello in cui inseriscono i dati di
  vetrina). Un locale senza vetrina configurata **non** è in discovery.
- **Gate di massa critica (per densità GPS)**: la discovery si mostra solo se
  intorno all'utente c'è abbastanza offerta. Il conteggio è su **due raggi
  concentrici attorno alla posizione GPS**, **non** su unità amministrative
  (comune/regione) — vedi *Perché i raggi* sotto. Due soglie, in **OR — basta
  che UNA sia vera**:
  - ≥ **125 locali** entro il **raggio urbano** (~6 km, *valore da tarare*),
    **oppure**
  - ≥ **150 locali** entro il **raggio largo** (~45 km, *valore da tarare*).

  Se **entrambe** sono sotto soglia → niente discovery: si mostra la variante
  **"Home — nessun locale"** (lo schermo `home-empty`, vedi Architettura-Prototipo §4.2 e
  `?page=home-empty`). Razionale: senza densità la scoperta non ha valore.
  - **Perché i raggi (e non "città/regione")**: lo scopo del gate è *"intorno
    all'utente c'è abbastanza offerta?"*, che è una domanda sui **dintorni
    fisici**, non sui confini amministrativi. Qualsiasi unità amministrativa
    crea **discontinuità** arbitrarie (stessi 100 m: di qua discovery, di là
    `home-empty`) e casi assurdi — es. un utente a **Fiumicino** (comune a sé)
    con la regola "comune" **non vedrebbe Roma**, pur essendo di fatto nell'area
    romana. Coi raggi il problema **sparisce**: si contano i locali davvero
    vicini, e Roma rientra perché cade nel raggio largo. In più **non serve**
    alcun dataset ISTAT / definizione di area metropolitana, e si **riusa la
    stessa geo-query** già necessaria per calcolare `distance`.
  - **Isteresi** (anti-flicker sul bordo): la discovery si **accende** a 125 ma
    si **spegne** solo sotto ~**110**, così camminando sul confine la home non
    lampeggia.
  - **Quando si valuta**: all'**apertura app** e ai *significant location
    change*, con esito **cachato** — non a ogni aggiornamento GPS.
- **Posta** = il canale con cui **byup** (dal backoffice **Byup Hubble**) parla agli
  utenti app: **novità** (aggiornamenti, informazioni) e **promo** mirate (es.
  "vai in quel ristorante e hai X€ di sconto", "se ordini quel menu quel giorno un
  piatto è gratis"). Non è generata dai locali: è **editoriale/promozionale di
  byup**.

**Gamification / fedeltà (solo app)**
- ✅ **Byuppini**: valuta-fedeltà con saldo/XP, livelli, sfide, premi e
  **roadmap** dei livelli — hub dedicato nella tab bar (schermate Byuppini +
  Roadmap in `app.jsx`). Meccaniche ed economia →
  [Byuppini-Concept.md](Byuppini-Concept.md).

**Menu & ordine**
- ✅ Menu per categorie, **ricerca**, **filtri allergeni** (nascondono) e
  **filtro dieta** (ordina/marca).
- ✅ **Personalizzazione piatto**: quantità, varianti, extra, rimozione
  ingredienti.
- ✅ **Proposta piatti**: **★ TOP** ("i più ordinati") e **✨ Per te** (in base
  ai gusti).
  - **"Per te" progressiva** (cold-start): la **fonte** cambia con la maturità
    dell'utente, invece di un on/off secco:
    1. **0 ordini ma preferenze dichiarate** (allergeni/diete) → "Per te"
       *leggera*, dai gusti dichiarati (è ciò che fa già il prototipo, Architettura-Prototipo §10).
    2. **≥ 3 ordini** (app + asporto) → personalizzazione *comportamentale* dallo
       storico.
    3. **Né preferenze né storico** → sezione nascosta.

    ★ TOP resta **sempre** disponibile.

**Pagamento al tavolo (solo app)**
- ✅ **Sessione di tavolo multi-utente** con ospiti (app/webapp/non loggati).
- ✅ **Invita al tavolo**: condividi **link/codice** (`navigator.share`) per far
  unire altri senza scansionare il QR (vedi §G.2).
- ✅ **Conto diviso** per piatto e per quota; **coperti**; stato "già pagato"
  per riga. Il tavolo è un **conto unico con un saldo** scritto in real-time da
  app e cassa; un pagamento dall'app salda **una quota**, e il tavolo si libera
  **solo a saldo zero**. Lock all'avvio pagamento; le quote nascono
  **all'ordine** (attribuzione) e al pagamento non si divide più — si sceglie
  solo cosa portare sul proprio conto: vedi **§G.6**.
- ✅ Modalità **paga i miei** vs **paga tutto il tavolo**.
- L'app deve **segnalare al backend** che il pagamento è avvenuto **da app**
  (coefficiente ridotto del piano — vedi §C/§E).
- ✅ **Mancia** (confermata; liberalità fuori campo IVA, esclusa dal documento fiscale — regime in SFA): percentuale (5/10%)
  oppure ✅ **"Arrotonda"** — porta il totale alla cifra tonda in euro successiva
  e la differenza diventa mancia (anche solo 0,50 €: meglio di niente). Le due
  modalità sono mutuamente esclusive (Architettura-Prototipo §9 / `tipPct`, `tipRound` in
  [menu.jsx](menu.jsx)). *(Scartato l'importo "custom" libero: ridondante coi
  preset + arrotonda in un mercato dove la mancia è poco diffusa.)*
- ✅ **Asporto** (remoto o in loco, **pagato in anticipo**): **stato ordine** +
  **codice di ritiro** da dire in cassa, **riordina**, instradamento in cucina
  secondo chi paga. Vedi §G.4.

> I **percorsi end-to-end** (al tavolo / asporto / prenotazione), il bivio
> iniziale e i problemi aperti sono in **§G**.

**Futuro (vedi §F)**
- ◻️ **Shuffle** (proposta esplorativa) e ◻️ **Salva-Euro** (combo/promo).

## E. Modello backend & gestionale — cosa è "finto" nel prototipo

Il prototipo **non ha backend**: ogni dato è cablato o in `localStorage`. Questa
tabella è la mappa di **cosa dovrà fornire il backend** (alimentato dal
gestionale) quando si passa a Flutter.

> Il **dettaglio campo-per-campo** (cosa l'app riceve dal backend e cosa invia a
> Byup Fresh / alle altre superfici) è nel file dedicato **`Contratto-Dati.md`**.

| Dominio | Nel prototipo (finto) | In produzione (backend/gestionale) |
|---------|----------------------|-----------------------------------|
| **Auth** | `localStorage.byup_auth` (vedi Architettura-Prototipo §6) | Vero auth: email + password (email non verificata) oppure Google/Apple; telefono verificato una tantum via OTP in entrambi i flussi (univoco, richiesto per ordinare/pagare), sblocco biometrico locale, sessioni/token |
| **Dati locale + vetrina** | `EXPLORE_VENUES` hardcoded / prop `venue` | Anagrafica locale **+ stile vetrina scelto nel gestionale** (Architettura-Prototipo §3.1) |
| **Menu** | `ALL_DISHES` hardcoded in [menu.jsx](menu.jsx) | Menu per locale: piatti, prezzi, categorie, varianti, extra, allergeni, macro |
| **★ TOP** | flag `bestSeller` statico | **Statistiche d'ordine aggregate** per locale |
| **✨ Per te** | calcolo client da filtri (Architettura-Prototipo §10) | **Personalizzazione** lato backend (storico, gusti). **Gate: ≥3 ordini** prima di mostrarla (§D) |
| **Sessione tavolo / ospiti / split / pagato** | `activeOrder` demo (Architettura-Prototipo §9) | **Saldo del tavolo real-time** (fonte di verità unica app+cassa) + **lock** sulle righe in pagamento; tavolo libero **solo a saldo zero**; ciclo di vita/scadenza sessione (§G.5, §G.6) |
| **Join al tavolo** | nessun controllo | Nessun vincolo di posizione, su nessun canale: QR/link/codice risolvono alla sessione. Difesa via **gate di sessione** + rate limiting, e **pagamento contestuale** sul canale anonimo (§G.8) |
| **Stati del tavolo** | — | Dominio **Byup Fresh** / webapp cameriere: Occupato/Libero/Prenotato/**Da pulire**; sessione app chiude al passaggio a "Da pulire" (§G.5) |
| **Asporto: cucina/ritiro** | `takeawayOrder` demo, `pickupTime` finto | **Anche da webapp** (l'ordine si compone dal browser e si salda in cassa o in app via recupero, §G.4/§G.7); slot ritiro dal backend; **invio in cucina** condizionato al pagamento in app; **codice di ritiro** verbale (§G.4) |
| **Riconciliazione ordine webapp→app** | — | Ordine `orfano` + **codice ordine** breve; **Android**: Install Referrer (auto, no banner); **iOS/fallback**: codice manuale via banner; telefono verificato = unicità account (§G.7) |
| **Storico ordini / scontrino** | `PROFILE_ORDERS` demo, scollegato dal pagamento | A pagamento riuscito l'ordine viene **persistito** nello storico utente; "Vedi scontrino" punta a **quell'id** (vedi dinamica sotto) |
| **Pagamenti** | finti (icone Klarna/PayPal/Apple Pay) | **Stripe** (`flutter_stripe`): PaymentSheet, Apple/Google Pay, carte; SCA/3DS gestito. Solo app (§B) |
| **Coperti** | costante `COVER = 2€` | Config del locale |
| **Prenotazioni** | `byup_booking`, azzerata al refresh | Disponibilità/booking reale |
| **Preferenze profilo** | `localStorage.byup_allergens` | Profilo utente lato backend |
| **Discovery + gate densità** | sempre mostrata (o `?page=home-empty` a mano) | **Conteggio locali attivi entro due raggi GPS** dalla posizione → decide se mostrare discovery o `home-empty` (soglie 125 raggio urbano / 150 raggio largo, in OR, con isteresi, §D) |
| **Locale "in discovery"** | tutti gli `EXPLORE_VENUES` finti | Solo locali con **onboarding vetrina completato** su Byup Fresh |
| **Posta** | contenuti demo in [map.jsx](map.jsx) (`PostaScreen`) | Novità + promo pubblicate da byup via **Byup Hubble** (§D) |
| **Anagrafica utente** | stato locale (`MieiDatiView`) | Profilo utente (nome, cognome, genere, data di nascita) |
| **Gestione account** | UI finta (cambia/recupera password, modifica email) | Operazioni auth reali (password, email, verifica) |
| **Metodi di pagamento** | `PagamentiView` con carte demo + carta preferita | Carte **tokenizzate** dal gateway (mai PAN in chiaro), preferita per-utente |
| **Preferiti** | `PROFILE_PREFERITI` demo (add/remove locale) | Lista preferiti **persistita per utente** |
| **Recensioni** | submit a vuoto (`SuccessScreen`) | Recensioni **persistite + aggregate** → alimentano ★ TOP e rating vetrina |
| **Lingua / i18n** | selettore locale (`lingua`) | App **multi-lingua**: stringhe + contenuti localizzati |
| **Segnala un problema** | UI finta (`SegnalaView`) | **Feedback a byup** (→ Byup Hubble), non al locale |
| **Notifiche** | `NotifSheet` demo | **Push** + centro notifiche (legate a Posta e stato ordini) |
| **Elimina account** | conferma demo | Cancellazione dati **irreversibile** (GDPR) |

> Regola d'oro per la riscrittura: **ogni "dato cablato" qui è un endpoint da
> definire.** Cerca `ALL_DISHES`, `EXPLORE_VENUES`, `activeOrder`, `demoTakeaway`.

> ⚠️ **Cosa il prototipo NON mostra (verificato sul codice).** Confine preciso tra
> ciò che il mockup *già fa* e ciò che resta backend/futuro:
> - **Pagamento parziale / divisione (§G.6) — UX PRESENTE nel prototipo.** Il
>   mockup fa già: `mine`/`all`; **i tuoi piatti + quote** (`myShareOf =
>   price·qty/(splitWith+1)`); **"+"** per aggiungere al tuo conto i piatti del
>   tavolo e quelli degli altri commensali (sezione "Il tavolo": card per
>   commensale, gerarchia utenti app → webapp → "Altro");
>   **saldo a importi parziali**
>   (`order.settled`, helper `seedSettled`/`lineRemaining`/`applyPayments`,
>   persistiti in sessione via `byup_table`); **lock real-time**
>   (`lockedLineIds`, righe "in pagamento" da altri congelate). **In pagamento
>   non si divide più**: il piatto preso col "+" va sul proprio conto per
>   intero, e il popup `tableSplits` (per te / parti uguali / con alcuni) è
>   stato rimosso il 2026-08-19 — le quote sono solo quelle fissate all'ordine.
>   Dopo un pagamento parziale si va a **Successo** e il **residuo** resta
>   visibile in home (card ordine attivo → "Salda il resto" riapre il conto);
>   la vecchia **schermata Saldo** (`BalanceScreen`, route `balance`) è stata
>   **cancellata** nella stessa occasione.
>   "Paga ora" è uno **slide-to-pay** con **caricamento ~5s** (conferma
>   esplicita solo per "paga tutto il tavolo"). **Quello che manca è solo il
>   backend**: saldo e lock come **fonte di verità unica condivisa app+cassa in
>   real-time** (qui simulati lato client).
> - **Recupero ordine webapp→app (§G.7) — PARZIALE (percorso iOS).** Ora il
>   prototipo **ha**: banner *"Hai un ordine da pagare?"* (20s → Posta → Novità),
>   **popup codice** (digita/**incolla auto-accettato**), **caricamento simulato**
>   → `byup Menu.html#home`. **Non** ha: l'**Install Referrer Android** (e il
>   relativo auto-caricamento dopo i popup); la **validazione del codice** è a
>   **sei cifre** contro il codice demo 483912, con la riga d'errore rossa (*"Codice
>   riscatto ordine errato"*), la scala di attese e il blocco al sesto tentativo (D-42).
> - **Modalità `selection`** (riga del Contratto-Dati): non è una modalità
>   *nominata* nel codice (esistono `mine`/`all`); però pagare un **sottoinsieme**
>   è già possibile col **"+"** sui piatti (del tavolo / offerti) nella
>   `PaymentScreen`. `selection` resta quindi un'**etichetta futura**, non un
>   buco di UX.
>
> Regola pratica: per *cosa il prototipo fa vedere* → [Architettura-Prototipo.md](Architettura-Prototipo.md);
> per *cosa il prodotto deve fare* → questo file (§G) e gli spoke tematici.

> Nota: il **conteggio transazioni/abbonamento** (Gratuito 550 / Starter 1.850 /
> Plus 7.500 / Business 15.000; coefficienti del piano, ridotto per l'app —
> vedi §C) è logica di **Byup Fresh**, non dell'app consumer. L'app deve solo
> segnalare correttamente al backend che un pagamento è avvenuto **da app**
> (coefficiente ridotto).

## F. Funzioni future allo studio (già discusse)

Non implementate nel prototipo, ma da tenere presenti nelle scelte di modello
dati e UI:

- **Shuffle** — proposta **esplorativa**: suggerisce piatti **diversi** da quelli
  che l'utente prende di solito, per far scoprire cose nuove (l'opposto di "Per
  te", che asseconda i gusti).
- **Salva-Euro** — **combinazioni** di piatti che convengono: promo/combo del
  locale, oppure semplicemente accostamenti **migliori per
  qualità/completezza/prezzo**. Sia "per il locale (Top)" sia personalizzate
  "per te".

---

## G. I tre percorsi d'ordine (al tavolo / asporto / prenotazione)

In **tutti** i casi prima si **naviga il menu e si costruisce un carrello**; il
bivio arriva dopo. Questa sezione è la mappa dei percorsi e — importante — dei
**problemi ancora aperti**.

### G.1 Il bivio iniziale (mode choice)

- Se sei entrato nel menu **scansionando il QR del tavolo** (o da link tavolo) →
  **nessuna domanda**: sei già nella **sessione del tavolo** (vedi G.2).
- Se sei entrato **senza** QR (es. da vetrina / link generico) → l'app **chiede**:
  *"Sei al tavolo o ordini d'asporto?"*
  - **Asporto** → **paghi subito** (pagamento contestuale, vedi G.4).
  - **Al tavolo** → flusso normale della sessione tavolo (G.2).

> **Ordine al banco / senza tavolo**: **non è un caso d'uso dell'app**. Se ordini
> al banco ordini e paghi **in cassa**, l'app non serve. L'unica variante "senza
> tavolo" gestita dall'app è l'**asporto in loco** (ordini e **paghi
> contestualmente** in app, poi riporti il **codice asporto** in cassa). Quindi i
> percorsi app restano **tre**: al tavolo, asporto (remoto o in loco),
> prenotazione.

### G.2 Al tavolo

- **Ingresso**: scan **QR** del tavolo **oppure** **codice/link condiviso** da chi
  è già nel tavolo → ti **unisci alla sessione**, e il tuo **avatar** viene
  aggiunto all'**ID tavolo**. Più utenti (app + webapp) condividono la stessa
  sessione; ognuno ha il suo `ownerId`; pagamento e conto diviso come Architettura-Prototipo §9.
- **Primo accesso = host**: a **chi scansiona per primo** il QR (apre la sessione)
  viene chiesto **quanti sono i commensali** al tavolo. Agli altri che si
  uniscono dopo **non** viene chiesto. *(Nel prototipo attuale il numero non è
  più chiesto all'ingresso — lo saltavano tutti: arriva da `order.covers` e si
  gestisce/corregge dalla sheet commensali "Al tavolo"; vedi
  Architettura-Prototipo §9.)*
- **Modi per unirsi a un tavolo** (tutti risolvono allo **stesso ID tavolo**,
  senza alcun vincolo di posizione — vedi §G.8):
  1. **Scan QR** — primario, copre l'happy path.
  2. **Link condiviso** — frictionless per invitare chi è già seduto (deep link,
     niente da digitare).
  3. **Codice numerico manuale** — 🟠 **da decidere** (raccomandato come
     *fallback*): per fotocamera negata/rotta, QR rovinato/mancante, o codice
     **condiviso a voce/in chat** (per consumarlo lo digiti). Vedi §G.9.
- **Nessun geofence (DECISO)**: l'ingresso in sessione **non** verifica la
  posizione, né dall'app né dalla webapp. Il GPS è falsificabile e il vero
  rischio è il falso negativo: bloccare un cliente seduto al tavolo. La difesa
  dagli agganci a distanza sta nel backend: **gate di sessione** (si ordina solo
  in una sessione aperta in quel momento), identità verificata via telefono
  lato app, **pagamento contestuale** sul canale anonimo, rate limiting (§G.8).
- **Riconciliazione / recupero ordine webapp → app**: la webapp **non chiede
  registrazione**; l'ordine nasce **orfano** lato server con un **codice ordine**
  breve. Al primo avvio l'app lo riaggancia all'account — **automatico su
  Android** (Install Referrer) o via **codice manuale** (iOS / fallback). Il
  meccanismo completo è in **§G.7**. L'identità dell'account è email + password
  (o Google/Apple); il telefono, verificato una tantum, garantisce l'unicità
  dell'account e serve anche da notifica tempestiva (es. "asporto pronto,
  codice X").

### G.3 Prenotazione

- Disponibile **solo se il locale l'ha abilitata** dal gestionale **Byup Fresh**;
  altrimenti **non si prenota** dall'app (alcuni locali sono "solo walk-in").
- **Solo prenotazione del posto** (per ora): **niente pre-ordine** — è una
  **funzionalità futura**. Si deve però poter **annullare o modificare** la
  prenotazione.
- All'arrivo: **scan QR** del tavolo.
  - **Il tuo tavolo** → ti **aggancia** sempre alla sessione (→ G.2), libero o
    già aperto che sia, e registra l'arrivo anche se lo staff non l'ha marcato.
  - **Un altro tavolo, prenotato per altri o occupato** → **niente aggancio**:
    *"Questo tavolo è già prenotato, il tuo è il xx — chiedi al personale in
    sala."* / *"Questo tavolo è occupato, il tuo è il xx — chiedi al personale in
    sala."*
  - **Un altro tavolo, libero o da liberare** → dipende dalla sala. Se spostarti
    lì non lascia scoperta nessuna prenotazione in arrivo, **ti aggancia** e la
    prenotazione si sposta da sola. Altrimenti **niente aggancio**: *"Il tavolo
    sembra libero, ma la tua prenotazione è per il xx: chiedi conferma al
    personale prima di sederti e ordinare."*
  - In tutti i casi di tavolo diverso dal proprio parte una **notifica allo
    staff** con nome, tavolo assegnato e tavolo scansionato.
  - **Senza prenotazione attiva** non si è mai bloccati: sull'occupato ci si
    unisce, sul prenotato per altri si entra con avviso.
  - *(Controllo scan-time/backend: **non nel prototipo**, dove lo scan è
    simulato — `startScanQR` in [menu.jsx](menu.jsx).)*

### G.4 Asporto

- Può essere **da remoto** (ordini da casa per un orario), perché il pagamento è
  **contestuale**.
- **Instradamento in cucina dipende da CHI paga**:
  - **App consumer** (paga in app) → l'ordine va **dritto in cucina**.
  - **Webapp consumer** (non può pagare in app) → deve passare per la **cassa**;
    finché non è **pagato in cassa**, **non** va in cucina.
- **Slot di ritiro**: gestiti dal **backend Byup Fresh**. L'app sa solo **quando
  l'ordine sarà pronto** e mostra un **codice da dire a voce** al ritiro; il
  titolare lo inserisce nel gestionale per chiudere.
- ✅ **Asporto da webapp = SÌ (decisione ribaltata, D-14)**. L'argomento contrario
  misurava il tempo della cottura — senza pagamento l'ordine non parte finché
  non è saldato, ed è ancora vero — ma il guadagno sta nella **composizione
  dell'ordine**: si arriva al banco con l'ordine già composto e identificato dal
  **codice di ritiro**, e la fila si accorcia anche se la preparazione parte al
  pagamento. Il QR del menu d'asporto da webapp apre quindi l'ordinazione, e
  l'ordine si salda **in cassa oppure in app**, recuperandolo con il codice
  mostrato dalla webapp: digitato o incollato nel popup in stile OTP
  (riconoscimento automatico all'incollaggio), su Android agganciato da solo via
  Install Referrer senza inserire nulla (SFA §3.8, §G.7). L'invio in cucina
  resta condizionato al pagamento. Nella webapp le due strade si presentano
  **a pari evidenza** (P-02, EDPB 03/2022): il saldo in app resta "consigliato"
  solo come razionale del coefficiente ridotto, non come gerarchia di
  interfaccia.

### G.5 Ciclo di vita della sessione tavolo

Modello definito: la chiusura la decide lo **staff** tramite gli stati del
tavolo (meccanismo **primario**, semantico); un **backstop** automatico **non
aggressivo** copre il caso *"tavolo aperto e dimenticato"* (rete di sicurezza,
non meccanismo primario).

- **Tre piani distinti (da non confondere)**:
  1. **Stato del tavolo** (Occupato/Da pulire…) → dominio **Byup Fresh / webapp
     cameriere**, primario.
  2. **Sessione consumer** (chi può joinare / ordinare / pagare dall'app) → è
     ciò che il **backstop** auto-chiude.
  3. **Contabilità / insoluti** → dominio **Byup Fresh**, riconciliata dal
     **titolare**.
- **Stati del tavolo** (gestiti da **Byup Fresh** e dalla **webapp cameriere**):
  **Occupato · Libero · Prenotato · Da pulire**.
- **Chiusura della sessione = il tavolo passa ad almeno "Da pulire"** — che
  significa **conto pagato** ma tavolo non ancora pulito. Da quel momento la
  sessione app è chiusa.
- **Backstop "tavolo dimenticato"** (non aggressivo): se lo staff non cambia
  mai stato, la **sessione consumer** si **auto-chiude** all'**orario di
  chiusura del locale** (Byup Fresh conosce gli orari) **oppure** dopo una
  **finestra di inattività** (nessun nuovo item / nessun pagamento per N ore).
  L'auto-chiusura **non** tocca lo stato del tavolo: smette solo di accettare
  azioni dall'app (join/ordine/pagamento), così una sessione dimenticata non
  resta **pagabile in eterno**: senza vincoli di posizione al join, il backstop
  è l'unica rete contro il tavolo aperto e dimenticato.
- **Identità della sessione = (tavolo fisico × evento di apertura)**. Il QR sul
  tavolo è **statico**: "scan QR" = *entra nella sessione APERTA del tavolo,
  oppure creane una nuova*. Un nuovo gruppo che scansiona **dopo** la chiusura
  apre una **sessione nuova**.
- **Edge gestito dallo staff**: se un tavolo in stato **"Da pulire" viene
  occupato**, al cameriere compare un **alert** (così non si serve un tavolo non
  ancora pronto / non si eredita la sessione vecchia).
- **Accesso (join), non timer**: per **tutti** i canali l'unico requisito è il
  **gate di sessione** (§G.8) — nessun controllo di posizione. Per la
  **chiusura** è primario lo staff, col **backstop** non aggressivo qui sopra;
  niente auto-timeout aggressivi *sul join*.
- **Ordini non pagati alla chiusura (insoluti)**: **non** spariscono — alla
  chiusura (staff **o** backstop) le righe non saldate passano alla **sezione
  insoluti** di **Byup Fresh** con owner/canale. **Chi e quando li chiude**: il
  **titolare** li riconcilia in Byup Fresh (segna pagato offline, stralcia, o
  insegue); **non è compito dell'app**, che si limita all'**handoff** delle
  righe alla chiusura.

### G.6 Pagamento e divisione del conto (saldo unico + lock) — DECISO

> **Dettaglio completo → [Pagamenti-Divisione.md](Pagamenti-Divisione.md).** Qui
> solo la sintesi. Era il nodo identificato come **il più grande del progetto**.

- **Principio cardine**: il tavolo è un **conto unico con un saldo**, scritto in
  real-time da **app + cassa** (fonte di verità **unica** → niente doppio
  pagamento). Pagare dall'app salda **una quota**, non "il tavolo": il tavolo si
  libera **solo a saldo zero**.
- **Lock all'avvio del pagamento**: congela le righe in pagamento (granularità
  riga/quota, **auto-rilascio** a timeout) → niente race condition, pagamenti
  paralleli possibili.
- **Due livelli**: l'**attribuzione** (di chi è il piatto, e in quali quote) si
  decide **solo in fase d'ordine**; il **saldo** resta libero, ma non crea nuove
  divisioni — si può portare sul proprio conto piatti del tavolo, piatti altrui
  e quote già divise, fino a pagare tutto.
- **Dopo il pagamento parziale**: l'utente resta nel flusso, vede **saldo residuo
  + piatti scoperti** e può pagarne altri.
- **Scarto centesimi** (quote frazionarie) gestito server-side (es. l'ultimo
  pagante copre la differenza) per tornare a zero esatto.
- **Scope MVP**: l'assegnazione dei piatti al commensale **già in fase d'ordine**
  (lato cameriere) è evoluzione futura, non necessaria per la divisione lato app.

### G.7 Recupero dell'ordine webapp → app — DECISO

> **Spec tecnica completa (con codice) → [Recupero-Ordine.md](Recupero-Ordine.md).**
> Qui solo la sintesi.

Un ordine creato in **webapp senza registrazione** dev'essere ritrovato nell'app
appena installata per pagarlo lì (→ peso ridotto del piano, §C). Strategia
**biforcata per piattaforma**:

- **Codice ordine** a **sei cifre**, ordine in stato `orfano` lato server =
  fonte di verità persistente.
- **Android (automatico, silenzioso)**: l'**Install Referrer** porta il codice
  dentro l'installazione → il backend collega l'ordine **già durante l'onboarding**.
  Conseguenza: **appena l'utente conferma i popup iniziali, l'ordine è già
  caricato** (→ Home + ordine), **senza banner né codice**. Se il referrer manca
  (no Play Store / sideload) → fallback manuale iOS.
- **iOS (manuale, come nel prototipo)**: dopo i popup compare un **banner** *"Hai un
  ordine da pagare?"* (~20s, poi parcheggiato in **Posta → Novità**) → tap → **popup
  codice** (digita o **incolla auto-accettato**, stile OTP) → caricamento → Home +
  ordine.
- **Codice errato/scaduto** → **riga d'errore rossa** nel popup (*"Codice riscatto
  ordine errato"*, scaduto, già recuperato); il popup resta aperto. Dettaglio UX +
  nota anti-brute-force in [Recupero-Ordine.md](Recupero-Ordine.md) §3.bis.
- **Codice perso** → **pagamento in cassa**. Il telefono verificato garantisce
  l'unicità dell'account; il codice/referrer è solo il matching dell'ordine.
- **Roadmap**: deferred deep linking (Branch/AppsFlyer/…) per togliere la
  digitazione anche su iOS — fuori MVP.
- 🧪 **Prototipo**: realizzato il **percorso iOS** (banner+popup+incolla+caricamento
  → `Menu#home`); **non** l'Install Referrer. La validazione è a **sei cifre** contro
  il codice demo 483912, con riga d'errore, attese crescenti e blocco al sesto
  tentativo (D-42). Vedi §E.

### G.8 Difesa da accessi remoti e ordini civetta — IN DISCUSSIONE

> **Documento completo → [Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md).** Qui
> solo la sintesi.
>
> **Stato: discussione in corso, decisioni non ancora prese.** *(Eccezione già
> decisa: **nessun geofence** sull'accesso al tavolo, su nessun canale — §D,
> §G.2.)*

- **Due attacchi**: volumetrico da remoto (ordini all'infinito) e ordine
  **civetta** (singolo piatto malizioso, poi sparizione).
- **GPS scartato come anti-abuso** (falsificabile, fa scappare l'onesto): nessun
  vincolo di posizione su alcun canale; il GPS resta solo un dato di discovery.
- **Principio**: il **QR è un puntatore, non una chiave**; ordinare richiede una
  **sessione tavolo valida**; si alza il **costo di reiterare** oltre il danno.
- **Difese trasversali**: gate di sessione, rate limiting (sessione/IP/account),
  tetto posti.
- **Biforcazione canale**: webapp anonima → **pagamento contestuale obbligatorio**;
  app con identità → si valuta il **"paga alla fine"** sbloccato da **trust
  progressivo** (+ ban su identità/device, rate limiting, monitoraggio pattern).
- **Barriere d'identità**: telefono SMS = deterrente serio; CF/SPID solo
  progressivo/mirato (attrito + GDPR).
- **Metodo ISO 27001**: per l'MVP non certificarsi, ma **loggare dal giorno 1** e
  tenere un **registro dei rischi**.

### G.9 Questioni ancora aperte (da chiudere prima di Flutter)

- **Codice numerico manuale** per unirsi al tavolo: includerlo come **fallback**
  (oltre a QR + link) o lasciare solo QR/link? (raccomandato: sì) (§G.2).
- **Difesa da abusi** (§G.8): l'intero impianto anti-abuso è ancora in
  discussione — webapp paga-prima da confermare, "paga alla fine" da app e trust
  progressivo da calibrare (a tutti i nuovi account vs solo a chi auto-attiva via
  QR, orientamento verso il secondo), profondità CF/SPID da decidere (anti-abuso
  vs prodotto: fatturazione/loyalty).

---

# Parte II — Architettura del prototipo → file separato

> Il *come* del prototipo (React no-build: globali su `window`, due app/router,
> navigazione, storage, stato del menu, raccomandazioni, tema, trappole) è stato
> spostato in un file dedicato, perché ha **vita propria** e sarà buttato alla
> riscrittura in Flutter:
>
> **→ [Architettura-Prototipo.md](Architettura-Prototipo.md)**
>
> Le sue sezioni §1–§13 sono citate da qui (es. "Architettura-Prototipo §9" per il
> modello `activeOrder`/conto diviso del prototipo). Mappa completa dei documenti
> in **[README.md](README.md)**.

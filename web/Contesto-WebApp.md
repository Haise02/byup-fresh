# byup — Contesto WebApp consumer

> **Scopo di questo file.** È il contesto da tenere **nella repo della WebApp
> consumer**. Riassume l'ecosistema byup quel tanto che basta per orientarsi, poi
> entra nel **dettaglio della webapp**: cosa fa, cosa **non** fa di proposito, i
> flussi, e il **contratto dati** (cosa riceve / cosa invia).
>
> La fonte di verità completa del prodotto è in un altro repo
> (`Contesto-App.md` + `Contratto-Dati.md`, lato app consumer). Qui se ne riporta
> **solo** ciò che serve alla webapp; dove utile sono citate le sezioni originali
> (§C, §G.2, ecc.).

---

## 1. Cos'è byup (in breve)

byup è una piattaforma per **ordinare e pagare al ristorante** (al tavolo e
d'asporto) e per **scoprire** locali. Due attori:

- **Cliente** → usa l'**app consumer** (nativa) **oppure** la **webapp consumer**
  (questo repo).
- **Ristoratore** → usa **Byup Fresh**, il gestionale web dove configura locale,
  menu, vetrina, promo. **Byup Fresh è la fonte dei dati** che app e webapp
  mostrano.

L'ecosistema completo: app consumer · **webapp consumer (qui)** · Byup Fresh
(gestionale) · App Staff (cassa) · Webapp cameriere (presa ordini) · Byup Hubble
(backoffice). Sono **codebase separate**; la webapp dipende dai loro
dati/comportamenti (Fresh = dati e menu, **sessione tavolo** lato backend,
cassa via App Staff per il pagamento).

---

## 2. Cos'è la WebApp consumer (e perché esiste)

La webapp è la via di accesso **rapida, senza installare niente**: scansioni il QR
del tavolo (o apri un link/codice) e ordini dal browser. È **volutamente ridotta**
rispetto all'app nativa.

> ⚠️ **Non è una versione web dell'app.** È un prodotto diverso, con uno scopo
> preciso: **ordinare e basta**. Pagamento e discovery sono **esclusive dell'app
> nativa** e non vanno portate qui.

### 2.1 Capacità: webapp vs app consumer

| Capacità | App consumer (nativa) | **WebApp (questo repo)** |
|----------|:--------------------:|:------------------------:|
| **Accesso al tavolo** (codice condiviso o **scan QR**) | ✅ | ✅ |
| **Ordinazione** (menu, carrello, personalizzazione) | ✅ | ✅ |
| **Pagamento in-app** (conto diviso, coperti, mancia) | ✅ | ❌ → **si paga in cassa** |
| **Discovery** (home, mappa, posta, vetrine) | ✅ | ❌ |
| Menu evoluto (filtri ricchi, navigazione categorie, ricerca) | ✅ ricco | ⚠️ **base** |
| **Proposta piatti** (★ TOP / ✨ Per te) | ✅ | ⚠️ **ridotta/assente** |
| Account / registrazione | ✅ | ❌ **nessuna registrazione** |

In una frase: **la webapp serve a ordinare**. Niente pagamento, niente discovery,
niente account; menu in versione base.

### 2.2 Cosa la webapp NON fa (e perché — da non implementare)

- **Non paga in-app.** Chi ordina dalla webapp **passa dalla cassa** (App Staff).
  Questo è anche un fatto di **modello di ricavo**: un pagamento da webapp pesa
  il **coefficiente pieno** per il ristoratore, contro il **ridotto** se pagato
  dall'app nativa (vedi §5). La webapp non integra Stripe.
- **Non fa discovery.** Niente home editoriale, mappa, Posta, vetrine. Si entra
  **solo** da un tavolo (QR/codice/link) — non si "naviga byup" dalla webapp.
- **Non gestisce account.** Nessun login/registrazione. Nessun dato identitario
  raccolto al checkout (niente telefono): l'ordine si recupera in app via **codice
  ordine** (§4.3), non per match telefonico.
- **Asporto da webapp → SÌ (decisione ribaltata, D-14).** Il QR del menu asporto
  **fa ordinare dal browser**. L'argomento contrario misurava il tempo della
  cottura — senza pagamento l'ordine parte solo dopo il saldo — ma il guadagno
  sta nella **composizione dell'ordine**: si arriva al banco con l'ordine già
  fatto, identificato dal codice di ritiro. Si salda **in cassa oppure in app**,
  recuperando l'ordine col codice mostrato dalla webapp (popup in stile OTP con
  riconoscimento automatico all'incollaggio; su Android aggancio automatico via
  Install Referrer — SFA §3.8). Le due strade si presentano **a pari evidenza**
  (P-02, EDPB 03/2022): il saldo in app resta "consigliato" solo come razionale
  del coefficiente ridotto, non come gerarchia di interfaccia.

---

## 3. Convivenza con l'app nello stesso tavolo

Allo **stesso tavolo** possono coesistere utenti app e utenti webapp: condividono
la **stessa sessione di tavolo** lato backend. Ogni partecipante è un ospite con
un flag di tipo — per la webapp è **`isWebApp`** (gli altri: `isMe`, `isApp`,
`isGuest`). L'avatar di chi si unisce compare nell'ID tavolo.

Differenza chiave nella stessa sessione: **solo gli utenti app pagano dall'app**;
gli utenti webapp **passano dalla cassa**. Quindi la webapp partecipa
all'ordinazione condivisa ma **non** alla fase di pagamento self-service.

---

## 4. Flussi della webapp

### 4.1 Accesso al tavolo

- **Ingresso**: **scan QR** del tavolo, oppure **link condiviso**, oppure
  **codice numerico** condiviso a voce/in chat (il codice manuale come fallback è
  ancora una decisione aperta lato prodotto, §G.6 della fonte). Tutti risolvono
  allo **stesso ID tavolo** e creano/uniscono la **sessione**.
- **Niente geofence/GPS.** L'idea di bloccare l'accesso in base alla posizione è
  stata **scartata**: il GPS si falsifica banalmente e fa scappare l'utente onesto
  (permesso che spaventa), dando un falso senso di sicurezza. La difesa da accessi
  remoti e ordini "civetta" non è geografica ma sta nel backend: **gate di sessione**
  (nessun ordine senza sessione tavolo valida aperta in quel momento), **rate
  limiting** per sessione/IP/device, e **pagamento contestuale** sul canale anonimo.
  Vedi `byup-punto3-difesa-attacchi.md`.

### 4.2 Ordinazione

- Si **naviga il menu e si costruisce un carrello**, poi si **inviano i piatti**
  alla sessione del tavolo (con `ownerId` del partecipante webapp).
- Personalizzazione piatto (quantità, varianti, extra, rimozione ingredienti):
  supportata; la forma della riga carrello è `{ dishId, qty, variants{},
  extras{ extraId:qty }, removed{ ingrediente:true } }`.
- Menu in **versione base**: filtri/ricerca/navigazione categorie sono più
  leggeri che nell'app; ★ TOP / ✨ Per te sono **ridotti o assenti**.

### 4.2-bis Divisione del conto (REAL-TIME) — pagamento escluso

- La **divisione del conto è una funzione real-time anche da webapp**: dividere una
  riga (`me` / `diviso` fra commensali / `tavolo`), prendere in carico un piatto
  "al tavolo" (claim), offrire la quota di un altro. Le modifiche vanno al backend e
  vengono **propagate agli altri partecipanti** (app, webapp, cassa) sullo **stesso
  conto unico** (vedi `byup-punto4-pagamenti-divisione.md`).
- **L'unico limite è il pagamento**: da webapp **non si paga** (cassa o app). Quindi
  la webapp legge il saldo aggiornato in tempo reale e prepara la divisione, ma il
  "paga la tua parte" porta al recupero ordine in app, non a un incasso sul web.
- Tutte le operazioni passano da **`window.ByupAPI`** (`api.jsx`); oggi sono **mock**.
  Comandi e forme dati nel **contratto**: `byup-contratto-backend-webapp.md`.

### 4.3 "Pagamento" = pagamento in cassa/app + recupero ordine (NON pagamento in-app)

La webapp **non incassa**. Il cliente paga **in cassa** (App Staff) o, se scarica
l'app, **dall'app**. Il recupero dell'ordine anonimo webapp→app **non avviene più
per telefono+SMS** ma con un meccanismo biforcato (vedi
`byup-spec-tecnica-recupero-ordine.md`):

1. Il server genera un **codice ordine** breve (5–6 cifre), fonte di verità persistente.
2. **Android**: l'ordine viaggia nel `referrer` del link al Play Store →
   abbinamento **automatico** al primo avvio (nessun codice da digitare).
3. **iOS / fallback**: **codice ordine** manuale, mostrato in evidenza sulla
   schermata finale, più un **banner** "Hai ordinato dal browser?" all'apertura dell'app.
4. Codice perso e nessun recupero automatico → si **paga in cassa** (caso peggiore
   = il flusso che esisteva comunque senza byup).

> Nota: l'identità account nell'ecosistema resta il telefono, ma il **link** tra
> ordine anonimo e account passa da codice/referrer, non dal match by-phone.

### 4.4 Asporto

**SÌ per la webapp (decisione ribaltata, D-14).** Il QR del menu asporto
(`?takeaway=1`) **apre l'ordinazione**: l'ordine si compone dal browser e si
salda **in cassa oppure in app**, recuperandolo col codice mostrato a fine
ordine (popup in stile OTP, incolla riconosciuto in automatico; su Android
aggancio via Install Referrer — SFA §3.8) — in cucina va al pagamento. Il tempo
di cottura non cambia; cambia la fila, perché l'ordine arriva al banco già
composto. Le due strade di saldo si presentano a pari evidenza (P-02).
Nel prototipo (P-01 · P-02): stesso menù e stesso carrello, CTA «Ordina
d'asporto», poi la home asporto con il **codice di ritiro** grande (quattro
caratteri, la forma di Vendita diretta), il riepilogo e il **bivio** in una
griglia a due colonne identiche — «Paga dall'app», che dice che serve un
account e porta al recupero col codice ordine a sei cifre, e «Paga al ritiro,
in cassa», che mostra il codice e dice che l'ordine parte al saldo — senza
promo dell'app accanto. L'ordine mock resta nel bundle: Vendita diretta non lo
riceve (registro condiviso in coda). Per il razionale completo vedi §2.2.

---

## 5. Modello di ricavo (perché la webapp pesa pieno)

byup **non guadagna** né sull'app né sulla webapp: il ricavo è sull'**abbonamento
a Byup Fresh**, a consumo di **transazioni**. Il peso dipende da **dove avviene il
pagamento**, con i coefficienti del piano — listino versionato (D-12), non
costanti:

| Canale di pagamento | Coefficiente | Perché |
|---------------------|:----:|--------|
| Da **app consumer** | **ridotto** | Pagamento self-service in app |
| In **cassa** via **App Staff** | **pieno** | Passa dallo staff |
| Da **webapp consumer** | **pieno** | La webapp **non paga**: si salda in cassa (o in app, via recupero — e allora conta come app) |

→ Implicazione: la webapp è la via low-friction per ordinare, ma per il
ristoratore "costa" più di un pagamento da app. È un fatto di contesto, non
una logica che la webapp deve calcolare: il **conteggio è dominio di Byup Fresh**.

---

## 6. Contratto dati della webapp

> Forma attesa dei dati (derivata dal prototipo app), **non** un'API definitiva.
> Qui sono filtrati ai soli campi che riguardano la webapp.
>
> 🔌 **Punto d'integrazione unico: `window.ByupAPI` (`api.jsx`), oggi mock.** Nessun
> componente fa rete da solo. L'elenco **completo** dei comandi (inbound/outbound,
> real-time, pagamento escluso) e la loro mappatura alla UI sono in
> **`byup-contratto-backend-webapp.md`**. Il §6 qui sotto resta la vista d'insieme.

### 6.1 Inbound — cosa la webapp RICEVE dal backend

- **Menu** (da Byup Fresh, per locale):
  - `categories[]` — ordine di rendering (Antipasti, Primi, Secondi, Dolci, Bevande…)
  - `dishes[]`: `{ id, name, price, category, kind, photo, desc, longDesc,
    allergens[], bestSeller, ingredients[], extras[ {id,name,price} ],
    variants[ {id,label,options[]} ], cal, macros, available }`
  - `bestSeller` potrebbe alimentare ★ TOP, ma **oggi la webapp non lo mostra**:
    il campo e il badge "★ BEST SELLER" sono stati rimossi dal prototipo (★ TOP
    assente, coerente con §2.1). Il backend può comunque inviarlo: resta nel
    contratto, semplicemente non viene reso.
- **Sessione tavolo** (real-time, condivisa con l'app):
  - `tableSession`: `{ id, venueId, table, state (Occupato|Libero|Prenotato|Da
    pulire), startedAt, covers }`
  - `guests[]`: `{ id, name, initial, kind }` — per la webapp il proprio kind è
    `isWebApp`
  - `items[]`: `{ lineId, dishId, name, qty, price, ownerId, splitWith[],
    claimedBy }`
  - chiusura sessione: decisa da Byup Fresh / webapp cameriere (passaggio a "Da
    pulire") + backstop a orario chiusura/inattività. **La webapp non chiude la
    sessione**, la subisce.
- **Config locale minima** per la riga/scontrino informativo se mostrato:
  `{ valuta }` (la webapp non emette scontrini fiscali — quello è cassa).

### 6.2 Outbound — cosa la webapp INVIA

- **Join al tavolo**: `{ tableId | code | qrPayload, joinMethod (qr|link|code) }`
  → il backend verifica che esista una **sessione tavolo valida e aperta** (no
  geofence/GPS). Le difese da abuso (rate limiting, gate sessione) sono backend.
- **Aggiunta piatti**: `{ tableSessionId, ownerId, lines[ { dishId, qty,
  variants{}, extras{ extraId:qty }, removed{ ingrediente:true } } ] }`.
- **Checkout (NON pagamento)**: invio dell'ordine al tavolo (`channel:'webapp'`,
  peso **1,0**, da pagare in cassa/app). Il server genera un **codice ordine** per
  il recupero in app; nessuna raccolta di GPS né di telefono al checkout
  (vedi §4.3 e `byup-spec-tecnica-recupero-ordine.md`).

### 6.3 Fuori scope per la webapp (lo fa l'app nativa o il backend)

- **Pagamento / Stripe**, conto diviso, coperti, mancia → **solo app**.
- **Discovery**, mappa, vetrine, Posta, prenotazioni → **solo app**.
- **Account/profilo** (preferenze, preferiti, metodi di pagamento, storico) →
  **solo app**.
- **Conteggio transazioni / fatturazione**, **stato del tavolo** e sua chiusura,
  **insoluti**, **disponibilità slot** → dominio **Byup Fresh / App Staff /
  webapp cameriere**.

---

## 7. Decisioni aperte rilevanti per la webapp

- **Asporto da webapp**: ~~confermare~~ ~~deciso NO~~ **ribaltato: SÌ** (D-14) → si ordina dal browser, saldo in cassa o in app via recupero (§4.4).
- **Geofence/GPS**: ~~requisito~~ **scartato** (§4.1) — difesa spostata su sessione +
  rate limiting + pagamento contestuale lato backend (`byup-punto3-difesa-attacchi.md`).
- **Codice numerico manuale** per unirsi al tavolo (oltre a QR + link): includerlo
  come fallback? (raccomandato sì; la sicurezza non dipende dal geofence ma dal
  gate di sessione, quindi il codice non la indebolisce.)
- Difese anti-abuso lato app (trust progressivo, "paga alla fine", barriere
  d'identità): ancora in discussione (`byup-punto3-difesa-attacchi.md`).

---

## 8. Stato attuale dell'implementazione (cosa fa il codice OGGI)

> Le sezioni §1–§7 descrivono l'**intento di prodotto**. Questa sezione descrive
> il **codice realmente presente in questo repo** (prototipo). Dove i due divergono,
> è segnalato esplicitamente in §10. **Fonte: lettura diretta dei file**, giugno 2026
> (riverificata luglio 2026).

### 8.1 Architettura tecnica

- **Nessun build step.** È un prototipo statico: `index.html` carica React 18 +
  ReactDOM + **Babel Standalone** da CDN (unpkg) e compila i `.jsx` nel browser
  (`type="text/babel"`). Più **Leaflet** (mappa nella vetrina).
- ⚠️ **Come si avvia: serve un server HTTP, NON `file://`.** I `.jsx` sono caricati
  come script esterni che **Babel scarica via fetch**; da `file://` Chrome blocca
  quelle richieste → schermo bianco (nessun menu). Avviare con
  `python3 -m http.server 8000` nella cartella, poi aprire
  `http://localhost:8000/simulator.html` (simulatore) o `…/index.html` (app diretta).
  Doppio click sul file = non funziona. (La webapp vive in `web/` dentro il
  **monorepo byup**: servendo la root del repo gli stessi URL diventano
  `/web/simulator.html` e `/web/index.html`.)
- **Punto d'ingresso runtime**: `index.html` → monta `Root` (in `menu.jsx`) su
  `#menu-root` via `ReactDOM.createRoot`.
- **Backend assente (ma astratto)**: tutto è **dati hardcoded** (locale "Ristorante
  Maria Grazia" / "Al Settembrini", "Tavolo 23", commensali e ordini demo). Nessuna
  chiamata di rete reale, nessuna persistenza oltre a `sessionStorage`. **Le chiamate
  al backend sono però già incanalate in `window.ByupAPI` (`api.jsx`, mock)**: per
  collegare il backend si sostituiscono le implementazioni, non la UI.
- **Ruolo dei file**:
  | File | Ruolo reale |
  |------|-------------|
  | `api.jsx` | **Layer backend** (`window.ByupAPI`): unico punto d'integrazione, oggi **mock**. Comandi inbound/outbound + real-time `subscribe` + `pay()` bloccata. Contratto: `byup-contratto-backend-webapp.md`. |
  | `menu.jsx` | **Cuore della webapp.** `Root` (router + sottoscrizione real-time), `MenuScreen`, `OrderSheet` (con `SwipeDishRow` e `SplitPickSheet` per la divisione), `DishDetailScreen`, `HomeScreen`, `OrderRecoverySheet`, l'**App-only gate**, `TakeawayRedirect` (schermata "scarica l'app" per il QR asporto). |
  | `venue.jsx` | **Vetrina locale** (`window.VenueScreen`): foto, info, FAQ, promo, award, social, mappa "Dove siamo". |
  | `dish-art.jsx` | Illustrazioni SVG dei piatti (`DishArt`). |
  | `index.html` | Bootstrap (carica `api.jsx` → `dish-art.jsx` → `venue.jsx` → `menu.jsx`) + **gate tablet** e **mockup iPhone da desktop** (§8.7). |
  | `simulator.html` | Tool di sviluppo: anteprima multi-dispositivo in iframe (switch Tavolo/Asporto — "Asporto" mostra il redirect — e **PIATTAFORMA iOS/Android** per la schermata di recupero ordine). |

### 8.2 Router e schermate effettive (`Root` in `menu.jsx`)

Routing **a hash** (`#menu`, `#venue`, `#home`) + stato interno. Schermate:

- `menu` → **`MenuScreen`** (schermata principale)
- `venue` → **`VenueScreen`** (vetrina)
- `dish` → **`DishDetailScreen`** (dettaglio piatto)
- `home` → **`HomeScreen`** (card ordine attivo)

### 8.3 Il pattern chiave: **App-only gate**

È il meccanismo con cui la webapp tratta le funzioni "riservate all'app": **non per
omissione**, ma mostrando un popup. `openAppOnly()` lancia l'evento `byup:apponly`;
`AppOnlyHost` (montato una volta nella colonna) apre `AppOnlySheet` → *"Disponibile
nell'app"* con CTA **"Scarica l'app"** (`https://byup.app/download`) e "Continua sul
web". Oggi è agganciato a: **filtri avanzati** (bottone filtri nel menu) e, nella
vetrina, **Prenota**, **Mappa**, **Profilo**. ("Paga ora" **non** apre più il popup
App-only: porta alla `OrderRecoverySheet` di recupero ordine, §8.6.)

> Implicazione di prodotto: le funzioni app-only sono **visibili ma intercettate**.
> Servono da **funnel verso il download dell'app**, non sono semplicemente assenti.

### 8.4 Modalità d'uso e come vengono attivate

| Modalità | Come si attiva | Comportamento |
|----------|----------------|----------------------|
| **`table`** (default) | ingresso "da QR" | ordine va **in cucina** subito |
| **`venue`** | da Vetrina: `?from=venue` o referrer; persiste in `sessionStorage['byup_menu_from']='venue'` | "sto sfogliando, **nessun tavolo**" → mostra il back verso la vetrina |
| **asporto** (QR asporto) | `?takeaway=1` (o `sessionStorage['byup_menu_mode']='asporto'`) | `Root` apre l'ordinazione d'asporto (D-14): `MenuScreen` in variante asporto e `TakeawayHome` col codice di ritiro e il bivio (§4.4) |

Lo switch Tavolo/Asporto in sviluppo si fa dal **simulatore** (`simulator.html`),
non più da un toggle in-app (il vecchio `DevModeSwitcher` è stato rimosso).

### 8.5 Funzionalità realmente presenti nel menu (`MenuScreen` / `OrderSheet`)

- **Navigazione categorie**: tab `Antipasti · Primi piatti · Secondi piatti ·
  Dolci · Bevande` con **scroll-spy** (IntersectionObserver) che evidenzia la tab attiva.
- **Ricerca inline** per piatto/ingrediente (campo testo, non gated).
- **Filtri: nessuno attivo sul web.** Il **bottone filtri** nell'header è solo un
  **funnel App-only** (apre il popup "Disponibile nell'app", non filtra). Non
  esistono più chip dieta né sheet allergeni nella webapp: tutta la logica di
  filtro/ordinamento per dieta o allergeni è stata **rimossa** (era dead code —
  lo sheet non era raggiungibile, quindi lo stato dei filtri non cambiava mai).
  Gli allergeni restano visibili solo come "dots" informativi sul piatto (vedi sotto).
- **Carrello bottom-sheet** (`OrderSheet`) collapsed/expanded. Si apre e si
  chiude **trascinando** la fascia (soglia in px, non un tap sull'intera area);
  il **tap** resta solo sulla lineetta. **La divisione vive nelle righe del
  carrello**, identica all'app consumer (agosto 2026, porting da `app/menu.jsx`):
  swipe **→** manda **una porzione** al tavolo intero, swipe **←** apre il popup
  **"Con chi dividi?"** (`SplitPickSheet`, selezione commensali con quota a
  testa); swipe ripetuto nello stesso verso = annulla (col tavolo subito, con
  una divisione fra persone chiede conferma); la pillola `🍽 Tavolo` / `⑂ N
  pers.` con **×** riporta tutto il gruppo a "per me". Le righe si raggruppano
  per destinazione (`gruppiRiga`) e una riga spezzata mostra solo `×qty` al
  posto del +/-. Le due superfici condividono la regola **e** ora anche la
  meccanica, non il codice.
- **Termini e Privacy**: link in fondo alla vetrina (`venue.jsx`) verso
  `byup.it/termini` e la privacy policy. Piccoli e quieti di proposito, ma
  devono esserci.
- **Personalizzazione piatto** (`DishDetailScreen`): varianti, extra (con quantità),
  rimozione ingredienti → riga carrello `{ lineId, dishId, qty, variants, extras, removed }`.
- **Allergeni** mostrati come "dots" tappabili sul piatto.
- **Coperti**: prompt automatico al **primo ingresso al tavolo** (non da vetrina,
  non asporto), una sola volta → salva `state.coperti`. Nella UI il conteggio è
  etichettato **"partecipanti"** (rename luglio 2026; "coperti" resta solo nello
  stato interno).
- **"Al tavolo"**: sheet con lista commensali (`isMe/isApp/isWebApp/isGuest`) + link
  di condivisione.
- **Conto diviso**: nessuna schermata dedicata — la vecchia `SplitScreen` (modalità
  `me · diviso · tavolo`, route `split`) è stata **rimossa** con l'allineamento
  all'app: la divisione si fa con lo swipe sulle righe del carrello (vedi sopra).
  Il **pagamento** della propria parte porta poi al **recupero ordine in app**
  (`OrderRecoverySheet`, §8.6), non a un incasso web.

### 8.6 Ordine attivo (`HomeScreen`)

Card dell'ordine in corso, **solo stato tavolo**: "Ordine inviato" → *in cucina*.
(Lo stato asporto "in attesa di pagamento" è stato rimosso con l'asporto.)

**Recupero ordine**: "Paga ora" (sulla card) e "Scarica l'app" (banner `DownloadAppPromo`)
aprono la `OrderRecoverySheet` → mostra il **codice ordine** (6 cifre, copiabile) con
schermata differenziata per piattaforma: **iOS** = codice protagonista + App Store;
**Android** = "Scarica" (Play Store, l'ordine si aggancia via Install Referrer) col
codice come fallback in secondo piano. Override DEV: `?os=ios|android`.

"Paga ora" / "Paga solo la tua parte" → **recupero ordine** (sopra) + banner
`DownloadAppPromo` ("salta la fila, scarica l'app"). `genOrderId()` genera l'**ID
ordine** a 5 caratteri alfanumerici (es. `#7K2P9`); il **codice di recupero** a
6 cifre viene da `genRecoveryCode()`.

### 8.7 Gate tablet + mockup iPhone da desktop (`index.html`)

- **Tablet (touch reale)**: quando **entrambe** le dimensioni viewport sono ≥ 600px
  la webapp si nasconde e compare un invito *"Questa funzionalità è pensata per
  dispositivi mobile"*. I telefoni (lato corto < 600px, anche in orizzontale) non
  vengono mai bloccati.
- **Browser desktop** (puntatore fine, niente touch): la webapp non viene più solo
  bloccata — si apre **dentro una cornice iPhone a dimensioni reali 1:1**,
  completamente utilizzabile, con selettore del modello (SE, 14, 15 Pro,
  14 Pro Max). Query param (`?takeaway`, `?os`, …) e hash vengono inoltrati
  all'iframe, quindi ogni link di test resta valido; il gate CSS dei 600px resta
  per i tablet veri.
- In basso a sinistra c'è il bottone flottante **"Home byup"** (`#byup-hub-btn`)
  che torna alla homepage del monorepo (`/`); dentro un iframe (mockup o
  `simulator.html`) viene nascosto.

Resta comunque un vincolo **mobile-only** non citato in §1–§7.

---

## 9. Contratto dati — nota sul prototipo

Le forme dati in §6 restano l'**intento**. Nel codice attuale i dati sono **mock
locali**; non c'è I/O col backend. Le entità coincidono concettualmente
(`activeOrder` con `items[]`/`guests[]`/`covers`, guest con flag tipo, riga
carrello `{dishId,qty,variants,extras,removed}`), ma **non transitano da/verso
un'API**.

---

## 10. ⚠️ Discrepanze intento ↔ codice (da decidere)

Punti in cui §1–§7 (intento) e il codice (§8) **divergono**. Da chiarire prima di
trattare l'una o l'altra come legge:

| Tema | Intento (§1–§7) | Codice attuale (§8) |
|------|-----------------|---------------------|
| **Asporto** | **SÌ da webapp** (D-14): si ordina, saldo in cassa o in app via recupero (§2.2/§4.4) | ❌ **Da allineare**: `?takeaway=1` → `TakeawayRedirect` (CTA "Scarica l'app"), nessuna ordinazione |
| **Geofence / GPS** | scartato (§4.1) | ✅ **Allineato**: rimosso ogni traccia da `menu.jsx`/`simulator.html`/`index.html` |
| **Coperti** | solo app | **Presenti** (prompt coperti al tavolo) |
| **Conto diviso** | solo app | **Presente** in UI (swipe sulle righe del carrello + `SplitPickSheet`, identico all'app); solo il *pagamento* è gated |
| **Vetrina/discovery** | solo app | **Vetrina locale presente** (`VenueScreen` con mappa); prenota/mappa/profilo gated |
| **Pagamento** | non esiste sul web | **UI "Paga ora" presente ma non incassa**: apre il recupero ordine in app (coerente con "si paga in cassa/app") |
| **Recupero ordine webapp→app** (§4.3, `spec-tecnica`) | codice ordine + install referrer + banner | ⚠️ **Parziale (lato webapp)**: `OrderRecoverySheet` in `menu.jsx` mostra il **codice ordine** copiabile e la schermata differenziata iOS/Android (override DEV `?os=ios\|android`). Mancano i pezzi backend/app: generazione server del codice, **Install Referrer** Android e **banner** all'apertura dell'app |
| **Divisione real-time** (`punto4`) | conto unico, broadcast, quote | ⚠️ **Parziale**: UI divisione + seam `ByupAPI.updateSplit`/`subscribe` (mock) pronti lato webapp; mancano saldo unico, broadcast vero, ricalcolo quote e **lock** di pagamento (backend) |
| **Pagamento** dalla webapp (`punto4`) | **mai** sul web | ✅ **Allineato**: `ByupAPI.pay()` bloccata; "Paga ora" → recupero ordine in app |
| **Account** | nessuno | coerente: nessun login/registrazione nel codice |

> Lettura più probabile: §1–§7 è la **visione target/di prodotto**, mentre il repo è
> un **prototipo UI** che esplora anche scenari (asporto, coperti, split, vetrina)
> che il prodotto potrebbe voler tenere app-only. **Confermare con il prodotto**
> quali di queste restano nella webapp prima di costruirci sopra.

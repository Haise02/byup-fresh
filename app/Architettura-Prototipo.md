# byup — Architettura del prototipo (React no-build)

> 📍 **byup-Docs** › Architettura del prototipo · [Indice](README.md)
>
> Questo file è il **come** del prototipo attuale (React + Babel nel browser).
> Valido finché si lavora su questo repo; **da non trasportare** in Flutter — il
> codice è "usa e getta", serve solo a validare UX/UI. Le **scelte di prodotto**
> (il *perché*) stanno in [Contesto-App.md](Contesto-App.md).
>
> **Collegamenti**
> - Contesto di prodotto (visione, requisiti, modello backend) → [Contesto-App.md](Contesto-App.md)
> - Contratto dati (forme I/O col backend) → [Contratto-Dati.md](Contratto-Dati.md)
> - I §1–§13 qui sotto sono citati da [Contesto-App.md](Contesto-App.md) (es. "Architettura-Prototipo §9").

---

## 1. Il modello mentale in 30 secondi

- **Niente bundler, niente `npm`, niente `import`/`export`.** Le pagine HTML
  caricano React e **Babel Standalone** da CDN e transpilano i `.jsx`
  direttamente nel browser (`<script type="text/babel">`).
- I file **non si importano tra loro**: si parlano tramite **variabili globali su
  `window`**. Ogni file pubblica i suoi componenti con `Object.assign(window, {…})`
  o `window.X = …`, e gli altri li leggono come `window.X` (spesso con guardia
  `const B = window.BottomTabBar; return B ? … : null`).
- Il prototipo è ormai **un'unica SPA**: `byup Home.html` carica **tutti** i
  moduli (menu compreso) e l'esperienza al tavolo è una **pagina della SPA**
  (`page === 'menu'` → `window.MenuApp`). Esiste ancora un secondo entry point
  (`byup Menu.html`, solo menu, con un suo mount) e il **cambio pagina vero**
  (`window.location.href`) sopravvive come **fallback** quando si gira da lì; lo
  stato cross-schermata viaggia via **URL params** e
  **sessionStorage/localStorage**.

Conseguenze pratiche (importanti):
- **L'ordine dei `<script>` nell'HTML conta**: un file può usare `window.X` solo
  se chi lo definisce è stato caricato prima (o se l'accesso avviene a runtime
  dentro un componente, non al top-level).
- Le costanti condivise (colori, ecc.) sono **ridefinite in più file** perché non
  c'è un modulo comune. Vanno tenute allineate a mano.

---

## 2. I due entry point (SPA completa + pagina menu standalone)

| HTML | Root mount | Root component | Scopo |
|------|-----------|----------------|-------|
| `byup Home.html` | `#root` | `Root` in [app.jsx](app.jsx) | **SPA completa**: onboarding/auth, home, mappa, posta, profilo, vetrina locale, ricerca, Byuppini/Roadmap **e** l'esperienza al tavolo/asporto (pagina `menu` → `window.MenuApp`) |
| `byup Menu.html` | `#menu-root` | `Root` in [menu.jsx](menu.jsx) | **Solo esperienza al tavolo / asporto** standalone: menu, dettaglio piatto, carrello, divisione conto, pagamento |

Script caricati (vedi `<body>` dei due HTML), in ordine:

- **Home**: `byup-app-kit → ios-frame → extras → venue-variants → map → auth → app → dish-art → menu`
- **Menu**: `byup-app-kit → ios-frame → extras → venue-variants → map → app → dish-art → menu`

[byup-app-kit.jsx](byup-app-kit.jsx) va caricato **per primo**: espone
`window.ByupKit` (token, temi light/dark, mascotte, primitive) usato da tutti
gli altri moduli. `app.jsx` viene caricato anche dentro `byup Menu.html`: serve
solo per **riusare le sue globali** (`BottomTabBar`, `Icon`, costanti tema). Il
suo `ReactDOM.createRoot` punta a `#root`, che **non esiste** in `byup
Menu.html`, quindi quella `Root` non si monta lì (mount no-op). Specularmente
`menu.jsx` dentro `byup Home.html` non monta nulla (`#menu-root` non esiste):
espone `window.MenuApp`, che `app.jsx` renderizza come pagina `menu` della SPA.
Il mount di `#menu-root` è in fondo a [menu.jsx](menu.jsx).

---

## 3. Responsabilità dei file

| File | Pubblica su `window` | Contenuto |
|------|----------------------|-----------|
| [byup-app-kit.jsx](byup-app-kit.jsx) | `ByupKit` (token `PALETTE/THEMES/TYPE/RADII`, `useByupTheme`, `Mascot/MascotMoment`, `GlassPanel`, `PillButton`, registry `ASSETS`, …) | **Design system condiviso**: temi light/dark, font (Fredoka + Hanken Grotesk), mascotte, primitive. Caricato per primo |
| [ios-frame.jsx](ios-frame.jsx) | `IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSKeyboard` | Primitive UI iOS. `IOSDevice` è la **cornice iPhone** (402×874) su desktop; su mobile (≤560px) l'app va **a tutto schermo** senza cornice |
| [dish-art.jsx](dish-art.jsx) | `DishArt` | Illustrazioni SVG generate (placeholder quando non c'è foto) |
| [extras.jsx](extras.jsx) | `ProfileScreen, VenueScreen, BookingSheet` | Profilo, scheda locale, sheet prenotazione, preferenze allergeni/diete |
| [venue-variants.jsx](venue-variants.jsx) | `VenuePremium` | **Stile di vetrina** premium della scheda locale — vedi §3.1 |
| [map.jsx](map.jsx) | `MapScreen, PostaScreen` | Mappa locali (Leaflet + markercluster) e "Posta"/novità |
| [auth.jsx](auth.jsx) | `AuthFlow, AuthPermissions` | Onboarding, login, registrazione, Face ID, permessi iOS |
| [app.jsx](app.jsx) | `BottomTabBar, HomeSections, Icon, PINK, PINK_DARK, TEXT, MUTED, BORDER, BG_GRAY` + router globale `__byupNav`/`__byupQR` | Guscio SPA + gate di auth (`Root`): Home, Cerca (`SearchScreen`), Byuppini (`ByuppiniScreen`), Roadmap (`RoadmapScreen`), dispatch pagine |
| [menu.jsx](menu.jsx) | `MenuApp` (+ monta `#menu-root` in `byup Menu.html`) | Tutta l'esperienza al tavolo/asporto, renderizzata dalla SPA come pagina `menu` |

### 3.1 Stili di vetrina (scelti dal gestionale)

La **vetrina locale non è una schermata sola**: è uno **stile** scelto per quel
locale. Il modello di prodotto è: il ristoratore sceglie lo stile della propria
vetrina dal **gestionale**, e il backend lo invia insieme ai dati del locale;
l'app mostra lo stile corrispondente. **Non sono A/B test né dead code** — sono
template di vetrina selezionabili.

Siccome questo è un **prototipo senza backend**, lo stile si forza così:

- URL `?venue=original|premium` sulla Home, oppure
- `window.__venueVariant = 'original'|'premium'` da console.

Il **dispatcher** è `VenueScreen` in [extras.jsx](extras.jsx): legge lo stile e
monta il componente giusto. Default = `original`. Eccezione: lo stile
`premium` scatta anche **in automatico** quando il locale ha il flag
`premium` nei suoi dati (locali selezionati da byup).

| Stile | Componente | Dove | Carattere |
|-------|-----------|------|-----------|
| `original` (default) | `VenueOriginal` | [extras.jsx](extras.jsx) | Classico — la vetrina storica |
| `premium` | `VenuePremium` | [venue-variants.jsx](venue-variants.jsx) | Premium byup (anche automatico se `venue.premium`) |

Note per chi mette mano:
- Lo stile **default vive in `extras.jsx`** (non in `venue-variants.jsx`) perché è
  la vetrina originale e riusa helper locali come `VenueMapThumbnail`. Lo stile
  `premium` sta in `venue-variants.jsx` con i propri dati (`PREMIUM_MENU`,
  `PREMIUM_HOURS`, `PREMIUM_REVIEWS`).
- Fino al 2026-07-28 esistevano altri tre stili sperimentali (`a` Editorial,
  `b` Cinematic, `c` Operativo, in `venue-variants.jsx`): sono stati rimossi
  perché non sono mai entrati nel prodotto.

---

## 4. Navigazione (tre livelli diversi!)

Non c'è un router unico. Coesistono **tre meccanismi**:

### 4.1 Router globale `__byupNav` (SPA) + cambio pagina come fallback
Dentro la SPA (`byup Home.html`) si naviga **senza reload**: `app.jsx` espone
`window.__byupNav = { go(page), home(), venue() }` (riassegnato a ogni render) e
il menu usa l'helper `__goApp(page, params)` ([menu.jsx](menu.jsx)) che vi si
appoggia; i parametri extra (es. `view`/`order` per il Profilo) vengono messi in
querystring con `history.replaceState`. Se `__byupNav` **non c'è** (si sta
girando la pagina standalone `byup Menu.html`) si torna al **cambio pagina
vero** con `window.location.href`. Esempi:
- `byup Menu.html?from=venue` — apri il menu standalone arrivando dalla vetrina
- `byup Home.html?page=venue` — Home già sulla scheda locale
- `byup Home.html?page=profile|map|posta|search|byuppini|roadmap|menu`

### 4.2 Home app = **stack di navigazione** ([app.jsx](app.jsx) `App`)
- `navStack` è un array; `setPage(p)` fa push, `goBack()` fa pop, `resetToHome()`
  riazzera a `['home']`.
- Inizializzato dall'URL: `?page=venue|profile|map|posta|search|byuppini|menu` →
  `['home', p]`; `?page=roadmap` → `['home', 'byuppini', 'roadmap']`;
  `?page=home-empty` → `['home-empty']`.
- La freccia "indietro" in alto a sinistra chiama sempre `goBack()`.

### 4.3 Menu = **route singola `{name, ctx}`** ([menu.jsx](menu.jsx) `MenuApp`)
- `goTo(name, ctx)` imposta `route = { name, ctx }`. `ctx` è il payload (es.
  `goTo('dish', { dishId, perTe:true })`).
- `name` ∈ `menu | split | dish | home | pay | paymethod | balance | success | takeaway`.
  (`balance` = **schermata Saldo del tavolo**, oggi raggiungibile solo via hash —
  vedi §9.2.)
- Route iniziale: dalla prop `initial` (la SPA la passa via
  `sessionStorage.byup_menu_route`, es. la card "Paga in un tap" della Home apre
  direttamente `paymethod`), altrimenti dall'**hash** dell'URL (`#pay`,
  `#success`, …) se valido, altrimenti `menu` (o `home` in demo takeaway).

---

## 5. Parametri URL e chiavi di storage

### Query / hash riconosciuti
| Param | Dove | Effetto |
|-------|------|---------|
| `?page=venue\|profile\|map\|posta\|search\|byuppini\|roadmap\|menu\|home-empty` | Home | Apre direttamente quella schermata (salta auth) |
| `?venue=a\|b\|c\|original\|premium` | Home | **Stile di vetrina** da mostrare (vedi §3.1). Default `original` |
| `?view=orders\|allergens\|…` | Home (Profilo) | Apre una **sotto-vista del Profilo**. Consumato e poi rimosso dall'URL |
| `?order=<id>\|recent` | Home (Profilo) | Ordine da **espandere** nello Storico ordini. `recent` = il più recente |
| `?add=1` (con `view=pagamenti`) | Home (Profilo) | Apre subito **"Aggiungi metodo di pagamento"**. Usato da Menu › Metodo pagamento → "Aggiungi carta" |
| `?from=venue` | Menu | Segna che si arriva dalla vetrina (vedi `fromVenue`) |
| `?auth=login\|register` | Home | **Forza** il flusso di auth anche se già loggato |
| `?takeaway=1` | Menu | Demo: precarica un ordine d'asporto già pagato |
| `#menu\|#home\|#pay\|…` | Menu | Route iniziale del menu |

### localStorage
| Chiave | Scritta in | Significato |
|--------|-----------|-------------|
| `byup_auth` | [app.jsx](app.jsx) | `'1'` = login/registrazione completati → salta tutto l'onboarding |
| `byup_perms` | [app.jsx](app.jsx) | `'1'` = permessi (notifiche+posizione) già decisi |
| `byup_faceid` | [auth.jsx](auth.jsx) | `'1'` = Face ID attivato a fine registrazione |
| `byup_booking` | [extras.jsx](extras.jsx)/[app.jsx](app.jsx) | Prenotazione corrente — **volutamente cancellata a ogni refresh** (vive solo nella sessione) |
| `byup_allergens` | [extras.jsx](extras.jsx) | Preferenze persistenti `{ allergens:{}, diets:{} }` del profilo |
| `byup.themeMode` | [byup-app-kit.jsx](byup-app-kit.jsx) | Tema: `light` \| `dark` \| `auto` (vedi §11) |

### sessionStorage
| Chiave | Significato |
|--------|-------------|
| `byup_menu_from` | `'venue'` se il menu è stato aperto dalla vetrina; sopravvive ai re-render ma non alla chiusura tab |
| `byup_menu_route` | Route iniziale con cui la SPA apre la pagina `menu` (es. `paymethod`); consumata al mount di `MenuApp` |
| `byup_menu_premium` | `'1'` se il menu è stato aperto da una vetrina/locale **premium** (accenti diversi) |
| `byup_menu_dish` | Deep-link a un piatto dal "I più ordinati" della vetrina: il menu si apre **già scrollato** su quel piatto (flash del bordo) |
| `byup_table` | Pagamenti già fatti in sessione (`settled`/`paidLineIds` + residuo): ri-idrata `MenuApp` a ogni rientro e alimenta la card "tavolo aperto" in Home |
| `byup_coperti` | N° coperti confermato (la SPA smonta `MenuApp` tornando in home: senza persistenza andrebbero richiesti) |
| `byup_byuppini_seg` | Segmento Byuppini da aprire (es. `tra` = Traguardi, usato da Roadmap → Traguardi) |

---

## 6. Auth gate & permessi ([app.jsx](app.jsx) `Root`, [auth.jsx](auth.jsx) `AuthFlow`)

Logica del gate in `Root`:
1. Se `?auth` è presente → **forza** l'auth (`authed=false`).
2. Altrimenti `authed = byup_auth==='1' || c'è un ?page deep-link`. Cioè un
   deep-link a una pagina interna **salta l'onboarding**.
3. A fine auth `completeAuth(opts)`:
   - scrive `byup_auth='1'`, monta l'`App`;
   - **mostra i popup permessi** (`AuthPermissions`) se non già decisi **oppure**
     se si arriva da una registrazione (`opts.fromRegister`), nel qual caso
     azzera `byup_perms` per riproporli.

`AuthFlow` segnala la provenienza:
- login / social → `onAuthenticated({ fromRegister:false })`
- schermata di successo registrazione → `onAuthenticated({ fromRegister:true })`

Flusso registrazione: `splash → login → register → enroll (Face ID) → success`.
I popup permessi (`AuthPermissions`) sono **alert iOS finti** (`IOSAlert`) in
sequenza: notifiche → posizione.

> ⚠️ Per ritestare l'onboarding da zero servono entrambi:
> `localStorage.removeItem('byup_auth'); localStorage.removeItem('byup_perms');`
> (`byup_auth` da solo lascerebbe comunque saltare l'auth).

**Logout** (Profilo → "Esci"): apre un bottom-sheet di conferma; confermando,
`ProfileScreen` rimuove `byup_auth` e fa `window.location.href = 'byup
Home.html?auth=login'` → la `Root` rivede `?auth=login` e mostra il login. I dati
utente (preferenze, ecc.) **non** vengono cancellati (a differenza di "Elimina
account").

---

## 7. Stato dell'esperienza al tavolo ([menu.jsx](menu.jsx) `MenuApp`)

Tutto lo stato del menu vive in **un unico oggetto** `state` (useState in
`MenuApp`) passato giù come `state`/`setState`. Campi principali:

- `cart` — array di **righe carrello** (vedi §8)
- `splits` — divisioni di singoli piatti
- `coperti` / `copertiSelected` — n° coperti e se sono già stati confermati
  (persistiti in `sessionStorage.byup_coperti`, vedi §5)
- `activeOrder` — ordine al tavolo in corso (dati demo hardcoded, vedi §9)
- `takeawayOrder` — ordine d'asporto (demo se `?takeaway=1`)

> `activeOrder` e `demoTakeaway` sono **dati demo cablati** in `MenuApp` per
> popolare le schermate: non vengono da un backend. Poiché la SPA **smonta**
> `MenuApp` quando si torna in home, al mount lo stato pagamenti viene
> ri-idratato da `sessionStorage.byup_table` (righe già saldate + residuo).

---

## 8. Modello del carrello e personalizzazione piatto

Riga del carrello:
```js
{ lineId, dishId, qty, variants, extras, removed }
```
- `lineId = dishId + '-' + Date.now()` → **ogni aggiunta è una riga distinta**.
  Questo è voluto: due "stesse" pizze con personalizzazioni diverse restano
  separate. `addDish` (quick-add dalla card) invece **accorpa** le righe senza
  varianti/extra/rimozioni.
- `extras` = `{ extraId: qty }`, `removed` = `{ ingrediente: true }`,
  `variants` = scelte di variante.

Dettaglio/personalizzazione piatto (`DishDetailScreen`):
- Riceve `ctx` con `dishId`, l'eventuale flag `perTe` (badge, §10) e — se aperto
  **da una riga del carrello** — il `lineId` di quella riga (**modalità modifica**).
- **In aggiunta** (piatto nuovo dal menu): selettore **quantità** (`qty`, min 1)
  in basso + CTA "Aggiungi all'ordine" con totale `(prezzo+extra)*qty`. In
  **modifica** lo stepper quantità libero **non c'è** (vedi sotto) e la CTA è
  "Aggiorna ordine".
- **Separazione dei compiti**: la **quantità** si cambia **nel carrello**; il
  dettaglio in **modifica** serve a cambiare la **personalizzazione**. Per questo
  in modifica **non c'è lo stepper quantità** (resta solo in *aggiunta*).
- **Fork esplicito** (solo in modifica, solo se la riga ha `qty = n > 1`): nella
  barra CTA compare la domanda *"A quante porzioni applicare le modifiche?"* con
  uno stepper **"m di n"** (m ∈ `1..n`, default `n`). Alla conferma ("Aggiorna
  ordine"):
  - `m = n` → **tutta** la riga aggiornata **in place** (mantiene la posizione);
  - `m < n` → **fork**: `m` porzioni con la nuova personalizzazione, `n − m`
    restano com'erano;
  - se la personalizzazione **non cambia**, le porzioni si **ri-fondono** (merge
    per `dishId` + `variants`/`extras`/`removed` identici) → no-op.
- Niente "aggiungi oltre n" e niente rimozione da qui: per aggiungerne di più o
  togliere si usa il **carrello**. Per personalizzazioni totalmente diverse si
  **aggiunge dal menu** (righe distinte per `lineId`).
- **"Spesso ordinato con"** (suggeriti nel dettaglio): tap sulla card = aggiunge
  (`addDish`, accorpa sulla **riga liscia** del piatto); quando è in carrello la
  card mostra uno stepper `− qty +` (`removeDish` riduce e **rimuove a 0**).
  Agisce sempre sulla riga **senza personalizzazioni** del suggerito.
- **Allergeni** (`AllergenDots`): nelle card-menu sono limitati a **3 dot + "+N"**
  (prop `max`) e vanno a capo (`flexWrap`), per non collidere col counter di riga.

---

## 9. Modello ordine al tavolo, conto diviso, coperti

> Logica di **prodotto** del saldo unico, lock e modalità di divisione →
> [Pagamenti-Divisione.md](Pagamenti-Divisione.md). Qui sotto il modello **del
> prototipo** (dati demo cablati).

L'`activeOrder` è il cuore della logica di **pagamento condiviso**. Campi per
item:
- `ownerId` — chi ha ordinato: `'me'`, un id ospite (`'g1'`, `'g2'`, …) o
  `'table'` (piatti del tavolo / aggiunti dal cameriere). I piatti del tavolo
  nella demo sono **tutti singoli** (`qty: 1`).
- `splitWith` — array di id con cui l'item è diviso (la quota è
  `prezzo / (splitWith.length + 1)`, vedi `myShareOf`).
- `claimedBy` — id di chi si è preso un item del tavolo (mostrato come "già preso").

Stato di pagamento — **saldo a importi parziali**:
- `paidLineIds` — mappa `lineId → payerId` di righe **saldate per intero**
  (`isPaid(lineId)`). Nella demo Marco (`g1`) ha già pagato i suoi piatti.
- `settled` — mappa `lineId → importo già pagato` (può essere una **quota**, non
  l'intero). Helper module-level: `seedSettled(order)` (parte dai `paidLineIds`
  come full), `lineRemaining(order, it)` = `prezzo·qty − pagato`,
  `tableRemaining(order)` = somma dei residui, `applyPayments(setState, [{lineId,
  amount}])` (somma le quote, ricalcola `paidLineIds` per le righe ormai coperte).
- `lockedLineIds` — mappa `lineId → payerId` di righe **in pagamento adesso** da
  un altro (lock real-time, `isLocked`): congelate e non selezionabili.

Ospiti (`guests`) con flag di tipo: `isMe`, `isApp` (app nativa),
`isWebApp` (web), `isGuest` (ospite non loggato).

### 9.1 `PaymentScreen` — "Il tuo conto"

Modalità (`mode`): `'mine'` (i tuoi piatti + quote + coperto) o `'all'` (tutto il
tavolo). Sezioni:
- **"Tu"** → i miei piatti non ancora saldati (`myItems`, con quota `myShareOf`
  per i piatti divisi) più i piatti presi in carico (`selectedExtras`). In
  `mode='all'` l'intestazione diventa **"Tu · offri il tavolo"** e la lista copre
  tutto l'ordine.
- **"Il tavolo"** → una **card per commensale** in gerarchia **utenti app →
  utenti webapp → "Altro"** (contenitore unico: piatti messi dal cameriere +
  porzioni di chi non usa né app né webapp). Il **"+"** su una riga chiama
  `toggleExtra` → il piatto va sul tuo conto (la card mostra anche
  "Aggiungi tutto"). Lock: righe pagate / in pagamento / già prese da altri
  (`claimedBy`) restano visibili ma non selezionabili (`canAdd`).
- **Divisione dei piatti presi dal tavolo**: pulsante **"Dividi"** → popup con
  `tableSplits[lineId]` = `{kind:'table'}` (parti uguali tra tutti) o
  `{kind:'split', people}` (con alcuni). La quota è `extraShareFor(it)`.
- Coperto = `COVER (=2€) × covers`; `covers = order.covers || guests.length || 1`.
- Tip nello sheet **"Dettagli pagamento"** (`baseForTip = subtotal + coperto`),
  in **due modalità mutuamente esclusive**: percentuale (`tipPct` 5/10%) o
  **arrotondamento** (`tipRound`) = `ceil(baseForTip) − baseForTip`. Lì c'è anche
  la riga **metodo di pagamento**.
- **CTA = `SlideToPay`** (slide-to-pay, non un semplice bottone): il tap sul
  pomello cicla `ctaMode` `'mine'` ↔ `'all'`; `'split'` ("Alla romana": quota
  `1/N` del rimanente tra chi non ha pagato) esiste nel codice ma è fuori dal
  ciclo. `payNow`: per `mine`/`split` nessun popup di conferma → **overlay di
  caricamento** (~5s) poi `proceed()`; per `'all'` (importo ben più grande,
  irreversibile) serve una **conferma esplicita** (`confirmAll`). `proceed`
  registra i pagamenti per-riga con la quota effettiva via `applyPayments` e va
  **sempre a `success`**: l'eventuale residuo del tavolo resta visibile nella
  home (card ordine attivo, "Salda il resto"). È l'**unico** punto di pagamento
  dine-in.
- **Metodo di pagamento** (`state.payMethod`, default `'apple'`): la riga nello
  sheet dettagli mostra il metodo scelto; "Cambia" → `PayMethodScreen`, che
  **dine-in non paga**: conferma solo il metodo (CTA "Conferma metodo" → salva
  `payMethod` e torna a `pay`). L'opzione **"Aggiungi carta"** naviga a
  Profilo › Pagamenti col form "Aggiungi metodo" già aperto (via `__goApp` —
  interno alla SPA senza reload; da `byup Menu.html` standalone resta il salto
  di pagina a `byup Home.html?page=profile&view=pagamenti&add=1`). Il ramo
  **takeaway** invece paga e crea l'ordine.
  > ℹ️ **Solo limite del prototipo.** Anche dentro la SPA, navigare al Profilo
  > **smonta** `MenuApp` (lo stato pagamenti sopravvive solo via
  > `sessionStorage.byup_table`/`byup_coperti`) e dopo l'aggiunta della carta
  > non c'è ritorno automatico al conto — l'utente torna manualmente.
  > **Nell'app Flutter da sviluppare è previsto il contrario**: stack di
  > navigazione nativo → aggiunta la carta, l'utente viene **riportato
  > automaticamente al conto (ritorno guidato)** con carrello/pagamento/metodo
  > intatti. Vale anche per "Vedi scontrino": la frammentazione è un artefatto
  > del mockup, non il comportamento di prodotto.
- Header (back + titolo + strip avatar) è una **barra fissa** in alto, fuori dallo scroll.

### 9.2 `BalanceScreen` — saldo del tavolo (route `balance`)

> ⚠️ **Non più nel flusso principale.** Dopo un pagamento parziale oggi si va
> **sempre a `success`** e il residuo si gestisce dalla **home** (card ordine
> attivo → "Salda il resto" → di nuovo `pay`; nella Home della SPA c'è anche la
> card "tavolo aperto" alimentata da `sessionStorage.byup_table`). La schermata
> esiste ancora ed è raggiungibile via hash `#balance`.

Mostra:
- **"Manca al tavolo €X"** (`tableRemaining`) + n° articoli ancora da saldare.
- Accordion **"Piatti da saldare"**: **esclude i miei piatti** (già saldati);
  ordine **tavolo → altri commensali**, con i **lockati in fondo**. Ogni riga:
  checkbox, residuo (`lineRemaining`, "rimasti" se parziale), `splitWith` →
  "diviso con {nomi}", avatar del proprietario (**tap = nome**) o chip "Al tavolo".
  Righe lockate: lucchetto, non selezionabili, "{nome} sta pagando…". C'è un
  **"Seleziona tutti"** (solo i selezionabili).
- Selezione multipla + barra in basso con modalità **[Pago io / Dividi con… / Per
  il tavolo]** → secondo pagamento (overlay 5s) → torna a `balance` aggiornato.
- Quando il residuo **azionabile** va a 0, i lockati si considerano chiusi in
  parallelo dagli altri → saldo a 0 → **`success`**.

**Coperti**: il numero di commensali **non si chiede più all'ingresso al
tavolo** (l'utente non sa ancora se dividerà il conto e lo saltava): il numero
arriva da `order.covers` e si gestisce dalla sheet **"Al tavolo"** (lista
commensali, aggiungi/rimuovi ospiti — `covers` segue il totale). La
`CopertiSheet` con `askCoperti`/`confirmCoperti` esiste ancora in `MenuScreen`
ma non viene più invocata; il valore confermato persiste in
`sessionStorage.byup_coperti` (vedi §5, §7).

**`fromVenue`** è dedotto da più fonti (in OR): `?from=venue`, il `document
.referrer` che è la vetrina, oppure `sessionStorage.byup_menu_from === 'venue'`.

---

## 10. Logica di raccomandazione dei piatti & badge

Tre "segnali" su un piatto, con **priorità badge: ★ TOP > badge dieta > ✨ Per te**.

- **★ TOP** ("I più ordinati"): i piatti con `bestSeller: true`. La sezione mostra
  i **primi 4**. Badge nero `★ TOP`. Anche nel dettaglio piatto (hero image).
- **✨ Per te** ("In base ai tuoi gusti"): calcolato in `perTeIds`
  ([menu.jsx](menu.jsx), scope di `MenuScreen`): partendo da `ALL_DISHES`,
  **esclude i primi 4 bestseller**, rispetta i filtri allergeni e la dieta,
  prende i **primi 6**. Badge color `WINE`.
  - `perTeIds` è calcolato **una volta** a livello di componente così lo stesso
    insieme è riusabile in: sezione "Per te", **card di categoria** e **hero del
    dettaglio** (passando `goTo('dish', { dishId, perTe:true })`).
  - Nelle card "Per te" compare **solo se** il piatto non ha già `★ TOP` né badge
    dieta (badge "di riempimento", niente card con più badge).
- **Badge dieta** (🌱 Veg / 🌿 Vegan / 🌾 Senza glutine): mostrato quando un
  filtro dieta è attivo e il piatto lo soddisfa.

**Filtri**:
- `allergenFilters` (`{ glutine:true, … }`) **NASCONDONO** i piatti che li
  contengono.
- `dietFilter` (`veg|vegan|gf`) **ordina** e marca i piatti compatibili.
- Le preferenze persistenti del profilo stanno in `byup_allergens`
  ([extras.jsx](extras.jsx)); i filtri attivi nel menu sono di sessione.

**Barra categorie & tab "Byup"** ([menu.jsx](menu.jsx), `MenuScreen`):
- Due elenchi distinti: `tabs` = categorie reali (`Antipasti`, `Primi piatti`,
  …) usate per **renderizzare le sezioni**; `navTabs = ['Byup', ...tabs]` usato
  solo per la **barra di navigazione** in alto.
- **"Byup" non è una categoria di piatti**: è una voce extra (la prima, a
  sinistra di "Antipasti") che punta alla sezione **"I più ordinati"**. Il loop
  che genera le sezioni usa `tabs`, quindi "Byup" non crea una sezione vuota.
- Meccanica: ogni sezione ha `ref` in `sectionRefs.current[<nome>]` + `data-cat`.
  La sezione "I più ordinati" è registrata sotto la chiave `'Byup'`. Il tap su
  una tab chiama `scrollToTab` (scroll via `getBoundingClientRect`), e un
  `IntersectionObserver` evidenzia la tab della sezione in vista.
- "I più ordinati" si renderizza solo se **non** c'è una ricerca attiva: durante
  la ricerca la tab "Byup" resta visibile ma senza bersaglio (innocuo).

---

## 11. Tema, colori, illustrazioni

- **Design system in [byup-app-kit.jsx](byup-app-kit.jsx)** (`window.ByupKit`):
  palette brand (`coral #E32459`, `wine #4D122E`, `lime #CEFF00`, …), **temi
  light/dark** (`THEMES` + `useByupTheme`; scelta persistita in
  `localStorage.byup.themeMode` = `light|dark|auto`) e font **Fredoka**
  (display) + **Hanken Grotesk**. Il dettaglio è in
  [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
- **Due palette accent**: la Vetrina/Home usa **PINK** `#E32459`; il Menu usa
  **WINE** (`#8B1A3A` in light, `#ef6389` in dark). I neutri sono **theme-aware**
  via la costante `__BYUP_DARK` letta al load (es. `TEXT #1c0f15`/`#f6ece9`,
  `MUTED #6d5a61`, `BORDER #eddfda` in light) e restano **ridefiniti in ogni
  file** (no modulo comune, a parte `ByupKit`) → tenerli allineati.
- **Foto piatti/locali**: quando non c'è una `photo` reale, si generano
  illustrazioni SVG via `DishPhoto`/`DishArt` parametrizzate da `tone` e `kind`.
- **Stelle di valutazione — stile unico (due livelli)**. Stesso glifo (polygon
  `12 2 15.09 8.26 …`) e colore **PINK `#E32459`** ovunque:
  - **Tessera** (riquadro arrotondato pink + stella **bianca**) per i rating
    *protagonisti*: hero "Recensione media" della vetrina (`VenueOriginal`) e
    schermata di **successo pagamento** (`SuccessScreen`).
  - **Stella piena** pink (vuota `#e0d8db`) per gli **inline**: card recensioni,
    filtro "Valutazione minima", badge `★ voto` sulle card locale (`Icon.Star`),
    rating "Segnala un problema".
  - **Fuori standard di proposito**: i rating dentro `venue-variants.jsx`
    (stili vetrina A/B/C, oro `#FFD75C`/`#f5b400`) hanno la **loro** palette; i
    pin mappa usano `venue.color` (★ tipografico). Non uniformarli senza motivo.

---

## 12. Cornice iOS e aiuti di sviluppo

- `IOSDevice` avvolge **ogni** schermata: su desktop è la **cornice iPhone**
  402×874 (dynamic island, home indicator); su mobile (≤560px) niente mockup —
  l'app occupa **tutto lo schermo** come un'app vera (safe-area via
  `--byup-sat` + striscia blur sopra la status bar).
- `ShortcutsPanel` ([app.jsx](app.jsx)) e la nav `.byup-screen-nav` sono
  **scorciatoie di sviluppo** per saltare tra schermate; vengono nascoste sotto
  i 768px via CSS.
- `data-screen-label="…"` su ogni schermata serve da etichetta per quegli
  strumenti di navigazione.
- `ShortcutsPanel` include un **toggle "Vetrina · stile"** (chip
  Classico/A/B/C/★ Premium) per passare al volo tra gli stili di vetrina: ogni
  chip linka a `?page=venue&venue=<stile>`. È solo uno strumento di sviluppo per
  **vederli tutti** — in produzione lo stile arriva dal gestionale (vedi §3.1).

---

## 13. Trappole & promemoria

- **Modifichi una globale condivisa?** Ricorda che è ridefinita altrove (colori)
  o che dipende dall'**ordine di caricamento** degli script.
- **Aggiungi un componente cross-file?** Esponilo su `window` e leggilo con la
  guardia `const X = window.X; return X ? <X/> : null`.
- **Stato che non deve sopravvivere al refresh** (es. prenotazione) →
  pattern `byup_booking`: si pulisce in un `useEffect` di mount.
- **Testare onboarding/permessi** → svuotare `byup_auth` **e** `byup_perms`.
- **Le route del menu** rispondono all'hash: link diretti tipo `…Menu.html#pay`
  funzionano.
- **`activeOrder`/takeaway** sono **demo cablate**: non cercare un backend.
- **"Vedi scontrino" → Storico ordini (dinamica).** Lo scontrino per l'utente
  **non** è una schermata a sé: è l'**ordine nello Storico ordini** (Profilo,
  Home app). Dalla schermata di pagamento riuscito, "Vedi scontrino" naviga a
  Profilo › Storico con `__goApp('profile', { view:'orders', order:… })`
  (interno alla SPA, parametri lasciati in querystring; da `byup Menu.html`
  standalone è un cambio pagina a
  `byup Home.html?page=profile&view=orders&order=<id>`) e apre quell'ordine
  **già espanso**.
  - **Come dovrebbe funzionare col backend**: a pagamento riuscito l'ordine viene
    **persistito** nello storico dell'utente (con righe, totale, mancia, data,
    locale); il backend restituisce il suo **id**, e la app naviga allo storico
    passando *quell'*id → l'utente vede esattamente l'ordine appena pagato. App
    Menu e app Home leggono lo **stesso** storico dal backend.
  - **Nel prototipo** (dati demo scollegati) si usa `order=recent`,
    che apre il **primo** di `PROFILE_ORDERS` come **stand-in**: il flusso è
    corretto, ma l'ordine mostrato non è *letteralmente* quello pagato.
  - **Non esiste più** una schermata scontrino dentro l'app Menu: la vecchia
    `ReceiptScreen` (e la route `#receipt`) è stata **rimossa**, perché lo
    scontrino vive ormai nello Storico ordini.

# Dashboard section → icon mapping

Mappatura delle sezioni reali della dashboard Byup Fresh alle **Content icons** della Fase 2.

> **Stato (2026-07-28): in gran parte implementata.** Tab di Impostazioni, Contabilità e Statistiche (macro + sub) e chip di categoria del Menù sono vivi nel codice con le icone proposte. Deviazioni principali: le tab di Sala sono diventate voci separate della sidebar (`place-table`, `commerce-register`, `time-calendar`), la Cucina non ha più tab (vista KDS unica), le notifiche non usano più icone per tipo, e diversi nomi file sono cambiati (v. note nelle sezioni).

Vincoli di posizionamento dal prompt (Fase 4):
- Header di sezione → **1 sola** Content icon, size 32–40px accanto a H1.
- Sidebar nav voci di primo livello → 1 icona per voce, UI o Content.
- Filter chip / tab di categoria → 1 icona per chip (massimo: griglia di card di categoria).
- Toast / notifiche → **solo Status icons**.
- Lista item ripetuti, body inline, form label, avatar → **NO icone Content**.

> *Pagine consumer (mobile webapp in `menu.jsx`) sono fuori scope di questa mappatura — sono SwiftUI-side dell'app cliente, non dashboard ristoratore.*

---

## 1. Pagine top-level (header H1 di pagina)

> *Nota di stato.* I nomi file sono aggiornati al codice attuale (`Sala v3`→`Sala`, `Contabilita v2` assorbita in `byup Contabilita.html`, Profilo e Account unificati in `byup Profilo.html` che carica `account-app.jsx`). Gli header di pagina sono stati poi ridisegnati: le pagine interne aprono direttamente su tab/KPI senza H1 con icona — l'icona d'ancoraggio vive nella sidebar e nelle tab.

| Pagina (HTML) | File JSX app | Header H1 attuale | Content icon proposta | Note |
|---|---|---|---|---|
| `byup Panoramica.html` | `panoramica-app.jsx` | "Buongiorno Marco" | — *(nessuna)* | È la home dashboard; il logo brand in sidebar fa già l'ancoraggio. Aggiungere un'icona qui sarebbe rumore. |
| `byup Sala.html` (ex `Sala v3`) | `sala-app.jsx` (ex `sala-v3-app.jsx`) | "Sala & Prenotazioni" | `time-calendar` | La sala è prenotazione-centric. Alternativa: `place-table`. Scelgo calendar perché copre prenotazioni + sala. *(Oggi Sala/Vendita/Prenotazioni sono voci sidebar distinte.)* |
| `byup Cucina.html` | `cucina-app.jsx` | "Cucina" | `food-meal` | Piatto generico = kitchen output. Alternativa: usare `flame` esistente come `food-flame`. *(In sidebar è stata scelta `food-flame`.)* |
| `byup Statistiche.html` | `stat-app-main.jsx` | "Statistiche" | `chart-bar` | Già esistente, perfetto. |
| `byup Contabilita.html` | `contabilita-v2-app.jsx` | "Contabilità" | `commerce-receipt` | Riassume entrate/uscite/IVA meglio di wallet (che è un'icona "saldo"). *(In sidebar è stata scelta `commerce-piggy-bank`.)* |
| `byup Impostazioni.html` | `impostazioni-app.jsx` | "Impostazioni" | `gear` (UI) | Settings è eccezione: il gear è iconico, non serve Content. ✅ Implementata (header con `gear`). |
| `byup Profilo.html` | `account-app.jsx` | "Profilo" | `people-customer` | Profilo e Account unificati in questa pagina. |
| `byup Supporto.html` | `supporto-app.jsx` | "Supporto" | `headphones` (UI) | Headphones è canonical SF per support. Eccezione. *(Usata in sidebar.)* |
| `byup Configurazione Completa.html` | `config-completa-app.jsx` | "Configurazione" | `place-restaurant` | Vetrina + personale del locale. |
| `byup Restaurant Onboarding.html` | `onboarding-app.jsx` | "Benvenuto in byup" | `place-restaurant` | Onboarding di un nuovo locale. |
| ~~`byup Staff.html`~~ | ~~`staff-app.jsx`~~ | (mobile app cameriere) | `people-waiter` | Non è dashboard tecnicamente — è l'app staff. Lo lascio per completezza. *(La copia in `gestionale/` è stata rimossa il 2026-07-28: l'app cameriere viva è `cameriere/cameriereweb.html` + `cameriere/staff-*.jsx`.)* |
| `byup Login.html` | (login-app.jsx) | "Accedi" | — | Niente Content, login è UI-only. |

---

## 2. Sub-tabs / filtri di pagina

### Sala (`sala-app.jsx`, ex `sala-v3-app.jsx`)

> *Superata come tab bar*: le tre viste sono diventate voci di primo livello della sidebar (`sala` → `place-table`, `vendita` → `commerce-register`, `prenotazioni` → `time-calendar`); la pagina Sala legge il `?tab=` dall'URL ma non mostra più tab interne.

| Tab id | Label | Icona proposta | Icona attuale (sidebar) |
|---|---|---|---|
| `tavoli` | Tavoli | `place-table` | `place-table` |
| `vendita` | Vendita diretta | `commerce-cart` | `commerce-register` |
| `calendar` | Calendario prenotazioni | `time-calendar` | `time-calendar` |

### Cucina (`cucina-app.jsx` tabs)

> *Superata*: la Cucina è oggi una vista KDS unica con focus mode, senza tab (lo storico non è più caricato da `byup Cucina.html`).

| Tab id | Label | Icona |
|---|---|---|
| `ordini` | Ordini | `commerce-cart` *(o `food-meal` se preferisci più domain-coerent)* |
| `storico` | Storico ordini | `time-history` |

### Statistiche (`stat-app-main.jsx`) — ✅ implementata così

**Macro tabs:**

| Tab id | Label | Icona |
|---|---|---|
| `operazioni` | Operazioni | `chart-workflow` |
| `economici` | Economici | `commerce-coins` |
| `app` | App | `chart-area` *(scelta: icona sì)* |

**Sub-tabs di Operazioni:**

| Sub id | Label | Icona |
|---|---|---|
| `prenotazioni` | Prenotazioni | `time-calendar` |
| `ordini` | Ordini | `commerce-cart` |
| `staff` | Team *(label aggiornata)* | `people-staff-group` |
| `clienti` | Clienti | `people-customer` |

### Contabilità (`contabilita-v2-app.jsx` tabs) — ✅ implementata (+ tab `conti`)

| Tab id | Label | Icona |
|---|---|---|
| `cassa` | Cassa | `commerce-coins` |
| `conti` | Conti *(tab aggiunta dopo)* | `commerce-wallet` |
| `costi` | Costi | `commerce-price-tag` |
| `iva` | IVA | `commerce-receipt` |
| `export` | Export | `download` |

> Nota: l'icona UI `download` è stata aggiunta al registry (usata anche dalle Azioni rapide della Panoramica).

### Impostazioni (`impostazioni-shared.jsx` tabs) — ✅ implementata così

| Tab id | Label | Icona |
|---|---|---|
| `vetrina` | Vetrina | `place-restaurant` |
| `menu-cucina` | Menù | `food-meal` |
| `sala` | Sala e tavoli | `place-table` |
| `personale` | Personale | `people-staff-group` |
| `flussi` | Operazioni | `chart-workflow` |
| `fiscali` | Dati fiscali | `commerce-receipt` |
| `integrazioni` | POS e integrazioni | `commerce-bank-cards` |

---

## 3. Sezioni con filter chips di categoria (food/drink)

**Nota strategica.** Nel dashboard ristoratore i menu sono gestiti in `impostazioni-menu-cucina.jsx`. Se quella pagina ha categorie alimentari come filtri (Antipasti / Primi / Secondi / Dolci / Bevande tipicamente), allora **filter chips di Menù** = ottimo posto per `food-*` e `drink-*`.

> ✅ **Implementata** in `impostazioni-menu-cucina.jsx` via `CAT_ICON`: Antipasti→`food-salad`, Primi→`food-pasta`, Secondi→`food-steak`, Contorni→`food-vegetables` *(categoria aggiunta)*, Dolci→`food-dessert`, Bevande→`drink-juice`. Le voci Pizze/Cocktail/Vini/Birre/Caffetteria restano proposte per locali che le useranno.

Mappa proposta:

| Categoria (label IT) | Icona |
|---|---|
| Antipasti | `food-salad` |
| Primi piatti | `food-pasta` |
| Secondi piatti | `food-steak` |
| Dolci | `food-dessert` |
| Bevande | `drink-juice` *(o `drink-water-bottle`)* |
| Pizze | `food-pizza` *(se la cucina è pizzeria)* |
| Cocktail | `drink-cocktail` |
| Vini | `drink-wine` |
| Birre | `drink-beer` |
| Caffetteria | `drink-coffee` |

---

## 4. Empty states (Content icon size 64–96px)

Posti dove un'illustrazione Content fa bene (Fase 4 lo ammette):

| Contesto | Icona suggerita |
|---|---|
| "Nessun piatto in menu" | `food-meal` |
| "Nessuna prenotazione oggi" | `time-calendar` |
| "Nessun ordine in cucina" | `food-meal` *(o `commerce-cart`)* |
| "Nessun cliente registrato" | `people-customer` |
| "Nessun report disponibile" | `chart-bar` |
| "Hai finito i piatti del giorno!" | `event-confetti` |

> Da implementare solo dove l'empty state esiste oggi nel codice — verifichiamo durante la Fase 6, non disegniamo empty state ex-novo solo per giustificare l'icona.

---

## 5. Notifiche / toast (Status icons)

> **Superata.** Nel redesign delle notifiche le righe del dropdown non mostrano più un'icona per tipo (`PN_NOTIFICATIONS` non ha più il campo `icon`); resta solo la campanella `bell`. La tabella sotto documenta il mapping che era in vigore prima del redesign:

| Tipo notifica | Status icon |
|---|---|
| Update | `status-feature` *(rinomina di sparkles/party-popper)* |
| Payment | `commerce-bank-cards` |
| System / Report | `chart-bar` |
| Tip | `status-tip` *(rinomina di lightbulb)* |
| Billing | `commerce-receipt` |
| Feature | `status-feature` |

~~In Fase 6, se accettiamo la rinomina dell'Opzione A nella taxonomy, qui aggiorno le chiavi-stringa di `PN_NOTIFICATIONS` per usare il prefisso `status-*`.~~ *(Decaduto: le chiavi icona sono state rimosse dalle notifiche.)*

---

## 6. TODO / sezioni che richiedono icone fuori lista

- `impostazioni-menu-cucina.jsx` — ✅ confermato e implementato (v. §3, `CAT_ICON`).
- `cameriere/staff-screen-menu.jsx` — può avere filter chips lato cameriere. Ancora da valutare.
- `panoramica-widget-catalog.jsx` — ✅ oggi ogni widget del catalogo ha una propria icona SF (`time-calendar`, `place-table`, `food-meal`, `commerce-money`, `chart-doughnut`, `people-staff-group`, `food-flame`, `star`, `sparkles`, ...).

---

## 7. Riepilogo conteggio

| Famiglia usata nella mappatura | Conta |
|---|---|
| Content **food-** | 6 (`food-meal`, `food-salad`, `food-pasta`, `food-steak`, `food-dessert`, `food-pizza`) |
| Content **drink-** | 5 (`drink-juice`, `drink-cocktail`, `drink-wine`, `drink-beer`, `drink-coffee`) |
| Content **people-** | 3 (`people-customer`, `people-waiter`, `people-staff-group`) |
| Content **place-** | 2 (`place-restaurant`, `place-table`) |
| Content **time-** | 2 (`time-calendar`, `time-history`) |
| Content **commerce-** | 5 (`commerce-receipt`, `commerce-cart`, `commerce-coins`, `commerce-price-tag`, `commerce-bank-cards`) |
| Content **chart-** | 3 (`chart-bar`, `chart-workflow`, `chart-area`) |
| Content **event-** | 1 (`event-confetti` — empty state) |
| Status | 2 (`status-tip`, `status-feature` — erano in notif-bell, oggi lì non più usate) |
| UI nuovi | 1 (`download` per Export tab) |

**Totale Content effettivamente usate dalla mappatura: 27**. Le altre 39 voci del registry proposto in `icons-taxonomy.md` restano nel registry per uso futuro (es. pizzeria-specifica → `food-pizza`, gelateria → `food-ice-cream`, ecc.). Posso ridurre il registry se preferisci, ma costo di re-introduzione futuro lo sconsiglia.

---

## Apertura aperta per te — esiti

1. **Rinomina dell'esistente** (Opzione A vs B della taxonomy)? → **A adottata** (es. `place-table` invece di `table`).
2. **Empty states**: `event-confetti` è nel registry ma non ancora usato — resta idea-per-dopo.
3. **Contabilità → tab Export** → **`download` aggiunta** al registry e usata.
4. **Statistiche → tab App** → **`chart-area`** implementata.
5. **Filter chips Menù** → **icona per chip implementata** (Antipasti = `food-salad`, ecc.).

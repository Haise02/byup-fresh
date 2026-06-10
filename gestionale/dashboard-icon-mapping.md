# Dashboard section → icon mapping

Mappatura delle sezioni reali della dashboard Byup Fresh alle **Content icons** della Fase 2.

Vincoli di posizionamento dal prompt (Fase 4):
- Header di sezione → **1 sola** Content icon, size 32–40px accanto a H1.
- Sidebar nav voci di primo livello → 1 icona per voce, UI o Content.
- Filter chip / tab di categoria → 1 icona per chip (massimo: griglia di card di categoria).
- Toast / notifiche → **solo Status icons**.
- Lista item ripetuti, body inline, form label, avatar → **NO icone Content**.

> *Pagine consumer (mobile webapp in `menu.jsx`) sono fuori scope di questa mappatura — sono SwiftUI-side dell'app cliente, non dashboard ristoratore.*

---

## 1. Pagine top-level (header H1 di pagina)

| Pagina (HTML) | File JSX app | Header H1 attuale | Content icon proposta | Note |
|---|---|---|---|---|
| `byup Panoramica.html` | `panoramica-app.jsx` | "Buongiorno Marco" | — *(nessuna)* | È la home dashboard; il logo brand in sidebar fa già l'ancoraggio. Aggiungere un'icona qui sarebbe rumore. |
| `byup Sala v3.html` | `sala-v3-app.jsx` | "Sala & Prenotazioni" | `time-calendar` | La sala è prenotazione-centric. Alternativa: `place-table`. Scelgo calendar perché copre prenotazioni + sala. |
| `byup Cucina.html` | `cucina-app.jsx` | "Cucina" | `food-meal` | Piatto generico = kitchen output. Alternativa: usare `flame` esistente come `food-flame`. |
| `byup Statistiche.html` | `stat-app-main.jsx` | "Statistiche" | `chart-bar` | Già esistente, perfetto. |
| `byup Contabilita.html` / `Contabilita v2.html` | `contabilita-v2-app.jsx` | "Contabilità" | `commerce-receipt` | Riassume entrate/uscite/IVA meglio di wallet (che è un'icona "saldo"). |
| `byup Impostazioni.html` | `impostazioni-app.jsx` | "Impostazioni" | `gear` (UI) | Settings è eccezione: il gear è iconico, non serve Content. |
| `byup Profilo.html` | (jsx omonimo) | "Profilo" | `people-customer` | Profilo singolo utente. |
| `byup Account.html` | `account-app.jsx` | "Account" | `commerce-bank-cards` | Billing/piano = commerce. |
| `byup Supporto.html` | `supporto-app.jsx` | "Supporto" | `headphones` (UI) | Headphones è canonical SF per support. Eccezione. |
| `byup Configurazione Completa.html` | `config-completa-app.jsx` | "Configurazione" | `place-restaurant` | Vetrina + personale del locale. |
| `byup Restaurant Onboarding.html` | `onboarding-app.jsx` | "Benvenuto in byup" | `place-restaurant` | Onboarding di un nuovo locale. |
| `byup Staff.html` | `staff-app.jsx` | (mobile app cameriere) | `people-waiter` | Non è dashboard tecnicamente — è l'app staff. Lo lascio per completezza. |
| `byup Login.html` | (login-app.jsx) | "Accedi" | — | Niente Content, login è UI-only. |

---

## 2. Sub-tabs / filtri di pagina

### Sala v3 (`sala-v3-app.jsx` tabs)

| Tab id | Label | Icona |
|---|---|---|
| `tavoli` | Tavoli | `place-table` |
| `vendita` | Vendita diretta | `commerce-cart` |
| `calendar` | Calendario prenotazioni | `time-calendar` |

### Cucina (`cucina-app.jsx` tabs)

| Tab id | Label | Icona |
|---|---|---|
| `ordini` | Ordini | `commerce-cart` *(o `food-meal` se preferisci più domain-coerent)* |
| `storico` | Storico ordini | `time-history` |

### Statistiche (`stat-app-main.jsx`)

**Macro tabs:**

| Tab id | Label | Icona |
|---|---|---|
| `operazioni` | Operazioni | `chart-workflow` |
| `economici` | Economici | `commerce-coins` |
| `app` | App | `chart-area` *(o nessuna — è già un sub-set)* |

**Sub-tabs di Operazioni:**

| Sub id | Label | Icona |
|---|---|---|
| `prenotazioni` | Prenotazioni | `time-calendar` |
| `ordini` | Ordini | `commerce-cart` |
| `staff` | Staff | `people-staff-group` |
| `clienti` | Clienti | `people-customer` |

### Contabilità (`contabilita-v2-app.jsx` tabs)

| Tab id | Label | Icona |
|---|---|---|
| `cassa` | Cassa | `commerce-coins` |
| `costi` | Costi | `commerce-price-tag` |
| `iva` | IVA | `commerce-receipt` *(o doc UI)* |
| `export` | Export | (UI: `arrow-down-tray` / download — da aggiungere) |

> Nota: per `export` serve un'icona UI `download` che il registry attuale **non** ha. Da aggiungere come UI extra (1 icona, fuori dal conteggio Content).

### Impostazioni (`impostazioni-shared.jsx` tabs)

| Tab id | Label | Icona |
|---|---|---|
| `vetrina` | Vetrina | `place-restaurant` |
| `menu-cucina` | Menù | `food-meal` |
| `sala` | Sala e tavoli | `place-table` |
| `personale` | Personale | `people-staff-group` |
| `flussi` | Operazioni | `chart-workflow` |
| `fiscali` | Dati fiscali locale | `commerce-receipt` *(o doc UI)* |
| `integrazioni` | POS e integrazioni | `commerce-bank-cards` |

---

## 3. Sezioni con filter chips di categoria (food/drink)

**Nota strategica.** Nel dashboard ristoratore i menu sono gestiti in `impostazioni-menu-cucina.jsx`. Se quella pagina ha categorie alimentari come filtri (Antipasti / Primi / Secondi / Dolci / Bevande tipicamente), allora **filter chips di Menù** = ottimo posto per `food-*` e `drink-*`.

Mappa proposta (da confermare aprendo `impostazioni-menu-cucina.jsx`):

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

Già migrato in `panoramica-notif-bell.jsx`. Mapping già fatto nella precedente migrazione:

| Tipo notifica | Status icon |
|---|---|
| Update | `status-feature` *(rinomina di sparkles/party-popper)* |
| Payment | `commerce-bank-cards` |
| System / Report | `chart-bar` |
| Tip | `status-tip` *(rinomina di lightbulb)* |
| Billing | `commerce-receipt` |
| Feature | `status-feature` |

In Fase 6, se accettiamo la rinomina dell'Opzione A nella taxonomy, qui aggiorno le chiavi-stringa di `PN_NOTIFICATIONS` per usare il prefisso `status-*`.

---

## 6. TODO / sezioni che richiedono icone fuori lista

Durante la scansione non ho ancora aperto:

- `impostazioni-menu-cucina.jsx` — confermare se ha filter chips di categoria (presunto sì)
- `staff-screen-menu.jsx` — può avere filter chips lato cameriere
- `panoramica-widget-catalog.jsx` — il catalog widget ha già una "category" filter (Tutti / Incassi / Statistiche / Sala / Menu / ...) → potenziale uso di Content icons sui chip ma è già un'eccezione (chip di categoria UI-driven, non domain).

Posso scansionarli più a fondo in Fase 6 prima di implementare. Niente icona Content nuova fuori da questa lista senza tuo OK.

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
| Status | 2 (`status-tip`, `status-feature` — già in notif-bell) |
| UI nuovi | 1 (`download` per Export tab) |

**Totale Content effettivamente usate dalla mappatura: 27**. Le altre 39 voci del registry proposto in `icons-taxonomy.md` restano nel registry per uso futuro (es. pizzeria-specifica → `food-pizza`, gelateria → `food-ice-cream`, ecc.). Posso ridurre il registry se preferisci, ma costo di re-introduzione futuro lo sconsiglia.

---

## Apertura aperta per te

1. **Rinomina dell'esistente** (Opzione A vs B della taxonomy)? La mappatura sopra assume **A** (es. `place-table` invece di `table`).
2. **Empty states**: vuoi che spinga `event-confetti` su "Hai finito i piatti del giorno!" o lo tengo come idea-per-dopo?
3. **Contabilità → tab Export** richiede un nuovo UI `download`. Lo aggiungo o usiamo `commerce-receipt`?
4. **Statistiche → tab App**: lo lascio senza icona (più pulito) o `chart-area`?
5. **Filter chips Menù**: confermi che si mette icona per chip (es. Antipasti = food-salad) o preferisci chip solo testuali?

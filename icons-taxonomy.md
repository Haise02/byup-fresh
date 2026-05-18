# Icons taxonomy — Byup Fresh

Classificazione delle icone del registry attuale (`panoramica-sf-icons.jsx` → `SfIcons`) + proposta per le nuove **Content icons** della Fase 2.

Tre famiglie (vincolo del prompt):

| Famiglia | Funzione | Quantità target |
|---|---|---|
| **UI** | Azioni e navigazione | ~40–60 |
| **Content** | Categorie semantiche di dominio | ~25–40 |
| **Status** | Feedback / stato | ~8–12 |

---

## 1. Registry attuale (25 icone) — classificazione

### UI (16)

Generiche, agnostiche al dominio. Restano **senza prefisso**.

`grid`, `magnifying-glass`, `bell`, `gear`, `plus`, `xmark`, `grip`, `check`, `pencil`, `chevron-right`, `star`, `sparkles`, `headphones`, `arrow-up-right`, `arrow-down-right`, `calendar`

> *Nota su `calendar` e `headphones`:* sono usate oggi come voci di **nav** della sidebar, contesto UI. Semanticamente `calendar` apparterrebbe a `time-*` e `headphones` a UI/support — ma la nav è il loro uso canonico, le considero UI.

### Content (7)

Domain-specific (food, place, people, commerce, data).

| Nome attuale | Famiglia proposta | Rinomina suggerita |
|---|---|---|
| `flame` | food / kitchen | `food-flame` o `place-cooking-pot` |
| `chart-bar` | data | `chart-bar` (già prefissato) |
| `wallet` | commerce | `commerce-wallet` |
| `person` | people | `people-customer` |
| `receipt` | commerce | `commerce-receipt` |
| `table` | place | `place-table` |
| `credit-card` | commerce | `commerce-bank-cards` |

### Status (2)

| Nome attuale | Famiglia | Rinomina suggerita |
|---|---|---|
| `lightbulb` | status / tip | `status-tip` |
| `party-popper` | status / event-highlight | `status-feature` o `event-confetti` |

### Decisione da prendere

**Opzione A (clean)**: rinomino le 9 icone Content/Status del registry attuale aggiungendo il prefisso, e aggiorno gli usi nella dashboard (8 file, ~10 sostituzioni totali — è poco lavoro).

**Opzione B (back-compat)**: mantengo i nomi attuali e aggiungo gli alias prefissati come *seconde* chiavi nel registry (`'flame': pathA`, `'food-flame': pathA`). Più gentile, ma genera due nomi per icona — il prefisso perde il suo scopo di disciplina.

Mia raccomandazione: **Opzione A**. Il prezzo è basso (PR atomica) e il sistema resta pulito.

---

## 2. Nuove Content icons — proposta (76 voci)

Le quantità rispettano i sub-set indicati dal prompt. Naming sempre `<famiglia>-<slug>`, slug kebab-case singolare in inglese.

### Food (15)
`food-hamburger`, `food-pizza`, `food-taco`, `food-salad`, `food-meal`, `food-pasta`, `food-sandwich`, `food-sushi`, `food-soup`, `food-steak`, `food-seafood`, `food-vegetables`, `food-fruit`, `food-dessert`, `food-ice-cream`

### Drinks (10)
`drink-coffee`, `drink-coffee-to-go`, `drink-tea`, `drink-cocktail`, `drink-wine`, `drink-beer`, `drink-champagne`, `drink-juice`, `drink-water-bottle`, `drink-milkshake`

### Commerce / Ecommerce (10 nuove + 3 esistenti rinominate = 13)
Nuove: `commerce-cart`, `commerce-bag`, `commerce-coins`, `commerce-price-tag`, `commerce-discount`, `commerce-gift`, `commerce-delivery`, `commerce-in-transit`, `commerce-coupon`, `commerce-money`
Rinominate dall'esistente: `commerce-wallet`, `commerce-receipt`, `commerce-bank-cards`

### People (8)
`people-chef`, `people-waiter`, `people-customer` (rinomina di `person`), `people-manager`, `people-staff-group`, `people-male-user`, `people-female-user`, `people-user-circle`

### Time & Date (6)
`time-calendar` (alias di `calendar` o rinomina), `time-clock`, `time-stopwatch`, `time-alarm`, `time-history`, `time-schedule`

### Place / City (6)
`place-restaurant`, `place-food-cart`, `place-building`, `place-map-pin`, `place-truck`, `place-table` (rinomina di `table`)

### Data / Charts (8)
`chart-bar` (esistente), `chart-area`, `chart-doughnut`, `chart-combo`, `chart-positive-dynamic`, `chart-mind-map`, `chart-flow-chart`, `chart-workflow`

### Events / Holidays (5)
`event-confetti` (rinomina/aggiunta vs `party-popper`), `event-gift-box`, `event-santa`, `event-pumpkin`, `event-easter-egg`

### Status (8)
`status-success` (✓ in cerchio), `status-warning` (⚠ triangolo), `status-error` (✕ in cerchio), `status-info` (i in cerchio), `status-pending` (orologio in cerchio), `status-tip` (rinomina di `lightbulb`), `status-feature` (rinomina di `party-popper`), `status-locked` (lucchetto)

---

## 3. Naming convention

| Tipo | Pattern | Esempi |
|---|---|---|
| UI (azioni/nav) | `<slug>` senza prefisso | `plus`, `xmark`, `grip`, `chevron-right` |
| Content (dominio) | `<famiglia>-<slug>` | `food-pizza`, `drink-cocktail`, `people-chef`, `place-restaurant` |
| Status (feedback) | `status-<slug>` | `status-success`, `status-warning` |

**Vantaggi del prefisso Content**: autocomplete IDE raggruppa le opzioni (digitando `food-` vede tutte le icone food), distingue intent semantico (`pizza` ambiguo, `food-pizza` no), forza disciplina (chi scrive code sa che `food-*` è un'ancora di sezione, non un'icona di azione).

---

## 4. Conteggio finale (post-implementazione Fase 6)

| Famiglia | Conta |
|---|---|
| UI | 16 |
| Content | 60 + 6 esistenti rinominate = **66** |
| Status | 8 |
| **Totale** | **90** |

90 è il limite massimo del prompt — siamo dentro. Se durante l'implementazione una proposta si rivela ridondante, posso scenderne il numero. Niente aggiunte fuori da questa lista senza tuo OK.

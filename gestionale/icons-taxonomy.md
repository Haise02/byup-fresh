# Icons taxonomy — Byup Fresh

Classificazione delle icone del registry (`panoramica-sf-icons.jsx` → `SfIcons`) + proposta per le nuove **Content icons** della Fase 2.

> **Stato (verificato il 2026-08-09): implementata.** Opzione A adottata (rinomina con prefisso, niente alias). Il registry conta oggi **94 icone** (era 93 al 2026-07-28): Status 7, e le famiglie Content più popolate sono `food` e `commerce` con 15 ciascuna, `drink` 10, `people` e `chart` 7, `time` e `place` 6. Scostamenti dalla proposta del §2: non implementate `people-male-user`, `chart-combo`, `event-santa`, `event-easter-egg`, `status-locked` e `food-fruit` (Food resta comunque a 15 perché è entrata `food-flame`, rinomina dal §1); aggiunte fuori lista `commerce-piggy-bank` e `commerce-register` (Content) e `trash` + `download` (UI); `calendar` esiste solo come `time-calendar`.

Tre famiglie (vincolo del prompt):

| Famiglia | Funzione | Quantità target |
|---|---|---|
| **UI** | Azioni e navigazione | ~40–60 |
| **Content** | Categorie semantiche di dominio | ~25–40 |
| **Status** | Feedback / stato | ~8–12 |

---

## 1. Registry alla data della proposta (25 icone) — classificazione

### UI (16)

Generiche, agnostiche al dominio. Restano **senza prefisso**.

`grid`, `magnifying-glass`, `bell`, `gear`, `plus`, `xmark`, `grip`, `check`, `pencil`, `chevron-right`, `star`, `sparkles`, `headphones`, `arrow-up-right`, `arrow-down-right`, `calendar`

> *Nota su `calendar` e `headphones`:* erano usate come voci di **nav** della sidebar, contesto UI. Semanticamente `calendar` apparterrebbe a `time-*` e `headphones` a UI/support. *(Esito: `calendar` è poi confluita in `time-calendar` — Content; `headphones` è rimasta UI.)*

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

> **Esito: Opzione A adottata.** Nel registry attuale esistono solo i nomi prefissati (`food-flame`, `commerce-wallet`, `people-customer`, `commerce-receipt`, `place-table`, `commerce-bank-cards`, `status-tip`, `status-feature`, `time-calendar`); nessun alias legacy.

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

## 4. Conteggio finale (a consuntivo, registry attuale)

| Famiglia | Previsto | Effettivo |
|---|---|---|
| UI | 16 | **17** (aggiunte `trash`, `download`; `calendar` passata a Content) |
| Content | 60 + 6 esistenti rinominate = 66 | **69** (Food 15 · Drink 10 · Commerce 15 · People 7 · Time 6 · Place 6 · Chart 7 · Event 3) |
| Status | 8 | **7** (`status-locked` non implementata) |
| **Totale** | **90** | **93** |

Il tetto teorico del prompt era 90: a consuntivo il registry è a 93 per via delle due Commerce extra (`commerce-piggy-bank`, `commerce-register`, nate per la sidebar Contabilità/Vendita) e delle UI `trash`/`download`; in compenso 6 proposte non sono mai state disegnate (`people-male-user`, `chart-combo`, `event-santa`, `event-easter-egg`, `status-locked`, `food-fruit`).

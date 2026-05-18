# Icon decorations cleanup — proposte da revisionare

Lista delle icone/decorazioni esistenti che la **Fase 4** del prompt classifica come "❌ No". Niente è stato rimosso: serve il tuo OK su ogni voce.

Per ogni voce: file, contesto, classificazione e proposta.

---

## A. Emoji Unicode usate come icone

Cercate con regex sui file `.jsx` della dashboard.

| File | Riga | Contesto | Proposta |
|---|---:|---|---|
| (nessuno trovato nei file dashboard migrati) | — | — | — |

> *Nota.* La consumer webapp `menu.jsx` usa emoji nelle categorie (🍕 ecc.) ma è fuori scope dashboard. Se vorrai armonizzare quella anche, va trattata come progetto separato.

---

## B. Icone accanto a singoli item di liste ripetute (❌ No)

### B.1 `panoramica-widgets.jsx:420` · prenotazioni list

```jsx
<Icon name="people-customer" size={12} color={PN.MUTED}/> {it.covers} · {it.table}
```

**Classificazione**: lista ripetuta (ogni prenotazione mostra la stessa icona accanto al numero coperti).
**Verdetto**: questa è una **eccezione tollerabile** — l'icona qui legge "persona = coperto", che è un'ancora-tipo, non decorazione. È a 12px, MUTED, vicino al numero che descrive. Una colonna senza icona perderebbe la scansione visiva.
**Proposta**: **TENERE**. Eccezione motivata, non rimuovere.

### B.2 `panoramica-widgets.jsx:570, 592` · stelle recensioni

```jsx
<Icon name="star" size={13} color={i <= 4 ? '#F59E0B' : '#E5E7EB'}/>
<Icon name="star" size={10} color={i <= r.stars ? '#F59E0B' : '#E5E7EB'}/>
```

**Classificazione**: pattern *rating* (1-5 stelle). Icone ripetute per natura del componente.
**Verdetto**: **TENERE**. Il pattern stella-rating è il rendering canonico — qualsiasi altra cosa peggiorerebbe la leggibilità.

### B.3 `cucina-app.jsx` / `cucina-tab-insala.jsx` — eventuali icone nelle card ordine

> Non scansionate in profondità in questa migrazione. **TODO**: verificare in un secondo passaggio se ogni card-ordine ha icone Content (es. food-pizza) ridondanti accanto al nome piatto. Se sì → candidate rimozione.

---

## C. Doppie icone nello stesso header (UI + Content)

Verificato: nessuna doppia icona nei header migrati. Le scelte sono state esplicite (gear per Impostazioni, headphones per Supporto, Content icon per gli altri).

---

## D. Icone in form label (❌ No)

Cercate con grep "label.*Icon" nei file di onboarding/impostazioni:

| File | Contesto | Verdetto |
|---|---|---|
| (nessuna icona inline in label trovata nei file dashboard migrati) | — | — |

> `impostazioni-vetrina.jsx`, `impostazioni-fiscali.jsx`, ecc. potrebbero avere casi: **TODO** scansione dettagliata.

---

## E. SVG inline lasciate ancora nel codebase

Verifica con grep `<svg`:

| File | Cosa | Verdetto |
|---|---|---|
| `panoramica-widgets.jsx:60` | sparkline chart | **NON è icona** → tenere |
| `panoramica-icons.jsx` (file intero) | registry PnI legacy | Usato da 11 pagine non-dashboard (Profilo, Account, ecc. usano PnI ancora). **TENERE** fino a migrazione completa di quelle pagine. |
| `byup-icons.jsx` (file intero) | registry BuIcons legacy | Idem: usato da molteplici pagine. **TENERE**. |
| `sala-v3-app.jsx` | `<SvIconV3App>` per il date picker icon, `<SvIcon>` per gli status chip in tavoli | Set custom della pagina Sala. **Candidate per migrazione SF** in una fase separata. **TODO**. |
| `cucina-tab-insala.jsx`, `cucina-tab-storico.jsx` | icone inline per status ordine (in cottura, pronto, ecc.) | **Candidate per migrazione SF** (`status-pending`, `status-success`). **TODO**. |
| `contabilita-v2-icons.jsx` | set custom `Ic.*` | Set page-specific. Sostituibile con SF. **TODO**. |
| `stat-atoms.jsx` | possibili inline | Da verificare. **TODO**. |

---

## F. Caratteri Unicode usati come icone — Phase 1 (gestita)

Già sostituito: il `›` Unicode in `panoramica-widgets.jsx:646` (Azioni rapide) → `<Icon name="chevron-right">`.

Altri da cercare:
- `→` `↑` `↓` `▾` `▴` ecc. usati inline come decorazione.

Grep rapido:

| File | Riga | Glifo | Contesto | Verdetto |
|---|---:|---|---|---|
| `sala-v3-app.jsx:90` | `▾` | freccia dropdown date picker | dropdown indicator | **TENERE** — è un indicatore micro-UI Apple-style, ok come Unicode |
| `contabilita-v2-app.jsx` | varie `↑ ↓` | trend indicators nei KPI | indicators | Considerare rimpiazzo con `arrow-up-right` / `arrow-down-right` |

---

## G. Icone Content ridondanti accanto a header già brand-loaded

| File | Verdetto |
|---|---|
| `config-completa-app.jsx` (Configurazione Completa) | Header marketing-style con "CONFIGURAZIONE COMPLETA · OPZIONALE" + h1 grande. **NON aggiungere Content icon** — sarebbe rumore. ✓ Già skippato. |
| `onboarding-app.jsx` | Header brand-style con logo. **Stesso verdetto**. ✓ Skippato. |
| `login-app.jsx` | Login form, niente Content icon. ✓ Skippato. |

---

## TL;DR — cosa serve il tuo OK

Tutto il resto è già coerente con la governance della Fase 4. Le domande aperte sono solo:

1. **Cucina** card-ordine — vado a vedere se hanno icone Content ridondanti? *(stima: 10-15 min di scansione)*
2. **Migrazione delle pagine non-dashboard** che ancora usano `PnI` / `BuIcons` / `Ic` / `SvIcon` legacy (Profilo, Account, Sala-card-status, Contabilità-KPI, ecc.). Vuoi che faccia un piano? *(grande work, tipicamente 2-3 PR separate)*
3. **Glifi `↑ ↓` nei KPI Contabilità** → rimpiazzo con `arrow-up-right` / `arrow-down-right`? Lo trovo coerente ma cambia il "feel" testuale dei KPI.
4. **Eccezioni B.1, B.2** (covers count + rating stars) — confermi che restano?

Risposte attese: per ogni punto un **ok** / **no** / **dopo**.

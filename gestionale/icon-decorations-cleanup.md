# Icon decorations cleanup — proposte da revisionare

Lista delle icone/decorazioni esistenti che la **Fase 4** del prompt classifica come "❌ No". Niente è stato rimosso: serve il tuo OK su ogni voce.

Per ogni voce: file, contesto, classificazione e proposta.

> **Stato (2026-07-28).** Diversi punti sono stati superati dai redesign successivi: l'icona coperti nelle prenotazioni (B.1) è stata rimossa col redesign del widget, i glifi `↑ ↓` dei KPI Contabilità sono diventati SVG (`Ic.trendUp`/`Ic.trendDown`), i file `sala-v3-*` sono stati rinominati `sala-*`. Restano aperte le migrazioni delle pagine legacy su `PnI`/`BuIcons`/`Ic`/`SvIcon`. Dettagli nelle sezioni.

---

## A. Emoji Unicode usate come icone

Cercate con regex sui file `.jsx` della dashboard.

| File | Riga | Contesto | Proposta |
|---|---:|---|---|
| (nessuno trovato nei file dashboard migrati) | — | — | — |

> *Nota.* La consumer webapp `menu.jsx` usa emoji nelle categorie (🍕 ecc.) ma è fuori scope dashboard. Se vorrai armonizzare quella anche, va trattata come progetto separato.

---

## B. Icone accanto a singoli item di liste ripetute (❌ No)

### B.1 `panoramica-widgets.jsx` · prenotazioni list

```jsx
<Icon name="people-customer" size={12} color={PN.MUTED}/> {it.covers} · {it.table}
```

**Classificazione**: lista ripetuta (ogni prenotazione mostra la stessa icona accanto al numero coperti).
**Verdetto**: questa è una **eccezione tollerabile** — l'icona qui legge "persona = coperto", che è un'ancora-tipo, non decorazione. È a 12px, MUTED, vicino al numero che descrive. Una colonna senza icona perderebbe la scansione visiva.
**Proposta**: **TENERE**. Eccezione motivata, non rimuovere.
**Stato**: superata — il redesign successivo del widget ha eliminato l'icona: la riga oggi mostra il testo "N coperti" senza icona.

### B.2 `panoramica-widgets.jsx:756, 812` · stelle recensioni

```jsx
<Icon name="star" size={13} color={i <= 4 ? '#F59E0B' : '#E5E7EB'}/>
<Icon name="star" size={10} color={i <= r.stars ? '#F59E0B' : '#E5E7EB'}/>
```

**Classificazione**: pattern *rating* (1-5 stelle). Icone ripetute per natura del componente.
**Verdetto**: **TENERE**. Il pattern stella-rating è il rendering canonico — qualsiasi altra cosa peggiorerebbe la leggibilità.
**Stato**: confermato, ancora nel codice (righe aggiornate sopra).

### B.3 `cucina-app.jsx` / `cucina-tab-insala.jsx` — eventuali icone nelle card ordine

> Non scansionate in profondità in questa migrazione. **TODO**: verificare in un secondo passaggio se ogni card-ordine ha icone Content (es. food-pizza) ridondanti accanto al nome piatto. Se sì → candidate rimozione.
> *Aggiornamento*: `cucina-tab-insala.jsx` usa ancora icone SVG inline custom (es. `BagIcon`/`ScooterIcon` per i badge ASPORTO/DELIVERY), non icone Content accanto ai piatti; `cucina-tab-storico.jsx` non è più caricato da `byup Cucina.html` (la Cucina è una vista unica).

---

## C. Doppie icone nello stesso header (UI + Content)

Verificato: nessuna doppia icona nei header migrati. Le scelte sono state esplicite (gear per Impostazioni, headphones per Supporto, Content icon per gli altri).

---

## D. Icone in form label (❌ No)

Cercate con grep "label.*Icon" nei file di onboarding/impostazioni:

| File | Contesto | Verdetto |
|---|---|---|
| (nessuna icona inline in label trovata nei file dashboard migrati) | — | — |

> `impostazioni-vetrina.jsx`, `impostazioni-dati-fiscali.jsx`, ecc. potrebbero avere casi: **TODO** scansione dettagliata.

---

## E. SVG inline lasciate ancora nel codebase

Verifica con grep `<svg`:

| File | Cosa | Verdetto |
|---|---|---|
| `panoramica-widgets.jsx:103` | sparkline chart | **NON è icona** → tenere |
| `panoramica-icons.jsx` (file intero) | registry PnI legacy | Usato ancora da ~16 file .jsx (Account/Profilo, Impostazioni, Supporto, Configurazione, Sala, Contabilità-conti, ...); la sidebar dashboard usa `PnI.Logo`/`PnI.LogoMark`. **TENERE** fino a migrazione completa di quelle pagine. |
| `byup-icons.jsx` (file intero) | registry BuIcons legacy | Idem: usato ancora da ~13 file (Statistiche sub-pagine, Impostazioni, Supporto, ...). **TENERE**. |
| `sala-tab-tavoli.jsx` (ex `sala-v3-app.jsx`) | `<SvIcon>` per gli status chip in tavoli (il `<SvIconV3App>` del date picker non esiste più) | Set custom della pagina Sala. **Candidate per migrazione SF** in una fase separata. **TODO**. |
| `cucina-tab-insala.jsx` | icone inline custom (badge asporto/delivery, status ordine) — `cucina-tab-storico.jsx` non è più caricato | **Candidate per migrazione SF** (`status-pending`, `status-success`). **TODO**. |
| `contabilita-v2-icons.jsx` | set custom `Ic.*` (usato dai KPI di `contabilita-v2-app.jsx`) | Set page-specific. Sostituibile con SF. **TODO**. |
| `stat-atoms.jsx` | 1 svg inline (chart) + `BuIcons.*`; usa già anche `<Icon>` SF per le tab | Migrazione parziale. **TODO** per la parte BuIcons. |

---

## F. Caratteri Unicode usati come icone — Phase 1 (gestita)

Già sostituito: il `›` Unicode nelle Azioni rapide (`panoramica-widgets.jsx`) → `<Icon name="chevron-right">`. *(Il redesign successivo delle Azioni rapide ha poi rimosso del tutto il chevron.)*

Altri da cercare:
- `→` `↑` `↓` `▾` `▴` ecc. usati inline come decorazione.

Grep rapido:

| File | Glifo | Contesto | Verdetto |
|---|---|---|---|
| ex `sala-v3-app.jsx` | `▾` | freccia dropdown date picker | **Risolto** — il glifo non esiste più nell'attuale `sala-app.jsx` (redesign del calendario) |
| `contabilita-v2-app.jsx` | `↑ ↓` | trend indicators nei KPI | **Risolto** — i KPI usano ora SVG `Ic.trendUp` / `Ic.trendDown` da `contabilita-v2-icons.jsx` |

---

## G. Icone Content ridondanti accanto a header già brand-loaded

| File | Verdetto |
|---|---|
| `config-completa-app.jsx` (Configurazione Completa) | Header marketing-style con h1 grande (oggi "Completa la tua presenza su byup."). **NON aggiungere Content icon** — sarebbe rumore. ✓ Già skippato. |
| `onboarding-app.jsx` | Header brand-style con logo (`OnbIcon.Logo`). **Stesso verdetto**. ✓ Skippato. |
| `login-app.jsx` | Login form, niente Content icon. ✓ Skippato. |

---

## TL;DR — cosa serve il tuo OK

Tutto il resto è già coerente con la governance della Fase 4. Stato delle domande aperte:

1. **Cucina** card-ordine — verificato: niente icone Content ridondanti accanto ai piatti; restano icone inline custom nei badge (v. B.3). Migrazione SF ancora **TODO**.
2. **Migrazione delle pagine non-dashboard** che ancora usano `PnI` / `BuIcons` / `Ic` / `SvIcon` legacy (Account/Profilo, Impostazioni, Supporto, Sala-status-chip, Contabilità-KPI, Statistiche sub-pagine). **Ancora aperta** — è il lavoro grosso rimasto.
3. **Glifi `↑ ↓` nei KPI Contabilità** → **risolto**: i KPI usano SVG `Ic.trendUp`/`Ic.trendDown` (non le SF `arrow-up-right`/`arrow-down-right`, che restano un'opzione per la futura migrazione della pagina).
4. **Eccezioni B.1, B.2** — B.2 (rating stars) confermata e viva; B.1 (covers count) superata: il redesign del widget ha tolto l'icona.

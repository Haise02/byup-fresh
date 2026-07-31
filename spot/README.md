# byup Spot — console di amministrazione

Entry: [byup-spot.html](byup-spot.html). Per chi: il team admin di byup.

> **È un prototipo di UX/UI.** Vale quanto scritto nel
> [README della monorepo](../README.md): i dati sono finti, niente si salva, e le
> logiche che sembrano funzionare servono a rendere le schermate credibili — non
> sono la specifica del sistema. Per l'architettura e i flussi si parte dai
> documenti, non da questo codice.

---

## Le sezioni

Il menu è in due gruppi: sopra l'operatività quotidiana, sotto la governance.

| Sezione | Cosa contiene | Documento |
|---|---|---|
| **Dashboard** | Quadro generale e analytics | — |
| **Locali** | Ristoranti registrati e onboarding | — |
| **Staff** | Camerieri, cassa, proprietari, dispositivi dei locali | — |
| **Utenti App** | Clienti finali | — |
| **Assistenza** | Quattro tab: Chiamate (solo Plus e Business, scadenza scelta dal ristoratore), Ticket (tutti i piani), FAQ, Guide | — |
| **Promozioni** | Campagne e broadcast | — |
| **Economix** | Costi, conto economico, cassa, patrimonio di byup | [Economix.md](Economix.md) |
| **Risk Management** | Rischi, adempimenti ed evidenze ISO 27001 / 9001 | [Risk-Management.md](Risk-Management.md) |
| **Sicurezza e sistemi** | Accessi, audit log, diagnostica | [Riesame-Accessi.md](Riesame-Accessi.md) |
| **Piattaforma** | Tre tab: Piani e prezzi, Peso ordini, Discovery nell'app | — |

---

## Ruoli e permessi

Sei ruoli su undici aree. La matrice sta in **Sicurezza e sistemi → Accessi**,
in fondo alla pagina; i dati in [admin-data.jsx](admin-data.jsx) (`RUOLI`,
`PERMESSI`).

| Ruolo | Accede a |
|---|---|
| **Super Admin** | tutto |
| **Support** | dashboard, locali, utenti, ticket, chiamate e knowledge base, certificazioni |
| **Marketing** | dashboard, messaggi |
| **AFC** | dashboard, Economix, Risk Management |
| **ICT** | dashboard, Sicurezza e sistemi |
| **Viewer** | dashboard |

Una scelta deliberata: **le impostazioni della piattaforma restano al solo Super
Admin** — sono leve commerciali (prezzi, piani, soglie), e ICT amministra i
sistemi ma non decide quanto costa un piano.

Non esiste più un ruolo HR né una sezione Risorse Umane: il registro della
formazione è un'evidenza ISO (A.6.3) e sta dove stanno le altre, in **Risk
Management → Formazione**, e lì c'è solo quello. Le uscite dal team non si
registrano da nessuna parte: chi non lavora più qui il riesame degli accessi lo
intercetta come dormiente.

---

## Com'è fatto

Nessun build step: `.jsx` serviti come `text/babel` e compilati nel browser.
I componenti si espongono su `window`; l'ordine dei tag `<script>` in
[byup-spot.html](byup-spot.html) conta.

**Il cache-buster `?v=N` va incrementato a ogni modifica di un `.jsx`**, altrimenti
il browser serve la versione vecchia e sembra che la modifica non abbia avuto
effetto.

Il frame è fisso a 1440×900 con uno `zoom` applicato via JS. Due conseguenze che
mordono:

- le unità `vh` dentro il frame vengono scalate una seconda volta e sfondano;
- `getBoundingClientRect()` restituisce pixel **visivi**, mentre `maxHeight` li
  vuole di **layout**: per fissare l'altezza di N righe si misura col rect e si
  **divide per lo zoom**.

---

## Prima di un rilascio

```
grep -rn "data-demo-only" spot/
```

Marca le affordance che esistono solo per la demo e **non devono finire in
produzione**. Oggi non ce n'è nessuna: l'unica era il «simula manomissione» del
riesame accessi, sparito insieme alla catena di impronte che dimostrava — vedi
[Riesame-Accessi.md](Riesame-Accessi.md). Il controllo resta perché la prossima
ci sarà.

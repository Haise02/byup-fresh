# byup — Indice della documentazione (byup-Docs)

Mappa dei documenti dell'**app consumer** byup. Ogni file ha un confine netto e
rimanda agli altri per pertinenza, così il dettaglio vive **una volta sola**.

> App in italiano, prototipo React no-build da validare e poi **riscrivere in
> Flutter**. Le **scelte di prodotto** sopravvivono alla riscrittura; il **codice
> del prototipo** no.

---

## Da dove iniziare

1. **[Contesto-App.md](Contesto-App.md)** — il *perché*. Leggilo per primo: visione,
   ecosistema, modello di ricavo, requisiti, i tre percorsi d'ordine (§G).
2. Poi il file tematico che ti serve (vedi tabella).
3. **[Contratto-Dati.md](Contratto-Dati.md)** quando devi sapere *quali dati*
   entrano/escono dall'app.
4. **[Architettura-Prototipo.md](Architettura-Prototipo.md)** solo se metti mano al
   **codice del prototipo**.

---

## I documenti

| File | Cosa contiene | Tipo | Stato |
|------|---------------|------|:-----:|
| **[Contesto-App.md](Contesto-App.md)** | Contesto di **prodotto** (il *perché*): visione, ecosistema, ricavo, requisiti §D, modello backend §E, i 3 percorsi d'ordine §G. È l'**hub** che sintetizza e rimanda. | Durevole | misto |
| **[Contratto-Dati.md](Contratto-Dati.md)** | Forme dati **app ⇄ backend/ecosistema** (inbound/outbound). | Durevole | — |
| **[Pagamenti-Divisione.md](Pagamenti-Divisione.md)** | Saldo unico real-time, **lock**, modalità di divisione, pagamento parziale, scarto centesimi. | Durevole | ✅ DECISO |
| **[Recupero-Ordine.md](Recupero-Ordine.md)** | Spec tecnica recupero ordine **webapp→app** (Android Install Referrer con codice, iOS/banner, roadmap). | Implementazione | ✅ DECISO |
| **[Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md)** | Difesa da accessi remoti / ordini civetta, barriere d'identità, metodo ISO 27001. | Durevole | 🟠 IN DISCUSSIONE |
| **[Architettura-Prototipo.md](Architettura-Prototipo.md)** | Il *come* del prototipo React no-build (globali `window`, router, storage, stato menu, tema). | **Usa-e-getta** | — |
| **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** | Design system dell'app consumer: token (`window.ByupKit` in [byup-app-kit.jsx](byup-app-kit.jsx)), temi light/dark, tipografia, componenti, build standalone. | Riferimento vivo | — |
| **[Byuppini-Concept.md](Byuppini-Concept.md)** | Gamification/fedeltà **Byuppini**: meccaniche, economia, livelli, premi. | Durevole | — |
| **[Byuppini-Image-Prompts.md](Byuppini-Image-Prompts.md)** | Prompt per generare gli asset immagine dei Byuppini (moneta, badge, premi, mascotte). | Supporto | — |
| **[LIA-suggerimenti.md](LIA-suggerimenti.md)** | **LIA** — valutazione dell'interesse legittimo (art. 6.1.f GDPR) per la personalizzazione dei suggerimenti in-app: finalità, bilanciamento, opt-out. | Durevole | 🟠 BOZZA da validare con legale/DPO |
| **[HANDOFF-prototipo-byup.md](HANDOFF-prototipo-byup.md)** | Handoff storico (lug 2026) dell'integrazione Byuppini/Roadmap/Cerca nella SPA — lavori completati, vedi il suo §8. | Storico | ✅ CHIUSO |

> I 4 documenti sorgente originari (`byup-punto2/3/4`, `byup-spec-tecnica-*`) su
> `~/Desktop/` sono **integrati** qui e non sono più la fonte di verità.

---

## Mappa dei rimandi (chi rimanda a chi)

```
                        README.md  (indice)
                            │
            ┌───────────────┼───────────────────────────┐
            ▼               ▼                           ▼
   Contesto-App.md ◀──▶ Contratto-Dati.md      Architettura-Prototipo.md
   (hub, §A–§G)          (forme dati)            (prototipo §1–§13)
      │  │  │
      │  │  └─ §G.8 sintesi ─▶ Sicurezza-AntiAbuso.md   (🟠 in discussione)
      │  └──── §G.7 sintesi ─▶ Recupero-Ordine.md       (spec tecnica)
      └─────── §G.6 sintesi ─▶ Pagamenti-Divisione.md   (saldo + lock)
```

- **Contesto-App §G.6/§G.7/§G.8** sono **sintesi**: il dettaglio è nei tre spoke.
- I tre spoke rimandano **indietro** a Contesto-App (sezione di sintesi) e a
  Contratto-Dati (forme dati).
- **Contratto-Dati** rimanda a Contesto-App per il *perché* e agli spoke per il
  dettaglio dei flussi che descrive (pagamento, recupero, anti-abuso).
- **Architettura-Prototipo** (§1–§13) è citato da Contesto-App per il modello del
  prototipo (es. `activeOrder` in §9), ma non è fonte di scelte di prodotto.

---

## Convenzioni

- **Breadcrumb** in cima a ogni file: `📍 byup-Docs › <nome> · Indice`.
- **Box "Collegamenti"** in testa: link alle sezioni pertinenti degli altri file.
- **Anti-duplicazione**: il dettaglio di un tema vive **solo nel suo spoke**;
  l'hub tiene la sintesi + link, il contratto tiene le forme dati + link. →
  aggiornando un tema si tocca **un solo file** (più, al massimo, la sua sintesi).
- **Stato decisione**: ✅ DECISO · 🟠 IN DISCUSSIONE · 🧪 da validare. La lista
  delle questioni aperte è in [Contesto-App.md §G.9](Contesto-App.md).

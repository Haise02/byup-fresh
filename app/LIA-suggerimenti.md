# LIA — Suggerimenti personalizzati (legittimo interesse)

> **Valutazione dell'interesse legittimo** (art. 6.1.f GDPR) per la
> personalizzazione dei suggerimenti in-app della Byup App consumer.
> BOZZA da validare con il legale/DPO prima del lancio. Versione 1.0 · 2026-08-05.

## 1. Finalità e trattamento

Ordinare e comporre i contenuti suggeriti in-app (sezione "per te" della home,
ordinamento delle proposte) in base all'affinità con l'utente. Nessun invio di
comunicazioni: le promo restano su base consenso — A6 (generiche e su misura
sullo storico ordini) e A18 (preferenze alimentari) — vedi regola di
composizione in `byup-app-kit.jsx`.

## 2. Dati usati (e dati esclusi)

**Usati** — tutti di prima parte, non sensibili:
- gusti dichiarati volontariamente dall'utente nel profilo (cucine preferite);
- storico ordini effettuati su byup;
- città del **contesto d'uso corrente**: posizione usata al volo o città
  selezionata dall'utente.

**Esclusi per scelta di progetto (paletti fissati dal titolare):**
- allergeni e preferenze alimentari (dati ex art. 9 — restano sotto consenso A3
  e servono SOLO a filtrare i menù);
- **log di accesso registrati per sicurezza (registro A13)**: pescare la città
  dai log di sicurezza sarebbe un cambio di finalità (function creep) rispetto a
  quanto dichiarato a registro. La città arriva solo dal contesto d'uso.
- nessun dato di terze parti, nessun tracciato di spostamenti.

## 3. Test in tre parti

**a) Legittimità dell'interesse.** Migliorare la pertinenza del servizio di
scoperta locali è un interesse commerciale lecito e reale, riconosciuto come
tale dal considerando 47 GDPR per il trattamento di dati a fini di interesse
diretto dell'utente e del titolare.

**b) Necessità.** La personalizzazione richiede esattamente i tre dati elencati;
non esiste una via meno invasiva che produca lo stesso risultato. I dati non
lasciano il perimetro byup e non alimentano decisioni con effetti giuridici.

**c) Bilanciamento.** A favore dell'utente pesano:
- natura dei dati: prima parte, non sensibili, in parte **forniti spontaneamente**
  (i gusti nel profilo);
- aspettative ragionevoli: un'app di scoperta locali che suggerisce in base ai
  gusti è il comportamento atteso della categoria (pattern di mercato);
- **trasparenza proattiva**: hint one-shot al primo avvio della sezione
  suggeriti ("i suggerimenti sono personalizzati, gestisci da I miei dati") —
  non solo l'informativa;
- **opt-out effettivo e a portata**: toggle "Suggerimenti personalizzati" nel
  pannello I miei dati, attivo di default, disattivabile in due tocchi; alla
  disattivazione le proposte tornano generiche;
- l'opposizione è registrata nel log `consent_data` con timestamp.

## 4. Misure

- Informativa: sezione dedicata "Suggerimenti personalizzati" (finalità, dati,
  esclusioni, opt-out).
- Segregazione delle finalità: i log di sicurezza (A13) e i dati alimentari (A3)
  non sono leggibili dal motore di suggerimento.
- Riesame della presente LIA a ogni modifica dei dati usati o della finalità.

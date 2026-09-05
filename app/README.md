# byup App — i documenti di questa cartella

Il prototipo dell'app consumer è un mockup React senza build. Come funziona il
prodotto non sta qui: sta nei tre documenti di riferimento fuori dal repo, il
modello dati (ERD), il documento di progettazione tecnica (DPT) e la specifica
dei flussi applicativi (SFA), come dice [DOCUMENTI.md](../DOCUMENTI.md). Il 5
settembre 2026 (P-162) i file che qui descrivevano il prodotto sono usciti, dopo
che il loro contenuto è entrato nei documenti ufficiali: il contesto dell'app, il
contratto dei dati, la divisione dei pagamenti, il recupero dell'ordine, la
sicurezza anti abuso, il concetto dei Byuppini e la bozza di valutazione del
legittimo interesse.

Restano i file che parlano del mockup.

| File | Cosa contiene |
|------|---------------|
| [Architettura-Prototipo.md](Architettura-Prototipo.md) | Il *come* del prototipo React no-build: globali su `window`, i due entry point, router, storage, stato del menu, tema, trappole. Da leggere solo se si mette mano al codice. Usa-e-getta: non si trasporta in Flutter |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Design system dell'app: token (`window.ByupKit` in `byup-app-kit.jsx`), temi light/dark, tipografia, componenti, build standalone |
| [HANDOFF-prototipo-byup.md](HANDOFF-prototipo-byup.md) | Handoff storico (luglio 2026) dell'integrazione Byuppini, Roadmap e Cerca nella SPA. Chiuso |
| [Byuppini-Image-Prompts.md](Byuppini-Image-Prompts.md) | Prompt per generare gli asset immagine dei Byuppini |

Dove cercare ciò che prima stava qui: i moduli dell'app e la proposta dei
piatti nel DPT 5.2; il conto diviso, il saldo unico e i lock nel DPT 8.2 e nella
SFA 5.9; il recupero dell'ordine dalla webapp nella SFA 3.8; la sessione del
tavolo e la difesa dagli abusi nella SFA 11.6 e nel DPT 14.4; i consensi nella
SFA 18.2; il programma Byuppini nel DPT 18.5; la valutazione sui suggerimenti
nella DPIA.

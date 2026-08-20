# Documenti di riferimento

In questa cartella non vivono copie dei documenti. Ce ne sono state, ed erano
vecchie di due versioni senza che nulla lo segnalasse: chi ci costruiva sopra
costruiva sulla struttura sbagliata.

I documenti di riferimento sono tre e stanno fuori dal repo, nel progetto Byup:

- **ERD** — struttura dati. Sulla forma dei dati e sui vincoli di integrità è la
  fonte autorevole e non si discute: il prototipo simula, quindi non ha un
  modello dati da cui dedurre alcunché.
- **Documento di progettazione tecnica (DPT)** — architettura, moduli, scelte
  infrastrutturali.
- **Specifica dei flussi applicativi (SFA)** — comportamento: cosa succede, in
  che ordine, con quali vincoli.

Sul comportamento e sull'interfaccia la precedenza è del **prototipo**, dove il
prototipo si esprime: se una schermata mostra come funziona qualcosa, quello è
l'intento, e il documento che dice altro è rimasto indietro — si segnala e si
allinea il documento, non il contrario. Dove invece il prototipo tace, il
silenzio non è una decisione: errori, concorrenza, stati limite, permessi,
retention e vincoli normativi vivono nei documenti, e lì i documenti valgono
anche quando l'interfaccia non ne mostra traccia.

# Conformità — ISO/IEC 27001 e ISO 9001

Sezione **Conformità** di Spot (nav di sistema, accanto a Impostazioni Admin).
Raccoglie i registri e le evidenze per le due certificazioni.

Codice: [admin-conformita.jsx](admin-conformita.jsx) (guscio, primitive, Cruscotto),
[admin-conformita-registri.jsx](admin-conformita-registri.jsx) (rischi, fornitori),
[admin-conformita-eventi.jsx](admin-conformita-eventi.jsx) (incidenti, non conformità),
[admin-conformita-riesami.jsx](admin-conformita-riesami.jsx) (audit, riesame di direzione,
formazione, ripristini). Dati in [admin-conformita-data.jsx](admin-conformita-data.jsx).

Il riesame degli accessi vive a parte, in Impostazioni Admin → Riesame accessi:
vedi [Riesame-Accessi.md](Riesame-Accessi.md).

---

## Il criterio di cosa sta qui e cosa no

**In Spot stanno solo i registri la cui evidenza è un sottoprodotto
dell'operatività.** La domanda difficile di un auditor non è «avete una
politica» — quella si mostra in PDF in dieci secondi. È *«dimostratemi che
l'avete applicata, ripetutamente, negli ultimi dodici mesi»*. È lì che le
aziende cadono, ed è l'unica cosa che un applicativo sa fare meglio di un
documento.

**Fuori da Spot** restano politiche, procedure, Dichiarazione di Applicabilità,
metodologia di valutazione del rischio, verbali. Sono documenti: vivono nel
gestore documentale. I registri li **richiamano** con il campo `doc`, non li
duplicano. Dove il collegamento manca, la riga lo segnala come buco.

---

## Le due norme condividono l'ossatura

Audit interni (§9.2), riesame di direzione (§9.3), non conformità e azioni
correttive (§10.2) sono clausole **quasi identiche** nelle due norme. Qui sono
costruite **una volta sola** e valgono per entrambe le certificazioni: il chip
della norma su ogni riga dice a quale serve quel dato. Farne due copie separate
è l'errore classico di chi affronta le certificazioni in momenti diversi, e
raddoppia il lavoro di mantenimento per sempre.

---

## Cosa c'è, e perché

**Cruscotto.** Tutti gli obblighi ricorrenti con ultima esecuzione, cadenza,
prossima scadenza e responsabile. La scadenza **si calcola** dalla cadenza, non
si scrive. È la difesa contro il modo tipico di perdere una certificazione: non
sbagliare l'audit iniziale, ma ottenerla e poi lasciar slittare le cose al mese
otto, così la sorveglianza trova i buchi.

**Rischi (§6.1).** È il documento che l'auditor 27001 legge per primo: da lì
discende tutta la Dichiarazione di Applicabilità. Matrice probabilità×impatto
con toggle **inerente/residuo** — il confronto fra i due è ciò che dimostra che
il trattamento ha ridotto qualcosa, ed è più eloquente di qualsiasi tabella.

**Fornitori (A.5.19–5.23 · §8.4).** Chi tratta quali dati per conto di Byup, con
DPA, certificazioni e paese. Seconda area più bocciata dopo gli accessi. Chi non
ha DPA o non è mai stato riesaminato va in cima: sono rilievi formali, non
tecnici, e un auditor li trova subito.

**Incidenti (A.5.24–5.28).** Il campo che conta è `dataBreach`: fa partire
l'orologio delle **72 ore** verso il Garante. Il countdown è calcolato dalla
*scoperta*, non dalla chiusura.

**Non conformità (§10.2).** Il cuore della 9001, alimentato dalle segnalazioni
che arrivano già in Comunicazioni. Il passaggio che quasi tutti saltano è la
**verifica di efficacia**: un'azione chiusa senza verificare che abbia funzionato
non chiude la non conformità — e infatti se la verifica è negativa la NC torna
aperta invece di chiudersi lo stesso.

**Audit e riesami (§9.2, §9.3).** Il riesame di direzione si porta dietro un
**pacchetto di input che si compila da solo** leggendo i registri: nessun numero
è scritto a mano. È la riunione che tutti odiano preparare, ridotta a mezz'ora.
Lo stato delle azioni del riesame precedente non è una spunta ma una riverifica
sul dato vivo — «nominare un secondo Super Admin» si controlla contando i super
admin attivi, non fidandosi di una casella.

**Registri (A.6.3, A.8.13).** Formazione e test di ripristino: solo l'evidenza —
chi, quando, esito. «Quando avete provato l'ultimo restore» è la domanda che gli
auditor fanno sempre e a cui quasi nessuno sa rispondere con un registro.

---

## Il gestore documentale: Google Drive va bene

Molte aziende certificate lo usano. Le norme (§7.5 in entrambe) chiedono che
l'informazione documentata sia **approvata, versionata, disponibile a chi serve e
protetta da modifiche non volute**. Drive copre versionamento, disponibilità e
controllo accessi in modo nativo. Quattro cose vanno però configurate, perché
Drive da solo non le fa:

1. **Approvazione tracciabile.** Drive non ha un flusso di approvazione. Serve
   un'intestazione fissa in ogni documento con *versione, data, autore,
   approvatore*, più un indice generale (un foglio) che elenca i documenti in
   vigore. La cronologia revisioni di Drive fa il resto.

2. **Versione visibile.** «Ultima modifica» non è un numero di versione. La
   versione va nel titolo del file o nell'intestazione, e l'indice dice qual è
   quella in vigore.

3. **Permessi in sola lettura per default.** L'organizzazione vede, solo i
   titolari dei documenti modificano. È il modo in cui Drive soddisfa la
   «protezione da modifiche non volute».

4. **Niente cancellazioni.** I documenti superati non si eliminano: restano nella
   cronologia, e l'indice li marca come superati. Un documento sparito è un
   rilievo.

Struttura di cartelle che rispecchia i registri e rende immediati i collegamenti:
`Politiche/`, `Procedure/`, `Fornitori/<nome>/`, `Audit/<anno>/`,
`Riesami/<anno>/`, `Formazione/<corso>/`, `Registro-documenti` (l'indice).

Se un domani il volume cresce o serve un flusso di approvazione vero, si passa a
uno strumento GRC dedicato — ma non è il problema di adesso, e partire da lì
sarebbe spendere prima di sapere cosa serve.

---

## Cosa manca per la produzione

Come per il riesame accessi, qui è tutto **mock**: i dati stanno in memoria e
niente si salva. Per la produzione servono, oltre alla persistenza:

- **Notifiche sulle scadenze** degli adempimenti: il Cruscotto le mostra, ma
  qualcuno deve aprirlo. Un promemoria al responsabile quando mancano 30 giorni
  è ciò che rende il cruscotto un controllo invece che una pagina.
- **Collegamento reale ai documenti**: oggi `doc` è una stringa. Va sostituito
  con il link al file su Drive.
- **L'orologio delle 72 ore** deve far scattare una notifica vera, non solo
  colorarsi di rosso.
- **Storicizzazione dei riesami** con la stessa catena di integrità già usata per
  il riesame accessi, così anche verbali e attestazioni sono a prova di modifica.

---

## Avvertenza

Questa struttura è il punto di partenza da portare al consulente o all'auditor,
non un sostituto del loro giudizio: quali controlli siano applicabili e quanta
evidenza basti dipendono dal perimetro dichiarato e dall'analisi del rischio.

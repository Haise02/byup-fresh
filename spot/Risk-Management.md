# Risk Management — ISO/IEC 27001 e ISO 9001

Sezione **Risk Management** di Spot (nav di sistema, fra Economix e Sicurezza e
sistemi). Raccoglie i rischi, gli adempimenti e le evidenze per le due
certificazioni.

> Si chiamava «Conformità» fino a luglio 2026. Il nome tecnico della rotta e dei
> file resta `conformita`: è un fatto interno che non compare a schermo, e
> rinominarlo avrebbe toccato quindici file per zero effetto.

**Sei tab:** Cruscotto · Rischi · Fornitori · Incidenti · Non conformità ·
Audit e riesami.

Codice: [admin-conformita.jsx](admin-conformita.jsx) (guscio, primitive, Cruscotto),
[admin-conformita-registri.jsx](admin-conformita-registri.jsx) (rischi, fornitori),
[admin-conformita-eventi.jsx](admin-conformita-eventi.jsx) (incidenti, non conformità),
[admin-conformita-riesami.jsx](admin-conformita-riesami.jsx) (audit e riesame di
direzione, più i componenti `CfFormazione` e `CfTestRipristino` che vengono resi
altrove). Dati in [admin-conformita-data.jsx](admin-conformita-data.jsx).

**Tre registri sono usciti da questa sezione** pur restando obblighi tracciati
dal Cruscotto — il codice vive ancora qui, cambia solo dove si legge:

| Registro | Norma | Dove si legge ora |
|---|---|---|
| Riesame dei diritti di accesso | A.5.18 | Sicurezza e sistemi → Accessi ([Riesame-Accessi.md](Riesame-Accessi.md)) |
| Test di ripristino dei backup | A.8.13 | Sicurezza e sistemi → Diagnostica |
| Formazione del personale | A.6.3 | Risk Management → Formazione |

Il criterio è lo stesso in tutti e tre i casi: **il registro sta dove lavora chi
lo compila**, non dove lo cerca l'auditor. L'auditor ci arriva comunque, perché
il Cruscotto tiene l'obbligo e il pulsante «Apri» porta alla schermata giusta.

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

**Fornitori (A.5.19–5.23 · §8.4).** Chi tratta quali dati per conto di Byup.
Seconda area più bocciata dopo gli accessi. Chi non ha DPA o non è mai stato
riesaminato va in cima: sono rilievi formali, non tecnici, e un auditor li trova
subito.

In tabella stanno cinque colonne — fornitore, servizio, documenti, firmato il,
ultimo riesame — e non di più. Dati trattati, paese di elaborazione e
certificazioni si leggono aprendo la riga: in colonna erano tre blocchi di testo
lungo che schiacciavano le uniche due informazioni per cui la tabella esiste,
cioè **se il contratto c'è e da quando**. Quando il paese è fuori UE il
caricamento delle garanzie (SCC o decisione di adeguatezza) diventa obbligatorio
e la colonna documenti lo pretende.

**Incidenti (A.5.24–5.28).** Il campo che conta è `dataBreach`: fa partire
l'orologio delle **72 ore** verso il Garante, calcolato dalla *scoperta* e non
dalla chiusura. La notifica non è un banner sopra l'elenco ma un pulsante
**dentro** l'incidente, con conferma: notificare al Garante è un atto, e un atto
si compie stando sulla cosa che si sta notificando. Gli incidenti si aggiungono e
si modificano a mano — non tutti arrivano da un sistema, e quelli che contano di
più quasi mai.

**Non conformità (§10.2).** Il cuore della 9001, alimentato dalle segnalazioni
che arrivano già in Ticket. Il passaggio che quasi tutti saltano è la
**verifica di efficacia**: un'azione chiusa senza verificare che abbia funzionato
non chiude la non conformità — e infatti se la verifica è negativa la NC torna
aperta invece di chiudersi lo stesso.

**Audit e riesami (§9.2, §9.3).** Il riesame di direzione si porta dietro un
**pacchetto di input che si compila da solo** leggendo i registri: nessun numero
è scritto a mano. È la riunione che tutti odiano preparare, ridotta a mezz'ora.
Lo stato delle azioni del riesame precedente non è una spunta ma una riverifica
sul dato vivo — «nominare un secondo Super Admin» si controlla contando i super
admin attivi, non fidandosi di una casella.

**Formazione (A.6.3) e test di ripristino (A.8.13).** Non stanno più fra queste
tab: solo l'evidenza — chi, quando, esito — e si compilano dove si lavora
(Formazione, Diagnostica). Il Cruscotto tiene l'obbligo e ci porta.

Sul ripristino vale la pena dire una cosa che il registro da solo non dice: **la
tabella non è il test.** Il test si fa altrove, ripristinando uno snapshot su
un'istanza isolata; qui c'è la traccia. E una traccia compilata a mano resta
un'autodichiarazione: la versione che vale davvero è quella in cui è il job di
ripristino a scrivere la riga. Il numero che conta non è l'esito ma **il tempo
contro l'RTO dichiarato**: «riuscito» da solo non dice se saresti arrivato in
tempo, ed è stato il tempo a far emergere il peggioramento di novembre 2025.

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

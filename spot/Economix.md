# Economix — i conti di Byup

Sezione **Economix** di Spot (nav di sistema, prima di Risk Management). Non è la
contabilità del ristoratore — quella sta nel gestionale — ma i conti **di Byup
come azienda**: cosa spende, cosa incassa, quanto le resta e quanto dura.

**Cinque tab:** Costi · Conto economico · Cassa · Stato patrimoniale · Dati.

Codice: [admin-economix-data.jsx](admin-economix-data.jsx) (dati e costanti),
[admin-economix-modello.jsx](admin-economix-modello.jsx) (tutto il calcolo),
[admin-economix.jsx](admin-economix.jsx) (tab Costi e modali),
[admin-economix-bilancio.jsx](admin-economix-bilancio.jsx) (conto economico),
[admin-economix-cassa.jsx](admin-economix-cassa.jsx) (cassa e stato patrimoniale),
[admin-economix-proiezione.jsx](admin-economix-proiezione.jsx) (tab Dati e guscio).

---

## Il modello: nessun numero futuro è scritto a mano

Ogni riga di costo è una **formula su un driver** moltiplicata per un prezzo
unitario — non un numero digitato in una cella. Il driver è il numero che fa
salire o scendere il consumo: locali attivi, nuovi locali del mese, utenti app,
transazioni. Da lì discende tutto.

È l'unica forma di proiezione che si può difendere riga per riga, ed è il motivo
per cui si usa nel SaaS al posto dei modelli di serie storica: quelli proiettano
la curva senza sapere perché sale.

Il ricavo segue il modello dichiarato in
[app/Contesto-App.md](../app/Contesto-App.md) §C: byup **non guadagna sui
pagamenti**, le commissioni Stripe sono riproiettate ai ristoratori e compaiono
come partita di giro dichiarata. Il ricavo è l'abbonamento a Byup Fresh, a
consumo di **transazioni pesate** — un pagamento in app pesa 0,5, uno in cassa
1,0. Spingere l'app dimezza la quota consumata dal locale, e quindi *riduce* il
ricavo da ordini extra: è una tensione reale del modello, non un errore.

---

## Le distinzioni che il modello tiene ferme

Sono quattro, e ognuna esiste perché confonderle produce un numero sbagliato che
sembra giusto.

### Costo ≠ cassa

Un canone annuale pesa **un dodicesimo al mese** sul conto economico ed **esce
tutto insieme** al rinnovo. Due funzioni diverse (`ecoFissiDelMese` e
`ecoFissiCassaDelMese`) perché sono due domande diverse. Usarne una sola faceva
uscire l'assicurazione a rate che nessuno paga, e lasciava senza contropartita il
risconto che quella differenza genera.

### Bene strumentale ≠ costo

Un portatile da 2.400 euro non è un costo del mese: è un bene. Esce dalla cassa
il giorno dell'acquisto, entra nel conto economico **a quote** per gli anni della
vita utile, e il valore residuo resta fra le immobilizzazioni. Registrarlo come
costo dichiarerebbe una perdita che non c'è stata e farebbe sparire dal
patrimonio una cosa che si possiede.

Si sceglie **in anni**, non in aliquota — «quanto pensi che duri» è la domanda
che uno si fa davanti a un macchinario — con i coefficienti ministeriali
segnalati. Sotto la soglia di legge di **516,46 €** il bene si deduce tutto
nell'anno. Il primo esercizio va a **metà aliquota**, e l'ammortamento si ferma
quando il fondo raggiunge il costo: per questo `ecoAmmortamento` accumula in
avanti invece di moltiplicare i mesi trascorsi per la quota.

**Il terreno non si ammortizza mai.** Non perde valore con l'uso: esce dalla
cassa, resta nell'attivo al costo per sempre, e dal conto economico non passa.

### IVA a debito ≠ IVA a credito ≠ IVA versata

Tre cose diverse che il linguaggio comune impasta:

- **IVA a debito** — quella incassata dai ristoratori sugli abbonamenti. La devi
  allo Stato.
- **IVA a credito** — quella pagata ai fornitori dentro le uscite. La detrai.
- **IVA versata** — quella che esce davvero, e **solo alle scadenze di
  liquidazione**. In regime trimestrale sono quattro date l'anno; negli altri
  otto mesi dal conto non parte un euro.

Il saldo del mese è debito − credito, e **il credito si riporta**: non si chiede
a rimborso ogni trimestre, abbatte il debito che matura dopo. Senza il riporto il
cruscotto si contraddiceva da solo, dicendo «saldo a credito» e insieme «da
versare il 16 novembre».

Il quadro che ne esce per Byup è netto e vale la pena saperlo: **comprando molto
più di quanto vende, Byup non ha mai versato IVA** e ha accumulato circa 10.900 €
di credito da gennaio 2025. È un attivo reale, e sta nei crediti tributari dello
stato patrimoniale.

### Ritenuta d'acconto ≠ pagamento

Su un compenso a un professionista una parte non esce al fornitore: resta in
cassa fino al 16 del mese dopo. Senza modellare lo sfasamento, il bilancio
mostrerebbe un debito per ritenute che secondo la cassa è già stato pagato.

---

## Cosa c'è, e perché

**Costi.** In cima l'andamento — grafico a barre, per mese o per anno — poi le
schede del periodo, poi due tabelle: costi a consumo (per servizio) e costi fissi
e una tantum (per voce). Ogni riga si apre: i costi fissi nella loro scheda, i
costi a consumo in una **modale diversa**, perché un servizio a consumo non ha un
importo da scrivere ma una formula — si modificano driver, consumo unitario e
prezzo, e sotto si legge cosa producono mentre si scrive.

Eliminare un costo ricorrente **non cancella il passato**: la voce si *chiude*
alla data da cui non vale più. I mesi precedenti l'hanno avuta davvero, e
toglierla da lì riscriverebbe consuntivi chiusi — compresi quelli su cui è stato
calcolato un risultato d'esercizio.

**Conto economico.** Riclassificato a margine di contribuzione, **consuntivo e
mai proiettato**: contiene solo mesi accaduti, ricalcolati sui dati presenti
adesso. Un conto economico che contiene mesi futuri è uno scenario travestito da
bilancio. Selettore dell'anno in alto a destra.

**Cassa.** Quattro schede più il saldo IVA, la tabella entrate e uscite (dal mese
in corso all'indietro, tre righe a vista) e lo scadenzario. L'**autonomia** è una
divisione sola, ed è la stessa che si legge a schermo:

```
cassa ÷ (uscite medie mensili − entrate medie mensili)
```

Senza il secondo termine il conto darebbe una data di morte anche a un'azienda in
pareggio. Lo scenario «senza incassi» è lo stesso conto col termine azzerato, e
per questo condivide il divisore.

Lo scadenzario mostra dieci righe e poi scorre; ogni voce apre il costo che la
genera, quando ce n'è uno.

**Stato patrimoniale.** Selettore dell'anno: un bilancio è a una *data*, quindi
cambiare anno cambia l'ultimo mese, la cassa (il saldo ricostruito di quel mese,
non la lettura di stamattina) e la posizione IVA.

La cosa più importante di questa tab è una riga che di solito non c'è:
**«Differenza da riconciliare»**. Compare solo quando serve e dice quanto non
torna. Prima il bilancio quadrava perché il patrimonio netto veniva ritoccato
finché tornava — e un bilancio che quadra per costruzione non è una verifica, è
una tautologia, e assorbe in silenzio qualunque errore altrove.

I saldi che il modello non può dedurre — capitale, riserve, versamenti dei soci,
crediti tributari, debiti bancari — si modificano da un pannello, ciascuno con la
nota di provenienza e la data a cui è vero. Nello stesso pannello ci sono i
**due parametri che decidevano voci intere restando invisibili**: giorni medi di
incasso e di pagamento, che da soli producono i crediti verso clienti e i debiti
verso fornitori.

**Dati.** La composizione dei costi in una torta. Le tabelle dicono quanto costa
ogni voce; nessuna diceva quanto **pesa**. Passando su una fetta il centro passa
dal totale a quella categoria e sotto si apre lo spaccato delle voci. Le
percentuali delle voci sono sul totale, così sommano a quella del padre.

---

## Cosa è già vero e cosa è mock

**Vero:** tutto il calcolo. Regressione sui dodici mesi chiusi, ammortamenti con
la mezza aliquota del primo esercizio, liquidazione IVA col riporto del credito,
riclassificazione del conto economico, quadratura dello stato patrimoniale.
Ogni identità è verificata: netto = entrate − uscite − IVA versata, saldo IVA =
debito − credito, attivo = passivo.

**Mock:** i dati e ogni collegamento verso l'esterno. I costi «letti
automaticamente» non sono letti da nessuno, il conto corrente non è collegato,
le fatture non arrivano dallo SDI. Le connessioni ai fornitori hanno uno stato
che si può guardare ma non si accende niente: è deliberato, perché un costo
«letto» che in realtà è inventato è la bugia più facile da raccontarsi.

---

## Cosa serve per la produzione

- **Lettura vera dei consumi** dai fornitori: AWS Cost Explorer, pannello
  OpenAPI, fatturazione Google. Sono quattro integrazioni diverse, non un
  pulsante «collega».
- **Conto corrente**: CAMT.053 via SFTP (rendiconto di fine giornata, stabile) o
  PSD2/AISP (consenso che scade ogni 90 giorni e va rinnovato con
  autenticazione).
- **Fatture dallo SDI** per riconciliare i costi con i documenti.
- **Persistenza**: oggi ogni modifica vive in memoria e sparisce al ricaricamento.

---

## Avvertenza

I numeri sono plausibili, non veri, e il regime fiscale modellato è quello di una
**startup innovativa** con perdite pregresse (nessuna imposta finché non vengono
assorbite). Economix serve a vedere i conti e a fare domande — **non sostituisce
il commercialista** e non produce nessun adempimento.

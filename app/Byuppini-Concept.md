# Byuppini — concept, meccaniche ed economia

> **Stato: nulla di tutto questo è attivo, e niente vive nel prototipo.** I Byuppini sono usciti dall'app consumer con `fe14041` («Beta v2: app consumer senza Byuppini e Cerca»), che ha smontato le schermate integrate poco prima da `fc906d0`. Oggi la tab bar ha Home, Cerca, QR e Profilo, e delle schermate qui descritte non resta codice in nessun file. La frase è tornata vera il **4 settembre 2026** (P-122): fino ad allora nella testata del Profilo restavano i contrassegni dei traguardi («Pizza lover», «Re dello spritz», il livello «LIV. 3» e il «+» per sceglierli, `PROFILE_TAGS`), messi nel luglio 2026 e sopravvissuti alla Beta v2 — i riconoscimenti di `byuppini_badges`, esposti mentre il programma era «non esposto in alcuna interfaccia». Sono usciti con l'avatar che resta; rientreranno col programma, quando sarà attivo e valutato, e i riconoscimenti fondati sulla storia degli ordini entreranno nella valutazione d'impatto come trattamento ulteriore.
>
> Sul piano del prodotto la posizione è la stessa: SFA §22 e DPT classificano il programma fra le predisposizioni non attive — il dominio esiste a schema, ma niente è esposto in alcuna interfaccia e l'attivazione è subordinata alla verifica legale del programma punti e premi. Due elementi la verifica dovrà guardarli da vicino: la scadenza dei punti a dodici mesi e il valore di conversione dichiarato (100 punti = 1€), che qualificano il programma come operazione a premio con obblighi propri. Byup Games è già uscito il 7 ago 2026 e con esso ogni meccanica aleatoria: la scelta è definitiva, i byuppini si guadagnano ordinando e con le sfide, mai giocando.
>
> **Questo documento è il punto di ripartenza**, non il codice. Il vecchio `app.jsx` con portafoglio, sfide, premi, traguardi e percorso è recuperabile con `git show fc906d0:app/app.jsx`, ma serve come riferimento visivo e non come base: tab bar e superfici circostanti sono cambiate, reinnestarlo costerebbe più di riscriverlo.

## Cosa sono
I **Byuppini** sono la valuta-fedeltà di byup: un sistema unico che unisce punti fedeltà (dagli ordini) e punti-engagement (da sfide dal vivo e azioni). Si accumulano, si spendono in credito o premi, e fanno salire di livello.

Due grandezze distinte, per non "svuotare" il progresso quando riscatti:
- **Saldo** — i byuppini spendibili adesso (scendono quando riscatti).
- **XP / lifetime** — i byuppini totali guadagnati da sempre; determinano il **livello** e non calano mai.

## Come si guadagnano
Fedeltà (ordini via app): **5 byuppini per € speso**; **+20% se paghi con byup pay** (spinge deliberatamente il flywheel del mezzo-ordine). Un ordine da 20€ pagato in app = ~120 byuppini.

Sfide dal vivo: check-in scansionando il QR del tavolo (+30), "prova 3 cucine diverse questa settimana" (+150), "ordina 2 volte in 7 giorni" (+100), streak settimanale 🔥, recensione post-cena (+40).

Azioni una-tantum: completa profilo (+50), primo ordine app (+200), imposta diete/allergeni (+30), attiva notifiche (+20), invita un amico (+300 a testa quando ordina la prima volta).

## Come si spendono
Credito: **100 byuppini = 1€** di sconto (lineare, semplice), con taglio bonus (1.000 → 12€).

Catalogo premi: gadget byup (sticker 150, tote 500, borraccia 800), esperienze presso i locali partner (dessert offerto 400, pizza offerta 700, aperitivo x2 900), e in cima la **byup card cashback** — premio aspirazionale, sbloccabile a LIV.5 / 5.000 byuppini.

Livelli (LIV.1→LIV.8: Novizio, Esploratore, Buongustaio, Intenditore, Gourmet, Maestro, Leggenda, Icona): ogni livello dà perk crescenti — moltiplicatore punti (da ×1 a ×3), bonus byuppini una-tantum, accesso anticipato alle offerte, premi esclusivi. Salire di livello = momento celebrativo (mascotte + confetti).

Achievement/badge: traguardi collezionabili (Pizza lover, Re dello spritz…), ognuno con un bonus una-tantum di byuppini. Non sono più nel profilo dal 4 settembre 2026 (P-122): torneranno col programma.

## Far tornare i conti
Il costo dei byuppini è un investimento di acquisizione e retention, non una perdita secca. Il meccanismo che lo giustifica è il modello di byup: ogni comanda saldata in app pesa col coefficiente ridotto del piano verso le soglie del piano del ristoratore, quindi più ordini-app significano più pressione sui piani, più upgrade, più ricavi byup. I byuppini esistono per spingere gli ordini in-app.

Leve che tengono basso il costo reale:
- **Ritorno calibrato:** ~2-3% netto del valore ordine (5 byuppini/€ ≈ 5% teorico se tutto convertito in credito, ma nella pratica molto meno — vedi sotto).
- **Breakage:** nei programmi loyalty il 20-30% dei punti non viene mai riscattato; con scadenza a 12 mesi il costo effettivo scende ancora.
- **Premi co-finanziati:** le esperienze (dessert/aperitivo offerto) sono a carico del locale partner, non di byup — alto valore percepito, costo byup ≈ zero. I gadget hanno costo di produzione inferiore al valore percepito.
- **Cap e scadenza:** tetto di byuppini/mese e scadenza punti limitano la passività a bilancio.
- **byup card cashback** finanziata in parte da interchange e accordi coi locali: premia i migliori senza bruciare cassa.

Obiettivo di sostenibilità: costo netto contenuto per utente attivo/mese (ordine di 0,50–1,00€), coperto dal margine sull'upsell dei piani che gli ordini-app generano. "Perderci qualcosina" è accettabile: è CAC/retention, non spreco.

## Marketing
Meccanica collect-and-unlock con feedback dopaminico (numero che sale, mascotte che reagisce, confetti al level-up); sfide settimanali a tempo per creare urgenza e ritorno frequente; referral in byuppini per la crescita virale (amico: +300 a testa; portare un locale su byup: +5.000, cioè 50€ in credito); leaderboard opzionale tra amici e gruppi (non ancora nel prototipo) per la competizione sociale.

## Schermate
Impianto previsto quando il programma verrà attivato, e già realizzato una volta prima della rimozione: le prime quattro come segmenti di un'unica schermata Byuppini, il percorso come schermata a parte. Nessuna di queste esiste oggi nel prototipo.
1. **Portafoglio** — saldo grande + mascotte, livello e barra al prossimo, scorcio del percorso, scorciatoia ai premi.
2. **Sfide** — "guadagna oggi", missioni della settimana con progress, sfida dal vivo (QR), streak, referral, attività recente.
3. **Premi** — catalogo a segmenti (credito / gadget / esperienze / byup card), ogni premio col costo in byuppini.
4. **Traguardi** — collezione badge sbloccati e bloccati, ognuno col bonus.
5. **Level-up** — overlay celebrativo (mascotte + confetti + ricompensa).
6. **Percorso (roadmap)** — mappa-mondo verticale con gli 8 locali che si sbloccano salendo di livello, mascotte "SEI QUI" e popup di dettaglio per ogni livello.

# Panorama · prototipo

Il Business Manager di advertising di byup: il locale compra visibilità dentro l'app consumer, la controlla e ne misura il ritorno. Prodotto web separato da Fresh (scheda a parte), stesso account. Dati dimostrativi: account demo di Fresh, **Mario Rossi · Cacio e Pepe · Trastevere**.

## Come si apre
- **Online** (dal 25 ottobre): `byup-fresh.vercel.app/panorama/byup-panorama.html`. Dalla home dell'ecosistema, card Panorama: «Apri Panorama» oppure «Primo accesso» (il percorso da Fresh: card nella dashboard, richiesta, valutazione, approvazione, benvenuto, regole, wallet, home). In basso a sinistra «Home byup» riporta alla home, come nelle altre app.
- `byup-panorama.html`: la versione del repo, stessa tecnica di Desk (React senza build, Babel nel browser, va servita via HTTP).
- `panorama-standalone.html`: un solo file, si apre con doppio clic (sta nella cartella di lavoro e nell'artifact, non nel repo `byup-fresh`).
- `gradient-panorama.html`: il laboratorio per scegliere il gradient dei widget (il salvataggio funziona solo dall'artifact su claude.ai).
- Link diretti: `#variante.sezione`, per esempio `#atlante.campagne`, `#diorama.risultati`. Sezioni: `panorama`, `campagne`, `notifiche`, `pubblico`, `risultati`, `wallet`, `accesso`; `#atlante.accesso.inizio` apre il primo accesso dal primo passo. I vecchi link `#notte…` aprono la A.

## Le varianti (stesse funzioni)
| | Variante | Idea | Tema |
|---|---|---|---|
| A | **Atlante** (scelta di Nilo) | Barra in alto com'era: logo, sezioni, wallet, Promuovi, avvisi, tema e profilo (senza la riga di saluto sotto). Prima fila: il mondo della A al 70% e **Byuppino AI** al 30% | chiaro e scuro, passaggio circolare |
| C | **Diorama** | Barra laterale, bento chiaro; Trastevere come isola pastello che galleggia, Byuppino come assistente fisso | solo chiaro |

La B «Notte» (mondo a tutto schermo, vetro scuro) è stata tolta il 24 ottobre su richiesta di Nilo.

## Il gradient
Viene da `gradient panorama.png` di Nilo, rifatto in codice: 12 macchie sfumate (`--mesh` in `pano-styles.css`), uguale al PNG al 99,5%, senza fasce né righe, con una grana finissima (`--grain`). Nilo ha scelto il **codice vivo** (il gradient si muove piano). Regole per dimensione:
- **Grandi** (carta wallet, carta wallet della home A, testata di Byuppino AI e di Byuppino in C): gradient pieno, vivo e un po' più veloce (9–10 s).
- **Medi** (carta piccola nella barra di C, caselle «Tuo» del digest, scheda del locale, note, pannello di Risultati e dell'accesso approvato): vivo a ritmo normale (16 s), con un velo bianco dove c'è molto testo (scuro nel tema scuro).
- **Piccoli** (avatar, bolle delle posizioni, pillole, icone): mai il gradient pieno, perché tanti colori in poco spazio stonano. Solo come **bordo** che gira piano, come il bordino del bottone Promuovi; le icone piccole hanno una tinta sola e le barrette un colore solo.
Le alternative si provano in `gradient-panorama.html`.

## La home della A (25 ottobre)
- **Altezza**: la prima fila è alta `100vh − 300 px`, tra 440 e 600 px: su un portatile (1366–1536 di larghezza, 730–800 di altezza) della fila sotto si vede almeno il 70%.
- **Mondo**: quello della A di prima, in tutte le sue forme (Trastevere di giorno, notte di sera); a destra il riquadro chiaro «Persone raggiunte oggi» e la zona attiva più piccola. Tolto il pannello «Adesso». Sotto le fasce, «Simula il digest» e gli strumenti; sotto i 900 px di mondo il digest resta solo icona e sotto i 700 si tolgono + e −.
- **Byuppino AI**: una proposta alla volta, con il dato che la regge (a barre se la colonna è alta, una riga se è bassa), quanto costa e un bottone; sotto «Chiedi» e la conversazione. Regola del 25 ottobre: **in un tocco fa solo ciò che non tocca gli spazi a contesa** (mettere un piatto o un evento in vetrina, pausa e riattiva, ricarica). Le campagne su ricerca, eventi, offerte le **prepara nella procedura completa** già compilata, e il digest lo apre senza prenotarlo: controlli e confermi tu. Nel prototipo è un motore di intenti scritto a mano, non un modello.
- **Riquadri** che riempiono il box: wallet con l'anello del limite del mese (scuro su chiaro, chiaro su scuro), metodo di pagamento (le carte girano da sole ogni 1,5 s e con lo swipe, niente frecce; il riquadro non cambia mai misura), questa settimana (speso → incassato), coperti portati.
- **Campagne in corso**: interruttore sempre a sinistra, prima della foto; il budget è un anello con accanto speso e tetto. **In calendario** scorre dentro la scheda, **In arrivo** (Fase 2) riempie la sua.
- **Cosa puoi comprare** (spostato qui dalle Campagne): nove spazi in una griglia piena 3 × 3 (le campagne; push all'asta, lista in app e vetrina; la Fase 2), ognuno con lo scorcio vero dell'app dove compare; «Disponibile» o «Fase 2». Gli annunci dei fornitori di Hubble non ci sono: non li compra il locale.
- **Animazioni**: numeri che salgono, barre che crescono, linea dei coperti che si disegna; sempre vivi il punto di oggi, la stima tratteggiata, il gradient delle carte grandi.
- **Cambio tema**: il cerchio parte dal bottone; durante il passaggio si fermano mondo 3D, gradient e transizioni.

## Promuovi in un tap (dal 25 ottobre)
È una scorciatoia, non una campagna: mette **un piatto o un evento in cima alla vetrina** del locale (la scheda «In evidenza» sopra a tutto), per chi apre Cacio e Pepe nell'app. Prezzo fisso al giorno (2 €, segnaposto da decidere), dal wallet a fine giornata, si spegne da sola. Non tocca gli spazi dove i locali si contendono la visibilità: per quelli c'è **Nuova campagna**. Nella finestra: piatto o evento (dal menù e dagli eventi di Fresh), per quanto, la stima delle visite alla vetrina e l'anteprima della vetrina com'è nell'app.

## Notifiche: push all'asta, lista in app a prezzo fisso (25 ottobre)
Le notifiche le manda solo byup, una per zona e fascia (12:15, 18:30, 20:00). Ogni invio ha due parti, che si comprano in modo diverso:
- **Push sul telefono** (la notifica sullo schermo bloccato): i **3 locali scritti nella notifica** si vincono **all'asta**. byup crea gli slot; l'asta è a busta chiusa e si chiude **15 minuti prima dell'invio**. Conta **offerta × qualità** del locale (voto, foto, tocchi; Cacio e Pepe ×1,15), **uno per categoria**, e chi vince paga il **secondo prezzo** (quanto basta per superare chi lo segue, mai più della sua offerta). **Prezzo minimo** in base alle persone raggiunte: 2,50 € ogni 1.000. Ogni locale vince al massimo **2 push a settimana**. L'offerta massima resta bloccata nel wallet fino alla chiusura; se non entri torna subito disponibile.
- **Lista in app** (si apre dalla push, dentro l'app): il 4° e il 5° posto a **prezzo fisso**, si prenotano come prima (da € 5).
Nel cassetto di ogni casella: scheda «Push all'asta» (stato, minimo, di solito, qualità, offerta con stima di Byuppino, cambia, ritira, «Simula la chiusura» solo nel prototipo, esito con chi è nella push) e scheda «Lista in app» (posti 4° e 5°, pubblico, prenota). La griglia segna l'asta, la tua offerta e il tetto raggiunto.

## Le anteprime nell'app
Le anteprime degli annunci sono le schermate vere del prototipo dell'app byup (cartella `app/`, stesse misure, foto e componenti), disegnate a 390 punti e rimpicciolite nel telefono. L'annuncio porta sempre «Sponsorizzato».

| Posizionamento | Dove compare |
|---|---|
| Ricerca in cima | «Disponibili adesso», primo della lista (card grande con orari) |
| Offerta flash | home, sezione «In evidenza» (card vino con la pillola lime e il conto alla rovescia) |
| Eventi in evidenza | home, sezione «Da scoprire» (card in primo piano con la data) |
| Posto nel digest | la notifica sullo schermo bloccato e la lista «Stasera a Trastevere» |
| Consigliati «Per te» (Fase 2) | «Stasera per te» |
| Mappa e categorie (Fase 2) | il pin e la prima card in basso sulla mappa |
| Piatto in evidenza (Fase 2) | la categoria, prima card della griglia |
| In evidenza in vetrina (Promuovi in un tap) | la vetrina del locale, scheda «In evidenza» in cima |

Nelle due anteprime della home il telefono scorre da solo fino all'annuncio. Nel posto nel digest il telefono si vede **da vicino**, a grandezza vera e tagliato: la notifica e la lista si leggono. Il marchio byup nelle icone dell'app è il file ufficiale (`byuploghi-16 a`, stessi tracciati); il colore può cambiare, la forma no.

## Il mondo 3D (home)
Trastevere in miniatura (Tevere, Gianicolo, campanile, piazza col locale). I puntini sono persone con l'app aperta: le onde di reach le raggiungono, alcune toccano l'annuncio, poche camminano fino al locale (+ coperti). Fasce **Pranzo / Aperitivo / Cena** (luce e dati cambiano), **Simula il digest** (la push di zona con i 4 locali, uno per categoria), zoom con la rotellina e rotazione trascinando. Tutti i numeri sono dimostrativi.

## Mappa delle schermate e fasi
| Sezione | Contenuto | Fase |
|---|---|---|
| Panorama (home) | Mondo 3D, Byuppino AI (propone; in un tocco solo vetrina, pausa, ricarica), wallet, metodo di pagamento, «hai speso / ti ha portato», coperti, campagne in corso con interruttore, calendario promozioni, incasso giorno per giorno, cosa puoi comprare | MVP |
| ↳ Autopilota, Riempi-sala automatico | Card spente con etichetta | Fase 2 |
| Campagne | Riepilogo su una riga (si tocca per filtrare), filtri per stato, tabella con interruttore a sinistra, periodo sotto lo stato, budget ad anello; dettaglio con imbuto e anteprima in app | MVP |
| Nuova campagna (7 passi) | Obiettivo (+ template per occasione) → Cosa (locale, evento, offerta da Fresh) → Dove → Pubblico → Budget e durata → Annuncio (3 versioni generate, controlli automatici) → Riepilogo | MVP |
| ↳ Piatto in evidenza, Consigliati «Per te», Mappa e categorie, Più delivery, Paga a risultato | Visibili e bloccati | Fase 2 |
| Promuovi in un tap | Un piatto o un evento in cima alla vetrina, prezzo fisso al giorno, stima e via | MVP |
| Notifiche | Griglia 7 giorni × 3 fasce del digest di zona: i 3 posti nella push all'asta (busta chiusa, secondo prezzo, chiusura 15 minuti prima, minimo per persone raggiunte, tetto 2 a settimana), il 4° e il 5° nella lista in app a prezzo fisso; offerte, prenotazioni e risultati | MVP |
| ↳ Notifica dedicata | Su approvazione byup | Fase 2 |
| Pubblico | Gruppi anonimi con numeri e azioni; sotto le 100 persone un gruppo non si usa | MVP |
| ↳ Gruppo su misura | | Fase 2 |
| Risultati | ROAS in chiaro, KPI, incasso vs spesa al giorno, imbuto, rendimento per posizionamento, mappa di calore giorno × fascia | MVP |
| Wallet | Bento a due colonne: carta del wallet e limiti alla pari; ricarica automatica con i tagli e i bonus dentro (50/100/200/500), metodi di pagamento; movimenti alti quanto le due schede accanto | MVP |
| Accesso | Stati: non richiesto, richiesto, in revisione, approvato (benvenuto → regole → wallet), lista d'attesa, rifiutato, sospeso. Card e scorciatoie in Fresh | MVP |
| Asta completa, prezzo dinamico | Non ancora nel prototipo (vedi le notifiche push all'asta, sotto) | Fase 3 |

## Flussi coperti dal prototipo
1. **Accesso**: card in Fresh → «Richiedi accesso» → in revisione (cosa guardiamo) → approvato → benvenuto, regole dei contenuti, primo caricamento del wallet.
2. **Ricarica**: importo con bonus → metodo (carta di Fresh, SEPA, nuova carta) → ricarica automatica → saldo aggiornato e movimenti.
3. **Promuovi in un tap** dalla barra, da Byuppino, da Fresh (evento) → in vetrina subito, con «Annulla». Per gli spazi dell'app si passa dalla procedura completa.
4. **Nuova campagna** (procedura completa) → inviata → controllo automatico; revisione a mano solo se cita marchi o squadre.
5. **Posto nel digest**: casella → posizione e prezzo → pubblico → anteprima notifica e lista in app → prenotato (importo bloccato fino all'invio, annullabile).
6. **Campagna rifiutata**: banner con le note di byup → «Correggi e rinvia» apre l'annuncio con i controlli che diventano verdi → di nuovo in revisione.
7. **Report**: Risultati e dettaglio campagna (imbuto, ROAS, costo per coperto, attribuzione spiegata).

## Viste in Desk per governare Panorama (solo funzioni)
- **Richieste di accesso**: coda con dati del locale precompilati e punteggio di idoneità (uso di Fresh, giorni attivi, voto, completezza profilo, ordini/prenotazioni byup, anzianità); approva, rifiuta con motivo, lista d'attesa per zona, invito manuale, sospensione.
- **Revisione contenuti**: campagne segnalate dal controllo automatico o dagli utenti; approva, chiedi correzione con note per campo, rifiuta; storico per locale.
- **Inventario e prezzi**: zone del digest, fasce orarie, posti per notifica (3–5), listino per posizione e fascia, densità (annunci ogni N risultati), soglie di qualità per posizionamento, cap per utente.
- **Digest**: calendario per zona e fascia, composizione (esclusiva di categoria), notifiche editoriali di byup separate, notifica dedicata su approvazione.
- **Anti-frode**: tocchi anomali, budget bruciato in pochi minuti, rimborsi automatici al wallet, blocchi.
- **Ricavi**: ricariche, bonus concessi, spesa per posizionamento e zona, ROAS medio dei locali, wallet dormienti.

## Modello dati essenziale
- **Locale** 1–1 **Wallet** (saldo, bonus, auto-ricarica, limiti) 1–N **Movimento** (ricarica, bonus, addebito, blocco, rimborso).
- **Locale** 1–1 **Accesso** (stato, punteggio, motivi, date) — gestito in Desk.
- **Locale** 1–N **Campagna** (obiettivo, oggetto → evento/offerta/piatto di Fresh, tipo di posizionamento, budget, date, stato, pubblico) 1–N **Annuncio** (titolo, testo, foto, CTA, esito controlli) 1–N **Revisione** (esito, note per campo, autore Desk).
- **Zona** 1–N **Slot digest** (data, fascia, 3–5 posizioni con prezzo) N–1 **Notifica digest** (inviata da byup); **Prenotazione** = Locale × posizione × slot, con categoria (esclusiva).
- **Audience anonima** (definizione, dimensione, minimo 100) usata da Campagna/Prenotazione; nessun legame verso persone visibile al locale.
- **Evento di risultato** (impression, tocco, prenotazione, ordine, conto Fresh) → **Attribuzione** (finestra 7 giorni, campagna, coperti, incasso).

## Rischi, casi limite, scelte aperte
- **Nome**: «Panorama» (prodotto) e «Panoramica» (home di Fresh) sono quasi uguali. Valutare di chiamare la home di Panorama solo «Panorama» e mai «Panoramica».
- **Privacy**: gruppi piccoli possono rendere riconoscibili le persone → soglia minima (qui 100) e niente filtri combinati sotto soglia. Le ricerche su «partita» o simili sono aggregate.
- **Attribuzione**: un cliente abituale che tocca l'annuncio sarebbe venuto comunque → in futuro un gruppo di controllo (incrementalità). Conti divisi e tavoli misti: un coperto alla volta.
- **Digest**: zone con pochi locali (meno di 3 → niente digest), slot invenduti (byup li riempie con contenuti editoriali?), annullamenti a ridosso dell'invio (qui: fino a 2 ore prima).
- **Wallet**: campagne che finiscono il saldo a metà sera; rimborsi anti-frode; fatturazione e IVA delle ricariche e dei bonus da chiarire con il commercialista.
- **Qualità**: soglie per i posizionamenti migliori (voto, foto) da tarare per non escludere i locali nuovi.

**Decisioni aperte, con la proposta**
1. *Pagamento a risultato o solo asta nell'MVP?* → MVP a **tocco con listino fisso per fascia** (niente asta), pagamento a risultato in Fase 2 quando l'attribuzione è stabile.
2. *Panorama in tutti i piani di Fresh o dal piano medio in su?* → **Starter e superiori**, su approvazione; il Gratuito può richiederlo ma va in lista d'attesa (serve storico di dati per misurare).
3. *Notifica dedicata nell'MVP?* → **No**: solo digest di zona; dedicata in Fase 2, su approvazione e con pochi posti per città.
4. *Prezzi e fasce del digest* → fasce Pranzo 12:15, Aperitivo 18:30, Cena 20:00; listino per posizione (1° più caro), venerdì e sabato sera più alti. Esempio usato: cena feriale 18/14/11/9/8 €, weekend 24/19/15/12/10 €.
5. *Push all'asta e lista in app a prezzo fisso* (proposta di Nilo, 25 ottobre) → **fatto** nel prototipo, con le regole sopra. Da tarare con i dati: il minimo per 1.000 persone, il peso della qualità, il tetto settimanale; nelle zone con pochi locali conviene restare a listino.

## File
`pano-core.jsx` (formati, icone, store, immagini) · `pano-ui.jsx` · `pano-charts.jsx` · `pano-data.jsx` (dati e azioni) · `pano-world.js` (motore 3D) · `pano-world-ui.jsx` · `pano-phone.jsx` (anteprime con le schermate dell'app) · `pano-flows.jsx` (procedure e finestre) · `pano-pages.jsx` · `pano-byuppino.jsx` (Byuppino AI) · `pano-homes.jsx` · `pano-app.jsx` · `pano-styles.css` · `img/` (in `img/app/` foto e icone del prototipo dell'app). Tutto vive sotto `window.Pano`: niente nomi globali sciolti.

# Panorama · prototipo

Il Business Manager di advertising di byup: il locale compra visibilità dentro l'app consumer, la controlla e ne misura il ritorno. Prodotto web separato da Fresh (scheda a parte), stesso account. Dati dimostrativi: account demo di Fresh, **Mario Rossi · Cacio e Pepe · Trastevere**.

## Come si apre
- **Online** (dal 25 ottobre): `byup-fresh.vercel.app/panorama/byup-panorama.html`, dalla home dell'ecosistema con «Apri Panorama». In basso a sinistra «Home byup» riporta alla home, come nelle altre app.
- **L'accesso si chiede da Fresh**, non da qui (Nilo, 25 ottobre): nella barra laterale di Fresh c'è il bannerino di Panorama con «Candidati»; a candidatura approvata lo stesso bannerino apre Panorama in un'altra scheda. Per questo in Panorama non c'è più la pagina degli stati dell'accesso.
- `byup-panorama.html`: la versione del repo, stessa tecnica di Desk (React senza build, Babel nel browser, va servita via HTTP).
- `panorama-standalone.html`: un solo file, si apre con doppio clic (sta nella cartella di lavoro e nell'artifact, non nel repo `byup-fresh`).
- `gradient-panorama.html`: il laboratorio per scegliere il gradient dei widget (il salvataggio funziona solo dall'artifact su claude.ai).
- Link diretti: `#atlante.sezione`, per esempio `#atlante.campagne`, `#atlante.push`. Sezioni: `panorama`, `campagne`, `push`, `inapp`, `pubblico`, `risultati`, `wallet`. I vecchi link restano buoni: `#…notifiche` apre Push, `#diorama…` e `#notte…` aprono la A, `#…accesso` apre la home.

## La variante
Resta solo la **A · Atlante**, la scelta di Nilo: barra in alto (logo, sezioni, anello del wallet, Promuovi, avvisi, tema e profilo), prima fila con il mondo al 70% e **Byuppino AI** al 30%, chiaro e scuro con passaggio circolare. Nella barra non c'è una voce «Wallet»: ci si arriva dall'anello a destra (dal telefono, da «Altro»). La B «Notte» è stata tolta il 24 ottobre, la C «Diorama» il 25, tutte e due su richiesta di Nilo; con la C se n'è andato anche il selettore delle varianti.

## Il gradient
Viene da `gradient panorama.png` di Nilo, rifatto in codice: 12 macchie sfumate (`--mesh` in `pano-styles.css`), uguale al PNG al 99,5%, senza fasce né righe, con una grana finissima (`--grain`). Nilo ha scelto il **codice vivo** (il gradient si muove piano). Regole per dimensione:
- **Grandi** (carta wallet, carta wallet della home, testata di Byuppino AI): gradient pieno, vivo e un po' più veloce (9–10 s).
- **Medi** (caselle «Tua offerta» e «Tuo» delle notifiche, note, pannello di Risultati): vivo a ritmo normale (16 s), con un velo bianco dove c'è molto testo (scuro nel tema scuro).
- **Piccoli** (avatar, bolle delle posizioni, pillole, icone): mai il gradient pieno, perché tanti colori in poco spazio stonano. Solo come **bordo** che gira piano, come il bordino del bottone Promuovi; le icone piccole hanno una tinta sola e le barrette un colore solo.
Le alternative si provano in `gradient-panorama.html`.

## La home della A (25 ottobre)
- **Altezza**: la prima fila è alta `100vh − 300 px`, tra 440 e 600 px: su un portatile (1366–1536 di larghezza, 730–800 di altezza) della fila sotto si vede almeno il 70%.
- **Mondo**: dal 26 ottobre è Byuplandia (vedi «Il mondo 3D» sotto); a destra il riquadro chiaro «Persone raggiunte oggi» e la zona attiva più piccola. Tolto il pannello «Adesso». Sotto le fasce, «Simula la push» e gli strumenti; sotto i 900 px di mondo il bottone resta solo icona e sotto i 700 si tolgono + e −.
- **Byuppino AI**: una proposta alla volta, con il dato che la regge (a barre se la colonna è alta, una riga se è bassa), quanto costa e un bottone; sotto «Chiedi» e la conversazione. Regola del 25 ottobre: **in un tocco fa solo ciò che non tocca gli spazi a contesa** (mettere un piatto o un evento in vetrina, pausa e riattiva, ricarica). Le campagne su ricerca, eventi, offerte le **prepara nella procedura completa** già compilata; l'asta della push e la notifica in app le apre senza offrire né prenotare: controlli e confermi tu. Nel prototipo è un motore di intenti scritto a mano, non un modello.
- **Riquadri** che riempiono il box: wallet con l'anello del limite del mese (scuro su chiaro, chiaro su scuro), metodo di pagamento (le carte girano da sole ogni 1,5 s e con lo swipe, niente frecce; il riquadro non cambia mai misura), questa settimana (speso → incassato), coperti portati.
- **Campagne in corso**: interruttore sempre a sinistra, prima della foto; il budget è un anello con accanto speso e tetto. **In calendario** scorre dentro la scheda, **In arrivo** (Fase 2) riempie la sua.
- **Cosa puoi comprare** (spostato qui dalle Campagne): nove spazi in una griglia piena 3 × 3 (le campagne; push all'asta, notifica in app e vetrina; la Fase 2), ognuno con lo scorcio vero dell'app dove compare; «Disponibile» o «Fase 2». Gli annunci dei fornitori di Hubble non ci sono: non li compra il locale.
- **Animazioni**: numeri che salgono, barre che crescono, linea dei coperti che si disegna; sempre vivi il punto di oggi, la stima tratteggiata, il gradient delle carte grandi.
- **Cambio tema**: il cerchio parte dal bottone; durante il passaggio si fermano mondo 3D, gradient e transizioni.

## Promuovi in un tap (dal 25 ottobre)
È una scorciatoia, non una campagna: mette **un piatto o un evento in cima alla vetrina** del locale (la scheda «In evidenza» sopra a tutto), per chi apre Cacio e Pepe nell'app. Prezzo fisso al giorno (2 €, segnaposto da decidere), dal wallet a fine giornata, si spegne da sola. Non tocca gli spazi dove i locali si contendono la visibilità: per quelli c'è **Nuova campagna**. Nella finestra: piatto o evento (dal menù e dagli eventi di Fresh), per quanto, la stima delle visite alla vetrina e l'anteprima della vetrina com'è nell'app.

## Notifiche: due schermate, Push e In app (25 ottobre)
Nilo non capiva la distinzione con tutto in una pagina, quindi sono **due prodotti con due schermate**, nella barra in alto «Push» e «In app». Ognuna si apre con com'è sul telefono, come funziona in tre punti e un rimando all'altra; poi i prossimi 7 giorni e le tue offerte o prenotazioni.
- **Push** (`#atlante.push`): la notifica che arriva **sul telefono, anche ad app chiusa**, con il suono. La manda byup per zona alle 12:15, 18:30 e 20:00, con il nome di **tre locali**, uno per categoria; toccandola si apre la lista dei tre. I tre posti si vincono **all'asta**: byup crea gli slot, busta chiusa fino a **15 minuti prima dell'invio**, conta **offerta × qualità** del locale (voto, foto, tocchi; Cacio e Pepe ×1,15), chi vince paga il **secondo prezzo** (quanto basta per superare chi lo segue, mai più della sua offerta). **Prezzo minimo** 2,50 € ogni 1.000 persone raggiunte; ogni locale ne vince al massimo **2 a settimana** (riquadro «Il tetto della settimana»). L'offerta massima resta bloccata nel wallet fino alla chiusura. Nel cassetto della casella: stato, minimo, di solito, qualità, offerta con la stima di Byuppino, cambia, ritira, «Simula la chiusura» (solo prototipo), esito con chi è nella push, anteprima «La notifica» / «Aperta».
- **In app** (`#atlante.inapp`): il messaggio del locale **dentro l'app**, nella **Posta** (la campanella in alto nella home), linguetta **«Promo per te»**, con «Sponsorizzato». **Non suona** e non va sullo schermo bloccato: lo legge chi apre l'app. Lo vede solo chi in zona ha acceso le promo (P-163 · D-113); «Già clienti» e «Per gusti» solo con la profilazione accesa. **Quattro posti al giorno** per zona, **prezzo fisso** per posto (1° in cima: 9/7/6/5 €, venerdì e sabato 12/9/7/6 €, segnaposto), un posto al giorno per locale, si prenota fino al giorno prima. Nel cassetto: posto, il messaggio (due righe, con tre pronti da Fresh), se arriva alle 11:00 o alle 17:00, a chi arriva, anteprima della Posta col messaggio, «Prenota» (importo bloccato fino all'invio, annullabile).
La vecchia «lista in app» (4° e 5° posto dentro la lista della push) non c'è più: confondeva le due cose.

## Le anteprime nell'app
Le anteprime degli annunci sono le schermate vere del prototipo dell'app byup (cartella `app/`, stesse misure, foto e componenti), disegnate a 390 punti e rimpicciolite nel telefono. L'annuncio porta sempre «Sponsorizzato».

| Posizionamento | Dove compare |
|---|---|
| Ricerca in cima | «Disponibili adesso», primo della lista (card grande con orari) |
| Offerta flash | home, sezione «In evidenza» (card vino con la pillola lime e il conto alla rovescia) |
| Eventi in evidenza | home, sezione «Da scoprire» (card in primo piano con la data) |
| Notifica push all'asta | la push sullo schermo bloccato e, toccandola, la lista «Stasera a Trastevere» con i tre |
| Notifica in app | la Posta dell'app, linguetta «Promo per te», il tuo messaggio per primo |
| Consigliati «Per te» (Fase 2) | «Stasera per te» |
| Mappa e categorie (Fase 2) | il pin e la prima card in basso sulla mappa |
| Piatto in evidenza (Fase 2) | la categoria, prima card della griglia |
| In evidenza in vetrina (Promuovi in un tap) | la vetrina del locale, scheda «In evidenza» in cima |

Nelle due anteprime della home il telefono scorre da solo fino all'annuncio. Nelle notifiche il telefono si vede **da vicino**, a grandezza vera e tagliato: la push, la lista e la Posta si leggono. Il marchio byup nelle icone dell'app è il file ufficiale (`byuploghi-16 a`, stessi tracciati); il colore può cambiare, la forma no.

## Il mondo 3D (home) · Byuplandia (dal 26 ottobre)
Su richiesta di Nilo il mondo della home è **Byuplandia**, la città-isola di byup ricostruita in 3D dai suoi tre riferimenti, al posto di Trastevere. Al centro il ristorante, messo in evidenza da un **bordo rosa luminoso «2.5D»** che ne segue la sagoma (più tenue dove passa dietro alberi e case), con l'etichetta «Cacio e Pepe · LIVE» sul tetto. Fasce **Pranzo / Aperitivo / Cena** = giorno, tramonto, sera. Le persone in strada sono quelle con l'app aperta: le onde di reach partono dal locale, chi è raggiunto si colora di rosa con la notifica sopra la testa, alcuni toccano l'annuncio, pochi camminano fino alla porta (+ coperti). Sul selciato l'anello tratteggiato della zona della push; **Simula la push** manda un'onda forte e accende i concorrenti che sono nella push. Trascinando si gira attorno al locale, Ctrl/⌘ + rotellina o + e − per lo zoom, doppio clic per tornare. Tutti i numeri sono dimostrativi.
- `pano-byuplandia.js` è **compilato** (three.js r169): non si modifica a mano. Le sorgenti stanno nella cartella `byuplandia/` della cartella di lavoro di Nilo (`src/`; `node build-pano.mjs` lo rigenera). Espone `Pano.World` con la stessa interfaccia del vecchio mondo, quindi `pano-world-ui.jsx` non è cambiato; le etichette Tevere e Gianicolo qui non hanno posto e restano nascoste.
- La scena si costruisce una volta sola, già mentre la pagina carica, e resta viva tra una sezione e l'altra; si ferma quando il riquadro non si vede, quando la scheda è nascosta e durante il cambio di tema. La qualità si adatta al computer. Serve WebGL 2: senza, resta il disegno di riserva.
- Il vecchio mondo di Trastevere (`pano-world.js`, three.js r128) è stato tolto; resta nella storia del repo (commit `4ccaa75`).

## Mappa delle schermate e fasi
| Sezione | Contenuto | Fase |
|---|---|---|
| Panorama (home) | Mondo 3D, Byuppino AI (propone; in un tocco solo vetrina, pausa, ricarica), wallet, metodo di pagamento, «hai speso / ti ha portato», coperti, campagne in corso con interruttore, calendario promozioni, incasso giorno per giorno, cosa puoi comprare | MVP |
| ↳ Autopilota, Riempi-sala automatico | Card spente con etichetta | Fase 2 |
| Campagne | Riepilogo su una riga (si tocca per filtrare), filtri per stato, tabella con interruttore a sinistra, periodo sotto lo stato, budget ad anello; dettaglio con imbuto e anteprima in app | MVP |
| Nuova campagna (7 passi) | Obiettivo (+ template per occasione) → Cosa (locale, evento, offerta da Fresh) → Dove → Pubblico → Budget e durata → Annuncio (3 versioni generate, controlli automatici) → Riepilogo | MVP |
| ↳ Piatto in evidenza, Consigliati «Per te», Mappa e categorie, Più delivery, Paga a risultato | Visibili e bloccati | Fase 2 |
| Promuovi in un tap | Un piatto o un evento in cima alla vetrina, prezzo fisso al giorno, stima e via | MVP |
| Push | Com'è sul telefono, come funziona, griglia 7 giorni × 3 fasce con l'asta dei 3 posti (busta chiusa, secondo prezzo, chiusura 15 minuti prima, minimo per persone raggiunte), le tue offerte e i risultati, il tetto della settimana | MVP |
| ↳ Una push solo tua | Su approvazione byup | Fase 2 |
| In app | Com'è nella Posta, come funziona, griglia 7 giorni × 4 posti a prezzo fisso, le tue notifiche in app e i risultati, chi la vede | MVP |
| Pubblico | Gruppi anonimi con numeri e azioni; sotto le 100 persone un gruppo non si usa | MVP |
| ↳ Gruppo su misura | | Fase 2 |
| Risultati | ROAS in chiaro, KPI, incasso vs spesa al giorno, imbuto, rendimento per posizionamento, mappa di calore giorno × fascia | MVP |
| Wallet | Bento a due colonne: carta del wallet e limiti alla pari; ricarica automatica con i tagli e i bonus dentro (50/100/200/500), metodi di pagamento; movimenti alti quanto le due schede accanto | MVP |
| Accesso | Si chiede da Fresh (bannerino «Candidati» nella barra laterale): candidatura, in valutazione, approvata → il bannerino apre Panorama in un'altra scheda. In Panorama restano benvenuto e regole dei contenuti (dal menù del profilo) | MVP |
| Asta completa, prezzo dinamico | Non ancora nel prototipo (vedi le notifiche push all'asta, sotto) | Fase 3 |

## Flussi coperti dal prototipo
1. **Accesso** (in Fresh): bannerino «Candidati» → candidatura → in valutazione → approvata → «Apri Panorama» in un'altra scheda.
2. **Ricarica**: importo con bonus → metodo (carta di Fresh, SEPA, nuova carta) → ricarica automatica → saldo aggiornato e movimenti.
3. **Promuovi in un tap** dalla barra, da Byuppino, da Fresh (evento) → in vetrina subito, con «Annulla». Per gli spazi dell'app si passa dalla procedura completa.
4. **Nuova campagna** (procedura completa) → inviata → controllo automatico; revisione a mano solo se cita marchi o squadre.
5. **Push all'asta**: casella → offerta massima con la stima → bloccata nel wallet → chiusura 15 minuti prima: vinci e paghi il secondo prezzo, o torna tutto nel wallet.
5b. **Notifica in app**: posto libero → messaggio, ora, pubblico → anteprima nella Posta → prenotato (importo bloccato fino all'invio, annullabile).
6. **Campagna rifiutata**: banner con le note di byup → «Correggi e rinvia» apre l'annuncio con i controlli che diventano verdi → di nuovo in revisione.
7. **Report**: Risultati e dettaglio campagna (imbuto, ROAS, costo per coperto, attribuzione spiegata).

## Viste in Desk per governare Panorama (solo funzioni)
- **Richieste di accesso**: coda con dati del locale precompilati e punteggio di idoneità (uso di Fresh, giorni attivi, voto, completezza profilo, ordini/prenotazioni byup, anzianità); approva, rifiuta con motivo, lista d'attesa per zona, invito manuale, sospensione.
- **Revisione contenuti**: campagne segnalate dal controllo automatico o dagli utenti; approva, chiedi correzione con note per campo, rifiuta; storico per locale.
- **Inventario e prezzi**: zone della push, fasce orarie, posti per push (3), prezzo minimo per 1.000 persone, peso della qualità, tetto settimanale; posti e listino della notifica in app; densità (annunci ogni N risultati), soglie di qualità per posizionamento, cap per utente.
- **Push e Posta**: calendario per zona e fascia, aste e composizione (esclusiva di categoria), notifiche editoriali di byup separate, push dedicata su approvazione.
- **Anti-frode**: tocchi anomali, budget bruciato in pochi minuti, rimborsi automatici al wallet, blocchi.
- **Ricavi**: ricariche, bonus concessi, spesa per posizionamento e zona, ROAS medio dei locali, wallet dormienti.

## Modello dati essenziale
- **Locale** 1–1 **Wallet** (saldo, bonus, auto-ricarica, limiti) 1–N **Movimento** (ricarica, bonus, addebito, blocco, rimborso).
- **Locale** 1–1 **Accesso** (stato, punteggio, motivi, date) — gestito in Desk.
- **Locale** 1–N **Campagna** (obiettivo, oggetto → evento/offerta/piatto di Fresh, tipo di posizionamento, budget, date, stato, pubblico) 1–N **Annuncio** (titolo, testo, foto, CTA, esito controlli) 1–N **Revisione** (esito, note per campo, autore Desk).
- **Zona** 1–N **Slot push** (data, fascia, 3 posti, prezzo minimo, chiusura) 1–N **Offerta** (locale, offerta massima, qualità, esito, prezzo pagato) → **Push** inviata da byup, uno per categoria.
- **Zona** 1–N **Giorno Posta** (data, 4 posti a prezzo fisso) 1–N **Prenotazione in app** (locale, posto, messaggio, ora, pubblico); un posto al giorno per locale.
- **Audience anonima** (definizione, dimensione, minimo 100) usata da Campagna/Prenotazione; nessun legame verso persone visibile al locale.
- **Evento di risultato** (impression, tocco, prenotazione, ordine, conto Fresh) → **Attribuzione** (finestra 7 giorni, campagna, coperti, incasso).

## Rischi, casi limite, scelte aperte
- **Nome**: «Panorama» (prodotto) e «Panoramica» (home di Fresh) sono quasi uguali. Valutare di chiamare la home di Panorama solo «Panorama» e mai «Panoramica».
- **Privacy**: gruppi piccoli possono rendere riconoscibili le persone → soglia minima (qui 100) e niente filtri combinati sotto soglia. Le ricerche su «partita» o simili sono aggregate.
- **Attribuzione**: un cliente abituale che tocca l'annuncio sarebbe venuto comunque → in futuro un gruppo di controllo (incrementalità). Conti divisi e tavoli misti: un coperto alla volta.
- **Push**: zone con pochi locali (meno di 3 → niente push), slot invenduti (byup li riempie con contenuti editoriali?), aste con poche offerte (resta il prezzo minimo). **Notifica in app**: annullamenti fino al giorno prima.
- **Wallet**: campagne che finiscono il saldo a metà sera; rimborsi anti-frode; fatturazione e IVA delle ricariche e dei bonus da chiarire con il commercialista.
- **Qualità**: soglie per i posizionamenti migliori (voto, foto) da tarare per non escludere i locali nuovi.

**Decisioni aperte, con la proposta**
1. *Pagamento a risultato o solo asta nell'MVP?* → MVP a **tocco con listino fisso per fascia** (niente asta), pagamento a risultato in Fase 2 quando l'attribuzione è stabile.
2. *Panorama in tutti i piani di Fresh o dal piano medio in su?* → **Starter e superiori**, su approvazione; il Gratuito può richiederlo ma va in lista d'attesa (serve storico di dati per misurare).
3. *Push dedicata nell'MVP?* → **No**: solo la push di zona; dedicata in Fase 2, su approvazione e con pochi posti per città.
4. *Fasce della push* → Pranzo 12:15, Aperitivo 18:30, Cena 20:00.
5. *Push all'asta e notifica in app a prezzo fisso* (proposta di Nilo, 25 ottobre) → **fatto** nel prototipo, due schermate con le regole sopra. Da tarare con i dati: il minimo per 1.000 persone, il peso della qualità, il tetto settimanale, il listino della Posta; nelle zone con pochi locali la push può restare a listino.

## File
`pano-core.jsx` (formati, icone, store, immagini) · `pano-ui.jsx` · `pano-charts.jsx` · `pano-data.jsx` (dati e azioni) · `pano-byuplandia.js` (il mondo 3D, compilato) · `pano-world-ui.jsx` · `pano-phone.jsx` (anteprime con le schermate dell'app) · `pano-flows.jsx` (procedure e finestre) · `pano-pages.jsx` · `pano-byuppino.jsx` (Byuppino AI) · `pano-homes.jsx` · `pano-app.jsx` · `pano-styles.css` · `img/` (in `img/app/` foto e icone del prototipo dell'app). Tutto vive sotto `window.Pano`: niente nomi globali sciolti.

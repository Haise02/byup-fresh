# Byup — Handoff prototipo (Byuppini · Cerca · Roadmap · navigazione)

Documento di passaggio per una nuova chat. Obiettivo: rendere il prototipo **un unico prodotto coeso e navigabile**, con Byuppini, Roadmap e Cerca perfettamente integrati nell'app (stesso mockup, stessa navigazione, back funzionante).

---

## 1 · Contesto di progetto

Byup è l'app consumer (React "no-build", compilata a runtime da Babel-standalone). L'app vera del redesign vive in:

**`C:\Users\nilga\Downloads\byup\byup-fresh-final\app\`**
(NON usare la cartella Desktop `byup Fresh`: è vecchia/stale. NON usare `Byup (1)`: contiene solo markdown.)

L'app è **fullscreen mobile** (niente device-bezel), contenitore centrato `max-width 460px`. Tema chiaro/scuro con toggle (near-black brand `#161514`, accenti coral `#E32459` / lime `#CEFF00`). Font: Fredoka (display) + Hanken Grotesk.

### Come gira / preview
- `byup Home.html` carica i `.jsx` a runtime via Babel (`<script type="text/babel" src="app.jsx">` ecc.). È la preview "vera" (Vercel).
- `home-standalone.html` / `menu-standalone.html` sono versioni **pre-compilate** per preview locale `file://` (Babel via file:// dà CORS). Si rigenerano con lo script di build che sostituisce i blocchi compilati.
- Workflow utente: edit in Cowork → commit via GitHub web → preview su Vercel.

### Gotcha critico (MOUNT-TRUNCATION)
Modificando i file grandi con gli strumenti host (Edit/Write), il mount della sandbox VM serve una versione **troncata** (cache sulla vecchia dimensione) → Node/Playwright leggono file tagliati (parse error, funzioni "undefined", pagina bianca).
**Soluzione adottata:** editare i file grandi con **Python direttamente sul path del mount** (`open().read()/replace()/write()`), che aggiorna host+mount insieme. In alternativa: ricostruire il file pieno in `/tmp` e `cp` sul path mount per "risanare".

### Tooling di verifica (nella cartella outputs, lato VM)
- `build-standalone.js` — ricompila `.jsx` e sostituisce i blocchi `/* file.jsx */(function(){…})()` negli standalone. Uso: `node build-standalone.js app.jsx`.
- Screenshot: Playwright chromium-headless-shell; serve `libXdamage` (già scaricato in `/tmp/libs`, `LD_LIBRARY_PATH=/tmp/libs/ext/usr/lib/x86_64-linux-gnu`). Bypass auth: `localStorage byup_auth='1' + byup_perms='1'`; tema: `byup.themeMode`; deep-link: `?page=search|profile|map|posta|venue`.

---

## 2 · File rilevanti

### App React (in `…/byup-fresh-final/app/`)
- **`app.jsx`** (~3150 righe) — cuore dell'app: Home, dispatch pagine, `BottomTabBar`, set `Icon`, `SearchScreen` (Cerca) + `EXPLORE_TILES`, `ResultsScreen` + `RESULT_VENUES`, liste locali con foto.
- `extras.jsx` — `ProfileScreen`, venue, prenotazione (Prenota).
- `menu.jsx` — menù, ordine, pagamento.
- `map.jsx` — mappa in-app + `PostaScreen`.
- `byup-app-kit.jsx` — kit tema (`THEMES`, token, `useByupTheme`).
- `ios-frame.jsx`, `venue-variants.jsx`, `auth.jsx`.
- `byup Home.html` — entry runtime (Babel).
- `home-standalone.html`, `menu-standalone.html` — build precompilate.

### Schermate Byuppini (attualmente HTML separati — DA INTEGRARE)
- **`byuppini-standalone.html`** — schermata gamification (hero saldo + coin + mascotte, segmenti Portafoglio/Sfide/Premi/Traguardi, roadmap link, byup card in evidenza, card premi reel-style). Ha una bottom bar HTML che imita quella dell'app.
- **`byuppini-roadmap.html`** — mappa-mondo dei livelli (terreno `road-terrain.png` + edifici `venue-1..8.png` posizionati in codice, badge/lucchetti/mascotte "SEI QUI"). **Zoom ~1.4×, scrollabile.**
- `Byuppini-Concept.md` — strategia/economia byuppini.
- `Byuppini-Image-Prompts.md` — prompt immagini.

### Asset immagini (`app/assets/`)
- **Foto ristoranti REALI = URL Unsplash** nel campo `photo:` dentro `app.jsx` (es. `RESULT_VENUES` ~riga 855; liste locali ~righe 1181–1261; `HERO_PHOTO`). **← sono queste le "foto dei ristoranti" da usare nella Cerca.**
- `venue-1..8.png` — edifici **isometrici** della roadmap (illustrazioni, NON foto).
- `road-terrain.png` — terreno roadmap.
- `coin.png`, `coin-stack.png`, `reward-*.png` (byupcard, tote, bottle, stickers, spritz, dessert), `mascot-*.png`.
- `hero-*.png` = illustrazioni/icone cibo; `cat-*.png` = icone categoria; `offerte/offer-*.webp`; `reels/reel-*.webp`. **(NON usare hero/cat come "foto ristoranti".)**

---

## 3 · Stato attuale (fatto in questa sessione)

- Byuppini: rimossi glow rotti (sheen byup card, anello conico + streak nei Traguardi); mantenuto solo lo shine reel nei Premi. Coin reale nell'hero. Card premi reel-style + byup card in evidenza.
- Roadmap immagine-in-codice: terreno + 8 edifici, ordine invertito (torre in alto → chiosco in basso), badge nomi (Novizio→Icona), lucchetti, mascotte "SEI QUI", zoom ~1.4×.
- `app.jsx` bottom bar: aggiunti tab **Byuppini** (icona coin) e **Cerca** (icona lente). Ordine attuale: Home · Byuppini | QR | Cerca · Profilo.
- Cerca: `SearchScreen` trasformata in griglia "explore" stile Instagram (attualmente usa hero/offer/reel — **DA CAMBIARE in foto ristoranti**).
- Deep-link `?page=search` abilitato.
- `byuppini-standalone.html`: aggiunta bottom bar in stile app.

---

## 4 · Problemi aperti / da sistemare (richiesti dall'utente)

1. **Bilanciamento bottom bar** — Byuppini un po' più a **sinistra**, Cerca un po' più a **destra**, così le due sezioni ai lati del QR sono perfettamente simmetriche (ora i tab interni sono troppo vicini alla tacca centrale).
2. **Cerca con foto ristoranti** — sostituire in `EXPLORE_TILES` le immagini hero/offer/reel con le **foto Unsplash dei locali** già usate nell'app (campo `photo:`), non le icone-cibo. Raccogliere tutte le `photo:` uniche in `app.jsx` e spammarle in griglia con nomi locali reali.
3. **Card Premi scrollabili** — nella sezione Premi le card (catrow/reel) devono **scorrere orizzontalmente** in modo fluido e completo; ora la visualizzazione/scroll non funziona bene. Sistemare overflow, snap e larghezze.
4. **Byuppini — navigazione rotta** — pulsanti che non portano alle parti giuste; il **back non torna indietro**. Sistemare: back topbar (sempre verso app/Home), link roadmap ("Vedi il percorso"), CTA "Riscatta", tab bottom bar, segmenti. Verificare ogni onClick/href.
5. **Roadmap: tutto visibile e scorrevole** — le **etichette/nomi livello NON devono essere coperte dal footer**; la mappa deve essere interamente visibile e **scorrevole** (su/giù) senza tagli. Aggiungere padding/inset per la bottom bar e per la topbar.
6. **Dentro il mockup, un'unica app (no reload)** — Roadmap e Byuppini devono stare **dentro lo stesso guscio dell'app** come le altre schermate. Fondere tutti i file dell'app in **un'unica esperienza SPA**: niente `location.href` che ricarica una nuova URL passando da una schermata all'altra — usare la navigazione interna a stato (`setPage`/`goBack`).
7. **UX/UI Traguardi/Achievement** — rendere la pagina Traguardi (e il dettaglio achievement) **più accattivante**: gerarchia, stati (sbloccato/in corso/bloccato) chiari e belli, progressi leggibili, micro-interazioni pulite (senza i glow rotti già rimossi).
8. **Coesione unica del prototipo** — Home ↔ Byuppini ↔ Roadmap ↔ Cerca ↔ Profilo collegate come **un unico prototipo**, navigazione coerente e reversibile ovunque.

### Raccomandazione architetturale (chiave per i punti 4-6-8)
La causa profonda ("sembra un file a parte / back rotto / non nel mockup / ricarica URL") è che **Byuppini e Roadmap sono HTML separati**, mentre l'app è React (dispatch pagine in `app.jsx`).
**Strada consigliata (A):** convertire Byuppini e Roadmap in **pagine React dentro `app.jsx`** (`page === 'byuppini'`, `page === 'roadmap'`) usando `setPage`/`goBack` e la `BottomTabBar` esistente. Così mockup, back, navigazione senza reload e coesione arrivano gratis e definitivamente. Riusare lo stile/markup dei prototipi HTML esistenti come riferimento visivo (portarli in JSX + token del tema).
(B, tampone sconsigliato): tenerli HTML e replicare il guscio — ma NON soddisfa "niente reload di URL" e resta fragile.

---

## 5 · Prossimi passi (ordine suggerito)
1. Scelta architetturale A: portare **Byuppini** e **Roadmap** come pagine React in `app.jsx` (JSX dai prototipi HTML + token tema), con `BottomTabBar` e `goBack`. Questo risolve 4, 6, 8 in un colpo.
2. Bilanciare la `BottomTabBar` (spaziatura simmetrica attorno al QR: Home · Byuppini | QR | Cerca · Profilo).
3. Cerca → `EXPLORE_TILES` dalle foto Unsplash dei locali (raccolte da `app.jsx`).
4. Premi → card scrollabili orizzontalmente (fix overflow/snap).
5. Roadmap → tutto visibile, etichette sopra il footer, scroll verticale con padding per topbar/bottom-bar.
6. Traguardi/Achievement → restyling UX/UI più accattivante.
7. Rebuild standalone + verifica screenshot su ogni schermata e sul **back**.

---

## 6 · Prompt pronto per la nuova chat

Vedi "## 7" qui sotto — copia-incolla integrale.

---

## 7 · PROMPT (copia-incolla)

Sto lavorando al prototipo dell'app consumer **Byup** (React "no-build", Babel-standalone). Leggi PRIMA il file `C:\Users\nilga\Downloads\byup\byup-fresh-final\app\HANDOFF-prototipo-byup.md` (contesto completo, file, gotcha), poi lavora nella cartella `C:\Users\nilga\Downloads\byup\byup-fresh-final\app\` (NON la Desktop "byup Fresh" né "Byup (1)").

Contesto lampo: `app.jsx` è il cuore React (Home, dispatch pagine con `setPage`/`goBack`, `BottomTabBar`, `Icon`, `SearchScreen`/Cerca + `EXPLORE_TILES`, `RESULT_VENUES`). `byup Home.html` carica i `.jsx` a runtime via Babel; `home-standalone.html`/`menu-standalone.html` sono build precompilate (rigenera con `node build-standalone.js app.jsx` dalla cartella outputs). `byuppini-standalone.html` e `byuppini-roadmap.html` sono schermate HTML separate. GOTCHA: i file grandi vanno editati con **Python sul path del mount** (gli edit host vengono troncati dal mount VM). Le "foto ristoranti" sono gli URL Unsplash nel campo `photo:` dentro `app.jsx`. Screenshot con Playwright (`LD_LIBRARY_PATH=/tmp/libs/ext/usr/lib/x86_64-linux-gnu`, auth via `localStorage byup_auth='1'/byup_perms='1'`).

Obiettivo: trasformare il tutto in **un'unica app SPA coesa**, navigabile senza ricaricare URL tra le schermate, tutto dentro lo stesso mockup, con back sempre funzionante. Da fare (proponimi prima il piano, poi esegui e verifica ogni schermata con screenshot incluso il back):

1. **Architettura**: converti **Byuppini** e **Roadmap** da HTML separati a **pagine React dentro `app.jsx`** (`page==='byuppini'`, `page==='roadmap'`), riusando lo stile dei prototipi HTML esistenti come riferimento, con `BottomTabBar`, `setPage`/`goBack` e i token del tema. Niente più `location.href`/reload tra schermate.
2. **Bottom bar**: bilanciala simmetricamente attorno al QR (Home · Byuppini a sinistra | QR | Cerca · Profilo a destra), Byuppini più a sinistra e Cerca più a destra.
3. **Cerca**: in `EXPLORE_TILES` usa le **foto Unsplash dei locali** già presenti in `app.jsx` (campo `photo:`), non le icone cibo; griglia stile Instagram con nomi di locali reali.
4. **Premi**: rendi le card **scrollabili orizzontalmente** in modo fluido (fix overflow/snap/larghezze).
5. **Byuppini**: sistema tutta la navigazione (back, "Vedi il percorso", CTA "Riscatta", tab, segmenti) — ora molti pulsanti non funzionano e il back non torna indietro.
6. **Roadmap**: tutto visibile e **scorrevole**, con le **etichette dei livelli NON coperte dal footer** (padding/inset per topbar e bottom-bar).
7. **Traguardi/Achievement**: restyling UX/UI più accattivante (stati chiari, progressi leggibili, micro-interazioni pulite).
8. **Coesione**: collega Home ↔ Byuppini ↔ Roadmap ↔ Cerca ↔ Profilo come un unico prototipo, back reversibile ovunque. Alla fine rebuild standalone + screenshot di verifica.

---

## 8 · AGGIORNAMENTO (8 lug 2026) — FATTO in questa sessione

Tutti gli 8 punti del §4/§7 sono stati completati e verificati con screenshot:
- **Byuppini e Roadmap sono ora pagine React in `app.jsx`** (`ByuppiniScreen`, `RoadmapScreen`, dispatch `page==='byuppini'|'roadmap'`, deep-link `?page=byuppini|roadmap`). Navigazione tutta a stato (`setPage`/`goBack`), zero reload. `byuppini-standalone.html` e `byuppini-roadmap.html` restano solo come riferimento legacy, non più linkati dall'app.
- BottomTabBar: prop `onByuppini` + router globale `window.__byupNav` (fallback per le tab bar renderizzate da extras/map/menu: dentro la SPA usano setPage, dalla menu app fanno deep-link). Spacer centrale 50→88 per simmetria attorno al QR. Prop `forceDark` per barra scura sulle pagine Byuppini/Roadmap anche in tema chiaro.
- Cerca: `EXPLORE_TILES` ora deriva da `EXPLORE_VENUES` (10 foto Unsplash uniche dei locali reali, ripetute a 30 con offset).
- Premi: righe `BypRewardRow` full-bleed con overflow-x, snap e larghezze fisse — scroll fluido.
- Roadmap: goal card sopra la tab bar, spacer 236px in fondo (etichetta LIV.1 mai coperta), auto-scroll su "SEI QUI". Nomi livello unificati (Novizio→Icona, `BYP_LEVEL_NAMES`).
- Traguardi: restyling con anelli conici di progresso, stati done/prog/lock, barre %, stagger, detail sheet con progressi e confetti.
- **`build-standalone.js` ora vive in `app/`** (gli outputs VM si perdono tra sessioni). Avvolge i blocchi in IIFE — necessario, altrimenti le `const` globali dei vari blocchi collidono.
- Fix bug pre-esistente: `menu.jsx` riga 26 `const BADGE = … : BADGE` (TDZ) crashava la menu app in tema chiaro → ora `'#7a1c3e'`.

# A11Y-AUDIT — ridimensionamento, reflow e modalità di ingrandimento

Gestionale byup Fresh · Fase 0 dell'intervento di conformità WCAG 2.2 AA
(EN 301 549 V4.1.1, clausole 9 e 11 · Annex ZB → Direttiva UE 2019/882).

Audit misurato sul codice e sul browser il **13 settembre 2026**. Nessuna riga
di prodotto è stata scritta: questo documento è la fotografia e la proposta.
Gli strumenti dell'audit (scanner, sonde Puppeteer) stanno fuori dal repo.

---

## 0. Riassunto in dieci righe

L'architettura che il piano dà per scontata — tutta la UI dentro un `.frame`
scalato da una sola proprietà `zoom` — **esiste ancora, ma vale solo da
desktop**. Dal 18 agosto 2026 il gestionale ha un secondo sistema, `pn-device.js`,
che su tablet e telefono **scioglie il frame e spegne lo zoom**, e che porta con
sé un linguaggio adattivo già scritto e già collaudato (`statStretto`, `STG`,
`STMIN`, `STSCROLL`). I due sistemi oggi non si parlano.

La conseguenza è la cosa più importante di questo audit: **il lavoro grosso di
Fase 2 e 3 è in buona parte già fatto, ma è cieco allo zoom.** Gli helper
adattivi misurano `window.innerWidth`; a scala massima la finestra resta larga
1920 mentre la tela logica scende a 646, quindi non scattano. Ricondurre quella
misura alla tela logica accende gratuitamente tutti i layout stretti già
costruiti per l'iPad in verticale. È il singolo intervento con il rapporto
resa/rischio più alto dell'intera commessa, e va fatto per primo.

Il resto si divide in tre mucchi: unità che lo zoom non scala (`vw`/`vh`, JS che
misura la finestra), bersagli sotto misura (24 casi sotto i 24 px, 123 fra 24 e
43), e contrasto (tre token di testo sotto soglia, più il testo bianco sul
corallo del marchio).

### Decisioni prese il 13/09/2026

1. **Il corallo del marchio non si tocca.** Dove il testo bianco piccolo su
   `BTN_BRAND` fallisce 1.4.3, si alza il testo a 17 px bold invece di scurire
   il pulsante (C2 in §5.5).
2. **`byup_KDS.html` entra nel perimetro** delle tre modalità, con `zoom` su un
   frame che resta `100vw × 100vh`. Superfici scalabili: **13**.

---

## 1. Che cosa è cambiato rispetto alla fotografia del 12/09/2026

Il prompt chiedeva di verificare e di segnalare le divergenze. Sono sette, e
tre cambiano il piano.

| # | La fotografia diceva | Il codice dice (13/09) | Peso |
|---|---|---|---|
| 1 | Tutta la UI scala con un solo `zoom` su `.frame` | Vero **solo su desktop**. `pn-device.js` classifica phone / tablet / desktop e su phone+tablet marca `html[data-pn-native]`, che **scioglie il frame** (`width:100%`, `height:100svh`, `zoom:1 !important`); ogni `fit()` ha già la guardia che si mette da parte | **alto** |
| 2 | Nessun sistema responsive esistente | Esiste ed è vivo: `statPhone()`, `statStretto()`, `STG(desk, mobile)`, `STMIN(px)`, `STSCROLL()` in `pn-device.js`, usati in 23 file (i più densi: `stat-economici` 15, `stat-app` 8, `stat-clienti` 6). Tutte e dodici le pagine sono in `TABLET_NATIVE` | **alto** |
| 3 | `<meta viewport width=1440>` su quasi tutte, incoerenza su Contabilità | **Già sanato**: tutte le pagine hanno `width=device-width, initial-scale=1`. La Fase 1.4 è già fatta | medio |
| 4 | `fit()` duplicato in 10 file | Duplicato in **11** file, e non più identico all'originale: ha già la guardia `data-pn-native` e una cache `cur` per non riscrivere lo stile | basso |
| 5 | (non citato) | Esiste già `--pn-vh` (`panoramica-tokens.jsx:1455-1472`): l'altezza della finestra **divisa per lo zoom**, perché il problema dei `vh` dentro `zoom` era già stato incontrato e tamponato caso per caso | medio |
| 6 | 11 pagine con frame + Login + index | Le superfici sono **14**: le 11 con frame, `byup Login.html` e `byup Cucina Collega.html` senza frame, e **`byup_KDS.html`**, che il piano non nomina | medio |
| 7 | `PnModal` width 720, maxWidth 92%, X 28×28 | Confermato. Ma le finestre del gestionale sono **tre famiglie**, non una: `PnModal` (X 28×28), `MODAL_PANEL` di `panoramica-tokens.jsx:266` (X 38×38), `IMP_MODAL_PANEL` di `impostazioni-personale.jsx:1136` (X 34×34) | medio |

### 1.1 La divergenza che conta: due misure diverse della stessa cosa

```js
// pn-device.js — la misura viva oggi
window.statStretto = function () {
  return classify() === 'phone' || (classify() === 'tablet' && window.innerWidth < 900);
};
```

`window.innerWidth` è la **finestra fisica**. La tela dentro cui i componenti
vivono è invece `innerWidth / zoom`. Finché lo zoom è ≈ 1 le due coincidono e
nessuno se n'è accorto; a scala 2,5 divergono di un fattore tre:

| Finestra | zoom a «Molto grande» | `window.innerWidth` | tela logica vera |
|---|---|---|---|
| 1920 × 1080 | 2,93 | 1920 → «largo» | **646** → è strettissima |
| 1366 × 768 | 2,07 | 1366 → «largo» | **648** |
| 1280 × 800 | 2,16 | 1280 → «largo» | **582** |

Quindi una tabella a sette colonne che su iPad verticale scorre correttamente
dentro il suo contenitore (`STMIN(640)`), a scala massima su un monitor da 24"
**non scorre**: si schiaccia. È esattamente il difetto visibile negli
screenshot di §2.3.

**Proposta**: `classify()` e `statStretto()` devono misurare la tela logica
(`innerWidth / zoomEffettivo`), non la finestra. Il `bp` richiesto dalla Fase 1.3
non è allora un sistema nuovo accanto a quello esistente, ma **lo stesso
sistema con la misura corretta**. I 23 file che già usano gli helper si
adattano senza essere toccati.

### 1.2 La dodicesima superficie: `byup_KDS.html`

Non ha frame scalato né `fit()`: `.frame { width:100vw; height:100vh }`. E porta
in testa una decisione registrata che va letta prima di toccarla:

> «NIENTE SCALA. Il board occupa lo schermo vero, a qualunque misura sia. […]
> Scalare non aiuta mai i bersagli: rimpicciolisce insieme dito e cosa da
> toccare, quindi il rapporto resta identico. Quello che si adatta è QUANTE card
> ci stanno, non quanto sono grandi.»

La decisione riguarda lo scalare **in giù** e resta valida. Le nostre modalità
scalano **in su** a finestra ferma, quindi il bersaglio fisico cresce davvero e
il rapporto dito/bersaglio migliora: non c'è conflitto, ma la pagina va servita
con `zoom` su un frame che resta `100vw × 100vh` e con meno card in vista, non
con un frame a tela fissa. È anche l'unica pagina che ha già uno stile di focus
(`outline: 3px solid #0F1115`) e la regola `prefers-reduced-motion`: è il
modello da generalizzare, non da riscrivere.

---

## 2. La misura del problema — prove, non stime

### 2.1 Come si comporta davvero `zoom` (misurato in Chrome headless)

| Cosa | Comportamento dentro `zoom: 2.5` | Conseguenza |
|---|---|---|
| `width: 100px` | rende 250 px fisici | ✅ la tesi regge: **zero px da riscrivere** |
| `fontSize: 15px` | `getComputedStyle` restituisce ancora `15px`, disegnati 37,5 | ✅ nessuna scala tipografica parallela |
| **container query** | legge la larghezza **logica** (container logico 400 con soglia 600 → la query scatta, mentre il rect fisico è 800) | ✅ **le CQ funzionano dentro lo zoom** |
| **media query** | legge la **finestra** (`max-width:900` su finestra 1200 con zoom 3 → non scatta) | ❌ le MQ sono inutili qui, come previsto |
| `50vh` | 1000 px fisici su finestra da 800 — i `vh` **ignorano lo zoom** e poi vengono moltiplicati | ❌ **rottura grave a scala alta** |
| `position: fixed` | la dimensione scala (100 px → 250), ma il blocco contenitore è la **finestra**, non il frame | ⚠️ tollerabile: il frame riempie la finestra. Sfugge però a `margin: 24px` e al raggio 16 del frame |

Nota sulle container query: funzionano, ma misurano il **contenitore**, non la
tela. Restano una via legittima per i componenti; per gli stili inline — che qui
sono la quasi totalità — la strada è l'hook JS, come indicato dal piano.

### 2.2 Quanto costa oggi accendere la scala (senza aver corretto niente)

Undici pagine, finestra 1920 × 1080, `zoom` e tela logica impostati a mano con
la formula proposta (`MIN_W_LOG = MIN_H_LOG = 320`). «clip-x del frame» è il
contenuto tagliato in orizzontale dal frame; «contenitori scroll-x» sono le
aree che scorrono lateralmente; «testi tagliati» sono i nodi con ellissi o
troncatura verticale.

| Pagina | modo | clip-x frame | contenitori scroll-x | testi tagliati |
|---|---|---|---|---|
| Panoramica | normale / grande / massima | 420 / 420 / 420 px * | 30 / 9 / 31 | 19 / 9 / 17 |
| Sala | | 0 / 0 / 0 | 4 / 9 / 4 | 2 / 4 / 1 |
| Cucina | | 0 / **85** / **227** | 0 / 31 / 31 | 0 / 10 / 10 |
| Cucina KDS v2 | | 0 / 0 / **94** | 1 / 1 / 2 | 0 / 0 / 0 |
| Contabilità | | 0 / 0 / 0 | 0 / 9 / 15 | 0 / 8 / 11 |
| Statistiche | | 0 / 0 / 0 | 0 / 3 / 8 | 0 / 2 / 4 |
| Impostazioni | | 0 / 0 / **112** | 3 / 4 / 7 | 0 / 1 / 1 |
| Profilo | | 0 / 0 / 0 | 0 / 2 / 4 | 0 / 1 / 2 |
| Supporto | | 0 / 0 / 0 | 0 / 0 / 1 | 0 / 0 / 0 |
| Configurazione Completa | | 0 / 0 / 0 | 2 / 4 / 7 | 0 / 1 / 2 |
| Restaurant Onboarding | | 0 / 0 / **7** | 1 / 1 / 3 | 0 / 0 / 0 |

\* I 420 px della Panoramica sono un **falso positivo**: sono le macchie
decorative del byuppino (`.byu-macchia`, `position:absolute; inset:-30%`),
volutamente più grandi del contenitore che le ritaglia. La metrica va filtrata
dalle decorazioni; il resto della colonna è reale. Lo dico qui perché la stessa
trappola tornerà nelle asserzioni automatiche di Fase 6.

Lettura: **a modalità Normale la regressione è zero** — nessuna pagina peggiora
rispetto a oggi. Il danno compare da Grande in su, e si concentra dove il
chrome è più pesante (Cucina, Impostazioni) e dove ci sono tabelle (Contabilità,
Statistiche).

### 2.3 Che cosa si vede davvero a «Molto grande»

Screenshot presi a 1920 × 1080 con zoom 2,93 (tela logica 646 × 360):

- **Contabilità** — la striscia dei quattro KPI non riflusce: «€ 1.337,80»,
  «€ 25.468,00» e «€ 24.150,00» si **scrivono uno sopra l'altro**. La sidebar
  estesa occupa 272 dei 646 px logici, cioè il 42% dello schermo. Il FAB
  dell'assistente (72 px logici) copre le tab di sezione.
- **Impostazioni** — le due colonne di navigazione (68 + 272 = 340 px logici)
  prendono il 53% della tela; il pulsante «Salva modifiche» della barra è
  tagliato a metà dal bordo destro; l'anteprima vetrina resta aperta e strozza
  il form.
- **Panoramica** — i due banner di avviso (Stripe, dati fiscali) da soli
  occupano metà dell'altezza disponibile; sotto restano ~180 px logici di
  contenuto.

**Il vincolo binding a scala massima è l'altezza, non la larghezza.** 360 px
logici di tela meno una testata da 56, una tab bar da 44 e un piede da 60 non
lasciano niente. Il piano parla quasi solo di reflow orizzontale: va aggiunto un
capitolo sull'altezza (testata compatta a `sm`, banner impilabili/comprimibili,
piede sticky che non rubi più di una riga).

---

## 3. Inventario dei blocchi al reflow

### 3.1 Per famiglia

| Famiglia | Dove | Blocco | Misura logica a 250% |
|---|---|---|---|
| **Sidebar** | `panoramica-sidebar.jsx:337` | `width: collapsed ? 68 : 272`, stato in `pn_sidebar_collapsed`; skeleton di boot in `byup Impostazioni.html:66-80` (classe `gest-largo`) | 272 / 646 = **42%** |
| **Doppia nav Impostazioni** | `impostazioni-app.jsx:133` | 68 + 272 = 340 px logici affiancati | **53%** |
| **Header di pagina** | `app-page-shell.jsx`, `panoramica-header.jsx` | altezza e padding fissi, azioni tutte in linea | ~15% dell'altezza |
| **Tab bar** | `PnSectionTabs` (`panoramica-tokens.jsx:344`) | ha già `overflowX:'auto'`, ma **manca `scrollIntoView` sulla tab attiva**: a tela stretta la scheda selezionata può restare fuori vista | — |
| **Modali** | 76 larghezze > 400 px in 28 file | 24 **senza `maxWidth`** (elenco in §3.3); `IMP_MODAL_PANEL` non ne definisce uno di default | fino a 1040 px su tela 646 |
| **Tabelle** | `contabilita-v2-*`, `stat-*` | griglie a 5–7 colonne; `STMIN(560/620/640)` è già lì **ma non scatta** perché legato a `window.innerWidth` | colonne schiacciate |
| **Mappa sala** | `sala-tab-tavoli.jsx`, `sala-geometria.jsx` | pan/zoom propri | eccezione (§6) |
| **Board KDS** | `cucina-kds2-board.jsx` | `.kds2-rail` scorre in orizzontale by design (1317 px di eccesso misurati) | eccezione (§6) |
| **POS / Vendita diretta** | `sala-vendita-diretta.jsx` | catalogo + conto affiancati, pannello ordine `clamp(320px, 42%, 440px)` | due colonne da ~320 |
| **FAB assistente** | `byup-ai-fab.jsx:244,301` | `right: 26, bottom: 26`, bollino 72 × 72 | copre le CTA in basso a destra |
| **Tooltip** | `pn-tooltip.jsx:125,128` | ~~si aggancia a `window.innerWidth/innerHeight`~~ — **falso allarme, rettificato il 13/09**: il tooltip vive fuori dal frame, si scala da sé con `scale(z)` dove `z` è lo zoom del frame, e confronta rettangoli fisici con misure fisiche. È coerente, e a 2,93× si posiziona correttamente (verificato a schermo) | nessuna correzione necessaria |

### 3.2 Conteggi grezzi (97 file `.jsx`)

| Pattern | Occorrenze | File | Nota |
|---|---|---|---|
| `width` / `minWidth` / `maxWidth` fisso > 400 px | 76 | 28 | quasi tutte larghezze di finestra |
| `height` / `minHeight` fisso > 400 px | 5 | 5 | `sala-articolo-flow.jsx:123` (660), `sala-unisci-modal.jsx:163` (620), `supporto-modals.jsx:59` (480), `impostazioni-shared.jsx:1082` (420), `panoramica-byuppino.jsx:436` (decorativo) |
| `whiteSpace: 'nowrap'` | **349** | 52 | i tre nidi: `panoramica-widgets` 41, `impostazioni-menu-cucina` 30, `sala-vendita-diretta` 24 |
| `gridTemplateColumns` a colonne fisse o ≥ 3 × `1fr` | 34 | 19 | l'unica a px puri è `onboarding-step3-sale-tavoli.jsx:640` (`repeat(12, 14px)`) |
| `vw` / `vh` fuori dai commenti | 23 | 20 | **16 dentro il frame zoomato** → da convertire a `--pn-vh` / percentuali. Le 7 di `cucina-collega.jsx` sono legittime: quella pagina non ha frame |
| `position: 'fixed'` | 86 | 26 | tollerabile (§2.1), ma sfugge a margine e raggio del frame |
| `outline: 'none'` senza sostituto | **108** | ~30 | vedi §5.4: è la violazione 2.4.7 più estesa del gestionale |
| `ResizeObserver` (misura il contenitore, non la finestra) | 10 file | | **già corretti per costruzione**: griglia Panoramica, griglia tavoli Sala, board KDS, `MaxRowsScroll` |
| JS che misura la finestra | 4 file | | `pn-device.js`, `pn-tooltip.jsx`, `kds-tavoli.jsx`, `panoramica-tokens.jsx` (`--pn-vh`) — **la lista completa da rendere consapevole dello zoom**. Rettifica del 13/09: `pn-tooltip.jsx` è già corretto (confronta fisico con fisico), quindi i file da cambiare sono tre |

Che i file che misurano la finestra siano **quattro** è la buona notizia
dell'audit: l'intera correzione della misura passa da lì.

### 3.3 Le 24 finestre senza `maxWidth` (a tela 646 sbordano tutte)

`impostazioni-dati-fiscali.jsx` 785 (**1040**), 933 (520), 1259 (680), 1381 (720), 1445 (720), 1553 (720) ·
`impostazioni-menu-cucina.jsx` 1703 (460), 1743 (460), 2101 (560), 2315 (430) ·
`impostazioni-integrazioni.jsx` 823 (620), 914 (640) ·
`sala-vendita-diretta.jsx` 1736 (520), 2668 (520) ·
`supporto-modals.jsx` 206 (540), 293 (480), 361 (720) ·
`impostazioni-app.jsx` 271 (460) · `onboarding-app.jsx` 359 (460) ·
`account-tab-piani.jsx` 857 (420, popover assoluto) · `stat-clienti.jsx` 657 (440) ·
`contabilita-v2-esibizione.jsx` 113 e 273, `onboarding-step4-verifica.jsx` 1194 — questi tre sono **documenti di stampa in finestra nuova**, fuori dal frame: non toccarli.

Le altre 52 hanno `maxWidth` ma in tre dialetti diversi (`'100%'`, `'92%'`,
`'94%'`, `'92vw'`, `calc(100% - 48px)`). I quattro `92vw` di
`contabilita-v2-conti.jsx` (1211, 1278, 1434, 1595) e i due di
`panoramica-notif-bell.jsx` sono i casi peggiori: a zoom 2,93 valgono 1766 px
**logici**, cioè 5175 fisici.

---

## 4. Inventario dei bersagli

Scansione dei tag interattivi veri (`button`, `input`, `select`, `textarea`, `a`)
con larghezza o altezza dichiarata: **35 file**, 24 bersagli sotto i 24 px e 123
fra 24 e 43.

### 4.1 Sotto i 24 px — violazione 2.5.8 (AA)

| File | Riga | Elemento | Misura |
|---|---|---|---|
| `impostazioni-menu-cucina.jsx` | 1196, 6270 | button | 20 × 20 |
| | 2971, 5484 | button | 22 × 22 |
| | 4104 | button | 18 × 18 |
| | 5805 | button | **16 × 16** |
| | 4162 | input checkbox | **14 × 14** |
| | 4832 | input checkbox | 18 × 18 |
| | 6445 | input checkbox | 15 × 15 |
| `impostazioni-personale.jsx` | 1918 | input checkbox | 16 × 16 |
| | 1963 | input checkbox | **13 × 13** |
| `impostazioni-sala-mappa.jsx` | 585, 615 | button | 22 × 22 |
| `impostazioni-sala-tavoli.jsx` | 666 | button | 22 × 22 |
| | 1803 | input checkbox | 0 × 0 — input nascosto con controllo custom: **da verificare**, se l'etichetta lo avvolge non è un difetto |
| `impostazioni-vetrina.jsx` | 840 | button | 22 × 22 |
| | 1853 | input checkbox | 15 × 15 |
| `impostazioni-shared.jsx` | 309 | button (interruttore) | 38 × **22** |
| `impostazioni-dati-fiscali.jsx` | 529 | input checkbox | 17 × 17 |
| `sala-tab-tavoli.jsx` | 1599 | button | 20 × 20 |
| `onboarding-step3-sale-tavoli.jsx` | 143 | input checkbox | 17 × 17 |
| `onboarding-step4-verifica.jsx` | 1294, 1304 | input checkbox | 16 × 16 |
| `account-tab-fatturazione.jsx` | 597 | input checkbox | 18 × 18 |

Le caselle di spunta sono il gruppo più numeroso e il più insidioso: sono
`<input type="checkbox">` nativi dimensionati a mano, e il rimedio non è
ingrandirli (cambierebbe il segno) ma **estendere l'etichetta cliccabile** a
44 px di altezza attorno a loro.

### 4.2 Fra 24 e 43 px — conformi a 2.5.8, sotto l'obiettivo 2.5.5 (AAA)

123 casi. Quelli che ricadono sulle **azioni primarie e ripetute** del
gestionale, e che il piano chiede di portare a 44:

| Dove | Riga | Misura | Perché conta |
|---|---|---|---|
| `app-page-shell.jsx` (`PnModal`) | 53 | 28 × 28 | chiusura di ogni finestra |
| `panoramica-tokens.jsx` (`MODAL_X`) | 275 | 38 × 38 | chiusura delle finestre «foglio» |
| `impostazioni-personale.jsx` (`IMP_MODAL_X`) | 1143 | 34 × 34 | terza chiusura |
| `sala-salda-modal.jsx` | 1428, 2167, 2562, 3331 | 24–30 | **salda conto**: il flusso più critico |
| `sala-articolo-flow.jsx` | 310, 723, 730 | 24 × 24 | +/− quantità in comanda |
| `sala-vendita-diretta.jsx` | 1003, 2099, 2108 | 24 × 24 | POS, quantità e rimozione riga |
| `cucina-kds2-board.jsx` | 1471 | 40 × 40 | marcatura pronto sul KDS (tablet, dito) |
| `panoramica-sidebar.jsx` | 370, 385 | 26 × 26 | collasso/espansione barra |
| `sala-tab-tavoli.jsx` | 1479, 1494, 1534 | 26 × 26 | azioni sul tavolo |

Nota: il piano prevede di far crescere **l'area** e non l'icona. A scala
massima ogni bersaglio è comunque moltiplicato per 2,93, quindi 24 px logici
diventano 70 fisici: il criterio si misura però in px CSS logici, e va
soddisfatto anche a Normale.

---

## 5. Audit del contrasto — calcolato, non stimato

Formula WCAG 2.x su luminanza relativa sRGB. Tutti i valori sotto sono
calcolati; i quattro di partenza indicati nel piano sono confermati.

### 5.1 Testo su superfici chiare

| Token | su bianco | su `BG` #F5F6F8 | su `WHITE_HUSH` #F5F5F7 | Esito |
|---|---|---|---|---|
| `TEXT` #0F1115 | 18,90 | 17,47 | 17,35 | ✅ |
| `MUTED` #6B7280 | **4,83** | **4,47** | **4,44** | ⚠️ passa su bianco, **fallisce di un soffio sulle superfici grigie** |
| `MUTED_SOFT` #9CA3AF | **2,54** | 2,35 | 2,33 | ❌ (78 usi come `color:`) |
| `MUTED_LIGHT` #C5C8CE | **1,68** | 1,55 | 1,54 | ❌ (12 usi come `color:`) |
| `PINK` #FF5A5F | **3,05** | 2,82 | 2,80 | ❌ per testo; ✅ come elemento non testuale su bianco |
| `PINK_DARK` #E04347 | **4,15** | 3,84 | 3,81 | ❌ (**82 usi come `color:`**, il più diffuso) |
| `WINE` #B53338 | 6,01 | 5,56 | 5,52 | ✅ |
| `GREEN` #16A34A | 3,30 | 3,05 | 3,03 | ❌ per testo (40 usi come `color:`) |
| `AMBER` #D97706 | 3,19 | 2,95 | 2,93 | ❌ per testo (16 usi come `color:`) |
| `RED` #DC2626 | 4,83 | 4,47 | 4,44 | ⚠️ come `MUTED` |
| `BLUE` #2563EB | 5,17 | 4,78 | 4,75 | ✅ |
| `PURPLE` #7C3AED | 5,70 | 5,27 | 5,23 | ✅ |

### 5.2 Testo bianco su riempimenti

| Fondo | Contrasto col bianco | Esito |
|---|---|---|
| `BTN_BRAND` alto #FF6A6F | **2,78** | ❌ |
| `BTN_BRAND` basso #FF5A5F | **3,05** | ❌ per testo normale, ✅ ≥ 24 px o ≥ 18,66 px bold |
| `BTN_BRAND_HOVER` basso #F04A4F | 3,62 | ❌ |
| `BTN_BRAND_PRESS` alto #E04347 | 4,15 | ❌ |
| `BTN_DARK` alto #2A2D36 | 13,75 | ✅ |
| `BTN_DANGER` alto #E63A3A | 4,17 | ❌ (di poco) |
| `GRAD_STAFF` #E5446E → #F4676F → #FF9083 | 3,90 / 2,99 / **2,19** | ❌ — già annotato nei token: «mai testo bianco PICCOLO qui sopra» |
| `GREEN` / `AMBER` | 3,30 / 3,19 | ❌ per testo piccolo |

### 5.3 Badge (colore su fondo tenue) e non testuale

| Coppia | Rapporto | Soglia | Esito |
|---|---|---|---|
| `GREEN` su `GREEN_SOFT` | 3,00 | 4,5 | ❌ |
| `AMBER` su `AMBER_SOFT` | 2,86 | 4,5 | ❌ |
| `RED` su `RED_SOFT` | 3,95 | 4,5 | ❌ |
| `BLUE` su `BLUE_SOFT` | 4,24 | 4,5 | ❌ (di poco) |
| `PURPLE` su `PURPLE_SOFT` | 4,80 | 4,5 | ✅ |
| `PINK` su `PINK_SOFT` | 2,46 | 4,5 | ❌ |
| `PINK_DARK` su `PINK_SOFT` | 3,35 | 4,5 | ❌ — **è la voce attiva della sidebar** |
| `WINE` su `PINK_SOFT` | 4,85 | 4,5 | ✅ ← la via d'uscita esiste già nei token |
| `BORDER` #E5E7EB su bianco | **1,24** | 3,0 (1.4.11) | ❌ — bordo degli input |
| `BORDER_SOFT` #F0F2F5 su bianco | 1,12 | 3,0 | ❌ |
| `SIDE_ACTIVE_BG` su `SIDE_BG` | 1,19 | 3,0 | ❌ come **unico** indicatore di stato |

### 5.4 Focus (2.4.7) — la lacuna più grande

108 dichiarazioni `outline: 'none'` sugli input, **senza alcuna regola
`:focus-visible` di sostituzione** in tutto il gestionale. L'unica pagina che ha
uno stile di focus è `byup_KDS.html:21`. Al netto di tutto il resto, oggi il
gestionale **non è navigabile da tastiera in modo visibile**. Non è un problema
di scala, ma la scala lo rende bloccante (2.4.11 — a tela 646 × 360 il chrome
sticky copre facilmente l'elemento a fuoco).

Contrasti misurati per l'anello unico: `TEXT` #0F1115 su bianco 18,90 e su
`BG` 17,47; su vetro scuro #15171C serve l'inverso — bianco 17,93, oppure
`GRAD_STAFF_TO` #FF9083 8,17 e `PINK_SOFT` #FFE0DD 14,48.

### 5.5 Correzioni minime proposte — **da approvare prima di scrivere**

Il principio: **non cambiare il marchio**. Il corallo `PN.PINK` #FF5A5F resta
il colore di byup ovunque faccia il colore — riempimenti, bordi, icone,
indicatori, testo grande. Si corregge **solo dove porta testo piccolo**, e si
corregge verso valori che nella palette ci sono già.

| # | Che cosa | Prima | Dopo | Misura | Impatto |
|---|---|---|---|---|---|
| **C1** | Testo corallo piccolo: i 82 usi di `color: PN.PINK_DARK` e i 28 di `color: PN.PINK` | #E04347 → 4,15 · #FF5A5F → 3,05 | **`PN.WINE` #B53338** (già nei token, usato 6 volte) | 6,01 su bianco · 5,56 su BG · **4,85 su `PINK_SOFT`** | alto, ma è una sostituzione meccanica di token, non un colore nuovo |
| **C2** | Testo bianco piccolo su `BTN_BRAND` | 3,05 | **DECISO il 13/09: il colore non si tocca.** I CTA di marca passano da `fontSize: 15, fontWeight: 600` a **17 px / 700 bold**: sopra i 18,66 px in bold la soglia scende a 3:1 e #FF5A5F è già conforme a 3,05 | 3,05 contro soglia 3,0 | nessun colore cambia. Da applicare solo ai CTA che portano testo bianco su corallo |
| **C3** | `MUTED_SOFT` come testo (78 usi) | 2,54 | il token **resta #9CA3AF** per decorazione e testo grande; i 78 usi testuali passano a `MUTED` corretto (C5). **Un terzo grigio conforme non esiste**: per passare 4,5:1 anche su `BG` servirebbe #6D727A, che da `MUTED` #686E7B non si distingue. La gerarchia la porta il peso e la dimensione, non un terzo grigio | 4,73 su BG | medio: si perde un gradino di grigio. Da guardare a schermo prima di confermare |
| **C4** | `MUTED_LIGHT` come testo (12 usi) | 1,68 | → `MUTED` #6B7280; il token resta com'è per le decorazioni | 4,83 | basso |
| **C5** | `MUTED` sulle superfici grigie (`BG`, `WHITE_HUSH`, `SURF_ALT`) | 4,47 / 4,44 / 4,43 | scurire `MUTED` a **#686E7B** | **5,12** bianco · **4,73** BG · **4,70** HUSH — passa ovunque | basso: uno scarto di luminanza invisibile a occhio, ma è il token di testo secondario più usato del gestionale |
| **C6** | Verde e ambra come **testo** | 3,30 / 3,19 | `GREEN_TEXT` **#15803D** (5,02) e `AMBER_TEXT` **#B45309** (5,02) — **sono già i colori degli stati tavolo** (`TT_ACCENTS`, `SALA_STATI`) | 5,02 | basso: colori già nel sistema |
| **C7** | Badge colore su fondo tenue | 2,86–4,24 | usare le varianti «testo» di C6 e #B91C1C (5,30 su `RED_SOFT`) / #1D4ED8 (5,49 su `BLUE_SOFT`) | 4,51–5,49 | basso |
| **C8** | Bordo degli input (1.4.11) | `BORDER` 1,24 | bordo **a riposo** invariato; **al focus** l'anello unico di §5.4 porta il contrasto. Per gli input in stato di errore, bordo `RED` (4,83) | ≥ 3:1 | nessun cambio a riposo |
| **C9** | Voce attiva della sidebar | solo fondo `SIDE_ACTIVE_BG` (1,19) | affiancare al fondo un **segno** (barretta laterale o testo in `WINE`): lo stato non può dipendere da un solo colore a 1,19 | — | piccolo, ma è anche 1.4.1 |

**Nessuna di queste va applicata prima del tuo assenso.** La C2 in particolare è
una scelta di prodotto, non tecnica: o si scurisce il pulsante di marca, o si
ingrandisce il suo testo. Il criterio è soddisfatto in entrambi i modi.

---

## 6. Eccezioni 1.4.10 che intendo rivendicare

WCAG ammette lo scroll bidimensionale solo per contenuti che «richiedono un
layout bidimensionale per l'uso o il significato». Quattro casi, tutti con il
contorno che rifluisce normalmente:

| # | Superficie | File | Motivazione | Condizioni |
|---|---|---|---|---|
| **E1** | **Mappa dei tavoli** | `sala-tab-tavoli.jsx`, `sala-geometria.jsx`, `sala-table-tile.jsx` | È una **mappa**: la posizione dei tavoli nello spazio è il significato. Riflowarla in colonna distruggerebbe l'informazione | Pan e zoom propri; i controlli a 44 px e mai coperti; la **lista** tavoli resta l'alternativa lineare completa (già esiste) |
| **E2** | **Board KDS** | `cucina-kds2-board.jsx`, `byup_KDS.html` | **Toolbar/kanban di stato**: le colonne sono la pipeline di produzione, l'adiacenza è il dato. `.kds2-rail` scorre già in orizzontale by design | A `sm` si offre una colonna per volta con selettore; lo scorrimento resta per chi vuole la vista d'insieme |
| **E3** | **Tabelle di Contabilità e Statistiche** | `contabilita-v2-*.jsx`, `stat-*.jsx` | **Tabelle di dati**: 5–7 colonne di importi, l'incolonnamento è il significato | Scorrono **dentro il proprio contenitore**, mai la pagina; prima colonna sticky; intestazioni associate; filtri, KPI e paginazione fuori dallo scroll e riflowanti |
| **E4** | **Grafici delle Statistiche** | `stat-atoms.jsx`, `stat-economici.jsx` | **Diagrammi**: un grafico a barre su 12 mesi non riflusce in colonna senza perdere la lettura | Larghezza minima propria dentro un contenitore che scorre; il dato resta leggibile anche in forma tabellare (la tabella sotto al grafico esiste già in molte schede — **da verificare scheda per scheda in Fase 3**) |

**Non** rivendico eccezioni per: modali di pagamento, POS, onboarding,
Impostazioni, Panoramica, Supporto, Profilo. Lì il reflow è dovuto.

---

## 7. Conseguenze sul piano — le rettifiche che propongo

Il piano resta valido nella sostanza. Cinque correzioni di rotta:

1. **Fase 1 diventa più piccola e più importante.** Non «un sistema di
   breakpoint nuovo», ma **la misura giusta al sistema che c'è**: `classify()` e
   `statStretto()` calcolati sulla tela logica. `byup-a11y.jsx` espone la scala,
   `byup-fit.js` unifica il `fit()` e pubblica `bp`; `pn-device.js` consuma `bp`
   invece di `innerWidth`. Il contratto `STG/STMIN/STSCROLL` non cambia, quindi
   i 23 file che lo usano non si toccano.
2. **La Fase 1.4 (viewport) è già fatta.** La tolgo.
3. **Fase 2 e 3 si accorciano dove il tablet è già passato.** Le pagine sono
   tutte in `TABLET_NATIVE`, cioè un layout stretto ce l'hanno già: il lavoro
   diventa verificare che regga a 646 e a 320 logici, non costruirlo. Dove non
   regge, si estende quello che c'è.
4. **Va aggiunto un capitolo sull'altezza.** 360 px logici a scala massima sono
   il vincolo vero (§2.3): testata compatta, banner comprimibili, piede sticky a
   una riga sola.
5. **Il focus (§5.4) va promosso.** Con 108 `outline:none` senza sostituto, il
   gestionale oggi fallisce 2.4.7 a **qualunque** scala. Propongo di farlo
   subito dopo la Fase 1, non in Fase 5: è una regola sola, in un file solo, e
   sblocca ogni verifica da tastiera delle fasi successive.

Aggiungo alle sostituzioni meccaniche già previste: i **16 `vw`/`vh` dentro il
frame** → `--pn-vh` e percentuali; le **24 finestre senza `maxWidth`**; i
**quattro `92vw`** di Contabilità.

---

## 8. Residui, dubbi e cose da decidere

- **C3**: portare i 78 usi testuali di `MUTED_SOFT` su `MUTED` toglie un
  gradino di grigio alla gerarchia, e non c'è modo di evitarlo restando
  conformi — fra il grigio conforme più chiaro (#6D727A) e `MUTED` corretto
  (#686E7B) non c'è differenza percepibile. Da guardare su una schermata vera
  prima di confermare: se il risultato appiattisce troppo, la via è distinguere
  con il **peso** (500 contro 600) invece che col colore.
- **`byup_KDS.html`**: **DECISO il 13/09 — entra nel perimetro**, con `zoom` sul
  frame che resta `100vw × 100vh`. Le card crescono davvero e ne stanno meno in
  vista: è esattamente l'adattamento che la nota in testa a quel file dichiara
  di volere («quello che si adatta è QUANTE card ci stanno, non quanto sono
  grandi»). Le superfici scalabili diventano **13**.
- **`byup Cucina Collega.html`** e **`byup Login.html`**: senza frame, senza
  `zoom`. Il Login deve avere il controllo di scala (lo dice il piano); Cucina
  Collega usa già `clamp(vw)` ed è di fatto già fluida — verificare e basta.
- **`MaxRowsScroll`** (`contabilita-v2-tokens.jsx`): misura `offsetTop +
  offsetHeight` dell'ultima riga visibile. Con la tela logica bassa non produce
  altezze negative (non c'è sottrazione), ma può restituire un `maxHeight`
  maggiore dell'area disponibile. Da verificare in Fase 3, non è un blocco.
- **Metrica «fuori dal frame»**: va filtrata dalle decorazioni volutamente
  sovradimensionate (`.byu-macchia`, `inset: -30%`), o le asserzioni di Fase 6
  segnaleranno 420 px di falso positivo sulla Panoramica a ogni giro.

---

## 9. Strumenti e note di metodo

- Server locale obbligatorio: `python3 -m http.server` dalla radice del repo —
  il progetto **non funziona da `file://`**.
- Verifiche visive **solo** con `puppeteer-core` e il Chrome di sistema
  (`setViewport`): il `--screenshot` di Chrome nudo con `--window-size` non
  emula il viewport e mostra tagli che non esistono.
- Il render headless di default (800 × 600) viene classificato **tablet** da
  `pn-device.js`, non desktop: per misurare il frame zoomato serve una finestra
  ≥ 1280.
- Nessun errore di sintassi è ammesso: un `.jsx` rotto **rende bianca l'intera
  pagina** e nessun test lo intercetta. Compile check Babel + render headless
  prima e dopo ogni batch.

### Skill richieste dal piano

- **`design:accessibility-review`** — **non installata in questa sessione.**
  L'audit è stato condotto sulla griglia dei criteri WCAG 2.2 AA citati dal
  piano (1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12, 2.4.7, 2.4.11, 2.5.5, 2.5.8) e
  su misure calcolate, senza inventare una checklist sostitutiva.
- **`design-system`** — disponibile (senza prefisso `design:`). Da invocare in
  Fase 1 prima di creare `byup-a11y.jsx`, come previsto.
- **`frontend-design`** — non usata, come da divieto esplicito.

---

# Parte II — Esito della verifica (Fase 6)

Chiusa il **13 settembre 2026**. Tutto quello che segue è misurato su Chrome via
Puppeteer, con il repo servito da `python3 -m http.server` sulla radice. Dove
scrivo un numero, è un numero che è uscito da una misura, non una stima.

## 7. La matrice

**13 superfici × 3 modalità × 3 finestre = 117 combinazioni.** Per ognuna:
scroll della pagina, contenitori che scorrono in orizzontale fuori dalle
eccezioni dichiarate, testo troncato senza modo di recuperarlo, elementi fuori
dal frame, bersagli sotto i 24 px, e trentacinque `Tab` con verifica che
l'elemento a fuoco sia in vista e porti un anello visibile.

| Criterio | Esito su 117 combinazioni |
|---|---|
| **Scroll orizzontale della pagina** | **0** — nessuna pagina, nessuna modalità, nessuna finestra |
| **Scroll orizzontale fuori dalle eccezioni** | **4–5 per finestra**, tutte nastri di linguette o tabelle dati: le eccezioni di §6, rivendicate e motivate |
| **Testo troncato senza recupero** | **0** — ogni testo tagliato dai puntini porta il testo intero come `title` |
| **Elementi fuori dal frame** | **0** |
| **Bersagli sotto 24 × 24** | **0** |
| **Focus fuori vista o senza anello** | **0** |
| **Errori JavaScript** | **0** |
| **Contrasto del testo** | **0 sotto soglia** su 1024 testi misurati (§10.1) |

Finestre provate: 1920 × 1080, 1366 × 768, 1280 × 800. L'unico scroll che resta
è **verticale sul Login** a «Grande» e «Molto grande» (203–1066 px): la scheda
di accesso ingrandita non ci sta in altezza, e 1.4.10 vieta lo scorrimento in
DUE dimensioni, non quello verticale.

## 8. Criterio per criterio

| Criterio | Livello | Esito | Come è stato verificato |
|---|---|---|---|
| **1.4.3** Contrasto testo | AA | ✅ **1024 testi misurati, zero sotto soglia** | Colore calcolato dal DOM contro il fondo effettivo, soglia scelta per dimensione e peso. Comprese le tre route della cucina (§10.1), misurate a parte: 294 testi, zero sotto soglia |
| **1.4.4** Resize text | AA | ✅ | Le modalità arrivano al 250%, oltre il 200% richiesto. Nessun troncamento irrecuperabile, nessun controllo che non cresca col testo |
| **1.4.10** Reflow | AA | ✅ con le 5 eccezioni di §6 e §9 | Tela logica portata da 1280 a **320 px**: il minimo di reflow è raggiunto, non solo il 200% |
| **1.4.11** Contrasto non testuale | AA | ✅ | Il corallo del marchio come riempimento fa 3,05:1; i colori di stato 3,19–5,70. I bordi a riposo restano sotto, ma lo stato lo porta l'anello di focus (§10) |
| **1.4.12** Text spacing | AA | ✅ | Interlinea 1,5 · lettere 0,12em · parole 0,16em applicate a tutto il documento su 11 pagine × 2 modalità: **nessun layout si rompe, nessuna pagina prende scroll orizzontale** |
| **2.4.7** Focus visibile | AA | ✅ | Anello unico 3 px con alone, definito una volta in `byup-a11y.jsx`. Verificato che vinca sui 108 `outline: none` scritti inline |
| **2.4.11** Focus non oscurato | AA | ✅ | 35 `Tab` per combinazione: l'elemento a fuoco è sempre almeno parzialmente in vista, e un ascoltatore di `focusin` lo porta in vista quando un contenitore che scorre lo lascerebbe fuori |
| **2.5.8** Target size (minimum) | AA | ✅ | **506 bersagli visibili, 2 sotto i 24 px**, ed entrambi sono link di testo in linea, che il criterio esclude |
| **2.5.5** Target size (enhanced) | AAA (obiettivo) | ✅ sulle azioni primarie | Le 7 azioni primarie e ripetute — salda, procedi alla transazione, manda tutto, tutto pronto, libera tavolo, salva, continua — sono **tutte ≥ 44 × 44** |
| **EN 301 549 §11.7** | — | ✅ | La scala si inizializza dallo schermo e propone «Grande» una volta sola; «Riduci animazioni» parte da `prefers-reduced-motion` e lo segue finché l'utente non sceglie. I due controlli stanno in **Profilo → Dati generali**, dopo «Lingua»: Impostazioni è del locale, questa è di chi guarda lo schermo |

## 9. Il percorso critico a 250%, solo da tastiera

Provato per intero, senza mai toccare il mouse, con la tela logica a 646 × 360:

```
LOGIN            Tab ×4  → «Dimensione Molto grande» → Invio → salvata
                 Tab ×2  → campo email → «admin»
                 Tab ×3  → «Accedi» → Invio → entra
SALA (646×360)   scroll orizzontale: 0
                 Tab ×16 → «Vai al conto» → Invio
SALDA CONTO      la finestra è a tutto schermo, 602 × 360
                 Tab ×9  → «Procedi alla transazione»
                 in vista, anello di focus presente, bersaglio 307 × 64
                 Esc     → chiude, e il fuoco torna su «Vai al conto»
```

Errori JavaScript lungo tutto il percorso: **nessuno**.

Nel farlo è emerso — e corretto — che la finestra di saldo, la più critica del
prodotto, **non si chiudeva con Esc** e lasciava uscire il fuoco alle sue
spalle: chi lavorava da tastiera restava dentro un pannello da cui si usciva
solo col mouse.

## 10. Quello che resta, detto per intero

**1 · Le board della cucina — CHIUSO il 13/09.** Restava scoperta la palette
delle due board, che in Fase 0 non avevo auditato perché avevo misurato `PN`.
Nel riesaminarla sono emerse due cose che avevano cambiato il quadro.

La prima: **non sono due pagine, sono due modi di guardare**, e ciascuno vive su
due route. La *Visualizzazione Ristorante* è la board a tavoli (`kds-tavoli.jsx`,
palette `UI`/`STATI`), che compare dentro `byup Cucina.html` e, da sola, in
**`byup_KDS.html` — il monitor a parete**. La *Visualizzazione Pub* è il KDS v2
(`cucina-kds2-board.jsx`, palette `K`), che compare nella stessa Cucina e nella
sua route autonoma. Quale si veda lo decide il monitor, non chi guarda.

La seconda: **`byup_KDS.html` non era nella scansione del contrasto** — era nelle
verifiche di reflow e di bersagli, non in quella dei colori. Coi numeri veri i
testi sotto soglia erano **119 su 294**, non 85, e il peso si spostava: la board
a tavoli ne portava 69 e il KDS v2 50. Quella messa peggio era quella *senza* una
decisione alle spalle — e sistemarla ripara anche il monitor a parete.

Quattro tinte cambiate, ognuna scesa nella propria famiglia:

| Dove | Prima | Peggiore | Dopo | Peggiore |
|---|---|---|---|---|
| Tavoli · grigio secondario (`UI.muto`) | `#8C8587` | 3,23 | **`#736D6F`** | 4,53 |
| Tavoli · «In preparazione» (`STATI.marcia.testo`) | `#E8402E` | 3,61 | **`#CC3828`** | 4,51 |
| Tavoli · «Pronti» (`STATI.pronto.testo`) | `#1DA35C` | 2,91 | **`#177F48`** | 4,51 |
| KDS v2 · grigio di quiete (`K.TESTO_OFF`) | `#9E9E9E` | 2,48 | **`#707070`** | 4,50 |

«In attesa» `#C2410C` resta com'era: passava già. Nella board a tavoli `ink` e
`testo` erano lo stesso valore e non potevano esserlo — il primo riempie (3:1 di
1.4.11 gli basta), il secondo scrive il nome dello stato (4,5). Adesso sono due
campi distinti e il riempimento non è cambiato, quindi a schermo la board è
quella di prima.

**Il salto fra acceso e spento si stringe**, e questo i numeri lo dicono: sul
KDS v2 da 7,05 a 3,87, sui tavoli da 4,92 a 3,51. Guardate le due board a pieno
carico, **regge**: nel nastro delle sorgenti «Marco» e «Luca» restano
chiaramente indietro perché a distinguerli non è il solo grigio ma anche il
bordo tratteggiato contro quello pieno, e nelle card il nome del piatto resta
quasi nero e in grassetto contro un secondario che è grigio e più leggero. Se un
giorno quel salto non bastasse, la strada è il peso o l'opacità della tessera
intera, non il colore dell'inchiostro.

**2 · I bordi a riposo (1.4.11).** `PN.BORDER` fa 1,24:1 sul bianco: il bordo di
un campo, da solo, non raggiunge i 3:1. Non l'ho cambiato perché il filetto
sottile è il linguaggio visivo del prodotto e cambiarlo si vede ovunque. Lo
stato di fuoco è coperto dall'anello; resta scoperto il **campo in errore**, che
oggi si distingue solo per il bordo rosso — lì il colore non basta e servirebbe
anche un segno.

**3 · Lo scroll verticale del Login.** A 250% la scheda di accesso è più alta
dello schermo. È conforme (1.4.10 vieta le due dimensioni insieme), ma si
potrebbe far respirare il modulo invece di farlo scorrere.

**4 · La colonna ferma è su una tabella sola.** L'ho messa sui Conti, che è
quella che scorre di più. La stessa ricetta — `byupColonnaFerma()` — va portata
su Costi, Fatture e sulla tabella delle Statistiche.

**5 · La fascia d'avviso copre la cima della pagina.** È un comportamento di
sempre, a ogni scala, e a «Molto grande» ne resta una sola e compatta. Ma
copre, e chi arriva col `Tab` a un elemento sotto di lei lo trova coperto.

## 11. Trappole trovate lungo la strada, perché non si ripaghino due volte

- **`elementFromPoint` e `getBoundingClientRect` non concordano dentro `zoom`.**
  Un controllo automatico di «l'elemento a fuoco è coperto» dava 28 falsi
  positivi su 35 su elementi perfettamente visibili. La verifica affidabile è
  l'intersezione col viewport più l'anello di focus calcolato; la copertura si
  guarda a occhio sugli screenshot.
- **`offsetWidth`/`offsetHeight` invece di `getBoundingClientRect()/zoom`.** I
  primi sono px di layout, cioè già logici. Dividere il rettangolo per lo zoom
  introduce un errore del 2% e fa sembrare sotto misura bersagli che stanno
  esattamente a 24.
- **Le unità di viewport dentro `zoom` non vengono scalate.** `92vh` a 2,93×
  vale quasi tre schermate. Si usa `--pn-vh` / `--pn-vw`, che byup-fit pubblica.
- **Un backtick dentro un template literal spegne un file intero.** È successo
  in `byup-a11y.jsx`: anello di focus, trappola e finestre piene morti su tutte
  le pagine, e il compile check da solo non l'aveva preso perché non l'avevo
  rilanciato. Il render headless sì.
- **Il frame lo monta React dopo Babel.** Dedurre «questa pagina non ha frame»
  dall'assenza di `.frame` nel DOM apre una finestra di qualche decimo di
  secondo — esattamente quella del primo render — in cui ogni layout adattivo
  si sente rispondere la misura sbagliata. Le pagine senza frame lo dichiarano
  con un attributo.

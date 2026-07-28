# byup — Design System · App Consumer

> Riferimento unico per lo sviluppo dell'app consumer byup (cartella `app/` di questo repo).
> La fonte di verità dei token è **[`byup-app-kit.jsx`](./byup-app-kit.jsx)** (`window.ByupKit`, alias `BK`):
> questo documento la descrive, non la sostituisce. Se tocchi un token, aggiornalo lì.

**Repo:** `github.com/Haise02/byup-fresh` (cartella `app/`) · **Demo live:** [byup-fresh.vercel.app/app/byup%20Home.html](https://byup-fresh.vercel.app/app/byup%20Home.html)
**Ultimo aggiornamento:** 28 lug 2026 · **Stack:** React no-build (Babel-standalone runtime) · **Lingue UI:** italiano

### Quick start (per chi arriva da zero)
1. Clona il repo, apri la cartella `app/` — non c'è build: i `.jsx` vengono compilati nel browser da Babel-standalone.
2. Entry point: **`byup Home.html`** (SPA completa). Serve un server statico qualsiasi (`npx serve`, Live Server, o il deploy Vercel) perché gli asset usano percorsi relativi. In alternativa `home-standalone.html` funziona anche da `file://` (contiene i moduli già precompilati).
3. Deploy: push su `main` → Vercel pubblica in automatico ([vercel.json](../vercel.json) serve i `.jsx` come `text/babel`).
4. Dopo ogni modifica ai `.jsx`, rigenera gli standalone: `node build-standalone.js app.jsx menu.jsx …` (vedi §11).
5. Scorciatoie utili in sviluppo: `?page=byuppini|roadmap|menu|search|profile|map` per aprire una pagina diretta; `localStorage byup.themeMode='dark'` per il tema scuro; `localStorage byup_auth='1'` e `byup_perms='1'` per saltare l'onboarding.

---

## 1 · Principi

1. **Giocoso ma premium.** Kawaii dove intrattiene (mascotte, icone categoria, giochi), sobrio dove si paga (conto, checkout). Mai emoji come icone di sistema: si usano SVG inline o gli asset kawaii del registry.
2. **Una sola firma per i soldi.** Tutti i "money-CTA" (invia ordine, paga, riscatta) usano `CTA_GRAD` + `CTA_GLOW`. Nessun altro bottone li usa.
3. **Il tema scuro non è un filtro.** Ogni superficie/testo ha il suo token dark esplicito. Regola assoluta: *mai caratteri scuri su fondo scuro*.
4. **Fisica, non fade.** Le interazioni usano molle (`SPRING`) e gesture native (drag, swipe, slide-to-pay). I fade sono per l'ambiente, le molle per ciò che si tocca.
5. **Il glass è la texture di brand.** Pannelli in liquid glass (blur + bianco translucido) sopra le foto: card Da scoprire, RestaurantBigCard, goal card roadmap, CTA vetrina premium.

---

## 2 · Architettura & convenzioni

| Cosa | Regola |
|---|---|
| Moduli | `<script type="text/babel">` compilati a runtime. Ordine di load: **[byup-app-kit](./byup-app-kit.jsx) → [ios-frame](./ios-frame.jsx) → [extras](./extras.jsx) → [venue-variants](./venue-variants.jsx) → [map](./map.jsx) → [auth](./auth.jsx) → [app](./app.jsx) → [dish-art](./dish-art.jsx) → [menu](./menu.jsx)** |
| Global | Ogni file espone ciò che serve su `window` (`ByupKit`, `MenuApp`, `BottomTabBar`, `__byupNav`, …). Ogni file è un IIFE: niente const globali condivise |
| Routing SPA | `window.__byupNav = { go(page), home(), venue() }` + deep-link `?page=…`. Il menu è una pagina della SPA (`page==='menu'` → `window.MenuApp`) |
| Stato cross-schermata | `sessionStorage`: `byup_menu_route` (deep-route del menu), `byup_menu_premium`, `byup_table` (pagamenti fatti/residuo), `byup_menu_from` |
| Tema | `localStorage byup.themeMode` = `light | dark | auto`. Componenti live: `BK.useByupTheme()` → `[T, mode, setMode]`. Moduli statici: const `__BYUP_DARK` letta al load (il toggle ricarica la pagina) |
| Build standalone | `node build-standalone.js <file.jsx> …` — richiede **@babel/standalone v7** (o preset `[['react',{runtime:'classic'}]]`). Ogni blocco compilato è riavvolto in IIFE |
| Safe-area PWA | var CSS `--byup-sat` (desktop 54px, mobile `max(env(safe-area-inset-top),12px)`); dock inferiore su `calc(env(safe-area-inset-bottom) + 10px)`, contenuto scrollabile con padding-bottom 100–126px; striscia blur sopra la status bar |
| Viewport | `maximum-scale=1, user-scalable=no, viewport-fit=cover`; `overflow-x:hidden`; scrollbar nascoste ovunque; input ≥16px (no zoom iOS) |

---

## 3 · Colori

### 3.1 Palette brand (`BK.PALETTE`)

| Token | Hex | Uso |
|---|---|---|
| `coral` | `#E32459` | Colore primario, CTA, accenti attivi |
| `coralHot` | `#FF3D6E` | Primario in dark, stati "hot" |
| `wine` | `#4D122E` | Fondi profondi brand, gradienti scuri |
| `wineLight` | `#AE3152` | Passaggio intermedio nei gradienti |
| `cream` | `#FAE3DE` | Superfici calde chiare |
| `blush` | `#ED9B9B` | Decorativo |
| `lime` | `#CEFF00` | Progressi, vincite, byuppini, "aperto" |
| `ink` | `#141414` | Testo su lime/gold |
| gold (roadmap) | `#FFCF4A` / `#FFE27A` | Coin, premi, badge saldo |

### 3.2 Temi (`BK.THEMES`) — light / dark

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FBF4F1` | `#161514` (espresso-charcoal caldo, **non** rosso scuro) |
| `surface` | `#FFFFFF` | `#201E1C` |
| `surfaceAlt` | `#FDF0EC` | `#2A2724` |
| `text` | `#1C0F15` | `#F6ECE9` |
| `textDim` | `rgba(28,15,21,.56)` | `rgba(246,236,233,.60)` |
| `textFaint` | `rgba(28,15,21,.34)` | `rgba(246,236,233,.36)` |
| `primary` | coral | coralHot |
| `line` | `rgba(77,18,46,.10)` | `rgba(246,236,233,.10)` |
| `glass` | `rgba(255,255,255,.62)` | `rgba(32,30,28,.62)` |
| `shadow` | coral 30% morbida | coralHot 34% morbida |

### 3.3 Palette menu (`menu.jsx`, dark-aware via `__BYUP_DARK`)

`PINK #E32459` · `PINK_DARK #B81C47` · `WINE #8B1A3A` (dark: `#EF6389`) · `TEXT` · `MUTED` · `BORDER` · `BG_PAGE` · `SURF` (card) · `TINT` (righe/chip) · `MUTESURF` (avatar/disabled) · `BADGE #7A1C3E` (dark `#7A2F4A`).

### 3.4 Palette Byuppini dark (`BYP` in app.jsx)

`bg #161514` · `surf #211F22` · `surf2 #2A262B` · `coral/coralHot` · `lime` · `gold #FFCF4A` — le pagine Byuppini/Roadmap/Games sono *sempre* scure.

### 3.5 Semantici

| Significato | Colore |
|---|---|
| Aperto / attivo / successo | `#3DDC7F` (dot con glow) — verde testo `#1C8C5B` |
| In arrivo / orario futuro | `#FFC839` |
| Chiuso / errore / danger | dot `#FF6B6B` (entrambi i temi) · testo light `#AA2222`, azioni distruttive `#D21E50` |
| Rating star | `#FFC839` |

### 3.6 Firma CTA (money-CTA)

```js
CTA_GRAD = 'linear-gradient(122deg, #E32459 0%, #B81C47 100%)'
CTA_GLOW = '0 16px 34px -12px rgba(227,36,89,.62), inset 0 1px 0 rgba(255,255,255,.30)'
CTA_DEAD = '#E9CFD8'   // disabled
```
Forma: pill (`borderRadius 999`), h 48–52, testo bianco 800.

---

## 4 · Tipografia (`BK.TYPE`)

| Famiglia | Font | Uso |
|---|---|---|
| `display` | **Fredoka** (400/500/600) | Titoli, nomi locale, numeri hero, titoli arcade |
| `sans` | **Hanken Grotesk** (400–700) | Tutto il resto |

Scala: `h1 34/600` · `h2 26/600` · `h3 22/500` · `title 19/600` · `body 16/400` · `small 13.5/500` · `micro 12/600 upper`.
Eyebrow/label: 10–11px, weight 700–800, `letterSpacing 1–2`, uppercase.
I titoli display non superano weight 600 (Fredoka 700 non è caricato).

---

## 5 · Forma, spazio, elevazione

| Token | Valore |
|---|---|
| Radius (`BK.RADII`) | card 24 · cardLg 28 · sheet 28 · pill 999 · chip 16 — card interne/righe: 12–14 · card foto: 22 |
| Padding pagina | 18–22px laterali |
| Gap liste | 8–12px |
| Ombre | sempre morbide e colorate: `0 14–22px 30–44px -18px rgba(227,36,89,.4)`; in dark ombra nera `.6` + glow coral |
| Bottom sheet | `borderTopRadius 22–28`, handle 40–50×4–5px, overlay `rgba(0,0,0,.45)`, `animation: slideUp .25–.3s` |

### Liquid glass (ricetta standard)
```js
background: 'rgba(255,255,255,0.14–0.22)',
border: '1px solid rgba(255,255,255,0.28–0.35)',
backdropFilter: 'blur(12–18px) saturate(170–180%)',  // + WebkitBackdropFilter
borderRadius: 15–18, boxShadow: '0 8–10px 20–26px -10px rgba(20,8,12,.45)'
```
Contenuto sopra glass: titolo Fredoka bianco + `textShadow 0 2px 8px rgba(20,8,12,.4)`, righe info 10.5–11.5px/700, cerchio bianco 32px con freccia ↗ magenta come affordance.

---

## 6 · Motion & háptica

| Token | Valore | Uso |
|---|---|---|
| `SPRING` | `cubic-bezier(.34,1.45,.64,1)` | Press, pop, elementi che "arrivano" |
| `EASE_OUT` | `cubic-bezier(.22,.9,.35,1)` | Fade-up, transizioni di pagina |
| `DUR` | fast 200 · base 300 · slow 420 | |
| Rilascio drag | `transform .45–.5s cubic-bezier(.2,1.5,.35,1)` | Molla elastica di ritorno |
| Ruota fortuna | `4s cubic-bezier(.16,.84,.14,1)` | Decelerazione lunga |

Keyframes condivisi (`bk*` nel kit): `bkFadeUp` (ingresso standard, stagger `delay = i*40–70ms` + `backwards`), `bkPopIn`, `bkMascotIn`, `bkBob`, `bkPulse`, `bkShimmer`, `bkShine`, `bkCtaPulse`, `bkConfettiFall`…
Feedback tattile: `.bk-press` (scale .97 al tap) + `BK.haptic` → `selection(8ms)` · `light(12)` · `success([14,60,20])` · `error([40,40,40])`. Ogni elemento toccabile ha entrambi.

**Gesture di sistema:**
- **Pointer Events sempre** (`onPointerDown/Move/Up` + `setPointerCapture`), mai touch+mouse insieme (doppio-fire mobile). Guardie di drag su **ref**, mai su state (i tap veloci si perdono).
- Swipe-riga stile chat (`SwipeDishRow`): soglia ~78px, resistenza oltre soglia (×0.35), fondi azione che crescono col progresso, flash al trigger.
- Slide-to-pay: drag = paga, tap sul pomello = cicla modalità (mine ↔ all) con morphing icona.
- Stack di card (`BypGameStack`, `StackCarousel`): drag orizzontale >70px = swap, dots + hint "⇄".

---

## 7 · Componenti

### Primitive del kit (`BK.*`)
| Componente | Note |
|---|---|
| `Atmosphere` | Wrapper pagina: bg tema + glow radiale coral |
| `GlassPanel` | Pannello glass tematizzato |
| `PillButton` | Bottone pill primary/secondary |
| `MascotMoment` | Toast mascotte "prima visita" per pagina (`pageKey`) — è `role="status"` e **intercetta i click** sull'area: tenerlo lontano dalle CTA |

### Componenti chiave dell'app
| Componente | File | Contratto |
|---|---|---|
| `BottomTabBar` | [app.jsx](./app.jsx) (`window.BottomTabBar`) | 4 tab in due isole glass (pill, h 60) + bottone QR flottante centrale 62px, `active`, `onHome/onByuppini/onSearch/onProfile/onQR`, `showQR`, `forceDark` |
| `HomeSections` | [app.jsx](./app.jsx) | Home componibile: header+search+moment bar sticky, sezioni; callback `onCategory`, `onMap`, `onCardClick`… |
| `StackCard`/`StackCarousel` | app.jsx | "Da scoprire": card con widget glass (nome + ↗ + stato dot + rating) |
| `RestaurantBigCard` | app.jsx | Foto full-bleed + pannello glass basso |
| `CategoryScreen` | app.jsx | Griglia 2 colonne sfalsate, chips filtro, card foto 188/236px |
| `OpenTableCard` | app.jsx | Card home "tavolo aperto" da `sessionStorage byup_table` |
| `RoadmapScreen` | app.jsx | Mappa 864×1821 (`assets/road-city.png`), overlay `venue-N.png` posizionati da `ROAD_P` (frazioni), filler specchiato+blur sopra e sotto |
| Byup Games (`BypWheel`…) | app.jsx | Card arcade pastello + box scuro `#241D22`; **solo la CTA apre il gioco**, la card si trascina soltanto |
| `OrderSheet` + `SwipeDishRow` | [menu.jsx](./menu.jsx) | Carrello con swipe → tavolo / ← dividi |
| `SplitPickSheet` | menu.jsx | "Con chi dividi?" avatar selezionabili |
| `PaymentScreen` + `SlideToPay` | menu.jsx | Conto: card "Tu", "Il tavolo" raggruppato, ospiti aggregati ("N Ospiti"), CTA slide |
| `GuestsSheet` | menu.jsx | Al tavolo: app/web singoli + riga collettiva Ospiti |
| `BookingSheet` | [extras.jsx](./extras.jsx) | Prenotazione single-screen a griglie |
| `ProfileScreen` | extras.jsx | QuickCard 2×2 (in dark il box icona usa il tint pastello), avatar default `assets/avatar-default.png` |
| `VenuePremium` | [venue-variants.jsx](./venue-variants.jsx) | Vetrina oro/scura, menu reel-style con PNG ancorati dal basso |

### Regole di comportamento
- Il popup carrello **non si auto-espande** (si apre a tap/drag sull'handle).
- Stati pagamento persone: **o pagato o normale** — non esiste "sta pagando".
- Ospiti senza app: sempre aggregati in un'unica voce "N Ospiti" (icona persone), mai Ospite 1/2/3.
- PNG cibo nelle card scure: ancorati **dal basso** (`bottom` fisso sull'ombra, mai top/centro).
- Immagini mappa: preview usa tile CartoDB `dark_all` in dark.

---

## 8 · Iconografia & asset (`BK.ASSETS`)

| Gruppo | Contenuto |
|---|---|
| `mascot.*` | 8 pose (confident, happy, wave, wink, chef, waiter, sleep, phone) — la mascotte è l'unico "personaggio", non si inventano varianti |
| `cat.*` | 12 icone categoria kawaii (pizza, burger, …; cocktail→`icon-sushi`, dolce→`icon-donut`, brunch→`icon-coffee`) |
| `hero.*` | 4 hero food (coffee, spritz, froyo, burger) |
| `bg.*` | coral/dark/light |
| Extra | `coin.png`, `icon-*` kawaii (pasta, watermelon, popcorn…), `premium/*.webp` (23 render piatti), `road-city.png`, `avatar-default.png`, `rank-1…8.png` (gradi livello byuppini), `reward-*.png` (premi), `offerte/*.webp`, `reels/*.webp` |

Icone di sistema: SVG inline stroke 2–2.6, `strokeLinecap/Join round`, 11–17px. Niente librerie icone, niente emoji (eccezione: Traguardi e micro-copy dove già presenti).

---

## 9 · Dark theme — checklist

1. Ogni testo su token (`TEXT/MUTED/...` o `T.text/...`), mai hex fissi scuri.
2. Superfici: `SURF/TINT/MUTESURF` dark-aware; back button `rgba(43,39,44,.95)`.
3. Icone su card scure: box con **tint pastello** dietro (non icona nuda).
4. Gradienti review/success: base `#161514`, mai bianchi.
5. Danger: `#FF6B6B` su dark, rossi profondi (`#AA2222`, `#D21E50`) su light.
6. Verificare sempre con `localStorage byup.themeMode='dark'` + screenshot.

---

## 10 · Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Fredoka per titoli, Hanken per il resto | Font di sistema nei titoli |
| `CTA_GRAD` solo su azioni di denaro | Gradiente coral su bottoni secondari |
| Pointer Events + ref-guard nelle gesture | onTouch+onMouse insieme, guardie su state |
| Stagger `bkFadeUp` sugli ingressi lista | Elementi che appaiono tutti insieme |
| Glass panel sopra foto per info | Testo nudo su foto senza gradiente/glass |
| Pill 999 per bottoni e chip | Bottoni rettangolari ad angolo vivo |
| `BK.haptic` su ogni tap significativo | Tap silenziosi su azioni primarie |
| Emoji solo nei copy, SVG/asset per icone | Emoji come icone di navigazione |

---

## 11 · Gotchas di sviluppo

- **Babel 8 rompe gli standalone**: usare @babel/standalone **v7** o preset `[['react',{runtime:'classic'}]]` (già nel build script).
- **IIFE obbligatorie** nei blocchi compilati degli standalone (collisioni di `const` globali).
- `background` shorthand nei React style **resetta** `backgroundSize/Position`: metterlo prima delle proprietà specifiche.
- `MascotMoment` intercetta i click (nei test E2E: usare click programmatici via `evaluate`).
- Gli standalone (`home-standalone.html`, `menu-standalone.html`) sono **generati**: non editarli a mano, modificare i `.jsx` e rilanciare `build-standalone.js`.
- Le foto dei locali/piatti demo sono URL Unsplash: prima di aggiungerne di nuove verificare che l'ID esista e che il soggetto sia coerente.
- Repo condiviso: la cartella `app/` è dell'app consumer — non toccare `gestionale/`, `cameriere/`, `spot/`, `staff/`, `web/` (altri stream di lavoro).

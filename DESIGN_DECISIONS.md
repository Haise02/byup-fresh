# Byup — Design Decisions

Riferimento per ogni nuova schermata. Le decisioni qui sono **vincolanti**: quando una pagina diverge, va corretta o motivata in commit message.

Standard di riferimento: Linear, Stripe Dashboard, Notion.

---

## Palette

Token sorgente: `onboarding-icons.jsx` (oggetto `ONB`). Usare i nomi semantici, mai i legacy (`PINK`, `PURPLE`, …).

### Brand & Action

| Ruolo | Token | Valore | Uso |
|---|---|---|---|
| Brand signature | `BRAND` | `#FF5A5F` | Logo, una sola CTA primaria per schermata, indicatori stato attivo |
| Action primary | `ACTION_PRIMARY` | `#FF5A5F` | Pulsante filled principale |
| Action primary hover | `ACTION_PRIMARY_HOVER` | `#F04A4F` | |
| Action secondary | `ACTION_SECONDARY` | `#1F2229` | Pulsante filled scuro (es. "Importa") |
| Brand soft | `BRAND_SOFT` | `#FFE0DD` | Pill badge stato attivo |
| Brand tint | `BRAND_TINT` | `#FFF5F4` | Background di sezione (raro) |

### AI (separato dal brand)

| Token | Valore | Uso |
|---|---|---|
| `AI` | `#7C3AED` | Indicatori "AI-assisted" — confidence, suggerimento |
| `AI_SOFT` | `#EDE9FE` | Background pill confidence |
| `AI_TINT` | `#F5F3FF` | Sezioni AI-features |

L'AI **non** si segnala con sparkle e gradienti. Si segnala mostrando i risultati (lista piatti estratti, confidence score). Se proprio serve un visual cue, badge testuale piccolo.

### Testo & superfici

| Token | Valore | Uso |
|---|---|---|
| `TEXT` | `#1A1D24` | Headline, body principale |
| `MUTED` | `#6B6B6B` | Body secondario, helper |
| `MUTED_LIGHT` | `#9A9A9A` | Placeholder, disabled |
| `BG_SOFT` | `#FAFBFC` | Canvas pagina (mai `#fff` puro) |
| `BG` | `#F7F8FA` | Surface secondaria (input compact, info box) |
| Card surface | `#FFFFFF` | Card su canvas off-white |
| Border default | `rgba(15, 17, 21, 0.08)` | Border 1px standard |
| `BORDER_SOFT` | `#EFF1F4` | Divider interno card |

### Semantic

| Token | Valore | Uso |
|---|---|---|
| `GREEN` | `#16A34A` | Stato success, connessione attiva |
| `GREEN_SOFT` | `#DCFCE7` | Pill success |
| `AMBER` | `#D97706` | Warning, "da rivedere" |
| `AMBER_SOFT` | `#FEF3C7` | Pill warning |
| `RED` | `#DC2626` | Error |

**Mai usare:**
- `#FFFFFF` puro come canvas pagina
- gradiente decorativo viola↔rosa (`linear-gradient(135deg, #7C3AED, #FF5A5F)` o conic equivalente)
- shadow colorato con tinta brand (`rgba(255, 90, 95, 0.3)` glow)

---

## Tipografia

Family: **Plus Jakarta Sans** (UI). `Instrument Serif` riservato a casi editoriali rari, non usato negli onboarding flows.

### Scala (px)

```
12  — caption, label uppercase, helper text
14  — body small, secondary copy
16  — body, input value, button label
20  — subtitle, card title
24  — section title
32  — page title
40  — hero (max una per pagina)
```

Niente valori intermedi (13, 15, 17, 18, 19…) salvo eccezione documentata.

### Pesi

- `400` regular — body
- `500` medium — labels, secondary buttons, body emphasized
- `600` semibold — headline, primary button, key copy

**Mai `700` su body**. **Mai `800` da nessuna parte**. Linear usa 590, Stripe 600 — più di così è urlato.

### Line-height

- `1.2` — headline (≥24 px)
- `1.4` — body, UI text
- `1.0` — numeri tabulari grandi (stat value)

### Letter-spacing

- `-0.02em` — headline ≥24 px
- `0` — body
- `+0.04em` — label uppercase 12 px (l'unico caso che richiede spacing)

---

## Spacing

Base 4 px. Solo questi valori: **4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64**.

Padding card: **24** (default) o **20** (compact list rows). Mai 32 (troppo arioso) né 12 (claustrofobico).

Gap fra card consecutive: **16**.
Gap orizzontale fra colonne: **24**.
Margini sezione: **40** o **64** (separazione macroscopica).

---

## Border radius

| Livello | Radius | Esempio |
|---|---|---|
| Frame outer / modal shell | `12 px` | `.frame`, modal |
| Card | `10 px` | Card sezione, integration card |
| Input, button, surface | `8 px` | Input, button, mini surface |
| Tag, chip piccolo | `6 px` | Allergen tag |
| Pill, badge, avatar | `999 px` | Status pill, avatar |

Una sola scala per tutto il prodotto. Niente 7, 9, 11, 13, 14, 16, 20.

---

## Shadow

Due livelli, nessun colore.

```css
/* resting — applicato a card, input, button secondario */
box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);

/* elevated — modal, dropdown aperto, hover su CTA primary */
box-shadow: 0 8px 24px rgba(15, 17, 21, 0.08);
```

Mai shadow tinted (`rgba(brand, …)`). Mai più di 2 livelli.

---

## Componenti

### Input
- Height **44 px**
- Padding orizzontale **14 px**
- Border `1px solid rgba(15, 17, 21, 0.12)` sempre visibile
- Focus border `1.5px solid BRAND`, no outer ring colorato
- Background bianco
- Font 16 px / weight 400

### Button
- Height **44 px** (primary/secondary), **36 px** (compact tertiary)
- Padding orizzontale **20 px** minimo
- Font 14 px / weight 600
- Border-radius 8 px

### Pill / badge
- Height auto, padding `4 px 10 px`
- Font 12 px / weight 500
- Border-radius 999 px

---

## Animazione

Solo CSS. Nessuna libreria.

| Tipo | Duration | Easing |
|---|---|---|
| Micro (hover, focus, ghost state) | 150 ms | `ease-out` |
| Panel open / dropdown | 250 ms | `ease-out` |
| Panel close | 200 ms | `ease-in` |
| Page transition | 300 ms | `ease-out` |

**Mai**: bounce, elastic, overshoot, scale "pop" su click, pulse a riposo, spin per attirare attenzione.

Spinner ammessi solo per stato di caricamento reale (es. attesa risposta API). Lineari, sobri (1px stroke, 0.8s rotation).

---

## Anti-pattern vietati

- emoji in headline, label, button (`🗑 ✨ 🎉 🔒`)
- copy "AI-powered", "Smart", "Intelligent", "Magic", "Quasi fatto!"
- progress bar con messaggio motivazionale a fianco
- avatar generato con iniziali colorate random
- gradiente decorativo (viola→rosa, blu→verde, qualsiasi)
- ombra tinted (`rgba(brand, 0.3)`)
- `fontWeight: 800`
- pulsante CTA con icona sparkle
- card con padding 32+ su contenuto denso
- più di una shadow level per layout
- bordo solido pesante (`#E5E7EB` opaco) su superficie bianca quando un `rgba(0,0,0,0.08)` è uguale di lettura

---

## Room accents (Step 3 — Sale)

Palette di 5 tinte cycling per identificare visivamente sale consecutive. Definita in `ONB.ROOM_ACCENTS` come array di `{name, fg, soft}`. NON include BRAND (riservato CTA) né AI (riservato AI-features). Saturazione moderata, derivata da palette cucina/sala (Coral/Sage/Wine/Saffron/Slate).

```js
ROOM_ACCENTS = [
  {name: 'Coral',   fg: '#E37161', soft: '#FFF1ED'},
  {name: 'Sage',    fg: '#5B8270', soft: '#EAF1EC'},
  {name: 'Wine',    fg: '#944D5E', soft: '#FBEDF0'},
  {name: 'Saffron', fg: '#C7882B', soft: '#FCF3DF'},
  {name: 'Slate',   fg: '#4A5568', soft: '#EEF0F3'},
]
```

L'accent va usato come left-border 4px sulla card sala + dot 8px nell'header + colore counter + colore dei table dots numerati. Non è un brand secondary: è un device di **identificazione**, non di brand.

---

## Animazioni autorizzate eccezionalmente

La regola di base è "no bounce/elastic/scale-pop". Le seguenti eccezioni sono autorizzate **solo in contesti specifici** e ognuna è motivata. Non estendere senza aggiornare questo documento.

### Counter bump (Step 3)
Scale 1 → 1.15 → 1 in 150ms ease-out, al cambio valore del counter tavoli. Comunica feedback dell'incremento/decremento al fianco di un valore numerico — sostituisce la mancanza di animazione contestuale del number input nativo.

### Checklist micro-bounce (Step 4)
Scale 0 → 1.2 → 1 in 380ms, stagger 150ms × item. Animazione di **arrivo celebrativo** della checklist di completamento. Eccezione legittimata dal momento (thank-you page): segna che il setup è andato a buon fine. Non si riproduce mai a riposo, non è loop, scatta solo al mount.

### WOW processing overlay (Step 1)
Sequenza in 4 fasi (explode 800ms / pulse 2200ms / reveal stagger 350ms × 5 / morph 700ms). Eccezione massima: questo è il momento "magia" del prodotto — l'AI elabora il menù del ristoratore e lo restituisce strutturato. Il design celebra la trasformazione invece di nasconderla.
Componenti ammessi solo qui: canvas particle field, orb radial-gradient + box-shadow multi-layer, ripple rings infinite (limitati a questa sequenza), morph orb→checkmark.
NON è un pattern riusabile: nessun altro overlay del prodotto può richiamare questa intensità.

### Confetti (Step 4)
Canvas 50 particelle, gravità + drift + rotazione, fade-out negli ultimi 600ms, durata 3s **one-shot non-loop**. Stesso ragionamento del checklist micro-bounce: vale solo per la thank-you page, non si ripete su navigation back. Colori brand + green + amber + AI + 2 ROOM_ACCENTS.

### Phone preview auto-scroll (Step 4)
Translate Y 0 → -50% in 25s linear infinite, pause-on-hover. Lineare e lentissimo: comunica "anteprima viva" senza distrarre dal contenuto principale. Non è un'animazione di attenzione — è un display.

---

## Banner system

Il `ProcessingBanner` (Step 2/3/4) è uno striscione persistente sotto l'header che comunica un'attività di background (l'AI sta rifinendo il menù).

- Altezza 36 px, background `BRAND_TINT`
- Dot 7 px BRAND con pulse opacity 0.4↔1 in 1.5s ease-in-out infinite (si ferma a `completing`)
- Copy: 13 px / weight 500 / color `BRAND_DARK` — `'Il tuo menù personalizzato è in elaborazione...'` o `'Il tuo menù è pronto'` quando `completing`
- Percentuale a destra del copy: 12 px / weight 600 / `tabular-nums` / opacity 0.7
- Progress bar absolute bottom 2 px: track `rgba(255, 90, 95, 0.12)` + fill BRAND. Width `${progress}%`, transition `200ms linear` durante la crescita auto, `500ms ease-out` durante il completion 90→100
- Crescita automatica: 0 → 90 % in **180 s** (0.05 % × 100 ms tick = 0.5 %/s). Si ferma a 90.
- Completamento: 90 → 100 % triggerato da `completeBannerThen()` quando l'utente clicca un CTA finale di Step 4. Dopo 600 ms il banner viene smontato (setHidden) e arriva il redirect.
- State posseduto da `OnboardingApp` (non dal banner stesso) così Step 4 può triggerarne il completamento.

Pattern riutilizzabile per altri "background-jobs" futuri (es. import in corso, sync esterna). Limite: massimo un banner alla volta.

---

## ProcessingOverlay (Step 1 → Step 2 transition)

Modale full-screen sopra Step 1 quando l'utente clicca "Analizza il menù". Sostituisce qualunque "WOW" particle / orb pulsante: il momento WOW vero è il banner con la barra che parte e accompagna l'utente per 3 minuti, non l'overlay 3 secondi.

- Backdrop `rgba(15, 17, 21, 0.55)` + `backdrop-filter: blur(6px)`
- Card 460 px bianca, padding 32, radius 12, shadow `0 8px 24px rgba(15,17,21,0.08)`
- Header: AILoader (ring 1.5px che ruota + dot 4px BRAND che orbita reverse) + titolo `Stiamo analizzando il tuo menù` con typewriter dei `.` `..` `...` che cambia ogni 400 ms (stato 0–3 ciclato)
- Progress bar 2 px `TEXT` fill + shimmer overlay: gradient bianco 40 % che scorre in 1.6 s ease-in-out infinite — comunica "elaborazione viva" senza loader rotante prominente
- Lista task: completati con check `GREEN` 14 px + label MUTED 13/400, corrente con dot dashed `rgba(15,17,21,0.24)` 14 px + label TEXT 13/500
- Stato finale (`finished` quando `doneCount >= 7`): loader sostituito da `DoneCheck` (cerchio GREEN 18×18 con check, scale-in 320 ms ease-out), titolo cambia in `Ci siamo quasi`, hold 800 ms, poi `onComplete()`

Il "tocco AI giocoso" è confinato a due micro-elementi: il dot orbitale BRAND + i typewriter dots. Niente sparkle, niente conic gradient, niente particle field.

Copy choice — `Ci siamo quasi` e non `Tutto pronto`/`Menù pronto`: il completamento vero della pipeline AI avviene poi nel banner persistente; questo overlay è solo un bridge da Step 1 a Step 2.

---

## Step-stage entrance

Ogni step monta con una transizione di entrata leggera: opacity 0→1 + scale 0.985→1 in 320ms ease-out. Implementata via `key={step}` sul wrapper `.step-stage` in `OnboardingApp` — il remount React fa partire automaticamente la CSS animation. Risolve il "scale-up leggero del contenuto sottostante" richiesto al termine del processing overlay senza richiedere logica di transition esplicita.

---

## Logo

File asset corrente: `fresh.png` (lowercase, server-safe). Esposto via `OnbIcon.Logo` e `PnI.Logo`, parametrato con `fontSize` (onboarding) o `size` (panoramica). Sostituisce ovunque il vecchio brand-mark inline (quadrato BRAND con "b" + scritta "byup") che era una costruzione live e non il marchio reale.

---

## Layout shell del gestionale

Tutte le pagine `byup *.html` del gestionale (escluse Login e Restaurant Onboarding) condividono lo stesso shell:

```css
.frame {
  width: 1440px;
  height: calc(100vh - 48px);   /* fits within viewport */
  min-height: 720px;             /* laptop 13" minimum */
  max-height: 900px;             /* monitor desktop normale */
  margin: 24px auto;
  display: flex;                 /* sidebar | main */
}
```

**Vincolo**: la sidebar deve essere sempre visibile. Solo il `<main>` interno (con `.pn-scroll`) scorre.
La `<aside>` ha `height: 100%` (via flex stretch). La sua lista nav ha `flex: 1; min-height: 0; overflow-y: auto` — su altezze ridotte la lista può scorrere internamente, ma logo, plan card, sys actions e profilo restano sempre visibili.

`min-height: 0` è cruciale: senza, il default `min-height: auto` di un flex item blocca lo scroll interno e il contenuto deborda dal frame `overflow: hidden`.

**Eccezione**: Contabilita.html e Contabilita v2.html usano già un pattern responsive `width: min(1440px, calc(100vw - 32px)); height: min(900px, calc(100vh - 32px))` — coerente, lasciato così.

---

## Liquid glass — quando usarlo

Pattern Apple-style: superficie semitrasparente + `backdrop-filter: blur` + saturate. Da usare con parsimonia.

**Ammesso solo su**:
1. Floating element sopra contenuto (banner onboarding, popover, dropdown)
2. Sticky preview che si sovrappone allo scroll (es. anteprima vetrina)
3. Modal backdrop overlay

**NON usare su**:
- Card di sezione standard (restano flat con shadow soft + bg #fff)
- Sidebar (resta solid background per leggibilità nav)
- Pagina canvas o body
- Tutto ciò che non si sovrappone visivamente a contenuto sotto

Token base in `panoramica-tokens.jsx`:

```js
PN.GLASS_LIGHT  → rgba(255, 255, 255, 0.78) + blur(14px) saturate(160%)
PN.GLASS_STRONG → rgba(255, 255, 255, 0.82) + blur(20px) saturate(180%)
```

Uso:
```jsx
<div style={{...PN.GLASS_LIGHT, borderRadius: 14, padding: 16}}>
```

Border + shadow inclusi nel token. NON aggiungere blur senza testare leggibilità del testo retrostante: se il backdrop ha contenuto denso (es. card grafici), il glass non funziona.

**Test pratico**: prima di applicare glass, schiaffa il blur su uno screenshot del contesto reale e leggi il testo a 30 cm di distanza. Se devi sforzarti, il glass è troppo aggressivo o il bg sotto è troppo denso.

---

# Design System 2.0 — Apple-inspired layer

Il design system v1 era già pulito (Linear/Stripe/Notion). La v2 lo evolve **senza riscriverlo**, applicando un layer Apple-vibrancy macOS Sonoma sopra le primitive esistenti. Il principio: il sistema si riconosce dai dettagli — gradient sottili, hairline borders, inset highlights, glass dove ha effetto reale.

## Cosa è cambiato rispetto alla v1

La v1 aveva il difetto del "bianco-su-bianco piatto" — un button ghost (background `#FFF`) su una card (background `#FFF`) si distingueva solo dal border solido `#E5E7EB`. Funzionale ma anonimo: visivamente identico al 90% dei SaaS B2B.

La v2 risolve così:
1. **White shades** — 4 livelli di bianco invece di 1 (`WHITE` → `WHITE_OFF` → `WHITE_HUSH` → `WHITE_FROST`). Permettono separazione visiva senza border pesante.
2. **CTA gradient** — i button non sono mai background piatto. Hanno un gradient sottile dall'alto al basso (es. `#FFFFFF → #F5F5F7`), un inset highlight bianco di 1px, e un border in alpha (`rgba(0,0,0,0.10)`) invece di un grigio solido.
3. **Border alpha hairline** — sostituisce `#E5E7EB` con `rgba(15, 17, 21, 0.06–0.10)` su superfici delicate. Il border si "appoggia" sul bg invece di bloccarlo.
4. **Vibrancy** — sidebar e top-bar usano gradient verticale + glass leggero, ricreando il vibe Apple senza imitarlo letteralmente.

## Token aggiunti (`panoramica-tokens.jsx`)

### White shades

```js
WHITE:       '#FFFFFF'  // bianco puro, riservato a header card primari
WHITE_OFF:   '#FAFBFC'  // canvas off-white, bg pagine
WHITE_HUSH:  '#F5F5F7'  // Apple light, surface secondaria + bottom button gradient
WHITE_FROST: '#EFEFF1'  // separatori, tracks progress, button hover
```

### Border alpha levels (5 livelli)

```js
BORDER_GHOST:  rgba(15, 17, 21, 0.04)  // hair line — separatori interni di card
BORDER_HAIR:   rgba(15, 17, 21, 0.06)  // border default cards e header
BORDER_SOFT_A: rgba(15, 17, 21, 0.08)  // border button neutral, dropdown
BORDER_LIGHT:  rgba(15, 17, 21, 0.10)  // input border, button con focus
BORDER_MED:    rgba(15, 17, 21, 0.16)  // dropzone dashed, attivi
```

### CTA gradient (3 famiglie × 3 stati)

```js
BTN_NEUTRAL       = linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)
BTN_NEUTRAL_HOVER = linear-gradient(180deg, #F8F9FB 0%, #EFEFF1 100%)
BTN_NEUTRAL_PRESS = linear-gradient(180deg, #EFEFF1 0%, #F5F5F7 100%)

BTN_BRAND         = linear-gradient(180deg, #FF6A6F 0%, #FF5A5F 100%)
BTN_BRAND_HOVER   = linear-gradient(180deg, #FF6E73 0%, #F04A4F 100%)
BTN_BRAND_PRESS   = linear-gradient(180deg, #E04347 0%, #D63A3F 100%)

BTN_DARK          = linear-gradient(180deg, #2A2D36 0%, #15171C 100%)
BTN_DARK_HOVER    = linear-gradient(180deg, #353841 0%, #1F2229 100%)
```

Eccezione esplicita alla regola "no gradient decorativi": un gradient di una sola famiglia di tonalità (es. due red shades vicini) NON è decorazione — è il "lensing" macOS button. Continua a essere vietato il gradient bicolore (rosa→viola, blu→verde, ecc.).

### Inset highlights — il "riflesso vetroso"

```js
INSET_HIGHLIGHT       = inset 0 1px 0 rgba(255, 255, 255, 0.65)  // su button neutral
INSET_HIGHLIGHT_BRAND = inset 0 1px 0 rgba(255, 255, 255, 0.30)  // su button BRAND
INSET_HIGHLIGHT_DARK  = inset 0 1px 0 rgba(255, 255, 255, 0.10)  // su button dark
```

Una linea bianca di 1px nella riga superiore dell'elemento — simula la luce ambientale che colpisce una superficie convessa. È la firma macOS Big Sur/Sonoma.

### Glass varianti (4 — non più 2)

```js
GLASS_LIGHT   → blur(14px) sat(160%) bg 0.78  — anteprime sticky, card floating
GLASS_STRONG  → blur(20px) sat(180%) bg 0.82  — modali, popover heavy
GLASS_VIBRANT → gradient #FAFBFC→#F5F5F7      — sidebar (no blur perché niente sotto)
GLASS_BAR     → blur(18px) sat(160%) bg 0.72  — top header sticky
GLASS_MENU    → blur(24px) sat(180%) bg 0.85  — dropdown menu Apple Sonoma
```

`GLASS_VIBRANT` è una "fake glass": niente blur perché la sidebar non si sovrappone a contenuto sottostante (sta a fianco del main). Il gradient verticale ricrea visualmente l'effetto vibrancy senza spreco di risorse.

## Dove ho applicato il sistema 2.0

### `panoramica-sidebar.jsx`
Spread `...PN.GLASS_VIBRANT` sull'`<aside>`. La sidebar ora ha un gradient verticale `#FAFBFC → #F5F5F7` con border-right `rgba(0,0,0,0.06)` invece del solid `#E5E7EB`. Lista nav interna ha `min-height: 0; overflow-y: auto` per garantire che contenuto eccedente scrolli senza spingere via logo/profilo (vedi sezione "Layout shell").

### `panoramica-notif-bell.jsx`
Dropdown notifiche ora usa `...PN.GLASS_MENU` — `blur(24px) saturate(180%)` su `rgba(255,255,255,0.85)` con border + shadow. Il dropdown letteralmente sospende sopra la pagina con vibrancy reale: si vede il main attraverso, leggermente sfumato, come un menu Sonoma.

### `impostazioni-shared.jsx`
- `ImpWithPreview` aside ora spread `...PN.GLASS_LIGHT` (era inline raw rgba). Coerenza con il sistema.
- `ImpButton` riscritto con gradient sottile + inset highlight per tutte le 4 varianti (primary/pink/ghost/text). Niente più `background: PN.TEXT` flat o `background: PN.WHITE` bianco-su-bianco.
- `PublishButton` (nuovo) — sopra il phone preview vetrina. Apple-style: gradient brand/neutral sfumato, hover state, disabled state con sfumatura `#FFF→#F5F5F7` (NON puro bianco). Sostituisce `ImpSaveBar` (rimossa: l'azione di pubblicazione vive accanto all'oggetto modificato).

### `config-completa-app.jsx`
- Header bg da `#fff` a `WHITE_OFF` (`#FAFBFC`), border-bottom hairline `BORDER_HAIR`. Headline da weight 800 a 600 con letter-spacing tighter. Eyebrow chip ora coerente coi pattern onboarding (BRAND_TINT con dot).
- Stepper bg coerente col header (off-white).
- `FooterBar` riscritto con nuovo componente `ApBtn` (3 varianti: neutral / dark / brand) — l'ImpButton equivalent locale di questa pagina.
- Pulsante "Salta e vai alla Panoramica" trasformato in Apple neutral: gradient sottile + inset highlight + border alpha. Hover su gradient hover. Niente più border solido `PN.BORDER`.

## Principi (regole d'uso del sistema 2.0)

1. **Mai bianco-su-bianco piatto.** Se un elemento bianco è dentro un contenitore bianco, usa `WHITE_OFF` o `WHITE_HUSH` per dare sfumatura. Oppure usa il gradient `BTN_NEUTRAL`. Mai entrambi `#FFF`.

2. **Mai border solido `#E5E7EB`** su superficie bianca quando un `BORDER_HAIR` (rgba 0.06) o `BORDER_LIGHT` (rgba 0.10) ha la stessa leggibilità. Il rgba si appoggia, il solido blocca.

3. **Mai un button con bg piatto.** Sempre uno dei `BTN_*` gradient. L'esistenza del gradient (anche minimo, `#FFF → #F5F5F7`) è la differenza fra "button SaaS qualsiasi" e "button del nostro sistema".

4. **Glass solo dove c'è qualcosa sotto.** Sidebar (vibrant senza blur), dropdown (blur reale), sticky preview (blur reale). NON per card di sezione, NON per page canvas, NON per top header che non scrolla.

5. **Inset highlight su tutto ciò che ha un gradient.** È la firma macOS. Senza inset highlight, il gradient sembra solo "due colori" — con, sembra una superficie convessa colpita dalla luce.

## Cosa NON ho cambiato (e perché)

- **Card di sezione standard** (OnbCard, Card3, ecc.) — restano flat con shadow soft + border hair. Una card con glass sarebbe rumore: la card è il "foglio" su cui sta il contenuto, non un floating element.
- **Page canvas** (BG `#F5F6F8`) — invariato. Il canvas è la base; bg con effetti rovinerebbe la lettura.
- **Form inputs** — restano border `BORDER_LIGHT` solid+focus BRAND. Il pattern onboarding è già coerente.
- **Tipografia** — la scala 12/14/16/20/24/32/40 e i weight 400/500/600 invariati. Apple usa weight 590 (SF Pro Display semibold) — il nostro 600 è la replica esatta in Plus Jakarta Sans.

## Prossimi passi possibili (non fatti in questa iterazione)

- `panoramica-app.jsx` e `panoramica-grid.jsx` — applicare ApBtn agli action buttons rimasti.
- `byup Profilo.html`, `byup Account.html` — top header con `GLASS_BAR` sticky.
- `cucina-app.jsx`, `sala-v3-app.jsx` — sostituire i bottoni colorati con le varianti BTN_* gradient.
- Modali esistenti (es. `sala-modali.jsx`, `staff-modali.jsx`, `supporto-modals.jsx`) — backdrop con `GLASS_STRONG`.
- `byup Statistiche.html` — chart cards con border `BORDER_HAIR` + bg `WHITE` invece di solid.

L'applicazione del 2.0 al gestionale è **graduale per disegno**: la base è già pronta nei token, e ogni schermata può essere upgradata indipendentemente.

---

# Design System 2.1 — Glass "ice" + rollout globale

Iterazione di feedback: l'utente non vedeva applicato il glass che avevamo definito. La 2.1 abbassa la trasparenza dei token glass (più "ice", più solido), aggiunge varianti per hover panels e drag preview, e applica il sistema agli **elementi shared** del gestionale (page header, tabs, buttons, modal, sheet) — l'aggiornamento si propaga in cascata a tutte le pagine.

## Cosa è cambiato rispetto alla 2.0

**Trasparenza ridotta** in tutti i token glass: da 0.78 a 0.86–0.92. Il blur è più "ice/frosted" e meno "vetro liquido" — leggibilità migliore, vibe Sonoma più solido.

**Saturazione alzata** da 160% a 180–200%. Il glass diventa "frosty cold" invece di "neutro semi-trasparente", coerente col vibe macOS.

**Due nuovi token glass**:

```js
GLASS_HOVER → blur(24px) saturate(190%) bg 0.94  — dropdown contestuali, popover hover
GLASS_DRAG  → blur(16px) saturate(160%) bg 0.72  — card draggata in dashboard edit mode
```

`GLASS_HOVER` è il più solido (0.94) — un dropdown deve leggersi al volo, non c'è tempo per "decifrare" il bg sotto.
`GLASS_DRAG` è il più trasparente (0.72) — la card draggata è "ghost", deve far vedere ciò che sta sotto perché lì verrà rilasciata.

## Dove è stato applicato (rollout 2.1)

### File shared del gestionale → aggiornamento in cascata

**`app-page-shell.jsx`** è il centro di gravità di Sala, Cucina, Account, Profilo, Statistiche, Contabilita, Supporto. Ogni cambio qui propaga a tutte le pagine:

- `PnPageHeader` → bg `WHITE_OFF` + border `BORDER_HAIR`, headline da weight 700 a 600 con letter-spacing tighter (-0.02em)
- `PnUnderlineTabs` → bg `WHITE_OFF`, border hairline, tab attiva weight 600
- `PnModal` → backdrop con `blur(8px)` su rgba 0.42, container spread `...PN.GLASS_STRONG`, footer `WHITE_HUSH`
- `PnSheet` → stesso pattern del modal su drawer right
- `PnButton` → 5 varianti (primary/secondary/ghost/danger/pink) ognuna con gradient + inset highlight + border alpha + hover state. Sostituisce i background piatti.

**`panoramica-grid.jsx`** — drag system completamente refattorato:

- Card draggata segue il mouse via `transform: translate(${offset})` reale (no più jump a metà cella)
- Apply `...PN.GLASS_DRAG` quando `dragging=true` + `transform: scale(1.03)` per il "lift"
- Le altre card durante il drag scalano a `0.985` + opacity `0.92` con `cubic-bezier(0.32, 0.72, 0, 1)` — pattern Apple "edit mode" iOS dove le icone "tremolano e perdono peso"
- `transition: 280ms cubic-bezier` per lo spring delle card non in drag
- `pointer-events: none` sulla card draggata → l'hit-test trova le card sotto

**`panoramica-notif-bell.jsx`** — dropdown con `...PN.GLASS_MENU` aggiornato (blur 28px sat 200% bg 0.92).

**`impostazioni-shared.jsx`** — `ImpButton` riscritto Apple-style. `ImpWithPreview` aside con `...PN.GLASS_LIGHT`. `PublishButton` sopra phone preview.

**`panoramica-sidebar.jsx`** — `...PN.GLASS_VIBRANT` (gradient verticale).

### Plan card laterale (sidebar)

`panoramica-plan-card.jsx` ridisegnato con UX/UI review:

- Rimosso "18g al rinnovo" e "1420 di 1850 ordini · ne restano 430" dal layout principale
- Hover sulla barra → tooltip dark con il breakdown completo (cassa × 1, app × 0,5, totale, residui, risparmio app)
- Halo `box-shadow: 0 0 0 2px ${fillColor}33` sulla barra in hover (effetto "alone" pulsante)
- CTA "Passa a Plus" → "Ottienilo ora" su hover, con cambio colore (BRAND → BRAND_PRESS) e arrow translate +2px
- Border passato a `BORDER_HAIR`, shadow doppia coerente col sistema

### Dashboard layout default

`panoramica-app.jsx` — layout default cambia: prima riga ora ha 4 widget visibili (incassi, kpi-vendita, riempimento RIDOTTO da 4×2 a 2×2, prenotazioni-oggi). Il widget Riempimento perde l'espansione full-row per fare spazio al widget Prenotazioni "above the fold".

### Impostazioni → Menu

`impostazioni-menu-cucina.jsx`:

- Pulsante "⚙ Impostazioni menù" → icon-only 36×36 con SVG gear, no copy, no gradient
- Switch Menù/Libreria → segmented control Apple-style con pillola che SCORRE fra le 2 posizioni (`transition left 280ms cubic-bezier(0.32, 0.72, 0, 1)`), track con inset shadow soft
- "Carica menu (PDF / foto)" → `AiUploadCta` custom: gradient brand soft `#FFF5F4 → #FFE7E4`, sparkle BRAND pulsante (scale 1↔1.12 + rotate ±8deg ogni 2.2s), shimmer permanente bianco che attraversa il button ogni 3.4s, hover lift `translateY(-2px)` + gradient più saturo
- Emoji icon (`🔍`, `📋`, `🗑`) sostituite con `<PnI.Search/>`, `<PnI.Copy/>`, `<PnI.Trash/>` SVG inline

### Vetrina

`impostazioni-vetrina.jsx`:

- Pulsante "Pubblica vetrina" rimosso dal banner "Vetrina pronta al X%"
- L'azione di pubblicazione vive ora solo nel `PublishButton` sopra il phone preview
- Banner di completamento resta solo come progress info, niente più CTA

### Statistiche & Supporto

- `stat-staff.jsx` → rimossa CTA "Premia con bonus" dal top-performer insight
- `supporto-app.jsx` → header "Supporto tecnico" → "Supporto"

### Emoji → SVG inline

- `panoramica-icons.jsx` → aggiunte `Trash`, `Copy`
- `cucina-tab-insala.jsx` → `⚠` su badge allergia → `<PnI.Alert/>`
- `sala-v3-card.jsx` → `⚠ ALLERGIA` → `<PnI.Alert/>` con copy
- `impostazioni-menu-cucina.jsx` → 5 emoji sostituite con SVG icons
- File mobile (`menu.jsx`) **lasciato invariato** — out of scope (consumer app, non gestionale)

## Cosa NON è stato fatto in questa iterazione (e perché)

**Onde grafici animate lentamente** — richiederebbe modifiche a `panoramica-widgets.jsx` (483+ linee con N widget custom, ognuno con il suo SVG chart). Il rollout shared è prioritario perché copre tutte le pagine; i widget restano in coda per una iterazione dedicata.

**Sala & Prenotazioni / Cucina redesign visivo profondo** — i file (`sala-v3-tab-tavoli.jsx`, `cucina-tab-insala.jsx`) sono molto grandi (1500+ linee ognuno). L'aggiornamento dello shell `app-page-shell.jsx` aggiorna automaticamente l'header, le tabs, i buttons, i modal e i sheet di queste pagine — il "65% del look" cambia gratis. Il restante 35% (cards interne, mappa tavoli, ordini cucina) richiederebbe una sessione dedicata per non rompere logiche operative.

**Restyle completo emoji globalmente** — copertura ~70%. Restano emoji in: contabilita-costi, extras (web app), onboarding-step3-review (deprecato non caricato). Nessuna è in un file gestionale principale dopo questa iterazione.

## Prossimi passi naturali

- Riscrittura widget grafici con SVG path animato lentamente (3–6s loop) → `panoramica-widgets.jsx`
- Toolbar Sala v3 con `WHITE_OFF` + `BORDER_HAIR`
- Restyle Stato tavoli con accent colors per stato (libero/occupato/prenotato) coordinati a `ROOM_ACCENTS`
- Glass su statistiche chart container (sticky filter bar quando si scrolla la dashboard)

---

## Anti-AI-slop check (Maggio 2026)

Pattern AI comuni evitati attivamente in questa iterazione:

| Pattern | Perché è AI-slop | Cosa ho fatto |
|---|---|---|
| Conic gradient pink→purple "AI orb" | Cliché AI signature, l'avete tutti visto su 100 SaaS | Sostituito con orb radial-gradient brand monocromo + box-shadow multi-layer non gradient |
| Loader circolare con percentuale | Pattern Microsoft Office anni 2000 | Progress espresso da fasi narrate (esplosione → pulse → reveal categorie) |
| Toast "🎉 Configurazione completata!" | Esclamativo + emoji = celebrazione automatizzata | "Il tuo locale è su Byup." con punto fermo, confetti esprime la festa visualmente non testualmente |
| Card con shadow `rgba(brand, 0.3)` | Glow tinted brand è AI-slop | Solo neutral shadow `rgba(15,17,21, 0.04 / 0.08)` |
| Avatar testimonial con iniziali random | Generato senza fonte | Rimosso. Trust signal → social proof testuale neutro o rimosso |
| Bullet di feature con icona sparkle | "Powered by AI" decoration | Sparkle solo dove l'AI è il soggetto reale (processing overlay), e anche lì ridotto al minimo |
| `fontWeight: 800` su titoli | "Heavy modern" cliché | Max 600 ovunque |
| Border radius 16/20/24 random | Soft-everything-feel AI | Scala fissa 12/10/8/6/999 |
| Dropzone con tinta rosa al drag | Color flash di attenzione | Solo border colore che si scurisce, no fill colorato |
| Stage controls / debug nav grande in alto | UI di tooling esposta come prodotto | Spostato in floating chip 22px bottom-right, sotto soglia attenzione |

Pattern AI esplicitamente RICHIESTI dal brief e quindi conservati intenzionalmente:
- WOW processing overlay con particle explosion + orb pulsante (Task 1) — autorizzato come momento product-hero
- Confetti thank-you (Task 6) — autorizzato come celebrazione one-shot
- Counter bump scale (Task 5) — autorizzato come microinterazione contestuale
- Bounce sequenziale checklist (Task 6) — autorizzato come arrivo celebrativo

Questi non sono cliché AI nel contesto dato: sono scelte deliberate documentate sopra, vincolate a contesti specifici, non riusabili come "decoration generica".

---

## Convenzione style inline

Il progetto usa style inline JSX. Lo manteniamo. Per i token, leggere sempre da `ONB.<NOME>` — mai hex hardcoded fuori dal file token.

```jsx
// SI
<div style={{padding: 24, borderRadius: 10, background: ONB.BG_SOFT}}/>

// NO
<div style={{padding: 24, borderRadius: 10, background: '#FAFBFC'}}/>
```

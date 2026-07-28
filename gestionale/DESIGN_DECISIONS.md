# Byup — Design Decisions

Riferimento per ogni nuova schermata. Le decisioni qui sono **vincolanti**: quando una pagina diverge, va corretta o motivata in commit message.

Standard di riferimento: Linear, Stripe Dashboard, Notion.

Ultimo allineamento al codice: 2026-07-28.

---

## Palette

Due oggetti token vivi, per contesto: `ONB` (`onboarding-icons.jsx`) per i flussi di onboarding, `PN` (`panoramica-tokens.jsx`) per tutte le pagine del gestionale (il modulo cameriere eredita da PN). Usare i nomi semantici, mai i legacy (`PINK`, `PURPLE`, …). L'oggetto `BU` (`byup-tokens.jsx`) era **legacy morto** — nessun componente lo referenziava — ed è stato **rimosso il 2026-07-28** insieme al file: non reintrodurlo. La tabella sotto documenta i token `ONB`.

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

Family: **Plus Jakarta Sans** (UI). `Instrument Serif` riservato a casi editoriali rari — oggi è caricato da due pagine (Panoramica, Configurazione Completa) ma di fatto inutilizzato nei componenti.

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

> Nota (lug 2026): nel gestionale la pratica si è allargata — 11/13/15/17 sono oggi d'uso comune (es. `PnButton` è 15 px). La scala sopra resta il riferimento per l'onboarding e per le nuove schermate.

### Pesi

Scala reale in uso (verificata sul codice, lug 2026):

- `400` regular — body (vivo nell'onboarding, ormai raro nel gestionale)
- `500` medium — labels, secondary buttons, body emphasized
- `600` semibold — button, tab attive, key copy
- `700` bold — peso dominante del gestionale: titoli, valori, righe dati (è il peso più usato in assoluto)
- `800` extrabold — enfasi numerica e dati forti nelle superfici operative (Sala, Cucina, Contabilità, modali)
- `900` — riservato: brand-mark `ByupB` e numeri identificativi grandi (numero tavolo, codice ritiro)

**Mai `700`/`800` su body copy.** La regola storica "mai 700, mai 800 da nessuna parte" (rationale: Linear usa 590, Stripe 600 — più di così è urlato) resta valida solo per i flussi di onboarding, che sono ancora su 400/500/600. Gli HTML del gestionale caricano Plus Jakarta Sans `400;500;600;700;800`.

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
| Frame outer | `16 px` | `.frame` delle pagine gestionale |
| Modal / pannelli glass | `14 px` | `PnModal`, `GLASS_HOVER` (sheet bottom: `22 px` in cima) |
| Card | `10 px` | Card sezione, integration card |
| Input, button, surface | `8 px` | Input, button, mini surface (`PnButton` usa 9 px) |
| Tag, chip piccolo | `6 px` | Allergen tag |
| Pill, badge, avatar | `999 px` | Status pill, avatar |

Una sola scala per tutto il prodotto: fuori dai casi in tabella, niente valori estemporanei.

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
- `fontWeight: 800` su body copy o testo corrente (come enfasi numerica/dati è ammesso — vedi Pesi)
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

> Stato lug 2026 — la prima versione era uno striscione persistente 36 px sotto l'header con progress bar (crescita 0→90% in 180 s, completamento via `completeBannerThen()`, state in `OnboardingApp`). Quella versione è stata rimossa: niente più progress bar né state condiviso.

Il `ProcessingBanner` attuale (`onboarding-app.jsx`) è una card flottante che annuncia l'elaborazione AI del menù:

- Posizione: bottom-left (`bottom: 32, left: 80`, allineata al padding 80 px degli step), oppure variante `inline` (maxWidth 440) dentro il flusso
- Colore: viola AI — bg `ONB.AI_TINT`, border `AI_SOFT`, testo `AI_DARK`. Non coral: nel design system il viola è riservato alle feature AI, e "AI al lavoro" è esattamente l'informazione utile. Radius 12, shadow tinted viola soft
- Badge 28 px `AI_SOFT` con `OnbIcon.Sparkle` e pulse scale 1↔1.2 / opacity 0.78↔1 in 1.8s infinite
- Copy: titolo 15/600 `'Il tuo menù è in elaborazione'` + sottotitolo 14/400 op. 0.72 `'Completa la configurazione per visualizzarlo'`
- **Niente progress bar** (richiesta esplicita): la promessa è la copy stessa
- Entrata `banner-float-in` 280ms ease-out; accessibile con `role="status" aria-live="polite"`

Limite invariato: massimo un banner alla volta.

---

## ProcessingOverlay (Step 1 → Step 2 transition)

Modale full-screen sopra Step 1 quando l'utente clicca "Analizza il menù". Sostituisce qualunque "WOW" particle / orb pulsante: il momento WOW vero è il banner con la barra che parte e accompagna l'utente per 3 minuti, non l'overlay 3 secondi.

- Backdrop `rgba(15, 17, 21, 0.55)` + `backdrop-filter: blur(6px)`
- Card 460 px "D3 Sunset Glass" (peak AI moment): gradient warm-dark `rgba(58,28,22,0.88) → rgba(30,12,10,0.92)` + `blur(22px) saturate(170%)`, doppio inset ring caldo + ombra burnt orange, radius 14, padding 32, contenuto in colorazione chiara (`#F3F4F6`)
- Hero icon `HeroComposer` (88×88): SVG che simula la "compilazione" del menù riga per riga, nodi con pulse in stagger
- Header: AILoader (ring 1.5px che ruota + dot BRAND che orbita reverse) + titolo `Stiamo ricreando il tuo menù` con typewriter dei `.` `..` `...` che cambia ogni 400 ms (stato 0–3 ciclato)
- Countdown `Pronto in: Ns` (tabular-nums), decrementa a ogni task — sostituisce la vecchia rassicurazione statica
- Progress bar 3 px: track chiaro `rgba(255,255,255,0.16)`, fill `BRAND` (diventa `GREEN` a fine) + shimmer overlay: gradient bianco 40 % che scorre in 1.6 s ease-in-out infinite — comunica "elaborazione viva" senza loader rotante prominente
- Lista task: completati con check `GREEN` 14 px + label 15/400 chiara (`rgba(255,255,255,0.62)`), corrente con dot dashed `rgba(255,255,255,0.40)` 14 px + label 15/500 `#F3F4F6`
- Stato finale (`finished` quando `doneCount >= 7`): loader sostituito da `DoneCheck` (cerchio GREEN 18×18 con check, scale-in 320 ms ease-out), titolo cambia in `Ci siamo quasi`, hold 800 ms, poi `onComplete()`

Il "tocco AI giocoso" è confinato a due micro-elementi: il dot orbitale BRAND + i typewriter dots. Niente sparkle, niente conic gradient, niente particle field.

Copy choice — `Ci siamo quasi` e non `Tutto pronto`/`Menù pronto`: il completamento vero della pipeline AI avviene poi nel banner persistente; questo overlay è solo un bridge da Step 1 a Step 2.

---

## Step-stage entrance

Ogni step monta con una transizione di entrata leggera: opacity 0→1 + scale 0.985→1 in 320ms ease-out. Implementata via `key={step}` sul wrapper `.step-stage` in `OnboardingApp` — il remount React fa partire automaticamente la CSS animation. Risolve il "scale-up leggero del contenuto sottostante" richiesto al termine del processing overlay senza richiedere logica di transition esplicita.

---

## Logo

File asset corrente: `Fresh.png` (capitalized — case-sensitive su Linux/Vercel). Esposto via `OnbIcon.Logo` e `PnI.Logo`, parametrato con `fontSize` (onboarding) o `size` (panoramica). Il solo glifo senza lettering è `Fresh-mark.png`, esposto via `PnI.LogoMark` per gli spazi stretti (sidebar chiusa); è corallo su trasparente, non va su fondo corallo. Sostituisce ovunque il vecchio brand-mark inline (quadrato BRAND con "b" + scritta "byup") che era una costruzione live e non il marchio reale.

---

## Layout shell del gestionale

Tutte le pagine `byup *.html` del gestionale (escluse Login e Restaurant Onboarding) condividono lo stesso shell:

```css
.frame {
  width: 1440px;                 /* dimensione di design fissa */
  height: 900px;
  margin: 24px auto;
  border-radius: 16px;
  display: flex;                 /* sidebar | main */
}
```

L'adattamento alla finestra non passa più da `calc(100vh)` / min-max-height: uno script a fondo pagina scala il frame con `zoom` proporzionale (`s = (innerHeight − margine) / 900`, clamp 0.4–2.2) e riallarga la `width` sui viewport stretti. Un `MutationObserver` su `#root` applica il fit appena React monta il frame (Babel compila async da CDN).

**Vincolo**: la sidebar deve essere sempre visibile. Solo il `<main>` interno (con `.pn-scroll`) scorre.
La `<aside>` ha `height: 100%` (via flex stretch). La sua lista nav ha `flex: 1; min-height: 0; overflow-y: auto` — su altezze ridotte la lista può scorrere internamente, ma logo, plan card, sys actions e profilo restano sempre visibili.

`min-height: 0` è cruciale: senza, il default `min-height: auto` di un flex item blocca lo scroll interno e il contenuto deborda dal frame `overflow: hidden`.

Non c'è più l'eccezione Contabilita: `byup Contabilita.html` usa lo stesso frame fisso 1440×900 con zoom JS (il file `Contabilita v2.html` e il vecchio pattern responsive `min()` non esistono più).

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

Token base in `panoramica-tokens.jsx` (valori correnti, iterazioni glass 2.3/2.4):

```js
PN.GLASS_LIGHT  → rgba(255, 255, 255, 0.62) + blur(40px) saturate(220%)
PN.GLASS_STRONG → rgba(255, 255, 255, 0.68) + blur(48px) saturate(240%)
```

Rispetto alle prime versioni (2.0/2.1) il glass è diventato più impattante: fill più trasparente, blur alzato a 40–48 px, saturate 220–240%, più una specular highlight verticale (`backgroundImage` bianco 45%→0) e l'inset highlight inclusi nel token. Il `GlassMeshSubstrate` di `byup-glass.jsx` fornisce la "materia" colorata dietro al glass quando il fondo è troppo uniforme.

Uso:
```jsx
<div style={{...PN.GLASS_LIGHT, borderRadius: 14, padding: 16}}>
```

Border + shadow inclusi nel token. NON aggiungere blur senza testare leggibilità del testo retrostante: se il backdrop ha contenuto denso (es. card grafici), il glass non funziona.

**Test pratico**: prima di applicare glass, schiaffa il blur su uno screenshot del contesto reale e leggi il testo a 30 cm di distanza. Se devi sforzarti, il glass è troppo aggressivo o il bg sotto è troppo denso.

---

# Design System 2.0 — Apple-inspired layer

> Sezione storica di iterazione. I valori glass citati qui e nella 2.1 sono stati poi ri-tarati dalle iterazioni 2.3/2.4: i valori vivi sono nella sezione «Liquid glass» sopra e in `panoramica-tokens.jsx` (anche `GLASS_VIBRANT` oggi ha blur reale, 24px).

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
- `PublishButton` (nuovo) — sopra il phone preview vetrina. Apple-style: gradient brand/neutral sfumato, hover state, disabled state con sfumatura `#FFF→#F5F5F7` (NON puro bianco). Sostituisce `ImpSaveBar` nel contesto con preview (l'azione di pubblicazione vive accanto all'oggetto modificato); `ImpSaveBar` resta però definita e usata dai form senza preview (es. `impostazioni-dati-fiscali.jsx`).

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

- `PnPageHeader` → bg `WHITE_OFF` + border `BORDER_HAIR`, headline da weight 700 a 600 con letter-spacing tighter (-0.02em). *(Componente poi rimosso: oggi l'header di pagina è composto direttamente nelle singole app.)*
- `PnUnderlineTabs` → bg `WHITE_OFF`, border hairline, tab attiva weight 600
- `PnModal` → backdrop con `blur(8px)` su rgba 0.42, container spread `...PN.GLASS_STRONG` (o superficie `solid` via prop), footer `WHITE_HUSH`
- `PnSheet` → *(non è più un componente separato: oggi è la prop `sheet` di `PnModal` — bottom sheet con animazione `pnSheetUp` e radius 22 in cima)*
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

*(Superato: il layout default attuale è un tiling a 4 colonne che parte da prenotazioni-oggi · tavoli-stato · cucina-live; le misure vivono nel catalogo `PN_WIDGET_CATALOG` e gli id storici — es. `kpi-vendita` — migrano via `PN_ID_MIGRATE`.)*

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
- Glass su statistiche chart container (sticky filter bar quando si scrolla la dashboard)

---

# Design System 2.2 — Rollout operativo (Sala · Cucina · Prenotazioni · Vendita diretta)

> Nota sui nomi file (lug 2026): le due pagine Sala sono state poi unificate — oggi esiste solo `byup Sala.html` e i file `sala-v3-*` citati sotto sono stati rinominati/assorbiti nei `sala-*` correnti (`sala-app`, `sala-card`, `sala-tab-tavoli`, `sala-tab-calendario`, …).

Applicazione del sistema 2.0/2.1 alle quattro superfici operative, **solo livello visivo** (nessun cambio di layout, wireframe, copy o flussi). Coperte entrambe le pagine Sala: `byup Sala v3.html` (canonica) e `byup Sala.html` (raggiunta dalla sidebar per tavoli/vendita/calendar).

## Cosa è cambiato

1. **CTA mai più piatte.** Ogni bottone primario scuro (`#0F1115` flat) è ora `BTN_DARK` gradient + inset highlight + border alpha + hover `BTN_DARK_HOVER`. I secondari bianchi (`#fff` + border `#E5E7EB`) sono `BTN_NEUTRAL` + `INSET_HIGHLIGHT` + `BORDER_LIGHT`. I danger (no-show, annulla ticket) usano il gradient rosso coordinato a `PnButton danger`. File: `sala-v3-card`, `sala-card`, `sala-v3-app`, `sala-app`, `sala-v3-tab-calendario`, `sala-tab-calendario`, `sala-tab-vendita`, `sala-vendita-diretta`, `cucina-tab-insala`.
2. **Tile mappa tavoli con volume.** Le tile flat hanno ora specular highlight verticale (`linear-gradient` bianco 55%→0) + ombra resting `0 1px 2px` + inset top — leggono come oggetti fisici sulla planimetria. La barra accent in cima alle card tavolo passa da 2px/op.0.5 a 3px/op.0.85: lo stato si riconosce a colpo d'occhio anche a riposo.
3. **Hairline al posto dei solidi.** Tutti i contenitori di sezione (toolbar, timeline, lista prenotazioni, grid POS, carrello) passano da `#E5E7EB`/`BORDER_SOFT` solid a `BORDER_HAIR` + shadow standard `0 1px 0 … , 0 6px 18px …`, radius allineato a 14.
4. **KDS Cucina.** Le colonne perdono il bordo pieno 3px su 4 lati (crudo) in favore di: top accent 3px nel tone + bordo perimetrale `tone40` 1px + dot identificativo nel titolo + counter a pill tonale. I ticket passano da bordo `rgba(0,0,0,0.32)` 2px a hairline `BORDER_MED` + ombra elevata; il ring rosso "late" con pulse resta invariato (è segnale operativo).
5. **Peso massimo 700.** Tutti i `fontWeight: 800` delle quattro sezioni normalizzati a 700 (la regola "mai 800" era già nel sistema; il logo `ByupB` resta 900 perché brand-mark). *(Superato: l'800 è poi rientrato come peso di enfasi numerica/dati nelle superfici operative — vedi la sezione Pesi.)*
6. **Emoji → SVG.** `🔍` e `🛒` negli empty state POS sostituiti con icone SVG in cerchio `WHITE_FROST`; fallback `🍽` della riga carrello sostituito con iniziale del piatto nel colore categoria.

## Fix di caricamento (non-UI, necessario)

`byup Sala v3.html` non caricava `sala-shared-select.jsx` (definisce `SaSelect`) né `sala-vendita-data.jsx` (definisce `SALA_VENDITA_PIATTI`): la pagina crashava al mount con entrambe le tab Tavoli e Vendita. Aggiunti i due `<script>` mancanti dopo `sala-data.jsx`. Il commento nell'HTML attribuiva erroneamente SaSelect a `sala-tab-tavoli.jsx`.

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

Il progetto usa style inline JSX. Lo manteniamo. Per i token, leggere sempre dall'oggetto vivo del contesto — `ONB.<NOME>` nell'onboarding, `PN.<NOME>` nel gestionale — mai hex hardcoded fuori dai file token. L'oggetto `BU` (`byup-tokens.jsx`) era legacy morto ed è stato rimosso il 2026-07-28: mai in codice nuovo.

```jsx
// SI
<div style={{padding: 24, borderRadius: 10, background: ONB.BG_SOFT}}/>

// NO
<div style={{padding: 24, borderRadius: 10, background: '#FAFBFC'}}/>
```

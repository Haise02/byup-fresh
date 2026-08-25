# Byup — Design Decisions

Riferimento per ogni nuova schermata. Le decisioni qui sono **vincolanti**: quando una pagina diverge, va corretta o motivata in commit message.

Standard di riferimento: Linear, Stripe Dashboard, Notion.

Ultimo allineamento al codice: 2026-08-09.

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
| Modal / pannelli glass | `14 px` | `PnModal` (sheet bottom: `22 px` in cima); `GLASS_MENU` porta il suo radius 16 |
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

### Cornice tratteggiata del prezzo (Salda conto → Modifica)
`stroke-dashoffset` 0 → −20 in 850ms linear infinite su un `<rect>` SVG intorno al prezzo unitario (`saldaAnts` in `sala-salda-modal.jsx`). Non è un'animazione di attenzione: è una **affordance**, e vive solo dentro la modalità «Modifica» del conto — a riposo, nella lista normale, non esiste. Un numero fermo in una lista di numeri fermi non dichiara di essere un campo: la cornice che cammina lo dice senza una legenda accanto, che è l'alternativa. Rispetta `prefers-reduced-motion: reduce` — lì il tratteggio resta, fermo, e l'affordance sopravvive all'animazione.

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
- `PublishButton` (nuovo) — sopra il phone preview vetrina. Apple-style: gradient brand/neutral sfumato, hover state, disabled state con sfumatura `#FFF→#F5F5F7` (NON puro bianco). Sostituisce `ImpSaveBar` nel contesto con preview (l'azione di pubblicazione vive accanto all'oggetto modificato); `ImpSaveBar` resta però definita e usata dai form senza preview (es. `impostazioni-dati-fiscali.jsx`). *(Superato il 2026-07-29: `PublishButton` è stato rimosso e la decisione ribaltata — il salvataggio della Vetrina è tornato a `ImpSaveBar`, barra sticky in fondo alla pagina, perché il pannello anteprima si può chiudere e l'azione principale non deve sparire con lui. Vedi § Batch Impostazioni.)*

### `config-completa-app.jsx`
- Header bg da `#fff` a `WHITE_OFF` (`#FAFBFC`), border-bottom hairline `BORDER_HAIR`. Headline da weight 800 a 600 con letter-spacing tighter. Eyebrow chip ora coerente coi pattern onboarding (BRAND_TINT con dot).
- Stepper bg coerente col header (off-white).
- Il piede della pagina riscritto con `ApBtn` (3 varianti: neutral / dark / brand) — l'ImpButton equivalente locale di questa pagina. *(Il componente `FooterBar` che lo conteneva non esiste più: oggi i bottoni sono composti direttamente nella pagina.)*
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

> **Lista di luglio, superata dai fatti** (verificata il 2026-08-09). Alcuni file citati non esistono più con quel nome — `sala-v3-app.jsx` è oggi `sala-app.jsx`, `sala-modali.jsx` è stato assorbito, `byup Account.html` è `byup Profilo.html` — e Statistiche è stata riscritta da capo fra il 6 e l'8 agosto. Si legge come traccia di intenzioni, non come cose da fare.

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

**Blur e saturazione alzati**: il vetro è più "ice/frosted" e meno "vetro liquido" — leggibilità migliore, vibe Sonoma più solido.

> **Valori aggiornati al 2026-07-31.** I sei token vivono in `panoramica-tokens.jsx` e sono la fonte: sotto ci sono i loro valori reali, non quelli della prima stesura (che parlava di un `GLASS_HOVER` mai entrato in codice e dava il drag a 0.72).

```js
GLASS_LIGHT   → blur(40px) saturate(220%) bg 0.62  — pannelli chiari
GLASS_STRONG  → blur(48px) saturate(240%) bg 0.68  — modali e popover (default di PnModal)
GLASS_VIBRANT → blur(24px) saturate(180%) gradient  — sidebar (ha già il suo gradient)
GLASS_BAR     → blur(40px) saturate(220%) bg 0.62  — header sticky sopra il main
GLASS_MENU    → blur(48px) saturate(240%) bg 0.66  — dropdown e menu contestuali
GLASS_DRAG    → blur(32px) saturate(200%) bg 0.50  — card draggata in dashboard edit mode
```

`GLASS_STRONG` e `GLASS_MENU` sono i più solidi — una modale e un dropdown devono leggersi al volo, non c'è tempo per "decifrare" il bg sotto.
`GLASS_DRAG` è il più trasparente (0.50) — la card draggata è "ghost", deve far vedere ciò che sta sotto perché lì verrà rilasciata.

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

**`impostazioni-shared.jsx`** — `ImpButton` riscritto Apple-style. `ImpWithPreview` aside con `...PN.GLASS_LIGHT`. `PublishButton` sopra phone preview. *(PublishButton rimosso il 2026-07-29 — vedi § Batch Impostazioni.)*

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
- L'azione di pubblicazione vive ora solo nel `PublishButton` sopra il phone preview *(superato il 2026-07-29: oggi vive nella `ImpSaveBar` sticky in fondo — vedi § Batch Impostazioni)*
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

# Batch Impostazioni — 29 lug 2026

Giro di rifinitura su quattro tab delle Impostazioni (Vetrina, Sala e tavoli, Personale, POS e integrazioni) più la vetrina dell'onboarding (`config-completa-app.jsx`). Le regole nate qui:

## Sala e tavoli (`impostazioni-sala-tavoli.jsx`)

- **La selezione è un anello, lo stato è un colore.** Nella lista la selezione vive sul bordo (cremisi `#E32459` a 0.55 + alone corallo), mai come campitura: dentro la card parla lo stato. Il badge col numero: **attivo a riposo = cerchio bianco con anello nero** (`PN.TEXT`), **attivo selezionato = corallo pieno della CTA** (`PN.BTN_BRAND` + `tcBadgePop`), spento = grigio. Il velo interno compare **solo da selezionato** (`#FFF7F6` attivo, `#F7F8F9` spento) ed è **opaco, non rgba**: sotto c'era un gradiente che passava attraverso e le card perdevano il bordo.
- **La pastiglia ATTIVO resta verde** col suo pallino: dice se il tavolo lavora, che è un'altra cosa dall'essere selezionato. Due domande, due colori.
- **Aurora rimossa** dai pannelli «Le tue sale» e sala aperta (prop `aurora` tolta dagli `ImpCard`): sotto le card faceva da terzo colore e i bordi ci si scioglievano.
- **Menu a comparsa a vetro** (⋯ tavolo, ⋯ sala, «Sposta in»): ricetta **locale** `GLASS_MENU` (bianco 0.82, `blur(22px) saturate(180%)`, hairline chiara + outline scuro interno) — omonima ma distinta dal token `PN.GLASS_MENU`. Trappola scoperta: **un antenato con `opacity < 1` fa da backdrop root** e il `backdrop-filter` non campiona più niente — per questo il velo del tavolo disattivato (`opacity 0.78`) cade mentre il suo menu è aperto.
- **Fogli modali bianchi, non glass** (Nuova sala, Nuovo tavolo posizionato): ricetta `MODAL_*` nel file (540px, radius 22, titolo 25/800, padding 28, X 38px bordata). Il vetro va bene per un menu che sfiora la pagina, non per un modulo da compilare. Posti = tessere alte col numero a 25 e spunta sulla scelta; «Personalizzato» = tessera a due righe con matita; casella «Sala attiva» disegnata a mano (28px) perché quella di sistema a 13px spariva. CTA di conferma `variant="pink"`.
- **I tavoli si chiamano «Tavolo N», sempre.** Il mock dell'import AI generava `T1..T8`; `normalizzaNomeTavolo()` rimette in riga al load anche i nomi corti già persistiti in `localStorage['byup-sala-config']` (`T3`/`T 3`/`Tav 3`/`Tav. 3` → `Tavolo 3`) senza toccare «Terrazza 3» o «T3 bis».
- **Lo spento si dice in un modo solo: «Disattivato/a»** — participio del bottone che si preme. Via `INATTIVO/A` (pastiglie menù, sala, tavolo), via «Non attivo» (moduli in `impostazioni-menu-cucina.jsx`), «Riattiva» → «Attiva». Il positivo resta «Attivo/a».

## Personale (`impostazioni-personale.jsx`)

- **Pagina rifatta come elenco unico di chi accede**: tabella Persona · Ruolo · Accesso · Stato · Azioni con **persone e dispositivi insieme** — un monitor cucina entra nel gestionale esattamente come un cameriere; prima erano quattro fisarmoniche per ruolo più una sezione a parte. Rimossi `RoleSection`, `DevicesSection`, `PersonRow`, `DeviceRow`.
- A sinistra i **ruoli come filtro** con conteggi; matita permessi al passaggio su ogni ruolo non-locked (prima i ruoli standard non avevano NESSUN ingresso ai permessi, solo i custom). **Accessi rapidi** ospita solo ciò che non si fa da altrove: collegare un dispositivo (in testata si aggiungono persone) e gli inviti in attesa **coi nomi**, non col numero.
- La colonna **Accesso si deriva dalle aree del ruolo** (`accessoDelRuolo`), mai scritta a mano: cambiano i permessi, cambia da sola. Stato = pastiglia Attivo/Disattivato + ultima attività sotto (due domande diverse).
- **Il titolare** (allora «Proprietario», rinominato il 2026-07-31) è la prima riga della pagina, bloccata: è uno solo e non cambia, niente chevron e niente conteggio. Per l'elenco dei ruoli aggiornato vedi § Ruoli del personale.

## POS e integrazioni (`impostazioni-integrazioni.jsx`)

- **Card a tessere verticali** (minHeight 236, radius 16, logo 54px in alto, bottone full-width appoggiato al fondo con `marginTop:'auto'` prima del blocco stato), **3 per fila**. Il `marginTop:auto` tiene i fondi allineati anche quando una descrizione va a capo e l'altra no. Anche le **stampanti** sono tessere: i tre modi di collegarle (Bluetooth/Wi-Fi/USB) stanno in colonna sopra il bottone che li aspetta.
- **Fascia Byup Staff col gradiente del suo logo**: `GRAD_STAFF = linear-gradient(115deg, #FF1F5A 0%, #FF5A5F 46%, #FF9C8B 100%)` — rosa acceso, corallo brand al centro, salmone. Il marchio è `Fresh-mark.png` ricolorato in panna via `filter: brightness(0) invert(1)` (appiattisce tenendo l'alfa, poi inverte), direttamente sul gradiente senza tessera. Bottone ghost panna con scritta rossa: il dark pesava sul corallo pieno, il brand ci spariva dentro. `GRAD_STAFF` vive nel file; se servisse a una seconda superficie, sale nei token.

## Vetrina (`impostazioni-vetrina.jsx` + `config-completa-app.jsx` + shared)

- **Il salvataggio è la `ImpSaveBar` sticky in fondo alla pagina** («Hai modifiche non salvate» + «Salva modifiche» `variant="pink"`), visibile solo a `dirty`. `PublishButton` rimosso: stava sopra il telefono, in un pannello che si può chiudere — l'azione principale spariva con l'anteprima. I 4 campi delle Informazioni (nome, sito, indirizzo, descrizione) ora marcano `dirty` (prima non chiamavano nulla e la pagina restava «pulita»).
- **Il telefono è solo contenuto**: via i bottoni flottanti della vetrina consumer (back/cuore/⋯) e la status bar (9:41 + batteria) da `VetrinaMiniPreview` — cornice di sistema, non vetrina. Via anche i banner Plus sotto il telefono, in entrambe le pagine. L'isola dinamica resta.
- **Il telefono prende lo spazio della finestra**: banner completamento e sub-tab vivono DENTRO la colonna sinistra di `ImpWithPreview` (non sopra la griglia), così il pannello anteprima parte dalla cima ed è tutto visibile senza scroll; colonna anteprima 320→348px (con l'altezza ritrovata era la larghezza a strozzare il telefono). `ImpSaveBar` simula un `resize` quando compare/sparisce così `adatta()` ricalcola e il telefono non finisce sotto la barra. Nell'onboarding il telefono passa da 300px fissi (taratura del banner rimosso) a 100% della rail.
- **I chip del completamento accendono dove portano**: `impAccendiSezione(anchor)` + `ImpAtterraggioStyle` (shared, usati da Impostazioni E onboarding) — anello corallo 1.9s sulla sezione d'arrivo, riavviabile ricliccando. Portarci non basta: chi arriva in fondo a uno scorrimento non sa dove si è fermato l'occhio.
- `ImpField` accetta `style`: la Descrizione si allunga a pareggiare il fondo del pannello servizi (colonna flex + `flex:1` sul campo e sulla textarea).

---

# Ruoli del personale, referral e azioni rapide — 31 lug 2026

## Ruoli del personale (`impostazioni-personale.jsx`)

I ruoli sono **tre**, e sono i due modi in cui si prende un ordine più chi possiede il locale:

| Ruolo | Vede | Note |
|---|---|---|
| **Cassa** | Vendita diretta, Sala e prenotazioni | prende ordini e incassa dalla cassa del locale |
| **Titolare** | tutto (9 sezioni su 9) | uno solo, è chi ha creato il gestionale; riga bloccata |
| **Cameriere** | App staff | visibilità solo dall'app cameriere |

Oltre a questi, la colonna a sinistra elenca **Dispositivi** e — solo se il locale se li è creati — **Personalizzati**.

- **Via «Manager»**: non era un ruolo del personale. Chi gestisce il locale è il titolare, che il gestionale ha già.
- **Via il ruolo «Cucina» dagli inviti**: chi guarda le comande è il Kitchen Monitor, che si collega con username e password locali, non con un invito per email. Al suo posto, come ripiego per una persona il cui ruolo non esiste più (un personalizzato cancellato), c'è `RUOLO_IGNOTO` → «Ruolo rimosso», che lo dice invece di mascherarlo da cucina.
- **`ALL_AREAS` passa da otto a nove**: mancava **Vendita diretta**, che è una sezione vera del gestionale e senza la quale il ruolo Cassa non avrebbe avuto niente da vedere. Compare anche nella creazione dei ruoli personalizzati.
- **`accessoDelRuolo` ordina le aree come le dichiara il ruolo**, non come stanno nel menu: per la Cassa il titolo legge «Vendita diretta +1», che è il suo mestiere, invece di «Sala e prenotazioni +1» solo perché la sala viene prima.
- Nella **Configurazione completa** (`PersonaleStep`) le card-ruolo sono due, **Cameriere** (prima e selezionata all'apertura: è quello che si invita in numero) e **Cassa**. La terza card «Cucina» è sparita per lo stesso motivo di sopra: il Kitchen Monitor si collega nella sezione dispositivi lì sotto.

## Porta un ristorante su byup (referral fra locali)

Due mesi gratis a testa, a chi invita e a chi arriva. Vive in **Profilo → Piani e abbonamenti**, fra «Risparmiato questo mese» e «Cambia piano»: è l'unica voce della pagina che fa **scendere** il conto — le due sotto sono due modi di spendere di più — e sta col risparmio, che racconta la stessa storia.

- **In pagina è una fascia bassa**, alta una riga, col fondo aurora che la stacca dal bianco delle card intorno e un bottone bianco che ci risalta sopra senza mettersi in gara con le CTA dei piani. Non è una card: si vede e si clicca, ma non prende lo spazio di una decisione. Tutto il resto sta nel popup.
- **Il popup mostra il codice, non il link.** Il codice è quello che l'altro digiterà nell'onboarding ed è quello che si detta al telefono; il link viaggia dentro il messaggio di «Condividi», dove serve che sia cliccabile. «Copia codice» porta il gradient aurora, «Condividi» è ghost e usa il Web Share dove c'è, WhatsApp col messaggio già scritto dove non c'è.
- **Il codice sta sul locale, non sulla persona** (`accCodiceInvito` in `account-data.jsx`): se cambia il titolare, i mesi guadagnati restano al locale che li ha portati. Le due cifre finali non sono un anno ma una firma ricavata dal nome, così due «Da Mario» in due città non si ritrovano con lo stesso codice.
- **Una riga di stato, non tre numeri**: «1 ristorante ha attivato il piano Starter: hai guadagnato 2 mesi del tuo piano gratuiti». Aperture del link e iscritti sono metriche di campagna e le guarda byup dal suo pannello; se non è ancora arrivato nessuno non si scrive niente.
- **Il lato che riscatta**: l'onboarding ha un campo **«Codice invito»**, opzionale e in fondo all'anagrafica (step 2 · Informazioni), che conferma i due mesi appena lo compili. Senza, il link condiviso non aveva dove atterrare — e l'app consumer prometteva già che il codice si inserisce «durante l'onboarding di byup gestionale».
- **Ingressi**: `byup Profilo.html?tab=piani&invita=1` apre direttamente il popup. Ci puntano la voce «Invita un ristorante» delle Azioni rapide e la stessa voce in ⌘K — chi arriva da lì vuole il codice, non trovare la fascia e cliccarla.

## Azioni rapide della Panoramica

Otto azioni, `4×2`. **Le colonne si scelgono per stare sempre in due righe** — tre fino a sei azioni, quattro da sette in poi — perché la settima sarebbe rimasta sola in una terza riga, che è l'orfano che le tre colonne originali erano state scelte per evitare.

Le due nuove: **«Modifica menu»** (matita ambra) porta al compositore dei menù (`?page=menu-cucina&sub=menu`), destinazione diversa da «Aggiungi piatto» che apre la libreria dei piatti; **«Invita un ristorante»** al popup del referral.

---

# Statistiche economiche, Supporto e assistente IA — 6 ago 2026

Tre filoni: la sub-tab **Ricavi e costi** delle Statistiche, il **Supporto**, e un **assistente IA fluttuante** nuovo che vive su tutte le schermate della console.

## Statistiche → Economici → Ricavi e costi (`stat-economici.jsx`)

### Le barre di «Totale costi» mentivano

Erano tutte lunghe uguale, a tutta larghezza, perché mostravano solo il mix fissi/variabili di ogni categoria. A quella lunghezza e a quel peso però si leggono come una **quantità**: «Altro» a 1.580 € sembrava pesare quanto gli stipendi a 18.400 €. Ora la **lunghezza è la quota della categoria** — in scala sulla più grossa, non sul totale, altrimenti sarebbero tutte monconi visto che la maggiore è il 35% — e le due tinte restano il mix.

La card è passata a due colonne. A sinistra un incavo col totale, l'**incidenza sui ricavi** e **quanto della spesa è incomprimibile** (fissi vs variabili aggregati sull'intero breakdown), con l'andamento a 12 mesi a filo del bordo in fondo. A destra le categorie in ordine di peso, incolonnate sotto un'intestazione (categoria · composizione · quota · totale · vs mese); «Altro» resta ultimo perché è il residuo, non una categoria. Prima era una riga sola per categoria, col nome all'estrema sinistra e i numeri schiacciati a destra: su una card larga tutta la pagina restava mezzo metro di vuoto in mezzo.

Le colonne stanno in `COSTI_COLS`, dichiarate una volta sola: intestazione e righe devono restare incolonnate, e due `gridTemplateColumns` gemelli divergono al primo ritocco.

**Il segno dei costi si legge al contrario di un ricavo.** `CostoDelta` colora di verde quando si spende meno e lascia grigio fino al +5%: un rialzo piccolo non è un allarme, e sette pillole rosse renderebbero illeggibile la card. `StatDelta`, che assume «su = bene», qui darebbe rosso a un -4,2% che è una buona notizia. Il «↓ 4,2% vs mese scorso» in testa era peraltro **una stringa scritta a mano**: ora viene da `d.costi.delta`.

### Grafici che riempiono lo spazio che hanno

`StatSpark` accetta tre prop nuove, tutte opzionali e con default che lasciano intatte le chiamate esistenti:

- **`stretch`** — l'SVG riempie il contenitore in larghezza e in altezza (`preserveAspectRatio="none"`), con `vector-effect="non-scaling-stroke"` sulla polilinea perché la linea non si ingrassi quando viene stirata; `width`/`height` restano solo il sistema di coordinate interno;
- **`padY`** — stacca minimo e massimo dai bordi, così la linea non striscia sul filo quando il grafico va a filo della card;
- **`stroke`** — spessore della linea, un filo più presente quando il grafico è grande.

Nei tre box dei canali il grafico va **a filo dei bordi** (margini negativi + `overflow: hidden` sul box) con un'altezza sua di 48px ancorata in basso da `margin-top: auto`. A misura fissa lasciava un vuoto a destra; lasciandolo crescere a piacere diventava un terzo della card.

### Bianco su bianco non si vede

I tre box dei canali erano bianchi su una card bianca con bordo `BORDER_SOFT` (#F0F2F5): il perimetro non aveva niente da separare. Ora sono **incavi** — fondo `PN.BG`, lo stesso del canvas, e bordo `PN.BORDER` — e il bordo si legge perché divide due tinte diverse, non perché sia stato scurito. Provata anche la strada opposta (box bianchi in rilievo con ombra): resta bianco su bianco, i bordi si vedono solo su uno schermo tarato bene.

### Hover

- **I box** (i tre KPI in testa e i tre canali) crescono dell'**1,5%** e prendono `CARD_SHADOW_HOVER`. Non di più: stando in griglia a filo, con più ingrandimento si vede il box spingere quello accanto.
- **Il donut di Origine incassi**: lo spicchio puntato cresce del **7%** e resta l'unico a colore pieno, gli altri scendono al 40%. Cresce con una **scala CSS attorno al centro** e non ricalcolando il path — l'attributo `d` di un `<path>` non si può animare, la trasformazione sì; al 7% l'anello arriva a 151 dei 156 del viewBox, quindi il viewBox non va allargato. Al centro compare il metodo puntato col suo incasso al posto del totale, e la legenda si accende dalla parte giusta: funziona anche partendo dalla riga della legenda.

## Supporto

- **La chat dichiara di essere un'IA.** «Assistente virtuale» non è la stessa cosa: chi scrive deve sapere che dall'altra parte non c'è una persona. Lo dice il primo messaggio e lo ripete l'intestazione, perché il saluto scorre via appena la conversazione si allunga.
- **«Operatore» e «Richiamami» erano due bottoni senza `onClick`.** Al loro posto uno solo, «Parla con un operatore umano», che apre le due strade vere — Ticket e Prenota una chiamata — agganciate alle modali che già esistono in pagina. La scelta si annulla con una ×, e si richiude da sola appena la modale si apre.
- **Il canale Email è diventato Ticket** (card, CTA, scelta nella chat, titolo e conferma della modale), con l'icona documento al posto della busta: quello che apri è una richiesta tracciata. Risposta **entro 2 giorni lavorativi**, allineata anche sul badge della card, che prometteva 4 ore — è lo stesso canale, lasciarli diversi sarebbe una promessa contraddetta due centimetri più in là.
- **Le fasce di richiamata stanno dentro l'orario presidiato.** «Domani mattina, 9:00–12:00» prometteva una chiamata fuori orario: il telefono è presidiato Lun–Ven 12–16 e 18–22 (piano Plus). Le quattro scelte sono ora *Entro 2 ore* (garanzia Plus), *Entro 1 ora* (garanzia Business, H24), *Fascia 12:00–16:00*, *Fascia 18:00–22:00*. Lo stato iniziale era `'30min'`, un id che non esisteva fra le opzioni: all'apertura non risultava selezionata nessuna fascia.
- **La ricerca apre la pagina.** Stava incastrata fra le card dei canali e il Centro assistenza, bianca fra due superfici bianche: non aveva niente da cui staccarsi. Ora è il primo elemento — in un centro assistenza la prima mossa è cercare, scrivere o chiamare è quello che si fa se la ricerca non basta — con la lente in una pastiglia rosa, ombra a riposo e anello rosa al fuoco. L'esempio è uscito dal placeholder, dove faceva una riga lunghissima che si leggeva come una frase invece che come un suggerimento.
- **`?chat=1`** apre la chat dell'assistenza all'arrivo. Ci punta l'assistente IA delle altre schermate.

## Assistente IA fluttuante (`byup-ai-fab.jsx`)

Un bollino col segno byup in basso a destra su **tutte le schermate della console tranne il Supporto**, dove l'angolo è già della chat dell'assistenza e due bolle nello stesso posto si coprirebbero. Fuori anche Login, Restaurant Onboarding e Configurazione completa: su un login non sei autenticato, e in onboarding un assistente che offre di modificare menu e sala non ha ancora un locale su cui lavorare.

### Come si aggancia

**Si monta da solo dentro `.frame`.** Alle pagine serve solo il tag `<script>`, nessun componente toccato. Non sul `body`: il frame ha uno `zoom` che scala tutta la UI, e un elemento `fixed` fuori dal frame resterebbe della misura sbagliata e fuori dai bordi. Il frame lo monta React dopo la compilazione Babel, che arriva da CDN: al primo giro può non esserci ancora, quindi un `MutationObserver` aspetta e monta appena compare — stessa soluzione dello script di zoom già presente nelle pagine.

**Le tre icone che gli servono sono disegnate nel file.** `byup-icons.jsx` è caricato solo da due delle sette pagine che montano il bollino: pescando da `BuIcons` l'assistente sarebbe morto al primo render sulle altre cinque. Niente spread sulle props né rest nel destructuring, per non rientrare nella collisione degli helper Babel fra script non isolati che ha già fatto sparire delle icone in passato.

### Il bollino

72px — quello del Supporto è 56. A riposo è bianco col segno corallo e un alone che respira piano; al passaggio cresce di **metà** (72 → 108) e si accende col **gradiente aurora** (`#FF5A5F → #F472B6 → #A78BFA`), la stessa palette che gira attorno alle card dei piani, col segno che diventa bianco in dissolvenza. I due segni stanno sovrapposti e si scambiano per opacità: cambiare `src` a metà transizione fa sfarfallare.

Al clic parte un ventaglio di dodici scintille e **solo dopo 200ms** si apre il pannello: aprendoli insieme la finestra copriva metà del volo e il clic sembrava non aver fatto niente.

### Trascinabile

Si prende e si porta dove si vuole. La posizione vale su tutte le schermate e sopravvive al ricaricamento (`localStorage`, chiave `byup.ai.fab.pos`). Finché non lo si sposta resta ancorato in basso a destra e segue il frame quando la finestra cambia larghezza; se la finestra si stringe al punto da mandarlo fuori, rientra da solo.

- **Lo `zoom` del frame va diviso.** Un pixel di schermo non è un pixel di frame: senza il fattore, il bollino scappa dal puntatore su qualsiasi finestra non alta esattamente 900. Il fattore si ricava da `frame.getBoundingClientRect().width / parseFloat(frame.style.width)`, che è quello che lo script di fit ha impostato.
- **Clic e trascinamento sono lo stesso gesto**, separati da una soglia di 4px. L'apertura però resta sull'evento `click` e non sul rilascio del puntatore, così il bottone continua a rispondere anche a tastiera, lettori di schermo e comandi vocali, che generano un click senza eventi di puntatore; dopo un trascinamento quel click arriva lo stesso (il bollino è rimasto sotto il dito) e viene ignorato da una bandiera.
- **Mentre lo trascini resta a misura** con un'ombra appena più marcata, invece di gonfiarsi a 1,5×: ingrandito, il puntatore finirebbe fuori centro e sembrerebbe sfuggire. Niente transizione sul `transform` durante il trascinamento, o arriverebbe al puntatore con un quarto di secondo di ritardo.

### La chat

384 × 620, testata col gradiente aurora che scorre lentissimo e il **byuppino** ripreso dalla mascotte dell'app (`app/assets/mascot-wave.png`, ridimensionata da 926 KB a 85 e copiata come `gestionale/byuppino-wave.png` — un `../app/assets/` avrebbe legato il gestionale a una cartella che non gli appartiene). La testata non ha `overflow: hidden`, così il byuppino sborda di una decina di pixel e si affaccia sulla conversazione; il ritaglio agli angoli lo fa già il pannello.

**Il pannello si apre dal lato del bollino**: allineato al bordo vicino, sopra se c'è posto e sotto altrimenti, sempre dentro il frame — che ha `overflow: hidden` e taglierebbe quello che esce. Anche l'origine dell'animazione punta all'angolo giusto: col bollino portato in alto a sinistra, una chat che si apre dal basso a destra sembra di qualcun altro.

**La seconda conferma che il saluto promette è implementata davvero**: la risposta mostra la modifica preparata e non pubblica finché non gliela si conferma. Una copy che promette una cosa che la UI non fa è una bugia, non un mockup.

**Gli esempi girano dentro al campo di scrittura**, uno ogni 3,4 secondi, uno per area (prenotazione, menu, sala, impostazioni). Erano nate come pillole cliccabili sopra al campo: erano comandi già scritti, e chi li preme non impara cosa può chiedere — esegue una cosa decisa da noi. Nel campo mostrano invece la **forma** di una richiesta, nel punto esatto in cui stai per scriverla, e non occupano una riga di pannello. Il giro si ferma quando il cursore entra nel campo: un testo che cambia da solo mentre stai formulando la frase distrae. Il suggerimento è un testo sovrapposto e non l'attributo `placeholder`, che non si può dissolvere.

**«Serve una persona? Contatta l'assistenza»** sta in alto a destra, prima della conversazione, piccola e grigia. Sopra al campo di scrittura era in mezzo agli occhi proprio mentre stai per chiedere qualcosa all'assistente, e a tutta larghezza sembrava un invito ad andarsene. Porta a `byup Supporto.html?chat=1`.

---

# Statistiche, Cucina a due monitor, Menù e ruoli — 7-9 ago 2026

Batch grosso (~190 commit). Qui stanno le regole che ne escono e valgono da qui in avanti; il racconto di cosa è cambiato sta in `PROGRESS.md`.

## Un fatto, una casa

La regola che ha guidato quasi tutti gli spostamenti di questa sessione: **un dato sta in un posto solo, e quel posto è dove qualcuno se lo va a cercare**.

- Lo **stato di trasmissione fiscale** è del pagamento, non della giornata: Conti ne è la casa, e le chiusure di cassa lo derivano. Prima stava su entrambi e le due copie divergevano.
- La **geometria della sala** — ingombro del tavolo, test di sovrapposizione, ricerca a spirale del posto libero, disposizione in fila, rotazione di un gruppo — sta in `sala-geometria.jsx` e la usano sia Sala sia Impostazioni → Sala e tavoli. Erano due copie divergenti, e lo stesso difetto («un'unione che diventa un blocco») si è dovuto correggere due volte in due giorni. Ci entrano numeri e rettangoli, non oggetti «tavolo»: chi chiama traduce i propri dati, così le differenze fra le due pagine restano parametri espliciti invece di due implementazioni che si somigliano.
- La **visualizzazione della cucina** è del monitor, non della pagina: si sceglie dove il monitor si collega (Impostazioni → Personale), e la Cucina sceglie solo quale monitor guardare.
- I **KPI del servizio clienti** vivono in Statistiche, non anche nell'Assistenza.

Corollario operativo: quando due schermate mostrano lo stesso fatto, una delle due lo **legge**, non lo ricalcola.

## Ruoli di sistema e ruoli personalizzati

Cassa, Cameriere e Titolare sono **ruoli di sistema**: hanno permessi di partenza e non si smontano. Aprire i permessi di uno di loro e salvare **non lo modifica** — si esce con un ruolo personalizzato nuovo, e il ruolo di sistema resta intatto. Un ruolo personalizzato invece si modifica sul posto, perché è roba di chi l'ha creato.

Da qui discende il nome: **due ruoli non possono chiamarsi allo stesso modo**, o sono indistinguibili nel momento in cui li si assegna a qualcuno. Salvando un nome già in uso esce un popup che ferma il salvataggio e **rimanda al modulo con dentro quello che c'era**: chi ha appena scelto otto aree non le rifà perché il nome era occupato. Il confronto ignora maiuscole e spazi ai bordi — «Cassa » e «cassa» sono lo stesso nome per chi legge l'elenco, ed è l'elenco che conta.

**Un meccanismo si dichiara prima, non lo si scopre dall'errore.** La modale di un ruolo di sistema lo dice in testa al modulo, e il pulsante si chiama «Crea ruolo personalizzato» invece di «Salva modifiche». Un errore che spiega una regola è una regola comunicata troppo tardi.

## Aree cliccabili: la grandezza del bersaglio è quella della cosa

**In una griglia un figlio si allarga per tutta la cella**, anche se è `inline-flex` e ha `padding: 0`: `justify-self` vale `stretch` finché non gli si dice altro. Le intestazioni di colonna ordinabili erano bottoni trasparenti dentro griglie, quindi a riposo non si vedeva niente — si vedeva la manina comparire a mezza colonna di distanza dalla parola, e l'hover campire un riquadro grande quanto la colonna per due parole di intestazione.

Regola: **il bersaglio ha la forma di quello che si tocca**. Su un'intestazione ordinabile si tocca il nome (più il segno di ordinamento), quindi `justifySelf:'start'` — o `'end'` dove la colonna è allineata a destra, che il bersaglio segue l'allineamento della colonna e non si sposta niente a vedersi.

Lo stesso vale al contrario: un bottone-icona ancorato in un angolo si mette **fuori dal flusso** (`position:absolute`) e gli si riserva la corsia con un `paddingRight` sul contenuto, invece di lasciarlo comprimere da quello che gli sta accanto. Nella card di una sala il `⋯` era l'unico elemento comprimibile della riga: bastava un badge più largo — `DISATTIVATA` invece di `ATTIVA` — perché finisse fuori dal bordo.

## Lo stato attivo si dice col segno, non con la campitura

Un'intestazione ordinabile attiva si riconosce dal **testo più scuro e dalla freccia**, non da un fondo colorato grande quanto la cella. La campitura di una cella intera per dire «sto ordinando per questa colonna» è una macchia che compete con i dati, che sono la cosa da leggere.

## Il carattere «⋯» non esiste in Plus Jakarta Sans

Lo disegna un font di ripiego, che lo appoggia dove gli pare rispetto alla linea di base: dentro un bottone quadrato resta storto, e di quanto cambia da un sistema all'altro. I tre pallini sono un **SVG** (`Puntini` in `impostazioni-shared.jsx`, `window.Puntini`), centrato per costruzione. Vale per ogni glifo decorativo: se non è nel font del progetto, si disegna.

## Una porta sola per stanza

La matita «permessi» sulle righe dei ruoli è stata tolta: era il secondo modo per arrivare alla stessa modale, ed era pure quello nascosto — comparivi sopra la riga e la trovavi, altrimenti no. Le righe della colonna «Ruoli» fanno quello che il loro sottotitolo dichiara, cioè filtrare l'elenco, e i permessi si aprono da «Crea ruolo», che sta lì sotto ed è sempre visibile.

Quando si toglie una porta si toglie anche quello che serviva solo a lei: con la matita se ne sono andati lo stato `editRole` e il margine destro di 24px che riservava la sua corsia nei conteggi.

## Il conto si salda in due passi, non in due finestre e non in due colonne

Per arrivare a incassare un tavolo si aprivano **due finestre**: «Conto» — la lista dei piatti con lo stato e le correzioni — e dietro di lei «Salda conto», spaccata in due colonne: i piatti a sinistra da spuntare, i soldi a destra. Tre superfici per un gesto solo, e la prima era una tappa obbligata verso una lista che la colonna di sinistra rifaceva daccapo, spunte comprese.

Adesso «Vai al conto» apre direttamente il saldo, e il saldo è **una finestra in due passi**: prima COSA si salda, poi QUANTO e COME. La regola che ne esce vale oltre questa schermata:

**Due domande che si fanno una dopo l'altra non si mettono una accanto all'altra.** Due colonne affiancate dicono «rispondi a tutte e due», e chi apriva la finestra si trovava davanti «Come paga il cliente?» mentre stava ancora leggendo cosa c'è sul tavolo. Un passo per domanda, con la risposta precedente riassunta in testata e una via di ritorno esplicita.

**Una schermata che serve solo a raggiungerne un'altra non è un passo, è una porta.** Il vecchio «Conto» non chiedeva niente e non decideva niente: si leggeva e si premeva «Procedi». Quello che ci viveva davvero — aggiungere una riga, correggere un prezzo, togliere un piatto battuto per sbaglio — è diventato una **modalità dichiarata** dentro il primo passo, e non lo stato normale della lista: chi deve solo incassare non può cancellare una riga con un tocco storto, e chi sta correggendo non spunta niente per sbaglio.

**La finestra cambia misura col passo.** 864 dove c'è una lista, 620 dove c'è una cifra e due tessere — la stessa misura della finestra Incassa di Vendita diretta, che è lo stesso gesto fatto dalla stessa persona. Una colonna stretta in mezzo a due fasce di bianco non sembra ordinata, sembra rotta; e in una finestra che si stringe la testata si riflette su due righe invece di comprimersi.

**In modifica si toglie, non si conta.** Non c'è uno stepper sulla quantità: contarla al rialzo è un altro ordine, e per quello c'è «Aggiungi articolo». Quello che serve davvero è l'altra metà — «una delle tre birre non l'hanno presa» — ed è il **cestino** a farla, chiedendo quante: su una riga da più porzioni il tocco apre una scelta (1, 2, … e «Tutte e 3»), su una riga da una sola se ne va senza chiedere niente. Un comando che chiede solo dove la domanda esiste. Sotto quello che è già stato incassato non si scende mai: quelle porzioni sono un incasso, non un refuso.

**Lo stato di lavorazione del piatto sta dove ci si fa la domanda.** «A che punto è?» è una domanda che ci si fa guardando il TAVOLO — «cosa manca ancora a quel sei?» — non mentre si incassa. Le pastiglie vivono nell'elenco «Ordini · N» della card espansa, sopra «Crea ordine», richiudibile e chiuso di default, coi minuti di attesa accanto. Nella finestra del conto rispondevano a una domanda che lì nessuno stava facendo, e rubavano la riga al nome del piatto — che è la cosa da riconoscere quando si sceglie cosa saldare.

**Un comando che crea una riga ha la forma della riga che crea.** «Aggiungi articolo» era una pastiglia in fondo alla barra del titolo: un bersaglio da cercare in un angolo per far comparire qualcosa da tutt'altra parte. Ora è una riga tratteggiata larga quanto quella di un piatto, prima voce dell'elenco — si preme dove il piatto comparirà, e premendola diventa lo stesso rettangolo con dentro la ricerca. Vive **fuori** dal riquadro che scorre: l'elenco dei risultati si apre sotto di lei, e da dentro uno scroll verrebbe tagliato al primo risultato ogni volta che il conto è corto.

**In un elenco operativo, quello che è finito scende in fondo.** Le righe già saldate stanno sotto le altre: in cima resta il lavoro da fare, e scorrendo un conto lungo non ci sono buche spente da saltare per arrivare alla prossima riga da spuntare. In modifica non ci sono proprio: una riga pagata non risponde a nessuno dei tre gesti di quella modalità, e mostrarla sarebbe l'unica cosa lì dentro che non si può toccare.

---

## Convenzione style inline

Il progetto usa style inline JSX. Lo manteniamo. Per i token, leggere sempre dall'oggetto vivo del contesto — `ONB.<NOME>` nell'onboarding, `PN.<NOME>` nel gestionale — mai hex hardcoded fuori dai file token. L'oggetto `BU` (`byup-tokens.jsx`) era legacy morto ed è stato rimosso il 2026-07-28: mai in codice nuovo.

```jsx
// SI
<div style={{padding: 24, borderRadius: 10, background: ONB.BG_SOFT}}/>

// NO
<div style={{padding: 24, borderRadius: 10, background: '#FAFBFC'}}/>
```

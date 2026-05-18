# Icons inventory — Byup Fresh / Dashboard (Panoramica)

> Fase 1 della migrazione a Apple SF Regular Filled. NIENTE è stato modificato.
> Aspettare "ok" prima di passare alla Fase 2.

---

## 1. Stack rilevato

| Voce | Valore |
|---|---|
| Framework | **HTML statico** + React 18 UMD via unpkg + **Babel-standalone** (compilazione nel browser, no build step) |
| Linguaggio | **JSX puro** (no TypeScript) |
| CSS engine | **Inline styles** (CSS-in-JS object literals). No Tailwind, no styled-components, no CSS modules |
| Bundler / imports | **Nessuno**. I file `.jsx` sono caricati come `<script type="text/babel" src="...">` e ogni modulo espone API via `window.*` |
| Alias di path | Nessuno |
| `package.json` | **Inesistente** |

### Implicazioni per le fasi successive (importanti)

1. **API del componente Icon va adattata.** Lo spec del task usa `import { ... } from './...'` + TypeScript (`IconProps`, `IconName`). Qui non c'è modulo bundler né TS: il registry diventa un file `.jsx` che esporta `window.Icon` e `window.SfIcons`, esattamente come fa oggi `panoramica-icons.jsx` con `window.PnI`. I "tipi" si possono documentare via JSDoc.
2. **Niente `npm install` / `npm run build`.** Le librerie non esistono — quindi i punti dello spec su rimozione dipendenze e build sono N/A.
3. **Tree-shaking N/A.** Babel-standalone non ottimizza; il registry resta integralmente caricato a runtime. Se serve, si può splittare il registry in due file (icone-dashboard vs. icone-altre-pagine), ma per ora il volume è basso (≈22 icone uniche usate nella dashboard).
4. **Test page `/_dev/icons`.** Diventa una pagina HTML statica autonoma (`_dev/icons.html`) che monta una griglia con tutto il registry — non una route Next.
5. **Linting finale.** Sostituiamo `npm run build` + grep TS con un grep manuale sul codice (no compile step da passare).
6. **Niente librerie esterne da rimuovere.** Tutto il sistema icone attuale è interno (`PnI` da `panoramica-icons.jsx`, `BuIcons` da `byup-icons.jsx`). Lo spec menziona lucide/heroicons/ecc.: confermato che NON sono presenti nel repo.

---

## 2. File della dashboard

Pagina dashboard: `byup Panoramica.html` (entry HTML). Carica nell'ordine:

```
panoramica-tokens.jsx
panoramica-icons.jsx        ← definisce window.PnI (icon set Panoramica, stroke-based)
byup-tokens.jsx
byup-icons.jsx              ← definisce window.BuIcons (icon set globale, stroke-based)
panoramica-sidebar.jsx
panoramica-plan-card.jsx
panoramica-notif-bell.jsx
panoramica-header.jsx
panoramica-widgets.jsx
panoramica-widget-catalog.jsx
panoramica-grid.jsx
panoramica-app.jsx
```

Nessun file del dashboard usa librerie di icone esterne (lucide-react, heroicons, react-icons, @tabler/icons-react, @radix-ui/react-icons, phosphor, iconify, @mui/icons-material): verificato con grep su tutto il repo (un solo match in `sala-v3-card.jsx`, ma è un commento di riferimento, non un import — fuori dallo scope dashboard).

Nessun `<img>` o `background-image` con SVG nella dashboard, a parte:
- `<img src="Fresh.png">` per il logo (in `panoramica-icons.jsx` come `PnI.Logo`). È un raster del brand logo: **fuori scope** rispetto alle icone SF (è un'immagine di brand, non un'icona del design system).

L'unico `<svg>` inline NON dentro il registry `PnI` è una **sparkline chart** in `panoramica-widgets.jsx:60` — è una visualizzazione dati (path generato matematicamente), non un'icona: **fuori scope**.

---

## 3. Inventario delle occorrenze di icone

### 3.1 Definizioni nel registry attuale

| Sorgente | Nome | Note |
|---|---|---|
| `panoramica-icons.jsx` | `PnI.Logo` | `<img src="Fresh.png">`, **NON icona vettoriale**, brand asset |
| `panoramica-icons.jsx` | `PnI.Panoramica` | 4 rettangoli (layout grid) |
| `panoramica-icons.jsx` | `PnI.Calendar` | calendario classico |
| `panoramica-icons.jsx` | `PnI.Kitchen` | padella + manico + fiamma |
| `panoramica-icons.jsx` | `PnI.Stats` | barre verticali |
| `panoramica-icons.jsx` | `PnI.Money` (1° def.) | cassa POS stilizzata |
| `panoramica-icons.jsx` | `PnI.Money` (2° def. linea 270) | simbolo dollaro (**override** del primo — bug di nomenclatura) |
| `panoramica-icons.jsx` | `PnI.Headset` | cuffie supporto |
| `panoramica-icons.jsx` | `PnI.Search` | lente |
| `panoramica-icons.jsx` | `PnI.Bell` | campanella |
| `panoramica-icons.jsx` | `PnI.Settings` | ingranaggio |
| `panoramica-icons.jsx` | `PnI.Plus` | + |
| `panoramica-icons.jsx` | `PnI.X` | × close |
| `panoramica-icons.jsx` | `PnI.Drag` | 6 pallini (drag handle) |
| `panoramica-icons.jsx` | `PnI.More` | 3 pallini orizzontali |
| `panoramica-icons.jsx` | `PnI.ChevronRight` | › |
| `panoramica-icons.jsx` | `PnI.ChevronDown` | ⌄ |
| `panoramica-icons.jsx` | `PnI.Check` | ✓ |
| `panoramica-icons.jsx` | `PnI.TrendUp` | linea su |
| `panoramica-icons.jsx` | `PnI.TrendDown` | linea giù |
| `panoramica-icons.jsx` | `PnI.Star` | stella (filled opzionale) |
| `panoramica-icons.jsx` | `PnI.Person` | persona singola |
| `panoramica-icons.jsx` | `PnI.People` | due persone |
| `panoramica-icons.jsx` | `PnI.Clock` | orologio |
| `panoramica-icons.jsx` | `PnI.Alert` | triangolo allerta |
| `panoramica-icons.jsx` | `PnI.Sparkle` | scintilla |
| `panoramica-icons.jsx` | `PnI.Trash` | cestino |
| `panoramica-icons.jsx` | `PnI.Copy` | duplica |
| `panoramica-icons.jsx` | `PnI.Mail` | busta |
| `panoramica-icons.jsx` | `PnI.Phone` | cornetta |
| `panoramica-icons.jsx` | `PnI.Chat` | nuvoletta |
| `panoramica-icons.jsx` | `PnI.Key` | chiave |
| `panoramica-icons.jsx` | `PnI.Lock` | lucchetto |
| `panoramica-icons.jsx` | `PnI.Info` | (i) |
| `panoramica-icons.jsx` | `PnI.Document` | foglio |
| `panoramica-icons.jsx` | `PnI.Recurring` | frecce circolari |
| `panoramica-icons.jsx` | `PnI.Pin` | puntina |
| `panoramica-icons.jsx` | `PnI.Send` | aeroplano carta |
| `panoramica-icons.jsx` | `PnI.Printer` | stampante |
| `panoramica-icons.jsx` | `PnI.Smartphone` | telefono |
| `panoramica-icons.jsx` | `PnI.Wrench` | chiave inglese |
| `panoramica-icons.jsx` | `PnI.Home` | casa |
| `panoramica-icons.jsx` | `PnI.Cart` | carrello |
| `panoramica-icons.jsx` | `PnI.Eye` | occhio |
| `panoramica-icons.jsx` | `PnI.Edit` | matita |
| `panoramica-icons.jsx` | `PnI.ResizeHandle` | freccia diagonale |
| `panoramica-icons.jsx` | `PnI.Receipt` | scontrino |
| `panoramica-icons.jsx` | `PnI.Table` | tavolo |
| `panoramica-icons.jsx` | `PnI.Lightning` | fulmine |
| `panoramica-icons.jsx` | `PnI.Plate` | piatto |
| `panoramica-icons.jsx` | `PnI.Coin` | moneta € |
| `panoramica-icons.jsx` | `PnI.Bag` | shopping bag |
| `panoramica-icons.jsx` | `PnI.Idea` | lampadina |
| `panoramica-icons.jsx` | `PnI.Download` | freccia giù |
| `panoramica-icons.jsx` | `PnI.FileText` | foglio con linee |
| `panoramica-icons.jsx` | `PnI.QrCode` | QR |

**Totale definite in `PnI`: 50** (di cui Money definita due volte — sovrascritta).

### 3.2 Occorrenze d'uso nei file dashboard

| File | Riga | Icona usata | Tipo | Contesto |
|---|---:|---|---|---|
| `panoramica-sidebar.jsx` | 51 | `PnI.Logo` | brand img | header sidebar (logo Fresh.png) |
| `panoramica-sidebar.jsx` | 102, 123 | `PnI[icon]` → `Panoramica` | registry dinamico | voce nav `panoramica` |
| `panoramica-sidebar.jsx` | 102, 123 | `PnI[icon]` → `Calendar` | registry dinamico | voce nav `prenotazioni` |
| `panoramica-sidebar.jsx` | 102, 123 | `PnI[icon]` → `Kitchen` | registry dinamico | voce nav `cucina` |
| `panoramica-sidebar.jsx` | 102, 123 | `PnI[icon]` → `Stats` | registry dinamico | voce nav `statistiche` |
| `panoramica-sidebar.jsx` | 102, 123 | `PnI[icon]` → `Money` | registry dinamico | voce nav `contabilita` |
| `panoramica-sidebar.jsx` | 140, 159 | `PnI[icon]` → `Headset` | registry dinamico | system action `supporto` |
| `panoramica-sidebar.jsx` | 140, 159 | `PnI[icon]` → `Settings` | registry dinamico | system action `impostazioni` |
| `panoramica-header.jsx` | 38 | `PnI.Plus` | registry | button "Aggiungi widget" |
| `panoramica-header.jsx` | 51 | `PnI.Check` | registry | button "Fine" (modalità edit on) |
| `panoramica-header.jsx` | 51 | `PnI.Edit` | registry | button "Personalizza" (modalità edit off) |
| `panoramica-plan-card.jsx` | 25 | `PnI.X` | registry | dismiss plan card |
| `panoramica-plan-card.jsx` | 36 | `PnI.Sparkle` | registry | hero icon plan upgrade |
| `panoramica-notif-bell.jsx` | 87 | `PnI.Bell` | registry | header notification button |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons[n.icon]` → `sparkle` | registry dinamico cross-file | notifica tipo `update` |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons[n.icon]` → `card` | registry dinamico cross-file | notifica tipo `payment` |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons[n.icon]` → `stats` | registry dinamico cross-file | notifica tipo `system` |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons[n.icon]` → `bulb` | registry dinamico cross-file | notifica tipo `tip` |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons[n.icon]` → `receipt` | registry dinamico cross-file | notifica tipo `billing` |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons[n.icon]` → `party` | registry dinamico cross-file | notifica tipo `feature` |
| `panoramica-notif-bell.jsx` | 153 | `BuIcons.bell` | registry fallback | fallback se `n.icon` non risolve |
| `panoramica-widget-catalog.jsx` | 54 | `PnI.X` | registry | drawer close button |
| `panoramica-widget-catalog.jsx` | 63 | `PnI.Search` | registry | input search drawer |
| `panoramica-widgets.jsx` | 18 | `PnI.TrendUp` | registry | delta trend (+) |
| `panoramica-widgets.jsx` | 18 | `PnI.TrendDown` | registry | delta trend (−) |
| `panoramica-widgets.jsx` | 420 | `PnI.Person` | registry | label coperti nelle prenotazioni |
| `panoramica-widgets.jsx` | 570 | `PnI.Star` | registry | rating media stelle |
| `panoramica-widgets.jsx` | 592 | `PnI.Star` | registry | rating per singola recensione |
| `panoramica-widgets.jsx` | 619, 641 | `PnI[a.icon]` → `Calendar` | registry dinamico | azione rapida "Nuova prenotazione" |
| `panoramica-widgets.jsx` | 619, 641 | `PnI[a.icon]` → `Receipt` | registry dinamico | azione rapida "Aggiungi piatto" |
| `panoramica-widgets.jsx` | 619, 641 | `PnI[a.icon]` → `Money` | registry dinamico | azione rapida "Apri cassa serale" |
| `panoramica-widgets.jsx` | 619, 641 | `PnI[a.icon]` → `Table` | registry dinamico | azione rapida "Stampa QR tavolo" |
| `panoramica-grid.jsx` | 65 | `PnI.Drag` | registry | drag handle in widget |
| `panoramica-grid.jsx` | 78 | `PnI.X` | registry | remove widget |
| `panoramica-app.jsx` | 69 | `PnI.Edit` | registry | banner "modalità personalizzazione" |
| `panoramica-app.jsx` | 91 | `PnI.Plus` | registry | empty-state "Aggiungi widget" |

### 3.3 Caratteri usati come "icona" (non SVG)

Solo uno, da segnalare per coerenza visuale ma fuori scope SF se vogliamo mantenerlo come glifo testuale:

| File | Riga | Glifo | Contesto |
|---|---:|---|---|
| `panoramica-widgets.jsx` | 646 | `›` (Unicode) | chevron-right testuale in fondo a ogni "Azione rapida". Suggerimento Fase 3: sostituire con `PnI.ChevronRight` SF per uniformità. |

### 3.4 Icone NON usate ma presenti nel registry

Definite in `PnI` ma mai referenziate nei file dashboard:

`More`, `ChevronRight`, `ChevronDown`, `People`, `Clock`, `Alert`, `Trash`, `Copy`, `Mail`, `Phone`, `Chat`, `Key`, `Lock`, `Info`, `Document`, `Recurring`, `Pin`, `Send`, `Printer`, `Smartphone`, `Wrench`, `Home`, `Cart`, `Eye`, `ResizeHandle`, `Lightning`, `Plate`, `Coin`, `Bag`, `Idea`, `Download`, `FileText`, `QrCode`.

**Decisione da prendere in Fase 3** (te la sottopongo prima di andare avanti):
- (A) re-implementare solo le 22 icone effettivamente usate dalla dashboard
- (B) re-implementare l'intero registry `PnI` (50 voci) per coprire anche usi futuri / altre pagine che vorrai migrare in futuro
- (C) re-implementare le 22 della dashboard + le 6 di `BuIcons` usate dalle notifiche (`sparkle, card, stats, bulb, receipt, party`)

---

## 4. Riepilogo numerico

- **Icone uniche effettivamente usate dalla dashboard**: 22 da `PnI` + 6 da `BuIcons` = **28 simboli SF da disegnare**.
- File dashboard interessati dalla sostituzione (Fase 5): **8** (`panoramica-sidebar.jsx`, `-header.jsx`, `-plan-card.jsx`, `-notif-bell.jsx`, `-widget-catalog.jsx`, `-widgets.jsx`, `-grid.jsx`, `-app.jsx`).
- File registry da introdurre: **1 nuovo** (es. `panoramica-sf-icons.jsx` con `window.SfIcons` + `window.Icon`).
- File registry esistenti da mantenere intatti per il momento: `panoramica-icons.jsx` resta (logo, eventuali pagine non dashboard ne dipendono — `byup Configurazione Completa.html` ad esempio). Da rimuovere solo quando avremo migrato tutto il prodotto.

---

## Domande aperte da risolvere prima di Fase 3

1. **Scope del registry**: opzione A, B o C dal §3.4?
2. **Glifo `›` testuale a riga 646**: lo lasciamo come carattere unicode (più leggero, già allineato al testo) o lo sostituiamo con `Icon name="chevron-right"`?
3. **`PnI.Logo`**: confermi che resta `<img src="Fresh.png">` (è un brand raster, non un'icona del DS)?
4. **Naming**: kebab-case singolare in inglese come da spec (es. `home`, `chevron-right`, `trend-up`) — ok? Le 6 di `BuIcons` rinominate: `sparkle` → `sparkles`, `card` → `credit-card`, `stats` → `chart-bar`, `bulb` → `lightbulb`, `receipt` → `receipt`, `party` → `party-popper`. Confermi questa convention?

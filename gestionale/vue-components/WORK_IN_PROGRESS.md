# Byup Fresh — Vue 3 Migration: Work in Progress

## Obiettivo

Migrazione del gestionale Byup Fresh dai prototipi JSX (React in-browser) a componenti Vue 3 reali, organizzati in un progetto Vite pronto per lo sviluppo e la produzione.

---

## Stato attuale

**Sezione completata: Panoramica (Dashboard)**

---

## Struttura del progetto

```
vue-components/
├── package.json               ← Vite 5 + Vue 3.4 + @vitejs/plugin-vue
├── vite.config.js             ← alias @ → src/
├── index.html                 ← font Inter da Google Fonts
├── public/
│   └── Fresh.png              ← logo per la sidebar
└── src/
    ├── main.js
    ├── App.vue                ← root della Panoramica
    ├── assets/
    │   ├── base.css           ← reset, scrollbar globale
    │   └── glass.css          ← sistema glass completo (animazioni, mesh, dark box)
    ├── tokens/
    │   └── pn.js              ← design tokens (colori, shadow, glass styles)
    ├── data/
    │   ├── widgetCatalog.js   ← catalogo widget + layout di default
    │   └── notifications.js   ← dati notifiche mock
    ├── composables/
    │   └── useModules.js      ← moduli sala/prenotazioni da localStorage (reattivo)
    └── components/
        ├── icons/
        │   └── ByupIcon.vue           ← registry SVG (20+ icone SF-style)
        ├── glass/
        │   ├── GlassMeshSubstrate.vue ← substrato mesh per effetto glass
        │   └── GlassDarkBox.vue       ← box dark (theme: light/night/sunset)
        ├── layout/
        │   ├── PnSidebar.vue          ← sidebar collapsible, nav reattivo ai moduli
        │   ├── PnNavItem.vue          ← voce di navigazione con stato active/badge
        │   ├── PnSysItem.vue          ← voce sistema (supporto/impostazioni)
        │   ├── PnHeader.vue           ← header con titolo, connessione, notifiche
        │   └── PnPageActions.vue      ← tasto Personalizza / Fine / Aggiungi widget
        ├── PnNotifBell.vue            ← campanella dropdown con lista notifiche
        ├── PnConnectionStatus.vue     ← stato connessione (online/instabile/offline)
        ├── PianoEmoji.vue             ← SVG custom per ogni piano (Free/Starter/Plus/Business)
        ├── PnSidebarPlanCard.vue      ← card piano attivo con barra ordini e CTA upgrade
        ├── PnPeriodToggle.vue         ← toggle oggi/settimana/mese
        ├── WSparkline.vue             ← sparkline SVG animata con fill gradient
        ├── PnAddWidgetDrawer.vue      ← drawer laterale per aggiungere widget
        ├── PnWidgetShell.vue          ← shell widget (edit mode, wiggle iOS, drag, resize)
        ├── PnGrid.vue                 ← bento grid 4 colonne con drag-and-drop
        └── widgets/
            ├── WidgetFinancials.vue       ← incassi + scontrino + coperti (auto-switch)
            ├── WidgetIncassi.vue          ← solo incassi con sparkline animata
            ├── WidgetKpiVendita.vue       ← scontrino medio + coperti per periodo
            ├── WidgetRiempimento.vue      ← % occupazione + bar chart fasce orarie
            ├── WidgetPrenotazioniOggi.vue ← lista prenotazioni con auto-scroll continuo
            ├── WidgetTavoliStato.vue      ← griglia stato tavoli (libero/occupato/ecc.)
            ├── WidgetTopPiatti.vue        ← classifica piatti (dark sunset theme)
            ├── WidgetRecensioni.vue       ← ultime recensioni con stelle
            ├── WidgetAzioni.vue           ← launcher 8 shortcut (dark night theme)
            ├── WidgetCopertiSettimana.vue ← bar chart 7 giorni
            └── WidgetCucinaLive.vue       ← ordini in cucina live (dark sunset theme)
```

---

## Scelte tecniche

| Aspetto | Scelta |
|---|---|
| Framework | Vue 3.4 con `<script setup>` (Composition API) |
| Build tool | Vite 5 |
| Stile | Inline styles + CSS globale (`glass.css`, `base.css`) — fedele al prototipo |
| Tokens | Oggetto JS (`pn.js`) importato dove serve |
| Icone | Componente `ByupIcon.vue` con registry SVG interno |
| Widget | Lazy-loaded via `defineAsyncComponent` |
| Stato | `ref` / `computed` locali — nessun store globale per ora |
| Drag & drop | Implementazione custom (mouse events) — no dipendenze esterne |
| Moduli abilitati | `useModules.js` composable con sync localStorage cross-tab |

---

## Funzionalità implementate

- **Sidebar** collassabile con transizione smooth, nav condizionale ai moduli attivi, plan card con tooltip dettaglio ordini e CTA upgrade
- **Header** con stato connessione reale (online/instabile/offline) simulabile al click, e campanella notifiche con dropdown glass
- **Bento grid** 4 colonne, `gridAutoFlow: dense`, drag-and-drop con ghost preview (GLASS_DRAG), wiggle iOS in edit mode
- **Widget shell** con controlli resize (↔ ↕), rimozione, e handle drag — nascosti fuori dall'edit mode
- **Drawer** aggiunta widget con ricerca testuale, filtri per categoria, mini-sketch della dimensione griglia
- **11 widget** completi con dati mock, animazioni, layout adattivo alla dimensione (`size.w`, `size.h`)
- **Sistema glass** completo: mesh substrate, dark box (light/night/sunset), shimmer, lift-hover, pulse-glow, gradient-shift
- **PianoEmoji** SVG custom per i 4 piani Byup

---

## Come avviare

```bash
cd vue-components
npm install
npm run dev
```

Apri `http://localhost:5173` — verrà mostrata la Panoramica completa.

> **Nota:** il logo `Fresh.png` è già presente in `vue-components/public/` e viene mostrato nella sidebar.

---

## Prossimi passi

Le sezioni JSX già prototipate nel progetto originale, da convertire in Vue 3:

| Sezione | File JSX sorgente | Stato |
|---|---|---|
| Panoramica | `panoramica-*.jsx` | ✅ Completata |
| Sala | `sala-*.jsx` | ⬜ Da fare |
| Cucina | `cucina-*.jsx` | ⬜ Da fare |
| Contabilità | `contabilita-v2-*.jsx` | ⬜ Da fare |
| Statistiche | `stat-*.jsx` | ⬜ Da fare |
| Impostazioni | `impostazioni-*.jsx` | ⬜ Da fare |
| Supporto | `supporto-*.jsx` | ⬜ Da fare |
| Account / Profilo | `account-*.jsx` | ⬜ Da fare |
| Onboarding | `onboarding-*.jsx` | ⬜ Da fare |
| Configurazione completa | `config-completa-app.jsx` | ⬜ Da fare |
| Login | `login-app.jsx` | ⬜ Da fare |
| App cameriere (Staff) | `staff-*.jsx` | ⬜ Da fare |

Quando si aggiungeranno nuove sezioni, valutare l'introduzione di **Vue Router** per la navigazione tra pagine e **Pinia** se lo stato condiviso cresce (es. ordini attivi, sessione utente).

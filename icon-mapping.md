# Icon mapping — Byup Fresh Dashboard

Mappatura 1:1 dei simboli esistenti (`PnI`, `BuIcons`) → nuovo registry `SfIcons` (Apple SF Regular Filled).

Ogni voce indica la URL Icons8 di riferimento per QA visivo.

## PnI → SfIcons

| Icona corrente (PnI) | Nuovo nome | Riferimento Icons8 SF Regular Filled |
|---|---|---|
| `PnI.Panoramica` | `grid` | https://icons8.com/icon/set/grid/sf-regular-filled |
| `PnI.Calendar` | `calendar` | https://icons8.com/icon/set/calendar/sf-regular-filled |
| `PnI.Kitchen` | `flame` | https://icons8.com/icon/set/fire/sf-regular-filled |
| `PnI.Stats` | `chart-bar` | https://icons8.com/icon/set/bar-chart/sf-regular-filled |
| `PnI.Money` | `wallet` | https://icons8.com/icon/set/wallet/sf-regular-filled |
| `PnI.Headset` | `headphones` | https://icons8.com/icon/set/headphones/sf-regular-filled |
| `PnI.Settings` | `gear` | https://icons8.com/icon/set/settings/sf-regular-filled |
| `PnI.Search` | `magnifying-glass` | https://icons8.com/icon/set/search/sf-regular-filled |
| `PnI.Bell` | `bell` | https://icons8.com/icon/set/bell/sf-regular-filled |
| `PnI.Plus` | `plus` | https://icons8.com/icon/set/plus/sf-regular-filled |
| `PnI.X` | `xmark` | https://icons8.com/icon/set/close-window/sf-regular-filled |
| `PnI.Drag` | `grip` | https://icons8.com/icon/set/menu-vertical/sf-regular-filled |
| `PnI.Check` | `check` | https://icons8.com/icon/set/checkmark/sf-regular-filled |
| `PnI.Edit` | `pencil` | https://icons8.com/icon/set/edit/sf-regular-filled |
| `PnI.TrendUp` | `arrow-up-right` | https://icons8.com/icon/set/up-right-arrow/sf-regular-filled |
| `PnI.TrendDown` | `arrow-down-right` | https://icons8.com/icon/set/down-right-arrow/sf-regular-filled |
| `PnI.Star` | `star` | https://icons8.com/icon/set/star/sf-regular-filled |
| `PnI.Person` | `person` | https://icons8.com/icon/set/user/sf-regular-filled |
| `PnI.Sparkle` | `sparkles` | https://icons8.com/icon/set/sparkling/sf-regular-filled |
| `PnI.Receipt` | `receipt` | https://icons8.com/icon/set/receipt/sf-regular-filled |
| `PnI.Table` | `table` | https://icons8.com/icon/set/table/sf-regular-filled |
| `PnI.ChevronRight` | `chevron-right` | https://icons8.com/icon/set/chevron-right/sf-regular-filled |
| `PnI.Logo` | **NON migrata** | brand asset raster (`Fresh.png`) — fuori scope |

## BuIcons (notifiche `panoramica-notif-bell.jsx`) → SfIcons

Le notifiche referenziano `BuIcons[n.icon]` per chiave-stringa, quindi la migrazione richiede di mappare le **stringhe** (non i nomi di componente):

| chiave `BuIcons` | nuovo nome `SfIcons` |
|---|---|
| `'sparkle'` | `sparkles` |
| `'card'` | `credit-card` |
| `'stats'` | `chart-bar` |
| `'bulb'` | `lightbulb` |
| `'receipt'` | `receipt` |
| `'party'` | `party-popper` |
| (`bell` fallback) | `bell` |

## Note

- **Naming**: kebab-case singolare in inglese (es. `chevron-right`, `arrow-up-right`).
- **Logo (`Fresh.png`)**: resta `<img>`, è un asset di brand raster non un'icona del DS.
- **Sparkline `<svg>` in `panoramica-widgets.jsx:60`**: visualizzazione dati (path matematico), non un'icona — non viene migrata.
- **Glifo `›` Unicode in `panoramica-widgets.jsx:646`**: sostituito con `<Icon name="chevron-right" />`.
- **Icone definite in `PnI` ma non usate dalla dashboard** (es. `Trash`, `Mail`, `Phone`, `Lock`, `Eye`, `Cart`, `Home`, `QrCode`...): **non incluse** nel nuovo registry per lo scope corrente. Sono aggiungibili quando servono.

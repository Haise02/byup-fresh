# byup — WebApp consumer (prototipo)

Come funziona il prodotto sta nei documenti di riferimento fuori dal repo
([DOCUMENTI.md](../DOCUMENTI.md)): per la webapp, DPT 2.1 e 3.2 (perimetro,
imbuto verso l'app), SFA 3.3 (ordine al tavolo), 3.8 (recupero dell'ordine in
app), 3.9 (asporto), 5.9 (divisione del conto da webapp), 11.6 (sessione del
tavolo, nessun controllo di posizione). Il 5 settembre 2026 (P-162) i file che
qui descrivevano il prodotto sono usciti dopo l'estrazione. Questo file dice
solo com'è fatto il mockup.

## Promemoria

- La webapp serve a ordinare al tavolo e d'asporto e a dividere il conto. Non
  paga, non fa discovery, non ha account, non usa GPS: le funzioni riservate
  all'app restano visibili e vengono intercettate dall'invito a scaricarla
  (App-only gate, `openAppOnly()` → `AppOnlySheet`).
- Tutte le chiamate al backend passano da `window.ByupAPI` (`api.jsx`), oggi
  mock: per collegare il backend si sostituiscono le implementazioni, non la UI.
  `pay()` rifiuta sempre.
- Partecipante webapp nella sessione = flag `isWebApp`.

## Com'è fatto

- Nessun build: `index.html` carica React 18, ReactDOM e Babel Standalone da
  CDN e compila i `.jsx` nel browser; più Leaflet per la mappa della vetrina.
- **Serve un server HTTP, non `file://`**: Babel scarica i `.jsx` via fetch e
  da `file://` Chrome li blocca (schermo bianco). `python3 -m http.server 8000`
  nella cartella, poi `http://localhost:8000/simulator.html` (simulatore) o
  `…/index.html`; dalla radice del monorepo gli stessi URL sono
  `/web/simulator.html` e `/web/index.html`.
- Entry runtime: `index.html` monta `Root` (in `menu.jsx`) su `#menu-root`.
- File: `api.jsx` (layer backend mock, comandi e `subscribe`); `menu.jsx`
  (`Root` con router a hash `#menu` / `#venue` / `#home`, `MenuScreen`,
  `OrderSheet` con `SwipeDishRow` e `SplitPickSheet`, `DishDetailScreen`,
  `HomeScreen`, `OrderRecoverySheet`, App-only gate, `TakeawayHome`);
  `venue.jsx` (vetrina); `dish-art.jsx` (illustrazioni SVG); `index.html`
  (bootstrap, gate tablet, mockup iPhone da desktop); `simulator.html`
  (anteprima multi-dispositivo, switch Tavolo/Asporto e piattaforma
  iOS/Android per la schermata di recupero).
- Modalità: `table` (default, da QR), `venue` (`?from=venue` o referrer,
  persiste in `sessionStorage['byup_menu_from']`), asporto (`?takeaway=1` o
  `sessionStorage['byup_menu_mode']='asporto'`). Override di sviluppo
  `?os=ios|android` per la schermata di recupero.
- Gate tablet: con entrambe le dimensioni della finestra ≥ 600 px la webapp si
  nasconde dietro l'invito a usare un telefono; da browser desktop si apre
  dentro una cornice iPhone 1:1 con selettore del modello, e query e hash
  passano all'iframe. Sono impalcature della demo, non regole di prodotto.
- Dati finti: locale, tavolo, commensali e ordini demo; nessuna persistenza
  oltre `sessionStorage`; l'asporto si scrive in `byup_asporto_webapp` sullo
  stesso dominio e l'app lo recupera davvero con quel codice.

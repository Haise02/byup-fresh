// ─── Geometria della sala — scritta una volta sola ───────────────────────────
//
// Sala e Impostazioni disegnano la stessa sala partendo da dati diversi: là le
// posizioni stanno in una mappa a parte e la griglia è fissa 12×8, qui stanno
// sul tavolo e la griglia dipende dai metri della stanza; là i tavoli si
// uniscono da una modale scegliendo più ospiti in un colpo, qui trascinandone
// uno sull'altro; là gli ostacoli fissi sono bancone-cucina-bagno, qui sono
// l'arredo che il ristoratore sposta.
//
// Quello che NON cambia è la geometria: quanto occupa un tavolo, quando due si
// toccano, come si dispone un'unione, dove finisce chi resta sotto, cosa
// succede girando un gruppo. Prima era scritta due volte, e le due copie erano
// divergute al punto che lo stesso difetto — un'unione che diventava un blocco
// invece di una fila — aveva due cause diverse nelle due schermate.
//
// Regola d'ingresso: qui dentro non entrano oggetti «tavolo». Entrano numeri e
// rettangoli in unità di griglia. Chi chiama traduce i propri dati e riporta
// indietro il risultato — così le differenze fra le due pagine restano dove
// devono stare, cioè nelle pagine.
//
// Le scelte che ogni pagina fa da sé, e che infatti sono parametri:
//   · la griglia (cols, rows)
//   · gli ostacoli fissi (fixture in Sala, arredo in Impostazioni)
//   · dove si ancora la fila di un'unione
//   · quale asse provare per primo (Sala tiene quello del gruppo esistente,
//     Impostazioni parte sempre orizzontale)
//   · l'ordine con cui i membri entrano in fila

// Ingombro in celle di un tavolo, dai posti e da come è girato.
function geoIngombro(posti, orientamento) {
  const p = posti || 4;
  return ttFootprintUnits(p, ttSeatShape(p), orientamento || 'h');
}

function geoSovrappone(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

// Area in comune fra due rettangoli: serve a decidere se un tavolo trascinato
// sta «sopra» un altro abbastanza da proporre l'unione. 0 se non si toccano.
function geoAreaComune(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return (w > 0 && h > 0) ? w * h : 0;
}

const geoAggancia = (v, passo) => Math.round(v / passo) * passo;

// Prima posizione libera per un rettangolo, partendo da dov'è. Espande per
// anelli Chebyshev di raggio r: il check `max(|dx|,|dy|) !== r` salta l'interno
// del quadrato, già visto nei giri precedenti, così ogni candidata si valuta
// una volta sola.
//
// Le misure sono quelle vere, sia del pezzo che si muove sia degli ostacoli: un
// tavolo da 6-8 posti occupa due celle, sopra gli 8 ne occupa tre. Contandoli
// tutti una cella lo sgombero lasciava tavoli accavallati, perché del vicino
// largo si vedeva solo l'angolo.
function geoPostoLibero({ x, y, w, h, ostacoli = [], cols, rows, passo = 0.5 }) {
  const cx = Math.max(0, Math.min(cols - w, geoAggancia(x, passo)));
  const cy = Math.max(0, Math.min(rows - h, geoAggancia(y, passo)));
  const maxR = Math.max(cols, rows);
  for (let r = 0; r <= maxR; r += passo) {
    for (let dx = -r; dx <= r; dx += passo) {
      for (let dy = -r; dy <= r; dy += passo) {
        if (r > 0 && Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = Math.max(0, Math.min(cols - w, geoAggancia(cx + dx, passo)));
        const ny = Math.max(0, Math.min(rows - h, geoAggancia(cy + dy, passo)));
        if (!ostacoli.some(o => geoSovrappone({ x: nx, y: ny, w, h }, o))) return { x: nx, y: ny };
      }
    }
  }
  return null;
}

// Scostamento minimo che porta un insieme di rettangoli dentro la griglia e
// fuori dagli ostacoli, muovendoli tutti insieme. Null se non esiste: chi
// chiama decide se lasciare le cose come stavano.
function geoScostamentoLibero({ rects, ostacoli = [], cols, rows, passo = 0.5 }) {
  if (!rects.length) return { dx: 0, dy: 0 };
  const minX = Math.min(...rects.map(r => r.x)), minY = Math.min(...rects.map(r => r.y));
  const maxX = Math.max(...rects.map(r => r.x + r.w)), maxY = Math.max(...rects.map(r => r.y + r.h));
  for (let r = 0; r <= Math.max(cols, rows); r += passo) {
    for (let dx = -r; dx <= r; dx += passo) {
      for (let dy = -r; dy <= r; dy += passo) {
        if (r > 0 && Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (minX + dx < 0 || maxX + dx > cols || minY + dy < 0 || maxY + dy > rows) continue;
        const libero = rects.every(rr => !ostacoli.some(o =>
          geoSovrappone({ x: rr.x + dx, y: rr.y + dy, w: rr.w, h: rr.h }, o)));
        if (libero) return { dx, dy };
      }
    }
  }
  return null;
}

// ─── L'unione è UNA FILA ─────────────────────────────────────────────────────
// Tutti i membri in linea retta, orizzontale o verticale. Mai a L, mai a
// blocco: è la regola del prodotto, e qui è vera per costruzione perché la
// posizione di ogni membro la decide solo questa funzione.
//
// `membri` arriva GIÀ NELL'ORDINE in cui deve stare in fila — l'ordine è una
// scelta della pagina, non della geometria: [{ id, posti }].
// `ancora` è il punto a cui la fila si aggrappa; se non ci sta, l'origine
// arretra quanto basta invece di lasciare fuori l'ultimo pezzo.
// `assePreferito` è quello che si prova per primo: si passa all'altro solo se
// la fila non entra in quel verso ed entra nell'altro.
//
// Ritorna [{ id, x, y, orientation, w, h }]: l'orientamento è quello della
// fila, riscritto per tutti. Senza, un tavolo rimasto per traverso alzava il
// gruppo di una cella e faceva il blocco.
function geoFila({ membri, ancora, cols, rows, assePreferito = 'h' }) {
  if (!membri.length) return [];
  const lungo = (a) => membri.reduce((s, m) => {
    const d = geoIngombro(m.posti, a);
    return s + (a === 'h' ? d.w : d.h);
  }, 0);
  let asse = assePreferito === 'v' ? 'v' : 'h';
  if (asse === 'h' && lungo('h') > cols && lungo('v') <= rows) asse = 'v';
  else if (asse === 'v' && lungo('v') > rows && lungo('h') <= cols) asse = 'h';

  const totale = lungo(asse);
  const trasvMax = Math.max(...membri.map(m => {
    const d = geoIngombro(m.posti, asse);
    return asse === 'h' ? d.h : d.w;
  }));
  let cursore = asse === 'h'
    ? Math.max(0, Math.min(ancora.x, cols - totale))
    : Math.max(0, Math.min(ancora.y, rows - totale));
  const trasv = asse === 'h'
    ? Math.max(0, Math.min(ancora.y, rows - trasvMax))
    : Math.max(0, Math.min(ancora.x, cols - trasvMax));

  return membri.map(m => {
    const d = geoIngombro(m.posti, asse);
    const x = asse === 'h' ? Math.min(cursore, cols - d.w) : trasv;
    const y = asse === 'h' ? trasv : Math.min(cursore, rows - d.h);
    cursore += asse === 'h' ? d.w : d.h;
    return { id: m.id, x, y, orientation: asse, w: d.w, h: d.h };
  });
}

// Chi è rimasto sotto la fila si sposta nel posto libero più vicino. Gli
// ostacoli sono la fila, i fissi E gli altri estranei: contando solo i primi
// due, chi veniva sgomberato poteva atterrare addosso a un tavolo che stava
// benissimo dov'era. Ritorna { id: {x, y} } solo per quelli che si sono mossi.
function geoSgombera({ fila, estranei = [], ostacoli = [], cols, rows, passo = 0.5 }) {
  const spostati = {};
  const ingombri = new Map(estranei.map(e => [e.id, { x: e.x, y: e.y, w: e.w, h: e.h }]));
  const fissi = [...fila, ...ostacoli];
  estranei.forEach(e => {
    const mio = ingombri.get(e.id);
    if (!fissi.some(r => geoSovrappone(r, mio))) return;
    const altri = estranei.filter(o => o.id !== e.id).map(o => ingombri.get(o.id));
    const posto = geoPostoLibero({
      x: e.x, y: e.y, w: mio.w, h: mio.h,
      ostacoli: [...fissi, ...altri], cols, rows, passo,
    });
    if (!posto) return;
    spostati[e.id] = posto;
    ingombri.set(e.id, { ...posto, w: mio.w, h: mio.h });
  });
  return spostati;
}

// ─── Ruota ───────────────────────────────────────────────────────────────────
// Un tavolo solo gira il proprio ingombro; più tavoli girano di 90° orari
// attorno al loro bounding box — (relX, relY, w, h) → (H − relY − h, relX) —
// così una fila orizzontale diventa verticale e viceversa, restando una fila.
// Poi il pezzo può sforare o accavallarsi: si cerca lo scostamento minimo che
// lo rimette dentro e libero. Se non c'è, si torna null e chi chiama lascia le
// cose come stavano, invece di sovrapporre.
//
// `membri`: [{ id, posti, x, y, orientation }]. Ritorna [{ id, x, y, orientation }]
// oppure null se girare non cambierebbe niente (un quadrato girato è sé stesso).
function geoRuota({ membri, ostacoli = [], cols, rows, passo = 0.5 }) {
  if (!membri.length) return null;
  const gira = (o) => (o === 'v' ? 'h' : 'v');

  let esito;
  if (membri.length === 1) {
    const m = membri[0];
    if (ttSeatShape(m.posti || 4) !== 'rect') return null;
    esito = [{ id: m.id, x: m.x, y: m.y, orientation: gira(m.orientation) }];
  } else {
    const rects = membri.map(m => ({ id: m.id, x: m.x, y: m.y, ...geoIngombro(m.posti, m.orientation) }));
    const minX = Math.min(...rects.map(r => r.x));
    const minY = Math.min(...rects.map(r => r.y));
    const H = Math.max(...rects.map(r => r.y + r.h)) - minY;
    esito = rects.map(r => {
      const m = membri.find(x => x.id === r.id);
      return {
        id: r.id,
        x: geoAggancia(minX + H - (r.y - minY) - r.h, passo),
        y: geoAggancia(minY + (r.x - minX), passo),
        orientation: gira(m.orientation),
      };
    });
  }

  const nuovi = esito.map(e => {
    const m = membri.find(x => x.id === e.id);
    return { ...e, ...geoIngombro(m.posti, e.orientation) };
  });
  const scost = geoScostamentoLibero({ rects: nuovi, ostacoli, cols, rows, passo });
  if (!scost) return null;
  return nuovi.map(n => ({
    id: n.id,
    x: geoAggancia(n.x + scost.dx, passo),
    y: geoAggancia(n.y + scost.dy, passo),
    orientation: n.orientation,
  }));
}

window.geoIngombro = geoIngombro;
window.geoSovrappone = geoSovrappone;
window.geoAreaComune = geoAreaComune;
window.geoPostoLibero = geoPostoLibero;
window.geoScostamentoLibero = geoScostamentoLibero;
window.geoFila = geoFila;
window.geoSgombera = geoSgombera;
window.geoRuota = geoRuota;

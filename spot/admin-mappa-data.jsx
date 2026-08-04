// ════════════════════════════════════════════════════════════════════════════
// MAPPA · dove sta la rete, e dove la usano
// ════════════════════════════════════════════════════════════════════════════
//
// Due strati sulla stessa Italia:
//
//   locali   un punto per locale, dove si trova. Dice dov'è la rete: quali
//            città l'hanno presa, quali sono ancora bianche.
//   accessi  aree colorate per intensità: dove gli utenti aprono l'app. Non è
//            la stessa mappa — un'area può avere pochi locali e molti accessi
//            (domanda scoperta) o il contrario (rete che non viene usata).
//
// Le coordinate sono quelle vere delle città; il contorno è una silhouette
// semplificata in lat/lon, proiettata con la stessa formula dei punti. Non è
// una carta geografica: è un fondo su cui leggere delle posizioni, e siccome
// contorno e punti passano per la stessa proiezione, cadono dove devono.

// Città → [lat, lon]. Solo quelle che compaiono nei dati.
const GEO_CITTA = {
  'Milano':   [45.464, 9.190],
  'Roma':     [41.903, 12.496],
  'Napoli':   [40.852, 14.268],
  'Torino':   [45.070, 7.687],
  'Firenze':  [43.770, 11.256],
  'Bologna':  [44.494, 11.343],
  'Genova':   [44.406, 8.946],
  'Bari':     [41.118, 16.872],
  'Palermo':  [38.116, 13.361],
  'Venezia':  [45.441, 12.316],
  'Verona':   [45.438, 10.993],
  'Bergamo':  [45.698, 9.677],
  'Alba':     [44.700, 8.036],
  'Cuneo':    [44.393, 7.551],
  'Lucca':    [43.844, 10.502],
  'Siena':    [43.318, 11.331],
  'Terni':    [42.563, 12.643],
  'Caserta':  [41.074, 14.333],
  'Salerno':  [40.682, 14.769],
  'Lecce':    [40.352, 18.174],
  'Catania':  [37.507, 15.083],
  'Cagliari': [39.224, 9.122],
};

// Silhouette dell'Italia in lat/lon: penisola, Sicilia, Sardegna. Grossolana
// per scelta — deve dire "Italia" a colpo d'occhio e non rubare attenzione ai
// punti che ci stanno sopra.
const GEO_SAGOME = [
  // penisola — arco alpino, adriatico, tacco, ionio, tirreno, riviera
  [[45.83,6.75],[45.92,7.45],[46.00,8.00],[46.15,8.55],[46.10,9.00],[46.35,9.30],
   [46.50,10.10],[46.62,10.45],[46.75,11.20],[47.00,11.75],[46.85,12.20],[46.65,12.40],
   [46.55,13.10],[46.45,13.65],[46.20,13.60],[45.98,13.50],[45.78,13.60],[45.70,13.75],
   [45.55,13.20],[45.45,12.60],[45.25,12.35],[44.95,12.45],[44.60,12.30],[44.10,12.60],
   [43.90,13.10],[43.62,13.52],[43.15,13.75],[42.65,14.20],[42.20,14.60],[42.05,14.75],
   [41.92,15.20],[41.90,15.70],[41.83,16.18],[41.55,15.90],[41.30,16.30],[41.13,16.87],
   [40.90,17.30],[40.65,17.95],[40.35,18.17],[39.95,18.35],[39.80,18.35],[40.05,17.95],
   [40.40,17.20],[40.30,16.90],[40.15,16.75],[39.90,16.65],[39.60,16.55],[38.95,16.60],
   [38.72,16.55],[38.45,16.10],[38.20,15.95],[37.92,15.65],[38.10,15.55],[38.45,15.75],
   [38.90,16.10],[39.40,16.20],[39.75,15.85],[40.00,15.65],[40.10,15.30],[40.35,14.95],
   [40.60,14.45],[40.75,14.05],[41.05,13.90],[41.25,13.55],[41.42,12.95],[41.60,12.60],
   [41.75,12.25],[42.05,11.80],[42.35,11.50],[42.55,11.15],[42.75,10.85],[43.05,10.55],
   [43.40,10.30],[43.85,10.25],[44.05,9.95],[44.25,9.40],[44.40,8.95],[44.15,8.30],
   [43.90,7.85],[43.78,7.55],[44.15,7.15],[44.45,6.90],[44.85,6.95],[45.20,6.65],[45.50,6.85]],
  // Sicilia
  [[38.12,13.35],[38.20,14.00],[38.10,14.70],[38.25,15.25],[37.95,15.30],[37.50,15.10],
   [37.10,15.30],[36.70,15.10],[36.65,14.65],[36.80,14.05],[37.00,13.20],[37.55,12.65],[38.02,12.55]],
  // Sardegna
  [[41.25,9.25],[41.05,9.55],[40.90,9.65],[40.50,9.75],[40.05,9.70],[39.55,9.65],
   [39.20,9.55],[38.90,8.85],[39.20,8.45],[39.90,8.45],[40.35,8.30],[40.60,8.15],
   [40.90,8.20],[41.10,8.65]],
];

// Proiezione: equirettangolare centrata sull'Italia. Le longitudini si
// accorciano di cos(42°), altrimenti lo stivale viene grasso.
const GEO_BOX = { lat0: 47.3, lat1: 36.4, lon0: 6.3, lon1: 18.8, k: Math.cos(42 * Math.PI / 180) };
const GEO_H = 100;
const GEO_W = +(((GEO_BOX.lon1 - GEO_BOX.lon0) * GEO_BOX.k) / (GEO_BOX.lat0 - GEO_BOX.lat1) * GEO_H).toFixed(2);
const geoXY = (lat, lon) => ({
  x: ((lon - GEO_BOX.lon0) * GEO_BOX.k) / ((GEO_BOX.lon1 - GEO_BOX.lon0) * GEO_BOX.k) * GEO_W,
  y: (GEO_BOX.lat0 - lat) / (GEO_BOX.lat0 - GEO_BOX.lat1) * GEO_H,
});
const GEO_PATHS = GEO_SAGOME.map(poly =>
  poly.map((p, i) => {
    const { x, y } = geoXY(p[0], p[1]);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z'
);

// ─── I punti: un locale, una posizione ──────────────────────────────────────
// Più locali nella stessa città finirebbero sullo stesso pixel: si sparpagliano
// attorno al centro con uno scarto stabile (dipende dall'id, non dal caso), in
// un raggio di pochi chilometri. Restano nella loro città e restano contabili.
const GEO_LOCALI = (window.LOCALI || [])
  .filter(l => GEO_CITTA[l.citta])
  .map((l, i) => {
    const c = GEO_CITTA[l.citta];
    const a = (i * 2.399963) % (Math.PI * 2);          // angolo aureo: niente grumi
    const r = 0.055 + ((i * 37) % 11) / 11 * 0.075;    // ~6–14 km dal centro
    return {
      id: l.id, nome: l.nome, citta: l.citta, tipo: l.tipo,
      stato: l.stato, piano: l.piano,
      ordiniMese: l.ordiniMese || 0,
      ...geoXY(c[0] + r * Math.sin(a) * 0.75, c[1] + r * Math.cos(a)),
    };
  });

// ─── Le aree: dove aprono l'app ─────────────────────────────────────────────
// Un accesso è una sessione: gli utenti di quella città, pesati per quanto la
// usano. Il numero è finto come tutto il resto del mock, ma la forma è quella
// vera — poche città grandi tengono la maggior parte del traffico.
const GEO_ACCESSI = (() => {
  const per = {};
  const tocca = (citta) => {
    if (!per[citta]) per[citta] = { citta, utenti: 0, accessi: 0, attivi: 0 };
    return per[citta];
  };
  // Gli utenti registrati in quella città: le loro sessioni.
  (window.UTENTI || []).forEach(u => {
    if (!GEO_CITTA[u.citta]) return;
    const sessioni = 4 + (u.ordini || 0) * 3 + (u.prenotazioni || 0) * 2 +
      (u.lastSessionDays <= 7 ? 18 : u.lastSessionDays <= 30 ? 7 : 1);
    const a = tocca(u.citta);
    a.utenti += 1;
    a.accessi += sessioni;
    if (u.attivo) a.attivi += 1;
  });
  // Più gli accessi fatti NEI locali di quella città: chi scansiona il QR al
  // tavolo apre l'app lì, non dove si è registrato. È la parte grossa del
  // traffico, ed è quella che distingue una piazza viva da una anagrafica.
  (window.LOCALI || []).forEach(l => {
    if (!GEO_CITTA[l.citta] || l.stato !== 'active') return;
    const quota = (l.qrAdoption == null ? 12 : l.qrAdoption) / 100;
    tocca(l.citta).accessi += Math.round((l.ordiniMese || 0) * quota);
  });
  const righe = Object.values(per).map(a => {
    const c = GEO_CITTA[a.citta];
    const localiQui = GEO_LOCALI.filter(l => l.citta === a.citta).length;
    return { ...a, localiQui, ...geoXY(c[0], c[1]) };
  });
  const max = righe.reduce((m, a) => Math.max(m, a.accessi), 0) || 1;
  return righe
    .map(a => ({ ...a, intensita: a.accessi / max }))
    .sort((a, b) => b.accessi - a.accessi);
})();

window.GEO_CITTA = GEO_CITTA;
window.GEO_PATHS = GEO_PATHS;
window.GEO_W = GEO_W;
window.GEO_H = GEO_H;
window.GEO_LOCALI = GEO_LOCALI;
window.GEO_ACCESSI = GEO_ACCESSI;

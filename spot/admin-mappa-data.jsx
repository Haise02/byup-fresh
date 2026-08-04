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
// Le coordinate sono quelle vere delle città: qui si producono solo punti in
// lat/lon, il disegno lo fa la mappa (admin-mappa.jsx) su tile vere. Niente
// contorni fatti in casa — si zooma, si trascina, e sotto c'è il mondo.

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
      lat: c[0] + r * Math.sin(a) * 0.75,
      lon: c[1] + r * Math.cos(a),
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
    return { ...a, localiQui, lat: c[0], lon: c[1] };
  });
  const max = righe.reduce((m, a) => Math.max(m, a.accessi), 0) || 1;
  return righe
    .map(a => ({ ...a, intensita: a.accessi / max }))
    .sort((a, b) => b.accessi - a.accessi);
})();

// ─── Le regioni, sommate ────────────────────────────────────────────────────
// Il colore dell'area è la somma di quello che succede nelle sue città. Il
// nome arriva dai dati dei locali/utenti ('Emilia-Romagna', 'Sicilia'…) e va
// fatto combaciare con quello dei confini, che è amministrativo e a volte
// bilingue.
const geoNormRegione = (r) => (r || '')
  .split('/')[0].trim().toLowerCase()
  .replace(/[’']/g, "'").replace(/[-\s]+/g, ' ');

const GEO_REGIONE_DI_CITTA = (() => {
  const m = {};
  (window.LOCALI || []).forEach(l => { if (l.citta && l.regione) m[l.citta] = l.regione; });
  (window.UTENTI || []).forEach(u => { if (u.citta && u.regione && !m[u.citta]) m[u.citta] = u.regione; });
  return m;
})();

const GEO_PER_REGIONE = (() => {
  const per = {};
  const tocca = (reg) => {
    const k = geoNormRegione(reg);
    if (!k) return null;
    if (!per[k]) per[k] = { chiave: k, nome: reg, locali: 0, accessi: 0, utenti: 0, citta: new Set() };
    return per[k];
  };
  GEO_LOCALI.forEach(l => {
    const reg = GEO_REGIONE_DI_CITTA[l.citta];
    const a = tocca(reg);
    if (a) { a.locali += 1; a.citta.add(l.citta); }
  });
  GEO_ACCESSI.forEach(c => {
    const reg = GEO_REGIONE_DI_CITTA[c.citta];
    const a = tocca(reg);
    if (a) { a.accessi += c.accessi; a.utenti += c.utenti; a.citta.add(c.citta); }
  });
  const righe = Object.values(per).map(a => ({ ...a, citta: Array.from(a.citta) }));
  const maxAcc = righe.reduce((m, a) => Math.max(m, a.accessi), 0) || 1;
  const out = {};
  righe.forEach(a => { out[a.chiave] = { ...a, intensita: a.accessi / maxAcc }; });
  return out;
})();

window.GEO_CITTA = GEO_CITTA;
window.GEO_PER_REGIONE = GEO_PER_REGIONE;
window.geoNormRegione = geoNormRegione;
window.GEO_LOCALI = GEO_LOCALI;
window.GEO_ACCESSI = GEO_ACCESSI;

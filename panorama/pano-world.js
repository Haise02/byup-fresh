/* ═══════════════════════════════════════════════════════════════════════
   Panorama · il mondo 3D (three.js r128, senza dipendenze extra)

   Trastevere in miniatura: isolati generati con un seme fisso, il Tevere,
   il Gianicolo, il locale al centro con contorno iridescente. Le persone
   in strada sono «persone con l'app aperta»: le onde di reach le
   raggiungono, alcune toccano l'annuncio, poche camminano fino al locale
   (+ coperti). Tre «look»: atlante (card), notte (sfondo a tutto schermo),
   diorama (isola pastello che galleggia). Tre fasce: pranzo, aperitivo,
   cena. Tutti i numeri sono dimostrativi.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const Pano = (window.Pano = window.Pano || {});
  const T = window.THREE;
  if (!T) { Pano.World = null; return; }

  // ─── Utilità ───────────────────────────────────────────────────────────
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const lin = (hex) => new T.Color(hex).convertSRGBToLinear();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  // ─── Palette per look ─────────────────────────────────────────────────
  const LOOKS = {
    atlante: {
      walls: ['#E6CDB0', '#E0BC9E', '#EDDCC4', '#D9B498', '#E8D2C6', '#D6C4AE', '#EFE2D0', '#DDBB9E', '#E4CAB6', '#D8C9B8'],
      roofs: ['#BF8670', '#B47A66', '#C9967F', '#A87160', '#CDA28A', '#BA8A75', '#B9917F'],
      ground: { street: '#CBC4BC', block: '#E5DDD3', court: '#D7CDC1', piazza: '#ECE4D9', park: '#B9C9A0', parkPath: '#DDD5C2', water: '#94C1DB', bank: '#C2B6A7', sand: '#E6DCCD' },
      tree: ['#86A274', '#77976A', '#93AE7D', '#6C8F62', '#8CA978'],
      island: false, ext: 920, spacing: [50, 88], zoneR: 430, people: 560, pawn: 1.35, lot: [11, 25], depth: [15, 20], hK: 1, win: 1, fogK: 1, cam: { d: 480, el: 38, fov: 30, az: -2.25 },
    },
    notte: {
      walls: ['#E4CBAE', '#DDBA9C', '#EBDAC2', '#D6B196', '#E6D0C4', '#D3C1AB', '#EDDFCC', '#DAB89B'],
      roofs: ['#BA8169', '#AF7560', '#C4917A', '#A36C5B', '#C89C84'],
      ground: { street: '#C3BAB0', block: '#DFD4C7', court: '#D0C4B5', piazza: '#E8DECF', park: '#AFC392', parkPath: '#D6CCB4', water: '#86B8D6', bank: '#B8AA98', sand: '#E2D6C2' },
      tree: ['#78996A', '#6A8F5E', '#86A870', '#5F8656'],
      island: false, ext: 980, spacing: [50, 90], zoneR: 440, people: 680, pawn: 1.35, lot: [11, 25], depth: [15, 20], hK: 1, win: 1, fogK: 0.72, cam: { d: 700, el: 26, fov: 30, az: -2.05 },
    },
    diorama: {
      walls: ['#FFF6EC', '#FCEBF5', '#EFF1FF', '#FFF0DE', '#F5EDFF', '#EAF6FF', '#FFEFF0', '#F2FAF4'],
      roofs: ['#F6B3E6', '#B8B6F6', '#BDDFF9', '#FFC7B6', '#D6C2F9', '#F8D2A6', '#C9EBDD'],
      ground: { street: '#E6E0F0', block: '#FBF8FF', court: '#F0EAF9', piazza: '#FFF7EE', park: '#CDEFD7', parkPath: '#EBF7EE', water: '#BCE1F8', bank: '#DCD2EE', sand: '#F7EEDF' },
      tree: ['#A5DFB7', '#8FD3A8', '#B8EAC5', '#9BD8B6'],
      island: true, ext: 280, spacing: [74, 104], zoneR: 210, people: 190, pawn: 2.2, lot: [16, 28], depth: [19, 25], hK: 1.3, win: 1.9, fogK: 1, cam: { d: 1440, el: 34, fov: 22, az: -2.3 },
    },
  };

  // ─── Fasce orarie ──────────────────────────────────────────────────────
  const PRESETS = {
    pranzo: { hemiSky: '#E2EEFF', hemiGround: '#E9DAC6', hemiI: 0.62, sunColor: '#FFF2E2', sunI: 1.0, sunEl: 50, sunAz: -0.35, win: 0.0, lamps: 0.0, beam: 0.22, glow: 0.55, aura: 0.75, fog: '#E9EEF5', fogNear: 520, fogFar: 1500, people: '#5D567B', reach: '#D23FA6', water: '#8DBFDC', day: 1 },
    aperitivo: { hemiSky: '#FFD7E8', hemiGround: '#A487A6', hemiI: 0.55, sunColor: '#FFB089', sunI: 1.05, sunEl: 17, sunAz: -0.2, win: 0.42, lamps: 0.5, beam: 0.65, glow: 0.8, aura: 0.9, fog: '#EFC6CB', fogNear: 480, fogFar: 1400, people: '#4D3F6A', reach: '#E04AAE', water: '#D6B1C3', day: 0.55 },
    cena: { hemiSky: '#4549A0', hemiGround: '#0D0A1C', hemiI: 0.3, sunColor: '#A9B6FF', sunI: 0.3, sunEl: 46, sunAz: 1.2, win: 1.0, lamps: 1.0, beam: 1.0, glow: 1.0, aura: 1.0, fog: '#1E1840', fogNear: 430, fogFar: 1300, people: '#E6E1FF', reach: '#FF9BEA', water: '#26305F', day: 0 },
  };
  // Il diorama resta pastello anche di sera
  const DIORAMA_PRESETS = {
    pranzo: Object.assign({}, PRESETS.pranzo, { hemiSky: '#F1F3FF', hemiGround: '#F4E8F4', hemiI: 0.95, sunI: 0.95, people: '#6E64A8', fog: '#F3F0FA' }),
    aperitivo: Object.assign({}, PRESETS.aperitivo, { hemiSky: '#FFE2F1', hemiGround: '#D6B7D8', hemiI: 0.82, sunI: 0.9, people: '#6A4E93', water: '#D9C2F0', fog: '#F7DCE8' }),
    cena: Object.assign({}, PRESETS.cena, { hemiSky: '#B3AEF2', hemiGround: '#5B4E8E', hemiI: 0.78, sunI: 0.5, sunColor: '#D6D8FF', people: '#FFFFFF', water: '#8890DD', fog: '#6E66A8', win: 0.85 }),
  };

  // Colori dell'iride (lineari) per shader
  const IRIDE = ['#8CC8F5', '#F28DE6', '#D8C8FA', '#8B8FF2', '#9CC0F2'].map((h) => new T.Color(h));
  const IRIDE_INK = ['#7DB8F0', '#E070D8', '#B39CF0', '#6E72EE', '#7FA9EC'].map((h) => new T.Color(h));
  const GLSL_IRIDE = `
    uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
    vec3 iride(float t){
      t = fract(t) * 4.0;
      if (t < 1.0) return mix(uC0, uC1, smoothstep(0.0,1.0,t));
      if (t < 2.0) return mix(uC1, uC2, smoothstep(0.0,1.0,t-1.0));
      if (t < 3.0) return mix(uC2, uC3, smoothstep(0.0,1.0,t-2.0));
      return mix(uC3, uC0, smoothstep(0.0,1.0,t-3.0));
    }`;
  function irideUniforms(ink) {
    const P = ink ? IRIDE_INK : IRIDE;
    return { uC0: { value: P[0].clone() }, uC1: { value: P[1].clone() }, uC2: { value: P[2].clone() }, uC3: { value: P[3].clone() }, uC4: { value: P[4].clone() } };
  }

  // ─── Texture disegnate a mano su canvas ────────────────────────────────
  function facadeTextures() {
    const N = 4, S = 64;
    const a = document.createElement('canvas'); a.width = a.height = N * S;
    const e = document.createElement('canvas'); e.width = e.height = N * S;
    const ca = a.getContext('2d'), ce = e.getContext('2d');
    ca.fillStyle = '#FFFFFF'; ca.fillRect(0, 0, N * S, N * S);
    ce.fillStyle = '#000000'; ce.fillRect(0, 0, N * S, N * S);
    const r = rng(9);
    const lit = ['#FFD7A0', '#FFC57E', '#FFE5C2', '#FFCF91', '#FFB86A'];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = i * S, y = j * S;
      // cornicione leggero tra i piani
      ca.fillStyle = 'rgba(120,96,80,0.10)'; ca.fillRect(x, y + S - 5, S, 3);
      const wx = x + 20, wy = y + 14, ww = 24, wh = 34;
      const kind = r();
      // persiane verdi (aperte ai lati o chiuse)
      if (kind < 0.22) {
        ca.fillStyle = '#5E8366'; ca.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
        ca.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 8; k++) ca.fillRect(wx, wy + 3 + k * 4, ww, 1);
      } else {
        ca.fillStyle = '#4A3F4E'; ca.fillRect(wx, wy, ww, wh);
        ca.fillStyle = 'rgba(255,255,255,0.10)'; ca.fillRect(wx + 2, wy + 2, ww - 4, 6);
        if (kind < 0.62) { ca.fillStyle = '#6B8F70'; ca.fillRect(wx - 9, wy, 8, wh); ca.fillRect(wx + ww + 1, wy, 8, wh); }
        ca.fillStyle = 'rgba(90,70,60,0.35)'; ca.fillRect(wx - 3, wy + wh, ww + 6, 3);
        if (r() < 0.62) {
          const g = ce.createLinearGradient(0, wy, 0, wy + wh);
          const c = lit[Math.floor(r() * lit.length)];
          g.addColorStop(0, c); g.addColorStop(1, '#FF9E57');
          ce.fillStyle = g; ce.fillRect(wx, wy, ww, wh);
        }
      }
    }
    return { albedo: a, emissive: e };
  }
  function radialTexture(stops, size = 128) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach((s) => gr.addColorStop(s[0], s[1]));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    const t = new T.CanvasTexture(c);
    return t;
  }
  function pingTexture() {
    const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d');
    const glow = g.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s / 2);
    glow.addColorStop(0, 'rgba(255,190,245,0.55)'); glow.addColorStop(1, 'rgba(255,190,245,0)');
    g.fillStyle = glow; g.fillRect(0, 0, s, s);
    const lg = g.createLinearGradient(30, 30, 98, 98);
    lg.addColorStop(0, '#CFE8FC'); lg.addColorStop(0.45, '#FCBBF8'); lg.addColorStop(1, '#ACACF8');
    g.fillStyle = lg; g.beginPath(); g.arc(s / 2, s / 2, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(s / 2, s / 2, 9, 0, Math.PI * 2); g.fill();
    return new T.CanvasTexture(c);
  }
  function stripeTexture(colors) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 8;
    const g = c.getContext('2d');
    colors.forEach((col, i) => { g.fillStyle = col; g.fillRect((i * 64) / colors.length, 0, 64 / colors.length, 8); });
    const t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; t.encoding = T.sRGBEncoding;
    return t;
  }

  // ─── Geometria: un box senza fondo, con UV in «finestre» ───────────────
  // Facce laterali in un buffer (facciate), tetto in un altro.
  function GeoBuilder() { this.p = []; this.n = []; this.uv = []; this.c = []; }
  GeoBuilder.prototype.quad = function (a, b, c, d, nrm, uva, col) {
    // a,b,c,d in senso antiorario visto dall'esterno
    const P = this.p, N = this.n, U = this.uv, C = this.c;
    [a, b, c, a, c, d].forEach((v, k) => {
      P.push(v[0], v[1], v[2]); N.push(nrm[0], nrm[1], nrm[2]);
      const u = [uva[0], uva[1], uva[2], uva[0], uva[2], uva[3]][k];
      U.push(u[0], u[1]);
      C.push(col.r, col.g, col.b);
    });
  };
  GeoBuilder.prototype.geometry = function () {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
    g.computeBoundingSphere();
    return g;
  };
  const CELL_W = 4.2, CELL_H = 3.4, N_CELLS = 4;
  function addBox(walls, roofs, b, wallCol, roofCol, uvOff, winK) {
    const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, y0 = b.y || 0, y1 = y0 + b.h;
    const k = winK || 1;
    const fu = (len) => len / (CELL_W * N_CELLS * k), fv = (h) => h / (CELL_H * N_CELLS * k);
    const ou = uvOff[0], ov = uvOff[1];
    const hv = fv(b.h);
    // sud (+z)
    walls.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], [[ou, ov], [ou + fu(b.w), ov], [ou + fu(b.w), ov + hv], [ou, ov + hv]], wallCol);
    // nord (-z)
    walls.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], [[ou + 0.37, ov], [ou + 0.37 + fu(b.w), ov], [ou + 0.37 + fu(b.w), ov + hv], [ou + 0.37, ov + hv]], wallCol);
    // est (+x)
    walls.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], [[ou + 0.61, ov], [ou + 0.61 + fu(b.d), ov], [ou + 0.61 + fu(b.d), ov + hv], [ou + 0.61, ov + hv]], wallCol);
    // ovest (-x)
    walls.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], [[ou + 0.13, ov], [ou + 0.13 + fu(b.d), ov], [ou + 0.13 + fu(b.d), ov + hv], [ou + 0.13, ov + hv]], wallCol);
    // tetto
    roofs.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]], roofCol);
  }
  function addSlab(target, x, z, w, d, y0, h, col, noTop) {
    const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, y1 = y0 + h;
    const u = [[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01]];
    target.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], u, col);
    target.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], u, col);
    target.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], u, col);
    target.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], u, col);
    if (!noTop) target.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], u, col);
  }

  // ─── La città ──────────────────────────────────────────────────────────
  function genCity(lookName) {
    const L = LOOKS[lookName];
    const R = rng(20261024);
    const EXT = L.ext;
    const CB = { x0: -34, x1: 46, z0: -38, z1: 42 }; // isolato centrale: piazza + locale
    function lines(lo, hi) {
      const arr = [];
      let u = hi; while (u < EXT + 60) { arr.push(u); u += L.spacing[0] + R() * (L.spacing[1] - L.spacing[0]); }
      u = lo; while (u > -EXT - 60) { arr.push(u); u -= L.spacing[0] + R() * (L.spacing[1] - L.spacing[0]); }
      return arr.sort((a, b) => a - b);
    }
    const xs = lines(CB.x0 - 6, CB.x1 + 6), zs = lines(CB.z0 - 6, CB.z1 + 6);
    const wx = xs.map((_, i) => (i % 4 === 1 ? 18 : 12)), wz = zs.map((_, i) => (i % 4 === 2 ? 18 : 12));
    // Tevere
    const rp = L.island
      ? [[250, -520], [212, -280], [190, -80], [204, 110], [244, 300], [282, 520]]
      : [[372, -1100], [304, -680], [232, -380], [198, -130], [214, 110], [298, 340], [396, 580], [448, 1100]];
    const curve = new T.CatmullRomCurve3(rp.map((p) => new T.Vector3(p[0], 0, p[1])));
    const riverPts = curve.getSpacedPoints(L.island ? 220 : 420);
    const RW = L.island ? 26 : 34; // metà larghezza del fiume
    function riverDist(x, z) {
      let m = 1e9;
      for (let i = 0; i < riverPts.length; i++) { const p = riverPts[i]; const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z); if (d < m) m = d; }
      return Math.sqrt(m);
    }
    function riverXAt(z) { // x del fiume a una certa z
      let best = riverPts[0], bd = 1e9;
      for (let i = 0; i < riverPts.length; i++) { const d = Math.abs(riverPts[i].z - z); if (d < bd) { bd = d; best = riverPts[i]; } }
      return best.x;
    }
    // Isola: rettangolo arrotondato
    const IS = L.island ? { half: EXT, r: 70 } : null;
    function insideIsland(x, z, m = 0) {
      if (!IS) return true;
      const h = IS.half - m, r = IS.r;
      const ax = Math.abs(x), az = Math.abs(z);
      if (ax > h || az > h) return false;
      if (ax > h - r && az > h - r) { const dx = ax - (h - r), dz = az - (h - r); return dx * dx + dz * dz <= r * r; }
      return true;
    }
    // ponti
    const bridgeZs = (L.island ? [-170, 160] : [-300, 40, 330]).map((zt) => zs.reduce((b, z) => (Math.abs(z - zt) < Math.abs(b - zt) ? z : b), zs[0]));
    const isBridgeZ = (z) => bridgeZs.some((b) => Math.abs(b - z) < 0.01);

    const buildings = [], blocks = [], parks = [], piazzas = [], courts = [];
    const nearCenter = (x, z) => Math.hypot(x, z);
    const parkX = L.island ? -9999 : -520;

    for (let i = 0; i < xs.length - 1; i++) {
      for (let j = 0; j < zs.length - 1; j++) {
        const x0 = xs[i] + wx[i] / 2, x1 = xs[i + 1] - wx[i + 1] / 2;
        const z0 = zs[j] + wz[j] / 2, z1 = zs[j + 1] - wz[j + 1] / 2;
        const W = x1 - x0, Dd = z1 - z0;
        if (W < 14 || Dd < 14) continue;
        const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        if (!insideIsland(cx, cz, 18)) {
          if (L.island && insideIsland(cx, cz, 0)) { const pk = { x0: Math.max(x0, -EXT + 10), x1: Math.min(x1, EXT - 10), z0: Math.max(z0, -EXT + 10), z1: Math.min(z1, EXT - 10), kind: 'parco', edge: true }; if (pk.x1 - pk.x0 > 12 && pk.z1 - pk.z0 > 12) { blocks.push(pk); parks.push(pk); } }
          continue;
        }
        if (Math.abs(cx) > EXT || Math.abs(cz) > EXT) continue;
        const rd = riverDist(cx, cz);
        if (rd < RW + 6) continue;
        const blk = { x0, x1, z0, z1, kind: 'case' };
        const central = x0 <= 0 && x1 >= 0 && z0 <= 0 && z1 >= 0;
        if (central) { blk.kind = 'piazza'; blk.central = true; blocks.push(blk); piazzas.push(blk); continue; }
        if (cx < parkX && !L.island) { blk.kind = 'parco'; blocks.push(blk); parks.push(blk); continue; }
        if (nearCenter(cx, cz) > 140 && R() < (L.island ? 0.05 : 0.035)) { blk.kind = 'piazza'; blocks.push(blk); piazzas.push(blk); continue; }
        blocks.push(blk);
        // lotti lungo il perimetro, cortile al centro
        const depth = Math.min(L.depth[0] + R() * (L.depth[1] - L.depth[0]), Math.min(W, Dd) / 2 - 2);
        const lots = [];
        if (W < 38 || Dd < 38) {
          lots.push({ x0: x0 + 1, x1: x1 - 1, z0: z0 + 1, z1: z1 - 1 });
        } else {
          let x = x0;
          while (x < x1 - 6) { const fw = Math.min(L.lot[0] + R() * (L.lot[1] - L.lot[0]), x1 - x); lots.push({ x0: x, x1: x + fw, z0, z1: z0 + depth }); x += fw; }
          x = x0;
          while (x < x1 - 6) { const fw = Math.min(L.lot[0] + R() * (L.lot[1] - L.lot[0]), x1 - x); lots.push({ x0: x, x1: x + fw, z0: z1 - depth, z1 }); x += fw; }
          let z = z0 + depth;
          while (z < z1 - depth - 6) { const fw = Math.min(L.lot[0] + R() * (L.lot[1] - L.lot[0]), z1 - depth - z); lots.push({ x0, x1: x0 + depth, z0: z, z1: z + fw }); z += fw; }
          z = z0 + depth;
          while (z < z1 - depth - 6) { const fw = Math.min(L.lot[0] + R() * (L.lot[1] - L.lot[0]), z1 - depth - z); lots.push({ x0: x1 - depth, x1, z0: z, z1: z + fw }); z += fw; }
          courts.push({ x0: x0 + depth, x1: x1 - depth, z0: z0 + depth, z1: z1 - depth });
        }
        lots.forEach((lt) => {
          if (R() < 0.05) return; // qualche giardino tra le case
          const w = lt.x1 - lt.x0 - 0.6, d = lt.z1 - lt.z0 - 0.6;
          if (w < 5 || d < 5) return;
          const bx = (lt.x0 + lt.x1) / 2, bz = (lt.z0 + lt.z1) / 2;
          const corners = [[lt.x0, lt.z0], [lt.x1, lt.z0], [lt.x0, lt.z1], [lt.x1, lt.z1]];
          if (corners.some((c) => riverDist(c[0], c[1]) < RW + 14)) return;
          if (corners.some((c) => !insideIsland(c[0], c[1], 8))) return;
          const floors = 3 + Math.floor(R() * 4) + (R() < 0.08 ? 1 : 0);
          const h = (4.2 + floors * CELL_H) * L.hK;
          buildings.push({ x: bx, z: bz, w, d, h, wall: L.walls[Math.floor(R() * L.walls.length)], roof: L.roofs[Math.floor(R() * L.roofs.length)], uv: [Math.floor(R() * 4) / 4, Math.floor(R() * 4) / 4] });
        });
      }
    }

    // Il locale: lato ovest della piazza centrale, fronte a est
    const cb = piazzas.find((p) => p.central) || { x0: CB.x0, x1: CB.x1, z0: CB.z0, z1: CB.z1 };
    const venue = { x: cb.x0 + 11, z: (cb.z0 + cb.z1) / 2, w: 20, d: 22, h: 17.8, wall: L.island ? '#FFF1E6' : '#F1D2A8', roof: L.island ? '#F6B3E6' : '#C9765C', uv: [0.25, 0] };
    // palazzi ai lati della piazza (nord e sud dell'isolato centrale) per incorniciarla
    const pW = cb.x1 - cb.x0;
    [[cb.z0 + 6, 11], [cb.z1 - 6, 11]].forEach(([zz, dd]) => {
      let x = cb.x0 + 22;
      while (x < cb.x1 - 4) { const fw = Math.min(12 + R() * 8, cb.x1 - x); if (fw > 6) buildings.push({ x: x + fw / 2, z: zz, w: fw - 0.6, d: dd, h: (4.2 + (3 + Math.floor(R() * 3)) * CELL_H) * L.hK, wall: L.walls[Math.floor(R() * L.walls.length)], roof: L.roofs[Math.floor(R() * L.roofs.length)], uv: [Math.floor(R() * 4) / 4, 0.5] }); x += fw; }
    });
    // campanile (nord-est della piazza) e una cupola sull'altra riva
    const landmarks = [];
    landmarks.push({ kind: 'campanile', x: cb.x1 + 26, z: cb.z0 - 30 });
    if (!L.island) landmarks.push({ kind: 'cupola', x: 470, z: -250 });
    else landmarks.push({ kind: 'cupola', x: -180, z: -200 });
    // togli le case che si sovrappongono ai landmark
    const clearOf = (lm, r) => (b) => Math.abs(b.x - lm.x) > r + b.w / 2 || Math.abs(b.z - lm.z) > r + b.d / 2;
    let bl = buildings.filter(clearOf(landmarks[0], 8)).filter(clearOf(landmarks[1], 24));

    // rivali nel digest di stasera (case più vicine ai punti scelti)
    const rivalTargets = L.island ? [[-150, 150], [96, -170], [-110, -150]] : [[-170, 190], [112, -228], [-118, -282]];
    const rivals = rivalTargets.map((t) => {
      let best = null, bd = 1e9;
      bl.forEach((b) => { const d = Math.hypot(b.x - t[0], b.z - t[1]); if (d < bd) { bd = d; best = b; } });
      return best;
    }).filter(Boolean);

    // nodi e tratti di strada per le persone
    const nodes = [], nodeIdx = {};
    xs.forEach((x, i) => zs.forEach((z, j) => {
      if (Math.abs(x) > EXT || Math.abs(z) > EXT) return;
      if (!insideIsland(x, z, 14)) return;
      if (riverDist(x, z) < RW + 6 && !isBridgeZ(z)) return;
      nodeIdx[i + ',' + j] = nodes.length;
      nodes.push({ i, j, x, z, adj: [] });
    }));
    nodes.forEach((n, k) => {
      [[1, 0], [0, 1]].forEach(([di, dj]) => {
        const m = nodeIdx[(n.i + di) + ',' + (n.j + dj)];
        if (m === undefined) return;
        const o = nodes[m];
        const mx = (n.x + o.x) / 2, mz = (n.z + o.z) / 2;
        const water = riverDist(mx, mz) < RW + 4;
        if (water && !(dj === 0 && isBridgeZ(n.z))) return;
        n.adj.push(m); o.adj.push(k);
      });
    });
    // nodo più vicino al locale (porta sulla piazza)
    const door = { x: venue.x + venue.w / 2 + 3, z: venue.z };
    let doorNode = 0, dd0 = 1e9;
    nodes.forEach((n, k) => { if (!n.adj.length) return; const d = Math.hypot(n.x - door.x, n.z - door.z); if (d < dd0) { dd0 = d; doorNode = k; } });

    // ponti (geometria)
    const bridges = bridgeZs.map((z) => ({ z, x: riverXAt(z) }));

    return { L, EXT, xs, zs, wx, wz, blocks, parks, piazzas, courts, buildings: bl, venue, door, doorNode, rivals, landmarks, riverPts, RW, riverDist, nodes, bridges, insideIsland, IS, cb };
  }

  // ─── Texture del terreno ───────────────────────────────────────────────
  function groundCanvas(city, size) {
    const { L, EXT } = city;
    const G = L.ground;
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    const k = size / (EXT * 2);
    const X = (x) => (x + EXT) * k, Z = (z) => (z + EXT) * k;
    g.fillStyle = G.street; g.fillRect(0, 0, size, size);
    const rr = (x0, z0, x1, z1, r) => {
      const a = X(x0), b = Z(z0), w = (x1 - x0) * k, h = (z1 - z0) * k, rad = Math.min(r * k, w / 2, h / 2);
      g.beginPath(); g.moveTo(a + rad, b); g.arcTo(a + w, b, a + w, b + h, rad); g.arcTo(a + w, b + h, a, b + h, rad); g.arcTo(a, b + h, a, b, rad); g.arcTo(a, b, a + w, b, rad); g.closePath();
    };
    // marciapiedi/isolati
    city.blocks.forEach((b) => {
      g.fillStyle = b.kind === 'parco' ? G.park : b.kind === 'piazza' ? G.piazza : G.block;
      rr(b.x0, b.z0, b.x1, b.z1, 4); g.fill();
    });
    city.courts.forEach((c2) => { g.fillStyle = G.court; rr(c2.x0 + 1, c2.z0 + 1, c2.x1 - 1, c2.z1 - 1, 3); g.fill(); });
    // piazze: lastricato a cerchi
    city.piazzas.forEach((p) => {
      const cx = X((p.x0 + p.x1) / 2 + (p.central ? 10 : 0)), cz = Z((p.z0 + p.z1) / 2);
      g.strokeStyle = 'rgba(150,130,110,0.16)'; g.lineWidth = Math.max(1, 0.6 * k);
      for (let r = 6; r < 40; r += 5) { g.beginPath(); g.arc(cx, cz, r * k, 0, Math.PI * 2); g.stroke(); }
    });
    // parco: sentieri
    city.parks.forEach((p) => {
      g.strokeStyle = G.parkPath; g.lineWidth = 3 * k; g.lineCap = 'round';
      g.beginPath(); g.moveTo(X(p.x0 + 4), Z(p.z0 + (p.z1 - p.z0) * 0.3)); g.bezierCurveTo(X((p.x0 + p.x1) / 2), Z(p.z0), X((p.x0 + p.x1) / 2), Z(p.z1), X(p.x1 - 4), Z(p.z0 + (p.z1 - p.z0) * 0.7)); g.stroke();
    });
    // fiume: argine, sponda, acqua
    const pts = city.riverPts;
    const stroke = (w, col) => { g.strokeStyle = col; g.lineWidth = w * k; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(X(p.x), Z(p.z)) : g.moveTo(X(p.x), Z(p.z)))); g.stroke(); };
    stroke(city.RW * 2 + 26, G.bank);
    stroke(city.RW * 2 + 6, G.sand);
    stroke(city.RW * 2, G.water);
    // ombra di contatto sotto le case (finta occlusione ambientale):
    // si disegna su un foglio a parte e si sfoca una volta sola
    const ao = document.createElement('canvas'); ao.width = ao.height = size;
    const ag = ao.getContext('2d');
    ag.fillStyle = 'rgb(60,40,40)';
    city.buildings.forEach((b) => { ag.fillRect(X(b.x - b.w / 2 - 1.2), Z(b.z - b.d / 2 - 1.2), (b.w + 2.4) * k, (b.d + 2.4) * k); });
    const v = city.venue; ag.fillRect(X(v.x - v.w / 2 - 1.5), Z(v.z - v.d / 2 - 1.5), (v.w + 3) * k, (v.d + 3) * k);
    g.save();
    g.globalAlpha = 0.3;
    try { g.filter = `blur(${Math.max(1, 2.2 * k).toFixed(1)}px)`; } catch (e) { /* filter non supportato: senza sfocatura */ }
    g.drawImage(ao, 0, 0);
    g.restore();
    // strisce pedonali intorno alla piazza
    g.fillStyle = 'rgba(255,255,255,0.75)';
    const cb = city.cb;
    [[cb.x0 - 6, (cb.z0 + cb.z1) / 2, 'v'], [cb.x1 + 6, (cb.z0 + cb.z1) / 2, 'v'], [(cb.x0 + cb.x1) / 2, cb.z0 - 6, 'h'], [(cb.x0 + cb.x1) / 2, cb.z1 + 6, 'h']].forEach(([x, z, o]) => {
      for (let s = -4; s <= 4; s++) {
        if (o === 'v') g.fillRect(X(x - 4.5), Z(z + s * 1.6), 9 * k, 0.8 * k);
        else g.fillRect(X(x + s * 1.6), Z(z - 4.5), 0.8 * k, 9 * k);
      }
    });
    return c;
  }

  // ─── Il mondo ──────────────────────────────────────────────────────────
  function World(container, opts) {
    opts = opts || {};
    this.container = container;
    this.lookName = opts.look || 'atlante';
    this.L = LOOKS[this.lookName];
    this.presets = this.lookName === 'diorama' ? DIORAMA_PRESETS : PRESETS;
    this.onEvent = opts.onEvent || function () {};
    this.onStats = opts.onStats || function () {};
    this.quality = opts.quality || (window.innerWidth < 760 ? 'low' : 'high');
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.labels = [];
    this.layers = { people: true, rings: true, rivals: false, zone: true };
    this.paused = false;
    this.visible = true;
    this.t = 0;
    this.pulses = [];
    this.nextPulse = 0.6;
    this.stats = { reached: 0, taps: 0, arrivals: 0 };
    this._init();
  }

  World.prototype._init = function () {
    const W = this.container.clientWidth || 800, H = this.container.clientHeight || 520;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 1.75 : 1.25));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.NoToneMapping;
    renderer.shadowMap.enabled = this.quality === 'high';
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new T.Scene();
    this.scene = scene;
    const cam = this.L.cam;
    const camera = new T.PerspectiveCamera(cam.fov, W / H, 10, 6000);
    this.camera = camera;
    this.orbit = { az: cam.az, el: (cam.el * Math.PI) / 180, d: cam.d, tAz: cam.az, tEl: (cam.el * Math.PI) / 180, tD: cam.d, target: new T.Vector3(0, 0, 0) };

    const city = genCity(this.lookName);
    this.city = city;
    if (this.L.island) this.orbit.target.set(0, 0, 0); else this.orbit.target.set(city.venue.x + 18, 0, city.venue.z);
    this.V = new T.Vector3(city.venue.x, 0, city.venue.z);

    // Luci
    this.hemi = new T.HemisphereLight(0xffffff, 0xffffff, 0.7);
    scene.add(this.hemi);
    const sun = new T.DirectionalLight(0xffffff, 1);
    sun.castShadow = renderer.shadowMap.enabled;
    const sc = this.L.island ? 420 : 560;
    sun.shadow.camera.left = -sc; sun.shadow.camera.right = sc; sun.shadow.camera.top = sc; sun.shadow.camera.bottom = -sc;
    sun.shadow.camera.near = 10; sun.shadow.camera.far = 2600;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.6;
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun); scene.add(sun.target);
    this.sun = sun;
    if (!this.L.island) scene.fog = new T.Fog(0xffffff, 800, 2000);

    this._buildGround();
    this._buildBuildings();
    this._buildTrees();
    this._buildVenue();
    this._buildLamps();
    this._buildPeople();
    this._buildZone();
    this._buildPulses();
    this._buildRivals();

    // Fascia iniziale
    this.cur = Object.assign({}, this.presets.pranzo);
    this.setPreset(this._presetForNow(), true);

    this._bindInput();
    this._resizeObs = new ResizeObserver(() => this.resize());
    this._resizeObs.observe(this.container);
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver((e) => { this.visible = e[0].isIntersecting; }, { threshold: 0.01 });
      this._io.observe(this.container);
    }
    this._onVis = () => { this._last = performance.now(); };
    document.addEventListener('visibilitychange', this._onVis);
    this._last = performance.now();
    this._statT = 0;
    const loop = (now) => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this._last) / 1000);
      this._last = now;
      // Pano.worldHold: fermo per un attimo (per esempio durante il passaggio di tema)
      if (this.paused || Pano.worldHold || !this.visible || document.hidden) return;
      this._update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    this._raf = requestAnimationFrame(loop);
  };

  World.prototype._presetForNow = function () {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    if (h >= 11 && h < 16) return 'pranzo';
    if (h >= 16 && h < 19.5) return 'aperitivo';
    return 'cena';
  };

  World.prototype._buildGround = function () {
    const city = this.city, L = this.L, EXT = city.EXT;
    const size = this.quality === 'high' ? 2048 : 1024;
    const tex = new T.CanvasTexture(groundCanvas(city, size));
    tex.encoding = T.sRGBEncoding;
    tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const mat = new T.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
    let geo;
    if (L.island) {
      const h = city.IS.half, r = city.IS.r;
      const s = new T.Shape();
      s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
      s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h);
      geo = new T.ShapeGeometry(s, 24);
      const pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + EXT) / (2 * EXT), (pos.getY(i) + EXT) / (2 * EXT));
      geo.rotateX(-Math.PI / 2);
      // la «zolla» sotto l'isola, a strati pastello
      const slabDepth = 54;
      const ex = new T.ExtrudeGeometry(s, { depth: slabDepth, bevelEnabled: true, bevelThickness: 4, bevelSize: 4, bevelSegments: 3, steps: 6, curveSegments: 24 });
      ex.rotateX(Math.PI / 2);
      const p2 = ex.attributes.position;
      const cols = [];
      const bands = [lin('#FBF8FF'), lin('#F3C8EC'), lin('#D9D3FA'), lin('#F8D9C8'), lin('#C9DDF8')];
      for (let i = 0; i < p2.count; i++) {
        const y = -p2.getY(i); // 0 in alto, slabDepth in basso
        const t = clamp(y / slabDepth, 0, 0.999);
        const band = t < 0.06 ? 0 : 1 + Math.floor(((t - 0.06) / 0.94) * 4);
        const c = bands[Math.min(4, band)];
        cols.push(c.r, c.g, c.b);
      }
      ex.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
      const slab = new T.Mesh(ex, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 }));
      slab.position.y = -4.6;
      slab.receiveShadow = true;
      this.scene.add(slab);
      // ombra morbida sotto l'isola che galleggia
      const shTex = radialTexture([[0, 'rgba(60,40,110,0.34)'], [0.55, 'rgba(60,40,110,0.14)'], [1, 'rgba(60,40,110,0)']], 256);
      const sh = new T.Mesh(new T.PlaneGeometry(EXT * 3.1, EXT * 3.1), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = -170;
      this.scene.add(sh);
      this.islandShadow = sh;
    } else {
      geo = new T.PlaneGeometry(EXT * 2, EXT * 2);
      geo.rotateX(-Math.PI / 2);
    }
    const ground = new T.Mesh(geo, mat);
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.ground = ground;
    // acqua lucida sopra il fiume dipinto
    const RW = city.RW;
    const pts = L.island ? city.riverPts.filter((p) => city.insideIsland(p.x, p.z, RW + 6)) : city.riverPts;
    const pos = [], idx = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
      const nx = -dz / l, nz = dx / l;
      pos.push(pts[i].x + nx * RW, 0.35, pts[i].z + nz * RW, pts[i].x - nx * RW, 0.35, pts[i].z - nz * RW);
      if (i < pts.length - 1) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const wg = new T.BufferGeometry();
    wg.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    wg.setIndex(idx); wg.computeVertexNormals();
    this.waterMat = new T.MeshStandardMaterial({ color: lin('#8DBFDC'), roughness: 0.16, metalness: 0.15, transparent: true, opacity: 0.86 });
    const water = new T.Mesh(wg, this.waterMat);
    this.scene.add(water);
    this.water = water;
    // ponti
    const bridgeMat = new T.MeshStandardMaterial({ color: lin(L.island ? '#F4EEFF' : '#E6DAC6'), roughness: 0.85 });
    city.bridges.forEach((b) => {
      if (!city.insideIsland(b.x, b.z, 20)) return;
      const deck = new T.Mesh(new T.BoxGeometry(RW * 2 + 40, 2.4, 15), bridgeMat);
      deck.position.set(b.x, 1.6, b.z); deck.castShadow = true; deck.receiveShadow = true;
      this.scene.add(deck);
      for (let s = -1; s <= 1; s++) {
        const pier = new T.Mesh(new T.BoxGeometry(4, 4, 15), bridgeMat);
        pier.position.set(b.x + s * (RW * 0.62), -1, b.z); this.scene.add(pier);
      }
    });
  };

  World.prototype._buildBuildings = function () {
    const city = this.city, L = this.L;
    const walls = new GeoBuilder(), roofs = new GeoBuilder(), trims = new GeoBuilder();
    const trimCol = lin(L.island ? '#FFFFFF' : '#F6EBDB');
    city.buildings.forEach((b) => {
      addBox(walls, roofs, b, lin(b.wall), lin(b.roof), b.uv, L.win);
      addSlab(trims, b.x, b.z, b.w + 0.9, b.d + 0.9, b.h - 0.7, 1.3, trimCol, true); // cornicione (parapetto)
    });
    // landmark
    city.landmarks.forEach((lm) => {
      if (lm.kind === 'campanile') {
        const b = { x: lm.x, z: lm.z, w: 9, d: 9, h: 44, uv: [0.5, 0.25] };
        addBox(walls, roofs, b, lin(L.island ? '#FFF4EA' : '#EBCB9C'), lin(L.island ? '#F6B3E6' : '#B9664F'), b.uv);
        addSlab(trims, lm.x, lm.z, 10.4, 10.4, 30, 1.2, trimCol, true);
        const cone = new T.Mesh(new T.ConeGeometry(6.6, 9, 4), new T.MeshStandardMaterial({ color: lin(L.island ? '#F6B3E6' : '#B9664F'), roughness: 0.9 }));
        cone.position.set(lm.x, 44 + 4.5, lm.z); cone.rotation.y = Math.PI / 4; cone.castShadow = true;
        this.scene.add(cone);
      } else {
        const base = { x: lm.x, z: lm.z, w: 46, d: 30, h: 20, uv: [0, 0] };
        addBox(walls, roofs, base, lin(L.island ? '#FFF6EC' : '#EFDCBD'), lin(L.island ? '#D6C2F9' : '#C9886A'), base.uv);
        const drum = new T.Mesh(new T.CylinderGeometry(12, 12, 10, 28), new T.MeshStandardMaterial({ color: lin(L.island ? '#FFF6EC' : '#EAD5B5'), roughness: 0.85 }));
        drum.position.set(lm.x, 25, lm.z); drum.castShadow = true; this.scene.add(drum);
        const dome = new T.Mesh(new T.SphereGeometry(12.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: lin(L.island ? '#BDDFF9' : '#9FA7AE'), roughness: 0.55, metalness: 0.1 }));
        dome.position.set(lm.x, 30, lm.z); dome.castShadow = true; this.scene.add(dome);
        const lant = new T.Mesh(new T.CylinderGeometry(2.4, 2.8, 6, 12), new T.MeshStandardMaterial({ color: lin('#F1E6D6'), roughness: 0.8 }));
        lant.position.set(lm.x, 45, lm.z); this.scene.add(lant);
      }
    });
    const ft = facadeTextures();
    const map = new T.CanvasTexture(ft.albedo); map.wrapS = map.wrapT = T.RepeatWrapping; map.encoding = T.sRGBEncoding;
    map.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const em = new T.CanvasTexture(ft.emissive); em.wrapS = em.wrapT = T.RepeatWrapping; em.encoding = T.sRGBEncoding;
    this.wallMat = new T.MeshStandardMaterial({ map, emissiveMap: em, emissive: new T.Color(0xffffff), emissiveIntensity: 0, vertexColors: true, roughness: 0.93, metalness: 0 });
    this.roofMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    this.trimMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 });
    const wm = new T.Mesh(walls.geometry(), this.wallMat); wm.castShadow = true; wm.receiveShadow = true;
    const rm = new T.Mesh(roofs.geometry(), this.roofMat); rm.castShadow = true; rm.receiveShadow = true;
    const tm = new T.Mesh(trims.geometry(), this.trimMat); tm.castShadow = true; tm.receiveShadow = true;
    this.scene.add(wm, rm, tm);
  };

  World.prototype._buildTrees = function () {
    const city = this.city, L = this.L, R = rng(77);
    const trees = [];
    // lungotevere
    const pts = city.riverPts;
    for (let i = 2; i < pts.length - 2; i += 3) {
      const a = pts[i - 1], b = pts[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
      const nx = -dz / l, nz = dx / l;
      [1, -1].forEach((s) => {
        const x = pts[i].x + nx * (city.RW + 10) * s, z = pts[i].z + nz * (city.RW + 10) * s;
        if (city.bridges.some((br) => Math.abs(br.z - z) < 14)) return;
        if (!city.insideIsland(x, z, 10) || Math.abs(x) > city.EXT - 10 || Math.abs(z) > city.EXT - 10) return;
        trees.push({ x, z, r: 4.6 + R() * 1.4, h: 7 + R() * 2, pine: false });
      });
    }
    // Gianicolo: pini a ombrello
    city.parks.forEach((p) => {
      const n = Math.floor(((p.x1 - p.x0) * (p.z1 - p.z0)) / 260);
      for (let k = 0; k < n; k++) {
        const x = p.x0 + 5 + R() * (p.x1 - p.x0 - 10), z = p.z0 + 5 + R() * (p.z1 - p.z0 - 10);
        if (!city.insideIsland(x, z, 12) || city.riverDist(x, z) < city.RW + 8) continue;
        const pine = R() < 0.55;
        trees.push({ x, z, r: pine ? 7 + R() * 2.5 : 4.5 + R() * 2, h: pine ? 13 + R() * 4 : 6 + R() * 3, pine });
      }
    });
    // cortili e piazze
    city.courts.forEach((c) => { if (R() < 0.45 && c.x1 - c.x0 > 10 && c.z1 - c.z0 > 10) trees.push({ x: (c.x0 + c.x1) / 2 + (R() - 0.5) * 4, z: (c.z0 + c.z1) / 2 + (R() - 0.5) * 4, r: 3.8 + R() * 1.5, h: 6 + R() * 2, pine: false }); });
    city.piazzas.forEach((p) => {
      [[p.x0 + 5, p.z0 + 5], [p.x1 - 5, p.z0 + 5], [p.x0 + 5, p.z1 - 5], [p.x1 - 5, p.z1 - 5]].forEach(([x, z]) => { if (!p.central || x > city.venue.x + 16) trees.push({ x, z, r: 3.6, h: 6.5, pine: false }); });
    });
    const scale = L.island ? 1.25 : 1;
    const canopyGeo = new T.SphereGeometry(1, 12, 9);
    const trunkGeo = new T.CylinderGeometry(0.35, 0.5, 1, 6); trunkGeo.translate(0, 0.5, 0);
    const canopy = new T.InstancedMesh(canopyGeo, new T.MeshStandardMaterial({ roughness: 0.9, metalness: 0 }), trees.length);
    const trunk = new T.InstancedMesh(trunkGeo, new T.MeshStandardMaterial({ color: lin(L.island ? '#D7B9A4' : '#8A6A55'), roughness: 0.9 }), trees.length);
    const m = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), p = new T.Vector3();
    trees.forEach((t, i) => {
      const r = t.r * scale, h = t.h * scale;
      p.set(t.x, h, t.z); sc.set(r, t.pine ? r * 0.42 : r * 0.9, r);
      m.compose(p, q, sc); canopy.setMatrixAt(i, m);
      canopy.setColorAt(i, lin(L.tree[Math.floor(R() * L.tree.length)]));
      p.set(t.x, 0, t.z); sc.set(scale, h - (t.pine ? r * 0.2 : r * 0.6), scale);
      m.compose(p, q, sc); trunk.setMatrixAt(i, m);
    });
    canopy.castShadow = true; canopy.receiveShadow = true; trunk.castShadow = true;
    if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
    this.scene.add(canopy, trunk);
    this.treeMat = canopy.material;
  };

  World.prototype._buildVenue = function () {
    const v = this.city.venue, L = this.L;
    const grp = new T.Group();
    // il palazzo del locale
    const walls = new GeoBuilder(), roofs = new GeoBuilder(), trims = new GeoBuilder();
    addBox(walls, roofs, v, lin(v.wall), lin(v.roof), v.uv, L.win);
    addSlab(trims, v.x, v.z, v.w + 1, v.d + 1, v.h - 0.8, 1.5, lin('#FFF8EE'), true);
    const wm = new T.Mesh(walls.geometry(), this.wallMat); wm.castShadow = true; wm.receiveShadow = true;
    const rm = new T.Mesh(roofs.geometry(), this.roofMat); rm.castShadow = true;
    const tm = new T.Mesh(trims.geometry(), this.trimMat);
    grp.add(wm, rm, tm);
    // tenda a righe sul fronte (est) e dehors in piazza
    const aw = new T.Mesh(new T.BoxGeometry(1.2, 0.5, v.d - 3), new T.MeshStandardMaterial({ map: stripeTexture(['#FFFFFF', '#F7A9E4', '#FFFFFF', '#B7B5F7']), roughness: 0.7 }));
    aw.geometry.rotateZ(-0.5);
    aw.position.set(v.x + v.w / 2 + 2.2, 5.2, v.z);
    aw.scale.set(4.2, 1, 1);
    grp.add(aw);
    const pole = new T.CylinderGeometry(0.18, 0.18, 4.2, 6); pole.translate(0, 2.1, 0);
    const shade = new T.ConeGeometry(2.6, 1.3, 10); shade.translate(0, 4.6, 0);
    const parCols = ['#F6B3E6', '#B8B6F6', '#BDDFF9', '#FFFFFF'];
    let k = 0;
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
      const x = v.x + v.w / 2 + 9 + row * 7.5, z = v.z - 8 + col * 8;
      const pm = new T.Mesh(pole, this.trimMat); pm.position.set(x, 0, z); grp.add(pm);
      const sm = new T.Mesh(shade, new T.MeshStandardMaterial({ color: lin(parCols[k++ % parCols.length]), roughness: 0.6 })); sm.position.set(x, 0, z); sm.castShadow = true; grp.add(sm);
      const tb = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 0.3, 12), this.trimMat); tb.position.set(x, 1.6, z); grp.add(tb);
    }
    // fontana al centro della piazza
    const cb = this.city.cb;
    const fx = (cb.x0 + cb.x1) / 2 + 14, fz = (cb.z0 + cb.z1) / 2;
    const basin = new T.Mesh(new T.CylinderGeometry(6, 6.6, 1.4, 28), new T.MeshStandardMaterial({ color: lin(L.island ? '#FFFFFF' : '#EDE3D2'), roughness: 0.8 }));
    basin.position.set(fx, 0.7, fz); basin.receiveShadow = true; grp.add(basin);
    const fw = new T.Mesh(new T.CylinderGeometry(5.2, 5.2, 0.4, 28), new T.MeshStandardMaterial({ color: lin('#A8D4EE'), roughness: 0.2, metalness: 0.1 }));
    fw.position.set(fx, 1.3, fz); grp.add(fw);
    const spout = new T.Mesh(new T.CylinderGeometry(0.7, 1.1, 4, 10), new T.MeshStandardMaterial({ color: lin('#EDE3D2'), roughness: 0.8 }));
    spout.position.set(fx, 2.6, fz); grp.add(spout);
    this.scene.add(grp);

    // aura iridescente (box poco più grande)
    const auraGeo = new T.BoxGeometry(v.w + 2.4, v.h + 2.4, v.d + 2.4);
    auraGeo.translate(v.x, (v.h + 2.4) / 2 - 0.4, v.z);
    const auraMat = new T.ShaderMaterial({
      uniforms: Object.assign({ uTime: { value: 0 }, uI: { value: 1 }, uH: { value: v.h + 2.4 }, uDay: { value: 0 } }, irideUniforms(false)),
      vertexShader: `
        varying vec3 vN; varying vec3 vP; varying vec3 vV;
        void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vP = position; vN = normalize(normalMatrix * normal); vec4 mv = viewMatrix * wp; vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: GLSL_IRIDE + `
        uniform float uTime; uniform float uI; uniform float uH; uniform float uDay;
        varying vec3 vN; varying vec3 vP; varying vec3 vV;
        void main(){
          float f = pow(1.0 - abs(dot(vN, vV)), 1.6);
          float h = clamp(vP.y / uH, 0.0, 1.0);
          vec3 col = iride(h * 0.9 + uTime * 0.06 + (vP.x + vP.z) * 0.01);
          float a = (0.10 + 0.62 * f) * (1.0 - h * 0.25) * uI;
          col = mix(col, col * vec3(0.78,0.7,0.95), uDay * 0.5);
          gl_FragColor = vec4(col, a);
        }`,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    });
    this.auraMat = auraMat;
    this.scene.add(new T.Mesh(auraGeo, auraMat));
    // spigoli luminosi
    const eg = new T.EdgesGeometry(new T.BoxGeometry(v.w + 0.8, v.h + 0.8, v.d + 0.8));
    eg.translate(v.x, (v.h + 0.8) / 2 - 0.2, v.z);
    this.edgeMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    this.scene.add(new T.LineSegments(eg, this.edgeMat));
    // fascio di luce verso il cielo
    const beamGeo = new T.CylinderGeometry(3.2, 7.5, 260, 32, 1, true); beamGeo.translate(v.x, v.h + 130, v.z);
    this.beamMat = new T.ShaderMaterial({
      uniforms: Object.assign({ uTime: { value: 0 }, uI: { value: 1 } }, irideUniforms(false)),
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: GLSL_IRIDE + `
        uniform float uTime; uniform float uI; varying vec2 vUv;
        void main(){ float a = pow(1.0 - vUv.y, 2.4) * 0.42 * uI; vec3 c = iride(vUv.x + uTime * 0.05 + vUv.y * 0.5); gl_FragColor = vec4(c, a); }`,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    });
    this.scene.add(new T.Mesh(beamGeo, this.beamMat));
    // alone a terra
    const glowTex = radialTexture([[0, 'rgba(252,187,248,0.95)'], [0.35, 'rgba(172,172,248,0.45)'], [1, 'rgba(172,172,248,0)']], 256);
    this.glowMat = new T.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const glow = new T.Mesh(new T.PlaneGeometry(150, 150), this.glowMat);
    glow.rotation.x = -Math.PI / 2; glow.position.set(v.x + 6, 0.6, v.z);
    this.scene.add(glow);
  };

  World.prototype._buildLamps = function () {
    const city = this.city, pos = [];
    const lim = this.L.island ? city.EXT - 16 : 820;
    city.xs.forEach((x, i) => {
      for (let z = -lim; z < lim; z += 34) {
        const xx = x + (city.wx[i] / 2 - 1.5) * ((Math.floor(z / 34) % 2) ? 1 : -1);
        if (Math.hypot(xx, z) > lim || !city.insideIsland(xx, z, 6) || city.riverDist(xx, z) < city.RW + 4) continue;
        pos.push(xx, 6.5, z);
      }
    });
    city.zs.forEach((z, j) => {
      for (let x = -lim; x < lim; x += 34) {
        const zz = z + (city.wz[j] / 2 - 1.5) * ((Math.floor(x / 34) % 2) ? 1 : -1);
        if (Math.hypot(x, zz) > lim || !city.insideIsland(x, zz, 6)) continue;
        const onWater = city.riverDist(x, zz) < city.RW + 4;
        if (onWater && !city.bridges.some((b) => Math.abs(b.z - z) < 0.5)) continue;
        pos.push(x, onWater ? 4.5 : 6.5, zz);
      }
    });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    const tex = radialTexture([[0, 'rgba(255,236,200,1)'], [0.2, 'rgba(255,200,130,0.85)'], [0.55, 'rgba(255,170,90,0.18)'], [1, 'rgba(255,160,80,0)']], 64);
    this.lampMat = new T.PointsMaterial({ size: 26, map: tex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0xffffff, opacity: 0, sizeAttenuation: true });
    this.scene.add(new T.Points(g, this.lampMat));
  };

  // ─── Persone (puntini con l'app aperta) ────────────────────────────────
  World.prototype._buildPeople = function () {
    const city = this.city, L = this.L;
    let n = L.people;
    if (this.quality === 'low') n = Math.round(n * 0.55);
    this.N = n;
    const s = L.pawn;
    const head = new T.SphereGeometry(1.25 * s, 10, 8); head.translate(0, 4.4 * s, 0);
    const body = new T.CylinderGeometry(0.8 * s, 1.45 * s, 3.2 * s, 10); body.translate(0, 1.6 * s, 0);
    const geo = mergeSimple([body, head]);
    this.peopleMat = new T.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new T.InstancedMesh(geo, this.peopleMat, n);
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    this.people = mesh;
    this.scene.add(mesh);
    const R = rng(5);
    const nodes = city.nodes.filter((nd) => nd.adj.length);
    this.P = [];
    for (let i = 0; i < n; i++) {
      const a = nodes[Math.floor(R() * nodes.length)];
      const ai = city.nodes.indexOf(a);
      const b = a.adj[Math.floor(R() * a.adj.length)];
      const side = (R() < 0.5 ? -1 : 1) * (3.2 + R() * 1.6);
      this.P.push({ a: ai, b, t: R(), speed: (5 + R() * 4) * (L.island ? 0.8 : 1), side, state: 0, until: 0, flash: 0, ping: 0, pingMax: 0, path: null, hidden: 0, x: 0, z: 0 });
      mesh.setColorAt(i, new T.Color(0xffffff));
    }
    if (mesh.instanceColor) mesh.instanceColor.setUsage(T.DynamicDrawUsage);
    // notifiche (bollini) sopra le teste
    const pp = new Float32Array(n * 3), pa = new Float32Array(n), ps = new Float32Array(n);
    const pg = new T.BufferGeometry();
    pg.setAttribute('position', new T.BufferAttribute(pp, 3).setUsage(T.DynamicDrawUsage));
    pg.setAttribute('aAlpha', new T.BufferAttribute(pa, 1).setUsage(T.DynamicDrawUsage));
    pg.setAttribute('aSize', new T.BufferAttribute(ps, 1).setUsage(T.DynamicDrawUsage));
    this.pingMat = new T.ShaderMaterial({
      uniforms: { map: { value: pingTexture() }, uScale: { value: 1 } },
      vertexShader: `attribute float aAlpha; attribute float aSize; varying float vA; uniform float uScale;
        void main(){ vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uScale * (420.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D map; varying float vA; void main(){ vec4 c = texture2D(map, gl_PointCoord); float a = c.a * vA; if (a < 0.01) discard; gl_FragColor = vec4(c.rgb, a); }`,
      transparent: true, depthWrite: false, depthTest: true,
    });
    this.pings = new T.Points(pg, this.pingMat);
    this.pings.frustumCulled = false;
    this.scene.add(this.pings);
    // alone sotto le persone (si vede di sera)
    const hp = new Float32Array(n * 3), hc = new Float32Array(n * 3);
    const hg = new T.BufferGeometry();
    hg.setAttribute('position', new T.BufferAttribute(hp, 3).setUsage(T.DynamicDrawUsage));
    hg.setAttribute('color', new T.BufferAttribute(hc, 3).setUsage(T.DynamicDrawUsage));
    const htex = radialTexture([[0, 'rgba(255,255,255,0.9)'], [0.3, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']], 64);
    this.haloMat = new T.PointsMaterial({ size: 20 * L.pawn, map: htex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0, sizeAttenuation: true });
    this.halos = new T.Points(hg, this.haloMat);
    this.halos.frustumCulled = false;
    this.scene.add(this.halos);
    this._m4 = new T.Matrix4(); this._q = new T.Quaternion(); this._v = new T.Vector3(); this._sc = new T.Vector3(1, 1, 1); this._c = new T.Color();
  };
  function mergeSimple(geos) {
    const pos = [], nrm = [], idx = [];
    let off = 0;
    geos.forEach((g) => {
      const gi = g.index ? g : g;
      const p = gi.attributes.position, n = gi.attributes.normal;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nrm.push(n.getX(i), n.getY(i), n.getZ(i)); }
      if (gi.index) for (let i = 0; i < gi.index.count; i++) idx.push(gi.index.getX(i) + off);
      else for (let i = 0; i < p.count; i++) idx.push(i + off);
      off += p.count;
    });
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(nrm, 3));
    g.setIndex(idx);
    return g;
  }

  World.prototype._buildZone = function () {
    const R = this.L.zoneR;
    this.zoneMat = new T.ShaderMaterial({
      uniforms: Object.assign({ uO: { value: 0.8 }, uTime: { value: 0 }, uR: { value: R } }, irideUniforms(false)),
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: GLSL_IRIDE + `
        uniform float uO; uniform float uTime; uniform float uR; varying vec2 vUv;
        void main(){
          vec2 p = vUv * 2.0 - 1.0; float r = length(p);
          float px = 1.0 / uR;
          float edge = smoothstep(1.0 - 3.2*px, 1.0 - 1.6*px, r) * (1.0 - smoothstep(1.0 - 1.0*px, 1.0, r));
          float ang = atan(p.y, p.x);
          float dash = step(0.42, fract(ang * 46.0 / 6.28318 + uTime * 0.04));
          float fill = step(r, 1.0) * 0.045 * (0.6 + 0.4 * r);
          vec3 c = iride(ang / 6.28318 + uTime * 0.03);
          gl_FragColor = vec4(c, (edge * dash * 0.9 + fill) * uO);
        }`,
      transparent: true, depthWrite: false,
    });
    const z = new T.Mesh(new T.PlaneGeometry(R * 2, R * 2), this.zoneMat);
    z.rotation.x = -Math.PI / 2; z.position.set(this.V.x, 0.8, this.V.z);
    this.zone = z;
    this.scene.add(z);
  };

  World.prototype._buildPulses = function () {
    this.pulseMeshes = [];
    for (let i = 0; i < 5; i++) {
      const mat = new T.ShaderMaterial({
        uniforms: Object.assign({ uO: { value: 0 }, uR: { value: 10 }, uTime: { value: 0 }, uW: { value: 5 } }, irideUniforms(false)),
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: GLSL_IRIDE + `
          uniform float uO; uniform float uR; uniform float uTime; uniform float uW; varying vec2 vUv;
          void main(){
            vec2 p = vUv * 2.0 - 1.0; float r = length(p);
            if (r > 1.0) discard;
            float px = 1.0 / uR;
            float edge = smoothstep(1.0 - uW*px, 1.0 - uW*0.25*px, r) * (1.0 - smoothstep(1.0 - uW*0.2*px, 1.0, r));
            float trail = smoothstep(0.35, 1.0, r) * 0.2;
            float ang = atan(p.y, p.x);
            vec3 c = iride(ang / 6.28318 + uTime * 0.06);
            gl_FragColor = vec4(c, (edge + trail) * uO);
          }`,
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      });
      const m = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
      m.rotation.x = -Math.PI / 2; m.position.set(this.V.x, 1.2 + i * 0.05, this.V.z); m.visible = false;
      this.scene.add(m);
      this.pulseMeshes.push(m);
    }
  };

  World.prototype._buildRivals = function () {
    const tex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(230,220,255,0.8)'], [1, 'rgba(200,190,255,0)']], 64);
    this.rivalMat = new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 });
    this.rivalSprites = this.city.rivals.map((b) => {
      const s = new T.Sprite(this.rivalMat); s.position.set(b.x, b.h + 8, b.z); s.scale.set(26, 26, 1);
      this.scene.add(s);
      return s;
    });
    const eg = new T.BufferGeometry();
    const pos = [];
    this.city.rivals.forEach((b) => {
      const e = new T.EdgesGeometry(new T.BoxGeometry(b.w + 0.6, b.h + 0.6, b.d + 0.6));
      const p = e.attributes.position;
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i) + b.x, p.getY(i) + b.h / 2, p.getZ(i) + b.z);
    });
    eg.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    this.rivalEdgeMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    this.scene.add(new T.LineSegments(eg, this.rivalEdgeMat));
    this.rivalI = 0; this.rivalTarget = 0;
  };

  // ─── Fasce ─────────────────────────────────────────────────────────────
  World.prototype.setPreset = function (name, instant) {
    if (!this.presets[name]) return;
    this.presetName = name;
    const to = this.presets[name];
    const from = Object.assign({}, this.cur);
    this._tr = { from, to, t: instant ? 1 : 0, dur: 1.4 };
    if (instant) this._applyPreset(to);
    const night = name === 'cena';
    // a giorno l'iride si somma male sul chiaro: miscela normale e colori pieni
    const blend = night || this.L.island && name !== 'pranzo' ? T.AdditiveBlending : T.NormalBlending;
    [this.auraMat, this.beamMat, this.zoneMat].concat(this.pulseMeshes.map((m) => m.material)).forEach((m) => {
      m.blending = (m === this.zoneMat) ? T.NormalBlending : blend;
      const P = night ? IRIDE : IRIDE_INK;
      ['uC0', 'uC1', 'uC2', 'uC3', 'uC4'].forEach((k, i) => { if (m.uniforms[k]) m.uniforms[k].value.copy(P[i]); });
      m.needsUpdate = true;
    });
    this.edgeMat.color.set(night ? 0xffffff : 0xffffff);
  };
  World.prototype._applyPreset = function (p) {
    this.cur = p;
    this.hemi.color.copy(lin(p.hemiSky)); this.hemi.groundColor.copy(lin(p.hemiGround)); this.hemi.intensity = p.hemiI;
    this.sun.color.copy(lin(p.sunColor)); this.sun.intensity = p.sunI;
    const el = (p.sunEl * Math.PI) / 180;
    const tgt = this.orbit.target;
    this.sun.position.set(tgt.x + Math.cos(p.sunAz) * Math.cos(el) * 900, Math.sin(el) * 900, tgt.z + Math.sin(p.sunAz) * Math.cos(el) * 900);
    this.sun.target.position.copy(tgt);
    if (this.scene.fog) { this.scene.fog.color.copy(lin(this.lookName === 'notte' && p.day < 0.3 ? '#110F2C' : p.fog)); this.scene.fog.near = p.fogNear * this.L.fogK; this.scene.fog.far = p.fogFar * this.L.fogK; }
    this.wallMat.emissiveIntensity = p.win;
    this.lampMat.opacity = p.lamps;
    this.beamMat.uniforms.uI.value = p.beam;
    this.auraMat.uniforms.uI.value = p.aura;
    this.auraMat.uniforms.uDay.value = p.day;
    this.glowMat.opacity = p.glow * (p.day > 0.5 ? 0.55 : 1);
    this.edgeMat.opacity = 0.55 + (1 - p.day) * 0.45;
    this.waterMat.color.copy(lin(p.water));
    this._peopleBase = lin(p.people);
    this._reachCol = lin(p.reach);
    this.pingMat.uniforms.uScale.value = p.day > 0.5 ? 1.15 : 1;
    if (this.haloMat) this.haloMat.opacity = (1 - p.day) * 0.75;
  };
  function mixPreset(a, b, t) {
    const o = {};
    Object.keys(b).forEach((k) => {
      if (typeof b[k] === 'number' && typeof a[k] === 'number') {
        if (k === 'sunAz') { let d = b[k] - a[k]; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; o[k] = a[k] + d * t; }
        else o[k] = lerp(a[k], b[k], t);
      } else if (typeof b[k] === 'string' && b[k][0] === '#' && typeof a[k] === 'string') {
        const ca = new T.Color(a[k]), cb = new T.Color(b[k]);
        o[k] = '#' + ca.lerp(cb, t).getHexString();
      } else o[k] = b[k];
    });
    return o;
  }

  // ─── Input ─────────────────────────────────────────────────────────────
  World.prototype._bindInput = function () {
    const el = this.renderer.domElement;
    const pts = new Map();
    let lastPinch = 0;
    this._idleT = 0;
    const down = (e) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (e.pointerType === 'mouse') el.setPointerCapture(e.pointerId);
      this._idleT = 0; this._dragging = true;
    };
    const move = (e) => {
      if (!pts.has(e.pointerId)) return;
      const p = pts.get(e.pointerId);
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const arr = [...pts.values()];
        const dist = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
        if (lastPinch) this.orbit.tD = clamp(this.orbit.tD * (lastPinch / dist), this.L.cam.d * 0.55, this.L.cam.d * 1.6);
        lastPinch = dist;
        return;
      }
      // in orizzontale ruota; in verticale inclina solo col mouse (col dito lascia scorrere la pagina)
      if (e.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx) * 1.2) return;
      this.orbit.tAz += dx * 0.0055;
      if (e.pointerType === 'mouse') this.orbit.tEl = clamp(this.orbit.tEl + dy * 0.004, 0.42, 1.05);
      this._idleT = 0;
    };
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) lastPinch = 0; if (!pts.size) this._dragging = false; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return; // senza ctrl la rotella fa scorrere la pagina
      e.preventDefault();
      this.orbit.tD = clamp(this.orbit.tD * (1 + e.deltaY * 0.0015), this.L.cam.d * 0.55, this.L.cam.d * 1.6);
      this._idleT = 0;
    }, { passive: false });
    el.addEventListener('dblclick', () => this.recenter());
    this._listeners = { down, move, up };
  };
  World.prototype.zoom = function (dir) { this.orbit.tD = clamp(this.orbit.tD * (dir > 0 ? 0.8 : 1.25), this.L.cam.d * 0.55, this.L.cam.d * 1.6); this._idleT = 0; };
  World.prototype.recenter = function () { const c = this.L.cam; this.orbit.tAz = c.az; this.orbit.tEl = (c.el * Math.PI) / 180; this.orbit.tD = c.d; this._idleT = 0; };
  World.prototype.setLayer = function (k, on) { this.layers[k] = on; if (k === 'zone') this.zone.visible = on; if (k === 'rivals') this.rivalTarget = on ? 1 : 0; };
  World.prototype.setPaused = function (p) { this.paused = p; this._last = performance.now(); };

  // ─── Etichette HTML ancorate al 3D ─────────────────────────────────────
  World.prototype.anchor = function (name) {
    const v = this.city.venue, c = this.city;
    if (name === 'venue') return new T.Vector3(v.x, v.h + 3, v.z);
    if (name === 'door') return new T.Vector3(c.door.x, 6, c.door.z);
    if (name.indexOf('rival') === 0) { const b = c.rivals[Number(name.slice(5))]; return b ? new T.Vector3(b.x, b.h + 14, b.z) : null; }
    if (name === 'zone') { const R = this.L.zoneR; return new T.Vector3(this.V.x - R * 0.62, 2, this.V.z + R * 0.78); }
    if (name === 'tevere') { const p = c.riverPts[Math.floor(c.riverPts.length * (this.L.island ? 0.62 : 0.56))]; return new T.Vector3(p.x, 2, p.z); }
    if (name === 'gianicolo') return this.L.island ? null : new T.Vector3(-700, 2, 60);
    return null;
  };
  World.prototype.addLabel = function (el, anchor, opts) {
    if (!el) return;
    const found = this.labels.find((l) => l.el === el);
    if (found) return found; // React richiama il ref a ogni disegno: una sola registrazione
    const pos = typeof anchor === 'string' ? this.anchor(anchor) : anchor;
    if (!pos) return;
    const rec = { el, pos, opts: opts || {} };
    this.labels.push(rec);
    return rec;
  };
  World.prototype.removeLabel = function (el) { this.labels = this.labels.filter((l) => l.el !== el); };
  World.prototype._placeLabels = function () {
    const W = this.container.clientWidth, H = this.container.clientHeight;
    const v = this._v;
    if (this.labels.some((l) => !l.el.isConnected)) this.labels = this.labels.filter((l) => l.el.isConnected);
    this.labels.forEach((l) => {
      v.copy(l.pos).project(this.camera);
      const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
      const off = v.z > 1 || x < -60 || x > W + 60 || y < -40 || y > H + 40;
      const ax = l.opts.align === 'left' ? '0%' : '-50%';
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${ax}, -100%)`;
      if (l.opts.hidden) { l.el.style.opacity = '0'; return; }
      l.el.style.opacity = off ? '0' : (l.opts.opacity != null ? String(l.opts.opacity) : '1');
    });
  };

  // ─── Simulazione: onde di reach, tocchi, arrivi ────────────────────────
  World.prototype.pulse = function (strong) {
    const m = this.pulseMeshes.find((x) => !x.visible);
    if (!m) return;
    m.visible = true;
    this.pulses.push({ m, r: 8, max: this.L.zoneR * (strong ? 1.02 : 0.98), speed: strong ? this.L.zoneR / 1.5 : this.L.zoneR / 3.8, strong: !!strong, id: Math.random() });
  };
  World.prototype.digest = function () {
    if (this._digesting) return;
    this._digesting = true;
    this.pulse(true);
    this.rivalTarget = 1;
    this.onEvent({ type: 'digest-start' });
    this._digestCount = 0;
    setTimeout(() => {
      this.onEvent({ type: 'digest-end', reached: this._digestCount });
      this._digesting = false;
      if (!this.layers.rivals) this.rivalTarget = 0;
    }, 5200);
  };
  World.prototype._routeTo = function (startNode) {
    const nodes = this.city.nodes, goal = this.city.doorNode;
    const prev = new Int32Array(nodes.length).fill(-1);
    const q = [startNode]; prev[startNode] = startNode;
    while (q.length) {
      const k = q.shift();
      if (k === goal) break;
      nodes[k].adj.forEach((m) => { if (prev[m] === -1) { prev[m] = k; q.push(m); } });
    }
    if (prev[goal] === -1) return null;
    const path = [];
    let k = goal;
    while (k !== startNode) { path.unshift(k); k = prev[k]; }
    return path;
  };
  World.prototype._update = function (dt) {
    this.t += dt;
    const t = this.t;
    // transizione di fascia
    if (this._tr && this._tr.t < 1) {
      this._tr.t = Math.min(1, this._tr.t + dt / this._tr.dur);
      this._applyPreset(mixPreset(this._tr.from, this._tr.to, smooth(this._tr.t)));
    }
    // camera
    const o = this.orbit;
    this._idleT += dt;
    if (!this._dragging && this._idleT > 3.5 && !this.reduced) o.tAz += dt * 0.022;
    o.az += (o.tAz - o.az) * Math.min(1, dt * 4);
    o.el += (o.tEl - o.el) * Math.min(1, dt * 4);
    o.d += (o.tD - o.d) * Math.min(1, dt * 3.5);
    const ce = Math.cos(o.el);
    this.camera.position.set(o.target.x + Math.cos(o.az) * ce * o.d, o.target.y + Math.sin(o.el) * o.d, o.target.z + Math.sin(o.az) * ce * o.d);
    this.camera.lookAt(o.target.x, o.target.y + (this.L.island ? -40 : 0), o.target.z);
    // shader
    this.auraMat.uniforms.uTime.value = t;
    this.beamMat.uniforms.uTime.value = t;
    this.zoneMat.uniforms.uTime.value = t;
    // rivali
    this.rivalI += (this.rivalTarget - this.rivalI) * Math.min(1, dt * 3);
    this.rivalMat.opacity = this.rivalI * (this.cur.day > 0.5 ? 0.7 : 1);
    this.rivalEdgeMat.opacity = this.rivalI * 0.8;
    this.rivalSprites.forEach((s, i) => { const k = 24 + Math.sin(t * 3 + i) * 4; s.scale.set(k, k, 1); });
    // onde
    if (this.layers.rings && !this.reduced) {
      this.nextPulse -= dt;
      if (this.nextPulse <= 0) { this.pulse(false); this.nextPulse = 2.8; }
    }
    const R = this.L.zoneR;
    this.pulses = this.pulses.filter((p) => {
      p.r += p.speed * dt;
      const k = p.r / p.max;
      p.m.scale.set(p.r, p.r, 1);
      p.m.material.uniforms.uR.value = p.r;
      p.m.material.uniforms.uW.value = p.strong ? 9 : 5;
      p.m.material.uniforms.uTime.value = t;
      p.m.material.uniforms.uO.value = (p.strong ? 1.15 : 0.85) * (1 - smooth(clamp((k - 0.55) / 0.45, 0, 1))) * Math.min(1, p.r / 30);
      if (k >= 1) { p.m.visible = false; return false; }
      return true;
    });
    // persone
    const P = this.P, nodes = this.city.nodes, mesh = this.people;
    const m = this._m4, q = this._q, v = this._v, sc = this._sc, col = this._c;
    const pingPos = this.pings.geometry.attributes.position, pingA = this.pings.geometry.attributes.aAlpha, pingS = this.pings.geometry.attributes.aSize;
    const haloPos = this.halos.geometry.attributes.position, haloCol = this.halos.geometry.attributes.color;
    let reachedNow = 0;
    const base = this._peopleBase, reachC = this._reachCol;
    const white = new T.Color(1, 1, 1);
    const vx = this.V.x, vz = this.V.z;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (p.hidden > 0) {
        p.hidden -= dt;
        if (p.hidden <= 0) { const nn = nodes.filter((x) => x.adj.length); const a = nn[Math.floor(Math.random() * nn.length)]; p.a = nodes.indexOf(a); p.b = a.adj[0]; p.t = 0; p.state = 0; p.path = null; }
        sc.set(0.0001, 0.0001, 0.0001); m.compose(v.set(0, -50, 0), q, sc); mesh.setMatrixAt(i, m);
        pingA.setX(i, 0); haloPos.setXYZ(i, 0, -80, 0);
        continue;
      }
      const A = nodes[p.a], B = nodes[p.b];
      const len = Math.hypot(B.x - A.x, B.z - A.z) || 1;
      p.t += (p.speed * (p.state === 3 ? 1.5 : 1) * dt) / len;
      if (p.t >= 1) {
        p.t = 0;
        const prevA = p.a; p.a = p.b;
        if (p.state === 3 && p.path) {
          if (p.path.length) p.b = p.path.shift();
          else { // arrivato al locale
            p.hidden = 14 + Math.random() * 10;
            this.stats.arrivals++;
            this.onEvent({ type: 'arrive', covers: 1 + Math.floor(Math.random() * 4) });
            continue;
          }
        } else {
          const adj = nodes[p.a].adj.filter((x) => x !== prevA);
          p.b = adj.length ? adj[Math.floor(Math.random() * adj.length)] : prevA;
        }
      }
      const A2 = nodes[p.a], B2 = nodes[p.b];
      const dx = B2.x - A2.x, dz = B2.z - A2.z, l2 = Math.hypot(dx, dz) || 1;
      const nx = -dz / l2, nz = dx / l2;
      const x = A2.x + dx * p.t + nx * p.side, z = A2.z + dz * p.t + nz * p.side;
      p.x = x; p.z = z;
      // raggiunto da un'onda?
      const dist = Math.hypot(x - vx, z - vz);
      if (p.state === 0 && dist < R && this.layers.rings) {
        for (let k = 0; k < this.pulses.length; k++) {
          const pu = this.pulses[k];
          if (Math.abs(pu.r - dist) < 14 && p.lastPulse !== pu.id) {
            p.lastPulse = pu.id;
            if (Math.random() < (pu.strong ? 0.96 : 0.5)) {
              p.state = 1; p.until = t + 7 + Math.random() * 5; p.flash = 1; p.ping = 1.7; p.pingMax = 1.7;
              reachedNow++;
              if (pu.strong) this._digestCount++;
              if (Math.random() < (pu.strong ? 0.09 : 0.06)) {
                p.state = 2; p.until = t + 9;
                this.stats.taps++;
                this.onEvent({ type: 'tap', d: Math.round(dist * 2.4) });
                if (Math.random() < 0.42 && dist < R * 0.92) {
                  const path = this._routeTo(p.b);
                  if (path) { p.state = 3; p.path = path; }
                }
              }
            }
            break;
          }
        }
      }
      if ((p.state === 1 || p.state === 2) && t > p.until) p.state = 0;
      // colore
      if (p.state === 0) col.copy(base);
      else col.copy(reachC);
      if (p.flash > 0) { col.lerp(white, p.flash); p.flash = Math.max(0, p.flash - dt * 2.2); }
      mesh.setColorAt(i, col);
      haloPos.setXYZ(i, x, 2.2, z);
      if (this.layers.people) haloCol.setXYZ(i, col.r * 0.8, col.g * 0.7, col.b); else haloCol.setXYZ(i, 0, 0, 0);
      const hop = p.state === 3 ? Math.abs(Math.sin(t * 9 + i)) * 1.2 : 0;
      const s = this.layers.people ? (p.state ? 1.18 : 1) : 0.0001;
      sc.set(s, s, s);
      m.compose(v.set(x, hop, z), q, sc);
      mesh.setMatrixAt(i, m);
      // bollino
      if (p.ping > 0) p.ping = Math.max(0, p.ping - dt);
      const pa = p.state === 3 ? 1 : p.ping > 0 ? Math.min(1, p.ping / 0.4) * Math.min(1, (p.pingMax - p.ping) * 6) : 0;
      pingPos.setXYZ(i, x, 11 * this.L.pawn + (p.pingMax - p.ping) * 3, z);
      pingA.setX(i, this.layers.people ? pa : 0);
      pingS.setX(i, p.state >= 2 ? 15 : 11);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    pingPos.needsUpdate = true; pingA.needsUpdate = true; pingS.needsUpdate = true;
    haloPos.needsUpdate = true; haloCol.needsUpdate = true;
    if (reachedNow) { this.stats.reached += reachedNow; this.onEvent({ type: 'reach', n: reachedNow }); }
    this._statT += dt;
    if (this._statT > 0.5) { this._statT = 0; this.onStats(Object.assign({}, this.stats)); }
    this._placeLabels();
  };

  // Per i test: fa avanzare la simulazione senza disegnare ogni passo
  World.prototype.fastForward = function (sec) {
    const steps = Math.round(sec / 0.05);
    for (let i = 0; i < steps; i++) this._update(0.05);
    this.renderer.render(this.scene, this.camera);
  };

  World.prototype.resize = function () {
    const W = this.container.clientWidth, H = this.container.clientHeight;
    if (!W || !H) return;
    this.renderer.setSize(W, H, false);
    this.camera.aspect = W / H;
    // su schermi stretti allontana un po' la camera
    const narrow = W / H < 0.9;
    this.camera.fov = this.L.cam.fov * (narrow ? 1.35 : 1);
    this.camera.updateProjectionMatrix();
  };
  World.prototype.dispose = function () {
    cancelAnimationFrame(this._raf);
    this._resizeObs && this._resizeObs.disconnect();
    this._io && this._io.disconnect();
    document.removeEventListener('visibilitychange', this._onVis);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => { Object.keys(mm).forEach((k) => { if (mm[k] && mm[k].isTexture) mm[k].dispose(); }); mm.dispose(); }); }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  };

  World.supported = function () {
    try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  };
  World.PRESETS = PRESETS;
  Pano.World = World;
})();

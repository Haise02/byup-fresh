// Icon set for byup Spot Admin — paths-only, single Icon component

const ICON_PATHS = {
  home:          'M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z',
  store:         'M3 8l1-4h16l1 4v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V8z|M5 10v10h14V10|M10 20v-6h4v6',
  users:         'circle:9,8,3.5|M2 21c0-4 3-6 7-6s7 2 7 6|circle:17,9,2.5|M16 15c3 0 6 1.5 6 5',
  user:          'circle:12,8,4|M4 21c0-4 4-7 8-7s8 3 8 7',
  lifebuoy:      'circle:12,12,9|circle:12,12,4|M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19',
  shield:        'M12 3l8 3v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z',
  shieldUser:    'M12 3l8 3v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z|circle:12,11,2.5|M8.5 17.5c.5-2 1.8-3 3.5-3s3 1 3.5 3',
  chart:         'M3 21h18|M6 17V9M11 17V6M16 17v-5M21 17v-9',
  megaphone:     'M3 11v2a2 2 0 0 0 2 2h2l5 4V5L7 9H5a2 2 0 0 0-2 2z|M15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14',
  card:          'rect:2,6,20,13,2|M2 10h20M6 15h4',
  settings:      'circle:12,12,3|M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  search:        'circle:11,11,7|M21 21l-4.5-4.5',
  bell:          'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z|M10 21a2 2 0 0 0 4 0',
  help:          'circle:12,12,9|M9.5 9a2.5 2.5 0 1 1 3.5 2.5c-.8.4-1 .9-1 1.5v.5|circle:12,17,0.6,fill',
  link:          'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1|M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  plus:          'M12 5v14M5 12h14',
  x:             'M6 6l12 12M18 6L6 18',
  check:         'M4 12l5 5L20 6',
  chevronRight:  'M9 6l6 6-6 6',
  chevronDown:   'M6 9l6 6 6-6',
  chevronUp:     'M6 15l6-6 6 6',
  chevronLeft:   'M15 6l-6 6 6 6',
  more:          'circle:5,12,1.4,fill|circle:12,12,1.4,fill|circle:19,12,1.4,fill',
  list:          'M8 6h13M8 12h13M8 18h13|circle:4,6,1,fill|circle:4,12,1,fill|circle:4,18,1,fill',
  mail:          'rect:3,5,18,14,2|M3 7l9 6 9-6',
  phone:         'rect:7,2,10,20,2|M11 18h2',
  send:          'M22 2L11 13|M22 2l-7 20-4-9-9-4 20-7z',
  eye:           'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z|circle:12,12,3',
  copy:          'rect:8,8,12,12,2|M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2',
  paperclip:     'M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8',
  download:      'M12 3v12M7 10l5 5 5-5|M5 21h14',
  filter:        'M3 5h18l-7 9v5l-4 2v-7L3 5z',
  calendar:      'rect:3,5,18,16,2|M3 10h18M8 3v4M16 3v4',
  clock:         'circle:12,12,9|M12 7v5l3 3',
  trendUp:       'M3 17l6-6 4 4 8-8|M14 7h7v7',
  trendDown:     'M3 7l6 6 4-4 8 8|M14 17h7v-7',
  money:         'rect:2,6,20,12,2|circle:12,12,3',
  table:         'rect:3,5,18,14,1|M3 10h18M3 15h18M12 5v14',
  receipt:       'M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3 5 4.5z|M8 8h8M8 12h8M8 16h5',
  fire:          'M12 3c0 3-3 5-3 8a4 4 0 0 0 8 0c0-2-2-3-2-5 2 1 3 3 3 5a6 6 0 0 1-12 0c0-4 4-5 6-8z',
  crown:         'M3 17l2-9 5 5 2-9 2 9 5-5 2 9z|M3 20h18',
  pause:         'rect:6,5,4,14,1|rect:14,5,4,14,1',
  info:          'circle:12,12,9|M12 8v.01M12 11v6',
  alertTriangle: 'M12 3l10 18H2L12 3z|M12 10v4M12 17v.01',
  lock:          'rect:4,11,16,10,2|M8 11V7a4 4 0 0 1 8 0v4',
  filePdf:       'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z|M14 3v6h6|M9 14h6M9 17h4',
  image:         'rect:3,5,18,14,2|circle:9,10,1.5|M21 16l-5-5-9 9',
  monitor:       'rect:2,4,20,13,2|M8 21h8M12 17v4',
  waiter:        'circle:12,5,2|M5 20c1-4 4-6 7-6s6 2 7 6|M3 13h18',
  chat:          'M21 12a8 8 0 1 1-3-6.2L21 4l-1 3.5A8 8 0 0 1 21 12z',
  utensils:      'M6 3v8a2 2 0 0 0 4 0V3M8 11v10|M16 3c-2 0-3 2-3 5s1 4 3 4v9',
  star:          'M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.4 9.4l6-.9L12 3z',
};

// ─── Icone PIENE per la sidebar (stile gestionale). fill=colore, niente stroke;
// i sotto-path con fillRule evenodd creano i "fori" (schermo, persona, ecc.).
const ICON_FILLED = {
  homeFill: 'M11.34 2.6a1 1 0 0 1 1.32 0l8 6.93c.22.19.34.46.34.75V20a2 2 0 0 1-2 2h-4.4a.6.6 0 0 1-.6-.6v-4.9a2 2 0 0 0-4 0v4.9a.6.6 0 0 1-.6.6H5a2 2 0 0 1-2-2v-9.72c0-.29.12-.56.34-.75l8-6.93z',
  storeFill: 'M4.1 3h15.8a1 1 0 0 1 .97.75l.98 3.8a3.1 3.1 0 0 1-3 3.85 3.1 3.1 0 0 1-2.44-1.18 3.1 3.1 0 0 1-4.82.01A3.1 3.1 0 0 1 6.8 11.4a3.1 3.1 0 0 1-3.67-3.65l.98-3.8A1 1 0 0 1 4.1 3z|M5 12.9V20a2 2 0 0 0 2 2h2.6v-5.4a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V22H17a2 2 0 0 0 2-2v-7.1c-.44.13-.9.2-1.4.2-1.06 0-2.04-.35-2.83-.94a4.68 4.68 0 0 1-5.54 0c-.79.59-1.77.94-2.83.94-.49 0-.96-.07-1.4-.2z',
  staffFill: 'M9.2 11.2a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4z|M2 19.3c0-3.3 3.22-5.9 7.2-5.9s7.2 2.6 7.2 5.9c0 .7-.55 1.2-1.22 1.2H3.22A1.21 1.21 0 0 1 2 19.3z|M16.6 11a3.1 3.1 0 0 0 0-6.2c-.34 0-.66.05-.97.15a5.2 5.2 0 0 1 .02 5.9c.3.1.62.15.95.15z|M17.5 13.7c1.4 1.14 2.3 2.76 2.3 4.6 0 .44-.1.85-.3 1.2h1.44c.58 0 1.06-.47 1.06-1.05 0-2.4-1.87-4.34-4.5-4.75z',
  phoneFill: 'M8 1.5h8A2.5 2.5 0 0 1 18.5 4v16a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 20V4A2.5 2.5 0 0 1 8 1.5zm2.2 17.2a.85.85 0 0 0 0 1.7h3.6a.85.85 0 0 0 0-1.7h-3.6z',
  chatFill: 'M12 2.5c5.52 0 10 3.8 10 8.5s-4.48 8.5-10 8.5c-1.2 0-2.35-.18-3.41-.5-1.35.9-3 1.5-4.84 1.5a.66.66 0 0 1-.48-1.12c.83-.86 1.44-1.93 1.68-3.1A8.06 8.06 0 0 1 2 11c0-4.7 4.48-8.5 10-8.5z',
  megaphoneFill: 'M19.8 2.7a1.2 1.2 0 0 1 1.7 1.1v13.4a1.2 1.2 0 0 1-1.7 1.1l-7.3-3.3H6.3A3.3 3.3 0 0 1 3 11.7v-2.4A3.3 3.3 0 0 1 6.3 6h6.2l7.3-3.3z|M6.2 16.3h3.4l.75 3.9a1.2 1.2 0 0 1-1.18 1.4H8a1.2 1.2 0 0 1-1.18-.97l-.62-4.33z',
  // Euro pieno, costruito come il resto della famiglia: forme solide, nessuno
  // stroke. La C e un settore di corona circolare — arco esterno in senso
  // antiorario, arco interno di ritorno — e le due barre sono path a se che si
  // uniscono per sovrapposizione, non fori.
  euroFill: 'M18.73 5.7A8 8 0 1 0 18.73 18.3L16.88 15.94A5 5 0 1 1 16.88 8.06z|M5.85 8.95h7.75a1.25 1.25 0 0 1 0 2.5H5.85a1.25 1.25 0 0 1 0-2.5z|M5.85 12.55h7.75a1.25 1.25 0 0 1 0 2.5H5.85a1.25 1.25 0 0 1 0-2.5z',
  // Indicatore a lancetta: il rischio si misura, non si respinge — uno scudo
  // dice «protetto», un quadrante dice «a che livello siamo». E lo scudo era gia
  // preso da Impostazioni Admin, che nella stessa colonna e a due voci di
  // distanza. Tre forme che si uniscono: corona, lancetta, perno.
  gaugeFill: 'M2.5 16A9.5 9.5 0 0 1 21.5 16L17.2 16A5.2 5.2 0 0 0 6.8 16Z|M17 10.2L13.29 17.11L10.71 14.89Z|M12 13.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z',
  // Tocco accademico. Ogni altra idea per Risorse Umane finiva per contenere
  // una persona — cartellino, scudo, sagoma — e nella colonna ce ne sono gia
  // due: la silhouette umana non e piu un segno distintivo qui. Il tocco ha una
  // sagoma che non somiglia a niente altro nel set, e dice quello che la sezione
  // contiene davvero: il registro della formazione.
  capFill: 'M11.55 2.6a1 1 0 0 1 .9 0l9.1 4.1a.55.55 0 0 1 0 1l-9.1 4.1a1 1 0 0 1-.9 0L2.45 7.7a.55.55 0 0 1 0-1l9.1-4.1z|M6.9 10.55l4.35 1.96a1.8 1.8 0 0 0 1.5 0l4.35-1.96v3.6c0 1.85-2.33 3.15-5.1 3.15s-5.1-1.3-5.1-3.15v-3.6z|M20.95 8.5a.85.85 0 0 1 .85.85v4.35a1.7 1.7 0 1 1-1.7 0V9.35a.85.85 0 0 1 .85-.85z',
  // Lucchetto pieno: corpo con il buco della serratura ricavato per evenodd
  // nello STESSO d — sottotracciati in path separati non si bucherebbero — e
  // l'arco superiore come forma a se, che si unisce per sovrapposizione.
  lockFill: 'M6.5 9.5h11A2.5 2.5 0 0 1 20 12v7.5A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5V12a2.5 2.5 0 0 1 2.5-2.5zM12 13.1a1.9 1.9 0 0 0-.9 3.57V18a.9.9 0 0 0 1.8 0v-1.33A1.9 1.9 0 0 0 12 13.1z|M12 2a5 5 0 0 0-5 5v3h2.6V7a2.4 2.4 0 0 1 4.8 0v3H17V7a5 5 0 0 0-5-5z',
  shieldUserFill: 'M11.6 1.9a1.2 1.2 0 0 1 .8 0l7.2 2.6c.48.17.8.62.8 1.13V11c0 5.13-3.44 9.36-8.06 10.9a1.2 1.2 0 0 1-.68 0C7.04 20.36 3.6 16.13 3.6 11V5.63c0-.51.32-.96.8-1.13l7.2-2.6zM12 7a2.4 2.4 0 1 0 0 4.8A2.4 2.4 0 0 0 12 7zm0 6.2c-2.16 0-4 1.3-4.67 3.13a8.55 8.55 0 0 0 4.67 2.96 8.55 8.55 0 0 0 4.67-2.96C16 14.5 14.16 13.2 12 13.2z',
};

function renderIconParts(spec) {
  return spec.split('|').map((seg, i) => {
    if (seg.startsWith('circle:')) {
      const [cx, cy, r, fill] = seg.slice(7).split(',');
      return <circle key={i} cx={cx} cy={cy} r={r} fill={fill === 'fill' ? 'currentColor' : 'none'} stroke={fill === 'fill' ? 'none' : 'currentColor'}/>;
    }
    if (seg.startsWith('rect:')) {
      const [x, y, w, h, rx] = seg.slice(5).split(',');
      return <rect key={i} x={x} y={y} width={w} height={h} rx={rx || 0}/>;
    }
    return <path key={i} d={seg}/>;
  });
}

const BuIcons = new Proxy({}, {
  get(_, name) {
    const fspec = ICON_FILLED[name];
    if (fspec) {
      return ({ size = 21, color = 'currentColor' }) => (
        <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{display:'inline-block', flexShrink:0, verticalAlign:'middle'}}>
          {fspec.split('|').map((d, i) => <path key={i} d={d} fillRule="evenodd" clipRule="evenodd"/>)}
        </svg>
      );
    }
    const spec = ICON_PATHS[name];
    if (!spec) return () => null;
    return ({ size = 21, color = 'currentColor', strokeWidth = 1.7 }) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block', flexShrink:0, verticalAlign:'middle'}}>
        {renderIconParts(spec)}
      </svg>
    );
  }
});

window.BuIcons = BuIcons;

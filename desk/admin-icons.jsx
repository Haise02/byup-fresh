// Icone di Hubble — paths-only, single Icon component

const ICON_PATHS = {
  home:          'M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z',
  store:         'M3 8l1-4h16l1 4v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V8z|M5 10v10h14V10|M10 20v-6h4v6',
  users:         'circle:9,8,3.5|M2 21c0-4 3-6 7-6s7 2 7 6|circle:17,9,2.5|M16 15c3 0 6 1.5 6 5',
  user:          'circle:12,8,4|M4 21c0-4 4-7 8-7s8 3 8 7',
  lifebuoy:      'circle:12,12,9|circle:12,12,4|M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19',
  shield:        'M12 3l8 3v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z',
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
  crown:         'M3 17l2-9 5 5 2-9 2 9 5-5 2 9z|M3 20h18',
  pause:         'rect:6,5,4,14,1|rect:14,5,4,14,1',
  info:          'circle:12,12,9|M12 8v.01M12 11v6',
  alertTriangle: 'M12 3l10 18H2L12 3z|M12 10v4M12 17v.01',
  lock:          'rect:4,11,16,10,2|M8 11V7a4 4 0 0 1 8 0v4',
  filePdf:       'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z|M14 3v6h6|M9 14h6M9 17h4',
  image:         'rect:3,5,18,14,2|circle:9,10,1.5|M21 16l-5-5-9 9',
  monitor:       'rect:2,4,20,13,2|M8 21h8M12 17v4',
  chat:          'M21 12a8 8 0 1 1-3-6.2L21 4l-1 3.5A8 8 0 0 1 21 12z',
  ticket:        'M4 6h16a1 1 0 0 1 1 1v2.2a2.8 2.8 0 0 0 0 5.6V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.2a2.8 2.8 0 0 0 0-5.6V7a1 1 0 0 1 1-1z|M12 6.8v2M12 11v2M12 15.2v2',
  utensils:      'M6 3v8a2 2 0 0 0 4 0V3M8 11v10|M16 3c-2 0-3 2-3 5s1 4 3 4v9',
  star:          'M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.4 9.4l6-.9L12 3z',
  // Matita e cestino: fino a Chiamata assistenza «modifica» era l'ingranaggio
  // e «elimina» la croce, due segni che nel resto della console vogliono dire
  // «impostazioni» e «chiudi». Su un elenco di FAQ e guide, dove le due azioni
  // stanno affiancate su ogni riga, l'ambiguità si paga a ogni click.
  pencil:        'M4 20h4L18.5 9.5a2.6 2.6 0 0 0-3.7-3.7L4 16.3V20z|M14 7l3.7 3.7',
  trash:         'M4 7h16|M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1z|M6.5 7l.9 12.1a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7|M10.5 11v6M13.5 11v6',

  // ─── Hubble: CRM, marketing, automazioni ─────────────────────────────────
  grid:          'rect:3,3,7.5,7.5,2|rect:13.5,3,7.5,7.5,2|rect:3,13.5,7.5,7.5,2|rect:13.5,13.5,7.5,7.5,2',
  layers:        'M12 3l9 5-9 5-9-5 9-5z|M3 13l9 5 9-5|M3 17.5l9 5 9-5',
  bolt:          'M13.5 2L4 13.5h6.5L10 22l9.5-11.5H13L13.5 2z',
  sparkles:      'M11 3l1.8 4.7L17.5 9.5l-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8L11 3z|M18 14l.9 2.35L21.25 17.25l-2.35.9L18 20.5l-.9-2.35L14.75 17.25l2.35-.9L18 14z',
  flow:          'rect:2.5,4,6,5,1.5|rect:15.5,4,6,5,1.5|rect:9,15,6,5,1.5|M5.5 9v3.5h13V9|M12 12.5V15',
  branch:        'circle:6,5,2.5|circle:6,19,2.5|circle:18,12,2.5|M6 7.5v9|M8.5 5h4a3 3 0 0 1 3 3v1.5|M8.5 19h4a3 3 0 0 0 3-3v-1.5',
  play:          'M7 4.5l12 7.5-12 7.5V4.5z',
  target:        'circle:12,12,9|circle:12,12,5|circle:12,12,1.3,fill',
  globe:         'circle:12,12,9|M3 12h18|M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z',
  tag:           'M3 11.5V4a1 1 0 0 1 1-1h7.5a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7z|circle:7.5,7.5,1.6',
  sliders:       'M4 6h10M18 6h2|M4 12h4M12 12h8|M4 18h10M18 18h2|circle:16,6,2|circle:10,12,2|circle:16,18,2',
  columns:       'rect:3,4,18,16,2|M9 4v16M15 4v16',
  upload:        'M12 20V8M7 13l5-5 5 5|M4 4h16',
  refresh:       'M20 11a8 8 0 1 0-.6 4|M20 5v6h-6',
  code:          'M8.5 8L4 12l4.5 4|M15.5 8l4.5 4-4.5 4|M13.5 5l-3 14',
  type:          'M5 6h14M12 6v13M9 19h6',
  paint:         'M12 3a9 9 0 0 0 0 18c1 0 1.6-.7 1.6-1.5 0-.4-.2-.8-.5-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.4 1.5-1.4H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8z|circle:7.5,10.5,1.2,fill|circle:11,7,1.2,fill|circle:15.5,8.5,1.2,fill',
  cursorClick:   'M9 3v4M4.2 4.2l2.8 2.8M3 9h4|M12.5 12.5l8.5 3-3.6 1.4L15.9 21z',
  smartphone:    'rect:6,2,12,20,3|M10.5 18.5h3',
  split:         'M6 4v6a4 4 0 0 0 4 4h8|M6 20v-6|M15 11l3 3-3 3',
  hourglass:     'M6 3h12M6 21h12|M8 3v3.5c0 2 4 3.5 4 5.5s-4 3.5-4 5.5V21|M16 3v3.5c0 2-4 3.5-4 5.5s4 3.5 4 5.5V21',
  gauge:         'M4 18a9 9 0 1 1 16 0|M12 14l4-4|circle:12,15,1.6,fill',
  bookmark:      'M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z',
  arrowRight:    'M4 12h15M13 6l6 6-6 6',
  arrowLeft:     'M20 12H5M11 6l-6 6 6 6',
  gripDots:      'circle:9,5,1.4,fill|circle:15,5,1.4,fill|circle:9,12,1.4,fill|circle:15,12,1.4,fill|circle:9,19,1.4,fill|circle:15,19,1.4,fill',
  externalLink:  'M14 4h6v6|M20 4l-9 9|M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  save:          'M5 3h11l3 3v15H5V3z|M8 3v6h7V3|M8 14h8v7H8v-7z',
  archive:       'rect:3,4,18,4,1|M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8|M10 12h4',
  users3:        'circle:8,8,3|M2 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5|circle:17,9,2.4|M15.5 14.8c3 .2 5.5 2.2 5.5 5.2',
};

// ─── Icone PIENE per la sidebar (stile gestionale). fill=colore, niente stroke;
// i sotto-path con fillRule evenodd creano i "fori" (schermo, persona, ecc.).
const ICON_FILLED = {
  // Barre di un grafico, piene: la sezione non si chiama più «Dashboard» ma
  // «Analisi Dati», e una casetta non c'entrava più niente — quella diceva
  // «home», e questa non è la home di nessuno, è il posto dove si leggono i
  // numeri.
  chartFill: 'M3.6 13.2h2.6a1.1 1.1 0 0 1 1.1 1.1v6.1a1.1 1.1 0 0 1-1.1 1.1H3.6a1.1 1.1 0 0 1-1.1-1.1v-6.1a1.1 1.1 0 0 1 1.1-1.1z|M9.5 8.6h2.6a1.1 1.1 0 0 1 1.1 1.1v10.7a1.1 1.1 0 0 1-1.1 1.1H9.5a1.1 1.1 0 0 1-1.1-1.1V9.7a1.1 1.1 0 0 1 1.1-1.1z|M15.4 3.4H18a1.1 1.1 0 0 1 1.1 1.1v15.9A1.1 1.1 0 0 1 18 21.5h-2.6a1.1 1.1 0 0 1-1.1-1.1V4.5a1.1 1.1 0 0 1 1.1-1.1z',
  storeFill: 'M4.1 3h15.8a1 1 0 0 1 .97.75l.98 3.8a3.1 3.1 0 0 1-3 3.85 3.1 3.1 0 0 1-2.44-1.18 3.1 3.1 0 0 1-4.82.01A3.1 3.1 0 0 1 6.8 11.4a3.1 3.1 0 0 1-3.67-3.65l.98-3.8A1 1 0 0 1 4.1 3z|M5 12.9V20a2 2 0 0 0 2 2h2.6v-5.4a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V22H17a2 2 0 0 0 2-2v-7.1c-.44.13-.9.2-1.4.2-1.06 0-2.04-.35-2.83-.94a4.68 4.68 0 0 1-5.54 0c-.79.59-1.77.94-2.83.94-.49 0-.96-.07-1.4-.2z',
  staffFill: 'M9.2 11.2a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4z|M2 19.3c0-3.3 3.22-5.9 7.2-5.9s7.2 2.6 7.2 5.9c0 .7-.55 1.2-1.22 1.2H3.22A1.21 1.21 0 0 1 2 19.3z|M16.6 11a3.1 3.1 0 0 0 0-6.2c-.34 0-.66.05-.97.15a5.2 5.2 0 0 1 .02 5.9c.3.1.62.15.95.15z|M17.5 13.7c1.4 1.14 2.3 2.76 2.3 4.6 0 .44-.1.85-.3 1.2h1.44c.58 0 1.06-.47 1.06-1.05 0-2.4-1.87-4.34-4.5-4.75z',
  phoneFill: 'M8 1.5h8A2.5 2.5 0 0 1 18.5 4v16a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 20V4A2.5 2.5 0 0 1 8 1.5zm2.2 17.2a.85.85 0 0 0 0 1.7h3.6a.85.85 0 0 0 0-1.7h-3.6z',
  chatFill: 'M12 2.5c5.52 0 10 3.8 10 8.5s-4.48 8.5-10 8.5c-1.2 0-2.35-.18-3.41-.5-1.35.9-3 1.5-4.84 1.5a.66.66 0 0 1-.48-1.12c.83-.86 1.44-1.93 1.68-3.1A8.06 8.06 0 0 1 2 11c0-4.7 4.48-8.5 10-8.5z',
  // Biglietto con gli scontri laterali e la linea di strappo. La nuvoletta
  // (chatFill) diceva «conversazione»: giusta finché la sezione si chiamava
  // Comunicazioni, sbagliata per una coda di pratiche che si aprono e si
  // chiudono. Gli scontri sono cavati dal contorno stesso — un cerchio
  // sovrapposto in bianco si vedrebbe sul fondo pesca della voce attiva — e
  // la perforazione centrale è un foro evenodd nello stesso path.
  ticketFill: 'M5 5H19A2.5 2.5 0 0 1 21.5 7.5V10.1A1.9 1.9 0 0 0 21.5 13.9V16.5A2.5 2.5 0 0 1 19 19H5A2.5 2.5 0 0 1 2.5 16.5V13.9A1.9 1.9 0 0 0 2.5 10.1V7.5A2.5 2.5 0 0 1 5 5ZM12 7.9a.7.7 0 0 1 .7.7v.8a.7.7 0 0 1-1.4 0v-.8a.7.7 0 0 1 .7-.7zM12 10.9a.7.7 0 0 1 .7.7v.8a.7.7 0 0 1-1.4 0v-.8a.7.7 0 0 1 .7-.7zM12 13.9a.7.7 0 0 1 .7.7v.8a.7.7 0 0 1-1.4 0v-.8a.7.7 0 0 1 .7-.7z',
  megaphoneFill: 'M19.8 2.7a1.2 1.2 0 0 1 1.7 1.1v13.4a1.2 1.2 0 0 1-1.7 1.1l-7.3-3.3H6.3A3.3 3.3 0 0 1 3 11.7v-2.4A3.3 3.3 0 0 1 6.3 6h6.2l7.3-3.3z|M6.2 16.3h3.4l.75 3.9a1.2 1.2 0 0 1-1.18 1.4H8a1.2 1.2 0 0 1-1.18-.97l-.62-4.33z',
  // Cuffia con microfono per Chiamata assistenza. Lo smartphone (phoneFill) è
  // già di Utenti App e la cornetta da sola direbbe «telefonata», non
  // «qualcuno dall'altra parte che risponde». Cinque forme che si uniscono per
  // sovrapposizione: archetto, due padiglioni, braccio e capsula.
  headsetFill: 'M2.4 13.6A9.6 9.6 0 0 1 21.6 13.6H19.8A7.8 7.8 0 0 0 4.2 13.6Z|M2.4 14.2a2.5 2.5 0 0 1 5 0v3.2a2.5 2.5 0 0 1-5 0z|M16.6 14.2a2.5 2.5 0 0 1 5 0v3.2a2.5 2.5 0 0 1-5 0z|M19.1 18.6h2.5v1.6a2.3 2.3 0 0 1-2.3 2.3h-4a1.25 1.25 0 0 1 0-2.5h2.55a1.25 1.25 0 0 0 1.25-1.25z|M15.3 19.3a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8z',

  // ─── Hubble ────────────────────────────────────────────────────────────────
  // Le voci nuove della nav. Stessa famiglia: forme piene, nessuno stroke, i
  // dettagli interni sono FORI (evenodd) nello stesso tracciato — un pallino
  // bianco sovrapposto si vedrebbe sul fondo rosa della voce attiva.

  // Elenchi: tre righe con il pallino di spunta a sinistra. È una LISTA di
  // contatti, e la lista si riconosce dai suoi elementi in fila.
  listFill: 'circle:4.6,6.3,2.1|rect:9.2,4.7,12.2,3.2,1.6|circle:4.6,12,2.1|rect:9.2,10.4,12.2,3.2,1.6|circle:4.6,17.7,2.1|rect:9.2,16.1,12.2,3.2,1.6',

  // Mail: corpo e lembo, due forme che si incastrano. La V del lembo è il
  // profilo del corpo, non una linea disegnata sopra.
  mailFill: 'M2.6 7.75 11.35 13.6a1.15 1.15 0 0 0 1.3 0l8.75-5.85V17.1a2.6 2.6 0 0 1-2.6 2.6H5.2a2.6 2.6 0 0 1-2.6-2.6z|M5.2 4.3h13.6a2.6 2.6 0 0 1 2.5 1.9L12 12.4 2.7 6.2a2.6 2.6 0 0 1 2.5-1.9z',

  // SMS: la nuvoletta con i tre puntini bucati dentro. La nuvoletta liscia
  // (chatFill) è già dell'Assistenza: qui i puntini dicono «messaggio scritto».
  smsFill: 'M12 3.1c5.3 0 9.6 3.5 9.6 7.9 0 4.35-4.3 7.9-9.6 7.9-.92 0-1.82-.11-2.67-.31-1.58 1.2-3.55 1.96-5.32 1.96a.62.62 0 0 1-.45-1.05c.83-.87 1.4-1.9 1.65-2.98A8.1 8.1 0 0 1 2.4 11c0-4.4 4.3-7.9 9.6-7.9zM7.7 9.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm4.3 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm4.3 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z',

  // Push: campanella piena e battacchio staccato. È la notifica che ARRIVA,
  // non la campanella delle notifiche di sistema (tolta dall'header).
  bellFill: 'M12 2a6.8 6.8 0 0 0-6.8 6.8c0 4.3-.93 6.06-1.9 7.24A1.06 1.06 0 0 0 4.12 17.8h15.76a1.06 1.06 0 0 0 .82-1.76c-.97-1.18-1.9-2.94-1.9-7.24A6.8 6.8 0 0 0 12 2z|M9.5 19.3h5a2.5 2.5 0 0 1-5 0z',

  // Form: foglio con l'orecchia piegata e i campi bucati dentro. La riga corta
  // in fondo è il campo ancora da compilare.
  formFill: 'M6.2 2h8a1.1 1.1 0 0 1 .78.32l5 5a1.1 1.1 0 0 1 .32.78V20a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 20V4.2A2.2 2.2 0 0 1 6.2 2zm2.1 9.2a1 1 0 0 0 0 2h7.4a1 1 0 0 0 0-2zm0 4.2a1 1 0 0 0 0 2h4.4a1 1 0 0 0 0-2z|M14.9 2.5 20.5 8.1h-4.5a1.1 1.1 0 0 1-1.1-1.1z',

  // Workflow: due nodi in cima, uno in fondo, e i rami che li uniscono. Il
  // disegno DICE la biforcazione — è quello che un workflow fa.
  flowFill: 'rect:1.6,3.4,8,5.2,1.8|rect:14.4,3.4,8,5.2,1.8|rect:8,15.4,8,5.2,1.8|M4.75 8.6h1.7v2.55h11.1V8.6h1.7v3.4a1.05 1.05 0 0 1-1.05 1.05h-4.9v2.35h-1.7V13.05h-4.9A1.05 1.05 0 0 1 4.75 12z',

  // Agent: la scintilla a quattro punte, grande e piccola. Non un robot: gli
  // agenti qui non sono automi, sono lavoro che si fa da sé.
  sparkFill: 'M10.2 2.2a.75.75 0 0 1 1.42 0l1.63 4.42a2 2 0 0 0 1.18 1.18l4.42 1.63a.75.75 0 0 1 0 1.42l-4.42 1.63a2 2 0 0 0-1.18 1.18l-1.63 4.42a.75.75 0 0 1-1.42 0l-1.63-4.42a2 2 0 0 0-1.18-1.18l-4.42-1.63a.75.75 0 0 1 0-1.42l4.42-1.63a2 2 0 0 0 1.18-1.18z|M18.1 15.1a.6.6 0 0 1 1.14 0l.72 1.94a1.4 1.4 0 0 0 .83.83l1.94.72a.6.6 0 0 1 0 1.14l-1.94.72a1.4 1.4 0 0 0-.83.83l-.72 1.94a.6.6 0 0 1-1.14 0l-.72-1.94a1.4 1.4 0 0 0-.83-.83l-1.94-.72a.6.6 0 0 1 0-1.14l1.94-.72a1.4 1.4 0 0 0 .83-.83z',

  // Proprietà: il cartellino con il foro. Una proprietà è un'etichetta che si
  // appende a un contatto.
  tagFill: 'M3.2 4.4a1.4 1.4 0 0 1 1.4-1.4h6.9a1.4 1.4 0 0 1 1 .41l9.1 9.1a1.4 1.4 0 0 1 0 1.98l-6.9 6.9a1.4 1.4 0 0 1-1.98 0l-9.1-9.1a1.4 1.4 0 0 1-.42-1zM8 6.15a1.85 1.85 0 1 0 0 3.7 1.85 1.85 0 0 0 0-3.7z',

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
      // Le icone piene accettano anche `rect:` e `circle:` come quelle di
      // contorno: un riquadro arrotondato scritto a mano in comandi d'arco è
      // illeggibile e si sbaglia di un decimo senza accorgersene. I FORI
      // restano appannaggio dei `path` con evenodd — un cerchio separato si
      // stamperebbe sopra, non sotto.
      return ({ size = 21, color = 'currentColor' }) => (
        <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{display:'inline-block', flexShrink:0, verticalAlign:'middle'}}>
          {fspec.split('|').map((seg, i) => {
            if (seg.startsWith('circle:')) {
              const [cx, cy, r] = seg.slice(7).split(',');
              return <circle key={i} cx={cx} cy={cy} r={r}/>;
            }
            if (seg.startsWith('rect:')) {
              const [x, y, w, h, rx] = seg.slice(5).split(',');
              return <rect key={i} x={x} y={y} width={w} height={h} rx={rx || 0}/>;
            }
            return <path key={i} d={seg} fillRule="evenodd" clipRule="evenodd"/>;
          })}
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

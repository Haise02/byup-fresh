// Icon set SVG monocromatico per la pagina Contabilità.
// Tutte le icone sono 16x16 di default, stroke-based, currentColor.

const Icon = ({ d, size = 16, fill = false, stroke = 1.6, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       fill={fill ? 'currentColor' : 'none'}
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round"
       style={{display:'block', flexShrink: 0}}
       {...rest}>{d}</svg>
);

const Ic = {
  // KPI
  wallet:   (p) => <Icon {...p} d={<><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M16 12h2"/><path d="M3 9h14"/></>}/>,
  trendDown:(p) => <Icon {...p} d={<><path d="M3 7l7 7 4-4 7 7"/><path d="M14 17h7v-7"/></>}/>,
  trendUp:  (p) => <Icon {...p} d={<><path d="M3 17l7-7 4 4 7-7"/><path d="M14 7h7v7"/></>}/>,
  receipt:  (p) => <Icon {...p} d={<><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></>}/>,
  invoice:  (p) => <Icon {...p} d={<><path d="M6 3h9l5 5v13H6V3Z"/><path d="M14 3v5h6"/><path d="M9 13h7"/><path d="M9 17h7"/></>}/>,

  // Tabella / azioni
  search:   (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>}/>,
  calendar: (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>}/>,
  upload:   (p) => <Icon {...p} d={<><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/></>}/>,
  download: (p) => <Icon {...p} d={<><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>}/>,
  edit:     (p) => <Icon {...p} d={<><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="M14 5l4 4"/></>}/>,
  trash:    (p) => <Icon {...p} d={<><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6"/><path d="M14 11v6"/></>}/>,
  filter:   (p) => <Icon {...p} d={<><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></>}/>,
  more:     (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>}/>,
  close:    (p) => <Icon {...p} d={<><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>}/>,
  plus:     (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="M5 12h14"/></>}/>,
  check:    (p) => <Icon {...p} d={<><path d="M5 12l5 5 9-11"/></>}/>,
  arrowUp:  (p) => <Icon {...p} d={<><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>}/>,
  arrowDn:  (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></>}/>,

  // Tipo costi
  recurring:(p) => <Icon {...p} d={<><path d="M4 12a8 8 0 0 1 14-5.3"/><path d="M20 12a8 8 0 0 1-14 5.3"/><path d="M14 6h4V2"/><path d="M10 18H6v4"/></>}/>,
  pin:      (p) => <Icon {...p} d={<><path d="M12 22v-7"/><path d="M9 8l-2 5h10l-2-5"/><path d="M9 8h6V3H9z"/></>}/>,
  paperclip:(p) => <Icon {...p} d={<><path d="M21 11.5l-9 9a5 5 0 0 1-7.1-7.1l9-9a3.5 3.5 0 0 1 4.9 4.9l-9 9a2 2 0 1 1-2.8-2.8l8-8"/></>}/>,
  send:     (p) => <Icon {...p} d={<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7Z"/></>}/>,
  share:    (p) => <Icon {...p} d={<><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></>}/>,
  fileCsv:  (p) => <Icon {...p} d={<><path d="M6 3h9l5 5v13H6V3Z"/><path d="M14 3v5h6"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M11 17h2"/></>}/>,
  filePdf:  (p) => <Icon {...p} d={<><path d="M6 3h9l5 5v13H6V3Z"/><path d="M14 3v5h6"/><path d="M9 14v4"/><path d="M13 14v4"/><path d="M9 14h2a1 1 0 0 1 0 2H9"/><path d="M13 14h2"/><path d="M13 16h1.5"/></>}/>,
  fileMail: (p) => <Icon {...p} d={<><path d="M6 3h9l5 5v13H6V3Z"/><path d="M14 3v5h6"/><rect x="9" y="11" width="9" height="6" rx="1"/><path d="M9 12l4.5 3L18 12"/></>}/>,

  // Categorie costi
  home:     (p) => <Icon {...p} d={<><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/></>}/>,
  users:    (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M14 14a5 5 0 0 1 7 4"/></>}/>,
  package:  (p) => <Icon {...p} d={<><path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>}/>,
  tools:    (p) => <Icon {...p} d={<><path d="M14 6l4 4-9 9-4-4 9-9Z"/><path d="M14 6l3-3 4 4-3 3"/><path d="M5 19l-2 2"/></>}/>,
  list:     (p) => <Icon {...p} d={<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></>}/>,

  // Status / utility
  warn:     (p) => <Icon {...p} d={<><path d="M12 3l10 18H2L12 3Z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.8" fill="currentColor"/></>}/>,
  bell:     (p) => <Icon {...p} d={<><path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13V9Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>}/>,
  bulb:     (p) => <Icon {...p} d={<><path d="M9 17h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5V16H8v-2.5A6 6 0 0 1 12 3Z"/></>}/>,
  cash:     (p) => <Icon {...p} d={<><rect x="3" y="6" width="18" height="12" rx="1.5"/><circle cx="12" cy="12" r="3"/><circle cx="6.5" cy="12" r="0.6" fill="currentColor"/><circle cx="17.5" cy="12" r="0.6" fill="currentColor"/></>}/>,
  store:    (p) => <Icon {...p} d={<><path d="M4 9l1.5-5h13L20 9"/><path d="M4 9v11h16V9"/><path d="M4 9a2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0"/><path d="M9 20v-6h6v6"/></>}/>,
  smartphone:(p)=> <Icon {...p} d={<><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></>}/>,
  globe:    (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18"/><path d="M12 3a13 13 0 0 0 0 18"/></>}/>,
  chevronR: (p) => <Icon {...p} d={<><path d="M9 5l7 7-7 7"/></>}/>,
  chartBar:(p) => <Icon {...p} d={<><path d="M4 20h16"/><rect x="6" y="10" width="3" height="8"/><rect x="11" y="6" width="3" height="12"/><rect x="16" y="13" width="3" height="5"/></>}/>,
};

window.Ic = Ic;

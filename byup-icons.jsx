// byup — Icon set SVG condiviso (sostituisce le emoji nei contesti formali)
// Stroke-based, monocromo, 24x24 viewBox. Color via prop, default currentColor.

function _BuIcon({ children, size = 16, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink: 0, display:'inline-block', verticalAlign:'middle'}}>
      {children}
    </svg>
  );
}

const BuIcons = {
  // Navigation / app areas
  dashboard: (p) => <_BuIcon {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></_BuIcon>,
  table:     (p) => <_BuIcon {...p}><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></_BuIcon>,
  kitchen:   (p) => <_BuIcon {...p}><path d="M6 2v4 M10 2v4 M14 2v4 M4 6h12v6a6 6 0 0 1-12 0z"/><path d="M16 8h2a3 3 0 0 1 0 6h-2"/></_BuIcon>,
  phone:     (p) => <_BuIcon {...p}><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></_BuIcon>,
  stats:     (p) => <_BuIcon {...p}><line x1="3" y1="20" x2="3" y2="10"/><line x1="9" y1="20" x2="9" y2="4"/><line x1="15" y1="20" x2="15" y2="14"/><line x1="21" y1="20" x2="21" y2="8"/></_BuIcon>,
  money:     (p) => <_BuIcon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/></_BuIcon>,
  chat:      (p) => <_BuIcon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></_BuIcon>,
  settings:  (p) => <_BuIcon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></_BuIcon>,

  // People / roles
  crown:     (p) => <_BuIcon {...p}><path d="M2 18h20l-2-9-5 4-3-7-3 7-5-4z"/><path d="M2 21h20"/></_BuIcon>,
  user:      (p) => <_BuIcon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></_BuIcon>,
  users:     (p) => <_BuIcon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></_BuIcon>,
  waiter:    (p) => <_BuIcon {...p}><circle cx="12" cy="5" r="2.5"/><path d="M9 9h6 M3 14h18 M5 14l1 7 M19 14l-1 7"/></_BuIcon>,
  chef:      (p) => <_BuIcon {...p}><path d="M6 14V8a4 4 0 0 1 4-4 4 4 0 0 1 4 0 4 4 0 0 1 4 4v6 M6 14h12 M7 14v6h10v-6"/></_BuIcon>,
  shield:    (p) => <_BuIcon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></_BuIcon>,
  mail:      (p) => <_BuIcon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></_BuIcon>,

  // Notifications/system
  sparkle:   (p) => <_BuIcon {...p}><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></_BuIcon>,
  bell:      (p) => <_BuIcon {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></_BuIcon>,
  card:      (p) => <_BuIcon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></_BuIcon>,
  receipt:   (p) => <_BuIcon {...p}><path d="M5 2v20l3-2 3 2 3-2 3 2V2z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></_BuIcon>,
  bulb:      (p) => <_BuIcon {...p}><path d="M9 18h6 M10 21h4 M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.4 1 2.3v1h6v-1c0-.9.3-1.7 1-2.3A7 7 0 0 0 12 2z"/></_BuIcon>,
  gift:      (p) => <_BuIcon {...p}><polyline points="20,12 20,22 4,22 4,12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></_BuIcon>,

  // Actions
  trash:     (p) => <_BuIcon {...p}><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></_BuIcon>,
  edit:      (p) => <_BuIcon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></_BuIcon>,
  download:  (p) => <_BuIcon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></_BuIcon>,
  upload:    (p) => <_BuIcon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></_BuIcon>,
  send:      (p) => <_BuIcon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></_BuIcon>,
  search:    (p) => <_BuIcon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></_BuIcon>,
  plus:      (p) => <_BuIcon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></_BuIcon>,
  check:     (p) => <_BuIcon {...p}><polyline points="20,6 9,17 4,12"/></_BuIcon>,
  x:         (p) => <_BuIcon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></_BuIcon>,
  fire:      (p) => <_BuIcon {...p}><path d="M12 2c1 5 5 5 5 11a5 5 0 0 1-10 0c0-3 1-4 2-6 1 2 2 2 3-5z"/></_BuIcon>,
  star:      (p) => <_BuIcon {...p}><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></_BuIcon>,
  calendar:  (p) => <_BuIcon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></_BuIcon>,
  party:     (p) => <_BuIcon {...p}><path d="M5 16l-3 5 5-3 8-8-2-2z"/><line x1="14" y1="6" x2="18" y2="2"/><line x1="20" y1="8" x2="22" y2="6"/><line x1="18" y1="12" x2="22" y2="14"/><circle cx="14" cy="14" r="0.5"/></_BuIcon>,

  // Settings menu
  storefront: (p) => <_BuIcon {...p}><path d="M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9h18 M9 20v-6h6v6"/></_BuIcon>,
  utensils:   (p) => <_BuIcon {...p}><path d="M3 2v8a3 3 0 0 0 6 0V2 M6 11v11 M14 14h5a2 2 0 0 1 0 4h-5z M14 14V2c4 0 6 4 6 8z"/></_BuIcon>,
  bolt:       (p) => <_BuIcon {...p}><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></_BuIcon>,
  doc:        (p) => <_BuIcon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></_BuIcon>,
  plug:       (p) => <_BuIcon {...p}><path d="M9 2v4 M15 2v4 M6 9h12v3a6 6 0 0 1-12 0z M12 18v4"/></_BuIcon>,

  // Files / formats
  filePdf:   (p) => <_BuIcon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></_BuIcon>,
  image:     (p) => <_BuIcon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></_BuIcon>,

  // Trend / chevrons / misc
  trendUp:    (p) => <_BuIcon {...p}><polyline points="3,17 9,11 13,15 21,7"/><polyline points="14,7 21,7 21,14"/></_BuIcon>,
  trendDown:  (p) => <_BuIcon {...p}><polyline points="3,7 9,13 13,9 21,17"/><polyline points="14,17 21,17 21,10"/></_BuIcon>,
  chevronDown:(p) => <_BuIcon {...p}><polyline points="6,9 12,15 18,9"/></_BuIcon>,
  chevronUp:  (p) => <_BuIcon {...p}><polyline points="6,15 12,9 18,15"/></_BuIcon>,
  info:       (p) => <_BuIcon {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></_BuIcon>,
  trophy:     (p) => <_BuIcon {...p}><path d="M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M7 5H4v2a3 3 0 0 0 3 3 M17 5h3v2a3 3 0 0 1-3 3"/></_BuIcon>,
  monitor:    (p) => <_BuIcon {...p}><rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/></_BuIcon>,
  eye:        (p) => <_BuIcon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></_BuIcon>,
  clock:      (p) => <_BuIcon {...p}><circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 16,14"/></_BuIcon>,
  shoppingBag:(p) => <_BuIcon {...p}><path d="M5 7h14l-1 14H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></_BuIcon>,

  // additions for cross-platform consistency
  paperclip: (p) => <_BuIcon {...p}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></_BuIcon>,
  pause:     (p) => <_BuIcon {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></_BuIcon>,
  play:      (p) => <_BuIcon {...p}><polygon points="5,3 19,12 5,21"/></_BuIcon>,
  copy:      (p) => <_BuIcon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></_BuIcon>,
  megaphone: (p) => <_BuIcon {...p}><path d="M3 11v2a2 2 0 0 0 2 2h1l4 5V4L6 9H5a2 2 0 0 0-2 2z"/><path d="M14 7a5 5 0 0 1 0 10"/></_BuIcon>,
  alert:     (p) => <_BuIcon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></_BuIcon>,
  chevronRight:(p)=> <_BuIcon {...p}><polyline points="9,18 15,12 9,6"/></_BuIcon>,
  grid:      (p) => <_BuIcon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></_BuIcon>,
  list:      (p) => <_BuIcon {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3" y2="6"/><line x1="3" y1="12" x2="3" y2="12"/><line x1="3" y1="18" x2="3" y2="18"/></_BuIcon>,
  cursor:    (p) => <_BuIcon {...p}><path d="M3 3l7 18 2-8 8-2z"/></_BuIcon>,
  link:      (p) => <_BuIcon {...p}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></_BuIcon>,
  split:     (p) => <_BuIcon {...p}><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><line x1="9" y1="8" x2="20" y2="16"/><line x1="9" y1="16" x2="20" y2="8"/></_BuIcon>,
};

window.BuIcons = BuIcons;

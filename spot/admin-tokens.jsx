// Admin design tokens — autosufficienti, non dipendono da PN

const ADM = {
  // canvas / surfaces  — Apple-style soft warm-grays
  BG:           '#F5F5F7',
  CANVAS:       '#F5F5F7',
  WHITE:        '#FFFFFF',
  PANEL:        '#FFFFFF',
  PANEL_SOFT:   '#FAFAFB',
  // text — true neutrals (Apple system grays)
  TEXT:         '#16181D',
  MUTED:        '#6E6E73',
  MUTED_SOFT:   '#8A8A90',
  MUTED_LIGHT:  '#C5C5C7',
  // neutral — base per tile/icone "calm" (il colore NON è decorativo)
  NEUTRAL:      '#6E6E73',
  NEUTRAL_SOFT: '#F1F2F4',
  // ink — colore delle serie nei grafici (schema "inchiostro + un accento",
  // stile Airbnb): la massa dei dati è quieta, il coral è riservato a hero,
  // confronti Byup-vs-mercato, picchi critici e UI di brand.
  INK:          '#31353D',
  INK_SOFT:     '#C9CDD4',
  // border — softer
  BORDER:       '#E6E6EB',
  BORDER_SOFT:  '#F0F0F2',
  // brand byup — coral red
  PINK:         '#FF5A5F',
  PINK_DARK:    '#E04347',
  PINK_SOFT:    '#FFE0DD',
  PINK_BG_SOFT: '#FFF1EF',
  WINE:         '#B53338',
  WINE_SOFT:    '#FFE0DD',
  // sidebar (back-office dark)
  SIDE_BG:        '#0F1115',
  SIDE_FG:        '#E6E7EA',
  SIDE_FG_MUTED:  '#8A8E96',
  SIDE_HOVER:     '#1A1D24',
  SIDE_ACTIVE_BG: '#1F2229',
  SIDE_ACTIVE_FG: '#FFFFFF',
  SIDE_BORDER:    '#1F2229',
  SIDE_ACCENT:    '#FF5A5F',
  // table density
  ROW_HOVER:    '#F7F8FA',
  ROW_STRIPE:   '#FBFBFC',
  // semantic — colore = SIGNIFICATO (stato/severità), soft desaturati per look "calm"
  OK:           '#16A34A',
  OK_SOFT:      '#E4F4EA',
  GREEN:        '#16A34A',
  GREEN_SOFT:   '#E4F4EA',
  WARN:         '#C2710C',
  WARN_SOFT:    '#FAF1DC',
  AMBER:        '#C2710C',
  AMBER_SOFT:   '#FAF1DC',
  DANGER:       '#DC2626',
  DANGER_SOFT:  '#FBE9E9',
  RED:          '#DC2626',
  RED_SOFT:     '#FBE9E9',
  INFO:         '#2563EB',
  INFO_SOFT:    '#E8EFFB',
  BLUE:         '#2563EB',
  BLUE_SOFT:    '#E8EFFB',
  PURPLE:       '#7C3AED',
  PURPLE_SOFT:  '#ECE9FA',
  // plan colors
  PLAN_FREE:        '#6B7280',
  PLAN_FREE_SOFT:   '#F3F4F6',
  PLAN_STARTER:       '#2563EB',
  PLAN_STARTER_SOFT:  '#DBEAFE',
  PLAN_PLUS:          '#7C3AED',
  PLAN_PLUS_SOFT:     '#EDE9FE',
  PLAN_BUSINESS:      '#0F1115',
  PLAN_BUSINESS_SOFT: '#E5E7EB',
  // shadows — Apple soft, layered
  CARD_SHADOW:        '0 1px 2px rgba(15,17,21,0.04), 0 1px 1px rgba(15,17,21,0.03)',
  CARD_SHADOW_HOVER:  '0 8px 24px -10px rgba(15,17,21,0.10), 0 2px 6px -2px rgba(15,17,21,0.04)',
};

// Mini helpers
function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'M';
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'k';
  return new Intl.NumberFormat('it-IT').format(n);
}
function fmtEur(n) {
  if (n == null) return '—';
  return '€ ' + new Intl.NumberFormat('it-IT', {maximumFractionDigits:0}).format(n);
}
function fmtDate(d) {
  if (!d) return '—';
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toLocaleDateString('it-IT', {day:'2-digit', month:'short', year:'numeric'});
}
function fmtDateTime(d) {
  if (!d) return '—';
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit', year:'2-digit'}) + ' · ' +
         dt.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
}
function fmtRelative(d) {
  if (!d) return '—';
  const dt = (d instanceof Date) ? d : new Date(d);
  const diff = Date.now() - dt.getTime();
  const min = Math.floor(diff/60000);
  if (min < 1) return 'ora';
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min/60);
  if (h < 24) return `${h} h fa`;
  const days = Math.floor(h/24);
  if (days < 7) return `${days} g fa`;
  if (days < 30) return `${Math.floor(days/7)} sett fa`;
  return fmtDate(dt);
}

window.ADM = ADM;
window.fmtNum = fmtNum;
window.fmtEur = fmtEur;
window.fmtDate = fmtDate;
window.fmtDateTime = fmtDateTime;
window.fmtRelative = fmtRelative;

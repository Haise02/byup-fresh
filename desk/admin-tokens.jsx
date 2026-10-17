// Hubble design tokens — autosufficienti, non dipendono da PN
//
// ─── La palette del marchio ─────────────────────────────────────────────────
// Il logo Hubble è UN GRADIENTE che va dal rosa byup al viola, passando per il
// magenta. Tre colori, non uno, e la console li usa con tre mestieri diversi:
//
//   ROSA (#FF1F5A)     l'ACCENTO D'AZIONE. Eredita il posto che aveva il
//                      corallo byup: voce attiva, focus, pillole, CTA. È il
//                      colore che si vede cento volte al giorno, e sta al
//                      punto del gradiente più vicino al marchio di partenza —
//                      il rebrand si legge come un'evoluzione, non un trapianto.
//   MAGENTA (#ED1999)  il colore del MARKETING: mail, SMS, push, form. Una
//                      famiglia di sezioni nuove che deve distinguersi dal CRM
//                      senza uscire dal marchio.
//   VIOLA (#D410F1)    il colore dell'INTELLIGENZA: Workflow e Agent. È la
//                      fine del gradiente, il punto più lontano da byup: le
//                      cose che la piattaforma fa da sola.
//
// Il gradiente intero resta un fatto di MARCA — logo, testate, momenti di
// benvenuto — e non entra mai sotto a un testo lungo o a una tabella.
//
// Tutto il resto della palette (verde/ambra/rosso/blu/teal) è SEMANTICO e non
// si tocca: il colore lì significa stato, non identità. Un rebrand che si
// mangia i colori di stato è un rebrand che rende la console illeggibile.

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
  // ─── brand Hubble ─────────────────────────────────────────────────────────
  // I nomi restano PINK/PINK_DARK/…: sono l'accento della console da sempre e
  // rinominarli avrebbe voluto dire toccare ottomila righe per cambiare tre
  // valori. Cambia il colore, non il ruolo.
  PINK:         '#FF1F5A',   // rosa Hubble — accento d'azione
  PINK_DARK:    '#C40B45',   // il rosa scurito per il TESTO su bianco (4.5:1)
  PINK_SOFT:    '#FFE0E8',   // fondo delle pillole
  PINK_BG_SOFT: '#FFF1F4',   // fondo tenue di sezione
  PINK_HOVER:   '#FFCBD8',   // pillola accesa sotto il mouse
  WINE:         '#9E0B3C',
  WINE_SOFT:    '#FFE0E8',
  // I tre punti del gradiente, presi dal file del logo.
  HUB_ROSA:         '#FF1F5A',
  HUB_MAGENTA:      '#ED1999',
  HUB_MAGENTA_DARK: '#B01173',  // magenta leggibile su bianco
  HUB_MAGENTA_SOFT: '#FDE0F2',
  HUB_VIOLA:        '#D410F1',
  HUB_VIOLA_DARK:   '#9209A8',  // viola leggibile su bianco
  HUB_VIOLA_SOFT:   '#F6DFFD',
  // Il gradiente di marca. DIAG è quello del badge negativo del logo.
  HUB_GRAD:      'linear-gradient(100deg, #FF1F5A 0%, #ED1999 52%, #D410F1 100%)',
  HUB_GRAD_DIAG: 'linear-gradient(135deg, #FD1E61 0%, #DE14CC 100%)',
  HUB_GRAD_SOFT: 'linear-gradient(100deg, #FFF1F4 0%, #FDE9F6 52%, #F8E9FE 100%)',
  HUB_GLOW:      'rgba(237,25,153,0.30)',
  // sidebar (back-office dark)
  SIDE_BG:        '#0F1115',
  SIDE_FG:        '#E6E7EA',
  SIDE_FG_MUTED:  '#8A8E96',
  SIDE_HOVER:     '#1A1D24',
  SIDE_ACTIVE_BG: '#1F2229',
  SIDE_ACTIVE_FG: '#FFFFFF',
  SIDE_BORDER:    '#1F2229',
  SIDE_ACCENT:    '#FF1F5A',
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
  // Il viola SEMANTICO (tipologia «Utente App», piano Plus) si sposta verso
  // l'indaco: il viola del MARCHIO ora è #D410F1, e due viola a due colonne di
  // distanza si confondono. Questo resta blu-viola, quello resta magenta-viola.
  PURPLE:       '#5B34D6',
  PURPLE_SOFT:  '#E7E3FB',
  TEAL:         '#0D9488',
  TEAL_SOFT:    '#D7EFEC',
  INDIGO:       '#4338CA',
  INDIGO_SOFT:  '#E4E6FB',
  // plan colors
  PLAN_FREE:        '#6B7280',
  PLAN_FREE_SOFT:   '#F3F4F6',
  PLAN_STARTER:       '#2563EB',
  PLAN_STARTER_SOFT:  '#DBEAFE',
  PLAN_PLUS:          '#5B34D6',
  PLAN_PLUS_SOFT:     '#E7E3FB',
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

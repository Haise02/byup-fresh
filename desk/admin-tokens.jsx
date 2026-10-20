// Desk design tokens — autosufficienti, non dipendono da PN
//
// ─── Il nome e il marchio ───────────────────────────────────────────────────
// La console si chiamava byup Spot, poi Hubble; dal 17 ottobre 2026 è DESK, il
// CRM interno di byup. Il nome Hubble passa al marketplace dei fornitori (in
// sviluppo). Il logo di Desk è il segno byup con la scritta «Desk», PRUGNA su
// LILLA (`desk.png`, `desk-mark.png`, `desk-badge.png`): i due colori vivono
// qui sotto come DESK_PRUGNA e DESK_LILLA e si usano per i momenti di marca —
// il logo, il pulsante di Ambiente, le superfici di Ambiente — non per
// l'azione.
//
// ─── La palette di lavoro ───────────────────────────────────────────────────
// La palette con cui la console lavora resta quella di prima, per scelta
// esplicita: tre colori con tre mestieri diversi.
//
//   ROSA (#FF1F5A)     l'ACCENTO D'AZIONE: voce attiva, focus, pillole, CTA.
//                      È il colore che si vede cento volte al giorno.
//   MAGENTA (#ED1999)  il colore del MARKETING: mail, SMS, push, form.
//   VIOLA (#D410F1)    il colore dell'INTELLIGENZA: Workflow e Agent.
//
// Il gradiente intero rosa → viola resta un fatto di marca della console —
// testate, momenti di benvenuto — e non entra mai sotto a un testo lungo o a
// una tabella.
//
// Tutto il resto della palette (verde/ambra/rosso/blu/teal) è SEMANTICO e non
// si tocca: il colore lì significa stato, non identità.

const ADM = {
  // canvas / surfaces — dal 20 ottobre 2026 caldi, con un velo di lilla: il
  // fondo della console è una carta tiepida, e le schede ci stanno sopra
  // come vetro (GLASS). I grigi tirano verso la prugna del marchio.
  BG:           '#F2EEEC',
  CANVAS:       '#F2EEEC',
  WHITE:        '#FFFFFF',
  PANEL:        '#FFFFFF',
  PANEL_SOFT:   '#F8F5F4',
  GLASS:        'rgba(255,255,255,0.72)',
  GLASS_FORTE:  'rgba(255,255,255,0.86)',
  GLASS_BORDO:  'rgba(255,255,255,0.75)',
  // Il fondo della pagina: carta calda, lilla in alto a sinistra, sabbia a destra.
  FONDO_PAGINA: 'radial-gradient(1100px 640px at 4% -12%, #E7D6E6 0%, rgba(231,214,230,0) 62%), radial-gradient(900px 620px at 100% -8%, #F2E4D6 0%, rgba(242,228,214,0) 58%), linear-gradient(180deg, #F4F0EE 0%, #EEE9E7 100%)',
  // L'inchiostro dei pulsanti forti e della voce accesa: un nero di prugna.
  INCHIOSTRO:   '#1D1520',
  INCHIOSTRO_2: '#2D2230',
  // I raggi: schede grandi, controlli a pillola.
  R_SCHEDA:     22,
  R_RIQUADRO:   16,
  R_CAMPO:      12,
  // text — neutri caldi, verso la prugna
  TEXT:         '#1D1520',
  MUTED:        '#6E6470',
  MUTED_SOFT:   '#8D838F',
  MUTED_LIGHT:  '#C8BFC6',
  // neutral — base per tile/icone "calm" (il colore NON è decorativo)
  NEUTRAL:      '#6E6470',
  NEUTRAL_SOFT: '#F3EEF0',
  // ink — colore delle serie nei grafici (schema "inchiostro + un accento",
  // stile Airbnb): la massa dei dati è quieta, il coral è riservato a hero,
  // confronti Byup-vs-mercato, picchi critici e UI di brand.
  INK:          '#2D2230',
  INK_SOFT:     '#CBC2C9',
  // border — caldi e tenui: sul fondo di carta una riga grigia fredda stona
  BORDER:       '#EAE2E4',
  BORDER_SOFT:  '#F2ECED',
  // ─── marchio Desk: prugna e lilla, dal file del logo ──────────────────────
  DESK_PRUGNA:       '#492844',   // la scritta e il segno del logo
  DESK_PRUGNA_SCURO: '#351C30',   // la prugna sotto il mouse / premuta
  DESK_PRUGNA_CHIARO:'#6E4C68',   // testo secondario su lilla
  DESK_LILLA:        '#DCBAD7',   // il fondo del badge
  DESK_PRUGNA_SOFT:  '#F4EAF2',   // = lilla tenue: il fondo delle icone in prugna
  DESK_LILLA_SOFT:   '#F4EAF2',   // superfici tenui di Ambiente
  DESK_LILLA_BG:     '#FAF5F9',   // fondo della colonna di Ambiente
  // ─── accento della console (rosa → magenta → viola) ──────────────────────
  // I nomi restano PINK/PINK_DARK/…: sono l'accento della console da sempre e
  // rinominarli avrebbe voluto dire toccare ottomila righe per cambiare tre
  // valori. Cambia il colore, non il ruolo.
  PINK:         '#FF1F5A',   // rosa della console — accento d'azione
  PINK_DARK:    '#C40B45',   // il rosa scurito per il TESTO su bianco (4.5:1)
  PINK_SOFT:    '#FFE0E8',   // fondo delle pillole
  PINK_BG_SOFT: '#FFF1F4',   // fondo tenue di sezione
  PINK_HOVER:   '#FFCBD8',   // pillola accesa sotto il mouse
  WINE:         '#9E0B3C',
  WINE_SOFT:    '#FFE0E8',
  // I tre punti del gradiente rosa → viola (il marchio di prima, che resta
  // la palette d'azione della console).
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
  ROW_HOVER:    '#F8F4F5',
  ROW_STRIPE:   'transparent',
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
  CARD_SHADOW:        '0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 34px -22px rgba(73,40,68,0.28), 0 1px 2px rgba(73,40,68,0.04)',
  CARD_SHADOW_HOVER:  '0 1px 0 rgba(255,255,255,0.7) inset, 0 22px 44px -22px rgba(73,40,68,0.34), 0 2px 6px -2px rgba(73,40,68,0.06)',
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

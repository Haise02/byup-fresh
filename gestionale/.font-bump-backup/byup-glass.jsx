// byup — Liquid Glass surface system
// Single source of truth per le superfici "vetro" della dashboard.
// Caricare DOPO byup-tokens.jsx in qualsiasi pagina che voglia usare il sistema.
//
// Anatomia (5 layer, dall'esterno verso l'interno):
//   [ outer shadow ]        drop shadow morbido — separa dal piano sotto
//   [ inner ring 1px ]      simula lo spessore del vetro
//   [ specular highlight ]  riga di luce in alto — fa "leggere" il volume
//   [ tint layer ]          tinta leggera bianca/nera — identità del vetro
//   [ backdrop blur+sat ]   blur + saturate del contenuto dietro
//   ─ substrato dietro ─    DEVE esistere ed essere contrastato per funzionare
//
// Regola chiave: il glass è una lente. Se dietro c'è solo bianco piatto,
// non rifrange nulla e diventa una pill grigina. Usare <GlassMeshSubstrate>
// nelle pagine neutre, oppure passare a `solid soft` per i pulsanti in
// tabelle bianche (vedi BU_BTN.secondary in byup-tokens.jsx).

(function injectGlassStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('byup-glass-styles')) return;

  const css = `
/* ─────────────────────────────────────────────────────────────
   .glass — variante default
   Per: dropdown, popover, header sticky, toast, sidebar su
   main area colorata. Blur 20px, tinta 55% bianco.
   ───────────────────────────────────────────────────────────── */
.glass {
  position: relative;
  background-color: rgba(255, 255, 255, 0.55);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.10) 35%,
    rgba(255, 255, 255, 0)    100%
  );
  -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.70),
    inset 0 0 0 1px rgba(255, 255, 255, 0.18),
    0 8px 24px -8px rgba(15, 23, 42, 0.18),
    0 2px 6px  -2px rgba(15, 23, 42, 0.10);
  border-radius: 14px;
}

/* ─────────────────────────────────────────────────────────────
   .glass-strong — variante per modal / dialog
   Blur più aggressivo (32px), tinta più presente (65%),
   ombre più profonde per leggere come elemento sollevato sopra
   un overlay scurito.
   ───────────────────────────────────────────────────────────── */
.glass-strong {
  position: relative;
  background-color: rgba(255, 255, 255, 0.65);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.12) 40%,
    rgba(255, 255, 255, 0)    100%
  );
  -webkit-backdrop-filter: blur(32px) saturate(200%);
          backdrop-filter: blur(32px) saturate(200%);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.80),
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    0 24px 60px -12px rgba(15, 23, 42, 0.30),
    0 8px  20px -8px  rgba(15, 23, 42, 0.18);
  border-radius: 20px;
}

/* ─────────────────────────────────────────────────────────────
   .glass-subtle — variante per chip / badge / pulsanti glass
   Blur minimo (10px), presenza discreta. Usare SOLO su
   substrato colorato. Mai su tabella bianca.
   ───────────────────────────────────────────────────────────── */
.glass-subtle {
  position: relative;
  background-color: rgba(255, 255, 255, 0.70);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.40) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0)    100%
  );
  -webkit-backdrop-filter: blur(10px) saturate(160%);
          backdrop-filter: blur(10px) saturate(160%);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.60),
    inset 0 0 0 1px rgba(255, 255, 255, 0.20),
    0 2px 8px -2px rgba(15, 23, 42, 0.10);
  border-radius: 12px;
}

/* ─────────────────────────────────────────────────────────────
   Dark variants — attivate via class .glass-dark sull'elemento
   o automaticamente con prefers-color-scheme: dark.
   ───────────────────────────────────────────────────────────── */
.glass.glass-dark,
.glass-strong.glass-dark,
.glass-subtle.glass-dark { color: #F5F5F7; }

.glass.glass-dark {
  background-color: rgba(20, 20, 22, 0.55);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 35%,
    rgba(255, 255, 255, 0)    100%
  );
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.10),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 8px 24px -8px rgba(0, 0, 0, 0.45),
    0 2px 6px  -2px rgba(0, 0, 0, 0.30);
}
.glass-strong.glass-dark {
  background-color: rgba(20, 20, 22, 0.65);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.05) 40%,
    rgba(255, 255, 255, 0)    100%
  );
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
    inset 0 0 0 1px rgba(255, 255, 255, 0.10),
    0 24px 60px -12px rgba(0, 0, 0, 0.60),
    0 8px  20px -8px  rgba(0, 0, 0, 0.40);
}
.glass-subtle.glass-dark {
  background-color: rgba(20, 20, 22, 0.65);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.10) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0)    100%
  );
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 2px 8px -2px rgba(0, 0, 0, 0.40);
}

/* Auto dark via system preference (solo se NON è già stato
   forzato il modo light sull'elemento con .glass-light) */
@media (prefers-color-scheme: dark) {
  .glass:not(.glass-light) {
    background-color: rgba(20, 20, 22, 0.55);
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.04) 35%,
      rgba(255, 255, 255, 0)    100%
    );
    box-shadow:
      inset 0 1px 0 0 rgba(255, 255, 255, 0.10),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08),
      0 8px 24px -8px rgba(0, 0, 0, 0.45),
      0 2px 6px  -2px rgba(0, 0, 0, 0.30);
    color: #F5F5F7;
  }
  .glass-strong:not(.glass-light) {
    background-color: rgba(20, 20, 22, 0.65);
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.05) 40%,
      rgba(255, 255, 255, 0)    100%
    );
    box-shadow:
      inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
      inset 0 0 0 1px rgba(255, 255, 255, 0.10),
      0 24px 60px -12px rgba(0, 0, 0, 0.60),
      0 8px  20px -8px  rgba(0, 0, 0, 0.40);
    color: #F5F5F7;
  }
  .glass-subtle:not(.glass-light) {
    background-color: rgba(20, 20, 22, 0.65);
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.10) 0%,
      rgba(255, 255, 255, 0.03) 50%,
      rgba(255, 255, 255, 0)    100%
    );
    box-shadow:
      inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.06),
      0 2px 8px -2px rgba(0, 0, 0, 0.40);
    color: #F5F5F7;
  }
}

/* ─────────────────────────────────────────────────────────────
   Scrollbar GLOBALE — minimale, non invasiva. byup-glass.jsx è
   caricato in tutte le 13 pagine dashboard, quindi questa regola
   universal applica all'intero gestionale.
   Solo thumb arrotondato semitrasparente. Niente frecce,
   niente track bg, niente corner bianco.
   ───────────────────────────────────────────────────────────── */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(15, 17, 21, 0.18) transparent;
}
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
*::-webkit-scrollbar-track,
*::-webkit-scrollbar-track-piece {
  background: transparent;
  border: none;
}
*::-webkit-scrollbar-thumb {
  background-color: rgba(15, 17, 21, 0.18);
  background-clip: padding-box;
  border: 2px solid transparent;
  border-radius: 999px;
  transition: background-color 180ms ease;
}
*::-webkit-scrollbar-thumb:hover {
  background-color: rgba(15, 17, 21, 0.32);
  background-clip: padding-box;
}
*::-webkit-scrollbar-thumb:active {
  background-color: rgba(15, 17, 21, 0.45);
  background-clip: padding-box;
}
*::-webkit-scrollbar-button,
*::-webkit-scrollbar-corner {
  display: none;
  background: transparent;
  width: 0; height: 0;
}

/* Contenitori dark-themed: inverto il thumb a chiaro per essere visibile.
   La selettività è 0,1,1 (class + pseudo) > 0,0,1 (universal pseudo). */
.glass-photo-bg ::-webkit-scrollbar-thumb,
.glass-night-bg ::-webkit-scrollbar-thumb,
.glass-dark ::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.22);
}
.glass-photo-bg ::-webkit-scrollbar-thumb:hover,
.glass-night-bg ::-webkit-scrollbar-thumb:hover,
.glass-dark ::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.40);
}
.glass-photo-bg, .glass-night-bg, .glass-dark {
  scrollbar-color: rgba(255, 255, 255, 0.22) transparent;
}

/* Override delle regole legacy .pn-scroll/.prenot-list (inline negli HTML
   delle 12 pagine dashboard) — stessa specificità 0,1,1 ma le mie regole
   sono iniettate via document.head.appendChild DOPO il <style> dell'HTML,
   quindi vincono per ordine del cascade. */
.pn-scroll::-webkit-scrollbar,
.prenot-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
.pn-scroll::-webkit-scrollbar-track,
.prenot-list::-webkit-scrollbar-track,
.pn-scroll::-webkit-scrollbar-track-piece,
.prenot-list::-webkit-scrollbar-track-piece {
  background: transparent;
}
.pn-scroll::-webkit-scrollbar-thumb,
.prenot-list::-webkit-scrollbar-thumb {
  background-color: rgba(15, 17, 21, 0.18);
  background-clip: padding-box;
  border: 2px solid transparent;
  border-radius: 999px;
  transition: background-color 180ms ease;
}
.pn-scroll::-webkit-scrollbar-thumb:hover,
.prenot-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(15, 17, 21, 0.32);
}
.pn-scroll::-webkit-scrollbar-button,
.prenot-list::-webkit-scrollbar-button,
.pn-scroll::-webkit-scrollbar-corner,
.prenot-list::-webkit-scrollbar-corner {
  display: none;
  width: 0; height: 0;
  background: transparent;
}

/* ─────────────────────────────────────────────────────────────
   Fallback browser senza backdrop-filter (Firefox < 103 ecc.)
   Senza il blur dietro, il vetro non funziona: passiamo a
   superficie solida con contrasto sufficiente per restare leggibile.
   ───────────────────────────────────────────────────────────── */
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .glass         { background-color: rgba(255, 255, 255, 0.92); }
  .glass-strong  { background-color: rgba(255, 255, 255, 0.96); }
  .glass-subtle  { background-color: rgba(255, 255, 255, 0.94); }
  .glass.glass-dark,
  .glass-strong.glass-dark,
  .glass-subtle.glass-dark { background-color: rgba(20, 20, 22, 0.94); }
}

/* ─────────────────────────────────────────────────────────────
   Substrato mesh per pagine neutre.
   Default: position:absolute → riempie il .frame contenitore
   (che ha position:relative + overflow:hidden in ogni pagina
   della dashboard). Opacità tarata bassa (~22%) per uso "always
   on": il glass acquisisce materia, ma l'occhio non legge il
   substrato come "decorazione". Tre toni:
     - default: warm Byup (pink+wine+blue tenui)
     - cool:    indigo+sky+emerald
     - neutral: solo grigi caldi → per pagine dense
                (Contabilità, Statistiche, Impostazioni) dove
                anche il warm rischia di disturbare i grafici.
   ───────────────────────────────────────────────────────────── */
.glass-mesh-substrate {
  /* z-index: -1 + parent isolation:isolate (applicata da JS via useEffect)
     garantisce che il substrato stia DIETRO ai figli in-flow del genitore,
     senza fuoriuscire dallo stacking context del .frame. */
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.55;
  background:
    radial-gradient(circle at 12% 18%, rgba(242, 107, 122, 0.10), transparent 45%),
    radial-gradient(circle at 88% 78%, rgba(124,  45,  60, 0.08), transparent 45%),
    radial-gradient(circle at 50% 55%, rgba( 37,  99, 235, 0.05), transparent 55%);
}
.glass-mesh-substrate.glass-mesh-cool {
  background:
    radial-gradient(circle at 18% 22%, rgba( 99, 102, 241, 0.10), transparent 45%),
    radial-gradient(circle at 82% 78%, rgba( 14, 165, 233, 0.08), transparent 45%),
    radial-gradient(circle at 50% 50%, rgba( 16, 185, 129, 0.05), transparent 55%);
}
.glass-mesh-substrate.glass-mesh-neutral {
  /* Tono grigio caldo: visibile solo come "atmosphere", non distrae i grafici */
  opacity: 0.85;
  background:
    radial-gradient(circle at 15% 18%, rgba(120, 113, 108, 0.07), transparent 48%),
    radial-gradient(circle at 85% 78%, rgba(168, 162, 158, 0.06), transparent 48%),
    radial-gradient(circle at 50% 55%, rgba( 99,  99, 105, 0.04), transparent 55%);
}
/* Variante "fixed" per pagine senza .frame contenitore (es. consumer app screens) */
.glass-mesh-substrate.glass-mesh-fixed {
  position: fixed;
}

/* ─────────────────────────────────────────────────────────────
   Mesh "dark" Byup — gradient brand-aligned per box-glass scuri.
   Palette costruita su PINK (#F26B7A), PINK_DARK (#BE185D),
   WINE (#7C2D3C) + tonalità più scure (#2A0E16, #14060A) e una
   più chiara (#FB7185) per estendere lo spettro tonale senza
   uscire dalla brand. Usare come bg di un wrapper o via
   <GlassDarkBox> component.
   ───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   LIGHT GRADIENT theme — bright coral/salmon/peach Byup.
   #FF6066 main + tonalità tendenti all'arancio rosato e salmone
   (#FFC8B0 peach light, #FFB4A8 peach pink, #FF8A95 salmon pink,
   #FF6066 coral main). Base molto chiara #FFE8DD → #FFD7CC così
   il box resta LIGHT — il testo dovrà essere DARK per leggibilità.
   ───────────────────────────────────────────────────────────── */
.glass-photo-bg {
  background:
    radial-gradient(circle at 15% 18%, #FFC8B0 0%, transparent 50%),
    radial-gradient(circle at 80% 25%, #FFB4A8 0%, transparent 48%),
    radial-gradient(circle at 78% 78%, #FF8A95 0%, transparent 50%),
    radial-gradient(circle at 28% 88%, #FF6066 0%, transparent 52%),
    linear-gradient(135deg, #FFE8DD 0%, #FFD7CC 100%);
}
/* Variante "deeper" del light theme — più satura, meno pastello.
   Per box dove serve un po' di "peso" visivo senza passare al night. */
.glass-photo-bg.glass-photo-deeper {
  background:
    radial-gradient(circle at 15% 18%, #FFB4A8 0%, transparent 50%),
    radial-gradient(circle at 80% 25%, #FF8A95 0%, transparent 48%),
    radial-gradient(circle at 78% 78%, #FF6066 0%, transparent 52%),
    radial-gradient(circle at 30% 90%, #FF8068 0%, transparent 55%),
    linear-gradient(135deg, #FFD7CC 0%, #FFC1B0 100%);
}
/* Variante "lighter" — ancora più pastello, quasi peach pure.
   Per box di accento "celebrativo" (savings, achievement). */
.glass-photo-bg.glass-photo-lighter {
  background:
    radial-gradient(circle at 15% 18%, #FFE0D2 0%, transparent 52%),
    radial-gradient(circle at 80% 25%, #FFC8B0 0%, transparent 50%),
    radial-gradient(circle at 75% 85%, #FFAB91 0%, transparent 50%),
    linear-gradient(135deg, #FFF0E8 0%, #FFE2D6 100%);
}

/* ─────────────────────────────────────────────────────────────
   NIGHT theme — grigio/nero VERO. Niente accenti coral.
   Slate/charcoal puro per superfici "premium operative" (kitchen
   monitor, plan card upgrade, premium hero). Base #1A1F2C → #0A0D14,
   accenti slate-700/800/900. Testo bianco/grigio chiaro.
   ───────────────────────────────────────────────────────────── */
.glass-night-bg {
  background:
    radial-gradient(circle at 18% 22%, #2D3748 0%, transparent 50%),
    radial-gradient(circle at 82% 75%, #1F2937 0%, transparent 52%),
    radial-gradient(circle at 50% 92%, #111827 0%, transparent 60%),
    linear-gradient(135deg, #1A1F2C 0%, #0A0D14 100%);
}
/* Variante night con UN accento coral discreto (solo 18% opacity) —
   per box night che vogliono mantenere identità Byup senza tradire
   il dark mood. */
.glass-night-bg.glass-night-coral {
  background:
    radial-gradient(circle at 85% 18%, rgba(255, 96, 102, 0.18) 0%, transparent 38%),
    radial-gradient(circle at 18% 22%, #2D3748 0%, transparent 50%),
    radial-gradient(circle at 82% 75%, #1F2937 0%, transparent 52%),
    radial-gradient(circle at 50% 92%, #111827 0%, transparent 60%),
    linear-gradient(135deg, #1A1F2C 0%, #0A0D14 100%);
}
/* ─────────────────────────────────────────────────────────────
   AURORA SOFT — L2 del sistema 75/15/10. Mesh pastello multi-color:
   pink top-left + lavender top-right + cream bottom-center, su base
   sfumata pink→lavender. Stesso DNA dell'aurora variant nella preview
   themes.html (L2). Niente backdrop blur, niente inset rings — la box
   legge come una W1 normale con un cuore tinto multi-color, non un
   solido bianco e nemmeno un glass pesante.
   ───────────────────────────────────────────────────────────── */
.aurora-soft-bg {
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%),
    radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%),
    radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%),
    linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%);
}
/* Variante "cool" — wash più freddo (sky/lavender/mint) per pagine dense
   dove il warm rischia di disturbare (Contabilità, Statistiche). */
.aurora-soft-bg.aurora-cool {
  background:
    radial-gradient(circle at 20% 18%, rgba(199, 210, 254, 0.55) 0%, transparent 60%),
    radial-gradient(circle at 85% 25%, rgba(186, 230, 253, 0.45) 0%, transparent 60%),
    radial-gradient(circle at 60% 95%, rgba(220, 252, 231, 0.50) 0%, transparent 65%),
    linear-gradient(135deg, #F5F7FF 0%, #F8FCFF 100%);
}

/* ─────────────────────────────────────────────────────────────
   SUNSET theme — D3 del sistema 75/15/10. Riferimento: variante D3
   "Sunset Glass" della preview themes.html, vista come INSIDE BOX
   (non frame). Il box è dominato dal wash wine-burnt scuro; la mesh
   coral/fanta/salmon resta come accento sottile agli angoli, senza
   inondare il box. Sui widget interni questo permette alle row tile
   bianche di leggere come tile sottili, non come box evidenziate.
   ───────────────────────────────────────────────────────────── */
.glass-sunset-bg {
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 96, 102, 0.66) 0%, transparent 52%),
    radial-gradient(circle at 22% 28%, rgba(251, 122, 70, 0.30) 0%, transparent 50%),
    radial-gradient(circle at 72% 78%, rgba(255, 120, 130, 0.42) 0%, transparent 56%),
    radial-gradient(circle at 38% 95%, rgba(255, 96, 102, 0.20) 0%, transparent 58%),
    linear-gradient(135deg, #2C0C10 0%, #160508 100%);
}

/* Variante legacy "cool" (indigo/sky) e "warm" (orange/red) tenute
   per opt-in esplicito. Non sono brand default — usare solo per
   showcase o A/B test. */
.glass-photo-bg.glass-photo-cool {
  background:
    radial-gradient(circle at 22% 28%, #6366F1 0%, transparent 50%),
    radial-gradient(circle at 78% 72%, #0EA5E9 0%, transparent 52%),
    radial-gradient(circle at 50% 95%, #10B981 0%, transparent 60%),
    linear-gradient(135deg, #14141A 0%, #0A0A0E 100%);
}
.glass-photo-bg.glass-photo-warm {
  background:
    radial-gradient(circle at 25% 30%, #FB923C 0%, transparent 48%),
    radial-gradient(circle at 75% 65%, #BE185D 0%, transparent 52%),
    radial-gradient(circle at 50% 95%, #7C2D3C 0%, transparent 60%),
    linear-gradient(135deg, #1F1014 0%, #100808 100%);
}

/* ─────────────────────────────────────────────────────────────
   ANIMAZIONI in loop continuo — pensate per essere SOTTILI,
   non distraggono ma "vivono". Tutte 6–10s, ease-in-out.
   ───────────────────────────────────────────────────────────── */

/* breathing: opacità + scale leggerissimo. Usare su elementi
   "che invitano all'azione" (dropzone empty state, CTA hero). */
@keyframes glass-breathe {
  0%, 100% { transform: scale(1);        filter: brightness(1); }
  50%      { transform: scale(1.012);    filter: brightness(1.04); }
}
.glass-breathe { animation: glass-breathe 4.8s ease-in-out infinite; }

/* shimmer-sweep: gradient bianco che attraversa l'elemento da
   sinistra a destra. Va combinato con overflow:hidden e position:relative
   sul parent. Implementato come pseudo-elemento. */
@keyframes glass-shimmer-sweep {
  0%   { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateX(220%)  skewX(-12deg); opacity: 0; }
}
.glass-shimmer { position: relative; overflow: hidden; isolation: isolate; }
.glass-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent 0%,
    transparent 35%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 65%,
    transparent 100%
  );
  transform: translateX(-100%) skewX(-12deg);
  animation: glass-shimmer-sweep 5.2s ease-in-out infinite;
  animation-delay: 1.4s;
  mix-blend-mode: overlay;
  z-index: 2;
}
.glass-shimmer-dark::after {
  background: linear-gradient(
    100deg,
    transparent 0%,
    transparent 35%,
    rgba(255, 255, 255, 0.18) 50%,
    transparent 65%,
    transparent 100%
  );
  mix-blend-mode: screen;
}

/* pulse-glow: shadow che pulsa — adatto a notification dots,
   live indicators, conti aperti che richiedono attenzione. */
@keyframes glass-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0   rgba(242, 107, 122, 0.45); }
  50%      { box-shadow: 0 0 0 8px rgba(242, 107, 122, 0.00); }
}
.glass-pulse-glow { animation: glass-pulse-glow 2.4s ease-out infinite; }

/* gradient-shift: sfondo gradient che si sposta lentamente —
   per substrati fotografici "vivi" (mesh che si anima). */
@keyframes glass-gradient-shift {
  0%, 100% { background-position: 0%   50%; }
  50%      { background-position: 100% 50%; }
}
.glass-gradient-shift {
  background-size: 200% 200%;
  animation: glass-gradient-shift 14s ease-in-out infinite;
}

/* tilt-hover: micro-tilt 3D solo on :hover, no loop. Per card
   "photo-glass" che devono reagire all'interazione. */
.glass-tilt-hover {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease;
  transform-style: preserve-3d;
  will-change: transform;
}
.glass-tilt-hover:hover {
  transform: perspective(900px) rotateX(2deg) rotateY(-3deg) translateY(-3px);
  box-shadow:
    0 32px 60px -16px rgba(15, 23, 42, 0.30),
    0 12px 24px -8px  rgba(15, 23, 42, 0.20);
}

/* lift-hover: alternativa più sobria — solo lift + shadow. */
.glass-lift-hover {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease;
  will-change: transform;
}
.glass-lift-hover:hover {
  transform: translateY(-2px);
  box-shadow:
    0 18px 36px -10px rgba(15, 23, 42, 0.18),
    0 6px  12px -4px  rgba(15, 23, 42, 0.10);
}

/* icon-wiggle: rotazione minima ciclica per icone hero (no hover) */
@keyframes glass-icon-wiggle {
  0%, 92%, 100% { transform: rotate(0deg) scale(1); }
  94%           { transform: rotate(-4deg) scale(1.05); }
  96%           { transform: rotate(4deg)  scale(1.05); }
  98%           { transform: rotate(0deg)  scale(1); }
}
.glass-icon-wiggle { animation: glass-icon-wiggle 6.5s ease-in-out infinite; }

/* float-soft: oscillazione verticale impercettibile per icone in card
   "hero". Da combinare con glass-icon-wiggle a volte (sfasate). */
@keyframes glass-float-soft {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
.glass-float-soft { animation: glass-float-soft 4.2s ease-in-out infinite; }

/* Respect reduce motion */
@media (prefers-reduced-motion: reduce) {
  .glass-breathe, .glass-pulse-glow, .glass-gradient-shift,
  .glass-icon-wiggle, .glass-float-soft { animation: none !important; }
  .glass-shimmer::after { animation: none !important; opacity: 0 !important; }
}
`;

  const style = document.createElement('style');
  style.id = 'byup-glass-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();

// ─── React wrapper ──────────────────────────────────────────────
// <GlassSurface variant="default|strong|subtle" forceMode="light|dark"
//               as="div|button|aside|..." className extraClass style ...>
//   children
// </GlassSurface>
//
// Note: in questo stack non c'è `cn` né TS, quindi:
// - `className` viene concatenato dopo la classe di variante
// - `forceMode` aggiunge .glass-light o .glass-dark per ignorare prefers-color-scheme
function GlassSurface({
  variant = 'default',
  forceMode,            // 'light' | 'dark' | undefined
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...rest
}) {
  const variantClass =
    variant === 'strong' ? 'glass-strong'
    : variant === 'subtle' ? 'glass-subtle'
    : 'glass';

  const modeClass =
    forceMode === 'dark'  ? 'glass-dark'
    : forceMode === 'light' ? 'glass-light'
    : '';

  const cls = [variantClass, modeClass, className].filter(Boolean).join(' ');
  return <Tag className={cls} style={style} {...rest}>{children}</Tag>;
}

// Substrato mesh helper — montalo come PRIMO figlio del .frame
// (o di un altro contenitore con position:relative + overflow:hidden).
//
//   <GlassMeshSubstrate />               // warm Byup (default)
//   <GlassMeshSubstrate tone="cool" />   // indigo/sky/emerald
//   <GlassMeshSubstrate tone="neutral"/> // solo grigi caldi (pagine dense)
//   <GlassMeshSubstrate fixed />         // position:fixed (consumer/no-frame)
//
// Il substrato è sempre dietro il contenuto (z-index: 0,
// pointer-events: none). Il contenuto della pagina deve avere
// z-index > 0 o position diverso da static per restare sopra:
// nella pratica, ogni layout flex/grid lo è già di default,
// quindi non serve toccare il resto.
function GlassMeshSubstrate({ tone, fixed }) {
  const cls = ['glass-mesh-substrate',
    tone === 'cool'    ? 'glass-mesh-cool'    : '',
    tone === 'neutral' ? 'glass-mesh-neutral' : '',
    fixed              ? 'glass-mesh-fixed'   : ''
  ].filter(Boolean).join(' ');
  const ref = React.useRef(null);

  // A mount: forza isolation:isolate sul genitore. Senza, il substrato
  // (z-index: -1) finirebbe DIETRO il body invece che dietro i figli del
  // .frame. Con isolation:isolate il .frame diventa stacking context,
  // e il -1 resta clippato al suo interno. È idempotente: se l'utente
  // ha già impostato isolation, non viene sovrascritto.
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return;
    const parent = el.parentElement;
    const computed = getComputedStyle(parent).isolation;
    if (computed !== 'isolate') {
      parent.style.isolation = 'isolate';
    }
    // Anche position:relative serve perché absolute si ancora al nearest
    // positioned ancestor — se per qualche motivo il parent fosse static,
    // il substrato sfora fino al body.
    const pos = getComputedStyle(parent).position;
    if (pos === 'static') {
      parent.style.position = 'relative';
    }
  }, []);

  return <div ref={ref} aria-hidden="true" className={cls} />;
}

// ─── GlassDarkBox ───────────────────────────────────────────────
// Wrapper per box con gradient Byup. Supporta due temi distinti:
//
//   theme="light" (default) → coral/salmon/peach brillante (#FF6066
//                              dominante), testo dark wine, ring rosa
//                              soft. Per hero finance, savings, premium
//                              CTA "celebrativi".
//   theme="night"            → gray/nero vero (slate-800/900), testo
//                              bianco, ring inset bianco. Per box
//                              operativi/monitor che richiedono massima
//                              sobrietà (kitchen live, plan upgrade,
//                              focus mode).
//
// Props:
//   theme="light"|"night" → tema del gradient e dei colori interni
//   tone="default"|"deeper"|"lighter" → variante del gradient (solo light)
//   nightAccent (bool) → light coral accent sull'angolo (solo night)
//   padding, borderRadius, animated, as, className, style,
//   liftHover, tilt → come sopra
//
// Note: il componente fornisce SOLO il fondo + l'overlay. I children
// devono usare le color appropriate al tema (light = scuri, night = chiari).
function GlassDarkBox({
  theme = 'light',
  tone,
  nightAccent = false,
  padding = 18,
  borderRadius = 14,
  animated = true,
  as: Tag = 'div',
  className = '',
  style,
  liftHover = false,
  tilt = false,
  children,
  ...rest
}) {
  const isNight  = theme === 'night';
  const isSunset = theme === 'sunset';
  const isDark   = isNight || isSunset;

  const cls = [
    isSunset ? 'glass-sunset-bg' : (isNight ? 'glass-night-bg' : 'glass-photo-bg'),
    !isDark && tone === 'deeper'  ? 'glass-photo-deeper'  : '',
    !isDark && tone === 'lighter' ? 'glass-photo-lighter' : '',
    isNight && nightAccent ? 'glass-night-coral' : '',
    animated  ? 'glass-gradient-shift' : '',
    liftHover ? 'glass-lift-hover'     : '',
    tilt      ? 'glass-tilt-hover'     : '',
    className,
  ].filter(Boolean).join(' ');

  // Tema light: testo dark wine. Tema night/sunset: testo bianco.
  const defaultColor = isDark ? '#F5F5F7' : '#3A0A0E';

  // Overlay differs by theme:
  //   light  → specular bianco top (lente warm su mesh coral chiaro)
  //   night  → overlay scuro per profondità su slate
  //   sunset → overlay neutro scuro tenue + inset ring caldo (peach) come D3
  let overlayBg, overlayShadow;
  if (isSunset) {
    // Overlay sunset = ESATTAMENTE il --box-bg della variant D3 nella preview
    // themes: linear-gradient(180deg, rgba(58, 28, 22, 0.55) → rgba(30, 12, 10, 0.62)).
    // Combinato col backdrop-filter blur(22px) lente la mesh sottostante e produce
    // il warm-brick #611F1F-ish del preview, NON il red-flood scuro.
    overlayBg = 'linear-gradient(180deg, rgba(58, 28, 22, 0.55) 0%, rgba(30, 12, 10, 0.62) 100%)';
    overlayShadow =
      'inset 0 1px 0 rgba(255, 200, 170, 0.22), ' +
      'inset 0 0 0 1px rgba(255, 150, 110, 0.16), ' +
      '0 14px 36px -10px rgba(120, 50, 15, 0.55), ' +
      '0 4px 10px -4px rgba(120, 50, 15, 0.30)';
  } else if (isNight) {
    overlayBg = 'linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0.18) 100%)';
    overlayShadow =
      'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.06), ' +
      '0 12px 32px -10px rgba(0, 0, 0, 0.55), 0 4px 10px -4px rgba(0, 0, 0, 0.30)';
  } else {
    overlayBg = 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.06) 60%, rgba(255, 200, 176, 0.08) 100%)';
    overlayShadow =
      'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 0 0 1px rgba(255, 130, 130, 0.18), ' +
      '0 12px 32px -10px rgba(190, 50, 60, 0.20), 0 4px 10px -4px rgba(190, 50, 60, 0.12)';
  }

  return (
    <Tag
      className={cls}
      style={{
        position: 'relative',
        isolation: 'isolate',
        color: defaultColor,
        padding,
        borderRadius,
        ...style,
      }}
      {...rest}
    >
      {/* Backdrop blur dell'overlay: sunset usa 22px come la variant D3 preview
          themes, così il warm wine wash "lensa" la mesh sottostante e dà l'effetto
          dark-orange profondo. Light/night restano su 6px (lookup classico). */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: -1,
        borderRadius,
        background: overlayBg,
        backdropFilter: isSunset ? 'blur(22px) saturate(170%)' : 'blur(6px) saturate(160%)',
        WebkitBackdropFilter: isSunset ? 'blur(22px) saturate(170%)' : 'blur(6px) saturate(160%)',
        boxShadow: overlayShadow,
      }}/>
      {children}
    </Tag>
  );
}

window.GlassSurface = GlassSurface;
window.GlassMeshSubstrate = GlassMeshSubstrate;
window.GlassDarkBox = GlassDarkBox;

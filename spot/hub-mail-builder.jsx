// Hubble · Il costruttore visuale delle email
//
// Tre colonne: a sinistra i blocchi da aggiungere, al centro la mail come la
// vedrà chi la riceve, a destra le proprietà di quello che hai selezionato.
//
// Il documento è una LISTA DI BLOCCHI, non HTML modificato a mano. L'HTML si
// genera da quella lista quando serve — ed è HTML da email vera: tabelle,
// stili in linea, larghezza fissa a 600px. Le mail non si renderizzano in un
// browser moderno, si renderizzano in Outlook: un builder che sputa <div> con
// flexbox produce anteprime bellissime e mail rotte.

const { useState: useStateMb, useMemo: useMemoMb, useRef: useRefMb } = React;

// ─── Il catalogo dei blocchi ────────────────────────────────────────────────
const MB_BLOCCHI = {
  logo:      { label: 'Logo',      icona: 'image',      desc: 'Il marchio in cima' },
  titolo:    { label: 'Titolo',    icona: 'type',       desc: 'Una riga grande' },
  testo:     { label: 'Testo',     icona: 'list',       desc: 'Un paragrafo' },
  immagine:  { label: 'Immagine',  icona: 'image',      desc: 'Una figura a tutta larghezza' },
  pulsante:  { label: 'Pulsante',  icona: 'cursorClick',desc: 'La chiamata all\'azione' },
  colonne:   { label: 'Due colonne', icona: 'columns',  desc: 'Testo affiancato' },
  divisore:  { label: 'Divisore',  icona: 'sliders',    desc: 'Una riga di separazione' },
  spazio:    { label: 'Spazio',    icona: 'layers',     desc: 'Aria fra due blocchi' },
  social:    { label: 'Social',    icona: 'link',       desc: 'I profili in fondo' },
  footer:    { label: 'Piè di pagina', icona: 'archive', desc: 'Ragione sociale e disiscrizione' },
};

let mbSeq = 0;
const mbId = () => 'b' + (++mbSeq) + '-' + Math.random().toString(36).slice(2, 6);

// Il fondo di un blocco. Tre casi e non due: «niente» non è «bianco» — un
// blocco senza fondo lascia vedere il foglio, e cambiare il foglio li cambia
// tutti; uno con la tinta bianca resta bianco per sempre.
function mbFondoVuoto() { return { tipo: 'nessuno', colore: '#FFF1F4', da: '#FF1F5A', a: '#D410F1', angolo: 135 }; }

function mbFondoCss(f) {
  if (!f || f.tipo === 'nessuno') return null;
  if (f.tipo === 'tinta') return f.colore;
  return `linear-gradient(${f.angolo}deg, ${f.da} 0%, ${f.a} 100%)`;
}
// Nella posta il gradiente non è garantito: Outlook su Windows ignora
// background-image e resta col colore piatto. Quindi si scrive SEMPRE anche
// un background-color di ripiego — che è il primo dei due colori, non il
// bianco: meglio una tinta che una banda vuota in mezzo alla mail.
function mbFondoStileEmail(f) {
  if (!f || f.tipo === 'nessuno') return '';
  if (f.tipo === 'tinta') return `background-color:${f.colore};`;
  return `background-color:${f.da};background-image:linear-gradient(${f.angolo}deg, ${f.da} 0%, ${f.a} 100%);`;
}

const MB_GRADIENTI = [
  { l: 'Hubble',   da: '#FF1F5A', a: '#D410F1', angolo: 135 },
  { l: 'Tramonto', da: '#FF8A00', a: '#FF1F5A', angolo: 120 },
  { l: 'Notte',    da: '#1B0B2E', a: '#5B34D6', angolo: 160 },
  { l: 'Menta',    da: '#0D9488', a: '#2563EB', angolo: 120 },
  { l: 'Carta',    da: '#FAFAFB', a: '#EDEEF1', angolo: 180 },
];

function mbNuovo(tipo) {
  const base = { id: mbId(), tipo, padTop: 14, padBottom: 14, allinea: 'left', fondo: mbFondoVuoto() };
  switch (tipo) {
    case 'logo':     return { ...base, allinea: 'center', src: 'hubble.png', larghezza: 132, padTop: 26, padBottom: 20 };
    case 'titolo':   return { ...base, testo: 'Un titolo che dice la cosa', corpo: 27, colore: '#16181D', peso: 800 };
    case 'testo':    return { ...base, testo: 'Scrivi qui il messaggio. Una mail che si legge in venti secondi viene letta; una che ne chiede due minuti viene archiviata.', corpo: 15.5, colore: '#3A3D45', interlinea: 1.6 };
    case 'immagine': return { ...base, src: '', alt: 'Immagine', raggio: 10 };
    case 'pulsante': return { ...base, allinea: 'center', testo: 'Scopri come funziona', url: 'https://byup.it', sfondo: '#FF1F5A', colore: '#FFFFFF', raggio: 10, padX: 26, padY: 13, corpo: 15.5 };
    case 'colonne':  return { ...base, sx: 'Prima colonna. Utile per due vantaggi affiancati.', dx: 'Seconda colonna. Sulle app di posta strette si impilano da sole.', corpo: 14.5, colore: '#3A3D45' };
    case 'divisore': return { ...base, colore: '#E6E6EB', spessore: 1, padTop: 10, padBottom: 10 };
    case 'spazio':   return { ...base, altezza: 24, padTop: 0, padBottom: 0 };
    case 'social':   return { ...base, allinea: 'center', voci: ['Instagram', 'LinkedIn', 'Sito'], colore: '#6E6E73' };
    case 'footer':   return { ...base, allinea: 'center', testo: 'byup S.r.l. · Via Roma 12, Milano\nRicevi questa email perché sei iscritto a byup.', corpo: 12.5, colore: '#8A8A90', disiscrizione: 'Disiscriviti' };
    default:         return base;
  }
}

// Il documento di partenza: una mail che sta già in piedi. Una tela bianca è
// più onesta ma costa dieci minuti a chiunque debba solo mandare un annuncio.
function mbDocIniziale() {
  return {
    sfondo: '#F1F2F4',
    fondo: mbFondoVuoto(),
    foglio: '#FFFFFF',
    larghezza: 600,
    raggio: 14,
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    blocchi: [
      // La testata parte sfumata di proposito: chi apre il builder deve
      // vedere subito che una sezione può avere un fondo suo, altrimenti la
      // funzione esiste e non la trova nessuno.
      Object.assign(mbNuovo('logo'), { src: 'hubble-badge.png', larghezza: 148,
        fondo: { tipo: 'gradiente', colore: '#FFF1F4', da: '#FF1F5A', a: '#D410F1', angolo: 135 } }),
      Object.assign(mbNuovo('titolo'), { testo: 'Le prenotazioni ora si gestiscono <span style="color: #FF1F5A">da sole</span>' }),
      Object.assign(mbNuovo('testo'), { testo: 'Ciao {{nome}}, da oggi byup accetta, sposta e conferma le prenotazioni senza che nessuno debba stare al telefono. Ecco le <b>tre cose</b> che cambiano nel tuo servizio.' }),
      mbNuovo('pulsante'),
      mbNuovo('divisore'),
      mbNuovo('colonne'),
      mbNuovo('footer'),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Il testo ricco
// ═══════════════════════════════════════════════════════════════════════════
//
// Il testo di un blocco non è più una stringa: è HTML ristretto — grassetto,
// corsivo, sottolineato, colore, corpo, link e campi dinamici. Si scrive
// DIRETTAMENTE nell'anteprima, non in una casella laterale, perché il punto di
// un builder visuale è vedere la parola colorata mentre la si colora.
//
// Due scelte che sembrano dettagli e non lo sono:
//
//  · si tengono solo i tag che la posta capisce (`b/strong`, `i/em`, `u`,
//    `a`, `span` con stile, `br`). Tutto il resto viene tolto quando si
//    incolla: un incollato da Word porta `<o:p>`, classi e font che in Gmail
//    diventano un pasticcio e in Outlook diventano un altro pasticcio;
//  · il colore e il corpo si scrivono su `<span style>` in linea. Le classi
//    CSS in un'email non esistono — molte caselle buttano via il `<style>`.

const MB_TAG_OK = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, A: 1, SPAN: 1, BR: 1, DIV: 1, P: 1 };
const MB_STILI_OK = ['color', 'font-size', 'font-weight', 'font-style', 'text-decoration', 'background-color'];

function mbPulisci(html) {
  const d = document.createElement('div');
  d.innerHTML = String(html == null ? '' : html);
  const cammina = (nodo) => {
    [...nodo.childNodes].forEach(n => {
      if (n.nodeType === 3) return;                       // testo: si tiene
      if (n.nodeType !== 1) { n.remove(); return; }       // commenti e simili: via
      if (!MB_TAG_OK[n.tagName]) {                        // tag sconosciuto: si tiene il contenuto
        cammina(n);
        while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n);
        n.remove();
        return;
      }
      const stile = n.getAttribute('style') || '';
      const tenuti = stile.split(';').map(s => s.trim()).filter(s => {
        const k = s.split(':')[0].trim().toLowerCase();
        return MB_STILI_OK.includes(k);
      });
      [...n.attributes].forEach(a => {
        if (n.tagName === 'A' && (a.name === 'href' || a.name === 'target')) return;
        n.removeAttribute(a.name);
      });
      if (tenuti.length) n.setAttribute('style', tenuti.join('; '));
      cammina(n);
    });
  };
  cammina(d);
  return d.innerHTML;
}

// I testi scritti prima erano stringhe con degli a-capo: si leggono ancora.
const mbRicco = (s) => (s == null ? '' : /[<][a-z/]/i.test(String(s)) ? String(s)
  : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>'));

// Quale campo dinamico si può infilare: il catalogo delle proprietà, lo stesso
// che alimenta filtri, colonne e workflow. Aggiungerne una la fa comparire qui
// da sola — è tutto il senso di avere un catalogo solo.
function mbCampi() {
  const scelti = ['nome', 'email', 'citta', 'piano', 'tipo', 'referral', 'ciclo', 'proprietario'];
  const voci = scelti.map(id => HUB_PROP[id]).filter(Boolean)
    .map(p => ({ id: p.id, label: p.label }));
  return voci.length ? voci : [{ id: 'nome', label: 'Nome' }];
}

const MB_SIMBOLI = ['→', '←', '✓', '✕', '★', '●', '•', '·', '—', '–', '€', '%', '«', '»', '“', '”', '…', '№', '⚡', '🎉', '🍕', '📈'];

// L'editor vivo. È NON CONTROLLATO di proposito: se React riscrivesse
// l'innerHTML a ogni battuta, il cursore tornerebbe all'inizio della riga a
// ogni lettera. L'HTML si imposta quando cambia blocco, e da lì in poi
// comanda il DOM; `ultimo` tiene traccia di che cosa abbiamo emesso noi, così
// una modifica che arriva da fuori si riconosce e si applica.
let mbEditorAttivo = null;

function MbRicco({ chiave, valore, onCambia, onFuoco, stile, placeholder }) {
  const ref = useRefMb(null);
  const ultimo = useRefMb(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = mbRicco(valore);
    ultimo.current = el.innerHTML;
  }, [chiave]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const v = mbRicco(valore);
    if (v !== ultimo.current) { el.innerHTML = v; ultimo.current = v; }
  }, [valore]);

  const emetti = () => {
    const el = ref.current;
    if (!el) return;
    ultimo.current = el.innerHTML;
    onCambia(el.innerHTML);
  };

  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      data-placeholder={placeholder}
      onFocus={() => { mbEditorAttivo = { el: ref.current, emetti }; if (onFuoco) onFuoco(); }}
      onInput={emetti}
      onBlur={() => { const el = ref.current; if (el) { el.innerHTML = mbPulisci(el.innerHTML); } emetti(); }}
      onPaste={(e) => {
        // Incollare da Word o da una pagina porta dentro mezzo foglio di stile.
        // Si prende il testo e basta: la formattazione la si rimette con la
        // barra, in dieci secondi, e la mail resta pulita.
        e.preventDefault();
        const t = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, t);
      }}
      style={Object.assign({ outline: 'none', minHeight: '1em', cursor: 'text' }, stile)}/>
  );
}

// I comandi lavorano sull'editor che ha il fuoco. Se non ce n'è nessuno non
// fanno niente — meglio di applicare il grassetto a un blocco a caso.
function mbComando(cmd, arg) {
  const a = mbEditorAttivo;
  if (!a || !a.el) return;
  a.el.focus();
  try { document.execCommand(cmd, false, arg); } catch (e) { /* niente */ }
  a.emetti();
}
function mbInserisci(html) { mbComando('insertHTML', html); }

// ═══════════════════════════════════════════════════════════════════════════
// Il generatore di HTML — tabelle e stili in linea, come vuole la posta
// ═══════════════════════════════════════════════════════════════════════════

const mbEsc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function mbBloccoHtml(b, doc) {
  const pad = `padding:${b.padTop}px 28px ${b.padBottom}px;`;
  const al = `text-align:${b.allinea || 'left'};`;
  const bg = mbFondoStileEmail(b.fondo);
  const R = (dentro, extra) => `<tr><td style="${pad}${al}${bg}${extra || ''}">${dentro}</td></tr>`;
  switch (b.tipo) {
    case 'logo':
      return R(`<img src="${mbEsc(b.src)}" width="${b.larghezza}" alt="Hubble" style="display:inline-block;border:0;width:${b.larghezza}px;max-width:100%;height:auto;"/>`);
    case 'titolo':
      return R(mbRicco(b.testo), `font-size:${b.corpo}px;font-weight:${b.peso};color:${b.colore};line-height:1.25;letter-spacing:-0.02em;`);
    case 'testo':
      return R(mbRicco(b.testo), `font-size:${b.corpo}px;color:${b.colore};line-height:${b.interlinea};`);
    case 'immagine':
      return R(b.src
        ? `<img src="${mbEsc(b.src)}" alt="${mbEsc(b.alt)}" style="display:block;width:100%;height:auto;border:0;border-radius:${b.raggio}px;"/>`
        : `<div style="background:#EDEEF1;border-radius:${b.raggio}px;padding:44px 0;color:#8A8A90;font-size:13px;">Nessuna immagine caricata</div>`);
    case 'pulsante':
      return R(`<a href="${mbEsc(b.url)}" style="display:inline-block;background:${b.sfondo};color:${b.colore};`
        + `font-size:${b.corpo}px;font-weight:700;text-decoration:none;border-radius:${b.raggio}px;`
        + `padding:${b.padY}px ${b.padX}px;">${mbEsc(b.testo)}</a>`);
    case 'colonne':
      return R(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`
        + `<td class="hb-col" width="50%" valign="top" style="padding-right:10px;font-size:${b.corpo}px;color:${b.colore};line-height:1.6;">${mbRicco(b.sx)}</td>`
        + `<td class="hb-col" width="50%" valign="top" style="padding-left:10px;font-size:${b.corpo}px;color:${b.colore};line-height:1.6;">${mbRicco(b.dx)}</td>`
        + `</tr></table>`);
    case 'divisore':
      return R(`<div style="border-top:${b.spessore}px solid ${b.colore};font-size:0;line-height:0;">&nbsp;</div>`);
    case 'spazio':
      return `<tr><td style="height:${b.altezza}px;${bg}font-size:0;line-height:0;">&nbsp;</td></tr>`;
    case 'social':
      return R(b.voci.map(v => `<a href="#" style="color:${b.colore};text-decoration:underline;margin:0 8px;">${mbEsc(v)}</a>`).join(''),
        `font-size:13px;color:${b.colore};`);
    case 'footer':
      return R(`${mbRicco(b.testo)}<br/><a href="{{unsubscribe}}" style="color:${b.colore};">${mbEsc(b.disiscrizione)}</a>`,
        `font-size:${b.corpo}px;color:${b.colore};line-height:1.6;`);
    default: return '';
  }
}

function mbHtml(doc, meta) {
  const corpo = doc.blocchi.map(b => mbBloccoHtml(b, doc)).join('\n      ');
  const sfondo = mbFondoStileEmail(doc.fondo) || `background-color:${doc.sfondo};`;
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${mbEsc((meta && meta.oggetto) || 'byup')}</title>
  <style type="text/css">
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
    img { border:0; outline:none; text-decoration:none; }
    @media only screen and (max-width:620px) {
      .hb-foglio { width:100% !important; border-radius:0 !important; }
      .hb-col { display:block !important; width:100% !important; padding:0 0 14px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;${sfondo}font-family:${doc.font};">
  <!-- testo di anteprima: si legge nella lista della posta, non nella mail -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${mbEsc((meta && meta.anteprima) || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${sfondo}">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" class="hb-foglio" width="${doc.larghezza}" cellpadding="0" cellspacing="0" border="0"
        style="width:${doc.larghezza}px;max-width:100%;background:${doc.foglio};border-radius:${doc.raggio}px;overflow:hidden;">
      ${corpo}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// L'anteprima — gli stessi blocchi, disegnati in React
// ═══════════════════════════════════════════════════════════════════════════

function MbBlocco({ b, doc, selezionato, onSeleziona, onSu, onGiu, onElimina, onDuplica, onTesto }) {
  const [sopra, setSopra] = useStateMb(false);
  const fondo = mbFondoCss(b.fondo);
  const pad = {
    paddingTop: b.padTop, paddingBottom: b.padBottom, paddingLeft: 28, paddingRight: 28,
    textAlign: b.allinea, background: fondo || undefined,
  };

  // Il testo si scrive QUI, non in una casella laterale: è l'unico modo di
  // vedere la parola colorata mentre la si colora.
  const ricco = (campo, stile) => (
    <MbRicco chiave={b.id + campo} valore={b[campo]} stile={stile}
      onFuoco={() => onSeleziona(b.id)}
      onCambia={v => onTesto(b.id, campo, v)}/>
  );

  const dentro = () => {
    switch (b.tipo) {
      case 'logo':     return <img src={b.src} alt="Hubble" style={{ width: b.larghezza, maxWidth: '100%', display: 'inline-block' }}/>;
      case 'titolo':   return ricco('testo', { fontSize: b.corpo, fontWeight: b.peso, color: b.colore, lineHeight: 1.25, letterSpacing: '-0.02em' });
      case 'testo':    return ricco('testo', { fontSize: b.corpo, color: b.colore, lineHeight: b.interlinea });
      case 'immagine': return b.src
        ? <img src={b.src} alt={b.alt} style={{ width: '100%', display: 'block', borderRadius: b.raggio }}/>
        : <div style={{ background: '#EDEEF1', borderRadius: b.raggio, padding: '44px 0', color: '#8A8A90', fontSize: 13, textAlign: 'center' }}>Nessuna immagine caricata</div>;
      case 'pulsante': return (
        <span style={{
          display: 'inline-block', background: b.sfondo, color: b.colore, fontSize: b.corpo, fontWeight: 700,
          borderRadius: b.raggio, padding: `${b.padY}px ${b.padX}px`,
        }}>{b.testo}</span>
      );
      case 'colonne': return (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>{ricco('sx', { fontSize: b.corpo, color: b.colore, lineHeight: 1.6 })}</div>
          <div style={{ flex: 1, minWidth: 0 }}>{ricco('dx', { fontSize: b.corpo, color: b.colore, lineHeight: 1.6 })}</div>
        </div>
      );
      case 'divisore': return <div style={{ borderTop: `${b.spessore}px solid ${b.colore}` }}/>;
      case 'spazio':   return <div style={{ height: b.altezza }}/>;
      case 'social':   return (
        <div style={{ fontSize: 13, color: b.colore }}>
          {b.voci.map(v => <span key={v} style={{ margin: '0 8px', textDecoration: 'underline' }}>{v}</span>)}
        </div>
      );
      case 'footer':   return (
        <div style={{ fontSize: b.corpo, color: b.colore, lineHeight: 1.6 }}>
          {ricco('testo', {})}<span style={{ textDecoration: 'underline' }}>{b.disiscrizione}</span>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div onClick={(e) => { e.stopPropagation(); onSeleziona(b.id); }}
      onMouseEnter={() => setSopra(true)} onMouseLeave={() => setSopra(false)}
      style={{
        position: 'relative', cursor: 'pointer',
        outline: selezionato ? `2px solid ${ADM.PINK}` : sopra ? `1px dashed ${ADM.HUB_MAGENTA}` : '2px solid transparent',
        outlineOffset: -1, borderRadius: 4, transition: 'outline-color 0.12s ease',
      }}>
      <div style={pad}>{dentro()}</div>

      {/* L'etichetta e i comandi del blocco stanno FUORI dal foglio, a
          sinistra: dentro coprirebbero il contenuto proprio mentre lo si
          guarda, ed è il contenuto che si sta giudicando. */}
      {(selezionato || sopra) && (
        <React.Fragment>
          <span style={{
            position: 'absolute', top: 0, left: -8, transform: 'translateX(-100%)',
            fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            background: selezionato ? ADM.PINK : ADM.HUB_MAGENTA, color: '#fff',
            padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>{MB_BLOCCHI[b.tipo].label}</span>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', top: 0, right: -8, transform: 'translateX(100%)',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {[
              { t: 'Sposta su', i: 'chevronUp', f: onSu },
              { t: 'Sposta giù', i: 'chevronDown', f: onGiu },
              { t: 'Duplica', i: 'copy', f: onDuplica },
              { t: 'Elimina', i: 'trash', f: onElimina },
            ].map(a => {
              const Ic = BuIcons[a.i];
              return (
                <button key={a.t} title={a.t} onClick={a.f} style={{
                  width: 24, height: 24, borderRadius: 6, display: 'grid', placeItems: 'center',
                  border: `1px solid ${ADM.BORDER}`, background: '#fff', cursor: 'pointer',
                  color: a.i === 'trash' ? ADM.DANGER : ADM.MUTED, boxShadow: '0 1px 3px rgba(15,17,21,0.10)',
                }}><Ic size={13}/></button>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// L'ispettore — le proprietà del blocco selezionato
// ═══════════════════════════════════════════════════════════════════════════

function MbColore({ label, valore, onCambia }) {
  return (
    <HubCampo label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="color" value={valore} onChange={e => onCambia(e.target.value)}
          style={{ width: 34, height: 32, padding: 2, border: `1px solid ${ADM.BORDER}`, borderRadius: 7, background: '#fff', cursor: 'pointer', flexShrink: 0 }}/>
        <HubInput valore={valore} onCambia={onCambia}/>
      </div>
    </HubCampo>
  );
}

function MbCursore({ label, valore, onCambia, min, max, unita = 'px' }) {
  return (
    <HubCampo label={`${label} · ${valore}${unita}`}>
      <input type="range" min={min} max={max} value={valore} onChange={e => onCambia(Number(e.target.value))}
        style={{ width: '100%', accentColor: ADM.PINK }}/>
    </HubCampo>
  );
}

// ─── La barra della formattazione ───────────────────────────────────────────
//
// Agisce sulla SELEZIONE dentro l'anteprima. Sta nell'ispettore e non fluttua
// sopra il testo per una ragione precisa: il frame ha uno `zoom` applicato via
// JS, e un pannello `position: fixed` lì dentro si disegna in un punto e
// riceve i click in un altro — è il bug che fa dire «il menu è coperto».

function MbBottoneStrumento({ icona, testo, titolo, onClick, largo }) {
  const Ic = icona ? BuIcons[icona] : null;
  return (
    <button type="button" title={titolo} onMouseDown={e => e.preventDefault()} onClick={onClick} style={{
      minWidth: largo ? 'auto' : 30, height: 30, padding: largo ? '0 9px' : 0, borderRadius: 7,
      border: `1px solid ${ADM.BORDER}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
      color: ADM.TEXT, display: 'inline-grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
    }}>{Ic ? <Ic size={14}/> : testo}</button>
  );
}

// Non prende in ingresso il blocco: lavora sulla selezione dell'editor che ha
// il fuoco, qualunque esso sia. Così la stessa barra serve la mail e il form.
function MbBarraTesto() {
  const [pannello, setPannello] = useStateMb(null); // 'campi' | 'simboli' | 'link' | 'colore'
  const [url, setUrl] = useStateMb('https://');
  const [tinta, setTinta] = useStateMb(ADM.PINK);

  const campi = mbCampi();

  return (
    <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 11, background: ADM.PANEL_SOFT, padding: 9 }}>
      <div style={{ fontSize: 10.6, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 7 }}>
        Formatta la selezione
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <MbBottoneStrumento titolo="Grassetto"     testo={<strong>B</strong>} onClick={() => mbComando('bold')}/>
        <MbBottoneStrumento titolo="Corsivo"       testo={<em style={{ fontFamily: 'Georgia, serif' }}>I</em>} onClick={() => mbComando('italic')}/>
        <MbBottoneStrumento titolo="Sottolineato"  testo={<span style={{ textDecoration: 'underline' }}>U</span>} onClick={() => mbComando('underline')}/>
        <span style={{ width: 1, background: ADM.BORDER, margin: '0 3px' }}/>
        <MbBottoneStrumento titolo="Più grande" testo="A+" largo onClick={() => mbComando('fontSize', '5')}/>
        <MbBottoneStrumento titolo="Più piccolo" testo="A−" largo onClick={() => mbComando('fontSize', '2')}/>
        <MbBottoneStrumento titolo="Torna normale" icona="refresh" onClick={() => mbComando('removeFormat')}/>
        <span style={{ width: 1, background: ADM.BORDER, margin: '0 3px' }}/>
        <MbBottoneStrumento titolo="Colora le parole scelte" icona="paint" onClick={() => setPannello(p => p === 'colore' ? null : 'colore')}/>
        <MbBottoneStrumento titolo="Metti un link" icona="link" onClick={() => setPannello(p => p === 'link' ? null : 'link')}/>
        <MbBottoneStrumento titolo="Campo dinamico" icona="tag" onClick={() => setPannello(p => p === 'campi' ? null : 'campi')}/>
        <MbBottoneStrumento titolo="Simboli" icona="sparkles" onClick={() => setPannello(p => p === 'simboli' ? null : 'simboli')}/>
      </div>

      {pannello === 'colore' && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {[ADM.PINK, ADM.HUB_MAGENTA, ADM.HUB_VIOLA, ADM.OK, ADM.WARN, ADM.INFO, ADM.TEAL, '#16181D', '#8A8A90'].map(c => (
              <button key={c} title={c} onMouseDown={e => e.preventDefault()} onClick={() => mbComando('foreColor', c)}
                style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid rgba(0,0,0,0.12)`, background: c, cursor: 'pointer' }}/>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <input type="color" value={tinta} onChange={e => setTinta(e.target.value)}
              style={{ width: 32, height: 30, padding: 2, border: `1px solid ${ADM.BORDER}`, borderRadius: 7, background: '#fff', cursor: 'pointer' }}/>
            <button onMouseDown={e => e.preventDefault()} onClick={() => mbComando('foreColor', tinta)} style={{
              flex: 1, padding: '7px 10px', borderRadius: 8, border: `1px solid ${ADM.BORDER}`, background: '#fff',
              fontSize: 12.6, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: ADM.TEXT,
            }}>Colora così</button>
            <button onMouseDown={e => e.preventDefault()} onClick={() => mbComando('hiliteColor', tinta)} title="Evidenzia lo sfondo delle parole" style={{
              padding: '7px 10px', borderRadius: 8, border: `1px solid ${ADM.BORDER}`, background: '#fff',
              fontSize: 12.6, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: ADM.MUTED,
            }}>Evidenzia</button>
          </div>
        </div>
      )}

      {pannello === 'link' && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}><HubInput valore={url} onCambia={setUrl} placeholder="https://…"/></div>
          <button onMouseDown={e => e.preventDefault()} onClick={() => mbComando('createLink', url)} style={{
            padding: '0 12px', borderRadius: 8, border: 'none', background: ADM.PINK, color: '#fff',
            fontSize: 12.8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Lega</button>
        </div>
      )}

      {pannello === 'campi' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11.6, color: ADM.MUTED, marginBottom: 6, lineHeight: 1.45 }}>
            Al momento dell'invio prende il valore di quel contatto. Se è vuoto resta vuoto: metti un ripiego nel testo attorno.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {campi.map(c => (
              <button key={c.id} onMouseDown={e => e.preventDefault()}
                onClick={() => mbInserisci('{{' + c.id + '}}')} style={{
                  padding: '4px 9px', borderRadius: 999, border: `1px solid ${ADM.BORDER}`, background: '#fff',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: ADM.TEXT,
                }}>{c.label}</button>
            ))}
          </div>
        </div>
      )}

      {pannello === 'simboli' && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {MB_SIMBOLI.map(s => (
            <button key={s} onMouseDown={e => e.preventDefault()} onClick={() => mbInserisci(s)} style={{
              width: 30, height: 30, borderRadius: 7, border: `1px solid ${ADM.BORDER}`, background: '#fff',
              fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', color: ADM.TEXT,
            }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11.4, color: ADM.MUTED_SOFT, lineHeight: 1.45 }}>
        Scrivi direttamente nell'anteprima: seleziona una parola e poi premi qui.
      </div>
    </div>
  );
}

// ─── Il fondo di una sezione ────────────────────────────────────────────────

function MbFondo({ valore, onCambia, titolo = 'Fondo della sezione' }) {
  const f = valore || mbFondoVuoto();
  const set = (patch) => onCambia(Object.assign({}, f, patch));
  return (
    <HubCampo label={titolo}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(120,120,128,0.12)', borderRadius: 9 }}>
          {[{ id: 'nessuno', l: 'Niente' }, { id: 'tinta', l: 'Tinta unita' }, { id: 'gradiente', l: 'Sfumato' }].map(o => (
            <button key={o.id} onClick={() => set({ tipo: o.id })} style={{
              flex: 1, padding: '6px 4px', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.2, fontWeight: 700, background: f.tipo === o.id ? '#fff' : 'transparent',
              color: f.tipo === o.id ? ADM.TEXT : ADM.MUTED,
              boxShadow: f.tipo === o.id ? '0 1px 3px rgba(15,17,21,0.10)' : 'none',
            }}>{o.l}</button>
          ))}
        </div>

        {f.tipo === 'tinta' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={f.colore} onChange={e => set({ colore: e.target.value })}
              style={{ width: 34, height: 32, padding: 2, border: `1px solid ${ADM.BORDER}`, borderRadius: 7, background: '#fff', cursor: 'pointer', flexShrink: 0 }}/>
            <HubInput valore={f.colore} onCambia={v => set({ colore: v })}/>
          </div>
        )}

        {f.tipo === 'gradiente' && (
          <React.Fragment>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {MB_GRADIENTI.map(g => (
                <button key={g.l} title={g.l} onClick={() => set({ da: g.da, a: g.a, angolo: g.angolo })} style={{
                  width: 44, height: 26, borderRadius: 7, cursor: 'pointer',
                  border: `1px solid ${f.da === g.da && f.a === g.a ? ADM.PINK : 'rgba(0,0,0,0.12)'}`,
                  background: `linear-gradient(${g.angolo}deg, ${g.da} 0%, ${g.a} 100%)`,
                }}/>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <input type="color" value={f.da} onChange={e => set({ da: e.target.value })}
                style={{ width: 34, height: 32, padding: 2, border: `1px solid ${ADM.BORDER}`, borderRadius: 7, background: '#fff', cursor: 'pointer' }}/>
              <BuIcons.arrowRight size={13} color={ADM.MUTED_LIGHT}/>
              <input type="color" value={f.a} onChange={e => set({ a: e.target.value })}
                style={{ width: 34, height: 32, padding: 2, border: `1px solid ${ADM.BORDER}`, borderRadius: 7, background: '#fff', cursor: 'pointer' }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input type="range" min={0} max={360} value={f.angolo} onChange={e => set({ angolo: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: ADM.PINK }}/>
              </div>
              <span style={{ fontSize: 11.6, fontWeight: 700, color: ADM.MUTED, width: 34, textAlign: 'right' }}>{f.angolo}°</span>
            </div>
            {/* Va detto adesso, non quando la mail è già partita. */}
            <div style={{ fontSize: 11.4, color: ADM.WARN, lineHeight: 1.45, background: ADM.WARN_SOFT, padding: '7px 9px', borderRadius: 8 }}>
              Outlook su Windows ignora le sfumature: lì si vedrà il primo colore pieno. L'HTML lo scrive già come ripiego.
            </div>
          </React.Fragment>
        )}
      </div>
    </HubCampo>
  );
}

// ─── Il caricamento di un'immagine o di una GIF ─────────────────────────────

function MbCarica({ valore, onCambia, alt, onAlt }) {
  const input = useRefMb(null);
  const [errore, setErrore] = useStateMb(null);
  const gif = /^data:image\/gif|\.gif($|\?)/i.test(valore || '');

  const prendi = (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { setErrore('Non è un\'immagine.'); return; }
    // 2 MB: oltre, una mail impiega troppo a scaricarsi e molte caselle la
    // tagliano. Nel prototipo il file diventa un data URL; in produzione va
    // caricato su una CDN e nell'HTML ci finisce l'indirizzo.
    if (file.size > 2 * 1024 * 1024) { setErrore('Più di 2 MB: troppo per una mail.'); return; }
    const r = new FileReader();
    r.onload = () => { setErrore(null); onCambia(String(r.result)); };
    r.readAsDataURL(file);
  };

  return (
    <HubCampo label="L'immagine" nota="PNG, JPG o GIF animata. Fino a 2 MB.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {valore ? (
          <div style={{ position: 'relative', border: `1px solid ${ADM.BORDER}`, borderRadius: 10, overflow: 'hidden', background: ADM.NEUTRAL_SOFT }}>
            <img src={valore} alt="" style={{ width: '100%', display: 'block', maxHeight: 130, objectFit: 'cover' }}/>
            {gif && (
              <span style={{
                position: 'absolute', top: 6, left: 6, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                background: ADM.HUB_VIOLA, color: '#fff', padding: '2px 6px', borderRadius: 4,
              }}>GIF</span>
            )}
            <button onClick={() => onCambia('')} title="Togli" style={{
              position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6,
              border: 'none', background: 'rgba(15,17,21,0.7)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}><BuIcons.x size={13}/></button>
          </div>
        ) : (
          <div onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); prendi(e.dataTransfer.files && e.dataTransfer.files[0]); }}
            onClick={() => input.current && input.current.click()}
            style={{
              border: `1.5px dashed ${ADM.BORDER}`, borderRadius: 10, padding: '20px 12px', textAlign: 'center',
              cursor: 'pointer', background: '#fff',
            }}>
            <BuIcons.upload size={18} color={ADM.MUTED_LIGHT}/>
            <div style={{ fontSize: 12.6, fontWeight: 700, color: ADM.TEXT, marginTop: 6 }}>Trascina qui, o scegli un file</div>
            <div style={{ fontSize: 11.4, color: ADM.MUTED_SOFT, marginTop: 2 }}>Le GIF animate funzionano ovunque tranne in Outlook, che mostra il primo fotogramma.</div>
          </div>
        )}
        <input ref={input} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => prendi(e.target.files && e.target.files[0])}/>
        {errore && <div style={{ fontSize: 11.8, color: ADM.DANGER, fontWeight: 600 }}>{errore}</div>}
        <HubInput valore={/^data:/.test(valore || '') ? '' : valore} onCambia={onCambia} placeholder="…oppure incolla un indirizzo https://"/>
        {onAlt && (
          <HubInput valore={alt} onCambia={onAlt} placeholder="Testo alternativo — si legge quando le immagini sono bloccate"/>
        )}
      </div>
    </HubCampo>
  );
}

function MbAllinea({ valore, onCambia }) {
  const voci = [{ id: 'left', l: 'Sinistra' }, { id: 'center', l: 'Centro' }, { id: 'right', l: 'Destra' }];
  return (
    <HubCampo label="Allineamento">
      <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(120,120,128,0.12)', borderRadius: 9 }}>
        {voci.map(v => (
          <button key={v.id} onClick={() => onCambia(v.id)} style={{
            flex: 1, padding: '6px 4px', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12.6, fontWeight: 600, background: valore === v.id ? '#fff' : 'transparent',
            color: valore === v.id ? ADM.TEXT : ADM.MUTED,
            boxShadow: valore === v.id ? '0 1px 3px rgba(15,17,21,0.10)' : 'none',
          }}>{v.l}</button>
        ))}
      </div>
    </HubCampo>
  );
}

function MbIspettore({ b, doc, onCambia, onDoc }) {
  if (!b) {
    // Niente selezionato: si mostrano le proprietà del foglio. Uno spazio
    // vuoto che dice «seleziona qualcosa» è uno spazio sprecato.
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>La mail nel suo insieme</div>
        <MbFondo titolo="Sfondo attorno al foglio" valore={doc.fondo} onCambia={v => onDoc('fondo', v)}/>
        {(!doc.fondo || doc.fondo.tipo === 'nessuno') && <MbColore label="…o una tinta semplice" valore={doc.sfondo} onCambia={v => onDoc('sfondo', v)}/>}
        <MbColore label="Colore del foglio" valore={doc.foglio} onCambia={v => onDoc('foglio', v)}/>
        <MbCursore label="Larghezza" valore={doc.larghezza} onCambia={v => onDoc('larghezza', v)} min={480} max={720}/>
        <MbCursore label="Angoli" valore={doc.raggio} onCambia={v => onDoc('raggio', v)} min={0} max={28}/>
        <div style={{
          padding: 12, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`,
          fontSize: 12.5, color: ADM.MUTED, lineHeight: 1.55,
        }}>
          Clicca un blocco nell'anteprima per modificarlo. Le proprietà che vedi qui valgono per tutta la mail.
        </div>
      </div>
    );
  }
  const set = (k) => (v) => onCambia(b.id, k, v);
  const conTesto = b.tipo === 'titolo' || b.tipo === 'testo' || b.tipo === 'colonne' || b.tipo === 'footer';
  const comuni = (
    <React.Fragment>
      {/* Il fondo vale per QUALSIASI blocco: è così che si fa una sezione
          colorata in mezzo a una mail bianca senza inventare un blocco
          «sezione» che poi va spiegato. */}
      <MbFondo valore={b.fondo} onCambia={set('fondo')}/>
      <MbCursore label="Spazio sopra" valore={b.padTop} onCambia={set('padTop')} min={0} max={60}/>
      <MbCursore label="Spazio sotto" valore={b.padBottom} onCambia={set('padBottom')} min={0} max={60}/>
    </React.Fragment>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: ADM.PINK_SOFT, color: ADM.PINK }}>
          {React.createElement(BuIcons[MB_BLOCCHI[b.tipo].icona], { size: 14 })}
        </span>
        <span style={{ fontSize: 14.4, fontWeight: 700, color: ADM.TEXT }}>{MB_BLOCCHI[b.tipo].label}</span>
      </div>

      {conTesto && <MbBarraTesto/>}

      {(b.tipo === 'titolo' || b.tipo === 'testo') && (
        <React.Fragment>
          <MbCursore label="Corpo di partenza" valore={b.corpo} onCambia={set('corpo')} min={11} max={44}/>
          <MbColore label="Colore di partenza" valore={b.colore} onCambia={set('colore')}/>
          <MbAllinea valore={b.allinea} onCambia={set('allinea')}/>
        </React.Fragment>
      )}
      {b.tipo === 'logo' && (
        <React.Fragment>
          <HubCampo label="File" nota="Nel prototipo si sceglie fra gli asset già caricati.">
            <AdmSelect block value={b.src} onChange={set('src')} options={[
              { value: 'hubble.png', label: 'Hubble · lockup a colori' },
              { value: 'hubble-mark.png', label: 'Hubble · solo marchio' },
              { value: 'byup.png', label: 'byup · lockup' },
            ]}/>
          </HubCampo>
          <MbCursore label="Larghezza" valore={b.larghezza} onCambia={set('larghezza')} min={60} max={320}/>
          <MbAllinea valore={b.allinea} onCambia={set('allinea')}/>
        </React.Fragment>
      )}
      {b.tipo === 'immagine' && (
        <React.Fragment>
          <MbCarica valore={b.src} onCambia={set('src')} alt={b.alt} onAlt={set('alt')}/>
          <MbCursore label="Angoli" valore={b.raggio} onCambia={set('raggio')} min={0} max={24}/>
        </React.Fragment>
      )}
      {b.tipo === 'pulsante' && (
        <React.Fragment>
          <HubCampo label="Testo del pulsante"><HubInput valore={b.testo} onCambia={set('testo')}/></HubCampo>
          <HubCampo label="Dove porta"><HubInput valore={b.url} onCambia={set('url')} placeholder="https://…"/></HubCampo>
          <MbColore label="Sfondo" valore={b.sfondo} onCambia={set('sfondo')}/>
          <MbColore label="Testo" valore={b.colore} onCambia={set('colore')}/>
          <MbCursore label="Angoli" valore={b.raggio} onCambia={set('raggio')} min={0} max={30}/>
          <MbAllinea valore={b.allinea} onCambia={set('allinea')}/>
        </React.Fragment>
      )}
      {b.tipo === 'colonne' && (
        <React.Fragment>
          <div style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.5 }}>
            Le due colonne si scrivono direttamente nell'anteprima. Sui telefoni si impilano da sole.
          </div>
          <MbCursore label="Corpo" valore={b.corpo} onCambia={set('corpo')} min={11} max={22}/>
          <MbColore label="Colore" valore={b.colore} onCambia={set('colore')}/>
        </React.Fragment>
      )}
      {b.tipo === 'divisore' && (
        <React.Fragment>
          <MbColore label="Colore" valore={b.colore} onCambia={set('colore')}/>
          <MbCursore label="Spessore" valore={b.spessore} onCambia={set('spessore')} min={1} max={6}/>
        </React.Fragment>
      )}
      {b.tipo === 'spazio' && <MbCursore label="Altezza" valore={b.altezza} onCambia={set('altezza')} min={8} max={90}/>}
      {b.tipo === 'social' && (
        <React.Fragment>
          <HubCampo label="Voci" nota="Una per riga.">
            <HubArea valore={b.voci.join('\n')} onCambia={v => set('voci')(v.split('\n').filter(Boolean))} righe={3}/>
          </HubCampo>
          <MbColore label="Colore" valore={b.colore} onCambia={set('colore')}/>
        </React.Fragment>
      )}
      {b.tipo === 'footer' && (
        <React.Fragment>
          <div style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.5 }}>
            Ragione sociale e indirizzo sono obbligatori negli invii commerciali. Si scrivono nell'anteprima.
          </div>
          <HubCampo label="Parola per la disiscrizione"><HubInput valore={b.disiscrizione} onCambia={set('disiscrizione')}/></HubCampo>
          <MbColore label="Colore" valore={b.colore} onCambia={set('colore')}/>
        </React.Fragment>
      )}
      {b.tipo !== 'spazio' && comuni}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Il costruttore
// ═══════════════════════════════════════════════════════════════════════════

function HubMailBuilder({ doc, onDoc, meta }) {
  const [sel, setSel] = useStateMb(null);
  const [vista, setVista] = useStateMb('desktop');
  const [codice, setCodice] = useStateMb(false);

  const blocco = doc.blocchi.find(b => b.id === sel) || null;
  const setDoc = (k, v) => onDoc(Object.assign({}, doc, { [k]: v }));
  const setBlocchi = (bs) => onDoc(Object.assign({}, doc, { blocchi: bs }));
  const cambia = (id, k, v) => setBlocchi(doc.blocchi.map(b => b.id === id ? Object.assign({}, b, { [k]: v }) : b));
  const aggiungi = (tipo) => {
    const nuovo = mbNuovo(tipo);
    const i = sel ? doc.blocchi.findIndex(b => b.id === sel) : doc.blocchi.length - 1;
    const bs = doc.blocchi.slice();
    bs.splice(i + 1, 0, nuovo);
    setBlocchi(bs); setSel(nuovo.id);
  };
  const muovi = (id, d) => {
    const i = doc.blocchi.findIndex(b => b.id === id);
    const j = i + d;
    if (i < 0 || j < 0 || j >= doc.blocchi.length) return;
    const bs = doc.blocchi.slice();
    [bs[i], bs[j]] = [bs[j], bs[i]];
    setBlocchi(bs);
  };
  const elimina = (id) => { setBlocchi(doc.blocchi.filter(b => b.id !== id)); setSel(null); };
  const duplica = (id) => {
    const i = doc.blocchi.findIndex(b => b.id === id);
    const copia = Object.assign({}, doc.blocchi[i], { id: mbId() });
    const bs = doc.blocchi.slice(); bs.splice(i + 1, 0, copia);
    setBlocchi(bs); setSel(copia.id);
  };

  const html = useMemoMb(() => mbHtml(doc, meta), [doc, meta]);
  const largh = vista === 'mobile' ? 380 : doc.larghezza;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '212px minmax(0,1fr) 280px',
      border: `1px solid ${ADM.BORDER}`, borderRadius: 14, overflow: 'hidden',
      background: '#fff', boxShadow: ADM.CARD_SHADOW, minHeight: 620,
    }}>
      {/* Blocchi da aggiungere */}
      <div style={{ borderRight: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 14px 9px', fontSize: 11.2, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Blocchi</div>
        <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '0 10px 14px' }}>
          {Object.keys(MB_BLOCCHI).map(t => {
            const d = MB_BLOCCHI[t];
            const Ic = BuIcons[d.icona];
            return (
              <button key={t} onClick={() => aggiungi(t)} className="adm-actionrow" title={d.desc}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                  padding: '8px 9px', marginBottom: 3, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid transparent`, background: 'transparent',
                }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: '#fff', border: `1px solid ${ADM.BORDER}`, color: ADM.MUTED, flexShrink: 0 }}>
                  <Ic size={14}/>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.4, fontWeight: 600, color: ADM.TEXT }}>{d.label}</span>
                </span>
                <BuIcons.plus size={13} color={ADM.MUTED_LIGHT}/>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anteprima */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          padding: '10px 14px', borderBottom: `1px solid ${ADM.BORDER}`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: '#fff',
        }}>
          <HubSegmenti attivo={vista} onCambia={setVista} voci={[
            { id: 'desktop', label: 'Desktop' }, { id: 'mobile', label: 'Telefono' },
          ]}/>
          <div style={{ flex: 1 }}/>
          <HubStrumento icona="code" acceso={codice} onClick={() => setCodice(c => !c)}>Codice HTML</HubStrumento>
        </div>
        <div className="hub-scroll" style={{ flex: 1, minHeight: 0, background: mbFondoCss(doc.fondo) || doc.sfondo, padding: '26px 60px' }}
          onClick={() => setSel(null)}>
          {codice ? (
            <pre style={{
              margin: 0, padding: 16, background: '#0F1115', color: '#D5D8DE', borderRadius: 12,
              fontSize: 11.4, lineHeight: 1.6, overflow: 'auto', fontFamily: 'ui-monospace, monospace',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{html}</pre>
          ) : (
            <div style={{
              width: largh, maxWidth: '100%', margin: '0 auto', background: doc.foglio,
              borderRadius: doc.raggio, boxShadow: '0 12px 34px -14px rgba(15,17,21,0.28)',
              fontFamily: doc.font, transition: 'width 0.25s cubic-bezier(0.32,0.72,0,1)',
            }}>
              {doc.blocchi.map(b => (
                <MbBlocco key={b.id} b={b} doc={doc} selezionato={sel === b.id}
                  onSeleziona={setSel} onTesto={cambia}
                  onSu={() => muovi(b.id, -1)} onGiu={() => muovi(b.id, 1)}
                  onElimina={() => elimina(b.id)} onDuplica={() => duplica(b.id)}/>
              ))}
              {doc.blocchi.length === 0 && (
                <div style={{ padding: '60px 24px', textAlign: 'center', color: ADM.MUTED, fontSize: 13.5 }}>
                  La mail è vuota. Aggiungi un blocco dalla colonna di sinistra.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ispettore */}
      <div className="hub-scroll" style={{ borderLeft: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT, padding: 14 }}>
        <MbIspettore b={blocco} doc={doc} onCambia={cambia} onDoc={setDoc}/>
      </div>
    </div>
  );
}

window.HubMailBuilder = HubMailBuilder;
window.mbDocIniziale = mbDocIniziale;
window.mbHtml = mbHtml;
window.MB_BLOCCHI = MB_BLOCCHI;
window.mbNuovo = mbNuovo;
window.MbColore = MbColore;
window.MbCursore = MbCursore;
window.MbRicco = MbRicco;
window.MbBarraTesto = MbBarraTesto;
window.MbFondo = MbFondo;
window.MbCarica = MbCarica;
window.MbAllinea = MbAllinea;
window.mbFondoCss = mbFondoCss;
window.mbFondoVuoto = mbFondoVuoto;
window.mbFondoStileEmail = mbFondoStileEmail;
window.mbRicco = mbRicco;
window.mbPulisci = mbPulisci;
window.mbComando = mbComando;
window.mbInserisci = mbInserisci;
window.mbCampi = mbCampi;
window.MB_SIMBOLI = MB_SIMBOLI;
window.MB_GRADIENTI = MB_GRADIENTI;

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

function mbNuovo(tipo) {
  const base = { id: mbId(), tipo, padTop: 14, padBottom: 14, allinea: 'left' };
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
    foglio: '#FFFFFF',
    larghezza: 600,
    raggio: 14,
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    blocchi: [
      mbNuovo('logo'),
      Object.assign(mbNuovo('titolo'), { testo: 'Le prenotazioni ora si gestiscono da sole' }),
      Object.assign(mbNuovo('testo'), { testo: 'Da oggi byup accetta, sposta e conferma le prenotazioni senza che nessuno debba stare al telefono. Ecco le tre cose che cambiano nel tuo servizio.' }),
      mbNuovo('pulsante'),
      mbNuovo('divisore'),
      mbNuovo('colonne'),
      mbNuovo('footer'),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Il generatore di HTML — tabelle e stili in linea, come vuole la posta
// ═══════════════════════════════════════════════════════════════════════════

const mbEsc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mbNl = (s) => mbEsc(s).replace(/\n/g, '<br/>');

function mbBloccoHtml(b, doc) {
  const pad = `padding:${b.padTop}px 28px ${b.padBottom}px;`;
  const al = `text-align:${b.allinea || 'left'};`;
  switch (b.tipo) {
    case 'logo':
      return `<tr><td style="${pad}${al}"><img src="${mbEsc(b.src)}" width="${b.larghezza}" alt="Hubble" style="display:inline-block;border:0;width:${b.larghezza}px;max-width:100%;height:auto;"/></td></tr>`;
    case 'titolo':
      return `<tr><td style="${pad}${al}font-size:${b.corpo}px;font-weight:${b.peso};color:${b.colore};line-height:1.25;letter-spacing:-0.02em;">${mbNl(b.testo)}</td></tr>`;
    case 'testo':
      return `<tr><td style="${pad}${al}font-size:${b.corpo}px;color:${b.colore};line-height:${b.interlinea};">${mbNl(b.testo)}</td></tr>`;
    case 'immagine':
      return `<tr><td style="${pad}${al}">${b.src
        ? `<img src="${mbEsc(b.src)}" alt="${mbEsc(b.alt)}" style="display:block;width:100%;height:auto;border:0;border-radius:${b.raggio}px;"/>`
        : `<div style="background:#EDEEF1;border-radius:${b.raggio}px;padding:44px 0;color:#8A8A90;font-size:13px;">Nessuna immagine caricata</div>`}</td></tr>`;
    case 'pulsante':
      return `<tr><td style="${pad}${al}">`
        + `<a href="${mbEsc(b.url)}" style="display:inline-block;background:${b.sfondo};color:${b.colore};`
        + `font-size:${b.corpo}px;font-weight:700;text-decoration:none;border-radius:${b.raggio}px;`
        + `padding:${b.padY}px ${b.padX}px;">${mbEsc(b.testo)}</a></td></tr>`;
    case 'colonne':
      return `<tr><td style="${pad}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`
        + `<td width="50%" valign="top" style="padding-right:10px;font-size:${b.corpo}px;color:${b.colore};line-height:1.6;">${mbNl(b.sx)}</td>`
        + `<td width="50%" valign="top" style="padding-left:10px;font-size:${b.corpo}px;color:${b.colore};line-height:1.6;">${mbNl(b.dx)}</td>`
        + `</tr></table></td></tr>`;
    case 'divisore':
      return `<tr><td style="${pad}"><div style="border-top:${b.spessore}px solid ${b.colore};font-size:0;line-height:0;">&nbsp;</div></td></tr>`;
    case 'spazio':
      return `<tr><td style="height:${b.altezza}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
    case 'social':
      return `<tr><td style="${pad}${al}font-size:13px;color:${b.colore};">`
        + b.voci.map(v => `<a href="#" style="color:${b.colore};text-decoration:underline;margin:0 8px;">${mbEsc(v)}</a>`).join('')
        + `</td></tr>`;
    case 'footer':
      return `<tr><td style="${pad}${al}font-size:${b.corpo}px;color:${b.colore};line-height:1.6;">`
        + `${mbNl(b.testo)}<br/><a href="{{unsubscribe}}" style="color:${b.colore};">${mbEsc(b.disiscrizione)}</a></td></tr>`;
    default: return '';
  }
}

function mbHtml(doc, meta) {
  const corpo = doc.blocchi.map(b => mbBloccoHtml(b, doc)).join('\n      ');
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
<body style="margin:0;padding:0;background:${doc.sfondo};font-family:${doc.font};">
  <!-- testo di anteprima: si legge nella lista della posta, non nella mail -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${mbEsc((meta && meta.anteprima) || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${doc.sfondo};">
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

function MbBlocco({ b, doc, selezionato, onSeleziona, onSu, onGiu, onElimina, onDuplica }) {
  const [sopra, setSopra] = useStateMb(false);
  const pad = { paddingTop: b.padTop, paddingBottom: b.padBottom, paddingLeft: 28, paddingRight: 28, textAlign: b.allinea };

  const dentro = () => {
    switch (b.tipo) {
      case 'logo':     return <img src={b.src} alt="Hubble" style={{ width: b.larghezza, maxWidth: '100%', display: 'inline-block' }}/>;
      case 'titolo':   return <div style={{ fontSize: b.corpo, fontWeight: b.peso, color: b.colore, lineHeight: 1.25, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>{b.testo}</div>;
      case 'testo':    return <div style={{ fontSize: b.corpo, color: b.colore, lineHeight: b.interlinea, whiteSpace: 'pre-line' }}>{b.testo}</div>;
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
          <div style={{ flex: 1, fontSize: b.corpo, color: b.colore, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{b.sx}</div>
          <div style={{ flex: 1, fontSize: b.corpo, color: b.colore, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{b.dx}</div>
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
        <div style={{ fontSize: b.corpo, color: b.colore, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {b.testo}<br/><span style={{ textDecoration: 'underline' }}>{b.disiscrizione}</span>
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
        <MbColore label="Sfondo attorno" valore={doc.sfondo} onCambia={v => onDoc('sfondo', v)}/>
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
  const comuni = (
    <React.Fragment>
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

      {(b.tipo === 'titolo' || b.tipo === 'testo') && (
        <React.Fragment>
          <HubCampo label="Testo"><HubArea valore={b.testo} onCambia={set('testo')} righe={b.tipo === 'titolo' ? 2 : 5}/></HubCampo>
          <MbCursore label="Corpo" valore={b.corpo} onCambia={set('corpo')} min={11} max={44}/>
          <MbColore label="Colore" valore={b.colore} onCambia={set('colore')}/>
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
          <HubCampo label="Indirizzo dell'immagine"><HubInput valore={b.src} onCambia={set('src')} placeholder="https://…"/></HubCampo>
          <HubCampo label="Testo alternativo" nota="Lo leggono i lettori di schermo e appare quando le immagini sono bloccate — in molte caselle lo sono per default.">
            <HubInput valore={b.alt} onCambia={set('alt')}/>
          </HubCampo>
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
          <HubCampo label="Colonna di sinistra"><HubArea valore={b.sx} onCambia={set('sx')} righe={3}/></HubCampo>
          <HubCampo label="Colonna di destra"><HubArea valore={b.dx} onCambia={set('dx')} righe={3}/></HubCampo>
          <MbCursore label="Corpo" valore={b.corpo} onCambia={set('corpo')} min={11} max={22}/>
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
          <HubCampo label="Testo legale" nota="Ragione sociale e indirizzo sono obbligatori negli invii commerciali.">
            <HubArea valore={b.testo} onCambia={set('testo')} righe={3}/>
          </HubCampo>
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
        <div className="hub-scroll" style={{ flex: 1, minHeight: 0, background: doc.sfondo, padding: '26px 60px' }}
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
                  onSeleziona={setSel}
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

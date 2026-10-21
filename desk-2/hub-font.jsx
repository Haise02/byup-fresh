// Desk · I caratteri dei materiali (mail e form)
//
// Ogni materiale che si costruisce in Desk ha un carattere suo, e chi lo
// costruisce lo sceglie: per tutto il materiale, per un blocco, o per le sole
// parole selezionate. Tre provenienze:
//
//   · SICURI OVUNQUE — i caratteri che ogni computer e ogni app di posta hanno
//     già: Helvetica, Arial, Georgia… Non si caricano, non tradiscono mai;
//   · GOOGLE FONTS — una scelta già pronta di caratteri liberi, caricati da
//     fonts.googleapis.com quando servono;
//   · IMPORTATI — qualunque altro carattere di Google Fonts (si scrive il nome
//     o si incolla il link della pagina) oppure un file proprio (.woff2,
//     .woff, .ttf, .otf). Quelli di Google restano in questo browser; i file,
//     nel prototipo, durano fino al ricaricamento — in produzione vanno sulla
//     CDN come le immagini.
//
// Ogni carattere ha un RIPIEGO (senza grazie, con grazie, monospazio): è
// quello che si vede dove il carattere non arriva. Nella posta succede spesso:
// Apple Mail e l'iPhone mostrano i caratteri web, Gmail e Outlook per Windows
// mostrano il ripiego. Per questo il valore che si salva è sempre la PILA
// completa ('Inter', Arial, Helvetica, sans-serif), mai il nome da solo.
//
// I nomi di primo livello iniziano con hubFont / HubFont / HUB_FONT.

const { useState: useStateFt, useEffect: useEffectFt, useRef: useRefFt } = React;

const HUB_FONT_RIPIEGHI = {
  sans:  { label: 'Senza grazie', pila: 'Arial, Helvetica, sans-serif' },
  serif: { label: 'Con grazie',   pila: "Georgia, 'Times New Roman', serif" },
  mono:  { label: 'Monospazio',   pila: "'Courier New', Courier, monospace" },
};

const HUB_FONT_SISTEMA = [
  { nome: 'Helvetica',       pila: "'Helvetica Neue', Helvetica, Arial, sans-serif", genere: 'sans' },
  { nome: 'Arial',           pila: 'Arial, Helvetica, sans-serif', genere: 'sans' },
  { nome: 'Verdana',         pila: 'Verdana, Geneva, sans-serif', genere: 'sans' },
  { nome: 'Tahoma',          pila: 'Tahoma, Verdana, sans-serif', genere: 'sans' },
  { nome: 'Trebuchet MS',    pila: "'Trebuchet MS', Tahoma, sans-serif", genere: 'sans' },
  { nome: 'Georgia',         pila: "Georgia, 'Times New Roman', serif", genere: 'serif' },
  { nome: 'Times New Roman', pila: "'Times New Roman', Times, serif", genere: 'serif' },
  { nome: 'Courier New',     pila: "'Courier New', Courier, monospace", genere: 'mono' },
].map(f => Object.assign({ fonte: 'sistema' }, f));

// I pesi si dichiarano per carattere: l'API di Google risponde con un errore
// se si chiede un peso che il carattere non ha (Instrument Serif ha solo il 400).
const HUB_FONT_GOOGLE = [
  { nome: 'Plus Jakarta Sans', genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Inter',             genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'DM Sans',           genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Poppins',           genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Montserrat',        genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Roboto',            genere: 'sans',  pesi: '400;500;700;900' },
  { nome: 'Open Sans',         genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Lato',              genere: 'sans',  pesi: '400;700;900' },
  { nome: 'Nunito',            genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Hanken Grotesk',    genere: 'sans',  pesi: '400;600;700;800' },
  { nome: 'Space Grotesk',     genere: 'sans',  pesi: '400;500;600;700' },
  { nome: 'Fredoka',           genere: 'sans',  pesi: '400;500;600;700' },
  { nome: 'Playfair Display',  genere: 'serif', pesi: '400;600;700;800' },
  { nome: 'Merriweather',      genere: 'serif', pesi: '400;700;900' },
  { nome: 'Lora',              genere: 'serif', pesi: '400;600;700' },
  { nome: 'Instrument Serif',  genere: 'serif', pesi: '' },
].map(f => Object.assign({ fonte: 'google', pila: hubFontPila(f.nome, f.genere) }, f));

function hubFontPila(nome, genere) {
  return "'" + String(nome).replace(/'/g, '') + "', " + (HUB_FONT_RIPIEGHI[genere] || HUB_FONT_RIPIEGHI.sans).pila;
}
// Il nome di famiglia in testa a una pila, senza virgolette.
function hubFontTesta(pila) {
  return String(pila || '').split(',')[0].trim().replace(/^["']|["']$/g, '').replace(/&quot;/g, '');
}
const hubFontSlug = (nome) => String(nome).toLowerCase().replace(/[^a-z0-9]+/g, '-');

// ─── Lo stato: i caratteri importati ────────────────────────────────────────
const HUB_FONT_STATO = { importati: [], ascolta: new Set() };
const HUB_FONT_CHIAVE = 'desk_font_importati';
(function () {
  // Solo quelli di Google si ricordano: un file da qualche centinaio di KB non
  // va nel localStorage. Lettura protetta: in una finestra privata può fallire.
  try {
    const v = JSON.parse(window.localStorage.getItem(HUB_FONT_CHIAVE) || '[]');
    if (Array.isArray(v)) HUB_FONT_STATO.importati = v.filter(f => f && f.nome && f.fonte === 'google')
      .map(f => ({ nome: f.nome, genere: f.genere || 'sans', pesi: f.pesi || '', fonte: 'google', importato: true, pila: hubFontPila(f.nome, f.genere) }));
  } catch (e) { /* niente: si riparte dai predefiniti */ }
})();
function hubFontSalva() {
  try {
    window.localStorage.setItem(HUB_FONT_CHIAVE, JSON.stringify(
      HUB_FONT_STATO.importati.filter(f => f.fonte === 'google').map(f => ({ nome: f.nome, genere: f.genere, pesi: f.pesi, fonte: 'google' }))));
  } catch (e) { /* niente */ }
}
function hubFontAggiungi(f) {
  HUB_FONT_STATO.importati = HUB_FONT_STATO.importati.filter(x => x.nome.toLowerCase() !== f.nome.toLowerCase()).concat([f]);
  hubFontSalva();
  HUB_FONT_STATO.ascolta.forEach(fn => fn());
}
function hubFontTogli(nome) {
  HUB_FONT_STATO.importati = HUB_FONT_STATO.importati.filter(x => x.nome !== nome);
  hubFontSalva();
  HUB_FONT_STATO.ascolta.forEach(fn => fn());
}
function useHubFont() {
  const [, setN] = useStateFt(0);
  useEffectFt(() => {
    const f = () => setN(n => n + 1);
    HUB_FONT_STATO.ascolta.add(f);
    return () => { HUB_FONT_STATO.ascolta.delete(f); };
  }, []);
  return HUB_FONT_STATO.importati;
}

function hubFontCatalogo() {
  return HUB_FONT_SISTEMA.concat(HUB_FONT_GOOGLE, HUB_FONT_STATO.importati);
}
// Dalla pila al carattere del catalogo; se non c'è (una pila scritta a mano),
// un carattere «di sistema» con quel nome, così il selettore sa sempre cosa dire.
function hubFontDa(pila) {
  const t = hubFontTesta(pila).toLowerCase();
  if (!t) return null;
  const c = hubFontCatalogo().find(f => f.nome.toLowerCase() === t)
    || HUB_FONT_SISTEMA.find(f => hubFontTesta(f.pila).toLowerCase() === t);
  return c || { nome: hubFontTesta(pila), pila, genere: 'sans', fonte: 'sistema' };
}

// ─── Il caricamento ─────────────────────────────────────────────────────────
function hubFontUrl(f) {
  const fam = encodeURIComponent(f.nome).replace(/%20/g, '+');
  return 'https://fonts.googleapis.com/css2?family=' + fam + (f.pesi ? ':wght@' + f.pesi : '') + '&display=swap';
}
// Mette nella pagina il foglio di Google del carattere, una volta sola.
function hubFontAssicura(f) {
  if (!f || f.fonte !== 'google' || typeof document === 'undefined') return;
  const id = 'hubfont-' + hubFontSlug(f.nome);
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = hubFontUrl(f);
  document.head.appendChild(l);
}
function hubFontAssicuraPila(pila) { hubFontAssicura(hubFontDa(pila)); }

// I caratteri usati dentro un pezzo di testo ricco (gli <span style="font-family:…">).
function hubFontNelTesto(html) {
  const out = [];
  const re = /font-family:\s*((?:[^;"]|"[^"]*")+)/gi;
  let m;
  const s = String(html || '').replace(/&quot;/g, '"');
  while ((m = re.exec(s)) !== null) out.push(m[1]);
  return out;
}

// La testata HTML di un materiale che usa caratteri web: i <link> di Google e
// le @font-face dei file. Nella posta il <link> lo leggono Apple Mail e iOS;
// Gmail e Outlook per Windows lo ignorano e mostrano il ripiego della pila.
function hubFontTestataHtml(pile) {
  const visti = {};
  const righe = [];
  pile.forEach(p => {
    const f = hubFontDa(p);
    if (!f || visti[f.nome] || f.fonte === 'sistema') return;
    visti[f.nome] = true;
    if (f.fonte === 'google') righe.push('<link href="' + hubFontUrl(f) + '" rel="stylesheet" type="text/css"/>');
    if (f.fonte === 'file') righe.push("<style type=\"text/css\">@font-face { font-family: '" + f.nome + "'; src: url('https://cdn.byup.it/font/" + hubFontSlug(f.nome) + "." + (f.formato || 'woff2') + "') format('" + (f.formato === 'ttf' ? 'truetype' : f.formato === 'otf' ? 'opentype' : f.formato || 'woff2') + "'); }</style>");
  });
  return righe.join('\n  ');
}

// Da un nome, o da un link di fonts.google.com / fonts.googleapis.com, al nome
// di famiglia. «Bricolage Grotesque», «https://fonts.google.com/specimen/
// Bricolage+Grotesque» e il link css2 danno lo stesso risultato.
function hubFontNomeDaTesto(t) {
  let s = String(t || '').trim();
  if (!s) return '';
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      const fam = u.searchParams.get('family');
      if (fam) s = fam.split(':')[0];
      else { const m = u.pathname.match(/specimen\/([^/?#]+)/); if (m) s = m[1]; }
    }
  } catch (e) { /* non era un link valido: si usa com'è */ }
  return decodeURIComponent(s.replace(/\+/g, ' ')).replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}
const hubFontMaiuscole = (s) => s.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w).join(' ');

// Chiede a Google se il carattere esiste. Prima con regolare e grassetto, poi
// solo regolare (alcuni caratteri hanno un peso solo), poi con le iniziali
// maiuscole — l'API distingue «inter» da «Inter».
//
// Un nome che non esiste torna con un errore 400 SENZA l'intestazione CORS:
// per il browser è una richiesta fallita, uguale a una rete assente. Per
// distinguerle si prova una volta un carattere che esiste di sicuro: se
// quello risponde, la rete c'è e il nome era sbagliato.
async function hubFontProva(url) {
  try { const r = await fetch(url); return r.ok ? 'ok' : 'manca'; }
  catch (e) { return 'errore'; }
}
async function hubFontCercaGoogle(nome) {
  const prove = [];
  [nome, hubFontMaiuscole(nome)].forEach(n => {
    if (prove.some(p => p.nome === n && p.pesi === '400;700')) return;
    prove.push({ nome: n, pesi: '400;700' }, { nome: n, pesi: '' });
  });
  let reteOk;
  for (const p of prove) {
    const esito = await hubFontProva(hubFontUrl(p));
    if (esito === 'ok') return p;
    if (esito === 'errore') {
      if (reteOk === undefined) reteOk = (await hubFontProva(hubFontUrl({ nome: 'Inter', pesi: '' }))) === 'ok';
      if (!reteOk) return { errore: 'rete' };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// I pezzi d'interfaccia
// ═══════════════════════════════════════════════════════════════════════════

function HubFontEtichetta({ f }) {
  const tag = f.fonte === 'sistema' ? 'Sicuro ovunque' : f.fonte === 'google' ? (f.importato ? 'Importato · Google' : 'Google Fonts') : 'Importato · file';
  return <span style={{ fontSize: 10.8, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: f.fonte === 'sistema' ? ADM.OK : f.importato || f.fonte === 'file' ? ADM.HUB_MAGENTA_DARK : ADM.INFO }}>{tag}</span>;
}

// L'importazione: da Google Fonts per nome o link, oppure da un file.
function HubFontImporta({ onImportato }) {
  const [testo, setTesto] = useStateFt('');
  const [genere, setGenere] = useStateFt('sans');
  const [stato, setStato] = useStateFt(null); // { tipo: 'cerca'|'ok'|'errore', msg }
  const [nomeFile, setNomeFile] = useStateFt('');
  const fileRef = useRefFt(null);
  const nome = hubFontNomeDaTesto(testo);

  const daGoogle = async () => {
    if (!nome) return;
    if (hubFontCatalogo().some(f => f.nome.toLowerCase() === nome.toLowerCase())) {
      const f = hubFontCatalogo().find(x => x.nome.toLowerCase() === nome.toLowerCase());
      setStato({ tipo: 'ok', msg: '«' + f.nome + '» c\'è già: l\'ho scelto.' }); onImportato(f); return;
    }
    setStato({ tipo: 'cerca', msg: 'Cerco «' + nome + '» su Google Fonts…' });
    const trovato = await hubFontCercaGoogle(nome);
    if (trovato && trovato.errore) { setStato({ tipo: 'errore', msg: 'Google Fonts non risponde: controlla la connessione e riprova.' }); return; }
    if (!trovato) { setStato({ tipo: 'errore', msg: '«' + nome + '» non c\'è su Google Fonts. Controlla il nome come compare su fonts.google.com, o incolla il link della sua pagina.' }); return; }
    const f = { nome: trovato.nome, genere, pesi: trovato.pesi, fonte: 'google', importato: true, pila: hubFontPila(trovato.nome, genere) };
    hubFontAssicura(f);
    hubFontAggiungi(f);
    setStato({ tipo: 'ok', msg: '«' + f.nome + '» importato. Lo trovi fra gli importati di ogni mail e di ogni form.' });
    setTesto('');
    onImportato(f);
  };

  const daFile = async (file) => {
    if (!file) return;
    const est = (file.name.split('.').pop() || '').toLowerCase();
    if (!['woff2', 'woff', 'ttf', 'otf'].includes(est)) { setStato({ tipo: 'errore', msg: 'Serve un file .woff2, .woff, .ttf o .otf.' }); return; }
    if (file.size > 3 * 1024 * 1024) { setStato({ tipo: 'errore', msg: 'Il file supera 3 MB: per il web serve la versione .woff2, molto più leggera.' }); return; }
    const n = (nomeFile.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')).replace(/[^A-Za-z0-9 ]/g, '').trim() || 'Carattere importato';
    try {
      const buf = await file.arrayBuffer();
      const ff = new FontFace(n, buf);
      await ff.load();
      document.fonts.add(ff);
      const f = { nome: n, genere, fonte: 'file', formato: est, importato: true, pila: hubFontPila(n, genere) };
      hubFontAggiungi(f);
      setStato({ tipo: 'ok', msg: '«' + n + '» caricato dal file. Nel prototipo resta fino al ricaricamento della pagina.' });
      setNomeFile('');
      onImportato(f);
    } catch (e) {
      setStato({ tipo: 'errore', msg: 'Il file non si legge come carattere. Prova con la versione .woff2 o .ttf.' });
    }
  };

  const tinta = stato && stato.tipo === 'ok' ? { bg: ADM.OK_SOFT, fg: '#065F46' } : stato && stato.tipo === 'errore' ? { bg: ADM.DANGER_SOFT, fg: '#7F1D1D' } : { bg: ADM.PANEL_SOFT, fg: ADM.MUTED };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 12, padding: 14, background: '#fff' }}>
        <div style={{ fontSize: 13.6, fontWeight: 800, color: ADM.TEXT }}>Da Google Fonts</div>
        <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 2, marginBottom: 10, lineHeight: 1.45 }}>Scrivi il nome come compare su fonts.google.com, oppure incolla il link della sua pagina. Sono tutti liberi, anche per uso commerciale.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <HubInput valore={testo} onCambia={setTesto} placeholder="es. Bricolage Grotesque, o https://fonts.google.com/specimen/…"
              onKeyDown={e => { if (e.key === 'Enter') daGoogle(); }}/>
          </div>
          <HubStrumento forte icona="download" spento={!nome || (stato && stato.tipo === 'cerca')} onClick={daGoogle}>Importa</HubStrumento>
        </div>
        {nome && testo.trim() !== nome && <div style={{ fontSize: 12, color: ADM.MUTED, marginTop: 6 }}>Carattere: <b style={{ color: ADM.TEXT }}>{nome}</b></div>}
      </div>

      <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 12, padding: 14, background: '#fff' }}>
        <div style={{ fontSize: 13.6, fontWeight: 800, color: ADM.TEXT }}>Da un file</div>
        <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 2, marginBottom: 10, lineHeight: 1.45 }}>Un carattere di marca che non sta su Google: .woff2, .woff, .ttf o .otf, fino a 3 MB. Usalo solo se la licenza permette l'uso sul web e nella posta.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}><HubInput valore={nomeFile} onCambia={setNomeFile} placeholder="Nome del carattere (facoltativo)"/></div>
          <input ref={fileRef} type="file" accept=".woff2,.woff,.ttf,.otf" style={{ display: 'none' }} onChange={e => { daFile(e.target.files && e.target.files[0]); e.target.value = ''; }}/>
          <HubStrumento icona="upload" onClick={() => fileRef.current && fileRef.current.click()}>Scegli il file</HubStrumento>
        </div>
      </div>

      <HubCampo label="Ripiego" nota="Quello che si vede dove il carattere non arriva — nella posta, Gmail e Outlook per Windows.">
        <HubSegmenti attivo={genere} onCambia={setGenere} voci={Object.keys(HUB_FONT_RIPIEGHI).map(k => ({ id: k, label: HUB_FONT_RIPIEGHI[k].label }))}/>
      </HubCampo>

      {stato && <div style={{ padding: '9px 12px', borderRadius: 10, background: tinta.bg, color: tinta.fg, fontSize: 12.8, lineHeight: 1.45, fontWeight: 600 }}>{stato.msg}</div>}
    </div>
  );
}

// La finestra di scelta: cerca, tre gruppi, e l'importazione.
function HubFontModale({ open, onClose, valore, onScegli, eredita, titolo, vistaIniziale }) {
  const importati = useHubFont();
  const [q, setQ] = useStateFt('');
  const [vista, setVista] = useStateFt('scegli');
  useEffectFt(() => {
    if (!open) return;
    // Per mostrare i nomi nel loro carattere servono i fogli di Google: si
    // caricano quando si apre la finestra, non prima.
    HUB_FONT_GOOGLE.concat(importati).forEach(hubFontAssicura);
    setVista(vistaIniziale || 'scegli'); setQ('');
  }, [open]);
  if (!open) return null;
  const attuale = valore ? hubFontDa(valore) : null;
  const filtra = (l) => l.filter(f => !q.trim() || f.nome.toLowerCase().includes(q.trim().toLowerCase()));
  const gruppi = [
    { t: 'Importati', l: filtra(importati) },
    { t: 'Google Fonts', l: filtra(HUB_FONT_GOOGLE) },
    { t: 'Sicuri ovunque', sotto: 'Si vedono uguali anche in Gmail e Outlook', l: filtra(HUB_FONT_SISTEMA) },
  ].filter(g => g.l.length);
  const riga = (f) => {
    const on = attuale && attuale.nome === f.nome && !!valore;
    return (
      <button key={f.fonte + f.nome} onClick={() => { onScegli(f); onClose(); }} className="adm-actionrow" style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
        border: `1.5px solid ${on ? ADM.PINK : 'transparent'}`, background: on ? ADM.PINK_BG_SOFT : 'transparent', fontFamily: 'inherit',
      }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: f.pila, fontSize: 19, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.25 }}>{f.nome}</span>
          <span style={{ display: 'block', fontFamily: f.pila, fontSize: 13, color: ADM.MUTED, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dal primo dicembre, in tutta Italia · 0123456789</span>
        </span>
        <HubFontEtichetta f={f}/>
        {f.importato && (
          <span onClick={(e) => { e.stopPropagation(); hubFontTogli(f.nome); }} title="Togli dagli importati" style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, color: ADM.MUTED_LIGHT }}><BuIcons.x size={13}/></span>
        )}
        {on && <BuIcons.check size={16} color={ADM.PINK}/>}
      </button>
    );
  };
  return (
    <HubModale open onClose={onClose} larghezza={640} altezza={620} titolo={titolo || 'Scegli il carattere'}
      sotto="Un carattere per tutto il materiale, o solo per questa parte. Se non c'è quello che cerchi, importalo da Google Fonts o da un file.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <HubSegmenti attivo={vista} onCambia={setVista} voci={[{ id: 'scegli', label: 'Scegli' }, { id: 'importa', label: 'Importa un carattere' }]}/>
        <span style={{ flex: 1 }}/>
        {vista === 'scegli' && <HubRicerca valore={q} onCambia={setQ} placeholder="Cerca un carattere" larghezza={220}/>}
      </div>
      {vista === 'importa'
        ? <HubFontImporta onImportato={(f) => { onScegli(f); }}/>
        : (
          <div>
            {eredita && (
              <button onClick={() => { onScegli(null); onClose(); }} className="adm-actionrow" style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8, borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                border: `1.5px solid ${!valore ? ADM.PINK : ADM.BORDER}`, background: !valore ? ADM.PINK_BG_SOFT : '#fff',
              }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: ADM.TEXT }}>{eredita}</span>
                  <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED, marginTop: 1 }}>Segue il carattere scelto per tutto il materiale</span>
                </span>
                {!valore && <BuIcons.check size={16} color={ADM.PINK}/>}
              </button>
            )}
            {gruppi.map(g => (
              <div key={g.t} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '4px 12px 6px' }}>
                  <span style={{ fontSize: 11.2, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>{g.t}</span>
                  {g.sotto && <span style={{ fontSize: 11.8, color: ADM.MUTED_SOFT }}>· {g.sotto}</span>}
                </div>
                {g.l.map(riga)}
              </div>
            ))}
            {gruppi.length === 0 && (
              <div style={{ padding: '26px 10px', textAlign: 'center', fontSize: 13.4, color: ADM.MUTED }}>
                Nessun carattere con questo nome.{' '}
                <button onClick={() => setVista('importa')} style={{ border: 'none', background: 'none', color: ADM.PINK_DARK, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.4 }}>Importalo da Google Fonts</button>
              </div>
            )}
          </div>
        )}
    </HubModale>
  );
}

// Il campo dell'ispettore: il nome scritto nel suo carattere, si clicca e si cambia.
function HubFontScelta({ etichetta = 'Carattere', valore, onCambia, eredita, nota }) {
  const [aperta, setAperta] = useStateFt(false);
  useHubFont();
  const f = valore ? hubFontDa(valore) : null;
  useEffectFt(() => { if (f) hubFontAssicura(f); }, [valore]);
  return (
    <HubCampo label={etichetta} nota={nota}>
      <button onClick={() => setAperta(true)} className="mb-tasto" style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 9, cursor: 'pointer', textAlign: 'left',
        border: `1px solid ${ADM.BORDER}`, background: '#fff', fontFamily: 'inherit',
      }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: ADM.NEUTRAL_SOFT, display: 'grid', placeItems: 'center', fontFamily: f ? f.pila : 'inherit', fontSize: 16, fontWeight: 700, color: ADM.TEXT, flexShrink: 0 }}>Aa</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: f ? f.pila : 'inherit', fontSize: 14.4, fontWeight: 600, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f ? f.nome : eredita}</span>
          {f && <HubFontEtichetta f={f}/>}
          {!f && <span style={{ display: 'block', fontSize: 11.6, color: ADM.MUTED }}>Come il resto del materiale</span>}
        </span>
        <BuIcons.chevronRight size={14} color={ADM.MUTED}/>
      </button>
      <HubFontModale open={aperta} onClose={() => setAperta(false)} valore={valore} eredita={eredita}
        titolo={'Scegli il ' + etichetta.toLowerCase()} onScegli={(nuovo) => onCambia(nuovo ? nuovo.pila : null)}/>
    </HubCampo>
  );
}

// Il pannello della barra di testo: applica un carattere alle sole parole
// selezionate. I bottoni non rubano il fuoco (mousedown preventDefault), così
// la selezione resta dov'è.
function HubFontRapidi({ onApplica, onImporta }) {
  const importati = useHubFont();
  useEffectFt(() => { HUB_FONT_GOOGLE.concat(importati).forEach(hubFontAssicura); }, []);
  const tutti = importati.concat(HUB_FONT_GOOGLE, HUB_FONT_SISTEMA);
  return (
    <div style={{ marginTop: 8 }}>
      <div className="hub-scroll" style={{ maxHeight: 188, display: 'flex', flexWrap: 'wrap', gap: 5, alignContent: 'flex-start' }}>
        {tutti.map(f => (
          <button key={f.fonte + f.nome} title={f.nome} className="mb-tasto"
            onMouseDown={e => e.preventDefault()} onClick={() => onApplica(f)} style={{
              padding: '5px 9px', borderRadius: 8, border: `1px solid ${f.importato ? ADM.HUB_MAGENTA_SOFT : ADM.BORDER}`, background: '#fff',
              fontFamily: f.pila, fontSize: 13.4, cursor: 'pointer', color: ADM.TEXT, whiteSpace: 'nowrap',
            }}>{f.nome}</button>
        ))}
      </div>
      <button onClick={onImporta} style={{ marginTop: 7, border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.4, fontWeight: 800, color: ADM.PINK_DARK, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <BuIcons.download size={13}/>Importa un carattere da Google Fonts o da un file
      </button>
    </div>
  );
}

window.HUB_FONT_SISTEMA = HUB_FONT_SISTEMA;
window.HUB_FONT_GOOGLE = HUB_FONT_GOOGLE;
window.hubFontPila = hubFontPila;
window.hubFontDa = hubFontDa;
window.hubFontAssicura = hubFontAssicura;
window.hubFontAssicuraPila = hubFontAssicuraPila;
window.hubFontNelTesto = hubFontNelTesto;
window.hubFontTestataHtml = hubFontTestataHtml;
window.hubFontNomeDaTesto = hubFontNomeDaTesto;
window.hubFontCercaGoogle = hubFontCercaGoogle;
window.useHubFont = useHubFont;
window.HubFontScelta = HubFontScelta;
window.HubFontModale = HubFontModale;
window.HubFontRapidi = HubFontRapidi;
window.HubFontImporta = HubFontImporta;

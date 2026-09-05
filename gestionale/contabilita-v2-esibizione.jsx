// La CONSULTAZIONE della console fiscale (P-96 · P-111 · D-88).
//
// Questo foglio NON è più una schermata del regime attuale: il progetto
// tecnico §4.3 dice che nel regime attuale la console «non è richiesta da
// alcuna fonte e non viene costruita», perché le esigenze operative
// dell'esercente sono coperte dalla contabilità del gestionale e, in un
// controllo, la prova sono i documenti memorizzati dal sistema dell'Agenzia,
// che l'esercente mostra dal portale con le proprie credenziali (lo dice la
// riga «In caso di controllo» in Conti). Un gestionale che nel regime attuale
// costruisce una finestra «per il verificatore» promette una funzione senza
// valore probatorio e distrae dall'unica cosa che conta, il portale.
//
// Il lavoro fatto non si butta: questo contenuto — la finestra delle ultime
// quarantotto ore contate da adesso, la ricerca, il CSV e il prospetto
// stampabile — È la sezione «Consultazione» della console fiscale della
// Soluzione (P-96), che si costruisce contro l'ombra e si accende per sede al
// passaggio di regime. Perciò il componente resta montato solo quando il
// regime della sede è la Soluzione (contabilita-v2-app.jsx), e nel mock, dove
// la sede è nel regime attuale, non si vede.

const ESIB_ORE = 48;

// 'aaaa-mm-gg HH:MM' → Date; e viceversa, nella stessa forma dei mock.
const esibDate = (ora) => { const [d, t] = String(ora || '').split(' '); return d ? new Date(`${d}T${t || '00:00'}:00`) : null; };
const esibIso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
const esibMetodo = { cash:'Contanti', card_terminal:'Carta', in_app:'Byup app', platform:'Piattaforma' };

// Tutti i documenti delle ultime 48 ore: i pagamenti dei conti (ccDocumenti)
// più le loro rettifiche come documenti a sé, ordinati dal più recente. Il
// waiting entra sempre: è in mano al canale, anche se datato stasera.
function esibDocumenti(adesso) {
  const da = new Date(adesso.getTime() - ESIB_ORE * 3600000);
  const out = [];
  window.ccDocumenti().forEach(({ conto, p }) => {
    const info = docInfo(p);
    const quando = esibDate(p.ora);
    const dentro = quando && quando >= da && quando <= adesso;
    if (dentro || info.tipo === 'waiting') {
      out.push({ chiave: p.id, tipo:'documento', numero: p.scontrinoNum || '—', quando, ora: p.ora, conto, p, info,
        giornata: info.tipo === 'waiting' ? esibGiornoDopo(p.ora) : String(p.ora || '').split(' ')[0],
        importo: p.amount, metodo: esibMetodo[p.method] || p.method });
    }
    const rett = typeof rettDi === 'function' ? rettDi(p) : null;
    if (!rett) return;
    rett.resi.forEach((r, i) => {
      const q = esibDate(r.ora);
      if (!(q && q >= da && q <= adesso)) return;
      const f = rettFisc(p, r, i);
      out.push({ chiave: `${p.id}-R${i+1}`, tipo:'reso', numero: rettDocReso(p, i), quando: q, ora: r.ora, conto, p, rett: r,
        fisc: f, giornata: String(r.ora || '').split(' ')[0], importo: -r.amount, metodo: esibMetodo[p.method] || p.method });
    });
    if (rett.annullo) {
      const q = esibDate(rett.annullo.ora);
      if (q && q >= da && q <= adesso) {
        const f = rettFisc(p, rett.annullo, 0, true);
        out.push({ chiave: `${p.id}-A`, tipo:'annullo', numero: rettDocAnnullo(p), quando: q, ora: rett.annullo.ora, conto, p, rett: rett.annullo,
          fisc: f, giornata: String(rett.annullo.ora || '').split(' ')[0], importo: -rett.annullo.amount, metodo: esibMetodo[p.method] || p.method });
      }
    }
  });
  return out.sort((a, b) => (b.quando ? b.quando.getTime() : 0) - (a.quando ? a.quando.getTime() : 0));
}
const esibGiornoDopo = (ora) => { const d = esibDate(ora); if (!d) return ''; d.setDate(d.getDate() + 1); return esibIso(d).split(' ')[0]; };
const esibGiorno = (iso) => iso ? iso.split('-').reverse().join('/') : '—';

// L'esito di una riga, detto per quello che è.
function esibEsito(doc) {
  if (doc.tipo !== 'documento') {
    return doc.fisc.idTrasm ? { pill:'ok', label:'Trasmesso', dettaglio: doc.fisc.idTrasm } : { pill: doc.fisc.esito, label: DOC_LABEL[doc.fisc.esito] || doc.fisc.esito, dettaglio: null };
  }
  const i = doc.info;
  if (i.tipo === 'ok') return { pill:'ok', label:'Trasmesso', dettaglio: i.idTrasm };
  if (i.tipo === 'waiting') return { pill:'waiting', label:'In attesa di mezzanotte', dettaglio:'accodato dal canale · giornata fiscale di domani' };
  if (i.tipo === 'ritrasmissione') return { pill:'ritrasmissione', label:'In ritrasmissione', dettaglio:`tentativo ${i.tentativo} di 5 · prossimo alle ${i.prossimo} · politica di ritrasmissione di Byup` };
  if (i.tipo === 'gestito') return { pill:'gestito', label: i.gestito.come === 'ritrasmissione' ? 'Gestito · ritrasmissione riuscita' : 'Gestito', dettaglio: i.scarto ? i.scarto.motivo : null };
  return { pill:'scartato', label:'Scartato', dettaglio: i.scarto ? i.scarto.motivo : null };
}

const esibSede = () => {
  const l = window.byupReadLocale ? window.byupReadLocale() : null;
  return { nome: (l && l.nome) || 'Cacio e Pepe', indirizzo: 'Via dei Giubbonari 27, 00186 Roma' };
};

const ESIB_REGIME = 'Regime attuale: documento commerciale online tramite il canale OpenAPI. Quello che vedi è ciò che il canale ha restituito, dichiarato per quello che è: esiti e identificativi del canale. Giornale di cassa, catene di impronte e Gran Totale arrivano con la Soluzione.';
// Il giornale di cassa non compare: nel regime attuale del documento
// commerciale online il canale non lo tiene e Byup non lo simula. Quando
// arriverà con la Soluzione — catene di impronte e Gran Totale — avrà la sua
// sezione qui e nel prospetto. Come prassi: quello che non c'è non si mostra.
const ESIB_CHIUSURA = (quando) => `Prospetto generato da Byup Fresh il ${quando} · non è un giornale di cassa e non sostituisce i documenti trasmessi all'Agenzia delle Entrate.`;

// ─── Esportazioni: file veri dai mock, come il download del contratto ────────
function esibScarica(nome, contenuto, tipo) {
  const url = URL.createObjectURL(new Blob([contenuto], { type: tipo }));
  const a = document.createElement('a'); a.href = url; a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function esibCsv(docs, sede, adesso) {
  const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const testa = ['tipo','numero','data_ora','giornata_fiscale','sede','importo','metodo','esito','identificativo_canale','dettaglio_esito','righe_con_iva'];
  const righe = docs.map(d => {
    const e = esibEsito(d);
    const conIva = d.tipo === 'documento' ? (d.p.righe || []).filter(r => r.aliquota != null).map(r => `${r.nome} ${r.aliquota}%`).join(' | ') : '';
    return [d.tipo, d.numero, d.ora, esibGiorno(d.giornata), sede.nome, d.importo.toFixed(2), d.metodo, e.label,
      (d.tipo === 'documento' ? d.info.idTrasm : d.fisc.idTrasm) || '', e.dettaglio || '', conIva].map(q).join(';');
  });
  const nota = `# ${ESIB_REGIME}`;
  return '﻿' + [nota, `# Ultime ${ESIB_ORE} ore fino a ${esibIso(adesso)} · ${ESIB_CHIUSURA(esibIso(adesso))}`, testa.join(';'), ...righe].join('\n');
}
function esibProspettoHtml(docs, sede, adesso, da) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const righe = docs.map(d => { const e = esibEsito(d); return `<tr><td>${esc(d.tipo)}</td><td><code>${esc(d.numero)}</code></td><td>${esc(d.ora)}</td><td>${esc(esibGiorno(d.giornata))}</td><td style="text-align:right">${d.importo < 0 ? '−' : ''}€ ${Math.abs(d.importo).toFixed(2)}</td><td>${esc(d.metodo)}</td><td>${esc(e.label)}${e.dettaglio ? `<br><small>${esc(e.dettaglio)}</small>` : ''}</td></tr>`; }).join('');
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Esibizione documenti · ${esc(sede.nome)}</title>
<style>body{font-family:Georgia,serif;max-width:900px;margin:32px auto;line-height:1.5;color:#111}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#555}code{font-family:ui-monospace,Menlo,monospace}.regime{border:1px solid #ccc;padding:10px 12px;font-size:13px;background:#fafafa}@media print{body{margin:12mm}}</style></head><body>
<h1>Esibizione dei documenti</h1>
<p><b>${esc(sede.nome)}</b> · ${esc(sede.indirizzo)}<br>Ultime ${ESIB_ORE} ore: dalle ${esc(esibIso(da))} alle ${esc(esibIso(adesso))}</p>
<p class="regime">${esc(ESIB_REGIME)}</p>
<h2>Documenti (${docs.length})</h2>
<table><thead><tr><th>Tipo</th><th>Numero</th><th>Data e ora</th><th>Giornata fiscale</th><th>Importo</th><th>Metodo</th><th>Esito dichiarato</th></tr></thead><tbody>${righe}</tbody></table>
<hr><p><small>${esc(ESIB_CHIUSURA(esibIso(adesso)))}</small></p></body></html>`;
}

// ─── Il foglio ───────────────────────────────────────────────────────────────
function ContEsibizione({ onClose }) {
  useFiscTick();
  const [q, setQ] = React.useState('');
  const [aperto, setAperto] = React.useState(null);
  const adesso = new Date();
  const da = new Date(adesso.getTime() - ESIB_ORE * 3600000);
  const sede = esibSede();
  const tutti = React.useMemo(() => esibDocumenti(adesso), [Math.floor(adesso.getTime() / 60000)]);
  const cerca = q.trim().toLowerCase();
  const docs = cerca ? tutti.filter(d => [d.numero, d.tipo === 'documento' ? d.info.idTrasm : d.fisc.idTrasm, d.conto.cliente, d.conto.tavolo]
    .some(v => String(v || '').toLowerCase().includes(cerca))) : tutti;
  // Il riepilogo per giornata: derivato, e detto tale. Si calcola sui SOLI
  // documenti compresi nella finestra (P-136), con lo stesso criterio
  // dell'elenco qui sopra — non sulla giornata intera, altrimenti la giornata
  // a cavallo del bordo mostrerebbe un totale che comprende fatti fuori dal
  // perimetro appena dichiarato, e i numeri non tornerebbero con l'elenco. La
  // giornata tagliata dal bordo lo dice: il verificatore che confronta col
  // portale vede un totale più basso, e la differenza va spiegata prima che la
  // chieda.
  const inFinestra = (p) => { const t = esibDate(p.ora); return t && t >= da && t <= adesso; };
  const giornate = window.ccChiusure().map(ch => {
    const dentro = ch.docs.filter(inFinestra);
    if (!dentro.length) return null;
    const totale = Math.round(dentro.reduce((s, p) => s + (p.amount || 0), 0) * 100) / 100;
    return { ch, dentro, totale, parziale: dentro.length < ch.docs.length, dalle: esibIso(da).split(' ')[1] };
  }).filter(Boolean);

  const btn = (label, onClick, primario) => (
    <button onClick={onClick} className="cassa-btn" style={{
      padding:'9px 16px', borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
      background: primario ? PN.TEXT : PN.WHITE, color: primario ? '#fff' : PN.TEXT, border: primario ? 'none' : `1px solid ${PN.BORDER}`,
    }}>{label}</button>
  );

  return (
    // Un popup sopra la Contabilità, non una schermata a parte: testata
    // fissa, corpo che scorre, la pagina sotto resta dov'era.
    <div onClick={onClose} style={{position:'fixed', inset: 0, zIndex: 900, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{width:'min(1120px, 100%)', maxHeight:'calc(var(--pn-vh, 100vh) - 40px)', background: C.SURF, borderRadius: 18, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 30px 80px rgba(0,0,0,0.32)'}}>
      {/* Testata: sede, finestra, uscita. Tutto quello che il verificatore
          chiede per primo sta qui, prima dell'elenco. */}
      <div style={{padding:'18px 28px 14px', background: PN.WHITE, borderBottom:`1px solid ${PN.BORDER}`, display:'flex', alignItems:'flex-start', gap: 16, flexWrap:'wrap', flexShrink: 0}}>
        <div style={{flex: 1, minWidth: 280}}>
          <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform:'uppercase'}}>Verifica fiscale · perimetro certificato</div>
          <div style={{fontSize: 22, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.4, marginTop: 2}}>Esibizione dei documenti</div>
          <div style={{fontSize: C.T_SM, color: PN.TEXT, marginTop: 4}}>
            <b>{sede.nome}</b> · {sede.indirizzo}
          </div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>
            Ultime {ESIB_ORE} ore · dalle {esibIso(da).replace(' ', ' alle ')} ad adesso ({esibIso(adesso).split(' ')[1]})
          </div>
        </div>
        <div style={{display:'flex', gap: 8, flexWrap:'wrap', alignItems:'center'}}>
          {btn('Scarica CSV', () => esibScarica(`Byup-esibizione-${esibIso(adesso).slice(0,10)}.csv`, esibCsv(tutti, sede, adesso), 'text/csv'))}
          {btn('Prospetto stampabile', () => esibScarica(`Byup-esibizione-${esibIso(adesso).slice(0,10)}.html`, esibProspettoHtml(tutti, sede, adesso, da), 'text/html'))}
          {btn('Chiudi', onClose, true)}
        </div>
      </div>

      <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflowY:'auto', padding:'18px 28px 32px', display:'flex', flexDirection:'column', gap: 16}}>
        <div style={{padding:'12px 16px', borderRadius: C.R_MD, background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderLeft:`3px solid ${PN.TEXT}`, fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.5, flexShrink: 0}}>
          {ESIB_REGIME}
        </div>

        {/* Ricerca per documento: la seconda domanda che arriva in sala. */}
        <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
          <div style={{flex:'1 1 320px', display:'flex', alignItems:'center', gap: 8, padding:'10px 14px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, background: PN.WHITE}}>
            <span style={{color: PN.MUTED}}><Ic.search size={16}/></span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Numero del documento o identificativo del canale…"
              style={{flex:1, border:'none', outline:'none', fontSize: C.T_MD, fontFamily:'inherit'}}/>
          </div>
          <span style={{fontSize: C.T_SM, color: PN.MUTED}}>{docs.length} {docs.length === 1 ? 'documento' : 'documenti'}{cerca ? ` su ${tutti.length}` : ''}</span>
        </div>

        {/* L'elenco: documenti, non conti. Ogni riga con esito e identificativo. */}
        {/* flexShrink 0: in una colonna flessibile le card si comprimerebbero
            per entrare nell'altezza e l'elenco si troncherebbe. */}
        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, overflow:'hidden', flexShrink: 0}}>
          <div style={{display:'grid', gridTemplateColumns:'1.4fr 1.1fr 0.9fr 0.8fr 0.8fr 2fr 0.5fr', gap: 12, padding:'10px 16px', background: C.TH_BG, fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT, textTransform:'uppercase', letterSpacing: 0.5}}>
            <span>Documento</span><span>Data e ora</span><span>Giornata fiscale</span><span style={{textAlign:'right'}}>Importo</span><span>Metodo</span><span>Esito dichiarato</span><span/>
          </div>
          {docs.length === 0 && <div style={{padding: 24, textAlign:'center', color: PN.MUTED, fontSize: C.T_SM}}>Nessun documento nelle ultime {ESIB_ORE} ore{cerca ? ' per questa ricerca' : ''}.</div>}
          {docs.map((d, i) => {
            const e = esibEsito(d);
            return (
              <button key={d.chiave} onClick={() => setAperto(d)} title="Apri la scheda del documento" style={{
                display:'grid', gridTemplateColumns:'1.4fr 1.1fr 0.9fr 0.8fr 0.8fr 2fr 0.5fr', gap: 12, alignItems:'center', width:'100%', textAlign:'left',
                padding:'11px 16px', borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE, border:'none', borderTopStyle:'solid',
                fontSize: C.T_SM, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background = '#F7F8FA'; }}
              onMouseLeave={ev => { ev.currentTarget.style.background = PN.WHITE; }}>
                <span style={{minWidth: 0}}>
                  <span style={{fontFamily:'ui-monospace, Menlo, monospace', fontWeight: 700}}>{d.numero}</span>
                  <span style={{display:'block', fontSize: C.T_XS, color: PN.MUTED}}>{d.tipo === 'documento' ? `${d.conto.tavolo} · ${d.conto.cliente}` : d.tipo === 'reso' ? `Reso di ${d.p.scontrinoNum}` : `Annullo di ${d.p.scontrinoNum}`}</span>
                </span>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{fmtDataOra(d.ora)}</span>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{esibGiorno(d.giornata)}</span>
                <span style={{textAlign:'right', fontWeight: 700, fontVariantNumeric:'tabular-nums', color: d.importo < 0 ? '#991B1B' : PN.TEXT}}>{d.importo < 0 ? '−' : ''}€ {Math.abs(d.importo).toFixed(2)}</span>
                <span>{d.metodo}</span>
                <span style={{display:'flex', flexDirection:'column', gap: 2, minWidth: 0}}>
                  <FiscPill tipo={e.pill} label={e.label}/>
                  {e.dettaglio && <span style={{fontSize: C.T_XS, color: PN.MUTED, fontFamily: e.pill === 'ok' ? 'ui-monospace, Menlo, monospace' : 'inherit', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.dettaglio}</span>}
                </span>
                <span style={{textAlign:'right', color: PN.MUTED}}>›</span>
              </button>
            );
          })}
        </div>

        {/* Riepilogo per giornata: derivato dai documenti, e detto tale. */}
        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 18, flexShrink: 0}}>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Riepilogo per giornata</div>
          <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2, marginBottom: 10}}>Derivato da Byup dai documenti qui sopra: è un riepilogo, non uno stato trasmesso dal canale.</div>
          {giornate.map(({ ch, dentro, totale, parziale, dalle }) => { const g = giornataInfo(ch); return (
            <div key={ch.id} style={{display:'flex', alignItems:'center', gap: 12, padding:'8px 0', borderTop:`1px solid ${PN.BORDER_SOFT}`, fontSize: C.T_SM}}>
              <span style={{width: parziale ? 'auto' : 100, minWidth: 100, fontVariantNumeric:'tabular-nums'}}>
                {ch.date}{parziale && <span style={{color: PN.MUTED, fontSize: C.T_XS, marginLeft: 6}}>parziale, dalle {dalle}</span>}
              </span>
              <span style={{flex: 1, color: PN.MUTED}}>{dentro.length} {dentro.length === 1 ? 'documento' : 'documenti'} · € {totale.toFixed(2)}</span>
              <GiornataChip info={g}/>
            </div>
          ); })}
        </div>

        <div style={{fontSize: C.T_XS, color: PN.MUTED_SOFT}}>{ESIB_CHIUSURA(esibIso(adesso))}</div>
      </div>
      </div>

      {aperto && <EsibizioneScheda doc={aperto} sede={sede} onClose={() => setAperto(null)}/>}
    </div>
  );
}

// ─── La scheda del documento: tutti i fatti in un posto ─────────────────────
function EsibizioneScheda({ doc, sede, onClose }) {
  const e = esibEsito(doc);
  const p = doc.p;
  const info = doc.info || docInfo(p);
  const righe = doc.tipo === 'documento' ? (p.righe || (doc.conto.payments.length === 1 ? (doc.conto.ordini || []) : [])) : [];
  const conIva = righe.some(r => r.aliquota != null);
  const rett = typeof rettDi === 'function' ? rettDi(p) : null;
  const R = ({ k, v, mono }) => (
    <div style={{display:'flex', gap: 12, padding:'7px 0', borderBottom:`1px solid ${PN.BORDER_SOFT}`, fontSize: C.T_SM}}>
      <span style={{width: 170, flexShrink: 0, color: PN.MUTED}}>{k}</span>
      <span style={{color: PN.TEXT, minWidth: 0, fontFamily: mono ? 'ui-monospace, Menlo, monospace' : 'inherit'}}>{v}</span>
    </div>
  );
  const scarica = () => {
    const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
    const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Scheda ${esc(doc.numero)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:32px auto;line-height:1.5}dt{font-weight:bold;margin-top:8px}code{font-family:ui-monospace,Menlo,monospace}</style></head><body>
<h1>Documento <code>${esc(doc.numero)}</code></h1><p>${esc(sede.nome)} · ${esc(sede.indirizzo)}</p>
<dl><dt>Data e ora</dt><dd>${esc(fmtDataOra(doc.ora))}</dd><dt>Giornata fiscale</dt><dd>${esc(esibGiorno(doc.giornata))}</dd><dt>Importo</dt><dd>${doc.importo < 0 ? '−' : ''}€ ${Math.abs(doc.importo).toFixed(2)} · ${esc(doc.metodo)}</dd>
<dt>Esito dichiarato</dt><dd>${esc(e.label)}${e.dettaglio ? ` · ${esc(e.dettaglio)}` : ''}</dd></dl>
<p>${esc(ESIB_REGIME)}</p><hr><p><small>${esc(ESIB_CHIUSURA(esibIso(new Date())))}</small></p></body></html>`;
    esibScarica(`Byup-scheda-${doc.numero}.html`, html, 'text/html');
  };

  return (
    // Il velo della scheda ferma la propagazione (P-149, fase 2): è montata
    // dentro il velo della console, e senza questo un clic per chiudere la
    // scheda chiudeva anche tutta la Verifica fiscale — davanti a chi controlla.
    <div onClick={ev => { ev.stopPropagation(); onClose(); }} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)', zIndex: 950, display:'grid', placeItems:'center', padding: 24}}>
      <div onClick={ev => ev.stopPropagation()} style={{
        width: 680, maxWidth:'100%', maxHeight:'calc(var(--pn-vh, 100vh) * 0.92)', background: PN.WHITE, borderRadius: 20,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24)', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'18px 24px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'flex-start', gap: 12}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform:'uppercase'}}>
              {doc.tipo === 'documento' ? 'Documento commerciale' : doc.tipo === 'reso' ? 'Documento di reso' : 'Documento di annullo'}
            </div>
            <div style={{fontSize: 22, fontWeight: 800, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace', marginTop: 2}}>{doc.numero}</div>
          </div>
          <FiscPill tipo={e.pill} label={e.label}/>
          <button onClick={onClose} style={{width: 30, height: 30, borderRadius: 8, background: C.SURF_ALT, border:'none', color: PN.MUTED, cursor:'pointer', display:'grid', placeItems:'center'}}><PnI.X size={12}/></button>
        </div>
        <div className="pn-scroll" style={{padding:'12px 24px 20px', overflowY:'auto'}}>
          <R k="Sede" v={`${sede.nome} · ${sede.indirizzo}`}/>
          <R k="Data e ora" v={fmtDataOra(doc.ora)}/>
          <R k="Giornata fiscale" v={esibGiorno(doc.giornata) + (info.tipo === 'waiting' ? ' · di domani: accodato dal canale' : '')}/>
          <R k="Conto" v={`${doc.conto.tavolo} · ${doc.conto.cliente} · ordine ${doc.conto.idOrdine}`}/>
          <R k="Importo" v={`${doc.importo < 0 ? '−' : ''}€ ${Math.abs(doc.importo).toFixed(2)} · ${doc.metodo}`}/>
          {doc.tipo !== 'documento' && <R k="Documento madre" v={p.scontrinoNum} mono/>}
          {doc.tipo !== 'documento' && doc.rett.motivo && <R k="Motivo" v={doc.rett.motivo}/>}
          <R k="Identificativo del canale" v={(doc.tipo === 'documento' ? info.idTrasm : doc.fisc.idTrasm) || 'nessuno: il canale non lo ha restituito'} mono/>
          {doc.tipo === 'documento' && info.inviato && <R k="Preso in carico" v={info.inviato}/>}
          {doc.tipo === 'documento' && info.tipo === 'ritrasmissione' && (
            <R k="Ritrasmissione" v={`tentativo ${info.tentativo} di 5 · prossimo alle ${info.prossimo} — politica di ritrasmissione di Byup, non un esito del canale`}/>
          )}
          {doc.tipo === 'documento' && info.scarto && (
            <React.Fragment>
              <R k="Scarto" v={`${info.scarto.motivo} · rilevato ${info.scarto.rilevato}`}/>
              <R k="Lettura Byup del codice del canale" v={info.scarto.causa}/>
              {info.gestito && <R k="Gestione" v={`${info.gestito.come === 'ritrasmissione' ? 'ritrasmissione riuscita' : 'a mano'} · ${info.gestito.quando}${info.gestito.nota ? ` · ${info.gestito.nota}` : ''}`}/>}
            </React.Fragment>
          )}

          {doc.tipo === 'documento' && (
            <div style={{marginTop: 14}}>
              <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6}}>Righe</div>
              {righe.length === 0 ? (
                <div style={{fontSize: C.T_SM, color: PN.MUTED}}>Nessuna riga associata: solo l'importo totale.</div>
              ) : righe.map((r, i) => (
                <div key={i} style={{display:'flex', gap: 10, fontSize: C.T_SM, padding:'4px 0', color: PN.TEXT}}>
                  <span style={{width: 28, color: PN.MUTED}}>{r.qty}×</span>
                  <span style={{flex: 1}}>{r.nome}</span>
                  {r.aliquota != null && <span style={{color: PN.MUTED}}>IVA {r.aliquota}%</span>}
                  <span style={{fontVariantNumeric:'tabular-nums'}}>€ {(r.prezzo * r.qty).toFixed(2)}</span>
                </div>
              ))}
              {/* L'IVA solo dove vive sulle righe: dove non c'è, si tace. */}
              {!conIva && <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 6}}>IVA: non riportata sulle righe di questo documento nel prototipo. Non si ricava e non si mostra.</div>}
            </div>
          )}

          {doc.tipo === 'documento' && rett && (
            <div style={{marginTop: 14}}>
              <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6}}>Rettifiche · documenti trasmessi a loro volta</div>
              {rett.resi.map((r, i) => { const f = rettFisc(p, r, i); return (
                <div key={i} style={{display:'flex', gap: 10, fontSize: C.T_SM, padding:'4px 0', color: PN.TEXT, flexWrap:'wrap'}}>
                  <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{rettDocReso(p, i)}</span>
                  <span style={{color: PN.MUTED}}>{fmtDataOra(r.ora)}</span>
                  <span style={{color:'#991B1B', fontWeight: 700}}>−€ {r.amount.toFixed(2)}</span>
                  <span style={{color: PN.MUTED, fontFamily:'ui-monospace, Menlo, monospace'}}>{f.idTrasm ? `trasmesso · ${f.idTrasm}` : f.esito}</span>
                </div>
              ); })}
              {rett.annullo && (() => { const f = rettFisc(p, rett.annullo, 0, true); return (
                <div style={{display:'flex', gap: 10, fontSize: C.T_SM, padding:'4px 0', color: PN.TEXT, flexWrap:'wrap'}}>
                  <span style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{rettDocAnnullo(p)}</span>
                  <span style={{color: PN.MUTED}}>{fmtDataOra(rett.annullo.ora)}</span>
                  <span style={{color:'#991B1B', fontWeight: 700}}>annullo −€ {rett.annullo.amount.toFixed(2)}</span>
                  <span style={{color: PN.MUTED, fontFamily:'ui-monospace, Menlo, monospace'}}>{f.idTrasm ? `trasmesso · ${f.idTrasm}` : f.esito}</span>
                </div>
              ); })()}
            </div>
          )}
        </div>
        <div style={{padding:'12px 24px 16px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 8, justifyContent:'flex-end'}}>
          <button onClick={scarica} style={{padding:'9px 16px', borderRadius: C.R_PILL, background: PN.WHITE, border:`1px solid ${PN.BORDER}`, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Scarica la scheda</button>
          <button onClick={onClose} style={{padding:'9px 16px', borderRadius: C.R_PILL, background: PN.TEXT, color:'#fff', border:'none', fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}

window.ContEsibizione = ContEsibizione;

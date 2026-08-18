// Tab Fatture — l'elenco dei documenti che Vendita diretta ha inviato allo SdI.
//
// Non ha un mock proprio: legge da localStorage quello che sala-fattura-modal
// scrive al momento dell'incasso, tramite le funzioni condivise in
// panoramica-sidebar.jsx (l'unico script comune a Sala e Contabilità).
//
// UNA RIGA = UN BERSAGLIO: la riga apre il documento, e le azioni stanno
// dentro. Tre pulsanti dentro una riga già cliccabile sono quattro bersagli
// annidati, e chi lavora non sa più cosa sta premendo. Chi deve emettere una
// nota di credito la fattura la guarda comunque, prima.
//
// Le note di credito NON sono figlie annidate della fattura che stornano:
// sono documenti con numero, data e posto propri nella numerazione, quindi
// stanno nella lista come tutti gli altri e si ordinano e si cercano come
// tutti gli altri. Il legame si legge sotto il cliente.

const CF_STATO = {
  in_attesa:  { label: 'In attesa SdI', bg: '#FEF3C7',   fg: '#B45309' },
  consegnata: { label: 'Consegnata',    bg: '#DCFCE7',   fg: '#16A34A' },
  scartata:   { label: 'Scartata',      bg: PN.RED_SOFT, fg: PN.RED    },
};

const CF_COLS = '110px 1fr 130px 110px 130px 26px';

function cfNomeCliente(c) {
  if (!c) return '—';
  return c.denominazione || `${c.nome || ''} ${c.cognome || ''}`.trim();
}

const cfMesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function cfFmtData(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${cfMesi[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const cfEur = (n) => '€ ' + (n || 0).toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const cfIsNota = (f) => f.tipo === 'nota_credito';

// Le azioni non sono pari grado, e la disponibilità dipende dallo stato — è
// quello che dà un senso allo stato oltre al colore del pallino.
//   in attesa  → non sai ancora se è arrivata: niente storno
//   scartata   → fiscalmente non è mai esistita: non la stampi (daresti al
//                cliente un documento non valido) e non la storni (non c'è
//                niente da stornare). Si corregge e si rimanda.
//   stornata   → una nota di credito per documento, come per gli scontrini
function cfAzioni(f, stornata) {
  if (f.stato === 'scartata') return { stampa: false, scarica: true, nota: false, correggi: true };
  return {
    stampa: true,
    scarica: true,
    nota: !cfIsNota(f) && f.stato === 'consegnata' && !stornata,
    correggi: false,
  };
}

// Giorni che restano per ritrasmettere con lo stesso numero (circolare
// 13/E/2018: 5 giorni dalla notifica di scarto). Oltre, la fattura va
// rifatta con numero e data nuovi — caso che qui non è gestito.
function cfGiorniRimasti(f) {
  if (!f.scartataIl) return null;
  const passati = Math.floor((Date.now() - new Date(f.scartataIl).getTime()) / 86400000);
  return 5 - passati;
}

// XML minimo nella forma FatturaPA — non è decorazione: è il documento che
// OpenAPI trasmette, e scaricarlo è il motivo per cui il commercialista apre
// questa pagina. Un pulsante "Scarica" che non scarica sarebbe finto.
function cfXml(f) {
  const c = f.cliente || {};
  const esc = (s) => String(s || '').replace(/[<>&]/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[m]));
  const netto = (r) => (r.lordo / (1 + r.aliquota / 100)).toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<FatturaElettronica versione="FPR12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <CodiceDestinatario>${esc(c.sdi || '0000000')}</CodiceDestinatario>${c.pec ? `
      <PECDestinatario>${esc(c.pec)}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CessionarioCommittente>
      <DatiAnagrafici>${c.piva ? `
        <IdFiscaleIVA><IdPaese>${esc(c.nazione || 'IT')}</IdPaese><IdCodice>${esc(c.piva)}</IdCodice></IdFiscaleIVA>` : ''}${c.cf ? `
        <CodiceFiscale>${esc(c.cf)}</CodiceFiscale>` : ''}
        <Anagrafica><Denominazione>${esc(cfNomeCliente(c))}</Denominazione></Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${esc(c.indirizzo)}</Indirizzo>
        <CAP>${esc(c.cap)}</CAP>
        <Comune>${esc(c.comune)}</Comune>${c.provincia ? `
        <Provincia>${esc(c.provincia)}</Provincia>` : ''}
        <Nazione>${esc(c.nazione || 'IT')}</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>${cfIsNota(f) ? 'TD04' : 'TD01'}</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${f.data.slice(0, 10)}</Data>
        <Numero>${esc(f.numero)}</Numero>
        <ImportoTotaleDocumento>${(f.totale || 0).toFixed(2)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>${f.storna ? `
      <DatiFattureCollegate>
        <IdDocumento>${esc(f.storna.numero)}</IdDocumento>
      </DatiFattureCollegate>` : ''}
    </DatiGenerali>
    <DatiBeniServizi>
${(f.righe || []).map((r, i) => `      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${esc(r.nome)}</Descrizione>
        <Quantita>${r.qty.toFixed(2)}</Quantita>
        <PrezzoTotale>${netto(r)}</PrezzoTotale>
        <AliquotaIVA>${r.aliquota.toFixed(2)}</AliquotaIVA>
      </DettaglioLinee>`).join('\n')}
${(f.riepilogo || []).map(r => `      <DatiRiepilogo>
        <AliquotaIVA>${r.aliquota.toFixed(2)}</AliquotaIVA>
        <ImponibileImporto>${r.imponibile.toFixed(2)}</ImponibileImporto>
        <Imposta>${r.imposta.toFixed(2)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>`).join('\n')}
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</FatturaElettronica>`;
}

function cfScarica(f) {
  const blob = new Blob([cfXml(f)], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${f.numero.replace(/[ /]/g, '_')}.xml`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock — come Conti, Costi e IVA, che hanno tutte i loro. Una tab che parte
// vuota sembra rotta, e i tre stati SdI non si vedrebbero mai: qui c'è una
// consegnata da stornare, una in attesa, una scartata e una coppia
// fattura↔nota di credito già formata.
//
// Le date si ri-ancorano all'oggi reale a ogni caricamento: un mock datato
// una volta per sempre invecchia e la colonna Data diventa insensata.
const cfData = (giorniFa, ora) => {
  const d = new Date();
  d.setDate(d.getDate() - giorniFa);
  const [h, m] = ora.split(':');
  d.setHours(+h, +m, 0, 0);
  return d.toISOString();
};

const BYUP_FATTURE_MOCK = [
  { id:'mk6', numero:'FPR 65/26', data: cfData(0, '13:40'), stato:'consegnata',
    cliente:{denominazione:'Studio Marani e Associati', piva:'02938471056', cf:'02938471056',
      indirizzo:'Via Nomentana 214', cap:'00162', comune:'Roma', provincia:'RM', nazione:'IT', sdi:'M5UXCR1'},
    righe:[{nome:'Tagliere misto',qty:1,lordo:14.00,aliquota:10},{nome:'Lasagna',qty:2,lordo:27.00,aliquota:10},{nome:'Tiramisù',qty:2,lordo:12.00,aliquota:10}],
    riepilogo:[{aliquota:10, lordo:53.00, imponibile:48.18, imposta:4.82}], totale:53.00 },

  { id:'mk5', numero:'FPR 64/26', data: cfData(0, '12:15'), stato:'in_attesa',
    cliente:{denominazione:'Nuvola Digitale S.r.l.', piva:'11720450017', cf:'11720450017',
      indirizzo:'Corso Vittorio Emanuele 88', cap:'00186', comune:'Roma', provincia:'RM', nazione:'IT', pec:'amministrazione@pec.nuvoladigitale.it'},
    righe:[{nome:'Diavola',qty:2,lordo:22.00,aliquota:10},{nome:'Spritz',qty:2,lordo:13.00,aliquota:22}],
    riepilogo:[{aliquota:10, lordo:22.00, imponibile:20.00, imposta:2.00},{aliquota:22, lordo:13.00, imponibile:10.66, imposta:2.34}], totale:35.00 },

  { id:'mk4', numero:'NC 1/26', data: cfData(1, '18:20'), stato:'consegnata', tipo:'nota_credito',
    storna:{ id:'mk3', numero:'FPR 63/26' },
    cliente:{denominazione:'Cantiere Blu S.p.A.', piva:'09284710962', cf:'09284710962',
      indirizzo:'Viale Certosa 152', cap:'20156', comune:'Milano', provincia:'MI', nazione:'IT', sdi:'K92RTY4'},
    righe:[{nome:'Tagliata di manzo',qty:1,lordo:18.00,aliquota:10},{nome:'Branzino al forno',qty:1,lordo:22.00,aliquota:10}],
    riepilogo:[{aliquota:10, lordo:40.00, imponibile:36.36, imposta:3.64}], totale:40.00 },

  { id:'mk3', numero:'FPR 63/26', data: cfData(1, '13:05'), stato:'consegnata',
    cliente:{denominazione:'Cantiere Blu S.p.A.', piva:'09284710962', cf:'09284710962',
      indirizzo:'Viale Certosa 152', cap:'20156', comune:'Milano', provincia:'MI', nazione:'IT', sdi:'K92RTY4'},
    righe:[{nome:'Tagliata di manzo',qty:1,lordo:18.00,aliquota:10},{nome:'Branzino al forno',qty:1,lordo:22.00,aliquota:10}],
    riepilogo:[{aliquota:10, lordo:40.00, imponibile:36.36, imposta:3.64}], totale:40.00 },

  { id:'mk2', numero:'FPR 62/26', data: cfData(1, '12:40'), stato:'scartata', scartataIl: cfData(1, '12:45'),
    cliente:{nome:'Elena', cognome:'Greco', cf:'GRCLNE85E45H501Z',
      indirizzo:'Via dei Gracchi 41', cap:'00192', comune:'Roma', provincia:'RM', nazione:'IT', sdi:'0000000'},
    righe:[{nome:'Margherita',qty:1,lordo:9.00,aliquota:10},{nome:'Cornetto',qty:1,lordo:2.00,aliquota:10}],
    riepilogo:[{aliquota:10, lordo:11.00, imponibile:10.00, imposta:1.00}], totale:11.00 },

  { id:'mk1', numero:'FPR 61/26', data: cfData(2, '20:10'), stato:'consegnata',
    cliente:{denominazione:'Terrarossa Vini S.r.l.', piva:'03810760754', cf:'03810760754',
      indirizzo:'Strada Provinciale 12, km 4', cap:'73100', comune:'Lecce', provincia:'LE', nazione:'IT', pec:'terrarossa@legalmail.it'},
    righe:[{nome:'Margherita',qty:1,lordo:9.00,aliquota:10},{nome:'Spritz',qty:1,lordo:6.50,aliquota:10}],
    riepilogo:[{aliquota:10, lordo:15.50, imponibile:14.09, imposta:1.41}], totale:15.50 },
];
// Serve al numeratore delle note di credito in panoramica-sidebar.jsx: senza,
// la prima NC emessa dall'interfaccia si chiamerebbe NC 1/26 come quella già
// nei mock.
window.BYUP_FATTURE_MOCK = BYUP_FATTURE_MOCK;

function ContFatture() {
  const [emesse, setEmesse] = React.useState(() => window.byupReadFatture ? window.byupReadFatture() : []);
  const [q, setQ] = React.useState('');
  const [sortData, setSortData] = React.useState(null); // null | 'desc' | 'asc' — stesso ciclo di Conti
  const [aperta, setAperta] = React.useState(null);     // id del documento aperto

  // Due canali di aggiornamento: 'storage' arriva da un'altra scheda (Vendita
  // diretta gira nella sua), l'evento custom da questa stessa pagina — serve
  // perché l'esito SdI arriva dopo l'invio, e la lista deve muoversi da sola.
  React.useEffect(() => {
    const update = () => setEmesse(window.byupReadFatture ? window.byupReadFatture() : []);
    window.addEventListener('byup-fatture-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-fatture-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  // Le vere hanno la precedenza sui mock A PARITÀ DI ID: correggere una
  // fattura mock la riscrive in localStorage con lo stesso id, e senza questo
  // filtro comparirebbe due volte — quella corretta e quella scartata.
  const idEmesse = new Set(emesse.map(f => f.id));
  const fatture = [...emesse, ...BYUP_FATTURE_MOCK.filter(m => !idEmesse.has(m.id))];

  // Quale fattura è stata stornata da quale nota: si deriva, non si duplica
  // sul documento — così una NC scartata non lascia l'originale marcato a vita.
  const stornate = {};
  fatture.forEach(f => { if (f.storna && f.stato !== 'scartata') stornate[f.storna.id] = f.numero; });

  const query = q.trim().toLowerCase();
  let righe = query
    ? fatture.filter(f => f.numero.toLowerCase().includes(query) || cfNomeCliente(f.cliente).toLowerCase().includes(query))
    : fatture;
  // Sempre per data: su documenti numerati progressivamente l'ordine
  // cronologico È l'ordine naturale, e senza questo una fattura corretta
  // salterebbe in cima solo perché è stata riscritta ora.
  righe = [...righe].sort((a, b) => sortData === 'asc' ? a.data.localeCompare(b.data) : b.data.localeCompare(a.data));

  const doc = fatture.find(f => f.id === aperta);

  return (
    <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
      <div style={{marginBottom: 14}}>
        <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Fatture</div>
        <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>
          {righe.length} {righe.length === 1 ? 'documento' : 'documenti'}
        </div>
      </div>

      <div style={{
        display:'flex', alignItems:'center', gap: 8, marginBottom: 14,
        padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
      }}>
        <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
        <input
          type="text" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Cerca numero o cliente…"
          style={{flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit'}}/>
      </div>

      {righe.length === 0 ? (
        <div style={{padding:'40px 20px', textAlign:'center', background: C.SURF, borderRadius: C.R_MD, color: PN.MUTED}}>
          <div style={{fontSize: C.T_SM, fontWeight: 600}}>Nessun documento trovato</div>
          <div style={{fontSize: C.T_XS, marginTop: 6}}>Nessun numero o cliente corrisponde a «{q.trim()}»</div>
        </div>
      ) : (
        <div style={{border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, overflow:'hidden', ...STSCROLL()}}>
          <div style={{
            display:'grid', gridTemplateColumns: CF_COLS, ...STMIN(620),
            padding:'10px 14px', background: C.TH_BG,
            fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT, letterSpacing: 0.5, textTransform:'uppercase',
          }}>
            <span>Numero</span>
            <span>Cliente</span>
            {/* Ciclo a 3 stati come in Conti: niente → più recenti → meno
                recenti → niente. Poter togliere l'ordinamento e tornare
                all'ordine di emissione conta, su documenti numerati. */}
            <span
              onClick={() => setSortData(s => s === null ? 'desc' : s === 'desc' ? 'asc' : null)}
              title="Ordina per data"
              style={{
                cursor:'pointer', userSelect:'none', alignSelf:'stretch',
                display:'flex', alignItems:'center', gap: 4,
                margin:'-10px 0', padding:'10px 8px',
                background: sortData ? C.SURF_ALT : 'transparent',
                color: sortData ? PN.TEXT : C.TH_TEXT,
                transition:'background .15s',
              }}>
              Data
              <span style={{
                display:'inline-flex', opacity: sortData ? 1 : 0.35,
                transform: sortData === 'asc' ? 'rotate(180deg)' : 'none',
                transition:'transform .15s',
              }}><PnI.ChevronDown size={11}/></span>
            </span>
            <span>Totale</span>
            <span>Stato</span>
            <span/>
          </div>
          {righe.map((f, i) => (
            <CfRiga key={f.id} f={f} stornataDa={stornate[f.id]}
              ultima={i === righe.length - 1} onApri={() => setAperta(f.id)}/>
          ))}
        </div>
      )}

      {doc && (
        <CfDocumentoModal
          f={doc}
          stornataDa={stornate[doc.id]}
          onClose={() => setAperta(null)}
          onNotaCredito={() => { window.byupCreaNotaCredito(doc); setAperta(null); }}
          onCorreggi={cliente => {
            // Stesso id, stesso numero, stessa data: è lo stesso documento che
            // riparte, non una fattura nuova. Lo scarto precedente si scrolla
            // via con scartataIl.
            const { scartataIl, ...resto } = doc;
            window.byupSaveFattura({ ...resto, cliente, stato: 'in_attesa' });
            setAperta(null);
          }}/>
      )}
    </div>
  );
}

function CfRiga({ f, stornataDa, ultima, onApri }) {
  const s = CF_STATO[f.stato] || CF_STATO.in_attesa;
  const nota = cfIsNota(f);
  // Il legame fra nota e fattura si legge qui sotto, non nella colonna Stato:
  // quella deve continuare a significare una cosa sola — dov'è arrivata allo SdI.
  const legame = nota ? `storna ${f.storna.numero}` : stornataDa ? `stornata da ${stornataDa}` : null;
  return (
    <div
      onClick={onApri}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onApri(); } }}
      role="button" tabIndex={0}
      onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; }}
      onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
      style={{
        display:'grid', gridTemplateColumns: CF_COLS, ...STMIN(620), alignItems:'center',
        padding:'12px 14px', background: PN.WHITE, cursor:'pointer',
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        borderBottom: ultima ? 'none' : 'none',
        transition:'background .12s',
      }}>
      <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{f.numero}</span>
      <span style={{minWidth: 0, paddingRight: 12}}>
        <span style={{
          display:'block', fontSize: C.T_SM, color: PN.TEXT,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{cfNomeCliente(f.cliente)}</span>
        {legame && (
          <span style={{display:'block', fontSize: C.T_XS, color: PN.MUTED_SOFT, marginTop: 1}}>{legame}</span>
        )}
      </span>
      <span style={{fontSize: C.T_XS, color: PN.MUTED}}>{cfFmtData(f.data)}</span>
      <span style={{
        fontSize: C.T_SM, fontWeight: 700, fontVariantNumeric:'tabular-nums',
        color: nota ? '#B91C1C' : PN.TEXT,
      }}>{nota ? '−' : ''}{cfEur(f.totale)}</span>
      <span>
        <span style={{
          padding:'4px 10px', borderRadius: 999, background: s.bg, color: s.fg,
          fontSize: C.T_XS, fontWeight: 700, whiteSpace:'nowrap',
        }}>{s.label}</span>
      </span>
      <span style={{color: PN.MUTED_LIGHT, display:'inline-flex'}}><PnI.ChevronRight size={12}/></span>
    </div>
  );
}

// Il documento aperto. Qui e solo qui stanno le azioni: chi storna una fattura
// se l'è appena riletta. Stampa e Scarica sono la stessa cosa in due formati
// (una copia); la nota di credito ne crea uno nuovo che parte allo SdI, quindi
// è separata di colore e passa da una conferma.
function CfDocumentoModal({ f, stornataDa, onClose, onNotaCredito, onCorreggi }) {
  const [conferma, setConferma] = React.useState(false);
  const [stampato, setStampato] = React.useState(false);
  // null = sola lettura · oggetto = correzione in corso sui dati del cliente
  const [corr, setCorr] = React.useState(null);
  const c = f.cliente || {};
  const s = CF_STATO[f.stato] || CF_STATO.in_attesa;
  const nota = cfIsNota(f);
  const az = cfAzioni(f, stornataDa);
  const giorni = cfGiorniRimasti(f);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex: 998,
      display:'flex', alignItems:'center', justifyContent:'center', padding: 20, fontFamily:'inherit',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, padding: 26,
        maxWidth: 480, width:'100%', maxHeight:'86vh', overflow:'auto',
      }}>
        <div style={{display:'flex', alignItems:'flex-start', gap: 10}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize: C.T_LG, fontWeight: 800, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace'}}>
              {f.numero}
            </div>
            <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 3}}>
              {nota ? 'Nota di credito TD04' : 'Fattura TD01'} · {cfFmtData(f.data)}
              {f.storna && ` · storna ${f.storna.numero}`}
              {stornataDa && ` · stornata da ${stornataDa}`}
            </div>
          </div>
          <span style={{
            padding:'4px 10px', borderRadius: 999, background: s.bg, color: s.fg,
            fontSize: C.T_XS, fontWeight: 700, flexShrink: 0,
          }}>{s.label}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: C.SURF_ALT, border:'none', color: PN.MUTED, cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={12}/></button>
        </div>

        {corr ? (
          /* In correzione il blocco cliente diventa il modulo: quello che lo
             SdI scarta sono quasi sempre gli identificativi del cliente —
             P.IVA, codice destinatario, sede. Righe e importi li calcola Byup
             e non sono mai il problema, per questo restano fuori. */
          <div style={{marginTop: 16, display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 10}}>
            {corr.denominazione !== undefined ? (
              <CfCampo label="Ragione sociale" span={6} value={corr.denominazione}
                onChange={v => setCorr({...corr, denominazione: v})}/>
            ) : (
              <React.Fragment>
                <CfCampo label="Nome" span={3} value={corr.nome} onChange={v => setCorr({...corr, nome: v})}/>
                <CfCampo label="Cognome" span={3} value={corr.cognome} onChange={v => setCorr({...corr, cognome: v})}/>
              </React.Fragment>
            )}
            <CfCampo label="Partita IVA" span={3} mono value={corr.piva} onChange={v => setCorr({...corr, piva: v})}/>
            <CfCampo label="Codice fiscale" span={3} mono value={corr.cf} onChange={v => setCorr({...corr, cf: v})}/>
            <CfCampo label="Indirizzo e civico" span={6} value={corr.indirizzo} onChange={v => setCorr({...corr, indirizzo: v})}/>
            <CfCampo label="CAP" span={1} mono value={corr.cap} onChange={v => setCorr({...corr, cap: v})}/>
            <CfCampo label="Comune" span={3} value={corr.comune} onChange={v => setCorr({...corr, comune: v})}/>
            <CfCampo label="Prov." span={2} mono value={corr.provincia} onChange={v => setCorr({...corr, provincia: v})}/>
            <CfCampo label="Codice destinatario" span={2} mono value={corr.sdi} onChange={v => setCorr({...corr, sdi: v})}/>
            <CfCampo label="PEC" span={4} value={corr.pec} onChange={v => setCorr({...corr, pec: v})}/>
          </div>
        ) : (
          <div style={{marginTop: 16, padding:'12px 14px', borderRadius: C.R_SM, background: C.SURF_ALT}}>
            <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT}}>{cfNomeCliente(c)}</div>
            <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2, lineHeight: 1.5}}>
              {(c.piva || c.cf) && <span>{c.piva || c.cf}</span>}
              {c.indirizzo && <span> · {c.indirizzo}, {c.cap} {c.comune}{c.provincia ? ` (${c.provincia})` : ''}</span>}
            </div>
            {(c.sdi || c.pec) && (
              <div style={{fontSize: C.T_XS, color: PN.MUTED_SOFT, marginTop: 3}}>
                {c.sdi ? `SDI ${c.sdi}` : `PEC ${c.pec}`}
              </div>
            )}
          </div>
        )}

        {f.stato === 'scartata' && !corr && (
          <div style={{
            marginTop: 12, padding:'11px 14px', borderRadius: C.R_SM,
            background: PN.RED_SOFT, color: PN.RED,
            fontSize: C.T_XS, fontWeight: 600, lineHeight: 1.45,
          }}>
            Lo SdI l'ha respinta: fiscalmente non è mai stata emessa.
            {giorni != null && (giorni > 0
              ? ` Correggila e rimandala entro ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'}: fino a lì mantiene numero e data.`
              : ' I 5 giorni per ritrasmetterla con lo stesso numero sono scaduti: va rifatta con numero e data nuovi.')}
          </div>
        )}

        <div style={{marginTop: 14, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, overflow:'hidden', display: corr ? 'none' : 'block'}}>
          {(f.righe || []).map((r, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 10, padding:'9px 13px',
              borderTop: i ? `1px solid ${PN.BORDER_SOFT}` : 'none', background: PN.WHITE,
            }}>
              <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.MUTED, minWidth: 24}}>{r.qty}×</span>
              <span style={{flex:1, minWidth:0, fontSize: C.T_SM, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.nome}</span>
              <span style={{
                fontSize: 12.5, fontWeight: 700, padding:'2px 7px', borderRadius: 6,
                background: r.aliquota === 22 ? '#FFF7ED' : '#F1F5F9',
                color: r.aliquota === 22 ? '#B45309' : '#475569',
              }}>IVA {r.aliquota}%</span>
              <span style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, minWidth: 66, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
                {cfEur(r.lordo)}
              </span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${PN.BORDER}`, background: C.SURF_ALT, padding:'10px 13px'}}>
            {(f.riepilogo || []).map(r => (
              <div key={r.aliquota} style={{display:'flex', gap: 10, fontSize: C.T_XS, color: PN.MUTED, padding:'2px 0'}}>
                <span style={{flex:1}}>Imponibile {r.aliquota}%</span>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{cfEur(r.imponibile)}</span>
                <span style={{minWidth: 86, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>IVA {cfEur(r.imposta)}</span>
              </div>
            ))}
            <div style={{
              display:'flex', marginTop: 8, paddingTop: 8, borderTop:`1px solid ${PN.BORDER}`,
              fontSize: C.T_MD, fontWeight: 800, color: nota ? '#B91C1C' : PN.TEXT,
            }}>
              <span style={{flex:1}}>Totale documento</span>
              <span style={{fontVariantNumeric:'tabular-nums'}}>{nota ? '−' : ''}{cfEur(f.totale)}</span>
            </div>
          </div>
        </div>

        {corr ? (() => {
          const nome = (corr.denominazione || `${corr.nome || ''} ${corr.cognome || ''}`).trim();
          const manca = !nome ? 'Manca il nome del cliente'
            : !corr.comune.trim() || !corr.indirizzo.trim() ? 'Manca la sede del cliente'
            : null;
          return (
            <div style={{display:'flex', gap: 10, marginTop: 16}}>
              <button onClick={() => setCorr(null)} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>Indietro</button>
              <button onClick={() => !manca && onCorreggi(corr)} disabled={!!manca} style={{
                flex:2, padding:'11px 14px', border:'none', borderRadius: C.R_SM,
                background: manca ? '#E5E7EB' : PN.TEXT, color: manca ? '#9CA3AF' : '#fff',
                fontSize: C.T_SM, fontWeight: 700, cursor: manca ? 'default' : 'pointer', fontFamily:'inherit',
              }}>{manca || `Correggi e reinvia ${f.numero}`}</button>
            </div>
          );
        })() : conferma ? (
          <div style={{marginTop: 16}}>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginBottom: 10, lineHeight: 1.5}}>
              Emetti una nota di credito che storna <b style={{color: PN.TEXT}}>{f.numero}</b> per intero.
              Parte allo SdI subito e non si annulla: {cfEur(f.totale)}.
            </div>
            <div style={{display:'flex', gap: 10}}>
              <button onClick={() => setConferma(false)} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>Indietro</button>
              <button onClick={onNotaCredito} style={{
                flex:2, padding:'11px 14px', background:'#B91C1C', color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>Emetti nota di credito</button>
            </div>
          </div>
        ) : (
          <div style={{display:'flex', gap: 8, marginTop: 16}}>
            {az.stampa && (
              <button onClick={() => { setStampato(true); setTimeout(() => setStampato(false), 2000); }} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
              }}>{stampato ? 'Stampata ✓' : 'Stampa'}</button>
            )}
            {az.scarica && (
              <button onClick={() => cfScarica(f)} style={{
                flex:1, padding:'11px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
              }}>Scarica XML</button>
            )}
            {az.nota && (
              <button onClick={() => setConferma(true)} style={{
                flex:1.4, padding:'11px 14px', background: PN.WHITE, border:'1px solid #FCA5A5',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#B91C1C', cursor:'pointer', fontFamily:'inherit',
              }}>Nota di credito</button>
            )}
            {/* Sulla scartata la correzione è l'azione principale, non una fra
                tante: è scura e piena, mentre Scarica resta di contorno. */}
            {az.correggi && (
              <button onClick={() => setCorr({
                denominazione: c.denominazione, nome: c.nome, cognome: c.cognome,
                piva: c.piva || '', cf: c.cf || '', indirizzo: c.indirizzo || '',
                cap: c.cap || '', comune: c.comune || '', provincia: c.provincia || '',
                nazione: c.nazione || 'IT', sdi: c.sdi || '', pec: c.pec || '',
              })} style={{
                flex:1.6, padding:'11px 14px', background: PN.TEXT, color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>Correggi e reinvia</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CfCampo({ label, span, value, onChange, mono }) {
  return (
    <div style={{gridColumn: `span ${span}`, minWidth: 0}}>
      <div style={{fontSize: C.T_XS, fontWeight: 700, color: PN.MUTED, marginBottom: 4}}>{label}</div>
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={{
        width:'100%', padding:'9px 11px', borderRadius: C.R_SM,
        border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
        fontSize: C.T_SM, color: PN.TEXT, fontFamily: mono ? 'ui-monospace, Menlo, monospace' : 'inherit',
        letterSpacing: mono ? 0.4 : 0, outline:'none', boxSizing:'border-box',
      }}/>
    </div>
  );
}

window.ContFatture = ContFatture;

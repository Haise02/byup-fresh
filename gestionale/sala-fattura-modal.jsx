// Sala — Finestra «Fattura» della vendita diretta.
//
// Si apre dalla pillola Fattura di INCASSA e raccoglie UNA cosa sola: chi è il
// cliente. Tutto il resto della fattura elettronica esiste già altrove e non si
// digita — le righe sono il carrello, il cedente sono i Dati fiscali del
// locale, il numero lo assegna l'invio, e come ha pagato lo sa il modal
// pagamento un istante dopo. Chiedere all'operatore di ricompilare quei blocchi
// al banco, con la fila davanti, è il modo in cui i gestionali per
// commercialisti diventano inutilizzabili in cassa.
//
// Qui NON parte niente verso lo SdI: la finestra conferma il cliente e torna
// all'incasso. La fattura si emette quando l'incasso si chiude, in un colpo
// solo — così `modalita_pagamento` (MP01/MP08) arriva gratis dal metodo scelto
// e il numero progressivo non si brucia se l'operatore abbandona.

// ─────────────────────────────────────────────────────────────────────────────
// L'aliquota non è un campo da compilare: discende dalla TIPOLOGIA che
// l'articolo dichiara (Impostazioni → Menù, oppure la finestra del fuori menù
// in cassa: PN_TIPOLOGIE_ARTICOLO, P-108 · D-105) e dal modo di consumo. In
// somministrazione si serve il tavolo e l'aliquota è una sola (voce 121); da
// asporto è una cessione di beni e la legge elenca i prodotti uno per uno —
// la tabella tipologia × modo vive nel dizionario, in un posto solo. Le due
// spunte di prima («Prodotto finito», «Contiene alcolici») non governano più
// nulla dell'IVA: mettevano al 22% anche acqua e birra, che stanno al 10%.
//
// Il valore va CONGELATO sulla riga d'ordine al momento della vendita: se
// domani qualcuno spunta "Contiene alcolici" su un prodotto, le fatture già
// emesse non devono cambiare e una nota di credito deve usare l'aliquota
// originale. Qui la riga arriva dal carrello e la porta con sé.
// Tinte della finestra. Sono le stesse dell'incasso al banco ma scritte qui:
// questa finestra la aprono due schermate — la Vendita diretta e il salda
// conto in sala — e Contabilità carica solo lei. Dipendere dai token di un
// altro file la faceva esplodere dove quel file non c'è.
const SVF_INK    = '#0F1729';
const SVF_MUTED  = '#7A8394';
const SVF_BORDER = '#E7EAEF';
const SVF_CORAL  = PN.PINK;
const SVF_TINT   = '#FFF3F2';
const SVF_GREEN  = '#16A34A';
const SVF_LABEL  = {
  fontSize: 13.5, fontWeight: 700, color: SVF_MUTED,
  letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8,
};

// Accetta la riga d'ordine (che porta `tipologia`) o il solo piatto. Senza
// tipologia vale la prima del dizionario: «quello che il locale prepara».
function svAliquota(x, takeaway) {
  const tip = x && (x.tipologia || (x.piatto && x.piatto.tipologia));
  if (window.pnTipologiaAliquota) return window.pnTipologiaAliquota(tip, !!takeaway);
  return 10;
}

// Le righe della fattura, nella forma in cui il documento le vuole: nome,
// quantità, lordo e l'aliquota che la riga porta con sé. Estratta a parte
// perché la finestra la mostra e la chiusura dell'incasso la salva — due
// momenti diversi che non devono poter calcolare l'aliquota in due modi.
function svfRighe(lines, takeaway) {
  return (lines || []).map(l => ({
    nome: l.displayName || l.piatto.name,
    qty: l.qty,
    lordo: l.lineTotal * l.qty,
    aliquota: l.aliquota != null ? l.aliquota : svAliquota(l, takeaway),
  }));
}

// Scorporo. I prezzi del menù sono LORDI — 9,00 è quello che il cliente paga e
// quello che legge sullo scontrino. La fattura vuole l'opposto: imponibile e
// imposta separati per aliquota. Il conto si fa sul totale del gruppo e non
// riga per riga, perché arrotondando ogni riga la somma delle imposte non
// torna più con l'imposta del totale — ed è la prima cosa che salta all'occhio
// di chi la fattura la controlla.
function svRiepilogoIva(lines, takeaway) {
  const gruppi = new Map();
  (lines || []).forEach(l => {
    const a = l.aliquota != null ? l.aliquota : svAliquota(l, takeaway);
    gruppi.set(a, (gruppi.get(a) || 0) + l.lineTotal * l.qty);
  });
  return [...gruppi.entries()]
    .sort((x, y) => x[0] - y[0])
    .map(([aliquota, lordo]) => {
      const imponibile = Math.round((lordo / (1 + aliquota / 100)) * 100) / 100;
      return { aliquota, lordo, imponibile, imposta: Math.round((lordo - imponibile) * 100) / 100 };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Le due sorgenti del cliente.
//
// La rubrica non ha una pagina: si popola sola dalle fatture emesse. Un
// ristorante ha una ventina di clienti che chiedono fattura, non duemila — al
// secondo giro non si digita più niente, e non c'è nessun archivio da tenere in
// ordine. Il registro imprese è la chiamata a OpenAPI, che in produzione
// risponde con denominazione, sede, CF e PEC a partire dalla sola P.IVA.
//
// Ci sta solo chi ha partita IVA: aziende, professionisti, enti pubblici. Il
// privato che ha chiesto fattura non torna mai come proposta, anche se la sua
// fattura è in Contabilità (lo è: FPR 62/26): quel dato è trattenuto dieci
// anni per obbligo fiscale, e riproporlo per comodità sarebbe riusarlo per
// un'altra ragione. Il privato ridetta i suoi dati ogni volta (D-17).
// L'impresa estera, quando arriverà, conta come azienda ai fini delle
// proposte: il razionale di D-17 colpisce le persone fisiche, non la nazione.
// Oggi non c'è perché non c'è ancora una fattura estera nei mock.
const SVF_RUBRICA_SEGMENTI = ['azienda', 'pa'];
const SVF_RUBRICA = [
  { seg:'azienda', denominazione:'Studio Marani e Associati', piva:'02938471056', cf:'02938471056',
    indirizzo:'Via Nomentana 214', cap:'00162', comune:'Roma', provincia:'RM', nazione:'IT',
    sdi:'M5UXCR1', pec:'' },
  { seg:'azienda', denominazione:'Nuvola Digitale S.r.l.', piva:'11720450017', cf:'11720450017',
    indirizzo:'Corso Vittorio Emanuele 88', cap:'00186', comune:'Roma', provincia:'RM', nazione:'IT',
    sdi:'', pec:'amministrazione@pec.nuvoladigitale.it' },
];

const SVF_REGISTRO = [
  { seg:'azienda', denominazione:'Officina Meccanica Baldi S.n.c.', piva:'04471290287', cf:'04471290287',
    indirizzo:'Via dell\'Artigianato 7', cap:'35127', comune:'Padova', provincia:'PD', nazione:'IT',
    sdi:'SUBM70N', pec:'' },
  { seg:'azienda', denominazione:'Terrarossa Vini S.r.l.', piva:'03810760754', cf:'03810760754',
    indirizzo:'Strada Provinciale 12, km 4', cap:'73100', comune:'Lecce', provincia:'LE', nazione:'IT',
    sdi:'', pec:'terrarossa@legalmail.it' },
  { seg:'azienda', denominazione:'Cantiere Blu S.p.A.', piva:'09284710962', cf:'09284710962',
    indirizzo:'Viale Certosa 152', cap:'20156', comune:'Milano', provincia:'MI', nazione:'IT',
    sdi:'K92RTY4', pec:'' },
  { seg:'pa', denominazione:'Comune di Roma — Dipartimento Cultura', piva:'02438750586', cf:'02438750586',
    indirizzo:'Piazza del Campidoglio 1', cap:'00186', comune:'Roma', provincia:'RM', nazione:'IT',
    sdi:'UF9T2K', pec:'' },
];

// CAP → comune e provincia. In produzione è la chiamata comuni/CAP di OpenAPI:
// serve perché il CAP è l'unico dei tre che il cliente detta senza sbagliarlo,
// e da lì gli altri due si riempiono da soli.
const SVF_CAP = {
  '00162':['Roma','RM'], '00186':['Roma','RM'], '00192':['Roma','RM'], '00197':['Roma','RM'],
  '20156':['Milano','MI'], '20121':['Milano','MI'],
  '35127':['Padova','PD'], '73100':['Lecce','LE'], '80132':['Napoli','NA'], '50122':['Firenze','FI'],
};

// I quattro segmenti non sono un'etichetta: cambiano COSA è obbligatorio e che
// codice destinatario va nel file. Sbagliare segmento è l'unico errore che lo
// SdI scarta senza appello, quindi si sceglie per primo e sta in testa.
const SVF_SEGMENTI = [
  { k:'azienda', label:'Azienda',  sub:'con P.IVA' },
  { k:'privato', label:'Privato',  sub:'senza P.IVA' },
  { k:'pa',      label:'PA',       sub:'ente pubblico' },
  { k:'estero',  label:'Estero',   sub:'fuori Italia' },
];

const SVF_NAZIONI = [
  ['FR','Francia'], ['DE','Germania'], ['ES','Spagna'], ['AT','Austria'], ['NL','Paesi Bassi'],
  ['CH','Svizzera'], ['GB','Regno Unito'], ['US','Stati Uniti'], ['SM','San Marino'],
];

const SVF_VUOTO = {
  seg:'azienda', denominazione:'', nome:'', cognome:'', piva:'', cf:'',
  indirizzo:'', cap:'', comune:'', provincia:'', nazione:'IT', sdi:'', pec:'',
};

// Il codice destinatario di default dipende solo dal segmento, e in due casi su
// quattro non è nemmeno una scelta: al privato va sempre 0000000 (la fattura
// finisce nel suo cassetto fiscale e gli si dà la copia di cortesia), all'estero
// sempre XXXXXXX. Chiederglielo sarebbe un campo che si può solo sbagliare.
function svfSdiBloccato(seg) {
  if (seg === 'privato') return '0000000';
  if (seg === 'estero')  return 'XXXXXXX';
  return null;
}

function svfNome(c) {
  if (!c) return '';
  return c.denominazione || `${c.nome || ''} ${c.cognome || ''}`.trim();
}

// Come si cerca un cliente, in rubrica e nel registro: per nome, per P.IVA e
// per codice fiscale — ma solo il codice fiscale di un ente, che è numerico e
// di norma coincide con la P.IVA. Quello di una persona fisica (16 caratteri)
// non è una chiave di ricerca: chi digita il CF di un privato non trova nulla,
// e deve essere così (D-17).
function svfCfEnte(cf) {
  return /^\d{11}$/.test(cf || '');
}
function svfCorrisponde(r, q) {
  if (svfNome(r).toLowerCase().includes(q)) return true;
  if ((r.piva || '').includes(q)) return true;
  return svfCfEnte(r.cf) && r.cf.includes(q);
}

// Cosa manca perché il file passi lo SdI. È una frase sola, quella che serve
// adesso: l'elenco completo dei campi vuoti si legge già nei bordi rossi.
function svfManca(c) {
  const identita = c.seg === 'privato' || c.seg === 'pa' ? c.cf : c.piva;
  if (!svfNome(c)) return c.seg === 'privato' ? 'Manca nome e cognome' : 'Manca la ragione sociale';
  if (c.seg === 'estero') {
    if (!c.indirizzo.trim() || !c.comune.trim()) return 'Manca la sede del cliente';
    return null;
  }
  if (!identita.trim()) return c.seg === 'azienda' ? 'Manca la partita IVA' : 'Manca il codice fiscale';
  if (!c.indirizzo.trim() || !c.cap.trim() || !c.comune.trim()) return 'Manca la sede del cliente';
  if (c.seg === 'pa' && c.sdi.trim().length !== 6) return 'Il codice ufficio della PA è di 6 caratteri';
  if (c.seg === 'azienda' && !c.sdi.trim() && !c.pec.trim()) return 'Serve il codice SDI o la PEC';
  if (c.seg === 'azienda' && c.sdi.trim() && c.sdi.trim().length !== 7) return 'Il codice SDI è di 7 caratteri';
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pezzi

const SVF_INPUT = {
  width: '100%', padding: '11px 13px', borderRadius: 11,
  border: `1px solid ${SVF_BORDER}`, background: '#fff',
  fontSize: 16.5, color: SVF_INK, fontFamily: 'inherit', outline: 'none',
};

function SvfCampo({ label, hint, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: SVF_MUTED, marginBottom: 5 }}>
        {label}{hint && <span style={{ fontWeight: 500, color: '#AFB6C2' }}> · {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SvfInput({ value, onChange, placeholder, mono, disabled, invalid }) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={{
        ...SVF_INPUT,
        borderColor: invalid ? '#F0A0A8' : SVF_BORDER,
        background: disabled ? '#F5F6F8' : '#fff',
        color: disabled ? SVF_MUTED : SVF_INK,
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, monospace' : 'inherit',
        letterSpacing: mono ? 0.6 : 0,
        textTransform: mono ? 'uppercase' : 'none',
      }}/>
  );
}

function SvfSegmento({ seg, onSeg }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
      {SVF_SEGMENTI.map(s => {
        const on = seg === s.k;
        return (
          <button key={s.k} onClick={() => onSeg(s.k)} style={{
            padding: '9px 8px 10px', borderRadius: 13,
            background: on ? SVF_TINT : '#fff',
            border: `1.5px solid ${on ? SVF_CORAL : SVF_BORDER}`,
            color: on ? SVF_CORAL : SVF_INK,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
            transition: 'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
          }}>
            <div style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.15 }}>{s.label}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: on ? SVF_CORAL : '#AFB6C2', marginTop: 2 }}>{s.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// Due modi di stare sullo schermo, e il secondo è quello buono quando la
// schermata che la apre è già una finestra:
//
//   finestra (default) — velo scuro e pannello centrato. Sopra l'incasso al
//   banco, che occupa mezzo schermo, funziona: si vede che c'è una cosa sotto.
//
//   `dentro` — foglio che riempie ESATTAMENTE il riquadro che la ospita, senza
//   velo. Sopra il salda conto, che è già un pannello grande, il velo lasciava
//   in giro una cornice di finestra dentro la finestra: due bordi, due ombre e
//   una striscia sfocata in mezzo. Così invece è la stessa finestra che cambia
//   contenuto — che è quello che succede davvero.
function SvFatturaModal({ open, lines, takeaway, cliente, onClose, onConfirm, onRemove,
  larghezza = 720, raggio = 26, maxAltezza = '100%', dentro = false }) {
  const [c, setC] = React.useState(SVF_VUOTO);
  const [query, setQuery] = React.useState('');
  // Le due sorgenti arrivano in due momenti: la rubrica è in casa e risponde
  // mentre digiti, il registro imprese è una chiamata di rete e ha bisogno di
  // dire che sta lavorando — altrimenti chi cerca crede che non ci sia nulla.
  const [remoti, setRemoti] = React.useState([]);
  const [cercando, setCercando] = React.useState(false);
  const [aperto, setAperto] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setC(cliente ? { ...SVF_VUOTO, ...cliente } : SVF_VUOTO);
    setQuery('');
    setRemoti([]);
    setCercando(false);
    setAperto(false);
  }, [open]);

  // Ricerca sul registro imprese. Sotto i 3 caratteri non parte: al banco si
  // digita di fretta e ogni tasto sarebbe una chiamata a vuoto pagata a consumo.
  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 3) { setRemoti([]); setCercando(false); return; }
    setCercando(true);
    const id = setTimeout(() => {
      setRemoti(SVF_REGISTRO.filter(r => svfCorrisponde(r, q)));
      setCercando(false);
    }, 420);
    return () => clearTimeout(id);
  }, [query]);

  if (!open) return null;

  const set = (k, v) => setC(p => ({ ...p, [k]: v }));

  // Cambiare segmento non azzera quello che è già scritto — chi sbaglia il
  // primo pulsante e se ne accorge dopo aver compilato non deve ricominciare —
  // ma il codice destinatario sì: è l'unico campo il cui valore giusto dipende
  // interamente dal segmento, e lasciarlo lì sarebbe un errore che passa.
  function cambiaSeg(seg) {
    setC(p => ({ ...p, seg, sdi: svfSdiBloccato(seg) || '' }));
  }

  function scegli(r) {
    setC({ ...SVF_VUOTO, ...r, sdi: svfSdiBloccato(r.seg) || r.sdi || '' });
    setQuery('');
    setAperto(false);
  }

  // Il CAP tira dentro comune e provincia. Non li blocca: i CAP condivisi da
  // più comuni esistono, e vince chi detta l'indirizzo.
  function setCap(v) {
    const cap = v.replace(/\D/g, '').slice(0, 5);
    const trovato = SVF_CAP[cap];
    setC(p => ({ ...p, cap, comune: trovato ? trovato[0] : p.comune, provincia: trovato ? trovato[1] : p.provincia }));
  }

  const q = query.trim().toLowerCase();
  const locali = q.length < 2 ? [] : SVF_RUBRICA.filter(r =>
    SVF_RUBRICA_SEGMENTI.includes(r.seg) && svfCorrisponde(r, q));
  const mostraLista = aperto && q.length >= 2;

  const righe = svfRighe(lines, takeaway);
  const riepilogo = svRiepilogoIva(lines, takeaway);
  const totale = riepilogo.reduce((s, r) => s + r.lordo, 0);

  const sdiBloccato = svfSdiBloccato(c.seg);
  const manca = svfManca(c);
  const pronto = !manca && righe.length > 0;
  const privato = c.seg === 'privato';
  const estero = c.seg === 'estero';

  return (
    <div
      onClick={dentro ? undefined : onClose}
      style={dentro ? {
        position: 'absolute', inset: 0, zIndex: 80,
        background: '#fff', display: 'flex', flexDirection: 'column',
        animation: 'svfEntra 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      } : {
        position: 'fixed', inset: 0, background: 'rgba(10,14,24,0.62)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'grid', placeItems: 'center', zIndex: 240, padding: 24,
      }}>
      <style>{`
        @keyframes svfEntra {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
      <div onClick={dentro ? undefined : (e => e.stopPropagation())} style={dentro ? {
        background: '#fff', flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      } : {
        background: '#fff', borderRadius: raggio,
        width: larghezza, maxWidth: '100%', maxHeight: maxAltezza,
        boxShadow: '0 32px 80px rgba(5,10,25,0.45)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Testata. Non una X: da qui non si chiude niente, si torna
            all'incasso che sta ancora lì sotto col conto dov'era — e la strada
            del ritorno si mette dove si comincia a leggere, in alto a
            sinistra. */}
        <div style={{ padding: '16px 26px 0' }}>
          <button onClick={onClose} title="Torna all'incasso"
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F8'; e.currentTarget.style.color = SVF_INK; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SVF_MUTED; }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px 7px 8px', marginLeft: -8, borderRadius: 9,
              background: 'transparent', border: 'none', color: SVF_MUTED,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 150ms ease-out, color 150ms ease-out',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Indietro
          </button>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.7, color: SVF_INK, lineHeight: 1, marginTop: 8 }}>
            FATTURA
          </div>
          <div style={{ fontSize: 15, color: SVF_MUTED, marginTop: 5 }}>
            Il numero e l'invio arrivano quando incassi
          </div>
        </div>

        <div className="pn-scroll" style={{ overflow: 'auto', padding: '16px 26px 4px' }}>
          <SvfSegmento seg={c.seg} onSeg={cambiaSeg}/>

          {/* Un campo solo per due modi di cercare la stessa cosa. Chi ha la
              fattura di ieri detta la P.IVA, chi non ce l'ha detta il nome:
              separare i due campi obbliga a scegliere prima di sapere.
              Sul privato il campo non c'è: non c'è niente da cercare, né in
              rubrica né nel registro imprese, e i dati si scrivono sotto.
              Nessuna spiegazione a schermo — l'assenza del campo basta. */}
          {!privato && <div style={{ position: 'relative', marginTop: 16 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={SVF_MUTED} strokeWidth="2.1" strokeLinecap="round" style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
            }}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setAperto(true); }}
              onFocus={() => setAperto(true)}
              placeholder="Partita IVA o ragione sociale"
              style={{ ...SVF_INPUT, padding: '13px 13px 13px 40px', fontSize: 17 }}/>

            {mostraLista && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 5,
                background: '#fff', border: `1px solid ${SVF_BORDER}`, borderRadius: 14,
                boxShadow: '0 18px 40px -18px rgba(10,20,40,0.35)', overflow: 'hidden',
                maxHeight: 300, overflowY: 'auto',
              }}>
                {locali.length > 0 && (
                  <div style={{ ...SVF_LABEL, margin: 0, padding: '10px 14px 6px' }}>Già fatturati qui</div>
                )}
                {locali.map((r, i) => <SvfSuggerimento key={`l${i}`} r={r} onClick={() => scegli(r)}/>)}

                <div style={{ ...SVF_LABEL, margin: 0, padding: '10px 14px 6px', borderTop: locali.length ? `1px solid ${SVF_BORDER}` : 'none' }}>
                  Registro imprese
                </div>
                {cercando && (
                  <div style={{ padding: '8px 14px 14px', fontSize: 15.5, color: SVF_MUTED }}>Cerco…</div>
                )}
                {!cercando && remoti.map((r, i) => <SvfSuggerimento key={`r${i}`} r={r} onClick={() => scegli(r)}/>)}
                {!cercando && remoti.length === 0 && (
                  <div style={{ padding: '8px 14px 14px', fontSize: 15.5, color: SVF_MUTED }}>
                    Nessuna impresa trovata — scrivi i dati qui sotto
                  </div>
                )}
              </div>
            )}
          </div>}

          {/* Anagrafica */}
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {privato ? (
              <>
                <SvfCampo label="Nome" span={3}>
                  <SvfInput value={c.nome} onChange={v => set('nome', v)} placeholder="Elena" invalid={!c.nome.trim()}/>
                </SvfCampo>
                <SvfCampo label="Cognome" span={3}>
                  <SvfInput value={c.cognome} onChange={v => set('cognome', v)} placeholder="Greco" invalid={!c.cognome.trim()}/>
                </SvfCampo>
                <SvfCampo label="Codice fiscale" span={6}>
                  <SvfInput value={c.cf} onChange={v => set('cf', v)} placeholder="GRCLNE85E45H501Z" mono invalid={!c.cf.trim()}/>
                </SvfCampo>
              </>
            ) : (
              <>
                <SvfCampo label={c.seg === 'pa' ? 'Denominazione ente' : 'Ragione sociale'} span={6}>
                  <SvfInput value={c.denominazione} onChange={v => set('denominazione', v)}
                    placeholder={c.seg === 'pa' ? 'Comune di…' : 'Nuvola Digitale S.r.l.'}
                    invalid={!c.denominazione.trim()}/>
                </SvfCampo>
                <SvfCampo label={estero ? 'Identificativo fiscale' : 'Partita IVA'} hint={estero ? 'se ce l\'ha' : null} span={3}>
                  <SvfInput value={c.piva} onChange={v => set('piva', v)} placeholder={estero ? 'DE123456789' : '11720450017'}
                    mono invalid={!estero && c.seg === 'azienda' && !c.piva.trim()}/>
                </SvfCampo>
                <SvfCampo label="Codice fiscale" hint={c.seg === 'pa' ? null : 'se diverso'} span={3}>
                  <SvfInput value={c.cf} onChange={v => set('cf', v)} placeholder="11720450017" mono
                    invalid={c.seg === 'pa' && !c.cf.trim()}/>
                </SvfCampo>
              </>
            )}
          </div>

          {/* Sede — il blocco che nessuno si aspetta e senza cui lo SdI scarta.
              Sta in chiaro e non dietro un "altri dati": è obbligatorio quanto
              la partita IVA. */}
          <div style={{ ...SVF_LABEL, marginTop: 20 }}>Sede del cliente</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            <SvfCampo label="Indirizzo e civico" span={6}>
              <SvfInput value={c.indirizzo} onChange={v => set('indirizzo', v)}
                placeholder="Corso Vittorio Emanuele 88" invalid={!c.indirizzo.trim()}/>
            </SvfCampo>
            <SvfCampo label="CAP" span={estero ? 1 : 1}>
              <SvfInput value={c.cap} onChange={setCap} placeholder="00186" mono invalid={!estero && !c.cap.trim()}/>
            </SvfCampo>
            <SvfCampo label="Comune" span={estero ? 3 : 3}>
              <SvfInput value={c.comune} onChange={v => set('comune', v)} placeholder="Roma" invalid={!c.comune.trim()}/>
            </SvfCampo>
            {estero ? (
              <SvfCampo label="Nazione" span={2}>
                <select value={c.nazione === 'IT' ? '' : c.nazione} onChange={e => set('nazione', e.target.value)}
                  style={{ ...SVF_INPUT, cursor: 'pointer' }}>
                  <option value="">Seleziona…</option>
                  {SVF_NAZIONI.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                </select>
              </SvfCampo>
            ) : (
              <SvfCampo label="Provincia" span={2}>
                <SvfInput value={c.provincia} onChange={v => set('provincia', v)} placeholder="RM" mono/>
              </SvfCampo>
            )}
          </div>

          {/* Dove va consegnata. Su privato ed estero non è una domanda: il
              valore è uno solo e si mostra bloccato, con scritto perché. */}
          <div style={{ ...SVF_LABEL, marginTop: 20 }}>Dove arriva la fattura</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            <SvfCampo
              label={c.seg === 'pa' ? 'Codice ufficio' : 'Codice destinatario'}
              hint={c.seg === 'pa' ? '6 caratteri' : sdiBloccato ? null : '7 caratteri'}
              span={2}>
              <SvfInput value={sdiBloccato || c.sdi} onChange={v => set('sdi', v)}
                placeholder={c.seg === 'pa' ? 'UF9T2K' : 'M5UXCR1'} mono
                disabled={!!sdiBloccato}
                invalid={c.seg === 'pa' && c.sdi.trim().length !== 6}/>
            </SvfCampo>
            <SvfCampo label="PEC" hint={c.seg === 'azienda' ? 'in alternativa al codice' : 'facoltativa'} span={4}>
              <SvfInput value={c.pec} onChange={v => set('pec', v)} placeholder="amministrazione@pec.esempio.it"/>
            </SvfCampo>
          </div>
          {sdiBloccato && (
            <div style={{ fontSize: 14.5, color: SVF_MUTED, marginTop: 8, lineHeight: 1.45 }}>
              {privato
                ? 'Al privato la fattura arriva nel cassetto fiscale dell\'Agenzia. Stampa o manda la copia di cortesia.'
                : 'Al cliente estero la fattura non viene recapitata dallo SdI: la copia gliela mandi tu.'}
            </div>
          )}

          {/* Le righe non si compilano: sono il carrello. Si mostrano perché
              l'aliquota è l'unica cosa che il cliente non ha visto scegliere e
              che finisce sul documento — e perché il totale della fattura deve
              coincidere con quello che sta per pagare, a occhio, subito. */}
          <div style={{ ...SVF_LABEL, marginTop: 22, display: 'flex', justifyContent: 'space-between' }}>
            <span>Cosa fatturi</span>
            <span style={{ letterSpacing: 0, textTransform: 'none', fontWeight: 600 }}>
              dal carrello · {takeaway ? 'asporto' : 'somministrazione'}
            </span>
          </div>
          <div style={{ border: `1px solid ${SVF_BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {righe.length === 0 && (
              <div style={{ padding: '16px 14px', fontSize: 16, color: SVF_MUTED }}>Il carrello è vuoto.</div>
            )}
            {righe.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderTop: i ? `1px solid ${SVF_BORDER}` : 'none',
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: SVF_MUTED, minWidth: 26, fontVariantNumeric: 'tabular-nums' }}>{r.qty}×</span>
                <span style={{ flex: 1, fontSize: 16.5, color: SVF_INK, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nome}</span>
                <span style={{
                  fontSize: 13.5, fontWeight: 700, padding: '3px 8px', borderRadius: 7,
                  background: r.aliquota === 22 ? '#FFF7ED' : '#F1F5F9',
                  color: r.aliquota === 22 ? '#B45309' : '#475569',
                }}>IVA {r.aliquota}%</span>
                <span style={{ fontSize: 16.5, fontWeight: 700, color: SVF_INK, fontVariantNumeric: 'tabular-nums', minWidth: 74, textAlign: 'right' }}>{svEur(r.lordo)}</span>
              </div>
            ))}

            {riepilogo.length > 0 && (
              <div style={{ borderTop: `1px solid ${SVF_BORDER}`, background: '#FAFBFC', padding: '10px 14px' }}>
                {riepilogo.map(r => (
                  <div key={r.aliquota} style={{ display: 'flex', gap: 10, fontSize: 15, color: SVF_MUTED, padding: '2px 0' }}>
                    <span style={{ flex: 1 }}>Imponibile {r.aliquota}%</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{svEur(r.imponibile)}</span>
                    <span style={{ minWidth: 96, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>IVA {svEur(r.imposta)}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${SVF_BORDER}`,
                  fontSize: 18, fontWeight: 800, color: SVF_INK,
                }}>
                  <span style={{ flex: 1 }}>Totale documento</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{svEur(totale)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 26px 18px', borderTop: `1px solid ${SVF_BORDER}`, background: '#fff', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {cliente && (
              <button onClick={() => { onRemove && onRemove(); onClose(); }} style={{
                padding: '14px 18px', borderRadius: 14, flexShrink: 0,
                background: '#fff', border: `1px solid ${SVF_BORDER}`, color: SVF_MUTED,
                fontSize: 16.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Togli fattura</button>
            )}
            <button
              onClick={() => { if (pronto) { onConfirm(c); onClose(); } }}
              disabled={!pronto}
              style={{
                flex: 1, padding: '15px 20px', borderRadius: 14,
                background: pronto ? SVF_GREEN : '#EFEFF1',
                color: pronto ? '#fff' : '#9CA3AF',
                border: 'none', fontSize: 18, fontWeight: 700,
                cursor: pronto ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                boxShadow: pronto ? '0 8px 20px -8px rgba(22,163,74,0.55)' : 'none',
                transition: 'filter 150ms ease-out',
              }}
              onMouseEnter={e => { if (pronto) e.currentTarget.style.filter = 'brightness(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
              {righe.length === 0 ? 'Nessun articolo nel conto' : manca || 'Conferma e torna all\'incasso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SvfSuggerimento({ r, onClick }) {
  const id = r.piva || r.cf;
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: '9px 14px', background: '#fff', border: 'none',
      cursor: 'pointer', fontFamily: 'inherit',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F8'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
      <div style={{ fontSize: 16.5, fontWeight: 600, color: SVF_INK }}>{svfNome(r)}</div>
      <div style={{ fontSize: 14.5, color: SVF_MUTED, marginTop: 1 }}>
        {id} · {r.comune} ({r.provincia})
      </div>
    </button>
  );
}

// Il progressivo si assegna QUI, all'invio, e non quando la finestra si apre:
// una fattura iniziata e abbandonata non deve lasciare un buco nella
// numerazione, e i buchi in una numerazione fiscale si spiegano a voce a chi
// controlla. Sezionale e contatore in produzione vivono sul locale.
let SVF_PROGRESSIVO = 60;
function svfNumeroFattura() {
  SVF_PROGRESSIVO += 1;
  return `FPR ${SVF_PROGRESSIVO}/${String(new Date().getFullYear()).slice(2)}`;
}

window.SvFatturaModal = SvFatturaModal;
window.svAliquota = svAliquota;
window.svRiepilogoIva = svRiepilogoIva;
window.svfRighe = svfRighe;
window.svfNome = svfNome;
window.svfNumeroFattura = svfNumeroFattura;

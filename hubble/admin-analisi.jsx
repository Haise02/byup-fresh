// ════════════════════════════════════════════════════════════════════════════
// ANALISI · le viste dei blocchi nuovi
// ════════════════════════════════════════════════════════════════════════════
//
// Regola di questa pagina, valida per ogni riquadro: nome del dato, formula con
// cui è calcolato, e una lettura che CAMBIA col risultato — perché un numero da
// solo non dice se è una buona notizia. Niente commenti decorativi: se una
// frase non aggiunge una cosa che il numero non dice già, non c'è.

const AN_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const anNum = (v, dec = 0) => Number(v || 0).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const anEur = (v, dec = 0) => '€ ' + anNum(v, dec);
const anPct = (v, dec = 1) => anNum(v, dec) + '%';
const anSegno = (v, dec = 1) => {
  const a = Number(Math.abs(v || 0).toFixed(dec));
  if (a === 0) return '0%';
  return (v >= 0 ? '+' : '−') + anNum(a, dec) + '%';
};

// ─── I mattoncini ───────────────────────────────────────────────────────────
function AnFormula({ children }) {
  return (
    <span style={{
      fontFamily: AN_MONO, fontSize:11.5, letterSpacing:'-0.01em', color:ADM.MUTED,
      background:ADM.NEUTRAL_SOFT, padding:'2px 6px', borderRadius:5, lineHeight:1.7,
    }}>{children}</span>
  );
}

function AnCard({ titolo, sotto, destra, children, piede }) {
  return (
    <AdmCard padding={0}>
      <div style={{padding:'15px 22px 13px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{titolo}</div>
          {sotto && <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>{sotto}</div>}
        </div>
        {destra}
      </div>
      {children}
      {piede && (
        <div style={{padding:'12px 22px', borderTop:`1px solid ${ADM.BORDER_SOFT}`, background:ADM.PANEL_SOFT, fontSize:12.6, color:ADM.MUTED, lineHeight:1.5}}>
          {piede}
        </div>
      )}
    </AdmCard>
  );
}

// Il riquadro standard di questa sezione: nome, valore, formula, e la lettura
// che dipende dal valore. `fasce` arriva già ordinata dal caso peggiore.
function AnMetrica({ label, valore, num, formula, fasce, sotto, grande }) {
  // Le fasce servono solo a scegliere il COLORE: il commento a parole non si
  // stampa. Un numero verde o rosso dice già da che parte sta, e la frase che
  // lo ripeteva a parole era rumore. `num` è il valore grezzo su cui si sceglie
  // la fascia — su una stringa già formattata il confronto non significherebbe
  // niente.
  const lettura = fasce ? parLettura(Number(num ?? 0), fasce) : null;
  const tono = lettura ? (ADM[lettura.tono] || ADM.TEXT) : ADM.TEXT;
  return (
    <div style={{padding: grande ? '16px 18px' : '13px 15px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:10, display:'flex', flexDirection:'column', gap:6}}>
      <div style={{fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
      <div style={{fontSize: grande ? 30 : 25, fontWeight:800, color:tono, letterSpacing:'-0.03em', lineHeight:1}}>{valore}</div>
      {formula && <div><AnFormula>{formula}</AnFormula></div>}
      {sotto && <div style={{fontSize:12.4, color:ADM.MUTED_SOFT, lineHeight:1.45}}>{sotto}</div>}
    </div>
  );
}

// Riga di una tabella-confronto: etichetta, barra, valore.
function AnBarra({ label, sotto, valore, quota, colore, destra, larghezzaLabel = 150 }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12}}>
      <div style={{width:larghezzaLabel, flexShrink:0, minWidth:0}}>
        <div style={{fontSize:13.4, fontWeight:600, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{label}</div>
        {sotto && <div style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>{sotto}</div>}
      </div>
      <div style={{flex:1, height:12, background:ADM.PANEL_SOFT, borderRadius:4, overflow:'hidden'}}>
        <div style={{width:`${Math.max(0, Math.min(100, quota))}%`, height:'100%', background:colore, borderRadius:4}}/>
      </div>
      <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, width:66, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valore}</span>
      {destra}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTRI · periodo e segmento
// ═══════════════════════════════════════════════════════════════════════════
const AN_PERIODI = [
  { id:'30', label:'30 giorni', giorni:30 },
  { id:'90', label:'90 giorni', giorni:90 },
  { id:'365', label:'12 mesi', giorni:365 },
];
const AN_FILTRI_VUOTI = { periodo:'365', piano:'tutti', regione:'tutte' };

// Applica il segmento a una lista di locali. Il periodo non filtra i locali:
// filtra le finestre temporali, e lo usano solo i blocchi che ne hanno una.
function anFiltra(locali, f) {
  if (!f) return locali;
  return locali.filter(l =>
    (f.piano === 'tutti' || l.piano === f.piano) &&
    (f.regione === 'tutte' || l.regione === f.regione)
  );
}

// `attivo` dice se piano e regione toccano la tab corrente; `periodoAttivo`
// se il periodo ha una serie da ri-finestrare. Sono due permessi distinti
// perché le tab li hanno distinti: il Generale non è per locale ma ha i
// grafici di andamento, Staff è per locale ma ha le finestre fisse.
function AnBarraFiltri({ filtri, onChange, attivo, periodoAttivo = false }) {
  const regioni = [...new Set(AN_LOCALI.map(l => l.regione))].sort();
  // Solo il guscio: la freccia e il menu li disegna AdmSelect, che apre il
  // popover di Hubble al posto della tendina del sistema operativo.
  const box = {
    padding:'6px 9px 6px 11px', borderRadius:8,
    fontSize:13, fontWeight:600,
  };
  const filtrati = anFiltra(AN_LOCALI, filtri).length;
  const tutti = AN_LOCALI.length;
  const attivoQualcosa = filtri.piano !== 'tutti' || filtri.regione !== 'tutte';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'9px 28px', flexWrap:'wrap',
      background: attivoQualcosa ? ADM.PINK_BG_SOFT : ADM.PANEL_SOFT,
      borderBottom:`1px solid ${ADM.BORDER}`,
    }}>
      <span style={{fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Filtra</span>
      <div style={{display:'flex', gap:4, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:8, padding:2}}>
        {AN_PERIODI.map(p => (
          <button key={p.id} onClick={()=>onChange({ ...filtri, periodo:p.id })} className="adm-btn" style={{
            padding:'5px 10px', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit',
            fontSize:12.6, fontWeight:700,
            background: filtri.periodo === p.id ? ADM.INK : 'transparent',
            color: filtri.periodo === p.id ? '#fff' : ADM.MUTED,
          }}>{p.label}</button>
        ))}
      </div>
      <AdmSelect value={filtri.piano} onChange={(v)=>onChange({ ...filtri, piano:v })}
        buttonStyle={box}
        options={[{value:'tutti', label:'Tutti i piani'}, ...PIANI.map(p => ({value:p.id, label:p.label}))]}/>
      <AdmSelect value={filtri.regione} onChange={(v)=>onChange({ ...filtri, regione:v })}
        buttonStyle={box}
        options={[{value:'tutte', label:'Tutte le regioni'}, ...regioni.map(r => ({value:r, label:r}))]}/>
      {attivoQualcosa && (
        <button onClick={()=>onChange({ ...AN_FILTRI_VUOTI, periodo: filtri.periodo })} className="adm-btn" style={{
          padding:'5px 10px', borderRadius:8, border:`1px solid ${ADM.PINK_SOFT}`, background:'#fff',
          cursor:'pointer', fontFamily:'inherit', fontSize:12.6, fontWeight:700, color:ADM.PINK_DARK,
        }}>Azzera</button>
      )}
      <div style={{flex:1}}/>
      <span style={{fontSize:12.4, color:ADM.MUTED}}>
        {/* La barra dichiara il proprio perimetro, pezzo per pezzo: un
            contatore che reagisce su una tab dove i numeri non si muovono è
            il modo più silenzioso di mentire. */}
        {attivo || periodoAttivo ? (
          <>
            {attivo
              ? <><strong style={{color:ADM.TEXT}}>{filtrati}</strong> local{filtrati === 1 ? 'e' : 'i'} su {tutti} in questa vista</>
              : <>Piano e regione non toccano questa tab: i numeri sono di piattaforma</>}
            {' · '}
            {periodoAttivo
              ? <>il periodo ri-finestra i grafici di andamento</>
              : <>le finestre temporali sono dichiarate sulle card</>}
          </>
        ) : (
          <>Il filtro non tocca questa tab: qui i dati non sono per locale</>
        )}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERALE · la riga di salute
// ═══════════════════════════════════════════════════════════════════════════
function AnSalute({ onNav }) {
  const S = AN_SALUTE;
  const voci = [
    {
      label:'Ricavo del mese', valore: anEur(S.mrr),
      formula:'abbonamenti + eccedenze del mese',
      fasce:[
        { fino:0.01, tono:'DANGER', testo:'Nessun incasso: c’è un problema di fatturazione, non di mercato.' },
        { tono:'TEXT', testo:`${anSegno(S.crescita)} sul mese prima. È la riga da cui scendono tutte le altre.` },
      ], valoreFascia: S.mrr,
    },
    {
      label:'Crescita mensile', valore: anSegno(S.crescita), sotto:`Da ${anEur(S.mrr / (1 + S.crescita / 100))} del mese prima`,
      formula:'(mese − mese prima) ÷ mese prima',
      fasce:[
        { fino:0, tono:'DANGER', testo:'Si sta restringendo: o si è perso un cliente grosso, o gli extra sono calati.' },
        { fino:3, tono:'WARN', testo:'Crescita piatta. A questo ritmo il piano di raccolta non regge.' },
        { fino:10, tono:'OK', testo:'Crescita sana per una rete di questa taglia.' },
        { tono:'OK', testo:'Crescita alta: verificare che non sia un mese con una tantum dentro.' },
      ], valoreFascia: S.crescita,
    },
    {
      label:'Ricavo netto ritenuto', valore: S.nrr != null ? anPct(S.nrr) : '—',
      formula:'ricavo di oggi dei clienti di 12 mesi fa ÷ ricavo di allora',
      fasce:[
        { fino:90, tono:'DANGER', testo:'Sotto 90%: la base installata si sgonfia da sola, ogni mese si riparte indietro.' },
        { fino:100, tono:'WARN', testo:'Sotto 100%: gli upgrade non coprono disdette e downgrade.' },
        { fino:115, tono:'OK', testo:'Sopra 100%: la base cresce anche senza clienti nuovi.' },
        { tono:'OK', testo:'Espansione forte: il listino a consumo sta facendo il suo lavoro.' },
      ], valoreFascia: S.nrr ?? 0,
    },
    {
      label:'Abbandono annuo', valore: anPct(S.churnAnnuo),
      sotto:`Su ${AN_CHURN.churned} disdette · forbice ${anPct(AN_CHURN.incertezza[0], 1)}–${anPct(AN_CHURN.incertezza[1], 1)}`,
      formula:'disdette ÷ base × 12 mesi',
      fasce:[
        { fino:5, tono:'OK', testo:`Basso, ma su ${AN_CHURN.churned} disdette osservate: la forbice vera è ${anPct(AN_CHURN.incertezza[0], 0)}–${anPct(AN_CHURN.incertezza[1], 0)}.` },
        { fino:15, tono:'WARN', testo:'In linea col settore, ma con pochi casi il numero balla.' },
        { tono:'DANGER', testo:'Alto: prima di spingere l’acquisizione va capito perché se ne vanno.' },
      ], valoreFascia: S.churnAnnuo,
    },
    {
      label:'Locali fermi', valore: anNum(S.aRischio), sotto:`${anPct(AN_CHURN.quotaARischio, 0)} della base installata`,
      formula:'attivi che non entrano da oltre 30 giorni',
      fasce:[
        { fino:1, tono:'OK', testo:'Nessuno fermo: tutti hanno lavorato nell’ultimo mese.' },
        { fino:4, tono:'WARN', testo:'Qualcuno si è fermato. Non è ancora churn, è la fila davanti alla porta.' },
        { tono:'DANGER', testo:`${anPct(AN_CHURN.quotaARischio, 0)} della base installata non lavora più: qui si perde il prossimo trimestre.` },
      ], valoreFascia: S.aRischio,
    },
    {
      label:'Attivati sopra soglia', valore: anPct(S.quotaSopraSoglia, 0), sotto:`${S.sopraSoglia} locali su ${S.attivi} attivi`,
      formula:`attivi oltre il ${PAR.SOGLIA_DIGITALE}% di ordini digitali ÷ attivi`,
      fasce:[
        { fino:30, tono:'DANGER', testo:'Due terzi della base non ha ancora acceso il prodotto: il valore promesso non lo stanno vedendo.' },
        { fino:60, tono:'WARN', testo:'Metà della base è sotto soglia: è lì che sta il margine non incassato.' },
        { tono:'OK', testo:'La maggioranza ha superato la soglia da cui il ritorno si vede.' },
      ], valoreFascia: S.quotaSopraSoglia,
    },
  ];
  return (
    <AnCard
      titolo="Stiamo andando bene?"
      sotto="Sei numeri, la formula di ciascuno, e il colore che dice da che parte stanno"
    >
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        {voci.map(v => (
          <AnMetrica key={v.label} label={v.label} valore={v.valore} num={v.valoreFascia} formula={v.formula} fasce={v.fasce} sotto={v.sotto}/>
        ))}
      </div>
    </AnCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERALE · definizioni e qualità del dato
// ═══════════════════════════════════════════════════════════════════════════
const AN_DEFINIZIONI = [
  { t:'Locale attivo', f:'stato = attivo', d:'Ha finito l’onboarding e ha lavorato negli ultimi 30 giorni. Non coincide con «pagante».' },
  { t:'Locale pagante', f:'attivo o inattivo, con piano ≠ Gratuito', d:'Chi ha un piano a canone. Un inattivo paga finché non disdice.' },
  { t:'Base installata', f:'attivi + inattivi', d:'I locali che hanno un piano. Chi è in onboarding non c’è ancora, chi ha disdetto non c’è più.' },
  { t:'Ordine', f:'transazione pesata', d:'Cassa e cameriere pesano 1, l’app 0,5. È l’unità del listino, non il numero di scontrini.' },
  { t:'Coperto', f:'ordini al tavolo × commensali', d:'Le persone servite in sala. L’asporto non occupa una sedia e non entra.' },
  { t:'Adozione digitale', f:'ordini da QR e app ÷ ordini totali', d:'La quota di ordini che il cliente fa da solo. È la variabile su cui gira tutta la tab Valore.' },
  { t:'Soglia', f:`adozione ≥ ${PAR.SOGLIA_DIGITALE}%`, d:'Il punto da cui il ritorno per il locale si vede nei numeri. Sotto, non si vede.' },
  { t:'MRR', f:'canoni + eccedenze del mese', d:'Ricavo ricorrente. Le eccedenze non sono ricorrenti in senso stretto ma si ripetono ogni mese sopra soglia.' },
];

function AnDefinizioni() {
  const Q = AN_QUALITA;
  const [aperto, setAperto] = useStateDash(false);
  return (
    <AnCard
      titolo="Definizioni e qualità del dato"
      sotto="Cosa vuol dire ogni parola, e quanto ci si può fidare dell’anagrafica su cui poggia tutto"
      destra={
        <button onClick={()=>setAperto(a => !a)} className="adm-btn" style={{
          padding:'6px 12px', borderRadius:8, border:`1px solid ${ADM.BORDER}`, background:'#fff',
          cursor:'pointer', fontFamily:'inherit', fontSize:12.8, fontWeight:600, color:ADM.TEXT,
        }}>{aperto ? 'Nascondi definizioni' : 'Mostra definizioni'}</button>
      }
      piede={<><strong style={{color:ADM.TEXT}}>{Q.puliti} locali su {Q.su}</strong> non hanno nessuna segnalazione aperta.
        Le altre righe non bloccano niente, ma spiegano perché certe analisi escludono certi numeri.</>}
    >
      <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:11}}>
        {Q.controlli.map(c => {
          const quota = c.su ? (c.n / c.su) * 100 : 0;
          const tono = quota === 0 ? ADM.OK : quota < 15 ? ADM.WARN : ADM.DANGER;
          return (
            <div key={c.k} style={{display:'flex', gap:12, alignItems:'flex-start'}}>
              <span style={{width:9, height:9, borderRadius:'50%', background:tono, marginTop:5, flexShrink:0}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13.6, color:ADM.TEXT}}>
                  <strong style={{fontWeight:700}}>{c.n} su {c.su}</strong> · {c.label}
                </div>
                <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>
                  <AnFormula>{c.regola}</AnFormula> {c.effetto}
                  {c.elenco.length > 0 && <span style={{color:ADM.MUTED_SOFT}}> · {c.elenco.slice(0, 3).join(', ')}{c.n > 3 ? ` e altri ${c.n - 3}` : ''}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {aperto && (
        <div style={{padding:'4px 22px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 22px', borderTop:`1px solid ${ADM.BORDER_SOFT}`, paddingTop:16}}>
          {AN_DEFINIZIONI.map(d => (
            <div key={d.t} style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.5}}>
              <strong style={{color:ADM.TEXT}}>{d.t}</strong> <AnFormula>{d.f}</AnFormula>
              <div style={{marginTop:3}}>{d.d}</div>
            </div>
          ))}
        </div>
      )}
    </AnCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCALI · attivazione
// ═══════════════════════════════════════════════════════════════════════════
function AnAttivazione({ filtri }) {
  const ids = new Set(anFiltra(AN_LOCALI, filtri).map(l => l.id));
  const att = AN_ATTIVAZIONE.filter(a => ids.has(a.id));
  const tappe = anTappe(att);
  const curva = anCurva(att);
  const perDot = anAttPerDotazione(att);
  const soglia = tappe.find(t => t.k === 'soglia');
  const W = 700, H = 170, padX = 44, padY = 22;
  const xFor = (i) => padX + (i / (curva.length - 1)) * (W - padX * 2);
  const yFor = (v) => padY + (1 - v / 100) * (H - padY * 2);
  return (
    <AnCard
      titolo="Quanto ci mette un locale ad arrivare alla soglia"
      sotto={`Dall’iscrizione al ${PAR.SOGLIA_DIGITALE}% di ordini digitali · è l’anello fra onboarding, valore e abbandono`}
      piede={<>Chi non è ancora arrivato alla soglia <strong style={{color:ADM.TEXT}}>non ha una data</strong> e resta fuori dalla mediana:
        sono {soglia.mancanti} locali su {soglia.n + soglia.mancanti}. Contarli come «ci hanno messo tanto» abbasserebbe il numero e nasconderebbe il problema.</>}
    >
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        {tappe.map(t => (
          <AnMetrica key={t.k} label={t.label} num={t.mediana}
            valore={t.n ? `${anNum(t.mediana)} giorni` : '—'}
            formula={`mediana dei giorni dall’iscrizione · ${t.n} locali`}
            fasce={t.k === 'soglia' ? [
              { fino:45, tono:'OK', testo:'Meno di sei settimane: l’onboarding sta funzionando da solo.' },
              { fino:90, tono:'WARN', testo:'Fra sei settimane e tre mesi: c’è spazio per accompagnarli meglio.' },
              { tono:'DANGER', testo:'Oltre tre mesi: il locale arriva al valore quando ha già deciso cosa pensa di noi.' },
            ] : [
              { fino:10, tono:'OK', testo:'Il primo cliente arriva subito: i QR sono sui tavoli.' },
              { fino:25, tono:'WARN', testo:'Ci vuole qualche settimana: i QR ci sono ma nessuno li nomina.' },
              { tono:'DANGER', testo:'Troppo tempo: probabilmente i QR non sono ancora stati messi.' },
            ]}
            sotto={`${anPct(t.entro30, 0)} entro 30 giorni · ${anPct(t.entro90, 0)} entro 90`}
          />
        ))}
      </div>

      <div style={{padding:'0 22px 6px'}}>
        <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6}}>
          Quota che ha superato la soglia entro N giorni
        </div>
        <svg viewBox={`0 0 ${W} ${H + 14}`} style={{width:'100%', height:190}}>
          {[0, 25, 50, 75, 100].map(v => (
            <g key={v}>
              <line x1={padX} x2={W - padX} y1={yFor(v)} y2={yFor(v)} stroke={ADM.BORDER_SOFT} strokeDasharray="3 4"/>
              <text x={padX - 8} y={yFor(v) + 4} textAnchor="end" fontSize="10.5" fill={ADM.MUTED_SOFT} fontWeight="600">{v}%</text>
            </g>
          ))}
          <path d={curva.map((c, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(c.quota)}`).join(' ')}
            fill="none" stroke={ADM.PINK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          {curva.map((c, i) => (
            <g key={i}>
              <circle cx={xFor(i)} cy={yFor(c.quota)} r="3.8" fill="#fff" stroke={ADM.PINK} strokeWidth="2"/>
              <text x={xFor(i)} y={H + 4} textAnchor="middle" fontSize="11" fill={ADM.MUTED} fontWeight="600">{c.giorni}g</text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{padding:'8px 22px 18px'}}>
        <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>
          Per come è collegata la cucina
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:9}}>
          {perDot.filter(d => d.n > 0).map(d => (
            <AnBarra key={d.k} label={d.label} sotto={`${d.n} locali · ${d.arrivati} arrivati alla soglia`}
              quota={d.quotaArrivati} colore={ADM[d.tono]}
              valore={d.arrivati ? `${anNum(d.mediana)}g` : '—'}
              destra={<span style={{fontSize:12.4, color:ADM.MUTED, width:96, textAlign:'right'}}>{anPct(d.quotaArrivati, 0)} ci arriva</span>}/>
          ))}
        </div>
      </div>
    </AnCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCALI · abbandono, rimesso sul registro
// ═══════════════════════════════════════════════════════════════════════════
function AnChurn() {
  const C = AN_CHURN;
  return (
    <AnCard
      titolo="Abbandono, contato sul registro"
      sotto="Quello che è successo davvero, con l’incertezza che ha addosso"
      piede={<>Con {C.churned} disdette su {C.base} locali, il tasso annuo è un numero che <strong style={{color:ADM.TEXT}}>non si può ancora dichiarare</strong>:
        l’intervallo al 90% va da {anPct(C.incertezza[0], 1)} a {anPct(C.incertezza[1], 1)}. Serve una base più grande, non un calcolo più fine.</>}
    >
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <AnMetrica label="Disdette" valore={anNum(C.churned)} num={C.churned}
          formula="locali che hanno chiuso il contratto"
          fasce={[
            { fino:1, tono:'OK', testo:'Nessuno se n’è andato da quando esiste la rete.' },
            { fino:5, tono:'WARN', testo:'Pochi casi: si guardano uno per uno, non con una percentuale.' },
            { tono:'DANGER', testo:'Abbastanza da fare una statistica, e da doverla spiegare.' },
          ]}/>
        <AnMetrica label="Tasso annuo" valore={anPct(C.tassoAnnuo)} num={C.tassoAnnuo}
          sotto={`Forbice al 90%: ${anPct(C.incertezza[0], 1)} – ${anPct(C.incertezza[1], 1)}`}
          formula="disdette ÷ base × 12"
          fasce={[
            { fino:5, tono:'OK', testo:'Sotto la media di settore, ma su pochissimi eventi.' },
            { fino:15, tono:'WARN', testo:'In linea col food service.' },
            { tono:'DANGER', testo:'Sopra la media: l’acquisizione non basta a compensare.' },
          ]}/>
        <AnMetrica label="Ricavo perso" valore={anEur(C.mrrPerso)} num={C.mrrPerso}
          sotto={`${anPct(C.churnRicavoAnnuo)} del ricavo della base installata`}
          formula="somma dei canoni delle disdette"
          fasce={[
            { fino:1, tono:'OK', testo:'Chi se n’è andato non pagava: perdita di ricavo nulla.' },
            { tono:'WARN', testo:`È ${anPct(C.churnRicavoAnnuo)} del ricavo della base installata.` },
          ]}/>
        <AnMetrica label="Locali fermi" valore={anNum(C.aRischio)} num={C.aRischio}
          sotto={`${anPct(C.quotaARischio, 0)} della base installata`}
          formula="attivi senza accessi da oltre 30 giorni"
          fasce={[
            { fino:1, tono:'OK', testo:'Nessuno fermo.' },
            { fino:4, tono:'WARN', testo:'Da chiamare prima che diventino disdette.' },
            { tono:'DANGER', testo:`${anPct(C.quotaARischio, 0)} della base installata: è il churn del prossimo trimestre, se nessuno interviene.` },
          ]}/>
      </div>

      <div style={{padding:'0 22px 18px'}}>
        <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>
          Chi se n’è andato e chi si è fermato
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1.6fr 0.9fr 0.9fr 1fr 1fr', columnGap:14, padding:'0 0 8px', fontSize:11.6, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div>Locale</div><div style={{textAlign:'right'}}>Piano</div>
          <div style={{textAlign:'right'}}>Canone</div><div style={{textAlign:'right'}}>Adozione</div><div style={{textAlign:'right'}}>Ultimo accesso</div>
        </div>
        {C.elenco.map((l, i) => (
          <div key={l.id} style={{display:'grid', gridTemplateColumns:'1.6fr 0.9fr 0.9fr 1fr 1fr', columnGap:14, padding:'9px 0', alignItems:'center', borderBottom: i === C.elenco.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13.4, fontWeight:600, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{l.nome}</div>
              <div style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>{l.citta} · {l.stato === 'churned' ? 'ha disdetto' : 'fermo'}</div>
            </div>
            <div style={{fontSize:12.8, color:ADM.MUTED, textAlign:'right'}}>{(PIANI.find(p => p.id === l.piano) || {}).label}</div>
            <div style={{fontSize:13, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anEur(l.mrr)}</div>
            <div style={{fontSize:13, color: l.adozione < PAR.SOGLIA_DIGITALE ? ADM.WARN : ADM.OK, textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{anPct(l.adozione)}</div>
            <div style={{fontSize:13, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anNum(l.giorniInattivo)} giorni fa</div>
          </div>
        ))}
      </div>
    </AnCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCALI · acquisizione e margine di contribuzione
// ═══════════════════════════════════════════════════════════════════════════
function AnAcquisizione({ filtri }) {
  const locali = anFiltra(AN_LOCALI, filtri);
  const canali = anAcquisizione(locali).filter(c => c.n > 0);
  const maxN = Math.max(...canali.map(c => c.n), 1);
  return (
    <AnCard
      titolo="Da dove arrivano i locali"
      sotto="Ogni canale ha il suo link tracciato · il passaparola arriva dal codice invito, il contatto diretto lo registra chi ci va"
      piede={<>Il <strong style={{color:ADM.TEXT}}>rientro</strong> è quanti mesi di margine sul canone servono a ripagare il costo di acquisizione:
        sotto i 12 mesi il canale si autofinanzia entro l’anno, sopra i 24 si sta comprando crescita col capitale.</>}
    >
      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1.2fr 0.8fr 0.9fr 0.9fr 0.9fr', columnGap:14, padding:'11px 22px', fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Canale</div><div>Quanti ne porta</div>
        <div style={{textAlign:'right'}}>Costo</div><div style={{textAlign:'right'}}>Canone medio</div>
        <div style={{textAlign:'right'}}>Rientro</div><div style={{textAlign:'right'}}>Ancora attivi</div>
      </div>
      {canali.map((c, i) => {
        const paybackTono = c.payback === 0 ? ADM.OK : c.payback == null ? ADM.MUTED_LIGHT
          : c.payback <= 12 ? ADM.OK : c.payback <= 24 ? ADM.WARN : ADM.DANGER;
        return (
          <div key={c.id} style={{display:'grid', gridTemplateColumns:'1.5fr 1.2fr 0.8fr 0.9fr 0.9fr 0.9fr', columnGap:14, padding:'12px 22px', alignItems:'center', borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13.8, fontWeight:700, color:ADM.TEXT}}>{c.label}</div>
              <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.nota}</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <div style={{flex:1, height:10, background:ADM.PANEL_SOFT, borderRadius:3, overflow:'hidden'}}>
                <div style={{width:`${(c.n / maxN) * 100}%`, height:'100%', background:ADM.INK, borderRadius:3}}/>
              </div>
              <span style={{fontSize:12.8, color:ADM.TEXT, fontWeight:700, width:64, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{c.n} · {anPct(c.quota, 0)}</span>
            </div>
            <div style={{fontSize:13, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{c.costo === 0 ? 'gratis' : anEur(c.costo)}</div>
            <div style={{fontSize:13, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anEur(c.mrrMedio, 2)}</div>
            <div style={{fontSize:13.6, fontWeight:800, color:paybackTono, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
              {c.payback === 0 ? 'subito' : c.payback == null ? '—' : `${anNum(c.payback, 0)} mesi`}
            </div>
            <div style={{fontSize:13, color: c.tenuta >= 80 ? ADM.OK : c.tenuta >= 60 ? ADM.WARN : ADM.DANGER, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anPct(c.tenuta, 0)}</div>
          </div>
        );
      })}
    </AnCard>
  );
}

function AnContribuzione({ filtri }) {
  const locali = anFiltra(AN_LOCALI, filtri);
  const C = anContribuzione(locali);
  const perPiano = C.perPiano.filter(p => p.n > 0);
  const maxAbs = Math.max(...perPiano.map(p => Math.abs(p.margineMedio)), 1);
  return (
    <AnCard
      titolo="Quanto resta di un locale"
      sotto="Il canone è ricavo, non margine: sopra ci vanno l’assistenza che genera e l’infrastruttura che occupa"
      destra={
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:24, fontWeight:800, color: C.totale >= 0 ? ADM.OK : ADM.DANGER, letterSpacing:'-0.03em', lineHeight:1}}>{anEur(C.totale)}</div>
          <div style={{fontSize:11.8, color:ADM.MUTED}}>margine al mese, {locali.length} locali</div>
        </div>
      }
      piede={<>
        <AnFormula>canone − assistenza − infrastruttura</AnFormula>
        <div style={{marginTop:8, lineHeight:1.55}}>
          <strong style={{color:ADM.TEXT}}>Assistenza</strong>: {PAR.MINUTI_TICKET} minuti a ticket × {anEur(PAR.COSTO_ORA_SUPPORTO, 2)}/h = {anEur(PAR.COSTO_TICKET, 2)}.
          I minuti sono un’<strong style={{color:ADM.WARN}}>ipotesi</strong>: il tempo di lavorazione di un ticket oggi non è cronometrato, e finché non lo è questa riga resta la più debole della pagina.
          <br/>
          <strong style={{color:ADM.TEXT}}>Infrastruttura</strong>: {anEur(PAR.INFRA_PER_LOCALE, 2)} di compute e database per locale attivo — un locale tiene sessioni aperte anche a sala vuota —
          più {anEur(PAR.COSTO_TRASMISSIONE, 3)} per ogni trasmissione fiscale, che facciamo solo sui pagamenti che passano da noi. Prezzi unitari di listino dei fornitori.
          Immagini dei menu, mappe e notifiche seguono gli utenti app: non sono attribuibili a un locale e restano costi di piattaforma.
          <br/>
          <strong style={{color:ADM.TEXT}}>Le commissioni Stripe non ci sono</strong>: sull’abbonamento sono ribaltate al locale, quindi per noi non sono un costo.
        </div>
      </>}
    >
      <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:11}}>
        {perPiano.map(p => (
          <AnBarra key={p.id} label={p.label} sotto={`${p.n} locali · costo medio ${anEur(p.costoMedio, 2)}`}
            quota={Math.abs(p.margineMedio) / maxAbs * 100}
            colore={p.margineMedio >= 0 ? ADM.OK : ADM.DANGER}
            valore={anEur(p.margineMedio, 2)}
            destra={<span style={{fontSize:12.4, color: p.inPerdita ? ADM.DANGER : ADM.MUTED, width:108, textAlign:'right'}}>
              {p.inPerdita ? `${p.inPerdita} in perdita` : 'tutti in attivo'}
            </span>}/>
        ))}
      </div>
    </AnCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAFF · dispositivi, ruoli, POS
// ═══════════════════════════════════════════════════════════════════════════
function AnDispositivi({ filtri }) {
  const locali = anFiltra(AN_LOCALI, filtri);
  const dot = anPerDotazione(locali).filter(d => d.n > 0);
  const ruoli = anPerRuolo(locali);
  const niente = dot.find(d => d.k === 'niente');
  const monitor = dot.find(d => d.k === 'monitor');
  return (
    <>
      <AnCard
        titolo="Come arriva la comanda in cucina"
        sotto="Tre modi, tre livelli di digitalizzazione · è la cosa che spiega quasi tutto il resto"
        piede={<>La colonna <strong style={{color:ADM.TEXT}}>attesa cucina</strong> è vuota per chi stampa e per chi non ha collegato niente, e non è un buco nei dati:
          su carta non esiste una spunta di presa in carico, e senza collegamento la comanda in byup non passa proprio. Chi stampa non sa cosa succede
          fra il tavolo e la cucina — e non lo sappiamo nemmeno noi. Sul resto: il verso della freccia non è dimostrato, se sia il monitor a portare
          adozione o il contrario.</>}
      >
        <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 0.85fr 0.95fr 0.95fr 0.9fr', columnGap:14, padding:'11px 22px', fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div>Dotazione</div><div>Quanti</div>
          <div style={{textAlign:'right'}}>Adozione</div><div style={{textAlign:'right'}}>Attesa cucina</div>
          <div style={{textAlign:'right'}}>Comande rifatte</div><div style={{textAlign:'right'}}>Fermi</div>
        </div>
        {dot.map((d, i) => (
          <div key={d.k} style={{
            display:'grid', gridTemplateColumns:'1.6fr 1fr 0.85fr 0.95fr 0.95fr 0.9fr', columnGap:14,
            padding:'13px 22px', alignItems:'center',
            borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            background: d.k === 'niente' ? ADM.DANGER_SOFT + '55' : 'transparent',
          }}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13.8, fontWeight:700, color:ADM.TEXT, display:'flex', alignItems:'center', gap:7}}>
                <span style={{width:8, height:8, borderRadius:2, background:ADM[d.tono], flexShrink:0}}/>{d.label}
              </div>
              <div style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>{d.desc}</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <div style={{flex:1, height:10, background:ADM.PANEL_SOFT, borderRadius:3, overflow:'hidden'}}>
                <div style={{width:`${d.quota}%`, height:'100%', background:ADM[d.tono], borderRadius:3}}/>
              </div>
              <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, width:64, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{d.n} · {anPct(d.quota, 0)}</span>
            </div>
            <div style={{fontSize:13.6, fontWeight:800, color: d.adozione >= PAR.SOGLIA_DIGITALE ? ADM.OK : ADM.WARN, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anPct(d.adozione)}</div>
            <div style={{fontSize:13, textAlign:'right', fontVariantNumeric:'tabular-nums', color: d.minutiInCucina == null ? ADM.MUTED_LIGHT : ADM.TEXT}}>
              {d.minutiInCucina == null ? '—' : `${anNum(d.minutiInCucina, 1)}′`}
            </div>
            <div style={{fontSize:13, color: d.comandeRifatte > 2.5 ? ADM.DANGER : ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anNum(d.comandeRifatte, 1)}%</div>
            <div style={{fontSize:13, fontWeight:700, color: d.quotaFermi > 20 ? ADM.DANGER : d.quotaFermi > 0 ? ADM.WARN : ADM.OK, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anPct(d.quotaFermi, 0)}</div>
          </div>
        ))}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER_SOFT}`, display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
          <AnMetrica label="Chi non ha collegato la cucina" valore={niente ? anPct(niente.quota, 0) : '—'} num={niente ? niente.quota : 0}
            formula="locali senza monitor né stampa ÷ base installata"
            fasce={[
              { fino:10, tono:'OK', testo:'Quasi tutti hanno acceso il prodotto oltre la cassa.' },
              { fino:30, tono:'WARN', testo:'Una fetta usa byup solo per incassare: è lì che manca il valore.' },
              { tono:'DANGER', testo:'Un terzo o più non ha mai acceso il prodotto: sono clienti che pagano una cassa.' },
            ]}
            sotto={niente ? `Adozione mediana ${anPct(niente.adozione)} contro ${anPct(monitor ? monitor.adozione : 0)} di chi ha il monitor` : null}/>
          {/* Il conteggio «stampa» nel sottotesto viene da `dot`, come
              `niente`: sommare il precalcolo globale AN_PER_DOTAZIONE a un
              gruppo filtrato mescolava due popolazioni appena il filtro si
              accendeva. */}
          <AnMetrica label="Attesa cucina · solo col monitor" valore={monitor && monitor.minutiInCucina != null ? `${anNum(monitor.minutiInCucina, 1)}′` : '—'}
            num={monitor && monitor.minutiInCucina != null ? monitor.minutiInCucina : 0}
            formula="spunta di presa in carico − invio comanda"
            fasce={[
              { fino:2, tono:'OK' }, { fino:4, tono:'WARN' }, { tono:'DANGER' },
            ]}
            sotto={`Sugli altri ${(niente ? niente.n : 0) + (dot.find(d => d.k === 'stampa') || { n:0 }).n} locali il dato non esiste: su carta non c’è una spunta, e senza collegamento non c’è nemmeno la comanda`}/>
          <AnMetrica label="Byup Staff attivi" valore={anNum(locali.reduce((s, l) => s + l.posAttivi, 0))} num={locali.reduce((s, l) => s + l.posAttivi, 0)}
            formula="dispositivi POS con almeno un incasso nel mese"
            fasce={[
              { fino:1, tono:'DANGER', testo:'Nessun dispositivo in mano ai camerieri: si incassa solo alla cassa fissa.' },
              { tono:'OK', testo:`Mediana ${anNum(parMediana(locali.map(l => l.posAttivi)), 0)} per locale · ${anPct(parMediana(locali.map(l => l.quotaIncassoPos)), 0)} degli incassi passa da lì.` },
            ]}
            sotto={`Mediana ${anNum(parMediana(locali.map(l => l.posAttivi)), 0)} per locale · ${anPct(parMediana(locali.map(l => l.quotaIncassoPos)), 0)} degli incassi ci passa · ${locali.filter(l => l.posAttivi === 0).length} locali senza nessun dispositivo`}/>
        </div>
      </AnCard>

      <AnCard
        titolo="Chi è configurato, e chi manca"
        sotto="Titolare, Cameriere e Cassa sono i ruoli di sistema, tutto il resto è personalizzato · monitor e stampanti non sono ruoli: sono dispositivi, e stanno nella dotazione"
        piede={<>Il confronto fra «con» e «senza» è descrittivo: chi si costruisce ruoli personalizzati è probabilmente anche il locale
          più organizzato. Serve a decidere <strong style={{color:ADM.TEXT}}>dove intervenire</strong>, non a dimostrare un effetto.</>}
      >
        <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:12}}>
          {ruoli.map(r => (
            <div key={r.id} style={{display:'flex', alignItems:'center', gap:14}}>
              <div style={{width:150, flexShrink:0}}>
                <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>{r.label}</div>
                <div style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>{r.serve}</div>
              </div>
              <div style={{flex:1, height:12, background:ADM.PANEL_SOFT, borderRadius:4, overflow:'hidden'}}>
                <div style={{width:`${r.quota}%`, height:'100%', background:ADM.INK, borderRadius:4}}/>
              </div>
              <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, width:82, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
                {r.n} · {anPct(r.quota, 0)}
              </span>
              <span style={{fontSize:12.4, color:ADM.MUTED, width:172, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
                adozione {anPct(r.adozioneCon)} {r.adozioneSenza != null && <span style={{color:ADM.MUTED_SOFT}}>· senza {anPct(r.adozioneSenza)}</span>}
              </span>
            </div>
          ))}
        </div>
      </AnCard>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTENTI APP · quanti restano
// ═══════════════════════════════════════════════════════════════════════════
function AnRitenzione() {
  const gruppi = AN_RITENZIONE.filter(g => g.n > 0);
  const S = AN_SECONDO_ORDINE;
  const cella = (v) => {
    if (v == null) return { bg:'transparent', fg:ADM.MUTED_LIGHT, txt:'—' };
    const t = v >= 45 ? ADM.OK : v >= 25 ? ADM.WARN : ADM.DANGER;
    return { bg:`${t}${v >= 45 ? '22' : '18'}`, fg:t, txt:`${v}%` };
  };
  return (
    <AnCard
      titolo="Quanti restano, per mese di iscrizione"
      sotto="DAU e MAU dicono quanto usano l’app quelli rimasti · questa dice quanti restano, ed è l’altra metà"
      piede={<>I tre traguardi sono <strong style={{color:ADM.TEXT}}>cumulativi</strong>: chi è tornato almeno una volta entro quel giorno.
        Per un’app di ristorazione è l’unica lettura sensata — nessuno esce a cena tutti i giorni. Le celle vuote non sono zeri:
        sono mesi troppo recenti perché quel traguardo sia già passato, e riempirle di zeri è il modo più comune di far sembrare la ritenzione peggiore di com’è.</>}
    >
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <AnMetrica label="Tornano entro un giorno" valore={gruppi.length ? `${gruppi[0].d1 ?? '—'}%` : '—'} num={gruppi.length ? (gruppi[0].d1 ?? 0) : 0}
          formula="chi riapre entro 24 ore ÷ iscritti del mese"
          fasce={[
            { fino:20, tono:'DANGER', testo:'Scaricano e spariscono: il primo ordine non è diventato un’abitudine.' },
            { fino:40, tono:'WARN', testo:'Normale per un’app di servizio, dove si torna quando si esce a cena.' },
            { tono:'OK', testo:'Alta per la categoria: l’app viene usata anche fuori dal momento dell’ordine.' },
          ]}/>
        <AnMetrica label="Fanno un secondo ordine" valore={anPct(S.quotaConDue, 0)} num={S.quotaConDue}
          formula="iscritti con un secondo ordine ÷ iscritti"
          fasce={[
            { fino:25, tono:'DANGER', testo:'Tre su quattro provano una volta e basta: il valore non si ripete.' },
            { fino:50, tono:'WARN', testo:'Meno di metà torna a ordinare: è il numero da spostare per far crescere la rete senza comprare utenti.' },
            { tono:'OK', testo:'La maggioranza torna: l’app è entrata nelle abitudini.' },
          ]}
          sotto={`Mediana ${anNum(S.mediana)} giorni fra primo e secondo ordine · ${anPct(S.entro30, 0)} entro il mese`}/>
        <AnMetrica label="Mesi osservabili" valore={anNum(gruppi.length)} num={gruppi.length}
          formula="mesi con almeno un’iscrizione · iscritti riportati in scala sulla base dichiarata"
          fasce={[{ tono:'TEXT', testo:'Ogni riga è chi si è iscritto in quel mese, seguito nel tempo. Le righe in alto sono le più informative: hanno avuto il tempo di perdere gente.' }]}/>
      </div>

      <div style={{padding:'0 22px 18px'}}>
        <div style={{display:'grid', gridTemplateColumns:'0.9fr 0.7fr repeat(3, 1fr)', columnGap:10, padding:'0 0 8px', fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div>Iscritti a</div><div style={{textAlign:'right'}}>Quanti</div>
          <div style={{textAlign:'center'}}>Entro 1 giorno</div><div style={{textAlign:'center'}}>Entro 7 giorni</div><div style={{textAlign:'center'}}>Entro 30 giorni</div>
        </div>
        {gruppi.map(c => (
          <div key={c.nome} style={{display:'grid', gridTemplateColumns:'0.9fr 0.7fr repeat(3, 1fr)', columnGap:10, padding:'6px 0', alignItems:'center'}}>
            <div style={{fontSize:13, fontWeight:600, color:ADM.TEXT}}>{c.nome}</div>
            <div style={{fontSize:12.8, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anNum(c.n)}</div>
            {[c.d1, c.d7, c.d30].map((v, i) => {
              const s = cella(v);
              return (
                <div key={i} style={{background:s.bg, color:s.fg, textAlign:'center', padding:'5px 0', borderRadius:5, fontSize:12.8, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{s.txt}</div>
              );
            })}
          </div>
        ))}
      </div>
    </AnCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTENTI APP · da dove arrivano: inviti e webapp
// ═══════════════════════════════════════════════════════════════════════════
function AnCrescita() {
  const I = AN_INVITI;
  const W = AN_WEBAPP;
  const maxSerie = Math.max(...I.serie.map(s => s.condivisi), 1);
  return (
    <>
      <AnCard
        titolo="Inviti mandati e riscattati"
        sotto="Chi apre la condivisione, chi riscatta il codice · l’unico canale di acquisizione che non costa"
        piede={<>Si conta il <strong style={{color:ADM.TEXT}}>click sul pulsante di condivisione</strong>, non l’invio: se il messaggio sia poi partito non lo sappiamo,
          ma chi arriva a quel punto ha già scelto il destinatario. Contare i codici generati sarebbe un numero più grande e più falso — un codice si crea
          anche solo aprendo la schermata. I {anNum(I.versoLocale)} locali arrivati così valgono {anEur(I.cacRisparmiato)} di campagne non spese.</>}
      >
        <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
          <AnMetrica label="Condivisioni avviate" valore={anNum(I.condivisi)} num={I.condivisi}
            formula="click sul pulsante che apre WhatsApp o il pannello di condivisione, 12 mesi"
            sotto={`${anPct(I.origini[0].condivisi / I.condivisi * 100, 0)} dai locali, il resto dagli utenti`}/>
          <AnMetrica label="Riscattati" valore={anNum(I.riscattati)} num={I.tassoRiscatto}
            sotto={`${anPct(I.tassoRiscatto, 0)} degli inviti condivisi`}
            formula="riscatti ÷ condivisioni avviate"
            fasce={[
              { fino:10, tono:'DANGER', testo:'Quasi nessuno li usa: il codice gira ma non convince.' },
              { fino:25, tono:'WARN', testo:`${anPct(I.tassoRiscatto, 0)} di riscatto. Normale per un codice stampato, basso per uno mandato a mano.` },
              { tono:'OK', testo:`${anPct(I.tassoRiscatto, 0)} di riscatto: chi riceve l’invito lo usa.` },
            ]}/>
          <AnMetrica label="Diventati utenti" valore={anNum(I.versoUtente)} num={I.versoUtente}
            formula="riscatti da parte di una persona"
            fasce={[{ tono:'TEXT', testo:'Clienti nuovi arrivati senza spendere in campagne.' }]}/>
          <AnMetrica label="Diventati locali" valore={anNum(I.versoLocale)} num={I.versoLocale}
            sotto={`${anPct(I.quotaVersoLocale, 0)} dei riscatti`}
            formula="riscatti da parte di un ristoratore"
            fasce={[
              { fino:1, tono:'WARN', testo:'Nessun ristoratore ne ha portato un altro: il passaparola fra locali non è partito.' },
              { tono:'OK', testo:`${anPct(I.quotaVersoLocale, 0)} dei riscatti è un locale nuovo, e arriva già convinto.` },
            ]}/>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1.2fr 0.9fr 1.1fr 1.1fr', columnGap:14, padding:'11px 22px', fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderTop:`1px solid ${ADM.BORDER}`, borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div>Chi lo manda</div><div>Condivisioni</div>
          <div style={{textAlign:'right'}}>Riscattati</div><div style={{textAlign:'right'}}>→ nuovi utenti</div><div style={{textAlign:'right'}}>→ nuovi locali</div>
        </div>
        {I.origini.map((o, i) => (
          <div key={o.id} style={{display:'grid', gridTemplateColumns:'1.4fr 1.2fr 0.9fr 1.1fr 1.1fr', columnGap:14, padding:'13px 22px', alignItems:'center', borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13.8, fontWeight:700, color:ADM.TEXT}}>{o.label}</div>
              <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{o.desc}</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <div style={{flex:1, height:10, background:ADM.PANEL_SOFT, borderRadius:3, overflow:'hidden'}}>
                <div style={{width:`${(o.condivisi / I.condivisi) * 100}%`, height:'100%', background:ADM.INK, borderRadius:3}}/>
              </div>
              <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, width:44, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anNum(o.condivisi)}</span>
            </div>
            <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
              {anNum(o.riscattati)} <span style={{fontSize:11.6, color:ADM.MUTED, fontWeight:600}}>· {anPct(o.tassoRiscatto, 0)}</span>
            </div>
            <div style={{fontSize:13.4, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anNum(o.riscattatiUtente)}</div>
            <div style={{fontSize:13.4, fontWeight:800, color: o.riscattatiLocale > 0 ? ADM.OK : ADM.MUTED_LIGHT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{anNum(o.riscattatiLocale)}</div>
          </div>
        ))}

        <div style={{padding:'16px 22px 18px', borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Mese per mese · condivisioni e riscatti</div>
          <div style={{display:'flex', alignItems:'flex-end', gap:6, height:96}}>
            {I.serie.map(m => (
              <div key={m.t} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5}}>
                <div style={{width:'100%', height:`${(m.condivisi / maxSerie) * 100}%`, background:ADM.NEUTRAL_SOFT, borderRadius:'4px 4px 0 0', position:'relative', minHeight:4}}>
                  <div style={{position:'absolute', left:0, right:0, bottom:0, height:`${m.condivisi ? (m.riscattati / m.condivisi) * 100 : 0}%`, background:ADM.OK, borderRadius:'0 0 0 0'}}/>
                </div>
                <span style={{fontSize:10.5, color:ADM.MUTED_SOFT, fontWeight:600}}>{m.nome}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:16, marginTop:10, fontSize:12.4, color:ADM.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:10, height:10, borderRadius:2, background:ADM.NEUTRAL_SOFT, border:`1px solid ${ADM.BORDER}`}}/>condivisioni avviate</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:10, height:10, borderRadius:2, background:ADM.OK}}/>riscattati</span>
          </div>
        </div>
      </AnCard>

      <AnCard
        titolo="Dalla webapp all’app"
        sotto="Chi ordina col QR senza scaricare niente, e poi scarica · è il ponte fra i due mondi"
        piede={<>Il collegamento non è una stima: dopo l’ordine la webapp dà un <strong style={{color:ADM.TEXT}}>codice</strong>, e l’app alla prima apertura chiede
          se hai già ordinato e se ce l’hai. Chi lo inserisce si attacca al suo ordine, e la conversione si conta una per una. Chi scarica senza inserirlo
          finisce fra gli altri iscritti: il numero qui è quindi un <strong style={{color:ADM.TEXT}}>minimo</strong>, non una media.</>}
      >
        <div style={{padding:'20px 22px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
          {[
            { l:'Sessioni guest', v: anNum(W.sessioni), s:'ultimi 30 giorni', c: ADM.MUTED },
            { l:'Ordinano', v: anNum(W.ordini), s:`${anPct(W.conversioneOrdine, 0)} delle sessioni`, c: ADM.TEXT },
            { l:'Scaricano l’app', v: anNum(W.scaricano), s:`${anPct(W.tassoDownload, 1)} di chi ha ordinato`, c: ADM.OK },
            { l:'Ordinano dall’app', v: anNum(W.primoOrdine), s:`${anPct(W.tassoPrimoOrdine, 0)} di chi l’ha scaricata`, c: ADM.OK },
          ].map((p, i, arr) => (
            <React.Fragment key={p.l}>
              <div style={{flex:1, minWidth:130, padding:'14px 16px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:10}}>
                <div style={{fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>{p.l}</div>
                <div style={{fontSize:26, fontWeight:800, color:p.c, letterSpacing:'-0.03em', marginTop:5, lineHeight:1}}>{p.v}</div>
                <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:5}}>{p.s}</div>
              </div>
              {i < arr.length - 1 && <span style={{color:ADM.MUTED_LIGHT, fontSize:18, flexShrink:0}}>→</span>}
            </React.Fragment>
          ))}
        </div>
        <div style={{padding:'0 22px 18px', display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:12}}>
          <AnMetrica label="Scaricano dopo aver ordinato" valore={anPct(W.tassoDownload, 1)} num={W.tassoDownload}
            formula="download dopo un ordine guest ÷ ordini guest"
            fasce={[
              { fino:2, tono:'DANGER', testo:'La webapp è un vicolo cieco: ordinano dal tavolo e non li rivediamo più.' },
              { fino:6, tono:'WARN', testo:'Uno su venticinque passa all’app. È il ponte più economico che abbiamo e sta lavorando a un quarto.' },
              { tono:'OK', testo:'Il passaggio funziona: la webapp è una porta d’ingresso, non un binario morto.' },
            ]}/>
          <AnMetrica label="Peso sulle registrazioni" valore={W.quotaSuNuovi != null ? anPct(W.quotaSuNuovi, 0) : '—'} num={W.quotaSuNuovi ?? 0}
            formula="scaricano dopo guest ÷ nuove registrazioni del mese"
            fasce={[
              { fino:10, tono:'WARN', testo:'Gli iscritti arrivano quasi tutti da altrove: il QR non sta portando gente nell’app.' },
              { fino:35, tono:'OK', testo:`Su ${anNum(W.nuoviTot)} nuovi iscritti del mese, una fetta importante nasce da un tavolo.` },
              { tono:'OK', testo:`Quasi metà dei ${anNum(W.nuoviTot)} nuovi iscritti nasce da un ordine al tavolo: il canale consumer sono i locali.` },
            ]}/>
        </div>
      </AnCard>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVIZIO CLIENTI · deflection
// ═══════════════════════════════════════════════════════════════════════════
function AnDeflection() {
  const D = AN_DEFLECTION;
  return (
    <AnCard
      titolo="Quanti ticket evita chi si risolve da solo"
      sotto="È il numero che dice se guide e FAQ servono, o se sono solo pagine scritte"
      piede={<>Una consultazione «risolta» è una lettura dopo la quale <strong style={{color:ADM.TEXT}}>non arriva un ticket dallo stesso locale entro 48 ore</strong>.
        Non è una prova che la guida abbia risolto — può aver rinunciato — ma è la miglior approssimazione che si ottiene senza chiederglielo.</>}
    >
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <AnMetrica label="Consultazioni" valore={anNum(D.aperture)} num={D.aperture}
          formula={`${D.faq} FAQ + ${D.guide} guide, aperture del mese`}
          sotto={`${anNum(D.apertureFaq)} sulle FAQ, ${anNum(D.apertureGuide)} sulle guide`}/>
        <AnMetrica label="Si risolvono da soli" valore={anPct(D.quotaRisolta, 0)} num={D.quotaRisolta}
          formula="letture senza ticket entro 48h ÷ letture"
          fasce={[
            { fino:40, tono:'DANGER', testo:'Leggono e chiamano lo stesso: le pagine non rispondono alla domanda vera.' },
            { fino:65, tono:'WARN', testo:'Una parte si arrangia, il resto chiama: c’è margine di riscrittura.' },
            { tono:'OK', testo:'La maggioranza si risolve da sola. Le pagine stanno lavorando.' },
          ]}/>
        <AnMetrica label="Ticket evitati" valore={anNum(D.evitati)} num={D.evitati}
          formula="letture risolte ÷ 6,2 letture per ticket evitato" sotto="Al mese"/>
        <AnMetrica label="Costo evitato" valore={anEur(D.costoEvitato)} num={D.costoEvitato}
          formula={`ticket evitati × ${anEur(PAR.COSTO_TICKET, 2)}`} sotto="Al mese"/>
      </div>
      {D.top.length > 0 && (
        <div style={{padding:'0 22px 18px'}}>
          <div style={{fontSize:12, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Le pagine che lavorano di più</div>
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            {D.top.map((t, i) => (
              <AnBarra key={i} label={t.titolo} quota={(t.aperture / D.top[0].aperture) * 100}
                colore={ADM.INK} valore={anNum(t.aperture)} larghezzaLabel={320}
                destra={<span style={{fontSize:12.4, color: t.risolte >= 70 ? ADM.OK : ADM.WARN, width:104, textAlign:'right', fontWeight:700}}>{t.risolte}% risolte</span>}/>
            ))}
          </div>
        </div>
      )}
    </AnCard>
  );
}

window.AnBarraFiltri = AnBarraFiltri;
window.AN_FILTRI_VUOTI = AN_FILTRI_VUOTI;
window.anFiltra = anFiltra;
window.AnSalute = AnSalute;
window.AnDefinizioni = AnDefinizioni;
window.AnAttivazione = AnAttivazione;
window.AnChurn = AnChurn;
window.AnAcquisizione = AnAcquisizione;
window.AnContribuzione = AnContribuzione;
window.AnDispositivi = AnDispositivi;
window.AnRitenzione = AnRitenzione;
window.AnCrescita = AnCrescita;
window.AnDeflection = AnDeflection;

// Economix — dove vanno i soldi di Byup e dove andranno.
const { useState: useStateEco } = React;

const ECO_CARD = { border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden', background:'#fff' };
const ECO_TH = { padding:'9px 16px', background:'#FAFAFB', borderBottom:`1px solid ${ADM.BORDER}`,
  fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em' };
const ECO_H = { fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:10 };
const ECO_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };
const ECO_SEL = { ...ECO_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };
const ECO_NUM = { fontVariantNumeric:'tabular-nums' };

function EcoCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.05em', display:'block', marginBottom:6}}>{etichetta}</label>
      {children}
      {aiuto && <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{aiuto}</div>}
    </div>
  );
}

// Barra di riempimento: quanto pesa una voce sul totale.
function EcoBarra({ quota, tono }) {
  return (
    <div style={{height:5, borderRadius:99, background:'rgba(49,53,61,0.08)', overflow:'hidden'}}>
      <div style={{height:'100%', width:`${Math.min(100, quota * 100)}%`, borderRadius:99,
        background: tono || ADM.INK, transition:'width 0.25s ease'}}/>
    </div>
  );
}

/* ═══ 1 · IL MESE IN CORSO ═══════════════════════════════════════════════ */
function EcoMese({ mix }) {
  const m = ecoMeseCorrente(mix);
  const righe = m.righe.slice().sort((a, b) => b.fineMese - a.fineMese);
  const maxRiga = righe[0] ? righe[0].fineMese : 1;
  const margine = m.ricavi.totale - m.bruciatoFine;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      {/* Il fulcro: quanto si è speso finora e dove si arriva se il ritmo tiene */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        {[
          { et:'Speso finora questo mese', v:ecoEur(m.bruciatoOggi),
            n:`giorno ${m.trascorsi} di ${m.giorni} · variabili ${ecoEur(m.variabiliOggi)} + fissi maturati ${ecoEur(m.fissi * m.frazione)}` },
          { et:'Proiezione a fine mese', v:ecoEur(m.bruciatoFine),
            n:'al ritmo attuale · i fissi entrano per intero, i variabili proseguono come oggi' },
          { et:'Margine del mese', v:ecoEur(margine), tono: margine >= 0 ? ADM.OK : ADM.DANGER,
            n:`ricavi previsti ${ecoEur(m.ricavi.totale)} meno costi previsti` },
        ].map(c => (
          <div key={c.et} style={{...ECO_CARD, padding:'15px 17px'}}>
            <div style={{fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em'}}>{c.et}</div>
            <div style={{fontSize:27, fontWeight:800, letterSpacing:'-0.02em', marginTop:7,
              color: c.tono || ADM.TEXT, ...ECO_NUM}}>{c.v}</div>
            <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.45}}>{c.n}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={ECO_H}>Costi a consumo · spaccato per servizio</div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'minmax(0,1.6fr) 1.15fr 96px 108px 108px', gap:12}}>
            <div>Servizio</div><div>Consumo previsto</div><div>Prezzo</div><div>A oggi</div><div>Fine mese</div>
          </div>
          {righe.map((r, i) => (
            <div key={r.s.id} style={{display:'grid', gridTemplateColumns:'minmax(0,1.6fr) 1.15fr 96px 108px 108px',
              gap:12, alignItems:'center', padding:'11px 16px',
              borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{r.s.nome}</div>
                <div style={{marginTop:5}}><EcoBarra quota={r.fineMese / maxRiga}/></div>
              </div>
              <div style={{fontSize:12.4, color:ADM.MUTED, ...ECO_NUM}}>
                {Math.round(r.consumoPieno).toLocaleString('it-IT')} <span style={{color:ADM.MUTED_SOFT}}>{r.s.unita}</span>
              </div>
              <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, ...ECO_NUM}}>{ecoEur2(r.s.prezzo)}</div>
              <div style={{fontSize:13, color:ADM.MUTED, ...ECO_NUM}}>{ecoEur(r.aOggi)}</div>
              <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur(r.fineMese)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Le commissioni non sono un costo di Byup: dirlo esplicitamente evita
          che qualcuno le cerchi e concluda che mancano. */}
      <div style={{padding:'13px 15px', borderRadius:10, background:ADM.NEUTRAL_SOFT,
        fontSize:12.4, color:ADM.MUTED, lineHeight:1.6}}>
        Le commissioni sui pagamenti non compaiono qui perché non sono un costo di Byup: sono
        riproiettate ai ristoratori e restano una partita di giro. Byup incassa l’abbonamento a
        Byup Fresh, non una quota sul transato.
      </div>
    </div>
  );
}

/* ═══ 2 · COSTI ══════════════════════════════════════════════════════════ */
const ECO_PERIODICITA = { mensile:'Mensile', annuale:'Annuale', 'una-tantum':'Una tantum' };

function EcoModaleFisso({ onChiudi, onSalva }) {
  const [b, setB] = useStateEco({ voce:'', categoria:'Software', importo:'', periodicita:'mensile',
    dal: new Date().toISOString().slice(0, 10), fornitore:'', nota:'' });
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const ok = b.voce.trim().length > 2 && parseFloat(b.importo) > 0;
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="fisso" onClick={e=>e.stopPropagation()} style={{width:640, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>Aggiungere un costo</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            Un costo che non dipende dal volume. Se invece cresce con i locali o con gli ordini è un
            costo a consumo e va aggiunto come servizio, altrimenti la proiezione lo tiene fermo.
          </div>
        </div>
        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16, alignContent:'start'}}>
          <EcoCampo etichetta="Voce di costo" span>
            <input value={b.voce} onChange={e=>agg('voce', e.target.value)} style={ECO_INP}
              placeholder="Che cosa si paga"/>
          </EcoCampo>
          <EcoCampo etichetta="Categoria">
            <select value={b.categoria} onChange={e=>agg('categoria', e.target.value)} style={ECO_SEL}>
              {['Personale','Consulenze','Software','Marketing','Assicurazioni','Altro'].map(c =>
                <option key={c} value={c}>{c}</option>)}
            </select>
          </EcoCampo>
          <EcoCampo etichetta="Fornitore">
            <input value={b.fornitore} onChange={e=>agg('fornitore', e.target.value)} style={ECO_INP}
              placeholder="Chi emette la fattura"/>
          </EcoCampo>
          <EcoCampo etichetta="Importo in euro">
            <input value={b.importo} onChange={e=>agg('importo', e.target.value.replace(/[^\d.,]/g, ''))}
              style={ECO_INP} placeholder="0,00"/>
          </EcoCampo>
          <EcoCampo etichetta="Periodicità"
            aiuto={b.periodicita === 'annuale' ? 'Nel conto economico mensile entra in dodicesimi.'
              : b.periodicita === 'una-tantum' ? 'Pesa solo sul mese in cui è avvenuto.' : null}>
            <select value={b.periodicita} onChange={e=>agg('periodicita', e.target.value)} style={ECO_SEL}>
              {Object.entries(ECO_PERIODICITA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </EcoCampo>
          <EcoCampo etichetta="Decorrenza" span>
            <input type="date" value={b.dal} onChange={e=>agg('dal', e.target.value)} style={ECO_INP}/>
          </EcoCampo>
        </div>
        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1}}>
            {ok ? 'Entra subito nel conto economico e nella proiezione.' : 'Servono voce e importo.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!ok} onClick={()=>onSalva(b)}>Aggiungi</AdmButton>
        </div>
      </div>
    </div>
  );
}

function EcoCosti({ mix, forza }) {
  const [nuovo, setNuovo] = useStateEco(false);
  const d = ECO_STORICO[ECO_STORICO.length - 1];
  const variabiliMese = ecoCostiVariabili(d);
  const fissiMese = ecoFissiDelMese(new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), 1));

  const perCategoria = {};
  ECO_SERVIZI.forEach(s => {
    perCategoria[s.categoria] = (perCategoria[s.categoria] || 0) + ecoCostoServizio(s, d);
  });

  const salva = (b) => {
    ECO_FISSI.push({
      id:'F-' + String(ECO_FISSI.length + 1).padStart(2, '0'),
      voce:b.voce.trim(), categoria:b.categoria,
      importo: parseFloat(String(b.importo).replace(',', '.')) || 0,
      periodicita:b.periodicita, dal: new Date(b.dal + 'T12:00:00'), a:null,
      fornitore:b.fornitore.trim() || '—', manuale:true,
    });
    setNuovo(false); forza();
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        {[
          { et:'Costi a consumo', v:ecoEur(variabiliMese), n:'questo mese, a volume attuale' },
          { et:'Costi fissi', v:ecoEur(fissiMese), n:'competenza del mese, annuali in dodicesimi' },
          { et:'Totale mensile', v:ecoEur(variabiliMese + fissiMese), n:'quanto costa tenere accesa Byup' },
          { et:'Costo per locale attivo', v:ecoEur2((variabiliMese + fissiMese) / d.localiAttivi),
            n:`su ${d.localiAttivi} locali attivi` },
        ].map(c => (
          <div key={c.et} style={{...ECO_CARD, padding:'14px 16px'}}>
            <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em'}}>{c.et}</div>
            <div style={{fontSize:23, fontWeight:800, letterSpacing:'-0.02em', color:ADM.TEXT,
              marginTop:6, ...ECO_NUM}}>{c.v}</div>
            <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.4}}>{c.n}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Costi a consumo</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            {Object.entries(perCategoria).map(([k, v]) => `${k} ${ecoEur(v)}`).join(' · ')}
          </span>
        </div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'minmax(0,1.5fr) 1.3fr 1fr 110px 92px', gap:12}}>
            <div>Servizio</div><div>Dipende da</div><div>Consumo</div><div>Costo mese</div><div>Origine</div>
          </div>
          {ECO_SERVIZI.slice().sort((a, b) => ecoCostoServizio(b, d) - ecoCostoServizio(a, d)).map((s, i) => (
            <div key={s.id} style={{display:'grid', gridTemplateColumns:'minmax(0,1.5fr) 1.3fr 1fr 110px 92px',
              gap:12, alignItems:'center', padding:'12px 16px',
              borderBottom: i < ECO_SERVIZI.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{s.nome}</div>
                <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>{s.categoria} · {s.fornitore}</div>
              </div>
              <div style={{fontSize:12, color:ADM.MUTED, lineHeight:1.45}}>{ECO_DRIVER_LABEL[s.driver]}</div>
              <div style={{fontSize:12.4, color:ADM.MUTED, ...ECO_NUM}}>
                {Math.round(ecoConsumo(s, d)).toLocaleString('it-IT')}
                <span style={{color:ADM.MUTED_SOFT}}> {s.unita}</span>
              </div>
              <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur(ecoCostoServizio(s, d))}</div>
              <div>
                <span style={{fontSize:10.8, fontWeight:700, padding:'3px 8px', borderRadius:6,
                  background: s.fonte === 'manuale' ? 'rgba(49,53,61,0.08)' : 'rgba(255,90,95,0.12)',
                  color: s.fonte === 'manuale' ? ADM.INK : ADM.PINK}}>
                  {s.fonte === 'manuale' ? 'manuale' : 'da collegare'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12, color:ADM.MUTED, marginTop:9, lineHeight:1.55}}>
          Nessuna connessione è attiva: questi importi sono stime coerenti coi driver, non letture.
          Collegando AWS Cost Explorer e le console dei fornitori, le righe marcate «da collegare»
          si aggiornerebbero da sole durante il mese.
        </div>
      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Costi fissi</div>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setNuovo(true)}>Aggiungi un costo</AdmButton>
        </div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:'minmax(0,1.7fr) 1fr 1.1fr 110px 120px', gap:12}}>
            <div>Voce</div><div>Categoria</div><div>Fornitore</div><div>Importo</div><div>Periodicità</div>
          </div>
          {ECO_FISSI.map((f, i) => (
            <div key={f.id} style={{display:'grid', gridTemplateColumns:'minmax(0,1.7fr) 1fr 1.1fr 110px 120px',
              gap:12, alignItems:'center', padding:'12px 16px',
              borderBottom: i < ECO_FISSI.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{f.voce}</div>
                {f.nota && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.4}}>{f.nota}</div>}
              </div>
              <div style={{fontSize:12.4, color:ADM.MUTED}}>{f.categoria}</div>
              <div style={{fontSize:12.4, color:ADM.MUTED}}>{f.fornitore}</div>
              <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur2(f.importo)}</div>
              <div style={{fontSize:12.2, color: f.periodicita === 'una-tantum' ? ADM.MUTED_SOFT : ADM.MUTED}}>
                {ECO_PERIODICITA[f.periodicita]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {nuovo && <EcoModaleFisso onChiudi={()=>setNuovo(false)} onSalva={salva}/>}
    </div>
  );
}
const ECO_DRIVER_LABEL = {
  localiAttivi:'Locali attivi',
  nuoviLocali:'Nuovi locali attivati nel mese',
  utentiApp:'Utenti app attivi',
  transazioni:'Transazioni (pagamenti)',
  fisso:'Niente — canone fisso',
};

window.EcoMese = EcoMese;
window.EcoCosti = EcoCosti;
window.ECO_CARD = ECO_CARD;
window.ECO_TH = ECO_TH;
window.ECO_H = ECO_H;
window.ECO_INP = ECO_INP;
window.ECO_SEL = ECO_SEL;
window.ECO_NUM = ECO_NUM;
window.ECO_PERIODICITA = ECO_PERIODICITA;
window.ECO_DRIVER_LABEL = ECO_DRIVER_LABEL;
window.EcoCampo = EcoCampo;
window.EcoBarra = EcoBarra;

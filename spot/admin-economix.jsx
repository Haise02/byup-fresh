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
const ECO_GRID_SERV = 'minmax(0,1.7fr) 1.15fr 118px 124px 104px 116px 108px';
const ECO_MESI_LUNGHI = ['gennaio','febbraio','marzo','aprile','maggio','giugno',
  'luglio','agosto','settembre','ottobre','novembre','dicembre'];

// «26 minuti fa» dice piu di un orario: la domanda e quanto e fresca la lettura.
function ecoQuando(d) {
  if (!d) return 'mai';
  const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (min < 1) return 'adesso';
  if (min < 60) return `${min} ${min === 1 ? 'minuto' : 'minuti'} fa`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ${h === 1 ? 'ora' : 'ore'} fa`;
  const g = Math.round(h / 24);
  return `${g} ${g === 1 ? 'giorno' : 'giorni'} fa`;
}

// Conferma del collegamento: si sta dando a Byup una credenziale su un sistema
// che costa denaro, quindi prima si legge che cosa verrebbe letto e con quali
// permessi. Staccare non cancella nulla: si torna alla stima.
function EcoModaleConnessione({ conn, onChiudi, onConferma }) {
  const attiva = conn.stato !== 'collegato';
  const met = ECO_METODI[conn.metodo] || ECO_METODI.chiave;
  const [valore, setValore] = useStateEco('');
  // Un pulsante «Collega» basta solo per l'OAuth. Negli altri casi il lavoro
  // avviene sulla console del fornitore e qui si incolla un identificativo;
  // per lo SDI non c'e nulla da incollare, c'e una delega da far registrare.
  const serveCampo = attiva && !!conn.campo;
  const pronto = !attiva || !serveCampo || valore.trim().length > 6;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="connessione" onClick={e=>e.stopPropagation()} style={{width:580, maxWidth:'92%', background:'#fff',
        borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.18s ease', maxHeight:'100%', overflowY:'auto'}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom:6}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, flex:1}}>
            {attiva ? `Collegare ${conn.nome}` : `Staccare ${conn.nome}?`}
          </div>
          {attiva && <CfPill tono="NEUTRAL">{met.label} · {met.durata}</CfPill>}
        </div>
        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:16}}>
          {attiva ? met.come
            : 'I costi tornano a essere stimati dal modello. Nessun dato viene cancellato e ricollegare è immediato.'}
        </div>

        {attiva && (
          <div style={{padding:'14px 16px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
            {conn.passi.map((t, k) => (
              <div key={k} style={{display:'flex', gap:10, marginBottom: k < conn.passi.length - 1 ? 9 : 0}}>
                <span style={{fontSize:11, fontWeight:800, color:ADM.PINK, flexShrink:0, marginTop:2,
                  fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{k + 1}</span>
                <span style={{fontSize:12.8, color:ADM.TEXT, lineHeight:1.5}}>{t}</span>
              </div>
            ))}
          </div>
        )}

        {serveCampo && (
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em', display:'block', marginBottom:6}}>{conn.campo}</label>
            <input value={valore} onChange={e=>setValore(e.target.value)} style={ECO_INP}
              placeholder={conn.esempio}/>
          </div>
        )}

        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
          Righe interessate:{' '}
          <strong style={{color:ADM.TEXT}}>
            {conn.fatture ? 'le fatture ricevute'
              : conn.servizi.map(id => (ECO_SERVIZI.find(x => x.id === id) || {}).nome).join(', ')}
          </strong>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!pronto} onClick={onConferma}>
            {attiva ? met.azione : 'Stacca'}
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

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
  const [conn, setConn] = useStateEco(null);
  const m = ecoMeseCorrente(mix);
  const d = m.d;
  const fissiMese = ecoFissiDelMese(new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), 1));
  const letture = ECO_CONNESSIONI.filter(c => c.stato === 'collegato' && c.ultimaLettura).map(c => c.ultimaLettura);
  const letturaPiuRecente = letture.length ? new Date(Math.max.apply(null, letture)) : null;

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
          { et:`Spesa ${ECO_MESI_LUNGHI[ECO_OGGI.getMonth()]}`, v:ecoEur(m.bruciatoOggi),
            n:`letta ${ecoQuando(letturaPiuRecente)}` },
          { et:'Costo fine mese', v:ecoEur(m.bruciatoFine) },
          { et:'Costi fissi', v:ecoEur(fissiMese), n:'competenza del mese, annuali in dodicesimi' },
          { et:'Costo per locale attivo', v:ecoEur2(m.bruciatoFine / d.localiAttivi),
            n:`su ${d.localiAttivi} locali attivi` },
        ].map(c => (
          <div key={c.et} style={{...ECO_CARD, padding:'15px 17px'}}>
            <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em'}}>{c.et}</div>
            <div style={{fontSize:25, fontWeight:800, letterSpacing:'-0.02em', color:ADM.TEXT,
              marginTop:7, ...ECO_NUM}}>{c.v}</div>
            {c.n && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.4}}>{c.n}</div>}
          </div>
        ))}
      </div>

      <div>
        <div style={ECO_H}>Collegamenti ai fornitori</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10}}>
          {ECO_CONNESSIONI.map(c => {
            const st = ECO_STATO_CONN[c.stato];
            const collegato = c.stato === 'collegato';
            return (
              <div key={c.id} style={{...ECO_CARD, padding:'14px 16px', display:'flex', flexDirection:'column', gap:9}}>
                <div style={{display:'flex', alignItems:'flex-start', gap:9}}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{c.nome}</div>
                    <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.4}}>{c.legge}</div>
                  </div>
                  <CfPill tono={st.tono}>{st.label}</CfPill>
                </div>
                <div style={{fontSize:11.6, color:ADM.MUTED, lineHeight:1.45}}>
                  {collegato
                    ? <React.Fragment>
                        Ultima lettura <strong style={{color:ADM.TEXT}}>{ecoQuando(c.ultimaLettura)}</strong>
                      </React.Fragment>
                    : c.stato === 'manuale'
                      ? `Inserita a mano ${ecoQuando(c.ultimaLettura)}`
                      : 'Gli importi di queste righe sono stimati dal modello'}
                </div>
                <div style={{display:'flex', gap:6, marginTop:'auto'}}>
                  {collegato && (
                    <AdmButton variant="secondary" size="sm" style={{fontSize:12}}
                      onClick={()=>{ ecoAggiorna(c); forza(); }}>Aggiorna</AdmButton>
                  )}
                  <AdmButton variant={collegato ? 'ghost' : 'primary'} size="sm" style={{fontSize:12}}
                    onClick={()=>setConn(c)}>
                    {collegato ? 'Stacca' : c.stato === 'manuale' ? 'Collega comunque' : 'Collega'}
                  </AdmButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...ECO_H, marginBottom:0}}>Costi a consumo</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            {Object.entries(perCategoria).map(([k, v]) => `${k} ${ecoEur(v)}`).join(' · ')}
          </span>
        </div>
        <div style={ECO_CARD}>
          <div style={{...ECO_TH, display:'grid', gridTemplateColumns:ECO_GRID_SERV, gap:11}}>
            <div>Servizio</div><div>Dipende da</div><div>Consumo attuale</div><div>Consumo previsto</div>
            <div>Costo attuale</div><div>Costo fine mese</div><div>Stato</div>
          </div>
          {m.righe.slice().sort((a, b) => b.fineMese - a.fineMese).map((r, i) => {
            const s = r.s;
            const previsto = ecoConsumo(s, d);
            const attuale = previsto * m.frazione;
            const c = ecoConnessioneDi(s.id);
            const st = ECO_STATO_CONN[(c && c.stato) || 'scollegato'];
            return (
              <div key={s.id} style={{display:'grid', gridTemplateColumns:ECO_GRID_SERV,
                gap:11, alignItems:'center', padding:'12px 16px',
                borderBottom: i < m.righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{s.nome}</div>
                  <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>
                    {s.fornitore} · {ecoEur2(ecoPrezzo(s))} per {s.unitaSing || s.unita}
                  </div>
                </div>
                <div style={{fontSize:12, color:ADM.MUTED, lineHeight:1.4}}>{ECO_DRIVER_LABEL[s.driver]}</div>
                <div style={{fontSize:12.6, color:ADM.TEXT, ...ECO_NUM}}>
                  {Math.round(attuale).toLocaleString('it-IT', {useGrouping:true})}
                </div>
                <div style={{fontSize:12.4, color:ADM.MUTED, ...ECO_NUM}}>
                  {Math.round(previsto).toLocaleString('it-IT', {useGrouping:true})}
                </div>
                <div style={{fontSize:13.2, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur(r.aOggi)}</div>
                <div style={{fontSize:13.8, fontWeight:700, color:ADM.TEXT, ...ECO_NUM}}>{ecoEur(r.fineMese)}</div>
                <div><CfPill tono={st.tono}>{st.label}</CfPill></div>
              </div>
            );
          })}
        </div>

        <div style={{fontSize:12, color:ADM.MUTED, marginTop:9, lineHeight:1.55}}>
          Le righe collegate riportano il consuntivo del fornitore; le altre la stima del modello.
        </div>
      </div>

      {/* Il pacchetto prepagato non e' un costo mensile: e' cassa immobilizzata.
          Va guardato come tale — quanto credito resta e per quanti mesi basta. */}
      {(() => {
        const pk = ECO_PACCHETTI.openapi;
        const t = ecoTaglio(pk, pk.attivo);
        const consumoMese = ecoConsumo(ECO_SERVIZI.find(x => x.id === 'openapi'), d);
        const mesiResidui = consumoMese ? pk.residuo / consumoMese : 0;
        return (
          <div>
            <div style={ECO_H}>Credito prepagato · {pk.fornitore}</div>
            <div style={{...ECO_CARD, padding:'16px 18px'}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:18, marginBottom:14}}>
                {[
                  ['Taglio attivo', `${t.quantita.toLocaleString('it-IT')} ${pk.unita}`, `pagato ${ecoEur(t.prezzo)}`],
                  ['Prezzo unitario', ecoEur2(ecoPrezzoUnitario(t)), 'scende salendo di taglio'],
                  ['Credito residuo', pk.residuo.toLocaleString('it-IT'), `su ${t.quantita.toLocaleString('it-IT')}`],
                  ['Basta per', mesiResidui < 1 ? 'meno di un mese' : `${mesiResidui.toFixed(1).replace('.', ',')} mesi`,
                    `al ritmo di ${Math.round(consumoMese).toLocaleString('it-IT')} al mese`],
                ].map(([k, v, n]) => (
                  <div key={k}>
                    <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                      letterSpacing:'0.05em'}}>{k}</div>
                    <div style={{fontSize:18, fontWeight:800, color:ADM.TEXT, marginTop:5, ...ECO_NUM}}>{v}</div>
                    <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:3}}>{n}</div>
                  </div>
                ))}
              </div>
              <div style={{paddingTop:13, borderTop:`1px solid ${ADM.BORDER}`}}>
                <div style={{fontSize:11.2, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.05em', marginBottom:9}}>Tagli disponibili</div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {pk.tagli.map(x => {
                    const att = x.id === pk.attivo;
                    const mesi = consumoMese ? x.quantita / consumoMese : 0;
                    return (
                      <button key={x.id} className="adm-card-interactive"
                        onClick={()=>{ pk.attivo = x.id; forza(); }}
                        style={{padding:'9px 13px', borderRadius:10, cursor:'pointer', fontFamily:'inherit',
                          textAlign:'left', border:`1.5px solid ${att ? ADM.TEXT : ADM.BORDER}`,
                          background: att ? ADM.TEXT : '#fff', color: att ? '#fff' : ADM.TEXT}}>
                        <div style={{fontSize:12.8, fontWeight:800, ...ECO_NUM}}>
                          {x.quantita.toLocaleString('it-IT')}
                        </div>
                        <div style={{fontSize:11, opacity:0.72, marginTop:2, ...ECO_NUM}}>
                          {ecoEur(x.prezzo)} · {ecoEur2(ecoPrezzoUnitario(x))}/u
                        </div>
                        <div style={{fontSize:10.6, opacity:0.6, marginTop:2}}>
                          {mesi < 1 ? '<1 mese' : `${mesi.toFixed(1).replace('.', ',')} mesi`} di consumo
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{fontSize:12, color:ADM.MUTED, marginTop:11, lineHeight:1.55}}>
                  Cambiando taglio cambia il prezzo unitario di ogni trasmissione, quindi la riga
                  OpenAPI qui sopra e tutta la proiezione. Il taglio grande costa meno per unità ma
                  immobilizza cassa: è una scelta di liquidità, non solo di prezzo.
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
      {conn && <EcoModaleConnessione conn={conn} onChiudi={()=>setConn(null)}
        onConferma={()=>{ ecoCollega(conn, conn.stato !== 'collegato'); setConn(null); forza(); }}/>}
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

window.EcoCosti = EcoCosti;
window.ecoQuando = ecoQuando;
window.EcoModaleConnessione = EcoModaleConnessione;
window.ECO_CARD = ECO_CARD;
window.ECO_TH = ECO_TH;
window.ECO_H = ECO_H;
window.ECO_INP = ECO_INP;
window.ECO_SEL = ECO_SEL;
window.ECO_NUM = ECO_NUM;
window.ECO_MESI_LUNGHI = ECO_MESI_LUNGHI;
window.ECO_PERIODICITA = ECO_PERIODICITA;
window.ECO_DRIVER_LABEL = ECO_DRIVER_LABEL;
window.EcoCampo = EcoCampo;
window.EcoBarra = EcoBarra;

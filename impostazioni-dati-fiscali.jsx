// Impostazioni → Dati fiscali locale (anagrafica per scontrini — RT gestito altrove)

function ImpDatiFiscali() {
  const [data, setData] = React.useState({
    // Anagrafica
    ragione: 'Cacio e Pepe S.r.l.',
    insegna: 'Cacio e Pepe',
    piva: 'IT12345678901',
    cf: '12345678901',
    regime: 'Ordinario',
    ateco: '56.10.11',
    // Sede operativa (stampata sullo scontrino)
    indirizzo: 'Via dei Giubbonari 27',
    citta: 'Roma', cap: '00197', prov: 'RM',
    // Dati per fatturazione
    ragioneSoc: 'Cacio e Pepe S.r.l.',
    rea: 'RM-1234567',
    cciaa: 'Roma',
    capitaleSociale: '10.000,00',
    socioUnico: false,
    inLiquidazione: false,
    sdi: 'ABC1234',
    pec: 'fatture@pec.cacioepepe.it',
    sedeIndirizzo: 'Via dei Giubbonari 27',
    sedeCitta: 'Roma',
    sedeCap: '00197',
    sedeProv: 'RM',
    sedeNazione: 'IT',
    banca: 'Banca Intesa Sanpaolo',
    iban: 'IT60X0542811101000000123456',
    swift: 'BCITITMM',
  });

  const [dirty, setDirty] = React.useState(false);
  const set = (k, v) => { setData(d => ({...d, [k]: v})); setDirty(true); };

  const fields = [
    { id: 'ragione', label: 'Ragione sociale', req: true },
    { id: 'piva', label: 'Partita IVA', req: true },
    { id: 'insegna', label: 'Insegna', req: true },
    { id: 'indirizzo', label: 'Indirizzo sede operativa', req: true },
  ];
  const missing = fields.filter(f => !data[f.id]);
  const isComplete = missing.length === 0;

  return (
    <div>
      {/* Status banner */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: isComplete ? '#F0FDF4' : PN.AMBER_SOFT,
        border: `1.5px solid ${isComplete ? PN.GREEN_SOFT : '#FCD34D'}`,
        borderRadius: 12,
        marginBottom: 18,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: isComplete ? PN.GREEN : PN.AMBER,
          color: PN.WHITE,
          display:'grid', placeItems:'center',
          flexShrink: 0,
        }}>{isComplete ? <BuIcons.check size={18} color={PN.WHITE}/> : <BuIcons.alert size={18} color={PN.WHITE}/>}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14, fontWeight:700, color: isComplete ? PN.GREEN : PN.AMBER}}>
            {isComplete
              ? 'Anagrafica completa — i dati appaiono correttamente sugli scontrini'
              : `${missing.length} ${missing.length===1?'campo mancante':'campi mancanti'} per emettere scontrini conformi`}
          </div>
          <div style={{fontSize:12, color: PN.MUTED, marginTop: 2}}>
            {isComplete
              ? 'Insegna, P.IVA e indirizzo sede vengono stampati in cima al documento commerciale'
              : `Mancano: ${missing.map(m => m.label).join(', ')}`
            }
          </div>
        </div>
      </div>

      {/* 2-column layout: form a sx, anteprima scontrino a dx */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap: 18, alignItems:'flex-start'}}>
        <div>
          <ImpCard title="Dati anagrafici" sub="Informazioni fiscali del titolare dell'attività">
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
              <ImpField label="Ragione sociale" hint="Come risulta a registro imprese">
                <ImpInput value={data.ragione} onChange={e => set('ragione', e.target.value)}/>
              </ImpField>
              <ImpField label="Regime fiscale">
                <select value={data.regime} onChange={e => set('regime', e.target.value)} style={{
                  width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                  borderRadius:9, fontSize:13.5, background:PN.WHITE, fontFamily:'inherit',
                }}>
                  <option>Ordinario</option>
                  <option>Forfettario</option>
                  <option>Semplificato</option>
                </select>
              </ImpField>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14, marginTop: 4}}>
              <ImpField label="Insegna" hint="Stampata in cima allo scontrino">
                <ImpInput value={data.insegna} onChange={e => set('insegna', e.target.value)}/>
              </ImpField>
              <ImpField label="Codice ATECO">
                <ImpInput value={data.ateco} onChange={e => set('ateco', e.target.value)}/>
              </ImpField>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginTop: 4}}>
              <ImpField label="Partita IVA" hint={data.piva.length === 13 ? 'Verificata Ag. Entrate' : 'Inserisci 11 cifre con prefisso IT'}>
                <div style={{position:'relative'}}>
                  <ImpInput value={data.piva} onChange={e => set('piva', e.target.value)}/>
                  {data.piva.length === 13 && (
                    <span style={{
                      position:'absolute', right: 10, top:'50%', transform:'translateY(-50%)',
                      color: PN.GREEN, display:'inline-flex',
                    }}><BuIcons.check size={14}/></span>
                  )}
                </div>
              </ImpField>
              <ImpField label="Codice fiscale">
                <ImpInput value={data.cf} onChange={e => set('cf', e.target.value)}/>
              </ImpField>
            </div>
          </ImpCard>

          <ImpCard title="Sede operativa" sub="Indirizzo dove vengono emessi gli scontrini, stampato in cima al documento">
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
              <ImpField label="Indirizzo">
                <ImpInput value={data.indirizzo} onChange={e => set('indirizzo', e.target.value)}/>
              </ImpField>
              <ImpField label="CAP">
                <ImpInput value={data.cap} onChange={e => set('cap', e.target.value)}/>
              </ImpField>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14, marginTop: 4}}>
              <ImpField label="Città">
                <ImpInput value={data.citta} onChange={e => set('citta', e.target.value)}/>
              </ImpField>
              <ImpField label="Provincia">
                <ImpInput value={data.prov} onChange={e => set('prov', e.target.value)}/>
              </ImpField>
            </div>
          </ImpCard>

          <ImpCard
            title="Dati fatturazione"
            sub="Informazioni fiscali e amministrative — utili anche se collegherai un servizio esterno (es. Aruba)"
          >
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
              <ImpField label="Ragione sociale" hint="Come risulta a registro imprese">
                <ImpInput value={data.ragioneSoc} onChange={e => set('ragioneSoc', e.target.value)}/>
              </ImpField>
              <ImpField label="Codice ATECO">
                <ImpInput value={data.ateco} onChange={e => set('ateco', e.target.value)}/>
              </ImpField>
            </div>

            <div style={{
              fontSize: 13.5, fontWeight: 700, color: PN.TEXT,
              marginTop: 22, marginBottom: 10,
            }}>Camera di Commercio</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14}}>
              <ImpField label="Numero REA">
                <ImpInput value={data.rea} onChange={e => set('rea', e.target.value)}/>
              </ImpField>
              <ImpField label="CCIAA">
                <ImpInput value={data.cciaa} onChange={e => set('cciaa', e.target.value)}/>
              </ImpField>
              <ImpField label="Capitale sociale (€)" hint="Solo società di capitali">
                <ImpInput value={data.capitaleSociale} onChange={e => set('capitaleSociale', e.target.value)}/>
              </ImpField>
            </div>
            <div style={{display:'flex', gap: 18, marginTop: 10}}>
              <label style={{display:'inline-flex', alignItems:'center', gap: 8, cursor:'pointer', fontSize: 12.5}}>
                <input type="checkbox" checked={data.socioUnico} onChange={e => set('socioUnico', e.target.checked)} style={{accentColor: PN.PINK, width: 14, height: 14}}/>
                Socio unico
              </label>
              <label style={{display:'inline-flex', alignItems:'center', gap: 8, cursor:'pointer', fontSize: 12.5}}>
                <input type="checkbox" checked={data.inLiquidazione} onChange={e => set('inLiquidazione', e.target.checked)} style={{accentColor: PN.PINK, width: 14, height: 14}}/>
                In liquidazione
              </label>
            </div>

            <div style={{
              fontSize: 13.5, fontWeight: 700, color: PN.TEXT,
              marginTop: 22, marginBottom: 10,
            }}>SDI e fatturazione elettronica</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
              <ImpField label="Codice Destinatario SDI">
                <ImpInput value={data.sdi} onChange={e => set('sdi', e.target.value)} style={{fontFamily:'ui-monospace, monospace', letterSpacing: 0.5}}/>
              </ImpField>
              <ImpField label="PEC per invio SDI">
                <ImpInput value={data.pec} onChange={e => set('pec', e.target.value)}/>
              </ImpField>
            </div>

            <div style={{
              fontSize: 13.5, fontWeight: 700, color: PN.TEXT,
              marginTop: 22, marginBottom: 10,
            }}>Sede legale</div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
              <ImpField label="Indirizzo e civico">
                <ImpInput value={data.sedeIndirizzo} onChange={e => set('sedeIndirizzo', e.target.value)}/>
              </ImpField>
              <ImpField label="CAP">
                <ImpInput value={data.sedeCap} onChange={e => set('sedeCap', e.target.value)}/>
              </ImpField>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14, marginTop: 4}}>
              <ImpField label="Città">
                <ImpInput value={data.sedeCitta} onChange={e => set('sedeCitta', e.target.value)}/>
              </ImpField>
              <ImpField label="Provincia">
                <ImpInput value={data.sedeProv} onChange={e => set('sedeProv', e.target.value)}/>
              </ImpField>
              <ImpField label="Nazione">
                <select value={data.sedeNazione} onChange={e => set('sedeNazione', e.target.value)} style={{
                  width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                  borderRadius:9, fontSize:13.5, background:PN.WHITE, fontFamily:'inherit',
                }}>
                  <option value="IT">Italia (IT)</option>
                  <option value="SM">San Marino (SM)</option>
                  <option value="VA">Città del Vaticano (VA)</option>
                </select>
              </ImpField>
            </div>

            <div style={{
              fontSize: 13.5, fontWeight: 700, color: PN.TEXT,
              marginTop: 22, marginBottom: 10,
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <span>Dati bancari</span>
              <span style={{fontSize: 11, fontWeight: 500, color: PN.MUTED}}>
                Su fattura compare un solo IBAN
              </span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14}}>
              <ImpField label="Banca">
                <ImpInput value={data.banca} onChange={e => set('banca', e.target.value)}/>
              </ImpField>
              <ImpField label="IBAN">
                <ImpInput value={data.iban} onChange={e => set('iban', e.target.value)} style={{fontFamily:'ui-monospace, monospace', letterSpacing: 0.5}}/>
              </ImpField>
              <ImpField label="Codice Swift">
                <ImpInput value={data.swift} onChange={e => set('swift', e.target.value)}/>
              </ImpField>
            </div>

            <div style={{marginTop: 16}}>
              <button style={{
                padding:'10px 22px', borderRadius: 999,
                background: '#1A1A1A', color: PN.WHITE,
                border:'none', cursor:'pointer', fontFamily:'inherit',
                fontSize: 13, fontWeight: 600,
              }}>Sostituisci banca</button>
            </div>

            {/* Info delegata ad Aruba */}
            <div style={{
              marginTop: 18, padding: '11px 14px',
              background: PN.BLUE_SOFT, borderRadius: 10,
              fontSize: 11.5, color:'#1E40AF', lineHeight: 1.5,
            }}>
              <b>Numerazione fatture, aliquote IVA e bollo virtuale</b> vengono gestiti automaticamente dal servizio di fatturazione collegato (es. Aruba) — non serve configurarli qui.
            </div>
          </ImpCard>

          {/* Info: scontrino digitale gestito da byup tramite POS */}
          <div style={{
            padding: '14px 16px',
            background: PN.BLUE_SOFT, borderRadius: 12,
            display:'flex', gap: 12, alignItems:'flex-start',
          }}>
            <span style={{fontSize: 18}}>ℹ️</span>
            <div style={{fontSize: 12, color:'#1E40AF', lineHeight: 1.5}}>
              <b>Lo scontrino è 100% digitale</b> — byup emette e trasmette i corrispettivi all'Agenzia delle Entrate per te. Il collegamento al POS e gli strumenti di pagamento si configurano nella pagina <b style={{cursor:'pointer'}}>POS e integrazioni</b>.
            </div>
          </div>
        </div>

        {/* Anteprima scontrino */}
        <aside style={{position:'sticky', top: 0}}>
          <ScontrinoPreview data={data}/>
        </aside>
      </div>

      <ImpSaveBar dirty={dirty} onCancel={() => setDirty(false)} onSave={() => setDirty(false)}/>
    </div>
  );
}

function ScontrinoPreview({ data }) {
  const mono = "ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, monospace";
  const lineRow = (label, val, opts={}) => (
    <div style={{display:'flex', justifyContent:'space-between', fontSize: 10.5, lineHeight: 1.5, ...opts}}>
      <span>{label}</span>
      <span>{val}</span>
    </div>
  );

  const rows = [
    { desc:'CACIO E PEPE',     q:1, p:14.00 },
    { desc:'CARBONARA',        q:1, p:14.00 },
    { desc:'ACQUA NAT 0.75L',  q:1, p:3.00  },
    { desc:'COPERTO',          q:2, p:2.00  },
  ];
  const totale = rows.reduce((s,r) => s + r.p*r.q, 0);
  const imponibile = +(totale / 1.10).toFixed(2);
  const iva = +(totale - imponibile).toFixed(2);

  return (
    <div style={{borderRadius: 14, overflow:'visible'}}>
      {/* Header esterno */}
      <div style={{
        display:'flex', alignItems:'center', gap: 8, marginBottom: 10,
        paddingLeft: 4,
      }}>
        <span style={{fontSize:13, fontWeight:700, flex:1}}>Anteprima scontrino</span>
        <span style={{fontSize:11, color:PN.MUTED}}>Documento commerciale</span>
      </div>

      {/* Receipt: carta termica con bordi stappati */}
      <div style={{
        position:'relative',
        background: '#FDFBF5',
        boxShadow: '0 12px 28px -10px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.06)',
        padding: '20px 18px 14px',
        fontFamily: mono,
        color: '#1F1A14',
        clipPath: 'polygon(0% 8px, 4% 0%, 8% 8px, 12% 0%, 16% 8px, 20% 0%, 24% 8px, 28% 0%, 32% 8px, 36% 0%, 40% 8px, 44% 0%, 48% 8px, 52% 0%, 56% 8px, 60% 0%, 64% 8px, 68% 0%, 72% 8px, 76% 0%, 80% 8px, 84% 0%, 88% 8px, 92% 0%, 96% 8px, 100% 0%, 100% calc(100% - 8px), 96% 100%, 92% calc(100% - 8px), 88% 100%, 84% calc(100% - 8px), 80% 100%, 76% calc(100% - 8px), 72% 100%, 68% calc(100% - 8px), 64% 100%, 60% calc(100% - 8px), 56% 100%, 52% calc(100% - 8px), 48% 100%, 44% calc(100% - 8px), 40% 100%, 36% calc(100% - 8px), 32% 100%, 28% calc(100% - 8px), 24% 100%, 20% calc(100% - 8px), 16% 100%, 12% calc(100% - 8px), 8% 100%, 4% calc(100% - 8px), 0% 100%)',
      }}>
        {/* Header negozio */}
        <div style={{textAlign:'center', marginBottom: 10}}>
          <div style={{
            fontSize: 13, fontWeight: 800, letterSpacing: 1,
            color: data.insegna ? '#1F1A14' : PN.RED,
          }}>
            {(data.insegna || '— manca insegna —').toUpperCase()}
          </div>
          <div style={{fontSize: 10, marginTop: 2}}>{data.indirizzo || '—'}</div>
          <div style={{fontSize: 10}}>{data.cap} {data.citta} ({data.prov})</div>
          <div style={{fontSize: 10, marginTop: 4}}>P.IVA {data.piva || '—'}</div>
        </div>

        <div style={{
          fontSize: 10, letterSpacing: 1.5, textAlign:'center', margin: '4px 0',
          color: '#8A7B5C',
        }}>━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Doc header */}
        <div style={{textAlign:'center', fontSize: 10.5, fontWeight: 700, margin: '6px 0'}}>
          DOCUMENTO COMMERCIALE
        </div>
        <div style={{textAlign:'center', fontSize: 9.5, marginBottom: 8, opacity: 0.85}}>
          di vendita o prestazione
        </div>

        {/* Linee */}
        <div style={{borderTop:'1px dashed #BFB39A', paddingTop: 6, marginBottom: 6}}>
          {rows.map((r, i) => (
            <div key={i} style={{marginBottom: 3}}>
              <div style={{fontSize: 10.5, lineHeight: 1.3}}>{r.desc}</div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 10, color:'#5C5142'}}>
                <span>{r.q} x € {r.p.toFixed(2)}</span>
                <span style={{color:'#1F1A14', fontWeight: 600}}>€ {(r.q*r.p).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtotali */}
        <div style={{borderTop:'1px dashed #BFB39A', paddingTop: 6}}>
          {lineRow('SUBTOTALE', `€ ${totale.toFixed(2)}`)}
          {lineRow('di cui imponibile 10%', `€ ${imponibile.toFixed(2)}`, {color:'#5C5142'})}
          {lineRow('di cui IVA 10%', `€ ${iva.toFixed(2)}`, {color:'#5C5142'})}
        </div>

        {/* Totale */}
        <div style={{
          marginTop: 6, paddingTop: 6, borderTop:'2px solid #1F1A14',
          display:'flex', justifyContent:'space-between',
          fontSize: 13, fontWeight: 800,
        }}>
          <span>TOTALE COMPLESSIVO</span>
          <span>€ {totale.toFixed(2)}</span>
        </div>

        {/* Pagamento */}
        <div style={{marginTop: 10}}>
          {lineRow('PAGAMENTO ELETTRONICO', `€ ${totale.toFixed(2)}`, {fontWeight: 700})}
          {lineRow('Resto', '€ 0,00', {color:'#5C5142'})}
        </div>

        {/* Footer fiscale */}
        <div style={{
          marginTop: 12, paddingTop: 8,
          borderTop: '1px dashed #BFB39A',
          fontSize: 9, color: '#5C5142', lineHeight: 1.5,
        }}>
          <div style={{textAlign:'center'}}>06/03/2026  14:32  DOC.N. 0042-0007</div>
          <div style={{textAlign:'center', marginTop: 4, fontSize: 8.5, opacity: 0.85}}>
            Trasmesso ad Agenzia delle Entrate
          </div>
        </div>

        {/* Barcode mock */}
        <div style={{
          marginTop: 10, display:'flex', justifyContent:'center', gap: 1,
          height: 22, alignItems:'center',
        }}>
          {Array.from({length: 38}).map((_,i) => {
            const w = (i % 4 === 0 ? 2 : (i % 3 === 0 ? 1.5 : 1));
            const h = (i % 5 === 0 ? 22 : 18);
            return <span key={i} style={{
              display:'inline-block', width: w, height: h,
              background: '#1F1A14', opacity: i%2 ? 1 : 0.15,
            }}/>;
          })}
        </div>
      </div>

      <div style={{
        textAlign:'center', fontSize: 10.5, color: PN.MUTED,
        marginTop: 10,
      }}>Esempio dimostrativo · cifre non reali</div>
    </div>
  );
}

window.ImpDatiFiscali = ImpDatiFiscali;

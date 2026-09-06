// Hubble · Impostazioni — recapiti e domini di invio, catalogo delle proprietà.
//
// Vivono nel menu del profilo e non nella barra: si toccano una volta al mese,
// e stavano occupando lo spazio del lavoro di tutti i giorni. Insieme a loro,
// lì dentro, è finita anche «Sicurezza e sistemi» — che è la stessa specie di
// cosa: amministrazione, non operatività.

const { useState: useStateIm, useMemo: useMemoIm } = React;

// ═══════════════════════════════════════════════════════════════════════════
// DOMINI, MITTENTI, NUMERI
// ═══════════════════════════════════════════════════════════════════════════
//
// Le tre cose che decidono se un messaggio arriva davvero. Un dominio senza
// SPF/DKIM/DMARC in ordine non è «configurato a metà»: è un dominio che
// finisce nello spam, e la schermata deve dirlo in quelle parole.
//
// UN CRUSCOTTO E UNA RUBRICA (P-175 · D-127). I domini sono tre e sono nostri:
// aggiungerne uno, mettere i record DNS e verificarli sono atti che si
// compiono una volta sola, sul registrar e sulla console del fornitore di
// invio. Questa schermata non li compie: li MOSTRA, e dichiara da dove
// arrivano i valori. I mittenti invece si scrivono da qui, perché sono quelli
// che l'editor delle campagne pesca e quelli che tengono separati gli scopi;
// e portano ciò che un messaggio deve avere per legge — il recapito di
// risposta, il blocco identificativo in calce, il modo con cui ci si oppone.
// Un mittente si disattiva, non si cancella: le campagne già spedite lo
// nominano.

const IM_STATI_DOM = {
  verificato:  { label: 'Verificato', color: 'OK' },
  'in attesa': { label: 'In attesa',  color: 'WARN' },
  errore:      { label: 'Non valido', color: 'DANGER' },
};
// Gli stati del sottodominio di tracciamento sono i suoi, non quelli dei
// domini di invio: il terzo, «da decidere», un dominio di invio non ce l'ha.
const IM_STATI_TRACC = {
  verificato:    { label: 'Verificato',  color: 'OK' },
  'in attesa':   { label: 'In attesa',   color: 'WARN' },
  'da decidere': { label: 'Da decidere', color: 'DANGER' },
};

function ImRecord({ ok, sigla, spiega }) {
  return (
    <span title={spiega} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 6,
      background: ok ? ADM.OK_SOFT : ADM.DANGER_SOFT, color: ok ? ADM.OK : ADM.DANGER,
      fontSize: 11.6, fontWeight: 800, letterSpacing: '0.03em',
    }}>
      {ok ? <BuIcons.check size={11}/> : <BuIcons.x size={11}/>}{sigla}
    </span>
  );
}

function HubDominiPage() {
  const [tab, setTab] = useStateIm('domini');
  const domini = HUB_DOMINI;
  const tracc = HUB_TRACCIAMENTO;
  const problemi = domini.filter(d => !(d.spf && d.dkim && d.dmarc)).length;

  // I mittenti si scrivono da qui, e restano in uno stato: aggiungerne uno
  // deve aggiungerlo davvero, e le costanti non si muovono.
  const [mittenti, setMittenti] = useStateIm(HUB_MITTENTI);
  const [numeri, setNumeri] = useStateIm(HUB_NUMERI);
  const [nuovo, setNuovo] = useStateIm(null);       // { locale, dominio, nome, scopo, rispostaA, opposizione }
  const [modifica, setModifica] = useStateIm(null); // id del mittente con lo scopo aperto
  const verificati = domini.filter(d => d.stato === 'verificato');
  const scopi = Object.keys(HUB_SCOPI_MITTENTE);
  const senzaInformative = !mittenti.some(m => m.scopo === 'informative' && m.stato !== 'disattivato');

  const apriNuovo = () => setNuovo({ locale: '', dominio: verificati[0] ? verificati[0].dominio : '', nome: 'byup', scopo: 'servizio', rispostaA: '', opposizione: 'Collegamento «non voglio più riceverle» in calce' });
  const nuovoValido = !!nuovo && /^[a-z0-9._%+-]+$/i.test(nuovo.locale.trim()) && !!nuovo.dominio && nuovo.nome.trim().length > 0;
  const aggiungiMittente = () => {
    if (!nuovoValido) return;
    const indirizzo = `${nuovo.locale.trim().toLowerCase()}@${nuovo.dominio}`;
    setMittenti(prev => [...prev, { id: 'MT-' + (prev.length + 1), nome: nuovo.nome.trim(), indirizzo, dominio: nuovo.dominio,
      stato: 'verificato', scopo: nuovo.scopo, rispostaA: (nuovo.rispostaA || '').trim() || indirizzo,
      identificativo: HUB_IDENTIFICATIVO, opposizione: nuovo.opposizione }]);
    setNuovo(null);
  };
  const cambiaScopo = (id, scopo) => { setMittenti(prev => prev.map(m => m.id === id ? { ...m, scopo } : m)); setModifica(null); };
  // Si disattiva, non si cancella: le campagne già spedite lo nominano.
  const disattiva = (id) => setMittenti(prev => prev.map(m => m.id === id ? { ...m, stato: m.stato === 'disattivato' ? 'verificato' : 'disattivato' } : m));
  const cambiaScopoSms = (id, scopo) => { setNumeri(prev => prev.map(n => n.id === id ? { ...n, scopo } : n)); setModifica(null); };
  const disattivaSms = (id) => setNumeri(prev => prev.map(n => n.id === id ? { ...n, stato: n.stato === 'attivo' ? 'disattivato' : 'attivo' } : n));

  const IM_STATI_MITT = { verificato: { label: 'Verificato', color: 'OK' }, 'in attesa': { label: 'In attesa', color: 'WARN' }, disattivato: { label: 'Disattivato', color: 'PLAN_FREE' } };
  const IM_STATI_SMS = { attivo: { label: 'Attivo', color: 'OK' }, 'in attesa': { label: 'In attesa', color: 'WARN' }, disattivato: { label: 'Disattivato', color: 'PLAN_FREE' } };
  const chipScopo = (s) => { const d = HUB_SCOPI_MITTENTE[s] || { label: s || '—', color: 'PLAN_FREE' }; return <HubPillola color={d.color} size="sm">{d.label}</HubPillola>; };
  const menuScopo = (id, corrente, onScegli) => (
    <span style={{ position:'relative', display:'inline-flex' }}>
      <button onClick={() => setModifica(modifica === id ? null : id)} style={{ background:'transparent', border:'none', padding:0, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}>
        {chipScopo(corrente)}
        <BuIcons.chevronDown size={12} color={ADM.MUTED_SOFT}/>
      </button>
      {modifica === id && (
        <span style={{ position:'absolute', top:24, left:0, zIndex:30, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:10, boxShadow:'0 14px 34px rgba(15,17,21,0.16)', padding:5, minWidth:190 }}>
          {scopi.map(s => (
            <button key={s} onClick={() => onScegli(s)} className="adm-actionrow" style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', border:'none', background:'transparent', padding:'6px 8px', borderRadius:7, cursor:'pointer', fontFamily:'inherit' }}>
              {chipScopo(s)}
              {s === corrente && <span style={{ marginLeft:'auto', color:ADM.OK }}><BuIcons.check size={13}/></span>}
            </button>
          ))}
        </span>
      )}
    </span>
  );

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="Recapiti e domini di invio"
        sotto="Da quali domini partono le email, con quali indirizzi si firmano, e con che nome arrivano gli SMS. I domini si configurano presso il fornitore di invio; i mittenti si scrivono qui."
        azioni={<HubStrumento icona="externalLink" title="Nel prototipo non porta da nessuna parte: nel prodotto apre la console del fornitore di invio">Apri la console del fornitore</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Domini configurati" valore={domini.length} icona="globe"
          sotto={problemi ? `${problemi} con record incompleti` : 'tutti a posto'} tono={problemi ? 'WARN' : 'OK'}/>
        <HubTile etichetta="Indirizzi mittente" valore={mittenti.filter(m => m.stato !== 'disattivato').length} icona="mail"
          sotto={`${mittenti.filter(m => m.stato === 'verificato').length} verificati`}/>
        <HubTile etichetta="Mittenti SMS" valore={numeri.filter(n => n.stato !== 'disattivato').length} icona="smartphone"
          sotto={`${numeri.filter(n => n.stato === 'attivo').length} attivi`}/>
        <HubTile etichetta="Reputazione media" valore={Math.round(
          domini.filter(d => d.reputazione).reduce((s, d) => s + d.reputazione, 0) /
          Math.max(1, domini.filter(d => d.reputazione).length)) + '/100'}
          icona="gauge" tono="OK" sotto="Sui domini verificati"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${ADM.BORDER}` }}>
          <HubSegmenti attivo={tab} onCambia={setTab} voci={[
            { id: 'domini', label: 'Domini', conteggio: domini.length },
            { id: 'mittenti', label: 'Indirizzi mittente', conteggio: mittenti.filter(m => m.stato !== 'disattivato').length },
            { id: 'numeri', label: 'Mittenti SMS', conteggio: numeri.filter(n => n.stato !== 'disattivato').length },
          ]}/>
        </div>

        {tab === 'domini' && (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* I domini sono tre e sono nostri: aggiungerne uno, mettere i
                record DNS e verificarli sono atti che si compiono una volta,
                sul registrar e sulla console del fornitore. Questa schermata
                non li compie: li mostra (P-175 · D-127). */}
            <div style={{ padding: '11px 13px', borderRadius: 11, background: '#fff', border: `1px solid ${ADM.BORDER}`, borderLeft: `3px solid ${ADM.PINK}`, fontSize: 12.9, color: ADM.TEXT, lineHeight: 1.55 }}>
              Questi valori arrivano dal fornitore di invio. Domini e record DNS si configurano dal registrar e dalla console del fornitore, non da qui.
            </div>

            {/* Il sottodominio di tracciamento: uno per l'account, e riscrive
                i link invece di spedire. Anche lui si legge e basta. */}
            <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 13, padding: 16, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, flexWrap: 'wrap' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: tracc.stato === 'verificato' ? ADM.OK_SOFT : ADM.WARN_SOFT, color: tracc.stato === 'verificato' ? ADM.OK : ADM.WARN,
                }}><BuIcons.link size={18}/></span>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontSize: 11.2, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Sottodominio di tracciamento</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginTop: 4 }}>
                    <span style={{ fontSize: 15.4, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{tracc.dominio || 'Nessuno scelto'}</span>
                    <HubStato stato={tracc.stato} mappa={IM_STATI_TRACC}/>
                  </div>
                  <div style={{ fontSize: 13, color: ADM.MUTED, marginTop: 6, lineHeight: 1.5 }}>
                    Ogni link nei messaggi, email e SMS, viene riscritto su questo dominio per contare i clic. Senza, sotto il pulsante il destinatario vede il dominio del fornitore, che non conosce.
                  </div>
                  {tracc.decisoIl && <div style={{ fontSize: 12.4, color: ADM.MUTED_SOFT, marginTop: 6 }}>Deciso il {fmtDate(tracc.decisoIl)}{tracc.verificatoIl ? ` · verificato il ${fmtDate(tracc.verificatoIl)}` : ''}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <ImRecord ok={tracc.cname} sigla="CNAME" spiega={`${tracc.dominio} → ${tracc.bordo}`}/>
                  <ImRecord ok={tracc.certificato} sigla="HTTPS" spiega="Il certificato che il fornitore emette quando il CNAME risponde"/>
                </div>
              </div>
            </div>

            {domini.map(d => {
              const ok = d.spf && d.dkim && d.dmarc;
              return (
                <div key={d.id} style={{
                  border: `1px solid ${ok ? ADM.BORDER : '#F0DCB4'}`, borderRadius: 13, padding: 16,
                  background: ok ? '#fff' : '#FFFCF5',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, flexWrap: 'wrap' }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center',
                      background: ok ? ADM.OK_SOFT : ADM.WARN_SOFT, color: ok ? ADM.OK : ADM.WARN,
                    }}><BuIcons.globe size={18}/></span>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15.4, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{d.dominio}</span>
                        <HubStato stato={d.stato} mappa={IM_STATI_DOM}/>
                      </div>
                      <div style={{ fontSize: 13, color: ADM.MUTED, marginTop: 3 }}>{d.uso}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <ImRecord ok={d.spf} sigla="SPF" spiega="Dice quali server possono spedire per questo dominio"/>
                      <ImRecord ok={d.dkim} sigla="DKIM" spiega="Firma le email in uscita: prova che non sono state alterate"/>
                      <ImRecord ok={d.dmarc} sigla="DMARC" spiega="Dice ai destinatari cosa fare quando SPF o DKIM falliscono"/>
                    </div>
                    {d.reputazione != null && (
                      <div style={{ width: 120, flexShrink: 0 }}>
                        <div style={{ fontSize: 11.2, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 5 }}>Reputazione {d.reputazione}</div>
                        <HubBarra valore={d.reputazione} max={100} color={d.reputazione > 90 ? 'OK' : 'WARN'} altezza={5}/>
                        {d.verificato && <div style={{ fontSize: 11.4, color: ADM.MUTED_SOFT, marginTop: 4 }}>rilevata il {fmtDate(d.verificato)}</div>}
                      </div>
                    )}
                  </div>
                  {/* La conseguenza, non il rimedio: si rimedia altrove. */}
                  {!ok && (
                    <div style={{ marginTop: 13, padding: 12, borderRadius: 10, background: '#fff', border: `1px solid ${ADM.BORDER}`, fontSize: 12.8, color: ADM.TEXT, lineHeight: 1.55 }}>
                      <strong>Manca {[!d.spf && 'SPF', !d.dkim && 'DKIM', !d.dmarc && 'DMARC'].filter(Boolean).join(' e ')}.</strong>{' '}
                      Finché manca, i messaggi di questo dominio finiscono nello spam. Si sistema dal registrar e dalla console del fornitore.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'mittenti' && (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260, fontSize: 12.9, color: ADM.MUTED, lineHeight: 1.55 }}>
                Gli indirizzi da cui partono le email, su un dominio verificato. Lo scopo tiene separato quello che deve restare separato: chi si oppone alle promozioni continua a ricevere il servizio.
              </div>
              <HubStrumento forte icona="plus" onClick={apriNuovo} title={verificati.length ? undefined : 'Serve almeno un dominio verificato: si configura presso il fornitore'}>Aggiungi mittente</HubStrumento>
            </div>
            {!verificati.length && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', fontSize: 12.8, color: '#7A4A0B' }}>
                Nessun dominio verificato: finché non ce n'è uno, un mittente non si può aggiungere.
              </div>
            )}
            {senzaInformative && (
              <div data-senza-informative style={{ padding: '10px 12px', borderRadius: 10, background: ADM.WARN_SOFT, border: '1px solid #F0DCB4', fontSize: 12.8, color: '#7A4A0B', lineHeight: 1.5 }}>
                Nessun mittente per gli <b>avvisi sulle informative</b>. Quella comunicazione non può partire da un mittente promozionale: assegna lo scopo a uno di questi indirizzi.
              </div>
            )}
            {mittenti.map(m => (
              <div key={m.id} data-mittente={m.id} style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 13, padding: 15, background: m.stato === 'disattivato' ? ADM.PANEL_SOFT : '#fff', opacity: m.stato === 'disattivato' ? 0.75 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: ADM.PINK_SOFT, color: ADM.PINK }}><BuIcons.mail size={16}/></span>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14.6, fontWeight: 700, color: ADM.TEXT }}>{m.nome}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: ADM.MUTED }}>{m.indirizzo}</span>
                      {m.predefinito && <HubPillola color="PINK" size="sm">predefinito</HubPillola>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7, flexWrap: 'wrap' }}>
                      {menuScopo(m.id, m.scopo, (s) => cambiaScopo(m.id, s))}
                      <HubStato stato={m.stato} mappa={IM_STATI_MITT}/>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 10, fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5 }}>
                      <div><b style={{ color: ADM.TEXT }}>Risposte a</b><br/><span style={{ fontFamily: 'ui-monospace, monospace' }}>{m.rispostaA || m.indirizzo}</span></div>
                      <div><b style={{ color: ADM.TEXT }}>Ci si oppone</b><br/>{m.opposizione || '—'}</div>
                      <div style={{ gridColumn: '1 / -1' }}><b style={{ color: ADM.TEXT }}>In calce</b><br/>{m.identificativo || HUB_IDENTIFICATIVO}</div>
                    </div>
                  </div>
                  <HubStrumento icona={m.stato === 'disattivato' ? 'refresh' : 'pause'} onClick={() => disattiva(m.id)}
                    title="Un mittente si disattiva, non si cancella: le campagne già spedite lo nominano">{m.stato === 'disattivato' ? 'Riattiva' : 'Disattiva'}</HubStrumento>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'numeri' && (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12.9, color: ADM.MUTED, lineHeight: 1.55 }}>
              Con che nome arrivano gli SMS, per quale scopo, e come ci si oppone. Una sigla alfanumerica non riceve risposte: per le promozioni l'opposizione dev'essere un collegamento o il rimando all'app, mai «rispondi STOP».
            </div>
            {numeri.map(n => {
              const male = n.scopo === 'promozioni' && n.tipo === 'Mittente alfanumerico' && n.opposizione === 'risposta';
              return (
                <div key={n.id} data-sms={n.id} style={{ border: `1px solid ${male ? '#F0DCB4' : ADM.BORDER}`, borderRadius: 13, padding: 15, background: male ? '#FFFCF5' : (n.stato === 'disattivato' ? ADM.PANEL_SOFT : '#fff'), opacity: n.stato === 'disattivato' ? 0.75 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: ADM.TEAL_SOFT, color: ADM.TEAL }}><BuIcons.smartphone size={16}/></span>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14.6, fontWeight: 700, color: ADM.TEXT }}>{n.etichetta}</span>
                        <span style={{ fontSize: 12.6, color: ADM.MUTED }}>{n.tipo} · {n.paesi}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7, flexWrap: 'wrap' }}>
                        {menuScopo(n.id, n.scopo, (s) => cambiaScopoSms(n.id, s))}
                        <HubStato stato={n.stato} mappa={IM_STATI_SMS}/>
                        <span style={{ fontSize: 12.4, color: ADM.MUTED_SOFT, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(n.usato)} SMS spediti</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 10, fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5 }}>
                        <div><b style={{ color: ADM.TEXT }}>Identità nel messaggio</b><br/>{n.identita || '—'}</div>
                        <div><b style={{ color: ADM.TEXT }}>Ci si oppone</b><br/>{n.opposizioneTesto || '—'}</div>
                      </div>
                      {male && (
                        <div style={{ marginTop: 9, padding: '9px 11px', borderRadius: 9, background: '#fff', border: '1px solid #F0DCB4', fontSize: 12.4, color: '#7A4A0B', lineHeight: 1.5 }}>
                          Una sigla alfanumerica non riceve risposte: con lo scopo promozionale l'opposizione dev'essere un collegamento o il rimando all'app.
                        </div>
                      )}
                    </div>
                    <HubStrumento icona={n.stato === 'disattivato' ? 'refresh' : 'pause'} onClick={() => disattivaSms(n.id)}
                      title="Si disattiva, non si cancella: i messaggi già spediti lo nominano">{n.stato === 'disattivato' ? 'Riattiva' : 'Disattiva'}</HubStrumento>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdmCard>

      <HubModale open={!!nuovo} onClose={() => setNuovo(null)} larghezza={560}
        titolo="Aggiungi un indirizzo mittente" sotto="Su un dominio già verificato: i domini si configurano presso il fornitore di invio."
        footer={
          <React.Fragment>
            <div style={{ flex: 1 }}/>
            <HubStrumento onClick={() => setNuovo(null)}>Annulla</HubStrumento>
            <HubStrumento forte icona="check" onClick={aggiungiMittente}>Aggiungi</HubStrumento>
          </React.Fragment>
        }>
        {nuovo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <HubCampo label="Nome mittente" nota="È quello che il destinatario legge come «da».">
              <HubInput valore={nuovo.nome} onCambia={v => setNuovo(n => ({ ...n, nome: v }))} placeholder="byup"/>
            </HubCampo>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 12, alignItems: 'end' }}>
              <HubCampo label="Indirizzo">
                <HubInput valore={nuovo.locale} onCambia={v => setNuovo(n => ({ ...n, locale: v.replace(/[^a-zA-Z0-9._%+-]/g, '') }))} placeholder="novita"/>
              </HubCampo>
              <HubCampo label="Dominio verificato">
                <select value={nuovo.dominio} onChange={e => setNuovo(n => ({ ...n, dominio: e.target.value }))}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid ${ADM.BORDER}`, fontFamily: 'inherit', fontSize: 13.5, color: ADM.TEXT, background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}>
                  {verificati.map(d => <option key={d.id} value={d.dominio}>@{d.dominio}</option>)}
                </select>
              </HubCampo>
            </div>
            <HubCampo label="Scopo" nota="Tiene separato quello che deve restare separato: una comunicazione sulle informative non parte da un mittente promozionale.">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {scopi.map(s => (
                  <button key={s} onClick={() => setNuovo(n => ({ ...n, scopo: s }))} style={{
                    padding: '7px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                    border: `1px solid ${nuovo.scopo === s ? ADM.TEXT : ADM.BORDER}`, background: nuovo.scopo === s ? ADM.TEXT : '#fff', color: nuovo.scopo === s ? '#fff' : ADM.TEXT,
                  }}>{HUB_SCOPI_MITTENTE[s].label}</button>
                ))}
              </div>
            </HubCampo>
            <HubCampo label="Risposte a" nota="Vuoto: rispondono all'indirizzo stesso.">
              <HubInput valore={nuovo.rispostaA} onCambia={v => setNuovo(n => ({ ...n, rispostaA: v }))} placeholder="ciao@byup.it"/>
            </HubCampo>
            <div style={{ fontSize: 12.4, color: ADM.MUTED, lineHeight: 1.5, padding: '10px 12px', borderRadius: 10, background: ADM.PANEL_SOFT }}>
              In calce viene riportato il blocco identificativo: <b style={{ color: ADM.TEXT }}>{HUB_IDENTIFICATIVO}</b>. I dati societari sono segnaposto finché la società non è costituita.
            </div>
          </div>
        )}
      </HubModale>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPRIETÀ
// ═══════════════════════════════════════════════════════════════════════════
//
// Il catalogo dei campi di un contatto. Quelle di sistema le scrive byup e non
// si cancellano; le altre le crea il team — ed è da qui che nascono «ID
// campagna» e «Referral», i campi che i form e i workflow riempiono da soli e
// su cui poi si filtra.

const IM_TIPI_PROP = [
  { id: 'testo',  label: 'Testo',            desc: 'Una riga libera. Si filtra con contiene, è uguale a, è noto.' },
  { id: 'elenco', label: 'Menu a discesa',   desc: 'Una voce fra quelle che decidi tu. Si filtra con è uno di.' },
  { id: 'multi',  label: 'Scelta multipla',  desc: 'Più voci insieme. Si filtra con contiene almeno uno.' },
  { id: 'numero', label: 'Numero',           desc: 'Si filtra con maggiore di, minore di, compreso tra.' },
  { id: 'data',   label: 'Data',             desc: 'Si filtra con successiva a, precedente a, negli ultimi N giorni.' },
  { id: 'bool',   label: 'Sì / No',          desc: 'Una spunta. Si filtra con è sì, è no.' },
  { id: 'valuta', label: 'Importo',          desc: 'Un numero in euro, formattato come tale.' },
];

function HubProprietaPage() {
  const [cerca, setCerca] = useStateIm('');
  const [gruppo, setGruppo] = useStateIm('');
  const [vista, setVista] = useStateIm('tutte');
  const [crea, setCrea] = useStateIm(false);
  const [nuova, setNuova] = useStateIm({ label: '', gruppo: 'acquisizione', tipo: 'testo', opzioni: '', nota: '' });
  // In uno stato, non sulla costante: «Crea proprietà» deve creare davvero,
  // e la riga nuova deve comparire qui sotto, nella stessa tabella.
  const [proprieta, setProprieta] = useStateIm(HUB_PROPRIETA);

  const lista = useMemoIm(() => {
    const q = cerca.trim().toLowerCase();
    return proprieta.filter(p =>
      (vista === 'tutte' || (vista === 'sistema' ? p.sistema : !p.sistema)) &&
      (!gruppo || p.gruppo === gruppo) &&
      (!q || p.label.toLowerCase().includes(q)));
  }, [cerca, gruppo, vista, proprieta]);

  // Quante righe della rubrica hanno un valore per questa proprietà: una
  // proprietà personalizzata vuota al 99% è una proprietà che nessuno compila,
  // e vale la pena saperlo prima di costruirci sopra un segmento.
  const riempimento = useMemoIm(() => {
    const m = {};
    proprieta.forEach(p => {
      const n = CONTATTI.filter(c => {
        const v = hubLeggi(c, p.id);
        return !(v == null || v === '' || (Array.isArray(v) && !v.length));
      }).length;
      m[p.id] = n;
    });
    return m;
  }, [proprieta]);

  const custom = proprieta.filter(p => !p.sistema).length;

  const creaProprieta = () => {
    const label = nuova.label.trim();
    if (!label) return;
    // L'id nasce dal nome, come quelli di sistema: leggibile nei filtri, non
    // un progressivo — e se il nome è già preso si accoda un numero.
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'proprieta';
    let id = base, k = 2;
    while (proprieta.some(p => p.id === id)) id = base + '_' + (k++);
    const opzioni = (nuova.tipo === 'elenco' || nuova.tipo === 'multi')
      ? nuova.opzioni.split('\n').map(s => s.trim()).filter(Boolean).map(v => ({ value: v, label: v }))
      : null;
    // Niente `sistema`: è la pillola «Personalizzata». `colonna` c'è dalla
    // nascita, come promette il box in fondo al modale. Compilata parte da
    // zero: nessun contatto ha ancora un valore, e la barra lo deve dire.
    setProprieta(prev => [...prev, {
      id, label, gruppo: nuova.gruppo, tipo: nuova.tipo, colonna: { w: '1.1fr' },
      ...(opzioni && opzioni.length ? { opzioni } : {}),
      ...(nuova.nota.trim() ? { nota: nuova.nota.trim() } : {}),
    }]);
    setNuova({ label: '', gruppo: 'acquisizione', tipo: 'testo', opzioni: '', nota: '' });
    setCrea(false);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="Proprietà"
        sotto="I campi di un contatto. Quelle di sistema le scrive byup; le altre le crei tu — e si riempiono da sole con le submission dei form e con i workflow."
        azioni={<HubStrumento forte icona="plus" onClick={() => setCrea(true)}>Crea proprietà</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Proprietà totali" valore={proprieta.length} icona="tag"
          sotto={`${proprieta.length - custom} di sistema · ${custom} personalizzate`}/>
        <HubTile etichetta="Usabili come colonna" valore={proprieta.filter(p => p.colonna).length} icona="columns"
          sotto="Compaiono in «Modifica colonne»"/>
        <HubTile etichetta="Riempite da automazioni" valore={proprieta.filter(p => p.nota).length} icona="bolt" tono="HUB_VIOLA"
          sotto="Form e workflow ci scrivono dentro"/>
        <HubTile etichetta="Gruppi" valore={HUB_GRUPPI_PROP.length} icona="layers" sotto="Servono a ritrovarle, non a limitarle"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}`, flexWrap: 'wrap' }}>
          <HubSegmenti attivo={vista} onCambia={setVista} voci={[
            { id: 'tutte', label: 'Tutte', conteggio: proprieta.length },
            { id: 'sistema', label: 'Di sistema', conteggio: proprieta.length - custom },
            { id: 'custom', label: 'Personalizzate', conteggio: custom },
          ]}/>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca una proprietà…" larghezza={230}/>
          <div style={{ flex: 1 }}/>
          <AdmSelect value={gruppo} onChange={setGruppo}
            options={[{ value: '', label: 'Tutti i gruppi' }, ...HUB_GRUPPI_PROP.map(g => ({ value: g.id, label: g.label }))]}/>
        </div>

        <HubTabella
          colonne={[
            { id: 'label',  label: 'Proprietà',   w: 'minmax(0,2.2fr)' },
            { id: 'gruppo', label: 'Gruppo',      w: '1.3fr' },
            { id: 'tipo',   label: 'Tipo',        w: '1.2fr' },
            { id: 'origine',label: 'Origine',     w: '1.1fr' },
            { id: 'pieno',  label: 'Compilata',   w: '1.3fr' },
          ]}
          righe={lista} chiave={p => p.id}
          cella={(id, p) => {
            if (id === 'label') return (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.2, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                <div style={{ fontSize: 12.2, color: ADM.MUTED_SOFT, marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>{p.id}</div>
              </div>
            );
            if (id === 'gruppo') return <span style={{ fontSize: 13.3, color: ADM.MUTED }}>{(HUB_GRUPPI_PROP.find(g => g.id === p.gruppo) || {}).label}</span>;
            if (id === 'tipo') return <HubPillola color={p.tipo === 'data' ? 'INFO' : p.tipo === 'numero' || p.tipo === 'valuta' ? 'TEAL' : p.tipo === 'bool' ? 'WARN' : p.tipo === 'multi' ? 'PURPLE' : 'PLAN_FREE'}>
              {(IM_TIPI_PROP.find(t => t.id === p.tipo) || {}).label || p.tipo}</HubPillola>;
            if (id === 'origine') return p.sistema
              ? <span style={{ fontSize: 13.2, color: ADM.MUTED }}>Sistema</span>
              : <HubPillola color="HUB_VIOLA">Personalizzata</HubPillola>;
            const n = riempimento[p.id] || 0;
            return (
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12.8, fontWeight: 700, color: ADM.TEXT, fontVariantNumeric: 'tabular-nums' }}>{mkPc(n, CONTATTI.length)}</span>
                  <span style={{ fontSize: 12, color: ADM.MUTED_SOFT }}>{fmtNum(n)} contatti</span>
                </div>
                <HubBarra valore={n} max={CONTATTI.length} color={n / CONTATTI.length > 0.5 ? 'OK' : 'WARN'} altezza={4}/>
              </div>
            );
          }}
          vuoto={<HubVuoto icona="tag" titolo="Nessuna proprietà" desc="Cambia i filtri, oppure creane una nuova."/>}/>
      </AdmCard>

      <HubModale open={crea} onClose={() => setCrea(false)} larghezza={620}
        titolo="Crea una proprietà"
        sotto="Il tipo decide gli operatori con cui si potrà filtrare — è la scelta che conta davvero."
        footer={
          <React.Fragment>
            <div style={{ flex: 1 }}/>
            <HubStrumento onClick={() => setCrea(false)}>Annulla</HubStrumento>
            <HubStrumento forte icona="check" onClick={creaProprieta}>Crea proprietà</HubStrumento>
          </React.Fragment>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr)', gap: 12 }}>
            <HubCampo label="Nome" nota="Come apparirà in lista, nei filtri e nei form.">
              <HubInput valore={nuova.label} onCambia={v => setNuova(n => ({ ...n, label: v }))} placeholder="es. ID campagna"/>
            </HubCampo>
            <HubCampo label="Gruppo">
              <AdmSelect block value={nuova.gruppo} onChange={v => setNuova(n => ({ ...n, gruppo: v }))}
                options={HUB_GRUPPI_PROP.map(g => ({ value: g.id, label: g.label }))}/>
            </HubCampo>
          </div>

          <HubCampo label="Tipo">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
              {IM_TIPI_PROP.map(t => {
                const on = nuova.tipo === t.id;
                return (
                  <button key={t.id} onClick={() => setNuova(n => ({ ...n, tipo: t.id }))} style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK_BG_SOFT : '#fff',
                  }}>
                    <div style={{ fontSize: 13.8, fontWeight: 700, color: on ? ADM.PINK_DARK : ADM.TEXT }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: ADM.MUTED, marginTop: 3, lineHeight: 1.4 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </HubCampo>

          {(nuova.tipo === 'elenco' || nuova.tipo === 'multi') && (
            <HubCampo label="Le voci" nota="Una per riga. Si potranno aggiungere anche dopo, senza perdere i dati già scritti.">
              <HubArea valore={nuova.opzioni} onCambia={v => setNuova(n => ({ ...n, opzioni: v }))} righe={4}
                placeholder={'Passaparola\nGoogle\nFiera\nSocial'}/>
            </HubCampo>
          )}

          <HubCampo label="Nota per chi la userà" nota="Compare sotto il nome nel listino delle proprietà.">
            <HubInput valore={nuova.nota} onCambia={v => setNuova(n => ({ ...n, nota: v }))}
              placeholder="es. Scritta dal parametro utm_campaign sul primo contatto"/>
          </HubCampo>

          <div style={{ padding: 13, borderRadius: 11, background: ADM.HUB_GRAD_SOFT, border: '1px solid #F2DDEE', fontSize: 12.8, color: ADM.TEXT, lineHeight: 1.6 }}>
            Appena creata, questa proprietà comparirà in <strong>Modifica colonne</strong>, nel pannello dei <strong>filtri</strong>, fra le destinazioni dei campi di un <strong>form</strong> e fra le cose che un <strong>workflow</strong> può scrivere. Non serve abilitarla da nessuna parte.
          </div>
        </div>
      </HubModale>
    </div>
  );
}

window.HubDominiPage = HubDominiPage;
window.HubProprietaPage = HubProprietaPage;
window.IM_TIPI_PROP = IM_TIPI_PROP;


// ─── Incaricati Fisconline: non esiste più (P-116 · D-103) ──────────────────
// Qui stava il registro byup_incaricati con la scheda «Incaricati
// Fisconline»: persone di Byup che ogni società avrebbe nominato incaricate
// sul portale dell'Agenzia, con la password rinnovata da Hubble. Nessuna
// decisione lo aveva stabilito, e D-103 lo ritira: l'incaricato è della
// società (specifiche RT §2.9), lo nomina la società dal proprio profilo sul
// portale, le credenziali sono sue e il rinnovo lo fa quella persona — Byup
// non ne è parte. Da Hubble non si compie nessun atto di nomina: chi è
// l'incaricato di una società si LEGGE nella scheda del locale, Dati fiscali
// (hubIncaricatoDi in admin-data.jsx, dai Dati fiscali del gestionale).

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRO DELLE DELEGHE (P-52 · D-40)
// ═══════════════════════════════════════════════════════════════════════════
// Serve a Byup, non al locale: l'elenco numerato progressivo dei
// conferimenti e delle revoche della delega unica degli esercenti, per
// giorno, con le scadenze in avvicinamento e il responsabile della gestione.
// È ciò che l'Agenzia può chiedere di esibire anche in sede. Solo deleghe:
// l'incaricato che una società nomina sul portale è un atto della società,
// non di Byup (D-103), e si legge nella scheda del locale.
function HubDeleghePage() {
  const [, ridisegna] = useStateIm(0);
  const righe = DELEGHE.slice().sort((a, b) => b.n - a.n);
  const avvicinamento = delInAvvicinamento();
  const nomeLocale = (id) => (LOCALI.find(l => l.id === id) || { nome: id }).nome;
  const membri = (typeof TEAM !== 'undefined' ? TEAM : []).filter(t => t.attivo !== false);
  const gg = (d) => Math.ceil((d.getTime() - Date.now()) / 86400000);
  const atto = (a) => a === 'conferimento' ? { label: 'Conferimento', color: 'OK' } : a === 'revoca' ? { label: 'Revoca', color: 'DANGER' } : { label: 'Rinnovo', color: 'INFO' };
  return (
    <div style={{padding:'18px 22px 26px', display:'flex', flexDirection:'column', gap:14}}>
      <div style={{padding:'12px 14px', borderRadius:10, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderLeft:`3px solid ${ADM.PINK}`, fontSize:13.6, color:ADM.TEXT, lineHeight:1.5}}>
        <b>Il registro delle deleghe degli esercenti.</b> Ogni conferimento e ogni revoca della delega unica a Byup — due servizi: {DEL_SERVIZI[0].toLowerCase()}, {DEL_SERVIZI[1].toLowerCase()} — ha il suo numero progressivo e il suo giorno. La scadenza è ancorata al conferimento (31 dicembre del quarto anno successivo, lettura dichiarata: il portale la conferma); «verificata il» è il riscontro del portale. È il registro che l'Agenzia può chiedere di esibire, anche presentandosi in sede.
        <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:6}}>Solo deleghe. L'incaricato che una società nomina sul portale dell'Agenzia per trasmettere i corrispettivi (specifiche RT §2.9) è un atto della società, non di Byup: si legge nella scheda del locale, in Dati fiscali. Byup non nomina incaricati e non rinnova credenziali per conto di nessuno.</div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'minmax(0,1.4fr) minmax(0,1fr)', gap:12}}>
        <div style={{padding:'14px 16px', borderRadius:12, background: avvicinamento.length ? ADM.WARN_SOFT : '#fff', border:`1px solid ${avvicinamento.length ? '#F0DCB4' : ADM.BORDER}`}}>
          <div style={{fontSize:13.5, fontWeight:800, color:ADM.TEXT}}>Scadenze in avvicinamento</div>
          {avvicinamento.length === 0 && <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4}}>Nessuna delega scade nei prossimi 120 giorni.</div>}
          {avvicinamento.map(d => (
            <div key={d.n} style={{fontSize:12.8, color:ADM.TEXT, marginTop:6, lineHeight:1.5}}>
              <b>n. {d.n} · {nomeLocale(d.localeId)}</b> scade il {fmtDate(d.scadenza)} (fra {gg(d.scadenza)} giorni) · promemoria di rinnovo da inviare entro il {fmtDate(new Date(d.scadenza.getTime() - 31 * 86400000))} — la mail «La delega a Byup scade il 31 dicembre: rinnovala» parte a 30 giorni dalla scadenza.
            </div>
          ))}
        </div>
        <div style={{padding:'14px 16px', borderRadius:12, background:'#fff', border:`1px solid ${ADM.BORDER}`}}>
          <div style={{fontSize:11.2, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:ADM.MUTED_SOFT, marginBottom:6}}>Responsabile della gestione</div>
          {/* Un campo del registro: chi risponde del registro, non chi ha
              fatto l'ultimo atto. Si cambia qui e le righe nuove lo prendono. */}
          <AdmSelect block value={DEL_GESTIONE.responsabileNome} onChange={v => { DEL_GESTIONE.responsabileNome = v; ridisegna(x => x + 1); }}
            options={[...new Set([DEL_GESTIONE.responsabileNome, ...membri.map(m => m.nomeCompleto || m.nome)])].map(n => ({ value: n, label: n }))}/>
          <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:6, lineHeight:1.45}}>Risponde della tenuta del registro e dei promemoria di rinnovo. Le deleghe le conferisce e le revoca l'esercente, sul portale.</div>
        </div>
      </div>

      <div style={{background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'48px 92px 108px minmax(0,1.2fr) 118px minmax(0,1.1fr) 108px 100px 100px minmax(0,1.25fr) minmax(0,1.1fr)', gap:10, padding:'10px 14px', borderBottom:`1px solid ${ADM.BORDER}`, fontSize:11.2, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:ADM.MUTED_SOFT}}>
          <span>N.</span><span>Giorno</span><span>Atto</span><span>Locale · P.IVA</span><span>CF delegante · delegato</span><span>Servizio</span><span>Scadenza</span><span>Verificata il</span><span>Atto di Byup</span><span>Responsabile</span><span>Note</span>
        </div>
        {righe.map(d => {
          const a = atto(d.atto);
          return (
            <div key={d.n} style={{display:'grid', gridTemplateColumns:'48px 92px 108px minmax(0,1.2fr) 118px minmax(0,1.1fr) 108px 100px 100px minmax(0,1.25fr) minmax(0,1.1fr)', gap:10, padding:'10px 14px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, fontSize:12.8, color:ADM.TEXT, alignItems:'start'}}>
              <span style={{fontFamily:'ui-monospace,monospace', fontWeight:700}}>{String(d.n).padStart(3, '0')}</span>
              <span>{fmtDate(d.giorno)}</span>
              <span><AdmBadge color={a.color} size="xs">{a.label}</AdmBadge></span>
              <span><b>{nomeLocale(d.localeId)}</b><br/><span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED}}>{d.piva}</span></span>
              {/* I due codici fiscali che il provvedimento richiede (P-156.4). */}
              <span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED, lineHeight:1.5}}>{d.cfDelegante}<br/>{d.cfDelegato}</span>
              <span style={{fontSize:11.8, color:ADM.TEXT, lineHeight:1.4}}>{d.servizio}</span>
              <span>{d.scadenza ? fmtDate(d.scadenza) : '—'}</span>
              <span>{fmtDate(d.verificataIl)}</span>
              {/* L'atto di una persona di Byup che segue questa riga (P-170 ·
                  D-119): fatto, con data e nome; o da fare, e lo segna il
                  responsabile della gestione. Niente su una revoca. */}
              <span style={{fontSize:11.8, lineHeight:1.4}}>{(() => {
                if (d.atto === 'revoca') return <span style={{color:ADM.MUTED_SOFT}}>—</span>;
                const quale = delAttoDiServizio(d); const a = delAtti(d)[quale];
                return (
                  <React.Fragment>
                    <b>{DEL_ATTI_TIPI[quale]}</b><br/>
                    {a
                      ? <span style={{color:ADM.MUTED}}>fatta il {fmtDate(a.il)} da {a.da}</span>
                      : <AdmButton variant="secondary" size="sm" data-segna-fatta={quale} title={`La segna il responsabile della gestione: ${DEL_GESTIONE.responsabileNome}`}
                          onClick={() => { delSegnaAtto(d, quale, DEL_GESTIONE.responsabileNome); ridisegna(x => x + 1); }}>Segna fatta</AdmButton>}
                  </React.Fragment>
                );
              })()}</span>
              <span>{d.responsabile}</span>
              <span style={{fontSize:12, color:ADM.MUTED, lineHeight:1.45}}>{d.note || '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.HubDeleghePage = HubDeleghePage;

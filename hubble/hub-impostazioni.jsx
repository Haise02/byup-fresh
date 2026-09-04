// Hubble · Impostazioni — domini e mittenti, catalogo delle proprietà.
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
  const [aggiungi, setAggiungi] = useStateIm(false);
  const [nuovoDom, setNuovoDom] = useStateIm('');
  // In uno stato, non sulla costante: «Aggiungi dominio» deve aggiungere
  // davvero, e HUB_DOMINI non si muove.
  const [domini, setDomini] = useStateIm(HUB_DOMINI);
  // Esiti per dominio, non un flag solo: di card gialle può essercene più
  // d'una a video, e l'esito deve restare accanto al bottone premuto.
  const [copiato, setCopiato] = useStateIm(null);    // id del dominio coi record in clipboard
  const [verifica, setVerifica] = useStateIm(null);  // { id, esito } — esito null = ricontrollo in corso

  const problemi = domini.filter(d => !(d.spf && d.dkim && d.dmarc)).length;

  // ─── Il sottodominio di tracciamento (P-57 · D-48) ─────────────────────
  // Uno per account e fuori dalla lista: non spedisce, riscrive. Ogni link
  // nei messaggi, email e SMS, passa di qui per contare i clic — è il presidio
  // dei clic che P-36 lascia in piedi, col limite di PRIV-07. Non ha SPF,
  // DKIM o DMARC: ha UN CNAME verso il bordo del fornitore e il certificato
  // che il fornitore emette quando il CNAME risponde, e la verifica è la sua.
  // Va deciso prima del primo invio: i link già spediti puntano al dominio con
  // cui sono stati riscritti, e cambiarlo dopo li rompe — a primo invio
  // fatto il nome è in sola lettura. `?tracciamento=nuovo` mostra lo stato
  // «da decidere» di chi non l'ha ancora scelto (demo).
  const [tracc, setTracc] = useStateIm(() => {
    let nuovo = false;
    try { nuovo = new URLSearchParams(window.location.search).get('tracciamento') === 'nuovo'; } catch (e) {}
    return nuovo
      ? Object.assign({}, HUB_TRACCIAMENTO, { dominio: null, stato: 'da decidere', cname: false, certificato: false, decisoIl: null, verificatoIl: null })
      : HUB_TRACCIAMENTO;
  });
  const [scegli, setScegli] = useStateIm(false);
  const [nuovoTracc, setNuovoTracc] = useStateIm('');
  const [verificaTracc, setVerificaTracc] = useStateIm(null); // null | 'corso' | testo dell'esito
  // Il primo invio letto dalle campagne: da lì in poi i link spediti sono
  // legati a questo nome.
  const primoInvio = HUB_MAIL.filter(m => m.inviata).reduce((min, m) => (!min || m.inviata < min) ? m.inviata : min, null);
  const traccBloccato = !!(tracc.dominio && tracc.decisoIl && primoInvio && primoInvio > tracc.decisoIl);
  const decidiTracc = () => {
    const dom = nuovoTracc.trim().toLowerCase();
    if (!dom) return;
    setTracc(t => Object.assign({}, t, { dominio: dom, stato: 'in attesa', cname: false, certificato: false, decisoIl: new Date(), verificatoIl: null }));
    setNuovoTracc(''); setScegli(false); setVerificaTracc(null);
  };
  const verificaCname = () => {
    setVerificaTracc('corso');
    setTimeout(() => {
      // Come per i domini: l'esito viene dal mock, non è un successo di
      // cortesia. Il CNAME appena deciso non risponde ancora.
      if (tracc.cname) {
        setTracc(t => Object.assign({}, t, { stato: 'verificato', certificato: true, verificatoIl: t.verificatoIl || new Date() }));
        setVerificaTracc('CNAME a posto e certificato emesso: i link riscritti rispondono.');
      } else {
        setVerificaTracc('Il CNAME non risponde ancora — la propagazione impiega fino a qualche ora. Finché non risponde, i link partono sul dominio del fornitore.');
      }
    }, 900);
  };

  const aggiungiDominio = () => {
    const dom = nuovoDom.trim().toLowerCase();
    if (!dom) return;
    // Nasce coi tre record mancanti: la card gialla coi comandi per
    // sistemarla è esattamente quello che il modale promette.
    setDomini(prev => [...prev, {
      id: 'DM-' + (prev.length + 1), dominio: dom, uso: 'Aggiunto ora — record DNS da mettere dal registrar',
      stato: 'in attesa', spf: false, dkim: false, dmarc: false, verificato: null, reputazione: null,
    }]);
    setNuovoDom('');
    setAggiungi(false);
  };

  const copiaRecord = (d) => {
    // Sempre tutti e tre: il registrar li vuole insieme, e copiare solo i
    // mancanti costringerebbe a un secondo giro.
    const txt = [
      `TXT  ${d.dominio}  "v=spf1 include:_spf.byup.it ~all"`,
      `TXT  byup._domainkey.${d.dominio}  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7…"`,
      `TXT  _dmarc.${d.dominio}  "v=DMARC1; p=quarantine; rua=mailto:postmaster@byup.it"`,
    ].join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(() => {});
    setCopiato(d.id);
    setTimeout(() => setCopiato(c => c === d.id ? null : c), 2500);
  };

  const verificaAdesso = (d) => {
    setVerifica({ id: d.id, esito: null });   // il ricontrollo si deve vedere partire
    setTimeout(() => {
      // L'esito viene dai record del mock, che non cambiano: la verifica dice
      // la verità — mancano ancora — non un successo di cortesia.
      const mancano = [!d.spf && 'SPF', !d.dkim && 'DKIM', !d.dmarc && 'DMARC'].filter(Boolean).join(' e ');
      setVerifica(v => v && v.id === d.id
        ? { id: d.id, esito: `Manca ancora ${mancano} — i record impiegano fino a qualche ora a propagarsi.` }
        : v);
    }, 900);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>
      <HubTestata titolo="Domini e mittenti"
        sotto="Da quali domini partono le email, con quali indirizzi si firmano, e con che nome arrivano gli SMS. Se qui qualcosa non è a posto, i messaggi partono lo stesso — e finiscono nello spam."
        azioni={<HubStrumento forte icona="plus" onClick={() => setAggiungi(true)}>Aggiungi dominio</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Domini configurati" valore={domini.length} icona="globe"
          sotto={problemi ? `${problemi} con record incompleti` : 'tutti a posto'} tono={problemi ? 'WARN' : 'OK'}/>
        <HubTile etichetta="Indirizzi mittente" valore={HUB_MITTENTI.length} icona="mail"
          sotto={`${HUB_MITTENTI.filter(m => m.stato === 'verificato').length} verificati`}/>
        <HubTile etichetta="Mittenti SMS" valore={HUB_NUMERI.length} icona="smartphone"
          sotto={`${HUB_NUMERI.filter(n => n.stato === 'attivo').length} attivi`}/>
        <HubTile etichetta="Reputazione media" valore={Math.round(
          domini.filter(d => d.reputazione).reduce((s, d) => s + d.reputazione, 0) /
          Math.max(1, domini.filter(d => d.reputazione).length)) + '/100'}
          icona="gauge" tono="OK" sotto="Sui domini verificati"/>
      </div>

      <AdmCard padding={0}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${ADM.BORDER}` }}>
          <HubSegmenti attivo={tab} onCambia={setTab} voci={[
            { id: 'domini', label: 'Domini', conteggio: domini.length },
            { id: 'mittenti', label: 'Indirizzi mittente', conteggio: HUB_MITTENTI.length },
            { id: 'numeri', label: 'Mittenti SMS', conteggio: HUB_NUMERI.length },
          ]}/>
        </div>

        {tab === 'domini' && (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* In cima, prima dei domini di invio: è una cosa sola per tutto
                l'account e si decide una volta. */}
            <div style={{
              border: `1px solid ${tracc.dominio ? ADM.BORDER : '#F0DCB4'}`, borderRadius: 13, padding: 16,
              background: tracc.dominio ? '#fff' : '#FFFCF5',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, flexWrap: 'wrap' }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: tracc.stato === 'verificato' ? ADM.OK_SOFT : tracc.dominio ? ADM.WARN_SOFT : ADM.DANGER_SOFT,
                  color: tracc.stato === 'verificato' ? ADM.OK : tracc.dominio ? ADM.WARN : ADM.DANGER,
                }}><BuIcons.link size={18}/></span>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontSize: 11.2, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Sottodominio di tracciamento</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginTop: 4 }}>
                    <span style={{ fontSize: 15.4, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{tracc.dominio || 'Nessuno scelto'}</span>
                    <HubStato stato={tracc.stato} mappa={IM_STATI_TRACC}/>
                  </div>
                  <div style={{ fontSize: 13, color: ADM.MUTED, marginTop: 6, lineHeight: 1.5 }}>
                    Ogni link nei messaggi, email e SMS, viene riscritto su questo dominio per contare i clic. Senza, sotto il pulsante il destinatario vede il dominio del fornitore, che non conosce, e i filtri lo trattano come phishing.
                  </div>
                  <div style={{ fontSize: 13, color: ADM.MUTED, marginTop: 4, lineHeight: 1.5 }}>
                    Si decide prima del primo invio: i link già spediti puntano al dominio con cui sono stati riscritti, e cambiarlo dopo li rompe.
                  </div>
                  {traccBloccato && (
                    <div style={{ fontSize: 12.4, color: ADM.TEXT, marginTop: 8, fontWeight: 600 }}>
                      Deciso il {fmtDate(tracc.decisoIl)} · primo invio il {fmtDate(primoInvio)} · il nome non si cambia più da qui
                    </div>
                  )}
                </div>
                {tracc.dominio && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <ImRecord ok={tracc.cname} sigla="CNAME" spiega={`${tracc.dominio} → ${tracc.bordo}`}/>
                    <ImRecord ok={tracc.certificato} sigla="HTTPS" spiega="Il certificato che il fornitore emette quando il CNAME risponde"/>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {tracc.dominio ? (
                  <React.Fragment>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.2, color: ADM.TEXT, background: ADM.NEUTRAL_SOFT, padding: '5px 9px', borderRadius: 7 }}>
                      CNAME  {tracc.dominio}  →  {tracc.bordo}
                    </span>
                    <HubStrumento icona="refresh" onClick={verificaCname}>
                      {verificaTracc === 'corso' ? 'Ricontrollo…' : 'Verifica il CNAME'}
                    </HubStrumento>
                    {verificaTracc && verificaTracc !== 'corso' && (
                      <span style={{ fontSize: 12.6, fontWeight: 600, color: tracc.cname ? ADM.OK : ADM.WARN }}>{verificaTracc}</span>
                    )}
                  </React.Fragment>
                ) : (
                  <HubStrumento forte icona="plus" onClick={() => { setNuovoTracc('link.byup.it'); setScegli(true); }}>Scegli il sottodominio</HubStrumento>
                )}
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
                      </div>
                    )}
                  </div>
                  {!ok && (
                    <div style={{
                      marginTop: 13, padding: 12, borderRadius: 10, background: '#fff',
                      border: `1px solid ${ADM.BORDER}`, fontSize: 12.8, color: ADM.TEXT, lineHeight: 1.55,
                    }}>
                      <strong>Manca {[!d.spf && 'SPF', !d.dkim && 'DKIM', !d.dmarc && 'DMARC'].filter(Boolean).join(' e ')}.</strong>{' '}
                      Finché non è a posto, questo dominio non può essere usato per spedire: le email partirebbero e verrebbero scartate.
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <HubStrumento icona={copiato === d.id ? 'check' : 'copy'} acceso={copiato === d.id}
                          onClick={() => copiaRecord(d)}>
                          {copiato === d.id ? 'Record copiati' : 'Copia i record DNS'}
                        </HubStrumento>
                        <HubStrumento icona="refresh" onClick={() => verificaAdesso(d)}>
                          {verifica && verifica.id === d.id && !verifica.esito ? 'Ricontrollo…' : 'Verifica adesso'}
                        </HubStrumento>
                        {verifica && verifica.id === d.id && verifica.esito && (
                          <span style={{ fontSize: 12.6, fontWeight: 600, color: ADM.WARN }}>{verifica.esito}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'mittenti' && (
          <HubTabella
            colonne={[
              { id: 'nome',      label: 'Nome mittente', w: 'minmax(0,1.5fr)' },
              { id: 'indirizzo', label: 'Indirizzo',     w: 'minmax(0,2fr)' },
              { id: 'dominio',   label: 'Dominio',       w: '1.3fr' },
              { id: 'stato',     label: 'Stato',         w: '1fr' },
            ]}
            righe={HUB_MITTENTI} chiave={m => m.id}
            cella={(id, m) => {
              if (id === 'nome') return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: ADM.TEXT }}>{m.nome}</span>
                  {m.predefinito && <HubPillola color="PINK" size="sm">predefinito</HubPillola>}
                </span>
              );
              if (id === 'indirizzo') return <span style={{ fontSize: 13.6, color: ADM.TEXT, fontFamily: 'ui-monospace, monospace' }}>{m.indirizzo}</span>;
              if (id === 'dominio') return <span style={{ fontSize: 13.4, color: ADM.MUTED }}>{m.dominio}</span>;
              return <HubStato stato={m.stato} mappa={IM_STATI_DOM}/>;
            }}
            vuoto={<HubVuoto icona="mail" titolo="Nessun indirizzo mittente" desc="Aggiungine uno su un dominio verificato."/>}/>
        )}

        {tab === 'numeri' && (
          <HubTabella
            colonne={[
              { id: 'etichetta', label: 'Mittente',  w: 'minmax(0,1.6fr)' },
              { id: 'tipo',      label: 'Tipo',      w: 'minmax(0,1.5fr)' },
              { id: 'paesi',     label: 'Paesi',     w: '1.3fr' },
              { id: 'usato',     label: 'SMS spediti', w: '1fr', destra: true },
              { id: 'stato',     label: 'Stato',     w: '1fr' },
            ]}
            righe={HUB_NUMERI} chiave={n => n.id}
            cella={(id, n) => {
              if (id === 'etichetta') return <span style={{ fontSize: 14, fontWeight: 700, color: ADM.TEXT }}>{n.etichetta}</span>;
              if (id === 'tipo') return <span style={{ fontSize: 13.4, color: ADM.MUTED }}>{n.tipo}</span>;
              if (id === 'paesi') return <span style={{ fontSize: 13.4, color: ADM.MUTED }}>{n.paesi}</span>;
              if (id === 'usato') return <span style={{ fontSize: 13.6, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(n.usato)}</span>;
              return <HubStato stato={n.stato === 'attivo' ? 'verificato' : 'in attesa'} mappa={IM_STATI_DOM}/>;
            }}
            vuoto={<HubVuoto icona="smartphone" titolo="Nessun mittente SMS" desc="In Italia il mittente alfanumerico va registrato prima di poterlo usare."/>}/>
        )}
      </AdmCard>

      <HubModale open={aggiungi} onClose={() => setAggiungi(false)} larghezza={560}
        titolo="Aggiungi un dominio" sotto="Dopo averlo aggiunto ti diamo tre record DNS da mettere dal tuo registrar."
        footer={
          <React.Fragment>
            <div style={{ flex: 1 }}/>
            <HubStrumento onClick={() => setAggiungi(false)}>Annulla</HubStrumento>
            <HubStrumento forte icona="check" onClick={aggiungiDominio}>Aggiungi</HubStrumento>
          </React.Fragment>
        }>
        <HubCampo label="Dominio" nota="Meglio un sottodominio dedicato (es. mail.tuodominio.it): una campagna andata male non trascina la reputazione del dominio principale.">
          <HubInput valore={nuovoDom} onCambia={setNuovoDom} placeholder="mail.byup.it"/>
        </HubCampo>
      </HubModale>

      <HubModale open={scegli} onClose={() => setScegli(false)} larghezza={560}
        titolo="Scegli il sottodominio di tracciamento" sotto="Un CNAME solo, da mettere dal registrar. Si decide una volta: dopo il primo invio i link spediti restano legati a questo nome."
        footer={
          <React.Fragment>
            <div style={{ flex: 1 }}/>
            <HubStrumento onClick={() => setScegli(false)}>Annulla</HubStrumento>
            <HubStrumento forte icona="check" onClick={decidiTracc}>Decidi</HubStrumento>
          </React.Fragment>
        }>
        <HubCampo label="Sottodominio" nota={`CNAME verso ${tracc.bordo}. È quello che il destinatario vede sotto il pulsante: un nome tuo, non del fornitore.`}>
          <HubInput valore={nuovoTracc} onCambia={setNuovoTracc} placeholder="link.byup.it"/>
        </HubCampo>
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
        <div style={{display:'grid', gridTemplateColumns:'48px 100px 118px minmax(0,1.3fr) 118px 108px 108px minmax(0,1fr) minmax(0,1.4fr)', gap:10, padding:'10px 14px', borderBottom:`1px solid ${ADM.BORDER}`, fontSize:11.2, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:ADM.MUTED_SOFT}}>
          <span>N.</span><span>Giorno</span><span>Atto</span><span>Locale · P.IVA</span><span>Scadenza</span><span>Verificata il</span><span>Responsabile</span><span>Servizi</span><span>Note</span>
        </div>
        {righe.map(d => {
          const a = atto(d.atto);
          return (
            <div key={d.n} style={{display:'grid', gridTemplateColumns:'48px 100px 118px minmax(0,1.3fr) 118px 108px 108px minmax(0,1fr) minmax(0,1.4fr)', gap:10, padding:'10px 14px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, fontSize:12.8, color:ADM.TEXT, alignItems:'start'}}>
              <span style={{fontFamily:'ui-monospace,monospace', fontWeight:700}}>{String(d.n).padStart(3, '0')}</span>
              <span>{fmtDate(d.giorno)}</span>
              <span><AdmBadge color={a.color} size="xs">{a.label}</AdmBadge></span>
              <span><b>{nomeLocale(d.localeId)}</b><br/><span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED}}>{d.piva}</span></span>
              <span>{d.scadenza ? fmtDate(d.scadenza) : '—'}</span>
              <span>{fmtDate(d.verificataIl)}</span>
              <span>{d.responsabile}</span>
              <span style={{fontSize:11.8, color:ADM.MUTED, lineHeight:1.4}}>{d.atto === 'revoca' ? 'Entrambi' : d.servizi.map(x => x.split(' ')[0]).join(' · ')}</span>
              <span style={{fontSize:12, color:ADM.MUTED, lineHeight:1.45}}>{d.note || '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.HubDeleghePage = HubDeleghePage;

// Conformità — Audit interni e riesame di direzione (CfAudit), registri di
// formazione (CfFormazione) e test di ripristino (CfTestRipristino): entrambi
// resi in Piattaforma, non piu fra i registri di Conformita.
//
// Il pezzo che conta è il riesame di direzione: la §9.3 impone che la riunione
// parta da una lista fissa di input, e la fatica non è decidere, è raccogliere
// quei dati. Spot li ha già tutti nei registri, quindi il pacchetto si compila
// da solo: qui sotto nessun numero è scritto a mano, ognuno è calcolato al
// momento dai registri veri.
//
// Convenzione di questo file: tutto ciò che vive a livello di modulo è
// prefissato `rie`/`Rie`/`RIE` — gli script sono globali, i nomi non si possono
// ripetere fra file.

const { useState: useStateRie } = React;

const RIE_RTO_MIN = 45;   // obiettivo di tempo dichiarato per il ripristino

const rieAdemp = (id) => ADEMPIMENTI.find(a => a.id === id);
const rieNome = (m) => m.nomeCompleto || m.nome;
const rieTeamAttivo = () => (typeof TEAM !== 'undefined' ? TEAM : []).filter(m => m.attivo !== false);

// Fascia in testa: il colore compare solo quando c'è un problema vero.
function rieBanda(tono) {
  if (tono === 'DANGER') return { bg:ADM.DANGER_SOFT, bd:'#FECACA', fg:'#7F1D1D' };
  if (tono === 'WARN')   return { bg:'#FFF7E6',        bd:'#FDE68A', fg:'#78350F' };
  return { bg:ADM.NEUTRAL_SOFT, bd:ADM.BORDER, fg:ADM.TEXT };
}

const RIE_BANDA = { display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10 };
const RIE_NOTA  = { fontSize:12.2, color:ADM.MUTED, lineHeight:1.6, padding:'12px 14px', background:ADM.NEUTRAL_SOFT, borderRadius:10 };

// ─── Formazione: stato di ogni riga del registro ───────────────────────────
function rieRigheFormazione() {
  return FORMAZIONE.map(f => {
    const scade = f.completatoIl ? cfMesi(f.completatoIl, f.validitaMesi) : null;
    const g = scade ? cfGiorniA(scade) : null;
    let stato;
    // «Mai svolta» e «in corso» non sono la stessa cosa: la prima e un rilievo,
    // la seconda e un corso partito che deve solo finire — e non deve stare in
    // cima all'elenco insieme alle inadempienze.
    if (!f.completatoIl && !f.avviatoIl)
                          stato = { key:'mai',     label:'Mai svolta',                  tono:'DANGER',  rank:0 };
    else if (!f.completatoIl)
                          stato = { key:'in-corso',label:'In corso',                    tono:'WARN',    rank:2 };
    else if (g < 0)       stato = { key:'scaduta', label:`Scaduta da ${-g} giorni`,     tono:'DANGER',  rank:1 };
    else if (g <= 30)     stato = { key:'vicina',  label:`Scade fra ${g} giorni`,       tono:'WARN',    rank:2 };
    else                  stato = { key:'valida',  label:`Ancora ${g} giorni`,          tono:'NEUTRAL', rank:3 };
    return { f, scade, giorni:g, stato };
  }).sort((a, b) => a.stato.rank - b.stato.rank
    || ((a.scade ? a.scade.getTime() : 0) - (b.scade ? b.scade.getTime() : 0))
    || a.f.persona.localeCompare(b.f.persona));
}

// Chi ha accesso ma non compare affatto nel registro: il controllo A.6.3 vale
// sulle persone, non sulle righe già scritte.
function rieAssentiFormazione() {
  return rieTeamAttivo().filter(m => !FORMAZIONE.some(f => f.persona === rieNome(m)));
}

function rieFormazioneInRegola() {
  const righe = rieRigheFormazione();
  const team = rieTeamAttivo();
  const ok = team.filter(m => {
    const sue = righe.filter(r => r.f.persona === rieNome(m));
    return sue.length > 0 && sue.every(r => r.stato.key === 'valida' || r.stato.key === 'vicina');
  });
  return { ok: ok.length, totale: team.length };
}

// ─── Le tre uscite del riesame (§9.3.3) ────────────────────────────────────
// La norma non chiede "decisioni" in generale: chiede decisioni SU TRE COSE, e
// l'auditor le cerca separatamente. Tenerle in un campo unico le fa sembrare
// tutte uguali, e in pratica la terza sparisce — perché è quella che costa.
const RIE_TIPI = [
  { id:'miglioramento', label:'Opportunità di miglioramento',
    nota:'Che cosa si può fare meglio anche dove non è rotto niente' },
  { id:'modifiche',     label:'Modifiche al sistema di gestione',
    nota:'Politiche, procedure, perimetro, cadenze da cambiare' },
  { id:'risorse',       label:'Risorse necessarie',
    nota:'Persone, tempo, budget, strumenti — anche per dire che bastano quelle attuali' },
];
const RIE_ESEMPI = {
  miglioramento:'Es. Anticipare il test di ripristino a maggio per non accavallarlo con la sorveglianza',
  modifiche:'Es. Portare il riesame dei log da trimestrale a mensile',
  risorse:'Es. Affidare a un consulente 3 giornate per la gestione delle vulnerabilità',
};

// Lo storico contiene decisioni scritte prima che esistesse il tipo: si legge
// sia la stringa nuda sia l'oggetto, senza riscrivere i dati vecchi.
const rieTestoDec = (d) => (typeof d === 'string' ? d : (d && d.testo) || '');
const rieTipoDec  = (d) => (typeof d === 'string' ? null : (d && d.tipo) || null);

// ─── Verifica delle decisioni prese nei riesami precedenti ─────────────────
// Una decisione non è "fatta" perché qualcuno l'ha spuntata: lo è se il dato
// vivo lo conferma. Ogni verifica va a leggere il registro che dovrebbe essere
// cambiato — è il modo per non arrivare al riesame successivo con la stessa
// azione trascinata da un anno.
const RIE_VERIFICHE = [
  { chiave:/super admin/i, calcola: () => {
      const n = rieTeamAttivo().filter(m => m.ruolo === 'super_admin').length;
      const r = RISCHI.find(x => x.id === 'R05');
      return n > 1
        ? { stato:'fatta',  nota:`${n} Super Admin attivi nel team`, tab:null }
        : { stato:'aperta', nota:`Un solo Super Admin attivo · il rischio R05 è ancora ${r ? r.stato : 'aperto'}`, tab:'rischi' };
    } },
  { chiave:/accessi/i, calcola: () => {
      const a = rieAdemp('acc');
      const s = a ? cfStatoAdempimento(a) : null;
      return a && a.cadenzaMesi === 3
        ? { stato:'fatta', nota:`Cadenza portata a ${a.cadenzaMesi} mesi · ultimo riesame ${cfFmt(a.ultima)}${s && s.stato === 'scaduto' ? ', il prossimo è però scaduto' : ''}`, tab:'cruscotto' }
        : { stato:'aperta', nota:'Cadenza del riesame accessi non aggiornata', tab:'cruscotto' };
    } },
  { chiave:/fornitor/i, calcola: () => {
      const mai = FORNITORI.filter(f => !f.ultimoRiesame).length;
      return mai
        ? { stato:'parziale', nota:`Registro attivo con ${FORNITORI.length} fornitori, ma ${mai} non sono mai stati riesaminati`, tab:'fornitori' }
        : { stato:'fatta',    nota:`Registro attivo con ${FORNITORI.length} fornitori, tutti riesaminati`, tab:'fornitori' };
    } },
];

function rieStatoDecisione(testo) {
  const v = RIE_VERIFICHE.find(x => x.chiave.test(testo));
  if (!v) return { stato:'da verificare', nota:'Nessun registro collegato: da verificare in riunione', tab:null };
  return v.calcola();
}


// ─── Il pacchetto di input del riesame (§9.3) ──────────────────────────────
// Nessun numero scritto a mano: ogni voce interroga il suo registro adesso.
function riePacchetto() {
  const ultimoAudit   = AUDIT_INTERNI[0];
  const ultimoRiesame = RIESAMI_DIREZIONE[0];

  const dec = ((ultimoRiesame && ultimoRiesame.decisioni) || [])
    .map(d => Object.assign({ testo:rieTestoDec(d), tipo:rieTipoDec(d) }, rieStatoDecisione(rieTestoDec(d))));
  const decAperte = dec.filter(d => d.stato !== 'fatta').length;

  const ncAperte  = NON_CONFORMITA.filter(n => n.stato !== 'chiusa');
  const ncChiuse  = NON_CONFORMITA.filter(n => n.stato === 'chiusa');
  const ncRitardo = ncAperte.filter(n => n.scadenza && cfGiorniA(n.scadenza) < 0).length;
  const ncEffic   = ncChiuse.filter(n => n.efficacia === 'efficace').length;

  const incAperti = INCIDENTI.filter(i => i.stato !== 'chiuso').length;
  const breach    = INCIDENTI.filter(i => i.dataBreach);
  const breachNot = breach.filter(i => i.breachNotificato).length;

  const rDaTrattare = RISCHI.filter(r => r.stato === 'aperto' || r.stato === 'nuovo').length;
  const rTrattati   = RISCHI.filter(r => r.stato === 'trattato').length;
  const rAccettati  = RISCHI.filter(r => r.stato === 'accettato').length;

  const fRiesam   = FORNITORI.filter(f => f.ultimoRiesame).length;
  const fMai      = FORNITORI.length - fRiesam;
  const fSenzaDpa = FORNITORI.filter(f => !f.dpa).length;

  const ad        = ADEMPIMENTI.map(a => cfStatoAdempimento(a));
  const adScaduti = ad.filter(s => s.stato === 'scaduto' || s.stato === 'mai').length;
  const adVicini  = ad.filter(s => s.stato === 'vicino').length;

  const fr     = rieRigheFormazione();
  const frMai  = fr.filter(r => r.stato.key === 'mai').length;
  const frScad = fr.filter(r => r.stato.key === 'scaduta').length;
  const assenti = rieAssentiFormazione();
  const reg     = rieFormazioneInRegola();

  const voci = [
    { id:'azioni', rif:'§9.3.2 a)', titolo:'Azioni dai riesami precedenti',
      n:decAperte, unita: decAperte === 1 ? 'azione non ancora chiusa' : 'azioni non ancora chiuse',
      dettaglio:`${dec.length} decisioni prese il ${cfFmt(ultimoRiesame && ultimoRiesame.data)} · ${dec.length - decAperte} confermate dai registri, non dalle spunte`,
      tono: decAperte ? 'WARN' : 'OK', tab:null },

    { id:'audit', rif:'§9.3.2 c)', titolo:'Esiti degli audit interni',
      n: ultimoAudit ? ultimoAudit.rilievi : 0, unita: (ultimoAudit && ultimoAudit.rilievi === 1) ? 'rilievo dall’ultimo audit' : 'rilievi dall’ultimo audit',
      dettaglio: ultimoAudit
        ? `${cfFmt(ultimoAudit.data)} · ${ultimoAudit.maggiori} maggiori, ${ultimoAudit.minori} minori, ${ultimoAudit.osservazioni} ${ultimoAudit.osservazioni === 1 ? 'osservazione' : 'osservazioni'} · rapporto ${ultimoAudit.stato}`
        : 'Nessun audit interno registrato',
      tono: !ultimoAudit ? 'DANGER' : ultimoAudit.maggiori ? 'DANGER' : 'OK', tab:null },

    { id:'nc', rif:'§9.3.2 c) · §10.2', titolo:'Non conformità e azioni correttive',
      n:ncAperte.length, unita: ncAperte.length === 1 ? 'non conformità aperta' : 'non conformità aperte',
      dettaglio:`${ncChiuse.length} chiuse, ${ncEffic} con efficacia verificata · ${ncRitardo ? `${ncRitardo} oltre la scadenza dell’azione` : 'nessuna oltre la scadenza'}`,
      tono: ncRitardo ? 'DANGER' : ncAperte.length ? 'WARN' : 'OK', tab:'nc' },

    { id:'incidenti', rif:'§9.3.2 c) · A.5.24', titolo:'Incidenti di sicurezza e data breach',
      n:breach.length, unita: breach.length === 1 ? 'data breach nel periodo' : 'data breach nel periodo',
      dettaglio:`${INCIDENTI.length} incidenti registrati, ${incAperti} ${incAperti === 1 ? 'ancora aperto' : 'ancora aperti'} · ${breach.length ? `${breachNot} su ${breach.length} notificati al Garante` : 'nessuna notifica dovuta'}`,
      tono: incAperti ? 'WARN' : 'OK', tab:'incidenti' },

    { id:'rischi', rif:'§9.3.2 e) · §6.1', titolo:'Stato del trattamento dei rischi',
      n:rDaTrattare, unita: rDaTrattare === 1 ? 'rischio senza trattamento' : 'rischi senza trattamento',
      dettaglio:`${rTrattati} trattati con misure attive, ${rAccettati} accettati formalmente su ${RISCHI.length} censiti`,
      tono: rDaTrattare ? 'WARN' : 'OK', tab:'rischi' },

    { id:'fornitori', rif:'§9.3.2 c) · A.5.19', titolo:'Prestazioni dei fornitori',
      n:fMai, unita: fMai === 1 ? 'fornitore mai riesaminato' : 'fornitori mai riesaminati',
      dettaglio:`${fRiesam} su ${FORNITORI.length} riesaminati · ${fSenzaDpa ? `${fSenzaDpa} senza accordo sul trattamento dei dati` : 'accordo sul trattamento presente su tutti'}`,
      tono: fMai || fSenzaDpa ? 'DANGER' : 'OK', tab:'fornitori' },

    { id:'adempimenti', rif:'§9.3.2 b)', titolo:'Adempimenti scaduti o in scadenza',
      n:adScaduti, unita: adScaduti === 1 ? 'adempimento scaduto' : 'adempimenti scaduti',
      dettaglio:`${adVicini} in scadenza entro 30 giorni su ${ADEMPIMENTI.length} obblighi ricorrenti · la scadenza si calcola dalla cadenza, non si dichiara`,
      tono: adScaduti ? 'DANGER' : adVicini ? 'WARN' : 'OK', tab:'cruscotto' },

    { id:'formazione', rif:'§9.3.2 c) · A.6.3', titolo:'Formazione e consapevolezza',
      n:frMai + frScad + assenti.length, unita:'persone fuori copertura',
      dettaglio:`${reg.ok} su ${reg.totale} in regola · ${frScad} scadute, ${frMai} mai svolte, ${assenti.length} non presenti nel registro`,
      // Il registro non e piu in Conformita: il pacchetto di input del riesame
      // deve portare dove la formazione si legge davvero.
      tono: (frMai + frScad + assenti.length) ? 'WARN' : 'OK', vaiA:{route:'conformita', tab:'formazione'} },
  ];

  return { voci, dec, decAperte, ultimoAudit, ultimoRiesame };
}

// ─── Riga del pacchetto ────────────────────────────────────────────────────
// Il numero sta attaccato alla sua unità di misura, non in una colonna a sé:
// «2» da solo non vuol dire niente, e leggerlo qui e leggere «azioni non ancora
// chiuse» quattrocento pixel più in là costa due saccadi per ogni riga.
const RIE_GRID_VOCE = 'minmax(0,1.15fr) 215px minmax(0,1.55fr) 26px';

function RieVerdetto({ voce, compatto }) {
  const forte = voce.tono === 'DANGER' || voce.tono === 'WARN';
  return (
    <div style={{display:'flex', alignItems:'baseline', gap:6, minWidth:0}}>
      <span style={{fontSize: compatto ? 15 : 20, fontWeight:800, letterSpacing:'-0.02em',
        color: forte ? CF_TONO(voce.tono) : ADM.INK, flexShrink:0}}>{voce.n}</span>
      {/* Solo il numero prende il colore dello stato: colorare anche la frase
          fa urlare sette righe su otto e il segnale si perde nel rumore. */}
      <span style={{fontSize: compatto ? 12 : 12.6, lineHeight:1.35, fontWeight:600,
        color: forte ? ADM.TEXT : ADM.MUTED}}>{voce.unita}</span>
    </div>
  );
}

function RieVoce({ voce, ultima, cliccabile, onApri }) {
  return (
    <div className={cliccabile ? 'adm-row-open' : undefined}
      onClick={cliccabile ? onApri : undefined}
      style={{display:'grid', gridTemplateColumns:RIE_GRID_VOCE, gap:14, alignItems:'center',
        padding:'12px 16px', cursor: cliccabile ? 'pointer' : 'default',
        borderBottom: ultima ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
        background: voce.tono === 'DANGER' ? '#FFFBFB' : '#fff'}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{voce.titolo}</div>
        <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2}}>{voce.rif}</div>
      </div>
      <RieVerdetto voce={voce}/>
      <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.45, minWidth:0}}>{voce.dettaglio}</div>
      {cliccabile
        ? <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
        : <span/>}
    </div>
  );
}

// Versione compatta usata dentro la modale di preparazione.
function RieVoceCompatta({ voce }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 165px', gap:12, alignItems:'center',
      padding:'8px 0', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:12.6, fontWeight:700, color:ADM.TEXT}}>{voce.titolo}</div>
        <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{voce.dettaglio}</div>
      </div>
      <RieVerdetto voce={voce} compatto/>
    </div>
  );
}

// ─── Audit interni e riesame di direzione ──────────────────────────────────

// Intestazione di sezione: titolo, riga di contesto, e l'azione ancorata a
// destra. Prima il bottone galleggiava a mezz'aria accanto a un titolino
// minuscolo e pesava più del titolo stesso.
function RieSezione({ titolo, nota, destra }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10, flexWrap:'wrap'}}>
      <div style={{...CF_H, marginBottom:0}}>{titolo}</div>
      {nota && <span style={{fontSize:12.4, color:ADM.MUTED, flex:1, minWidth:200}}>{nota}</span>}
      {destra}
    </div>
  );
}

// Testata: i due adempimenti che questa pagina documenta, affiancati. Sono due
// obblighi distinti con due scadenze distinte, e la prima domanda di chi apre
// la pagina è a che punto sta ognuno — non che cosa dice il registro.
function RieTestata({ titolo, rif, stato, riga, sotto, chi, azione }) {
  const b = rieBanda(stato.stato === 'ok' ? 'NEUTRAL' : stato.tono);
  return (
    <div style={{flex:'1 1 320px', minWidth:0, border:`1px solid ${b.bd}`, borderRadius:12,
      background: b.bg === ADM.NEUTRAL_SOFT ? '#fff' : b.bg,
      padding:'14px 16px 13px', display:'flex', flexDirection:'column', gap:9}}>
      <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
        <span style={{fontSize:11.4, fontWeight:800, color:ADM.MUTED, textTransform:'uppercase',
          letterSpacing:'0.07em', whiteSpace:'nowrap'}}>{titolo}</span>
        <span style={{fontSize:11.6, color:ADM.MUTED_SOFT, whiteSpace:'nowrap'}}>{rif}</span>
        <div style={{flex:1}}/>
        <CfPill tono={stato.tono}>{stato.label}</CfPill>
      </div>
      <div>
        <div style={{fontSize:14.6, fontWeight:800, color:b.fg, letterSpacing:'-0.01em', lineHeight:1.3}}>{riga}</div>
        <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>{sotto}</div>
        {chi && <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, marginTop:2, lineHeight:1.45}}>{chi}</div>}
      </div>
      <div style={{flex:1, minHeight:4}}/>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <span style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>
          {stato.prossima ? `prossimo entro il ${cfFmt(stato.prossima)}` : 'nessuna scadenza calcolabile'}
        </span>
        <div style={{flex:1}}/>
        {azione}
      </div>
    </div>
  );
}

function CfAudit({ onVai }) {
  const [prepara, setPrepara]           = useStateRie(false);
  const [conferma, setConferma]         = useStateRie(false);
  const [decisioni, setDecisioni]       = useStateRie({ miglioramento:'', modifiche:'', risorse:'' });
  const [partecipanti, setPartecipanti] = useStateRie((RIESAMI_DIREZIONE[0] && RIESAMI_DIREZIONE[0].partecipanti) || '');
  const [versione, setVersione]         = useStateRie(0);

  const pk = riePacchetto();
  const navigabile = typeof onVai === 'function';
  const vai = (tab) => { if (tab && navigabile) onVai(tab); };

  const sAudit = cfStatoAdempimento(rieAdemp('audit') || {});
  const sDir   = cfStatoAdempimento(rieAdemp('dir') || {});
  const ultimo = pk.ultimoAudit;
  const senzaDoc = AUDIT_INTERNI.filter(a => !a.doc).length;
  const daPortare = pk.voci.filter(v => v.tono !== 'OK').length;

  // Una riga per decisione, dentro la casella che le dà il tipo.
  const righeDecisioni = RIE_TIPI.flatMap(t =>
    (decisioni[t.id] || '').split('\n').map(s => s.trim()).filter(Boolean)
      .map(testo => ({ testo, tipo:t.id })));
  const senzaRisorse = !righeDecisioni.some(d => d.tipo === 'risorse');

  // Registrare il riesame chiude l'adempimento: la data di §9.3 riparte da qui,
  // così il Cruscotto non resta a raccontare una scadenza già rispettata.
  const registra = () => {
    const anno = new Date().getFullYear();
    const gia = RIESAMI_DIREZIONE.filter(r => String(r.id).indexOf('RD-' + anno) === 0).length;
    const nuovo = {
      id: gia ? `RD-${anno}-${gia + 1}` : `RD-${anno}`,
      data: new Date(),
      partecipanti: partecipanti.trim() || '—',
      decisioni: righeDecisioni,
      stato: 'chiuso',
      doc: null,
      nuovo: true,
    };
    RIESAMI_DIREZIONE.unshift(nuovo);
    const a = rieAdemp('dir');
    if (a) a.ultima = nuovo.data;
    setConferma(false);
    setPrepara(false);
    setDecisioni('');
    setVersione(versione + 1);
  };

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:22, position:'relative'}}>

      {/* ── Testata: a che punto stanno i due adempimenti ─────────────── */}
      <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
        <RieTestata titolo="Audit interno" rif="§9.2" stato={sAudit}
          riga={ultimo ? `Ultimo audit il ${cfFmt(ultimo.data)}` : 'Nessun audit interno registrato'}
          sotto={ultimo
            ? `${ultimo.rilievi} ${ultimo.rilievi === 1 ? 'rilievo' : 'rilievi'} · ${ultimo.maggiori} ${ultimo.maggiori === 1 ? 'maggiore' : 'maggiori'}, ${ultimo.minori} ${ultimo.minori === 1 ? 'minore' : 'minori'}, ${ultimo.osservazioni} ${ultimo.osservazioni === 1 ? 'osservazione' : 'osservazioni'}`
            : 'Un solo audit copre entrambe le certificazioni'}
          chi={ultimo ? ultimo.auditor : null}/>
        <RieTestata titolo="Riesame di direzione" rif="§9.3" stato={sDir}
          riga={pk.ultimoRiesame ? `Ultimo riesame il ${cfFmt(pk.ultimoRiesame.data)}` : 'Nessun riesame registrato'}
          sotto={pk.dec.length
            ? `${pk.dec.length} ${pk.dec.length === 1 ? 'decisione presa' : 'decisioni prese'} · ${pk.decAperte ? `${pk.decAperte} ancora da chiudere` : 'tutte confermate dai registri'}`
            : 'Nessuna decisione nello storico'}
          chi={pk.ultimoRiesame ? pk.ultimoRiesame.partecipanti : null}
          azione={<AdmButton variant="primary" size="sm" onClick={()=>setPrepara(true)}>Prepara il riesame</AdmButton>}/>
      </div>

      {/* ── Il pacchetto di input: è il pezzo per cui si apre la pagina ── */}
      <div>
        <RieSezione titolo="Pacchetto di input · §9.3.2"
          nota={`Gli ${pk.voci.length} dati da cui la norma impone che parta la riunione · ${daPortare ? `${daPortare} con qualcosa da portare al tavolo` : 'nessuno segnala problemi'}`}/>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:RIE_GRID_VOCE, gap:14}}>
            <div>Input richiesto</div><div>Come sta adesso</div>
            <div>Dal registro</div><div/>
          </div>
          {pk.voci.map((v, i) => (
            <RieVoce key={v.id} voce={v} ultima={i === pk.voci.length - 1}
              cliccabile={!!((v.tab || v.vaiA) && navigabile)} onApri={()=>vai(v.vaiA || v.tab)}/>
          ))}
        </div>

        <div style={{...RIE_NOTA, marginTop:9}}>
          Raccogliere questi dati a mano è il motivo per cui il riesame slitta: qui nessun numero
          è scritto a mano, ognuno è calcolato adesso dal registro che lo contiene.
        </div>
      </div>

      {/* Qui c'erano lo storico dei riesami svolti e il registro degli audit
          interni. Sono le esecuzioni passate di due adempimenti — §9.3 e §9.2 —
          e un auditor le chiede a partire dall'adempimento, non dalla sezione:
          ora si aprono dal Cruscotto, cliccando la riga corrispondente. Questa
          tab resta quello che serve a chi deve FARE il riesame: il pacchetto di
          input, e il bottone per prepararlo. */}

      {/* ── Modale: pacchetto pronto + decisioni ──────────────────────── */}
      {prepara && (
        <div onClick={()=>setPrepara(false)} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:640, maxWidth:'92%', maxHeight:'88%', overflowY:'auto',
            background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)',
            animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:5}}>
              Riesame di direzione · {cfFmt(new Date())}
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Gli {pk.voci.length} input richiesti dalla §9.3, compilati dai registri un istante fa.
              Non c'è niente da raccogliere: resta da decidere.
            </div>

            <div style={{padding:'4px 14px 8px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16}}>
              {pk.voci.map(v => <RieVoceCompatta key={v.id} voce={v}/>)}
            </div>

            <div style={{fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
              letterSpacing:'0.05em', marginBottom:6}}>Partecipanti</div>
            <input value={partecipanti} onChange={e=>setPartecipanti(e.target.value)}
              placeholder="Nome e cognome, separati da virgola"
              style={{width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${ADM.BORDER}`,
                fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT, boxSizing:'border-box', outline:'none', marginBottom:14}}/>

            <div style={{fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
              letterSpacing:'0.05em', marginBottom:8}}>Decisioni · una per riga</div>

            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {RIE_TIPI.map((t, k) => (
                <div key={t.id}>
                  <div style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT}}>{t.label}</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, marginBottom:6, lineHeight:1.4}}>{t.nota}</div>
                  <textarea value={decisioni[t.id]} autoFocus={k === 0}
                    onChange={e=>setDecisioni(d => ({ ...d, [t.id]: e.target.value }))}
                    placeholder={RIE_ESEMPI[t.id]}
                    style={{width:'100%', minHeight:60, padding:'10px 12px', borderRadius:10,
                      border:`1px solid ${ADM.BORDER}`, fontSize:13.4, fontFamily:'inherit', color:ADM.TEXT,
                      resize:'vertical', boxSizing:'border-box', outline:'none'}}/>
                </div>
              ))}
            </div>

            {/* Una casella risorse vuota non blocca, ma va detto: e la voce che
                per prima sparisce dai verbali, perche e quella che costa. */}
            {senzaRisorse && righeDecisioni.length > 0 && (
              <div style={{fontSize:12.2, color:'#78350F', background:ADM.WARN_SOFT, borderRadius:9,
                padding:'10px 12px', marginTop:12, lineHeight:1.5}}>
                Nessuna decisione sulle risorse. È ammesso, ma vale la pena scriverci che quelle
                attuali bastano: un riesame che per anni non tocca mai le risorse si nota.
              </div>
            )}

            <div style={{fontSize:12, color:ADM.MUTED, marginTop:12, lineHeight:1.5}}>
              Le decisioni diventano lo stato di partenza del prossimo riesame e vengono
              riverificate sui registri, non sulla parola.
            </div>

            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:16}}>
              <span style={{fontSize:12.4, color:ADM.MUTED}}>
                {righeDecisioni.length} {righeDecisioni.length === 1 ? 'decisione' : 'decisioni'}
              </span>
              <div style={{flex:1}}/>
              <AdmButton variant="secondary" size="sm" onClick={()=>setPrepara(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" disabled={righeDecisioni.length === 0}
                onClick={()=>setConferma(true)}>Registra il riesame</AdmButton>
            </div>
          </div>
        </div>
      )}

      {/* Conferma: il verbale è evidenza per due certificazioni */}
      {conferma && (
        <div onClick={()=>setConferma(false)} style={{position:'fixed', inset:0, zIndex:61, background:'rgba(15,17,21,0.42)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:480, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Registrare il riesame di direzione?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Il verbale diventa l'evidenza §9.3 per ISO 27001 e ISO 9001. Le{' '}
              <strong style={{color:ADM.TEXT}}>{righeDecisioni.length} decisioni</strong> entrano nello storico
              e verranno riverificate sui registri al prossimo riesame. L'adempimento riparte da oggi.
            </div>
            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16,
              fontSize:12.6, color:ADM.TEXT, lineHeight:1.6}}>
              {RIE_TIPI.filter(t => righeDecisioni.some(d => d.tipo === t.id)).map(t => (
                <div key={t.id} style={{marginBottom:7}}>
                  <div style={{fontSize:11, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
                    letterSpacing:'0.05em', marginBottom:2}}>{t.label}</div>
                  {righeDecisioni.filter(d => d.tipo === t.id).map((d, i) => <div key={i}>· {d.testo}</div>)}
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(false)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={registra}>Registra il riesame</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Registro della formazione (A.6.3) ─────────────────────────────────────
const RIE_GRID_FORM = 'minmax(0,1.25fr) minmax(0,2fr) 1fr 1fr 1.3fr';


// ─── Registrare una formazione ─────────────────────────────────────────────
// Il campo sta FUORI dal componente: dichiararlo dentro lo farebbe rimontare a
// ogni battitura e l'input perderebbe il fuoco a ogni carattere.
function RieCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : null}>
      <label style={CF_LAB}>{etichetta}</label>
      {children}
      {aiuto && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{aiuto}</div>}
    </div>
  );
}

const RIE_VALIDITA = [12, 24, 36];
const rieIso = (d) => d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '';

function RieModaleCorso({ riga, onChiudi, onSalva, onElimina }) {
  const modifica = !!riga;
  const f = riga ? riga.f : null;
  const [b, setB] = useStateRie(() => f ? {
    persona:f.persona, corso:f.corso,
    stato: f.completatoIl ? 'completato' : 'in-corso',
    data: rieIso(f.completatoIl || f.avviatoIl || ECO_OGGI),
    validitaMesi:String(f.validitaMesi || 12),
  } : {
    persona:'', corso:'', stato:'completato',
    data: rieIso(new Date()), validitaMesi:'12',
  });
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));
  const completato = b.stato === 'completato';
  // I corsi gia in registro sono la lista da cui si sceglie quasi sempre: un
  // corso scritto due volte in due modi diversi e due corsi per chi conta.
  const corsi = [...new Set(FORMAZIONE.map(x => x.corso))];
  const persone = [...new Set(rieTeamAttivo().map(rieNome).concat(FORMAZIONE.map(x => x.persona)))].sort();
  const ok = b.persona.trim().length > 1 && b.corso.trim().length > 2 && !!b.data;
  const scade = completato && ok
    ? cfMesi(new Date(b.data + 'T12:00:00'), parseInt(b.validitaMesi, 10)) : null;

  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="corso" onClick={e=>e.stopPropagation()} style={{width:620, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>
            {modifica ? f.corso : 'Registrare una formazione'}
          </div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            {modifica
              ? `${f.persona} · registrata nel corso di formazione`
              : 'Una riga per persona e per corso. La validità decide quando la formazione andrà rifatta.'}
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
          <RieCampo etichetta="Persona">
            <input list="rie-persone" value={b.persona} onChange={e=>agg('persona', e.target.value)}
              style={CF_INP} placeholder="Nome e cognome"/>
            <datalist id="rie-persone">{persone.map(x => <option key={x} value={x}/>)}</datalist>
          </RieCampo>
          <RieCampo etichetta="Corso">
            <input list="rie-corsi" value={b.corso} onChange={e=>agg('corso', e.target.value)}
              style={CF_INP} placeholder="Titolo del corso"/>
            <datalist id="rie-corsi">{corsi.map(x => <option key={x} value={x}/>)}</datalist>
          </RieCampo>
          <RieCampo etichetta="Stato">
            <select value={b.stato} onChange={e=>agg('stato', e.target.value)} style={CF_INP}>
              <option value="in-corso">In corso</option>
              <option value="completato">Completato</option>
            </select>
          </RieCampo>
          <RieCampo etichetta={completato ? 'Completato il' : 'Iniziato il'}
            aiuto={completato ? null : 'Finché il corso è in corso non produce una scadenza.'}>
            <input type="date" value={b.data} onChange={e=>agg('data', e.target.value)} style={CF_INP}/>
          </RieCampo>
          {completato && (
            <RieCampo etichetta="Validità" span
              aiuto={scade ? `Da rifare entro il ${cfFmt(scade)}.` : null}>
              <select value={b.validitaMesi} onChange={e=>agg('validitaMesi', e.target.value)} style={CF_INP}>
                {RIE_VALIDITA.map(v => <option key={v} value={v}>{v} mesi</option>)}
              </select>
            </RieCampo>
          )}
        </div>

        <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:10, flexShrink:0}}>
          {modifica && (
            <AdmButton variant="ghost" size="sm" style={{color:ADM.DANGER, flexShrink:0}}
              onClick={()=>onElimina(riga)}>Elimina</AdmButton>
          )}
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1}}>
            {ok ? (completato ? 'La riga entra come completata e inizia a contare la scadenza.'
                              : 'La riga entra come in corso: nessuna scadenza finché non si completa.')
                : 'Servono persona, corso e data.'}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!ok} onClick={()=>onSalva(b)}>
            {modifica ? 'Salva' : 'Aggiungi al registro'}
          </AdmButton>
        </div>
      </div>
    </div>
  );
}

function RieConfermaElimina({ riga, onChiudi, onConferma }) {
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:61, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div data-modale="elimina-corso" onClick={e=>e.stopPropagation()} style={{width:480, maxWidth:'92%',
        background:'#fff', borderRadius:16, padding:'22px 24px',
        boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
        <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
          Eliminare questa riga?
        </div>
        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:16}}>
          {riga.f.persona} · {riga.f.corso}. Sparisce dal registro e dal conteggio della copertura:
          se la persona ha davvero fatto il corso, l’evidenza si perde.
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" onClick={onConferma}>Elimina</AdmButton>
        </div>
      </div>
    </div>
  );
}

function CfFormazione() {
  const [nuovo, setNuovo] = useStateRie(false);
  const [modifica, setModifica] = useStateRie(null);
  const [elimina, setElimina] = useStateRie(null);
  const [, ridisegna] = useStateRie(0);
  const forza = () => ridisegna(x => x + 1);
  const righe = rieRigheFormazione();

  // Una riga del registro e una persona + un corso: salvarla vuol dire scrivere
  // la data nel campo giusto a seconda dello stato, perche una formazione in
  // corso non ha una data di completamento e non deve fingere di averla.
  const daBozza = (b) => {
    const d = new Date(b.data + 'T12:00:00');
    return { persona:b.persona.trim(), corso:b.corso.trim(),
      completatoIl: b.stato === 'completato' ? d : null,
      avviatoIl:    b.stato === 'completato' ? null : d,
      validitaMesi: parseInt(b.validitaMesi, 10) || 12 };
  };

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:22, position:'relative'}}>

      <div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <div style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT, textTransform:'uppercase',
            letterSpacing:'0.08em'}}>Registro della formazione</div>
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setNuovo(true)}>Registra una formazione</AdmButton>
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:RIE_GRID_FORM, gap:10}}>
            <div>Persona</div><div>Corso</div><div>Completato il</div><div>Scade il</div><div>Stato</div>
          </div>
          {righe.map((r, i) => (
            <div key={r.f.persona + r.f.corso} className="adm-row-open" onClick={()=>setModifica(r)}
              style={{display:'grid', gridTemplateColumns:RIE_GRID_FORM, gap:10,
              alignItems:'center', padding:'11px 16px', cursor:'pointer',
              borderBottom: i < righe.length - 1 ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
              background: r.stato.tono === 'DANGER' ? '#FFFBFB' : '#fff'}}>
              <div style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.f.persona}</div>
              <div style={{fontSize:12.6, color:ADM.TEXT, lineHeight:1.35}}>{r.f.corso}</div>
              <div style={{fontSize:12.6,
                color: r.f.completatoIl ? ADM.TEXT : r.f.avviatoIl ? ADM.MUTED : ADM.DANGER,
                fontWeight: r.f.completatoIl ? 500 : r.f.avviatoIl ? 500 : 700}}>
                {r.f.completatoIl ? cfFmt(r.f.completatoIl) : r.f.avviatoIl ? '—' : 'mai'}
                {!r.f.completatoIl && r.f.avviatoIl && (
                  <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>dal {cfFmt(r.f.avviatoIl)}</div>
                )}
              </div>
              <div style={{fontSize:12.6, color:ADM.MUTED}}>
                {r.scade ? cfFmt(r.scade) : '—'}
                {r.f.completatoIl && <div style={{fontSize:11.4, color:ADM.MUTED_SOFT, marginTop:2}}>validità {r.f.validitaMesi} mesi</div>}
              </div>
              <div><CfPill tono={r.stato.tono}>{r.stato.label}</CfPill></div>
            </div>
          ))}
        </div>

      </div>

      {nuovo && <RieModaleCorso onChiudi={()=>setNuovo(false)}
        onSalva={(b)=>{ FORMAZIONE.push(daBozza(b)); setNuovo(false); forza(); }}/>}
      {modifica && <RieModaleCorso key={modifica.f.persona + modifica.f.corso} riga={modifica}
        onChiudi={()=>setModifica(null)} onElimina={(r)=>setElimina(r)}
        onSalva={(b)=>{ Object.assign(modifica.f, daBozza(b)); setModifica(null); forza(); }}/>}
      {elimina && <RieConfermaElimina riga={elimina}
        onChiudi={()=>setElimina(null)}
        onConferma={()=>{
          const k = FORMAZIONE.indexOf(elimina.f);
          if (k >= 0) FORMAZIONE.splice(k, 1);
          setElimina(null); setModifica(null); forza();
        }}/>}
    </div>
  );
}

// ─── Test di ripristino dei backup (A.8.13) ────────────────────────────────
// Vive in Diagnostica e non fra i registri di Conformita: chi guarda se il
// ripristino funziona sta guardando la salute tecnica della piattaforma, non
// preparando un audit. L'obbligo resta e resta tracciato dal cruscotto — quello
// che si e spostato e il posto dove si legge il registro.
function CfTestRipristino() {
  // La pagina si apre per sapere se le cose funzionano ADESSO: la risposta e una
  // riga — ultimo test, tempo, entro o fuori obiettivo. Il test vero, va detto,
  // si fa altrove: qui c'e il registro, e il numero che vale e il tempo contro
  // l'obiettivo, non l'esito.
  const sRest = cfStatoAdempimento(rieAdemp('rest') || {});
  const ripristini = RIPRISTINI.slice().sort((a, b) => b.data.getTime() - a.data.getTime());
  const ultimoRest = ripristini[0];
  const bRest = rieBanda(!ultimoRest ? 'DANGER' : sRest.stato === 'ok' ? 'NEUTRAL' : sRest.tono);
  return (
      <div>
        <div style={{...RIE_BANDA, background:bRest.bg, border:`1px solid ${bRest.bd}`}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:14.5, fontWeight:800, color:bRest.fg}}>
              {ultimoRest
                ? `Ultimo test il ${cfFmt(ultimoRest.data)} · ${ultimoRest.esito} in ${ultimoRest.tempoMin} minuti`
                : 'Nessun test di ripristino registrato'}
            </div>
            <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
              {ultimoRest
                ? `A.8.13 · ${ultimoRest.oggetto} · eseguito da ${ultimoRest.chi} · obiettivo di tempo ${RIE_RTO_MIN} minuti`
                : 'A.8.13 · il backup che non è mai stato ripristinato non è un backup'}
            </div>
          </div>
          <div style={{textAlign:'right', flexShrink:0}}>
            <CfPill tono={sRest.tono}>{sRest.label}</CfPill>
            <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:5}}>prossimo entro il {cfFmt(sRest.prossima)}</div>
          </div>
        </div>

        {/* Lo storico dei ripristini è passato nel Cruscotto, dentro
            l'adempimento A.8.13: è lì che un auditor chiede «e la volta
            prima?», e lì c'è anche la scadenza che quella domanda genera. Qui
            resta l'unica cosa che serve a chi apre Diagnostica: se il
            ripristino funziona adesso, e in quanto tempo. */}

      </div>
  );
}

window.CfAudit = CfAudit;
window.CfFormazione = CfFormazione;
window.CfTestRipristino = CfTestRipristino;

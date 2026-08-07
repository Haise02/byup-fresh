// Statistiche — Clienti · sub-tab Fidelizzazione

// ─── Le due provenienze ────────────────────────────────────────
// Non sono la stessa cosa e la card non deve farle sembrare tali: una
// recensione byup nasce da un ordine pagato qui — si sa che quella persona c'è
// stata e cosa ha mangiato — una recensione Google la lascia chiunque abbia un
// account Google. Da qui due segni diversi: il corallo del marchio da una
// parte, la G di Google dall'altra.
const CLI_FONTI = {
  byup:   { et:'byup',   colore: PN.PINK,  sfondo: PN.PINK_BG_SOFT, bordo:'#FBD3D1' },
  google: { et:'Google', colore:'#4285F4', sfondo:'#EDF3FE',        bordo:'#D6E4FB' },
};

function CliFonte({ fonte, grande }) {
  const f = CLI_FONTI[fonte] || CLI_FONTI.byup;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 5,
      padding: grande ? '4px 10px' : '2px 8px', borderRadius: 999,
      background: f.sfondo, border:`1px solid ${f.bordo}`, color: f.colore,
      fontSize: grande ? 13 : 12, fontWeight: 700, whiteSpace:'nowrap',
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: 4, flexShrink: 0,
        background: f.colore, color:'#fff',
        display:'grid', placeItems:'center',
        fontSize: 9.5, fontWeight: 800, lineHeight: 1,
      }}>{fonte === 'google' ? 'G' : 'b'}</span>
      {f.et}
    </span>
  );
}

// ─── Stelle ────────────────────────────────────────────────────
// Cinque stelle grigie e sopra le stesse in ambra, tagliate alla frazione
// giusta: prima ne stampava cinque piene anche per un 4,5, che è il modo più
// veloce per far sembrare finto un numero vero.
function CliStelle({ voto, lato = 16 }) {
  const stella = (colore, i) => (
    <svg key={i} width={lato} height={lato} viewBox="0 0 24 24" fill={colore} style={{display:'block'}}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
  return (
    <span style={{position:'relative', display:'inline-flex', gap: 2, lineHeight: 0}} title={`${voto} su 5`}>
      {[0,1,2,3,4].map(i => stella(PN.WHITE_FROST, i))}
      <span style={{
        position:'absolute', top: 0, left: 0, display:'inline-flex', gap: 2,
        width: `${(voto / 5) * 100}%`, overflow:'hidden',
      }}>
        {[0,1,2,3,4].map(i => stella(PN.AMBER, i))}
      </span>
    </span>
  );
}

// ─── Le recensioni ─────────────────────────────────────────────
// Con dodici ci si sta, con cento no: l'elenco scorre dentro la card invece
// di allungarla, e sopra ci sono i filtri che servono a chi le legge —
// provenienza, stelle, e la categoria di problema che il cliente ha toccato
// nell'app dopo il pagamento (gli `aspetti`: sotto le tre stelle l'app
// propone «Attesa lunga», «Pulizia», «Rumore»…). Non è un'interpretazione
// nostra del testo: è la casella che ha spuntato lui.
// Il filtro per problema esiste solo per le byup, perché solo lì c'è: Google
// raccoglie stelle e testo, punto.
function CliRecensioni({ elenco }) {
  const [fonte, setFonte] = React.useState('tutte');
  const [stelle, setStelle] = React.useState(0);      // 0 = tutte
  const [problema, setProblema] = React.useState('');  // '' = tutti
  const [segnalate, setSegnalate] = React.useState({});
  const [inSegnalazione, setInSegnalazione] = React.useState(null);

  const chiave = (r) => `${r.autore}·${r.quando}`;
  // I problemi da mettere nella tendina sono quelli davvero presenti, col loro
  // conteggio: un elenco di categorie vuote è un elenco di vicoli ciechi.
  const problemi = Object.entries(
    elenco.reduce((acc, r) => {
      (r.aspetti || []).filter(a => (STAT_ASPETTI[a] || {}).problema).forEach(a => { acc[a] = (acc[a] || 0) + 1; });
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const visibili = elenco.filter(r =>
    (fonte === 'tutte' || r.fonte === fonte) &&
    (!stelle || r.stelle === stelle) &&
    (!problema || (r.aspetti || []).includes(problema))
  );

  const pillola = (attiva) => ({
    padding:'5px 11px', borderRadius: 999, border:'none',
    background: attiva ? PN.WHITE : 'transparent',
    boxShadow: attiva ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
    color: attiva ? PN.TEXT : PN.MUTED,
    fontSize: 13.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
    display:'inline-flex', alignItems:'center', gap: 5,
  });

  return (
    <StatCard title="Cosa scrivono" sub={`${elenco.length} recensioni nel periodo · ne vedi ${visibili.length}`} action={
      <div style={{display:'inline-flex', gap: 5, padding: 4, background: PN.WHITE_HUSH, borderRadius: 999}}>
        {[
          { id:'tutte',  et:'Tutte' },
          { id:'byup',   et:'byup' },
          { id:'google', et:'Google' },
        ].map(f => (
          <button key={f.id} onClick={() => { setFonte(f.id); if (f.id === 'google') setProblema(''); }} style={pillola(fonte === f.id)}>
            {f.et}
            <span style={{color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>
              {f.id === 'tutte' ? elenco.length : elenco.filter(r => r.fonte === f.id).length}
            </span>
          </button>
        ))}
      </div>
    }>
      {/* Barra dei filtri: le stelle a pillole perché sono sei e si scelgono a
          colpo d'occhio, i problemi in una tendina perché sono tanti e hanno
          nomi lunghi. */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap',
        paddingBottom: 13, marginBottom: 13, borderBottom:`1px solid ${PN.BORDER_SOFT}`,
      }}>
        <div style={{display:'inline-flex', gap: 5, padding: 4, background: PN.WHITE_HUSH, borderRadius: 999}}>
          <button onClick={() => setStelle(0)} style={pillola(stelle === 0)}>Tutte le stelle</button>
          {[5,4,3,2,1].map(v => {
            const n = elenco.filter(r => r.stelle === v).length;
            return (
              <button key={v} onClick={() => setStelle(v)} disabled={!n} style={{
                ...pillola(stelle === v),
                opacity: n ? 1 : 0.4, cursor: n ? 'pointer' : 'default',
              }}>
                {v}<span style={{color: PN.AMBER, fontSize: 11.5}}>★</span>
                <span style={{color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>{n}</span>
              </button>
            );
          })}
        </div>

        <label style={{display:'inline-flex', alignItems:'center', gap: 8, fontSize: 13.5, color: PN.MUTED}}>
          Problema segnalato
          <select value={problema} onChange={e => { setProblema(e.target.value); if (e.target.value) setFonte('byup'); }}
            style={{
              padding:'7px 11px', borderRadius: 9, border:`1px solid ${PN.BORDER}`,
              background: PN.WHITE, color: PN.TEXT, fontSize: 14, fontFamily:'inherit',
            }}>
            <option value="">Tutti</option>
            {problemi.map(([id, n]) => (
              <option key={id} value={id}>{STAT_ASPETTI[id].emoji} {STAT_ASPETTI[id].et} ({n})</option>
            ))}
          </select>
        </label>
      </div>

      {/* L'elenco scorre: la card resta alta uguale con dodici recensioni e
          con cento, e i filtri restano sempre sott'occhio invece di finire
          due schermate più su. */}
      <div className="pn-scroll" style={{
        maxHeight: 460, overflowY:'auto', paddingRight: 4,
        display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, alignContent:'start',
      }}>
        {visibili.map((r, i) => {
          const segn = segnalate[chiave(r)];
          return (
            <div key={i} style={{
              border:`1px solid ${segn ? PN.AMBER_SOFT : PN.BORDER}`, borderRadius: 12, padding: 14,
              background: segn ? '#FFFCF3' : PN.WHITE, minWidth: 0,
              display:'flex', flexDirection:'column', gap: 9,
            }}>
              <div style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
                <span style={{
                  width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
                  background: r.bg, color:'#fff',
                  display:'grid', placeItems:'center',
                  fontSize: 13.5, fontWeight: 700,
                }}>{r.iniziale}</span>
                <span style={{flex: 1, minWidth: 0}}>
                  <span style={{display:'block', fontSize: 14.5, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.autore}</span>
                  <span style={{display:'flex', alignItems:'center', gap: 7}}>
                    <CliStelle voto={r.stelle} lato={12}/>
                    <span style={{fontSize: 12.5, color: PN.MUTED_SOFT, whiteSpace:'nowrap'}}>{r.quando}</span>
                  </span>
                </span>
                <CliFonte fonte={r.fonte}/>
              </div>

              <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.45}}>«{r.testo}»</div>

              {/* Gli aspetti che ha toccato nell'app. In rosso quelli negativi:
                  sono i problemi che ha segnalato lui, e sono la ragione per
                  cui la tendina qui sopra può filtrarli. */}
              {(r.aspetti || []).length > 0 && (
                <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
                  {r.aspetti.map(a => {
                    const asp = STAT_ASPETTI[a]; if (!asp) return null;
                    return (
                      <span key={a} style={{
                        display:'inline-flex', alignItems:'center', gap: 5,
                        padding:'3px 9px', borderRadius: 999,
                        background: asp.problema ? PN.RED_SOFT : PN.WHITE_HUSH,
                        color: asp.problema ? '#991b1b' : PN.MUTED,
                        fontSize: 12.5, fontWeight: 600, whiteSpace:'nowrap',
                      }}>{asp.emoji} {asp.et}</span>
                    );
                  })}
                </div>
              )}

              <div style={{
                marginTop:'auto', paddingTop: 9, borderTop:`1px solid ${PN.BORDER_SOFT}`,
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
              }}>
                {/* La riga che solo byup può scrivere: la recensione nasce da
                    un ordine pagato qui, quindi si sa che quella persona c'è
                    stata e cosa ha mangiato. Su Google non c'è modo di
                    saperlo, e infatti lì non c'è. */}
                {r.fonte === 'byup' ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 13, color: PN.GREEN, minWidth: 0}}>
                    <Icon name="status-success" size={13}/>
                    <span style={{color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      Ordine verificato · <strong style={{color: PN.TEXT, fontWeight: 600}}>{r.piatto}</strong>
                    </span>
                  </span>
                ) : (
                  <span style={{fontSize: 13, color: PN.MUTED_SOFT}}>Nessun ordine collegato</span>
                )}

                {segn ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 5, flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: PN.AMBER, whiteSpace:'nowrap'}}>
                    <Icon name="status-pending" size={12}/> Segnalata
                  </span>
                ) : (
                  <button onClick={() => setInSegnalazione(r)}
                    onMouseEnter={e => { e.currentTarget.style.background = PN.RED_SOFT; e.currentTarget.style.color = PN.RED; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
                    style={{
                      flexShrink: 0, display:'inline-flex', alignItems:'center', gap: 5,
                      padding:'4px 9px', borderRadius: 8, border:'none', background:'transparent',
                      color: PN.MUTED, fontSize: 12.5, fontWeight: 600,
                      fontFamily:'inherit', cursor:'pointer', transition:'background 140ms ease, color 140ms ease',
                    }}><Icon name="status-warning" size={12}/> Segnala</button>
                )}
              </div>
            </div>
          );
        })}
        {!visibili.length && (
          <div style={{gridColumn:'1 / -1', padding:'26px 0', textAlign:'center', fontSize: 14.5, color: PN.MUTED_SOFT}}>
            Nessuna recensione con questi filtri.
          </div>
        )}
      </div>

      {inSegnalazione && (
        <CliSegnala recensione={inSegnalazione}
          onChiudi={() => setInSegnalazione(null)}
          onInvia={() => { setSegnalate(s => ({...s, [chiave(inSegnalazione)]: true})); setInSegnalazione(null); }}/>
      )}
    </StatCard>
  );
}

// ─── Segnalare una recensione ──────────────────────────────────
// Dove finisce la segnalazione dipende da dove sta la recensione, e va detto
// prima di premere: quelle byup le esamina il team byup, che sull'archivio
// degli ordini può verificare se quella persona c'è stata davvero; quelle
// Google si possono solo inoltrare a Google, e decide Google.
function CliSegnala({ recensione, onChiudi, onInvia }) {
  const [motivo, setMotivo] = React.useState(null);
  const [dettagli, setDettagli] = React.useState('');
  const suGoogle = recensione.fonte === 'google';

  React.useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onChiudi(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onChiudi]);

  return (
    <>
      <div onClick={onChiudi} style={{position:'absolute', inset: 0, background:'rgba(15,17,21,0.32)', zIndex: 74}}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
        width: 440, maxHeight:'82%', zIndex: 75,
        background: PN.WHITE, borderRadius: 16, boxShadow:'0 24px 60px rgba(15,17,21,0.24)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'18px 20px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 12}}>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Segnala la recensione</div>
              <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>
                di {recensione.autore} · {recensione.quando}
              </div>
            </div>
            <button onClick={onChiudi} aria-label="Chiudi" style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              border:'none', background: PN.WHITE_HUSH, color: PN.TEXT,
              cursor:'pointer', display:'grid', placeItems:'center',
            }}><Icon name="xmark" size={14}/></button>
          </div>
        </div>

        <div className="pn-scroll" style={{flex: 1, overflowY:'auto', padding:'14px 20px 18px'}}>
          <div style={{
            padding:'11px 13px', borderRadius: 10, marginBottom: 14,
            background: suGoogle ? '#EDF3FE' : PN.PINK_BG_SOFT,
            fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45,
          }}>
            {suGoogle
              ? <>Questa recensione sta su <strong style={{color: PN.TEXT}}>Google</strong>: la segnalazione viene inoltrata a loro e la decisione è di Google. Noi non possiamo rimuoverla.</>
              : <>Questa recensione è <strong style={{color: PN.TEXT}}>byup</strong>: la esamina il nostro team, che dall'ordine collegato può verificare se quella persona è stata davvero qui.</>}
          </div>

          <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 8}}>
            Motivo
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 7}}>
            {STAT_MOTIVI_SEGNALAZIONE.map(m => (
              <button key={m} onClick={() => setMotivo(m)} style={{
                textAlign:'left', padding:'11px 13px', borderRadius: 10,
                border:`1.5px solid ${motivo === m ? PN.PINK : PN.BORDER}`,
                background: motivo === m ? PN.PINK_BG_SOFT : PN.WHITE,
                fontSize: 14.5, color: PN.TEXT, fontWeight: motivo === m ? 600 : 500,
                fontFamily:'inherit', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
              }}>
                {m}
                {motivo === m && <Icon name="check" size={14} color={PN.PINK}/>}
              </button>
            ))}
          </div>

          <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, margin:'16px 0 8px'}}>
            Dettagli <span style={{fontWeight: 500, textTransform:'none', letterSpacing: 0}}>(facoltativo)</span>
          </div>
          <textarea value={dettagli} onChange={e => setDettagli(e.target.value)} rows={3}
            placeholder="Quello che può servire a chi la esamina: cosa non torna, cosa è successo davvero…"
            style={{
              width:'100%', boxSizing:'border-box', padding:'11px 12px',
              border:`1px solid ${PN.BORDER}`, borderRadius: 10,
              fontSize: 14.5, fontFamily:'inherit', color: PN.TEXT, lineHeight: 1.5,
              resize:'none', outline:'none',
            }}/>
        </div>

        <div style={{padding:'13px 20px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', justifyContent:'flex-end', gap: 9}}>
          <button onClick={onChiudi} style={{
            padding:'9px 16px', borderRadius: 10, border:`1px solid ${PN.BORDER}`,
            background: PN.WHITE, color: PN.TEXT, fontSize: 14.5, fontWeight: 600,
            fontFamily:'inherit', cursor:'pointer',
          }}>Annulla</button>
          <button onClick={onInvia} disabled={!motivo} style={{
            padding:'9px 16px', borderRadius: 10, border:'none',
            background: motivo ? PN.TEXT : PN.WHITE_FROST,
            color: motivo ? '#fff' : PN.MUTED_SOFT,
            fontSize: 14.5, fontWeight: 700, fontFamily:'inherit',
            cursor: motivo ? 'pointer' : 'default',
          }}>{suGoogle ? 'Inoltra a Google' : 'Invia al team byup'}</button>
        </div>
      </div>
    </>
  );
}

function StatClienti() {
  const d = STAT_CLIENTI;
  const totRev = d.starBreakdown.reduce((s, r) => s + r.count, 0);
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI nella card tinta delle altre sezioni. Qui sono due, quindi c'è la
          larghezza per la variante piena — come in Ordini — e le etichette
          stanno per esteso. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpiTinto tono="blu" icona="people-customer" label="Clienti unici"
          valore={d.unici.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.unici.delta} sub="Persone diverse nel periodo" trend={d.unici.trend}/>
        <StatKpiTinto tono="viola" icona="time-history" label="Clienti abituali"
          valore={d.abituali.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.abituali.delta} sub="Tornati almeno due volte negli ultimi 90 giorni" trend={d.abituali.trend}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16}}>
        <StatCard title="Valutazioni" sub={`${d.recensioni} recensioni, da due posti diversi`}>
          <div style={{display:'flex', alignItems:'center', gap: 22}}>
            <div style={{flexShrink: 0}}>
              <div style={{display:'flex', alignItems:'baseline', gap: 4}}>
                <span style={{fontSize: 44, fontWeight: 700, color: PN.TEXT, letterSpacing:-1, lineHeight: 1}}>
                  {d.rating.toFixed(1).replace('.', ',')}
                </span>
                <span style={{fontSize: 17, color: PN.MUTED_SOFT, fontWeight: 600}}>/5</span>
              </div>
              <div style={{marginTop: 8}}><CliStelle voto={d.rating} lato={18}/></div>
            </div>
            {/* Le fasce: barra sottile, il conteggio e la quota. Il numero di
                stelle si legge dalla stellina accanto alla cifra, non da una
                fila di caratteri. */}
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 5, minWidth: 0}}>
              {[5,4,3,2,1].map(stelle => {
                const riga = d.starBreakdown.find(r => r.stars === stelle);
                const pct = (riga.count / totRev) * 100;
                return (
                  <div key={stelle} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 13.5}}>
                    <span style={{
                      width: 26, display:'inline-flex', alignItems:'center', gap: 3,
                      color: PN.MUTED, fontWeight: 600, fontVariantNumeric:'tabular-nums',
                    }}>{stelle}<span style={{color: PN.AMBER, fontSize: 11}}>★</span></span>
                    <span style={{flex: 1, height: 7, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden', minWidth: 24}}>
                      <span style={{display:'block', height:'100%', width:`${pct}%`, background: PN.AMBER, borderRadius: 999}}/>
                    </span>
                    <span style={{width: 34, textAlign:'right', color: PN.TEXT, fontVariantNumeric:'tabular-nums', fontWeight: 600}}>{riga.count}</span>
                    <span style={{width: 34, textAlign:'right', color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Le due provenienze con la loro media: è qui che si vede che i
              clienti byup — quelli che hanno davvero ordinato — votano più
              alto di chi passa da Google. */}
          <div style={{
            marginTop: 16, paddingTop: 14, borderTop:`1px solid ${PN.BORDER_SOFT}`,
            display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12,
          }}>
            {['byup', 'google'].map(k => (
              <div key={k} style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
                <CliFonte fonte={k} grande/>
                <span style={{display:'flex', alignItems:'baseline', gap: 6, minWidth: 0}}>
                  <strong style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
                    {d.fonti[k].media.toFixed(1).replace('.', ',')}
                  </strong>
                  <span style={{fontSize: 13.5, color: PN.MUTED, whiteSpace:'nowrap'}}>su {d.fonti[k].n} recensioni</span>
                </span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="Trend valutazione" sub="Andamento ultimi 12 mesi">
          {(() => {
            // Serie unica: linea 2.4 con wash sotto, punto solo alla fine
            // col valore corrente; assi hairline, etichette 11px.
            const tW = 460, tH = 190, tP = { l: 30, r: 44, t: 14, b: 24 };
            const tx = (i) => tP.l + (i / (d.ratingTrend.length - 1)) * (tW - tP.l - tP.r);
            const ty = (v) => tH - tP.b - ((v - 3.5) / 1.5) * (tH - tP.t - tP.b);
            const line = d.ratingTrend.map((v, i) => `${i===0?'M':'L'}${tx(i)},${ty(v)}`).join(' ');
            const area = `${line} L ${tx(d.ratingTrend.length - 1)},${tH - tP.b} L ${tP.l},${tH - tP.b} Z`;
            const last = d.ratingTrend[d.ratingTrend.length - 1];
            return (
              <svg viewBox={`0 0 ${tW} ${tH}`} style={{width:'100%', display:'block'}}>
                {[3.5, 4.0, 4.5, 5.0].map((v, i) => (
                  <g key={i}>
                    <line x1={tP.l} y1={ty(v)} x2={tW - tP.r + 16} y2={ty(v)} stroke={PN.BORDER_SOFT} strokeWidth={1}/>
                    <text x={tP.l - 8} y={ty(v) + 4} fontSize="11" fill={PN.MUTED} textAnchor="end">{v.toFixed(1)}</text>
                  </g>
                ))}
                <path d={area} fill={PN.PINK} opacity={0.08}/>
                <path d={line} fill="none" stroke={PN.WHITE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/>
                <path d={line} fill="none" stroke={PN.PINK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx={tx(d.ratingTrend.length - 1)} cy={ty(last)} r={4.5} fill={PN.PINK} stroke={PN.WHITE} strokeWidth={2}/>
                <text x={tx(d.ratingTrend.length - 1) + 11} y={ty(last) + 4} fontSize="12.5" fontWeight="700" fill={PN.TEXT}>{last.toLocaleString('it-IT')}</text>
                {months.map((m, i) => i % 2 === 0 && (
                  <text key={i} x={tx(i)} y={tH - 6} fontSize="11" fill={PN.MUTED} textAnchor="middle">{m}</text>
                ))}
              </svg>
            );
          })()}
        </StatCard>
      </div>

      <CliRecensioni elenco={d.feedback}/>

      <StatCard title="Ciclo di vita del cliente" sub="Distribuzione clienti per frequenza di ritorno">
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr 1fr',
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span>Stato cliente</span>
            <span style={{textAlign:'right'}}>N. clienti</span>
            <span>% sul totale</span>
            <span style={{textAlign:'right'}}>vs periodo prec.</span>
          </div>
          {d.ciclo.map((r, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr 1fr',
              padding:'10px 16px', alignItems:'center',
              fontSize: 15, color: PN.TEXT,
              background: i % 2 === 1 ? '#FAFAFB' : PN.WHITE,
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <span style={{fontWeight: 600}}>{r.stato}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700}}>{r.n}</span>
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <div style={{flex: 1}}><StatBar pct={r.pct} height={8}/></div>
                <span style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums', minWidth: 32, textAlign:'right'}}>{r.pct}%</span>
              </div>
              <span style={{textAlign:'right'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 4,
                  padding:'3px 9px', borderRadius: 999,
                  background: PN.GREEN_SOFT, color: PN.GREEN,
                  fontSize: 14, fontWeight: 700,
                }}>↑ {r.delta}%</span>
              </span>
            </div>
          ))}
        </div>
      </StatCard>

      <StatFuori/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUORI DA QUI · cosa ordinano i tuoi clienti negli altri locali byup
//
// Il dato che un gestionale da solo non può avere, e che la rete sì: la stessa
// persona ordina col suo account anche altrove. Una classifica e basta —
// leggerla e capire cosa farne è mestiere di chi ha il locale, non nostro.
function StatFuori() {
  const d = window.STAT_FUORI;
  if (!d) return null;

  // La classifica è sugli ordini, quindi l'ordine delle righe pure: una lista
  // ordinata su un numero che non si vede si legge come un errore.
  const righe = [...d.prodotti].sort((a, b) => b.ordini - a.ordini);

  return (
    <StatCard
      title="I tuoi clienti fuori da qui"
      sub={`Cosa ordinano più spesso negli altri locali byup entro ${d.raggioKm} km`}
    >
      {/* La lettura prima della classifica: senza, sono dieci righe di piatti
          che non si capisce cosa c'entrino col proprio locale. */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
        padding:'12px 14px', borderRadius: 12, marginBottom: 14,
        background: PN.PINK_BG_SOFT, border: `1px solid ${PN.PINK_SOFT}`,
      }}>
        <span style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: PN.WHITE, color: PN.PINK,
          display:'grid', placeItems:'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
        </span>
        <span style={{flex: 1, minWidth: 240, fontSize: 15, color: PN.TEXT, lineHeight: 1.5}}>
          <b>{d.clientiTracciati} dei tuoi clienti</b> ({d.quotaSulTotale}% del totale) ordinano anche in altri
          {' '}{d.localiZona} locali byup qui intorno.
        </span>
      </div>

      {/* Dieci righe di due dati soli, su una tabella larga mille pixel, sono
          un elenco perso nel bianco: due colonne da cinque riempiono la
          larghezza e accorciano la strada fra il nome e il suo numero. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', columnGap: 36}}>
        {[0, 1].map(col => (
          <div key={col}>
            <div style={{
              display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 10,
              padding:'0 4px 8px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
              fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
              textTransform:'uppercase', letterSpacing: 0.5,
            }}>
              <span>Prodotto</span>
              <span>Ordini</span>
            </div>

            {righe.slice(col * 5, col * 5 + 5).map((p, i) => {
              const pos = col * 5 + i + 1;
              const podio = pos <= 3;
              return (
                <div key={p.nome} style={{
                  display:'flex', alignItems:'center', gap: 12,
                  padding:'12px 4px',
                  borderBottom: i === 4 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                }}>
                  {/* La posizione è una pastiglia, non una colonna: i primi tre
                      si accendono, gli altri restano quieti. */}
                  <span style={{
                    width: 24, height: 24, borderRadius:'50%', flexShrink: 0,
                    display:'grid', placeItems:'center',
                    background: podio ? PN.PINK_SOFT : PN.WHITE_FROST,
                    color: podio ? PN.PINK_DARK : PN.MUTED,
                    fontSize: 12.5, fontWeight: 800, fontVariantNumeric:'tabular-nums',
                  }}>{pos}</span>

                  <span style={{flex: 1, minWidth: 0}}>
                    <span style={{
                      display:'block', fontSize: 15.5, fontWeight: 600, color: PN.TEXT,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight: 1.3,
                    }}>{p.nome}</span>
                    <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{p.cat}</span>
                  </span>

                  <span style={{
                    fontSize: 19, fontWeight: 700, color: PN.TEXT,
                    fontVariantNumeric:'tabular-nums', letterSpacing:-0.3,
                  }}>{p.ordini}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </StatCard>
  );
}

window.StatClienti = StatClienti;
window.StatFuori = StatFuori;

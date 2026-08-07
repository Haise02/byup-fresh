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
// Un voto medio è una frazione e va mostrata come tale: cinque stelle grigie e
// sopra le stesse in ambra, tagliate al punto giusto — prima ne stampava
// cinque piene anche per un 4,5, che è il modo più veloce per far sembrare
// finto un numero vero.
// Il voto di UNA recensione invece è un intero, e lì il taglio non serve: la
// striscia ritagliata finisce sempre a filo di stella e a tredici pixel si
// legge come un errore di disegno. Quando il voto è intero, quindi, stelle
// intere: accese fino al voto, spente dopo.
function CliStelle({ voto, lato = 16 }) {
  const stella = (colore, i) => (
    <svg key={i} width={lato} height={lato} viewBox="0 0 24 24" fill={colore} style={{display:'block'}}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
  const spenta = PN.BORDER;

  if (Number.isInteger(voto)) {
    return (
      <span style={{display:'inline-flex', gap: 2, lineHeight: 0}} title={`${voto} su 5`}>
        {[0,1,2,3,4].map(i => stella(i < voto ? PN.AMBER : spenta, i))}
      </span>
    );
  }

  return (
    <span style={{position:'relative', display:'inline-flex', gap: 2, lineHeight: 0}} title={`${voto} su 5`}>
      {[0,1,2,3,4].map(i => stella(spenta, i))}
      <span style={{
        position:'absolute', top: 0, left: 0, display:'inline-flex', gap: 2,
        width: `${(voto / 5) * 100}%`, overflow:'hidden',
      }}>
        {[0,1,2,3,4].map(i => stella(PN.AMBER, i))}
      </span>
    </span>
  );
}

// ─── Pillole ───────────────────────────────────────────────────
// Un disegno solo per tutte le scelte di questa pagina — provenienza, stelle,
// problemi o pregi — così si legge che sono la stessa famiglia di comandi.
const CLI_PILLOLE = {
  display:'inline-flex', gap: 5, padding: 4,
  background: PN.WHITE_HUSH, borderRadius: 999,
};
const cliPillola = (attiva) => ({
  padding:'5px 11px', borderRadius: 999, border:'none',
  background: attiva ? PN.WHITE : 'transparent',
  boxShadow: attiva ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
  color: attiva ? PN.TEXT : PN.MUTED,
  fontSize: 13.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
  display:'inline-flex', alignItems:'center', gap: 5,
});

// Il conteggio di una casella sui dodici mesi, che sta nell'aggregato e non
// nelle dodici recensioni in pagina: servono tutti e due insieme, perché uno
// dice quanto pesa il problema e l'altro fa leggere cos'è successo.
function cliConta(aspetti, id) {
  if (!aspetti) return null;
  for (const g of Object.values(aspetti)) {
    const v = g.voci.find(x => x.id === id);
    if (v) return { n: v.n, su: g.su };
  }
  return null;
}

// ─── Il voto ───────────────────────────────────────────────────
// Il pannello che risponde alla prima domanda — quanto ti votano — e subito
// alla seconda: com'è fatto quel numero e da dove arriva. Le barre da tre
// stelle in su sono ambra, quelle da due in giù rosse: sono le stesse
// recensioni da cui nasce la classifica dei problemi in fondo alla card, e il
// colore le tiene legate invece di lasciarle due tabelle scollegate.
function CliVoto({ d }) {
  const tot = d.starBreakdown.reduce((s, r) => s + r.count, 0);
  return (
    <div style={{
      background: PN.WHITE_OFF, border:`1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 14, padding: 18, minWidth: 0,
      display:'flex', flexDirection:'column', gap: 15,
    }}>
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap: 5}}>
          <span style={{fontSize: 50, fontWeight: 700, color: PN.TEXT, letterSpacing:-1.5, lineHeight: 1}}>
            {d.rating.toFixed(1).replace('.', ',')}
          </span>
          <span style={{fontSize: 17, color: PN.MUTED_SOFT, fontWeight: 600}}>/5</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 9, marginTop: 10, flexWrap:'wrap'}}>
          <CliStelle voto={d.rating} lato={18}/>
          <span style={{fontSize: 13.5, color: PN.MUTED}}>
            su {d.recensioni.toLocaleString('it-IT', {useGrouping: true})} recensioni
          </span>
        </div>
      </div>

      <div style={{
        display:'flex', flexDirection:'column', gap: 6,
        paddingTop: 15, borderTop:`1px solid ${PN.BORDER}`,
      }}>
        {[5,4,3,2,1].map(stelle => {
          const riga = d.starBreakdown.find(r => r.stars === stelle);
          const pct = (riga.count / tot) * 100;
          const basso = stelle <= 2;
          return (
            <div key={stelle} style={{display:'flex', alignItems:'center', gap: 9, fontSize: 13}}>
              <span style={{
                width: 24, display:'inline-flex', alignItems:'center', gap: 3,
                color: PN.MUTED, fontWeight: 600, fontVariantNumeric:'tabular-nums',
              }}>{stelle}<span style={{color: PN.AMBER, fontSize: 11}}>★</span></span>
              <span style={{flex: 1, height: 6, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden', minWidth: 24}}>
                <span style={{
                  display:'block', height:'100%', width:`${pct}%`, borderRadius: 999,
                  background: basso ? PN.RED : PN.AMBER, opacity: basso ? 0.75 : 1,
                }}/>
              </span>
              <span style={{width: 32, textAlign:'right', color: PN.TEXT, fontVariantNumeric:'tabular-nums', fontWeight: 600}}>{riga.count}</span>
              <span style={{width: 30, textAlign:'right', color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>{Math.round(pct)}%</span>
            </div>
          );
        })}
      </div>

      {/* Le due provenienze con la loro media: è qui che si vede che i clienti
          byup — quelli che hanno davvero ordinato — votano più alto di chi
          passa da Google. */}
      <div style={{
        display:'flex', flexDirection:'column', gap: 9, marginTop:'auto',
        paddingTop: 15, borderTop:`1px solid ${PN.BORDER}`,
      }}>
        {['byup', 'google'].map(k => (
          <div key={k} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, minWidth: 0}}>
            <CliFonte fonte={k} grande/>
            <span style={{display:'inline-flex', alignItems:'baseline', gap: 7, flexShrink: 0}}>
              <strong style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
                {d.fonti[k].media.toFixed(1).replace('.', ',')}
              </strong>
              <span style={{fontSize: 13, color: PN.MUTED_SOFT, whiteSpace:'nowrap'}}>su {d.fonti[k].n}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── L'andamento ───────────────────────────────────────────────
// Quante ne arrivano e come vanno, nello stesso disegno: sono due domande che
// ci si fa insieme. Le barre sono il numero di recensioni del mese e partono
// da zero, come devono; la media è una linea con la sua scala a destra, perché
// una barra da 3,5 a 5 gonfierebbe differenze di un decimo.
function CliAndamento({ d, mesiEt }) {
  // L'altezza è tarata sulla colonna accanto: il grafico deve finire dove
  // finisce il pannello del voto, altrimenti mezza card resta bianca a destra.
  const W = 640, H = 272, P = { l: 4, r: 34, t: 24, b: 28 };
  const mesi = d.recensioniMese;
  const maxN = Math.max(...mesi);
  const passo = (W - P.l - P.r) / mesi.length;
  const larghezza = Math.min(26, passo * 0.52);
  const xc = (i) => P.l + passo * (i + 0.5);
  const yBarra = (n) => H - P.b - (n / maxN) * (H - P.t - P.b);
  const yVoto = (v) => H - P.b - ((v - 3.5) / 1.5) * (H - P.t - P.b);
  const linea = d.ratingTrend.map((v, i) => `${i === 0 ? 'M' : 'L'}${xc(i)},${yVoto(v)}`).join(' ');
  const ultimo = d.ratingTrend[d.ratingTrend.length - 1];

  return (
    <div style={{minWidth: 0, display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', alignItems:'center', gap: 16, marginBottom: 8}}>
        <span style={{display:'inline-flex', alignItems:'center', gap: 7, fontSize: 13.5, color: PN.MUTED}}>
          <span style={{width: 10, height: 10, borderRadius: 3, background: PN.PINK, opacity: 0.32}}/>
          recensioni del mese
        </span>
        <span style={{display:'inline-flex', alignItems:'center', gap: 7, fontSize: 13.5, color: PN.MUTED}}>
          <span style={{width: 14, height: 2.5, borderRadius: 2, background: PN.AMBER}}/>
          media, da 3,5 a 5
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', display:'block', margin:'auto 0'}}>
        {[3.5, 4, 4.5, 5].map(v => (
          <g key={v}>
            <line x1={P.l} y1={yVoto(v)} x2={W - P.r + 6} y2={yVoto(v)} stroke={PN.BORDER_SOFT} strokeWidth={1}/>
            <text x={W - P.r + 10} y={yVoto(v) + 4} fontSize="11" fill={PN.MUTED_SOFT}>{v.toFixed(1).replace('.', ',')}</text>
          </g>
        ))}
        {mesi.map((n, i) => (
          <g key={i}>
            <rect x={xc(i) - larghezza / 2} y={yBarra(n)} width={larghezza} height={H - P.b - yBarra(n)}
              rx={4} fill={PN.PINK} opacity={0.30}/>
            <text x={xc(i)} y={yBarra(n) - 6} fontSize="11" fill={PN.MUTED} textAnchor="middle"
              style={{fontVariantNumeric:'tabular-nums'}}>{n}</text>
          </g>
        ))}
        {/* La linea passa sopra le barre: filo bianco sotto perché resti
            staccata dal colore che attraversa. */}
        <path d={linea} fill="none" stroke={PN.WHITE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/>
        <path d={linea} fill="none" stroke={PN.AMBER} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={xc(d.ratingTrend.length - 1)} cy={yVoto(ultimo)} r={4.5} fill={PN.AMBER} stroke={PN.WHITE} strokeWidth={2}/>
        {mesiEt.map((m, i) => (
          <text key={i} x={xc(i)} y={H - 7} fontSize="11" fill={PN.MUTED_SOFT} textAnchor="middle">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Le caselle toccate nell'app ───────────────────────────────
// Dopo il pagamento l'app non chiede solo le stelle: da due in giù propone i
// problemi («Attesa lunga», «Pulizia», «Rumore»…), da tre in su i pregi, e il
// cliente ne spunta quanti vuole. Non è una nostra lettura del testo — è la
// casella che ha premuto lui — ed è l'unico pezzo di questa pagina su cui si
// può fare qualcosa lunedì mattina: per questo sta qui e non in una tendina.
// Le hanno solo le byup, perché Google raccoglie stelle e testo e basta.
function CliAspetti({ dati, attivo, onScegli }) {
  const [modo, setModo] = React.useState('problemi');
  const g = dati[modo];
  const negativo = modo === 'problemi';
  const accento = negativo ? PN.RED : PN.GREEN;
  const velo    = negativo ? PN.RED_SOFT : PN.GREEN_SOFT;
  const tot = g.voci.reduce((s, v) => s + v.n, 0);
  const max = Math.max(...g.voci.map(v => v.n));

  return (
    <div style={{marginTop: 20, paddingTop: 18, borderTop:`1px solid ${PN.BORDER}`}}>
      <div style={{
        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        gap: 18, flexWrap:'wrap', marginBottom: 14,
      }}>
        <div style={{minWidth: 0, maxWidth: 720}}>
          <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>
            {negativo ? 'Cosa non ha funzionato' : 'Cosa è piaciuto'}
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.45}}>
            {negativo
              ? <>Sotto le tre stelle l'app chiede cosa non è andato e il cliente spunta le caselle:
                  {' '}<strong style={{color: PN.TEXT, fontWeight: 600}}>{tot} segnalazioni</strong> su {g.su} recensioni
                  byup da una o due stelle. Non è una nostra lettura del testo: l'ha spuntata lui.</>
              : <>Da tre stelle in su l'app chiede invece cosa è piaciuto:
                  {' '}<strong style={{color: PN.TEXT, fontWeight: 600}}>{tot} caselle</strong> toccate
                  su {g.su} recensioni byup.</>}
          </div>
        </div>
        <div style={CLI_PILLOLE}>
          <button onClick={() => setModo('problemi')} style={cliPillola(negativo)}>Problemi</button>
          <button onClick={() => setModo('pregi')} style={cliPillola(!negativo)}>Pregi</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:`repeat(${g.voci.length}, minmax(0, 1fr))`, gap: 10}}>
        {g.voci.map(v => {
          const asp = STAT_ASPETTI[v.id];
          if (!asp) return null;
          const sel = attivo === v.id;
          const diff = v.n - v.prec;
          // La direzione da sola non dice se è una buona notizia: un problema
          // che sale è rosso, un pregio che sale è verde.
          const bene = negativo ? diff < 0 : diff > 0;
          return (
            <button key={v.id} onClick={() => onScegli(v.id)}
              title={sel ? 'Togli il filtro' : `Leggi le recensioni con «${asp.et}»`}
              style={{
                textAlign:'left', padding:'11px 12px 12px', borderRadius: 12,
                border:`1px solid ${sel ? accento : PN.BORDER}`,
                background: sel ? velo : PN.WHITE,
                fontFamily:'inherit', cursor:'pointer', minWidth: 0,
                display:'flex', flexDirection:'column', gap: 9,
              }}>
              <span style={{display:'flex', alignItems:'center', gap: 7, minWidth: 0}}>
                <span style={{fontSize: 15, lineHeight: 1, flexShrink: 0}}>{asp.emoji}</span>
                <span style={{
                  flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: PN.TEXT,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>{asp.et}</span>
              </span>

              <span style={{display:'flex', alignItems:'baseline', gap: 6, minWidth: 0}}>
                <strong style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums'}}>{v.n}</strong>
                <span style={{fontSize: 12.5, color: PN.MUTED_SOFT, whiteSpace:'nowrap'}}>su {g.su}</span>
                {diff !== 0 && (
                  <span title={`${Math.abs(diff)} in ${diff > 0 ? 'più' : 'meno'} dei dodici mesi prima`} style={{
                    marginLeft:'auto', flexShrink: 0, fontSize: 12, fontWeight: 700,
                    whiteSpace:'nowrap', color: bene ? PN.GREEN : PN.RED,
                  }}>{diff > 0 ? '↑' : '↓'}{Math.abs(diff)}</span>
                )}
              </span>

              <span style={{display:'block', height: 5, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden'}}>
                <span style={{
                  display:'block', height:'100%', width:`${(v.n / max) * 100}%`,
                  borderRadius: 999, background: accento, opacity: 0.78,
                }}/>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Le recensioni ─────────────────────────────────────────────
// Con dodici ci si sta, con cento no: l'elenco scorre dentro la card invece
// di allungarla, e sopra restano i filtri di chi le legge — provenienza e
// stelle. Il filtro per casella non è qui: lo accende la classifica nella
// card sopra, e qui compare la fascia che dice cosa si sta guardando.
function CliRecensioni({ elenco, totale, aspetti, aspetto, setAspetto }) {
  const [fonte, setFonte] = React.useState('tutte');
  const [stelle, setStelle] = React.useState(0);      // 0 = tutte
  const [segnalate, setSegnalate] = React.useState({});
  const [inSegnalazione, setInSegnalazione] = React.useState(null);

  // Le caselle le spuntano solo i clienti byup: restare su «Google» col
  // filtro acceso vorrebbe dire zero risultati senza spiegazione.
  React.useEffect(() => { if (aspetto) setFonte('byup'); }, [aspetto]);

  const chiave = (r) => `${r.autore}·${r.quando}`;

  const visibili = elenco.filter(r =>
    (fonte === 'tutte' || r.fonte === fonte) &&
    (!stelle || r.stelle === stelle) &&
    (!aspetto || (r.aspetti || []).includes(aspetto))
  );

  const asp = aspetto ? STAT_ASPETTI[aspetto] : null;
  const agg = aspetto ? cliConta(aspetti, aspetto) : null;

  return (
    <StatCard title="Cosa scrivono"
      sub={`Le ultime ${elenco.length} delle ${totale.toLocaleString('it-IT', {useGrouping: true})} · ne vedi ${visibili.length}`} action={
      <div style={CLI_PILLOLE}>
        {[
          { id:'tutte',  et:'Tutte' },
          { id:'byup',   et:'byup' },
          { id:'google', et:'Google' },
        ].map(f => (
          <button key={f.id} onClick={() => { setFonte(f.id); if (f.id === 'google') setAspetto(''); }} style={cliPillola(fonte === f.id)}>
            {f.et}
            <span style={{color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>
              {f.id === 'tutte' ? elenco.length : elenco.filter(r => r.fonte === f.id).length}
            </span>
          </button>
        ))}
      </div>
    }>
      <div style={{
        display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
        paddingBottom: 13, marginBottom: 13, borderBottom:`1px solid ${PN.BORDER_SOFT}`,
      }}>
        <div style={CLI_PILLOLE}>
          <button onClick={() => setStelle(0)} style={cliPillola(stelle === 0)}>Tutte le stelle</button>
          {[5,4,3,2,1].map(v => {
            const n = elenco.filter(r => r.stelle === v).length;
            return (
              <button key={v} onClick={() => setStelle(v)} disabled={!n} style={{
                ...cliPillola(stelle === v),
                opacity: n ? 1 : 0.4, cursor: n ? 'pointer' : 'default',
              }}>
                {v}<span style={{color: PN.AMBER, fontSize: 11.5}}>★</span>
                <span style={{color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Il filtro arriva dalla classifica di sopra, che conta dodici mesi,
          mentre qui sotto stanno solo le ultime dodici recensioni: senza
          dirlo, «12 segnalazioni» e due schede sembrerebbero un errore. */}
      {asp && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap',
          padding:'10px 13px', borderRadius: 11, marginBottom: 13,
          background: asp.problema ? PN.RED_SOFT : PN.GREEN_SOFT,
        }}>
          <span style={{fontSize: 13.5, fontWeight: 700, color: asp.problema ? '#991B1B' : '#14532D', whiteSpace:'nowrap'}}>
            {asp.emoji} {asp.et}
          </span>
          <span style={{flex: 1, minWidth: 200, fontSize: 13.5, color: PN.MUTED, lineHeight: 1.4}}>
            {agg && <>{agg.n} segnalazioni negli ultimi 12 mesi · </>}
            {visibili.length} tra le ultime {elenco.length} recensioni qui sotto
          </span>
          <button onClick={() => setAspetto('')} style={{
            flexShrink: 0, display:'inline-flex', alignItems:'center', gap: 5,
            padding:'5px 11px', borderRadius: 999, border:'none',
            background: PN.WHITE, color: PN.TEXT,
            fontSize: 13, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
          }}><Icon name="xmark" size={11}/> Togli il filtro</button>
        </div>
      )}

      {/* L'elenco scorre: la card resta alta uguale con dodici recensioni e
          con cento, e i filtri restano sempre sott'occhio invece di finire
          due schermate più su. */}
      <div className="pn-scroll" style={{
        maxHeight: 460, overflowY:'auto', paddingRight: 4,
        display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, alignContent:'start',
      }}>
        {visibili.map((r, i) => {
          const segn = segnalate[chiave(r)];
          const basso = r.stelle <= 2;
          return (
            <div key={i} style={{
              border:`1px solid ${segn ? PN.AMBER_SOFT : PN.BORDER}`, borderRadius: 13, padding: 15,
              // Le poche recensioni basse vanno trovate senza leggerle tutte:
              // un fondo appena caldo basta, un bordo rosso sarebbe un allarme.
              background: segn ? '#FFFCF3' : (basso ? '#FFFAFA' : PN.WHITE),
              minWidth: 0, display:'flex', flexDirection:'column', gap: 10,
            }}>
              <div style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
                <span style={{
                  width: 34, height: 34, borderRadius:'50%', flexShrink: 0,
                  background: r.bg, color:'#fff',
                  display:'grid', placeItems:'center',
                  fontSize: 14, fontWeight: 700,
                }}>{r.iniziale}</span>
                <span style={{flex: 1, minWidth: 0}}>
                  <span style={{display:'block', fontSize: 14.5, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.autore}</span>
                  <span style={{display:'flex', alignItems:'center', gap: 7, marginTop: 3}}>
                    <CliStelle voto={r.stelle} lato={13}/>
                    <span style={{fontSize: 12.5, color: PN.MUTED_SOFT, whiteSpace:'nowrap'}}>{r.quando}</span>
                  </span>
                </span>
                <CliFonte fonte={r.fonte}/>
              </div>

              <div style={{flex: 1, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>«{r.testo}»</div>

              {/* Le caselle che ha spuntato nell'app. In rosso quelle
                  negative: sono i problemi che ha segnalato lui, gli stessi
                  contati nella classifica della card qui sopra. */}
              {(r.aspetti || []).length > 0 && (
                <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
                  {r.aspetti.map(a => {
                    const asp2 = STAT_ASPETTI[a]; if (!asp2) return null;
                    const acceso = a === aspetto;
                    return (
                      <span key={a} style={{
                        display:'inline-flex', alignItems:'center', gap: 5,
                        padding:'3px 9px', borderRadius: 999,
                        background: asp2.problema ? PN.RED_SOFT : PN.WHITE_HUSH,
                        color: asp2.problema ? '#991B1B' : PN.MUTED,
                        boxShadow: acceso ? `0 0 0 1.5px ${asp2.problema ? PN.RED : PN.GREEN}` : 'none',
                        fontSize: 12.5, fontWeight: 600, whiteSpace:'nowrap',
                      }}>{asp2.emoji} {asp2.et}</span>
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
                  /* Contestare una recensione è un'eccezione, non il gesto di
                     tutti i giorni: sta in ogni scheda perché deve essere lì
                     quando serve, ma spento — si accende al passaggio. */
                  <button onClick={() => setInSegnalazione(r)}
                    onMouseEnter={e => { e.currentTarget.style.background = PN.RED_SOFT; e.currentTarget.style.color = PN.RED; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED_SOFT; }}
                    style={{
                      flexShrink: 0, display:'inline-flex', alignItems:'center', gap: 5,
                      padding:'4px 9px', borderRadius: 8, border:'none', background:'transparent',
                      color: PN.MUTED_SOFT, fontSize: 12.5, fontWeight: 600,
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
  const mesiEt = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  // Il filtro per casella sta qui e non dentro l'elenco perché lo accendono in
  // due: la classifica dei problemi nella card di sopra e la fascia in quella
  // di sotto. Toccare un problema porta alle parole di chi l'ha spuntato — il
  // numero dice quanto pesa, le recensioni dicono cos'è successo.
  const [aspetto, setAspetto] = React.useState('');
  const rifElenco = React.useRef(null);
  const daScorrere = React.useRef(false);

  // Lo scorrimento va fatto DOPO il render, non dentro il click: accendere il
  // filtro fa comparire la fascia e sparire tre quarti delle schede, quindi
  // mirare prima vuol dire mirare a un punto che un istante dopo non c'è più.
  React.useEffect(() => {
    const el = rifElenco.current;
    if (!daScorrere.current || !el) return;
    daScorrere.current = false;
    // Le barre appiccicate di Statistiche — macro-tab più sub-tab — coprono i
    // primi pixel del contenitore: sotto quella quota la testata dell'elenco
    // c'è ma non si vede.
    const barra = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--stat-barra'), 10) || 63;
    const soglia = barra + 62;
    const alto = el.getBoundingClientRect().top;
    // Se l'elenco è già sott'occhio non si muove niente: uno scatto della
    // pagina quando non serve fa perdere il punto in cui si stava leggendo.
    if (alto >= soglia && alto <= window.innerHeight * 0.7) return;
    el.scrollIntoView({ behavior:'smooth', block:'start' });
  }, [aspetto]);

  const scegliAspetto = (id) => {
    const nuovo = aspetto === id ? '' : id;
    daScorrere.current = !!nuovo;
    setAspetto(nuovo);
  };

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

      <StatCard title="Valutazioni" sub={`${d.recensioni} recensioni negli ultimi 12 mesi, da due posti diversi`}>
        {/* Sopra: quanto ti votano e come sta andando. Sotto, oltre il filetto:
            perché — le caselle che i clienti hanno spuntato nell'app. Sono la
            stessa cosa guardata a due distanze, e stavano in due card diverse
            solo perché sono nate in due momenti diversi. */}
        <div style={{display:'grid', gridTemplateColumns:'minmax(300px, 0.82fr) 1.7fr', gap: 24, alignItems:'stretch'}}>
          <CliVoto d={d}/>
          <CliAndamento d={d} mesiEt={mesiEt}/>
        </div>

        {d.aspetti && <CliAspetti dati={d.aspetti} attivo={aspetto} onScegli={scegliAspetto}/>}
      </StatCard>

      <div ref={rifElenco} style={{scrollMarginTop:'calc(var(--stat-barra, 63px) + 62px)'}}>
        <CliRecensioni elenco={d.feedback} totale={d.recensioni}
          aspetti={d.aspetti} aspetto={aspetto} setAspetto={setAspetto}/>
      </div>

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

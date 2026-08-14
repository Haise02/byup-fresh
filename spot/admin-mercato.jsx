// ════════════════════════════════════════════════════════════════════════════
// MERCATO · IL MENU COME DATO — le sette misure che scendono dalla carta
// ════════════════════════════════════════════════════════════════════════════
//
// Il resto della tab Mercato racconta il settore con dati di settore. Questo
// blocco racconta quello che nessun altro può raccontare, perché nessun altro
// legge le carte: la distribuzione delle marche nel canale, l'elasticità vera,
// l'abbinamento, la rotazione dei menu, l'intensità di lavoro, la demografia
// d'impresa in anticipo e un indice prezzi continuo.
//
// Il modello sta in admin-mercato-data.jsx. Qui c'è solo come si guarda.

const mktEur = (n) => '€ ' + Number(n).toFixed(2).replace('.', ',');
const MKT_FMT1 = (n) => (Math.round(n * 10) / 10).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ─── Mattoncini condivisi ───────────────────────────────────────────────────
function MktNota({ children, tono = 'neutro' }) {
  const c = tono === 'cauto' ? ADM.WARN : ADM.MUTED;
  return (
    <div style={{display:'flex', gap:8, alignItems:'flex-start', fontSize:12.8, color:c, lineHeight:1.5}}>
      <span style={{flexShrink:0, marginTop:2}}><BuIcons.info size={13} color={c}/></span>
      <span>{children}</span>
    </div>
  );
}

function MktTestata({ titolo, sotto, destra }) {
  return (
    <div style={{padding:'14px 22px 12px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap'}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{titolo}</div>
        {sotto && <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>{sotto}</div>}
      </div>
      {destra}
    </div>
  );
}

function MktCifra({ label, valore, sotto, tono = 'TEXT' }) {
  return (
    <div style={{padding:'14px 16px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:10}}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
      <div style={{fontSize:26, fontWeight:800, color:ADM[tono] || ADM.TEXT, letterSpacing:'-0.03em', marginTop:5, lineHeight:1}}>{valore}</div>
      {sotto && <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:6, lineHeight:1.45}}>{sotto}</div>}
    </div>
  );
}

// ═══════════ 0 · Cosa vediamo davvero ═══════════════════════════════════════
function MktCopertura() {
  const N = MKT_LOCALI.length;
  const marcheViste = MKT_DISTRIBUZIONE.filter(m => m.locali > 0).length;
  return (
    <AdmCard padding={0}>
      <MktTestata
        titolo="La carta, in forma strutturata"
        sotto="Voce per voce, prezzo per prezzo, con la data di ogni modifica · è la materia prima di tutto quello che segue"
      />
      <div style={{padding:'18px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <MktCifra label="Carte osservate" valore={fmtNum(N)}
          sotto={`Su ${LOCALI.length} locali a registro · sono quelli che hanno finito l'onboarding e tengono il menu aggiornato`}/>
        <MktCifra label="Voci di menu" valore={fmtNum(MKT_VOCI_TOT)}
          sotto={`Di cui ${fmtNum(MKT_VOCI_BEVANDA)} bevande, dove la marca è scritta per esteso`}/>
        <MktCifra label="Marche riconosciute" valore={fmtNum(marcheViste)}
          sotto="Riconosciute dal testo della voce, non dichiarate dal locale"/>
        <MktCifra label="Volume dietro le carte" valore={fmtNum(MKT_ORDINI_TOT)} tono="PINK_DARK"
          sotto="Ordini/mese dei locali osservati · è il peso con cui si pondera tutto il resto"/>
      </div>
      <div style={{padding:'0 22px 18px'}}>
        <MktNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Perimetro.</strong> Questi numeri descrivono <strong>la rete byup</strong>, non il mercato italiano.
          Con {N} carte non si proietta un universo di 195.000 imprese, e nessuna delle percentuali qui sotto va letta come quota nazionale.
          Il punto non è la proiezione di oggi: è che la misura <em>esiste</em>, si aggiorna da sola e diventa rappresentativa man mano che la rete cresce.
          La soglia di proiettabilità regionale è intorno alle 400 carte per area.
        </MktNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 1 · Distribuzione ponderata ════════════════════════════════════
function MktDistribuzione() {
  const segmenti = ['Tutti', ...MKT_SEGMENTI.map(s => s.seg)];
  const [seg, setSeg] = useStateDash('Tutti');
  const righe = MKT_DISTRIBUZIONE.filter(m => seg === 'Tutti' || m.seg === seg).filter(m => m.locali > 0);
  const maxPond = Math.max(...righe.map(r => r.ponderata), 1);
  return (
    <>
      <AdmCard padding={0}>
        <MktTestata
          titolo="Distribuzione delle marche nel canale"
          sotto="Chi è a carta, in quante carte, dietro quanto volume, a che prezzo"
          destra={
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {segmenti.map(s => (
                <button key={s} onClick={()=>setSeg(s)} className="adm-btn" style={{
                  padding:'6px 11px', borderRadius:99, cursor:'pointer', fontFamily:'inherit', fontSize:12.8, fontWeight:600,
                  border:`1px solid ${seg===s ? ADM.PINK_DARK : ADM.BORDER}`,
                  background: seg===s ? ADM.PINK_BG_SOFT : '#fff',
                  color: seg===s ? ADM.PINK_DARK : ADM.MUTED,
                }}>{s}</button>
              ))}
            </div>
          }
        />
        <div style={{padding:'14px 22px', background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div style={{fontSize:13.3, color:ADM.MUTED, lineHeight:1.55}}>
            <strong style={{color:ADM.TEXT}}>Numerica</strong> = in quante carte la marca è presente.
            <strong style={{color:ADM.TEXT}}> Ponderata</strong> = quanto volume di ordini passa da quelle carte.
            Sono due numeri diversi e la differenza è il mestiere: stare in venti gastronomie da otto ordini al giorno
            non è come stare in tre pizzerie da duecento. Il produttore oggi conosce il sell-in al distributore e <em>stima</em> il resto.
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1.5fr 0.9fr 1.5fr 1.1fr 1fr', columnGap:16, padding:'11px 22px', fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div>Marca</div>
          <div style={{textAlign:'right'}}>Numerica</div>
          <div>Distribuzione ponderata</div>
          <div style={{textAlign:'right'}}>Prezzo a carta</div>
          <div style={{textAlign:'right'}}>Movimenti 90gg</div>
        </div>
        {righe.map((m, i) => {
          const w = (m.ponderata / maxPond) * 100;
          const netto = m.entrate - m.uscite;
          return (
            <div key={m.n} style={{
              display:'grid', gridTemplateColumns:'1.5fr 0.9fr 1.5fr 1.1fr 1fr', columnGap:16,
              padding:'12px 22px', alignItems:'center',
              borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            }}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{m.n}</div>
                <div style={{fontSize:12.4, color:ADM.MUTED, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {m.gruppo} · «{m.voce}»
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>{Math.round(m.numerica)}%</div>
                <div style={{fontSize:12.2, color:ADM.MUTED_SOFT}}>{m.locali}/{m.su} carte</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${w}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})`, borderRadius:99}}/>
                </div>
                <span style={{fontSize:14, fontWeight:800, color:ADM.TEXT, width:46, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{MKT_FMT1(m.ponderata)}%</span>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>{mktEur(m.prezzoMedio)}</div>
                <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>{mktEur(m.prezzoMin)} – {mktEur(m.prezzoMax)}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <span style={{fontSize:13.3, fontWeight:700, color: netto > 0 ? ADM.OK : netto < 0 ? ADM.DANGER : ADM.MUTED}}>
                  {netto > 0 ? '+' : ''}{netto} {Math.abs(netto) === 1 ? 'carta' : 'carte'}
                </span>
                <div style={{fontSize:12.2, color:ADM.MUTED_SOFT}}>{m.entrate} {m.entrate === 1 ? 'entrata' : 'entrate'} · {m.uscite} {m.uscite === 1 ? 'uscita' : 'uscite'}</div>
              </div>
            </div>
          );
        })}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
          {/* Il caso che spiega la colonna meglio di qualsiasi definizione: la
              marca più penalizzata dal peso, cioè quella presente in tante
              carte piccole. È il numero per cui un produttore pagherebbe. */}
          {(() => {
            const gap = [...MKT_DISTRIBUZIONE].filter(m => m.locali >= 3).sort((a, b) => (a.ponderata - a.numerica) - (b.ponderata - b.numerica))[0];
            if (!gap) return null;
            return (
              <MktNota>
                <strong style={{color:ADM.TEXT}}>Il caso che spiega la colonna:</strong> {gap.n} è su <strong style={{color:ADM.TEXT}}>{Math.round(gap.numerica)}%</strong> delle carte
                ma copre solo il <strong style={{color:ADM.TEXT}}>{MKT_FMT1(gap.ponderata)}%</strong> del volume — è presente in tanti locali piccoli.
                Al sell-in i due numeri sono indistinguibili; qui la differenza si vede, ed è la ragione per cui la distribuzione ponderata vale più di quella numerica.
              </MktNota>
            );
          })()}
          <MktNota>
            Il prezzo è quello <strong style={{color:ADM.TEXT}}>scritto sulla carta</strong>, non quello dichiarato in un'intervista: è il prezzo di rivendita al pubblico,
            che il produttore non vede mai perché finisce dopo il distributore. Lo spread fra minimo e massimo è la stessa bottiglia venduta a due prezzi diversi in due città.
          </MktNota>
        </div>
      </AdmCard>

      <AdmCard padding={0}>
        <MktTestata titolo="Quota di segmento" sotto="Dentro la stessa categoria, chi si prende il volume delle carte"/>
        <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16}}>
          {MKT_SEGMENTI.map(s => {
            const tot = s.marche.reduce((a, m) => a + m.quota, 0) || 1;
            const colori = [ADM.PINK, ADM.INFO, ADM.WARN, ADM.PURPLE, ADM.OK, ADM.TEAL || ADM.INK, ADM.MUTED];
            return (
              <div key={s.seg}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
                  <span style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>{s.seg}</span>
                  <span style={{fontSize:12.4, color:ADM.MUTED}}>in {s.copertura}% delle carte</span>
                </div>
                <div style={{display:'flex', height:10, borderRadius:99, overflow:'hidden', background:'#F4F5F7'}}>
                  {s.marche.filter(m => m.quota > 0).sort((a,b)=>b.quota-a.quota).map((m, i) => (
                    <div key={m.n} style={{width:`${(m.quota/tot)*100}%`, background: colori[i % colori.length]}} title={`${m.n} ${Math.round(m.quota)}%`}/>
                  ))}
                </div>
                <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:4}}>
                  {s.marche.filter(m => m.quota > 0).sort((a,b)=>b.quota-a.quota).map((m, i) => (
                    <div key={m.n} style={{display:'flex', alignItems:'center', gap:7, fontSize:12.8}}>
                      <span style={{width:8, height:8, borderRadius:2, background: colori[i % colori.length], flexShrink:0}}/>
                      <span style={{flex:1, color:ADM.TEXT, fontWeight:500}}>{m.n}</span>
                      <span style={{color:ADM.MUTED, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{m.quota < 0.5 ? '<1' : Math.round(m.quota)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </AdmCard>
    </>
  );
}

// ═══════════ 2 · Elasticità ═════════════════════════════════════════════════
function MktElasticita() {
  const [sel, setSel] = useStateDash(MKT_ELASTICITA[0].piatto);
  const [ritocco, setRitocco] = useStateDash(10);
  const piatto = MKT_ELASTICITA.find(p => p.piatto === sel) || MKT_ELASTICITA[0];
  const effetto = mktEffettoRicavo(piatto.epsMedio, ritocco);
  const prezzoNuovo = piatto.prezzo * (1 + ritocco / 100);
  return (
    <AdmCard padding={0}>
      <MktTestata
        titolo="Elasticità al prezzo, misurata"
        sotto="Quanto cala la domanda quando il prezzo sale · per piatto e per città"
        destra={
          <AdmSelect value={sel} onChange={setSel} align="right"
            buttonStyle={{borderRadius:8, fontSize:13.4, fontWeight:600}}
            options={MKT_ELASTICITA.map(p => p.piatto)}/>
        }
      />

      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <MktCifra label="Elasticità media" valore={MKT_FMT1(piatto.epsMedio)}
          tono={piatto.epsMedio <= -1 ? 'DANGER' : 'OK'}
          sotto={piatto.epsMedio <= -1
            ? 'Sotto −1: alzare il prezzo fa perdere ricavo, non guadagnarlo'
            : 'Sopra −1: c’è spazio di prezzo, la domanda regge'}/>
        <MktCifra label="Eventi di prezzo osservati" valore={fmtNum(piatto.eventiTot)}
          sotto={`Ritocchi ≥${MKT_ELAST_METODO.sogliaPrezzo}% su piatti con almeno ${MKT_ELAST_METODO.minOrdini} ordini/mese`}/>
        <MktCifra label="Prezzo mediano oggi" valore={mktEur(piatto.prezzo)}
          sotto="Mediana della rete · il ritocco qui sotto parte da questo"/>
      </div>

      {/* Il conto che serve al ristoratore: se alzo di N%, cosa succede al ricavo */}
      <div style={{margin:'0 22px 18px', padding:'16px 18px', background:ADM.PINK_BG_SOFT, border:`1px solid ${ADM.PINK_SOFT}`, borderRadius:10}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>Se {piatto.piatto} passa da {mktEur(piatto.prezzo)} a {mktEur(prezzoNuovo)}</div>
            <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
              La domanda si muove di <strong style={{color:ADM.TEXT}}>{MKT_FMT1(piatto.epsMedio * ritocco)}%</strong>, il ricavo di conseguenza.
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <div style={{display:'flex', gap:5}}>
              {[3, 5, 10, 15].map(v => (
                <button key={v} onClick={()=>setRitocco(v)} className="adm-btn" style={{
                  padding:'6px 10px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12.8, fontWeight:700,
                  border:`1px solid ${ritocco===v ? ADM.PINK_DARK : ADM.BORDER}`,
                  background: ritocco===v ? '#fff' : 'transparent',
                  color: ritocco===v ? ADM.PINK_DARK : ADM.MUTED,
                }}>+{v}%</button>
              ))}
            </div>
            <div style={{textAlign:'right', minWidth:120}}>
              <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Ricavo</div>
              <div style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.05, color: effetto >= 0 ? ADM.OK : ADM.DANGER}}>
                {effetto >= 0 ? '+' : ''}{MKT_FMT1(effetto)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.1fr 1.6fr 0.8fr 0.9fr 1fr', columnGap:16, padding:'11px 22px', fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderTop:`1px solid ${ADM.BORDER}`, borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Città</div>
        <div>Elasticità</div>
        <div style={{textAlign:'right'}}>Intervallo</div>
        <div style={{textAlign:'right'}}>Eventi</div>
        <div style={{textAlign:'right'}}>Ricavo a +{ritocco}%</div>
      </div>
      {piatto.perCitta.map((c, i) => {
        const rigido = c.eps > -1;
        // La barra va da 0 a −2: il segno di rottura sta a metà, ed è quello
        // che si guarda per primo.
        const w = Math.min(100, (Math.abs(c.eps) / 2) * 100);
        const eff = mktEffettoRicavo(c.eps, ritocco);
        return (
          <div key={c.citta} style={{
            display:'grid', gridTemplateColumns:'1.1fr 1.6fr 0.8fr 0.9fr 1fr', columnGap:16,
            padding:'11px 22px', alignItems:'center',
            borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
          }}>
            <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT}}>{c.citta}</div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden', position:'relative'}}>
                <div style={{width:`${w}%`, height:'100%', background: rigido ? ADM.OK : ADM.DANGER, borderRadius:99}}/>
                <div style={{position:'absolute', left:'50%', top:-2, bottom:-2, width:1.5, background:ADM.INK_SOFT}}/>
              </div>
              <span style={{fontSize:13.6, fontWeight:800, color: rigido ? ADM.OK : ADM.DANGER, width:44, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{MKT_FMT1(c.eps)}</span>
            </div>
            <div style={{fontSize:12.8, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>±{MKT_FMT1(c.ic)}</div>
            <div style={{fontSize:12.8, color:ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{c.eventi}</div>
            <div style={{fontSize:13.6, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums', color: eff >= 0 ? ADM.OK : ADM.DANGER}}>
              {eff >= 0 ? '+' : ''}{MKT_FMT1(eff)}%
            </div>
          </div>
        );
      })}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <MktNota>
          <strong style={{color:ADM.TEXT}}>Come si misura.</strong> Si prendono i cambi di listino ≥{MKT_ELAST_METODO.sogliaPrezzo}% e si confronta il salto di volume
          nelle {MKT_ELAST_METODO.finestra} settimane intorno al cambio con quello degli stessi piatti nei locali che il prezzo <em>non</em> l'hanno toccato.
          Il gruppo di controllo è quello che toglie di mezzo la stagionalità: ad agosto la carbonara cala per tutti, non solo per chi l'ha ritoccata.
        </MktNota>
        <MktNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Limite.</strong> Su alcune città gli eventi sono pochi e l'intervallo è largo: con quattro ritocchi osservati la seconda cifra decimale non significa niente.
          La riga si legge come direzione, non come coefficiente da mettere in un contratto.
        </MktNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 3 · Abbinamento ════════════════════════════════════════════════
function MktAbbinamento() {
  const maxLift = Math.max(...MKT_ATTACCO.map(a => a.lift));
  return (
    <AdmCard padding={0}>
      <MktTestata
        titolo="Cosa si ordina insieme"
        sotto="Tasso di attacco bevanda ↔ piatto · per il produttore è dove spingere, per noi dove suggerire"
      />
      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
        <MktCifra label="Punti di attacco recuperabili" valore={`+${MKT_FMT1(MKT_UPSELL.puntiRecuperabili)} pt`}
          sotto="Portando ogni coppia al livello del quartile alto della rete"/>
        <MktCifra label="Bevande in più al mese" valore={fmtNum(MKT_UPSELL.bevandeInPiu)}
          sotto="Sul volume vero dei locali osservati"/>
        <MktCifra label="Valore per i locali" valore={fmtEur(MKT_UPSELL.valoreMese)} tono="OK"
          sotto={`${fmtEur(MKT_UPSELL.valoreAnno)}/anno · scontrino bevanda medio ${mktEur(MKT_UPSELL.scontrinoBevanda)}`}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1.7fr 1.3fr 1.4fr 0.8fr 1fr', columnGap:16, padding:'11px 22px', fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderTop:`1px solid ${ADM.BORDER}`, borderBottom:`1px solid ${ADM.BORDER}`}}>
        <div>Piatto</div>
        <div>Bevanda</div>
        <div>Attacco</div>
        <div style={{textAlign:'right'}}>Lift</div>
        <div style={{textAlign:'right'}}>Spazio</div>
      </div>
      {MKT_ATTACCO.map((a, i) => (
        <div key={a.piatto + a.bev} style={{
          display:'grid', gridTemplateColumns:'1.7fr 1.3fr 1.4fr 0.8fr 1fr', columnGap:16,
          padding:'11px 22px', alignItems:'center',
          borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
        }}>
          <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.piatto}</div>
          <div style={{fontSize:13.6, color:ADM.TEXT, fontWeight:500}}>{a.bev}</div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden', position:'relative'}}>
              <div style={{width:`${a.attach}%`, height:'100%', background:ADM.INFO, borderRadius:99}}/>
              <div style={{position:'absolute', left:`${a.base}%`, top:-3, bottom:-3, width:1.5, background:ADM.INK}}/>
            </div>
            <span style={{fontSize:13.6, fontWeight:800, color:ADM.TEXT, width:36, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{a.attach}%</span>
          </div>
          <div style={{fontSize:13.6, fontWeight:800, textAlign:'right', fontVariantNumeric:'tabular-nums', color: a.lift >= 1.6 ? ADM.OK : a.lift >= 1.2 ? ADM.WARN : ADM.MUTED}}>×{MKT_FMT1(a.lift)}</div>
          <div style={{fontSize:13, fontWeight:700, textAlign:'right', color: a.upside > 8 ? ADM.PINK_DARK : ADM.MUTED, fontVariantNumeric:'tabular-nums'}}>+{a.upside} pt</div>
        </div>
      ))}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <MktNota>
          <strong style={{color:ADM.TEXT}}>Il trattino nero</strong> dentro la barra è la base, cioè quanto quella bevanda vende comunque, su tutti gli scontrini.
          Il <strong style={{color:ADM.TEXT}}>lift</strong> è il rapporto fra i due: ×1,0 è una coincidenza, ×2,4 vuol dire che è il piatto a tirare la bevanda.
          Senza la base, un attacco del 52% direbbe solo che la Coca-Cola vende tanto.
        </MktNota>
        <MktNota tono="cauto">
          Le coppie sono quelle con volume sufficiente a distinguere il segnale dal rumore; sotto i 200 scontrini congiunti al mese la coppia non entra in tabella.
        </MktNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 4 · Rotazione delle carte ══════════════════════════════════════
function MktRotazione() {
  const maxRot = Math.max(...MKT_ROTAZIONE.perTipo.map(t => t.pct));
  return (
    <div style={{display:'grid', gridTemplateColumns:'0.9fr 1.1fr', gap:14, alignItems:'start'}}>
      <AdmCard padding={0}>
        <MktTestata titolo="Quanto si muove una carta" sotto={`Voci cambiate per trimestre · media di rete ${MKT_FMT1(MKT_ROTAZIONE.media)}%`}/>
        <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:10}}>
          {MKT_ROTAZIONE.perTipo.map(t => (
            <div key={t.tipo} style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:500, width:92, flexShrink:0}}>{t.tipo}</span>
              <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                <div style={{width:`${(t.pct/maxRot)*100}%`, height:'100%', background:ADM.PURPLE, borderRadius:99}}/>
              </div>
              <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, width:38, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{t.pct}%</span>
            </div>
          ))}
        </div>
        <div style={{padding:'0 22px 18px'}}>
          <MktNota>
            Una pizzeria cambia il 7% delle voci a trimestre, un bistrot il 24%: sono due mestieri diversi, e per chi vende ingredienti sono due
            velocità di ingresso diverse. Chi ha un prodotto nuovo sa da quale porta entrare.
          </MktNota>
        </div>
      </AdmCard>

      <AdmCard padding={0}>
        <MktTestata titolo="Ingredienti in ingresso e in uscita" sotto="In quante carte compaiono, trimestre per trimestre · l'anticipo sul carrello della spesa"/>
        <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:12}}>
          {MKT_INGREDIENTI.map(ing => {
            const mx = Math.max(...MKT_INGREDIENTI.flatMap(x => x.serie), 1);
            const primo = ing.serie[0], ultimo = ing.serie[ing.serie.length - 1];
            const tono = ing.stato === 'in salita' ? ADM.OK : ing.stato === 'in uscita' ? ADM.DANGER : ADM.MUTED;
            const W = 120, H = 26;
            const path = ing.serie.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (ing.serie.length - 1)) * W} ${H - (v / mx) * H}`).join(' ');
            return (
              <div key={ing.n} style={{display:'flex', alignItems:'center', gap:12}}>
                <span style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT, flex:1, minWidth:0}}>{ing.n}</span>
                <svg viewBox={`0 0 ${W} ${H}`} style={{width:120, height:26, flexShrink:0, overflow:'visible'}}>
                  <path d={path} fill="none" stroke={tono} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{fontSize:12.8, color:ADM.MUTED, width:88, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{primo} → {ultimo} carte</span>
                <span style={{fontSize:12.2, fontWeight:700, color:tono, width:66, textAlign:'right'}}>{ing.stato}</span>
              </div>
            );
          })}
        </div>
        <div style={{padding:'0 22px 18px', display:'flex', flexDirection:'column', gap:8}}>
          <MktNota>
            {MKT_TRIMESTRI[0]} → {MKT_TRIMESTRI[MKT_TRIMESTRI.length - 1]}. Fuori casa si prova, a casa si ricompra: un ingrediente che entra nelle carte
            arriva agli scaffali dopo, e qui si vede mentre entra.
          </MktNota>
          <MktNota tono="cauto">
            <strong style={{color:ADM.TEXT}}>Da validare.</strong> L'anticipo sui consumi domestici è un'ipotesi coerente con la letteratura, non una nostra misura:
            per dichiararlo servirebbe incrociare questa serie con un panel retail. Finché non lo facciamo, resta un'ipotesi scritta come tale.
          </MktNota>
        </div>
      </AdmCard>
    </div>
  );
}

// ═══════════ 5 · Intensità di lavoro ════════════════════════════════════════
function MktIntensita() {
  const mx = Math.max(...MKT_INTENSITA.perTipo.map(t => t.azioni));
  return (
    <AdmCard padding={0}>
      <MktTestata
        titolo="Quanto lavoro costa un coperto"
        sotto="Azioni di sala per coperto, ricavate dai gesti registrati dal gestionale · non è soddisfazione, è costo"
      />
      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <MktCifra label="Azioni per coperto" valore={MKT_FMT1(MKT_INTENSITA.azioniMedie)}
          sotto="Apertura conto, comande, modifiche, invii in cucina, incasso"/>
        <MktCifra label="Minuti di sala per coperto" valore={MKT_FMT1(MKT_INTENSITA.minutiMedi)}
          sotto="Somma dei tempi fra un gesto e il successivo sullo stesso tavolo"/>
        <MktCifra label="Costo di sala per coperto" valore={mktEur(MKT_INTENSITA.costoCoperto)} tono="PINK_DARK"
          sotto={`A ${mktEur(MKT_INTENSITA.costoOra)}/h lordo azienda · contratto pubblici esercizi`}/>
        <MktCifra label="Azioni tolte dall'ordine in app" valore={`−${MKT_INTENSITA.risparmioApp}%`} tono="OK"
          sotto="È la stessa ragione per cui il listino pesa 0,5 un ordine in app"/>
      </div>
      <div style={{padding:'0 22px 4px'}}>
        <div style={{fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Per tipo di locale</div>
      </div>
      <div style={{padding:'0 22px 16px', display:'flex', flexDirection:'column', gap:9}}>
        {MKT_INTENSITA.perTipo.map(t => (
          <div key={t.tipo} style={{display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:500, width:92, flexShrink:0}}>{t.tipo}</span>
            <span style={{fontSize:12.2, color:ADM.MUTED_SOFT, width:58, flexShrink:0}}>{t.locali} local{t.locali === 1 ? 'e' : 'i'}</span>
            <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
              <div style={{width:`${(t.azioni/mx)*100}%`, height:'100%', background:ADM.INK, borderRadius:99}}/>
            </div>
            <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, width:52, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{MKT_FMT1(t.azioni)}</span>
            <span style={{fontSize:12.8, color:ADM.MUTED, width:62, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{MKT_FMT1(t.minuti)} min</span>
          </div>
        ))}
      </div>
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT}}>
        <MktNota>
          Nessuno misura questo numero perché nessuno registra il gesto del cameriere con un orario. Noi sì, perché il gesto passa dal gestionale:
          è il ponte fra il costo del personale — la voce più grande del conto economico di un locale — e quello che succede davvero in sala.
        </MktNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 6 · Demografia d'impresa ═══════════════════════════════════════
function MktDemografia() {
  const { conteggi, critici, validazione } = MKT_SPEGNIMENTO;
  return (
    <AdmCard padding={0}>
      <MktTestata
        titolo="Locali che si stanno spegnendo"
        sotto="Prima smette di aggiornare la carta, poi cala di volume, poi non entra più · il registro imprese lo scrive mesi dopo"
      />
      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <MktCifra label="Regolari" valore={fmtNum(conteggi.regolare)} tono="OK" sotto="Nessun segnale acceso"/>
        <MktCifra label="Da guardare" valore={fmtNum(conteggi.guardare)} sotto="Un segnale su quattro"/>
        <MktCifra label="In calo" valore={fmtNum(conteggi.calo)} tono="WARN" sotto="Due o più segnali insieme"/>
        <MktCifra label="Praticamente spenti" valore={fmtNum(conteggi.spento)} tono="DANGER" sotto="Tutti i segnali accesi da settimane"/>
      </div>
      {critici.length > 0 && (
        <>
          <div style={{display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr 1fr 1.1fr', columnGap:16, padding:'11px 22px', fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderTop:`1px solid ${ADM.BORDER}`, borderBottom:`1px solid ${ADM.BORDER}`}}>
            <div>Locale</div>
            <div style={{textAlign:'right'}}>Ultimo accesso</div>
            <div style={{textAlign:'right'}}>Carta ferma da</div>
            <div style={{textAlign:'right'}}>Volume</div>
            <div style={{textAlign:'right'}}>Segnale</div>
          </div>
          {critici.slice(0, 10).map((r, i) => (
            <div key={r.id} style={{
              display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr 1fr 1.1fr', columnGap:16,
              padding:'11px 22px', alignItems:'center',
              borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            }}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.nome}</div>
                <div style={{fontSize:12.2, color:ADM.MUTED}}>{r.tipo} · {r.citta}</div>
              </div>
              <div style={{fontSize:13.3, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{r.giorniLogin}gg fa</div>
              <div style={{fontSize:13.3, color:ADM.TEXT, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{r.giorniMenu}gg</div>
              <div style={{fontSize:13.3, fontWeight:700, color: r.caloOrdini <= -20 ? ADM.DANGER : ADM.MUTED, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{r.caloOrdini}%</div>
              <div style={{textAlign:'right'}}>
                <span style={{
                  display:'inline-block', padding:'3px 9px', borderRadius:99, fontSize:12.2, fontWeight:700,
                  background: r.livello === 'spento' ? ADM.DANGER_SOFT : ADM.WARN_SOFT,
                  color: r.livello === 'spento' ? ADM.DANGER : ADM.WARN,
                }}>{r.livello}</span>
              </div>
            </div>
          ))}
        </>
      )}
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <MktNota>
          <strong style={{color:ADM.TEXT}}>La regola è dichiarata</strong>, non addestrata: ultimo accesso oltre 30 giorni (30 punti), carta ferma da oltre 120 (25),
          volume in calo oltre il 40% (30), adozione digitale sotto il 2% (10). Sopra 65 punti il locale è di fatto spento.
          A chi guarda il tessuto d'impresa — banche, osservatori, consorzi — interessa proprio questo: un segnale che arriva prima del registro.
        </MktNota>
        <MktNota tono="cauto">
          <strong style={{color:ADM.TEXT}}>Quanto prima, non lo sappiamo ancora.</strong> Le chiusure vere osservate finora sono {validazione.chiusureOsservate},
          con un anticipo di {validazione.anticipoOsservatoMesi[0]} e {validazione.anticipoOsservatoMesi[1]} mesi sul registro.
          Con due casi si dice che il segnale c'era, non quanto vale in media: serve una coorte più grande prima di metterlo in un'offerta.
        </MktNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ 7 · Indice prezzi dei menu ═════════════════════════════════════
function MktIndicePrezzi() {
  const I = MKT_INDICE;
  const W = 1200, H = 200, padX = 46, padY = 22;
  const plotW = W - padX * 2, plotH = H - padY * 2;
  const tutti = [...I.serie, ...I.istat];
  const lo = Math.floor(Math.min(...tutti) - 0.6), hi = Math.ceil(Math.max(...tutti) + 0.6);
  const range = hi - lo || 1;
  const xFor = (i) => padX + (i / 11) * plotW;
  const yFor = (v) => padY + (1 - (v - lo) / range) * plotH;
  const linea = (serie) => serie.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
  // ISTAT si ferma un mese indietro: è esattamente il ritardo che stiamo mostrando.
  const istatVisibile = I.istat.slice(0, 11);
  return (
    <AdmCard padding={0}>
      <MktTestata
        titolo="Indice dei prezzi dei menu"
        sotto="Paniere pesato sui volumi della rete, ricalcolato a ogni modifica di listino · proxy d'inflazione dei servizi"
      />
      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
        <MktCifra label="Indice byup · 12 mesi" valore={`+${MKT_FMT1(I.annuo)}%`} tono="PINK_DARK"
          sotto={`Base 100 a ${I.mesi[0]} · oggi ${MKT_FMT1(I.serie[11])}`}/>
        <MktCifra label="ISTAT · ristorazione" valore={`+${MKT_FMT1(I.istatAnnuo)}%`}
          sotto={`Stessa direzione, meno reattivo · pubblicato a T+${I.ritardoIstatGiorni} giorni`}/>
        <MktCifra label="Il nostro ritardo" valore="0 giorni" tono="OK"
          sotto="Il prezzo entra nell'indice nel momento in cui il locale lo scrive"/>
        <MktCifra label="Modifiche di listino al mese" valore={fmtNum(I.modificheMese)}
          sotto="Ogni modifica è un ricalcolo del paniere"/>
      </div>
      <div style={{padding:'0 22px 8px'}}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:210}}>
          {[lo, (lo + hi) / 2, hi].map((t, i) => (
            <g key={i}>
              <line x1={padX} x2={W - padX} y1={yFor(t)} y2={yFor(t)} stroke={ADM.BORDER_SOFT} strokeDasharray="3 4"/>
              <text x={padX - 8} y={yFor(t) + 4} textAnchor="end" fontSize="11" fill={ADM.MUTED_SOFT} fontWeight="600">{t.toFixed(1).replace('.', ',')}</text>
            </g>
          ))}
          {I.mesi.map((m, i) => (
            <text key={i} x={xFor(i)} y={H - 4} textAnchor="middle" fontSize="10.5" fill={ADM.MUTED} fontWeight="600">{m}</text>
          ))}
          <path d={linea(istatVisibile)} fill="none" stroke={ADM.MUTED_LIGHT} strokeWidth="2.4" strokeDasharray="5 4" strokeLinecap="round"/>
          <path d={linea(I.serie)} fill="none" stroke={ADM.PINK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          {I.serie.map((v, i) => <circle key={i} cx={xFor(i)} cy={yFor(v)} r={3} fill="#fff" stroke={ADM.PINK} strokeWidth="2"/>)}
          {/* Il mese scoperto: ISTAT non l'ha ancora pubblicato */}
          <rect x={xFor(10)} y={padY} width={plotW / 11} height={plotH} fill={ADM.WARN} opacity="0.06"/>
          <text x={xFor(11)} y={padY - 6} textAnchor="end" fontSize="11" fill={ADM.WARN} fontWeight="700">ISTAT non ancora pubblicato</text>
        </svg>
        <div style={{display:'flex', gap:18, justifyContent:'center', marginTop:6, fontSize:13, color:ADM.TEXT, fontWeight:600}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:16, height:3, background:ADM.PINK, borderRadius:2}}/>Indice byup</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:16, height:3, background:ADM.MUTED_LIGHT, borderRadius:2}}/>ISTAT servizi di ristorazione</span>
        </div>
      </div>
      <div style={{padding:'12px 22px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:22}}>
        <div>
          <div style={{fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Per categoria · 12 mesi</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {I.perCategoria.map(c => (
              <div key={c.cat} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:500, width:86, flexShrink:0}}>{c.cat}</span>
                <span style={{fontSize:12.2, color:ADM.MUTED_SOFT, width:66, flexShrink:0, whiteSpace:'nowrap'}}>peso {c.peso}%</span>
                <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${Math.min(100, (c.annuo / 5) * 100)}%`, height:'100%', background:ADM.PINK, borderRadius:99}}/>
                </div>
                <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, width:46, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>+{MKT_FMT1(c.annuo)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:12.4, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Per città · 12 mesi</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {I.perCitta.map(c => (
              <div key={c.citta} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:500, width:86, flexShrink:0}}>{c.citta}</span>
                <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${Math.min(100, (c.annuo / 5) * 100)}%`, height:'100%', background:ADM.INFO, borderRadius:99}}/>
                </div>
                <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, width:46, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>+{MKT_FMT1(c.annuo)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:8}}>
        <MktNota>
          ISTAT rileva il prezzo mandando qualcuno a chiederlo, su un campione, e lo pubblica a metà del mese dopo.
          Qui il prezzo è quello scritto sulla carta nel momento in cui il ristoratore lo cambia: stesso fenomeno, due settimane prima e senza intervista di mezzo.
        </MktNota>
        <MktNota tono="cauto">
          La serie ISTAT qui accanto è ricostruita a scopo di confronto grafico. Per pubblicare il confronto va agganciata alla serie ufficiale
          (indice NIC, divisione «servizi di ristorazione»), e il nostro paniere va dichiarato: quali piatti, quali pesi, quale trattamento delle voci che spariscono.
        </MktNota>
      </div>
    </AdmCard>
  );
}

// ═══════════ Il blocco intero ═══════════════════════════════════════════════
function MercatoMenuDato() {
  return (
    <>
      <SectionLabel title="Il menu come dato"
        desc="Quello che vediamo e nessun altro vede: la carta di ogni locale, strutturata, con i prezzi e le date in cui cambiano"/>
      <MktCopertura/>

      <SectionLabel title="Le marche nel canale"
        desc="Distribuzione ponderata del fuori casa · oggi in Italia è stimata dai sell-in, qui è contata"/>
      <MktDistribuzione/>

      <SectionLabel title="Prezzo e domanda"
        desc="Variazioni di listino e volumi sugli stessi piatti · l'elasticità che nessuno misura"/>
      <MktElasticita/>

      <SectionLabel title="Abbinamenti"
        desc="Tasso di attacco per chi produce bevande, funzione di upsell per il gestionale"/>
      <MktAbbinamento/>

      <SectionLabel title="Come cambiano le carte"
        desc="Rotazione dei menu e ingredienti in movimento"/>
      <MktRotazione/>

      <SectionLabel title="Il lavoro in sala"
        desc="Intensità per coperto, ricavata dai gesti registrati"/>
      <MktIntensita/>

      <SectionLabel title="Demografia d'impresa"
        desc="Un locale che si spegne si vede prima qui che in qualsiasi registro"/>
      <MktDemografia/>

      <SectionLabel title="Inflazione dei menu"
        desc="Indice continuo dei prezzi al pubblico · proxy dei servizi più tempestivo delle rilevazioni ufficiali"/>
      <MktIndicePrezzi/>
    </>
  );
}

window.MercatoMenuDato = MercatoMenuDato;

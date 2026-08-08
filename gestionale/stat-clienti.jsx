// Statistiche — Clienti · sub-tab Fidelizzazione

// ─── Il colore, e quanto poco ───────────────────────────────────
// Questa pagina aveva ambra, corallo, blu, verde e rosso accesi nello stesso
// sguardo: ogni informazione si era presa una tinta e una scatola, e il
// risultato era che nessuna aveva più peso delle altre. Vale una regola sola,
// da qui in giù: il corallo è byup — e le stelle sono byup — il blu è Google,
// il rosso è un problema, l'ambra è rimasta solo allo stato «Segnalata».
// Tutto il resto è grigio, e niente ha un bordo se un filetto o un po' d'aria
// bastano a separarlo.
//
// Le stelle erano ambra su fondo bianco, cioè le stelle di Google: la stessa
// forma e lo stesso oro che il cliente vede sulla scheda Maps. Ma queste
// recensioni nascono nell'app, e nell'app la stella è un'altra cosa —
// `menu.jsx` (SuccessScreen) e la vetrina disegnano una tessera arrotondata
// corallo con dentro una stella bianca. È quello che ha visto chi ha votato,
// ed è quello che deve vedere chi legge il voto.

// ─── Le due provenienze ────────────────────────────────────────
// Non sono la stessa cosa e la card non deve farle sembrare tali: una
// recensione byup nasce da un ordine pagato qui — si sa che quella persona c'è
// stata e cosa ha mangiato — una recensione Google la lascia chiunque abbia un
// account Google. Basta un punto del colore giusto accanto al nome: la
// pastiglia piena con dentro la tessera e l'iniziale era tre oggetti per dire
// una parola.
const CLI_FONTI = {
  byup:   { et:'byup',   colore: PN.PINK },
  google: { et:'Google', colore:'#4285F4' },
};

function CliFonte({ fonte, lato = 12.5 }) {
  const f = CLI_FONTI[fonte] || CLI_FONTI.byup;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      color: f.colore, fontSize: lato, fontWeight: 600, whiteSpace:'nowrap',
    }}>
      <span style={{width: 6, height: 6, borderRadius:'50%', background: f.colore, flexShrink: 0}}/>
      {f.et}
    </span>
  );
}

// ─── Stelle ────────────────────────────────────────────────────
// La stella, unica per tutta la pagina, nella stessa forma dell'app.
const CLI_STELLA = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

// Nelle schede di una recensione la stella è il glifo pieno: il voto di UNA
// recensione è un intero, sta accanto a un nome e a una data, e cinque
// tessere lì dentro sarebbero cinque oggetti dove ne basta uno. Corallo fino
// al voto, grigio dopo — nell'app le recensioni degli altri si leggono così.
function CliStelle({ voto, lato = 16 }) {
  return (
    <span style={{display:'inline-flex', gap: 2, lineHeight: 0}} title={`${voto} su 5`}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width={lato} height={lato} viewBox="0 0 24 24"
          fill={i < voto ? PN.PINK : PN.BORDER} style={{display:'block'}}>
          <polygon points={CLI_STELLA}/>
        </svg>
      ))}
    </span>
  );
}

// Il voto medio invece è la tessera: quella che il cliente tocca nell'app per
// dare le stelle, corallo piena e pesca da spenta, con la stella in bianco
// ricavata dentro. È l'oggetto del prodotto, e sopra un numero grande è anche
// l'unica resa che regge la dimensione.
// Un voto medio è una frazione e va mostrata come tale — cinque tessere e
// sopra le stesse accese, tagliate al punto giusto: stamparne cinque piene per
// un 4,6 è il modo più veloce per far sembrare finto un numero vero. Il taglio
// è calcolato in pixel e non in percentuale della riga, perché tra una tessera
// e l'altra c'è aria: la percentuale sulla larghezza totale cadrebbe ogni
// volta un po' più in là del punto giusto.
function CliStelleTessere({ voto, lato = 30, aria = 6 }) {
  const intero = Math.floor(voto);
  const piena = Math.min(intero * (lato + aria) + (voto - intero) * lato, 5 * lato + 4 * aria);
  const tessera = (sfondo, i) => (
    <span key={i} style={{
      width: lato, height: lato, borderRadius: Math.round(lato * 0.25), background: sfondo,
      display:'grid', placeItems:'center', flexShrink: 0,
    }}>
      <svg width={Math.round(lato * 0.56)} height={Math.round(lato * 0.56)} viewBox="0 0 24 24"
        fill={PN.WHITE} stroke={PN.WHITE} strokeWidth="1" strokeLinejoin="round" style={{display:'block'}}>
        <polygon points={CLI_STELLA}/>
      </svg>
    </span>
  );
  return (
    <span style={{position:'relative', display:'inline-flex', gap: aria, lineHeight: 0}}
      title={`${String(voto).replace('.', ',')} su 5`}>
      {[0,1,2,3,4].map(i => tessera(PN.PINK_SOFT, i))}
      <span style={{
        position:'absolute', top: 0, left: 0, display:'inline-flex', gap: aria,
        width: piena, overflow:'hidden',
      }}>
        {[0,1,2,3,4].map(i => tessera(PN.PINK, i))}
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
// Quanto ti votano, com'è fatto quel numero e da dove arriva. Stava dentro un
// riquadro grigio con dentro altre due sezioni riquadrate: tre scatole per
// dire una cosa sola. Adesso è contenuto e basta, e nemmeno il filo verticale
// che lo separava dal grafico: una card sola, il voto incolonnato a sinistra e
// il disegno che si prende tutto il resto.
//
// Il numero grande è quello byup, non la media delle due provenienze. Prima
// erano appaiate in fondo alla colonna, stessa dimensione e stesso peso, sotto
// un 4,5 che le mescolava: la card diceva che valgono uguale, e non è vero.
// Una recensione byup nasce da un ordine pagato qui — quella persona c'è stata
// e si sa cosa ha mangiato — una Google la lascia chiunque abbia un account,
// anche chi passava davanti. Quindi il voto vero è uno, con la sua media e il
// suo totale in grande, e Google è una riga di servizio in fondo: non si
// nasconde, ma non compete.
//
// La colonna è stretta e va letta dall'alto in basso, non a righe che
// attraversano: il numero, sotto le stelle, sotto su quante. Le tessere stanno
// sotto il numero e non di fianco perché di fianco costringerebbero la colonna
// a essere larga il doppio, e quella larghezza serve al grafico.
function CliVoto({ d }) {
  const b = d.fonti.byup, g = d.fonti.google;
  return (
    <div style={{minWidth: 0, display:'flex', flexDirection:'column', gap: 20}}>
      <div>
        <div style={{marginBottom: 10}}><CliFonte fonte="byup" lato={13.5}/></div>
        <div style={{fontSize: 60, fontWeight: 700, color: PN.TEXT, letterSpacing:-2.4, lineHeight: 0.82}}>
          {b.media.toFixed(1).replace('.', ',')}
        </div>
        <div style={{margin:'12px 0 9px'}}><CliStelleTessere voto={b.media} lato={22} aria={5}/></div>
        {/* La media e il totale sono le due cose che si vengono a sapere qui:
            il conteggio è scuro e in grassetto, il resto della frase no. */}
        <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45}}>
          Sulla base di <span style={{fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
            {b.n.toLocaleString('it-IT', {useGrouping: true})}
          </span> recensioni, tutte da chi ha ordinato e pagato qui.
        </div>
      </div>

      {/* Cinque righe e cinque numeri, senza barre: la barra diceva una
          proporzione che con 253 su 312 si legge già dalle cifre, e nella
          colonna stretta restava un filo di due centimetri. */}
      <div style={{display:'flex', flexDirection:'column', gap: 9}}>
        {[5,4,3,2,1].map(stelle => {
          const riga = b.stelle.find(r => r.stars === stelle);
          return (
            <div key={stelle} style={{display:'flex', alignItems:'center', gap: 8, fontSize: 13.5}}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap: 5,
                color: PN.MUTED, fontVariantNumeric:'tabular-nums',
              }}>
                {stelle}
                <svg width="12" height="12" viewBox="0 0 24 24" fill={PN.PINK} style={{display:'block'}}>
                  <polygon points={CLI_STELLA}/>
                </svg>
              </span>
              <span style={{
                minWidth: 40, textAlign:'right', color: PN.TEXT,
                fontVariantNumeric:'tabular-nums', fontWeight: 600,
              }}>{riga.count}</span>
            </div>
          );
        })}
      </div>

      {/* Google in fondo, a filo di grigio: il dato c'è — chi ha il locale lo
          vuole sapere — ma non è quello su cui si prendono decisioni, e a
          questa dimensione si legge come la nota che è.
          Attaccato alla distribuzione, non spinto in fondo con
          `marginTop:auto`: il grafico accanto ha un'altezza sua, e l'auto
          apriva un buco in mezzo alla colonna. Meglio che l'aria avanzata
          resti sotto, dove finire è normale. */}
      {/* Su due righe e non su una: la colonna è stretta, e in linea l'etichetta
          finiva in tre puntini — «Google, aperte a c…» — che è il modo di
          mettere una cosa in un angolo facendola pure sembrare rotta. */}
      <div style={{
        paddingTop: 14, borderTop:`1px solid ${PN.BORDER_SOFT}`,
        fontSize: 12.5, color: PN.MUTED_LIGHT, lineHeight: 1.5,
      }} title={`Su Google hai ${g.media.toFixed(1).replace('.', ',')} su ${g.n} recensioni. Le lascia chiunque abbia un account Google, anche chi non ha mai ordinato da te: restano fuori dal voto qui sopra.`}>
        <span style={{display:'flex', alignItems:'center', gap: 6}}>
          <span style={{width: 5, height: 5, borderRadius:'50%', background: CLI_FONTI.google.colore, opacity: 0.55, flexShrink: 0}}/>
          Google, aperte a chiunque
        </span>
        <span style={{display:'block', paddingLeft: 11, fontVariantNumeric:'tabular-nums'}}>
          {g.media.toFixed(1).replace('.', ',')} su {g.n}
        </span>
      </div>
    </div>
  );
}

// ─── L'andamento ───────────────────────────────────────────────
// Quante ne arrivano e come vanno, nello stesso disegno: sono due domande che
// ci si fa insieme. Le barre sono il numero di recensioni del mese e partono
// da zero, come devono; la media è una linea con la sua scala a destra, perché
// una barra da 3,5 a 5 gonfierebbe differenze di un decimo.
// Le dodici rilevazioni sono quelle byup, come il voto accanto: mescolare qui
// le Google significherebbe rimetterle dentro dalla finestra un attimo dopo
// averle messe in fondo alla colonna di sinistra.
function CliAndamento({ d, mesiEt }) {
  // Dentro un `viewBox` il testo scala con la larghezza: un riquadro troppo
  // stretto stamperebbe etichette da sette pixel, uno troppo largo le farebbe
  // gigantesche. Questo è tarato sulla larghezza che ha adesso.
  // Basso e schiacciato di proposito: preso tutto lo spazio della card il
  // disegno era alto trecento pixel e diventava lui la Valutazione, mentre il
  // voto — che è il motivo per cui si apre questa card — stava in un angolo.
  // Il rapporto tra i mesi si legge uguale a metà altezza.
  const W = 740, H = 186, P = { l: 6, r: 30, t: 22, b: 24 };
  const mesi = d.fonti.byup.mese;
  const voti = d.fonti.byup.trend;
  const maxN = Math.max(...mesi);
  const passo = (W - P.l - P.r) / mesi.length;
  const larghezza = Math.min(22, passo * 0.4);
  const xc = (i) => P.l + passo * (i + 0.5);
  const yBarra = (n) => H - P.b - (n / maxN) * (H - P.t - P.b);
  const yVoto = (v) => H - P.b - ((v - 3.5) / 1.5) * (H - P.t - P.b);
  const linea = voti.map((v, i) => `${i === 0 ? 'M' : 'L'}${xc(i)},${yVoto(v)}`).join(' ');
  const ultimo = voti[voti.length - 1];
  const xUltimo = xc(voti.length - 1);

  return (
    /* Legenda e disegno stanno insieme e si centrano insieme: il disegno è
       basso e la colonna del voto è alta, e prima l'aria avanzata finiva tutta
       tra la legenda — rimasta in cima — e le barre, che sembravano scivolate
       via da lei. */
    <div style={{minWidth: 0, display:'flex', flexDirection:'column', justifyContent:'center'}}>
      <div style={{display:'flex', alignItems:'center', gap: 16, flexWrap:'wrap', marginBottom: 4}}>
        {/* Le barre si riprendono il corallo — sono il corpo del disegno, e
            in grigio erano lo sfondo di sé stesse — e la media passa al nero:
            due cose diverse non possono essere la stessa tinta a due
            opacità, e tra le due quella che si conta è il volume. */}
        <span style={{display:'inline-flex', alignItems:'center', gap: 7, fontSize: 13, color: PN.MUTED_SOFT}}>
          <span style={{width: 8, height: 8, borderRadius: 2, background: PN.PINK}}/>
          recensioni del mese
        </span>
        <span style={{display:'inline-flex', alignItems:'center', gap: 7, fontSize: 13, color: PN.MUTED_SOFT}}>
          <span style={{width: 13, height: 2, borderRadius: 2, background: PN.TEXT}}/>
          media, da 3,5 a 5
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', display:'block'}}>
        {[3.5, 4, 4.5, 5].map(v => (
          <g key={v}>
            <line x1={P.l} y1={yVoto(v)} x2={W - P.r + 4} y2={yVoto(v)} stroke={PN.BORDER_SOFT} strokeWidth={1}/>
            <text x={W - P.r + 8} y={yVoto(v) + 3.5} fontSize="10.5" fill={PN.MUTED_LIGHT}>{v.toFixed(1).replace('.', ',')}</text>
          </g>
        ))}
        {mesi.map((n, i) => (
          <rect key={i} x={xc(i) - larghezza / 2} y={yBarra(n)} width={larghezza} height={H - P.b - yBarra(n)}
            rx={4} fill={PN.PINK}/>
        ))}
        {/* La linea passa sopra le barre: filo bianco sotto perché resti
            staccata dal colore che attraversa. L'ultimo valore non è scritto —
            sarebbe una seconda cifra nera a dicembre, accanto a quella della
            barra, e si leggerebbero come due numeri della stessa cosa. */}
        <path d={linea} fill="none" stroke={PN.WHITE} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round"/>
        <path d={linea} fill="none" stroke={PN.TEXT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={xUltimo} cy={yVoto(ultimo)} r={4} fill={PN.TEXT} stroke={PN.WHITE} strokeWidth={2}/>
        {/* Quante ne sono arrivate, scritto sopra ogni barra: nella colonna
            stretta di prima erano dodici cifre in mezzo al disegno e le avevo
            tolte, ma a questa larghezza l'aria c'è e il numero esatto è quello
            che si va a cercare — «a settembre quante?».
            Vanno stampate per ultime e con l'alone bianco: la media taglia il
            disegno a mezz'altezza e passava esattamente sopra il «30» di
            luglio e il «35» di ottobre, che si leggevano cancellati. */}
        {mesi.map((n, i) => (
          <text key={i} x={xc(i)} y={yBarra(n) - 8} fontSize="11.5" fontWeight="700"
            fill={PN.TEXT} stroke={PN.WHITE} strokeWidth={3.4} paintOrder="stroke"
            strokeLinejoin="round" textAnchor="middle"
            style={{fontVariantNumeric:'tabular-nums'}}>{n}</text>
        ))}
        {mesiEt.map((m, i) => (
          <text key={i} x={xc(i)} y={H - 6} fontSize="10.5" fill={PN.MUTED_LIGHT} textAnchor="middle">{m}</text>
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
  const tot = g.voci.reduce((s, v) => s + v.n, 0);
  const max = Math.max(...g.voci.map(v => v.n));
  // Prima erano sei riquadri affiancati, ognuno con emoji, etichetta, numero,
  // base, freccia e barra: trenta dati in fila, tutti dello stesso peso, e
  // niente che dicesse da dove cominciare. È una classifica, e una classifica
  // si legge in colonna. Le righe scendono per numero — le prime tre a
  // sinistra, le altre a destra — e l'unico colore è il filo della barra.
  const perColonna = Math.ceil(g.voci.length / 2);

  return (
    <div style={{marginTop: 22, paddingTop: 20, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
      <div style={{
        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        gap: 18, flexWrap:'wrap', marginBottom: 16,
      }}>
        <div style={{minWidth: 0, maxWidth: 660}}>
          <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>
            {negativo ? 'Cosa non ha funzionato' : 'Cosa è piaciuto'}
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.45}}>
            {negativo
              ? <>Sotto le tre stelle l'app chiede cosa non è andato e il cliente spunta le caselle:
                  {' '}{tot} segnalazioni su {g.su} recensioni byup da una o due stelle. Le ha spuntate lui: non le abbiamo lette noi nel testo.</>
              : <>Da tre stelle in su l'app chiede invece cosa è piaciuto:
                  {' '}{tot} caselle toccate su {g.su} recensioni byup.</>}
          </div>
        </div>
        <div style={CLI_PILLOLE}>
          <button onClick={() => setModo('problemi')} style={cliPillola(negativo)}>Problemi</button>
          <button onClick={() => setModo('pregi')} style={cliPillola(!negativo)}>Pregi</button>
        </div>
      </div>

      <div style={{
        display:'grid', gridAutoFlow:'column',
        gridTemplateColumns:'1fr 1fr', gridTemplateRows:`repeat(${perColonna}, auto)`,
        columnGap: 40, rowGap: 2,
      }}>
        {g.voci.map(v => {
          const asp = STAT_ASPETTI[v.id];
          if (!asp) return null;
          const sel = attivo === v.id;
          const diff = v.n - v.prec;
          // La direzione da sola non dice se è una buona notizia: un problema
          // che sale è rosso, un pregio che sale è verde.
          const bene = negativo ? diff < 0 : diff > 0;
          return (
            /* `boxShadow:'none'` non è una dimenticanza: la regola globale dei
               bottoni alza un'ombra al passaggio, e su una riga larga e senza
               fondo quell'ombra disegna una scheda che vola. Il feedback qui
               è il velo grigio — la pressione resta quella di tutti. */
            <button key={v.id} onClick={() => onScegli(v.id)}
              title={sel ? 'Togli il filtro' : `Leggi le recensioni con «${asp.et}»`}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = PN.WHITE_HUSH; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
              style={{
                display:'flex', alignItems:'center', gap: 12, minWidth: 0,
                padding:'9px 10px', margin:'0 -10px', borderRadius: 9,
                border:'none', background: sel ? PN.WHITE_HUSH : 'transparent',
                boxShadow:'none', transition:'background 130ms ease',
                textAlign:'left', fontFamily:'inherit', cursor:'pointer',
              }}>
              <span style={{
                width: 118, flexShrink: 0, fontSize: 13.5,
                fontWeight: sel ? 700 : 500, color: PN.TEXT,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{asp.et}</span>

              <span style={{flex: 1, minWidth: 30, height: 4, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden'}}>
                <span style={{
                  display:'block', height:'100%', borderRadius: 999,
                  width:`${(v.n / max) * 100}%`, background: accento, opacity: sel ? 1 : 0.7,
                }}/>
              </span>

              <span style={{
                width: 26, flexShrink: 0, textAlign:'right',
                fontSize: 14, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums',
              }}>{v.n}</span>

              <span style={{
                width: 30, flexShrink: 0, textAlign:'right', fontSize: 12,
                fontWeight: 600, fontVariantNumeric:'tabular-nums',
                color: diff === 0 ? PN.MUTED_LIGHT : (bene ? PN.GREEN : PN.RED),
              }} title={diff === 0 ? 'Come nei dodici mesi prima' : `${Math.abs(diff)} in ${diff > 0 ? 'più' : 'meno'} dei dodici mesi prima`}>
                {diff === 0 ? '—' : `${diff > 0 ? '↑' : '↓'}${Math.abs(diff)}`}
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
                {v}<span style={{color: PN.PINK, fontSize: 11.5}}>★</span>
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
          display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap',
          padding:'9px 0 13px', marginBottom: 13, borderBottom:`1px solid ${PN.BORDER_SOFT}`,
        }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
            fontSize: 13.5, fontWeight: 700, color: PN.TEXT, whiteSpace:'nowrap',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius:'50%',
              background: asp.problema ? PN.RED : PN.GREEN,
            }}/>
            {asp.et}
          </span>
          <span style={{flex: 1, minWidth: 200, fontSize: 13.5, color: PN.MUTED_SOFT, lineHeight: 1.4}}>
            {agg && <>{agg.n} segnalazioni negli ultimi 12 mesi · </>}
            {visibili.length} tra le ultime {elenco.length} recensioni qui sotto
          </span>
          <button onClick={() => setAspetto('')} style={{
            flexShrink: 0, display:'inline-flex', alignItems:'center', gap: 5,
            padding:'4px 6px', border:'none', background:'transparent', boxShadow:'none',
            color: PN.MUTED, fontSize: 13, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
            transition:'color 140ms ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED; }}
          ><Icon name="xmark" size={11}/> Togli il filtro</button>
        </div>
      )}

      {/* L'elenco scorre: la card resta alta uguale con dodici recensioni e
          con cento, e i filtri restano sempre sott'occhio invece di finire
          due schermate più su. */}
      <div className="pn-scroll" style={{
        maxHeight: 470, overflowY:'auto', paddingRight: 4,
        // `alignItems:'start'`: ogni scheda alta quanto quello che ha da dire.
        // Con le schede tirate all'altezza della vicina, una recensione Google
        // di due righe si portava dietro mezzo riquadro vuoto — e senza più il
        // bordo a giustificarlo era solo una macchia grigia.
        display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12,
        alignContent:'start', alignItems:'start',
      }}>
        {visibili.map((r, i) => {
          const segn = segnalate[chiave(r)];
          return (
            /* Blocchi appoggiati, non scatole disegnate: dodici rettangoli col
               bordo, ognuno con dentro un tondo colorato e una pastiglia
               piena, facevano una griglia di cornici. Un fondo appena più
               scuro del bianco separa quanto basta, e toglie ventiquattro
               filetti dalla pagina. */
            <div key={i} style={{
              borderRadius: 14, padding: '15px 16px 13px',
              background: segn ? '#FFFBF1' : PN.WHITE_HUSH,
              minWidth: 0, display:'flex', flexDirection:'column', gap: 11,
            }}>
              <div style={{display:'flex', alignItems:'flex-start', gap: 11, minWidth: 0}}>
                {/* L'iniziale in un tondo neutro: i cinque colori a caso non
                    dicevano niente di quella persona e facevano concorrenza
                    alle stelle, che invece dicono tutto. */}
                <span style={{
                  width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
                  background: PN.WHITE_FROST, color: PN.MUTED,
                  display:'grid', placeItems:'center',
                  fontSize: 13, fontWeight: 700,
                }}>{r.iniziale}</span>
                <span style={{flex: 1, minWidth: 0}}>
                  <span style={{
                    display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 10, minWidth: 0,
                  }}>
                    <span style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.autore}</span>
                    <CliFonte fonte={r.fonte}/>
                  </span>
                  <span style={{display:'flex', alignItems:'center', gap: 7, marginTop: 4}}>
                    <CliStelle voto={r.stelle} lato={13}/>
                    <span style={{fontSize: 12.5, color: PN.MUTED_SOFT, whiteSpace:'nowrap'}}>{r.quando}</span>
                  </span>
                </span>
              </div>

              {/* Le virgolette basse a ogni scheda erano ventiquattro segni per
                  dire una cosa che il posto in cui sta il testo dice già. */}
              <div style={{flex: 1, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.55}}>{r.testo}</div>

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
                        padding:'3px 9px', borderRadius: 7,
                        background: asp2.problema ? PN.RED_SOFT : PN.WHITE,
                        color: asp2.problema ? '#9B2C2C' : PN.MUTED,
                        boxShadow: acceso
                          ? `0 0 0 1px ${asp2.problema ? PN.RED : PN.GREEN}`
                          : (asp2.problema ? 'none' : `0 0 0 1px ${PN.BORDER_SOFT}`),
                        fontSize: 12.5, fontWeight: 600, whiteSpace:'nowrap',
                      }}>{asp2.emoji} {asp2.et}</span>
                    );
                  })}
                </div>
              )}

              <div style={{
                marginTop:'auto', paddingTop: 11, borderTop:`1px solid ${PN.BORDER_HAIR}`,
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
              }}>
                {/* La riga che solo byup può scrivere: la recensione nasce da
                    un ordine pagato qui, quindi si sa che quella persona c'è
                    stata e cosa ha mangiato. Su Google non c'è modo di
                    saperlo, e infatti lì non c'è.
                    Il segno di spunta era verde: un terzo colore per dire una
                    cosa che dice già il nome del piatto in nero. */}
                {r.fonte === 'byup' ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 12.5, color: PN.MUTED_SOFT, minWidth: 0}}>
                    <Icon name="status-success" size={12}/>
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      Ordine verificato · <strong style={{color: PN.TEXT, fontWeight: 600}}>{r.piatto}</strong>
                    </span>
                  </span>
                ) : (
                  <span style={{fontSize: 12.5, color: PN.MUTED_LIGHT}}>Nessun ordine collegato</span>
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
                    onMouseEnter={e => { e.currentTarget.style.color = PN.RED; }}
                    onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED_LIGHT; }}
                    style={{
                      flexShrink: 0, display:'inline-flex', alignItems:'center', gap: 5,
                      padding:'2px 4px', border:'none', background:'transparent', boxShadow:'none',
                      color: PN.MUTED_LIGHT, fontSize: 12.5, fontWeight: 600,
                      fontFamily:'inherit', cursor:'pointer', transition:'color 140ms ease',
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

      {/* Il sottotitolo non ripete il totale: quello sta in grande due righe
          più sotto, ed è lì che si va a leggerlo. */}
      <StatCard title="Valutazioni" sub="Negli ultimi 12 mesi">
        {/* Sopra: quanto ti votano e come sta andando. Sotto, oltre il filetto:
            perché — le caselle che i clienti hanno spuntato nell'app. Sono la
            stessa cosa guardata a due distanze, e stavano in due card diverse
            solo perché sono nate in due momenti diversi. */}
        {/* Un box solo. Erano due — il voto di qua, il grafico di là, un filo
            verticale in mezzo — e il filo era l'unica cosa che diceva che
            fossero due cose: sono la stessa, quel numero e come ci è arrivato.
            Tolto il filo resta l'aria, il voto si incolonna stretto a sinistra
            e il disegno si prende il resto per tutta l'altezza. */}
        <div style={{display:'grid', gridTemplateColumns:'minmax(200px, 0.8fr) minmax(0, 2.3fr)', gap: 34, alignItems:'stretch'}}>
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
                }}>↑ {String(r.delta).replace('.', ',')}%</span>
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

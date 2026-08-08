// Statistiche — Clienti · sub-tab Fidelizzazione

// ─── Il colore, e quanto poco ───────────────────────────────────
// Questa pagina aveva ambra, corallo, blu, verde e rosso accesi nello stesso
// sguardo: ogni informazione si era presa una tinta e una scatola, e il
// risultato era che nessuna aveva più peso delle altre. Vale una regola sola,
// da qui in giù: il corallo è byup — e le stelle sono byup — il blu è Google,
// il rosso è un problema e il verde è il suo contrario (le due caselle che il
// cliente spunta nell'app, che si leggono in coppia o non si leggono),
// l'ambra è rimasta solo allo stato «Segnalata». Tutto il resto è grigio, e
// niente ha un bordo se un filetto o un po' d'aria bastano a separarlo.
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
// Del segno di provenienza è rimasto solo il blu, e solo per Google: byup non
// ha più bisogno di dirsi, perché è tutto quello che c'è in questa card.
const CLI_BLU_GOOGLE = '#4285F4';

// ─── Stelle ────────────────────────────────────────────────────
// La stella, unica per tutta la pagina, nella stessa forma dell'app.
const CLI_STELLA = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

// La stella di byup è una tessera: quadrata con gli angoli tondi, corallo
// piena e pesca da spenta, con la stella in bianco ricavata dentro. È quella
// che il cliente tocca nell'app per votare (`menu.jsx`, SuccessScreen) ed è
// quella della vetrina — quindi è questa, dal voto grande in cima fino alle
// stelle di ogni singola scheda. Il glifo pieno corallo, che per un po' è
// stato la stella delle schede, era la stessa forma di tutti: si legge come
// una stella qualunque, non come la stella di byup.
// Un voto medio è una frazione e va mostrata come tale — cinque tessere e
// sopra le stesse accese, tagliate al punto giusto: stamparne cinque piene per
// un 4,6 è il modo più veloce per far sembrare finto un numero vero. Il taglio
// è calcolato in pixel e non in percentuale della riga, perché tra una tessera
// e l'altra c'è aria: la percentuale sulla larghezza totale cadrebbe ogni
// volta un po' più in là del punto giusto. Sul voto di una singola recensione,
// che è un intero, il taglio non capita mai in mezzo a una tessera.
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

// Le pillole di scelta (provenienza, problemi/pregi) e il conteggio di una
// casella sui dodici mesi stavano qui: sono usciti insieme alle due sezioni
// che li usavano — i filtri per fonte, che non servono più da quando l'elenco
// è solo byup, e la classifica delle caselle. Il filtro di questa pagina è uno
// e sono le stelle, e si accende dalla distribuzione.

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
function CliVoto({ d, stelleSel, onScegli }) {
  const b = d.fonti.byup;
  return (
    <div style={{minWidth: 0, display:'flex', flexDirection:'column', gap: 20}}>
      {/* Le misure di questa colonna sono tarate una taglia sopra il resto
          della pagina: è stretta, e in una colonna stretta un corpo da tredici
          e mezzo con dentro stelle da dodici pixel si legge come una nota a
          piè di pagina — mentre qui c'è il voto, cioè la cosa per cui si apre
          la card. */}
      {/* Nessuna etichetta sopra il numero: «byup» c'era, ma la riga sotto dice
          già che sono le recensioni di chi ha ordinato e pagato qui, e Google
          si presenta da sé in testa alla card. Erano due parole per dire una
          cosa detta due volte più sotto. */}
      <div>
        <div style={{fontSize: 60, fontWeight: 700, color: PN.TEXT, letterSpacing:-2.4, lineHeight: 0.82}}>
          {b.media.toFixed(1).replace('.', ',')}
        </div>
        <div style={{margin:'14px 0 11px'}}><CliStelleTessere voto={b.media} lato={27} aria={6}/></div>
        {/* La media e il totale sono le due cose che si vengono a sapere qui:
            il conteggio è scuro e in grassetto, il resto della frase no. */}
        <div style={{fontSize: 15, color: PN.MUTED, lineHeight: 1.5}}>
          Sulla base di <span style={{fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
            {b.n.toLocaleString('it-IT', {useGrouping: true})}
          </span> recensioni, tutte da chi ha ordinato e pagato qui.
        </div>
      </div>

      {/* Cinque righe e cinque numeri, senza barre: la barra diceva una
          proporzione che con 253 su 312 si legge già dalle cifre, e nella
          colonna stretta restava un filo di due centimetri. */}
      {/* Le righe sono i filtri dell'elenco qui sotto. Erano cinque numeri da
          guardare: ma la domanda che uno si fa davanti a «12 recensioni da due
          stelle» è cosa hanno scritto, e la risposta era in un'altra card con
          un'altra pillola da trovare. Adesso la riga è la domanda e l'elenco è
          la risposta.
          `boxShadow:'none'` non è una dimenticanza: la regola globale dei
          bottoni alza un'ombra al passaggio, e su una riga larga e senza fondo
          quell'ombra disegna una scheda che vola. Qui il feedback è il velo. */}
      <div style={{display:'flex', flexDirection:'column', gap: 3}}>
        {[5,4,3,2,1].map(stelle => {
          const riga = b.stelle.find(r => r.stars === stelle);
          const sel = stelleSel === stelle;
          return (
            <button key={stelle} onClick={() => onScegli(sel ? 0 : stelle)}
              title={sel ? 'Togli il filtro' : `Leggi le ${riga.count} recensioni da ${stelle} stell${stelle === 1 ? 'a' : 'e'}`}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = PN.WHITE_HUSH; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
              style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'8px 12px', margin:'0 -12px', borderRadius: 10,
                border:'none', background: sel ? PN.PINK_BG_SOFT : 'transparent',
                boxShadow:'none', transition:'background 130ms ease',
                fontFamily:'inherit', fontSize: 16.5, cursor:'pointer', textAlign:'left',
              }}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap: 7,
                color: sel ? PN.PINK_DARK : PN.MUTED, fontWeight: sel ? 700 : 400,
                fontVariantNumeric:'tabular-nums',
              }}>
                {stelle}
                <svg width="17" height="17" viewBox="0 0 24 24" fill={PN.PINK} style={{display:'block'}}>
                  <polygon points={CLI_STELLA}/>
                </svg>
              </span>
              <span style={{
                flex: 1, textAlign:'right', color: sel ? PN.PINK_DARK : PN.TEXT,
                fontVariantNumeric:'tabular-nums', fontWeight: 700,
              }}>{riga.count}</span>
            </button>
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
    </div>
  );
}

// ─── Google, in testa e di lato ────────────────────────────────
// Stava in fondo alla colonna del voto, in grigio chiarissimo: al punto giusto
// della gerarchia ma nel punto sbagliato della pagina, perché per leggerlo
// bisognava scendere sotto la distribuzione. In testa, allineato al titolo, si
// vede subito e non toglie niente al 4,6 — è l'altro numero, quello che il
// ristoratore sa di avere e che qualcuno gli chiederà.
function CliGoogle({ g }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: 9,
      padding:'7px 13px', borderRadius: 999, background: PN.WHITE_FROST,
      whiteSpace:'nowrap', flexShrink: 0,
    }} title="Le recensioni Google le lascia chiunque abbia un account Google, anche chi non ha mai ordinato da te: restano fuori dal voto qui accanto.">
      {/* Solo «Google». La chiosa «aperte a chiunque» era il motivo per cui
          quel voto non fa media con l'altro, e stava bene quando la riga era
          in fondo alla colonna a giustificarsi; qui in testa, accanto al
          titolo, è una spiegazione dove serve solo un'etichetta. Il perché
          resta a portata di puntatore. */}
      <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 13.5, color: PN.MUTED}}>
        <span style={{width: 7, height: 7, borderRadius:'50%', background: CLI_BLU_GOOGLE, flexShrink: 0}}/>
        Google
      </span>
      <span style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
        {g.media.toFixed(1).replace('.', ',')}
      </span>
      <span style={{fontSize: 13.5, color: PN.MUTED_SOFT, fontVariantNumeric:'tabular-nums'}}>su {g.n}</span>
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
// averle messe fuori.
//
// Il mouse: la linea era un tracciato e basta, e un tracciato che non risponde
// sembra disegnato addosso al grafico invece che ricavato dai dati. Qui fa
// quello che fanno gli andamenti di Economici (`StatAndamento`): filo
// verticale tratteggiato sul mese sotto il puntatore, pallino sul punto,
// riquadro col dettaglio, mese in fondo che si accende. In più la barra sotto
// il puntatore si allarga e si stacca — le altre si velano — perché qui le
// barre sono la seconda serie e vanno interrogabili quanto la linea.
const CLI_MESI_ESTESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

function CliAndamento({ d, mesiEt }) {
  const [su, setSu] = React.useState(null);
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
      {/* La legenda è la chiave del disegno: dice cosa sono le barre e cosa è
          la linea, e a tredici pixel in grigio chiaro si leggeva dopo il
          grafico invece che prima. Sale al corpo delle legende di Economici —
          quattordici e mezzo, grigio medio — e i segni crescono con lei. Resta
          una legenda: non prende il nero, che qui è della media. */}
      <div style={{display:'flex', alignItems:'center', gap: 20, flexWrap:'wrap', marginBottom: 6}}>
        {/* Le barre si riprendono il corallo — sono il corpo del disegno, e
            in grigio erano lo sfondo di sé stesse — e la media passa al nero:
            due cose diverse non possono essere la stessa tinta a due
            opacità, e tra le due quella che si conta è il volume. */}
        <span style={{display:'inline-flex', alignItems:'center', gap: 8, fontSize: 14.5, color: PN.MUTED}}>
          <span style={{width: 10, height: 10, borderRadius: 3, background: PN.PINK, flexShrink: 0}}/>
          recensioni del mese
        </span>
        <span style={{display:'inline-flex', alignItems:'center', gap: 8, fontSize: 14.5, color: PN.MUTED}}>
          <span style={{width: 16, height: 2.5, borderRadius: 2, background: PN.TEXT, flexShrink: 0}}/>
          media, da 3,5 a 5
        </span>
      </div>
      <div style={{position:'relative'}}
        onMouseMove={e => {
          const box = e.currentTarget.getBoundingClientRect();
          const scala = box.width / W;
          const i = Math.floor(((e.clientX - box.left) / scala - P.l) / passo);
          setSu(i >= 0 && i < mesi.length ? i : null);
        }}
        onMouseLeave={() => setSu(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', display:'block'}}>
          {[3.5, 4, 4.5, 5].map(v => (
            <g key={v}>
              <line x1={P.l} y1={yVoto(v)} x2={W - P.r + 4} y2={yVoto(v)} stroke={PN.BORDER_SOFT} strokeWidth={1}/>
              <text x={W - P.r + 8} y={yVoto(v) + 3.5} fontSize="10.5" fill={PN.MUTED_LIGHT}>{v.toFixed(1).replace('.', ',')}</text>
            </g>
          ))}
          {su != null && (
            <line x1={xc(su)} y1={P.t - 12} x2={xc(su)} y2={H - P.b}
              stroke={PN.MUTED_LIGHT} strokeWidth={1} strokeDasharray="4 4"/>
          )}
          {mesi.map((n, i) => {
            const acceso = su === i;
            // Si allarga di un quinto e resta centrata sul mese: allargare da
            // un lato solo la farebbe scivolare, e a dodici barre vicine lo
            // spostamento si vede più dell'ingrandimento.
            const w = acceso ? larghezza * 1.24 : larghezza;
            return (
              <rect key={i} x={xc(i) - w / 2} y={yBarra(n)} width={w} height={H - P.b - yBarra(n)}
                rx={4} fill={PN.PINK} opacity={su == null || acceso ? 1 : 0.32}
                style={{
                  filter: acceso ? 'drop-shadow(0 3px 9px rgba(255,90,95,0.5))' : 'none',
                  transition:'opacity 130ms ease, filter 130ms ease',
                }}/>
            );
          })}
          {/* La linea passa sopra le barre: filo bianco sotto perché resti
              staccata dal colore che attraversa. L'ultimo valore non è scritto —
              sarebbe una seconda cifra nera a dicembre, accanto a quella della
              barra, e si leggerebbero come due numeri della stessa cosa. */}
          <path d={linea} fill="none" stroke={PN.WHITE} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round"/>
          <path d={linea} fill="none" stroke={PN.TEXT} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx={xUltimo} cy={yVoto(ultimo)} r={4} fill={PN.TEXT} stroke={PN.WHITE} strokeWidth={2}/>
          {su != null && (
            <circle cx={xc(su)} cy={yVoto(voti[su])} r={5.5} fill={PN.TEXT} stroke={PN.WHITE} strokeWidth={2.5}/>
          )}
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
              opacity={su == null || su === i ? 1 : 0.3}
              style={{fontVariantNumeric:'tabular-nums', transition:'opacity 130ms ease'}}>{n}</text>
          ))}
          {mesiEt.map((m, i) => (
            <text key={i} x={xc(i)} y={H - 6} fontSize="10.5" textAnchor="middle"
              fill={su === i ? PN.TEXT : PN.MUTED_LIGHT} fontWeight={su === i ? 700 : 400}>{m}</text>
          ))}
        </svg>

        {/* Il riquadro del mese: si sposta a sinistra sugli ultimi punti,
            altrimenti uscirebbe dalla card. */}
        {su != null && (
          <div style={{
            position:'absolute', top: 0, pointerEvents:'none',
            left: `${(xc(su) / W) * 100}%`,
            transform: su >= mesi.length - 4 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            background: PN.WHITE, borderRadius: 12, padding:'10px 13px',
            border:`1px solid ${PN.BORDER_SOFT}`, boxShadow:'0 10px 28px rgba(15,17,21,0.13)',
            minWidth: 176,
          }}>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>{CLI_MESI_ESTESI[su]}</div>
            <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 13.5}}>
              <span style={{width: 9, height: 9, borderRadius: 3, background: PN.PINK, flexShrink: 0}}/>
              <span style={{flex: 1, color: PN.MUTED}}>recensioni</span>
              <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{mesi[su]}</strong>
            </div>
            <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 13.5, marginTop: 3}}>
              <span style={{width: 11, height: 2, borderRadius: 2, background: PN.TEXT, flexShrink: 0, margin:'0 -1px'}}/>
              <span style={{flex: 1, color: PN.MUTED}}>media</span>
              <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{voti[su].toFixed(1).replace('.', ',')}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Le recensioni ─────────────────────────────────────────────
// Stavano in una card a parte, con i loro filtri — provenienza, stelle, e la
// casella accesa dalla classifica di sopra. Adesso stanno qui sotto il voto e
// il filtro è la riga di stelle che si clicca lì: la distribuzione fa la
// domanda («dodici da due stelle»), l'elenco risponde. Un posto solo, un gesto
// solo, e la card si legge dall'alto in basso senza cambiare argomento.
//
// Solo byup. Le Google erano schede senza piatto, senza caselle e senza
// «ordine verificato»: mezza scheda vuota a dire che di quella persona non
// sappiamo niente. Il loro numero sta in testa alla card, che è quanto serve —
// leggerle si va a farlo su Google, che è dove qualcuno le ha scritte.
//
// Al posto di questa sezione c'era la classifica delle caselle spuntate
// nell'app. I conteggi tornano qui come barra di filtri: la classifica era da
// leggere, questa è da usare, ma dice le stesse due cose — quali caselle sono
// state spuntate e quante volte.
function CliRecensioni({ elenco, totale, stelle, distribuzione, onPulisci }) {
  const [segnalate, setSegnalate] = React.useState({});
  const [inSegnalazione, setInSegnalazione] = React.useState(null);
  // La casella si accende da due punti — la barra qui sopra e le pastiglie
  // dentro le schede — e per questo il filtro vive nell'elenco; quello delle
  // stelle lo accende la distribuzione, che sta nell'altra metà della card.
  const [aspetto, setAspetto] = React.useState('');

  const chiave = (r) => `${r.autore}·${r.quando}`;
  const base = stelle ? elenco.filter(r => r.stelle === stelle) : elenco;
  const visibili = base.filter(r => !aspetto || (r.aspetti || []).includes(aspetto));
  const suDodiciMesi = stelle ? (distribuzione.find(r => r.stars === stelle) || {}).count : null;
  const asp = aspetto ? STAT_ASPETTI[aspetto] : null;

  // I conteggi della barra si contano su quello che il filtro delle stelle ha
  // già lasciato, non su tutto: un «Rumore 1» che poi non trova niente perché
  // le stelle escludevano quella recensione è un numero che mente. Per lo
  // stesso motivo una casella sparisce quando arriva a zero — tranne quella
  // accesa, che deve restare per potersi spegnere.
  const conteggi = {};
  base.forEach(r => (r.aspetti || []).forEach(a => { conteggi[a] = (conteggi[a] || 0) + 1; }));
  if (aspetto && !conteggi[aspetto]) conteggi[aspetto] = 0;
  // Prima i problemi e poi i pregi, e dentro ognuno per numero: quello su cui
  // si può fare qualcosa lunedì mattina sta all'inizio della riga.
  const caselle = Object.keys(conteggi)
    .filter(a => STAT_ASPETTI[a])
    .sort((x, y) => {
      const px = STAT_ASPETTI[x].problema ? 0 : 1, py = STAT_ASPETTI[y].problema ? 0 : 1;
      return px !== py ? px - py : conteggi[y] - conteggi[x];
    });

  // I due filtri si sommano, e insieme possono non lasciare niente: la riga
  // sotto il titolo deve dire cosa si sta guardando prima che uno se lo chieda.
  const conto = <>{visibili.length} tra le ultime {elenco.length}</>;
  const ha = visibili.length === 1 ? 'ha' : 'hanno';

  // La pastiglia di una casella, unica per i due posti in cui compare: nella
  // barra dei filtri col suo numero, dentro una scheda senza. Se fossero due
  // disegni diversi non si capirebbe che sono lo stesso comando.
  // Accesa si riempie del colore pieno con la scritta in bianco invece di
  // prendere un anello: un filo attorno a una pastiglia già colorata è un
  // segno in più da decifrare, il pieno si vede da una scheda all'altra.
  // `boxShadow:'none'` tiene fuori l'ombra che la regola globale dei bottoni
  // alza al passaggio: qui il feedback è la pastiglia che si scurisce.
  const casella = (a, n) => {
    const x = STAT_ASPETTI[a];
    const acceso = a === aspetto;
    const forte = x.problema ? PN.RED : PN.GREEN;
    const tenue = x.problema ? PN.RED_SOFT : PN.GREEN_SOFT;
    const scuro = x.problema ? '#9B2C2C' : '#166534';
    const sopra = x.problema ? '#FBCFCF' : '#C6F0D4';
    return (
      <button key={a} onClick={() => setAspetto(acceso ? '' : a)}
        title={acceso ? 'Togli il filtro' : `Vedi le recensioni con «${x.et}»`}
        onMouseEnter={e => { if (!acceso) e.currentTarget.style.background = sopra; }}
        onMouseLeave={e => { if (!acceso) e.currentTarget.style.background = tenue; }}
        style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          padding:'5px 11px', borderRadius: 999, border:'none', boxShadow:'none',
          background: acceso ? forte : tenue,
          color: acceso ? PN.WHITE : scuro,
          fontSize: 13.5, fontWeight: 600, whiteSpace:'nowrap',
          fontFamily:'inherit', cursor:'pointer',
          transition:'background 130ms ease, color 130ms ease',
        }}>
        {x.emoji} {x.et}
        {n != null && (
          <span style={{fontWeight: 700, fontVariantNumeric:'tabular-nums', opacity: acceso ? 0.85 : 0.6}}>{n}</span>
        )}
      </button>
    );
  };

  const togli = (etichetta, colore, onClick, titolo) => (
    <button onClick={onClick} title={titolo}
      onMouseEnter={e => { e.currentTarget.style.color = PN.TEXT; }}
      onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED; }}
      style={{
        flexShrink: 0, display:'inline-flex', alignItems:'center', gap: 7,
        padding:'7px 13px', borderRadius: 999,
        border:'none', background: PN.WHITE_FROST, boxShadow:'none',
        color: PN.MUTED, fontSize: 14, fontWeight: 600,
        fontFamily:'inherit', cursor:'pointer', transition:'color 140ms ease',
      }}>
      <span style={{display:'inline-flex', alignItems:'center', gap: 4, color: colore, fontWeight: 700}}>{etichetta}</span>
      <Icon name="xmark" size={11}/> Togli
    </button>
  );

  return (
    <div style={{marginTop: 24, paddingTop: 20, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
      <div style={{
        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        gap: 16, flexWrap:'wrap', marginBottom: 16,
      }}>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT}}>Cosa scrivono</div>
          {/* Il filtro delle stelle conta su dodici mesi, l'elenco tiene le
              ultime otto: senza dirlo, «253 da cinque stelle» e tre schede
              sembrerebbero un errore di conto. */}
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 3, lineHeight: 1.45}}>
            {stelle && asp
              ? <>{conto} {ha} {stelle} stell{stelle === 1 ? 'a' : 'e'} e la casella «{asp.et}»</>
              : stelle
                ? <>{suDodiciMesi} recensioni da {stelle} stell{stelle === 1 ? 'a' : 'e'} negli ultimi 12 mesi
                    {' · '}{conto} qui sotto</>
                : asp
                  ? <>{conto} {ha} spuntato la casella «{asp.et}»</>
                  : <>Le ultime {elenco.length} delle {totale.toLocaleString('it-IT', {useGrouping: true})} recensioni byup</>}
          </div>
        </div>

        {/* Il filtro delle stelle si accende nell'altra metà della card, e da
            qui non si vede: senza questo bottone, per toglierlo bisogna
            ricordarsi dov'era. Quello delle caselle il suo comando ce l'ha
            due righe sotto, e non ne ha bisogno. */}
        {stelle > 0 && togli(
          <>{stelle}<svg width="13" height="13" viewBox="0 0 24 24" fill={PN.PINK} style={{display:'block'}}><polygon points={CLI_STELLA}/></svg></>,
          PN.PINK_DARK, onPulisci, 'Torna a tutte le stelle')}
      </div>

      {/* La barra delle caselle. Le pastiglie erano cliccabili solo dentro le
          schede: il filtro c'era ma bisognava indovinarlo, e un comando che si
          scopre per sbaglio non è un comando. Qui si vedono tutte insieme, con
          quante volte sono state spuntate, prima ancora di leggere una
          recensione. */}
      {caselle.length > 0 && (
        <div style={{display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap', marginBottom: 15}}>
          <button onClick={() => setAspetto('')} title="Tutte le caselle"
            onMouseEnter={e => { if (aspetto) e.currentTarget.style.background = PN.WHITE_HUSH; }}
            onMouseLeave={e => { if (aspetto) e.currentTarget.style.background = PN.WHITE_FROST; }}
            style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'5px 13px', borderRadius: 999, border:'none',
              boxShadow: aspetto ? 'none' : `0 0 0 1.5px ${PN.TEXT}`,
              background: aspetto ? PN.WHITE_FROST : PN.WHITE,
              color: aspetto ? PN.MUTED : PN.TEXT,
              fontSize: 13.5, fontWeight: 700, fontFamily:'inherit', cursor:'pointer',
              transition:'background 130ms ease, color 130ms ease',
            }}>Tutte</button>
          {caselle.map(a => casella(a, conteggi[a]))}
        </div>
      )}

      {/* L'elenco scorre: la card resta alta uguale con otto recensioni e con
          cento, e il voto sopra non finisce due schermate più su.
          `alignItems:'start'`: ogni scheda alta quanto quello che ha da dire —
          tirate all'altezza della vicina, una recensione di due righe si
          porterebbe dietro mezzo riquadro vuoto. */}
      {/* Le schede erano grigie su bianco: un testo scuro su un grigio chiaro
          si legge meno di quanto si legga sul bianco, e a otto schede la
          griglia diventava una macchia sola. Si invertono — schede bianche
          dentro una vasca grigia — e ognuna torna a essere un foglio: il testo
          sta sul fondo che gli dà più contrasto, e a staccarle è lo sfondo
          sotto invece di un bordo attorno. */}
      <div style={{background: PN.BG, borderRadius: 16, padding: 14}}>
        <div className="pn-scroll" style={{
          maxHeight: 540, overflowY:'auto', paddingRight: 4,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14,
          alignContent:'start', alignItems:'start',
        }}>
        {visibili.map((r, i) => {
          const segn = segnalate[chiave(r)];
          return (
            /* La scheda dell'app, portata qui: il tondo corallo con l'iniziale
               in bianco, il nome, le stelle, le parole. Il tondo era grigio —
               scelta mia, per non fare concorrenza alle stelle — ma è il
               segno di byup sulla vetrina e nella scheda locale, e una
               recensione byup deve somigliare a una recensione byup. */
            <div key={i} style={{
              borderRadius: 18, padding:'18px 20px 15px',
              background: segn ? '#FFFBF1' : PN.WHITE,
              boxShadow: PN.CARD_SHADOW,
              minWidth: 0, display:'flex', flexDirection:'column', gap: 13,
            }}>
              <div style={{display:'flex', alignItems:'center', gap: 13, minWidth: 0}}>
                <span style={{
                  width: 44, height: 44, borderRadius:'50%', flexShrink: 0,
                  background: PN.PINK, color: PN.WHITE,
                  display:'grid', placeItems:'center',
                  fontSize: 17, fontWeight: 700,
                }}>{r.iniziale}</span>
                <span style={{flex: 1, minWidth: 0}}>
                  <span style={{
                    display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 10, minWidth: 0,
                  }}>
                    <span style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.autore}</span>
                    {/* In nero come il nome: quando è arrivata è metà di quello
                        che dice l'intestazione — un problema di sei giorni fa e
                        uno di sei mesi fa non sono la stessa notizia — e in
                        grigio chiaro si leggeva come una didascalia. */}
                    <span style={{fontSize: 13, color: PN.TEXT, whiteSpace:'nowrap', flexShrink: 0}}>{r.quando}</span>
                  </span>
                  <span style={{display:'flex', marginTop: 7}}>
                    <CliStelleTessere voto={r.stelle} lato={20} aria={4}/>
                  </span>
                </span>
              </div>

              {/* Le virgolette basse a ogni scheda erano segni per dire una
                  cosa che il posto in cui sta il testo dice già. */}
              <div style={{flex: 1, fontSize: 15.5, color: PN.TEXT, lineHeight: 1.6}}>{r.testo}</div>

              {/* Le caselle che ha spuntato nell'app dopo aver pagato. Sono una
                  coppia — cosa non ha funzionato, cosa è piaciuto — e vanno
                  lette come tale: rosso e verde, tutte e due piene.
                  Quelle positive erano bianche con un filo attorno: sulla
                  scheda grigia si vedevano, su quella bianca sono diventate
                  bianco su bianco e il filo da solo non le stacca. E metterle
                  in grigio le avrebbe fatte leggere come spente, cioè come il
                  contrario di quello che dicono. */}
              {(r.aspetti || []).length > 0 && (
                <div style={{display:'flex', flexWrap:'wrap', gap: 7}}>
                  {r.aspetti.filter(a => STAT_ASPETTI[a]).map(a => casella(a, null))}
                </div>
              )}

              <div style={{
                marginTop:'auto', paddingTop: 12, borderTop:`1px solid ${PN.BORDER_HAIR}`,
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
              }}>
                {/* La riga che solo byup può scrivere: la recensione nasce da
                    un ordine pagato qui, quindi si sa che quella persona c'è
                    stata davvero.
                    Il piatto stava qui accanto — «Ordine verificato ·
                    Amatriciana» — ed è uscito: la scheda parla di quanto è
                    andata bene la serata, e il nome di un piatto in fondo si
                    legge come se la recensione fosse di quel piatto. Il dato
                    resta nei dati, per quando avrà una sua colonna. */}
                <span style={{display:'inline-flex', alignItems:'center', gap: 7, fontSize: 13.5, color: PN.MUTED_SOFT, minWidth: 0}}>
                  <Icon name="status-success" size={13}/>
                  <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Ordine verificato</span>
                </span>

                {segn ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 5, flexShrink: 0, fontSize: 13.5, fontWeight: 600, color: PN.AMBER, whiteSpace:'nowrap'}}>
                    <Icon name="status-pending" size={13}/> Segnalata
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
                      color: PN.MUTED_LIGHT, fontSize: 13.5, fontWeight: 600,
                      fontFamily:'inherit', cursor:'pointer', transition:'color 140ms ease',
                    }}><Icon name="status-warning" size={13}/> Segnala</button>
                )}
              </div>
            </div>
          );
        })}

        {!visibili.length && (
          <div style={{
            gridColumn:'1 / -1', padding:'30px 0', textAlign:'center',
            fontSize: 15, color: PN.MUTED_SOFT, lineHeight: 1.5,
          }}>
            {stelle && asp
              ? <>Nessuna delle ultime {elenco.length} recensioni ha {stelle} stell{stelle === 1 ? 'a' : 'e'} e la casella «{asp.et}».</>
              : asp
                ? <>Nessuna delle ultime {elenco.length} recensioni ha spuntato «{asp.et}».</>
                : <>Nessuna delle ultime {elenco.length} recensioni ha {stelle} stell{stelle === 1 ? 'a' : 'e'}.</>}
            {stelle > 0 && !asp && <>
              <br/>
              <span style={{fontSize: 14}}>Negli ultimi 12 mesi ne sono arrivate {suDodiciMesi}.</span>
            </>}
          </div>
        )}
        </div>
      </div>

      {inSegnalazione && (
        <CliSegnala recensione={inSegnalazione}
          onChiudi={() => setInSegnalazione(null)}
          onInvia={() => { setSegnalate(s => ({...s, [chiave(inSegnalazione)]: true})); setInSegnalazione(null); }}/>
      )}
    </div>
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

  // Il filtro delle stelle sta qui e non dentro una delle due metà perché le
  // riguarda tutte e due: lo accende la riga della distribuzione, lo spegne il
  // bottone sopra l'elenco, e in mezzo c'è l'elenco che ne dipende.
  const [stelle, setStelle] = React.useState(0);   // 0 = tutte

  // Solo le byup. Sono le uniche che hanno un ordine dietro, delle caselle e
  // un piatto: le Google, in una scheda fatta per queste, sarebbero tre righe
  // e due spazi vuoti.
  const byup = d.feedback.filter(r => r.fonte === 'byup');

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
          più sotto, ed è lì che si va a leggerlo. Google sta in testa a destra,
          allineato al titolo: è l'altro numero, quello che qualcuno gli
          chiederà, e da lì si vede senza rubare la scena al 4,6. */}
      <StatCard title="Valutazioni" sub="Negli ultimi 12 mesi" action={<CliGoogle g={d.fonti.google}/>}>
        {/* Un box solo. Erano due — il voto di qua, il grafico di là, un filo
            verticale in mezzo — e il filo era l'unica cosa che diceva che
            fossero due cose: sono la stessa, quel numero e come ci è arrivato.
            Tolto il filo resta l'aria, il voto si incolonna stretto a sinistra
            e il disegno si prende il resto per tutta l'altezza. */}
        <div style={{display:'grid', gridTemplateColumns:'minmax(230px, 0.92fr) minmax(0, 2.2fr)', gap: 34, alignItems:'stretch'}}>
          <CliVoto d={d} stelleSel={stelle} onScegli={setStelle}/>
          <CliAndamento d={d} mesiEt={mesiEt}/>
        </div>

        {/* E sotto, quello che quel voto vuol dire a parole — filtrato dalla
            riga di stelle che si è cliccata sopra. */}
        <CliRecensioni elenco={byup} totale={d.fonti.byup.n}
          stelle={stelle} distribuzione={d.fonti.byup.stelle}
          onPulisci={() => setStelle(0)}/>
      </StatCard>

      <CliCiclo dati={d.ciclo}/>

      <StatFuori/>
    </div>
  );
}

// ─── Il ciclo di vita ──────────────────────────────────────────
// Cinque righe che dicono a che punto sono i clienti, dalla prima volta a chi
// viene tutte le settimane. Era una tabella: cornice, testatina maiuscola,
// righe a zebra e su ognuna una pastiglia verde piena. Cinque pastiglie sono
// cinque semafori accesi insieme — se tutto è in evidenza niente lo è — e la
// zebra serve a seguire una riga lunga venti colonne, non quattro.
//
// Poi c'è stata una barra intera divisa in cinque fette, sopra le righe, che
// si accendeva al passaggio del mouse. Diceva una cosa vera — che le cinque
// parti fanno un intero — ma la diceva una seconda volta: la quota di ogni
// riga sta già scritta in cifre, e per legare la fetta alla riga serviva un
// gioco di luci. Un disegno che ha bisogno di essere spiegato da
// un'interazione non sta spiegando niente.
//
// Resta la barra dentro la riga, dove non è un disegno in più ma il modo in
// cui la riga occupa la sua larghezza: parte dal nome e arriva alle cifre,
// lunga quanto la quota sul totale — la traccia grigia è il 100%, quindi si
// vede a occhio che le cinque sommano a uno. Il colore va dal pesca al
// vinaccia in cinque passi: non sono cinque categorie, è la stessa cosa che
// cresce, e un dato che cresce si colora con una tinta sola che si scurisce.
const CLI_CICLO_TINTE = ['#FFE0DD', '#FFB5B3', '#FF7A7E', '#E04347', '#B53338'];

function CliCiclo({ dati }) {
  const totale = dati.reduce((s, r) => s + r.n, 0);
  const tornati = totale - dati[0].n;
  // La colonna dei nomi è larga quanto il nome più lungo e non un pixel di
  // più: a larghezza fissa restava un buco tra la fine della parola e l'inizio
  // della barra, e un buco in mezzo a una riga la spezza in due.
  // Per questo la griglia è UNA sola, con le celle come figli diretti, e non
  // una griglia per riga: `max-content` si calcola per griglia, e con cinque
  // griglie ogni barra partiva da un punto diverso.
  const colonne = 'max-content minmax(80px, 1fr) 64px 58px 132px';
  // L'aria tra le colonne sta nelle celle e non in un `columnGap`: il filetto
  // che separa le righe è disegnato cella per cella, e col gap si interrompeva
  // quattro volte per riga — una riga tratteggiata che nessuno aveva chiesto.
  // L'ultima colonna tiene l'aria a sinistra invece che a destra, così la riga
  // finisce a filo della card come comincia.
  // Le celle si allungano all'altezza della riga e centrano dentro di sé: con
  // `alignItems:'center'` sulla griglia ogni cella era alta quanto il suo
  // contenuto — la barra otto pixel, il nome venti — e il filetto disegnato in
  // cima cadeva a quote diverse, spezzandosi a ogni colonna.
  const cella = (ultimo, aDestra) => ({
    display:'flex', alignItems:'center', justifyContent: aDestra ? 'flex-end' : 'flex-start',
    padding: ultimo ? '11px 0 11px 16px' : '11px 16px 11px 0',
    borderTop:`1px solid ${PN.BORDER_SOFT}`,
  });
  const testata = (ultimo) => ({
    padding: ultimo ? '0 0 9px 16px' : '0 16px 9px 0',
    fontSize: 12.5, color: PN.MUTED_SOFT,
  });

  return (
    <StatCard title="Ciclo di vita del cliente"
      sub={`${totale.toLocaleString('it-IT', {useGrouping: true})} clienti unici, dalla prima visita agli abituali`}
      action={
        <div style={{
          display:'inline-flex', alignItems:'baseline', gap: 7, flexShrink: 0,
          padding:'7px 13px', borderRadius: 999, background: PN.WHITE_FROST, whiteSpace:'nowrap',
        }} title="Tutti quelli che non sono alla prima visita: sono tornati almeno una volta.">
          <span style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
            {Math.round((tornati / totale) * 100)}%
          </span>
          <span style={{fontSize: 13.5, color: PN.MUTED}}>è tornato almeno una volta</span>
        </div>
      }>
      <div style={{display:'grid', gridTemplateColumns: colonne}}>
        {/* La testatina non ha più il fondo grigio né le maiuscole: erano il
            modo di dire «qui comincia una tabella», e non c'è più una tabella. */}
        <span style={testata()}>Stato</span>
        <span style={testata()}/>
        <span style={{...testata(), textAlign:'right'}}>Clienti</span>
        <span style={{...testata(), textAlign:'right'}}>Quota</span>
        {/* «vs prima» non diceva prima di cosa: la colonna confronta con il
            periodo precedente di pari durata — quello scelto in alto — e
            l'abbreviazione risparmiava trenta pixel al prezzo del significato. */}
        <span style={{...testata(true), textAlign:'right', whiteSpace:'nowrap'}}>vs periodo prec.</span>

        {dati.map((r, i) => (
          <React.Fragment key={i}>
            <span style={{...cella(), fontSize: 15.5, fontWeight: 600, color: PN.TEXT}}>{r.stato}</span>
            <span style={cella()}>
              <span style={{flex: 1, height: 8, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden'}}
                title={`${r.pct}% dei clienti del periodo`}>
                <span style={{display:'block', height:'100%', borderRadius: 999, width:`${r.pct}%`, background: CLI_CICLO_TINTE[i]}}/>
              </span>
            </span>
            <span style={{...cella(false, true), fontSize: 15.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>
              {r.n.toLocaleString('it-IT', {useGrouping: true})}
            </span>
            <span style={{...cella(false, true), fontSize: 15, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>{r.pct}%</span>
            {/* La freccia e il numero, senza pastiglia: il colore sulla cifra
                dice già da che parte va, e la pastiglia lo diceva una seconda
                volta su ogni riga. Il segno lo decide il dato: nei dati di oggi
                salgono tutte, ma una riga che scende non può stampare una
                freccia in su col numero negativo accanto. */}
            <span style={{
              ...cella(true, true), fontSize: 14.5, fontWeight: 700,
              color: r.delta >= 0 ? PN.GREEN : PN.RED,
              fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap',
            }} title={`Nel periodo precedente di pari durata erano ${String(Math.abs(r.delta)).replace('.', ',')}% in ${r.delta >= 0 ? 'meno' : 'più'}`}>
              {r.delta >= 0 ? '↑' : '↓'} {String(Math.abs(r.delta)).replace('.', ',')}%
            </span>
          </React.Fragment>
        ))}
      </div>
    </StatCard>
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

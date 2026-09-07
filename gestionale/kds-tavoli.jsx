// ══════════════════════════════════════════════════════════════════════════
// byup · KDS per TAVOLO — board, card, sezioni.
//
// Il modulo non conosce i dati: riceve `comande` gia' pronte. Le due
// sorgenti sono `kds-tavoli-mock.jsx` (la route di anteprima) e
// `kds-tavoli-da-cucina.jsx` (il servizio vero della Cucina), esattamente
// come fa la board Pub con cucina-kds2-mock / cucina-kds2-da-cucina.
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// byup · KDS — board per tavolo
//
// ── L'UNITA' E' IL TAVOLO ────────────────────────────────────────────────
// Dentro, i piatti sono raggruppati per STATO e basta — niente categorie:
// erano l'ultima intestazione rimasta dentro l'elenco e su una card da 360px
// separavano spesso due righe con una riga.
//
// I tre stati non sono pari, e si vede senza leggere:
//   in preparazione  fondo caldo, nomi in nero, mai comprimibile
//   in attesa        fondo bianco, nomi un tono piu' chiari, mai comprimibile
//   pronti           fondo grigio, tutto piu' piccolo, comprimibile e chiuso
// Le due sezioni di lavoro restano sempre aperte perche' sono il motivo per cui
// la card esiste; si chiude solo il registro.
//
// L'unita' del LAVORO invece e' l'USCITA: l'insieme che parte insieme perche'
// deve arrivare in tavola insieme — il secondo di chi non prende il primo parte
// coi primi. Nel modello non e' un'entita': e' l'insieme dei piatti con lo
// stesso `started_at` (kitchen_ticket_items). A schermo pero' le uscite sul
// fuoco NON si separano in blocchi diversi: fanno una sezione sola, e a
// distinguerle e' il cronometro di ogni riga.
//
// ── AVANTI SU TUTTO, INDIETRO SU QUELLO CHE SCEGLI ───────────────────────
// «Mandiamo i primi» e «tutto pronto» sono gesti da mucchio, e la CTA di
// sezione parte gia' puntata su tutta la sezione. Tornare indietro no: non si
// torna indietro in generale, si torna indietro perche' QUEL piatto non
// doveva partire. Quindi il ritorno compare solo dopo che hai toccato
// qualcosa. Toccare una riga non cambia mai niente: sceglie soltanto — ed e'
// il motivo per cui l'elenco puo' essere toccabile dappertutto, visto che in
// cucina lo schermo si sfiora col dorso della mano mentre si legge.
//
// Nessuno stato e' un vicolo cieco: pronto -> in preparazione -> in attesa.
// Nessuna conferma: con i guanti un «sei sicuro?» si impara a battere alla
// cieca in due giorni, e da li' non protegge piu' da niente.
//
// Non c'e' «consegnata»: il mondo della cucina finisce a pronto, e il passe si
// gestisce a voce.
//
// ── UNO SCHERMO SOLO, A QUALUNQUE MISURA ─────────────────────────────────
// Niente cornice fissa e niente scala: le card hanno sempre le stesse
// dimensioni reali, e a cambiare e' QUANTE colonne ci stanno — quattro su un
// monitor a parete, due su un tablet, una su un telefono. E' l'unico modo per
// cui un bersaglio da 44px resta 44px anche in cucina, dove si tocca con un
// guanto bagnato.
//
// FUORI di proposito: allergeni, annullamenti dalla sala, suono, stato della
// linea.
// ══════════════════════════════════════════════════════════════════════════

// Bersaglio minimo: 44px. E' il polpastrello dentro un guanto da cucina, ed e'
// il numero che decide quasi tutte le altezze di questo file.
const DITO = 44;

// ── NIENTE STATO «URGENTE», ED E' UNA SCELTA ─────────────────────────────
// C'era: una soglia di 12 minuti sul fuoco, e il tavolo peggiore marcato in
// rosso con la parola URGENTE. L'ho tolto, e non per fare meno roba.
//
// Un allarme e' una SENTENZA, e per emetterla serve sapere quanto un piatto
// avrebbe dovuto metterci. Quel dato non esiste da nessuna parte: nel modello
// c'e' `prep_time_minutes`, ma e' un tempo di catalogo — presuppone un cuoco
// fermo che fa solo quello — e non lo compila nessuno. Quindi la soglia era un
// numero scritto a tavolino, e un rosso sbagliato davanti a un cuoco vero non
// insegna a diffidare di quella card: insegna a diffidare del monitor.
//
// Il punto e' di SEQUENZA. I cronometri invece sono solidi, perche' misurano
// una cosa che lo chef ha avviato lui premendo MARCIA. Andando in campo senza
// la riga e registrando i tempi veri, la soglia la produce il servizio;
// andandoci con la riga, il numero se lo porta dietro da qui e non lo verifica
// piu' nessuno. Il pilota deve PRODURRE quella soglia, non consumarla.
//
// Cosa si perde: il colpo d'occhio — il colore faceva il confronto al posto
// tuo, adesso i tempi vanno letti.
// Cosa non si perde: il tavolo dimenticato resta visibile senza soglie, perche'
// le righe in attesa portano il tempo dall'arrivo e un dolce fermo da quaranta
// minuti mostra 40:12. Sparisce la sentenza, resta la prova.

// ── GLI STATI ────────────────────────────────────────────────────────────
// Ordine e colori vengono dal riferimento visivo: in preparazione ROSSO, in
// attesa ARANCIO, pronti VERDE — dal piu' caldo (quello che sta cuocendo
// adesso) al piu' freddo (quello che e' gia' uscito). I nomi restano quelli
// del gestionale (`ORDINE_STATO_META` in sala-card.jsx), cosi' sala e cucina
// chiamano le cose allo stesso modo.
const STATO = {
  marcia: { ink:'#E8402E', velo:'#FEF1EF', nome:'In preparazione' },
  attesa: { ink:'#F97316', velo:'#FFF4EC', nome:'In attesa' },
  pronto: { ink:'#1DA35C', velo:'#EDFAF2', nome:'Pronti' },
};
const ORDINE_STATI = ['marcia', 'attesa', 'pronto'];

// Le comande che non stanno a un tavolo. La parola cambia, la struttura sotto
// no: stessi stati, stessi comandi, stesso tutto.
const TIPO = { asporto:'Asporto', delivery:'Delivery', banco:'Banco' };

// ── IL SECONDARIO E' DI MARCA, IL PRIMARIO NO ───────────────────────────
// Grigi, fili e fondi non sono neutri: sono tarati sulla famiglia corallo del
// marchio (`PN.PINK` #FF5A5F, `PN.WINE` #B53338). Nessuno di questi valori e'
// acceso — stanno tutti sotto il 6% di saturazione — ma insieme danno alla
// pagina una temperatura, e quella temperatura e' byup invece che «grigio di
// sistema».
// La regola: il marchio sta nei fondi e nei contorni, MAI sul contenuto. I
// nomi dei piatti e i colori di stato restano quello che sono, perche' li' il
// colore e' informazione e il marchio sarebbe rumore.
const UI = {
  fondo:   '#F7F5F5',
  card:    '#FFFFFF',
  bordo:   '#EBE5E5',
  filo:    '#F3EDED',
  archivio:'#F6F1F1',
  testo:   '#16181D',
  tempo:   '#403A3B',
  muto:    '#8C8587',
  // Il vinaccia del marchio per l'azione secondaria: e' di casa, ed e'
  // abbastanza scuro da non confondersi col rosso dell'«in preparazione».
  secondo: PN.WINE,
};

/** Solo minuti. I secondi erano nel riferimento visivo, ma su questo schermo
 *  non decidono niente: nessuno agisce diversamente a 06:18 o a 06:45, e due
 *  cifre che cambiano ogni secondo su ogni riga di ogni card sono movimento
 *  perpetuo che l'occhio deve scartare. Il minuto e' la grana della decisione. */
const minuti = ms => Math.max(0, Math.floor(ms / 60000)) + '\u2032';

const min = ms => Math.max(0, Math.floor(ms / 60000));
const orario = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); };
const MIN = 60000;
const alle = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };


// ─── Derivazioni ──────────────────────────────────────────────────────────
const inUscita = (t, pid) => t.uscite.find(u => u.ids.indexOf(pid) >= 0) || null;
const vive     = t => t.uscite.filter(u => u.pronta == null);
const fatte    = t => t.uscite.filter(u => u.pronta != null);
const daFare   = t => t.piatti.filter(x => !inUscita(t, x.id));
const somma    = piatti => piatti.reduce((n, x) => n + x.qty, 0);

// Cosa si puo' fare a ogni stato. `avanti` e' null quando lo stato e' l'ultimo
// del mondo della cucina, `indietro` quando e' il primo — e in quel caso la
// casella resta VUOTA invece di sparire, cosi' l'altro bottone non si sposta.
// Il ritorno si chiama «Indietro» e basta, con la freccia. Prima diceva
// «Rimetti in attesa», che e' una frase piu' lunga della principale — e
// un'azione secondaria che occupa piu' spazio di quella primaria non si legge
// come secondaria, per quanto la si sbiadisca. In piu' metteva in campo un
// secondo verbo (*rimetti* contro *segna*) che si contendeva l'attenzione.
// Il passo indietro e' sempre uno solo, quindi dove porta non e' ambiguo.
//
// Due formulazioni per ogni azione, e la differenza non e' cosmetica: il
// bottone deve dire su COSA sta per agire. Senza scelta agisce su tutta la
// sezione e lo dice con la parola — «tutto» — senza numero, perche' il numero
// e' gia' scritto nell'intestazione. Con una scelta agisce solo su quella, e
// allora il numero serve: e' l'unica cosa che distingue «questi tre» da «tutti
// e sette». Prima c'era solo la cifra, e con un `7` non sapevi se avevi scelto
// sette piatti o se erano semplicemente sette.
const AZIONI = {
  marcia: { tutto: 'Tutto pronto', avanti: 'Pronto', indietro: 'Indietro' },
  attesa: { tutto: 'Manda tutto',  avanti: 'Manda',  indietro: null },
  pronto: { tutto: null,           avanti: null,     indietro: 'Indietro' },
};

/** Un tavolo ha finito quando non ha piu' niente ne' da fare ne' sul fuoco:
 *  la card resta, spenta, perche' sparire di colpo da sotto gli occhi e'
 *  peggio che restare li' a dire che non chiede piu' niente. */
const finito = t => vive(t).length === 0 && daFare(t).length === 0;

// ─── Pezzi ────────────────────────────────────────────────────────────────

/** CTA di sezione: outline nel colore dello stato, icona e testo, larghezza
 *  piena. E' il bottone del riferimento — «Segna tutto pronto», «Manda in
 *  preparazione» — e agisce su TUTTA la sezione, oppure solo sui piatti scelti
 *  se ne hai toccato qualcuno. */
/** CTA di sezione. NEUTRA e COMPATTA, e sono due decisioni separate.
 *
 *  Neutra: era un rettangolo contornato nel colore dello stato, e su sette card
 *  facevano dieci rettangoli colorati per circa 190.000 px² — trenta volte
 *  l'area del nome di un piatto, su cui il bottone agisce. Un bottone pero' si
 *  trova per POSIZIONE e FORMA: e' l'unico rettangolo pieno della card ed e'
 *  sempre in fondo alla sua sezione. Il colore li' era ridondante, e una
 *  ridondanza pagata dieci volte diventa rumore. Resta come accento sulla sola
 *  icona, che e' abbastanza per dire di che azione si tratta.
 *
 *  Compatta: larghezza automatica invece che piena. Cosi' smette di sembrare
 *  una barra che taglia la card in due, e l'area scende di due terzi.
 *
 *  Quello che NON cambia: resta un bottone pieno, alto 52, nello stesso posto
 *  di sempre. Non si e' perso un solo gesto. */
function Cta({ ink, children, onClick, icona, stretto, pieno }) {
  return (
    <button type="button" onClick={onClick} style={{
      // LA LARGHEZZA DICE LO SCOPO.
      // Senza selezione il bottone agisce su TUTTA la sezione, e si prende
      // tutta la riga: la sua estensione coincide con quella su cui agisce.
      // Appena scegli dei piatti si stringe a 186 — misura fissa, uguale per
      // «Tutto pronto» e «Manda tutto» — e nello spazio che libera compare
      // «Indietro». Il gesto di selezionare produce quindi due segnali in una
      // volta: il bottone si restringe (agisce su meno) e si fa avanti il
      // ritorno (adesso ha senso).
      // 186 e' il numero che fa stare CTA + stacco + «Indietro» dentro una card
      // da 360, che e' la piu' stretta che ammettiamo.
      flex: stretto ? '0 0 56px' : (pieno ? '1 1 auto' : '0 0 186px'), height: 52,
      padding: stretto ? 0 : '0 14px', maxWidth:'100%',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:10,
      borderRadius: 10, border: '1px solid ' + PN.BORDER,
      background: PN.BTN_NEUTRAL, boxShadow: PN.INSET_HIGHLIGHT,
      color: UI.testo, fontFamily:'inherit', fontSize: 16, fontWeight: 600,
      letterSpacing:'0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
    }}>
      {icona}{children}
    </button>
  );
}

const IcoPronto = ({ c }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>
);
const IcoMarcia = ({ c }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"><path d="M7 4.5 19 12 7 19.5z"/></svg>
);
/** La puntina. Volutamente sottotono: da spenta e' un contorno grigio chiaro
 *  che non chiede niente, da accesa si riempie. E' un comodo, non un comando
 *  di servizio — non deve mai competere con lo stato dei piatti. */
const IcoPin = ({ c, pieno }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={pieno ? c : 'none'} stroke={c}
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17.5V22"/><path d="M8.5 10.6V3.5h7v7.1l2.2 3.4H6.3z"/></svg>
);

/** Filtro di testata: etichetta e freccina, senza cornice. E' il controllo
 *  della schermata Cucina del gestionale, portato qui uguale. */
function Filtro({ children }) {
  return (
    <button type="button" style={{
      height: DITO, padding:'0 10px', background:'transparent', border:'none',
      display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer',
      color: UI.tempo, fontFamily:'inherit', fontSize:17, fontWeight:600, whiteSpace:'nowrap',
    }}>
      {children}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={UI.muto}
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  );
}

const IcoSchermo = ({ c }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8"/><path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8"/>
    <path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"/><path d="M16 21h2.5a2.5 2.5 0 0 0 2.5-2.5V16"/></svg>
);

const IcoIndietro = ({ c }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>
);

/** Riga piatto: pallino nel colore dello stato, quantita' e nome, tempo a
 *  destra. Il tempo e' allineato a destra e tabellare, cosi' le cifre stanno
 *  incolonnate e la differenza fra 02:30 e 08:20 si vede senza leggerle. */
function Riga({ piatto: x, ink, tempo, scelto, onTocca, minore, tenue }) {
  return (
    <div onClick={onTocca} style={{
      display:'flex', alignItems:'flex-start', gap: minore ? 10 : 12,
      minHeight: DITO, cursor:'pointer',
      padding: minore ? '6px 4px' : '8px 4px', borderRadius:8,
      background: scelto ? STATO_VELO(ink) : 'transparent',
      boxShadow: scelto ? 'inset 0 0 0 1.5px ' + ink : 'none',
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        {/* Tre gradini, e scendono sia di CORPO che di inchiostro:
              sul fuoco   19px nero pieno
              in attesa   17,5px grigio scuro
              gia' usciti 16,5px grigio
            Nessuno e' nascosto, ma l'occhio sa in che ordine guardarli — e
            l'attesa smette di pesare quanto il lavoro che stai facendo. */}
        <div style={{ fontSize: minore ? 16.5 : (tenue ? 17.5 : 19), fontWeight:500, lineHeight:1.35,
                      color: minore ? UI.muto : (tenue ? '#514748' : UI.testo) }}>
          <span style={{ fontWeight:700 }}>{x.qty}&times;</span> {x.nome}
        </div>
        {x.nota && !minore && (
          <div style={{ marginTop:2, fontSize:14.5, fontWeight:600, color:UI.muto }}>{x.nota}</div>
        )}
      </div>
      <span style={{ fontSize: minore ? 15.5 : (tenue ? 16.5 : 18), fontWeight:500,
                     color: minore ? UI.muto : (tenue ? '#75696B' : UI.tempo),
                     marginTop: minore ? 6 : 7,
                     fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{tempo}</span>
    </div>
  );
}
function STATO_VELO(ink) {
  const k = Object.keys(STATO).find(x => STATO[x].ink === ink);
  return k ? STATO[k].velo : 'transparent';
}

/**
 * Una sezione di stato: etichetta in maiuscoletto colorato col conteggio, la
 * freccia che ruota, le righe, e in fondo la CTA.
 *
 * Sta fuori da Card di proposito: un componente dichiarato dentro un altro e'
 * un tipo nuovo a ogni render, e React lo smonta e rimonta da capo — qui
 * sarebbe successo a ogni battito dell'orologio.
 */
function Sezione({ chiave, stato, piatti, tempoDi, apertoDef, primo, minore,
                   tid, on, flip, ha, tutti, onScegli, onAvanti, onIndietro }) {
  const m = STATO[stato];
  const bk = 'b:' + chiave;
  // «In preparazione» non si chiude mai. E' il lavoro sul fuoco ADESSO: se lo
  // si puo' nascondere, prima o poi qualcuno lo nasconde — e da quel momento
  // la card mostra tutto tranne l'unica cosa per cui esiste. Le altre due
  // sezioni si chiudono perche' una e' futuro e l'altra e' passato.
  // Le due sezioni di LAVORO non si chiudono mai: quello che stai facendo e
  // quello che devi fare sono il motivo per cui la card esiste, e una cosa che
  // si puo' nascondere prima o poi viene nascosta. Si chiudono solo i pronti,
  // che sono un registro.
  const fisso = stato !== 'pronto';
  // «Fisse allo stesso modo» non vuol dire «pari»: il fondo caldo ce l'ha solo
  // cio' che sta sul fuoco, e in attesa i nomi scendono di un tono.
  const vivo = stato === 'marcia';
  const aperto = fisso || on(bk, apertoDef !== false);
  const ids = piatti.map(x => x.id);
  const az = AZIONI[stato];
  const scelti = ids.filter(ha);
  const n = scelti.length ? somma(piatti.filter(x => ha(x.id))) : somma(piatti);

  return (
    /* I PRONTI NON SONO UNA TERZA SEZIONE ALLA PARI.
       Il mondo della cucina finisce a «pronto»: quello che e' uscito non e'
       lavoro, e' un registro — serve quando il cameriere chiede se gli
       antipasti del 23 sono usciti. Con lo stesso peso tipografico delle altre
       due rivendicava la stessa attenzione, che e' falso.
       Quindi scende su un fondo grigio, in coda alla card, con la tipografia
       spenta: si legge come un'appendice, non come un pari. Il pallino verde
       resta, cosi' lo stato e' ancora riconoscibile a colpo d'occhio, e i tempi
       ci sono tutti — si toglie il rilievo, non il contenuto. */
    /* ── TRE STATI, TRE TEMPERATURE DI FONDO ────────────────────────────
       In preparazione ha un velo CALDO, l'attesa resta sul bianco della card,
       i pronti stanno sul grigio. Letta dall'alto in basso la card fa una
       scala di temperatura che coincide col significato: quello che scotta,
       quello che deve ancora arrivare, quello che e' freddo e archiviato.
       Serve a una cosa precisa: anche con tutte le tendine aperte, quello che
       stai cucinando ADESSO si trova senza leggere una parola. E lo fa con una
       superficie al 3% di saturazione invece che con un'etichetta accesa —
       un fondo si vede con la coda dell'occhio e non compete coi nomi dei
       piatti, che restano la cosa piu' scura della card. */
    <div style={{
      borderTop: primo ? 'none' : '1px solid ' + (vivo ? 'rgba(232,64,46,0.16)' : UI.filo),
      borderBottom: vivo ? '1px solid rgba(232,64,46,0.16)' : 'none',
      padding: minore ? '10px 16px 12px' : '12px 16px 14px',
      background: minore ? UI.archivio : (vivo ? m.velo : 'transparent'),
    }}>
      {/* L'INTESTAZIONE FA UNA COSA SOLA: apre e chiude. Tutta, freccia
          compresa.
          Prima il titolo selezionava l'intero stato e solo la freccia apriva:
          tocchi per guardarci dentro e ti ritrovi tutto acceso, cioe' ottieni
          una cosa diversa da quella che volevi — e per giunta due gesti a
          pochi millimetri, che si sbagliavano di continuo.
          Quella selezione non serviva comunque: la CTA agisce gia' su tutta la
          sezione quando non hai scelto niente. Era un doppione che intralciava
          il gesto piu' innocuo che c'e'. */}
      <div onClick={fisso ? undefined : () => flip(bk, apertoDef !== false)}
        style={{ display:'flex', alignItems:'center', minHeight:34,
                 cursor: fisso ? 'default' : 'pointer' }}>
        <div style={{ flex:1, minWidth:0, display:'flex',
              alignItems:'center', gap:9, padding:'4px 0' }}>
          {/* «IN» piu' spento della parola che conta: l'occhio prende
              «PREPARAZIONE» e «ATTESA» senza inciampare due volte su «IN». */}
          {/* Niente pallini, in nessun punto della card. Erano il colore dello
              stato ripetuto su ogni riga e su ogni intestazione: quattro o
              otto macchie per card, tutte dello stesso colore dentro la stessa
              sezione, quindi senza distinguere niente al proprio interno.
              Il colore adesso vive dove si vede da lontano — il FONDO caldo di
              cio' che sta sul fuoco — e dove serve a premere, cioe' il
              contorno delle CTA. Un fondo si legge con la coda dell'occhio, un
              pallino da 9px no. */}
          {/* Una parola accesa per card, e sta sulla sola sezione che dice
              cosa stai cucinando ADESSO. Le altre due restano grigie: con tre
              etichette colorate per card si annullerebbero a vicenda e nessuna
              direbbe piu' «guarda qui». */}
          <span style={{ fontSize: minore ? 12 : 13, fontWeight:700, letterSpacing:'0.07em',
                         textTransform:'uppercase', color: vivo ? m.ink : UI.muto,
                         opacity: minore ? 0.85 : 0.62 }}>
            {m.nome.split(' ')[0]}
          </span>
          <span style={{ fontSize: minore ? 12 : 13, fontWeight: vivo ? 800 : 700,
                         letterSpacing:'0.07em', textTransform:'uppercase',
                         color: vivo ? m.ink : UI.muto, opacity: minore ? 0.85 : 1 }}>
            {m.nome.split(' ').slice(1).join(' ') || ''}
          </span>
          <span style={{ fontSize: minore ? 13 : 15, fontWeight:700,
                         color: minore ? UI.muto : UI.testo, fontVariantNumeric:'tabular-nums' }}>
            {somma(piatti)}
          </span>
        </div>
        {!fisso && (
          <div style={{ width:52, height:40, flexShrink:0, display:'grid', placeItems:'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={UI.tempo}
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: aperto ? 'rotate(180deg)' : 'none', transition:'transform 160ms ease-out' }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        )}
      </div>

      {aperto && (
        <div>
          {/* Niente raggruppamento per categoria, in nessuno stato.
              Serviva a leggere l'attesa quando conteneva tutto il resto della
              cena, ma era anche l'ultima intestazione rimasta dentro l'elenco:
              su una card da 360px separava spesso due righe con una riga, e
              costava piu' spazio di quanto ne facesse risparmiare all'occhio.
              I piatti restano nell'ordine in cui sono stati ordinati. */}
          {piatti.map(x => (
            <Riga key={x.id} piatto={x} ink={m.ink} tempo={tempoDi(x)} scelto={ha(x.id)}
              minore={minore} tenue={!vivo && !minore}
              onTocca={() => onScegli(tid, stato, [x.id])}/>
          ))}

          {/* ── AVANTI SU TUTTO, INDIETRO SU QUELLO CHE SCEGLI ──────────
              «Mandiamo i primi» e «tutto pronto» sono gesti da mucchio: la CTA
              parte gia' puntata su tutta la sezione, e lo dice con la parola
              «tutto» invece che con una cifra.
              Tornare indietro no: non si torna indietro in generale, si torna
              indietro perche' QUEL piatto non doveva partire. Quindi il
              ritorno compare solo dopo che hai toccato qualcosa, e dice su
              quante porzioni agisce.
              Il secondario NON e' largo quanto il primario e sta 16px piu'
              sotto: cosi' sotto il CENTRO della primaria — dove il dito punta
              e da dove scivola — non c'e' niente da colpire. */}
          {az.tutto ? (
            /* I due comandi tornano SULLA STESSA RIGA, ed e' possibile solo
               adesso: quando la primaria era larga quanto la card, il ritorno
               poteva stare solo sotto — sovrapposto in verticale, a 4px, con
               conseguenze opposte. Ora che la primaria e' compatta e a destra,
               stanno affiancati con 16px in mezzo, e sono due FORME diverse:
               testo nudo contro rettangolo pieno. Il dito che scivola in
               verticale non trova piu' niente, e in orizzontale c'e' lo stacco
               piu' il cambio di forma. */
            <div style={{ marginTop:12, display:'flex', justifyContent:'space-between',
                          alignItems:'center', gap:16 }}>
              {az.indietro && scelti.length > 0
                ? <button type="button" onClick={() => onIndietro(tid, stato, scelti)}
                  style={{
                    height: DITO, padding:'0 10px', flexShrink:0,
                    background:'transparent', border:'none',
                    display:'inline-flex', alignItems:'center', gap:7,
                    color:UI.secondo, fontFamily:'inherit', fontSize:14.5, fontWeight:600, cursor:'pointer',
                  }}>
                  <span style={{ fontSize:16, lineHeight:1 }}>&#8592;</span>
                  {az.indietro} <span style={{ fontWeight:800 }}>{n}</span>
                </button>
                : <span/>}
              <Cta ink={m.ink} pieno={!scelti.length}
                onClick={() => onAvanti(tid, stato, scelti.length ? scelti : ids)}
                icona={stato === 'marcia' ? <IcoPronto c={m.ink}/> : <IcoMarcia c={m.ink}/>}>
                {scelti.length
                  ? <React.Fragment>{az.avanti} <span style={{ fontWeight:800 }}>{n}</span></React.Fragment>
                  : az.tutto}
              </Cta>
            </div>
          ) : az.indietro && scelti.length > 0 && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
              <Cta ink={UI.secondo} onClick={() => onIndietro(tid, stato, scelti)}
                icona={<IcoIndietro c={UI.secondo}/>}>
                {az.indietro} <span style={{ fontWeight:800 }}>{n}</span>
              </Cta>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Card tavolo ──────────────────────────────────────────────────────────
function Card({ t, ora, sel, onScegli, onAvanti, onIndietro, fissato, onFissa }) {
  const [tog, setTog] = React.useState({});
  const on   = (k, def) => (tog[k] === undefined ? def : tog[k]);
  const flip = (k, def) => setTog(o => Object.assign({}, o, { [k]: !on(k, def) }));

  const v = vive(t), f = fatte(t), resto = daFare(t);
  const mio = sel.tid === t.id ? sel : { stato:null, ids:[] };
  const ha  = id => mio.ids.indexOf(id) >= 0;
  const tutti = ids => ids.length > 0 && ids.every(ha);
  const comuni = { tid:t.id, on, flip, ha, tutti, onScegli, onAvanti, onIndietro };
  const piattiDi = u => u.ids.map(id => t.piatti.find(y => y.id === id)).filter(Boolean);

  // Le sezioni si costruiscono nell'ordine degli stati, e compaiono solo se
  // hanno qualcosa dentro: una card non porta mai un'intestazione vuota.
  const blocchi = [];
  // ── UNA SOLA «IN PREPARAZIONE», SEMPRE ──────────────────────────────────
  // Un tavolo puo' avere due uscite sul fuoco insieme — il risotto partito
  // dieci minuti prima del resto dei primi, perche' devono uscire insieme — e
  // prima diventavano due sezioni con la stessa identica intestazione.
  // Due titoli uguali non separano niente: la differenza fra le due uscite e'
  // il TEMPO, ed e' gia' scritto su ogni riga. Quindi un blocco solo, i piatti
  // in ordine di partenza, e ognuno col suo cronometro.
  // Il modello non cambia: le uscite restano distinte nei dati (ognuna col suo
  // `started_at`), e dichiarandone pronta una parte `spacca` divide solo quella.
  if (v.length) blocchi.push(
    <Sezione {...comuni} key="marcia" chiave="marcia" stato="marcia"
      piatti={v.reduce((a, u) => a.concat(piattiDi(u)), [])}
      tempoDi={x => { const u = inUscita(t, x.id); return u ? minuti(ora - u.avvio) : '—'; }}/>
  );
  if (resto.length) blocchi.push(
    <Sezione {...comuni} key="attesa" chiave="attesa" stato="attesa" piatti={resto}
      apertoDef={false} tempoDi={() => minuti(ora - t.arrivo)}/>
  );
  if (f.length) blocchi.push(
    /* Sui pronti il tempo diventa l'ORA D'OROLOGIO invece dei minuti che
       scorrono. Stava sulla categoria, e togliendo la categoria sarebbe
       sparito — ma e' il numero giusto per una cosa chiusa: alla domanda «gli
       antipasti sono usciti?» si risponde «alle 20:52», non «ventidue minuti
       fa». I minuti servono a chi deve ancora fare qualcosa. */
    <Sezione {...comuni} key="pronto" chiave="pronto" stato="pronto" minore
      piatti={f.reduce((a, u) => a.concat(piattiDi(u)), [])} apertoDef={false}
      tempoDi={x => { const u = inUscita(t, x.id); return u ? orario(u.pronta) : '—'; }}/>
  );

  return (
    <div style={{
      background: UI.card, borderRadius: 14,
      border: '1px solid ' + (fissato ? PN.PINK_SOFT : UI.bordo),
      // La card fissata SI SOLLEVA. Non cambia colore e non prende un bordo
      // acceso: l'ombra e' l'unico canale che dice «questa sta sopra le altre»
      // senza rubare niente ai colori degli stati, che qui sono l'informazione.
      // E' anche l'unica metafora onesta — fissata vuol dire tenuta a galla
      // mentre il resto scorre, e un oggetto tenuto a galla fa piu' ombra.
      boxShadow: fissato
        ? '0 6px 18px rgba(16,18,22,0.11), 0 2px 5px rgba(16,18,22,0.06)'
        : '0 1px 2px rgba(16,18,22,0.04)',
      display:'flex', flexDirection:'column', overflow:'hidden',
      opacity: finito(t) ? 0.7 : 1,
    }}>
      {/* Testata: chi sei, e la puntina per tenerti in cima. */}
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'14px 8px 12px 16px',
        borderBottom:'1px solid ' + UI.filo }}>
        {/* DUE IDENTITA', UNA FORMA SOLA.
            Per un tavolo l'ancora e' il NUMERO: e' come lo chiamano tutti, ed
            e' quello che senti gridare in cucina.
            Per una comanda da ritirare l'ancora e' l'ORA DI RITIRO, non il nome
            del cliente: e' una scadenza, cioe' l'unica cosa su cui si decide
            qualcosa. Il nome scende accanto alla parola «Asporto», dove sta
            l'informazione che serve solo quando arrivi a quella card.
            Stessa gerarchia tipografica in tutti e due i casi — etichetta
            piccola, ancora grossa, contesto a destra — cosi' la board non
            sembra fatta di due oggetti diversi. */}
        <span style={{ fontSize:15, fontWeight:600, color:UI.muto }}>
          {t.tipo ? 'Ritiro' : 'Tavolo'}
        </span>
        <span style={{ fontSize:27, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1,
                       color:UI.testo, fontVariantNumeric:'tabular-nums' }}>
          {t.tipo ? orario(t.ritiro) : t.n}
        </span>
        <span style={{ flex:1 }}/>
        {/* Il partner del delivery e' una PASTIGLIA, non una parola: e' il segno
            che il gestionale usa gia' ovunque (`PN_PARTNER` nei token — sigla,
            fondo e inchiostro della piattaforma), e a colpo d'occhio dice chi
            manda il rider senza rubare spazio al nome del cliente. */}
        <span style={{ display:'flex', alignItems:'center', gap:7, minWidth:0,
                       fontSize:13.5, fontWeight:500, color:UI.muto }}>
          {t.partner && PN_PARTNER[t.partner] && (
            <span style={{
              width:23, height:23, flexShrink:0, borderRadius:6,
              display:'grid', placeItems:'center',
              background: PN_PARTNER[t.partner].bg, color: PN_PARTNER[t.partner].ink,
              fontSize:11.5, fontWeight:800, letterSpacing:'-0.01em',
            }}>{PN_PARTNER[t.partner].sigla}</span>
          )}
          <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {t.tipo
              ? (t.partner ? t.cliente : TIPO[t.tipo] + ' \u00b7 ' + t.cliente)
              : (t.cop != null ? t.sala + ' \u00b7 ' + t.cop + ' cop.' : t.sala)}
          </span>
        </span>
        <button type="button" onClick={onFissa}
          title={fissato ? 'Togli dalla cima' : 'Tieni in cima'}
          aria-label={fissato ? 'Togli dalla cima' : 'Tieni in cima'}
          aria-pressed={fissato}
          style={{
            width: 48, height: 48, flexShrink:0, marginLeft:2,
            display:'grid', placeItems:'center', background:'transparent', border:'none',
            cursor:'pointer', opacity: fissato ? 1 : 0.32,
          }}>
          {/* Accesa prende il corallo del marchio. Da spenta resta il grigio
              al 32%: il colore e' il premio del gesto compiuto, non un invito
              perpetuo — se la puntina fosse corallo anche da spenta, sette
              card farebbero sette richiami per un comando che serve una volta
              a servizio. */}
          <IcoPin c={fissato ? PN.PINK : UI.muto} pieno={fissato}/>
        </button>
      </div>
      {blocchi}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════

/**
 * La board. Non conosce i dati: riceve `comande` e le tiene in stato locale,
 * perche' marcia e pronto si scrivono qui — l'`avvio` di un'uscita e' l'istante
 * in cui QUESTO schermo ha premuto, non un campo che arriva dal servizio.
 *
 * `barra` e' la testata: dentro la Cucina la fornisce la pagina (chip dei
 * filtri, selettore di monitor, schermo intero), sulla route di anteprima non
 * c'e' e la mette il modulo — con l'orologio, perche' li' la board e' un
 * dispositivo a se' e l'ora non ce l'ha nessun altro.
 *
 * `orologio` accelera il tempo per la demo; nella Cucina resta 1.
 */
function KdsTavoliBoard({ comande, barra, orologio, oraZero }) {
  const ORA0 = oraZero != null ? oraZero : Date.now();
  const vel = orologio || 1;
  const [tavoli, setTavoli] = React.useState(comande || []);
  const [ora, setOra] = React.useState(ORA0);

  // ── I FILTRI DELLA TESTATA ──────────────────────────────────────────────
  // Sono gli stessi della board Pub, con lo stesso contratto, perche' la barra
  // della Cucina e' una sola e la monta la pagina: due cucine dello stesso
  // gestionale non possono avere due grammatiche.
  //   Canali     su cosa si sta lavorando — sala, asporto, delivery, banco
  //   Categorie  la stazione del piatto (Pizza, Primi, Secondi)
  // «Ordini consegnati» no: nella barra e' un CONTEGGIO che apre un pannello a
  // parte, non un filtro, e qui non servirebbe comunque — quello che e' uscito
  // sta gia' nella sezione «Pronti» di ogni comanda, dove e' un registro
  // sempre a portata di mano. La barra lo disegna solo a chi glielo passa.
  const TUTTI_C = 'Tutti i canali', TUTTE_CAT = 'Tutte le categorie';
  const [canale, setCanale] = React.useState(TUTTI_C);
  const [categoria, setCategoria] = React.useState(TUTTE_CAT);

  const ETICHETTA_CANALE = c => (c.tipo ? TIPO[c.tipo] : 'Sala');
  const canali = [TUTTI_C].concat(
    tavoli.map(ETICHETTA_CANALE).filter((v, i, a) => v && a.indexOf(v) === i));
  const categorie = [TUTTE_CAT].concat(
    tavoli.reduce((a, c) => a.concat(c.piatti.map(x => x.cat)), [])
      .filter((v, i, a) => v && a.indexOf(v) === i));

  // Il filtro per categoria toglie i PIATTI, non le comande: un tavolo che ha
  // anche altro resta, alleggerito. Se pero' di quel tavolo non resta niente,
  // la card sparisce — una card vuota non dice niente a nessuno.
  const visibili = tavoli
    .filter(c => canale === TUTTI_C || ETICHETTA_CANALE(c) === canale)
    .map(c => {
      if (categoria === TUTTE_CAT) return c;
      const piatti = c.piatti.filter(x => x.cat === categoria);
      const tengo = {}; piatti.forEach(x => { tengo[x.id] = true; });
      return Object.assign({}, c, {
        piatti,
        uscite: c.uscite.map(u => Object.assign({}, u, { ids: u.ids.filter(i => tengo[i]) }))
                        .filter(u => u.ids.length),
      });
    })
    .filter(c => c.piatti.length);
  // Le comande arrivano dall'esterno e possono cambiare (il servizio va
  // avanti). Quelle che il monitor ha gia' in mano NON si sovrascrivono: le
  // uscite che ha aperto lui sono sue, e ricalcolarle da fuori vorrebbe dire
  // azzerare i cronometri sotto le mani di chi sta cucinando.
  React.useEffect(() => {
    if (!comande) return;
    setTavoli(prev => comande.map(c => prev.find(p => p.id === c.id) || c));
  }, [comande]);
  // Una scelta sola su tutta la board: un tavolo, uno stato, dei piatti.
  const [sel, setSel] = React.useState({ tid:null, stato:null, ids:[] });

  // L'orologio avanza davvero: i colori si vedono cambiare invece di comparire
  // gia' cambiati. Parte dallo scenario, non dall'ora vera.
  React.useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setOra(ORA0 + (Date.now() - t0) * 6), 1000);
    return () => clearInterval(id);
  }, []);


  /** Toccare sceglie. Sullo stesso tavolo e stato aggiunge o toglie; altrove
   *  SPOSTA la scelta invece di mescolarla. */
  function scegli(tid, stato, ids) {
    setSel(s => {
      if (s.tid !== tid || s.stato !== stato) return { tid, stato, ids: ids.slice() };
      const pieni = ids.every(i => s.ids.indexOf(i) >= 0);
      const next = pieni ? s.ids.filter(i => ids.indexOf(i) < 0)
                         : s.ids.concat(ids.filter(i => s.ids.indexOf(i) < 0));
      return next.length ? { tid, stato, ids: next } : { tid:null, stato:null, ids:[] };
    });
  }

  // ─── Fissare una card in cima ───────────────────────────────────────────
  // Sostituisce il trascinamento, che faceva una cosa sola — mettere il tavolo
  // che mi interessa dove lo vedo — al prezzo del gesto piu' pesante dello
  // schermo: percorso lungo, bersaglio mobile, e il vincolo che la posizione
  // d'arrivo fosse gia' a schermo, senza auto-scorrimento. Un tocco fa lo
  // stesso lavoro a distanza zero, uguale con una colonna o con cinque.
  // Cio' che si perde e' «voglio questi due tavoli vicini»: e' plausibile ma
  // non l'ha mai chiesto nessuno, e in un pilota si scopre invece di presumerlo.
  // Quante colonne ci stanno: la card non scende mai sotto i 360px, la misura
  // piu' stretta in cui «3x Spaghetti aglio e olio» e il suo tempo stanno
  // ancora sulla stessa riga. Cinque su un monitor 1920, tre su un tablet in
  // orizzontale, una in verticale.
  const [larghezza, setLarghezza] = React.useState(() => window.innerWidth);
  React.useEffect(() => {
    const r = () => setLarghezza(window.innerWidth);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  // TRE COLONNE AL MASSIMO. Sotto i 360 la card non scende mai — e' la misura
  // in cui «3x Spaghetti aglio e olio» e il suo tempo stanno ancora sulla
  // stessa riga — ma sopra si', e volentieri: su un monitor 1920 tre colonne
  // fanno card da seicento pixel, dove il nome del piatto respira e i numeri
  // si leggono da lontano. Cinque colonne di card strette mostravano piu'
  // tavoli e li facevano leggere peggio, che sul monitor della cucina e' il
  // baratto sbagliato: quello che conta non e' quanti tavoli entrano, e'
  // quanto in fretta ne leggi uno.
  const colonne = Math.min(3, Math.max(1, Math.floor((larghezza - 24 + 12) / 372)));

  const [fissati, setFissati] = React.useState([]);
  const fissa = id => setFissati(f => f.indexOf(id) >= 0 ? f.filter(x => x !== id) : [id].concat(f));
  // L'ordinamento e' stabile: i fissati salgono, tutto il resto mantiene
  // l'ordine d'arrivo. Nessuna card si sposta se non gliel'hai chiesto tu.
  const inOrdine = visibili.slice().sort((a, b) =>
    (fissati.indexOf(b.id) >= 0 ? 1 : 0) - (fissati.indexOf(a.id) >= 0 ? 1 : 0));

  // ── LE CARD SI IMPACCHETTANO, NON SI ALLINEANO ──────────────────────────
  // Prima era una griglia a righe, e l'altezza di ogni riga la dettava la card
  // piu' alta: contraendone una restava il buco sotto, e con le tendine chiuse
  // mezzo schermo era vuoto.
  // Adesso sono colonne vere: dentro ciascuna le card si toccano, quindi
  // chiudere una sezione fa salire tutto quello che sta sotto NELLA SUA
  // COLONNA — e niente altro si muove.
  // Il riparto e' a giro (0,3,6 alla prima colonna; 1,4,7 alla seconda) e non
  // «riempi la piu' corta»: quello impacchetterebbe un filo meglio ma
  // sposterebbe le card DA UNA COLONNA ALL'ALTRA a ogni apertura, e un tavolo
  // che cambia colonna mentre lo stai guardando e' peggio di un buco.
  const colonneCard = Array.from({ length: colonne }, (_, i) =>
    inOrdine.filter((_, k) => k % colonne === i));

  /** Tutto schermo vero: su un monitor appeso la barra del browser e' spazio
   *  rubato ai tavoli, e nessuno la usa mai. */
  function schermo() {
    const d = document;
    if (d.fullscreenElement) { d.exitFullscreen && d.exitFullscreen(); return; }
    const e = d.documentElement;
    const f = e.requestFullscreen || e.webkitRequestFullscreen;
    if (f) f.call(e);
  }

  const azzera = () => setSel({ tid:null, stato:null, ids:[] });
  const scrivi = (tid, fn) => setTavoli(ts => ts.map(x => x.id === tid ? fn(x) : x));

  /** Spacca le uscite toccate: i piatti scelti finiscono in un'uscita nuova
   *  con `pronta` diverso, gli altri restano dov'erano. L'avvio non si tocca —
   *  il tempo di cottura e' quello vero e non riparte da adesso. */
  function spacca(t, ids, pronta, suffisso) {
    const nuove = [];
    t.uscite.forEach(u => {
      const presi = u.ids.filter(i => ids.indexOf(i) >= 0);
      const resta = u.ids.filter(i => ids.indexOf(i) < 0);
      if (!presi.length) { nuove.push(u); return; }
      if (resta.length) nuove.push(Object.assign({}, u, { ids: resta }));
      nuove.push({ id: u.id + suffisso, ids: presi, avvio: u.avvio, pronta: pronta });
    });
    return Object.assign({}, t, { uscite: nuove });
  }

  function avanti(tid, stato, ids) {
    const s = { tid, stato, ids };
    if (!s.tid || !s.ids.length) return;
    if (s.stato === 'attesa') {
      // Un istante solo per tutti: e' quello che DEFINISCE l'uscita.
      scrivi(s.tid, t => Object.assign({}, t, {
        uscite: t.uscite.concat([{ id:'u'+ora+'-'+s.ids[0], ids: s.ids.slice(), avvio: ora, pronta: null }]),
      }));
    }
    // Dichiarare pronta una PARTE di un'uscita la spacca in due: quei piatti
    // sono usciti, gli altri no, e fingere il contrario e' la bugia che il
    // resto della serata si porta dietro.
    if (s.stato === 'marcia') scrivi(s.tid, t => spacca(t, s.ids, ora, '-p'+ora));
    azzera();
  }

  function indietro(tid, stato, ids) {
    const s = { tid, stato, ids };
    if (!s.tid || !s.ids.length) return;
    // in preparazione -> in attesa: escono dall'uscita e tornano in elenco.
    // Un'uscita rimasta vuota non esiste piu': senza piatti non e' niente.
    if (s.stato === 'marcia') scrivi(s.tid, t => Object.assign({}, t, {
      uscite: t.uscite
        .map(u => u.ids.some(i => s.ids.indexOf(i) >= 0)
          ? Object.assign({}, u, { ids: u.ids.filter(i => s.ids.indexOf(i) < 0) }) : u)
        .filter(u => u.ids.length > 0),
    }));
    // pronto -> in preparazione: torna sul fuoco col suo avvio di prima.
    if (s.stato === 'pronto') scrivi(s.tid, t => spacca(t, s.ids, null, '-r'+ora));
    azzera();
  }

  return (
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column',
                  background: UI.fondo }}>
      {/* Testata: l'ORA a sinistra come ancora, i due filtri della schermata
          Cucina accanto, e a destra il tutto schermo — solo icona, perche' e'
          un comando che si usa una volta all'accensione e poi mai piu'.
          Via il titolo «Kitchen Monitor»: su un dispositivo che fa una cosa
          sola, dire come si chiama e' l'unica informazione di cui nessuno ha
          bisogno. */}
      {barra ? barra({ ora, canale, onCanale: setCanale, canali,
                       categoria, onCategoria: setCategoria, categorie }) : (
        <div style={{ height:72, flexShrink:0, display:'flex', alignItems:'center', gap:18,
                      padding:'0 14px 0 22px', background: PN.WHITE, borderBottom:'1px solid ' + UI.bordo }}>
          <span style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.02em', color: UI.testo,
                         fontVariantNumeric:'tabular-nums' }}>{orario(ora)}</span>
          <Filtro>Tutti i canali</Filtro>
          <Filtro>Tutte le categorie</Filtro>
          <span style={{ flex:1 }}/>
          <button type="button" onClick={schermo} title="Tutto schermo" aria-label="Tutto schermo"
            style={{ width:48, height:48, flexShrink:0, display:'grid', placeItems:'center',
                     background:'transparent', border:'none', cursor:'pointer' }}>
            <IcoSchermo c={UI.tempo}/>
          </button>
        </div>

      )}

      <div className="board"
        style={{
          flex:1, minHeight:0, padding:'10px 12px',
          // Si scorre SEMPRE in verticale, e tutte le colonne scorrono insieme:
          // un gesto solo, uguale sul monitor e sul tablet, e niente puo'
          // finire fuori portata.
          overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch',
          display:'flex', gap:12, alignItems:'flex-start',
        }}>
        {colonneCard.map((col, i) => (
          <div key={i} style={{ flex:'1 1 0', minWidth:0, display:'flex', flexDirection:'column', gap:12 }}>
            {col.map(t => (
              <Card key={t.id} t={t} ora={ora} sel={sel}
                fissato={fissati.indexOf(t.id) >= 0} onFissa={() => fissa(t.id)}
                onScegli={scegli} onAvanti={avanti} onIndietro={indietro}/>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Quello che serve fuori: la board alla pagina che la monta, e gli aiuti del
// tempo ai due file che producono le comande. Un `const` dentro uno script
// compilato da Babel non e' globale — va esportato a mano, o il modulo accanto
// non lo vede.
Object.assign(window, { KdsTavoliBoard, alle, MIN, orario, minuti, DITO, UI, STATO });

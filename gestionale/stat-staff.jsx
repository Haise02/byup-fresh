// Statistiche — sub-tab Staff

// Andamenti del periodo. L'ultima rilevazione coincide col numero mostrato di
// fianco (48 ≈ 48,44 · 2.129 · 2.570): una linea che finisce altrove
// racconterebbe una storia diversa dalla cifra che le sta accanto.
const STAFF_TREND = {
  scontrino: [42, 44, 43, 46, 45, 47, 48],
  ordini: [1820, 1900, 1880, 1950, 2010, 2080, 2129],
  mance: [2100, 2200, 2150, 2300, 2400, 2500, 2570],
};
const STAFF_MANCE_DELTA = 14.1;

// Prefissata come tutto il resto qui dentro: i file di Statistiche stanno in
// un ambito globale solo, e una `euro` generica sarebbe rimasta lì ad aspettare
// che un'altra scheda ne dichiarasse una sua con lo stesso nome — a quel punto
// non si rompe una funzione, si rompe la pagina.
const staffEuro = (v, dec = 2) => `€ ${v.toFixed(dec).replace('.', ',')}`;

// ─── Il valore di una riga: filo e pallino ─────────────────────
// Era una barra piena dentro una traccia grigia: otto righe così fanno un
// muro. Qui resta un filo sottile fino al punto, e il punto è il valore —
// stessa informazione con un quinto dell'inchiostro, e la classifica si legge
// dalla scaletta dei pallini invece che dai bordi delle barre.
// Il segno della media non è un trattino per riga: ogni riga ne disegna un
// pezzo che sborda sopra e sotto quanto basta a saldarsi col pezzo vicino,
// così sul pannello corre una riga verticale sola, continua.
function StaffFilo({ valore, scala, media, colore, primo, ultimo }) {
  const pos = Math.min(100, (valore / scala) * 100);
  const posMedia = Math.min(100, (media / scala) * 100);
  return (
    <span style={{position:'relative', display:'block', height: 20, minWidth: 40}}>
      {/* Lo sbordo è più della distanza fra due righe — che con l'imbottitura
          per l'evidenziazione è cresciuta — altrimenti la verticale si spezza
          negli spazi. */}
      <span style={{
        position:'absolute', top: primo ? 0 : -11, bottom: ultimo ? 0 : -11,
        left: `${posMedia}%`, width: 1.5, marginLeft: -0.75,
        background:'rgba(15,17,21,0.34)',
      }}/>
      <span style={{
        position:'absolute', top:'50%', left: 0, height: 3, marginTop: -1.5,
        width: `${pos}%`, borderRadius: 999,
        background: colore, opacity: 0.32,
        transition:'width 400ms ease-out',
      }}/>
      <span style={{
        position:'absolute', top:'50%', left: `${pos}%`,
        width: 9, height: 9, marginTop: -4.5, marginLeft: -4.5,
        borderRadius:'50%', background: colore,
        boxShadow:'0 0 0 2.5px rgba(255,255,255,0.95)',
        transition:'left 400ms ease-out',
      }}/>
    </span>
  );
}

// ─── I due pannelli della card Team ────────────────────────────
// Due riquadri e non due colonne di una tabella sola: sono due classifiche
// indipendenti, ognuna col suo ordine. Oggi, su questi dati, il primo è lo
// stesso — ma le mance rapportate ai tavoli sono un'altra misura dal conto
// medio, e il giorno che il primo cambia i due elenchi devono poterlo dire.
// Accanto al nome resta il numero grezzo da cui esce la barra: gli ordini per
// il conto medio, le mance e i tavoli per la divisione.
const STAFF_METRICHE = [
  {
    id: 'scontrino',
    et: 'Scontrino medio',
    colore: PN.PINK,
    valore: s => s.scontrino,
    micro: s => `${s.ordini} ordini`,
    microEsteso: s => `${s.ordini} ordini gestiti nel periodo`,
  },
  {
    id: 'perTavolo',
    et: 'Mancia per tavolo',
    colore: PN.GREEN,
    valore: s => s.tip / s.tavoli,
    // Nella colonna ci stanno due numeri e basta: per esteso lo dice il
    // suggerimento, che è dove uno va a guardare se «su 95» non gli torna.
    micro: s => `€ ${s.tip} · ${s.tavoli} tavoli`,
    microEsteso: s => `€ ${s.tip} di mance su ${s.tavoli} tavoli serviti`,
  },
];

function StaffPannello({ metrica, media }) {
  const righe = [...STAFF]
    .map(s => ({ ...s, v: metrica.valore(s) }))
    .sort((a, b) => b.v - a.v);
  const scala = righe[0].v || 1;
  // Posizione, avatar, nome col suo numero sotto, il filo, il valore. Griglia
  // e non flex: le colonne devono incolonnarsi da una riga all'altra.
  // Posizione, avatar, nome col suo numero sotto, il filo, il valore. Griglia
  // e non flex: le colonne devono incolonnarsi da una riga all'altra.
  // L'imbottitura serve all'evidenziazione del passaggio del mouse — senza, il
  // colore starebbe attaccato al testo — e i margini negativi la riportano a
  // filo, così le colonne non si spostano.
  const griglia = {
    display:'grid',
    gridTemplateColumns:'14px 28px minmax(0, 1fr) minmax(56px, 0.95fr) 62px', ...STMIN(430),
    alignItems:'center', gap: 10,
    padding:'6px 8px', margin:'0 -8px', borderRadius: 10,
    transition:'background 140ms ease, transform 140ms ease',
  };

  // La card ha un'ombra sua, e boxHover la azzera in uscita invece di
  // ripristinarla: qui il passaggio del mouse se la gestisce da sé.
  const hoverPannello = {
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'scale(1.012)';
      e.currentTarget.style.boxShadow = PN.CARD_SHADOW_HOVER;
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = PN.CARD_SHADOW;
    },
  };
  // Le righe si accendono della tinta della loro misura, tenuta bassissima:
  // deve dire «sei qui», non ridipingere l'elenco.
  // L'ingrandimento è la metà di quello della card: la riga contiene il segno
  // verticale della media, che è lo stesso su tutte, e ingrandendo si sposta —
  // oltre questa misura la verticale si vede spezzarsi sulla riga puntata.
  const hoverRiga = {
    onMouseEnter: e => {
      e.currentTarget.style.background = `${metrica.colore}16`;
      e.currentTarget.style.transform = 'scale(1.006)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = '';
      e.currentTarget.style.transform = '';
    },
  };

  return (
    <div {...hoverPannello} style={{
      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
      borderRadius: 14, padding:'16px 18px 18px', minWidth: 0,
      boxShadow: PN.CARD_SHADOW,
      transition: BOX_TRANSITION,
    }}>
      {/* Il trattino sta accanto al numero che rappresenta, non in cima alla
          card: così la legenda è il valore stesso, e non c'è da collegare due
          cose lontane. La riga sotto stacca l'intestazione dall'elenco. */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
        paddingBottom: 11, marginBottom: 13, borderBottom:`1px solid ${PN.BORDER_SOFT}`,
      }}>
        <span style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.1}}>{metrica.et}</span>
        {/* Era 13px in grigio chiaro e spariva: è il valore a cui si riferisce
            la verticale su tutte le righe, quindi ha bisogno di leggersi. Ora
            è una pastiglia, col numero in nero. */}
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 7, flexShrink: 0,
          padding:'4px 11px', borderRadius: 999,
          background: PN.WHITE_HUSH, border:`1px solid ${PN.BORDER_SOFT}`,
          fontSize: 14, whiteSpace:'nowrap',
        }}>
          <span style={{width: 2, height: 12, background:'rgba(15,17,21,0.45)', borderRadius: 1}}/>
          <span style={{color: PN.MUTED}}>media</span>
          <strong style={{color: PN.TEXT, fontWeight: 700, fontVariantNumeric:'tabular-nums'}}>{staffEuro(media)}</strong>
        </span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 8, ...STSCROLL()}}>
        {righe.map((s, i) => (
          <div key={s.nome} {...hoverRiga} style={griglia}>
            {/* Il posto in classifica: i primi tre un filo più scuri, il resto
                appena accennato. Serve a dare la scaletta, non a gridare. */}
            <span style={{
              fontSize: 12.5, fontWeight: 700, textAlign:'right',
              color: i < 3 ? PN.MUTED : PN.MUTED_LIGHT,
              fontVariantNumeric:'tabular-nums',
            }}>{i + 1}</span>
            <span style={{
              width: 28, height: 28, borderRadius:'50%',
              background: s.avatarBg, color:'#fff',
              display:'grid', placeItems:'center',
              fontSize: 11, fontWeight: 700,
            }}>{s.avatar}</span>
            <span title={`${s.nome} · ${s.ruolo}`} style={{minWidth: 0}}>
              <span style={{
                display:'block', fontSize: 14.5, color: PN.TEXT,
                fontWeight: i === 0 ? 600 : 500, lineHeight: 1.25,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{s.nome}</span>
              {/* Sotto il nome solo il numero grezzo da cui esce il valore. Il
                  ruolo stava qui e mangiava la riga — «Cameriera · 274 ord…» —
                  quindi è passato nel suggerimento del nome. */}
              <span style={{
                display:'block', fontSize: 12.5, color: PN.MUTED_SOFT,
                fontVariantNumeric:'tabular-nums',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{metrica.micro(s)}</span>
            </span>
            <StaffFilo valore={s.v} scala={scala} media={media} colore={metrica.colore}
              primo={i === 0} ultimo={i === righe.length - 1}/>
            <strong style={{
              textAlign:'right', fontSize: 15, fontWeight: 700, color: PN.TEXT,
              fontVariantNumeric:'tabular-nums', letterSpacing: -0.2,
            }}>{staffEuro(s.v)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatStaff() {
  const teamAvg = (STAFF.reduce((s, x) => s + x.scontrino, 0) / STAFF.length);
  const totOrdini = STAFF.reduce((s, x) => s + x.ordini, 0);
  const totTip = STAFF.reduce((s, x) => s + x.tip, 0);
  const totTavoli = STAFF.reduce((s, x) => s + x.tavoli, 0);
  // La media della mancia per tavolo è quella del locale — mance totali diviso
  // tavoli totali — non la media delle otto medie: chi ha servito più tavoli
  // deve pesare di più.
  const mediaPerTavolo = totTip / totTavoli;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI in testa, come nelle altre sezioni di Operazioni. Da quattro card
          a tre — quanti sono in squadra non è un andamento, e lo dice già il
          sottotitolo del riquadro qui sotto — quindi cade anche la variante
          compatta: in tre colonne c'è la larghezza per la card piena, la
          stessa di Economici, con le etichette per esteso. */}
      <div style={{display:'grid', gridTemplateColumns: STG('repeat(3, 1fr)'), gap: 12}}>
        <StatKpiTinto tono="rosa" glifo="€" label="Scontrino medio"
          valore={staffEuro(teamAvg)}
          delta={6.4} sub={`Media fra gli ${STAFF.length} membri attivi`} trend={STAFF_TREND.scontrino}/>
        <StatKpiTinto tono="giallo" icona="commerce-cart" label="Ordini gestiti"
          valore={totOrdini.toLocaleString('it-IT', {useGrouping: true})}
          delta={9.2} sub="Presi in carico dal team nel periodo" trend={STAFF_TREND.ordini}/>
        <StatKpiTinto tono="verde" icona="commerce-coins" label="Mance raccolte"
          valore={`€ ${totTip.toLocaleString('it-IT', {useGrouping: true})}`}
          delta={STAFF_MANCE_DELTA} sub="Lasciate dai clienti al personale" trend={STAFF_TREND.mance}/>
      </div>

      <StatCard title="Team" sub={`Tutti e ${STAFF.length} i membri attivi nel periodo, dal più alto`}>
        <div style={{display:'grid', gridTemplateColumns: STG('1fr 1fr'), gap: 14}}>
          <StaffPannello metrica={STAFF_METRICHE[0]} media={teamAvg}/>
          <StaffPannello metrica={STAFF_METRICHE[1]} media={mediaPerTavolo}/>
        </div>
      </StatCard>
    </div>
  );
}

window.StatStaff = StatStaff;

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

const euro = (v, dec = 2) => `€ ${v.toFixed(dec).replace('.', ',')}`;

// ─── Barra di una metrica, col segno della media ───────────────
// Il trattino verticale è la media del team: dentro un pannello cade nello
// stesso punto su tutte le righe, quindi chi la supera e chi no si legge senza
// contare, e senza scrivere «+21%» accanto a ogni nome.
function StaffBarra({ valore, scala, media, colore }) {
  return (
    <span style={{position:'relative', display:'block', height: 8, borderRadius: 999, background: PN.WHITE_FROST, minWidth: 24}}>
      <span style={{
        display:'block', height:'100%',
        width: `${Math.min(100, (valore / scala) * 100)}%`,
        background: colore, borderRadius: 999,
        transition:'width 400ms ease-out',
      }}/>
      <span style={{
        position:'absolute', top: -1, bottom: -1, left: `${Math.min(100, (media / scala) * 100)}%`,
        width: 2, marginLeft: -1, borderRadius: 1,
        background:'rgba(15,17,21,0.42)',
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
    micro: s => `€ ${s.tip} su ${s.tavoli}`,
    microEsteso: s => `€ ${s.tip} di mance su ${s.tavoli} tavoli serviti`,
  },
];

function StaffPannello({ metrica, media }) {
  const righe = [...STAFF]
    .map(s => ({ ...s, v: metrica.valore(s) }))
    .sort((a, b) => b.v - a.v);
  const scala = righe[0].v || 1;
  // Avatar, nome, numero grezzo, barra, valore. Griglia e non flex: le cinque
  // colonne devono incolonnarsi da una riga all'altra.
  const griglia = {
    display:'grid',
    gridTemplateColumns:'22px minmax(0, 1fr) 74px minmax(56px, 1.05fr) 56px',
    alignItems:'center', gap: 8,
  };

  return (
    <div style={{
      background: PN.BG, border:`1px solid ${PN.BORDER}`,
      borderRadius: 12, padding: 14, minWidth: 0,
    }}>
      {/* Il trattino sta accanto al numero che rappresenta, non in cima alla
          card: così la legenda è il valore stesso, e non c'è da collegare due
          cose lontane. */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, marginBottom: 12}}>
        <span style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>{metrica.et}</span>
        <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 13, color: PN.MUTED, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
          <span style={{width: 2, height: 11, background:'rgba(15,17,21,0.42)', borderRadius: 1}}/>
          media {euro(media)}
        </span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 10}}>
        {righe.map((s, i) => (
          <div key={s.nome} style={griglia}>
            <span style={{
              width: 22, height: 22, borderRadius:'50%',
              background: s.avatarBg, color:'#fff',
              display:'grid', placeItems:'center',
              fontSize: 10, fontWeight: 700,
            }}>{s.avatar}</span>
            <span title={`${s.nome} · ${s.ruolo}`} style={{
              minWidth: 0, fontSize: 14, color: PN.TEXT,
              fontWeight: i === 0 ? 600 : 400,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{s.nome}</span>
            <span title={metrica.microEsteso(s)} style={{
              fontSize: 13, color: PN.MUTED_SOFT, textAlign:'right',
              fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap',
            }}>{metrica.micro(s)}</span>
            <StaffBarra valore={s.v} scala={scala} media={media} colore={metrica.colore}/>
            <strong style={{
              textAlign:'right', fontSize: 14.5, fontWeight: 700, color: PN.TEXT,
              fontVariantNumeric:'tabular-nums',
            }}>{euro(s.v)}</strong>
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
  // Composizione ricavata dai ruoli, non scritta a mano: così non può
  // contraddire l'elenco che sta qui sotto.
  const nMaitre = STAFF.filter(s => s.ruolo === 'Maître').length;
  const nCamerieri = STAFF.length - nMaitre;
  // La media della mancia per tavolo è quella del locale — mance totali diviso
  // tavoli totali — non la media delle otto medie: chi ha servito più tavoli
  // deve pesare di più.
  const mediaPerTavolo = totTip / totTavoli;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI in testa, come nelle altre sezioni di Operazioni: stessa card
          tinta, stessa griglia da quattro, quindi la variante compatta —
          etichette corte perché stiano accanto alla pillola a 1280, la forma
          per esteso nel sottotitolo che ha la riga intera. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        <StatKpiTinto compatto tono="blu" icona="people-staff-group" label="Membri"
          valore={STAFF.length}
          sub={`${nCamerieri} camerieri e ${nMaitre} maître`}/>
        <StatKpiTinto compatto tono="rosa" glifo="€" label="Scontrino"
          valore={euro(teamAvg)}
          delta={6.4} sub="Scontrino medio del team" trend={STAFF_TREND.scontrino}/>
        <StatKpiTinto compatto tono="giallo" icona="commerce-cart" label="Ordini"
          valore={totOrdini.toLocaleString('it-IT', {useGrouping: true})}
          delta={9.2} sub="Ordini gestiti nel periodo" trend={STAFF_TREND.ordini}/>
        <StatKpiTinto compatto tono="verde" icona="commerce-coins" label="Mance"
          valore={`€ ${totTip.toLocaleString('it-IT', {useGrouping: true})}`}
          delta={STAFF_MANCE_DELTA} sub="Raccolte da tutto il team" trend={STAFF_TREND.mance}/>
      </div>

      <StatCard title="Team" sub={`Tutti e ${STAFF.length} i membri attivi nel periodo, dal più alto`}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
          <StaffPannello metrica={STAFF_METRICHE[0]} media={teamAvg}/>
          <StaffPannello metrica={STAFF_METRICHE[1]} media={mediaPerTavolo}/>
        </div>
      </StatCard>
    </div>
  );
}

window.StatStaff = StatStaff;

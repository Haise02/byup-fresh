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

const STAFF_SPOT = {
  background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
  borderRadius: 14, padding: 18,
  display:'flex', flexDirection:'column', minWidth: 0,
};

// ─── Piede della card ──────────────────────────────────────────
// Riga sottile e numeri piccoli: i totali di contorno stanno lì, sotto la
// classifica, senza rubarle il posto.
function StaffPiede({ voci }) {
  return (
    <div style={{
      marginTop:'auto', paddingTop: 13,
      borderTop:`1px solid ${PN.BORDER_SOFT}`,
      display:'grid', gridTemplateColumns:`repeat(${voci.length}, 1fr)`, gap: 10,
    }}>
      {voci.map(m => (
        <div key={m.et} style={{minWidth: 0}}>
          <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums', lineHeight: 1.2}}>{m.v}</div>
          <div style={{fontSize: 13, color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.et}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Spotlight · mancia per tavolo ─────────────────────────────
// Le mance in assoluto premiano chi ha fatto più turni. Diviso i tavoli
// serviti la domanda cambia: quanto lascia in media un tavolo passato per le
// sue mani. Elena ne serve meno di tutti — 95 contro i 142 di Marco — ed è la
// prima lo stesso, e questo dalla colonna delle mance non si vedeva.
// Il trattino verticale sulle barre è la media del team: cade nello stesso
// punto su ogni riga, quindi chi la supera e chi no si legge senza contare.
// Una card sola, a tutta riga: la classifica per mance assolute che stava qui
// accanto dava esattamente questi cinque nomi in quest'ordine — Elena, Chiara,
// Sofia, Giulia, Luca — quindi era la stessa cosa detta due volte. Le mance in
// valore restano, in grigio, accanto ai tavoli da cui vengono.
function StaffPerTavolo({ mediaTeam, totTavoli, mediaTesta }) {
  const classifica = [...STAFF]
    .map(s => ({ ...s, perTavolo: s.tip / s.tavoli }))
    .sort((a, b) => b.perTavolo - a.perTavolo)
    .slice(0, 5);
  const scala = classifica[0].perTavolo || 1;
  const tacca = Math.min(100, (mediaTeam / scala) * 100);

  return (
    <div style={{...STAFF_SPOT, gap: 14}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 12}}>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Mancia per tavolo</div>
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>Quanto lascia in media un tavolo servito · primi cinque</div>
        </div>
        <span style={{display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0, fontSize: 13.5, color: PN.MUTED}}>
          <span style={{width: 2, height: 12, background:'rgba(15,17,21,0.42)', borderRadius: 1}}/> media del team
        </span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 11}}>
        {classifica.map(s => (
          <div key={s.nome} style={{display:'flex', alignItems:'center', gap: 10, minWidth: 0}}>
            <span style={{
              width: 26, height: 26, borderRadius:'50%', flexShrink: 0,
              background: s.avatarBg, color:'#fff',
              display:'grid', placeItems:'center',
              fontSize: 11.5, fontWeight: 700,
            }}>{s.avatar}</span>
            <span style={{
              width: 132, flexShrink: 0, fontSize: 14.5, color: PN.TEXT,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{s.nome}</span>
            {/* La divisione scritta per esteso: sono i due numeri da cui esce
                la cifra in fondo alla riga, e senza si dovrebbe andare a
                cercarli nella tabella. */}
            <span style={{
              width: 132, flexShrink: 0, fontSize: 13, color: PN.MUTED_SOFT,
              fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap',
            }}>€ {s.tip} su {s.tavoli} tavoli</span>
            <span style={{position:'relative', flex: 1, height: 8, borderRadius: 999, background: PN.WHITE_FROST, minWidth: 24}}>
              <span style={{
                display:'block', height:'100%',
                width: `${(s.perTavolo / scala) * 100}%`,
                background: PN.PINK, borderRadius: 999,
                transition:'width 400ms ease-out',
              }}/>
              <span style={{
                position:'absolute', top: -1, bottom: -1, left: `${tacca}%`,
                width: 2, marginLeft: -1, borderRadius: 1,
                background:'rgba(15,17,21,0.42)',
              }}/>
            </span>
            <strong style={{
              width: 58, flexShrink: 0, textAlign:'right',
              fontSize: 15, fontWeight: 700, color: PN.TEXT,
              fontVariantNumeric:'tabular-nums',
            }}>€ {s.perTavolo.toFixed(2).replace('.', ',')}</strong>
          </div>
        ))}
      </div>

      <StaffPiede voci={[
        { v: `€ ${mediaTeam.toFixed(2).replace('.', ',')}`, et: 'la media del team' },
        { v: totTavoli.toLocaleString('it-IT', {useGrouping: true}), et: 'tavoli serviti' },
        { v: `€ ${mediaTesta}`, et: 'di mance a testa' },
      ]}/>
    </div>
  );
}

function StatStaff() {
  const [sortBy, setSortBy] = React.useState('scontrino');
  const [order, setOrder] = React.useState('desc');
  const [search, setSearch] = React.useState('');

  const sorted = [...STAFF]
    .filter(s => s.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * dir;
    });

  const teamAvg = (STAFF.reduce((s, x) => s + x.scontrino, 0) / STAFF.length);
  const totOrdini = STAFF.reduce((s, x) => s + x.ordini, 0);
  const totTip = STAFF.reduce((s, x) => s + x.tip, 0);
  const totTavoli = STAFF.reduce((s, x) => s + x.tavoli, 0);
  const top = [...STAFF].sort((a, b) => b.scontrino - a.scontrino)[0];
  const maxOrdini = Math.max(...STAFF.map(x => x.ordini));
  // Composizione ricavata dai ruoli, non scritta a mano: così non può
  // contraddire l'elenco che sta due riquadri più sotto.
  const nMaitre = STAFF.filter(s => s.ruolo === 'Maître').length;
  const nCamerieri = STAFF.length - nMaitre;
  const mediaTip = Math.round(totTip / STAFF.length);

  const handleSort = (col) => {
    if (sortBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

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
          valore={`€ ${teamAvg.toFixed(2).replace('.', ',')}`}
          delta={6.4} sub="Scontrino medio del team" trend={STAFF_TREND.scontrino}/>
        <StatKpiTinto compatto tono="giallo" icona="commerce-cart" label="Ordini"
          valore={totOrdini.toLocaleString('it-IT', {useGrouping: true})}
          delta={9.2} sub="Ordini gestiti nel periodo" trend={STAFF_TREND.ordini}/>
        <StatKpiTinto compatto tono="verde" icona="commerce-coins" label="Mance"
          valore={`€ ${totTip.toLocaleString('it-IT', {useGrouping: true})}`}
          delta={STAFF_MANCE_DELTA} sub="Raccolte da tutto il team" trend={STAFF_TREND.mance}/>
      </div>

      <StaffPerTavolo mediaTeam={totTip / totTavoli} totTavoli={totTavoli} mediaTesta={mediaTip}/>

      <StatCard title="Rendimento personale" sub="Vendite ed efficacia dei membri del tuo team" action={
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          padding:'7px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, background: PN.WHITE,
        }}>
          <BuIcons.search size={13} color={PN.MUTED}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca membro…" style={{border:'none', outline:'none', fontSize: 14.5, fontFamily:'inherit', width: 160}}/>
        </div>
      }>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr 1fr 1fr',
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span>Nome</span>
            <SortHead col="scontrino" cur={sortBy} order={order} onSort={handleSort}>Scontrino medio</SortHead>
            <span>vs Team</span>
            <SortHead col="ordini" cur={sortBy} order={order} onSort={handleSort}>Ordini gestiti</SortHead>
            <SortHead col="tavoli" cur={sortBy} order={order} onSort={handleSort}>Tavoli</SortHead>
            <SortHead col="tip" cur={sortBy} order={order} onSort={handleSort}>Mance</SortHead>
          </div>
          {sorted.map((s, i) => {
            const vsPct = ((s.scontrino - teamAvg) / teamAvg * 100);
            const isTop = s.nome === top.nome;
            return (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr 1fr 1fr',
                padding:'10px 16px', alignItems:'center',
                fontSize: 15, color: PN.TEXT,
                borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                background: isTop ? '#FFFCF0' : (i % 2 === 1 ? '#FAFAFB' : PN.WHITE),
              }}>
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                  <div style={{
                    width: 32, height: 32, borderRadius:'50%',
                    background: s.avatarBg, color:'#fff',
                    display:'grid', placeItems:'center',
                    fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>{s.avatar}</div>
                  <div style={{minWidth: 0}}>
                    {/* Niente bollino accanto al nome: a segnare lo scontrino
                        più alto basta il fondo caldo della riga, senza anche
                        scriverlo. */}
                    <div style={{fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.nome}</div>
                    <div style={{fontSize: 14, color: PN.MUTED}}>{s.ruolo}</div>
                  </div>
                </div>
                <span style={{fontVariantNumeric:'tabular-nums', fontWeight: 600}}>€ {s.scontrino.toFixed(2).replace('.', ',')}</span>
                <span>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 4,
                    padding:'3px 9px', borderRadius: 999,
                    background: vsPct >= 0 ? PN.GREEN_SOFT : PN.RED_SOFT,
                    color: vsPct >= 0 ? PN.GREEN : PN.RED,
                    fontSize: 14, fontWeight: 700,
                  }}>
                    {vsPct >= 0 ? '↑' : '↓'} {Math.abs(vsPct).toFixed(1)}%
                  </span>
                </span>
                <div>
                  <div style={{fontVariantNumeric:'tabular-nums', fontWeight: 600}}>{s.ordini.toLocaleString('it-IT', {useGrouping: true})}</div>
                  <div style={{height: 4, background: PN.BORDER_SOFT, borderRadius: 999, marginTop: 4, overflow:'hidden'}}>
                    <div style={{height:'100%', width: `${(s.ordini / maxOrdini) * 100}%`, background: PN.PINK, borderRadius: 999}}/>
                  </div>
                </div>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{s.tavoli}</span>
                <span style={{fontVariantNumeric:'tabular-nums', fontWeight: 600, color: PN.GREEN}}>€ {s.tip}</span>
              </div>
            );
          })}
        </div>
      </StatCard>
    </div>
  );
}

function SortHead({ col, cur, order, onSort, children }) {
  const active = col === cur;
  return (
    <button onClick={() => onSort(col)} style={{
      background:'transparent', border:'none', padding: 0,
      fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
      textTransform:'uppercase', letterSpacing: 0.5,
      textAlign:'left', cursor:'pointer', fontFamily:'inherit',
      display:'inline-flex', alignItems:'center', gap: 5,
      opacity: active ? 1 : 0.85,
    }}>
      {children}
      <span style={{fontSize: 12, opacity: active ? 1 : 0.4}}>{active ? (order === 'asc' ? '↑' : '↓') : '↕'}</span>
    </button>
  );
}

window.StatStaff = StatStaff;

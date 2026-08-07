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

// ─── Pillola d'intestazione degli spotlight ────────────────────
// Stessa forma del bollino «Top» che compare nella tabella qui sotto: quando
// l'occhio scende dalla card alla riga riconosce lo stesso segno.
function StaffBadge({ icona, testo, colore, sfondo }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 5,
      padding:'3px 9px', borderRadius: 999,
      background: sfondo, color: colore,
      fontSize: 11.5, fontWeight: 800, letterSpacing: 0.5, textTransform:'uppercase',
    }}>{icona} {testo}</span>
  );
}

const STAFF_SPOT = {
  background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
  borderRadius: 14, padding: 18,
  display:'flex', flexDirection:'column', minWidth: 0,
};

// ─── Spotlight · il migliore del periodo ───────────────────────
// Prima era una frase: «21,0% sopra la media team». Il confronto lo faceva
// leggere, non vedere. Qui le due misure stanno sulla stessa scala, una sotto
// l'altra — la sua a colore, quella del team in grigio — e il divario è la
// differenza di lunghezza fra due barre. La percentuale resta, ma come
// didascalia di una cosa già vista.
function StaffTop({ top, teamAvg }) {
  const pct = ((top.scontrino - teamAvg) / teamAvg) * 100;
  const scala = top.scontrino || 1;
  const righe = [
    { et: top.nome.split(' ')[0], v: top.scontrino, colore: PN.PINK, forte: true },
    { et: 'Media team', v: teamAvg, colore: PN.MUTED_LIGHT, forte: false },
  ];
  const micro = [
    { v: top.ordini.toLocaleString('it-IT', {useGrouping: true}), et: 'ordini gestiti' },
    { v: top.tavoli, et: 'tavoli serviti' },
    { v: `€ ${top.tip}`, et: 'di mance' },
  ];

  return (
    <div style={{...STAFF_SPOT, gap: 16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12}}>
        <StaffBadge icona={<BuIcons.trophy size={11}/>} testo="Top performer" colore={PN.AMBER} sfondo={PN.AMBER_SOFT}/>
        <span style={{fontSize: 13.5, color: PN.MUTED_SOFT}}>nel periodo</span>
      </div>

      <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
        <span style={{
          width: 48, height: 48, borderRadius:'50%', flexShrink: 0,
          background: top.avatarBg, color:'#fff',
          display:'grid', placeItems:'center',
          fontSize: 17.5, fontWeight: 700,
          boxShadow:'0 1px 3px rgba(15,17,21,0.12)',
        }}>{top.avatar}</span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 19, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{top.nome}</div>
          <div style={{fontSize: 14, color: PN.MUTED}}>{top.ruolo}</div>
        </div>
        <div style={{textAlign:'right', flexShrink: 0}}>
          <div style={{
            fontSize: 30, fontWeight: 700, color: PN.TEXT,
            letterSpacing: -0.6, lineHeight: 1, fontVariantNumeric:'tabular-nums',
          }}>€ {top.scontrino.toFixed(2).replace('.', ',')}</div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 4}}>scontrino medio</div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 9}}>
        {righe.map(r => (
          <div key={r.et} style={{display:'flex', alignItems:'center', gap: 10}}>
            <span style={{
              width: 78, flexShrink: 0, fontSize: 13.5,
              color: r.forte ? PN.TEXT : PN.MUTED,
              fontWeight: r.forte ? 600 : 500,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{r.et}</span>
            <span style={{flex: 1, height: 8, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden', minWidth: 0}}>
              <span style={{
                display:'block', height:'100%',
                width: `${(r.v / scala) * 100}%`,
                background: r.colore, borderRadius: 999,
                transition:'width 400ms ease-out',
              }}/>
            </span>
            <span style={{
              width: 62, flexShrink: 0, textAlign:'right',
              fontSize: 14, fontWeight: r.forte ? 700 : 600,
              color: r.forte ? PN.TEXT : PN.MUTED,
              fontVariantNumeric:'tabular-nums',
            }}>€ {r.v.toFixed(2).replace('.', ',')}</span>
          </div>
        ))}
        <div style={{display:'flex', alignItems:'center', gap: 7, marginTop: 1}}>
          <StatDelta value={pct}/>
          <span style={{fontSize: 14, color: PN.MUTED}}>sopra la media del team</span>
        </div>
      </div>

      <div style={{
        marginTop:'auto', paddingTop: 13,
        borderTop:`1px solid ${PN.BORDER_SOFT}`,
        display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10,
      }}>
        {micro.map(m => (
          <div key={m.et} style={{minWidth: 0}}>
            <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums', lineHeight: 1.2}}>{m.v}</div>
            <div style={{fontSize: 13, color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.et}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Spotlight · mance ─────────────────────────────────────────
// Il totale e la crescita stanno già nella card KPI qui sopra: ripeterli
// grandi sarebbe dire due volte la stessa cosa a due centimetri di distanza.
// Qui la domanda successiva — chi le raccoglie — con le prime tre sulla stessa
// scala; il totale resta, piccolo, solo per dare la misura alle barre.
function StaffMance({ tot, media }) {
  const podio = [...STAFF].sort((a, b) => b.tip - a.tip).slice(0, 3);
  const max = podio[0].tip || 1;

  return (
    <div style={{...STAFF_SPOT, gap: 14}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12}}>
        <StaffBadge icona={<Icon name="commerce-coins" size={12}/>} testo="Mance" colore={PN.GREEN} sfondo={PN.GREEN_SOFT}/>
        <StatDelta value={STAFF_MANCE_DELTA}/>
      </div>

      <div>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Chi le raccoglie</div>
        <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>Podio del periodo</div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 11}}>
        {podio.map(s => (
          <div key={s.nome} style={{display:'flex', alignItems:'center', gap: 9, minWidth: 0}}>
            <span style={{
              width: 24, height: 24, borderRadius:'50%', flexShrink: 0,
              background: s.avatarBg, color:'#fff',
              display:'grid', placeItems:'center',
              fontSize: 11, fontWeight: 700,
            }}>{s.avatar}</span>
            <span style={{
              width: 96, flexShrink: 0, fontSize: 14.5, color: PN.TEXT,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{s.nome}</span>
            <span style={{flex: 1, height: 6, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden', minWidth: 24}}>
              <span style={{
                display:'block', height:'100%',
                width: `${(s.tip / max) * 100}%`,
                background: PN.GREEN, borderRadius: 999,
                transition:'width 400ms ease-out',
              }}/>
            </span>
            <strong style={{
              flexShrink: 0, fontSize: 14.5, fontWeight: 700,
              color: PN.GREEN, fontVariantNumeric:'tabular-nums',
            }}>€ {s.tip}</strong>
          </div>
        ))}
      </div>

      {/* Stesso piede della card accanto — riga sottile e due numeri piccoli —
          così le due, che hanno contenuti diversi, chiudono allo stesso modo
          e il vuoto in fondo se lo prende lo spazio fra le due parti, non un
          buco in mezzo. */}
      <div style={{
        marginTop:'auto', paddingTop: 13,
        borderTop:`1px solid ${PN.BORDER_SOFT}`,
        display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 10,
      }}>
        {[
          { v: `€ ${tot.toLocaleString('it-IT', {useGrouping: true})}`, et: 'raccolte in tutto' },
          { v: `€ ${media}`, et: 'di media a testa' },
        ].map(m => (
          <div key={m.et} style={{minWidth: 0}}>
            <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums', lineHeight: 1.2}}>{m.v}</div>
            <div style={{fontSize: 13, color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.et}</div>
          </div>
        ))}
      </div>
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

      {/* I due riquadri narrativi di prima, rifatti: le stesse due cose —
          chi ha reso di più e come vanno le mance — ma mostrate invece che
          raccontate. Larghezze diverse perché il primo ha un confronto e tre
          numeri di rincalzo, il secondo una classifica corta. */}
      <div style={{display:'grid', gridTemplateColumns:'1.45fr 1fr', gap: 16, alignItems:'stretch'}}>
        <StaffTop top={top} teamAvg={teamAvg}/>
        <StaffMance tot={totTip} media={mediaTip}/>
      </div>

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
                    <div style={{fontWeight: 600, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap'}}>
                      <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{s.nome}</span>
                      {isTop && <span style={{
                        display:'inline-flex', alignItems:'center', gap:3,
                        padding:'1px 6px', borderRadius: 4,
                        background: PN.AMBER_SOFT, color: PN.AMBER,
                        fontSize: 11.5, fontWeight: 800, letterSpacing: 0.4, textTransform:'uppercase',
                        flexShrink: 0,
                      }}><BuIcons.trophy size={10}/> Top</span>}
                    </div>
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

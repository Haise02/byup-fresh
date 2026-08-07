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

// ─── Barra di una metrica, col segno della media ───────────────
// Il trattino verticale è la media del team: cade nello stesso punto su tutte
// le righe della colonna, quindi chi la supera e chi no si legge senza
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

// ─── Classifica · i primi cinque, su due misure ────────────────
// Due colonne invece di due card: per scontrino e per mancia-su-tavolo i primi
// cinque escono nello stesso ordine — Elena, Chiara, Sofia, Giulia, Luca — e
// affiancate le due classifiche sarebbero state la stessa fila di nomi due
// volte. Una riga per persona, un numero per colonna.
// La mancia divisa i tavoli è la misura che la colonna delle mance non dà:
// in assoluto premia chi ha fatto più turni, e infatti Elena serve meno tavoli
// di tutti — 95 contro i 142 di Marco — ed è comunque prima.
const STAFF_COLONNE = [
  { id:'scontrino', et:'Scontrino medio', colore: PN.PINK,  dec: 2 },
  { id:'perTavolo', et:'Mancia per tavolo', colore: PN.GREEN, dec: 2 },
];

function StaffClassifica({ medie }) {
  const classifica = [...STAFF]
    .map(s => ({ ...s, perTavolo: s.tip / s.tavoli }))
    .sort((a, b) => b.scontrino - a.scontrino)
    .slice(0, 5);
  const scale = {
    scontrino: classifica[0].scontrino || 1,
    perTavolo: Math.max(...classifica.map(s => s.perTavolo)) || 1,
  };
  // Avatar, nome, poi per ogni misura la barra e il suo numero. Griglia e non
  // flex perché le intestazioni delle colonne devono cadere esattamente sopra
  // le barre a cui si riferiscono.
  const griglia = {
    display:'grid',
    gridTemplateColumns:'26px minmax(96px, 168px) minmax(60px, 1fr) 64px minmax(60px, 1fr) 64px',
    alignItems:'center', gap: 10,
  };

  return (
    <div style={{...STAFF_SPOT, gap: 12}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 12}}>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Chi rende di più</div>
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>I primi cinque del periodo, per scontrino medio</div>
        </div>
        <span style={{display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0, fontSize: 13.5, color: PN.MUTED}}>
          <span style={{width: 2, height: 12, background:'rgba(15,17,21,0.42)', borderRadius: 1}}/> media del team
        </span>
      </div>

      <div style={{...griglia, marginTop: 2}}>
        <span/><span/>
        {STAFF_COLONNE.map(c => (
          <span key={c.id} style={{
            gridColumn:'span 2',
            fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
          }}>{c.et}</span>
        ))}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 11}}>
        {classifica.map(s => (
          <div key={s.nome} style={griglia}>
            <span style={{
              width: 26, height: 26, borderRadius:'50%',
              background: s.avatarBg, color:'#fff',
              display:'grid', placeItems:'center',
              fontSize: 11.5, fontWeight: 700,
            }}>{s.avatar}</span>
            <span style={{
              minWidth: 0, fontSize: 14.5, color: PN.TEXT,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{s.nome}</span>
            {STAFF_COLONNE.map(c => (
              <React.Fragment key={c.id}>
                <StaffBarra valore={s[c.id]} scala={scale[c.id]} media={medie[c.id]} colore={c.colore}/>
                <strong style={{
                  textAlign:'right', fontSize: 15, fontWeight: 700, color: PN.TEXT,
                  fontVariantNumeric:'tabular-nums',
                }}>€ {s[c.id].toFixed(c.dec).replace('.', ',')}</strong>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      <StaffPiede voci={[
        { v: `€ ${medie.scontrino.toFixed(2).replace('.', ',')}`, et: 'scontrino medio del team' },
        { v: `€ ${medie.perTavolo.toFixed(2).replace('.', ',')}`, et: 'di mancia per tavolo' },
      ]}/>
    </div>
  );
}

function StatStaff() {
  const [sortBy, setSortBy] = React.useState('scontrino');
  const [order, setOrder] = React.useState('desc');
  const [search, setSearch] = React.useState('');

  // La mancia per tavolo si calcola qui e diventa un campo come gli altri,
  // così l'ordinamento generico la tratta senza sapere che è una divisione.
  const sorted = STAFF
    .map(s => ({ ...s, perTavolo: s.tip / s.tavoli }))
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

      <StaffClassifica medie={{ scontrino: teamAvg, perTavolo: totTip / totTavoli }}/>

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
            display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr 0.8fr 1fr 1fr',
            padding:'10px 16px', background:'#FAFAFB', columnGap: 8,
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
            {/* La colonna che la card in alto mostra solo per i primi cinque:
                qui c'è per tutti e otto, e ordinabile. */}
            <SortHead col="perTavolo" cur={sortBy} order={order} onSort={handleSort}>Per tavolo</SortHead>
          </div>
          {sorted.map((s, i) => {
            const vsPct = ((s.scontrino - teamAvg) / teamAvg * 100);
            const isTop = s.nome === top.nome;
            return (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr 0.8fr 1fr 1fr',
                padding:'10px 16px', alignItems:'center', columnGap: 8,
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
                <span style={{fontVariantNumeric:'tabular-nums', fontWeight: 600}}>€ {s.perTavolo.toFixed(2).replace('.', ',')}</span>
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

// Widget catalog — definitions + add drawer

// Regola defaults: max 2 in una direzione (w O h, mai entrambi). Eccezione:
// `azioni` è il launcher full-row e ha fixedSize:true (non resizable, sempre 4×2).
//
// theme (per shell):
//   undefined → W1 white classic (default, ~75% dei widget)
//   'aurora'  → L2 aurora glass pink (warm celebrativo)
//   sunset    → applicato dal widget internamente con GlassDarkBox (Top piatti,
//                Cucina live) → non serve sullo shell
const PN_WIDGET_CATALOG = [
  { id: 'financials', name: 'Andamento incassi', desc: 'Incassi + scontrino medio + coperti, switch automatico', component: 'WidgetFinancials', defaultSize: { w: 2, h: 1 }, category: 'Incassi', icon: 'chart-area' },
  { id: 'incassi', name: 'Solo incassi', desc: 'Oggi/Settimana/Mese con sparkline', component: 'WidgetIncassi', defaultSize: { w: 2, h: 1 }, category: 'Incassi', icon: 'commerce-money' },
  { id: 'kpi-vendita', name: 'KPI di vendita', desc: 'Scontrino medio e coperti per periodo', component: 'WidgetKpiVendita', defaultSize: { w: 1, h: 2 }, category: 'Statistiche', icon: 'chart-bar' },
  { id: 'riempimento', name: 'Riempimento', desc: 'Tasso di occupazione + fasce orarie', component: 'WidgetRiempimento', defaultSize: { w: 2, h: 1 }, category: 'Statistiche', icon: 'chart-doughnut' },
  { id: 'prenotazioni-oggi', name: 'Prenotazioni oggi', desc: 'Lista live coperti del giorno', component: 'WidgetPrenotazioniOggi', defaultSize: { w: 1, h: 2 }, category: 'Sala', icon: 'time-calendar' },
  { id: 'tavoli-stato', name: 'Stato tavoli', desc: 'Mappa visiva sala in tempo reale', component: 'WidgetTavoliStato', defaultSize: { w: 1, h: 2 }, category: 'Sala', icon: 'place-table' },
  { id: 'top-piatti', name: 'Top piatti', desc: 'Classifica settimanale per ricavo', component: 'WidgetTopPiatti', defaultSize: { w: 1, h: 2 }, category: 'Menu', icon: 'food-meal' },
  { id: 'recensioni', name: 'Recensioni recenti', desc: 'Ultime recensioni e media stelle', component: 'WidgetRecensioni', defaultSize: { w: 1, h: 2 }, category: 'Reputazione', theme: 'aurora', icon: 'star' },
  { id: 'azioni', name: 'Azioni rapide', desc: '8 shortcut launcher (full row, ridimensionabile)', component: 'WidgetAzioni', defaultSize: { w: 4, h: 2 }, category: 'Utilità', icon: 'sparkles' },
  { id: 'coperti-sett', name: 'Coperti settimana', desc: 'Bar chart 7 giorni', component: 'WidgetCopertiSettimana', defaultSize: { w: 2, h: 1 }, category: 'Statistiche', icon: 'people-staff-group' },
  { id: 'cucina-live', name: 'Cucina live', desc: 'Ordini in cottura e pronti', component: 'WidgetCucinaLive', defaultSize: { w: 1, h: 2 }, category: 'Cucina', icon: 'food-flame' },
];

function PnAddWidgetDrawer({ open, onClose, currentIds, onAdd }) {
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('Tutti');

  const cats = ['Tutti', ...new Set(PN_WIDGET_CATALOG.map(w => w.category))];

  const filtered = PN_WIDGET_CATALOG.filter(w => {
    if (cat !== 'Tutti' && w.category !== cat) return false;
    if (query && !w.name.toLowerCase().includes(query.toLowerCase()) && !w.desc.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* scrim */}
      <div onClick={onClose} style={{
        position:'absolute', inset: 0, background:'rgba(15,17,21,0.30)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.2s', zIndex: 50,
      }}/>
      {/* drawer */}
      <div style={{
        position:'absolute', top: 0, right: 0, bottom: 0,
        width: 420, background: PN.WHITE,
        boxShadow: '-12px 0 32px rgba(15,17,21,0.10)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(.4,.0,.2,1)',
        zIndex: 60,
        display:'flex', flexDirection:'column',
      }}>
        <div style={{padding:'20px 22px 14px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 4}}>
            <h2 style={{margin:0, fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>Aggiungi widget</h2>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 8,
              border:'none', background:'#F4F5F7', color: PN.TEXT,
              cursor:'pointer', display:'grid', placeItems:'center',
            }}><Icon name="xmark" size={14}/></button>
          </div>
          <div style={{fontSize: 15, color: PN.MUTED, marginBottom: 14}}>
            Trascina un widget sulla griglia o clicca per aggiungerlo
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap: 8,
            padding:'8px 12px', background:'#F4F5F7', borderRadius: 9,
          }}>
            <Icon name="magnifying-glass" size={14} color={PN.MUTED}/>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Cerca widget…"
              style={{flex:1, border:'none', background:'transparent', outline:'none', fontFamily:'inherit', fontSize:15}}
            />
          </div>
          <div style={{display:'flex', gap: 6, marginTop: 12, flexWrap:'wrap'}}>
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:'5px 10px', borderRadius: 99,
                border:`1px solid ${cat === c ? PN.TEXT : PN.BORDER}`,
                background: cat === c ? PN.TEXT : PN.WHITE,
                color: cat === c ? PN.WHITE : PN.TEXT,
                fontSize: 13.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding: '14px 22px 22px'}}>
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            {filtered.map(w => {
              const inUse = currentIds.includes(w.id);
              return (
                <div key={w.id} style={{
                  display:'flex', alignItems:'center', gap: 12,
                  padding: 12,
                  border:`1px solid ${PN.BORDER}`,
                  borderRadius: 10,
                  background: inUse ? '#FAFAFB' : PN.WHITE,
                  opacity: inUse ? 0.6 : 1,
                }}>
                  {/* Icona del widget — neutra, niente ingombro dimensioni:
                      la misura si scopre (e si cambia) direttamente in griglia */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: '#F4F5F7', color: PN.TEXT,
                    display:'grid', placeItems:'center',
                  }}>
                    <Icon name={w.icon || 'grid'} size={22}/>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize: 15.5, fontWeight: 600, color: PN.TEXT, marginBottom: 2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{w.name}</div>
                    <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.4}}>{w.desc}</div>
                  </div>
                  <button
                    disabled={inUse}
                    onClick={() => onAdd(w.id)}
                    style={{
                      padding:'7px 12px',
                      background: inUse ? '#F4F5F7' : PN.TEXT,
                      color: inUse ? PN.MUTED : PN.WHITE,
                      border:'none', borderRadius: 8,
                      fontWeight: 600, fontSize: 14, fontFamily:'inherit',
                      cursor: inUse ? 'default' : 'pointer',
                      whiteSpace:'nowrap', flexShrink: 0, alignSelf:'center',
                    }}>
                    {inUse ? 'Già presente' : 'Aggiungi'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

window.PN_WIDGET_CATALOG = PN_WIDGET_CATALOG;
window.PnAddWidgetDrawer = PnAddWidgetDrawer;

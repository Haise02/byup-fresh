// Step 4: Orari + Sale e tavoli multi-sala — final venue config and publish

function Step4GoLive({ onBack, onComplete }) {
  // Orari
  const [hours, setHours] = React.useState({
    lun: { open: true, slots: [['12:00','15:00'],['19:00','23:00']] },
    mar: { open: true, slots: [['12:00','15:00'],['19:00','23:00']] },
    mer: { open: true, slots: [['12:00','15:00'],['19:00','23:00']] },
    gio: { open: true, slots: [['12:00','15:00'],['19:00','23:00']] },
    ven: { open: true, slots: [['12:00','15:00'],['19:00','24:00']] },
    sab: { open: true, slots: [['12:00','15:00'],['19:00','24:00']] },
    dom: { open: false, slots: [] },
  });
  const dayLabels = { lun:'Lun', mar:'Mar', mer:'Mer', gio:'Gio', ven:'Ven', sab:'Sab', dom:'Dom' };

  // Sale e tavoli multi-sala
  const [rooms, setRooms] = React.useState([
    { id: 'r1', name: 'Sala principale', tables: 12, default: true },
  ]);

  const totalTables = rooms.reduce((sum, r) => sum + r.tables, 0);

  const addRoom = () => {
    setRooms(rs => [...rs, { id: `r${Date.now()}`, name: 'Nuova sala', tables: 6, default: false }]);
  };
  const removeRoom = (id) => {
    setRooms(rs => rs.filter(r => r.id !== id));
  };
  const updateRoom = (id, key, val) => {
    setRooms(rs => rs.map(r => r.id === id ? {...r, [key]: val} : r));
  };

  return (
    <div style={{padding:'40px 48px 64px', background:ONB.BG_SOFT, minHeight:760}}>
      <div style={{maxWidth:1080, margin:'0 auto'}}>

        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7,
            background:ONB.GREEN_SOFT, color:ONB.GREEN,
            padding:'6px 12px', borderRadius:999,
            fontSize:11.5, fontWeight:700, marginBottom:14, letterSpacing:0.3,
          }}>
            STEP 4 · ULTIMO PASSO
          </div>
          <h1 style={{fontSize:36, fontWeight:800, margin:'0 0 8px', letterSpacing:-0.8}}>
            Orari e tavoli.
          </h1>
          <p style={{fontSize:15, color:ONB.MUTED, margin:0}}>
            Indica i giorni e gli orari di apertura e il numero di sale del tuo locale.
          </p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
          {/* Main column */}
          <div style={{display:'flex', flexDirection:'column', gap:16}}>

            {/* Hours */}
            <Card4>
              <CardHeader4 num="1" title="Orari di apertura" sub="Quando è aperto"/>
              <div style={{padding:'14px 20px 18px'}}>
                {/* Mini-calendario settimanale visuale */}
                <div style={{
                  display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:7,
                  marginBottom:14,
                }}>
                  {Object.entries(hours).map(([day, info]) => {
                    const open = info.open;
                    const summary = open && info.slots.length
                      ? (info.slots.length === 1
                          ? `${info.slots[0][0]}–${info.slots[0][1]}`
                          : `${info.slots.length} turni`)
                      : 'Chiuso';
                    return (
                      <button key={day} onClick={() => setHours(h => ({
                        ...h,
                        [day]: {
                          ...h[day],
                          open: !open,
                          slots: !open ? (h[day].slots.length ? h[day].slots : [['12:00','15:00'],['19:00','23:00']]) : [],
                        },
                      }))} style={{
                        padding:'10px 4px', borderRadius:9,
                        border:`1.5px solid ${open ? ONB.PINK : ONB.BORDER_SOFT}`,
                        background: open ? ONB.PINK_SOFT : '#fff',
                        cursor:'pointer', fontFamily:'inherit',
                      }}>
                        <div style={{fontSize:11, fontWeight:700, color: open ? ONB.PINK_DARK : ONB.MUTED, marginBottom:4}}>{dayLabels[day]}</div>
                        <div style={{fontSize:10.5, color: open ? ONB.TEXT : ONB.MUTED, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>
                          {summary}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dettaglio orari per giorno */}
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  {Object.entries(hours).filter(([,info]) => info.open).map(([day, info]) => (
                    <div key={day} style={{
                      display:'grid', gridTemplateColumns:'56px 1fr',
                      alignItems:'center', gap:12,
                      padding:'8px 12px',
                      border:`1px solid ${ONB.BORDER_SOFT}`, borderRadius:9,
                    }}>
                      <span style={{fontSize:12.5, fontWeight:700}}>{dayLabels[day]}</span>
                      <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                        {info.slots.map((s,i)=>(
                          <div key={i} style={{
                            display:'inline-flex', alignItems:'center', gap:6,
                            background:'#fff', border:`1px solid ${ONB.BORDER}`,
                            padding:'5px 10px', borderRadius:7,
                            fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums',
                          }}>
                            {s[0]} – {s[1]}
                          </div>
                        ))}
                        <button style={{
                          background:'transparent', border:'none',
                          color: ONB.PINK, fontSize:11.5, fontWeight:600,
                          cursor:'pointer', fontFamily:'inherit', padding:'5px 4px',
                        }}>+ Aggiungi turno</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card4>

            {/* Sale e tavoli multi-sala */}
            <Card4>
              <CardHeader4 num="2" title="Sale e tavoli" sub="Aggiungi le sale del tuo locale — generiamo automaticamente un QR per ogni tavolo."/>
              <div style={{padding:'8px 20px 18px', display:'flex', flexDirection:'column', gap:10}}>
                {rooms.map((r, idx) => (
                  <div key={r.id} style={{
                    display:'grid', gridTemplateColumns:'1fr 200px auto',
                    gap:14, alignItems:'center',
                    padding:'14px 16px',
                    background: r.default ? ONB.PINK_SOFT : ONB.BG,
                    borderRadius:10,
                    border: r.default ? `1px solid ${ONB.PINK}` : `1px solid ${ONB.BORDER_SOFT}`,
                  }}>
                    <div>
                      <label style={{
                        fontSize:10.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
                        textTransform:'uppercase', marginBottom:4, display:'block',
                      }}>
                        Sala {idx + 1}
                        {r.default && <span style={{
                          marginLeft:8, background: ONB.PINK_DARK, color:'#fff',
                          padding:'1px 7px', borderRadius:4, fontSize:9, letterSpacing:0.4,
                        }}>PRINCIPALE</span>}
                      </label>
                      <input
                        value={r.name}
                        onChange={e => updateRoom(r.id, 'name', e.target.value)}
                        style={{
                          width:'100%', padding:'8px 12px', border:`1px solid ${ONB.BORDER}`,
                          borderRadius:7, fontSize:14, fontFamily:'inherit', outline:'none',
                          fontWeight:600, background:'#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        fontSize:10.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
                        textTransform:'uppercase', marginBottom:4, display:'block',
                      }}>Tavoli</label>
                      <div style={{display:'flex', alignItems:'center', gap:8, background:'#fff', borderRadius:7, border:`1px solid ${ONB.BORDER}`, padding:'4px 6px'}}>
                        <button onClick={()=>updateRoom(r.id, 'tables', Math.max(1, r.tables - 1))} style={miniStepBtn}>−</button>
                        <input
                          type="number"
                          value={r.tables}
                          onChange={e => updateRoom(r.id, 'tables', Math.max(1, parseInt(e.target.value)||1))}
                          style={{
                            flex:1, border:'none', outline:'none', textAlign:'center',
                            fontSize:16, fontWeight:800, fontVariantNumeric:'tabular-nums',
                            fontFamily:'inherit', minWidth:30, padding:'4px 0',
                          }}
                        />
                        <button onClick={()=>updateRoom(r.id, 'tables', r.tables + 1)} style={miniStepBtn}>+</button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeRoom(r.id)}
                      disabled={r.default}
                      style={{
                        background:'transparent', border:'none', cursor: r.default ? 'not-allowed' : 'pointer',
                        opacity: r.default ? 0.3 : 0.7, padding:8, fontFamily:'inherit',
                        color: ONB.MUTED, fontSize:13,
                      }}
                      title={r.default ? 'La sala principale non può essere rimossa' : 'Rimuovi sala'}
                    >
                      🗑
                    </button>
                  </div>
                ))}

                <button onClick={addRoom} style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'12px', border:`1.5px dashed ${ONB.BORDER}`,
                  background:'transparent', borderRadius:10, cursor:'pointer',
                  fontSize:13, fontWeight:700, color: ONB.PINK_DARK, fontFamily:'inherit',
                }}>
                  <OnbIcon.Plus size={13} color={ONB.PINK_DARK}/> Aggiungi sala (es. Terrazza, Privé, Esterno)
                </button>

                <div style={{
                  marginTop:6, padding:'10px 14px', background:ONB.BG,
                  borderRadius:8, fontSize:12, color:ONB.MUTED,
                  display:'flex', alignItems:'center', gap:8,
                }}>
                  <OnbIcon.Sparkle size={13} color={ONB.PINK}/>
                  Genereremo <strong style={{color:ONB.TEXT}}>{totalTables} QR univoci</strong> che puoi stampare e applicare sui tuoi tavoli.
                </div>
              </div>
            </Card4>

          </div>

          {/* Sidebar — summary */}
          <aside style={{position:'sticky', top:20, alignSelf:'start'}}>
            <div style={{
              background:'linear-gradient(135deg, #fff 0%, #FFF5F8 100%)',
              border:`1px solid ${ONB.PINK_SOFT}`, borderRadius:16, padding:24,
              boxShadow:'0 4px 20px rgba(233,30,99,0.06)',
            }}>
              <div style={{
                fontSize:11, fontWeight:700, color:ONB.PINK, letterSpacing:0.6,
                marginBottom:14, textTransform:'uppercase',
              }}>Tutto pronto</div>
              <h3 style={{fontSize:22, fontWeight:800, margin:'0 0 18px', letterSpacing:-0.4}}>
                Abbiamo inserito correttamente:
              </h3>
              <Stat4 label="Menù" value="1" detail="Menù principale"/>
              <Stat4 label="Piatti" value="15" detail="in 5 categorie"/>
              <Stat4 label="Sale" value={rooms.length} detail={rooms.map(r=>r.name).join(' · ')}/>
              <Stat4 label="Tavoli con QR" value={totalTables} detail="totali su tutte le sale"/>
              <Stat4 label="Pagamenti" value="✓ Stripe" detail="connesso" green/>
              <Stat4 label="Fatturazione" value="✓ OpenAPI" detail="connesso" green/>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          marginTop:32, paddingTop:24, borderTop:`1px solid ${ONB.BORDER_SOFT}`,
        }}>
          <button onClick={onBack} style={{
            background:'transparent', border:`1px solid ${ONB.BORDER}`, color:ONB.TEXT,
            padding:'12px 22px', borderRadius:10, fontSize:14, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit',
          }}>← Indietro</button>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <button onClick={() => onComplete && onComplete('panoramica')} style={{
              background:'#fff', border:`1px solid ${ONB.BORDER}`, color:ONB.TEXT,
              padding:'13px 22px', borderRadius:11, fontSize:13.5, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit',
            }}>Salva e completa dopo</button>
            <button onClick={() => onComplete && onComplete('config')} style={{
              background:ONB.PINK, color:'#fff', border:'none',
              padding:'14px 28px', borderRadius:12, fontSize:15, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit',
              boxShadow:'0 4px 14px rgba(233,30,99,0.3)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              Vai alla configurazione completa <OnbIcon.ChevronRight size={14} color="#fff"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const miniStepBtn = {
  width:24, height:24, borderRadius:6,
  background: ONB.BG, border:'none',
  fontSize:14, fontWeight:800, cursor:'pointer',
  fontFamily:'inherit', color:ONB.TEXT,
  display:'flex', alignItems:'center', justifyContent:'center',
};

function Card4({children}){
  return <div style={{
    background:'#fff', border:`1px solid ${ONB.BORDER_SOFT}`,
    borderRadius:14, overflow:'hidden',
  }}>{children}</div>;
}

function CardHeader4({num, title, sub}){
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'18px 20px', borderBottom:`1px solid ${ONB.BORDER_SOFT}`,
    }}>
      <div style={{
        width:28, height:28, borderRadius:'50%',
        background:ONB.ACCENT_WARM, color:ONB.ACCENT_WARM_TEXT,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:800, flexShrink:0,
        border:`1px solid ${ONB.BORDER_SOFT}`,
      }}>{num}</div>
      <div>
        <div style={{fontSize:15, fontWeight:700}}>{title}</div>
        <div style={{fontSize:12.5, color:ONB.MUTED, marginTop:2}}>{sub}</div>
      </div>
    </div>
  );
}

function Field4({label, value, onChange, placeholder, wide}){
  return (
    <div style={wide?{gridColumn:'1 / -1'}:{}}>
      <label style={{
        fontSize:11.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
        textTransform:'uppercase', marginBottom:6, display:'block',
      }}>{label}</label>
      <input
        value={value||''}
        onChange={e=>onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', padding:'10px 12px', border:`1px solid ${ONB.BORDER}`,
          borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
        }}/>
    </div>
  );
}

function Toggle4({value, onChange}){
  return (
    <button onClick={()=>onChange && onChange(!value)} style={{
      width:36, height:22, background: value?ONB.GREEN:ONB.BORDER,
      border:'none', borderRadius:999, cursor:'pointer', position:'relative',
      transition:'background .2s', padding:0,
    }}>
      <div style={{
        position:'absolute', top:2, left: value?16:2, width:18, height:18,
        background:'#fff', borderRadius:'50%', transition:'left .2s',
        boxShadow:'0 1px 3px rgba(0,0,0,0.15)',
      }}/>
    </button>
  );
}

function Stat4({label, value, detail, green}){
  return (
    <div style={{
      display:'flex', alignItems:'baseline', justifyContent:'space-between',
      padding:'10px 0', borderBottom:`1px solid ${ONB.PINK_SOFT}`,
    }}>
      <div>
        <div style={{fontSize:13, color:ONB.MUTED, fontWeight:500}}>{label}</div>
        {detail && <div style={{fontSize:11, color:ONB.MUTED_LIGHT, marginTop:2}}>{detail}</div>}
      </div>
      <div style={{
        fontSize:18, fontWeight:800, color: green?ONB.GREEN:ONB.TEXT,
      }}>{value}</div>
    </div>
  );
}

window.Step4GoLive = Step4GoLive;
window.Field4 = Field4;

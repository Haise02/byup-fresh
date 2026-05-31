// Step 3: Review the AI-generated menu

const MOCK_MENU = {
  name: 'Menù principale',
  categories: [
    {
      id: 'antipasti', name: 'Antipasti', confidence: 0.98,
      dishes: [
        { id: 'a1', name: 'Bruschetta al pomodoro', price: 6.00, desc: 'Pane tostato, pomodoro fresco, basilico, aglio, olio EVO', allergens:['glutine'], confidence:0.97 },
        { id: 'a2', name: 'Tagliere misto', price: 14.00, desc: 'Selezione di salumi e formaggi locali con miele e marmellata', allergens:['latte'], confidence:0.95 },
        { id: 'a3', name: 'Burrata pugliese', price: 10.00, desc: 'Burrata fresca con pomodorini e olio EVO', allergens:['latte'], confidence:0.99 },
      ],
    },
    {
      id: 'primi', name: 'Primi piatti', confidence: 0.99,
      dishes: [
        { id: 'p1', name: 'Cacio e Pepe', price: 14.00, desc: 'Tonnarelli, pecorino romano DOP, pepe nero macinato fresco', allergens:['glutine','latte','uova'], confidence:0.99 },
        { id: 'p2', name: 'Carbonara', price: 15.00, desc: 'Spaghetti, guanciale, uova, pecorino, pepe', allergens:['glutine','uova','latte'], confidence:0.98 },
        { id: 'p3', name: 'Amatriciana', price: 14.00, desc: 'Bucatini, guanciale, pomodoro, pecorino', allergens:['glutine','latte'], confidence:0.97 },
        { id: 'p4', name: 'Gricia', price: 13.00, desc: 'Rigatoni, guanciale, pecorino, pepe', allergens:['glutine','latte'], confidence:0.96 },
        { id: 'p5', name: 'Ravioli ricotta e spinaci', price: 13.50, desc: 'Pasta fresca ripiena, burro e salvia', allergens:['glutine','latte','uova'], confidence:0.62, needsReview:true },
      ],
    },
    {
      id: 'secondi', name: 'Secondi piatti', confidence: 0.94,
      dishes: [
        { id: 's1', name: 'Saltimbocca alla romana', price: 18.00, desc: 'Fettine di vitello, prosciutto crudo, salvia, vino bianco', allergens:[], confidence:0.93 },
        { id: 's2', name: 'Coda alla vaccinara', price: 22.00, desc: 'Coda di manzo brasata con sedano, pomodoro e cioccolato', allergens:[], confidence:0.91 },
        { id: 's3', name: 'Trippa alla romana', price: 16.00, desc: 'Trippa in umido con pomodoro, mentuccia e pecorino', allergens:['latte'], confidence:0.88 },
      ],
    },
    {
      id: 'dolci', name: 'Dolci', confidence: 0.97,
      dishes: [
        { id: 'd1', name: 'Tiramisù', price: 7.00, desc: 'Savoiardi, mascarpone, uova, caffè, cacao', allergens:['glutine','latte','uova'], confidence:0.99 },
        { id: 'd2', name: 'Panna cotta', price: 6.00, desc: 'Con coulis di frutti di bosco', allergens:['latte'], confidence:0.98 },
      ],
    },
    {
      id: 'bevande', name: 'Bevande', confidence: 0.99,
      dishes: [
        { id: 'b1', name: 'Acqua naturale 75cl', price: 3.00, desc: '', allergens:[], confidence:1 },
        { id: 'b2', name: 'Vino della casa (1/2 lt)', price: 8.00, desc: 'Rosso o bianco', allergens:['solfiti'], confidence:0.96 },
      ],
    },
  ],
};

function ConfidenceBadge({ score }) {
  const high = score >= 0.9;
  const mid = score >= 0.75;
  const bg = high ? ONB.GREEN_SOFT : mid ? ONB.AMBER_SOFT : '#fee2e2';
  const fg = high ? ONB.GREEN : mid ? ONB.AMBER : ONB.RED;
  const label = high ? 'Alta' : mid ? 'Media' : 'Da rivedere';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background:bg, color:fg, padding:'2px 8px', borderRadius:999,
      fontSize:10.5, fontWeight:700, letterSpacing:0.3,
    }}>
      <OnbIcon.Sparkle size={9} color={fg}/>
      {label} · {Math.round(score*100)}%
    </span>
  );
}

function DishRow({ dish, onEdit }) {
  const lowConfidence = dish.confidence < 0.75 || dish.needsReview;
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr 90px 36px',
      gap:14, alignItems:'center',
      padding:'14px 18px',
      background: lowConfidence ? '#FFFBEB' : '#fff',
      borderLeft: lowConfidence ? `3px solid ${ONB.AMBER}` : '3px solid transparent',
      borderTop: `1px solid ${ONB.BORDER_SOFT}`,
      transition:'background .15s',
    }}>
      <div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4}}>
          <span style={{fontSize:14.5, fontWeight:600}}>{dish.name}</span>
          {lowConfidence && (
            <span title="Da rivedere" style={{
              display:'inline-flex', alignItems:'center', gap:4,
              fontSize:10.5, fontWeight:700, color:ONB.AMBER,
              background:ONB.AMBER_SOFT, padding:'2px 8px', borderRadius:999,
            }}>⚠ Da rivedere</span>
          )}
        </div>
        {dish.desc && (
          <div style={{fontSize:12.5, color:ONB.MUTED, lineHeight:1.4}}>{dish.desc}</div>
        )}
        {dish.allergens.length > 0 && (
          <div style={{display:'flex', gap:5, marginTop:6, flexWrap:'wrap'}}>
            {dish.allergens.map(a => (
              <span key={a} style={{
                fontSize:10, color:ONB.MUTED, background:ONB.BG, padding:'2px 7px',
                borderRadius:4, textTransform:'uppercase', letterSpacing:0.4, fontWeight:600,
              }}>{a}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{fontSize:14, fontWeight:700, textAlign:'right'}}>
        € {dish.price.toFixed(2)}
      </div>
      <button onClick={onEdit} style={{
        background:'transparent', border:'none', cursor:'pointer', padding:8,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <OnbIcon.Pencil size={14}/>
      </button>
    </div>
  );
}

function CategoryBlock({ cat, defaultOpen, onAddDish, onEditDish }) {
  const [open, setOpen] = React.useState(defaultOpen ?? true);
  const reviewCount = cat.dishes.filter(d=>d.needsReview).length;
  return (
    <div style={{
      background:'#fff', border:`1px solid ${ONB.BORDER_SOFT}`,
      borderRadius:12, marginBottom:14, overflow:'hidden',
    }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'16px 20px', background: open ? ONB.BG_SOFT : '#fff',
        border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <div style={{transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition:'transform .2s'}}>
          <OnbIcon.ChevronDown size={16}/>
        </div>
        <span style={{fontSize:16, fontWeight:700, flex:1}}>{cat.name}</span>
        <span style={{fontSize:12, color:ONB.MUTED, fontWeight:500}}>
          {cat.dishes.length} piatti
        </span>
        {reviewCount > 0 && (
          <span style={{
            fontSize:11, fontWeight:700, color:ONB.AMBER,
            background:ONB.AMBER_SOFT, padding:'3px 9px', borderRadius:999,
          }}>{reviewCount} da rivedere</span>
        )}
        <ConfidenceBadge score={cat.confidence}/>
      </button>
      {open && (
        <div>
          {cat.dishes.map(d => <DishRow key={d.id} dish={d} onEdit={()=>onEditDish && onEditDish({cat, dish:d})}/>)}
          <button onClick={()=>onAddDish && onAddDish(cat)} style={{
            width:'100%', padding:'12px 18px', background:ONB.BG_SOFT,
            border:'none', borderTop:`1px solid ${ONB.BORDER_SOFT}`,
            color:ONB.PINK_DARK, fontSize:13, fontWeight:700, cursor:'pointer',
            fontFamily:'inherit', display:'flex', alignItems:'center', gap:6,
            justifyContent:'center',
          }}>
            <OnbIcon.Plus size={14} color={ONB.PINK_DARK}/> Aggiungi piatto a {cat.name}
          </button>
        </div>
      )}
    </div>
  );
}

function Step3Review({ onNext, onBack }) {
  const [addDishOpen, setAddDishOpen] = React.useState(null);
  const [editDishOpen, setEditDishOpen] = React.useState(null);
  const [addCatOpen, setAddCatOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(true);
  const totalDishes = MOCK_MENU.categories.reduce((s,c)=>s+c.dishes.length, 0);
  const reviewCount = MOCK_MENU.categories.reduce(
    (s,c)=>s + c.dishes.filter(d=>d.needsReview).length, 0
  );

  return (
    <div style={{padding:'40px 48px 64px', background:ONB.BG_SOFT, minHeight:760}}>
      <div style={{
        maxWidth: previewOpen ? 1320 : 1080,
        margin:'0 auto',
        display: previewOpen ? 'flex' : 'block',
        gap: previewOpen ? 32 : 0,
        alignItems: 'flex-start',
        transition: 'max-width .2s',
      }}>
      <div style={{flex:1, minWidth:0}}>
        {/* Hero */}
        <div style={{
          display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          marginBottom:24, gap:32,
        }}>
          <div style={{flex:1}}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:7,
              background:ONB.GREEN_SOFT, color:ONB.GREEN,
              padding:'6px 12px', borderRadius:999,
              fontSize:11.5, fontWeight:700, marginBottom:14, letterSpacing:0.3,
            }}>
              <OnbIcon.Check size={11} color={ONB.GREEN}/>
              MENU RICREATO CON SUCCESSO
            </div>
            <h1 style={{fontSize:36, fontWeight:800, margin:'0 0 8px', letterSpacing:-0.8}}>
              Ecco il tuo menu.<br/>
              <span style={{color:ONB.MUTED, fontWeight:600}}>L'IA può commettere errori. Verifica che sia tutto corretto.</span>
            </h1>
            <p style={{fontSize:15, color:ONB.MUTED, margin:0, lineHeight:1.5}}>
              Abbiamo creato <b style={{color:ONB.TEXT}}>5 categorie</b> e <b style={{color:ONB.TEXT}}>{totalDishes} piatti</b>.
              {reviewCount > 0 && <> <b style={{color:ONB.AMBER}}>{reviewCount} piatto da rivedere</b>: lo trovi evidenziato in arancione.</>}
            </p>
          </div>

          {/* Stats card */}
          <div style={{
            display:'flex', gap:0, background:'#fff',
            border:`1px solid ${ONB.BORDER_SOFT}`, borderRadius:12, overflow:'hidden',
          }}>
            {[
              {label:'Piatti', value:totalDishes, color:ONB.TEXT},
              {label:'Categorie', value:5, color:ONB.TEXT},
              {label:'Allergeni', value:6, color:ONB.TEXT},
              {label:'Accuratezza', value:'94%', color:ONB.GREEN},
            ].map((s,i,arr)=>(
              <div key={i} style={{
                padding:'14px 22px', textAlign:'center',
                borderRight: i<arr.length-1 ? `1px solid ${ONB.BORDER_SOFT}` : 'none',
              }}>
                <div style={{fontSize:22, fontWeight:800, color:s.color, lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:11, color:ONB.MUTED, marginTop:4, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          display:'flex', gap:12, alignItems:'center', marginBottom:20,
          padding:'14px 18px', background:'#fff', border:`1px solid ${ONB.BORDER_SOFT}`,
          borderRadius:12,
        }}>
          <input
            placeholder="Cerca piatto..."
            style={{
              flex:1, border:'none', outline:'none', fontSize:14,
              fontFamily:'inherit', padding:'4px 0',
            }}/>
          <div style={{width:1, height:20, background:ONB.BORDER}}/>
          {!previewOpen && (
            <button onClick={()=>setPreviewOpen(true)} style={{
              display:'flex', alignItems:'center', gap:6,
              background:'transparent',
              border:`1px solid ${ONB.BORDER}`, fontSize:13, color:ONB.TEXT, cursor:'pointer',
              fontFamily:'inherit', fontWeight:600, padding:'7px 12px', borderRadius:8,
            }}>
              <OnbIcon.Eye size={14}/> Mostra anteprima
            </button>
          )}
          <button style={{
            display:'flex', alignItems:'center', gap:6, background:ONB.PINK_SOFT,
            color:ONB.PINK_DARK, border:'none', padding:'8px 14px', borderRadius:8,
            fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>
            <OnbIcon.Sparkle size={12} color={ONB.PINK_DARK}/>
            Migliora descrizioni con AI
          </button>
        </div>

        {/* Categories */}
        {MOCK_MENU.categories.map((c,i) => (
          <CategoryBlock key={c.id} cat={c} defaultOpen={i<2} onAddDish={setAddDishOpen} onEditDish={setEditDishOpen}/>
        ))}

        {/* Add category CTA */}
        <button onClick={()=>setAddCatOpen(true)} style={{
          width:'100%', padding:'18px', background:'#fff',
          border:`1.5px dashed ${ONB.BORDER}`, borderRadius:12,
          color:ONB.MUTED, fontSize:14, fontWeight:700, cursor:'pointer',
          fontFamily:'inherit', display:'flex', alignItems:'center', gap:8,
          justifyContent:'center', marginTop:6,
        }}>
          <OnbIcon.Plus size={16} color={ONB.MUTED}/> Aggiungi una nuova categoria
        </button>

        {/* Footer */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          marginTop:32, paddingTop:24, borderTop:`1px solid ${ONB.BORDER_SOFT}`,
        }}>
          <button onClick={onBack} style={{
            background:'transparent', border:`1px solid ${ONB.BORDER}`, color:ONB.TEXT,
            padding:'12px 22px', borderRadius:10, fontSize:14, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit',
          }}>← Ricarica il menu</button>
          <button onClick={onNext} style={{
            background:ONB.PINK, color:'#fff', border:'none',
            padding:'14px 28px', borderRadius:12, fontSize:15, fontWeight:700,
            cursor:'pointer', fontFamily:'inherit',
            boxShadow:'0 4px 14px rgba(233,30,99,0.3)',
            display:'flex', alignItems:'center', gap:8,
          }}>
            Conferma menu e continua <OnbIcon.ChevronRight size={14} color="#fff"/>
          </button>
        </div>
      </div>

      {previewOpen && <PreviewPanel onClose={()=>setPreviewOpen(false)}/>}

      {addDishOpen && <DishModal cat={addDishOpen} onClose={()=>setAddDishOpen(null)}/>}
      {editDishOpen && <DishModal cat={editDishOpen.cat} dish={editDishOpen.dish} onClose={()=>setEditDishOpen(null)}/>}
      {addCatOpen && <CategoryModal onClose={()=>setAddCatOpen(false)}/>}
      </div>
    </div>
  );
}

window.Step3Review = Step3Review;

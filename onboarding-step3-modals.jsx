// Modals and inline preview panel for Step 3

function ModalShell({ title, sub, onClose, children, footer, wide, footerLeft }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(20,20,30,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:200, animation:'fadeIn .15s',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff', borderRadius:16, width: wide?640:520, maxHeight:'90vh',
        overflow:'auto', boxShadow:'0 20px 50px rgba(0,0,0,0.2)',
        animation:'slideUp .2s',
      }}>
        <div style={{
          display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          padding:'24px 28px 18px', borderBottom:`1px solid ${ONB.BORDER_SOFT}`,
        }}>
          <div>
            <h2 style={{fontSize:20, fontWeight:800, margin:'0 0 4px', letterSpacing:-0.3}}>{title}</h2>
            {sub && <div style={{fontSize:13, color:ONB.MUTED}}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{
            background:ONB.BG, border:'none', width:32, height:32, borderRadius:'50%',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }}><OnbIcon.X size={16}/></button>
        </div>
        <div style={{padding:'20px 28px'}}>{children}</div>
        {footer && (
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center', gap:10,
            padding:'16px 28px', borderTop:`1px solid ${ONB.BORDER_SOFT}`, background:ONB.BG_SOFT,
          }}>
            <div>{footerLeft}</div>
            <div style={{display:'flex', gap:10}}>{footer}</div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function FieldX({ label, placeholder, type='text', wide, hint, value }) {
  return (
    <div style={wide?{gridColumn:'1 / -1'}:{}}>
      <label style={{
        fontSize:11.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
        textTransform:'uppercase', marginBottom:6, display:'block',
      }}>{label}</label>
      <input type={type} placeholder={placeholder} defaultValue={value} style={{
        width:'100%', padding:'10px 12px', border:`1px solid ${ONB.BORDER}`,
        borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
      }}/>
      {hint && <div style={{fontSize:11, color:ONB.MUTED_LIGHT, marginTop:4}}>{hint}</div>}
    </div>
  );
}

// ─── Sub-components for DishModal customization sections ─────────────────

function CollapseSection({ title, subtitle, icon, open, onToggle, children }) {
  return (
    <div style={{
      border: `1px solid ${open ? ONB.BORDER : ONB.BORDER_SOFT}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      background: '#fff',
      transition: 'border-color .15s',
    }}>
      <button onClick={onToggle} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'12px 14px', background: open ? ONB.BG_SOFT : '#fff',
        border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <div style={{
          width:26, height:26, borderRadius:6,
          background: open ? ONB.PINK_SOFT : ONB.BG,
          color: open ? ONB.PINK_DARK : ONB.MUTED,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 14, fontWeight: 700, flexShrink:0,
        }}>{icon}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13.5, fontWeight:700, color:ONB.TEXT}}>{title}</div>
          <div style={{fontSize:11.5, color:ONB.MUTED, marginTop:1}}>{subtitle}</div>
        </div>
        <div style={{
          transform: open ? 'rotate(0)' : 'rotate(-90deg)',
          transition:'transform .2s', color: ONB.MUTED,
        }}>
          <OnbIcon.ChevronDown size={14}/>
        </div>
      </button>
      {open && (
        <div style={{padding:'14px', background:'#fff', borderTop:`1px solid ${ONB.BORDER_SOFT}`}}>
          {children}
        </div>
      )}
    </div>
  );
}

function IngredientList({ ingredients, setIngredients, library }) {
  const [query, setQuery] = React.useState('');
  const [showSuggest, setShowSuggest] = React.useState(false);

  const usedNames = new Set(ingredients.map(i => i.name.toLowerCase()));
  const suggestions = query
    ? library.filter(l => l.toLowerCase().includes(query.toLowerCase()) && !usedNames.has(l.toLowerCase())).slice(0, 6)
    : library.filter(l => !usedNames.has(l.toLowerCase())).slice(0, 6);

  const addIng = (name) => {
    if (!name.trim()) return;
    setIngredients(arr => [...arr, { name: name.trim(), removable: false }]);
    setQuery('');
  };

  return (
    <div>
      {/* List */}
      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom: ingredients.length ? 12 : 0}}>
        {ingredients.map((ing, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'1fr auto auto',
            gap: 10, alignItems:'center',
            padding:'8px 10px 8px 12px',
            background: ONB.BG_SOFT, borderRadius:8,
          }}>
            <span style={{fontSize: 13, color: ONB.TEXT, fontWeight: 600}}>{ing.name}</span>
            <label style={{
              display:'flex', alignItems:'center', gap:6,
              fontSize: 11.5, color: ing.removable ? ONB.PINK_DARK : ONB.MUTED,
              fontWeight: 600, cursor:'pointer',
            }}>
              <input
                type="checkbox"
                checked={ing.removable}
                onChange={() => setIngredients(arr => arr.map((x, idx) => idx === i ? {...x, removable: !x.removable} : x))}
                style={{margin:0, accentColor: ONB.PINK}}
              />
              Cliente può togliere
            </label>
            <button
              onClick={() => setIngredients(arr => arr.filter((_, idx) => idx !== i))}
              style={{
                width:26, height:26, background:'transparent', border:'none',
                borderRadius:6, cursor:'pointer', color:ONB.MUTED,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
              <OnbIcon.X size={12}/>
            </button>
          </div>
        ))}
      </div>

      {/* Search + add input */}
      <div style={{position:'relative'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 12px', border:`1px solid ${ONB.BORDER}`, borderRadius:8,
          background: '#fff',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ONB.MUTED} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
            onKeyDown={e => { if (e.key === 'Enter') { addIng(query); }}}
            placeholder="Cerca un ingrediente già usato o digitane uno nuovo…"
            style={{
              flex:1, border:'none', outline:'none', fontSize:13,
              fontFamily:'inherit', background:'transparent',
            }}
          />
          {query && (
            <button onClick={() => addIng(query)} style={{
              background: ONB.PINK, color:'#fff', border:'none',
              padding:'4px 10px', borderRadius: 5,
              fontSize: 11.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            }}>+ Aggiungi nuovo</button>
          )}
        </div>

        {showSuggest && suggestions.length > 0 && (
          <div style={{
            position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
            background:'#fff', border:`1px solid ${ONB.BORDER}`,
            borderRadius: 8, boxShadow:'0 8px 24px rgba(0,0,0,0.08)',
            zIndex: 10, maxHeight: 200, overflowY:'auto',
          }}>
            <div style={{padding:'8px 12px', fontSize:10.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.3, textTransform:'uppercase', borderBottom:`1px solid ${ONB.BORDER_SOFT}`}}>
              Già usati nel tuo menu
            </div>
            {suggestions.map(s => (
              <button key={s} onMouseDown={() => addIng(s)} style={{
                width:'100%', textAlign:'left',
                padding:'8px 12px', background:'transparent',
                border:'none', cursor:'pointer', fontFamily:'inherit',
                fontSize: 13, color: ONB.TEXT,
                display:'flex', alignItems:'center', gap:8,
              }}
                onMouseEnter={e => e.currentTarget.style.background = ONB.BG_SOFT}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <OnbIcon.Plus size={11} color={ONB.MUTED}/>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExtrasList({ extras, setExtras }) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');

  const add = () => {
    if (!name.trim()) return;
    setExtras(arr => [...arr, { name: name.trim(), price: parseFloat(price) || 0 }]);
    setName(''); setPrice('');
  };

  return (
    <div>
      {extras.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:12}}>
          {extras.map((ex, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'1fr auto auto',
              gap: 10, alignItems:'center',
              padding:'8px 10px 8px 12px',
              background: ONB.BG_SOFT, borderRadius:8,
            }}>
              <span style={{fontSize: 13, color: ONB.TEXT, fontWeight: 600}}>{ex.name}</span>
              <span style={{fontSize:13, fontWeight:700, color:ONB.PINK_DARK}}>+ € {ex.price.toFixed(2)}</span>
              <button onClick={() => setExtras(arr => arr.filter((_, idx) => idx !== i))} style={{
                width:26, height:26, background:'transparent', border:'none',
                borderRadius:6, cursor:'pointer', color:ONB.MUTED,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}><OnbIcon.X size={12}/></button>
            </div>
          ))}
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'1fr 100px auto', gap:8}}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="es. Tartufo nero"
          style={{
            padding:'8px 12px', border:`1px solid ${ONB.BORDER}`, borderRadius:8,
            fontSize:13, fontFamily:'inherit', outline:'none',
          }}
        />
        <div style={{position:'relative'}}>
          <span style={{
            position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
            fontSize:13, color: ONB.MUTED, fontWeight: 600,
          }}>+€</span>
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            type="number" placeholder="4,00"
            style={{
              width:'100%', padding:'8px 12px 8px 30px', border:`1px solid ${ONB.BORDER}`, borderRadius:8,
              fontSize:13, fontFamily:'inherit', outline:'none',
            }}
          />
        </div>
        <button onClick={add} style={{
          background: name.trim() ? ONB.PINK : ONB.BG,
          color: name.trim() ? '#fff' : ONB.MUTED,
          border:'none', padding:'0 14px', borderRadius:8,
          fontSize:12.5, fontWeight:700, cursor: name.trim() ? 'pointer' : 'default',
          fontFamily:'inherit',
        }}>Aggiungi</button>
      </div>
    </div>
  );
}

function VariantsList({ variants, setVariants }) {
  const addGroup = () => setVariants(arr => [...arr, { name: '', options: [''], required: true }]);
  const updateGroup = (i, patch) => setVariants(arr => arr.map((v, idx) => idx === i ? {...v, ...patch} : v));
  const removeGroup = (i) => setVariants(arr => arr.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {variants.map((v, i) => (
          <div key={i} style={{
            border:`1px solid ${ONB.BORDER}`, borderRadius:8, padding:12,
          }}>
            <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center', marginBottom:10}}>
              <input
                value={v.name}
                onChange={e => updateGroup(i, { name: e.target.value })}
                placeholder="Nome del gruppo (es. Cottura, Formato, Pane)"
                style={{
                  padding:'7px 10px', border:`1px solid ${ONB.BORDER}`, borderRadius:6,
                  fontSize:13, fontFamily:'inherit', outline:'none', fontWeight:600,
                }}
              />
              <button onClick={() => removeGroup(i)} style={{
                width:30, height:30, background:'transparent', border:`1px solid ${ONB.BORDER}`,
                borderRadius:6, cursor:'pointer', color:ONB.MUTED,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}><OnbIcon.X size={12}/></button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:8}}>
              {v.options.map((opt, oi) => (
                <div key={oi} style={{display:'flex', gap:6}}>
                  <input
                    value={opt}
                    onChange={e => updateGroup(i, { options: v.options.map((x, idx) => idx === oi ? e.target.value : x) })}
                    placeholder={`Opzione ${oi+1} (es. Al sangue)`}
                    style={{
                      flex:1, padding:'6px 10px', border:`1px solid ${ONB.BORDER}`, borderRadius:6,
                      fontSize:12.5, fontFamily:'inherit', outline:'none',
                    }}
                  />
                  {v.options.length > 1 && (
                    <button onClick={() => updateGroup(i, { options: v.options.filter((_, idx) => idx !== oi) })} style={{
                      width:28, height:28, background:'transparent', border:`1px solid ${ONB.BORDER}`,
                      borderRadius:6, cursor:'pointer', color:ONB.MUTED,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}><OnbIcon.X size={10}/></button>
                  )}
                </div>
              ))}
              <button onClick={() => updateGroup(i, { options: [...v.options, ''] })} style={{
                background:'transparent', border:'none', color:ONB.PINK_DARK,
                fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:5, padding:'4px 0', alignSelf:'flex-start',
              }}>
                <OnbIcon.Plus size={11} color={ONB.PINK_DARK}/> Aggiungi opzione
              </button>
            </div>

            <label style={{
              display:'flex', alignItems:'center', gap:7,
              fontSize: 11.5, color: ONB.MUTED, fontWeight: 600, cursor:'pointer',
              paddingTop:8, borderTop:`1px solid ${ONB.BORDER_SOFT}`,
            }}>
              <input
                type="checkbox" checked={v.required}
                onChange={() => updateGroup(i, { required: !v.required })}
                style={{margin:0, accentColor: ONB.PINK}}
              />
              Scelta obbligatoria — il cliente deve sceglierne una prima di aggiungere al carrello
            </label>
          </div>
        ))}
      </div>

      <button onClick={addGroup} style={{
        marginTop: variants.length ? 10 : 0,
        width:'100%', padding:'10px',
        background:'transparent', border:`1.5px dashed ${ONB.BORDER}`,
        borderRadius:8, color:ONB.MUTED, fontSize:12.5, fontWeight:700,
        cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap:6, justifyContent:'center',
      }}>
        <OnbIcon.Plus size={12} color={ONB.MUTED}/> Aggiungi gruppo di varianti
      </button>
    </div>
  );
}

function NutritionFields() {
  const [values, setValues] = React.useState({ kcal: '478', carb: '52', prot: '18', fat: '21' });
  const [regenerating, setRegenerating] = React.useState(false);

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      // simula nuovo calcolo con leggera variazione
      setValues({ kcal: '482', carb: '54', prot: '17', fat: '22' });
      setRegenerating(false);
    }, 800);
  };

  return (
    <div>
      <div style={{
        marginBottom: 12, padding:'10px 12px', borderRadius: 8,
        background: ONB.GREEN_SOFT,
        display:'flex', alignItems:'center', gap:10,
      }}>
        <OnbIcon.Sparkle size={14} color={ONB.GREEN}/>
        <div style={{flex:1, fontSize:12, color: ONB.GREEN, fontWeight:600, lineHeight:1.4}}>
          Stimati dall'AI in base agli ingredienti. Modifica i valori se serve, oppure rigenera.
        </div>
        <button
          onClick={regenerate}
          disabled={regenerating}
          style={{
            background:'#fff', color: ONB.GREEN, border:`1px solid ${ONB.GREEN}`,
            padding:'6px 10px', borderRadius:6,
            fontSize:11.5, fontWeight:700, cursor: regenerating ? 'default' : 'pointer',
            fontFamily:'inherit', whiteSpace:'nowrap',
            opacity: regenerating ? 0.7 : 1,
          }}>
          {regenerating ? 'Calcolo…' : 'Rigenera'}
        </button>
      </div>

      <label style={{
        fontSize:11, fontWeight:700, color:ONB.MUTED, letterSpacing:0.3,
        textTransform:'uppercase', marginBottom:8, display:'block',
      }}>Per porzione</label>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
        {[
          {l:'Kcal', k:'kcal'},
          {l:'Carb. (g)', k:'carb'},
          {l:'Proteine (g)', k:'prot'},
          {l:'Grassi (g)', k:'fat'},
        ].map((f,i)=>(
          <div key={i}>
            <input
              value={values[f.k]}
              onChange={e => setValues(v => ({...v, [f.k]: e.target.value}))}
              type="number"
              placeholder="—"
              style={{
                width:'100%', padding:'10px 8px', border:`1px solid ${ONB.BORDER}`,
                borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
                textAlign:'center', fontWeight:700, color: ONB.TEXT,
              }}
            />
            <div style={{fontSize:10.5, color:ONB.MUTED, textAlign:'center', marginTop:4, fontWeight:600}}>{f.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DishModal({ cat, dish, onClose }) {
  const isEdit = !!dish;
  const allergens = ['Glutine','Latte','Uova','Pesce','Crostacei','Frutta a guscio','Soia','Sedano','Senape','Sesamo','Solfiti'];
  const [selected, setSelected] = React.useState(dish?.allergens || []);
  const [photo, setPhoto] = React.useState(null);
  const [openSection, setOpenSection] = React.useState(null); // 'ingredients' | 'extras' | 'variants' | 'nutrition' | null
  // Ingredients: each can be marked "removable" (cliente può togliere)
  const [ingredients, setIngredients] = React.useState([
    { name: 'Tonnarelli', removable: false },
    { name: 'Pecorino DOP', removable: false },
    { name: 'Pepe nero', removable: true },
  ]);
  // Extras: paid add-ons cliente può aggiungere
  const [extras, setExtras] = React.useState([
    { name: 'Tartufo nero', price: 4 },
  ]);
  // Variants: gruppi di scelte (Cottura: media/al sangue/ben cotta)
  const [variants, setVariants] = React.useState([
    { name: 'Cottura', options: ['Al dente', 'Ben cotta'], required: true },
  ]);
  const toggle = a => setSelected(s => s.includes(a) ? s.filter(x=>x!==a) : [...s,a]);

  // Mock library of already-used ingredients (for autocomplete)
  const ingredientLibrary = ['Pomodoro San Marzano', 'Mozzarella di bufala', 'Basilico', 'Olio EVO', 'Aglio', 'Cipolla rossa', 'Guanciale', 'Pecorino DOP', 'Parmigiano 24 mesi', 'Burro', 'Tonnarelli', 'Spaghetti', 'Rigatoni', 'Pepe nero', 'Pepe rosa', 'Salvia', 'Rosmarino', 'Pinoli', 'Vino bianco', 'Limone'];

  return (
    <ModalShell
      title={isEdit ? 'Modifica piatto' : 'Aggiungi piatto'}
      sub={`Categoria: ${cat.name}`}
      onClose={onClose}
      wide
      footerLeft={isEdit ? (
        <button style={{
          background:'transparent', border:'none', color:'#dc2626',
          fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          display:'flex', alignItems:'center', gap:6, padding:'10px 0',
        }}>
          <OnbIcon.Trash size={14} color="#dc2626"/> Elimina piatto
        </button>
      ) : null}
      footer={<>
        <button onClick={onClose} style={{
          background:'transparent', border:`1px solid ${ONB.BORDER}`, padding:'10px 18px',
          borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        }}>Annulla</button>
        <button style={{
          background:ONB.PINK, color:'#fff', border:'none', padding:'10px 20px',
          borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
        }}>{isEdit ? 'Salva modifiche' : 'Salva piatto'}</button>
      </>}
    >
      {/* Photo dropzone */}
      <div style={{marginBottom:16}}>
        <label style={{
          fontSize:11.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
          textTransform:'uppercase', marginBottom:6, display:'block',
        }}>Foto del piatto</label>
        {photo ? (
          <div style={{
            display:'flex', alignItems:'center', gap:14,
            padding:10, border:`1px solid ${ONB.BORDER}`, borderRadius:10,
          }}>
            <div style={{width:72, height:72, borderRadius:8, background:'#F4D9A0', flexShrink:0}}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600, color:ONB.TEXT}}>foto-piatto.jpg</div>
              <div style={{fontSize:11.5, color:ONB.MUTED}}>1.4 MB · 1200×800</div>
            </div>
            <button onClick={()=>setPhoto(null)} style={{
              background:'transparent', border:'none', color:'#dc2626',
              fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}>Rimuovi</button>
          </div>
        ) : (
          <button onClick={()=>setPhoto(true)} style={{
            width:'100%', padding:'18px', borderRadius:10,
            border:`1.5px dashed ${ONB.BORDER}`, background:ONB.BG_SOFT,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            cursor:'pointer', fontFamily:'inherit',
          }}>
            <OnbIcon.Plus size={16} color={ONB.MUTED}/>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:13, fontWeight:600, color:ONB.TEXT}}>Aggiungi foto</div>
              <div style={{fontSize:11.5, color:ONB.MUTED}}>Trascina qui o clicca · JPG/PNG · max 5MB</div>
            </div>
          </button>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <FieldX label="Nome del piatto" placeholder="es. Spaghetti alle vongole" wide value={dish?.name}/>
        <FieldX label="Prezzo (IVA inclusa)" placeholder="14,00" type="number" value={dish?.price?.toFixed(2)}/>
        <FieldX label="Food cost (opzionale)" placeholder="4,50" type="number" hint="Per le tue analytics" value={dish?.foodCost}/>
        <FieldX label="Descrizione" placeholder="Ingredienti principali, breve descrizione..." wide value={dish?.desc}/>
      </div>

      <div style={{marginTop:18}}>
        <label style={{
          fontSize:11.5, fontWeight:700, color:ONB.MUTED, letterSpacing:0.4,
          textTransform:'uppercase', marginBottom:8, display:'block',
        }}>Allergeni</label>
        <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
          {allergens.map(a => (
            <button key={a} onClick={()=>toggle(a)} style={{
              padding:'6px 12px', borderRadius:999, fontSize:12.5, fontWeight:600,
              border: selected.includes(a) ? `1.5px solid ${ONB.PINK}` : `1.5px solid ${ONB.BORDER}`,
              background: selected.includes(a) ? ONB.PINK_SOFT : '#fff',
              color: selected.includes(a) ? ONB.PINK_DARK : ONB.MUTED,
              cursor:'pointer', fontFamily:'inherit',
            }}>{a}</button>
          ))}
        </div>
      </div>

      {/* AI auto-fill banner */}
      <div style={{
        marginTop:18, padding:'12px 14px', background:ONB.PINK_SOFT, borderRadius:10,
        display:'flex', alignItems:'center', gap:10,
      }}>
        <OnbIcon.Sparkle size={16} color={ONB.PINK_DARK}/>
        <div style={{flex:1, fontSize:13, color:ONB.PINK_DARK, fontWeight:600}}>
          Lascia che l'AI scriva descrizione, allergeni e valori nutrizionali per te.
        </div>
        <button style={{
          background:ONB.PINK_DARK, color:'#fff', border:'none', padding:'7px 12px',
          borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
        }}>Auto-compila</button>
      </div>

      {/* ─── Personalizzazioni cliente ─────────────────────────────── */}
      <div style={{marginTop:22}}>
        <div style={{fontSize:13.5, fontWeight:700, color:ONB.TEXT, marginBottom:4}}>
          Personalizzazioni cliente
        </div>
        <div style={{fontSize:12.5, color:ONB.MUTED, marginBottom:12, lineHeight:1.5}}>
          Cosa può modificare il cliente quando ordina dal menu digitale.
        </div>

        <CollapseSection
          title="Ingredienti"
          subtitle={`${ingredients.length} ingredienti · ${ingredients.filter(i=>i.removable).length} rimuovibili`}
          icon="•"
          open={openSection === 'ingredients'}
          onToggle={() => setOpenSection(s => s === 'ingredients' ? null : 'ingredients')}
        >
          <div style={{fontSize:11.5, color:ONB.MUTED, marginBottom:10, lineHeight:1.45}}>
            Spunta gli ingredienti che il cliente può <strong style={{color:ONB.TEXT}}>togliere dal piatto</strong> (es. cipolla, glutine).
          </div>
          <IngredientList
            ingredients={ingredients}
            setIngredients={setIngredients}
            library={ingredientLibrary}
          />
        </CollapseSection>

        <CollapseSection
          title="Aggiunte a pagamento"
          subtitle={extras.length === 0 ? 'Nessuna' : `${extras.length} extra · ingredienti opzionali`}
          icon="+"
          open={openSection === 'extras'}
          onToggle={() => setOpenSection(s => s === 'extras' ? null : 'extras')}
        >
          <div style={{fontSize:11.5, color:ONB.MUTED, marginBottom:10, lineHeight:1.45}}>
            Extra che il cliente può aggiungere al piatto, con prezzo (es. tartufo, doppia mozzarella).
          </div>
          <ExtrasList extras={extras} setExtras={setExtras}/>
        </CollapseSection>

        <CollapseSection
          title="Varianti del piatto"
          subtitle={variants.length === 0 ? 'Nessuna' : `${variants.length} ${variants.length === 1 ? 'gruppo' : 'gruppi'} · cottura, formato…`}
          icon="◐"
          open={openSection === 'variants'}
          onToggle={() => setOpenSection(s => s === 'variants' ? null : 'variants')}
        >
          <div style={{fontSize:11.5, color:ONB.MUTED, marginBottom:10, lineHeight:1.45}}>
            Scelte tra cui il cliente sceglie una opzione (es. <em>Cottura: al sangue / media / ben cotta</em>, <em>Formato: piccolo / grande</em>).
          </div>
          <VariantsList variants={variants} setVariants={setVariants}/>
        </CollapseSection>
      </div>

      {/* ─── Informazioni aggiuntive ────────────────────────────────── */}
      <div style={{marginTop:24}}>
        <div style={{fontSize:13.5, fontWeight:700, color:ONB.TEXT, marginBottom:4}}>
          Informazioni aggiuntive
        </div>
        <div style={{fontSize:12.5, color:ONB.MUTED, marginBottom:12, lineHeight:1.5}}>
          Dati visibili al cliente sul menu, utili per allergie e diete.
        </div>

        <CollapseSection
          title="Valori nutrizionali"
          subtitle="Kcal, carb., proteine, grassi"
          icon="◯"
          open={openSection === 'nutrition'}
          onToggle={() => setOpenSection(s => s === 'nutrition' ? null : 'nutrition')}
        >
          <NutritionFields/>
        </CollapseSection>

        <CollapseSection
          title="Tag dietetici"
          subtitle="Vegetariano, senza glutine…"
          icon="◇"
          open={openSection === 'tags'}
          onToggle={() => setOpenSection(s => s === 'tags' ? null : 'tags')}
        >
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {['Vegetariano','Vegano','Senza glutine','Senza lattosio','Piccante','Crudo','Bio','Locale'].map(t => (
              <button key={t} style={{
                padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                border:`1.5px solid ${ONB.BORDER}`, background:'#fff',
                color:ONB.MUTED, cursor:'pointer', fontFamily:'inherit',
              }}>{t}</button>
            ))}
          </div>
        </CollapseSection>
      </div>
    </ModalShell>
  );
}

function CategoryModal({ onClose }) {
  return (
    <ModalShell
      title="Aggiungi categoria"
      sub="Una nuova sezione del tuo menu"
      onClose={onClose}
      footer={<>
        <button onClick={onClose} style={{
          background:'transparent', border:`1px solid ${ONB.BORDER}`, padding:'10px 18px',
          borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        }}>Annulla</button>
        <button style={{
          background:ONB.PINK, color:'#fff', border:'none', padding:'10px 20px',
          borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
        }}>Crea categoria</button>
      </>}
    >
      <FieldX label="Nome categoria" placeholder="es. Aperitivi"/>
      <div style={{
        marginTop:14, fontSize:12, color:ONB.MUTED, fontWeight:600,
        textTransform:'uppercase', letterSpacing:0.4,
      }}>Suggerimenti rapidi</div>
      <div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:6}}>
        {['Aperitivi','Vini','Birre','Specialità chef','Bambini','Senza glutine','Pizze','Insalate'].map(s=>(
          <span key={s} style={{
            padding:'5px 11px', background:'#fff', border:`1px solid ${ONB.BORDER}`,
            borderRadius:999, cursor:'pointer', fontWeight:600, color:ONB.TEXT, fontSize:12.5,
          }}>+ {s}</span>
        ))}
      </div>
    </ModalShell>
  );
}

// Inline preview panel — sits in the page next to the editor, mirrors the customer menu app.
function PreviewPanel({ onClose }) {
  const WINE = '#7c2436';
  const PINK = ONB.PINK;
  const TEXT = '#1a1a1a';
  const MUTED = '#6b6b6b';
  const BORDER_LIGHT = '#eee';
  const BG_PAGE = '#fafafa';

  const tabs = ['Antipasti','Primi piatti','Secondi piatti','Dolci','Bevande'];
  const [tab, setTab] = React.useState('Primi piatti');

  const dishes = {
    'Antipasti':[
      {n:'Bruschetta al pomodoro', d:'Pane tostato, pomodoro fresco, basilico, aglio, olio EVO', p:'6,00', c:'#E8B373'},
      {n:'Tagliere misto', d:'Selezione di salumi e formaggi locali con miele e marmellata', p:'14,00', c:'#C9803F'},
      {n:'Burrata pugliese', d:'Burrata fresca con pomodorini e olio EVO', p:'10,00', c:'#F2E8C9'},
    ],
    'Primi piatti':[
      {n:'Cacio e Pepe', d:'Tonnarelli, pecorino DOP, pepe nero', p:'14,00', c:'#F4D9A0'},
      {n:'Carbonara', d:'Spaghetti, guanciale, uova, pecorino', p:'15,00', c:'#E8C28A'},
      {n:'Amatriciana', d:'Bucatini, guanciale, pomodoro, pecorino', p:'14,00', c:'#D4756B'},
      {n:'Gricia', d:'Rigatoni, guanciale, pecorino', p:'13,00', c:'#C19A6B'},
      {n:'Ravioli ricotta e spinaci', d:'Pasta fresca ripiena, burro e salvia', p:'13,50', c:'#A8C97F'},
    ],
    'Secondi piatti':[
      {n:'Saltimbocca alla romana', d:'Vitello, prosciutto, salvia, vino bianco', p:'18,00', c:'#B8755A'},
      {n:'Coda alla vaccinara', d:'Coda di bue brasata con sedano e cacao', p:'19,00', c:'#7C3F2D'},
    ],
    'Dolci':[
      {n:'Tiramisù', d:'Mascarpone, savoiardi, caffè, cacao', p:'7,00', c:'#8B5A3C'},
    ],
    'Bevande':[
      {n:'Acqua naturale 75cl', d:'', p:'2,50', c:'#B8D4E0'},
      {n:'Vino della casa rosso 50cl', d:'', p:'8,00', c:'#7C2436'},
    ],
  };
  const list = dishes[tab] || [];

  return (
    <div style={{
      width:380, flexShrink:0, position:'sticky', top:24, alignSelf:'flex-start',
      maxHeight:'calc(100vh - 48px)', display:'flex', flexDirection:'column',
    }}>
      {/* Panel header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:12,
      }}>
        <div>
          <div style={{fontSize:14, fontWeight:800, letterSpacing:-0.2}}>Anteprima cliente</div>
          <div style={{fontSize:11.5, color:ONB.MUTED, marginTop:1}}>Cosa vede chi inquadra il QR</div>
        </div>
        <button onClick={onClose} style={{
          background:ONB.BG, border:'none', width:28, height:28, borderRadius:'50%',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}><OnbIcon.X size={14}/></button>
      </div>

      {/* Phone frame */}
      <div style={{
        width:340, height:660, background:'#1a1a1a', borderRadius:42, padding:8,
        boxShadow:'0 12px 36px rgba(0,0,0,0.18)', margin:'0 auto',
      }}>
        <div style={{
          width:'100%', height:'100%', background:BG_PAGE, borderRadius:34,
          overflow:'hidden', position:'relative', display:'flex', flexDirection:'column',
        }}>
          {/* Status bar */}
          <div style={{
            padding:'12px 24px 4px', display:'flex', justifyContent:'space-between',
            fontSize:11, fontWeight:700, color:TEXT, flexShrink:0,
          }}>
            <span>9:41</span>
            <span style={{display:'flex', gap:3, alignItems:'center'}}>
              <span style={{width:14, height:8, border:`1.2px solid ${TEXT}`, borderRadius:2, position:'relative'}}>
                <span style={{position:'absolute', inset:1, background:TEXT, width:10, borderRadius:1}}/>
              </span>
            </span>
          </div>

          {/* Top row: back + venue + filter */}
          <div style={{padding:'8px 14px 0', display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
            <div style={{
              width:34, height:34, borderRadius:999, background:'#fff',
              boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
            <div style={{flex:1, textAlign:'center', minWidth:0}}>
              <div style={{fontSize:11.5, color:MUTED, fontWeight:600}}>Tavolo 7</div>
              <div style={{fontSize:14.5, fontWeight:800, letterSpacing:-0.2, marginTop:0}}>byup</div>
            </div>
            <div style={{
              width:34, height:34, borderRadius:999, background:'#fff',
              boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
              </svg>
            </div>
          </div>

          {/* Search */}
          <div style={{padding:'10px 14px 0', flexShrink:0}}>
            <div style={{
              display:'flex', alignItems:'center', gap:8,
              background:'#fff', borderRadius:999, padding:'8px 12px',
              boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
              <span style={{fontSize:12, color:MUTED}}>Cerca un piatto, un ingrediente…</span>
            </div>
          </div>

          {/* Tabs (underlined, not pills) */}
          <div style={{
            display:'flex', gap:0, padding:'10px 14px 0', overflowX:'auto', flexShrink:0,
            scrollbarWidth:'none',
          }}>
            {tabs.map(t => {
              const active = t === tab;
              return (
                <button key={t} onClick={()=>setTab(t)} style={{
                  background:'none', border:'none', padding:'6px 10px 8px',
                  borderBottom:`2px solid ${active ? WINE : 'transparent'}`,
                  fontSize:12.5, fontWeight: active ? 700 : 500,
                  color: active ? TEXT : MUTED,
                  cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0,
                }}>{t}</button>
              );
            })}
          </div>

          {/* Dishes scroll */}
          <div style={{flex:1, overflowY:'auto', padding:'12px 14px 90px'}}>
            {list.map((d,i)=>(
              <div key={i} style={{
                background:'#fff', borderRadius:16, padding:11, marginBottom:10,
                display:'flex', gap:11, boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width:80, height:80, borderRadius:12, flexShrink:0,
                  background:d.c,
                }}/>
                <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column'}}>
                  <div style={{fontSize:13.5, fontWeight:700, color:TEXT, lineHeight:1.2}}>{d.n}</div>
                  {d.d && <div style={{fontSize:11, color:MUTED, marginTop:3, lineHeight:1.35,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                  }}>{d.d}</div>}
                  <div style={{flex:1}}/>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6}}>
                    <span style={{fontSize:13.5, fontWeight:800, color:TEXT, fontVariantNumeric:'tabular-nums'}}>€ {d.p}</span>
                    <button style={{
                      width:30, height:30, borderRadius:8, background:'#1a1a1a', border:'none',
                      display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart bar */}
          <div style={{
            position:'absolute', left:0, right:0, bottom:0,
            background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22,
            boxShadow:'0 -6px 20px rgba(0,0,0,0.08)',
            padding:'10px 16px 16px',
          }}>
            <div style={{width:42, height:4, background:'#e0e0e0', borderRadius:999, margin:'0 auto 8px'}}/>
            <button style={{
              width:'100%', height:42, borderRadius:999, border:'none',
              background:WINE, color:'#fff',
              fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              <span>Apri ordine</span>
              <span style={{opacity:0.7}}>·</span>
              <span>{list.length} piatti disponibili</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer note + hide button */}
      <div style={{
        marginTop:12, display:'flex', flexDirection:'column', alignItems:'center', gap:10,
      }}>
        <div style={{
          fontSize:11.5, color:ONB.MUTED, display:'flex',
          alignItems:'center', gap:6,
        }}>
          <OnbIcon.Sparkle size={11} color={ONB.PINK}/>
          Anteprima live · si aggiorna mentre modifichi
        </div>
        <button onClick={onClose} style={{
          display:'flex', alignItems:'center', gap:6,
          background:'transparent', border:`1px solid ${ONB.BORDER}`,
          fontSize:12.5, color:ONB.MUTED, cursor:'pointer', fontFamily:'inherit',
          fontWeight:600, padding:'7px 14px', borderRadius:999,
        }}>
          <OnbIcon.Eye size={13} color={ONB.MUTED}/> Nascondi anteprima
        </button>
      </div>
    </div>
  );
}

window.DishModal = DishModal;
window.CategoryModal = CategoryModal;
window.PreviewPanel = PreviewPanel;

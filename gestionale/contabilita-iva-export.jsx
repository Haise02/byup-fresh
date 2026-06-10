// Tab IVA + Tab Export + Drawer Nuovo costo + Modal Condividi

// ─── IVA ────────────────────────────────────────────
function ContIva() {
  const max = Math.max(...IVA_MONTHLY.map(m => Math.max(m.deb, m.cred)));
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 18}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14}}>
          <div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Movimenti IVA — Anno 2025</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>Confronto mensile a debito (in entrata) e a credito (in uscita)</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 14, fontSize: 11.5, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap: 6}}><span style={{width:10, height:10, borderRadius: 3, background: PN.PINK}}/> a debito</span>
            <span style={{display:'inline-flex', alignItems:'center', gap: 6}}><span style={{width:10, height:10, borderRadius: 3, background:'#fbcfe8'}}/> a credito</span>
          </div>
        </div>

        {/* Mini bar chart */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap: 10, alignItems:'end', height: 180, padding:'8px 4px 0'}}>
          {IVA_MONTHLY.map(m => (
            <div key={m.m} style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 6}}>
              <div style={{width:'100%', display:'flex', justifyContent:'center', gap: 3, alignItems:'flex-end', height: 140}}>
                <div title={`Debito €${m.deb}`} style={{width:'42%', height: `${(m.deb/max)*100}%`, background: PN.PINK, borderRadius:'4px 4px 0 0'}}/>
                <div title={`Credito €${m.cred}`} style={{width:'42%', height: `${(m.cred/max)*100}%`, background:'#fbcfe8', borderRadius:'4px 4px 0 0'}}/>
              </div>
              <span style={{fontSize: 11, color: PN.MUTED, fontWeight: 600}}>{m.m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabella mensile */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 18}}>
        <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Tabella mensile</div>
        <div style={{fontSize: 12, color: PN.MUTED, marginBottom: 14}}>Visualizza le contabilità e i relativi saldi</div>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', background: PN.PINK_BG_SOFT, fontSize: 11, fontWeight: 700, color: PN.TEXT, textTransform:'uppercase', letterSpacing: 0.4}}>
            <span>Mese</span><span style={{textAlign:'right'}}>a debito</span><span style={{textAlign:'right'}}>a credito</span><span style={{textAlign:'right'}}>Saldo</span>
          </div>
          {IVA_MONTHLY.map((m,i) => {
            const saldo = m.deb - m.cred;
            return (
              <div key={m.m} style={{
                display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
                padding:'12px 16px', alignItems:'center',
                fontSize: 12.5, color: PN.TEXT,
                borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              }}>
                <span style={{fontWeight: 600}}>{m.m} 2025</span>
                <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {m.deb.toFixed(2)}</span>
                <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {m.cred.toFixed(2)}</span>
                <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700, color: saldo>0 ? '#15803d' : '#dc2626'}}>{saldo>0?'+':''}€ {saldo.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registro per aliquota */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 18}}>
        <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Registro IVA per aliquota</div>
        <div style={{fontSize: 12, color: PN.MUTED, marginBottom: 14}}>Riepilogo delle partite IVA per fascia di aliquota</div>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', background: PN.PINK_BG_SOFT, fontSize: 11, fontWeight: 700, color: PN.TEXT, textTransform:'uppercase', letterSpacing: 0.4}}>
            <span>Aliquota</span><span style={{textAlign:'right'}}>a debito</span><span style={{textAlign:'right'}}>a credito</span><span style={{textAlign:'right'}}>Saldo</span>
          </div>
          {IVA_RATES.map((r,i) => (
            <div key={r.rate} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
              padding:'12px 16px', alignItems:'center',
              fontSize: 12.5, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <span style={{fontWeight: 600}}>{r.rate}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.deb.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.cred.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700}}>€ {(r.deb-r.cred).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT ─────────────────────────────────────────
function ContExport({ openShare }) {
  const [period, setPeriod] = React.useState('ultimo-mese');
  const [files, setFiles] = React.useState({allegati:false, scontrini:true, fatture:false, incassi:true, movimenti:false, fattureA:true, fattureP:false});
  const toggle = (k) => setFiles({...files, [k]: !files[k]});

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap: 16}}>
      <div style={{display:'flex', flexDirection:'column', gap: 16}}>
        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 22}}>
          <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Esporta dati</div>
          <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 4, marginBottom: 18}}>Seleziona il formato e l'intervallo temporale per esportare i dati contabili.</div>

          <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Seleziona periodo</div>
          <div style={{display:'flex', flexWrap:'wrap', gap: 8, marginBottom: 22}}>
            {[['oggi','Oggi'],['ultima-settimana','Ultima settimana'],['ultimo-mese','Ultimo mese'],['custom','Personalizzato']].map(([id,label]) => (
              <button key={id} onClick={() => setPeriod(id)} style={{
                padding:'7px 14px',
                background: period===id ? PN.PINK : PN.WHITE,
                border: `1px solid ${period===id ? PN.PINK : PN.BORDER}`,
                color: period===id ? '#fff' : PN.TEXT,
                borderRadius: 999, fontSize: 12, fontWeight: 600,
                cursor:'pointer', fontFamily:'inherit',
              }}>{label}</button>
            ))}
          </div>

          <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Seleziona i file da esportare</div>
          <div style={{
            background:'#fafafa', border:`1px solid ${PN.BORDER_SOFT}`,
            borderRadius: 12, padding: 14, marginBottom: 22,
            display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10,
          }}>
            <FileCheck label="Allegati" checked={files.allegati} onClick={() => toggle('allegati')}/>
            <FileCheck label="Transazioni e scontrini" checked={files.scontrini} onClick={() => toggle('scontrini')}/>
            <FileCheck label="Fatture PDF" checked={files.fatture} onClick={() => toggle('fatture')}/>
            <FileCheck label="Incassi e ricavi" checked={files.incassi} onClick={() => toggle('incassi')}/>
            <FileCheck label="Movimenti IVA" checked={files.movimenti} onClick={() => toggle('movimenti')}/>
            <FileCheck label="Fatture attive" checked={files.fattureA} onClick={() => toggle('fattureA')}/>
            <FileCheck label="Fatture passive" checked={files.fattureP} onClick={() => toggle('fattureP')}/>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12}}>
            <ExportCard icon="📄" title="Esporta CSV" desc="File separato da virgole" cta="Scarica CSV" onClick={() => {}}/>
            <ExportCard icon="📨" title="Invia a commercialista" desc="Invio al commercialista registrato" cta="Scarica CSV" onClick={openShare}/>
            <ExportCard icon="📑" title="Esporta PDF" desc="Report stampabile completo" cta="Scarica PDF" onClick={() => {}}/>
          </div>
        </div>

        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 22}}>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>File esportati di recente</div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2, marginBottom: 14}}>Gli ultimi 5 export disponibili al download</div>
          {EXPORT_HISTORY.map((f,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 14,
              padding:'12px 14px',
              background: i%2===0 ? '#fafafa' : 'transparent',
              borderRadius: 10,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background:'#fff5f8', color: PN.PINK,
                display:'grid', placeItems:'center', fontSize: 16,
              }}>📄</div>
              <div style={{flex:1}}>
                <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT}}>{f.name}</div>
                <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>{f.date} · {f.size}</div>
              </div>
              <button style={{background:'transparent', border:`1px solid ${PN.BORDER}`, padding: 8, borderRadius: 10, cursor:'pointer', fontSize: 14}}>⬇</button>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar invio automatico */}
      <div style={{display:'flex', flexDirection:'column', gap: 14}}>
        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, padding: 18}}>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 14}}>
            <div style={{width: 36, height: 36, borderRadius: 10, background:'#dcfce7', color:'#15803d', display:'grid', placeItems:'center', fontSize: 16}}>📅</div>
            <div>
              <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>Invio Automatico</div>
              <div style={{fontSize: 11.5, color:'#15803d', fontWeight: 600}}>● Attivo</div>
            </div>
          </div>
          <Row label="Frequenza" value="Mensile"/>
          <Row label="Prossimo invio" value="1 Gen 2026"/>
          <Row label="Destinatario" value="comm@email.it"/>
          <button onClick={openShare} style={{
            width:'100%', marginTop: 10,
            padding:'9px 0', background: PN.PINK, color:'#fff',
            border:'none', borderRadius: 10,
            fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>Modifica impostazioni</button>
        </div>

        <div style={{background:'#fff7ed', border:'1px solid #fed7aa', borderRadius: 14, padding: 16}}>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 6}}>
            <span style={{fontSize: 14}}>💡</span>
            <span style={{fontSize: 12.5, fontWeight: 700, color:'#9a3412'}}>Suggerimento</span>
          </div>
          <div style={{fontSize: 12, color:'#9a3412', lineHeight: 1.5}}>
            Programma l'invio automatico per non dimenticare mai di inviare i dati al tuo commercialista.
          </div>
        </div>
      </div>
    </div>
  );
}

function FileCheck({ label, checked, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: 10,
      padding:'10px 12px',
      background: PN.WHITE, border: `1px solid ${checked ? PN.PINK : PN.BORDER_SOFT}`,
      borderRadius: 10, cursor:'pointer', fontFamily:'inherit',
      textAlign:'left',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5,
        background: checked ? PN.PINK : '#fff',
        border: `1.5px solid ${checked ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center', color:'#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>{checked && '✓'}</div>
      <span style={{fontSize: 12.5, color: PN.TEXT, fontWeight: 500}}>{label}</span>
    </button>
  );
}

function ExportCard({ icon, title, desc, cta, onClick }) {
  return (
    <div style={{
      padding: 16,
      background:'#fafafa',
      border:`1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 12,
      display:'flex', flexDirection:'column', alignItems:'center',
      textAlign:'center',
    }}>
      <div style={{width: 44, height: 44, borderRadius:'50%', background: PN.WHITE, display:'grid', placeItems:'center', fontSize: 18, marginBottom: 10, border:`1px solid ${PN.BORDER}`}}>{icon}</div>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>{title}</div>
      <div style={{fontSize: 11, color: PN.MUTED, lineHeight: 1.4, minHeight: 30, marginBottom: 12}}>{desc}</div>
      <button onClick={onClick} style={{
        padding:'7px 14px', background:'#0F1115', color:'#fff',
        border:'none', borderRadius: 999,
        fontSize: 11.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
      }}>{cta}</button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', fontSize: 12.5}}>
      <span style={{color: PN.MUTED}}>{label}</span>
      <strong style={{color: PN.TEXT, fontWeight: 600}}>{value}</strong>
    </div>
  );
}

// ─── DRAWER NUOVO COSTO ─────────────────────────────
function ContNuovoCosto({ open, onClose }) {
  const [name, setName] = React.useState('');
  const [cat, setCat] = React.useState('affitti');
  const [amount, setAmount] = React.useState('');
  const [type, setType] = React.useState('recurring');
  const [freq, setFreq] = React.useState('Mensile');
  const [date, setDate] = React.useState('');
  const [supplier, setSupplier] = React.useState('');

  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:'absolute', inset: 0, background:'rgba(15,23,42,0.42)', zIndex: 60, display:'flex', justifyContent:'flex-end'}}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, height:'100%', background: PN.WHITE,
        boxShadow:'-12px 0 40px rgba(0,0,0,0.18)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Nuovo costo</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>Aggiungi una spesa periodica o una tantum</div>
          </div>
          <button onClick={onClose} style={{background:'transparent', border:'none', fontSize: 18, color: PN.MUTED, cursor:'pointer'}}>✕</button>
        </div>
        <div className="pn-scroll" style={{flex: 1, overflowY:'auto', padding: 22}}>
          <Field label="Nome del costo*">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Es. Affitto locale" style={inp}/>
          </Field>
          <Field label="Categoria*">
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
              {COST_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)} style={{
                  display:'flex', alignItems:'center', gap: 10,
                  padding:'10px 12px',
                  background: cat===c.id ? c.color : PN.WHITE,
                  border:`1px solid ${cat===c.id ? c.dark : PN.BORDER}`,
                  borderRadius: 10, cursor:'pointer', fontFamily:'inherit',
                  textAlign:'left',
                }}>
                  <span style={{fontSize: 16}}>{c.icon}</span>
                  <span style={{fontSize: 12.5, fontWeight: 600, color: cat===c.id ? c.dark : PN.TEXT}}>{c.label}</span>
                </button>
              ))}
            </div>
          </Field>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
            <Field label="Importo (€)*">
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" type="number" style={inp}/>
            </Field>
            <Field label="Fornitore">
              <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Es. Enel" style={inp}/>
            </Field>
          </div>
          <Field label="Tipo*">
            <div style={{display:'flex', gap: 8}}>
              <TypeBtn active={type==='recurring'} onClick={() => setType('recurring')} icon="🔄" label="Ricorrente" desc="Si ripete ogni…"/>
              <TypeBtn active={type==='one-off'} onClick={() => setType('one-off')} icon="📌" label="Una tantum" desc="Pagamento singolo"/>
            </div>
          </Field>
          {type==='recurring' && (
            <Field label="Frequenza">
              <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
                {['Settimanale','Mensile','Bimestrale','Trimestrale','Annuale'].map(f => (
                  <button key={f} onClick={() => setFreq(f)} style={{
                    padding:'7px 14px',
                    background: freq===f ? PN.PINK_BG_SOFT : PN.WHITE,
                    border:`1px solid ${freq===f ? PN.PINK : PN.BORDER}`,
                    color: freq===f ? PN.PINK_DARK : PN.TEXT,
                    borderRadius: 999, fontSize: 12, fontWeight: 600,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>{f}</button>
                ))}
              </div>
            </Field>
          )}
          <Field label={type==='recurring' ? 'Prossima scadenza' : 'Data scadenza'}>
            <input value={date} onChange={e => setDate(e.target.value)} type="date" style={inp}/>
          </Field>
          <Field label="Allegato (opzionale)">
            <button style={{
              width:'100%', padding:'14px 16px',
              background:'#fafafa', border:`1.5px dashed ${PN.BORDER}`, borderRadius: 10,
              fontSize: 12, color: PN.MUTED, cursor:'pointer', fontFamily:'inherit',
            }}>📎 Trascina un file PDF o clicca per selezionare</button>
          </Field>
        </div>
        <div style={{padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'9px 16px', background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
          <button onClick={onClose} disabled={!name||!amount} style={{
            padding:'9px 18px',
            background: (!name||!amount) ? '#f0a8c0' : PN.PINK,
            color:'#fff', border:'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700, fontFamily:'inherit',
            cursor: (!name||!amount) ? 'not-allowed' : 'pointer',
          }}>Salva costo</button>
        </div>
      </div>
    </div>
  );
}

const inp = {
  width:'100%', padding:'9px 12px',
  border:`1px solid ${PN.BORDER}`, borderRadius: 10,
  fontSize: 13, fontFamily:'inherit', outline:'none',
  background: PN.WHITE,
};
function Field({ label, children }) {
  return (
    <div style={{marginBottom: 14}}>
      <div style={{fontSize: 12, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>{label}</div>
      {children}
    </div>
  );
}
function TypeBtn({ active, onClick, icon, label, desc }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'12px 14px',
      background: active ? PN.PINK_BG_SOFT : PN.WHITE,
      border:`1px solid ${active ? PN.PINK : PN.BORDER}`,
      borderRadius: 10, cursor:'pointer', fontFamily:'inherit',
      textAlign:'left', display:'flex', alignItems:'center', gap: 10,
    }}>
      <span style={{fontSize: 18}}>{icon}</span>
      <div>
        <div style={{fontSize: 13, fontWeight: 700, color: active ? PN.PINK_DARK : PN.TEXT}}>{label}</div>
        <div style={{fontSize: 11, color: PN.MUTED, marginTop: 2}}>{desc}</div>
      </div>
    </button>
  );
}

// ─── MODAL CONDIVIDI ────────────────────────────────
function ContShareModal({ open, onClose }) {
  const [email, setEmail] = React.useState('');
  const [files, setFiles] = React.useState({allegati:false, scontrini:true, fatture:false, incassi:false, fatturePdf:true, movimenti:false, fattureA:true, fattureP:true});
  const [auto, setAuto] = React.useState(false);
  if (!open) return null;
  const toggle = (k) => setFiles({...files, [k]: !files[k]});
  return (
    <div onClick={onClose} style={{position:'absolute', inset: 0, background:'rgba(15,23,42,0.42)', zIndex: 60, display:'grid', placeItems:'center', padding: 24}}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16, width: 520,
        boxShadow:'0 24px 60px rgba(0,0,0,0.2)', overflow:'hidden',
      }}>
        <div style={{padding:'16px 20px', background:'linear-gradient(135deg, #831843, #be185d)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <span style={{fontSize: 18}}>✈</span>
            <div>
              <div style={{fontSize: 14, fontWeight: 700}}>Condividi Export</div>
              <div style={{fontSize: 11.5, opacity: 0.85, marginTop: 2}}>Invia i dati al tuo commercialista</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.18)', border:'none', borderRadius:'50%', width: 28, height: 28, color:'#fff', cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding: 20}}>
          <Field label="Email commercialista">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="esempio@commercialista.it" style={inp}/>
            <div style={{fontSize: 11, color: PN.MUTED, marginTop: 6}}>Il file verrà inviato in modo sicuro all'indirizzo indicato.</div>
          </Field>
          <div style={{fontSize: 12, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Seleziona i file da inviare</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 16}}>
            <FileCheck label="Allegati" checked={files.allegati} onClick={() => toggle('allegati')}/>
            <FileCheck label="Fatture" checked={files.fatture} onClick={() => toggle('fatture')}/>
            <FileCheck label="Transazioni e scontrini" checked={files.scontrini} onClick={() => toggle('scontrini')}/>
            <FileCheck label="Fatture PDF" checked={files.fatturePdf} onClick={() => toggle('fatturePdf')}/>
            <FileCheck label="Incassi e ricavi" checked={files.incassi} onClick={() => toggle('incassi')}/>
            <FileCheck label="Movimenti IVA" checked={files.movimenti} onClick={() => toggle('movimenti')}/>
            <FileCheck label="Fatture attive" checked={files.fattureA} onClick={() => toggle('fattureA')}/>
            <FileCheck label="Fatture passive" checked={files.fattureP} onClick={() => toggle('fattureP')}/>
          </div>
          <button onClick={() => setAuto(!auto)} style={{
            width:'100%', display:'flex', alignItems:'center', gap: 12,
            padding: 12,
            background: auto ? PN.PINK_BG_SOFT : '#fafafa',
            border:`1px solid ${auto ? PN.PINK : PN.BORDER_SOFT}`,
            borderRadius: 12, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
          }}>
            <div style={{
              width: 38, height: 22, borderRadius: 999,
              background: auto ? PN.PINK : '#d1d5db',
              position:'relative', flexShrink: 0,
              transition: 'background 0.15s',
            }}>
              <div style={{
                position:'absolute', top: 2,
                left: auto ? 18 : 2,
                width: 18, height: 18, borderRadius:'50%',
                background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.15s',
              }}/>
            </div>
            <div>
              <div style={{fontSize: 13, fontWeight: 700, color: auto ? PN.PINK_DARK : PN.TEXT}}>Programma invio periodico</div>
              <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>Invia automaticamente gli export al commercialista con cadenza regolare</div>
            </div>
          </button>
        </div>
        <div style={{padding:'14px 20px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'9px 22px', background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: 999, fontSize: 13, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
          <button onClick={onClose} style={{padding:'9px 26px', background:'#0F1115', color:'#fff', border:'none', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Salva</button>
        </div>
      </div>
    </div>
  );
}

window.ContIva = ContIva;
window.ContExport = ContExport;
window.ContNuovoCosto = ContNuovoCosto;
window.ContShareModal = ContShareModal;

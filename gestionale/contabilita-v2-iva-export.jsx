// Tab IVA v2 + Tab Export v2 + Drawer Nuovo costo + Modal Condividi
// Modifiche: bar chart interattivo, ExportCard differenziate, header modal neutro,
// disabled state corretto, icone SVG ovunque.

// ─── IVA ────────────────────────────────────────────
function ContIva({ month, setMonth }) {
  const max = Math.max(...IVA_MONTHLY.map(m => Math.max(m.deb, m.cred)));
  const selected = month != null ? IVA_MONTHLY[month] : null;
  const filteredRates = IVA_RATES; // (placeholder: in app reale filtrerebbe per mese)

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Chart card */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14, flexWrap:'wrap', gap: 12}}>
          <div>
            <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Movimenti IVA · 2026</div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>
              {selected
                ? <><strong style={{color: PN.TEXT}}>{selected.m} 2026</strong> · saldo <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€ {(selected.deb-selected.cred).toFixed(2)}</strong> · <button onClick={() => setMonth(null)} style={{background:'none', border:'none', color: PN.PINK, cursor:'pointer', fontWeight:600, padding:0, fontFamily:'inherit', fontSize: C.T_SM}}>Rimuovi filtro</button></>
                : 'Seleziona un mese per vederne il dettaglio'}
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 14, fontSize: C.T_XS, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap: 6}}><span style={{width:10, height:10, borderRadius: 3, background: PN.PINK}}/> IVA a debito</span>
            <span style={{display:'inline-flex', alignItems:'center', gap: 6}}><span style={{width:10, height:10, borderRadius: 3, background: PN.PINK_SOFT, border:`1px solid ${PN.PINK}`}}/> IVA a credito</span>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap: 8, alignItems:'end', height: 200, padding:'8px 4px 0'}}>
          {IVA_MONTHLY.map((m,i) => {
            const isSel = month === i;
            const isDim = month != null && !isSel;
            return (
              <button key={m.m} onClick={() => setMonth(isSel ? null : i)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap: 6,
                background:'transparent', border:'none', cursor:'pointer',
                padding: '4px 2px', borderRadius: C.R_SM,
                opacity: isDim ? 0.35 : 1,
                transition:'opacity 0.15s, background 0.15s',
                fontFamily:'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.SURF_ALT}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{position:'relative', width:'100%', display:'flex', justifyContent:'center', gap: 3, alignItems:'flex-end', height: 150}}>
                  <div style={{
                    width:'42%', height: `${(m.deb/max)*100}%`,
                    background: PN.PINK, borderRadius:'4px 4px 0 0',
                    boxShadow: isSel ? `0 0 0 2px ${PN.PINK}` : 'none',
                  }}/>
                  <div style={{
                    width:'42%', height: `${(m.cred/max)*100}%`,
                    background: PN.PINK_SOFT, border:`1px solid ${PN.PINK}`, borderRadius:'4px 4px 0 0',
                    boxShadow: isSel ? `0 0 0 2px ${PN.PINK_DARK}` : 'none',
                  }}/>
                  {isSel && (
                    <div style={{
                      position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)',
                      background: PN.TEXT, color:'#fff',
                      padding:'5px 9px', borderRadius: 6, marginBottom: 6,
                      fontSize: 12.5, fontWeight: 600, whiteSpace:'nowrap',
                      fontVariantNumeric:'tabular-nums',
                    }}>
                      D €{m.deb} · C €{m.cred}
                    </div>
                  )}
                </div>
                <span style={{fontSize: C.T_XS, color: isSel ? PN.TEXT : PN.MUTED, fontWeight: isSel ? 700 : 600}}>{m.m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabella mensile */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Tabella mensile</div>
        <div style={{fontSize: C.T_SM, color: PN.MUTED, marginBottom: 14}}>
          {month != null ? `Filtrato per ${IVA_MONTHLY[month].m} 2026` : 'Visualizza le contabilità e i relativi saldi'}
        </div>
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', background: C.TH_BG, fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT, textTransform:'uppercase', letterSpacing: 0.5}}>
            <span>Mese</span><span style={{textAlign:'right'}}>Debito</span><span style={{textAlign:'right'}}>Credito</span><span style={{textAlign:'right'}}>Saldo</span>
          </div>
          <MaxRowsScroll maxRows={10}>
          {(month != null ? [IVA_MONTHLY[month]] : IVA_MONTHLY).map((m,i) => {
            const saldo = m.deb - m.cred;
            return (
              <div key={m.m}
                onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                style={{
                display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
                padding:'12px 16px', alignItems:'center',
                fontSize: C.T_SM, color: PN.TEXT,
                borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                transition:'background 120ms ease',
              }}>
                <span style={{fontWeight: 600}}>{m.m} 2026</span>
                <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {m.deb.toFixed(2)}</span>
                <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {m.cred.toFixed(2)}</span>
                <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700, color: saldo>0 ? PN.GREEN : PN.RED}}>{saldo>0?'+':''}€ {saldo.toFixed(2)}</span>
              </div>
            );
          })}
          </MaxRowsScroll>
        </div>
      </div>

      {/* Registro per aliquota */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Registro IVA per aliquota</div>
        <div style={{fontSize: C.T_SM, color: PN.MUTED, marginBottom: 14}}>Riepilogo delle partite IVA per fascia di aliquota</div>
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 16px', background: C.TH_BG, fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT, textTransform:'uppercase', letterSpacing: 0.5}}>
            <span>Aliquota</span><span style={{textAlign:'right'}}>Debito</span><span style={{textAlign:'right'}}>Credito</span><span style={{textAlign:'right'}}>Saldo</span>
          </div>
          <MaxRowsScroll maxRows={10}>
          {filteredRates.map((r,i) => (
            <div key={r.rate}
              onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
              padding:'12px 16px', alignItems:'center',
              fontSize: C.T_SM, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              transition:'background 120ms ease',
            }}>
              <span style={{fontWeight: 600}}>{r.rate}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.deb.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.cred.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700}}>€ {(r.deb-r.cred).toFixed(2)}</span>
            </div>
          ))}
          </MaxRowsScroll>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT ─────────────────────────────────────────
function ContExport({ openShare }) {
  const [period, setPeriod] = React.useState('ultimo-mese');
  const [files, setFiles] = React.useState({scontrini:true, incassi:true, movimenti:false});
  const toggle = (k) => setFiles({...files, [k]: !files[k]});

  return (
    <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap: 16}}>
      <div style={{display:'flex', flexDirection:'column', gap: 16}}>
        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 22}}>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Esporta dati contabili</div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 4, marginBottom: 18}}>Scegli il periodo e i file da esportare.</div>

          <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Periodo</div>
          <div style={{display:'flex', flexWrap:'wrap', gap: 8, marginBottom: 22}}>
            {[['oggi','Oggi'],['ultima-settimana','Ultima settimana'],['ultimo-mese','Ultimo mese'],['custom','Personalizzato']].map(([id,label]) => (
              <FilterChip key={id} active={period===id} onClick={() => setPeriod(id)} label={label}/>
            ))}
          </div>

          <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>File da esportare</div>
          <div style={{
            background: C.SURF, border:`1px solid ${PN.BORDER_SOFT}`,
            borderRadius: C.R_MD, padding: 14, marginBottom: 22,
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 10,
          }}>
            <FileCheck label="Transazioni e scontrini" checked={files.scontrini} onClick={() => toggle('scontrini')}/>
            <FileCheck label="Incassi e ricavi" checked={files.incassi} onClick={() => toggle('incassi')}/>
            <FileCheck label="Movimenti IVA" checked={files.movimenti} onClick={() => toggle('movimenti')}/>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12}}>
            <ExportCard variant="secondary" icon={Ic.fileCsv} title="Scarica in CSV" desc="Compatibile con Excel" cta="Scarica CSV" ctaIcon={Ic.download} onClick={() => {}}/>
            <ExportCard variant="primary"   icon={Ic.send}    title="Invia al commercialista" desc="Invio diretto via email" cta="Invia ora" ctaIcon={Ic.send} onClick={openShare}/>
            <ExportCard variant="secondary" icon={Ic.filePdf} title="Scarica in PDF" desc="Report completo pronto da stampare" cta="Scarica PDF" ctaIcon={Ic.download} onClick={() => {}}/>
          </div>
        </div>

        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 22}}>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Export recenti</div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2, marginBottom: 14}}>Gli ultimi 5 export disponibili al download</div>
          <MaxRowsScroll maxRows={10}>
          {EXPORT_HISTORY.map((f,i) => (
            <div key={i}
              onMouseEnter={e => { e.currentTarget.style.background = '#EEF0F4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = i%2===0 ? C.SURF : 'transparent'; }}
              style={{
              display:'flex', alignItems:'center', gap: 14,
              padding:'12px 14px',
              background: i%2===0 ? C.SURF : 'transparent',
              borderRadius: C.R_SM,
              transition:'background 120ms ease',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: C.R_SM,
                background: PN.PINK_BG_SOFT, color: PN.PINK_DARK,
                display:'grid', placeItems:'center',
              }}><Ic.invoice size={18}/></div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{f.name}</div>
                <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2}}>{f.date} · {f.size}</div>
              </div>
              <button style={iconOnlyBtn}><Ic.download size={14}/></button>
            </div>
          ))}
          </MaxRowsScroll>
        </div>
      </div>

      {/* Sidebar invio automatico */}
      <div style={{display:'flex', flexDirection:'column', gap: 14}}>
        <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 18}}>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 14}}>
            <div style={{width: 36, height: 36, borderRadius: C.R_SM, background: PN.GREEN_SOFT, color: PN.GREEN, display:'grid', placeItems:'center'}}><Ic.calendar size={18}/></div>
            <div>
              <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT}}>Invio automatico</div>
              <div style={{fontSize: C.T_XS, color: PN.GREEN, fontWeight: 600, display:'inline-flex', alignItems:'center', gap: 5}}>
                <span style={{width:6, height:6, borderRadius:'50%', background: PN.GREEN}}/> Attivo
              </div>
            </div>
          </div>
          <Row label="Frequenza" value="Mensile"/>
          <Row label="Prossimo invio" value={(() => { const d = new Date(); d.setMonth(d.getMonth()+1, 1); const M = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']; return `1 ${M[d.getMonth()]} ${d.getFullYear()}`; })()}/>
          <Row label="Destinatario" value="comm@email.it"/>
          <button onClick={openShare}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
            width:'100%', marginTop: 10,
            padding:'10px 0', background: PN.WHITE, color: PN.TEXT,
            border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            transition:'background 130ms ease, border-color 130ms ease, transform 120ms ease',
          }}>Modifica</button>
        </div>

        <div style={{background:'#FFFBEB', border:`1px solid ${PN.AMBER_SOFT}`, borderRadius: C.R_MD, padding: 16}}>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 6, color:'#92400E'}}>
            <Ic.bulb size={14}/>
            <span style={{fontSize: C.T_SM, fontWeight: 700}}>Suggerimento</span>
          </div>
          <div style={{fontSize: C.T_XS, color:'#78350F', lineHeight: 1.5}}>
            Con l'invio automatico i dati arrivano al commercialista ogni mese, senza che tu debba ricordartene.
          </div>
        </div>
      </div>
    </div>
  );
}

function FileCheck({ label, checked, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
      display:'flex', alignItems:'center', gap: 10,
      padding:'10px 12px',
      background: hover ? '#FFF9F9' : PN.WHITE,
      border: `1px solid ${checked || hover ? PN.PINK : PN.BORDER_SOFT}`,
      borderRadius: C.R_SM, cursor:'pointer', fontFamily:'inherit',
      textAlign:'left',
      transform: pressed ? 'scale(0.97)' : hover ? 'scale(1.02)' : 'scale(1)',
      boxShadow: hover ? '0 4px 12px rgba(15, 17, 21, 0.08)' : 'none',
      transition: 'transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), background 140ms ease, border-color 140ms ease, box-shadow 150ms ease',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5,
        background: checked ? PN.PINK : '#fff',
        border: `1.5px solid ${checked ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center', color:'#fff', flexShrink: 0,
      }}>{checked && <Ic.check size={11} stroke={3}/>}</div>
      <span style={{fontSize: C.T_SM, color: PN.TEXT, fontWeight: 500}}>{label}</span>
    </button>
  );
}

// ExportCard differenziata: variant="primary" per azione "pesante" (invia)
function ExportCard({ variant, icon: I, title, desc, cta, ctaIcon: Ci, onClick }) {
  const isPrimary = variant === 'primary';
  return (
    <div style={{
      padding: 18,
      background: isPrimary ? PN.PINK_BG_SOFT : C.SURF,
      border:`1px solid ${isPrimary ? PN.PINK_SOFT : PN.BORDER_SOFT}`,
      borderRadius: C.R_MD,
      display:'flex', flexDirection:'column', alignItems:'center',
      textAlign:'center', position:'relative',
    }}>
      {isPrimary && (
        <span style={{
          position:'absolute', top: 10, right: 10,
          fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5,
          background: PN.PINK, color:'#fff',
          padding:'2px 7px', borderRadius: C.R_PILL, textTransform:'uppercase',
        }}>Consigliato</span>
      )}
      <div style={{
        width: 48, height: 48, borderRadius:'50%',
        background: isPrimary ? PN.PINK : PN.WHITE,
        color: isPrimary ? '#fff' : PN.TEXT,
        display:'grid', placeItems:'center', marginBottom: 12,
        border: isPrimary ? 'none' : `1px solid ${PN.BORDER}`,
      }}><I size={20}/></div>
      <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>{title}</div>
      <div style={{fontSize: C.T_XS, color: PN.MUTED, lineHeight: 1.4, minHeight: 30, marginBottom: 12}}>{desc}</div>
      <button onClick={onClick} style={{
        padding:'8px 16px',
        background: isPrimary ? PN.PINK : PN.TEXT,
        color:'#fff', border:'none', borderRadius: C.R_PILL,
        fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap: 6,
      }}><Ci size={12}/> {cta}</button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', fontSize: C.T_SM}}>
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

  const catMeta = {
    affitti:   { icon: Ic.home,    bg:'#FEF3C7', fg:'#92400E' },
    personale: { icon: Ic.users,   bg:'#DBEAFE', fg:'#1E40AF' },
    materie:   { icon: Ic.package, bg:'#FECACA', fg:'#991B1B' },
    servizi:   { icon: Ic.tools,   bg:'#E0E7FF', fg:'#3730A3' },
    altro:     { icon: Ic.list,    bg:'#E5E7EB', fg:'#374151' },
  };

  const isValid = name && amount;

  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)', zIndex: 60, display:'flex', justifyContent:'flex-end'}}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, maxWidth:'100%', height:'100%', background: PN.WHITE,
        boxShadow:'-12px 0 40px rgba(0,0,0,0.18)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Aggiungi costo</div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>Registra una spesa ricorrente o un pagamento singolo</div>
          </div>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.color = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer', display:'flex', padding: 6, borderRadius: 8, transition:'background 130ms ease, color 130ms ease, transform 120ms ease'}}><Ic.close size={18}/></button>
        </div>
        <div className="pn-scroll" style={{flex: 1, overflowY:'auto', padding: 22}}>
          <Field label="Nome del costo">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Es. Affitto locale" style={inp}/>
          </Field>
          <Field label="Categoria">
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
              {COST_CATEGORIES.map(c => {
                const m = catMeta[c.id];
                const I = m.icon;
                const active = cat===c.id;
                return (
                  <button key={c.id} onClick={() => setCat(c.id)} style={{
                    display:'flex', alignItems:'center', gap: 10,
                    padding:'10px 12px',
                    background: active ? m.bg : PN.WHITE,
                    border:`1px solid ${active ? m.fg : PN.BORDER}`,
                    borderRadius: C.R_SM, cursor:'pointer', fontFamily:'inherit',
                    textAlign:'left',
                  }}>
                    <span style={{color: m.fg, display:'flex'}}><I size={16}/></span>
                    <span style={{fontSize: C.T_SM, fontWeight: 600, color: active ? m.fg : PN.TEXT}}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
            <Field label="Importo (€)">
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" type="number" style={inp}/>
            </Field>
            <Field label="Fornitore">
              <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Es. Enel" style={inp}/>
            </Field>
          </div>
          <Field label="Tipo">
            <div style={{display:'flex', gap: 8}}>
              <TypeBtn active={type==='recurring'} onClick={() => setType('recurring')} icon={Ic.recurring} label="Ricorrente" desc="Si ripete ogni…"/>
              <TypeBtn active={type==='one-off'}   onClick={() => setType('one-off')}   icon={Ic.pin}       label="Pagamento unico" desc="Unico addebito"/>
            </div>
          </Field>
          {type==='recurring' && (
            <Field label="Frequenza">
              <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
                {['Settimanale','Mensile','Bimestrale','Trimestrale','Annuale'].map(f => (
                  <FilterChip key={f} active={freq===f} onClick={() => setFreq(f)} label={f}/>
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
              background: C.SURF, border:`1.5px dashed ${PN.BORDER}`, borderRadius: C.R_SM,
              fontSize: C.T_SM, color: PN.MUTED, cursor:'pointer', fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
            }}><Ic.paperclip size={14}/> Trascina un PDF qui, o clicca per sceglierlo</button>
          </Field>
        </div>
        <div style={{padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit', transition:'background 130ms ease, border-color 130ms ease, transform 120ms ease'}}>Annulla</button>
          <button onClick={onClose} disabled={!isValid} style={{
            padding:'10px 20px',
            background: isValid ? PN.PINK : '#E5E7EB',
            color: isValid ? '#fff' : PN.MUTED_SOFT,
            border:'none', borderRadius: C.R_SM,
            fontSize: C.T_SM, fontWeight: 700, fontFamily:'inherit',
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}>Salva costo</button>
        </div>
      </div>
    </div>
  );
}

const inp = {
  width:'100%', padding:'10px 12px',
  border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
  fontSize: C.T_SM, fontFamily:'inherit', outline:'none',
  background: PN.WHITE,
};
function Field({ label, children }) {
  return (
    <div style={{marginBottom: 14}}>
      <div style={{fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>{label}</div>
      {children}
    </div>
  );
}
function TypeBtn({ active, onClick, icon: I, label, desc }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'12px 14px',
      background: active ? PN.PINK_BG_SOFT : PN.WHITE,
      border:`1px solid ${active ? PN.PINK : PN.BORDER}`,
      borderRadius: C.R_SM, cursor:'pointer', fontFamily:'inherit',
      textAlign:'left', display:'flex', alignItems:'center', gap: 10,
    }}>
      <span style={{color: active ? PN.PINK_DARK : PN.MUTED, display:'flex'}}><I size={18}/></span>
      <div>
        <div style={{fontSize: C.T_SM, fontWeight: 700, color: active ? PN.PINK_DARK : PN.TEXT}}>{label}</div>
        <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2}}>{desc}</div>
      </div>
    </button>
  );
}

// ─── MODAL CONDIVIDI — header neutro ────────────────
function ContShareModal({ open, onClose }) {
  const [email, setEmail] = React.useState('');
  const [files, setFiles] = React.useState({scontrini:true, incassi:false, movimenti:false});
  const [auto, setAuto] = React.useState(false);
  if (!open) return null;
  const toggle = (k) => setFiles({...files, [k]: !files[k]});
  return (
    <div onClick={onClose} style={{position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)', zIndex: 60, display:'grid', placeItems:'center', padding: 24}}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 480, maxWidth:'100%',
        overflow:'hidden',
      }}>
        {/* Header neutro */}
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12}}>
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <div style={{width: 36, height: 36, borderRadius: C.R_SM, background: C.SURF_ALT, color: PN.TEXT, display:'grid', placeItems:'center'}}>
              <Ic.send size={16}/>
            </div>
            <div>
              <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Invia al commercialista</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2}}>Invia i dati contabili via email</div>
            </div>
          </div>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.color = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer', display:'flex', padding: 6, borderRadius: 8, transition:'background 130ms ease, color 130ms ease, transform 120ms ease'}}><Ic.close size={18}/></button>
        </div>
        <div style={{padding: 22}}>
          <Field label="Destinatario · Email del commercialista">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="es. studio.rossi@email.it" style={inp}/>
            <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 6}}>Il file viene inviato in modo sicuro.</div>
          </Field>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Seleziona i file da inviare</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 16}}>
            <FileCheck label="Transazioni e scontrini" checked={files.scontrini} onClick={() => toggle('scontrini')}/>
            <FileCheck label="Incassi e ricavi" checked={files.incassi} onClick={() => toggle('incassi')}/>
            <FileCheck label="Movimenti IVA" checked={files.movimenti} onClick={() => toggle('movimenti')}/>
          </div>
          <button onClick={() => setAuto(!auto)} style={{
            width:'100%', display:'flex', alignItems:'center', gap: 12,
            padding: 12,
            background: auto ? PN.PINK_BG_SOFT : C.SURF,
            border:`1px solid ${auto ? PN.PINK : PN.BORDER_SOFT}`,
            borderRadius: C.R_MD, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
          }}>
            <div style={{
              width: 38, height: 22, borderRadius: C.R_PILL,
              background: auto ? PN.PINK : '#D1D5DB',
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
            <div style={{flex: 1}}>
              <div style={{fontSize: C.T_SM, fontWeight: 700, color: auto ? PN.PINK_DARK : PN.TEXT}}>Attiva invio automatico mensile</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2}}>
                {auto
                  ? <>Verrà inviato automaticamente <strong style={{color: PN.PINK_DARK}}>ogni 1° del mese</strong> all'email indicata</>
                  : 'Invia l\'export ogni mese senza doverci pensare'}
              </div>
            </div>
          </button>
        </div>
        <div style={{padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit', transition:'background 130ms ease, border-color 130ms ease, transform 120ms ease'}}>Annulla</button>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 90, 95, 0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{padding:'10px 22px', background: PN.PINK, color:'#fff', border:'none', borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6, transition:'filter 130ms ease, box-shadow 150ms ease, transform 120ms ease'}}><Ic.send size={13}/> Invia ora</button>
        </div>
      </div>
    </div>
  );
}

window.ContIva = ContIva;
window.ContExport = ContExport;
window.ContNuovoCosto = ContNuovoCosto;
window.ContShareModal = ContShareModal;

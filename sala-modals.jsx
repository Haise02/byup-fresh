// Sala — Modali (aggiungi articolo, conti aperti, pagamento, nuova prenotazione)

function SalaModalAggiungi({ open, onClose, tavolo }) {
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('Tutti i piatti');
  const cats = ['Tutti i piatti','Antipasti','Primi piatti','Secondi'];

  return (
    <PnModal open={open} onClose={onClose}
      title={`Aggiungi articolo · Tavolo ${tavolo?.id ?? ''}`}
      width={760}
      footer={(
        <>
          <PnButton variant="ghost">Annulla</PnButton>
          <PnButton variant="primary">Conferma ordine</PnButton>
        </>
      )}
    >
      <div style={{display:'flex', gap: 10, marginBottom: 14}}>
        <PnSearchInput value={search} onChange={setSearch} placeholder="Cerca piatto"/>
        <SaSelect value={cat} onChange={setCat} options={cats}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        {SALA_VENDITA_PIATTI.slice(0, 6).map(p => (
          <SaPiattoCard key={p.id} p={p} qty={0} onAdd={()=>{}} onRem={()=>{}}/>
        ))}
      </div>
    </PnModal>
  );
}

function SalaModalConti({ open, onClose }) {
  return (
    <PnModal open={open} onClose={onClose} title="Conti aperti" width={720}>
      <div style={{
        border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, overflow:'hidden',
      }}>
        <div style={{
          display:'grid', gridTemplateColumns:'80px 110px 1fr 110px 130px 110px',
          padding:'10px 14px',
          background: PN.PINK_SOFT,
          fontSize: 12, fontWeight: 700, color: PN.TEXT,
        }}>
          <span>Tavolo</span><span>Liberato</span><span>Cliente</span>
          <span>Tot. Tavolo</span><span>Tot. da saldare</span><span style={{textAlign:'right'}}>Azione</span>
        </div>
        {SALA_CONTI_APERTI.map((c, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'80px 110px 1fr 110px 130px 110px',
            padding:'12px 14px', alignItems:'center',
            borderTop: `1px solid ${PN.BORDER_SOFT}`,
            fontSize: 13, color: PN.TEXT,
          }}>
            <span style={{fontWeight: 700}}>{c.tavolo}</span>
            <span>{c.liberato}</span>
            <span>{c.cliente}</span>
            <span>€{c.totTavolo.toFixed(2)}</span>
            <span style={{color: PN.PINK_DARK, fontWeight: 700}}>€{c.daSaldare.toFixed(2)}</span>
            <button style={{
              padding:'6px 14px', borderRadius: 999,
              background: PN.TEXT, color: PN.WHITE, border:'none',
              fontSize: 12, fontWeight: 600, cursor:'pointer',
              fontFamily:'inherit', marginLeft:'auto',
            }}>Chiudi</button>
          </div>
        ))}
      </div>
    </PnModal>
  );
}

function SalaModalPagamento({ open, onClose, tavolo }) {
  const [method, setMethod] = React.useState('Carta');
  const subtot = 84.00, coperto = 6.00, mancia = 5, total = subtot + coperto + mancia;
  return (
    <PnModal open={open} onClose={onClose}
      title={`Pagamento · Tavolo ${tavolo?.id ?? ''}`} width={520}
      footer={(
        <>
          <PnButton variant="ghost">Annulla</PnButton>
          <PnButton variant="primary">Incassa €{total.toFixed(2)}</PnButton>
        </>
      )}
    >
      <div style={{display:'flex', flexDirection:'column', gap: 8, marginBottom: 16}}>
        <SaRow l="Subtotale" v={`€${subtot.toFixed(2)}`}/>
        <SaRow l="Coperto" v={`€${coperto.toFixed(2)}`}/>
        <SaRow l="Mancia" v={`€${mancia.toFixed(2)}`}/>
        <div style={{
          display:'flex', justifyContent:'space-between',
          fontSize: 15, fontWeight: 800, color: PN.TEXT,
          paddingTop: 10, borderTop: `1px dashed ${PN.BORDER}`,
        }}>
          <span>Totale</span><span>€{total.toFixed(2)}</span>
        </div>
      </div>
      <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, marginBottom: 8}}>METODO</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
        {['Carta','Contanti','byup'].map(m => {
          const on = method === m;
          return (
            <button key={m} onClick={() => setMethod(m)} style={{
              padding: '12px 10px', borderRadius: 10,
              background: on ? PN.PINK_DARK : PN.WHITE,
              color: on ? PN.WHITE : PN.TEXT,
              border: on ? 'none' : `1px solid ${PN.BORDER}`,
              fontSize: 13, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>{m}</button>
          );
        })}
      </div>
    </PnModal>
  );
}

function SalaModalNuova({ open, onClose }) {
  return (
    <PnModal open={open} onClose={onClose} title="Nuova prenotazione" width={520}
      footer={(
        <>
          <PnButton variant="ghost">Annulla</PnButton>
          <PnButton variant="primary">Conferma</PnButton>
        </>
      )}
    >
      <div style={{display:'flex', flexDirection:'column', gap: 12}}>
        <SaField label="Nome cliente"><SaInput placeholder="Mario Rossi"/></SaField>
        <SaField label="Telefono"><SaInput placeholder="+39 ..."/></SaField>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10}}>
          <SaField label="Data"><SaInput placeholder="9 dic"/></SaField>
          <SaField label="Ora"><SaInput placeholder="20:30"/></SaField>
          <SaField label="Coperti"><SaInput placeholder="4"/></SaField>
        </div>
        <SaField label="Tavolo (opzionale)"><SaInput placeholder="Auto"/></SaField>
        <SaField label="Note"><SaInput placeholder="Allergie, occasione..."/></SaField>
      </div>
    </PnModal>
  );
}

function SaField({ label, children }) {
  return (
    <label style={{display:'flex', flexDirection:'column', gap: 6}}>
      <span style={{fontSize: 11.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4}}>{label}</span>
      {children}
    </label>
  );
}
function SaInput({ placeholder }) {
  return (
    <input placeholder={placeholder} style={{
      padding:'10px 12px', borderRadius: 10,
      border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
      fontSize: 13, color: PN.TEXT, fontFamily:'inherit',
      outline:'none',
    }}/>
  );
}

window.SalaModalAggiungi = SalaModalAggiungi;
window.SalaModalConti = SalaModalConti;
window.SalaModalPagamento = SalaModalPagamento;
window.SalaModalNuova = SalaModalNuova;

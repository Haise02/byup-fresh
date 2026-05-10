// Account — Tab Account e fatturazione

function AccFatturazione() {
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <AcCard title="Metodo di pagamento" subtitle="Carta usata per gli addebiti mensili.">
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: 16, borderRadius: 12,
          background:'#FAFBFC', border:`1px solid ${PN.BORDER}`,
        }}>
          <div style={{
            width: 48, height: 32, borderRadius: 6,
            background:`linear-gradient(135deg, #1A1F71, #4A5BD8)`,
            display:'grid', placeItems:'center',
            color: PN.WHITE, fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
          }}>VISA</div>
          <div style={{flex:1}}>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>•••• •••• •••• 4242</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>Scade 09/27 · Mario Rossi</div>
          </div>
          <button style={AcBtnGhost}>Modifica</button>
          <button style={{...AcBtnGhost, color: PN.RED, borderColor: PN.RED}}>Rimuovi</button>
        </div>
        <button style={{
          marginTop: 14,
          padding:'10px 18px', borderRadius: 999,
          background: PN.WHITE, color: PN.TEXT,
          border:`1px dashed ${PN.BORDER}`,
          fontSize: 12.5, fontWeight: 600, cursor:'pointer',
          fontFamily:'inherit',
        }}>+ Aggiungi metodo di pagamento</button>
      </AcCard>

      <AcCard title="Fatture" subtitle="Storico delle fatture mensili.">
        {/* Riga prossima fattura */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px', borderRadius: 10,
          background: PN.PINK_SOFT, border:`1px solid ${PN.PINK}33`,
          marginBottom: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PN.PINK_DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span style={{fontSize: 12.5, color: PN.PINK_DARK, fontWeight: 600}}>
              Prossima fattura
            </span>
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
            <span style={{fontSize: 16, fontWeight: 800, color: PN.PINK_DARK}}>€49,00</span>
            <span style={{fontSize: 12, color: PN.PINK_DARK, opacity: 0.75}}>· 1 Gennaio 2026</span>
          </div>
        </div>

        <div style={{
          border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, overflow:'hidden',
        }}>
          <div style={{
            display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 110px',
            padding:'12px 16px',
            background:'#FAFBFC',
            fontSize: 12, fontWeight: 700, color: PN.MUTED,
          }}>
            <span>Numero</span><span>Data</span><span>Importo</span><span>Stato</span><span style={{textAlign:'right'}}>PDF</span>
          </div>
          {ACC_FATTURE.map((f,i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 110px',
              padding:'12px 16px', alignItems:'center',
              borderTop: `1px solid ${PN.BORDER_SOFT}`,
              fontSize: 13, color: PN.TEXT,
            }}>
              <span style={{fontFamily:'ui-monospace, monospace', fontSize: 12.5}}>{f.num}</span>
              <span>{f.data}</span>
              <span style={{fontWeight: 700}}>€{f.importo.toFixed(2)}</span>
              <span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding:'3px 10px', borderRadius: 999,
                  background: PN.GREEN_SOFT, color: PN.GREEN,
                }}>{f.stato}</span>
              </span>
              <button style={{
                padding:'6px 14px', borderRadius: 999,
                background: PN.TEXT, color: PN.WHITE, border:'none',
                fontSize: 12, fontWeight: 600, cursor:'pointer',
                fontFamily:'inherit', marginLeft:'auto',
              }}>Scarica</button>
            </div>
          ))}
        </div>
      </AcCard>

      {/* Zona pericolosa — Annulla abbonamento */}
      <AcCard title="Annulla abbonamento" subtitle="L'abbonamento resterà attivo fino alla fine del periodo già pagato. Dopo, il tuo account passerà al piano Free.">
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
          padding: 16, borderRadius: 12,
          background:'#FFF7F7', border:`1px solid ${PN.RED}33`,
        }}>
          <div style={{flex: 1, fontSize: 12.5, color: PN.TEXT, lineHeight: 1.5}}>
            Una volta annullato, perderai accesso ai menu digitali extra, ai membri staff aggiuntivi e al supporto telefonico (se inclusi nel tuo piano).
          </div>
          <button style={{
            padding:'9px 16px', borderRadius: 999,
            background: PN.WHITE, color: PN.RED,
            border:`1px solid ${PN.RED}`,
            fontSize: 12.5, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', flexShrink: 0,
          }}>Annulla abbonamento</button>
        </div>
      </AcCard>
    </div>
  );
}

window.AccFatturazione = AccFatturazione;

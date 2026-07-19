// Account — Tab Account e fatturazione

// Inchiostro della riga "Prossima fattura". Stesso ambra scuro dell'accento
// "da liberare" in sala-table-tile.jsx: PN.AMBER e' troppo chiaro per il
// testo su AMBER_SOFT (2,86:1), questo tiene 4,51:1.
const AC_FATTURA_INK = '#B45309';

function AccFatturazione() {
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <AcCard aurora title="Metodo di pagamento" subtitle="Carta usata per gli addebiti mensili.">
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: 16, borderRadius: 12,
          background:'#FAFBFC', border:`1px solid ${PN.BORDER}`,
        }}>
          <div style={{
            width: 48, height: 32, borderRadius: 6,
            background:`linear-gradient(135deg, #1A1F71, #4A5BD8)`,
            display:'grid', placeItems:'center',
            color: PN.WHITE, fontSize: 13, fontWeight: 800, letterSpacing: 0.5,
          }}>VISA</div>
          <div style={{flex:1}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>•••• •••• •••• 4242</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>Scade 09/27 · Mario Rossi</div>
          </div>
          <button style={AcBtnGhost}>Modifica</button>
          <button style={{...AcBtnGhost, color: PN.RED, borderColor: PN.RED}}>Rimuovi</button>
        </div>
        <button style={{
          marginTop: 14,
          padding:'10px 18px', borderRadius: 999,
          background: PN.WHITE, color: PN.TEXT,
          border:`1px dashed ${PN.BORDER}`,
          fontSize: 14.5, fontWeight: 600, cursor:'pointer',
          fontFamily:'inherit',
        }}>+ Aggiungi metodo di pagamento</button>
      </AcCard>

      <AcCard title="Fatture" subtitle="Storico delle fatture mensili.">
        {/* Riga prossima fattura */}
        {/* Ambra, non rosso: la prossima fattura e' un promemoria, non un
            problema — il rosso qui suonava come "pagamento fallito".
            L'inchiostro e' #B45309 e non PN.AMBER: su AMBER_SOFT il PN.AMBER
            si ferma a 2,86:1, sotto il rosa che sostituisce. #B45309 da'
            4,51:1 ed e' lo stesso ambra scuro di "da liberare" in sala. */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px', borderRadius: 10,
          background: PN.AMBER_SOFT, border:`1px solid ${PN.AMBER}33`,
          marginBottom: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={AC_FATTURA_INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span style={{fontSize: 14.5, color: AC_FATTURA_INK, fontWeight: 600}}>
              Prossima fattura
            </span>
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
            <span style={{fontSize: 18, fontWeight: 800, color: AC_FATTURA_INK}}>€49,00</span>
            <span style={{fontSize: 14, color: AC_FATTURA_INK, opacity: 0.75}}>· 1 Gennaio 2026</span>
          </div>
        </div>

        <div style={{
          border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, overflow:'hidden',
        }}>
          <div style={{
            display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 110px',
            padding:'12px 16px',
            background:'#FAFBFC',
            fontSize: 14, fontWeight: 700, color: PN.MUTED,
          }}>
            <span>Numero</span><span>Data</span><span>Importo</span><span>Stato</span><span style={{textAlign:'right'}}>PDF</span>
          </div>
          {ACC_FATTURE.map((f,i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 110px',
              padding:'12px 16px', alignItems:'center',
              borderTop: `1px solid ${PN.BORDER_SOFT}`,
              fontSize: 15, color: PN.TEXT,
            }}>
              <span style={{fontFamily:'ui-monospace, monospace', fontSize: 14.5}}>{f.num}</span>
              <span>{f.data}</span>
              <span style={{fontWeight: 700}}>€{f.importo.toFixed(2)}</span>
              <span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  padding:'3px 10px', borderRadius: 999,
                  background: PN.GREEN_SOFT, color: PN.GREEN,
                }}>{f.stato}</span>
              </span>
              <button style={{
                padding:'6px 14px', borderRadius: 999,
                background: PN.TEXT, color: PN.WHITE, border:'none',
                fontSize: 14, fontWeight: 600, cursor:'pointer',
                fontFamily:'inherit', marginLeft:'auto',
              }}>Scarica</button>
            </div>
          ))}
        </div>
      </AcCard>

      {/* Zona pericolosa — Annulla abbonamento */}
      <AcCard title="Annulla abbonamento" subtitle="L'abbonamento resterà attivo fino alla fine del periodo già pagato. Dopo, il tuo account passerà al piano Free.">
        <div style={{
          // Warning ambra, non rosso: il rosso è il colore brand di Byup.
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
          padding: 16, borderRadius: 12,
          background:'#FFFBEB', border:'1px solid #FDE68A',
        }}>
          <div style={{flex: 1, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
            Una volta annullato, perderai accesso ai menu digitali extra, ai membri staff aggiuntivi e al supporto telefonico (se inclusi nel tuo piano).
          </div>
          <button style={{
            padding:'9px 16px', borderRadius: 999,
            background: PN.WHITE, color: PN.MUTED,
            border:`1px solid ${PN.BORDER}`,
            fontSize: 14.5, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', flexShrink: 0,
          }}>Annulla abbonamento</button>
        </div>
      </AcCard>
    </div>
  );
}

window.AccFatturazione = AccFatturazione;

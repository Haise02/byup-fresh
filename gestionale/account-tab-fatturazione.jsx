// Account — Tab Account e fatturazione

// Inchiostro della riga "Prossima fattura". Stesso ambra scuro dell'accento
// "da liberare" in sala-table-tile.jsx: PN.AMBER e' troppo chiaro per il
// testo su AMBER_SOFT (2,86:1), questo tiene 4,51:1.
const AC_FATTURA_INK = '#B45309';

// Gradienti dei circuiti per il badge carta (il prefisso del numero decide).
const AC_PAY_BRANDS = {
  visa:       { label: 'VISA', bg: 'linear-gradient(135deg, #1A1F71, #4A5BD8)' },
  mastercard: { label: 'MC',   bg: 'linear-gradient(135deg, #1F1F1F, #3D3D3D)' },
  amex:       { label: 'AMEX', bg: 'linear-gradient(135deg, #0E6E64, #2E9E92)' },
  card:       { label: 'CARD', bg: 'linear-gradient(135deg, #4B5563, #6B7280)' },
};
const acPayBrand = (num) => {
  const d = (num || '').replace(/\D/g, '');
  if (d.startsWith('4')) return 'visa';
  if (d.startsWith('5') || d.startsWith('2')) return 'mastercard';
  if (d.startsWith('3')) return 'amex';
  return 'card';
};

// Animazioni della card pagamento: ingresso/uscita righe, pop dei modali,
// riflesso che attraversa il badge del circuito.
const AC_PAY_CSS = `
@keyframes acPayIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes acPayOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(14px) scale(0.98); } }
@keyframes acPayPop { 0% { opacity: 0; transform: scale(0.92) translateY(10px); } 100% { opacity: 1; transform: none; } }
@keyframes acPayFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes acPayShine { 0%, 55% { transform: translateX(-130%) skewX(-18deg); } 100% { transform: translateX(230%) skewX(-18deg); } }
@keyframes acPayCheckPop { 0% { transform: scale(0); } 60% { transform: scale(1.14); } 100% { transform: scale(1); } }
`;

// Badge del circuito con riflesso animato che passa periodicamente.
function AcPayBadge({ brand, small }) {
  const b = AC_PAY_BRANDS[brand] || AC_PAY_BRANDS.card;
  return (
    <div style={{
      width: small ? 48 : 54, height: small ? 32 : 36, borderRadius: 6,
      background: b.bg, position: 'relative', overflow: 'hidden', flexShrink: 0,
      display: 'grid', placeItems: 'center',
      color: PN.WHITE, fontSize: small ? 12 : 13, fontWeight: 800, letterSpacing: 0.5,
    }}>
      {b.label}
      <span aria-hidden style={{
        position: 'absolute', top: 0, left: 0, width: '45%', height: '100%',
        background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)',
        animation: 'acPayShine 3.6s ease-in-out infinite', pointerEvents: 'none',
      }}/>
    </div>
  );
}

// Anteprima carta live del flusso "Aggiungi": si compila mentre digiti e si
// gira sul retro quando il focus è sul CVC.
function AcPayCardPreview({ num, holder, exp, cvc, flipped }) {
  const brand = acPayBrand(num);
  const b = AC_PAY_BRANDS[brand];
  const digits = num.replace(/\D/g, '');
  const shown = (digits + '••••••••••••••••').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const face = {
    position: 'absolute', inset: 0, borderRadius: 16, padding: 18,
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    background: b.bg, color: PN.WHITE, overflow: 'hidden',
    boxShadow: '0 14px 30px -12px rgba(15,17,21,0.45)',
  };
  return (
    <div style={{ perspective: 900, width: '100%', height: 168 }}>
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d', transition: 'transform 480ms cubic-bezier(.2,.8,.25,1)',
        transform: flipped ? 'rotateY(180deg)' : 'none',
      }}>
        {/* Fronte */}
        <div style={face}>
          <span aria-hidden style={{
            position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
            background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.22), transparent)',
            animation: 'acPayShine 4.2s ease-in-out infinite', pointerEvents: 'none',
          }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Chip */}
            <div style={{
              width: 38, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, #E8C56A, #C9A24B)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
            }}/>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>{b.label}</div>
          </div>
          <div style={{
            marginTop: 22, fontFamily: 'ui-monospace, monospace',
            fontSize: 19, letterSpacing: 2, fontWeight: 600, whiteSpace: 'nowrap',
          }}>{shown}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 12.5 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ opacity: 0.65, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase' }}>Intestatario</div>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {holder.trim() || 'NOME COGNOME'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ opacity: 0.65, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase' }}>Scade</div>
              <div style={{ fontWeight: 700 }}>{exp || 'MM/AA'}</div>
            </div>
          </div>
        </div>
        {/* Retro — banda magnetica e CVC */}
        <div style={{ ...face, transform: 'rotateY(180deg)', padding: 0 }}>
          <div style={{ height: 34, background: 'rgba(0,0,0,0.55)', marginTop: 26 }}/>
          <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
            <div style={{
              flex: 1, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.85)',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 7px)',
            }}/>
            <div style={{
              width: 58, height: 30, borderRadius: 6, background: PN.WHITE, color: PN.TEXT,
              display: 'grid', placeItems: 'center',
              fontFamily: 'ui-monospace, monospace', fontSize: 14.5, fontWeight: 700, letterSpacing: 2,
            }}>{cvc || '•••'}</div>
          </div>
          <div style={{ padding: '10px 18px', fontSize: 10.5, opacity: 0.6 }}>CVC — le 3 cifre sul retro della carta</div>
        </div>
      </div>
    </div>
  );
}

// Overlay + pannello glass condivisi dai tre modali della card pagamento.
function AcPayModal({ onClose, width, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(15,17,21,0.42)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 20,
      animation: 'acPayFade 180ms ease both',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20, width: width || 420, maxWidth: '100%',
        padding: '22px 22px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        animation: 'acPayPop 300ms cubic-bezier(.2,.8,.25,1) both',
      }}>
        {children}
      </div>
    </div>
  );
}

function AcPayModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: PN.TEXT }}>{title}</div>
        {subtitle && <div style={{ fontSize: 14.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45 }}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
        display: 'grid', placeItems: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}

// Flusso "Aggiungi metodo di pagamento": anteprima carta live + form con
// auto-formattazione. Il bottone si attiva solo a dati completi; al salvataggio
// un check verde conferma e la carta entra in lista.
function AcPayAddModal({ onClose, onAdd }) {
  const [num, setNum] = React.useState('');
  const [holder, setHolder] = React.useState('');
  const [exp, setExp] = React.useState('');
  const [cvc, setCvc] = React.useState('');
  const [cvcFocus, setCvcFocus] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const fmtNum = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };
  const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
  const ready = num.replace(/\D/g, '').length === 16 && holder.trim().length >= 3 && expOk && cvc.length === 3;

  const submit = () => {
    if (!ready || saved) return;
    setSaved(true);
    const digits = num.replace(/\D/g, '');
    setTimeout(() => {
      onAdd({
        id: Date.now(),
        brand: acPayBrand(num),
        last4: digits.slice(-4),
        exp,
        holder: holder.trim(),
      });
    }, 950);
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${PN.BORDER}`, background: PN.WHITE,
    fontSize: 15, color: PN.TEXT, fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle = {
    fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, display: 'block',
  };

  return (
    <AcPayModal onClose={onClose}>
      <AcPayModalHeader title="Aggiungi metodo di pagamento"
        subtitle="La carta verrà usata per gli addebiti mensili." onClose={onClose}/>

      {saved ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: '26px 0 18px', gap: 12 }}>
          <span style={{
            width: 62, height: 62, borderRadius: '50%',
            background: PN.GREEN_SOFT, display: 'grid', placeItems: 'center',
            animation: 'acPayCheckPop 420ms cubic-bezier(.2,.8,.25,1) both',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={PN.GREEN} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: PN.TEXT }}>Carta aggiunta</div>
        </div>
      ) : (
        <React.Fragment>
          <AcPayCardPreview num={num} holder={holder} exp={exp} cvc={cvc} flipped={cvcFocus}/>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Numero carta</label>
              <input value={num} onChange={e => setNum(fmtNum(e.target.value))}
                placeholder="1234 5678 9012 3456" inputMode="numeric" autoFocus style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Intestatario</label>
              <input value={holder} onChange={e => setHolder(e.target.value)}
                placeholder="Mario Rossi" style={inputStyle}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Scadenza</label>
                <input value={exp} onChange={e => setExp(fmtExp(e.target.value))}
                  placeholder="MM/AA" inputMode="numeric" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>CVC</label>
                <input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onFocus={() => setCvcFocus(true)} onBlur={() => setCvcFocus(false)}
                  placeholder="123" inputMode="numeric" style={inputStyle}/>
              </div>
            </div>
          </div>

          <button onClick={submit} disabled={!ready} style={{
            padding: '11px 18px', borderRadius: 999, border: 'none',
            background: ready ? PN.BTN_DARK : PN.WHITE_FROST,
            color: ready ? PN.WHITE : PN.MUTED_SOFT,
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: ready ? 'pointer' : 'not-allowed',
            boxShadow: ready ? PN.INSET_HIGHLIGHT_DARK : 'none',
            transition: 'background 200ms, color 200ms',
          }}>Aggiungi carta</button>
        </React.Fragment>
      )}
    </AcPayModal>
  );
}

function AccFatturazione() {
  const [metodi, setMetodi] = React.useState([
    { id: 1, brand: 'visa', last4: '4242', exp: '09/27', holder: 'Mario Rossi' },
  ]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState(null); // carta in attesa di conferma rimozione
  const [blockOpen, setBlockOpen] = React.useState(false); // rimozione bloccata: unico metodo
  const [removingId, setRemovingId] = React.useState(null); // carta in uscita animata
  // Cambia a ogni promozione: entra nelle key delle righe così l'ingresso
  // animato si rigioca e il riordino si vede.
  const [promoteTick, setPromoteTick] = React.useState(0);

  const makeDefault = (id) => {
    setMetodi(m => {
      const card = m.find(c => c.id === id);
      return card ? [card, ...m.filter(c => c.id !== id)] : m;
    });
    setPromoteTick(t => t + 1);
  };

  // Annulla abbonamento: doppio step — conferma, poi digitare la frase esatta.
  const [cancelStep, setCancelStep] = React.useState(null); // null | 'confirm' | 'type' | 'done'
  const [cancelText, setCancelText] = React.useState('');
  const CANCEL_PHRASE = 'Annulla abbonamento';
  const cancelReady = cancelText.trim().toLowerCase() === CANCEL_PHRASE.toLowerCase();
  const closeCancel = () => { setCancelStep(null); setCancelText(''); };
  const confirmCancel = () => {
    if (!cancelReady) return;
    setCancelStep('done');
    setTimeout(closeCancel, 1400);
  };

  const askRemove = (id) => {
    if (metodi.length <= 1) setBlockOpen(true);
    else setConfirmId(id);
  };
  const doRemove = (id) => {
    setConfirmId(null);
    setRemovingId(id);
    setTimeout(() => {
      setMetodi(m => m.filter(c => c.id !== id));
      setRemovingId(null);
    }, 300);
  };
  const confirmCard = metodi.find(c => c.id === confirmId);

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <style>{AC_PAY_CSS}</style>
      <AcCard aurora title="Metodo di pagamento" subtitle="Carta usata per gli addebiti mensili.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {metodi.map((c, i) => (
            <div key={`${c.id}-${promoteTick}`} style={{
              display:'flex', alignItems:'center', gap: 14,
              padding: 16, borderRadius: 12,
              background:'#FAFBFC', border:`1px solid ${PN.BORDER}`,
              animation: removingId === c.id
                ? 'acPayOut 300ms ease both'
                : 'acPayIn 350ms ease both',
              animationDelay: removingId === c.id ? '0ms' : `${i * 50}ms`,
              transition: 'box-shadow 180ms ease, transform 180ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = PN.CARD_SHADOW_HOVER; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <AcPayBadge brand={c.brand} small/>
              <div style={{flex:1, minWidth: 0}}>
                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                  <span style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>•••• •••• •••• {c.last4}</span>
                  {i === 0 && (
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: PN.GREEN,
                      background: PN.GREEN_SOFT, padding: '2px 9px', borderRadius: 999,
                    }}>Predefinita</span>
                  )}
                </div>
                <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>Scade {c.exp} · {c.holder}</div>
              </div>
              {i > 0 && (
                <button onClick={() => makeDefault(c.id)} style={AcBtnGhost}>Rendi predefinita</button>
              )}
              <button onClick={() => askRemove(c.id)}
                style={{...AcBtnGhost, color: PN.RED, borderColor: PN.RED}}>Rimuovi</button>
            </div>
          ))}
        </div>
        <button onClick={() => setAddOpen(true)} style={{
          marginTop: 14,
          padding:'10px 18px', borderRadius: 999,
          background: PN.WHITE, color: PN.TEXT,
          border:`1px dashed ${PN.BORDER}`,
          fontSize: 14.5, fontWeight: 600, cursor:'pointer',
          fontFamily:'inherit',
        }}>+ Aggiungi metodo di pagamento</button>
      </AcCard>

      {/* Rimozione bloccata: unico metodo di pagamento */}
      {blockOpen && (
        <AcPayModal onClose={() => setBlockOpen(false)} width={400}>
          <AcPayModalHeader title="Non puoi rimuovere questa carta"
            subtitle="È l'unico metodo di pagamento del tuo account." onClose={() => setBlockOpen(false)}/>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '12px 14px', borderRadius: 12,
            background: PN.AMBER_SOFT, border: `1px solid ${PN.AMBER}33`,
            fontSize: 14.5, color: AC_FATTURA_INK, lineHeight: 1.5,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={AC_FATTURA_INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: 2}}>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Aggiungi prima un altro metodo di pagamento: serve almeno una carta attiva per gli addebiti mensili del tuo piano.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setBlockOpen(false)} style={AcBtnGhost}>Chiudi</button>
            <button onClick={() => { setBlockOpen(false); setAddOpen(true); }} style={{
              padding: '9px 16px', borderRadius: 999, border: 'none',
              background: PN.BTN_DARK, color: PN.WHITE,
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: PN.INSET_HIGHLIGHT_DARK,
            }}>Aggiungi un metodo</button>
          </div>
        </AcPayModal>
      )}

      {/* Conferma rimozione (con almeno due metodi) */}
      {confirmCard && (
        <AcPayModal onClose={() => setConfirmId(null)} width={400}>
          <AcPayModalHeader title="Rimuovere questa carta?"
            subtitle="L'operazione non può essere annullata." onClose={() => setConfirmId(null)}/>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.75)', border: `1px solid ${PN.BORDER}`,
          }}>
            <AcPayBadge brand={confirmCard.brand} small/>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>•••• •••• •••• {confirmCard.last4}</div>
              <div style={{ fontSize: 13.5, color: PN.MUTED }}>Scade {confirmCard.exp} · {confirmCard.holder}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setConfirmId(null)} style={AcBtnGhost}>Annulla</button>
            <button onClick={() => doRemove(confirmCard.id)} style={{
              padding: '9px 16px', borderRadius: 999, border: 'none',
              background: PN.RED, color: PN.WHITE,
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}>Rimuovi carta</button>
          </div>
        </AcPayModal>
      )}

      {/* Flusso aggiunta carta */}
      {addOpen && (
        <AcPayAddModal onClose={() => setAddOpen(false)}
          onAdd={(card) => { setMetodi(m => [...m, card]); setAddOpen(false); }}/>
      )}

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
              transition: 'background 150ms ease, transform 150ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = PN.PINK_BG_SOFT; e.currentTarget.style.transform = 'scale(1.012)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.transform = ''; }}>
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
      <AcCard title="Annulla abbonamento" subtitle="L'abbonamento resterà attivo fino alla fine del periodo già pagato. Dopo, il tuo account passerà al piano Gratuito.">
        <div style={{
          // Warning ambra, non rosso: il rosso è il colore brand di Byup.
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
          padding: 16, borderRadius: 12,
          background:'#FFFBEB', border:'1px solid #FDE68A',
        }}>
          <div style={{flex: 1, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
            Una volta annullato, perderai accesso ai menu digitali extra, ai membri staff aggiuntivi e al supporto telefonico (se inclusi nel tuo piano).
          </div>
          <button onClick={() => setCancelStep('confirm')} style={{
            padding:'9px 16px', borderRadius: 999,
            background: PN.WHITE, color: PN.MUTED,
            border:`1px solid ${PN.BORDER}`,
            fontSize: 14.5, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', flexShrink: 0,
          }}>Annulla abbonamento</button>
        </div>
      </AcCard>

      {/* Annulla abbonamento — step 1: conferma */}
      {cancelStep === 'confirm' && (
        <AcPayModal onClose={closeCancel} width={410}>
          <AcPayModalHeader title="Vuoi annullare l'abbonamento?"
            subtitle="Resterà attivo fino alla fine del periodo già pagato, poi passerai al piano Gratuito." onClose={closeCancel}/>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '12px 14px', borderRadius: 12,
            background: PN.AMBER_SOFT, border: `1px solid ${PN.AMBER}33`,
            fontSize: 14.5, color: AC_FATTURA_INK, lineHeight: 1.5,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={AC_FATTURA_INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: 2}}>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Perderai i menu digitali extra, i membri staff aggiuntivi e il supporto telefonico inclusi nel tuo piano.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={closeCancel} style={AcBtnGhost}>No, mantieni</button>
            <button onClick={() => setCancelStep('type')} style={{
              padding: '9px 16px', borderRadius: 999, border: 'none',
              background: PN.BTN_DARK, color: PN.WHITE,
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: PN.INSET_HIGHLIGHT_DARK,
            }}>Sì, continua</button>
          </div>
        </AcPayModal>
      )}

      {/* Annulla abbonamento — step 2: digita la frase per disdire */}
      {(cancelStep === 'type' || cancelStep === 'done') && (
        <AcPayModal onClose={closeCancel} width={410}>
          {cancelStep === 'done' ? (
            <div style={{ display: 'grid', placeItems: 'center', padding: '26px 0 18px', gap: 12 }}>
              <span style={{
                width: 62, height: 62, borderRadius: '50%',
                background: PN.AMBER_SOFT, display: 'grid', placeItems: 'center',
                animation: 'acPayCheckPop 420ms cubic-bezier(.2,.8,.25,1) both',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={AC_FATTURA_INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: PN.TEXT }}>Abbonamento annullato</div>
              <div style={{ fontSize: 14, color: PN.MUTED, textAlign: 'center' }}>Resta attivo fino alla fine del periodo già pagato.</div>
            </div>
          ) : (
            <React.Fragment>
              <AcPayModalHeader title="Conferma la disdetta"
                subtitle={`Per disdire, scrivi "${CANCEL_PHRASE}" qui sotto.`} onClose={closeCancel}/>
              <input value={cancelText} onChange={e => setCancelText(e.target.value)}
                placeholder={CANCEL_PHRASE} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') confirmCancel(); }}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 12px', borderRadius: 10,
                  border: `1px solid ${cancelReady ? PN.GREEN : PN.BORDER}`,
                  background: PN.WHITE, outline: 'none',
                  fontSize: 15, color: PN.TEXT, fontFamily: 'inherit',
                  transition: 'border-color 180ms ease',
                }}/>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={closeCancel} style={AcBtnGhost}>Torna indietro</button>
                <button onClick={confirmCancel} disabled={!cancelReady} style={{
                  padding: '9px 16px', borderRadius: 999, border: 'none',
                  background: cancelReady ? PN.RED : PN.WHITE_FROST,
                  color: cancelReady ? PN.WHITE : PN.MUTED_SOFT,
                  fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit',
                  cursor: cancelReady ? 'pointer' : 'not-allowed',
                  transition: 'background 200ms, color 200ms',
                }}>Disdici abbonamento</button>
              </div>
            </React.Fragment>
          )}
        </AcPayModal>
      )}
    </div>
  );
}

window.AccFatturazione = AccFatturazione;

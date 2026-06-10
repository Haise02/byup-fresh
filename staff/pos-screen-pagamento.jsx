// Byup Staff — Tap to Pay
// Flusso Stripe simulato (il vero Stripe Terminal SDK gira in nativo iOS).

const { useState: useStateP, useEffect: useEffectP } = React;

// ═══════════════════════════════════════════════════════════
// TAP TO PAY — waiting → reading → pin → success/fail
// ═══════════════════════════════════════════════════════════
function ScreenTap({ nav, openModal, importo, contoId, pagaConto }) {
  const [step, setStep] = useStateP('waiting');
  const [pin, setPin] = useStateP('');

  const pinRichiesto = (importo || 0) > 25;   // PIN sopra soglia contactless

  // La lettura porta a PIN (se richiesto) o direttamente all'esito.
  // L'attesa NON avanza da sola: parte quando la carta viene avvicinata.
  useEffectP(() => {
    if (step === 'reading') {
      const t2 = setTimeout(() => setStep(pinRichiesto ? 'pin' : 'success'), 1600);
      return () => clearTimeout(t2);
    }
  }, [step, pinRichiesto]);

  // Simula la carta che si avvicina al dispositivo
  const presentaCarta = () => { if (step === 'waiting') setStep('reading'); };

  // PIN completo → fase di elaborazione
  useEffectP(() => {
    if (step === 'pin' && pin.length === 4) {
      const tm = setTimeout(() => setStep('elaboro'), 500);
      return () => clearTimeout(tm);
    }
  }, [step, pin]);

  // Elaborazione: ~5 secondi prima della conferma
  useEffectP(() => {
    if (step === 'elaboro') {
      const tm = setTimeout(() => setStep('success'), 5000);
      return () => clearTimeout(tm);
    }
  }, [step]);

  // Pagamento riuscito → il conto esce dalla coda di incasso
  useEffectP(() => {
    if (step === 'success' && contoId && pagaConto) pagaConto(contoId);
  }, [step]);

  const onPinDigit = (d) => {
    if (d === 'back') setPin(p => p.slice(0, -1));
    else if (pin.length < 4) setPin(p => p + d);
  };

  const isWave = step === 'waiting' || step === 'reading' || step === 'success';
  const isProc = step === 'elaboro';
  const isFail = step === 'fail';
  const bg = isFail ? '#7F1D1D' : ST.WINE;

  return (
    <div style={{ background: bg, minHeight: '100%', color: '#fff', position: 'relative', transition: 'background 300ms' }}>
      <div style={{ padding: '54px 16px 16px' }}>
        <button onClick={() => nav.pop()} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
          background: 'rgba(255,255,255,0.12)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Close s={18} c="#fff"/></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 24px', textAlign: 'center' }}>
        {/* NFC waves / spinner / esito — in attesa è toccabile per simulare la carta */}
        {(isWave || isProc || isFail) && (
          <div
            onClick={presentaCarta}
            style={{
              position: 'relative', width: 120, height: 120, marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: step === 'waiting' ? 'pointer' : 'default',
            }}>
            {isProc ? (
              /* spinner minimale centrato */
              <div style={{
                width: 56, height: 56, borderRadius: ST.R_PILL,
                border: '3px solid rgba(255,255,255,0.22)', borderTopColor: '#fff',
                animation: 'spin 0.8s linear infinite',
              }}/>
            ) : (
              <>
                {step === 'waiting' && [0, 1, 2].map(i => (
                  <div key={i} style={{
                    position: 'absolute', inset: 0, borderRadius: ST.R_PILL,
                    border: '2px solid rgba(255,255,255,0.4)',
                    animation: `nfcwave 2s ease-out ${i * 0.6}s infinite`,
                  }}/>
                ))}
                <div style={{
                  position: 'absolute', inset: 30, borderRadius: ST.R_PILL,
                  background: step === 'success' ? ST.OK : isFail ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 300ms',
                }}>
                  {step === 'success' ? <I.Check s={32} c="#fff"/>
                    : isFail ? <I.Close s={34} c="#fff"/>
                    : <I.Wifi s={36} c="#fff"/>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Status text */}
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          {step === 'waiting' && 'In attesa carta'}
          {step === 'reading' && 'Lettura in corso'}
          {step === 'pin' && 'Inserisci PIN'}
          {isProc && 'Elaborazione'}
          {step === 'success' && 'Pagamento completato'}
          {isFail && 'Pagamento rifiutato'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, opacity: 0.9, lineHeight: 1.4, marginBottom: 18 }}>
          {step === 'waiting' && 'Avvicina carta o telefono al dispositivo'}
          {step === 'reading' && 'Tieni la carta ferma…'}
          {step === 'pin' && 'Chiedi al cliente di inserire il PIN'}
          {isProc && 'Attendi, non rimuovere la carta…'}
          {step === 'success' && '✓ Transazione approvata'}
          {isFail && 'Carta rifiutata dall’emittente'}
        </div>

        {step === 'waiting' && (
          <div style={{ fontSize: 12, opacity: 0.55, marginTop: -10, marginBottom: 16 }}>
            Demo · tocca il cerchio per simulare la carta
          </div>
        )}

        {/* Importo card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)', borderRadius: ST.R_LG,
          padding: '16px 24px', color: ST.TEXT, minWidth: 220,
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        }}>
          <Logo size={40} radius={ST.R_MD}/>
          <div style={{ fontSize: 10.5, color: ST.MUTED, fontWeight: 600, marginTop: 6 }}>{MERCHANT.nome}</div>
          <div style={{ fontSize: 10.5, color: ST.MUTED }}>{MERCHANT.operatore}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 6 }}>
            {eur(importo)}
          </div>
        </div>

        {/* PIN PAD */}
        {step === 'pin' && (
          <div style={{ marginTop: 20, width: '100%', maxWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
              {[0, 1, 2, 3].map(i => (
                <span key={i} style={{
                  width: 14, height: 14, borderRadius: ST.R_PILL,
                  background: i < pin.length ? '#fff' : 'rgba(255,255,255,0.25)',
                  transition: 'all 200ms',
                  transform: i === pin.length - 1 ? 'scale(1.15)' : 'scale(1)',
                }}/>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {['1','2','3','4','5','6','7','8','9','','0','back'].map((d, i) => {
                if (d === '') return <div key={i}/>;
                return (
                  <button key={i} onClick={() => onPinDigit(d)} style={{
                    height: 56, borderRadius: ST.R_MD,
                    background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
                    fontSize: 22, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {d === 'back' ? <I.Delete s={22} c="#fff"/> : d}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.6, marginTop: 14 }}>
              PIN richiesto per importi superiori a €25
            </div>
          </div>
        )}

        {/* Success actions */}
        {step === 'success' && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
            <button onClick={() => openModal({ kind: 'ricevuta', importo })} style={{
              width: '100%', height: 50, borderRadius: ST.R_PILL,
              background: '#fff', color: ST.WINE, border: 'none',
              fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <I.Receipt s={16} c={ST.WINE}/> Invia ricevuta
            </button>
            <button onClick={() => nav.reset({ s: 'incassa' })} style={{
              width: '100%', height: 46, borderRadius: ST.R_PILL,
              background: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Nuovo pagamento</button>
          </div>
        )}

        {/* Fail actions */}
        {isFail && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
            <button onClick={() => { setPin(''); setStep('waiting'); }} style={{
              width: '100%', height: 50, borderRadius: ST.R_PILL,
              background: '#fff', color: '#7F1D1D', border: 'none',
              fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <I.Refresh s={16} c="#7F1D1D"/> Riprova
            </button>
            <button onClick={() => nav.pop()} style={{
              width: '100%', height: 46, borderRadius: ST.R_PILL,
              background: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Cambia metodo</button>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, padding: '0 16px' }}>
        {(step === 'waiting' || step === 'reading') && (
          <>
            <button onClick={() => nav.pop()} style={{
              width: '100%', height: 50, borderRadius: ST.R_PILL,
              background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Annulla transazione</button>
            {/* affordance solo-prototipo: forza PIN o esito rifiutato */}
            {step === 'waiting' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 12 }}>
                <button onClick={() => { setPin(''); setStep('pin'); }} style={{
                  background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>▸ richiedi PIN</button>
                <button onClick={() => setStep('fail')} style={{
                  background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>▸ carta rifiutata</button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes nfcwave { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

Object.assign(window, { ScreenTap });

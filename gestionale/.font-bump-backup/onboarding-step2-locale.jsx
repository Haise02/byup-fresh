// Step 2 — Il tuo locale.
//
// 2 SUB-STEPS NAVIGATI INTERNAMENTE:
//   2a info        — anagrafica + P.IVA
//   2b pagamenti   — Stripe + altri metodi (PayPal/Klarna/Satispay)
//
// Sub-step "Fiscale" rimosso: SDI/PEC/regime fiscale sono completati nelle impostazioni
// post-onboarding. Qui basta P.IVA per costituire il soggetto giuridico minimo.
// Sub-step "Carte e digital wallet" (Apple/Google Pay) rimosso: sono attivi via Stripe
// senza dover comunicare nulla all'utente in fase di onboarding.

function Step2Locale({
  subStep, setSubStep,
  venue, setVenue,
  payments, setPayments,
  onNext, onBack,
}) {
  const v = (k, val) => setVenue(prev => ({...prev, [k]: val}));
  const p = (k, val) => setPayments(prev => ({...prev, [k]: val}));

  const SUBSTEP_TITLES = {
    info:      {title: 'Le informazioni del tuo locale.',
                sub: 'Queste informazioni verranno pubblicate e visualizzate dagli utenti dell’applicazione Byup.'},
    pagamenti: {title: 'Pagamenti.',
                sub: 'Connetti Stripe e scegli quali metodi di pagamento accettare.'},
  };
  const t = SUBSTEP_TITLES[subStep];

  return (
    <div style={{
      padding: '40px 48px 64px',
      background: ONB.BG_SOFT,
      minHeight: 760,
    }}>
      <div style={{maxWidth: 720, margin: '0 auto'}}>
        {/* Eyebrow + headline */}
        <div style={{
          fontSize: 12, fontWeight: 500, color: ONB.MUTED,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Step 2 di 4 · Il tuo locale
        </div>
        <h1 style={{
          fontSize: 32, fontWeight: 600, lineHeight: 1.2,
          letterSpacing: '-0.02em', margin: '0 0 12px', color: ONB.TEXT,
        }}>
          {t.title}
        </h1>
        <p style={{
          fontSize: 16, fontWeight: 400, lineHeight: 1.4,
          color: ONB.MUTED, margin: '0 0 32px', maxWidth: 560,
        }}>
          {t.sub}
        </p>

        {subStep === 'info'      && <SubStepInfo      venue={venue} v={v}/>}
        {subStep === 'pagamenti' && <SubStepPagamenti payments={payments} p={p}/>}

        {/* Footer — 2 pulsanti, gerarchia chiara */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 32, paddingTop: 24,
          borderTop: '1px solid rgba(15, 17, 21, 0.08)',
        }}>
          <SecondaryCta onClick={onBack}>
            <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
            Indietro
          </SecondaryCta>
          <PrimaryCta onClick={onNext}>
            Continua
            <OnbIcon.ArrowRight size={14} color="#fff"/>
          </PrimaryCta>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2a INFO LOCALE
// ─────────────────────────────────────────────────────────────────────────

function SubStepInfo({venue, v}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {/* Anagrafica del locale: W1 white classic standard. Era marcata "glass"
          (alias di aurora L2) in passato — riportata a default per richiesta. */}
      <OnbCard>
        <OnbSectionHeader
          title="Anagrafica del locale"
          subtitle="Nome, P.IVA e dove si trova il locale."
        />
        {/* Grid 12-col: composizione "indirizzo / civico / cap / città" su una sola
            riga visiva (80/20/20/40) — pattern italiano standard di un form indirizzi.
            Su 720px container abbiamo abbastanza spazio per tenerli in linea. */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16}}>
          <div style={{gridColumn: 'span 7'}}>
            <OnbField label="Nome del locale"
              value={venue.name} onChange={(x) => v('name', x)}
              placeholder="es. Cacio e Pepe"/>
          </div>
          <div style={{gridColumn: 'span 5'}}>
            <OnbField label="Partita IVA"
              value={venue.piva} onChange={(x) => v('piva', x)}
              placeholder="IT00000000000"/>
          </div>
          <div style={{gridColumn: 'span 8'}}>
            <OnbField label="Indirizzo"
              value={venue.address} onChange={(x) => v('address', x)}
              placeholder="Via dei Giubbonari"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Civico"
              value={venue.civico} onChange={(x) => v('civico', x)}
              placeholder="27"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="CAP"
              value={venue.cap} onChange={(x) => v('cap', x)}
              placeholder="00186"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Città"
              value={venue.city} onChange={(x) => v('city', x)}
              placeholder="Roma"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Telefono" type="tel"
              value={venue.phone} onChange={(x) => v('phone', x)}
              placeholder="06 1234 5678"/>
          </div>
        </div>
      </OnbCard>

      <OnbCard>
        <OnbSectionHeader
          title="Regime fiscale"
          subtitle="Per applicare correttamente IVA ed esenzioni in fattura."
        />
        <RegimeRadioGroup value={venue.regime} onChange={(x) => v('regime', x)}/>
      </OnbCard>
    </div>
  );
}

// Regime fiscale — 3 radio card stacked. Tre opzioni semanticamente diverse
// (ordinario / forfettario / agricolo) → radio card con descrizione spiega la
// scelta meglio di un dropdown muto.
function RegimeRadioGroup({value, onChange}) {
  const options = [
    {id: 'ordinario',   label: 'Ordinario',          desc: 'IVA al 10% sui pasti, 22% sulle bevande alcoliche.'},
    {id: 'forfettario', label: 'Forfettario',        desc: 'No IVA in fattura, coefficiente di redditività dedicato.'},
    {id: 'agricolo',    label: 'Agricolo / Speciale', desc: 'Per agriturismo o attività agricole connesse.'},
  ];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <label key={o.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px',
            background: selected ? ONB.BRAND_TINT : '#fff',
            border: `1px solid ${selected ? 'rgba(255, 90, 95, 0.30)' : 'rgba(15, 17, 21, 0.08)'}`,
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 150ms ease-out',
          }}>
            <input type="radio" name="regime"
              checked={selected} onChange={() => onChange(o.id)}
              style={{margin: 0, marginTop: 3, accentColor: ONB.BRAND}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 14, fontWeight: 500, color: ONB.TEXT, lineHeight: 1.4}}>
                {o.label}
              </div>
              <div style={{fontSize: 13, color: ONB.MUTED, marginTop: 2, lineHeight: 1.4}}>
                {o.desc}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2b PAGAMENTI
// ─────────────────────────────────────────────────────────────────────────

function SubStepPagamenti({payments, p}) {
  // Solo metodi alternativi a Stripe: il POS Stripe da solo copre carte + Apple/Google Pay
  // automaticamente, quindi non serve un toggle dedicato per quelle wallet. Default OFF
  // perché PayPal/Klarna/Satispay richiedono ognuno setup proprio.
  const [methods, setMethods] = React.useState({
    paypal: false, klarna: false, satispay: false,
  });
  const toggle = (k) => setMethods(m => ({...m, [k]: !m[k]}));

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <OnbCard>
        <OnbSectionHeader
          number="1"
          title="Piattaforma POS"
          subtitle="Per accettare pagamenti dai clienti al tavolo e dall’app. Commissioni standard Stripe: 1,5% + 0,25 € per transazione (Europa)."
        />
        <StripeConnectRow
          status={payments.stripeStatus}
          onConnect={() => p('stripeStatus', 'connected')}
          onDisconnect={() => p('stripeStatus', 'disconnected')}
        />
      </OnbCard>

      <OnbCard>
        <OnbSectionHeader
          number="2"
          title="Altri metodi"
          subtitle="Estendi le opzioni di pagamento offerte ai clienti — attivabili anche dopo l'onboarding."
        />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <MethodRow
            provider="paypal" label="PayPal"
            desc="Conto PayPal o carta via PayPal · commissione 2,5% + 0,35 €"
            checked={methods.paypal} onToggle={() => toggle('paypal')}
          />
          <MethodRow
            provider="klarna" label="Klarna"
            desc="Pagamento dilazionato fino a 30 giorni · zero rischio per il locale"
            checked={methods.klarna} onToggle={() => toggle('klarna')}
          />
          <MethodRow
            provider="satispay" label="Satispay"
            desc="App di pagamento senza commissioni"
            checked={methods.satispay} onToggle={() => toggle('satispay')}
          />
        </div>
      </OnbCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PaymentBrandIcon — 24×24 SVG inline per ogni provider.
// I path sono semplificazioni dei marchi ufficiali con i colori brand reali.
// Fallback (provider non riconosciuto) = monogram neutro così il render
// non si rompe mai anche se passa un provider futuro non supportato.
// ─────────────────────────────────────────────────────────────────────────

function PaymentBrandIcon({provider, size = 24}) {
  const wrap = {width: size, height: size, borderRadius: 6, flexShrink: 0, overflow: 'hidden'};

  if (provider === 'stripe') {
    return (
      <div style={{...wrap, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M11.6 8.7c-.7 0-1.1.2-1.1.7 0 .5.5.7 1.6 1.1 1.7.6 2.6 1.4 2.6 2.9 0 1.7-1.3 2.7-3.4 2.7-1.2 0-2.4-.3-3.3-.7v-2c.9.5 1.9.8 2.9.8.7 0 1.2-.2 1.2-.7 0-.6-.5-.8-1.6-1.2-1.6-.6-2.6-1.4-2.6-2.8 0-1.6 1.3-2.6 3.3-2.6 1 0 2 .2 2.9.6v1.9c-.8-.4-1.7-.7-2.5-.7z"/>
        </svg>
      </div>
    );
  }
  if (provider === 'applepay') {
    return (
      <div style={{...wrap, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      </div>
    );
  }
  if (provider === 'googlepay') {
    return (
      <div style={{...wrap, background: '#fff', border: '1px solid rgba(15,17,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {/* Glifo Google G ufficiale a 4 colori, leggermente ridotto per centrarlo nel 24×24 */}
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    );
  }
  if (provider === 'paypal') {
    // PayPal: due "P" sovrapposte (logo classico). Sfondo blu primario #003087,
    // P davanti bianca, P retro azzurra #009CDE — i tre colori del marchio ufficiale.
    return (
      <div style={{...wrap, background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M7 4h7.5c2.4 0 4 1.3 3.6 3.7-.4 2.6-2.2 4-5 4h-3l-1 5.3H6L7 4z" fill="#009CDE"/>
          <path d="M9.5 7h6c2 0 3.2 1.1 2.8 3.2-.4 2.4-1.9 3.5-4.4 3.5H12L11.2 18H9L9.5 7z" fill="#fff"/>
        </svg>
      </div>
    );
  }
  if (provider === 'klarna') {
    // Klarna: monogramma "K" stilizzato tipo wordmark recente — su fondo "smoothie pink"
    // ufficiale del brand 2018+ (#FFA8CD). Glyph nero per massimo contrasto.
    return (
      <div style={{...wrap, background: '#FFA8CD', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4 V20"/>
          <path d="M7 12 L15 4"/>
          <path d="M7 12 L17 20"/>
        </svg>
      </div>
    );
  }
  if (provider === 'satispay') {
    // Satispay: "S" curva bianca su fondo rosso brand (#FF3131 — versione corrente).
    // Lo stroke 2px replica il peso ottico del wordmark Satispay.
    return (
      <div style={{...wrap, background: '#FF3131', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 7c-1.5-1.2-3.4-1.8-5.2-1.8-2.8 0-4.7 1.4-4.7 3.4 0 1.7 1.4 2.5 4 2.9 3 .6 4.9 1.4 4.9 3.7 0 2.2-1.9 3.6-5.2 3.6-2 0-3.9-.5-5.4-1.5"/>
        </svg>
      </div>
    );
  }
  // Fallback testuale neutro — non si rompe se passa un provider non gestito
  return (
    <div style={{...wrap, background: ONB.BG, border: '1px solid rgba(15,17,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <span style={{fontSize: 11, fontWeight: 600, color: ONB.MUTED}}>{provider?.[0]?.toUpperCase() || '?'}</span>
    </div>
  );
}

// MethodRow — riga full-width per i metodi opzionali (PayPal/Klarna/Satispay).
// Layout list con border-bottom: pattern Stripe/Linear per le option list dense.
function MethodRow({provider, label, desc, checked, onToggle}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0',
      borderBottom: '1px solid rgba(15, 17, 21, 0.04)',
      cursor: 'pointer',
    }}>
      <PaymentBrandIcon provider={provider}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 14, fontWeight: 500, color: ONB.TEXT, lineHeight: 1.4}}>
          {label}
        </div>
        <div style={{fontSize: 13, fontWeight: 400, color: ONB.MUTED, lineHeight: 1.4, marginTop: 2}}>
          {desc}
        </div>
      </div>
      <Checkbox checked={checked} onChange={onToggle}/>
    </label>
  );
}

function StripeConnectRow({status, onConnect, onDisconnect}) {
  const connected = status === 'connected';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: 16,
      background: connected ? '#F8FBF9' : ONB.BG_SOFT,
      border: `1px solid ${connected ? 'rgba(22, 163, 74, 0.16)' : 'rgba(15, 17, 21, 0.08)'}`,
      borderRadius: 8,
    }}>
      {/* Stripe brand mark — semplice, color official */}
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: '#635BFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{fontSize: 18, fontWeight: 600, color: '#fff'}}>S</span>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 14, fontWeight: 600, color: ONB.TEXT, lineHeight: 1.4}}>
          Stripe
        </div>
        <div style={{fontSize: 13, fontWeight: 400, color: ONB.MUTED, lineHeight: 1.4, marginTop: 2}}>
          {connected
            ? 'Connesso — acct_••••dE3v'
            : 'Collega per accettare da subito carte e pagamenti digitali.'}
        </div>
      </div>
      {connected ? (
        <button onClick={onDisconnect} style={{
          height: 36, padding: '0 14px',
          background: 'transparent', border: 'none',
          color: ONB.MUTED, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer', borderRadius: 6,
        }}>
          Disconnetti
        </button>
      ) : (
        <button onClick={onConnect} style={{
          height: 36, padding: '0 16px',
          background: ONB.ACTION_SECONDARY, color: '#fff',
          border: 'none', borderRadius: 8,
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 150ms ease-out',
        }}>
          Connetti
          <OnbIcon.ArrowRight size={11} color="#fff"/>
        </button>
      )}
    </div>
  );
}

function Checkbox({checked, onChange}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 18, height: 18, borderRadius: 4,
        background: checked ? ONB.ACTION_SECONDARY : '#fff',
        border: `1.5px solid ${checked ? ONB.ACTION_SECONDARY : 'rgba(15, 17, 21, 0.18)'}`,
        cursor: 'pointer', padding: 0, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms ease-out',
      }}
    >
      {checked && <OnbIcon.Check size={11} color="#fff"/>}
    </button>
  );
}

window.Step2Locale = Step2Locale;

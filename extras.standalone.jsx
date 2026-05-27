/* global React, ReactDOM */
// extras.jsx — Profile, Venue, Booking sheet, fancy food icons
const { useState, useEffect, useRef } = React;

// ─── Tokens (mirror app.jsx) ────────────────────────────────
const PINK_X = '#FF5A5F';
const TEXT_X = '#1F1A1B';
const MUTED_X = '#7A7176';
const BG_X = '#F5F5F5';
const BORDER_X = '#EAE6E7';

// ─── Fancy food category illustrations (Deliveroo-style) ────
// Round colored disc + flat illustrative emoji-like glyph.
const FoodArt = {
  Pizza: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <defs>
        <radialGradient id="pizDisc" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6E0"/><stop offset="1" stopColor="#FFE2A8"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="#FF6B3D"/>
      <circle cx="40" cy="40" r="24" fill="url(#pizDisc)"/>
      <circle cx="32" cy="34" r="3.6" fill="#D63D2A"/>
      <circle cx="46" cy="32" r="3.2" fill="#D63D2A"/>
      <circle cx="44" cy="46" r="3.4" fill="#D63D2A"/>
      <circle cx="32" cy="46" r="2.4" fill="#7CB342"/>
      <circle cx="49" cy="42" r="2" fill="#7CB342"/>
    </svg>
  ),
  Sushi: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFE5EE"/>
      <ellipse cx="40" cy="44" rx="22" ry="14" fill="#FAFAFA" stroke="#1F1A1B" strokeWidth="2.5"/>
      <ellipse cx="40" cy="42" rx="14" ry="8" fill="#FF7AA2"/>
      <path d="M 28 42 q 4 -2 8 0 t 8 0" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7"/>
    </svg>
  ),
  Burger: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFE0B3"/>
      <path d="M 18 32 q 22 -18 44 0 z" fill="#E8A55A"/>
      <circle cx="32" cy="26" r="1.3" fill="#fff" opacity="0.8"/>
      <circle cx="42" cy="23" r="1.3" fill="#fff" opacity="0.8"/>
      <circle cx="50" cy="27" r="1.3" fill="#fff" opacity="0.8"/>
      <rect x="18" y="33" width="44" height="4" fill="#7CB342"/>
      <rect x="18" y="36" width="44" height="6" fill="#FFC727"/>
      <rect x="18" y="41" width="44" height="6" fill="#8A4A2A"/>
      <path d="M 18 47 q 22 12 44 0 v -2 h -44 z" fill="#E8A55A"/>
    </svg>
  ),
  Gelato: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFE8F2"/>
      <path d="M 28 50 L 40 70 L 52 50 z" fill="#D9A26B"/>
      <path d="M 28 50 q 12 -6 24 0" stroke="#A87444" strokeWidth="1.2" fill="none"/>
      <circle cx="34" cy="44" r="10" fill="#FF8FB1"/>
      <circle cx="46" cy="44" r="10" fill="#FFD0A0"/>
      <circle cx="40" cy="34" r="10" fill="#FFC1D8"/>
      <circle cx="38" cy="30" r="1.5" fill="#fff" opacity="0.6"/>
    </svg>
  ),
  Sandwich: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFF1D6"/>
      <path d="M 18 30 L 40 16 L 62 30 L 62 50 L 40 64 L 18 50 z" fill="#E8A55A"/>
      <rect x="18" y="34" width="44" height="3" fill="#7CB342"/>
      <rect x="18" y="37" width="44" height="5" fill="#FF7B6B"/>
      <rect x="18" y="42" width="44" height="3" fill="#FFD75C"/>
      <path d="M 18 45 L 62 45 L 62 50 L 40 64 L 18 50 z" fill="#D78A48"/>
    </svg>
  ),
  Brunch: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFF0D6"/>
      <ellipse cx="40" cy="44" rx="22" ry="14" fill="#FAFAFA" stroke="#1F1A1B" strokeWidth="2"/>
      <ellipse cx="40" cy="42" rx="10" ry="7" fill="#FFE08A"/>
      <ellipse cx="40" cy="42" rx="3.5" ry="2.5" fill="#FFB300"/>
      <rect x="22" y="40" width="6" height="6" rx="1" fill="#C76B3A"/>
      <rect x="52" y="40" width="6" height="6" rx="1" fill="#C76B3A"/>
    </svg>
  ),
  Cocktail: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFE0EB"/>
      <path d="M 22 24 L 58 24 L 42 48 L 38 48 z" fill="#FF4F87"/>
      <path d="M 28 28 L 52 28 L 42 42 L 38 42 z" fill="#FFB3CD" opacity="0.5"/>
      <rect x="38" y="48" width="4" height="14" fill="#1F1A1B"/>
      <rect x="32" y="60" width="16" height="3" rx="1.5" fill="#1F1A1B"/>
      <circle cx="36" cy="22" r="3" fill="#7CB342"/>
    </svg>
  ),
  Leaf: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#E5F4D9"/>
      <path d="M 26 54 q -6 -22 14 -34 q 18 -10 22 8 q 4 18 -14 26 q -16 8 -22 0 z" fill="#7CB342"/>
      <path d="M 28 52 q 4 -18 18 -28" stroke="#5B8A2A" strokeWidth="2" fill="none"/>
      <path d="M 32 48 l 6 -2 M 38 42 l 6 -2 M 44 36 l 5 -2" stroke="#5B8A2A" strokeWidth="1.4"/>
    </svg>
  ),
  Wheat: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#FFF1D0"/>
      <line x1="40" y1="20" x2="40" y2="60" stroke="#A87444" strokeWidth="2"/>
      <ellipse cx="34" cy="28" rx="4" ry="6" fill="#E8A55A" transform="rotate(-25 34 28)"/>
      <ellipse cx="46" cy="28" rx="4" ry="6" fill="#E8A55A" transform="rotate(25 46 28)"/>
      <ellipse cx="32" cy="38" rx="4" ry="6" fill="#E8A55A" transform="rotate(-25 32 38)"/>
      <ellipse cx="48" cy="38" rx="4" ry="6" fill="#E8A55A" transform="rotate(25 48 38)"/>
      <ellipse cx="32" cy="48" rx="4" ry="6" fill="#E8A55A" transform="rotate(-25 32 48)"/>
      <ellipse cx="48" cy="48" rx="4" ry="6" fill="#E8A55A" transform="rotate(25 48 48)"/>
      <line x1="40" y1="20" x2="40" y2="22" stroke="#7CB342" strokeWidth="3"/>
    </svg>
  ),
  Bowl: ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="#E5F4D9"/>
      <path d="M 18 40 q 22 22 44 0 z" fill="#FAFAFA" stroke="#1F1A1B" strokeWidth="2"/>
      <circle cx="32" cy="38" r="3" fill="#FF7B6B"/>
      <circle cx="40" cy="36" r="3" fill="#FFB300"/>
      <circle cx="48" cy="38" r="3" fill="#7CB342"/>
      <circle cx="36" cy="44" r="2.5" fill="#7CB342"/>
      <circle cx="44" cy="44" r="2.5" fill="#FF7B6B"/>
    </svg>
  ),
};

// ─── Profile screen ─────────────────────────────────────────
function ProfileScreen({ onBack, onTabHome }) {
  const Row = ({ label, onClick, danger, right }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '14px 16px', background: '#fff',
      borderRadius: 12, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, color: danger ? '#c44' : TEXT_X, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{label}</span>
      {right || <span style={{ color: MUTED_X, fontSize: 16 }}>›</span>}
    </button>
  );
  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 17, fontWeight: 700, color: TEXT_X, padding: '20px 4px 10px' }}>{children}</div>
  );
  const [waiterMode, setWaiterMode] = useState(false);

  return (
    <div style={{
      width: '100%', height: '100%', background: BG_X, position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT_X, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '60px 18px 110px' }}>
        <button onClick={onBack} aria-label="Indietro" style={{
          width: 36, height: 36, borderRadius: 999, background: '#fff',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 18,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 70, height: 70, borderRadius: 999, overflow: 'hidden', background: '#ddd', flex: '0 0 auto' }}>
            <img src={window.__R('u_15')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Mario Rossi</div>
            <div style={{ fontSize: 13, color: MUTED_X, marginTop: 2 }}>Account N° 00001</div>
          </div>
        </div>

        <SectionTitle>Informazioni account</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Preferenze allergeni"/>
          <Row label="Storico Ordini"/>
          <Row label="Metodi di pagamento"/>
          <Row label="Locali preferiti"/>
        </div>

        <SectionTitle>Account</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Segnala un problema"/>
          <Row label="Gestione Account"/>
          <Row label="Logout" danger/>
        </div>

        <SectionTitle>Il mio byup</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="I miei dati"/>
        </div>

        <SectionTitle>Regolamenti</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Termini e condizioni"/>
          <Row label="Privacy policy"/>
        </div>
      </div>

      {/* Bottom nav (just home + profile, no QR fab) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: '#fff', borderTop: `1px solid ${BORDER_X}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 20,
      }}>
        <button onClick={onTabHome} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 L12 2 L21 9 V20 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 z"/></svg>
          <span style={{ fontSize: 11, color: MUTED_X }}>Home</span>
        </button>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21 q 0 -7 8 -7 t 8 7"/></svg>
          <span style={{ fontSize: 11, color: PINK_X, fontWeight: 600 }}>Profilo</span>
        </button>
      </div>
    </div>
  );
}

// ─── Booking sheet ──────────────────────────────────────────
function BookingSheet({ open, venue, onClose, onConfirm }) {
  const [step, setStep] = useState(0); // 0 form, 1 success
  const [date, setDate] = useState('Sab 4 mag');
  const [time, setTime] = useState('20:30');
  const [people, setPeople] = useState(2);
  const [name, setName] = useState('Mario Rossi');
  const [phone, setPhone] = useState('+39 333 1234567');
  const [note, setNote] = useState('');

  useEffect(() => { if (open) setStep(0); }, [open]);
  if (!open) return null;

  const dates = ['Sab 4 mag', 'Dom 5 mag', 'Lun 6 mag', 'Mar 7 mag', 'Mer 8 mag', 'Gio 9 mag', 'Ven 10 mag'];
  const times = ['12:30','13:00','13:30','19:30','20:00','20:30','21:00','21:30','22:00'];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '88%', background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: '#e0dcdd', margin: '0 auto 10px' }}/>

        {step === 0 ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Prenota un tavolo</div>
            <div style={{ fontSize: 13, color: MUTED_X, marginBottom: 18 }}>{venue?.name || 'Ristorante'}</div>

            <Field label="Data">
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, margin: '0 -20px', padding: '0 20px 4px' }}>
                {dates.map(d => (
                  <Pill key={d} active={date===d} onClick={() => setDate(d)}>{d}</Pill>
                ))}
              </div>
            </Field>

            <Field label="Orario">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {times.map(t => (
                  <Pill key={t} active={time===t} onClick={() => setTime(t)}>{t}</Pill>
                ))}
              </div>
            </Field>

            <Field label="Coperti">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => setPeople(p => Math.max(1, p-1))} style={stepperBtn}>−</button>
                <div style={{ fontSize: 20, fontWeight: 700, minWidth: 50, textAlign: 'center' }}>{people}</div>
                <button onClick={() => setPeople(p => Math.min(20, p+1))} style={stepperBtn}>+</button>
                <span style={{ fontSize: 13, color: MUTED_X, marginLeft: 4 }}>{people === 1 ? 'persona' : 'persone'}</span>
              </div>
            </Field>

            <Field label="Nome">
              <Input value={name} onChange={setName}/>
            </Field>
            <Field label="Telefono">
              <Input value={phone} onChange={setPhone}/>
            </Field>
            <Field label="Note (opzionale)">
              <Input value={note} onChange={setNote} placeholder="Allergie, occasione speciale, posto vicino finestra..." multi/>
            </Field>

            <button onClick={() => {
              try {
                localStorage.setItem('byup_booking', JSON.stringify({
                  venue: venue?.name || 'Ristorante',
                  date, time, people, name, phone, note,
                  createdAt: Date.now(),
                }));
              } catch {}
              setStep(1);
            }} style={{
              marginTop: 16, height: 50, background: PINK_X, color: '#fff',
              border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(233,30,99,0.3)',
            }}>Conferma prenotazione</button>
          </>
        ) : (
          <div style={{ padding: '20px 0 8px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: '#E8F5E9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a8a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Prenotazione confermata</div>
            <div style={{ fontSize: 14, color: MUTED_X, marginBottom: 22 }}>
              Ti aspettiamo {date} alle {time} per {people} {people===1?'persona':'persone'}.
            </div>
            <div style={{ background: BG_X, borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 18 }}>
              <RowKV k="Locale" v={venue?.name || 'Ristorante'}/>
              <RowKV k="Data" v={date}/>
              <RowKV k="Orario" v={time}/>
              <RowKV k="Coperti" v={people}/>
              <RowKV k="A nome di" v={name}/>
              <RowKV k="Telefono" v={phone}/>
              {note && <RowKV k="Note" v={note}/>}
            </div>
            <div style={{ fontSize: 12, color: MUTED_X, marginBottom: 12 }}>
              Riceverai un promemoria un'ora prima.
            </div>
            <button onClick={() => { onConfirm?.({ date, time, people, name, phone, note }); }} style={{
              width: '100%', height: 50, background: PINK_X, color: '#fff',
              border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(233,30,99,0.3)',
            }}>Chiudi</button>
          </div>
        )}
      </div>
    </div>
  );
}

const stepperBtn = {
  width: 38, height: 38, borderRadius: 999, border: `1px solid ${BORDER_X}`,
  background: '#fff', fontSize: 20, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', color: TEXT_X,
};
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_X, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', padding: '8px 14px', borderRadius: 999,
      background: active ? TEXT_X : '#fff', color: active ? '#fff' : TEXT_X,
      border: `1px solid ${active ? TEXT_X : BORDER_X}`, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}
function Input({ value, onChange, placeholder, multi }) {
  const Tag = multi ? 'textarea' : 'input';
  return (
    <Tag value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={multi ? 3 : undefined} style={{
      width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${BORDER_X}`,
      fontSize: 14, fontFamily: 'inherit', resize: 'none', background: '#fff', color: TEXT_X,
      outline: 'none', boxSizing: 'border-box',
    }}/>
  );
}
function RowKV({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
      <span style={{ color: MUTED_X }}>{k}</span>
      <span style={{ color: TEXT_X, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

// ─── Venue screen (vetrina locale) ──────────────────────────
function VenueScreen(props) {
  // Read variant from URL ?venue=a|b|c|original (default: a)
  const variant = (() => {
    try {
      const v = new URLSearchParams(window.location.search).get('venue');
      if (['a','b','c','original'].includes(v)) return v;
    } catch {}
    return window.__venueVariant || 'original';
  })();
  if (variant === 'a' && window.VenueA) return <window.VenueA {...props}/>;
  if (variant === 'b' && window.VenueB) return <window.VenueB {...props}/>;
  if (variant === 'c' && window.VenueC) return <window.VenueC {...props}/>;
  return <VenueOriginal {...props}/>;
}

function VenueOriginal({ venue, onBack, onMenu, onBook, onHome, onProfile }) {
  const v = venue || {};
  const photos = v.photos || [
    window.__R('u_0'),
    window.__R('u_16'),
    window.__R('u_1'),
    window.__R('u_3'),
    window.__R('u_17'),
  ];
  const dishes = v.dishes || [
    window.__R('u_9'),
    window.__R('u_18'),
    window.__R('u_19'),
  ];
  const [faqOpen, setFaqOpen] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(null);
  const [reportSent, setReportSent] = useState(false);
  const faqs = [
    { q: 'Siete aperti il sabato?', a: 'Sì, dalle 12:00 alle 23:00 con orario continuato.' },
    { q: 'Avete opzioni vegane?', a: 'Certo, almeno 5 piatti vegani sono sempre disponibili.' },
    { q: 'Posso prenotare per gruppi?', a: 'Sì, fino a 30 persone con preavviso di 24 ore.' },
  ];
  const reviews = [
    { name: 'Giulia M.', initial: 'G', rating: 5, when: '2 giorni fa', text: 'Atmosfera incredibile e cucina autentica. La cacio e pepe è la migliore di Roma.', dish: window.__R('u_20') },
    { name: 'Marco R.', initial: 'M', rating: 5, when: '1 settimana fa', text: 'Servizio impeccabile, vino consigliato dal cameriere perfetto.', dish: window.__R('u_21') },
    { name: 'Sara D.', initial: 'S', rating: 4, when: '2 settimane fa', text: 'Ottima esperienza, tornerò sicuramente con amici.', dish: null },
  ];
  const reportReasons = [
    'Cibo o ambiente non sicuri',
    'Comportamento del personale',
    'Truffa o prezzi scorretti',
    'Discriminazione',
    'Foto o info ingannevoli',
    'Altro motivo',
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT_X, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Floating top buttons (sticky over scroll) */}
      <div style={{
        position: 'absolute', top: 50, left: 16, right: 16, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button style={{
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61 a 5.5 5.5 0 0 0 -7.78 0 L 12 5.67 l -1.06 -1.06 a 5.5 5.5 0 0 0 -7.78 7.78 l 1.06 1.06 L 12 21.23 l 7.78 -7.78 1.06 -1.06 a 5.5 5.5 0 0 0 0 -7.78 z"/></svg>
          </button>
          <button onClick={() => setMoreOpen(true)} style={{
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={TEXT_X}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 200 }}>
        {/* Hero photo — cinematic. Wrapper allows logo to straddle (no overflow:hidden) */}
        <div style={{ position: 'relative', height: 280, background: '#222' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            {/* Dark gradient overlay for text legibility */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)',
            }}/>
          </div>
          {/* Hero text — title left only; logo straddles below */}
          <div style={{
            position: 'absolute', left: 20, right: 88, bottom: 18, color: '#fff',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85, textTransform: 'uppercase' }}>
              Cucina Romana
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {v.name || 'Ristorante Cacio e Pepe'}
            </div>
          </div>
          {/* Logo straddling the photo edge — half inside, half outside */}
          <div style={{
            position: 'absolute', right: 20, bottom: -32, zIndex: 5,
            width: 64, height: 64, borderRadius: 999,
            background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '2.5px solid #fff',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: 999,
              background: 'linear-gradient(135deg, #FFD3DC 0%, #FFB0C0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: PINK_X, fontFamily: 'Georgia, serif',
            }}>CP</div>
          </div>
        </div>

        {/* Status badges row — sit right under the photo; logo straddles to the right */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 96px 0 20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: '#0a8a3a', background: '#e6f5e9',
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>● APERTO</span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: TEXT_X, background: '#FFE8B0',
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>🏆 TOP 10 ROMA</span>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          {/* Address + hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10 c 0 7 -9 13 -9 13 s -9 -6 -9 -13 a 9 9 0 0 1 18 0 z"/><circle cx="12" cy="10" r="3"/></svg>
              Via dei Gracchi 56, 00187 Roma
            </div>
            <div style={{ fontSize: 13.5, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Lun – Ven · 11:00 – 23:00
            </div>
          </div>

          {/* Recensione media */}
          <div style={{ marginTop: 18, marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 10 }}>
              Recensione media
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[1,2,3,4,5].map(n => {
                const filled = n <= Math.round(4.8);
                return (
                  <div key={n} style={{
                    width: 30, height: 30, borderRadius: 7,
                    background: filled ? PINK_X : '#f0e6e9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                );
              })}
              <div style={{ marginLeft: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: TEXT_X }}>4.8</span>
                <span style={{ fontSize: 12, color: MUTED_X, fontWeight: 500 }}>· 320 rec.</span>
              </div>
            </div>
          </div>

          {/* Promo / Eventi */}
          <Section title="Promo / Eventi">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <PromoTag>Aperitivo 2x1</PromoTag>
              <PromoTag>Karaoke venerdì</PromoTag>
              <PromoTag>Brunch domenica</PromoTag>
            </div>
          </Section>

          {/* Premi */}
          <Section title="Premi e riconoscimenti">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <AwardTag>Top 10 Roma 2025</AwardTag>
              <AwardTag>Gambero Rosso</AwardTag>
              <AwardTag>Tripadvisor Excellence</AwardTag>
            </div>
          </Section>

          {/* Bio */}
          <Section title="La nostra storia">
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: TEXT_X }}>
              Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno. <span style={{ color: PINK_X, fontWeight: 600, cursor: 'pointer' }}>...Altro</span>
            </div>
          </Section>

          {/* Piatti in evidenza */}
          <Section title="Chef consiglia">
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
              {dishes.map((p, i) => {
                const names = ['Cacio e Pepe', 'Carbonara', 'Amatriciana'];
                const prices = ['14€', '16€', '15€'];
                return (
                  <div key={i} style={{ flex: '0 0 auto', width: 160, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ height: 110, overflow: 'hidden' }}>
                      <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_X }}>{names[i]}</div>
                      <div style={{ fontSize: 12, color: TEXT_X, fontWeight: 700, marginTop: 2 }}>{prices[i]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Recensioni */}
          <Section title="Cosa dicono di noi">
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -20px', padding: '0 20px 4px' }}>
              {reviews.map((r, i) => (
                <div key={i} style={{
                  flex: '0 0 auto', width: 240, padding: 14, borderRadius: 14,
                  background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999, background: PINK_X,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>{r.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_X }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: MUTED_X }}>{r.when}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= r.rating ? PINK_X : '#e0d8db'}><polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9"/></svg>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: TEXT_X }}>{r.text}</div>
                  {r.dish && (
                    <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={r.dish} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Mappa */}
          <Section title="Dove siamo">
            <div style={{ height: 140, borderRadius: 14, overflow: 'hidden', background: '#dde7f0', position: 'relative' }}>
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #e8eef5 0%, #d8e2ec 100%)',
                position: 'relative',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 300 140" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="20" y1="40" x2="280" y2="60" stroke="#fff" strokeWidth="3"/>
                  <line x1="60" y1="0" x2="100" y2="140" stroke="#fff" strokeWidth="2"/>
                  <line x1="0" y1="100" x2="300" y2="90" stroke="#fff" strokeWidth="2"/>
                  <line x1="200" y1="0" x2="240" y2="140" stroke="#fff" strokeWidth="2"/>
                  <circle cx="150" cy="70" r="10" fill={TEXT_X}/>
                  <circle cx="150" cy="70" r="4" fill="#fff"/>
                </svg>
              </div>
              <button style={{
                position: 'absolute', bottom: 12, right: 12,
                background: '#fff', border: 'none', borderRadius: 999,
                padding: '8px 14px', fontSize: 12, fontWeight: 700, color: TEXT_X,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}>Indicazioni →</button>
            </div>
          </Section>

          {/* Altre info */}
          <Section title="Altre info">
            <div style={{ background: BG_X, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow icon="P" label="Parcheggio custodito Via Giulia"/>
              <InfoRow icon="M" label="Metro Tiburtina linea B · Bus 54, 60, 12, 40"/>
            </div>
          </Section>

          {/* Altre sedi */}
          <Section title="Altre sedi">
            <SedeRow city="Milano" addr="Corso Venezia 50"/>
            <div style={{ height: 8 }}/>
            <SedeRow city="Firenze" addr="Via dei Calzaiuoli 12"/>
          </Section>

          {/* FAQ */}
          <Section title="Domande frequenti">
            {faqs.map((f, i) => (
              <div key={i} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} style={{
                borderBottom: `1px solid ${BORDER_X}`, padding: '12px 0', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: TEXT_X }}>{f.q}</span>
                  <span style={{ color: MUTED_X, transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>⌄</span>
                </div>
                {faqOpen === i && <div style={{ fontSize: 13, color: MUTED_X, marginTop: 8, lineHeight: 1.5 }}>{f.a}</div>}
              </div>
            ))}
          </Section>

          {/* Galleria */}
          <Section title="Galleria fotografica">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ gridRow: 'span 2', borderRadius: 12, overflow: 'hidden', height: 200 }}>
                <img src={photos[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 96 }}>
                <img src={photos[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 96 }}>
                <img src={photos[3]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            </div>
          </Section>

          {/* Social */}
          <Section title="Canali Social">
            <div style={{ display: 'flex', gap: 12 }}>
              <SocialDot label="f"/>
              <SocialDot label="ig"/>
              <SocialDot label="yt"/>
            </div>
          </Section>
        </div>
      </div>

      {/* More menu (kebab) */}
      {moreOpen && (
        <div onClick={() => setMoreOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 20,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 0 30px',
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8db', borderRadius: 999, margin: '8px auto 12px' }}/>
            <MoreRow label="Condividi" icon="↗"/>
            <MoreRow label="Aggiungi ai preferiti" icon="♡"/>
            <MoreRow label="Copia indirizzo" icon="⎘"/>
            <div style={{ height: 1, background: BORDER_X, margin: '6px 20px' }}/>
            <MoreRow label="Segnala questo locale" icon="⚠" danger
              onClick={() => { setMoreOpen(false); setReportOpen(true); setReportSent(false); setReportReason(null); }}/>
          </div>
        </div>
      )}

      {/* Report sheet */}
      {reportOpen && (
        <div onClick={() => setReportOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 25,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 20px 30px', maxHeight: '80%', overflowY: 'auto',
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8db', borderRadius: 999, margin: '8px auto 16px' }}/>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Segnalazione inviata</div>
                <div style={{ fontSize: 13.5, color: MUTED_X, lineHeight: 1.5, marginBottom: 20 }}>
                  Il team byup la esaminerà entro 48 ore. Ti aggiorneremo via email.
                </div>
                <button onClick={() => setReportOpen(false)} style={{
                  width: '100%', height: 50, background: TEXT_X, color: '#fff',
                  border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Chiudi</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Segnala questo locale</div>
                <div style={{ fontSize: 13, color: MUTED_X, lineHeight: 1.5, marginBottom: 16 }}>
                  Aiutaci a mantenere byup sicuro. Le tue segnalazioni sono anonime per il locale e revisionate dal nostro team.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {reportReasons.map(r => (
                    <button key={r} onClick={() => setReportReason(r)} style={{
                      textAlign: 'left', padding: '14px 16px', borderRadius: 12,
                      border: `1.5px solid ${reportReason === r ? PINK_X : BORDER_X}`,
                      background: reportReason === r ? '#fde8ef' : '#fff',
                      fontSize: 14, color: TEXT_X, fontWeight: reportReason === r ? 600 : 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{r}</span>
                      {reportReason === r && <span style={{ color: PINK_X, fontWeight: 700 }}>✓</span>}
                    </button>
                  ))}
                </div>
                <textarea placeholder="Vuoi aggiungere dettagli? (opzionale)" style={{
                  width: '100%', minHeight: 80, padding: 12, borderRadius: 12,
                  border: `1px solid ${BORDER_X}`, fontSize: 13.5, fontFamily: 'inherit',
                  resize: 'none', marginBottom: 16, boxSizing: 'border-box',
                }}/>
                <button disabled={!reportReason} onClick={() => setReportSent(true)} style={{
                  width: '100%', height: 50,
                  background: reportReason ? PINK_X : '#f0e8ea',
                  color: reportReason ? '#fff' : MUTED_X,
                  border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: reportReason ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                }}>Invia segnalazione</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sticky CTA — sits above tab bar */}
      <div style={{
        position: 'absolute', bottom: 96, left: 0, right: 0,
        padding: '14px 20px 8px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 25%)',
        display: 'flex', gap: 10, zIndex: 10,
      }}>
        <button onClick={onMenu} style={{
          flex: 1, height: 50, background: '#fff', color: TEXT_X,
          border: `1.5px solid ${TEXT_X}`, borderRadius: 999, fontSize: 14.5, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Menù</button>
        <button onClick={onBook} style={{
          flex: 1.2, height: 50, background: PINK_X, color: '#fff',
          border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(233,30,99,0.3)',
        }}>Prenota</button>
      </div>

      {/* Bottom tab bar */}
      {window.BottomTabBar && (
        <window.BottomTabBar active="home" onHome={onHome} onProfile={onProfile} showQR={false}/>
      )}
    </div>
  );
}

function Stat({ top, bot }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: `1px solid ${BORDER_X}`, padding: '0 4px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_X, whiteSpace: 'nowrap' }}>{top}</div>
      <div style={{ fontSize: 10.5, color: MUTED_X, marginTop: 2, whiteSpace: 'nowrap' }}>{bot}</div>
    </div>
  );
}
function MoreRow({ label, icon, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 22px', background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left',
      color: danger ? '#c44' : TEXT_X, fontSize: 14.5, fontWeight: 500,
    }}>
      <span style={{ fontSize: 18, width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function VTag({ children, color }) {
  return (
    <span style={{
      background: color, color: TEXT_X, padding: '6px 12px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}
// Promo/Eventi: famiglia calda uniforme, dot byup come accento
function PromoTag({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: '#FFF4E8', color: TEXT_X, padding: '6px 12px 6px 10px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: PINK_X, flexShrink: 0 }}/>
      {children}
    </span>
  );
}
// Premi: outline minimal con icona alloro
function AwardTag({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#fff', color: TEXT_X, padding: '6px 12px 6px 10px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
      border: `1px solid ${BORDER_X}`,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9 a 6 6 0 0 0 12 0 V3 H6 z M12 15 v 6 M8 21 h 8"/>
      </svg>
      {children}
    </span>
  );
}
function InfoRow({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: '#fff', border: `1px solid ${BORDER_X}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: TEXT_X }}>{icon}</div>
      <div style={{ fontSize: 13, color: TEXT_X, flex: 1 }}>{label}</div>
    </div>
  );
}
function SedeRow({ city, addr }) {
  return (
    <div style={{ background: BG_X, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{city}</div>
      <div style={{ fontSize: 12.5, color: MUTED_X }}>{addr}</div>
    </div>
  );
}
function SocialDot({ label }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 999, background: TEXT_X, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, fontFamily: 'serif',
    }}>{label}</div>
  );
}

Object.assign(window, { ProfileScreen, VenueScreen, BookingSheet, FoodArt });

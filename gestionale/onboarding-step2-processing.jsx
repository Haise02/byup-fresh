// Step 2: AI processing animation

function Step2Processing({ onNext }) {
  const [progress, setProgress] = React.useState(0);
  const [currentTask, setCurrentTask] = React.useState(0);

  const tasks = [
    { label: 'Lettura del PDF...', detail: 'Estrazione testo e struttura', duration: 1200 },
    { label: 'Identificazione categorie...', detail: 'Trovate 5 categorie: Antipasti, Primi, Secondi, Dolci, Bevande', duration: 1400 },
    { label: 'Estrazione piatti e prezzi...', detail: '23 piatti identificati', duration: 1600 },
    { label: 'Analisi allergeni...', detail: 'Glutine, latte, uova, frutta a guscio', duration: 1300 },
    { label: 'Generazione descrizioni...', detail: 'Suggerimenti basati su ingredienti tipici', duration: 1500 },
    { label: 'Calcolo valori nutrizionali...', detail: 'Stima kcal, proteine, carboidrati, grassi', duration: 1100 },
    { label: 'Quasi pronto...', detail: 'Ultimo controllo qualità', duration: 900 },
  ];

  const totalDuration = tasks.reduce((s,t) => s + t.duration, 0);
  const elapsedBefore = tasks.slice(0, currentTask).reduce((s,t) => s + t.duration, 0);
  const remainingMs = Math.max(0, totalDuration - elapsedBefore - (progress / 100 * totalDuration - elapsedBefore));
  const secondsLeft = Math.max(1, Math.ceil((totalDuration - (progress / 100) * totalDuration) / 1000));

  React.useEffect(() => {
    if (currentTask >= tasks.length) {
      const t = setTimeout(() => onNext && onNext(), 600);
      return () => clearTimeout(t);
    }
    const start = Date.now();
    const dur = tasks[currentTask].duration;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const taskProgress = Math.min(elapsed / dur, 1);
      const overall = ((currentTask + taskProgress) / tasks.length) * 100;
      setProgress(overall);
      if (taskProgress >= 1) {
        clearInterval(interval);
        setCurrentTask(c => c + 1);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [currentTask]);

  return (
    <div style={{padding:'80px 48px', background:ONB.BG_SOFT, minHeight:760}}>
      <div style={{maxWidth:680, margin:'0 auto', textAlign:'center'}}>
        {/* Animated AI orb */}
        <div style={{
          position:'relative', width:140, height:140, margin:'0 auto 36px',
        }}>
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%',
            background:`conic-gradient(from 0deg, ${ONB.PINK}, ${ONB.PURPLE}, ${ONB.PINK})`,
            animation:'spin 2.5s linear infinite',
          }}/>
          <div style={{
            position:'absolute', inset:8, borderRadius:'50%',
            background:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <OnbIcon.Sparkle size={56} color={ONB.PINK}/>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>

        <h1 style={{fontSize:34, fontWeight:800, margin:'0 0 10px', letterSpacing:-0.8}}>
          Stiamo ricreando il tuo menu
        </h1>
        <p style={{fontSize:15, color:ONB.MUTED, margin:'0 0 40px'}}>
          Pronto in: <b style={{color:ONB.TEXT, fontVariantNumeric:'tabular-nums'}}>{secondsLeft}s</b>
        </p>

        {/* Progress bar */}
        <div style={{
          background:'#fff', borderRadius:16, padding:'24px 28px',
          border:`1px solid ${ONB.BORDER_SOFT}`, textAlign:'left',
          boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <span style={{fontSize:13, fontWeight:700, color:ONB.TEXT}}>Avanzamento</span>
            <span style={{fontSize:13, fontWeight:700, color:ONB.PINK}}>{Math.round(progress)}%</span>
          </div>
          <div style={{height:8, background:ONB.BG, borderRadius:999, overflow:'hidden', marginBottom:24}}>
            <div style={{
              height:'100%', width:`${progress}%`,
              background:`linear-gradient(90deg, ${ONB.PINK}, ${ONB.PURPLE})`,
              borderRadius:999, transition:'width .15s linear',
            }}/>
          </div>

          {/* Task list */}
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {tasks.map((t, i) => {
              const done = i < currentTask;
              const active = i === currentTask;
              if (i > currentTask) return null;
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'10px 12px', borderRadius:8,
                  background: active ? ONB.PINK_SOFT : 'transparent',
                  opacity: done ? 0.55 : 1,
                  transition:'all .3s',
                }}>
                  <div style={{
                    width:22, height:22, borderRadius:'50%',
                    background: done ? ONB.GREEN : active ? ONB.PINK : ONB.BORDER,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0,
                  }}>
                    {done ? <OnbIcon.Check size={11}/> : active ? (
                      <div style={{
                        width:8, height:8, borderRadius:'50%', background:'#fff',
                        animation:'pulse 1s ease-in-out infinite',
                      }}/>
                    ) : null}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14, fontWeight: active?700:500, color:ONB.TEXT}}>
                      {t.label}
                    </div>
                    {(done || active) && (
                      <div style={{fontSize:12, color:ONB.MUTED, marginTop:2}}>{t.detail}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)} }`}</style>
        </div>

        <p style={{fontSize:12, color:ONB.MUTED_LIGHT, marginTop:20}}>
          🔒 I tuoi dati sono privati e non vengono usati per allenare modelli
        </p>
      </div>
    </div>
  );
}

window.Step2Processing = Step2Processing;

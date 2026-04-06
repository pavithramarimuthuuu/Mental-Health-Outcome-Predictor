import { useEffect, useState } from 'react';
import { translate } from '../utils/i18n';

function getInitialMinutes() {
  const stored = Number(localStorage.getItem('focus_minutes') || '30');
  return Number.isNaN(stored) ? 30 : stored;
}

export default function FocusZone() {
  const [minutes, setMinutes] = useState(getInitialMinutes);
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [task, setTask] = useState('Meditation');
  const [customTask, setCustomTask] = useState('');


  const [language, setLanguage] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return localStorage.getItem(`lang_${user.email}`) || 'English';
  });

  useEffect(() => {
    const onLangChange = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setLanguage(localStorage.getItem(`lang_${user.email}`) || 'English');
    };
    window.addEventListener('languageChange', onLangChange);
    return () => window.removeEventListener('languageChange', onLangChange);
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && secondsLeft > 0) {
      timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    }
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft]);

  const handleMinutesChange = (value) => {
    const v = Number(value);
    if (Number.isNaN(v) || v <= 0) return;
    setMinutes(v);
    localStorage.setItem('focus_minutes', String(v));
    if (!isRunning) setSecondsLeft(v * 60);
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    setSecondsLeft(minutes * 60);
    setIsRunning(true);
  };



  const minutesDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secondsDisplay = String(secondsLeft % 60).padStart(2, '0');

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const daysArray = [];
  for (let i = 0; i < firstDay; i += 1) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) daysArray.push(d);

  return (
    <div className="animate-fade-in" style={{ color: 'var(--text-main)' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>{translate(language, 'focusZone')}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* Pomodoro card */}
        <div
          className="card"
          style={{
            margin: 0,
            padding: '1.8rem',
            borderRadius: '20px',
            flex: '1 1 320px',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--input-border)',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>Pomodoro Timer</h2>
          <p style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Choose a focus activity, set a timer, and let Mental Health Predictor hold the space while you work.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Task</div>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="input-field"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)', minWidth: '150px' }}
              >
                <option>Meditation</option>
                <option>Yoga</option>
                <option>Exercise</option>
                <option>Relax</option>
                <option>Study</option>
                <option>Other</option>
              </select>
              {task === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify task..."
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  className="input-field"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)', minWidth: '150px' }}
                />
              )}
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Duration</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  className="input-field"
                  style={{ width: '70px', textAlign: 'center', background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)', margin: 0 }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>mins</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Countdown</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                {minutesDisplay}:{secondsDisplay}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              onClick={handleStartStop}
              style={{
                borderRadius: '999px',
                paddingInline: '1.8rem',
                background: isRunning ? 'var(--error-color)' : 'var(--primary-color)',
                color: 'white'
              }}
            >
              {isRunning ? 'Stop' : 'Start'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setIsRunning(false); setSecondsLeft(minutes * 60); }}
              style={{
                borderRadius: '999px',
                paddingInline: '1.8rem'
              }}
            >
              Restart
            </button>
          </div>
        </div>

        {/* Calendar card */}
        <div
          className="card"
          style={{
            margin: 0,
            padding: '1.5rem',
            borderRadius: '20px',
            flex: '1 1 320px',
            background: 'var(--card-bg)',
            border: '1px solid var(--input-border)',
            color: 'var(--text-main)',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.05rem', color: 'var(--text-main)' }}>Calendar</h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {today.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.25rem', fontSize: '0.75rem' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <div key={d} style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                {d}
              </div>
            ))}
            {daysArray.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isToday = day === today.getDate();
              return (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    padding: '0.35rem 0',
                    borderRadius: '999px',
                    background: isToday ? 'var(--primary-color)' : 'var(--bg-color)',
                    color: isToday ? 'white' : 'var(--text-main)',
                    fontWeight: isToday ? 700 : 500,
                    fontSize: '0.75rem',
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>


    </div>
  );
}

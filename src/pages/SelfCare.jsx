import { useEffect, useMemo, useState } from 'react';
import { translate } from '../utils/i18n';
import yogaImg from '../assets/yoga.png';

const FORTUNE_TEXTS = [
  'The moment you stop rushing, life catches up to you.',
  'Your peace matters more than perfect outcomes.',
  'Small pauses build strong minds.',
  'You are allowed to rest before you are exhausted.',
  'Healing is not linear, but every step counts.',
  'Gentle routines create powerful change.',
  'Progress is still progress, even when it is quiet.',
  'You do not need to carry everything alone.',
  'Be kind to yourself while you grow.',
  'One calm breath can reset your day.',
  'You are doing better than you think.',
  'Your feelings are valid and worth listening to.',
  'Slow down. You are not behind.',
  'Rest is not laziness, it is recovery.',
  'Boundaries are a form of self-respect.',
  'You can begin again at any moment.',
  'Today, choose peace over pressure.',
  'A five-minute reset is still self-care.',
  'Your mind deserves softness too.',
  'Release what you cannot control.',
  'Consistency beats intensity.',
  'Nourish your body, your mind will thank you.',
  'It is okay to ask for help.',
  'You are allowed to outgrow old patterns.',
  'Kindness to self is strength.',
  'Take one task at a time.',
  'Your worth is not your productivity.',
  'Protect your energy like your future depends on it.',
  'You are not your worst day.',
  'Simple habits can heal heavy weeks.',
  'Pause. Breathe. Continue.',
  'Choose a softer pace today.',
  'Your nervous system needs safety, not speed.',
  'Growth can look like saying no.',
  'Keep your promises to yourself.',
  'Calm is a skill you can practice.',
  'You deserve the care you give others.',
  'Try again with compassion, not criticism.',
  'A calm morning can change your whole day.',
  'Listen to your body when it whispers.',
  'It is brave to slow down.',
  'Your next chapter can be lighter.',
  'You can be both healing and productive.',
  'Tiny wins matter.',
  'Let today be enough.',
  'Even cloudy days pass.',
  'Your breath is your anchor.',
  'You are safe to take up space.',
  'Softness is not weakness.',
  'Create a life that feels good from the inside out.',
];

const CARD_BACKGROUNDS = [
  'linear-gradient(180deg,#d7c7f5,#c3b0eb)',
  'linear-gradient(180deg,#d9d8f5,#f4e1ea)',
  'linear-gradient(180deg,#cfc7f7,#efe8ff)',
  'linear-gradient(180deg,#e2d4f2,#f6e8f2)',
  'linear-gradient(180deg,#d4d8f8,#f5eef8)',
];

export default function SelfCare() {
  const [tab, setTab] = useState('fortune');
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * FORTUNE_TEXTS.length));
  const [showFortuneIntro, setShowFortuneIntro] = useState(true);
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selfcare_saved_cards') || '[]');
    } catch {
      return [];
    }
  });
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

  const currentCard = useMemo(() => {
    const text = FORTUNE_TEXTS[currentIndex];
    const background = CARD_BACKGROUNDS[currentIndex % CARD_BACKGROUNDS.length];
    return { id: currentIndex, text, background };
  }, [currentIndex]);

  const shuffle = () => {
    setShowFortuneIntro(false);
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * FORTUNE_TEXTS.length);
    }
    setCurrentIndex(next);
  };

  const saveCard = () => {
    if (showFortuneIntro) return;
    if (saved.some((s) => s.id === currentCard.id)) return;
    const updated = [currentCard, ...saved].slice(0, 100);
    setSaved(updated);
    localStorage.setItem('selfcare_saved_cards', JSON.stringify(updated));
  };

  const renderIntroCard = () => (
    <div
      style={{
        width: '100%',
        maxWidth: '360px',
        height: '500px',
        borderRadius: '18px',
        padding: '1.2rem',
        background: 'linear-gradient(180deg,#b7a9ea,#b2a2e6)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '10px', left: '0', right: 0, display: 'flex', justifyContent: 'space-evenly', opacity: 0.8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff7d0', boxShadow: '0 0 10px #fff7d0' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '3rem', color: '#1f3d5b' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', letterSpacing: '0.04em', fontWeight: 500 }}>PICK A FORTUNE CARD</h2>
        <p style={{ marginTop: '1rem', fontSize: '2rem', fontFamily: 'cursive' }}>Recharge your battery</p>
      </div>
      <div style={{ position: 'absolute', bottom: '2.2rem', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '170px', height: '170px', borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f2d56', fontWeight: 700, overflow: 'hidden' }}>
          <img src={yogaImg} alt="Yoga" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  );

  const renderCard = (card) => (
    <div
      style={{
        width: '100%',
        maxWidth: '360px',
        height: '500px',
        borderRadius: '18px',
        padding: '1.5rem',
        background: card.background,
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '2.2rem', lineHeight: 1.35, color: '#1f3d5b', fontWeight: 600, margin: 0 }}>
        {card.text}
      </p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ color: 'var(--text-main)' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
        {translate(language, 'selfCare')}
      </h1>

      <div
        style={{
          display: 'inline-flex',
          padding: '0.2rem',
          borderRadius: '999px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { id: 'fortune', label: translate(language, 'selfCareCards') },
          { id: 'saved', label: translate(language, 'saved') },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                borderRadius: '999px',
                border: 'none',
                padding: '0.45rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: active ? '#6b4a43' : 'transparent',
                color: active ? 'white' : '#4b5563',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'fortune' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {showFortuneIntro ? renderIntroCard() : renderCard(currentCard)}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn"
              onClick={shuffle}
              style={{ borderRadius: '999px', background: 'linear-gradient(90deg,#7c4a3d,#5d4037)', minWidth: '130px' }}
            >
              {translate(language, 'shuffle')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={saveCard}
              style={{ borderRadius: '999px', minWidth: '110px', opacity: showFortuneIntro ? 0.6 : 1 }}
              disabled={showFortuneIntro}
            >
              {translate(language, 'save')}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
          {saved.length === 0 ? (
            <div className="card" style={{ maxWidth: '100%', margin: 0 }}>
              <h3 style={{ marginTop: 0 }}>{translate(language, 'savedCards')}</h3>
              <p style={{ marginBottom: 0, color: 'var(--text-secondary)' }}>{translate(language, 'noSavedCards')}</p>
            </div>
          ) : (
            saved.map((card) => (
              <div key={`${card.id}-${card.text}`} style={{ transform: 'scale(0.92)', transformOrigin: 'top left' }}>
                {renderCard(card)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


import { NavLink, useLocation } from 'react-router-dom';
import { Activity, ListChecks, Target, LayoutDashboard, Heart, ChevronDown, MessageSquareQuote, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { translate } from '../utils/i18n';

const linkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0.6rem 0.9rem',
  marginBottom: '0.25rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: isActive ? 'white' : 'var(--text-main)',
  background: isActive ? 'var(--primary-color)' : 'transparent',
  border: isActive ? '1px solid var(--primary-color)' : '1px solid transparent',
  transition: 'all 0.15s ease',
});

export default function MhdSidebar() {
  const location = useLocation();
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
  const [wellnessOpen, setWellnessOpen] = useState(true);
  const wellnessRoutes = ['/feedback', '/focus-zone', '/self-care'];
  const isWellnessActive = wellnessRoutes.includes(location.pathname);
  const wellnessButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.6rem 0.9rem',
    marginBottom: '0.25rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: isWellnessActive ? 'white' : 'var(--text-main)',
    background: isWellnessActive ? 'var(--primary-color)' : 'transparent',
    border: isWellnessActive ? '1px solid var(--primary-color)' : '1px solid transparent',
    transition: 'all 0.15s ease',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
  };
  const wellnessChildLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.56rem 0.86rem',
    marginBottom: '0.22rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
    background: isActive ? '#efe3d7' : 'transparent',
    border: isActive ? '1px solid #e3d2c4' : '1px solid transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <aside
      style={{
        width: '240px',
        minHeight: 'calc(100vh - 78px)',
        background: 'var(--card-bg)',
        borderRight: '1px solid var(--input-border)',
        borderTop: '1px solid var(--input-border)',
        padding: '1.25rem 1rem',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'sticky',
        top: '78px',
        left: 0,
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <div
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            color: 'var(--text-main)',
          }}
        >
          MHP
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mental Health Predictor</div>
      </div>

      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          {translate(language, 'clinical')}
        </div>
        <NavLink to="/tests" style={linkStyle}>
          <ListChecks size={16} />
          {translate(language, 'tests')}
        </NavLink>
        <NavLink to="/results" style={linkStyle}>
          <LayoutDashboard size={16} />
          {translate(language, 'dashboard')}
        </NavLink>
        <button
          type="button"
          onClick={() => setWellnessOpen((v) => !v)}
          style={{ ...wellnessButtonStyle, marginTop: '0.9rem', justifyContent: 'space-between' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={14} /> Wellness Corner</span>
          <ChevronDown size={14} style={{ transform: wellnessOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
        </button>
        {wellnessOpen && (
          <div style={{ paddingLeft: '0.2rem' }}>
            <NavLink to="/feedback" style={wellnessChildLinkStyle}>
              <MessageSquareQuote size={16} />
              Feedback
            </NavLink>
            <NavLink to="/focus-zone" style={wellnessChildLinkStyle}>
              <Activity size={16} />
              {translate(language, 'focusZone')}
            </NavLink>
            <NavLink to="/self-care" style={wellnessChildLinkStyle}>
              <Target size={16} />
              {translate(language, 'selfCare')}
            </NavLink>
          </div>
        )}
        <div style={{ marginTop: '0.6rem' }}>
          <NavLink to="/profile" style={linkStyle}>
            <User size={16} />
            {translate(language, 'myProfile')}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}


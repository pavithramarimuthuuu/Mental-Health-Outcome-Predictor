import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { translate } from '../utils/i18n';

export default function Tests() {
  const navigate = useNavigate();
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

  // Filtered list as per user request
  const testList = [
    { title: "DEPRESSION TEST", id: "depression" },
    { title: "ANXIETY TEST", id: "anxiety" },
    { title: "OCD TEST", id: "ocd" },
    { title: "BIPOLAR TEST", id: "bipolar" },
    { title: "SOCIAL ANXIETY TEST", id: "social-anxiety" },
    { title: "POSTPARTUM DEPRESSION TEST (NEW & EXPECTING PARENTS)", id: "postpartum" },
    { title: "PARENT TEST: YOUR CHILD'S MENTAL HEALTH", id: "parent" },
    { title: "YOUTH MENTAL HEALTH TEST", id: "youth" }
  ];

  const handleTestClick = (testId) => {
    if (["depression", "anxiety", "ocd", "bipolar", "social-anxiety", "postpartum", "parent", "youth"].includes(testId)) {
        navigate(`/assessment/${testId}`);
    } else {
        navigate('/assessment'); // Fallback to generic assessment
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '40px 30px', borderRadius: '12px', marginBottom: '40px', border: '1px solid var(--input-border)' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '3rem', fontWeight: 'bold', margin: '0 0 20px 0' }}>Take a {translate(language, 'tests')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 20px 0', maxWidth: '800px' }}>
          Online screening is one of the quickest and easiest ways to see what mental health symptoms you might be experiencing. <strong>It's free, quick, confidential, and backed up by science.</strong>
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', margin: 0, maxWidth: '800px' }}>
          Mental health conditions are real and common. And recovery is possible! <strong>Take the first steps here.</strong>
        </p>
      </div>

      {/* Tests Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {testList.map((test, index) => (
          <button
            key={index}
            onClick={() => handleTestClick(test.id)}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              padding: '16px 20px',
              borderRadius: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              textAlign: 'left',
              transition: 'background-color 0.2s, transform 0.1s',
              boxShadow: 'var(--shadow-sm)'
              ,
              minHeight: '72px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={{ paddingRight: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{test.title}</span>
            <Plus size={20} style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

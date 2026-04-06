import React, { useState, useEffect } from 'react';
import { translate } from '../utils/i18n';
import { Star, MessageSquareQuote, Edit2, Trash2 } from 'lucide-react';

export default function Feedback() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(`lang_${user.email}`) || 'English';
  });

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      const savedReview = localStorage.getItem(`feedback_${user.email}`);
      if (savedReview) {
        setMyReview(JSON.parse(savedReview));
      }
    }
  }, [user]);

  // Hardcoded reviews
  const communityReviews = [
    {
      id: 1,
      name: "Sarah Jenkins",
      rating: 5,
      date: "Oct 12, 2026",
      text: "The Focus Zone has completely changed my daily routine. I feel more centered and less anxious.",
      isMine: false
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 4,
      date: "Oct 10, 2026",
      text: "Really helpful insights. The self-care tips are practical and easy to follow. Highly recommended.",
      isMine: false
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      rating: 5,
      date: "Oct 08, 2026",
      text: "A wonderful app with a beautifully calming interface. I use the wellness corner every morning.",
      isMine: false
    }
  ];

  const allReviews = myReview ? [myReview, ...communityReviews] : communityReviews;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !feedback.trim() || !user || !user.email) return;

    const newReview = {
      id: `mine_${Date.now()}`,
      name: user.name || user.email.split('@')[0] || "Me",
      rating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: feedback,
      isMine: true
    };

    localStorage.setItem(`feedback_${user.email}`, JSON.stringify(newReview));
    setMyReview(newReview);
    setSubmitted(true);
    setIsEditing(false);
    setFeedback('');
    setRating(0);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleEdit = () => {
    if (myReview) {
      setFeedback(myReview.text);
      setRating(myReview.rating);
      setIsEditing(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your feedback?")) {
      localStorage.removeItem(`feedback_${user.email}`);
      setMyReview(null);
      setFeedback('');
      setRating(0);
      setIsEditing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <MessageSquareQuote size={32} color="var(--primary-color)" />
        {translate(language, 'userFeedback') || 'User Feedback'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        See what others are saying about their journey and share your own experience.
      </p>

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, borderBottom: '2px solid var(--input-border)', paddingBottom: '0.5rem' }}>
          Community Reviews
        </h2>
        {allReviews.map(review => (
          <div key={review.id} style={{
            background: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: review.isMine ? '2px solid var(--primary-color)' : '1px solid var(--input-border)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>{review.name} {review.isMine ? "(You)" : ""}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{review.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "var(--warning)" : "transparent"} color={i < review.rating ? "var(--warning)" : "var(--text-secondary)"} />
                ))}
              </div>
            </div>
            <p style={{ lineHeight: 1.6, color: 'var(--text-main)' }}>"{review.text}"</p>
            
            {review.isMine && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleEdit}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={handleDelete}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--error, #e53e3e)', cursor: 'pointer', fontWeight: 500 }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Feedback Form */}
      {(!myReview || isEditing) && (
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--input-border)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>{isEditing ? 'Edit Your Feedback' : 'Leave Your Feedback'}</h2>
          {!user || !user.email ? (
            <p style={{ color: 'var(--text-secondary)' }}>Please log in to leave your feedback.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        transition: 'transform 0.1s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Star size={24} fill={star <= rating ? "var(--warning)" : "transparent"} color={star <= rating ? "var(--warning)" : "var(--text-secondary)"} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Thoughts</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  placeholder="Tell us what you think..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--input-border)',
                    background: 'var(--background)',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={rating === 0 || !feedback.trim()}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: (rating === 0 || !feedback.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (rating === 0 || !feedback.trim()) ? 0.7 : 1,
                    transition: 'background-color 0.2s',
                    flex: 1
                  }}
                >
                  {isEditing ? 'Save Changes' : 'Submit Feedback'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFeedback('');
                      setRating(0);
                    }}
                    style={{
                      padding: '0.8rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
              {submitted && <div style={{ marginTop: '1rem', color: 'var(--success)', textAlign: 'center', fontWeight: 500 }}>Thank you for your feedback!</div>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, RefreshCcw, Save, Download } from 'lucide-react';
import { useState } from 'react';

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, formData } = location.state || {};
    const [saved, setSaved] = useState(false);

    if (!result) {
        return (
            <div className="card" style={{ textAlign: 'center' }}>
                <h2>No Result Found</h2>
                <p>Please complete the assessment first.</p>
                <Link to="/assessment" className="btn">Go to Assessment</Link>
            </div>
        );
    }

    const getColor = (level) => {
        switch (level) {
            case 'Low': return '#10b981'; // Green
            case 'Moderate': return '#f59e0b'; // Amber
            case 'High': return '#ef4444'; // Red
            default: return '#6b7280';
        }
    };

    const getRecommendations = (level) => {
        if (level === 'Low') {
            return [
                "Continue your current routine as it seems effective.",
                "Maintain good sleep hygiene.",
                "Keep nurturing your social connections."
            ];
        } else if (level === 'Moderate') {
            return [
                "Consider practicing mindfulness or meditation daily.",
                "Ensure you are getting 7-9 hours of sleep.",
                "Reach out to a friend or family member for a chat.",
                "Try to balance work and personal time better."
            ];
        } else {
            return [
                "It is highly recommended to consult a mental health professional.",
                "Prioritize self-care and take a break if possible.",
                "Talk to someone you trust about your feelings.",
                "Consider lifestyle changes to reduce stress immediately."
            ];
        }
    };

    const handleSave = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const historyKey = user.id ? `history_${user.id}` : 'history';
        const currentHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const newEntry = { date: new Date().toISOString(), ...result, ...formData };
        localStorage.setItem(historyKey, JSON.stringify([newEntry, ...currentHistory]));
        setSaved(true);
    };

    return (
        <div>
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '12px', alignItems: 'start' }}>
                <AlertTriangle color="#ea580c" size={24} style={{ flexShrink: 0 }} />
                <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#9a3412' }}>Medical Disclaimer</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#9a3412' }}>
                        This tool provides a prediction based on your inputs and is not a medical diagnosis.
                        If you are feeling overwhelmed or having thoughts of self-harm, please consult a doctor or call a helpline immediately.
                    </p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '100%', marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: '#374151' }}>Your Mental Wellness Score</h2>

                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '2rem auto' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke={getColor(result.level)}
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 90 * (result.score / 100)} ${2 * Math.PI * 90}`}
                            transform="rotate(-90 100 100)"
                            style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 700, color: getColor(result.level) }}>{result.score}</span>
                        <div style={{ fontSize: '1.125rem', color: '#6b7280', fontWeight: 500 }}>{result.level} Risk</div>
                    </div>
                </div>

                <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                    <h3 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Personalized Recommendations</h3>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                        {getRecommendations(result.level).map((rec, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem', color: '#4b5563' }}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '100%' }}>
                <h3 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Assessment Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>Stress Level</span>
                        <span style={{ fontWeight: 600 }}>{formData.stressLevel}/10</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>Sleep Hours</span>
                        <span style={{ fontWeight: 600 }}>{formData.sleepHours} hrs</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>Anxiety Level</span>
                        <span style={{ fontWeight: 600 }}>{formData.anxietyLevel}/10</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>Depression Score</span>
                        <span style={{ fontWeight: 600 }}>{formData.depressionScore}/10</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/assessment')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCcw size={20} /> Retake Assessment
                </button>
                <button className="btn" onClick={handleSave} disabled={saved} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saved ? 0.7 : 1 }}>
                    {saved ? <CheckCircle size={20} /> : <Save size={20} />}
                    {saved ? 'Saved to Profile' : 'Save Results'}
                </button>
            </div>
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Trash2, Plus, Target, Calendar } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function Profile() {
    const navigate = useNavigate();

    // Core User Data
    const [user, setUser] = useState(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        if (!stored.createdAt) stored.createdAt = new Date().toISOString();
        return stored;
    });

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user.id) return;
            try {
                const response = await apiRequest(`/api/assessments/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };
        fetchHistory();

        const syncUser = () => {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(storedUser);
            if (!storedUser.createdAt && user.email) {
                const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
                if (usersDb[user.email]) {
                    usersDb[user.email].createdAt = user.createdAt;
                    localStorage.setItem('users_db', JSON.stringify(usersDb));
                }
                localStorage.setItem('user', JSON.stringify(user));
            }
        };

        syncUser();
        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, [user.email, user.createdAt, user.id]);

    // Derived Data
    const latestAssesment = history.length > 0 ? (history[0].formData || history[0]) : {};
    const age = user.age || latestAssesment.age || 'N/A';
    const gender = user.gender || latestAssesment.gender || 'N/A';

    // Photo State
    const [photo, setPhoto] = useState(localStorage.getItem(`photo_${user.email}`) || null);
    const fileInputRef = useRef(null);

    const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem(`goals_${user.email}`) || '[]'));
    const [newGoal, setNewGoal] = useState('');

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
                localStorage.setItem(`photo_${user.email}`, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        localStorage.removeItem(`photo_${user.email}`);
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoal.trim()) return;
        const updated = [...goals, { id: Date.now(), text: newGoal.trim(), completed: false }];
        setGoals(updated);
        localStorage.setItem(`goals_${user.email}`, JSON.stringify(updated));
        setNewGoal('');
    };

    const toggleGoal = (id) => {
        const updated = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
        setGoals(updated);
        localStorage.setItem(`goals_${user.email}`, JSON.stringify(updated));
    };

    const deleteGoal = (id) => {
        const updated = goals.filter(g => g.id !== id);
        setGoals(updated);
        localStorage.setItem(`goals_${user.email}`, JSON.stringify(updated));
    };
    return (
        <div className="animate-fade-in" style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                {/* Photo & Basic Info Banner */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem', margin: 0, width: '100%', maxWidth: '600px' }}>
                    {/* Avatar Upload */}
                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f3f4f6',
                                border: '4px solid white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                position: 'relative', cursor: 'pointer'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to update photo"
                        >
                            {photo ? (
                                <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={48} color="#9ca3af" />
                            )}
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                                <Camera color="white" size={24} />
                                <span style={{ color: 'white', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>Upload</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />

                        {photo && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
                                style={{ position: 'absolute', bottom: 0, right: 0, background: '#ef4444', color: 'white', border: '2px solid white', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Remove photo"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.5rem' }}>{user.name || 'User'}</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span style={{ background: 'var(--bg-color)', padding: '4px 12px', borderRadius: '16px' }}>Age: {age}</span>
                            <span style={{ background: 'var(--bg-color)', padding: '4px 12px', borderRadius: '16px' }}>Gender: {gender}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Calendar size={14} /> Created on: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Wellness Goals */}
                <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '600px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                        <Target color="var(--primary-color)" /> Wellness Goals
                    </h3>

                    <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Add a personal health goal..."
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn" style={{ padding: '8px 12px' }}><Plus size={20} /></button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
                        {goals.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0', fontStyle: 'italic' }}>No goals set yet. Start tracking!</div>
                        ) : (
                            goals.map(goal => (
                                <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: goal.completed ? '#f9fafb' : 'white', border: '1px solid #e5e7eb', borderRadius: '8px', transition: 'all 0.2s' }}>
                                    <input
                                        type="checkbox"
                                        checked={goal.completed}
                                        onChange={() => toggleGoal(goal.id)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                                    />
                                    <span style={{ flex: 1, color: goal.completed ? 'var(--text-secondary)' : 'var(--text-main)', textDecoration: goal.completed ? 'line-through' : 'none', fontSize: '0.95rem' }}>
                                        {goal.text}
                                    </span>
                                    <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.6 }} title="Delete goal">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

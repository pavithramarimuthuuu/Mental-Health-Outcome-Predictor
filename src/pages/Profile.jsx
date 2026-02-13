import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Edit2, Save, X, Calendar, Activity } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [isEditing, setIsEditing] = useState(false);
    const [history, setHistory] = useState([]);
    const [editForm, setEditForm] = useState(user);

    useEffect(() => {
        const historyKey = user.id ? `history_${user.id}` : 'history';
        const storedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        setHistory(storedHistory);
    }, [user.id]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const handleSaveProfile = () => {
        localStorage.setItem('user', JSON.stringify(editForm));
        setUser(editForm);
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setEditForm(user);
        setIsEditing(false);
    };

    return (
        <div>
            <div className="card" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: '#111827' }}>My Profile</h2>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}>
                            <Edit2 size={20} />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                            <button onClick={handleSaveProfile} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Save size={20} /></button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> Full Name</label>
                        {isEditing ? (
                            <input
                                className="input-field"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.name || 'N/A'}</div>
                        )}
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> Email Address</label>
                        {isEditing ? (
                            <input
                                className="input-field"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.email || 'N/A'}</div>
                        )}
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> Phone</label>
                        {isEditing ? (
                            <input
                                className="input-field"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                placeholder="Add phone number"
                            />
                        ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.phone || 'N/A'}</div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: '2rem',
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                        justifyContent: 'center'
                    }}
                >
                    <LogOut size={20} /> Log Out
                </button>
            </div>

            <div className="card" style={{ maxWidth: '100%' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>Assessment History</h3>

                {history.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center' }}>No saved assessments yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {history.map((entry, index) => (
                            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', background: '#f9fafb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
                                        <Calendar size={16} />
                                        {new Date(entry.date).toLocaleDateString()}
                                    </div>
                                    <span style={{
                                        fontWeight: 600,
                                        color: entry.level === 'High' ? '#ef4444' : entry.level === 'Moderate' ? '#f59e0b' : '#10b981',
                                        background: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        border: '1px solid currentColor',
                                        fontSize: '0.75rem'
                                    }}>
                                        {entry.level} Risk
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                                        Score: <span style={{ fontWeight: 700 }}>{entry.score}</span>
                                    </div>
                                    {/* Could add a "View Details" button here later */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

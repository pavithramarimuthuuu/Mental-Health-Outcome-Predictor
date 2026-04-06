import React, { useState, useEffect } from 'react';
import { User, Brain, LayoutDashboard, Settings as SettingsIcon, Shield, X, Key, LogOut, AlertTriangle, ListChecks } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { translate } from '../utils/i18n';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    useEffect(() => {
        const syncUser = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        window.addEventListener('storage', syncUser);
        window.addEventListener('userUpdated', syncUser);
        return () => {
            window.removeEventListener('storage', syncUser);
            window.removeEventListener('userUpdated', syncUser);
        };
    }, []);

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user.id) {
                setHistory([]);
                return;
            }
            try {
                const response = await apiRequest(`/api/assessments/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(Array.isArray(data) ? data : []);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch notification history:', error);
            }
            const historyKey = user.id ? `history_${user.id}` : 'history';
            setHistory(JSON.parse(localStorage.getItem(historyKey) || '[]'));
        };
        fetchHistory();
    }, [user.id]);

    const latestAssesment = history.length > 0 ? history[0] : {};
    const age = user.age || latestAssesment.formData?.age || latestAssesment.age || 'N/A';
    const gender = user.gender || latestAssesment.formData?.gender || latestAssesment.gender || 'N/A';

    // UI States
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsView, setSettingsView] = useState('menu'); // 'menu', 'personal', 'account'

    // Auth Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [verifyError, setVerifyError] = useState('');

    // Personal Details Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(user);

    const language = localStorage.getItem(`lang_${user.email}`) || 'English';

    const getTitle = () => 'Mental Health Predictor';

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const requestVerification = (action) => {
        setModalAction(action);
        setVerifyCode('');
        setVerifyError('');
        setShowModal(true);
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users_db') || '{}');

        if (modalAction === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(verifyCode)) {
                setVerifyError('Please enter a valid email address.');
                return;
            }
            if (users[verifyCode] || verifyCode === user.email) {
                setVerifyError('This email is already taken or is your current email.');
                return;
            }

            const updatedUser = { ...user, email: verifyCode };
            users[verifyCode] = { ...users[user.email], email: verifyCode };
            delete users[user.email];

            localStorage.setItem('users_db', JSON.stringify(users));
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setShowModal(false);
            alert('Email address successfully updated!');

        } else {
            if (verifyCode !== user.email) {
                setVerifyError('the entered email should be exist');
                return;
            }

            setShowModal(false);
            if (modalAction === 'password') {
                alert('Password successfully changed!');
            } else if (modalAction === 'delete') {
                delete users[user.email];
                localStorage.setItem('users_db', JSON.stringify(users));
                localStorage.removeItem('user');
                navigate('/auth');
            }
        }
    };

    const handleSaveProfile = async () => {
        const users = JSON.parse(localStorage.getItem('users_db') || '{}');
        if (users[user.email]) {
            users[user.email] = { ...users[user.email], ...editForm };
            localStorage.setItem('users_db', JSON.stringify(users));
        }
        try {
            const response = await apiRequest(`/api/users/${encodeURIComponent(user.email)}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    age: editForm.age || '',
                    gender: editForm.gender || '',
                }),
            });
            const updated = response.ok ? await response.json() : editForm;
            const nextUser = { ...editForm, ...updated };
            localStorage.setItem('user', JSON.stringify(nextUser));
            setUser(nextUser);
        } catch (error) {
            localStorage.setItem('user', JSON.stringify(editForm));
            setUser(editForm);
        }
        setIsEditing(false);
        window.dispatchEvent(new Event('userUpdated'));
        window.dispatchEvent(new Event('storage'));
    };

    const cancelEdit = () => {
        setEditForm(user);
        setIsEditing(false);
    };

    const closeSettings = () => {
        setShowSettings(false);
        setSettingsView('menu');
        setIsEditing(false);
    }

    const notifications = [];
    const latestRecord = history[0];
    const latestDate = latestRecord?.createdAt || latestRecord?.date;
    if (!latestDate) {
        notifications.push({
            title: 'Assessment reminder',
            message: 'You have not completed a clinical test yet. Take one to unlock insights.',
        });
    } else {
        const elapsedMs = Date.now() - new Date(latestDate).getTime();
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        if (elapsedHours >= 48) {
            notifications.push({
                title: 'Time for a check-in',
                message: 'It has been over 2 days since your last assessment. A quick check-in can help track trends.',
            });
        }
    }
    if (!user.age || !user.gender) {
        notifications.push({
            title: 'Complete profile',
            message: 'Add your age and gender to improve personalized recommendations.',
        });
    }
    const notificationSignature = JSON.stringify(notifications.map((n) => `${n.title}:${n.message}`));
    const readKey = `notifications_read_${user.email || 'guest'}`;
    const [readSignature, setReadSignature] = useState(() => localStorage.getItem(readKey) || '');
    useEffect(() => {
        setReadSignature(localStorage.getItem(readKey) || '');
    }, [readKey, notificationSignature]);
    const hasNotifications = notifications.length > 0;
    const hasUnreadNotifications = hasNotifications && notificationSignature !== readSignature;
    const toggleNotifications = () => {
        const nextOpen = !showNotifications;
        setShowNotifications(nextOpen);
        if (nextOpen && hasNotifications) {
            localStorage.setItem(readKey, notificationSignature);
            setReadSignature(notificationSignature);
        }
    };

    return (
        <nav style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            background: 'linear-gradient(90deg,#f3e5d8,#ead8c8)',
            borderBottom: '1px solid var(--input-border)',
            marginBottom: '1rem',
            position: 'relative',
            color: 'var(--text-main)'
        }}>

            {/* Left side: Dashboard Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(90deg,#8d6e63,#5d4037)',
                        padding: '6px 7px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Brain size={18} />
                    </div>
                    <span style={{ fontWeight: 700, letterSpacing: '0.04em', color: 'var(--primary-color)' }}>MHP</span>
                </div>
            </div>

            {/* Center: Title & Welcome Text */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>{getTitle()}</h2>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Welcome, {user.name || 'User'}</p>
            </div>

            {/* Right side: Notifications, Settings & My Profile */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>

                {/* Notification Bell */}
                <button onClick={toggleNotifications} style={{ background: 'white', border: '1px solid var(--input-border)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-main)', borderRadius: '999px', padding: '7px' }} title={translate(language, 'notifications')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    {hasUnreadNotifications && (
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="animate-fade-in" style={{ position: 'absolute', top: '2.8rem', right: '6.8rem', background: 'white', border: '1px solid var(--input-border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', width: '340px', zIndex: 50 }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--input-border)', fontWeight: 600, color: 'var(--text-main)' }}>{translate(language, 'notifications')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {hasNotifications ? notifications.map((notification, idx) => (
                                <div key={notification.title} style={{ padding: '1rem', borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid var(--input-border)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-main)' }}>{notification.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{notification.message}</div>
                                </div>
                            )) : (
                                <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    You are all caught up. No notifications right now.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Button */}
                <button onClick={() => setShowSettings(true)} style={{ background: 'white', border: '1px solid var(--input-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)', borderRadius: '999px', padding: '7px' }} title="Settings">
                    <SettingsIcon size={20} />
                </button>

            </div>

            {/* Global Settings Overlay Modal */}
            {showSettings && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card animate-fade-in" style={{ margin: '0 1rem', display: 'flex', flexDirection: 'column', flex: '1 1 100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {settingsView !== 'menu' && (
                                    <button onClick={() => { setSettingsView('menu'); setIsEditing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex', alignItems: 'center' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    </button>
                                )}
                                <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <SettingsIcon color="#6b7280" /> Global Settings
                                </h3>
                            </div>
                            <button onClick={closeSettings} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={24} /></button>
                        </div>

                        {/* --- MENU VIEW --- */}
                        {settingsView === 'menu' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    onClick={() => setSettingsView('personal')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem',
                                        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
                                        transition: 'background 0.2s', textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.05rem' }}>Personal Details</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Name, Phone, Age, Gender</div>
                                        </div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>

                                <button
                                    onClick={() => setSettingsView('account')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem',
                                        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
                                        transition: 'background 0.2s', textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.05rem' }}>Account & Security</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Email, Password, Language, Deletion</div>
                                        </div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontWeight: 600, cursor: 'pointer', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', transition: 'background 0.2s'
                                        }}
                                    >
                                        <LogOut size={18} /> Log Out
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- PERSONAL DETAILS VIEW --- */}
                        {settingsView === 'personal' && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, color: '#374151', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={18} color="var(--primary-color)" /> Edit Personal Details
                                    </h4>
                                    {!isEditing ? (
                                        <button onClick={() => { setIsEditing(true); setEditForm(user); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg> Edit
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={cancelEdit} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Cancel</button>
                                            <button onClick={handleSaveProfile} className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Save</button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
                                        {isEditing ? (
                                            <input className="input-field" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ marginBottom: 0 }} />
                                        ) : (
                                            <div style={{ fontSize: '1rem', fontWeight: 500, color: '#111827' }}>{user.name || 'N/A'}</div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Phone Format</label>
                                        {isEditing ? (
                                            <input className="input-field" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Add phone number" style={{ marginBottom: 0 }} />
                                        ) : (
                                            <div style={{ fontSize: '1rem', fontWeight: 500, color: '#111827' }}>{user.phone || 'Not Provided'}</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Age</div>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={editForm.age || ''}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                                                    placeholder="Add age"
                                                    style={{ marginBottom: 0 }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '1rem', fontWeight: 500, color: '#111827' }}>{age}</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Gender</div>
                                            {isEditing ? (
                                                <select
                                                    className="input-field"
                                                    value={editForm.gender || ''}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            ) : (
                                                <div style={{ fontSize: '1rem', fontWeight: 500, color: '#111827', textTransform: 'capitalize' }}>{gender}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- ACCOUNT & SECURITY VIEW --- */}
                        {settingsView === 'account' && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ margin: '0 0 1.5rem 0', color: '#374151', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={18} color="var(--primary-color)" /> Account Security
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Email Address</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                                        </div>
                                        <button onClick={() => { setShowSettings(false); requestVerification('email'); }} style={{ background: 'white', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Update</button>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Password</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Last changed: Never</div>
                                        </div>
                                        <button onClick={() => { setShowSettings(false); requestVerification('password'); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Key size={14} /> Change
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                                    <button
                                        onClick={() => { setShowSettings(false); requestVerification('delete'); }}
                                        style={{
                                            width: '100%', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontWeight: 600, cursor: 'pointer', border: 'none', background: '#fef2f2', color: '#ef4444', transition: 'background 0.2s'
                                        }}
                                    >
                                        <AlertTriangle size={18} /> Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Verification Modal (from Profile) */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%', margin: '0 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
                                <Shield size={20} color="var(--primary-color)" /> Security Verification
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
                        </div>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            {modalAction === 'email'
                                ? "Please enter your new email address below."
                                : `For your security, please confirm by entering your account email address.`
                            }
                        </p>
                        <form onSubmit={handleVerifySubmit}>
                            <input
                                type="text"
                                placeholder={modalAction === 'email' ? "Enter new email..." : "Enter your email..."}
                                className="input-field"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                                style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '1rem' }}
                                autoFocus
                            />
                            {verifyError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{verifyError}</p>}
                            <button type="submit" className="btn" style={{ width: '100%' }}>Verify & Proceed</button>
                        </form>
                    </div>
                </div>
            )}

        </nav>
    );
}

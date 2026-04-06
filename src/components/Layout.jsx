import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import ChatWidget from './ChatWidget';
import MhdSidebar from './MhdSidebar';
import { apiRequest } from '../utils/api';

export default function Layout() {
    const location = useLocation();
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const [dobDay, setDobDay] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobYear, setDobYear] = useState('');
    const [gender, setGender] = useState('');
    const [showDobModal, setShowDobModal] = useState(false);
    const [savingDob, setSavingDob] = useState(false);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    useEffect(() => {
        setShowDobModal(Boolean(location.state?.needsDobModal));
    }, [location.state]);

    const handleDobSave = async () => {
        const d = Number(dobDay);
        const m = Number(dobMonth);
        const y = Number(dobYear);
        const dob = new Date(y, m - 1, d);
        if (Number.isNaN(dob.getTime()) || dob.getDate() !== d || dob.getMonth() !== (m - 1) || dob.getFullYear() !== y) {
            return;
        }
        const now = new Date();
        let years = now.getFullYear() - y;
        const monthDiff = now.getMonth() - (m - 1);
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) years -= 1;
        setSavingDob(true);
        try {
            const response = await apiRequest(`/api/users/${encodeURIComponent(user.email)}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ age: String(Math.max(0, years)), gender: gender || '' }),
            });
            const data = await response.json();
            const updatedUser = { ...user, ...data, age: String(Math.max(0, years)), gender: gender || data.gender || '' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('userUpdated'));
            setShowDobModal(false);
        } finally {
            setSavingDob(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
            <Navbar />
            <div style={{ display: 'flex', width: '100%', padding: '0 0 2rem 0', gap: '1.5rem', alignItems: 'flex-start' }}>
                <MhdSidebar />
                <main style={{ flex: 1, minWidth: 0, paddingRight: '1.5rem' }}>
                    <Outlet />
                </main>
            </div>
            <ChatWidget />
            {showDobModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
                    <div className="card" style={{ maxWidth: '520px', width: '100%', margin: '0 1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2rem', lineHeight: 1.4, marginBottom: '1.2rem' }}>Your birthdate is required to create your account.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: '10px' }}>
                            <input className="input-field" placeholder="DD" value={dobDay} onChange={(e) => setDobDay(e.target.value)} />
                            <input className="input-field" placeholder="MM" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} />
                            <input className="input-field" placeholder="YYYY" value={dobYear} onChange={(e) => setDobYear(e.target.value)} />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)} style={{ marginBottom: 0 }}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button
                            className="btn"
                            onClick={handleDobSave}
                            disabled={savingDob || !dobDay || !dobMonth || !dobYear || !gender}
                            style={{ marginTop: '1.2rem', borderRadius: '999px', opacity: (savingDob || !dobDay || !dobMonth || !dobYear || !gender) ? 0.6 : 1 }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

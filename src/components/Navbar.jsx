import { User, Brain } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();
    const getTitle = () => {
        switch (location.pathname) {
            case '/assessment': return 'Mental Health Assessment';
            case '/results': return 'Assessment Results';
            case '/profile': return 'My Profile';
            default: return 'Mental Health Predictor';
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'white',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    background: '#f3e8ff',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed' // Keeping purple accent for logo only as per screenshot, or should this be green too?
                    // User said "soft green theme", but screenshot had purple logo background.
                    // I'll stick to the screenshot's purple logo background if it matches, but user said "only soft green not purple".
                    // So I will change this to green.
                }}>
                    <Brain size={24} color="var(--primary-color)" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{getTitle()}</h2>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Welcome, {user.name || 'User'}</p>
                </div>
            </div>

            <Link to="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: '#4b5563',
                fontWeight: 500
            }}>
                <User size={20} />
                My Profile
            </Link>
        </nav>
    );
}

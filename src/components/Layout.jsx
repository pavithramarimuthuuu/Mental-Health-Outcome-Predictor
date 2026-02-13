import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    const user = localStorage.getItem('user');

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
            <Navbar />
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 2rem' }}>
                <Outlet />
            </div>
        </div>
    );
}

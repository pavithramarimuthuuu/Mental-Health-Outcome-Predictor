import { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    gender: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
  });

  // Clear errors when switching modes
  useEffect(() => {
    setError('');
    setFormData(prev => ({ ...prev, email: '', phone: '', password: '', name: '', gender: '', dobDay: '', dobMonth: '', dobYear: '' }));
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const response = await apiRequest('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Login failed.');
          setIsLoading(false);
          return;
        }

        // Login Successful
        const userToStore = {
          ...data.user,
          id: data.user.id || data.user.email // Ensure ID is present
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
        navigate(location.state?.redirectTo || '/tests', { state: { fromAuth: true } });

      } else {
        // Signup Logic
        // Validation
        if (!formData.name) { setError("Name is required"); setIsLoading(false); return; }
        if (!formData.email) { setError("Email is required"); setIsLoading(false); return; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address.");
          setIsLoading(false);
          return;
        }

        if (!formData.phone) { setError("Phone is required"); setIsLoading(false); return; }
        if (!/^\d{10}$/.test(formData.phone)) { setError("Please enter a valid 10-digit phone number."); setIsLoading(false); return; }
        if (!formData.password) { setError("Password is required"); setIsLoading(false); return; }

        const dobProvided = formData.dobDay && formData.dobMonth && formData.dobYear;
        let age = '';
        if (dobProvided) {
          const d = Number(formData.dobDay);
          const m = Number(formData.dobMonth);
          const y = Number(formData.dobYear);
          const dob = new Date(y, m - 1, d);
          if (Number.isNaN(dob.getTime()) || dob.getDate() !== d || dob.getMonth() !== (m - 1) || dob.getFullYear() !== y) {
            setError('Please enter a valid date of birth.');
            setIsLoading(false);
            return;
          }
          const now = new Date();
          let years = now.getFullYear() - y;
          const monthDiff = now.getMonth() - (m - 1);
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) years -= 1;
          age = String(Math.max(0, years));
        }

        const response = await apiRequest('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            gender: formData.gender || '',
            age,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registration failed.');
          setIsLoading(false);
          return;
        }

        // Set session
        const userToStore = {
          ...data.user,
          id: data.user.id || data.user.email
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
        const needsDobModal = !age || !formData.gender;
        navigate(location.state?.redirectTo || '/tests', { state: { fromAuth: true, needsDobModal } });
      }
    } catch (err) {
      setError('Unable to connect to server. Please start backend (npm run dev in /backend) and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 1fr', background: 'var(--bg-color)' }}>
      <div style={{ background: 'linear-gradient(180deg,#eadfcf,#f2e7d8)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', borderRadius: '10px', padding: '6px', display: 'flex' }}><Brain size={20} /></div>
          <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>MHP</strong>
        </div>
        <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2.4rem' }}>Discover what your mind can do</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sign up to begin your mental wellness journey for free.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '460px' }}>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#ef4444',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <h2 style={{ marginTop: 0, marginBottom: '0.25rem' }}>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)' }}>{isLogin ? 'Login to continue' : 'Already a member? Sign in'}</p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                name="email"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Gender (optional)</label>
                <select
                  name="gender"
                  className="input-field"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Date of Birth (optional)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '8px' }}>
                  <input name="dobDay" className="input-field" placeholder="DD" value={formData.dobDay} onChange={handleChange} />
                  <input name="dobMonth" className="input-field" placeholder="MM" value={formData.dobMonth} onChange={handleChange} />
                  <input name="dobYear" className="input-field" placeholder="YYYY" value={formData.dobYear} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn" disabled={isLoading} style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!isLoading && !isLogin && <ArrowRight size={20} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, padding: 0, textDecoration: 'none', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

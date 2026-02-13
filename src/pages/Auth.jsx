import { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: ''
  });

  // Clear errors when switching modes
  useEffect(() => {
    setError('');
    setFormData(prev => ({ ...prev, email: '', phone: '', password: '', name: '' }));
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Load existing users registry
    const users = JSON.parse(localStorage.getItem('users_db') || '{}');

    if (isLogin) {
      // Login Logic
      const user = users[formData.email];

      if (!user) {
        setError("There is no account using this email. Please sign up.");
        return;
      }

      if (user.password !== formData.password) {
        setError("Wrong password.");
        return;
      }

      // Login Successful
      localStorage.setItem('user', JSON.stringify({
        name: user.name,
        email: user.email,
        phone: user.phone,
        id: user.email // Use email as ID
      }));
      navigate('/assessment');

    } else {
      // Signup Logic

      // Validation
      if (!formData.name) { setError("Name is required"); return; }
      if (!formData.email) { setError("Email is required"); return; }
      if (!formData.phone) { setError("Phone is required"); return; }
      if (!/^\d{10}$/.test(formData.phone)) { setError("Please enter a valid 10-digit phone number."); return; }
      if (!formData.password) { setError("Password is required"); return; }

      // Check if email already exists
      if (users[formData.email]) {
        setError("An account with this email already exists. Please sign in.");
        return;
      }

      // Save new user
      const newUser = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      users[formData.email] = newUser;
      localStorage.setItem('users_db', JSON.stringify(users));

      // Set session
      localStorage.setItem('user', JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        id: newUser.email
      }));
      navigate('/assessment');
    }
  };

  return (
    <div className="auth-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          background: '#ecfdf5',
          padding: '12px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <Brain size={40} color="var(--primary-color)" />
        </div>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '2rem' }}>Mental Health Predictor</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isLogin ? 'Sign in to assess your mental well-being' : 'Create an account to track your journey'}
        </p>
      </div>

      <div className="card">
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
                  required
                />
              </div>
            </div>
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

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
            {!isLogin && <ArrowRight size={20} />}
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

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Your privacy matters. All data is confidential and secure.
      </div>
    </div>
  );
}

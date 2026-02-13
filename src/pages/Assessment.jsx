import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Activity, Moon, User, Briefcase, Frown, Users, ArrowRight, AlertCircle } from 'lucide-react';

export default function Assessment() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        age: '',
        gender: 'Select gender',
        sleepHours: '',
        stressLevel: 5,
        workPressure: 5,
        anxietyLevel: 5,
        depressionScore: 5,
        socialSupport: 5
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSliderChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const calculateRisk = () => {
        // Heuristic prediction logic (Mock AI)
        // Higher score = Higher risk
        let riskScore = 0;

        // Factors increasing risk
        riskScore += (formData.stressLevel * 2);
        riskScore += (formData.workPressure * 1.5);
        riskScore += (formData.anxietyLevel * 2);
        riskScore += (formData.depressionScore * 2.5);

        // Factors decreasing risk (Social Support, Good Sleep)
        riskScore -= (formData.socialSupport * 1.5);

        const sleep = parseFloat(formData.sleepHours) || 7;
        if (sleep < 6) riskScore += 5;
        if (sleep > 9) riskScore += 2; // Oversleeping can also be a sign

        // Base score normalization (0-100 scale roughly)
        // Max possible add: 10*2 + 10*1.5 + 10*2 + 10*2.5 + 5 = 20+15+20+25+5 = 85
        // Min possible subtract: 10*1.5 = 15.
        // Range approx -15 to 85.

        // Normalize to 0-100
        let normalizedScore = Math.max(0, Math.min(100, riskScore + 20));

        let riskLevel = 'Low';
        if (normalizedScore > 60) riskLevel = 'High';
        else if (normalizedScore > 35) riskLevel = 'Moderate';

        return { score: Math.round(normalizedScore), level: riskLevel };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = calculateRisk();
        // Navigate to results
        navigate('/results', { state: { result, formData } });
    };

    const renderSlider = (label, name, icon) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#374151' }}>
                    {icon} {label}
                </label>
                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{formData[name]}/10</span>
            </div>
            <input
                type="range"
                min="1"
                max="10"
                value={formData[name]}
                onChange={(e) => handleSliderChange(name, e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' }}>
                <span>Low</span>
                <span>High</span>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Complete Your Assessment</h1>
                <p style={{ color: '#6b7280' }}>Please provide accurate information to receive the most relevant prediction.</p>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '100%' }}>
                <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#111827' }}>Personal Information</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="input-group">
                        <label className="input-label">Age *</label>
                        <input
                            type="number"
                            name="age"
                            className="input-field"
                            placeholder="Enter your age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Gender *</label>
                        <select
                            name="gender"
                            className="input-field"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option disabled>Select gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Non-binary</option>
                            <option>Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: '2rem' }}>
                    <label className="input-label">Average Sleep Hours (per day) *</label>
                    <input
                        type="number"
                        name="sleepHours"
                        className="input-field"
                        placeholder="e.g., 7.5"
                        step="0.1"
                        value={formData.sleepHours}
                        onChange={handleChange}
                        required
                    />
                </div>

                <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#111827' }}>Mental Health Indicators</h3>

                {renderSlider('Stress Level', 'stressLevel', <Activity size={18} />)}
                {renderSlider('Work Pressure', 'workPressure', <Briefcase size={18} />)}
                {renderSlider('Anxiety Level', 'anxietyLevel', <AlertCircle size={18} />)}
                {renderSlider('Depression Score', 'depressionScore', <Frown size={18} />)}
                {renderSlider('Social Support', 'socialSupport', <Users size={18} />)}

                <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    Generate Prediction <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
}

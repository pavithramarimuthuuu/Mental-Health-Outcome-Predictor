import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function Assessment() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const historyKey = user.id ? `history_${user.id}` : 'history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const latestAssesment = history.length > 0 ? history[0] : {};

    // Start at Step 2 automatically if we already have their age and gender securely stored
    const [step, setStep] = useState(latestAssesment.age && latestAssesment.gender ? 2 : 1);
    const [isLoading, setIsLoading] = useState(false);
    const totalSteps = 5;

    const [formData, setFormData] = useState({
        age: latestAssesment.age || '',
        gender: latestAssesment.gender || 'Select gender',
        sleepHours: '',
        sleepQuality: null,
        stressFrequency: null,
        workPressure: null,
        anxietyFrequency: null,
        moodVariation: null,
        socialSupport: null,
        physicalActivity: null
    });

    const [ageError, setAgeError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'age') {
            setAgeError('');
        }
    };

    const handleQuestionnaireChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const minStep = latestAssesment.age && latestAssesment.gender ? 2 : 1;

    const handleNext = () => {
        if (step === 1) {
            if (parseInt(formData.age) < 18) {
                setAgeError('You must be 18 or older to take this assessment.');
                return;
            }
        }
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > minStep) setStep(step - 1);
    };

    const isStepValid = () => {
        if (step === 1) return formData.age && formData.gender && formData.gender !== 'Select gender';
        if (step === 2) return formData.sleepHours && formData.sleepQuality !== null;
        if (step === 3) return formData.stressFrequency !== null && formData.workPressure !== null;
        if (step === 4) return formData.anxietyFrequency !== null && formData.moodVariation !== null;
        if (step === 5) return formData.socialSupport !== null && formData.physicalActivity !== null;
        return false;
    };

    const calculateRisk = () => {
        let riskScore = 0;

        riskScore += (formData.stressFrequency * 2.5); // Max 10
        riskScore += (formData.workPressure * 2); // Max 8
        riskScore += (formData.anxietyFrequency * 2.5); // Max 10
        riskScore += (formData.moodVariation * 2); // Max 8

        let invertedSocial = 4 - (formData.socialSupport || 0);
        riskScore += (invertedSocial * 1.5); // Max 6

        let invertedPhysical = 4 - (formData.physicalActivity || 0);
        riskScore += (invertedPhysical * 1.5); // Max 6

        let invertedSleepQ = 4 - (formData.sleepQuality || 0);
        riskScore += (invertedSleepQ * 2); // Max 8

        const sleep = parseFloat(formData.sleepHours) || 7;
        if (sleep < 6) riskScore += 5;
        if (sleep > 9) riskScore += 2;

        let normalizedScore = Math.max(0, Math.min(100, Math.round(riskScore * 1.6)));

        let riskLevel = 'Low';
        if (normalizedScore > 65) riskLevel = 'High';
        else if (normalizedScore > 35) riskLevel = 'Moderate';

        return { score: normalizedScore, level: riskLevel };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = calculateRisk();
        const assessmentData = { formData, result };

        try {
            const response = await apiRequest('/api/assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id || user.email,
                    formData,
                    result
                }),
            });

            if (response.ok) {
                const savedAssessment = await response.json();
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    age: formData.age || storedUser.age || '',
                    gender: formData.gender || storedUser.gender || ''
                }));
                navigate('/results', { state: { result, formData, assessmentId: savedAssessment._id } });
            } else {
                console.error('Failed to save assessment');
                // Fallback to local storage or show error
                alert('Failed to save assessment to server.');
            }
        } catch (error) {
            console.error('Error saving assessment:', error);
            alert('Network error. Failed to save assessment.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderOptions = (name, options = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {options.map((opt, index) => (
                    <label key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: formData[name] === index ? '#f5ede6' : 'white',
                        borderColor: formData[name] === index ? 'var(--primary-color)' : 'var(--input-border)',
                        transition: 'all 0.2s ease'
                    }}>
                        <input
                            type="radio"
                            name={name}
                            value={index}
                            checked={formData[name] === index}
                            onChange={() => handleQuestionnaireChange(name, index)}
                            style={{ accentColor: 'var(--primary-color)' }}
                        />
                        <span style={{ fontWeight: formData[name] === index ? 600 : 400, color: formData[name] === index ? 'var(--primary-color)' : '#374151' }}>{opt}</span>
                    </label>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Mental Health Assessment</h1>
                <p style={{ color: '#6b7280' }}>Please answer these questions honestly for an accurate prediction.</p>

                {/* Progress Bar */}
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
                        <span>Step {step} of {totalSteps}</span>
                        <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(step / totalSteps) * 100}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                    </div>
                </div>
            </div>

            <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>Personal Information</h3>

                        {ageError && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                {ageError}
                            </div>
                        )}

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
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
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
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>Sleep & Lifestyle</h3>
                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label className="input-label" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>How many hours of sleep do you get on an average night? *</label>
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
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>How would you rate your overall sleep quality? *</label>
                            {renderOptions('sleepQuality', ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'])}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>Stress & Work Pressure</h3>
                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>During the past week, how often did you feel overwhelmed by responsibilities? *</label>
                            {renderOptions('stressFrequency')}
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>How frequently do you feel pressured to meet deadlines or expectations? *</label>
                            {renderOptions('workPressure')}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>Mood & Anxiety</h3>
                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>How often do you feel nervous, restless, or unable to relax? *</label>
                            {renderOptions('anxietyFrequency')}
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>How often do you experience sudden variations in your mood? *</label>
                            {renderOptions('moodVariation', ['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'])}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>Social & Physical Well-being</h3>
                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>Do you feel you have someone to talk to when you are stressed? *</label>
                            {renderOptions('socialSupport')}
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '1.1rem' }}>How often do you engage in physical activity or exercise? *</label>
                            {renderOptions('physicalActivity', ['Never', '1-2 times a week', '3-4 times a week', '5-6 times a week', 'Daily'])}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={step === minStep}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step === minStep ? 0 : 1, pointerEvents: step === minStep ? 'none' : 'auto' }}>
                        <ArrowLeft size={20} /> Back
                    </button>

                    {step < totalSteps ? (
                        <button type="submit" className="btn" disabled={!isStepValid()} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: !isStepValid() ? 0.5 : 1 }}>
                            Next <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button type="submit" className="btn" disabled={!isStepValid() || isLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (!isStepValid() || isLoading) ? 0.5 : 1 }}>
                            {isLoading ? 'Processing...' : 'Generate Prediction'} {!isLoading && <Brain size={20} />}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

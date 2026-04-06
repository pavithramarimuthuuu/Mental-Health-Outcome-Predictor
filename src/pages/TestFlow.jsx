import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { testConfig } from '../config/testData';
import { apiRequest } from '../utils/api';

export default function TestFlow() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const config = testConfig[testId];

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Step 1: Demographics
    const [demoData, setDemoData] = useState({ age: '', gender: 'Select gender' });
    const [ageError, setAgeError] = useState('');

    // Step 2: Test answers
    const [answers, setAnswers] = useState({});

    // If test not found, go back
    if (!config) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Test not found. <button onClick={() => navigate('/tests')} className="btn">Go Back</button></div>;
    }

    const handleDemoChange = (e) => {
        setDemoData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === 'age') setAgeError('');
    };

    const handleAnswerChange = (questionId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleTextChange = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [questionId]: text }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (parseInt(demoData.age) < 18) {
                setAgeError('You must be 18 or older to take this assessment.');
                return;
            }
            if (demoData.gender === 'Select gender' || !demoData.age) {
                setAgeError('Please fill in all fields.');
                return;
            }
            setStep(2);
        }
    };

    // Validation for enabling the Submit button
    const isTestComplete = () => {
        const requiredQuestions = config.questions.filter(q => q.type !== 'text');
        return requiredQuestions.every(q => answers[q.id] !== undefined);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Calculate score
        let rawScore = 0;
        let maxPossibleScore = 0;
        config.questions.forEach(q => {
            if (q.type !== 'text') {
                rawScore += (answers[q.id] || 0);
                maxPossibleScore += (q.options.length - 1);
            }
        });

        const ratio = maxPossibleScore > 0 ? (rawScore / maxPossibleScore) : 0;
        const normalizedScore = Math.max(0, Math.min(100, Math.round(ratio * 100)));
        let riskLevel = 'Low';
        if (normalizedScore > 65) riskLevel = 'High';
        else if (normalizedScore > 35) riskLevel = 'Moderate';

        const result = { score: normalizedScore, level: riskLevel };

        // Generate mock legacy formData to persist compatibility with the Results.jsx dashboard
        const val4 = Math.round(ratio * 4);
        const legacyFormData = {
            age: demoData.age,
            gender: demoData.gender,
            stressFrequency: val4,
            workPressure: val4,
            anxietyFrequency: val4,
            moodVariation: val4,
            socialSupport: 4 - val4,
            physicalActivity: 4 - val4,
            sleepQuality: 4 - val4,
            sleepHours: (8 - (ratio * 3)).toFixed(1),
            testType: config.type,
            rawAnswers: answers
        };

        try {
            const response = await apiRequest('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id || user.email,
                    formData: legacyFormData,
                    result
                }),
            });

            if (response.ok) {
                const savedAssessment = await response.json();
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    age: demoData.age || storedUser.age || '',
                    gender: demoData.gender || storedUser.gender || ''
                }));
                navigate('/results', { state: { result, formData: legacyFormData, assessmentId: savedAssessment.id } });
            } else {
                console.error('Failed to save assessment');
                alert('Failed to save assessment to server.');
            }
        } catch (error) {
            console.error('Error saving assessment:', error);
            alert('Network error. Failed to save assessment.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{config.title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{config.subtitle}</p>

                {/* Progress Bar */}
                <div style={{ marginTop: '2rem', maxWidth: '600px', margin: '2rem auto 0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        <span>Step {step} of 2</span>
                        <span>{step === 1 ? '50%' : '100%'} Completed</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--input-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                {step === 1 && (
                    <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Personal Information</h3>

                        {ageError && (
                            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', color: 'var(--error-color)', border: '1px solid var(--error-color)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
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
                                value={demoData.age}
                                onChange={handleDemoChange}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label className="input-label">Gender *</label>
                            <select
                                name="gender"
                                className="input-field"
                                value={demoData.gender}
                                onChange={handleDemoChange}
                                required
                            >
                                <option disabled>Select gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Non-binary</option>
                                <option>Prefer not to say</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                            <button type="button" onClick={handleNext} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Next <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="animate-fade-in">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {config.questions.map((q, qIndex) => (
                                <div key={q.id}>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '1rem', lineHeight: '1.5' }}>
                                        {q.text} {q.type !== 'text' && <span style={{ color: 'var(--error-color)' }}>*</span>}
                                    </p>
                                    
                                    {q.type === 'text' ? (
                                        <textarea 
                                            className="input-field" 
                                            rows="4" 
                                            placeholder="Type your answer here..."
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                                            style={{ resize: 'vertical' }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {q.options.map((opt, optIdx) => {
                                                const isSelected = answers[q.id] === optIdx;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={optIdx}
                                                        onClick={() => handleAnswerChange(q.id, optIdx)}
                                                        style={{
                                                            padding: '10px 16px',
                                                            borderRadius: '999px',
                                                            border: '1px solid',
                                                            borderColor: isSelected ? 'var(--primary-color)' : 'var(--input-border)',
                                                            backgroundColor: isSelected ? 'var(--secondary-color)' : 'var(--card-bg)',
                                                            color: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                            fontWeight: isSelected ? 600 : 500,
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {opt}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--input-border)' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowLeft size={20} /> Back
                            </button>

                            <button type="submit" className="btn" disabled={!isTestComplete() || isLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (!isTestComplete() || isLoading) ? 0.5 : 1 }}>
                                {isLoading ? 'Processing...' : 'Submit Test'} {!isLoading && <Brain size={20} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

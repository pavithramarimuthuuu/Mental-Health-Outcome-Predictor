import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    AlertTriangle, LayoutDashboard,
    TrendingUp, History, ListChecks, Menu, X, User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { translate } from '../utils/i18n';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state?.tab]);

    const { result, formData, assessmentId } = location.state || {};
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssessmentIdx, setSelectedAssessmentIdx] = useState(0);
    const [selectedTrendType, setSelectedTrendType] = useState('All');
    const [selectedTrendAssessmentIdx, setSelectedTrendAssessmentIdx] = useState(0);
    const [language, setLanguage] = useState(localStorage.getItem(`lang_${currentUser.email}`) || 'English');

    useEffect(() => {
        const onLangChange = () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setLanguage(localStorage.getItem(`lang_${user.email}`) || 'English');
        };
        window.addEventListener('languageChange', onLangChange);
        return () => window.removeEventListener('languageChange', onLangChange);
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser.id) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiRequest(`/api/assessments/${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                } else {
                    console.error('Failed to fetch history');
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser.id]);

    if (isLoading) {
        return (
            <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>{translate(language, 'loadingDashboard')}</h2>
                <div style={{ marginTop: '1rem', width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    } 
    if (!result && history.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>{translate(language, 'noDataFound')}</h2>
                <p>Please complete the assessment to view your dashboard.</p>
                <Link to="/tests" className="btn">{translate(language, 'takeAssessment')}</Link>
            </div>
        );
    }

    const normalizedHistory = history.map((h) => ({
        createdAt: h.createdAt || h.date,
        formData: h.formData || h,
        result: h.result || { score: h.score, level: h.level },
    }));

    const latestFromState = result && formData ? [{
        createdAt: new Date().toISOString(),
        formData,
        result,
    }] : [];

    const allAssessments = [...latestFromState, ...normalizedHistory];
    const safeSelectedIdx = Math.min(selectedAssessmentIdx, Math.max(0, allAssessments.length - 1));
    const currentData = allAssessments[safeSelectedIdx] || allAssessments[0];

    const getColor = (level) => {
        switch (level) {
            case 'Low': return '#8d6e63';
            case 'Moderate': return '#6d4c41';
            case 'High': return '#4e342e';
            default: return '#6b7280';
        }
    };

    const navItems = [
        { id: 'overview', label: translate(language, 'dashboardOverview'), icon: <LayoutDashboard size={20} /> },
        { id: 'trends', label: translate(language, 'mentalHealthTrends'), icon: <TrendingUp size={20} /> },
        { id: 'history', label: translate(language, 'assessmentHistory'), icon: <History size={20} /> },
        { id: 'recommendations', label: translate(language, 'recommendations'), icon: <ListChecks size={20} /> }
    ];

    // --- Tab 1: Dashboard Overview Components ---
    const OverviewTab = () => {
        const isCustomTest = !!currentData.formData?.testType;

        const renderProgressBar = (label, valueOut10, isPositive = false) => {
            const percentage = (valueOut10 / 10) * 100;
            let color = '#f59e0b';
            if (isPositive) {
                if (percentage >= 60) color = '#8d6e63';
                else if (percentage < 40) color = '#4e342e';
            } else {
                if (percentage > 60) color = '#4e342e';
                else if (percentage <= 40) color = '#8d6e63';
            }

            return (
                <div style={{ marginBottom: '1.25rem' }} key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                        <span>{label}</span>
                        <span>{valueOut10}/10</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
                    </div>
                </div>
            );
        };

        return (
            <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LayoutDashboard color="var(--primary-color)" /> {isCustomTest ? `${currentData.formData.testType} Overview` : 'Dashboard Overview'}
                    </h2>
                    <div style={{ backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                        <User size={16} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: 500 }}>Total Assessments: <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{history.length}</span></span>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: '100%', margin: '0 0 1.5rem 0', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600, color: '#4b5563' }}>Overview from saved assessments</div>
                        <select
                            className="input-field"
                            value={safeSelectedIdx}
                            onChange={(e) => setSelectedAssessmentIdx(Number(e.target.value))}
                            style={{ maxWidth: '360px', margin: 0 }}
                        >
                            {allAssessments.map((a, idx) => (
                                <option key={`${a.createdAt}-${idx}`} value={idx}>
                                    {`${a.formData?.testType || 'General'} • ${a.result?.level || 'N/A'} • ${new Date(a.createdAt).toLocaleString()}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1.5rem', margin: 0, width: 'auto' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1.25rem', color: '#111827', fontSize: '1.1rem' }}>User Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem' }}>
                                <span style={{ color: '#6b7280' }}>Name:</span>
                                <span style={{ fontWeight: 600 }}>{currentUser.name || 'Anonymous'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem' }}>
                                <span style={{ color: '#6b7280' }}>Age:</span>
                                <span style={{ fontWeight: 600 }}>{currentData.formData.age || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280' }}>Last Assessment:</span>
                                <span style={{ fontWeight: 600 }}>{currentData?.createdAt ? new Date(currentData.createdAt).toLocaleDateString() : 'Today'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', margin: 0, width: 'auto' }}>
                        <h3 style={{ width: '100%', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: '#111827', fontSize: '1.1rem', textAlign: 'left' }}>Mental Health Risk Score</h3>
                        <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1rem' }}>
                            <svg width="150" height="150" viewBox="0 0 150 150">
                                <circle cx="75" cy="75" r="65" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                                <circle
                                    cx="75"
                                    cy="75"
                                    r="65"
                                    fill="none"
                                    stroke={getColor(currentData.result.level)}
                                    strokeWidth="12"
                                    strokeDasharray={`${2 * Math.PI * 65 * (currentData.result.score / 100)} ${2 * Math.PI * 65}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 75 75)"
                                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: getColor(currentData.result.level), lineHeight: 1 }}>{currentData.result.score}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: getColor(currentData.result.level) }}>Risk: {currentData.result.level}</div>
                    </div>
                </div>

                {isCustomTest ? (
                    <div className="card" style={{ padding: '2rem', margin: 0, width: '100%', maxWidth: '100%' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: '#111827', fontSize: '1.25rem' }}>Assessment Insights</h3>
                            <div style={{ backgroundColor: '#f5ede6', border: '1px solid var(--input-border)', padding: '1.5rem', borderRadius: '12px' }}>
                            <p style={{ color: '#4e342e', fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                                You recently completed the <strong>{currentData.formData.testType}</strong> assessment. You scored a total normalized score of <strong>{currentData.result.score}/100</strong>, which clinically maps to a <strong>{currentData.result.level}</strong> risk level.
                            </p>
                            <p style={{ color: '#4e342e', fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
                                Understanding your unique symptoms is the first step toward better mental wellbeing. Please navigate to the <strong>Recommendations tab</strong> to see personalized suggestions and next steps based on your specific assessment answers.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '1.5rem', margin: 0, width: '100%', maxWidth: '100%' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: '#111827', fontSize: '1.1rem' }}>Wellness Indicators</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 3rem' }}>
                            <div>
                                {renderProgressBar('Stress Level', (currentData.formData.stressFrequency * 2.5).toFixed(1))}
                                {renderProgressBar('Anxiety Level', (currentData.formData.anxietyFrequency * 2.5).toFixed(1))}
                            </div>
                            <div>
                                {renderProgressBar('Mood Variation', (currentData.formData.moodVariation * 2.5).toFixed(1))}
                                {renderProgressBar('Sleep Quality', (currentData.formData.sleepQuality * 2.5).toFixed(1), true)}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <button className="btn" onClick={() => navigate('/tests')} style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', borderRadius: '999px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>Take New Assessment</button>
                </div>
            </div>
        );
    };

    // --- Tab 2: Trends Components ---
    const TrendsTab = () => {
        const getChartData = () => {
            const dailyRecord = {};
            history
                .filter((h) => {
                    if (selectedTrendType === 'All') return true;
                    return (h.formData?.testType || 'General') === selectedTrendType;
                })
                .forEach(h => {
                const dateStr = h.createdAt || h.date;
                if (!dateStr) return;
                const dayLabel = new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                if (!dailyRecord[dayLabel] || new Date(dateStr) > new Date(dailyRecord[dayLabel].createdAt || dailyRecord[dayLabel].date)) {
                    dailyRecord[dayLabel] = h;
                }
            });
            return Object.values(dailyRecord)
                .sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date))
                .slice(-7);
        };

        const dailyHistory = getChartData();
        const trendTypes = ['All', ...new Set(history.map((h) => h.formData?.testType || 'General'))];
        const safeTrendIdx = Math.min(selectedTrendAssessmentIdx, Math.max(0, history.length - 1));
        const selectedTrendAssessment = history[safeTrendIdx];

        if (dailyHistory.length <= 1) {
            return (
                <div className="animate-fade-in card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <TrendingUp size={64} strokeWidth={1.5} color="#9ca3af" style={{ margin: '0 auto 1.5rem auto' }} />
                    <h2 style={{ fontSize: '1.75rem', color: '#111827', marginBottom: '1rem' }}>Not enough data to map trends.</h2>
                    <p style={{ color: '#4b5563', fontSize: '1.1rem', margin: '0 auto', maxWidth: '500px', lineHeight: '1.6' }}>Complete multiple assessments over different days to map your mental health journey and see unified trend lines.</p>
                    {history.length > 0 && (
                        <div style={{ marginTop: '1.25rem' }}>
                            <select
                                className="input-field"
                                value={safeTrendIdx}
                                onChange={(e) => setSelectedTrendAssessmentIdx(Number(e.target.value))}
                                style={{ maxWidth: '420px', margin: '0 auto' }}
                            >
                                {history.map((a, idx) => (
                                    <option key={`${a.createdAt}-${idx}`} value={idx}>
                                        {(a.formData?.testType || 'General')} • {(a.result?.level || 'N/A')} • {new Date(a.createdAt || a.date).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button className="btn" onClick={() => navigate('/tests')} style={{ marginTop: '2rem' }}>Take New Assessment</button>
                </div>
            );
        }

        const labels = dailyHistory.map(h => new Date(h.createdAt || h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        const scoreData = dailyHistory.map(h => h.result?.score || h.score || 0);

        const chartConfig = {
            labels,
            datasets: [
                {
                    label: 'Overall Mental Health Risk Score',
                    data: scoreData,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(28, 176, 182, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: 'var(--primary-color)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100, grid: { color: '#f3f4f6' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false }, tooltip: { padding: 12, titleFont: { size: 14 }, bodyFont: { size: 14 } } }
        };

        return (
            <div className="animate-fade-in">
                <div className="card" style={{ maxWidth: '100%', margin: '0 0 1rem 0', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600, color: '#4b5563' }}>{translate(language, 'trendsByType')}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <select
                                className="input-field"
                                value={selectedTrendType}
                                onChange={(e) => setSelectedTrendType(e.target.value)}
                                style={{ maxWidth: '260px', margin: 0 }}
                            >
                                {trendTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <select
                                className="input-field"
                                value={safeTrendIdx}
                                onChange={(e) => setSelectedTrendAssessmentIdx(Number(e.target.value))}
                                style={{ maxWidth: '360px', margin: 0 }}
                            >
                                {history.map((a, idx) => (
                                    <option key={`${a.createdAt}-${idx}`} value={idx}>
                                        {(a.formData?.testType || 'General')} • {(a.result?.level || 'N/A')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {selectedTrendAssessment && (
                    <div className="card" style={{ margin: '0 0 1rem 0', maxWidth: '100%', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ color: '#4b5563' }}>
                            Selected Result: <strong>{selectedTrendAssessment.formData?.testType || 'General'}</strong> ({selectedTrendAssessment.result?.level || 'N/A'})
                        </div>
                        <div style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
                            Score: {selectedTrendAssessment.result?.score || selectedTrendAssessment.score || 'N/A'}
                        </div>
                    </div>
                )}
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp color="var(--primary-color)" /> {translate(language, 'overallRiskTrend')} ({selectedTrendType})
                </h2>
                <div className="card" style={{ margin: 0, padding: '2rem', height: '400px', width: '100%', maxWidth: '100%' }}>
                    <Line data={chartConfig} options={chartOptions} />
                </div>
            </div>
        );
    };

    // --- Tab 3: Assessment History ---
    const HistoryTab = () => (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History color="var(--primary-color)" /> Assessment History
            </h2>
            <div className="card" style={{ padding: '0', overflow: 'hidden', margin: 0, maxWidth: '100%' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '1rem', color: '#374151', fontWeight: 600 }}>Date Taken</th>
                                <th style={{ padding: '1rem', color: '#374151', fontWeight: 600 }}>Assessment Type</th>
                                <th style={{ padding: '1rem', color: '#374151', fontWeight: 600 }}>Score (/100)</th>
                                <th style={{ padding: '1rem', color: '#374151', fontWeight: 600 }}>Risk Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map((h, i) => {
                                const recordDate = h.createdAt || h.date;
                                const testType = h.formData?.testType || 'General';
                                const score = h.result?.score || h.score || 'N/A';
                                const level = h.result?.level || h.level || 'N/A';
                                return (
                                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                                        {recordDate ? new Date(recordDate).toLocaleDateString() : 'N/A'} {recordDate ? new Date(recordDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: '#374151' }}>{testType}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{score}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                                            backgroundColor: level === 'High' ? '#efe4da' : level === 'Moderate' ? '#f5ede6' : '#f2e8de',
                                            color: getColor(level)
                                        }}>
                                            {level}
                                        </span>
                                    </td>
                                </tr>
                                )}) : (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '1.05rem' }}>No history available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // --- Tab 4: Recommendations ---
    const RecommendationsTab = () => {
        const testType = currentData.formData?.testType;
        const level = currentData.result.level;
        const score = Number(currentData.result.score || 0);

        // Dynamic Recommendations content based on testType
        let recs = [];
        if (testType === 'PHQ-9' || testType === 'Bipolar') {
            recs = [
                { title: "Seek Professional Consultation", text: "Given your mood-related symptoms, establishing a relationship with a therapist or counselor is strongly recommended." },
                { title: "Healthy Sleep Routine", text: "Maintain strict sleep hygiene. Go to bed at the same time and avoid screens an hour before bed." },
                { title: "Reach out to support", text: "Isolation can exacerbate symptoms. Talk to a trusted family member or friend about how you are feeling." }
            ];
        } else if (testType === 'GAD-7' || testType === 'Anxiety' || testType === 'Social Anxiety' || testType === 'Youth') {
            recs = [
                { title: "Mindfulness and Grounding", text: "Practice the 5-4-3-2-1 grounding technique when you feel overwhelmed by anxiety." },
                { title: "Limit Caffeine and Stimulants", text: "Reduce your intake of coffee, energy drinks, and other stimulants which can trigger anxiety attacks." },
                { title: "Professional Support", text: "Consider Cognitive Behavioral Therapy (CBT) which is highly effective for managing anxiety." }
            ];
        } else if (testType === 'Depression') {
            recs = [
                { title: "Structure Your Day", text: "Keep a small daily routine (wake, meals, movement, rest). Predictability helps reduce emotional overload." },
                { title: "Behavioral Activation", text: "Start with one meaningful task per day even if motivation is low. Action can improve mood gradually." },
                { title: "Reach Out Early", text: "Talk to someone you trust or a therapist if low mood continues for more than two weeks." }
            ];
        } else if (testType === 'OCD') {
            recs = [
                { title: "Exposure and Response Prevention (ERP)", text: "ERP is the gold standard treatment for OCD. Consider reaching out to an ERP-certified therapist." },
                { title: "Acknowledge the urges", text: "Try to recognize when you are performing a compulsion, and delay the action by just 5 minutes." }
            ];
        } else if (testType === 'Postpartum Depression' || testType === 'Parent') {
            recs = [
                { title: "Family Support", text: "Don't shoulder the burden alone. Ask for help with childcare or chores so you can have structured breaks." },
                { title: "Consult Pediatrician or Therapist", text: "Share these results with a medical professional to ensure you and your child get the best tailored care." }
            ];
        } else {
            // General fallback
            recs = [
                { title: "Regular Exercise", text: "Aim for 30 minutes of moderate activity daily to naturally boost mood." },
                { title: "Healthy Sleep", text: "Ensure 7-9 hours of quality sleep per night." }
            ];
        }

        if (score >= 70) {
            recs.push({ title: 'Priority Follow-up', text: 'Your score is in a higher range. Consider booking a professional consultation this week.' });
        } else if (score >= 40) {
            recs.push({ title: 'Track and Review', text: 'Retake this assessment in 7 days to monitor whether symptoms are improving.' });
        } else {
            recs.push({ title: 'Maintain Progress', text: 'Keep your healthy routine and check in every 2-3 weeks to stay proactive.' });
        }

        return (
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ListChecks color="var(--primary-color)" /> Personalized Recommendations
                </h2>

                {level === 'High' && (
                    <div style={{ backgroundColor: '#efe4da', border: '1px solid #d7ccc8', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <AlertTriangle color="#5d4037" size={28} style={{ flexShrink: 0, marginTop: '4px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#4e342e', fontSize: '1.15rem' }}>Immediate Action Suggested</h4>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#4e342e', lineHeight: '1.5' }}>Your assessment indicates a high risk level. We strongly recommend speaking with a counselor, therapist, or a healthcare professional immediately to discuss your <strong>{testType || 'assessment'}</strong> results.</p>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {recs.map((rec, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem', margin: 0, width: 'auto', borderLeft: '4px solid var(--primary-color)' }}>
                            <h3 style={{ color: '#111827', fontSize: '1.15rem', marginBottom: '1rem', paddingBottom: '0.5rem' }}>{rec.title}</h3>
                            <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                                {rec.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Main Layout ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', backgroundColor: 'var(--bg-color)', margin: 0, padding: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--input-border)' }}>
            {/* Header (Mobile Toggle) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--input-border)' }}>
                <h1 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'var(--primary-color)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                        <LayoutDashboard color="white" size={20} />
                    </div>
                    Wellness Dashboard
                </h1>

                <button
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}
                >
                    {mobileMenuOpen ? <X size={24} color="var(--text-main)" /> : <Menu size={24} color="var(--text-main)" />}
                </button>
            </div>

            <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                {/* Sidebar */}
                <aside style={{
                    width: '250px',
                    backgroundColor: 'var(--card-bg)',
                    borderRight: '1px solid var(--input-border)',
                    display: mobileMenuOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    padding: '1.5rem 0',
                    position: mobileMenuOpen ? 'absolute' : 'relative',
                    height: mobileMenuOpen ? '100%' : 'auto',
                    zIndex: 10,
                    boxShadow: mobileMenuOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'
                }} className="sidebar-override">
                    <style>{`
                        @media (min-width: 768px) {
                            .sidebar-override { display: flex !important; position: relative !important; min-height: 100vh; }
                            .md\\:hidden { display: none !important; }
                        }
                    `}</style>
                    <div style={{ padding: '0 1rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Menu
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem 1rem',
                                    borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                                    backgroundColor: activeTab === item.id ? '#f5ede6' : 'transparent',
                                    color: activeTab === item.id ? 'var(--primary-color)' : '#4b5563',
                                    fontWeight: activeTab === item.id ? 600 : 500,
                                    transition: 'all 0.2s'

                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', overflowX: 'hidden' }}>
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'trends' && <TrendsTab />}
                    {activeTab === 'history' && <HistoryTab />}
                    {activeTab === 'recommendations' && <RecommendationsTab />}
                </main>
            </div>
        </div>
    );
}

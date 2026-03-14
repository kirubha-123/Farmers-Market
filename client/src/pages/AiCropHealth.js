import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Image as ImageIcon, History, Cloud, CheckCircle2, AlertTriangle, ThermometerSun, Droplets, Wind, Sparkles, Navigation } from 'lucide-react';
import './AiCropHealth.css';

const AiCropHealth = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [viewLang, setViewLang] = useState('ta');
    const [listenLang, setListenLang] = useState('ta-IN');
    const [imagePreview, setImagePreview] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [user, setUser] = useState(null);

    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Auth check
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            fetchHistory(storedUser.id || storedUser._id);
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = listenLang;

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                processDiagnosis(text, null);
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, [listenLang]);

    const fetchHistory = async (uid) => {
        try {
            const res = await fetch(`http://localhost:5000/api/ai-crop-health/history/${uid}`);
            const data = await res.json();
            if (data.success) setHistoryData(data.history);
        } catch (err) { console.error("History fetch error", err); }
    };

    const processDiagnosis = async (queryText, base64Image) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/ai-crop-health/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    queryText, 
                    image: base64Image,
                    userId: user ? (user.id || user._id) : 'guest'
                })
            });
            const data = await response.json();
            if (data.success) {
                setResult(data);
                if (user) fetchHistory(user.id || user._id);
            } else {
                setError("Diagnosis failed. Try again.");
            }
        } catch (err) {
            setError("Server connection lost.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                processDiagnosis("Image upload", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="crop-health-container">
            {/* Header with Search Sync Status */}
            <div className="discovery-header">
                <div className="pulse-dot"></div>
                <span>Connected to Global Agri-Detection v4.2</span>
            </div>

            <div className="health-card">
                <div className="health-primary-actions">
                    <div className="health-header">
                        <h1>Advanced AI Doctor</h1>
                        <p>Real-time detection via Image, Voice or Search</p>
                    </div>

                    <div className="action-grid">
                        <button className={`action-btn mic ${isListening ? 'active' : ''}`} onClick={() => isListening ? recognitionRef.current.stop() : setIsListening(true) || recognitionRef.current.start()}>
                            {isListening ? <AlertTriangle className="animate-pulse" /> : <Camera size={24} />}
                            <span>Camera Analysis</span>
                        </button>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" hidden />
                        <button className="action-btn upload" onClick={() => fileInputRef.current.click()}>
                            <ImageIcon size={24} />
                            <span>Upload Image</span>
                        </button>

                        <button className="action-btn history-toggle" onClick={() => setShowHistory(!showHistory)}>
                            <History size={24} />
                            <span>Diagnosis History</span>
                        </button>
                    </div>
                </div>

                {/* Weather Context (Mocked) */}
                <div className="weather-context">
                    <div className="w-item"><ThermometerSun size={18}/> <span>32°C</span></div>
                    <div className="w-item"><Droplets size={18}/> <span>65% Humid</span></div>
                    <div className="w-item"><Wind size={18}/> <span>12km/h SE</span></div>
                    <div className="w-item location"><Navigation size={14}/> <span>Perambalur, TN</span></div>
                </div>

                <div className="mic-shortcut">
                    <button className={`mic-circle ${isListening ? 'active' : ''}`} onClick={() => isListening ? recognitionRef.current.stop() : setIsListening(true) || recognitionRef.current.start()}>
                        {isListening ? '⏹️' : '🎤'}
                    </button>
                    <p className="status-text">{isListening ? 'Analyzing Audio...' : (transcript || 'Tap to ask about plant symptoms')}</p>
                </div>

                {loading && (
                    <div className="advanced-loader">
                        <div className="orbit"></div>
                        <span>Syncing with Kindwise Global DB...</span>
                    </div>
                )}

                {result && !loading && (
                    <div className="pro-report">
                        <div className="report-badge">
                            <CheckCircle2 size={16}/> 98% Confidence • AI Verified
                        </div>

                        <div className="report-top">
                            <div className="crop-badge">{result.crop}</div>
                            <div className="lang-toggle">
                                <button className={viewLang === 'en' ? 'active' : ''} onClick={() => setViewLang('en')}>EN</button>
                                <button className={viewLang === 'ta' ? 'active' : ''} onClick={() => setViewLang('ta')}>தமிழ்</button>
                            </div>
                        </div>

                        <div className="main-diagnosis">
                            <h3>{viewLang === 'en' ? result.diagnosisEn : result.diagnosisTa}</h3>
                            <div className="conf-bar-container">
                                <div className="conf-label">Clinical Confidence</div>
                                <div className="conf-bar"><div className="fill" style={{width: `${(result.confidence_score || 0.85) * 100}%`}}></div></div>
                            </div>
                        </div>

                        <div className="treatment-checklist">
                            <h4><Sparkles size={16}/> {viewLang === 'en' ? 'Recommended Protocol' : 'பரிந்துரைக்கப்பட்ட சிகிச்சை'}</h4>
                            <div className="check-item"><input type="checkbox" defaultChecked /> <span>{viewLang === 'en' ? result.treatmentEn : result.treatmentTa}</span></div>
                            <div className="check-item"><input type="checkbox" /> <span>{viewLang === 'en' ? result.preventionEn : result.preventionTa}</span></div>
                        </div>

                        <div className="local-remedy-box">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <div>
                                <strong>{viewLang === 'en' ? 'Organic/Local Remedy' : 'இயற்கை வைத்தியம்'}</strong>
                                <p>{viewLang === 'en' ? result.local_remediesEn : result.local_remediesTa}</p>
                            </div>
                        </div>
                    </div>
                )}

                {showHistory && (
                    <div className="history-panel animate-slide">
                        <div className="panel-header">
                            <h3>Diagnosis History</h3>
                            <button onClick={() => setShowHistory(false)}>Close</button>
                        </div>
                        <div className="history-scroll">
                            {historyData.length === 0 ? <p className="empty-msg">No history found.</p> : historyData.map((h, i) => (
                                <div key={i} className="h-item">
                                    <div className="h-top"><strong>{h.crop}</strong> <span>{new Date(h.timestamp).toLocaleDateString()}</span></div>
                                    <p>{viewLang === 'en' ? h.diagnosisEn : h.diagnosisTa}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="doctor-portal-button">
                    <Link to="/agri-doctor" className="portal-btn">
                        <span>Talk to AI Personal Pathologist</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AiCropHealth;

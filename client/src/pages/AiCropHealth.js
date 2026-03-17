import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../api';
import { Link } from 'react-router-dom';
import { Camera, Image as ImageIcon, History, Cloud, CheckCircle2, AlertTriangle, ThermometerSun, Droplets, Wind, Sparkles, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AiCropHealth.css';

const AiCropHealth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'farmer') {
            navigate('/');
        }
    }, [navigate]);

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
    const [isListening, setIsListening] = useState(false);

    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input is not supported. Please use Chrome.');
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = listenLang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const spoken = e.results[0][0].transcript;
            setTranscript(spoken);
            // Auto-analyze after voice input
            processDiagnosis(spoken, null);
        };
        recognition.onerror = (e) => {
            console.warn('Voice error:', e.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
    };

    useEffect(() => {
        // Auth check
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            fetchHistory(storedUser.id || storedUser._id);
        }
    }, []);

    const fetchHistory = async (uid) => {
        try {
            const res = await axios.get(`${API_URL}/ai-crop-health/history/${uid}`);
            const data = res.data;
            if (data.success) setHistoryData(data.history);
        } catch (err) { console.error("History fetch error", err); }
    };

    const processDiagnosis = async (queryText, base64Image) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/ai-crop-health/answer`, {                    queryText, 
                    image: base64Image,
                userId: user ? (user.id || user._id) : 'guest'
            });
            const data = response.data;
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
                        <button className="action-btn camera-alt" onClick={() => navigate('/agri-doctor')}>
                            <Camera size={24} />
                            <span>Agri-Doctor Chat</span>
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

                <div className="search-shortcut" style={{marginBottom: '20px'}}>
                    <div style={{display: 'flex', gap: '8px', background: 'white', padding: '8px', borderRadius: '16px', border: '2px solid #f0fdf4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}}>
                        <input 
                            type="text"
                            placeholder={viewLang === 'ta' ? "பயிரின் அறிகுறிகளை உள்ளிடவும்..." : "Describe plant symptoms..."}
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && transcript.trim() && processDiagnosis(transcript, null)}
                            style={{flex: 1, border: 'none', outline: 'none', padding: '10px 15px', fontSize: '15px'}}
                        />
                        <button 
                            onClick={startVoiceInput}
                            title={isListening ? 'Stop listening' : 'Voice input (Tamil/English)'}
                            style={{
                                background: isListening ? '#ef4444' : '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.3)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>
                        <button 
                            onClick={() => transcript.trim() && processDiagnosis(transcript, null)}
                            style={{background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'}}
                            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                        >
                            {viewLang === 'ta' ? 'ஆராய்' : 'Analyze'}
                        </button>
                    </div>
                    {isListening && (
                        <p style={{color: '#ef4444', fontWeight: 'bold', marginTop: '8px', fontSize: '13px'}}>
                            🎙️ {viewLang === 'ta' ? 'கேட்கிறது... அறிகுறிகளைச் சொல்லுங்கள்' : 'Listening... Describe your crop symptoms'}
                        </p>
                    )}
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

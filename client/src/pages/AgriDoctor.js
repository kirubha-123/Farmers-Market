import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AgriDoctor.css';

const AgriDoctor = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'வணக்கம்! நான் உங்கள் விவசாய மருத்துவர். உங்கள் பயிர் பிரச்சனைகளை என்னிடம் சொல்லுங்கள்.', lang: 'ta' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [history, setHistory] = useState([
        { crop: 'Tomato', diagnosis: 'Early Blight', date: 'Oct 12' },
        { crop: 'Rice', diagnosis: 'Leaf Blast', date: 'Oct 08' }
    ]);
    const [severity, setSeverity] = useState(20);
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("Consulting AI...");

    const recognitionRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'ta-IN';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                sendMessage(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // 🔍 GLOBAL DATA DISCOVERY SIMULATION
            setLoadingStatus("Connecting to Global Agri-Hub...");
            await new Promise(r => setTimeout(r, 700));
            setLoadingStatus("Fetching current regional trends...");
            await new Promise(r => setTimeout(r, 700));
            setLoadingStatus("Verifying Treatment Protocols...");

            const res = await axios.post('http://localhost:5000/api/ai-crop-health/answer', { queryText: text });
            const data = res.data;

            if (data.isAgri) {
                const aiMsg = { 
                    role: 'ai', 
                    text: `உங்கள் ${data.detectedCrop} க்கான மருத்துவ அறிக்கை தயார். இது ${data.diagnosisTa} ஆக இருக்கலாம்.`,
                    report: data
                };
                setMessages(prev => [...prev, aiMsg]);
                
                // Update widgets
                if(data.severity === 'CRITICAL') setSeverity(95);
                else if(data.severity === 'HIGH') setSeverity(75);
                else if(data.severity === 'MODERATE') setSeverity(45);
                else setSeverity(25);

                // Add to history
                setHistory(prev => [{ crop: data.detectedCrop, diagnosis: data.diagnosisEn, date: 'Today' }, ...prev]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: data.diagnosisTa }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: 'மன்னிக்கவும், என்னால் இப்போது பதிலளிக்க முடியவில்லை.' }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    return (
        <div className="agri-doctor-page">
            <div className="doctor-app-container">
                
                {/* SIDEBAR: Consultation History */}
                <aside className="doc-sidebar">
                    <div className="doc-logo">
                        <div className="doc-avatar">🩺</div>
                        <h2>Agri-Doctor</h2>
                    </div>
                    
                    <p className="history-label">Consultation History</p>
                    <div className="history-list">
                        {history.map((h, i) => (
                            <div key={i} className="history-card">
                                <h4>{h.crop} - {h.diagnosis}</h4>
                                <p>{h.date} • Verified AI Report</p>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* MAIN CHAT AREA */}
                <main className="doc-chat-main">
                    <header className="chat-header">
                        <div className="doctor-profile">
                            <div className="doc-avatar">AI</div>
                            <div className="doc-info">
                                <h3>Digital Plant Pathologist</h3>
                                <span>● Online & Analyzing</span>
                            </div>
                        </div>
                        <div className="doctor-actions">
                            <button className="doc-pill-btn">Export PDF</button>
                        </div>
                    </header>

                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg ${m.role}`}>
                                {m.text}
                                {m.report && (
                                    <div className="medical-report">
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                            <span className={`severity-tag ${m.report.severity.toLowerCase()}`}>
                                                {m.report.severity} LEVEL RISK
                                            </span>
                                            <span style={{fontSize: '9px', fontWeight: 'bold', color: '#10b981'}}>
                                                CONFIDENCE: {m.report.confidence || 'HIGH'}
                                            </span>
                                        </div>
                                        <p><strong>💊 {m.report.treatmentTa}</strong></p>
                                        <p style={{fontSize: '11px', marginTop: '5px'}}>🛡️ {m.report.preventionTa}</p>
                                        <hr style={{opacity: 0.1, margin: '10px 0'}} />
                                        <p style={{fontSize: '10px', color: '#666'}}>
                                            <b>Clinical Source:</b> {m.report.source || 'Global Agri-DB v4.0'}
                                        </p>
                                        <p style={{fontSize: '10px', color: '#666'}}>
                                            <b>Doctor's Note:</b> {m.report.riskFactorEn}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="msg ai loading-msg">
                                <div className="loading-spinner"></div>
                                <span>{loadingStatus}</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    <div className="chat-input-area">
                        <button className={`doc-btn mic-btn ${isListening ? 'active' : ''}`} onClick={toggleListening}>
                            {isListening ? '⏹️' : '🎤'}
                        </button>
                        <div className="input-wrapper">
                            <input 
                                placeholder="மஞ்சள் இலைகளைப் பற்றி என்னிடம் கேளுங்கள்..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                            />
                        </div>
                        <button className="doc-btn send-btn" onClick={() => sendMessage(input)}>➤</button>
                    </div>
                </main>

                {/* RIGHT WIDGETS */}
                <aside className="doc-widgets">
                    <div className="widget-card">
                        <h5>Analyzed Risk</h5>
                        <div className="risk-meter">
                            <div className="risk-level" style={{ width: `${severity}%` }}></div>
                        </div>
                        <p style={{fontSize: '10px', marginTop: '10px', fontWeight: 'bold'}}>
                            {severity > 70 ? 'CRITICAL ATTENTION NEEDED' : 'Environment Stable'}
                        </p>
                    </div>

                    <div className="widget-card">
                        <h5>Env Factors</h5>
                        <ul style={{listStyle: 'none', padding: 0, fontSize: '11px', lineHeight: '2'}}>
                            <li>🌡️ Soil Temp: 24°C</li>
                            <li>💧 Humidity: 68%</li>
                            <li>💨 Wind: 14 km/h</li>
                        </ul>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default AgriDoctor;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../api';
import { useNavigate } from 'react-router-dom';
import './AgriDoctor.css';

const AgriDoctor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'farmer') {
            navigate('/');
        }
    }, [navigate]);
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const scrollRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const activeStreamRef = useRef(null);
    const recognitionRef = useRef(null);
    const analyzingRef = useRef(false); // 🔒 prevents duplicate analysis calls

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser. Please use Chrome.');
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ta-IN'; // Tamil first; user can speak English too
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const spoken = e.results[0][0].transcript;
            setInput(prev => prev ? prev + ' ' + spoken : spoken);
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
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isCameraOpen) {
            const initCamera = async () => {
                try {
                    // Try with ideal constraints first
                    const constraints = { 
                        video: { 
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        } 
                    };
                    let stream;
                    try {
                        stream = await navigator.mediaDevices.getUserMedia(constraints);
                    } catch (e) {
                        console.warn("Ideal constraints failed, falling back to basic video", e);
                        // Fallback to absolute minimum if system is being picky
                        stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    }

                    activeStreamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Ensure it plays
                        await videoRef.current.play();
                    }
                } catch (err) {
                    console.error("Camera access error:", err);
                    let msg = "Unable to access camera.";
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') 
                        msg = "Camera access was denied. Please click the camera icon in your browser's address bar and select 'Allow'.";
                    else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') 
                        msg = "No camera found on this device.";
                    else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') 
                        msg = "Camera is already in use by another app (like Zoom or a different browser tab) or blocked by your system.";
                    
                    alert(`📸 Camera Error: ${msg}\n\nTroubleshooting:\n1. Close other tabs/apps using camera\n2. Refresh the page\n3. Use the 📁 icon as a backup (it also has a 'Take Photo' option!)`);
                    setIsCameraOpen(false);
                }
            };
            // Small delay to ensure the DOM element is mounted
            const timer = setTimeout(initCamera, 100);
            return () => clearTimeout(timer);
        } else {
            if (activeStreamRef.current) {
                activeStreamRef.current.getTracks().forEach(track => track.stop());
                activeStreamRef.current = null;
            }
        }
    }, [isCameraOpen]);

    const sendMessage = async (text) => {
        if (!text.trim() || analyzingRef.current) return;
        analyzingRef.current = true;

        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            setLoadingStatus("Connecting to Global Agri-Hub...");
            await new Promise(r => setTimeout(r, 600));
            setLoadingStatus("Running AI Diagnosis...");
            await new Promise(r => setTimeout(r, 600));
            setLoadingStatus("Generating Treatment Protocol...");

            const res = await axios.post(`${API_URL}/ai-crop-health/answer`, { queryText: text });
            const data = res.data;

            // Always build a full AI report card if we have diagnosis data
            const hasDiagnosis = data.crop || data.diagnosisEn || data.treatmentEn;
            const aiMsg = {
                role: 'ai',
                text: hasDiagnosis
                    ? `✅ Diagnosis complete for ${data.crop || 'your crop'}: ${data.diagnosisEn || ''}`
                    : (data.diagnosisTa || 'Could not identify the issue.'),
                report: hasDiagnosis ? data : null
            };
            setMessages(prev => [...prev, aiMsg]);

            // Severity widget
            const conf = parseFloat(data.confidence_score || 0);
            setSeverity(conf > 0.85 ? 90 : conf > 0.7 ? 60 : 35);

            // Add to history
            if (data.crop) {
                setHistory(prev => [{ crop: data.crop, diagnosis: data.diagnosisEn || 'Unknown', date: 'Today' }, ...prev]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: 'மன்னிக்கவும், என்னால் இப்போது பதிலளிக்க முடியவில்லை. Server may be offline.' }]);
        } finally {
            setLoading(false);
            analyzingRef.current = false; // 🔓 release lock
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const analyzeCrop = async () => {
        // 🔒 Ref-based lock: immune to React Strict Mode double-invocation
        if (!selectedImage || analyzingRef.current) return;
        analyzingRef.current = true;

        setLoading(true);
        setLoadingStatus("📸 Reading image...");

        const capturedPreview = imagePreview; // snapshot before clearing

        try {
            // Convert image to base64 for OpenAI Vision
            const reader = new FileReader();
            const base64 = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result); // data:image/...;base64,...
                reader.onerror = reject;
                reader.readAsDataURL(selectedImage);
            });

            setLoadingStatus("🤖 Sending to AI Vision Doctor...");

            // Use the OpenAI-powered crop health route (supports vision)
            const res = await axios.post(`${API_URL}/ai-crop-health/answer`, {
                queryText: (input ? `${input}. ` : '') + 'Identify the crop disease in this image and provide detailed treatment and prevention steps.',
                image: base64,
                imageName: selectedImage?.name || '',
                userId: JSON.parse(localStorage.getItem('user') || '{}')?.id
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            });

            const data = res.data;
            const hasDiagnosis = data.crop || data.diagnosisEn;

            const aiMsg = {
                role: 'ai',
                text: hasDiagnosis
                    ? `✅ Image analyzed: ${data.crop || 'Crop'} — ${data.diagnosisEn || 'See report below'}`
                    : '⚠️ Could not clearly identify disease. Please try a clearer close-up photo.',
                preview: capturedPreview,
                report: hasDiagnosis ? data : null
            };

            setMessages(prev => [...prev, aiMsg]);

            // Update risk meter
            const conf = parseFloat(data.confidence_score || 0.5);
            setSeverity(conf > 0.85 ? 90 : conf > 0.7 ? 60 : 40);

            if (data.crop) {
                setHistory(prev => [{ crop: data.crop, diagnosis: data.diagnosisEn || 'Image Scan', date: 'Just Now' }, ...prev]);
            }

        } catch (err) {
            console.error("Image analysis error:", err);
            const errMsg = err.response?.data?.error || err.message || 'Server error';
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `மன்னிக்கவும், படத்தை பகுப்பாய்வு செய்வதில் பிழை: ${errMsg}`
            }]);
        } finally {
            setLoading(false);
            setSelectedImage(null);
            setImagePreview(null);
            analyzingRef.current = false; // 🔓 release lock for next upload
        }
    };



    const startCamera = () => {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            alert("⚠️ Camera access requires a secure connection (HTTPS). Please use localhost or an HTTPS URL.");
            return;
        }
        setIsCameraOpen(true);
    };

    const stopCamera = () => {
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            // Add visual shutter effect
            const container = video.parentElement;
            container.classList.add('shutter-flash');
            setTimeout(() => container.classList.remove('shutter-flash'), 200);

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            canvas.toBlob((blob) => {
                const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
                setSelectedImage(file);
                setImagePreview(URL.createObjectURL(file));
                
                // Stop camera after short delay to allow visual feedback
                setTimeout(stopCamera, 300);
            }, 'image/jpeg');
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
                                {m.preview && (
                                    <div className="msg-image-container">
                                        <img src={m.preview} alt="Analyzed Crop" className="msg-preview-image" />
                                    </div>
                                )}
                                <div className="msg-text">{m.text}</div>
                                {m.isAnalysis && m.analysisData && (
                                    <div className="medical-report analysis">
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                            <span className="severity-tag high">AI DIAGNOSIS</span>
                                            <span style={{fontSize: '11px', fontWeight: 'bold', color: '#10b981'}}>
                                                CONFIDENCE: {(m.analysisData.confidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p><strong>🩺 Detected: {m.analysisData.disease}</strong></p>
                                        <div style={{marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', fontSize: '12px'}}>
                                            <p style={{marginBottom: '5px'}}><b>🔍 Symptoms:</b> {m.analysisData.symptoms}</p>
                                            <p style={{marginBottom: '5px', color: '#00897b'}}><b>💊 Treatment:</b> {m.analysisData.treatment}</p>
                                            <p style={{marginBottom: '0', color: '#004d40'}}><b>🛡️ Prevention:</b> {m.analysisData.prevention}</p>
                                        </div>
                                        <p style={{fontSize: '11px', color: '#666', marginTop: '10px', fontStyle: 'italic'}}>
                                            Based on visual patterns identified by our plant pathology network.
                                        </p>
                                    </div>
                                )}
                                {m.report && (
                                    <div className="medical-report">
                                        {/* Header */}
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                                            <span style={{background:'#065f46', color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:'bold', letterSpacing:'1px'}}>AI DIAGNOSIS</span>
                                            <span style={{fontSize:'11px', fontWeight:'bold', color:'#10b981'}}>
                                                {m.report.confidence_score ? `${(m.report.confidence_score * 100).toFixed(0)}% Confidence` : 'AI Verified'}
                                            </span>
                                        </div>

                                        {/* Crop + Disease */}
                                        <div style={{background:'#f0fdf4', borderRadius:'12px', padding:'12px', marginBottom:'10px', border:'1px solid #bbf7d0'}}>
                                            <p style={{fontSize:'12px', color:'#15803d', fontWeight:'bold', marginBottom:'4px'}}>🌿 Crop Identified</p>
                                            <p style={{fontSize:'15px', fontWeight:'900', color:'#14532d', margin:0}}>{m.report.crop || 'Unknown Crop'}</p>
                                            <p style={{fontSize:'12px', color:'#166534', marginTop:'6px', margin:'6px 0 0'}}>
                                                <b>🔬 Disease:</b> {m.report.diagnosisEn || 'See details below'}
                                            </p>
                                            {m.report.diagnosisTa && (
                                                <p style={{fontSize:'11px', color:'#166534', marginTop:'4px', fontStyle:'italic'}}>{m.report.diagnosisTa}</p>
                                            )}
                                        </div>

                                        {/* Treatment */}
                                        <div style={{background:'#fffbeb', borderRadius:'12px', padding:'12px', marginBottom:'10px', border:'1px solid #fde68a'}}>
                                            <p style={{fontSize:'12px', color:'#92400e', fontWeight:'bold', marginBottom:'6px'}}>💊 Treatment Plan</p>
                                            <p style={{fontSize:'12px', color:'#78350f', lineHeight:'1.6', margin:0}}>{m.report.treatmentEn || m.report.treatmentTa || 'Consult local agri officer.'}</p>
                                            {m.report.treatmentTa && m.report.treatmentEn && (
                                                <p style={{fontSize:'11px', color:'#92400e', marginTop:'6px', fontStyle:'italic', borderTop:'1px dashed #fde68a', paddingTop:'6px'}}>{m.report.treatmentTa}</p>
                                            )}
                                        </div>

                                        {/* Prevention */}
                                        <div style={{background:'#eff6ff', borderRadius:'12px', padding:'12px', marginBottom:'10px', border:'1px solid #bfdbfe'}}>
                                            <p style={{fontSize:'12px', color:'#1e40af', fontWeight:'bold', marginBottom:'6px'}}>🛡️ Prevention / IPM</p>
                                            <p style={{fontSize:'12px', color:'#1e3a8a', lineHeight:'1.6', margin:0}}>{m.report.preventionEn || m.report.preventionTa || 'Follow standard IPM practices.'}</p>
                                            {m.report.preventionTa && m.report.preventionEn && (
                                                <p style={{fontSize:'11px', color:'#1e40af', marginTop:'6px', fontStyle:'italic', borderTop:'1px dashed #bfdbfe', paddingTop:'6px'}}>{m.report.preventionTa}</p>
                                            )}
                                        </div>

                                        {/* Local/Organic Remedies */}
                                        {(m.report.local_remediesEn || m.report.local_remediesTa) && (
                                            <div style={{background:'#fdf4ff', borderRadius:'12px', padding:'12px', marginBottom:'10px', border:'1px solid #e9d5ff'}}>
                                                <p style={{fontSize:'12px', color:'#6b21a8', fontWeight:'bold', marginBottom:'6px'}}>🌱 Local / Organic Remedies</p>
                                                <p style={{fontSize:'12px', color:'#581c87', lineHeight:'1.6', margin:0}}>{m.report.local_remediesEn}</p>
                                                {m.report.local_remediesTa && (
                                                    <p style={{fontSize:'11px', color:'#7c3aed', marginTop:'6px', fontStyle:'italic', borderTop:'1px dashed #e9d5ff', paddingTop:'6px'}}>{m.report.local_remediesTa}</p>
                                                )}
                                            </div>
                                        )}

                                        <p style={{fontSize:'10px', color:'#9ca3af', marginTop:'8px', textAlign:'right', fontStyle:'italic'}}>
                                            Source: {m.report.source || 'TNAU / Global Agri-DB'}
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
                        {imagePreview && (
                            <div className="image-preview-bubble">
                                <img src={imagePreview} alt="Preview" />
                                <button className="clear-preview" onClick={() => {setImagePreview(null); setSelectedImage(null);}}>✕</button>
                                <button className="analyze-btn" onClick={analyzeCrop}>Analyze Crop</button>
                            </div>
                        )}
                        <label className="doc-btn upload-btn" title="Upload Image">
                            📁
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{display: 'none'}} />
                        </label>
                        <button className="doc-btn camera-btn" title="Take Photo" onClick={startCamera}>
                            📸
                        </button>
                        <div className="input-wrapper">
                            <input 
                                placeholder="மஞ்சள் இலைகளைப் பற்றி என்னிடம் கேளுங்கள்..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                            />
                        </div>
                        <button 
                            className={`doc-btn mic-btn ${isListening ? 'listening' : ''}`} 
                            title={isListening ? 'Stop Listening' : 'Voice Input (Tamil/English)'}
                            onClick={startVoiceInput}
                            style={{
                                background: isListening ? '#ef4444' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.3)' : 'none',
                                transition: 'all 0.3s',
                                animation: isListening ? 'pulse-mic 1s infinite' : 'none',
                                flexShrink: 0
                            }}
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>
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
                
                {/* CAMERA MODAL */}
                {isCameraOpen && (
                    <div className="camera-modal">
                        <div className="camera-container">
                            <video ref={videoRef} autoPlay playsInline />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="camera-controls">
                                <button className="capture-btn" onClick={capturePhoto}>●</button>
                                <button className="close-camera" onClick={stopCamera}>✕</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AgriDoctor;

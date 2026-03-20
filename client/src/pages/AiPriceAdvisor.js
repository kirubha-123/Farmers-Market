import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../api';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './AiPriceAdvisor.css';

const AiPriceAdvisor = () => {
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
    const [language, setLanguage] = useState('ta-IN'); // Default to Tamil
    const [isListening, setIsListening] = useState(false);
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
        recognition.lang = language;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const spoken = e.results[0][0].transcript;
            setTranscript(spoken);
            // Auto-search after voice input
            fetchPriceAdvice(spoken);
        };
        recognition.onerror = (e) => {
            console.warn('Voice error:', e.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
    };

    const fetchPriceAdvice = async (queryText) => {
        if (!queryText.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/ai-price/answer`, {
                queryText, 
                preferredLanguage: language === 'ta-IN' ? 'Tamil' : 'English' 
            });

            const data = response.data;
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || "Failed to get advice");
            }
        } catch (err) {
            setError("Connection error. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="ai-price-container py-12 px-4">
                <div className="advisor-card mx-auto">
                    <h1 className="advisor-title">AgriForge AI</h1>
                    <p className="advisor-subtitle">Enter a crop name to get real-time price & advice</p>

                    <div className="language-toggle mb-6">
                        <button 
                            className={`lang-btn ${language === 'ta-IN' ? 'active' : ''}`}
                            onClick={() => setLanguage('ta-IN')}
                        >
                            Tamil
                        </button>
                        <button 
                            className={`lang-btn ${language === 'en-US' ? 'active' : ''}`}
                            onClick={() => setLanguage('en-US')}
                        >
                            English
                        </button>
                    </div>

                    <div className="search-section" style={{marginTop: '20px'}}>
                        <div className="input-group" style={{display: 'flex', gap: '10px'}}>
                            <input 
                                type="text" 
                                className="price-search-input"
                                placeholder={language === 'ta-IN' ? "பயிரின் பெயரை உள்ளிடவும்..." : "Enter crop name..."}
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchPriceAdvice(transcript)}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    borderRadius: '15px',
                                    border: '2px solid #e0e0e0',
                                    outline: 'none',
                                    fontSize: '16px',
                                    color: '#333'
                                }}
                            />
                            <button 
                                onClick={startVoiceInput}
                                title={isListening ? 'Stop listening' : `Speak crop name in ${language === 'ta-IN' ? 'Tamil' : 'English'}`}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '15px',
                                    background: isListening ? '#ef4444' : '#10b981',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.3)' : 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isListening ? '🔴' : '🎤'}
                            </button>
                            <button 
                                onClick={() => fetchPriceAdvice(transcript)}
                                className="price-search-btn"
                                style={{
                                    padding: '12px 25px',
                                    borderRadius: '15px',
                                    background: '#4f46e5',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {language === 'ta-IN' ? 'தேடு' : 'Search'}
                            </button>
                        </div>
                        {isListening && (
                            <p style={{color: '#ef4444', fontWeight: 'bold', marginTop: '8px', fontSize: '14px'}}>
                                🎙️ {language === 'ta-IN' ? 'கேட்கிறது... பயிரின் பெயரைச் சொல்லுங்கள்' : 'Listening... Say the crop name'}
                            </p>
                        )}
                    </div>

                    {loading && <p className="mt-6 text-indigo-600 font-bold animate-pulse text-lg">Thinking... Thinking... 🤖</p>}
                    {error && <p className="error-text mt-4" style={{color: '#ff6b6b'}}>{error}</p>}

                    {result && (
                        <div className="result-section mt-8">
                            <div className="price-badge bg-emerald-500 text-white inline-block px-6 py-2 rounded-full font-bold text-xl mb-6">
                                ₹{result.currentPrice} per {result.unit}
                            </div>
                            <p className="text-gray-700 mb-6 font-bold"><strong>Market:</strong> {result.market}</p>
                            
                            <div className="advice-card bg-white/5 border border-white/10 p-6 rounded-3xl text-left shadow-inner">
                                <h4 className="flex items-center gap-2 text-xl font-bold mb-4">
                                    <span className={`status-indicator status-${result.status.replace(' ', '-')}`}></span>
                                    {result.status}
                                </h4>
                                <div className="space-y-4">
                                    <p className="text-sm"><strong>Advice:</strong> {result.aiAdviceEn}</p>
                                    <p className="text-sm font- तमिल"><strong>பரிந்துரை:</strong> {result.aiAdviceTa}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AiPriceAdvisor;

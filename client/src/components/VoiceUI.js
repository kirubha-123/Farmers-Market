import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, TrendingUp, Truck, CreditCard, X, Sparkles, ChevronRight, Activity, ArrowUpRight, MapPin, Calendar, Loader2, Phone, Fingerprint, User, ArrowLeft } from 'lucide-react';
import { useVoice } from './VoiceContext';
import axios from 'axios';

const VoiceUI = () => {
    const {
        transcript,
        isListening,
        toggleListening,
        aiMessage,
        speak,
        language,
        setLanguage,
        resetTranscript
    } = useVoice();

    const [showUI, setShowUI] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [logistics, setLogistics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSilentMode, setIsSilentMode] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const lastProcessedRef = useRef('');

    // 🚀 EXPANDED DICTIONARIES
    const cropDict = {
        'onion': 'Onion', 'வெங்காயம்': 'Onion', 'vengayam': 'Onion',
        'tomato': 'Tomato', 'தக்காளி': 'Tomato', 'thakkali': 'Tomato',
        'potato': 'Potato', 'உருளைக்கிழங்கு': 'Potato', 'urulai': 'Potato',
        'cabbage': 'Cabbage', 'முட்டைக்கோஸ்': 'Cabbage', 'muttaikose': 'Cabbage',
        'rice': 'Rice', 'அரிசி': 'Rice', 'arisi': 'Rice'
    };

    const locDict = {
        'perambalur': 'Perambalur', 'perambaloor': 'Perambalur', 'perambulur': 'Perambalur', 'parambalur': 'Perambalur', 'பெரம்பலூர்': 'Perambalur',
        'chennai': 'Chennai', 'chennaiy': 'Chennai', 'சென்னை': 'Chennai',
        'madurai': 'Madurai', 'மதுரை': 'Madurai',
        'trichy': 'Trichy', 'திருச்சி': 'Trichy', 'tiruchy': 'Trichy',
        'vellore': 'Vellore', 'வேலூர்': 'Vellore',
        'salem': 'Salem', 'சேலம்': 'Salem',
        'coimbatore': 'Coimbatore', 'கோயம்புத்தூர்': 'Coimbatore', 'kovai': 'Coimbatore',
        'dindigul': 'Dindigul', 'திண்டுக்கல்': 'Dindigul',
        'villupuram': 'Villupuram', 'விழுப்புரம்': 'Villupuram',
        'thanjavur': 'Thanjavur', 'தஞ்சாவூர்': 'Thanjavur',
        'erode': 'Erode', 'ஈரோடு': 'Erode',
        'tiruppur': 'Tiruppur', 'திருப்பூர்': 'Tiruppur'
    };

    // Advanced NLP Parser
    useEffect(() => {
        const processCommand = async () => {
            if (isSilentMode || !transcript || transcript === lastProcessedRef.current) return;

            setLoading(true);
            const text = transcript.toLowerCase();
            lastProcessedRef.current = transcript;

            const logisticsKeywords = [
                'truck', 'share', 'vandi', 'tractor', 'logistics',
                'வண்டி', 'டிராக்டர்', 'ஏத்தி', 'லோடு', 'செல்றார்கள்', 'transport'
            ];

            const isLogisticsRequest = logisticsKeywords.some(kw => text.includes(kw));

            // Detect multiple locations based on position in sentence
            let detectedLocations = [];
            for (const [key, val] of Object.entries(locDict)) {
                let idx = text.indexOf(key);
                if (idx !== -1) {
                    detectedLocations.push({ val, idx });
                }
            }
            detectedLocations.sort((a, b) => a.idx - b.idx);

            let uniqueLocations = [];
            let uniqueDetails = [];
            detectedLocations.forEach(d => {
                if (!uniqueLocations.includes(d.val)) {
                    uniqueLocations.push(d.val);
                    uniqueDetails.push(d);
                }
            });

            let origin = null;
            let destination = null;

            if (uniqueLocations.length >= 2) {
                // If it starts with "to" instead of "from"
                const firstLocIdx = uniqueDetails[0].idx;
                const textBeforeFirstLoc = text.substring(0, firstLocIdx);

                if (textBeforeFirstLoc.includes("to ") || textBeforeFirstLoc.includes("towards ")) {
                    destination = uniqueLocations[0];
                    origin = uniqueLocations[1];
                } else {
                    origin = uniqueLocations[0];
                    destination = uniqueLocations[1];
                }
            } else if (uniqueLocations.length === 1) {
                // Check context if there's only one recognized location
                const textBeforeLoc = text.substring(0, uniqueDetails[0].idx);
                const isDestinationContext = textBeforeLoc.includes('to ') || textBeforeLoc.includes('for ') || text.includes('க்கு');

                if (isDestinationContext) {
                    destination = uniqueLocations[0];
                } else {
                    origin = uniqueLocations[0]; // fallback
                }
            }

            // 1. Stock / Quantity Logic
            const stockKeywords = [
                'stock', 'remaining', 'left', 'quantity', 'how much',
                'ஸ்டாக்', 'எவ்வளவு', 'மீதம்'
            ];
            const isStockRequest = stockKeywords.some(kw => text.includes(kw));

            if (isStockRequest) {
                let cropName = null;
                for (const [key, val] of Object.entries(cropDict)) {
                    if (text.includes(key)) cropName = val;
                }
                const queryLocation = origin || destination || 'Chennai';

                if (cropName) {
                    try {
                        const res = await axios.get(`http://localhost:5000/api/products/search?name=${cropName}&location=${queryLocation}`);
                        const data = res.data;

                        setLogistics([]);
                        setPredictions([]);

                        if (data.status === 'not_found' || data.remainingQuantity === 0) {
                            speak(`Sorry, ${cropName} is currently out of stock in ${queryLocation}.`);
                            setPredictions([{
                                location: queryLocation,
                                crop: cropName,
                                predictedPrice: 'N/A',
                                recommendation: `Currently out of stock. Try looking in nearby areas.`
                            }]);
                        } else {
                            speak(`There are ${data.remainingQuantity} kilograms of ${cropName} remaining in ${queryLocation}. ${data.lowStock ? "Warning: Stock is running low." : ""}`);
                            setPredictions([{
                                location: queryLocation,
                                crop: cropName,
                                predictedPrice: 'AVAILABLE',
                                recommendation: `${data.remainingQuantity} kg available. ${data.lowStock ? "⚠️ Fast Selling" : ""}`
                            }]);
                        }
                    } catch (err) {
                        speak("Error connecting to inventory system.");
                    } finally {
                        setLoading(false);
                        resetTranscript();
                    }
                    return;
                }
            }

            // 2. Logistics Logic (Real Dataset Integration)
            if (isLogisticsRequest) {
                try {
                    const params = {};
                    if (origin) params.origin = origin;
                    if (destination) params.destination = destination;

                    const res = await axios.get(`http://localhost:5000/api/logistics`, { params });
                    setPredictions([]);
                    setLogistics(res.data);

                    if (res.data.length === 0) {
                        speak(`Sorry, no transport found ${origin ? 'from ' + origin : ''} ${destination ? 'to ' + destination : ''}.`);
                    } else if (origin && destination) {
                        speak(`Found ${res.data.length} real transport options from ${origin} to ${destination}.`);
                    } else if (destination && !origin) {
                        speak(`Found ${res.data.length} real transport options heading TO ${destination}.`);
                    } else if (origin) {
                        speak(`Found ${res.data.length} transport options near ${origin}.`);
                    } else {
                        speak(`Found transport options in your area.`);
                    }
                } catch (err) {
                    speak("Logistics network is offline.");
                } finally {
                    setLoading(false);
                    resetTranscript();
                }
                return;
            }

            // 2. Price Predictions
            let detectedCrops = [];
            for (const [key, val] of Object.entries(cropDict)) {
                if (text.includes(key)) {
                    if (!detectedCrops.includes(val)) detectedCrops.push(val);
                }
            }

            if (detectedCrops.length > 0) {
                try {
                    const results = await Promise.all(
                        detectedCrops.map(async (c) => {
                            const res = await axios.post('http://localhost:5000/api/predictions/predict', {
                                crop: c,
                                location: origin || "Chennai"
                            });
                            return res.data;
                        })
                    );
                    setLogistics([]);
                    setPredictions(results);
                    speak(`Showing market predictions for ${detectedCrops.join(", ")}.`);
                } catch (err) {
                    speak("Market Oracle offline.");
                } finally {
                    setLoading(false);
                    resetTranscript();
                }
            } else {
                setLoading(false);
            }
        };

        if (!isListening && transcript.length > 3) {
            processCommand();
        }
    }, [isListening, transcript]);

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {showUI && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="mb-6 w-80 sm:w-[440px] max-h-[80vh] bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-emerald-50 flex flex-col overflow-hidden"
                    >
                        {selectedDriver ? (
                            /* DRIVER DETAILS VIEW */
                            <>
                                <div className="bg-blue-600 p-5 text-white flex justify-between items-center shrink-0">
                                    <span className="font-black text-lg flex items-center gap-2 tracking-tighter uppercase">
                                        <button onClick={() => setSelectedDriver(null)} className="p-1 hover:bg-blue-500 rounded-lg transition-colors mr-2">
                                            <ArrowLeft size={20} />
                                        </button>
                                        Driver Details
                                    </span>
                                    <X className="cursor-pointer opacity-80 hover:opacity-100 bg-blue-800 p-1 rounded-full" size={24} onClick={() => { setShowUI(false); setSelectedDriver(null); }} />
                                </div>

                                <div className="p-6 space-y-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar">
                                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 text-center relative mt-4">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                            <User size={40} />
                                        </div>
                                        <div className="mt-8">
                                            <h2 className="text-2xl font-black text-gray-900">{selectedDriver.driverName}</h2>
                                            <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-1 mt-1"><Fingerprint size={14} /> Verified Network Operator</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-50 space-y-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Vehicle Information</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Truck size={20} /></div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 leading-tight">{selectedDriver.vehicleType}</p>
                                                <p className="text-xs font-bold text-gray-500">License: {selectedDriver.vehicleNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={20} /></div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 leading-tight">Max Load: {selectedDriver.capacity} Tons</p>
                                                <p className="text-xs font-bold text-gray-500">Current Load: {selectedDriver.currentLoad} Tons filled</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100">
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 text-center">Contact Direct</p>
                                        <p className="text-2xl font-black text-center text-blue-900 mb-4">{selectedDriver.driverPhone}</p>
                                        <a href={`tel:${selectedDriver.driverPhone}`} className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg">
                                            DIAL FROM MOBILE
                                        </a>
                                        <p className="text-center text-[10px] items-center mt-3 font-bold text-gray-400">Desktop browser? Ensure phone link is configured.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* MAIN HUD VIEW */
                            <>
                                <div className="bg-emerald-600 p-5 text-white flex justify-between items-center shrink-0">
                                    <span className="font-black text-lg flex items-center gap-2 tracking-tighter uppercase"><Activity size={18} /> AgriForge Real-Time</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setLanguage('ta-IN')} className={`text-[10px] p-2 rounded-lg font-bold ${language === 'ta-IN' ? 'bg-white text-emerald-600' : 'bg-emerald-700'}`}>தமிழ்</button>
                                        <button onClick={() => setLanguage('en-US')} className={`text-[10px] p-2 rounded-lg font-bold ${language === 'en-US' ? 'bg-white text-emerald-600' : 'bg-emerald-700'}`}>EN</button>
                                        <X className="cursor-pointer ml-1 opacity-80 hover:opacity-100 bg-emerald-800 p-1 rounded-full" size={24} onClick={() => setShowUI(false)} />
                                    </div>
                                </div>

                                <div className="p-5 space-y-5 overflow-y-auto bg-gray-50/50 flex-1 custom-scrollbar">

                                    {/* Inner Mic Button for Continuous Questions */}
                                    <div className="flex justify-between items-center bg-white p-2 pl-4 rounded-[2rem] shadow-sm border border-emerald-100">
                                        <div className="text-xs font-bold text-gray-500 truncate mr-2">
                                            {isListening ? (
                                                <span className="text-emerald-500 animate-pulse">Listening... {transcript}</span>
                                            ) : (
                                                <span>Tap mic to ask another question</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={toggleListening}
                                            className={`p-3 rounded-full shadow-md transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                                        >
                                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                        </button>
                                    </div>

                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-50 text-emerald-900 font-extrabold text-lg leading-tight">
                                        {loading ? <div className="flex items-center gap-2 italic text-emerald-500 animate-pulse"><Loader2 size={20} className="animate-spin" /> Syncing Real Data...</div> : aiMessage}
                                    </div>

                                    <div className="space-y-4">
                                        {/* REAL PREDICTIONS */}
                                        {predictions.map((p, i) => (
                                            <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-5 rounded-[2rem] border-2 border-emerald-50 shadow-sm">
                                                <div className="flex justify-between items-end mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-1 text-emerald-600 mb-1">
                                                            <MapPin size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{p.location}</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{p.crop}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-emerald-500 justify-end mb-1">
                                                            <ArrowUpRight size={14} />
                                                            <span className="text-xs font-black">+15% AI Prediction</span>
                                                        </div>
                                                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">₹{p.predictedPrice}</p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-2xl text-[11px] font-bold text-gray-500 italic">
                                                    "{p.recommendation}"
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* REAL LOGISTICS WITH DRIVER DETAILS */}
                                        {logistics.map((l, i) => (
                                            <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[2rem] border-2 border-blue-50 shadow-sm overflow-hidden group">
                                                <div className="p-4 border-b border-gray-50">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                            <Truck size={24} />
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-blue-600 tracking-tighter">₹{l.pricePerKg}/kg</p>
                                                            <p className="text-[9px] font-black text-blue-400 tracking-widest uppercase">Direct Freight</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm font-black text-gray-800">
                                                            <MapPin size={14} className="text-blue-500" />
                                                            {l.origin} → {l.destination}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            Loading: {new Date(l.departureTime).toLocaleTimeString()} Today
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* DRIVER & VEHICLE BOX */}
                                                <div className="bg-blue-50/50 p-4 space-y-3">
                                                    <div className="flex justify-between items-center text-[9px] font-black text-blue-600/70 uppercase tracking-widest">
                                                        <span>Vehicle Info</span>
                                                        <span>Operator</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                                                <Fingerprint size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-gray-900 leading-tight">{l.vehicleType}</p>
                                                                <p className="text-[9px] font-bold text-blue-500">{l.vehicleNumber}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[11px] font-black text-gray-900 flex items-center gap-1 justify-end"><User size={10} /> {l.driverName}</p>
                                                            <p className="text-[9px] font-bold text-green-600">Verified ✅</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setSelectedDriver(l)}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 text-xs"
                                                    >
                                                        <User size={14} />
                                                        VIEW DRIVER DETAILS
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-950 text-white flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-900 rounded-lg"><CreditCard size={18} className="text-emerald-400" /></div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Seed Loan</p>
                                            <p className="text-lg font-black leading-none mt-1">₹25,000</p>
                                        </div>
                                    </div>
                                    <button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all">Quick Apply</button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    if (!showUI) setShowUI(true);
                    toggleListening();
                }}
                className={`p-5 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 ${isListening ? 'bg-red-500' : 'bg-emerald-600'} text-white relative z-50`}
            >
                {isListening ? <MicOff size={32} className="animate-pulse" /> : <Mic size={32} />}
            </motion.button>
        </div>
    );
};

export default VoiceUI;

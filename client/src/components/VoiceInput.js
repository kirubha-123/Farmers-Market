'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react';

const VoiceInput = ({
  onSmartFill,
  label = 'AI Assistant',
  language = 'ta-IN'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasSupport(
        'webkitSpeechRecognition' in window ||
        'SpeechRecognition' in window
      );
    }
  }, []);

  // 🚀 MISSION CRITICAL: TAMIL → ENGLISH SMART PARSER
  const parseTamilFarmerSpeech = useCallback((rawText) => {
    const text = rawText.toLowerCase().trim();

    const tamilProducts = {
      'urulaikizhangu': 'Potato', 'உருளைக்கிழங்கு': 'Potato', 'urulai': 'Potato', 'potato': 'Potato',
      'thakkali': 'Tomato', 'தக்காளி': 'Tomato', 'tomato': 'Tomato',
      'vengayam': 'Onion', 'வெங்காயம்': 'Onion', 'onion': 'Onion',
      'kathirikkai': 'Brinjal', 'கத்தரிக்காய்': 'Brinjal', 'brinjal': 'Brinjal',
      'murungakkai': 'Drumstick', 'முருங்கைக்காய்': 'Drumstick',
      'vendakkai': "Lady's Finger", 'வெண்டைக்காய்': "Lady's Finger",
      'arisi': 'Rice', 'அரிசி': 'Rice',
      'godhuma': 'Wheat', 'கோதுமை': 'Wheat',
      'maampazham': 'Mango', 'மாம்பழம்': 'Mango',
      'vaazhai': 'Banana', 'வாழைப்பழம்': 'Banana',
      'carrot': 'Carrot', 'கேரட்': 'Carrot',
      'beans': 'Beans', 'பீன்ஸ்': 'Beans',
      'appil': 'Apple', 'ஆப்பிள்': 'Apple'
    };

    const categories = {
      'kaaykari': 'vegetables', 'காய்கறி': 'vegetables',
      'pazham': 'fruits', 'பழம்': 'fruits',
      'thaniyam': 'grains', 'தானியம்': 'grains'
    };

    const locations = {
      'perambalur': 'Perambalur', 'பெரம்பலூர்': 'Perambalur',
      'trichy': 'Trichy', 'திருச்சி': 'Trichy',
      'chennai': 'Chennai', 'சென்னை': 'Chennai',
      'madurai': 'Madurai', 'மதுரை': 'Madurai'
    };

    // Extract numbers (Price/Stock)
    const numbers = text.match(/(\d+(?:\.\d+)?)/g) || [];
    const price = numbers[0] || '';
    const stock = numbers[1] || '';

    let productName = '';
    let category = '';
    let location = '';

    for (const [key, val] of Object.entries(tamilProducts)) {
      if (text.includes(key)) { productName = val; break; }
    }
    for (const [key, val] of Object.entries(categories)) {
      if (text.includes(key)) { category = val; break; }
    }
    for (const [key, val] of Object.entries(locations)) {
      if (text.includes(key)) { location = val; break; }
    }

    if (productName && !category) {
      if (['Potato', 'Tomato', 'Onion', 'Brinjal', 'Drumstick', "Lady's Finger", 'Carrot', 'Beans'].includes(productName)) category = 'vegetables';
      if (['Mango', 'Banana', 'Apple'].includes(productName)) category = 'fruits';
      if (['Rice', 'Wheat'].includes(productName)) category = 'grains';
    }

    const smartData = {
      name: productName,
      category: category,
      pricePerKg: price,
      stockKg: stock,
      location: location,
      description: productName ? `Harvested fresh ${productName} from ${location || 'local farms'}.` : ''
    };

    // Clean undefined
    Object.keys(smartData).forEach(key => smartData[key] === undefined || smartData[key] === '' ? delete smartData[key] : null);

    return {
      smartData,
      confidence: Object.keys(smartData).length,
      rawText
    };
  }, []);

  const startListening = () => {
    if (!hasSupport || isListening) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.interimResults = false;

      setIsListening(true);
      setError(null);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const parsed = parseTamilFarmerSpeech(transcript);
        onSmartFill(parsed);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();

    } catch (err) {
      setIsListening(false);
      setError("Mic error");
    }
  };

  if (!hasSupport) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={startListening}
        type="button"
        disabled={isListening}
        className={`
          relative group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 
          text-white font-black text-xl shadow-xl hover:shadow-emerald-200 hover:scale-[1.02] 
          transition-all duration-300 flex items-center justify-center gap-3 active:scale-95
          ${isListening ? 'animate-pulse ring-4 ring-emerald-200' : ''}
        `}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-widest border-2 border-white">
          Magic ✨
        </div>

        {isListening ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
            🎙️ Listening Tamil...
          </div>
        ) : (
          <>
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            🤖 AI Tamil Voice
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-bold animate-bounce">
          <AlertCircle size={14} /> Allow mic to use voice fill!
        </div>
      )}
    </div>
  );
};

export default VoiceInput;

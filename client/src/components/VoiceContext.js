import React, { createContext, useContext, useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-US'); // Fallback to EN, but UI will prioritize Tamil/Hindi
    const [aiMessage, setAiMessage] = useState("Vanakam! How can I help you today?");

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        setIsListening(listening);
    }, [listening]);

    const toggleListening = () => {
        if (isListening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({
                continuous: true,
                language,
                interimResults: true
            });
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
        setAiMessage(text);
    };

    return (
        <VoiceContext.Provider value={{
            transcript,
            isListening,
            toggleListening,
            resetTranscript,
            language,
            setLanguage,
            aiMessage,
            setAiMessage,
            speak,
            browserSupportsSpeechRecognition
        }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoice = () => useContext(VoiceContext);

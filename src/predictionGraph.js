import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/chatbot.css';

// Web Speech API (SpeechRecognition) Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: 'こんにちは！ご用件は何でしょうか？', sender: 'bot' },
    ]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('ja-JP'); 
    const [isBotAnswerReady, setIsBotAnswerReady] = useState(false); 
    const [isVoiceInput, setIsVoiceInput] = useState(false); 

    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language; 
    }

    const detectLanguage = async (text) => {
        try {
            const response = await axios.post(
                'https://ws.detectlanguage.com/0.2/detect',
                {
                    q: text,
                    key: '35d97116ca0c6ab68cc3ec0c168ec098' 
                }
            );
            const detectedLanguage = response.data.data.detections[0].language;
            return detectedLanguage;
        } catch (error) {
            console.error("Language detection error:", error);
            return 'en'; 
        }
    };

    useEffect(() => {
        if (recognition) {
            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;

                const detectedLanguage = await detectLanguage(transcript);
                if (detectedLanguage) {
                    setLanguage(detectedLanguage); 
                    recognition.lang = detectedLanguage; 
                }

                setQuestion(transcript); 
                setIsListening(false);
                setIsVoiceInput(true); 
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        }
    }, [recognition, language]); 

    const startListening = () => {
        if (recognition) {
            setIsListening(true);
            recognition.start(); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            setError('質問書いてください。!');
            return;
        }

        const userMessage = { text: question, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setLoading(true);
        setError('');
        setQuestion('');
        setIsVoiceInput(false); 

        try {
            const response = await axios.post(
                'https://xh6cftzd0b.execute-api.ap-northeast-1.amazonaws.com/test/askforClaude',
                { question },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 100000, 
                }
            );

            const botResponse = response.data.response?.map(item => item.text).join(' ') || 'No answer found.';
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: botResponse, sender: 'bot' },
            ]);

            if (isVoiceInput) {
                speak(botResponse); 
            } else {
                setIsBotAnswerReady(true); 
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Text-to-Speech function using the SpeechSynthesis API
    const speak = (text) => {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP'; // Force Japanese language to be used
            window.speechSynthesis.speak(utterance); // Speak the text
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        {msg.sender === 'bot' ? (
                            <div className="avatar">🤖</div>
                        ) : (
                            <div className="avatar">👤</div>
                        )}
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="chat-input-container">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question..."
                    className="chat-input"
                />
                <button type="submit" disabled={loading} className="chat-submit-button">
                    {loading ? '...' : '📩'}
                </button>

                <button
                    type="button"
                    onClick={startListening}
                    disabled={loading || isListening}
                    className="chat-mic-button"
                >
                    <img src="/img/microphone.png" alt="microphone" />
                </button>

            </form>

            {isBotAnswerReady && !isVoiceInput && (
                <button
                    type="button"
                    onClick={() => speak(messages[messages.length - 1].text)}
                    className="chat-sound-button"
                >
                    🔊 Read Answer
                </button>
            )}

            {error && <p className="chat-error">{error}</p>}
        </div>
    );
};

export default ChatBot;

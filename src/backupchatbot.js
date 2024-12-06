import React, { useState } from 'react';
import axios from 'axios';
import './css/chatbot.css';

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: 'こんにちは！ご用件は何でしょうか？', sender: 'bot' },
    ]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            setError('Please enter a question!');
            return;
        }

        const userMessage = { text: question, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setLoading(true);
        setError('');
        setQuestion('');

        try {
            const response = await axios.post(
                'https://xh6cftzd0b.execute-api.ap-northeast-1.amazonaws.com/test/askforClaude',
                { question },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 100000,  // Timeout after 10 seconds
                }
            );

            // Extracting the text from Claude's response
            const botResponse = response.data.response?.map(item => item.text).join(' ') || 'No answer found.';
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: botResponse, sender: 'bot' },
            ]);
        } catch (err) {
            console.error('Error:', err);
            if (err.response) {
                setError('API error: Something went wrong with the server.');
            } else if (err.request) {
                setError('Network error: Could not reach the server.');
            } else {
                setError('Unexpected error occurred.');
            }
        } finally {
            setLoading(false);
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
                <button type="submit" disabled={loading} className="chat-submit-button">
                    {loading ? '...' : 'microphone'}
                </button>
            </form>
            

            {error && <p className="chat-error">{error}</p>}
        </div>
    );
};

export default ChatBot;

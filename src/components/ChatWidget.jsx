import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function ChatWidget() {
    const initialMessage = { id: 1, text: "Hello! How can I help you today?", sender: 'ai' };
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        initialMessage
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        const newUserMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');

        // Show typing indicator
        const typingId = Date.now() + 1;
        setMessages(prev => [...prev, { id: typingId, text: "...", sender: 'ai', isTyping: true }]);
        
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newUserMsg.text, history: messages })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            setMessages(prev => {
                const updated = prev.filter(m => m.id !== typingId);
                return [...updated, { id: Date.now() + 2, text: data.response || "Sorry, I am having trouble forming a response right now.", sender: 'ai' }];
            });
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => {
                const updated = prev.filter(m => m.id !== typingId);
                return [...updated, { id: Date.now() + 2, text: "I'm offline right now or experiencing connection issues. Please try again later.", sender: 'ai' }];
            });
        }
    };

    const clearChat = () => {
        setMessages([{ ...initialMessage, id: Date.now() }]);
        setInputText('');
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn"
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer'
                    }}
                    title="Chat with AI"
                >
                    <MessageSquare size={28} color="white" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="card animate-fade-in" style={{
                    width: '350px', height: '500px', display: 'flex', flexDirection: 'column',
                    margin: 0, padding: 0, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'var(--primary-color)', color: 'white', padding: '1rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={20} />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Wellness AI</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={clearChat}
                                style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', cursor: 'pointer', borderRadius: '999px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                                Clear Chat
                            </button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9fafb' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? 'var(--primary-color)' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#111827',
                                padding: '10px 14px',
                                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                maxWidth: '80%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                fontSize: '0.95rem',
                                border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '1rem', borderTop: '1px solid #e5e7eb', background: 'white',
                        display: 'flex', gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="input-field"
                            style={{ flex: 1, margin: 0, borderRadius: '20px', padding: '10px 16px' }}
                        />
                        <button type="submit" style={{
                            background: 'var(--primary-color)', color: 'white', border: 'none',
                            borderRadius: '50%', width: '42px', height: '42px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            flexShrink: 0
                        }}>
                            <Send size={18} style={{ marginLeft: '-2px' }} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

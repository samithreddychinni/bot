
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getChatResponse } from '../services/geminiService';

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-accent text-primary rounded-lg py-2 px-4 max-w-sm">
            {text}
        </div>
    </div>
);

const BotMessage: React.FC<{ text: string, isTyping?: boolean }> = ({ text, isTyping }) => (
    <div className="flex justify-start mb-4">
        <div className="bg-secondary text-text-primary rounded-lg py-2 px-4 max-w-sm">
            {isTyping ? <div className="typing-indicator"><span></span><span></span><span></span></div> : text}
        </div>
        <style>{`
            .typing-indicator span {
                height: 8px;
                width: 8px;
                background-color: #A6ADC8;
                border-radius: 50%;
                display: inline-block;
                animation: bob 2s infinite ease-in-out;
            }
            .typing-indicator span:nth-of-type(1) { animation-delay: -0.4s; }
            .typing-indicator span:nth-of-type(2) { animation-delay: -0.2s; }
            @keyframes bob {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
        `}</style>
    </div>
);

export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'bot', timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        const botResponseText = await getChatResponse(updatedMessages);
        
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            sender: 'bot',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full p-4 bg-primary">
            <h1 className="text-3xl font-bold mb-4 px-4">Chat with your Assistant</h1>
            <div className="flex-grow overflow-y-auto p-4 bg-secondary/30 rounded-lg">
                {messages.map(msg => (
                    msg.sender === 'user' ? <UserMessage key={msg.id} text={msg.text} /> : <BotMessage key={msg.id} text={msg.text} />
                ))}
                {isLoading && <BotMessage text="" isTyping={true} />}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-grow p-3 bg-secondary border border-secondary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="ml-3 px-6 py-3 font-semibold text-primary bg-accent rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

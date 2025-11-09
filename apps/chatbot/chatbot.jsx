import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Replace with your n8n webhook URL
      const webhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/your-webhook-path';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.response || data.message || 'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/20"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[600px] rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl bg-white/10 border border-white/20 animate-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/80 to-blue-600/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AlertX Support</h3>
                <p className="text-white/70 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-white/5 via-transparent to-white/5">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20">
                    <MessageCircle size={24} className="text-blue-600" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Start a conversation</p>
                  <p className="text-gray-400 text-xs mt-1">Ask me anything about AlertX</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-cyan-500/80 to-blue-600/80 text-white border border-white/20 rounded-br-none'
                      : 'bg-white/15 text-gray-900 border border-white/20 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className={`text-xs mt-1 block ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-600'}`}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/15 text-gray-900 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-gradient-to-t from-white/10 to-transparent backdrop-blur-md p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-all flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
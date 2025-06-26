import React, { useState, useEffect, useRef } from 'react';
import { getChatbotResponse } from '../../services/geminiService';
import { addChatToHistory, getChatHistory } from '../../services/historyService';
import './AIDoctorPage.css';

const AIDoctorPage = ({ diagnosedCondition }) => {
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Load chat history on initial render
  useEffect(() => {
    const savedHistory = getChatHistory(diagnosedCondition);
    if (savedHistory.length > 0) {
        setHistory(savedHistory);
    } else {
        const initialMessage = `Hello! I'm the DermaScan AI assistant. I see you were diagnosed with **${diagnosedCondition}**. How can I help you understand more about this condition? Remember, I am an AI and cannot provide official medical advice.`;
        setHistory([{ role: 'assistant', text: initialMessage }]);
    }
  }, [diagnosedCondition]);

  // Save chat history whenever it's updated
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Only save if there's more than the initial system message
    if (history.length > 1) {
        addChatToHistory(diagnosedCondition, history);
    }
  }, [history, diagnosedCondition]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: 'user', text: userInput };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setUserInput('');
    setIsLoading(true);

    const botResponseText = await getChatbotResponse(newHistory, userInput);
    const botMessage = { role: 'assistant', text: botResponseText };

    setHistory(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="ai-doctor-container">
      <h1 className="stunning-title chatbot-title">DermaScan AI Chat</h1>
      <div className="chat-window">
        <div className="chat-history">
          {history.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your condition..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDoctorPage;

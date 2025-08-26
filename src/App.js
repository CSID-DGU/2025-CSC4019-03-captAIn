import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

function App() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 동대문구 교육정보를 찾아드릴게요!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [didimiEmotion, setDidimiEmotion] = useState('default');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const displayText = part.includes('ddm.go.kr') ? '🔗 동대문구청 바로가기' : '🔗 바로가기';
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="link-button">
            {displayText}
          </a>
        );
      }
      return part;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = inputText;
    setInputText('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    setLoading(true);
    setDidimiEmotion('thinking');
    setMessages(prev => [...prev, { type: 'bot', text: '답변을 찾고 있어요...' }]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await response.json();
      
      setDidimiEmotion(data.answer ? 'found' : 'sorry');
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          type: 'bot',
          text: data.answer || '답변을 찾을 수 없었어요.',
          hasLinks: data.answer?.includes('http')
        };
        return newMessages;
      });

      setTimeout(() => setDidimiEmotion('default'), 3000);
    } catch (error) {
      setDidimiEmotion('sorry');
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          type: 'bot',
          text: '오류가 발생했어요. 다시 시도해주세요.'
        };
        return newMessages;
      });
      setTimeout(() => setDidimiEmotion('default'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getDidimi = (emotion) => {
    const imageMap = {
      'default': '/images/didimi-default.png',
      'thinking': '/images/didimi-thinking.png',
      'found': '/images/didimi-found.png',
      'sorry': '/images/didimi-sorry.png'
    };
    return imageMap[emotion] || imageMap['default'];
  };

  return (
  <div className="App">
    <header className="app-header">
      <div className="header-left">
        <img 
          src={getDidimi(didimiEmotion)} 
          alt="디디미" 
          className="didimi-header"
        />
        <div>
          <h1>동문서답</h1>
          <p>동대문구 교육정보 AI 도우미</p>
        </div>
      </div>
    </header>

    <div className="chat-container">
      <div className="messages">
        {messages.length === 1 && (
          <div className="empty-state">
            <img src="/images/didimi-default.png" alt="디디미" />
            <p>무엇을 도와드릴까요?</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-bubble">
              {msg.hasLinks ? extractLinks(msg.text) : msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="질문을 입력하세요... (예: 독서실 추천)"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳' : '전송'}
        </button>
      </form>
    </div>
  </div>
);
}

export default App;
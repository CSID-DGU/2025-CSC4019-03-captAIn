import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [didimiEmotion, setDidimiEmotion] = useState('default');
  const [showTyping, setShowTyping] = useState(false);
  const chatEndRef = useRef(null);
  const emotionTimeoutRef = useRef(null);  // setTimeout 관리용 ref 추가

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      type: 'bot',
      text: '안녕하세요! 저는 동대문구 교육정보 AI 도우미 디디미입니다!\n\n무엇을 도와드릴까요?'
    }]);
  }, []);

  // 디디미 감정 변경 함수
  const changeDidimiEmotion = (emotion, duration = null) => {
    // 기존 타이머 취소
    if (emotionTimeoutRef.current) {
      clearTimeout(emotionTimeoutRef.current);
      emotionTimeoutRef.current = null;
    }
    
    setDidimiEmotion(emotion);
    
    // duration이 있으면 그 시간 후 default로 복귀
    if (duration) {
      emotionTimeoutRef.current = setTimeout(() => {
        setDidimiEmotion('default');
        emotionTimeoutRef.current = null;
      }, duration);
    }
  };

  const extractLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    
    const lines = text.split('\n');
    const result = [];
    
    lines.forEach((line, lineIndex) => {
      const matches = line.match(urlRegex);
      
      if (matches) {
        let lastIndex = 0;
        matches.forEach(url => {
          const urlIndex = line.indexOf(url, lastIndex);
          
          if (urlIndex > lastIndex) {
            result.push(<span key={`${lineIndex}-pre-${urlIndex}`}>{line.substring(lastIndex, urlIndex)}</span>);
          }
          
          const cleanUrl = url.replace(/[)\]}>]$/, '').replace(/%[A-F0-9]{2}/g, '');
          
          let displayText = '🔗 바로가기';
          if (cleanUrl.includes('ddm.go.kr')) {
            displayText = '🔗 동대문구청 바로가기';
          } else if (cleanUrl.includes('.hs.kr') || cleanUrl.includes('.ms.kr')) {
            displayText = '🏫 학교 홈페이지';
          }
          
          result.push(
            <a key={`${lineIndex}-url-${urlIndex}`} 
               href={cleanUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="link-button">
              {displayText}
            </a>
          );
          
          lastIndex = urlIndex + url.length;
        });
        
        if (lastIndex < line.length) {
          const remainingText = line.substring(lastIndex).replace(/%[A-F0-9]{2}/g, '');
          result.push(<span key={`${lineIndex}-post`}>{remainingText}</span>);
        }
      } else {
        result.push(<span key={lineIndex}>{line}</span>);
      }
      
      if (lineIndex < lines.length - 1) {
        result.push(<br key={`br-${lineIndex}`} />);
      }
    });
    
    return result;
  };

  const handleQuickAction = (action) => {
    if (!loading) {
      handleSubmit(null, action);
    }
  };

  const handleSubmit = async (e, quickMessage = null) => {
    if (e) e.preventDefault();
    const messageToSend = quickMessage || inputText.trim();
    
    if (!messageToSend || loading) return;

    // 연속 요청 방지
    const now = Date.now();
    const lastRequestTime = window.lastRequestTime || 0;
    if (now - lastRequestTime < 1000) {
      console.log("Too fast! Please wait a moment.");
      return;
    }
    window.lastRequestTime = now;

    if (!quickMessage) {
      setInputText('');
    }
    
    setMessages(prev => [...prev, { type: 'user', text: messageToSend }]);
    
    setLoading(true);
    setShowTyping(true);
    changeDidimiEmotion('thinking');  // 타이머 관리되는 함수 사용

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend })
      });

      const data = await response.json();

      console.log('Response data:', data);
      console.log('Success field:', data.success);
      
      setShowTyping(false);
      changeDidimiEmotion(data.success ? 'happy' : 'sorry', 3000);  // 3초 후 default로
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.answer || '죄송해요, 답변을 찾을 수 없었어요. 다른 질문을 해주세요! 😅',
        hasLinks: data.answer?.includes('http')
      }]);

    } catch (error) {
      setShowTyping(false);
      changeDidimiEmotion('sorry', 3000);  // 3초 후 default로
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '오류가 발생했어요. 잠시 후 다시 시도해주세요! 🙏'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getDidimi = (emotion) => {
    const imageMap = {
      'default': '/images/didimi-default.png',
      'thinking': '/images/didimi-thinking.png',
      'happy': '/images/didimi-found.png',
      'sorry': '/images/didimi-sorry.png'
    };
    return imageMap[emotion] || imageMap['default'];
  };

  const TypingIndicator = () => (
    <div className="message bot">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (emotionTimeoutRef.current) {
        clearTimeout(emotionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <div style={{ position: 'relative' }}>
            <img 
              src={getDidimi(didimiEmotion)} 
              alt="디디미" 
              className="didimi-header"
            />
            <div className="status-indicator"></div>
          </div>
          <div>
            <h1>동문서답</h1>
            <p>동대문구 교육정보 AI 도우미</p>
          </div>
        </div>
      </header>

      <div className="quick-actions">
        <button 
          className="quick-action-btn" 
          onClick={() => handleQuickAction('독서실 추천')}
        >
          📖 독서실
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => handleQuickAction('동대문구 여고 목록')}
        >
          🏫 학교 정보
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => handleQuickAction('청소년 상담 프로그램')}
        >
          💬 상담 지원
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => handleQuickAction('학습 코칭 신청')}
        >
          📚 학습 지원
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => handleQuickAction('방과후 프로그램')}
        >
          🎨 방과후
        </button>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-bubble">
                {msg.hasLinks ? extractLinks(msg.text) : msg.text}
              </div>
            </div>
          ))}
          
          {showTyping && <TypingIndicator />}
          
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="메시지를 입력하세요..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
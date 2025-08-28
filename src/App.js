import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// 웹사이트 주소 같은 중요한 정보는 따로 모아두는 곳이에요.
const API_URL = process.env.REACT_APP_API_ENDPOINT;

// 디디미의 표정을 바꾸기 위해 사진들을 모아두는 곳이에요.
// default: 평소 모습, thinking: 생각하는 모습, happy: 기쁜 모습, sorry: 미안한 모습
const DIDIMI_IMAGES = {
  default: '/images/didimi-default.png',
  thinking: '/images/didimi-thinking.png',
  happy: '/images/didimi-found.png',
  sorry: '/images/didimi-sorry.png'
};

function App() {
  // 🎇 스플래시 화면을 보여줄지 말지 결정하는 마법 주머니 (새로 추가)
  const [showSplash, setShowSplash] = useState(true);

  // 🎈 useState는 '상태'를 기억하는 마법 주머니예요.
  // 메시지들을 담아둘 마법 주머니
  const [messages, setMessages] = useState([
    {
      type: 'bot', // 봇이 보낸 메시지
      text: '안녕하세요! 저는 동대문구 교육정보 AI 도우미 디디미입니다!\n\n무엇을 도와드릴까요?' // 메시지 내용
    }
  ]);
  // 내가 입력하는 글자를 담아둘 마법 주머니
  const [inputText, setInputText] = useState('');
  // 봇이 생각 중인지 아닌지를 알려주는 마법 주머니
  const [loading, setLoading] = useState(false);
  // 디디미의 표정을 담아둘 마법 주머니
  const [didimiEmotion, setDidimiEmotion] = useState('default');
  // 봇이 '...'를 보여줄지 말지를 알려주는 마법 주머니
  const [showTyping, setShowTyping] = useState(false);
  
  // 🏷️ useRef는 특별한 '이름표'예요.
  // 메시지 창의 맨 아래를 가리키는 이름표
  const chatEndRef = useRef(null);
  // 메시지들이 보이는 창을 가리키는 이름표
  const messagesRef = useRef(null);

  // 🪄 useEffect: 컴포넌트가 처음 나타날 때 스플래시 화면 타이머를 설정해요. (새로 추가)
  useEffect(() => {
    // 1.0초(1000밀리초) 후에 스플래시 화면을 숨겨요.
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1970); // 👈 여기서 1000밀리초(1.0초)로 로고 표시 시간을 조정해요.

    // 컴포넌트가 사라질 때 타이머를 정리해서 메모리 누수를 방지해요.
    return () => clearTimeout(timer);
  }, []); // 빈 배열을 넣어 컴포넌트가 처음 마운트될 때만 실행되도록 해요.


  // 📜 메시지가 새로 오면 자동으로 맨 아래로 내려가게 하는 함수예요.
  const scrollToBottom = () => {
    // chatEndRef 이름표가 가리키는 곳으로 부드럽게 스크롤해요.
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 🪄 useEffect는 메시지가 바뀔 때마다 자동으로 실행되는 마법이에요.
  useEffect(() => {
    scrollToBottom(); // 메시지가 바뀔 때마다 스크롤 함수를 불러요.
  }, [messages]); // messages 마법 주머니가 변할 때마다 이 마법이 실행돼요.

  // 🔗 글자 속에서 인터넷 주소(링크)를 찾아 예쁜 버튼으로 바꿔주는 함수예요.
  const extractLinks = (text) => {
    // 인터넷 주소를 찾는 규칙이에요.
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    // 글자를 한 줄씩 잘라요.
    const lines = text.split('\n');
    const result = [];
    
    lines.forEach((line, lineIndex) => {
      // 규칙에 맞는 주소를 찾아요.
      const matches = line.match(urlRegex);
      
      if (matches) {
        let lastIndex = 0;
        matches.forEach(url => {
          const urlIndex = line.indexOf(url, lastIndex);
          if (urlIndex > lastIndex) {
            // 주소 앞에 있는 글자들을 추가해요.
            result.push(<span key={`${lineIndex}-pre-${urlIndex}`}>{line.substring(lastIndex, urlIndex)}</span>);
          }
          // 주소에서 불필요한 기호를 없애요.
          const cleanUrl = url.replace(/[)\]}>]$/, '').replace(/%[A-F0-9]{2}/g, '');
          let displayText = '🔗 바로가기'; // 기본 버튼 이름
          
          // 주소에 따라 버튼 이름을 다르게 해요.
          if (cleanUrl.includes('ddm.go.kr')) {
            displayText = '🔗 동대문구청 바로가기';
          } else if (cleanUrl.includes('.hs.kr') || cleanUrl.includes('.ms.kr')) {
            displayText = '🏫 학교 홈페이지';
          }
          // 주소를 버튼으로 만들어요.
          result.push(
            <a key={`${lineIndex}-url-${urlIndex}`} 
               href={cleanUrl} 
               target="_blank" // 새 탭에서 열기
               rel="noopener noreferrer" 
               className="link-button">
              {displayText}
            </a>
          );
          lastIndex = urlIndex + url.length;
        });
        if (lastIndex < line.length) {
          // 주소 뒤에 남은 글자들을 추가해요.
          const remainingText = line.substring(lastIndex).replace(/%[A-F0-9]{2}/g, '');
          result.push(<span key={`${lineIndex}-post`}>{remainingText}</span>);
        }
      } else {
        // 주소가 없으면 그냥 글자만 추가해요.
        result.push(<span key={lineIndex}>{line}</span>);
      }
      if (lineIndex < lines.length - 1) {
        // 줄바꿈을 추가해요.
        result.push(<br key={`br-${lineIndex}`} />);
      }
    });
    
    return result;
  };

  // 🚀 빠른 실행 버튼을 눌렀을 때 실행되는 함수예요.
  const handleQuickAction = (action) => {
    if (!loading) { // 봇이 바쁘지 않을 때만 실행해요.
      handleSubmit(null, action);
    }
  };

  // 📩 메시지를 보내는 함수예요.
  const handleSubmit = async (e, quickMessage = null) => {
    if (e) e.preventDefault(); // 웹 페이지가 새로고침되는 것을 막아요.
    const messageToSend = quickMessage || inputText.trim(); // 보낼 메시지를 정해요.
    
    if (!messageToSend || loading) return; // 메시지가 없거나 봇이 바쁘면 아무것도 안 해요.

    if (!quickMessage) {
      setInputText(''); // 입력창을 비워요.
    }
    
    setMessages(prev => [...prev, { type: 'user', text: messageToSend }]); // 내가 보낸 메시지를 목록에 추가해요.
    
    setLoading(true); // 봇이 바빠졌다고 표시해요.
    setShowTyping(true); // '...'를 보여줘요.
    setDidimiEmotion('thinking'); // 디디미 표정을 생각하는 모습으로 바꿔요.

    try {
      // 봇에게 메시지를 보내고 답장을 기다려요.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend })
      });

      const data = await response.json(); // 봇의 답장을 받아와요.
      
      setShowTyping(false); // '...'를 숨겨요.
      setDidimiEmotion(data.success ? 'happy' : 'sorry'); // 답장을 성공하면 기쁜 표정, 실패하면 미안한 표정으로 바꿔요.
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.answer || '죄송해요, 답변을 찾을 수 없었어요. 다른 질문을 해주세요! 😅', // 봇의 답장을 목록에 추가해요.
        hasLinks: data.answer?.includes('http')
      }]);

      setTimeout(() => setDidimiEmotion('default'), 3000); // 3초 뒤에 원래 표정으로 돌아와요.
    } catch (error) { // 만약 문제가 생기면
      setShowTyping(false); // '...'를 숨겨요.
      setDidimiEmotion('sorry'); // 미안한 표정으로 바꿔요.
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '오류가 발생했어요. 잠시 후 다시 시도해주세요! 🙏' // 오류 메시지를 보내요.
      }]);
      
      setTimeout(() => setDidimiEmotion('default'), 3000); // 3초 뒤에 원래 표정으로 돌아와요.
    } finally {
      setLoading(false); // 봇이 다시 한가해졌다고 표시해요.
    }
  };

  // 🖼️ 디디미의 표정에 맞는 사진 주소를 찾아주는 함수예요.
  const getDidimi = (emotion) => {
    return DIDIMI_IMAGES[emotion] || DIDIMI_IMAGES.default;
  };

  // 👀 타이핑 표시기 (...)를 만드는 컴포넌트예요.
  const TypingIndicator = () => (
    <div className="message bot">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );

  // 🎇 스플래시 화면 렌더링 (새로 추가)
  if (showSplash) {
    return (
      <div className="splash-screen"> {/* CSS에서 splash-screen 스타일을 정의해야 합니다. */}
        <img 
          src={DIDIMI_IMAGES.default} // didimi-default.png 로고를 보여줘요.
          alt="디디미 로고" 
          className="splash-logo" 
        />
      </div>
    );
  }

  // 🤖 실제 챗봇 UI 렌더링
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <div style={{ position: 'relative' }}>
            <img 
              src={getDidimi(didimiEmotion)} // 디디미 표정 사진을 보여줘요.
              alt="디디미" 
              className="didimi-header"
            />
            <div className="status-indicator"></div> {/* 초록색 동그라미 */}
          </div>
          <div>
            <h1>동문서답</h1>
            <p>동대문구 교육정보 AI 도우미</p>
          </div>
        </div>
      </header>

      {/* 🚀 빠른 실행 버튼 영역 */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => handleQuickAction('독서실 추천')}>
          📖 독서실
        </button>
        <button className="quick-action-btn" onClick={() => handleQuickAction('동대문구 여고 목록')}>
          🏫 학교 정보
        </button>
        <button className="quick-action-btn" onClick={() => handleQuickAction('청소년 상담 프로그램')}>
          💬 상담 지원
        </button>
        <button className="quick-action-btn" onClick={() => handleQuickAction('학습 코칭 신청')}>
          📚 학습 지원
        </button>
        <button className="quick-action-btn" onClick={() => handleQuickAction('방과후 프로그램')}>
          🎨 방과후
        </button>
      </div>

      <div className="chat-container">
        <div className="messages" ref={messagesRef}>
          {/* 메시지들을 하나씩 꺼내서 보여줘요 */}
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-bubble">
                {msg.hasLinks ? extractLinks(msg.text) : msg.text}
              </div>
            </div>
          ))}
          
          {showTyping && <TypingIndicator />} {/* 봇이 생각 중일 때만 (...)를 보여줘요 */}
          
          <div ref={chatEndRef} /> {/* 메시지 창의 맨 아래를 표시하는 곳 */}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="메시지를 입력하세요..."
              disabled={loading} // 봇이 바쁠 때는 글자를 쓸 수 없게 해요
            />
            <button type="submit" disabled={loading}>
              {loading ? '⏳' : '➤'} {/* 봇이 바쁠 때는 모래시계, 아닐 때는 화살표를 보여줘요 */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
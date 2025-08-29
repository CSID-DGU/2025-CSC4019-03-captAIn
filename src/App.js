import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// API 엔드포인트
const API_URL = process.env.REACT_APP_API_ENDPOINT || "YOUR_API_GATEWAY_URL";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✨ [추가됨] 문의 모달을 위한 상태
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e, predefinedQuestion = null) => {
    if (e) e.preventDefault();
    const messageToSend = predefinedQuestion || inputText.trim();
    if (!messageToSend || loading) return;

    setInputText("");

    const newUserMessage = { type: "user", text: messageToSend };
    const typingMessage = { type: "bot", typing: true };
    setMessages((prev) => [...prev, newUserMessage, typingMessage]);

    setLoading(true);

    try {
      // 실제 API 호출
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageToSend }),
      });

      const data = await response.json();

      const newBotMessage = {
        type: "bot",
        text:
          data.answer ||
          "죄송해요, 답변을 찾을 수 없었어요. 다른 질문을 해주세요!",
      };

      setMessages((prev) => prev.slice(0, -1).concat(newBotMessage));
    } catch (error) {
      const errorMessage = {
        type: "bot",
        text: "오류가 발생했어요. 잠시 후 다시 시도해주세요!",
      };
      setMessages((prev) => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    if (!text.match(urlRegex)) {
      return text;
    }

    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const cleanUrl = part.replace(/[)\]}>]$/, "");
        let displayText = "🔗 바로가기";

        if (cleanUrl.includes("ddm.go.kr")) {
          displayText = "🔗 동대문구청 바로가기";
        } else if (cleanUrl.includes(".hs.kr") || cleanUrl.includes(".ms.kr")) {
          displayText = "🏫 학교 홈페이지";
        }

        return (
          <a
            key={index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-button"
          >
            {displayText}
          </a>
        );
      }
      return part;
    });
  };

  // ✨ [추가됨] 문의 모달 관련 함수
  const toggleContactModal = () => {
    setIsContactModalOpen(!isContactModalOpen);
  };

  const handleConnectAgent = () => {
    toggleContactModal();
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: "상담원 연결을 준비 중입니다. 잠시만 기다려주세요.\n(현재는 데모 기능입니다.)",
      },
    ]);
  };

  // ✨ [추가됨] 문의하기 모달 컴포넌트
  const ContactModal = () => (
    <div className="contact-modal-overlay" onClick={toggleContactModal}>
      <div
        className="contact-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-bot-icon">🤖</div>
          <h3>DD-ON에 문의하기</h3>
          <button className="modal-close-btn" onClick={toggleContactModal}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            <strong>🚀 실시간 상담 안내</strong>
          </p>
          <p>전문 상담원과 연결하여 더 자세한 안내를 받으실 수 있습니다.</p>
          <ul>
            <li>
              <strong>운영시간:</strong> 평일 09:00 ~ 18:00
            </li>
            <li>
              <strong>점심시간:</strong> 12:00 ~ 13:00
            </li>
            <li>(주말 및 공휴일 휴무)</li>
          </ul>
        </div>
        <div className="modal-footer">
          <button className="modal-action-btn" onClick={handleConnectAgent}>
            상담원 연결하기
          </button>
        </div>
      </div>
    </div>
  );

  const isChatStarted = messages.length > 0;

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-text" onClick={() => setMessages([])} style={{ cursor: "pointer" }}> DD-ON  </span>
        </div>
        <div className="header-right">
          <a href="#" className="nav-link">
            내사이트
          </a>
          <div className="profile-icon" />
        </div>
      </header>

      <main
        className="main-content"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          paddingTop: "20px",
          overflowY: "auto",
        }}
      >
        {isChatStarted ? (
    <div
      className="chat-container"
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundImage: 'url("/images/didimi-basic.png")', // 채팅 시작 시 배경
        backgroundSize: "50%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.typing ? (
              <div className="typing-indicator">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              <div className="message-bubble">
                {renderMessageContent(msg.text)}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  ) : (
          <div className="landing-container">
            <img
              src="/images/didimi-default.png"
              alt="디디온 로고"
              className="landing-logo"
            />
            <div className="text-container">
              <p className="subtitle">꿈꾸던 모든 것, 디디온과 함께</p>
              <h1 className="title">디디온에게 물어보세요</h1>
            </div>
            <div className="quick-start-buttons">
              <button
                onClick={() => handleSubmit(null, "독서실 추천")}
                className="quick-start-btn"
              >
                #독서실
              </button>
              <button
                onClick={() => handleSubmit(null, "동대문구 고등학교 목록")}
                className="quick-start-btn"
              >
                #학교 정보
              </button>
              <button
                onClick={() => handleSubmit(null, "청소년 상담 프로그램")}
                className="quick-start-btn"
              >
                #상담지원
              </button>
              <button
                onClick={() => handleSubmit(null, "학습 코칭 신청")}
                className="quick-start-btn"
              >
                #학습지원
              </button>
              <button
                onClick={() => handleSubmit(null, "방과후 뭐있어?")}
                className="quick-start-btn"
              >
                #방과후
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`input-form-wrapper ${
            isChatStarted ? "chat-mode" : "landing-mode"
          }`}
        >
          <div className="input-form-container">
            {!isChatStarted && (
              <div className="form-header">
                <span className="ai-badge">
                  DD-ON <span className="beta-tag">beta</span>
                </span>
              </div>
            )}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                isChatStarted
                  ? "질문을 입력하세요..."
                  : "동대문구의 교육 정보, 진로 탐색 등 무엇이든 물어보세요!"
              }
              className="idea-textarea"
              rows={isChatStarted ? 1 : 1}
              disabled={loading}
            />
            <div className="form-footer">
              {!isChatStarted && (
                <span className="char-counter">{inputText.length} / 1000</span>
              )}
              <button
                type="submit"
                className="submit-button"
                disabled={loading || !inputText}
              >
                {loading ? <div className="spinner"></div> : "↑"}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* ✨ [수정됨] 버튼 이미지의 width, height 속성을 제거했습니다. */}
      <button className="fab-contact" onClick={toggleContactModal}>
        <img src="/images/ddon_ask.png" alt="문의하기" />
      </button>

      {isContactModalOpen && <ContactModal />}
    </div>
  );
}

export default App;

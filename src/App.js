import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// API 엔드포인트
const API_URL = process.env.REACT_APP_API_ENDPOINT || "YOUR_API_GATEWAY_URL";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
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

    const newUserMessage = {
      id: Date.now(),
      type: "user",
      text: messageToSend,
    };
    const typingMessage = { id: Date.now() + 1, type: "bot", typing: true };
    setMessages((prev) => [...prev, newUserMessage, typingMessage]);

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageToSend }),
      });
      const data = await response.json();
      const newBotMessage = {
        id: Date.now() + 2,
        type: "bot",
        text:
          data.answer ||
          "죄송해요, 답변을 찾을 수 없었어요. 다른 질문을 해주세요!",
        feedback: null,
      };
      setMessages((prev) => prev.slice(0, -1).concat(newBotMessage));
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        type: "bot",
        text: "오류가 발생했어요. 잠시 후 다시 시도해주세요!",
        feedback: null,
      };
      setMessages((prev) => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (id, feedbackType) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === id) {
          if (msg.feedback === feedbackType) {
            return { ...msg, feedback: null };
          }
          return { ...msg, feedback: feedbackType };
        }
        return msg;
      })
    );
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

  const toggleContactModal = () => {
    setIsContactModalOpen(!isContactModalOpen);
  };

  // '메시지 보내기' 모달 컴포넌트
  const ContactModal = ({ onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleMessageSubmit = (e) => {
      e.preventDefault();
      // 실제 앱에서는 이 데이터를 서버로 전송합니다.
      console.log("메시지 전송:", { name, email, message });
      // window.alert()는 이 환경에서 작동하지 않을 수 있으므로 alert 대신 console.log를 사용합니다.
      console.log("메시지가 성공적으로 전송되었습니다!");
      onClose(); // 모달 닫기
    };

    return (
      <div className="contact-modal-overlay" onClick={onClose}>
        <div
          className="contact-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>1:1 문의하기</h3>
            <button className="modal-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleMessageSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">이름</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="답변받으실 이메일을 입력해주세요"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">메시지</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="문의하실 내용을 자세히 적어주세요."
                  rows="5"
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="submit" className="modal-action-btn">
                  보내기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const isChatStarted = messages.length > 0;

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <span
            className="logo-text"
            onClick={() => setMessages([])}
            style={{ cursor: "pointer" }}
          >
            DD-ON
          </span>
        </div>
        <div className="header-right">
          <a href="#" className="nav-link">
          <img src="/images/user_icon.png"  className="profile-icon" />
          </a>     

        </div>
      </header>

      <main className="main-content">
        {isChatStarted ? (
          <div
            className="chat-container"
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundImage: 'url("/images/didimi-basic.png")',
              backgroundSize: "50%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  {msg.typing ? (
                    <div className="typing-indicator">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    <>
                      <div className="message-bubble">
                        {renderMessageContent(msg.text)}
                      </div>
                      {msg.type === "bot" && (
                        <div className="feedback-buttons">
                          <button
                            className={`feedback-btn ${
                              msg.feedback === "like" ? "selected" : ""
                            }`}
                            onClick={() => handleFeedback(msg.id, "like")}
                            title="도움돼요"
                          >
                            <img
                              src="/images/like-button.png"
                              alt="도움돼요"
                            />
                          </button>
                          <button
                            className={`feedback-btn ${
                              msg.feedback === "dislike" ? "selected" : ""
                            }`}
                            onClick={() => handleFeedback(msg.id, "dislike")}
                            title="도움 안돼요"
                          >
                            <img
                              src="/images/thumbs-down.png"
                              alt="도움 안돼요"
                            />
                          </button>
                        </div>
                      )}
                    </>
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

      <button className="fab-contact" onClick={toggleContactModal}>
        <img src="/images/ddon_ask.png" alt="문의하기" />
      </button>

      {isContactModalOpen && <ContactModal onClose={toggleContactModal} />}
    </div>
  );
}

export default App;

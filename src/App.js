import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// API 엔드포인트
const API_URL = process.env.REACT_APP_API_ENDPOINT || "YOUR_API_GATEWAY_URL";

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    // 3.2초 후 스플래시 화면을 숨깁니다.
    const timer = setTimeout(() => {
      onComplete();
    }, 3200); // 3.2초 (3200ms) 동안 표시
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <img
        src="/images/didimi-found.png"
        alt="디디온 파운드 로고"
        className="splash-logo"
      />
      {/* 🌟 추가된 문구 */}
      <h1 className="splash-title">DD-ON</h1>
      <p className="splash-description">AI Education Policy Searching System</p>
      <div className="loading-spinner"></div>
      <p className="splash-text">
        디디온이 여러분을 찾아가는 중입니다...
        <br />
        잠시만 기다려주세요!
      </p>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const chatEndRef = useRef(null);
  const [isUserBubbleOpen, setIsUserBubbleOpen] = useState(false);
  const toggleUserBubble = () => {
    setIsUserBubbleOpen(!isUserBubbleOpen);
  };

  // 말풍선 컴포넌트
  const UserBubble = () => {
    const [gender, setGender] = useState(""); // 남/여 상태 추가
    const [schoolLevel, setSchoolLevel] = useState(""); // '초','중','고'
    const [highDetail, setHighDetail] = useState(""); // '고' 선택 시 나타날 라디오 상태
    const [dong, setDong] = useState(""); // 선택한 동
    const dongs = [
      "장안1동",
      "장안2동",
      "답십리1동",
      "답십리2동",
      "이문1동",
      "이문2동",
      "휘경1동",
      "휘경2동",
      "회기동",
      "청량리동",
      "제기동",
      "용신동",
      "전농1동",
      "전농2동",
    ];
    const handleSubmit = () => {
      console.log("학교급:", schoolLevel, "선택 동:", dong);
      // 여기서 선택값을 서버로 보내거나 챗에 메시지로 추가 가능
    };

    return (
      <div className="user-bubble">
        <p>성별</p>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === "male"}
              onChange={(e) => setGender(e.target.value)}
            />
            남
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === "female"}
              onChange={(e) => setGender(e.target.value)}
            />
            여
          </label>
        </div>
        <p>학교</p>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="schoolLevel"
              value="초"
              checked={schoolLevel === "초"}
              onChange={(e) => setSchoolLevel(e.target.value)}
            />
            초등학생
          </label>
          <label>
            <input
              type="radio"
              name="schoolLevel"
              value="중"
              checked={schoolLevel === "중"}
              onChange={(e) => setSchoolLevel(e.target.value)}
            />
            중학생
          </label>
          <label>
            <input
              type="radio"
              name="schoolLevel"
              value="고"
              checked={schoolLevel === "고"}
              onChange={(e) => setSchoolLevel(e.target.value)}
            />
            고등학생
          </label>
        </div>

        {/* '고'를 선택했을 때만 새로운 라디오 버튼 그룹 */}
        {schoolLevel === "고" && (
          <>
            <div className="radio-group">
              <p>계열</p>
              <label>
                <input
                  type="radio"
                  name="highDetail"
                  value="일반"
                  checked={highDetail === "일반"}
                  onChange={(e) => setHighDetail(e.target.value)}
                />
                일반
              </label>
              <label>
                <input
                  type="radio"
                  name="highDetail"
                  value="예체능"
                  checked={highDetail === "예체능"}
                  onChange={(e) => setHighDetail(e.target.value)}
                />
                예체능
              </label>
              <label>
                <input
                  type="radio"
                  name="highDetail"
                  value="실업계"
                  checked={highDetail === "실업계"}
                  onChange={(e) => setHighDetail(e.target.value)}
                />
                실업계
              </label>
            </div>
          </>
        )}

        <p>거주 지역</p>
        <select
          value={dong}
          onChange={(e) => setDong(e.target.value)}
          className="dong-select"
        >
          <option value="">거주 동</option>
          {dongs.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div>
          <button
            onClick={() => {
              console.log("선택값:", schoolLevel, gender, dong);
              setIsUserBubbleOpen(false); // 말풍선 닫기
            }}
            className="submit-btn"
          >
            확인
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e, predefinedQuestion = null) => {
    if (e) e.preventDefault();
    const messageToSend = predefinedQuestion || inputText.trim();
    if (!messageToSend || loading) return;

    setInputText("");

    // ⭐ 여기에 질문-답변 쌍 추가
    const DEMO_RESPONSES = {
      "독서실 추천": `동대문구에서 운영하는 구립 청소년독서실을 추천드리겠습니다.

[동대문구 구립 청소년독서실 5곳]

1. 동대문청소년독서실 (158석)
   • 위치: 서울특별시 동대문구 장한로 191 (장안동) 근린공원 내
   • 연락처: 02-2247-3120
   • 홈페이지: https://cafe.daum.net/dc300

2. 답십리2청소년독서실 (146석)
   • 위치: 서울특별시 동대문구 답십리로56길 15 (답십리동)
   • 연락처: 02-2216-0148
   • 홈페이지: https://cafe.daum.net/DDMDSsocialwelfare

3. 전일청소년독서실 (88석)
   • 위치: 서울특별시 동대문구 전농로37길 17 (전농동)
   • 연락처: 02-2241-9836

4. 이문청소년독서실 (88석)
   • 위치: 서울특별시 동대문구 이문로9길 52 (이문동)
   • 연락처: 02-960-1902

5. 답십리청소년독서실 (72석)
   • 위치: 서울특별시 동대문구 천호대로65길 17 (답십리동)
   • 연락처: 02-2243-3648
   • 홈페이지: https://cafe.naver.com/dsn0310

[공통 이용 안내]
• 운영시간: 화~금 09:00-23:00, 토·공휴일 10:00-23:00 (월요일 휴관)
• 이용료: 1일 500원, 월 정기권 청소년 10,000원 / 일반 15,000원
• 신청방법: 현장 방문 접수 (신분증 지참)
• 이용대상: 중학생 이상 청소년 및 일반인

모든 독서실이 저렴한 이용료로 쾌적한 학습 환경을 제공하고 있으니, 거주지와 가까운 곳을 선택하시면 됩니다.

자세한 정보: https://www.ddm.go.kr/www/contents.do?key=673`,

      "동대문구 고등학교 목록": `동대문구에 위치한 고등학교 목록을 안내해드리겠습니다. 총 10개의 고등학교가 있습니다.

[일반고등학교]

1. 휘봉고등학교 (남녀공학, 공립)
   • 주소: 서울특별시 동대문구 한천로 290 (휘경동)
   • 전화: 02-2116-7211
   • 홈페이지: http://hwibong.sen.hs.kr

2. 해성여자고등학교 (여학교, 사립)
   • 주소: 서울특별시 동대문구 전농로20길 31 (전농동)
   • 전화: 070-7860-7100
   • 홈페이지: http://haesung-g.hs.kr

3. 휘경여자고등학교 (여학교, 사립)
   • 주소: 서울특별시 동대문구 한천로 247 (휘경동)
   • 전화: 02-2245-2307
   • 홈페이지: http://hwikyung.sen.hs.kr

4. 동국대학교사범대학부속고등학교 (남학교, 사립)
   • 주소: 서울특별시 동대문구 장안벚꽃로 201 (장안동)
   • 전화: 02-6913-1511
   • 홈페이지: http://ddbk.sen.hs.kr

5. 경희여자고등학교 (여학교, 사립)
   • 주소: 서울특별시 동대문구 경희대로 26
   • 전화: 02-966-4560
   • 홈페이지: http://kyunghee.sen.hs.kr

[자율고등학교]

6. 대광고등학교 (남학교, 사립)
   • 주소: 서울특별시 동대문구 안암로 6 (신설동)
   • 전화: 02-940-2202
   • 홈페이지: http://www.dgh.hs.kr

7. 경희고등학교 (남학교, 사립)
   • 주소: 서울특별시 동대문구 경희대로 26 (회기동)
   • 전화: 02-966-3782
   • 홈페이지: http://www.kyungheeboy.hs.kr/

[특성화고등학교]

8. 서울반도체고등학교 (남녀공학, 공립)
   • 주소: 서울특별시 동대문구 겸재로 21 (휘경동)
   • 전화: 02-2230-9885
   • 홈페이지: https://ssc.sen.hs.kr/
   • 특징: 전자기계, 메카트로닉스, 자동차 등 공업계열 학과

9. 서울정화고등학교 (여학교, 사립)
   • 주소: 서울특별시 동대문구 홍릉로15길 50 (제기동)
   • 전화: 02-960-1495
   • 홈페이지: http://jeonghwa.sen.hs.kr
   • 특징: 방송연예, 뷰티디자인, 카페베이커리 등 상업계열 학과

10. 해성국제컨벤션고등학교 (여학교, 사립)
    • 주소: 서울특별시 동대문구 전농로20길 31 (전농동)
    • 전화: 070-8786-1300
    • 홈페이지: http://www.haesung.hs.kr
    • 특징: 컨벤션경영, 항공호텔, 국제전시경영 등 특성화 학과

각 학교별로 입학 전형이나 세부 정보가 필요하시면 해당 학교에 직접 문의하시거나 홈페이지를 참고하시기 바랍니다.`,

      // ⭐ 새로운 매크로 추가 예시
      "청소년 상담 프로그램": `동대문구에서 운영하는 청소년 상담 프로그램을 안내해드리겠습니다.

[동대문구 청소년지원센터 꿈드림]

가장 전문적인 청소년 상담 서비스를 제공하는 곳입니다. 특히 학교 밖 청소년을 위한 종합적인 지원을 하고 있습니다.

• 대상: 9세~24세 청소년 (특히 학교 밖 청소년)
• 위치: 서울특별시 동대문구 천호대로2길 23-9 (신설동복지지원센터)
• 연락처: 02-2237-1318
• 운영시간: 월~금 09:00-18:00 (토·일·공휴일 휴무)

[제공 서비스]
1. 상담지원: 초기상담, 욕구파악, 심리·진로·가족관계 상담
2. 교육지원: 재취학, 재입학, 복교지원, 상급학교 진학 지원, 검정고시 지원
3. 취업지원: 직업체험, 진로교육활동, 경제활동 참여 지원
4. 자립지원: 생활지원, 의료지원, 정서지원, 건강검진, 예방접종

[신청방법]
전화예약 → 상담지원센터 내방 → 상담 및 지원
• 필요서류: 신분증, 학교 관련 서류(해당시)
• 이용료: 무료
• 신청기간: 연중 상시

특히 입학 후 3개월 이상 결석한 청소년, 취학의무를 유예한 청소년, 제적·퇴학처분을 받거나 자퇴한 청소년, 상급학교에 진학하지 않은 청소년에게 우선 지원을 제공합니다.

개별 맞춤형 상담과 지원을 받을 수 있으니, 먼저 전화로 상담 예약을 하시기 바랍니다.

자세한 정보: https://www.ddm.go.kr/www/contents.do?key=670`,

      // ⭐ 원하는 질문-답변 계속 추가
      "학습 코칭 신청": `안녕하세요! 동대문구 교육지원센터에서 운영하는 학습 코칭 프로그램에 대해 안내해드리겠습니다.

현재 동대문구 교육지원센터에서는 다음과 같은 학습 코칭 프로그램을 운영하고 있습니다:

[주요 프로그램]

1. "1:1 학습코칭 2기" - 개별 맞춤형 학습 지도
   • 운영기관: 동대문구 교육지원센터
   • 담당부서: 교육정책과
   • 특징: 일대일 개인별 맞춤 학습 코칭

2. "하반기 1:1 학습코칭" - 하반기 집중 프로그램
   • 개별 학습자의 수준에 맞는 맞춤형 지도
   • 체계적인 학습 계획 수립 및 관리

3. "학부모 학습 코칭" - 학부모 대상 프로그램
   • 자녀 학습 지도 방법 안내
   • 효과적인 가정 학습 환경 조성 방법

[신청 및 문의]
• 위치: 동대문구 왕산로 25, 7층 (동대문구 교육지원센터)
• 담당부서: 교육정책과
• 신청방법: 동대문구청 홈페이지 또는 교육지원센터 직접 방문

각 프로그램별 세부 일정과 신청 자격은 다를 수 있으니, 정확한 정보는 아래 링크에서 확인하시거나 교육정책과로 직접 문의하시기 바랍니다.

상세 정보 확인:
https://www.ddm.go.kr/www/./selectBbsNttView.do?key=575&bbsNo=38&nttNo=1754`,

      "방과후 뭐있어?": `안녕하세요! 동대문구에서 운영하는 방과후 프로그램을 안내해드리겠습니다.

[방과후 보육시설]

동대문구에서는 초등학생을 위한 방과후 보육시설 3곳을 운영하고 있습니다:

1. 열린 방과후보육시설(구립)
   • 위치: 전농로16길 59
   • 연락처: 02-2248-0421
   • 정원: 20명
   • 비용: 월 100,000원

2. 전농 방과후보육시설(민간)
   • 위치: 서울시립대로12길 99 (전농1동)
   • 연락처: 02-2215-8514
   • 정원: 40명
   • 비용: 월 233,650원

3. 천응 방과후보육시설(민간)
   • 위치: 제기로 128-6 (청량리동 57-2)
   • 연락처: 02-965-2423
   • 정원: 40명
   • 비용: 월 233,650원

[복지관 방과후 학습 프로그램]

지역 복지관에서도 다양한 방과후 프로그램을 운영합니다:

1. 동대문종합사회복지관 (02-920-4541)
   • 느린학습자 청소년 야간보호 (무료)
   • 개별학습지도 및 취미활동

2. 장안종합사회복지관 (02-2242-7564)
   • 장애아동 방과후보호 (초등 1~6학년)
   • 정원: 6명

3. 동대문청소년센터 (02-3295-2452)
   • 청소년방과후아카데미 (초등고학년 대상)
   • 정원: 40명, 무료

[신청 방법]
각 시설에 직접 연락하여 신청하시면 됩니다. 저소득층의 경우 보육료 감면 혜택이 있으니 동주민센터에서 별도 신청하시기 바랍니다.

자세한 정보는 동대문구청 홈페이지에서 확인하실 수 있습니다: https://www.ddm.go.kr/www/contents.do?key=675`,

      "나 중학생인데 컴퓨터 관심있어": `안녕하세요! 컴퓨터에 관심이 있는 중학생이시군요. 동대문구에서 운영하는 컴퓨터 관련 교육 프로그램들을 소개해드릴게요.

[현재 접수 중인 컴퓨터 교육 프로그램]

1. "컴퓨터 기초(윈도우10)" - 기초 과정
   • 장소: 전농교육장(답십리로26길 6, 2층)
   • 상태: 현재 접수중
   • 컴퓨터를 처음 배우거나 기초를 다지고 싶다면 추천

2. "ITQ엑셀자격증" - 심화 과정
   • 장소: 신설교육장
   • 상태: 현재 접수중
   • 자격증 취득을 통해 스펙을 쌓을 수 있는 프로그램

3. "ITQ파워포인트자격증" - 심화 과정
   • 장소: 전농교육장(답십리로26길 6, 2층)
   • 상태: 현재 접수중
   • 프레젠테이션 프로그램 활용 및 자격증 취득 과정

이 프로그램들은 모두 동대문구 평생학습 예약포털을 통해 신청할 수 있습니다. 중학생도 참여 가능한 프로그램들이니 관심 있는 과정에 신청해보세요.

더 자세한 정보와 신청은 다음 링크에서 확인하실 수 있습니다:
https://www.ddm.go.kr/selectDongdaemunUserCourseView.do?key=1529&searchEduInstSe=&searchEdcKey=&lctreRcritKey=6438&pageUnit=15&pageIndex=1&searchCnd=SJ&receptionStts=ACCPT

궁금한 점이 더 있으시면 언제든 말씀해주세요!`,
    };

    const newUserMessage = {
      id: Date.now(),
      type: "user",
      text: messageToSend,
    };
    const typingMessage = { id: Date.now() + 1, type: "bot", typing: true };
    setMessages((prev) => [...prev, newUserMessage, typingMessage]);

    setLoading(true);

    // 정확히 매칭되는 질문이 있는지 확인
    if (DEMO_RESPONSES[messageToSend]) {
      // 3.5초 대기 (실제처럼 보이게)
      await new Promise((resolve) => setTimeout(resolve, 3500));

      const demoResponse = {
        id: Date.now() + 2,
        type: "bot",
        text: DEMO_RESPONSES[messageToSend],
        feedback: null,
      };

      setMessages((prev) => prev.slice(0, -1).concat(demoResponse));
      setLoading(false);

      return; // API 호출 안하고 종료
    }

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

      // ⭐ 콘솔에 전체 답변 출력 (복사 가능)
      console.log("================== 답변 전체 (복사용) ==================");
      console.log(newBotMessage.text);
      console.log("========================================================");

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
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <div className="App">
          <header className="app-header">
            <div className="header-left">
              <span
                className="logo-text"
                onClick={() => setMessages([])}
                style={{ cursor: "pointer" }}
              >
                DD-<span className="highlight">O</span>N
              </span>
            </div>

            <div className="header-right" style={{ position: "relative" }}>
              <img
                src="/images/user_icon.png"
                className="profile-icon"
                onClick={toggleUserBubble}
                style={{ cursor: "pointer" }}
              />
              {isUserBubbleOpen && <UserBubble />}
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
                                onClick={() =>
                                  handleFeedback(msg.id, "dislike")
                                }
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
                  <p className="subtitle">디디온과 함께하는 동대문 교육 탐방</p>
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
                    <span className="char-counter">
                      {inputText.length} / 1000
                    </span>
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
      )}
    </>
  );
}

export default App;

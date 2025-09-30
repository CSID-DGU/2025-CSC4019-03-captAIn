import React, { useState, useEffect, useRef, useCallback } from "react";
// FAQList 컴포넌트는 src/components/interactive/FAQList.js에 위치해야 합니다.
import FAQList from './components/interactive/FAQList'; 
import "./App.css";

// API 엔드포인트
const API_URL = process.env.REACT_APP_API_ENDPOINT || "YOUR_API_GATEWAY_URL";

/* -----------------------------------------------------
 * 0. 더미 사용자 데이터 (실제는 DB 사용)
 * ----------------------------------------------------- */
const DUMMY_USERS = [
  {
    id: 1,
    email: "test@example.com",
    password: "password123", // 실제로는 해싱됨
    name: "김철수",
    gender: "male",
    schoolLevel: "고",
    highDetail: "일반",
    Gu: "장안1동", // 이 값은 이제 구(Gu) 값으로 저장될 것입니다.
  },
];

// ⭐ [추가] 서울시 25개 구 목록
const SEOUL_DISTRICTS = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", 
  "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", 
  "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", 
  "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
];


/* -----------------------------------------------------
 * 1. 스플래시 화면
 * ----------------------------------------------------- */
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <img
        src="/images/didimi-found.png"
        alt="디디온 파운드 로고"
        className="splash-logo"
      />
      <h1 className="splash-title">SEOUL-AI</h1>
      <p className="splash-description">Your AI Parenting Navigator.</p>
      <div className="loading-spinner"></div>
      <p className="splash-text">
        서울아이가 여러분을 찾아가는 중입니다...
        <br />
        잠시만 기다려주세요!
      </p>
    </div>
  );
};

/* -----------------------------------------------------
 * 2. 사용자 정보 출력 (UserBubble)
 * ----------------------------------------------------- */
const UserBubble = ({ user, onClose }) => {
  // dong 대신 district를 사용할 수 있지만, 기존 구조 유지를 위해 변수명은 dong 유지
  const { name, gender, schoolLevel, highDetail, dong: district } = user; 

  const schoolText = `${schoolLevel} 학생${
    highDetail ? ` (${highDetail} 계열)` : ""
  }`;

  return (
    <div className="user-bubble">
      <h3>{name} 님의 정보</h3>
      <p>
        <strong>성별:</strong> {gender === "male" ? "남" : "여"}
      </p>
      <p>
        <strong>학교:</strong> {schoolText}
      </p>
      {/* ⭐ [수정] 거주 지역을 구(District)로 표시 */}
      <p>
        <strong>거주 지역:</strong> {district}
      </p>
      <div style={{ marginTop: "10px" }}>
        <button onClick={onClose} className="submit-btn">
          닫기
        </button>
      </div>
    </div>
  );
};

/* -----------------------------------------------------
 * 3. 로그인 모달
 * ----------------------------------------------------- */
const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const user = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div
        className="contact-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "350px" }}
      >
        <div className="modal-header">
          <h3>로그인</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="login-email">이메일</label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">비밀번호</label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="modal-footer" style={{ marginTop: "20px" }}>
              <button type="submit" className="modal-action-btn">
                로그인
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------------------------------
 * 4. 회원가입 모달 (사용자 정보 입력 포함) - [수정됨]
 * ----------------------------------------------------- */
const SignupModal = ({ onClose, onSignupSuccess }) => {
  // 기본 계정 정보
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // 기존 자녀 정보
  const [gender, setGender] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [highDetail, setHighDetail] = useState("");
  // ⭐ [수정] 'dong' 대신 'district' 상태를 사용
  const [district, setDistrict] = useState(""); 
  
  // ⭐ [추가] 새로운 가구 및 자녀 정보 상태
  const [hasChild, setHasChild] = useState("유"); 
  const [isPregnant, setIsPregnant] = useState(""); 
  const [familyType, setFamilyType] = useState(""); 
  const [incomeLevel, setIncomeLevel] = useState(""); 
  const [assetLevel, setAssetLevel] = useState(""); 
  const [jobStatus, setJobStatus] = useState(""); 
  const [housingType, setHousingType] = useState(""); 
  const [hasDisability, setHasDisability] = useState("없음"); 
  const [childInfo, setChildInfo] = useState([
    { gender: '', dob: '', count: 1 }
  ]);
  
  const [error, setError] = useState("");

  // ⭐ [제거] dongs 배열은 삭제됨. 대신 SEOUL_DISTRICTS를 사용

  // 가구 유형 옵션
  const familyOptions = [
    { value: "", label: "선택하세요" },
    { value: "일반가구", label: "일반가구" },
    { value: "한부모가구", label: "한부모가구" },
    { value: "조손가구", label: "조손가구" },
    { value: "다문화가구", label: "다문화가구" },
    { value: "기타", label: "기타" },
  ];

  // 자녀 정보 추가 핸들러
  const addChild = () => {
    setChildInfo(prev => [...prev, { gender: '', dob: '', count: prev.length + 1 }]);
  };

  const handleChildChange = (index, field, value) => {
    const newChildren = childInfo.map((child, i) => {
      if (i === index) {
        return { ...child, [field]: value };
      }
      return child;
    });
    setChildInfo(newChildren);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (DUMMY_USERS.find((u) => u.email === email)) {
      setError("이미 사용 중인 이메일입니다.");
      return;
    }

    // 필수 정보 검증
    if (!name || !email || !password || !incomeLevel || !housingType || !district) {
        setError("필수 항목을 모두 입력해주세요.");
        return;
    }

    const newUser = {
      id: DUMMY_USERS.length + 1,
      email, password, name,
      
      // 추가된 정보
      hasChild, isPregnant, familyType, incomeLevel, assetLevel, jobStatus, housingType, hasDisability,
      children: hasChild === '유' ? childInfo : [],

      // 기존 정보 (학부모의 자녀 정보)
      gender, schoolLevel, highDetail: schoolLevel === "고" ? highDetail : "", dong: district, // district를 dong 필드에 저장
    };

    DUMMY_USERS.push(newUser); 
    onSignupSuccess(newUser);
    onClose();
  };

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div
        className="contact-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "450px" }} // 폭 증가
      >
        <div className="modal-header">
          <h3>회원가입 및 정보 입력</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            {/* 기본 계정 정보 (상단 유지) */}
            <div className="form-group">
              <label>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해주세요" required />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="로그인에 사용할 이메일" required />
            </div>
            <div className="form-group">
              <label>비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 설정" required />
            </div>

            <hr />
            
            {/* --------------------------------------------------------------------------
             * 가구 및 자녀 정보
             * -------------------------------------------------------------------------- */}

            {/* 자녀 유무 */}
            <p><strong>자녀 유무</strong></p>
            <div className="radio-group horizontal-group">
              <label>
                <input type="radio" name="hasChild" value="유" checked={hasChild === "유"} onChange={(e) => setHasChild(e.target.value)} />
                유
              </label>
              <label>
                <input type="radio" name="hasChild" value="무" checked={hasChild === "무"} onChange={(e) => setHasChild(e.target.value)} />
                무
              </label>
            </div>

            {/* 자녀 정보 (hasChild === '유' 일 때만 표시) */}
            {hasChild === "유" && (
              <>
                <p><strong>자녀 정보</strong></p>
                {childInfo.map((child, index) => (
                  <div key={index} className="child-info-group">
                    <span className="child-label">자녀 {child.count}</span>
                    <div className="child-info-fields">
                        <div className="radio-group horizontal-group child-gender-group">
                            <label>
                                <input type="radio" name={`childGender-${index}`} value="남" 
                                    checked={child.gender === "남"} 
                                    onChange={(e) => handleChildChange(index, 'gender', e.target.value)} 
                                /> 남
                            </label>
                            <label>
                                <input type="radio" name={`childGender-${index}`} value="여" 
                                    checked={child.gender === "여"} 
                                    onChange={(e) => handleChildChange(index, 'gender', e.target.value)} 
                                /> 여
                            </label>
                        </div>
                        {/* 생년월일 입력 필드 */}
                        <input type="date" placeholder="연도-월-일" 
                            value={child.dob}
                            onChange={(e) => handleChildChange(index, 'dob', e.target.value)}
                            className="child-dob-input" 
                        />
                    </div>
                  </div>
                ))}
                {/* 자녀 추가 버튼 */}
                <button type="button" onClick={addChild} className="add-child-btn">
                  + 자녀 추가
                </button>
              </>
            )}
            
            <hr />

            {/* 임신 여부 */}
            <p><strong>임신 여부</strong></p>
            <div className="radio-group horizontal-group">
              <label>
                <input type="radio" name="isPregnant" value="임신 중" checked={isPregnant === "임신 중"} onChange={(e) => setIsPregnant(e.target.value)} />
                임신 중
              </label>
              <label>
                <input type="radio" name="isPregnant" value="임신 준비 중" checked={isPregnant === "임신 준비 중"} onChange={(e) => setIsPregnant(e.target.value)} />
                임신 준비 중
              </label>
              <label>
                <input type="radio" name="isPregnant" value="해당 없음" checked={isPregnant === "해당 없음"} onChange={(e) => setIsPregnant(e.target.value)} />
                해당 없음
              </label>
            </div>
            
            <hr />

            {/* 가구 유형 */}
            <p><strong>가구 유형</strong></p>
            <div className="form-group">
              <select value={familyType} onChange={(e) => setFamilyType(e.target.value)} required>
                {familyOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* 소득 수준 */}
            <p><strong>소득 수준</strong></p>
            <div className="radio-group vertical-group">
              <label>
                <input type="radio" name="incomeLevel" value="중위소득 50% 이하" checked={incomeLevel === "중위소득 50% 이하"} onChange={(e) => setIncomeLevel(e.target.value)} required />
                중위소득 50% 이하
              </label>
              <label>
                <input type="radio" name="incomeLevel" value="중위소득 100% 이하" checked={incomeLevel === "중위소득 100% 이하"} onChange={(e) => setIncomeLevel(e.target.value)} />
                중위소득 100% 이하
              </label>
              <label>
                <input type="radio" name="incomeLevel" value="중위소득 150% 이하" checked={incomeLevel === "중위소득 150% 이하"} onChange={(e) => setIncomeLevel(e.target.value)} />
                중위소득 150% 이하
              </label>
              <label>
                <input type="radio" name="incomeLevel" value="중위소득 초과" checked={incomeLevel === "중위소득 초과"} onChange={(e) => setIncomeLevel(e.target.value)} />
                중위소득 초과
              </label>
            </div>
            
            {/* 자산 */}
            <p><strong>자산</strong></p>
            <div className="radio-group horizontal-group asset-group">
              <label>
                <input type="radio" name="assetLevel" value="1억 미만" checked={assetLevel === "1억 미만"} onChange={(e) => setAssetLevel(e.target.value)} />
                1억 미만
              </label>
              <label>
                <input type="radio" name="assetLevel" value="1~2억" checked={assetLevel === "1~2억"} onChange={(e) => setAssetLevel(e.target.value)} />
                1~2억
              </label>
              <label>
                <input type="radio" name="assetLevel" value="2~3억" checked={assetLevel === "2~3억"} onChange={(e) => setAssetLevel(e.target.value)} />
                2~3억
              </label>
              <label>
                <input type="radio" name="assetLevel" value="3~5억" checked={assetLevel === "3~5억"} onChange={(e) => setAssetLevel(e.target.value)} />
                3~5억
              </label>
              <label>
                <input type="radio" name="assetLevel" value="5억 이상" checked={assetLevel === "5억 이상"} onChange={(e) => setAssetLevel(e.target.value)} />
                5억 이상
              </label>
            </div>
            
            {/* 직업 상태 */}
            <p><strong>직업 상태</strong></p>
            <div className="radio-group horizontal-group">
              <label>
                <input type="radio" name="jobStatus" value="재직" checked={jobStatus === "재직"} onChange={(e) => setJobStatus(e.target.value)} />
                재직
              </label>
              <label>
                <input type="radio" name="jobStatus" value="구직" checked={jobStatus === "구직"} onChange={(e) => setJobStatus(e.target.value)} />
                구직
              </label>
              <label>
                <input type="radio" name="jobStatus" value="무직" checked={jobStatus === "무직"} onChange={(e) => setJobStatus(e.target.value)} />
                무직
              </label>
              <label>
                <input type="radio" name="jobStatus" value="자영업" checked={jobStatus === "자영업"} onChange={(e) => setJobStatus(e.target.value)} />
                자영업
              </label>
            </div>
            
            {/* 주거 형태 */}
            <p><strong>주거 형태</strong></p>
            <div className="radio-group horizontal-group">
              <label>
                <input type="radio" name="housingType" value="자가" checked={housingType === "자가"} onChange={(e) => setHousingType(e.target.value)} required />
                자가
              </label>
              <label>
                <input type="radio" name="housingType" value="전세" checked={housingType === "전세"} onChange={(e) => setHousingType(e.target.value)} />
                전세
              </label>
              <label>
                <input type="radio" name="housingType" value="월세" checked={housingType === "월세"} onChange={(e) => setHousingType(e.target.value)} />
                월세
              </label>
              <label>
                <input type="radio" name="housingType" value="공공임대" checked={housingType === "공공임대"} onChange={(e) => setHousingType(e.target.value)} />
                공공임대
              </label>
            </div>
            
            {/* 장애 여부 */}
            <p><strong>장애 여부</strong></p>
            <div className="radio-group horizontal-group">
              <label>
                <input type="radio" name="hasDisability" value="있음" checked={hasDisability === "있음"} onChange={(e) => setHasDisability(e.target.value)} />
                있음
              </label>
              <label>
                <input type="radio" name="hasDisability" value="없음" checked={hasDisability === "없음"} onChange={(e) => setHasDisability(e.target.value)} />
                없음
              </label>
            </div>

            {/* --------------------------------------------------------------------------
             * ⭐ [기존 부분] - 학부모의 자녀 정보 입력 부분 (모달 하단)
             * -------------------------------------------------------------------------- */}
            
            <hr />

            {/* 거주 지역 (구 단위로 수정) */}
            <p><strong>거주 지역 *</strong></p>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="dong-select" required>
              <option value="">거주 구 선택</option>
              {SEOUL_DISTRICTS.map((gu) => (<option key={gu} value={gu}>{gu}</option>))}
            </select>
            
            {/* 자녀 성별 (첫째 기준, 기존 데이터) */}
            <p><strong>자녀 성별 (첫째 기준, 기존 데이터)</strong></p>
            <div className="radio-group">
              <label><input type="radio" name="gender" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} />남</label>
              <label><input type="radio" name="gender" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} />여</label>
            </div>
            
            {/* 학교 */}
            <p style={{ marginTop: "10px" }}>
              <strong>학교 (첫째 기준, 기존 데이터)</strong>
            </p>
            <div className="radio-group">
              <label><input type="radio" name="schoolLevel" value="초" checked={schoolLevel === "초"} onChange={(e) => setSchoolLevel(e.target.value)} />초등학생</label>
              <label><input type="radio" name="schoolLevel" value="중" checked={schoolLevel === "중"} onChange={(e) => setSchoolLevel(e.target.value)} />중학생</label>
              <label><input type="radio" name="schoolLevel" value="고" checked={schoolLevel === "고"} onChange={(e) => setSchoolLevel(e.target.value)} />고등학생</label>
            </div>

            {/* '고'를 선택했을 때만 나타나는 계열 선택 */}
            {schoolLevel === "고" && (
              <>
                <p style={{ marginTop: "10px" }}>
                  <strong>계열</strong>
                </p>
                <div className="radio-group">
                  <label><input type="radio" name="highDetail" value="일반" checked={highDetail === "일반"} onChange={(e) => setHighDetail(e.target.value)} />일반</label>
                  <label><input type="radio" name="highDetail" value="예체능" checked={highDetail === "예체능"} onChange={(e) => setHighDetail(e.target.value)} />예체능</label>
                  <label><input type="radio" name="highDetail" value="실업계" checked={highDetail === "실업계"} onChange={(e) => setHighDetail(e.target.value)} />실업계</label>
                </div>
              </>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="modal-footer" style={{ marginTop: "20px" }}>
              <button type="submit" className="modal-action-btn">
                회원가입 완료
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------------------------------
 * 5. 랜딩 페이지 FAQ 모달
 * ----------------------------------------------------- */
const LandingFAQModal = ({ onClose, onSelect }) => {
  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div 
        className="contact-modal-content landing-faq-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>자주 묻는 질문</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <FAQList onSelect={(question) => {
            onSelect(null, question); // handleSubmit(null, question) 형식에 맞춤
            onClose(); 
        }} />
      </div>
    </div>
  );
};


/* -----------------------------------------------------
 * 6. 사이드바 컴포넌트
 * ----------------------------------------------------- */
const Sidebar = ({ isOpen, onClose, onNewChat, messages }) => {
  const chatHistory = messages.filter(msg => msg.type === 'user' && !msg.typing)
                            .map(msg => msg.text)
                            .slice(0, 5) 
                            .reverse(); 

  return (
    <>
      {/* 1. 오버레이 */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      {/* 2. 사이드바 본체 */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h4 className="sidebar-title">메뉴 & 기록</h4>
          <button onClick={onClose} className="sidebar-close-btn">
            &times;
          </button>
        </div>
        
        <div className="sidebar-content">
          <button onClick={onNewChat} className="sidebar-new-chat-btn">
            + 새 채팅 시작
          </button>
          
          <div className="sidebar-history">
            <h5>최근 질문</h5>
            {chatHistory.length > 0 ? (
              <ul>
                {chatHistory.map((text, index) => (
                  <li key={index} title={text}>
                    {text.substring(0, 30)}...
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-history">채팅 기록이 없습니다.</p>
            )}
          </div>
          
          <div className="sidebar-settings">
            <h5>설정</h5>
            <p className="no-history">개인 설정 및 가이드</p>
          </div>
        </div>
      </div>
    </>
  );
};


/* -----------------------------------------------------
 * 7. 메인 App 컴포넌트
 * ----------------------------------------------------- */
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const chatEndRef = useRef(null);
  
  // 인증/모달 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  
  // FAQ 표시 상태 관리
  const [isLandingFAQModalOpen, setIsLandingFAQModalOpen] = useState(false);

  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const [isUserBubbleOpen, setIsUserBubbleOpen] = useState(false);
  const toggleUserBubble = () => {
    setIsUserBubbleOpen(!isUserBubbleOpen);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsSidebarOpen(false);
    setInputText("");
  };


  /* -----------------------------------------------------
   * 인증/모달 핸들러
   * ----------------------------------------------------- */
  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    console.log(`${user.name}님 로그인 성공!`);
  };

  const handleSignup = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    console.log(`${user.name}님 회원가입 및 로그인 성공!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsUserBubbleOpen(false); 
    console.log("로그아웃 성공!");
    setMessages([]); 
  };

  const closeAuthModals = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  }, []);

  const openLogin = () => {
    closeAuthModals();
    setIsLoginModalOpen(true);
  };

  const openSignup = () => {
    closeAuthModals();
    setIsSignupModalOpen(true);
  };


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -----------------------------------------------------
   * 채팅 제출 핸들러 (오류 수정 및 기능 통합 완료)
   * ----------------------------------------------------- */
  const handleSubmit = async (e, predefinedQuestion = null) => {
    
    // 1. 인자가 이벤트 객체인지 확인하고 preventDefault 호출
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    
    // 2. 실제 보낼 메시지 결정
    const messageToSend = predefinedQuestion || inputText.trim();
    
    if (!messageToSend || loading) return;

    // 3. 텍스트를 초기화
    setInputText("");

    // 4. 로그인 체크 로직
    if (!isLoggedIn) {
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), type: "user", text: messageToSend },
            { id: Date.now() + 1, type: "bot", text: "로그인 후 이용 가능한 서비스입니다. 이용을 원하시면 먼저 로그인 또는 회원가입을 해주세요." }
        ]);
        return;
    }

    // 5. 메시지 처리
    const newUserMessage = {
      id: Date.now(),
      type: "user",
      text: messageToSend,
    };
    const typingMessage = { id: Date.now() + 1, type: "bot", typing: true };
    setMessages((prev) => [...prev, newUserMessage, typingMessage]);

    setLoading(true);

    // 질문-답변 쌍 (DEMO_RESPONSES)
    const DEMO_RESPONSES = {
      "독서실 추천": `동대문구에서 운영하는 구립 청소년독서실을 추천드리겠습니다. ... (내용 생략) ...`,
      "동대문구 고등학교 목록": `동대문구에 위치한 고등학교 목록을 안내해드리겠습니다. ... (내용 생략) ...`,
      "청소년 상담 프로그램": `동대문구에서 운영하는 청소년 상담 프로그램을 안내해드리겠습니다. ... (내용 생략) ...`,
      "학습 코칭 신청": `안녕하세요! 동대문구 교육지원센터에서 운영하는 학습 코칭 프로그램에 대해 안내해드리겠습니다. ... (내용 생략) ...`,
      "방과후 뭐있어?": `안녕하세요! 동대문구에서 운영하는 방과후 프로그램을 안내해드리겠습니다. ... (내용 생략) ...`,
      "나 중학생인데 컴퓨터 관심있어": `안녕하세요! 컴퓨터에 관심이 있는 중학생이시군요. 동대문구에서 운영하는 컴퓨터 관련 교육 프로그램들을 소개해드릴게요. ... (내용 생략) ...`,
      
      // FAQList 항목의 답변
      "출산 지원금 알려줘": `[서울시 출산 지원금]
      1. **첫만남 이용권:** 출생아당 200만원 바우처 지급 (일시금)
      2. **서울형 산후조리경비 지원:** 출산일 기준 서울시 거주 6개월 이상 산모에게 100만원 상당의 산후조리경비 지급 (바우처 또는 현금)
      3. **지자체별 추가 지원:** 동대문구 포함 각 자치구별로 추가 출산 양육 지원금이 별도로 있습니다. 거주지 동주민센터에 문의하거나 동대문구청 홈페이지를 확인해주세요!`,
      "산모 건강관리 서비스 뭐 있어?": `[서울시 산모 건강관리 서비스]
      1. **산후 도우미 지원:** 산모의 건강 회복과 신생아 양육을 위한 전문 인력(산후 도우미)을 가정에 파견하여 서비스 비용을 지원합니다. (소득 기준 적용)
      2. **영양 플러스 사업:** 임산부 및 영유아의 영양 위험 요인을 개선하기 위해 보충 식품 및 영양 교육/상담을 제공합니다.
      3. **임산부 엽산제/철분제 지원:** 임신 초기와 중기/후기 기간에 맞춰 보건소에서 무료로 엽산제와 철분제를 지원합니다.`,
      "어린이집 신청 방법 알려줘": `어린이집 입소는 주로 **'복지로 임신육아포털 아이사랑(i-사랑)'**을 통해 온라인으로 신청합니다.
      1. **접수:** 복지로 홈페이지(www.bokjiro.go.kr) 또는 모바일 앱에서 '보육료/양육수당'을 신청하고 '입소 대기'를 등록합니다.
      2. **대기:** 원하는 어린이집에 입소 대기를 걸어둡니다. (최대 3개소)
      3. **선정:** 어린이집 입소 우선순위(맞벌이, 다자녀 등)에 따라 입소 대상이 선정됩니다.`,
      "임신부 교통비 지원돼?": `네, **서울시 임산부 교통비 지원 사업**이 있습니다.
      1. **지원 대상:** 서울에 거주하는 모든 임산부 (임신 12주차~출산 후 3개월)
      2. **지원 금액:** 1인당 70만원
      3. **사용처:** 지하철, 버스, 택시, 자가용 유류비, 기차(KTX/SRT) 등
      4. **신청:** 서울시 '맘편한 임신' 통합 서비스를 통해 온라인 신청 후, '국민행복카드'에 교통 포인트를 지급받아 사용합니다.`,
      "육아휴직 급여 얼마나 받아?": `육아휴직 급여는 **고용보험**에서 지급하며, 주요 내용은 다음과 같습니다.
      1. **지급 수준:** 휴직 기간(월별) 통상임금의 **80%** (상한액 150만원, 하한액 70만원)
      2. **특례:** 부모가 순차적으로 육아휴직을 사용하는 **'3+3 부모 육아휴직제'**를 활용하면 생후 12개월 이내 자녀에 대해 3개월간 최대 통상임금의 100% (상한액 300만원)까지 지원됩니다.
      *자세한 사항은 고용보험 홈페이지 또는 고용센터에 문의하세요.`,
      "다자녀 혜택 뭐가 있어?": `동대문구를 기준으로 다자녀 가구에 제공되는 주요 혜택은 다음과 같습니다.
      1. **공영주차장 이용요금 감면:** 두 자녀 이상 가구에 대해 공영주차장 요금 감면 혜택 제공.
      2. **다자녀 교육비 지원:** (서울시) 고등학교 학비 지원, 대학생 등록금 지원 사업 등이 있습니다.
      3. **공공 시설 할인:** 서울시 다둥이 행복 카드를 발급받으면 공공 시설(상수도 요금 포함) 및 제휴 업체 할인을 받을 수 있습니다.`,
    };

    if (DEMO_RESPONSES[messageToSend]) {
      await new Promise((resolve) => setTimeout(resolve, 3500));

      const demoResponse = {
        id: Date.now() + 2,
        type: "bot",
        text: DEMO_RESPONSES[messageToSend],
        feedback: null,
      };

      setMessages((prev) => prev.slice(0, -1).concat(demoResponse));
      setLoading(false);
      return;
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

  /* -----------------------------------------------------
   * 기타 핸들러 및 렌더링 도우미 함수
   * ----------------------------------------------------- */

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
      console.log("메시지 전송:", { name, email, message });
      console.log("메시지가 성공적으로 전송되었습니다!");
      onClose(); 
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

  /* -----------------------------------------------------
   * 렌더링
   * ----------------------------------------------------- */
  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        // App 컨테이너에 relative 포지션 적용 (Sidebar를 위해)
        <div className="App">
          
          {/* 사이드바 렌더링 */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={toggleSidebar} 
            onNewChat={handleNewChat}
            messages={messages}
          />

          <header className="app-header">
            <div className="header-left">
              {/* 사이드바 토글 버튼 */}
              <button 
                className="sidebar-toggle-btn" 
                onClick={toggleSidebar}
                title="메뉴 열기"
              >
                &#9776; {/* 햄버거 아이콘 */}
              </button>
              
              <span
                className="logo-text"
                onClick={() => setMessages([])}
                style={{ cursor: "pointer" }}
              >SEOUL<span className="highlight">-AI</span>
              </span>
              {isLoggedIn && (
                <span className="welcome-message">
                  {currentUser?.name}님 환영합니다!
                </span>
              )}
            </div>

            <div className="header-right" style={{ position: "relative" }}>
              {isLoggedIn ? (
                <>
                  <img
                    src="/images/user_icon.png"
                    className="profile-icon"
                    onClick={toggleUserBubble}
                    style={{ cursor: "pointer" }}
                  />
                  <button onClick={handleLogout} className="auth-button logout">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button onClick={openLogin} className="auth-button">
                    로그인
                  </button>
                  <button
                    onClick={openSignup}
                    className="auth-button signup-btn"
                  >
                    회원가입
                  </button>
                </>
              )}
              {isUserBubbleOpen && currentUser && (
                <UserBubble user={currentUser} onClose={toggleUserBubble} />
              )}
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
                  overflowY: 'auto' 
                }}
              >
                
                {/* 메시지 컨테이너 */}
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
                  <p className="subtitle">Your AI Parenting Navigator.</p>
                  <h1 className="title">서울아이에게 물어보세요</h1>
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
                  {/* 랜딩 페이지 FAQ 버튼 (퀵 스타트 버튼 목록에 통합) */}
                  <button
                    onClick={() => setIsLandingFAQModalOpen(true)}
                    className="quick-start-btn" 
                    style={{ backgroundColor: '#ffe6e6', color: '#e6007e' }} 
                  >
                    #자주 묻는 질문 💡
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
                      SEOUL-I <span className="beta-tag">beta</span>
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
                    isLoggedIn
                      ? isChatStarted
                        ? "질문을 입력하세요..."
                        : "동대문구의 교육 정보, 진로 탐색 등 무엇이든 물어보세요!"
                      : "로그인 후 질문을 입력해주세요."
                  }
                  className="idea-textarea"
                  rows={isChatStarted ? 1 : 1}
                  disabled={loading || !isLoggedIn} 
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
                    disabled={loading || !inputText || !isLoggedIn}
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
          
          {/* 로그인 및 회원가입 모달 */}
          {isLoginModalOpen && (
            <LoginModal onClose={closeAuthModals} onLoginSuccess={handleLogin} />
          )}
          {isSignupModalOpen && (
            <SignupModal onClose={closeAuthModals} onSignupSuccess={handleSignup} />
          )}
          
          {/* 랜딩 페이지 FAQ 모달 */}
          {isLandingFAQModalOpen && (
            <LandingFAQModal 
              onClose={() => setIsLandingFAQModalOpen(false)}
              onSelect={handleSubmit}
            />
          )}
        </div>
      )}
    </>
  );
}

export default App;
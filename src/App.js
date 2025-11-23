import React, { useState, useEffect, useRef, useCallback } from "react";
// FAQList 컴포넌트는 src/components/interactive/FAQList.js에 위치해야 합니다.
import FAQList from './components/interactive/FAQList'; 
import "./App.css";

// ⭐ [추가] 개인정보 처리 방침 모달 import
import PrivacyPolicyModal from './PrivacyPolicyModal'; 

// API 엔드포인트
const API_URL = process.env.REACT_APP_API_ENDPOINT || "YOUR_API_GATEWAY_URL";
const FEEDBACK_API_URL = process.env.REACT_APP_FEEDBACK_ENDPOINT || "YOUR_FEEDBACK_LAMBDA_URL";

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
    gu: "강남구", // 이 값은 이제 구(Gu) 값으로 저장될 것입니다.
  },
];

const DUMMY_NOTICES = [
  { id: 1, title: "e보건소 임산부 지원(온라인 보건 서비스)", link: "https://www.e-health.go.kr/gh/caSrvcGud/selectParSupGudInfo.do?appFlg=02&menuId=200004" },
  { id: 2, title: "임신육아종합포털 아이사랑", link: "https://www.childcare.go.kr/?menuno=1"},
  { id: 3, title: "아이돌봄 서비스", link : "https://www.idolbom.go.kr/front/" },
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
        src="/images/seoul_logo.png"
        alt="서울시 로고"
        className="splash-logo"
      />
      <h1 className="splash-title">SEOUL-I</h1>
      <p className="splash-description">우리아이 임신 및 양육 AI챗봇</p>
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
  // 기존 정보
  const { 
    name, 
    gender, 
    highDetail, 
    gu: district, 
    
    // ⭐ [추가] 회원가입 시 추가된 정보 구조 분해 할당
    hasChild, 
    isPregnant, 
    familyType, 
    incomeLevel, 
    assetLevel, 
    jobStatus, 
    housingType, 
    hasDisability,
    children // 자녀 배열
  } = user; 


  return (
    <div className="user-bubble" style={{ maxWidth: '300px' }}> {/* 스타일 추가 */}
      <h3>{name} 님의 상세 정보</h3>
      
      {/* ------------------- 가구 정보 ------------------- */}
      <p>
        <strong>거주 지역:</strong> {district || '미입력'}
      </p>
      <p>
        <strong>가구 유형:</strong> {familyType || '미입력'}
      </p>
      <p>
        <strong>소득 수준:</strong> {incomeLevel || '미입력'}
      </p>
      <p>
        <strong>자산 수준:</strong> {assetLevel || '미입력'}
      </p>
      <p>
        <strong>주거 형태:</strong> {housingType || '미입력'}
      </p>
      <p>
        <strong>직업 상태:</strong> {jobStatus || '미입력'}
      </p>
      <p>
        <strong>장애 여부:</strong> {hasDisability || '미입력'}
      </p>

      {/* ------------------- 임신/출산 정보 ------------------- */}
      <p>
        <strong>임신 여부:</strong> {isPregnant || '미입력'}
      </p>
      <p>
        <strong>자녀 유무:</strong> {hasChild || '미입력'}
      </p>

      {/* ------------------- 자녀 정보 (children 배열) ------------------- */}
      {hasChild === '유' && children && children.length > 0 && (
          <div>
            <hr style={{ margin: '10px 0' }} />
            <strong>등록된 자녀 ({children.length}명)</strong>
            {children.map((child, index) => (
                <p key={index} style={{ margin: '5px 0', fontSize: '0.9em' }}>
                    * 자녀 {index + 1}: {child.gender || '성별 미입력'} / {child.dob || '생년월일 미입력'}
                </p>
            ))}
          </div>
      )}  
      
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
// ⭐ 수정: onOpenPrivacy prop을 추가했습니다.
const Sidebar = ({ isOpen, onClose, onNewChat, messages, onOpenPrivacy }) => { 
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
          
          {/* ⭐ [추가된 포털 사이트 섹션] */}

          <div className="sidebar-notice">
            <h5>포털 사이트</h5>
            {DUMMY_NOTICES.length > 0 ? (
              <ul>
                {DUMMY_NOTICES.map((item) => (
                  <li 
                      key={item.id} 
                      title={item.title}
                      // ❗ onClick 이벤트 수정: 새 창에서 item.link로 이동
                      onClick={() => item.link && window.open(item.link, '_blank')} 
                  >
                    {item.title.substring(0, 30)}...
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-content">새로운 공지사항이 없습니다.</p>
            )}
          </div>

          <div className="sidebar-settings">
            <h5>설정 및 정보</h5>
            <p 
                onClick={onOpenPrivacy} // ⭐ [추가] 개인정보 처리 방침 클릭 핸들러
                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline', marginBottom: '10px' }}
            >
                개인정보 처리 방침
            </p>
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
  
  // ⭐ [추가] 개인정보 처리 방침 모달 상태
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);


  const [isUserBubbleOpen, setIsUserBubbleOpen] = useState(false);
  const toggleUserBubble = () => {
    setIsUserBubbleOpen(!isUserBubbleOpen);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // ⭐ [추가] 개인정보 처리 방침 모달 토글 함수
  const togglePrivacyModal = () => {
    setIsPrivacyModalOpen(prev => !prev);
    if (isSidebarOpen) {
        setIsSidebarOpen(false); // 사이드바가 열려있으면 닫아줍니다.
    }
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

      // [삭제됨] 4. 로그인 체크 로직 제거 (비로그인 채팅 허용)
      /*
      if (!isLoggedIn) {
          setMessages((prev) => [
              ...prev,
              { id: Date.now(), type: "user", text: messageToSend },
              { id: Date.now() + 1, type: "bot", text: "로그인 후 이용 가능한 서비스입니다..." }
          ]);
          return;
      }
      */

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
      // ... (기존 데모 응답 데이터는 너무 기니 생략, 기존 코드 유지하시면 됩니다) ...
      // 만약 코드가 너무 길다면 이 부분은 기존 코드를 그대로 두셔도 됩니다.
      // 핵심은 아래 try-catch 블록입니다.
    };

      // (데모 응답 처리 로직 - 기존 유지)
      if (DEMO_RESPONSES && DEMO_RESPONSES[messageToSend]) {
        await new Promise((resolve) => setTimeout(resolve, 3500));
        const responseContent = DEMO_RESPONSES[messageToSend];
        let formattedText;
        if (typeof responseContent === 'object' && responseContent.title) {
            formattedText = `**${responseContent.title}**\n\n${responseContent.summary}\n\n**상세 내용:**\n${responseContent.details.join('\n')}\n\n**🔗 정보 확인:** ${responseContent.link}`;
        } else {
            formattedText = responseContent;
        }
        const demoResponse = {
          id: Date.now() + 2,
          type: "bot",
          text: formattedText,
          feedback: null,
        };
        setMessages((prev) => prev.slice(0, -1).concat(demoResponse));
        setLoading(false);
        return;
      }

      try {
        // [수정됨] 로그인 상태에 따라 user_context 포함 여부 결정
        const payload = {
          question: messageToSend,
          user_context: (isLoggedIn && currentUser) ? {
              gu: currentUser.dong, // 회원가입 시 저장한 '구' 정보
              is_pregnant: currentUser.isPregnant === "임신 중",
              has_child: currentUser.hasChild === "유",
              // 필요한 경우 추가 정보 포함
          } : null // 비로그인 시 null 전송
        };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), // 수정된 payload 사용
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

  const handleFeedback = async (id, feedbackType) => {
    // 1. UI 상태 업데이트 (기존 코드 유지)
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === id) {
          if (msg.feedback === feedbackType) return { ...msg, feedback: null };
          return { ...msg, feedback: feedbackType };
        }
        return msg;
      })
    );

    // 2. 서버로 전송 (추가된 코드)
    const targetMessage = messages.find(m => m.id === id);
    
    try {
        // 실제 람다 함수로 데이터 전송
        await fetch(FEEDBACK_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: feedbackType.toUpperCase(), // 'LIKE' or 'DISLIKE'
                user_id: currentUser ? currentUser.email : 'anonymous',
                content: {
                    // 어떤 질문에 대한 평가인지 알기 위해 간략 정보 전송
                    answer_id: id, 
                    answer_text: targetMessage ? targetMessage.text.substring(0, 100) + "..." : "내용 없음"
                }
            })
        });
        console.log(`피드백(${feedbackType}) 전송 완료`);
    } catch (e) {
        console.error("피드백 전송 실패:", e);
    }
  };

  /* -----------------------------------------------------
   * 렌더링 도우미 함수 (수정됨: 마크다운 기호 제거)
   * ----------------------------------------------------- */
  const renderMessageContent = (text) => {
    // text가 문자열이 아닐 경우 강제 변환
    if (typeof text !== 'string') {
        return String(text); 
    }

    // 1. 마크다운 기호 제거 (정규식 활용)
    let cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1') // **볼드** -> 볼드
        .replace(/__(.*?)__/g, '$1')     // __볼드__ -> 볼드
        .replace(/^#+\s/gm, '')          // # 헤더 -> 헤더
        .replace(/`([^`]+)`/g, '$1');    // `코드` -> 코드
        // 필요하면 다른 마크다운 기호도 추가 가능

    // 2. URL 링크 처리 (기존 로직 유지)
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    
    if (!cleanText.match(urlRegex)) {
      return cleanText;
    }
    
    const parts = cleanText.split(urlRegex);
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

    const handleMessageSubmit = async (e) => {
      e.preventDefault();
      
      try {
          // 문의 내용을 서버로 전송
          const response = await fetch(FEEDBACK_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  type: 'INQUIRY', // 타입: 문의사항
                  user_id: email,  // 입력한 이메일
                  content: {
                      name: name,
                      message: message
                  }
              })
          });

          if (response.ok) {
              alert("문의가 성공적으로 접수되었습니다!"); 
              onClose();
          } else {
              throw new Error('전송 실패');
          }
      } catch (error) {
          console.error("문의 전송 실패", error);
          alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
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
            onOpenPrivacy={togglePrivacyModal} // ⭐ [추가] 개인정보 처리 방침 토글 함수 전달
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
              >SEOUL<span className="highlight">-I</span>
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
                  backgroundImage: 'url("/images/seoul_logo.png")',
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
                                 <span className="tooltip">도움돼요</span>
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
                                <span className="tooltip">도움 안돼요</span>
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
                  src="/images/seoul_logo.png"
                  alt="서울아이 로고"
                  className="landing-logo"
                />
                <div className="text-container">
                  <p className="subtitle">서울의 모든 출산·보육·교육 혜택을 한눈에 확인하세요</p>
                  <h2 className="title">AI가 알려주는 우리 가족 맞춤 육아 정보</h2>
                </div>

                <div className="quick-start-buttons">
                
                  <button
                    onClick={() => handleSubmit(null, "출산 준비 및 계획")}
                    className="quick-start-btn"
                  >
                    #출산 준비 및 계획
                  </button>

                
                  <button
                    // 💡 수정: 질문 오타 수정 ("신모신생아" -> "산모신생아")
                    onClick={() => handleSubmit(null, "산모신생아 건강관리")} 
                    className="quick-start-btn"
                  >
                    #산모신생아 건강관리
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
                  // [수정됨] 로그인 여부와 관계없이 항상 질문 유도 문구 표시
                  placeholder={
                    isChatStarted
                      ? "질문을 입력하세요..."
                      : "임신 및 양육 정책 등 무엇이든 물어보세요!"
                  }
                  className="idea-textarea"
                  rows={isChatStarted ? 1 : 1}
                  // [수정됨] !isLoggedIn 제거 (로딩 중일 때만 비활성)
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
                    // [수정됨] !isLoggedIn 제거 (로딩 중이거나 입력값 없을 때만 비활성)
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
              <span className="tooltip-text">1:1 문의하기</span>
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

          {/* ⭐ [추가] 개인정보 처리 방침 모달 */}
          {isPrivacyModalOpen && (
            <PrivacyPolicyModal onClose={togglePrivacyModal} />
          )}

        </div>
      )}
    </>
  );
}

export default App;
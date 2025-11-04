import React from 'react';

/* -----------------------------------------------------
 * 개인정보 처리 방침 모달 컴포넌트
 * ----------------------------------------------------- */
const PrivacyPolicyModal = ({ onClose }) => {
  return (
    // 'contact-modal-overlay' 클래스를 재사용하여 배경 블러 및 닫기 기능을 구현
    <div className="contact-modal-overlay" onClick={onClose}>
      <div
        className="contact-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "600px", maxHeight: "80vh", overflowY: "auto" }} // 폭 증가 및 스크롤 가능하게 설정
      >
        <div className="modal-header">
          <h3>개인정보 처리 방침</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          
          <p>
            **SEOUL-I (서울시 임신 및 양육 정책 AI 챗봇)**는 정보주체의 자유와 권리 보호를 위해 
            「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 개인정보를 적법하게 처리하고 안전하게 관리합니다.
          </p>

          <hr style={{ margin: '15px 0' }} />

          {/* 주요 항목 1: 개인정보의 수집 및 이용 목적 */}
          <h4 style={{ color: '#007bff' }}>1. 개인정보의 수집 및 이용 목적</h4>
          <p>
            서비스 제공 및 민원 처리, 이용자 맞춤형 정보(예: 거주 지역 기반 정책) 제공을 위해 다음의 목적만으로 개인정보를 처리합니다.
          </p>
          <ul>
            <li>**회원 관리:** 서비스 이용 의사 확인, 회원제 서비스 제공에 따른 본인 식별/인증, 회원 자격 유지/관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정 이용 방지</li>
            <li>**맞춤형 정책 정보 제공:** 거주 지역(구), 자녀 유무, 임신 여부, 소득 수준 등에 기반한 서울시 및 자치구의 임신 및 양육 관련 정책 정보 제공</li>
            <li>**민원 처리:** 민원인의 신원 확인, 민원 사항 확인, 사실조사를 위한 연락·통지, 처리 결과 통보</li>
          </ul>

          {/* 주요 항목 2: 수집하는 개인정보 항목 */}
          <h4 style={{ color: '#007bff', marginTop: '15px' }}>2. 수집하는 개인정보 항목</h4>
          <p>
            회원가입 및 서비스 이용 과정에서 다음과 같은 최소한의 개인정보를 수집하고 있습니다.
          </p>
          <ul>
            <li>**필수 수집 항목:** 이름, 이메일(ID), 비밀번호, **거주 지역(구)**</li>
            <li>**맞춤형 서비스 제공을 위한 추가 항목:** 자녀 유무, 임신 여부, 가구 유형, 소득 수준, 자산 수준, 직업 상태, 주거 형태, 장애 여부, 자녀 정보(성별/생년월일)</li>
          </ul>

          {/* 주요 항목 3: 개인정보의 보유 및 이용 기간 */}
          <h4 style={{ color: '#007bff', marginTop: '15px' }}>3. 개인정보의 보유 및 이용 기간</h4>
          <p>
            원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
          </p>
          <ul>
            <li>**보존 항목:** 회원정보(이름, 이메일, 수집된 모든 정보)</li>
            <li>**보존 근거:** 이용약관 또는 개인정보 처리방침 동의</li>
            <li>**보존 기간:** 회원 탈퇴 시 또는 1년 동안 서비스 이용이 없는 경우까지</li>
          </ul>
          
          {/* 기타 항목 추가 가능 */}
          <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
            ※ 본 개인정보 처리방침은 2025년 11월 4일부터 적용됩니다.
          </p>

          <div style={{ marginTop: "20px" }}>
            <button onClick={onClose} className="submit-btn" style={{ width: '100%' }}>
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
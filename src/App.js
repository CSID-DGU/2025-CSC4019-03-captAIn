import React, { useState, useEffect, useRef, useCallback } from "react";
// FAQList 컴포넌트는 src/components/interactive/FAQList.js에 위치해야 합니다.
import FAQList from "./components/interactive/FAQList";
import "./App.css";

// ⭐ [추가] 개인정보 처리 방침 모달 import
import PrivacyPolicyModal from "./PrivacyPolicyModal";

// API 엔드포인트
const API_URL = process.env.REACT_APP_API_ENDPOINT || "YOUR_API_GATEWAY_URL";
const FEEDBACK_API_URL =
  process.env.REACT_APP_FEEDBACK_ENDPOINT || "YOUR_FEEDBACK_LAMBDA_URL";

// ⭐ [추가] 설정 여부 플래그 (로컬 데모 시 에러 방지용)
const IS_API_CONFIGURED = API_URL && API_URL !== "YOUR_API_GATEWAY_URL";
const IS_FEEDBACK_CONFIGURED =
  FEEDBACK_API_URL && FEEDBACK_API_URL !== "YOUR_FEEDBACK_LAMBDA_URL";

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
    gu: "강남구", // 일관되게 'gu' 필드 사용
  },
];

const DUMMY_NOTICES = [
  {
    id: 1,
    title: "e보건소 임산부 지원(온라인 보건 서비스)",
    link: "https://www.e-health.go.kr/gh/caSrvcGud/selectParSupGudInfo.do?appFlg=02&menuId=200004",
  },
  {
    id: 2,
    title: "임신육아종합포털 아이사랑",
    link: "https://www.childcare.go.kr/?menuno=1",
  },
  { id: 3, title: "아이돌봄 서비스", link: "https://www.idolbom.go.kr/front/" },
];

// ⭐ [추가] 서울시 25개 구 목록
const SEOUL_DISTRICTS = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

/* -----------------------------------------------------
 * ⭐ [추가] 퀵스타트 / 데모용 질문-답변 매핑
 *  - API 설정 전 로컬 데모 or 멘토링 시 안정적으로 동작하도록
 * ----------------------------------------------------- */
/* -----------------------------------------------------
 * 🔹 퀵스타트 & FAQ용 데모 응답 (프론트에서 고정 답변 반환)
 *   - 키: 버튼에서 보내는 그대로의 질문/토픽 문자열
 * ----------------------------------------------------- */
// 질문-답변 쌍 (DEMO_RESPONSES)
/* -----------------------------------------------------
 * 🔹 퀵스타트 & FAQ용 데모 응답 (공식 사이트 링크 포함, 존댓말 버전)
 * ----------------------------------------------------- */
const DEMO_RESPONSES = {
  /* 1) 랜딩 퀵스타트 버튼 - 출산 준비 및 계획 */
  "출산 준비 및 계획": `
[출산 준비 및 계획] 기본 안내입니다.

1️⃣ 임신 전·초기 준비
- 산부인과 방문하여 임신 확인 및 기초 검진을 받습니다.
- 엽산을 복용하고, 흡연·음주를 중단하며 카페인을 줄이는 것이 좋습니다.
- 기존에 복용 중인 약이 있다면 반드시 산부인과와 상의해야 합니다.

2️⃣ 중기(안정기) 준비
- 기형아 검사, 정기 초음파 등 필수 검진 일정을 미리 확인합니다.
- 직장을 다니신다면 출산휴가·육아휴직 사용 계획을 세우는 것이 좋습니다.
- 분만 예정 병원, 산후조리원, 출산 준비물(신생아 의류, 기저귀, 카시트 등)을 정리합니다.

3️⃣ 말기·출산 직전 준비
- 분만 징후(규칙적인 진통, 양수 파수 등)를 미리 공부해 두면 도움이 됩니다.
- 비상 연락망(보호자, 병원, 119 또는 택시)을 정리해 두면 안전합니다.
- 출산 지원금, 산후조리 지원, 임산부 교통비 등 신청 시기를 미리 확인하면 좋습니다.

[관련 공식 사이트]
- 임신육아종합포털 아이사랑 (임신·출산·육아 종합 정보, 어린이집 신청 등)
  https://www.childcare.go.kr
- 복지로 (출산지원금·양육수당 등 복지서비스 조회/신청)
  https://www.bokjiro.go.kr
- 정부24 (보조금24, 맘편한임신 등 원스톱 서비스)
  https://www.gov.kr
- 국민건강보험공단 (임신·출산 진료비, 건강보험 관련)
  https://www.nhis.or.kr

👉 거주하시는 구, 자녀 수, 소득 수준 등을 함께 적어
“송파구 맞벌이, 첫째 임신 중인데 받을 수 있는 지원을 정리해 주세요”
와 같이 질문하시면 더 구체적으로 정리해서 안내해 드릴 수 있습니다.
`,

  /* 2) 랜딩 퀵스타트 버튼 - 산모신생아 건강관리 */
  "산모신생아 건강관리": `
[산모·신생아 건강관리] 기본 안내입니다.

1️⃣ 산모·신생아 건강관리 지원사업(산후도우미)
- 출산 직후 일정 기간 동안 교육받은 도우미가 가정에 방문하여
  산모의 회복과 신생아 돌봄을 돕는 서비스입니다.
- 기준 중위소득, 출산 순위, 다태아 여부, 고위험 임신 여부 등에 따라
  지원 기간과 본인부담금이 달라집니다.
- 보통 거주지 보건소, 복지로, 일부 자치구 온라인 창구에서 신청합니다.

2️⃣ 산모 건강관리
- 출산 후 6주까지는 과로를 피하고, 충분한 휴식과 영양 섭취가 중요합니다.
- 고혈압, 과다 출혈, 심한 두통·가슴 통증, 호흡 곤란 등의 증상이 있으면
  지체하지 말고 의료기관을 방문해야 합니다.
- 산후우울감이 2주 이상 지속되거나 일상생활에 지장을 줄 정도라면
  보건소·정신건강복지센터 등을 통해 상담을 받아보시는 것이 좋습니다.

3️⃣ 신생아 건강관리
- 체온(약 36.5~37.5℃), 수유량, 대·소변 횟수, 반응 등을 관찰해야 합니다.
- 황달이 심해지거나, 수유를 거의 하지 못하거나, 아이가 축 늘어져 있으면
  바로 소아청소년과 진료가 필요합니다.
- 예방접종 일정(BCG, B형간염, DTaP, 폴리오 등)을 캘린더에 정리해 두면 편리합니다.

[관련 공식 사이트]
- 임신육아종합포털 아이사랑 (산모·신생아 건강관리 지원사업, 영유아 정보)
  https://www.childcare.go.kr
- 국민건강보험공단 (건강검진, 진료비, 각종 바우처 연계)
  https://www.nhis.or.kr
- 서울시 임신·출산 정보(서울아기 건강 첫걸음 등)
  https://seoul-agi.seoul.go.kr

👉 “○○구 기준 산후도우미 지원 조건과 신청 방법을 알려주세요”
“첫째 출산 후 산후우울증 관련해서 받을 수 있는 지원이 궁금합니다”
처럼 구와 상황을 함께 적어 질문하시면, 실제로 이용 가능성이 높은 서비스 위주로 안내해 드릴 수 있습니다.
`,

  /* 3) FAQ - 출산 지원금 알려줘 */
  "출산 지원금 알려줘": `
[출산 지원금]은 크게 3단계로 나누어 보시면 이해하기 편합니다.

1️⃣ 국가 단위 출산·양육 지원
- 첫 만남 이용권, 영아수당, 아동수당 등 국가에서 공통으로 지원되는 제도입니다.
- 출생신고 후 주민센터 또는 온라인(정부24, 복지로)에서 신청하는 경우가 많습니다.

2️⃣ 지자체(서울시·구청) 추가 지원
- 서울시 및 각 자치구에서 출산장려금, 출산축하금, 산후조리 지원비 등을 별도로 운영하기도 합니다.
- 지원 금액·대상·신청기한은 거주 구청마다 다르므로,
  반드시 거주지 구청 홈페이지나 복지 담당 부서에서 최신 기준을 확인하시는 것이 좋습니다.

3️⃣ 기타 바우처·서비스
- 산모·신생아 건강관리 지원(산후도우미), 기저귀·분유 지원, 영유아 건강검진 등
  현금 외에 서비스 형태의 지원도 많습니다.

[관련 공식 사이트]
- 복지로 (출산·양육 관련 전국/지자체 지원금 통합 조회)
  https://www.bokjiro.go.kr
- 정부24 (보조금24에서 가구별 맞춤 혜택 조회)
  https://www.gov.kr
- 임신육아종합포털 아이사랑 (임신·출산·보육 정보)
  https://www.childcare.go.kr

👉 “송파구 전세 거주, 첫째 출산 예정, 맞벌이(중위소득 150% 이하)인데
받을 수 있는 출산 지원금을 정리해 주세요”
처럼 거주 구와 가족 상황을 함께 말씀해 주시면, 실제로 받을 가능성이 높은 항목 위주로 정리해 드릴 수 있습니다.
`,

  /* 4) FAQ - 산모 건강관리 서비스 뭐 있어? */
  "산모 건강관리 서비스 뭐 있어?": `
[산모 건강관리 서비스]는 크게 3가지 축으로 나누어 볼 수 있습니다.

1️⃣ 보건소·의료기관 중심 서비스
- 산전·산후 건강검진, 초음파, 기형아 검사, 혈액검사 등 기본 의료 서비스
- 고위험 임신(고혈압, 당뇨, 조산 위험 등)에 대한 전문 관리
- 모유 수유 클리닉, 산모 교실, 영양·운동 교육 프로그램 등

2️⃣ 가정 방문·돌봄 서비스
- 산모·신생아 건강관리 지원사업(산후도우미)
  · 전문 교육을 받은 인력이 가정을 방문해 산모 회복과 신생아 돌봄을 지원합니다.
  · 소득 수준, 출산 순위, 다태아 여부 등에 따라 지원 일수·본인부담금이 달라집니다.

3️⃣ 심리·정신 건강 지원
- 보건소·정신건강복지센터에서 산후우울증 선별검사 및 상담을 제공합니다.
- 필요 시 정신건강의학과 등 의료기관으로 연계해 치료를 받을 수 있습니다.

[관련 공식 사이트]
- 임신육아종합포털 아이사랑 (산모·신생아 건강관리 지원사업 안내)
  https://www.childcare.go.kr
- 국민건강보험공단 (건강검진 및 의료비 관련 안내)
  https://www.nhis.or.kr
- 서울시 임신·출산 정보(서울시 산모 지원사업 모음)
  https://seoul-agi.seoul.go.kr

👉 “○○구 기준 산모·신생아 건강관리(산후도우미) 신청 조건과 금액을 알려주세요”
와 같이 거주지를 포함해 질문하시면, 보다 실제 기준에 가까운 안내가 가능합니다.
`,

  /* 5) FAQ - 어린이집 신청 방법 알려줘 */
  "어린이집 신청 방법 알려줘": `
[어린이집 신청 방법]의 기본 흐름을 안내드리겠습니다.

1️⃣ 어린이집 정보 검색
- 임신육아종합포털 아이사랑에서
  집 또는 직장 주변 어린이집(국공립, 민간, 가정 어린이집 등)을 검색할 수 있습니다.
- 위치, 운영시간, 보육료, 평가등급, 특성 프로그램 등을 비교해 보시면 좋습니다.

2️⃣ 온라인 입소 대기 신청
- 아이사랑에서 보호자와 자녀 정보를 등록한 후,
  원하는 어린이집에 입소 대기 신청을 합니다.
- 맞벌이, 저소득, 장애, 다자녀 등 우선순위에 따라 배정 순서가 달라질 수 있습니다.

3️⃣ 입소 확정 및 등록
- 입소 가능 안내를 받으면, 안내된 기간 내에 방문하여 등록을 진행합니다.
- 제출해야 하는 서류(주민등록등본, 건강보험 자격확인서 등)는
  어린이집 또는 지자체 안내문을 통해 확인할 수 있습니다.

4️⃣ 보육료 지원 신청
- 어린이집 이용 시, 보육료 지원을 위해 추가 신청이 필요한 경우가 있으므로
  거주지 주민센터 또는 아이사랑 안내를 확인하시는 것이 좋습니다.

[관련 공식 사이트]
- 임신육아종합포털 아이사랑 (어린이집 찾기·입소 대기 신청)
  https://www.childcare.go.kr
- 정부24 (각종 증명서 발급, 돌봄·보육 관련 민원 서비스)
  https://www.gov.kr

👉 “강남구에 사는 만 3세 아이, 맞벌이 가정인데 국공립 어린이집 입소 방법과 우선순위 기준을 알려주세요”
처럼 아이 나이, 거주 구, 맞벌이 여부를 함께 적어 질문하시면 더 정확한 안내가 가능합니다.
`,

  /* 6) FAQ - 임신부 교통비 지원돼? */
  "임신부 교통비 지원돼?": `
[임신부 교통비 지원]은 시·도마다 운영 방식이 다르며,
서울시의 경우 ‘임산부 교통비 지원사업’ 형태로 운영되는 경우가 많습니다.

1️⃣ 기본 내용(서울시 사례)
- 서울 거주 임산부에게 1인당 일정 금액의 교통비를 포인트 형태로 지원합니다.
- 임산부 본인 명의의 카드로 대중교통, 일부 교통수단 이용 시 사용할 수 있습니다.
- 지원 금액, 신청·사용 기한 등은 연도별 예산과 정책에 따라 달라질 수 있습니다.

2️⃣ 대략적인 신청 방법(서울)
- 온라인: ‘서울맘케어’ 홈페이지에서 회원가입 후 임산부 교통비 지원을 신청합니다.
- 또는 정부24 ‘맘편한임신’ 원스톱 서비스를 통해 연계되는 경우도 있습니다.
- 오프라인: 거주지 동주민센터에 방문해 임신확인서, 신분증 등 서류를 제출하고 신청합니다.

3️⃣ 유의사항
- 반드시 신청 기한과 사용 기한을 확인하시는 것이 중요합니다.
- 서울 외 다른 시·군·구는 유사한 제도를 다른 이름으로 운영할 수 있으므로
  거주지 지자체 홈페이지에서 최신 정보를 확인해야 합니다.

[관련 공식 사이트]
- 서울맘케어 (서울시 임산부 교통비·산후조리비 등 신청)
  https://www.seoulmomcare.com
- 서울시 임신·출산 관련 정보
  https://seoul-agi.seoul.go.kr
- 정부24 (맘편한임신 등 임신·출산 관련 서비스 조회)
  https://www.gov.kr

👉 “서울 ○○구에 거주 중인 임신 20주차인데, 임산부 교통비 지원 조건과 신청 방법을 알려주세요”
처럼 구와 임신 주수를 함께 적어 질문하시면, 보다 실제에 가까운 안내를 드릴 수 있습니다.
`,

  /* 7) FAQ - 육아휴직 급여 얼마나 받아? */
  "육아휴직 급여 얼마나 받아?": `
[육아휴직 급여]는 고용보험에 가입된 근로자를 대상으로,
육아휴직 기간 동안 통상임금을 기준으로 일정 비율을 지원하는 제도입니다.

1️⃣ 기본 개념
- 육아휴직: 만 8세 또는 초등학교 2학년 이하 자녀를 양육하기 위해 일정 기간 휴직하는 제도입니다.
- 육아휴직 급여: 육아휴직 기간 동안 고용보험에서 지급하는 소득 보전 급여입니다.

2️⃣ 급여 산정의 핵심 요소(일반적인 구조)
- 육아휴직 전 평균 임금(통상임금)을 기준으로 일정 비율을 지급합니다.
- 상한액·하한액이 있어, 월 지급액에는 최소·최대 제한이 있습니다.
- 급여의 일부는 복직 후 일정 기간 근무 시 지급되는 구조(복귀 인센티브)인 경우가 많습니다.

3️⃣ 실제 예상 금액 확인 방법
- 고용보험·육아휴직 급여 모의계산 서비스를 통해 월 예상 금액을 확인하시는 것이 가장 정확합니다.
- 회사 인사팀 또는 노무사와 상담하시면 개인 상황(근속기간, 급여 구조 등)에 맞게 확인할 수 있습니다.

[관련 공식 사이트]
- 고용24·고용보험 관련 서비스 (육아휴직·육아기 근로시간 단축 등)
  https://www.work24.go.kr
- 근로복지공단 (육아휴직 급여 업무 담당 기관)
  https://www.comwel.or.kr
- 정부24 (고용보험·육아휴직 관련 민원 서비스 안내)
  https://www.gov.kr

👉 “월급 세전 ○○만 원, 서울 거주 직장인인데 육아휴직 1년을 쓰면 대략 얼마나 받을 수 있는지 구조를 설명해 주세요”
처럼 본인의 월급 수준과 휴직 기간 계획을 함께 적어 질문하시면,
구조를 더 구체적으로 설명해 드릴 수 있습니다.
`,

  /* 8) FAQ - 다자녀 혜택 뭐가 있어? */
  "다자녀 혜택 뭐가 있어?": `
[다자녀 가구 혜택]은 국가, 지자체, 공공기관, 민간 업체까지 매우 다양하게 분산되어 있습니다.
크게 다음과 같은 영역으로 나누어 볼 수 있습니다.

1️⃣ 현금·바우처·감면
- 출산장려금, 양육수당, 다자녀 추가 지원 등이 있을 수 있습니다.
- 전기·도시가스·상하수도 요금 감면 제도를 운영하는 지자체·공기업도 있습니다.
- 공공임대주택, 분양주택, 전세자금 대출 등에서 다자녀 가구에 우대 조건을 적용하는 경우가 있습니다.

2️⃣ 교육·보육·문화 혜택
- 어린이집·유치원 우선입소, 보육료 추가 지원 등 지자체별로 다르게 운영됩니다.
- 공공 체육시설, 문화시설, 박물관·미술관, 도서관 프로그램 등에서 이용료 할인·우대를 받을 수 있습니다.

3️⃣ 교통 및 기타 생활 혜택
- 일부 지자체에서는 대중교통, 공영주차장, 고속도로 통행료 등에서 다자녀 할인 제도를 운영하기도 합니다.
- 다자녀 우대카드(또는 출산·육아 통합카드)를 발급받으면 각종 제휴 혜택을 추가로 받을 수 있습니다.

4️⃣ 확인 방법
- 전국 공통 제도는 복지로·정부24의 보조금24를 통해 확인하시는 것이 좋습니다.
- 거주지 시·군·구청 홈페이지에서 ‘다자녀’, ‘저출산 대책’ 메뉴를 찾아보시면
  지역 특화 혜택(장학금, 공영주차장 할인 등)을 확인하실 수 있습니다.

[관련 공식 사이트]
- 복지로 (다자녀 가구 복지서비스 통합 조회)
  https://www.bokjiro.go.kr
- 정부24 보조금24 (가구 기준 맞춤형 혜택 조회)
  https://www.gov.kr
- 임신육아종합포털 아이사랑 (보육·어린이집 관련 정보)
  https://www.childcare.go.kr

👉 “서울 ○○구 거주, 자녀 3명(초등 2명, 유치원 1명)인 다자녀 가구인데
교육비·주거·교통 관련해서 받을 수 있는 혜택을 정리해 주세요”
와 같이 자녀 수, 연령, 거주 구를 함께 적어 질문하시면,
실제 적용 가능성이 높은 혜택을 중심으로 안내해 드릴 수 있습니다.
`,
};


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
  const {
    name,
    gender,
    highDetail,
    gu: district, // ⭐ 'gu' 필드에서 가져오도록 일관화
    hasChild,
    isPregnant,
    familyType,
    incomeLevel,
    assetLevel,
    jobStatus,
    housingType,
    hasDisability,
    children,
  } = user;

  return (
    <div className="user-bubble" style={{ maxWidth: "300px" }}>
      <h3>{name} 님의 상세 정보</h3>

      {/* ------------------- 가구 정보 ------------------- */}
      <p>
        <strong>거주 지역:</strong> {district || "미입력"}
      </p>
      <p>
        <strong>가구 유형:</strong> {familyType || "미입력"}
      </p>
      <p>
        <strong>소득 수준:</strong> {incomeLevel || "미입력"}
      </p>
      <p>
        <strong>자산 수준:</strong> {assetLevel || "미입력"}
      </p>
      <p>
        <strong>주거 형태:</strong> {housingType || "미입력"}
      </p>
      <p>
        <strong>직업 상태:</strong> {jobStatus || "미입력"}
      </p>
      <p>
        <strong>장애 여부:</strong> {hasDisability || "미입력"}
      </p>

      {/* ------------------- 임신/출산 정보 ------------------- */}
      <p>
        <strong>임신 여부:</strong> {isPregnant || "미입력"}
      </p>
      <p>
        <strong>자녀 유무:</strong> {hasChild || "미입력"}
      </p>

      {/* ------------------- 자녀 정보 (children 배열) ------------------- */}
      {hasChild === "유" && children && children.length > 0 && (
        <div>
          <hr style={{ margin: "10px 0" }} />
          <strong>등록된 자녀 ({children.length}명)</strong>
          {children.map((child, index) => (
            <p key={index} style={{ margin: "5px 0", fontSize: "0.9em" }}>
              * 자녀 {index + 1}: {child.gender || "성별 미입력"} /{" "}
              {child.dob || "생년월일 미입력"}
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
 * 4. 회원가입 모달 (사용자 정보 입력 포함)
 *  - 'gu' 필드로 일원화
 * ----------------------------------------------------- */
const SignupModal = ({ onClose, onSignupSuccess }) => {
  // 기본 계정 정보
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 기존 자녀 정보 (옛 요구사항 호환)
  const [gender, setGender] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [highDetail, setHighDetail] = useState("");

  // 거주 구
  const [district, setDistrict] = useState("");

  // 가구 및 자녀 정보
  const [hasChild, setHasChild] = useState("유");
  const [isPregnant, setIsPregnant] = useState("");
  const [familyType, setFamilyType] = useState("");
  const [incomeLevel, setIncomeLevel] = useState("");
  const [assetLevel, setAssetLevel] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [housingType, setHousingType] = useState("");
  const [hasDisability, setHasDisability] = useState("없음");
  const [childInfo, setChildInfo] = useState([
    { gender: "", dob: "", count: 1 },
  ]);

  const [error, setError] = useState("");

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
    setChildInfo((prev) => [
      ...prev,
      { gender: "", dob: "", count: prev.length + 1 },
    ]);
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
      email,
      password,
      name,

      // 추가된 정보
      hasChild,
      isPregnant,
      familyType,
      incomeLevel,
      assetLevel,
      jobStatus,
      housingType,
      hasDisability,
      children: hasChild === "유" ? childInfo : [],

      // 기존 정보 (옛 구조 호환)
      gender,
      schoolLevel,
      highDetail: schoolLevel === "고" ? highDetail : "",
      gu: district, // ✅ 일관되게 'gu' 필드에 저장
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
        style={{ width: "450px" }}
      >
        <div className="modal-header">
          <h3>회원가입 및 정보 입력</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            {/* 기본 계정 정보 */}
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                required
              />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="로그인에 사용할 이메일"
                required
              />
            </div>
            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 설정"
                required
              />
            </div>

            <hr />

            {/* 자녀 유무 */}
            <p>
              <strong>자녀 유무</strong>
            </p>
            <div className="radio-group horizontal-group">
              <label>
                <input
                  type="radio"
                  name="hasChild"
                  value="유"
                  checked={hasChild === "유"}
                  onChange={(e) => setHasChild(e.target.value)}
                />
                유
              </label>
              <label>
                <input
                  type="radio"
                  name="hasChild"
                  value="무"
                  checked={hasChild === "무"}
                  onChange={(e) => setHasChild(e.target.value)}
                />
                무
              </label>
            </div>

            {/* 자녀 정보 */}
            {hasChild === "유" && (
              <>
                <p>
                  <strong>자녀 정보</strong>
                </p>
                {childInfo.map((child, index) => (
                  <div key={index} className="child-info-group">
                    <span className="child-label">자녀 {child.count}</span>
                    <div className="child-info-fields">
                      <div className="radio-group horizontal-group child-gender-group">
                        <label>
                          <input
                            type="radio"
                            name={`childGender-${index}`}
                            value="남"
                            checked={child.gender === "남"}
                            onChange={(e) =>
                              handleChildChange(index, "gender", e.target.value)
                            }
                          />{" "}
                          남
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`childGender-${index}`}
                            value="여"
                            checked={child.gender === "여"}
                            onChange={(e) =>
                              handleChildChange(index, "gender", e.target.value)
                            }
                          />{" "}
                          여
                        </label>
                      </div>
                      <input
                        type="date"
                        placeholder="연도-월-일"
                        value={child.dob}
                        onChange={(e) =>
                          handleChildChange(index, "dob", e.target.value)
                        }
                        className="child-dob-input"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addChild}
                  className="add-child-btn"
                >
                  + 자녀 추가
                </button>
              </>
            )}

            <hr />

            {/* 임신 여부 */}
            <p>
              <strong>임신 여부</strong>
            </p>
            <div className="radio-group horizontal-group">
              <label>
                <input
                  type="radio"
                  name="isPregnant"
                  value="임신 중"
                  checked={isPregnant === "임신 중"}
                  onChange={(e) => setIsPregnant(e.target.value)}
                />
                임신 중
              </label>
              <label>
                <input
                  type="radio"
                  name="isPregnant"
                  value="임신 준비 중"
                  checked={isPregnant === "임신 준비 중"}
                  onChange={(e) => setIsPregnant(e.target.value)}
                />
                임신 준비 중
              </label>
              <label>
                <input
                  type="radio"
                  name="isPregnant"
                  value="해당 없음"
                  checked={isPregnant === "해당 없음"}
                  onChange={(e) => setIsPregnant(e.target.value)}
                />
                해당 없음
              </label>
            </div>

            <hr />

            {/* 가구 유형 */}
            <p>
              <strong>가구 유형</strong>
            </p>
            <div className="form-group">
              <select
                value={familyType}
                onChange={(e) => setFamilyType(e.target.value)}
                required
              >
                {familyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 소득 수준 */}
            <p>
              <strong>소득 수준</strong>
            </p>
            <div className="radio-group vertical-group">
              <label>
                <input
                  type="radio"
                  name="incomeLevel"
                  value="중위소득 50% 이하"
                  checked={incomeLevel === "중위소득 50% 이하"}
                  onChange={(e) => setIncomeLevel(e.target.value)}
                  required
                />
                중위소득 50% 이하
              </label>
              <label>
                <input
                  type="radio"
                  name="incomeLevel"
                  value="중위소득 100% 이하"
                  checked={incomeLevel === "중위소득 100% 이하"}
                  onChange={(e) => setIncomeLevel(e.target.value)}
                />
                중위소득 100% 이하
              </label>
              <label>
                <input
                  type="radio"
                  name="incomeLevel"
                  value="중위소득 150% 이하"
                  checked={incomeLevel === "중위소득 150% 이하"}
                  onChange={(e) => setIncomeLevel(e.target.value)}
                />
                중위소득 150% 이하
              </label>
              <label>
                <input
                  type="radio"
                  name="incomeLevel"
                  value="중위소득 초과"
                  checked={incomeLevel === "중위소득 초과"}
                  onChange={(e) => setIncomeLevel(e.target.value)}
                />
                중위소득 초과
              </label>
            </div>

            {/* 자산 */}
            <p>
              <strong>자산</strong>
            </p>
            <div className="radio-group horizontal-group asset-group">
              <label>
                <input
                  type="radio"
                  name="assetLevel"
                  value="1억 미만"
                  checked={assetLevel === "1억 미만"}
                  onChange={(e) => setAssetLevel(e.target.value)}
                />
                1억 미만
              </label>
              <label>
                <input
                  type="radio"
                  name="assetLevel"
                  value="1~2억"
                  checked={assetLevel === "1~2억"}
                  onChange={(e) => setAssetLevel(e.target.value)}
                />
                1~2억
              </label>
              <label>
                <input
                  type="radio"
                  name="assetLevel"
                  value="2~3억"
                  checked={assetLevel === "2~3억"}
                  onChange={(e) => setAssetLevel(e.target.value)}
                />
                2~3억
              </label>
              <label>
                <input
                  type="radio"
                  name="assetLevel"
                  value="3~5억"
                  checked={assetLevel === "3~5억"}
                  onChange={(e) => setAssetLevel(e.target.value)}
                />
                3~5억
              </label>
              <label>
                <input
                  type="radio"
                  name="assetLevel"
                  value="5억 이상"
                  checked={assetLevel === "5억 이상"}
                  onChange={(e) => setAssetLevel(e.target.value)}
                />
                5억 이상
              </label>
            </div>

            {/* 직업 상태 */}
            <p>
              <strong>직업 상태</strong>
            </p>
            <div className="radio-group horizontal-group">
              <label>
                <input
                  type="radio"
                  name="jobStatus"
                  value="재직"
                  checked={jobStatus === "재직"}
                  onChange={(e) => setJobStatus(e.target.value)}
                />
                재직
              </label>
              <label>
                <input
                  type="radio"
                  name="jobStatus"
                  value="구직"
                  checked={jobStatus === "구직"}
                  onChange={(e) => setJobStatus(e.target.value)}
                />
                구직
              </label>
              <label>
                <input
                  type="radio"
                  name="jobStatus"
                  value="무직"
                  checked={jobStatus === "무직"}
                  onChange={(e) => setJobStatus(e.target.value)}
                />
                무직
              </label>
              <label>
                <input
                  type="radio"
                  name="jobStatus"
                  value="자영업"
                  checked={jobStatus === "자영업"}
                  onChange={(e) => setJobStatus(e.target.value)}
                />
                자영업
              </label>
            </div>

            {/* 주거 형태 */}
            <p>
              <strong>주거 형태</strong>
            </p>
            <div className="radio-group horizontal-group">
              <label>
                <input
                  type="radio"
                  name="housingType"
                  value="자가"
                  checked={housingType === "자가"}
                  onChange={(e) => setHousingType(e.target.value)}
                  required
                />
                자가
              </label>
              <label>
                <input
                  type="radio"
                  name="housingType"
                  value="전세"
                  checked={housingType === "전세"}
                  onChange={(e) => setHousingType(e.target.value)}
                />
                전세
              </label>
              <label>
                <input
                  type="radio"
                  name="housingType"
                  value="월세"
                  checked={housingType === "월세"}
                  onChange={(e) => setHousingType(e.target.value)}
                />
                월세
              </label>
              <label>
                <input
                  type="radio"
                  name="housingType"
                  value="공공임대"
                  checked={housingType === "공공임대"}
                  onChange={(e) => setHousingType(e.target.value)}
                />
                공공임대
              </label>
            </div>

            {/* 장애 여부 */}
            <p>
              <strong>장애 여부</strong>
            </p>
            <div className="radio-group horizontal-group">
              <label>
                <input
                  type="radio"
                  name="hasDisability"
                  value="있음"
                  checked={hasDisability === "있음"}
                  onChange={(e) => setHasDisability(e.target.value)}
                />
                있음
              </label>
              <label>
                <input
                  type="radio"
                  name="hasDisability"
                  value="없음"
                  checked={hasDisability === "없음"}
                  onChange={(e) => setHasDisability(e.target.value)}
                />
                없음
              </label>
            </div>

            <hr />

            {/* 거주 지역 (구 단위) */}
            <p>
              <strong>거주 지역 *</strong>
            </p>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="dong-select"
              required
            >
              <option value="">거주 구 선택</option>
              {SEOUL_DISTRICTS.map((gu) => (
                <option key={gu} value={gu}>
                  {gu}
                </option>
              ))}
            </select>

            {/* 자녀 성별 (옛 구조, 선택 사항) */}
            <p>
              <strong>자녀 성별 (첫째 기준, 선택)</strong>
            </p>
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
        <FAQList
          onSelect={(question) => {
            onSelect(null, question); // handleSubmit(null, question)
            onClose();
          }}
        />
      </div>
    </div>
  );
};

/* -----------------------------------------------------
 * 6. 사이드바 컴포넌트
 * ----------------------------------------------------- */
// ⭐ 수정: onOpenPrivacy prop을 실제로 사용
const Sidebar = ({ isOpen, onClose, onNewChat, messages, onOpenPrivacy }) => {
  const chatHistory = messages
    .filter((msg) => msg.type === "user" && !msg.typing)
    .map((msg) => msg.text)
    .slice(0, 5)
    .reverse();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
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

          <div className="sidebar-notice">
            <h5>포털 사이트</h5>
            {DUMMY_NOTICES.length > 0 ? (
              <ul>
                {DUMMY_NOTICES.map((item) => (
                  <li
                    key={item.id}
                    title={item.title}
                    onClick={() =>
                      item.link && window.open(item.link, "_blank")
                    }
                  >
                    {item.title.substring(0, 30)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-content">새로운 공지사항이 없습니다.</p>
            )}
          </div>

          <div className="sidebar-settings">
            <h5>설정 및 정보</h5>
            <p className="no-history">개인 설정 및 가이드</p>

            {/* ⭐ [추가] 개인정보 처리 방침 버튼 */}
            {onOpenPrivacy && (
              <button
                type="button"
                className="sidebar-privacy-btn"
                onClick={onOpenPrivacy}
              >
                개인정보 처리 방침
              </button>
            )}
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

  // FAQ 표시 상태
  const [isLandingFAQModalOpen, setIsLandingFAQModalOpen] = useState(false);

  // 사이드바 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 개인정보 처리 방침 모달 상태
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const [isUserBubbleOpen, setIsUserBubbleOpen] = useState(false);

  const toggleUserBubble = () => {
    setIsUserBubbleOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const togglePrivacyModal = () => {
    setIsPrivacyModalOpen((prev) => !prev);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
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
    setMessages([]);
    console.log("로그아웃 성공!");
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
   * 채팅 제출 핸들러
   *  - 퀵스타트 버튼, FAQ, 직접 입력 통합 처리
   * ----------------------------------------------------- */
  const handleSubmit = async (e, predefinedQuestion = null) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const rawMessage = predefinedQuestion || inputText.trim();
    if (!rawMessage || loading) return;

    // 입력 초기화
    setInputText("");

    // 실제 전송할 메시지 (필요 시, 향후 프롬프트 변환 로직 추가 가능)
    const messageToSend = rawMessage;

    // 유저 메시지 + 타이핑 메시지 추가
    const newUserMessage = {
      id: Date.now(),
      type: "user",
      text: messageToSend,
    };
    const typingMessage = { id: Date.now() + 1, type: "bot", typing: true };
    setMessages((prev) => [...prev, newUserMessage, typingMessage]);
    setLoading(true);

    // 1) 데모 응답(프론트 단) 우선 처리
    if (DEMO_RESPONSES && DEMO_RESPONSES[messageToSend]) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // 살짝 딜레이
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
      // 2) API 미설정 시, 친절한 안내 메시지(로컬 데모용)
      if (!IS_API_CONFIGURED) {
        const fallbackMessage = {
          id: Date.now() + 2,
          type: "bot",
          text:
            "현재 AI 서버 설정이 완료되지 않아, 데모용 기본 답변만 제공됩니다.\n" +
            "환경변수 REACT_APP_API_ENDPOINT가 설정되면 서울시 정책 기반의 실제 답변을 볼 수 있습니다.",
          feedback: null,
        };
        setMessages((prev) => prev.slice(0, -1).concat(fallbackMessage));
        return;
      }

      // 3) 실제 API 호출
      const payload = {
        question: messageToSend,
        user_context:
          isLoggedIn && currentUser
            ? {
                gu: currentUser.gu || null, // ✅ 'gu'로 일원화
                is_pregnant: currentUser.isPregnant === "임신 중",
                has_child: currentUser.hasChild === "유",
              }
            : null,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      console.error("API 호출 중 오류:", error);
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
   * 피드백 핸들러
   * ----------------------------------------------------- */
  const handleFeedback = async (id, feedbackType) => {
    // 1. UI 상태 업데이트
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === id) {
          if (msg.feedback === feedbackType) return { ...msg, feedback: null };
          return { ...msg, feedback: feedbackType };
        }
        return msg;
      })
    );

    // 2. 서버 전송 (설정 안 되어 있으면 스킵)
    const targetMessage = messages.find((m) => m.id === id);
    if (!IS_FEEDBACK_CONFIGURED) {
      console.warn("FEEDBACK_API_URL 미설정 - 피드백 전송 스킵");
      return;
    }

    try {
      await fetch(FEEDBACK_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType.toUpperCase(), // 'LIKE' or 'DISLIKE'
          user_id: currentUser ? currentUser.email : "anonymous",
          content: {
            answer_id: id,
            answer_text: targetMessage
              ? targetMessage.text.substring(0, 100) + "..."
              : "내용 없음",
          },
        }),
      });
      console.log(`피드백(${feedbackType}) 전송 완료`);
    } catch (e) {
      console.error("피드백 전송 실패:", e);
    }
  };

  /* -----------------------------------------------------
   * 메시지 렌더링 (마크다운 기호 제거 + 링크 버튼 처리)
   * ----------------------------------------------------- */
  const renderMessageContent = (text) => {
    if (typeof text !== "string") {
      return String(text);
    }

    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^#+\s/gm, "")
      .replace(/`([^`]+)`/g, "$1");

    const urlRegex = /(https?:\/\/[^\s)]+)/g;

    if (!cleanText.match(urlRegex)) {
      return cleanText.split("\n").map((line, idx) => (
        <span key={idx}>
          {line}
          <br />
        </span>
      ));
    }

    const parts = cleanText.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const cleanUrl = part.replace(/[)\]}>]$/, "");
        let displayText = "🔗 바로가기";

        if (cleanUrl.includes("ddm.go.kr")) {
          displayText = "🔗 동대문구청 바로가기";
        } else if (
          cleanUrl.includes(".hs.kr") ||
          cleanUrl.includes(".ms.kr")
        ) {
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
      return (
        <span key={index}>
          {part}
          <br />
        </span>
      );
    });
  };

  const toggleContactModal = () => {
    setIsContactModalOpen((prev) => !prev);
  };

  /* -----------------------------------------------------
   * '메시지 보내기' 모달 컴포넌트
   * ----------------------------------------------------- */
  const ContactModal = ({ onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleMessageSubmit = async (e) => {
      e.preventDefault();

      // 서버 설정 안 되어 있으면 안내만 띄우고 종료
      if (!IS_FEEDBACK_CONFIGURED) {
        alert(
          "문의 서버 설정이 아직 완료되지 않았습니다.\n관리자에게 FEEDBACK_API 설정을 요청해주세요."
        );
        onClose();
        return;
      }

      try {
        const response = await fetch(FEEDBACK_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "INQUIRY",
            user_id: email,
            content: {
              name: name,
              message: message,
            },
          }),
        });

        if (response.ok) {
          alert("문의가 성공적으로 접수되었습니다!");
          onClose();
        } else {
          throw new Error("전송 실패");
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
        <div className="App">
          {/* 사이드바 */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            onNewChat={handleNewChat}
            messages={messages}
            onOpenPrivacy={togglePrivacyModal}
          />

          <header className="app-header">
            <div className="header-left">
              <button
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                title="메뉴 열기"
              >
                &#9776;
              </button>

              <span
                className="logo-text"
                onClick={() => setMessages([])}
                style={{ cursor: "pointer" }}
              >
                SEOUL<span className="highlight">-I</span>
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
                    alt="프로필"
                    style={{ cursor: "pointer" }}
                  />
                  <button
                    onClick={handleLogout}
                    className="auth-button logout"
                  >
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
                  overflowY: "auto",
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
                                onClick={() =>
                                  handleFeedback(msg.id, "like")
                                }
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
                  <p className="subtitle">
                    서울의 모든 출산·보육·교육 혜택을 한눈에 확인하세요
                  </p>
                  <h2 className="title">
                    AI가 알려주는 우리 가족 맞춤 육아 정보
                  </h2>
                </div>

                <div className="quick-start-buttons">
                  <button
                    onClick={() => handleSubmit(null, "출산 준비 및 계획")}
                    className="quick-start-btn"
                  >
                    #출산 준비 및 계획
                  </button>

                  <button
                    onClick={() =>
                      handleSubmit(null, "산모신생아 건강관리")
                    }
                    className="quick-start-btn"
                  >
                    #산모신생아 건강관리
                  </button>

                  <button
                    onClick={() => setIsLandingFAQModalOpen(true)}
                    className="quick-start-btn"
                    style={{ backgroundColor: "#ffe6e6", color: "#e6007e" }}
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
                    isChatStarted
                      ? "질문을 입력하세요..."
                      : "임신 및 양육 정책 등 무엇이든 물어보세요!"
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
            <span className="tooltip-text">1:1 문의하기</span>
          </button>

          {isContactModalOpen && <ContactModal onClose={toggleContactModal} />}

          {/* 로그인 및 회원가입 모달 */}
          {isLoginModalOpen && (
            <LoginModal onClose={closeAuthModals} onLoginSuccess={handleLogin} />
          )}
          {isSignupModalOpen && (
            <SignupModal
              onClose={closeAuthModals}
              onSignupSuccess={handleSignup}
            />
          )}

          {/* 랜딩 페이지 FAQ 모달 */}
          {isLandingFAQModalOpen && (
            <LandingFAQModal
              onClose={() => setIsLandingFAQModalOpen(false)}
              onSelect={handleSubmit}
            />
          )}

          {/* 개인정보 처리 방침 모달 */}
          {isPrivacyModalOpen && (
            <PrivacyPolicyModal onClose={togglePrivacyModal} />
          )}
        </div>
      )}
    </>
  );
}

export default App;

# SEOUL-I (서울아이) — 서울시 임신·출산·육아 AI 챗봇

> **서울AI재단 산학협력 프로젝트 | 동국대학교 2025-CSC4019-03**

서울시 예비 부모 및 초보 부모를 위한 **임신·출산·육아 통합 정보 AI 챗봇**입니다.  
서울 열린데이터광장 공공 API, 정부 포털 크롤링 데이터, 수동 라벨링 정책 데이터를 결합한 **RAG(Retrieval-Augmented Generation)** 파이프라인을 통해, 사용자의 질문에 맞는 지원금·시설·프로그램 정보를 검색하고 자연어 답변을 생성합니다.

---

## 팀 구성

| 역할 | 이름 |
|------|------|
| 팀장 | 서동건 |
| 팀원 | 이예림 |
| 팀원 | 이준원 |

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [데이터 파이프라인](#3-데이터-파이프라인)
4. [백엔드 (AWS Lambda) 상세](#4-백엔드-aws-lambda-상세)
5. [프론트엔드 상세](#5-프론트엔드-상세)
6. [관련 리포지토리](#6-관련-리포지토리)
7. [로컬 실행 방법](#7-로컬-실행-방법)
8. [기술 스택](#8-기술-스택)

---

## 1. 프로젝트 개요

서울시에는 임산부·영유아 가구를 위한 지원금, 돌봄 시설, 교육 프로그램이 다양하게 존재하지만, 정보가 여러 기관·사이트에 분산되어 있어 한눈에 파악하기 어렵습니다. **SEOUL-I**는 이 문제를 해결하기 위해 다음 기능을 제공합니다.

- **자연어 질의응답** — "강남구 키움센터 목록 보여줘", "첫만남이용권 신청 자격 알려줘" 등 일상적인 문장으로 질문
- **RAG 기반 답변 생성** — 사전 수집된 정책·시설·프로그램 데이터를 검색한 뒤, LLM이 맥락을 참고해 답변 생성
- **맞춤 정책 알림** — 회원가입 시 입력한 가구 정보(거주 구, 소득 수준, 자녀 유무 등)를 기반으로 해당되는 정책을 알림
- **피드백 수집** — 답변에 대한 좋아요/싫어요 피드백을 수집하여 서비스 품질 개선에 활용

---

## 2. 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────────────────┐
│                          사용자 (브라우저)                             │
│                     React SPA  ──  SEOUL-I 프론트엔드                  │
└──────────────┬────────────────────────────────────┬──────────────────┘
               │  REST API (POST /question)         │  REST API (POST /feedback)
               ▼                                    ▼
┌──────────────────────────┐           ┌─────────────────────────────┐
│   API Gateway (AWS)      │           │   Feedback Lambda (선택)     │
└──────────┬───────────────┘           └─────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│              seoulBaby_answerGeneratorLambda  (오케스트레이터)          │
│                                                                      │
│  1. 사용자 질문 수신                                                   │
│  2. seoulBaby_queryInfoLambda 호출 → 관련 정보 검색 (Retrieve)         │
│  3. 검색 결과 + 질문으로 프롬프트 구성 (Augment)                        │
│  4. Bedrock LLM 호출 → 최종 답변 생성 (Generate)                      │
└──────────┬───────────────────────────────────────────────────────────┘
           │ Lambda Invoke
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│              seoulBaby_queryInfoLambda  (검색 엔진)                    │
│                                                                      │
│  ┌─────────────────────┐                                             │
│  │ LLM Router (Haiku)  │  질문 분석 → 데이터 소스 & 검색 필드 결정      │
│  └────────┬────────────┘                                             │
│           ├──▶ [소스 1] Manual 정책 — 벡터 유사도 검색 (Titan Embed)   │
│           ├──▶ [소스 2] Dynamic 프로그램 — 키워드 + 날짜 필터 검색      │
│           └──▶ [소스 3] API 시설/업체 — 자치구 + 유형 키워드 검색       │
│                                                                      │
│  데이터 원본: Amazon S3 (seoul-baby 버킷)                              │
└──────────────────────────────────────────────────────────────────────┘

┌──── 데이터 수집 (오프라인 / 스케줄) ────────────────────────────────────┐
│                                                                        │
│  seoulBaby_dataFetcher         서울 열린데이터광장 Open API → S3 저장    │
│  (공공 API 5종)                 semi-dynamic/*.json                     │
│                                                                        │
│  seoulBaby-site-crawler        정부 포털 4곳 웹 크롤링 → S3 저장         │
│  (GitHub Actions 스케줄)        dynamic_programs/*.json                 │
│                                                                        │
│  seoulBaby_manualDataProcessor 수동 라벨링 JSON → Titan Embed 벡터화    │
│  (수동 트리거)                   static/*_vectors.json → S3 저장        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 데이터 파이프라인

SEOUL-I가 사용하는 데이터는 갱신 주기에 따라 세 계층으로 나뉩니다.

### 3-1. Static (수동 라벨링 정책)

| 항목 | 설명 |
|------|------|
| 원본 | `static/seoulBaby_manual_labeled_data.json` — 첫만남이용권, 부모급여, 아동수당 등 핵심 정책을 직접 구조화 |
| 처리 | `seoulBaby_manualDataProcessor` Lambda가 각 정책 항목을 검색용 텍스트로 변환 후 **Amazon Titan Embed Text v2**로 벡터화 |
| 결과 | `static/seoulBaby_manual_labeled_vectors.json` — 벡터 + 원본 데이터 쌍 |
| 검색 방식 | 코사인 유사도 기반 벡터 검색 + 생애주기/자치구/정책유형 가중치 |

### 3-2. Semi-dynamic (공공 API)

| 항목 | 설명 |
|------|------|
| 수집기 | `seoulBaby_dataFetcher` Lambda |
| 데이터 소스 (5종) | 몽땅정보 만능키 (`VwSmpBizInfo`), 다둥이 행복카드 협력업체 (`InfoHappycard`), 우리동네 키움센터 (`TnFcltySttusInfo1001`), 지역아동센터 (`TnFcltySttusInfo1003`), 서울형 키즈카페 (`tnFcltySttusInfo1011`) |
| 결과 | `semi-dynamic/*.json` — 정제된 시설/업체 목록 |
| 검색 방식 | 자치구(gu) 필터 + 시설유형(facility_type) 키워드 매칭 |

### 3-3. Dynamic (웹 크롤링)

| 항목 | 설명 |
|------|------|
| 수집기 | [`seoulBaby-site-crawler`](https://github.com/LJW0907/seoulBaby-site-crawler) — GitHub Actions로 주기적 실행 |
| 크롤링 대상 (4곳) | 서울 임신출산 정보센터 보건소 교육, 서울 임신출산 정보센터 공지사항, 아이사랑 출산지원금, 서울 맘케어 공지사항 |
| 결과 | `dynamic_programs/*.json` — 최신 모집 공고·공지사항 |
| 검색 방식 | 키워드 매칭 + 날짜 필터(지난 공고 제외) + 생애주기 매칭 |

### S3 버킷 구조

```
seoul-baby/
├── static/
│   ├── seoulBaby_manual_labeled_data.json      ← 수동 라벨링 원본
│   └── seoulBaby_manual_labeled_vectors.json   ← 벡터화 결과
├── semi-dynamic/
│   ├── all_programs_info.json                  ← 몽땅정보 만능키
│   ├── happy_card_vendors.json                 ← 다둥이 행복카드 협력업체
│   ├── kium_centers.json                       ← 우리동네 키움센터
│   ├── community_child_centers.json            ← 지역아동센터
│   └── seoul_kids_cafes.json                   ← 서울형 키즈카페
└── dynamic_programs/
    ├── seoul_agi_education.json                ← 보건소 교육 공고
    ├── seoul_agi_notices.json                  ← 임신출산 정보센터 공지
    ├── childcare_support_fund.json             ← 출산지원금 소식
    └── seoul_momcare_notices.json              ← 맘케어 공지사항
```

---

## 4. 백엔드 (AWS Lambda) 상세

백엔드는 4개의 AWS Lambda 함수로 구성되며, 이 리포지토리에는 포함되어 있지 않습니다.

### 4-1. `seoulBaby_answerGeneratorLambda` — RAG 오케스트레이터

API Gateway로부터 사용자 질문을 받아 전체 RAG 프로세스를 총괄합니다.

1. **Retrieve** — `seoulBaby_queryInfoLambda`를 동기 호출하여 관련 정보 검색
2. **Augment** — 검색 결과와 사용자 질문을 결합하여 '서울맘비서' 페르소나 프롬프트 구성
3. **Generate** — Amazon Bedrock의 Claude 모델을 호출하여 최종 답변 생성

모델 호출 시 안정성을 위해 **멀티-리전, 멀티-모델 Fallback** 전략을 사용합니다.

```
우선순위: Claude 3.5 Haiku (us-east-1, us-west-2)
        → Claude 3 Haiku (ap-southeast-2)
        → Claude 3 Sonnet (ap-southeast-2, us-east-1, us-west-2)
```

### 4-2. `seoulBaby_queryInfoLambda` — 지능형 검색 엔진

사용자 질문을 분석하여 가장 적합한 데이터 소스를 선택하고 검색을 수행합니다.

**질문 라우팅 (LLM Router)**

Claude Haiku에게 질문을 보내 다음을 판단합니다.

| 소스 | 대상 데이터 | 예시 질문 |
|------|------------|----------|
| 0 (off-topic) | - | "안녕하세요", "오늘 날씨 어때?" |
| 1 (manual) | 핵심 정책·지원금 (벡터 검색) | "첫만남이용권 신청 자격", "부모급여 얼마?" |
| 2 (program) | 실시간 모집 공고 (키워드 검색) | "지금 신청 가능한 부모 교육", "최신 공지" |
| 3 (api) | 시설·업체 목록 (키워드 검색) | "관악구 키움센터 목록", "다둥이 카드 식당" |

LLM 라우팅 실패 시, 키워드 기반 Fallback 로직이 동작합니다.

**검색 알고리즘**

- **Manual (벡터 검색)**: 질문을 Titan Embed로 벡터화 → 모든 정책 벡터와 코사인 유사도 계산 → 생애주기·자치구·정책유형 가중치 적용 → 상위 5건 반환
- **Dynamic (키워드 검색)**: 키워드 매칭(20점) + 생애주기 매칭(15점) + 모집 상태 보너스(10점) + 날짜 근접성 보너스(8점) → 점수순 상위 10건
- **API (키워드 검색)**: 자치구 필터(필수, 50점) + 시설유형 매칭(30점) → 점수순 상위 15건

### 4-3. `seoulBaby_dataFetcher` — 공공 API 수집기

서울 열린데이터광장 Open API 5종을 호출하여 데이터를 정제 후 S3에 저장합니다.  
각 API별 전용 후처리 함수가 원본 데이터를 표준 구조로 변환합니다.

### 4-4. `seoulBaby_manualDataProcessor` — 벡터화 처리기

수동 라벨링된 정책 JSON을 읽어 각 항목을 검색용 텍스트로 변환한 뒤, Amazon Titan Embed Text v2로 벡터화하여 S3에 저장합니다.

---

## 5. 프론트엔드 상세

이 리포지토리의 코드는 **React** 기반 SPA(Single Page Application)입니다.

### 주요 화면 및 기능

| 기능 | 설명 |
|------|------|
| 스플래시 화면 | 앱 진입 시 3.2초간 로고 및 로딩 애니메이션 표시 |
| 랜딩 페이지 | 퀵스타트 버튼(출산 준비, 산모신생아 건강관리), 자주 묻는 질문(FAQ) 모달 |
| 채팅 인터페이스 | 사용자 질문 입력 → 타이핑 인디케이터 → AI 답변 표시, 답변 내 URL 자동 링크 변환 |
| 회원가입/로그인 | 가구 정보(거주 구, 소득, 자녀, 임신 여부 등) 입력 → 맞춤 정책 알림에 활용 |
| 맞춤 정책 알림 | `public/data/policies.csv` 기반으로 로그인 사용자의 조건에 매칭되는 정책을 알림 벨에 표시 |
| 피드백 | 각 봇 답변에 👍/👎 버튼 → 피드백 Lambda로 전송 |
| 사이드바 | 채팅 기록, 관련 포털 사이트 바로가기, 개인정보 처리 방침 |
| 1:1 문의 | 플로팅 버튼 → 이름/이메일/메시지 입력 후 전송 |

### 디렉토리 구조

```
2025-CSC4019-03-captAIn/
├── public/
│   ├── data/
│   │   └── policies.csv              ← 맞춤 알림용 정책 CSV
│   └── images/                        ← 로고, 아이콘 등 정적 이미지
├── src/
│   ├── App.js                         ← 메인 컴포넌트 (채팅, 인증, 알림 등)
│   ├── App.css                        ← 전체 스타일
│   ├── PrivacyPolicyModal.js          ← 개인정보 처리 방침 모달
│   ├── components/
│   │   └── interactive/
│   │       └── FAQList.js             ← 자주 묻는 질문 그리드 컴포넌트
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

### 환경 변수

| 변수명 | 설명 |
|--------|------|
| `REACT_APP_API_ENDPOINT` | answerGeneratorLambda의 API Gateway URL |
| `REACT_APP_FEEDBACK_ENDPOINT` | 피드백 수집 Lambda의 API Gateway URL |

미설정 시 프론트엔드 내장 데모 응답(`DEMO_RESPONSES`)이 반환됩니다.

---

## 6. 관련 리포지토리

| 리포지토리 | 설명 |
|-----------|------|
| [2025-CSC4019-03-captAIn](https://github.com/CSID-DGU/2025-CSC4019-03-captAIn) | 프론트엔드 (본 리포지토리) |
| [seoulBaby-site-crawler](https://github.com/LJW0907/seoulBaby-site-crawler) | 웹 크롤러 — 서울 임신출산 정보센터, 아이사랑, 맘케어 등 4개 사이트 크롤링, GitHub Actions로 주기적 실행 후 S3 업로드 |

> 백엔드 Lambda 함수 4종(answerGenerator, queryInfo, dataFetcher, manualDataProcessor)은 AWS 콘솔에서 직접 관리되며, 별도 리포지토리에 포함되어 있지 않습니다.

---

## 7. 로컬 실행 방법

### 프론트엔드

```bash
# 클론
git clone https://github.com/CSID-DGU/2025-CSC4019-03-captAIn.git
cd 2025-CSC4019-03-captAIn

# 의존성 설치
npm install

# (선택) 환경 변수 설정 — 없으면 데모 모드로 동작
# .env 파일 생성
echo "REACT_APP_API_ENDPOINT=https://your-api-gateway-url/prod" > .env
echo "REACT_APP_FEEDBACK_ENDPOINT=https://your-feedback-url/prod" >> .env

# 개발 서버 실행
npm start
```

`REACT_APP_API_ENDPOINT`를 설정하지 않으면, 퀵스타트 버튼 및 FAQ에 한해 프론트엔드 내장 데모 답변이 표시됩니다.

---

## 8. 기술 스택

| 계층 | 기술 |
|------|------|
| **프론트엔드** | React, CSS (반응형), Create React App |
| **백엔드** | AWS Lambda (Python 3.x), API Gateway |
| **AI / LLM** | Amazon Bedrock — Claude 3.5 Haiku, Claude 3 Sonnet (답변 생성 & 라우팅) |
| **임베딩** | Amazon Titan Embed Text v2 (벡터 검색) |
| **스토리지** | Amazon S3 |
| **데이터 수집** | 서울 열린데이터광장 Open API, Python 웹 크롤러 (GitHub Actions) |
| **맞춤 알림** | CSV 기반 프론트엔드 필터링 |

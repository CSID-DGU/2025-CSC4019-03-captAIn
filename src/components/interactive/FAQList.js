import { useState } from 'react';

function FAQList({ onSelect }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const faqs = [
    {
      text: "출산 지원금 알려줘",
      icon: "💰",
      category: "출산 지원"
    },
    {
      text: "산모 건강관리 서비스 뭐 있어?",
      icon: "🏥",
      category: "건강 관리"
    },
    {
      text: "어린이집 신청 방법 알려줘",
      icon: "🏫",
      category: "보육 시설"
    },
    {
      text: "임신부 교통비 지원돼?",
      icon: "🚌",
      category: "교통 지원"
    },
    {
      text: "육아휴직 급여 얼마나 받아?",
      icon: "👶",
      category: "육아 휴직"
    },
    {
      text: "다자녀 혜택 뭐가 있어?",
      icon: "👨‍👩‍👧‍👦",
      category: "다자녀 지원"
    }
  ];

  return (
    <div className="faq-list-container">
      {/* 섹션 헤더 */}
      <div className="faq-header-group">
        {/* 중앙 그룹 (FAQ 버튼과 양옆 라인) */}
        <div className="faq-header-center">
          {/* 왼쪽 라인 */}
          <div className="faq-line-left"></div>
          
          {/* "자주 묻는 질문" 버튼 */}
          <div className="faq-title-button">
            <svg className="faq-title-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="faq-title-text">자주 묻는 질문</span>
          </div>
          
          {/* 오른쪽 라인 */}
          <div className="faq-line-right"></div>
        </div>
        
        {/* 절대 위치로 오른쪽 끝에 배치되는 열기/접기 버튼 */}
        <div
          onClick={() => setIsOpen(prev => !prev)}
          className="faq-toggle-button"
        >
          <span className="faq-toggle-text">
            {isOpen ? '접기' : '열기'}
          </span>
          <svg 
            className={`faq-toggle-icon ${isOpen ? 'rotate' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
          
      {/* FAQ 버튼들 */}
      {isOpen && (
        <div className="faq-grid">
        {faqs.map((faq, index) => (
          <button
            key={index}
            onClick={() => {
              if (typeof onSelect === 'function') onSelect(faq.text);
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="faq-item-button"
          >
            {/* 카테고리 태그 */}
            <div className="faq-item-header">
              <span className="faq-category-tag">
                {faq.category}
              </span>
              
              {/* 호버 시 화살표 */}
              <div className={`faq-arrow-icon-wrapper ${
                hoveredIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0'
              }`}>
                <svg className="faq-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* 아이콘과 질문 텍스트 */}
            <div className="faq-item-content">
              <span className="faq-item-icon">{faq.icon}</span>
              <span className="faq-item-text">
                {faq.text}
              </span>
            </div>
            
            {/* 호버 효과 배경 */}
            <div className="faq-hover-bg" />
          </button>
        ))}
        </div>
      )}
      
      {/* 추가 질문 유도 텍스트 */}
      {isOpen && (
        <div className="faq-guidance-text">
          <p>
            다른 궁금한 점이 있으시면 아래 채팅창에 직접 질문해보세요! 
            <span style={{marginLeft: '0.25rem'}}>💬</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default FAQList;
// src/PrivacyPolicyModal.js
import React from "react";

const PrivacyPolicyModal = ({ onClose }) => {
  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div
        className="contact-modal-content privacy-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>개인정보 처리 방침</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body privacy-body">
          <p>
            SEOUL-I 서비스는 이용자의 개인정보를 안전하게 보호하기 위해
            최소한의 정보만을 수집·활용하며,
            <br />
            관련 법령(개인정보보호법 등)을 준수합니다.
          </p>
          <ul>
            <li>수집 항목: 이름, 이메일, 거주 구, 자녀 정보 등 사용자가 입력한 정보</li>
            <li>이용 목적: 맞춤형 정책 추천, 서비스 개선 및 피드백 분석</li>
            <li>보유 기간: 서비스 탈퇴 또는 삭제 요청 시까지 보관 후 지체 없이 파기</li>
            <li>문의: captAIn 프로젝트 담당자 이메일 등</li>
          </ul>
          <p style={{ marginTop: "10px" }}>
            자세한 사항은 최종 배포 시 별도의 공식 개인정보 처리 방침 문서에서
            안내될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;

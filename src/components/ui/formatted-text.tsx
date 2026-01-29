"use client";

import React from "react";

interface FormattedTextProps {
  /**
   * 포맷팅할 텍스트
   */
  text: string;
  
  /**
   * 텍스트 자르기 여부
   */
  truncate?: boolean;
  
  /**
   * 최대 표시 길이 (truncate가 true인 경우 사용)
   */
  maxLength?: number;
  
  /**
   * 스타일 클래스
   */
  className?: string;
}

/**
 * 줄바꿈이 포함된 텍스트를 HTML에서 올바르게 표시하는 컴포넌트
 * 텍스트 내의 \n 문자를 <br/> 태그로 변환하여 줄바꿈을 유지합니다.
 */
export function FormattedText({ 
  text, 
  truncate = false, 
  maxLength = 100, 
  className = "" 
}: FormattedTextProps) {
  // 텍스트가 없는 경우 처리
  if (!text) {
    return <span className={className}>-</span>;
  }
  
  // 자르기 옵션이 활성화된 경우
  if (truncate && text.length > maxLength) {
    const truncatedText = text.substring(0, maxLength) + "...";
    return (
      <span className={`${className} truncate`} title={text}>
        {truncatedText}
      </span>
    );
  }
  
  // 줄바꿈 처리
  const formattedLines = text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split("\n").length - 1 && <br />}
    </React.Fragment>
  ));
  
  return (
    <span className={`${className} whitespace-pre-line`}>
      {formattedLines}
    </span>
  );
} 
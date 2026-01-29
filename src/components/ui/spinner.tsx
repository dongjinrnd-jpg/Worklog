import React from "react";

/**
 * 로딩 상태를 표시하는 스피너 컴포넌트
 */
export function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
} 
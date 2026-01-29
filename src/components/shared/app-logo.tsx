import React from "react";
import Link from "next/link";

/**
 * 앱 로고 컴포넌트
 * 애플리케이션의 로고를 표시합니다.
 */
export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 bg-background text-primary-foreground rounded-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      </div>
      <span className="font-bold text-xl text-primary-foreground">업무일지</span>
    </Link>
  );
} 
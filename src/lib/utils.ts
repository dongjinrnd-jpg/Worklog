import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 클래스명 결합 함수
 * 여러 tailwind 클래스를 하나로 결합하고 충돌을 방지합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수
 * 스프레드시트 날짜 형식과 일치시키기 위해 사용합니다.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 문자열이 비어있는지 확인하는 함수
 * 문자열이 undefined, null, 또는 공백인지 확인합니다.
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim() === "";
}

/**
 * 지연 함수
 * 지정된 시간(ms) 동안 대기합니다.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

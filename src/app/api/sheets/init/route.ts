import { NextResponse } from 'next/server';
import { initializeSpreadsheet, validateSpreadsheetStructure } from '@/lib/createSheets';

/**
 * 스프레드시트 초기화 API
 * 필요한 시트와 구조를 생성하고 샘플 데이터 추가
 */
export async function POST() {
  try {
    // 먼저 현재 스프레드시트 구조 검증
    const isValid = await validateSpreadsheetStructure();
    
    // 유효하지 않은 경우에만 초기화 진행
    if (!isValid) {
      const result = await initializeSpreadsheet();
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: '스프레드시트가 성공적으로 초기화되었습니다.',
        });
      } else {
        return NextResponse.json({
          success: false,
          message: '스프레드시트 초기화 중 오류가 발생했습니다.',
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: true,
        message: '스프레드시트 구조가 이미 유효합니다. 초기화가 필요하지 않습니다.',
      });
    }
  } catch (error) {
    console.error('스프레드시트 초기화 API 오류:', error);
    return NextResponse.json({
      success: false,
      message: '스프레드시트 초기화 중 서버 오류가 발생했습니다.',
      error: (error as Error).message,
    }, { status: 500 });
  }
}

/**
 * 스프레드시트 구조 검증 API
 * 현재 스프레드시트 구조가 유효한지 확인
 */
export async function GET() {
  try {
    const isValid = await validateSpreadsheetStructure();
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        message: '스프레드시트 구조가 유효합니다.',
        isValid: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '스프레드시트 구조가 유효하지 않습니다. 초기화가 필요합니다.',
        isValid: false,
      }, { status: 200 }); // 200 상태 코드로 반환 (에러가 아니라 상태 정보)
    }
  } catch (error) {
    console.error('스프레드시트 검증 API 오류:', error);
    return NextResponse.json({
      success: false,
      message: '스프레드시트 검증 중 서버 오류가 발생했습니다.',
      error: (error as Error).message,
    }, { status: 500 });
  }
} 
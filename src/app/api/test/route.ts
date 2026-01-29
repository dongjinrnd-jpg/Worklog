import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/google/sheets';

/**
 * Google Sheets API 연결을 테스트하는 API 라우트
 * GET 요청을 통해 스프레드시트 연결 상태를 확인
 */
export async function GET() {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '구글 스프레드시트 연결 성공!',
        data: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '구글 스프레드시트 연결 실패',
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류 발생',
      error: (error as Error).message,
    }, { status: 500 });
  }
} 
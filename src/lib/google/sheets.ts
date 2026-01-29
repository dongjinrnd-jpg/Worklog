"use server";

import { google } from "googleapis";

/**
 * Google Sheets 클라이언트 생성 함수
 * 서비스 계정 인증을 사용하여 Google Sheets API에 접근합니다.
 */
export async function getGoogleSheetsClient() {
  try {
    // 환경 변수에서 서비스 계정 정보 가져오기
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // 민감한 정보인 서비스 계정 키는 환경 변수로 관리
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // 필수 환경 변수 검증
    if (!serviceAccountEmail || !privateKey) {
      throw new Error("Google Sheets API 인증에 필요한 환경 변수가 설정되지 않았습니다.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    return sheets;
  } catch (error) {
    console.error("Google Sheets 클라이언트 생성 실패:", error);
    throw new Error("Google Sheets API 클라이언트를 생성하는 중 오류가 발생했습니다.");
  }
}

/**
 * 스프레드시트 ID 가져오기 함수
 * 환경 변수에서 스프레드시트 ID를 가져옵니다.
 */
export async function getSpreadsheetId(): Promise<string> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error("스프레드시트 ID 환경 변수가 설정되지 않았습니다.");
  }

  return spreadsheetId;
}

/**
 * API 연결을 테스트하는 함수
 * 스프레드시트 기본 정보를 가져와서 연결 상태 확인
 */
export async function testConnection() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 스프레드시트 메타데이터 가져오기
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    console.log('연결 성공! 스프레드시트 제목:', response.data.properties?.title);
    return {
      success: true,
      sheetTitle: response.data.properties?.title,
      sheets: response.data.sheets?.map((sheet: { properties?: { title?: string } }) => sheet.properties?.title),
    };
  } catch (error) {
    console.error('API 연결 테스트 실패:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * 프로젝트 이력 추가 함수
 * 프로젝트의 변경 내역을 프로젝트이력관리 시트에 기록합니다.
 * 
 * @param historyData 프로젝트 이력 데이터
 */
export interface ProjectHistoryData {
  date?: string;        // 날짜 (기본값: 현재 날짜) (B열)
  item: string;         // ITEM (C열)
  partNo?: string;      // PART NO (D열)
  customer?: string;    // 고객사 (E열)
  managers?: string;    // 담당자 (F열)
  progress?: string;    // 업무진행사항 (G열)
  additionalPlan?: string; // 업무추가 일정계획 (H열)
  notes?: string;       // 비고 (I열)
  issues?: string;      // 애로사항 (J열)
  issueResolved?: boolean; // 애로사항 개선 여부 (K열)
  issueResolutionDetails?: string; // 애로사항 개선 내용 (L열)
  editor?: string;      // 변경자 (M열)
}

export async function addProjectHistory(historyData: ProjectHistoryData) {
  try {
    console.log('프로젝트 이력 추가 요청:', JSON.stringify(historyData, null, 2));
    
    // Google Sheets API 클라이언트 및 스프레드시트 ID 가져오기
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 현재 날짜와 시간 설정 (기본값)
    const currentDate = new Date();
    const dateStr = historyData.date || currentDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const timeStr = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS 형식
    
    // 각 필드 값 로깅 (디버깅용)
    console.log('이력 데이터 구성 값:');
    console.log('날짜 (B열):', dateStr);
    console.log('ITEM (C열):', historyData.item);
    console.log('PART NO (D열):', historyData.partNo || "");
    console.log('고객사 (E열):', historyData.customer || "");
    console.log('담당자 (F열):', historyData.managers || "");
    console.log('업무진행사항 (G열):', historyData.progress || "");
    console.log('업무추가 일정계획 (H열):', historyData.additionalPlan || "");
    console.log('비고 (I열):', historyData.notes || "");
    console.log('애로사항 (J열):', historyData.issues || "");
    console.log('애로사항 개선 여부 (K열):', historyData.issueResolved ? "O" : "");
    console.log('애로사항 개선 내용 (L열):', historyData.issueResolutionDetails || "");
    console.log('변경자 (M열):', historyData.editor || "");
    console.log('변경 시간 (N열):', timeStr);
    
    // 이력 데이터 행 구성 - 프로젝트이력관리 시트의 실제 열 구조에 맞게 정확히 배치
    const historyRow = [
      "", // A열: 순번 (스프레드시트에서 자동으로 부여)
      dateStr, // B열: 날짜
      historyData.item, // C열: ITEM
      historyData.partNo || "", // D열: PART NO
      historyData.customer || "", // E열: 고객사
      historyData.managers || "", // F열: 담당자
      historyData.progress || "", // G열: 업무진행사항
      historyData.additionalPlan || "", // H열: 업무추가 일정계획 
      historyData.notes || "", // I열: 비고
      historyData.issues || "", // J열: 애로사항
      historyData.issueResolved ? "O" : "", // K열: 애로사항 개선 여부
      historyData.issueResolutionDetails || "", // L열: 애로사항 개선 내용
      historyData.editor || "", // M열: 변경자
      timeStr, // N열: 변경 시간
    ];
    
    console.log('이력 데이터 행 배열 (인덱스:값):');
    historyRow.forEach((value, index) => {
      console.log(`${index}:${value}`); 
    });
    
    // 프로젝트이력관리 시트에 새로운 행 추가
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "프로젝트이력관리!A:N", // A~N열 범위 지정 (시트 구조에 맞게 수정)
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [historyRow]
      }
    });
    
    console.log('프로젝트 이력 추가 성공 - 응답:', JSON.stringify(appendResponse.data, null, 2));
    console.log('업데이트된 범위:', appendResponse.data.updates?.updatedRange);
    console.log('업데이트된 행 수:', appendResponse.data.updates?.updatedRows);
    console.log('업데이트된 셀 수:', appendResponse.data.updates?.updatedCells);
    return { success: true };
    
  } catch (error) {
    console.error('프로젝트 이력 추가 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '프로젝트 이력 추가 중 오류가 발생했습니다.' 
    };
  }
} 
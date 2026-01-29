"use server";

import { revalidatePath } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 업무일지 생성 데이터 타입
 * 업무일지 저장에 필요한 데이터 구조를 정의합니다.
 */
interface CreateDailyReportData {
  date: string;
  item: string;
  partNo?: string;
  customer: string;
  stage: string;
  managers: string;
  plan: string;
  performance: string;
  note: string;
}

/**
 * 업무일지 생성 결과 타입
 * 업무일지 저장 작업의 결과 데이터 구조를 정의합니다.
 */
interface CreateDailyReportResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 업무일지 생성 서버 액션
 * 업무일지 데이터를 Google 스프레드시트에 저장합니다.
 */
export async function createDailyReport(data: CreateDailyReportData): Promise<CreateDailyReportResult> {
  try {
    // 필수 필드 유효성 검증
    if (!data.date || !data.item || !data.customer || !data.stage || !data.managers) {
      return {
        success: false,
        error: "필수 항목이 누락되었습니다 (날짜, ITEM, 고객사, 단계, 담당자)."
      };
    }

    // Google Sheets 클라이언트 및 스프레드시트 ID 가져오기
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 업무일지 시트에 데이터 추가
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "업무일지!A:I", // A부터 I열까지 (날짜, ITEM, PART NO, 고객사, 단계, 담당자, 계획, 실적, 비고)
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            data.date,
            data.item,
            data.partNo || "",
            data.customer,
            data.stage,
            data.managers,
            data.plan || "",
            data.performance || "",
            data.note || ""
          ]
        ]
      }
    });

    // 메인 페이지 캐시 무효화 (업무일지 목록 업데이트)
    revalidatePath("/");
    revalidatePath("/daily-report");

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("업무일지 저장 실패:", error);
    
    return {
      success: false,
      error: "업무일지를 저장하는 중 오류가 발생했습니다."
    };
  }
} 
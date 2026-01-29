"use server";

import { formatDate } from "@/lib/utils";
import { unstable_cache as cache } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 업무일지 데이터 인터페이스
 * 업무일지 항목의 데이터 구조를 정의합니다.
 */
export interface DailyReport {
  id: string;
  date: string;
  item: string;
  partNo: string;
  customer: string;
  stage: string;
  manager: string;
  plan: string;
  performance: string;
  note: string;
}

// 업무일지 생성을 위한 데이터 타입 정의
export type CreateDailyReportData = {
  date: string;
  managers: string;
  item: string;
  partNo?: string; // PART NO를 선택값으로 변경
  stage: string;
  plan: string;
  performance: string;
  note: string;
};

/**
 * 특정 날짜의 업무일지 데이터를 가져오는 함수
 * 입력된 날짜에 해당하는 업무일지 데이터를 스프레드시트에서 조회합니다.
 */
export async function getDailyReports(date?: Date): Promise<DailyReport[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 업무일지 시트에서 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "업무일지!A2:I",  // A2부터 I열까지의 모든 데이터 (고객사 필드 추가)
    });
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    // 필터링할 날짜가 제공된 경우, 해당 날짜의 데이터만 필터링
    const today = date ? formatDate(date) : formatDate(new Date());
    
    const filteredRows = rows.filter((row: string[]) => {
      // 첫 번째 열이 날짜 필드
      const rowDate = row[0];
      return rowDate === today;
    });
    
    // 데이터를 객체 형태로 변환
    return filteredRows.map((row: string[], index: number): DailyReport => ({
      id: index.toString(),
      date: row[0] || "",
      item: row[1] || "",
      partNo: row[2] || "",
      customer: row[3] || "",
      stage: row[4] || "",
      manager: row[5] || "",
      plan: row[6] || "",
      performance: row[7] || "",
      note: row[8] || "",
    }));
  } catch (error) {
    console.error("업무일지 데이터 조회 실패:", error);
    throw new Error("업무일지 데이터를 가져오는 중 오류가 발생했습니다.");
  }
}

// 업무일지 생성 서버 액션
export async function createDailyReport(data: CreateDailyReportData) {
  try {
    // 필수값 검증
    if (!data.date) throw new Error("날짜를 선택해주세요.");
    if (!data.managers) throw new Error("담당자를 선택해주세요.");
    if (!data.item) throw new Error("ITEM을 선택해주세요.");
    if (!data.stage) throw new Error("단계를 선택해주세요.");

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 스프레드시트에 데이터 추가
    const values = [
      [
        data.date,
        data.item,
        data.partNo || '', // PART NO가 없는 경우 빈 문자열로 처리
        data.stage,
        data.managers,
        data.plan || '',
        data.performance || '',
        data.note || ''
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "업무일지!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("업무일지 저장 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "업무일지 저장 중 오류가 발생했습니다."
    };
  }
} 
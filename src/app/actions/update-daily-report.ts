"use server";

import { revalidatePath } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 날짜를 Google Sheets에서 일관되게 처리할 수 있는 형식으로 변환
 * Google Sheets는 YYYY-MM-DD 형식을 날짜로 인식합니다.
 */
function formatDateForSheets(dateString: string): string {
  if (!dateString) return "";
  
  // 이미 YYYY-MM-DD 형식인 경우 그대로 반환
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateString)) {
    return dateString.replace(/\./g, '-');
  }
  
  // YYYY/MM/DD 형식을 YYYY-MM-DD로 변환
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateString)) {
    return dateString.replace(/\//g, '-');
  }
  
  // Date 객체를 통해 변환 시도
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error("날짜 형식 변환 오류:", error);
  }
  
  // 변환할 수 없는 경우 원본 반환
  return dateString;
}

/**
 * 업무일지 데이터 인터페이스
 * 업무일지 항목의 데이터 구조를 정의합니다.
 */
export interface DailyReport {
  id: string;
  date: string;
  item: string;
  partNo: string;
  stage: string;
  manager: string;
  plan: string;
  performance: string;
  note: string;
  rowIndex?: number; // Google Sheets 행 인덱스
}

/**
 * 업무일지 데이터 업데이트 결과 인터페이스
 */
export interface UpdateResult {
  success: boolean;
  error?: string;
}

/**
 * 업무일지 데이터 업데이트 함수
 * Google Sheets API를 사용하여 업무일지 데이터를 업데이트합니다.
 * 날짜, 계획, 실적, 비고 필드 업데이트가 가능합니다.
 */
export async function updateDailyReport(report: DailyReport): Promise<UpdateResult> {
  try {
    // 행 인덱스가 없는 경우 ID를 기반으로 찾기 시도
    if (!report.rowIndex) {
      const rowIndex = await findRowIndexById(report.id);
      if (!rowIndex) {
        throw new Error("업데이트할 행을 찾을 수 없습니다.");
      }
      report.rowIndex = rowIndex;
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 업무일지 시트에서 해당 행 업데이트 - batchUpdate로 한 번에 처리
    const rowNumber = report.rowIndex + 2; // 헤더 행 고려
    
    // 날짜를 Google Sheets에서 인식할 수 있는 형식으로 변환
    const formattedDate = formatDateForSheets(report.date);
    
    // 값 업데이트와 형식 설정을 동시에 처리
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // 1. 값 업데이트
          {
            updateCells: {
              range: {
                sheetId: 0, // 첫 번째 시트 (업무일지)
                startRowIndex: rowNumber - 1,
                endRowIndex: rowNumber,
                startColumnIndex: 0, // A열 (날짜)
                endColumnIndex: 1,
              },
              rows: [
                {
                  values: [
                    {
                      userEnteredValue: { stringValue: formattedDate },
                      userEnteredFormat: {
                        numberFormat: {
                          type: "DATE",
                          pattern: "yyyy-mm-dd"
                        }
                      }
                    }
                  ]
                }
              ],
              fields: "userEnteredValue,userEnteredFormat.numberFormat"
            }
          },
          // 2. 계획, 실적, 비고 업데이트 (실제 이미지 기준 - I열 비고 포함)
          {
            updateCells: {
              range: {
                sheetId: 0,
                startRowIndex: rowNumber - 1,
                endRowIndex: rowNumber,
                startColumnIndex: 6, // G열 (계획) - 실제 이미지 기준  
                endColumnIndex: 9, // I열까지 (비고)
              },
              rows: [
                {
                  values: [
                    { userEnteredValue: { stringValue: report.plan || "" } },
                    { userEnteredValue: { stringValue: report.performance || "" } },
                    { userEnteredValue: { stringValue: report.note || "" } }
                  ]
                }
              ],
              fields: "userEnteredValue"
            }
          }
        ]
      }
    });
    
    // 캐시 무효화
    revalidatePath("/daily-report/search");
    
    return { success: true };
  } catch (error) {
    console.error("업무일지 업데이트 오류:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "업무일지 업데이트 중 오류가 발생했습니다." 
    };
  }
}

/**
 * ID를 기반으로 행 인덱스 찾기
 * 이 함수는 ID 기반으로 Google Sheets의 행 인덱스를 찾습니다.
 * 실제 구현에서는 ID와 행 인덱스 매핑 방식에 따라 구현이 달라질 수 있습니다.
 */
async function findRowIndexById(id: string): Promise<number | null> {
  try {
    // 현재는 단순히 ID를 정수로 변환하여 사용
    // 실제 구현에서는 업무일지 ID와 행 매핑 로직 필요
    const rowIndex = parseInt(id);
    return isNaN(rowIndex) ? null : rowIndex;
  } catch (error) {
    console.error("행 인덱스 찾기 오류:", error);
    return null;
  }
} 
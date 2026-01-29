"use server";

import { revalidatePath } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 업무일지 삭제 결과 인터페이스
 */
export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * 업무일지 데이터 삭제 함수
 * Google Sheets API를 사용하여 업무일지 데이터를 삭제합니다.
 * ID를 기반으로 해당 행을 찾아서 삭제합니다.
 */
export async function deleteDailyReport(reportId: string): Promise<DeleteResult> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // ID를 기반으로 행 인덱스 찾기
    const rowIndex = await findRowIndexById(reportId);
    if (!rowIndex) {
      throw new Error("삭제할 업무일지를 찾을 수 없습니다.");
    }

    // Google Sheets에서 행 삭제 - 더 간단한 방법으로 변경
    // 행 번호는 1부터 시작, 헤더 고려하여 +2
    const actualRowIndex = rowIndex + 2; 
    
    // 해당 행의 데이터를 빈 값으로 업데이트 (실질적인 삭제 효과)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `업무일지!A${actualRowIndex}:I${actualRowIndex}`, // 해당 행 전체
      valueInputOption: "RAW",
      requestBody: {
        values: [["", "", "", "", "", "", "", "", ""]], // 빈 값으로 설정
      },
    });
    
    // 빈 행을 실제로 삭제하기 위해 batchUpdate 사용 (시트 ID 없이)
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // 첫 번째 시트 (보통 업무일지 시트)
                  dimension: "ROWS",
                  startIndex: actualRowIndex - 1, // 0-based 인덱스로 변환
                  endIndex: actualRowIndex, // 한 행만 삭제
                },
              },
            },
          ],
        },
      });
    } catch (batchError) {
      console.log("행 삭제는 실패했지만 데이터 클리어는 성공:", batchError);
      // 데이터 클리어가 성공했으므로 계속 진행
    }
    
    // 캐시 무효화 - 검색 결과와 메인 페이지 갱신
    revalidatePath("/daily-report/search");
    revalidatePath("/");
    revalidatePath("/daily-report");
    
    return { success: true };
  } catch (error) {
    console.error("업무일지 삭제 오류:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "업무일지 삭제 중 오류가 발생했습니다." 
    };
  }
}

/**
 * ID를 기반으로 행 인덱스 찾기
 * 업무일지 시트에서 ID에 해당하는 데이터의 행 인덱스를 찾습니다.
 */
async function findRowIndexById(reportId: string): Promise<number | null> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 업무일지 시트의 모든 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "업무일지!A2:I", // 헤더 제외하고 데이터만 조회
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }
    
    // ID는 현재 행의 인덱스를 기반으로 생성되므로, 
    // reportId를 숫자로 변환하여 해당 인덱스의 데이터와 매칭
    const targetIndex = parseInt(reportId);
    if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= rows.length) {
      return null;
    }
    
    return targetIndex;
  } catch (error) {
    console.error("행 인덱스 찾기 오류:", error);
    return null;
  }
}



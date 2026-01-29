import { NextRequest, NextResponse } from "next/server";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google-sheets";

/**
 * 검색 옵션 데이터를 가져오는 API 핸들러
 * 담당자, ITEM, PART NO, 단계 등의 고유 값 목록을 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 업무일지 시트에서 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "업무일지!A2:E",  // 필요한 열만 가져오기
    });
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        managers: [],
        items: [],
        partNos: [],
        stages: []
      });
    }
    
    // 중복 제거 및 정렬하여 옵션 목록 생성
    const managers = [...new Set(rows.map((row: string[]) => row[4]).filter(Boolean))].sort();
    const items = [...new Set(rows.map((row: string[]) => row[1]).filter(Boolean))].sort();
    const partNos = [...new Set(rows.map((row: string[]) => row[2]).filter(Boolean))].sort();
    const stages = [...new Set(rows.map((row: string[]) => row[3]).filter(Boolean))].sort();
    
    return NextResponse.json({
      managers,
      items,
      partNos,
      stages
    });
  } catch (error) {
    console.error("검색 옵션 조회 실패:", error);
    return NextResponse.json(
      { error: "검색 옵션을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
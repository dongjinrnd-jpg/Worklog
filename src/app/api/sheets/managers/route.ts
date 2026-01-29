import { NextResponse } from "next/server";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google-sheets";

/**
 * GET 요청 핸들러
 * 담당자 목록을 Google 스프레드시트에서 가져와 반환합니다.
 */
export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 담당자 시트에서 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "담당자!A2:B", // A2부터 B열까지의 모든 데이터 (직급, 이름)
    });

    const rows = response.data.values || [];

    // 데이터를 객체 형태로 변환
    const managers = rows.map((row: string[], index: number) => ({
      id: index.toString(),
      rank: row[0] || "",
      name: row[1] || "",
    }));

    return NextResponse.json({ 
      success: true, 
      data: managers 
    });
  } catch (error) {
    console.error("담당자 데이터 조회 실패:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "담당자 데이터를 가져오는 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
} 
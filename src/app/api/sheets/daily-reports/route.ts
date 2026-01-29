import { NextResponse } from "next/server";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google-sheets";
import { formatDate } from "@/lib/utils";

/**
 * GET 요청 핸들러
 * 업무일지 목록을 Google 스프레드시트에서 가져와 반환합니다.
 * 쿼리 파라미터로 date를 받아 특정 날짜의 업무일지만 필터링할 수 있습니다.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 업무일지 시트에서 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "업무일지!A2:H", // A2부터 H열까지의 모든 데이터
    });

    const rows = response.data.values || [];
    let filteredRows = rows;
    
    // 날짜 파라미터가 있으면 해당 날짜의 데이터만 필터링
    if (dateParam) {
      const filterDate = formatDate(new Date(dateParam));
      filteredRows = rows.filter((row: string[]) => row[0] === filterDate);
    }

    // 데이터를 객체 형태로 변환
    const dailyReports = filteredRows.map((row: string[], index: number) => ({
      id: index.toString(),
      date: row[0] || "",
      item: row[1] || "",
      partNo: row[2] || "",
      stage: row[3] || "",
      manager: row[4] || "",
      plan: row[5] || "",
      performance: row[6] || "",
      note: row[7] || "",
    }));

    return NextResponse.json({ 
      success: true, 
      data: dailyReports
    });
  } catch (error) {
    console.error("업무일지 데이터 조회 실패:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "업무일지 데이터를 가져오는 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}

/**
 * POST 요청 핸들러
 * 새로운 업무일지를 Google 스프레드시트에 추가합니다.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, item, partNo, stage, manager, plan, performance, note } = body;
    
    if (!date || !item || !partNo || !stage || !manager) {
      return NextResponse.json(
        { 
          success: false, 
          error: "필수 입력 항목이 누락되었습니다." 
        },
        { status: 400 }
      );
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 업무일지 시트에 새로운 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "업무일지!A:H",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [date, item, partNo, stage, manager, plan || "", performance || "", note || ""]
        ]
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "업무일지가 추가되었습니다."
    });
  } catch (error) {
    console.error("업무일지 추가 실패:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "업무일지를 추가하는 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
} 
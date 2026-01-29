import { NextResponse } from "next/server";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * GET 요청 핸들러
 * 프로젝트 목록을 Google 스프레드시트에서 가져와 반환합니다.
 */
export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 프로젝트 시트에서 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "프로젝트!A2:M", // A2부터 M열까지의 모든 데이터
    });

    const rows = response.data.values || [];

    // 데이터를 객체 형태로 변환
    const projects = rows.map((row: string[], index: number) => ({
      id: index.toString(),
      no: row[0] || "",
      status: row[1] || "",
      client: row[2] || "",
      managers: row[3] ? row[3].split("/").map((manager: string) => manager.trim()) : [],
      item: row[4] || "",
      partNo: row[5] || "",
      developmentStage: row[6] || "",
      schedule: row[7] || "",
      currentStage: row[8] || "",
      progressStatus: row[9] || "",
      issues: row[10] || "",
      notes: row[11] || "",
      additionalPlan: row[12] || "",
    }));

    return NextResponse.json({ 
      success: true, 
      data: projects
    });
  } catch (error) {
    console.error("프로젝트 데이터 조회 실패:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "프로젝트 데이터를 가져오는 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}

/**
 * POST 요청 핸들러
 * 새로운 프로젝트를 Google 스프레드시트에 추가합니다.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      no, status, client, managers, item, partNo, developmentStage,
      schedule, currentStage, progressStatus, issues, notes, additionalPlan 
    } = body;
    
    if (!status || !client || !managers || !item || !partNo || !developmentStage || !currentStage) {
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

    // 관리자 배열을 문자열로 변환 (구분자: /)
    const managersString = Array.isArray(managers) ? managers.join("/") : managers;

    // 프로젝트 시트에 새로운 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "프로젝트!A:M",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            no || "", status, client, managersString, item, partNo, developmentStage,
            schedule || "", currentStage, progressStatus || "", issues || "", 
            notes || "", additionalPlan || ""
          ]
        ]
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "프로젝트가 추가되었습니다."
    });
  } catch (error) {
    console.error("프로젝트 추가 실패:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "프로젝트를 추가하는 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
} 
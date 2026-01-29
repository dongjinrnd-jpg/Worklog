import { createDailyReport } from "@/app/actions/daily-report";
import { deleteDailyReport } from "@/app/actions/delete-daily-report";
import { NextResponse } from "next/server";

// API 요청 데이터 타입 정의
type DailyReportRequestData = {
  date: string;
  managers: string;
  item: string;
  partNo?: string; // PART NO를 선택값으로 변경
  stage: string;
  plan: string;
  performance: string;
  note: string;
};

// POST 요청 처리 함수
export async function POST(request: Request) {
  try {
    const data: DailyReportRequestData = await request.json();

    // 필수값 검증
    if (!data.date) {
      return NextResponse.json({ error: "날짜를 선택해주세요." }, { status: 400 });
    }
    if (!data.managers) {
      return NextResponse.json({ error: "담당자를 선택해주세요." }, { status: 400 });
    }
    if (!data.item) {
      return NextResponse.json({ error: "ITEM을 선택해주세요." }, { status: 400 });
    }
    if (!data.stage) {
      return NextResponse.json({ error: "단계를 선택해주세요." }, { status: 400 });
    }

    // 서버 액션을 통해 데이터 저장
    const result = await createDailyReport(data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      { error: "업무일지 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE 요청 처리 함수 - 업무일지 삭제
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const reportId = url.searchParams.get('id');

    // ID 유효성 검증
    if (!reportId) {
      return NextResponse.json({ error: "삭제할 업무일지 ID가 필요합니다." }, { status: 400 });
    }

    // 서버 액션을 통해 데이터 삭제
    const result = await deleteDailyReport(reportId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "업무일지가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("삭제 API 오류:", error);
    return NextResponse.json(
      { error: "업무일지 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
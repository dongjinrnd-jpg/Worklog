import { NextRequest, NextResponse } from "next/server";
import { searchDailyReports, SearchParams } from "@/app/actions/search-daily-reports";

/**
 * 업무일지 검색 API 핸들러
 * 클라이언트에서 보낸 검색 요청을 처리하고 검색 결과를 응답합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params: SearchParams = {
      query: body.query,
      startDate: body.startDate,
      endDate: body.endDate,
      managers: body.managers,
      items: body.items,
      partNos: body.partNos,
      stages: body.stages,
      page: body.page || 1,
      pageSize: body.pageSize || 10,
      sortBy: body.sortBy,
      sortDirection: body.sortDirection,
    };

    const result = await searchDailyReports(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("검색 API 오류:", error);
    return NextResponse.json(
      { error: "검색 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
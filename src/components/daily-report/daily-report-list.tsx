import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyReport, getDailyReports } from "@/app/actions/daily-report";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * 오늘의 업무일지 목록 컴포넌트 타입
 * 업무일지 목록에 필요한 속성을 정의합니다.
 */
interface DailyReportListProps {
  reports?: DailyReport[];
  isLoading?: boolean;
}

/**
 * 개별 업무일지 카드 컴포넌트
 * 각 업무일지 항목을 카드 형태로 표시합니다.
 */
function DailyReportCard({ report }: { report: DailyReport }) {
  return (
    <div className="border rounded-md p-3 h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium truncate max-w-[70%]">{report.item}</span>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded whitespace-nowrap">
          {report.stage}
        </span>
      </div>
      <div className="text-sm text-muted-foreground flex-grow">
        <p className="truncate">{report.plan}</p>
        <p className="truncate">{report.performance}</p>
      </div>
      <div className="mt-2 text-xs flex justify-between items-center">
        <span>{report.manager}</span>
        <span>{report.customer}</span>
      </div>
    </div>
  );
}

/**
 * 오늘의 업무일지 목록 컴포넌트
 * 오늘 작성한 업무일지 목록을 카드 형태로 보여줍니다.
 */
export async function DailyReportList({ reports, isLoading = false }: DailyReportListProps = {}) {
  // 서버 컴포넌트에서 직접 데이터 가져오기
  const todayReports = reports || await getDailyReports(new Date());
  const todayFormatted = formatDate(new Date());

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">오늘의 업무일지</CardTitle>
        {todayReports.length > 0 && (
          <Link href="/daily-report/search" className="text-sm text-primary flex items-center">
            <Search className="h-4 w-4 mr-1" />
            모든 업무일지 검색
          </Link>
        )}
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : todayReports.length > 0 ? (
          <div>
            {/* 그리드 레이아웃으로 변경하여 한 줄에 3개씩 표시 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {todayReports.slice(0, 15).map((report) => (
                <DailyReportCard key={report.id} report={report} />
              ))}
            </div>
            
            {todayReports.length > 15 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                <Link href="/daily-report/search" className="text-primary hover:underline">
                  외 {todayReports.length - 15}개 업무일지 더보기 →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-2">
              {todayFormatted} 작성된 업무일지가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              업무일지 작성 페이지에서 새로운 업무일지를 작성해주세요.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link href="/daily-report" className="w-full">
          <Button variant="outline" className="w-full" size="sm">
            <PenLine className="h-4 w-4 mr-2" />
            업무일지 작성하기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 
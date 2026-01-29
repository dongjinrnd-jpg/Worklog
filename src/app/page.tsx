import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 서버 컴포넌트 직접 가져오기
import { DailyReportList } from '@/components/daily-report/daily-report-list';
import { ProjectList } from '@/components/project/project-list';
import { RefreshCw } from "lucide-react";

/**
 * 메인 페이지 컴포넌트
 * 앱의 메인 화면으로 주요 기능과 데이터를 보여줍니다.
 */
export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      {/* 타이틀을 정중앙에 배치 */}
      <h1 className="text-3xl md:text-4xl font-bold text-center my-8">업무일지 웹앱</h1>
      
      {/* 버튼 섹션 */}
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-3xl mb-10">
        <Link href="/daily-report" className="w-full sm:w-auto">
          <Button className="w-full px-8 py-6 text-lg" variant="default">
            업무일지 작성
          </Button>
        </Link>
        
        <Link href="/project" className="w-full sm:w-auto">
          <Button className="w-full px-8 py-6 text-lg" variant="default">
            프로젝트 관리
          </Button>
        </Link>
        
        <Button className="w-full sm:w-auto px-8 py-6 text-lg" variant="outline">
          <RefreshCw className="mr-2 h-5 w-5" />
          데이터 업데이트
        </Button>
      </div>
      
      {/* 카드 섹션 - 각각의 행에 표시하고 가로 폭은 최대한 넓게 */}
      <div className="flex flex-col w-full max-w-8xl gap-6">
        {/* 오늘의 업무일지 카드 */}
        <div className="w-full">
          <Suspense fallback={<div className="animate-pulse h-60 bg-gray-200 rounded-md"></div>}>
            <DailyReportList />
          </Suspense>
        </div>
        
        {/* 프로젝트 현황 카드 */}
        <div className="w-full">
          <Suspense fallback={<div className="animate-pulse h-60 bg-gray-200 rounded-md"></div>}>
            <ProjectList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

import { ProjectForm } from "@/components/project/project-form";
import { getManagers } from "@/app/actions/manager";
import { getItemData } from "@/app/actions/item-data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { revalidateTag } from "next/cache";

/**
 * 프로젝트 등록 페이지 로딩 플레이스홀더
 */
function ProjectFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

/**
 * 프로젝트 등록 페이지 내부 컴포넌트
 * 비동기적으로 담당자와 항목정보 데이터를 가져옵니다.
 */
async function ProjectCreatePageContent() {
  try {
    // Next.js의 서버 컴포넌트에서는 매 요청마다 최신 데이터가 제공됩니다.
    // revalidateTag 호출은 다른 페이지에서 보는 경우를 위한 것이므로,
    // 여기서는 주석 처리하여 불필요한 호출을 제거합니다.
    // revalidateTag("item-data");
    
    // 담당자 목록과 항목정보 데이터 가져오기
    const [managers, itemData] = await Promise.all([
      getManagers(),
      getItemData(),
    ]);
  
    // 데이터 디버깅을 위한 콘솔 로그 추가
    console.log('로드된 고객사 데이터:', itemData.customers);
    console.log('로드된 소속 데이터:', itemData.affiliations);
    console.log('로드된 모델 데이터:', itemData.models);
    console.log('로드된 개발업무단계 데이터:', itemData.developmentStages);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>새 프로젝트 등록</CardTitle>
              <CardDescription>새로운 프로젝트 정보를 입력해주세요.</CardDescription>
            </div>
            <Link 
              href="/project" 
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> 
              목록으로 돌아가기
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ProjectForm 
            managers={managers} 
            developmentStages={itemData.developmentStages}
            itemData={itemData}
          />
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("데이터 로딩 중 오류 발생:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>오류 발생</CardTitle>
          <CardDescription>데이터를 불러오는 중 문제가 발생했습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            시스템 관리자에게 문의하세요.
          </div>
          <div className="mt-4">
            <Link href="/project" className="flex items-center text-sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> 
              목록으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
}

/**
 * 프로젝트 등록 페이지
 * 새 프로젝트 정보를 입력할 수 있는 폼을 제공합니다.
 */
export default async function ProjectCreatePage() {
  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={<ProjectFormSkeleton />}>
        <ProjectCreatePageContent />
      </Suspense>
    </div>
  );
}

/**
 * 페이지 메타데이터
 */
export const metadata = {
  title: "프로젝트 등록 - 업무일지 웹앱",
  description: "새로운 프로젝트 정보를 등록합니다.",
}; 
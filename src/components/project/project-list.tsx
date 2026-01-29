import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, getProjects } from "@/app/actions/project";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderPlus, Search } from "lucide-react";

/**
 * 프로젝트 목록 컴포넌트 타입
 * 프로젝트 목록에 필요한 속성을 정의합니다.
 */
interface ProjectListProps {
  projects?: Project[];
  isLoading?: boolean;
}

/**
 * 일정 날짜 문자열을 시작일과 종료일로 분리하는 함수
 * 2025-01-01~2025-12-31 형식의 문자열을 분리합니다.
 */
function parseSchedule(schedule: string): { startDate: string; endDate: string } {
  const parts = schedule.split('~');
  return {
    startDate: parts[0]?.trim() || '',
    endDate: parts[1]?.trim() || ''
  };
}

/**
 * 프로젝트 카드 컴포넌트
 * 개별 프로젝트 정보를 카드 형태로 표시합니다.
 */
function ProjectCard({ project }: { project: Project }) {
  const { startDate, endDate } = parseSchedule(project.schedule);
  
  return (
    <div className="border rounded-md p-3 h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        {/* 왼쪽 상단: ITEM */}
        <span className="font-medium text-base truncate max-w-[60%]">{project.item}</span>
        
        {/* 오른쪽 상단: 시작일자, 종료일자 */}
        <div className="text-xs text-muted-foreground text-right">
          <div>시작일자: {startDate}</div>
          <div>종료일자: {endDate}</div>
        </div>
      </div>
      
      {/* 중간 섹션: 고객사, 담당자 */}
      <div className="text-sm text-muted-foreground mb-2 flex-grow">
        <p className="truncate">
          <span className="font-medium">고객사:</span> {project.client}
        </p>
        <p className="truncate">
          <span className="font-medium">담당자:</span> {project.managers.join(", ")}
        </p>
      </div>
      
      {/* 하단 섹션: 업무진행사항, 현재단계 */}
      <div className="flex justify-between items-end mt-2">
        {/* 왼쪽 하단: 업무진행사항 */}
        <span className="text-xs truncate w-2/3">{project.progressStatus}</span>
        
        {/* 오른쪽 하단: 현재단계 */}
        <span className="text-xs bg-secondary px-2 py-1 rounded ml-2 whitespace-nowrap">
          {project.currentStage}
        </span>
      </div>
    </div>
  );
}

/**
 * 프로젝트 목록 컴포넌트
 * 등록된 프로젝트 목록을 카드 형태로 보여줍니다.
 */
export async function ProjectList({ projects, isLoading = false }: ProjectListProps = {}) {
  // 서버 컴포넌트에서 직접 데이터 가져오기
  const allProjects = projects || await getProjects();
  
  // 진행여부가 '진행'인 프로젝트만 필터링
  const activeProjects = allProjects.filter(project => project.status === '진행');
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">프로젝트 현황</CardTitle>
        {activeProjects.length > 0 && (
          <Link href="/project/search" className="text-sm text-primary flex items-center">
            <Search className="h-4 w-4 mr-1" />
            모든 프로젝트 검색
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
        ) : activeProjects.length > 0 ? (
          <div>
            {/* 그리드 레이아웃으로 변경하여 한 줄에 2개씩 표시 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProjects.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            
            {activeProjects.length > 6 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                <Link href="/project" className="text-primary hover:underline">
                  외 {activeProjects.length - 6}개 프로젝트 더보기 →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-2">
              진행 중인 프로젝트가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              프로젝트 관리 페이지에서 새로운 프로젝트를 등록해주세요.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link href="/project" className="w-full">
          <Button variant="outline" className="w-full" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            프로젝트 관리하기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 
import { Project } from "@/app/actions/project";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

/**
 * 프로젝트 상태에 따른 배지 스타일을 결정하는 함수
 * 프로젝트 진행여부에 따라 다른 스타일의 배지를 반환합니다.
 */
function getStatusBadge(status: string) {
  switch (status) {
    case "진행":
      return <Badge variant="default">진행</Badge>;
    case "보유":
      return <Badge variant="outline">보유</Badge>;
    case "완료":
      return <Badge variant="secondary">완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

/**
 * 일정 날짜 문자열을 시작일과 종료일로 분리하는 함수
 * 2025-01-01~2025-12-31 형식의 문자열을 분리합니다.
 */
function formatSchedule(schedule: string): { startDate: string; endDate: string } {
  if (!schedule) return { startDate: '', endDate: '' };
  const parts = schedule.split('~');
  return {
    startDate: parts[0]?.trim() || '',
    endDate: parts[1]?.trim() || ''
  };
}

/**
 * 프로젝트 그리드 컴포넌트 속성 정의
 */
interface ProjectGridProps {
  projects: Project[];
  isLoading?: boolean;
  onEdit?: (project: Project) => void;
}

/**
 * 프로젝트 그리드 컴포넌트
 * 프로젝트 목록을 그리드 형태로 표시합니다.
 */
export function ProjectGrid({ projects, isLoading = false, onEdit }: ProjectGridProps) {  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-[200px] animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 w-2/3 bg-muted rounded mb-3"></div>
              <div className="h-3 w-full bg-muted rounded mb-2"></div>
              <div className="h-3 w-4/5 bg-muted rounded mb-2"></div>
              <div className="h-3 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-muted rounded"></div>
            </CardContent>
            <CardFooter className="border-t p-4 flex justify-end">
              <div className="h-8 w-20 bg-muted rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">등록된 프로젝트가 없습니다.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const { startDate, endDate } = formatSchedule(project.schedule);
        
        return (
          <Card key={project.id} className="h-full">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base truncate max-w-[200px]">{project.item}</span>
                  {getStatusBadge(project.status)}
                </div>
                <span className="text-sm font-semibold">No. {project.no}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">고객사:</span>
                  <span className="max-w-[60%] truncate text-right">{project.client}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">소속:</span>
                  <span className="max-w-[60%] truncate text-right">{project.affiliation || "-"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">모델:</span>
                  <span className="max-w-[60%] truncate text-right">{project.model || "-"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">PART NO:</span>
                  <span className="max-w-[60%] truncate text-right">{project.partNo || "-"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">담당자:</span>
                  <span className="max-w-[60%] truncate text-right">{project.managers.join(', ')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">현재단계:</span>
                  <span className="max-w-[60%] truncate text-right">{project.currentStage}</span>
                </div>
                
                {(startDate || endDate) && (
                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    {startDate && <div>시작: {startDate}</div>}
                    {endDate && <div>종료: {endDate}</div>}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="border-t p-3 flex justify-between items-center">
              <div className="text-xs max-w-[65%] truncate text-muted-foreground">
                {project.progressStatus || "업무진행사항 없음"}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit && onEdit(project)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                수정
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
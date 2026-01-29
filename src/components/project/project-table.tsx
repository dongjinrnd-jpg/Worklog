import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project } from "@/app/actions/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";
import { FormattedText } from "@/components/ui/formatted-text";
import React from "react";

/**
 * 프로젝트 상태에 따른 배지 스타일을 결정하는 함수
 * 프로젝트 진행여부에 따라 다른 스타일의 배지를 반환합니다.
 */
function getStatusBadge(status: string) {
  switch (status) {
    case "진행":
      return <Badge variant="progress">진행</Badge>;
    case "보류":
      return <Badge variant="hold">보류</Badge>;
    case "완료":
      return <Badge variant="completed">완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

/**
 * 일정 날짜 문자열을 시작일과 종료일로 분리하는 함수
 * 2025-01-01~2025-12-31 형식의 문자열을 분리합니다.
 */
function formatSchedule(schedule: string): string {
  if (!schedule) return "";
  const parts = schedule.split('~');
  const startDate = parts[0]?.trim() || '';
  const endDate = parts[1]?.trim() || '';
  
  if (startDate && endDate) {
    return `${startDate} ~ ${endDate}`;
  } else if (startDate) {
    return startDate;
  }
  return "";
}

/**
 * 프로젝트 테이블 컴포넌트 속성 정의
 */
interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
  onEdit?: (project: Project) => void;
}

/**
 * 프로젝트 테이블 컴포넌트
 * 프로젝트 목록을 테이블 형태로 표시합니다.
 */
export function ProjectTable({ projects, isLoading = false, onEdit }: ProjectTableProps) {
  // 확장된 행을 추적하는 상태
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 특정 행의 확장 상태를 토글하는 함수
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-14">NO</TableHead>
            <TableHead className="w-20">진행여부</TableHead>
            <TableHead className="w-32">고객사</TableHead>
            <TableHead className="w-32">소속</TableHead>
            <TableHead className="w-44">ITEM</TableHead>
            <TableHead className="w-32">PART NO</TableHead>
            <TableHead className="w-36">개발담당</TableHead>
            <TableHead className="w-28">현재단계</TableHead>
            <TableHead className="w-48">업무진행사항</TableHead>
            <TableHead className="w-48">애로사항</TableHead>
            <TableHead className="w-36">대일정</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={13} className="h-24 text-center">
                <div className="flex justify-center items-center h-16">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} className="h-24 text-center">
                등록된 프로젝트가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <React.Fragment key={project.id}>
                <TableRow 
                  className="cursor-pointer"
                  onClick={() => toggleRowExpansion(project.id)}
                >
                  <TableCell className="py-2">
                    {expandedRows[project.id] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                  <TableCell className="font-medium">{project.no}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell className="max-w-[8rem] truncate">{project.client}</TableCell>
                  <TableCell className="max-w-[8rem] truncate">{project.affiliation}</TableCell>
                  <TableCell className="max-w-[11rem] truncate">{project.item}</TableCell>
                  <TableCell className="max-w-[8rem] truncate">{project.partNo}</TableCell>
                  <TableCell className="max-w-[9rem] truncate">{project.managers.join(', ')}</TableCell>
                  <TableCell className="max-w-[7rem] truncate">{project.currentStage}</TableCell>
                  <TableCell className="max-w-[12rem] truncate">{project.progressStatus}</TableCell>
                  <TableCell className="max-w-[12rem] truncate">{project.issues}</TableCell>
                  <TableCell>{formatSchedule(project.schedule)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onEdit && onEdit(project);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">수정</span>
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows[project.id] && (
                  <TableRow>
                    <TableCell colSpan={13} className="p-4 bg-muted/50">
                      {/* 모델정보와 ITEM을 2열로 표시 */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">모델 정보</h4>
                          <div className="bg-background p-3 rounded-md">
                            <p>{project.model || "-"}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">ITEM</h4>
                          <div className="bg-background p-3 rounded-md">
                            <p>{project.item || "-"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 개발담당과 개발업무단계를 2열로 표시 */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">개발담당</h4>
                          <div className="bg-background p-3 rounded-md">
                            <p>{project.managers.join(', ') || "-"}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">개발업무단계</h4>
                          <div className="bg-background p-3 rounded-md">
                            {project.developmentStage ? (
                              <div className="flex flex-wrap gap-2">
                                {project.developmentStage.split(',').map((stage, index) => (
                                  <span 
                                    key={index}
                                    className={`inline-block px-2 py-1 rounded-md text-sm ${
                                      project.currentStage && stage.trim() === project.currentStage.trim()
                                        ? 'bg-blue-500 text-white font-medium'
                                        : ''
                                    }`}
                                  >
                                    {stage.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p>-</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">업무진행사항</h4>
                          <div className="bg-background p-3 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
                            <FormattedText text={project.progressStatus} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">애로사항</h4>
                          <div className="bg-background p-3 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
                            <FormattedText text={project.issues} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">업무추가 일정계획</h4>
                          <div className="bg-background p-3 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
                            <FormattedText text={project.additionalPlan} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">비고</h4>
                          <div className="bg-background p-3 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
                            <FormattedText text={project.notes} />
                          </div>
                        </div>
                      </div>
                      
                      {/* 재무 정보 섹션 */}
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">재무 정보</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-background p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">판매가</div>
                            <div className="text-base font-medium">
                              {project.sellingPrice 
                                ? `${Number(project.sellingPrice).toLocaleString()}원` 
                                : "-"}
                            </div>
                          </div>
                          <div className="bg-background p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">재료비</div>
                            <div className="text-base font-medium">
                              {project.materialCost 
                                ? `${Number(project.materialCost).toLocaleString()}원` 
                                : "-"}
                            </div>
                          </div>
                          <div className="bg-background p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">재료비율</div>
                            <div className="text-base font-medium">
                              {project.materialCostRatio 
                                ? `${project.materialCostRatio}%` 
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(project);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          프로젝트 수정
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 
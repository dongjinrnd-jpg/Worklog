import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp, Calendar, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * 필터 상태 인터페이스
 * 각 필터 필드의 데이터 타입을 정의합니다.
 */
interface FilterState {
  item?: string;
  partNo?: string;
  client?: string;
  affiliation?: string;  // 소속 필터 추가
  model?: string;        // 모델 필터 추가
  manager?: string;
  status?: string;
  currentStage?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 필터폼 프롭스 인터페이스
 */
interface ProjectFilterFormProps {
  onFilterChange: (filters: FilterState) => void;
  managers?: string[];  // 관리자 목록
  statuses?: string[];  // 상태 목록
  stages?: string[];    // 단계 목록
  initialFilters?: FilterState; // 초기 필터 값
}

/**
 * 프로젝트 필터 폼 컴포넌트
 * 프로젝트 목록을 필터링하는 UI를 제공합니다.
 */
export function ProjectFilterForm({ 
  onFilterChange, 
  managers = [], 
  statuses = ["진행", "보류", "완료"], 
  stages = [],
  initialFilters = {}
}: ProjectFilterFormProps) {
  // 필터 상태
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  // 필터 UI 펼침/접힘 상태
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 필터 토글 함수
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // 필터 삭제 핸들러
  const handleRemoveFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // 모든 필터 초기화
  const handleClearAllFilters = () => {
    // 진행여부만 "진행"으로 설정하고 나머지는 초기화
    const defaultFilters = { status: "진행" };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  // 활성화된 필터 개수
  const activeFilterCount = Object.keys(filters).length;
  
  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      {/* 필터 헤더 - 항상 표시됨 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          <h3 className="font-medium">
            필터
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
        </div>
        <div className="flex space-x-2">
          {activeFilterCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAllFilters}
              className="text-xs h-8 flex items-center"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              초기화
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleExpanded}
            className="h-8 w-8"
          >
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* 활성화된 필터 태그 - 항상 표시됨 */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.item && (
            <Badge variant="outline" className="flex items-center">
              ITEM: {filters.item}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("item")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">ITEM 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.partNo && (
            <Badge variant="outline" className="flex items-center">
              PART NO: {filters.partNo}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("partNo")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">PART NO 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.client && (
            <Badge variant="outline" className="flex items-center">
              고객사: {filters.client}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("client")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">고객사 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.manager && (
            <Badge variant="outline" className="flex items-center">
              개발담당: {filters.manager}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("manager")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">개발담당 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="outline" className="flex items-center">
              진행여부: {filters.status}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("status")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">진행여부 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.currentStage && (
            <Badge variant="outline" className="flex items-center">
              현재단계: {filters.currentStage}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("currentStage")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">현재단계 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="outline" className="flex items-center">
              시작일자: {filters.startDate}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("startDate")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">시작일자 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="outline" className="flex items-center">
              종료일자: {filters.endDate}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("endDate")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">종료일자 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {/* 소속 필터 태그 */}
          {filters.affiliation && (
            <Badge variant="outline" className="flex items-center">
              소속: {filters.affiliation}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("affiliation")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">소속 필터 삭제</span>
              </Button>
            </Badge>
          )}
          {/* 모델 필터 태그 */}
          {filters.model && (
            <Badge variant="outline" className="flex items-center">
              모델: {filters.model}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter("model")}
                className="h-4 w-4 ml-1 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">모델 필터 삭제</span>
              </Button>
            </Badge>
          )}
        </div>
      )}
      
      {/* 필터 폼 - 확장 시에만 표시됨 */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
          {/* ITEM 필터 */}
          <div className="space-y-2">
            <Label htmlFor="item-filter">ITEM</Label>
            <Input
              id="item-filter"
              placeholder="ITEM 검색..."
              value={filters.item || ""}
              onChange={(e) => handleFilterChange("item", e.target.value)}
              className="h-9"
            />
          </div>
          
          {/* PART NO 필터 */}
          <div className="space-y-2">
            <Label htmlFor="partNo-filter">PART NO</Label>
            <Input
              id="partNo-filter"
              placeholder="PART NO 검색..."
              value={filters.partNo || ""}
              onChange={(e) => handleFilterChange("partNo", e.target.value)}
              className="h-9"
            />
          </div>
          
          {/* 고객사 필터 */}
          <div className="space-y-2">
            <Label htmlFor="client-filter">고객사</Label>
            <Input
              id="client-filter"
              placeholder="고객사 검색..."
              value={filters.client || ""}
              onChange={(e) => handleFilterChange("client", e.target.value)}
              className="h-9"
            />
          </div>
          
          {/* 소속 필터를 SelectTrigger로 수정 */}
          <div className="space-y-2">
            <Label htmlFor="affiliation-filter">소속</Label>
            <Select
              value={filters.affiliation || ""}
              onValueChange={(value) => handleFilterChange("affiliation", value)}
            >
              <SelectTrigger id="affiliation-filter" className="h-9">
                <SelectValue placeholder="소속 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전장">전장</SelectItem>
                <SelectItem value="유압">유압</SelectItem>
                <SelectItem value="전산">전산</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 모델 필터 추가 */}
          <div className="space-y-2">
            <Label htmlFor="model-filter">모델</Label>
            <Input
              id="model-filter"
              placeholder="모델 검색..."
              value={filters.model || ""}
              onChange={(e) => handleFilterChange("model", e.target.value)}
              className="h-9"
            />
          </div>
          
          {/* 개발담당 필터 */}
          <div className="space-y-2">
            <Label htmlFor="manager-filter">개발담당</Label>
            <Select
              value={filters.manager || ""}
              onValueChange={(value) => handleFilterChange("manager", value)}
            >
              <SelectTrigger id="manager-filter" className="h-9">
                <SelectValue placeholder="개발담당 선택" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 진행여부 필터 */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">진행여부</Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status-filter" className="h-9">
                <SelectValue placeholder="진행여부 선택" />
              </SelectTrigger>
              <SelectContent>
                {["진행", "보류", "완료"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 현재단계 필터 */}
          <div className="space-y-2">
            <Label htmlFor="stage-filter">현재단계</Label>
            <Select
              value={filters.currentStage || ""}
              onValueChange={(value) => handleFilterChange("currentStage", value)}
            >
              <SelectTrigger id="stage-filter" className="h-9">
                <SelectValue placeholder="현재단계 선택" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 대일정 시작일자 필터 - 형식 수정 */}
          <div className="space-y-2">
            <Label htmlFor="start-date-filter">대일정 시작일자</Label>
            <div className="relative">
              <Input
                id="start-date-filter"
                type="text"
                placeholder={`${new Date().getFullYear() - 1}-01-01`}
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="h-9 pl-9"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* 대일정 종료일자 필터 - 형식 수정 */}
          <div className="space-y-2">
            <Label htmlFor="end-date-filter">대일정 종료일자</Label>
            <div className="relative">
              <Input
                id="end-date-filter"
                type="text"
                placeholder={`${new Date().getFullYear()}-12-31`}
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="h-9 pl-9"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, SortAsc, SortDesc, Grid3X3, List } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * 헤더 컴포넌트 속성 정의
 */
interface ProjectHeaderProps {
  onCreateProject: () => void;
  onSortChange: (value: string) => void;
  onViewChange: (value: 'table' | 'grid') => void;
  viewMode: 'table' | 'grid';
  sortBy: string;
}

/**
 * 프로젝트 헤더 컴포넌트
 * 페이지 제목, 새 프로젝트 등록 버튼, 정렬 옵션 등을 제공합니다.
 */
export function ProjectHeader({ 
  onCreateProject, 
  onSortChange, 
  onViewChange,
  viewMode = 'table',
  sortBy = 'no-desc' 
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-3xl font-bold">프로젝트 관리</h2>
      
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
        {/* 정렬 옵션 */}
        <div className="flex items-center mr-auto sm:mr-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-asc">번호 (오름차순)</SelectItem>
              <SelectItem value="no-desc">번호 (내림차순)</SelectItem>
              <SelectItem value="client-asc">고객사 (오름차순)</SelectItem>
              <SelectItem value="client-desc">고객사 (내림차순)</SelectItem>
              <SelectItem value="item-asc">ITEM (오름차순)</SelectItem>
              <SelectItem value="item-desc">ITEM (내림차순)</SelectItem>
              <SelectItem value="startDate-asc">시작일 (오름차순)</SelectItem>
              <SelectItem value="startDate-desc">시작일 (내림차순)</SelectItem>
              <SelectItem value="endDate-asc">종료일 (오름차순)</SelectItem>
              <SelectItem value="endDate-desc">종료일 (내림차순)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* 뷰 전환 버튼 */}
        <div className="flex space-x-1">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={() => onViewChange('table')}
          >
            <List className="h-5 w-5" />
            <span className="sr-only">테이블 뷰</span>
          </Button>
          
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={() => onViewChange('grid')}
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="sr-only">그리드 뷰</span>
          </Button>
        </div>
        
        {/* 새 프로젝트 등록 버튼 */}
        <Button 
          className="w-full sm:w-auto" 
          onClick={onCreateProject}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          새 프로젝트 등록
        </Button>
      </div>
    </div>
  );
} 
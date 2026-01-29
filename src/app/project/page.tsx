"use client";

import { useState, useEffect } from "react";
import { ProjectTable } from "@/components/project/project-table";
import { ProjectGrid } from "@/components/project/project-grid";
import { ProjectFilterForm } from "@/components/project/project-filter-form";
import { ProjectHeader } from "@/components/project/project-header";
import { Project, getProjects } from "@/app/actions/project";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProjectForm } from "@/components/project/project-form";
import { ProjectUpdateForm } from "@/components/project/project-update-form";
import { toast } from "sonner";
import { RefreshButton } from "@/components/shared/refresh-button";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";

/**
 * 프로젝트 관리 페이지
 * 프로젝트 목록 조회, 필터링, 정렬, 페이지네이션 기능을 제공합니다.
 */
export default function ProjectPage() {
  // 상태 관리
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<string>('no-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // 담당자 및 개발업무단계 추가
  const [formManagers, setFormManagers] = useState<any[]>([]);
  const [developmentStages, setDevelopmentStages] = useState<any[]>([]);
  const [formItemData, setFormItemData] = useState<any>({ customers: [], affiliations: [], models: [], developmentStages: [] });
  const [loadingFormData, setLoadingFormData] = useState(false);
  // 필터 상태 추가
  const [filters, setFilters] = useState<any>({ status: "진행" });
  
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  // 담당자 목록 추출 (중복 제거) - 필터용
  const filterManagers = Array.from(
    new Set(
      projects.flatMap(project => project.managers)
    )
  ).filter(Boolean);
  
  // 현재단계 목록 추출 (중복 제거)
  const stages = Array.from(
    new Set(
      projects.map(project => project.currentStage)
    )
  ).filter(Boolean);
  
  // 페이지 로드시 데이터 초기화
  useEffect(() => {
    // 프로젝트 목록 초기 로드
    const loadProjects = async () => {
      try {
        setLoading(true);
        
        // 페이지 로드시 캐시 데이터를 강제로 갱신
        try {
          await fetch('/api/revalidate?tag=projects', { method: 'POST' });
        } catch (err) {
          console.error("캐시 무효화 요청 실패:", err);
          // 요청이 실패해도 계속 진행
        }
        
        const data = await getProjects();
        setProjects(data);
        
        // 초기 로드 시 진행여부가 "진행"인 프로젝트만 필터링
        const initialFilteredProjects = data.filter(project => project.status === "진행");
        
        // NO 기준 내림차순으로 정렬 (최신 프로젝트가 위에 오도록)
        const sortedProjects = [...initialFilteredProjects].sort((a, b) => {
          const numA = parseInt(a.no) || 0;
          const numB = parseInt(b.no) || 0;
          return numB - numA; // 내림차순 정렬
        });
        
        setFilteredProjects(sortedProjects);
        
        setLoading(false);
      } catch (error) {
        console.error('프로젝트 데이터 로드 오류:', error);
        setLoading(false);
        toast({
          title: "프로젝트 로드 실패",
          description: "프로젝트 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    
    loadProjects();
  }, []);
  
  // 일정 문자열에서 시작일과 종료일 추출하는 함수
  const parseSchedule = (schedule: string): { startDate: string; endDate: string } => {
    if (!schedule) return { startDate: '', endDate: '' };
    const parts = schedule.split('~');
    return {
      startDate: parts[0]?.trim() || '',
      endDate: parts[1]?.trim() || ''
    };
  };
  
  // 필터링 처리
  const handleFilterChange = (newFilters: any) => {
    // 현재 필터 상태 업데이트
    setFilters(newFilters);
    
    let result = [...projects];
    
    // ITEM 필터
    if (newFilters.item) {
      result = result.filter(project => 
        project.item.toLowerCase().includes(newFilters.item.toLowerCase())
      );
    }
    
    // PART NO 필터
    if (newFilters.partNo) {
      result = result.filter(project => 
        project.partNo.toLowerCase().includes(newFilters.partNo.toLowerCase())
      );
    }
    
    // 고객사 필터
    if (newFilters.client) {
      result = result.filter(project => 
        project.client.toLowerCase().includes(newFilters.client.toLowerCase())
      );
    }
    
    // 소속 필터
    if (newFilters.affiliation) {
      result = result.filter(project => 
        project.affiliation === newFilters.affiliation
      );
    }
    
    // 모델 필터
    if (newFilters.model) {
      result = result.filter(project => 
        project.model.toLowerCase().includes(newFilters.model.toLowerCase())
      );
    }
    
    // 담당자 필터
    if (newFilters.manager) {
      result = result.filter(project => 
        project.managers.some(manager => 
          manager.toLowerCase().includes(newFilters.manager.toLowerCase())
        )
      );
    }
    
    // 진행여부 필터
    if (newFilters.status) {
      result = result.filter(project => project.status === newFilters.status);
    }
    
    // 현재단계 필터
    if (newFilters.currentStage) {
      result = result.filter(project => project.currentStage === newFilters.currentStage);
    }
    
    // 대일정 시작일자 필터
    if (newFilters.startDate) {
      result = result.filter(project => {
        const { startDate } = parseSchedule(project.schedule);
        if (!startDate) return false;
        
        // YYYY-MM-DD 형식 비교
        return startDate >= newFilters.startDate;
      });
    }
    
    // 대일정 종료일자 필터
    if (newFilters.endDate) {
      result = result.filter(project => {
        const { endDate } = parseSchedule(project.schedule);
        if (!endDate) return false;
        
        // YYYY-MM-DD 형식 비교
        return endDate <= newFilters.endDate;
      });
    }
    
    setFilteredProjects(result);
    setCurrentPage(1); // 필터링 시 첫 페이지로 이동
  };
  
  // 정렬 처리
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    const [field, direction] = value.split('-');
    const sorted = [...filteredProjects].sort((a, b) => {
      if (field === 'no') {
        const numA = parseInt(a.no) || 0;
        const numB = parseInt(b.no) || 0;
        return direction === 'asc' ? numA - numB : numB - numA;
      } else if (field === 'client') {
        return direction === 'asc' 
          ? a.client.localeCompare(b.client)
          : b.client.localeCompare(a.client);
      } else if (field === 'item') {
        return direction === 'asc' 
          ? a.item.localeCompare(b.item)
          : b.item.localeCompare(a.item);
      } else if (field === 'startDate') {
        // 대일정 시작일 기준 정렬
        const scheduleA = parseSchedule(a.schedule);
        const scheduleB = parseSchedule(b.schedule);
        
        // 날짜가 없는 경우 맨 뒤로 정렬
        if (!scheduleA.startDate) return direction === 'asc' ? 1 : -1;
        if (!scheduleB.startDate) return direction === 'asc' ? -1 : 1;
        
        return direction === 'asc'
          ? scheduleA.startDate.localeCompare(scheduleB.startDate)
          : scheduleB.startDate.localeCompare(scheduleA.startDate);
      } else if (field === 'endDate') {
        // 대일정 종료일 기준 정렬
        const scheduleA = parseSchedule(a.schedule);
        const scheduleB = parseSchedule(b.schedule);
        
        // 날짜가 없는 경우 맨 뒤로 정렬
        if (!scheduleA.endDate) return direction === 'asc' ? 1 : -1;
        if (!scheduleB.endDate) return direction === 'asc' ? -1 : 1;
        
        return direction === 'asc'
          ? scheduleA.endDate.localeCompare(scheduleB.endDate)
          : scheduleB.endDate.localeCompare(scheduleA.endDate);
      }
      return 0;
    });
    
    setFilteredProjects(sorted);
  };
  
  // 페이지네이션 처리
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentItems = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // 프로젝트 수정 핸들러
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    
    // 필요한 데이터 가져오기
    const loadEditFormData = async () => {
      try {
        setLoadingFormData(true);
        
        // 모달 열기 전에 항목정보 캐시 데이터를 강제로 갱신
        try {
          console.log("항목정보 캐시 데이터 무효화 요청 시작");
          await fetch('/api/revalidate?tag=item-data', { method: 'POST' });
          console.log("항목정보 캐시 데이터 무효화 요청 완료");
        } catch (err) {
          console.error("캐시 무효화 요청 실패:", err);
          // 요청이 실패해도 계속 진행
        }
        
        console.log("프로젝트 수정을 위한 데이터 로드 시작");
        
        // 필요한 데이터 가져오기
        const [managersData, itemData] = await Promise.all([
          import('@/app/actions/manager').then(module => module.getManagers()),
          import('@/app/actions/item-data').then(module => module.getItemData())
        ]);
        
        console.log("담당자 데이터 로드 완료:", managersData.length + "명");
        console.log("항목정보 데이터 로드 완료:", {
          "고객사": itemData.customers?.length || 0,
          "소속": itemData.affiliations?.length || 0,
          "모델": itemData.models?.length || 0,
          "개발업무단계": itemData.developmentStages?.length || 0
        });
        
        setFormManagers(managersData);
        setDevelopmentStages(itemData.developmentStages);
        setFormItemData(itemData); // 전체 itemData 저장
        
        console.log("formItemData 설정 완료:", itemData);
        
        setLoadingFormData(false);
        setIsEditDialogOpen(true);
      } catch (error) {
        console.error("데이터 로드 오류:", error);
        toast({
          title: "데이터 로드 실패",
          description: "프로젝트 수정에 필요한 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        setLoadingFormData(false);
      }
    };
    
    loadEditFormData();
  };
  
  // 수정 완료 핸들러
  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false);
    
    // 프로젝트 목록 새로고침
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      
      // 필터 적용
      handleFilterChange(filters);
      
      toast({
        title: "프로젝트 수정 완료",
        description: "프로젝트가 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      console.error("프로젝트 데이터 새로고침 오류:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // 프로젝트 생성 액션 핸들러
  const handleCreateProject = async () => {
    try {
      setLoadingFormData(true);
      
      // 모달 열기 전에 항목정보 캐시 데이터를 강제로 갱신
      try {
        console.log("프로젝트 생성: 항목정보 캐시 데이터 무효화 요청 시작");
        await fetch('/api/revalidate?tag=item-data', { method: 'POST' });
        console.log("프로젝트 생성: 항목정보 캐시 데이터 무효화 요청 완료");
      } catch (err) {
        console.error("캐시 무효화 요청 실패:", err);
        // 요청이 실패해도 계속 진행
      }
      
      console.log("프로젝트 생성을 위한 데이터 로드 시작");
      
      // 필요한 데이터 가져오기
      const [managersData, itemData] = await Promise.all([
        import('@/app/actions/manager').then(module => module.getManagers()),
        import('@/app/actions/item-data').then(module => module.getItemData())
      ]);
      
      console.log("프로젝트 생성: 담당자 데이터 로드 완료:", managersData.length + "명");
      console.log("프로젝트 생성: 항목정보 데이터 로드 완료:", {
        "고객사": itemData.customers?.length || 0,
        "소속": itemData.affiliations?.length || 0,
        "모델": itemData.models?.length || 0,
        "개발업무단계": itemData.developmentStages?.length || 0
      });
      
      setFormManagers(managersData);
      setDevelopmentStages(itemData.developmentStages);
      setFormItemData(itemData); // 전체 itemData 저장
      
      console.log("프로젝트 생성: formItemData 설정 완료:", itemData);
      
      setLoadingFormData(false);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
      toast({
        title: "데이터 로드 실패",
        description: "프로젝트 생성에 필요한 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setLoadingFormData(false);
    }
  };
  
  // 생성 완료 핸들러
  const handleCreateSuccess = async () => {
    setIsCreateDialogOpen(false);
    
    // 프로젝트 목록 새로고침
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      
      // 진행여부가 "진행"인 프로젝트만 필터링하도록 필터 설정
      const newFilters = { ...filters };
      if (!newFilters.status) {
        newFilters.status = "진행";
      }
      
      // 필터 적용
      handleFilterChange(newFilters);
      
      toast({
        title: "프로젝트 목록 업데이트",
        description: "프로젝트 목록이 새로고침되었습니다.",
      });
    } catch (error) {
      console.error("프로젝트 데이터 새로고침 오류:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 페이지네이션 컴포넌트 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageItems = [];
    const maxVisiblePages = 5;
    
    // 이전 페이지 버튼
    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) handlePageChange(currentPage - 1);
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // 페이지 번호 버튼
    if (totalPages <= maxVisiblePages) {
      // 페이지 수가 적을 경우 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // 페이지 수가 많을 경우 일부만 표시
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // 첫 페이지
      if (startPage > 1) {
        pageItems.push(
          <PaginationItem key={1}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        );
        
        // 생략 표시
        if (startPage > 2) {
          pageItems.push(
            <PaginationItem key="ellipsis1">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
      }
      
      // 중간 페이지들
      for (let i = startPage; i <= endPage; i++) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // 마지막 페이지
      if (endPage < totalPages) {
        // 생략 표시
        if (endPage < totalPages - 1) {
          pageItems.push(
            <PaginationItem key="ellipsis2">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        
        pageItems.push(
          <PaginationItem key={totalPages}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // 다음 페이지 버튼
    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) handlePageChange(currentPage + 1);
          }}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    return (
      <Pagination className="mt-6">
        <PaginationContent>
          {pageItems}
        </PaginationContent>
      </Pagination>
    );
  };
  
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">프로젝트 관리</h1>
          <p className="text-muted-foreground">
            프로젝트 정보를 조회하고 관리할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <RefreshButton
            returnData={true}
            reloadPageAfterRefresh={false}
            buttonText="프로젝트 목록 갱신"
            onRefreshSuccess={(data) => {
              // 서버에서 가져온 최신 프로젝트 데이터로 업데이트
              if (data && data.projects) {
                setProjects(data.projects);
                
                // 진행여부가 "진행"인 프로젝트만 필터링하도록 필터 설정
                const newFilters = { ...filters };
                if (!newFilters.status) {
                  newFilters.status = "진행";
                }
                
                // 필터 적용
                handleFilterChange(newFilters);
                
                toast({
                  title: "데이터 갱신 완료",
                  description: "프로젝트 목록이 최신 데이터로 업데이트되었습니다.",
                });
              }
            }}
          />
          <Button onClick={handleCreateProject} disabled={loadingFormData}>
            {loadingFormData ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                로드 중...
              </>
            ) : (
              <>
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                새 프로젝트 등록
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* 필터 패널 */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">필터링</h2>
        <ProjectFilterForm 
          onFilterChange={handleFilterChange}
          managers={filterManagers}
          stages={stages}
          initialFilters={filters} // 초기 필터 값 전달
        />
      </div>
      
      {/* 프로젝트 목록 (테이블 또는 그리드 뷰) */}
      {viewMode === 'table' ? (
        <ProjectTable 
          projects={currentItems}
          isLoading={loading}
          onEdit={handleEditProject}
        />
      ) : (
        <ProjectGrid
          projects={currentItems}
          isLoading={loading}
          onEdit={handleEditProject}
        />
      )}
      
      {/* 페이지네이션 */}
      {renderPagination()}
      
      {/* 새 프로젝트 등록 모달 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent 
          className="max-w-[50rem] max-h-[90vh] overflow-y-auto"
          aria-describedby="create-project-description"
          aria-labelledby="create-project-title"
        >
          <DialogHeader>
            <DialogTitle id="create-project-title">새 프로젝트 등록</DialogTitle>
            <DialogDescription id="create-project-description">
              새로운 프로젝트 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingFormData ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ProjectForm 
                managers={formManagers} 
                developmentStages={developmentStages}
                itemData={formItemData}
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 프로젝트 수정 모달 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent 
          className="max-w-[70rem]"
          aria-describedby="edit-project-description"
          aria-labelledby="edit-project-title"
        >
          <DialogHeader>
            <DialogTitle id="edit-project-title">프로젝트 수정</DialogTitle>
            <DialogDescription id="edit-project-description">
              프로젝트 정보를 수정해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingFormData ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : selectedProject && (
              <ProjectUpdateForm 
                project={selectedProject}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={handleEditSuccess}
                managers={formManagers.map(m => ({ id: m.id || '', rank: m.rank || '', name: m.name || '' }))}
                developmentStages={Array.isArray(developmentStages) ? developmentStages : []}
                itemData={formItemData}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
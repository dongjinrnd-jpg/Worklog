"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { SearchResult } from "@/app/actions/search-daily-reports";
import { DailyReport } from "@/app/actions/daily-report";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format } from "date-fns";
import { FormattedText } from "@/components/ui/formatted-text";
import { ChevronRight, ChevronDown, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExpandedRow } from "./expanded-row";
import { searchAllDailyReports, type SearchParams } from "@/app/actions/search-daily-reports";
import { useToast } from "@/components/ui/use-toast";

interface SearchResultsComponentProps {
  results: SearchResult;
  onPageChange: (page: number) => void;
  searchParams: SearchParams; // 검색 매개변수 추가
  onRefresh?: () => void; // 검색 결과 새로고침 콜백 추가
}

/**
 * 검색 결과 표시 컴포넌트
 * 검색된 업무일지 데이터를 테이블 형태로 표시하고 페이지네이션을 제공합니다.
 */
export function SearchResults({ results, onPageChange, searchParams, onRefresh }: SearchResultsComponentProps) {
  const { data: initialData, total, page, pageSize } = results;
  const totalPages = Math.ceil(total / pageSize);
  const router = useRouter();
  const forceUpdate = useRef(0);
  const { toast } = useToast();
  
  // 행 데이터 상태 관리 - 업데이트 지원을 위해 state로 관리
  const [data, setData] = useState<DailyReport[]>(initialData);
  
  // CSV 다운로드 상태 관리
  const [isDownloading, setIsDownloading] = useState(false);
  
  // props로 받는 결과 데이터가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setData(initialData);
  }, [initialData]);
  
  // 행 확장 상태 관리
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // 행 확장/축소 토글 핸들러
  const toggleRowExpand = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 버블링 방지
    setExpandedRows(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  // 수정 페이지로 이동 핸들러
  const handleEdit = (report: DailyReport) => {
    // 수정 페이지로 이동 전 데이터 저장
    localStorage.setItem('editReport', JSON.stringify(report));
    router.push(`/daily-report/edit/${report.id}`);
  };
  
  // 업무일지 데이터 업데이트 핸들러
  const handleReportUpdate = (updatedReport: DailyReport) => {
    // 데이터 배열의 해당 항목을 업데이트된 버전으로 교체
    setData(prevData => {
      const newData = prevData.map(report => 
        report.id === updatedReport.id ? {...report, ...updatedReport} : report
      );
      
      // 로컬 스토리지에도 업데이트된 데이터 저장
      const searchState = localStorage.getItem('searchState');
      if (searchState) {
        try {
          const parsedState = JSON.parse(searchState);
          if (parsedState.results && parsedState.results.data) {
            parsedState.results.data = parsedState.results.data.map((item: DailyReport) => 
              item.id === updatedReport.id ? {...item, ...updatedReport} : item
            );
            localStorage.setItem('searchState', JSON.stringify(parsedState));
          }
        } catch (error) {
          console.error("검색 상태 업데이트 오류:", error);
        }
      }
      
      // 강제 리렌더링을 위한 카운터 증가
      forceUpdate.current += 1;
      
      return newData;
    });
  };

  // 업무일지 삭제 핸들러
  const handleReportDelete = async (reportId: string) => {
    try {
      // API 호출하여 서버에서 삭제
      const response = await fetch(`/api/daily-report?id=${reportId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "삭제 중 오류가 발생했습니다.");
      }

      // 삭제된 항목의 확장된 행 닫기
      setExpandedRows(prev => {
        const newExpandedRows = { ...prev };
        delete newExpandedRows[reportId];
        return newExpandedRows;
      });

      // 성공 알림 표시
      toast({
        title: "삭제 완료",
        description: "업무일지가 성공적으로 삭제되었습니다.",
      });

      // 검색 결과 새로고침 (서버에서 최신 데이터 가져오기)
      if (onRefresh) {
        // 약간의 지연 후 새로고침 (삭제 처리 완료 대기)
        setTimeout(() => {
          onRefresh();
        }, 500);
      }

    } catch (error) {
      // 오류 알림 표시
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "업무일지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // CSV 다운로드 함수 수정 - 모든 검색 결과 포함
  const downloadAsCsv = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      console.log("=== CSV 다운로드 디버깅 시작 ===");
      console.log("현재 페이지 데이터 건수:", data.length);
      console.log("총 검색 결과 건수:", total);
      console.log("현재 페이지:", page, "/", totalPages);
      console.log("전달받은 searchParams:", searchParams);
      
      // 검색 매개변수에서 페이지네이션 관련 정보 제거
      const { page: currentPage, pageSize: currentPageSize, ...downloadParams } = searchParams;
      
      console.log("CSV용 검색 매개변수 (페이지네이션 제거):", downloadParams);
      
      // 모든 검색 결과 가져오기
      const allResults = await searchAllDailyReports(downloadParams);
      
      console.log("searchAllDailyReports 호출 결과:");
      console.log("- 가져온 데이터 건수:", allResults.length);
      console.log("- 예상 건수:", total);
      console.log("- 첫 번째 데이터:", allResults[0]);
      console.log("- 마지막 데이터:", allResults[allResults.length - 1]);
      
      if (allResults.length === 0) {
        toast({
          title: "다운로드 실패",
          description: "다운로드할 데이터가 없습니다.",
          variant: "destructive",
        });
        return;
      }
      
      // 실제 다운로드되는 데이터와 예상 데이터 비교
      if (allResults.length !== total) {
        console.warn("⚠️ 경고: 실제 데이터 건수와 예상 건수가 다릅니다!");
        console.warn("실제:", allResults.length, "예상:", total);
      }
      
      // CSV 헤더
      const headers = ["날짜", "ITEM", "PART NO", "고객사", "단계", "담당자", "계획", "실적", "비고"];
      
      // 데이터 행 구성
      const csvData = allResults.map((item: DailyReport) => [
        item.date,
        item.item,
        item.partNo,
        item.customer,
        item.stage,
        item.manager,
        item.plan,
        item.performance,
        item.note
      ]);
      
      console.log("CSV 데이터 구성 완료:");
      console.log("- 헤더:", headers);
      console.log("- 데이터 행 수:", csvData.length);
      console.log("- 첫 번째 행:", csvData[0]);
      
      // CSV 포맷으로 변환
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      // 총 라인 수 확인 (헤더 + 데이터)
      const totalLines = csvContent.split('\n').length;
      console.log("CSV 총 라인 수 (헤더 포함):", totalLines);
      console.log("예상 라인 수:", allResults.length + 1); // 헤더 1줄 + 데이터
      
      // BOM(Byte Order Mark)을 추가하여 한글 인코딩 문제 해결
      const BOM = "\uFEFF";
      const csvContentWithBOM = BOM + csvContent;
      
      // Blob 생성 및 다운로드 - 인코딩을 명시적으로 지정
      const blob = new Blob([csvContentWithBOM], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `업무일지_검색결과_${format(new Date(), "yyyyMMdd")}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("CSV 파일 다운로드 완료");
      console.log("=== CSV 다운로드 디버깅 끝 ===");
      
      // 성공 알림 - 더 자세한 정보 제공
      const expectedTotal = total; // 예상되는 전체 건수
      const actualDownloaded = allResults.length; // 실제 다운로드된 건수
      
      if (actualDownloaded === expectedTotal) {
        toast({
          title: "다운로드 완료 ✅",
          description: `검색된 모든 ${actualDownloaded}건의 데이터가 성공적으로 다운로드되었습니다.`,
        });
      } else {
        toast({
          title: "다운로드 완료 ⚠️",
          description: `다운로드 완료: ${actualDownloaded}건 (예상: ${expectedTotal}건) - 콘솔을 확인하세요.`,
        });
      }
      
    } catch (error) {
      console.error("CSV 다운로드 오류:", error);
      toast({
        title: "다운로드 실패",
        description: "CSV 파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // 페이지네이션 링크 생성
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // 이전 버튼
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => page > 1 && onPageChange(page - 1)}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""} 
        />
      </PaginationItem>
    );
    
    // 첫 페이지
    if (page > 3) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (page > 4) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // 페이지 숫자
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === page}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // 마지막 페이지
    if (page < totalPages - 2) {
      if (page < totalPages - 3) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // 다음 버튼
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => page < totalPages && onPageChange(page + 1)}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""} 
        />
      </PaginationItem>
    );
    
    return items;
  };
  
  // 확장된 행의 내용만 표시하는 래퍼 컴포넌트
  const ExpandedRowContent = ({ report, onEdit, onUpdate, onDelete }: { 
    report: DailyReport, 
    onEdit: () => void, 
    onUpdate: (updatedReport: DailyReport) => void,
    onDelete: (reportId: string) => void
  }) => {
    return (
      <Suspense fallback={<div className="text-center py-2">로딩 중...</div>}>
        <ExpandedRow 
          report={report} 
          onEdit={onEdit}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </Suspense>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">검색 결과: {total}건</h2>
        <Button 
          variant="outline" 
          onClick={downloadAsCsv}
          disabled={isDownloading || data.length === 0}
          className="flex items-center gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              다운로드 중...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              CSV 다운로드
            </>
          )}
        </Button>
      </div>
      
      {data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-auto">

              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "0px", display: "none" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "120px" }} />
              </colgroup>
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="h-10 px-2 text-left font-medium"></th>
                  <th className="h-10 px-2 text-left font-medium whitespace-nowrap">날짜</th>
                  <th className="h-10 px-2 text-left font-medium">ITEM</th>
                  <th className="h-10 px-2 text-left font-medium" style={{ display: "none" }}>PART NO</th>
                  <th className="h-10 px-2 text-left font-medium">고객사</th>
                  <th className="h-10 px-2 text-left font-medium">단계</th>
                  <th className="h-10 px-2 text-left font-medium">담당자</th>
                  <th className="h-10 px-2 text-left font-medium">계획</th>
                  <th className="h-10 px-2 text-left font-medium">실적</th>
                  <th className="h-10 px-2 text-left font-medium">비고</th>
                </tr>
              </thead>
              <tbody>
                {data.map((report: DailyReport) => (
                  <React.Fragment key={`${report.id}-${forceUpdate.current}`}>
                    <tr 
                      className="border-b cursor-pointer hover:bg-muted/50"
                      style={{ minHeight: "80px" }}
                      onClick={() => toggleRowExpand(report.id, { stopPropagation: () => {} } as React.MouseEvent)}
                    >
                      <td className="p-2 text-center align-top">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => toggleRowExpand(report.id, e)}
                          aria-label={expandedRows[report.id] ? "행 축소" : "행 확장"}
                        >
                          {expandedRows[report.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                      <td className="p-2 whitespace-nowrap align-top">{report.date}</td>
                      <td className="p-2 overflow-hidden text-ellipsis align-top">{report.item}</td>
                      <td className="p-2 overflow-hidden text-ellipsis align-top" style={{ display: "none" }}>{report.partNo}</td>
                      <td className="p-2 overflow-hidden text-ellipsis align-top">{report.customer}</td>
                      <td className="p-2 overflow-hidden text-ellipsis align-top">{report.stage}</td>
                      <td className="p-2 overflow-hidden text-ellipsis whitespace-nowrap align-top">{report.manager}</td>
                      <td className="p-2 max-w-0 align-top">
                        <div className="text-sm leading-tight" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}>
                          {report.plan}
                        </div>
                      </td>
                      <td className="p-2 max-w-0 align-top">
                        <div className="text-sm leading-tight" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}>
                          {report.performance}
                        </div>
                      </td>
                      <td className="p-2 align-top">
                        <div className="text-sm leading-tight max-w-full break-words whitespace-pre-wrap">
                          {report.note}
                        </div>
                      </td>
                    </tr>
                    
                    {/* 확장된 행 내용 */}
                    {expandedRows[report.id] && (
                      <tr className="bg-muted/30 dark:bg-muted/20">
                        <td colSpan={10} className="p-4 border-b">
                          <ExpandedRowContent 
                            report={report} 
                            onEdit={() => handleEdit(report)}
                            onUpdate={handleReportUpdate}
                            onDelete={handleReportDelete}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {renderPaginationItems()}
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
} 
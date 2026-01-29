"use client";

import React, { useState } from "react";
import { SearchResult } from "@/app/actions/search-daily-reports";
import { DailyReport } from "@/app/actions/daily-report";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format } from "date-fns";
import { FormattedText } from "@/components/ui/formatted-text";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResultsProps {
  results: SearchResult;
  onPageChange: (page: number) => void;
}

/**
 * 검색 결과 표시 컴포넌트
 * 검색된 업무일지 데이터를 테이블 형태로 표시하고 페이지네이션을 제공합니다.
 */
export function SearchResults({ results, onPageChange }: SearchResultsProps) {
  const { data, total, page, pageSize } = results;
  const totalPages = Math.ceil(total / pageSize);
  const router = useRouter();
  
  // 행 확장 상태 관리
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // 행 확장/축소 토글 핸들러 - 매개변수 단순화
  const toggleRowExpand = (reportId: string) => {
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
  
  const downloadAsCsv = () => {
    // CSV 헤더
    const headers = ["날짜", "ITEM", "PART NO", "단계", "담당자", "계획", "실적", "비고"];
    
    // 데이터 행 구성
    const csvData = data.map((item: DailyReport) => [
      item.date,
      item.item,
      item.partNo,
      item.stage,
      item.manager,
      item.plan,
      item.performance,
      item.note
    ]);
    
    // CSV 포맷으로 변환
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
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
  };
  
  // 페이지네이션 링크 생성
  const renderPaginationItems = () => {
    // 최대 5개의 페이지 번호만 표시
    const maxVisiblePages = 5;
    const pageItems = [];
    
    // 이전 페이지 버튼
    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => page > 1 && onPageChange(page - 1)}
          className={`cursor-pointer ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
        />
      </PaginationItem>
    );
    
    // 현재 페이지를 중심으로 양쪽에 표시할 페이지 수 계산
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // startPage 조정 (endPage가 totalPages에 닿으면 startPage를 조정)
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 첫 페이지 표시 (필요한 경우)
    if (startPage > 1) {
      pageItems.push(
        <PaginationItem key="1">
          <PaginationLink 
            onClick={() => onPageChange(1)}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // 건너뛴 페이지가 있으면 생략 표시
      if (startPage > 2) {
        pageItems.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => onPageChange(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // 마지막 페이지 표시 (필요한 경우)
    if (endPage < totalPages) {
      // 건너뛴 페이지가 있으면 생략 표시
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
            onClick={() => onPageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // 다음 페이지 버튼
    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => page < totalPages && onPageChange(page + 1)}
          className={`cursor-pointer ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
        />
      </PaginationItem>
    );
    
    return pageItems;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">검색 결과: {total}건</h2>
        <Button 
          variant="outline" 
          onClick={downloadAsCsv}
          disabled={data.length === 0}
        >
          CSV 다운로드
        </Button>
      </div>
      
      {data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>날짜</TableHead>
                  <TableHead>ITEM</TableHead>
                  <TableHead>PART NO</TableHead>
                  <TableHead>단계</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead className="w-1/6">계획</TableHead>
                  <TableHead className="w-1/6">실적</TableHead>
                  <TableHead>비고</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((report: DailyReport) => (
                  <React.Fragment key={report.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRowExpand(report.id)}
                    >
                      <TableCell className="p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation(); // 실제 이벤트 객체 사용
                            toggleRowExpand(report.id);
                          }}
                          aria-label={expandedRows[report.id] ? "행 축소" : "행 확장"}
                        >
                          {expandedRows[report.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.item}</TableCell>
                      <TableCell>{report.partNo}</TableCell>
                      <TableCell>{report.stage}</TableCell>
                      <TableCell>{report.manager}</TableCell>
                      <TableCell>
                        <div className="pointer-events-none">
                          <FormattedText text={report.plan} truncate={true} maxLength={50} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="pointer-events-none">
                          <FormattedText text={report.performance} truncate={true} maxLength={50} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="pointer-events-none">
                          <FormattedText text={report.note} truncate={true} maxLength={30} />
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* 확장된 행 내용 */}
                    {expandedRows[report.id] && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={9} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-semibold mb-1">ITEM</h3>
                              <p>{report.item}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold mb-1">PART NO</h3>
                              <p>{report.partNo}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold mb-1">단계</h3>
                              <p>{report.stage}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold mb-1">담당자</h3>
                              <p>{report.manager}</p>
                            </div>
                            <div className="md:col-span-2">
                              <h3 className="text-sm font-semibold mb-1">계획</h3>
                              <div className="p-2 bg-white rounded border">
                                <FormattedText text={report.plan} />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <h3 className="text-sm font-semibold mb-1">실적</h3>
                              <div className="p-2 bg-white rounded border">
                                <FormattedText text={report.performance} />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <h3 className="text-sm font-semibold mb-1">비고</h3>
                              <div className="p-2 bg-white rounded border">
                                <FormattedText text={report.note} />
                              </div>
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                              <Button onClick={() => handleEdit(report)}>
                                수정하기
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
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
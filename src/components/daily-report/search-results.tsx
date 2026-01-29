"use client";

import React, { useState, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Edit } from "lucide-react";
import { FormattedText } from "@/components/ui/formatted-text";
import dynamic from 'next/dynamic';

// 검색 결과 타입 정의
interface DailyReport {
  id: string;
  date: string;
  item: string;
  partNo: string;
  customer: string;
  stage: string;
  manager: string;
  plan: string;
  performance: string;
  note: string;
}

interface SearchResult {
  data: DailyReport[];
  total: number;
  page: number;
  pageSize: number;
}

interface SearchResultsProps {
  results: SearchResult;
  onPageChange: (page: number) => void;
}

// 확장된 행을 표시하는 컴포넌트 - 필요할 때만 로드되도록 동적 임포트
const ExpandedRow = dynamic(() => import('./search/expanded-row').then(mod => mod.ExpandedRow), {
  loading: () => <div className="p-2">로딩 중...</div>,
  ssr: false
});

// 페이지네이션 컴포넌트
const Pagination = ({ currentPage, totalPages, onPageChange }: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center mt-4">
      <nav>
        <ul className="flex items-center gap-1">
          <li>
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 border dark:border-gray-700 rounded-md disabled:opacity-50 dark:disabled:opacity-30 dark:text-gray-300"
            >
              이전
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <li key={pageNum}>
              <button
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 border dark:border-gray-700 rounded-md ${
                  currentPage === pageNum 
                    ? "bg-blue-500 text-white dark:bg-blue-600" 
                    : "dark:text-gray-300 dark:bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border dark:border-gray-700 rounded-md disabled:opacity-50 dark:disabled:opacity-30 dark:text-gray-300"
            >
              다음
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// 확장된 행의 내용만 표시하는 래퍼 컴포넌트
const ExpandedRowContent = ({ report, onEdit }: { 
  report: DailyReport, 
  onEdit: (id: string) => void
}) => {
  return (
    <Suspense fallback={<div className="text-center py-2">로딩 중...</div>}>
      <ExpandedRow report={report} onEdit={() => onEdit(report.id)} />
    </Suspense>
  );
};

// 행 컴포넌트
const ReportRow = ({ 
  report, 
  isExpanded, 
  onToggle, 
  onEdit 
}: { 
  report: DailyReport, 
  isExpanded: boolean, 
  onToggle: () => void,
  onEdit: (id: string) => void 
}) => (
  <React.Fragment>
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
        isExpanded ? 'bg-gray-50 dark:bg-gray-700' : ''
      }`}
      onClick={onToggle}
    >
      <td className="py-2 px-3 border-b dark:border-gray-700 text-center">
        {isExpanded 
          ? <ChevronDown className="h-5 w-5 inline-block" /> 
          : <ChevronRight className="h-5 w-5 inline-block" />
        }
      </td>
      <td className="py-2 px-3 border-b dark:border-gray-700">{report.date}</td>
      <td className="py-2 px-3 border-b dark:border-gray-700">{report.item}</td>
      <td className="py-2 px-3 border-b dark:border-gray-700" style={{ display: "none" }}>{report.partNo}</td>
      <td className="py-2 px-3 border-b dark:border-gray-700">{report.customer}</td>
      <td className="py-2 px-3 border-b dark:border-gray-700">{report.stage}</td>
      <td className="py-2 px-3 border-b dark:border-gray-700">{report.manager}</td>
      <td className="py-2 px-3 border-b dark:border-gray-700 max-w-xs">
        <div className="truncate">
          <FormattedText text={report.plan} truncate={!isExpanded} maxLength={50} />
        </div>
      </td>
      <td className="py-2 px-3 border-b dark:border-gray-700 max-w-xs">
        <div className="truncate">
          <FormattedText text={report.performance} truncate={!isExpanded} maxLength={50} />
        </div>
      </td>
      <td className="py-2 px-3 border-b dark:border-gray-700">
        <div className="break-words whitespace-pre-wrap text-sm leading-tight">
          <FormattedText text={report.note} truncate={false} maxLength={100} />
        </div>
      </td>
    </tr>
    
    {isExpanded && (
      <tr className="bg-gray-50 dark:bg-gray-700">
        <td colSpan={10} className="p-4 border-b dark:border-gray-700">
          <ExpandedRowContent report={report} onEdit={onEdit} />
        </td>
      </tr>
    )}
  </React.Fragment>
);

// CSV 다운로드 함수 - 데이터 크기가 작을 때만 사용
const downloadAsCsv = (data: DailyReport[]) => {
  // CSV 헤더
  const headers = ["날짜", "ITEM", "PART NO", "고객사", "단계", "담당자", "계획", "실적", "비고"];
  
  // 데이터 행 구성
  const csvData = data.map((item: DailyReport) => [
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
  link.setAttribute("download", `업무일지_검색결과_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // 메모리 누수 방지를 위한 URL 해제
};

/**
 * 검색 결과 표시 컴포넌트
 * 검색된 업무일지 데이터를 테이블 형태로 표시하며,
 * 행 확장 기능을 통해 줄바꿈이 있는 텍스트의 전체 내용을 확인할 수 있습니다.
 */
export function SearchResults({ results, onPageChange }: SearchResultsProps) {
  const { data, total, page, pageSize } = results;
  const totalPages = Math.ceil(total / pageSize);
  const router = useRouter();
  
  // 확장된 행 상태 관리
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // 행 확장/축소 토글 핸들러
  const toggleRowExpand = (reportId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  // 수정하기 버튼 핸들러
  const handleEditReport = (reportId: string) => {
    router.push(`/daily-report/edit/${reportId}`);
  };
  
  // 데이터가 없는 경우
  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">검색 결과가 없습니다.</div>;
  }
  
  // 데이터가 너무 많을 경우 성능 최적화
  const renderRows = () => {
    // 데이터가 많을 경우 가상화를 고려할 수 있음
    return data.map((report: DailyReport) => (
      <ReportRow 
        key={report.id}
        report={report}
        isExpanded={!!expandedRows[report.id]} 
        onToggle={() => toggleRowExpand(report.id)}
        onEdit={handleEditReport}
      />
    ));
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">검색 결과: {total}건</h2>
        <Button 
          variant="outline"
          onClick={() => downloadAsCsv(data)}
          disabled={data.length > 1000} // 데이터가 너무 많으면 비활성화
        >
          CSV 다운로드
        </Button>
      </div>
      
      <div className="relative overflow-x-auto rounded-md shadow">
        <table className="w-full text-sm text-left dark:text-gray-300">
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
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="py-3 px-3 text-center" style={{ width: "40px" }}></th>
              <th className="py-3 px-3">날짜</th>
              <th className="py-3 px-3">ITEM</th>
              <th className="py-3 px-3" style={{ display: "none" }}>PART NO</th>
              <th className="py-3 px-3">고객사</th>
              <th className="py-3 px-3">단계</th>
              <th className="py-3 px-3">담당자</th>
              <th className="py-3 px-3">계획</th>
              <th className="py-3 px-3">실적</th>
              <th className="py-3 px-3">비고</th>
            </tr>
          </thead>
          <tbody>
            {renderRows()}
          </tbody>
        </table>
      </div>
      
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
} 
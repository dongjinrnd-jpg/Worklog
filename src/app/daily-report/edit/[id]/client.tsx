"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { DailyReport } from "@/app/actions/daily-report";
import { toast } from "sonner";
import { updateDailyReport } from "@/app/actions/update-daily-report";

/**
 * 업무일지 수정 페이지 (클라이언트 컴포넌트)
 * URL 파라미터의 ID나 localStorage에 저장된 데이터를 바탕으로 업무일지 수정 폼을 제공합니다.
 */
export default function EditDailyReportClient({ id }: { id: string }) {
  const router = useRouter();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    plan: "",
    performance: "",
    note: ""
  });
  
  useEffect(() => {
    const loadReportData = async () => {
      try {
        // localStorage에서 데이터 가져오기 시도
        const savedReport = localStorage.getItem('editReport');
        if (savedReport) {
          const parsedReport = JSON.parse(savedReport) as DailyReport;
          if (parsedReport.id === id) {
            setReport(parsedReport);
            setFormData({
              plan: parsedReport.plan || "",
              performance: parsedReport.performance || "",
              note: parsedReport.note || ""
            });
            localStorage.removeItem('editReport'); // 사용 후 데이터 삭제
            setLoading(false);
            return;
          }
        }
        
        // localStorage에 데이터가 없으면 API 호출
        // 실제 구현 시 서버 액션을 통해 데이터 조회
        // 임시 응답으로 대체
        setLoading(false);
        toast.error("죄송합니다. 데이터를 찾을 수 없습니다.");
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
        setLoading(false);
        toast.error("데이터 로딩 중 오류가 발생했습니다.");
      }
    };
    
    loadReportData();
  }, [id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report) return;
    
    try {
      setIsSaving(true);
      
      // 업데이트된 보고서 객체 생성
      const updatedReport: DailyReport = {
        ...report,
        plan: formData.plan,
        performance: formData.performance,
        note: formData.note
      };
      
      // 서버 액션 호출하여 저장
      const result = await updateDailyReport(updatedReport);
      
      if (!result.success) {
        throw new Error(result.error || "저장 중 오류가 발생했습니다.");
      }
      
      // 수정된 페이지로 돌아갈 때 필요한 검색 값과 페이지 정보 저장
      const searchState = localStorage.getItem('searchState');
      if (searchState) {
        // 검색 상태 유지를 위해 업데이트된 보고서 데이터 저장
        const parsedSearchState = JSON.parse(searchState);
        
        // 검색 결과에서 현재 보고서 업데이트
        if (parsedSearchState.results && parsedSearchState.results.data) {
          parsedSearchState.results.data = parsedSearchState.results.data.map((item: DailyReport) => 
            item.id === updatedReport.id ? updatedReport : item
          );
          localStorage.setItem('searchState', JSON.stringify(parsedSearchState));
        }
      }
      
      toast.success("수정이 완료되었습니다.");
      router.push("/daily-report/search");
    } catch (error) {
      console.error("저장 오류:", error);
      toast.error(String(error) || "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">데이터를 찾을 수 없습니다</h1>
        <p className="mb-6">요청하신 업무일지를 찾을 수 없습니다.</p>
        <Button onClick={() => router.push("/daily-report/search")}>
          검색 페이지로 돌아가기
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">업무일지 수정</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">날짜</label>
            <div className="border p-2 rounded bg-muted/50">{report.date}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">담당자</label>
            <div className="border p-2 rounded bg-muted/50">{report.manager}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">ITEM</label>
            <div className="border p-2 rounded bg-muted/50">{report.item}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">PART NO</label>
            <div className="border p-2 rounded bg-muted/50">{report.partNo}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">단계</label>
            <div className="border p-2 rounded bg-muted/50">{report.stage}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">계획</label>
          <textarea 
            className="w-full min-h-[100px] p-2 border rounded" 
            value={formData.plan}
            onChange={(e) => handleInputChange('plan', e.target.value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">실적</label>
          <textarea 
            className="w-full min-h-[150px] p-2 border rounded" 
            value={formData.performance}
            onChange={(e) => handleInputChange('performance', e.target.value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">비고</label>
          <textarea 
            className="w-full min-h-[100px] p-2 border rounded" 
            value={formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/daily-report/search")}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </form>
    </div>
  );
} 
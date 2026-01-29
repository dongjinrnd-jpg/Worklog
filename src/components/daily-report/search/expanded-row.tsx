"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FormattedText } from "@/components/ui/formatted-text";
import { Edit, Loader2, Save, X, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { updateDailyReport, type DailyReport } from "@/app/actions/update-daily-report";

interface ExpandedRowProps {
  report: DailyReport;
  onEdit: () => void;
  onUpdate?: (updatedReport: DailyReport) => void;
  onDelete?: (reportId: string) => void;
}

/**
 * 업무일지 행 확장 시 표시되는 상세 정보 컴포넌트
 * 모든 필드의 전체 내용을 원본 포맷(줄바꿈 보존)으로 표시합니다.
 * 수정하기 버튼을 통해 인라인 편집 기능을 제공합니다.
 */
export function ExpandedRow({ report, onEdit, onUpdate, onDelete }: ExpandedRowProps) {
  // 토스트 훅
  const { toast } = useToast();
  
  // 날짜 형식 변환 함수 (YYYY-MM-DD 형식으로 변환)
  const formatDateForInput = useCallback((dateString: string): string => {
    if (!dateString) return "";
    
    // 이미 YYYY-MM-DD 형식인 경우 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateString)) {
      return dateString.replace(/\./g, '-');
    }
    
    // YYYY/MM/DD 형식을 YYYY-MM-DD로 변환
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateString)) {
      return dateString.replace(/\//g, '-');
    }
    
    // 다른 형식의 경우 Date 객체를 통해 변환 시도
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error("날짜 변환 오류:", error);
    }
    
    return dateString;
  }, []);
  
  // 수정 모드 상태 관리
  const [isEditMode, setIsEditMode] = useState(false);
  // 저장 중 상태 관리
  const [isSaving, setIsSaving] = useState(false);
  // 삭제 중 상태 관리
  const [isDeleting, setIsDeleting] = useState(false);
  // 수정할 데이터 상태 관리
  const [editData, setEditData] = useState({
    date: formatDateForInput(report.date || ""),
    plan: report.plan || "",
    performance: report.performance || "",
    note: report.note || ""
  });
  // 현재 표시 중인 보고서 데이터
  const [currentReport, setCurrentReport] = useState<DailyReport>(report);
  
  // props로 받은 report가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setCurrentReport(report);
    setEditData({
      date: formatDateForInput(report.date || ""),
      plan: report.plan || "",
      performance: report.performance || "",
      note: report.note || ""
    });
  }, [report, formatDateForInput]);

  // 수정 모드 전환 핸들러
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // 취소 핸들러
  const handleCancelClick = () => {
    // 원래 데이터로 되돌리기
    setEditData({
      date: formatDateForInput(currentReport.date || ""),
      plan: currentReport.plan || "",
      performance: currentReport.performance || "",
      note: currentReport.note || ""
    });
    setIsEditMode(false);
  };

  // 저장 핸들러
  const handleSaveClick = async () => {
    try {
      setIsSaving(true);
      
      // 날짜 형식 검증
      if (!editData.date) {
        throw new Error("날짜를 입력해주세요.");
      }
      
      // 날짜 형식 검증 (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(editData.date)) {
        throw new Error("날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)");
      }
      
      // 업데이트된 데이터로 보고서 객체 생성
      const updatedReport = {
        ...report, // props로 전달받은 원본 report 사용
        date: editData.date,
        plan: editData.plan,
        performance: editData.performance,
        note: editData.note
      };
      
      // 서버 액션 호출하여 저장
      const result = await updateDailyReport(updatedReport);
      
      if (!result?.success) {
        throw new Error(result?.error || "저장 중 오류가 발생했습니다.");
      }
      
      // 로컬 상태 업데이트 - 현재 표시되는 데이터 갱신
      setCurrentReport(updatedReport);
      
      // 부모 컴포넌트에 업데이트 알림 (테이블 행 데이터 갱신용)
      if (onUpdate) {
        onUpdate(updatedReport);
      }
      
      // 성공 알림 표시
      toast({
        title: "저장 완료",
        description: "업무일지가 성공적으로 업데이트되었습니다.",
      });
      
      // 수정 모드 종료
      setIsEditMode(false);
    } catch (error) {
      // 오류 알림 표시
      toast({
        title: "저장 실패",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 삭제 핸들러
  const handleDeleteClick = async () => {
    // 삭제 확인 대화상자 표시
    if (!confirm(`정말로 이 업무일지를 삭제하시겠습니까?\n\n날짜: ${report.date}\nITEM: ${report.item}\n고객사: ${report.customer}`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // 부모 컴포넌트에 삭제 요청 전달
      if (onDelete) {
        onDelete(report.id);
      }
    } catch (error) {
      // 오류 알림 표시
      toast({
        title: "삭제 실패",
        description: "업무일지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100">
      {/* 날짜 필드 - 별도 행으로 표시 */}
      <div>
        <h4 className="font-medium mb-1">날짜</h4>
        {isEditMode ? (
          <input
            type="date"
            value={editData.date}
            onChange={(e) => {
              console.log("날짜 변경:", e.target.value);
              setEditData({...editData, date: e.target.value});
            }}
            onFocus={() => console.log("날짜 입력 필드 포커스:", editData.date)}
            className="w-48 cursor-pointer px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSaving}
            required
          />
        ) : (
          <div className="bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600 w-48">
            <span className="text-sm dark:text-gray-200">{currentReport.date}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-1">계획</h4>
          {isEditMode ? (
            <Textarea
              value={editData.plan}
              onChange={(e) => setEditData({...editData, plan: e.target.value})}
              className="min-h-[100px] w-full"
              placeholder="계획을 입력하세요"
              disabled={isSaving}
            />
          ) : (
            <div className="bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
              <FormattedText text={currentReport.plan} className="text-sm dark:text-gray-200" />
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium mb-1">실적</h4>
          {isEditMode ? (
            <Textarea
              value={editData.performance}
              onChange={(e) => setEditData({...editData, performance: e.target.value})}
              className="min-h-[100px] w-full"
              placeholder="실적을 입력하세요"
              disabled={isSaving}
            />
          ) : (
            <div className="bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
              <FormattedText text={currentReport.performance} className="text-sm dark:text-gray-200" />
            </div>
          )}
        </div>
      </div>
      
      {/* 비고 - 데이터가 없어도 항상 표시 */}
      <div>
        <h4 className="font-medium mb-1">비고</h4>
        {isEditMode ? (
          <Textarea
            value={editData.note}
            onChange={(e) => setEditData({...editData, note: e.target.value})}
            className="min-h-[80px] w-full"
            placeholder="비고를 입력하세요"
            disabled={isSaving}
          />
        ) : (
          <div className="bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
            <FormattedText text={currentReport.note || ""} className="text-sm dark:text-gray-200" />
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        {isEditMode ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelClick}
              className="flex items-center gap-1"
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
              취소
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveClick}
              className="flex items-center gap-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex items-center gap-1"
              disabled={isDeleting}
            >
              <Edit className="h-4 w-4" />
              수정하기
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="flex items-center gap-1"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  삭제하기
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 
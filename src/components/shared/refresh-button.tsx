"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { refreshData } from "@/app/actions/refresh";

interface RefreshButtonProps {
  /** 새로고침 성공 후 호출될 콜백 함수 */
  onRefreshSuccess?: (data: any) => void;
  /** 새로고침 실패 후 호출될 콜백 함수 */
  onRefreshError?: (error: string) => void;
  /** 새로고침 후 페이지를 리로드할지 여부 */
  reloadPageAfterRefresh?: boolean;
  /** 즉시 데이터를 반환받을지 여부 */
  returnData?: boolean;
  /** 버튼 텍스트 */
  buttonText?: string;
}

/**
 * 새로고침 버튼 컴포넌트
 * 데이터를 새로고침하는 기능을 제공합니다.
 */
export function RefreshButton({
  onRefreshSuccess,
  onRefreshError,
  reloadPageAfterRefresh = true,
  returnData = false,
  buttonText = "데이터 즉시 갱신"
}: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 새로고침 액션 핸들러
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await refreshData(returnData);
      if (result.success) {
        toast.success(result.message);
        
        // 성공 콜백 호출
        if (onRefreshSuccess && returnData && result.data) {
          onRefreshSuccess(result.data);
        }
        
        // 페이지 리로드 여부에 따라 처리
        if (reloadPageAfterRefresh) {
          // 데이터 새로고침 후 페이지 리로드
          setTimeout(() => {
            window.location.reload();
          }, 1000); // 토스트 메시지가 표시될 시간을 준 후 리로드
        }
      } else {
        toast.error(result.message);
        // 실패 콜백 호출
        if (onRefreshError) {
          onRefreshError(result.message);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      toast.error(`데이터 업데이트에 실패했습니다. (${errorMessage})`);
      // 실패 콜백 호출
      if (onRefreshError) {
        onRefreshError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      onClick={handleRefresh}
      disabled={isLoading}
    >
      <ReloadIcon className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "업데이트 중..." : buttonText}
    </Button>
  );
} 
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 에러 처리 컴포넌트
 * 애플리케이션에서 발생한 에러를 사용자에게 보여주고 재시도 옵션을 제공합니다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 개발 환경에서만 콘솔에 에러 로그 출력
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg">
          <CardTitle className="text-xl">오류가 발생했습니다</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <p className="mb-4">
            죄송합니다. 작업 처리 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || "알 수 없는 오류가 발생했습니다."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={reset} variant="default">
            다시 시도하기
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            홈으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
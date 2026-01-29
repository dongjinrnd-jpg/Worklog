import { Card, CardContent } from "@/components/ui/card";

/**
 * 로딩 컴포넌트
 * 데이터를 불러오는 동안 사용자에게 로딩 상태를 보여줍니다.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="flex space-x-2">
            <div className="h-4 w-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-4 w-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-4 w-4 bg-primary rounded-full animate-bounce"></div>
          </div>
          <p className="text-center text-muted-foreground">데이터를 불러오는 중입니다...</p>
        </CardContent>
      </Card>
    </div>
  );
} 
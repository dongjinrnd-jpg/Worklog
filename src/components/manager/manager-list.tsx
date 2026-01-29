import { Manager } from "@/app/actions/manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 담당자 목록 컴포넌트 속성
 * 담당자 목록에 필요한 속성을 정의합니다.
 */
interface ManagerListProps {
  managers: Manager[];
  isLoading?: boolean;
}

/**
 * 담당자 목록 컴포넌트
 * 담당자 목록을 카드 형태로 표시합니다.
 */
export function ManagerList({ managers, isLoading = false }: ManagerListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">담당자 목록</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : managers.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {managers.map((manager) => (
              <div key={manager.id} className="border rounded-md p-2">
                <div className="text-sm font-medium">{manager.name}</div>
                <div className="text-xs text-muted-foreground">{manager.rank}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-2">
              등록된 담당자가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              스프레드시트에 담당자 정보를 추가해주세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
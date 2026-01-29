import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 배지 컴포넌트 스타일 변형 정의
 * 다양한 상황에 맞는 배지 스타일을 정의합니다.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // 파스텔 색상의 프로젝트 상태 배지
        progress: 
          "border-transparent bg-blue-200 text-blue-800 hover:bg-blue-300",
        completed: 
          "border-transparent bg-green-200 text-green-800 hover:bg-green-300",
        hold: 
          "border-transparent bg-red-200 text-red-800 hover:bg-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * 배지 컴포넌트 속성 타입
 * 배지 컴포넌트의 속성을 정의합니다.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * 배지 컴포넌트
 * 레이블, 상태, 카테고리 등을 표시하는 작은 배지 컴포넌트입니다.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 
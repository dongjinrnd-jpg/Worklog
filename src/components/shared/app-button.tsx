"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";

/**
 * 앱 버튼 컴포넌트 타입
 * 버튼의 다양한 속성을 정의합니다.
 */
interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, 
  Omit<VariantProps<typeof Button>, "variant"> {
  children: ReactNode;
  href?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

/**
 * 앱 버튼 컴포넌트
 * 앱 전체에서 일관된 디자인의 버튼을 제공합니다.
 */
export function AppButton({
  children,
  href,
  icon: Icon,
  fullWidth = false,
  className = "",
  ...props
}: AppButtonProps) {
  const buttonClassName = `${fullWidth ? "w-full" : ""} ${
    Icon ? "flex items-center gap-2" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClassName}>
        <Button {...props} className={buttonClassName}>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button {...props} className={buttonClassName}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
} 
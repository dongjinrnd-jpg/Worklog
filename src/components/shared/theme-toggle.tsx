"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

/**
 * 테마 토글 컴포넌트
 * 다크모드와 라이트모드를 전환할 수 있는 토글 버튼을 제공합니다.
 */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 측 하이드레이션이 완료될 때까지 기다립니다
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트되기 전에는 UI를 렌더링하지 않아 hydration 오류를 방지합니다
  if (!mounted) {
    return null;
  }

  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={theme === "dark"}
      onPressedChange={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="테마 전환"
      className="ml-2"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Toggle>
  );
} 
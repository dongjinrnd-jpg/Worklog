"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * 날짜 선택기 컴포넌트 타입
 * 날짜 선택 기능에 필요한 속성을 정의합니다.
 */
interface DatePickerProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * 날짜 선택기 컴포넌트
 * 사용자가 날짜를 쉽게 선택할 수 있는 캘린더 UI를 제공합니다.
 */
export function DatePicker({
  date,
  onChange,
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate);
    setOpen(false); // 날짜 선택 시 팝업 닫기
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            !date && "text-muted-foreground dark:text-gray-400",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ko }) : "날짜를 선택하세요"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={ko}
          className="dark:bg-gray-800 dark:text-gray-100"
        />
      </PopoverContent>
    </Popover>
  );
} 
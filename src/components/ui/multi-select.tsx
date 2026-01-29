"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 옵션 아이템 타입 정의
interface Option {
  label: string;
  value: string;
  id?: string; // 옵션의 고유 식별자 추가
}

// 멀티셀렉트 컴포넌트 props 타입 정의
interface MultiSelectProps {
  options: Option[];
  value: Option[];
  onChange: (values: Option[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * 여러 항목을 선택할 수 있는 멀티셀렉트 컴포넌트
 * 옵션 목록에서 여러 항목을 선택하고 표시합니다.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "항목을 선택하세요",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLButtonElement>(null);

  // 옵션 선택 처리 함수
  const handleSelect = (option: Option) => {
    const isSelected = value.some((item) => item.value === option.value);
    
    if (isSelected) {
      // 이미 선택된 경우 제거
      onChange(value.filter((item) => item.value !== option.value));
    } else {
      // 선택되지 않은 경우 추가
      onChange([...value, option]);
    }
  };

  // 선택된 항목 제거 함수
  const handleRemove = (option: Option) => {
    onChange(value.filter((item) => item.value !== option.value));
  };

  // 외부 클릭 감지를 위한 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={popoverRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              value.length > 0 ? "h-auto min-h-10" : "h-10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => setOpen(!open)}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1">
              {value.length > 0 ? (
                value.map((item, index) => (
                  <Badge
                    key={item.id || `${item.value}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-0.5"
                  >
                    {item.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="검색..." />
            <CommandEmpty>선택 가능한 항목이 없습니다.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {options.map((option, index) => {
                const isSelected = value.some((item) => item.value === option.value);
                return (
                  <CommandItem
                    key={option.id || `option-${index}-${option.value}`}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 
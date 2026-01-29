"use client";

import React, { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/shared/date-picker";

// 검색 매개변수 타입 정의
interface SearchParams {
  query?: string;
  startDate?: string;
  endDate?: string;
  managers?: string[];
  items?: string[];
  partNos?: string[];
  stages?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  initialValues?: Partial<SearchParams>;
}

/**
 * 검색 폼 컴포넌트
 * 사용자가 검색 조건을 입력할 수 있는 양식을 제공합니다.
 */
export function SearchForm({ onSearch, initialValues = {} }: SearchFormProps) {
  // 오늘 날짜를 반환하는 유틸리티 함수
  const getTodayDate = () => new Date();
  
  // 상태 관리
  const [query, setQuery] = useState(initialValues.query || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialValues.startDate ? 
      (() => {
        const parsedDate = parse(initialValues.startDate!, "yyyy-MM-dd", new Date());
        return isValid(parsedDate) ? parsedDate : undefined;
      })() : 
      undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialValues.endDate ? 
      (() => {
        const parsedDate = parse(initialValues.endDate!, "yyyy-MM-dd", new Date());
        return isValid(parsedDate) ? parsedDate : undefined;
      })() : 
      undefined
  );
  
  // 검색 실행 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSearch({
      query,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    });
  };

  // 필터 초기화 핸들러
  const handleReset = () => {
    const today = getTodayDate();
    
    setQuery("");
    setStartDate(today); // 오늘 날짜로 설정
    setEndDate(today);   // 오늘 날짜로 설정
    
    // 초기화 후 오늘 날짜로 검색 실행
    onSearch({
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd")
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {/* 텍스트 검색 영역 */}
      <div className="flex gap-4">
        <div className="w-full">
          <label htmlFor="query" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">검색어</label>
          <input
            id="query"
            type="text"
            placeholder="검색할 키워드를 입력하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <Button 
          type="submit" 
          variant="default"
          size="lg" 
          className="mt-7"
        >
          검색
        </Button>
        <Button 
          type="button" 
          variant="outline"
          size="lg"
          onClick={handleReset}
          className="mt-7"
        >
          초기화
        </Button>
      </div>

      {/* 날짜 범위 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">시작 날짜</label>
          <DatePicker 
            date={startDate} 
            onChange={setStartDate} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">종료 날짜</label>
          <DatePicker 
            date={endDate} 
            onChange={setEndDate} 
          />
        </div>
      </div>
    </form>
  );
} 
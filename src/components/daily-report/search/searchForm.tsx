"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { SearchParams } from "@/app/actions/search-daily-reports";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  initialValues?: Partial<SearchParams>;
}

/**
 * 검색 폼 컴포넌트
 * 사용자가 검색 조건을 입력할 수 있는 양식을 제공합니다.
 */
export function SearchForm({ onSearch, initialValues = {} }: SearchFormProps) {
  // 상태 관리
  const [query, setQuery] = useState(initialValues.query || "");
  const [startDate, setStartDate] = useState<Date | undefined>(initialValues.startDate ? new Date(initialValues.startDate) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(initialValues.endDate ? new Date(initialValues.endDate) : undefined);
  const [managers, setManagers] = useState<string[]>(initialValues.managers || []);
  const [items, setItems] = useState<string[]>(initialValues.items || []);
  const [partNos, setPartNos] = useState<string[]>(initialValues.partNos || []);
  const [stages, setStages] = useState<string[]>(initialValues.stages || []);

  // 선택 옵션 목록 (실제 데이터로 교체 필요)
  const [managerOptions, setManagerOptions] = useState<string[]>([]);
  const [itemOptions, setItemOptions] = useState<string[]>([]);
  const [partNoOptions, setPartNoOptions] = useState<string[]>([]);
  const [stageOptions, setStageOptions] = useState<string[]>([]);

  // 선택 옵션 데이터 가져오기
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 여기서 실제 API 호출 또는 임시 데이터 사용
        const response = await fetch("/api/search-options");
        if (response.ok) {
          const data = await response.json();
          setManagerOptions(data.managers || []);
          setItemOptions(data.items || []);
          setPartNoOptions(data.partNos || []);
          setStageOptions(data.stages || []);
        } else {
          // 임시 데이터 사용
          setManagerOptions(["홍길동", "김철수", "이영희"]);
          setItemOptions(["아이템1", "아이템2", "아이템3"]);
          setPartNoOptions(["PART-001", "PART-002", "PART-003"]);
          setStageOptions(["계획", "진행중", "완료"]);
        }
      } catch (error) {
        console.error("옵션 데이터 로딩 오류:", error);
        // 임시 데이터 사용
        setManagerOptions(["홍길동", "김철수", "이영희"]);
        setItemOptions(["아이템1", "아이템2", "아이템3"]);
        setPartNoOptions(["PART-001", "PART-002", "PART-003"]);
        setStageOptions(["계획", "진행중", "완료"]);
      }
    };

    fetchOptions();
  }, []);

  // 검색 실행 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSearch({
      query,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      managers: managers.length > 0 ? managers : undefined,
      items: items.length > 0 ? items : undefined,
      partNos: partNos.length > 0 ? partNos : undefined,
      stages: stages.length > 0 ? stages : undefined,
    });
  };

  // 필터 초기화 핸들러
  const handleReset = () => {
    setQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
    setManagers([]);
    setItems([]);
    setPartNos([]);
    setStages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* 텍스트 검색 영역 */}
      <div className="flex gap-4">
        <div className="w-full">
          <Label htmlFor="query">검색어</Label>
          <Input
            id="query"
            placeholder="검색할 키워드를 입력하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="mt-7">검색</Button>
        <Button type="button" variant="outline" onClick={handleReset} className="mt-7">초기화</Button>
      </div>

      {/* 필터 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 날짜 범위 필터 */}
        <div>
          <Label>시작 날짜</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mt-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "yyyy-MM-dd") : "날짜 선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>종료 날짜</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mt-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "yyyy-MM-dd") : "날짜 선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 담당자 필터 */}
        <div>
          <Label htmlFor="manager">담당자</Label>
          <Select
            value={managers[0] || ""}
            onValueChange={(value) => setManagers(value ? [value] : [])}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="담당자 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {managerOptions.map((manager) => (
                <SelectItem key={manager} value={manager}>
                  {manager}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ITEM 필터 */}
        <div>
          <Label htmlFor="item">ITEM</Label>
          <Select
            value={items[0] || ""}
            onValueChange={(value) => setItems(value ? [value] : [])}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="ITEM 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {itemOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PART NO 필터 */}
        <div>
          <Label htmlFor="partNo">PART NO</Label>
          <Select
            value={partNos[0] || ""}
            onValueChange={(value) => setPartNos(value ? [value] : [])}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="PART NO 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {partNoOptions.map((partNo) => (
                <SelectItem key={partNo} value={partNo}>
                  {partNo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 단계 필터 */}
        <div>
          <Label htmlFor="stage">단계</Label>
          <Select
            value={stages[0] || ""}
            onValueChange={(value) => setStages(value ? [value] : [])}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="단계 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {stageOptions.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  );
} 
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchForm } from "@/components/daily-report/search-form";
import { SearchResults } from "@/components/daily-report/search/searchResults";
import { searchDailyReports, type SearchParams, type SearchResult } from "@/app/actions/search-daily-reports";
import { format } from "date-fns";

// 검색 결과 타입 정의
interface DailyReport {
  id: string;
  date: string;
  item: string;
  partNo: string;
  stage: string;
  manager: string;
  plan: string;
  performance: string;
  note: string;
}

/**
 * 업무일지 검색 페이지 컴포넌트
 * 사용자가 업무일지를 검색하고 결과를 확인할 수 있는 페이지입니다.
 */
export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 오늘 날짜를 yyyy-MM-dd 형식으로 반환하는 함수
  const getTodayDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };
  
  // 쿼리 파라미터 가져오기
  const getQueryParams = (): SearchParams => {
    return {
      query: searchParams.get("query") || undefined,
      startDate: searchParams.get("startDate") || getTodayDate(),
      endDate: searchParams.get("endDate") || getTodayDate(),
      page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
      // 필터링 옵션들도 포함
      managers: searchParams.get("managers") ? searchParams.get("managers")!.split(",") : undefined,
      items: searchParams.get("items") ? searchParams.get("items")!.split(",") : undefined,
      partNos: searchParams.get("partNos") ? searchParams.get("partNos")!.split(",") : undefined,
      stages: searchParams.get("stages") ? searchParams.get("stages")!.split(",") : undefined,
    };
  };

  // 페이지 로드 시 항상 새로운 검색 실행
  useEffect(() => {
    // URL 파라미터 기반 검색 실행
    if (searchParams.toString()) {
      handleSearch(getQueryParams());
    } else {
      // 파라미터가 없으면 오늘 날짜 기준 검색
      const today = getTodayDate();
      handleSearch({
        startDate: today,
        endDate: today
      });
    }
  }, [searchParams]); // searchParams가 변경될 때마다 검색 실행

  // 검색 핸들러
  const handleSearch = async (params: SearchParams) => {
    // URL 쿼리 파라미터 업데이트
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.set("query", params.query);
    if (params.startDate) queryParams.set("startDate", params.startDate);
    if (params.endDate) queryParams.set("endDate", params.endDate);
    if (params.page && params.page > 1) queryParams.set("page", params.page.toString());
    
    // 필터링 옵션들도 URL에 포함
    if (params.managers && params.managers.length > 0) {
      queryParams.set("managers", params.managers.join(","));
    }
    if (params.items && params.items.length > 0) {
      queryParams.set("items", params.items.join(","));
    }
    if (params.partNos && params.partNos.length > 0) {
      queryParams.set("partNos", params.partNos.join(","));
    }
    if (params.stages && params.stages.length > 0) {
      queryParams.set("stages", params.stages.join(","));
    }
    
    // 현재 URL과 동일한 경우에만 URL 업데이트 방지 (무한 루프 방지)
    const currentQuery = searchParams.toString();
    const newQuery = queryParams.toString();
    if (currentQuery !== newQuery) {
      router.push(`/daily-report/search?${queryParams.toString()}`, { scroll: false });
      return; // URL이 변경되면 useEffect에서 새로운 검색이 실행되므로 여기서 종료
    }
    
    setIsLoading(true);
    try {
      // 서버 액션을 사용하여 실제 데이터 가져오기
      const results = await searchDailyReports(params);
      setSearchResults(results);
    } catch (error) {
      console.error("검색 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchResults) {
      // 기존 검색 매개변수 유지하면서 페이지만 변경
      const currentParams = getQueryParams();
      const queryParams = new URLSearchParams(searchParams.toString());
      queryParams.set("page", page.toString());
      router.push(`/daily-report/search?${queryParams.toString()}`, { scroll: false });
    }
  };

  // 오늘 날짜를 초기값으로 설정
  const today = getTodayDate();
  const currentParams = getQueryParams();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">업무일지 검색</h1>
      
      <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow">
        <SearchForm onSearch={handleSearch} initialValues={{
          query: currentParams.query || "",
          startDate: currentParams.startDate || today,
          endDate: currentParams.endDate || today,
        }} />
      </div>
      
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center">
            <p>검색 중...</p>
          </div>
        ) : searchResults ? (
          <SearchResults 
            results={searchResults} 
            onPageChange={handlePageChange}
            searchParams={getQueryParams()} // 검색 매개변수 전달
            onRefresh={() => handleSearch(getQueryParams())} // 새로고침 콜백 추가
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>검색어를 입력하고 검색 버튼을 클릭하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
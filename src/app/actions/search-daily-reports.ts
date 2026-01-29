"use server";

import { unstable_cache as cache } from "next/cache";
import { DailyReport } from "./daily-report";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 검색 매개변수 인터페이스
 * 업무일지 검색에 사용되는 필터링 옵션을 정의합니다.
 */
export interface SearchParams {
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

/**
 * 업무일지 검색 결과 인터페이스
 * 검색 결과 데이터와 페이지네이션 정보를 포함합니다.
 */
export interface SearchResult {
  data: DailyReport[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 업무일지 검색 서버 액션
 * 주어진 검색 매개변수에 맞게 업무일지 데이터를 검색합니다.
 */
export async function searchDailyReports(params: SearchParams): Promise<SearchResult> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 모든 데이터를 가져온 후 서버에서 필터링
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "업무일지!A2:I",
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      };
    }
    
    // 데이터 변환
    let reports = rows.map((row: string[], index: number): DailyReport => ({
      id: index.toString(),
      date: row[0] || "",
      item: row[1] || "",
      partNo: row[2] || "",
      customer: row[3] || "",
      stage: row[4] || "",
      manager: row[5] || "",
      plan: row[6] || "",
      performance: row[7] || "",
      note: row[8] || "",
    }));
    
    // 필터링 로직
    if (params.query) {
      // ";" 또는 "," 구분자로 검색어를 분리
      const queryTerms = params.query.toLowerCase().split(/[;,]/);
      
      // 각 검색어로 필터링 (OR 조건으로 변경)
      reports = reports.filter((report: DailyReport) => 
        // 하나라도 일치하면 결과에 포함 (OR 조건)
        queryTerms.some(term => {
          const trimmedTerm = term.trim().toLowerCase();
          if (!trimmedTerm) return true; // 빈 검색어는 무시
          
          // 대소문자 구분 없이 모든 검색 필드에서 검색
          const itemMatch = (report.item || "").toLowerCase().includes(trimmedTerm);
          const stageMatch = (report.stage || "").toLowerCase().includes(trimmedTerm);
          const managerMatch = (report.manager || "").toLowerCase().includes(trimmedTerm);
          
          // 어느 하나라도 일치하면 true 반환 (OR 조건)
          return itemMatch || stageMatch || managerMatch;
        })
      );
    }
    
    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      reports = reports.filter((report: DailyReport) => {
        const date = new Date(report.date);
        return date >= start && date <= end;
      });
    }
    
    if (params.managers && params.managers.length > 0) {
      reports = reports.filter((report: DailyReport) => 
        params.managers!.includes(report.manager)
      );
    }
    
    if (params.items && params.items.length > 0) {
      reports = reports.filter((report: DailyReport) => 
        params.items!.includes(report.item)
      );
    }
    
    if (params.partNos && params.partNos.length > 0) {
      reports = reports.filter((report: DailyReport) => 
        params.partNos!.includes(report.partNo)
      );
    }
    
    if (params.stages && params.stages.length > 0) {
      reports = reports.filter((report: DailyReport) => 
        params.stages!.includes(report.stage)
      );
    }
    
    // 정렬 로직
    if (params.sortBy) {
      reports.sort((a: DailyReport, b: DailyReport) => {
        const direction = params.sortDirection === 'desc' ? -1 : 1;
        
        if (params.sortBy === 'date') {
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        
        const valueA = a[params.sortBy as keyof DailyReport] || '';
        const valueB = b[params.sortBy as keyof DailyReport] || '';
        
        return direction * String(valueA).localeCompare(String(valueB));
      });
    } else {
      // 기본 정렬: 날짜 최신순
      reports.sort((a: DailyReport, b: DailyReport) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // 페이지네이션
    const pageSize = params.pageSize || 10;
    const page = params.page || 1;
    const total = reports.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      data: reports.slice(start, end),
      total,
      page,
      pageSize
    };
  } catch (error) {
    console.error("업무일지 검색 실패:", error);
    throw new Error("업무일지 검색 중 오류가 발생했습니다.");
  }
}

/**
 * 검색된 모든 결과를 가져오는 함수 (페이지네이션 없음)
 * CSV 다운로드 등 전체 데이터가 필요한 경우 사용
 */
export async function searchAllDailyReports(params: Omit<SearchParams, 'page' | 'pageSize'>): Promise<DailyReport[]> {
  try {
    console.log("searchAllDailyReports 시작 - 매개변수:", params);
    
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 모든 데이터를 가져온 후 서버에서 필터링
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "업무일지!A2:I",
    });
    
    const rows = response.data.values;
    console.log("Google Sheets에서 가져온 원본 데이터 건수:", rows?.length || 0);
    
    if (!rows || rows.length === 0) {
      console.log("원본 데이터가 없음");
      return [];
    }
    
    // 데이터 변환
    let reports = rows.map((row: string[], index: number): DailyReport => ({
      id: index.toString(),
      date: row[0] || "",
      item: row[1] || "",
      partNo: row[2] || "",
      customer: row[3] || "",
      stage: row[4] || "",
      manager: row[5] || "",
      plan: row[6] || "",
      performance: row[7] || "",
      note: row[8] || "",
    }));
    
    console.log("데이터 변환 후 건수:", reports.length);
    
    // searchDailyReports와 동일한 필터링 로직 적용
    if (params.query) {
      const queryTerms = params.query.toLowerCase().split(/[;,]/);
      console.log("검색어 필터링:", queryTerms);
      reports = reports.filter((report: DailyReport) => 
        queryTerms.some(term => {
          const trimmedTerm = term.trim().toLowerCase();
          if (!trimmedTerm) return true;
          
          const itemMatch = (report.item || "").toLowerCase().includes(trimmedTerm);
          const stageMatch = (report.stage || "").toLowerCase().includes(trimmedTerm);
          const managerMatch = (report.manager || "").toLowerCase().includes(trimmedTerm);
          
          return itemMatch || stageMatch || managerMatch;
        })
      );
      console.log("검색어 필터링 후 건수:", reports.length);
    }
    
    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      console.log("날짜 필터링:", params.startDate, "~", params.endDate);
      reports = reports.filter((report: DailyReport) => {
        const date = new Date(report.date);
        return date >= start && date <= end;
      });
      console.log("날짜 필터링 후 건수:", reports.length);
    }
    
    if (params.managers && params.managers.length > 0) {
      console.log("담당자 필터링:", params.managers);
      reports = reports.filter((report: DailyReport) => 
        params.managers!.includes(report.manager)
      );
      console.log("담당자 필터링 후 건수:", reports.length);
    }
    
    if (params.items && params.items.length > 0) {
      console.log("ITEM 필터링:", params.items);
      reports = reports.filter((report: DailyReport) => 
        params.items!.includes(report.item)
      );
      console.log("ITEM 필터링 후 건수:", reports.length);
    }
    
    if (params.partNos && params.partNos.length > 0) {
      console.log("PART NO 필터링:", params.partNos);
      reports = reports.filter((report: DailyReport) => 
        params.partNos!.includes(report.partNo)
      );
      console.log("PART NO 필터링 후 건수:", reports.length);
    }
    
    if (params.stages && params.stages.length > 0) {
      console.log("단계 필터링:", params.stages);
      reports = reports.filter((report: DailyReport) => 
        params.stages!.includes(report.stage)
      );
      console.log("단계 필터링 후 건수:", reports.length);
    }
    
    // 정렬 로직
    if (params.sortBy) {
      console.log("정렬 기준:", params.sortBy, "방향:", params.sortDirection);
      reports.sort((a: DailyReport, b: DailyReport) => {
        const direction = params.sortDirection === 'desc' ? -1 : 1;
        
        if (params.sortBy === 'date') {
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        
        const valueA = a[params.sortBy as keyof DailyReport] || '';
        const valueB = b[params.sortBy as keyof DailyReport] || '';
        
        return direction * String(valueA).localeCompare(String(valueB));
      });
    } else {
      // 기본 정렬: 날짜 최신순
      console.log("기본 정렬: 날짜 최신순");
      reports.sort((a: DailyReport, b: DailyReport) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    console.log("최종 반환 데이터 건수:", reports.length);
    return reports;
    
  } catch (error) {
    console.error("전체 업무일지 검색 실패:", error);
    throw new Error("전체 업무일지 검색 중 오류가 발생했습니다.");
  }
} 
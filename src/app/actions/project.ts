"use server";

import { unstable_cache as cache } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 프로젝트 데이터 인터페이스
 * 프로젝트 항목의 데이터 구조를 정의합니다.
 */
export interface Project {
  id: string;
  no: string;
  status: string;        // 진행여부
  client: string;        // 고객사
  affiliation: string;   // 소속
  model: string;         // 모델
  item: string;          // ITEM
  partNo: string;        // PART NO
  managers: string[];    // 개발담당
  currentStage: string;  // 현재단계
  progressStatus: string; // 업무진행사항
  issues: string;        // 애로사항
  notes: string;         // 비고
  additionalPlan: string; // 업무추가 일정계획
  developmentStage: string; // 개발업무단계
  schedule: string;      // 대일정
  sellingPrice?: string; // 판매가
  materialCost?: string; // 재료비
  materialCostRatio?: string; // 재료비율
}

/**
 * 프로젝트 데이터를 가져오는 함수
 * 모든 프로젝트 데이터를 스프레드시트에서 조회합니다.
 */
export const getProjects = cache(
  async (): Promise<Project[]> => {
    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = await getSpreadsheetId();

      // 프로젝트 시트에서 데이터 조회
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "프로젝트!A2:R", // A2부터 R열까지의 모든 데이터
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        return [];
      }

      // 데이터를 객체 형태로 변환
      return rows.map((row: string[], index: number): Project => ({
        id: index.toString(),
        no: row[0] || "",                // NO
        status: row[1] || "",            // 진행여부
        client: row[2] || "",            // 고객사
        affiliation: row[3] || "",       // 소속
        model: row[4] || "",             // 모델
        item: row[5] || "",              // ITEM
        partNo: row[6] || "",            // PART NO
        managers: row[7] ? row[7].split(",").map((manager: string) => manager.trim()) : [], // 개발담당
        currentStage: row[8] || "",      // 현재단계
        progressStatus: row[9] || "",    // 업무진행사항
        issues: row[10] || "",           // 애로사항
        notes: row[11] || "",            // 비고
        additionalPlan: row[12] || "",   // 업무추가 일정계획
        developmentStage: row[13] || "", // 개발업무단계
        schedule: row[14] || "",         // 대일정
        sellingPrice: row[15] || "",     // 판매가
        materialCost: row[16] || "",     // 재료비
        materialCostRatio: row[17] || "", // 재료비율
      }));
    } catch (error) {
      console.error("프로젝트 데이터 조회 실패:", error);
      throw new Error("프로젝트 데이터를 가져오는 중 오류가 발생했습니다.");
    }
  },
  ["projects"],
  {
    revalidate: 60, // 1분마다 캐시 재검증 (기존 3600에서 변경)
    tags: ["projects"],
  }
);

/**
 * 진행 중인 프로젝트만 필터링하여 가져오는 함수
 * 진행여부가 '진행'인 프로젝트만 반환합니다.
 */
export const getActiveProjects = cache(
  async (): Promise<Project[]> => {
    const projects = await getProjects();
    return projects.filter(project => project.status === '진행');
  },
  ["active-projects"],
  {
    revalidate: 60, // 1분마다 캐시 재검증 (기존 3600에서 변경)
    tags: ["projects"],
  }
); 
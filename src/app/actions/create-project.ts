"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";
import { getProjects } from "./project";

// 프로젝트 생성을 위한 데이터 타입 정의
export interface CreateProjectData {
  status: 'progress' | 'hold' | 'completed'; // 진행여부 (진행, 보유, 완료)
  customer: string;     // 고객사
  affiliation?: string; // 소속
  model?: string;       // 모델
  item: string;         // ITEM
  partNo?: string;      // PART NO
  managers?: string[];  // 개발담당
  developmentStages?: string[]; // 다중 선택 가능한 개발업무단계
  schedule?: { 
    start?: string; 
    end?: string; 
  };
  sellingPrice?: number;   // 판매가
  materialCost?: number;   // 재료비
  materialCostRatio?: number; // 재료비율
}

// 프로젝트 생성 결과 인터페이스
export interface ProjectActionResult {
  success: boolean;
  error?: string;
  projectNo?: string;
}

// 상태값 매핑 객체
const statusMap: Record<string, string> = {
  'progress': '진행',
  'hold': '보류',
  'completed': '완료'
};

/**
 * 새 프로젝트를 생성하는 서버 액션
 * 
 * @param data 생성할 프로젝트 데이터
 * @returns 생성 결과
 */
export async function createProject(data: CreateProjectData): Promise<ProjectActionResult> {
  try {
    // 필수값 검증
    if (!data.customer) {
      return { success: false, error: "고객사를 입력해주세요." };
    }
    if (!data.item) {
      return { success: false, error: "ITEM을 입력해주세요." };
    }
    
    // 서비스 객체 가져오기
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 새 NO 번호 자동 생성 (기존 프로젝트 중 가장 큰 번호 + 1)
    const projects = await getProjects();
    let maxNo = 0;
    
    if (projects.length > 0) {
      // 기존 NO 중 최대값 찾기
      projects.forEach(project => {
        const projectNo = parseInt(project.no);
        if (!isNaN(projectNo) && projectNo > maxNo) {
          maxNo = projectNo;
        }
      });
    }
    
    const newNo = maxNo + 1;
    
    // 개발담당자와 개발업무단계를 쉼표로 구분된 문자열로 변환
    const managersStr = data.managers && data.managers.length > 0 
      ? data.managers.join(',') 
      : '';
      
    const stagesStr = data.developmentStages && data.developmentStages.length > 0 
      ? data.developmentStages.join(',') 
      : '';
    
    // 현재단계는 선택한 개발업무단계 중 첫 번째 항목으로 설정
    const currentStage = data.developmentStages && data.developmentStages.length > 0 
      ? data.developmentStages[0] 
      : '';
    
    // 스케줄 문자열 생성
    const scheduleStr = data.schedule 
      ? `${data.schedule.start || ''} ~ ${data.schedule.end || ''}` 
      : '';
    
    // 스프레드시트에 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "프로젝트!A:R",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            newNo.toString(),               // NO (자동생성)
            statusMap[data.status] || '진행', // 진행여부
            data.customer,                  // 고객사
            data.affiliation || '',         // 소속
            data.model || '',               // 모델
            data.item,                      // ITEM
            data.partNo || '',              // PART NO
            managersStr,                    // 개발담당
            currentStage,                   // 현재단계
            '',                             // 업무진행사항
            '',                             // 애로사항
            '',                             // 비고
            '',                             // 업무추가 일정계획
            stagesStr,                      // 개발업무단계
            scheduleStr,                    // 대일정
            data.sellingPrice || '',        // 판매가
            data.materialCost || '',        // 재료비
            data.materialCostRatio || '',   // 재료비율
          ]
        ],
      },
    });
    
    // 프로젝트 페이지 캐시 무효화
    revalidatePath("/project");
    
    // 항목정보 캐시 데이터 무효화 (새 프로젝트에 새 고객사/모델 등이 추가될 수 있음)
    revalidateTag("item-data");
    
    // 성공 결과 반환
    return { 
      success: true,
      projectNo: newNo.toString()
    };
  } catch (error) {
    console.error("프로젝트 생성 실패:", error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "프로젝트 생성 중 오류가 발생했습니다."
    };
  }
} 
"use server";

import { revalidateTag } from "next/cache";
import { getProjects } from "./project";
import { getItemData } from "./item-data";
import { getManagers } from "./manager";
import { getDailyReports } from "./daily-report";

/**
 * 데이터 새로고침 액션
 * 캐시된 데이터를 무효화하여 최신 데이터를 불러옵니다.
 * @param returnData 무효화 후 최신 데이터를 즉시 반환할지 여부
 */
export async function refreshData(returnData: boolean = false) {
  try {
    console.log("데이터 새로고침 시작...");
    
    // 캐시 태그를 무효화합니다
    revalidateTag("daily-reports");
    revalidateTag("projects");
    revalidateTag("managers");
    revalidateTag("item-data");
    
    // 최신 데이터를 즉시 반환할지 여부에 따라 처리
    let data = {};
    
    if (returnData) {
      console.log("최신 데이터 로드 중...");
      
      // 병렬로 데이터 로드
      const [projects, itemData, managers, dailyReports] = await Promise.all([
        getProjects(),
        getItemData(),
        getManagers(),
        getDailyReports()
      ]);
      
      data = {
        projects,
        itemData,
        managers,
        dailyReports
      };
      
      console.log("최신 데이터 로드 완료");
    }
    
    console.log("데이터 새로고침 완료");
    return { 
      success: true, 
      message: "데이터가 성공적으로 업데이트되었습니다.",
      ...(returnData ? { data } : {})
    };
  } catch (error) {
    console.error("데이터 업데이트 실패:", error);
    // 자세한 에러 메시지 추가
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return { 
      success: false, 
      message: `데이터 업데이트에 실패했습니다. (${errorMessage})` 
    };
  }
} 
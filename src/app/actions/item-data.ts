"use server";

import { unstable_cache as cache } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 개발업무단계 데이터 인터페이스
 * development-stage.ts 파일과 동일한 구조 사용
 */
export interface DevelopmentStage {
  id: string;
  name: string;
}

/**
 * 항목정보 데이터 인터페이스
 * 항목정보 시트의 각 열에 해당하는 데이터 구조를 정의합니다.
 */
export interface ItemData {
  developmentStages: DevelopmentStage[]; // A열: 개발단계명
  affiliations: string[];      // B열: 소속
  models: string[];            // C열: 모델
  customers: string[];         // D열: 고객사
}

/**
 * 항목정보 데이터를 가져오는 함수
 * 항목정보 시트에서 개발단계명, 소속, 모델, 고객사 데이터를 조회합니다.
 */
export const getItemData = cache(
  async (): Promise<ItemData> => {
    try {
      console.log("항목정보 데이터 조회 시작...");
      
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = await getSpreadsheetId();

      // 개발업무단계(A열) 조회 추가
      const developmentStagesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "항목정보!A1:A", // A1부터 A열까지의 모든 데이터 (헤더 포함)
      });

      // 개발업무단계와 동일한 방식으로 각 열별로 데이터 조회
      // B열 (소속) 조회
      const affiliationsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "항목정보!B1:B", // B1부터 B열까지의 모든 데이터 (헤더 포함)
      });
      
      // C열 (모델) 조회
      const modelsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "항목정보!C1:C", // C1부터 C열까지의 모든 데이터 (헤더 포함)
      });
      
      // D열 (고객사) 조회
      const customersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "항목정보!D1:D", // D1부터 D열까지의 모든 데이터 (헤더 포함)
      });
      
      // 각 응답에서 행 데이터 추출
      const developmentStagesRows = developmentStagesResponse.data.values;
      const affiliationsRows = affiliationsResponse.data.values;
      const modelsRows = modelsResponse.data.values;
      const customersRows = customersResponse.data.values;
      
      console.log(`항목정보 시트 A열(개발업무단계)에서 총 ${developmentStagesRows?.length || 0}개 행 로드됨`);
      console.log(`항목정보 시트 B열(소속)에서 총 ${affiliationsRows?.length || 0}개 행 로드됨`);
      console.log(`항목정보 시트 C열(모델)에서 총 ${modelsRows?.length || 0}개 행 로드됨`);
      console.log(`항목정보 시트 D열(고객사)에서 총 ${customersRows?.length || 0}개 행 로드됨`);
      
      // 원본 데이터 로깅 (디버깅용)
      console.log('원본 개발업무단계 데이터:', JSON.stringify(developmentStagesRows));
      console.log('원본 소속 데이터:', JSON.stringify(affiliationsRows));
      console.log('원본 모델 데이터:', JSON.stringify(modelsRows));
      console.log('원본 고객사 데이터:', JSON.stringify(customersRows));
      
      // 헤더 로깅
      if (developmentStagesRows && developmentStagesRows.length > 0) {
        console.log("항목정보 시트 A열(개발업무단계) 헤더:", developmentStagesRows[0][0]);
      }

      if (affiliationsRows && affiliationsRows.length > 0) {
        console.log("항목정보 시트 B열(소속) 헤더:", affiliationsRows[0][0]);
      }
      
      if (modelsRows && modelsRows.length > 0) {
        console.log("항목정보 시트 C열(모델) 헤더:", modelsRows[0][0]);
      }
      
      if (customersRows && customersRows.length > 0) {
        console.log("항목정보 시트 D열(고객사) 헤더:", customersRows[0][0]);
      }
      
      // 기본값 준비 (데이터가 없을 경우 사용)
      const defaultDevelopmentStages = [
        "검토", "설계", "개발", "PROTO", "선행성", 
        "P1", "P2", "승인", "양산이관", "초도양산"
      ];
      const defaultAffiliations = ["전장", "유압", "전산"];
      const defaultModels = ["CAB TILT SYSTEM", "FUEL FILLER PUMP", "PUMP", "CYLINDER", "ETB", "TC ACTUATOR MOTOR"];
      const defaultCustomers = ["기아군수", "KUBOTA", "YAMADA", "DORMAN"];
      
      // 개발업무단계 데이터 처리
      const developmentStages: DevelopmentStage[] = [];
      if (developmentStagesRows && developmentStagesRows.length > 1) {
        // 헤더 제외 처리
        const developmentStagesDataRows = developmentStagesRows.slice(1);
        console.log(`헤더 제외 후 ${developmentStagesDataRows.length}개 개발업무단계 데이터 처리`);
        
        // 중복 제거를 위한 Set
        const uniqueStageNames = new Set<string>();
        const orderedStageNames: string[] = [];
        
        // 유효한 값만 추가하고 순서 유지
        developmentStagesDataRows.forEach((row: string[]) => {
          if (row && row.length > 0 && row[0] && row[0].trim()) {
            const stageName = row[0].trim();
            console.log(`개발업무단계 데이터 발견: ${stageName}`);
            if (!uniqueStageNames.has(stageName)) {
              uniqueStageNames.add(stageName);
              orderedStageNames.push(stageName);
            }
          }
        });
        
        // 객체 형태로 변환 (DevelopmentStage 인터페이스 맞춤)
        orderedStageNames.forEach((name, index) => {
          developmentStages.push({
            id: index.toString(),
            name
          });
        });
        
        console.log(`개발업무단계 ${developmentStages.length}개 조회 완료`);
      } else {
        console.log("개발업무단계 데이터가 없어 기본 데이터 사용");
        defaultDevelopmentStages.forEach((name, index) => {
          developmentStages.push({
            id: index.toString(),
            name
          });
        });
      }
      
      // 소속 데이터 처리
      const orderedAffiliations: string[] = [];
      if (affiliationsRows && affiliationsRows.length > 1) {
        // 헤더 제외 처리
        const affiliationsDataRows = affiliationsRows.slice(1);
        console.log(`헤더 제외 후 ${affiliationsDataRows.length}개 소속 데이터 처리`);
        
        // 중복 제거를 위한 Set
        const uniqueAffiliations = new Set<string>();
        
        // 유효한 값만 추가하고 순서 유지
        affiliationsDataRows.forEach((row: string[]) => {
          if (row && row.length > 0 && row[0] && row[0].trim()) {
            const affiliation = row[0].trim();
            console.log(`소속 데이터 발견: ${affiliation}`);
            if (!uniqueAffiliations.has(affiliation)) {
              uniqueAffiliations.add(affiliation);
              orderedAffiliations.push(affiliation);
            }
          }
        });
        
        console.log(`소속 ${orderedAffiliations.length}개 조회 완료`);
      } else {
        console.log("소속 데이터가 없어 기본 데이터 사용");
        orderedAffiliations.push(...defaultAffiliations);
      }
      
      // 모델 데이터 처리
      const orderedModels: string[] = [];
      if (modelsRows && modelsRows.length > 1) {
        // 헤더 제외 처리
        const modelsDataRows = modelsRows.slice(1);
        console.log(`헤더 제외 후 ${modelsDataRows.length}개 모델 데이터 처리`);
        
        // 중복 제거를 위한 Set
        const uniqueModels = new Set<string>();
        
        // 유효한 값만 추가하고 순서 유지
        modelsDataRows.forEach((row: string[]) => {
          if (row && row.length > 0 && row[0] && row[0].trim()) {
            const model = row[0].trim();
            console.log(`모델 데이터 발견: ${model}`);
            if (!uniqueModels.has(model)) {
              uniqueModels.add(model);
              orderedModels.push(model);
            }
          }
        });
        
        console.log(`모델 ${orderedModels.length}개 조회 완료`);
      } else {
        console.log("모델 데이터가 없어 기본 데이터 사용");
        orderedModels.push(...defaultModels);
      }
      
      // 고객사 데이터 처리
      const orderedCustomers: string[] = [];
      if (customersRows && customersRows.length > 1) {
        // 헤더 제외 처리
        const customersDataRows = customersRows.slice(1);
        console.log(`헤더 제외 후 ${customersDataRows.length}개 고객사 데이터 처리`);
        
        // 중복 제거를 위한 Set
        const uniqueCustomers = new Set<string>();
        
        // 유효한 값만 추가하고 순서 유지
        customersDataRows.forEach((row: string[]) => {
          if (row && row.length > 0 && row[0] && row[0].trim()) {
            const customer = row[0].trim();
            console.log(`고객사 데이터 발견: ${customer}`);
            if (!uniqueCustomers.has(customer)) {
              uniqueCustomers.add(customer);
              orderedCustomers.push(customer);
            }
          }
        });
        
        console.log(`고객사 ${orderedCustomers.length}개 조회 완료`);
      } else {
        console.log("고객사 데이터가 없어 기본 데이터 사용");
        orderedCustomers.push(...defaultCustomers);
      }
      
      // 데이터 결과 요약 로깅
      console.log(`항목정보 데이터 조회 완료 - 개발업무단계: ${developmentStages.length}개, 소속: ${orderedAffiliations.length}개, 모델: ${orderedModels.length}개, 고객사: ${orderedCustomers.length}개`);
      
      // 최종 결과 반환
      return {
        developmentStages,
        affiliations: orderedAffiliations,
        models: orderedModels,
        customers: orderedCustomers
      };
    } catch (error) {
      console.error("항목정보 데이터 조회 실패:", error);
      
      // 오류 발생 시 기본값 반환
      const defaultDevelopmentStages = [
        "검토", "설계", "개발", "PROTO", "선행성", 
        "P1", "P2", "승인", "양산이관", "초도양산"
      ];
      const defaultAffiliations = ["전장", "유압", "전산"];
      const defaultModels = ["CAB TILT SYSTEM", "FUEL FILLER PUMP", "PUMP", "CYLINDER", "ETB", "TC ACTUATOR MOTOR"];
      const defaultCustomers = ["기아군수", "KUBOTA", "YAMADA", "DORMAN"];
      
      console.log("오류 발생으로 기본 데이터 반환");
      
      // 개발업무단계 객체로 변환
      const developmentStages = defaultDevelopmentStages.map((name, index) => ({
        id: index.toString(),
        name
      }));
      
      return {
        developmentStages,
        affiliations: defaultAffiliations,
        models: defaultModels,
        customers: defaultCustomers
      };
    }
  },
  ["item-data"],
  {
    revalidate: 60, // 1분마다 캐시 재검증 (기존 300에서 변경)
    tags: ["item-data"],
  }
); 
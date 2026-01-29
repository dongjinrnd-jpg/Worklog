"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId, addProjectHistory, ProjectHistoryData } from "@/lib/google/sheets";

/**
 * 프로젝트 데이터 인터페이스
 * 프로젝트 항목의 데이터 구조를 정의합니다.
 */
export interface Project {
  id: string;
  no: number | string;
  status: 'progress' | 'hold' | 'completed';  // 진행여부
  customer: string;        // 고객사
  affiliation?: string;   // 소속
  model?: string;         // 모델
  item: string;          // ITEM
  partNo?: string;        // PART NO
  managers?: string[];    // 개발담당
  developmentStages?: string[]; // 개발업무단계
  currentStage?: string;  // 현재단계
  schedule?: { start?: string; end?: string } | null;  // 대일정
  progress?: string;      // 업무진행사항
  issues?: string;        // 애로사항
  issueResolved?: boolean; // 애로사항 개선 여부
  issueResolutionDetails?: string; // 애로사항 개선 내용
  notes?: string;         // 비고
  additionalPlan?: string; // 업무추가 일정계획
  sellingPrice?: number;   // 판매가
  materialCost?: number;   // 재료비
  materialCostRatio?: number; // 재료비율
  createdAt: string;
  updatedAt: string;
}

/**
 * 프로젝트 업데이트 데이터 인터페이스
 * 업데이트 요청시 필요한 데이터 구조를 정의합니다.
 */
export interface UpdateProjectData {
  id: string;
  no?: number | string;
  status: 'progress' | 'hold' | 'completed';
  customer: string;
  affiliation?: string;
  model?: string;
  item: string;
  partNo?: string;
  managers?: string[];
  developmentStages?: string[];
  currentStage?: string;
  schedule?: { start?: string; end?: string } | null;
  progress?: string;
  notes?: string;
  additionalPlan?: string;
  issues?: string;        // 애로사항
  issueResolved?: boolean; // 애로사항 개선 여부
  issueResolutionDetails?: string; // 애로사항 개선 내용
  sellingPrice?: number;
  materialCost?: number;
  materialCostRatio?: number;
}

/**
 * 프로젝트 업데이트 함수
 * 기존 프로젝트의 정보를 업데이트합니다.
 */
export async function updateProject(projectData: UpdateProjectData) {
  try {
    console.log('프로젝트 업데이트 요청:', JSON.stringify(projectData, null, 2));
    
    // 진행여부 코드를 텍스트로 변환
    const statusMap: Record<string, string> = {
      'progress': '진행',
      'hold': '보류',
      'completed': '완료'
    };
    
    // Google Sheets API 클라이언트 및 스프레드시트 ID 가져오기
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 프로젝트 ID를 기반으로 행 번호 찾기
    // 실제 구현에서는 프로젝트 ID와 시트의 행 번호를 매핑하는 로직이 필요합니다.
    let rowIndex = 0;
    let originalNo = ""; // 원본 NO 값 저장 변수
    
    // 프로젝트 ID가 숫자인 경우 - ID를 사용하여 행 번호 찾기
    if (!isNaN(parseInt(projectData.id))) {
      // 여기서는 ID를 행 번호로 사용하지만, NO 값은 원본 값 유지해야 함
      rowIndex = parseInt(projectData.id) + 2; // A2부터 시작하므로 +2
      
      // 폼에서 전달된 NO 값이 있는지 확인
      if (projectData.no !== undefined && projectData.no !== null && projectData.no !== '') {
        originalNo = projectData.no.toString();
        console.log(`폼에서 전달된 NO 값 사용: ${originalNo}`);
      } else {
        // 원본 NO 값 조회 시도
        try {
          // 특정 행의 NO 값을 읽기 위한 API 호출
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `프로젝트!A${rowIndex}:A${rowIndex}`,
          });
          
          // API 응답에서 NO 값 추출
          const values = response.data.values;
          if (values && values.length > 0 && values[0].length > 0) {
            originalNo = values[0][0].toString();
            console.log(`ID ${projectData.id}에 대한 원본 NO 값 읽기 성공: ${originalNo}`);
          } else {
            // 값이 없으면 ID 사용
            originalNo = projectData.id;
            console.log(`원본 NO 값 없음, ID를 사용: ${originalNo}`);
          }
        } catch (error) {
          console.error("원본 NO 값 조회 실패, ID를 NO로 사용:", error);
          originalNo = projectData.id; // 조회 실패 시 ID 사용
        }
      }
    } else {
      // ID가 문자열인 경우 (특별 처리 필요)
      rowIndex = 3; // 예시: 기본값 3행
      
      // 폼에서 전달된 NO 값이 있는지 확인
      if (projectData.no !== undefined && projectData.no !== null && projectData.no !== '') {
        originalNo = projectData.no.toString();
        console.log(`문자열 ID - 폼에서 전달된 NO 값 사용: ${originalNo}`);
      } else {
        originalNo = "2"; // 예시: 원본 NO 값(변경하지 않음)
        console.log(`문자열 ID의 경우 기본 행 인덱스 사용: ${rowIndex}, 원본 NO 값: ${originalNo}`);
      }
    }
    
    // 개발담당자와 개발업무단계를 쉼표로 구분된 문자열로 변환
    const managersStr = projectData.managers && projectData.managers.length > 0 
      ? projectData.managers.join(',') 
      : '';
      
    const stagesStr = projectData.developmentStages && projectData.developmentStages.length > 0 
      ? projectData.developmentStages.join(',') 
      : '';
    
    console.log('개발담당자 문자열:', managersStr);
    console.log('개발업무단계 문자열:', stagesStr);
    console.log('현재단계:', projectData.currentStage);
    
    // 대일정 문자열 생성
    const scheduleStr = projectData.schedule 
      ? `${projectData.schedule.start || ''} ~ ${projectData.schedule.end || ''}` 
      : '';
    
    // 애로사항 개선 여부에 따른 애로사항 처리
    // 개선 여부가 체크되어 있으면 프로젝트 시트에는 애로사항을 공란으로 설정
    const issuesForSheet = projectData.issueResolved ? '' : (projectData.issues || '');
    // 이력관리를 위한 원본 애로사항 값 보존
    const originalIssuesValue = projectData.issues || '';
    
    // 업데이트할 모든 필드의 값 디버깅용 로그
    console.log('업데이트할 데이터 값:');
    console.log('NO(변경 안함):', originalNo);
    console.log('진행여부:', statusMap[projectData.status] || '진행');
    console.log('고객사:', projectData.customer);
    console.log('소속:', projectData.affiliation || '');
    console.log('모델:', projectData.model || '');
    console.log('ITEM:', projectData.item);
    console.log('PART NO:', projectData.partNo || '');
    console.log('개발담당:', managersStr);
    console.log('현재단계(I열):', projectData.currentStage || '');
    console.log('업무진행사항(J열):', projectData.progress || '');
    console.log('애로사항(K열):', issuesForSheet, '(개선 여부 체크됨:', projectData.issueResolved, ')');
    console.log('비고(L열):', projectData.notes || '');
    console.log('업무추가 일정계획(M열):', projectData.additionalPlan || '');
    console.log('개발업무단계(N열):', stagesStr);
    console.log('대일정(O열):', scheduleStr);
    console.log('판매가(P열):', projectData.sellingPrice?.toString() || '');
    console.log('재료비(Q열):', projectData.materialCost?.toString() || '');
    console.log('재료비율(R열):', projectData.materialCostRatio?.toString() || '');
    console.log('애로사항 개선 여부:', projectData.issueResolved ? 'O' : '');
    console.log('애로사항 개선 내용:', projectData.issueResolutionDetails || '');
    
    // 업데이트할 데이터 준비
    // 스프레드시트 열 구조에 맞게 데이터 구성
    const rowData = [
      [
        originalNo, // A열: NO (원본 번호 유지)
        statusMap[projectData.status] || '진행', // B열: 진행여부
        projectData.customer, // C열: 고객사
        projectData.affiliation || '', // D열: 소속
        projectData.model || '', // E열: 모델
        projectData.item, // F열: ITEM
        projectData.partNo || '', // G열: PART NO
        managersStr, // H열: 개발담당
        projectData.currentStage || '', // I열: 현재단계
        projectData.progress || '', // J열: 업무진행사항
        issuesForSheet, // K열: 애로사항 (개선 여부가 체크되었으면 공란)
        projectData.notes || '', // L열: 비고
        projectData.additionalPlan || '', // M열: 업무추가일정계획
        stagesStr, // N열: 개발업무단계
        scheduleStr, // O열: 대일정
        projectData.sellingPrice?.toString() || '', // P열: 판매가
        projectData.materialCost?.toString() || '', // Q열: 재료비
        projectData.materialCostRatio?.toString() || '', // R열: 재료비율
        new Date().toISOString() // S열: 수정일시 (현재 시간으로 업데이트)
      ]
    ];
    
    // 스프레드시트 열 순서 로그 - 설계 문서 기준 열 순서
    console.log('스프레드시트 열 순서:',
      'A:NO, B:진행여부, C:고객사, D:소속, E:모델, F:ITEM, G:PART NO, H:개발담당, I:현재단계, ' +
      'J:업무진행사항, K:애로사항, L:비고, M:업무추가일정계획, N:개발업무단계, ' +
      'O:대일정, P:판매가, Q:재료비, R:재료비율, S:수정일시');
    
    // Google Sheets API 호출하여 실제 데이터 업데이트
    try {
      console.log(`시트 업데이트: 행 ${rowIndex}, 데이터:`, rowData[0]);
      
      // A~S까지 모든 열을 포함 (19개 열)
      const updateResponse = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `프로젝트!A${rowIndex}:S${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rowData
        }
      });
      
      console.log('프로젝트 업데이트 성공:', projectData.item, '업데이트된 셀:', updateResponse.data.updatedCells);
      
      // 프로젝트 업데이트가 성공하면 이력 관리 시트에 변경 내역 기록
      // 업무진행사항, 업무추가 일정계획, 비고 필드 변경 확인
      try {
        // 기존 데이터 가져오기
        const originalData = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `프로젝트!A${rowIndex}:S${rowIndex}`,
        });
        
        const originalValues = originalData.data.values?.[0];
        
        // 변경 감지: 설계 문서 기준 인덱스 수정
        // 이전 값과 현재 값이 다르거나 둘 중 하나만 있는 경우를 변경으로 감지
        const progressChanged = projectData.progress !== (originalValues?.[9] || '');
        // 애로사항은 원본 값으로 비교 (개선 여부로 인해 공란이 되더라도 변경으로 감지)
        const issuesChanged = originalIssuesValue !== (originalValues?.[10] || '');
        const notesChanged = projectData.notes !== (originalValues?.[11] || ''); 
        const planChanged = projectData.additionalPlan !== (originalValues?.[12] || '');
        
        // 애로사항 개선 여부는 boolean이므로 특별 처리 (K열은 10번 인덱스)
        const originalIssueResolved = originalValues && originalValues.length > 10 ? originalValues[10] === 'O' : false;
        const issueResolvedChanged = projectData.issueResolved !== originalIssueResolved;
        
        // 애로사항 개선 내용 변경 감지
        const issueResolutionDetailsChanged = projectData.issueResolutionDetails !== (originalValues?.[11] || '');
        
        // 애로사항 개선 여부가 체크되었을 때는 항상 이력에 기록하도록 함
        const issueResolvedNowChecked = projectData.issueResolved && !originalIssueResolved;
        
        console.log('업무진행사항 변경됨:', progressChanged, '이전:', originalValues?.[9], '현재:', projectData.progress);
        console.log('애로사항 변경됨:', issuesChanged, '이전:', originalValues?.[10], '현재:', originalIssuesValue);
        console.log('비고 변경됨:', notesChanged, '이전:', originalValues?.[11], '현재:', projectData.notes);
        console.log('업무추가 일정계획 변경됨:', planChanged, '이전:', originalValues?.[12], '현재:', projectData.additionalPlan);
        console.log('애로사항 개선 여부 변경됨:', issueResolvedChanged, '이전:', originalIssueResolved, '현재:', projectData.issueResolved);
        console.log('애로사항 개선 여부 체크됨:', issueResolvedNowChecked);
        console.log('애로사항 개선 내용 변경됨:', issueResolutionDetailsChanged, '이전:', originalValues?.[11], '현재:', projectData.issueResolutionDetails);
        
        // 모든 데이터 변경을 항상 기록하도록 설정 (테스트용)
        const forceAddHistory = true;
        
        // 변경된 필드가 하나라도 있으면 이력 추가
        if (forceAddHistory || progressChanged || issuesChanged || notesChanged || planChanged || issueResolvedChanged || issueResolutionDetailsChanged || issueResolvedNowChecked) {
          console.log('프로젝트 변경 감지 또는 강제 이력 추가 활성화, 이력 추가 실행');
          
          // 이력 데이터 구성 - 열 순서에 맞게 올바르게 구성
          // 이력관리에는 애로사항 개선 여부와 관계없이 모든 정보 기록
          const historyData: ProjectHistoryData = {
            item: projectData.item, // C열
            partNo: projectData.partNo, // D열
            customer: projectData.customer, // E열
            managers: managersStr, // F열
            progress: projectData.progress || '', // G열: 업무진행사항
            additionalPlan: projectData.additionalPlan || '', // H열: 업무추가 일정계획
            notes: projectData.notes || '', // I열: 비고
            issues: originalIssuesValue, // J열: 애로사항 (원본 값 사용)
            issueResolved: projectData.issueResolved || false, // K열: 애로사항 개선 여부
            issueResolutionDetails: projectData.issueResolutionDetails || '', // L열: 애로사항 개선 내용
            editor: "시스템" // M열: 변경자 (실제 구현에서는 현재 로그인한 사용자 정보 활용)
          };
          
          console.log('이력 데이터 구성:', JSON.stringify(historyData, null, 2));
          
          // 이력 추가
          const historyResult = await addProjectHistory(historyData);
          if (historyResult.success) {
            console.log('프로젝트 이력 추가 완료');
          } else {
            console.error('프로젝트 이력 추가 실패:', historyResult.error);
            // 이력 추가 실패는 전체 업데이트 실패로 간주하지 않음 (로깅만 수행)
          }
        } else {
          console.log('변경 감지된 필드 없음, 이력 추가 스킵');
        }
      } catch (historyError) {
        console.error('이력 추가 중 오류 발생:', historyError);
        // 이력 추가 실패는 전체 업데이트 실패로 간주하지 않음 (로깅만 수행)
      }
      
    } catch (updateError) {
      console.error('Google Sheets API 호출 오류:', updateError);
      throw new Error(`데이터 업데이트 중 오류 발생: ${updateError instanceof Error ? updateError.message : '알 수 없는 오류'}`);
    }
    
    // 캐시 재검증
    revalidateTag('projects');
    revalidatePath('/project');
    
    return { success: true };
  } catch (error) {
    console.error('프로젝트 업데이트 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '프로젝트 업데이트 중 오류가 발생했습니다.' 
    };
  }
} 
import { google } from 'googleapis';
import { getGoogleSheetsClient, getSpreadsheetId } from './sheets';

/**
 * 새 시트를 생성하는 함수
 * 시트 이름과 헤더 배열을 받아 새 시트를 만들고 헤더를 설정
 */
async function createSheet(sheetTitle: string, headers: string[]) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 1. 새 시트 추가
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
              },
            },
          },
        ],
      },
    });
    
    console.log(`시트 생성 완료: ${sheetTitle}`);
    
    // 2. 헤더 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });
    
    console.log(`헤더 추가 완료: ${sheetTitle}`);
    
    return true;
  } catch (error) {
    // 이미 시트가 존재하는 경우 무시
    if ((error as Error).message.includes('already exists')) {
      console.log(`시트가 이미 존재합니다: ${sheetTitle}`);
      
      // 이미 존재하는 시트의 헤더 업데이트
      try {
        const sheets = await getGoogleSheetsClient();
        const spreadsheetId = await getSpreadsheetId();
        
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetTitle}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });
        
        console.log(`기존 시트 헤더 업데이트 완료: ${sheetTitle}`);
        return true;
      } catch (updateError) {
        console.error(`기존 시트 헤더 업데이트 실패: ${sheetTitle}`, updateError);
        return false;
      }
    } else {
      console.error(`시트 생성 실패: ${sheetTitle}`, error);
      return false;
    }
  }
}

/**
 * 샘플 데이터를 추가하는 함수
 * 시트 이름과 데이터 배열을 받아 샘플 데이터 추가
 */
async function addSampleData(sheetTitle: string, data: string[][]) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A2`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: data,
      },
    });
    
    console.log(`샘플 데이터 추가 완료: ${sheetTitle}`);
    return true;
  } catch (error) {
    console.error(`샘플 데이터 추가 실패: ${sheetTitle}`, error);
    return false;
  }
}

/**
 * 모든 필요한 시트를 생성하고 초기화하는 메인 함수
 * 업무일지, 프로젝트, 담당자 시트 생성 및 샘플 데이터 추가
 */
export async function initializeSpreadsheet() {
  try {
    console.log('스프레드시트 초기화 시작...');
    
    // 1. 업무일지 시트 생성
    const dailyLogHeaders = ['날짜', 'ITEM', 'PART NO', '단계', '담당자', '계획', '실적', '비고'];
    await createSheet('업무일지', dailyLogHeaders);
    
    // 2. 프로젝트 시트 생성
    const projectHeaders = [
      'NO', '진행여부', '고객사', '개발담당', 'ITEM', 'PART NO', 
      '개발업무단계', '대일정', '현재단계', '업무진행사항', 
      '애로사항', '비고', '업무추가 일정계획'
    ];
    await createSheet('프로젝트', projectHeaders);
    
    // 3. 담당자 시트 생성
    const managerHeaders = ['직급', '이름'];
    await createSheet('담당자', managerHeaders);
    
    // 4. 샘플 데이터 추가 (선택 사항)
    const addSampleDataFlag = true;
    
    if (addSampleDataFlag) {
      // 담당자 샘플 데이터
      const managerSampleData = [
        ['수석연구원', '홍길동'],
        ['선임연구원', '김철수'],
        ['연구원', '이영희']
      ];
      await addSampleData('담당자', managerSampleData);
      
      // 프로젝트 샘플 데이터
      const projectSampleData = [
        [
          '1', '진행중', 'ABC전자', '김철수,이영희', '전자제어장치', 'ECU-001', 
          '설계', '2023-04-01~2023-07-31', '회로설계', '회로도 작성 중', 
          '부품 조달 지연', '일정 조정 필요', '5월 초 1차 프로토타입 완성 예정'
        ]
      ];
      await addSampleData('프로젝트', projectSampleData);
      
      // 업무일지 샘플 데이터
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const dailyLogSampleData = [
        [today, '전자제어장치', 'ECU-001', '설계', '홍길동', '회로도 검토', '회로도 1차 검토 완료', '수정사항 2건 발견']
      ];
      await addSampleData('업무일지', dailyLogSampleData);
    }
    
    console.log('스프레드시트 초기화 완료!');
    return true;
  } catch (error) {
    console.error('스프레드시트 초기화 실패:', error);
    return false;
  }
}

/**
 * 스프레드시트 구조를 검증하는 함수
 * 필요한 모든 시트와 헤더가 올바르게 설정되어 있는지 확인
 */
export async function validateSpreadsheetStructure() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    // 스프레드시트 정보 가져오기
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetsList = response.data.sheets || [];
    const sheetTitles = sheetsList.map((sheet: {properties?: {title?: string}}) => sheet.properties?.title);
    
    // 필요한 시트 확인
    const requiredSheets = ['업무일지', '프로젝트', '담당자'];
    const missingSheets = requiredSheets.filter(title => !sheetTitles.includes(title));
    
    if (missingSheets.length > 0) {
      console.warn(`누락된 시트가 있습니다: ${missingSheets.join(', ')}`);
      return false;
    }
    
    console.log('스프레드시트 구조 검증 완료');
    return true;
  } catch (error) {
    console.error('스프레드시트 구조 검증 실패:', error);
    return false;
  }
} 
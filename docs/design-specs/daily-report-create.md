# 업무일지 등록 페이지 설계 문서

## 1. 개요

업무일지 등록 페이지는 사용자가 일일 업무 내용을 기록하고 Google 스프레드시트에 저장할 수 있는 전용 페이지입니다. 이 페이지는 날짜, 담당자, ITEM, PART NO, 단계, 계획, 실적, 비고 등 필수 정보를 입력할 수 있는 폼을 제공하며, 연관된 필드들 간의 의존성을 지능적으로 처리합니다.

---

## 2. 기능 요구사항

### 필수 기능
- 날짜 입력 필드 (기본값: 오늘 날짜)
- 담당자 선택 드롭다운 (`담당자` 시트 데이터 활용)
    - 담당자는 다수가 입력 될 수 있습니다.
    - 담당자는 사용자가 선택을 해야합니다.
    - 여러 담당자를 선택할 수 있는 다중 선택 기능 지원
    
- ITEM 선택 드롭다운 (선택된 담당자에 연결된 ITEM만 필터링하여 표시)
  - 여러 담당자 선택 시 첫 번째 선택한 담당자를 기준으로 ITEM 필터링
  - 프로젝트 시트에서 담당자 정보가 콤마(,)로 구분되어 있는 것을 고려하여 이름 포함 여부로 비교
  - 담당자 ID를 담당자 이름으로 변환하여 정확한 필터링 구현
  - 드롭다운의 placeholder 텍스트를 상황에 맞게 동적으로 변경하여, 사용자에게 현재 상태 안내
  - 결과 목록에 정렬(sort) 적용하여 사용자 편의성 개선
  - 의존성 관계(담당자→ITEM→PART NO/단계) 처리를 명확히 하고, 상위 선택 변경 시 하위 필드 초기화
- PART NO 표시 영역 (선택된 ITEM에 연결된 PART NO 자동 표시, 읽기 전용)
- 단계 표시 영역 (선택된 ITEM에 연결된 단계 자동 표시, 읽기 전용)
- 계획, 실적, 비고 텍스트 입력 필드 (다중 라인 입력 지원)
- 폼 제출 시 유효성 검증 (필수 필드 입력 확인)
- 제출 성공/실패 피드백 UI
- 폼 초기화 (리셋) 기능
- 자동 저장 기능 (임시 저장)

### 선택 기능
- 최근 작성한 업무일지 복사 기능
- 템플릿 저장 및 불러오기 기능
- 마크다운 또는 서식 있는 텍스트 지원 (계획, 실적 필드)
- 작성 중인 내용 자동 저장 (임시 저장)
- 작성 내용 미리보기

---

## 3. UI/UX 설계

### 페이지 레이아웃
```
+------------------------------------------+
|             헤더/네비게이션              |
+------------------------------------------+
|           업무일지 등록 양식             |
| +--------+-----------------------------+ |
| | 날짜   | [날짜 선택기]               | |
| +--------+-----------------------------+ |
| | 담당자 | [담당자 드롭다운]           | |
| +--------+-----------------------------+ |
| | ITEM         |      PART NO        | 단계  |
| +--------+-----------------------------+ |
| |[ITEM 드롭다운] | [PART NO TEXT(읽기모드)] | | [단계 드롭다운(읽기모드)] |
| +--------+-----------------------------+ |
| | 계획   | [다중 라인 텍스트 입력]     | |
| |        |                             | |
| +--------+-----------------------------+ |
| | 실적   | [다중 라인 텍스트 입력]     | |
| |        |                             | |
| +--------+-----------------------------+ |
| | 비고   | [다중 라인 텍스트 입력]     | |
| |        |                             | |
| +--------+-----------------------------+ |
|                                          |
| [저장하기]   [초기화]   [임시저장]       |
+------------------------------------------+
|            상태 피드백 영역              |
|  (저장 성공/실패 메시지, 로딩 표시기)    |
+------------------------------------------+
```

### 주요 컴포넌트

1. **날짜 선택 컴포넌트**
   - 캘린더 팝업 형태
   - 기본값: 오늘 날짜
   - 과거/미래 날짜 모두 선택 가능

2. **담당자 선택 컴포넌트**
   - 다중 선택 가능한 컴포넌트 (멀티셀렉트 또는 체크박스 리스트)
   - `담당자` 시트의 데이터 활용
   - 이름과 직급 함께 표시 (예: "홍길동 (과장)")
   - 선택된 담당자 태그 형태로 표시 (추가/삭제 용이)

3. **ITEM 선택 컴포넌트**
   - 단일 선택 드롭다운
   - 선택된 담당자 기준으로 `프로젝트` 시트에서 해당 담당자가 포함된 ITEM만 표시
   - 담당자가 변경되면 ITEM 목록 업데이트
   - ITEM이 변경되면 PART NO와 단계 목록 초기화

4. **PART NO 선택 컴포넌트**
   - 단일 선택 드롭다운
   - 선택된 ITEM 기준으로 `프로젝트` 시트에서 연관된 PART NO만 표시
   - ITEM이 변경되면 목록 업데이트

5. **단계 선택 컴포넌트**
   - 단일 선택 드롭다운
   - 선택된 ITEM 기준으로 `프로젝트` 시트에서 연관된 단계만 표시
   - ITEM이 변경되면 목록 업데이트

6. **텍스트 입력 컴포넌트**
   - 다중 라인 텍스트 영역 (Textarea)
   - Alt+Enter로 줄바꿈 지원
   - 계획, 실적, 비고 필드에 사용
   - 자동 크기 조절 기능 (내용에 따라 확장)

7. **버튼 컴포넌트**
   - 저장하기 버튼: 폼 데이터 제출
   - 초기화 버튼: 모든 필드 초기 상태로 복원
   - 임시저장 버튼: 현재 입력 상태를 로컬 스토리지에 저장

8. **피드백 컴포넌트**
   - 저장 성공/실패 메시지
   - 로딩 상태 표시
   - 유효성 검증 오류 메시지 표시

---

## 4. 데이터 흐름

1. **초기 데이터 로드**
   - 페이지 로드 시 `담당자` 시트 데이터 가져오기
   - `프로젝트` 시트 데이터 가져오기
   - 로컬 스토리지에서 임시 저장된 데이터 확인 및 복원

2. **필드 의존성 처리**
   - 담당자 선택 시 해당 담당자가 속한 ITEM 목록 필터링
   - ITEM 선택 시 해당 ITEM에 연관된 PART NO 및 단계 목록 필터링
   - 각 선택 변경 시 연관 필드 업데이트

3. **폼 제출 및 저장**
   - 유효성 검증 (필수 필드 입력 확인)
   - Google Sheets API로 데이터 전송
   - 응답에 따른 성공/실패 처리
   - 성공 시 폼 초기화 또는 유지 (사용자 설정에 따라)

4. **임시 저장**
   - 주기적 자동 저장 또는 사용자 요청 시 저장
   - 로컬 스토리지에 현재 폼 상태 저장
   - 페이지 재방문 시 임시 저장 데이터 복원 여부 확인

---

## 5. 기술 스택 및 컴포넌트

### 프론트엔드 기술
- React + Vite (PRD 요구사항)
- React Hook Form: 폼 상태 관리 및 유효성 검증
- Zod: 스키마 기반 폼 유효성 검증
- 날짜 선택기: react-datepicker
- UI 컴포넌트 라이브러리: shadcn/ui 또는 기본 HTML 컴포넌트 커스텀 스타일링
- LocalStorage API: 임시 저장 기능 구현

### 백엔드 기술
- Google Sheets API: 데이터 저장 및 조회
- Fetch API 또는 Axios: API 호출 처리

---

## 6. 구현 계획

### 1단계: 기본 폼 구조 구현
- 폼 레이아웃 및 기본 UI 구현
- 날짜 선택기, 텍스트 영역 등 기본 컴포넌트 구현
- React Hook Form 연동
- 기본 유효성 검증 구현

### 2단계: 데이터 연동 및 의존성 처리
- Google Sheets API 연동 구현
- 담당자 목록 가져오기
- 프로젝트 데이터 가져오기
- 필드 간 의존성 로직 구현 (담당자 → ITEM → PART NO / 단계)

### 3단계: 상태 관리 및 폼 제출
- 폼 제출 로직 구현
- 유효성 검증 강화
- 성공/실패 피드백 UI 구현
- 폼 초기화 기능

### 4단계: 사용자 경험 개선
- 로딩 상태 표시
- 에러 처리 개선
- 임시 저장 기능 구현
- 성능 최적화

---

## 7. API 설계

### 업무일지 등록 API (예시)

```javascript
// src/services/dailyReportAPI.js

// 담당자 목록 가져오기
export const fetchManagers = async () => {
  // Google Sheets API를 통해 담당자 시트 데이터 조회
  // 직급과 이름 정보 포함하여 반환
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/담당자!A2:B`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    const data = await response.json();
    
    // 반환값 가공: [{id: 1, name: '홍길동', position: '과장'}, ...]
    return data.values.map((row, index) => ({
      id: index + 1,
      position: row[0] || '',
      name: row[1] || '',
    }));
  } catch (error) {
    console.error('담당자 목록 조회 오류:', error);
    throw error;
  }
};

// 프로젝트 데이터 가져오기
export const fetchProjects = async () => {
  // Google Sheets API를 통해 프로젝트 시트 데이터 조회
  // 프로젝트 관련 필드 정보 반환
  // ...
};

// 업무일지 저장하기
export const saveDailyReport = async (reportData) => {
  // 데이터 유효성 검증
  if (!reportData.date || !reportData.managers || !reportData.managers.length || !reportData.item) {
    throw new Error('필수 필드가 누락되었습니다.');
  }
  
  // 담당자 이름 콤마로 구분하여 문자열로 변환
  const managersStr = reportData.managers
    .map(managerId => {
      const manager = managers.find(m => m.id === managerId);
      return manager ? `${manager.name} (${manager.position})` : '';
    })
    .filter(Boolean)
    .join(', ');
  
  // Google Sheets API를 통해 업무일지 시트에 데이터 추가
  try {
    const values = [
      [
        reportData.date,       // 날짜
        reportData.item,       // ITEM
        reportData.partNo,     // PART NO
        reportData.stage,      // 단계
        managersStr,           // 담당자 (콤마로 구분)
        reportData.plan,       // 계획
        reportData.performance,// 실적
        reportData.note        // 비고
      ]
    ];
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/업무일지!A:H:append`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: '업무일지!A:H',
          majorDimension: 'ROWS',
          values,
          valueInputOption: 'USER_ENTERED'
        })
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('업무일지 저장 오류:', error);
    throw error;
  }
};
```

---

## 8. UI 컴포넌트 세부 설계

---

## 9. 성능 고려사항

- **API 호출 최적화**
  - 필요한 데이터만 요청하여 불필요한 네트워크 트래픽 최소화
  - 담당자, 프로젝트 데이터 캐싱을 통한 반복 요청 방지

- **컴포넌트 렌더링 최적화**
  - `React.memo`를 활용한 불필요한 리렌더링 방지
  - 의존성 로직에 `useCallback`, `useMemo` 활용
  - 효율적인 상태 업데이트 (불변성 원칙 준수)

- **폼 입력 처리 최적화**
  - 디바운싱을 통한 실시간 유효성 검증 지연 처리
  - 대용량 텍스트 처리를 위한 입력 최적화

- **메모리 관리**
  - 로컬 스토리지 사용 시 저장 데이터 크기 제한 및 관리
  - 컴포넌트 마운트 해제 시 리소스 정리

---

## 10. 접근성 고려사항

- **키보드 접근성**
  - 모든 폼 요소에 대한 키보드 탐색 지원
  - 적절한 탭 순서 (tabindex) 설정
  - Enter 키로 드롭다운 선택 확인 가능

- **스크린 리더 호환성**
  - 모든 입력 필드에 적절한 `label` 요소 연결
  - ARIA 속성 사용 (`aria-required`, `aria-invalid` 등)
  - 오류 메시지를 스크린 리더가 읽을 수 있도록 설정

- **시각적 접근성**
  - 충분한 색상 대비 확보
  - 필수 입력 항목 명확히 표시
  - 오류 상태의 시각적 표현 (색상 + 아이콘)

- **입력 도움말**
  - 각 필드에 대한 도움말 텍스트 제공
  - 오류 발생 시 구체적인 해결 방법 안내

---

## 11. 테스트 계획

### 단위 테스트
- 각 컴포넌트의 독립적 기능 테스트
- 유효성 검증 로


### 단위 테스트
- 각 컴포넌트의 독립적 기능 테스트
- 유효성 검증 로직 테스트
- 필드 의존성 로직 테스트 (담당자 → ITEM → PART NO/단계)
- 자동 높이 조절 텍스트 영역 동작 테스트

### 통합 테스트
- 폼 제출 흐름 테스트
- Google Sheets API 연동 테스트
- 임시 저장 및 불러오기 기능 테스트
- 오류 처리 및 사용자 피드백 테스트

### 사용자 시나리오 테스트
- 새 업무일지 작성 시나리오
- 필수 필드 누락 시 오류 처리 시나리오
- 임시 저장 및 복원 시나리오
- 네트워크 오류 발생 시 대응 시나리오

### 브라우저 호환성 테스트
- 주요 브라우저 (Chrome, Firefox, Safari, Edge) 호환성 확인
- 대화형 요소 (드롭다운, 날짜 선택기 등) 브라우저별 동작 확인

---

## 12. 구현 세부사항 및 문제 해결 기록

### 12.1. 필드 의존성 처리 문제

#### 문제 상황
담당자 선택 시 해당 담당자가 속한 ITEM만 필터링하여 표시하고, ITEM 선택 시 해당 ITEM에 연관된 PART NO와 단계만 필터링하여 표시해야 하는데, 선택 순서가 꼬이거나 연관 필드가 정상적으로 초기화되지 않는 문제가 발생했습니다.

#### 원인 분석
1. **의존성 순서 문제**: 담당자 → ITEM → PART NO/단계 순으로 선택해야 하는데, 사용자가 다른 순서로 필드를 조작하는 경우 처리 로직이 미흡했습니다.
2. **비동기 데이터 로드 타이밍**: 프로젝트 데이터가 완전히 로드되기 전에 필터링 로직이 실행되는 경우가 발생했습니다.
3. **상태 업데이트 전파**: 상위 필드(담당자, ITEM) 변경 시 하위 필드(ITEM, PART NO/단계)의 상태가 적절히 초기화되지 않았습니다.

#### 구현한 해결책

1. **의존성 관리 개선**
   ```jsx
   // 담당자 변경 시 ITEM 필드 및 연관 필드 초기화 로직
   const handleManagerChange = (e) => {
     const selectedManager = e.target.value;
     setValue('manager', selectedManager);
     
     // ITEM 및 연관 필드 초기화
     setValue('item', '');
     setValue('partNo', '');
     setValue('stage', '');
     
     // 선택된 담당자에 따라 ITEM 필터링
     if (selectedManager && projects.length > 0) {
       const items = projects
         .filter(project => project.managers.includes(selectedManager))
         .map(project => project.item)
         .filter((item, index, self) => self.indexOf(item) === index);
       
       setFilteredItems(items);
     } else {
       setFilteredItems([]);
     }
     
     // PART NO, 단계 옵션 초기화
     setFilteredPartNos([]);
     setFilteredStages([]);
   };
   ```

2. **비동기 데이터 로드 개선**
   ```jsx
   // 초기 데이터 로드와 의존성 처리 분리
   const [isDataLoaded, setIsDataLoaded] = useState(false);
   
   useEffect(() => {
     const loadInitialData = async () => {
       try {
         // 담당자 및 프로젝트 데이터 로드
         const [managersData, projectsData] = await Promise.all([
           fetchManagers(),
           fetchProjects()
         ]);
         
         setManagers(managersData);
         setProjects(projectsData);
         setIsDataLoaded(true);
       } catch (error) {
         console.error('초기 데이터 로드 오류:', error);
       }
     };
     
     loadInitialData();
   }, []);
   
   // 데이터 로드 완료 후에만 의존성 처리 로직 실행
   useEffect(() => {
     if (!isDataLoaded) return;
     
     // 담당자 → ITEM → PART NO/단계 의존성 처리 로직
     // ...
   }, [selectedManager, selectedItem, isDataLoaded]);
   ```

3. **필드 비활성화 처리**
   ```jsx
   // 의존 필드 비활성화 처리
   <select
     id="item"
     {...register('item', { required: 'ITEM을 선택해주세요' })}
     disabled={!selectedManager || filteredItems.length === 0}
   >
     <option value="">ITEM 선택</option>
     {filteredItems.map((item, index) => (
       <option key={index} value={item}>{item}</option>
     ))}
   </select>
   
   <select
     id="partNo"
     {...register('partNo', { required: 'PART NO를 선택해주세요' })}
     disabled={!selectedItem || filteredPartNos.length === 0}
   >
     {/* 옵션들... */}
   </select>
   ```

#### 성능 및 제한사항

- **적용 시점 제어**: `useEffect`를 활용해 의존성 변경 시점에 정확히 필드 상태를 업데이트하도록 설계했으나, 복잡한 의존성 관계에서는 여전히 타이밍 문제가 발생할 수 있습니다.
- **에지 케이스 처리**: 데이터 불일치 상황(예: 선택된 담당자가 더 이상 해당 ITEM을 담당하지 않는 경우)에 대한 추가 처리가 필요합니다.
- **사용자 경험**: 필드 비활성화를 통해 사용자의 입력 순서를 강제하는 방식이 다소 제한적일 수 있습니다.

### 12.2. 다중 담당자 선택 및 처리

#### 문제 상황
업무일지에 다수의 담당자를 등록해야 하는 요구사항이 있으나, 기존의 단일 선택 드롭다운으로는 다중 선택이 불가능했습니다. 또한 여러 담당자를 선택할 경우 ITEM 필터링 로직이 복잡해지는 문제가 있었습니다.

#### 원인 분석
1. **UI 제한**: 기존 `<select>` 요소로는 직관적인 다중 선택 UI를 제공하기 어려움
2. **데이터 구조**: 다중 선택된 담당자 데이터를 처리하기 위한 적절한 상태 관리 부재
3. **의존성 처리**: 여러 담당자가 선택된 경우 ITEM 필터링 로직의 복잡성 증가

#### 구현한 해결책

1. **다중 선택 UI 컴포넌트 도입**
   ```jsx
   // react-select 라이브러리 활용 예시
   import Select from 'react-select';
   
   // 담당자 다중 선택 컴포넌트
   <Select
     isMulti
     name="managers"
     options={managers.map(manager => ({
       value: manager.id,
       label: `${manager.name} (${manager.position})`
     }))}
     className="basic-multi-select"
     classNamePrefix="select"
     placeholder="담당자 선택 (여러 명 선택 가능)"
     onChange={handleManagersChange}
     value={selectedManagers}
   />
   ```

2. **다중 담당자 선택 처리 로직**
   ```jsx
   // 다중 담당자 선택 변경 핸들러
   const handleManagersChange = (selectedOptions) => {
     // 선택된 담당자 ID 배열
     const managerIds = selectedOptions.map(option => option.value);
     // 폼 상태 업데이트
     setValue('managers', managerIds);
     setSelectedManagers(selectedOptions);
     
     // ITEM 및 연관 필드 초기화
     setValue('item', '');
     setValue('partNo', '');
     setValue('stage', '');
     
     // 선택된 담당자들 중 하나라도 속한 ITEM 필터링
     if (managerIds.length > 0 && projects.length > 0) {
       const items = projects
         .filter(project => 
           project.managerIds.some(managerId => 
             managerIds.includes(managerId)
           )
         )
         .map(project => project.item)
         .filter((item, index, self) => self.indexOf(item) === index);
       
       setFilteredItems(items);
     } else {
       setFilteredItems([]);
     }
     
     // PART NO, 단계 옵션 초기화
     setFilteredPartNos([]);
     setFilteredStages([]);
   };
   ```

3. **데이터 저장 형식 조정**
   ```jsx
   // 다중 담당자 처리를 위한 API 호출 수정
   const saveDailyReport = async (reportData) => {
     // 데이터 유효성 검증
     if (!reportData.date || !reportData.managers || !reportData.managers.length || !reportData.item) {
       throw new Error('필수 필드가 누락되었습니다.');
     }
     
     // 담당자 이름 콤마로 구분하여 문자열로 변환
     const managersStr = reportData.managers
       .map(managerId => {
         const manager = managers.find(m => m.id === managerId);
         return manager ? `${manager.name} (${manager.position})` : '';
       })
       .filter(Boolean)
       .join(', ');
     
     // Google Sheets API로 데이터 전송
     try {
       const values = [
         [
           reportData.date,       // 날짜
           reportData.item,       // ITEM
           reportData.partNo,     // PART NO
           reportData.stage,      // 단계
           managersStr,           // 담당자 (콤마로 구분)
           reportData.plan,       // 계획
           reportData.performance,// 실적
           reportData.note        // 비고
         ]
       ];
       
       // API 호출 로직...
     } catch (error) {
       console.error('업무일지 저장 오류:', error);
       throw error;
     }
   };
   ```

#### 성능 및 사용자 경험 개선

- **검색 기능 추가**: 담당자가 많을 경우 빠른 검색을 위한 필터링 기능 제공
- **선택된 담당자 시각화**: 태그 형태로 선택된 담당자를 표시하여 직관적인 UX 제공
- **전체/부분 선택 기능**: 부서별 또는 팀별로 그룹화하여 한 번에 여러 담당자 선택 가능
- **자주 선택하는 담당자 조합 저장**: 자주 함께 작업하는 담당자 그룹을 템플릿으로 저장하여 재사용

---

## 13. 향후 개선 사항

1. **UI/UX 개선**
   - 드래그 앤 드롭 파일 첨부 기능 추가
   - 계획/실적 텍스트 에디터 강화 (서식 지원)
   - 작성 중인 내용 자동 저장 주기 및 UI 피드백 개선

2. **데이터 처리 개선**
   - 오프라인 저장 및 동기화 기능
   - 자주 사용하는 내용 템플릿화
   - 일괄 업무일지 등록 기능

3. **성능 최적화**
   - API 요청 최적화 및 캐싱 전략 개선
   - 컴포넌트 지연 로딩 적용
   - 의존성 처리 로직 효율화

4. **접근성 개선**
   - 키보드 내비게이션 강화
   - 고대비 모드 및 다크 모드 지원
   - 스크린 리더 호환성 개선

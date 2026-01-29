# 업무일지 검색 페이지 설계 문서

## 1. 개요

업무일지 검색 페이지는 사용자가 전체 업무일지 데이터를 검색하고 필터링할 수 있는 전용 페이지입니다. 이 페이지를 통해 사용자는 날짜, 담당자, ITEM, PART NO, 단계 등 다양한 기준으로 업무일지를 검색하고 정렬할 수 있습니다.

---

## 2. 기능 요구사항

### 필수 기능
- 날짜 범위 기반 업무일지 필터링
- 담당자별 업무일지 필터링
- ITEM, PART NO, 단계별 필터링
- 검색어 기반 검색(ITEM, 단계, 담당자 필드만 대상)
  - 계획, 실적, PART NO, 비고는 검색 대상에서 제외
  - ';' 또는 ',' 구분자를 사용한 멀티 검색어 지원 (예: "하병욱;TY" 입력 시 담당자가 하병욱이고 ITEM이 TY인 항목 검색)
- 필터 조합 가능 (예: 특정 기간 내 특정 담당자의 업무일지)
- 필터링된 결과의 정렬 기능 (최신순, 담당자순, ITEM별 등)
- 페이지네이션 또는 무한 스크롤을 통한 대량 데이터 처리
- 페이지 초기 로드 및 초기화 시 오늘 날짜로 날짜 필터 자동 설정
- 인라인 확장 가능한 테이블로 줄바꿈이 있는 텍스트의 전체 내용 확인
- 행 확장 시 '수정하기' 버튼 제공으로 편리한 데이터 수정 접근성

### 선택 기능
- 검색 결과 엑셀/CSV 다운로드
- 자주 사용하는 검색 필터 저장 기능
- 그래프/차트를 통한 업무 통계 시각화

---

## 3. UI/UX 설계

### 페이지 레이아웃
```
+------------------------------------------+
|             헤더/네비게이션              |
+------------------------------------------+
| 검색어 입력        | 검색 버튼           |
+------------------------------------------+
|               필터 패널                  |
| +--------+ +--------+ +--------+ +-----+ |
| | 날짜   | | 담당자 | | ITEM   | | ... | |
| +--------+ +--------+ +--------+ +-----+ |
+------------------------------------------+
| 정렬 옵션 | 뷰 옵션 | 다운로드 | 초기화  |
+------------------------------------------+
|                                          |
|            검색 결과 테이블              |
|                                          |
| +---+------+------+-------+-------+----+ |
| | ▶ | 날짜 | ITEM | 담당자| 계획  | .. | |
| +---+------+------+-------+-------+----+ |
| | ▼ | 날짜 | ITEM | 담당자| 계획  | .. | |
| +---+------+------+-------+-------+----+ |
| |   | 확장된 행 - 전체 내용 표시     | |
| |   | 줄바꿈이 있는 텍스트도 보존됨  | |
| |   | [수정하기] 버튼                | |
| +---+------+------+-------+-------+----+ |
| | ▶ | 날짜 | ITEM | 담당자| 계획  | .. | |
| +---+------+------+-------+-------+----+ |
|                                          |
+------------------------------------------+
|            페이지네이션                  |
+------------------------------------------+
```

### 주요 컴포넌트

1. **검색 바**
   - 텍스트 검색 입력 필드 (ITEM, 단계, 담당자 필드만 검색)
     - ';' 또는 ',' 구분자로 여러 검색어 입력 가능
   - 검색 버튼
   - 상세 검색 토글

2. **필터 패널**
   - 날짜 범위 선택기 (DateRangePicker)
     - 페이지 로드 시 오늘 날짜로 자동 설정
     - 초기화 시 오늘 날짜로 재설정
   - 담당자 다중 선택 드롭다운 (Multi-select)
   - ITEM 다중 선택 드롭다운
   - PART NO 다중 선택 드롭다운
   - 단계 다중 선택 드롭다운
   - 적용된 필터 태그 표시 및 개별 삭제

3. **결과 컨트롤 바**
   - 정렬 옵션 드롭다운 (최신순, 담당자순, ITEM별 등)
   - 뷰 옵션 토글 (표 형식/카드 형식)
   - 결과 다운로드 버튼 (엑셀/CSV)
   - 필터 초기화 버튼

4. **결과 테이블/그리드**
   - 각 행 앞에 확장/축소 아이콘(▶/▼) 배치
   - 기본 상태에서는 텍스트가 긴 셀의 내용 일부만 표시 (truncate)
   - 확장 아이콘 클릭 시:
     - 해당 행 아래에 모든 필드의 전체 내용을 포맷팅하여 표시
     - 줄바꿈(Alt+Enter)이 포함된 텍스트는 원본 포맷 그대로 표시
     - '수정하기' 버튼이 확장된 영역 하단에 제공
     - 호버 시 배경색 변경으로 행 선택 가능 상태 표시
   - 열 헤더 (각 필드명)
   - 필요시 열 너비 조정 기능

5. **페이지네이션**
   - 페이지 번호
   - 이전/다음 페이지 버튼
   - 페이지당 항목 수 선택기

---

## 4. 데이터 흐름

1. **데이터 조회**
   - 서버 컴포넌트에서 Google Sheets API를 통해 업무일지 데이터 가져오기
   - 캐싱을 활용한 성능 최적화 (revalidate: 3600)

2. **데이터 필터링**
   - 클라이언트 컴포넌트에서 사용자 필터 설정에 따라 데이터 필터링
   - 검색어는 ITEM, 단계, 담당자 필드만 대상으로 필터링
   - 검색어가 ';' 또는 ',' 구분자로 구분된 경우, 각 검색어에 대해 AND 조건으로 필터링 (모든 검색어 조건을 동시에 충족해야 함)
   - 페이지 초기 로드 시 오늘 날짜 기준으로 필터링 자동 적용
   - 대용량 데이터의 경우 서버 액션을 통한 필터링 구현 검토

3. **데이터 정렬**
   - 사용자 선택에 따라 결과 정렬 (클라이언트 측)
   - 여러 필드 기준 복합 정렬 지원

4. **페이지네이션**
   - 초기 로드 시 첫 페이지 데이터만 가져오기
   - 페이지 변경 시 추가 데이터 요청 또는 클라이언트 측 페이지네이션

5. **행 확장 및 데이터 수정 흐름**
   - 사용자가 확장 아이콘(▶) 클릭
   - 클라이언트 컴포넌트에서 행 확장 상태 변경
   - 확장된 행에 모든 필드의 전체 내용 표시
   - '수정하기' 버튼 클릭 시 수정 페이지로 이동:
     - 행의 ID를 URL 파라미터로 전달
     - 또는 행 데이터를 localStorage/sessionStorage에 임시 저장

---

## 5. 기술 스택 및 컴포넌트

### 프론트엔드 기술
- Next.js 서버 컴포넌트 / 클라이언트 컴포넌트 분리
- Shadcn UI 컴포넌트 라이브러리
  - `DataTable` 컴포넌트: 결과 테이블 표시
  - `DateRangePicker` 컴포넌트: 날짜 범위 선택
  - `Combobox` / `MultiSelect` 컴포넌트: 다중 필터 선택
  - `Button`, `Card` 등 기본 UI 컴포넌트
  - `Collapsible` 컴포넌트: 행 확장/축소 기능 구현
- React Hook Form: 필터 양식 상태 관리
- Zod: 검색/필터 유효성 검증

### 백엔드 기술
- Next.js 서버 액션을 활용한 데이터 조회 및 필터링
- Google Sheets API를 통한 데이터 접근
- 캐싱 전략을 활용한 성능 최적화

---

## 6. 구현 계획

### 1단계: 기본 검색 페이지 구조 구현
- 검색 페이지 라우트 (/daily-report/search) 설정
- 기본 UI 레이아웃 구현
- 간단한 텍스트 검색 및 날짜 필터 구현
- 오늘 날짜 자동 설정 기능 구현

### 2단계: 고급 필터링 및 검색 기능
- 여러 필드 기반 다중 필터 구현
- 다중 검색어 지원 (';' 또는 ',' 구분자 사용)
- 필터 조합 로직 구현
- 검색 히스토리 저장 기능

### 3단계: 결과 표시 개선
- 테이블/카드 뷰 전환 기능
- 인라인 확장 가능한 테이블 구현:
  - 확장/축소 아이콘 및 기능 구현
  - 확장 시 전체 텍스트 포맷팅 (줄바꿈 보존)
  - 수정하기 버튼 및 기능 연결
- 정렬 및 페이지네이션 구현
- 결과 다운로드 기능

### 4단계: 성능 최적화
- 서버 측 데이터 필터링 최적화
- 캐싱 전략 개선
- 대용량 데이터 처리 최적화

---

## 7. API 설계

### 업무일지 검색 서버 액션 (예시)

```typescript
// app/actions/search-daily-reports.ts
"use server";

import { unstable_cache as cache } from "next/cache";

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

export const searchDailyReports = cache(
  async (params: SearchParams) => {
    // Google Sheets API를 통한 데이터 조회 및 필터링 로직
    // 검색어(query)는 ITEM, 단계, 담당자 필드만 대상으로 필터링
    // ";" 또는 "," 구분자로 검색어를 분리하여 각 검색어에 대해 AND 조건으로 필터링 (모든 조건 충족 필요)
    // ...
    return {
      data: [], // 필터링된 업무일지 데이터
      total: 0, // 전체 결과 수
      page: 1,  // 현재 페이지
      pageSize: 20, // 페이지당 항목 수
    };
  },
  ["search-daily-reports"],
  {
    revalidate: 3600,
    tags: ["daily-reports"],
  }
);
```

---

## 8. UI 컴포넌트 세부 설계

### SearchForm 컴포넌트
```typescript
interface SearchFormProps {
  defaultValues?: SearchParams;
  onSubmit: (values: SearchParams) => void;
}

function SearchForm({ defaultValues, onSubmit }: SearchFormProps) {
  // React Hook Form을 사용한 폼 상태 관리
  // 검색어, 날짜 범위, 다중 선택 필터 등 구현
  // 검색어는 ITEM, 단계, 담당자 필드만 대상으로 검색
  // 검색어 입력 시 ';' 또는 ',' 구분자로 여러 검색어 입력 가능 (AND 조건)
  // 초기화 시 오늘 날짜로 자동 설정
}
```

### SearchResults 컴포넌트 (확장 가능한 테이블)
```typescript
interface SearchResultsProps {
  results: SearchResult;
  onPageChange: (page: number) => void;
  onRowEdit: (reportId: string) => void;
}

function SearchResults({ results, onPageChange, onRowEdit }: SearchResultsProps) {
  // 행 확장 상태 관리
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // 행 확장/축소 토글 핸들러
  const toggleRowExpand = (reportId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  // Shadcn DataTable을 활용한 테이블 구현
  // 테이블 행 렌더링
  // 각 행에 확장/축소 아이콘 및 기능 구현
  // 확장된 행에 원본 포맷 텍스트 및 '수정하기' 버튼 표시
  // 정렬, 페이지네이션 등 구현
}
```

### FormattedText 컴포넌트 (줄바꿈 처리)
```typescript
interface FormattedTextProps {
  text: string;
  truncate?: boolean;
  maxLength?: number;
}

function FormattedText({ text, truncate = false, maxLength = 100 }: FormattedTextProps) {
  // 줄바꿈 문자(\n)를 <br> 태그로 변환하여 텍스트 포맷팅
  // truncate가 true인 경우 maxLength까지만 텍스트 표시 후 '...' 추가
  // 텍스트가 없는 경우 "-" 또는 빈 문자열 반환
}
```

---

## 9. 성능 고려사항

- 대량 데이터 처리를 위한 서버 측 필터링 및 페이지네이션
- 검색 결과 캐싱을 통한 API 호출 최소화
- 확장된 행 상태 관리 최적화 (메모이제이션 등 활용)
- 컴포넌트 지연 로딩을 통한 초기 로드 시간 최적화
- 서버 컴포넌트와 클라이언트 컴포넌트의 적절한 분리

---

## 10. 접근성 고려사항

- 키보드 접근성 보장 (행 확장/축소 및 수정 버튼에 대한 키보드 탐색)
- 스크린 리더 호환성
- 적절한 ARIA 속성 사용 (확장/축소 상태 표시)
- 충분한 색상 대비 확보
- 반응형 디자인을 통한 모바일 접근성

---

## 11. 테스트 계획

- 다양한 검색 시나리오에 대한 단위 테스트
- 다중 검색어를 사용한 검색 시나리오 테스트 (AND 조건)
- 행 확장/축소 기능 테스트 (다양한 길이의 텍스트 및 줄바꿈 처리)
- 수정 페이지 연동 테스트
- 필터 조합의 동작 테스트
- 대량 데이터 로딩 성능 테스트
- 다양한 디바이스 및 브라우저 호환성 테스트

---

## 12. 구현 세부사항 및 문제 해결 기록

### 12.1. 업무일지 수정 후 UI 반영 문제

#### 문제 상황
업무일지의 계획, 실적, 비고 데이터를 수정하고 저장한 후 확장된 행(ExpandedRow)에서는 수정된 내용이 보이지만, 일반 행(테이블 뷰)에는 변경사항이 즉시 반영되지 않았습니다. 사용자가 검색 버튼을 다시 누르거나 페이지를 새로고침해야만 변경사항이 테이블에 표시되는 불편함이 있었습니다.

#### 원인 분석
1. **상태 관리 문제**: ExpandedRow 컴포넌트는 자체 로컬 상태를 유지하여 업데이트된 데이터를 관리했지만, 상위 컴포넌트(SearchResults)의 행 목록 데이터와 동기화가 이루어지지 않았습니다.
2. **참조 불일치**: 업데이트 시 로컬 상태를 기반으로 객체를 생성하여 원본 데이터와의 일관성이 깨졌습니다.
3. **리렌더링 부족**: 데이터가 변경되었지만 React에게 변경을 알리지 않아 UI가 갱신되지 않았습니다.

#### 구현한 해결책

1. **ExpandedRow 컴포넌트 개선**
   ```typescript
   // 업데이트 로직 개선
   useEffect(() => {
     setCurrentReport(report);
     setEditData({
       plan: report.plan || "",
       performance: report.performance || "",
       note: report.note || ""
     });
   }, [report]);

   // 저장 핸들러
   const handleSaveClick = async () => {
     // 업데이트된 데이터로 보고서 객체 생성
     const updatedReport = {
       ...report, // props로 전달받은 원본 report 사용
       plan: editData.plan,
       performance: editData.performance,
       note: editData.note
     };
     
     // 서버 액션 호출 및 저장 로직...
     
     // 부모 컴포넌트에 업데이트 알림
     if (onUpdate) {
       onUpdate(updatedReport);
     }
   };
   ```

2. **SearchResults 컴포넌트 개선**
   ```typescript
   // 강제 리렌더링 메커니즘 추가
   const forceUpdate = useRef(0);
   
   // 업무일지 데이터 업데이트 핸들러
   const handleReportUpdate = (updatedReport: DailyReport) => {
     setData(prevData => {
       const newData = prevData.map(report => 
         report.id === updatedReport.id ? {...report, ...updatedReport} : report
       );
       
       // 로컬 스토리지에도 업데이트
       // ...
       
       // 강제 리렌더링을 위한 카운터 증가
       forceUpdate.current += 1;
       
       return newData;
     });
   };
   
   // 리액트 Fragment의 key 속성에 카운터 값 포함
   <React.Fragment key={`${report.id}-${forceUpdate.current}`}>
     {/* 행 내용... */}
   </React.Fragment>
   ```

3. **localStorage를 활용한 상태 유지**
   ```typescript
   // 검색 결과 및 파라미터를 localStorage에 저장
   localStorage.setItem('searchState', JSON.stringify({
     params,
     results,
     timestamp: new Date().getTime()
   }));
   
   // 페이지 로드 시 저장된 상태 복원
   useEffect(() => {
     const loadSavedState = () => {
       try {
         const savedState = localStorage.getItem('searchState');
         if (savedState) {
           const parsedState = JSON.parse(savedState);
           if (parsedState.results) {
             setSearchResults(parsedState.results);
             return true;
           }
         }
       } catch (error) {
         console.error("저장된 상태 복원 오류:", error);
       }
       return false;
     };
     
     // 상태 복원 또는 새 검색 실행
     // ...
   }, []);
   ```

#### 성능 및 제한사항

- **강제 리렌더링 비용**: `forceUpdate` 메커니즘은 전체 테이블이 리렌더링되도록 하여 성능에 영향을 줄 수 있습니다.
- **로컬 상태 동기화**: props와 state를 동기화하는 방식은 React의 단방향 데이터 흐름에서 때때로 복잡성을 증가시킬 수 있습니다.
- **localStorage 한계**: 크기 제한이 있어 대량의 데이터를 저장하는 경우 문제가 될 수 있습니다.

#### 검토 결과
Claude 3.7 Sonnet을 통해 구현한 해결책으로 기본 기능 요구사항을 충족했지만, 장기적으로는 상태 관리 라이브러리(Redux, Zustand 등)를 도입하거나 Context API를 활용한 보다 체계적인 상태 관리 방식을 고려해볼 필요가 있습니다.

---

## 13. 향후 개선 사항

1. **상태 관리 개선**
   - Redux, Zustand 또는 Context API를 활용한 전역 상태 관리 구현
   - 컴포넌트 간 데이터 일관성 유지 메커니즘 개선

2. **성능 최적화**
   - 가상화된 테이블(react-window 등) 도입으로 대량 데이터 처리 최적화
   - 불필요한 리렌더링 방지 및 메모이제이션 기법 적용

3. **사용자 경험 향상**
   - 업데이트 시 시각적 피드백 개선
   - 인라인 편집 기능을 통한 페이지 전환 없는 빠른 수정 환경 구현

4. **코드 구조 개선**
   - 컴포넌트 모듈화 강화 및 테스트 용이성 개선
   - 타입 안전성 강화 
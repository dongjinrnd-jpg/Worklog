# 프로젝트 수정 페이지 설계 문서

## 1. 개요

프로젝트 수정 기능은 사용자가 기존 프로젝트 정보를 조회하고 수정할 수 있게 해주는 기능입니다. 사용자는 프로젝트 목록 페이지에서 특정 프로젝트를 선택하고 [프로젝트 수정] 버튼을 클릭하여 모달창을 통해 진행여부, 고객사, ITEM, PART NO 등 다양한 프로젝트 관련 정보를 수정할 수 있습니다. 수정된 데이터는 Google 스프레드시트의 `프로젝트` 시트에 업데이트되며, 변경 내역은 `프로젝트이력관리` 시트에 기록됩니다.

---

## 2. 기능 요구사항

### 필수 기능
- 프로젝트 정보 수정 폼 제공
  - 진행여부, 고객사, 소속, 모델, ITEM, PART NO, 개발담당, 현재단계, 업무진행사항, 애로사항, 비고, 업무추가 일정계획, 개발업무단계, 대일정, 판매가, 재료비, 재료비율 수정 필드 구현
- 개발담당자 다중 선택 기능
  - `담당자` 시트 데이터 활용
  - 직급과 이름 함께 표시
  - 검색 기능으로 담당자 빠르게 찾기
- 애로사항 개선 여부 관리
  - 애로사항 해결 여부 체크 기능
  - 애로사항 개선 내용 입력 텍스트 필드
  - 이력 관리 시트에 개선 상태 기록
- 원본 데이터 변환 처리
  - 다양한 형식의 프로젝트 데이터 호환 처리
  - 문자열, 객체 등 다양한 타입의 필드값 정규화
- 유효성 검증
  - 필수 입력 필드 검증
  - 입력 형식 검증 (날짜, 텍스트 길이 등)
- 성공/실패 피드백 UI
  - 수정 작업 결과 피드백 제공
- 변경 내역 추적
  - 업무진행사항, 비고, 업무추가 일정계획, 애로사항, 애로사항 개선 여부 필드의 변경 내역 기록
  - `프로젝트이력관리` 시트에 변경 내역 저장

### 프로젝트 수정 폼 세부 기능
- 기존 프로젝트 정보 미리 로드 (기본값으로 설정)
- 필수 필드 표시 (*)
- 진행여부 변경 기능 (라디오 버튼)
- 고객사 및 ITEM 필수 입력 필드
- PART NO 선택적 입력 필드 
- 개발담당 다중 선택 컴포넌트 (기존 선택 항목 표시)
- 개발업무단계 다중 선택 컴포넌트 (`항목정보` 시트 참조)
- 대일정(시작일/종료일) 날짜 선택기 (기존 날짜 표시)
- 애로사항 개선 여부 체크박스 필드 (애로사항 이력 관리)
  - 애로사항이 있는 경우 해결 여부 체크 가능
  - 체크 시 이력 관리 시트에 개선 여부 기록
- 원본 프로젝트 데이터 변환 기능 (다양한 형식의 입력 데이터 처리)
- 고객사, 소속, 모델 등 자동 완성 기능 (항목정보 시트 참조)
- 저장/취소/초기화 버튼

---

## 3. UI/UX 설계

### 프로젝트 수정 모달
```
+------------------------------------------+
|    프로젝트 수정     |        X        |
+------------------------------------------+
| 진행여부*:     | [라디오 버튼]          |
|               | ● 진행 ○ 보유 ○ 완료    |
+------------------------------------------+
| 고객사*:       | [고객사 입력 필드]     |
|               | (항목정보 시트 D열 참조) |
+------------------------------------------+
| 소속:          | [소속 입력 필드]       |
|               | (항목정보 시트 B열 참조) |
+------------------------------------------+
| 모델:          | [모델 입력 필드]       |
|               | (항목정보 시트 C열 참조) |
+------------------------------------------+
| ITEM*:         | [ITEM 입력 필드]       |
+------------------------------------------+
| PART NO:       | [PART NO 입력 필드]    |
+------------------------------------------+
| 개발담당:      | [담당자 다중 선택]     |
+------------------------------------------+
| 개발업무단계:  | [업무단계 다중 선택]   |
|               | (항목정보 시트 A열 참조) |
+------------------------------------------+
| 대일정(시작일): | [날짜 선택기]          |
+------------------------------------------+
| 대일정(종료일): | [날짜 선택기]          |
+------------------------------------------+
| 현재단계:      | [단계 선택 드롭다운]   |
+------------------------------------------+
| 업무진행사항:  | [다중 라인 텍스트 필드] |
+------------------------------------------+
| 애로사항:      | [다중 라인 텍스트 필드] |
+------------------------------------------+
| 애로사항 개선여부: | [체크박스]           |
+------------------------------------------+
| 애로사항 개선내용: | [다중 라인 텍스트 필드] |
+------------------------------------------+
| 비고:          | [다중 라인 텍스트 필드] |
+------------------------------------------+
| 업무추가 일정계획: | [다중 라인 텍스트 필드] |
+------------------------------------------+
| 판매가:        | [숫자 입력 필드]       |
+------------------------------------------+
| 재료비:        | [숫자 입력 필드]       |
+------------------------------------------+
| 재료비율(%):   | [숫자 입력 필드]       |
+------------------------------------------+
|                                          |
| [저장하기]     [취소]     [초기화]       |
+------------------------------------------+
```

---

## 4. 데이터 흐름

### 프로젝트 수정 흐름
1. 프로젝트 목록에서 특정 프로젝트 행 확장 → [프로젝트 수정] 버튼 클릭 → 모달 표시
2. 기존 프로젝트 데이터 로드 및 폼에 표시
3. 필드 수정 및 유효성 검증
4. 저장 버튼 클릭 → Google Sheets API를 통해 `프로젝트` 시트의 해당 행 업데이트
5. 프로젝트 업무관련 필드에 변경이 있는 경우:
   - 기존 데이터와 비교하여 변경 내역 확인
   - `프로젝트이력관리` 시트에 변경내역 기록 (날짜, ITEM, PART NO, 업무진행사항, 업무추가 일정계획, 애로사항, 애로사항 개선 여부)
6. 성공/실패 피드백 제공
7. 성공 시 모달 닫기 및 프로젝트 목록 갱신 (revalidatePath/revalidateTag)

### 4.1 프로젝트이력관리 시트 설계 및 이력관리 프로세스

#### 📄 항목정보 시트 (`항목정보`)
| 개발단계명 | 소속  | 모델 | 고객사 |
|----------|------|------| ------|

#### 📄 프로젝트이력관리 시트 (`프로젝트이력관리`)
| 순번 | 날짜 | ITEM | PART NO | 고객사 | 담당자 | 업무진행사항 | 업무추가 일정계획 | 비고 | 애로사항 | 애로사항 개선 여부 | 변경자 | 변경 시간 |
|------|------|------|---------|-------|--------|--------------|------------------|------|---------|---------------|--------|----------|

#### 이력관리 프로세스 단계
프로젝트 이력 관리는 다음 5단계 프로세스로 진행됩니다:

1. **변경 감지**
   - 프로젝트 수정 폼 제출 시 기존 값과 변경된 값 비교
   - 업무진행사항(J열), 애로사항(K열), 비고(L열), 업무추가 일정계획(M열), 애로사항 개선 여부 필드 변경 감지
   - 관련 필드가 변경되었을 때만 이력 추가 프로세스 진행

2. **이력 데이터 구성**
   - 현재 날짜 및 시간 기록
   - 프로젝트 식별 정보(ITEM, PART NO, 고객사) 포함
   - 변경된 필드 내용만 이력 데이터에 포함
   - 사용자 정보(변경자) 기록

3. **이력 저장**
   - Google Sheets API를 통해 `프로젝트이력관리` 시트에 새 행으로 이력 추가
   - 행 추가 성공 여부 확인 및 오류 처리

4. **애로사항 개선 처리**
   - 애로사항 개선 여부가 체크된 경우, 개선 내용과 함께 이력 저장
   - 애로사항 개선 여부가 변경된 경우(체크 <-> 미체크), 이력에 변경 사항 기록
   - 애로사항과 개선 내용의 연관성 유지 및 추적

5. **이력 조회 기능**
   - 프로젝트별 이력 내역 조회 기능 제공
   - 날짜 기준 필터링 기능
   - 특정 필드(애로사항, 업무진행사항 등) 기준 이력 검색 기능

#### 데이터 정합성 확보
- 이력 추가 실패 시 프로젝트 업데이트 롤백 메커니즘 구현
- 프로젝트 데이터와 이력 데이터의 연결 무결성 유지
- 정기적인 이력 데이터 백업 및 복구 방안 마련

---

## 5. 기술 스택 및 컴포넌트

### 프론트엔드 기술
- Next.js 서버 컴포넌트 / 클라이언트 컴포넌트 분리
- Shadcn UI 컴포넌트 라이브러리
  - `Dialog` 컴포넌트: 프로젝트 수정 모달
  - `Form` 컴포넌트: 입력 폼 및 유효성 검증
  - `DatePicker` 컴포넌트: 날짜 및 기간 선택
  - `MultiSelect` 컴포넌트: 개발담당자 다중 선택
  - `Button` 등 기본 UI 컴포넌트
- React Hook Form: 폼 상태 관리 및 유효성 검증
- Zod: 스키마 기반 폼 유효성 검증

### 백엔드 기술
- Next.js 서버 액션을 활용한 데이터 업데이트
- Google Sheets API를 통한 데이터 수정
- 변경 내역 감지 및 기록 로직

### 이력관리 프로세스

---

## 6. API 설계

### 프로젝트 수정 서버 액션

```typescript
/**
 * 프로젝트 데이터 인터페이스
 */
export interface Project {
  id: string;
  no: number;
  status: 'progress' | 'hold' | 'completed'; // 진행여부 (진행, 보유, 완료)
  customer: string;
  affiliation?: string; // 소속
  model?: string; // 모델
  item: string;
  partNo?: string;
  managers?: string[];  //담당자
  developmentStages?: string[]; // 다중 선택 가능한 개발업무단계
  currentStage?: string; // 현재단계
  schedule?: { start?: string; end?: string } | null;
  progress?: string; // 업무진행사항
  additionalPlan?: string; // 업무추가 일정계획
  issues?: string; // 애로사항
  issueResolved?: boolean; // 애로사항 개선 여부
  notes?: string; // 비고
  sellingPrice?: number; // 판매가
  materialCost?: number; // 재료비
  materialCostRatio?: number; // 재료비율
  createdAt: string;
  updatedAt: string;
}

/**
 * 프로젝트 이력 데이터 인터페이스
 */
export interface ProjectHistory {
  id: string;
  date: string;
  item: string;
  partNo: string;
  progress?: string; // 업무진행사항
  additionalPlan?: string; // 업무추가 일정계획
  issues?: string; // 애로사항
  issueResolved?: boolean; // 애로사항 개선 여부
}

/**
 * 프로젝트 수정 함수
 * @param id 프로젝트 ID
 * @param data 업데이트할 프로젝트 데이터
 * @param previousData 기존 프로젝트 데이터
 */
export const updateProject = async (id: string, data: Partial<Project>, previousData?: Project) => {
  try {
    // 기존 프로젝트 데이터 가져오기
    if (!previousData) {
      previousData = await getProject(id);
      if (!previousData) {
        return { success: false, error: '프로젝트를 찾을 수 없습니다.' };
      }
    }
    
    // 개발담당자와 개발업무단계를 쉼표로 구분된 문자열로 변환
    const managersStr = data.managers && data.managers.length > 0 ? data.managers.join(',') : '';
    const stagesStr = data.developmentStages && data.developmentStages.length > 0 ? data.developmentStages.join(',') : '';
    
    // 진행여부 코드를 텍스트로 변환
    const statusMap: Record<string, string> = {
      'progress': '진행',
      'hold': '보유',
      'completed': '완료'
    };
    
    // Google Sheets API로 업데이트할 데이터 준비
    const rowData = [
      previousData.no.toString(), // NO (변경 불가)
      data.status ? statusMap[data.status] : statusMap[previousData.status] || '진행', // 진행여부
      data.customer || previousData.customer, // 고객사
      data.affiliation || previousData.affiliation || '', // 소속
      data.model || previousData.model || '', // 모델
      data.item || previousData.item, // ITEM
      data.partNo || previousData.partNo || '', // PART NO
      managersStr || (previousData.managers ? previousData.managers.join(',') : ''), // 개발담당
      stagesStr || (previousData.developmentStages ? previousData.developmentStages.join(',') : ''), // 개발업무단계
      data.schedule 
        ? `${data.schedule.start || ''} ~ ${data.schedule.end || ''}` 
        : (previousData.schedule ? `${previousData.schedule.start || ''} ~ ${previousData.schedule.end || ''}` : ''), // 대일정
      data.currentStage || previousData.currentStage || '', // 현재단계
      data.progress || previousData.progress || '', // 업무진행사항
      data.issues || previousData.issues || '', // 애로사항
      data.notes || previousData.notes || '', // 비고
      data.additionalPlan || previousData.additionalPlan || '', // 업무추가 일정계획
      data.sellingPrice?.toString() || (previousData.sellingPrice?.toString() || ''), // 판매가
      data.materialCost?.toString() || (previousData.materialCost?.toString() || ''), // 재료비
      data.materialCostRatio?.toString() || (previousData.materialCostRatio?.toString() || ''), // 재료비율
      previousData.createdAt, // createdAt (변경 불가)
      new Date().toISOString(), // updatedAt (현재 시간으로 업데이트)
    ];
    
    // Google Sheets API를 사용하여 데이터 업데이트
    // sheet.update() 또는 유사한 함수를 호출하여 해당 행 업데이트
    
    // 업무관련 필드 변경 감지 및 이력 기록
    if (data.progress !== previousData.progress || 
        data.additionalPlan !== previousData.additionalPlan || 
        data.issues !== previousData.issues ||
        data.issueResolved !== previousData.issueResolved ||
        data.notes !== previousData.notes) {
      
      // 프로젝트이력관리 시트에 변경내역 추가
      await addProjectHistory({
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
        item: data.item || previousData.item,
        partNo: data.partNo || previousData.partNo || '',
        progress: data.progress,
        additionalPlan: data.additionalPlan,
        issues: data.issues,
        issueResolved: data.issueResolved,
        notes: data.notes
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('프로젝트 업데이트 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 프로젝트 이력 추가 함수
 * @param data 추가할 이력 데이터
 */
export const addProjectHistory = async (data: Omit<ProjectHistory, 'id'>) => {
  try {
    // 프로젝트이력관리 시트에 새로운 이력 추가
    const values = [
      [
        data.date,
        data.item,
        data.partNo,
        data.progress || '',
        data.additionalPlan || '',
        data.issues || '',
        data.issueResolved ? 'O' : '',
        data.notes || ''
      ]
    ];
    
    // Google Sheets API 호출하여 프로젝트이력관리 시트에 데이터 추가
    
    return { success: true };
  } catch (error) {
    console.error('프로젝트 이력 추가 오류:', error);
    return { success: false, error: error.message };
  }
};
```

---

## 7. 컴포넌트 구현

### 프로젝트 수정 폼 컴포넌트

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelect } from '@/components/ui/multi-select';
import { DatePicker } from '@/components/ui/date-picker';
import { updateProject } from '@/app/actions/project';

// 유효성 검증 스키마
const formSchema = z.object({
  status: z.enum(['progress', 'hold', 'completed']),
  customer: z.string().min(1, { message: '고객사를 입력해주세요.' }),
  affiliation: z.string().optional(),
  model: z.string().optional(),
  item: z.string().min(1, { message: 'ITEM을 입력해주세요.' }),
  partNo: z.string().optional(),
  managers: z.array(z.string()).optional(),
  developmentStages: z.array(z.string()).optional(),
  currentStage: z.string().optional(),
  schedule: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  progress: z.string().optional(),
  additionalPlan: z.string().optional(),
  issues: z.string().optional(),
  issueResolved: z.boolean().optional(),
  notes: z.string().optional(),
  sellingPrice: z.number().optional(),
  materialCost: z.number().optional(),
  materialCostRatio: z.number().optional(),
});

interface ProjectUpdateFormProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  managers: { position: string; name: string; }[];
  stages: string[];
}

export function ProjectUpdateForm({ 
  project, 
  open, 
  onOpenChange, 
  onUpdated, 
  managers, 
  stages 
}: ProjectUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 폼 초기화
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: project.status || 'progress',
      customer: project.customer || '',
      affiliation: project.affiliation || '',
      model: project.model || '',
      item: project.item || '',
      partNo: project.partNo || '',
      managers: project.managers || [],
      developmentStages: project.developmentStages || [],
      currentStage: project.currentStage || '',
      schedule: project.schedule || { start: '', end: '' },
      progress: project.progress || '',
      additionalPlan: project.additionalPlan || '',
      issues: project.issues || '',
      issueResolved: project.issueResolved || false,
      notes: project.notes || '',
      sellingPrice: project.sellingPrice || 0,
      materialCost: project.materialCost || 0,
      materialCostRatio: project.materialCostRatio || 0,
    },
  });
  
  // 폼 제출 처리
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await updateProject(project.id, values, project);
      if (result.success) {
        onOpenChange(false);
        onUpdated();
      } else {
        // 오류 처리
        console.error('프로젝트 업데이트 실패:', result.error);
      }
    } catch (error) {
      console.error('프로젝트 업데이트 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 폼 초기화 핸들러
  const handleReset = () => {
    form.reset({
      status: project.status || 'progress',
      customer: project.customer || '',
      affiliation: project.affiliation || '',
      model: project.model || '',
      item: project.item || '',
      partNo: project.partNo || '',
      managers: project.managers || [],
      developmentStages: project.developmentStages || [],
      currentStage: project.currentStage || '',
      schedule: project.schedule || { start: '', end: '' },
      progress: project.progress || '',
      additionalPlan: project.additionalPlan || '',
      issues: project.issues || '',
      issueResolved: project.issueResolved || false,
      notes: project.notes || '',
      sellingPrice: project.sellingPrice || 0,
      materialCost: project.materialCost || 0,
      materialCostRatio: project.materialCostRatio || 0,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>프로젝트 수정</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 진행여부 */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>진행여부 *</FormLabel>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="progress" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">진행</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="hold" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">보유</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="completed" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">완료</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 여기에 나머지 필드들 구현 (고객사, 소속, 모델, ITEM, PART NO 등) */}
            
            {/* 저장/취소/초기화 버튼 */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                초기화
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 8. 시트 구조

### 📊 Google Spreadsheet 이름: **`프로젝트관리`**

#### 📄 프로젝트 시트 (`프로젝트`)
| A   | B      | C    | D    | E   | F    | G       | H      | I      | J          | K      | L   | M          | N          | O      | P     | Q     | R      | S       |
|-----|--------|------|------|-----|------|---------|--------|--------|------------|--------|-----|------------|------------|--------|-------|-------|--------|---------|
| NO  | 진행여부 | 고객사 | 소속 | 모델 | ITEM | PART NO | 개발담당 | 현재단계 | 업무진행사항 | 애로사항 | 비고 | 업무추가일정계획 | 개발업무단계 | 대일정 | 판매가 | 재료비 | 재료비율 | 수정일시 |

#### 📄 담당자 시트 (`담당자`)
| 직급 | 이름 |
|------|------|

#### 📄 항목정보 시트 (`항목정보`)
| 개발단계명 | 소속  | 모델 | 고객사 |
|----------|------|------| ------|

#### 📄 프로젝트이력관리 시트 (`프로젝트이력관리`)
| 순번 | 날짜 | ITEM | PART NO | 고객사 | 담당자 | 업무진행사항 | 업무추가 일정계획 | 비고 | 애로사항 | 애로사항 개선 여부 | 변경자 | 변경 시간 |
|------|------|------|---------|-------|--------|--------------|------------------|------|---------|---------------|--------|----------|

#### 이력관리 프로세스 단계
프로젝트 이력 관리는 다음 5단계 프로세스로 진행됩니다:

1. **변경 감지**
   - 프로젝트 수정 폼 제출 시 기존 값과 변경된 값 비교
   - 업무진행사항(J열), 애로사항(K열), 비고(L열), 업무추가 일정계획(M열), 애로사항 개선 여부 필드 변경 감지
   - 관련 필드가 변경되었을 때만 이력 추가 프로세스 진행

2. **이력 데이터 구성**
   - 현재 날짜 및 시간 기록
   - 프로젝트 식별 정보(ITEM, PART NO, 고객사) 포함
   - 변경된 필드 내용만 이력 데이터에 포함
   - 사용자 정보(변경자) 기록

3. **이력 저장**
   - Google Sheets API를 통해 `프로젝트이력관리` 시트에 새 행으로 이력 추가
   - 행 추가 성공 여부 확인 및 오류 처리

4. **애로사항 개선 처리**
   - 애로사항 개선 여부가 체크된 경우, 개선 내용과 함께 이력 저장
   - 애로사항 개선 여부가 변경된 경우(체크 <-> 미체크), 이력에 변경 사항 기록
   - 애로사항과 개선 내용의 연관성 유지 및 추적

5. **이력 조회 기능**
   - 프로젝트별 이력 내역 조회 기능 제공
   - 날짜 기준 필터링 기능
   - 특정 필드(애로사항, 업무진행사항 등) 기준 이력 검색 기능

#### 데이터 정합성 확보
- 이력 추가 실패 시 프로젝트 업데이트 롤백 메커니즘 구현
- 프로젝트 데이터와 이력 데이터의 연결 무결성 유지
- 정기적인 이력 데이터 백업 및 복구 방안 마련

---

## 9. 프로젝트 수정과 생성의 차이점

1. **초기 데이터 로드**
   - 생성: 빈 폼 또는 기본값으로 시작
   - 수정: 기존 프로젝트 데이터로 폼 초기화

2. **필드 변경 감지**
   - 생성: 변경 감지 필요 없음
   - 수정: 업무진행사항(J열), 애로사항(K열), 비고(L열), 업무추가 일정계획(M열), 애로사항 개선 여부 필드의 변경 감지 및 이력 기록

3. **API 호출**
   - 생성: 새 행 추가 API 호출
   - 수정: 기존 행 업데이트 API 호출 + 필요 시 이력 추가 API 호출

4. **성공 후 처리**
   - 생성: 모달 닫기 및 목록 갱신
   - 수정: 모달 닫기 및 목록 갱신 (변경된 내용 반영) 

---

## 10. 생성되는 파일 및 경로

프로젝트 수정 기능을 구현하기 위해 다음 파일들이 필요합니다:

### 1. 서버 액션

```
src/app/actions/project.ts
```
- `updateProject()`: 프로젝트 데이터 업데이트 함수
- `addProjectHistory()`: 프로젝트 이력 추가 함수
- `getProject()`: 특정 ID의 프로젝트 상세 정보 조회 함수

### 2. 클라이언트 컴포넌트

```
src/components/project/project-update-form.tsx
```
- 프로젝트 수정 모달 및 폼 컴포넌트
- React Hook Form 및 Zod를 활용한 유효성 검증
- 서버 액션 호출 및 상태 관리

> **참고**: 파일명은 프로젝트의 명명 규칙에 따라 kebab-case 형식(소문자와 하이픈으로 구성)으로 작성합니다. CamelCase 형식의 `ProjectUpdateForm.tsx` 대신 `project-update-form.tsx`를 사용합니다. 이는 프로젝트 내 다른 파일들(project-form.tsx, project-grid.tsx, project-list.tsx 등)과의 일관성을 유지하기 위함입니다.

```
src/components/project/project-list.tsx
```
- 프로젝트 목록 컴포넌트 내 수정 버튼 및 기능 추가

### 3. 타입 정의

```
src/types/project.ts
```
- `Project` 인터페이스: 프로젝트 데이터 구조 정의
- `ProjectHistory` 인터페이스: 프로젝트 이력 데이터 구조 정의

### 4. 유틸리티 함수

```
src/lib/google/sheets.ts
```
- Google Sheets API 연동 함수
  - `getSheetData()`: 시트 데이터 조회 함수
  - `updateSheetRow()`: 시트 특정 행 업데이트 함수
  - `appendSheetRow()`: 시트에 새로운 행 추가 함수
  - `parseProjectData()`: 시트 데이터를 프로젝트 객체로 변환하는 함수
  - `formatProjectData()`: 프로젝트 객체를 시트 데이터 형식으로 변환하는 함수
  - `findProjectRowIndex()`: 프로젝트 ID로 시트 내 행 번호 찾기 함수
- Google API 인증 및 연결 설정
- 데이터 변환 및 처리 유틸리티 함수

### 5. UI 컴포넌트

```
src/components/ui/multi-select.tsx
```
- 개발담당자 다중 선택을 위한 커스텀 컴포넌트

```
src/components/ui/toast.tsx
```
- 작업 결과 피드백을 위한 알림 컴포넌트

### 전체 폴더 구조

```
worklog-app/
├── src/
│   ├── app/
│   │   └── actions/
│   │       └── project.ts
│   ├── components/
│   │   ├── project/
│   │   │   ├── project-list.tsx
│   │   │   └── project-update-form.tsx
│   │   └── ui/
│   │       ├── multi-select.tsx
│   │       └── toast.tsx
│   ├── lib/
│   │   └── google/
│   │       └── sheets.ts
│   └── types/
│       └── project.ts
└── docs/
    └── design-specs/
        └── project-update.md 
```
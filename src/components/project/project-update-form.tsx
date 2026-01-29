"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parse, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Manager } from "@/app/actions/manager";
import { DevelopmentStage, ItemData } from "@/app/actions/item-data";
import { Project as ProjectOriginal } from "@/app/actions/project";
import { updateProject, UpdateProjectData } from "@/app/actions/update-project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// 폼 스키마 정의
const formSchema = z.object({
  status: z.enum(["progress", "hold", "completed"], {
    required_error: "진행여부를 선택해주세요.",
  }),
  customer: z.string().min(1, "고객사를 입력해주세요."),
  affiliation: z.string().optional(),
  model: z.string().optional(),
  item: z.string().min(1, "ITEM을 입력해주세요."),
  partNo: z.string().optional(),
  managers: z.array(z.string()).min(1, "담당자를 한 명 이상 선택해주세요"),
  developmentStages: z.array(z.string()).min(1, "개발업무단계를 한 개 이상 선택해주세요"),
  currentStage: z.string().optional(),
  scheduleStart: z.date().optional(),
  scheduleEnd: z.date().optional(),
  progress: z.string().optional(),
  issues: z.string().optional(),
  issueResolved: z.boolean().optional(),
  issueResolutionDetails: z.string().optional(),
  notes: z.string().optional(),
  additionalPlan: z.string().optional(),
  sellingPrice: z.string().optional(),
  materialCost: z.string().optional(),
  materialCostRatio: z.string().optional(),
});

// 폼 타입 정의
type FormValues = z.infer<typeof formSchema>;

// 프로젝트 인터페이스: 폼에서 사용하기 위한 확장 인터페이스
interface Project {
  id: string;
  no: string | number;
  status: 'progress' | 'hold' | 'completed';
  customer: string;        // 고객사 필드
  affiliation?: string;
  model?: string;
  item: string;
  partNo?: string;
  managers?: string[];
  developmentStages?: string[]; // 개발업무단계 배열
  currentStage?: string;
  schedule?: { start?: string; end?: string } | null;  // 대일정을 객체 형태로 변환
  progress?: string;      // 업무진행사항
  issues?: string;        // 애로사항
  issueResolved?: boolean; // 애로사항 개선 여부
  issueResolutionDetails?: string; // 애로사항 개선내용
  issueResolvedDesc?: string; // 애로사항 개선내용 (레거시 필드)
  notes?: string;
  additionalPlan?: string;
  sellingPrice?: number | string;
  materialCost?: number | string;
  materialCostRatio?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

// ProjectOriginal에서 Project로 변환하는 함수
function convertProject(original: ProjectOriginal): Project {
  console.log("원본 프로젝트 데이터:", JSON.stringify(original, null, 2));
  
  // 객체의 모든 프로퍼티 확인
  console.log("원본 객체의 모든 프로퍼티:");
  for (const key in original) {
    console.log(`${key}: ${JSON.stringify(original[key as keyof ProjectOriginal])}`);
  }

  // 스케줄 문자열을 시작일-종료일 객체로 분할 변환
  let scheduleObj: { start?: string; end?: string } | null = null;
  if (original.schedule) {
    if (typeof original.schedule === 'string') {
      // 문자열 형태인 경우 '~'로 분할
      const scheduleParts = original.schedule.split('~').map(s => s.trim());
      scheduleObj = {
        start: scheduleParts[0] || undefined,
        end: scheduleParts[1] || undefined
      };
    } else if (original.schedule && typeof original.schedule === 'object') {
      // 객체 형태인 경우
      const scheduleObject = original.schedule as any;
      if (scheduleObject.start || scheduleObject.end) {
        scheduleObj = {
          start: scheduleObject.start,
          end: scheduleObject.end
        };
      } else if (Array.isArray(scheduleObject) && scheduleObject.length === 2) {
        // 배열 형태인 경우 [start, end]로 가정
        scheduleObj = {
          start: scheduleObject[0],
          end: scheduleObject[1]
        };
      }
    }
  }

  console.log("파싱된 스케줄:", scheduleObj);

  // 상태 값을 유효한 값으로 변환
  const getValidStatus = (status: string): 'progress' | 'hold' | 'completed' => {
    if (status === '진행') return 'progress';
    if (status === '보유') return 'hold';
    if (status === '완료') return 'completed';
    return 'progress'; // 기본값
  };

  // 고객사 값 처리 - 다양한 필드명 처리
  let customerValue = "";
  
  // client, customer 속성 확인 (TypeScript 타입 정의된 속성)
  if (original.client) {
    customerValue = original.client;
  }
  
  // 직접 객체 접근 방식으로 다양한 필드명 확인
  if (!customerValue) {
    // @ts-ignore - 타입 체크 무시하고 접근
    if (original.customer) customerValue = original.customer;
    // @ts-ignore
    else if (original["고객사"]) customerValue = original["고객사"];
    // @ts-ignore
    else if (original.client) customerValue = original.client;
  }
  
  console.log("최종 처리된 고객사 값:", customerValue);
  
  // 개발업무단계 처리 - 다양한 데이터 형식 지원
  let developmentStages: string[] = [];
  
  // 원본 객체를 any 타입으로 캐스팅하여 모든 속성에 접근
  const originalAny = original as any;
  
  // developmentStages 배열 형태로 존재하는 경우 (이미지에 표시된 형태)
  if (originalAny.developmentStages && Array.isArray(originalAny.developmentStages)) {
    developmentStages = [...originalAny.developmentStages];
  }
  // developmentStage 속성 확인 (TypeScript 타입 정의된 속성)
  else if (original.developmentStage) {
    if (typeof original.developmentStage === 'string') {
      // 쉼표로 구분된 문자열인 경우 분할
      if (original.developmentStage.includes(',')) {
        developmentStages = original.developmentStage.split(',').map((s: string) => s.trim());
      } else {
        developmentStages = [original.developmentStage];
      }
    } else if (Array.isArray(original.developmentStage)) {
      developmentStages = original.developmentStage;
    }
  }
  // 개발 단계 필드가 개별 필드로 존재하는 경우 (예: 검토: true, 설계: true 등)
  else {
    // 가능한 개발업무단계 이름 목록
    const possibleStageNames = ['검토', '설계', '개발', 'PROTO', '선행성', 'P1', 'P2', '승인', '양산이관', '초도양산'];
    
    // 각 속성이 존재하는지 확인하고 값이 true인 경우 단계로 추가
    possibleStageNames.forEach(stageName => {
      if (stageName in originalAny && originalAny[stageName]) {
        developmentStages.push(stageName);
      }
    });
  }
  
  console.log("파싱된 개발업무단계:", developmentStages);

  // 현재단계(currentStage) 처리
  let currentStageValue = original.currentStage || "";
  
  // 여러 필드명으로 현재단계 검색
  if (!currentStageValue) {
    if (originalAny.currentStage) {
      currentStageValue = originalAny.currentStage;
    } else if (originalAny["현재단계"]) {
      currentStageValue = originalAny["현재단계"];
    }
  }
  
  // P1이 개발업무단계에 있으면 현재단계로 설정
  if (!currentStageValue && developmentStages.includes("P1")) {
    currentStageValue = "P1";
    console.log("개발업무단계에서 P1을 현재단계로 자동 설정");
  }
  // 아무 값도 없고 개발업무단계가 있으면 첫 번째 단계를 현재단계로 설정
  else if (!currentStageValue && developmentStages.length > 0) {
    currentStageValue = developmentStages[0];
    console.log("첫 번째 개발업무단계를 현재단계로 자동 설정:", currentStageValue);
  }

  // 업무진행사항 처리 - 다양한 필드명 지원
  let progressValue = "";
  
  // progressStatus가 있는 경우 (기본 필드명)
  if (original.progressStatus) {
    progressValue = original.progressStatus;
  } 
  // 다양한 필드명 시도
  else {
    if (originalAny.progress) {
      progressValue = originalAny.progress;
    } else if (originalAny.Progress) {
      progressValue = originalAny.Progress;
    } else if (originalAny["업무진행사항"]) {
      progressValue = originalAny["업무진행사항"];
    }
  }

  // issueResolved, issueResolutionDetails, issueResolvedDesc 속성 가져오기
  const issueResolved = originalAny.issueResolved || false;
  const issueResolutionDetails = originalAny.issueResolutionDetails || originalAny.issueResolvedDesc || "";
  const issueResolvedDesc = originalAny.issueResolvedDesc || "";

  return {
    id: original.id,
    no: original.no,
    status: getValidStatus(original.status),
    customer: customerValue,
    affiliation: original.affiliation,
    model: original.model,
    item: original.item,
    partNo: original.partNo,
    managers: original.managers,
    developmentStages: developmentStages,
    currentStage: currentStageValue,
    schedule: scheduleObj,
    progress: progressValue,
    issues: original.issues,
    issueResolved: issueResolved,
    issueResolutionDetails: issueResolutionDetails,
    issueResolvedDesc: issueResolvedDesc,
    notes: original.notes,
    additionalPlan: original.additionalPlan,
    sellingPrice: original.sellingPrice,
    materialCost: original.materialCost,
    materialCostRatio: original.materialCostRatio,
  };
}

// 프로젝트 수정 폼 속성 정의
interface ProjectUpdateFormProps {
  project: ProjectOriginal;  // 원본 프로젝트 타입으로 변경
  managers: Manager[];
  developmentStages: DevelopmentStage[];
  itemData: ItemData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * 프로젝트 수정 폼 컴포넌트
 * 사용자가 기존 프로젝트 정보를 수정할 수 있는 모달 폼을 제공합니다.
 */
export function ProjectUpdateForm({ 
  project: originalProject, 
  managers, 
  developmentStages, 
  itemData = { customers: [], affiliations: [], models: [], developmentStages: [] },
  open,
  onOpenChange,
  onSuccess 
}: ProjectUpdateFormProps) {
  // 원본 프로젝트를 변환된 프로젝트로 변환 - 메모이제이션 적용
  const project = useMemo(() => convertProject(originalProject), [originalProject]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 선택된 담당자와 개발단계 ID를 추적하기 위한 상태
  // 컴포넌트가 마운트될 때 한 번만 초기화하기 위해 함수 형태의 초기값 사용
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>(() => {
    // 초기값 계산
    if (project.managers && Array.isArray(project.managers) && project.managers.length > 0 && managers.length > 0) {
      return project.managers
        .map((managerName: string) => {
          const manager = managers.find(m => m.name === managerName);
          return manager?.id || "";
        })
        .filter((id: string) => id !== "");
    }
    return [];
  });
  
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>(() => {
    // 초기값 계산
    if (project.developmentStages && Array.isArray(project.developmentStages) && project.developmentStages.length > 0 && developmentStages.length > 0) {
      return project.developmentStages
        .map((stageName: string) => {
          const stage = developmentStages.find(s => s.name === stageName);
          return stage?.id || "";
        })
        .filter((id: string) => id !== "");
    }
    return [];
  });
  
  const { toast } = useToast();
  
  // itemData 확장 - 현재 프로젝트의 값을 배열에 포함시키기
  const enhancedItemData = useMemo(() => {
    console.log("프로젝트 고객사 값:", project.customer);
    
    // 고객사 값 확인 및 처리
    let customerValue = project.customer || "";
    
    // 값이 없으면 원본 데이터에서 다시 시도
    if (!customerValue && originalProject) {
      // @ts-ignore - 속성이 TypeScript 정의에 없을 수 있음
      if (originalProject.customer) customerValue = originalProject.customer;
      // @ts-ignore
      else if (originalProject.client) customerValue = originalProject.client;
      // @ts-ignore
      else if (originalProject["고객사"]) customerValue = originalProject["고객사"];
      
      console.log("원본에서 복구한 고객사 값:", customerValue);
    }
    
    // 배열 체크와 중복 방지 로직 최적화
    const customers = Array.isArray(itemData.customers) ? itemData.customers : [];
    const affiliations = Array.isArray(itemData.affiliations) ? itemData.affiliations : [];
    const models = Array.isArray(itemData.models) ? itemData.models : [];
    
    return {
      customers: customerValue && !customers.includes(customerValue) 
        ? [...customers, customerValue] 
        : customers,
        
      affiliations: project.affiliation && !affiliations.includes(project.affiliation) 
        ? [...affiliations, project.affiliation] 
        : affiliations,
        
      models: project.model && !models.includes(project.model) 
        ? [...models, project.model] 
        : models,
        
      developmentStages: itemData.developmentStages || []
    };
  }, [itemData, project, originalProject]);
  
  // 프로젝트 데이터로부터 스케줄 날짜 파싱 함수
  const parseScheduleDate = useCallback((dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isValid(date) ? date : undefined;
  }, []);

  // 폼 초기값 설정 - 메모이제이션
  const defaultValues = useMemo(() => ({
    status: project.status || "progress",
    customer: project.customer || "",
    affiliation: project.affiliation || "",
    model: project.model || "",
    item: project.item || "",
    partNo: project.partNo || "",
    managers: project.managers || [],
    developmentStages: project.developmentStages || [],
    currentStage: project.currentStage || "",
    scheduleStart: project.schedule?.start ? parseScheduleDate(project.schedule.start) : undefined,
    scheduleEnd: project.schedule?.end ? parseScheduleDate(project.schedule.end) : undefined,
    progress: project.progress || "",
    issues: project.issues || "",
    issueResolved: project.issueResolved || false,
    issueResolutionDetails: project.issueResolutionDetails || "",
    notes: project.notes || "",
    additionalPlan: project.additionalPlan || "",
    sellingPrice: project.sellingPrice?.toString() || "",
    materialCost: project.materialCost?.toString() || "",
    materialCostRatio: project.materialCostRatio?.toString() || "",
  }), [project, parseScheduleDate]);

  // 컴포넌트가 리렌더링될 때마다 폼을 재설정하는 대신, 
  // 프로젝트 ID와 open 상태를 함께 key로 사용하여 완전히 다시 마운트될 때만 폼 초기화
  const formKey = useMemo(() => `project-form-${project.id}-${open}`, [project.id, open]);
  
  // 폼 컨트롤러 설정 - useMemo로 최적화
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // 날짜 문자열을 Date 객체로 변환하는 함수
  const parseDate = useCallback((dateString: string): Date | null => {
    // YYYY-MM-DD 형식 또는 YYYYMMDD 형식으로 입력된 날짜 처리
    if (!dateString) return null;
    
    // 정규식으로 유효한 형식인지 검사
    const isValidFormat = /^(\d{4})[-/.]?(\d{2})[-/.]?(\d{2})$/.test(dateString);
    if (!isValidFormat) return null;
    
    // 하이픈, 슬래시, 점을 제거하고 YYYYMMDD 형식으로 변환
    const cleanDateString = dateString.replace(/[-/.]/g, "");
    
    // YYYYMMDD 형식으로 파싱
    const parsedDate = parse(cleanDateString, "yyyyMMdd", new Date());
    return isValid(parsedDate) ? parsedDate : null;
  }, []);
  
  // 모달이 열릴 때 폼 재설정
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);
  
  // 폼 제출 처리
  const onSubmit = useCallback(async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // 개발업무단계에 P1이 있는지 확인
      const hasP1 = values.developmentStages?.includes("P1");
      
      // 현재단계 처리
      // currentStage 값을 그대로 사용하고, 값이 없을 때만 기본값 처리
      const currentStage = values.currentStage || (
        hasP1 ? "P1" : 
        (values.developmentStages && values.developmentStages.length > 0 ? values.developmentStages[0] : undefined)
      );
      
      // 원본 NO 값 확보 (originalProject에서 가져오기)
      const originalNo = originalProject.no || "";
      console.log("원본 NO 값:", originalNo);
      
      // 디버깅을 위한 로그
      console.log("제출 시 선택된 현재단계:", values.currentStage);
      console.log("제출 시 최종 현재단계:", currentStage);
      console.log("개발담당자:", values.managers);
      
      // 서버 액션에 맞는 형태로 데이터 변환
      const projectData: UpdateProjectData = {
        id: project.id,
        no: originalNo, // 원본 NO 값 유지
        status: values.status,
        customer: values.customer,
        affiliation: values.affiliation,
        model: values.model,
        item: values.item,
        partNo: values.partNo,
        managers: values.managers,
        developmentStages: values.developmentStages,
        currentStage: currentStage, // 사용자가 선택한 현재단계 우선 적용
        schedule: {
          start: values.scheduleStart ? format(values.scheduleStart, 'yyyy-MM-dd') : undefined,
          end: values.scheduleEnd ? format(values.scheduleEnd, 'yyyy-MM-dd') : undefined,
        },
        progress: values.progress,
        issues: values.issues,
        issueResolved: values.issueResolved,
        issueResolutionDetails: values.issueResolutionDetails,
        notes: values.notes,
        additionalPlan: values.additionalPlan,
        sellingPrice: values.sellingPrice ? parseFloat(values.sellingPrice) : undefined,
        materialCost: values.materialCost ? parseFloat(values.materialCost) : undefined,
        materialCostRatio: values.materialCostRatio ? parseFloat(values.materialCostRatio) : undefined,
      };
      
      // 프로젝트 수정 요청 전 데이터 확인
      console.log("서버로 전송될 데이터:", JSON.stringify(projectData, null, 2));
      
      // 프로젝트 수정 요청
      const result = await updateProject(projectData);
      
      if (result.success) {
        toast({
          title: "프로젝트가 성공적으로 수정되었습니다",
          description: `프로젝트: ${values.item}`,
          variant: "default",
        });
        
        // 모달 닫기
        onOpenChange(false);
        
        // 성공 시 콜백 실행
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "프로젝트 수정 실패",
          description: result.error || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        });
        console.error("서버 응답 오류:", result.error);
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "프로젝트 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("프로젝트 수정 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [project.id, toast, onOpenChange, onSuccess, originalProject]);
  
  // 폼 초기화 핸들러
  const handleReset = useCallback(() => {
    form.reset(defaultValues);
    
    // 담당자 선택 상태 초기화
    if (project.managers && Array.isArray(project.managers) && project.managers.length > 0 && managers.length > 0) {
      const managerIds = project.managers
        .map((managerName: string) => {
          const manager = managers.find(m => m.name === managerName);
          return manager?.id || "";
        })
        .filter((id: string) => id !== "");
      
      setSelectedManagerIds(managerIds);
    } else {
      setSelectedManagerIds([]);
    }
    
    // 개발업무단계 선택 상태 초기화
    if (project.developmentStages && Array.isArray(project.developmentStages) && project.developmentStages.length > 0 && developmentStages.length > 0) {
      const stageIds = project.developmentStages
        .map((stageName: string) => {
          const stage = developmentStages.find(s => s.name === stageName);
          return stage?.id || "";
        })
        .filter((id: string) => id !== "");
      
      setSelectedStageIds(stageIds);
    } else {
      setSelectedStageIds([]);
    }
  }, [form, defaultValues, project, managers, developmentStages, setSelectedManagerIds, setSelectedStageIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby="project-update-description">
        <DialogHeader>
          <DialogTitle>프로젝트 수정</DialogTitle>
          <DialogDescription id="project-update-description">
            프로젝트 정보를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        {/* key 속성 추가하여 프로젝트 변경 시 컴포넌트를 완전히 리렌더링 */}
        <Form {...form} key={formKey}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 진행여부 */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-medium">진행여부 <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="progress" id="update-progress" />
                        <label htmlFor="update-progress" className="text-sm">진행</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hold" id="update-hold" />
                        <label htmlFor="update-hold" className="text-sm">보류</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id="update-completed" />
                        <label htmlFor="update-completed" className="text-sm">완료</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 고객사, 소속, 모델을 한 행에 배치 */}
            <div className="grid grid-cols-3 gap-4">
              {/* 고객사 */}
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">고객사 <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          if (value === "no-customer") return;
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="고객사를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(enhancedItemData.customers) && enhancedItemData.customers.length > 0 ? (
                            [...enhancedItemData.customers].sort().map((customer, index) => (
                              <SelectItem key={`customer-${index}-${customer}`} value={customer}>
                                {customer}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-customer" value="no-customer">고객사 목록이 없습니다</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 소속 */}
              <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">소속</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          if (value === "no-affiliation") return;
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="소속을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(enhancedItemData.affiliations) && enhancedItemData.affiliations.length > 0 ? (
                            [...enhancedItemData.affiliations].sort().map((affiliation, index) => (
                              <SelectItem key={`affiliation-${index}-${affiliation}`} value={affiliation}>
                                {affiliation}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-affiliation" value="no-affiliation">소속 목록이 없습니다</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 모델 */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">모델</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          if (value === "no-model") return;
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(enhancedItemData.models) && enhancedItemData.models.length > 0 ? (
                            [...enhancedItemData.models].sort().map((model, index) => (
                              <SelectItem key={`model-${index}-${model}`} value={model}>
                                {model}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-model" value="no-model">모델 목록이 없습니다</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ITEM과 PART NO를 한 행에 배치 */}
            <div className="grid grid-cols-2 gap-4">
              {/* ITEM */}
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">ITEM <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="ITEM을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PART NO */}
              <FormField
                control={form.control}
                name="partNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">PART NO</FormLabel>
                    <FormControl>
                      <Input placeholder="PART NO를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 개발담당 */}
            <FormField
              control={form.control}
              name="managers"
              render={({ field }) => {
                // 토글 핸들러 메모이제이션
                const toggleManager = useCallback((manager: Manager) => {
                  const isSelected = selectedManagerIds.includes(manager.id);
                  let newSelectedIds: string[];
                  let newSelectedNames: string[];
                  
                  if (isSelected) {
                    // 이미 선택된 경우 제거
                    newSelectedIds = selectedManagerIds.filter((id) => id !== manager.id);
                    newSelectedNames = field.value && Array.isArray(field.value) 
                      ? field.value.filter((name) => name !== manager.name) 
                      : [];
                  } else {
                    // 선택되지 않은 경우 추가
                    newSelectedIds = [...selectedManagerIds, manager.id];
                    newSelectedNames = [...(field.value && Array.isArray(field.value) ? field.value : []), manager.name];
                  }
                  
                  setSelectedManagerIds(newSelectedIds);
                  field.onChange(newSelectedNames);
                }, [field, selectedManagerIds]);
                
                return (
                  <FormItem>
                    <FormLabel className="font-medium">개발담당 <span className="text-red-500">*</span></FormLabel>
                    <div className="border rounded-md p-2">
                      <div className="max-h-48 overflow-auto">
                        {!managers || !Array.isArray(managers) || managers.length === 0 ? (
                          <div className="py-6 text-center text-sm">
                            담당자 목록을 불러오는 중...
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1">
                            {managers.map((manager) => (
                              <div
                                key={manager.id}
                                className={cn(
                                  "px-2 py-1.5 text-sm rounded-sm cursor-pointer flex items-center",
                                  selectedManagerIds.includes(manager.id) ? "bg-accent" : "",
                                  "hover:bg-accent/50"
                                )}
                                onClick={() => toggleManager(manager)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={cn(
                                    "w-4 h-4 border rounded flex items-center justify-center",
                                    selectedManagerIds.includes(manager.id) 
                                      ? "bg-primary border-primary" 
                                      : "border-input"
                                  )}>
                                    {selectedManagerIds.includes(manager.id) && (
                                      <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                                  </div>
                                  <span>{manager.rank} {manager.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 선택된 담당자 표시 */}
                    {field.value && Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {field.value.map((name, index) => {
                          const manager = managers.find(m => m.name === name);
                          return (
                            <Badge 
                              key={name}
                              variant={index === 0 ? "default" : "secondary"}
                              className="flex items-center gap-1 px-2 py-0.5"
                            >
                              {manager ? `${manager.rank} ${manager.name}` : name}
                              {index === 0 && <span className="ml-1 text-xs">(관리자)</span>}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  // 해당 담당자 제거
                                  const newManagerNames = field.value.filter(n => n !== name);
                                  field.onChange(newManagerNames);
                                  
                                  // ID 목록에서도 제거
                                  if (manager) {
                                    setSelectedManagerIds(prev => prev.filter(id => id !== manager.id));
                                  }
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <FormDescription>
                      첫 번째로 선택한 담당자가 관리자 입니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* 개발업무단계 */}
            <FormField
              control={form.control}
              name="developmentStages"
              render={({ field }) => {
                // 토글 핸들러 메모이제이션
                const toggleStage = useCallback((stage: DevelopmentStage) => {
                  const isSelected = selectedStageIds.includes(stage.id);
                  let newSelectedIds: string[];
                  let newSelectedNames: string[];
                  
                  if (isSelected) {
                    // 이미 선택된 경우 제거
                    newSelectedIds = selectedStageIds.filter((id) => id !== stage.id);
                    newSelectedNames = field.value && Array.isArray(field.value) 
                      ? field.value.filter((name) => name !== stage.name) 
                      : [];
                  } else {
                    // 선택되지 않은 경우 추가
                    newSelectedIds = [...selectedStageIds, stage.id];
                    newSelectedNames = [...(field.value && Array.isArray(field.value) ? field.value : []), stage.name];
                  }
                  
                  setSelectedStageIds(newSelectedIds);
                  field.onChange(newSelectedNames);
                }, [field, selectedStageIds]);
                
                return (
                  <FormItem>
                    <FormLabel className="font-medium">개발업무단계 <span className="text-red-500">*</span></FormLabel>
                    <div className="border rounded-md p-2">
                      <div className="max-h-48 overflow-auto">
                        {!developmentStages || !Array.isArray(developmentStages) || developmentStages.length === 0 ? (
                          <div className="py-6 text-center text-sm">
                            개발업무단계 목록을 불러오는 중...
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1">
                            {developmentStages.map((stage) => {
                              // 현재 단계가 선택되었는지 확인
                              const isStageSelected = field.value && Array.isArray(field.value) && field.value.includes(stage.name);
                              
                              return (
                                <div
                                  key={stage.id}
                                  className={cn(
                                    "px-2 py-1.5 text-sm rounded-sm cursor-pointer flex items-center",
                                    selectedStageIds.includes(stage.id) || isStageSelected ? "bg-accent" : "",
                                    "hover:bg-accent/50"
                                  )}
                                  onClick={() => toggleStage(stage)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className={cn(
                                      "w-4 h-4 border rounded flex items-center justify-center",
                                      selectedStageIds.includes(stage.id) || isStageSelected
                                        ? "bg-primary border-primary" 
                                        : "border-input"
                                    )}>
                                      {(selectedStageIds.includes(stage.id) || isStageSelected) && (
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      )}
                                    </div>
                                    <span>{stage.name}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 선택된 단계 표시 */}
                    {field.value && Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {field.value.map((name, index) => {
                          // 현재단계 처리: P1이 현재단계로 표시되어야 함
                          const isCurrentStage = name === project.currentStage || 
                                              (name === "P1" && (!project.currentStage || project.currentStage === ""));
                          
                          return (
                            <Badge 
                              key={name}
                              variant={isCurrentStage ? "default" : "secondary"}
                              className="flex items-center gap-1 px-2 py-0.5"
                            >
                              {name}
                              {isCurrentStage && <span className="ml-1 text-xs">(현재단계)</span>}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  // 해당 단계 제거
                                  const newStageNames = field.value.filter(n => n !== name);
                                  field.onChange(newStageNames);
                                  
                                  // ID 목록에서도 제거
                                  const stage = developmentStages.find(s => s.name === name);
                                  if (stage) {
                                    setSelectedStageIds(prev => prev.filter(id => id !== stage.id));
                                  }
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* 현재단계 선택 필드 */}
            <FormField
              control={form.control}
              name="currentStage"
              render={({ field }) => {
                // 개발업무단계 목록에서 선택할 수 있는 현재단계 옵션 생성
                const stageOptions = form.getValues().developmentStages || [];
                
                // 현재 P1이 있는지 확인
                const hasP1 = stageOptions.includes("P1");
                
                return (
                  <FormItem>
                    <FormLabel className="font-medium">현재단계</FormLabel>
                    <FormDescription>
                      첫번째로 선택한 단계가 현재단계로 지정됩니다.
                    </FormDescription>
                    <FormControl>
                      <Select
                        value={field.value || (hasP1 ? "P1" : "")}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="현재단계를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {stageOptions.length > 0 ? (
                            stageOptions.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stage}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="">개발업무단계를 먼저 선택하세요</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* 대일정(시작일, 종료일)을 한 행에 배치 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 대일정 (시작일) */}
              <FormField
                control={form.control}
                name="scheduleStart"
                render={({ field }) => {
                  const [inputValue, setInputValue] = useState(() => 
                    field.value ? format(field.value, "yyyy-MM-dd") : ""
                  );
                  
                  // field 값이 변경될 때 입력 값 동기화 - 메모이제이션된 이전 값과 비교
                  useEffect(() => {
                    // 날짜 값이 변경되었는지 확인
                    const currentFormattedDate = field.value ? format(field.value, "yyyy-MM-dd") : "";
                    if (currentFormattedDate !== inputValue) {
                      setInputValue(currentFormattedDate);
                    }
                  }, [field.value, inputValue]);
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium">대일정 (시작일)</FormLabel>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="YYYY-MM-DD"
                              value={inputValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInputValue(val);
                                
                                if (val === "") {
                                  field.onChange(undefined);
                                  return;
                                }
                                
                                const parsedDate = parseDate(val);
                                if (parsedDate) {
                                  field.onChange(parsedDate);
                                }
                              }}
                              onBlur={() => {
                                // 포커스 잃을 때 유효한 날짜가 아니면 원래 날짜로 복원
                                if (field.value) {
                                  setInputValue(format(field.value, "yyyy-MM-dd"));
                                } else if (inputValue && !parseDate(inputValue)) {
                                  setInputValue("");
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="px-2"
                              type="button"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                if (date) {
                                  setInputValue(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              initialFocus
                              locale={ko}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormDescription className="text-xs text-muted-foreground mt-1">
                        직접 입력할 경우 YYYY-MM-DD 형식으로 입력하세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* 대일정 (종료일) */}
              <FormField
                control={form.control}
                name="scheduleEnd"
                render={({ field }) => {
                  const [inputValue, setInputValue] = useState(() => 
                    field.value ? format(field.value, "yyyy-MM-dd") : ""
                  );
                  
                  // field 값이 변경될 때 입력 값 동기화 - 메모이제이션된 이전 값과 비교
                  useEffect(() => {
                    // 날짜 값이 변경되었는지 확인
                    const currentFormattedDate = field.value ? format(field.value, "yyyy-MM-dd") : "";
                    if (currentFormattedDate !== inputValue) {
                      setInputValue(currentFormattedDate);
                    }
                  }, [field.value, inputValue]);
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium">대일정 (종료일)</FormLabel>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="YYYY-MM-DD"
                              value={inputValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInputValue(val);
                                
                                if (val === "") {
                                  field.onChange(undefined);
                                  return;
                                }
                                
                                const parsedDate = parseDate(val);
                                if (parsedDate) {
                                  field.onChange(parsedDate);
                                }
                              }}
                              onBlur={() => {
                                // 포커스 잃을 때 유효한 날짜가 아니면 원래 날짜로 복원
                                if (field.value) {
                                  setInputValue(format(field.value, "yyyy-MM-dd"));
                                } else if (inputValue && !parseDate(inputValue)) {
                                  setInputValue("");
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="px-2"
                              type="button"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                if (date) {
                                  setInputValue(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              initialFocus
                              locale={ko}
                              fromDate={form.getValues().scheduleStart}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormDescription className="text-xs text-muted-foreground mt-1">
                        직접 입력할 경우 YYYY-MM-DD 형식으로 입력하세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* 업무 관련 필드 추가 */}
            <div className="grid grid-cols-1 gap-4">
              {/* 업무진행사항 */}
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">업무진행사항</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="업무진행사항을 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 애로사항 */}
              <FormField
                control={form.control}
                name="issues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">애로사항</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="애로사항을 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                        onChange={(e) => {
                          // 기본 onChange 함수 호출
                          field.onChange(e);
                          
                          // 애로사항이 공란이 되면 개선 여부 체크박스 해제 및 개선내용 비우기
                          const value = e.target.value;
                          if (!value || value.trim() === "") {
                            form.setValue("issueResolved", false);
                            form.setValue("issueResolutionDetails", "");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 애로사항 개선 여부와 개선내용을 함께 표시 */}
              <div className="p-4 border rounded-md">
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="issueResolved"
                    render={({ field }) => {
                      // 애로사항이 공란인지 확인
                      const issuesValue = form.watch("issues");
                      const isIssuesEmpty = !issuesValue || issuesValue.trim() === "";
                      
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              disabled={isIssuesEmpty} // 애로사항이 공란이면 비활성화
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                // 체크 해제 시 개선내용 필드 비우기
                                if (!checked) {
                                  form.setValue("issueResolutionDetails", "");
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className={`font-medium ${isIssuesEmpty ? "text-gray-400" : ""}`}>
                              애로사항 개선 여부
                            </FormLabel>
                            <FormDescription className={isIssuesEmpty ? "text-gray-400" : ""}>
                              {isIssuesEmpty 
                                ? "애로사항을 먼저 입력하세요" 
                                : "애로사항이 해결되었으면 체크하세요"}
                            </FormDescription>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="issueResolutionDetails"
                    render={({ field }) => {
                      // 애로사항이 공란인지 확인
                      const issuesValue = form.watch("issues");
                      const isIssuesEmpty = !issuesValue || issuesValue.trim() === "";
                      const isIssueResolved = form.watch("issueResolved");
                      
                      return (
                        <FormItem>
                          <FormLabel className={`font-medium ${isIssuesEmpty || !isIssueResolved ? "text-gray-400" : ""}`}>
                            애로사항 개선내용
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={
                                isIssuesEmpty 
                                  ? "애로사항을 먼저 입력하세요" 
                                  : isIssueResolved 
                                    ? "애로사항이 어떻게 해결되었는지 입력하세요" 
                                    : "애로사항 개선 여부를 먼저 체크하세요"
                              }
                              className="min-h-[100px] w-full"
                              disabled={isIssuesEmpty || !isIssueResolved}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
              
              {/* 업무추가 일정계획 */}
              <FormField
                control={form.control}
                name="additionalPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">업무추가 일정계획</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="업무추가 일정계획을 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 비고 */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">비고</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="비고를 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 판매가, 재료비, 재료비율을 한 행에 배치 */}
            <div className="grid grid-cols-3 gap-4">
              {/* 판매가 */}
              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">판매가(원)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="판매가를 입력하세요" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 재료비 */}
              <FormField
                control={form.control}
                name="materialCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">재료비(원)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="재료비를 입력하세요" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 재료비율 */}
              <FormField
                control={form.control}
                name="materialCostRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">재료비율 (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="재료비율을 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                초기화
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장하기"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
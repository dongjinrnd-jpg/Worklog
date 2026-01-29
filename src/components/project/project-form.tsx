"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parse, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, X } from "lucide-react";

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Manager } from "@/app/actions/manager";
import { DevelopmentStage, ItemData } from "@/app/actions/item-data";
import { CreateProjectData, createProject } from "@/app/actions/create-project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  scheduleStart: z.date().optional(),
  scheduleEnd: z.date().optional(),
  sellingPrice: z.string().optional(),
  materialCost: z.string().optional(),
  materialCostRatio: z.string().optional(),
});

// 폼 타입 정의
type FormValues = z.infer<typeof formSchema>;

// 페이지 속성 정의
interface ProjectFormProps {
  managers: Manager[];
  developmentStages: DevelopmentStage[];
  itemData: ItemData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 프로젝트 등록 폼 컴포넌트
 * 사용자가 새 프로젝트를 등록할 수 있는 폼을 제공합니다.
 */
export function ProjectForm({ managers, developmentStages, itemData = { customers: [], affiliations: [], models: [], developmentStages: [] }, onSuccess, onCancel }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managersOpen, setManagersOpen] = useState(false);
  const [stagesOpen, setStagesOpen] = useState(false);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const { toast } = useToast();

  // 콘솔에 고객사 데이터 로깅 추가
  console.log("고객사 데이터:", itemData.customers);
  
  // useEffect를 사용하여 itemData.customers 변경 감지
  useEffect(() => {
    console.log("고객사 데이터가 변경됨:", itemData.customers);
  }, [itemData.customers]);

  // 폼 초기값
  const defaultValues: Partial<FormValues> = {
    status: "progress",
    managers: [],
    developmentStages: [],
  };

  // 폼 설정
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // 폼 제출 처리
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    try {
      // 서버 액션에 맞는 형태로 데이터 변환
      const projectData: CreateProjectData = {
        status: values.status,
        customer: values.customer,
        affiliation: values.affiliation,
        model: values.model,
        item: values.item,
        partNo: values.partNo,
        managers: values.managers,
        developmentStages: values.developmentStages,
        schedule: values.scheduleStart || values.scheduleEnd 
          ? {
              start: values.scheduleStart ? format(values.scheduleStart, 'yyyy-MM-dd') : undefined,
              end: values.scheduleEnd ? format(values.scheduleEnd, 'yyyy-MM-dd') : undefined,
            } 
          : undefined,
        sellingPrice: values.sellingPrice ? parseFloat(values.sellingPrice) : undefined,
        materialCost: values.materialCost ? parseFloat(values.materialCost) : undefined,
        materialCostRatio: values.materialCostRatio ? parseFloat(values.materialCostRatio) : undefined,
      };
      
      // 프로젝트 생성 요청
      const result = await createProject(projectData);
      
      if (result.success) {
        toast({
          title: "프로젝트가 성공적으로 등록되었습니다",
          description: `프로젝트 번호: ${result.projectNo}`,
          variant: "default",
        });
        
        // 폼 초기화
        form.reset(defaultValues);
        
        // 성공 시 콜백 실행
        if (onSuccess) {
          onSuccess();
        } else {
          // onSuccess가 없으면 기본 동작으로 프로젝트 목록 페이지로 이동
          window.location.href = '/project';
        }
      } else {
        toast({
          title: "프로젝트 등록 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "프로젝트 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("프로젝트 등록 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // 폼 초기화 핸들러
  const handleReset = () => {
    form.reset(defaultValues);
  };
  
  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // onCancel이 없으면 기본 동작으로 프로젝트 목록 페이지로 이동
      window.location.href = '/project';
    }
  };

  // 날짜 문자열을 Date 객체로 변환하는 함수
  const parseDate = (dateString: string): Date | null => {
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <RadioGroupItem value="progress" id="progress" />
                    <label htmlFor="progress" className="text-sm">진행</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hold" id="hold" />
                    <label htmlFor="hold" className="text-sm">보류</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="completed" id="completed" />
                    <label htmlFor="completed" className="text-sm">완료</label>
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
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="고객사를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemData?.customers && itemData.customers.length > 0 ? (
                        [...itemData.customers].sort().map((customer, index) => (
                          <SelectItem key={`customer-${index}-${customer}`} value={customer}>
                            {customer}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">고객사 목록이 없습니다</SelectItem>
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
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="소속을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemData?.affiliations && itemData.affiliations.length > 0 ? (
                        itemData.affiliations.map((affiliation, index) => (
                          <SelectItem key={`affiliation-${index}-${affiliation}`} value={affiliation}>
                            {affiliation}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">소속 목록이 없습니다</SelectItem>
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
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="모델을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemData?.models && itemData.models.length > 0 ? (
                        itemData.models.map((model, index) => (
                          <SelectItem key={`model-${index}-${model}`} value={model}>
                            {model}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">모델 목록이 없습니다</SelectItem>
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

        {/* 개발담당 - 새로운 방식으로 구현 */}
        <FormField
          control={form.control}
          name="managers"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">개발담당 <span className="text-red-500">*</span></FormLabel>
              <div className="border rounded-md p-2">
                <div className="max-h-48 overflow-auto">
                  {managers.length === 0 ? (
                    <div className="py-6 text-center text-sm">
                      담당자 목록을 불러오는 중...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {managers
                        .map((manager) => (
                          <div
                            key={manager.id}
                            className={cn(
                              "px-2 py-1.5 text-sm rounded-sm cursor-pointer flex items-center",
                              selectedManagerIds.includes(manager.id) ? "bg-accent" : "",
                              "hover:bg-accent/50"
                            )}
                            onClick={() => {
                              // 선택 상태 토글
                              const isSelected = selectedManagerIds.includes(manager.id);
                              let newSelectedIds = [];
                              let newSelectedNames = [];
                              
                              if (isSelected) {
                                // 이미 선택된 경우 제거
                                newSelectedIds = selectedManagerIds.filter((id) => id !== manager.id);
                                newSelectedNames = field.value.filter((name) => name !== manager.name);
                              } else {
                                // 선택되지 않은 경우 추가
                                newSelectedIds = [...selectedManagerIds, manager.id];
                                newSelectedNames = [...field.value || [], manager.name];
                              }
                              
                              setSelectedManagerIds(newSelectedIds);
                              field.onChange(newSelectedNames);
                            }}
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
              {field.value && field.value.length > 0 && (
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
          )}
        />

        {/* 개발업무단계 - 새로운 방식으로 구현 */}
        <FormField
          control={form.control}
          name="developmentStages"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">개발업무단계 <span className="text-red-500">*</span></FormLabel>
              <div className="border rounded-md p-2">
                <div className="max-h-48 overflow-auto">
                  {developmentStages.length === 0 ? (
                    <div className="py-6 text-center text-sm">
                      개발업무단계 목록을 불러오는 중...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {developmentStages
                        .map((stage) => (
                          <div
                            key={stage.id}
                            className={cn(
                              "px-2 py-1.5 text-sm rounded-sm cursor-pointer flex items-center",
                              selectedStageIds.includes(stage.id) ? "bg-accent" : "",
                              "hover:bg-accent/50"
                            )}
                            onClick={() => {
                              // 선택 상태 토글
                              const isSelected = selectedStageIds.includes(stage.id);
                              let newSelectedIds = [];
                              let newSelectedNames = [];
                              
                              if (isSelected) {
                                // 이미 선택된 경우 제거
                                newSelectedIds = selectedStageIds.filter((id) => id !== stage.id);
                                newSelectedNames = field.value.filter((name) => name !== stage.name);
                              } else {
                                // 선택되지 않은 경우 추가
                                newSelectedIds = [...selectedStageIds, stage.id];
                                newSelectedNames = [...field.value || [], stage.name];
                              }
                              
                              setSelectedStageIds(newSelectedIds);
                              field.onChange(newSelectedNames);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={cn(
                                "w-4 h-4 border rounded flex items-center justify-center",
                                selectedStageIds.includes(stage.id) 
                                  ? "bg-primary border-primary" 
                                  : "border-input"
                              )}>
                                {selectedStageIds.includes(stage.id) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span>{stage.name}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 선택된 단계 표시 */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {field.value.map((name, index) => (
                    <Badge 
                      key={name}
                      variant={index === 0 ? "default" : "secondary"}
                      className="flex items-center gap-1 px-2 py-0.5"
                    >
                      {name}
                      {index === 0 && <span className="ml-1 text-xs">(현재단계)</span>}
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
                  ))}
                </div>
              )}
              <FormDescription>
                첫 번째로 선택한 단계가 현재단계로 설정됩니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 대일정(시작일, 종료일)을 한 행에 배치 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 대일정 (시작일) */}
          <FormField
            control={form.control}
            name="scheduleStart"
            render={({ field }) => {
              const [inputValue, setInputValue] = useState(field.value ? format(field.value, "yyyy-MM-dd") : "");
              
              // field 값이 변경될 때 입력 값 동기화
              useEffect(() => {
                if (field.value) {
                  setInputValue(format(field.value, "yyyy-MM-dd"));
                }
              }, [field.value]);
              
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
              const [inputValue, setInputValue] = useState(field.value ? format(field.value, "yyyy-MM-dd") : "");
              
              // field 값이 변경될 때 입력 값 동기화
              useEffect(() => {
                if (field.value) {
                  setInputValue(format(field.value, "yyyy-MM-dd"));
                }
              }, [field.value]);
              
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
            onClick={handleCancel}
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
  );
} 
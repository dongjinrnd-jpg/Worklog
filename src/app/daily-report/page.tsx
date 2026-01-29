"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// UI 컴포넌트 import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/date-picker";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Check, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 서버 액션 import
import { getManagers, Manager } from "@/app/actions/manager";
import { getProjects, Project } from "@/app/actions/project";
import { createDailyReport } from "@/app/actions/create-daily-report";

// 스키마 정의
const dailyReportSchema = z.object({
  date: z.date({
    required_error: "날짜를 선택해주세요.",
  }),
  managers: z.array(z.string()).min(1, {
    message: "최소 한 명 이상의 담당자를 선택해주세요.",
  }),
  item: z.string().min(1, {
    message: "ITEM을 선택해주세요.",
  }),
  customer: z.string().min(1, {
    message: "고객사를 선택해주세요.",
  }),
  partNo: z.string().optional(),
  stage: z.string().min(1, {
    message: "단계를 선택해주세요.",
  }),
  plan: z.string().optional(),
  performance: z.string().optional(),
  note: z.string().optional(),
});

// 폼 데이터 타입
type DailyReportFormValues = z.infer<typeof dailyReportSchema>;

/**
 * 업무일지 작성 페이지
 * 사용자가 업무일지를 작성할 수 있는 폼을 제공합니다.
 */
export default function DailyReportPage() {
  const router = useRouter();
  
  // 상태 관리
  const [managers, setManagers] = useState<Manager[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [managerSearchQuery, setManagerSearchQuery] = useState("");
  
  // 알림 상태 관리
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState(true);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // React Hook Form 설정
  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: new Date(), // 오늘 날짜로 초기화
      managers: [],
      item: "",
      customer: "",
      partNo: "",
      stage: "",
      plan: "",
      performance: "",
      note: "",
    },
    mode: "onChange",
  });
  
  // 데이터 로드 및 초기화
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 담당자 및 프로젝트 데이터 로드
        const [managersData, projectsData] = await Promise.all([
          getManagers(),
          getProjects()
        ]);
        
        setManagers(managersData);
        setProjects(projectsData);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('초기 데이터 로드 오류:', error);
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };
    
    loadInitialData();
    
    // 페이지 접속 시 항상 초기값으로 설정
    // 1. 날짜를 오늘 날짜로 설정
    form.setValue('date', new Date());
    
    // 2. 모든 폼 필드를 초기값으로 리셋
    form.reset({
      date: new Date(),
      managers: [],
      item: "",
      customer: "",
      partNo: "",
      stage: "",
      plan: "",
      performance: "",
      note: "",
    });
    
    // 3. 상태 변수들도 초기화
    setSelectedManagers([]);
    setSelectedItem("");
    setManagerSearchQuery("");
    

  }, [form]);
  
  // 담당자 선택 시 ITEM 필터링
  useEffect(() => {
    if (!isDataLoaded || selectedManagers.length === 0 || managers.length === 0) return;
    
    // 첫 번째 선택된 담당자 ID
    const firstSelectedManagerId = selectedManagers[0];
    
    // 첫 번째 선택된 담당자 정보
    const firstManager = managers.find(m => m.id === firstSelectedManagerId);
    
    if (!firstManager) return;
    
    // 첫 번째 선택된 담당자 이름
    const managerName = firstManager.name;
    
    console.log("선택된 첫 번째 담당자:", managerName);
    
    // 선택된 담당자가 속한 ITEM 필터링
    const items = projects
      .filter(project => 
        project.managers.some(manager => 
          manager.includes(managerName)
        )
      )
      .map(project => project.item)
      .filter((item, index, self) => self.indexOf(item) === index)
      .sort(); // 정렬 추가
    
    console.log("필터링된 ITEM:", items);
    
    setFilteredItems(items);
    
    // ITEM이 변경되면 PART NO와 단계도 초기화
    if (selectedItem && !items.includes(selectedItem)) {
      form.setValue('item', '');
      form.setValue('partNo', '');
      form.setValue('stage', '');
      setSelectedItem('');
    }
  }, [selectedManagers, isDataLoaded, projects, form, selectedItem, managers]);
  
  // 폼의 item 값 감시
  const watchedItem = form.watch("item");
  
  // ITEM 선택 시 고객사 필터링
  useEffect(() => {
    if (!isDataLoaded || !watchedItem) {
      setFilteredCustomers([]);
      return;
    }
    
    console.log("선택된 ITEM:", watchedItem);
    
    // 선택된 ITEM에 해당하는 고객사 목록 추출
    const customers = projects
      .filter(project => project.item === watchedItem)
      .map(project => project.client)
      .filter((customer, index, self) => customer && self.indexOf(customer) === index)
      .sort();
    
    console.log("필터링된 고객사:", customers);
    setFilteredCustomers(customers);
    
    // 첫 번째 고객사를 자동으로 선택 (약간의 지연을 두어 확실히 적용)
    if (customers.length > 0) {
      const firstCustomer = customers[0];
      setTimeout(() => {
        form.setValue('customer', firstCustomer, { shouldValidate: true, shouldDirty: true });
        console.log("자동 선택된 고객사:", firstCustomer);
      }, 10);
    } else {
      form.setValue('customer', '', { shouldValidate: true });
    }
    
    // PART NO와 단계는 초기화
    form.setValue('partNo', '');
    form.setValue('stage', '');
  }, [watchedItem, isDataLoaded, projects, form]);

  // ITEM 선택 시 PART NO 및 단계 필터링
  useEffect(() => {
    if (!isDataLoaded || !watchedItem) return;
    
    console.log("PART NO/단계 설정용 ITEM:", watchedItem);
    
    // 선택된 ITEM에 해당하는 프로젝트 찾기
    const relatedProjects = projects.filter(project => project.item === watchedItem);
    
    if (relatedProjects.length > 0) {
      // 첫 번째 관련 프로젝트의 PART NO와 단계를 자동으로 설정
      const firstProject = relatedProjects[0];
      form.setValue('partNo', firstProject.partNo);
      form.setValue('stage', firstProject.currentStage);
      
      console.log("자동 설정된 PART NO:", firstProject.partNo);
      console.log("자동 설정된 단계:", firstProject.currentStage);
    } else {
      // 관련 프로젝트가 없는 경우 빈 값으로 설정
      form.setValue('partNo', '');
      form.setValue('stage', '');
      
      console.log("관련 프로젝트 없음 - PART NO와 단계 초기화");
    }
  }, [watchedItem, isDataLoaded, projects, form]);
  

  
  // 폼 제출 핸들러
  const onSubmit = async (data: DailyReportFormValues) => {
    try {
      setIsLoading(true);
      
      // 알림 숨기기 (진행 중)
      setShowNotification(false);
      
      // 담당자 이름만 추출하여 콤마로 구분 (직급 정보 제거, 공백 제거)
      const managersStr = data.managers
        .map(managerId => {
          const manager = managers.find(m => m.id === managerId);
          return manager ? manager.name : '';
        })
        .filter(Boolean)
        .join(',');
      
      // 저장할 데이터 구성
      const reportData = {
        date: format(data.date, 'yyyy-MM-dd'),
        managers: managersStr,
        item: data.item,
        partNo: data.partNo || '',
        customer: data.customer,
        stage: data.stage,
        plan: data.plan || '',
        performance: data.performance || '',
        note: data.note || ''
      };
      
      // 서버 액션을 통해 데이터 저장
      const result = await createDailyReport(reportData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // 저장 성공 처리
      
      // 폼 자동 초기화 (저장 후 새로운 작성을 위해)
      form.reset({
        date: new Date(),
        managers: [],
        item: "",
        customer: "",
        partNo: "",
        stage: "",
        plan: "",
        performance: "",
        note: "",
      });
      
      // 상태 변수들도 초기화
      setSelectedManagers([]);
      setSelectedItem("");
      setManagerSearchQuery("");
      
      // 성공 알림 표시
      setNotificationSuccess(true);
      setNotificationMessage("업무일지가 성공적으로 저장되었습니다. 새로운 작성을 시작할 수 있습니다.");
      setShowNotification(true);
      
      // 5초 후에 알림 숨기기
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
    } catch (error) {
      console.error('저장 오류:', error);
      
      // 실패 알림 표시
      setNotificationSuccess(false);
      setNotificationMessage("업무일지 저장에 실패했습니다.");
      setShowNotification(true);
      
      // 5초 후에 알림 숨기기
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };
  

  
  // 초기화 핸들러
  const handleReset = () => {
    form.reset({
      date: new Date(),
      managers: [],
      item: "",
      partNo: "",
      stage: "",
      plan: "",
      performance: "",
      note: "",
    });
    setSelectedManagers([]);
    setSelectedItem("");
    toast.info('입력 내용이 초기화되었습니다.');
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">업무일지 작성</h2>
      </div>

      {/* 알림 메시지 */}
      {showNotification && (
        <div className={cn(
          "fixed bottom-4 right-4 w-80 p-4 rounded-lg shadow-md border z-50 flex items-start space-x-3 transition-all",
          notificationSuccess ? "bg-white border-gray-200" : "bg-white border-red-200"
        )}>
          {notificationSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium",
              notificationSuccess ? "text-gray-900" : "text-red-800"
            )}>
              {notificationSuccess ? "저장 완료" : "저장 실패"}
            </p>
            <p className="text-sm text-gray-600 mt-1">{notificationMessage}</p>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>업무일지 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 날짜 선택 */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 담당자 다중 선택 */}
              <FormField
                control={form.control}
                name="managers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>담당자 (다중 선택 가능)</FormLabel>
                    <div className="border rounded-md p-2">
                      <div className="mb-2">
                        <Input
                          placeholder="담당자 검색..."
                          className="w-full"
                          value={managerSearchQuery}
                          onChange={(e) => setManagerSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-64 overflow-auto">
                        {managers.length === 0 ? (
                          <div className="py-6 text-center text-sm">
                            담당자 목록을 불러오는 중...
                          </div>
                        ) : managers
                          .filter(manager => 
                            manager.name.toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
                            manager.rank.toLowerCase().includes(managerSearchQuery.toLowerCase())
                          ).length === 0 ? (
                          <div className="py-6 text-center text-sm">
                            검색 결과가 없습니다.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1">
                            {managers
                              .filter(manager => 
                                manager.name.toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
                                manager.rank.toLowerCase().includes(managerSearchQuery.toLowerCase())
                              )
                              .map((manager) => (
                                <div
                                  key={manager.id}
                                  className={cn(
                                    "px-2 py-1.5 text-sm rounded-sm cursor-pointer flex items-center",
                                    selectedManagers.includes(manager.id) ? "bg-accent" : "",
                                    "hover:bg-accent/50"
                                  )}
                                  onClick={() => {
                                    // 선택 상태 토글
                                    const isSelected = selectedManagers.includes(manager.id);
                                    const newSelectedManagers = isSelected
                                      ? selectedManagers.filter((id) => id !== manager.id)
                                      : [...selectedManagers, manager.id];
                                    
                                    setSelectedManagers(newSelectedManagers);
                                    form.setValue("managers", newSelectedManagers, { shouldValidate: true });
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className={cn(
                                      "w-4 h-4 border rounded flex items-center justify-center",
                                      selectedManagers.includes(manager.id) 
                                        ? "bg-primary border-primary" 
                                        : "border-input"
                                    )}>
                                      {selectedManagers.includes(manager.id) && (
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      )}
                                    </div>
                                    <span>{manager.name} ({manager.rank})</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 선택된 담당자 표시 */}
                    {selectedManagers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedManagers.map(id => {
                          const manager = managers.find(m => m.id === id);
                          return manager ? (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {manager.name} ({manager.rank})
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const newSelectedManagers = selectedManagers.filter(
                                    (managerId) => managerId !== id
                                  );
                                  setSelectedManagers(newSelectedManagers);
                                  form.setValue("managers", newSelectedManagers, { shouldValidate: true });
                                }}
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ITEM, PART NO, 단계를 한 줄에 배치 */}
              <div className="grid grid-cols-12 gap-4">
                {/* ITEM 선택 (3칸) */}
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ITEM</FormLabel>
                        <Select
                          disabled={selectedManagers.length === 0 || filteredItems.length === 0}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                selectedManagers.length === 0 
                                  ? "담당자를 먼저 선택하세요" 
                                  : filteredItems.length === 0 
                                    ? "선택한 담당자의 ITEM이 없습니다" 
                                    : "ITEM 선택"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredItems.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 고객사 선택 (3칸) */}
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객사</FormLabel>
                        <Select
                          disabled={!watchedItem || filteredCustomers.length === 0}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !watchedItem 
                                  ? "ITEM을 먼저 선택하세요" 
                                  : filteredCustomers.length === 0 
                                    ? "선택한 ITEM의 고객사가 없습니다" 
                                    : "고객사 선택"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCustomers.map((customer) => (
                              <SelectItem key={customer} value={customer}>
                                {customer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* PART NO (읽기 전용, 3칸) */}
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="partNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PART NO (선택)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            disabled
                            placeholder="ITEM 선택 시 자동으로 표시됩니다"
                            className="bg-muted"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 단계 (읽기 전용, 3칸) */}
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>단계</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled
                            placeholder="ITEM 선택 시 자동으로 표시됩니다"
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 계획 입력 */}
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>계획</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="업무 계획을 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 실적 입력 */}
              <FormField
                control={form.control}
                name="performance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>실적</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="업무 실적을 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 비고 입력 */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비고</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="추가 내용을 입력하세요"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 버튼 그룹 */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  초기화
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "저장 중..." : "저장하기"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
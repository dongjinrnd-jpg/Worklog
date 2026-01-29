export interface ProjectOriginal {
  id: string;
  no: string | number;
  status: string;
  customer?: string;
  client?: string;  // 고객사 대체 필드
  affiliation?: string;
  model?: string;
  item: string;
  partNo?: string;
  managers?: string[];
  developmentStage?: string | string[];  // 개발업무단계 (다양한 형태로 제공됨)
  developmentStages?: string[];
  currentStage?: string;
  schedule?: string | { start?: string; end?: string } | [string, string];
  progressStatus?: string;  // 업무진행사항 필드 (다양한 필드명)
  issues?: string;
  issueResolved?: boolean;
  issueResolutionDetails?: string; // 애로사항 개선내용
  issueResolvedDesc?: string;
  notes?: string;
} 
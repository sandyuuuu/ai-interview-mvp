export type JobDirection =
  | "产品体验设计"
  | "交互设计"
  | "UX设计"
  | "B端产品设计"
  | "云产品设计"
  | "商家侧产品设计"
  | "电商体验设计";

export type CompanyType = "互联网大厂" | "外企" | "创业公司" | "传统企业" | "国企";

export type InterviewRound = "一面" | "二面" | "三面" | "HR面" | "总监面";

export type Difficulty = "初级" | "中级" | "高级";

export type QuestionType =
  | "自我介绍"
  | "项目经历"
  | "设计方法"
  | "业务理解"
  | "用户研究"
  | "团队协作"
  | "职业规划"
  | "开放性问题"
  | "技术问题"
  | "案例分析";

export interface InterviewConfig {
  jobDirection: JobDirection;
  companyType: CompanyType;
  round: InterviewRound;
  difficulty: Difficulty;
  enableFollowUp: boolean;
}

export interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  type?: "question" | "feedback" | "followUp" | "answer";
  timestamp: number;
}

export interface AnswerAnalysis {
  score: number;
  summary: string;
  problems: string[];
  suggestions: string[];
  recommendedStructure: string;
  optimizedAnswer: string;
  followUpQuestions: string[];
}

export interface InterviewRecord {
  id: string;
  config: InterviewConfig;
  messages: Message[];
  analyses: Record<string, AnswerAnalysis>;
  startTime: number;
  endTime?: number;
  overallReview?: InterviewReview;
}

export interface InterviewReview {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  preparationAdvice: string;
}

export interface TranscriptAnalysis {
  question: string;
  answer: string;
  analysis: AnswerAnalysis;
}

export interface ReviewNote {
  id: string;
  title: string;
  company?: string;
  position?: string;
  round?: InterviewRound;
  questionType?: QuestionType;
  tags: string[];
  content: string;
  analysis?: AnswerAnalysis;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface QuestionBankItem {
  id: string;
  title: string;
  type: QuestionType;
  jobDirections: JobDirection[];
  recommendedApproach: string;
  myBestAnswer?: string;
  aiOptimizedAnswer?: string;
  relatedProjectTags: string[];
  frequency: number;
  difficulty: Difficulty;
}

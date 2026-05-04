"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, Filter, Star, ChevronRight, Copy } from "lucide-react";
import { QuestionBankItem, JobDirection, QuestionType, Difficulty } from "@/lib/types";
import { storage } from "@/lib/storage";

const mockQuestions: QuestionBankItem[] = [
  {
    id: "1",
    title: "请介绍一个你主导的产品体验优化项目",
    type: "项目经历",
    jobDirections: ["产品体验设计", "UX设计", "B端产品设计"],
    recommendedApproach: "使用 STAR 法则：背景-任务-行动-结果，重点突出设计决策和业务价值",
    myBestAnswer: "我之前负责一个电商 APP 首页改版，核心目标是提升用户转化率...",
    aiOptimizedAnswer: "（AI 优化版本）在我的这个项目中，我主要负责首页用户体验优化...",
    relatedProjectTags: ["电商", "改版", "转化率"],
    frequency: 95,
    difficulty: "中级",
  },
  {
    id: "2",
    title: "如何平衡用户体验和商业目标之间的冲突？",
    type: "设计方法",
    jobDirections: ["产品体验设计", "交互设计", "UX设计"],
    recommendedApproach: "从用户价值、商业价值、技术可行性三个维度分析，展示权衡过程",
    myBestAnswer: "我会通过用户研究和数据验证，找到既能满足用户需求又能实现商业目标的设计点...",
    aiOptimizedAnswer: "（AI 优化版本）平衡用户体验和商业目标的核心是找到双赢点...",
    relatedProjectTags: ["设计决策", "用户研究", "数据驱动"],
    frequency: 88,
    difficulty: "高级",
  },
  {
    id: "3",
    title: "你如何开展用户研究并驱动设计决策？",
    type: "用户研究",
    jobDirections: ["UX设计", "产品体验设计", "交互设计"],
    recommendedApproach: "展示完整的研究闭环：定义问题-选择方法-执行研究-分析洞察-设计落地",
    myBestAnswer: "我会根据项目目标选择合适的研究方法，比如用户访谈、可用性测试...",
    aiOptimizedAnswer: "（AI 优化版本）在我的项目中，用户研究遵循“发现问题-验证假设-指导设计”的闭环...",
    relatedProjectTags: ["用户访谈", "可用性测试", "设计验证"],
    frequency: 82,
    difficulty: "中级",
  },
  {
    id: "4",
    title: "B 端产品和 C 端产品在设计上有哪些本质区别？",
    type: "业务理解",
    jobDirections: ["B端产品设计", "云产品设计", "商家侧产品设计"],
    recommendedApproach: "从用户角色、使用场景、决策逻辑、成功指标等方面对比",
    myBestAnswer: "B 端用户更关注效率和稳定性，C 端用户更关注体验和情感...",
    aiOptimizedAnswer: "（AI 优化版本）B 端与 C 端设计的本质区别在于用户性质和使用目标不同...",
    relatedProjectTags: ["B端设计", "企业级", "产品策略"],
    frequency: 76,
    difficulty: "中级",
  },
  {
    id: "5",
    title: "如何向没有设计背景的团队成员证明设计价值？",
    type: "团队协作",
    jobDirections: ["产品体验设计", "UX设计", "交互设计"],
    recommendedApproach: "用数据和业务结果说话，展示设计对核心指标的影响",
    myBestAnswer: "我会通过 A/B 测试数据、用户反馈、业务指标变化来展示设计价值...",
    aiOptimizedAnswer: "（AI 优化版本）证明设计价值的关键是建立可量化的衡量体系...",
    relatedProjectTags: ["设计价值", "A/B测试", "团队协作"],
    frequency: 70,
    difficulty: "初级",
  },
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<JobDirection | "all">("all");
  const [selectedType, setSelectedType] = useState<QuestionType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [showAIAnswer, setShowAIAnswer] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(mockQuestions);
    // 实际可以从 storage.getQuestions() 加载用户保存的问题
  }, []);

  const jobDirections: JobDirection[] = [
    "产品体验设计",
    "交互设计",
    "UX设计",
    "B端产品设计",
    "云产品设计",
    "商家侧产品设计",
    "电商体验设计",
  ];

  const questionTypes: QuestionType[] = [
    "自我介绍",
    "项目经历",
    "设计方法",
    "业务理解",
    "用户研究",
    "团队协作",
    "职业规划",
    "开放性问题",
    "技术问题",
    "案例分析",
  ];

  const difficulties: Difficulty[] = ["初级", "中级", "高级"];

  const filteredQuestions = questions.filter((q) => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedDirection !== "all" && !q.jobDirections.includes(selectedDirection)) return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const saveToMyAnswers = (questionId: string, answer: string) => {
    alert("已保存到我的最佳回答（TODO: 实际接入存储）");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">面试题库</h1>
        <p className="text-sm text-slate-500 mt-0.5">高频面试问题与推荐回答思路，沉淀你的最佳答案</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="搜索问题"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value as JobDirection | "all")}
            >
              <option value="all">全部岗位</option>
              {jobDirections.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as QuestionType | "all")}
            >
              <option value="all">全部类型</option>
              {questionTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | "all")}
            >
              <option value="all">全部难度</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-slate-800">{q.title}</h3>
                  <span className="badge bg-primary-50 text-primary-700">{q.type}</span>
                  <span className={`badge ${q.difficulty === "初级" ? "bg-green-50 text-green-700" : q.difficulty === "中级" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                    {q.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {q.frequency}% 高频
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {q.jobDirections.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {q.relatedProjectTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-accent-50 text-xs text-accent-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => saveToMyAnswers(q.id, q.myBestAnswer || "")}
                className="btn-secondary text-xs gap-1 ml-2"
              >
                <Star className="w-3.5 h-3.5" />
                收藏
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-700 mb-1">推荐回答思路</p>
              <p className="text-sm text-slate-700">{q.recommendedApproach}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-slate-700">我的最佳回答</p>
                  <button
                    onClick={() => saveToMyAnswers(q.id, q.myBestAnswer || "")}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" />
                    复制
                  </button>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200 text-sm text-slate-700">
                  {q.myBestAnswer}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-slate-700">AI 优化版本</p>
                  <button
                    onClick={() => setShowAIAnswer(showAIAnswer === q.id ? null : q.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform ${showAIAnswer === q.id ? "rotate-90" : ""}`} />
                    {showAIAnswer === q.id ? "收起" : "展开"}
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-accent-50 rounded-lg p-3 border border-green-100 text-sm text-green-900">
                  {showAIAnswer === q.id ? q.aiOptimizedAnswer : q.aiOptimizedAnswer?.slice(0, 120) + "..."}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 text-center text-sm text-slate-500">
        <p>
          🚧 题库功能为 MVP 版本，后续将支持：
        </p>
        <p className="text-xs mt-1">
          自定义问题、多版本答案对比、智能推荐相似问题、根据面试反馈动态调整推荐
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Settings,
  Loader2,
  Save,
  Flag,
  ChevronRight,
  RotateCcw,
  Sparkles,
  MessageCircle,
  User,
  Bot,
  BookOpen,
  Mic,
  MicOff,
} from "lucide-react";
import {
  InterviewConfig,
  JobDirection,
  CompanyType,
  InterviewRound,
  Difficulty,
  Message,
  AnswerAnalysis,
  InterviewRecord,
} from "@/lib/types";
import { interviewAI } from "@/lib/ai/interviewAI";
import { storage } from "@/lib/storage";
import { generateId, formatTime } from "@/lib/utils";

const jobDirections: JobDirection[] = [
  "产品体验设计",
  "交互设计",
  "UX设计",
  "B端产品设计",
  "云产品设计",
  "商家侧产品设计",
  "电商体验设计",
];

const companyTypes: CompanyType[] = ["互联网大厂", "外企", "创业公司", "传统企业", "国企"];
const rounds: InterviewRound[] = ["一面", "二面", "三面", "HR面", "总监面"];
const difficulties: Difficulty[] = ["初级", "中级", "高级"];

export default function InterviewPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<InterviewConfig>({
    jobDirection: "产品体验设计",
    companyType: "互联网大厂",
    round: "一面",
    difficulty: "中级",
    enableFollowUp: true,
  });

  const [record, setRecord] = useState<InterviewRecord | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnswerAnalysis | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [overallReview, setOverallReview] = useState<InterviewRecord["overallReview"]>();
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setRecordingSupported(true);
        const recognition = new SpeechRecognition();
        recognition.lang = "zh-CN";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          setInput((prev) => {
            const base = prev.replace(/\[录音中\.\.\.\]/g, "").trim();
            if (finalTranscript) {
              return base ? base + finalTranscript : finalTranscript;
            }
            return base ? base + "[录音中...]" : "[录音中...]";
          });
        };
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };
        recognition.onend = () => {
          setIsRecording(false);
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    const newRecord: InterviewRecord = {
      id: generateId(),
      config,
      messages: [],
      analyses: {},
      startTime: Date.now(),
    };
    setRecord(newRecord);
    setMessages([]);
    setCurrentAnalysis(null);
    setShowReview(false);
    setOverallReview(undefined);
    setSavedNoteId(null);

    setLoading(true);
    try {
      const question = await interviewAI.generateInterviewQuestion(config, []);
      const aiMessage: Message = {
        id: generateId(),
        role: "ai",
        content: question,
        type: "question",
        timestamp: Date.now(),
      };
      newRecord.messages = [aiMessage];
      setMessages([aiMessage]);
      setRecord(newRecord);
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!input.trim() || !record || loading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      type: "answer",
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const lastQuestion = messages.filter((m) => m.role === "ai").pop()?.content || "";
      const analysis = await interviewAI.analyzeAnswer(lastQuestion, input);
      setCurrentAnalysis(analysis);

      const updatedRecord = { ...record, messages: updatedMessages };
      updatedRecord.analyses[userMessage.id] = analysis;
      setRecord(updatedRecord);

      // Feedback message
      const feedbackMsg: Message = {
        id: generateId(),
        role: "ai",
        content: `【点评】${analysis.summary}\n\n得分：${analysis.score}/100`,
        type: "feedback",
        timestamp: Date.now(),
      };
      const afterFeedback = [...updatedMessages, feedbackMsg];
      setMessages(afterFeedback);
      updatedRecord.messages = afterFeedback;

      // Follow up or next question
      let nextContent = "";
      if (config.enableFollowUp) {
        nextContent = await interviewAI.generateFollowUpQuestion(lastQuestion, input, analysis);
      } else {
        const history = messages.filter((m) => m.role === "ai" && m.type === "question").map((m) => m.content);
        nextContent = await interviewAI.generateInterviewQuestion(config, history);
      }

      const nextMsg: Message = {
        id: generateId(),
        role: "ai",
        content: nextContent,
        type: config.enableFollowUp ? "followUp" : "question",
        timestamp: Date.now(),
      };
      const finalMessages = [...afterFeedback, nextMsg];
      setMessages(finalMessages);
      updatedRecord.messages = finalMessages;
      setRecord(updatedRecord);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!record) return;
    setLoading(true);
    try {
      const history: { question: string; answer: string; analysis: AnswerAnalysis }[] = [];
      for (let i = 0; i < record.messages.length; i++) {
        const m = record.messages[i];
        if (m.role === "user") {
          const question = record.messages.slice(0, i).filter((x) => x.role === "ai").pop()?.content || "";
          const analysis = record.analyses[m.id];
          if (analysis) {
            history.push({ question, answer: m.content, analysis });
          }
        }
      }

      const review = await interviewAI.generateInterviewReview(history);
      setOverallReview(review);

      const updatedRecord = {
        ...record,
        endTime: Date.now(),
        overallReview: review,
      };
      setRecord(updatedRecord);
      storage.saveInterview(updatedRecord);
      setShowReview(true);
    } finally {
      setLoading(false);
    }
  };

  const saveToNotes = () => {
    if (!currentAnalysis || !record) return;
    const lastQuestion = messages.filter((m) => m.role === "ai").pop()?.content || "";
    const lastAnswer = messages.filter((m) => m.role === "user").pop()?.content || "";

    const note = {
      id: generateId(),
      title: lastQuestion.slice(0, 40) + (lastQuestion.length > 40 ? "..." : ""),
      company: undefined,
      position: record.config.jobDirection,
      round: record.config.round,
      questionType: undefined,
      tags: [record.config.jobDirection, record.config.companyType],
      content: `问题：${lastQuestion}\n\n我的回答：\n${lastAnswer}\n\n优化建议：\n${currentAnalysis.suggestions.join("\n")}\n\n优化版本：\n${currentAnalysis.optimizedAnswer}`,
      analysis: currentAnalysis,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storage.saveNote(note);
    setSavedNoteId(note.id);
  };

  const started = messages.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI 模拟面试</h1>
          <p className="text-sm text-slate-500 mt-0.5">选择岗位配置，与 AI 进行真实面试模拟</p>
        </div>
        {started && (
          <div className="flex gap-2">
            <button onClick={endInterview} disabled={loading} className="btn-secondary gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50">
              <Flag className="w-4 h-4" />
              结束面试
            </button>
          </div>
        )}
      </div>

      {!started ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="card p-8 max-w-lg w-full">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-800">面试配置</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">岗位方向</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={config.jobDirection}
                  onChange={(e) => setConfig({ ...config, jobDirection: e.target.value as JobDirection })}
                >
                  {jobDirections.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">公司类型</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={config.companyType}
                    onChange={(e) => setConfig({ ...config, companyType: e.target.value as CompanyType })}
                  >
                    {companyTypes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">面试轮次</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={config.round}
                    onChange={(e) => setConfig({ ...config, round: e.target.value as InterviewRound })}
                  >
                    {rounds.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">面试难度</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty })}
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      checked={config.enableFollowUp}
                      onChange={(e) => setConfig({ ...config, enableFollowUp: e.target.checked })}
                    />
                    <span className="text-sm text-slate-600">开启追问模式</span>
                  </label>
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={loading}
                className="w-full btn-primary py-2.5 mt-2 gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "AI 正在准备问题..." : "开始模拟面试"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Left: Config summary */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">当前配置</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">岗位</span>
                  <span className="font-medium text-slate-700">{config.jobDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">公司</span>
                  <span className="font-medium text-slate-700">{config.companyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">轮次</span>
                  <span className="font-medium text-slate-700">{config.round}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">难度</span>
                  <span className="font-medium text-slate-700">{config.difficulty}</span>
                </div>
              </div>
              <button onClick={startInterview} className="w-full btn-secondary text-xs py-1.5 gap-1">
                <RotateCcw className="w-3 h-3" />
                重新开始
              </button>
            </div>
          </div>

          {/* Middle: Chat */}
          <div className="lg:col-span-6 flex flex-col min-h-0">
            <div className="card flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === "ai"
                          ? "bg-gradient-to-br from-primary-500 to-accent-500"
                          : "bg-slate-100"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "ai"
                          ? msg.type === "feedback"
                            ? "bg-amber-50 text-amber-900 border border-amber-100"
                            : "bg-slate-50 text-slate-800 border border-slate-100"
                          : "bg-primary-600 text-white"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-200" : "text-slate-400"}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-500">
                      AI 正在思考中...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                    rows={2}
                    placeholder={isRecording ? "正在聆听，请说话..." : "输入你的回答..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendAnswer();
                      }
                    }}
                  />
                  {recordingSupported && (
                    <button
                      onClick={toggleRecording}
                      disabled={loading}
                      className={`px-3 self-end rounded-lg flex items-center justify-center transition-all ${
                        isRecording
                          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 animate-pulse"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                      title={isRecording ? "停止录音" : "语音输入"}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={sendAnswer}
                    disabled={loading || !input.trim()}
                    className="btn-primary px-3 self-end"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    正在录音，点击麦克风按钮停止
                  </div>
                )}
                {!recordingSupported && (
                  <div className="text-xs text-slate-400 mt-2">
                    当前浏览器不支持语音输入，请使用 Chrome / Edge 浏览器
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Analysis */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto scrollbar-thin">
            {currentAnalysis ? (
              <>
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">当前回答评分</h3>
                    <div
                      className={`text-2xl font-bold ${
                        currentAnalysis.score >= 80
                          ? "text-green-600"
                          : currentAnalysis.score >= 60
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {currentAnalysis.score}
                      <span className="text-sm text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{currentAnalysis.summary}</p>
                </div>

                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">主要问题</h3>
                  <ul className="space-y-1.5">
                    {currentAnalysis.problems.map((p, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">优化建议</h3>
                  <ul className="space-y-1.5">
                    {currentAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-accent-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">推荐回答结构</h3>
                  <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    {currentAnalysis.recommendedStructure}
                  </div>
                </div>

                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">可能追问</h3>
                  <ul className="space-y-1.5">
                    {currentAnalysis.followUpQuestions.slice(0, 3).map((q, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <MessageCircle className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={saveToNotes}
                  disabled={!!savedNoteId}
                  className="w-full btn-secondary gap-1.5 text-primary-600 border-primary-200 hover:bg-primary-50"
                >
                  {savedNoteId ? (
                    <>已保存到笔记</>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      保存到复盘笔记
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="card p-8 text-center text-slate-400 text-sm">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                提交回答后，AI 将在这里展示详细分析和优化建议
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && overallReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">面试复盘报告</h2>
                <div className="text-3xl font-bold text-primary-600">{overallReview.overallScore}</div>
              </div>
              <p className="text-sm text-slate-500 mt-1">{overallReview.summary}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">优势</h3>
                <ul className="space-y-1">
                  {overallReview.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <ChevronRight className="w-4 h-4 text-green-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">待改进</h3>
                <ul className="space-y-1">
                  {overallReview.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">提升建议</h3>
                <ul className="space-y-1">
                  {overallReview.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <ChevronRight className="w-4 h-4 text-accent-500 shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">后续准备建议</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{overallReview.preparationAdvice}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setShowReview(false);
                  router.push("/notes");
                }}
                className="btn-primary gap-2"
              >
                <BookOpen className="w-4 h-4" />
                查看复盘笔记
              </button>
              <button
                onClick={() => {
                  setShowReview(false);
                  startInterview();
                }}
                className="btn-secondary gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                再练一次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

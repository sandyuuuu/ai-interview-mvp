"use client";

import { useState } from "react";
import { Loader2, Upload, Mic, Sparkles, ChevronRight, Save } from "lucide-react";
import { TranscriptAnalysis, ReviewNote } from "@/lib/types";
import { interviewAI } from "@/lib/ai/interviewAI";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";

export default function ReviewPage() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<TranscriptAnalysis[] | null>(null);
  const [audioUploaded, setAudioUploaded] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await interviewAI.analyzeTranscript(text);
      setResults(res);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAudioUpload = () => {
    // TODO: 接入真实语音转文字 API
    setAudioUploaded(true);
    setTranscribing(true);
    setTimeout(() => {
      setTranscribing(false);
      setText(
        "面试官：请介绍一个你最有成就感的设计项目\n候选人：我之前做过一个电商APP的改版项目\n面试官：这个项目中你最大的挑战是什么？\n候选人：主要是平衡商业目标和用户体验"
      );
    }, 2000);
  };

  const saveAnalysis = (item: TranscriptAnalysis) => {
    const note: ReviewNote = {
      id: generateId(),
      title: item.question.slice(0, 40) + (item.question.length > 40 ? "..." : ""),
      tags: ["面试复盘"],
      content: `问题：${item.question}\n\n我的回答：\n${item.answer}\n\n分析：\n${item.analysis.summary}\n\n优化版本：\n${item.analysis.optimizedAnswer}`,
      analysis: item.analysis,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storage.saveNote(note);
    alert("已保存到复盘笔记");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">面试记录复盘</h1>
        <p className="text-sm text-slate-500 mt-0.5">粘贴面试文字记录或上传音频，AI 帮你逐条分析</p>
      </div>

      {!results ? (
        <div className="card p-6">
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAudioUpload}
              className="flex-1 flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">上传音频文件</span>
              <span className="text-xs text-slate-400">TODO: 语音转文字接口预留</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-accent-300 hover:bg-accent-50/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-accent-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">上传转写文本</span>
              <span className="text-xs text-slate-400">支持 .txt / .md / .docx</span>
            </button>
          </div>

          {audioUploaded && transcribing && (
            <div className="flex items-center gap-2 text-sm text-primary-600 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在转写音频...（Mock 状态）
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">或直接粘贴面试记录</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              rows={10}
              placeholder="面试官：请介绍一个项目\n候选人：我之前做过..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || analyzing}
            className="btn-primary gap-2"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? "AI 正在分析..." : "开始 AI 复盘"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">复盘结果</h2>
            <button onClick={() => setResults(null)} className="btn-secondary text-xs">
              重新导入
            </button>
          </div>

          {results.map((item, idx) => (
            <div key={idx} className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-primary-50 text-primary-700">问题 {idx + 1}</span>
                    <span className={`badge ${item.analysis.score >= 80 ? "bg-green-50 text-green-700" : item.analysis.score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                      {item.analysis.score} 分
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1">{item.question}</p>
                </div>
                <button onClick={() => saveAnalysis(item)} className="btn-secondary text-xs gap-1 ml-3">
                  <Save className="w-3.5 h-3.5" />
                  保存
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">我的回答</p>
                <p className="text-sm text-slate-700">{item.answer}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-700 mb-1.5">主要问题</p>
                <ul className="space-y-1">
                  {item.analysis.problems.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600">
                      <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-700 mb-1.5">优化建议</p>
                <ul className="space-y-1">
                  {item.analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600">
                      <ChevronRight className="w-3.5 h-3.5 text-accent-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-700 mb-1">优化后的示范回答</p>
                <p className="text-sm text-green-900 whitespace-pre-wrap">{item.analysis.optimizedAnswer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

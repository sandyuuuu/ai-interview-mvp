"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  FileText,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Star,
} from "lucide-react";
import { InterviewRecord, ReviewNote } from "@/lib/types";
import { storage } from "@/lib/storage";
import { formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [notes, setNotes] = useState<ReviewNote[]>([]);

  useEffect(() => {
    setInterviews(storage.getInterviews().slice(0, 5));
    setNotes(storage.getNotes().slice(0, 5));
  }, []);

  const stats = [
    {
      label: "模拟面试",
      value: interviews.length,
      icon: MessageSquare,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "复盘笔记",
      value: notes.length,
      icon: BookOpen,
      color: "text-accent-600",
      bg: "bg-accent-50",
    },
    {
      label: "待优化",
      value: notes.filter((n) => n.analysis && n.analysis.score < 75).length,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "已收藏",
      value: notes.filter((n) => n.isFavorite).length,
      icon: Star,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-accent-600 border-0 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">欢迎回来，开始今天的面试训练</h1>
            <p className="text-primary-100 text-sm max-w-lg">
              通过 AI 模拟面试和结构化复盘，系统性地提升面试表达能力。坚持训练，拿下心仪 Offer。
            </p>
            <div className="flex gap-3 mt-5">
              <Link href="/interview" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-primary-700 font-medium text-sm hover:bg-primary-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                开始模拟面试
              </Link>
              <Link href="/review" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors">
                <FileText className="w-4 h-4" />
                导入面试记录
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <TrendingUp className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">最近模拟面试</h3>
            <Link href="/interview" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {interviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              暂无模拟面试记录，快去开始第一次训练吧
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{item.config.jobDirection}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.config.companyType} · {item.config.round}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.overallReview && (
                      <div className="text-sm font-bold text-primary-600">{item.overallReview.overallScore}分</div>
                    )}
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.startTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">最近复盘笔记</h3>
            <Link href="/notes" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              暂无复盘笔记，完成模拟面试或导入记录后可保存笔记
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.company} {item.position && `· ${item.position}`}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.analysis && (
                      <div className={cn("text-xs font-bold", item.analysis.score >= 80 ? "text-green-600" : "text-amber-600")}>
                        {item.analysis.score}分
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">{formatTime(item.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

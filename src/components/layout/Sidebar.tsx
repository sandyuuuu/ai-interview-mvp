"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BookOpen,
  Library,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/interview", label: "模拟面试", icon: MessageSquare },
  { href: "/review", label: "面试复盘", icon: FileText },
  { href: "/notes", label: "复盘笔记", icon: BookOpen },
  { href: "/question-bank", label: "面试题库", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">
            AI 面试助手
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", active ? "text-primary-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        <div className="rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 p-3">
          <p className="text-xs font-medium text-primary-700 mb-1">当前 AI 模式</p>
          <p className="text-xs text-slate-500">Mock AI Provider（模拟数据）</p>
          <p className="text-[10px] text-slate-400 mt-1">TODO: 接入腾讯混元 / CodeBuddy 模型</p>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-slate-500">
          祝你面试顺利，拿下心仪 Offer
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">求职者</span>
        </button>
      </div>
    </header>
  );
}
